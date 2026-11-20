/* MPHost — HostHub: validated Hub running IN the host's page over PeerJS.
   Single session per page. Discovery is the host's EPHEMERAL PeerJS id
   (fresh `new Peer()` per host; invite link #host=<peerId>; peer.destroy()
   on stop). The Hub channel id is the fixed WORLD_ID "MPHOST" — a namespace
   for validation + local save folders, never discovery and never secret.
   Members/heartbeats are in-memory only; the host's LocalKv world folders
   ARE the persisted world. window.MPHost.Hub. */
window.MPHost = (() => {
var self = {}; // compat: ported handlers attach self.on* / self.rpc
// pubsub shim: broadcast to every member connection + host loopback.
// (Preserves server echo semantics: the sender gets its own message back.)
// Fast lane: continuous state (pos/snap/...) may ride per-guest unreliable
// DataChannels when both ends negotiated them — same messages, cheaper path.
// Hot-check + per-guest fast send are installed by the host transport.
var __hubSends = new Map(); // hash(lower) -> fn(jsonString)
var __hubLoopback = null; // fn(jsonString) — host client's own router
var __hubFastSend = null; // fn(hashLower, jsonString) -> true when sent fast
var __hubHotCheck = null; // fn(msgObj) -> true for loss-tolerant hot state
var pubsub = {
  publish: function (topic, json) {
    var s = String(json);
    try { if (__hubLoopback) __hubLoopback(s); } catch (e) {}
    var msg = null, hot = false;
    try { msg = JSON.parse(s); } catch (e) { msg = null; }
    try { hot = !!(msg && __hubHotCheck && __hubHotCheck(msg)); } catch (e) { hot = false; }
    try {
      __hubSends.forEach(function (fn, h) {
        if (hot && __hubFastSend) { try { if (__hubFastSend(h, s)) return; } catch (e) {} }
        try { fn(s); } catch (e) {}
      });
    } catch (e) {}
  },
};
function __stubConn(fromHash) {
  return { id: String(fromHash || '').toLowerCase(), subscribe: function () {}, unsubscribe: function () {} };
}
function __fakeCtx(fromHash) { return { conn: __stubConn(fromHash) }; }

/* Emberhold sessions: ephemeral PeerJS host id + fixed world namespace.
   The invite link carries ONLY the host's live PeerJS id (#host=<peerId>).
   No world data lives anywhere but the host's machine (local MPHOST world
   folders + local hero record), streamed live host->guests over a star of
   reliable DataConnections. Guests keep no world. Sleeping flags are
   ephemeral (memory only) so a disconnect never deadlocks a sleep vote. */
var MP_V = 2;
var MP_MAX_CHANNELS = 150;
var MP_MAX_PLAYERS = 12;
var MP_ONLINE_MS = 45000;
var MP_MEMBER_TTL_MS = 24 * 3600 * 1000;
var MP_ID_LEN = 12;
var MP_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var connMeta = new Map(); // conn.id -> {channelId, hash}
var rateChat = new Map(); // conn.id -> [ts...]
var ratePos = new Map();
var rateAct = new Map(); // conn.id -> [ts...] for visual combat actions
var rateEnts = new Map(); // conn.id -> [ts...] for entity/tile/hit batches
var rateSnap = new Map(); // conn.id -> [ts...] for host full snapshots (identity+clock+poi)
var rateSnapP = new Map(); // conn.id -> [ts...] for host fast pos snapshots
var ratePoi = new Map(); // conn.id -> [ts...] for lootable mutations (overworld + delve) — NEVER shares a bucket with snapshots
var rateHit = new Map(); // conn.id -> [ts...] for wounds (hit/dHit/hurt/phit/dHurt)
var rateTile = new Map(); // conn.id -> [ts...] for tile edits + catch-up (tile/tileReq/tileRes/poiReq/poiRes)
var rateSignal = new Map(); // conn.id -> [ts...] for WebRTC signaling
var chanCache = new Map(); // channelId -> minimal channel object (memory only)
function mpNow() { return Date.now(); }

function mpCleanStr(s, max) {
  s = String(s == null ? "" : s);
  if (s.length > max) s = s.slice(0, max);
  return s;
}
// 6-char legacy links still parse; new links are MP_ID_LEN chars.
function mpValidId(id) { return /^[A-Z0-9]{6,16}$/.test(String(id || "")); }
function mpValidHash(h) { return /^[0-9a-f]{16,64}$/i.test(String(h || "")); }
function mpValidEntId(s) { return /^[A-Za-z0-9_\-]{1,48}$/.test(String(s || "")); }
function mpValidSignalKind(s) { s = String(s || ""); return s === "offer" || s === "answer" || s === "candidate" || s === "bye"; }
function mpTopic(id) { return "ch_" + id; }
// Party cap per player (NPC companions): host-decided 0..8, default 4.
function mpClampParty(v) { try { v = Math.round(Number(v)); if (!isFinite(v)) return 4; if (v < 0) v = 0; if (v > 8) v = 8; return v; } catch (e) { return 4; } }
// Compact hero/NPC look {sk,hs,hc,ec,of,ac,ra}: validated field-wise, forwarded
// as-is. Unknown/legacy clients simply omit it (undefined drops in JSON).
// Accepts BOTH the packed wire keys and the full Appearance shape
// ({skin,hairStyle,hairColor,eyeColor,outfit,accessory,race}) — the visitor
// snapshot path hands us full hero objects, and reading only the packed
// keys used to drop the whole look (every rejoin from host memory came
// back a default human, and syncRace then even rewrote p.race to match).
// Always returns the packed wire form.
function mpCleanApp(v) {
  try {
    if (!v || typeof v !== "object") return undefined;
    var o = {}, n = 0;
    var skin = (typeof v.sk === "string") ? v.sk : v.skin;
    var hs = (typeof v.hs === "string") ? v.hs : v.hairStyle;
    var hc = (typeof v.hc === "string") ? v.hc : v.hairColor;
    var ec = (typeof v.ec === "string") ? v.ec : v.eyeColor;
    var of = (typeof v.of === "string") ? v.of : v.outfit;
    var ac = (typeof v.ac === "string") ? v.ac : v.accessory;
    var ra = (typeof v.ra === "string") ? v.ra : v.race;
    if (typeof skin === "string" && /^#[0-9a-fA-F]{6}$/.test(skin)) { o.sk = skin; n++; }
    if (typeof hc === "string" && /^#[0-9a-fA-F]{6}$/.test(hc)) { o.hc = hc; n++; }
    if (typeof ec === "string" && /^#[0-9a-fA-F]{6}$/.test(ec)) { o.ec = ec; n++; }
    if (typeof hs === "string" && hs && hs.length <= 12) { o.hs = hs.slice(0, 12); n++; }
    if (typeof of === "string" && of && of.length <= 16) { o.of = of.slice(0, 16); n++; }
    if (typeof ac === "string" && ac && ac.length <= 12) { o.ac = ac.slice(0, 12); n++; }
    if (typeof ra === "string" && ra && ra.length <= 12) { o.ra = ra.slice(0, 12); n++; }
    return n ? o : undefined;
  } catch (e) { return undefined; }
}
// Guild commission objects: whitelisted fields only, numbers clamped, arrays
// capped. The relay never stores them — it just forwards what members post.
function cleanGuildEscrow(v) {
  try {
    if (!v || typeof v !== "object") return undefined;
    var id = mpCleanStr(v.itemId, 40);
    if (!id) return undefined;
    var n = Math.max(1, Math.min(99, v.n | 0 || 1));
    return { itemId: id, n: n };
  } catch (e) { return undefined; }
}
function cleanGuildComm(c) {
  try {
    if (!c || typeof c !== "object") return null;
    var cid = mpCleanStr(c.cid, 128);
    if (!cid) return null;
    var kind = (c.kind === "fetch") ? "fetch" : "kill";
    var o = {
      cid: cid, kind: kind,
      title: mpCleanStr(c.title, 80) || (kind === "fetch" ? "Fetch" : "Cull"),
      need: Math.max(1, Math.min(99, c.need | 0 || 1)),
      commissioner: mpCleanStr(c.commissioner, 24) || "Traveler",
      commHash: mpCleanStr(c.commHash, 64).toLowerCase() || undefined,
      createdAt: (isFinite(Number(c.createdAt)) ? Math.max(0, Math.min(4100000000000, Math.round(Number(c.createdAt)))) : undefined),
      status: (c.status === "done") ? "done" : "open",
      reward: (function () {
        try {
          var r = c.reward || {};
          return { gold: Math.max(0, Math.min(9999999, Math.round(Number(r.gold) || 0))), xp: Math.max(0, Math.min(999999, Math.round(Number(r.xp) || 0))) };
        } catch (e2) { return { gold: 0, xp: 0 }; }
      })(),
    };
    if (kind === "kill") {
      o.mobKind = mpCleanStr(c.mobKind, 40) || "goblin";
      o.mobLv = Math.max(1, Math.min(70, c.mobLv | 0 || 1));
    } else {
      o.itemId = mpCleanStr(c.itemId, 40) || "herb";
    }
    if (c.target && typeof c.target === "object") {
      var t = c.target;
      var gx = Number(t.gx), gy = Number(t.gy);
      if (isFinite(gx) && isFinite(gy)) {
        o.target = {
          biome: mpCleanStr(t.biome, 16) || undefined,
          gx: Math.round(Math.max(-3200, Math.min(3200, gx))), gy: Math.round(Math.max(-3200, Math.min(3200, gy))),
        };
        if (isFinite(Number(t.dist))) o.target.dist = Math.max(0, Math.min(9999, Math.round(Number(t.dist))));
        if (isFinite(Number(t.r))) o.target.r = Math.max(0, Math.min(500, Math.round(Number(t.r))));
      }
    }
    if (typeof c.fetchMob === "string" && c.fetchMob) o.fetchMob = mpCleanStr(c.fetchMob, 40);
    if (typeof c.srcHint === "string" && c.srcHint) o.srcHint = mpCleanStr(c.srcHint, 200);
    if (Array.isArray(c.accepts)) {
      var ac = [];
      for (var i = 0; i < c.accepts.length && ac.length < 8; i++) {
        var a = c.accepts[i];
        if (!a) continue;
        var ab = (typeof a === "object") ? mpCleanStr(a.by, 24) : mpCleanStr(a, 24);
        if (!ab) continue;
        var ae = { by: ab };
        if (a && typeof a === "object") {
          if (typeof a.hash === "string" && a.hash) ae.hash = mpCleanStr(a.hash, 64).toLowerCase();
          if (isFinite(Number(a.at))) ae.at = Math.max(0, Math.min(4100000000000, Math.round(Number(a.at))));
        }
        ac.push(ae);
      }
      if (ac.length) o.accepts = ac;
    }
    if (o.status === "done") {
      o.doneBy = mpCleanStr(c.doneBy, 32) || "another traveler";
      if (isFinite(Number(c.doneAt))) o.doneAt = Math.max(0, Math.min(4100000000000, Math.round(Number(c.doneAt))));
      var es = cleanGuildEscrow(c.escrow);
      if (es) o.escrow = es;
    }
    return o;
  } catch (e) { return null; }
}
// ---- HostHub directory: in-memory only (PeerJS edition). No server state,
// no persistence: the host's LocalKv channel folders + hero records ARE the
// world. This is just the live session roster (plus remembered visitors).
// Whitelisted guest character snapshot (host-side memory + join replies).
// Bounded and type-checked — never trusted blindly, never stored raw.
// Shape mirrors the local hero record: {player, torches, explored, dayTime}.
function cleanVisitorHero(h) {
  try {
    if (!h || typeof h !== 'object') return null;
    var p = (h.player && typeof h.player === 'object') ? h.player : h;
    var lv = Math.round(Number(p.lv) || 0);
    if (!(lv >= 1 && lv <= 125)) return null;
    var nm = mpCleanStr(p.name, 16);
    if (!nm) return null;
    var now = mpNow();
    function fin(v, dflt, lo, hi) { var n = Number(v); if (!isFinite(n)) return dflt; if (n < lo) n = lo; if (n > hi) n = hi; return n; }
    function str(v, max) { return (typeof v === 'string' && v) ? v.slice(0, max) : undefined; }
    function eqId(v) { return (typeof v === 'string' && v && v !== '-') ? v.slice(0, 32) : null; }
    var eq = (p.equipment && typeof p.equipment === 'object') ? p.equipment : null;
    var pl = {
      name: nm, lv: lv, xp: Math.max(0, Math.round(Number(p.xp) || 0)),
      x: fin(p.x, 0, -2000, 2000), y: fin(p.y, 0, -2000, 2000),
      hp: fin(p.hp, 1, 0, 999999), maxHp: fin(p.maxHp, 40, 1, 999999),
      mp: fin(p.mp, 0, 0, 999999), maxMp: fin(p.maxMp, 20, 1, 999999),
      gold: Math.max(0, Math.round(Number(p.gold) || 0)),
      role: str(p.role, 16), tint: str(p.tint, 16),
      appearance: mpCleanApp(p.appearance),
      race: str(p.race, 12), gender: str(p.gender, 12),
      equipment: eq ? { w: eqId(eq.weapon || eq.w), a: eqId(eq.armor || eq.a) } : undefined,
    };
    if (Array.isArray(p.abilities) && p.abilities.length <= 64) pl.abilities = p.abilities.filter(function (a) { return typeof a === 'string' && a; }).map(function (a) { return a.slice(0, 32); });
    if (Array.isArray(p.hotbar) && p.hotbar.length <= 12) pl.hotbar = p.hotbar.map(function (s) {
      if (!s) return null;
      if (typeof s === 'string') return s.slice(0, 40);
      if (typeof s === 'object' && (s.kind === 'ability' || s.kind === 'item') && typeof s.id === 'string' && s.id) return { kind: s.kind, id: s.id.slice(0, 40) };
      return null;
    });
    // Party = NPC id list (the bodies persist in the owner's world folders;
    // cross-device returners re-meet them by id). Old snapshots carried the
    // raw slice — non-strings could wedge the restore.
    if (Array.isArray(p.party) && p.party.length <= 16) pl.party = p.party.filter(function (id) { return typeof id === 'string' && id; }).map(function (id) { return id.slice(0, 48); });
    if (Array.isArray(p.techniques) && p.techniques.length <= 128) pl.techniques = p.techniques.filter(function (a) { return typeof a === 'string' && a; }).map(function (a) { return a.slice(0, 32); });
    if (Array.isArray(p.unlocked) && p.unlocked.length <= 128) pl.unlocked = p.unlocked.filter(function (a) { return typeof a === 'string' && a; }).map(function (a) { return a.slice(0, 32); });
    // ---- progression: everything the rejoin restore needs, so a hero rebuilt
    // from host memory (new device, or a visitor copy newer than the local
    // record) keeps their build instead of resetting to a fresh level-1.
    // Dropping these used to wipe stats/inventory/tames/etc on return.
    try {
      var _STATK = ['str', 'end', 'agi', 'int', 'cha', 'luk', 'for'];
      if (p.stats && typeof p.stats === 'object') {
        var _st = {};
        for (var _si = 0; _si < _STATK.length; _si++) _st[_STATK[_si]] = fin(p.stats[_STATK[_si]], 5, 1, 9999);
        pl.stats = _st;
      }
      if (isFinite(Number(p.statPoints))) pl.statPoints = Math.max(0, Math.min(9999, Math.round(Number(p.statPoints))));
      if (isFinite(Number(p.skillPoints))) pl.skillPoints = Math.max(0, Math.min(9999, Math.round(Number(p.skillPoints))));
      var _capMap = function (src, maxK, maxV) {
        var o = null;
        try {
          if (src && typeof src === 'object' && !Array.isArray(src)) {
            var ks = Object.keys(src).slice(0, maxK);
            for (var i = 0; i < ks.length; i++) {
              var vv = Math.round(Number(src[ks[i]]));
              if (!isFinite(vv) || vv <= 0) continue;
              if (!o) o = {};
              o[String(ks[i]).slice(0, 40)] = Math.min(maxV, vv);
            }
          }
        } catch (e) { }
        return o;
      };
      var _tp = _capMap(p.treePts, 32, 999); if (_tp) pl.treePts = _tp;
      var _tg = _capMap(p.treeProg, 32, 99999); if (_tg) pl.treeProg = _tg;
      var _perkMap = function (src) {
        var o = null;
        try {
          if (src && typeof src === 'object' && !Array.isArray(src)) {
            var tks = Object.keys(src).slice(0, 32);
            for (var ti = 0; ti < tks.length; ti++) {
              var store = src[tks[ti]];
              if (!store || typeof store !== 'object') continue;
              var nks = Object.keys(store).slice(0, 64), so = null;
              for (var ni = 0; ni < nks.length; ni++) {
                var rv = Math.round(Number(store[nks[ni]]));
                if (!isFinite(rv) || rv <= 0) continue;
                if (!so) so = {};
                so[String(nks[ni]).slice(0, 40)] = Math.min(99, rv);
              }
              if (so) { if (!o) o = {}; o[String(tks[ti]).slice(0, 40)] = so; }
            }
          }
        } catch (e) { }
        return o;
      };
      var _sp = _perkMap(p.spellPerks); if (_sp) pl.spellPerks = _sp;
      var _wp = _perkMap(p.weaponPerks); if (_wp) pl.weaponPerks = _wp;
      try {
        if (p.techXp && typeof p.techXp === 'object') {
          var _tx = {};
          var _el = _capMap(p.techXp.el, 32, 9999999); if (_el) _tx.el = _el;
          var _fa = _capMap(p.techXp.fam, 32, 9999999); if (_fa) _tx.fam = _fa;
          if (isFinite(Number(p.techXp.kills))) _tx.kills = Math.max(0, Math.min(9999999, Math.round(Number(p.techXp.kills))));
          if (isFinite(Number(p.techXp.undeadKills))) _tx.undeadKills = Math.max(0, Math.min(9999999, Math.round(Number(p.techXp.undeadKills))));
          var _us = _capMap(p.techXp.uses, 64, 9999999); if (_us) _tx.uses = _us;
          if (Object.keys(_tx).length) pl.techXp = _tx;
        }
      } catch (e) { }
      if (Array.isArray(p.inventory) && p.inventory.length <= 300) {
        var _inv = [];
        for (var _ii = 0; _ii < p.inventory.length; _ii++) {
          var _s = p.inventory[_ii];
          if (!_s || typeof _s !== 'object' || typeof _s.id !== 'string' || !_s.id) continue;
          var _e = { id: _s.id.slice(0, 40), n: Math.max(1, Math.min(9999, Math.round(Number(_s.n) || 1))) };
          if (_s.up != null) { var _up = Math.round(Number(_s.up)) || 0; _e.up = Math.max(0, Math.min(5, _up)); }
          if (typeof _s.nick === 'string' && _s.nick) _e.nick = _s.nick.slice(0, 24);
          _inv.push(_e);
        }
        pl.inventory = _inv;
      }
      // Full equipment shape (weapon/armor/trinket/shield + per-copy
      // upgrade levels/nicks). Legacy {w,a} snapshots still read.
      try {
        var _eq2 = (p.equipment && typeof p.equipment === 'object') ? p.equipment : null;
        if (_eq2) {
          var _eqo = {};
          var _slots = ['weapon', 'armor', 'trinket', 'shield'];
          for (var _qi = 0; _qi < _slots.length; _qi++) {
            var _sl = _slots[_qi];
            var _iv = _eq2[_sl];
            if (typeof _iv === 'string' && _iv && _iv !== '-') _eqo[_sl] = _iv.slice(0, 48);
          }
          if (_eq2.w && !_eqo.weapon && typeof _eq2.w === 'string') _eqo.weapon = _eq2.w.slice(0, 48);
          if (_eq2.a && !_eqo.armor && typeof _eq2.a === 'string') _eqo.armor = _eq2.a.slice(0, 48);
          if (Object.keys(_eqo).length) pl.equipment = _eqo;
          var _upm = function (src) {
            var o = null;
            try {
              if (src && typeof src === 'object') for (var _k = 0; _k < _slots.length; _k++) {
                var _vv = Math.round(Number(src[_slots[_k]])) || 0;
                if (_vv > 0) { if (!o) o = {}; o[_slots[_k]] = Math.max(0, Math.min(5, _vv)); }
              }
            } catch (e) { }
            return o;
          };
          var _nm = function (src) {
            var o = null;
            try {
              if (src && typeof src === 'object') for (var _k2 = 0; _k2 < _slots.length; _k2++) {
                if (typeof src[_slots[_k2]] === 'string' && src[_slots[_k2]]) { if (!o) o = {}; o[_slots[_k2]] = src[_slots[_k2]].slice(0, 24); }
              }
            } catch (e) { }
            return o;
          };
          var _eu = _upm(p.equipmentUp); if (_eu) pl.equipmentUp = _eu;
          var _en = _nm(p.equipmentNick); if (_en) pl.equipmentNick = _en;
        }
      } catch (e) { }
      // Tames ride the hero record (full beast objects). Strip volatile
      // combat timers like the local save does; drop giants over budget.
      if (Array.isArray(p.tames) && p.tames.length <= 16) {
        var _tm = [];
        for (var _mi = 0; _mi < p.tames.length; _mi++) {
          var _t = p.tames[_mi];
          if (!_t || typeof _t !== 'object') continue;
          var _b = {};
          try { _b = JSON.parse(JSON.stringify(_t)); } catch (e) { continue; }
          if (!_b || typeof _b !== 'object') continue;
          try {
            _b.targetRef = null; _b.cooldowns = {}; _b.buffs = {}; _b.status = {};
            _b.slowUntil = 0; _b.burnUntil = 0; _b.burnTick = 0;
            _b.hostileUntil = 0; _b.atkCd = 0; _b.aidCd = 0;
            _b.parryUntil = 0; _b.parryCdUntil = 0; _b.reflectUntil = 0;
            _b.hurtUntil = 0; _b.hurtAng = 0;
            _b.atkUntil = 0; _b.atkKind = null; _b.atkDur = 0;
            _b._deadAt = 0; _b._statusFlashUntil = 0; _b._statusFlashColor = null;
          } catch (e) { }
          try { if (JSON.stringify(_b).length > 8192) continue; } catch (e) { continue; }
          _tm.push(_b);
        }
        pl.tames = _tm;
      }
      if (isFinite(Number(p.lifetimeTames))) pl.lifetimeTames = Math.max(0, Math.min(999999, Math.round(Number(p.lifetimeTames))));
      if (isFinite(Number(p.lifetimeInsectTames))) pl.lifetimeInsectTames = Math.max(0, Math.min(999999, Math.round(Number(p.lifetimeInsectTames))));
      try {
        if (p.bestiary && typeof p.bestiary === 'object') {
          var _bx = {};
          var _bs = _capMap(p.bestiary.seen, 300, 999999); if (_bs) _bx.seen = _bs;
          var _bl = _capMap(p.bestiary.slain, 300, 999999); if (_bl) _bx.slain = _bl;
          if (Object.keys(_bx).length) pl.bestiary = _bx;
        }
      } catch (e) { }
      var _nums = ['bossKills', 'chestsOpened', 'dungeonsEntered', 'deepestDepth', 'playTime', 'deaths', 'kills'];
      for (var _ni = 0; _ni < _nums.length; _ni++) {
        if (isFinite(Number(p[_nums[_ni]]))) pl[_nums[_ni]] = Math.max(0, Math.min(99999999, Math.round(Number(p[_nums[_ni]]))));
      }
      var _df = _capMap(p.dungeonFloors, 128, 99); if (_df) pl.dungeonFloors = _df;
      if (Array.isArray(p.innRooms) && p.innRooms.length <= 24) {
        pl.innRooms = p.innRooms.map(function (id) { return (typeof id === 'string' && id) ? id.slice(0, 48) : null; });
      }
      if (isFinite(Number(p.innUnlock))) pl.innUnlock = Math.max(0, Math.min(99, Math.round(Number(p.innUnlock))));
      if (Array.isArray(p.breedJobs) && p.breedJobs.length <= 12) {
        var _bj = [];
        for (var _bi = 0; _bi < p.breedJobs.length; _bi++) {
          var _j = p.breedJobs[_bi];
          if (!_j || typeof _j !== 'object') continue;
          var _jo = {};
          if (typeof _j.id === 'string' && _j.id) _jo.id = _j.id.slice(0, 48);
          if (typeof _j.aId === 'string' && _j.aId) _jo.aId = _j.aId.slice(0, 48);
          if (typeof _j.bId === 'string' && _j.bId) _jo.bId = _j.bId.slice(0, 48);
          if (typeof _j.bestiaryKey === 'string' && _j.bestiaryKey) _jo.bestiaryKey = _j.bestiaryKey.slice(0, 48);
          if (typeof _j.bestiaryName === 'string' && _j.bestiaryName) _jo.bestiaryName = _j.bestiaryName.slice(0, 48);
          if (isFinite(Number(_j.startAt))) _jo.startAt = Math.max(0, Math.min(4100000000000, Math.round(Number(_j.startAt))));
          if (isFinite(Number(_j.readyAt))) _jo.readyAt = Math.max(0, Math.min(4100000000000, Math.round(Number(_j.readyAt))));
          if (isFinite(Number(_j.cost))) _jo.cost = Math.max(0, Math.min(9999999, Math.round(Number(_j.cost))));
          if (Object.keys(_jo).length) _bj.push(_jo);
        }
        pl.breedJobs = _bj;
      }
      if (typeof p.activeMountId === 'string' && p.activeMountId) pl.activeMountId = p.activeMountId.slice(0, 48);
      else if (p.activeMountId == null) pl.activeMountId = null;
      if (typeof p.mounted === 'boolean') pl.mounted = p.mounted;
      // Stable pen grids (placement of stabled beasts + bought pens).
      try {
        if (Array.isArray(p.stableBoxes) && p.stableBoxes.length <= 8) {
          var _sb = [];
          for (var _sbi = 0; _sbi < p.stableBoxes.length; _sbi++) {
            var _box = p.stableBoxes[_sbi];
            if (!Array.isArray(_box)) continue;
            var _nb = [];
            var _cells = _box.slice(0, 36);
            for (var _ci = 0; _ci < _cells.length; _ci++) _nb.push((typeof _cells[_ci] === 'string' && _cells[_ci]) ? _cells[_ci].slice(0, 48) : null);
            _sb.push(_nb);
          }
          if (_sb.length) pl.stableBoxes = _sb;
        }
        if (Array.isArray(p.stableUnlock) && p.stableUnlock.length <= 8) {
          pl.stableUnlock = p.stableUnlock.slice(0, 8).map(function (u) { var _u = Math.round(Number(u)) || 0; return Math.max(0, Math.min(36, _u)); });
        }
        if (isFinite(Number(p.stableBox))) pl.stableBox = Math.max(0, Math.min(7, Math.round(Number(p.stableBox))));
      } catch (e) { }
      try {
        var _hh = p.homeHearth;
        if (_hh && typeof _hh === 'object' && typeof _hh.name === 'string' && _hh.name && isFinite(Number(_hh.x)) && isFinite(Number(_hh.y))) {
          pl.homeHearth = { name: _hh.name.slice(0, 28), x: Number(_hh.x), y: Number(_hh.y), dim: (_hh.dim === 'hell' ? 'hell' : 'surf') };
        }
      } catch (e) { }
      if (typeof p.spawnType === 'string' && p.spawnType) pl.spawnType = p.spawnType.slice(0, 16);
      if (typeof p.spawnName === 'string' && p.spawnName) pl.spawnName = p.spawnName.slice(0, 32);
      try {
        if (p.dim === 'hell' || p.dim === 'heaven' || p.dim === 'surf') pl.dim = p.dim;
        if (p.posByDim && typeof p.posByDim === 'object') {
          var _pb = {};
          var _dims = ['surf', 'hell', 'heaven'];
          for (var _di = 0; _di < _dims.length; _di++) {
            var _pp = p.posByDim[_dims[_di]];
            if (_pp && isFinite(Number(_pp.x)) && isFinite(Number(_pp.y))) _pb[_dims[_di]] = { x: Number(_pp.x), y: Number(_pp.y) };
            else if (_pp == null && _dims[_di] !== 'surf') _pb[_dims[_di]] = null;
          }
          if (Object.keys(_pb).length) pl.posByDim = _pb;
        }
      } catch (e) { }
      if (Array.isArray(p.quests) && p.quests.length <= 32) {
        var _qq = [];
        for (var _qi2 = 0; _qi2 < p.quests.length; _qi2++) {
          var _q2 = p.quests[_qi2];
          if (!_q2 || typeof _q2 !== 'object' || typeof _q2.id !== 'string' || !_q2.id) continue;
          var _qo = { id: _q2.id.slice(0, 48) };
          var _qstr = ['title', 'desc', 'story', 'objective', 'status', 'doneHow'];
          for (var _qs = 0; _qs < _qstr.length; _qs++) if (typeof _q2[_qstr[_qs]] === 'string') _qo[_qstr[_qs]] = _q2[_qstr[_qs]].slice(0, 2000);
          if (isFinite(Number(_q2.createdAt))) _qo.createdAt = Number(_q2.createdAt);
          if (isFinite(Number(_q2.doneAt))) _qo.doneAt = Number(_q2.doneAt);
          try {
            if (_q2.data && typeof _q2.data === 'object' && JSON.stringify(_q2.data).length <= 2048) _qo.data = _q2.data;
          } catch (e) { }
          _qq.push(_qo);
        }
        pl.quests = _qq;
      }
      if (Array.isArray(p.seenPlaces) && p.seenPlaces.length <= 200) {
        pl.seenPlaces = p.seenPlaces.filter(function (s) { return typeof s === 'string' && s; }).map(function (s) { return s.slice(0, 48); });
      }
      if (typeof p.tag === 'string' && p.tag) pl.tag = p.tag.slice(0, 32);
      // Main-story quest objects ride along too (sanitized, small): flags
      // alone suppress the intro, but the quest bodies let a cross-device
      // returner resume the spark mid-quest instead of re-lighting it.
      try {
        var _ms = (p.mainStory && typeof p.mainStory === 'object') ? p.mainStory : null;
        if (_ms) {
          var _cq = function (q) {
            try {
              if (!q || typeof q !== 'object' || typeof q.id !== 'string' || !q.id) return null;
              var c = { id: q.id.slice(0, 48), data: {} };
              var _qk = ['title', 'desc', 'story', 'objective', 'status', 'doneHow'];
              for (var _qx = 0; _qx < _qk.length; _qx++) if (typeof q[_qk[_qx]] === 'string') c[_qk[_qx]] = q[_qk[_qx]].slice(0, 2000);
              if (isFinite(Number(q.createdAt))) c.createdAt = Number(q.createdAt);
              if (isFinite(Number(q.doneAt))) c.doneAt = Number(q.doneAt);
              try { if (q.data && typeof q.data === 'object' && JSON.stringify(q.data).length <= 2048) c.data = q.data; } catch (e) { }
              return c;
            } catch (e) { return null; }
          };
          var _mso = { active: null, done: [], flags: {} };
          try { var _ma = _cq(_ms.active); if (_ma) _mso.active = _ma; } catch (e) { }
          try {
            if (Array.isArray(_ms.done)) for (var _md = 0; _md < _ms.done.length && _mso.done.length < 40; _md++) {
              var _cd = _cq(_ms.done[_md]); if (_cd) _mso.done.push(_cd);
            }
          } catch (e) { }
          try {
            if (_ms.flags && typeof _ms.flags === 'object') {
              var _mk = Object.keys(_ms.flags).slice(0, 48);
              for (var _mk2 = 0; _mk2 < _mk.length; _mk2++) {
                var _mvv = _ms.flags[_mk[_mk2]], _mvt = typeof _mvv;
                if (_mvt === 'string') _mso.flags[String(_mk[_mk2]).slice(0, 40)] = _mvv.slice(0, 160);
                else if (_mvt === 'number' || _mvt === 'boolean') _mso.flags[String(_mk[_mk2]).slice(0, 40)] = _mvv;
              }
            }
          } catch (e) { }
          pl.mainStory = _mso;
        }
      } catch (e) { }
    } catch (e) { }
    // Main-story oath flags ride along (primitives only — quest objects never
    // leave the owner's machine). Lets a returning hero keep their oath
    // decision even when the host's remembered copy is all that survives.
    var msFlags = null;
    try {
      var _msf = (p.mainStory && p.mainStory.flags && typeof p.mainStory.flags === 'object') ? p.mainStory.flags : null;
      if (_msf) {
        var _mf = {}, _mkeys = Object.keys(_msf).slice(0, 48), _mi2 = 0;
        for (_mi2 = 0; _mi2 < _mkeys.length; _mi2++) {
          var _kk = String(_mkeys[_mi2]).slice(0, 40), _vv = _msf[_mkeys[_mi2]], _vt = typeof _vv;
          if (_vt === 'string') _mf[_kk] = _vv.slice(0, 160);
          else if (_vt === 'number' || _vt === 'boolean') _mf[_kk] = _vv;
        }
        if (Object.keys(_mf).length) msFlags = _mf;
      }
    } catch (e) { msFlags = null; }
    var o = { v: 1, player: pl, time: now };
    if (msFlags) o.msFlags = msFlags;
    if (Array.isArray(h.torches) && h.torches.length <= 200) o.torches = h.torches.slice(0, 200);
    if (Array.isArray(h.explored) && h.explored.length <= 500) o.explored = h.explored.slice(-500);
    else if (Array.isArray(p.explored) && p.explored.length <= 500) o.explored = p.explored.slice(-500);
    if (isFinite(Number(h.dayTime))) o.dayTime = Number(h.dayTime);
    if (isFinite(Number(h.time))) o.time = Number(h.time);
    var js = '';
    try { js = JSON.stringify(o); } catch (e) { return null; }
    // Progressive trim for pathological heroes (never fail the whole save —
    // a thin hero that restores is better than no hero at all).
    try {
      if (js && js.length > 120000 && o.player) {
        try { delete o.player.tames; js = JSON.stringify(o); } catch (e) { }
      }
      if (js && js.length > 120000 && o.player) {
        try { delete o.player.inventory; js = JSON.stringify(o); } catch (e) { }
      }
      if (js && js.length > 120000 && o.player) {
        try { delete o.player.quests; if (o.player.mainStory) o.player.mainStory.done = []; js = JSON.stringify(o); } catch (e) { }
      }
    } catch (e) { }
    if (!js || js.length > 120000) return null;
    return o;
  } catch (e) { return null; }
}
var HubChannels = new Map(); // id(upper) -> ch
var HubChannelId = null;
function mpLoad() { var o = { channels: {} }; try { HubChannels.forEach(function (ch, id) { o.channels[id] = ch; }); } catch (e) {} return o; }
function mpSave(root) { return true; }
function mpGet(id) { try { return HubChannels.get(String(id)) || null; } catch (e) { return null; } }
function mpCommit(id) { return true; } // memory only; sleep flags stay live (never persisted, as before)

function mpPruneMembers(ch, now) {
  try {
    for (var k in (ch.members || {})) {
      var m = ch.members[k];
      if (!m || now - (Number(m.lastSeen) || 0) > MP_MEMBER_TTL_MS) {
        try { delete ch.members[k]; } catch (e) {}
      }
    }
  } catch (e) {}
}
function mpOnline(ch, now) {
  var out = [];
  try { for (var k in ch.members) { var m = ch.members[k]; if (m && now - (Number(m.lastSeen) || 0) < MP_ONLINE_MS) out.push({ hash: k, name: m.name, sleeping: !!m.sleeping }); } } catch (e) {}
  return out;
}
function mpPubSleep(ch) {
  try {
    var now = mpNow();
    var on = mpOnline(ch, now);
    var sl = 0;
    for (var i = 0; i < on.length; i++) if (on[i].sleeping) sl++;
    pubsub.publish(mpTopic(ch.id), JSON.stringify({ t: "sleep", sleeping: sl, online: on.length }));
  } catch (e) {}
}
function mpRate(map, id, limit, windowMs) {
  var now = mpNow();
  var arr = map.get(id);
  if (!arr) { arr = []; map.set(id, arr); }
  while (arr.length && now - arr[0] > windowMs) arr.shift();
  if (arr.length >= limit) return false;
  arr.push(now);
  if (arr.length > limit + 5) arr.splice(0, arr.length - limit - 5);
  return true;
}
function mpTouch(ch, hash, name, now) {
  try {
    var h = String(hash).toLowerCase();
    var m = ch.members[h];
    if (!m) {
      if (Object.keys(ch.members).length >= MP_MAX_PLAYERS) return null;
      m = { name: mpCleanStr(name, 16) || "Wanderer", lastSeen: now };
      ch.members[h] = m;
    } else {
      m.lastSeen = now;
      if (name) m.name = mpCleanStr(name, 16) || m.name;
    }
    return m;
  } catch (e) { return null; }
}
self.onopen = function (ctx) { try { /* join via mpJoin RPC which subscribes */ } catch (e) {} };
self.onclose = function (ctx) {
  try {
    var m = connMeta.get(ctx.conn.id);
    if (m) {
      connMeta.delete(ctx.conn.id);
      var ch = mpGet(m.channelId);
      // ephemeral only: clear a stale sleep vote, keep the directory record
      if (ch && ch.members[m.hash]) {
        ch.members[m.hash].sleeping = false;
        mpPubSleep(ch);
      }
    try { ctx.conn.unsubscribe(mpTopic(m.channelId)); } catch (e) {}
    }
    rateChat.delete(ctx.conn.id); ratePos.delete(ctx.conn.id); rateEnts.delete(ctx.conn.id); rateSignal.delete(ctx.conn.id); rateAct.delete(ctx.conn.id); rateSnap.delete(ctx.conn.id); rateSnapP.delete(ctx.conn.id); ratePoi.delete(ctx.conn.id); rateHit.delete(ctx.conn.id); rateTile.delete(ctx.conn.id);
  } catch (e) {}
};
self.onmessage = function (ctx) {
  try {
    var raw = ctx.data;
    if (typeof raw !== "string") return;
    if (raw.length > 8000) return;
    var m;
    try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== "string") return;
    if (!mpValidId(m.channelId) || !mpValidHash(m.hash)) return;
    var id = String(m.channelId).toUpperCase();
    var hash = String(m.hash).toLowerCase();
    var now = mpNow();
    // ---- WebRTC signaling: directed handshake, then P2P. No state. ----
    if (m.t === "signal") {
      if (!mpRate(rateSignal, ctx.conn.id, 60, 10000)) return;
      var toH = mpCleanStr(m.to, 64).toLowerCase();
      if (!mpValidHash(toH)) return;
      if (!mpValidSignalKind(m.kind)) return;
      var pay = String(m.payload == null ? "" : m.payload);
      if (pay.length > 4000) return;
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "signal", from: hash.slice(0, 64), to: toH, kind: String(m.kind), payload: pay })); } catch (e2) {}
      return;
    }
    var ch = mpGet(id);
    if (!ch) return;
    if (ch.ended && m.t !== "leave") return;
    // ---- explicit host end-of-stream: host-only, fanned out, not stored as world ----
    if (m.t === "hostEnded") {
      if (!mpRate(rateEnts, ctx.conn.id, 10, 10000)) return;
      if (String(ch.host || "").toLowerCase() !== hash) return;
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "hostEnded", from: hash, ts: now })); } catch (e2) {}
      return;
    }
    // ---- host snapshot: authoritative world state, host-only, relayed, NEVER stored ----
    if (m.t === "snap") {
      // chunked full snaps (packSnap client-side) send several messages per
      // tick in crowded towns — budget sized for ~3 chunks @1.6Hz + margin
      if (!mpRate(rateSnap, ctx.conn.id, 80, 10000)) return;
      try { if (!ch.host) ch.host = hash; } catch (e2) {}
      if (String(ch.host || "").toLowerCase() !== hash) return;
      var listS = Array.isArray(m.list) ? m.list : [];
      // relay never stores — cap is purely a per-message bandwidth guard.
      // Must fit the host's full snapshot (32 NPCs + 28 mobs identity batch).
      if (listS.length > 64) listS = listS.slice(0, 64);
      var fwdS = [];
      for (var si = 0; si < listS.length; si++) {
        var se = listS[si];
        if (!se || !mpValidEntId(se.id)) continue;
        var sx = Number(se.x), sy = Number(se.y);
        if (!isFinite(sx) || !isFinite(sy)) continue;
        if (sx < -2000) sx = -2000; if (sx > 2000) sx = 2000;
        if (sy < -2000) sy = -2000; if (sy > 2000) sy = 2000;
       fwdS.push({
         id: String(se.id).slice(0, 48), kind: mpCleanStr(se.kind, 24) || "mob",
         x: Math.round(sx * 100) / 100, y: Math.round(sy * 100) / 100,
         hp: Math.max(0, Math.min(999999, Math.round(Number(se.hp) || 0))),
         maxHp: Math.max(1, Math.min(999999, Math.round(Number(se.maxHp) || 0) || 1)),
         // corpse purse: unlooted bodies ride the snapshots so every screen's
         // raid pays the same (live mobs omit it — hub clears the field)
         gold: (isFinite(Number(se.gold)) && Number(se.gold) >= 0 ? Math.max(0, Math.min(999999, Math.round(Number(se.gold)))) : undefined),
          lv: Math.max(1, Math.min(125, se.lv | 0 || 1)), dead: !!se.dead,
         name: mpCleanStr(se.name, 24) || undefined, role: mpCleanStr(se.role, 16) || undefined,
         tint: mpCleanStr(se.tint, 16) || undefined,
         app: mpCleanApp(se.app),
         face: isFinite(Number(se.face)) ? Math.round(Number(se.face) * 100) / 100 : undefined,
         looted: se.looted ? true : undefined,
          sub: se.sub ? true : undefined, voidH: se.voidH ? true : undefined,
       });
      }
      var sdt = Number(m.dayTime);
      var dayOut = isFinite(sdt) ? Math.max(0, Math.min(1000000, Math.round(sdt))) : null;
      mpTouch(ch, hash, null, now);
      try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e2) {}
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      // recent shared-loot ops ride the snapshot so late joiners converge
      var fwdPoi = null;
      try {
        if (Array.isArray(m.poi)) {
          fwdPoi = [];
          for (var qi = 0; qi < m.poi.length && fwdPoi.length < 30; qi++) {
            var qo = m.poi[qi];
            if (!qo || typeof qo.id !== "string" || !qo.id || qo.id.length > 48) continue;
            var qcx = Math.round(Number(qo.cx) || 0), qcy = Math.round(Number(qo.cy) || 0);
            if (qcx < -200 || qcx > 200 || qcy < -200 || qcy > 200) continue;
            var _qdim = (qo.dim === "hell" || qo.dim === "heaven" || qo.dim === "surf") ? qo.dim : ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") ? m.dim : undefined);
            fwdPoi.push({ id: qo.id.slice(0, 48), op: qo.op === "removed" ? "removed" : "opened", cx: qcx, cy: qcy, dim: _qdim });
          }
          if (!fwdPoi.length) fwdPoi = null;
        }
      } catch (e2) { fwdPoi = null; }
      if (fwdS.length || dayOut !== null || fwdPoi) {
        try { var _sdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "snap", from: hash, sq: (isFinite(Number(m.sq)) && Number(m.sq) > 0) ? Math.floor(Number(m.sq)) : undefined, st: isFinite(Number(m.st)) ? Math.max(0, Math.min(4100000000000, Math.round(Number(m.st)))) : undefined, ep: isFinite(Number(m.ep)) ? Math.floor(Number(m.ep)) : undefined, dim: _sdim, list: fwdS, dayTime: dayOut, poi: fwdPoi || undefined })); } catch (e2) {}
      }
      return;
    }
    // ---- fast snapshot: host-only, relayed NEVER stored. Ships ~10Hz delta so
    // mobs/NPCs move as smoothly as players. Carries NPC identity (name/role/lv)
    // + clock + burrow flags, so joiners converge on snapP alone when full
    // snaps (~1.6Hz) are dropped — the full snap stays the richer copy. ----
   if (m.t === "snapP") {
     if (!mpRate(rateSnapP, ctx.conn.id, 100, 10000)) return;
     try { if (!ch.host) ch.host = hash; } catch (e2) {}
     if (String(ch.host || "").toLowerCase() !== hash) return;
     var listP = Array.isArray(m.list) ? m.list : [];
     if (listP.length > 80) listP = listP.slice(0, 80);
     var fwdP = [];
     for (var pi = 0; pi < listP.length; pi++) {
       var pe = listP[pi];
       if (!pe || !mpValidEntId(pe.id)) continue;
       var px = Number(pe.x), py = Number(pe.y);
       if (!isFinite(px) || !isFinite(py)) continue;
       if (px < -2000) px = -2000; if (px > 2000) px = 2000;
       if (py < -2000) py = -2000; if (py > 2000) py = 2000;
         fwdP.push({
           id: String(pe.id).slice(0, 48), kind: mpCleanStr(pe.kind, 24) || "mob",
           x: Math.round(px * 100) / 100, y: Math.round(py * 100) / 100,
           hp: Math.max(0, Math.min(999999, Math.round(Number(pe.hp) || 0))),
           gold: (isFinite(Number(pe.gold)) && Number(pe.gold) >= 0 ? Math.max(0, Math.min(999999, Math.round(Number(pe.gold)))) : undefined),
           // mobs don't send identity (they materialize from templates) — a
          // blind `|| 1` fallback here once fabricated maxHp:1/lv:1 for every
          // mob, and joiners drew 78x-wide HP bars across the whole screen.
          // Only forward what the sender actually provided.
          maxHp: (isFinite(Number(pe.maxHp)) && Number(pe.maxHp) > 0) ? Math.max(1, Math.min(999999, Math.round(Number(pe.maxHp)))) : undefined,
          lv: (isFinite(Number(pe.lv)) && (pe.lv | 0) > 0) ? Math.max(1, Math.min(125, pe.lv | 0)) : undefined,
          dead: !!pe.dead,
          name: mpCleanStr(pe.name, 24) || undefined, role: mpCleanStr(pe.role, 16) || undefined,
          tint: mpCleanStr(pe.tint, 16) || undefined,
         face: isFinite(Number(pe.face)) ? Math.round(Number(pe.face) * 100) / 100 : undefined,
         looted: pe.looted ? true : undefined,
          sub: pe.sub ? true : undefined, voidH: pe.voidH ? true : undefined,
       });
     }
     mpTouch(ch, hash, null, now);
     try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e2) {}
     try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      var pdt = Number(m.dayTime);
      var dayP = isFinite(pdt) ? Math.max(0, Math.min(1000000, Math.round(pdt))) : null;
      if (fwdP.length) {
        try { var _pdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "snapP", from: hash, sq: (isFinite(Number(m.sq)) && Number(m.sq) > 0) ? Math.floor(Number(m.sq)) : undefined, st: isFinite(Number(m.st)) ? Math.max(0, Math.min(4100000000000, Math.round(Number(m.st)))) : undefined, ep: isFinite(Number(m.ep)) ? Math.floor(Number(m.ep)) : undefined, dim: _pdim, list: fwdP, dayTime: dayP })); } catch (e2) {}
      }
      return;
    }
     // ---- shared-entity batch: validated + relayed, never stored ----
     if (m.t === "ents") {
       if (!mpRate(rateEnts, ctx.conn.id, 40, 10000)) return;
       if (!ch.members[hash]) return;
       var list = Array.isArray(m.list) ? m.list : [];
       if (list.length > 40) list = list.slice(0, 40);
       var fwd = [];
       for (var i = 0; i < list.length; i++) {
         var e = list[i];
         if (!e || !mpValidEntId(e.id)) continue;
         var ex = Number(e.x), ey = Number(e.y);
         if (!isFinite(ex) || !isFinite(ey)) continue;
         if (ex < -2000) ex = -2000; if (ex > 2000) ex = 2000;
         if (ey < -2000) ey = -2000; if (ey > 2000) ey = 2000;
        fwd.push({
          id: String(e.id).slice(0, 48), kind: mpCleanStr(e.kind, 24) || "mob",
          x: Math.round(ex * 100) / 100, y: Math.round(ey * 100) / 100,
          hp: Math.max(0, Math.min(999999, Math.round(Number(e.hp) || 0))),
          gold: (isFinite(Number(e.gold)) && Number(e.gold) >= 0 ? Math.max(0, Math.min(999999, Math.round(Number(e.gold)))) : undefined),
           maxHp: Math.max(1, Math.min(999999, Math.round(Number(e.maxHp) || 0) || 1)),
          lv: Math.max(1, Math.min(125, e.lv | 0 || 1)), dead: !!e.dead, ts: now,
          name: mpCleanStr(e.name, 24) || undefined, role: mpCleanStr(e.role, 16) || undefined,
          tint: mpCleanStr(e.tint, 16) || undefined,
          app: mpCleanApp(e.app),
          face: isFinite(Number(e.face)) ? Math.round(Number(e.face) * 100) / 100 : undefined,
          looted: e.looted ? true : undefined,
           sub: e.sub ? true : undefined, voidH: e.voidH ? true : undefined,
        });
       }
       mpTouch(ch, hash, null, now);
       try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e2) {}
       try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
       if (fwd.length) {
        try { var _edim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "ents", from: hash, sq: (isFinite(Number(m.sq)) && Number(m.sq) > 0) ? Math.floor(Number(m.sq)) : undefined, st: isFinite(Number(m.st)) ? Math.max(0, Math.min(4100000000000, Math.round(Number(m.st)))) : undefined, ep: isFinite(Number(m.ep)) ? Math.floor(Number(m.ep)) : undefined, dim: _edim, list: fwd })); } catch (e2) {}
       }
       return;
     }
    // ---- shared tile edits: validated + relayed, never stored.
    // Late joiners pull missed edits from the HOST (t:tileReq/tileRes),
    // whose local world is the authority. ----
    if (m.t === "tile") {
      if (!mpRate(rateTile, ctx.conn.id, 30, 10000)) return;
      if (!ch.members[hash]) return;
      var listT = Array.isArray(m.list) ? m.list : [];
      if (listT.length > 120) listT = listT.slice(0, 120);
      var fwdT = [];
      for (var ti = 0; ti < listT.length; ti++) {
        var te = listT[ti];
        if (!te) continue;
        var tcx = te.cx | 0, tcy = te.cy | 0, tlx = te.lx | 0, tly = te.ly | 0;
        if (!isFinite(te.cx) || !isFinite(te.cy) || tcx < -200 || tcx > 200 || tcy < -200 || tcy > 200) continue;
        if (!isFinite(te.lx) || !isFinite(te.ly) || tlx < 0 || tlx > 15 || tly < 0 || tly > 15) continue;
        var tt = te.t | 0;
        if (!isFinite(te.t) || tt < 0 || tt > 128) continue;
        var _td = (te.dim === "hell" ? "hell" : (te.dim === "surf" ? "surf" : ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") ? m.dim : undefined)));
        fwdT.push({ cx: tcx, cy: tcy, lx: tlx, ly: tly, t: tt, dim: _td });
      }
      mpTouch(ch, hash, null, now);
      try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e2) {}
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      if (fwdT.length) {
        try { var _tmd = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "tile", from: hash, dim: _tmd, list: fwdT })); } catch (e2) {}
      }
      return;
    }
     // ---- tile catch-up: joiner asks the HOST, host answers; server only routes ----
     if (m.t === "tileReq") {
       if (!mpRate(rateTile, ctx.conn.id, 15, 10000)) return;
       if (!ch.members[hash]) return;
       var toR = mpCleanStr(m.to, 64).toLowerCase();
       if (!mpValidHash(toR)) return;
       var qcx = Math.round(Number(m.cx) || 0), qcy = Math.round(Number(m.cy) || 0);
       var qr = Math.max(0, Math.min(3, Number(m.r) || 0));
       if (qcx < -200 || qcx > 200 || qcy < -200 || qcy > 200) return;
       var reqId = mpCleanStr(m.reqId, 16);
       if (!reqId) return;
       try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _qdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "tileReq", from: hash, to: toR, reqId: reqId, cx: qcx, cy: qcy, r: qr, dim: _qdim })); } catch (e2) {}
       return;
     }
     if (m.t === "tileRes") {
       if (!mpRate(rateTile, ctx.conn.id, 15, 10000)) return;
       if (!ch.members[hash]) return;
       var toS = mpCleanStr(m.to, 64).toLowerCase();
       if (!mpValidHash(toS)) return;
       var resId = mpCleanStr(m.reqId, 16);
       if (!resId) return;
       var listR = Array.isArray(m.list) ? m.list : [];
       if (listR.length > 800) listR = listR.slice(0, 800);
       var fwdR = [];
       for (var ri = 0; ri < listR.length; ri++) {
         var re = listR[ri];
         if (!re) continue;
         var rcx = re.cx | 0, rcy = re.cy | 0, rlx = re.lx | 0, rly = re.ly | 0;
         if (rcx < -200 || rcx > 200 || rcy < -200 || rcy > 200 || rlx < 0 || rlx > 15 || rly < 0 || rly > 15) continue;
         var rtt = re.t | 0;
         if (rtt < 0 || rtt > 128) continue;
         var _rd = (re.dim === "hell" ? "hell" : (re.dim === "surf" ? "surf" : ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") ? m.dim : undefined)));
         fwdR.push({ cx: rcx, cy: rcy, lx: rlx, ly: rly, t: rtt, dim: _rd });
       }
       try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _rsd = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "tileRes", from: hash, to: toS, reqId: resId, dim: _rsd, list: fwdR })); } catch (e2) {}
       return;
     }
     // ---- full-chunk tile catch-up: host -> joiner, routed never stored ----
     if (m.t === "tileChunk") {
       if (!mpRate(rateTile, ctx.conn.id, 15, 10000)) return;
       if (!ch.members[hash]) return;
       var toC = mpCleanStr(m.to, 64).toLowerCase();
       if (!mpValidHash(toC)) return;
       var resC = mpCleanStr(m.reqId, 16);
       if (!resC) return;
       var ccx = Math.round(Number(m.cx) || 0), ccy = Math.round(Number(m.cy) || 0);
       if (ccx < -200 || ccx > 200 || ccy < -200 || ccy > 200) return;
       var b64 = String(m.tiles == null ? "" : m.tiles);
       if (!b64 || b64.length > 600) return;
       if (!/^[A-Za-z0-9+\/=]+$/.test(b64)) return;
       try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
       try { var _cd = (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "tileChunk", from: hash, to: toC, reqId: resC, dim: _cd, cx: ccx, cy: ccy, tiles: b64 })); } catch (e2) {}
       return;
     }
    // ---- instant hit: low-latency damage ping, no state ----
    if (m.t === "hit") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      if (!mpValidEntId(m.id)) return;
      var hpH = Math.max(0, Math.min(999999, Math.round(Number(m.hp) || 0)));
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "hit", from: hash, id: String(m.id).slice(0, 48), hp: hpH, dead: !!m.dead })); } catch (e2) {}
      return;
    }
    // ---- unified world-server combat: attack intents, any member -> sim ----
    // Overworld intents resolve on the host, delve intents on the instance
    // sim (host-preferred). Relayed to everyone (including the sim, which
    // subscribes like everyone else); non-sims ignore. Routed, never stored.
    if (m.t === "hitIntent") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      if (!mpValidEntId(m.id)) return;
      var amtI = Math.max(1, Math.min(9999, Math.round(Number(m.amount) || 0)));
      if (!(amtI > 0)) return;
      var didI = mpCleanStr(m.did, 48);
      var stI = null;
      try {
        if (m.status && typeof m.status.type === "string" && m.status.type.length <= 24) {
          stI = { type: String(m.status.type).slice(0, 24) };
          if (isFinite(Number(m.status.pct))) stI.pct = Number(m.status.pct);
          if (isFinite(Number(m.status.dps))) stI.dps = Number(m.status.dps);
          if (isFinite(Number(m.status.durationMs))) stI.durationMs = Math.max(0, Math.min(60000, Number(m.status.durationMs)));
          if (isFinite(Number(m.status.potency))) stI.potency = Number(m.status.potency);
        }
      } catch (e2) { stI = null; }
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try {
        pubsub.publish(mpTopic(id), JSON.stringify({
          t: "hitIntent", from: hash, id: String(m.id).slice(0, 48), amount: amtI,
          did: didI || null,
          dim: (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined))),
          magic: !!m.magic, el: mpCleanStr(m.el, 16) || "physical", fam: mpCleanStr(m.fam, 16) || "unarmed",
          extraEls: (typeof m.extraEls === "string" && m.extraEls) ? m.extraEls.slice(0, 48) : null,
          move: mpCleanStr(m.move, 32),
          status: stI, slow: !!m.slow, slowMs: isFinite(Number(m.slowMs)) ? Math.max(0, Math.min(10000, Math.round(Number(m.slowMs)))) : undefined,
          burn: !!m.burn, burnMs: isFinite(Number(m.burnMs)) ? Math.max(0, Math.min(30000, Math.round(Number(m.burnMs)))) : undefined,
          pierce: !!m.pierce, allowThroughWall: !!m.allowThroughWall, isStatus: !!m.isStatus,
          mercy: !!m.mercy, aid: mpValidEntId(m.aid) ? String(m.aid).slice(0, 48) : null,
          ax: isFinite(Number(m.ax)) ? Math.round(Number(m.ax) * 100) / 100 : null,
          ay: isFinite(Number(m.ay)) ? Math.round(Number(m.ay) * 100) / 100 : null,
        }));
      } catch (e2) {}
      return;
    }
    // ---- unified world-server combat: kill credit back to the killer ----
    // Sim-directed (like hurt/phit): only the addressed client grants the
    // XP/quest/guild rewards for its authoritative kill. Overworld credit
    // comes from the host; delve credit from the instance sim (any occupant
    // may be the sim, so any member may send — directed + rate-limited).
    if (m.t === "kcredit") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      var didK = mpCleanStr(m.did, 48);
      if (!didK && String(ch.host || "").toLowerCase() !== hash) return;
      var toK = mpCleanStr(m.to, 64).toLowerCase();
      if (!mpValidHash(toK) || !ch.members[toK]) return;
      if (!mpValidEntId(m.id)) return;
      var xpK = Math.max(0, Math.min(100000, Math.round(Number(m.xp) || 0)));
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try {
        pubsub.publish(mpTopic(id), JSON.stringify({
          t: "kcredit", from: hash, to: toK, id: String(m.id).slice(0, 48),
          kind: mpCleanStr(m.kind, 32) || "mob", mob: !!m.mob,
          lv: Math.max(1, Math.min(125, m.lv | 0 || 1)),
          name: mpCleanStr(m.name, 32) || "foe", boss: !!m.boss,
          baseId: (typeof m.baseId === "string" && m.baseId) ? m.baseId.slice(0, 48) : null,
          did: didK || null,
          xp: xpK, aid: mpValidEntId(m.aid) ? String(m.aid).slice(0, 48) : null,
          el: mpCleanStr(m.el, 16) || "physical", fam: mpCleanStr(m.fam, 16) || "unarmed",
          move: mpCleanStr(m.move, 32),
        }));
      } catch (e2) {}
      return;
    }
    // ---- shared lootable mutation: chest opened / quest cache taken. Any
    // member may announce (opener already applied it locally); routed, never
    // stored. The host persists it and re-broadcasts via snapshots. ----
    if (m.t === "poi") {
      if (!mpRate(ratePoi, ctx.conn.id, 30, 10000)) return;
      if (!ch.members[hash]) return;
      if (typeof m.pid !== "string" && typeof m.id !== "string") return;
      var poiId = String(m.pid != null ? m.pid : m.id).slice(0, 48);
      if (!poiId) return;
      var poiOp = (m.op === "removed") ? "removed" : "opened";
      var poiCx = Math.round(Number(m.cx) || 0), poiCy = Math.round(Number(m.cy) || 0);
      if (poiCx < -200 || poiCx > 200 || poiCy < -200 || poiCy > 200) return;
      mpTouch(ch, hash, null, now);
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _pdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "poi", from: hash, id: poiId, op: poiOp, cx: poiCx, cy: poiCy, dim: _pdim })); } catch (e2) {}
      return;
    }
    // ---- shared corpse raid: one raider per corpse. Routed, never stored;
    // the host persists via snapshots. ----
    if (m.t === "loot") {
      if (!mpRate(ratePoi, ctx.conn.id, 30, 10000)) return;
      if (!ch.members[hash]) return;
      if (typeof m.lid !== "string" && typeof m.id !== "string") return;
      var lootId = String(m.lid != null ? m.lid : m.id).slice(0, 48);
      if (!lootId) return;
      mpTouch(ch, hash, null, now);
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "loot", from: hash, id: lootId })); } catch (e2) {}
      return;
    }
    // ---- remote hurt: the HOST's sim damaged a joiner. Host-only, routed
    // (never stored); the target client applies armor/dodge/death itself. ----
    if (m.t === "hurt") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      if (String(ch.host || "").toLowerCase() !== hash) return;
      var toH = mpCleanStr(m.to, 64).toLowerCase();
      if (!mpValidHash(toH) || !ch.members[toH]) return;
      var amtH = Math.max(1, Math.min(9999, Math.round(Number(m.amount) || 0)));
      if (!(amtH > 0)) return;
      var stH = null;
      try {
        if (m.status && typeof m.status.type === "string" && m.status.type.length <= 24) {
          stH = { type: String(m.status.type).slice(0, 24) };
          if (isFinite(Number(m.status.pct))) stH.pct = Number(m.status.pct);
          if (isFinite(Number(m.status.dps))) stH.dps = Number(m.status.dps);
          if (isFinite(Number(m.status.durationMs))) stH.durationMs = Math.max(0, Math.min(60000, Number(m.status.durationMs)));
          if (isFinite(Number(m.status.potency))) stH.potency = Number(m.status.potency);
        }
      } catch (e2) { stH = null; }
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try {
        pubsub.publish(mpTopic(id), JSON.stringify({
          t: "hurt", from: hash, to: toH, amount: amtH, status: stH,
          magic: !!m.magic, crit: !!m.crit,
          fromName: mpCleanStr(m.fromName, 24), fromRole: mpCleanStr(m.fromRole, 16),
          fromLv: Math.max(1, Math.min(125, m.fromLv | 0 || 1)),
          srcId: mpValidEntId(m.srcId) ? String(m.srcId).slice(0, 48) : null,
          srcKind: mpCleanStr(m.srcKind, 24),
        }));
      } catch (e2) {}
      return;
    }
    // ---- peer player-hit: PvP between heroes. Any member may wound any
    // member's hero; only the addressed client applies it (dodge/armor
    // resolve there). Routed, never stored. ----
    if (m.t === "phit") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      var toP = mpCleanStr(m.to, 64).toLowerCase();
      if (!mpValidHash(toP) || !ch.members[toP]) return;
      var amtP = Math.max(1, Math.min(9999, Math.round(Number(m.amount) || 0)));
      if (!(amtP > 0)) return;
      var stP = null;
      try {
        if (m.status && typeof m.status.type === "string" && m.status.type.length <= 24) {
          stP = { type: String(m.status.type).slice(0, 24) };
          if (isFinite(Number(m.status.pct))) stP.pct = Number(m.status.pct);
          if (isFinite(Number(m.status.dps))) stP.dps = Number(m.status.dps);
          if (isFinite(Number(m.status.durationMs))) stP.durationMs = Math.max(0, Math.min(60000, Number(m.status.durationMs)));
          if (isFinite(Number(m.status.potency))) stP.potency = Number(m.status.potency);
        }
      } catch (e2) { stP = null; }
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try {
        pubsub.publish(mpTopic(id), JSON.stringify({
          t: "phit", from: hash, to: toP, amount: amtP, status: stP,
          magic: !!m.magic, crit: !!m.crit,
          fromName: mpCleanStr(m.fromName, 24), fromRole: mpCleanStr(m.fromRole, 16),
          fromLv: Math.max(1, Math.min(125, m.fromLv | 0 || 1)),
          fromHash: mpValidHash(m.fromHash) ? String(m.fromHash).toLowerCase() : hash,
          srcId: mpValidEntId(m.srcId) ? String(m.srcId).slice(0, 48) : null,
          srcKind: mpCleanStr(m.srcKind, 24),
        }));
      } catch (e2) {}
      return;
    }
    // ---- visual combat action: an attack's LOOK, routed never stored ----
    // Swings, flying spells, cast flashes, bomb blasts. Purely cosmetic on
    // receivers (no damage — that flows via hit/hurt) so replays can't hurt.
    if (m.t === "act") {
      if (!mpRate(rateAct, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      var kind = String(m.kind || "");
      if (kind !== "melee" && kind !== "proj" && kind !== "cast" && kind !== "blast") return;
      var ax2 = Number(m.x), ay2 = Number(m.y);
      if (!isFinite(ax2) || !isFinite(ay2)) return;
      if (ax2 < -2000) ax2 = -2000; if (ax2 > 2000) ax2 = 2000;
      if (ay2 < -2000) ay2 = -2000; if (ay2 > 2000) ay2 = 2000;
      var out = { t: "act", from: hash, kind: kind, x: Math.round(ax2 * 100) / 100, y: Math.round(ay2 * 100) / 100 };
      if (isFinite(Number(m.face))) out.face = Number(m.face);
      if (m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") out.dim = m.dim;
      if (m.did) { var _ad = mpCleanStr(m.did, 48); if (_ad) out.did = _ad; }
      if (kind === "melee") {
        out.fxk = (m.fxk === "thrust") ? "thrust" : "arc";
        out.fxc = mpCleanStr(m.fxc, 16) || "#ffffff";
        if (isFinite(Number(m.fxlw))) out.fxlw = Math.max(1, Math.min(12, Number(m.fxlw)));
        if (isFinite(Number(m.fxr))) out.fxr = Math.max(0.3, Math.min(4, Number(m.fxr)));
      } else if (kind === "proj") {
        out.abId = mpCleanStr(m.abId, 24);
        out.color = mpCleanStr(m.color, 16) || "#ffffff";
        var psh = mpCleanStr(m.shape, 12);
        if (psh === "orb" || psh === "spear" || psh === "dart" || psh === "flash" || psh === "dot") out.shape = psh;
        if (isFinite(Number(m.size))) out.size = Math.max(0.3, Math.min(3, Number(m.size)));
        out.core = mpCleanStr(m.core, 16) || undefined;
        out.glow = mpCleanStr(m.glow, 16) || undefined;
        if (isFinite(Number(m.vx))) out.vx = Math.max(-30, Math.min(30, Number(m.vx)));
        if (isFinite(Number(m.vy))) out.vy = Math.max(-30, Math.min(30, Number(m.vy)));
        if (isFinite(Number(m.life))) out.life = Math.max(0.05, Math.min(12, Number(m.life)));
        if (Array.isArray(m.trail)) {
          var tr = [];
          for (var ti = 0; ti < m.trail.length && tr.length < 4; ti++) { var tc = mpCleanStr(m.trail[ti], 16); if (tc) tr.push(tc); }
          if (tr.length) out.trail = tr;
        }
        if (m.boom && typeof m.boom === "object") {
          var bo = {};
          if (mpCleanStr(m.boom.ring, 16)) bo.ring = mpCleanStr(m.boom.ring, 16);
          if (isFinite(Number(m.boom.n))) bo.n = Math.max(0, Math.min(24, Math.round(Number(m.boom.n))));
          if (isFinite(Number(m.boom.crosses))) bo.crosses = Math.max(0, Math.min(12, Math.round(Number(m.boom.crosses))));
          if (bo.ring || bo.n || bo.crosses) out.boom = bo;
        }
        if (m.splash && typeof m.splash === "object" && isFinite(Number(m.splash.r))) {
          out.splash = { r: Math.max(0.3, Math.min(4, Number(m.splash.r))), mult: 0.5 };
        }
        if (isFinite(Number(m.waveR))) out.waveR = Math.max(0, Math.min(3, Number(m.waveR)));
        out.pass = !!m.pass; out.magic = !!m.magic;
        out.el = mpCleanStr(m.el, 16) || undefined;
        out.fam = mpCleanStr(m.fam, 16) || undefined;
      } else if (kind === "cast") {
        out.abId = mpCleanStr(m.abId, 24);
        out.color = mpCleanStr(m.color, 16) || "#ffffff";
        out.snd = (m.snd === "heal") ? "heal" : "fire";
      }
      try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e) {}
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify(out)); } catch (e2) {}
      return;
    }
    // ---- shared delve mob union: every occupant publishes what IT owns.
    // Routed, never stored (P2P carries it when direct works; relay fills gaps). ----
    if (m.t === "dEnts") {
      if (!mpRate(rateEnts, ctx.conn.id, 40, 10000)) return;
      if (!ch.members[hash]) return;
      var didE = mpCleanStr(m.did, 48);
      if (!didE) return;
      var listD = Array.isArray(m.list) ? m.list : [];
      if (listD.length > 30) listD = listD.slice(0, 30);
      var fwdD = [];
      for (var di = 0; di < listD.length; di++) {
        var de = listD[di];
        if (!de || !mpValidEntId(de.id)) continue;
        var dx = Number(de.x), dy = Number(de.y);
        if (!isFinite(dx) || !isFinite(dy)) continue;
        if (dx < -2000) dx = -2000; if (dx > 2000) dx = 2000;
        if (dy < -2000) dy = -2000; if (dy > 2000) dy = 2000;
        var dE = {
          id: String(de.id).slice(0, 48), kind: mpCleanStr(de.kind, 24) || "mob",
          x: Math.round(dx * 100) / 100, y: Math.round(dy * 100) / 100,
          hp: Math.max(0, Math.min(999999, Math.round(Number(de.hp) || 0))),
          maxHp: Math.max(1, Math.min(999999, Math.round(Number(de.maxHp) || 0) || 1)),
          lv: Math.max(1, Math.min(125, de.lv | 0 || 1)), dead: !!de.dead, ts: now,
          name: mpCleanStr(de.name, 24) || undefined, tint: mpCleanStr(de.tint, 16) || undefined,
          face: isFinite(Number(de.face)) ? Math.round(Number(de.face) * 100) / 100 : undefined,
          looted: de.looted ? true : undefined,
          gold: (isFinite(Number(de.gold)) && Number(de.gold) >= 0 ? Math.max(0, Math.min(999999, Math.round(Number(de.gold)))) : undefined),
          boss: de.boss ? true : undefined, portalMimic: de.portalMimic ? true : undefined,
          tricked: de.tricked ? true : undefined, exposed: de.exposed ? true : undefined,
          sub: de.sub ? true : undefined, voidH: de.voidH ? true : undefined,
        };
        fwdD.push(dE);
      }
      var fwdDPoi = null;
      try {
        if (Array.isArray(m.poi)) {
          fwdDPoi = [];
          for (var dq = 0; dq < m.poi.length && fwdDPoi.length < 20; dq++) {
            var qo2 = m.poi[dq];
            if (!qo2 || typeof qo2.id !== "string" || !qo2.id || qo2.id.length > 64) continue;
            var qop2 = qo2.op === "revealed" ? "revealed" : qo2.op === "looted" ? "looted" : "opened";
            fwdDPoi.push({ id: qo2.id.slice(0, 64), op: qop2 });
          }
          if (!fwdDPoi.length) fwdDPoi = null;
        }
      } catch (e2) { fwdDPoi = null; }
      mpTouch(ch, hash, null, now);
      try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e2) {}
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      if (fwdD.length || fwdDPoi) {
        try { var _ddim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "dEnts", from: hash, sq: (isFinite(Number(m.sq)) && Number(m.sq) > 0) ? Math.floor(Number(m.sq)) : undefined, st: isFinite(Number(m.st)) ? Math.max(0, Math.min(4100000000000, Math.round(Number(m.st)))) : undefined, ep: isFinite(Number(m.ep)) ? Math.floor(Number(m.ep)) : undefined, did: didE, dim: _ddim, list: fwdD, poi: fwdDPoi || undefined })); } catch (e2) {}
      }
      return;
    }
    // ---- shared delve wound: anyone in the instance wounds its mobs. ----
    if (m.t === "dHit") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      var didH = mpCleanStr(m.did, 48);
      if (!didH || !mpValidEntId(m.id)) return;
      var hpDH = Math.max(0, Math.min(999999, Math.round(Number(m.hp) || 0)));
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _hdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "dHit", from: hash, did: didH, dim: _hdim, id: String(m.id).slice(0, 48), hp: hpDH, dead: !!m.dead })); } catch (e2) {}
      return;
    }
    // ---- shared delve lootable: chest opened / portal revealed / corpse raided. ----
    if (m.t === "dPoi") {
      if (!mpRate(ratePoi, ctx.conn.id, 30, 10000)) return;
      if (!ch.members[hash]) return;
      var didP = mpCleanStr(m.did, 48);
      if (!didP || typeof m.id !== "string" || !m.id || m.id.length > 64) return;
      var dOp = m.op === "revealed" ? "revealed" : m.op === "looted" ? "looted" : "opened";
      mpTouch(ch, hash, null, now);
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _pddim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "dPoi", from: hash, did: didP, dim: _pddim, id: String(m.id).slice(0, 64), op: dOp })); } catch (e2) {}
      return;
    }
    if (m.t === "dLoot") {
      if (!mpRate(ratePoi, ctx.conn.id, 30, 10000)) return;
      if (!ch.members[hash]) return;
      var didL = mpCleanStr(m.did, 48);
      if (!didL || typeof m.id !== "string" || !m.id || m.id.length > 48) return;
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _ldim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "dLoot", from: hash, did: didL, dim: _ldim, id: String(m.id).slice(0, 48) })); } catch (e2) {}
      return;
    }
    // ---- owner-routed delve wound: only the addressed client in the same instance applies it. ----
    if (m.t === "dHurt") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      var toDH = mpCleanStr(m.to, 64).toLowerCase();
      if (!mpValidHash(toDH) || !ch.members[toDH]) return;
      var didDH = mpCleanStr(m.did, 48);
      if (!didDH) return;
      var amtDH = Math.max(1, Math.min(9999, Math.round(Number(m.amount) || 0)));
      if (!(amtDH > 0)) return;
      var stDH = null;
      try {
        if (m.status && typeof m.status.type === "string" && m.status.type.length <= 24) {
          stDH = { type: String(m.status.type).slice(0, 24) };
          if (isFinite(Number(m.status.pct))) stDH.pct = Number(m.status.pct);
          if (isFinite(Number(m.status.dps))) stDH.dps = Number(m.status.dps);
          if (isFinite(Number(m.status.durationMs))) stDH.durationMs = Math.max(0, Math.min(60000, Number(m.status.durationMs)));
          if (isFinite(Number(m.status.potency))) stDH.potency = Number(m.status.potency);
        }
      } catch (e2) { stDH = null; }
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try {
        pubsub.publish(mpTopic(id), JSON.stringify({
          t: "dHurt", from: hash, to: toDH, did: didDH, amount: amtDH, status: stDH,
          magic: !!m.magic, crit: !!m.crit,
          fromName: mpCleanStr(m.fromName, 24), fromRole: mpCleanStr(m.fromRole, 16),
          fromLv: Math.max(1, Math.min(125, m.fromLv | 0 || 1)),
          fromHash: mpValidHash(m.fromHash) ? String(m.fromHash).toLowerCase() : hash,
          srcId: mpValidEntId(m.srcId) ? String(m.srcId).slice(0, 48) : null,
          srcKind: mpCleanStr(m.srcKind, 24),
          dim: (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))),
        }));
      } catch (e2) {}
      return;
    }
     // ---- loot-state catch-up: joiner asks the HOST for opened chests / taken
     // caches near it; host answers from its authoritative world. Server routes only. ----
     if (m.t === "poiReq") {
       if (!mpRate(rateTile, ctx.conn.id, 15, 10000)) return;
       if (!ch.members[hash]) return;
       var toQ = mpCleanStr(m.to, 64).toLowerCase();
       if (!mpValidHash(toQ)) return;
       var pcx = Math.round(Number(m.cx) || 0), pcy = Math.round(Number(m.cy) || 0);
       var pr = Math.max(0, Math.min(3, Number(m.r) || 0));
       if (pcx < -200 || pcx > 200 || pcy < -200 || pcy > 200) return;
       var qId = mpCleanStr(m.reqId, 16);
       if (!qId) return;
       try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _pqdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "poiReq", from: hash, to: toQ, reqId: qId, cx: pcx, cy: pcy, r: pr, dim: _pqdim })); } catch (e2) {}
       return;
     }
    if (m.t === "poiRes") {
      if (!mpRate(rateTile, ctx.conn.id, 15, 10000)) return;
      if (!ch.members[hash]) return;
      var toS2 = mpCleanStr(m.to, 64).toLowerCase();
      if (!mpValidHash(toS2)) return;
      var resId2 = mpCleanStr(m.reqId, 16);
      if (!resId2) return;
      var listQ = Array.isArray(m.list) ? m.list : [];
      if (listQ.length > 80) listQ = listQ.slice(0, 80);
      var fwdQ = [];
      for (var qi2 = 0; qi2 < listQ.length; qi2++) {
        var qe = listQ[qi2];
        if (!qe || typeof qe.id !== "string" || !qe.id || qe.id.length > 48) continue;
        var qcx2 = Math.round(Number(qe.cx) || 0), qcy2 = Math.round(Number(qe.cy) || 0);
        if (qcx2 < -200 || qcx2 > 200 || qcy2 < -200 || qcy2 > 200) continue;
        var _qd2 = (qe.dim === "hell" ? "hell" : (qe.dim === "surf" ? "surf" : ((m.dim === "hell" || m.dim === "heaven" || m.dim === "surf") ? m.dim : undefined)));
        fwdQ.push({ id: qe.id.slice(0, 48), op: qe.op === "removed" ? "removed" : "opened", cx: qcx2, cy: qcy2, dim: _qd2 });
      }
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _qsd = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "poiRes", from: hash, to: toS2, reqId: resId2, dim: _qsd, list: fwdQ })); } catch (e2) {}
      return;
    }
   // ---- friendly revive/heal: anyone may publish an NPC/mob hp restore; the
   // host applies it authoritatively (snapshots then carry the truth). ----
    // ---- friendly tame claim: whoever presses E on a yielding beast owns the
    // tame locally; the claim deletes the wild mob on every screen (sim stops
    // simulating it, replicas vanish) so it can't dupe or get executed. ----
    if (m.t === "tame") {
      if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
      if (!ch.members[hash]) return;
      if (!mpValidEntId(m.id)) return;
      var tameDid = mpCleanStr(m.did, 48);
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      try { var _tdim = (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))); pubsub.publish(mpTopic(id), JSON.stringify({ t: "tame", from: hash, id: String(m.id).slice(0, 48), did: tameDid || undefined, dim: _tdim })); } catch (e2) {}
      return;
    }
    if (m.t === "revive") {
     if (!mpRate(rateHit, ctx.conn.id, 100, 10000)) return;
     if (!ch.members[hash]) return;
     if (!mpValidEntId(m.id)) return;
     var revDid = mpCleanStr(m.did, 48);
     var revHp = Math.max(1, Math.min(999999, Math.round(Number(m.hp) || 0)));
     if (!(revHp > 0)) return;
     // spawn fields let receivers materialize a revived mob/boss they never saw
     // die (its looted corpse rode no snapshot). Validated, then relayed.
     var revOut = { t: "revive", from: hash, id: String(m.id).slice(0, 48), hp: revHp, rv: !!m.rv, did: revDid || undefined, dim: (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined))) };
     try { if (typeof m.kind === "string" && m.kind && /^[A-Za-z0-9_]{1,24}$/.test(m.kind)) revOut.kind = m.kind.slice(0, 24); } catch (e2) {}
     try { if (isFinite(+m.lv)) revOut.lv = Math.max(1, Math.min(125, Math.round(+m.lv))); } catch (e2) {}
     try { if (isFinite(+m.x) && isFinite(+m.y) && Math.abs(+m.x) < 10000 && Math.abs(+m.y) < 10000) { revOut.x = +m.x; revOut.y = +m.y; } } catch (e2) {}
     try { if (typeof m.name === "string" && m.name) revOut.name = String(m.name).slice(0, 24); } catch (e2) {}
     try { if (isFinite(+m.maxHp)) revOut.maxHp = Math.max(1, Math.min(999999, Math.round(+m.maxHp))); } catch (e2) {}
     try { if (m.boss) revOut.boss = true; } catch (e2) {}
     try { if (m.tsb != null && isFinite(+m.tsb)) revOut.tsb = Math.max(0, Math.min(1, +m.tsb)); } catch (e2) {}
     try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
     try { pubsub.publish(mpTopic(id), JSON.stringify(revOut)); } catch (e2) {}
     return;
   }
   // ---- ally handshake: directed, routed, never stored ----
   if (m.t === "allyReq" || m.t === "allyRes" || m.t === "allyRemove") {
     if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) return;
     if (!ch.members[hash]) return;
     var aTo = mpCleanStr(m.to, 64).toLowerCase();
     if (!mpValidHash(aTo) || !ch.members[aTo]) return;
     try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
     if (m.t === "allyReq") {
       var aReq = mpCleanStr(m.reqId, 16);
       if (!aReq) return;
       try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "allyReq", from: hash, to: aTo, reqId: aReq, name: (ch.members[hash] || {}).name || undefined })); } catch (e2) {}
     } else if (m.t === "allyRes") {
       var aReq2 = mpCleanStr(m.reqId, 16);
       if (!aReq2) return;
       try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "allyRes", from: hash, to: aTo, reqId: aReq2, accept: !!m.accept })); } catch (e2) {}
     } else {
       try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "allyRemove", from: hash, to: aTo })); } catch (e2) {}
     }
     return;
   }
   // ---- player trade: directed offers, routed, never stored. Items move via
   // mpGive (ref links the give to its offer); clients auto-complete. ----
   if (m.t === "tradeOffer" || m.t === "tradeCounter" || m.t === "tradeDecline") {
     if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) return;
     if (!ch.members[hash]) return;
     var trTo = mpCleanStr(m.to, 64).toLowerCase();
     if (!mpValidHash(trTo) || !ch.members[trTo]) return;
     var trOffer = mpCleanStr(m.offerId, 16);
     if (!trOffer) return;
     try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
     if (m.t === "tradeDecline") {
       try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "tradeDecline", from: hash, to: trTo, offerId: trOffer })); } catch (e2) {}
     } else {
       var trId = mpCleanStr(m.id, 40);
       if (m.t === "tradeOffer" && !trId) return;
       var trN = Math.max(1, Math.min(99, m.n | 0 || 1));
       var trUp = Math.max(0, Math.min(5, m.up | 0 || 0)) || undefined;
       var trNick = mpCleanStr(m.nick, 24) || undefined;
       try { pubsub.publish(mpTopic(id), JSON.stringify({ t: m.t, from: hash, to: trTo, offerId: trOffer, id: trId || "", n: trN, up: trUp, nick: trNick })); } catch (e2) {}
     }
     return;
   }
   // ---- guild board + commissions: exclusive pins and shared player
   // postings. Validated + relayed, never stored. Receivers apply them to
   // their own hero-local guild state; first turn-in wins by done race. ----
    if (m.t === "guildClaim" || m.t === "guildCommNew" || m.t === "guildCommDone" || m.t === "guildCommAccept" || m.t === "guildCommSync") {
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) return;
      if (!ch.members[hash]) return;
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      var gOut = null;
      if (m.t === "guildClaim") {
        var gUid = mpCleanStr(m.uid, 128);
        if (!gUid) return;
        gOut = { t: "guildClaim", from: hash, uid: gUid, boardId: mpCleanStr(m.boardId, 128) || undefined };
      } else if (m.t === "guildCommAccept") {
        var aCid = mpCleanStr(m.cid, 128);
        if (!aCid) return;
        gOut = { t: "guildCommAccept", from: hash, cid: aCid, by: mpCleanStr(m.by, 24) || undefined };
      } else if (m.t === "guildCommDone") {
        var dCid = mpCleanStr(m.cid, 128);
        if (!dCid) return;
        gOut = { t: "guildCommDone", from: hash, cid: dCid, doneBy: mpCleanStr(m.doneBy, 32) || "another traveler", escrow: cleanGuildEscrow(m.escrow) };
      } else if (m.t === "guildCommNew") {
        var nComm = cleanGuildComm(m.comm);
        if (!nComm) return;
        gOut = { t: "guildCommNew", from: hash, comm: nComm };
      } else if (m.t === "guildCommSync") {
        var sOpen = [], sDone = [], sClaims = [];
        try {
          if (Array.isArray(m.open)) for (var gi = 0; gi < m.open.length && sOpen.length < 8; gi++) { var gc1 = cleanGuildComm(m.open[gi]); if (gc1) sOpen.push(gc1); }
          if (Array.isArray(m.done)) for (var gj = 0; gj < m.done.length && sDone.length < 12; gj++) { var gc2 = cleanGuildComm(m.done[gj]); if (gc2) sDone.push(gc2); }
          if (Array.isArray(m.claims)) for (var gk = 0; gk < m.claims.length && sClaims.length < 30; gk++) {
            var gcl = m.claims[gk];
            if (!gcl) continue;
            var cu = mpCleanStr(gcl.uid, 128);
            if (!cu) continue;
            sClaims.push({ uid: cu, boardId: mpCleanStr(gcl.boardId, 128) || undefined });
          }
        } catch (e3) {}
        if (!sOpen.length && !sDone.length && !sClaims.length) return;
        gOut = { t: "guildCommSync", from: hash, open: sOpen, done: sDone, claims: sClaims };
      }
      if (gOut) { try { pubsub.publish(mpTopic(id), JSON.stringify(gOut)); } catch (e2) {} }
      return;
    }
    // ---- shared delve claims + god-delve fall + tower wake: world facts, not
    // favors. Validated + relayed, never stored. Shard claims win by the
    // hub-stamped ts (one clock for every traveler, so simultaneous claims
    // resolve deterministically); receivers never rebroadcast. Channel-wide:
    // no ally gate — every connected hero closes the same world. ----
    if (m.t === "fragClaim" || m.t === "fragSync" || m.t === "hellTowers" || m.t === "peterSlain") {
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) return;
      if (!ch.members[hash]) return;
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e2) {}
      var wName = ((ch.members[hash] || {}).name) || undefined;
      if (m.t === "hellTowers") {
        try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "hellTowers", from: hash, name: wName })); } catch (e2) {}
      } else if (m.t === "peterSlain") {
        var pDid = mpCleanStr(m.did, 48);
        try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "peterSlain", from: hash, name: wName, did: pDid || "" })); } catch (e2) {}
      } else if (m.t === "fragClaim") {
        var fBid = String(m.bid || "").replace(/_L\d+$/, "").slice(0, 64);
        if (!fBid) return;
        try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "fragClaim", from: hash, name: wName, bid: fBid, ts: now })); } catch (e2) {}
      } else {
        var fBids = [];
        try {
          if (Array.isArray(m.bids)) for (var fi = 0; fi < m.bids.length && fBids.length < 64; fi++) {
            var rb0 = (m.bids[fi] && m.bids[fi].b) || m.bids[fi];
            var rb = String(rb0 || "").replace(/_L\d+$/, "").slice(0, 64);
            if (rb) fBids.push(rb);
          }
        } catch (e2) {}
        if (!fBids.length) return;
        // parallel claim times (hub clock) so receivers resolve doubles the
        // same way as live claims; old senders omit them (all zeros = keep).
        var fTs = [];
        try {
          if (Array.isArray(m.bidTs)) for (var ti = 0; ti < m.bids.length && fTs.length < 64; ti++) {
            var tt = Math.round(Number(m.bidTs[ti]) || 0);
            fTs.push(isFinite(tt) && tt > 0 ? Math.min(tt, 4100000000000) : 0);
          }
        } catch (e3) {}
        try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "fragSync", from: hash, name: wName, bids: fBids, bidTs: fTs.length === fBids.length ? fTs : undefined })); } catch (e4) {}
      }
      return;
    }
    if (m.t !== "pos") return;
    if (!mpRate(ratePos, ctx.conn.id, 120, 10000)) return;
    var mm = ch.members[hash];
    if (!mm) return;
    var x = Number(m.x), y = Number(m.y);
    var ox = null, oy = null;
    if (isFinite(x) && isFinite(y)) {
      if (x < -2000) x = -2000; if (x > 2000) x = 2000;
      if (y < -2000) y = -2000; if (y > 2000) y = 2000;
      ox = Math.round(x * 100) / 100; oy = Math.round(y * 100) / 100;
    } else return;
    var hp2 = Number(m.hp);
    var mpv = Number(m.mp);
    mm.lastSeen = now;
    if (typeof m.name === "string" && m.name.length <= 16) mm.name = m.name;
    try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e) {}
    try { ctx.conn.subscribe(mpTopic(id)); } catch (e) {}
    var fwdParty = null;
    try {
      if (Array.isArray(m.party)) {
        fwdParty = [];
        for (var pi2 = 0; pi2 < m.party.length && fwdParty.length < 12; pi2++) {
          var pe2 = m.party[pi2];
          if (!pe2) continue;
          var qx = Number(pe2.x), qy = Number(pe2.y);
          var qe = {
            n: mpCleanStr(pe2.n, 24) || "Ally",
            lv: Math.max(1, Math.min(125, pe2.lv | 0 || 1)),
            hp: Math.max(0, Math.min(999999, Math.round(Number(pe2.hp) || 0))),
            maxHp: Math.max(1, Math.min(999999, Math.round(Number(pe2.maxHp) || 0) || 40))
          };
          if (isFinite(qx) && isFinite(qy)) { qe.x = Math.round(Math.max(-2000, Math.min(2000, qx)) * 100) / 100; qe.y = Math.round(Math.max(-2000, Math.min(2000, qy)) * 100) / 100; }
          var qr2 = mpCleanStr(pe2.role, 16); if (qr2) qe.role = qr2;
          var qt2 = mpCleanStr(pe2.tint, 16); if (qt2 && /^#[0-9a-fA-F]{6}$/.test(qt2)) qe.tint = qt2;
          var qa2 = mpCleanApp(pe2.app); if (qa2) qe.app = qa2;
          fwdParty.push(qe);
        }
        if (!fwdParty.length) fwdParty = null;
      }
    } catch (e2) { fwdParty = null; }
      try {
        pubsub.publish(mpTopic(id), JSON.stringify({
          t: "pos", hash: hash, name: mm.name, x: ox, y: oy, party: fwdParty || undefined,
          // dead-reckoning fields (new clients send, old omit — receivers accept both)
          sq: (isFinite(Number(m.sq)) && Number(m.sq) > 0) ? Math.floor(Number(m.sq)) : undefined,
          st: isFinite(Number(m.st)) ? Math.max(0, Math.min(4100000000000, Math.round(Number(m.st)))) : undefined,
          // boot epoch: lets receivers tell a reloaded sender's restarted
          // counter from a stale relay echo (old clients omit, still fine)
          ep: isFinite(Number(m.ep)) ? Math.floor(Number(m.ep)) : undefined,
          vx: isFinite(Number(m.vx)) ? Math.max(-30, Math.min(30, Number(m.vx))) : undefined,
          vy: isFinite(Number(m.vy)) ? Math.max(-30, Math.min(30, Number(m.vy))) : undefined,
        hp: isFinite(hp2) ? Math.max(0, Math.min(9999, hp2)) : 1,
        maxHp: isFinite(Number(m.maxHp)) ? Math.max(1, Math.min(9999, Number(m.maxHp))) : 40,
        mp: isFinite(mpv) ? Math.max(0, Math.min(9999, mpv)) : 0,
        maxMp: isFinite(Number(m.maxMp)) ? Math.max(0, Math.min(9999, Number(m.maxMp))) : 20,
        lv: Math.max(1, Math.min(125, m.lv | 0 || 1)),
        role: mpCleanStr(m.role, 16), tint: mpCleanStr(m.tint, 16),
        sleeping: !!m.sleeping, dun: m.dun ? 1 : 0,
        // travel state (old clients omit these and read as ashore/unmounted)
        sail: m.sail ? 1 : 0, boat: mpCleanStr(m.boat, 16) || undefined,
        mk: mpCleanStr(m.mk, 24) || undefined, mt: mpCleanStr(m.mt, 16) || undefined,
        did: mpCleanStr(m.did, 48) || undefined,
        dLv: (isFinite(Number(m.dLv)) ? Math.max(0, Math.min(125, Number(m.dLv) | 0)) : undefined),
        dim: (m.dim === "heaven" ? "heaven" : (m.dim === "heaven" ? "heaven" : (m.dim === "hell" ? "hell" : (m.dim === "surf" ? "surf" : undefined)))),
        // look: custom face/outfit + equipped ids (old clients omit, read default)
        app: mpCleanApp(m.app),
        w: mpCleanStr(m.w, 32) || undefined, a: mpCleanStr(m.a, 32) || undefined,
        // planted torches + player-built overlays ride pos P2P already; the
        // relay must forward them too or relay-only peers never see a
        // neighbor's lights, walls, stalls, portals or furniture. Validated
        // + capped like everything else. ABSENT keeps the last-known layout;
        // EMPTY (no visible torches/placeables) clears it — so the relay must
        // forward [] too, never swallow it into undefined.
        to: (function () {
          try {
            if (!Array.isArray(m.to)) return undefined;
            var o = [];
            for (var ti = 0; ti < m.to.length && o.length < 60; ti++) {
              var tq = m.to[ti];
              if (!tq || tq.length < 3) continue;
              var tx2 = Number(tq[0]), ty2 = Number(tq[1]);
              if (!isFinite(tx2) || !isFinite(ty2)) continue;
              var tsc = (Number(tq[2]) === 1) ? 1 : ((Number(tq[2]) === 2) ? 2 : 0);
              var tlv = isFinite(Number(tq[3])) ? Math.max(0, Math.min(99, Number(tq[3]) | 0)) : 0;
              o.push([Math.round(Math.max(-3200, Math.min(3200, tx2)) * 10) / 10, Math.round(Math.max(-3200, Math.min(3200, ty2)) * 10) / 10, tsc, tlv]);
            }
            return o;
          } catch (e2) { return undefined; }
        })(),
        pl: (function () {
          try {
            if (!Array.isArray(m.pl)) return undefined;
            var o2 = [];
            for (var pi3 = 0; pi3 < m.pl.length && o2.length < 60; pi3++) {
              var pq = m.pl[pi3];
              if (!pq || pq.length < 3) continue;
              var px3 = Number(pq[0]), py3 = Number(pq[1]);
              if (!isFinite(px3) || !isFinite(py3)) continue;
              var pc = Number(pq[2]) | 0;
              if (!((pc >= 0 && pc < 10) || (pc >= 16 && pc < 21) || pc === 24)) continue;
              var pd = (Number(pq[3]) === 1) ? 1 : 0;
              o2.push([Math.round(Math.max(-3200, Math.min(3200, px3)) * 10) / 10, Math.round(Math.max(-3200, Math.min(3200, py3)) * 10) / 10, pc, pd]);
            }
            return o2;
          } catch (e2) { return undefined; }
        })(),
      }));
    } catch (e) {}
  } catch (e) {}
};
self.rpc = {
  mpCreate: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var spawnType = mpCleanStr(arg.spawnType, 16) || "town";
      var spawnName = mpCleanStr(arg.spawnName, 32) || "Cinderford";
      var pmax0 = mpClampParty((arg && isFinite(Number(arg.partyMax))) ? Number(arg.partyMax) : 4);
      var okTypes = { village: 1, town: 1, city: 1, watergate: 1, sakura: 1, fortress: 1, spawn: 1 };
      if (!okTypes[spawnType]) spawnType = "town";
      var root = mpLoad();
      var ids = Object.keys(root.channels);
      if (ids.length >= MP_MAX_CHANNELS) {
        // evict the stalest dead channel (ended, or fully offline 7+ days)
        var now = mpNow();
        var victim = null, victimT = 1e18;
        for (var i = 0; i < ids.length; i++) {
          var c = root.channels[ids[i]];
          var latest = 0;
          try { for (var k in (c.members || {})) latest = Math.max(latest, Number(c.members[k].lastSeen) || 0); } catch (e) {}
          if ((c.ended || now - latest > 7 * 24 * 3600 * 1000) && latest < victimT) { victimT = latest; victim = ids[i]; }
          if (!c.ended && now - latest <= 7 * 24 * 3600 * 1000) { latest = 1e18; }
        }
        if (victim) { try { delete root.channels[victim]; } catch (e) {} try { chanCache.delete(victim); } catch (e2) {} }
        else throw new Error("channels full, try again later");
      }
      var id = "";
      for (var t = 0; t < 20; t++) {
        var s = "";
        for (var j = 0; j < MP_ID_LEN; j++) s += MP_ID_ALPHABET[(Math.random() * MP_ID_ALPHABET.length) | 0];
        if (!root.channels[s] && !chanCache.has(s)) { id = s; break; }
      }
      if (!id) throw new Error("could not allocate channel");
      var now2 = mpNow();
      root.channels[id] = { id: id, spawnType: spawnType, spawnName: spawnName, createdAt: now2, host: null, ended: false, partyMax: pmax0, members: {} };
      if (!mpSave(root)) throw new Error("state full");
      try { chanCache.set(id, root.channels[id]); } catch (e) {}
      return JSON.stringify({ ok: true, channelId: id, spawnType: spawnType, spawnName: spawnName, dayTime: 480, host: null, partyMax: pmax0 });
    } catch (e) { throw new Error(String((e && e.message) || "create failed")); }
  },
  mpJoin: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      var name = mpCleanStr(arg.name, 16) || "Wanderer";
      if (!mpValidId(id)) throw new Error("unknown channel — check the link");
      if (!mpValidHash(hash)) throw new Error("bad identity — reload and retry");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel — check the link");
      // Ended links stay valid for the host: rejoining revives the same
      // world (same code, same folders, same heroes). Anyone else still
      // gets the ended notice — only the creator's machine holds the world.
      if (ch.ended) {
        if (String(ch.host || "").toLowerCase() !== hash) throw new Error("that stream has ended — ask the host for a fresh link");
        ch.ended = false;
      }
      var now = mpNow();
      mpPruneMembers(ch, now);
      if (!ch.members[hash] && Object.keys(ch.members).length >= MP_MAX_PLAYERS) throw new Error("channel is full (12 players max)");
      mpTouch(ch, hash, name, now);
      // PeerJS edition: the host opened this hub (openChannel pre-sets host),
      // so the seat never moves — a fast remote joiner must not steal it
      // while the host's own loopback join is still in flight. No migration:
      // the host stores this world.
      try { if (!ch.host) ch.host = hash; } catch (e) {}
      if (!mpCommit(id)) throw new Error("state full");
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e) {}
      try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e) {}
      var pubs = [];
      try { for (var k in ch.members) pubs.push({ hash: k, name: ch.members[k].name, lastSeen: Number(ch.members[k].lastSeen) || 0 }); } catch (e) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "join", hash: hash, name: ch.members[hash].name })); } catch (e) {}
      // Remembered character: the host may hold this traveler's hero from a
      // previous visit — the joiner restores it when they have nothing newer.
      var visitorHero = null;
      try { visitorHero = (ch.visitors && ch.visitors[hash]) ? ch.visitors[hash].hero : null; } catch (e) {}
      // dayTime: constant compat filler only — the HOST's live snapshots carry
      // the real clock. Nothing clock-like is stored.
      return JSON.stringify({ ok: true, channelId: id, host: ch.host || null, spawnType: ch.spawnType, spawnName: ch.spawnName, dayTime: 480, members: pubs, partyMax: mpClampParty(ch.partyMax), ended: !!ch.ended, visitorHero: visitorHero || undefined });
    } catch (e) { throw new Error(String((e && e.message) || "join failed")); }
  },
  // Guest character save/restore (host remembers every traveler's hero).
  // Identity is the connection hash (authoritative) — never the arg.
  mpVisitorSave: function (ctx, data) {
    try {
      var fromH = String((ctx && ctx.conn && ctx.conn.id) || '').toLowerCase();
      if (!mpValidHash(fromH)) throw new Error("bad identity");
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      if (!mpValidId(id)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (!ch.members[fromH]) throw new Error("not a member");
      var v = cleanVisitorHero(arg.hero);
      if (!v) throw new Error("bad hero");
      ch.visitors[fromH] = { hero: v, time: mpNow() };
      return JSON.stringify({ ok: true, stored: true });
    } catch (e) { throw new Error(String((e && e.message) || "visitor save failed")); }
  },
  mpVisitorGet: function (ctx, data) {
    try {
      var fromH = String((ctx && ctx.conn && ctx.conn.id) || '').toLowerCase();
      if (!mpValidHash(fromH)) throw new Error("bad identity");
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      if (!mpValidId(id)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      var v = null;
      try { v = (ch.visitors && ch.visitors[fromH]) ? ch.visitors[fromH].hero : null; } catch (e) {}
      return JSON.stringify({ ok: true, hero: v || null });
    } catch (e) { throw new Error(String((e && e.message) || "visitor get failed")); }
  },
  // Legacy stub: heroes live on their own machines now (local channel record),
  // not on this server. Kept so older tabs calling it stay quiet.
  mpSave: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      if (!mpValidId(id) || !mpValidHash(hash)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch || ch.ended) throw new Error("unknown channel");
      mpTouch(ch, hash, null, mpNow());
      try { connMeta.set(ctx.conn.id, { channelId: id, hash: hash }); } catch (e) {}
      try { ctx.conn.subscribe(mpTopic(id)); } catch (e) {}
      return JSON.stringify({ ok: true, stored: false, dayTime: 480 });
    } catch (e) { throw new Error(String((e && e.message) || "save failed")); }
  },
  mpPeers: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      if (!mpValidId(id)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      var now = mpNow();
      mpPruneMembers(ch, now);
      var pubs = [];
      try { for (var k in ch.members) pubs.push({ hash: k, name: ch.members[k].name, lastSeen: Number(ch.members[k].lastSeen) || 0 }); } catch (e) {}
      var on = mpOnline(ch, now);
      var sl = 0;
      for (var i = 0; i < on.length; i++) if (on[i].sleeping) sl++;
      return JSON.stringify({ ok: true, dayTime: 480, members: pubs, players: pubs, partyMax: mpClampParty(ch.partyMax), sleeping: sl, online: on.length, host: ch.host || null, ended: !!ch.ended });
    } catch (e) { throw new Error(String((e && e.message) || "peers failed")); }
  },
  // Legacy stub: tile truth lives on the HOST now (served via t:tileReq/
  // t:tileRes). Kept so older tabs calling it stay quiet.
  mpTiles: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      if (!mpValidId(id)) throw new Error("bad request");
      return JSON.stringify({ ok: true, list: [] });
    } catch (e) { throw new Error(String((e && e.message) || "tiles failed")); }
  },
  // Legacy stub: the host's snapshots carry the clock now.
  mpTime: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      if (!mpValidId(id)) throw new Error("bad request");
      return JSON.stringify({ ok: true, dayTime: 480 });
    } catch (e) { throw new Error(String((e && e.message) || "time failed")); }
  },
  mpSleep: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      if (!mpValidId(id) || !mpValidHash(hash)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      var m = ch.members[hash];
      if (!m) throw new Error("unknown player — rejoin the channel");
      var now = mpNow();
      m.sleeping = !!arg.sleeping;
      m.lastSeen = now;
      var on = mpOnline(ch, now);
      var sl = 0;
      for (var i = 0; i < on.length; i++) if (on[i].sleeping) sl++;
      var done = false;
      if (on.length > 0 && sl >= on.length) {
        for (var k in ch.members) try { ch.members[k].sleeping = false; } catch (e) {}
        done = true;
      }
      // sleep votes are ephemeral: never committed to disk.
      if (done) {
        try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "sleepDone" })); } catch (e) {}
      } else {
        mpPubSleep(ch);
      }
      return JSON.stringify({ ok: true, sleeping: sl, online: on.length, allAsleep: done });
    } catch (e) { throw new Error(String((e && e.message) || "sleep failed")); }
  },
  mpChat: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      var text = mpCleanStr(arg.text, 300).trim();
      if (!mpValidId(id) || !mpValidHash(hash)) throw new Error("bad request");
      if (!text) throw new Error("empty message");
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) throw new Error("too fast — slow down");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      var p = ch.members[hash];
      if (!p) throw new Error("unknown player — rejoin the channel");
      p.lastSeen = mpNow();
      var chatCid = mpCleanStr(arg.cid, 96);
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "chat", from: hash, name: p.name, text: text, ts: mpNow(), cid: chatCid || undefined })); } catch (e) {}
      return JSON.stringify({ ok: true });
    } catch (e) { throw new Error(String((e && e.message) || "chat failed")); }
  },
  mpWhisper: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      var to = mpCleanStr(arg.to, 64).toLowerCase();
      var text = mpCleanStr(arg.text, 300).trim();
      if (!mpValidId(id) || !mpValidHash(hash) || !mpValidHash(to)) throw new Error("bad request");
      if (!text) throw new Error("empty message");
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) throw new Error("too fast — slow down");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      var p = ch.members[hash];
      if (!p) throw new Error("unknown player — rejoin the channel");
      if (!ch.members[to]) throw new Error("that player is gone");
      p.lastSeen = mpNow();
      var whCid = mpCleanStr(arg.cid, 96);
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "whisper", from: hash, name: p.name, to: to, text: text, ts: mpNow(), cid: whCid || undefined })); } catch (e) {}
      return JSON.stringify({ ok: true });
    } catch (e) { throw new Error(String((e && e.message) || "whisper failed")); }
  },
  mpGive: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var from = mpCleanStr(arg.fromHash, 64).toLowerCase();
      var to = mpCleanStr(arg.toHash, 64).toLowerCase();
      var item = mpCleanStr(arg.id, 40);
      var gUp = Math.max(0, Math.min(5, arg.up | 0 || 0)) || undefined;
      var gNick = mpCleanStr(arg.nick, 24) || undefined;
     var gref = mpCleanStr(arg.ref, 16);
      var n = Math.max(1, Math.min(99, arg.n | 0 || 1));
      // hell-fragment giving carries the delve-claims too (same count as the
      // items): validated strings, forwarded with the give so the receiver's
      // distinct set grows with the stack.
      var gbids = null;
      try {
        if (Array.isArray(arg.bids)) {
          gbids = [];
          for (var gi = 0; gi < arg.bids.length && gbids.length < 99; gi++) {
            var gb = String(arg.bids[gi] || "").replace(/_L\d+$/, "").slice(0, 64);
            if (gb) gbids.push(gb);
          }
          if (!gbids.length) gbids = null;
        }
      } catch (e2) { gbids = null; }
      if (!mpValidId(id) || !mpValidHash(from) || !mpValidHash(to)) throw new Error("bad request");
      if (!item) throw new Error("bad item");
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) throw new Error("too fast — slow down");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      var pf = ch.members[from], pt = ch.members[to];
      if (!pf || !pt) throw new Error("unknown player");
      pf.lastSeen = mpNow();
      // items move client-side; the server only routes the announcement.
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "give", from: from, fromName: pf.name, to: to, id: item, n: n, ts: mpNow(), ref: gref || undefined, bids: gbids || undefined, up: gUp, nick: gNick })); } catch (e) {}
      return JSON.stringify({ ok: true, n: n });
    } catch (e) { throw new Error(String((e && e.message) || "give failed")); }
  },
  mpHeal: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var from = mpCleanStr(arg.fromHash, 64).toLowerCase();
      var to = mpCleanStr(arg.toHash, 64).toLowerCase();
      var amount = Math.max(1, Math.min(9999, Math.round(Number(arg.amount) || 0)));
      if (!mpValidId(id) || !mpValidHash(from) || !mpValidHash(to)) throw new Error("bad request");
      if (!(amount > 0)) throw new Error("bad amount");
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) throw new Error("too fast — slow down");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      if (!ch.members[from] || !ch.members[to]) throw new Error("unknown player");
      ch.members[from].lastSeen = mpNow();
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "heal", from: from, fromName: ch.members[from].name, to: to, amount: amount, ts: mpNow() })); } catch (e) {}
      return JSON.stringify({ ok: true });
    } catch (e) { throw new Error(String((e && e.message) || "heal failed")); }
  },
  mpReincarnate: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      var name = mpCleanStr(arg.name, 16) || "Wanderer";
      if (!mpValidId(id) || !mpValidHash(hash)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      if (!ch.members[hash]) throw new Error("unknown player — rejoin the channel");
      ch.members[hash].name = name;
      ch.members[hash].lastSeen = mpNow();
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "reincarnate", hash: hash, name: name, ts: mpNow() })); } catch (e) {}
      return JSON.stringify({ ok: true, dayTime: 480 });
    } catch (e) { throw new Error(String((e && e.message) || "reincarnate failed")); }
  },
  // Migration is gone: the world lives on the host's machine, so there is no
  // next-in-line. Kept so older tabs calling it stay quiet.
  mpClaimHost: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      if (!mpValidId(id)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      return JSON.stringify({ ok: true, host: ch.host || null, ended: !!ch.ended });
    } catch (e) { throw new Error(String((e && e.message) || "claim failed")); }
  },
  // Host-only channel settings: party cap per player. Committed to the
  // directory, then fanned out as t:partyMax so every client converges.
  // May ONLY change while no one is playing (pre-game server setup): the
  // title-screen Channel settings dialog is the single writer. Anyone with
  // a fresh heartbeat blocks the change.
  mpPartyMax: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      if (!mpValidId(id) || !mpValidHash(hash)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (String(ch.host || "").toLowerCase() !== hash) throw new Error("only the host can change channel settings");
      var _on = [];
      try { _on = mpOnline(ch, mpNow()); } catch (e) { _on = []; }
      if (_on && _on.length) throw new Error("settings can only be changed while no one is playing — ask everyone to leave first");
      if (!mpRate(rateChat, ctx.conn.id, 10, 10000)) throw new Error("too fast — slow down");
      var nm = mpClampParty(arg.partyMax);
      ch.partyMax = nm;
      if (!mpCommit(id)) throw new Error("state full");
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "partyMax", from: hash, partyMax: nm, ts: mpNow() })); } catch (e) {}
      return JSON.stringify({ ok: true, partyMax: nm });
    } catch (e) { throw new Error(String((e && e.message) || "settings failed")); }
  },
  mpKick: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      var target = mpCleanStr(arg.target, 64).toLowerCase();
      if (!mpValidId(id) || !mpValidHash(hash) || !mpValidHash(target)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (ch.ended) throw new Error("that stream has ended");
      if (String(ch.host || "").toLowerCase() !== hash) throw new Error("only the host can remove members");
      if (target === hash) throw new Error("host cannot remove itself — end the stream instead");
      if (!ch.members[target]) throw new Error("that player is gone");
      try { delete ch.members[target]; } catch (e) {}
      mpCommit(id);
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "kicked", hash: target, by: hash, ts: mpNow() })); } catch (e) {}
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "leave", hash: target })); } catch (e) {}
      return JSON.stringify({ ok: true });
    } catch (e) { throw new Error(String((e && e.message) || "kick failed")); }
  },
  // Explicit host end-of-stream: marks the single-session key dead and tells
  // every client to leave NOW with a "stream ended" notice. Only the host.
  // Accidental disconnects never send this — they just go quiet and may rejoin.
  mpEnd: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      if (!mpValidId(id) || !mpValidHash(hash)) throw new Error("bad request");
      var ch = mpGet(id);
      if (!ch) throw new Error("unknown channel");
      if (String(ch.host || "").toLowerCase() !== hash) throw new Error("only the host can end the stream");
      ch.ended = true;
      mpCommit(id);
      try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "hostEnded", from: hash, ts: mpNow() })); } catch (e) {}
      return JSON.stringify({ ok: true });
    } catch (e) { throw new Error(String((e && e.message) || "end failed")); }
  },
  mpLeave: function (ctx, data) {
    try {
      var arg = {};
      try { arg = JSON.parse(String(data || "{}")); } catch (e) { arg = {}; }
      var id = mpCleanStr(arg.channelId, 16).toUpperCase();
      var hash = mpCleanStr(arg.hash, 64).toLowerCase();
      if (mpValidId(id)) {
        try { ctx.conn.unsubscribe(mpTopic(id)); } catch (e) {}
        try {
          var ch = mpGet(id);
          if (ch && mpValidHash(hash) && ch.members[hash]) {
            try { delete ch.members[hash]; } catch (e2) {}
            mpCommit(id);
          }
        } catch (e) {}
        try { pubsub.publish(mpTopic(id), JSON.stringify({ t: "leave", hash: hash })); } catch (e) {}
      }
      try { connMeta.delete(ctx.conn.id); } catch (e) {}
      return JSON.stringify({ ok: true });
    } catch (e) { return JSON.stringify({ ok: true }); }
  }
};
// ---- Hub entry points (called by src/mp_net.js) ----
var Hub = {
  isOpen: function () { try { return !!HubChannelId && HubChannels.has(HubChannelId); } catch (e) { return false; } },
  channelId: function () { return HubChannelId; },
  openChannel: function (opts) {
    opts = opts || {};
    var id = String(opts.id || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
    if (!mpValidId(id)) throw new Error('bad channel id');
    var hostHash = String(opts.hostHash || '').toLowerCase();
    if (!mpValidHash(hostHash)) throw new Error('bad host hash');
    var now = mpNow();
    var ch = { id: id, spawnType: mpCleanStr(opts.spawnType, 16) || 'town',
      spawnName: mpCleanStr(opts.spawnName, 32) || 'Cinderford',
      createdAt: now, host: hostHash, ended: false,
      // No pre-seeded member: the host joins like everyone else (their first
      // mpJoin arrives over the local loopback facade). Pre-adding would fake
      // a heartbeat and permanently block pre-game settings (mpPartyMax
      // requires nobody online) + inflate the roster before anyone joined.
      // visitors: the host remembers every traveler's character (per-hash
      // hero snapshot, seeded from the host's disk at open) so returners
      // get their character back even from a fresh device.
      visitors: {},
      partyMax: mpClampParty(opts.partyMax), members: {} };
    try { HubChannels.set(id, ch); } catch (e) {}
    HubChannelId = id;
    return ch;
  },
  // mode 'end': mark ended (newcomers refused, host may revive); 'down': drop record.
  closeChannel: function (mode) {
    try {
      var ch = null;
      try { ch = HubChannels.get(HubChannelId) || null; } catch (e) {}
      if (ch && mode === 'end') {
        ch.ended = true;
        try { pubsub.publish(mpTopic(ch.id), JSON.stringify({ t: 'hostEnded', from: ch.host, ts: mpNow() })); } catch (e) {}
      }
    } catch (e) {}
    if (mode !== 'end') { try { HubChannels.delete(HubChannelId); } catch (e) {} HubChannelId = null; }
  },
  registerConn: function (hash, sendFn) {
    try { __hubSends.set(String(hash || '').toLowerCase(), sendFn); } catch (e) {}
  },
  unregisterConn: function (hash) {
    var h = String(hash || '').toLowerCase();
    try { if (typeof self.onclose === 'function') self.onclose(__fakeCtx(h)); } catch (e) {}
    try { __hubSends.delete(h); } catch (e) {}
  },
  setLoopback: function (fn) { try { __hubLoopback = (typeof fn === 'function') ? fn : null; } catch (e) {} },
  // Fast-lane routing (installed by the host transport while hosting).
  setFastSend: function (fn) { try { __hubFastSend = (typeof fn === 'function') ? fn : null; } catch (e) {} },
  setHotCheck: function (fn) { try { __hubHotCheck = (typeof fn === 'function') ? fn : null; } catch (e) {} },
  // ---- remembered characters (per-world visitor heroes) ----
  // The host keeps every traveler's character snapshot in the open channel
  // (memory) and the host page persists it to disk; returners get their
  // character back even from a device that never saw them before.
  seedVisitors: function (obj) {
    try {
      if (!HubChannelId || !HubChannels.has(HubChannelId)) return false;
      var ch = HubChannels.get(HubChannelId);
      ch.visitors = {};
      var n = 0;
      for (var k in (obj || {})) {
        if (n >= 24) break;
        var hk = String(k || '').toLowerCase();
        if (!mpValidHash(hk)) continue;
        var v = cleanVisitorHero(obj[k] && obj[k].hero);
        if (!v) continue;
        ch.visitors[hk] = { hero: v, time: mpNow() };
        n++;
      }
      return true;
    } catch (e) { return false; }
  },
  noteVisitor: function (hash, hero) {
    try {
      if (!HubChannelId || !HubChannels.has(HubChannelId)) return false;
      var hk = String(hash || '').toLowerCase();
      if (!mpValidHash(hk)) return false;
      var v = cleanVisitorHero(hero);
      if (!v) return false;
      HubChannels.get(HubChannelId).visitors[hk] = { hero: v, time: mpNow() };
      return true;
    } catch (e) { return false; }
  },
  getVisitors: function () {
    try {
      if (!HubChannelId || !HubChannels.has(HubChannelId)) return {};
      var src = HubChannels.get(HubChannelId).visitors || {}, out = {};
      for (var k in src) { try { out[k] = { hero: src[k].hero, time: src[k].time }; } catch (e) {} }
      return out;
    } catch (e) { return {}; }
  },
  callRpc: function (method, arg, fromHash) {
    try {
      var fn = self.rpc && self.rpc[method];
      if (typeof fn !== 'function') return { ok: false, error: 'unknown rpc' };
      var payload = fn(__fakeCtx(fromHash), JSON.stringify(arg || {}));
      return { ok: true, payload: payload };
    } catch (e) { return { ok: false, error: String((e && e.message) || 'rpc failed') }; }
  },
  handleRelay: function (msgObj, fromHash) {
    try {
      if (!msgObj || typeof msgObj !== 'object') return;
      if (!HubChannelId || !HubChannels.has(HubChannelId)) return;
      var h = String(fromHash || '').toLowerCase();
      // Authoritative sender stamp (stricter than the old server: no spoofing).
      msgObj.channelId = HubChannelId;
      msgObj.hash = h;
      if (typeof self.onmessage === 'function') self.onmessage({ conn: __stubConn(h), data: JSON.stringify(msgObj) });
    } catch (e) {}
  },
  // Read-only directory snapshot for rendezvous probes (no membership needed).
  probe: function () {
    try {
      if (!HubChannelId || !HubChannels.has(HubChannelId)) return null;
      var r = Hub.callRpc('mpPeers', { channelId: HubChannelId }, 'probe');
      if (!r || !r.ok) return null;
      var j = JSON.parse(String(r.payload || '{}'));
      return { online: true, ended: !!j.ended, host: j.host || null, members: j.members || [],
        partyMax: j.partyMax, spawnType: j.spawnType, spawnName: j.spawnName, channelId: HubChannelId };
    } catch (e) { return null; }
  },
};
return { Hub: Hub };
})();
