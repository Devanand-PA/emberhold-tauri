/* World: seeded noise, chunk/dungeon gen, LocalKv persistence. window.World */
window.World = (() => {
  const { TILE, CHUNK, T } = window.CFG;
  // ---- deterministic hash/noise ----
  function hash2(x, y) {
    // Math.imul keeps 32-bit integer precision for far-frontier coords
    // (float mult overflows 2^53 at |coord| > ~12M tiles).
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function valueNoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    const u = smooth(xf), v = smooth(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) { return valueNoise(x, y) * 0.6 + valueNoise(x * 2.3 + 7, y * 2.3 + 3) * 0.28 + valueNoise(x * 5.1 + 13, y * 5.1 + 29) * 0.12; }

  function kvFolder(name) {
    try { const L = window.LocalKv; if (L && L[name]) return L[name]; } catch (e) {}
    const r = (window.root || window);
    if (r.kv && r.kv[name]) return r.kv[name];
    // memory fallback (private mode): cached per folder name so writes survive
    // across calls (a fresh Map per call would silently drop every save/wipe).
    // Folder names are slot-scoped, so fallback data stays isolated per slot.
    if (!fallbackStores[name]) {
      const m = new Map();
      fallbackStores[name] = { async get(k) { return m.get(k); }, async set(k, v) { m.set(k, v); }, async delete(k) { m.delete(k); }, async entries() { return [...m.entries()]; }, async keys() { return [...m.keys()]; } };
    }
    return fallbackStores[name];
  }
  const fallbackStores = {};
  // ---------- save slots ----------
  // Slot "1" reuses the original folders/keys so old saves keep working.
  const MAX_SLOTS = 5;
  // v15 world construction: typed origin hearth, single settlement/holding/
  // wild tile pipeline, tiered services (important shops/guilds only in
 // MID+LARGE towns/cities, castles only in the capital) + far-frontier
 // highlands (frostcrown/blightmire/stormcrag/crystal scar/umbral waste,
 // bigger mountain/volcano blobs). Saves stamped below this are rebuilt
 // on load (world wiped, hero kept) — see rebuildOldWorld.
  // v16 hell continent (far-off hell ground at HELL_CENTER, towers, castle,
  // demon holds, hell delves). Old ground is redrawn via rebuildOldWorld.
  // v18 hell is its own DIMENSION (same coordinate numbers, separate
  // content + storage): activeDim selects which world's rules bake and
  // where chunks/delves persist. The surface never rolls hell content and
  // hell never rolls surface content (see biomeAt/regionSettlement/
  // regionBase gates); towers are the only transit. Out-of-hell ground in
  // the hell dimension bakes as hell_void (impassable stone, no spawns).
  // v19 parallel universes: hell mirrors the surface coordinate-for-coordinate
  // (Hell.CENTER is (0,0), towers share numbers across dims). The old far-off
  // continent at (16000,0) is retired — saves below v19 rebuild once.
  // v20: heaven rebuild — angel/pantheon interiors used surf seeds + surf
  // origin leaked into heaven, so heaven baked surf towns under surf plots.
  // v24: house spacing + doors — main-loop buildings keep a 1-tile spare ring
  // (service ensures keep a gap-0 last-resort so hamlets never lose stable /
  // lodge), doors never sit on corners, lanterns carve like trees in front
  // of doors, and fresh chunks get the door-front backfill too (worker-baked
  // wild neighbours carry no door repair).
  // v25: strict ring for EVERY building — service ensures lost the gap-0
  // fallback, so packed hamlets may drop stable/lodge rather than touch.
  // v26: alien hell (fungal/gloom/verdant biomes, shroom+spire trees, two new
  // hell holdings) + blooming heaven (bloom/mist/pasture biomes, floating
  // islands) — saves stamped below this rebuild once on load.
  const WORLD_GEN = 26;
  let activeSlot = "1";
  // Separate dimension: 'surf' or 'hell'. The game keeps this synced to the
  // hero's dimension (World.setDim); pure worldgen below reads it, so the
  // same coordinates bake different ground per dimension. Cross-dimension
  // loads (host simulating a remote viewer's bubble) pass dim explicitly to
  // getChunk/getDungeon, which set/restore this around their synchronous
  // generation sections (race-free: generation itself never awaits).
 let activeDim = "surf";
  function getDim() { return activeDim === "heaven" ? "heaven" : activeDim === "hell" ? "hell" : "surf"; }
 function setDim(d) {
    activeDim = (d === "heaven") ? "heaven" : (d === "hell") ? "hell" : "surf";
   return activeDim;
 }
  function normDim(d) { return d === "heaven" ? "heaven" : d === "hell" ? "hell" : "surf"; }
  // Generation counter: bumped on every world switch or wipe. Async flows
  // (chunk enrichment, AI dreams) capture slot+epoch at start and abort when
  // either changes, so a dream started in slot A can never write names,
  // chunks or NPCs into slot B — or resurrect a deleted world.
  let epoch = 0;
  // Multiplayer channel: when set (e.g. "AB12CD34EF56"), chunk/npc/dungeon
  // stores switch to per-channel folders so each session keeps its own local
  // world cache on the HOST's machine (never on a server).
  let activeChannel = null;
  function getChannel() { return activeChannel; }
  function setChannel(id) {
    id = (id == null ? null : String(id).toUpperCase());
    if (id && !/^[A-Z0-9]{6,16}$/.test(id)) id = null;
    if (id !== activeChannel) {
      activeChannel = id;
      bumpEpoch();
    }
    return activeChannel;
  }
  function slotEpoch() { return epoch; }
  function bumpEpoch() {
    epoch++;
    try { mem.chunks.clear(); mem.npcs.clear(); mem.dungeons.clear(); mem.enrichedQueued.clear(); } catch (e) { }
    return epoch;
  }
  // Fresh world in the CURRENT slot (new game): drop cache + invalidate flights.
  function resetWorldState() { return bumpEpoch(); }
  const slotId = (s) => String(s || activeSlot || "1");
  const chanTag = () => (activeChannel ? String(activeChannel).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16) : null);
   const npcFolderName = (s) => { const c = chanTag(); if (c) return `wnpcs_ch_${c}`; s = slotId(s); return s === "1" ? "wnpcs" : `wnpcs_s${s}`; };
  const chunkKeySuffix = (dim) => dim === "hell" ? "_hell" : dim === "heaven" ? "_heaven" : "";
  const chunkFolderName = (s, dim) => { const c = chanTag(); dim = normDim(dim == null ? activeDim : dim); const hd = chunkKeySuffix(dim); if (c) return `wchunks_ch_${c}${hd}`; s = slotId(s); return s === "1" ? `wchunks${hd}` : `wchunks_s${s}${hd}`; };
  const dungeonFolderName = (s, dim) => { const c = chanTag(); dim = normDim(dim == null ? activeDim : dim); const hd = chunkKeySuffix(dim); if (c) return `wdungeons_ch_${c}${hd}`; s = slotId(s); return s === "1" ? `wdungeons${hd}` : `wdungeons_s${s}${hd}`; };
  const chunkStore = (s, dim) => kvFolder(chunkFolderName(s === undefined ? activeSlot : s, dim === undefined ? activeDim : dim));
  const npcStore = (s) => kvFolder(npcFolderName(s === undefined ? activeSlot : s));
  const dungeonStore = (s, dim) => kvFolder(dungeonFolderName(s === undefined ? activeSlot : s, dim === undefined ? activeDim : dim));
  const saveStore = () => kvFolder("psave");
  const slotSaveKey = (s) => `slot_${slotId(s)}`;
  function getSlot() { return activeSlot; }
  function setSlot(s) {
    s = slotId(s);
    if (!/^[1-5P]$/.test(s)) s = "1";
    if (s !== activeSlot) {
      activeSlot = s;
      bumpEpoch();
    }
    return activeSlot;
  }
  async function loadSlotData(s) {
    s = slotId(s);
    try {
      let d = await saveStore().get(slotSaveKey(s));
      if (!d && s === "1") { try { d = await saveStore().get("player"); } catch (e) { } }
      if (!d || !d.player) return null;
      return d;
    } catch (e) { return null; }
  }
  async function saveSlotData(s, data) {
    s = slotId(s);
    // Return success so callers can tell the player the truth: a swallowed
    // write error used to surface as a cheerful "Saved." toast with nothing
    // actually persisted (blocked/private-mode/full storage).
    try { await saveStore().set(slotSaveKey(s), data); }
    catch (e) { try { console.error("[emberhold] saveSlotData failed:", e); } catch (e2) { } return false; }
    if (s === "1") { try { await saveStore().set("player", data); } catch (e) { } }
    return true;
  }
  async function listSlots() {
    const out = [];
    for (let i = 1; i <= MAX_SLOTS; i++) {
      const s = String(i);
      const d = await loadSlotData(s);
      out.push(d ? { slot: s, player: d.player, explored: d.explored || [], time: d.time || 0, v: d.v } : { slot: s, player: null });
    }
    return out;
  }
  async function deleteSlot(s) {
    s = slotId(s);
    try { await saveStore().delete(slotSaveKey(s)); } catch (e) { }
    if (s === "1") { try { await saveStore().delete("player"); } catch (e) { } }
    try {
      // v18: wipe both dimension stores (surf + hell) plus the shared NPCs.
      for (const st of [kvFolder(chunkFolderName(s, "surf")), kvFolder(chunkFolderName(s, "hell")), kvFolder(chunkFolderName(s, "heaven")), kvFolder(npcFolderName(s)), kvFolder(dungeonFolderName(s, "surf")), kvFolder(dungeonFolderName(s, "hell")), kvFolder(dungeonFolderName(s, "heaven"))]) {
        let ks = []; try { ks = await st.keys(); } catch (e) { ks = []; }
        for (const k of ks) { try { await st.delete(k); } catch (e) { } }
      }
    } catch (e) { }
    if (s === activeSlot) {
      bumpEpoch();
    }
  }
  // ---------- save export / import (singleplayer slots 1-5) ----------
  // Export packs the slot's hero record plus every stored chunk/npc/dungeon
  // into one plain-JSON object the UI downloads as a file. Import validates
  // the shape, wipes the target slot's stores, and writes the contents back.
  // Folder names are computed WITHOUT the multiplayer channel override, so
  // these always touch singleplayer saves even if a channel is cached.
  function spFolder(prefix, s) { return s === "1" ? prefix : `${prefix}_s${s}`; }
  function asEntries(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "object") { try { return Object.entries(v); } catch (e) { return []; } }
    return [];
  }
  async function exportSlotData(s) {
    s = String(s || "1");
    if (!/^[1-5P]$/.test(s)) return null;
    const save = await loadSlotData(s);
    if (!save || !save.player) return null;
    let chunks = [], npcs = [], dungeons = [];
    // v18: both dimension stores export together (keys already h_/c_ prefixed).
    try {
      const a = (await kvFolder(spFolder("wchunks", s)).entries()) || [];
      const b = (await kvFolder(spFolder("wchunks_hell", s)).entries()) || [];
      let hh2 = []; try { hh2 = (await kvFolder(spFolder("wchunks_heaven", s)).entries()) || []; } catch (e2) { hh2 = []; }
      chunks = a.concat(b).concat(hh2);
    } catch (e) { chunks = []; }
    try { npcs = (await kvFolder(spFolder("wnpcs", s)).entries()) || []; } catch (e) { npcs = []; }
    try {
      const a = (await kvFolder(spFolder("wdungeons", s)).entries()) || [];
      const b = (await kvFolder(spFolder("wdungeons_hell", s)).entries()) || [];
      let dh2 = []; try { dh2 = (await kvFolder(spFolder("wdungeons_heaven", s)).entries()) || []; } catch (e3) { dh2 = []; }
      dungeons = a.concat(b).concat(dh2);
    } catch (e) { dungeons = []; }
    // Guard against OOM stringify on enormous worlds: refuse early with a
    // clear error instead of throwing halfway through JSON serialization.
    try {
      const est = (chunks.length * 4000) + (npcs.length * 2000) + (dungeons.length * 20000);
      if (est > 150 * 1024 * 1024) return { error: "world-too-large", chunks: chunks.length, npcs: npcs.length, dungeons: dungeons.length };
    } catch (e) { }
    return { app: "emberhold", kind: "slot-backup", version: 2, exportedAt: new Date().toISOString(), slot: s, save, chunks, npcs, dungeons };
  }
  async function countChunks(s) {
    try {
      s = slotId(s);
      // v18: count both dimension stores.
      let n = 0;
      try { const a = await kvFolder(spFolder("wchunks", s)).keys(); if (Array.isArray(a)) n += a.length; } catch (e) { }
      try { const b = await kvFolder(spFolder("wchunks_hell", s)).keys(); if (Array.isArray(b)) n += b.length; } catch (e) { }
      try { const c2 = await kvFolder(spFolder("wchunks_heaven", s)).keys(); if (Array.isArray(c2)) n += c2.length; } catch (e) { }
      return n;
    } catch (e) { return -1; }
  }
  async function importSlotData(s, payload) {
    s = String(s || "1");
    if (!/^[1-5P]$/.test(s)) return { ok: false, error: "bad slot" };
    if (!payload || typeof payload !== "object") return { ok: false, error: "That file is not an Emberhold save (unreadable JSON)." };
    if (payload.app && payload.app !== "emberhold") return { ok: false, error: "That file is not an Emberhold save." };
    const save = payload.save;
    if (!save || typeof save !== "object" || !save.player || typeof save.player !== "object") {
      return { ok: false, error: "That file has no hero in it — pick an Emberhold slot-backup file." };
    }
    let chunks = asEntries(payload.chunks), npcs = asEntries(payload.npcs), dungeons = asEntries(payload.dungeons);
    if (!Array.isArray(payload.chunks) && payload.chunks != null && typeof payload.chunks !== "object") return { ok: false, error: "Bad chunk section in file." };
    if (!Array.isArray(payload.npcs) && payload.npcs != null && typeof payload.npcs !== "object") return { ok: false, error: "Bad NPC section in file." };
    if (!Array.isArray(payload.dungeons) && payload.dungeons != null && typeof payload.dungeons !== "object") return { ok: false, error: "Bad dungeon section in file." };
    if (chunks.length > 5000 || npcs.length > 8000 || dungeons.length > 1500) {
      return { ok: false, error: "File too large to import (suspicious size — refused)." };
    }
    // v18: hell chunks carry the h_ prefix; v1 backups hold surf chunks only.
    for (const [k] of chunks) { if (typeof k !== "string" || !/^[chv]_-?\d+_-?\d+$/.test(k)) return { ok: false, error: `Bad chunk key "${String(k).slice(0, 40)}" — wrong file?` }; }
    for (const [k] of dungeons) { if (typeof k !== "string" || !/^d_-?\d+_-?\d+(_w)?(_L\d+)?$/.test(k)) return { ok: false, error: `Bad dungeon key "${String(k).slice(0, 40)}" — wrong file?` }; }
    for (const [k] of npcs) { if (typeof k !== "string" || k.length > 120) return { ok: false, error: "Bad NPC key — wrong file?" }; }
    // wipe the target slot's world first so stale tiles can't survive import
    try {
      for (const st of [kvFolder(spFolder("wchunks", s)), kvFolder(spFolder("wchunks_hell", s)), kvFolder(spFolder("wchunks_heaven", s)), kvFolder(spFolder("wnpcs", s)), kvFolder(spFolder("wdungeons", s)), kvFolder(spFolder("wdungeons_hell", s)), kvFolder(spFolder("wdungeons_heaven", s))]) {
        let ks = []; try { ks = await st.keys(); } catch (e) { ks = []; }
        for (const k of ks) { try { await st.delete(k); } catch (e) { } }
      }
    } catch (e) { }
    const data = {
      v: save.v || window.CFG.SAVE_VERSION, player: save.player,
      explored: Array.isArray(save.explored) ? save.explored.slice(-5000) : [],
      time: save.time || Date.now(), slot: s,
    };
    try { data.player._slot = s; } catch (e) { }
    try { await saveStore().set(slotSaveKey(s), data); }
    catch (e) { return { ok: false, error: "Storage write failed (blocked or full?) — import aborted." }; }
    if (s === "1") { try { await saveStore().set("player", data); } catch (e) { } }
    let wc = 0, wn = 0, wd = 0;
    try {
      // v18: route each chunk/delve back into its own dimension store.
      const csSurf = kvFolder(spFolder("wchunks", s));
      const csHell = kvFolder(spFolder("wchunks_hell", s));
      const csHeaven = kvFolder(spFolder("wchunks_heaven", s));
      for (const [k, v] of chunks) {
        if (!v || typeof v !== "object") continue;
        try { v._slot = s; } catch (e) { }
        try {
          const hellK = (typeof k === "string" && k.indexOf("h_") === 0) || (v && v.dim === "hell");
          const heavK = (typeof k === "string" && k.indexOf("v_") === 0) || (v && v.dim === "heaven");
          if (hellK && v && !v.dim) { try { v.dim = "hell"; } catch (e2) { } }
          if (heavK && v && !v.dim) { try { v.dim = "heaven"; } catch (e2) { } }
          await (heavK ? csHeaven : hellK ? csHell : csSurf).set(k, v); wc++;
        } catch (e) { }
      }
    } catch (e) { }
    try {
      const ns = kvFolder(spFolder("wnpcs", s));
      for (const [k, v] of npcs) {
        if (!v || typeof v !== "object" || v.isTame) continue; // tames live in the hero record
        try { v._slot = s; } catch (e) { }
        try { await ns.set(k, v); wn++; } catch (e) { }
      }
    } catch (e) { }
    try {
      const dsSurf = kvFolder(spFolder("wdungeons", s));
      const dsHell = kvFolder(spFolder("wdungeons_hell", s));
      for (const [k, v] of dungeons) {
        if (!v || typeof v !== "object") continue;
        try { v._slot = s; } catch (e) { }
        try {
          const hellD = v && v.dim === "hell";
          await (hellD ? dsHell : dsSurf).set(k, v); wd++;
        } catch (e) { }
      }
    } catch (e) { }
    if (s === activeSlot) bumpEpoch(); // drop mem so the next load reads the import, not stale cache
    return { ok: true, counts: { chunks: wc, npcs: wn, dungeons: wd }, hero: (data.player && data.player.name) || "Wanderer" };
  }
  // ---------- multiplayer channel export (host saves + joiner heroes) ----------
  // Packs one channel's local save: every local hero record for the channel
  // (psave chero_<ID>_* — the host hero plus any past aliases on this machine)
  // plus the channel world folders (wchunks/wnpcs/wdungeons_ch_<ID> with
  // hell/heaven variants). Hosts get the full world; joiners get their hero
  // plus whatever world cache their machine holds. Mirrors exportSlotData's
  // payload conventions (kind "channel-backup" instead of "slot-backup").
  async function exportChannelData(channelId) {
    channelId = String(channelId || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
    if (!/^[A-Z0-9]{6,16}$/.test(channelId)) return null;
    let heroes = [];
    try {
      const st = saveStore();
      let ks = []; try { ks = await st.keys(); } catch (e) { ks = []; }
      const prefix = "chero_" + channelId + "_";
      for (const k of (ks || [])) {
        if (typeof k !== "string" || k.slice(0, prefix.length) !== prefix) continue;
        try {
          const rec = await st.get(k);
          if (rec && rec.player) heroes.push({ key: k, save: rec });
        } catch (e) { }
      }
    } catch (e) { heroes = []; }
    // localStorage fallback (older clients kept channel heroes there)
    try {
      const seen = new Set(heroes.map((h) => h.key));
      const prefix = "chero_" + channelId + "_";
      for (let i = 0; i < localStorage.length; i++) {
        let lk = null; try { lk = localStorage.key(i); } catch (e2) { lk = null; }
        if (!lk || lk.slice(0, 16) !== "emberhold-chero_") continue;
        const key = lk.slice(10);
        if (!key || key.slice(0, prefix.length) !== prefix) continue;
        if (seen.has(key)) continue;
        try {
          const rec = JSON.parse(localStorage.getItem(lk));
          if (rec && rec.player) { heroes.push({ key, save: rec }); seen.add(key); }
        } catch (e2) { }
      }
    } catch (e) { }
    let chunks = [], npcs = [], dungeons = [];
    try {
      const folders = [`wchunks_ch_${channelId}`, `wchunks_ch_${channelId}_hell`, `wchunks_ch_${channelId}_heaven`];
      for (const f of folders) {
        try { const e = (await kvFolder(f).entries()) || []; chunks = chunks.concat(e); } catch (e2) { }
      }
    } catch (e) { chunks = []; }
    try { npcs = (await kvFolder(`wnpcs_ch_${channelId}`).entries()) || []; } catch (e) { npcs = []; }
    try {
      const folders = [`wdungeons_ch_${channelId}`, `wdungeons_ch_${channelId}_hell`, `wdungeons_ch_${channelId}_heaven`];
      for (const f of folders) {
        try { const e = (await kvFolder(f).entries()) || []; dungeons = dungeons.concat(e); } catch (e2) { }
      }
    } catch (e) { dungeons = []; }
    if (!heroes.length && !chunks.length && !npcs.length && !dungeons.length) return null;
    try {
      const est = (chunks.length * 4000) + (npcs.length * 2000) + (dungeons.length * 20000) + (heroes.length * 200000);
      if (est > 150 * 1024 * 1024) return { error: "world-too-large", chunks: chunks.length, npcs: npcs.length, dungeons: dungeons.length, heroes: heroes.length };
    } catch (e) { }
    return { app: "emberhold", kind: "channel-backup", version: 2, exportedAt: new Date().toISOString(), channelId, heroes, chunks, npcs, dungeons };
  }

  const mem = { chunks: new Map(), npcs: new Map(), dungeons: new Map(), enrichedQueued: new Set() };
  // Session-cache caps (RAM hardening): mem is a pure write-through cache
  // over the kv stores, so evicted entries simply re-read from storage on
  // next touch. Without caps a marathon session (hours of travel, deep
  // delves) grows these maps for the whole tab lifetime. LRU: re-set on
  // hit keeps the hot working set pinned.
  const MEM_MAX = { chunks: 600, npcs: 1200, dungeons: 80, enriched: 5000 };
  function memSet(map, key, val, max) {
    try {
      if (map.has(key)) map.delete(key);
      map.set(key, val);
      while (map.size > max) {
        const fk = map.keys().next().value;
        map.delete(fk);
      }
    } catch (e) { try { map.set(key, val); } catch (e2) { } }
  }
  function memQueueAdd(key) {
    try {
      mem.enrichedQueued.add(key);
      if (mem.enrichedQueued.size > MEM_MAX.enriched) {
        // FIFO trim oldest (Sets iterate insertion order)
        let n = mem.enrichedQueued.size - MEM_MAX.enriched;
        for (const k of mem.enrichedQueued) {
          mem.enrichedQueued.delete(k);
          if (--n <= 0) break;
        }
      }
    } catch (e) { }
  }

  function chunkKey(cx, cy, dim) { dim = normDim(dim == null ? activeDim : dim); return (dim === "hell" ? "h_" : dim === "heaven" ? "v_" : "c_") + cx + "_" + cy; }
  function dungeonMemKey(id, dim) { dim = normDim(dim == null ? activeDim : dim); return dim + ":" + String(id); }
  function distOrigin(gx, gy) { return Math.hypot(gx, gy); }

  // ---- origin hearth (v11): every world founds its starting town as a
  // typed settlement at tile (0,0) — the kind is rolled per new game and
  // stored on the player, so it persists. There is no untyped "spawn" town
  // anymore; pre-v11 saves are rebuilt on load (see rebuildOldWorld below).
  function spawnType() {
    try {
      const t = window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.spawnType;
      if (t && SETTLE_DEF[t]) return t;
    } catch (e) { }
    return "town";
  }
  function spawnName() {
    try {
      const n = window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.spawnName;
      if (typeof n === "string" && n) return n.slice(0, 32);
    } catch (e) { }
    return "Emberhold";
  }
  function spawnSettlement() {
    const t = spawnType();
    return { cx: 0, cy: 0, radius: SETTLE_DEF[t].radius, type: t };
  }
  // Canonical origin settlement (same object as spawnSettlement — one name
  // for tile code, one for callers that think in "origin" terms).
  function originSettlement() { return spawnSettlement(); }
  function spawnInfo() { return { type: spawnType(), name: spawnName() }; }

  // ---- outlying settlements: villages, towns, cities + themed holds ----
  // Regions of 8x8 chunks roll for at most one settlement center, so
  // settlements stay spaced out but common enough to find while wandering.
  const RS = 8;
 const SETTLE_DEF = {
   village: { radius: 12, npc: [2, 3] },
   town: { radius: 34, npc: [3, 5] },
   city: { radius: 75, npc: [2, 3] },
   watergate: { radius: 36, npc: [3, 5] },
   sakura: { radius: 32, npc: [3, 5] },
   fortress: { radius: 34, npc: [3, 5] },
   desert_souk: { radius: 13, npc: [2, 3] },
   steppe_ger: { radius: 12, npc: [2, 3] },
   mesa_pueblo: { radius: 13, npc: [2, 3] },
   frost_hold: { radius: 13, npc: [2, 3] },
   trade_city: { radius: 85, npc: [2, 3] },
   port_city: { radius: 80, npc: [2, 3] },
   capital: { radius: 95, npc: [2, 3] },
    // v16 hell holds (demon villages/towns/cities — civilized demons).
    demon_village: { radius: 13, npc: [2, 3] },
    demon_town: { radius: 34, npc: [3, 5] },
    demon_city: { radius: 70, npc: [2, 3] },
    hell_castle: { radius: 60, npc: [2, 3] },
    angel_village: { radius: 13, npc: [2, 3] },
    angel_town: { radius: 34, npc: [3, 5] },
    angel_city: { radius: 70, npc: [2, 3] },
    pantheon: { radius: 60, npc: [2, 3] },
    pantheon_outpost: { radius: 20, npc: [2, 3] },
  };
  // Raw roll (no neighbor checks): the spacing wrapper below compares raw
  // neighbors, so it must call this — never the wrapper (no recursion).
  function regionSettlementRaw(rx, ry) {
    const h = hash2(rx * 101 + 7, ry * 131 + 3);
    if (h < 0.35) return null;
    const t = hash2(rx * 37 + 1, ry * 53 + 9);
    let type = t < 0.22 ? "village" : t < 0.38 ? "town" : t < 0.48 ? "desert_souk" : t < 0.56 ? "steppe_ger" : t < 0.63 ? "mesa_pueblo" : t < 0.70 ? "frost_hold" : t < 0.78 ? "watergate" : t < 0.85 ? "sakura" : t < 0.90 ? "fortress" : t < 0.94 ? "city" : t < 0.965 ? "trade_city" : t < 0.985 ? "port_city" : "capital";
    const def0 = SETTLE_DEF[type];
    const cox = 1 + ((hash2(rx * 17 + 5, ry * 29 + 11) * 6) | 0);
    const coy = 1 + ((hash2(rx * 23 + 13, ry * 41 + 7) * 6) | 0);
    const cx = (rx * RS + cox) * CHUNK + 8, cy = (ry * RS + coy) * CHUNK + 8;
    const d0 = distOrigin(cx, cy);
    if (d0 < 72) return null; // keep the spawn vale wild
    // Metros are far-off finds: downgrade too-close rolls to hamlets.
    if (type === "capital" && d0 < 140) type = "town";
    else if (type === "trade_city" && d0 < 120) type = "town";
    else if (type === "port_city" && d0 < 120) type = "watergate";
    const def = SETTLE_DEF[type];
    // no towns in the open ocean (same test as biomeAt's OCEAN gate, so the
    // two can never disagree; biomeAt would recurse through settlementAt)
    if (distOrigin(cx, cy) > 170) {
      try { if (fbm(cx * 0.012 + 40, cy * 0.012 + 940) > 0.60) return null; } catch (e) { }
    }
    return { type, cx, cy, radius: def.radius };
  }
  // Metros need empty land around them: a metro roll too close to another
  // settlement (within both radii + margin) becomes a plain town instead,
  // so 75-95-radius walls never swallow their neighbors. Pure function of
  // region coords (compares raw rolls only — never recurses).
 const METRO_TYPES = { city: 1, trade_city: 1, port_city: 1, capital: 1 };
 function regionSettlement(rx, ry) {
   const s = regionSettlementRaw(rx, ry);
    if (!s) return null;
    // v19 parallel universes: the surface never consults the hell disc — it
    // bakes its own towns everywhere. The hell side gates on the disc below.
    let hellDisc = false;
    try { hellDisc = isHellBaseGround(s.cx, s.cy); } catch (e) { hellDisc = false; }
    const rdim = getDim();
    if (rdim === "hell") {
      if (!hellDisc) return null; // void keeps no hearths
      try {
        const dt = (window.Hell && window.Hell.demonTypeFor ? window.Hell.demonTypeFor(s.type, s.cx, s.cy) : "demon_village");
        const dd = SETTLE_DEF[dt] || SETTLE_DEF.demon_village;
        return { type: dt, cx: s.cx, cy: s.cy, radius: dd.radius };
      } catch (e) { return null; }
    }
    if (rdim === "heaven") {
      let heavDisc = false;
      try { heavDisc = isHeavenBaseGround(s.cx, s.cy); } catch (e) { heavDisc = false; }
      if (!heavDisc) return null;
      try {
        const dt = (window.Heaven && window.Heaven.angelTypeFor ? window.Heaven.angelTypeFor(s.type, s.cx, s.cy) : "angel_village");
        const dd = SETTLE_DEF[dt] || SETTLE_DEF.angel_village;
        return { type: dt, cx: s.cx, cy: s.cy, radius: dd.radius };
      } catch (e) { return null; }
    }
    if (!METRO_TYPES[s.type]) return s;
    for (let ax = rx - 2; ax <= rx + 2; ax++) for (let ay = ry - 2; ay <= ry + 2; ay++) {
      if (ax === rx && ay === ry) continue;
      const t = regionSettlementRaw(ax, ay);
      if (!t) continue;
      if (Math.hypot(s.cx - t.cx, s.cy - t.cy) < s.radius + t.radius + 12) {
        return { type: "town", cx: s.cx, cy: s.cy, radius: SETTLE_DEF.town.radius };
      }
    }
    return s;
  }
  // canonical road links for the settlement of region (rx,ry): its 2 nearest
  // neighbours among regions [rx±2] (the spawn hearth counts as a neighbour).
  // Pure function of region coords, so every chunk draws the same segments.
  function settleLinks(rx, ry) {
    const s = regionSettlement(rx, ry);
    if (!s) return [];
    const cands = [{ cx: 0, cy: 0, spawn: true }];
    for (let ax = rx - 2; ax <= rx + 2; ax++) for (let ay = ry - 2; ay <= ry + 2; ay++) {
      if (ax === rx && ay === ry) continue;
      const t = regionSettlement(ax, ay);
      if (t) cands.push(t);
    }
    cands.sort((a, b) => ((a.cx - s.cx) * (a.cx - s.cx) + (a.cy - s.cy) * (a.cy - s.cy)) - ((b.cx - s.cx) * (b.cx - s.cx) + (b.cy - s.cy) * (b.cy - s.cy)));
    return cands.slice(0, 2).map(t => [s, t]);
  }
  function segDist2(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const L2 = dx * dx + dy * dy;
    let t = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = ax + dx * t - px, qy = ay + dy * t - py;
    return qx * qx + qy * qy;
  }
  // settlements whose center lies inside chunk (cx,cy): portal hosts.
  // Includes the spawn hearth at the origin.
  // v20: demon holds ARE hearths — hell runs the same portal network as the
  // surface (one portal per demon village/town/city). Only the hell castle
  // stays out (its god-delve mouth is not a hearth) and the origin spawn
  // hearth stays surface-only.
  function portalHostsForChunk(cx, cy) {
    const hosts = [];
    const gx0 = cx * CHUNK, gy0 = cy * CHUNK;
    try {
      const dimNow = getDim();
      const brx = Math.floor(cx / RS), bry = Math.floor(cy / RS);
      for (let ax = brx - 1; ax <= brx + 1; ax++) for (let ay = bry - 1; ay <= bry + 1; ay++) {
        const s = regionSettlement(ax, ay);
        if (s && s.cx >= gx0 && s.cx < gx0 + CHUNK && s.cy >= gy0 && s.cy < gy0 + CHUNK) {
          if (s.type === "hell_castle") continue;
          if (s.type && s.type.indexOf("demon_") === 0 && dimNow !== "hell") continue;
          hosts.push(s);
        }
      }
      // v19: the origin spawn hearth is surf-only — hell/heaven have no
      // portals into the surface hearth network (castle/pantheon stay out).
      if (dimNow === "surf") {
        const SP = spawnSettlement();
        if (SP.cx >= gx0 && SP.cx < gx0 + CHUNK && SP.cy >= gy0 && SP.cy < gy0 + CHUNK) hosts.push(SP);
      }
    } catch (e) { }
    return hosts;
  }
  // nearest walkable tile to a host center inside this chunk's tile array
  // (not solid, not inside a building footprint, no other POI on it) — for
  // the hearth portal.
  function portalSpot(gx0, gy0, tiles, hostS, pois) {
    let SOLID = null;
    try { SOLID = window.CFG.SOLID; } catch (e) { return null; }
    for (let r = 0; r <= 7; r++) {
      for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const gx = hostS.cx + dx, gy = hostS.cy + dy;
        const lx = gx - gx0, ly = gy - gy0;
        if (lx < 0 || ly < 0 || lx > 15 || ly > 15) continue;
        try {
          if (SOLID.has(tiles[ly * CHUNK + lx])) continue;
          if (buildingTileAt(gx, gy, hostS) != null) continue;
          if (Array.isArray(pois) && pois.some(q => q && q.gx === gx && q.gy === gy)) continue;
        } catch (e) { continue; }
        return { lx, ly, gx, gy };
      }
    }
    return null;
  }
  // settlement (if any) owning ONE tile. The origin hearth is a normal
  // candidate (nearest covering settlement wins); watergate moats extend
  // 2 past radius.
  function settlementAt(gx, gy) {
    let best = null, bestD = 1e9;
    const sdim = getDim();
    // origin hearth is surf-only — hell's origin is void, heaven's heart is
    // the pantheon (it used to leak in here and beat the pantheon on ties).
    if (sdim === "surf") {
      try {
        const o = spawnSettlement();
        const od = Math.hypot(gx - o.cx, gy - o.cy);
        if (od <= o.radius + (o.type === "watergate" ? 2 : 0)) { best = o; bestD = od; }
      } catch (e) { }
    }
    // v18 hell castle lives in the hell dimension only.
    if (sdim === "hell") {
      try {
        if (window.Hell && window.Hell.CENTER) {
          const hx = window.Hell.CENTER.x, hy = window.Hell.CENTER.y;
          const hd = Math.hypot(gx - hx, gy - hy);
          const hr = (window.Hell.CASTLE_RADIUS || 60);
          if (hd <= hr) return { cx: hx, cy: hy, radius: hr, type: "hell_castle" };
        }
      } catch (e) {}
    }
    // heaven heart: the radiant pantheon owns its disc like the castle does.
    // regionSettlement never returns it (origin-adjacent rolls are nulled),
    // so without this the runtime lookup misses while the bake hits it.
    if (sdim === "heaven") {
      try {
        if (window.Heaven && window.Heaven.CENTER) {
          const hx = window.Heaven.CENTER.x, hy = window.Heaven.CENTER.y;
          const hd = Math.hypot(gx - hx, gy - hy);
          const hr = (window.Heaven.PANTHEON_RADIUS || 60);
          if (hd <= hr) return { cx: hx, cy: hy, radius: hr, type: "pantheon" };
        }
      } catch (e) {}
    }
    const cx = Math.floor(gx / CHUNK), cy = Math.floor(gy / CHUNK);
    const rx = Math.floor(cx / RS), ry = Math.floor(cy / RS);
    for (let ax = rx - 1; ax <= rx + 1; ax++) for (let ay = ry - 1; ay <= ry + 1; ay++) {
      const s = regionSettlement(ax, ay);
      if (!s) continue;
      const d = Math.hypot(gx - s.cx, gy - s.cy);
      const reach = s.radius + (s.type === "watergate" ? 2 : 0);
      if (d <= reach && d < bestD) { best = s; bestD = d; }
    }
    return best;
  }

  // ---- enemy bases: goblin villages, orc strongholds, brigand camps ----
  // Deterministic region grid (RB=6 chunks, offset from the settlement RS=8
  // grid), rare rolls, and HARD placement rules: never near spawn, never on
  // water, spaced from each other, and VERY far from any settlement/hearth.
  // Pure functions of region coords — no storage needed for placement.
  const RB = 6;
  const BASE_DEF = {
    goblin_village: { radius: 14, wall: "wood", thick: 1, moat: "water" },
    orc_stronghold: { radius: 16, wall: "stone", thick: 2, moat: "lava" },
    brigand_camp: { radius: 13, wall: "wood", thick: 1, moat: null },
    kobold_warren: { radius: 11, wall: "wood", thick: 1, moat: null },
    gnoll_den: { radius: 13, wall: "wood", thick: 1, moat: null },
    skeleton_crypt: { radius: 14, wall: "stone", thick: 1, moat: null },
    cultist_sanctum: { radius: 14, wall: "stone", thick: 1, moat: "lava" },
    haunted_barrow: { radius: 13, wall: "wood", thick: 1, moat: "water" },
    minotaur_maze: { radius: 16, wall: "stone", thick: 2, moat: null },
    serpent_temple: { radius: 15, wall: "stone", thick: 1, moat: "water" },
    harpy_roost: { radius: 13, wall: "wood", thick: 1, moat: null },
    troll_den: { radius: 14, wall: "stone", thick: 1, moat: null },
    // ---- hell holdings (hell dimension only — never roll on the surface).
    // Same fort fields as the surface table, so walls/moats/reach all work
    // unchanged; rosters below are pure hell bestiary (see BASE_KINDS).
    cinder_warren: { radius: 14, wall: "stone", thick: 1, moat: "lava" },
    gore_hold: { radius: 13, wall: "stone", thick: 1, moat: null },
    obsidian_citadel: { radius: 16, wall: "stone", thick: 2, moat: "lava" },
    flesh_pit: { radius: 14, wall: "wood", thick: 1, moat: null },
    marrow_ossuary: { radius: 15, wall: "stone", thick: 1, moat: null },
    gloom_spire: { radius: 14, wall: "stone", thick: 2, moat: null },
  };
  const BASE_KINDS = {
    goblin_village: { kinds: ["goblin", "goblin", "goblin", "goblin_brute", "goblin_shaman"], boss: "goblin_king" },
    orc_stronghold: { kinds: ["orc_grunt", "orc_grunt", "orc_grunt", "orc_shaman", "orc_shaman"], boss: "orc_warchief" },
    brigand_camp: { kinds: ["bandit", "bandit", "outlaw", "outlaw", "murderer"], boss: "bandit_warlord" },
    kobold_warren: { kinds: ["kobold", "kobold", "kobold", "kobold_shaman", "kobold_shaman"], boss: "kobold_king" },
    gnoll_den: { kinds: ["gnoll", "gnoll", "gnoll", "gnoll_hunter", "gnoll_hunter"], boss: "gnoll_alpha" },
    skeleton_crypt: { kinds: ["skeleton", "skeleton", "skeleton", "draugr", "gasha_skull"], boss: "skeleton_warlord" },
    cultist_sanctum: { kinds: ["cultist", "cultist", "cultist", "striga", "utukku"], boss: "cultist_hierophant" },
    haunted_barrow: { kinds: ["wraith", "wraith", "banshee", "banshee", "dullahan_herald"], boss: "wraith_sovereign" },
    minotaur_maze: { kinds: ["minotaur_calf", "minotaur_calf", "minotaur_calf", "satyr", "centaur_foal"], boss: "minotaur_warlord" },
    serpent_temple: { kinds: ["naga", "naga", "gorgon_spawn", "gorgon_spawn", "hydra_spawn"], boss: "naga_raja" },
    harpy_roost: { kinds: ["harpy", "harpy", "harpy", "siren", "stymphalian"], boss: "harpy_matriarch" },
    troll_den: { kinds: ["troll_whelp", "troll_whelp", "troll_whelp", "leshy", "nurikabe"], boss: "troll_king" },
    // ---- hell garrisons: pure hell bestiary, one family per holding so
    // the six hell holdings read as distinct war-bands (ash / blood /
    // obsidian / flesh / bone / gloom). All kinds + bosses come from
    // src/dims/hell/hell_mobs.js — the 60-fiend roster holds far more than
    // six bases need, so no new mobs were required. v26: each family's
    // heaviest hitters (cut from the wild POOLS) muster ONLY in their
    // holding's garrison — the wilds keep the weaker fiends.
    cinder_warren: { kinds: ["cinder_imp", "cinder_imp", "ash_hound", "ember_crawler", "ash_mother", "charred_colossus"], boss: "ash_tyrant" },
    gore_hold: { kinds: ["gore_hound", "gore_hound", "sanguine_horror", "exsanguinator", "bleed_mother", "clot_brute"], boss: "gore_patriarch" },
    obsidian_citadel: { kinds: ["obsidian_shard", "obsidian_shard", "glass_maw", "mirror_fiend", "shard_ravager", "obsidian_golem"], boss: "gloom_sovereign" },
    flesh_pit: { kinds: ["flesh_mound", "maw_walker", "bile_spitter", "flesh_oracle", "muscle_brute", "pulse_mass"], boss: "maw_primogenitor" },
    marrow_ossuary: { kinds: ["marrow_eater", "ossuary_crawler", "skull_swarm", "gravewing", "bone_collector", "ribcage_walker", "ivory_tyrantkin"], boss: "marrow_sovereign" },
    gloom_spire: { kinds: ["mirror_fiend", "razor_choir", "chalk_wraith", "pulse_fiend", "obsidian_prophet", "vitrifier"], boss: "eventide_horror" },
  };
  const BASE_NAMES = {
    goblin_village: ["Grimtooth Warren", "Snagglemaw Hollow", "Mudsnout Den", "Rotfang Warren", "Thornsnout Hollow", "Grimear Den", "Snotgrub Warren", "Muckfang Hollow", "Grimble Den", "Stinkmire Warren"],
    orc_stronghold: ["Bloodtusk Stronghold", "Gorehowl Bastion", "Skullcrusher Hold", "Ironmaw Fortress", "Bonegrinder Bastion", "Wolfmaw Stronghold", "Grimjaw Hold", "Cragtooth Bastion"],
    brigand_camp: ["Cutthroat Camp", "Blackblade Hideout", "Redbrand Camp", "Daggerfall Hideout", "Wolfshead Camp", "Ashen Crow Hideout", "Hollow Coin Camp", "Nightjack Hideout"],
    kobold_warren: ["Nixnozzle Warren", "Candledeep Tunnels", "Sootpaw Burrows", "Glimmercap Warren", "Tallowwick Delve", "Pickbite Tunnels", "Embermite Burrows", "Darklamp Warren"],
    gnoll_den: ["Bonegnaw Den", "Hyena Hollow", "Carrionmound", "Laughingmaw Den", "Redmarrow Hollow", "Vulturecackle Den", "Splinterfang Hollow", "Howlmarrow Den"],
    skeleton_crypt: ["Marrowgate Crypt", "Pale Saint's Rest", "The Quiet Vaults", "Duskmarrow Crypt", "Ossuary of Whispers", "Grimvault Crypt", "The Hollow Sepulchre", "Charneldeep Crypt"],
    cultist_sanctum: ["The Ashen Sanctum", "Pit of the Hungry Flame", "Vesper's Red Chapel", "The Cinder Covenant", "Embermouth Sanctum", "The Howling Vestry", "Pyre of the Ninth", "The Black Alleluia"],
    haunted_barrow: ["Mistwallow Barrow", "The Weeping Mounds", "Greywidow Barrow", "Boghaunt Barrows", "The Sighing Cairns", "Mirelorn Barrow", "Widowfen Barrows", "The Drowned Mounds"],
    minotaur_maze: ["The Brazen Labyrinth", "Horned Halls", "Maze of the Bull King", "The Bronze Warrens", "Labyrinth of Echoes", "The Sundered Maze", "Halls of the Minotaur", "The Gilded Labyrinth"],
    serpent_temple: ["Temple of the Coiled Sun", "The Sunken Fane", "Hiss of Jade Temple", "The Venom Tabernacle", "Coilwater Temple", "The Emerald Sanctum", "Fangdeep Temple", "The Serpent's Litany"],
    harpy_roost: ["Screechwind Roost", "The Shrieking Crags", "Featherfall Roost", "Galeharp Roost", "The Cloudrend Nests", "Stormscreech Roost", "The High Lament", "Talonmist Roost"],
    troll_den: ["Mossjaw Den", "The Grumbling Hollow", "Bouldergut Den", "Lichenmaw Hollow", "The Stonebelly Caves", "Grumblemoss Den", "Cragbelly Hollow", "The Underbridge Den"],
    cinder_warren: ["Cinder Warren", "Ashfall Redoubt", "The Charred Warren", "Emberdeep Hold", "Sootfall Redoubt", "The Cinder Burrows", "Ashen Warren", "Pyrehold"],
    gore_hold: ["Gorehold", "The Bleeding Hold", "Sanguine Keep", "The Clotted Gate", "Veinhold", "The Red Chapel", "Goremaw Hold", "The Sanguine Redoubt"],
    obsidian_citadel: ["Obsidian Citadel", "The Glass Bastion", "Mirrorhold", "The Shard Keep", "Blackglass Citadel", "The Vitrified Throne", "Shardfall Keep", "The Obsidian Litany"],
    flesh_pit: ["Fleshpit", "The Gut Warrens", "Mawhold", "The Pulsing Pit", "Sinewdeep", "The Flayed Hold", "Gullet Warren", "The Flesh Liturgy"],
    marrow_ossuary: ["Marrow Ossuary", "The White Warren", "Ribcage Hold", "The Ivory Vaults", "Tibia Deep", "The Hollow Throne", "Charnelhold", "The Bone Litany"],
    gloom_spire: ["Gloomspire", "The Violet Spire", "Duskmere Needle", "The Hollow Spire", "Vitreous Reach", "The Gloaming Stack", "Shadeshire", "The Violet Litany"],
  };
  // Weighted muster of the twelve surface holdings: greenskins and
  // brigands are common, kobolds and gnolls plentiful, the deep horrors
  // rarer. Hell rolls its own six (see HELL_BASE_ROLL) — the two tables
  // never mix, so hell ground never grows a goblin village.
  const BASE_ROLL = [
    ["goblin_village", 0.15], ["brigand_camp", 0.28], ["kobold_warren", 0.39],
    ["gnoll_den", 0.49], ["orc_stronghold", 0.58], ["skeleton_crypt", 0.66],
    ["cultist_sanctum", 0.74], ["troll_den", 0.81], ["haunted_barrow", 0.88],
    ["minotaur_maze", 0.93], ["serpent_temple", 0.97], ["harpy_roost", 1.01],
  ];
  // Hell holdings: even muster across the six war-bands (ash / blood /
  // obsidian / flesh / bone / gloom), each with its own family roster above.
  const HELL_BASE_ROLL = [
    ["cinder_warren", 0.17], ["gore_hold", 0.34],
    ["obsidian_citadel", 0.50], ["flesh_pit", 0.67],
    ["marrow_ossuary", 0.84], ["gloom_spire", 1.01],
  ];
  const HELL_BASE_KINDS = {
    cinder_warren: 1, gore_hold: 1, obsidian_citadel: 1, flesh_pit: 1,
    marrow_ossuary: 1, gloom_spire: 1,
  };
  function baseTypeFor(t) {
    for (const [type, edge] of BASE_ROLL) if (t < edge) return type;
    return "harpy_roost";
  }
  function hellBaseTypeFor(t) {
    for (const [type, edge] of HELL_BASE_ROLL) if (t < edge) return type;
    return "gloom_spire";
  }
  // Heaven-ground test mirrors the hell disc (same numbers, soft cloud).
  function isHeavenBaseGround(gx, gy) {
    try {
      if (window.Heaven && window.Heaven.isHeavenGround) return !!window.Heaven.isHeavenGround(gx, gy);
    } catch (e) { }
    try {
      const hx = (window.Heaven && window.Heaven.CENTER && window.Heaven.CENTER.x) || 0;
      const hy = (window.Heaven && window.Heaven.CENTER && window.Heaven.CENTER.y) || 0;
      const hr = (window.Heaven && window.Heaven.RADIUS) || 3500;
      return Math.hypot(gx - hx, gy - hy) < hr;
    } catch (e) { return false; }
  }
  // Hell-ground test that never depends on script load order: prefer the
  // Hell helper once it exists, else fall back to the continent constants
  // (hell.js CENTER/RADIUS). Worker-mirrored logic must match exactly.
  function isHellBaseGround(gx, gy) {
    try {
      if (window.Hell && window.Hell.isHellGround) return !!window.Hell.isHellGround(gx, gy);
    } catch (e) { }
    try {
      const hx = (window.Hell && window.Hell.CENTER && window.Hell.CENTER.x) || 0;
      const hy = (window.Hell && window.Hell.CENTER && window.Hell.CENTER.y) || 0;
      const hr = (window.Hell && window.Hell.RADIUS) || 3500;
      return Math.hypot(gx - hx, gy - hy) < hr;
    } catch (e) { return false; }
  }
  // Pure center for a base region (no filtering — used for spacing checks so
  // regionBase never recurses into itself).
  function baseCenterFor(rx, ry) {
    const t = hash2(rx * 733 + 5, ry * 691 + 9);
    const cox = 1 + ((hash2(rx * 97 + 3, ry * 113 + 7) * 4) | 0);
    const coy = 1 + ((hash2(rx * 131 + 11, ry * 151 + 13) * 4) | 0);
    const cx = (rx * RB + cox) * CHUNK + 8, cy = (ry * RB + coy) * CHUNK + 8;
    // v19 parallel universes: the roster follows the dimension being baked,
    // never the coordinates — the two worlds share numbers but never mobs.
    let type = null;
    try { if (getDim() === "hell" && isHellBaseGround(cx, cy)) type = hellBaseTypeFor(t); } catch (e) { type = null; }
    if (!type) type = baseTypeFor(t);
    const def = BASE_DEF[type] || BASE_DEF.goblin_village;
    return { type, cx, cy, radius: def.radius };
  }
  function regionBase(rx, ry) {
    if (hash2(rx * 331 + 17, ry * 397 + 41) < 0.72) return null; // ~28% of base regions
    const b = baseCenterFor(rx, ry);
    if (distOrigin(b.cx, b.cy) < 150) return null; // very far from spawn
    let hellB = false;
    try { hellB = isHellBaseGround(b.cx, b.cy); } catch (e) { hellB = false; }
    // v19 parallel universes: hell holdings live in the hell dimension only
    // (inside the disc); the surface bakes its own holdings everywhere.
    // Void keeps none.
    const bdim = getDim();
    if (bdim === "heaven") return null; // heaven keeps no holdings — chill by design
    if (bdim === "hell" && !hellB) return null;
    // no water holdings on the surface (same ocean gate as settlements,
    // plus seas/lakes). Hell runs no oceans — its noise field is meaningless
    // there, so the water gate stays surface-only.
    if (!hellB && distOrigin(b.cx, b.cy) > 170) {
      try { if (fbm(b.cx * 0.012 + 40, b.cy * 0.012 + 940) > 0.60) return null; } catch (e) { }
    }
    try {
      const bt = biomeAt(b.cx, b.cy);
      if (bt === "ocean" || bt === "sea" || bt === "lake") return null;
      if (bt === "hell_void") return null;
      if (bt === "heaven_void") return null;
    } catch (e) { }
    // spaced from neighbouring holdings (unfiltered centers — conservative)
    for (let ax = rx - 1; ax <= rx + 1; ax++) for (let ay = ry - 1; ay <= ry + 1; ay++) {
      if (ax === rx && ay === ry) continue;
      const nb = baseCenterFor(ax, ay);
      if (Math.hypot(b.cx - nb.cx, b.cy - nb.cy) < 70) return null;
    }
    // VERY far from any settlement/hearth (60 tiles past its radius)
    try {
      const ccx = Math.floor(b.cx / CHUNK), ccy = Math.floor(b.cy / CHUNK);
      const rrx = Math.floor(ccx / RS), rry = Math.floor(ccy / RS);
      for (let ax = rrx - 1; ax <= rrx + 1; ax++) for (let ay = rry - 1; ay <= rry + 1; ay++) {
        const s = regionSettlement(ax, ay);
        if (!s) continue;
        if (Math.hypot(b.cx - s.cx, b.cy - s.cy) < s.radius + 60) return null;
      }
    } catch (e) { }
    return b;
  }
  // fortification footprint: walls hug the radius, moats run 2 past it.
  function baseReach(b) {
    const fort = (b && BASE_DEF[b.type]) || null;
    return b.radius + (fort && fort.moat ? 2 : 0);
  }
  // enemy base (if any) owning ONE tile. Moats extend 2 past the wall radius.
  function baseAt(gx, gy) {
    if (distOrigin(gx, gy) < 100) return null; // cheap gate: bases live far out
    const ccx = Math.floor(gx / CHUNK), ccy = Math.floor(gy / CHUNK);
    const rbx = Math.floor(ccx / RB), rby = Math.floor(ccy / RB);
    let best = null, bestD = 1e9;
    for (let ax = rbx - 1; ax <= rbx + 1; ax++) for (let ay = rby - 1; ay <= rby + 1; ay++) {
      const b = regionBase(ax, ay);
      if (!b) continue;
      const d = Math.hypot(gx - b.cx, gy - b.cy);
      const reach = baseReach(b);
      if (d <= reach && d < bestD) { best = b; bestD = d; }
    }
    return best;
  }
  function baseName(b) {
    try {
      const pool = BASE_NAMES[b.type] || BASE_NAMES.goblin_village;
      return pool[Math.floor(hash2(b.cx * 7 + 1, b.cy * 13 + 5) * pool.length) % pool.length];
    } catch (e) { return "Dark Holding"; }
  }
  function baseIdFor(b) { return "b_" + b.cx + "_" + b.cy; }
  // Per-tile base layout. Returns a tile id, or null outside the holding.
  // Rings: palisades or stone (orc maze walls run double-thick), water or
  // lava moats where the fort fields say so. Gates cut every ring on both axes.
  function baseTile(gx, gy, b) {
    const T = window.CFG.T;
    const fort = BASE_DEF[b.type] || BASE_DEF.goblin_village;
    const dx = gx - b.cx, dy = gy - b.cy;
    const d = Math.hypot(dx, dy);
    const R = b.radius;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const wallT = fort.wall === "stone" ? T.STONEWALL : T.HOUSEWALL;
    const moatT = fort.moat === "water" ? T.WATER : fort.moat === "lava" ? T.LAVA : null;
    const thick = fort.thick || 1;
    if (moatT) {
      if (d > R + 2) return null;
      if (d > R) {
        if (adx <= 1 || ady <= 1) return T.PATH; // moat causeway
        return moatT;
      }
    } else if (d > R) return null;
    if (d >= R - thick) {
      if (adx <= 1 || ady <= 1) return T.PATH; // gates
      return wallT;
    }
    // war-huts and halls of their own (via Buildings, like settlements)
    try {
      const bt = buildingTileAt(gx, gy, { cx: b.cx, cy: b.cy, radius: b.radius, type: b.type });
      if (bt != null) return bt;
    } catch (e) { }
    if (adx <= 1 || ady <= 1) return T.PATH;
    if (d < 3) return T.TOWNSTONE; // trampled war-ground
    const hh = hash2(gx, gy);
    if (hh > 0.90) return T.TALLGRASS;
    if (hh > 0.84) return T.FLOWER;
    return T.GRASS;
  }

 function biomeAt(gx, gy) {
   const d = distOrigin(gx, gy);
    // Heaven dimension: cloud ground inside the disc, heaven_void outside it.
    if (getDim() === "heaven") {
      try { if (window.Heaven && window.Heaven.isPantheonGround && window.Heaven.isPantheonGround(gx, gy)) return window.CFG.BIOME.TOWN; } catch (e2) {}
      let heavDisc = false;
      try { heavDisc = isHeavenBaseGround(gx, gy); } catch (e) { heavDisc = false; }
      if (!heavDisc) return "heaven_void";
      try { return (window.Heaven && window.Heaven.heavenBiomeFor ? window.Heaven.heavenBiomeFor(gx, gy) : "heaven_cloud"); } catch (e2) { return "heaven_cloud"; }
    }
    // v18 dimension split: hell ground exists in the hell dimension only.
    // The surface never rolls hell (the old disc is open ocean there) and
    // the hell dimension is hell ground inside the disc, void outside it.
    if (getDim() === "hell") {
      try { if (window.Hell && window.Hell.isCastleGround && window.Hell.isCastleGround(gx, gy)) return window.CFG.BIOME.TOWN; } catch (e2) {}
      let hellDisc = false;
      try { hellDisc = isHellBaseGround(gx, gy); } catch (e) { hellDisc = false; }
      if (!hellDisc) return "hell_void";
      try { return (window.Hell && window.Hell.hellBiomeFor ? window.Hell.hellBiomeFor(gx, gy) : "hell_ash"); } catch (e2) { return "hell_ash"; }
    }
    try {
      const o = spawnSettlement();
      if (Math.hypot(gx - o.cx, gy - o.cy) <= o.radius + 2) return window.CFG.BIOME.TOWN;
    } catch (e) { }
    if (settlementAt(gx, gy)) return window.CFG.BIOME.TOWN;
    const f = fbm(gx * 0.045, gy * 0.045);       // vegetation
    const w = fbm(gx * 0.03 + 100, gy * 0.03 + 50); // water
    const o = fbm(gx * 0.012 + 40, gy * 0.012 + 940); // continental water: seas far out, oceans further
    const c = fbm(gx * 0.02 + 900, gy * 0.02 + 100); // cold: tundra
    const v = fbm(gx * 0.02 + 300, gy * 0.02 + 700); // volcanic
    const m = fbm(gx * 0.03 + 700, gy * 0.03 + 300); // mountains
    const s = fbm(gx * 0.025 + 400, gy * 0.025 + 900); // desert
    const g = fbm(gx * 0.08 + 250, gy * 0.08 + 600); // gloom: dark-forest hearts
    // far-frontier biomes, rarest and farthest first — each needs its own
    // low-frequency noise blob AND distance, so regions read as big separate
    // highlands instead of thin rings. Thresholds sit near ~0.58 (fat blobs);
    // mountains/volcanoes were widened the same way (0.64/0.72 -> 0.58/0.64).
    const r = fbm(gx * 0.018 + 550, gy * 0.018 + 150); // frostcrown glaciers
    const b = fbm(gx * 0.022 + 250, gy * 0.022 + 350); // blightmire bogs
    const q = fbm(gx * 0.018 + 150, gy * 0.018 + 850); // stormcrag cliffs
    const k = fbm(gx * 0.018 + 850, gy * 0.018 + 450); // crystal scars
    const u = fbm(gx * 0.018 + 350, gy * 0.018 + 50);  // umbral waste
    if (d > 340 && u > 0.58) return window.CFG.BIOME.UMBRAL_WASTE;
    if (d > 320 && k > 0.58) return window.CFG.BIOME.CRYSTAL_SCAR;
    if (d > 300 && q > 0.58) return window.CFG.BIOME.STORMCRAG;
    if (d > 285 && b > 0.58) return window.CFG.BIOME.BLIGHTMIRE;
    if (d > 270 && r > 0.58) return window.CFG.BIOME.FROSTCROWN;
    if (d > 260 && v > 0.64) return window.CFG.BIOME.VOLCANO;
    if (d > 210 && m > 0.58) return window.CFG.BIOME.MOUNTAIN;
    if (d > 170 && o > 0.60) return window.CFG.BIOME.OCEAN;
    if (d > 150 && c > 0.62) return window.CFG.BIOME.TUNDRA;
    if (d > 130 && s > 0.60) return window.CFG.BIOME.DESERT;
    if (d > 100 && o > 0.56) return window.CFG.BIOME.SEA;
    if (w > 0.68) return window.CFG.BIOME.LAKE;
    if (d > 90 && f > 0.52 && g > 0.60) return window.CFG.BIOME.DARK_FOREST;
    if (f > 0.55) return window.CFG.BIOME.FOREST; // woods at any range — depth sets danger
    if (d > 64) return f > 0.42 ? window.CFG.BIOME.WILD : window.CFG.BIOME.PLAINS;
    return window.CFG.BIOME.PLAINS;
  }

 // Per-tile settlement layout. Returns a tile id, or null when the tile
 // lies outside the settlement (caller falls back to wilderness gen).
 // v7: typed buildings (window.Buildings) replace the old repeating hut
 // stamps. Settlement-level features (rings, moats, canals, pond, roads)
 // stay here; walls/doors/windows/floors come from the building layout.
  // ---- reachability crossings (Nov 2026): every water/lava/wall band gets
  // theme-appropriate gaps so no building door opens onto solid. Diagonal
  // gates (adx≈ady) give walled holds 8 entries instead of 4; watergate
  // canals get secondary plank bridges besides the center cross; the sakura
  // pond gets a footbridge. All deterministic, all mirrored in baseSolidAt
  // below so building placement agrees with baked tiles.
  function isDiagGate(adx, ady) { return Math.abs(adx - ady) <= 1; }
  function isWatergateCanalV(dx, dy, R) { return dx >= 5 && dx <= 6 && dy > -R + 4 && dy < R - 4; }
  function isWatergateCanalH(dx, dy, R) { return dy >= -6 && dy <= -5 && dx > -R + 4 && dx < R - 4; }
  function isWatergateBridge(dx, dy, adx, ady) {
    if (adx <= 1 || ady <= 1) return true; // center cross
    if (dx >= 5 && dx <= 6 && (Math.abs(dy - 8) <= 1 || Math.abs(dy + 12) <= 1)) return true;
    if (dy >= -6 && dy <= -5 && (Math.abs(dx - 8) <= 1 || Math.abs(dx + 12) <= 1)) return true;
    return false;
  }
  function isPondBridge(pdx, pdy) { return pdy === 0 && pdx >= -3 && pdx <= 3; }
  // Base-only solidity (ignores buildings): true when settlement-level ground
  // itself would be solid water/lava/wall. Roads/bridges/gates/pond-sand and
  // wall-lanterns count as walkable. Used by building placement + chunk
  // repair so doors never face solid ground.
  function baseSolidAt(s, gx, gy) {
    try {
      if (!s || gx == null || gy == null) return false;
      const dx = gx - s.cx, dy = gy - s.cy;
      const d = Math.hypot(dx, dy);
      const R = s.radius || 20;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      const gate8 = (adx <= 1 || ady <= 1 || isDiagGate(adx, ady));
      if (s.type === "city" || s.type === "trade_city") {
        if (d > R) return false;
        if (d >= R - 1) return !gate8;
        return false;
      }
      if (s.type === "frost_hold") {
        if (d > R) return false;
        if (d >= R - 1) return !gate8;
        const pdx = dx + 7, pdy = dy + 5;
        if ((pdx * pdx) / 9 + (pdy * pdy) / 6 <= 1) return !isPondBridge(pdx, pdy);
        return false;
      }
      if (s.type === "desert_souk" || s.type === "steppe_ger" || s.type === "mesa_pueblo") {
        if (d > R) return false;
        return false;
      }
      if (s.type === "port_city") {
        if (d > R) return false;
        if (d >= R - 1) return !gate8;
        // harbor bay (south), scaled: water except pier bridges
        const hdx = dx, hdy = dy - (R - R * 0.19 - 4);
        if ((hdx * hdx) / (R * 0.38 * (R * 0.38)) + (hdy * hdy) / (R * 0.19 * (R * 0.19)) <= 1) {
          if ((((dx % 14) + 14) % 14) <= 1 || adx <= 1 || ady <= 1) return false;
          return true;
        }
        return false;
      }
      if (s.type === "pantheon") {
        if (d > R) return false;
        if (d >= R - 1) return !gate8;
        const citH = R * 0.4;
        if (d >= citH - 1 && d <= citH + 1) return !gate8;
        return false;
      }
      if (s.type === "angel_city") {
        if (d > R) return false;
        if (d >= R - 1) return !gate8;
        return false;
      }
      if (s.type === "capital") {
        if (d > R) return false;
        if (d >= R - 1) return !gate8;
        // inner citadel wall (stone) at R*0.38, 8 gates
        const cit = R * 0.38;
        if (d >= cit - 1 && d <= cit + 1) return !gate8;
        return false;
      }
      if (s.type === "watergate") {
        if (d > R + 2) return false;
        if (d > R - 1) return !gate8;
        if (d >= R - 3) return !gate8;
        const inV = isWatergateCanalV(dx, dy, R), inH = isWatergateCanalH(dx, dy, R);
        if (inV || inH) return !isWatergateBridge(dx, dy, adx, ady);
        return false;
      }
      if (s.type === "sakura") {
        if (d > R) return false;
        const pdx = dx - 9, pdy = dy - 7;
        if ((pdx * pdx) / 9 + (pdy * pdy) / 6 <= 1) return !isPondBridge(pdx, pdy);
        return false;
      }
      if (s.type === "fortress") {
        if (d > R) return false;
        if (d > R - 2) return !gate8;
        if (d >= R - 4) {
          if (gate8) return false;
          try { if (hash2(gx, gy) > 0.90) return false; } catch (e) { }
          return true;
        }
        return false;
      }
      // enemy holdings: axis gates only (siege challenge kept at 4 entries).
      // Moat band R..R+2 + wall band R-thick..R; others walkable at base level.
      try {
        const W2 = null;
        void W2;
        if (typeof BASE_DEF !== "undefined" && BASE_DEF && BASE_DEF[s.type]) {
          const fort = BASE_DEF[s.type];
          const thick = (fort && fort.thick) || 1;
          const moat = fort && fort.moat;
          const axis = (adx <= 1 || ady <= 1);
          if (moat) {
            if (d > R + 2) return false;
            if (d > R) return !axis;
          } else if (d > R) return false;
          if (d >= R - thick) return !axis;
          return false;
        }
      } catch (e) { }
      return false;
    } catch (e) { return false; }
  }
  // Repair one door-front tile in a fresh tiles[]: water->planks, lava->stone,
  // ring wall->path, solid vegetation (tree/pine/sakura)->path step. Building
  // walls are left alone (caller checks buildingsAt first): placements keep
  // every door front clear of other shapes, so a wall here is at most a
  // legacy 0-gap neighbour — the player can still smash through it, and the
  // stored-chunk backfill (backfillDoorFronts) heals those to rubble.
  function fixDoorFrontTile(tiles, gx0, gy0, gx, gy) {
    try {
      const T = window.CFG.T;
      const lx = gx - gx0, ly = gy - gy0;
      if (lx < 0 || ly < 0 || lx > 15 || ly > 15) return false;
      const idx = ly * CHUNK + lx;
      const cur = tiles[idx];
      if (cur === T.WATER || cur === T.DEEPWATER) { tiles[idx] = T.BRIDGE; return true; }
      if (cur === T.LAVA) { tiles[idx] = T.PATH; return true; }
      if (cur === T.TREE || cur === T.PINE || cur === T.SAKURA) { tiles[idx] = T.PATH; return true; }
      if (cur === T.LANTERN) { tiles[idx] = T.PATH; return true; }
      if (cur === T.HOUSEWALL || cur === T.STONEWALL || cur === T.WINDOW || cur === T.ROOF) {
        try { if (window.Buildings && window.Buildings.buildingsAt && window.Buildings.buildingsAt(gx, gy)) return false; } catch (e) { }
        tiles[idx] = T.PATH;
        return true;
      }
    } catch (e) { }
    return false;
  }
  // Pocket repair for fresh chunks: after the front step itself is fixed,
  // the step still needs one walkable approach from the outside (not back
  // through its own door). If every outer side is solid, carve the side
  // most toward the hearth center when it is soft ground (grove / water /
  // lava). Walls are never carved here. (Fresh-bake only — old chunks are
  // left alone; missing walls show as broken fences instead.)
  function repairDoorWithApproach(tiles, gx0, gy0, s, b, dd) {
    try {
      let fx = dd.x, fy = dd.y;
      if (dd.y === b.y1) fy = dd.y + 1;
      else if (dd.y === b.y0) fy = dd.y - 1;
      else if (dd.x === b.x1) fx = dd.x + 1;
      else fx = dd.x - 1;
      if (fx < gx0 || fx >= gx0 + CHUNK || fy < gy0 || fy >= gy0 + CHUNK) return;
      fixDoorFrontTile(tiles, gx0, gy0, fx, fy);
      const SOLID = window.CFG.SOLID, T = window.CFG.T;
      const fIdx = (fy - gy0) * CHUNK + (fx - gx0);
      if (SOLID.has(tiles[fIdx])) return;
      const inB = (gx, gy) => {
        try { if (window.Buildings && window.Buildings.buildingsAt && window.Buildings.buildingsAt(gx, gy)) return true; } catch (e) { }
        return false;
      };
      const neigh = [[fx + 1, fy], [fx - 1, fy], [fx, fy + 1], [fx, fy - 1]];
      for (const nn of neigh) {
        const nx = nn[0], ny = nn[1];
        if (nx === dd.x && ny === dd.y) continue;
        if (nx < gx0 || nx >= gx0 + CHUNK || ny < gy0 || ny >= gy0 + CHUNK) return;
        if (inB(nx, ny)) continue;
        if (!SOLID.has(tiles[(ny - gy0) * CHUNK + (nx - gx0)])) return;
      }
      let best = null, bd = 1e9;
      for (const nn of neigh) {
        const nx = nn[0], ny = nn[1];
        if (nx === dd.x && ny === dd.y) continue;
        if (nx < gx0 || nx >= gx0 + CHUNK || ny < gy0 || ny >= gy0 + CHUNK) continue;
        if (inB(nx, ny)) continue;
        const nt = tiles[(ny - gy0) * CHUNK + (nx - gx0)];
        if (nt !== T.TREE && nt !== T.PINE && nt !== T.SAKURA && nt !== T.WATER && nt !== T.DEEPWATER && nt !== T.LAVA) continue;
        const dc = Math.hypot(nx - s.cx, ny - s.cy);
        if (dc < bd) { bd = dc; best = { nx, ny, nt }; }
      }
      if (best) {
        tiles[(best.ny - gy0) * CHUNK + (best.nx - gx0)] =
          (best.nt === T.WATER || best.nt === T.DEEPWATER) ? T.BRIDGE : T.PATH;
      }
    } catch (e) { }
  }
  // Legacy-heal for STORED chunks (old-baked, pre-door-guarantee): every
  // door front inside this chunk's tiles must be walkable. Same mapping as
  // the fresh path (water->BRIDGE, lava->PATH, grove->PATH, stray
  // walls->PATH) — except a wall that still belongs to a building shape
  // (legacy 0-gap neighbour) becomes RUBBLE instead: walkable like any
  // breach, picks up the broken-fence overlay on its own, and can never
  // collapse the neighbour (collapse needs every wall gone). Players can't
  // build walls, so a solid door front is never their work. Returns true
  // when any tile changed. Approach carving is reused from the fresh path.
  function backfillDoorFronts(tiles, gx0, gy0) {
    try {
      const T = window.CFG.T, SOLID = window.CFG.SOLID;
      let buildings = [];
      try { buildings = window.Buildings.buildingsInView(gx0 - 2, gx0 + CHUNK + 1, gy0 - 2, gy0 + CHUNK + 1) || []; } catch (e) { return false; }
      let changed = false;
      for (const b of buildings) {
        if (!b || window.Buildings.buildingCollapsed(b)) continue;
        for (const dd of (b.doors || [])) {
          let fx = dd.x, fy = dd.y;
          if (dd.y === b.y1) fy = dd.y + 1;
          else if (dd.y === b.y0) fy = dd.y - 1;
          else if (dd.x === b.x1) fx = dd.x + 1;
          else fx = dd.x - 1;
          if (fx < gx0 || fx >= gx0 + CHUNK || fy < gy0 || fy >= gy0 + CHUNK) continue;
          const idx = (fy - gy0) * CHUNK + (fx - gx0);
          const cur = tiles[idx];
          if (cur == null || !SOLID.has(cur)) continue;
          if (cur === T.WATER || cur === T.DEEPWATER) tiles[idx] = T.BRIDGE;
          else if (cur === T.LAVA) tiles[idx] = T.PATH;
          else if (cur === T.TREE || cur === T.PINE || cur === T.SAKURA) tiles[idx] = T.PATH;
          else if (cur === T.LANTERN) tiles[idx] = T.PATH;
          else if (cur === T.HOUSEWALL || cur === T.STONEWALL || cur === T.WINDOW || cur === T.ROOF) {
            let inB = false;
            try { if (window.Buildings && window.Buildings.buildingsAt && window.Buildings.buildingsAt(fx, fy)) inB = true; } catch (e) { }
            tiles[idx] = inB ? T.RUBBLE : T.PATH;
          }
          else continue; // DWALL/CRYSTAL/BLOOD/... — leave alone
          changed = true;
          try { repairDoorWithApproach(tiles, gx0, gy0, (b.settlement || { cx: b.x0, cy: b.y0, radius: 20, type: "town" }), b, dd); } catch (e) { }
        }
      }
      return changed;
    } catch (e) {
      // Once per session: a silent no is worse than a noisy one (a missed
      // solid door front strands the player at their own door).
      try {
        if (!backfillDoorFronts._warned) {
          backfillDoorFronts._warned = true;
          console.warn("[world] backfillDoorFronts failed:", (e && e.message) || e);
        }
      } catch (e2) { }
      return false;
    }
  }
  function buildingTileAt(gx, gy, s) {
    try {
      if (!window.Buildings) return null;
      // placement re-entrancy: settlementBuildings for this key is on the
      // stack (its door-approach check calls settleTile). Skip buildings so
      // the check sees base ground (trees/water/roads) instead of recursing.
      try {
        const bip = window.Buildings._buildingInProgress;
        if (bip && bip.has(s.type + ":" + s.cx + "," + s.cy)) return null;
      } catch (e) { }
      const list = window.Buildings.settlementBuildings(s);
      for (const b of list) {
        if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1) {
          const t = window.Buildings.buildingTile(b, gx, gy);
          if (t != null) return t;
        }
      }
    } catch (e) { }
    return null;
  }
  function settleTile(gx, gy, s) {
    const T = window.CFG.T;
    const dx = gx - s.cx, dy = gy - s.cy;
    const d = Math.hypot(dx, dy);
    const R = s.radius;
   const hh = hash2(gx, gy);
   const adx = Math.abs(dx), ady = Math.abs(dy);
    // v16 hell holds: alien ground (ash/bone/flesh), obsidian rings, alien builds.
    if (s.type === "demon_village" || s.type === "demon_town" || s.type === "demon_city" || s.type === "hell_castle") {
      if (d > R) return null;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) {}
      // hell castle delegates to the castle baker (lava moat + double ring).
      if (s.type === "hell_castle") {
        try { if (window.Hell && window.Hell.castleTile) { const ct = window.Hell.castleTile(gx, gy); if (ct != null) return ct; } } catch (e) {}
      }
      // demon city: obsidian ring + lava moat, alien courts inside.
      if (s.type === "demon_city") {
        if (d > R - 1) {
          if (adx <= 2 || ady <= 2) return T.PATH;
          return T.LAVA;
        }
        if (d >= R - 3) {
          if (adx <= 2 || ady <= 2) return T.PATH;
          return T.STONEWALL;
        }
      } else if (s.type === "demon_town") {
        if (d >= R - 1) {
          if (adx <= 1 || ady <= 1) return T.PATH;
          return T.STONEWALL;
        }
      }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 3) return T.BONE;
      if (hh > 0.93) return T.CRYSTAL;
      if (hh > 0.88) return T.FLESH;
      if (hh > 0.82) return T.BONE;
      if (hh > 0.76) return T.BLOOD;
      return T.ASH;
    }
    if (s.type === "village") {
      if (d > R) return null;
      // typed buildings (cottages / farmhouse / chapel / smithy)
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (d < 2.5) return T.TOWNSTONE;
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (hh > 0.90) return T.FLOWER;
      if (hh > 0.82) return T.TALLGRASS;
      if (hh > 0.88) return T.TREE;
      return T.GRASS;
    }
    if (s.type === "town") {
      if (d > R) return null;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 7) return T.TOWNSTONE;
      if (hh > 0.88) return T.TREE;
      if (hh > 0.80) return T.FLOWER;
      return (Math.abs(gx) % 6 < 2 || Math.abs(gy) % 6 < 2) ? T.PATH : T.GRASS;
    }
   if (s.type === "city") {
     if (d > R) return null;
      // wall ring first: axis + diagonal gates (8 entries). Interior avenues
      // stay axis-only so no diagonal streets carve the blocks.
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.HOUSEWALL;
      }
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH; // interior avenues
      if (d < 9) {
        if (hh > 0.93) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.94) return T.LANTERN;
      if (hh > 0.90) return T.FLOWER;
      return T.TOWNSTONE;
    }
   if (s.type === "watergate") {
      // canal-city: moat + wall ring (8 gates each), two canals with a center
      // cross plus secondary plank bridges so every quarter links directly.
      if (d > R + 2) return null;
      if (d > R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH; // moat gates
        return T.WATER; // moat
      }
      if (d >= R - 3) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH; // wall gates
        return T.HOUSEWALL;
      }
      const inV = isWatergateCanalV(dx, dy, R);
      const inH = isWatergateCanalH(dx, dy, R);
      if ((inV || inH) && isWatergateBridge(dx, dy, adx, ady)) return T.BRIDGE;
      if (inV || inH) return T.WATER;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 3) return T.TOWNSTONE;
      if (hh > 0.93) return T.LANTERN;
      return T.TOWNSTONE;
    }
   if (s.type === "sakura") {
     if (d > R) return null;
      // pond (ellipse at offset) with sand rim + a footbridge across the middle
      const pdx = dx - 9, pdy = dy - 7;
      if (isPondBridge(pdx, pdy)) return T.BRIDGE;
      if ((pdx * pdx) / 9 + (pdy * pdy) / 6 <= 1) return T.WATER;
      if ((pdx * pdx) / 16 + (pdy * pdy) / 11 <= 1) return T.SAND;
      if (dy === 12 && (dx === -2 || dx === 2)) return T.ROOF; // gate posts
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 4) {
        if ((adx === 2 && ady === 2)) return T.LANTERN;
        return T.SAND;
      }
      if (d > 4 && d < 14 && hh > 0.68) return T.SAKURA; // planted rings
      if (hh > 0.90) return T.FLOWER;
      if (hh > 0.93) return T.LANTERN;
      if (hh > 0.80) return T.SAKURA;
      return T.GRASS;
    }
   if (s.type === "fortress") {
     if (d > R) return null;
      // lava moat with stone causeways (8 entries)
      if (d > R - 2) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.LAVA;
      }
      // stone walls with gates (8 entries, lantern posts stay walkable)
      if (d >= R - 4) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        if (hh > 0.90) return T.LANTERN;
        return T.STONEWALL;
      }
      // typed buildings (great hall at center + barracks/forge/chapel/...)
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (hh > 0.93) return T.LANTERN;
      return T.TOWNSTONE;
    }
   if (s.type === "desert_souk") {
     if (d > R) return null;
      const odx = dx + 7, ody = dy + 5;
      if (ody === 0 && odx >= -3 && odx <= 3) return T.BRIDGE;
      if ((odx * odx) / 9 + (ody * ody) / 6 <= 1) return T.WATER;
      if ((odx * odx) / 16 + (ody * ody) / 11 <= 1) return T.SAND;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 4) {
        if (hh > 0.90) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.92) return T.TREE;
      if (hh > 0.86) return T.FLOWER;
      if (hh > 0.80) return T.TALLGRASS;
      return T.SAND;
    }
   if (s.type === "steppe_ger") {
     if (d > R) return null;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (d < 2.5) return T.TOWNSTONE;
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (hh > 0.90) return T.FLOWER;
      if (hh > 0.78) return T.TALLGRASS;
      if (hh > 0.94) return T.TREE;
      return T.GRASS;
    }
   if (s.type === "mesa_pueblo") {
     if (d > R) return null;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 6) return T.TOWNSTONE;
      if (hh > 0.90) return T.TREE;
      if (hh > 0.84) return T.FLOWER;
      return T.SAND;
    }
   if (s.type === "frost_hold") {
     if (d > R) return null;
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.HOUSEWALL;
      }
      const pdx = dx + 7, pdy = dy + 5;
      if (isPondBridge(pdx, pdy)) return T.BRIDGE;
      if ((pdx * pdx) / 9 + (pdy * pdy) / 6 <= 1) return T.ICE;
      if ((pdx * pdx) / 16 + (pdy * pdy) / 11 <= 1) return T.TOWNSTONE;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 4) {
        if (hh > 0.90) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.88) return T.PINE;
      if (hh > 0.82) return T.TALLGRASS;
      if (hh > 0.94) return T.LANTERN;
      return T.GRASS;
    }
   if (s.type === "trade_city") {
     if (d > R) return null;
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.HOUSEWALL;
      }
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 10) {
        if (hh > 0.93) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.94) return T.LANTERN;
      if (hh > 0.90) return T.FLOWER;
      return T.TOWNSTONE;
    }
   if (s.type === "port_city") {
     if (d > R) return null;
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.HOUSEWALL;
      }
      const hdx = dx, hdy = dy - (R - R * 0.19 - 4);
      if ((hdx * hdx) / (R * 0.38 * (R * 0.38)) + (hdy * hdy) / (R * 0.19 * (R * 0.19)) <= 1) {
        if ((((dx % 14) + 14) % 14) <= 1 || adx <= 1 || ady <= 1) return T.BRIDGE;
        return T.WATER;
      }
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 3) return T.TOWNSTONE;
      if (hh > 0.93) return T.LANTERN;
      return T.TOWNSTONE;
    }
    if (s.type === "pantheon") {
      if (d > R) return null;
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.STONEWALL;
      }
      const cit2 = R * 0.4;
      if (d >= cit2 - 1 && d <= cit2 + 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        if (hh > 0.90) return T.LANTERN;
        return T.STONEWALL;
      }
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 6) {
        if (hh > 0.93) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.94) return T.LANTERN;
      if (hh > 0.90) return T.FLOWER;
      return T.CLOUD;
    }
    if (s.type === "pantheon_outpost" || s.type === "angel_village") {
      if (d > R) return null;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (d < 2.5) return T.TOWNSTONE;
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (hh > 0.90) return T.FLOWER;
      if (hh > 0.82) return T.TALLGRASS;
      return T.CLOUD;
    }
    if (s.type === "angel_town") {
      if (d > R) return null;
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 7) return T.TOWNSTONE;
      if (hh > 0.88) return T.SAKURA;
      if (hh > 0.80) return T.FLOWER;
      return T.CLOUD;
    }
    if (s.type === "angel_city") {
      if (d > R) return null;
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.HOUSEWALL;
      }
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 9) {
        if (hh > 0.93) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.94) return T.LANTERN;
      if (hh > 0.90) return T.FLOWER;
      return T.CLOUD;
    }
   if (s.type === "capital") {
     if (d > R) return null;
      if (d >= R - 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        return T.STONEWALL;
      }
      const cit = R * 0.38;
      if (d >= cit - 1 && d <= cit + 1) {
        if (adx <= 1 || ady <= 1 || isDiagGate(adx, ady)) return T.PATH;
        if (hh > 0.90) return T.LANTERN;
        return T.STONEWALL;
      }
      try {
        const bt = buildingTileAt(gx, gy, s);
        if (bt != null) return bt;
      } catch (e) { }
      if (adx <= 1 || ady <= 1) return T.PATH;
      if (d < 5) {
        if (hh > 0.93) return T.LANTERN;
        return T.TOWNSTONE;
      }
      if (hh > 0.94) return T.LANTERN;
      if (hh > 0.90) return T.FLOWER;
      return T.TOWNSTONE;
    }
    return null;
  }

  // Walkable (non-solid) tiles in a chunk, for NPC spawn placement.
  function findWalkableSpots(ch, n) {
    const spots = [];
    try {
      const SOLID = window.CFG.SOLID;
      for (let ly = 1; ly < CHUNK - 1; ly++) for (let lx = 1; lx < CHUNK - 1; lx++) {
        if (!SOLID.has(ch.tiles[ly * CHUNK + lx])) spots.push({ lx, ly });
      }
    } catch (e) { }
    if (!spots.length) return [{ lx: 8, ly: 8 }];
    const out = [];
    const start = (hash2(ch.cx * 31 + 3, ch.cy * 47 + 5) * spots.length) | 0;
    const step = Math.max(1, (spots.length / Math.max(1, n)) | 0);
    for (let i = 0; i < n; i++) out.push(spots[(start + i * step) % spots.length]);
    return out;
  }

  // Deterministic base chunk gen — always playable instantly.
  function genBaseChunk(cx, cy) {
    const tiles = new Array(CHUNK * CHUNK);
    const gx0 = cx * CHUNK, gy0 = cy * CHUNK;
    const ccx = gx0 + 8, ccy = gy0 + 8;
    const centerBiome = biomeAt(ccx, ccy);
    const dCenter = distOrigin(ccx, ccy);
    // v18 void: out-of-hell ground in the hell dimension bakes as solid
    // stone — no walking past the edge of the world. No POIs, no NPCs.
    if (centerBiome === "heaven_void") {
      const VT = window.CFG.T.STONEWALL;
      for (let i = 0; i < CHUNK * CHUNK; i++) tiles[i] = VT;
      return { cx, cy, biome: centerBiome, placeName: null, lore: "", tiles, pois: [], npcSlots: 0, enriched: false, hasDungeon: false, settlementType: null, scx: null, scy: null, spawn: false, base: null, dim: getDim(), v: window.CFG.SAVE_VERSION };
    }
    if (centerBiome === "hell_void") {
      const VT = window.CFG.T.STONEWALL;
      for (let i = 0; i < CHUNK * CHUNK; i++) tiles[i] = VT;
      return { cx, cy, biome: centerBiome, placeName: null, lore: "", tiles, pois: [], npcSlots: 0, enriched: false, hasDungeon: false, settlementType: null, scx: null, scy: null, spawn: false, base: null, dim: getDim(), v: window.CFG.SAVE_VERSION };
    }
    // candidate settlement centers near this chunk (computed once per chunk)
    const cand = [];
    {
      const brx = Math.floor(cx / RS), bry = Math.floor(cy / RS);
      for (let ax = brx - 1; ax <= brx + 1; ax++) for (let ay = bry - 1; ay <= bry + 1; ay++) {
        const s = regionSettlement(ax, ay);
        if (s) cand.push(s);
      }
    }
    // candidate enemy-base centers near this chunk (same pattern, RB grid)
    const candB = [];
    {
      const brbx = Math.floor(cx / RB), brby = Math.floor(cy / RB);
      for (let ax = brbx - 1; ax <= brbx + 1; ax++) for (let ay = brby - 1; ay <= brby + 1; ay++) {
        const b = regionBase(ax, ay);
        if (b) candB.push(b);
      }
    }
   function settleFor(gx, gy) {
     let best = null, bestD = 1e9;
      // origin hearth is surface-only; hell castle is hell-only; pantheon heaven-only.
      const gdim = getDim();
      if (gdim !== "hell" && gdim !== "heaven") {
        try {
          const o = spawnSettlement();
          const od = Math.hypot(gx - o.cx, gy - o.cy);
          if (od <= o.radius + (o.type === "watergate" ? 2 : 0)) { best = o; bestD = od; }
        } catch (e) { }
      }
      if (gdim === "heaven") {
        try {
          if (window.Heaven && window.Heaven.CENTER) {
            const hx = window.Heaven.CENTER.x, hy = window.Heaven.CENTER.y;
            const hr = (window.Heaven.PANTHEON_RADIUS || 60);
            const hd = Math.hypot(gx - hx, gy - hy);
            if (hd <= hr && hd < bestD) { best = { cx: hx, cy: hy, radius: hr, type: "pantheon" }; bestD = hd; }
          }
        } catch (e) {}
      }
      if (gdim === "hell") {
        try {
          if (window.Hell && window.Hell.CENTER) {
            const hx = window.Hell.CENTER.x, hy = window.Hell.CENTER.y;
            const hr = (window.Hell.CASTLE_RADIUS || 60);
            const hd = Math.hypot(gx - hx, gy - hy);
            if (hd <= hr && hd < bestD) { best = { cx: hx, cy: hy, radius: hr, type: "hell_castle" }; bestD = hd; }
          }
        } catch (e) {}
      }
      for (const s of cand) {
        const d = Math.hypot(gx - s.cx, gy - s.cy);
        const reach = s.radius + (s.type === "watergate" ? 2 : 0);
        if (d <= reach && d < bestD) { best = s; bestD = d; }
      }
      return best;
    }
    function baseFor(gx, gy) {
      if (distOrigin(gx, gy) < 100) return null;
      let best = null, bestD = 1e9;
      for (const b of candB) {
        const d = Math.hypot(gx - b.cx, gy - b.cy);
        const reach = baseReach(b);
        if (d <= reach && d < bestD) { best = b; bestD = d; }
      }
      return best;
    }
    const sc = settleFor(ccx, ccy); // settlement owning the chunk center (if any)
    // The origin hearth is a normal settlement here (settleFor already
    // includes it), so sc covers spawn chunks with no special-casing.
    const scEff = sc;
    const settleType = scEff ? scEff.type : null;
    // town layout: roads cross at origin extended through town chunks
    const isTown = centerBiome === "town";
    // dungeon entrance? Hell delves only on hell ground in the hell dim;
    // the surface disc (old hell site) keeps no mouths (open ocean).
    const h = hash2(cx * 3 + 11, cy * 7 + 5);
    let hasDungeon = dCenter > 40 && h > 0.955;
    // v19 parallel universes: the surface bakes delves everywhere; the hell
    // side only on hell ground (void keeps no mouths).
    try {
      const cdim2 = getDim();
      if (cdim2 === "hell" && !isHellBaseGround(ccx, ccy)) hasDungeon = false;
      if (cdim2 === "heaven") hasDungeon = false;
    } catch (e) {}
    // inter-hearth road segments crossing this chunk (canonical links, so
    // every chunk agrees on them). Built once per chunk, tested per tile.
    const roadSegs = [];
    {
      const seenPair = new Set();
      const rxc = Math.floor(cx / RS), ryc = Math.floor(cy / RS);
      for (let ax = rxc - 3; ax <= rxc + 3; ax++) for (let ay = ryc - 3; ay <= ryc + 3; ay++) {
        let links = null;
        try { links = settleLinks(ax, ay); } catch (e) { links = null; }
        if (!links) continue;
        for (const pr of links) {
          const a = pr[0], b = pr[1];
          const ka = a.cx + "," + a.cy, kb = b.spawn ? "spawn" : b.cx + "," + b.cy;
          const key = ka < kb ? ka + "|" + kb : kb + "|" + ka;
          if (seenPair.has(key)) continue;
          seenPair.add(key);
          roadSegs.push([a.cx, a.cy, b.cx, b.cy]);
        }
      }
    }
    function nearRoad(gx, gy) {
      for (const sg of roadSegs) {
        if (segDist2(gx, gy, sg[0], sg[1], sg[2], sg[3]) < 1.0) return true;
      }
      return false;
    }
   for (let ly = 0; ly < CHUNK; ly++) for (let lx = 0; lx < CHUNK; lx++) {
     const gx = gx0 + lx, gy = gy0 + ly;
     const d = distOrigin(gx, gy);
     let t;
      // v16 hell towers + castle pave over everything (surface + hell).
      try {
        if (window.Hell) {
          if (window.Hell.towerTile) { const tt = window.Hell.towerTile(gx, gy); if (tt != null) { t = tt; } }
          if (t == null && window.Hell.castleTile) { const ct = window.Hell.castleTile(gx, gy); if (ct != null) { t = ct; } }
        }
      } catch (e) {}
      // Single ownership rule: origin, settlement, holding, else wilds.
      const sHere = (t != null) ? null : settleFor(gx, gy);
      const st = sHere ? settleTile(gx, gy, sHere) : null;
      if (st != null) {
        t = st;
      } else if (!sHere && d >= 100) {
        // enemy holdings pave over the wilds (never near spawn or towns)
        const bHere = baseFor(gx, gy);
        if (bHere) {
          const btd = baseTile(gx, gy, bHere);
          if (btd != null) t = btd;
        }
      }
      if (t === undefined || t === null) {
        // neither settlement nor holding claimed it — wilderness below
        {
        const f = fbm(gx * 0.06, gy * 0.06);
        const w = fbm(gx * 0.035 + 100, gy * 0.035 + 50);
        const hh = hash2(gx * 5 + 1, gy * 5 + 9);
        // v16 hell wilds: alien ground by hell biome. v26: blood runs
        // rarer and lava runs thinner, while the alien set — fungal
        // shroom-forests, gloom violet wastes, verdant teal flats —
        // carries shroom-cap and crystal-spire trees.
        try {
          const cb = centerBiome;
          if (typeof cb === "string" && cb.indexOf("hell_") === 0) {
            if (cb === "hell_blood") {
              if (w > 0.78) t = T.BLOOD;
              else if (hh > 0.90) t = T.FLESH;
              else if (hh > 0.80) t = T.BONE;
              else t = T.ASH;
            } else if (cb === "hell_obsidian") {
              if (w > 0.78) t = T.LAVA;
              else if (hh > 0.95) t = T.CRYSTAL;
              else if (hh > 0.93) t = T.SPIRE;
              else if (hh > 0.85) t = T.BONE;
              else t = T.ASH;
            } else if (cb === "hell_bone") {
              if (hh > 0.88) t = T.BONE;
              else if (hh > 0.80) t = T.SHROOM;
              else if (hh > 0.74) t = T.SPIRE;
              else if (w > 0.78) t = T.BLOOD;
              else t = T.MOSS;
            } else if (cb === "hell_flesh") {
              if (hh > 0.90) t = T.FLESH;
              else if (hh > 0.82) t = T.SHROOM;
              else if (hh > 0.76) t = T.BLOOD;
              else t = T.MOSS;
            } else if (cb === "hell_fungal") {
              // violet mushroom forest: shroom-caps over spore moss,
              // spore-crystals and amber wax pockets
              if (hh > 0.97) t = T.SPIRE;
              else if (f > 0.55) t = T.SHROOM;
              else if (hh > 0.82) t = T.CRYSTAL;
              else if (hh > 0.74) t = T.WAX;
              else t = T.MOSS;
            } else if (cb === "hell_gloom") {
              // deep violet wastes: glass spires and bone over ash —
              // no red, no fire, only the gloom
              if (hh > 0.93) t = T.CRYSTAL;
              else if (f > 0.55) t = T.SPIRE;
              else if (hh > 0.85) t = T.BONE;
              else t = T.ASH;
            } else if (cb === "hell_verdant") {
              // alien teal flats: spire groves and shroom tufts on moss
              if (f > 0.60) t = T.SPIRE;
              else if (hh > 0.88) t = T.SHROOM;
              else if (hh > 0.80) t = T.WAX;
              else t = T.MOSS;
            } else { // hell_ash default
              if (w > 0.80) t = T.LAVA;
              else if (hh > 0.95) t = T.CRYSTAL;
              else if (hh > 0.90) t = T.SHROOM;
              else if (hh > 0.85) t = T.BONE;
              else if (hh > 0.78) t = T.FLESH;
              else t = T.ASH;
            }
            if (t === T.BLOOD || t === T.CRYSTAL || t === T.LAVA) {
              // hazard lakes stay solid; paths never pave them here
            } else if (t !== T.WATER && t !== T.DEEPWATER) {
              const pp = fbm(gx * 0.02 + 500, gy * 0.02);
              if (Math.abs(pp - 0.5) < 0.008) t = T.PATH;
            }
          }
        } catch (e) {}
        try {
          const cb2 = centerBiome;
          if (typeof cb2 === "string" && cb2.indexOf("heaven_") === 0) {
            if (cb2 === "heaven_lake") {
              // reservoir: open water with sandy shallows on a cloud shelf
              if (w > 0.55) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
              else if (hh > 0.90) t = T.SAND;
              else t = T.CLOUD;
            } else if (cb2 === "heaven_grove") {
              // grove: orchard canopy rooted in cloud (oak + pink sakura over blooms)
              if (f > 0.55) t = hh > 0.4 ? T.TREE : T.SAKURA;
              else if (hh > 0.90) t = T.FLOWER;
              else if (hh > 0.82) t = T.TALLGRASS;
              else t = T.CLOUD;
            } else if (cb2 === "heaven_meadow") {
              // meadow: blooms + tall grass drifting on cloud, pink trees
              if (hh > 0.93) t = T.FLOWER;
              else if (hh > 0.85) t = T.TALLGRASS;
              else if (f > 0.62) t = hh > 0.5 ? T.TREE : T.SAKURA;
              else t = T.CLOUD;
            } else if (cb2 === "heaven_bloom") {
              // bloom meadows: blossom fields under sakura crowns
              if (hh > 0.90) t = T.SAKURA;
              else if (f > 0.55) t = T.FLOWER;
              else if (hh > 0.80) t = T.TREE;
              else if (hh > 0.70) t = T.TALLGRASS;
              else t = T.CLOUD;
            } else if (cb2 === "heaven_mist") {
              // low mists: thin wisp hollows, white blooms in the drift
              if (hh > 0.94) t = T.FLOWER;
              else if (hh > 0.86) t = T.TALLGRASS;
              else t = T.CLOUD;
            } else if (cb2 === "heaven_pasture") {
              // golden pastures: grain-grass and sandy clearings to graze
              if (hh > 0.93) t = T.SAND;
              else if (f > 0.55) t = T.TALLGRASS;
              else if (hh > 0.85) t = T.FLOWER;
              else t = T.CLOUD;
            } else {
              // heaven_cloud: walkable dawn-cloud, thin blooms/mist
              if (hh > 0.94) t = T.FLOWER;
              else if (hh > 0.86) t = T.TALLGRASS;
              else t = T.CLOUD;
            }
            // v26 floating islands: deterministic islets on a 32-tile grid,
            // shared across chunk borders — a rubble shore ring, grass
            // heart, blossom trees. Only over open cloud-field tiles, so
            // settlements, lakes and groves are never paved over.
            try {
              if (t === T.CLOUD || t === T.TALLGRASS || t === T.FLOWER || t === T.GRASS) {
                const icx = Math.floor(gx / 32), icy = Math.floor(gy / 32);
                if (hash2(icx * 57 + 3, icy * 91 + 7) > 0.45) {
                  const iox = 6 + ((hash2(icx * 31 + 1, icy * 17 + 5) * 20) | 0);
                  const ioy = 6 + ((hash2(icx * 13 + 9, icy * 29 + 2) * 20) | 0);
                  const ir = 3 + ((hash2(icx * 7 + 11, icy * 3 + 13) * 3) | 0);
                  const ddx = gx - icx * 32 - iox, ddy = gy - icy * 32 - ioy;
                  const dd = Math.sqrt(ddx * ddx + ddy * ddy);
                  if (dd < ir) {
                    if (dd < ir - 1.6) {
                      if (dd < 1.2) {
                        const kh = hash2(gx * 5 + 2, gy * 5 + 6);
                        t = kh > 0.6 ? T.TREE : kh > 0.3 ? T.SAKURA : T.FLOWER;
                      } else t = T.GRASS;
                    } else t = T.RUBBLE;
                  }
                }
              }
            } catch (e3) {}
          }
        } catch (e2) {}
        if (t === undefined || t === null) {
        if (centerBiome === "desert") {
          // sun-blasted dunes with rare oasis pools and hardy palms
          if (w > 0.72) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
          else if (hh > 0.95) t = T.TREE;
          else if (hh > 0.88) t = T.TALLGRASS;
          else t = T.SAND;
        } else if (centerBiome === "mountain") {
          // high crags: pines, rock slabs, rare alpine tarns
          if (w > 0.74) t = T.WATER;
          else if (f > 0.64) t = T.PINE;
          else if (f > 0.52) t = T.TOWNSTONE;
          else if (hh > 0.94) t = T.FLOWER;
          else t = T.GRASS;
        } else if (centerBiome === "frostcrown") {
          // glacier crown: ice sheets, snow pines, frost-spires, bare rock
          if (w > 0.70) t = T.ICE;
          else if (hh > 0.985) t = T.CRYSTAL;
          else if (f > 0.60) t = T.PINE;
          else if (f > 0.50) t = T.TOWNSTONE;
          else if (hh > 0.93) t = T.FLOWER;
          else t = T.GRASS;
        } else if (centerBiome === "blightmire") {
          // poison bog: black pools, bone-white dead, moss underfoot
          if (w > 0.66) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
          else if (hh > 0.92) t = T.BONE;
          else if (f > 0.55) t = T.TALLGRASS;
          else t = T.MOSS;
        } else if (centerBiome === "stormcrag") {
          // tempest cliffs: storm spires, rock slabs, rare sky-tarns
          if (w > 0.74) t = T.WATER;
          else if (hh > 0.965) t = T.CRYSTAL;
          else if (f > 0.55) t = T.TOWNSTONE;
          else if (hh > 0.90) t = T.FLOWER;
          else t = T.GRASS;
        } else if (centerBiome === "crystal_scar") {
          // prismatic scar: singing crystal clusters over ash and sand
          if (hh > 0.955) t = T.CRYSTAL;
          else if (f > 0.55) t = T.TOWNSTONE;
          else if (w > 0.70) t = T.WATER;
          else t = T.SAND;
        } else if (centerBiome === "umbral_waste") {
          // void-touched waste: ash, bone fields, void shards
          if (hh > 0.95) t = T.CRYSTAL;
          else if (f > 0.62) t = T.BONE;
          else if (f > 0.50) t = T.ASH;
          else if (hh > 0.90) t = T.TALLGRASS;
          else t = T.ASH;
        } else if (centerBiome === "volcano") {
          // ashfields with lava seeps and ember vents (torches)
          const lv = fbm(gx * 0.05 + 800, gy * 0.05 + 200);
          if (lv > 0.66) t = T.LAVA;
          else if (hh > 0.96) t = T.TORCH;
          else if (f > 0.55) t = T.TOWNSTONE;
          else t = T.SAND;
        } else if (centerBiome === "sea") {
          // open water with sandy islets and palms
          if (f > 0.70) t = T.SAND;
          else if (f > 0.66) t = T.TREE;
          else t = w > 0.45 ? T.DEEPWATER : T.WATER;
        } else if (centerBiome === "ocean") {
          // deep water, rarer and barer islets
          if (f > 0.76) t = T.SAND;
          else if (f > 0.73) t = T.TREE;
          else t = w > 0.35 ? T.DEEPWATER : T.WATER;
        } else if (centerBiome === "tundra") {
          // frozen wastes: ice sheets, snow pines, bare rock
          if (w > 0.72) t = T.ICE;
          else if (f > 0.62) t = T.PINE;
          else if (f > 0.52) t = T.TOWNSTONE;
          else if (hh > 0.92) t = T.FLOWER;
          else t = T.GRASS;
        } else if (centerBiome === "dark_forest") {
          // lightless woods: moss underfoot, wall-to-wall canopy (chop through)
          if (f > 0.35) t = hh > 0.45 ? T.TREE : T.PINE;
          else if (hh > 0.90) t = T.TALLGRASS;
          else t = T.MOSS;
        }
        else if (w > 0.70) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
        else if (w > 0.64) t = (hh > 0.6) ? T.SAND : T.WATER;
        else if (centerBiome === "forest" || centerBiome === "wild") {
          if (f > 0.62) t = hh > 0.4 ? T.TREE : T.PINE;
          else if (f > 0.55) t = T.TALLGRASS;
          else t = hh > 0.9 ? T.FLOWER : T.GRASS;
        } else {
          if (f > 0.66) t = T.TREE;
          else if (f > 0.60) t = T.PINE;
          else if (hh > 0.93) t = T.FLOWER;
          else if (hh > 0.88) t = T.TALLGRASS;
          else t = T.GRASS;
        }
        // dirt paths wandering
        const p = fbm(gx * 0.02 + 500, gy * 0.02);
        if (t !== T.WATER && t !== T.DEEPWATER && Math.abs(p - 0.5) < 0.008) t = T.PATH;
        // hearth roads: straight ways between neighbouring hearths — following
        // one likely leads somewhere lived-in. Only soft ground is paved.
        if ((t === T.GRASS || t === T.TALLGRASS || t === T.FLOWER || t === T.SAND || t === T.TREE || t === T.PINE) && nearRoad(gx, gy)) t = T.PATH;
        }
        }
      } // end wilderness (t == null)
     tiles[ly * CHUNK + lx] = t;
   }
    // reachability repair (fresh chunks): every building door front inside
    // this chunk must be walkable. Water->BRIDGE (planks), lava->PATH
    // (stone), ring wall->PATH (gate). Building walls are left alone
    // (neighbours can still be smashed through; placements keep every
    // door front clear of other shapes, so this only ever sees base).
    try {
      const repairSets = [];
      if (scEff) repairSets.push(scEff);
      else {
        for (const s of (cand || [])) {
          if (s.cx >= gx0 - 32 && s.cx < gx0 + 32 && s.cy >= gy0 - 32 && s.cy < gy0 + 32) repairSets.push(s);
        }
        try {
          // surf-only: hell's 0,0 is void, heaven's 0,0 is the pantheon.
          if (getDim() === "surf" && gx0 < 32 && gx0 > -32 && gy0 < 32 && gy0 > -32) repairSets.push(spawnSettlement());
        } catch (e) { }
      }
      // Boundary chunks: also cover settlements that own the chunk center
      // of nowhere here but spill buildings into it (their doors got no
      // repair above, so a tree/water front would bake sealed). Ground
      // truth = the buildings actually in range, not the center's owner.
      try {
        const bv = window.Buildings && window.Buildings.buildingsInView ? window.Buildings.buildingsInView(gx0 - 2, gx0 + CHUNK + 1, gy0 - 2, gy0 + CHUNK + 1) : [];
        const seenB = new Set(repairSets.map(s => s.cx + "," + s.cy));
        for (const b of (bv || [])) {
          const s = b && b.settlement;
          if (!s || s.cx == null || s.radius == null || !s.type) continue;
          const k = s.cx + "," + s.cy;
          if (seenB.has(k)) continue;
          seenB.add(k);
          repairSets.push({ cx: s.cx, cy: s.cy, radius: s.radius, type: s.type });
        }
      } catch (e) { }
      const seenR = new Set();
      for (const s of repairSets) {
        const k = s.cx + "," + s.cy + ":" + s.type;
        if (seenR.has(k)) continue;
        seenR.add(k);
        let list = null;
        try { list = window.Buildings ? window.Buildings.settlementBuildings(s) : null; } catch (e) { list = null; }
        if (!list) continue;
        for (const b of list) {
          // cross-settlement guard: skip lodges whose footprint lies in a
          // neighbour's ground (overlap zones stay coherent) — else repair
          // carves paths for doors that bake as the neighbour's ground.
          try {
            if (b && b.settlement) {
              const bcx = Math.round((b.x0 + b.x1) / 2), bcy = Math.round((b.y0 + b.y1) / 2);
              const ow = settleFor(bcx, bcy);
              if (!ow || ow.cx !== s.cx || ow.cy !== s.cy) continue;
            }
          } catch (e) { }
          for (const dd of (b.doors || [])) {
            repairDoorWithApproach(tiles, gx0, gy0, s, b, dd);
          }
        }
      }
      // enemy holdings in this chunk: same door-front repair (axis gates kept).
      try {
        for (const bdef of (candB || [])) {
          if (!(bdef.cx >= gx0 - 32 && bdef.cx < gx0 + 32 && bdef.cy >= gy0 - 32 && bdef.cy < gy0 + 32)) continue;
          let blist = null;
          try { blist = window.Buildings ? window.Buildings.settlementBuildings({ cx: bdef.cx, cy: bdef.cy, radius: bdef.radius, type: bdef.type }) : null; } catch (e) { blist = null; }
          if (!blist) continue;
          for (const b of blist) {
            for (const dd of (b.doors || [])) {
              repairDoorWithApproach(tiles, gx0, gy0, bdef, b, dd);
            }
          }
        }
      } catch (e) { }
    } catch (e) { }
    // safety: settlement center tile must be walkable (sign + wander target)
    if (scEff) {
      const clx = scEff.cx - gx0, cly = scEff.cy - gy0;
      if (clx >= 0 && cly >= 0 && clx < CHUNK && cly < CHUNK) {
        const ti = cly * CHUNK + clx;
        if (window.CFG.SOLID.has(tiles[ti])) tiles[ti] = T.PATH;
      }
    }
    // POIs
    const pois = [];
    if (hasDungeon) {
      // first walkable tile near chunk center (may sit inside a settlement)
      let sx = 8, sy = 8, found = false;
      outer: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
        const lx = 8 + Math.round(Math.cos(a / 20 * 6.283) * r), ly = 8 + Math.round(Math.sin(a / 20 * 6.283) * r);
        if (lx < 1 || ly < 1 || lx > 14 || ly > 14) continue;
        if (!window.CFG.SOLID.has(tiles[ly * CHUNK + lx])) { sx = lx; sy = ly; found = true; break outer; }
      }
      if (found) pois.push({ id: `stairs_${cx}_${cy}`, type: "dungeon", lx: sx, ly: sy, gx: gx0 + sx, gy: gy0 + sy, dungeonId: `d_${cx}_${cy}` });
      else {
        // drowned chunk: no dry land, so the delve opens underwater — a
        // whirlpool mouth on open water (raft/swim up + E to descend).
        // The `_w` id forces the leviathan theme at every level.
        let wx = 8, wy = 8, wfound = false;
        outer2: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
          const lx = 8 + Math.round(Math.cos(a / 20 * 6.283) * r), ly = 8 + Math.round(Math.sin(a / 20 * 6.283) * r);
          if (lx < 1 || ly < 1 || lx > 14 || ly > 14) continue;
          const tt = tiles[ly * CHUNK + lx];
          if (tt === window.CFG.T.WATER || tt === window.CFG.T.DEEPWATER) { wx = lx; wy = ly; wfound = true; break outer2; }
        }
        if (wfound) pois.push({ id: `stairs_${cx}_${cy}`, type: "dungeon", lx: wx, ly: wy, gx: gx0 + wx, gy: gy0 + wy, dungeonId: `d_${cx}_${cy}_w`, water: true });
      }
    }
    // chests: 0-2 by hash, on ANY walkable ground (grass, sand, path,
    // townstone, flowers... — never water/trees/walls). Random tries first,
    // spiral fallback from the chunk center so the chest is always reachable.
    const nChest = (hash2(cx + 999, cy - 999) * 3) | 0;
    try {
      const used = new Set(pois.map(p => p.lx + "," + p.ly));
      for (let i = 0; i < nChest; i++) {
        let lx = -1, ly = -1;
        for (let k = 0; k < 24; k++) {
          const tx = 1 + ((hash2(cx * 13 + i * 7, cy * 17 + k * 131) * 14) | 0);
          const ty = 1 + ((hash2(cx * 19 + k * 137, cy * 23 + i * 11) * 14) | 0);
          if (window.CFG.SOLID.has(tiles[ty * CHUNK + tx])) continue;
          if (used.has(tx + "," + ty)) continue;
          lx = tx; ly = ty; break;
        }
        if (lx < 0) {
          outer: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
            const tx = 8 + Math.round(Math.cos(a / 20 * 6.283) * r), ty = 8 + Math.round(Math.sin(a / 20 * 6.283) * r);
            if (tx < 1 || ty < 1 || tx > 14 || ty > 14) continue;
            if (window.CFG.SOLID.has(tiles[ty * CHUNK + tx])) continue;
            if (used.has(tx + "," + ty)) continue;
            lx = tx; ly = ty; break outer;
          }
        }
        if (lx < 0) continue;
        used.add(lx + "," + ly);
        pois.push({ id: `ch_${cx}_${cy}_${i}`, type: "chest", lx, ly, gx: gx0 + lx, gy: gy0 + ly, opened: false, loot: null });
      }
    } catch (e) { }
    // signs: spawn town keeps one per town chunk; settlements get one at their center
    // v18: the origin sign + placeName + spawn flag are surface-only.
    const pdim = getDim();
    if (pdim === "surf" && dCenter < 20) pois.push({ id: `sign_${cx}_${cy}`, type: "sign", lx: 8, ly: 8, gx: gx0 + 8, gy: gy0 + 8, text: spawnName() });
    else if (scEff && scEff.cx >= gx0 && scEff.cx < gx0 + CHUNK && scEff.cy >= gy0 && scEff.cy < gy0 + CHUNK) {
      const slx = scEff.cx - gx0, sly = scEff.cy - gy0;
      pois.push({ id: `sign_${cx}_${cy}`, type: "sign", lx: slx, ly: sly, gx: scEff.cx, gy: scEff.cy, text: "???" });
    }
    // hearth portals: one per settlement/spawn center inside this chunk, on
    // the nearest walkable tile — the fast-travel network between hearths.
    try {
      for (const hostS of portalHostsForChunk(cx, cy)) {
        const spot = portalSpot(gx0, gy0, tiles, hostS, pois);
        if (spot) pois.push({ id: `portal_${hostS.cx}_${hostS.cy}`, type: "portal", lx: spot.lx, ly: spot.ly, gx: spot.gx, gy: spot.gy });
      }
    } catch (e) { }
    // v18 hell towers: surface towers in the surface dim, hell towers in
    // the hell dim — never both. The red portal burns at the tower's
    // EXACT heart — E only bites standing on it (nearestInteract gates d).
    try {
      if (window.Hell) {
        const all = pdim === "hell" ? (window.Hell.HELL_TOWERS || []) : (window.Hell.SURFACE_TOWERS || []);
        for (const tw of all) {
          if (tw.x < gx0 || tw.x >= gx0 + CHUNK || tw.y < gy0 || tw.y >= gy0 + CHUNK) continue;
          const sx = tw.x - gx0, sy = tw.y - gy0;
          pois.push({ id: `helltower_${tw.x}_${tw.y}`, type: "hell_tower", lx: sx, ly: sy, gx: tw.x, gy: tw.y, towerX: tw.x, towerY: tw.y });
        }
        // pantheon heart: heaven dimension only, at the radiant pantheon.
        if (pdim === "heaven") {
          try {
            const hx = window.Heaven.CENTER.x, hy = window.Heaven.CENTER.y;
            if (hx >= gx0 && hx < gx0 + CHUNK && hy >= gy0 && hy < gy0 + CHUNK) {
              let sx = hx - gx0, sy = hy - gy0, found = false;
              outerP: for (let r = 0; r <= 6; r++) for (let ang = 0; ang < 24; ang++) {
                const lx = Math.max(0, Math.min(15, hx - gx0 + Math.round(Math.cos(ang / 24 * 6.283) * r)));
                const ly = Math.max(0, Math.min(15, hy - gy0 + Math.round(Math.sin(ang / 24 * 6.283) * r)));
                try { if (!window.CFG.SOLID.has(tiles[ly * CHUNK + lx])) { sx = lx; sy = ly; found = true; break outerP; } } catch (e2) {}
              }
              if (found) pois.push({ id: `pantheon_heart`, type: "pantheon_heart", lx: sx, ly: sy, gx: gx0 + sx, gy: gy0 + sy });
            }
          } catch (e2) {}
        }
        // hell-god mouth: hell dimension only, at the castle heart.
        if (pdim === "hell") {
          try {
            const hx = window.Hell.CENTER.x, hy = window.Hell.CENTER.y;
            if (hx >= gx0 && hx < gx0 + CHUNK && hy >= gy0 && hy < gy0 + CHUNK) {
              let sx = hx - gx0, sy = hy - gy0, found = false;
              outerC: for (let r = 0; r <= 6; r++) for (let a = 0; a < 24; a++) {
                const lx = Math.max(0, Math.min(15, hx - gx0 + Math.round(Math.cos(a / 24 * 6.283) * r)));
                const ly = Math.max(0, Math.min(15, hy - gy0 + Math.round(Math.sin(a / 24 * 6.283) * r)));
                try { if (!window.CFG.SOLID.has(tiles[ly * CHUNK + lx])) { sx = lx; sy = ly; found = true; break outerC; } } catch (e2) {}
              }
              if (found) pois.push({ id: `hellgod_${cx}_${cy}`, type: "dungeon", lx: sx, ly: sy, gx: gx0 + sx, gy: gy0 + sy, dungeonId: `d_${cx}_${cy}_god`, hellGod: true });
            }
          } catch (e2) {}
        }
      }
    } catch (e) {}
    // npc spawn slots count (no villagers inside enemy holdings — the
    // garrison spawns live via Game code instead)
    const chunkBaseCenter = baseFor(cx * CHUNK + 8, cy * CHUNK + 8);
    let npcSlots;
    if (scEff) {
      const nn = SETTLE_DEF[scEff.type].npc;
      npcSlots = nn[0] + ((hash2(cx * 3 + 1, cy * 5 + 2) * (nn[1] - nn[0] + 1)) | 0);
    } else if (chunkBaseCenter) npcSlots = 0;
    else npcSlots = isTown ? 2 + ((hash2(cx, cy) * 2) | 0) : (centerBiome === "forest" || centerBiome === "dark_forest" || centerBiome === "plains") && hash2(cx + 5, cy + 5) > 0.45 ? 1 : 0;
    // enemy holding whose center lies in this chunk: record it (map marker),
    // raise its war-sign, and hide its master chest on walkable ground near
    // the middle (spiral search, like dungeon stairs).
    let chunkBase = null;
    for (const b of candB) {
      if (b.cx >= gx0 && b.cx < gx0 + CHUNK && b.cy >= gy0 && b.cy < gy0 + CHUNK) { chunkBase = b; break; }
    }
    if (chunkBase) {
      const bName = baseName(chunkBase);
      let sx = 8, sy = 8, found = false;
      outer2: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
        const lx = Math.max(1, Math.min(14, chunkBase.cx - gx0 + Math.round(Math.cos(a / 20 * 6.283) * r)));
        const ly = Math.max(1, Math.min(14, chunkBase.cy - gy0 + Math.round(Math.sin(a / 20 * 6.283) * r)));
        if (!window.CFG.SOLID.has(tiles[ly * CHUNK + lx])) { sx = lx; sy = ly; found = true; break outer2; }
      }
      if (found) pois.push({ id: `basechest_${cx}_${cy}`, type: "chest", lx: sx, ly: sy, gx: gx0 + sx, gy: gy0 + sy, opened: false, loot: "master", baseId: baseIdFor(chunkBase) });
      const slx = Math.max(0, Math.min(15, chunkBase.cx - gx0)), sly = Math.max(0, Math.min(15, chunkBase.cy - gy0));
      pois.push({ id: `basesign_${cx}_${cy}`, type: "sign", lx: slx, ly: sly, gx: chunkBase.cx, gy: chunkBase.cy, text: bName });
    }
    const rdim2 = getDim();
    let _pantheonName = null;
    try { if (rdim2 === "heaven" && window.Heaven && window.Heaven.isPantheonGround && window.Heaven.isPantheonGround(ccx, ccy)) _pantheonName = "Radiant Pantheon"; } catch (e) {}
    return { cx, cy, biome: centerBiome, placeName: _pantheonName || ((rdim2 !== "hell" && rdim2 !== "heaven" && dCenter < 28) ? spawnName() : null), lore: "", tiles, pois, npcSlots, enriched: false, hasDungeon, settlementType: settleType, scx: scEff ? scEff.cx : null, scy: scEff ? scEff.cy : null, spawn: (rdim2 !== "hell" && dCenter < 24), base: chunkBase ? { type: chunkBase.type, cx: chunkBase.cx, cy: chunkBase.cy } : null, dim: rdim2, v: window.CFG.SAVE_VERSION };
  }

  // Worker-built wilderness completion: the thread returns raw tiles +
  // biome + dungeon flag (the expensive fbm part); the main thread adds the
  // cheap POI layer (dungeon mouth, chests, portals) with the SAME rules as
  // genBaseChunk. Only used for wild chunks far from settlements/bases/spawn
  // (the worker bails with needsMain anywhere else), so signs/placeName/
  // settlement/base fields are all empty by construction.
  function completeWorkerChunk(cx, cy, tiles, biome, hasDungeon) {
    const T = window.CFG.T;
    const gx0 = cx * CHUNK, gy0 = cy * CHUNK;
    const pois = [];
    if (hasDungeon) {
      let sx = 8, sy = 8, found = false;
      outer: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
        const lx = 8 + Math.round(Math.cos(a / 20 * 6.283) * r), ly = 8 + Math.round(Math.sin(a / 20 * 6.283) * r);
        if (lx < 1 || ly < 1 || lx > 14 || ly > 14) continue;
        if (!window.CFG.SOLID.has(tiles[ly * CHUNK + lx])) { sx = lx; sy = ly; found = true; break outer; }
      }
      if (found) pois.push({ id: `stairs_${cx}_${cy}`, type: "dungeon", lx: sx, ly: sy, gx: gx0 + sx, gy: gy0 + sy, dungeonId: `d_${cx}_${cy}` });
      else {
        let wx = 8, wy = 8, wfound = false;
        outer2: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
          const lx = 8 + Math.round(Math.cos(a / 20 * 6.283) * r), ly = 8 + Math.round(Math.sin(a / 20 * 6.283) * r);
          if (lx < 1 || ly < 1 || lx > 14 || ly > 14) continue;
          const tt = tiles[ly * CHUNK + lx];
          if (tt === window.CFG.T.WATER || tt === window.CFG.T.DEEPWATER) { wx = lx; wy = ly; wfound = true; break outer2; }
        }
        if (wfound) pois.push({ id: `stairs_${cx}_${cy}`, type: "dungeon", lx: wx, ly: wy, gx: gx0 + wx, gy: gy0 + wy, dungeonId: `d_${cx}_${cy}_w`, water: true });
      }
    }
    const nChest = (hash2(cx + 999, cy - 999) * 3) | 0;
    try {
      const used = new Set(pois.map(p => p.lx + "," + p.ly));
      for (let i = 0; i < nChest; i++) {
        let lx = -1, ly = -1;
        for (let k = 0; k < 24; k++) {
          const tx = 1 + ((hash2(cx * 13 + i * 7, cy * 17 + k * 131) * 14) | 0);
          const ty = 1 + ((hash2(cx * 19 + k * 137, cy * 23 + i * 11) * 14) | 0);
          if (window.CFG.SOLID.has(tiles[ty * CHUNK + tx])) continue;
          if (used.has(tx + "," + ty)) continue;
          lx = tx; ly = ty; break;
        }
        if (lx < 0) {
          outer: for (let r = 0; r <= 7; r++) for (let a = 0; a < 20; a++) {
            const tx = 8 + Math.round(Math.cos(a / 20 * 6.283) * r), ty = 8 + Math.round(Math.sin(a / 20 * 6.283) * r);
            if (tx < 1 || ty < 1 || tx > 14 || ty > 14) continue;
            if (window.CFG.SOLID.has(tiles[ty * CHUNK + tx])) continue;
            if (used.has(tx + "," + ty)) continue;
            lx = tx; ly = ty; break outer;
          }
        }
        if (lx < 0) continue;
        used.add(lx + "," + ly);
        pois.push({ id: `ch_${cx}_${cy}_${i}`, type: "chest", lx, ly, gx: gx0 + lx, gy: gy0 + ly, opened: false, loot: null });
      }
    } catch (e) { }
    try {
      for (const hostS of portalHostsForChunk(cx, cy)) {
        const spot = portalSpot(gx0, gy0, tiles, hostS, pois);
        if (spot) pois.push({ id: `portal_${hostS.cx}_${hostS.cy}`, type: "portal", lx: spot.lx, ly: spot.ly, gx: spot.gx, gy: spot.gy });
      }
    } catch (e) { }
    const npcSlots = (biome === "forest" || biome === "dark_forest" || biome === "plains") && hash2(cx + 5, cy + 5) > 0.45 ? 1 : 0;
    return { cx, cy, biome, placeName: null, lore: "", tiles, pois, npcSlots, enriched: false, hasDungeon, settlementType: null, scx: null, scy: null, spawn: false, base: null, dim: "surf", v: window.CFG.SAVE_VERSION, _thread: true };
  }
  // (healing) Stored chunks keep their baked tiles, with one exception:
  // the door-front backfill (see getChunk) carves solid door fronts the
  // same way fresh chunks do. Missing walls are shown as broken exterior
  // fences (Buildings.drawExteriorFor), a pure overlay that never writes tiles.
  async function getChunk(cx, cy, dim) {
    dim = normDim(dim == null ? activeDim : dim);
    const key = chunkKey(cx, cy, dim);
    if (mem.chunks.has(key)) {
      const _h = mem.chunks.get(key);
      try { mem.chunks.delete(key); mem.chunks.set(key, _h); } catch (e) {}
      if (_h && !_h._doorHeal) {
        try {
          if (backfillDoorFronts(_h.tiles, cx * CHUNK, cy * CHUNK)) {
            try { await chunkStore(storeSlotOf(_h), _h.dim).set(key, _h); } catch (e) { }
          }
        } catch (e) { }
        if (!backfillGuardBusy()) { try { _h._doorHeal = true; } catch (e) { } }
      }
      return _h;
    }
    const mySlot = activeSlot, myEpoch = epoch;
    let stored = null;
    try { stored = await chunkStore(mySlot, dim).get(key); } catch (e) { stored = null; }
    // Pre-v11 chunks belong to the retired world construction (untyped spawn
    // town, legacy hut grids): never bake them into the new world — drop
    // them and regenerate below. The v11 migration normally wipes these
    // stores first; this is the belt-and-suspenders for any straggler.
    if (stored && ((stored.v | 0) || 0) < WORLD_GEN) stored = null;
    if (stored && !stored.dim) { try { stored.dim = "surf"; } catch (e) { } }
    // Slot moved on (switch / delete / new game) while we waited: hand back
    // the object without touching the new world's mem, stores, or AI queue.
    if (activeSlot !== mySlot || epoch !== myEpoch) return stored || genBaseChunk(cx, cy);
    let ch = null;
    // Multithreaded worldgen: brand-new wild chunks come from the worker pool
    // (pure fbm tiles built on background threads, pool sized to the
    // machine). Stored v11 chunks always win untouched; settlement/base/
    // origin chunks fall back to genBaseChunk. Workers only bake the surface
    // dimension — hell (and its void) always builds on the main thread.
    if (!stored && dim === "surf") {
      try {
        if (window.Threads && window.Threads.ensure()) {
          let r = null;
          try { r = window.Threads.takeCached(cx, cy); } catch (e) { r = null; }
          if (!r) {
            try { r = await window.Threads.genChunkTiles(cx, cy, 1500); }
            catch (e) { r = null; }
          }
          if (r && !r.needsMain && r.tiles && r.tiles.length === CHUNK * CHUNK) {
            const prevDim = activeDim; activeDim = "surf";
            try {
              ch = completeWorkerChunk(cx, cy, r.tiles, r.biome || biomeAt(cx * CHUNK + 8, cy * CHUNK + 8), !!r.hasDungeon);
            } finally { activeDim = prevDim; }
          }
        }
      } catch (e) { ch = null; }
    }
    if (!ch) {
      if (stored) ch = stored;
      else {
        // Synchronous generation reads the module dimension — set it for
        // this bake only (race-free: no await inside), then restore.
        const prevDim = activeDim; activeDim = dim;
        try { ch = genBaseChunk(cx, cy); }
        finally { activeDim = prevDim; }
      }
    }
    // Stored chunks are used as-is: no re-bake, no footprint heal — except
    // the door-front backfill (one-way: solid fronts become walkable rubble
    // or path; players can't build walls, so it never destroys their work).
    // Heals legacy chunks baked before the door guarantee (a wall sealed
    // right in front of a door), plus any front a fresh bake missed
    // (worker-baked wild neighbours carry no door repair, so a boundary
    // door front landing in them stays solid until this runs). The heal flag
    // is only set when no settlement build is in progress: a concurrent bake
    // can leave the building view partial (re-entrancy guard), and flagging
    // that as done would lock the miss in — leaving it unset retries on the
    // next load instead.
    function backfillGuardBusy() {
      try {
        const bip = window.Buildings && window.Buildings._buildingInProgress;
        return !!(bip && bip.size);
      } catch (e) { return false; }
    }
    let healed = false;
    if (ch && !ch._doorHeal) {
      try { healed = !!backfillDoorFronts(ch.tiles, cx * CHUNK, cy * CHUNK); } catch (e) { healed = false; }
      if (!backfillGuardBusy()) { try { ch._doorHeal = true; } catch (e) { } }
    }
    // Stored chunks are used as-is: no re-bake, no footprint heal.
    try { ch._slot = mySlot; } catch (e) { }
    try { if (!ch.dim) ch.dim = dim; } catch (e) { }
    memSet(mem.chunks, key, ch, MEM_MAX.chunks);
    // queue AI enrichment (once per session)
    if (!ch.enriched && !mem.enrichedQueued.has(key)) {
      memQueueAdd(key);
      setTimeout(() => {
        if (activeSlot !== mySlot || epoch !== myEpoch) return;
        try { window.AIDirector && window.AIDirector.enrichChunk(cx, cy, mySlot, myEpoch, dim); } catch (e) { }
      }, 400);
    }
    // persist brand-new chunks lazily (plus stored chunks the backfill healed)
    if (!stored || healed) { try { await chunkStore(mySlot, ch.dim).set(key, ch); } catch (e) { } }
    return ch;
  }
  // Slot-routed save: cached objects carry their home slot in `_slot`, so a
  // stale flow can never write into the newly active slot's store or mem.
  function storeSlotOf(obj) {
    try { const s = obj && obj._slot; if (/^[1-5]$/.test(String(s))) return String(s); } catch (e) { }
    return activeSlot;
  }
  async function saveChunk(ch, slot) {
    if (slot == null) slot = storeSlotOf(ch);
    else { slot = String(slot); try { ch._slot = slot; } catch (e) { } }
    // v18: dim rides on the chunk (h_/c_ keys + _hell folders). A chunk that
    // predates the stamp saves into the active dim — surf by default.
    let cdim = "surf";
    try { cdim = normDim(ch.dim != null ? ch.dim : activeDim); } catch (e) { cdim = "surf"; }
    try { if (!ch.dim) ch.dim = cdim; } catch (e) { }
    if (slot === activeSlot) memSet(mem.chunks, chunkKey(ch.cx, ch.cy, cdim), ch, MEM_MAX.chunks);
    try { await chunkStore(slot, cdim).set(chunkKey(ch.cx, ch.cy, cdim), ch); } catch (e) { }
  }
  function tileAt(ch, lx, ly) {
    if (lx < 0 || ly < 0 || lx >= CHUNK || ly >= CHUNK) return -1;
    return ch.tiles[ly * CHUNK + lx];
  }
  function isSolidTile(t) { return window.CFG.SOLID.has(t); }

  // ---- dungeons ----
  // Each delve has numbered levels: level 1 keeps the legacy key `d_cx_cy`
  // (old saves keep working); deeper levels live under `d_cx_cy_L2`, etc.
  // New delves carve bounded 104–136-tile interiors (deeper floors run bigger)
  // in one of five rotating layouts (crypt rooms / cavern / maze / great halls
  // / sunken lake) with a per-delve theme that shifts every floor down, so no
  // two floors feel the same. Layouts are rule-driven: a district graph of
  // rooms (rect + L-shaped unions) linked by an MST-style chain plus braided
  // loops and long shortcuts, with winding connectors and per-floor rule rolls
  // (twist/branchiness), so repeat delves never read as the same map.
  const DUNGEON_THEMES = ["crypt", "cavern", "fungal", "ember", "flooded", "shadow"];
  // Mid delves (5+) add glacier ice plus four new grounds (library, briar,
  // hive, wreck); deep delves (8+) unlock six more (mirror, storm, tomb,
  // clockwork, flesh, grove) alongside inferno + abyss.
  // Shallow floors keep the classic rotation so early delves feel familiar.
  const DUNGEON_MID_THEMES = ["glacier", "library", "briar", "hive", "wreck", "leviathan"];
  const DUNGEON_DEEP_THEMES = ["glacier", "inferno", "abyss", "mirror", "storm", "tomb", "clockwork", "flesh", "grove", "leviathan"];
  function dungeonThemeFor(cx, cy, level) {
    level = Math.max(1, level | 0 || 1);
    const b = hash2(cx * 5 + 1, cy * 9 + 2);
    // v18 dimension split: the hell pool rolls in the hell dimension only
    // (on hell ground). The surface disc is ocean — never a hell delve.
    try {
      if (getDim() === "hell" && isHellBaseGround(cx * 16 + 8, cy * 16 + 8)) {
        const pool = ["inferno", "abyss", "flesh", "inferno", "abyss"];
        return pool[((b * pool.length * 7 + level * 2) | 0) % pool.length];
      }
    } catch (e) {}
    if (level >= 8) {
      const pool = DUNGEON_THEMES.concat(DUNGEON_DEEP_THEMES);
      return pool[((b * pool.length * 7 + level * 3) | 0) % pool.length];
    }
    if (level >= 5) {
      const pool = DUNGEON_THEMES.concat(DUNGEON_MID_THEMES);
      return pool[((b * pool.length * 7 + level) | 0) % pool.length];
    }
    return DUNGEON_THEMES[(((b * DUNGEON_THEMES.length) | 0) + (level - 1)) % DUNGEON_THEMES.length];
  }
  const DUNGEON_NAMES = {
    crypt: ["Sunken Crypt", "The dead were buried here and never quite settled."],
    cavern: ["Howling Caves", "Wind moves through the tunnels like something breathing."],
    fungal: ["Fungal Dark", "Spores drift in the still air. Do not lick the walls."],
    ember: ["Ember Depths", "The stone is warm underfoot. Something burns below."],
    flooded: ["Sunken Halls", "Water took these halls long ago and never gave them back."],
    shadow: ["Shadow Crypt", "Torchlight gutters here, as if the dark were drinking it."],
    glacier: ["Frozen Hollow", "Ice crept down from above and never melted. Watch your footing."],
    inferno: ["Inferno Halls", "Lakes of fire. Cross by the black stone — quickly."],
    abyss: ["Abyssal Void", "Crystals grow in the lightless deep. They are listening."],
    library: ["Sunken Library", "Drowned shelves of drowned scholars. Mind the dust — and the teeth."],
    briar: ["Briar Grotto", "Roots broke through and never left. The thorns remember every footstep."],
    hive: ["Wax Hive", "Something huge built honeycomb down here. It still hums."],
    wreck: ["Drowned Hulk", "A ship that sank through solid stone. Her decks rot below."],
    mirror: ["Mirror Halls", "Crystals that show you arriving before you arrive."],
    storm: ["Storm Spire", "Lanterns burn blue where the sky leaks in."],
    tomb: ["Sunscorched Tomb", "Desert kings buried with their gold, their bones, and their guards."],
    clockwork: ["Clockwork Vault", "Brass corridors that tick. Something still winds them."],
    flesh: ["Flesh Warren", "The walls bleed. Walk softly; it bruises."],
    grove: ["Deepcap Grove", "Towering mushrooms roof the dark like a forest turned inside out."],
    leviathan: ["Leviathan Deep", "Black water fills the drowned halls. Something vast circles below — and it is hungry."],
  };
  function genDungeonInterior(id, cx, cy, level = 1) {
    level = Math.max(1, level | 0 || 1);
    const T = window.CFG.T;
    const rng = (() => { let s = (hash2(cx * 31 + level * 101, cy * 57 + level * 37) * 1e9) | 0; return () => { s = (Math.imul(s ^ (s >>> 15), 2246822519) ^ Math.imul(s ^ (s >>> 13), 3266489917)) >>> 0; return (s >>> 0) / 4294967296; }; })();
    const isGodDelve = /_god(_L\d+)?$/.test(id);
    const sizePick = hash2(cx * 7 + level * 13, cy * 11 + level * 29);
    // Rule-based delve sizing: much bigger than the old 52-60. Base footprint
    // 104-128 by seed, +2 per floor down (deeper = bigger), capped at 136.
    // The god-delve stays a fixed 132. areaK scales decor/torch/chest density.
    const _baseS = sizePick < 0.33 ? 104 : sizePick < 0.66 ? 116 : 128;
    const _lvlBonus = Math.min(16, (Math.max(1, level | 0 || 1) - 1) * 2);
    const S = isGodDelve ? 132 : Math.min(136, _baseS + _lvlBonus);
    const W = S, H = S;
    const areaK = (W * H) / 3136;
    // drowned delves (`_w` ids, whirlpool mouths out at sea) are always the
    // leviathan deep, every level down — the sea only opens one way.
    // v19 god-delve (`_god` ids, the castle-heart portal): one special
    // dungeon per world — inferno/abyss/flesh rotate per level, always 132x132.
    const theme = /_w(_L\d+)?$/.test(id) ? "leviathan" : (isGodDelve ? ["inferno", "abyss", "flesh"][(Math.max(1, level | 0 || 1) - 1) % 3] : dungeonThemeFor(cx, cy, level));
    // v17 hell delves wear their own stone: obsidian halls (inferno),
    // bone vaults (abyss), breathing flesh (flesh) — nothing like the surface.
    const hellTiles = theme === "inferno" ? { w: T.STONEWALL, f: T.ASH } : theme === "abyss" ? { w: T.CRYSTAL, f: T.BONE } : theme === "flesh" ? { w: T.BLOOD, f: T.FLESH } : null;
    const DW = hellTiles ? hellTiles.w : T.DWALL, DF = hellTiles ? hellTiles.f : T.DFLOOR;
    const tiles = new Array(W * H).fill(DW);
    // 0 crypt, 1 cavern, 2 maze, 3 halls, 4 sunken lake (water/lava/blood crossings)
    const LAKE_THEMES = { flooded: 1, ember: 1, inferno: 1, glacier: 1, wreck: 1, flesh: 1 };
    let mode = (hash2(cx * 13 + 3, cy * 17 + level * 7) * 4) | 0;
    if (theme === "leviathan") mode = 4; // the drowned deep is always a sunken lake
    else if (LAKE_THEMES[theme] && hash2(cx * 29 + level * 3, cy * 31 + 7) < (theme === "wreck" ? 0.55 : 0.45)) mode = 4;
    // theme-native layouts: libraries and storm spires read as great halls,
    // clockwork as maze, groves/hives/briar as caverns, tombs/mirror/flesh as crypts
    const FORCE_MODE = { library: 3, clockwork: 2, storm: 3, tomb: 0, grove: 1, hive: 1, briar: 1, mirror: 0, flesh: 0 };
    if (mode !== 4 && FORCE_MODE[theme] != null && hash2(cx * 41 + level * 5, cy * 43 + 11) < 0.75) mode = FORCE_MODE[theme];
    const inB = (x, y) => x >= 1 && y >= 1 && x < W - 1 && y < H - 1;
    const at = (x, y) => (inB(x, y) ? tiles[y * W + x] : DW);
    const set = (x, y, t) => { if (inB(x, y)) tiles[y * W + x] = t; };
    const chambers = [];
    function carveRect(rx, ry, rw, rh) {
      rx = Math.max(1, rx); ry = Math.max(1, ry);
      rw = Math.min(rw, W - 2 - rx); rh = Math.min(rh, H - 2 - ry);
      if (rw < 2 || rh < 2) return null;
      for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) tiles[y * W + x] = DF;
      const ch = { rx, ry, rw, rh };
      chambers.push(ch);
      return ch;
    }
    function carveH(x1, x2, y, w = 1) {
      const [a, b] = x1 <= x2 ? [x1, x2] : [x2, x1];
      for (let x = a; x <= b; x++) for (let k = 0; k < w; k++) set(x, y + k, DF);
    }
    function carveV(y1, y2, x, w = 1) {
      const [a, b] = y1 <= y2 ? [y1, y2] : [y1, y2];
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let k = 0; k < w; k++) set(x + k, y, DF);
      void a; void b;
    }
    function carveL(ax, ay, bx, by, w = 1) {
      if (rng() < 0.5) { carveH(ax, bx, ay, w); carveV(ay, by, bx, w); }
      else { carveV(ay, by, ax, w); carveH(ax, bx, by, w); }
    }
    // Winding connector: drunkard's walk biased at the target, finished with
    // a straight L so the link always lands. Gives caverns (and twisted
    // floors elsewhere) their meander instead of clean Ls everywhere.
    function carveWinding(ax, ay, bx, by, w = 1) {
      let x = Math.max(1, Math.min(W - 2, Math.round(ax))), y = Math.max(1, Math.min(H - 2, Math.round(ay)));
      const tx = Math.max(1, Math.min(W - 2, Math.round(bx))), ty = Math.max(1, Math.min(H - 2, Math.round(by)));
      let guard = 0;
      const maxSteps = Math.abs(tx - x) + Math.abs(ty - y) + 60;
      while ((x !== tx || y !== ty) && guard++ < 500) {
        const dx = Math.sign(tx - x), dy = Math.sign(ty - y);
        let mx = 0, my = 0;
        const r = rng();
        if (dx !== 0 && dy !== 0) {
          if (r < 0.42) mx = dx;
          else if (r < 0.84) my = dy;
          else if (r < 0.92) { mx = rng() < 0.5 ? -1 : 1; }
          else { my = rng() < 0.5 ? -1 : 1; }
        } else if (dx !== 0) { mx = dx; if (rng() < 0.28) my = rng() < 0.5 ? -1 : 1; }
        else if (dy !== 0) { my = dy; if (rng() < 0.28) mx = rng() < 0.5 ? -1 : 1; }
        else break;
        x = Math.max(1, Math.min(W - 2, x + mx)); y = Math.max(1, Math.min(H - 2, y + my));
        for (let k = 0; k < w; k++) { set(x + k, y, DF); set(x, y + k, DF); }
        if (rng() < 0.05) { for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) if (rng() < 0.4) set(x + ox, y + oy, DF); }
        if (guard > maxSteps && rng() < 0.25) break;
      }
      carveL(x, y, tx, ty, w);
    }
    // L-shaped union room: two overlapping rects, both tracked so mob/chest
    // placement sees real walkable bounds. Breaks the "every room is a box" read.
    function carveLShape(rx, ry, rw, rh) {
      const first = carveRect(rx, ry, rw, rh);
      if (!first) return null;
      const w2 = Math.max(3, (rw * (0.5 + rng() * 0.4)) | 0), h2 = Math.max(3, (rh * (0.5 + rng() * 0.4)) | 0);
      const side = (rng() * 4) | 0;
      let nx = rx, ny = ry;
      if (side === 0) { nx = rx + ((rng() * Math.max(1, rw - 2)) | 0) - 1; ny = ry - h2 + 2; }
      else if (side === 1) { nx = rx + ((rng() * Math.max(1, rw - 2)) | 0) - 1; ny = ry + rh - 2; }
      else if (side === 2) { nx = rx - w2 + 2; ny = ry + ((rng() * Math.max(1, rh - 2)) | 0) - 1; }
      else { nx = rx + rw - 2; ny = ry + ((rng() * Math.max(1, rh - 2)) | 0) - 1; }
      carveRect(nx, ny, w2, h2);
      return first;
    }
    const center = (ch) => ({ x: ch.rx + (ch.rw >> 1), y: ch.ry + (ch.rh >> 1) });
    // Per-floor rule rolls (deterministic via rng): corridor twist, loop
    // density, L-room frequency. Same delve+level always rolls the same rules,
    // but neighbouring floors / delves diverge.
    const twist = rng();
    const branchiness = 0.45 + rng() * 0.4;
    // ----- layouts -----
    if (mode === 1) {
      // CAVERN: cellular noise smoothed into winding caves, then chambers
      // stamped on top so entry / boss / vault always have clean footing.
      // Rule: true winding caves — sticky cellular rule (a wall survives on 4
      // neighbours, births on 5+) holds ~45% rock over 5 passes, so big floors
      // keep tunnels and caverns instead of collapsing into open fields.
      let m = new Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) m[y * W + x] = 1;
        else m[y * W + x] = rng() < 0.47 ? 1 : 0;
      }
      const wallsNear = (g, x, y) => { let n = 0; for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) { if (!ox && !oy) continue; const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || g[ny * W + nx]) n++; } return n; };
      for (let it = 0; it < 5; it++) {
        const n2 = m.slice();
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const wn = wallsNear(m, x, y);
          n2[y * W + x] = (wn >= 5 || (wn === 4 && m[y * W + x] === 1)) ? 1 : 0;
        }
        m = n2;
      }
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!m[y * W + x]) tiles[y * W + x] = DF;
      // Rule: caverns keep open wilds + 10-15 stamped halls (some L-shaped)
      // so entry/boss/vault always have clean footing in the noise.
      const nCh = 10 + ((rng() * 5) | 0);
      for (let i = 0; i < nCh; i++) {
        const rw = 7 + ((rng() * 7) | 0), rh = 7 + ((rng() * 7) | 0);
        const rx = 2 + ((rng() * Math.max(1, W - rw - 4)) | 0), ry = 2 + ((rng() * Math.max(1, H - rh - 4)) | 0);
        if (rng() < 0.25) carveLShape(rx, ry, rw, rh);
        else carveRect(rx, ry, rw, rh);
      }
    } else if (mode === 2) {
      // MAZE: recursive-backtracker lattice, chambers cleared inside it,
      // plus knocked-out loops so it never plays as one long snake.
      for (let y = 1; y < H - 1; y += 2) for (let x = 1; x < W - 1; x += 2) tiles[y * W + x] = DF;
      const cw = ((W - 1) / 2) | 0, chh = ((H - 1) / 2) | 0;
      const seen = new Array(cw * chh).fill(false);
      const stack = [[0, 0]]; seen[0] = true;
      while (stack.length) {
        const [ccx, ccy] = stack[stack.length - 1];
        const opts = [];
        if (ccx > 0 && !seen[ccy * cw + ccx - 1]) opts.push([-1, 0]);
        if (ccx < cw - 1 && !seen[ccy * cw + ccx + 1]) opts.push([1, 0]);
        if (ccy > 0 && !seen[(ccy - 1) * cw + ccx]) opts.push([0, -1]);
        if (ccy < chh - 1 && !seen[(ccy + 1) * cw + ccx]) opts.push([0, 1]);
        if (!opts.length) { stack.pop(); continue; }
        const [dx, dy] = opts[(rng() * opts.length) | 0];
        const nx = 1 + (ccx + dx) * 2 - 1, ny = 1 + (ccy + dy) * 2 - 1;
        void nx; void ny;
        tiles[(1 + ccy * 2 + dy) * W + (1 + ccx * 2 + dx)] = DF;
        seen[(ccy + dy) * cw + ccx + dx] = true;
        stack.push([ccx + dx, ccy + dy]);
      }
      // Rule: braid hard — loop count scales with area so big mazes never
      // play as one long snake. Chambers double as treasure nooks.
      for (let i = 0, _loops = Math.round(14 * areaK); i < _loops; i++) {
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DW && ((at(x - 1, y) === DF && at(x + 1, y) === DF) || (at(x, y - 1) === DF && at(x, y + 1) === DF))) set(x, y, DF);
      }
      // chambers: clear 5x5–9x9 halls into the lattice (some L-shaped)
      const nCh = 10 + ((rng() * 5) | 0);
      for (let i = 0; i < nCh; i++) {
        const cx0 = 1 + ((rng() * ((W - 9) / 2)) | 0) * 2, cy0 = 1 + ((rng() * ((H - 9) / 2)) | 0) * 2;
        const rw = 5 + ((rng() * 4) | 0), rh = 5 + ((rng() * 4) | 0);
        const ch = { rx: Math.min(W - 2 - rw, cx0), ry: Math.min(H - 2 - rh, cy0), rw, rh };
        for (let y = ch.ry; y < ch.ry + rh; y++) for (let x = ch.rx; x < ch.rx + rw; x++) set(x, y, DF);
        chambers.push(ch);
      }
    } else if (mode === 3) {
      // GREAT HALLS rule: 7-10 vast courts (14-24 wide) on 3-wide boulevards
      // + 6-9 side crypts (some L-shaped). Big maps read as a palace, not a room.
      const nH = 7 + ((rng() * 3) | 0);
      for (let i = 0; i < nH; i++) {
        const rw = 14 + ((rng() * 10) | 0), rh = 12 + ((rng() * 10) | 0);
        const rx = 2 + ((rng() * Math.max(1, W - rw - 4)) | 0), ry = 2 + ((rng() * Math.max(1, H - rh - 4)) | 0);
        if (rng() < 0.3) carveLShape(rx, ry, rw, rh);
        else carveRect(rx, ry, rw, rh);
      }
      const nS = 6 + ((rng() * 4) | 0);
      for (let i = 0; i < nS; i++) {
        const rw = 6 + ((rng() * 5) | 0), rh = 6 + ((rng() * 5) | 0);
        const rx = 2 + ((rng() * Math.max(1, W - rw - 4)) | 0), ry = 2 + ((rng() * Math.max(1, H - rh - 4)) | 0);
        if (rng() < 0.25) carveLShape(rx, ry, rw, rh);
        else carveRect(rx, ry, rw, rh);
      }
    } else if (mode === 4) {
      // SUNKEN LAKE rule: ring of edge rooms + interior halls around 2-4
      // hazard lakes (one grand central + satellites). Bridges (2-3 wide) are
      // the only way across — lava to hop, ice to skid, blood to dread.
      const lakeTile = theme === "ember" || theme === "inferno" ? T.LAVA : theme === "flesh" ? T.BLOOD : T.WATER;
      const bridgeTile = theme === "ember" || theme === "inferno" || theme === "flesh" ? T.TOWNSTONE : theme === "glacier" ? T.ICE : T.PLANKS;
      const nE = 13 + ((rng() * 5) | 0);
      for (let i = 0; i < nE; i++) {
        const edge = (rng() * 4) | 0;
        const rw = 7 + ((rng() * 6) | 0), rh = 7 + ((rng() * 6) | 0);
        let rx, ry;
        if (edge === 0) { rx = 2 + ((rng() * (W - rw - 4)) | 0); ry = 2; }
        else if (edge === 1) { rx = 2 + ((rng() * (W - rw - 4)) | 0); ry = H - rh - 2; }
        else if (edge === 2) { rx = 2; ry = 2 + ((rng() * (H - rh - 4)) | 0); }
        else { rx = W - rw - 2; ry = 2 + ((rng() * (H - rh - 4)) | 0); }
        carveRect(rx, ry, rw, rh);
      }
      const lw = 16 + ((rng() * 8) | 0), lh = 12 + ((rng() * 8) | 0);
      const lx0 = (W - lw) >> 1, ly0 = (H - lh) >> 1;
      for (let y = ly0; y < ly0 + lh; y++) for (let x = lx0; x < lx0 + lw; x++) set(x, y, lakeTile);
      // satellite hazard pools elsewhere, so divers and crossings recur
      const nSat = 1 + ((rng() * 3) | 0);
      for (let s = 0; s < nSat; s++) {
        let done = false;
        for (let attempt = 0; attempt < 16 && !done; attempt++) {
          const sw = 6 + ((rng() * 6) | 0), sh = 5 + ((rng() * 5) | 0);
          const sx0 = 3 + ((rng() * Math.max(1, W - sw - 6)) | 0), sy0 = 3 + ((rng() * Math.max(1, H - sh - 6)) | 0);
          let clear = true;
          for (let y = sy0 - 1; y < sy0 + sh + 1 && clear; y++) for (let x = sx0 - 1; x < sx0 + sw + 1 && clear; x++) {
            if (at(x, y) !== DF) { clear = false; break; }
          }
          if (!clear) continue;
          for (let y = sy0; y < sy0 + sh; y++) for (let x = sx0; x < sx0 + sw; x++) set(x, y, lakeTile);
          const jy = sy0 + ((rng() * sh) | 0);
          for (let x = sx0 - 2; x <= sx0 + sw + 1; x++) { set(x, jy, bridgeTile); set(x, jy + 1, bridgeTile); }
          done = true;
        }
      }
      const nB = 3 + (rng() < 0.5 ? 1 : 0);
      for (let i = 0; i < nB; i++) {
        if (rng() < 0.6) {
          const y = ly0 + 1 + ((rng() * Math.max(1, lh - 3)) | 0);
          for (let x = lx0 - 2; x <= lx0 + lw + 1; x++) { set(x, y, bridgeTile); set(x, y + 1, bridgeTile); }
        } else {
          const x = lx0 + 1 + ((rng() * Math.max(1, lw - 3)) | 0);
          for (let y = ly0 - 2; y <= ly0 + lh + 1; y++) { set(x, y, bridgeTile); set(x + 1, y, bridgeTile); }
        }
      }
    } else {
      // CRYPT rule: a tomb district — 22-32 burial halls (6-15 wide, a third
      // L-shaped unions) stitched by 1-2-wide aisles. Bone pits and sarcophagi
      // (below) dress whichever halls the rules placed.
      const nR = 22 + ((rng() * 10) | 0);
      for (let i = 0; i < nR; i++) {
        const rw = 6 + ((rng() * 9) | 0), rh = 6 + ((rng() * 9) | 0);
        const rx = 2 + ((rng() * Math.max(1, W - rw - 4)) | 0), ry = 2 + ((rng() * Math.max(1, H - rh - 4)) | 0);
        if (rng() < 0.35) carveLShape(rx, ry, rw, rh);
        else carveRect(rx, ry, rw, rh);
      }
    }
    if (!chambers.length) carveRect((W >> 1) - 6, (H >> 1) - 6, 12, 12);
    // Rule: link districts as a braided graph, not a line. A chain guarantees
    // one route, then branchiness-driven loops braid it, then a few long
    // shortcuts join distant wings — so the map has branches, dead ends ( good
    // for treasure) and alternate rings. Corridor width follows the layout
    // (halls march 3-wide, crypt aisles 1-2, the rest 1-2 by roll), and twisted
    // floors wander instead of cutting clean Ls.
    const conn = (ax, ay, bx, by, w) => {
      if (twist < 0.4 || mode === 2 || mode === 3) carveL(ax, ay, bx, by, w);
      else if (twist < 0.7) { if (rng() < 0.5) carveL(ax, ay, bx, by, w); else carveWinding(ax, ay, bx, by, w); }
      else carveWinding(ax, ay, bx, by, w);
    };
    const wideMain = mode === 3 ? 3 : mode === 0 ? 2 : 1;
    for (let i = 1; i < chambers.length; i++) {
      const a = center(chambers[i - 1]), b = center(chambers[i]);
      const w = (mode === 3 && i % 3 === 0) ? 3 : (rng() < 0.25 ? Math.min(3, wideMain + 1) : wideMain);
      conn(a.x, a.y, b.x, b.y, w);
    }
    const loopN = Math.round(chambers.length * branchiness) + 3;
    for (let i = 0; i < loopN; i++) {
      const a = center(chambers[(rng() * chambers.length) | 0]), b = center(chambers[(rng() * chambers.length) | 0]);
      if (a === b) continue;
      conn(a.x, a.y, b.x, b.y, rng() < 0.2 ? 2 : 1);
    }
    // a few long shortcuts across the whole delve: distant wings join up
    for (let i = 0; i < 4; i++) {
      if (chambers.length < 8) break;
      const ai = (rng() * chambers.length) | 0;
      let bi2 = (rng() * chambers.length) | 0, guard = 0;
      while (guard++ < 8) {
        const a = center(chambers[ai]), b = center(chambers[bi2]);
        if (Math.hypot(a.x - b.x, a.y - b.y) > Math.min(W, H) * 0.4) break;
        bi2 = (rng() * chambers.length) | 0;
      }
      const a = center(chambers[ai]), b = center(chambers[bi2]);
      if (a !== b) conn(a.x, a.y, b.x, b.y, 1);
    }
    // Connectivity repair: flood from the first hall; any district whose
    // heart is unreachable gets a fresh corridor to entry. Repeats until the
    // whole graph is one component (capped — corridors always land).
    const isWalk = (x, y) => inB(x, y) && tiles[y * W + x] !== DW;
    const floodFrom = (sx, sy) => {
      const dist = new Int32Array(W * H).fill(-1);
      if (!isWalk(sx, sy)) return dist;
      const q = [sy * W + sx]; dist[sy * W + sx] = 0;
      let head = 0;
      while (head < q.length) {
        const cur = q[head++]; const cx0 = cur % W, cy0 = (cur / W) | 0;
        const dd = dist[cur];
        if (cx0 > 1 && dist[cur - 1] < 0 && tiles[cur - 1] !== DW) { dist[cur - 1] = dd + 1; q.push(cur - 1); }
        if (cx0 < W - 2 && dist[cur + 1] < 0 && tiles[cur + 1] !== DW) { dist[cur + 1] = dd + 1; q.push(cur + 1); }
        if (cy0 > 1 && dist[cur - W] < 0 && tiles[cur - W] !== DW) { dist[cur - W] = dd + 1; q.push(cur - W); }
        if (cy0 < H - 2 && dist[cur + W] < 0 && tiles[cur + W] !== DW) { dist[cur + W] = dd + 1; q.push(cur + W); }
      }
      return dist;
    };
    const entrySeed = center(chambers[0]);
    for (let pass = 0; pass < 4; pass++) {
      const dist0 = floodFrom(entrySeed.x, entrySeed.y);
      let fixed = false;
      for (let i = 1; i < chambers.length; i++) {
        const c = center(chambers[i]);
        if (dist0[c.y * W + c.x] < 0) { carveL(c.x, c.y, entrySeed.x, entrySeed.y, 1); fixed = true; }
      }
      if (!fixed) break;
    }
    // Seal isolated wilds: any walkable ground still unreachable from entry
    // (cellular pockets, winding side-pockets) becomes rock, so the map never
    // shows floors the hero can see but never stand on. Lakes/bridges stay —
    // hazards read fine behind stone, and corridors already cut through them.
    try {
      const _reach = floodFrom(entrySeed.x, entrySeed.y);
      for (let yy = 1; yy < H - 1; yy++) for (let xx = 1; xx < W - 1; xx++) {
        const ii = yy * W + xx;
        if (tiles[ii] === DF && _reach[ii] < 0) tiles[ii] = DW;
      }
    } catch (eSeal) {}
    // entry = first hall; boss = the hall FARTHEST BY WALK from entry, so the
    // delve always plays long door-to-door no matter how big it grew.
    const e0 = center(chambers[0]);
    const walkDist = floodFrom(e0.x, e0.y);
    let bi = 0, bd = -1;
    for (let i = 0; i < chambers.length; i++) {
      const c = center(chambers[i]);
      const wd = walkDist[c.y * W + c.x];
      const eu = (c.x - e0.x) * (c.x - e0.x) + (c.y - e0.y) * (c.y - e0.y);
      const score = (wd >= 0 ? wd * 1000 : -1) + eu;
      if (score > bd) { bd = score; bi = i; }
    }
    // total fallback: if even entry is sealed (should never happen), Euclidean
    if (bd < 0) {
      for (let i = 0; i < chambers.length; i++) {
        const c = center(chambers[i]);
        const d = (c.x - e0.x) * (c.x - e0.x) + (c.y - e0.y) * (c.y - e0.y);
        if (d > bd) { bd = d; bi = i; }
      }
    }
    const entry = chambers[0], bossR = chambers[bi];
    const entryPos = center(entry);
    const bossPos = center(bossR);
    // pillars inside grand rooms (never seal them: single tiles, spaced out)
    for (const ch of chambers) {
      if (ch.rw < 8 || ch.rh < 8 || rng() < 0.35) continue;
      const nP = 2 + ((rng() * 3) | 0);
      for (let i = 0; i < nP; i++) {
        const px = ch.rx + 2 + ((rng() * (ch.rw - 4)) | 0), py = ch.ry + 2 + ((rng() * (ch.rh - 4)) | 0);
        if (Math.abs(px - (ch.rx + (ch.rw >> 1))) + Math.abs(py - (ch.ry + (ch.rh >> 1))) < 2) continue;
        set(px, py, DW);
      }
    }
    tiles[entryPos.y * W + entryPos.x] = T.STAIRS;
    // lake stamps / decor may have covered key spots — punch clean footing
    const ensureFloor = (p) => {
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const x = p.x + ox, y = p.y + oy;
        if (inB(x, y) && (at(x, y) === DW || at(x, y) === T.LAVA || at(x, y) === T.WATER || at(x, y) === T.BLOOD)) set(x, y, DF);
      }
    };
    ensureFloor(entryPos); ensureFloor(bossPos);
    // theme decor: walkable accents. Deeper floors get denser detail so
    // level 20 never reads like level 1.
    const decorFor = {
      crypt: [T.TOWNSTONE, T.PATH, T.BONE], cavern: [T.SAND, T.TOWNSTONE, T.RUBBLE],
      fungal: [T.TOWNSTONE, T.PATH, T.MOSS, 1], ember: [T.ASH, T.SAND, T.PATH],
      flooded: [T.SAND, T.PATH, T.PLANKS], shadow: [T.TOWNSTONE, T.PATH, T.RUBBLE],
      glacier: [T.ICE, T.TOWNSTONE, T.PATH], inferno: [T.ASH, T.BONE, T.TOWNSTONE],
      abyss: [T.BONE, T.ASH, T.TOWNSTONE],
      library: [T.PLANKS, T.PATH, T.TOWNSTONE], briar: [T.MOSS, 1, 2],
      hive: [T.WAX, T.SAND, T.TOWNSTONE], wreck: [T.PLANKS, T.SAND, T.PATH],
      mirror: [T.ICE, T.TOWNSTONE, T.PATH], storm: [T.TOWNSTONE, T.PATH, T.RUBBLE],
      tomb: [T.SAND, T.BONE, T.PATH], clockwork: [T.TOWNSTONE, T.PATH, T.RUBBLE],
      flesh: [T.FLESH, T.BONE, T.PATH], grove: [T.MOSS, 1, T.PATH],
    };
    const decor = decorFor[theme] || [T.TOWNSTONE, T.PATH];
    const isFloor = (t) => t === DF || t === T.TOWNSTONE || t === T.PATH || t === T.SAND || t === 1 || t === T.PLANKS || t === T.RUBBLE || t === T.ICE || t === T.ASH || t === T.MOSS || t === T.BONE || t === T.WAX || t === T.FLESH;
    const nearCrit = (x, y) => Math.hypot(x - entryPos.x, y - entryPos.y) < 3 || Math.hypot(x - bossPos.x, y - bossPos.y) < 3;
    // Rule: scatter density follows floor area so big delves never read empty.
    const decorN = Math.min(150, Math.round((16 + level * 2) * areaK));
    for (let i = 0; i < decorN; i++) {
      const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
      if (at(x, y) !== DF || nearCrit(x, y)) continue;
      set(x, y, decor[(rng() * decor.length) | 0]);
    }
    // patch helper: blob of walkable theme floor inside open ground.
    // Counts scale with floor area (big delves get more ground cover).
    const patch = (tile, rMin, rMax, n) => {
      n = Math.max(n, Math.round(n * (0.6 + areaK * 0.45)));
      for (let i = 0; i < n; i++) {
        const cxp = 3 + ((rng() * (W - 6)) | 0), cyp = 3 + ((rng() * (H - 6)) | 0);
        const r = rMin + ((rng() * (rMax - rMin + 1)) | 0);
        for (let oy = -r; oy <= r; oy++) for (let ox = -r; ox <= r; ox++) {
          if (ox * ox + oy * oy > r * r + r) continue;
          const x = cxp + ox, y = cyp + oy;
          if (at(x, y) !== DF || nearCrit(x, y)) continue;
          set(x, y, tile);
        }
      }
    };
    // ---- per-theme set pieces ----
    if (theme === "glacier") {
      // ice sheets: big slippery fields broken by snow pillars
      patch(T.ICE, 2, 3 + Math.min(3, level >> 2), 2 + ((rng() * 2) | 0) + (level >= 5 ? 1 : 0));
      for (let i = 0, _gp = Math.round((4 + (level >> 2)) * Math.min(2.5, areaK)); i < _gp; i++) { // frozen pools: ice-rimmed water
        let done = false;
        for (let attempt = 0; attempt < 12 && !done; attempt++) {
          const x = 3 + ((rng() * (W - 6)) | 0), y = 3 + ((rng() * (H - 6)) | 0);
          if (at(x, y) !== DF || nearCrit(x, y)) continue;
          let ok = true;
          for (let oy = -2; oy <= 2 && ok; oy++) for (let ox = -2; ox <= 2 && ok; ox++) if (!isFloor(at(x + ox, y + oy))) ok = false;
          if (!ok) continue;
          set(x, y, T.WATER);
          set(x - 1, y, T.ICE); set(x + 1, y, T.ICE); set(x, y - 1, T.ICE); set(x, y + 1, T.ICE);
          done = true;
        }
      }
    }
    if (theme === "ember" || theme === "inferno") {
      patch(T.ASH, 2, 4, 2 + ((rng() * 2) | 0));
      // lava lakes with a guaranteed stone spine across (the puzzle)
      const lakes = (theme === "inferno" ? 2 + ((rng() * 2) | 0) : 1 + (rng() < 0.5 ? 1 : 0)) + Math.round(areaK - 1);
      for (let i = 0; i < lakes; i++) {
        let done = false;
        for (let attempt = 0; attempt < 14 && !done; attempt++) {
          const lw = 5 + ((rng() * 4) | 0) + Math.min(3, level >> 3), lh = 4 + ((rng() * 3) | 0);
          const lx0 = 3 + ((rng() * Math.max(1, W - lw - 6)) | 0), ly0 = 3 + ((rng() * Math.max(1, H - lh - 6)) | 0);
          let clear = true;
          for (let y = ly0 - 1; y < ly0 + lh + 1 && clear; y++) for (let x = lx0 - 1; x < lx0 + lw + 1 && clear; x++) {
            if (!isFloor(at(x, y)) || nearCrit(x, y)) clear = false;
          }
          if (!clear) continue;
          for (let y = ly0; y < ly0 + lh; y++) for (let x = lx0; x < lx0 + lw; x++) set(x, y, T.LAVA);
          // winding black-stone spine: horizontal with one jog
          const jy = ly0 + ((rng() * lh) | 0);
          for (let x = lx0 - 1; x <= lx0 + lw; x++) set(x, jy, T.TOWNSTONE);
          const jx = lx0 + ((rng() * lw) | 0);
          for (let y = Math.max(2, ly0 - 2); y <= Math.min(H - 3, ly0 + lh + 1); y++) set(jx, y, T.TOWNSTONE);
          done = true;
        }
      }
    }
    if (theme === "flooded") {
      // ponds with plank causeways + sandy shores (bridge puzzle, wet edition)
      const ponds = 2 + ((rng() * 2) | 0) + (level >= 5 ? 1 : 0) + Math.round(areaK);
      for (let i = 0; i < ponds; i++) {
        let done = false;
        for (let attempt = 0; attempt < 14 && !done; attempt++) {
          const lw = 4 + ((rng() * 4) | 0), lh = 3 + ((rng() * 3) | 0);
          const lx0 = 3 + ((rng() * Math.max(1, W - lw - 6)) | 0), ly0 = 3 + ((rng() * Math.max(1, H - lh - 6)) | 0);
          let clear = true;
          for (let y = ly0 - 1; y < ly0 + lh + 1 && clear; y++) for (let x = lx0 - 1; x < lx0 + lw + 1 && clear; x++) {
            if (!isFloor(at(x, y)) || nearCrit(x, y)) clear = false;
          }
          if (!clear) continue;
          for (let y = ly0; y < ly0 + lh; y++) for (let x = lx0; x < lx0 + lw; x++) set(x, y, T.WATER);
          const jy = ly0 + ((rng() * lh) | 0);
          for (let x = lx0 - 1; x <= lx0 + lw; x++) set(x, jy, T.PLANKS);
          done = true;
        }
      }
      patch(T.SAND, 1, 3, 3);
    }
    if (theme === "fungal") {
      patch(T.MOSS, 2, 4, 3 + ((rng() * 2) | 0));
      for (let i = 0, _sp = Math.round((6 + level) * Math.min(2.2, areaK)); i < _sp; i++) { // sporeling clusters
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, 1);
      }
    }
    if (theme === "crypt") {
      patch(T.BONE, 1, 3, 2 + ((rng() * 2) | 0) + (level >= 8 ? 2 : 0));
      // sarcophagi: stone slabs against room edges, never mid-corridor
      for (const ch of chambers) {
        if (ch.rw < 6 || ch.rh < 6 || rng() < 0.4) continue;
        const sx = ch.rx + 1 + ((rng() * Math.max(1, ch.rw - 4)) | 0);
        if (isFloor(at(sx, ch.ry + 1)) && isFloor(at(sx + 1, ch.ry + 1))) { set(sx, ch.ry + 1, T.STONEWALL); set(sx + 1, ch.ry + 1, T.STONEWALL); }
        else if (isFloor(at(sx, ch.ry + ch.rh - 2)) && isFloor(at(sx + 1, ch.ry + ch.rh - 2))) { set(sx, ch.ry + ch.rh - 2, T.STONEWALL); set(sx + 1, ch.ry + ch.rh - 2, T.STONEWALL); }
      }
      for (let i = 0, _rb = Math.round((4 + (level >> 1)) * Math.min(2.2, areaK)); i < _rb; i++) { // collapse rubble
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, T.RUBBLE);
      }
    }
    if (theme === "cavern") {
      patch(T.SAND, 2, 3, 2);
      for (let i = 0, _st = Math.round((3 + (level >> 1)) * Math.min(2.2, areaK)); i < _st; i++) { // underground streams
        let x = 3 + ((rng() * (W - 6)) | 0), y = 3 + ((rng() * (H - 6)) | 0);
        for (let s = 0; s < 5; s++) {
          if (at(x, y) !== DF || nearCrit(x, y)) break;
          set(x, y, T.WATER);
          x += (rng() * 3) | 0 - 1; y += rng() < 0.5 ? 1 : 0;
        }
      }
    }
    if (theme === "shadow" || theme === "abyss") {
      // crystal clusters: solid glow-stone, chamber-only, spaced so they
      // never seal (single tiles, off-center, never adjacent to each other)
      const crysN = Math.round(((theme === "abyss" ? 8 : 3) + (level >> 1)) * Math.min(2, areaK));
      let placed = 0, guard = 0;
      while (placed < crysN && guard++ < 60) {
        const ch = chambers[(rng() * chambers.length) | 0];
        if (!ch || ch.rw < 7 || ch.rh < 7) continue;
        const x = ch.rx + 2 + ((rng() * (ch.rw - 4)) | 0), y = ch.ry + 2 + ((rng() * (ch.rh - 4)) | 0);
        if (at(x, y) !== DF || nearCrit(x, y)) continue;
        if (Math.abs(x - (ch.rx + (ch.rw >> 1))) + Math.abs(y - (ch.ry + (ch.rh >> 1))) < 3) continue;
        let adj = false;
        for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
          const t = at(x + ox, y + oy);
          if (t === DW || t === T.CRYSTAL || t === T.STONEWALL) adj = true;
        }
        if (adj) continue;
        set(x, y, T.CRYSTAL);
        placed++;
      }
    }
    // ---- ten new grounds (v24): each a distinct visual + structural read ----
    if (theme === "library") {
      // shelf stacks: solid stone rows with a reading-aisle gap every 4 tiles
      for (const ch of chambers) {
        if (ch.rw < 9 || ch.rh < 7 || rng() < 0.35) continue;
        const rows = 1 + (rng() < 0.5 ? 1 : 0);
        for (let k = 0; k < rows; k++) {
          const y = ch.ry + 2 + k * 2;
          if (y >= ch.ry + ch.rh - 1) continue;
          for (let x = ch.rx + 2; x <= ch.rx + ch.rw - 3; x++) {
            if ((x - ch.rx) % 4 === 3) continue; // aisle gap
            if (!isFloor(at(x, y)) || nearCrit(x, y)) continue;
            set(x, y, T.STONEWALL);
          }
        }
      }
      for (let i = 0; i < 4 + (level >> 1); i++) { // scattered scrolls
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, 2);
      }
    }
    if (theme === "briar" || theme === "grove") {
      // living trunks: single solids in open ground, spaced so they never seal
      const trunkN = (theme === "grove" ? 6 : 4) + (level >> 2);
      for (let k = 0; k < trunkN; k++) {
        for (let attempt = 0; attempt < 40; attempt++) {
          let x, y;
          if (rng() < 0.5 && chambers.length) {
            const ch = chambers[(rng() * chambers.length) | 0];
            x = ch.rx + ((rng() * ch.rw) | 0); y = ch.ry + ((rng() * ch.rh) | 0);
          } else {
            x = 2 + ((rng() * (W - 4)) | 0); y = 2 + ((rng() * (H - 4)) | 0);
          }
          if (at(x, y) !== DF || nearCrit(x, y)) continue;
          let adj = false;
          for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
            const t = at(x + ox, y + oy);
            if (t === DW || t === T.STONEWALL || t === T.TREE || t === T.CRYSTAL) adj = true;
          }
          if (adj) continue;
          set(x, y, T.TREE);
          break;
        }
      }
      patch(1, 2, 3, theme === "grove" ? 4 : 3);
      if (theme === "grove") patch(T.MOSS, 2, 4, 3);
      for (let i = 0; i < 5 + (level >> 1); i++) { // wildflowers / glowcaps
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, 2);
      }
    }
    if (theme === "hive") {
      patch(T.WAX, 2, 4, 3 + ((rng() * 2) | 0));
      patch(T.SAND, 1, 2, 2);
      for (let i = 0; i < 6; i++) { // propolis columns + pollen flecks
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, rng() < 0.5 ? T.TOWNSTONE : 2);
      }
    }
    if (theme === "wreck") {
      patch(T.SAND, 2, 3, 3);
      // ship decks: plank rectangles with sandy rims, stamped on open ground
      const decks = 2 + (rng() < 0.5 ? 1 : 0);
      for (let i = 0; i < decks; i++) {
        let done = false;
        for (let attempt = 0; attempt < 12 && !done; attempt++) {
          const dw = 6 + ((rng() * 3) | 0), dh = 3 + ((rng() * 2) | 0);
          const dx0 = 3 + ((rng() * Math.max(1, W - dw - 6)) | 0), dy0 = 3 + ((rng() * Math.max(1, H - dh - 6)) | 0);
          let clear = true;
          for (let y = dy0 - 1; y < dy0 + dh + 1 && clear; y++) for (let x = dx0 - 1; x < dx0 + dw + 1 && clear; x++) {
            if (!isFloor(at(x, y)) || nearCrit(x, y)) clear = false;
          }
          if (!clear) continue;
          for (let y = dy0; y < dy0 + dh; y++) for (let x = dx0; x < dx0 + dw; x++) set(x, y, T.PLANKS);
          for (let x = dx0 - 1; x <= dx0 + dw; x++) {
            if (at(x, dy0 - 1) === DF) set(x, dy0 - 1, T.SAND);
            if (at(x, dy0 + dh) === DF) set(x, dy0 + dh, T.SAND);
          }
          done = true;
        }
      }
      for (let i = 0; i < 2; i++) { // bilge leaks: small ponds planked over
        let done = false;
        for (let attempt = 0; attempt < 10 && !done; attempt++) {
          const lw = 3 + ((rng() * 3) | 0), lh = 2 + ((rng() * 2) | 0);
          const lx0 = 3 + ((rng() * Math.max(1, W - lw - 6)) | 0), ly0 = 3 + ((rng() * Math.max(1, H - lh - 6)) | 0);
          let clear = true;
          for (let y = ly0 - 1; y < ly0 + lh + 1 && clear; y++) for (let x = lx0 - 1; x < lx0 + lw + 1 && clear; x++) {
            if (!isFloor(at(x, y)) || nearCrit(x, y)) clear = false;
          }
          if (!clear) continue;
          for (let y = ly0; y < ly0 + lh; y++) for (let x = lx0; x < lx0 + lw; x++) set(x, y, T.WATER);
          const jy = ly0 + ((rng() * lh) | 0);
          for (let x = lx0 - 1; x <= lx0 + lw; x++) set(x, jy, T.PLANKS);
          done = true;
        }
      }
    }
    if (theme === "mirror") {
      patch(T.ICE, 2, 3, 2 + ((rng() * 2) | 0));
      // mirror vanities: crystal runs along chamber edges, always gapped
      for (const ch of chambers) {
        if (rng() < 0.4) continue;
        if (ch.rw >= 7 && ch.rh >= 6) {
          const y = ch.ry + 1;
          for (let x = ch.rx + 2; x <= ch.rx + ch.rw - 3; x += 2) {
            if (!isFloor(at(x, y)) || nearCrit(x, y)) continue;
            set(x, y, T.CRYSTAL);
          }
        } else if (ch.rw >= 4 && ch.rh >= 4) {
          // closet-sized rooms get one corner stone (corners can't seal)
          const x = ch.rx + 1, y = ch.ry + 1;
          if (isFloor(at(x, y)) && !nearCrit(x, y)) set(x, y, T.CRYSTAL);
        }
      }
      // cramped maps: a few spaced singles so mirrors always glint
      for (let k = 0; k < 2; k++) {
        for (let attempt = 0; attempt < 30; attempt++) {
          const x = 3 + ((rng() * (W - 6)) | 0), y = 3 + ((rng() * (H - 6)) | 0);
          if (at(x, y) !== DF || nearCrit(x, y)) continue;
          let adj = false;
          for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
            const t = at(x + ox, y + oy);
            if (t === DW || t === T.CRYSTAL || t === T.STONEWALL) adj = true;
          }
          if (adj) continue;
          set(x, y, T.CRYSTAL);
          break;
        }
      }
    }
    if (theme === "storm") {
      for (const ch of chambers) { // lightning pillars first (need open DF)
        if (ch.rw < 8 || ch.rh < 8 || rng() < 0.4) continue;
        const nP = 2 + ((rng() * 3) | 0);
        for (let i = 0; i < nP; i++) {
          const px = ch.rx + 2 + ((rng() * (ch.rw - 4)) | 0), py = ch.ry + 2 + ((rng() * (ch.rh - 4)) | 0);
          if (at(px, py) !== DF || nearCrit(px, py)) continue;
          if (Math.abs(px - (ch.rx + (ch.rw >> 1))) + Math.abs(py - (ch.ry + (ch.rh >> 1))) < 2) continue;
          let adj = false;
          for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
            const t = at(px + ox, py + oy);
            if (t === DW || t === T.CRYSTAL || t === T.STONEWALL) adj = true;
          }
          if (adj) continue;
          set(px, py, DW);
        }
      }
      patch(T.TOWNSTONE, 2, 3, 3);
      for (let i = 0; i < 6; i++) {
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, T.RUBBLE);
      }
    }
    if (theme === "tomb") {
      patch(T.SAND, 2, 4, 3);
      patch(T.BONE, 1, 2, 2);
      // royal sarcophagi in nearly every grand chamber
      for (const ch of chambers) {
        if (ch.rw < 6 || ch.rh < 6 || rng() < 0.25) continue;
        const sx = ch.rx + 1 + ((rng() * Math.max(1, ch.rw - 4)) | 0);
        if (isFloor(at(sx, ch.ry + 1)) && isFloor(at(sx + 1, ch.ry + 1))) { set(sx, ch.ry + 1, T.STONEWALL); set(sx + 1, ch.ry + 1, T.STONEWALL); }
        else if (isFloor(at(sx, ch.ry + ch.rh - 2)) && isFloor(at(sx + 1, ch.ry + ch.rh - 2))) { set(sx, ch.ry + ch.rh - 2, T.STONEWALL); set(sx + 1, ch.ry + ch.rh - 2, T.STONEWALL); }
      }
      for (let i = 0; i < 6; i++) {
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, T.RUBBLE);
      }
    }
    if (theme === "clockwork") {
      // brass gear-grid: regular wall teeth in big chambers, never sealing
      let gearPlaced = 0;
      const gearN = 6 + (level >> 1);
      for (const ch of chambers) {
        if (ch.rw < 8 || ch.rh < 8) continue;
        for (let gy = ch.ry + 2; gy <= ch.ry + ch.rh - 3; gy += 4) {
          for (let gx = ch.rx + 2; gx <= ch.rx + ch.rw - 3; gx += 4) {
            if (Math.abs(gx - (ch.rx + (ch.rw >> 1))) + Math.abs(gy - (ch.ry + (ch.rh >> 1))) < 2) continue;
            if (at(gx, gy) !== DF || nearCrit(gx, gy)) continue;
            let adj = false;
            for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
              if (!ox && !oy) continue;
              const t = at(gx + ox, gy + oy);
              if (t === DW || t === T.CRYSTAL || t === T.STONEWALL) adj = true;
            }
            if (adj) continue;
            set(gx, gy, DW);
            gearPlaced++;
          }
        }
      }
      // maze maps have no grand chambers: top up with lone teeth in open ground
      for (let k = gearPlaced; k < gearN; k++) {
        for (let attempt = 0; attempt < 40; attempt++) {
          const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
          if (at(x, y) !== DF || nearCrit(x, y)) continue;
          let adj = false;
          for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
            if (!ox && !oy) continue;
            const t = at(x + ox, y + oy);
            if (t === DW || t === T.CRYSTAL || t === T.STONEWALL) adj = true;
          }
          if (adj) continue;
          set(x, y, DW);
          break;
        }
      }
      for (let i = 0; i < 6; i++) {
        const x = 2 + ((rng() * (W - 4)) | 0), y = 2 + ((rng() * (H - 4)) | 0);
        if (at(x, y) === DF && !nearCrit(x, y)) set(x, y, T.RUBBLE);
      }
    }
    if (theme === "flesh") {
      patch(T.FLESH, 2, 4, 3 + ((rng() * 2) | 0));
      patch(T.BONE, 1, 2, 2);
      // blood lakes with a pale spine across (the crossing)
      const lakes = 1 + (rng() < 0.5 ? 1 : 0) + (level >= 8 ? 1 : 0);
      for (let i = 0; i < lakes; i++) {
        let done = false;
        for (let attempt = 0; attempt < 14 && !done; attempt++) {
          const lw = 4 + ((rng() * 4) | 0), lh = 4 + ((rng() * 3) | 0);
          const lx0 = 3 + ((rng() * Math.max(1, W - lw - 6)) | 0), ly0 = 3 + ((rng() * Math.max(1, H - lh - 6)) | 0);
          let clear = true;
          for (let y = ly0 - 1; y < ly0 + lh + 1 && clear; y++) for (let x = lx0 - 1; x < lx0 + lw + 1 && clear; x++) {
            if (!isFloor(at(x, y)) || nearCrit(x, y)) clear = false;
          }
          if (!clear) continue;
          for (let y = ly0; y < ly0 + lh; y++) for (let x = lx0; x < lx0 + lw; x++) set(x, y, T.BLOOD);
          const jy = ly0 + ((rng() * lh) | 0);
          for (let x = lx0 - 1; x <= lx0 + lw; x++) set(x, jy, T.TOWNSTONE);
          done = true;
        }
        if (!done) { // cramped crypts: stamp small oozes so flesh always bleeds
          for (let k = 0; k < 2; k++) {
            for (let attempt = 0; attempt < 20; attempt++) {
              const ox = 3 + ((rng() * (W - 6)) | 0), oy = 3 + ((rng() * (H - 6)) | 0);
              let clear2 = true;
              for (let ay = 0; ay < 2 && clear2; ay++) for (let ax = 0; ax < 2 && clear2; ax++) {
                if (!isFloor(at(ox + ax, oy + ay)) || nearCrit(ox + ax, oy + ay)) clear2 = false;
              }
              if (!clear2) continue;
              // ring must be open floor: a 2x2 solid with a walkable
              // surround can never seal (there is always a way around it)
              let ring = true;
              for (let ay = -1; ay <= 2 && ring; ay++) for (let ax = -1; ax <= 2 && ring; ax++) {
                if (ax >= 0 && ax < 2 && ay >= 0 && ay < 2) continue;
                if (!isFloor(at(ox + ax, oy + ay))) ring = false;
              }
              if (!ring) continue;
              for (let ay = 0; ay < 2; ay++) for (let ax = 0; ax < 2; ax++) set(ox + ax, oy + ay, T.BLOOD);
              break;
            }
          }
        }
      }
    }
    // v17 hell set pieces: abyss grows bone spikes + crystal teeth, inferno
    // raises obsidian fangs around ember vents — all ring-checked singletons
    // so routes can never seal.
    if (theme === "abyss" || theme === "inferno") {
      const fang = theme === "abyss" ? T.CRYSTAL : T.STONEWALL;
      const spikes = theme === "abyss" ? 5 + ((rng() * 3) | 0) : 3 + ((rng() * 2) | 0);
      for (let k = 0; k < spikes; k++) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const ox = 3 + ((rng() * (W - 6)) | 0), oy = 3 + ((rng() * (H - 6)) | 0);
          if (!isFloor(at(ox, oy)) || nearCrit(ox, oy)) continue;
          let ring = true;
          for (let ay = -1; ay <= 1 && ring; ay++) for (let ax = -1; ax <= 1 && ring; ax++) {
            if (!ax && !ay) continue;
            if (!isFloor(at(ox + ax, oy + ay))) ring = false;
          }
          if (!ring) continue;
          set(ox, oy, fang);
          break;
        }
      }
      if (theme === "abyss") patch(T.BONE, 2, 3, 2 + ((rng() * 2) | 0));
      else patch(T.ASH, 2, 4, 2 + ((rng() * 2) | 0));
    }
    // ancient detail: the deep dark decorates everything (crystals, bone,
    // rubble, extra firelight) so depth feels earned
    if (level >= 8 && theme !== "abyss" && theme !== "shadow" && theme !== "mirror") {
      let placed = 0, guard = 0;
      while (placed < 3 && guard++ < 40) {
        const x = 3 + ((rng() * (W - 6)) | 0), y = 3 + ((rng() * (H - 6)) | 0);
        if (at(x, y) !== DF || nearCrit(x, y)) continue;
        let adj = false;
        for (let oy = -1; oy <= 1 && !adj; oy++) for (let ox = -1; ox <= 1 && !adj; ox++) {
          const t = at(x + ox, y + oy);
          if (t === DW || t === T.CRYSTAL) adj = true;
        }
        if (adj) continue;
        set(x, y, T.CRYSTAL);
        placed++;
      }
    }
    // legacy single-tile hazard pools (kept for ember/flooded shallow floors)
    const poolTile = theme === "ember" ? T.LAVA : theme === "flooded" ? T.WATER : null;
    if (poolTile && level < 5) {
      for (let i = 0; i < 5; i++) {
        const x = 3 + ((rng() * (W - 6)) | 0), y = 3 + ((rng() * (H - 6)) | 0);
        if (at(x, y) !== DF || nearCrit(x, y)) continue;
        let ok = true;
        for (let oy = -1; oy <= 1 && ok; oy++) for (let ox = -1; ox <= 1 && ok; ox++) if (!isFloor(at(x + ox, y + oy))) ok = false;
        if (ok) set(x, y, poolTile);
      }
    }
   // portal: boss-room corner, nudged onto real floor if decor took the tile
   let portalPos = { x: bossR.rx + 1, y: bossR.ry + 1 };
   if (!isFloor(at(portalPos.x, portalPos.y)) || (portalPos.x === bossPos.x && portalPos.y === bossPos.y)) {
     outer: for (let rad = 1; rad <= 3; rad++) for (let oy = -rad; oy <= rad; oy++) for (let ox = -rad; ox <= rad; ox++) {
       const x = bossPos.x + ox, y = bossPos.y + oy;
       if (isFloor(at(x, y)) && !(x === bossPos.x && y === bossPos.y)) { portalPos = { x, y }; break outer; }
     }
   }
    // FINAL GUARANTEE: every floor bakes a reachable way-down portal. Decor
    // solids (shelves / vanities / sarcophagi / gear teeth) are all gapped or
    // singleton-ringed and skip near-crit tiles, so this almost never fires —
    // but if any theme ever seals the boss wing, cut straight through here
    // rather than strand the way down on an unreachable tile.
    try {
      const _px = portalPos.x | 0, _py = portalPos.y | 0;
      if (_px >= 1 && _py >= 1 && _px < W - 1 && _py < H - 1) {
        if (!isFloor(at(_px, _py))) set(_px, _py, DF);
        portalPos = { x: _px, y: _py };
        const _rd = floodFrom(entrySeed.x, entrySeed.y);
        if (_rd[_py * W + _px] < 0) carveL(entrySeed.x, entrySeed.y, _px, _py, 1);
      }
    } catch (ePortalFix) {}
   // torches along walls — fire themes blaze, ice glimmers sparse, deep
   // crystal themes glow brighter
    const torchBase = { ember: 30, inferno: 34, shadow: 16, abyss: 30, glacier: 14, flooded: 20, library: 26, briar: 22, hive: 24, wreck: 20, mirror: 30, storm: 36, tomb: 26, clockwork: 32, flesh: 22, grove: 24 }[theme] ?? 24;
    const nT = Math.min(120, Math.round((torchBase + Math.min(12, level)) * Math.min(2.6, areaK)));
    for (let i = 0; i < nT; i++) {
      const x = 1 + ((rng() * (W - 2)) | 0), y = 1 + ((rng() * (H - 2)) | 0);
      if (at(x, y) !== DW) continue;
      if (at(x + 1, y) === DF || at(x - 1, y) === DF || at(x, y + 1) === DF || at(x, y - 1) === DF) tiles[y * W + x] = T.TORCH;
    }
    // chests: middle chambers + a vault cache in the second-farthest room
    // (+ a sealed deep vault past level 8). Chest tiles are nudged onto real
    // floor so lake stamps can never bury one inside a lava lake.
    const floorNear = (x, y) => {
      if (isFloor(at(x, y))) return { x, y };
      for (let rad = 1; rad <= 3; rad++) for (let oy = -rad; oy <= rad; oy++) for (let ox = -rad; ox <= rad; ox++) {
        if (isFloor(at(x + ox, y + oy))) return { x: x + ox, y: y + oy };
      }
      return null;
    };
    // Rule: chest count follows district count — big delves pay more caches
    // (spread across wings, never clustered at the start).
    const _midPool = chambers.filter((_, i) => i !== 0 && i !== bi);
    // spread: stride through the pool so caches land in different wings
    const mids = [];
    if (_midPool.length) {
      const want = Math.min(_midPool.length, 6 + ((rng() * 4) | 0));
      const stride = Math.max(1, Math.floor(_midPool.length / Math.max(1, want)));
      for (let k = 0, idx = 0; k < want && idx < _midPool.length; k++, idx += stride) mids.push(_midPool[idx % _midPool.length]);
      // top up from anywhere if striding under-filled
      for (let k = 0; mids.length < want && k < _midPool.length; k++) if (!mids.includes(_midPool[k])) mids.push(_midPool[k]);
    }
    const chests = [];
    // Mimic tiers by effective depth (delve remoteness + floors down): early
    // delves lie small, deep delves hunger big. Vault caches run one step
    // stronger. Returns a mob kind string or null (never a bare boolean, so
    // old `mimic:true` saves still read as the classic middle tooth).
    const mimicEffFor = () => {
      try {
        const ex = cx * 16 + 8, ey = cy * 16 + 8;
        const depth = Math.max(1, 1 + Math.floor(distOrigin(ex, ey) / 120));
        return Math.max(1, depth + (level | 0 || 1) - 1);
      } catch (e) { return Math.max(1, level | 0 || 1); }
    };
    const pickMimicKind = (tierRoll, eff, vault) => {
      let t = tierRoll;
      if (vault) t = Math.min(0.99, t * 0.75 + 0.18); // vaults hunger one step up
      if (eff <= 2) return t < 0.70 ? "lesser_mimic" : "mimic";
      if (eff <= 5) {
        if (t < 0.25) return "lesser_mimic";
        if (t < 0.75) return "mimic";
        return "greater_mimic";
      }
      if (eff <= 7) {
        if (t < 0.20) return "mimic";
        if (t < 0.70) return "greater_mimic";
        return "mimic_devourer";
      }
      if (t < 0.30) return "greater_mimic";
      return "mimic_devourer";
    };
    const eff0 = mimicEffFor();
    mids.forEach((rm, i) => {
      const spot = floorNear(rm.rx + 1, rm.ry + 1);
      // some dungeon chests are mimics: identical to look at, hungry inside.
      // Sealed deep vaults are always the real thing.
      if (spot) {
        const h = hash2(cx * 13 + i * 7, cy * 17 + level * 3);
        const kind = h < 0.22 ? pickMimicKind(hash2(cx * 31 + i * 13, cy * 37 + level * 5), eff0, false) : null;
        chests.push({ id: `${id}_ch${i}`, type: "chest", x: spot.x, y: spot.y, opened: false, loot: null, mimic: kind });
      }
    });
    if (chambers.length > 2) {
      let vi = -1, vd = -1;
      for (let i = 0; i < chambers.length; i++) {
        if (i === bi) continue;
        const c = center(chambers[i]);
        const d = (c.x - e0.x) * (c.x - e0.x) + (c.y - e0.y) * (c.y - e0.y);
        if (d > vd && d < bd) { vd = d; vi = i; }
      }
      if (vi >= 0) {
        const spot = floorNear(chambers[vi].rx + 1, chambers[vi].ry + 1);
        if (spot) {
          const h = hash2(cx * 19, cy * 23 + level);
          const kind = h < 0.15 ? pickMimicKind(hash2(cx * 43 + level * 7, cy * 47 + 3), eff0, true) : null;
          chests.push({ id: `${id}_chv`, type: "chest", x: spot.x, y: spot.y, opened: false, loot: null, mimic: kind });
        }
      }
      // deep delves seal a second vault in the boss room's far corner
      if (level >= 8) {
        const spot = floorNear(bossR.rx + bossR.rw - 2, bossR.ry + bossR.rh - 2);
        if (spot && !(spot.x === portalPos.x && spot.y === portalPos.y)) chests.push({ id: `${id}_chd`, type: "chest", x: spot.x, y: spot.y, opened: false, loot: "deep" });
      }
    }
    const [dName0, dLore0] = DUNGEON_NAMES[theme] || DUNGEON_NAMES.crypt;
    // v19 god-delve: the Supreme Overlord's special dungeon — same name every
    // level down, never a lying gate (the way down is always honest here).
    const dName = isGodDelve ? "Supreme Overlord's Dungeon" : dName0;
    const dLore = isGodDelve ? "The castle heart opens into the dark below. Something fallen waits at the end." : dLore0;
    // A few delves lie about the way down itself: the boss-room portal is a
    // Threshold Devourer wearing a 🌀. E (or a swing) shows the teeth — and
    // the real portal shimmers open behind them.
    let portalMimic = null;
    try {
      if (!isGodDelve && hash2(cx * 51 + level * 7, cy * 53 + level * 11) < 0.18) portalMimic = "portal_devourer";
    } catch (e) { portalMimic = null; }
    return { id, baseId: String(id).replace(/_L\d+$/, ""), cx, cy, level, name: dName, lore: dLore, theme, mode, w: W, h: H, tiles, rooms: chambers, entryPos, bossPos, portalPos, bossId: `${id}_boss`, chests, portalMimic, portalMimicRevealed: false, enriched: false, wallT: DW, floorT: DF, v: window.CFG.SAVE_VERSION };
  }
  // Portal guarantee for loaded saves: EVERY floor must have a reachable
  // way-down portal on walkable boss-room ground. Fresh bakes always set one
  // (see the genDungeonInterior final guarantee), but very old saves may lack
  // portalPos, hold one on a wall / hazard / out of bounds, share the boss
  // tile, or stand cut off from entry. Repair in place: pick boss-room ground,
  // stamp floor under it, and carve through if decor ever sealed the wing.
  function backfillPortal(d) {
    try {
      if (!d || typeof d !== "object") return false;
      const rooms = (Array.isArray(d.rooms) && d.rooms.length ? d.rooms : (Array.isArray(d.chambers) && d.chambers.length ? d.chambers : null));
      const W = d.w | 0, H = d.h | 0, tiles = d.tiles;
      const hasTiles = (W > 0 && H > 0 && tiles && tiles.length === W * H);
      // No tilemap (corrupt record): at least ensure a portal object exists.
      if (!hasTiles) {
        if (!d.portalPos && rooms && rooms.length) {
          const b = rooms[rooms.length - 1];
          d.portalPos = { x: (b.rx | 0) + 1, y: (b.ry | 0) + 1 };
          return true;
        }
        return false;
      }
      let SOLID = null, floorTile = null;
      try { SOLID = (window.CFG && window.CFG.SOLID) || null; } catch (eS) { SOLID = null; }
      try { floorTile = (d.floorT != null ? d.floorT : (d.tiles ? null : null)); } catch (eF) { floorTile = null; }
      if (floorTile == null) { try { floorTile = window.CFG.T.DFLOOR; } catch (eF2) { floorTile = 13; } }
      const inB = (x, y) => x >= 1 && y >= 1 && x < W - 1 && y < H - 1;
      const solidAt = (x, y) => {
        if (!inB(x, y)) return true;
        const t = tiles[y * W + x];
        try { if (SOLID && SOLID.has(t)) return true; } catch (e) { }
        // treat an unknown / null tile as solid so the portal never sits in it
        if (t == null) return true;
        return false;
      };
      const sameTile = (a, b) => !!(a && b && (a.x | 0) === (b.x | 0) && (a.y | 0) === (b.y | 0));
      // entry for the reachability flood (derive from rooms[0] if missing)
      let ex = null, ey = null;
      try {
        if (d.entryPos && isFinite(d.entryPos.x) && isFinite(d.entryPos.y)) { ex = d.entryPos.x | 0; ey = d.entryPos.y | 0; }
        else if (rooms && rooms.length) { ex = (rooms[0].rx | 0) + ((rooms[0].rw | 0) >> 1); ey = (rooms[0].ry | 0) + ((rooms[0].rh | 0) >> 1); }
      } catch (eE) { }
      const flood = (sx, sy) => {
        const dist = new Int32Array(W * H).fill(-1);
        if (sx == null || !inB(sx, sy) || solidAt(sx, sy)) return dist;
        const q = [sy * W + sx]; dist[sy * W + sx] = 0;
        let head = 0;
        while (head < q.length) {
          const cur = q[head++], cx0 = cur % W, cy0 = (cur / W) | 0, dd = dist[cur];
          if (cx0 > 1 && dist[cur - 1] < 0 && !solidAt(cx0 - 1, cy0)) { dist[cur - 1] = dd + 1; q.push(cur - 1); }
          if (cx0 < W - 2 && dist[cur + 1] < 0 && !solidAt(cx0 + 1, cy0)) { dist[cur + 1] = dd + 1; q.push(cur + 1); }
          if (cy0 > 1 && dist[cur - W] < 0 && !solidAt(cx0, cy0 - 1)) { dist[cur - W] = dd + 1; q.push(cur - W); }
          if (cy0 < H - 2 && dist[cur + W] < 0 && !solidAt(cx0, cy0 + 1)) { dist[cur + W] = dd + 1; q.push(cur + W); }
        }
        return dist;
      };
      const portalOk = (reach) => {
        try {
          const pp = d.portalPos;
          if (!pp || !isFinite(pp.x) || !isFinite(pp.y)) return false;
          const px = pp.x | 0, py = pp.y | 0;
          if (!inB(px, py) || solidAt(px, py)) return false;
          if (sameTile(pp, d.bossPos)) return false;
          if (reach && reach[py * W + px] < 0) return false;
          return true;
        } catch (e) { return false; }
      };
      let reach = null;
      try { reach = (ex != null) ? flood(ex, ey) : null; } catch (e) { reach = null; }
      if (portalOk(reach)) return false;
      // pick the boss room: the room holding bossPos, else farthest from entry
      let bossR = null;
      try {
        if (rooms && rooms.length) {
          if (d.bossPos && isFinite(d.bossPos.x)) {
            const bx = d.bossPos.x | 0, by = d.bossPos.y | 0;
            for (const r of rooms) {
              if (bx >= r.rx && bx < r.rx + r.rw && by >= r.ry && by < r.ry + r.rh) { bossR = r; break; }
            }
          }
          if (!bossR) {
            let bd = -1;
            const ax = (ex != null ? ex : 0), ay = (ey != null ? ey : 0);
            for (const r of rooms) {
              const cx0 = (r.rx | 0) + ((r.rw | 0) >> 1), cy0 = (r.ry | 0) + ((r.rh | 0) >> 1);
              const dd = (cx0 - ax) * (cx0 - ax) + (cy0 - ay) * (cy0 - ay);
              if (dd > bd) { bd = dd; bossR = r; }
            }
          }
          if (!bossR) bossR = rooms[rooms.length - 1];
        }
      } catch (e) { bossR = null; }
      const notBoss = (x, y) => {
        try { if (d.bossPos && (x | 0) === (d.bossPos.x | 0) && (y | 0) === (d.bossPos.y | 0)) return false; } catch (e) { }
        return true;
      };
      let spot = null;
      // 1) boss-room corner (the fresh-bake home)
      try {
        if (bossR) {
          const cx = (bossR.rx | 0) + 1, cy = (bossR.ry | 0) + 1;
          if (inB(cx, cy) && !solidAt(cx, cy) && notBoss(cx, cy)) spot = { x: cx, y: cy };
        }
      } catch (e) { }
      // 2) ring around the boss (stays in the boss wing, off the boss tile)
      if (!spot) {
        try {
          const bx = d.bossPos ? (d.bossPos.x | 0) : null, by = d.bossPos ? (d.bossPos.y | 0) : null;
          if (bx != null && by != null) {
            outer2: for (let rad = 1; rad <= 4; rad++) for (let oy = -rad; oy <= rad; oy++) for (let ox = -rad; ox <= rad; ox++) {
              const x = bx + ox, y = by + oy;
              if (!inB(x, y) || !notBoss(x, y) || solidAt(x, y)) continue;
              spot = { x, y }; break outer2;
            }
          }
        } catch (e) { }
      }
      // 3) sweep the boss room interior
      if (!spot && bossR) {
        try {
          for (let y = (bossR.ry | 0) + 1; y < (bossR.ry | 0) + (bossR.rh | 0) - 1 && !spot; y++) {
            for (let x = (bossR.rx | 0) + 1; x < (bossR.rx | 0) + (bossR.rw | 0) - 1 && !spot; x++) {
              if (!inB(x, y) || !notBoss(x, y) || solidAt(x, y)) continue;
              spot = { x, y };
            }
          }
        } catch (e) { }
      }
      // 4) any reachable floor on the map (prefer far from entry, like a boss wing)
      if (!spot && reach) {
        try {
          let bd2 = -1;
          for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
            if (solidAt(x, y) || !notBoss(x, y) || reach[y * W + x] < 0) continue;
            const dd = (ex != null) ? (x - ex) * (x - ex) + (y - ey) * (y - ey) : 0;
            if (dd > bd2) { bd2 = dd; spot = { x, y }; }
          }
        } catch (e) { }
      }
      // 5) last resort: boss-room corner stamped flat (even if it was a wall)
      if (!spot && bossR) spot = { x: (bossR.rx | 0) + 1, y: (bossR.ry | 0) + 1 };
      if (!spot) return false;
      d.portalPos = { x: spot.x | 0, y: spot.y | 0 };
      try { tiles[(spot.y | 0) * W + (spot.x | 0)] = floorTile; } catch (e) { }
      // sealed wing: cut the way down back to entry (H then V through rock)
      try {
        const r2 = flood(ex, ey);
        if (r2[(spot.y | 0) * W + (spot.x | 0)] < 0 && ex != null) {
          let x = ex, y = ey;
          const tx = spot.x | 0, ty = spot.y | 0;
          const carve = (cx, cy) => { if (cx >= 1 && cy >= 1 && cx < W - 1 && cy < H - 1) tiles[cy * W + cx] = floorTile; };
          while (x !== tx) { carve(x, y); x += Math.sign(tx - x); }
          while (y !== ty) { carve(x, y); y += Math.sign(ty - y); }
          carve(tx, ty);
        }
      } catch (e) { }
      return true;
    } catch (e) { }
    return false;
  }
  async function getDungeon(id, cx, cy, level = 1, dim) {
    level = Math.max(1, level | 0 || 1);
    dim = normDim(dim == null ? activeDim : dim);
    const baseId = String(id).replace(/_L\d+$/, "");
    const key = level > 1 ? baseId + "_L" + level : baseId;
   const memKey = dungeonMemKey(key, dim);
   const baseMemKey = dungeonMemKey(baseId, dim);
    if (mem.dungeons.has(memKey)) {
      const _h = mem.dungeons.get(memKey);
      try { mem.dungeons.delete(memKey); mem.dungeons.set(memKey, _h); } catch (e) {}
      // Mem-hit path used to skip every repair: an old record without (or
      // with a bad) portalPos stayed portal-less forever once cached.
      try {
        if (_h && backfillPortal(_h)) {
          try {
            const _slot = (_h._slot || activeSlot);
            const _dim = normDim(_h.dim || dim);
            try { _h.dim = _dim; } catch (eD) { }
            dungeonStore(_slot, _dim).set(key, _h).catch(() => { });
          } catch (eS) { }
        }
      } catch (eB) { }
      return _h;
    }
    // Legacy bare-key entry (pre-dim): adopt it if its dim matches.
    try {
      if (mem.dungeons.has(key)) {
        const _legacy = mem.dungeons.get(key);
        if (_legacy && normDim(_legacy.dim || "surf") === dim) {
          mem.dungeons.delete(key); memSet(mem.dungeons, memKey, _legacy, MEM_MAX.dungeons);
          try {
            if (_legacy && backfillPortal(_legacy)) {
              try {
                const _slot2 = (_legacy._slot || activeSlot);
                const _dim2 = normDim(_legacy.dim || dim);
                try { _legacy.dim = _dim2; } catch (eD2) { }
                dungeonStore(_slot2, _dim2).set(key, _legacy).catch(() => { });
              } catch (eS2) { }
            }
          } catch (eB2) { }
          return _legacy;
        }
      }
    } catch (e) {}
   const mySlot = activeSlot, myEpoch = epoch;
    let d = null;
     try { d = await dungeonStore(mySlot, dim).get(key); } catch (e) { }
    // Slot moved on while we waited: never hand back a detached unsaved
    // object (callers could mutate/save it into the wrong slot). Return the
    // stored record if we have one, else null so the caller aborts.
    if (activeSlot !== mySlot || epoch !== myEpoch) return d || null;
    if (!d) {
      // Synchronous generation reads the module dimension — set it for this
      // bake only (race-free: no await inside), then restore.
      const prevDim = activeDim; activeDim = dim;
      try { d = genDungeonInterior(key, cx ?? 0, cy ?? 0, level); }
      finally { activeDim = prevDim; }
      try { d.dim = dim; } catch (e) { }
      // deeper levels inherit the delve's true name/lore from level 1
      if (level > 1) {
        try {
          const base = mem.dungeons.get(baseMemKey) || await dungeonStore(mySlot, dim).get(baseId);
          if (base) {
            d.name = base.name || d.name; d.lore = base.lore || "";
            if (base.bossName) d.bossName = base.bossName;
            if (base.depth != null) d.depth = base.depth;
            d.enriched = !!base.enriched;
          }
        } catch (e) { }
      }
      try { await dungeonStore(mySlot, dim).set(key, d); } catch (e) { }
    }
    if (!d.dim) { try { d.dim = dim; } catch (e) { } }
    // depth was never assigned on older saves: derive dungeon tier from how
    // far the entrance lies from spawn (deeper dungeons lurk further out).
    // v19 god-delve: fixed depth 8 — Peter (eff 12+) waits on level 5, the
    // earlier floors muster other hell warlords on the way down.
    if (/_god(_L\d+)?$/.test(String(d.baseId || baseId || id || ""))) {
      try {
        if (d.depth !== 8) {
          d.depth = 8;
          try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e) { }
        }
        if (d.portalMimic) {
          d.portalMimic = null; d.portalMimicRevealed = false;
          try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e2) { }
        }
      } catch (e) { }
    } else if (d.depth == null) {
      try {
        const ex = (d.cx ?? cx ?? 0) * 16 + 8, ey = (d.cy ?? cy ?? 0) * 16 + 8;
        d.depth = Math.max(1, 1 + Math.floor(distOrigin(ex, ey) / 120));
        try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e) { }
      } catch (e) { d.depth = 1; }
    }
    if (d.level == null) d.level = level;
    if (!d.baseId) d.baseId = baseId;
    // old delves predate themes/modes: stamp them so pools + decor agree
    if (d.theme == null || d.mode == null) {
      try {
        if (d.theme == null) d.theme = dungeonThemeFor(d.cx ?? cx ?? 0, d.cy ?? cy ?? 0, d.level || level);
        if (d.mode == null) d.mode = 0;
        try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e) { }
      } catch (e) { if (d.theme == null) d.theme = "crypt"; if (d.mode == null) d.mode = 0; }
    }
    if (backfillPortal(d)) { try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e) { } }
    // hell delves wore overworld names before the hell weaver existed:
    // re-weave once (deterministic per delve) the records that were
    // enriched under the old pool. Bake-named delves ("Inferno Halls")
    // keep their names until natural enrichment renames them — same as
    // the surface. Deeper floors sync from the base on load (below), so
    // only level 1 needs the stamp. The god-delve is always the Supreme
    // Overlord's Dungeon: heal records that enrichment renamed under the
    // old pool (v204+ enrichment never touches it). Drowned mouths keep
    // their fixed names.
    if (dim === "hell" && level <= 1 && d && d.enriched && d.namePool !== "hell") {
      try {
        const _bid = String(baseId || "");
        if (/(_god)(_L\d+)?$/.test(_bid)) {
          let _fixed = false;
          if (d.name !== "Supreme Overlord's Dungeon") {
            d.name = "Supreme Overlord's Dungeon";
            d.lore = "The castle heart opens into the dark below. Something fallen waits at the end.";
            _fixed = true;
          }
          if (d.namePool !== "fixed") { d.namePool = "fixed"; _fixed = true; }
          if (_fixed) { try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e3) { } }
        } else if (!/(_w)(_L\d+)?$/.test(_bid)) {
          const _parts = _bid.replace(/^d_/, "").split("_");
          const _bcx = parseInt(_parts[0], 10) || 0, _bcy = parseInt(_parts[1], 10) || 0;
          const _seed = ((_bcx * 918273) ^ (_bcy * 127373)) | 0;
          const A = window.AIDirector;
          if (A && A.programmaticDungeonName) {
            d.name = String(A.programmaticDungeonName(_seed, true)).slice(0, 40);
            try {
              if (window.LorePool) d.lore = String(window.LorePool.get("hell_dungeon", "Ash drifts down like grey snow. The dark below is hungry.")).slice(0, 220);
            } catch (e2) {}
            d.namePool = "hell";
            try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e3) { }
          }
        } else if (d.namePool !== "fixed") {
          try { d.namePool = "fixed"; try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e4) {} } catch (e5) {}
        }
      } catch (e) { }
    }
    // old delves predate the lying gate: roll their portal once, persistently
    if (d.portalMimic === undefined) {
      try {
        const pcx = d.cx ?? cx ?? 0, pcy = d.cy ?? cy ?? 0, plv = d.level || level || 1;
        d.portalMimic = hash2(pcx * 51 + plv * 7, pcy * 53 + plv * 11) < 0.18 ? "portal_devourer" : null;
        d.portalMimicRevealed = false;
        try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e) { }
      } catch (e) { try { d.portalMimic = null; d.portalMimicRevealed = false; } catch (e2) { } }
    }
    // deeper floors track the delve's true name if the AI dreamed it later
    if (level > 1) {
      try {
        const _bdim = normDim(d.dim || dim);
        const base = mem.dungeons.get(dungeonMemKey(baseId, _bdim)) || await dungeonStore(mySlot, d.dim || dim).get(baseId);
        if (base && base.enriched && d.name !== base.name) {
          d.name = base.name; d.lore = base.lore || "";
          if (base.bossName) d.bossName = base.bossName;
          d.enriched = true;
          try { await dungeonStore(mySlot, d.dim || dim).set(key, d); } catch (e) { }
        }
      } catch (e) { }
    }
    try { d._slot = mySlot; } catch (e) { }
    try { memSet(mem.dungeons, dungeonMemKey(key, d.dim || dim), d, MEM_MAX.dungeons); } catch (e) {}
    // only the first level gets an AI name — deeper floors share it
    if (!d.enriched && level <= 1) setTimeout(() => {
      if (activeSlot !== mySlot || epoch !== myEpoch) return;
      try { window.AIDirector && window.AIDirector.enrichDungeon(baseId, mySlot, myEpoch, d.dim || dim); } catch (e) { }
    }, 600);
    return d;
  }
  async function saveDungeon(d, slot) {
    if (slot == null) slot = storeSlotOf(d);
    else { slot = String(slot); try { d._slot = slot; } catch (e) { } }
    let ddim = "surf";
    try { ddim = normDim(d.dim != null ? d.dim : activeDim); } catch (e) { ddim = "surf"; }
    try { if (!d.dim) d.dim = ddim; } catch (e) { }
    if (slot === activeSlot) memSet(mem.dungeons, dungeonMemKey(d.id, ddim), d, MEM_MAX.dungeons);
    try { await dungeonStore(slot, ddim).set(d.id, d); } catch (e) { }
  }

  // ---- npcs ----
  async function getNpc(id) {
    if (mem.npcs.has(id)) { const _h = mem.npcs.get(id); try { mem.npcs.delete(id); mem.npcs.set(id, _h); } catch (e) {} return _h; }
    let n = null; try { n = await npcStore().get(id); } catch (e) { }
    // Stamp at load: whoever this object belongs to, the stamp keeps later
    // saves routed to the right slot even if the world switched meanwhile.
    if (n) { try { n._slot = activeSlot; } catch (e) { } memSet(mem.npcs, id, n, MEM_MAX.npcs); }
    return n;
  }
  async function saveNpc(n, slot) {
    if (!n) return;
    // Tames persist inside the player save (player.tames), never as NPCs.
    // Refuse them here so kill/XP/loot paths can never leak a beast into the
    // NPC store (where it would render, fight XP-share, and chat as a villager).
    if (n.isTame) return;
    // Never persist half-baked records (no id/role): they render as a nameless
    // "Villager" with broken stats (1 HP, undefined class) and can never be
    // repaired. Callers must mint id/role via makeNpcObject (which now
    // defaults both, so legacy callers that omit them still produce valid NPCs).
    try {
      if (typeof n.id !== "string" || !n.id || n.id === "undefined") return;
      if (typeof n.role !== "string" || !n.role || n.role === "undefined" || n.role === "mob") return;
    } catch (e) { return; }
    if (slot == null) slot = storeSlotOf(n);
    else { slot = String(slot); try { n._slot = slot; } catch (e) { } }
    if (slot === activeSlot) memSet(mem.npcs, n.id, n, MEM_MAX.npcs);
    // Never persist the live combat pointer: it would embed whole entities
    // (even the player) into every NPC record and resurrect as a stale
    // snapshot on load. resolveTarget() rebuilds it from targetId instead.
    // (Shallow copy — the live object keeps fighting.)
    let clean = n;
    try {
      if (n.targetRef) clean = { ...n, targetRef: null }; else clean = { ...n };
      // v18: backfill the dimension stamp (old records predate it). Surf and
      // hell share coordinates (v19), so position (incl. the retired
      // 16000,0 disc) can never tell sides apart — trusting it mis-stamped
      // surf villagers near 16000,0 as hell (turning them demonic). Unstamped
      // records belong to the world they are saved in.
      try {
        if (clean.dim !== "hell" && clean.dim !== "surf") {
          clean.dim = normDim(activeDim);
        }
      } catch (e2) {}
      // Same as the player save: performance.now() timers must not persist
      // across reloads or NPC spells lock up for minutes on next load.
      clean.cooldowns = {};
      clean.buffs = {};
      clean.slowUntil = 0; clean.burnUntil = 0; clean.burnTick = 0;
      clean.hostileUntil = 0; clean.atkCd = 0; clean.aidCd = 0;
      // Hit-flash / attack-pose / death-fall / status visuals are
      // performance.now() timestamps too — a save written mid-flash would
      // otherwise reload as a near-permanent white box (see stripCombatPtr).
      clean.hurtUntil = 0; clean.hurtAng = 0;
      clean.atkUntil = 0; clean.atkKind = null; clean.atkDur = 0;
      clean._deadAt = 0; clean._statusFlashUntil = 0; clean._statusFlashColor = null;
      clean.status = {};
    } catch (e) { clean = n; }
    try { await npcStore(slot).set(n.id, clean); } catch (e) { }
  }
  async function allNpcs() {
    // Merge persisted NPCs every call: mem only holds visited chunks, so an
    // early-return here would hide stored-but-unloaded villagers from
    // uniqueness checks and the nearby-NPC cache.
    // Slot-guarded: a switch mid-read discards the merge instead of mixing
    // two worlds' villagers in mem.
    const mySlot = activeSlot, myEpoch = epoch;
    try {
      const e = await npcStore(mySlot).entries();
      if (activeSlot !== mySlot || epoch !== myEpoch) return [...mem.npcs.values()].filter(n => n && !n.isTame);
      for (const [k, v] of (e || [])) if (v && !mem.npcs.has(k)) { try { v._slot = mySlot; } catch (err2) { } memSet(mem.npcs, k, v, MEM_MAX.npcs); }
    } catch (err) { }
    // Evict old leaks: beasts saved as NPCs before the saveNpc guard (they
    // render, XP-share, and chat as villagers — incl. the ridden mount at
    // distance 0 stealing every E press). Delete from mem + store.
    try {
      const badKeys = [];
      for (const [k, v] of mem.npcs) {
        let bad = false;
        try {
          if (!v) bad = true;
          else if (v.isTame) bad = true;
          else if (typeof v.id !== "string" || !v.id || v.id === "undefined") bad = true;
          else if (typeof v.role !== "string" || !v.role || v.role === "undefined" || v.role === "mob") bad = true;
        } catch (e) { bad = true; }
        if (bad) badKeys.push([k, v]);
      }
      for (const [k, v] of badKeys) {
        try { mem.npcs.delete(k); } catch (err2) { }
        // storage key is the record's id (encKey(undefined)="j:undefined"),
        // NOT the mem key (which may be the decoded "j:undefined" string).
        // Delete by both; missing keys are no-ops. Also sweep any second
        // mem key pointing at the same bad object (undefined + "j:undefined"
        // duality from the old JSON store).
        try { const r = npcStore(mySlot).delete(k); if (r && r.catch) r.catch(() => { }); } catch (err2) { }
        try {
          const vid = v && v.id;
          if (vid !== k) { const r2 = npcStore(mySlot).delete(vid); if (r2 && r2.catch) r2.catch(() => { }); }
        } catch (err2) { }
        try {
          // bare undefined storage key (the actual bad record): encKey(undefined)
          const r3 = npcStore(mySlot).delete(undefined); if (r3 && r3.catch) r3.catch(() => { }); 
        } catch (err2) { }
      }
      // second mem key, same object (undefined + "j:undefined" duality)
      try {
        const seenBad = new Set(badKeys.map(([, v]) => v));
        for (const [k2, v2] of [...mem.npcs]) {
          if (seenBad.has(v2)) {
            try { mem.npcs.delete(k2); } catch (e) {}
            try { const r = npcStore(mySlot).delete(k2); if (r && r.catch) r.catch(() => { }); } catch (e) {}
          }
        }
      } catch (e) {}
    } catch (err) { }
    return [...mem.npcs.values()].filter(n => {
      try {
        if (!n || n.isTame) return false;
        if (typeof n.id !== "string" || !n.id || n.id === "undefined") return false;
        if (typeof n.role !== "string" || !n.role || n.role === "undefined" || n.role === "mob") return false;
        return true;
      } catch (e) { return false; }
    });
  }
  // Merge every persisted chunk/npc/dungeon for the ACTIVE slot into mem.
  // Stores are slot-scoped (wchunks_sN / wnpcs_sN / wdungeons_sN), so a
  // deleted slot's keys are gone and can never leak in here. Call before any
  // uniqueness scan so stored-but-unloaded villagers count too.
  async function ensureMemLoaded() {
    const mySlot = activeSlot, myEpoch = epoch;
    try {
      // v21: map-bulk loads are dim-local. The Known world shows the hero's
      // dimension only, and bulk-merging every dim's store (1200+ chunks)
      // overflowed the 600-cap FIFO and evicted the LIVE ground — the map
      // then rendered fog/foreign pins instead of the current world.
      // Foreign dims stream in live through getChunk whenever played.
      const dimNow = normDim(activeDim);
      const [ce, ne, deSurf, deHell] = await Promise.all([
        (async () => {
          let out = [];
          try { out = out.concat((await chunkStore(mySlot, dimNow).entries().catch(() => [])) || []); } catch (e) { }
          return out;
        })(),
        npcStore(mySlot).entries().catch(() => []),
        dungeonStore(mySlot, "surf").entries().catch(() => []),
        dungeonStore(mySlot, "hell").entries().catch(() => []),
      ]);
      // Slot moved on (switch / delete / new game) mid-read: discard, so two
      // worlds' objects never mix in mem or in a uniqueness scan.
      if (activeSlot !== mySlot || epoch !== myEpoch) return;
      for (const [k, v] of (ce || [])) if (v && !mem.chunks.has(k)) { try { v._slot = mySlot; } catch (e2) { } memSet(mem.chunks, k, v, MEM_MAX.chunks); }
      for (const [k, v] of (ne || [])) {
        // skip + purge half-baked records (no id/role): they used to merge in
        // and surface as a nameless "Villager" with broken stats.
        let bad = false;
        try {
          if (!v || v.isTame) bad = true;
          else if (typeof v.id !== "string" || !v.id || v.id === "undefined") bad = true;
          else if (typeof v.role !== "string" || !v.role || v.role === "undefined" || v.role === "mob") bad = true;
        } catch (e) { bad = true; }
        if (bad) {
          try { const r = npcStore(mySlot).delete(k); if (r && r.catch) r.catch(() => { }); } catch (e2) {}
          try {
            const vid = v && v.id;
            if (vid !== k) { const r2 = npcStore(mySlot).delete(vid); if (r2 && r2.catch) r2.catch(() => { }); }
          } catch (e2) {}
          try { const r3 = npcStore(mySlot).delete(undefined); if (r3 && r3.catch) r3.catch(() => { }); } catch (e2) {}
          continue;
        }
        if (v && !mem.npcs.has(k)) { try { v._slot = mySlot; } catch (e2) { } memSet(mem.npcs, k, v, MEM_MAX.npcs); }
      }
      // v18: dungeon mem keys are dim-namespaced ("surf:d_0_0"), since both
      // dims mint the same bare ids for the same coordinates.
      for (const [k, v] of (deSurf || [])) { const mk = dungeonMemKey(k, "surf"); if (v && !mem.dungeons.has(mk)) { try { v._slot = mySlot; } catch (e2) { } memSet(mem.dungeons, mk, v, MEM_MAX.dungeons); } }
      for (const [k, v] of (deHell || [])) { const mk = dungeonMemKey(k, "hell"); if (v && !mem.dungeons.has(mk)) { try { v._slot = mySlot; } catch (e2) { } memSet(mem.dungeons, mk, v, MEM_MAX.dungeons); } }
    } catch (e) { }
  }

  // The Dark Castle is one named place: heal hell-heart chunks that were
  // named by the pastoral weaver before it had its own name (old saves read
  // "Hazelden" + town small-talk on the castle sign). Sets Dark Castle +
  // castle voice + sign text; stored tiles/POIs are untouched. Only touches
  // the currently loaded chunks; call wherever backfillHearthPortals runs.
  async function backfillCastleHeart() {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks) return;
      for (const ch of G.chunks.values()) {
        try {
          if (!ch || ch.settlementType !== "hell_castle") continue;
          if (!Array.isArray(ch.pois)) continue;
          let changed = false;
          if (ch.placeName !== "Dark Castle") { ch.placeName = "Dark Castle"; changed = true; }
          for (const poi of ch.pois) {
            if (poi && poi.type === "sign" && poi.text !== ch.placeName) { poi.text = ch.placeName; changed = true; }
          }
          try {
            if (window.LorePool) {
              const seed = ((ch.cx * 73856093) ^ (ch.cy * 19349663)) | 0;
              const want = window.LorePool.loreForChunk(ch.biome, "hell_castle", seed);
              if (want && ch.lore !== want) { ch.lore = want; changed = true; }
            }
          } catch (e) { }
          if (changed) { try { await saveChunk(ch); } catch (e) { } }
        } catch (e) { }
      }
    } catch (e) { }
  }

  // Backfill hearth portals into already-generated chunks that lack one
  // (old saves, or chunks dreamed before portals existed). Only touches the
  // currently loaded chunks; call after the player arrives somewhere.
  async function backfillHearthPortals() {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.chunks) return;
      for (const ch of G.chunks.values()) {
        try {
          if (!ch || !Array.isArray(ch.tiles) || !Array.isArray(ch.pois)) continue;
          if (ch.pois.some(p => p && p.type === "portal")) continue;
          const gx0 = ch.cx * CHUNK, gy0 = ch.cy * CHUNK;
          const hosts = portalHostsForChunk(ch.cx, ch.cy);
          if (!hosts.length) continue;
          let added = false;
          for (const hostS of hosts) {
            const spot = portalSpot(gx0, gy0, ch.tiles, hostS, ch.pois);
            if (!spot) continue;
            if (ch.pois.some(p => p && p.type === "portal" && p.gx === spot.gx && p.gy === spot.gy)) continue;
            ch.pois.push({ id: `portal_${hostS.cx}_${hostS.cy}`, type: "portal", lx: spot.lx, ly: spot.ly, gx: spot.gx, gy: spot.gy });
            added = true;
          }
          if (added) { try { await saveChunk(ch); } catch (e) { } }
        } catch (e) { }
      }
    } catch (e) { }
  }

  // Channel hero records: the MP hero lives on its own machine (kv psave key
  // chero_<CHANNEL>_<hash>), never on a server. The host's copy
  // (+ its channel chunk/npc/dungeon folders) IS the world, Minecraft-style.
  function chanHeroKey(id, hash) {
    id = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
    hash = String(hash || "").toLowerCase();
    return "chero_" + id + "_" + hash;
  }
  async function deleteChannelHero(id, hash) {
    try {
      const k = chanHeroKey(id, hash);
      if (/^chero_[A-Z0-9]{6,16}_[0-9a-f]{16,64}$/.test(k)) {
        try { await saveStore().delete(k); } catch (e) { }
      }
      return true;
    } catch (e) { return false; }
  }
  // Delete a whole channel world cache on THIS machine (host save or joiner
  // cache): wchunks/wnpcs/wdungeons folders for the channel id. Heroes are
  // separate records (see deleteChannelHero) — callers remove those too.
  async function deleteChannelWorld(id) {
    try {
      id = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
      if (!/^[A-Z0-9]{6,16}$/.test(id)) return false;
      const folders = [`wchunks_ch_${id}`, `wchunks_ch_${id}_hell`, `wchunks_ch_${id}_heaven`, `wnpcs_ch_${id}`, `wdungeons_ch_${id}`, `wdungeons_ch_${id}_hell`, `wdungeons_ch_${id}_heaven`];
      for (const fname of folders) {
        try {
          const st = kvFolder(fname);
          let ks = [];
          try { ks = await st.keys(); } catch (e) { ks = []; }
          for (const k of (ks || [])) { try { await st.delete(k); } catch (e) { } }
        } catch (e) { }
      }
      return true;
    } catch (e) { return false; }
  }

  // ---- world rebuild (migration for pre-v15 saves) ----
  // Old world constructions are retired (v15 tiers services/castles): an old
  // of the new world, so loading one wipes its terrain stores (chunks +
  // dungeons) and rebuilds fresh ground around the hero's starting town.
  // Every NPC stays, and the hero record is otherwise untouched: stats,
  // XP/levels, abilities, spells, techniques, inventory, equipment, hotbar,
  // gold, tames, quests, delve charts, party, inn rooms, torches and known
  // places all survive — only dungeon state + world position reset, with
  // companions re-anchored at the hero and full HP/MP.
  // Wipe every world store for a singleplayer slot (chunks + npcs +
  // dungeons) and invalidate in-flight flows. Hero records (psave) stay.
  async function wipeSlotWorld(s) {
    s = String(s || activeSlot || "1");
    if (!/^[1-5P]$/.test(s)) return false;
    try {
      // v18: wipe both dimension stores plus shared NPCs.
      const stores = [chunkStore(s, "surf"), chunkStore(s, "hell"), chunkStore(s, "heaven"), npcStore(s), dungeonStore(s, "surf"), dungeonStore(s, "hell"), dungeonStore(s, "heaven")];
      for (const st of stores) {
        let ks = []; try { ks = await st.keys(); } catch (e) { ks = []; }
        for (const k of (ks || [])) { try { await st.delete(k); } catch (e) { } }
      }
    } catch (e) { }
    if (s === activeSlot) bumpEpoch();
    return true;
  }
  // The origin hearth kind must always be a real settlement type. Old saves
  // predate it (or carry the retired "spawn" value) — keep a valid existing
  // choice, otherwise roll one like a new game. Returns true when changed.
  function ensureSpawnIdentity(player) {
    try {
      if (player && player.spawnType && SETTLE_DEF[player.spawnType]) {
        if (!player.spawnName || typeof player.spawnName !== "string") {
          try {
            const pools = (window.CFG && window.CFG.SPAWN_NAMES) || {};
            const pool = (pools[player.spawnType] && pools[player.spawnType].length) ? pools[player.spawnType] : [player.spawnType];
            player.spawnName = pool[(Math.random() * pool.length) | 0] || player.spawnType;
          } catch (e) { player.spawnName = player.spawnType; }
          return true;
        }
        return false;
      }
      const types = (window.CFG && window.CFG.SPAWN_TYPES) || ["town"];
      const st = types[(Math.random() * types.length) | 0] || "town";
      player.spawnType = st;
      try {
        player.spawnName = (window.Names && window.Names.settlement(st, (Math.random() * 0x7fffffff) | 0)) || st;
      } catch (e) {
        try {
          const pools = (window.CFG && window.CFG.SPAWN_NAMES) || {};
          const pool = (pools[st] && pools[st].length) ? pools[st] : [st];
          player.spawnName = pool[(Math.random() * pool.length) | 0] || st;
        } catch (e2) { player.spawnName = st; }
      }
      return true;
    } catch (e) { return false; }
  }
  // Rebuild an old save's world in place: wipe TERRAIN ONLY (chunks +
  // dungeons), fix the spawn identity, and reset world-bound hero state.
  // Nothing else is wiped: the full NPC store survives (party, inn guests
  // AND townsfolk — stale settlement claims self-heal via
  // Schedule.ensureNpc once the new chunks bake), and everything on the
  // player object (stats, gear, spells, tames, quests, gold, charts, party,
  // inn rooms, torches, known places) is preserved byte-for-byte — only the
  // hero's dungeon state + world position reset (old coordinates belong to
  // the retired ground) with full HP/MP. Returns true when a rebuild happened.
  async function rebuildOldWorld(slot, player) {
    slot = String(slot || activeSlot || "1");
    if (!/^[1-5P]$/.test(slot)) return false;
    if (!player || typeof player !== "object") return false;
    // Hero progression (incl. allocated skill-point ranks) survives the rebuild
    // byte-for-byte: snapshot it up front and restore anything that went
    // missing, so terrain resets can never wipe builds.
    const keepProg = (() => {
      try {
        const deep = (o) => {
          if (!o || typeof o !== "object") return o;
          const c = {};
          for (const k of Object.keys(o)) {
            const v = o[k];
            c[k] = (v && typeof v === "object" && !Array.isArray(v)) ? { ...v } : (Array.isArray(v) ? [...v] : v);
          }
          return c;
        };
        return {
          spellPerks: player.spellPerks ? deep(player.spellPerks) : player.spellPerks,
          weaponPerks: player.weaponPerks ? deep(player.weaponPerks) : player.weaponPerks,
          treePts: player.treePts ? { ...player.treePts } : player.treePts,
          treeProg: player.treeProg ? { ...player.treeProg } : player.treeProg,
          skillPoints: player.skillPoints, statPoints: player.statPoints,
          stats: player.stats ? { ...player.stats } : player.stats,
          techniques: Array.isArray(player.techniques) ? [...player.techniques] : player.techniques,
          unlocked: Array.isArray(player.unlocked) ? [...player.unlocked] : player.unlocked,
          techXp: player.techXp ? JSON.parse(JSON.stringify(player.techXp)) : player.techXp,
        };
      } catch (e) { return null; }
    })();
    // Terrain-only wipe: baked chunks + delves go, every NPC stays.
    try {
      for (const st of [chunkStore(slot, "surf"), chunkStore(slot, "hell"), chunkStore(slot, "heaven"), dungeonStore(slot, "surf"), dungeonStore(slot, "hell"), dungeonStore(slot, "heaven")]) {
        let ks = []; try { ks = await st.keys(); } catch (e) { ks = []; }
        for (const k of (ks || [])) { try { await st.delete(k); } catch (e) { } }
      }
    } catch (e) { }
    if (slot === activeSlot) bumpEpoch();
    ensureSpawnIdentity(player);
    // v19 parallel universes: the old far-off hell continent (16000,0) is
    // retired — hell now mirrors the surface at the same coordinates. Every
    // hero wakes on the surface; hell is re-entered through the towers.
    try {
      player.dim = "surf";
      player.posByDim = { surf: { x: 2.5, y: 4.5 }, hell: null };
      player.hellSpawn = null;
    } catch (e) {}
    // Stale hell-tower pins (old 16xxx,0 numbers) would chart teleport dots
    // into the void — keep only pins that match the current tower lists.
    try {
      const validPins = new Set();
      try {
        const H = window.Hell;
        for (const tw of ((H && H.SURFACE_TOWERS) || []).concat((H && H.HELL_TOWERS) || [])) {
          validPins.add("Hell Tower 🗼 " + (tw.x | 0) + "," + (tw.y | 0));
        }
      } catch (e2) {}
      if (Array.isArray(player.seenPlaces)) {
        player.seenPlaces = player.seenPlaces.filter(nm => {
          if (typeof nm !== "string") return true;
          if (nm.indexOf("Hell Tower 🗼") !== 0) return true;
          return validPins.has(nm);
        });
      }
    } catch (e) {}
    // Orphaned hell-dim townsfolk belonged to the retired continent's demon
    // holds — delete them so they can't strand in the void. Party + inn
    // guests are re-anchored to the hero below, so those are kept.
    try {
      const keep = new Set();
      try { for (const id of (player.party || [])) if (id) keep.add(id); } catch (e2) {}
      try { for (const id of (player.innRooms || [])) if (id) keep.add(id); } catch (e2) {}
      const st = npcStore(slot);
      let ks = []; try { ks = await st.keys(); } catch (e2) { ks = []; }
      for (const k of (ks || [])) {
        if (keep.has(k)) continue;
        try {
          const n = await st.get(k);
          if (!n) continue;
          // stamped hell-dim records, plus unstamped records standing on the
          // retired continent (old hell holds at 16000,0 — no surf NPC can
          // live in that ocean), are orphaned by the relocation.
          let orphan = n.dim === "hell";
          if (!orphan) {
            try {
              const nx = (n.gx ?? n.x ?? n.homeGx), ny = (n.gy ?? n.y ?? n.homeGy);
              if (nx != null && ny != null && Math.hypot(+nx - 16000, +ny) < 3550) orphan = true;
            } catch (e4) {}
          }
          if (orphan) { try { await st.delete(k); } catch (e3) {} }
        } catch (e2) {}
      }
    } catch (e) {}
    try {
      player.inDungeon = null; player.dungeonLevel = 1;
      player.x = 2.5; player.y = 4.5;
      player.hp = player.maxHp; player.mp = player.maxMp;
      try { if (window.Status) window.Status.cureAll(player); } catch (e2) { }
      // Old hearth binding points into the retired ground — drop it so the
      // hero wakes at the starting town instead of inside new walls.
      try { if (player.homeHearth) delete player.homeHearth; } catch (e2) { }
      // party / innRooms / torches / seenPlaces are NOT wiped: companions
      // are re-anchored below, fixtures and memories stay.
      try {
        if (player.spawnName && Array.isArray(player.seenPlaces) && !player.seenPlaces.includes(player.spawnName)) {
          player.seenPlaces.push(player.spawnName);
        }
      } catch (e2) { }
    } catch (e) { }
    // Re-anchor travelling companions + inn guests at the hero (they belong
    // to the player, not the retired ground): clear their old settlement
    // claims so the schedule re-deals them in the new world. Townsfolk keep
    // their records untouched and heal lazily via ensureNpc.
    try {
      const ids = new Set();
      try { for (const id of (player.party || [])) if (id) ids.add(id); } catch (e2) {}
      try { for (const id of (player.innRooms || [])) if (id) ids.add(id); } catch (e2) {}
      if (ids.size) {
        const partySet = new Set();
        try { for (const id of (player.party || [])) if (id) partySet.add(id); } catch (e2) {}
        const st = npcStore(slot);
        const keptIds = new Set();
        let i = 0;
        for (const id of ids) {
          try {
            let n = null;
            try { if (mem.npcs.has(id)) n = mem.npcs.get(id); } catch (e3) {}
            if (!n) { try { n = await st.get(id); } catch (e3) { n = null; } }
            if (!n || n.isTame) continue;
            try { n._slot = slot; } catch (e3) {}
            const ox = (i % 4) * 0.7, oy = (i % 2 ? 0.8 : -0.8); i++;
            n.x = player.x + 1 + ox; n.y = player.y + oy; n.gx = n.x; n.gy = n.y;
            n.homeGx = n.gx; n.homeGy = n.gy;
            n.chunkKey = null; n.settleKey = null; n.home = null; n.work = null;
            n.nightDuty = false; n.sleeping = false;
            n.placeName = player.spawnName || n.placeName;
            n.targetId = null; n.targetRef = null; n.hostileUntil = 0; n.deadUntil = null; n.aggro = false;
            try { n.lastSeen = Date.now(); } catch (e3) {}
            // enforce roster flags from the player lists (heals corrupt shapes)
            if (partySet.has(n.id)) { n.inParty = true; n.inInn = false; }
            else { n.inInn = true; n.inParty = false; }
            try { if (window.Schedule) window.Schedule.ensureNpc(n); } catch (e3) {}
            await st.set(n.id, n);
            try { mem.npcs.set(n.id, n); } catch (e3) {}
            keptIds.add(n.id);
          } catch (e3) {}
        }
        try {
          player.party = (player.party || []).filter(id => keptIds.has(id));
          if (Array.isArray(player.innRooms)) {
            player.innRooms = player.innRooms.map(id => (id && !keptIds.has(id)) ? null : id);
          }
        } catch (e2) {}
      }
    } catch (e) {}
    // Restore anything the reset above may have dropped: allocated ranks,
    // unspent pools and technique progress always survive a rebuild.
    try {
      if (keepProg) {
        if (keepProg.spellPerks && (!player.spellPerks || typeof player.spellPerks !== "object")) player.spellPerks = keepProg.spellPerks;
        if (keepProg.weaponPerks && (!player.weaponPerks || typeof player.weaponPerks !== "object")) player.weaponPerks = keepProg.weaponPerks;
        if (keepProg.treePts && (!player.treePts || typeof player.treePts !== "object")) player.treePts = keepProg.treePts;
        if (keepProg.treeProg && (!player.treeProg || typeof player.treeProg !== "object")) player.treeProg = keepProg.treeProg;
        if (typeof keepProg.skillPoints === "number" && typeof player.skillPoints !== "number") player.skillPoints = keepProg.skillPoints;
        if (typeof keepProg.statPoints === "number" && typeof player.statPoints !== "number") player.statPoints = keepProg.statPoints;
        if (keepProg.stats && (!player.stats || typeof player.stats !== "object")) player.stats = keepProg.stats;
        if (keepProg.techniques && !Array.isArray(player.techniques)) player.techniques = keepProg.techniques;
        if (keepProg.unlocked && !Array.isArray(player.unlocked)) player.unlocked = keepProg.unlocked;
        if (keepProg.techXp && (!player.techXp || typeof player.techXp !== "object")) player.techXp = keepProg.techXp;
      }
    } catch (e) {}
    return true;
  }

  // ---- multiplayer host: same legacy-world cleanup for channel worlds ----
  // A Created World from before v11 keeps its baked chunks/NPCs/delves in the
  // host's local channel folders (wchunks/wnpcs/wdungeons_ch_<ID>). Chunks
  // self-heal on read (getChunk drops v < WORLD_GEN), but stale NPCs, old
  // delves and the hero's world-bound state (position, torches,
  // explored fog — party + inn guests are preserved) do not — so hosting
  // a legacy channel runs the same wipe singleplayer loadSlot runs, keeping
  // only hero records (psave chero_*).
  // Detection: the host hero's spawn identity (exact, like the singleplayer
  // trigger) plus a capped sample of stored chunks/delves (early exit).
  async function channelWorldIsLegacy(id) {
    try {
      id = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
      if (!/^[A-Z0-9]{6,16}$/.test(id)) return false;
      try {
        const cst = kvFolder('wchunks_ch_' + id);
        let cks = []; try { cks = await cst.keys(); } catch (e) { cks = []; }
        for (const k of (cks || []).slice(0, 40)) {
          try {
            const ch = await cst.get(k);
            if (ch && (((ch.v | 0) || 0) < WORLD_GEN)) return true;
          } catch (e) { }
        }
      } catch (e) { }
      try {
        const dst = kvFolder('wdungeons_ch_' + id);
        let dks = []; try { dks = await dst.keys(); } catch (e) { dks = []; }
        for (const k of (dks || []).slice(0, 20)) {
          try {
            const d = await dst.get(k);
            if (d && (((d.v | 0) || 0) < WORLD_GEN)) return true;
          } catch (e) { }
        }
      } catch (e) { }
    } catch (e) { }
    return false;
  }
  // Wipe a legacy channel world on the host's machine and reset the host
  // hero's world-bound state, mirroring rebuildOldWorld. serverSpawn comes
  // from the join response (preferred when valid, else rolled like new).
  // TERRAIN ONLY is wiped (chunks + delves); the whole NPC store survives
  // and the hero keeps party, inn rooms, torches and known places — only
  // dungeon state + world position reset. Returns true when a rebuild happened.
  async function rebuildChannelWorld(id, hero, serverSpawn) {
    try {
      id = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
      if (!/^[A-Z0-9]{6,16}$/.test(id)) return false;
      if (!hero || typeof hero !== "object") return false;
      // Same progression guarantee as rebuildOldWorld: allocated ranks and
      // unspent pools survive the terrain wipe.
      const keepProg = (() => {
        try {
          const deep = (o) => {
            if (!o || typeof o !== "object") return o;
            const c = {};
            for (const k of Object.keys(o)) {
              const v = o[k];
              c[k] = (v && typeof v === "object" && !Array.isArray(v)) ? { ...v } : (Array.isArray(v) ? [...v] : v);
            }
            return c;
          };
          return {
            spellPerks: hero.spellPerks ? deep(hero.spellPerks) : hero.spellPerks,
            weaponPerks: hero.weaponPerks ? deep(hero.weaponPerks) : hero.weaponPerks,
            treePts: hero.treePts ? { ...hero.treePts } : hero.treePts,
            treeProg: hero.treeProg ? { ...hero.treeProg } : hero.treeProg,
            skillPoints: hero.skillPoints, statPoints: hero.statPoints,
            stats: hero.stats ? { ...hero.stats } : hero.stats,
            techniques: Array.isArray(hero.techniques) ? [...hero.techniques] : hero.techniques,
            unlocked: Array.isArray(hero.unlocked) ? [...hero.unlocked] : hero.unlocked,
            techXp: hero.techXp ? JSON.parse(JSON.stringify(hero.techXp)) : hero.techXp,
          };
        } catch (e) { return null; }
      })();
      // Terrain-only wipe: baked chunks + delves go (both dims), every NPC stays.
      try {
        for (const fname of [`wchunks_ch_${id}`, `wchunks_ch_${id}_hell`, `wdungeons_ch_${id}`, `wdungeons_ch_${id}_hell`]) {
          try {
            const fst = kvFolder(fname);
            let fks = []; try { fks = await fst.keys(); } catch (e) { fks = []; }
            for (const k of (fks || [])) { try { await fst.delete(k); } catch (e) { } }
          } catch (e) { }
        }
      } catch (e) { }
      // v19 parallel universes: heroes wake on the surface with fresh hell
      // fields; stale tower pins are dropped (hell mirrors surf coords now).
      try {
        hero.dim = "surf";
        hero.posByDim = { surf: { x: 2.5, y: 4.5 }, hell: null };
        hero.hellSpawn = null;
      } catch (e) {}
      try {
        const validPins = new Set();
        try {
          const H = window.Hell;
          for (const tw of ((H && H.SURFACE_TOWERS) || []).concat((H && H.HELL_TOWERS) || [])) {
            validPins.add("Hell Tower 🗼 " + (tw.x | 0) + "," + (tw.y | 0));
          }
        } catch (e2) {}
        if (Array.isArray(hero.seenPlaces)) {
          hero.seenPlaces = hero.seenPlaces.filter(nm => {
            if (typeof nm !== "string") return true;
            if (nm.indexOf("Hell Tower 🗼") !== 0) return true;
            return validPins.has(nm);
          });
        }
      } catch (e) {}
      try {
        const st = serverSpawn && serverSpawn.spawnType, nm = serverSpawn && serverSpawn.spawnName;
        if (st && SETTLE_DEF[st]) {
          hero.spawnType = st;
          if (typeof nm === "string" && nm) hero.spawnName = nm;
        } else ensureSpawnIdentity(hero);
      } catch (e) { try { ensureSpawnIdentity(hero); } catch (e2) { } }
      try {
        hero.inDungeon = null; hero.dungeonLevel = 1;
        hero.x = 2.5; hero.y = 4.5;
        hero.hp = hero.maxHp; hero.mp = hero.maxMp;
        try { if (window.Status) window.Status.cureAll(hero); } catch (e2) { }
        // party / innRooms / torches / seenPlaces are NOT wiped (companions
        // are re-anchored below); make sure the new town is a known place.
        try {
          if (hero.spawnName && Array.isArray(hero.seenPlaces) && !hero.seenPlaces.includes(hero.spawnName)) {
            hero.seenPlaces.push(hero.spawnName);
          }
        } catch (e2) { }
      } catch (e) { }
      try {
        const partySet = new Set();
        try { for (const pid of (hero.party || [])) if (pid) partySet.add(pid); } catch (e2) {}
        const keptIds = new Set();
        const st = kvFolder('wnpcs_ch_' + id);
        let i = 0;
        const ids = new Set([...(hero.party || []), ...((hero.innRooms || []).filter(Boolean))]);
        for (const pid of ids) {
          let n = null;
          try { if (mem.npcs.has(pid)) n = mem.npcs.get(pid); } catch (e2) {}
          if (!n) { try { n = await st.get(pid); } catch (e2) { n = null; } }
          if (!n || n.isTame) continue;
          try {
            try { n._slot = activeSlot; } catch (e2) {}
            const ox = (i % 4) * 0.7, oy = (i % 2 ? 0.8 : -0.8); i++;
            n.x = hero.x + 1 + ox; n.y = hero.y + oy; n.gx = n.x; n.gy = n.y;
            n.homeGx = n.gx; n.homeGy = n.gy;
            n.chunkKey = null; n.settleKey = null; n.home = null; n.work = null;
            n.nightDuty = false; n.sleeping = false;
            n.placeName = hero.spawnName || n.placeName;
            n.targetId = null; n.targetRef = null; n.hostileUntil = 0; n.deadUntil = null; n.aggro = false;
            try { n.lastSeen = Date.now(); } catch (e2) {}
            if (partySet.has(n.id)) { n.inParty = true; n.inInn = false; }
            else { n.inInn = true; n.inParty = false; }
            try { if (window.Schedule) window.Schedule.ensureNpc(n); } catch (e2) {}
            try { await st.set(n.id, n); } catch (e2) {}
            try { mem.npcs.set(n.id, n); } catch (e2) {}
            keptIds.add(n.id);
          } catch (e2) {}
        }
        try {
          hero.party = (hero.party || []).filter(pid => keptIds.has(pid));
          if (Array.isArray(hero.innRooms)) {
            hero.innRooms = hero.innRooms.map(pid => (pid && !keptIds.has(pid)) ? null : pid);
          }
        } catch (e2) {}
      } catch (e) {}
      try {
        if (keepProg) {
          if (keepProg.spellPerks && (!hero.spellPerks || typeof hero.spellPerks !== "object")) hero.spellPerks = keepProg.spellPerks;
          if (keepProg.weaponPerks && (!hero.weaponPerks || typeof hero.weaponPerks !== "object")) hero.weaponPerks = keepProg.weaponPerks;
          if (keepProg.treePts && (!hero.treePts || typeof hero.treePts !== "object")) hero.treePts = keepProg.treePts;
          if (keepProg.treeProg && (!hero.treeProg || typeof hero.treeProg !== "object")) hero.treeProg = keepProg.treeProg;
          if (typeof keepProg.skillPoints === "number" && typeof hero.skillPoints !== "number") hero.skillPoints = keepProg.skillPoints;
          if (typeof keepProg.statPoints === "number" && typeof hero.statPoints !== "number") hero.statPoints = keepProg.statPoints;
          if (keepProg.stats && (!hero.stats || typeof hero.stats !== "object")) hero.stats = keepProg.stats;
          if (keepProg.techniques && !Array.isArray(hero.techniques)) hero.techniques = keepProg.techniques;
          if (keepProg.unlocked && !Array.isArray(hero.unlocked)) hero.unlocked = keepProg.unlocked;
          if (keepProg.techXp && (!hero.techXp || typeof hero.techXp !== "object")) hero.techXp = keepProg.techXp;
        }
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }

  return {
    hash2, valueNoise, fbm, biomeAt, getChunk, saveChunk, tileAt, isSolidTile,
    getDungeon, saveDungeon, dungeonThemeFor, genDungeonInterior, getNpc, saveNpc, allNpcs, ensureMemLoaded, chunkStore, npcStore, dungeonStore, saveStore,
    settlementAt, regionSettlement, SETTLE_DEF, settleTile, findWalkableSpots,
    baseAt, regionBase, baseCenterFor, baseTypeFor, baseName, baseIdFor, baseTile, baseReach, BASE_DEF, BASE_KINDS,
     BASE_NAMES, BASE_ROLL, HELL_BASE_ROLL, HELL_BASE_KINDS, hellBaseTypeFor, isHellBaseGround, isHeavenBaseGround,
     spawnSettlement, originSettlement, spawnInfo, WORLD_GEN, wipeSlotWorld, ensureSpawnIdentity, rebuildOldWorld, channelWorldIsLegacy, rebuildChannelWorld, backfillHearthPortals, backfillCastleHeart, baseSolidAt, fixDoorFrontTile, backfillDoorFronts,
     isDiagGate, isWatergateBridge, isPondBridge,
    _mem: mem, chunkKey, distOrigin,
    dungeonMemKey,
    MAX_SLOTS, getSlot, setSlot, slotEpoch, resetWorldState, loadSlotData, saveSlotData, listSlots, deleteSlot,
     exportSlotData, importSlotData, countChunks, exportChannelData,
     chunkFolderName, npcFolderName, dungeonFolderName, getChannel, setChannel,
     chanHeroKey, deleteChannelHero, deleteChannelWorld,
    getDim, setDim, normDim,
  };
})();
