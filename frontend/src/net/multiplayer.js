/* Multiplayer sessions: ephemeral PeerJS host id + host-chosen worlds.
   Minecraft-style hosting: the WORLD lives on the host's machine (the
   hosted world's folders + per-world hero records) and every guest brings
   their own per-world hero. There is no game server. The invite link carries ONLY
   the host's live PeerJS id (#host=<peerId>): the host creates a fresh
   `new Peer()` every time they host, guests create a fresh `new Peer()`
   and connect to it, and both sides `peer.destroy()` on leave — so cloud
   expiry can never strand joiners on a stale ghost id. All game bytes flow
   guest<->host over one reliable DataConnection (star topology, host
   relays); there is no guest-guest mesh. Missed tile edits are pulled from
   the HOST (t:tileReq/tileRes). Netcode is dead-reckoning (sequence +
   velocity, drop stale echoes, extrapolate ~200ms). When the host stops,
   guests get an explicit end-of-stream notice; accidental drops retry the
   join on the SAME invite while the host is still live.
   - identity: one persistent player id (localStorage), user enters a name
   - handshake: guest connects directly to the host peer id; hello/welcome
     then validated hub RPCs (mpJoin/...) + relay pubs over that connection.
   - authority: the host simulates the overworld; joiners render glide
     replicas (no local AI/spawns for shared entities).
   - remotes: other players rendered like NPCs; shared time via host snap,
     sleep consensus via an ephemeral host-side vote, chat, give/heal.
*/
window.MP = (() => {
  const M = {
    active: false, channelId: null, hash: null, name: null,
    socket: null, sockOpen: false, connecting: null,
    netMode: null, pendingJoin: null, pendingHost: null, // PeerJS transport mode ("host"/"join") + pending params
   remotes: new Map(), // hash -> {hash,name,x,y,rx,ry,hp,maxHp,mp,maxMp,lv,role,tint,sleeping,lastUpdate}
   shared: new Map(), // entId -> {id,kind,name,x,y,rx,ry,hp,maxHp,lv,dead,owner,ts,lastUpdate}
    dShared: new Map(), // dungeon entId -> {id,kind,...,did,hp,dead,owner,ts,lastUpdate} — shared delve instances
    dPoiOps: new Map(), // chestId/portalKey -> {op,did,ts} — shared delve chest/portal mutations
    lastDEnts: 0, // last time any dungeon snapshot arrived (drives orphan takeover)
    chat: [], // {from,name,text,ts,whisper}
    allies: new Set(), // lowercase hashes of allied travelers (mutual no-damage + map pins)
    allyReqs: new Map(), // reqId -> {from, name, ts} incoming ally requests
    allyOut: new Map(), // reqId -> {to, ts} outgoing ally requests
    trade: null, // active player trade {offerId, peer, peerName, dir, myId, myN, theirId, theirN, stage}
    sleeping: false, sleepInfo: { sleeping: 0, online: 0 },
    tileCache: new Map(), // "cx,cy,lx,ly" -> t (authoritative tile overrides)
    ended: false, // set once the host's explicit end-of-stream arrives
    tileReqSeq: 0, tileReqs: new Map(), // host-served tile catch-up (reqId -> resolve)
    poiReqSeq: 0, poiReqs: new Map(), // host-served loot catch-up (reqId -> resolve)
    poiResendAt: 0, // throttle for opener-side loot rebroadcasts
    netStats: { relayMs: null, lastPing: 0, p2pMs: null }, // latency probe (shown in presence)
    posTimer: 0, pollTimer: 0, saveTimer: 0, entsTimer: 0, dEntsTimer: 0,
    spawnType: null, spawnName: null,
    hostHash: null, // channel host (world server) — creator, else migration winner
    partyMax: 4, // host-decided NPC companion cap per player (channel setting)
    peers: new Map(), // hash -> {pc, dc, open, lastMsg, iceQueue:[]}
    seenNet: new Set(), // dedupe ids for chat/give/heal received twice (P2P + relay)
    chatSeq: 0, // per-message counter for chat/whisper idempotency keys
    poiOps: new Map(), // poiId -> {op:"opened"|"removed",cx,cy,ts} — shared lootable sync (chests, caches)
    snapCount: 0, // host snapshots applied since join (drives the pre-launch NPC wait)
   lastServerPos: 0, lastServerEnts: 0, snapTimer: 0,
    fastTimer: 0, lastHostSnap: 0, hurtPend: {},
    p2pOk: 0, // last time any DataChannel message arrived
    // Dead-reckoning netcode (WoW/Minecraft style): one monotonic sequence per
    // sender across ALL positional sends (pos/snap/snapP/ents/dEnts), so a late
    // relay duplicate can never overwrite newer P2P truth (the old code did —
    // every relay echo yanked players/mobs backwards = the jitter). Receivers
    // keep per-entity last-seq and drop anything stale or duplicated.
    _sq: 0, // sender sequence counter (shared by every positional channel)
    _epoch: (Date.now() * 1000 + ((Math.random() * 1000) | 0)), // sender boot id: resets the per-sender seq gate when a tab reloads (seq restarts at 1)
    _svx: 0, _svy: 0, _lastPosX: 0, _lastPosY: 0, _lastPosT: 0, // sender velocity (tiles/sec, EMA)
    // (appearance now rides every pos; party-look gating keeps its own sigs)
    _snapPPrev: new Map(), // id -> compact sig of last fast-pos send (delta filter)
    _snapPTick: 0,
    _partyAppSig: {}, // npcId -> last sent follower-look sig (resend on change)
  };
  // Next positional sequence number (single counter for every channel, so seq
  // ordering stays comparable across pos + snap + snapP from the same sender).
  function nextSq() {
    try {
      M._sq = ((M._sq | 0) + 1) & 0x7fffffff;
      if (!(M._sq > 0)) M._sq = 1;
      return M._sq;
    } catch (e) { return (Date.now() & 0x7fffffff) || 1; }
  }
  // Accept a positional message/entity only if its sequence is newer than the
  // last accepted one from the same owner. Returns true when accepted (and
  // records the seq), false when stale/duplicated (drop it). Missing seq
  // (old clients) always accepts, so mixed-version sessions keep working.
  // Sender-scoped sequence gate: accept only if newer than the last
  // accepted update FROM THE SAME SENDER for this entity. Stale relay
  // echoes and P2P/relay duplicates drop here (the jitter fix). A new
  // sender (sim handover) always wins. Missing seq = old client: accept.
  // Reload tolerance: every sender stamps a boot epoch (ep) + send time (st)
  // on positional messages. When a tab reloads its seq counter restarts at 1
  // while receivers still hold the old high-water mark — without an epoch the
  // reloaded sender's movement would be dropped as "stale" forever. A changed
  // epoch always wins; when the epoch is stripped (old relay) a clearly newer
  // send-time (>2s) also wins. Relay echoes carry the ORIGINAL st, so they
  // can never pass the st check.
  function clampRemoteCoord(v){ const n=Number(v); if(!isFinite(n)) return 0; return Math.max(-2000, Math.min(2000, Math.round(n*100)/100)); }
  function clampRemoteHp(v){ const n=Math.round(Number(v)||0); if(!isFinite(n)) return 0; return Math.max(0, Math.min(999999, n)); }
  function clampRemoteLv(v){ const n=(v|0)||1; return Math.max(1, Math.min(125, n)); }
  function seqFresh(rec, sq, from, ep, st) {
    try {
      if (sq == null || !(sq > 0)) {
        // legacy sender (no seq): accept, but keep a time baseline so a later
        // seq-carrying restart can still be recognized.
        try { if (st != null && isFinite(+st) && (rec._stT == null || +st > rec._stT)) rec._stT = +st; } catch (e2) {}
        return true;
      }
      from = String(from || "");
      ep = (ep != null && isFinite(+ep)) ? (+ep) : null;
      st = (st != null && isFinite(+st)) ? (+st) : null;
      // new sender (sim handover) always wins
      if (rec._sqFrom !== undefined && rec._sqFrom !== from) { rec._sqFrom = from; rec._sq = sq | 0; if (ep != null) rec._ep = ep; if (st != null) rec._stT = st; return true; }
      // sender rebooted (new epoch): its restarted counter always wins
      if (ep != null && rec._ep !== undefined && rec._ep !== ep) { rec._sqFrom = from; rec._sq = sq | 0; rec._ep = ep; if (st != null) rec._stT = st; return true; }
      // first epoch sighting for a record with history: the sender upgraded
      // or reloaded mid-session, so a wrapped (lower) counter is a restart
      if (ep != null && rec._ep === undefined && (rec._sq | 0) > 0 && (sq | 0) <= (rec._sq | 0)) { rec._sqFrom = from; rec._sq = sq | 0; rec._ep = ep; if (st != null) rec._stT = st; return true; }
      if ((rec._sq | 0) >= (sq | 0)) {
        // stale or duplicate — unless the send-time proves the sender's
        // counter wrapped (reload through an epoch-stripping relay). Echoes
        // replay the original st, so they stay dropped here.
        try {
          if (st != null && rec._stT != null && st - rec._stT > 2000) { rec._sqFrom = from; rec._sq = sq | 0; rec._stT = st; if (ep != null) rec._ep = ep; return true; }
          // pre-epoch record with no time baseline that went quiet long ago:
          // un-stick it (a >5s-delayed echo is pathological; interpolation
          // absorbs the single jump, while a real restart unfreezes for good)
          if (st != null && rec._stT == null && Date.now() - (rec.lastUpdate || 0) > 5000) { rec._sqFrom = from; rec._sq = sq | 0; rec._stT = st; if (ep != null) rec._ep = ep; return true; }
        } catch (e2) {}
        return false;
      }
      rec._sqFrom = from; rec._sq = sq | 0; if (ep != null) rec._ep = ep; if (st != null) rec._stT = st;
      return true;
    } catch (e) { return true; }
  }
 const RTC_CFG = {
   iceServers: [
     { urls: "stun:stun.l.google.com:19302" },
     { urls: "stun:stun1.l.google.com:19302" },
     // TURN relay for NAT pairs where direct P2P never connects. Still
     // browser-to-browser WebRTC, just relayed over UDP — steadier than the
     // app-level relay (less zigzag). Public demo credentials; if TURN is
     // unreachable ICE falls back to direct/relay as before. Creation is
     // rare (max one redial per 30s), so gathering cost stays negligible.
     { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
     { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
     { urls: "turns:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
   ],
 };
  function getIceServers() { try { return RTC_CFG.iceServers || []; } catch (e) { return []; } }
  function isHost() { try { return !!(M.active && M.hash && M.hostHash && String(M.hostHash).toLowerCase() === String(M.hash).toLowerCase()); } catch (e) { return false; } }
  // v18 dimension: same numbers, separate worlds. Overworld bubbles, sims and
  // tile/poi shares are per-dim; cross-dim remotes are filtered everywhere.
  function mpDim() {
    try {
      const G = window.Game && window.Game.G;
      if (G && G.player && (G.player.dim === "hell" || G.player.dim === "heaven" || G.player.dim === "surf")) return G.player.dim;
      if (window.World && window.World.getDim) return window.World.getDim();
    } catch (e) {}
    return "surf";
  }
  function normMpDim(d) { return d === "heaven" ? "heaven" : d === "hell" ? "hell" : "surf"; }
  // Area-simulator election: exactly ONE client simulates each bubble, everyone
  // else purely renders the host relay. Host owns any bubble it's inside of;
  // otherwise the lowest hash among the clients standing in the bubble wins.
  // (Deterministic on shared position data, so split parties each get exactly
  // one simulator and nobody double-simulates the same villager/mob.)
  function amAreaSim() {
    try {
      if (!M.active) return true;
      if (isHost()) return true;
      const G = window.Game && window.Game.G;
      // shared delves: the dungeon bubble has its own election (see amDungeonSim)
      try { if (G && G.player && G.player.inDungeon) return amDungeonSim(); } catch (e) {}
       if (!G || !G.player || !isFinite(G.player.x) || !isFinite(G.player.y)) return true;
      const px = G.player.x, py = G.player.y;
      const mine = String(M.hash || "").toLowerCase();
      const FRESH = 8000, R = 46;
      const myDim = mpDim();
      try {
        for (const r of M.remotes.values()) {
          if (!r || !r.hash) continue;
          // a delver owns no overworld bubble while down in a shared delve
          if (r.inDungeon) continue;
          // v18: other-dimension remotes share coordinates but never our bubble
          try { if ((r.dim === "hell" || r.dim === "heaven" || r.dim === "surf") && r.dim !== myDim) continue; } catch (e) {}
          if (Date.now() - (r.lastUpdate || 0) > FRESH) continue;
          if (!isFinite(r.x) || !isFinite(r.y)) continue;
          if (Math.hypot(r.x - px, r.y - py) >= R) continue;
          // host nearby owns this bubble
          try { if (M.hostHash && String(r.hash).toLowerCase() === String(M.hostHash).toLowerCase()) return false; } catch (e) {}
          // lower-hash peer nearby owns it instead of me
          if (String(r.hash).toLowerCase() < mine) return false;
        }
      } catch (e) {}
      return true;
    } catch (e) { return true; }
  }
  // Full dungeon instance id for the local player (e.g. "d_3_-5" or "d_3_-5_L2"),
  // or null when not delving. The baseId alone is NOT enough: different floors
  // are different instances and must never share mobs/chests.
  function myDungeonId() {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player || !G.player.inDungeon) return null;
      if (G.dungeon && G.dungeon.id) return String(G.dungeon.id);
      const base = String(G.player.inDungeon);
      const lv = ((G.player.dungeonLevel | 0) || 1);
      return lv > 1 ? base + "_L" + lv : base;
    } catch (e) { return null; }
  }
  // Shared-delve election: exactly ONE occupant simulates regular spawns +
  // the delve lord for each dungeon instance; everyone else renders shadows.
  // Host-preferred (the host is the world server): when the host stands in
  // that instance it is always the sim; otherwise the lowest hash among the
  // occupants wins. Deterministic on shared pos data, so a party entering the
  // same mouth converges on one sim and never double-spawns. Triggered teeth
  // (chest/portal mimics) are owned by whoever touched them, so they don't
  // need the election.
  function amDungeonSim(did) {
    try {
      if (!M.active) return true;
      const G = window.Game && window.Game.G;
      if (!G || !G.player || !G.player.inDungeon) return true;
      if (!did) did = myDungeonId();
      if (!did) return true;
      did = String(did);
      const mine = String(M.hash || "").toLowerCase();
      const hostH = String(M.hostHash || "").toLowerCase();
      const FRESH = 8000;
      const myDim = mpDim();
      // occupant set for this instance (self + fresh remotes, same dim)
      const occ = new Set();
      try { if (G && G.player && G.player.inDungeon && myDungeonId() === did) occ.add(mine); } catch (e) {}
      let min = mine;
      for (const r of M.remotes.values()) {
        if (!r || !r.hash) continue;
        if (!r.inDungeon) continue;
        if (String(r.dId || "") !== did) continue;
        // v18: same did string exists in both dims — only same-dim delvers share.
        try { if ((r.dim === "hell" || r.dim === "heaven" || r.dim === "surf") && r.dim !== myDim) continue; } catch (e) {}
        if (Date.now() - (r.lastUpdate || 0) > FRESH) continue;
        const h = String(r.hash).toLowerCase();
        occ.add(h);
        if (h < min) min = h;
      }
      // host runs the delve when present (unified world server); otherwise
      // the lowest-hash occupant keeps the teeth moving.
      try { if (hostH && occ.has(hostH)) return mine === hostH; } catch (e) {}
      return min === mine;
    } catch (e) { return true; }
  }
  // Fresh occupants (hashes) of a dungeon instance, including self.
  function dungeonOccupants(did) {
    const out = [];
    try {
      if (!M.active || !did) return out;
      did = String(did);
      const now = Date.now(), FRESH = 8000;
      const myDim = mpDim();
      try {
        const G = window.Game && window.Game.G;
        if (G && G.player && G.player.inDungeon && myDungeonId() === did) out.push(String(M.hash || "").toLowerCase());
      } catch (e) {}
      for (const r of M.remotes.values()) {
        if (!r || !r.hash || !r.inDungeon) continue;
        if (String(r.dId || "") !== did) continue;
        try { if ((r.dim === "hell" || r.dim === "heaven" || r.dim === "surf") && r.dim !== myDim) continue; } catch (e) {}
        if (now - (r.lastUpdate || 0) > FRESH) continue;
        out.push(String(r.hash).toLowerCase());
      }
    } catch (e) {}
    return out;
  }
  function p2pList() { const out = []; try { for (const [h, p] of M.peers) if (p && p.open) out.push(h); } catch (e) {} return out; }
  function p2pCount() { let n = 0; try { for (const p of M.peers.values()) if (p && p.open) n++; } catch (e) {} return n; }
  // ---------- session identity (ephemeral PeerJS ids, persistent player) ----------
  // World namespaces: the HOST picks one of its worlds (short local id).
  // Guests adopt that id from the welcome handshake — one world, same game.
  // Neither id is secret and neither is discovery — discovery is the
  // ephemeral host peer id in the invite link.
  const WORLD_ID = "MPHOST", GUEST_ID = "MPJOIN";
  function worldId() { return WORLD_ID; }
  function guestId() { return GUEST_ID; }
  function inviteLink(hostPeerId) {
    try { if (window.MPNet && window.MPNet.inviteLink) return window.MPNet.inviteLink(hostPeerId); } catch (e) {}
    hostPeerId = String(hostPeerId || "").trim();
    try {
      const g = window.generatorName || "";
      if (g) return "https://perchance.org/" + g + "#host=" + encodeURIComponent(hostPeerId);
    } catch (e) {}
    try { return String(location.href).split("#")[0] + "#host=" + encodeURIComponent(hostPeerId); } catch (e) { return "#host=" + hostPeerId; }
  }
  // Back-compat alias: old title flows used channel links. New links use #host=.
  function chanLink(id) {
    try {
      if (id && window.MPNet && window.MPNet.isValidHostPeerId && window.MPNet.isValidHostPeerId(id)) return inviteLink(id);
      if (M && M.hostPeerId) return inviteLink(M.hostPeerId);
    } catch (e) {}
    return inviteLink(String(id || ""));
  }
  function parseHostInvite(input) {
    try { if (window.MPNet && window.MPNet.parseHostInvite) return window.MPNet.parseHostInvite(input); } catch (e) {}
    return "";
  }
  // Legacy names kept as thin wrappers so nothing else breaks.
  function extractChannelCode(input) { return parseHostInvite(input); }
  function normChanId(id) { return parseHostInvite(id); }
  const PLAYER_ID_KEY = "emberhold-mp-player-id";
  function nameKey() { return "emberhold-mp-name"; }
  function getHash() {
    // One persistent player id per browser (NOT per channel/world). Fresh
    // peer ids come from the PeerJS cloud per session; this id is the stable
    // game identity the host uses for the member roster + hero records.
    try {
      let h = localStorage.getItem(PLAYER_ID_KEY);
      if (h && /^[0-9a-f]{16,64}$/i.test(h)) return h.toLowerCase();
      const b = new Uint8Array(16);
      try { crypto.getRandomValues(b); } catch (e) { for (let i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0; }
      h = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
      try { localStorage.setItem(PLAYER_ID_KEY, h); } catch (e) {}
      return h;
    } catch (e) {
      try { return [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, "0")).join(""); }
      catch (e2) { return "ab".repeat(16); }
    }
  }
  function lastName() { try { return localStorage.getItem(nameKey()) || ""; } catch (e) { return ""; } }
  function storeName(n) { try { localStorage.setItem(nameKey(), n); } catch (e) {} }
  function rpc(method, obj) {
    return M.socket.rpc[method](JSON.stringify(obj || {}));
  }
  async function ensureSocket() {
    if (M.socket && M.sockOpen) return M.socket;
    if (M.connecting) return M.connecting;
    M.connecting = (async () => {
      // PeerJS transport (no Perchance server): host serves its own hub
      // locally; joiners open a DataConnection to the host's peer id.
      if (M.netMode === "host") {
        const p = M.pendingHost || {};
        const s = await window.MPNet.ensureHost({
          hash: p.hash || M.hash, name: p.name || M.name,
          spawnType: p.spawnType, spawnName: p.spawnName, partyMax: p.partyMax,
          worldId: p.worldId,
        });
        M.socket = s; M.sockOpen = false;
        s.addEventListener("message", onSockMsg);
        s.addEventListener("close", onSockClose);
        try { await s.opened; } catch (e) { throw new Error(String((e && e.message) || "could not reach the rendezvous server — check your connection")); }
        M.sockOpen = true;
        return s;
      }
      const p = M.pendingJoin || {};
      const s = await window.MPNet.ensureJoin({
        hostPeerId: p.hostPeerId || p.hostId || M.hostPeerId, hash: p.hash || M.hash, name: p.name || M.name,
      });
      M.socket = s; M.sockOpen = false;
      s.addEventListener("message", onSockMsg);
      s.addEventListener("close", onSockClose);
      try { await s.opened; } catch (e) {
        throw new Error(String((e && e.message) || "could not reach the host — check your connection"));
      }
      M.sockOpen = true;
      return s;
    })();
    try { return await M.connecting; }
    finally { M.connecting = null; }
  }
  function onSockClose(ev) {
    M.sockOpen = false;
    if (!M.active) return;
    // Accidental disconnects retry the SAME invite quietly (the host peer id
    // is still live). Only an explicit t:hostEnded ends the session.
    try { window.UI.toast("🌐 Connection lost — retrying…", 4000); } catch (e) {}
    setTimeout(async () => {
      if (!M.active) return;
      try {
        await ensureSocket();
        const raw = await rpc("mpJoin", { channelId: M.channelId, hash: M.hash, name: M.name });
        applyJoin(JSON.parse(raw));
        try { window.UI.toast("🌐 Reconnected.", 3000); } catch (e) {}
      } catch (e) {
        try {
          if (/ended|fresh link|Host not found|did not answer/i.test(String((e && e.message) || ""))) handleHostEnded("hub");
        } catch (e2) {}
      }
    }, 2500);
  }
  // ---------- star transport (guest<->host only; no guest-guest mesh) ----------
  // Every game byte flows over the single reliable DataConnection to the
  // host, which relays to the star. Fresh peers per session, peer.destroy()
  // on leave — no static ids, no signaling, no ICE mesh to repair.
  function serverSend(obj) {
    try {
      if (M.socket && M.sockOpen) { M.socket.send(JSON.stringify(obj)); return true; }
    } catch (e) {}
    return false;
  }
  function broadcastNet(obj) { return serverSend(obj) ? 1 : 0; }
  // Fast lane first (true UDP-like when negotiated), reliable fallback.
  // Continuous state only — damage/chat/membership always use broadcastNet.
  function broadcastHot(obj) {
    try {
      if (M.socket && M.sockOpen && M.socket.sendHot && M.socket.sendHot(JSON.stringify(obj))) return 1;
    } catch (e) {}
    return serverSend(obj) ? 1 : 0;
  }
  function netDedupe(id) {
    try {
      if (M.seenNet.has(id)) return true;
      M.seenNet.add(id);
      if (M.seenNet.size > 400) { const a = [...M.seenNet].slice(-250); M.seenNet = new Set(a); }
    } catch (e) {}
    return false;
  }
  function p2pList() { return []; }
  function p2pCount() { return 0; }
  // Ephemeral-session compat stubs (old title flows removed; kept so older
  // callers fail quiet instead of throwing ReferenceError at load).
  function meshRepair() { return { ok: false }; }
  function hostSessionId() {
    try {
      if (window.MPNet && window.MPNet.hostSessionId) return window.MPNet.hostSessionId();
    } catch (e) {}
    try { return (M.socket && M.socket.hostPeerId) || M.hostPeerId || null; } catch (e) { return null; }
  }
  function pingChannel() {
    return Promise.reject(new Error("Ping is gone — paste the host's fresh invite link instead (host gets a new one every session)."));
  }
  // ---- host worlds: selectable, saveable, per-world namespaces ----
  // Each world is a short local id (folders + Hub validation only — never a
  // PeerJS id, so cloud expiry can't touch it). Guests adopt the host's
  // world id from the welcome handshake: one world, same game, both sides.
  const MP_WORLD_RE = /^[A-Z0-9]{6,16}$/;
  const MP_WORLD_KEY = "emberhold-mp-worlds-v1";
  const MP_WORLD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function listHostWorlds() {
    try {
      const arr = JSON.parse(localStorage.getItem(MP_WORLD_KEY) || "[]");
      if (!Array.isArray(arr)) return [];
      return arr.filter((w) => w && MP_WORLD_RE.test(String(w.id || ""))).map((w) => ({
        id: String(w.id),
        name: String(w.name || "World").slice(0, 32) || "World",
        created: +w.created || 0, lastHosted: +w.lastHosted || 0,
        partyMax: clampPartyMax(w.partyMax),
        spawnType: String(w.spawnType || "").slice(0, 16),
        spawnName: String(w.spawnName || "").slice(0, 32),
      }));
    } catch (e) { return []; }
  }
  function saveHostWorlds(arr) { try { localStorage.setItem(MP_WORLD_KEY, JSON.stringify(arr || [])); } catch (e) {} }
  function genWorldId() {
    const taken = new Set(listHostWorlds().map((w) => w.id));
    for (let n = 0; n < 50; n++) {
      let s = "";
      try {
        const b = new Uint8Array(8); crypto.getRandomValues(b);
        for (const x of b) s += MP_WORLD_ALPHABET[x % 32];
      } catch (e) { for (let i = 0; i < 8; i++) s += MP_WORLD_ALPHABET[(Math.random() * 32) | 0]; }
      if (!taken.has(s)) return s;
    }
    return ("W" + Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "X") + "XXXXX").slice(0, 8);
  }
  function getHostWorld(id) {
    id = String(id || "").toUpperCase();
    return listHostWorlds().find((w) => w.id === id) || null;
  }
  function createHostWorld(name) {
    name = String(name || "My World").trim().slice(0, 32) || "My World";
    const arr = listHostWorlds();
    const w = { id: genWorldId(), name: name, created: Date.now(), lastHosted: 0, partyMax: 4, spawnType: "", spawnName: "" };
    arr.push(w); saveHostWorlds(arr);
    return w;
  }
  function renameHostWorld(id, name) {
    id = String(id || "").toUpperCase();
    name = String(name || "").trim().slice(0, 32);
    if (!name) return null;
    const arr = listHostWorlds();
    const w = arr.find((x) => x.id === id);
    if (!w) return null;
    w.name = name; saveHostWorlds(arr);
    return w;
  }
  async function deleteHostWorld(id) {
    id = String(id || "").toUpperCase();
    if (!MP_WORLD_RE.test(id)) return false;
    try {
      if (M.active && M.channelId === id) return false; // hosting/inside it: leave first
    } catch (e) {}
    try {
      let heroes = [];
      try { heroes = await listChannelHeroes(); } catch (e) { heroes = []; }
      for (const h of (heroes || [])) {
        if (!h || h.channelId !== id) continue;
        try {
          const parts = String(h.key || "").split("_");
          const hh = parts.slice(2).join("_");
          if (hh) await deleteChannelHero(id, hh);
        } catch (e) {}
      }
    } catch (e) {}
    try { if (window.World && window.World.deleteChannelWorld) await window.World.deleteChannelWorld(id); } catch (e) {}
    try { const st = chanHeroStore(); if (st) await st.delete("mvisitors_" + id); } catch (e) {}
    try {
      const arr = listHostWorlds().filter((w) => w.id !== id);
      saveHostWorlds(arr);
    } catch (e) {}
    return true;
  }
  function touchHostWorld(id, patch) {
    id = String(id || "").toUpperCase();
    const arr = listHostWorlds();
    const w = arr.find((x) => x.id === id);
    if (!w) return null;
    try {
      if (patch && typeof patch === "object") {
        if (patch.partyMax != null) w.partyMax = clampPartyMax(patch.partyMax);
        if (typeof patch.spawnType === "string" && patch.spawnType) w.spawnType = patch.spawnType.slice(0, 16);
        if (typeof patch.spawnName === "string" && patch.spawnName) w.spawnName = patch.spawnName.slice(0, 32);
        if (typeof patch.name === "string" && patch.name.trim()) w.name = patch.name.trim().slice(0, 32);
      }
      w.lastHosted = Date.now();
    } catch (e) {}
    saveHostWorlds(arr);
    return w;
  }
  function defaultHostWorld() {
    const arr = listHostWorlds();
    if (!arr.length) return createHostWorld("My World");
    arr.sort((a, b) => (b.lastHosted || 0) - (a.lastHosted || 0) || (b.created || 0) - (a.created || 0));
    return arr[0];
  }
  // World display names (presence + title): the registry name, else the id.
  function getWorldName(id) {
    try { const w = getHostWorld(id); if (w && w.name) return w.name; } catch (e) {}
    return String(id || "");
  }
  function setWorldName(id, name) {
    try { const w = renameHostWorld(id, name); return w ? w.name : ""; } catch (e) { return ""; }
  }
  function listCreatedIds() { return []; }
  function markCreated() { return false; }
  function forgetCreated() { return false; }
  function listVisitedEntries() { return []; }
  function markVisited() { return false; }
  function forgetVisited() { return false; }
  function onSockMsg(ev) {
    let m = null;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (!m || !m.t) return;
    handleNetMsg(m, "relay");
  }
  // Single-transport handler: every message arrives once over the host
  // connection (star). Sequence gates still drop stale host-relay echoes.
  function handleNetMsg(m, via) {
    if (!m || !m.t) return;
    if (!M.active && m.t !== "kicked") return;
    try {
      if (m.t === "pos") {
        if (m.hash === M.hash) return;
        const r = M.remotes.get(m.hash) || { hash: m.hash };
        // Sequence gate (the jitter fix): P2P + relay carry the same update
        // and relay echoes arrive late. Anything at/below the last accepted
        // seq is a stale echo or a duplicate — drop it before it can yank the
        // player backwards. Missing seq = old client: accept (legacy path).
        // Epoch/send-time aware: a reloaded sender's restarted counter still
        // passes (see seqFresh) instead of freezing them forever.
        try {
          const sq = (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null;
          if (!seqFresh(r, sq, m.hash, m.ep, m.st)) return;
        } catch (e) {}
        r.name = String(m.name || r.name || "Traveler").slice(0, 16);
        if (isFinite(+m.x)) r.x = +m.x;
        if (isFinite(+m.y)) r.y = +m.y;
        if (r.rx == null || !isFinite(r.rx)) { r.rx = r.x; r.ry = r.y; }
        else if (Math.hypot((r.x || 0) - r.rx, (r.y || 0) - (r.ry || 0)) > 12) { r.rx = r.x; r.ry = r.y; }
        // sender velocity (dead reckoning): extrapolate along it when packets
        // run late. Old senders omit it — the interpolator then derives it.
        try {
          if (isFinite(+m.vx) && isFinite(+m.vy)) {
            r.vx = Math.max(-30, Math.min(30, +m.vx));
            r.vy = Math.max(-30, Math.min(30, +m.vy));
            r._vxT = Date.now();
          }
        } catch (e) {}
        if (isFinite(+m.hp)) r.hp = +m.hp;
        if (isFinite(+m.maxHp)) r.maxHp = +m.maxHp;
        if (isFinite(+m.mp)) r.mp = +m.mp;
        if (isFinite(+m.maxMp)) r.maxMp = +m.maxMp;
        // Usaghito chorus voices (flat ints; old senders omit → lend nothing)
        try {
          let st = (r.stats && typeof r.stats === "object") ? r.stats : null;
          if (isFinite(+m.luk)) {
            r.luk = Math.max(0, Math.min(999, +m.luk | 0));
            st = st || {}; st.luk = r.luk;
          }
          if (isFinite(+m.cha)) {
            r.cha = Math.max(0, Math.min(999, +m.cha | 0));
            st = st || {}; st.cha = r.cha;
          }
          if (st) r.stats = st;
        } catch (e) {}
        if (m.lv) r.lv = m.lv | 0;
        if (m.role) r.role = String(m.role).slice(0, 16);
        if (m.tint) r.tint = String(m.tint).slice(0, 16);
        // look: compact appearance + equipped ids (old clients send none)
        try {
          if (m.app && window.Appearance) r.app = window.Appearance.unpack(m.app);
          else if (m.appearance && window.Appearance) r.app = window.Appearance.sanitize(m.appearance);
        } catch (e) { }
        // "-" is the explicit unequipped sentinel (see sendPos): it CLEARS
        // stale gear. A missing field (old sender) keeps the last known.
        if (typeof m.w === "string" && m.w) r.w = (m.w === "-" ? null : m.w.slice(0, 32));
        if (typeof m.a === "string" && m.a) r.a = (m.a === "-" ? null : m.a.slice(0, 32));
        if (typeof m.s === "string" && m.s) r.s = (m.s === "-" ? null : m.s.slice(0, 32));
        if (typeof m.o === "string" && m.o) r.o = (m.o === "-" ? null : m.o.slice(0, 32));
        r.sleeping = !!m.sleeping;
        r.inDungeon = !!m.dun;
        // v19 dimension (v19+ senders always include it; default surf —
        // coordinates are shared across dims now, so no disc can infer it).
        try {
          if (m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") r.dim = m.dim;
          else if (r.dim !== "hell" && r.dim !== "heaven" && r.dim !== "surf") r.dim = "surf";
        } catch (e) {}
        // raft: sailing state rides the pos channel so fellow travelers
        // render the hull (old clients send no sail field — they read as ashore)
        r.sailing = !!m.sail;
        if (typeof m.boat === "string" && m.boat) r.activeBoat = m.boat.slice(0, 16);
        else if (r.sailing) r.activeBoat = r.activeBoat || "raft";
        else r.activeBoat = null;
        // ridden mount (kind + raw tint; template fallback happens at draw)
        r.mountKind = (typeof m.mk === "string" && m.mk) ? m.mk.slice(0, 24) : null;
        r.mountTint = (typeof m.mt === "string" && m.mt) ? m.mt.slice(0, 16) : null;
        try {
          if (Array.isArray(m.party)) {
            r.party = m.party.slice(0, 12).map((q) => {              const _qe = {
                n: String((q && q.n) || "Ally").slice(0, 24),
                lv: Math.max(1, Math.min(125, (q && q.lv) | 0 || 1)),
                hp: Math.max(0, Math.round(Number((q && q.hp) || 0))),
                maxHp: Math.max(1, Math.round(Number((q && q.maxHp) || 0) || 40)),
                x: (q && isFinite(+q.x)) ? +q.x : undefined,
                y: (q && isFinite(+q.y)) ? +q.y : undefined,
                role: (q && typeof q.role === "string" && q.role) ? String(q.role).slice(0, 16) : undefined,
                tint: (q && typeof q.tint === "string" && q.tint) ? String(q.tint).slice(0, 16) : undefined,
              };
              try { if (q && q.app && window.Appearance) _qe.app = window.Appearance.unpack(q.app); } catch (e2) {}
              return _qe;
            });
          } else r.party = null;
        } catch (e) { r.party = null; }
        // shadow-clone ditto positions (compact [x,y,hp] triples, cap 4).
        // Old senders omit the field — null keeps the last-known clear.
        try {
          if (Array.isArray(m.cl) && m.cl.length) {
            const _cl = [];
            for (const t of m.cl.slice(0, 4)) {
              if (!Array.isArray(t) || t.length < 2) continue;
              const _x = +t[0], _y = +t[1];
              if (!isFinite(_x) || !isFinite(_y)) continue;
              _cl.push([+_x.toFixed(2), +_y.toFixed(2), Math.max(0, Math.round(+t[2] || 0))]);
            }
            r.cl = _cl.length ? _cl : null;
          } else r.cl = null;
        } catch (e) { r.cl = null; }
        // shared-delve identity: full dungeon id (with _L level) + level, so
        // same mouth + same floor = same party. Old clients send no did.
        try {
          r.dId = (typeof m.did === "string" && m.did) ? m.did.slice(0, 48) : null;
          r.dLv = isFinite(+m.dLv) ? (+m.dLv | 0) : (r.inDungeon ? 1 : 0);
        } catch (e) { r.dId = null; }
        // planted torches (compact [x,y,scope,lvl] arrays, cap 60). Present
        // only when the sender's layout changed (or its 20s repair); absent
        // keeps the last-known layout, so the gating never blinks. Empty
        // array = sender has no visible torches: clears a stale layout.
        try {
          if (Array.isArray(m.to)) {
            const _tt = [];
            for (const q of m.to.slice(0, 60)) {
              if (!Array.isArray(q) || q.length < 3) continue;
              const _x = +q[0], _y = +q[1];
              if (!isFinite(_x) || !isFinite(_y)) continue;
              const _sc = (+q[2] === 1) ? 1 : ((+q[2] === 2) ? 2 : 0);
              const _lv = isFinite(+q[3]) ? ((+q[3] | 0) || 0) : 0;
              _tt.push([+_x.toFixed(1), +_y.toFixed(1), _sc, _lv]);
            }
            r.to = _tt;
          }
        } catch (e) {}
        // player-built overlays (compact [x,y,code,dimFlag] arrays, cap 60).
        // Same gating as torches: absent keeps the last-known layout, empty
        // array clears a stale layout (owner went delving / built nothing).
        try {
          if (Array.isArray(m.pl)) {
            const _pl = [];
            for (const q of m.pl.slice(0, 60)) {
              if (!Array.isArray(q) || q.length < 3) continue;
              const _x = +q[0], _y = +q[1];
              if (!isFinite(_x) || !isFinite(_y)) continue;
              const _c = (+q[2]) | 0;
              const _ok = (_c >= 0 && _c < 10) || (_c >= 16 && _c < 21) || _c === 24;
              if (!_ok) continue;
              const _d = (+q[3] === 1) ? 1 : 0;
              _pl.push([+_x.toFixed(1), +_y.toFixed(1), _c, _d]);
            }
            r.pl = _pl;
          }
        } catch (e) {}
        r.lastUpdate = Date.now();
        try { pushNetSample(r, r.x, r.y, r.lastUpdate); } catch (e) {}
        r.via = via;
        M.remotes.set(m.hash, r);
        // opportunistic P2P: learn a newcomer from its pos, dial if we're lower
        try { if (via === "relay" && String(M.hash || "") < String(m.hash || "")) ensurePeer(m.hash, true); } catch (e) {}
        return;
      }
      if (m.t === "snap") {
        // host-authoritative snapshot (positions + hp + clock + loot). Only the host
        // is accepted — relay already enforces it, P2P checks it here.
        try { if (String(m.from || "").toLowerCase() !== String(M.hostHash || "").toLowerCase()) return; } catch (e) { return; }
        if (m.from === M.hash) return;
        // v18 dimension: same numbers, separate worlds — drop cross-dim snaps.
        // Legacy senders omit dim: accept (they are surf).
        try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e) {}
        try { M.lastHostSnap = Date.now(); M.snapCount = (M.snapCount | 0) + 1; } catch (e2) {}
        try {
          const dt = (m.dayTime === null || m.dayTime === undefined) ? NaN : +m.dayTime;
          if (isFinite(dt) && window.Game && window.Game.G && !isHost()) {
            // Fresh host truth only: a delayed relay echo carries an OLDER
            // clock — applying it would yank the joiner's day/night backwards
            // (visible as a frozen clock when the host's sends stall, e.g.
            // while the host is dead and un-respawned). The joiner's own loop
            // already advances its clock, so a dropped message just means a
            // slightly later convergence, never a rewind.
            let fresh = true;
            try {
              M._clockGate = M._clockGate || {};
              fresh = seqFresh(M._clockGate, (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null, m.from, m.ep, m.st);
            } catch (e3) { fresh = true; }
            if (fresh) {
              window.Game.G.dayTime = dt;
              try { window.Game.G.player.dayTime = dt; } catch (e2) {}
              try { if (window.Game.updateClock) window.Game.updateClock(); } catch (e2) {}
            }
          }
        } catch (e) {}
        // shared lootable ops ride the snapshot so late joiners + walk-ins
        // converge (chests opened / caches taken while they were away)
        try {
          if (Array.isArray(m.poi)) {
            for (const op of m.poi) {
              if (!op || typeof op.id !== "string") continue;
              applyPoiOp(op.id.slice(0, 48), op.op === "removed" ? "removed" : "opened", +op.cx, +op.cy, op.dim != null ? op.dim : m.dim);
            }
          }
        } catch (e) {}
        const list = Array.isArray(m.list) ? m.list : [];
        const nowS = Date.now();
        // Message sequence: every chunk of one tick carries its own seq from
        // the host's single positional counter. Per-entity gating drops late
        // relay echoes of older chunks (the mob jitter) and second-path dupes.
        const sqS = (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null;
        for (const e of list) {
          if (!e || typeof e.id !== "string") continue;
          const id = e.id.slice(0, 48);
          const prev = M.shared.get(id);
          const rec = prev || { id, rx: +e.x, ry: +e.y };
          if (!seqFresh(rec, sqS, m.from, m.ep, m.st)) continue; // stale relay echo / P2P dupe: drop
          try { rec.dim = normMpDim(m.dim); } catch (e2) {}
          rec.kind = String(e.kind || (prev && prev.kind) || "mob").slice(0, 24);
          if (isFinite(+e.x)) rec.x = clampRemoteCoord(e.x);
          if (isFinite(+e.y)) rec.y = clampRemoteCoord(e.y);
          if (rec.rx == null) { rec.rx = rec.x; rec.ry = rec.y; }
          if (e.hp != null && isFinite(+e.hp)) rec.hp = clampRemoteHp(e.hp);
          if (e.maxHp != null && isFinite(+e.maxHp)) rec.maxHp = Math.max(1, clampRemoteHp(e.maxHp));
          if (e.lv) rec.lv = clampRemoteLv(e.lv);
          if (e.name) rec.name = String(e.name).slice(0, 24);
          if (e.role) rec.role = String(e.role).slice(0, 24);
          if (e.tint) rec.tint = String(e.tint).slice(0, 16);
          try { if (e.app && window.Appearance) rec.app = window.Appearance.unpack(e.app); } catch (e2) { }
         if (isFinite(+e.face)) rec.face = +e.face;
         if (e.looted) rec.looted = true;
          if (e.tame) rec.tame = true;
          if (e.boss) rec.boss = true;
         rec.sub = !!e.sub; rec.voidH = !!e.voidH;
         rec.dead = !!e.dead;
         rec.owner = m.from;
         rec.hostAuth = true;
         // corpse purse rides the hub so every screen's raid pays the same
          if (e.gold != null && isFinite(+e.gold)) rec.gold = Math.max(0, Math.round(+e.gold)); else delete rec.gold;
          rec.ts = nowS;
          rec.lastUpdate = nowS;
         try { pushNetSample(rec, rec.x, rec.y, nowS); } catch (e2) {}
         M.shared.set(id, rec);
       }
       return;
     }
      if (m.t === "snapP") {
        // fast host-authoritative positions (~10Hz, delta-compressed): same truth
        // snap, minus identity/clock. Host-only (relay already enforces it,
        // P2P checks it here). Merges into the same shared map.
       try { if (String(m.from || "").toLowerCase() !== String(M.hostHash || "").toLowerCase()) return; } catch (e) { return; }
        if (m.from === M.hash) return;
        try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e) {}
       try { M.lastHostSnap = Date.now(); M.snapCount = (M.snapCount | 0) + 1; } catch (e2) {}
        const listP = Array.isArray(m.list) ? m.list : [];
         const nowP = Date.now();
         const sqP = (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null;
         // clock rides the fast channel: a dropped full snap can't strand the
         // joiner's day/night (same freshness gate as the full snap above —
         // shared sender counter, shared gate — so stale echoes never rewind)
         try {
           const dtP = (m.dayTime === null || m.dayTime === undefined) ? NaN : +m.dayTime;
           if (isFinite(dtP) && window.Game && window.Game.G && !isHost()) {
             let freshP = true;
             try {
               M._clockGate = M._clockGate || {};
               freshP = seqFresh(M._clockGate, (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null, m.from, m.ep, m.st);
             } catch (e3) { freshP = true; }
             if (freshP) {
               window.Game.G.dayTime = dtP;
               try { window.Game.G.player.dayTime = dtP; } catch (e2) {}
               try { if (window.Game.updateClock) window.Game.updateClock(); } catch (e2) {}
             }
           }
         } catch (e) {}
        for (const e of listP) {
          if (!e || typeof e.id !== "string") continue;
          const id = e.id.slice(0, 48);
          const prev = M.shared.get(id);
          const rec = prev || { id, rx: +e.x, ry: +e.y };
          if (!seqFresh(rec, sqP, m.from, m.ep, m.st)) continue; // stale relay echo / P2P dupe: drop
          try { rec.dim = normMpDim(m.dim); } catch (e2) {}
          if (!prev) rec.kind = String(e.kind || "mob").slice(0, 24);
          if (isFinite(+e.x)) rec.x = clampRemoteCoord(e.x);
          if (isFinite(+e.y)) rec.y = clampRemoteCoord(e.y);
         if (rec.rx == null) { rec.rx = rec.x; rec.ry = rec.y; }
         if (e.hp != null && isFinite(+e.hp)) rec.hp = clampRemoteHp(e.hp);
         if (isFinite(+e.face)) rec.face = +e.face;
          if (e.looted) rec.looted = true;
          if (e.tame) rec.tame = true;
          try { if (e.tsb != null && isFinite(+e.tsb)) rec.tsb = Math.max(0, +e.tsb); } catch (e2) {}
          if (e.boss) rec.boss = true;
           // fast channel now carries NPC identity + burrow flags (see sendSnapPos),
          // so joiners converge without waiting for the full snap
          if (e.name) rec.name = String(e.name).slice(0, 24);
          if (e.role) rec.role = String(e.role).slice(0, 16);
          if (e.tint) rec.tint = String(e.tint).slice(0, 16);
          if (e.lv) rec.lv = clampRemoteLv(e.lv);
          if (e.maxHp) rec.maxHp = Math.max(1, clampRemoteHp(e.maxHp));
          rec.sub = !!e.sub; rec.voidH = !!e.voidH;
          rec.dead = !!e.dead;
          rec.owner = m.from;
          rec.hostAuth = true;
          if (e.gold != null && isFinite(+e.gold)) rec.gold = Math.max(0, Math.round(+e.gold)); else delete rec.gold;
          rec.lastUpdate = nowP;
         if (!prev) rec.ts = nowP;
         try { pushNetSample(rec, rec.x, rec.y, nowP); } catch (e2) {}
         M.shared.set(id, rec);
       }
       return;
     }
       if (m.t === "ents") {
         if (m.from === M.hash) return;
         // v18: area batches are per-dim — drop cross-dim (legacy omits dim: accept).
         try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e) {}
         const list = Array.isArray(m.list) ? m.list : [];
         for (const e of list) {
           if (!e || typeof e.id !== "string") continue;
           const id = e.id.slice(0, 48);
           const prev = M.shared.get(id);
           // host snapshots always win over area-owner batches
           if (prev && prev.hostAuth && (Date.now() - (prev.lastUpdate || 0) < 4000) && String(m.from || "").toLowerCase() !== String(M.hostHash || "").toLowerCase()) {
           // still adopt wounds that are strictly worse (damage never lost)
             if (e.hp != null && isFinite(+e.hp) && +e.hp < (prev.hp || 1e9)) { prev.hp = +e.hp; prev.dead = prev.dead || !!e.dead; prev.lastUpdate = Date.now(); }
             continue;
           }
           const rec = prev || { id, rx: +e.x, ry: +e.y };
           if (!seqFresh(rec, (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null, m.from, m.ep, m.st)) continue;
           const ts = +e.ts || Date.now();
           if (prev && !prev.hostAuth && ts < (prev.ts || 0)) continue;
           try { rec.dim = normMpDim(m.dim != null ? m.dim : (e.dim != null ? e.dim : undefined)); } catch (e2) {}
           rec.kind = String(e.kind || (prev && prev.kind) || "mob").slice(0, 24);
           if (isFinite(+e.x)) rec.x = clampRemoteCoord(e.x);
           if (isFinite(+e.y)) rec.y = clampRemoteCoord(e.y);
          if (rec.rx == null) { rec.rx = rec.x; rec.ry = rec.y; }
          else if (Math.hypot((rec.x || 0) - rec.rx, (rec.y || 0) - (rec.ry || 0)) > 16) { rec.rx = rec.x; rec.ry = rec.y; }
          if (e.hp != null && isFinite(+e.hp)) rec.hp = clampRemoteHp(e.hp);
          if (e.maxHp != null && isFinite(+e.maxHp)) rec.maxHp = Math.max(1, clampRemoteHp(e.maxHp));
          if (e.lv) rec.lv = clampRemoteLv(e.lv);
          if (e.name) rec.name = String(e.name).slice(0, 24);
          if (e.role) rec.role = String(e.role).slice(0, 16);
          if (e.tint) rec.tint = String(e.tint).slice(0, 16);
          try { if (e.app && window.Appearance) rec.app = window.Appearance.unpack(e.app); } catch (e2) { }
         if (isFinite(+e.face)) rec.face = +e.face;
          if (e.looted) rec.looted = true;
          if (e.tame) rec.tame = true; else delete rec.tame;
          try { if (e.tsb != null && isFinite(+e.tsb)) rec.tsb = Math.max(0, +e.tsb); } catch (e2) {}
          if (e.boss) rec.boss = true;
          rec.sub = !!e.sub; rec.voidH = !!e.voidH;
          rec.dead = !!e.dead;
          rec.owner = m.from;
          rec.hostAuth = false;
          if (e.gold != null && isFinite(+e.gold)) rec.gold = Math.max(0, Math.round(+e.gold)); else delete rec.gold;
         try { pushNetSample(rec, rec.x, rec.y, Date.now()); } catch (e2) {}
          rec.ts = ts;
          rec.lastUpdate = Date.now();
          M.shared.set(id, rec);
        }
        try {
          if (M.shared.size > 220) {
            const now2 = Date.now();
            for (const [k, v] of M.shared) if (now2 - (v.lastUpdate || 0) > 30000) M.shared.delete(k);
          }
        } catch (e2) {}
        return;
      }
      if (m.t === "tile") {
        if (m.from === M.hash) return;
        try { if (Array.isArray(m.list) && m.list.length) applyTileList(m.list, m.dim); } catch (e) {}
        return;
      }
      if (m.t === "tileReq") {
        // joiner asks the HOST for missed ground edits (server only routes).
        // Only the host answers, from its own authoritative tile cache.
        try {
          if (!isHost()) return;
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          const cx = Math.round(Number(m.cx) || 0), cy = Math.round(Number(m.cy) || 0);
          const r = Math.max(0, Math.min(3, Number(m.r) || 0));
          if (cx < -200 || cx > 200 || cy < -200 || cy > 200) return;
          const reqId = String(m.reqId || "").slice(0, 16);
          if (!reqId) return;
          // v18: only the requester's dimension — same numbers, separate worlds.
          const qdim = normMpDim(m.dim);
          const out = [];
          for (const [k, t] of M.tileCache) {
            const mm2 = parseTileKey(k);
            if (!mm2) continue;
            if (mm2.dim !== qdim) continue;
            const ocx = mm2.cx, ocy = mm2.cy;
            if (Math.abs(ocx - cx) > r || Math.abs(ocy - cy) > r) continue;
            out.push({ cx: ocx, cy: ocy, lx: mm2.lx, ly: mm2.ly, t, dim: mm2.dim });
            if (out.length >= 800) break;
          }
          broadcastHot({ t: "tileRes", channelId: M.channelId, hash: M.hash, from: M.hash, to: String(m.from || "").slice(0, 64), reqId, dim: qdim, list: out }, { viaServer: true });
          // Full-chunk catch-up: tileCache only holds MP-session edits, so a
          // guest would otherwise miss everything the host built before
          // hosting (and everything after a host reload wiped the cache).
          // Serve the host's loaded chunks whole — same seed everywhere, so
          // differences from the guest's fresh bake ARE the host's builds.
          try { serveTileChunks(String(m.from || "").slice(0, 64), reqId, cx, cy, r, qdim); } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "tileRes") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          const reqId = String(m.reqId || "").slice(0, 16);
          const res = reqId && M.tileReqs.get(reqId);
          if (!res) return;
          M.tileReqs.delete(reqId);
          try { if (Array.isArray(m.list) && m.list.length) applyTileList(m.list, m.dim); } catch (e2) {}
          res(true);
        } catch (e) {}
        return;
      }
      if (m.t === "tileChunk") {
        // Host-authoritative whole chunk (see serveTileChunks). Applied even
        // without a pending request — the 8s top-up and the join fetch share
        // this path, and stamping identical tiles is a no-op. Non-host
        // senders are ignored (tile edits travel t:tile; full chunks only
        // come from the world owner).
        try {
          if (String(m.from || "").toLowerCase() !== String(M.hostHash || "").toLowerCase()) return;
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          const ccx = Math.round(Number(m.cx) || 0), ccy = Math.round(Number(m.cy) || 0);
          if (ccx < -200 || ccx > 200 || ccy < -200 || ccy > 200) return;
          const tiles = b64ToTiles(m.tiles);
          if (!tiles) return;
          try { applyTileChunk(ccx, ccy, tiles, m.dim); } catch (e2) {}
          try {
            const reqId = String(m.reqId || "").slice(0, 16);
            const res = reqId && M.tileReqs.get(reqId);
            if (res) { M.tileReqs.delete(reqId); res(true); }
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "poiReq") {
        // joiner asks the HOST for missed loot ops (opened chests / taken
        // caches). Only the host answers, from its authoritative world:
        // memory first, then a live scan of its loaded chunks (covers a host
        // reload that wiped M.poiOps but kept the opened husks on disk).
        try {
          if (!isHost()) return;
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          const cx = Math.round(Number(m.cx) || 0), cy = Math.round(Number(m.cy) || 0);
          const r = Math.max(0, Math.min(3, Number(m.r) || 0));
          if (cx < -200 || cx > 200 || cy < -200 || cy > 200) return;
          const reqId = String(m.reqId || "").slice(0, 16);
          if (!reqId) return;
          // v18: same numbers, separate worlds — answer only the requester's dim.
          const qdim = normMpDim(m.dim);
          const out = [];
          const seen = new Set();
          try {
            for (const [pkey, o] of M.poiOps) {
              if (!o) continue;
              const _pk = parsePoiKey(pkey);
              const _od = normMpDim((o && o.dim) || (_pk && _pk.dim));
              if (_od !== qdim) continue;
              const _bid = String((_pk && _pk.id) || pkey).slice(0, 48);
              const ocx = Math.round(+o.cx || 0), ocy = Math.round(+o.cy || 0);
              if (Math.abs(ocx - cx) > r || Math.abs(ocy - cy) > r) continue;
              out.push({ id: _bid, op: o.op === "removed" ? "removed" : "opened", cx: ocx, cy: ocy, dim: _od });
              seen.add(_od + ":" + _bid);
              if (out.length >= 80) break;
            }
          } catch (e2) {}
          // disk truth: opened husks in loaded chunks the memory map forgot
          try {
            const G = window.Game && window.Game.G;
            if (G && G.chunks && out.length < 80) {
              for (let ddy = -r; ddy <= r && out.length < 80; ddy++) for (let ddx = -r; ddx <= r && out.length < 80; ddx++) {
                let ch = null;
                let _wk = null;
                try { _wk = window.World.chunkKey(cx + ddx, cy + ddy, qdim); } catch (e2) {}
                try { ch = (_wk && G.chunks.get(_wk)) || G.chunks.get((cx + ddx) + "," + (cy + ddy)) || null; } catch (e2) {}
                if (!ch || !Array.isArray(ch.pois)) continue;
                try { if (ch.dim && ch.dim !== qdim) continue; } catch (e2) {}
                for (const poi of ch.pois) {
                  if (!poi || typeof poi.id !== "string") continue;
                  if (seen.has(qdim + ":" + poi.id) || seen.has(poi.id)) continue;
                  if (poi.type === "chest" && poi.opened) { out.push({ id: poi.id.slice(0, 48), op: "opened", cx: ch.cx | 0, cy: ch.cy | 0, dim: qdim }); seen.add(qdim + ":" + poi.id); }
                  else if (poi.type === "quest" && poi.taken) { out.push({ id: poi.id.slice(0, 48), op: "removed", cx: ch.cx | 0, cy: ch.cy | 0, dim: qdim }); seen.add(qdim + ":" + poi.id); }
                  if (out.length >= 80) break;
                }
              }
            }
          } catch (e2) {}
          broadcastHot({ t: "poiRes", channelId: M.channelId, hash: M.hash, from: M.hash, to: String(m.from || "").slice(0, 64), reqId, dim: qdim, list: out }, { viaServer: true });
        } catch (e) {}
        return;
      }
      if (m.t === "poiRes") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          const reqId = String(m.reqId || "").slice(0, 16);
          const res = reqId && M.poiReqs.get(reqId);
          if (!res) {
            // unsolicited (e.g. host push after a snap gap): still apply
            try { if (Array.isArray(m.list) && m.list.length) for (const e of m.list) { if (e && typeof e.id === "string") applyPoiOp(e.id.slice(0, 48), e.op === "removed" ? "removed" : "opened", +e.cx, +e.cy, e.dim != null ? e.dim : m.dim); } } catch (e2) {}
            return;
          }
          M.poiReqs.delete(reqId);
          try { if (Array.isArray(m.list) && m.list.length) for (const e of m.list) { if (e && typeof e.id === "string") applyPoiOp(e.id.slice(0, 48), e.op === "removed" ? "removed" : "opened", +e.cx, +e.cy, e.dim != null ? e.dim : m.dim); } } catch (e2) {}
          res(true);
        } catch (e) {}
        return;
      }
      if (m.t === "hostEnded") {
        // EXPLICIT host goodbye only (save & exit). Accidental drops never
        // send this — they just go quiet and may rejoin.
        try {
          if (String(m.from || "").toLowerCase() !== String(M.hostHash || "").toLowerCase()) return;
        } catch (e) { return; }
        handleHostEnded("relay");
        return;
      }
      if (m.t === "hit") {
        if (m.from === M.hash) return;
        if (typeof m.id !== "string") return;
        // host-side: the hit landed on the world server's sim — the victim
        // (and its guards) turn on the attacker's bubble, not thin air
        try { if (isHost() && window.Game && window.Game.noteRemoteHit) window.Game.noteRemoteHit(m.id.slice(0, 48), m.from); } catch (e2) {}
        const rec = M.shared.get(m.id.slice(0, 48));
        if (rec) {
          // concurrent wounds from stacked players must never heal each other:
          // only adopt strictly worse HP (damage never lost). Mirrors the
          // area-sim merge and the shared-delve dHit path. Stale higher HP
          // from a lagging bubble is ignored; the lowest wound wins.
          if (m.hp != null && isFinite(+m.hp)) {
            const newHp = Math.max(0, +m.hp);
            if (!(rec.hp != null && isFinite(+rec.hp)) || newHp < rec.hp) rec.hp = newHp;
          }
          if (m.dead) rec.dead = true;
          rec.lastUpdate = Date.now();
          try {
            const G = window.Game && window.Game.G;
            if (G) {
              const mob = (G.mobs || []).find(x => x && x.id === rec.id);
              if (mob) {
                // host truth is monotonic: never resurrect from a stale ping
                if (isFinite(+rec.hp)) {
                  mob.hp = Math.min(mob.hp, Math.max(0, +rec.hp));
                }
                if (rec.dead && mob.hp > 0) mob.hp = 0;
                if (mob.hp <= 0 && !mob.corpse) { try { window.Game.onKill(m.from, mob); } catch (e2) {} }
              } else {
                const npc = (G.npcs || []).find(x => x && x.id === rec.id);
                if (npc) {
                  if (isFinite(+rec.hp)) {
                    npc.hp = Math.min(npc.hp, Math.max(0, +rec.hp));
                  }
                  if (rec.dead && npc.hp > 0) npc.hp = 0;
                  // legacy wound path (pre-intent clients, fallback sims):
                  // stamp the death state too, or the victim sits at 0 HP
                  // with no corpse and the next tick auto-revives it.
                  if (npc.hp <= 0 && !npc.deadUntil && !npc.inParty) {
                    try { window.Game.onKill(m.from, npc); } catch (e2) {}
                  }
                }
              }
            }
          } catch (e2) {}
        } else {
          // hit for an entity we haven't seen: plant a wound so the next
          // snapshot/ents batch carries it instead of resurrecting the mob
          try { M.shared.set(m.id.slice(0, 48), { id: m.id.slice(0, 48), kind: "mob", x: NaN, y: NaN, rx: NaN, ry: NaN, hp: +m.hp, dead: !!m.dead, owner: m.from, ts: Date.now(), lastUpdate: Date.now() }); } catch (e2) {}
          try {
            const G = window.Game && window.Game.G;
            if (G) {
              const mob = (G.mobs || []).find(x => x && x.id === m.id);
              if (mob && isFinite(+m.hp)) { mob.hp = Math.min(mob.hp, Math.max(0, +m.hp)); if (m.dead && mob.hp > 0) mob.hp = 0; if (mob.hp <= 0 && !mob.corpse) { try { window.Game.onKill(m.from, mob); } catch (e2) {} } }
            }
          } catch (e2) {}
        }
        return;
      }
      if (m.t === "hurt") {
        // host-routed damage TO this client (its bubble is simulated on the
        // host). Only the addressed client applies it — armor, dodge, status
        // and death all resolve locally via Game.applyRemoteHurt.
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const amt = Math.max(1, Math.min(9999, Math.round(+m.amount || 0)));
          if (!(amt > 0)) return;
          let st = null;
          try { if (m.status && typeof m.status.type === "string") st = m.status; } catch (e2) { st = null; }
          try {
            if (window.Game && window.Game.applyRemoteHurt) window.Game.applyRemoteHurt(amt, {
              fromName: String(m.fromName || "Something").slice(0, 24),
              fromRole: String(m.fromRole || "").slice(0, 16),
              fromLv: m.fromLv | 0 || 1,
              srcId: (typeof m.srcId === "string") ? m.srcId : null,
              srcKind: String(m.srcKind || "").slice(0, 24),
              magic: !!m.magic, crit: !!m.crit, status: st,
              move: (typeof m.move === "string" && m.move) ? m.move.slice(0, 32) : null,
              // clone-indexed wound: lands on that copy, never the hero
              cloneIdx: (m.cl != null && isFinite(+m.cl)) ? (+m.cl | 0) : null,
            });
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "hitIntent") {
        // unified world-server intents: overworld blows resolve on the host,
        // delve blows resolve on the instance sim (host-preferred). Everyone
        // else ignores them — the outcome rides snapshots (overworld) or the
        // instance channel (delves).
        try {
          if (m.from === M.hash) return;
          if (!M.active) return;
          if (typeof m.id !== "string" || !m.id) return;
          const _did = (typeof m.did === "string" && m.did) ? m.did.slice(0, 48) : null;
          if (_did) {
            try {
              if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return;
            } catch (e) {}
            try { if (!amDungeonSim(_did)) return; } catch (e) { return; }
          } else {
            try {
              if (isHost()) { /* host resolves (game.js re-checks suspension) */ }
              else {
                if (Date.now() - (M.lastHostSnap || 0) < 6000) return;
                if (!amAreaSim()) return;
              }
            } catch (e) { return; }
          }
          if (window.Game && window.Game.handleHitIntent) window.Game.handleHitIntent(m.from, m);
        } catch (e) {}
        return;
      }
      if (m.t === "kcredit") {
        // host's kill credit for one of our intents: grant the local rewards
        // (XP/quest/guild) without touching the world (corpse/loot/death
        // mirror via snapshots). Only the addressed client applies it.
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          if (typeof m.id !== "string" || !m.id) return;
          try {
            if (window.Game && window.Game.applyKillCredit) window.Game.applyKillCredit(m);
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "phit") {
        // peer-routed wound TO this client's hero (PvP between heroes).
        // Only the addressed client applies it — armor, dodge, status and
        // death all resolve locally via Game.applyRemoteHurt, exactly like
        // host-routed hurt. Retaliation rides info.fromHash.
        // Allied senders never hurt: drop here too so an old/buggy sender
        // can't wound an ally even if it failed to block on its side.
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          try {
            const fh = String(m.fromHash || m.from || "").toLowerCase();
            if (fh && isAlliedHash(fh)) return;
          } catch (eA) {}
          const amt = Math.max(1, Math.min(9999, Math.round(+m.amount || 0)));
          if (!(amt > 0)) return;
          let st = null;
          try { if (m.status && typeof m.status.type === "string") st = m.status; } catch (e2) { st = null; }
          try {
            if (window.Game && window.Game.applyRemoteHurt) window.Game.applyRemoteHurt(amt, {
              fromName: String(m.fromName || "Something").slice(0, 24),
              fromRole: String(m.fromRole || "").slice(0, 16),
              fromLv: m.fromLv | 0 || 1,
              fromHash: String(m.fromHash || m.from || "").slice(0, 64),
              srcId: (typeof m.srcId === "string") ? m.srcId : null,
              srcKind: String(m.srcKind || "").slice(0, 24),
              magic: !!m.magic, crit: !!m.crit, status: st,
              move: (typeof m.move === "string" && m.move) ? m.move.slice(0, 32) : null,
              did: (typeof m.did === "string" && m.did) ? m.did.slice(0, 48) : null,
            });
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "dHurt") {
        // Owner-routed wound inside a shared delve (any owner can send).
        // Only the addressed client in the SAME instance applies it.
        // Allied senders never hurt (same drop as phit above).
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          try {
            const fh2 = String(m.fromHash || m.from || "").toLowerCase();
            if (fh2 && isAlliedHash(fh2)) return;
          } catch (eA2) {}
          const did = (typeof m.did === "string" && m.did) ? m.did : null;
          if (!did || did !== myDungeonId()) return;
          try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e) {}
          const amt = Math.max(1, Math.min(9999, Math.round(+m.amount || 0)));
          if (!(amt > 0)) return;
          let st = null;
          try { if (m.status && typeof m.status.type === "string") st = m.status; } catch (e2) { st = null; }
          try {
            if (window.Game && window.Game.applyRemoteHurt) window.Game.applyRemoteHurt(amt, {
              fromName: String(m.fromName || "Something").slice(0, 24),
              fromRole: String(m.fromRole || "").slice(0, 16),
              fromLv: m.fromLv | 0 || 1,
              fromHash: String(m.fromHash || m.from || "").slice(0, 64),
              srcId: (typeof m.srcId === "string") ? m.srcId : null,
              srcKind: String(m.srcKind || "").slice(0, 24),
              magic: !!m.magic, crit: !!m.crit, status: st,
              move: (typeof m.move === "string" && m.move) ? m.move.slice(0, 32) : null,
              did,
            });
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "dtak") {
        // damage feedback: a victim reports the TRUE post-armor wound (with
        // the move that dealt it) so the simulating client trains its mob's
        // per-target per-move memory off reality, not the routed estimate.
        // Only the client actually simulating that mob learns (remoteOwned
        // shadows stay dumb); shared delves check the instance.
        try {
          if (m.from === M.hash) return;
          const mobId = (typeof m.mob === "string" && m.mob) ? m.mob.slice(0, 48) : null;
          const dmg = Math.max(1, Math.min(9999, Math.round(+m.amount || 0)));
          if (!mobId || !(dmg > 0)) return;
          const G = window.Game && window.Game.G;
          if (!G || !G.player) return;
          try {
            const did = (typeof m.did === "string" && m.did) ? m.did : null;
            if (G.player.inDungeon) {
              let myDid = null;
              try { myDid = (G.dungeon && G.dungeon.id) || G.player.inDungeon; } catch (e2) { }
              if (!did || String(did) !== String(myDid)) return;
              try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && G.dungeon && G.dungeon.dim && m.dim !== G.dungeon.dim) return; } catch (e3) {}
            } else if (did) return;
          } catch (e2) { }
          const mob = (G.mobs || []).find((x) => x && x.id === mobId);
          if (!mob || !(mob.hp > 0) || mob.remoteOwned) return;
          try {
            if (mob.role !== "mob" || mob.isTame || mob.inParty) return;
          } catch (e2) { return; }
          const fromKey = "p:" + String(m.from || "").toLowerCase();
          const mv = (typeof m.move === "string" && m.move) ? m.move.slice(0, 32) : "steel:strike";
          try {
            if (window.Game && window.Game.applyTakenFeedback) window.Game.applyTakenFeedback(mobId, fromKey, dmg, mv);
          } catch (e2) { }
        } catch (e) { }
        return;
      }
      if (m.t === "dEnts") {
        // Shared-delve mob union: every occupant publishes what IT owns.
        // Merge into the dungeon hub; Game.syncDungeonToGame materializes.
        try {
          if (m.from === M.hash) return;
          const did = (typeof m.did === "string" && m.did) ? m.did.slice(0, 48) : null;
          if (!did) return;
          // v18: same did string exists in both dims — only same-dim delves share.
          try {
            const _md = normMpDim(m.dim);
            const G0 = window.Game && window.Game.G;
            const _ld = (G0 && G0.dungeon && (G0.dungeon.dim === "hell" || G0.dungeon.dim === "heaven" || G0.dungeon.dim === "surf")) ? G0.dungeon.dim : mpDim();
            if (_md !== _ld) return;
          } catch (e) {}
          try { M.lastDEnts = Date.now(); } catch (e2) {}
          try {
            if (Array.isArray(m.poi)) {
              for (const op of m.poi) {
                if (!op || typeof op.id !== "string") continue;
                applyDungeonPoiOp(op.id.slice(0, 64), op.op === "revealed" ? "revealed" : op.op === "looted" ? "looted" : "opened", did, op.dim != null ? op.dim : m.dim);
              }
            }
          } catch (e2) {}
          const list = Array.isArray(m.list) ? m.list : [];
          const now = Date.now();
          for (const e of list) {
            if (!e || typeof e.id !== "string") continue;
            const id = e.id.slice(0, 48);
            const prev = M.dShared.get(id);
            const rec = prev || { id, rx: +e.x, ry: +e.y };
            if (!seqFresh(rec, (m.sq != null && isFinite(+m.sq)) ? (+m.sq | 0) : null, m.from, m.ep, m.st)) continue;
            rec.did = did;
            try { rec.dim = normMpDim(m.dim); } catch (e2) {}
            rec.kind = String(e.kind || (prev && prev.kind) || "mob").slice(0, 24);
            if (isFinite(+e.x)) rec.x = clampRemoteCoord(e.x);
            if (isFinite(+e.y)) rec.y = clampRemoteCoord(e.y);
            if (rec.rx == null) { rec.rx = rec.x; rec.ry = rec.y; }
            if (e.hp != null && isFinite(+e.hp)) rec.hp = clampRemoteHp(e.hp);
            if (e.maxHp != null && isFinite(+e.maxHp)) rec.maxHp = Math.max(1, clampRemoteHp(e.maxHp));
            if (e.lv) rec.lv = clampRemoteLv(e.lv);
            if (e.name) rec.name = String(e.name).slice(0, 24);
            if (e.tint) rec.tint = String(e.tint).slice(0, 16);
            if (isFinite(+e.face)) rec.face = +e.face;
            if (e.looted) rec.looted = true;
            if (e.tame) rec.tame = true; else delete rec.tame;
            try { if (e.tsb != null && isFinite(+e.tsb)) rec.tsb = Math.max(0, +e.tsb); } catch (e2) {}
            if (e.gold != null && isFinite(+e.gold)) rec.gold = Math.max(0, Math.round(+e.gold)); else delete rec.gold;
            if (e.boss) rec.boss = true;
            // death timestamp for the 30s lord-respawn cooldown (cleared while live).
            if (e.dt != null && isFinite(+e.dt)) rec.dt = +e.dt;
            else if (!e.dead) delete rec.dt;
            if (e.portalMimic) rec.portalMimic = true;
            if (e.tricked) rec.tricked = true;
            if (e.exposed) rec.exposed = true;
            if (e.sub) rec.sub = true;
            rec.voidH = !!e.voidH;
            rec.dead = !!e.dead;
            rec.owner = m.from;
            rec.ts = +e.ts || now;
            rec.lastUpdate = now;
            try { pushNetSample(rec, rec.x, rec.y, now); } catch (e2) {}
            M.dShared.set(id, rec);
          }
          try {
            if (M.dShared.size > 300) {
              for (const [k, v] of M.dShared) if (now - (v.lastUpdate || 0) > 120000) M.dShared.delete(k);
            }
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "dHit") {
        // Wound to a shared delve mob, from anyone in the instance.
        // Adopt lower hp everywhere; the owner aggros the attacker's bubble.
        try {
          if (m.from === M.hash) return;
          const did = (typeof m.did === "string" && m.did) ? m.did : null;
          if (!did || typeof m.id !== "string") return;
          try {
            const _md = normMpDim(m.dim);
            const G0 = window.Game && window.Game.G;
            const _ld = (G0 && G0.dungeon && (G0.dungeon.dim === "hell" || G0.dungeon.dim === "heaven" || G0.dungeon.dim === "surf")) ? G0.dungeon.dim : mpDim();
            if (_md !== _ld) return;
          } catch (e) {}
          const id = m.id.slice(0, 48);
          const rec = M.dShared.get(id);
          if (rec) {
            if (m.hp != null && isFinite(+m.hp) && +m.hp < (rec.hp == null ? 1e9 : rec.hp)) rec.hp = +m.hp;
            if (m.dead) rec.dead = true;
            rec.lastUpdate = Date.now();
          } else {
            try { M.dShared.set(id, { id, kind: "mob", did, dim: normMpDim(m.dim), x: NaN, y: NaN, rx: NaN, ry: NaN, hp: +m.hp, dead: !!m.dead, owner: m.from, ts: Date.now(), lastUpdate: Date.now() }); } catch (e2) {}
          }
          try {
            const G = window.Game && window.Game.G;
            if (G && G.player && G.player.inDungeon && myDungeonId() === did) {
              try { if ((G.dungeon.dim === "hell" || G.dungeon.dim === "heaven" || G.dungeon.dim === "surf") && G.dungeon.dim !== normMpDim(m.dim)) return; } catch (e2) {}
              const mob = (G.mobs || []).find((x) => x && x.id === id);
              if (mob && isFinite(+m.hp)) {
                if (+m.hp < mob.hp) mob.hp = Math.max(0, +m.hp);
                if (m.dead && mob.hp > 0) mob.hp = 0;
                if (mob.hp <= 0 && !mob.corpse) { try { window.Game.onKill(m.from, mob); } catch (e2) {} }
                // owner turns the victim (and its pack) on the attacker's bubble
                try {
                  const me = String(M.hash || "").toLowerCase();
                  const oh = mob.ownerHash ? String(mob.ownerHash).toLowerCase() : null;
                  if ((!oh || oh === me) && window.Game.noteDungeonHit) window.Game.noteDungeonHit(id, m.from, did);
                } catch (e2) {}
              }
            }
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "dPoi") {
        try {
          if (typeof m.id !== "string" || !m.id) return;
          const did = (typeof m.did === "string" && m.did) ? m.did : null;
          if (!did) return;
          const op = m.op === "revealed" ? "revealed" : m.op === "looted" ? "looted" : "opened";
          const _dd = normMpDim(m.dim);
          const dedupe = "dpoi:" + _dd + ":" + did + ":" + m.id + ":" + op;
          if (netDedupe(dedupe)) return;
          applyDungeonPoiOp(m.id.slice(0, 64), op, did, m.dim);
        } catch (e) {}
        return;
      }
      if (m.t === "dLoot") {
        try {
          if (m.from === M.hash) return;
          if (typeof m.id !== "string" || !m.id) return;
          const did = (typeof m.did === "string" && m.did) ? m.did : null;
          if (!did) return;
          try {
            const _md = normMpDim(m.dim);
            const G0 = window.Game && window.Game.G;
            const _ld = (G0 && G0.dungeon && (G0.dungeon.dim === "hell" || G0.dungeon.dim === "heaven" || G0.dungeon.dim === "surf")) ? G0.dungeon.dim : mpDim();
            if (_md !== _ld) return;
          } catch (e) {}
          const dedupe = "dloot:" + normMpDim(m.dim) + ":" + did + ":" + m.id;
          if (netDedupe(dedupe)) return;
          const rec = M.dShared.get(m.id.slice(0, 48));
          if (rec) { rec.looted = true; rec.lastUpdate = Date.now(); }
          try {
            const G = window.Game && window.Game.G;
            if (G && G.player && G.player.inDungeon && myDungeonId() === did) {
              try { if ((G.dungeon.dim === "hell" || G.dungeon.dim === "heaven" || G.dungeon.dim === "surf") && G.dungeon.dim !== normMpDim(m.dim)) return; } catch (e2) {}
              const mo = (G.mobs || []).find((x) => x && x.id === m.id);
              if (mo && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
            }
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "act") {
        // another player's attack visuals (NO damage — wounds ride hit/hurt).
        // Same dungeon instance replays; other instances + surface ignore.
        try {
          if (m.from === M.hash) return;
          if (!M.active) return;
          try {
            const G = window.Game && window.Game.G;
            const inD = !!(G && G.player && G.player.inDungeon);
            const mdid = (typeof m.did === "string" && m.did) ? m.did : null;
            if (inD) { if (!mdid || mdid !== myDungeonId()) return; }
            else if (mdid) return;
            // v18: same numbers, separate worlds — cross-dim visuals never play.
            try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e3) {}
          } catch (e2) {}
          if (window.Game && window.Game.playRemoteAct) window.Game.playRemoteAct(m, m.from);
        } catch (e) {}
        return;
      }
      if (m.t === "revive") {
        try {
          if (m.from === M.hash) return;
          if (typeof m.id !== "string" || !m.id) return;
          try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e) {}
          if (window.Game && window.Game.applyRevive) window.Game.applyRevive(m.id.slice(0, 48), Math.max(1, Math.round(+m.hp || 0)), !!m.rv, (typeof m.did === "string" && m.did) ? m.did.slice(0, 48) : null, m);
        } catch (e) {}
        return;
      }
      if (m.t === "allyReq") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const reqId = String(m.reqId || "").slice(0, 16);
          if (!reqId) return;
          const from = String(m.from || "").toLowerCase();
          if (isAlliedHash(from)) return;
          M.allyReqs.set(reqId, { from, name: String(m.name || allyName(from) || "Traveler").slice(0, 16), ts: Date.now() });
          if (M.allyReqs.size > 8) { const fk = M.allyReqs.keys().next().value; M.allyReqs.delete(fk); }
          try { window.UI.toast("🤝 " + M.allyReqs.get(reqId).name + " wants to be your ally — see 🌐 presence to answer.", 6000); } catch (e) {}
          try { if (window.UI && window.UI.renderAllyState) window.UI.renderAllyState(); } catch (e) {}
        } catch (e) {}
        return;
      }
      if (m.t === "allyRes") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const reqId = String(m.reqId || "").slice(0, 16);
          const q = M.allyOut.get(reqId);
          if (!q) return;
          M.allyOut.delete(reqId);
          const from = String(m.from || "").toLowerCase();
          if (m.accept) {
            addAlly(from);
            try { window.UI.toast("🤝 " + allyName(from) + " is now your ally — no damage either way, and you share the Known World map.", 6000); } catch (e) {}
              // they may have woken towers before we allied — catch up either way.
              try { shareTowersWithNewAlly(); } catch (e) {}
              try { shareFragmentsWithNewAlly(); } catch (e) {}
              try { sharePeterSlainWithNewcomer(); } catch (e) {}
              try { shareCommissionsWithNewAlly(); } catch (e) {}
            } else {
              try { window.UI.toast("🤝 " + allyName(from) + " declined your ally request.", 4000); } catch (e) {}
          }
          try { if (window.UI && window.UI.renderAllyState) window.UI.renderAllyState(); } catch (e) {}
        } catch (e) {}
        return;
      }
      if (m.t === "allyRemove") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const from = String(m.from || "").toLowerCase();
          if (dropAlly(from)) {
            try { window.UI.toast("💔 " + allyName(from) + " ended your alliance.", 5000); } catch (e) {}
            try { if (window.UI && window.UI.renderAllyState) window.UI.renderAllyState(); } catch (e) {}
          }
        } catch (e) {}
        return;
      }
      if (m.t === "tradeOffer") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const offerId = String(m.offerId || "").slice(0, 16);
          if (!offerId || typeof m.id !== "string" || !m.id) return;
          const from = String(m.from || "").toLowerCase();
          const oup = Math.max(0, Math.min(5, (m.up | 0) || 0));
          let onick = "";
          try { onick = String(m.nick == null ? "" : m.nick).trim().replace(/\s+/g, " ").slice(0, 24); } catch (e) { onick = ""; }
          M.trade = { offerId, peer: from, peerName: allyName(from), dir: "in", myId: "", myN: 0, myUp: 0, myNick: "", theirId: m.id.slice(0, 40), theirN: Math.max(1, Math.min(99, m.n | 0 || 1)), theirUp: oup, theirNick: onick, stage: "offered", ts: Date.now() };
          try { window.UI.toast("⚖️ " + allyName(from) + " offers " + tradeItemLabel(m.id, { up: oup, nick: onick }) + " ×" + M.trade.theirN + " — open ⚖️ Trade to answer.", 7000); } catch (e) {}
          try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
        } catch (e) {}
        return;
      }
      if (m.t === "tradeCounter") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const offerId = String(m.offerId || "").slice(0, 16);
          const tr = M.trade;
          if (!tr || tr.offerId !== offerId || tr.dir !== "out") return;
          tr.theirId = (typeof m.id === "string") ? m.id.slice(0, 40) : "";
          tr.theirN = tr.theirId ? Math.max(1, Math.min(99, m.n | 0 || 1)) : 0;
          tr.theirUp = Math.max(0, Math.min(5, (m.up | 0) || 0));
          try { tr.theirNick = String(m.nick == null ? "" : m.nick).trim().replace(/\s+/g, " ").slice(0, 24); } catch (e) { tr.theirNick = ""; }
          tr.stage = "countered";
          try { window.UI.toast("⚖️ " + tr.peerName + (tr.theirId ? (" offers back " + tradeItemLabel(tr.theirId, { up: tr.theirUp, nick: tr.theirNick }) + " ×" + tr.theirN) : " asks for it as a gift") + " — approve in ⚖️ Trade.", 7000); } catch (e) {}
          try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
        } catch (e) {}
        return;
      }
      if (m.t === "tradeDecline") {
        try {
          if (String(m.to || "").toLowerCase() !== String(M.hash || "").toLowerCase()) return;
          if (m.from === M.hash) return;
          const offerId = String(m.offerId || "").slice(0, 16);
          if (M.trade && M.trade.offerId === offerId) {
            const nm = M.trade.peerName;
            M.trade = null;
            try { window.UI.toast("⚖️ " + (nm || "They") + " declined the trade.", 4000); } catch (e) {}
            try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
          }
        } catch (e) {}
        return;
      }
      if (m.t === "tame") {
        // someone tamed a shared beast: the wild mob is gone on every screen
        // (tamed, not slain — no corpse, no loot, no kill credit). The tamer
        // already owns their local beast; everyone else just deletes the husk.
        try {
          if (m.from === M.hash) return;
          if (typeof m.id !== "string" || !m.id) return;
          const tid = m.id.slice(0, 48);
          try {
            const G = window.Game && window.Game.G;
            const tdid = (typeof m.did === "string" && m.did) ? m.did : null;
            if (G && G.player) {
              if (G.player.inDungeon) {
                let mine = null;
                try { mine = (G.dungeon && G.dungeon.id) || G.player.inDungeon; } catch (e2) {}
                if (!tdid || String(tdid) !== String(mine)) return;
                try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && G.dungeon && G.dungeon.dim && m.dim !== G.dungeon.dim) return; } catch (e3) {}
              } else if (tdid) return;
              else { try { if ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") && m.dim !== mpDim()) return; } catch (e3) {} }
            }
          } catch (e2) {}
          const tdup = "tame:" + normMpDim(m.dim) + ":" + tid;
          if (netDedupe(tdup)) return;
          try { M.shared.delete(tid); } catch (e2) {}
          try { M.dShared.delete(tid); } catch (e2) {}
          try {
            const G = window.Game && window.Game.G;
            if (G) {
              const mo = (G.mobs || []).find((x) => x && x.id === tid);
              if (mo && !mo.corpse) G.mobs = (G.mobs || []).filter((x) => x !== mo);
            }
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "guildClaim") {
        try {
          if (m.from === M.hash) return;
          if (typeof m.uid !== "string" || !m.uid) return;
          if (window.Guild && window.Guild.onMpClaim) window.Guild.onMpClaim(m.uid.slice(0, 128), typeof m.boardId === "string" ? m.boardId.slice(0, 128) : "");
        } catch (e) {}
        return;
      }
      if (m.t === "guildCommNew") {
        try {
          if (m.from === M.hash) return;
          if (window.Guild && window.Guild.onMpCommNew && m.comm) window.Guild.onMpCommNew(m.comm);
        } catch (e) {}
        return;
      }
      if (m.t === "guildCommAccept") {
        try {
          if (m.from === M.hash) return;
          if (typeof m.cid !== "string" || !m.cid) return;
          if (window.Guild && window.Guild.onMpCommAccept) window.Guild.onMpCommAccept(m.cid.slice(0, 128), typeof m.by === "string" ? m.by.slice(0, 24) : "a traveler", m.from);
        } catch (e) {}
        return;
      }
      if (m.t === "guildCommDone") {
        try {
          if (m.from === M.hash) return;
          if (typeof m.cid !== "string" || !m.cid) return;
          if (window.Guild && window.Guild.onMpCommDone) window.Guild.onMpCommDone(m.cid.slice(0, 128), typeof m.doneBy === "string" ? m.doneBy.slice(0, 32) : "another traveler", (m.escrow && typeof m.escrow === "object") ? m.escrow : null);
        } catch (e) {}
        return;
      }
      if (m.t === "guildCommSync") {
        try {
          if (m.from === M.hash) return;
          // merges are idempotent and monotonic (done wins, accepts union),
          // so every burst applies with no dedupe and no rebroadcast.
          if (window.Guild && window.Guild.onMpCommSync) window.Guild.onMpCommSync(m);
        } catch (e) {}
        return;
      }
      if (m.t === "chat") {
        // idempotency key: the sender stamps each message with a unique cid,
        // so a doubled rpc (retry, double-click, double delivery) renders
        // once — both copies carry the same cid, the second is dropped here.
        // Messages from old clients (no cid) keep the legacy ts+text key.
        const cid = (typeof m.cid === "string" && m.cid) ? m.cid.slice(0, 96) : "";
        const did = cid ? "chatcid:" + cid : "chat:" + String(m.from) + ":" + String(m.ts) + ":" + String(m.text || "").slice(0, 40);
        if (netDedupe(did)) return;
        pushChat({ from: m.from, name: m.name, text: m.text, ts: m.ts });
        return;
      }
      if (m.t === "whisper") {
        if (m.to !== M.hash && m.from !== M.hash) return;
        const wcid = (typeof m.cid === "string" && m.cid) ? m.cid.slice(0, 96) : "";
        const did = wcid ? "whcid:" + wcid : "wh:" + String(m.from) + ":" + String(m.ts) + ":" + String(m.text || "").slice(0, 40);
        // cid messages always dedupe (covers our own relay echo, which we
        // already rendered locally); legacy messages keep the old p2p-only
        // rule so old-client behavior is unchanged.
        if (wcid) { if (netDedupe(did)) return; }
        else if (via === "p2p" && netDedupe(did)) return;
        pushChat({ from: m.from, name: m.name, text: m.text, ts: m.ts, whisper: true, to: m.to });
        try { window.UI.toast("💬 " + m.name + " (whisper): " + String(m.text).slice(0, 80), 5000); } catch (e) {}
        return;
      }
      if (m.t === "poi") {
        // shared lootable mutation (overworld chest opened / quest cache
        // taken). Monotonic (opened stays opened, removed stays removed) so
        // last-write-wins is safe; deduped by op so a doubled relay applies once.
        try {
          if (typeof m.id !== "string" || !m.id || m.id.length > 48) return;
          const op = m.op === "removed" ? "removed" : "opened";
          const _pdim = normMpDim(m.dim);
          const did = "poi:" + _pdim + ":" + m.id + ":" + op;
          if (netDedupe(did)) return;
          applyPoiOp(m.id, op, +m.cx, +m.cy, m.dim);
        } catch (e) {}
        return;
      }
      if (m.t === "loot") {
        // shared corpse raided elsewhere: mark it looted here so it renders
        // raided and can't be raided twice. Sender already applied locally.
        try {
          if (m.from === M.hash) return;
          if (typeof m.id !== "string" || !m.id || m.id.length > 48) return;
          const did = "loot:" + m.id;
          if (netDedupe(did)) return;
          const rec = M.shared.get(m.id);
          if (rec) { rec.looted = true; rec.lastUpdate = Date.now(); }
          try {
            const G = window.Game && window.Game.G;
            if (G) {
              const mo = (G.mobs || []).find(x => x && x.id === m.id);
              if (mo && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
              else {
                const n = (G.npcs || []).find(x => x && x.id === m.id);
                if (n && !n.looted) n.looted = true;
              }
            }
          } catch (e2) {}
        } catch (e) {}
        return;
      }
      if (m.t === "hellTowers") {
        // a woken ally's unlock is every ally's unlock (the wake itself
        // always originates from a Hell Sphere). Strangers' wakes stay theirs.
        try {
          if (!m.from || m.from === M.hash) return;
          if (netDedupe("hellTowers:" + String(m.from).toLowerCase())) return;
          if (!isAlliedHash(m.from)) return;
          applyAllyHellTowers(String(m.from).toLowerCase(), m.name);
        } catch (e) {}
        return;
      }
      if (m.t === "peterSlain") {
        // the Fallen fell on someone's screen: close the campaign here too.
        // Same-instance witnesses get the epilogue + sphere + teleport home;
        // everyone else completes silently (no teleport, no sphere).
        try {
          if (!m.from || m.from === M.hash) return;
          if (netDedupe("peterSlain:" + String(m.from).toLowerCase() + ":" + String(m.did || ""))) return;
          applyRemotePeterSlain(m.did);
        } catch (e) {}
        return;
      }
      if (m.t === "fragClaim" || m.t === "fragSync") {
        // first traveler through takes the delve: record it as spent
        // (no shard for us). Channel-wide like loot — no ally gate.
        // Simultaneous claims resolve deterministically on the hub-stamped
        // ts (ties break to the lower hash): the loser revokes their double
        // so exactly one hero holds each dungeon's shard.
        try {
          if (!m.from || m.from === M.hash) return;
          const bids = m.t === "fragSync" && Array.isArray(m.bids) ? m.bids : [m.bid];
          const tsArr = m.t === "fragSync" && Array.isArray(m.bidTs) ? m.bidTs : null;
          const tag = m.t === "fragSync" ? "fragsync" : "fragclaim";
          const me = String(M.hash || "").toLowerCase();
          for (let bi = 0; bi < bids.length; bi++) {
            const raw = bids[bi];
            const bid = String((raw && raw.b) || raw || "").replace(/_L\d+$/, "").slice(0, 64);
            if (!bid) continue;
            if (netDedupe(tag + ":" + String(m.from).toLowerCase() + ":" + bid)) continue;
            let sts = 0;
            try {
              const cand = tsArr ? +tsArr[bi] : +m.ts;
              if (isFinite(cand) && cand > 0) sts = Math.min(cand, 4100000000000);
            } catch (eTs) { sts = 0; }
            let revoked = false;
            try {
              // live claims always carry the hub ts; sync entries without one
              // never revoke (legacy/unknown age loses to a known claim).
              if (sts > 0 && window.Hell && window.Hell.ownsFragmentBid && window.Hell.ownsFragmentBid(bid) && window.Hell.claimTsFor && window.Hell.revokeFragmentClaim) {
                const mineRaw = window.Hell.claimTsFor(bid);
                const mine = (isFinite(+mineRaw) && +mineRaw > 0) ? +mineRaw : 0;
                if (mine >= 0 && (sts < mine || (sts === mine && String(m.from).toLowerCase() < me))) {
                  revoked = !!window.Hell.revokeFragmentClaim(bid, m.name);
                }
              }
            } catch (eRv) { revoked = false; }
            if (!revoked) { try { applyRemoteFragmentClaim(bid, m.name); } catch (e2) {} }
          }
        } catch (e) {}
        return;
      }
      if (m.t === "join") {
        if (m.hash === M.hash) return;
        try { window.UI.toast("🌐 " + (m.name || "A traveler") + " entered the channel.", 3000); } catch (e) {}
        try { refreshPeers(); } catch (e) {}
        // existing members dial the newcomer when we are the lower hash
        try { if (String(M.hash || "") < String(m.hash || "")) ensurePeer(m.hash, true); } catch (e) {}
        // catch-up burst: the newcomer missed our tower wake + delve claims.
        // They accept what they missed (fresh dedupe); old hands drop the
        // repeat. Throttled so a join wave never spams the channel.
        try {
          setTimeout(() => {
            try {
              if (!M.active) return;
              const now = Date.now();
              if (now - (M._shareAt || 0) < 10000) return;
              M._shareAt = now;
              try { shareTowersWithNewAlly(); } catch (e2) {}
              try { shareFragmentsWithNewAlly(); } catch (e2) {}
              try { sharePeterSlainWithNewcomer(); } catch (e2) {}
              try { shareCommissionsWithNewAlly(); } catch (e2) {}
            } catch (e2) {}
          }, 2000);
        } catch (e) {}
        return;
      }
      if (m.t === "leave") {
        if (m.hash === M.hash) return;
        M.remotes.delete(m.hash);
        try { const r = M.peers.get(m.hash); if (r) { try { r.pc.close(); } catch (e2) {} M.peers.delete(m.hash); } } catch (e) {}
        // No migration: the world lives on the host's machine. If the host
        // just vanished WITHOUT an explicit hostEnded, it was an accident —
        // stay in the world and wait for them to rejoin (only hostEnded kicks).
        try {
          if (String(m.hash || "").toLowerCase() === String(M.hostHash || "").toLowerCase()) {
            window.UI.toast("🌐 The host disconnected — holding the world, waiting for them to return…", 5000);
          } else {
            window.UI.toast("🌐 A traveler left the channel.", 3000);
          }
        } catch (e) {}
        try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
        return;
      }
      if (m.t === "host") {
        if (m.host) { M.hostHash = String(m.host).toLowerCase(); try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {} }
        return;
      }
      if (m.t === "kicked") {
        if (String(m.hash || "").toLowerCase() === String(M.hash || "").toLowerCase()) {
          try { window.UI.toast("🚪 The host removed you from the channel.", 5000); } catch (e) {}
          try { leaveChannel(false); } catch (e2) {}
          try { if (window.UI.quitToTitle) window.UI.quitToTitle(false); } catch (e2) {}
          return;
        }
        M.remotes.delete(m.hash);
        try { const r = M.peers.get(m.hash); if (r) { try { r.pc.close(); } catch (e2) {} M.peers.delete(m.hash); } } catch (e) {}
        try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
        return;
      }
      if (m.t === "give") {
        const gup = Math.max(0, Math.min(5, (m.up | 0) || 0));
        let gnick = "";
        try { gnick = String(m.nick == null ? "" : m.nick).trim().replace(/\s+/g, " ").slice(0, 24); } catch (e) { gnick = ""; }
        const did = "give:" + String(m.from) + ":" + String(m.to) + ":" + String(m.id) + ":" + String(m.n) + ":" + gup + ":" + gnick + ":" + String(m.ts || "");
        if (netDedupe(did)) return;
        if (m.to === M.hash) {
          try {
            window.Items.addItem(window.Game.G.player, m.id, m.n, { up: gup, nick: gnick });
            // hell fragments arrive WITH their delve-claims: the handed bids
            // become OURS (spent-markers cleared) so the pooled hero can reach
            // 12/12 and forge the sphere. Spheres just work — E on a far
            // tower wakes the whole network.
            try {
              if (m.id === "hell_fragment" && window.Hell && window.Hell.receiveFragmentBids) {
                window.Hell.receiveFragmentBids(m.bids, m.n | 0 || 1, m.fromName);
              } else if (m.id === "hell_sphere" && window.UI && window.UI.toast) {
                window.UI.toast("🔮 A Hell Sphere hums in your pack — E on a far hell tower (1000 out) to wake every tower.", 6000);
              }
            } catch (eH) {}
            try { if (window.UI && window.UI.onTradeGive) window.UI.onTradeGive(m); } catch (e) {}
            // trade auto-complete (B side): the offer we countered just got
            // approved — our counter-item flies back automatically, no clicks.
            try {
              const ref = (typeof m.ref === "string" && m.ref) ? m.ref.slice(0, 16) : "";
              const tr = M.trade;
              if (ref && tr && tr.offerId === ref && tr.dir === "in" && tr.stage === "countered") {
                tr.stage = "done";
                if (tr.myId) {
                const backId = tr.myId, backN = tr.myN, backV = { up: tr.myUp || 0, nick: tr.myNick || "" };
                (async () => {
                  try {
                    await give(String(m.from || "").toLowerCase(), backId, backN, undefined, backV);
                    window.UI.toast("⚖️ Trade complete — you give " + itemLabel(backId, backV) + " ×" + backN + " back.", 6000);
                  } catch (e2) { window.UI.toast("⚠️ " + (e2.message || "Counter-give failed."), 5000); }
                  try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e3) {}
                })();
                } else {
                  try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e3) {}
                }
              }
            } catch (e) {}
            window.Game.saveGame(true);
            try { window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) {}
            window.UI.toast("🎁 " + (m.fromName || "A traveler") + " gave you " + m.n + "× " + itemLabel(m.id, { up: gup, nick: gnick }) + ".", 5000);
          } catch (e) {}
        } else if (m.from !== M.hash) {
          pushSys("🎁 " + (m.fromName || "Someone") + " gave " + m.n + "× " + itemLabel(m.id, { up: gup, nick: gnick }) + ".");
        }
        return;
      }
      if (m.t === "heal") {
        const did = "heal:" + String(m.from) + ":" + String(m.to) + ":" + String(m.amount) + ":" + String(m.ts || "");
        if (netDedupe(did)) return;
        if (m.to === M.hash) {
          try {
            const p = window.Game.G.player;
            p.hp = Math.min(p.maxHp, p.hp + m.amount);
            try { window.Game.addFloatText(p.x, p.y - 0.5, "+" + m.amount, "#5dd68a"); } catch (e) {}
            try { window.Sfx.heal(); } catch (e) {}
            window.UI.toast("💚 " + (m.fromName || "A traveler") + " heals you (+" + m.amount + " HP).", 4000);
            try { window.UI.updateHUD(); } catch (e) {}
          } catch (e) {}
        }
        return;
      }
      if (m.t === "sleep") {
        M.sleepInfo = { sleeping: m.sleeping | 0, online: m.online | 0 };
        try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
        return;
      }
      if (m.t === "sleepDone") {
        onSleepDone(m.dayTime);
        return;
      }
      if (m.t === "partyMax") {
        try {
          const _pm = clampPartyMax(+m.partyMax);
          if (_pm !== M.partyMax) {
            M.partyMax = _pm;
            try { pushSys("👥 Party cap is now " + _pm + " companion" + (_pm === 1 ? "" : "s") + " per player (host setting)."); } catch (e2) {}
            try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e2) {}
          }
        } catch (e) {}
        return;
      }
      if (m.t === "reincarnate") {
        if (m.hash !== M.hash) {
          try { window.UI.toast("♻️ " + (m.name || "A traveler") + " reincarnated — a new soul walks the vale.", 4000); } catch (e) {}
          refreshPeers();
        }
        return;
      }
    } catch (e) {}
  }
  // Explicit host end-of-stream ONLY (save & exit). Pops the "host has
  // ended the stream" notice and kicks everyone to the title immediately.
  // Never called for accidental disconnects — those just reconnect.
  async function handleHostEnded(via) {
    if (!M.active || M.ended) return;
    M.ended = true;
    const id = M.channelId, myHash = M.hash;
    let wasHost = false;
    try { wasHost = isHost(); } catch (e) {}
    if (wasHost) return; // ignore our own echo
    try { window.UI.toast("📡 The host has ended the stream — returning to the title.", 6000); } catch (e) {}
    try { pushSys("📡 The host has ended the stream."); } catch (e) {}
    // Clear any pending sleep vote: sleeping flags are ephemeral and the
    // stream is over, so a stranded sleeper must never block the next join.
    try { M.sleepInfo = { sleeping: 0, online: 1 }; } catch (e) { }
    try { if (window.Game && window.Game.G) window.Game.G.sleepVote = null; } catch (e) { }
    // Keep the hero + visited link: the world stays under Visited Worlds and
    // rejoining restores the hero once the host is back online (ping first).
    try { await saveChannelHero(); } catch (e) {}
    try { await leaveChannel(true); } catch (e) {}
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
    try { if (window.UI.quitToTitle) await window.UI.quitToTitle(false); } catch (e) {}
  }
  // Host migration is gone: the world lives on the host's machine, so there
  // is no next-in-line. Kept as a quiet no-op for old callers.
  async function tryClaimHost() {
    return { ok: false, host: M.hostHash || null };
  }
  async function kickMember(targetHash) {
    if (!M.active) throw new Error("Not in a channel.");
    const raw = await rpc("mpKick", { channelId: M.channelId, hash: M.hash, target: String(targetHash || "").toLowerCase() });
    return JSON.parse(raw);
  }
  function itemLabel(id, variant) {
    try {
      const it = window.Items.ITEMS[id];
      if (it) {
        let nm = it.name;
        try {
          if (variant && (variant.up > 0 || variant.nick) && window.Items.variantName) {
            nm = window.Items.variantName({ id, up: variant.up, nick: variant.nick });
            if ((variant.up | 0) > 0) nm += " +" + ((variant.up | 0) * ((window.Items && window.Items.GEAR_UP_PCT) || 50)) + "%";
          }
        } catch (e) { }
        return nm;
      }
    } catch (e) {}
    return String(id).replace(/_/g, " ");
  }
  function pushChat(c) {
    M.chat.push(c);
    if (M.chat.length > 80) M.chat = M.chat.slice(-80);
    try { if (window.UI.renderMpChat) window.UI.renderMpChat(); } catch (e) {}
  }
  function pushSys(text) {
    M.chat.push({ sys: true, text, ts: Date.now() });
    if (M.chat.length > 80) M.chat = M.chat.slice(-80);
    try { if (window.UI.renderMpChat) window.UI.renderMpChat(); } catch (e) {}
  }
  // The server keeps no world state (no chat history, no entity hub, no
  // clock): join only learns the session directory (host + members). The
  // living world arrives live from the host (snap/pos/tiles over P2P+relay).
  function applyJoin(j) {
    M.spawnType = j.spawnType; M.spawnName = j.spawnName;
    // Clock comes from the host's live snapshots, not the join reply. The hub
    // sends a constant compat filler; never let it clobber the local clock.
    M.hostHash = j.host ? String(j.host).toLowerCase() : (M.hostHash || null);
    try { if (j && isFinite(+j.partyMax)) M.partyMax = clampPartyMax(+j.partyMax); } catch (e) {}
    M.chat = [];
    M.shared.clear(); M.dShared.clear(); M.dPoiOps.clear();
    try { loadAllies(); } catch (e) {}
    M.ended = false;
    const members = Array.isArray(j.members) ? j.members : (Array.isArray(j.players) ? j.players : []);
    for (const p of members) {
      if (!p || p.hash === M.hash) continue;
      const r = M.remotes.get(p.hash) || { hash: p.hash };
      if (p.name) r.name = String(p.name).slice(0, 16);
      // no positions here — live pos events fill them in within ~120ms
      if (r.rx == null) { r.rx = r.x; r.ry = r.y; }
      r.lastUpdate = r.lastUpdate || 0;
      M.remotes.set(p.hash, r);
    }
    try { if (window.UI.renderMpChat) window.UI.renderMpChat(); } catch (e) {}
    try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
    // late-join coverage: fellow travelers who woke towers or claimed delves
    // while we were away re-share on seeing us (see the join handler), and we
    // re-share ours a moment later — whoever missed what converges either way.
    // Throttled: at most one catch-up burst per 10s per client.
    try {
      setTimeout(() => {
        try {
          if (!M.active) return;
          const now = Date.now();
          if (now - (M._shareAt || 0) < 10000) return;
          M._shareAt = now;
              try { shareTowersWithNewAlly(); } catch (e2) {}
              try { shareFragmentsWithNewAlly(); } catch (e2) {}
              try { sharePeterSlainWithNewcomer(); } catch (e2) {}
              try { shareCommissionsWithNewAlly(); } catch (e2) {}
            } catch (e2) {}
          }, 2500);
        } catch (e) {}
  }
  async function refreshPeers() {
    if (!M.active || !M.sockOpen) return;
    try {
      const raw = await rpc("mpPeers", { channelId: M.channelId });
      const j = JSON.parse(raw);
      // The host ended the stream while we were away: leave with the notice.
      if (j && j.ended) { handleHostEnded("peers"); return; }
      const members = Array.isArray(j.members) ? j.members : (Array.isArray(j.players) ? j.players : []);
      const seen = new Set();
      for (const p of members) {
        if (!p || !p.hash || p.hash === M.hash) continue;
        seen.add(p.hash);
        const r = M.remotes.get(p.hash) || { hash: p.hash };
        if (p.name) r.name = String(p.name).slice(0, 16);
        if (r.rx == null) { r.rx = r.x; r.ry = r.y; }
        if (!r.lastUpdate) r.lastUpdate = 0;
        M.remotes.set(p.hash, r);
      }
      // Drop only members the hub no longer lists AND silent >60s (pos may
      // just be paused while typing). Never kick on silence alone.
      for (const k of [...M.remotes.keys()]) if (!seen.has(k)) {
        const r = M.remotes.get(k);
        if (!r.lastUpdate || Date.now() - r.lastUpdate > 60000) M.remotes.delete(k);
      }
      if (j.host) {
        const nh = String(j.host).toLowerCase();
        if (nh !== (M.hostHash || null)) { M.hostHash = nh; }
      }
      M.sleepInfo = { sleeping: j.sleeping | 0, online: j.online | 0 };
      try { if (j && isFinite(+j.partyMax)) { const _npm = clampPartyMax(+j.partyMax); if (_npm !== M.partyMax) { M.partyMax = _npm; try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e2) {} } } } catch (e) {}
      try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
      // shared ground top-up: ask the HOST for wreckage (smashed walls etc.)
      // made while we were looking elsewhere — cheap 5x5-chunk pull every 8s
      try {
        const G = window.Game && window.Game.G;
        if (G && G.player && !G.player.inDungeon) {
          try { fetchTiles(G.player.x, G.player.y, 2); } catch (e2) {}
          // loot top-up: opened chests / taken caches near us (covers dropped
          // poi ops + host reloads that wiped the host's in-memory map)
          try { requestPoisFromHost(G.player.x, G.player.y, 2); } catch (e3) {}
        }
      } catch (e) {}
      // No host migration: the world lives on the host's machine. A quiet
      // host is an accidental drop — hold the world, never kick, never claim.
    } catch (e) {}
  }
  // ---- local MP hero: your hero lives on YOUR machine ----
  // One hero record per player per world (chero_<WORLD>_<hash>), host and
  // guest alike — the world id namespaces both sides. No progression is
  // ever sent off-machine.
  function chanHeroStore() {
    try { if (window.LocalKv && window.LocalKv.psave) return window.LocalKv.psave; } catch (e) {}
    try { if (window.root && window.root.kv && window.root.kv.psave) return window.root.kv.psave; } catch (e) {}
    return null;
  }
  function chanHeroKey() {
    try { if (window.World && window.World.chanHeroKey) return window.World.chanHeroKey(M.channelId, M.hash); } catch (e) {}
    return "chero_" + String(M.channelId || "") + "_" + String(M.hash || "");
  }
  function buildChannelHero() {
    const G = window.Game.G, p = G.player;
    const strip = (o) => {
      try {
        const c = { ...o, targetRef: null, cooldowns: {}, buffs: {}, waveRide: null, feint: null };
        c.slowUntil = 0; c.burnUntil = 0; c.burnTick = 0;
        c.hostileUntil = 0; c.atkCd = 0; c.aidCd = 0;
        // Hit-flash / attack-pose / death-fall / status visuals are
        // performance.now() timestamps too — never persist them, or a reload
        // inherits a near-permanent white box (see stripCombatPtr).
        c.hurtUntil = 0; c.hurtAng = 0;
        c.atkUntil = 0; c.atkKind = null; c.atkDur = 0;
        c._deadAt = 0; c._statusFlashUntil = 0; c._statusFlashColor = null;
        c.status = {};
        try {
          if (Array.isArray(c.tames)) c.tames = c.tames.map(t => {
            if (!t || typeof t !== "object") return t;
            const b = { ...t, targetRef: null };
            b.hurtUntil = 0; b.hurtAng = 0;
            b.atkUntil = 0; b.atkKind = null; b.atkDur = 0;
            b._deadAt = 0; b._statusFlashUntil = 0; b._statusFlashColor = null;
            b.status = {};
            return b;
          });
        } catch (eT) { }
        // Parry/mirror timers are performance.now()/1000 timestamps — never
        // persist them, or a reload inherits a phantom guard (see stripCombatPtr).
        c.parryUntil = 0; c.parryCdUntil = 0; c.reflectUntil = 0;
        return c;
      } catch (e) { return o; }
    };
    return {
      v: 1, player: strip(p),
      dayTime: G.dayTime, explored: [...(G.explored || [])].slice(-2000),
      torches: G.torches || p.torches || [],
      time: Date.now(),
    };
  }
  // IndexedDB structured-clone rejects functions/DOM refs (throws, and the
  // LocalKv fallback copy would then be invisible to later reads). Hero
  // snapshots spread the live player object, so scrub through JSON first:
  // functions drop out, plain data survives. Circular shapes fall back raw.
  function cloneForStore(v) {
    try { const s = JSON.stringify(v); if (s == null) return v; return JSON.parse(s); }
    catch (e) { return v; }
  }
  async function saveChannelHero() {
    if (!M.active || !M.channelId || !M.hash) return false;
    try {
      const rec = cloneForStore(buildChannelHero());
      const st = chanHeroStore();
      if (st) { await st.set(chanHeroKey(), rec); return true; }
      try { localStorage.setItem("emberhold-" + chanHeroKey(), JSON.stringify(rec)); return true; } catch (e) { return false; }
    } catch (e) { return false; }
  }
  async function loadChannelHero() {
    try {
      const st = chanHeroStore();
      if (st) {
        const rec = await st.get(chanHeroKey());
        if (rec && rec.player) return rec;
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem("emberhold-" + chanHeroKey());
      if (raw) { const rec = JSON.parse(raw); if (rec && rec.player) return rec; }
    } catch (e) {}
    return null;
  }
  // ---- remembered characters (host persists every traveler's hero) ----
  function visitorKey(worldId) { return "mvisitors_" + String(worldId || M.channelId || "").toUpperCase(); }
  function tileCacheKey(worldId) { return "mtiles_" + String(worldId || M.channelId || "").toUpperCase(); }
  function buildVisitorSnapshot() {
    try {
      const rec = buildChannelHero();
      if (!rec || !rec.player) return null;
      return {
        v: 1, player: rec.player,
        torches: Array.isArray(rec.torches) ? rec.torches.slice(0, 200) : [],
        explored: Array.isArray(rec.explored) ? rec.explored.slice(-500) : [],
        dayTime: rec.dayTime, time: Date.now(),
      };
    } catch (e) { return null; }
  }
  function normalizeVisitor(vH) {
    try {
      if (!vH || !vH.player || typeof vH.player.name !== "string" || !vH.player.name) return null;
      const lv = vH.player.lv | 0;
      if (!(lv >= 1 && lv <= 125)) return null;
      // Deep-copy: the player object lives in host memory and the rejoin
      // restore mutates what it builds (syncRace adjusts stats in place).
      // Without this, restoring from a visitor copy would corrupt the host's
      // remembered snapshot (and alias live arrays into it).
      let pl = vH.player;
      try { pl = JSON.parse(JSON.stringify(vH.player)); } catch (e) { pl = { ...vH.player }; }
      return {
        player: pl,
        torches: Array.isArray(vH.torches) ? vH.torches : [],
        explored: Array.isArray(vH.explored) ? vH.explored : [],
        dayTime: vH.dayTime, time: vH.time || 0,
        msFlags: (vH.msFlags && typeof vH.msFlags === "object") ? vH.msFlags : undefined,
      };
    } catch (e) { return null; }
  }
  async function sendVisitorSnapshot() {
    // Guests report their character to the host (memory now, disk on flush).
    if (!M.active || isHost() || !M.sockOpen || !M.hash) return false;
    try {
      const hero = buildVisitorSnapshot();
      if (!hero) return false;
      await rpc("mpVisitorSave", { channelId: M.channelId, hero });
      return true;
    } catch (e) { return false; }
  }
  async function seedVisitorsFromDisk(worldId) {
    // Host only: load remembered characters + tile overrides into the Hub at open.
    try {
      const st = chanHeroStore();
      if (!st) return false;
      if (window.MPHost && window.MPHost.Hub.seedVisitors) {
        let saved = null;
        try { saved = await st.get(visitorKey(worldId)); } catch (e) {}
        if (saved && saved.visitors) {
          try { window.MPHost.Hub.seedVisitors(saved.visitors); } catch (e) {}
        }
      }
      // Tile overrides persist across host reloads (MP-session edits live
      // here; without this a host restart wiped them and guests rejoining
      // lost every shared build until someone rebuilt it).
      try {
        const ts = await st.get(tileCacheKey(worldId));
        if (ts && Array.isArray(ts.tiles)) {
          M.tileCache.clear();
          for (const e of ts.tiles.slice(-2500)) {
            if (Array.isArray(e) && typeof e[0] === "string" && isFinite(Number(e[1]))) {
              try { M.tileCache.set(e[0], e[1] | 0); } catch (e2) {}
            }
          }
        }
      } catch (e) {}
      return true;
    } catch (e) {}
    return false;
  }
  async function flushVisitorsToDisk(force) {
    // Host only: persist remembered characters (throttled; forced on end).
    try {
      if (!M.active || !isHost()) return false;
      const now = Date.now();
      if (!force && now - (M._visFlushAt || 0) < 30000) return false;
      M._visFlushAt = now;
      let vis = null;
      try { vis = (window.MPHost && window.MPHost.Hub.getVisitors) ? window.MPHost.Hub.getVisitors() : null; } catch (e) {}
      if (!vis) return false;
      const st = chanHeroStore();
      if (!st) return false;
      try { await st.set(visitorKey(), cloneForStore({ v: 1, visitors: vis, time: now })); } catch (e) { return false; }
      try {
        if (M.tileCache && M.tileCache.size) {
          await st.set(tileCacheKey(), cloneForStore({ v: 1, tiles: [...M.tileCache].slice(-2500), time: now }));
        } else {
          try { await st.delete(tileCacheKey()); } catch (e2) {}
        }
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  async function saveNow() {
    if (!M.active) return false;
    // The hero lives here now (local channel record), not on the server.
    // The mpSave RPC is a legacy no-op stub — best effort, ignored.
    let heroOk = false;
    try { heroOk = await saveChannelHero(); } catch (e) { heroOk = false; }
    if (!heroOk) {
      try { if (window.UI && window.UI.toast) window.UI.toast("⚠️ Channel hero save FAILED — storage blocked or full? Progress may not restore on rejoin.", 6000); } catch (e2) { }
      return false;
    }
    try { M.lastSaveT = Date.now(); } catch (e2) {}
    // Character memory: host flushes visitors to disk (throttled), guests
    // report their hero (throttled) — the world remembers every traveler.
    try {
      if (isHost()) { try { await flushVisitorsToDisk(false); } catch (e) {} }
      else if (Date.now() - (M._visSentAt || 0) > 60000) {
        M._visSentAt = Date.now();
        try { await sendVisitorSnapshot(); } catch (e) {}
      }
    } catch (e) {}
    if (!M.sockOpen) return true;
    try { await rpc("mpSave", { channelId: M.channelId, hash: M.hash }); } catch (e) {}
    return true;
  }
  // Planted torches ride the pos channel change-gated (like appearance):
  // torch layouts barely change, so resend only on change (+ a 20s repair
  // so joiners converge). Compact [x, y, scope, lvl] arrays: scope 0 =
  // surf overworld, 1 = hell overworld, 2 = sender's current delve at lvl.
  // Only torches visible from the sender's current spot travel — delve
  // torches from other instances stay home (matched by did on receipt).
  function torchOut() {
    try {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!G || !p || !(M && M.active)) return undefined;
      const inD = !!p.inDungeon;
      const arr = [];
      const list = Array.isArray(G.torches) ? G.torches : (p.torches || []);
      for (const t of list) {
        if (!t || !isFinite(+t.x) || !isFinite(+t.y)) continue;
        if (inD) {
          try { if (!t.dungeon || String(t.dungeon) !== String(p.inDungeon)) continue; } catch (e) { continue; }
          arr.push([+((+t.x).toFixed(1)), +((+t.y).toFixed(1)), 2, ((t.level | 0) || 1)]);
        } else {
          try { if (t.dungeon) continue; } catch (e) { continue; }
          arr.push([+((+t.x).toFixed(1)), +((+t.y).toFixed(1)), (t.dim === "hell" ? 1 : 0), 0]);
        }
        if (arr.length >= 60) break;
      }
      let sig = null;
      try { sig = arr.length + ":" + arr.map((a) => a.join(",")).join(";"); } catch (e) { sig = null; }
      const nowT = Date.now();
      if (sig !== M._torchSig || nowT - (M._torchAt || 0) > 20000) {
        M._torchSig = sig; M._torchAt = nowT;
        return arr;
      }
      return undefined;
    } catch (e) { return undefined; }
  }
  // Player-built overlays ride the pos channel change-gated (like torches):
  // home portals, charter stalls and placed furniture live in chunk records
  // that never leave the owner's machine, so peers merge them for render +
  // E-use; smashing/collecting stays owner-side (same rule as torch
  // collecting: nobody pockets or breaks another's lights/furniture). Tiles underneath (walls/doors/windows/stall ground
  // /portal ground) travel the persistent tile channel instead — commitPlacement
  // publishes them, so they survive owner-offline; the overlay records need
  // the owner online (same known limitation as torch sharing).
  // Compact [x, y, code, dimFlag] arrays, cap 60, only near the sender.
  // Codes: 0-9 furniture (PL_FURN), 16-20 stalls (PL_STALL), 24 home portal.
  const PL_FURN = ["bed", "shelf", "table", "chair", "crate", "barrel", "hearth", "altar", "anvil", "trough"];
  const PL_STALL = ["market", "smith", "dojo", "arcane", "stable"];
  const PL_STALL_BASE = 16, PL_PORTAL = 24;
  function placeLayout() {
    // cached <=500ms: sendPos runs at 20Hz, chunk scans don't need to
    try {
      const nowT = Date.now();
      if (M._plCache && nowT - (M._plCacheAt || 0) < 500) return M._plCache;
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      let arr = [];
      if (G && p && !(p.inDungeon) && G.chunks) {
        const hell = mpDim() === "hell";
        const dim = hell ? 1 : 0;
        const px = +p.x, py = +p.y, R = 44;
        const c0x = Math.floor((px - R) / 16), c1x = Math.floor((px + R) / 16);
        const c0y = Math.floor((py - R) / 16), c1y = Math.floor((py + R) / 16);
        const push = (gx, gy, code) => {
          if (!isFinite(gx) || !isFinite(gy)) return;
          if (Math.hypot(gx + 0.5 - px, gy + 0.5 - py) > R) return;
          arr.push([+(gx + 0.5).toFixed(1), +(gy + 0.5).toFixed(1), code, dim]);
        };
        for (const [key, ch] of G.chunks) {
          if (!ch) continue;
          // v18 dims share coordinates under different key prefixes ("h_" vs
          // "c_"/legacy); only the sender's dim travels (same rule as tiles).
          try {
            const k = String(key || "");
            if (hell ? !(k.indexOf("h_") === 0) : (k.indexOf("h_") === 0)) continue;
          } catch (e) {}
          if (ch.cx < c0x || ch.cx > c1x || ch.cy < c0y || ch.cy > c1y) continue;
          try {
            if (ch.shopStalls) for (const k of Object.keys(ch.shopStalls)) {
              const rec = ch.shopStalls[k];
              if (!rec) continue;
              const ci = PL_STALL.indexOf(rec.kind);
              if (ci < 0) continue;
              const parts = String(k).split(",");
              push(+parts[0], +parts[1], PL_STALL_BASE + ci);
              if (arr.length >= 60) break;
            }
          } catch (e) {}
          if (arr.length >= 60) break;
          try {
            if (Array.isArray(ch.pois)) for (const poi of ch.pois) {
              if (!poi || poi.type !== "portal" || !poi.home) continue;
              push(poi.gx, poi.gy, PL_PORTAL);
              if (arr.length >= 60) break;
            }
          } catch (e) {}
          if (arr.length >= 60) break;
          try {
            if (Array.isArray(ch.furnPlaced)) for (const r of ch.furnPlaced) {
              if (!r) continue;
              const fi = PL_FURN.indexOf(r.kind);
              if (fi < 0) continue;
              push(r.gx, r.gy, fi);
              if (arr.length >= 60) break;
            }
          } catch (e) {}
          if (arr.length >= 60) break;
        }
      }
      if (arr.length > 60) arr = arr.slice(0, 60);
      M._plCache = arr; M._plCacheAt = nowT;
      return arr;
    } catch (e) { return []; }
  }
  function placeOut() {
    try {
      if (!(M && M.active)) return undefined;
      const arr = placeLayout();
      let sig = null;
      try { sig = arr.length + ":" + arr.map((a) => a.join(",")).join(";"); } catch (e) { sig = null; }
      const nowT = Date.now();
      if (sig !== M._plSig || nowT - (M._plAt || 0) > 20000) {
        M._plSig = sig; M._plAt = nowT;
        return arr;
      }
      return undefined;
    } catch (e) { return undefined; }
  }
  function sendPos() {
    if (!M.active) return;
    try {
      const p = window.Game.G.player;
      if (!p) return;
      let did = null, dlv = 0;
      try {
        if (p.inDungeon) {
          did = myDungeonId();
          dlv = ((p.dungeonLevel | 0) || 1);
        }
      } catch (e) { did = null; dlv = 0; }
      // ridden mount rides the pos channel too (suppressed while sailing —
      // the raft wins the under-hero slot). Tint falls back to the template
      // at draw time, so only the raw tint is sent.
      let mk = null, mt = null;
      try {
        if (!p.sailing && p.activeMountId && p.mounted && window.Game && window.Game.activeMount) {
          const am = window.Game.activeMount();
          if (am && am.kind) {
            mk = String(am.kind).slice(0, 24);
            mt = (typeof am.tint === "string" && am.tint) ? am.tint.slice(0, 16) : null;
          }
        }
      } catch (e) { mk = null; mt = null; }
      const px = +p.x, py = +p.y;
      // Sender-side velocity (tiles/sec, EMA): receivers extrapolate along it
      // when a packet is late instead of freezing, which hides loss + halves
      // perceived latency. Resets on time gaps (backgrounded tab) and teleports.
      const nowT = Date.now();
      let vx = M._svx || 0, vy = M._svy || 0;
      try {
        const dtS = (nowT - (M._lastPosT || 0)) / 1000;
        if (M._lastPosT && dtS > 0.005 && dtS < 1 && isFinite(px) && isFinite(py)) {
          const dx = px - M._lastPosX, dy = py - M._lastPosY;
          if (Math.hypot(dx, dy) > 14) { vx = 0; vy = 0; } // teleport: no fling
          else {
            const ivx = Math.max(-30, Math.min(30, dx / dtS));
            const ivy = Math.max(-30, Math.min(30, dy / dtS));
            vx = vx * 0.6 + ivx * 0.4; vy = vy * 0.6 + ivy * 0.4;
            if (Math.hypot(vx, vy) < 0.12) { vx = 0; vy = 0; } // rest is rest
          }
        } else if (!(M._lastPosT && dtS < 1)) { vx = 0; vy = 0; }
      } catch (e) {}
      M._svx = vx; M._svy = vy; M._lastPosX = px; M._lastPosY = py; M._lastPosT = nowT;
      // Appearance rides EVERY pos (like equipped weapon/armor ids), not
      // change-gated: hot state travels the unordered unreliable fast lane
      // whenever it is open, and the seq gate drops any message that
      // arrives after a newer one. A gated look (1 in ~24 messages, and the
      // biggest one — systematically the most likely to arrive late) then
      // takes many 3s repairs to converge, so newcomers render the default
      // human for ~half a minute while movement looks perfect. ~100 bytes
      // per tick is negligible next to the equipment ids already here.
      // Absent (no local look yet) keeps the peer's last-known, as before.
      let appOut = undefined;
      try {
        if (window.Appearance && p.appearance) appOut = window.Appearance.pack(p.appearance) || undefined;
      } catch (e) { appOut = undefined; }
    // Disciples of Shadow, seen by everyone else: living clone positions
    // (+hp for the ditto bar) so fellow travelers render perfect copies of
    // the hero and host-side mobs can be fooled. Compact triples, cap 4.
    function liveCloneOut() {
      try {
        const G = window.Game && window.Game.G;
        const cs = (G && G.shadowClones) || [];
        const out = [];
        for (const c of cs) {
          if (!c || !(c.hp > 0)) continue;
          const cx = +(c.x ?? c.gx), cy = +(c.y ?? c.gy);
          if (!isFinite(cx) || !isFinite(cy)) continue;
          out.push([+cx.toFixed(2), +cy.toFixed(2), Math.max(0, Math.ceil(c.hp || 0))]);
          if (out.length >= 4) break;
        }
        return out.length ? out : null;
      } catch (e) { return null; }
    }
    // party roster rides the pos channel so peers can SEE each companion
    // properly: real position (world + map + minimap), role + tint + look
    // (they dress like themselves, never a default), hp for the nameplate.
    // Render-only everywhere else — never simulated. Dungeons included: same
    // instance shares the delve grid, so co-delvers see followers truly.
    let partyOut = null;
    try {
      const _G = window.Game && window.Game.G;
      if (_G && _G.player && Array.isArray(_G.npcs)) {
        partyOut = [];
        M._posTick = (M._posTick | 0) + 1;
        const _appTick = (M._posTick % 60) === 1;
        if (_appTick && Object.keys(M._partyAppSig).length > 120) { try { M._partyAppSig = {}; } catch (e2) {} }
        for (const _n of _G.npcs) {
          if (!_n || !_n.inParty) continue;
          const _pe = { n: String(_n.name || "Ally").slice(0, 24), lv: Math.max(1, Math.min(125, _n.lv | 0 || 1)), hp: Math.max(0, Math.ceil(_n.hp || 0)), maxHp: Math.max(1, _n.maxHp || 40) };
          try {
            const _nx = +(_n.x ?? _n.gx), _ny = +(_n.y ?? _n.gy);
            if (isFinite(_nx) && isFinite(_ny)) { _pe.x = +_nx.toFixed(2); _pe.y = +_ny.toFixed(2); }
          } catch (e2) {}
          if (_n.role) _pe.role = String(_n.role).slice(0, 16);
          if (_n.tint) _pe.tint = String(_n.tint).slice(0, 16);
          try {
            const _psig = (window.Appearance && _n.appearance) ? JSON.stringify(window.Appearance.pack(_n.appearance)) : "-";
            if (_psig !== M._partyAppSig[_n.id] || _appTick) { M._partyAppSig[_n.id] = _psig; if (_psig !== "-") _pe.app = window.Appearance.pack(_n.appearance); }
          } catch (e2) {}
          partyOut.push(_pe);
          if (partyOut.length >= 12) break;
        }
        if (!partyOut.length) partyOut = null;
      }
    } catch (e) { partyOut = null; }
      const obj = {
        t: "pos", channelId: M.channelId, hash: M.hash,
        sq: nextSq(), st: nowT, ep: M._epoch,
        x: +px.toFixed(2), y: +py.toFixed(2),        vx: +vx.toFixed(2), vy: +vy.toFixed(2),
        hp: Math.ceil(p.hp), maxHp: p.maxHp, mp: Math.ceil(p.mp), maxMp: p.maxMp,
        lv: p.lv, role: p.role, tint: p.tint, name: p.name, sleeping: M.sleeping,
        // flat combat-voice stats for the Usaghito Lucky Chorus (Luck over 5
        // drives crit/dodge, total Charm drives +ATK/DEF/SDEF/MATK): the
        // receive path mirrors them into r.stats so old-missing reads as 0.
        // Small ints; old senders omit them and simply lend no voice.
        luk: (p.stats && isFinite(+p.stats.luk)) ? Math.max(0, Math.min(999, +p.stats.luk | 0)) : 0,
        cha: (p.stats && isFinite(+p.stats.cha)) ? Math.max(0, Math.min(999, +p.stats.cha | 0)) : 0,
        // v18 dimension: same numbers, separate worlds — cross-dim remotes
        // are filtered out of bubbles/fighters/sims, never fought.
        dim: (p.dim === "heaven" ? "heaven" : p.dim === "hell" ? "hell" : "surf"),
        dun: p.inDungeon ? 1 : 0,
        did: did, dLv: dlv,
        sail: p.sailing ? 1 : 0, boat: String(p.activeBoat || "raft").slice(0, 16),
        mk: mk, mt: mt,
        // look: compact appearance + equipped weapon/armor so fellow
        // travelers render outfits, faces and held gear, not a blue default.
        // Empty slots send "-" (not null): null/undefined is DROPPED by the
        // relay JSON, so only an explicit sentinel clears a stale sword on
        // the other side when someone unequips. Old clients read "-" as
        // "no such item" and draw empty hands — same visual, no breakage.
        app: appOut,
        w: (p.equipment && p.equipment.weapon) || "-",
        party: partyOut,
        a: (p.equipment && p.equipment.armor) || "-",
        s: (p.equipment && p.equipment.shield) || "-",
        o: (() => { try { const hb = p.hotbar; const oi = (window.Items && window.Items.getOffhandSlot) ? window.Items.getOffhandSlot(p) : -1; const sl = hb && hb[oi]; if (sl && sl.kind === "item" && sl.id && window.Items.ITEMS[sl.id] && window.Items.ITEMS[sl.id].slot === "weapon") return sl.id; } catch (e) { } return "-"; })(),
        // Disciples of Shadow, seen by everyone else: living clone positions
        // (+hp for the ditto bar) so fellow travelers render perfect copies of
        // the hero and host-side mobs can be fooled. Cap 4 (max clone count).
        // Omitted when there are none, so the hot path stays small.
        cl: liveCloneOut(),
        // planted torches (change-gated above: present only when the layout
        // changed or the 20s repair fires; old senders omit it entirely).
        to: torchOut(),
        // player-built overlays (change-gated above: home portals, charter
        // stalls, placed furniture near the sender; old senders omit it).
        pl: placeOut(),
      };
      // Shooter-style split: P2P carries every tick (~20Hz) for direct-path
      // smoothness. The relay is fallback + durable hub — but it must NOT
      // echo stale positions over fresh P2P truth (that echo was the jitter):
      // when every remote is P2P-covered, the relay drops to a 1Hz keep-alive
      // (hub freshness + lastSeen); otherwise it stays hot (~8Hz) so
      // relay-only players still track fine. Receivers also seq-drop any
      // stale echo that does arrive, so the two paths can never fight.
      // (Star topology now: no guest-guest mesh, so there is no P2P path —
      // p2pN stays 0 and the relay holds ~8Hz. broadcastP2P was removed with
      // the mesh; calling it threw a ReferenceError every tick — caught, but
      // it skipped this throttle and spammed the relay at 20Hz, overrunning
      // the Hub's per-conn rate limit.)
      try {
        const p2pN = 0;
        const remoteN = M.remotes.size;
        const covered = remoteN > 0 && p2pN >= remoteN;
        const p2pFresh = Date.now() - (M.p2pOk || 0) < 8000;
        const relayEvery = (!covered || !p2pFresh) ? 120 : 1000;
        if (Date.now() - (M.__posRelayAt || 0) >= relayEvery) { M.__posRelayAt = Date.now(); try { broadcastHot(obj); } catch (e3) {} }
      } catch (e2) { try { broadcastHot(obj); } catch (e4) {} }
      // host-side damage to remote players flushes here (~20Hz): accumulated
      // per target so a mob pack reads as one wound, never a stutter
      try { flushHurt(); } catch (e) {}
    } catch (e) {}
  }
  // ---- shared world state: host simulates every viewer bubble ----
  // The host's snap/snapP is the authority, so joiners stay silent here and
  // only forward hits. Fallback: if the host goes quiet for 6s+ (backgrounded
  // tab etc.), the elected area simulator resumes publishing so the world
  // doesn't freeze for everyone.
  function sendEnts() {
    if (!M.active) return;
    // delves never ride the overworld area channel: they have their own
    // instance-scoped dEnts below. Publishing dungeon-local coords here once
    // leaked crypt mobs onto the surface for anyone near spawn.
    try { if (window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.inDungeon) return; } catch (e) {}
    // the host's snap is the authority — hosts don't also emit area batches
    if (isHost()) return;
    // host fresh (<6s): stay silent, its truth wins. Otherwise fall back to
    // area-sim publishing until its snapshots resume.
    try { if (Date.now() - (M.lastHostSnap || 0) < 6000) return; } catch (e) {}
    // thin-client rule: only the elected area simulator publishes positions.
    // Everyone else stays silent here (hits still flow instantly via sendHit),
    // so one client owns each NPC/mob and the host relays a single truth.
    try { if (!amAreaSim()) return; } catch (e) {}
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player) return;
      const px = G.player.x, py = G.player.y;
      const list = [];
      try {
        const npcs = (G.npcs || []).slice()
          .map(n => ({ n, d: Math.hypot((n.x ?? n.gx ?? px) - px, (n.y ?? n.gy ?? py) - py) }))
          .filter(o => o.d < 40 && o.n && o.n.id && !o.n.inParty)
          .sort((a, b) => a.d - b.d).slice(0, 15);
        for (const { n } of npcs) {
          list.push({
            id: String(n.id).slice(0, 48), kind: "npc",
            x: +(+((n.x ?? n.gx) || 0)).toFixed(2), y: +(+((n.y ?? n.gy) || 0)).toFixed(2),
            hp: Math.max(0, Math.ceil(n.hp || 0)), maxHp: n.maxHp || 1, lv: n.lv || 1,
            dead: !(n.hp > 0), name: String(n.name || "").slice(0, 24),
            role: String(n.role || "villager").slice(0, 16), tint: String(n.tint || "").slice(0, 16), ts: Date.now(),
            face: isFinite(n.faceAng) ? +(+n.faceAng).toFixed(2) : 0,
            app: (window.Appearance && n.appearance) ? window.Appearance.pack(n.appearance) : undefined,
          });
          if (n.looted) list[list.length - 1].looted = true;
        }
      } catch (e) {}
      try {
        const mobs = (G.mobs || []).slice()
          // corpses ride along while lootable (see sendSnap): the kill must
          // leave a body on every screen, not just the simulator's.
          .filter(mo => mo && mo.id && !(mo.remoteOwned) && (!mo.corpse || !mo.looted))
          .map(mo => ({ mo, d: Math.hypot((mo.x || 0) - px, (mo.y || 0) - py) }))
          .filter(o => o.d < 34)
          .sort((a, b) => a.d - b.d).slice(0, 12);
        for (const { mo } of mobs) {
          list.push({
            id: String(mo.id).slice(0, 48), kind: String(mo.kind || "mob").slice(0, 24),
            x: +(+mo.x).toFixed(2), y: +(+mo.y).toFixed(2),
           hp: Math.max(0, Math.ceil(mo.hp || 0)), maxHp: mo.maxHp || 1, lv: mo.lv || 1,
            dead: !(mo.hp > 0), name: String(mo.name || mo.kind || "").slice(0, 24), ts: Date.now(),
            face: isFinite(mo.faceAng) ? +(+mo.faceAng).toFixed(2) : 0,
            gold: (mo.corpse ? Math.max(0, Math.round(mo.corpseGold || 0)) : undefined),
          });
          if (mo.looted) list[list.length - 1].looted = true;
          if (mo.submerged) list[list.length - 1].sub = true;
          if (mo.voidHidden) list[list.length - 1].voidH = true;
          if (mo.tameOffer && mo.hp > 0) list[list.length - 1].tame = true;
          if (mo.isBoss) list[list.length - 1].boss = true;
          try { if (mo.tameSubmitBase != null && isFinite(+mo.tameSubmitBase)) list[list.length - 1].tsb = +mo.tameSubmitBase; } catch (e) {}
        }
      } catch (e) {}
      if (!list.length) return;
          try { broadcastHot({ t: "ents", channelId: M.channelId, hash: M.hash, from: M.hash, sq: nextSq(), st: Date.now(), ep: M._epoch, dim: mpDim(), list }, { key: "ents", throttleMs: 200, fallback: true }); } catch (e2) {}
    } catch (e) {}
  }
  function sendHit(id, hp, dead) {
    if (!M.active) return;
    try {
      if (typeof id !== "string" || !id) return;
      // hits are inputs forwarded to the host: P2P for speed, relay for
      // fallback + durability. Host applies them and re-broadcasts state.
      broadcastNet({ t: "hit", channelId: M.channelId, hash: M.hash, id: id.slice(0, 48), hp: Math.max(0, Math.round(hp || 0)), dead: !!dead }, { viaServer: true });
    } catch (e) {}
  }
  // ---- shared delves: instance-scoped mob/state sync ----
  // Every occupant publishes its OWNED dungeon mobs (owner==me); the union is
  // the delve. Regular spawns + the delve lord are gated to amDungeonSim (one
  // spawner, no duplicates); triggered teeth are owned by whoever touched
  // them. All clients adopt lower hp (damage never lost) and materialize
  // unknown ids as glide shadows (remoteOwned, no local AI).
  function sendDEnts() {
    if (!M.active) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player || !G.player.inDungeon || !G.dungeon) return;
      const did = myDungeonId();
      if (!did) return;
      // solo delve: nobody to share with — stay silent, simulate locally
      if (!dungeonOccupants(did).some((h) => h !== String(M.hash || "").toLowerCase())) return;
      // single sim per instance (unified world server): only the elected sim
      // publishes positions; everyone else stays silent and renders. The sim
      // publishes everything it simulates (legacy owner tags ignored).
      if (!amDungeonSim(did)) return;
      const me = String(M.hash || "").toLowerCase();
      const px = G.player.x, py = G.player.y;
      const list = [];
      for (const mo of (G.mobs || [])) {
        if (!mo || !mo.id || (mo.corpse && mo.looted)) continue; // lootable corpses ride too (peers raid them)
        if (String(mo.dungeonId || "") !== String(G.dungeon.id)) continue;
        // sim owns the instance: skip foreign replicas (never re-publish them)
        try { if (mo.remoteOwned) continue; } catch (e) {}
        const d = Math.hypot((mo.x || 0) - px, (mo.y || 0) - py);
        if (d > 46) continue;
        const e = {
          id: String(mo.id).slice(0, 48), kind: String(mo.kind || "mob").slice(0, 24),
          x: +(+mo.x).toFixed(2), y: +(+mo.y).toFixed(2),
          hp: Math.max(0, Math.round(mo.hp || 0)), maxHp: mo.maxHp || 1, lv: mo.lv || 1,
          dead: !(mo.hp > 0), name: String(mo.name || mo.kind || "").slice(0, 24), ts: Date.now(),
          face: isFinite(mo.faceAng) ? +(+mo.faceAng).toFixed(2) : 0,
          owner: me,
          gold: (mo.corpse ? Math.max(0, Math.round(mo.corpseGold || 0)) : undefined), // corpse purse rides so every screen raids the same
        };
        if (mo.tint) e.tint = String(mo.tint).slice(0, 16);
        if (mo.looted) e.looted = true;
        if (mo.tameOffer && mo.hp > 0) e.tame = true;
        if (mo.isBoss) e.boss = true;
        try { if (mo.tameSubmitBase != null && isFinite(+mo.tameSubmitBase)) e.tsb = +mo.tameSubmitBase; } catch (e) {}
        // death timestamp rides so mates enforce the 30s lord-respawn cooldown
        // from the actual kill, not from the corpse's last publish.
        if (e.dead && mo.deadAt) e.dt = mo.deadAt;
        if (mo.isPortalMimic) e.portalMimic = true;
        if (mo.mimicTricked) e.tricked = true;
        if (mo.mimicExposed) e.exposed = true;
        if (mo.submerged) e.sub = true;
        e.voidH = !!mo.voidHidden;
        list.push(e);
        if (list.length >= 30) break;
      }
      // recent chest/portal mutations for THIS instance ride along so late
      // joiners + floor-walkers converge without asking
      let poiOut = null;
      try {
        poiOut = [];
        const _ddim = mpDim();
        for (const [dkey, o] of M.dPoiOps) {
          if (!o || String(o.did || "") !== did) continue;
          try { if ((o.dim === "hell" || o.dim === "heaven" || o.dim === "surf") && o.dim !== _ddim) continue; } catch (e3) {}
          try { const _dpk = parseDPoiKey(dkey); const _bid2 = String((_dpk && _dpk.id) || dkey).slice(0, 64); poiOut.push({ id: _bid2, op: o.op, did, dim: _ddim }); } catch (e4) {}
          if (poiOut.length >= 20) break;
        }
        if (!poiOut.length) poiOut = null;
      } catch (e2) { poiOut = null; }
      if (!list.length && !poiOut) return;
          try { broadcastHot({ t: "dEnts", channelId: M.channelId, hash: M.hash, from: M.hash, sq: nextSq(), st: Date.now(), ep: M._epoch, did, dim: mpDim(), list, poi: poiOut }, { key: "dEnts", throttleMs: 350, fallback: true }); } catch (e3) {}
    } catch (e) {}
  }
  function sendDHit(id, hp, dead, did) {
    if (!M.active) return;
    try {
      if (typeof id !== "string" || !id) return;
      did = did || myDungeonId();
      if (!did) return;
      broadcastNet({ t: "dHit", channelId: M.channelId, hash: M.hash, from: M.hash, did: String(did).slice(0, 48), dim: mpDim(), id: id.slice(0, 48), hp: Math.max(0, Math.round(hp || 0)), dead: !!dead }, { viaServer: true });
    } catch (e) {}
  }
  // Owner-to-victim wound inside a shared delve (any owner can send — unlike
  // the host-only overworld hurt). Only the addressed client applies it.
  function sendDHurt(toHash, amount, info) {
    if (!M.active) return;
    try {
      toHash = String(toHash || "").toLowerCase();
      if (!toHash || toHash === String(M.hash || "").toLowerCase()) return;
      // Ally gate is PvP-only (info.pvp, set by the routing call site):
      // mob/world wounds always route, or allied travelers would be
      // immune to all PvE instead of just shielded from friendly fire.
      try { if (info && info.pvp && isAlliedHash(toHash)) return; } catch (e) {}
      amount = Math.max(1, Math.min(9999, Math.round(+amount || 0)));
      if (!(amount > 0)) return;
      info = info || {};
      const did = (typeof info.did === "string" && info.did) ? info.did : (myDungeonId() || null);
      if (!did) return;
      let st = null;
      try {
        if (info.status && typeof info.status.type === "string") {
          st = { type: String(info.status.type).slice(0, 24) };
          for (const f of ["pct", "dps", "durationMs", "potency"]) if (isFinite(+info.status[f])) st[f] = +info.status[f];
        }
      } catch (e) { st = null; }
      broadcastNet({
        t: "dHurt", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash,
        did: String(did).slice(0, 48), dim: mpDim(), amount, magic: !!info.magic, crit: !!info.crit, status: st,
        move: (typeof info.move === "string" && info.move) ? info.move.slice(0, 32) : null,
        fromName: String(info.fromName || "Something").slice(0, 24),
        fromRole: String(info.fromRole || "").slice(0, 16),
        fromLv: Math.max(1, Math.min(125, info.fromLv | 0 || 1)),
        fromHash: String(info.fromHash || M.hash || "").slice(0, 64),
        srcId: (typeof info.srcId === "string") ? info.srcId.slice(0, 48) : null,
        srcKind: String(info.srcKind || "").slice(0, 24),
      }, { viaServer: true });
    } catch (e) {}
  }
  // Victim-to-sim damage feedback: report the TRUE post-armor wound (with
  // the move that dealt it) so the simulating client's mob trains its
  // per-target per-move memory off reality. Delve-scoped like the wound.
  // Throttled: at most one report per mob per 400ms (memory is an EMA — a
  // sample per volley is plenty, and a bow spammer must not flood the room).
  const _takenSentAt = new Map();
  function sendTaken(mobId, dmg, move) {
    if (!M.active) return;
    try {
      if (typeof mobId !== "string" || !mobId) return;
      dmg = Math.max(1, Math.min(9999, Math.round(+dmg || 0)));
      if (!(dmg > 0)) return;
      const now = Date.now();
      const last = _takenSentAt.get(mobId) || 0;
      if (now - last < 400) return;
      _takenSentAt.set(mobId, now);
      if (_takenSentAt.size > 200) { const fk = _takenSentAt.keys().next().value; _takenSentAt.delete(fk); }
      let did = null;
      try {
        const G = window.Game && window.Game.G;
        if (G && G.player && G.player.inDungeon) did = myDungeonId();
      } catch (e) { did = null; }
      broadcastNet({
        t: "dtak", channelId: M.channelId, hash: M.hash, from: M.hash,
        mob: mobId.slice(0, 48), amount: dmg,
        move: (typeof move === "string" && move) ? move.slice(0, 32) : "steel:strike",
        did: did ? String(did).slice(0, 48) : null,
        dim: mpDim(),
      }, { viaServer: true });
    } catch (e) {}
  }
  // Shared delve lootable mutation (chest opened / portal revealed / corpse raided).
  function dPoiKey(id, dim) { dim = normMpDim(dim == null ? mpDim() : dim); return dim + ":" + String(id || "").slice(0, 64); }
  function parseDPoiKey(k) {
    try {
      const s = String(k || "");
      const ci = s.indexOf(":");
      if (ci > 0 && (s.slice(0, ci) === "hell" || s.slice(0, ci) === "surf")) return { dim: s.slice(0, ci), id: s.slice(ci + 1).slice(0, 64) };
      return { dim: "surf", id: s.slice(0, 64) };
    } catch (e) { return { dim: "surf", id: String(k || "").slice(0, 64) }; }
  }
  function notifyDungeonPoi(id, op, did) {
    if (!M.active) return;
    try {
      id = String(id || "").slice(0, 64);
      if (!id) return;
      did = did || myDungeonId();
      if (!did) return;
      op = op === "revealed" ? "revealed" : op === "looted" ? "looted" : "opened";
      const _dd = mpDim();
      const _key = dPoiKey(id, _dd);
      const prev = M.dPoiOps.get(_key) || M.dPoiOps.get(id);
      if (prev && prev.op === op && String(prev.did || "") === String(did) && normMpDim(prev.dim) === _dd) return;
      M.dPoiOps.set(_key, { op, did: String(did), dim: _dd, ts: Date.now() });
      try { if (_key !== id && M.dPoiOps.has(id)) M.dPoiOps.delete(id); } catch (e) {}
      if (M.dPoiOps.size > 120) { const fk = M.dPoiOps.keys().next().value; M.dPoiOps.delete(fk); }
      broadcastHot({ t: "dPoi", channelId: M.channelId, hash: M.hash, from: M.hash, did: String(did).slice(0, 48), dim: _dd, id, op }, { viaServer: true });
    } catch (e) {}
  }
  function applyDungeonPoiOp(id, op, did, dim) {
    if (!M.active) return;
    try {
      id = String(id || "").slice(0, 64);
      if (!id || !did) return;
      did = String(did);
      dim = normMpDim(dim);
      const _key = dPoiKey(id, dim);
      const prev = M.dPoiOps.get(_key) || M.dPoiOps.get(id);
      if (!prev || prev.op !== op || String(prev.did || "") !== did || normMpDim(prev.dim) !== dim) M.dPoiOps.set(_key, { op, did, dim, ts: Date.now() });
      try { if (_key !== id && M.dPoiOps.has(id)) { const _old = M.dPoiOps.get(id); if (!_old || normMpDim(_old.dim) !== "hell") M.dPoiOps.delete(id); } } catch (e) {}
      if (M.dPoiOps.size > 120) { const fk = M.dPoiOps.keys().next().value; M.dPoiOps.delete(fk); }
      const G = window.Game && window.Game.G;
      if (!G || !G.player || !G.player.inDungeon || !G.dungeon) return;
      if (String(myDungeonId() || "") !== did) return;
      try { if ((G.dungeon.dim === "hell" || G.dungeon.dim === "heaven" || G.dungeon.dim === "surf") && G.dungeon.dim !== dim) return; } catch (e) {}
      try { if (mpDim() !== dim) return; } catch (e2) {}
      const d = G.dungeon;
      if (id === did + "__portal" && op === "revealed") {
        if (!d.portalMimicRevealed) {
          d.portalMimicRevealed = true;
          try { window.World.saveDungeon(d); } catch (e2) {}
        }
        return;
      }
      if (Array.isArray(d.chests)) {
        const c = d.chests.find((x) => x && x.id === id);
        if (c && !c.opened) {
          c.opened = true;
          try { window.World.saveDungeon(d); } catch (e2) {}
        }
      }
    } catch (e) {}
  }
  function applyCachedDPoi() {
    if (!M.active || !M.dPoiOps.size) return;
    try {
      const did = myDungeonId();
      if (!did) return;
      const myDim = mpDim();
      const G = window.Game && window.Game.G;
      if (!G || !G.dungeon) return;
      let dirty = false;
      for (const [dkey, o] of M.dPoiOps) {
        if (!o || String(o.did || "") !== String(did)) continue;
        try { if ((o.dim === "hell" || o.dim === "heaven" || o.dim === "surf") && o.dim !== myDim) continue; } catch (e) {}
        const _dp = parseDPoiKey(dkey);
        const id = (o && o.id) || (_dp && _dp.id) || String(dkey);
        if (id === did + "__portal" && o.op === "revealed") {
          if (!G.dungeon.portalMimicRevealed) { G.dungeon.portalMimicRevealed = true; dirty = true; }
        } else if (Array.isArray(G.dungeon.chests)) {
          const c = G.dungeon.chests.find((x) => x && x.id === id);
          if (c && !c.opened && (o.op === "opened" || o.op === "revealed")) { c.opened = true; dirty = true; }
        }
      }
      if (dirty) { try { window.World.saveDungeon(G.dungeon); } catch (e) {} }
    } catch (e) {}
  }
  // ---- peer -> player damage (PvP): this client's blow hit another hero.
  // Routed to the owning client (relay, like hit/hurt); the owner applies
  // it via applyRemoteHurt. srcId is usually foreign (unknown there), so
  // fromHash identifies the attacker for retaliation.
  function sendPlayerHit(toHash, amount, info) {
    if (!M.active) return;
    try {
      toHash = String(toHash || "").toLowerCase();
      if (!toHash || toHash === M.hash) return;
      // allied heroes (and their parties) never hurt each other — drop here
      // too so a missed isAlly check upstream can't route PvP to an ally.
      // PvP-only (info.pvp): mob/world wounds always route, or allied
      // travelers would be immune to all PvE.
      try { if (info && info.pvp && isAlliedHash(toHash)) return; } catch (e) {}
      amount = Math.max(1, Math.min(9999, Math.round(+amount || 0)));
      if (!(amount > 0)) return;
      info = info || {};
      let st = null;
      try {
        if (info.status && typeof info.status.type === "string") {
          st = { type: String(info.status.type).slice(0, 24) };
          for (const f of ["pct", "dps", "durationMs", "potency"]) if (isFinite(+info.status[f])) st[f] = +info.status[f];
        }
      } catch (e) { st = null; }
      broadcastNet({
        t: "phit", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash,
        amount, magic: !!info.magic, crit: !!info.crit, status: st,
        move: (typeof info.move === "string" && info.move) ? info.move.slice(0, 32) : null,
        fromName: String(info.fromName || "Something").slice(0, 24),
        fromRole: String(info.fromRole || "").slice(0, 16),
        fromLv: Math.max(1, Math.min(125, info.fromLv | 0 || 1)),
        fromHash: String(info.fromHash || M.hash || "").slice(0, 64),
        srcId: (typeof info.srcId === "string") ? info.srcId.slice(0, 48) : null,
        srcKind: String(info.srcKind || "").slice(0, 24),
        // shared-delve routing: victims only accept wounds from their own instance
        did: (typeof info.did === "string" && info.did) ? info.did.slice(0, 48) : (myDungeonId() || null),
      }, { viaServer: true });
    } catch (e) {}
  }
  // ---- host-authoritative overworld combat: attack intents + kill credits ----
  // Joiners never mutate shared HP locally (see Game.sendHitIntent): their
  // blows arrive here, the HOST applies them via Game.handleHitIntent (one
  // true RNG), and snapshots carry the outcome back. Kill credits route the
  // local rewards (XP/quest/guild) back to the killer's machine — the corpse,
  // purse and death state all mirror via snapshots, never twice.
  function sendHitIntent(o) {
    if (!M.active) return false;
    // overworld intents come from joiners only (the host simulates locally);
    // delve intents may come from anyone who isn't the instance sim (the host
    // sends them too when it delves as a non-sim guest of another sim).
    try { if (!o.did && isHost()) return false; } catch (e) {}
    try { if (o.did && amDungeonSim(String(o.did))) return false; } catch (e) {}
    try {
      if (!o || typeof o.id !== "string" || !o.id) return false;
      const amount = Math.max(1, Math.min(9999, Math.round(+o.amount || 0)));
      if (!(amount > 0)) return false;
      let st = null;
      try {
        if (o.status && typeof o.status.type === "string") {
          st = { type: String(o.status.type).slice(0, 24) };
          for (const f of ["pct", "dps", "durationMs", "potency"]) if (isFinite(+o.status[f])) st[f] = +o.status[f];
        }
      } catch (e) { st = null; }
      broadcastNet({
        t: "hitIntent", channelId: M.channelId, hash: M.hash, from: M.hash,
        id: o.id.slice(0, 48), amount,
        did: (typeof o.did === "string" && o.did) ? o.did.slice(0, 48) : null,
        dim: mpDim(),
        magic: !!o.magic, el: String(o.el || "physical").slice(0, 16), fam: String(o.fam || "unarmed").slice(0, 16),
        extraEls: (typeof o.extraEls === "string" && o.extraEls) ? o.extraEls.slice(0, 48) : null,
        move: (typeof o.move === "string" && o.move) ? o.move.slice(0, 32) : null,
        status: st, slow: !!o.slow, slowMs: isFinite(+o.slowMs) ? (o.slowMs | 0) : undefined,
        burn: !!o.burn, burnMs: isFinite(+o.burnMs) ? (o.burnMs | 0) : undefined,
        pierce: !!o.pierce, allowThroughWall: !!o.allowThroughWall, isStatus: !!o.isStatus,
        mercy: !!o.mercy, aid: (typeof o.aid === "string" && o.aid) ? o.aid.slice(0, 48) : null,
        ax: isFinite(+o.ax) ? +o.ax : null, ay: isFinite(+o.ay) ? +o.ay : null,
      });
      return true;
    } catch (e) { return false; }
  }
  function sendKillCredit(toHash, info) {
    if (!M.active) return false;
    // world-server credit: the host for overworld kills, the instance sim
    // for delve kills (the host may not even be inside that delve).
    try {
      info = info || {};
      const _did = (typeof info.did === "string" && info.did) ? info.did.slice(0, 48) : null;
      if (_did) { if (!amDungeonSim(_did)) return false; }
      else if (!isHost()) return false;
    } catch (e) { return false; }
    try {
      toHash = String(toHash || "").toLowerCase();
      if (!toHash || !M.remotes.has(toHash)) return false;
      info = info || {};
      if (!info.id || typeof info.id !== "string") return false;
      broadcastNet({
        t: "kcredit", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash,
        id: info.id.slice(0, 48), kind: String(info.kind || "mob").slice(0, 32),
        mob: !!info.mob, lv: Math.max(1, Math.min(125, info.lv | 0 || 1)),
        name: String(info.name || "foe").slice(0, 32), boss: !!info.boss,
        baseId: (typeof info.baseId === "string" && info.baseId) ? info.baseId.slice(0, 48) : null,
        did: (typeof info.did === "string" && info.did) ? info.did.slice(0, 48) : null,
        xp: Math.max(0, Math.min(100000, Math.round(+info.xp || 0))),
        aid: (typeof info.aid === "string" && info.aid) ? info.aid.slice(0, 48) : null,
        el: String(info.el || "physical").slice(0, 16), fam: String(info.fam || "unarmed").slice(0, 16),
        move: (typeof info.move === "string" && info.move) ? info.move.slice(0, 32) : null,
      });
      return true;
    } catch (e) { return false; }
  }
  // dealDamage on the host never touches a remote hero directly: it lands
  // here, and flushHurt (called from sendPos) routes one wound per target.
  function sendHurt(toHash, amount, info) {
    if (!M.active || !isHost()) return;
    try {
      toHash = String(toHash || "").toLowerCase();
      if (!toHash || !M.remotes.has(toHash)) return;
      // Ally gate is PvP-only (info.pvp): host-sim mob/world wounds always
      // route, or allied joiners would be immune to all PvE. Hero-side blows
      // to allies are already blocked upstream by isAlly in dealDamage.
      try { if (info && info.pvp && isAlliedHash(toHash)) return; } catch (e) {}
      amount = Math.max(1, Math.min(9999, Math.round(+amount || 0)));
      if (!(amount > 0)) return;
      const p = M.hurtPend[toHash] || (M.hurtPend[toHash] = { amount: 0, info: null });
      try {
        // clone-indexed wounds must NOT merge with hero wounds (or each
        // other): they land on different bodies. Flush the pending batch if
        // the target copy changed, so every wound keeps its own address.
        const _ncl = (info && info.cloneIdx != null) ? (info.cloneIdx | 0) : null;
        const _ocl = (p.info && p.info.cloneIdx != null) ? (p.info.cloneIdx | 0) : null;
        if (p.amount > 0 && _ncl !== _ocl) {
          try {
            const amt0 = p.amount, info0 = p.info || {};
            delete M.hurtPend[toHash];
            let st0 = null;
            try {
              if (info0.status && typeof info0.status.type === "string") {
                st0 = { type: String(info0.status.type).slice(0, 24) };
                for (const f of ["pct", "dps", "durationMs", "potency"]) if (isFinite(+info0.status[f])) st0[f] = +info0.status[f];
              }
            } catch (eSt0) { st0 = null; }
            broadcastNet({
              t: "hurt", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash,
              amount: amt0, magic: !!info0.magic, crit: !!info0.crit,
              status: st0,
              move: (typeof info0.move === "string" && info0.move) ? info0.move.slice(0, 32) : null,
              el: String(info0.el || "physical").slice(0, 16),
              fam: String(info0.fam || "unarmed").slice(0, 16),
              cl: (info0.cloneIdx != null) ? (info0.cloneIdx | 0) : null,
              fromName: String(info0.fromName || "").slice(0, 24),
              fromRole: String(info0.fromRole || "").slice(0, 16),
              fromLv: Math.max(1, Math.min(125, info0.fromLv | 0 || 1)),
              srcId: (typeof info0.srcId === "string") ? info0.srcId.slice(0, 48) : null,
              srcKind: String(info0.srcKind || "").slice(0, 24),
            }, { viaServer: true });
          } catch (eFlush) { try { delete M.hurtPend[toHash]; } catch (eDel) {} }
        }
      } catch (eMix) { }
      p.amount = Math.min(9999, p.amount + amount);
      p.info = info || p.info; // latest attacker meta wins
    } catch (e) {}
  }
  function flushHurt() {
    if (!M.active || !isHost()) return;
    try {
      const keys = Object.keys(M.hurtPend);
      if (!keys.length) return;
      for (const k of keys) {
        const p = M.hurtPend[k];
        if (!p || !(p.amount > 0)) { delete M.hurtPend[k]; continue; }
        const amt = p.amount, info = p.info || {};
        delete M.hurtPend[k];
        let st = null;
        try {
          if (info.status && typeof info.status.type === "string") {
            st = { type: String(info.status.type).slice(0, 24) };
            for (const f of ["pct", "dps", "durationMs", "potency"]) if (isFinite(+info.status[f])) st[f] = +info.status[f];
          }
        } catch (e) { st = null; }
        broadcastNet({
          t: "hurt", channelId: M.channelId, hash: M.hash, from: M.hash, to: k,
          amount: amt, magic: !!info.magic, crit: !!info.crit,
          status: st,
          move: (typeof info.move === "string" && info.move) ? info.move.slice(0, 32) : null,
          el: String(info.el || "physical").slice(0, 16),
          fam: String(info.fam || "unarmed").slice(0, 16),
          // clone-indexed wound: lands on that copy, never the hero
          cl: (info.cloneIdx != null) ? (info.cloneIdx | 0) : null,
          fromName: String(info.fromName || "").slice(0, 24),
          fromRole: String(info.fromRole || "").slice(0, 16),
          fromLv: Math.max(1, Math.min(125, info.fromLv | 0 || 1)),
          srcId: (typeof info.srcId === "string") ? info.srcId.slice(0, 48) : null,
          srcKind: String(info.srcKind || "").slice(0, 24),
        }, { viaServer: true });
      }
    } catch (e) {}
  }
  // ---- visual combat actions: what other players' attacks LOOK like ----
  // Melee swings, flying spells, cast flashes, bomb blasts. Purely cosmetic
  // on receivers (Game replays particles/projectiles with NO damage — wounds
  // flow via hit/hurt), so this channel can never double-deal. P2P first,
  // relay fallback; throttled so a bow spammer can't flood the room.
  function sendAct(evt) {
    if (!M.active) return;
    try {
      if (!evt || typeof evt.kind !== "string") return;
      const k = evt.kind;
      if (k !== "melee" && k !== "proj" && k !== "cast" && k !== "blast" && k !== "angel") return;
      // delves share visuals per-instance (same did replays, other instances ignore)
      let did = null;
      try {
        const G = window.Game && window.Game.G;
        if (G && G.player && G.player.inDungeon) did = myDungeonId();
      } catch (e) { did = null; }
      const cx = +evt.x, cy = +evt.y;
      if (!isFinite(cx) || !isFinite(cy)) return;
      if (!did && (cx < -2000 || cx > 2000 || cy < -2000 || cy > 2000)) return;
      const o = {
        t: "act", channelId: M.channelId, hash: M.hash, from: M.hash, kind: k,
        x: Math.round(cx * 100) / 100, y: Math.round(cy * 100) / 100,
        did: did,
        dim: mpDim(),
      };
      if (isFinite(+evt.face)) o.face = +evt.face;
      if (k === "melee") {
        o.fxk = evt.fxk === "thrust" ? "thrust" : "arc";
        o.fxc = String(evt.fxc || "#ffffff").slice(0, 16);
        if (isFinite(+evt.fxlw)) o.fxlw = Math.max(1, Math.min(12, +evt.fxlw));
        if (isFinite(+evt.fxr)) o.fxr = Math.max(0.3, Math.min(4, +evt.fxr));
      } else if (k === "proj") {
        o.abId = String(evt.abId || "").slice(0, 24);
        o.color = String(evt.color || "#ffffff").slice(0, 16);
        if (evt.shape) o.shape = String(evt.shape).slice(0, 12);
        if (isFinite(+evt.size)) o.size = Math.max(0.3, Math.min(3, +evt.size));
        if (evt.core) o.core = String(evt.core).slice(0, 16);
        if (evt.glow) o.glow = String(evt.glow).slice(0, 16);
        if (isFinite(+evt.vx)) o.vx = Math.max(-30, Math.min(30, +evt.vx));
        if (isFinite(+evt.vy)) o.vy = Math.max(-30, Math.min(30, +evt.vy));
        if (isFinite(+evt.life)) o.life = Math.max(0.05, Math.min(12, +evt.life));
        if (Array.isArray(evt.trail)) {
          const tr = [];
          for (const tc of evt.trail) { if (tr.length >= 4) break; if (typeof tc === "string" && tc) tr.push(tc.slice(0, 16)); }
          if (tr.length) o.trail = tr;
        }
        if (evt.boom && typeof evt.boom === "object") {
          const bo = {};
          if (evt.boom.ring) bo.ring = String(evt.boom.ring).slice(0, 16);
          if (isFinite(+evt.boom.n)) bo.n = Math.max(0, Math.min(24, Math.round(+evt.boom.n)));
          if (isFinite(+evt.boom.crosses)) bo.crosses = Math.max(0, Math.min(12, Math.round(+evt.boom.crosses)));
          if (bo.ring || bo.n || bo.crosses) o.boom = bo;
        }
        if (evt.splash && typeof evt.splash === "object" && isFinite(+evt.splash.r)) {
          o.splash = { r: Math.max(0.3, Math.min(4, +evt.splash.r)), mult: 0.5 };
        }
        if (isFinite(+evt.waveR)) o.waveR = Math.max(0, Math.min(3, +evt.waveR));
        o.pass = !!evt.pass; o.magic = !!evt.magic;
        if (evt.el) o.el = String(evt.el).slice(0, 16);
        if (evt.fam) o.fam = String(evt.fam).slice(0, 16);
      } else if (k === "cast") {
        o.abId = String(evt.abId || "").slice(0, 24);
        o.color = String(evt.color || "#ffffff").slice(0, 16);
        o.snd = evt.snd === "heal" ? "heal" : "fire";
      } else if (k === "angel") {
        o.color = "#fff7ae";
      }
      broadcastHot(o, { key: "act", throttleMs: 80, fallback: true });
    } catch (e) {}
  }
  // ---- shared tile edits: publish + apply + fetch ----
  // One client's wreckage (smashed wall, chopped tree) becomes everyone's
  // ground. Breaks fan out live (P2P + relay — the breaker already applied
  // them locally); everyone applies them to loaded chunks and caches them for
  // walk-ins. Missed edits come from the HOST (requestTilesFromHost), never
  // from a hub: the host routes but stores nothing.
  // v18 dimension: same numbers, separate worlds — tile keys are dim-prefixed.
  // Legacy bare keys ("cx,cy,lx,ly") read as surf so old caches still apply.
  function tileKey(cx, cy, lx, ly, dim) { dim = normMpDim(dim == null ? mpDim() : dim); return dim + ":" + cx + "," + cy + "," + lx + "," + ly; }
  function parseTileKey(k) {
    try {
      let dim = "surf", rest = String(k || "");
      const ci = rest.indexOf(":");
      if (ci > 0 && (rest.slice(0, ci) === "hell" || rest.slice(0, ci) === "surf")) { dim = rest.slice(0, ci); rest = rest.slice(ci + 1); }
      const m = /^([^,]+),([^,]+),(\d+),(\d+)$/.exec(rest);
      if (!m) return null;
      return { dim, cx: +m[1], cy: +m[2], lx: +m[3], ly: +m[4] };
    } catch (e) { return null; }
  }
  // ---- full-chunk tile catch-up (host -> joiner) ----
  // One chunk = 256 tile bytes (0..128 fit in a byte) as base64 (~344 chars,
  // relay-safe). Unsolicited-safe on receipt: the host is authoritative, and
  // stamping an identical tile is a no-op. Capped: nearest 6 loaded chunks
  // per request — the 8s top-up converges the rest on the next passes.
  function tilesToB64(tiles) {
    try {
      let s = "";
      for (let i = 0; i < 256; i++) s += String.fromCharCode((tiles[i] | 0) & 0xff);
      try { if (typeof btoa === "function") return btoa(s); } catch (e) {}
      return null;
    } catch (e) { return null; }
  }
  function b64ToTiles(b64) {
    try {
      let s = null;
      try { if (typeof atob === "function") s = atob(String(b64 || "")); } catch (e) { return null; }
      if (!s || s.length !== 256) return null;
      const out = new Array(256);
      for (let i = 0; i < 256; i++) out[i] = s.charCodeAt(i) & 0xff;
      return out;
    } catch (e) { return null; }
  }
  function serveTileChunks(to, reqId, cx, cy, r, qdim) {
    try {
      if (!M.active || !isHost()) return;
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks) return;
      const cands = [];
      for (const [key, ch] of G.chunks) {
        try {
          if (!ch || !Array.isArray(ch.tiles) || ch.tiles.length !== 256) continue;
          const ccx = (ch.cx | 0), ccy = (ch.cy | 0);
          let cdim = "surf";
          try {
            const k = String(key || "");
            if (k.indexOf("h_") === 0) cdim = "hell";
            else if (k.indexOf("v_") === 0) cdim = "heaven";
            else if (ch.dim === "hell" || ch.dim === "heaven" || ch.dim === "surf") cdim = ch.dim;
          } catch (e2) {}
          if (cdim !== qdim) continue;
          if (Math.abs(ccx - cx) > r || Math.abs(ccy - cy) > r) continue;
          cands.push({ ccx, ccy, cdim, ch, d: Math.abs(ccx - cx) + Math.abs(ccy - cy) });
        } catch (e2) {}
      }
      cands.sort((a, b) => a.d - b.d);
      let sent = 0;
      for (const c of cands) {
        if (sent >= 6) break;
        try {
          const b64 = tilesToB64(c.ch.tiles);
          if (!b64) continue;
          broadcastHot({ t: "tileChunk", channelId: M.channelId, hash: M.hash, from: M.hash, to: String(to || "").slice(0, 64), reqId: String(reqId || "").slice(0, 16), dim: c.cdim, cx: c.ccx, cy: c.ccy, tiles: b64 }, { viaServer: true });
          sent++;
        } catch (e2) {}
      }
    } catch (e) {}
  }
  function applyTileChunk(cx, cy, tiles, msgDim) {
    if (!M.active) return false;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks || !Array.isArray(tiles) || tiles.length !== 256) return false;
      const edim = normMpDim(msgDim);
      let wantKey = null;
      try { wantKey = window.World.chunkKey(cx, cy, edim); } catch (e) {}
      let ch = null;
      try { ch = (wantKey && G.chunks.get(wantKey)) || G.chunks.get(cx + "," + cy) || null; } catch (e) {}
      if (!ch || !Array.isArray(ch.tiles) || ch.tiles.length !== 256) return false;
      try { if (ch.dim && ch.dim !== edim) return false; } catch (e) {}
      let changed = false;
      for (let i = 0; i < 256; i++) {
        const tt = tiles[i] | 0;
        if (tt < 0 || tt > 128) continue;
        if (ch.tiles[i] === tt) continue;
        ch.tiles[i] = tt;
        try {
          const lx = i % 16, ly = (i / 16) | 0;
          if (ch.wallHP) delete ch.wallHP[lx + "," + ly];
        } catch (e2) {}
        try { scrubPlaceableRecords(ch, cx * 16 + (i % 16), cy * 16 + ((i / 16) | 0)); } catch (e2) {}
        try {
          const lx = i % 16, ly = (i / 16) | 0;
          const k = tileKey(cx, cy, lx, ly, edim);
          M.tileCache.delete(k); M.tileCache.set(k, tt);
          if (M.tileCache.size > 2500) { const fk = M.tileCache.keys().next().value; M.tileCache.delete(fk); }
        } catch (e2) {}
        changed = true;
      }
      if (changed) { try { window.World.saveChunk(ch); } catch (e2) {} }
      return changed;
    } catch (e) { return false; }
  }
  function publishTiles(list) {
    if (!M.active) return;
    try {
      const dim = mpDim();
      const clean = [];
      for (const e of (list || [])) {
        if (!e) continue;
        const cx = e.cx | 0, cy = e.cy | 0, lx = e.lx | 0, ly = e.ly | 0, t = e.t | 0;
        if (!isFinite(e.cx) || !isFinite(e.cy) || cx < -200 || cx > 200 || cy < -200 || cy > 200) continue;
        if (!isFinite(e.lx) || !isFinite(e.ly) || lx < 0 || lx > 15 || ly < 0 || ly > 15) continue;
        if (!isFinite(e.t) || t < 0 || t > 128) continue;
        clean.push({ cx, cy, lx, ly, t, dim });
        try {
          const k = tileKey(cx, cy, lx, ly, dim);
          M.tileCache.delete(k); M.tileCache.set(k, t);
          if (M.tileCache.size > 2500) { const fk = M.tileCache.keys().next().value; M.tileCache.delete(fk); }
        } catch (e2) {}
      }
      if (!clean.length) return;
      // host relay as fallback: the host routes but stores nothing
      broadcastHot({ t: "tile", channelId: M.channelId, hash: M.hash, from: M.hash, dim, list: clean }, { viaServer: true });
    } catch (e) {}
  }
  // Shared-ground convergence for player-built overlays: when a tile edit
  // lands (wall smashed, stall tile breached, ...), any local overlay record
  // on that exact tile (charter stall, home portal, placed furniture) dies
  // with it — on EVERY client including the owner's, so a smashed stall
  // stops being sold/used everywhere instead of ghosting on the owner's
  // screen. The owner's next pos layout then stops advertising it, and the
  // tile itself (RUBBLE) already persists via the tile channel.
  function scrubPlaceableRecords(ch, gx, gy) {
    if (!ch) return false;
    let changed = false;
    try {
      const k = gx + "," + gy;
      if (ch.shopStalls && ch.shopStalls[k]) { delete ch.shopStalls[k]; changed = true; }
    } catch (e) {}
    try {
      if (Array.isArray(ch.pois)) {
        const before = ch.pois.length;
        ch.pois = ch.pois.filter(q => !(q && q.type === "portal" && q.home && q.gx === gx && q.gy === gy));
        if (ch.pois.length !== before) changed = true;
      }
    } catch (e) {}
    try {
      if (Array.isArray(ch.furnPlaced)) {
        const before = ch.furnPlaced.length;
        ch.furnPlaced = ch.furnPlaced.filter(r => !(r && r.gx === gx && r.gy === gy));
        if (ch.furnPlaced.length !== before) changed = true;
      }
    } catch (e) {}
    return changed;
  }
  function applyTileList(list, msgDim) {
    if (!M.active) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks) return;
      const fallbackDim = normMpDim(msgDim);
      const touched = new Map();
      for (const e of (list || [])) {
        if (!e) continue;
        const cx = e.cx | 0, cy = e.cy | 0, lx = e.lx | 0, ly = e.ly | 0, t = e.t | 0;
        if (cx < -200 || cx > 200 || cy < -200 || cy > 200 || lx < 0 || lx > 15 || ly < 0 || ly > 15 || t < 0 || t > 128) continue;
        const edim = normMpDim(e.dim != null ? e.dim : fallbackDim);
        try {
          const k = tileKey(cx, cy, lx, ly, edim);
          M.tileCache.delete(k); M.tileCache.set(k, t);
          if (M.tileCache.size > 2500) { const fk = M.tileCache.keys().next().value; M.tileCache.delete(fk); }
        } catch (e2) {}
        // v18: only the matching dimension's chunks — same numbers, separate worlds.
        let wantKey = null;
        try { wantKey = window.World.chunkKey(cx, cy, edim); } catch (e2) {}
        let ch = null;
        try { ch = (wantKey && G.chunks.get(wantKey)) || G.chunks.get(cx + "," + cy) || null; } catch (e2) {}
        if (!ch) { try { ch = (wantKey && window.World._mem.chunks.get(wantKey)) || window.World._mem.chunks.get(cx + "," + cy) || window.World._mem.chunks.get("c_" + cx + "_" + cy) || null; } catch (e2) {} }
        try { if (ch && ch.dim && ch.dim !== edim) ch = null; } catch (e3) {}
        if (!ch || !Array.isArray(ch.tiles)) continue;
        const idx = ly * 16 + lx;
        if (ch.tiles[idx] === t) continue;
        ch.tiles[idx] = t;
        try { if (ch.wallHP) delete ch.wallHP[lx + "," + ly]; } catch (e2) {}
        // the ground changed under it: any player-built overlay on this
        // exact tile dies with it (smashed stall/portal/furniture converge).
        try { scrubPlaceableRecords(ch, cx * 16 + lx, cy * 16 + ly); } catch (e2) {}
        try { touched.set(wantKey || (cx + "," + cy), ch); } catch (e2) {}
      }
      for (const ch of touched.values()) { try { window.World.saveChunk(ch); } catch (e2) {} }
    } catch (e) {}
  }
  // re-apply cached overrides to freshly loaded chunks (walk-ins)
  function applyCachedTiles() {
    if (!M.active || !M.tileCache.size) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks) return;
      const touched = new Map();
      for (const [k, t] of M.tileCache) {
        const m = parseTileKey(k);
        if (!m) continue;
        const cx = m.cx, cy = m.cy, lx = m.lx, ly = m.ly;
        let wantKey = null;
        try { wantKey = window.World.chunkKey(cx, cy, m.dim); } catch (e) {}
        let ch = null;
        try { ch = (wantKey && G.chunks.get(wantKey)) || G.chunks.get(cx + "," + cy) || null; } catch (e2) {}
        if (!ch) continue;
        try { if (ch.dim && ch.dim !== m.dim) continue; } catch (e2) {}
        if (!Array.isArray(ch.tiles)) continue;
        const idx = ly * 16 + lx;
        if (ch.tiles[idx] === t) continue;
        ch.tiles[idx] = t;
        try { if (ch.wallHP) delete ch.wallHP[lx + "," + ly]; } catch (e2) {}
        // the ground changed under it: any player-built overlay on this
        // exact tile dies with it (smashed stall/portal/furniture converge).
        try { scrubPlaceableRecords(ch, cx * 16 + lx, cy * 16 + ly); } catch (e2) {}
        try { touched.set(wantKey || (cx + "," + cy), ch); } catch (e2) {}
      }
      for (const ch of touched.values()) { try { window.World.saveChunk(ch); } catch (e2) {} }
    } catch (e) {}
  }
  // ---- shared lootables: overworld chests + quest caches ----
  // POI truth lives on the HOST (its chunk save is the authority), but every
  // opener broadcasts its mutation instantly; the host's snapshots then carry
  // recent ops so late joiners and walk-ins converge. Ops are monotonic, so
  // last-write-wins is safe and every client (host included) applies them to
  // its own channel-scoped chunk copy.
  // ---- guild sync: exclusive board pins + shared commissions ----
  function sendGuild(obj) {
    try {
      if (!M.active) return;
      obj = obj || {};
      obj.channelId = M.channelId; obj.hash = M.hash; obj.from = M.hash;
      broadcastNet(obj, { viaServer: true });
    } catch (e) {}
  }
  // v18 dimension: same numbers, separate worlds — poi ids collide across dims
  // (ch_cx_cy_i exists in both), so ops are keyed dim:id and carry dim.
  function poiKey(id, dim) { dim = normMpDim(dim == null ? mpDim() : dim); return dim + ":" + String(id || "").slice(0, 48); }
  function parsePoiKey(k) {
    try {
      const s = String(k || "");
      const ci = s.indexOf(":");
      if (ci > 0 && (s.slice(0, ci) === "hell" || s.slice(0, ci) === "surf")) return { dim: s.slice(0, ci), id: s.slice(ci + 1).slice(0, 48) };
      return { dim: "surf", id: s.slice(0, 48) };
    } catch (e) { return { dim: "surf", id: String(k || "").slice(0, 48) }; }
  }
  function notifyPoiLooted(id, op, cx, cy, dim) {
    if (!M.active) return;
    try {
      id = String(id || "").slice(0, 48);
      if (!id) return;
      op = op === "removed" ? "removed" : "opened";
      cx = Math.round(+cx || 0); cy = Math.round(+cy || 0);
      if (cx < -200 || cx > 200 || cy < -200 || cy > 200) return;
      dim = normMpDim(dim == null ? mpDim() : dim);
      const key = poiKey(id, dim);
      const prev = M.poiOps.get(key) || M.poiOps.get(id);
      // Reliable delivery: the relay used to share one bucket with snapshots,
      // so a burst could drop a loot op forever. Track attempts and rebroadcast
      // a few times; receivers dedupe, so repeats are safe.
      if (prev && prev.op === op && (prev.attempts | 0) >= 4) return; // already known — don't rebroadcast
      const attempts = (prev && prev.op === op ? (prev.attempts | 0) : 0) + 1;
      M.poiOps.set(key, { op, cx, cy, dim, ts: Date.now(), attempts, mine: true });
      // drop any legacy bare-id twin so the composite key is the single truth
      try { if (key !== id && M.poiOps.has(id)) M.poiOps.delete(id); } catch (e) {}
      if (M.poiOps.size > 150) { const fk = M.poiOps.keys().next().value; M.poiOps.delete(fk); }
      broadcastHot({ t: "poi", channelId: M.channelId, hash: M.hash, from: M.hash, id, op, cx, cy, dim }, { viaServer: true });
    } catch (e) {}
  }
  function applyPoiOp(id, op, cx, cy, dim) {
    if (!M.active) return;
    try {
      id = String(id || "").slice(0, 48);
      if (!id) return;
      op = op === "removed" ? "removed" : "opened";
      cx = Math.round(+cx || 0); cy = Math.round(+cy || 0);
      dim = normMpDim(dim);
      const key = poiKey(id, dim);
      // every client persists what it learns (the host's copy is authority,
      // but each machine owns its channel-scoped chunk save)
      try {
        const G = window.Game && window.Game.G;
        let wantKey = null;
        try { wantKey = window.World.chunkKey(cx, cy, dim); } catch (e2) {}
        let ch = null;
        try { ch = (G && G.chunks && ((wantKey && G.chunks.get(wantKey)) || G.chunks.get(cx + "," + cy))) || null; } catch (e2) {}
        if (!ch) { try { ch = (wantKey && window.World._mem.chunks.get(wantKey)) || window.World._mem.chunks.get(window.World.chunkKey(cx, cy, dim)) || null; } catch (e2) {} }
        try { if (ch && ch.dim && ch.dim !== dim) ch = null; } catch (e3) {}
        if (ch && Array.isArray(ch.pois)) {
          if (op === "removed") {
            const before = ch.pois.length;
            ch.pois = ch.pois.filter(p => !p || p.id !== id);
            if (ch.pois.length !== before) { try { window.World.saveChunk(ch); } catch (e2) {} }
          } else {
            const poi = ch.pois.find(p => p && p.id === id);
            if (poi && !poi.opened) { poi.opened = true; try { window.World.saveChunk(ch); } catch (e2) {} }
          }
        }
      } catch (e2) {}
      const prev = M.poiOps.get(key) || M.poiOps.get(id);
      // preserve our own resend counter: our relay echo must not wipe attempts
      if (!prev || prev.op !== op || (prev.dim && prev.dim !== dim)) M.poiOps.set(key, { op, cx, cy, dim, ts: Date.now(), mine: !!(prev && prev.mine) });
      try { if (key !== id && M.poiOps.has(id)) { const _old = M.poiOps.get(id); if (!_old || _old.dim !== "hell") M.poiOps.delete(id); } } catch (e) {}
      if (M.poiOps.size > 150) { const fk = M.poiOps.keys().next().value; M.poiOps.delete(fk); }
    } catch (e) {}
  }
  // re-apply known loot ops to freshly streamed chunks (walk-ins)
  function applyCachedPois() {
    if (!M.active || !M.poiOps.size) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks) return;
      for (const [key, o] of M.poiOps) {
        if (!o) continue;
        const pk = parsePoiKey(key);
        const id = (o && o.id) || pk.id || String(key);
        const dim = normMpDim((o && o.dim) || pk.dim);
        const cx = Math.round(+o.cx || 0), cy = Math.round(+o.cy || 0);
        let wantKey = null;
        try { wantKey = window.World.chunkKey(cx, cy, dim); } catch (e) {}
        let ch = null;
        try { ch = (wantKey && G.chunks.get(wantKey)) || G.chunks.get(cx + "," + cy) || null; } catch (e2) {}
        if (!ch || !Array.isArray(ch.pois)) continue;
        try { if (ch.dim && ch.dim !== dim) continue; } catch (e2) {}
        if (o.op === "removed") {
          const before = ch.pois.length;
          ch.pois = ch.pois.filter(p => !p || p.id !== id);
          if (ch.pois.length !== before) { try { window.World.saveChunk(ch); } catch (e2) {} }
        } else {
          const poi = ch.pois.find(p => p && p.id === id);
          if (poi && !poi.opened) { poi.opened = true; try { window.World.saveChunk(ch); } catch (e2) {} }
        }
      }
    } catch (e) {}
  }
  // Opener-side rebroadcast: recent loot ops (<30s old, <4 attempts) go out
  // again every few seconds until the host's snapshots pick them up. Cheap
  // (a few chests/caches per session) and idempotent on receipt.
  function resendRecentPois() {
    if (!M.active) return;
    try {
      const now = Date.now();
      if (now - (M.poiResendAt || 0) < 2500) return;
      M.poiResendAt = now;
      let sent = 0;
      for (const [pkey, o] of M.poiOps) {
        if (!o || sent >= 6) break;
        if (!o.mine) continue; // gossip would amplify: only the opener rebroadcasts
        if (now - (o.ts || 0) > 30000) continue;
        if ((o.attempts | 0) >= 4) continue;
        o.attempts = (o.attempts | 0) + 1;
        o.ts = now;
        try { const _pk = parsePoiKey(pkey); const _bid = String((_pk && _pk.id) || pkey).slice(0, 48); const _bd = normMpDim((o && o.dim) || (_pk && _pk.dim)); broadcastHot({ t: "poi", channelId: M.channelId, hash: M.hash, from: M.hash, id: _bid, op: o.op === "removed" ? "removed" : "opened", cx: o.cx | 0, cy: o.cy | 0, dim: _bd }, { viaServer: true }); sent++; } catch (e2) {}
      }
    } catch (e) {}
  }
  // Joiner-side catch-up: ask the HOST for loot state around (gx,gy). The host
  // answers from memory + a live scan of its loaded chunks, so even a host
  // reload (memory wiped, disk intact) converges. Resolves true on answer.
  function requestPoisFromHost(gx, gy, r) {
    return new Promise((resolve) => {
      try {
        if (!M.active || isHost()) { resolve(false); return; }
        if (!M.hostHash) { resolve(false); return; }
        const cx = Math.floor((+gx || 0) / 16), cy = Math.floor((+gy || 0) / 16);
        if (cx < -200 || cx > 200 || cy < -200 || cy > 200) { resolve(false); return; }
        const rr = Math.max(0, Math.min(3, r | 0 || 0));
        const reqId = "p" + ((++M.poiReqSeq) & 0xffffff).toString(36) + Date.now().toString(36).slice(-4);
        M.poiReqs.set(reqId, resolve);
        if (M.poiReqs.size > 8) { const fk = M.poiReqs.keys().next().value; M.poiReqs.delete(fk); }
        broadcastHot({ t: "poiReq", channelId: M.channelId, hash: M.hash, from: M.hash, to: M.hostHash, reqId, cx, cy, r: rr, dim: mpDim() }, { viaServer: true });
        setTimeout(() => { if (M.poiReqs.has(reqId)) { M.poiReqs.delete(reqId); resolve(false); } }, 4000);
      } catch (e) { try { resolve(false); } catch (e2) {} }
    });
  }
  // Measure relay round-trip (rpc echo) for the presence readout. Cheap (~2/s
  // max, 5s cadence) and never blocks gameplay on failure.
  async function pingRelay() {
    if (!M.active || !M.sockOpen) return null;
    try {
      const t0 = performance.now();
      await rpc("mpPeers", { channelId: M.channelId });
      const ms = Math.round((performance.now() - t0) * 10) / 10;
      try { M.netStats.relayMs = ms; M.netStats.lastPing = Date.now(); } catch (e) {}
      return ms;
    } catch (e) { return null; }
  }
  // ---- shared corpse raids: one raider per corpse ----
  function notifyLooted(id) {
    if (!M.active) return;
    try {
      id = String(id || "").slice(0, 48);
      if (!id) return;
      broadcastHot({ t: "loot", channelId: M.channelId, hash: M.hash, from: M.hash, id }, { viaServer: true });
    } catch (e) {}
  }
  async function fetchTiles(gx, gy, r) {
    if (!M.active) return [];
    // Tile truth lives on the HOST now: pull missed edits from it directly.
    // (The legacy mpTiles hub is gone — the stub answers [].)
    try { await requestTilesFromHost(gx, gy, r); } catch (e) {}
    return [];
  }
  // Ask the host for tile overrides around (gx,gy) and apply what it sends.
  // Resolves true on answer, false on timeout (host unreachable / dungeon).
  function requestTilesFromHost(gx, gy, r) {
    return new Promise((resolve) => {
      try {
        if (!M.active || isHost()) { resolve(false); return; }
        if (!M.hostHash) { resolve(false); return; }
        const cx = Math.floor((+gx || 0) / 16), cy = Math.floor((+gy || 0) / 16);
        if (cx < -200 || cx > 200 || cy < -200 || cy > 200) { resolve(false); return; }
        const rr = Math.max(0, Math.min(3, r | 0 || 0));
        const reqId = "q" + ((++M.tileReqSeq) & 0xffffff).toString(36) + Date.now().toString(36).slice(-4);
        M.tileReqs.set(reqId, resolve);
        if (M.tileReqs.size > 8) { const fk = M.tileReqs.keys().next().value; M.tileReqs.delete(fk); }
        broadcastHot({ t: "tileReq", channelId: M.channelId, hash: M.hash, from: M.hash, to: M.hostHash, reqId, cx, cy, r: rr, dim: mpDim() }, { viaServer: true });
        setTimeout(() => { if (M.tileReqs.has(reqId)) { M.tileReqs.delete(reqId); resolve(false); } }, 4000);
      } catch (e) { try { resolve(false); } catch (e2) {} }
    });
  }
  // Host world snapshot: NPC + mob identity/hp + clock for EVERY viewer
  // bubble. Ships ~1.6Hz over P2P with relay fallback; the fast pos channel
  // (sendSnapPos @~7Hz) keeps motion smooth between full snaps.
  // ---- viewer bubbles: everybody the host simulates for ----
  // The host is the world server for every overworld client, not just itself.
  // Viewers = host player (when overworld) + every fresh, overworld remote.
  // Joiners never need to ask explicitly: their 8Hz pos IS the request —
  // the host treats each viewer position as a player character and simulates
  // + streams that bubble to everyone.
  function viewers() {
    const out = [];
    try {
      const G = window.Game && window.Game.G;
      if (G && G.player && !G.player.inDungeon && isFinite(+G.player.x) && isFinite(+G.player.y)) {
        out.push({ hash: M.hash, self: true, x: +G.player.x, y: +G.player.y });
      }
      // v18: same-dimension viewers only — the dims share coordinates, so a
      // cross-dim remote must never shape bubbles, shares, or sims here.
      // (v21: single dim source — hero's dim, World only as backup.)
      let hdim = "surf", hdok = false;
      try {
        const _hd = G && G.player && G.player.dim;
        if (_hd === "hell" || _hd === "heaven" || _hd === "surf") { hdim = _hd; hdok = true; }
        else if (window.World && window.World.getDim) hdim = window.World.getDim();
      } catch (e) {}
      const now = Date.now();
      for (const r of M.remotes.values()) {
        if (!r || r.hash === M.hash || r.inDungeon) continue;
        if (!isFinite(+r.x) || !isFinite(+r.y)) continue;
        if (now - (r.lastUpdate || 0) > 8000) continue;
        try {
          const rdim = (r.dim === "hell" || r.dim === "heaven" || r.dim === "surf") ? r.dim : null;
          if (rdim && rdim !== hdim) continue;
        } catch (e2) {}
        out.push({ hash: r.hash, self: false, x: +r.x, y: +r.y });
      }
    } catch (e) {}
    return out;
  }
  // Host-side: anyone besides us watching the overworld (drives bubble sim).
  function viewerDist(x, y, vw) {
    let bd = 1e12;
    try { for (const v of vw) { const d = Math.hypot(x - v.x, y - v.y); if (d < bd) bd = d; } } catch (e) {}
    return bd;
  }
  // Per-bubble fair share for split parties: every viewer bubble gets its
  // own nearest slice (round-robin union, deduped) instead of one global
  // nearest-first cut. The old global slice(0,32) let a crowded town eat the
  // whole budget, so the other player's villagers went quiet >8s and their
  // replicas reaped — villagers popping in, then flickering out, on the far
  // screen. Round-robin order also keeps the fast channel's first-chunk-only
  // send fair: every bubble's nearest entities ride it.
  function fairBubble(slots, perViewer, vw) {
    try {
      const list = Array.isArray(slots) ? slots : [];
      const viewers = Array.isArray(vw) ? vw.filter(v => v && isFinite(+v.x) && isFinite(+v.y)) : [];
      if (!viewers.length || !list.length) return [];
      const per = [];
      for (const v of viewers) {
        const vx = +v.x, vy = +v.y;
        const arr = [];
        for (const s of list) {
          if (!s || s.id == null) continue;
          const d = Math.hypot(s.x - vx, s.y - vy);
          if (!(d < 46)) continue;
          arr.push({ s, d });
        }
        arr.sort((a, b) => a.d - b.d);
        per.push(arr.slice(0, Math.max(1, perViewer | 0)));
      }
      const seen = new Set(), out = [];
      for (let r = 0; r < Math.max(1, perViewer | 0); r++) {
        for (const arr of per) {
          if (r >= arr.length) continue;
          const s = arr[r].s;
          if (seen.has(s.id)) continue;
          seen.add(s.id); out.push(s);
        }
      }
      // sanity cap for many-viewer sessions (nearest-first beyond it)
      const cap = Math.max(1, perViewer | 0) * 4;
      if (out.length > cap) {
        const vd = (s) => viewerDist(s.x, s.y, viewers);
        out.sort((a, b) => vd(a) - vd(b));
        return out.slice(0, cap);
      }
      return out;
    } catch (e) {
      try { return (slots || []).slice(0, perViewer); } catch (e2) { return []; }
    }
  }
  // Relay cap guard: host→server messages over ~8000 chars are dropped whole
  // by the relay, so a crowded town used to lose EVERY snapshot (replicas
  // reaped → flicker; appearance never arrived → wrong looks). The full snap
  // sends several packed chunks; the fast channel sends the nearest-first
  // slice. Input lists are nearest-first, so a budget cut drops the FARTHEST
  // entries (off-screen, harmless) while the visible bubble always fits.
  function packSnap(list, budget) {
    const out = [];
    let cur = [], len = 0;
    for (const e of (list || [])) {
      let n = 0;
      try { n = JSON.stringify(e).length + 1; } catch (e2) { continue; }
      if (cur.length && len + n > budget) { out.push(cur); cur = []; len = 0; }
      cur.push(e); len += n;
    }
    if (cur.length) out.push(cur);
    return out.length ? out : [[]];
  }
  function sendSnap() {
    if (!M.active || !isHost()) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player) return;
      // shared delves ride the instance-scoped dEnts channel: never snap them
      // (the host's overworld truth resumes after the delve)
      if (G.player.inDungeon) return;
      const vw = viewers();
      const list = [];
      try {
        // per-bubble fair share (see fairBubble): split parties each get
        // their nearest slice instead of one global cut. Full identity per
        // bubble so every pos-tracked entity also gets identity + clock.
        const npcs = fairBubble((G.npcs || [])
          .filter(n => n && n.id && !n.inParty && isFinite(n.x ?? n.gx) && isFinite(n.y ?? n.gy))
          .map(n => ({ id: n.id, n, x: +((n.x ?? n.gx) || 0), y: +((n.y ?? n.gy) || 0) })), 32, vw);
        for (const { n } of npcs) {
          list.push({
            id: String(n.id).slice(0, 48), kind: "npc",
            x: +(+((n.x ?? n.gx) || 0)).toFixed(2), y: +(+((n.y ?? n.gy) || 0)).toFixed(2),
            hp: Math.max(0, Math.ceil(n.hp || 0)), maxHp: n.maxHp || 1, lv: n.lv || 1,
            dead: !(n.hp > 0), name: String(n.name || "").slice(0, 24),
            role: String(n.role || "villager").slice(0, 16), tint: String(n.tint || "").slice(0, 16),
            face: isFinite(n.faceAng) ? +(+n.faceAng).toFixed(2) : 0,
            app: (window.Appearance && n.appearance) ? window.Appearance.pack(n.appearance) : undefined,
          });
          if (n.looted) list[list.length - 1].looted = true;
        }
      } catch (e) {}
      try {
        // per-bubble fair share (see fairBubble) — corpses ride while
        // lootable (unlooted) so the kill leaves a body on every screen.
        const mobs = fairBubble((G.mobs || [])
          .filter(mo => mo && mo.id && !(mo.remoteOwned) && (!mo.corpse || !mo.looted) && isFinite(mo.x) && isFinite(mo.y))
          .map(mo => ({ id: mo.id, mo, x: +mo.x, y: +mo.y })), 28, vw);
        for (const { mo } of mobs) {
          list.push({
            id: String(mo.id).slice(0, 48), kind: String(mo.kind || "mob").slice(0, 24),
           x: +(+mo.x).toFixed(2), y: +(+mo.y).toFixed(2),
            hp: Math.max(0, Math.ceil(mo.hp || 0)), maxHp: mo.maxHp || 1, lv: mo.lv || 1,
            dead: !(mo.hp > 0), name: String(mo.name || mo.kind || "").slice(0, 24),
            tint: String(mo.tint || "").slice(0, 16),
            face: isFinite(mo.faceAng) ? +(+mo.faceAng).toFixed(2) : 0,
            // corpse purse: the replica's raid must pay what the host's pays
            gold: (mo.corpse ? Math.max(0, Math.round(mo.corpseGold || 0)) : undefined),
          });
          if (mo.looted) list[list.length - 1].looted = true;
          if (mo.submerged) list[list.length - 1].sub = true;
          if (mo.voidHidden) list[list.length - 1].voidH = true;
           // yield flag rides along: a beast the sim saw yield shows its
           // offer on every screen, so E-taming works for non-simulators
           if (mo.tameOffer && mo.hp > 0) list[list.length - 1].tame = true;
           if (mo.isBoss) list[list.length - 1].boss = true;
           try { if (mo.tameSubmitBase != null && isFinite(+mo.tameSubmitBase)) list[list.length - 1].tsb = +mo.tameSubmitBase; } catch (e) {}
        }
      } catch (e) {}
      if (!list.length && !isFinite(+G.dayTime) && !M.poiOps.size) return;
      // recent loot ops ride along so joiners + walk-ins converge
      // recent loot ops ride along so joiners + walk-ins converge: ops near
      // any viewer bubble (not just the newest — a newcomer needs the old
      // opened chest by their spawn, not the latest raid three towns over)
      let poiOut = null;
      try {
        poiOut = [];
        const _hdim = mpDim();
        for (const [pkey, o] of M.poiOps) {
          if (!o) continue;
          const _pk = parsePoiKey(pkey);
          const _od = normMpDim((o && o.dim) || (_pk && _pk.dim));
          if (_od !== _hdim) continue;
          const _bid = String((_pk && _pk.id) || pkey).slice(0, 48);
          let near = false;
          try {
            for (const v of vw) {
              if (Math.hypot((o.cx * 16 + 8) - v.x, (o.cy * 16 + 8) - v.y) < 70) { near = true; break; }
            }
          } catch (e3) { near = true; }
          if (!near) continue;
          poiOut.push({ id: _bid, op: o.op, cx: o.cx | 0, cy: o.cy | 0, dim: _od });
          if (poiOut.length >= 40) break;
        }
        if (!poiOut.length) poiOut = null;
      } catch (e2) { poiOut = null; }
      // Chunked: no single message may approach the ~8000-char relay cap
      // (5500 entry budget leaves room for clock + loot ops + envelope).
      // Chunks merge by id on receipt, so order doesn't matter.
      try {
        const chunks = packSnap(list, 5500);
        for (const c of chunks) {
          broadcastHot({ t: "snap", channelId: M.channelId, hash: M.hash, from: M.hash, sq: nextSq(), st: Date.now(), ep: M._epoch, dim: mpDim(), list: c, dayTime: Math.round(G.dayTime || 0), poi: poiOut && poiOut.length ? poiOut : undefined }, { key: "snap", throttleMs: 400, fallback: true });
        }
      } catch (e2) {}
      try { M._lastSnap = list; } catch (e2) {}
    } catch (e) {}
  }
  // Fast channel @~7Hz for every viewer bubble: pos/hp/dead for all, plus NPC
  // identity (name/role/lv), clock and burrow flags — packed nearest-first so
  // a crowded town truncates the far edge instead of losing the whole message
  // to the relay cap. This is what makes shared NPCs/mobs move smoothly.
  // Fast channel @~10Hz for every viewer bubble: pos/hp/dead for all, plus NPC
  // identity (name/role/lv), clock and burrow flags — packed nearest-first so
  // a crowded town truncates the far edge instead of losing the whole message
  // to the relay cap. Delta-compressed (only moved/changed entities resend,
  // plus a full refresh every ~2s for loss repair), so 10Hz costs less than
  // the old blind 7Hz. This is what makes shared NPCs/mobs move smoothly.
  function sendSnapPos() {
    if (!M.active || !isHost()) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player) return;
      if (G.player.inDungeon) return; // personal instance — never snapped
      const vw = viewers();
      if (!vw.length) return;
      // Delta compression: resend an entity only when it moved/changed, but
      // keep re-sending for ~350ms after it stops — those same-pos samples
      // tell receivers the velocity died, so dead reckoning holds exact rest
      // instead of coasting past the stop point. Full refresh ~every 2s.
      M._snapPTick = (M._snapPTick | 0) + 1;
      const full = (M._snapPTick % 20) === 1;
      const nowQ = Date.now();
      const prev = M._snapPPrev; // id -> {sig,x,y,moveT}
      const alive = new Set();
      const list = [];
      const consider = (id, e) => {
        try { alive.add(id); } catch (e2) {}
        const sig = [e.x, e.y, e.hp, e.dead ? 1 : 0, e.face || 0, e.looted ? 1 : 0, e.sub ? 1 : 0, e.voidH ? 1 : 0, e.name || "", e.role || "", e.tint || "", e.lv || 0].join("|");
        const p = prev.get(id);
        const moved = !p || Math.hypot(e.x - p.x, e.y - p.y) > 0.03;
        if (!full && p && p.sig === sig && nowQ - (p.moveT || 0) >= 350) return; // idle: silent
        prev.set(id, { sig, x: e.x, y: e.y, moveT: moved ? nowQ : (p ? p.moveT || 0 : 0) });
        list.push(e);
      };
      try {
        // per-bubble fair share (see fairBubble); round-robin order keeps the
        // first-chunk-only fast send fair across split parties.
        const npcs = fairBubble((G.npcs || [])
          .filter(n => n && n.id && !n.inParty && isFinite(n.x ?? n.gx) && isFinite(n.y ?? n.gy))
          .map(n => ({ id: n.id, n, x: +((n.x ?? n.gx) || 0), y: +((n.y ?? n.gy) || 0) })), 32, vw);
       for (const { n } of npcs) {
         const e = {
           id: String(n.id).slice(0, 48), kind: "npc",
           x: +(+((n.x ?? n.gx) || 0)).toFixed(2), y: +(+((n.y ?? n.gy) || 0)).toFixed(2),
            hp: Math.max(0, Math.ceil(n.hp || 0)), maxHp: n.maxHp || 1, lv: n.lv || 1,
            dead: !(n.hp > 0), name: String(n.name || "").slice(0, 24),
            role: String(n.role || "villager").slice(0, 16), tint: String(n.tint || "").slice(0, 16),
           face: isFinite(n.faceAng) ? +(+n.faceAng).toFixed(2) : 0,
         };
          if (n.looted) e.looted = true;
          consider(e.id, e);
        }
      } catch (e) {}
      try {
        // per-bubble fair share (see fairBubble) — corpses ride while lootable.
        const mobs = fairBubble((G.mobs || [])
          .filter(mo => mo && mo.id && !(mo.remoteOwned) && (!mo.corpse || !mo.looted) && isFinite(mo.x) && isFinite(mo.y))
          .map(mo => ({ id: mo.id, mo, x: +mo.x, y: +mo.y })), 28, vw);
       for (const { mo } of mobs) {
         const e = {
           id: String(mo.id).slice(0, 48), kind: String(mo.kind || "mob").slice(0, 24),
           x: +(+mo.x).toFixed(2), y: +(+mo.y).toFixed(2),
            hp: Math.max(0, Math.ceil(mo.hp || 0)), maxHp: mo.maxHp || 1, lv: mo.lv || 1,
            dead: !(mo.hp > 0),
           face: isFinite(mo.faceAng) ? +(+mo.faceAng).toFixed(2) : 0,
            gold: (mo.corpse ? Math.max(0, Math.round(mo.corpseGold || 0)) : undefined),
         };
          if (mo.looted) e.looted = true;
          if (mo.submerged) e.sub = true;
          if (mo.voidHidden) e.voidH = true;
          if (mo.isBoss) e.boss = true;
          try { if (mo.tameSubmitBase != null && isFinite(+mo.tameSubmitBase)) e.tsb = +mo.tameSubmitBase; } catch (e) {}
          consider(e.id, e);
        }
      } catch (e) {}
      // forget entities that left every viewer bubble (bounds the delta map)
      try {
        if (full) for (const k of [...prev.keys()]) if (!alive.has(k)) prev.delete(k);
      } catch (e2) {}
      if (!list.length) return;
       // clock rides the fast channel too, so a dropped full snap can't leave
       // the joiner's day/night behind (host Day 2 vs joiner Day 1). Packed
       // nearest-first: the visible bubble always fits under the relay cap.
       let dayP = NaN;
       try { dayP = window.Game && window.Game.G ? +window.Game.G.dayTime : NaN; } catch (e) {}
        try {
          const slim = (packSnap(list, 6000)[0] || []).slice();
          if (!slim.length) return;
           broadcastHot({ t: "snapP", channelId: M.channelId, hash: M.hash, from: M.hash, sq: nextSq(), st: Date.now(), ep: M._epoch, dim: mpDim(), list: slim, dayTime: isFinite(dayP) ? Math.round(dayP) : undefined }, { key: "snapP", throttleMs: 100, fallback: true });
        } catch (e2) {}
       try { M._lastSnapP = list; } catch (e2) {}
     } catch (e) {}
   }
  // Snapshot-buffer interpolation (the WoW/Minecraft approach): every
  // network position update is stored with its arrival time, and the renderer
  // draws the recent past (now - delay), lerping between the two bracketing
  // snapshots. Jittery arrivals then cause ZERO vibration — standing still is
  // rock solid, moving glides. Delay adapts to the measured update interval
  // (~2.2x, clamped 80-300ms), so P2P feels near-instant and relay stays
  // stable. Teleports (>14 tiles) clear the buffer instead of streaking.
  // Snapshot-buffer interpolation with dead reckoning (the WoW/Minecraft
  // approach): every accepted network update is stored with its arrival time,
  // and the renderer draws the recent past (now - delay), lerping between the
  // two bracketing samples. The delay adapts to the measured update interval
  // (~1.6x, clamped 60-180ms), so P2P (~50ms updates) renders ~80ms in the
  // past while relay-only (~120ms) stays stable. When packets run late, motion
  // extrapolates forward up to 200ms along the sender's velocity (or locally
  // derived motion) instead of freezing — that plus sequence-dropping stale
  // relay echoes is what kills both the latency and the jitter. Teleports
  // (>14 tiles) clear the buffer instead of streaking.
  function pushNetSample(rec, x, y, now) {
    try {
      if (!rec || !isFinite(x) || !isFinite(y)) return;
      if (!rec.buf) rec.buf = [];
      const last = rec.buf[rec.buf.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) > 14) rec.buf.length = 0;
      rec.buf.push({ x, y, t: now });
      if (rec.buf.length > 10) rec.buf.splice(0, rec.buf.length - 10);
      const l2 = rec.buf[rec.buf.length - 1];
      const p2 = rec.buf.length > 1 ? rec.buf[rec.buf.length - 2] : null;
      if (p2 && l2.t > p2.t) {
        const iv = l2.t - p2.t;
        if (isFinite(iv) && iv > 0 && iv < 5000) {
          rec._avgInt = rec._avgInt ? rec._avgInt * 0.8 + iv * 0.2 : iv;
          // locally derived velocity (tiles/sec, EMA) — the fallback when the
          // sender ships no velocity of its own (old clients, mob snapshots)
          const dtS = iv / 1000;
          if (dtS > 0.01) {
            const dvx = (l2.x - p2.x) / dtS, dvy = (l2.y - p2.y) / dtS;
            rec._dvx = (rec._dvx != null) ? rec._dvx * 0.6 + dvx * 0.4 : dvx;
            rec._dvy = (rec._dvy != null) ? rec._dvy * 0.6 + dvy * 0.4 : dvy;
            if (Math.hypot(rec._dvx, rec._dvy) < 0.1) { rec._dvx = 0; rec._dvy = 0; }
          }
        }
      }
    } catch (e) {}
  }
  function interpVel(rec, now) {
    // fresh sender velocity wins (pos channel); else derived motion; else rest
    try {
      if (rec.vx != null && rec._vxT && now - rec._vxT < 600 && isFinite(+rec.vx) && isFinite(+rec.vy)) {
        const s = Math.hypot(+rec.vx, +rec.vy);
        if (s > 0.05 && s < 30) return [+rec.vx, +rec.vy];
        if (s <= 0.05) return [0, 0];
      }
      if (rec._dvx != null && isFinite(+rec._dvx) && isFinite(+rec._dvy)) {
        const s2 = Math.hypot(+rec._dvx, +rec._dvy);
        if (s2 > 0.05 && s2 < 30) return [+rec._dvx, +rec._dvy];
      }
    } catch (e) {}
    return [0, 0];
  }
  function interpBuf(rec, now) {
    try {
      const buf = rec.buf;
      if (!buf || !buf.length) return [rec.x, rec.y];
      const avg = +rec._avgInt;
      const delay = (isFinite(avg) && avg > 0) ? Math.min(180, Math.max(60, avg * 1.6)) : 120;
      const rt = now - delay;
      let a = buf[0], b = null;
      for (let i = 0; i < buf.length; i++) {
        if (buf[i].t <= rt) a = buf[i];
        else { b = buf[i]; break; }
      }
      if (!b) {
        // render time is past the newest sample: extrapolate along velocity
        // (covers 1-2 lost packets), but never run away — 200ms max, 3 tiles
        // max — then hold exact. Stopped entities (v=0) never drift.
        const over = rt - a.t;
        if (over <= 0 || over > 200) return [a.x, a.y];
        const v = interpVel(rec, now);
        if (v[0] === 0 && v[1] === 0) return [a.x, a.y];
        const nx = a.x + v[0] * over / 1000, ny = a.y + v[1] * over / 1000;
        if (Math.hypot(nx - a.x, ny - a.y) > 3) return [a.x, a.y];
        return [nx, ny];
      }
      const span = b.t - a.t;
      const f = span > 0 ? Math.min(1, Math.max(0, (rt - a.t) / span)) : 1;
      return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f];
    } catch (e) { return [rec.x, rec.y]; }
  }
  function tickInterp(dt) {
    if (!M.active) return;
    try {
      void dt;
      const now = Date.now();
      for (const r of M.remotes.values()) {
        if (r.rx == null) { r.rx = r.x; r.ry = r.y; continue; }
        const p = interpBuf(r, now);
        if (p[0] != null && isFinite(p[0])) r.rx = p[0];
        if (p[1] != null && isFinite(p[1])) r.ry = p[1];
      }
      for (const s of M.shared.values()) {
        if (s.rx == null) { s.rx = s.x; s.ry = s.y; continue; }
        const q = interpBuf(s, now);
        if (q[0] != null && isFinite(q[0])) s.rx = q[0];
        if (q[1] != null && isFinite(q[1])) s.ry = q[1];
      }
      for (const d of M.dShared.values()) {
        if (d.rx == null) { d.rx = d.x; d.ry = d.y; continue; }
        const w = interpBuf(d, now);
        if (w[0] != null && isFinite(w[0])) d.rx = w[0];
        if (w[1] != null && isFinite(w[1])) d.ry = w[1];
      }
    } catch (e) {}
  }
  const _hitSentAt = new Map(); // entId -> ms of last hit ping (spam guard)
  function reportHit(tgt) {
    if (!M.active) return;
    try {
      if (!tgt || typeof tgt.id !== "string" || tgt.hp == null) return;
      // only mobs + npcs are shared (never players/party/tames here)
      const isMob = !!(tgt.xpReward || tgt.kind === "mob" || (tgt.id && tgt.id.startsWith("m_")));
      const isNpc = typeof tgt.id === "string" && tgt.id.startsWith("npc_");
      if (!isMob && !isNpc) return;
      const now = Date.now();
      const last = _hitSentAt.get(tgt.id) || 0;
      const dead = !(tgt.hp > 0);
      if (!dead && now - last < 350) return;
      _hitSentAt.set(tgt.id, now);
      // shared delves route through intents to the instance sim — a result-HP
      // report here would double-count stale wounds on top of the
      // authoritative outcome (same rule as the overworld intent path).
      try {
        const G = window.Game && window.Game.G;
        if (G && G.player && G.player.inDungeon && tgt.dungeonId && G.dungeon && String(tgt.dungeonId) === String(G.dungeon.id)) {
          return;
        }
      } catch (e) {}
      // host-authoritative overworld: while the host is fresh, guest blows
      // travel as intents (the host resolves them) — a result-HP report here
      // would double-count stale wounds on top of the authoritative outcome.
      // Shared delves keep their wound channel (owner-model convergence).
      try {
        if (!isHost() && Date.now() - (M.lastHostSnap || 0) < 6000) {
          const G2 = window.Game && window.Game.G;
          if (G2 && !(G2.player && G2.player.inDungeon)) return;
        }
      } catch (e) {}
      sendHit(tgt.id, Math.max(0, Math.round(tgt.hp || 0)), dead);
      // keep our own hub copy fresh so our next ents batch carries the wound
      try {
        const rec = M.shared.get(tgt.id);
        if (rec) { rec.hp = Math.max(0, Math.round(tgt.hp || 0)); rec.dead = dead; rec.ts = now; rec.lastUpdate = now; }
      } catch (e) {}
    } catch (e) {}
  }
  // merge the shared hub into the live world: adopt NPC wounds, spawn/update
  // mob shadows for mobs we didn't simulate. Called ~10x/sec from Game.update.
  function syncSharedToGame() {
    if (!M.active) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player) return;
      // delves use the instance-scoped hub (syncDungeonToGame) — never let
      // surface snapshots leak into crypt coordinates or vice versa
      if (G.player.inDungeon) return;
      const px = G.player.x, py = G.player.y;
      const now = Date.now();
      const myDim = mpDim();
      for (const s of M.shared.values()) {
        if (!s || !s.id) continue;
        // v18: same numbers, separate worlds — never materialize cross-dim shares.
        try { if ((s.dim === "hell" || s.dim === "heaven" || s.dim === "surf") && s.dim !== myDim) continue; } catch (e) {}
        if (now - (s.lastUpdate || 0) > 30000) continue;
        const dist = Math.hypot((s.x || 0) - px, (s.y || 0) - py);
        if (dist > 46) continue;
        if (s.kind === "npc") {
          try {
            // authority = the host's snapshots. Only the host simulates the
            // living world; everyone else purely renders its word.
            const auth = !!s.hostAuth;
            const n = (G.npcs || []).find(x => x && x.id === s.id);
            if (n) {
              // HOST TRUTH MIRROR (joiners): the host is the single computer
              // of this villager — adopt its HP/death exactly, up AND down.
              // Down-only merging forked phantom corpses (a local kill at 0
              // while the host healed back to full); exact mirroring plus
              // host-side intent resolution means every screen agrees.
              if (auth && !isHost() && !n.inParty && typeof s.hp === "number") {
                const nh = Math.max(0, s.hp);
                if (n.hp > 0 && nh <= 0) {
                  n.hp = 0;
                  try { window.Game.onKill(null, n); } catch (e2) {}
                } else if (n.hp <= 0 && nh > 0 && !s.dead) {
                  // host-side heal/revive/potion: stand the replica back up
                  // quietly (no toast — the host already announced the kill)
                  n.hp = nh; n.deadUntil = null; n.deadDay = null;
                  n.targetId = null; n.targetRef = null; n.hostileUntil = 0; n.aggro = false;
                  try { if (window.World && window.World.saveNpc) window.World.saveNpc(n); } catch (e3r) {}
                } else if (n.hp > 0) {
                  n.hp = nh;
                  if (n.hp <= 0) { n.hp = 0; try { window.Game.onKill(null, n); } catch (e2) {} }
                }
                if (s.dead && n.hp > 0) { n.hp = 0; try { window.Game.onKill(null, n); } catch (e2) {} }
              } else if (typeof s.hp === "number" && n.hp > 0 && s.hp < n.hp) {
                // wounds/death always sync (damage is never lost)
                n.hp = Math.max(0, s.hp);
                if (s.dead && n.hp > 0) n.hp = 0;
                if (n.hp <= 0 && !n.corpse) { try { window.Game.onKill(null, n); } catch (e2) {} }
              } else if (s.dead && n.hp > 0) {
                n.hp = 0;
                try { window.Game.onKill(null, n); } catch (e2) {}
              }
              // authority identity wins for non-simulators: same id, one person.
              if (auth && !isHost() && !n.inParty) {
                try {
                  if (s.name && s.name !== n.name) n.name = String(s.name).slice(0, 24);
                  if (s.role && s.role !== n.role) { n.role = String(s.role).slice(0, 16); try { if (window.AIDirector && window.AIDirector.ensurePersona) window.AIDirector.ensurePersona(n); } catch (e3) {} }
                  if (s.tint) n.tint = String(s.tint).slice(0, 16);
                  try { if (s.app && window.Appearance) n.appearance = window.Appearance.sanitize(s.app); } catch (e3b) { }
                  if (s.lv) n.lv = s.lv | 0;
                  if (s.maxHp) n.maxHp = s.maxHp;
                } catch (e3) {}
              }
              // authority positions win for non-simulators: glide to the
              // simulator instead of fighting it with local schedule walks.
              if (auth && !isHost() && isFinite(+s.x) && isFinite(+s.y)) {
                if (!n.inParty && n.hp > 0) {
                  // Interpolated target (single smoothing stage): the snapshot buffer
                  // already killed arrival jitter + deadbanded rest, so track its
                  // truth directly instead of adding a second low-pass lag.
                  const htx = isFinite(+s.rx) ? +s.rx : +s.x, hty = isFinite(+s.ry) ? +s.ry : +s.y;
                  n.hostTx = htx; n.hostTy = hty;
                  n.hostLockUntil = now + 2500;
                  if (isFinite(+s.face)) n.faceAng = +s.face;
                  // snap far-away desyncs, glide small gaps (see game schedule guard)
                  const nd = Math.hypot((n.x ?? n.gx ?? 0) - s.x, (n.y ?? n.gy ?? 0) - s.y);
                  if (nd > 14) { n.x = s.x; n.y = s.y; n.gx = s.x; n.gy = s.y; }
                }
              }
              // shared corpse raided elsewhere: render raided here too
              if (s.looted && !n.looted) { n.looted = true; }
            } else if (auth && !isHost() && !s.dead && dist < 42 && s.name && isFinite(+s.x) && isFinite(+s.y)) {
              // unknown shared villager: the simulator runs someone we never
              // met — materialize a glide replica (same id) so we see their
              // people instead of an empty town square
              try {
                if (window.AIDirector && window.AIDirector.makeNpcObject && window.World) {
                  const gx = +s.x, gy = +s.y;
                  const cx = Math.floor(gx / 16), cy = Math.floor(gy / 16);
                  let pname = "Wilds";
                  try {
                    const ch = (window.Game.G.chunks || new Map()).get(cx + "," + cy) || window.World._mem.chunks.get(cx + "," + cy) || window.World._mem.chunks.get("c_" + cx + "_" + cy);
                    if (ch && ch.placeName) pname = ch.placeName;
                  } catch (e4) {}
                  const mk = window.AIDirector.makeNpcObject({
                    id: s.id, name: String(s.name || "Traveler").slice(0, 40),
                    role: String(s.role || "villager").slice(0, 16),
                    gx, gy, chunkKey: window.World.chunkKey(cx, cy),
                    placeName: pname, dist: 0,
                  });
                  mk.x = gx; mk.y = gy; mk.gx = gx; mk.gy = gy;
                  if (s.tint) mk.tint = String(s.tint).slice(0, 16);
                  try { if (s.app && window.Appearance) mk.appearance = window.Appearance.sanitize(s.app); } catch (e4b) { }
                  if (s.lv) mk.lv = s.lv | 0;
                  if (s.maxHp) mk.maxHp = s.maxHp;
                  if (typeof s.hp === "number") mk.hp = Math.max(0, s.hp);
                  mk.hostTx = gx; mk.hostTy = gy; mk.hostLockUntil = now + 2500;
                  mk.fallback = false;
                  G.npcs.push(mk);
                }
              } catch (e3) {}
            }
          } catch (e2) {}
          continue;
        }
        // mob shadow
        try {
          let mo = null;
          try { mo = (G.mobs || []).find(x => x && x.id === s.id); } catch (e2) {}
          if (mo) {
           if (mo.remoteOwned) {
             // network revive: the entry stands back up (the direct revive ping
             // may have been missed — e.g. a looted corpse rode no snapshot
             // when it was revived). Mirrors Game.standUpRevived exactly.
             try {
               if (mo.corpse && !s.dead && typeof s.hp === "number" && s.hp > 0) {
                 mo.hp = Math.max(1, Math.round(s.hp));
                 mo.corpse = false; mo.looted = true; mo.deadUntil = null; mo.deadAt = null; mo.deadDay = null;
                 mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false;
                 try { mo.tameOffer = false; mo.tameOfferUntil = 0; } catch (eR) {}
                 try { mo.homeX = mo.x; mo.homeY = mo.y; mo.corpseGold = 0; } catch (eR) {}
                 try {
                   if (s.tsb != null && isFinite(+s.tsb)) { mo.tameSubmitBase = Math.max(0, +s.tsb); try { mo._apexTameRolled = false; mo._apexTameChosen = false; } catch (eR2) {} try { if (mo._tameDenyUntil) mo._tameDenyUntil = 0; } catch (eR2) {} }
                   else if (window.Entities && window.Entities.resetTameSubmit) window.Entities.resetTameSubmit(mo);
                 } catch (eR) {}
                 if (s.maxHp) { try { mo.maxHp = s.maxHp; } catch (eR) {} }
                 try { if (s.boss) mo.isBoss = true; } catch (eR) {}
               } else if (s.tsb != null && isFinite(+s.tsb) && mo.tameSubmitBase !== +s.tsb) {
                 try { mo.tameSubmitBase = Math.max(0, +s.tsb); } catch (eR) {}
               }
             } catch (eR) {}
             // replica: network target goes to tx/ty, x/y glides there in Game.update.
             // Interpolated target (single smoothing stage): the snapshot buffer
             // already smoothed + deadbanded this — track it directly, no extra lag.
             if (isFinite(+s.rx) || isFinite(+s.x)) {
               const ntx = isFinite(+s.rx) ? +s.rx : +s.x, nty = isFinite(+s.ry) ? +s.ry : +s.y;
               mo.tx = ntx; mo.ty = nty;
             }
             if (isFinite(+s.face)) mo.faceAng = +s.face;
              // burrow state rides the snapshots: a submerged mole draws its
              // diggings mound on replicas instead of walking around up top
              mo.submerged = !!s.sub; mo.voidHidden = !!s.voidH;
              if (s.boss) mo.isBoss = true;
              if (mo.x == null || !isFinite(mo.x)) { mo.x = mo.tx; mo.y = mo.ty; }
              if (typeof s.hp === "number") mo.hp = Math.max(0, s.hp);
              if (s.dead && mo.hp > 0) mo.hp = 0;
              if (s.looted && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
              if (s.tame && !mo.tameOffer && mo.hp > 0 && !mo.corpse) { mo.tameOffer = true; try { mo.tameOfferUntil = performance.now() + 45000; mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false; } catch (e2) {} }
              mo.maxHp = s.maxHp || mo.maxHp;
              // identity converges like NPCs: a replica born from a pos-only
              // batch (lv 1, template name) adopts the host's truth instead
              // of masquerading as a different mob forever.
              if (s.lv | 0) mo.lv = s.lv | 0;
              if (s.name) mo.name = String(s.name).slice(0, 24);
              if (s.maxHp) mo.maxHp = s.maxHp;
              if (s.tint) mo.tint = String(s.tint).slice(0, 16);
              if (mo.hp <= 0 && !mo.corpse) { try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
              // corpse convergence: the entry is the purse truth (onKill above
              // rolls a fresh local purse and resets looted — adopt the host's)
              if (mo.corpse && s.dead) {
                if (s.looted) { mo.looted = true; mo.corpseGold = 0; }
                else if (isFinite(+s.gold)) mo.corpseGold = Math.max(0, Math.round(+s.gold));
              }
              else if (now - (s.lastUpdate || 0) > 20000 && now - (M.lastHostSnap || 0) > 20000) {
                // the whole STREAM went quiet (host gone — not one capped or
                // out-of-range entry while the host is alive): take over
                // simulation locally instead of freezing in place.
                mo.remoteOwned = false; mo.owner = null;
              }
            } else if (s.hostAuth && !isHost()) {
             // network revive: the entry stands back up (the direct revive ping
             // may have been missed — e.g. a looted corpse rode no snapshot
             // when it was revived). Mirrors Game.standUpRevived exactly.
             try {
               if (mo.corpse && !s.dead && typeof s.hp === "number" && s.hp > 0) {
                 mo.hp = Math.max(1, Math.round(s.hp));
                 mo.corpse = false; mo.looted = true; mo.deadUntil = null; mo.deadAt = null; mo.deadDay = null;
                 mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false;
                 try { mo.tameOffer = false; mo.tameOfferUntil = 0; } catch (eR) {}
                 try { mo.homeX = mo.x; mo.homeY = mo.y; mo.corpseGold = 0; } catch (eR) {}
                 try {
                   if (s.tsb != null && isFinite(+s.tsb)) { mo.tameSubmitBase = Math.max(0, +s.tsb); try { mo._apexTameRolled = false; mo._apexTameChosen = false; } catch (eR2) {} try { if (mo._tameDenyUntil) mo._tameDenyUntil = 0; } catch (eR2) {} }
                   else if (window.Entities && window.Entities.resetTameSubmit) window.Entities.resetTameSubmit(mo);
                 } catch (eR) {}
                 if (s.maxHp) { try { mo.maxHp = s.maxHp; } catch (eR) {} }
                 try { if (s.boss) mo.isBoss = true; } catch (eR) {}
               } else if (s.tsb != null && isFinite(+s.tsb) && mo.tameSubmitBase !== +s.tsb) {
                 try { mo.tameSubmitBase = Math.max(0, +s.tsb); } catch (eR) {}
               }
             } catch (eR) {}
             // the host covers this mob: become a replica and glide to it
             mo.remoteOwned = true; mo.owner = s.owner || M.hostHash;
             mo.tx = isFinite(+s.rx) ? +s.rx : +s.x; mo.ty = isFinite(+s.ry) ? +s.ry : +s.y;
             if (isFinite(+s.face)) mo.faceAng = +s.face;
              mo.submerged = !!s.sub; mo.voidHidden = !!s.voidH;
              if (s.boss) mo.isBoss = true;
              if (typeof s.hp === "number") mo.hp = Math.max(0, s.hp);
              if (s.dead && mo.hp > 0) mo.hp = 0;
              if (s.looted && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
              if (s.tame && !mo.tameOffer && mo.hp > 0 && !mo.corpse) { mo.tameOffer = true; try { mo.tameOfferUntil = performance.now() + 45000; mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false; } catch (e2) {} }
              if (s.lv | 0) mo.lv = s.lv | 0;
              if (s.name) mo.name = String(s.name).slice(0, 24);
              if (s.maxHp) mo.maxHp = s.maxHp;
              if (s.tint) mo.tint = String(s.tint).slice(0, 16);
              if (mo.hp <= 0 && !mo.corpse) { try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
              // corpse convergence (see replica branch above): entry purse wins
              if (mo.corpse && s.dead) {
                if (s.looted) { mo.looted = true; mo.corpseGold = 0; }
                else if (isFinite(+s.gold)) mo.corpseGold = Math.max(0, Math.round(+s.gold));
              }
            } else {
              // network revive from a peer (they revived a shared corpse): the
              // entry stands back up even though wounds never resurrect.
              try {
                if (mo.corpse && !s.dead && typeof s.hp === "number" && s.hp > 0) {
                  mo.hp = Math.max(1, Math.round(s.hp));
                  mo.corpse = false; mo.looted = true; mo.deadUntil = null; mo.deadAt = null; mo.deadDay = null;
                  mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false;
                  try { mo.tameOffer = false; mo.tameOfferUntil = 0; } catch (eR) {}
                  try { mo.homeX = mo.x; mo.homeY = mo.y; mo.corpseGold = 0; } catch (eR) {}
                  try {
                    if (s.tsb != null && isFinite(+s.tsb)) { mo.tameSubmitBase = Math.max(0, +s.tsb); try { mo._apexTameRolled = false; mo._apexTameChosen = false; } catch (eR2) {} try { if (mo._tameDenyUntil) mo._tameDenyUntil = 0; } catch (eR2) {} }
                    else if (window.Entities && window.Entities.resetTameSubmit) window.Entities.resetTameSubmit(mo);
                  } catch (eR) {}
                  if (s.maxHp) { try { mo.maxHp = s.maxHp; } catch (eR) {} }
                  try { mo.shareTs = s.ts || Date.now(); } catch (eR) {}
                } else if (s.tsb != null && isFinite(+s.tsb) && mo.tameSubmitBase !== +s.tsb) {
                  try { mo.tameSubmitBase = Math.max(0, +s.tsb); } catch (eR) {}
                }
              } catch (eR) {}
              // locally simulated mob that someone else also sees: adopt wounds
              // only if theirs is newer and lower (avoids resurrecting kills)
              if ((s.ts || 0) >= (mo.shareTs || 0) && typeof s.hp === "number" && s.hp < mo.hp) {
                mo.hp = Math.max(0, s.hp);
                mo.shareTs = s.ts;
                if (s.dead && mo.hp > 0) mo.hp = 0;
                if (mo.hp <= 0 && !mo.corpse) { try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
              }
              // ...but always adopt a raid done elsewhere (one raider per corpse)
              if (s.looted && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
              // ...and a yield granted elsewhere (the sim saw it beaten low)
              if (s.tame && !mo.tameOffer && mo.hp > 0 && !mo.corpse) { mo.tameOffer = true; try { mo.tameOfferUntil = performance.now() + 45000; mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false; } catch (e2) {} }
            }
          } else if (dist < 42 && (!s.dead || !s.looted)) {
            // unknown mob: someone else spawned it — materialize a shadow.
            // Unknown CORPSE (walked into a fresh kill): lay out the body
            // directly — no kill credit (credit is for witnesses, via the
            // replica-death path above), just the lootable husk.
            try {
              const tpl = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[s.kind]) || null;
              if (!tpl) continue;
              const mk = window.Entities.makeMob(s.kind, s.lv || 1, 60, 0);
              mk.id = s.id;
              mk.name = s.name || tpl.name || s.kind;
              if (s.tint) mk.tint = String(s.tint).slice(0, 16);
              mk.x = +s.x; mk.y = +s.y; mk.tx = +s.x; mk.ty = +s.y;
              mk.homeX = +s.x; mk.homeY = +s.y;
              mk.hp = Math.max(0, s.hp != null ? s.hp : tpl.hp);
              mk.maxHp = s.maxHp || mk.maxHp;
             mk.remoteOwned = true; mk.owner = s.owner || null;
              mk.submerged = !!s.sub; mk.voidHidden = !!s.voidH;
             if (s.boss) mk.isBoss = true;
             try { if (s.tsb != null && isFinite(+s.tsb)) { mk.tameSubmitBase = Math.max(0, +s.tsb); try { mk._apexTameRolled = false; mk._apexTameChosen = false; } catch (eT) {} } } catch (eT) {}
             if (s.tame && !s.dead) { mk.tameOffer = true; try { mk.tameOfferUntil = performance.now() + 45000; } catch (e2) {} }
             mk.shareTs = s.ts || now;
              if (s.dead) {
                mk.hp = 0; mk.corpse = true; mk.looted = false;
                mk.corpseGold = (isFinite(+s.gold) && +s.gold > 0) ? Math.max(0, Math.round(+s.gold)) : 1;
                mk.deadAt = now; mk.deadUntil = now + 120000; mk.deadDay = null;
                mk.targetId = null; mk.targetRef = null; mk.hostileUntil = 0;
              }
              mk.aggro = false; mk.targetId = null; mk.targetRef = null;
              G.mobs.push(mk);
            } catch (e2) {}
          }
        } catch (e2) {}
      }
      // thin-client enforcement (overworld only — dungeons are personal
      // instances): non-hosts keep party + host replicas only. Anything local
      // and private is despawned so two clients can never see different people
      try {
        if (!isHost() && G.player && !G.player.inDungeon) {
          const _myDim = mpDim();
          try {
            const keepNpc = new Set();
            for (const s of M.shared.values()) {
              if (s && s.id && s.kind === "npc" && now - (s.lastUpdate || 0) < 30000) {
                try { if ((s.dim === "hell" || s.dim === "heaven" || s.dim === "surf") && s.dim !== _myDim) continue; } catch (e3) {}
                keepNpc.add(s.id);
              }
            }
            if (keepNpc.size || (G.npcs || []).length) {
              G.npcs = (G.npcs || []).filter(n => !n || n.inParty || keepNpc.has(n.id));
            }
          } catch (e2) {}
          try {
            for (let i = (G.mobs || []).length - 1; i >= 0; i--) {
              const mo = G.mobs[i];
              if (!mo || mo.remoteOwned || mo.corpse || mo.isTame || mo.inParty) continue;
              try {
                const _se = M.shared.get(mo.id);
                if (!_se) { G.mobs.splice(i, 1); continue; }
                if ((_se.dim === "hell" || _se.dim === "heaven" || _se.dim === "surf") && _se.dim !== _myDim) { G.mobs.splice(i, 1); continue; }
                if (now - (_se.lastUpdate || 0) > 30000) { G.mobs.splice(i, 1); continue; }
              } catch (e3) { if (!M.shared.has(mo.id)) G.mobs.splice(i, 1); }
            }
          } catch (e2) {}
        }
      } catch (e2) {}
      // drop replicas whose owner deleted them long ago (and never locally owned)
      try {
        // drop replicas the stream stopped carrying: while the host streams,
        // a quiet entry means the host dropped it (kill — corpses ride no
        // snapshot — despawn, or a momentary cap cut), so keeping it would
        // fork a ghost copy that the host never sees. When the whole stream
        // is quiet the takeover above owns them instead, hence the long
        // budget there. Dungeons are personal instances — never reap there.
        if (G.player && !G.player.inDungeon) {
          const hostFresh = now - (M.lastHostSnap || 0) < 6000;
          const reapMs = hostFresh ? 8000 : 120000;
          for (let i = (G.mobs || []).length - 1; i >= 0; i--) {
            const mo = G.mobs[i];
            if (!mo || !mo.remoteOwned) continue;
            // replica corpses decay on their own clock (deadUntil, like
            // single-player) — reaping one the moment a crowded snapshot
            // truncates its entry would fork host (body) / joiner (nothing).
            if (mo.corpse) continue;
            const ent = M.shared.get(mo.id);
            if (!ent || now - (ent.lastUpdate || 0) > reapMs) G.mobs.splice(i, 1);
          }
        }
      } catch (e2) {}
      // bound the hub: entries the stream stopped refreshing are stale
      // wounds or ghosts — drop them after two quiet minutes (takeovers own
      // theirs by then via entry presence; the host resnaps anything real).
      try {
        if (!M._pruneAt || now - M._pruneAt > 5000) {
          M._pruneAt = now;
          for (const [k, v] of M.shared) if (now - (v.lastUpdate || 0) > 120000) M.shared.delete(k);
        }
      } catch (e2) {}
    } catch (e) {}
  }
  // Merge the shared delve hub into the live dungeon: adopt wounds, spawn/update
  // glide shadows for mobs we didn't simulate, adopt orphans when the sim
  // changes. Called ~20x/sec from Game.update (same cadence as overworld).
  function syncDungeonToGame() {
    if (!M.active) return;
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player || !G.player.inDungeon || !G.dungeon) return;
      const did = myDungeonId();
      if (!did) return;
      const me = String(M.hash || "").toLowerCase();
      const amSim = amDungeonSim(did);
      const px = G.player.x, py = G.player.y;
      const now = Date.now();
      const occ = dungeonOccupants(did);
      const occSet = new Set(occ);
      const myDim = mpDim();
      for (const s of M.dShared.values()) {
        if (!s || !s.id || String(s.did || "") !== String(did)) continue;
        try { if ((s.dim === "hell" || s.dim === "heaven" || s.dim === "surf") && s.dim !== myDim) continue; } catch (e) {}
        try { if (G.dungeon && (G.dungeon.dim === "hell" || G.dungeon.dim === "heaven" || G.dungeon.dim === "surf") && s.dim && G.dungeon.dim !== s.dim) continue; } catch (e2) {}
        if (now - (s.lastUpdate || 0) > 60000) continue;
        if (!isFinite(+s.x) || !isFinite(+s.y)) {
          // wound-only entry: adopt if we have the mob, else skip
          try {
            const mo0 = (G.mobs || []).find((x) => x && x.id === s.id);
            if (mo0 && typeof s.hp === "number" && s.hp < mo0.hp) {
              mo0.hp = Math.max(0, s.hp);
              if (s.dead && mo0.hp > 0) mo0.hp = 0;
              if (mo0.hp <= 0 && !mo0.corpse) { try { window.Game.onKill(s.owner, mo0); } catch (e2) {} }
            }
            if (mo0 && s.looted && !mo0.looted) { mo0.looted = true; mo0.corpseGold = 0; }
          } catch (e2) {}
          continue;
        }
        const dist = Math.hypot(s.x - px, s.y - py);
        if (dist > 46) continue;
        let mo = null;
        try { mo = (G.mobs || []).find((x) => x && x.id === s.id); } catch (e2) {}
        if (mo) {
          // unified sim: non-sims never own delve mobs — demote any local
          // into a replica so AI/HP run in exactly one place (the sim).
          try {
            if (!amSim && !mo.remoteOwned && !mo.corpse && !mo.isTame && !mo.inParty) {
              mo.remoteOwned = true; mo.owner = s.owner || null;
              try { mo.ownerHash = s.owner ? String(s.owner).toLowerCase() : (mo.ownerHash || null); } catch (e3) {}
              mo.tx = isFinite(+s.rx) ? +s.rx : +s.x; mo.ty = isFinite(+s.ry) ? +s.ry : +s.y;
            }
          } catch (e2) {}
          if (mo.remoteOwned) {
            // network revive: the sim stood this delve mob back up (direct ping
            // may have been missed). Mirrors Game.standUpRevived exactly.
            try {
              if (mo.corpse && !s.dead && typeof s.hp === "number" && s.hp > 0) {
                mo.hp = Math.max(1, Math.round(s.hp));
                mo.corpse = false; mo.looted = true; mo.deadUntil = null; mo.deadAt = null; mo.deadDay = null;
                mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false;
                try { mo.tameOffer = false; mo.tameOfferUntil = 0; } catch (eR) {}
                try { mo.homeX = mo.x; mo.homeY = mo.y; mo.corpseGold = 0; } catch (eR) {}
                try {
                  if (s.tsb != null && isFinite(+s.tsb)) { mo.tameSubmitBase = Math.max(0, +s.tsb); try { mo._apexTameRolled = false; mo._apexTameChosen = false; } catch (eR2) {} try { if (mo._tameDenyUntil) mo._tameDenyUntil = 0; } catch (eR2) {} }
                  else if (window.Entities && window.Entities.resetTameSubmit) window.Entities.resetTameSubmit(mo);
                } catch (eR) {}
                if (s.maxHp) { try { mo.maxHp = s.maxHp; } catch (eR) {} }
                try { if (isFinite(+s.x) && isFinite(+s.y)) { mo.x = +s.x; mo.y = +s.y; mo.tx = +s.x; mo.ty = +s.y; } } catch (eR) {}
              } else if (s.tsb != null && isFinite(+s.tsb) && mo.tameSubmitBase !== +s.tsb) {
                try { mo.tameSubmitBase = Math.max(0, +s.tsb); } catch (eR) {}
              }
            } catch (eR) {}
            if (isFinite(+s.rx) || isFinite(+s.x)) mo.tx = isFinite(+s.rx) ? +s.rx : +s.x;
            if (isFinite(+s.ry) || isFinite(+s.y)) mo.ty = isFinite(+s.ry) ? +s.ry : +s.y;
            if (isFinite(+s.face)) mo.faceAng = +s.face;
            if (mo.x == null || !isFinite(mo.x)) { mo.x = mo.tx; mo.y = mo.ty; }
            // sim truth mirror (non-sims): adopt HP exactly, up AND down —
            // down-only merging forks phantom corpses (see overworld fix).
            try {
              if (!amSim && typeof s.hp === "number") {
                const nh = Math.max(0, s.hp);
                if (mo.hp > 0 && nh <= 0) { mo.hp = 0; try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
                else mo.hp = nh;
                if (s.dead && mo.hp > 0) { mo.hp = 0; try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
                if (mo.corpse && s.dead) {
                  if (s.looted) { mo.looted = true; mo.corpseGold = 0; }
                  else if (isFinite(+s.gold)) mo.corpseGold = Math.max(0, Math.round(+s.gold));
                }
              } else if (typeof s.hp === "number" && s.hp < mo.hp) mo.hp = Math.max(0, s.hp);
            } catch (e2) { if (typeof s.hp === "number" && s.hp < mo.hp) mo.hp = Math.max(0, s.hp); }
            mo.submerged = !!s.sub;
            mo.voidHidden = !!s.voidH;
            if (s.boss) mo.isBoss = true;
            if (s.portalMimic && !mo.isPortalMimic) { mo.isBoss = true; mo.isPortalMimic = true; }
            if (s.tricked) { mo.mimicTricked = true; mo.mimicExposed = false; }
            else if (s.exposed) { mo.mimicTricked = false; mo.mimicExposed = true; }
            if (s.dead && mo.hp > 0) mo.hp = 0;
            if (s.looted && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
            if (s.tame && !mo.tameOffer && mo.hp > 0 && !mo.corpse) { mo.tameOffer = true; try { mo.tameOfferUntil = performance.now() + 45000; mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false; } catch (e2) {} }
            if (s.maxHp) mo.maxHp = s.maxHp;
            if (s.lv | 0) mo.lv = s.lv | 0;
            if (s.name) mo.name = String(s.name).slice(0, 24);
            if (mo.hp <= 0 && !mo.corpse) { try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
            else if (amSim && now - (s.lastUpdate || 0) > 15000 && now - (M.lastDEnts || 0) > 15000) {
              // orphan shadow (owner left the delve): the sim takes over locally
              mo.remoteOwned = false; mo.owner = null; mo.ownerHash = me;
              try { mo.tx = undefined; mo.ty = undefined; } catch (e3) {}
            }
          } else {
            // network revive: the sim stood this delve mob back up (direct ping
            // may have been missed). Mirrors Game.standUpRevived exactly.
            try {
              if (mo.corpse && !s.dead && typeof s.hp === "number" && s.hp > 0) {
                mo.hp = Math.max(1, Math.round(s.hp));
                mo.corpse = false; mo.looted = true; mo.deadUntil = null; mo.deadAt = null; mo.deadDay = null;
                mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false;
                try { mo.tameOffer = false; mo.tameOfferUntil = 0; } catch (eR) {}
                try { mo.homeX = mo.x; mo.homeY = mo.y; mo.corpseGold = 0; } catch (eR) {}
                try {
                  if (s.tsb != null && isFinite(+s.tsb)) { mo.tameSubmitBase = Math.max(0, +s.tsb); try { mo._apexTameRolled = false; mo._apexTameChosen = false; } catch (eR2) {} try { if (mo._tameDenyUntil) mo._tameDenyUntil = 0; } catch (eR2) {} }
                  else if (window.Entities && window.Entities.resetTameSubmit) window.Entities.resetTameSubmit(mo);
                } catch (eR) {}
                if (s.maxHp) { try { mo.maxHp = s.maxHp; } catch (eR) {} }
                try { if (isFinite(+s.x) && isFinite(+s.y)) { mo.x = +s.x; mo.y = +s.y; mo.tx = +s.x; mo.ty = +s.y; } } catch (eR) {}
              } else if (s.tsb != null && isFinite(+s.tsb) && mo.tameSubmitBase !== +s.tsb) {
                try { mo.tameSubmitBase = Math.max(0, +s.tsb); } catch (eR) {}
              }
            } catch (eR) {}
            // locally owned: adopt wounds only if strictly worse (never resurrect)
            if (typeof s.hp === "number" && s.hp < mo.hp) {
              mo.hp = Math.max(0, s.hp);
              if (s.dead && mo.hp > 0) mo.hp = 0;
              if (mo.hp <= 0 && !mo.corpse) { try { window.Game.onKill(s.owner, mo); } catch (e2) {} }
            }
            if (s.looted && !mo.looted) { mo.looted = true; mo.corpseGold = 0; }
            if (s.tame && !mo.tameOffer && mo.hp > 0 && !mo.corpse) { mo.tameOffer = true; try { mo.tameOfferUntil = performance.now() + 45000; mo.targetId = null; mo.targetRef = null; mo.hostileUntil = 0; mo.aggro = false; } catch (e2) {} }
          }
        } else if (!s.dead && dist < 42) {
          // unknown delve mob: materialize a glide shadow with the same id
          try {
            const tpl = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[s.kind]) || null;
            if (!tpl) continue;
            const mk = window.Entities.makeMob(s.kind, s.lv || 1, 60, 0);
            mk.id = s.id;
            mk.name = s.name || tpl.name || s.kind;
            if (s.tint) mk.tint = String(s.tint).slice(0, 16);
            mk.x = +s.x; mk.y = +s.y; mk.tx = +s.x; mk.ty = +s.y;
            mk.homeX = +s.x; mk.homeY = +s.y;
            mk.hp = Math.max(0, s.hp != null ? s.hp : tpl.hp);
            mk.maxHp = s.maxHp || mk.maxHp;
            mk.dungeonId = did;
            if (s.boss) mk.isBoss = true;
            if (s.portalMimic) { mk.isBoss = true; mk.isPortalMimic = true; }
            if (s.tricked) { mk.mimicTricked = true; mk.mimicExposed = false; }
            if (s.exposed) { mk.mimicTricked = false; mk.mimicExposed = true; }
            if (s.sub) mk.submerged = true;
            mk.voidHidden = !!s.voidH;
            try { if (s.tsb != null && isFinite(+s.tsb)) { mk.tameSubmitBase = Math.max(0, +s.tsb); try { mk._apexTameRolled = false; mk._apexTameChosen = false; } catch (eT) {} } } catch (eT) {}
            mk.remoteOwned = true; mk.owner = s.owner || null;
            mk.ownerHash = s.owner ? String(s.owner).toLowerCase() : null;
            if (s.tame) { mk.tameOffer = true; try { mk.tameOfferUntil = performance.now() + 45000; } catch (e2) {} }
            mk.aggro = false; mk.targetId = null; mk.targetRef = null;
            G.mobs.push(mk);
          } catch (e2) {}
        }
      }
      // sim adopts orphan shadows whose owner left AND whose hub entry went
      // stale (no fresh publishes): whoever still stands in the delve keeps
      // its teeth moving. Fresh hub rows mean the owner is still publishing
      // even if their pos hasn't arrived yet — never steal those.
      try {
        if (amSim) {
          for (const mo of (G.mobs || [])) {
            if (!mo || !mo.remoteOwned || mo.corpse) continue;
            if (String(mo.dungeonId || "") !== String(did)) continue;
            const oh = mo.ownerHash ? String(mo.ownerHash).toLowerCase() : (mo.owner ? String(mo.owner).toLowerCase() : null);
            if (oh && (oh === me || occSet.has(oh))) continue;
            try { const _rec = M.dShared.get(mo.id); if (_rec && now - (_rec.lastUpdate || 0) < 10000) continue; } catch (e3) {}
            // owner not in this delve anymore — take over
            mo.remoteOwned = false; mo.owner = null; mo.ownerHash = me;
            try { mo.tx = undefined; mo.ty = undefined; } catch (e2) {}
          }
        }
      } catch (e2) {}
      // reap shadows the stream dropped (killed/despawned/capped on the sim),
      // but never while the whole delve stream is quiet (takeover owns them).
      try {
        const streamQuiet = now - (M.lastDEnts || 0) > 20000;
        if (!streamQuiet) {
          for (let i = (G.mobs || []).length - 1; i >= 0; i--) {
            const mo = G.mobs[i];
            if (!mo || !mo.remoteOwned) continue;
            if (String(mo.dungeonId || "") !== String(did)) continue;
            const ent = M.dShared.get(mo.id);
            if (!ent || now - (ent.lastUpdate || 0) > 10000) G.mobs.splice(i, 1);
          }
        }
      } catch (e2) {}
      try {
        if (!M._dPruneAt || now - M._dPruneAt > 5000) {
          M._dPruneAt = now;
          for (const [k, v] of M.dShared) if (now - (v.lastUpdate || 0) > 120000) M.dShared.delete(k);
        }
      } catch (e2) {}
    } catch (e) {}
  }
  function getDShared(did) {
    const out = [];
    try {
      const now = Date.now();
      for (const s of M.dShared.values()) {
        if (!s) continue;
        if (did && String(s.did || "") !== String(did)) continue;
        if (now - (s.lastUpdate || 0) > 30000) continue;
        out.push(s);
      }
    } catch (e) {}
    return out;
  }
  function notifyDungeonLoot(id, did) {
    if (!M.active) return;
    try {
      id = String(id || "").slice(0, 48);
      if (!id) return;
      did = did || myDungeonId();
      if (!did) return;
      broadcastHot({ t: "dLoot", channelId: M.channelId, hash: M.hash, from: M.hash, did: String(did).slice(0, 48), id }, { viaServer: true });
    } catch (e) {}
  }
  function onSleepDone(dayTime) {
    try {
      if (window.Game && window.Game.G) {
        // The server keeps no clock: no dayTime means +6h on the local clock
        // (the host's snapshots then converge everyone).
        const dt = (dayTime === null || dayTime === undefined || !isFinite(+dayTime))
          ? ((window.Game.G.dayTime || 0) + 6 * 60)
          : +dayTime;
        window.Game.G.dayTime = dt;
        try { window.Game.G.player.dayTime = dt; } catch (e) {}
        const p = window.Game.G.player;
        p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.25));
        p.mp = Math.min(p.maxMp, p.mp + Math.round(p.maxMp * 0.5));
        try { if (window.Game.updateClock) window.Game.updateClock(); } catch (e) {}
        try { window.UI.updateHUD(); } catch (e) {}
      }
    } catch (e) {}
    M.sleeping = false;
    pushSys("😴 All travelers slept — dawn breaks (+6h).");
    try { window.UI.toast("😴 All travelers slept — dawn breaks (+6h).", 4000); } catch (e) {}
    try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
    try { saveNow(); } catch (e) {}
  }
  async function createChannel(name, partyMax, worldId) {
    name = String(name || "Wanderer").slice(0, 16) || "Wanderer";
    partyMax = clampPartyMax(partyMax == null ? 4 : partyMax);
    // Host a CHOSEN world: its id namespaces the Hub + save folders, so the
    // same town, builds and heroes persist across sessions. Discovery stays
    // the fresh PeerJS id in the invite link (never this id).
    let w = getHostWorld(worldId);
    if (!w) w = defaultHostWorld();
    // Reuse the world's stored spawn so rehosts (and fresh guests) land in
    // the same starting town every session — not a new random one.
    let spawnType = (w.spawnType && w.spawnName) ? w.spawnType : "", spawnName = (w.spawnType && w.spawnName) ? w.spawnName : "";
    if (!spawnType || !spawnName) {
      try {
        const types = (window.CFG && window.CFG.SPAWN_TYPES) || ["town"];
        spawnType = types[(Math.random() * types.length) | 0] || "town";
        try {
          spawnName = (window.Names && window.Names.settlement(spawnType, (Math.random() * 0x7fffffff) | 0)) || spawnType;
        } catch (e) {
          const pools = (window.CFG && window.CFG.SPAWN_NAMES) || {};
          const pool = (pools[spawnType] && pools[spawnType].length) ? pools[spawnType] : [spawnType];
          spawnName = pool[(Math.random() * pool.length) | 0] || spawnType;
        }
      } catch (e) { spawnType = "town"; spawnName = "Cinderford"; }
    }
    try { storeName(name); } catch (e) {}
    const channelId = w.id;
    const hash = getHash();
    M.netMode = "host";
    M.pendingHost = { spawnType, spawnName, partyMax, hash, name, worldId: w.id };
    M.pendingJoin = null;
    await ensureSocket();
    try { await seedVisitorsFromDisk(w.id); } catch (e) {}
    try { touchHostWorld(w.id, { spawnType, spawnName, partyMax }); } catch (e) {}
    let _hid = null;
    try { _hid = (window.MPNet && window.MPNet.hostSessionId && window.MPNet.hostSessionId()) || (M.socket && M.socket.hostPeerId) || null; } catch (e) {}
    const j = { ok: true, channelId, hostPeerId: _hid, spawnType, spawnName, dayTime: 480, host: hash.toLowerCase(), partyMax };
    try { M.partyMax = clampPartyMax(j && isFinite(+j.partyMax) ? +j.partyMax : partyMax); } catch (e) {}
    return j;
  }
  // Pre-launch convergence for joiners: the living world arrives over the
  // relay/P2P AFTER joining (host snapshots ~1.6Hz + fast positions ~7Hz),
  // but the game loop (which materializes replicas) only runs once playing.
  // So pump the merge path directly here until the joiner's bubble is
  // populated — otherwise they launch into an empty town and villagers pop
  // in all at once seconds later. Resolves on: shared NPCs near the player,
  // ~2s of sustained host snapshots (genuinely empty wilderness), or timeout.
  function waitForInitialViewers(onTick) {
    return new Promise((resolve) => {
      try {
        if (!M.active || isHost()) { resolve("host"); return; }
        try { sendPos(); } catch (e) {}
        const t0 = Date.now();
        let freshStreak = 0, tickN = 0;
        const iv = setInterval(async () => {
          try {
            tickN++;
            // drive the merge path by hand (game update isn't running yet)
            try { if (window.Game) {
              if (window.Game.ensureChunks) { try { await window.Game.ensureChunks(); } catch (e2) {} }
              if (window.MP && window.MP.syncSharedToGame) { try { window.MP.syncSharedToGame(); } catch (e2) {} }
              if (tickN % 4 === 0 && window.Game.refreshNpcCache) { try { await window.Game.refreshNpcCache(); } catch (e2) {} }
            } } catch (e2) {}
            try { applyCachedTiles(); } catch (e2) {}
            try { applyCachedPois(); } catch (e2) {}
            let done = null;
            const G = window.Game && window.Game.G;
            const px = G && G.player ? +G.player.x : NaN, py = G && G.player ? +G.player.y : NaN;
            let nearN = 0;
            try {
              if (isFinite(px) && isFinite(py)) {
                const now = Date.now();
                for (const s of M.shared.values()) {
                  if (!s || s.kind !== "npc" || !s.name || s.dead) continue;
                  if (!isFinite(+s.x) || !isFinite(+s.y)) continue;
                  if (now - (s.lastUpdate || 0) > 30000) continue;
                  if (Math.hypot(+s.x - px, +s.y - py) < 42) { nearN++; break; }
                }
              }
            } catch (e2) {}
            const snapFresh = Date.now() - (M.lastHostSnap || 0) < 2500;
            freshStreak = snapFresh ? freshStreak + 1 : 0;
            if (nearN > 0) done = "npcs";
            else if (freshStreak >= 8) done = "stream";
            else if (Date.now() - t0 > 14000) done = "timeout";
            try { if (onTick) onTick({ nearN, freshStreak, elapsed: Date.now() - t0, snapCount: M.snapCount | 0 }); } catch (e2) {}
            if (done) { try { clearInterval(iv); } catch (e2) {} resolve(done); }
          } catch (e) { try { clearInterval(iv); } catch (e2) {} resolve("error"); }
        }, 250);
      } catch (e) { resolve("error"); }
    });
  }
  async function joinChannel(hostPeerIdOrLink, name, appearance = null, tint = null, opts = null) {
    // Two entries: (a) host enter right after createChannel — our own Hub is
    // already open (loopback join, no peer id needed); (b) guest join with a
    // host peer id / invite link. No takeovers: a dead host is just dead.
    // The name stays RAW here on purpose: returning heroes (local record or
    // the host's remembered snapshot) skip the creator, and true newcomers
    // are prompted post-handshake via opts.getName. Only the roster/hello
    // display name falls back to "Wanderer" — never the hero choice itself.
    let rawName = (typeof name === "string" && name.trim()) ? name.trim().slice(0, 16) : "";
    const joinName = rawName || "Wanderer";
    if (rawName) { try { storeName(rawName); } catch (e) {} }
    const hash = getHash();
    // The WORLD is the host's chosen world id: host-enter reads the live
    // Hub's id; guests adopt it from the welcome handshake (same folders,
    // same game on both sides). It is never typed in — only the invite's
    // ephemeral peer id is.
    let channelId = null;
    try {
      if (window.MPNet && window.MPNet.hubOpenFor && window.MPNet.hubOpenFor()) {
        M.netMode = "host";
        let liveWid = null;
        try { liveWid = (window.MPHost && window.MPHost.Hub.channelId()) || null; } catch (e2) {}
        if (!/^[A-Z0-9]{6,16}$/.test(String(liveWid || ""))) throw new Error("Host world is not open — host it from the title first.");
        channelId = String(liveWid);
        if (!M.pendingHost) M.pendingHost = { hash, name: joinName, spawnType: M.spawnType || "town", spawnName: M.spawnName || "Cinderford", partyMax: clampPartyMax(M.partyMax), worldId: channelId };
        else { try { M.pendingHost.hash = hash; M.pendingHost.name = joinName; M.pendingHost.worldId = channelId; } catch (e2) {} }
        M.pendingJoin = null;
        M._hostEnter = true;
      } else {
        const hostPeerId = parseHostInvite(hostPeerIdOrLink);
        if (!hostPeerId) throw new Error("That host code looks wrong — paste the host's code or full invite link.");
        M.netMode = "join";
        M.pendingJoin = { hostPeerId, hash, name: joinName };
        M.pendingHost = null;
        M._hostEnter = false;
      }
    } catch (e) {
      const hostPeerId = parseHostInvite(hostPeerIdOrLink);
      if (!hostPeerId) throw e;
      M.netMode = "join";
      M.pendingJoin = { hostPeerId, hash, name: joinName };
      M.pendingHost = null;
      M._hostEnter = false;
    }
    let raw = null;
    try {
      await ensureSocket();
      if (!M._hostEnter) {
        const wid = (M.socket && M.socket._worldId) || null;
        if (!/^[A-Z0-9]{6,16}$/.test(String(wid || ""))) throw new Error("Could not read the host's world — ask for a fresh link.");
        channelId = String(wid).toUpperCase();
      }
      raw = await rpc("mpJoin", { channelId, hash, name: joinName });
    } catch (e) {
      try { if (M.socket) { try { M.socket.destroy(); } catch (e2) {} } } catch (e2) {}
      M.socket = null; M.sockOpen = false;
      M.netMode = null; M.pendingJoin = null;
      throw e;
    }
    const j = JSON.parse(raw);
    if (j && j.ended) { handleHostEnded("join"); throw new Error("That stream has ended — ask the host for a fresh link."); }
    // Fixed world namespace; the SESSION is the ephemeral host peer id.
    // Host-enter (loopback) has no invite arg: read the live peer id instead.
    try {
      if (M._hostEnter) {
        let _hid2 = null;
        try { _hid2 = (window.MPNet && window.MPNet.hostSessionId && window.MPNet.hostSessionId()) || (M.socket && M.socket.hostPeerId) || null; } catch (e3) {}
        M.channelId = channelId; M.hash = hash; M.name = name; M.hostPeerId = _hid2;
      } else {
        M.channelId = channelId; M.hash = hash; M.name = name; M.hostPeerId = (M.pendingJoin && M.pendingJoin.hostPeerId) || null;
      }
    } catch (e3) { M.channelId = channelId; M.hash = hash; M.name = name; }
    M.hostHash = j.host ? String(j.host).toLowerCase() : null;
    // Same-identity trap: two tabs on one browser share one player id
    // (localStorage). The join "succeeds" but every pos echo-drops on both
    // ends (m.hash === M.hash), so the twins never see each other, grow no
    // proxies, and mobs never route them damage. Non-blocking — but say so
    // loudly instead of simulating a silent ghost session.
    try {
      if (!M._hostEnter && M.hostHash && String(hash || "").toLowerCase() === String(M.hostHash || "")) {
        try { if (window.UI && window.UI.toast) window.UI.toast("⚠️ Same hero identity as the host (same browser?) — open the guest in a different browser/profile, or you will be invisible to each other and take no damage.", 9000); } catch (e2) {}
        try { console.warn("[mp] guest joined with the host's own player hash — shared browser profile; sessions will ghost each other"); } catch (e2) {}
      }
    } catch (e) {}
    M.peers.clear(); M.seenNet = new Set(); M.poiOps.clear(); M.dShared.clear(); M.dPoiOps.clear(); M.snapCount = 0; M.p2pOk = 0; M.ended = false;
    try { M.tileCache.clear(); } catch (e) {}
    try { M.tileReqs.clear(); M.poiReqs.clear(); M.netStats.relayMs = null; M.netStats.lastPing = 0; } catch (e) {}
    try {
      // One world, both sides: host and guest share the world id namespace,
      // so guests render the host's world (same folders, same game).
      if (j && j.channelId && /^[A-Z0-9]{6,16}$/.test(String(j.channelId))) {
        try { M.channelId = String(j.channelId); } catch (e2) {}
      }
      window.World.setChannel(M.channelId);
    } catch (e) {}
    try { window.World.resetWorldState(); } catch (e) {}
    M.spawnType = j.spawnType; M.spawnName = j.spawnName;
    // Your hero lives on YOUR machine now (local channel record) — never on
    // a server. The same hash in this channel restores your hero. The
    // host's local world (chunks + NPCs + hero) IS the session world.
    const G = window.Game.G;
    let returning = false;
    // Character memory: returning heroes skip the creator. Your own saved
    // hero first; else the host's remembered character for you (newer wins);
    // else ask for a fresh hero through opts.getName (UI hides the loader).
    if (M._hostEnter && !name) name = "Wanderer";
    try { M.channelId = M.channelId || channelId; M.hash = M.hash || hash; } catch (e3) {}
    let chosen = null, choseHost = false;
    try {
      let localRec = null;
      try { localRec = await loadChannelHero(); } catch (e2) { localRec = null; }
      let visRec = null;
      try { visRec = (!M._hostEnter && j) ? normalizeVisitor(j.visitorHero) : null; } catch (e2) {}
      const localOk = !!(localRec && localRec.player);
      if (localOk && visRec) chosen = ((visRec.time || 0) > (localRec.time || 0)) ? visRec : localRec;
      else chosen = localOk ? localRec : visRec;
      choseHost = !!(chosen && chosen === visRec);
    } catch (e) { chosen = null; choseHost = false; }
    if (chosen && chosen.player) {
      name = String(chosen.player.name || "Wanderer").slice(0, 16) || "Wanderer";
      if (choseHost && !M._hostEnter) { try { M._welcomedBack = name; } catch (e2) {} }
    } else if (!name && !M._hostEnter && opts && typeof opts.getName === "function") {
      let picked = null;
      try { picked = await opts.getName(); } catch (e2) { picked = null; }
      if (!picked) throw new Error("Pick a hero to join.");
      name = String(picked.name || "Wanderer").slice(0, 16) || "Wanderer";
      appearance = picked.appearance || null; tint = picked.tint || null;
    }
    if (!name) name = "Wanderer";
    try { M.name = name; storeName(name); } catch (e3) {}
    try {
      const saved = chosen;
      if (saved && saved.player) {
        const s = saved.player;
       // returning hero: their saved look wins over any fresh choice
       const p = window.Entities.makePlayer(s.name || name, s.appearance || appearance || null, (typeof s.tint === "string" && s.tint) ? s.tint : (tint || null), (typeof s.gender === "string" && s.gender) ? s.gender : null);
       const strArr = (a, max, len) => {
         try { if (!Array.isArray(a)) return []; return a.filter(x => typeof x === "string" && x).map(x => x.slice(0, len)).slice(0, max); } catch (e) { return []; }
       };
       const cloneArr = (a) => {
         try { if (!Array.isArray(a)) return []; return a.map(x => (x && typeof x === "object") ? { ...x } : x); } catch (e) { return []; }
       };
       const normEquip = (e2) => {
         try {
           if (!e2 || typeof e2 !== "object") return null;
           const o = {};
           for (const sl of ["weapon", "armor", "trinket", "shield"]) {
             if (typeof e2[sl] === "string" && e2[sl] && e2[sl] !== "-") o[sl] = e2[sl].slice(0, 48);
           }
           if (!o.weapon && typeof e2.w === "string" && e2.w && e2.w !== "-") o.weapon = e2.w.slice(0, 48);
           if (!o.armor && typeof e2.a === "string" && e2.a && e2.a !== "-") o.armor = e2.a.slice(0, 48);
           return Object.keys(o).length ? o : null;
         } catch (e) { return null; }
       };
       const eqNorm = normEquip(s.equipment);
       const hbNorm = (() => {
         try {
           if (!Array.isArray(s.hotbar) || !s.hotbar.length) return null;
           return s.hotbar.slice(0, 12).map(x => {
             if (!x) return null;
             if (typeof x === "string") return x.slice(0, 40);
             if (typeof x === "object" && (x.kind === "ability" || x.kind === "item") && typeof x.id === "string" && x.id) return { kind: x.kind, id: x.id.slice(0, 40) };
             return null;
           });
         } catch (e) { return null; }
       })();
       Object.assign(p, {
         lv: s.lv, xp: s.xp, x: s.x, y: s.y, hp: s.hp, maxHp: s.maxHp, mp: s.mp, maxMp: s.maxMp,
         gold: s.gold, role: s.role || "adventurer", tint: s.tint || "#4da3ff",
         statPoints: s.statPoints | 0, skillPoints: s.skillPoints | 0,
     treePts: { ...((s.treePts && typeof s.treePts === "object") ? s.treePts : {}) },
     treeProg: { ...((s.treeProg && typeof s.treeProg === "object") ? s.treeProg : {}) },
         inventory: cloneArr(s.inventory && s.inventory.length ? s.inventory : p.inventory),
         equipment: eqNorm || p.equipment,
         abilities: (s.abilities && s.abilities.length) ? strArr(s.abilities, 64, 32) : p.abilities,
         hotbar: hbNorm || p.hotbar,
         stats: (s.stats && typeof s.stats === "object") ? { ...s.stats } : (p.stats ? { ...p.stats } : p.stats),
         party: strArr(s.party, 16, 48),
         quests: cloneArr(s.quests),
         seenPlaces: (s.seenPlaces && s.seenPlaces.length) ? strArr(s.seenPlaces, 200, 48) : [j.spawnName],
         tames: (() => {
           try {
             if (!Array.isArray(s.tames)) return [];
             return s.tames.slice(0, 16).map(tt => {
               if (!tt || typeof tt !== "object") return tt;
               const b = { ...tt, targetRef: null, cooldowns: {}, buffs: {}, status: {} };
               b.slowUntil = 0; b.burnUntil = 0; b.burnTick = 0;
               b.hostileUntil = 0; b.atkCd = 0; b.aidCd = 0;
               b.parryUntil = 0; b.parryCdUntil = 0; b.reflectUntil = 0;
               b.hurtUntil = 0; b.hurtAng = 0;
               b.atkUntil = 0; b.atkKind = null; b.atkDur = 0;
               b._deadAt = 0; b._statusFlashUntil = 0; b._statusFlashColor = null;
               return b;
             });
           } catch (e) { return []; }
         })(),
       });
       // Look + race: the constructor sanitizes what it was given (packed
       // visitor looks included), but re-sanitize explicitly so a corrupted
       // appearance can never desync p.race from the face — that desync is
       // what turned every host-memory rejoin into a default human.
       try {
         if (s.appearance && window.Appearance) p.appearance = window.Appearance.sanitize(s.appearance, "adventurer");
       } catch (e2) {}
        // Progression that must survive channel rejoins + legacy world rebuilds:
        // allocated skill-point ranks (spell/weapon trees), learnt techniques,
        // unlocks, lifetime taming history and inn/stable state. Dropping these
        // here used to wipe every spent rank on return (fresh makePlayer has
        // empty perks), so old channel heroes lost their builds on rejoin.
        try {
          if (s.spellPerks && typeof s.spellPerks === "object") {
            p.spellPerks = {};
            for (const k of Object.keys(s.spellPerks)) {
              const v = s.spellPerks[k];
              p.spellPerks[k] = (v && typeof v === "object") ? { ...v } : v;
            }
          }
          if (s.weaponPerks && typeof s.weaponPerks === "object") {
            p.weaponPerks = {};
            for (const k of Object.keys(s.weaponPerks)) {
              const v = s.weaponPerks[k];
              p.weaponPerks[k] = (v && typeof v === "object") ? { ...v } : v;
            }
          }
          if (Array.isArray(s.techniques)) p.techniques = [...s.techniques];
          if (Array.isArray(s.unlocked)) p.unlocked = [...s.unlocked];
          if (s.techXp && typeof s.techXp === "object") {
            p.techXp = {
              el: { ...((s.techXp.el && typeof s.techXp.el === "object") ? s.techXp.el : {}) },
              fam: { ...((s.techXp.fam && typeof s.techXp.fam === "object") ? s.techXp.fam : {}) },
              kills: s.techXp.kills | 0, undeadKills: s.techXp.undeadKills | 0,
              uses: { ...((s.techXp.uses && typeof s.techXp.uses === "object") ? s.techXp.uses : {}) },
            };
          }
          if (typeof s.lifetimeTames === "number") p.lifetimeTames = s.lifetimeTames;
          if (typeof s.lifetimeInsectTames === "number") p.lifetimeInsectTames = s.lifetimeInsectTames;
          if (s.bestiary && typeof s.bestiary === "object") {
            p.bestiary = {
              seen: { ...((s.bestiary.seen && typeof s.bestiary.seen === "object") ? s.bestiary.seen : {}) },
              slain: { ...((s.bestiary.slain && typeof s.bestiary.slain === "object") ? s.bestiary.slain : {}) },
            };
          }
          if (typeof s.gender === "string" && s.gender) { try { p.gender = s.gender; } catch (e2) {} }
          if (typeof s.race === "string" && s.race) { try { p.race = s.race; } catch (e2) {} }
          if (s.raceBonus && typeof s.raceBonus === "object") { try { p.raceBonus = { ...s.raceBonus }; } catch (e2) {} }
          if (typeof s.raceBonusApplied === "boolean") { try { p.raceBonusApplied = s.raceBonusApplied; } catch (e2) {} }
          if (Array.isArray(s.innRooms)) p.innRooms = [...s.innRooms];
          if (typeof s.innUnlock === "number") p.innUnlock = s.innUnlock;
          if (Array.isArray(s.breedJobs)) p.breedJobs = s.breedJobs.map(jb => (jb && typeof jb === "object") ? { ...jb } : jb);
          if (typeof s.activeMountId === "string" || s.activeMountId == null) p.activeMountId = s.activeMountId || null;
          if (typeof s.mounted === "boolean") p.mounted = s.mounted;
          // Gear upgrade levels + nicknames ride the worn copies (smith/arcane/
          // altar/dojo work). Without these the bonuses silently un-applied.
          if (s.equipmentUp && typeof s.equipmentUp === "object") {
            try {
              p.equipmentUp = {};
              for (const sl of ["weapon", "armor", "trinket", "shield"]) {
                const v = Math.round(Number(s.equipmentUp[sl])) || 0;
                p.equipmentUp[sl] = Math.max(0, Math.min(5, v));
              }
            } catch (e2) {}
          }
          if (s.equipmentNick && typeof s.equipmentNick === "object") {
            try {
              p.equipmentNick = {};
              for (const sl of ["weapon", "armor", "trinket", "shield"]) {
                p.equipmentNick[sl] = (typeof s.equipmentNick[sl] === "string" && s.equipmentNick[sl]) ? s.equipmentNick[sl].slice(0, 24) : "";
              }
            } catch (e2) {}
          }
          // Stable pen grids (stabled-beast placement + bought pens). Without
          // these every rejoin collapsed the boxes and stranded stabled
          // beasts in awaiting-pen-space.
          if (Array.isArray(s.stableBoxes) && s.stableBoxes.length <= 8) {
            try {
              const nb = [];
              for (const b of s.stableBoxes) {
                if (!Array.isArray(b)) continue;
                nb.push(b.slice(0, 36).map(id => (typeof id === "string" && id) ? id.slice(0, 48) : null));
              }
              if (nb.length) p.stableBoxes = nb;
            } catch (e2) {}
          }
          if (Array.isArray(s.stableUnlock) && s.stableUnlock.length <= 8) {
            try { p.stableUnlock = s.stableUnlock.slice(0, 8).map(u => Math.max(0, Math.min(36, Math.round(Number(u)) || 0))); } catch (e2) {}
          }
          if (isFinite(Number(s.stableBox))) { try { p.stableBox = Math.max(0, Math.min(7, Math.round(Number(s.stableBox)))); } catch (e2) {} }
          // Dimension memory: a hero who left from hell wakes in hell, not
          // stranded on surf coordinates inside the hell disc (and vice versa).
          if (s.dim === "hell" || s.dim === "heaven" || s.dim === "surf") { try { p.dim = s.dim; } catch (e2) {} }
          if (s.posByDim && typeof s.posByDim === "object") {
            try {
              p.posByDim = p.posByDim || {};
              for (const dd of ["surf", "hell", "heaven"]) {
                const pp = s.posByDim[dd];
                if (pp && isFinite(Number(pp.x)) && isFinite(Number(pp.y))) p.posByDim[dd] = { x: Number(pp.x), y: Number(pp.y) };
                else if (pp == null && dd !== "surf" && p.posByDim[dd] !== undefined) p.posByDim[dd] = null;
              }
            } catch (e2) {}
          }
          if (typeof s.tag === "string" && s.tag) { try { p.tag = s.tag; } catch (e2) {} }
          for (const k of ["bossKills", "chestsOpened", "dungeonsEntered", "deepestDepth", "playTime", "deaths", "kills"]) {
            if (typeof s[k] === "number" && isFinite(s[k])) { try { p[k] = s[k]; } catch (e2) {} }
          }
          if (s.dungeonFloors && typeof s.dungeonFloors === "object") { try { p.dungeonFloors = { ...s.dungeonFloors }; } catch (e2) {} }
        } catch (e2) {}
        // main story survives channel rejoins (oath flags, spark quest, done
        // list). Dropping it here used to wipe the Hearthkeeper intro state
        // on every return, so the dialogue nagged again even with a charm
        // in hand. Host-remembered copies carry sanitized quest bodies too —
        // flags alone still suppress the auto-nag, and resume continues
        // mid-quest instead of re-lighting the spark.
        try {
          const sms = (s && s.mainStory && typeof s.mainStory === "object") ? s.mainStory : null;
          const sfl = (saved && saved.msFlags && typeof saved.msFlags === "object") ? saved.msFlags : null;
          const prim = (v) => {
            const t = typeof v;
            if (t === "string") return v.slice(0, 160);
            if (t === "number" || t === "boolean") return v;
            return undefined;
          };
          const cleanFlags = (f0) => {
            const out = {};
            try {
              if (f0 && typeof f0 === "object") {
                for (const k of Object.keys(f0).slice(0, 48)) {
                  const v = prim(f0[k]);
                  if (v !== undefined) out[String(k).slice(0, 40)] = v;
                }
              }
            } catch (e3) {}
            return out;
          };
          const cleanQuest = (q) => {
            try {
              if (!q || typeof q !== "object" || typeof q.id !== "string" || !q.id) return null;
              const c = { id: q.id.slice(0, 48), data: {} };
              for (const k of ["title", "desc", "story", "objective", "status", "doneHow"]) {
                if (typeof q[k] === "string") c[k] = q[k].slice(0, 4000);
              }
              if (isFinite(+q.createdAt)) c.createdAt = +q.createdAt;
              if (isFinite(+q.doneAt)) c.doneAt = +q.doneAt;
              if (q.data && typeof q.data === "object") c.data = q.data;
              return c;
            } catch (e3) { return null; }
          };
          if (sms) {
            const msOut = { active: null, done: [], flags: cleanFlags(sms.flags) };
            try { const a = cleanQuest(sms.active); if (a) msOut.active = a; } catch (e3) {}
            try {
              if (Array.isArray(sms.done)) {
                for (const q of sms.done.slice(-40)) { const c = cleanQuest(q); if (c) msOut.done.push(c); }
              }
            } catch (e3) {}
            try {
              if (sfl) {
                for (const k of Object.keys(sfl).slice(0, 48)) {
                  const kk = String(k).slice(0, 40);
                  if (msOut.flags[kk] === undefined) { const v = prim(sfl[k]); if (v !== undefined) msOut.flags[kk] = v; }
                }
              }
            } catch (e3) {}
            p.mainStory = msOut;
          } else if (sfl) {
            p.mainStory = { active: null, done: [], flags: cleanFlags(sfl) };
          }
        } catch (e2) {}
        // bound home hearth survives channel rejoins (validated; absent = spawn town, as ever)
        try {
          const hh = s.homeHearth;
          if (hh && typeof hh.name === "string" && hh.name && Number.isFinite(+hh.x) && Number.isFinite(+hh.y)) {
            p.homeHearth = { name: String(hh.name).slice(0, 28), x: +hh.x, y: +hh.y, dim: (hh.dim === "hell" ? "hell" : "surf") };
          }
        } catch (e) { }
        if (s.spawnType) p.spawnType = s.spawnType; else { p.spawnType = j.spawnType; }
        if (s.spawnName) p.spawnName = s.spawnName; else { p.spawnName = j.spawnName; }
        p.inDungeon = null; p.dungeonLevel = 1;
        try { window.Entities.migratePlayer(p); } catch (e) {}
        try { window.Entities.recalcDerived(p, true); } catch (e) {}
        p.hp = Math.min(p.maxHp, Math.max(1, s.hp));
        p.mp = Math.min(p.maxMp, Math.max(0, s.mp));
        G.player = p;
        G.dayTime = (typeof saved.dayTime === "number" && isFinite(saved.dayTime)) ? saved.dayTime : 8 * 60;
        try { G.player.dayTime = G.dayTime; } catch (e2) {}
        try { G.explored = new Set(saved.explored || []); } catch (e2) { G.explored = new Set(); }
        try { if (Array.isArray(saved.torches)) { G.torches = saved.torches; p.torches = saved.torches; } } catch (e2) {}
        returning = true;
      } else {
        const p = window.Entities.makePlayer(name, appearance, tint);
        p.spawnType = j.spawnType; p.spawnName = j.spawnName;
        p.party = []; p.quests = []; p.seenPlaces = [j.spawnName];
        p.inDungeon = null; p.dungeonLevel = 1;
        try { window.Entities.migratePlayer(p); } catch (e) {}
        try { window.Entities.recalcDerived(p, true); } catch (e) {}
        G.player = p;
        G.dayTime = 8 * 60;
        try { G.player.dayTime = G.dayTime; } catch (e2) {}
        G.explored = new Set();
        returning = false;
      }
    } catch (e) { throw new Error("Could not start in this channel — reload and retry."); }
    // Host-side legacy cleanup (mirrors singleplayer loadSlot's v11 rebuild):
    // a Created World from before v11 keeps stale chunks/NPCs/delves in the
    // local channel folders. Joiners only render the host's world, so only
    // the host wipes + resets its own hero's world-bound state here.
    let worldRebuilt = false;
    try {
      if (isHost() && window.World) {
        const st = G.player && G.player.spawnType;
        const def = window.World.SETTLE_DEF;
        const spawnLegacy = !st || st === "spawn" || !(def && def[st]);
        let storedLegacy = false;
        try { storedLegacy = await window.World.channelWorldIsLegacy(channelId); } catch (e) { storedLegacy = false; }
        if (spawnLegacy || storedLegacy) {
          worldRebuilt = await window.World.rebuildChannelWorld(channelId, G.player, { spawnType: j.spawnType, spawnName: j.spawnName });
          if (worldRebuilt) {
            try {
              const nst = G.player && G.player.spawnType, nnm = G.player && G.player.spawnName;
              if (nst) { j.spawnType = nst; M.spawnType = nst; }
              if (nnm) { j.spawnName = nnm; M.spawnName = nnm; }
            } catch (e) { }
            // Terrain-only rebuild: reset the mem cache (repairs in-flight
            // flows) but keep explored fog + torches — only the baked
            // chunks/delves were dropped, nothing else.
            try { window.World.resetWorldState(); } catch (e) { }
            returning = false;
          }
        }
      }
    } catch (e) { worldRebuilt = false; }
    try { M.worldRebuilt = !!worldRebuilt; } catch (e) { }
    G.mobs = []; G.projectiles = []; G.npcs = [];
    G.dungeon = null; G.bossSpawned = false; G.chunks = new Map();
    M.active = true; M.sleeping = false;
    M.sleepInfo = { sleeping: 0, online: 1 };
    applyJoin(j);
    // load the shared spawn ground, then play
    try { await window.Game.ensureChunks(); } catch (e) {}
    try { await window.Game.refreshNpcCache(); } catch (e) {}
    try {
      const s = await window.Game.safeTownLanding(0, 0);
      // only settle fresh spawns onto town ground; returners keep their spot
      // (a rebuilt world re-lands everyone at the new starting town instead)
      if (!returning || worldRebuilt) { G.player.x = s.x; G.player.y = s.y; }
      // preserved party members were re-anchored pre-chunks — regroup the
      // living ones at the final landing so nobody wakes inside a wall.
      if (worldRebuilt) { try { if (window.Game.summonParty) window.Game.summonParty({ quiet: true }); } catch (e2) {} }
    } catch (e) {}
    G.cam.x = G.player.x * 32 * (window.Game.viewZoom ? window.Game.viewZoom() : 2);
    G.cam.y = G.player.y * 32 * (window.Game.viewZoom ? window.Game.viewZoom() : 2);
    startLoops();
    sendPos(); saveNow();
    // Host worlds persist locally (folders + per-world heroes + remembered
    // visitors). The invite link is single-session (fresh peer id per host)
    // and dies with the host tab (peer.destroy).
    try {
      if (M._welcomedBack) {
        const _wb = M._welcomedBack; M._welcomedBack = null;
        try { window.UI.toast("Welcome back, " + _wb + " — your character was restored from this world.", 7000); } catch (e) {}
      }
    } catch (e) {}
    // Register with the host's memory right away (later saves refresh it).
    try {
      if (!isHost()) { M._visSentAt = Date.now(); try { await sendVisitorSnapshot(); } catch (e) {} }
    } catch (e) {}
    // pull missed ground edits from the HOST around spawn (plateaued towns etc.)
    try { fetchTiles(G.player.x, G.player.y, 3); } catch (e) {}
    // pull missed loot ops around spawn (chests opened while we were away)
    try { requestPoisFromHost(G.player.x, G.player.y, 3); } catch (e2) {}
    try { refreshPeers(); } catch (e) {}
    return j;
  }
  function startLoops() {
    stopLoops();
    // Send cadence: pos 50ms P2P (~20Hz, Minecraft rate) with relay throttled
    // to 1Hz while P2P covers everyone (~8Hz otherwise); snap 600ms full,
    // snapP 100ms delta-compressed fast; loot convergence rides the periodic
    // resend timer instead of the hot path.
    M.posTimer = setInterval(() => { try { sendPos(); } catch (e) {} }, 50);
    M.entsTimer = setInterval(sendEnts, 700);
    // shared delves: every occupant publishes what IT owns (~1.4Hz); the 20Hz
    // merge (syncDungeonToGame, driven from Game.update) keeps motion smooth
    M.dEntsTimer = setInterval(sendDEnts, 700);
    // host authority: full world snapshots + fast pos channel (P2P first,
    // relay fallback) so shared NPCs/mobs track like players
    M.snapTimer = setInterval(sendSnap, 600);
    M.fastTimer = setInterval(sendSnapPos, 100);
    M.pollTimer = setInterval(async () => { try { refreshPeers(); } catch (e) {} try { pingRelay(); } catch (e2) {} }, 8000);
    // channel autosave rides the player's own interval setting (5s checker so a
    // mid-session change takes effect without rebuilding the session).
    M.lastSaveT = Date.now();
    M.saveTimer = setInterval(() => {
      try {
        const iv = (window.Game && window.Game.autosaveIntervalMs) ? window.Game.autosaveIntervalMs() : 12000;
        if (Date.now() - (M.lastSaveT || 0) > iv) saveNow();
      } catch (e) {}
    }, 5000);
    // loot convergence + latency probe on slow timers, off the hot path
    try { M.poiResendTimer = setInterval(() => { try { resendRecentPois(); } catch (e) {} }, 5000); } catch (e) {}
    try { pingRelay(); } catch (e2) {}
  }
  function stopLoops() {
    try { clearInterval(M.posTimer); } catch (e) {}
    try { clearInterval(M.entsTimer); } catch (e) {}
    try { clearInterval(M.dEntsTimer); } catch (e) {}
    try { clearInterval(M.snapTimer); } catch (e) {}
    try { clearInterval(M.fastTimer); } catch (e) {}
    try { clearInterval(M.pollTimer); } catch (e) {}
    try { if (M.pollTimer2) clearInterval(M.pollTimer2); } catch (e) {}
    try { clearInterval(M.saveTimer); } catch (e) {}
    try { clearInterval(M.pingTimer); } catch (e) {}
    try { clearInterval(M.poiResendTimer); } catch (e) {}
    M.posTimer = M.pollTimer = M.saveTimer = M.entsTimer = M.dEntsTimer = M.snapTimer = M.fastTimer = M.pollTimer2 = M.pingTimer = M.poiResendTimer = 0;
  }
  async function leaveChannel(silent) {
    const id = M.channelId, h = M.hash;
    // Leaving with a character worth remembering: persist the local hero
    // first (same-machine rejoins read this — without it, up to a full
    // autosave interval of progress rested only on the host's copy), then
    // guests report their hero (best effort, 2.5s cap); hosts flush
    // remembered visitors to disk.
    try { if (M.active && M.channelId && M.hash) { try { await saveChannelHero(); } catch (e) {} } } catch (e) {}
    try {
      if (M.active && !isHost() && M.sockOpen && M.hash) {
        try { await Promise.race([sendVisitorSnapshot(), new Promise((res) => setTimeout(res, 2500))]); } catch (e) {}
      }
    } catch (e) {}
    try { if (M.active && isHost()) { try { await flushVisitorsToDisk(true); } catch (e) {} } } catch (e) {}
    M.active = false; M.sleeping = false; M.ended = false;
    try { M.tileReqs.clear(); } catch (e) {}
    try { M.poiReqs.clear(); } catch (e) {}
    // Star topology: single host connection only — peer.destroy() in the
    // facades tears down the fresh PeerJS ids. Nothing to fan out to.
    try { M.peers.clear(); } catch (e) {}
    M.hostHash = null; M.hostPeerId = null; M._hostEnter = false;
    try { saveAllies(); } catch (e) {}
    try { M.allies.clear(); M.allyReqs.clear(); M.allyOut.clear(); M.trade = null; } catch (e) {}
    stopLoops();
    try {
      if (id && M.socket && M.sockOpen) {
        try { await rpc("mpLeave", { channelId: id, hash: h }); } catch (e) {}
      }
    } catch (e) {}
    try { if (M.socket && M.socket.destroy) M.socket.destroy(); } catch (e) {}
    try { if (window.MPNet) window.MPNet.destroy(); } catch (e) {}
    M.socket = null; M.sockOpen = false;
    M.netMode = null; M.pendingJoin = null; M.pendingHost = null;
    // Per-world saves persist on this machine (folders + hero records):
    // leaving never deletes — deleting is explicit from the title.
    try { window.World.setChannel(null); } catch (e) {}
    try { window.World.resetWorldState(); } catch (e) {}
    M.partyMax = 4; try { M._partyAppSig = {}; } catch (e) {}
    M.channelId = null; M.hash = null; M.remotes.clear(); M.shared.clear(); M.dShared.clear(); M.dPoiOps.clear(); M.poiOps.clear(); M.chat = [];
    try { M.tileCache.clear(); } catch (e) {}
    try { if (window.UI.renderMpChat) window.UI.renderMpChat(); } catch (e) {}
    try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
    if (!silent) { try { history.replaceState(null, "", location.pathname); } catch (e) {} }
  }
  // Host-only: save the world, then end the stream for everyone. Sends the
  // explicit disconnect (P2P + relay + server fanout) BEFORE leaving so every
  // client gets the "host has ended the stream" notice and an instant kick.
  // Accidental drops never pass through here, so they never kick anyone.
  async function endHostStream() {
    if (!M.active || !isHost()) return false;
    try {
      broadcastNet({ t: "hostEnded", channelId: M.channelId, hash: M.hash, from: M.hash });
    } catch (e) {}
    try { await rpc("mpEnd", { channelId: M.channelId, hash: M.hash }); } catch (e) {}
    try { if (window.Game) await window.Game.saveGame(true); } catch (e) {}
    try { await saveChannelHero(); } catch (e) {}
    try { await flushVisitorsToDisk(true); } catch (e) {}
    try { await leaveChannel(true); } catch (e) {}
    return true;
  }
  async function setSleeping(on) {
    M.sleeping = !!on;
    if (!M.active) return { ok: false };
    try {
      const raw = await rpc("mpSleep", { channelId: M.channelId, hash: M.hash, sleeping: M.sleeping });
      const j = JSON.parse(raw);
      M.sleepInfo = { sleeping: j.sleeping | 0, online: j.online | 0 };
      if (j.allAsleep) onSleepDone(j.dayTime);
      try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
      return j;
    } catch (e) {
      M.sleeping = false;
      throw e;
    }
  }
  function clampPartyMax(v) { try { v = Math.round(Number(v)); if (!isFinite(v)) return 4; if (v < 0) v = 0; if (v > 8) v = 8; return v; } catch (e) { return 4; } }
  // NPC companion cap for this channel: the HOST decides (channel settings),
  // everyone enforces the same number. Solo play reads the static CFG cap.
  function partyCap() { try { if (M.active) return clampPartyMax(M.partyMax); } catch (e) {} try { return (window.CFG && window.CFG.PARTY_MAX) || 4; } catch (e) { return 4; } }
  // Pre-game settings read: live channel settings without joining (used by
  // the title-screen Server settings dialog). Read-only. Resolves
  // {partyMax, ended, online, host} or throws for unknown channels.
  // Removed with static channels: companions are picked on the Host card at
  // host time. Kept as a stub so old callers fail with the way out.
  async function getChannelSettings() {
    throw new Error("Channel settings are gone — pick companions on the Host card before hosting.");
  }
  // Pre-game settings write: the host changes channel settings while no one
  // is playing (title-screen Server settings dialog). Needs no active
  // session — auth is the per-channel host hash on this machine. The server
  // rejects non-hosts and any change while someone is online.
  async function setChannelPartyMax() {
    throw new Error("Channel settings are gone — pick companions on the Host card before hosting.");
  }
  async function setPartyMax(n) {
    if (!M.active) throw new Error("Not in a channel.");
    if (!isHost()) throw new Error("Only the host can change channel settings.");
    // In-channel changes are disabled: settings can only change while no
    // one is playing (title-screen Channel settings). The host hub enforces
    // this too — this guard just fails fast with the way out.
    try {
      if (window.Game && window.Game.G && window.Game.G.mode === "playing") {
        throw new Error("Channel settings can only be changed while no one is playing — leave the world first (Save & title), then use ⚙️ Settings.");
      }
    } catch (e) { if (/only be changed/.test(String((e && e.message) || ""))) throw e; }
    n = clampPartyMax(n);
    const raw = await rpc("mpPartyMax", { channelId: M.channelId, hash: M.hash, partyMax: n });
    const j = JSON.parse(raw);
    M.partyMax = clampPartyMax(j && j.partyMax);
    try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) {}
    return j;
  }
  async function reincarnate(newName, appearance = null, tint = null) {
    if (!M.active) throw new Error("Not in a channel.");
    newName = String(newName || "Wanderer").slice(0, 16) || "Wanderer";
    // Announce first (server only routes it now); the hero resets locally.
    const raw = await rpc("mpReincarnate", { channelId: M.channelId, hash: M.hash, name: newName });
    let j = {};
    try { j = JSON.parse(raw); } catch (e) {}
    M.name = newName; storeName(newName);
    const G = window.Game.G;
    try {
      const p = window.Entities.makePlayer(newName, appearance, tint);
      p.spawnType = M.spawnType; p.spawnName = M.spawnName;
      p.party = []; p.seenPlaces = [M.spawnName];
      p.inDungeon = null; p.dungeonLevel = 1;
      try { window.Entities.migratePlayer(p); } catch (e) {}
      try { window.Entities.recalcDerived(p, false); } catch (e) {}
      G.player = p;
      try {
        const t = await window.Game.safeTownLanding(0, 0);
        G.player.x = t.x; G.player.y = t.y;
      } catch (e) { G.player.x = 2.5; G.player.y = 4.5; }
      try { await window.Game.ensureChunks(); } catch (e) {}
      try { await window.Game.refreshNpcCache(); } catch (e) {}
      try { window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) {}
      try { await saveChannelHero(); } catch (e) {}
    } catch (e) {}
    M.sleeping = false;
    pushSys("♻️ You reincarnated as " + newName + " — level 1, no belongings, same world.");
    return j;
  }
  function getRemotes() {
    const out = [];
    const now = Date.now();
    for (const r of M.remotes.values()) {
      if (now - (r.lastUpdate || 0) > 60000) continue;
      const dx = (r.x ?? r.rx ?? 0) - (r.rx ?? r.x ?? 0);
      const dy = (r.y ?? r.ry ?? 0) - (r.ry ?? r.y ?? 0);
      out.push({
        id: "remote_" + r.hash, kind: "npc", isRemotePlayer: true, remoteHash: r.hash,
        name: r.name || "Traveler", role: r.role || "adventurer", lv: r.lv || 1,
        x: r.rx ?? r.x, y: r.ry ?? r.y, gx: r.rx ?? r.x, gy: r.ry ?? r.y,
        tx: r.x, ty: r.y, lag: Math.hypot(dx, dy),
        hp: r.hp, maxHp: r.maxHp || 50, mp: r.mp, maxMp: r.maxMp || 20,
        tint: r.tint, sleeping: !!r.sleeping, dun: !!r.inDungeon,
        dId: r.dId || null, dLv: r.dLv | 0 || 0,
        // chorus voices (flat sync from sendPos; null when unknown → no voice)
        stats: (r.stats && typeof r.stats === "object") ? { luk: r.stats.luk, cha: r.stats.cha } : null,
        luk: (r.luk != null && isFinite(+r.luk)) ? (+r.luk | 0) : null,
        cha: (r.cha != null && isFinite(+r.cha)) ? (+r.cha | 0) : null,
        // v18 dimension (same numbers, separate worlds): the receive path
        // always stamps this, so bubbles + torch matching never guess.
        dim: (r.dim === "hell" || r.dim === "heaven" || r.dim === "surf") ? r.dim : "surf",
        // planted torches (receive-path validated [x,y,scope,lvl] arrays).
        to: Array.isArray(r.to) ? r.to : null,
        // player-built overlays (receive-path validated [x,y,code,dim] arrays).
        pl: Array.isArray(r.pl) ? r.pl : null,
        // followers ride along as pin positions (render-only, never sim)
        party: Array.isArray(r.party) ? r.party.map((q, qi) => {
          // real follower position when the sender runs new code; otherwise
          // the legacy ring around the owner (old senders omit x/y)
          const _hx = (q && isFinite(+q.x)) ? +q.x : (r.rx ?? r.x ?? 0) + Math.cos(qi * 2.4 + 0.8) * 1.3;
          const _hy = (q && isFinite(+q.y)) ? +q.y : (r.ry ?? r.y ?? 0) + Math.sin(qi * 2.4 + 0.8) * 1.3;
          return {
            id: "remote_" + r.hash + "_p" + qi, kind: "npc",
            name: (q && q.n) || "Ally", lv: (q && q.lv) || 1, hp: (q && q.hp) || 0, maxHp: (q && q.maxHp) || 40,
            x: _hx, y: _hy, gx: _hx, gy: _hy,
            role: (q && q.role) || "villager", tint: (q && q.tint) || "#4da3ff",
            appearance: (q && q.app) || null,
            isRemoteParty: true, remoteHash: r.hash, ownerName: r.name || "Traveler",
          };
        }) : null,
        // look: custom face/outfit + equipped ids ride the pos channel
        appearance: r.app || null, w: r.w || null, a: r.a || null, s: r.s || null, o: r.o || null,
        equipment: ((r.w || r.a || r.s) ? { weapon: r.w || null, armor: r.a || null, shield: r.s || null } : null),
        // shadow-clone ditto positions ([x,y,hp] triples) for the renderer +
        // host-side proxies (render-identical copies of this hero)
        cl: Array.isArray(r.cl) ? r.cl : null,
        sailing: !!r.sailing, activeBoat: r.activeBoat || (r.sailing ? "raft" : null),
        // ridden mount as an npc-style mount record so the renderer draws the
        // beast under the hero (suppressed while sailing — the raft wins)
        mount: (!r.sailing && r.mountKind) ? { kind: r.mountKind, tint: r.mountTint || null } : null,
      });
    }
    return out;
  }
  function getShared(maxAgeMs) {
    const out = [];
    const now = Date.now();
    const maxAge = isFinite(+maxAgeMs) && +maxAgeMs > 0 ? +maxAgeMs : 30000;
    for (const s of M.shared.values()) {
      if (now - (s.lastUpdate || 0) > maxAge) continue;
      if (s.dead && now - (s.lastUpdate || 0) > 12000) continue;
      out.push(s);
    }
    return out;
  }
  // voluntary trade: remove locally, server moves it, recipient gets it live
  // Copies travel whole: bench-work (up 0-5) and custom names ride along.
  function cleanVariant(v) {
    let up = 0, nick = "";
    try {
      if (v && typeof v === "object") {
        up = Math.max(0, Math.min(5, (v.up | 0) || 0));
        nick = String(v.nick == null ? "" : v.nick).trim().replace(/\s+/g, " ").slice(0, 24);
      }
    } catch (e) { }
    return { up, nick };
  }
  async function give(toHash, itemId, n, ref, variant) {
    if (!M.active) throw new Error("Not in a channel.");
    toHash = String(toHash || "").toLowerCase();
    itemId = String(itemId || "");
    n = Math.max(1, Math.min(99, n | 0 || 1));
    const vv = cleanVariant(variant);
    const p = window.Game.G.player;
    let have = 0;
    try { have = window.Items.countVariant ? window.Items.countVariant(p, itemId, vv) : window.Items.countItem(p, itemId); } catch (e) { }
    if (have < n) throw new Error("You don't have that many of that copy.");
    // hell fragments travel WITH their delve-claims: peek the bids we will
    // hand over (removed locally only after the server accepts) so the
    // receiver's distinct set grows with the stack and they can forge.
    let bids = null;
    try {
      if (itemId === "hell_fragment" && window.Hell && p) {
        const keys = Object.keys(p.hellFragments || {}).slice(0, n);
        if (keys.length) bids = keys.map(k => String(k).slice(0, 64));
      }
    } catch (e) { bids = null; }
    const raw = await rpc("mpGive", { channelId: M.channelId, fromHash: M.hash, toHash, id: itemId, n, ref: ref || undefined, bids: bids || undefined, up: vv.up || undefined, nick: vv.nick || undefined });
    const j = JSON.parse(raw);
    n = j.n | 0 || n;
    try { window.Items.removeItem(p, itemId, n, vv); } catch (e) { }
    // drop the handed claims (the receiver now owns them) — only on success.
    try {
      if (itemId === "hell_fragment" && window.Hell && p && p.hellFragments) {
        const list = Array.isArray(bids) ? bids : [];
        for (const b of list.slice(0, n)) { try { delete p.hellFragments[String(b).replace(/_L\d+$/, "")]; } catch (e2) {} }
      }
    } catch (e) {}
    try { await window.Game.saveGame(true); } catch (e) { }
    try { saveNow(); } catch (e) { }
    return j;
  }
  async function healPlayer(toHash, amount) {
    if (!M.active) throw new Error("Not in a channel.");
    amount = Math.max(1, Math.min(9999, Math.round(+amount || 0)));
    if (!(amount > 0)) throw new Error("Bad amount.");
    const raw = await rpc("mpHeal", { channelId: M.channelId, fromHash: M.hash, toHash: String(toHash || "").toLowerCase(), amount });
    return JSON.parse(raw);
  }
  async function whisper(toHash, text) {
    if (!M.active) throw new Error("Not in a channel.");
    text = String(text || "").slice(0, 300).trim();
    if (!text) return { ok: false };
    const cid = M.hash + "." + Date.now().toString(36) + "." + (M.chatSeq = (M.chatSeq + 1) % 1000000);
    // pre-record BEFORE the rpc: the hub publishes during the call, so the
    // relay echo can beat the rpc response back — recording late would miss it
    // and render our own whisper a second time
    try { netDedupe("whcid:" + cid); } catch (e) {}
    const raw = await rpc("mpWhisper", { channelId: M.channelId, hash: M.hash, to: String(toHash || "").toLowerCase(), text, cid });
    pushChat({ from: M.hash, name: (M.name || "You"), text, ts: Date.now(), whisper: true, to: toHash });
    return JSON.parse(raw);
  }
  // ---------- allies: mutual no-damage + known-world pins ----------
  function alliesKey() { try { return "emberhold-mp-allies-" + String(M.channelId || "").toUpperCase(); } catch (e) { return null; } }
  function loadAllies() {
    try {
      M.allies.clear();
      const k = alliesKey();
      if (!k) return;
      const raw = localStorage.getItem(k);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) for (const h of arr) if (typeof h === "string" && /^[0-9a-f]{16,64}$/i.test(h)) M.allies.add(h.toLowerCase());
    } catch (e) {}
  }
  function saveAllies() {
    try { const k = alliesKey(); if (!k) return; localStorage.setItem(k, JSON.stringify([...M.allies].slice(0, 40))); } catch (e) {}
  }
  function isAlliedHash(h) { try { return !!h && M.allies.has(String(h).toLowerCase()); } catch (e) { return false; } }
  function allyList() { try { return [...M.allies]; } catch (e) { return []; } }
  function addAlly(h) { try { h = String(h || "").toLowerCase(); if (!/^[0-9a-f]{16,64}$/.test(h) || h === M.hash) return false; if (M.allies.has(h)) return true; M.allies.add(h); saveAllies(); return true; } catch (e) { return false; } }
  function dropAlly(h) { try { h = String(h || "").toLowerCase(); if (!M.allies.delete(h)) return false; saveAllies(); return true; } catch (e) { return false; } }
  function allyName(h) { try { const r = M.remotes.get(String(h || "").toLowerCase()); return (r && r.name) || "Traveler"; } catch (e) { return "Traveler"; } }
  function tradeItemLabel(id, variant) {
    try {
      const it = window.Items.ITEMS[id];
      if (it) {
        let nm = it.name;
        try {
          if (variant && (variant.up > 0 || variant.nick) && window.Items.variantName) nm = window.Items.variantName({ id, up: variant.up, nick: variant.nick });
        } catch (e) { }
        return nm;
      }
    } catch (e) {}
    return String(id).replace(/_/g, " ");
  }
  function requestAlly(toHash) {
    if (!M.active) throw new Error("Not in a channel.");
    toHash = String(toHash || "").toLowerCase();
    if (!toHash || toHash === M.hash) throw new Error("Bad traveler.");
    if (isAlliedHash(toHash)) throw new Error("Already allied.");
    const reqId = "a" + ((Math.random() * 0xffffff) | 0).toString(36) + Date.now().toString(36).slice(-4);
    M.allyOut.set(reqId, { to: toHash, ts: Date.now() });
    broadcastNet({ t: "allyReq", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash, reqId }, { viaServer: true });
    return reqId;
  }
  async function respondAlly(reqId, accept) {
    reqId = String(reqId || "");
    const q = M.allyReqs.get(reqId);
    if (!q) return false;
    M.allyReqs.delete(reqId);
    if (accept) {
      addAlly(q.from);
      // late-join coverage: a new ally who missed our wake still gets it.
      try { shareTowersWithNewAlly(); } catch (e) {}
      try { shareFragmentsWithNewAlly(); } catch (e) {}
      try { sharePeterSlainWithNewcomer(); } catch (e) {}
      try { shareCommissionsWithNewAlly(); } catch (e) {}
    }
    broadcastNet({ t: "allyRes", channelId: M.channelId, hash: M.hash, from: M.hash, to: q.from, reqId, accept: !!accept }, { viaServer: true });
    try { if (window.UI && window.UI.renderAllyState) window.UI.renderAllyState(); } catch (e) {}
    return true;
  }
  function removeAlly(toHash) {
    toHash = String(toHash || "").toLowerCase();
    if (!dropAlly(toHash)) return false;
    broadcastNet({ t: "allyRemove", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash }, { viaServer: true });
    try { if (window.UI && window.UI.renderAllyState) window.UI.renderAllyState(); } catch (e) {}
    return true;
  }
  // ---------- friendly revive/heal broadcast (NPCs + mobs; host applies) ----------
  function sendRevive(id, hp, isRevive, did, extra) {
    if (!M.active) return;
    try {
      if (typeof id !== "string" || !id) return;
      hp = Math.max(1, Math.min(999999, Math.round(+hp || 0)));
      if (!(hp > 0)) return;
      const out = { t: "revive", channelId: M.channelId, hash: M.hash, from: M.hash, id: id.slice(0, 48), hp, rv: !!isRevive, dim: mpDim(), did: (typeof did === "string" && did) ? did.slice(0, 48) : null };
      try {
        if (extra && typeof extra === "object") {
          if (typeof extra.kind === "string" && extra.kind) out.kind = String(extra.kind).slice(0, 24);
          if (isFinite(+extra.lv)) out.lv = Math.max(1, Math.min(125, Math.round(+extra.lv)));
          if (isFinite(+extra.x) && isFinite(+extra.y)) { out.x = +extra.x; out.y = +extra.y; }
          if (typeof extra.name === "string" && extra.name) out.name = String(extra.name).slice(0, 24);
          if (isFinite(+extra.maxHp)) out.maxHp = Math.max(1, Math.min(999999, Math.round(+extra.maxHp)));
          if (extra.boss) out.boss = true;
          if (extra.tsb != null && isFinite(+extra.tsb)) out.tsb = Math.max(0, +extra.tsb);
        }
      } catch (e) {}
      broadcastNet(out, { viaServer: true });
    } catch (e) {}
  }
  // ---------- tame claim: we pressed E on a yielding beast — the tame is
  // ours locally (Game.doTameMob), and every screen deletes the wild mob ----
  function sendTame(id) {
    if (!M.active) return;
    try {
      if (typeof id !== "string" || !id) return;
      const tid = id.slice(0, 48);
      // our own hub rows go quiet at once: replicas reap instantly instead
      // of lingering until the next snapshot drops the id
      try { M.shared.delete(tid); } catch (e) {}
      try { M.dShared.delete(tid); } catch (e) {}
      broadcastNet({ t: "tame", channelId: M.channelId, hash: M.hash, from: M.hash, id: tid, dim: mpDim(), did: myDungeonId() }, { viaServer: true });
    } catch (e) {}
  }
  // ---------- player trade (offer -> counter -> approve, items via mpGive) ----------
  function tradeId() { return "t" + ((Math.random() * 0xffffff) | 0).toString(36) + Date.now().toString(36).slice(-4); }
  function tradeOffer(toHash, itemId, n, variant) {
    if (!M.active) throw new Error("Not in a channel.");
    toHash = String(toHash || "").toLowerCase();
    itemId = String(itemId || "");
    n = Math.max(1, Math.min(99, n | 0 || 1));
    const vv = cleanVariant(variant);
    if (!toHash || toHash === M.hash || !itemId) throw new Error("Bad offer.");
    const p = window.Game.G.player;
    let have = 0;
    try { have = window.Items.countVariant ? window.Items.countVariant(p, itemId, vv) : window.Items.countItem(p, itemId); } catch (e) {}
    if (have < n) throw new Error("You don't have that many of that copy.");
    const offerId = tradeId();
    M.trade = { offerId, peer: toHash, peerName: allyName(toHash), dir: "out", myId: itemId, myN: n, myUp: vv.up, myNick: vv.nick, theirId: "", theirN: 0, stage: "offered", ts: Date.now() };
    broadcastNet({ t: "tradeOffer", channelId: M.channelId, hash: M.hash, from: M.hash, to: toHash, offerId, id: itemId, n, up: vv.up || undefined, nick: vv.nick || undefined }, { viaServer: true });
    try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
    return offerId;
  }
  function tradeCounter(offerId, itemId, n, variant) {
    // B answers A's offer: names the item B will give back ("" = nothing back).
    const tr = M.trade;
    if (!tr || tr.offerId !== offerId || tr.dir !== "in" || tr.stage !== "offered") throw new Error("No such offer.");
    const vv = cleanVariant(variant);
    itemId = String(itemId || "");
    n = Math.max(1, Math.min(99, n | 0 || 1));
    if (itemId) {
      const p = window.Game.G.player;
      let have = 0;
      try { have = window.Items.countVariant ? window.Items.countVariant(p, itemId, vv) : window.Items.countItem(p, itemId); } catch (e) {}
      if (have < n) throw new Error("You don't have that many of that copy.");
    }
    tr.myId = itemId; tr.myN = itemId ? n : 0; tr.myUp = vv.up; tr.myNick = vv.nick; tr.stage = "countered";
    broadcastNet({ t: "tradeCounter", channelId: M.channelId, hash: M.hash, from: M.hash, to: tr.peer, offerId, id: itemId, n, up: vv.up || undefined, nick: vv.nick || undefined }, { viaServer: true });
    try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
    return true;
  }
  function tradeDeclineMsg(offerId, toHash) {
    offerId = String(offerId || "");
    const tr = M.trade;
    const peer = toHash || (tr && tr.offerId === offerId && tr.peer);
    if (tr && tr.offerId === offerId) M.trade = null;
    if (peer) broadcastNet({ t: "tradeDecline", channelId: M.channelId, hash: M.hash, from: M.hash, to: peer, offerId }, { viaServer: true });
    try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
    return true;
  }
  async function approveTrade() {
    const tr = M.trade;
    if (!tr || tr.dir !== "out" || tr.stage !== "countered") throw new Error("Nothing to approve.");
    await give(tr.peer, tr.myId, tr.myN, tr.offerId, { up: tr.myUp || 0, nick: tr.myNick || "" });
    tr.stage = "done";
    try { if (window.UI && window.UI.renderPlayerTrade) window.UI.renderPlayerTrade(); } catch (e) {}
    try { window.UI.toast("⚖️ You give " + tradeItemLabel(tr.myId, tr) + " ×" + tr.myN + (tr.theirId ? (" — " + (tr.peerName || "they") + " give " + tradeItemLabel(tr.theirId, { up: tr.theirUp, nick: tr.theirNick }) + " back automatically.") : "."), 6000); } catch (e) {}
    return true;
  }
  // ---------- hell fragments: first traveler through takes the delve.
  // The claimer applies locally (Hell.claimDelveFragment) and broadcasts;
  // receivers record the delve as spent WITHOUT granting themselves a
  // shard, so their later portal trips pay nothing. Receivers never
  // rebroadcast. A fresh alliance inherits the set both ways (each side
  // sends what it knows), so late joiners can't double-claim either.
  function fragBidList() {
    try {
      const p = window.Game && window.Game.G && window.Game.G.player;
      const out = [];
      if (p) {
        try { for (const k of Object.keys(p.hellFragments || {})) out.push(String(k).slice(0, 64)); } catch (e) {}
        try { for (const k of Object.keys(p.hellFragmentsRemote || {})) out.push(String(k).slice(0, 64)); } catch (e) {}
      }
      return out;
    } catch (e) { return []; }
  }
  function notifyFragmentClaimed(bid) {
    if (!M.active) return false;
    try {
      bid = String(bid || "").replace(/_L\d+$/, "").slice(0, 64);
      if (!bid) return false;
      // ts rides along for old relays; the hub re-stamps it on its own clock.
      broadcastNet({ t: "fragClaim", channelId: M.channelId, hash: M.hash, from: M.hash, name: String(M.name || "A fellow traveler").slice(0, 16), bid, ts: Date.now() }, { viaServer: true });
      return true;
    } catch (e) { return false; }
  }
  function shareFragmentsWithNewAlly() {
    if (!M.active) return false;
    try {
      const bids = fragBidList();
      if (!bids.length) return false;
      // parallel hub-clock claim times so receivers resolve doubles the
      // same way as live claims (zeros = legacy/unknown: never revokes).
      let bidTs = null;
      try {
        if (window.Hell && window.Hell.claimTsFor) {
          bidTs = bids.slice(0, 64).map((b) => { try { const t = +window.Hell.claimTsFor(b); return (isFinite(t) && t > 0) ? Math.min(Math.round(t), 4100000000000) : 0; } catch (e) { return 0; } });
        }
      } catch (e) { bidTs = null; }
      const out = { t: "fragSync", channelId: M.channelId, hash: M.hash, from: M.hash, name: String(M.name || "A fellow traveler").slice(0, 16), bids: bids.slice(0, 64) };
      if (bidTs) out.bidTs = bidTs;
      broadcastNet(out, { viaServer: true });
      return true;
    } catch (e) { return false; }
  }
  // ---------- guild commissions: postings + settles + board pins ----------
  // Commissions live in each hero's own guild record; travelers converge by
  // sharing. Live postings/settles broadcast as they happen (hub-relayed);
  // anyone joining late gets the open board plus recent settles and pins via
  // this catch-up burst. Receivers merge, never rebroadcast.
  function shareCommissionsWithNewAlly() {
    if (!M.active) return false;
    try {
      if (!window.Guild || !window.Guild.guildSyncSnapshot) return false;
      const snap = window.Guild.guildSyncSnapshot();
      if (!snap) return false;
      snap.channelId = M.channelId; snap.hash = M.hash; snap.from = M.hash;
      broadcastNet(snap, { viaServer: true });
      return true;
    } catch (e) { return false; }
  }
  function applyRemoteFragmentClaim(bid, name) {
    try {
      if (!bid) return false;
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!p || G.mode !== "playing") return false;
      if (window.Hell && window.Hell.noteRemoteFragmentClaim) return !!window.Hell.noteRemoteFragmentClaim(bid, name);
      return false;
    } catch (e) { return false; }
  }
  // ---------- hell tower network: sphere-woken, ally-shared.
  // Towers wake ONLY for a Hell Sphere forged from all 12 fragments — but a
  // woken network is shared with allies: the waker applies locally
  // (Hell.unlockAllTowers) and broadcasts; allied receivers wake their own
  // network without needing a sphere of their own. Receivers never
  // rebroadcast, so there is no echo loop. A sealed tower with no sphere
  // and no shared wake stays fully silent (see Hell.useTower).
  function broadcastHellTowers() {
    if (!M.active) return false;
    try {
      broadcastNet({ t: "hellTowers", channelId: M.channelId, hash: M.hash, from: M.hash, name: String(M.name || "An ally").slice(0, 16) }, { viaServer: true });
      return true;
    } catch (e) { return false; }
  }
  // A fresh alliance inherits the network: if we already woke the towers,
  // the new ally gets the wake immediately (they apply it as our ally).
  function shareTowersWithNewAlly() {
    try {
      const p = window.Game && window.Game.G && window.Game.G.player;
      if (!p) return;
      if (window.Hell && window.Hell.towersUnlocked && window.Hell.towersUnlocked(p)) broadcastHellTowers();
    } catch (e) {}
  }
  function applyAllyHellTowers(from, name) {    try {
      if (!from || from === M.hash) return false;
      if (!isAlliedHash(from)) return false;
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!p || G.mode !== "playing") return false;
      try {
        if (window.Hell && window.Hell.towersUnlocked && window.Hell.towersUnlocked(p)) return true;
        if (window.Hell && window.Hell.unlockAllTowers) window.Hell.unlockAllTowers(p, { broadcast: false, viaAlly: true, allyName: String(name || "An ally").slice(0, 16) });
        return true;
      } catch (e) { return false; }
    } catch (e) { return false; }
  }
  // ---------- Peter's fall: one shared god-delve, one death, every hero closes.
  // The dungeon sim owner broadcasts at kill time (did = that instance).
  // Receivers who stand in the same instance get the full witness treatment
  // (epilogue + sphere + carried home); everyone else completes silently.
  // Channel-wide like fragment claims (no ally gate): it is world fact, not
  // a favor. Receivers never rebroadcast. One-shot per sender via netDedupe.
  function notifyPeterSlain(did) {
    if (!M.active) return false;
    try {
      broadcastNet({ t: "peterSlain", channelId: M.channelId, hash: M.hash, from: M.hash, name: String(M.name || "A fellow traveler").slice(0, 16), did: did ? String(did).slice(0, 48) : "" }, { viaServer: true });
      return true;
    } catch (e) { return false; }
  }
  function applyRemotePeterSlain(did) {
    try {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!p || G.mode !== "playing") return false;
      if (!window.MainStory || !window.MainStory.applySharedPeterSlain) return false;
      // Witness = standing anywhere in HIS dungeon (any floor of the shared
      // god-delve) when he falls: same delve base, same delve run. Everyone
      // in the delve fought together, so everyone there comes home a hero.
      let present = false;
      try {
        const mine = myDungeonId();
        if (mine && did) {
          const b = (s) => String(s || "").replace(/_L\d+$/, "");
          present = (b(mine) === b(did));
        }
      } catch (e) {}
      return !!window.MainStory.applySharedPeterSlain(present);
    } catch (e) { return false; }
  }
  // Late joiners missed the fall: anyone already carrying the slain flags
  // re-shares it (the newcomer was never inside, so they complete silently).
  function sharePeterSlainWithNewcomer() {
    if (!M.active) return false;
    try {
      const p = window.Game && window.Game.G && window.Game.G.player;
      if (!p) return false;
      let slain = false;
      try { slain = !!(p.peterSlain || (p.mainStory && p.mainStory.flags && p.mainStory.flags.peterSlain)); } catch (e) {}
      if (!slain) return false;
      return notifyPeterSlain(null);
    } catch (e) { return false; }
  }
  async function sendChannelChat(text) {
    if (!M.active) throw new Error("Not in a channel.");
    text = String(text || "").slice(0, 300).trim();
    if (!text) return { ok: false };
    const cid = M.hash + "." + Date.now().toString(36) + "." + (M.chatSeq = (M.chatSeq + 1) % 1000000);
    const raw = await rpc("mpChat", { channelId: M.channelId, hash: M.hash, text, cid });
    return JSON.parse(raw);
  }
  // Channel-hero saves for the title's multiplayer tab: every channel you
  // have a saved hero on (kv psave chero_<CHANNEL>_<hash>, plus the
  // localStorage fallback), newest first.
  async function listChannelHeroes() {
    const out = [];
    try {
      const st = chanHeroStore();
      if (st) {
        let keys = [];
        try { keys = await st.keys(); } catch (e) { keys = []; }
        for (const k of (keys || [])) {
          if (typeof k !== "string" || k.slice(0, 6) !== "chero_") continue;
          try {
            const rec = await st.get(k);
            if (rec && rec.player) {
              const parts = k.split("_");
              out.push({ key: k, channelId: parts[1] || "", player: rec.player, time: rec.time || 0 });
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const lk = localStorage.key(i);
        if (!lk || lk.slice(0, 16) !== "emberhold-chero_") continue;
        const key = lk.slice(10);
        if (out.some((o) => o.key === key)) continue;
        try {
          const rec = JSON.parse(localStorage.getItem(lk));
          if (rec && rec.player) {
            const parts = key.split("_");
            out.push({ key, channelId: parts[1] || "", player: rec.player, time: rec.time || 0 });
          }
        } catch (e) {}
      }
    } catch (e) {}
    out.sort((a, b) => (b.time || 0) - (a.time || 0));
    return out;
  }
  async function deleteChannelHero(id, hash) {
    try { if (window.World && window.World.deleteChannelHero) await window.World.deleteChannelHero(id, hash); } catch (e) {}
    try {
      const k = (window.World && window.World.chanHeroKey) ? window.World.chanHeroKey(id, hash) : ("chero_" + id + "_" + hash);
      localStorage.removeItem("emberhold-" + k);
    } catch (e) {}
    return true;
  }
  // hostGame/joinGame are the PeerJS-sensible names; createChannel/joinChannel
  // stay as aliases so existing callers keep working.
  async function hostGame(name, partyMax) { return createChannel(name, partyMax); }
  async function joinGame(hostPeerIdOrLink, name, appearance, tint, opts) {
    return joinChannel(hostPeerIdOrLink, name, appearance, tint, opts);
  }
  return {
    M, chanLink, inviteLink, parseHostInvite, worldId, guestId, hostSessionId, getHash, lastName,
    ensureSocket, createChannel, hostGame, joinChannel, joinGame, leaveChannel, endHostStream, handleHostEnded,
    saveNow, sendPos, sendEnts, sendDEnts, sendHit, sendDHit, sendDHurt, sendHurt, sendTaken, sendSnap, sendSnapPos, sendAct, sendPlayerHit, sendHitIntent, sendKillCredit, tickInterp, reportHit, syncSharedToGame, syncDungeonToGame, refreshPeers, setSleeping, reincarnate,
    packSnap,
    getRemotes, getShared, getDShared, pushChat, pushSys, give, healPlayer, whisper, sendChannelChat, partyCap, setPartyMax, getChannelSettings, setChannelPartyMax, isAlliedHash, allyList, loadAllies, requestAlly, respondAlly, removeAlly, broadcastHellTowers, notifyPeterSlain, sendRevive, sendTame, tradeOffer, tradeCounter, tradeDeclineMsg, approveTrade,
    sendGuild,
    notifyPoiLooted, applyPoiOp, applyCachedPois, notifyLooted, notifyDungeonPoi, applyDungeonPoiOp, applyCachedDPoi, notifyDungeonLoot, notifyFragmentClaimed, waitForInitialViewers,
    listChannelHeroes, deleteChannelHero,
    listCreatedIds, markCreated, forgetCreated, listVisitedEntries, markVisited, forgetVisited,
    listHostWorlds, getHostWorld, createHostWorld, renameHostWorld, deleteHostWorld, touchHostWorld, defaultHostWorld,
    getIceServers, // ICE (STUN+TURN) config for PeerJS DataConnections (same as the RTC mesh)
    getWorldName, setWorldName, pingChannel, extractChannelCode, normChanId,
    isHost, p2pCount, p2pList, tryClaimHost, kickMember, meshRepair, handleNetMsg, amAreaSim, amDungeonSim, myDungeonId, dungeonOccupants,
    publishTiles, fetchTiles, applyCachedTiles, requestPoisFromHost, resendRecentPois, pingRelay,
    PL_FURN, PL_STALL, PL_STALL_BASE, PL_PORTAL, placeLayout, applyTileList, tilesToB64, b64ToTiles, applyTileChunk,
    get active() { return M.active; },
    get channelId() { return M.channelId; },
    get hash() { return M.hash; },
  };
})();
