/* MPNet — ephemeral PeerJS sessions. window.MPNet.
   PeerJS-correct model: every session gets FRESH PeerJS ids from the cloud.
   - Host: `new Peer()` (no custom id). The assigned `peer.id` IS the session.
     Share it via `#host=<peerId>`. `peer.destroy()` on stop; next host gets
     a new id. Nothing static is ever re-claimed, so cloud expiry can't strand
     joiners on a ghost id.
   - Guest: `new Peer()` (fresh), `peer.connect(hostPeerId)`. Direct
     connection only. `peer.destroy()` on leave.
   - Per-world namespaces: the host picks one of its worlds (a short local id
     like "KX7Q2M9A" — save folders + Hub validation only, never a PeerJS
     id). Guests adopt the host's world id from the welcome handshake, so
     both sides share one world. Discovery is always the ephemeral host
     peer id in the invite link.
   - Star topology: every guest talks to the host over one reliable
     DataConnection (rpc + relay). No guest-guest mesh, no signaling.
   Surface for multiplayer.js: ensureHost/ensureJoin facades with
     { rpc: {method:(json)=>Promise<json>}, send:(json)=>bool,
       addEventListener("message"|"close"), opened:Promise, hostPeerId? }.
   Hub (directory + RPCs + validated relay) lives in mp_host.js. */
window.MPNet = (() => {
  const PEER_SRV_KEY = "emberhold-peer-server-v1"; // optional {host,port,path,secure,key}
  const WORLD_ID = "MPHOST"; // default Hub/world namespace (NOT secret, NOT discovery)
  // Per-world namespaces: the host picks one of its worlds to host (a short
  // local id like "KX7Q2M9A" — folders + Hub validation only, never a PeerJS
  // id). Discovery stays the ephemeral host peer id in the invite link.
  const WORLD_RE = /^[A-Z0-9]{6,16}$/;
  function normWorldId(id) {
    const s = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
    return WORLD_RE.test(s) ? s : "";
  }
  const GUEST_WORLD_ID = "MPJOIN"; // transient guest cache namespace (wiped per join)
  const RPC_TIMEOUT_MS = 20000, CONN_TIMEOUT_MS = 20000;

  function iceServers() {
    try {
      const f = window.MP && window.MP.getIceServers;
      if (typeof f === "function") { const s = f(); if (Array.isArray(s) && s.length) return s; }
    } catch (e) {}
    return [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];
  }
  function peerOptions() {
    const o = { debug: 0, config: { iceServers: iceServers() } };
    try {
      const c = JSON.parse(localStorage.getItem(PEER_SRV_KEY) || "null");
      if (c && c.host) {
        o.host = String(c.host); o.port = +c.port || 9000; o.path = String(c.path || "/");
        o.secure = c.secure !== false; if (c.key) o.key = String(c.key);
      }
    } catch (e) {}
    return o;
  }
  function getPeerServer() {
    try { return JSON.parse(localStorage.getItem(PEER_SRV_KEY) || "null") || null; } catch (e) { return null; }
  }
  function setPeerServer(cfg) {
    try {
      if (!cfg) localStorage.removeItem(PEER_SRV_KEY);
      else localStorage.setItem(PEER_SRV_KEY, JSON.stringify(cfg));
    } catch (e) {}
  }
  function withTimeout(p, ms, msg) {
    return new Promise((resolve, reject) => {
      let done = false;
      const to = setTimeout(() => { if (!done) { done = true; reject(new Error(msg || "timed out")); } }, ms);
      Promise.resolve(p).then(
        (v) => { if (!done) { done = true; clearTimeout(to); resolve(v); } },
        (e) => { if (!done) { done = true; clearTimeout(to); reject(e); } }
      );
    });
  }
  function isValidHash(h) { return /^[0-9a-f]{16,64}$/i.test(String(h || "")); }
  // PeerJS cloud ids: uuid-like with dashes (e.g. "3b2...", 36 chars) or
  // short custom alphanumerics. Accept what the cloud actually hands out.
  function isValidHostPeerId(id) {
    const s = String(id || "").trim();
    return /^[A-Za-z0-9_-]{4,80}$/.test(s);
  }
  // Pull a host peer id out of anything a player pastes: a bare id, or a
  // full invite link (possibly doubled by chat apps). Takes the LAST #host=
  // value so doubled links still resolve. Returns "" when nothing valid.
  function parseHostInvite(input) {
    const s = String(input || "").trim();
    if (!s) return "";
    try {
      const re = /#host=([A-Za-z0-9_-]{4,80})/g;
      let m, last = "";
      while ((m = re.exec(s)) !== null) last = m[1];
      if (last) return last;
    } catch (e) {}
    const bare = s.split(/\s+/)[0] || "";
    if (isValidHostPeerId(bare) && !/https?:\/\//i.test(bare) && bare.indexOf("#") < 0 && bare.indexOf("=") < 0) return bare;
    return "";
  }
  function inviteLink(hostPeerId) {
    hostPeerId = String(hostPeerId || "").trim();
    try {
      const g = window.generatorName || "";
      if (g) return "https://perchance.org/" + g + "#host=" + encodeURIComponent(hostPeerId);
    } catch (e) {}
    try { return String(location.href).split("#")[0] + "#host=" + encodeURIComponent(hostPeerId); }
    catch (e) { return "#host=" + hostPeerId; }
  }

  // ---------- fast lane (true UDP-like: unordered + unreliable) ----------
  // PeerJS 1.5 only exposes {ordered}, never maxRetransmits — so a "fast"
  // lane over PeerJS would still retransmit (just unordered). Instead the
  // fast lane is a RAW RTCPeerConnection DataChannel
  // ({ordered:false, maxRetransmits:0}) with in-band signaling carried over
  // the reliable PeerJS conn (fast-offer/answer/ice). Either side can enable
  // it; continuous state rides it when open, everything important stays on
  // the reliable conn (silent fallback, never a failure mode).
  const FAST_KEY = "emberhold-mp-fast-v1";
  function fastOn() {
    try { const v = localStorage.getItem(FAST_KEY); return v == null ? true : v !== "0"; }
    catch (e) { return true; }
  }
  function setFastOn(v) { try { localStorage.setItem(FAST_KEY, v ? "1" : "0"); } catch (e) {} }
  // Loss-tolerant continuous state: safe to drop (next tick repairs).
  // Damage/chat/membership always stay reliable.
  const HOT_T = new Set(["pos", "snap", "snapP", "ents", "dEnts", "tile", "tileReq", "tileRes", "poi", "poiReq", "poiRes", "loot", "dPoi", "dLoot", "act"]);
  const hashRec = new Map(); // guest hash(lower) -> rec (for fast fanout)
  function closeFastRec(rec) {
    try { if (rec) { rec.fastOk = false; } } catch (e) {}
    try { if (rec && rec.fastDc) { try { rec.fastDc.close(); } catch (e) {} rec.fastDc = null; } } catch (e) {}
    try { if (rec && rec.fastPc) { try { rec.fastPc.close(); } catch (e) {} rec.fastPc = null; } } catch (e) {}
  }
  function handleFastAnswer(rec, d) {
    try {
      if (!rec || !rec.fastPc || !d || !d.sdp) return;
      rec.fastPc.setRemoteDescription({ type: "answer", sdp: String(d.sdp) }).catch(function () {});
    } catch (e) {}
  }
  function handleFastIce(rec, d) {
    try {
      if (!rec || !rec.fastPc || !d || !d.candidate) return;
      rec.fastPc.addIceCandidate(d.candidate).catch(function () {});
    } catch (e) {}
  }
  function dialFast(rec) {
    try {
      if (!rec || !rec.conn) return;
      closeFastRec(rec);
      let pc = null;
      try { pc = new RTCPeerConnection({ iceServers: iceServers() }); } catch (e) { return; }
      rec.fastPc = pc;
      let dc = null;
      try { dc = pc.createDataChannel("fast", { ordered: false, maxRetransmits: 0 }); } catch (e) { try { pc.close(); } catch (e2) {} rec.fastPc = null; return; }
      rec.fastDc = dc;
      dc.onopen = function () {};
      dc.onclose = function () { try { if (rec.fastDc === dc) { rec.fastDc = null; rec.fastOk = false; } } catch (e) {} };
      dc.onerror = function () {};
      dc.onmessage = function (ev) {
        try {
          let m = null;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          if (m && m.kind === "push" && m.msg) { try { window.MPHost.Hub.handleRelay(m.msg, rec.hash || ""); } catch (e) {} }
        } catch (e) {}
      };
      pc.onicecandidate = function (ev) {
        try { if (ev && ev.candidate) rec.conn.send({ kind: "fast-ice", candidate: ev.candidate }); } catch (e) {}
      };
      pc.onconnectionstatechange = function () {
        try { if (pc.connectionState === "failed" && rec.fastPc === pc) closeFastRec(rec); } catch (e) {}
      };
      pc.createOffer().then(function (offer) {
        return pc.setLocalDescription(offer).then(function () {
          try { rec.conn.send({ kind: "fast-offer", sdp: pc.localDescription ? pc.localDescription.sdp : offer.sdp }); } catch (e) {}
          setTimeout(function () {
            try { if (!rec.fastOk && rec.fastPc === pc) closeFastRec(rec); } catch (e) {}
          }, 15000);
        });
      }).catch(function () { try { pc.close(); } catch (e) {} if (rec.fastPc === pc) { rec.fastPc = null; rec.fastDc = null; } });
    } catch (e) {}
  }
  function destroyGuestFast(F) {
    try { if (F && F._fastDc) { try { F._fastDc.close(); } catch (e) {} F._fastDc = null; } } catch (e) {}
    try { if (F && F._fastPc) { try { F._fastPc.close(); } catch (e) {} F._fastPc = null; } } catch (e) {}
  }
  function guestFastOffer(F, d) {
    try {
      if (!F || !d || !d.sdp) return;
      destroyGuestFast(F);
      const pc = new RTCPeerConnection({ iceServers: iceServers() });
      F._fastPc = pc;
      pc.onicecandidate = function (ev) {
        try { if (ev && ev.candidate && F._joinConn) F._joinConn.send({ kind: "fast-ice", candidate: ev.candidate }); } catch (e) {}
      };
      pc.ondatachannel = function (ev) {
        try {
          const dc = ev.channel;
          if (!dc || dc.label !== "fast") return;
          F._fastDc = dc;
          dc.onmessage = function (e2) {
            try {
              const m = JSON.parse(e2.data);
              if (m && m.kind === "push") { try { F._emitMessage(JSON.stringify(m.msg)); } catch (e) {} }
            } catch (e) {}
          };
          dc.onopen = function () { try { if (F._joinConn) F._joinConn.send({ kind: "fast-ok" }); } catch (e) {} };
          dc.onclose = function () { try { if (F._fastDc === dc) F._fastDc = null; } catch (e) {} };
          dc.onerror = function () {};
        } catch (e) {}
      };
      pc.onconnectionstatechange = function () { try { if (pc.connectionState === "failed") destroyGuestFast(F); } catch (e) {} };
      pc.setRemoteDescription({ type: "offer", sdp: String(d.sdp) }).then(function () {
        return pc.createAnswer();
      }).then(function (ans) {
        return pc.setLocalDescription(ans).then(function () {
          try { if (F._joinConn) F._joinConn.send({ kind: "fast-answer", sdp: pc.localDescription ? pc.localDescription.sdp : ans.sdp }); } catch (e) {}
          setTimeout(function () { try { if (!F._fastDc || F._fastDc.readyState !== "open") destroyGuestFast(F); } catch (e) {} }, 15000);
        });
      }).catch(function () { destroyGuestFast(F); });
    } catch (e) {}
  }

  // ---------- facade socket (shape multiplayer.js expects) ----------
  function makeFacade(impl) {
    const listeners = { message: [], close: [] };
    const F = {
      _rpcCall: impl.rpcCall, _send: impl.send, _destroy: impl.destroy,
      opened: null, _resolveOpened: null, _rejectOpened: null,
      rpc: new Proxy({}, { get: (t, method) => (json) => F._rpcCall(String(method), String(json)) }),
      send: (json) => { try { return F._send(String(json)); } catch (e) { return false; } },
      sendHot: (json) => { try { if (F._sendHot) return F._sendHot(String(json)); } catch (e) {} try { return F._send(String(json)); } catch (e2) { return false; } },
      addEventListener: (type, fn) => { try { if (listeners[type] && typeof fn === "function") listeners[type].push(fn); } catch (e) {} },
      removeEventListener: (type, fn) => { try { const a = listeners[type]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } } catch (e) {} },
      _emitMessage: (jsonStr) => { for (const fn of listeners.message.slice()) { try { fn({ data: jsonStr }); } catch (e) {} } },
      _emitClose: (ev) => { for (const fn of listeners.close.slice()) { try { fn(ev || {}); } catch (e) {} } },
      _failOpen: (e) => { try { F._rejectOpened(e); } catch (e2) {} },
      _succeedOpen: () => { try { F._resolveOpened(F); } catch (e2) {} },
      destroy: () => { try { if (F._destroy) F._destroy(); } catch (e) {} },
    };
    F.opened = new Promise((res, rej) => { F._resolveOpened = res; F._rejectOpened = rej; });
    return F;
  }

  // ---------- host side (fresh peer every session) ----------
  let hostPeer = null, hostFacade = null;
  const guestConns = new Map(); // guest peer id -> {conn, hash}
  function hubOpenFor(worldId) {
    try {
      if (!window.MPHost || !window.MPHost.Hub.isOpen()) return false;
      if (worldId) return window.MPHost.Hub.channelId() === normWorldId(worldId);
      return true;
    }
    catch (e) { return false; }
  }
  function hostPeerLive() {
    try { return !!(hostPeer && !hostPeer.destroyed && hostPeer.open); } catch (e) { return false; }
  }
  function makeHostFacade(hash) {
    return makeFacade({
      rpcCall: async (method, json) => {
        let arg = {};
        try { arg = JSON.parse(json); } catch (e) {}
        const r = window.MPHost.Hub.callRpc(method, arg, hash);
        if (!r || !r.ok) throw new Error((r && r.error) || "rpc failed");
        return String(r.payload);
      },
      send: (json) => {
        let m = null;
        try { m = JSON.parse(json); } catch (e) { return false; }
        try { window.MPHost.Hub.handleRelay(m, hash); return true; } catch (e) { return false; }
      },
      // Host loopback is instant; pubsub.publish routes hot messages per
      // guest (fast lane when negotiated, reliable otherwise).
      sendHot: (json) => {
        let m = null;
        try { m = JSON.parse(json); } catch (e) { return false; }
        try { window.MPHost.Hub.handleRelay(m, hash); return true; } catch (e) { return false; }
      },
      destroy: () => destroyHost(),
    });
  }
  function wireGuestConn(peer, conn) {
    const rec = { conn: conn, hash: null };
    try { guestConns.set(String(conn && conn.peer), rec); } catch (e) {}
    const sendTo = (obj) => { try { conn.send(obj); } catch (e) {} };
    conn.on("data", (d) => {
      try {
        if (!d || typeof d !== "object") return;
        if (d.kind === "hello") {
          const h = String(d.hash || "").toLowerCase();
          if (!isValidHash(h)) return;
          rec.hash = h;
          rec.wantFast = !!d.fast;
          try { hashRec.set(h, rec); } catch (e) {}
          try { window.MPHost.Hub.registerConn(h, (s) => { try { const o = JSON.parse(s); sendTo({ kind: "push", msg: o }); } catch (e) {} }); } catch (e) {}
          let host = null;
          try { host = ((window.MPHost.Hub.probe() || {}).host) || null; } catch (e) {}
          sendTo({ kind: "welcome", channelId: (window.MPHost.Hub.channelId() || WORLD_ID), hostPeerId: (peer && peer.id) || null, host: host, fast: fastOn() });
          // Fast lane: host dials the raw UDP-like channel; the guest's
          // fast-ok (over the reliable conn) arms per-guest fast fanout.
          try { if (rec.wantFast || fastOn()) dialFast(rec); } catch (e) {}
          return;
        }
        if (d.kind === "fast-ok") { try { rec.fastOk = true; } catch (e) {} return; }
        if (d.kind === "fast-answer") { try { handleFastAnswer(rec, d); } catch (e) {} return; }
        if (d.kind === "fast-ice") { try { handleFastIce(rec, d); } catch (e) {} return; }
        if (d.kind === "rpc-req") {
          let r = null;
          try { r = window.MPHost.Hub.callRpc(d.method, d.arg || {}, rec.hash || ""); } catch (e) { r = { ok: false, error: String((e && e.message) || e) }; }
          sendTo({ kind: "rpc-res", reqId: d.reqId, ok: !!(r && r.ok), payload: (r && r.payload) || "", error: (r && r.error) || "rpc failed" });
          return;
        }
        if (d.kind === "pub") {
          try { window.MPHost.Hub.handleRelay(d.msg || {}, rec.hash || ""); } catch (e) {}
          return;
        }
      } catch (e) {}
    });
    const cleanup = () => {
      try { if (rec.hash) { try { window.MPHost.Hub.unregisterConn(rec.hash); } catch (e2) {} try { hashRec.delete(rec.hash); } catch (e2) {} } } catch (e) {}
      try { closeFastRec(rec); } catch (e) {}
      try { guestConns.delete(String(conn && conn.peer)); } catch (e) {}
    };
    try { conn.on("close", cleanup); } catch (e) {}
    try { conn.on("error", () => {}); } catch (e) {}
  }
  function ensureHost(params) {
    params = params || {};
    const hash = String(params.hash || "").toLowerCase();
    const name = String(params.name || "Wanderer").slice(0, 16) || "Wanderer";
    const worldId = normWorldId(params.worldId) || WORLD_ID;
    if (!isValidHash(hash)) return Promise.reject(new Error("Bad identity — reload and retry."));
    // Hub already open for THIS world with a live peer: reuse (re-render path).
    if (hubOpenFor(worldId) && hostFacade && hostPeerLive()) return Promise.resolve(hostFacade);
    destroyHost();
    try {
      window.MPHost.Hub.openChannel({ id: worldId, spawnType: params.spawnType, spawnName: params.spawnName, partyMax: params.partyMax, hostHash: hash, hostName: name });
    } catch (e) { return Promise.reject(e); }
    const F = makeHostFacade(hash);
    hostFacade = F;
    let peer = null;
    try { peer = new Peer(peerOptions()); } // fresh cloud id every session
    catch (e) { try { window.MPHost.Hub.closeChannel("down"); } catch (e2) {} hostFacade = null; return Promise.reject(e); }
    hostPeer = peer;
    try { window.MPHost.Hub.setLoopback((s) => F._emitMessage(s)); } catch (e) {}
    try {
      window.MPHost.Hub.setHotCheck((m) => { try { return !!m && HOT_T.has(String(m.t || "")); } catch (e) { return false; } });
      window.MPHost.Hub.setFastSend((hashLower, jsonStr) => {
        try {
          const rec = hashRec.get(String(hashLower || "").toLowerCase());
          if (rec && rec.fastOk && rec.fastDc && rec.fastDc.readyState === "open") {
            let m = null; try { m = JSON.parse(jsonStr); } catch (e) { return false; }
            rec.fastDc.send(JSON.stringify({ kind: "push", msg: m }));
            return true;
          }
        } catch (e) {}
        return false;
      });
    } catch (e) {}
    const p = new Promise((resolve, reject) => {
      let done = false;
      const ok = () => { if (done) return; done = true; F.hostPeerId = peer.id; F._succeedOpen(); resolve(F); };
      const no = (e) => {
        if (done) return; done = true;
        try { peer.destroy(); } catch (e2) {}
        if (hostPeer === peer) hostPeer = null;
        try { window.MPHost.Hub.closeChannel("down"); } catch (e3) {}
        hostFacade = null;
        reject(e instanceof Error ? e : new Error(String((e && e.message) || "Could not reach the rendezvous server — check your connection.")));
      };
      const to = setTimeout(() => no(new Error("Could not reach the rendezvous server — check your connection.")), CONN_TIMEOUT_MS);
      peer.on("error", (err) => {
        const t = String((err && err.type) || "");
        // Fresh peer ids essentially never collide; a taken id here just
        // means retry with another fresh id.
        if (/unavailable-id|taken|invalid-id/i.test(t)) { clearTimeout(to); no(new Error("Could not claim a host id — retry.")); }
        else if (/ssl-unavailable|server-error|network|socket/i.test(t)) { clearTimeout(to); no(new Error("Could not reach the rendezvous server — check your connection.")); }
      });
      peer.on("disconnected", () => { try { peer.reconnect(); } catch (e) {} });
      peer.on("close", () => { try { if (hostPeer === peer) hostPeer = null; } catch (e) {} try { F._emitClose({}); } catch (e) {} });
      peer.on("open", () => { clearTimeout(to); ok(); });
      peer.on("connection", (conn) => wireGuestConn(peer, conn));
    });
    return p.then(
      (F2) => F2,
      (e) => { hostFacade = null; throw e; }
    );
  }
  function destroyHost() {
    try { if (window.MPHost && window.MPHost.Hub.isOpen()) window.MPHost.Hub.closeChannel("down"); } catch (e) {}
    try { if (window.MPHost) window.MPHost.Hub.setLoopback(null); } catch (e) {}
    try { if (window.MPHost) { window.MPHost.Hub.setFastSend(null); window.MPHost.Hub.setHotCheck(null); } } catch (e) {}
    try { for (const [, rec] of guestConns) { try { closeFastRec(rec); } catch (e) {} } } catch (e) {}
    try { hashRec.clear(); } catch (e) {}
    try { guestConns.clear(); } catch (e) {}
    try { if (hostPeer) hostPeer.destroy(); } catch (e) {}
    hostPeer = null; hostFacade = null;
  }
  function hostSessionId() {
    try { return (hostPeer && hostPeer.id) || (hostFacade && hostFacade.hostPeerId) || null; } catch (e) { return null; }
  }

  // ---------- join side (fresh peer every attempt) ----------
  let joinPeer = null, joinFacade = null, joinRpcSeq = 0;
  const joinPending = new Map();
  function destroyJoin() {
    try { for (const [, pr] of joinPending) { try { pr.reject(new Error("disconnected")); } catch (e) {} } } catch (e) {}
    joinPending.clear();
    try { if (joinFacade) destroyGuestFast(joinFacade); } catch (e) {}
    try { if (joinPeer) joinPeer.destroy(); } catch (e) {}
    joinPeer = null; joinFacade = null;
  }
  function ensureJoin(params) {
    params = params || {};
    // New flow passes hostPeerId. Old channel-code flow is gone on purpose:
    // static codes are what stranded joiners on expired ghost ids.
    const hostId = String(params.hostPeerId || params.hostId || "").trim();
    const hash = String(params.hash || "").toLowerCase();
    const name = String(params.name || "Wanderer").slice(0, 16) || "Wanderer";
    if (!isValidHostPeerId(hostId)) return Promise.reject(new Error("That host code looks wrong — paste the host's code or full invite link."));
    if (!isValidHash(hash)) return Promise.reject(new Error("Bad identity — reload and retry."));
    destroyJoin();
    const F = makeFacade({
      rpcCall: (method, json) => {
        let arg = {};
        try { arg = JSON.parse(json); } catch (e) {}
        return joinRpc(method, arg);
      },
      send: (json) => {
        try {
          const jc = F._joinConn;
          if (jc && jc.open) { let m = null; try { m = JSON.parse(json); } catch (e) { return false; } jc.send({ kind: "pub", msg: m }); return true; }
        } catch (e) {}
        return false;
      },
      // Fast lane first (true UDP-like when negotiated); false = caller
      // falls back to the reliable conn. Never throws.
      sendHot: (json) => {
        try {
          const dc = F._fastDc;
          if (dc && dc.readyState === "open") {
            let m = null; try { m = JSON.parse(json); } catch (e) { return false; }
            dc.send(JSON.stringify({ kind: "push", msg: m }));
            return true;
          }
        } catch (e) {}
        return false;
      },
      destroy: () => destroyJoin(),
    });
    joinFacade = F;
    let peer = null;
    try { peer = new Peer(peerOptions()); }
    catch (e) { destroyJoin(); return Promise.reject(e); }
    joinPeer = peer;
    F._joinPeer = peer;
    const fail = (e) => {
      destroyJoin();
      F._failOpen(e instanceof Error ? e : new Error(String((e && e.message) || "Could not connect to the host.")));
    };
    peer.on("error", (err) => {
      const t = String((err && err.type) || "");
      if (/peer-unavailable/i.test(t)) fail(new Error("Host not found — that link is expired or wrong. Ask the host for a fresh link (they get a new one every time they host)."));
      else if (/invalid-id|ssl-unavailable/i.test(t)) fail(new Error("Could not reach the host — check the code and your connection."));
    });
    peer.on("disconnected", () => { try { peer.reconnect(); } catch (e) {} });
    peer.on("close", () => { try { F._emitClose({}); } catch (e) {} });
    peer.on("open", () => {
      let conn = null;
      try { conn = peer.connect(hostId, { reliable: true, serialization: "json", label: "game" }); }
      catch (e) { fail(e); return; }
      F._joinConn = conn;
      F._hostPeerId = hostId;
      const to = setTimeout(() => { try { conn.close(); } catch (e) {} fail(new Error("Host did not answer — they may have closed the tab, or a firewall is blocking the connection. Ask them to re-host and send a fresh link.")); }, CONN_TIMEOUT_MS);
      conn.on("open", () => {
        try { conn.send({ kind: "hello", hash: hash, name: name, channelId: WORLD_ID, fast: fastOn() }); } catch (e) {}
      });
      conn.on("data", (d) => {
        try {
          if (!d || typeof d !== "object") return;
          if (d.kind === "welcome") {
            // The host's world id rides the welcome — guests adopt it, so
            // both sides share one world namespace (same folders, same game).
            const wwid = normWorldId(d.channelId);
            if (!wwid) { fail(new Error("Wrong session — the host answered for a different world.")); return; }
            F._worldId = wwid;
            clearTimeout(to);
            F._succeedOpen();
            return;
          }
          if (d.kind === "rpc-res") {
            const pr = joinPending.get(d.reqId);
            if (pr) {
              joinPending.delete(d.reqId);
              if (d.ok) pr.resolve(String(d.payload || ""));
              else pr.reject(new Error(String(d.error || "rpc failed")));
            }
            return;
          }
          if (d.kind === "fast-offer") { try { guestFastOffer(F, d); } catch (e) {} return; }
          if (d.kind === "fast-answer") { return; } // guests never answer-over-answer; ignore
          if (d.kind === "fast-ice") {
            try { if (F._fastPc) F._fastPc.addIceCandidate(d.candidate).catch(function () {}); } catch (e) {}
            return;
          }
          if (d.kind === "push") {
            try { F._emitMessage(JSON.stringify(d.msg)); } catch (e) {}
            return;
          }
        } catch (e) {}
      });
      conn.on("close", () => { try { clearTimeout(to); } catch (e) {} try { F._emitClose({}); } catch (e) {} });
      conn.on("error", () => {});
    });
    return F.opened.then(() => F);
  }
  function joinRpc(method, arg) {
    const F = joinFacade;
    if (!F || !F._joinConn || !F._joinConn.open) return Promise.reject(new Error("Not connected to the host."));
    const reqId = "r" + (++joinRpcSeq) + "_" + Date.now().toString(36);
    return new Promise((resolve, reject) => {
      joinPending.set(reqId, { resolve: resolve, reject: reject });
      setTimeout(() => { const pr = joinPending.get(reqId); if (pr) { joinPending.delete(reqId); try { pr.reject(new Error("Host did not answer — they may have gone offline.")); } catch (e) {} } }, RPC_TIMEOUT_MS);
      try { F._joinConn.send({ kind: "rpc-req", reqId: reqId, method: method, arg: arg || {} }); }
      catch (e) { joinPending.delete(reqId); reject(new Error("Not connected to the host.")); }
    });
  }

  function destroy() { destroyJoin(); destroyHost(); }
  function fastStatus() {
    try {
      const out = { fastOn: fastOn(), host: [], guest: null };
      try { for (const [, rec] of guestConns) { try { out.host.push({ ok: !!rec.fastOk, open: !!(rec.fastDc && rec.fastDc.readyState === "open") }); } catch (e) {} } } catch (e) {}
      try {
        if (joinFacade) {
          const dc = joinFacade._fastDc;
          out.guest = { open: !!(dc && dc.readyState === "open") };
        }
      } catch (e) {}
      return out;
    } catch (e) { return { fastOn: false, host: [], guest: null }; }
  }
  return {
    WORLD_ID: WORLD_ID, GUEST_WORLD_ID: GUEST_WORLD_ID,
    ensureHost: ensureHost, ensureJoin: ensureJoin, destroy: destroy,
    hostSessionId: hostSessionId, hubOpenFor: hubOpenFor,
    parseHostInvite: parseHostInvite, inviteLink: inviteLink, isValidHostPeerId: isValidHostPeerId,
    getPeerServer: getPeerServer, setPeerServer: setPeerServer,
    fastOn: fastOn, setFastOn: setFastOn, fastStatus: fastStatus, HOT_T: HOT_T,
  };
})();
