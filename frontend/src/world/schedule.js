/* Schedule: NPC sleep/work/night-duty + player sleep. window.Schedule
   - Work hours 7:00-19:00, sleep hours = night (20:00-06:00, matches Game.isNight).
   - Roles blacksmith/runesmith/innkeeper/merchant/guard NEED a workplace building;
     new classes unemployed + adventurer never need one; clerics/herbalists (+
     farmers/hunters/fishers/etc) spawn free. Gating happens at spawn: a gated
     role with no free workplace slot becomes unemployed/adventurer instead.
   - Workplace NPCs get priority for beds (homes). Settlement overflow without a
     bed gets nightDuty=true and guards the town at night instead of sleeping.
   - All of this lives in GAME memory (npc.work/npc.home/npc.nightDuty, computed
     and assigned by the game, never by the AI). buildGameMemory renders it.
   - Player sleep: E on a bed/bunk skips hours forward (heals a bit).
*/
window.Schedule = (() => {
  const WORK_START = 7, WORK_END = 19; // [7,19) work, night 20-6 sleep
  // Gated roles: can only spawn if a matching workplace has a free slot.
  const NEEDS_WORKPLACE = { blacksmith: 1, runesmith: 1, innkeeper: 1, merchant: 1, guard: 1, knight: 1, marshal: 1, guildmaster: 1, magistrate: 1, harbormaster: 1, dockworker: 1, chancellor: 1, monarch: 1, highpriest: 1 };
  // role -> building classKeys that count as a workplace
  const WORKPLACE_CLASSES = {
    blacksmith: ["forge", "forge_works", "great_forge", "smithy_shed", "scrap_workshop", "bronze_forge"],
    runesmith: ["great_forge", "forge_works", "rune_chapel", "forge", "runestone_hut"],
    innkeeper: ["inn", "mead_hall", "tea_house", "caravanserai", "tavern_hall"],
    merchant: ["shop", "market", "warehouse", "storehouse", "souk_stall", "grand_bazaar", "turquoise_shop", "fish_market", "counting_house", "black_market", "arcane_shop", "library", "bookstore"],
    guard: ["barracks", "guildhall", "great_hall", "castle_keep", "grand_castle", "city_watch", "village_keep", "town_keep", "city_citadel", "tide_keep", "sakura_castle", "sun_keep", "gilt_keep", "harbor_keep"],
    samurai: ["dojo", "barracks", "castle_keep", "grand_castle", "sakura_castle"],
    warrior: ["barracks", "guildhall", "dojo", "castle_keep", "grand_castle", "village_keep", "town_keep", "city_citadel", "tide_keep", "sun_keep", "gilt_keep", "harbor_keep"],
    knight: ["barracks", "castle_keep", "grand_castle", "guildhall", "city_watch", "town_keep", "city_citadel", "tide_keep", "harbor_keep"],
    marshal: ["castle_keep", "grand_castle", "barracks", "city_watch", "city_citadel", "sakura_castle", "tide_keep", "sun_keep", "gilt_keep", "harbor_keep"],
    monarch: ["palace", "castle_keep", "grand_castle"],
    noble: ["manor", "noble_villa", "palace", "merchant_villa"],
    chancellor: ["chancery", "palace", "castle_keep", "grand_castle", "guildhall"],
    highpriest: ["cathedral", "high_temple", "sun_temple", "church", "chapel", "tide_temple", "shrine"],
    guildmaster: ["guildhall", "grand_bazaar", "counting_house", "market"],
    magistrate: ["chancery", "guildhall", "city_watch", "courthouse"],
    harbormaster: ["harbor_office", "warehouse", "trade_warehouse", "lighthouse"],
    dockworker: ["trade_warehouse", "warehouse", "harbor_office", "fish_market", "sail_loft"],
    tidewarden: ["tide_temple", "warehouse"],
    miner: ["storehouse", "great_forge", "forge_works"],
    priest: ["chapel", "church", "cathedral", "shrine", "tide_temple", "sun_temple", "high_temple"],
    desert_nomad: ["caravanserai", "souk_stall"],
    steppe_rider: ["horse_pen", "khan_hall"],
    mesa_shaman: ["kiva", "sun_temple"],
    frost_skald: ["ice_hall", "mead_hall", "runestone_hut"],
    dawn_angel: ["dawn_church", "halo_chapel", "guildhall"],
    choir_angel: ["dawn_church", "halo_chapel"],
    seraph_guard: ["seraph_barracks", "radiant_cathedral", "guildhall"],
    scroll_angel: ["dawn_library", "bookstore", "guildhall"],
    angel_guard: ["seraph_barracks", "guildhall", "radiant_cathedral"],
    angel_merchant: ["sunlit_market", "shop", "market"],
    angel_priest: ["radiant_cathedral", "dawn_church", "halo_chapel"],
  };
  const FREE_ROLES = { cleric: 1, herbalist: 1, unemployed: 1, adventurer: 1 };
  function needsWorkplace(role) { return !!NEEDS_WORKPLACE[role]; }
  function workplaceClassesFor(role) { return WORKPLACE_CLASSES[role] || null; }
  function capacityFor(classKey) {
    if (classKey === "barracks") return 4;
    if (classKey === "great_hall") return 3;
    if (classKey === "castle_keep") return 6;
    if (classKey === "village_keep" || classKey === "town_keep") return 3;
    if (classKey === "city_citadel" || classKey === "tide_keep" || classKey === "sakura_castle" || classKey === "sun_keep" || classKey === "gilt_keep" || classKey === "harbor_keep") return 4;
    if (classKey === "palace") return 4;
    if (classKey === "grand_castle") return 8;
    if (classKey === "market" || classKey === "black_market") return 3;
    if (classKey === "arcane_shop" || classKey === "library" || classKey === "bookstore") return 2;
    if (classKey === "dojo") return 2;
    if (classKey === "grand_bazaar") return 4;
    if (classKey === "harbor_office") return 3;
    return 2;
  }

  function hourNow() {
    try { if (window.Game && window.Game.dayHour) return window.Game.dayHour(); } catch (e) { }
    try {
      const dt = window.Game && window.Game.G ? window.Game.G.dayTime : 8 * 60;
      return (((dt % 1440) + 1440) % 1440) / 1440 * 24;
    } catch (e) { return 12; }
  }
  function isWorkHours(h) { if (h == null) h = hourNow(); return h >= WORK_START && h < WORK_END; }
  function isSleepHours(h) { if (h == null) h = hourNow(); return h >= 20 || h < 6; }

  // The origin hearth is a typed settlement like any other. Its chunks
  // carry settlement metadata (type + scx/scy); hearthKey reads it back.
  // One town must be one key, or beds/workplaces double-book.
  function hearthKey() {
    try {
      const W = window.World;
      if (!W._mem || !W._mem.chunks || typeof W.chunkKey !== "function") return null;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        let ch = null;
        try { ch = W._mem.chunks.get(W.chunkKey(ox, oy)); } catch (e) { ch = null; }
        if (ch && ch.scx != null && ch.settlementType) return `${ch.settlementType}:${ch.scx},${ch.scy}`;
      }
    } catch (e) { }
    return null;
  }
  // settleKey: "<type>:<cx>,<cy>" | null (wilds)
  function settleKeyForPos(gx, gy) {
    try {
      if (!Number.isFinite(gx) || !Number.isFinite(gy)) return null;
      const W = window.World;
      // Baked chunk metadata FIRST: origin chunks carry the hearth's real
      // settlement identity (type + scx/scy). Checking it first keeps one
      // town on one key, so every villager of the same hearth shares one
      // bedroom/workplace pool.
      try {
        const cx = Math.floor(gx / 16), cy = Math.floor(gy / 16);
        const ch = W._mem && W._mem.chunks && typeof W.chunkKey === "function" && W._mem.chunks.get(W.chunkKey(cx, cy));
        if (ch && ch.scx != null && ch.settlementType) return `${ch.settlementType}:${ch.scx},${ch.scy}`;
      } catch (e) { }
      try {
        let o = null;
        try { o = (W.originSettlement && W.originSettlement()) || null; if (W.getDim && W.getDim() !== "surf") o = null; } catch (eH) { try { o = (W.originSettlement && W.originSettlement()) || null; if (W.getDim && W.getDim() !== "surf") o = null; } catch (eH2) {} }
        if (o && Math.hypot(gx - o.cx, gy - o.cy) <= (o.radius || 20) + 2) return (o.type || "town") + ":" + o.cx + "," + o.cy;
      } catch (e2) { }
      const hk = hearthKey();
      if (hk) return hk;
      const s = W.settlementAt(gx, gy);
      if (s) return `${s.type}:${s.cx},${s.cy}`;
    } catch (e) { }
    return null;
  }
  function settleKeyForChunk(ch) {
    try {
      if (!ch) return null;
      if (ch.scx != null && ch.settlementType) return `${ch.settlementType}:${ch.scx},${ch.scy}`;
      // same derivation as a position, so chunk-born and pos-born keys agree
      if (ch.cx != null) return settleKeyForPos(ch.cx * 16 + 8, ch.cy * 16 + 8);
    } catch (e) { }
    return null;
  }
  function settleKeyForNpc(npc) {
    try {
      if (npc.settleKey !== undefined && (npc.settleKey === null || typeof npc.settleKey === "string")) return npc.settleKey;
      const hx = npc.homeGx ?? npc.gx, hy = npc.homeGy ?? npc.gy;
      let k = settleKeyForPos(hx, hy);
      if (k) return k;
      // fall back to birth chunk
      try {
        const W = window.World;
        if (npc.chunkKey && W._mem.chunks.get(npc.chunkKey)) return settleKeyForChunk(W._mem.chunks.get(npc.chunkKey));
      } catch (e) { }
      return null;
    } catch (e) { return null; }
  }
  function settlementFromKey(key) {
    try {
      if (key === "spawn") { try { const o = window.World.originSettlement(); if (o) return o; } catch (e) { } return { cx: 0, cy: 0, radius: 34, type: "town" }; }
      const m = /^([^:]+):(-?\d+),(-?\d+)$/.exec(String(key || ""));
      if (!m) return null;
      const type = m[1];
      let radius = 16;
      try { radius = (window.World.SETTLE_DEF[type] || {}).radius || 16; } catch (e) { }
      return { cx: Number(m[2]), cy: Number(m[3]), radius, type };
    } catch (e) { return null; }
  }
  function buildingsForKey(key) {
    try {
      if (!window.Buildings) return [];
      // "spawn" is retired (pre-v11 saves): resolve it to the live origin
      // hearth so any straggler key still lands in real, baked buildings.
      // surface-only: legacy spawn beds don't exist in hell (0,0 is void).
      if (key === "spawn") { try { if (!window.World || !window.World.getDim || window.World.getDim() !== "surf") return []; } catch (e) { return []; } return window.Buildings.originBuildings(); }
      const s = settlementFromKey(key);
      if (!s) return [];
      return window.Buildings.settlementBuildings(s);
    } catch (e) { return []; }
  }
  function listBeds(key) {
    const out = [];
    try {
      for (const b of buildingsForKey(key)) {
        const furn = (b.furniture || []);
        for (const f of furn) {
          if (f.kind !== "bed" && f.kind !== "bunk") continue;
          try { if (window.Buildings && window.Buildings.isFurnGone && window.Buildings.isFurnGone(f.x, f.y)) continue; } catch (e) {}
          out.push({ x: f.x, y: f.y, buildingId: b.id, title: b.title, classKey: b.classKey });
        }
      }
    } catch (e) { }
    out.sort((a, b) => (a.buildingId < b.buildingId ? -1 : a.buildingId > b.buildingId ? 1 : (a.x - b.x) || (a.y - b.y)));
    return out;
  }
  function listWorkplaces(key, role) {
    const classes = workplaceClassesFor(role);
    if (!classes) return [];
    const out = [];
    try {
      for (const b of buildingsForKey(key)) {
        if (!classes.includes(b.classKey)) continue;
        // interior target: building center (floor, walkable)
        out.push({ buildingId: b.id, title: b.title, classKey: b.classKey, x: b.x0 + b.w / 2 - 0.5, y: b.y0 + b.h / 2 - 0.5 });
      }
    } catch (e) { }
    out.sort((a, b) => (a.buildingId < b.buildingId ? -1 : 1));
    return out;
  }

  // Assign beds + workplaces for every NPC of one settlement. Deterministic:
  // workplace-needing roles first (bed priority), then id order. Persists via saveNpc.
  async function assignSettlement(key) {
    try {
      if (!key) return;
      const W = window.World;
      try { if (W.ensureMemLoaded) await W.ensureMemLoaded(); } catch (e) { }
      const roster = [...W._mem.npcs.values()].filter(n => {
        try { return settleKeyForNpc(n) === key; } catch (e) { return false; }
      });
      if (!roster.length) return;
      roster.sort((a, b) => {
        const aw = needsWorkplace(a.role) ? 0 : 1, bw = needsWorkplace(b.role) ? 0 : 1;
        if (aw !== bw) return aw - bw;
        return String(a.id) < String(b.id) ? -1 : 1;
      });
      const beds = listBeds(key);
      const usedBeds = new Set();
      // pre-claim beds already held (stable across reassigns). First claim
      // wins: stale doubles from split-brain keys share one tile, so the
      // loser is freed and re-dealt below instead of sharing a bed.
      for (const n of roster) {
        try {
          if (n.home && Number.isFinite(n.home.x) && !n.nightDuty) {
            const bi = beds.findIndex(b => b.x === n.home.x && b.y === n.home.y);
            if (bi >= 0 && !usedBeds.has(bi)) usedBeds.add(bi);
            else { n.home = null; } // bed gone (collapsed?) — reassign below
          }
        } catch (e) { }
      }
      const workUse = {}; // buildingId -> count
      // pre-claim workplaces already held (stable across reassigns), capped
      // at capacity so merged pools can't overfill one shop.
      for (const n of roster) {
        try {
          if (n.work && n.work.buildingId) {
            const wp = listWorkplaces(key, n.role).find(w => w.buildingId === n.work.buildingId);
            if (wp && (workUse[wp.buildingId] || 0) < capacityFor(wp.classKey)) workUse[wp.buildingId] = (workUse[wp.buildingId] || 0) + 1;
            else n.work = null;
          }
        } catch (e) { }
      }
      let dirty = 0;
      for (const n of roster) {
        let changed = false;
        // workplace (gated roles only; free roles keep work=null)
        if (needsWorkplace(n.role)) {
          if (!n.work) {
            const opts = listWorkplaces(key, n.role);
            let pick = null;
            for (const w of opts) {
              if ((workUse[w.buildingId] || 0) < capacityFor(w.classKey)) { pick = w; break; }
            }
            if (pick) {
              n.work = { buildingId: pick.buildingId, title: pick.title, classKey: pick.classKey, x: pick.x, y: pick.y };
              workUse[pick.buildingId] = (workUse[pick.buildingId] || 0) + 1;
              changed = true;
            } else n.work = null;
          }
        } else if (n.work) { n.work = null; changed = true; }
        // home / night duty (settlement NPCs only)
        if (!n.home && !n.nightDuty) {
          const bi = beds.findIndex((b, i) => !usedBeds.has(i));
          if (bi >= 0) {
            usedBeds.add(bi);
            n.home = { buildingId: beds[bi].buildingId, title: beds[bi].title, x: beds[bi].x, y: beds[bi].y, hasBed: true };
            n.nightDuty = false;
            changed = true;
          } else {
            n.home = null; n.nightDuty = true; changed = true;
          }
        } else if (n.home && n.nightDuty) { n.nightDuty = false; changed = true; }
        if (n.settleKey !== key) { n.settleKey = key; changed = true; }
        if (changed) {
          dirty++;
          try { await W.saveNpc(n); } catch (e) { }
        }
      }
      return dirty;
    } catch (e) { return 0; }
  }
  // Ensure one NPC has schedule fields (backfill legacy saves). No save here
  // beyond the caller's own saveNpc — call assignSettlement for full rebalance.
  function ensureNpc(npc) {
    try {
      if (!npc || npc.role === "mob") return npc;
      if (npc.settleKey == null) {
        // Null never sticks: recompute from the birth anchor (wilds stay
        // null). Sticky nulls previously sat out every rebalance forever.
        try {
          const hx = npc.homeGx != null ? npc.homeGx : npc.gx, hy = npc.homeGy != null ? npc.homeGy : npc.gy;
          const k = settleKeyForPos(hx, hy);
          if (k) npc.settleKey = k;
        } catch (e) { }
      } else if (typeof npc.settleKey === "string") {
        // Heal split-brain saves: one town must be one key. Villagers whose
        // sticky key disagrees with their chunk (e.g. retired "spawn" vs
        // "city:0,0") were invisible to every bed/workplace rebalance.
        // Adopt the current key and drop stale claims; assignSettlement
        // re-deals them.
        try {
          const hx = npc.homeGx != null ? npc.homeGx : npc.gx, hy = npc.homeGy != null ? npc.homeGy : npc.gy;
          const k = settleKeyForPos(hx, hy);
          if (k && k !== npc.settleKey) {
            npc.settleKey = k; npc.work = null; npc.home = null; npc.nightDuty = false;
          }
        } catch (e) { }
      }
      if (npc.work === undefined) npc.work = null;
      if (npc.home === undefined) npc.home = null;
      if (npc.nightDuty === undefined) npc.nightDuty = false;
      if (npc.sleeping === undefined) npc.sleeping = false;
    } catch (e) { }
    return npc;
  }
  // Pick a gated role with a free workplace slot, else fall back to a free role.
  // Returns a role string. Used at spawn so blacksmiths can't appear without a forge.
  function gateRole(key, wanted) {
    try {
      if (!key) {
        // wilds: no workplaces at all — gated roles become adventurers/unemployed
        if (needsWorkplace(wanted)) return Math.random() < 0.5 ? "adventurer" : "unemployed";
        return wanted;
      }
      if (!needsWorkplace(wanted)) return wanted;
      const opts = listWorkplaces(key, wanted);
      if (!opts.length) return Math.random() < 0.5 ? "adventurer" : "unemployed";
      // count current holders (mem only — cheap, spawn-time)
      let holders = 0, cap = 0;
      try {
        for (const w of opts) cap += capacityFor(w.classKey);
        for (const n of window.World._mem.npcs.values()) {
          try {
            if (settleKeyForNpc(n) !== key) continue;
            if (n.role === wanted && n.work && opts.some(w => w.buildingId === n.work.buildingId)) holders++;
          } catch (e) { }
        }
      } catch (e) { }
      if (holders >= cap) return Math.random() < 0.5 ? "adventurer" : "unemployed";
      return wanted;
    } catch (e) { return wanted; }
  }

  // Where should this NPC be right now? Pure (no movement) — game.js moves.
  // Returns {mode:'free'|'sleep'|'work'|'nightduty'|'wander', x,y}
  function scheduleTarget(npc) {
    try {
      if (!npc || npc.inParty || npc.hp <= 0) return { mode: "free" };
      try { if (npc.inParty) return { mode: "free" }; } catch (e) { }
      // combat overrides everything (caller also checks, belt + suspenders)
      try {
        if (window.Game && window.Game.resolveTarget) {
          const t = window.Game.resolveTarget(npc);
          if (t && t.hp > 0) return { mode: "free" };
        } else if (npc.targetId) return { mode: "free" };
      } catch (e) { }
      try { if (window.Game && window.Game.G.player.inDungeon) return { mode: "free" }; } catch (e) { }
      const h = hourNow();
      if (isSleepHours(h)) {
        if (npc.nightDuty || !npc.home) return { mode: "nightduty" };
        return { mode: "sleep", x: npc.home.x + 0.5, y: npc.home.y + 0.5 };
      }
      if (isWorkHours(h) && npc.work) return { mode: "work", x: npc.work.x, y: npc.work.y };
      return { mode: "wander" };
    } catch (e) { return { mode: "wander" }; }
  }
  function isSleeping(npc) { try { return !!npc.sleeping; } catch (e) { return false; } }

  // Nearest bed/bunk furniture to (px,py) within maxD (tiles). For E-to-sleep.
  function nearestBed(px, py, maxD) {
    try {
      if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
      maxD = maxD || 2.2;
      const key = settleKeyForPos(Math.floor(px), Math.floor(py));
      const beds = key ? listBeds(key) : [];
      let best = null, bd = maxD;
      const consider = (bx, by, b) => {
        const d = Math.hypot(bx + 0.5 - px, by + 0.5 - py);
        if (d < bd) { bd = d; best = { x: bx + 0.5, y: by + 0.5, bx, by, buildingId: b && b.buildingId, title: b && b.title }; }
      };
      for (const b of beds) consider(b.x, b.y, b);
      // player-placed beds count everywhere (checked before the early return
      // so your own bedroll beats a farther baked bed)
      try {
        if (window.Buildings && window.Buildings.placedFurnitureIn) {
          const placed = window.Buildings.placedFurnitureIn(Math.floor(px) - 3, Math.floor(px) + 3, Math.floor(py) - 3, Math.floor(py) + 3) || [];
          for (const r of placed) {
            if (!r || (r.kind !== "bed" && r.kind !== "bunk")) continue;
            consider(r.gx, r.gy, { buildingId: null, title: "your camp" });
          }
        }
      } catch (e) {}
      if (best) return best;
      // wilds / unlisted: probe nearby interiors via buildingsInView
      try {
        if (window.Buildings && window.Buildings.buildingsInView) {
          const list = window.Buildings.buildingsInView(Math.floor(px) - 3, Math.floor(px) + 3, Math.floor(py) - 3, Math.floor(py) + 3);
          for (const b of (list || [])) {
            const furn = (b.furniture || []);
            for (const f of furn) {
              if (f.kind !== "bed" && f.kind !== "bunk") continue;
              try { if (window.Buildings.isFurnGone && window.Buildings.isFurnGone(f.x, f.y)) continue; } catch (e) {}
              consider(f.x, f.y, { buildingId: b.id, title: b.title });
            }
          }
          // player-placed beds work too (Your Bedroll counts)
          try {
            const placed = window.Buildings.placedFurnitureIn(Math.floor(px) - 3, Math.floor(px) + 3, Math.floor(py) - 3, Math.floor(py) + 3) || [];
            for (const r of placed) {
              if (!r || (r.kind !== "bed" && r.kind !== "bunk")) continue;
              consider(r.gx, r.gy, { buildingId: null, title: "your camp" });
            }
          } catch (e) {}
        }
      } catch (e) { }
      return best;
    } catch (e) { return null; }
  }

  // Advance the clock (game seconds; 60s = 1 game hour). Returns {ok, reason?}.
  async function sleepHours(h) {
    try {
      h = Math.max(1, Math.min(12, Math.round(h || 6)));
      const G = window.Game && window.Game.G;
      if (!G || !G.player) return { ok: false, reason: "no player" };
      if (G.player.inDungeon) return { ok: false, reason: "dungeon" };
      // unsafe: a mob is on top of the player
      try {
        for (const m of (G.mobs || [])) {
          if (m.hp <= 0) continue;
          if (Math.hypot(m.x - G.player.x, m.y - G.player.y) < 8) {
            let t = null;
            try { t = window.Game.resolveTarget(m); } catch (e) { }
            if (t === G.player) return { ok: false, reason: "combat" };
          }
        }
      } catch (e) { }
      G.dayTime += h * 60;
      try { G.player.dayTime = G.dayTime; } catch (e) { }
      // rest: a bit of hp/mp back, status stays (cures are separate)
      try {
        G.player.hp = Math.min(G.player.maxHp, G.player.hp + Math.round(G.player.maxHp * 0.25 * h / 6));
        G.player.mp = Math.min(G.player.maxMp, G.player.mp + Math.round(G.player.maxMp * 0.5 * h / 6));
      } catch (e) { }
      try { if (window.Game.updateClock) window.Game.updateClock(); } catch (e) { }
      try { await window.Game.saveGame(true); } catch (e) { }
      // let sleepers/wakers resort on next ticks; refresh cache so the newly
      // correct sleepers render (and toppers wake) without waiting
      try { await window.Game.refreshNpcCache(); } catch (e) { }
      return { ok: true, hours: h };
    } catch (e) { return { ok: false, reason: "error" }; }
  }

  return {
    WORK_START, WORK_END, NEEDS_WORKPLACE, WORKPLACE_CLASSES, capacityFor,
    needsWorkplace, workplaceClassesFor, hourNow, isWorkHours, isSleepHours,
    settleKeyForPos, settleKeyForChunk, settleKeyForNpc, settlementFromKey,
    listBeds, listWorkplaces, assignSettlement, ensureNpc, gateRole,
    scheduleTarget, isSleeping, nearestBed, sleepHours,
  };
})();
