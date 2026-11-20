/* Entities: stats, leveling, abilities, perks. window.Entities */
window.Entities = (() => {
  const AB = () => window.CFG.ABILITIES;
  // Pure-stats base: level never feeds combat numbers. Level still exists as
  // a progression counter (XP curve, stat points, unlock gates), but HP/MP,
  // ATK, MATK, DEF, SDEF and SPD come only from attributes + equipment (+ role or
  // kind multipliers below). The lv/mult args stay so old callers keep working.
  function baseStats(lv, mult = 1) {
    return {
      lv: lv || 1, xp: 0,
      maxHp: 40, maxMp: 20,
      atk: 8, matk: 8, def: 3,
      sdef: 3,
      maxStamina: 100, stamina: 100,
      spd: 3.4,
    };
  }
  function defaultStats() { return { str: 5, end: 5, agi: 5, int: 5, cha: 5, luk: 5, for: 5 }; }
  function defaultHotbar(abilities) {
    const n = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
    const hb = new Array(n).fill(null);
    (abilities || []).slice(0, n).forEach((id, i) => { if (id) hb[i] = { kind: "ability", id }; });
    return hb;
  }
  // ---- races (Nov 2026) ----
  // Racial stat bonuses apply idempotently: p.race tracks which bonus is
  // baked into p.stats, so re-migrations and restyles never stack it.
  const STAT_KEYS = ["str", "end", "agi", "int", "cha", "luk", "for"];
  function raceBonus(race) {
    try {
      const b = (window.Appearance && window.Appearance.RACE_BONUS && window.Appearance.RACE_BONUS[race]) || {};
      const out = {};
      for (const k of STAT_KEYS) out[k] = b[k] | 0;
      return out;
    } catch (e) { const o = {}; for (const k of STAT_KEYS) o[k] = 0; return o; }
  }
  function syncRace(p) {
    try {
      if (!p || typeof p !== "object") return p;
      if (!p.stats) p.stats = defaultStats();
      for (const k of STAT_KEYS) if (typeof p.stats[k] !== "number") p.stats[k] = 5;
      let want = "human";
      try {
        if (p.appearance && typeof p.appearance === "object" && window.Appearance) {
          p.appearance = window.Appearance.sanitize(p.appearance, "adventurer");
          if (p.appearance.race) want = p.appearance.race;
        }
      } catch (e) { }
      if (!want || typeof want !== "string") want = "human";
      const have = (typeof p.race === "string" && p.race) ? p.race : null;
      // Snapshot of the bonus values actually baked in, so later definition
      // changes (e.g. grenouille luk->int/agi) migrate instead of stacking.
      const snap = (p.raceBonus && typeof p.raceBonus === "object") ? p.raceBonus : null;
      if (have === want && p.raceBonusApplied) {
        const nb = raceBonus(want);
        // Legacy saves have no snapshot: the values match the current table,
        // so nothing to do — except grenouille, whose definition changed
        // twice (was {agi:4,int:3}, then {luk:4,int:3}; now {int:4,agi:3}).
        // Ancient saves still carry the original spread, so shift one point
        // from agility over to intellect. (Saves that already migrated to the
        // {luk:4,int:3} era carry a snapshot and take the generic diff path.)
        if (!snap && want === "grenouille") {
          p.stats.agi = Math.max(1, ((typeof p.stats.agi === "number" ? p.stats.agi : 5) | 0) - 1);
          p.stats.int = Math.max(1, ((typeof p.stats.int === "number" ? p.stats.int : 5) | 0) + 1);
        } else if (snap) {
          for (const k of STAT_KEYS) {
            const diff = (nb[k] | 0) - ((snap[k] | 0) || 0);
            if (diff) p.stats[k] = Math.max(1, ((typeof p.stats[k] === "number" ? p.stats[k] : 5) | 0) + diff);
          }
        }
        p.race = want; p.raceBonusApplied = true; p.raceBonus = nb;
        return p;
      }
      const nb = raceBonus(want), ob = snap || (have ? raceBonus(have) : null);
      for (const k of STAT_KEYS) {
        const cur = (typeof p.stats[k] === "number" ? p.stats[k] : 5) | 0;
        p.stats[k] = Math.max(1, cur + (nb[k] | 0) - (ob ? (ob[k] | 0) : 0));
      }
      p.race = want; p.raceBonusApplied = true; p.raceBonus = nb;
    } catch (e) { }
    return p;
  }
  // Make sure a player object has every progression field (also migrates old saves).
  function ensureProgression(p) {
    // heroes predate sexes: existing worlds default male, new heroes pick
    try {
      if (!normalizeGender(p.gender)) p.gender = "male";
    } catch (e) { try { p.gender = "male"; } catch (e2) {} }
    // appearance: old saves predate it — roll once, then it persists.
    try {
      if (window.Appearance) {
        p.appearance = (!p.appearance || typeof p.appearance !== "object")
          ? window.Appearance.defaultAppearance()
          : window.Appearance.sanitize(p.appearance, "adventurer");
      }
    } catch (e) { }
    if (!p.stats) p.stats = defaultStats();    else for (const k of ["str", "end", "agi", "int", "cha", "luk", "for"]) if (typeof p.stats[k] !== "number") p.stats[k] = 5;
    if (!Array.isArray(p.seenPlaces)) p.seenPlaces = [];
    if (typeof p.statPoints !== "number") p.statPoints = 0;
    if (typeof p.skillPoints !== "number") p.skillPoints = 0;
    if (!p.spellPerks) p.spellPerks = {};
    if (!p.weaponPerks || typeof p.weaponPerks !== "object") p.weaponPerks = {};
    // ---- per-tree skill points (earned by USE, never by level-up) ----
    // p.treePts: spendable points per tree id (sword, fireball, backstab,
    // parry, shield...). p.treeProg: progress counters toward the next
    // point in each tree. p.skillPoints is the retired generic pool: old
    // saves keep their unspent points as a legacy balance spendable in any
    // tree, but nothing grants new ones.
    if (!p.treePts || typeof p.treePts !== "object") p.treePts = {};
    else for (const k of Object.keys(p.treePts)) { const v = p.treePts[k] | 0; if (!(v > 0)) delete p.treePts[k]; else p.treePts[k] = v; }
    if (!p.treeProg || typeof p.treeProg !== "object") p.treeProg = {};
    else for (const k of Object.keys(p.treeProg)) { const v = p.treeProg[k] | 0; if (!(v > 0)) delete p.treeProg[k]; else p.treeProg[k] = v; }
    // ---- gear upgrades (per COPY, v235: each stack carries its own up/nick) ----
    // p.equipmentUp/Nick[slot] say which copy is worn. Old saves kept levels
    // per type in p.gearUp[itemId] — the first load stamps them onto every
    // copy of that gear (nothing earned is lost), then drops the old map.
    if (!p.gearUp || typeof p.gearUp !== "object") p.gearUp = {};
    else {
      try {
        const old = p.gearUp;
        for (const k of Object.keys(old)) {
          let v = old[k] | 0;
          if (!(v > 0) || v > 5) { delete old[k]; continue; }
          old[k] = v;
          try {
            for (const s of (p.inventory || [])) {
              if (s && s.id === k && ((s.up | 0) || 0) < v) s.up = v;
            }
          } catch (e) { }
          try {
            for (const slot of ["weapon", "armor", "trinket", "shield"]) {
              if (p.equipment && p.equipment[slot] === k) {
                p.equipmentUp = (p.equipmentUp && typeof p.equipmentUp === "object") ? p.equipmentUp : {};
                if (((p.equipmentUp[slot] | 0) || 0) < v) p.equipmentUp[slot] = v;
              }
            }
          } catch (e) { }
        }
        // migrated onto the copies — the type map retires
        try { delete p.gearUp; } catch (e) { p.gearUp = {}; }
        p.gearUp = {};
      } catch (e) { }
    }
    // sanitize per-copy identity: stack up 0-5, nick a short string, worn
    // pointers for slots that exist. Junk is trimmed, gear is never dropped.
    try {
      for (const s of (p.inventory || [])) {
        if (!s || typeof s !== "object") continue;
        const u = (s.up | 0) || 0;
        if (u !== 0) s.up = u < 0 ? 0 : u > 5 ? 5 : u; else try { delete s.up; } catch (e2) { }
        let nk = "";
        try { nk = String(s.nick == null ? "" : s.nick).trim().replace(/\s+/g, " ").slice(0, 24); } catch (e2) { nk = ""; }
        if (nk) s.nick = nk; else try { delete s.nick; } catch (e2) { }
      }
      if (!p.equipmentUp || typeof p.equipmentUp !== "object") p.equipmentUp = {};
      if (!p.equipmentNick || typeof p.equipmentNick !== "object") p.equipmentNick = {};
      for (const slot of ["weapon", "armor", "trinket", "shield"]) {
        const u = (p.equipmentUp[slot] | 0) || 0;
        p.equipmentUp[slot] = u < 0 ? 0 : u > 5 ? 5 : u;
        let nk = "";
        try { nk = String(p.equipmentNick[slot] == null ? "" : p.equipmentNick[slot]).trim().replace(/\s+/g, " ").slice(0, 24); } catch (e2) { nk = ""; }
        p.equipmentNick[slot] = nk;
      }
    } catch (e) { }
    // ---- trimmed spell trees refund: ranks bought in removed (useless)
    // nodes come back as spendable points — tree pool up to the new cap,
    // overflow to the generic pool (spendable in any tree). Runs before the
    // cap trim below so refunds are never eaten by it. Idempotent: removed
    // ranks are gone after the first pass, so the toast fires once.
    try {
      const DROP = (window.CFG && window.CFG.SPELL_TREE_DROP) || {};
      if (p && p.kind === "player" && Object.keys(DROP).length) {
        let refundN = 0;
        const refundT = [];
        for (const tid of Object.keys(DROP)) {
          const store = p.spellPerks && p.spellPerks[tid];
          if (!store) continue;
          let got = 0;
          for (const nid of DROP[tid]) {
            const r = (store[nid] | 0) || 0;
            if (r > 0) { got += r; try { delete store[nid]; } catch (e) { } }
          }
          if (got > 0) {
            p.treePts = p.treePts || {};
            p.treePts[tid] = ((p.treePts[tid] | 0) || 0) + got;
            let max = 0, bought = 0;
            try { max = treeRanksMax(tid) || 0; bought = treeRanksBought(p, tid) || 0; } catch (e) { }
            const allow = Math.max(0, max - bought);
            const cur = (p.treePts[tid] | 0) || 0;
            if (cur > allow) {
              const over = cur - allow;
              if (allow > 0) p.treePts[tid] = allow; else try { delete p.treePts[tid]; } catch (e) { }
              p.skillPoints = ((p.skillPoints | 0) || 0) + over;
            }
            refundN += got; refundT.push(tid);
          }
        }
        if (refundN > 0) {
          try { if (window.UI && window.UI.toast) window.UI.toast(`💫 Refunded ${refundN} useless rank${refundN === 1 ? "" : "s"} (${refundT.join(", ")}) — spend them in Character (C).`, 5000); } catch (e) { }
        }
      }
    } catch (e) { }
    // ---- per-tree caps: a tree can never hold more points (unspent +
    // ranks bought) than it takes to max it out. Trim surplus unspent
    // points and drop progress on capped trees (incl. unknown tree ids,
    // whose points could never be spent anywhere).
    try {
      const seen = {};
      for (const k of Object.keys(p.treePts || {})) seen[k] = 1;
      for (const k of Object.keys(p.treeProg || {})) seen[k] = 1;
      for (const k of Object.keys(seen)) {
        const def = skillTreeDef(k);
        if (!def) { try { delete p.treePts[k]; } catch (e) { } try { delete p.treeProg[k]; } catch (e2) { } continue; }
        const max = treeRanksMax(k);
        if (!(max > 0)) { try { delete p.treePts[k]; } catch (e) { } try { delete p.treeProg[k]; } catch (e2) { } continue; }
        const bought = treeRanksBought(p, k);
        const allow = Math.max(0, max - bought);
        const cur = ((p.treePts && p.treePts[k]) | 0) || 0;
        if (cur > allow) { if (allow > 0) p.treePts[k] = allow; else try { delete p.treePts[k]; } catch (e) { } }
        const held = Math.min(cur, allow);
        if (bought + held >= max) { try { delete p.treeProg[k]; } catch (e) { } }
      }
    } catch (e) { }
    if (!Array.isArray(p.abilities)) p.abilities = ["fireball"];
    if (!p.unlocked) p.unlocked = [...p.abilities];
    // ---- weapon techniques (learnt by deeds, not tomes) ----
    // p.techniques: known technique ids (actives also live in p.abilities so the
    // hotbar casts them). p.techXp: lifetime damage by element/family + kills
    // (+ uses: successful casts of named abilities, for deeds like Eject).
    // p.techFocus: volatile spell-channel state. Fresh loads clear it in
    // loadSlot (perf timestamps reset); here only malformed shapes are dropped
    // so a live channel survives hotbar/HUD refreshes mid-cast.
    if (!Array.isArray(p.techniques)) p.techniques = [];
    if (!p.techXp || typeof p.techXp !== "object") p.techXp = { el: {}, fam: {}, kills: 0, undeadKills: 0, uses: {} };
    if (!p.techXp.el || typeof p.techXp.el !== "object") p.techXp.el = {};
    if (!p.techXp.fam || typeof p.techXp.fam !== "object") p.techXp.fam = {};
    if (typeof p.techXp.kills !== "number") p.techXp.kills = 0;
    if (typeof p.techXp.undeadKills !== "number") p.techXp.undeadKills = 0;
    if (!p.techXp.uses || typeof p.techXp.uses !== "object") p.techXp.uses = {};
    // ---- lifetime taming history (never shrinks) ----
    // p.lifetimeTames counts every beast ever tamed OR bought at a stable;
    // selling or releasing never reduces it. Skill points (Beastmastery) and
    // the Locust Swarm deed read this history, not the current roster.
    // Backfill: old saves take the best evidence available (deed counter,
    // then roster size — released ones can't be reconstructed).
    try {
      const usesTame = ((p.techXp.uses.tame | 0)) || 0;
      let roster = 0;
      try { roster = (p.tames || []).length; } catch (e2) { }
      if (typeof p.lifetimeTames !== "number" || !(p.lifetimeTames >= 0)) {
        p.lifetimeTames = Math.max(usesTame, roster);
      } else {
        p.lifetimeTames = Math.max(p.lifetimeTames, usesTame, roster);
      }
      const insects = ((window.CFG && window.CFG.TAMING && window.CFG.TAMING.INSECT_KINDS) || []);
      let iRoster = 0;
      try { for (const t of (p.tames || [])) if (t && insects.indexOf(t.kind) >= 0) iRoster++; } catch (e2) { }
      const usesBug = ((p.techXp.uses.insect_tame | 0)) || 0;
      if (typeof p.lifetimeInsectTames !== "number" || !(p.lifetimeInsectTames >= 0)) {
        p.lifetimeInsectTames = Math.max(usesBug, iRoster);
      } else {
        p.lifetimeInsectTames = Math.max(p.lifetimeInsectTames, usesBug, iRoster);
      }
    } catch (e) { }
    // genders: saves before sexes roll stable male/female for old tames
    try { for (const t of (p.tames || [])) if (t && !normalizeGender(t.gender)) t.gender = rollGender(t.kind, t.id || (t.kind + ":" + (t.name || ""))); } catch (e) { }
    if (p.techFocus && (typeof p.techFocus !== "object" || typeof p.techFocus.releaseAt !== "number")) p.techFocus = null;
    // ---- bestiary archive (monster compendium, browsed at Beast Lodge buildings) ----
    // p.bestiary.seen: kinds ever encountered (sighting pass, tames, kills).
    // p.bestiary.slain: kinds -> lifetime kill count (player-faction kills).
    // Old saves start blank and fill in as the hero meets beasts.
    if (!p.bestiary || typeof p.bestiary !== "object" || Array.isArray(p.bestiary)) p.bestiary = { seen: {}, slain: {} };
    else {
      if (!p.bestiary.seen || typeof p.bestiary.seen !== "object" || Array.isArray(p.bestiary.seen)) p.bestiary.seen = {};
      if (!p.bestiary.slain || typeof p.bestiary.slain !== "object" || Array.isArray(p.bestiary.slain)) p.bestiary.slain = {};
      for (const k of Object.keys(p.bestiary.seen)) { if (!k || typeof p.bestiary.seen[k] !== "number" || !(p.bestiary.seen[k] > 0)) { if (!k) delete p.bestiary.seen[k]; else p.bestiary.seen[k] = 1; } }
      for (const k of Object.keys(p.bestiary.slain)) { const v = p.bestiary.slain[k] | 0; if (!k || !(v > 0)) delete p.bestiary.slain[k]; else p.bestiary.slain[k] = v; }
    }
    if (!p.status || typeof p.status !== "object") p.status = {};
    if (!p.tag || typeof p.tag !== "string") {
      try {
        p.tag = "#" + Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, "0").slice(0, 6);
      } catch (e) { p.tag = "#EMBER1"; }
    }
   if (typeof p.bossKills !== "number") p.bossKills = 0;
   if (typeof p.chestsOpened !== "number") p.chestsOpened = 0;
   if (typeof p.dungeonsEntered !== "number") p.dungeonsEntered = 0;
   if (typeof p.dungeonLevel !== "number") p.dungeonLevel = 1;
   if (typeof p.deepestDepth !== "number") p.deepestDepth = 0;
   if (typeof p.playTime !== "number") p.playTime = 0;
    // v16 hell progression: distinct delve fragments, sphere key, entry flags.
    if (!p.hellFragments || typeof p.hellFragments !== "object" || Array.isArray(p.hellFragments)) p.hellFragments = {};
    else for (const k of Object.keys(p.hellFragments)) if (!k || typeof k !== "string") delete p.hellFragments[k];
    if (typeof p.hellUnlocked !== "boolean") p.hellUnlocked = !!p.hellUnlocked;
    if (typeof p.hellTowersUnlocked !== "boolean") p.hellTowersUnlocked = !!p.hellTowersUnlocked;
    if (typeof p.hellEntered !== "boolean") p.hellEntered = !!p.hellEntered;
    if (p.hellSpawn && (typeof p.hellSpawn.x !== "number" || typeof p.hellSpawn.y !== "number")) p.hellSpawn = null;
   if (!p.dungeonFloors || typeof p.dungeonFloors !== "object" || Array.isArray(p.dungeonFloors)) p.dungeonFloors = {};
   else {
      // sanitize hand edits / stale shapes: baseId -> max level (number >= 1)
      for (const k of Object.keys(p.dungeonFloors)) {
        const v = p.dungeonFloors[k] | 0;
        if (!(v >= 1)) delete p.dungeonFloors[k];
        else p.dungeonFloors[k] = v;
      }
    }
    // Eject: the emergency escape every hero knows (no tome, no MP, 50s).
    // New heroes start with it beside Fireball; old saves learn it here.
    if (p.kind === "player") {
      if (Array.isArray(p.abilities) && !p.abilities.includes("eject") && AB()["eject"]) p.abilities.push("eject");
      if (Array.isArray(p.unlocked) && !p.unlocked.includes("eject") && AB()["eject"]) p.unlocked.push("eject");
    }
    if (!Array.isArray(p.hotbar)) {
      // Fresh bar (very old / corrupt save): build the new-game loadout
      // (slot 1 sword, slot 2 fireball, slot 3 eject), not a packed
      // ability list. Non-player entities keep the generic packing.
      if (p && p.kind === "player") {
        const n0 = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
        p.hotbar = new Array(n0).fill(null);
        try { if (window.Items && window.Items.addItem && window.Items.countItem && window.Items.countItem(p, "rusted_sword") < 1) window.Items.addItem(p, "rusted_sword", 1); } catch (e) { }
        if (!p.equipment || typeof p.equipment !== "object") p.equipment = { weapon: null, armor: null, trinket: null, shield: null };
        else for (const s of ["weapon", "armor", "trinket", "shield"]) if (!(s in p.equipment)) p.equipment[s] = null;
        if (!p.equipment.weapon) p.equipment.weapon = "rusted_sword";
        p.hotbar[0] = { kind: "item", id: "rusted_sword" };
        if (Array.isArray(p.abilities) && p.abilities.includes("fireball") && AB()["fireball"]) p.hotbar[1] = { kind: "ability", id: "fireball" };
        if (Array.isArray(p.abilities) && p.abilities.includes("eject") && AB()["eject"] && p.hotbar.length > 2) p.hotbar[2] = { kind: "ability", id: "eject" };
      } else p.hotbar = defaultHotbar(p.abilities);
    }
    else {
      const n = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
      // normalize entries + length (Space is the 10th slot now, not retired).
      try {
        if (p.hotbar.length > n) {
          const extra = p.hotbar.slice(n);
          p.hotbar.length = n;
          for (const s of extra) {
            if (s && s.kind === "item" && s.id && window.Items && window.Items.addItem) {
              try { window.Items.addItem(p, s.id, 1); } catch (e2) { }
            }
          }
        } else p.hotbar.length = n;
      } catch (e) { try { p.hotbar.length = n; } catch (e2) { } }
      for (let i = 0; i < n; i++) {
        const s = p.hotbar[i];
        if (s && ((s.kind === "ability" && AB()[s.id]) || (s.kind === "item" && s.id))) continue;
        p.hotbar[i] = null;
      }
      // Attack-slot authority heals old saves: equipment.weapon follows the
      // player's default weapon slot (slot 1 until they pick another).
      try {
        if (p && p.kind === "player") {
          let d = (p.defaultWeaponSlot == null) ? 0 : (Number(p.defaultWeaponSlot) === -1 ? -1 : (p.defaultWeaponSlot | 0));
          if (d !== -1 && (!(d >= 0) || d >= p.hotbar.length)) d = 0;
          p.defaultWeaponSlot = d;
          // Off-hand authority heals the same way (slot 4 until picked).
          // -1 ("No slot") is a deliberate bare-fists parry — preserve it.
          let o = (p.offhandSlot == null) ? 3 : (Number(p.offhandSlot) === -1 ? -1 : (p.offhandSlot | 0));
          if (o !== -1 && (!(o >= 0) || o >= p.hotbar.length)) o = 3;
          p.offhandSlot = o;
        }
      } catch (e) { }
      try { if (p && p.kind === "player" && window.Items && window.Items.syncPlayerAttackWeapon) window.Items.syncPlayerAttackWeapon(p); } catch (e) {}
      // Default Eject bind (slot 3): old saves already know Eject from the
      // backfill above — park it in slot 3 when that slot is free and Eject
      // isn't already bound elsewhere, but never when slot 3 IS the player's
      // Attack or Off-hand slot (both may be deliberately empty). Never
      // overwrites a custom bind.
      try {
        if (p && p.kind === "player" && p.hotbar.length > 2 && AB()["eject"] && !p.hotbar[2] && (p.defaultWeaponSlot | 0) !== 2 && (p.offhandSlot == null || (p.offhandSlot | 0) !== 2)) {
          const bound = p.hotbar.some(s => s && s.kind === "ability" && s.id === "eject");
          if (!bound) p.hotbar[2] = { kind: "ability", id: "eject" };
        }
      } catch (e) {}
    }
    if (!p.equipment) p.equipment = { weapon: null, armor: null, trinket: null, shield: null };
    else for (const s of ["weapon", "armor", "trinket", "shield"]) if (!(s in p.equipment)) p.equipment[s] = null;
    if (!Array.isArray(p.inventory)) p.inventory = [];
    // Slash + Quick Shot are fully retired — melee is a real weapon swing and
    // archers loose real arrows now. Strip both, clear their binds, and turn
    // leftover Quick Shot tomes into iron arrows.
    for (const dead of ["slash", "quickshot"]) {
      if (Array.isArray(p.abilities)) p.abilities = p.abilities.filter(a => a !== dead);
      if (Array.isArray(p.unlocked)) p.unlocked = p.unlocked.filter(a => a !== dead);
      if (p.spellPerks && p.spellPerks[dead]) delete p.spellPerks[dead];
      if (p.cooldowns && p.cooldowns[dead]) delete p.cooldowns[dead];
    }
    if (Array.isArray(p.hotbar)) {
      for (let i = 0; i < p.hotbar.length; i++) {
        const s = p.hotbar[i];
        if (s && s.kind === "ability" && s.id === "slash") {
          if (i === 0) {
            try { window.Items.addItem(p, "rusted_sword", 1); } catch (e) { }
            if (!p.equipment.weapon) p.equipment.weapon = "rusted_sword";
            p.hotbar[i] = { kind: "item", id: "rusted_sword" };
          } else p.hotbar[i] = null;
        } else if (s && s.kind === "ability" && s.id === "quickshot") p.hotbar[i] = null;
      }
    }
    try {
      const tq = window.Items && window.Items.countItem ? window.Items.countItem(p, "tome_quickshot") : 0;
      if (tq > 0) {
        window.Items.removeItem(p, "tome_quickshot", tq);
        window.Items.addItem(p, "arrow_iron", tq * 3);
      }
    } catch (e) { }
    // Frostbolt retired (replaced by Frostbite): migrate old saves forward.
    try {
      const swapAb = (from, to) => {
        if (Array.isArray(p.abilities) && p.abilities.includes(from)) {
          p.abilities = p.abilities.filter(a => a !== from);
          if (!p.abilities.includes(to)) p.abilities.push(to);
        }
        if (Array.isArray(p.unlocked) && p.unlocked.includes(from)) {
          p.unlocked = p.unlocked.filter(a => a !== from);
          if (!p.unlocked.includes(to)) p.unlocked.push(to);
        }
        if (p.spellPerks && p.spellPerks[from]) {
          try {
            const q = p.spellPerks[from] || {};
            const t = p.spellPerks[to] || {};
            p.spellPerks[to] = {
              potency: Math.max(t.potency | 0, q.potency | 0),
              efficiency: Math.max(t.efficiency | 0, q.efficiency | 0),
              mastery: Math.max(t.mastery | 0, q.mastery | 0),
              surge: Math.max(t.surge | 0, q.surge | 0),
            };
          } catch (e2) { }
          delete p.spellPerks[from];
        }
        if (p.cooldowns && p.cooldowns[from] != null) delete p.cooldowns[from];
      };
      swapAb("frostbolt", "frostbite");
      if (Array.isArray(p.hotbar)) {
        for (let i = 0; i < p.hotbar.length; i++) {
          const s = p.hotbar[i];
          if (s && s.kind === "ability" && s.id === "frostbolt") p.hotbar[i] = { kind: "ability", id: "frostbite" };
        }
      }
      try {
        const nt = window.Items && window.Items.countItem ? window.Items.countItem(p, "tome_frostbolt") : 0;
        if (nt > 0) { window.Items.removeItem(p, "tome_frostbolt", nt); window.Items.addItem(p, "tome_frostbite", nt); }
      } catch (e2) { }
    } catch (e) { }
    // ---- tames / mounts / stable (Nov 2026) ----
    // player.tames: every tamed beast lives here forever (persisted in psave).
    // {id,kind,name,lv,xp,hp,maxHp,mp,maxMp,atk,def,spd,x,y,inParty,stabled,riding}
    // player.activeMountId: your designated beast (ridden when p.mounted, else
    // standing by loose). p.mounted: actually riding right now.
    if (!Array.isArray(p.tames)) p.tames = [];
    if (p.activeMountId === undefined) p.activeMountId = null;
    if (typeof p.mounted !== "boolean") p.mounted = !!p.activeMountId;
    // backfill + clamp old/broken tame rows (old saves, hand edits)
    try {
      for (const t of p.tames) {
        if (!t || typeof t !== "object") continue;
        if (typeof t.lv !== "number" || !(t.lv >= 1)) t.lv = 1;
        if (typeof t.xp !== "number") t.xp = 0;
        if (typeof t.maxHp !== "number" || !(t.maxHp > 0)) t.maxHp = 40;
        if (typeof t.hp !== "number") t.hp = t.maxHp;
        t.hp = Math.max(0, Math.min(t.maxHp, t.hp));
        if (typeof t.maxMp !== "number") t.maxMp = 0;
        if (typeof t.mp !== "number") t.mp = t.maxMp;
        if (typeof t.atk !== "number") t.atk = 8;
        if (typeof t.def !== "number") t.def = 2;
        if (typeof t.matk !== "number") t.matk = (typeof t.atk === "number" ? t.atk : 8);
        if (typeof t.sdef !== "number") t.sdef = (typeof t.def === "number" ? t.def : 0);
        if (typeof t.spd !== "number") t.spd = 3;
        try { if (t && t.kind && !t.isTame && window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[t.kind]) t.isTame = true; } catch (ee) {}
        if (typeof t.stabled !== "boolean") t.stabled = !!t.stabled;
        if (typeof t.inParty !== "boolean") t.inParty = !t.stabled;
        // heal positionless tames (e.g. black-market buys saved before the
        // purchase stamped a spawn point): snap them to the hero so they
        // render/follow instead of sitting at NaN
        if (!Number.isFinite(t.x) || !Number.isFinite(t.y)) { try { t.x = p.x; t.y = p.y; } catch (ee) { try { t.x = 0; t.y = 0; } catch (e3) {} } }
        if (!t.id) t.id = "t_" + Math.random().toString(36).slice(2, 9);
        if (!t.kind) t.kind = "wolf";
        // black-market fix: pre-fix stock minted invalid kinds (dire_wolf,
        // jackal, fox, cobra, python, giant_rat, raptor, warg, serpent) with
        // the slime template's name/stats, so they render as humanoid NPCs.
        // Repair them to the blob their name promises.
        try {
          if (t.kind && window.CFG && window.CFG.MOB_TEMPLATES && !window.CFG.MOB_TEMPLATES[t.kind]) {
            t.kind = "slime";
            try { t.tint = (window.CFG.MOB_TEMPLATES.slime || {}).tint || "#5dd66b"; } catch (eTint) {}
            if (!t.name || /dire.?wolf|jackal|^fox$|cobra|python|giant.?rat|^raptor$|^warg$|^serpent$/i.test(String(t.name))) {
              try { t.name = (window.CFG.MOB_TEMPLATES.slime || {}).name || "Slime"; } catch (eN) { t.name = "Slime"; }
            }
          }
        } catch (eKind) {}
        if (!t.name) { try { const tpl = (window.CFG.MOB_TEMPLATES || {})[t.kind]; t.name = (tpl && tpl.name) || t.kind; } catch (e2) { t.name = t.kind; } }
        if (typeof t.breeding !== "boolean") t.breeding = !!t.breeding;
        if (t.breeding) { t.stabled = false; t.inParty = false; }
        if (!t.equipment || typeof t.equipment !== "object") t.equipment = { weapon: null, armor: null, trinket: null, shield: null };
        else for (const s of ["weapon", "armor", "trinket", "shield"]) if (!(s in t.equipment)) t.equipment[s] = null;
        // old-save tames predate war-gear: fit the steel + plate their arts need
        try {
          const hasTech = Array.isArray(t.abilities) && t.abilities.some(a => { try { return window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind === "technique"; } catch (e2) { return false; } });
          if (hasTech && !t.equipment.weapon && !t.equipment.shield) {
            const g = mobTechniqueGear(t.kind, t.lv);
            if (g) {
              if (g.weapon && window.Items && window.Items.ITEMS[g.weapon]) t.equipment.weapon = g.weapon;
              if (g.shield && window.Items && window.Items.ITEMS[g.shield]) t.equipment.shield = g.shield;
            }
          }
          // plate for old catches: same band + track as a fresh wild spawn
          if (!t.equipment.armor) {
            try {
              const Tt = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[t.kind] || {};
              const tier = mobWarTier(t.lv, false, (Tt.xp | 0) || 0);
              const aid = mobArmorIdForTier(mobArmorTrack(t.kind, Tt), tier);
              if (aid) t.equipment.armor = aid;
            } catch (eA) { }
          }
          // wild-caught weapon for old catches that somehow walk unarmed
          if (!t.equipment.weapon && !t.equipment.shield) {
            try {
              const Tt = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[t.kind] || {};
              const tier = mobWarTier(t.lv, false, (Tt.xp | 0) || 0);
              const fams = ["sword", "spear", "axe", "hammer", "dagger", "whip", "bow"];
              for (const fam of fams) {
                const id = gearIdForFamTier(fam, tier);
                if (id && window.Items && window.Items.ITEMS[id]) { t.equipment.weapon = id; break; }
              }
            } catch (eW) { }
          }
        } catch (e2) { }
      }
      if (p.activeMountId) {
        const m = p.tames.find(t => t && t.id === p.activeMountId);
        if (!m || m.stabled || !(m.hp > 0)) p.activeMountId = null;
        else {
          try {
            const tpl = (window.CFG.MOB_TEMPLATES || {})[m.kind];
            if (!tpl || !tpl.mount) p.activeMountId = null;
            // lent out since: someone else rides it now, not you
            if (m.riderId) p.activeMountId = null;
            if (m.breeding) p.activeMountId = null;
          } catch (e2) { p.activeMountId = null; }
        }
      }
    } catch (e) { }
    // ---- beast-lodge breeding jobs (timed hand-over, per settlement) ----
    // p.breedJobs: [{id,aId,bId,bestiaryKey,bestiaryName,startAt,readyAt,cost}]
    // Parents carry breeding=true + breedingJobId while lodged; offspring are
    // minted on collect (see makeBreedOffspring) so old saves need no shape.
    try {
      if (!Array.isArray(p.breedJobs)) p.breedJobs = [];
      else {
        const seen = {};
        try { for (const t of (p.tames || [])) if (t && t.id) seen[t.id] = true; } catch (e2) {}
        p.breedJobs = p.breedJobs.filter(j => j && j.aId && j.bId && seen[j.aId] && seen[j.bId]);
        for (const j of p.breedJobs) {
          if (typeof j.startAt !== "number") j.startAt = Date.now();
          if (typeof j.readyAt !== "number") j.readyAt = j.startAt + 180000;
          if (!j.id) j.id = "b_" + Math.random().toString(36).slice(2, 9);
          if (!j.bestiaryKey) j.bestiaryKey = "wilds";
          if (!j.bestiaryName) j.bestiaryName = "Bestiary";
          if (typeof j.cost !== "number") j.cost = 0;
        }
        // heal orphaned breeding flags (job gone but beast still marked)
        try {
          const jobIds = {};
          for (const j of p.breedJobs) jobIds[j.id] = true;
          for (const t of (p.tames || [])) {
            if (t && t.breeding && (!t.breedingJobId || !jobIds[t.breedingJobId])) {
              t.breeding = false; try { delete t.breedingJobId; } catch (e2) {}
              if (typeof t.stabled !== "boolean") t.stabled = false;
              if (typeof t.inParty !== "boolean") t.inParty = !t.stabled;
            }
          }
        } catch (e2) {}
      }
    } catch (e) { try { if (!Array.isArray(p.breedJobs)) p.breedJobs = []; } catch (e2) {} }
    // ---- inn rooms (global retirement for party members + slaves) ----
    // p.innRooms: array of npcId|null (one cell per room, null = open bed);
    // p.innUnlock: how many rooms are open (the rest are unbought). NPCs
    // themselves persist in the wnpcs store with inInn=true; the game.js
    // inn helpers (innRoomsEnsure/innUnlockEnsure) do the full healing.
    try {
      if (!Array.isArray(p.innRooms)) p.innRooms = [];
      if (!(p.innUnlock >= 1)) {
        let free = 2;
        try { free = (window.CFG && window.CFG.INN_ECON && window.CFG.INN_ECON.FREE_ROOMS) || 2; } catch (e2) {}
        p.innUnlock = Math.max(free, p.innRooms.filter(id => !!id).length);
      }
    } catch (e) { try { if (!Array.isArray(p.innRooms)) p.innRooms = []; } catch (e2) {} }
    // racial stat bonus (idempotent via p.race): old saves gain their race's
    // bonus once here; new heroes already carry it from makePlayer.
    try { syncRace(p); } catch (e) { }
    return p;
  }
  function migratePlayer(p) {
    ensureProgression(p);
    // Delves now end (god-delve 5, ordinary delves deterministic 12-15 —
    // same hash as Game.delveEndLevel, duplicated here so migration never
    // depends on Game load order): truncate charted depths past the bottom,
    // and pull heroes saved deeper than the bottom back to the entrance
    // (level 1 — the load path then loads the entrance floor).
    try {
      const capFor = (bid) => {
        try {
          const b = String(bid || "").replace(/_L\d+$/, "");
          if (b.indexOf("_god") >= 0) return 5;
          let h = 0;
          for (let i = 0; i < b.length; i++) h = (Math.imul(h, 31) + b.charCodeAt(i)) | 0;
          h >>>= 0;
          return 12 + (h % 4);
        } catch (e) { return 12; }
      };
      if (p.dungeonFloors && typeof p.dungeonFloors === "object") {
        for (const k of Object.keys(p.dungeonFloors)) {
          try {
            const cap = capFor(k);
            if (((p.dungeonFloors[k] | 0) || 0) > cap) p.dungeonFloors[k] = cap;
          } catch (e2) {}
        }
      }
      if (p.inDungeon) {
        const base = String(p.inDungeon).replace(/_L\d+$/, "");
        const cap = capFor(base);
        p.inDungeon = base;
        if (((p.dungeonLevel | 0) || 1) > cap) p.dungeonLevel = 1;
      }
    } catch (e) {}
    // v19 parallel universes: hell mirrors the surface at shared coordinates —
    // the old far-off continent (16000,0) is retired. Relocate anyone stranded
    // on the retired ground into the new hell, drop out-of-disc hell positions,
    // and prune stale tower pins. Practice heroes are exempt — the practice
    // grounds allow teleporting into the void on purpose.
    try {
      if (p.dim !== "hell" && p.dim !== "heaven" && p.dim !== "surf") p.dim = "surf";
      if (!p.posByDim || typeof p.posByDim !== "object") p.posByDim = {};
      if (!p.posByDim.surf || !isFinite(+p.posByDim.surf.x)) p.posByDim.surf = { x: p.x, y: p.y };
      if (p.dim === "surf") p.posByDim.surf = { x: p.x, y: p.y };
      else if (p.dim === "heaven") { if (!p.posByDim.heaven || !isFinite(+p.posByDim.heaven.x)) p.posByDim.heaven = { x: p.x, y: p.y }; }
      else if (!p.posByDim.hell || !isFinite(+p.posByDim.hell.x)) p.posByDim.hell = { x: p.x, y: p.y };
      const inHell = (x, y) => { try { return !!(window.Hell && window.Hell.isHellGround && window.Hell.isHellGround(x, y)); } catch (e) { return false; } };
      const onRetired = (x, y) => { try { return Math.hypot(x - 16000, y) < 3550; } catch (e) { return false; } };
      try {
        // legacy hell-continent heroes (saved on the retired ground, with or
        // without a dim flag): carry into the new hell at a fresh entry ring.
        if (!p.practice && onRetired(p.x, p.y)) {
          let C = { x: 0, y: 0 };
          try { if (window.Hell && window.Hell.CENTER) C = window.Hell.CENTER; } catch (e) {}
          const a = Math.random() * Math.PI * 2, r = 2200 + Math.random() * 600;
          const ex = C.x + Math.cos(a) * r, ey = C.y + Math.sin(a) * r;
          p.dim = "hell";
          p.x = ex; p.y = ey;
          p.posByDim.hell = { x: ex, y: ey };
          p.posByDim.surf = { x: 2.5, y: 4.5 };
          try { p.hellSpawn = { x: ex, y: ey }; p.hellEntered = true; } catch (e2) {}
        }
        // hell heroes standing outside the new hell ground (stale positions):
        // fall back to the recorded side, else a fresh entry ring.
        if (!p.practice && p.dim === "hell" && !inHell(p.x, p.y)) {
          const back = p.posByDim && p.posByDim.hell;
          if (back && isFinite(+back.x) && isFinite(+back.y) && inHell(+back.x, +back.y)) {
            p.x = +back.x; p.y = +back.y;
          } else {
            let C = { x: 0, y: 0 };
            try { if (window.Hell && window.Hell.CENTER) C = window.Hell.CENTER; } catch (e) {}
            const a = Math.random() * Math.PI * 2, r = 2200 + Math.random() * 600;
            p.x = C.x + Math.cos(a) * r; p.y = C.y + Math.sin(a) * r;
            p.posByDim.hell = { x: p.x, y: p.y };
          }
        }
        // stale hell-side memories outside the new disc resolve nowhere —
        // drop them so tower travel recomputes instead of stranding.
        try {
          const hb = p.posByDim && p.posByDim.hell;
          if (hb && isFinite(+hb.x) && !inHell(+hb.x, +hb.y)) p.posByDim.hell = null;
        } catch (e) {}
        try {
          if (p.hellSpawn && isFinite(+p.hellSpawn.x) && !inHell(+p.hellSpawn.x, +p.hellSpawn.y)) p.hellSpawn = null;
        } catch (e) {}
      } catch (e) {}
      // stale tower pins (old 16xxx,0 numbers) never match the current lists.
      try {
        const validPins = new Set();
        try {
          const H = window.Hell;
          for (const tw of ((H && H.SURFACE_TOWERS) || []).concat((H && H.HELL_TOWERS) || [])) {
            validPins.add("Hell Tower 🗼 " + (tw.x | 0) + "," + (tw.y | 0));
          }
        } catch (e2) {}
        if (Array.isArray(p.seenPlaces)) {
          p.seenPlaces = p.seenPlaces.filter(nm => {
            if (typeof nm !== "string") return true;
            if (nm.indexOf("Hell Tower 🗼") !== 0) return true;
            return validPins.has(nm);
          });
        }
      } catch (e) {}
    } catch (e2) {}
    recalcDerived(p, true); return p;
  }
  function equipBonuses(p) {
    const out = { atk: 0, matk: 0, def: 0, sdef: 0, maxHp: 0, maxMp: 0, maxStamina: 0, spd: 0 };
    try {
      if (!window.Items || !p.equipment) return out;
      for (const slot of ["weapon", "armor", "trinket", "shield"]) {
        const id = p.equipment[slot];
        const it = id && window.Items.ITEMS[id];
        // gear upgrades: the hero's smith/arcane/altar/dojo work boosts every
        // flat stat the piece grants (+50% of base per level, 5 max). Work is
        // per COPY — the worn copy's own levels count (see equipmentUp).
        // Trinkets have no upgrade venue and always count unboosted.
        let upMult = 1;
        if (slot !== "trinket" && window.Items && window.Items.gearSlotMult) {
          try { upMult = window.Items.gearSlotMult(p, slot) || 1; } catch (e) { upMult = 1; }
        }
        if (it && it.bonus) for (const k of Object.keys(out)) if (it.bonus[k]) out[k] += it.bonus[k] * upMult;
        // legacy armor DEF also guards against spells (keeps old armor useful
        // now that physical/spell defence are split)
        if (it && it.bonus && it.bonus.def && slot === "armor") out.sdef += it.bonus.def * upMult;
      }
      // Shield Guard: a worn shield guards harder with every rank
      try {
        if (p && p.kind === "player" && p.equipment && p.equipment.shield) {
          const g = wrank(p, "shield", "guard") | 0;
          if (g > 0) { out.def += g; out.sdef += g; }
          if (wrank(p, "shield", "aegis") > 0) { out.def += 2; out.sdef += 2; }
        }
      } catch (e2) { }
      // Guard shells: Stoneskin / Wardweave ranks harden the worn shell.
      try {
        if (p && p.kind === "player") {
          out.def += armorDefBonus(p) || 0;
          out.sdef += robeSdefBonus(p) || 0;
          out.maxHp += armorHpBonus(p) || 0;
          out.maxMp += robeMpBonus(p) || 0;
          out.matk += robeMatkBonus(p) || 0;
          out.atk += kasayaAtkBonus(p) || 0;
          out.matk += habitusMatkBonus(p) || 0;
          out.maxMp += habitusMpBonus(p) || 0;
          out.maxStamina += kasayaStaminaBonus(p) || 0;
        }
      } catch (e2) { }
    } catch (e) { }
    return out;
  }
 // Recompute derived stats from level + attributes + equipment. Keeps current hp/mp/stamina (clamped).
 // Stat formulas (doubled per-point boosts — the lines below are the
 // authority; the older per-spec draft above them is retired):
  //  STR +10 phys dmg (ATK), +1% melee dmg, +1% flurry dmg per pt
   //  END +10 phys DEF, +10 max stamina, +0.25 flat stamina regen per pt
   //  FOR +10 max HP, +10 spell defence, +0.25 flat HP regen per pt
   //  INT +10 MATK, +10 max MP, +0.25 flat MP regen per pt (+1% spell dmg per pt via magicDmgMult)
  //  CHA +5 ATK/MATK/DEF/SDEF to party members + tamed beasts, +4% loyalty per pt
  //  LUK +2% crit, crits +10% dmg, +0.5% dodge per pt
  //  AGI +0.05 move speed, +0.5% weapon & flurry speed per pt
  function maxStaminaFor(p) {
    try {
      const end = ((p && p.stats && p.stats.end) | 0) || 5;
      return Math.max(20, Math.round(100 + (end - 5) * 10));
    } catch (e) { return 100; }
  }
  function recalcDerived(p, keepCurrent = true) {
    ensureProgression(p);
    const s = p.stats;
    const hp = p.hp, mp = p.mp, st = p.stamina;
    // Pure stats: flat bases, no level term. Levels grant stat points (see
    // gainXp); the points do the work, never the level number itself.
    const baseHp = 40, baseMp = 20;
    const baseAtk = 8, baseMatk = 8, baseDef = 3, baseSdef = 3;
    const baseSpd = 3.4;
    const eq = equipBonuses(p);
    p.maxHp = Math.max(1, Math.round(baseHp + (s.for - 5) * 10 + (eq.maxHp || 0)));
    p.maxMp = Math.max(0, Math.round(baseMp + (s.int - 5) * 10 + (eq.maxMp || 0)));
    p.atk = Math.max(1, Math.round(baseAtk + (s.str - 5) * 10 + (eq.atk || 0)));
    // MATK mirrors ATK for magic: INT + gear, mitigated by SDEF instead of DEF.
    p.matk = Math.max(1, Math.round(baseMatk + (s.int - 5) * 10 + (eq.matk || 0)));
    p.def = Math.max(0, Math.round(baseDef + (s.end - 5) * 10 + (eq.def || 0)));
    p.sdef = Math.max(0, Math.round(baseSdef + (s.for - 5) * 10 + (eq.sdef || 0)));
    let spdBonus = (eq.spd || 0);
    // Fleetfoot: faster feet while a dagger is wielded
    try {
      if (p.kind === "player" && wieldedFamily(p) === "dagger") spdBonus += baseSpd * 0.04 * wrank(p, "dagger", "fleet");
    } catch (e) { }
    p.spd = Math.max(1.5, baseSpd + (s.agi - 5) * 0.05 + spdBonus);
    p.maxStamina = Math.max(20, maxStaminaFor(p) + (eq.maxStamina || 0));
    if (typeof p.stamina !== "number" || !(p.stamina >= 0)) p.stamina = p.maxStamina;
    p.stamina = Math.max(0, Math.min(p.maxStamina, p.stamina));
    if (typeof p.sdef !== "number" || !(p.sdef >= 0)) p.sdef = Math.max(0, Math.round(baseSdef + (s.for - 5) * 10 + (eq.sdef || 0)));
    if (keepCurrent) {
      if (typeof hp === "number") p.hp = Math.min(p.maxHp, Math.max(0, hp));
      if (typeof mp === "number") p.mp = Math.min(p.maxMp, Math.max(0, mp));
      if (typeof st === "number") p.stamina = Math.min(p.maxStamina, Math.max(0, st));
    } else { p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina; }
    return p;
  }
  function makePlayer(name = "Wanderer", appearance = null, tint = null, gender = null) {
    const s = baseStats(1);
    const p = {
      id: "player", kind: "player", name, role: "adventurer", tint: tint || "#4da3ff",
      gender: normalizeGender(gender) || "male",
      ...s, hp: s.hp, mp: s.mp,
      x: 2.5, y: 4.5, px: 0, py: 0, face: 1, inDungeon: null,
      // v18 dimension: surf/hell/heaven; posByDim remembers each side.
      dim: "surf", posByDim: { surf: { x: 2.5, y: 4.5 }, hell: null, heaven: null },
      abilities: ["fireball", "eject"], unlocked: ["fireball", "eject"],
      gold: 100, inventory: [{ id: "potion", n: 3 }, { id: "rusted_sword", n: 1 }],
      equipment: { weapon: "rusted_sword", armor: null, trinket: null, shield: null },
      party: [], cooldowns: {}, buffs: {}, kills: 0, deaths: 0, playTime: 0,
    };
    ensureProgression(p);
    // chosen look (creator modal) wins over the default backfill above
    try {
      if (window.Appearance && appearance && typeof appearance === "object") {
        p.appearance = window.Appearance.sanitize(appearance, "adventurer");
      }
    } catch (e) { }
    // racial bonus follows the final look (idempotent: default human bonus
    // from ensureProgression is swapped, never stacked)
    try { syncRace(p); } catch (e) { }
    p.hotbar[0] = { kind: "item", id: "rusted_sword" };
    p.hotbar[1] = { kind: "ability", id: "fireball" };
    p.hotbar[2] = { kind: "ability", id: "eject" };
    recalcDerived(p, false);
    return p;
  }
  function roleMult(role) {
    switch (role) {
      case "warrior": case "guard": return { hp: 1.35, mp: 0.7, atk: 1.25, matk: 0.8, def: 1.3 };
      case "mage": case "scholar": return { hp: 0.8, mp: 1.6, atk: 1.3, matk: 1.6, def: 0.8 };
      case "healer": return { hp: 1.0, mp: 1.5, atk: 0.85, matk: 1.5, def: 1.0 };
      case "rogue": case "hunter": case "ninja": case "thief": return { hp: 0.95, mp: 0.9, atk: 1.1, matk: 0.9, def: 0.9 };
      default: return { hp: 1, mp: 1, atk: 1, matk: 1, def: 1 };
    }
  }
  function makeNpcStatBlock(lv, role, dist) {
    const m = roleMult(role);
    // Role shapes the body AND level grows it: frontier folk are tougher than
    // villagers (same accelerating curve family as mobs, gentler rates, caps
    // binding at 100). Level 1 is exactly the old body, so early towns and
    // old saves backfill identically — higher levels climb from there.
    lv = Math.max(1, Math.round(lv || 1));
    const lf = mobLevelFactor(lv);
    const L100 = mobLevelFactor(100);
    const g2 = (r) => Math.min(1 + r * L100, 1 + r * lf);
    const s = baseStats(1, 1);
    return {
      lv, xp: 0,
      maxHp: Math.max(1, Math.round(s.maxHp * m.hp * g2(0.022))),
      maxMp: Math.max(0, Math.round(s.maxMp * m.mp * g2(0.020))),
      atk: Math.max(1, Math.round(s.atk * m.atk * g2(0.018))),
      matk: Math.max(1, Math.round(s.matk * (m.matk != null ? m.matk : m.atk) * g2(0.018))),
      def: Math.max(0, Math.round(s.def * m.def * g2(0.015))),
      // no sdef: combatSdef falls back to DEF + gear for NPCs without sdef,
      // so spell defence tracks physical defence automatically
      spd: s.spd,
    };
  }
  // ---- per-mob growth roles (Nov 2026) ----
  // Every kind scales differently: its template is the level-1 body and each
  // stat grows with its own initial rate, ACCELERATING with level so gains
  // keep the same proportions but get bigger (a 32->33 bump grants ~3x what
  // 2->3 did). Canonically stronger kinds (higher xp) scale harder; bosses
  // scale hardest. Casters pour growth into MP + spell power (matk),
  // bruisers into ATK + HP, tanks into DEF, speedsters into SPD — so each of
  // the 90+ kinds has its own distribution. Ordinary kinds climb to their
  // 100 ceiling, warlords to 125 (see mobGrowth).
  const MOB_ACCEL_D = 30; // shared accel divisor: gain proportions stay constant across levels
  function mobLevelFactor(lv) { const n = Math.max(0, (lv | 0) - 1); return n * (1 + n / MOB_ACCEL_D); }
  const MOB_SPELL_KINDS = new Set(["projectile", "aoe", "cataclysm", "heal", "support", "revive", "buff"]);
  function mobArchetype(kind, t) {
    try {
      t = t || {};
      const abs = Array.isArray(t.abilities) ? t.abilities : [];
      let combat = 0, sup = 0;
      for (const a of abs) {
        if (PHYSICAL.has(a)) continue; // whirlwind/strike/bowshot are physical vehicles
        let k = null;
        try { k = window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind; } catch (e2) { }
        if (k === "projectile" || k === "aoe" || k === "cataclysm") combat++;
        else if (MOB_SPELL_KINDS.has(k)) sup++;
      }
      const caster = Math.min(1, combat * 0.35 + sup * 0.15);
      const body = t.body || "";
      const bodyPhys = (body === "brute" || body === "beast" || body === "swarm" || body === "construct") ? 0.45
        : (body === "serpent" || body === "blob" || body === "winged") ? 0.25 : 0.15;
      const physical = Math.min(1, bodyPhys + (abs.indexOf("whirlwind") >= 0 ? 0.25 : 0) + ((((t.mp | 0) || 0) === 0) ? 0.3 : 0) + (caster < 0.3 ? 0.15 : 0));
      const tanky = Math.min(1, Math.max(0, ((((t.def | 0) || 0)) - 2) / 8));
      const speedy = Math.min(1, Math.max(0, (((t.spd || 3)) - 3.2) / 1.8));
      const strength = 0.35 + Math.sqrt(Math.max(0, (((t.xp | 0) || 10)) / 50)) * 0.5;
      return { caster, physical, tanky, speedy, strength };
    } catch (e) { return { caster: 0, physical: 0.5, tanky: 0, speedy: 0, strength: 0.6 }; }
  }
  function mobGrowth(kind, t) {
    const a = mobArchetype(kind, t);
    let isBoss = false;
    try { isBoss = !!(t && (t.boss || (window.CFG.BOSS_KINDS || []).indexOf(kind) >= 0)); } catch (e) { }
    // v251 tiered warlord growth (experiment): unlock tier paces level
    // scaling — low tiers barely compound, mid tiers climb, high tiers climb
    // harder, hell tiers harder still, Peter/goddess steepest. The 0.15 base
    // tames the old runaway (boss pools used to 60-180x by the cap); flat
    // bulk below carries boss identity instead.
    let bossTier = 0;
    try { bossTier = isBoss ? (((window.CFG.BOSS_MIN_EFF || {})[kind] | 0) || 1) : 0; } catch (e) { bossTier = isBoss ? 1 : 0; }
    const tierG = isBoss ? 0.15 * (1 + Math.max(0, bossTier - 1) * 0.35) : 1;
    const s = a.strength + (isBoss ? 0.25 : 0);
    // Per-stat growth rates: the template is the level-1 body; gains keep
    // the same proportions but get bigger with level via mobLevelFactor.
    const rHp = (0.030 + 0.030 * s) * (1 + 0.30 * a.tanky) * tierG;
    const rMp = (0.030 + 0.030 * s) * (1 + 0.90 * a.caster) * tierG;
    const rAtk = (0.020 + 0.020 * s) * (1 + 0.70 * a.physical) * tierG;
    const rMatk = (0.020 + 0.020 * s) * (1 + 1.00 * a.caster) * tierG;
    const rDef = (0.025 + 0.020 * s) * (1 + 0.60 * a.tanky) * tierG;
    const rSdef = (0.025 + 0.020 * s) * (1 + 0.60 * Math.max(a.caster, a.tanky * 0.5)) * tierG;
    // Stat ceilings. Ordinary kinds climb all the way to their 100 ceiling
    // and warlords to 125 (high-tier gear carries heroes past 60: a lv120
    // ancient should not wear the same body as its lv60 self). Caps are
    // tuned per stat so each curve binds exactly at its kind's ceiling —
    // identical to before at every level below the old plateau, climbing
    // after. SPD gets limited headroom instead of a full uncap so turn
    // order never runs away (+1.5 boss, +1.0 ordinary).
    const LFCAP125 = mobLevelFactor(125);
    const LFCAP100 = mobLevelFactor(100);
    return {
      hp: rHp,
      mp: rMp,
      atk: rAtk,
      matk: rMatk,
      def: rDef,
      sdef: rSdef,
      stam: 0.015 + 0.010 * s + (isBoss ? 0.015 : 0),
      spdRate: 0.003 + 0.025 * a.speedy + 0.002 * s,
      spdCap: (0.4 + 1.1 * a.speedy) + (isBoss ? 1.5 : 1.0),
      hpCap: 1 + rHp * (isBoss ? LFCAP125 : LFCAP100),
      mpCap: 1 + rMp * (isBoss ? LFCAP125 : LFCAP100),
      atkCap: 1 + rAtk * (isBoss ? LFCAP125 : LFCAP100),
      matkCap: 1 + rMatk * (isBoss ? LFCAP125 : LFCAP100),
      defCap: 1 + rDef * (isBoss ? LFCAP125 : LFCAP100),
      sdefCap: 1 + rSdef * (isBoss ? LFCAP125 : LFCAP100),
      stamCap: isBoss ? 30 : Math.max(10, 1 + (0.015 + 0.010 * s) * LFCAP100),
      isBoss: isBoss,
    };
  }
  function mobScaledStat(base, rate, lf, cap) {
    base = base | 0;
    if (!(base > 0)) return 0;
    const mult = Math.min(cap, 1 + rate * lf);
    return Math.max(1, Math.round(base * mult));
  }
  function makeMob(kind, lv, dist = 50, depth = 0) {
    const t = window.CFG.MOB_TEMPLATES[kind] || window.CFG.MOB_TEMPLATES.slime;
    // level cap 100 for ordinary mobs; mythic bosses may rise to 125 (ancient ground)
    const isBossKind = !!(t.boss || (window.CFG.BOSS_KINDS && window.CFG.BOSS_KINDS.includes(kind)));
    lv = Math.max(1, Math.round(lv || 1));
    lv = isBossKind ? Math.min(125, lv) : Math.min(100, lv);
    // Per-kind accelerating growth (Nov 2026): the template is the level-1
    // body; each stat grows by its own rate from mobGrowth (casters favor
    // MP/matk, bruisers ATK/HP, tanks DEF, speedsters SPD; stronger kinds
    // and bosses scale harder). Gains keep the same proportions but get
    // bigger with level (32->33 grants ~3x what 2->3 did). XP still scales
    // with the old curve so deep/high-level kills fund the stat points that
    // answer that toughness. Boss KIND tiers apply below (a warlord is a
    // tougher body than its foot soldiers, on top of its own growth).
    const g = mobGrowth(kind, t);
    const lf = mobLevelFactor(lv);
    const n = Math.max(0, (lv | 0) - 1);
    const xpMult = (1 + dist / 110 + depth * 0.45) * (1 + (lv - 1) * 0.22);
    const stamMax = Math.max(20, Math.round(100 * Math.min(g.stamCap != null ? g.stamCap : (isBossKind ? 30 : 10), 1 + g.stam * lf)));
    const mob = {
      id: "m_" + Math.random().toString(36).slice(2, 9), kind, name: t.name, role: "mob",
      tint: t.tint, lv, xp: 0, xpReward: Math.round(t.xp * xpMult),
      maxHp: mobScaledStat(t.hp, g.hp, lf, g.hpCap),
      maxMp: mobScaledStat(t.mp, g.mp, lf, g.mpCap != null ? g.mpCap : g.hpCap),
      atk: mobScaledStat(t.atk, g.atk, lf, g.atkCap),
      // spell power: casters grow this faster than their claws (see
      // abilityDmg — mob spells ride matk, physical rides atk)
      matk: mobScaledStat(t.atk, g.matk, lf, g.matkCap != null ? g.matkCap : g.atkCap),
      def: mobScaledStat(t.def, g.def, lf, g.defCap != null ? g.defCap : g.atkCap),
      sdef: mobScaledStat(t.def, g.sdef, lf, g.sdefCap != null ? g.sdefCap : g.atkCap),
      spd: Math.round(((t.spd || 3) + Math.min(g.spdCap, g.spdRate * n * (1 + n / 60))) * 10) / 10,
      // stamina pools grow too (bosses sprint/flurry/parry off them); the
      // field must exist so the guard never routes a mob through the player
      // derived-stat sheet
      maxStamina: stamMax, stamina: stamMax,
      hp: 0, mp: 0, abilities: [...t.abilities],
      x: 0, y: 0, face: 1, cooldowns: {}, buffs: {}, slowUntil: 0, burnUntil: 0, burnTick: 0, status: {},
      homeX: 0, homeY: 0, aggro: false,
    };
    // sex: fixed kinds (matriarchs, kings, mimics, ...) are set by name;
    // everyone else rolls male/female per individual, stable per id.
    mob.gender = rollGender(kind, mob.id);
    // Boss identity (kind-based, on top of level growth): warlords are a
    // tougher body than their kind's template. Tier = BOSS_MIN_EFF (the
    // lying-gate portal_devourer has none, so it tiers 1). Per-tier bulk
    // from CFG.BOSS_TIER_BULK (v252 fit to the distribution table): low tiers
    // pool UP, hell tiers pool down, Peter/goddess (12) pool modestly — the
    // old 100x band and the v251 HP_T are both gone; the table IS the bulk
    // now. Bulwark: each warlord's spell defence (sdef) runs a little off
    // its physical DEF per BOSS_BULWARK (frail side ~15% lower), so SDEF
    // inherits the DEF band automatically.
    if (isBossKind) {
      try {
        const tier = (window.CFG.BOSS_MIN_EFF && window.CFG.BOSS_MIN_EFF[kind]) || 1;
        const t = Math.max(0, (tier | 0) - 1);
        // v252 tier bulk (fit to the boss distribution table) — per-tier
        // multipliers from CFG.BOSS_TIER_BULK. HP carries tier identity
        // (low tiers pool up, hell tiers pool DOWN vs the old 100x band);
        // ATK/MATK climb gently, DEF is flat per band. SDEF follows DEF via
        // bulwark below, so it inherits the DEF band automatically.
        const TB = (window.CFG && window.CFG.BOSS_TIER_BULK) || null;
        const hpB = (TB && TB.HP[tier] != null) ? TB.HP[tier] : 12.5;
        const atkB = (TB && TB.ATK[tier] != null) ? TB.ATK[tier] : (1 + t * 0.08);
        const matkB = (TB && TB.MATK[tier] != null) ? TB.MATK[tier] : (1 + t * 0.08);
        const defB = (TB && TB.DEF[tier] != null) ? TB.DEF[tier] : (tier <= 2 ? 2.5 : tier >= 12 ? 3.4 : 3.0);
        mob.maxHp = Math.round(mob.maxHp * hpB * ((((window.CFG && window.CFG.BOSS_HP_TRIM) || {})[kind]) || 1));
        mob.atk = Math.round(mob.atk * atkB);
        mob.matk = Math.round((mob.matk || mob.atk) * matkB);
        mob.def = Math.round(mob.def * defB);
        mob.maxMp = Math.round(mob.maxMp * (1 + t * 0.15));
        mob.xpReward = Math.round(mob.xpReward * (1 + t * 0.25));
        try {
          const prof = (window.CFG.BOSS_BULWARK || {})[kind] || {};
          mob.sdef = Math.max(0, Math.round(mob.def * (prof.frail === "mag" ? 0.85 : 1.15)));
        } catch (e2) { }
      } catch (e) { }
    }
    // Individual deviation (Dec 2026): every wild/dungeon spawn rolls its
    // own body — same kind + level are siblings, not clones. Slight, so the
    // template stays honest: HP/MP/ATK ±~8%, DEF/SDEF ±1, SPD ±0.2, XP ±10%.
    // Tames copy the mob they were caught from (see makeTameFromMob), so no
    // two wolves are alike — which is what makes same-kind breeding worth
    // doing (combine a high-HP wolf with a high-ATK one).
    try {
      const V = (window.CFG && window.CFG.MOB_VAR) || {};
      // v251: warlords roll near-template (tamed jitter) — the old ±8%/±1
      // swing on small low-tier bodies was the low-boss coin-flip.
      const bossTame = isBossKind ? 0.4 : 1;
      const fH = ((V.HP != null ? V.HP : 0.08)) * bossTame, fM = ((V.MP != null ? V.MP : 0.10)) * bossTame;
      const fA = ((V.ATK != null ? V.ATK : 0.08)) * bossTame, fX = (V.XP != null ? V.XP : 0.10);
      const sJ = (V.SPD != null ? V.SPD : 0.2);
      const j = (v, f) => Math.max(0, Math.round(v * (1 + (Math.random() * 2 - 1) * f)));
      mob.maxHp = Math.max(1, j(mob.maxHp, fH));
      if (mob.maxMp > 0) mob.maxMp = Math.max(1, j(mob.maxMp, fM));
      mob.atk = Math.max(1, j(mob.atk, fA));
      mob.matk = Math.max(1, j(mob.matk, fA));
      if (!isBossKind) {
        mob.def = Math.max(0, (mob.def | 0) + (Math.floor(Math.random() * 3) - 1));
        mob.sdef = Math.max(0, (mob.sdef | 0) + (Math.floor(Math.random() * 3) - 1));
      }
      mob.spd = Math.max(1.0, Math.round(((mob.spd || 3) + (Math.random() * 2 - 1) * sJ) * 10) / 10);
      mob.xpReward = Math.max(1, j(mob.xpReward, fX));
      mob.statVaried = true;
    } catch (e) {}
   try { augmentMobSpells(mob, t, isBossKind); } catch (e) { }
    try { if (!isBossKind) equipMobTechniqueGear(mob); } catch (e) { }
    try { equipMobWarGear(mob, isBossKind); } catch (e) { }
    // Missable-tame window: each tamable beast submits at its own random point
    // below SUBMIT_MAX (default 25%) HP. Rolled once at spawn so the window is
    // fixed per beast; Beastfriend (CHA) widens it at check time.
    try {
      if (t && t.tamable && !(mob.tameSubmitBase >= 0)) {
        const T = (window.CFG && window.CFG.TAME) || {};
        const mn = (T.SUBMIT_MIN != null ? T.SUBMIT_MIN : 0);
        const mx = (T.SUBMIT_MAX != null ? T.SUBMIT_MAX : (T.OFFER_HP_FRAC || 0.25));
        mob.tameSubmitBase = mn + Math.random() * Math.max(0, mx - mn);
      }
    } catch (e) {}
    return mob;
  }
  // ---- tiered arsenals: theoretical movepools + spawn loadouts ----
  // Max spell/tech tier for a roster warlord by unlock depth (eff): 1->hedge,
  // 2-3->battle, 4->war, 5+->everything. The Threshold Devourer wears no roster
  // depth (it lies on any delve's way down), so it tiers by its spawn level.
  function bossMagicTier(kind, lv) {
    try {
      if (kind === "portal_devourer") {
        const L = Math.max(1, lv | 0 || 1);
        return L >= 50 ? 4 : L >= 35 ? 3 : L >= 20 ? 2 : 1;
      }
      const eff = (window.CFG.BOSS_MIN_EFF || {})[kind] || 1;
      const T = window.CFG.BOSS_MAGIC_TIER || {};
      return T[eff] || T[Math.max(1, Math.min(6, eff))] || (eff >= 5 ? 4 : eff >= 4 ? 3 : eff >= 2 ? 2 : 1);
    } catch (e) { return 1; }
  }
  function isMimicKindLocal(kind) {
    try { return (window.CFG.MIMIC_KINDS || []).indexOf(kind) >= 0; } catch (e) { return false; }
  }
 function bodyPoolFor(body) {
   const POOLS = {
      blob: ["water_jet", "whirlpool", "venom", "toxic_stab", "glacier", "dazzle"],
      winged: ["lightning", "dazzle", "thunder_hex", "water_jet", "wind_cutter"],
      humanoid: ["fireball", "line_of_fire", "frostbite", "icicle_line", "dazzle", "tamisra", "venom", "toxic_stab", "thunder_hex", "wind_cutter", "life_drain"],
      beast: ["venom", "toxic_stab", "water_jet", "dazzle", "whirlwind", "wind_cutter", "life_drain"],
      brute: ["immolate", "fireball", "line_of_fire", "shieldwall", "whirlwind", "wind_cutter", "thunder_hex"],
      serpent: ["venom", "toxic_stab", "glacier", "icicle_line", "lightning", "water_jet", "whirlpool", "dazzle"],
      ghost: ["frostbite", "icicle_line", "glacier", "thunder_hex", "dazzle", "tamisra", "venom", "life_drain"],
      swarm: ["venom", "toxic_stab", "whirlwind", "wind_cutter", "dazzle"],
      construct: ["smite", "shieldwall", "fireball", "line_of_fire", "glacier", "icicle_line", "lightning"],
      undead: ["thunder_hex", "frostbite", "icicle_line", "venom", "toxic_stab", "smite", "glacier", "life_drain"],
   };
   return (POOLS[body] || POOLS.humanoid).filter(a => window.CFG.ABILITIES[a]);
 }
 // Theoretical movepool for a kind: every spell + technique it may draw on.
 // No cap — the spawn loadout below is where the 12-pick limit lives. Bosses:
 // template signatures + every pooled spell/tech at/below their depth tier.
  // Ordinary mobs: signatures + body pool, seasoned killers (xp>=100) + war
  // spins (tornado) + T1-2 arts, apex horrors (xp>=150) + cataclysms + T3 arts.
  // Mimics keep teeth only (no tier bonuses — ambush + skyfall is unfair).
  // Boss compatibility: a warlord only fields attack magic sharing an element
  // with its template signatures (fire bosses breathe fire, water bosses the
  // deep, holy bosses the light). Support/buffs (heal/cleanse/panacea/shield/
  // warcries/weapon blessings) stay universal; signatures always stay.
  // Peter the Fallen is the one exception — he fields the entire pool.
  function bossSignatureElements(kind) {
    try {
      const T = (window.CFG.MOB_TEMPLATES || {})[kind] || {};
      const AB = window.CFG.ABILITIES || {};
      const els = new Set();
      for (const a of (T.abilities || [])) {
        const ab = AB[a];
        if (ab && ab.element) els.add(String(ab.element).toLowerCase());
      }
      return els;
    } catch (e) { return new Set(); }
  }
  function bossSpellAllowed(kind, spellId) {
    try {
      if (!spellId) return false;
      if (kind === "peter_the_fallen") return true;
      const AB = window.CFG.ABILITIES || {};
      const ab = AB[spellId];
      if (!ab) return false;
      const T = (window.CFG.MOB_TEMPLATES || {})[kind] || {};
      if ((T.abilities || []).includes(spellId)) return true;
      const k = ab.kind;
      if (k === "heal" || k === "support" || k === "revive" || k === "buff" || k === "blink" || k === "eject" || k === "pull") return true;
      if (k === "technique") return true;
      if (k !== "projectile" && k !== "aoe" && k !== "cataclysm") return true;
      const els = bossSignatureElements(kind);
      if (!els.size) return true;
      const el = String(ab.element || "physical").toLowerCase();
      if (els.has(el)) return true;
      return false;
    } catch (e) { return true; }
  }
 function movepoolFor(kind) {
   try {
     const T = (window.CFG.MOB_TEMPLATES || {})[kind] || {};
     const AB = window.CFG.ABILITIES || {};
     const ST = window.CFG.SPELL_TIER || {}, TT = window.CFG.TECH_TIER || {};
     const isBoss = !!(T.boss || (window.CFG.BOSS_KINDS || []).indexOf(kind) >= 0);
     const spells = [], techs = [];
     const seen = new Set();
     const add = (a) => {
       if (!a || seen.has(a)) return;
       const ab = AB[a];
       if (!ab) return;
       seen.add(a);
       if (ab.kind === "technique") techs.push(a);
       else spells.push(a);
     };
     for (const a of (T.abilities || [])) add(a);
     if (isBoss) {
       const maxTier = bossMagicTier(kind, 100);
        for (const a of Object.keys(ST)) { try { if (ST[a] <= maxTier && bossSpellAllowed(kind, a)) add(a); } catch (e2) { } }
        for (const a of Object.keys(TT)) { try { if (TT[a] <= maxTier) add(a); } catch (e2) { } }
       return { spells, techs, maxTier, isBoss: true };
     }
      for (const a of bodyPoolFor(T.body)) add(a);
      if (!isMimicKindLocal(kind)) {
        const xp = T.xp | 0 || 0;
        const PA = (window.CFG.MOB_ARSENAL || {});
        const APEX = PA.APEX_XP != null ? PA.APEX_XP : 150;
        const POWER = PA.POWER_XP != null ? PA.POWER_XP : 100;
        if (xp >= POWER) {
          for (const a of Object.keys(ST)) { try { if (ST[a] === 3 && AB[a] && (AB[a].kind === "projectile" || AB[a].kind === "aoe")) add(a); } catch (e2) { } }
          for (const a of Object.keys(TT)) { try { if (TT[a] <= 2) add(a); } catch (e2) { } }
        }
        if (xp >= APEX) {
          for (const a of Object.keys(ST)) { try { if (ST[a] === 4) add(a); } catch (e2) { } }
          for (const a of Object.keys(TT)) { try { if (TT[a] === 3) add(a); } catch (e2) { } }
        }
        return { spells, techs, maxTier: xp >= APEX ? 4 : xp >= POWER ? 3 : 1, isBoss: false };
      }
      return { spells, techs, maxTier: 1, isBoss: false };
    } catch (e) { return { spells: [], techs: [], maxTier: 1, isBoss: false }; }
  }
 // Thematic cataclysm for an apex non-boss: match its existing element when
 // it has one (fire seas get skyfire, deep water gets the wave), else roll.
 function thematicCataclysm(t, poolSpells) {
   try {
     const AB = window.CFG.ABILITIES || {};
     const els = new Set();
     for (const a of (poolSpells || [])) { const ab = AB[a]; if (ab && ab.element) els.add(ab.element); }
      const byEl = { fire: ["meteorfall", "raging_volcano"], water: ["tidal_wave", "primordial_sea"], ice: ["whiteout", "crystal_prison"], electric: ["energy_beam"], physical: ["hurricane", "storm_of_blades"], holy: ["burning_light", "void_hole", "blood_hole"], nature: ["barbed_plague", "blood_hole"] };
      const keys = ["fire", "water", "ice", "electric", "physical", "holy", "nature"].filter(e => els.has(e));
      const opts = [];
      for (const e of keys) for (const a of (byEl[e] || [])) if (AB[a]) opts.push(a);
      if (opts.length) return opts[(Math.random() * opts.length) | 0];
      const all = ["meteorfall", "tidal_wave", "whiteout", "energy_beam", "hurricane", "storm_of_blades", "primordial_sea", "raging_volcano", "crystal_prison", "burning_light", "barbed_plague", "void_hole", "blood_hole"].filter(a => AB[a]);
     return all[(Math.random() * all.length) | 0];
   } catch (e) { return "meteorfall"; }
 }
  function spellTierOf(a) {
    try {
      const AB = window.CFG.ABILITIES || {};
      const ab = AB[a];
      if (!ab) return 0;
      if (ab.kind === "technique") return (window.CFG.TECH_TIER || {})[a] || 0;
      return (window.CFG.SPELL_TIER || {})[a] || 0;
    } catch (e) { return 0; }
  }
  function isAttackAb(a) {
    try {
      const k = window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind;
      return k === "projectile" || k === "aoe" || k === "cataclysm" || k === "technique";
    } catch (e) { return false; }
  }
  function shuffleIn(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }
  // Random thematic bonus spells so attack patterns vary per spawn, plus a
  // guaranteed self-care kit (bosses always heal HP + statuses). Bosses draw
  // up to 12 from their (uncapped) movepool: at least 3 of the highest-tier
  // SPELLS they can field (shortfall cascades a tier down) plus at least 2
  // TECHNIQUES (shortfall substitutes another high-tier spell, per spec);
  // powerful mobs guarantee war-magic (tornado), apex horrors a cataclysm
  // + an art.
  function augmentMobSpells(mob, t, isBossKind) {
    const pool = movepoolFor(mob.kind);
    const has = (a) => mob.abilities.includes(a);
    const isTechAb = (a) => { try { return window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind === "technique"; } catch (e) { return false; } };
    if (isBossKind) {
      if (!has("heal")) mob.abilities.push("heal");
      if (!has("panacea") && !has("cleanse")) mob.abilities.push("panacea");
      // effective tier (the lying gate scales with its spawn level, not depth)
      let effTier = pool.maxTier;
      try { effTier = bossMagicTier(mob.kind, mob.lv); } catch (e2) { }
      const allowed = [...pool.spells, ...pool.techs].filter(a => {
        if (has(a)) return false;
        const tier = spellTierOf(a);
        return tier > 0 && tier <= effTier;
      });
      const take = (a) => {
        if (mob.abilities.length >= 12) return false;
        mob.abilities.push(a);
        const ix = allowed.indexOf(a);
        if (ix >= 0) allowed.splice(ix, 1);
        return true;
      };
      // at least 3 of the highest-tier SPELLS fieldable (cascade down if short)
      let needSpells = 3;
      for (const a of mob.abilities) {
        try { if (!isTechAb(a) && spellTierOf(a) === effTier && isAttackAb(a)) needSpells--; } catch (e3) { }
      }
      needSpells = Math.max(0, needSpells);
      for (let tier = effTier; tier >= 1 && needSpells > 0; tier--) {
        const cands = shuffleIn(allowed.filter(a => !isTechAb(a) && spellTierOf(a) === tier && isAttackAb(a)));
        for (const a of cands) {
          if (needSpells <= 0 || mob.abilities.length >= 12) break;
          take(a);
          needSpells--;
        }
      }
      // at least 2 techniques; a thin tech pool substitutes high-tier spells
      let needTechs = 2;
      for (const a of mob.abilities) {
        try { if (isTechAb(a)) needTechs--; } catch (e3) { }
      }
      needTechs = Math.max(0, needTechs);
      for (let tier = effTier; tier >= 1 && needTechs > 0; tier--) {
        const cands = shuffleIn(allowed.filter(a => isTechAb(a) && spellTierOf(a) === tier));
        for (const a of cands) {
          if (needTechs <= 0 || mob.abilities.length >= 12) break;
          take(a);
          needTechs--;
        }
      }
      if (needTechs > 0) {
        // not enough techniques to draw: substitute high-tier spells instead
        for (let tier = effTier; tier >= 1 && needTechs > 0; tier--) {
          const cands = shuffleIn(allowed.filter(a => !isTechAb(a) && spellTierOf(a) === tier && isAttackAb(a)));
          for (const a of cands) {
            if (needTechs <= 0 || mob.abilities.length >= 12) break;
            take(a);
            needTechs--;
          }
        }
      }
      // random fill to the 12-pick cap (care + signatures + top-tier first)
      for (const a of shuffleIn(allowed)) {
        if (mob.abilities.length >= 12) break;
        mob.abilities.push(a);
      }
    } else {
      // 1-2 random bonus attack spells (projectiles/status), never duplicates
      const tplAttacks = mob.abilities.filter(isAttackAb).length;
      const targetAttacks = Math.min(4, tplAttacks + 2);
      const bodyPool = bodyPoolFor((t && t.body) || "");
      const countAttacks = () => mob.abilities.filter(a => { const ab = window.CFG.ABILITIES[a]; return ab && (ab.kind === "projectile" || ab.kind === "aoe"); }).length;
      let guard = 0;
      while (countAttacks() < targetAttacks && guard++ < 10) {
        const pick = bodyPool[(Math.random() * bodyPool.length) | 0];
        if (!pick || mob.abilities.includes(pick)) continue;
        const ab = window.CFG.ABILITIES[pick];
        if (!ab || ab.kind === "heal" || ab.kind === "support" || ab.kind === "revive" || ab.kind === "buff") continue;
        mob.abilities.push(pick);
        if (countAttacks() >= 3 && Math.random() < 0.5) break;
        if (mob.abilities.length >= 7) break;
      }
      // power bands (never mimics): war-magic for seasoned killers, a
      // thematic cataclysm + an art for apex horrors
      try {
        if (!isMimicKindLocal(mob.kind)) {
          const xp = (t && t.xp | 0) || 0;
          const PA = (window.CFG.MOB_ARSENAL || {});
          const APEX = PA.APEX_XP != null ? PA.APEX_XP : 150;
          const POWER = PA.POWER_XP != null ? PA.POWER_XP : 100;
          if (xp >= POWER && !has("tornado") && mob.abilities.length < 7) mob.abilities.push("tornado");
          if (xp >= APEX) {
            if (!mob.abilities.some(a => { const ab = window.CFG.ABILITIES[a]; return ab && ab.kind === "cataclysm"; }) && mob.abilities.length < 7)
              mob.abilities.push(thematicCataclysm(t, mob.abilities));
            const techs = (pool.techs || []).filter(a => !has(a));
            // apex horror leads with its deepest art (cascade down if none)
            techs.sort((a, b) => spellTierOf(b) - spellTierOf(a));
            if (techs.length && !mob.abilities.some(a => window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind === "technique") && mob.abilities.length < 7)
              mob.abilities.push(techs[(Math.random() * Math.min(techs.length, 5)) | 0]);
          } else if (xp >= POWER) {
            const techs = (pool.techs || []).filter(a => !has(a) && spellTierOf(a) <= 2);
            if (techs.length && !mob.abilities.some(a => window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind === "technique") && mob.abilities.length < 7)
              mob.abilities.push(techs[(Math.random() * techs.length) | 0]);
          }
        }
      } catch (e2) { }
    }
    // ensure the MP pool can actually cast the kit (spawn fills mp=maxMp)
    let dearest = 0;
    for (const a of mob.abilities) { const ab = window.CFG.ABILITIES[a]; if (ab && ab.mp > dearest) dearest = ab.mp; }
    const wantMp = wantMpFor(t.mp, dearest, isBossKind);
    if (mob.maxMp < wantMp) {
      mob.maxMp = wantMp;
    }
  }
  // ---- mob war-gear: technique users wield the steel ----
  // Bosses need no weapon (the cast gate exempts them), but every powerful
  // non-boss mob that fields a technique spawns carrying the matching
  // weapon — tiered by spawn level, floored by power band (seasoned killers
  // steel+, apex horrors mythril+). The wield check in game.js castAbility
  // then passes, and techWeaponScale bites by tier. Mob basic strikes ride
  // the steel too (meleeMult reads it) — which is what wielding a
  // dragonbone blade should mean.
  const MOB_GEAR_MATS = ["rusted", "iron", "steel", "silver", "mythril", "dragonbone"];
  const MOB_GEAR_SWORDS = ["rusted_sword", "iron_sword", "steel_sword", "silver_sword", "mythril_sword", "dragonbone_sword"];
  const MOB_GEAR_BOWS = ["old_bow", "oak_bow", "yew_bow", "wardens_bow", "frostwood_bow", "yggdrasil_bow"];
  const MOB_GEAR_SHIELDS = ["wooden_buckler", "iron_shield", "steel_shield", "silver_shield", "mythril_shield", "dragonbone_shield"];
  function mobGearTierFor(lv) {
    const L = Math.max(1, lv | 0 || 1);
    if (L >= 60) return 5;
    if (L >= 40) return 4;
    if (L >= 28) return 3;
    if (L >= 16) return 2;
    if (L >= 6) return 1;
    return 0;
  }
  function gearIdForFamTier(fam, tier) {
    try {
      const i = Math.max(0, Math.min(5, tier | 0 || 0));
      if (fam === "sword") return MOB_GEAR_SWORDS[i];
      if (fam === "bow") return MOB_GEAR_BOWS[i];
      if (fam === "shield") return MOB_GEAR_SHIELDS[i];
      if (fam === "dagger" || fam === "axe" || fam === "hammer" || fam === "spear" || fam === "whip")
        return MOB_GEAR_MATS[i] + "_" + fam;
    } catch (e) { }
    return null;
  }
  // Deterministic preview for the Codex: the kind's deepest movepool art
  // picks the family (ties broken by id so every client shows the same).
  function mobTechniqueGear(kind, lv) {
    try {
      const mp = movepoolFor(kind) || {};
      const techs = [...(mp.techs || [])];
      if (!techs.length) return { weapon: null, shield: null, fam: null };
      techs.sort((a, b) => (spellTierOf(b) - spellTierOf(a)) || (a < b ? -1 : a > b ? 1 : 0));
      const fam = techWeaponFam(techs[0]);
      let tier = 0;
      try {
        const xp = (((window.CFG.MOB_TEMPLATES || {})[kind] || {}).xp | 0) || 0;
        tier = mobWarTier(lv, false, xp);
      } catch (e2) { tier = mobWarTier(lv, false, 0); }
      if (fam === "shield") return { weapon: null, shield: gearIdForFamTier("shield", tier), fam };
      if (!fam || fam === "unarmed") return { weapon: null, shield: null, fam: fam || null };
      return { weapon: gearIdForFamTier(fam, tier), shield: null, fam };
    } catch (e) { return { weapon: null, shield: null, fam: null }; }
  }
  // Distinct weapon families a kind's movepool may draw (Codex "Wields" line).
  function mobTechniqueFams(kind) {
    try {
      const mp = movepoolFor(kind) || {};
      const out = [];
      for (const a of (mp.techs || [])) {
        const f = techWeaponFam(a) || "unarmed";
        if (out.indexOf(f) < 0) out.push(f);
      }
      return out;
    } catch (e) { return []; }
  }
  // Spawn-time fitting: the mob's ACTUAL drawn art picks the steel (mobs
  // draw at most one art, so one weapon always covers the whole kit; a
  // shield art adds a shield alongside whatever the weapon art needs).
  function equipMobTechniqueGear(mob) {
    try {
      if (!mob || isBossMobKind(mob.kind)) return mob;
      const abs = mob.abilities || [];
      const techs = abs.filter(a => { try { return window.CFG.ABILITIES[a] && window.CFG.ABILITIES[a].kind === "technique"; } catch (e) { return false; } });
      if (!techs.length) return mob;
      if (!mob.equipment || typeof mob.equipment !== "object") mob.equipment = { weapon: null, armor: null, trinket: null, shield: null };
      let tier = 0;
      try {
        const T = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[mob.kind] || {};
        tier = mobWarTier(mob.lv, false, (T.xp | 0) || 0);
      } catch (e2) { try { tier = mobWarTier(mob.lv, false, 0); } catch (e3) { tier = 0; } }
      tier = Math.max(0, Math.min(5, tier));
      techs.sort((a, b) => (spellTierOf(b) - spellTierOf(a)) || (a < b ? -1 : a > b ? 1 : 0));
      let weapon = null, shield = null;
      for (const a of techs) {
        const f = techWeaponFam(a);
        if (f === "shield") {
          const id = gearIdForFamTier("shield", tier);
          if (id && window.Items && window.Items.ITEMS[id]) shield = id;
        } else if (f && f !== "unarmed" && !weapon) {
          const id = gearIdForFamTier(f, tier);
          if (id && window.Items && window.Items.ITEMS[id]) weapon = id;
        }
      }
      if (weapon) mob.equipment.weapon = weapon;
      if (shield) mob.equipment.shield = shield;
    } catch (e) { }
    return mob;
  }
  // ---- mob war-gear: every wild fighter spawns armed AND armored ----
  // Level-appropriate steel, by band (low: lv<20, mid: 20-49, high: 50+):
  // low mobs draw RUSTY, low bosses STEEL; mid mobs draw STEEL or MYTHRIL
  // (coin flip per spawn), mid bosses DRAGONBONE; high mobs AND high bosses
  // draw DRAGONBONE. Seasoned killers (template XP 100+) floor at steel,
  // apex horrors (XP 150+) at mythril — a weak body with a feared name still
  // carries real steel. Technique wielders already hold their art's steel
  // (see above — never replace it); everyone else draws a random melee weapon
  // or bow, tiered the same way. Template archers always take the bow; other
  // kinds take a bow ~22% of the time, steel otherwise (swords and spears
  // weighted, with axes, hammers, daggers and whips in the mix). Bosses draw
  // too (their cast gate stays exempt — a warlord IS the weapon — but their
  // basic strikes ride the steel via meleeMult, same as any wild mob).
  // Armor rides the same tier: battle-casters the robe track, restorative
  // chanters habitus, martial-form fighters kasaya, speedsters the light
  // track, everyone else the heavy track — high bands wear the top of
  // their track (wyrmshroud / seraph habit / dragonhide kasaya /
  // shadowweave / dragonbone plate). Armor counts in combat (see
  // combatDef/combatSdef in game.js) plus resists.
  // Mobs with bows fire infinite arrows (see shootBow in game.js): no quiver,
  // no pack, no stock — the bow just looses.
  // War bands: 0 low (lv<20), 1 mid (20-49), 2 high (50+).
  function mobWarBand(lv) {
    const L = Math.max(1, lv | 0 || 1);
    if (L >= 50) return 2;
    if (L >= 20) return 1;
    return 0;
  }
  // Tier for a spawn's steel: bosses sit a full ladder above mobs (a low
  // warlord still draws steel, mid+ warlords dragonbone).
  function mobWarTier(lv, isBoss, xp) {
    const band = mobWarBand(lv);
    let tier;
    if (isBoss) tier = band === 0 ? 2 : 5;
    else if (band === 2) tier = 5;
    else if (band === 1) tier = Math.random() < 0.5 ? 2 : 4;
    else tier = 0;
    if (!isBoss) {
      try {
        const x = (xp | 0) || 0;
        if (x >= 150) tier = Math.max(tier, 4);
        else if (x >= 100) tier = Math.max(tier, 2);
      } catch (e2) { }
    }
    return Math.max(0, Math.min(5, tier));
  }
  const MOB_ARMOR_TRACKS = {
    robe: ["cloth_robe", "mage_robe", "archmage_robe", "tideward_robe", "holy_vestments", "wyrmshroud_robe"],
    habitus: ["novice_habit", "canon_habit", "canon_habit", "vesper_habit", "vesper_habit", "seraph_habit"],
    light: ["leather_armor", "leather_armor", "wayfarer_garb", "wayfarer_garb", "shadowweave_garb", "shadowweave_garb"],
    heavy: ["leather_armor", "iron_armor", "steel_plate", "mythril_plate", "mythril_plate", "dragonbone_plate"],
    kasaya: ["patched_kasaya", "ironthread_kasaya", "ironthread_kasaya", "sunsilk_kasaya", "sunsilk_kasaya", "dragonhide_kasaya"],
  };
  // Which armor track a kind wears: battle-casters robe, restorative
  // chanters habitus, martial-form fighters kasaya, speedsters leather,
  // everything else plate. Devotion = caster-leaning with a restorative
  // rite (heal/panacea/revive/cleanse) at least matching its attack magic;
  // Ascetic = a whirlwind / iron-palm form in the base kit (warlords wear
  // the gi whatever their bulk, rank-and-file only while still light).
  function mobArmorTrack(kind, Tpl) {
    try {
      const T = Tpl || {};
      const AB = (window.CFG && window.CFG.ABILITIES) || {};
      let combat = 0, sup = 0;
      for (const a of (T.abilities || [])) {
        if (PHYSICAL.has(a)) continue; // whirlwind/strike/bowshot are physical vehicles
        let k = null;
        try { k = AB[a] && AB[a].kind; } catch (e2) { }
        if (k === "projectile" || k === "aoe" || k === "cataclysm") combat++;
        else if (MOB_SPELL_KINDS.has(k)) sup++;
      }
      const a = mobArchetype(kind, T);
      const casterLean = a.caster >= 0.5 && a.caster >= a.physical;
      if (casterLean && sup > 0 && sup >= combat) return "habitus";
      if (casterLean) return "robe";
      const forms = (T.abilities || []).some(x => x === "whirlwind" || x === "iron_palm");
      if (forms) {
        let isBoss = false;
        try { isBoss = !!((T && T.boss) || ((window.CFG.BOSS_KINDS || []).indexOf(kind) >= 0)); } catch (eB) { }
        if (isBoss || a.tanky < 0.75) return "kasaya";
      }
      if (a.speedy >= 0.45 && a.speedy > a.tanky) return "light";
      return "heavy";
    } catch (e) { return "heavy"; }
  }
  function mobArmorIdForTier(track, tier) {
    try {
      const t = MOB_ARMOR_TRACKS[track] || MOB_ARMOR_TRACKS.heavy;
      const id = t[Math.max(0, Math.min(5, tier | 0 || 0))];
      if (id && window.Items && window.Items.ITEMS[id]) return id;
    } catch (e) { }
    return null;
  }
  // Fit one mob's plate (never replaces worn armor — art steel stays).
  function fitMobArmor(mob, tier) {
    try {
      if (!mob || mob.isTame || mob.inParty) return mob;
      if (!mob.equipment || typeof mob.equipment !== "object") mob.equipment = { weapon: null, armor: null, trinket: null, shield: null };
      if (mob.equipment.armor) return mob;
      let Tpl = null;
      try { Tpl = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[mob.kind] || null; } catch (e2) { Tpl = null; }
      const track = mobArmorTrack(mob.kind, Tpl);
      const id = mobArmorIdForTier(track, tier);
      if (id) mob.equipment.armor = id;
    } catch (e) { }
    return mob;
  }
  function equipMobWarGear(mob, isBossKind) {
    try {
      if (!mob || mob.isTame || mob.inParty) return mob;
      if (!mob.equipment || typeof mob.equipment !== "object") mob.equipment = { weapon: null, armor: null, trinket: null, shield: null };
      let Tpl = null;
      try { Tpl = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[mob.kind] || null; } catch (e2) { Tpl = null; }
      const xp = (Tpl && (Tpl.xp | 0)) || 0;
      const tier = mobWarTier(mob.lv, !!isBossKind, xp);
      // plate first: art-wielders keep their steel but still dress for band
      try { fitMobArmor(mob, tier); } catch (eA) { }
      if (mob.equipment.weapon) return mob; // art steel already fitted
      const isArcherTpl = !!(Tpl && Tpl.archer);
      const takeBow = isArcherTpl || Math.random() < 0.22;
      if (takeBow) {
        const id = gearIdForFamTier("bow", tier);
        if (id && window.Items && window.Items.ITEMS[id]) mob.equipment.weapon = id;
        return mob;
      }
      const fams = ["sword", "sword", "spear", "spear", "axe", "hammer", "dagger", "whip"];
      // shuffle a copy so the draw order is random per spawn
      for (let i = fams.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = fams[i]; fams[i] = fams[j]; fams[j] = tmp;
      }
      for (const fam of fams) {
        const id = gearIdForFamTier(fam, tier);
        if (id && window.Items && window.Items.ITEMS[id]) { mob.equipment.weapon = id; break; }
      }
    } catch (e) { }
    return mob;
  }
  function xpFor(lv) { return window.CFG.xpNext(lv); }
  // returns {leveled:boolean, newAbilities:[], statPoints, skillPoints}
  // NOTE (per-tree skill points): level-ups grant stat points only. Skill
  // points are earned per tree by USING that tree (hits, casts, parries...),
  // so skills grow with practice, not with levels. skillPoints stays 0 here
  // to keep the call shape; p.skillPoints is a legacy pool for old saves.
  function gainXp(ent, amount) {
    ent.xp += amount;
    let leveled = false; const newAbs = [];
    let sp = 0; const skp = 0;
    // level cap 100 for everyone but the player (ancient bosses are spawned,
    // never leveled, but exempt them too for safety)
    if (ent.kind !== "player" && !ent.isAncient && ent.lv >= 100) {
      ent.xp = Math.min(ent.xp, xpFor(ent.lv) - 1);
      return { leveled, newAbilities: newAbs, statPoints: sp, skillPoints: skp };
    }
    while (ent.xp >= xpFor(ent.lv)) {
      ent.xp -= xpFor(ent.lv); ent.lv++;
      leveled = true;
      if (ent.kind === "player") {
        ensureProgression(ent);
        ent.statPoints += window.CFG.STAT_POINTS_PER_LEVEL;
        sp += window.CFG.STAT_POINTS_PER_LEVEL;
        recalcDerived(ent, true);
        ent.hp = Math.min(ent.maxHp, ent.hp + Math.round(ent.maxHp * 0.5));
        ent.mp = Math.min(ent.maxMp, ent.mp + Math.round(ent.maxMp * 0.5));
        // NOTE: players learn new spells from spellbooks only — no auto-unlock.
      } else {
        // NPCs / war parties: the base body climbs the NPC level curve
        // inside npcLevelUp (gear re-applied on top), plus ability unlocks.
        // Party loadouts re-apply gear so nothing is lost.
        try {
          const hb = ent.hp, mb = ent.mp;
          if (ent.baseMaxHp != null && window.Items && window.Items.npcLevelUp) window.Items.npcLevelUp(ent);
          ent.hp = Math.min(ent.maxHp, hb + Math.round(ent.maxHp * 0.5));
          ent.mp = Math.min(ent.maxMp, mb + Math.round(ent.maxMp * 0.5));
        } catch (e) {
          ent.hp = Math.min(ent.maxHp, ent.hp + Math.round(ent.maxHp * 0.5));
          ent.mp = Math.min(ent.maxMp, ent.mp + Math.round(ent.maxMp * 0.5));
        }
        const unlock = abilityUnlockFor(ent);
        if (unlock && !ent.abilities.includes(unlock)) { ent.abilities.push(unlock); newAbs.push(unlock); }
      }
    }
    return { leveled, newAbilities: newAbs, statPoints: sp, skillPoints: skp };
  }
  function abilityUnlockFor(ent) {
    // Kits no longer contain the old slash spell (NPCs swing their wielded
    // blade instead), so the level gates moved up one slot to keep unlocking
    // the same spells as before: lv2 → first spell, lv4 → second, lv6 → third.
    const kit = (window.CFG.ROLE_KIT[ent.role] || window.CFG.ROLE_KIT.villager).filter(a => a !== "slash");
    if (ent.lv >= 2 && kit[0] && !ent.abilities.includes(kit[0])) return kit[0];
    if (ent.lv >= 4 && kit[1] && !ent.abilities.includes(kit[1])) return kit[1];
    if (ent.lv >= 6 && kit[2] && !ent.abilities.includes(kit[2])) return kit[2];
    // legacy player catch-up (pre-spellbook saves that never found books)
    if (ent.kind === "player") {
      for (const id of ["whirlwind", "heal", "frostbite", "shieldwall"]) {
        if (!ent.abilities.includes(id) && ent.lv >= 3) return id;
      }
    }
    return null;
  }
  // ---------- perks / scaling ----------
  // internal melee ("strike") + bow ("bowshot") vehicles ride here so they
  // scale with Strength like the old weapon spells did
  const PHYSICAL = new Set(["strike", "whirlwind", "bowshot"]);
  // ---------- technique weapon requirement + spell tiers ----------
  // Every technique demands its weapon family as the default weapon
  // (default weapon slot / equipment.weapon; "unarmed" = bare fists).
  function techWeaponFam(techId) {
    try {
      // thrown arts need no weapon wielded — the star leaves from the hand
      if (techId === "exploding_shuriken" || techId === "slime_shuriken") return null;
      if (window.CFG && window.CFG.TECH_WEAPON_FAM && window.CFG.TECH_WEAPON_FAM[techId]) return window.CFG.TECH_WEAPON_FAM[techId];
      const t = window.CFG && window.CFG.TECHNIQUES && window.CFG.TECHNIQUES[techId];
      if (t && t.req && t.req.fam) { const k = Object.keys(t.req.fam); if (k.length) return k[0]; }
    } catch (e) { }
    return null;
  }
  function techWeaponName(fam) {
    try {
      if (!fam) return "?";
      if (fam === "unarmed") return "bare fists";
      const t = window.CFG && window.CFG.SKILL_TREES && window.CFG.SKILL_TREES[fam];
      if (t && t.name) return t.name.toLowerCase().replace(/play|ing$/i, "").trim() || fam;
      return fam;
    } catch (e) { return fam || "?"; }
  }
  // One-way spell inheritance: child gains every unlocked rank of its parent
  // chain (transitively). Parents never gain from children.
  function spellParent(abId) {
    try { if (window.CFG && window.CFG.SPELL_PARENTS) return window.CFG.SPELL_PARENTS[abId] || null; } catch (e) { }
    return null;
  }
  function spellAncestors(abId) {
    const out = [];
    try {
      let cur = spellParent(abId);
      let guard = 0;
      while (cur && guard++ < 8) {
        out.push(cur);
        cur = spellParent(cur);
      }
    } catch (e) { }
    return out;
  }
  function spellLineage(abId) {
    try { return [abId].concat(spellAncestors(abId)); } catch (e) { return [abId]; }
  }
  function spellLineageLabel(abId) {
    try {
      const chain = spellAncestors(abId).slice().reverse();
      if (!chain.length) return null;
      const nm = (id) => { try { const a = window.CFG.ABILITIES[id]; return a ? a.name : id; } catch (e) { return id; } };
      return chain.map(nm).join(" → ");
    } catch (e) { return null; }
  }
  // Channeling: higher spells gather power before release (1.5-2.5s
  // by chain depth); base spells and ALL techniques are instantaneous.
  // Depth = number of ancestors in SPELL_PARENTS (frostbite 1, glacier 2,
  // ...). Cataclysms use the same depth scale so the chain reads
  // consistently (tidal/meteor/energy/whiteout/hurricane all ride at 2.0s).
  function spellChannelTime(abId) {
    try {
      const ab = window.CFG && window.CFG.ABILITIES ? window.CFG.ABILITIES[abId] : null;
      if (!ab) return 0;
      if (ab.kind === "technique") return 0;
      const depth = spellAncestors(abId).length;
      if (depth <= 0) return 0;
      if (ab.kind !== "projectile" && ab.kind !== "support" && ab.kind !== "cataclysm") return 0;
      if (depth === 1) return 1.5;
      if (depth === 2) return 2.0;
      return 2.5;
    } catch (e) { return 0; }
  }
  // Disciples of Shadow: clone count / lifetime / damage from the art's own
  // ranks. Count: 2 base, +1 with Mastery, +1 at Surge 3 (max 4).
  // Lifetime: 10s + 2s per Surge rank. Damage: 50% x the art's own
  // Potency/Surge mult (techArtMult), so the standard tree sharpens clones.
  function shadowCloneStats(p) {
    try {
      const q = getPerks(p, "shadow_disciples");
      const potency = Math.min(5, q.potency | 0), surge = Math.min(3, q.surge | 0);
      const mastery = (q.mastery | 0) > 0;
      let count = 2 + (mastery ? 1 : 0) + (surge >= 3 ? 1 : 0);
      if (count > 4) count = 4;
      return {
        count,
        lifeSec: 10 + 2 * surge,
        dmgMult: 0.5 * (1 + 0.15 * potency + 0.08 * surge),
        potency, surge, mastery,
      };
    } catch (e) { return { count: 2, lifeSec: 10, dmgMult: 0.5, potency: 0, surge: 0, mastery: false }; }
  }
  // Summed ranks across self + all ancestors (mastery ORs: any mastered tier counts).
  function effectiveSpellPerks(caster, abId) {
    try {
      if (!caster || caster.kind !== "player" || !caster.spellPerks) return { potency: 0, efficiency: 0, mastery: 0, surge: 0 };
      let pot = 0, eff = 0, sur = 0, mas = 0;
      for (const id of spellLineage(abId)) {
        const q = caster.spellPerks[id] || {};
        pot += (q.potency | 0); eff += (q.efficiency | 0); sur += (q.surge | 0);
        if ((q.mastery | 0) > 0) mas = 1;
      }
      return { potency: pot, efficiency: eff, mastery: mas, surge: sur };
    } catch (e) { return { potency: 0, efficiency: 0, mastery: 0, surge: 0 }; }
  }
  // Strength of the wielded default weapon for a technique: weapon-tree damage
  // ranks (weaponBaseMult) x tierMult for melee families (iron > rusted),
  // bowPower (+ tier) for bows, 1x unarmed. Multiplied into projectile
  // technique damage at cast time (melee techniques already ride all of it
  // through combatDmg("strike") → meleeMult + weaponMeleeMult).
  function techWeaponScale(caster, techId) {
    try {
      const fam = techWeaponFam(techId);
      if (!fam || !caster) return 1;
      try { if (wieldedFamily(caster) !== fam) return 1; } catch (e) { return 1; }
      let m = 1;
      try { m *= weaponBaseMult(caster) || 1; } catch (e) { }
      try {
        const w = window.Items && window.Items.equippedWeapon ? window.Items.equippedWeapon(caster) : null;
        if (fam === "bow") {
          if (w && w.bow) {
            m *= (w.bowPower || 1);
            try { m *= (window.Items.weaponTierMult ? window.Items.weaponTierMult(w, caster && caster.equipment && caster.equipment.weapon) : 1) || 1; } catch (e2) { }
          }
        } else if (fam !== "unarmed") {
          try { m *= (window.Items.weaponTierMult ? window.Items.weaponTierMult(w, caster && caster.equipment && caster.equipment.weapon) : 1) || 1; } catch (e2) { }
          try { if (window.Items && window.Items.famDmgMult && w && w.wtype) m *= window.Items.famDmgMult(w.wtype) || 1; } catch (e2) { }
        }
      } catch (e) { }
      return Math.max(0.2, m);
    } catch (e) { return 1; }
  }
  function getPerks(caster, abId) {
    // Spell tiers inherit previous tiers (summed); techniques use own ranks only.
    try { if (spellParent(abId)) return effectiveSpellPerks(caster, abId); } catch (e) { }
    if (!caster || caster.kind !== "player" || !caster.spellPerks) return { potency: 0, efficiency: 0, mastery: 0, surge: 0 };
    const q = caster.spellPerks[abId] || {};
    return {
      potency: Math.min(5, q.potency | 0),
      efficiency: Math.min(3, q.efficiency | 0),
      mastery: Math.min(1, q.mastery | 0),
      surge: Math.min(3, q.surge | 0),
    };
  }
  function getOwnPerks(caster, abId) {
    if (!caster || caster.kind !== "player" || !caster.spellPerks) return { potency: 0, efficiency: 0, mastery: 0, surge: 0 };
    const q = caster.spellPerks[abId] || {};
    return {
      potency: Math.min(5, q.potency | 0),
      efficiency: Math.min(3, q.efficiency | 0),
      mastery: Math.min(1, q.mastery | 0),
      surge: Math.min(3, q.surge | 0),
    };
  }
  function hasMastery(caster, abId) { return getPerks(caster, abId).mastery > 0; }
  function strOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.str) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  function intOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.int) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  function lukOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.luk) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  function agiOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.agi) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  function endOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.end) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  function forOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.for) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  // +1% melee damage per STR point (chop no longer scales)
  function meleeDmgMult(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 1;
      let m = 1 + strOver(p) * 0.01;
      try { if (p.buffs && p.buffs.drugRageUntil && performance.now() < p.buffs.drugRageUntil) m *= 1.6; } catch (e) { }
      try { m *= kasayaPhysMult(p) || 1; } catch (e) { }
      return m;
    } catch (e) { return 1; }
  }
  // +1% flurry damage per STR point (sprint-flurry swings, wave-ride swings, viper flurry)
  function flurryDmgMult(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 1;
      return 1 + strOver(p) * 0.01;
    } catch (e) { return 1; }
  }
  // +1% spell damage per INT point — the magic mirror of meleeDmgMult.
  // Spells ride MATK flat (INT + gear) the way strikes ride ATK flat,
  // and this % rides on top the way Strength's % rides on strikes.
  function magicDmgMult(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 1;
      let m = 1 + intOver(p) * 0.01;
      try { if (p.buffs && p.buffs.drugMindUntil && performance.now() < p.buffs.drugMindUntil) m *= 1.6; } catch (e) { }
      try { m *= habitusSpellMult(p) || 1; } catch (e) { }
      return m;
    } catch (e) { return 1; }
  }
  // +0.25 flat stamina regen per END point over 5 (raw stamina/s stacking
  // on top of the 5/s base rate in game.js)
  function staminaRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 0;
      let b = endOver(p) * 0.25;
      try { b += kasayaRegenBonus(p) || 0; } catch (e) { }
      return b;
    } catch (e) { return 0; }
  }
  // Deprecated alias — always 1 so any stale caller doesn't double-apply.
  function staminaRegenMult(p) { return 1; }
  // +0.25 flat HP regen per FOR point over 5 (raw HP/s stacking on top of
  // the 5/s base rate in game.js)
  function hpRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 0;
      let b = forOver(p) * 0.25;
      try { b += armorRegenBonus(p) || 0; } catch (e) { }
      return b;
    } catch (e) { return 0; }
  }
  // Deprecated alias — always 1 so any stale caller doesn't double-apply.
  function hpRegenMult(p) { return 1; }
  // +0.25 flat MP regen per INT point over 5 (raw MP/s stacking on top of
  // the 5/s base rate in game.js)
  function mpRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 0;
      let b = intOver(p) * 0.25;
      try { b += robeRegenBonus(p) || 0; } catch (e) { }
      try { b += habitusRegenBonus(p) || 0; } catch (e) { }
      return b;
    } catch (e) { return 0; }
  }
  // Deprecated alias — always 1 so any stale caller doesn't double-apply.
  function mpRegenMult(p) { return 1; }
  // +0.5% weapon & flurry speed per AGI point: cooldown multiplier (<1 = faster)
  function agiCdMult(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 1;
      return 1 / (1 + agiOver(p) * 0.005);
    } catch (e) { return 1; }
  }
  // Deprecated: INT now lives in MATK flat (recalcDerived), like STR in ATK.
  // Kept for compatibility — always 0 so old callers don't double-count.
  function spellFlatBonus(p) {
    return 0;
  }
  // Spell cost reduction retired (Nov 2026: INT gives MP regen instead).
  // Kept for compatibility — always 1 so old saves don't get a discount.
  function spellCostMult(p) {
    return 1;
  }
  function spellPowerMult(caster, abId) {
    const q = getPerks(caster, abId);
    let m = 1 + 0.15 * q.potency + 0.08 * (q.surge | 0);
    // weapon techniques + melee ride Strength; pure spells ride Intellect
    // (+1%/pt via magicDmgMult) — the exact mirror of meleeDmgMult.
    let tech = false;
    try { tech = !!(window.CFG && window.CFG.ABILITIES[abId] && window.CFG.ABILITIES[abId].kind === "technique"); } catch (e) { }
    if (caster && caster.kind === "player" && caster.stats) {
      if (PHYSICAL.has(abId) || tech) m *= meleeDmgMult(caster);
      else m *= magicDmgMult(caster);
    }
    // wand / staff trees amplify while their focus is wielded
    try {
      const fam = wieldedFamily(caster);
      if (fam === "wand") m *= wandPowerMult(caster);
      else if (fam === "staff") m *= staffPowerMult(caster);
    } catch (e) { }
    // staves amplify (first staff in hotbar order), rings match the element
    try {
      if (window.Items && window.Items.staffPowerMult) m *= window.Items.staffPowerMult(caster, abId);
    } catch (e) { }
    try {
      if (window.Items && window.Items.ringMult && window.CFG && window.CFG.ABILITIES[abId]) {
        const el = window.CFG.ABILITIES[abId].element || "physical";
        m *= window.Items.ringMult(caster, el);
        // holy vestments hum with holy spells
        if (el === "holy" && caster && caster.equipment) {
          const aid = caster.equipment.armor;
          if (aid === "holy_vestments") m *= 1.25;
          else if (aid === "archmage_robe") m *= 1.1;
        }
      }
    } catch (e) { }
    // Smite (and holy focus) bites undead — handled per-target in abilityDmg via target
    return Math.max(0.2, m);
  }
  // Shared mana-discount math (efficiency ranks + wand discounts). The
  // listed base IS the spell's MP cost; techniques pay 1.5x as STAMINA
  // instead of mana.
  function abilityCostBase(caster, abId) {
    const ab = AB()[abId]; if (!ab) return null;
    if (!ab.mp) return null;
    const q = getPerks(caster, abId);
    let cost = ab.mp * (1 - 0.1 * q.efficiency);
    // (INT spell-cost reduction retired: INT now gives MP regen instead)
    // wand tree discounts while a wand is wielded
    try { if (wieldedFamily(caster) === "wand") cost *= wandCostMult(caster); } catch (e) { }
    // wands discount (first wand in hotbar order; holy bead loves holy magic)
    try {
      if (window.Items && window.Items.wandManaMult) cost *= window.Items.wandManaMult(caster, abId);
    } catch (e) { }
    return { ab, cost };
  }
  // Spells cost their listed base MP (discounts only). Techniques never
  // pay mana through this path (they use effectiveStamCost instead).
  function effectiveMpCost(caster, abId) {
    const r = abilityCostBase(caster, abId);
    if (!r) return 0;
    return Math.max(1, Math.round(r.cost));
  }
  // Techniques run on stamina: 1.5x their (undoubled) mana requirement.
  function effectiveStamCost(caster, abId) {
    const r = abilityCostBase(caster, abId);
    if (!r) return 0;
    return Math.max(1, Math.round(r.cost * 1.5));
  }
  // ---- shared one-liners: one formula, one place ----
  // Hit finishing: mitigation + variance + minimum 1. strikeDmg,
  // abilityDmg and the game.js shot vehicles all end here.
  function rollVariance() { return 0.9 + Math.random() * 0.2; }
  function finishHit(raw, tdef) {
    return Math.max(1, Math.round((raw - (tdef || 0) * 0.55) * rollVariance()));
  }
  // MP a kit needs on hand: base pool + room for the dearest spell twice over.
  function wantMpFor(baseMp, dearest, isBoss) {
    return Math.round((baseMp || 0) + (dearest || 0) * 2.5 + (isBoss ? 40 : 12));
  }
  // Support upgrade refund: ranks refund mana instead of bigger heals
  // (12%/potency + 6%/surge + 50% mastery, capped at the cost paid).
  function supportRefund(caster, abId, cost) {
    try {
      const q = getPerks(caster, abId);
      return Math.min(cost, Math.round(cost * (0.12 * (q.potency | 0) + 0.06 * (q.surge | 0) + (q.mastery ? 0.5 : 0))));
    } catch (e) { return 0; }
  }
  function effectiveCooldown(caster, abId) {
    const ab = AB()[abId]; if (!ab || !ab.cd) return 0;
    const q = getPerks(caster, abId);
    let m = 1 - 0.08 * (q.surge | 0);
    if (q.mastery) m *= 0.8;
    // Quicken shortens every cooldown while a wand is wielded
    try { if (wieldedFamily(caster) === "wand") m *= 1 - 0.06 * wrank(caster, "wand", "quicken"); } catch (e) { }
    return ab.cd * Math.max(0.3, m);
  }
  // internal melee vehicle (replaces the retired Slash spell): base ATK x1.25,
  // Strength-scaled (+5 ATK in recalc + 0.5%/pt here), ring-matched,
  // armor-mitigated — the weapon trees and meleeMult layer on top in
  // combatDmg just like before. Physical hits mitigate with DEF.
  function strikeDmg(caster, target) {
    try {
      let strM = 1;
      try { strM = meleeDmgMult(caster); } catch (e) { }
      let ring = 1;
      try { if (window.Items && window.Items.ringMult) ring = window.Items.ringMult(caster, "physical"); } catch (e) { }
      const raw = Math.max(1, caster.atk) * 1.25 * strM * ring;
      const tdef = target ? ((target.sdef != null && target.def != null && target.sdef !== target.def) ? target.def : (target.def || 0)) : 0;
      return finishHit(raw, tdef);
    } catch (e) { return 5; }
  }
  function abilityDmg(caster, abId, target) {
    const ab = AB()[abId]; if (!ab) return 0;
    // ATK vs MATK, DEF vs SDEF: physical arts + techniques ride ATK and are
    // mitigated by DEF; pure spells ride MATK and are mitigated by SDEF.
    // Every caster — player, NPC, mob, tame — carries both stats now.
    let isMagic = false;
    try {
      let tech3 = false;
      try { tech3 = !!(window.CFG && window.CFG.ABILITIES[abId] && window.CFG.ABILITIES[abId].kind === "technique"); } catch (e3) { }
      isMagic = !PHYSICAL.has(abId) && !tech3;
    } catch (e) { isMagic = false; }
    let base = isMagic ? (caster.matk != null ? caster.matk : caster.atk) : caster.atk;
    // old saves / proxies without matk fall back to atk so nothing hits for 1
    if (!(base > 0)) base = caster.atk || 8;
    const atk = base * (caster.buffs.atkUpUntil && performance.now() < caster.buffs.atkUpUntil ? 1.3 : 1);
    let power = ab.power;
    // Smite is ruinous vs the unholy — undead and demons alike
    try {
      if (abId === "smite" && target && window.Items && window.Items.isUnholy(target)) power *= 2.5;
    } catch (e) { }
    let raw = atk * power * spellPowerMult(caster, abId);
    // (INT flat used to be added here — now it lives in MATK itself.)
    // physical arts mitigate with DEF, spells with spell defence (sdef)
    let tdef = 0;
    try {
      let tech2 = false;
      try { tech2 = !!(window.CFG && window.CFG.ABILITIES[abId] && window.CFG.ABILITIES[abId].kind === "technique"); } catch (e2) { }
      if (PHYSICAL.has(abId) || tech2) tdef = (target && target.def) || 0;
      else tdef = (target && (target.sdef != null ? target.sdef : target.def)) || 0;
    } catch (e) { tdef = (target && target.def) || 0; }
    return finishHit(raw, tdef);
  }
  // ---------- luck/agility/charm/fortitude ----------
  // Luck dodge/crit read the EFFECTIVE Luck (own + Usaghito Lucky Chorus).
  // Heroes always use it; party members / tames dodge + crit only while the
  // chorus reaches them (nearby usaghito), using the singer's Luck.
  function dodgeChance(ent) {
    if (!ent) return 0;
    const isHero = ent.kind === "player";
    const isAlly = !!(ent.inParty || ent.isTame);
    if (!isHero && !isAlly) return 0;
    let over = 0;
    try {
      if (window.Races && window.Races.effectiveLukOver) over = window.Races.effectiveLukOver(ent) || 0;
      else if (ent.stats) over = Math.max(0, ((ent.stats.luk | 0) || 5) - 5);
    } catch (e) { over = 0; }
    if (!isHero && !(over > 0)) return 0;
    // Luck: +0.5% dodge per point, capped at 95% (was 50%/40%).
    let d = Math.min(0.95, Math.max(0, over * 0.005));
    try { if (ent.buffs && ent.buffs.drugShadeUntil && performance.now() < ent.buffs.drugShadeUntil) d += 0.25; } catch (e) { }
    // Fleetfoot: daggers make you slippery. Inner Focus centers bare fists too.
    try { if (wieldedFamily(ent) === "dagger") d += 0.03 * wrank(ent, "dagger", "fleet"); } catch (e) { }
    try { if (wieldedFamily(ent) === "unarmed") d += 0.03 * wrank(ent, "unarmed", "focus"); } catch (e) { }
    return Math.min(0.95, d);
  }
  function critChance(src) {
    if (!src) return 0;
    const isHero = src.kind === "player";
    const isAlly = !!(src.inParty || src.isTame);
    if (!isHero && !isAlly) return 0;
    let over = 0;
    try {
      if (window.Races && window.Races.effectiveLukOver) over = window.Races.effectiveLukOver(src) || 0;
      else if (src.stats) over = Math.max(0, ((src.stats.luk | 0) || 5) - 5);
    } catch (e) { over = 0; }
    if (!isHero && !(over > 0)) return 0;
    // Luck: +2% crit rate per point (5% base)
    return Math.max(0, 0.05 + over * 0.02);
  }
  // Luck: critical hits do +10% damage per point (on top of the 1.8x base)
  function critMult(src) {
    try {
      if (!src) return 1.8;
      const isHero = src.kind === "player";
      const isAlly = !!(src.inParty || src.isTame);
      if (!isHero && !isAlly) return 1.8;
      let over = 0;
      try {
        if (window.Races && window.Races.effectiveLukOver) over = window.Races.effectiveLukOver(src) || 0;
        else if (src.stats) over = Math.max(0, ((src.stats.luk | 0) || 5) - 5);
      } catch (e) { over = 0; }
      if (!isHero && !(over > 0)) return 1.8;
      return Math.max(1.2, 1.8 + over * 0.10);
    } catch (e) { return 1.8; }
  }
  function loyaltyMult(p) {
    if (!p || !p.stats) return 1;
    // Charm: +4% loyalty per point
    return Math.max(0.5, 1 + (p.stats.cha - 5) * 0.04);
  }
  function recruitThreshold(npc) {
    return 10 * Math.max(1, (npc && npc.lv) || 1);
  }
  // Gold-gift / paid-heal pricing shared by NPC chat + party menu labels.
  // Gifts grant loyalty; healing the player via an NPC also grants loyalty.
  // Costs are FLAT by NPC level so Charm's faster loyalty is real gold saved
  // (the old cost scaled with loyaltyPts, which cancelled the bonus out).
  function loyaltyPts(p) {
    try { return Math.max(1, Math.round(loyaltyMult(p))); } catch (e) { return 1; }
  }
  function chaOver(p) {
    try { return Math.max(0, ((p && p.stats && p.stats.cha) | 0 || 5) - 5); } catch (e) { return 0; }
  }
  function giftCost(npc, p) {
    return Math.max(1, (npc && npc.lv) || 1);
  }
  function npcHealCost(npc, p) {
    return giftCost(npc, p) * 2;
  }
  // ---------- charm: the leader stat ----------
  // Party aura: the hero's Charm hardens every companion — in-party NPCs and
  // active tamed beasts gain +5 ATK, +5 MATK, +5 DEF and +5 SDEF per Charm
  // point over 5 (applied in game.js combatAtk/combatMatk/combatDef/combatSdef,
  // so it flows through every damage + mitigation path at once). SEPARATE from
  // the Usaghito Charm voice (Races.effectiveChaBonus, +1 per TOTAL Charm point
  // from the best nearby usaghito singer) — the two stack with each other.
  function charmPartyStatBonus(p) {
    try {
      if (!p || p.kind !== "player" || !p.stats) return 0;
      return Math.max(0, chaOver(p)) * 5;
    } catch (e) { return 0; }
  }
  // Retired flat damage aura (Nov 2026: Charm now grants stats instead).
  // Kept for compatibility — always 0 so old callers don't double-count.
  function partyPhysBonus(p) {
    return 0;
  }
  function partySpellBonus(p) {
    return 0;
  }
  function tamePhysBonus(p) {
    return 0;
  }
  function tameSpellBonus(p) {
    return 0;
  }
  // Retired percent aura (kept for compatibility — always 1).
  function partyDmgMult(p) {
    return 1;
  }
  function partyToughMult(p) {
    // damage-taken reduction retired — companions take full damage now
    return 1;
  }
  function partyXpMult(p) {
    return 1 + chaOver(p) * 0.06;
  }
  // Luck gold/drop boosts retired (Nov 2026: Luck gives dodge instead).
  // Kept for compatibility — always 1.
  function questGoldMult(p) {
    return 1;
  }
  // Beastfriend: taming rolls + earlier yields (higher HP threshold).
  function tameChanceBonus(p) {
    try {
      const cha = Math.max(0, ((p && p.stats && p.stats.cha) | 0 || 5) - 5);
      const luk = Math.max(0, ((p && p.stats && p.stats.luk) | 0 || 5) - 5);
      let per = 0.03;
      try { if (window.CFG && window.CFG.TAME && window.CFG.TAME.CHA_BONUS) per = window.CFG.TAME.CHA_BONUS; } catch (e) { }
      return cha * per + luk * 0.008;
    } catch (e) { return 0; }
  }
  function tameHpFrac(p) {
    try {
      const T = (window.CFG && window.CFG.TAME) || {};
      const base = T.OFFER_HP_FRAC || 0.3;
      const per = T.CHA_HP_BONUS || 0.03, cap = T.CHA_HP_MAX || 0.3;
      return base + Math.min(cap, chaOver(p) * per);
    } catch (e) { return 0.3; }
  }
  // Effective submit threshold for one beast (fraction of max HP): its personal
  // random roll (0-25% at spawn, stored on the mob) plus the hero's Beastfriend
  // widening. Backfills old saves that predate the roll. Clamped so 1 HP always
  // qualifies — every beast stays tameable if you tap carefully.
  function tameSubmitThreshold(mob, player) {
    try {
      const T = (window.CFG && window.CFG.TAME) || {};
      const mn = (T.SUBMIT_MIN != null ? T.SUBMIT_MIN : 0);
      const mx = (T.SUBMIT_MAX != null ? T.SUBMIT_MAX : (T.OFFER_HP_FRAC || 0.25));
      let base = mob ? mob.tameSubmitBase : null;
      if (!(base >= 0)) {
        base = mn + Math.random() * Math.max(0, mx - mn);
        try { if (mob) mob.tameSubmitBase = base; } catch (e) {}
      }
      let bonus = 0;
      try {
        const per = T.CHA_HP_BONUS || 0.03, cap = T.CHA_HP_MAX || 0.3;
        bonus = Math.min(cap, chaOver(player) * per);
      } catch (e) {}
      const eff = base + bonus;
      try {
        if (mob && mob.maxHp > 0) {
          const oneHp = 1 / mob.maxHp;
          if (eff < oneHp) return oneHp;
        }
      } catch (e) {}
      return eff;
    } catch (e) { return 0.25; }
  }
  // Diplomat's stride: mobs notice a charming hero later (sight reduction).
  function chaStealth(p) {
    return Math.min(5.0, chaOver(p) * 0.4);
  }
  // Flat field-care prices for party members (no loyalty involved).
  const PARTY_HEAL_COST = 100;
  const PARTY_REVIVE_COST = 500;
  function chestGoldMult(p) {
    // Luck gold boost retired (Nov 2026) — always 1.
    return 1;
  }
  // ---------- skill trees ----------
  // treeId is a weapon family ("sword"...), a spell id ("fireball"...), or a
  // learnt PASSIVE technique ("backstab"...). Spell trees reuse the legacy
  // p.spellPerks store, so old ranks carry straight over; passive technique
  // trees share the same store keyed by technique id.
  function skillTreeDef(treeId) {
    try {
      if (window.CFG.STATUS_TREES && window.CFG.STATUS_TREES[treeId]) {
        const t = window.CFG.STATUS_TREES[treeId];
        return { kind: "status", id: treeId, name: t.name, icon: t.icon, hint: t.hint, nodes: t.nodes, type: t.type };
      }
      if (treeId === "taming" && window.CFG.SKILL_TREES && window.CFG.SKILL_TREES.taming) {
        const t = window.CFG.SKILL_TREES.taming;
        return { kind: "taming", id: "taming", name: t.name, icon: t.icon, hint: t.hint, nodes: t.nodes };
      }
      if (window.CFG.SKILL_TREES && window.CFG.SKILL_TREES[treeId]) {
        const t = window.CFG.SKILL_TREES[treeId];
        return { kind: t.kind || "weapon", id: treeId, name: t.name, icon: t.icon, hint: t.hint, nodes: t.nodes };
      }
      if (window.CFG.TPASSIVE_NODES && window.CFG.TECHNIQUES && window.CFG.TECHNIQUES[treeId] && !window.CFG.TECHNIQUES[treeId].active) {
        const t = window.CFG.TECHNIQUES[treeId];
        const openDesc = (window.CFG.TPASSIVE_OPENING && window.CFG.TPASSIVE_OPENING[treeId]) || null;
        const nodes = window.CFG.TPASSIVE_NODES.map(n => (n.id === "opening" && openDesc) ? { ...n, desc: openDesc } : n);
        return { kind: "tpass", id: treeId, name: t.name, icon: t.icon, hint: t.hint, nodes };
      }
      if (window.CFG.SPELL_TREE_NODES && window.CFG.ABILITIES[treeId]) {
        const ab = window.CFG.ABILITIES[treeId];
        // trimmed trees (useless nodes removed — see CFG.SPELL_TREE_DROP)
        let nodes = window.CFG.SPELL_TREE_NODES;
        try { if (window.CFG.spellTreeNodes) nodes = window.CFG.spellTreeNodes(treeId) || nodes; } catch (e) { }
        return { kind: "spell", id: treeId, name: ab.name, icon: ab.icon, nodes };
      }
    } catch (e) { }
    return null;
  }
  function weaponRanks(p, tree) {
    try { return (p && p.weaponPerks && p.weaponPerks[tree]) || {}; } catch (e) { return {}; }
  }
  function wrank(p, tree, node) {
    try {
      if (!p || p.kind !== "player") return 0;
      const r = (p.weaponPerks && p.weaponPerks[tree]) || {};
      return Math.max(0, r[node] | 0);
    } catch (e) { return 0; }
  }
  // wielded weapon family: wtype, "bow" for bows, or "unarmed" for bare
  // fists. The martial-arts tree keys on it.
  function wieldedFamily(p) {
    try {
      if (!p || !window.Items || !window.Items.equippedWeapon) return null;
      const w = window.Items.equippedWeapon(p);
      if (!w) return "unarmed";
      if (w.bow) return "bow";
      return w.wtype || "unarmed";
    } catch (e) { return null; }
  }
  // ---------- per-tree skill points (practice, not levels) ----------
  // Which earn bucket a tree belongs to: guard arts have their own buckets,
  // active techniques earn on casts, learnt passives earn when their opening
  // bites, cataclysm spells earn on casts like other spells.
  function treeEarnKind(treeId) {
    try {
      try { if (window.CFG.STATUS_TREES && window.CFG.STATUS_TREES[treeId]) return "status"; } catch (e) { }
      if (treeId === "taming") return "taming";
      if (treeId === "armor") return "armor";
      if (treeId === "robe") return "robe";
      if (treeId === "kasaya") return "kasaya";
      if (treeId === "habitus") return "habitus";
      if (treeId === "parry") return "parry";
      if (treeId === "shield") return "shield";
      const T = (window.CFG && window.CFG.TECHNIQUES) || {};
      if (T[treeId] && T[treeId].active) return "technique";
      const def = skillTreeDef(treeId);
      if (!def) return null;
      if (def.kind === "tpass") return "tpass";
      if (def.kind === "weapon") return "weapon";
      if (def.kind === "spell") {
        try { if ((window.CFG.ABILITIES[treeId] || {}).kind === "cataclysm") return "cataclysm"; } catch (e) { }
        return "spell";
      }
    } catch (e) { }
    return null;
  }
  // {per, unit, how} for the next point in a tree, or null for unknown trees.
  function treeEarnNeed(treeId) {
    try {
      const kind = treeEarnKind(treeId);
      const E = (window.CFG && window.CFG.TREE_EARN) || {};
      if (kind && E[kind] && (E[kind].per | 0) > 0) return { per: E[kind].per | 0, unit: String(E[kind].unit || "uses"), how: String(E[kind].how || "using this tree") };
    } catch (e) { }
    return null;
  }
  // ranks already bought in a tree (for capacity checks + UI totals).
  function treeRanksBought(p, treeId) {
    try {
      const def = skillTreeDef(treeId);
      if (!def) return 0;
      const store = (def.kind === "spell" || def.kind === "tpass")
        ? ((p && p.spellPerks && p.spellPerks[treeId]) || {})
        : ((p && p.weaponPerks && p.weaponPerks[treeId]) || {});
      return Object.values(store).reduce((a, b) => a + (b | 0), 0);
    } catch (e) { return 0; }
  }
  function treeRanksMax(treeId) {
    try {
      const def = skillTreeDef(treeId);
      if (!def) return 0;
      return def.nodes.reduce((a, n) => a + (n.max | 0), 0);
    } catch (e) { return 0; }
  }
  function treePoints(p, treeId) {
    try { return Math.max(0, (p && p.treePts && p.treePts[treeId]) | 0); } catch (e) { return 0; }
  }
  // Lifetime taming history (monotonic — selling/releasing never reduces
  // it). Every skill/technique counter reads these, never the roster.
  function lifetimeTames(p) {
    try {
      ensureProgression(p);
      const a = (p.lifetimeTames | 0) || 0;
      const b = (((p.techXp || {}).uses || {}).tame | 0) || 0;
      return Math.max(a, b);
    } catch (e) { return 0; }
  }
  function lifetimeInsectTames(p) {
    try {
      ensureProgression(p);
      const a = (p.lifetimeInsectTames | 0) || 0;
      const b = ((((p.techXp || {}).uses || {}).insect_tame) | 0) || 0;
      return Math.max(a, b);
    } catch (e) { return 0; }
  }
  function treeProgress(p, treeId) {
    try { return Math.max(0, (p && p.treeProg && p.treeProg[treeId]) | 0); } catch (e) { return 0; }
  }
  // every unspent skill point anywhere: per-tree pools + the legacy generic
  // pool (old saves). HUD badges use this so nothing looks spendable-empty.
  function unspentSkillPoints(p) {
    try {
      let n = Math.max(0, (p && p.skillPoints) | 0);
      const t = (p && p.treePts) || {};
      for (const k of Object.keys(t)) n += Math.max(0, t[k] | 0);
      return n;
    } catch (e) { return 0; }
  }
  // Credit one use of a tree (a landed hit, a cast, a parry, an opening).
  // Returns true when a full point was earned. A tree stops accumulating
  // the moment its unspent points could buy every remaining rank
  // (ranks bought + unspent >= max) — capped trees earn nothing more.
  function treePointsCap(p, treeId) {
    try {
      const max = treeRanksMax(treeId);
      if (!(max > 0)) return 0;
      return Math.max(0, max - treeRanksBought(p, treeId));
    } catch (e) { return 0; }
  }
  function treeCapped(p, treeId) {
    try {
      const max = treeRanksMax(treeId);
      if (!(max > 0)) return true;
      return treeRanksBought(p, treeId) + treePoints(p, treeId) >= max;
    } catch (e) { return false; }
  }
  function noteTreeUse(p, treeId) {
    try {
      if (!p || p.kind !== "player" || !treeId) return false;
      const need = treeEarnNeed(treeId);
      if (!need) return false;
      try { ensureProgression(p); } catch (e) { }
      if (treeCapped(p, treeId)) return false;
      p.treeProg = p.treeProg || {};
      p.treePts = p.treePts || {};
      const cur = ((p.treeProg[treeId] | 0) || 0) + 1;
      if (cur >= need.per) {
        const cap = treePointsCap(p, treeId);
        if (cap <= 0) { try { delete p.treeProg[treeId]; } catch (e) { } return false; }
        p.treeProg[treeId] = cur - need.per;
        p.treePts[treeId] = ((p.treePts[treeId] | 0) || 0) + 1;
        if (treeCapped(p, treeId)) { try { delete p.treeProg[treeId]; } catch (e) { } }
        try {
          const def = skillTreeDef(treeId);
          const nm = (def && def.name) || treeId;
          if (window.UI && window.UI.toast) window.UI.toast(`🌟 +1 ${nm} skill point! (spend in Character · C)`, 2600);
          if (window.Sfx && window.Sfx.coin) window.Sfx.coin();
        } catch (e) { }
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) { }
        return true;
      }
      p.treeProg[treeId] = cur;
      return false;
    } catch (e) { return false; }
  }
  function spendSkillPoint(p, treeId, nodeId) {
    const def = skillTreeDef(treeId);
    if (!def) return false;
    const node = def.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    if (def.kind === "spell" && !p.abilities.includes(treeId)) return false;
    if (def.kind === "tpass" && !(p.techniques && p.techniques.includes(treeId))) return false;
    p.spellPerks = p.spellPerks || {};
    p.weaponPerks = p.weaponPerks || {};
    p.treePts = p.treePts || {};
    const store = (def.kind === "spell" || def.kind === "tpass")
      ? (p.spellPerks[treeId] = p.spellPerks[treeId] || {})
      : (p.weaponPerks[treeId] = p.weaponPerks[treeId] || {});
    const cur = store[nodeId] | 0;
    if (cur >= node.max) return false;
    if (node.req) for (const rn of Object.keys(node.req)) if ((store[rn] | 0) < node.req[rn]) return false;
    // per-tree points first; the retired generic pool (old saves) only as
    // a legacy fallback, spendable in any tree until it runs dry.
    const own = (p.treePts[treeId] | 0) || 0;
    if (own > 0) p.treePts[treeId] = own - 1;
    else if (((p.skillPoints | 0) || 0) > 0) p.skillPoints = (p.skillPoints | 0) - 1;
    else return false;
    store[nodeId] = cur + 1;
    // guard-shell ranks move max HP/MP: recompute so the sheet is live.
    try { if ((treeId === "armor" || treeId === "robe" || treeId === "kasaya" || treeId === "habitus") && p && p.kind === "player") recalcDerived(p, true); } catch (e) { }
    return true;
  }
  // base damage of the wielded family: +8%/rank, capstones on top
  // (phalanx also sharpens the spear while it guards you; bare fists run
  // the martial-arts stance the same way)
  function weaponBaseMult(p) {
    if (!p || p.kind !== "player") return 1;
    const wt = wieldedFamily(p);
    const base = { sword: "edge", axe: "hewn", hammer: "crush", dagger: "fang", whip: "lash", spear: "point", bow: "draw", wand: "focus", staff: "power", unarmed: "stance" }[wt];
    if (!base) return 1;
    let m = 1 + 0.08 * wrank(p, wt, base);
    if (wt === "spear") m *= 1 + 0.05 * wrank(p, "spear", "phalanx");
    const cap = { sword: "master", axe: "reaver", hammer: "juggernaut", dagger: "assassin", whip: "crackmaster", spear: "lancer", bow: "huntsmaster", unarmed: "grandmaster" }[wt];
    if (cap && wrank(p, wt, cap) > 0) m *= wt === "axe" ? 1.3 : 1.25;
    return m;
  }
  // execution-style conditionals, checked per target on melee hits
  function weaponMeleeMult(p, tgt) {
    let m = weaponBaseMult(p);
    if (!p || p.kind !== "player" || !tgt) return m;
    try {
      const wt = wieldedFamily(p);
      const frac = (tgt.hp > 0 && tgt.maxHp > 0) ? tgt.hp / tgt.maxHp : 1;
      if (wt === "sword") { const r = wrank(p, "sword", "execute"); if (r && frac < 0.3) m *= 1 + 0.15 * r; }
      else if (wt === "axe") { const r = wrank(p, "axe", "ravage"); if (r && window.Status && window.Status.has(tgt, "bleed")) m *= 1 + 0.15 * r; }
      else if (wt === "hammer") { const r = wrank(p, "hammer", "shatter"); if (r && window.Status && (window.Status.has(tgt, "sunder") || window.Status.has(tgt, "stun"))) m *= 1 + 0.15 * r; }
      else if (wt === "spear") { const r = wrank(p, "spear", "impale"); const th = wrank(p, "spear", "lancer") > 0 ? 0.5 : 0.7; if (r && frac > th) m *= 1 + 0.15 * r; }
    } catch (e) { }
    return m;
  }
  function weaponCritBonus(p) {
    try {
      if (!p || p.kind !== "player") return 0;
      if (wieldedFamily(p) === "dagger") return 0.08 * wrank(p, "dagger", "backstab");
      if (wieldedFamily(p) === "unarmed") return 0.08 * wrank(p, "unarmed", "focus");
      return 0;
    } catch (e) { return 0; }
  }
  function weaponCritPoison(p) {
    try { return !!(p && p.kind === "player" && wieldedFamily(p) === "dagger" && wrank(p, "dagger", "assassin") > 0); } catch (e) { return false; }
  }
  function weaponDefBonus(p) {
    try {
      if (!p || p.kind !== "player") return 0;
      if (wieldedFamily(p) === "spear") return 2 * wrank(p, "spear", "phalanx");
      if (wieldedFamily(p) === "whip") return 2 * wrank(p, "whip", "coils");
      return 0;
    } catch (e) { return 0; }
  }
  function weaponReachBonus(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "spear") return 0;
      return wrank(p, "spear", "reach") * 0.25 + (wrank(p, "spear", "lancer") > 0 ? 0.5 : 0);
    } catch (e) { return 0; }
  }
  function weaponTwin(p) {
    try {
      if (!p || p.kind !== "player") return null;
      const fam = wieldedFamily(p);
      if (fam === "sword") {
        const r = wrank(p, "sword", "twin");
        if (!r) return null;
        return { chance: 0.15 * r, mult: wrank(p, "sword", "master") > 0 ? 0.8 : 0.6 };
      }
      // Flurry of Blows: bare fists double-strike like Twin Fangs
      if (fam === "unarmed") {
        const r = wrank(p, "unarmed", "flurry");
        if (!r) return null;
        return { chance: 0.15 * r, mult: wrank(p, "unarmed", "grandmaster") > 0 ? 0.8 : 0.6 };
      }
      return null;
    } catch (e) { return null; }
  }
  function weaponCrescent(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "sword") return null;
      const r = wrank(p, "sword", "crescent");
      if (!r) return null;
      return { every: wrank(p, "sword", "master") > 0 ? 4 : 5, mult: [0, 0.6, 0.8, 1][r] || 1 };
    } catch (e) { return null; }
  }
  function weaponShockwave(p) {
    try { return !!(p && p.kind === "player" && wieldedFamily(p) === "hammer" && wrank(p, "hammer", "shatter") > 0); } catch (e) { return false; }
  }
  function weaponBleedSpec(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "axe") return null;
      const r = wrank(p, "axe", "gash");
      if (!r) return null;
      const deep = wrank(p, "axe", "deep");
      return { chance: 0.2 * r, pct: 0.025 * (1 + 0.4 * deep), ms: 12000 + 4000 * deep };
    } catch (e) { return null; }
  }
  function weaponSunderSpec(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "hammer") return null;
      const r = wrank(p, "hammer", "sunder");
      if (!r) return null;
      return { chance: 0.25 * r, defDown: 3 * r, ms: 8000 };
    } catch (e) { return null; }
  }
  function weaponStunSpec(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "hammer") return null;
      const r = wrank(p, "hammer", "concuss");
      if (!r) return null;
      return { chance: 0.12 * r, dur: wrank(p, "hammer", "juggernaut") > 0 ? 1.5 : 1 };
    } catch (e) { return null; }
  }
  // Barbed Sting: crackling whips stop victims cold (tree stun, stacks
  // with the weapon tier's own stun proc from applyWeaponProcs).
  function weaponWhipStunSpec(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "whip") return null;
      const r = wrank(p, "whip", "sting");
      if (!r) return null;
      const bonus = wrank(p, "whip", "crackmaster") > 0 ? 0.5 : 0;
      return { chance: 0.12 * r, dur: 0.5 + 0.25 * r + bonus };
    } catch (e) { return null; }
  }
  // Snapback: every Nth connected whip swing cracks twice (echo at 60%).
  function weaponSnapback(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "whip") return null;
      const r = wrank(p, "whip", "snapback");
      if (!r) return null;
      return { every: wrank(p, "whip", "crackmaster") > 0 ? 4 : 6, mult: 0.6 };
    } catch (e) { return null; }
  }
  function weaponUnarmedStunSpec(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "unarmed") return null;
      const r = wrank(p, "unarmed", "palm");
      if (!r) return null;
      return { chance: 0.12 * r, dur: wrank(p, "unarmed", "grandmaster") > 0 ? 1.5 : 1 };
    } catch (e) { return null; }
  }
  // Never Ending Drive: martial-arts lifesteal — 10%/20%/30% of the
  // damage dealt by unarmed attacks returns as HP (the 1s cooldown per
  // trigger is enforced in Game.maybeNeverEndingDrive). Gated on the
  // blow's family, not the wielded weapon: bare-fist strikes and Iron
  // Palm both ride fam "unarmed" (clone fists punch bare-handed too and
  // feed their owner).
  function weaponNeverEndingDrive(p) {
    try {
      if (!p || p.kind !== "player") return 0;
      const r = wrank(p, "unarmed", "drive");
      if (r >= 3) return 0.30;
      if (r === 2) return 0.20;
      if (r === 1) return 0.10;
      return 0;
    } catch (e) { return 0; }
  }
  function weaponVenomSpec(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "dagger") return null;
      const r = wrank(p, "dagger", "venom");
      if (!r) return null;
      return { chance: 0.15 * r };
    } catch (e) { return null; }
  }
  function weaponVolley(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "bow") return null;
      const r = wrank(p, "bow", "volley");
      if (!r) return null;
      return { chance: 0.12 * r, mult: wrank(p, "bow", "huntsmaster") > 0 ? 1 : 0.8 };
    } catch (e) { return null; }
  }
  function weaponSplinter(p) {
    try { return (p && p.kind === "player" && wieldedFamily(p) === "bow") ? 0.15 * wrank(p, "bow", "splinter") : 0; } catch (e) { return 0; }
  }
  function weaponDeadeyeMult(p, dist) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "bow") return 1;
      const r = wrank(p, "bow", "deadeye");
      return (r && dist > 5) ? 1 + 0.1 * r : 1;
    } catch (e) { return 1; }
  }
  function weaponBowRange(p) {
    try { return (p && p.kind === "player" && wieldedFamily(p) === "bow") ? wrank(p, "bow", "deadeye") : 0; } catch (e) { return 0; }
  }
  // Juggernaut: sundered armor barely resists your hammer
  function weaponIgnoresResist(p) {
    try { return !!(p && p.kind === "player" && wieldedFamily(p) === "hammer" && wrank(p, "hammer", "juggernaut") > 0); } catch (e) { return false; }
  }
  // ---- Hurling: thrown arms ride their own tree (no weapon wielded) ----
  // Sharp Edges sharpens every star; Storm of Stars caps it. Hurled from
  // the hand, so these read ranks directly instead of via wieldedFamily.
  function shurikenTreeMult(p) {
    try {
      if (!p || p.kind !== "player") return 1;
      let m = 1 + 0.08 * wrank(p, "shuriken", "sharp");
      if (wrank(p, "shuriken", "storm") > 0) m *= 1.25;
      return m;
    } catch (e) { return 1; }
  }
  // Fan Toss: a free second star (Storm makes it full-force).
  function shurikenFan(p) {
    try {
      if (!p || p.kind !== "player") return null;
      const r = wrank(p, "shuriken", "fan");
      if (!r) return null;
      return { chance: 0.15 * r, mult: wrank(p, "shuriken", "storm") > 0 ? 1 : 0.8 };
    } catch (e) { return null; }
  }
  function shurikenRangeBonus(p) {
    try { return (p && p.kind === "player") ? wrank(p, "shuriken", "long_arm") : 0; }
    catch (e) { return 0; }
  }
  // Smoke Veil: longer, wider blindness from smoke bombs.
  function smokeBombBonus(p) {
    try {
      if (!p || p.kind !== "player") return { durMs: 0, radius: 0 };
      const r = wrank(p, "shuriken", "smoke_veil");
      return { durMs: 4000 * r, radius: 0.5 * r };
    } catch (e) { return { durMs: 0, radius: 0 }; }
  }
  // ---- Afflictions: per-status skill trees (status_*). Potency sharpens the
  // ailment's own numbers, Lingering stretches durations, Exploit makes
  // afflicted victims take more damage from you, Apex masters the ailment.
  function statusTreeIdFor(type) { return "status_" + type; }
  function statusRanks(p, type, node) {
    try { return wrank(p, "status_" + type, node); } catch (e) { return 0; }
  }
  function statusHasApex(p, type) {
    try { return statusRanks(p, type, "apex") > 0; } catch (e) { return false; }
  }
  function statusPotencyMult(p, type) {
    try {
      if (!p || p.kind !== "player") return 1;
      let m = 1 + 0.12 * (statusRanks(p, type, "potency") | 0);
      if (statusHasApex(p, type)) m *= 1.25;
      return m;
    } catch (e) { return 1; }
  }
  function statusDurationMult(p, type) {
    try {
      if (!p || p.kind !== "player") return 1;
      let m = 1 + 0.20 * (statusRanks(p, type, "lingering") | 0);
      if (statusHasApex(p, type)) m *= 1.25;
      return m;
    } catch (e) { return 1; }
  }
  function blindMissFor(p) {
    try {
      if (!p || p.kind !== "player") return 0.2;
      let m = 0.2 + 0.04 * (statusRanks(p, "blind", "potency") | 0);
      if (statusHasApex(p, "blind")) m += 0.10;
      return Math.min(0.55, m);
    } catch (e) { return 0.2; }
  }
  function blindSightFor(p) {
    try {
      if (!p || p.kind !== "player") return 3.5;
      let s = 3.5 - 0.3 * (statusRanks(p, "blind", "potency") | 0);
      if (statusHasApex(p, "blind")) s -= 0.5;
      return Math.max(1.5, s);
    } catch (e) { return 3.5; }
  }
  function slowFactorFor(p, victim) {
    try {
      if (!p || p.kind !== "player") return (victim && victim.kind === "player") ? 0.6 : 0.5;
      const base = (victim && victim.kind === "player") ? 0.6 : 0.5;
      let f = base - 0.05 * (statusRanks(p, "slow", "potency") | 0);
      if (statusHasApex(p, "slow")) f -= 0.10;
      return Math.max(0.2, f);
    } catch (e) { return (victim && victim.kind === "player") ? 0.6 : 0.5; }
  }
  function slowDurationMult(p) {
    try { return statusDurationMult(p, "slow"); } catch (e) { return 1; }
  }
  // Exploit: every ailment on the victim (+ active slow) makes YOUR hits
  // hurt more. Sums across present ailments, capped at +50%.
  function statusVulnMult(att, tgt) {
    try {
      if (!att || att.kind !== "player" || !tgt) return 1;
      let bonus = 0;
      const types = ["poison", "burn", "freeze", "paralyze", "blind", "bleed", "sunder", "stun"];
      for (const t of types) {
        let on = false;
        try { on = !!(tgt.status && tgt.status[t]); } catch (e) { on = false; }
        if (!on) continue;
        bonus += 0.06 * (statusRanks(att, t, "exploit") | 0);
        if (statusHasApex(att, t)) bonus += 0.10;
      }
      try { if (tgt.slowUntil && performance.now() < tgt.slowUntil) { bonus += 0.06 * (statusRanks(att, "slow", "exploit") | 0); if (statusHasApex(att, "slow")) bonus += 0.10; } } catch (e) { }
      if (!(bonus > 0)) return 1;
      return Math.min(1.5, 1 + bonus);
    } catch (e) { return 1; }
  }
  function afflictionTreeTotals(p) {
    const out = {};
    try {
      const trees = (window.CFG && window.CFG.STATUS_TREES) || {};
      for (const id of Object.keys(trees)) {
        const r = (p && p.weaponPerks && p.weaponPerks[id]) || {};
        out[id] = Object.values(r).reduce((a, b) => a + (b | 0), 0);
      }
    } catch (e) { }
    return out;
  }
  // ---- Parrying: turn the off-hand into a guard (Q) ----
  // Base window 0.15s (+0.15s/rank of Open Window); spamming is gated by a
  // 1.0s cooldown (−0.12s/rank of Quick Recovery, floored at 0.4s) AND by
  // stamina: every opened guard costs 25 stamina, so holding Q empties the
  // bar in seconds and a winded guard simply won't open.
  function parryWindowSecs(p) {
    try { return 0.15 + 0.15 * (wrank(p, "parry", "timing") | 0); } catch (e) { return 0.15; }
  }
  function parryCooldownSecs(p) {
    try { return Math.max(0.4, 1.0 - 0.12 * (wrank(p, "parry", "recovery") | 0)); } catch (e) { return 1.0; }
  }
  // Fighter's Instinct: a small chance to auto-parry even without pressing Q
  // (Perfect Guard adds +5%). Rolls once per incoming hit in dealDamage.
  function autoParryChance(p) {
    try {
      if (!p || p.kind !== "player") return 0;
      let c = 0.04 * (wrank(p, "parry", "instinct") | 0);
      if (wrank(p, "parry", "master") > 0) c += 0.05;
      return Math.min(0.5, c);
    } catch (e) { return 0; }
  }
  // Perfect Guard halves whatever fraction the parry would have left.
  function perfectParryMult(p) {
    try { return (p && p.kind === "player" && wrank(p, "parry", "master") > 0) ? 0.5 : 1; } catch (e) { return 1; }
  }
  // ---- Shieldwork: the off-hand wall ----
  // Rebound: X% chance per rank to throw half the parried blow back at the
  // attacker (Aegis: full power instead of half). Bulwark: parried blows cut
  // another x0.9 per rank while parrying with a shield.
  function shieldReflectChance(p) {
    try {
      if (!p || p.kind !== "player") return 0;
      let c = 0.08 * (wrank(p, "shield", "rebound") | 0);
      if (wrank(p, "shield", "aegis") > 0) c += 0.25;
      return Math.min(0.75, c);
    } catch (e) { return 0; }
  }
  function shieldReflectPower(p) {
    try { return (p && p.kind === "player" && wrank(p, "shield", "aegis") > 0) ? 1 : 0.5; } catch (e) { return 0.5; }
  }
  function shieldParryCutMult(p) {
    try {
      if (!p || p.kind !== "player") return 1;
      return Math.pow(0.9, wrank(p, "shield", "bulwark") | 0);
    } catch (e) { return 1; }
  }
  function shieldEquipped(p) {
    try { return !!(p && p.equipment && p.equipment.shield && window.Items && window.Items.ITEMS[p.equipment.shield]); } catch (e) { return false; }
  }
  // ---- Guard shells: Stoneskin (armor) + Wardweave (robe) ----
  // Which shell the hero wears: "armor" (plate/leather/garb), "robe"
  // (cloth/mage/archmage/holy/void/dawnshroud/tideward), "kasaya"
  // (striker wraps), "habitus" (chanter tunics), or null when bare.
  // All guard bonuses below apply ONLY in the matching shell.
  function armorWornClass(p) {
    try {
      if (window.Items && window.Items.armorClass) return window.Items.armorClass(p);
      const aid = p && p.equipment && p.equipment.armor;
      if (!aid) return null;
      if (/robe|vestments|mantle/.test(String(aid))) return "robe";
      if (/kasaya/.test(String(aid))) return "kasaya";
      if (/habit/.test(String(aid))) return "habitus";
      return "armor";
    } catch (e) { return null; }
  }
  function armorDefBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "armor") return 0;
      return 3 * (wrank(p, "armor", "iron_skin") | 0) + (wrank(p, "armor", "adamant") > 0 ? 8 : 0);
    } catch (e) { return 0; }
  }
  function armorHpBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "armor") return 0;
      return 25 * (wrank(p, "armor", "vigor") | 0);
    } catch (e) { return 0; }
  }
  function armorResistBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "armor") return 0;
      let r = 0.02 * (wrank(p, "armor", "tempered") | 0);
      if (wrank(p, "armor", "adamant") > 0) r += 0.04;
      return Math.min(0.2, r);
    } catch (e) { return 0; }
  }
  function armorRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "armor") return 0;
      return 0.2 * (wrank(p, "armor", "second_wind") | 0);
    } catch (e) { return 0; }
  }
  function robeSdefBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "robe") return 0;
      return 3 * (wrank(p, "robe", "wardweave") | 0) + (wrank(p, "robe", "archward") > 0 ? 8 : 0);
    } catch (e) { return 0; }
  }
  function robeMatkBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "robe") return 0;
      return 6 * (wrank(p, "robe", "deep_font") | 0);
    } catch (e) { return 0; }
  }
  function robeMpBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "robe") return 0;
      return 30 * (wrank(p, "robe", "deep_font") | 0);
    } catch (e) { return 0; }
  }
  function robeResistBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "robe") return 0;
      let r = 0.02 * (wrank(p, "robe", "spellward") | 0);
      if (wrank(p, "robe", "archward") > 0) r += 0.04;
      return Math.min(0.2, r);
    } catch (e) { return 0; }
  }
  function robeRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "robe") return 0;
      return 0.2 * (wrank(p, "robe", "mindveil") | 0);
    } catch (e) { return 0; }
  }
  // ---- Striking wraps: Ascetic (kasaya) ----
  // Strong Thread + Warrior Monk sharpen the fists; Forceful Blows (+ the
  // capstone) harden every physical blow. Iron Will deepens the stamina
  // pool, Enduring March quickens its return. All gated on the wrap.
  function kasayaAtkBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "kasaya") return 0;
      return 4 * (wrank(p, "kasaya", "strong_thread") | 0) + (wrank(p, "kasaya", "warrior_monk") > 0 ? 10 : 0);
    } catch (e) { return 0; }
  }
  function kasayaPhysMult(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "kasaya") return 1;
      let m = 1 + 0.03 * (wrank(p, "kasaya", "forceful") | 0);
      if (wrank(p, "kasaya", "warrior_monk") > 0) m *= 1.05;
      return m;
    } catch (e) { return 1; }
  }
  function kasayaStaminaBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "kasaya") return 0;
      return 10 * (wrank(p, "kasaya", "iron_will") | 0);
    } catch (e) { return 0; }
  }
  function kasayaRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "kasaya") return 0;
      return 0.15 * (wrank(p, "kasaya", "enduring") | 0);
    } catch (e) { return 0; }
  }
  // ---- Choir tunics: Devotion (habitus) ----
  // Prayer Weave + Seraph Voice deepen MATK; Empowered Prayer (+ the
  // capstone) blesses every spell. Litany lengthens the MP pool, Clarity
  // quickens its return. All gated on the tunic.
  function habitusMatkBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "habitus") return 0;
      return 4 * (wrank(p, "habitus", "prayer_weave") | 0) + (wrank(p, "habitus", "seraph_voice") > 0 ? 10 : 0);
    } catch (e) { return 0; }
  }
  function habitusSpellMult(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "habitus") return 1;
      let m = 1 + 0.03 * (wrank(p, "habitus", "empowered") | 0);
      if (wrank(p, "habitus", "seraph_voice") > 0) m *= 1.05;
      return m;
    } catch (e) { return 1; }
  }
  function habitusMpBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "habitus") return 0;
      return 25 * (wrank(p, "habitus", "litany") | 0);
    } catch (e) { return 0; }
  }
  function habitusRegenBonus(p) {
    try {
      if (!p || p.kind !== "player" || armorWornClass(p) !== "habitus") return 0;
      return 0.15 * (wrank(p, "habitus", "clarity") | 0);
    } catch (e) { return 0; }
  }
  // One landed direct blow BY the hero feeds the worn shell's tree. Called
  // from dealDamage (player attacker only, real damage, never status
  // ticks): physical hits feed Ascetic in kasaya, spell hits feed Devotion
  // in a habitus. Armor/robes learn nothing here (they learn from hits
  // TAKEN via noteArmorHit); killing blows already returned via onKill.
  function noteStrikeHit(p, isMagic) {
    try {
      if (!p || p.kind !== "player") return false;
      const c = armorWornClass(p);
      if (!isMagic && c === "kasaya") return noteTreeUse(p, "kasaya");
      if (isMagic && c === "habitus") return noteTreeUse(p, "habitus");
      return false;
    } catch (e) { return false; }
  }
  // One landed direct blow on the hero feeds the worn shell's tree. Called
  // from dealDamage (player only, real damage, never status ticks).
  function noteArmorHit(p) {
    try {
      if (!p || p.kind !== "player") return false;
      const c = armorWornClass(p);
      if (c === "armor") return noteTreeUse(p, "armor");
      if (c === "robe") return noteTreeUse(p, "robe");
      return false;
    } catch (e) { return false; }
  }
  function wandCostMult(p) {
    let m = 1 - 0.05 * wrank(p, "wand", "channel");
    if (wrank(p, "wand", "archmage") > 0) m *= 0.8;
    return Math.max(0.4, m);
  }
  function wandPowerMult(p) {
    let m = 1 + 0.06 * wrank(p, "wand", "focus");
    if (wrank(p, "wand", "archmage") > 0) m *= 1.15;
    return m;
  }
  function staffPowerMult(p) {
    let m = 1 + 0.08 * wrank(p, "staff", "power");
    if (wrank(p, "staff", "archon") > 0) m *= 1.2;
    return m;
  }
  function weaponAoeMult(p) {
    try { return (p && p.kind === "player" && wieldedFamily(p) === "staff") ? 1 + 0.12 * wrank(p, "staff", "burst") : 1; } catch (e) { return 1; }
  }
  function weaponEcho(p) {
    try {
      if (!p || p.kind !== "player" || wieldedFamily(p) !== "staff") return 0;
      const r = wrank(p, "staff", "echo");
      if (!r) return 0;
      return wrank(p, "staff", "archon") > 0 ? Math.min(1, 0.2 * r) : 0.1 * r;
    } catch (e) { return 0; }
  }
  function weaponTreeTotals(p) {
    const out = {};
    try {
      const trees = (window.CFG && window.CFG.SKILL_TREES) || {};
      for (const id of Object.keys(trees)) {
        const r = (p && p.weaponPerks && p.weaponPerks[id]) || {};
        out[id] = Object.values(r).reduce((a, b) => a + (b | 0), 0);
      }
    } catch (e) { }
    return out;
  }
  function spellTreeTotal(p, abId) {
    try {
      const r = (p && p.spellPerks && p.spellPerks[abId]) || {};
      return Object.values(r).reduce((a, b) => a + (b | 0), 0);
    } catch (e) { return 0; }
  }
  // passive-technique tree ranks (might/opening/mastery/apex), stored in
  // p.spellPerks[techId] like spell ranks. Safe zeros for anyone unlearnt.
  function techRanks(p, techId) {
    try {
      const r = (p && p.kind === "player" && p.spellPerks && p.spellPerks[techId]) || {};
      return {
        might: Math.min(5, r.might | 0), opening: Math.min(3, r.opening | 0),
        mastery: Math.min(1, r.mastery | 0), apex: Math.min(1, r.apex | 0),
      };
    } catch (e) { return { might: 0, opening: 0, mastery: 0, apex: 0 }; }
  }
  function spendStatPoint(p, key) {
    if (!window.CFG.STATS[key] || (p.statPoints | 0) <= 0) return false;
    p.statPoints--;
    p.stats[key]++;
    recalcDerived(p, true);
    return true;
  }
  // ---------- tames ----------
  // A tamed mob becomes a persistent party-grade beast on the player object.
  // Tames level like NPCs (cap 100) and fight beside the party; mounts among
  // them can also be ridden (see Game mount helpers).
  // Bosses never submit: boss-flagged templates and BOSS_KINDS are excluded
  // from every taming path, unlocked or not. (Apex ancients are NOT bosses —
  // see the apex block below for their fully-maxed-tree rule.)
  function isBossMobKind(kind) {
    try {
      const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      if (t && t.boss) return true;
      if (window.CFG && window.CFG.BOSS_KINDS && window.CFG.BOSS_KINDS.includes(kind)) return true;
    } catch (e) { }
    return false;
  }
  // ---------- apex ancients (peak-dragon tier): the one tamable exception ----
  // The six lv-70 highland ancients answer only to a FULLY maxed Beastmastery
  // tree (every node at max rank — a maxed tree always holds Apex Bond, so
  // the level gate is moot for them). Each beaten ancient rolls ONCE (first
  // time it could submit, stored on the mob) for whether it ever asks —
  // APEX_TAME_CHANCE (5%): the rest never yield, no retries.
  const APEX_TAME_FALLBACK = ["peak_dragon", "frostwyrm", "mire_hydra", "tempest_roc", "prism_colossus", "umbral_wyrm"];
  function apexTameKinds() {
    try {
      const T = (window.CFG && window.CFG.TAMING) || {};
      if (Array.isArray(T.APEX_TAME_KINDS) && T.APEX_TAME_KINDS.length) return T.APEX_TAME_KINDS;
    } catch (e) { }
    return APEX_TAME_FALLBACK;
  }
  function isApexTameKind(kind) {
    try { return apexTameKinds().indexOf(kind) >= 0; } catch (e) { return false; }
  }
  // Fully maxed Beastmastery: every node in the tree at its max rank.
  function tamingTreeMaxed(p) {
    try {
      if (!p || p.kind !== "player") return false;
      let nodes = null;
      try { nodes = (window.CFG && window.CFG.SKILL_TREES && window.CFG.SKILL_TREES.taming && window.CFG.SKILL_TREES.taming.nodes) || null; } catch (e) { }
      if (!nodes || !nodes.length) nodes = [{ id: "pack_bond", max: 4 }, { id: "vermin_lore", max: 1 }, { id: "broad_kinship", max: 1 }, { id: "big_game", max: 3 }, { id: "apex_bond", max: 1 }];
      for (const n of nodes) {
        const max = (n && n.max | 0) || 1;
        if (((wrank(p, "taming", n.id) | 0) || 0) < max) return false;
      }
      return true;
    } catch (e) { return false; }
  }
  // Whether THIS beaten ancient ever asks: rolled once per beast, stored on
  // the mob (_apexTameRolled/_apexTameChosen) so later beatings can't re-roll.
  // Revival clears the once-per-life flags (see resetTameSubmit) so a revived
  // beast rolls fresh and can be felled again until it submits.
  function apexTameAskRoll(mob) {
    try {
      if (!mob) return false;
      if (mob._apexTameRolled === true) return mob._apexTameChosen === true;
      mob._apexTameRolled = true;
      let ch = 0.05;
      try { const T = (window.CFG && window.CFG.TAMING) || {}; if (T.APEX_TAME_CHANCE != null && isFinite(+T.APEX_TAME_CHANCE)) ch = +T.APEX_TAME_CHANCE; } catch (e) { }
      mob._apexTameChosen = Math.random() < ch;
      return mob._apexTameChosen === true;
    } catch (e) { return false; }
  }
  // Fresh submit roll for a revived beast: re-roll its personal 0-25% point,
  // clear any live offer, and clear the apex once-per-life ask flags so the
  // next felling rolls again. Bosses keep their never-submit gate (checked in
  // tameEligible) — the reset is still harmless for them. Returns the new base.
  function resetTameSubmit(mob) {
    try {
      if (!mob) return null;
      const T = (window.CFG && window.CFG.TAME) || {};
      const mn = (T.SUBMIT_MIN != null ? T.SUBMIT_MIN : 0);
      const mx = (T.SUBMIT_MAX != null ? T.SUBMIT_MAX : (T.OFFER_HP_FRAC || 0.25));
      const base = mn + Math.random() * Math.max(0, mx - mn);
      mob.tameSubmitBase = base;
      try { mob.tameOffer = false; mob.tameOfferUntil = 0; } catch (e) { }
      try { mob._apexTameRolled = false; mob._apexTameChosen = false; } catch (e) { }
      try { if (mob._tameDenyUntil) mob._tameDenyUntil = 0; } catch (e) { }
      return base;
    } catch (e) { return null; }
  }
  // Beasts alongside the hero: 1 + Pack Bond ranks (cap 5). Lent mounts
  // (riderId) never count — only your own loose beasts do.
  function tameSlots(p) {
    try {
      const r = (wrank(p, "taming", "pack_bond") | 0) || 0;
      return Math.min(5, Math.max(1, 1 + Math.max(0, r)));
    } catch (e) { return 1; }
  }
  // Highest mob level the hero may tame: base + Big Game ranks (Apex Bond
  // removes the cap entirely — returns Infinity).
  function tameLevelCap(p) {
    try {
      if (((wrank(p, "taming", "apex_bond") | 0) || 0) > 0) return Infinity;
      const T = (window.CFG && window.CFG.TAMING) || {};
      const base = (T.BASE_MAXLV != null ? T.BASE_MAXLV : 15);
      const per = (T.BIG_GAME_BONUS != null ? T.BIG_GAME_BONUS : 15);
      return base + per * (((wrank(p, "taming", "big_game") | 0) || 0));
    } catch (e) { return 15; }
  }
  // Whether a KIND may ever submit for this hero: apex ancients first (fully
  // maxed tree or nothing — this overrides template flags and unlock lists);
  // then template-tamable always; insects need Vermin Lore; most wild animals
  // need Broad Kinship. Warlords never. (Level is checked separately in
  // tameEligible — moot for apex, whose rule is tree-only by design.)
  function tameCanKind(p, kind) {
    try {
      if (isApexTameKind(kind)) return tamingTreeMaxed(p);
      if (isBossMobKind(kind)) return false;
      const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      if (t && t.tamable) return true;
      const T = (window.CFG && window.CFG.TAMING) || {};
      if (((wrank(p, "taming", "vermin_lore") | 0) || 0) > 0 && (T.INSECT_KINDS || []).includes(kind)) return true;
      if (((wrank(p, "taming", "broad_kinship") | 0) || 0) > 0 && (T.ANIMAL_KINDS || []).includes(kind)) return true;
    } catch (e) { }
    return false;
  }
  // Full eligibility for one mob: {ok} or {ok:false, reason} where reason is
  // "boss" | "apex" | "type" | "level". Apex ancients are tree-only (a maxed
  // tree always holds Apex Bond, so no level check). No player (old callers)
  // falls back to the template flag only, bosses and apex still excluded.
  function tameEligible(p, mob) {
    try {
      const kind = mob && mob.kind;
      if (!kind) return { ok: false, reason: "type" };
      if (isApexTameKind(kind)) {
        if (!tamingTreeMaxed(p)) return { ok: false, reason: "apex" };
        return { ok: true };
      }
      if (isBossMobKind(kind) || (mob && mob.isBoss)) return { ok: false, reason: "boss" };
      if (p && !tameCanKind(p, kind)) return { ok: false, reason: "type" };
      if (!p) {
        const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
        return (t && t.tamable) ? { ok: true } : { ok: false, reason: "type" };
      }
      const cap = tameLevelCap(p);
      if ((mob.lv | 0 || 1) > cap) return { ok: false, reason: "level", cap };
    } catch (e) { }
    return { ok: true };
  }
  function tameDenyText(reason, cap) {
    try {
      if (reason === "boss") return "👑 Bosses never submit — no cage holds a warlord.";
      if (reason === "apex") return "👑 Apex ancients kneel only for a FULLY maxed 🐾 Taming tree (every node maxed) — and even then only 1 in 20 beaten ancients ever asks.";
      if (reason === "level") return `🏹 Too strong to tame (needs lv ≤ ${cap === Infinity ? "∞" : cap}) — learn Big Game / Apex Bond (🐾 Taming, C).`;
      return "🪲 This beast won't trust you — learn Vermin Lore / Broad Kinship (🐾 Taming, C).";
    } catch (e) { return "That beast won't submit."; }
  }
  function isTamableKind(kind) {
    try {
      const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      return !!(t && t.tamable);
    } catch (e) { return false; }
  }
  function isMountKind(kind) {
    try {
      const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      return !!(t && t.mount);
    } catch (e) { return false; }
  }
  // Deterministic wild body for one kind + level: the same growth curve
  // makeMob rolls on, minus per-spawn variation, boss tier bulk and random
  // bonus spells (template kit only). Tames anchor to this: each tame keeps
  // the ratios it was caught/bred/bought with, and level-ups re-apply them
  // at the new level — so a raised beast tracks the wild curve instead of
  // freezing at its catch body. Old saves backfill ratios at their current
  // level (no retroactive bump — growth resumes from the next level).
  function wildBody(kind, lv) {
    try {
      const T = ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || {});
      const g = mobGrowth(kind, T);
      const lvv = Math.max(1, Math.min(100, Math.round(lv || 1)));
      const lf = mobLevelFactor(lvv);
      const n = Math.max(0, (lvv | 0) - 1);
      let dear = 0;
      try {
        for (const a of (T.abilities || [])) { const ab = window.CFG.ABILITIES[a]; if (ab && (ab.mp | 0) > dear) dear = ab.mp | 0; }
      } catch (e2) {}
      let mp = mobScaledStat(T.mp | 0, g.mp, lf, g.mpCap != null ? g.mpCap : g.hpCap);
      const want = wantMpFor(T.mp, dear, false);
      if (mp < want) mp = want;
      return {
        maxHp: mobScaledStat(T.hp | 0, g.hp, lf, g.hpCap),
        maxMp: mp,
        atk: mobScaledStat(T.atk | 0, g.atk, lf, g.atkCap),
        matk: mobScaledStat(T.atk | 0, g.matk, lf, g.matkCap != null ? g.matkCap : g.atkCap),
        def: mobScaledStat(T.def | 0, g.def, lf, g.defCap != null ? g.defCap : g.atkCap),
        sdef: mobScaledStat(T.def | 0, g.sdef, lf, g.sdefCap != null ? g.sdefCap : g.atkCap),
        spd: Math.round((((T.spd != null ? T.spd : 3)) + Math.min(g.spdCap, g.spdRate * n * (1 + n / 60))) * 10) / 10,
      };
    } catch (e) { return null; }
  }
  function initTameGrowth(t) {
    // Anchor one tame's individual body to the wild curve at its level.
    // Idempotent: call whenever a tame is minted or when ratios are missing.
    try {
      if (!t || !t.kind) return t;
      const lv = Math.max(1, Math.min(100, t.lv | 0 || 1));
      const w = wildBody(t.kind, lv);
      if (!w) return t;
      const r = (have, base) => (base > 0 && have > 0) ? (have / base) : 1;
      t.caughtLv = lv;
      t.growR = {
        hp: r(t.maxHp | 0, w.maxHp), mp: r(t.maxMp | 0, w.maxMp),
        atk: r(t.atk | 0, w.atk), matk: r((t.matk != null ? t.matk : t.atk) | 0, w.matk),
        def: r(t.def | 0, w.def), sdef: r((t.sdef != null ? t.sdef : t.def) | 0, w.sdef),
      };
      t.spdOff = Math.round((((typeof t.spd === "number" ? t.spd : 3)) - w.spd) * 10) / 10;
      return t;
    } catch (e) { return t; }
  }
  function applyTameGrowth(t) {
    // Rebuild one tame's body at its CURRENT level from the anchored ratios.
    try {
      if (!t || !t.kind || !t.growR) return t;
      const lv = Math.max(1, Math.min(100, t.lv | 0 || 1));
      const w = wildBody(t.kind, lv);
      if (!w) return t;
      const R = t.growR;
      const ap = (base, ratio, mn) => Math.max(mn, Math.round(base * (ratio > 0 ? ratio : 1)));
      t.maxHp = ap(w.maxHp, R.hp, 1); t.maxMp = ap(w.maxMp, R.mp, 0);
      t.atk = ap(w.atk, R.atk, 1); t.matk = ap(w.matk, R.matk, 1);
      t.def = ap(w.def, R.def, 0); t.sdef = ap(w.sdef, R.sdef, 0);
      t.spd = Math.max(1.5, Math.round((w.spd + (t.spdOff || 0)) * 10) / 10);
      return t;
    } catch (e) { return t; }
  }
  function mountInfo(kind) {
    try { return ((window.CFG.MOB_TEMPLATES || {})[kind] || {}).mount || null; } catch (e) { return null; }
  }
  function makeTameFromMob(mob) {
    // Never mint a tame with an invalid kind — without a template body it
    // renders as a humanoid NPC (see black-market dire_wolf et al). Fall back
    // to slime, whose stats the caller already carries in that case.
    try {
      if (mob && mob.kind && window.CFG && window.CFG.MOB_TEMPLATES && !window.CFG.MOB_TEMPLATES[mob.kind]) {
        mob = Object.assign({}, mob, { kind: "slime", name: (window.CFG.MOB_TEMPLATES.slime || {}).name || "Slime", tint: mob.tint || ((window.CFG.MOB_TEMPLATES.slime || {}).tint || "#5dd66b") });
      }
    } catch (e) {}
    const tpl = ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[mob.kind]) || {});
    const lv = Math.max(1, Math.min(100, mob.lv | 0 || 1));
    const t = {
      id: "t_" + Math.random().toString(36).slice(2, 9), isTame: true,
      kind: mob.kind, name: mob.name || tpl.name || mob.kind,
      tint: mob.tint || tpl.tint || "#8a5a33",
      lv, xp: 0,
      maxHp: Math.max(1, mob.maxHp | 0 || 40), maxMp: Math.max(0, mob.maxMp | 0 || 0),
      atk: Math.max(1, mob.atk | 0 || 8), def: Math.max(0, mob.def | 0 || 2),
      matk: Math.max(1, (mob.matk != null ? mob.matk : mob.atk) | 0 || 8),
      sdef: Math.max(0, (mob.sdef != null ? mob.sdef : mob.def) | 0 || 0),
      spd: Math.max(1.5, mob.spd || 3),
      hp: 0, mp: 0, abilities: Array.isArray(mob.abilities) ? [...mob.abilities] : [],
      equipment: { weapon: null, armor: null, trinket: null, shield: null },
      x: mob.x, y: mob.y, inParty: true, stabled: false,
    };
    // sex rides along from the caught mob (old saves backfill on load)
    try { t.gender = normalizeGender(mob.gender) || rollGender(mob.kind, t.id); } catch (e) { t.gender = "male"; }
    // tamed beasts wake up hurt but alive (~40% HP) and ready to follow
    t.hp = Math.max(1, Math.round(t.maxHp * 0.4));
    t.mp = Math.round(t.maxMp * 0.5);
    try { initTameGrowth(t); } catch (e) {}
    // war-gear rides along: a tamed art-user keeps the steel it fought with
    try {
      const me = (mob && mob.equipment) || {};
      if (me.weapon && window.Items && window.Items.ITEMS[me.weapon]) t.equipment.weapon = me.weapon;
      if (me.shield && window.Items && window.Items.ITEMS[me.shield]) t.equipment.shield = me.shield;
      if (me.armor && window.Items && window.Items.ITEMS[me.armor]) t.equipment.armor = me.armor;
    } catch (e) {}
    return t;
  }
  function tameGainXp(tame, amount) {
    if (!tame || !(amount > 0)) return { leveled: false };
    tame.xp = (tame.xp | 0) + Math.round(amount);
    let leveled = false;
    try {
      // old saves predate growth anchors: freeze the current body as the
      // baseline at the current level, then grow from the next level on
      if (!tame.growR) { try { initTameGrowth(tame); } catch (e2) {} }
      while (tame.lv < 100 && tame.xp >= xpFor(tame.lv)) {
        tame.xp -= xpFor(tame.lv); tame.lv++;
        // Raised beasts track the wild curve: re-apply the caught ratios at
        // the new level (individual variation and breeding mutations ride
        // along instead of freezing at the catch body).
        try { applyTameGrowth(tame); } catch (e2) {}
        leveled = true;
        tame.hp = Math.min(tame.maxHp, tame.hp + Math.round(tame.maxHp * 0.4));
        tame.mp = Math.min(tame.maxMp, tame.mp + Math.round(tame.maxMp * 0.4));
      }
      if (tame.lv >= 100) tame.xp = Math.min(tame.xp, Math.max(0, xpFor(100) - 1));
    } catch (e) { }
    return { leveled };
  }
  // ---------- NPC mounts (Dec 2026) ----------
  // Some townsfolk keep a personal beast: guards/scouts patrol mounted,
  // hunters ride out, travelers arrive in the saddle. Stored on the NPC as
  // npc.mount = {kind, tint} (persisted via World.saveNpc like the rest of
  // the NPC record). Old saves get a deterministic roll on first sight, so
  // the same villager keeps the same beast across reloads.
  const NPC_MOUNT_CHANCE = {
    guard: 0.38, samurai: 0.32, warrior: 0.28, tidewarden: 0.26,
    hunter: 0.2, adventurer: 0.13, merchant: 0.08, runesmith: 0.06,
    miner: 0.05, fisher: 0.05, bard: 0.04,
  };
  const NPC_MOUNT_KINDS = ["wild_horse", "wild_horse", "wild_horse", "wild_horse", "wild_horse", "wild_horse",
    "cinder_steed", "cinder_steed", "tide_turtle", "kelpie", "magma_tortoise"];
  function hashStr(s) {
    try {
      const str = String(s || "");
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0) / 4294967296;
    } catch (e) { return Math.random(); }
  }
  function npcMounted(npc) {
    try { return !!(npc && npc.mount && npc.mount.kind); } catch (e) { return false; }
  }
  function npcMountInfo(npc) {
    try {
      const k = npc && npc.mount && npc.mount.kind;
      if (!k) return null;
      return ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[k]) || {}).mount || null;
    } catch (e) { return null; }
  }
  // Deterministic roll for one NPC: role-gated chance, kind from id hash.
  // Returns {kind, tint} or null. Never overwrites an existing mount.
  function rollNpcMount(npc) {
    try {
      if (!npc || npc.role === "mob") return null;
      if (npc.mount) return npc.mount;
      const chance = NPC_MOUNT_CHANCE[npc.role] || 0;
      if (!(chance > 0)) return null;
      const h1 = hashStr(npc.id || (npc.name + "|" + npc.role));
      // night-duty patrollers are the town watch: they ride more often
      const boost = npc.nightDuty ? 0.25 : 0;
      if (h1 >= chance + boost) return null;
      const kinds = NPC_MOUNT_KINDS;
      const kind = kinds[Math.floor(hashStr("k|" + (npc.id || npc.name)) * kinds.length) % kinds.length] || "wild_horse";
      let tint = null;
      try { tint = ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || {}).tint || null; } catch (e) { }
      return { kind, tint: tint || "#8a5a33" };
    } catch (e) { return null; }
  }
  // Backfill for old saves + new spawns. Assigns exactly once (mount stays
  // undefined until first sight, then null or a beast forever).
  function ensureNpcMount(npc) {
    try {
      if (!npc || npc.role === "mob") return npc;
      if (npc.mount !== undefined) {
        // validate a stored mount (hand edits, retired kinds)
        try {
          if (npc.mount && npc.mount.kind) {
            const tpl = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[npc.mount.kind]) || null;
            if (!tpl || !tpl.mount) npc.mount = null;
            else if (!npc.mount.tint) npc.mount.tint = tpl.tint || "#8a5a33";
          }
        } catch (e) { }
        return npc;
      }
      const m = rollNpcMount(npc);
      npc.mount = m || null;
    } catch (e) { }
    return npc;
  }
  function npcMountSpeed(npc) {
    try {
      const info = npcMountInfo(npc);
      if (!info) return 1;
      if (npc && npc.sleeping) return 1;
      return info.speed || 1.3;
    } catch (e) { return 1; }
  }
  function activeTames(p) {
    try {
      ensureProgression(p);
      return (p.tames || []).filter(t => t && !t.stabled && t.inParty !== false && !t.breeding);
    } catch (e) { return []; }
  }
  function stabledTames(p) {
    try {
      ensureProgression(p);
      return (p.tames || []).filter(t => t && (t.stabled || t.inParty === false) && !t.breeding);
    } catch (e) { return []; }
  }
  // ---------- gender: male / female / genderless ----------
  // Kind-fixed sexes (CFG FEMALE/MALE/GENDERLESS_KINDS) always win; anything
  // else rolls per individual, seeded by seedStr so the same creature keeps
  // its sex across reloads. NPC sexes come from their names instead.
  function rollGender(kind, seedStr) {
    try {
      const C = window.CFG || {};
      if (kind && Array.isArray(C.FEMALE_KINDS) && C.FEMALE_KINDS.indexOf(kind) >= 0) return "female";
      if (kind && Array.isArray(C.MALE_KINDS) && C.MALE_KINDS.indexOf(kind) >= 0) return "male";
      if (kind && Array.isArray(C.GENDERLESS_KINDS) && C.GENDERLESS_KINDS.indexOf(kind) >= 0) return "genderless";
    } catch (e) {}
    try { return hashStr("sex:" + String(seedStr != null ? seedStr : kind)) < 0.5 ? "male" : "female"; }
    catch (e) { return Math.random() < 0.5 ? "male" : "female"; }
  }
  function normalizeGender(g) {
    const s = String(g || "").toLowerCase();
    return (s === "male" || s === "female" || s === "genderless") ? s : "";
  }
  // Backfill + coerce for old saves: mobs/tames roll from kind+id, NPCs and
  // slaves are guessed from their names (kings male, queens female, ...).
  function ensureGender(ent) {
    try {
      if (!ent || typeof ent !== "object") return "";
      let g = normalizeGender(ent.gender);
      if (!g) {
        const T = (window.CFG && window.CFG.MOB_TEMPLATES) || {};
        if (ent.role === "mob" || ent.isTame || (ent.kind && T[ent.kind])) {
          g = rollGender(ent.kind, ent.id || (ent.kind + ":" + (ent.name || "")));
        } else {
          try { g = (window.AIDirector && window.AIDirector.guessGenderFromName) ? window.AIDirector.guessGenderFromName(ent.name) : ""; } catch (e2) { g = ""; }
          if (!g) g = rollGender(null, ent.id || ent.name);
        }
        ent.gender = g;
      }
      return ent.gender;
    } catch (e) { return ""; }
  }
  function genderIcon(g) {
    const s = normalizeGender(g);
    return s === "male" ? "♂" : s === "female" ? "♀" : s === "genderless" ? "⚲" : "•";
  }
  function genderLabel(g) {
    const s = normalizeGender(g);
    return s === "male" ? "Male" : s === "female" ? "Female" : s === "genderless" ? "Genderless" : "Unknown";
  }
  // Breeding needs one male and one female: same-sex pairs and anything
  // genderless are refused (the message names both partners for the lodge UI).
  function breedSexCompatible(a, b) {
    try {
      const ga = normalizeGender(a && a.gender) || ensureGender(a);
      const gb = normalizeGender(b && b.gender) || ensureGender(b);
      const na = (a && a.name) || "one", nb = (b && b.name) || "the other";
      if (!ga || !gb) return { ok: false, msg: "Need a male and a female — genders unknown." };
      if (ga === "genderless" || gb === "genderless") {
        const who = ga === "genderless" ? na : nb;
        return { ok: false, msg: `${who} is genderless and can't breed — pair a ♂ male with a ♀ female.` };
      }
      if (ga === gb) return { ok: false, msg: `Need a male and a female — ${na} (${genderIcon(ga)}) × ${nb} (${genderIcon(gb)}) won't pair.` };
      return { ok: true, ga, gb };
    } catch (e) { return { ok: false, msg: "Those two can't breed." }; }
  }
  // ---------- beast-lodge breeding: species, cost, offspring ----------
  // Same kinship family only (see CFG.BREED_FAMILIES): horses cover the
  // equine steeds, hounds the dog-kin, shellbacks the shelled divers,
  // coils the serpents, skyborn the flyers, swarms the giant insects.
  // Anything unlisted breeds same-kind only. Same-kind pairs still differ
  // beast to beast (see makeMob's individual deviation), so pairing two
  // wolves is about combining their rolls, not cloning the template.
  function breedFamily(kind) {
    try {
      const F = (window.CFG && window.CFG.BREED_FAMILIES) || null;
      if (F) for (const fam of Object.keys(F)) {
        const arr = F[fam];
        if (Array.isArray(arr) && arr.indexOf(kind) >= 0) return fam;
      }
      const HK = (window.CFG && window.CFG.HORSE_KINDS) || [];
      if (HK.indexOf(kind) >= 0) return "horse";
    } catch (e) {}
    return String(kind || "");
  }
  function breedFamilyLabel(kind) {
    try {
      const fam = breedFamily(kind);
      const L = (window.CFG && window.CFG.BREED_FAMILY_LABEL) || {};
      if (L[fam]) return L[fam];
      const T = ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || {});
      return (T.name || kind || "beasts").toLowerCase();
    } catch (e) { return String(kind || "beasts"); }
  }
  function breedCompatible(kindA, kindB) {
    try {
      if (!kindA || !kindB) return false;
      return breedFamily(kindA) === breedFamily(kindB);
    } catch (e) { return kindA === kindB; }
  }
  function breedEcon() {
    try {
      const E = window.CFG && window.CFG.BREED_ECON;
      if (E) return E;
    } catch (e) {}
    return { BASE: 60, LV_MULT: 8, STAT_MULT: 0.6, HP_MULT: 0.15, ABILITY_MULT: 12, TIME_BASE_MS: 120000, TIME_PER_LV_MS: 5000, TIME_MAX_MS: 300000, MUTATE_STAT_CHANCE: 0.30, MUTATE_STAT_MIN: 0.05, MUTATE_STAT_MAX: 0.12, EXTRA_ABILITY_CHANCE: 0.15 };
  }
  function breedCost(a, b) {
    try {
      const E = breedEcon();
      const lv = Math.max(1, (a && a.lv) | 0 || 1) + Math.max(1, (b && b.lv) | 0 || 1);
      const stat = (t) => Math.max(0, (t && t.atk) | 0 || 0) + Math.max(0, (t && t.def) | 0 || 0) + Math.max(0, (t && (t.sdef != null ? t.sdef : t.def)) | 0 || 0) + Math.max(0, (t && (t.matk != null ? t.matk : t.atk)) | 0 || 0);
      const hp = Math.max(1, (a && a.maxHp) | 0 || 40) + Math.max(1, (b && b.maxHp) | 0 || 40);
      const ab = ((a && a.abilities) || []).length + ((b && b.abilities) || []).length;
      const raw = (E.BASE | 0) + (E.LV_MULT | 0) * lv + (E.STAT_MULT || 0) * (stat(a) + stat(b)) + (E.HP_MULT || 0) * hp + (E.ABILITY_MULT | 0) * ab;
      return Math.max(10, Math.round(raw / 5) * 5);
    } catch (e) { return 100; }
  }
  function breedTimeMs(a, b) {
    try {
      const E = breedEcon();
      const lv = Math.max(1, (a && a.lv) | 0 || 1) + Math.max(1, (b && b.lv) | 0 || 1);
      const ms = (E.TIME_BASE_MS | 0) + (E.TIME_PER_LV_MS | 0) * lv;
      return Math.max(60000, Math.min(E.TIME_MAX_MS | 0 || 300000, ms));
    } catch (e) { return 180000; }
  }
  // Offspring: kind is one random parent (keeps horse lines horse), each
  // numeric stat is one random parent's value, each parental attack has a
  // coin-flip to inherit. Mutation (when rolled): 1-2 stats nudge ±5-12%,
  // and/or one extra attack from the wider beast pool.
  function makeBreedOffspring(a, b, rng) {
    try {
      const R = (typeof rng === "function") ? rng : Math.random;
      const pick = (x, y) => (R() < 0.5 ? x : y);
      const kind = (R() < 0.5 ? a.kind : b.kind) || a.kind || b.kind || "wolf";
      const T = ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || {});
      const E = breedEcon();
      const num = (v, fb) => (typeof v === "number" && isFinite(v) ? v : fb);
      const o = {
        id: "t_" + Math.random().toString(36).slice(2, 9), isTame: true,
        kind, name: T.name || kind, tint: pick(a.tint || T.tint || "#8a5a33", b.tint || T.tint || "#8a5a33"),
        lv: 1, xp: 0,
        maxHp: Math.max(1, Math.round(num(pick(a.maxHp, b.maxHp), T.hp || 40))),
        maxMp: Math.max(0, Math.round(num(pick(a.maxMp, b.maxMp), T.mp || 0))),
        atk: Math.max(1, Math.round(num(pick(a.atk, b.atk), T.atk || 8))),
        def: Math.max(0, Math.round(num(pick(a.def, b.def), T.def || 2))),
        matk: 0, sdef: 0,
        spd: Math.max(1.5, num(pick(a.spd, b.spd), T.spd || 3)),
        hp: 0, mp: 0, abilities: [],
        x: 0, y: 0, inParty: false, stabled: true, bred: true,
      };
      o.matk = Math.max(1, Math.round(num(pick(a.matk != null ? a.matk : a.atk, b.matk != null ? b.matk : b.atk), o.atk)));
      o.sdef = Math.max(0, Math.round(num(pick(a.sdef != null ? a.sdef : a.def, b.sdef != null ? b.sdef : b.def), o.def)));
      // attacks: each distinct parental attack has a 50% chance (at least one if parents knew any)
      try {
        const pool = [];
        for (const ab of ((a.abilities || []).concat(b.abilities || []))) if (ab && pool.indexOf(ab) < 0) pool.push(ab);
        const got = [];
        for (const ab of pool) if (R() < 0.5) got.push(ab);
        if (!got.length && pool.length) got.push(pool[(R() * pool.length) | 0]);
        o.abilities = got.slice(0, 4);
      } catch (e2) { o.abilities = []; }
      let mutated = false;
      // stat mutation: nudge 1-2 stats by ±5-12%
      try {
        if (R() < (E.MUTATE_STAT_CHANCE != null ? E.MUTATE_STAT_CHANCE : 0.30)) {
          mutated = true;
          const keys = ["maxHp", "atk", "def", "matk", "sdef", "spd", "maxMp"];
          const n = 1 + (R() < 0.4 ? 1 : 0);
          for (let i = 0; i < n; i++) {
            const k = keys[(R() * keys.length) | 0];
            const lo = (E.MUTATE_STAT_MIN != null ? E.MUTATE_STAT_MIN : 0.05);
            const hi = (E.MUTATE_STAT_MAX != null ? E.MUTATE_STAT_MAX : 0.12);
            const mag = lo + R() * Math.max(0, hi - lo);
            const up = R() < 0.6;
            if (k === "spd") o.spd = Math.max(1.5, o.spd * (up ? 1 + mag * 0.5 : 1 - mag * 0.5));
            else if (k === "maxMp") o.maxMp = Math.max(0, Math.round(o.maxMp * (up ? 1 + mag : 1 - mag * 0.7)));
            else o[k] = Math.max(k === "atk" || k === "matk" || k === "maxHp" ? 1 : 0, Math.round(o[k] * (up ? 1 + mag : 1 - mag)));
          }
        }
      } catch (e2) {}
      // extra-attack mutation: teach one new beast attack not already known
      try {
        if (R() < (E.EXTRA_ABILITY_CHANCE != null ? E.EXTRA_ABILITY_CHANCE : 0.15)) {
          const seen = {};
          for (const ab of (o.abilities || [])) seen[ab] = true;
          const cands = [];
          try {
            const MT = (window.CFG && window.CFG.MOB_TEMPLATES) || {};
            for (const k of Object.keys(MT)) {
              const abs = (MT[k] || {}).abilities || [];
              for (const ab of abs) if (ab && !seen[ab] && cands.indexOf(ab) < 0) cands.push(ab);
            }
          } catch (e3) {}
          if (!cands.length) {
            try {
              const AB = (window.CFG && window.CFG.ABILITIES) || {};
              for (const k of Object.keys(AB)) {
                const ab = AB[k];
                if (ab && (ab.kind === "projectile" || ab.kind === "aoe") && !seen[ab.id] && cands.indexOf(ab.id) < 0) cands.push(ab.id);
              }
            } catch (e3) {}
          }
          if (cands.length && o.abilities.length < 4) {
            o.abilities.push(cands[(R() * cands.length) | 0]);
            mutated = true;
          }
        }
      } catch (e2) {}
      o.hp = o.maxHp; o.mp = o.maxMp;
      // sexed offspring only (genderless parents can't breed, gated above)
      try { o.gender = (typeof R === "function" && R() < 0.5) ? "male" : "female"; } catch (e2) { o.gender = Math.random() < 0.5 ? "male" : "female"; }
      if (mutated) o.mutated = true;
      // anchor the newborn to the wild curve at lv1: inherited bulk and
      // mutations ride along as ratios, so leveling keeps climbing
      try { initTameGrowth(o); } catch (e2) {}
      return o;
    } catch (e) { return null; }
  }
  // ---------- bestiary archive: which beasts the hero has met and slain ----------
  // Seen is a set (counts stay 1 — the sighting pass runs every 2s); slain
  // counts lifetime player-faction kills per kind. Slaying implies meeting.
  // Both return true when the kind is recorded for the first time.
  function noteBestiarySeen(p, kind) {
    try {
      if (!p || !kind) return false;
      if (!p.bestiary || typeof p.bestiary !== "object" || Array.isArray(p.bestiary)) p.bestiary = { seen: {}, slain: {} };
      if (!p.bestiary.seen || typeof p.bestiary.seen !== "object" || Array.isArray(p.bestiary.seen)) p.bestiary.seen = {};
      if (!p.bestiary.seen[kind]) { p.bestiary.seen[kind] = 1; return true; }
    } catch (e) {}
    return false;
  }
  function noteBestiarySlain(p, kind) {
    try {
      if (!p || !kind) return false;
      if (!p.bestiary || typeof p.bestiary !== "object" || Array.isArray(p.bestiary)) p.bestiary = { seen: {}, slain: {} };
      if (!p.bestiary.seen || typeof p.bestiary.seen !== "object" || Array.isArray(p.bestiary.seen)) p.bestiary.seen = {};
      if (!p.bestiary.slain || typeof p.bestiary.slain !== "object" || Array.isArray(p.bestiary.slain)) p.bestiary.slain = {};
      const isNew = !p.bestiary.seen[kind];
      if (isNew) p.bestiary.seen[kind] = 1;
      p.bestiary.slain[kind] = ((p.bestiary.slain[kind] | 0)) + 1;
      return isNew;
    } catch (e) {}
    return false;
  }
  function bestiarySeenCount(p) {
    try { return Object.keys((p && p.bestiary && p.bestiary.seen) || {}).length; } catch (e) { return 0; }
  }
  function bestiarySlainCount(p) {
    try {
      let n = 0;
      const s = (p && p.bestiary && p.bestiary.slain) || {};
      for (const k of Object.keys(s)) n += (s[k] | 0) || 0;
      return n;
    } catch (e) { return 0; }
  }
  return {
    makePlayer, makeNpcStatBlock, roleMult, makeMob, mobGrowth, mobArchetype, mobLevelFactor, gainXp, xpFor, abilityDmg, abilityUnlockFor, baseStats,
    bossMagicTier, movepoolFor,
    mobGearTierFor, mobWarBand, mobWarTier, mobArmorTrack, mobArmorIdForTier, fitMobArmor, gearIdForFamTier, mobTechniqueFams, mobTechniqueGear, equipMobTechniqueGear, equipMobWarGear,
    ensureProgression, migratePlayer, recalcDerived, defaultStats, defaultHotbar, equipBonuses,
    maxStaminaFor,
    raceBonus, syncRace,
    getPerks, getOwnPerks, hasMastery, spellPowerMult, effectiveMpCost, effectiveStamCost, effectiveCooldown, strikeDmg,
    finishHit, wantMpFor, supportRefund,
    techWeaponFam, techWeaponName, techWeaponScale, shadowCloneStats, spellParent, spellAncestors, spellLineage, spellLineageLabel, effectiveSpellPerks, spellChannelTime,
    meleeDmgMult, flurryDmgMult, staminaRegenMult, hpRegenMult, mpRegenMult, staminaRegenBonus, hpRegenBonus, mpRegenBonus, agiCdMult,
    magicDmgMult, spellFlatBonus, spellCostMult, strOver, intOver, lukOver, agiOver, endOver, forOver,
    dodgeChance, critChance, critMult, loyaltyMult, loyaltyPts, giftCost, npcHealCost,
    recruitThreshold, chestGoldMult, questGoldMult, partyDmgMult, partyToughMult, partyXpMult,
    partyPhysBonus, partySpellBonus, tamePhysBonus, tameSpellBonus, charmPartyStatBonus,
    tameChanceBonus, tameHpFrac, tameSubmitThreshold, chaStealth, chaOver, PARTY_HEAL_COST, PARTY_REVIVE_COST,
    rollGender, normalizeGender, ensureGender, genderIcon, genderLabel, breedSexCompatible,
    spendStatPoint, spendSkillPoint,
    skillTreeDef, weaponRanks, wieldedFamily,
    treeEarnKind, treeEarnNeed, treeRanksBought, treeRanksMax,
    treePoints, treePointsCap, treeCapped, treeProgress, unspentSkillPoints, noteTreeUse, noteArmorHit,
    armorWornClass, armorDefBonus, armorHpBonus, armorResistBonus, armorRegenBonus,
    robeSdefBonus, robeMatkBonus, robeMpBonus, robeResistBonus, robeRegenBonus,
    kasayaAtkBonus, kasayaPhysMult, kasayaStaminaBonus, kasayaRegenBonus,
    habitusMatkBonus, habitusSpellMult, habitusMpBonus, habitusRegenBonus,
    noteStrikeHit,
    lifetimeTames, lifetimeInsectTames,
    weaponBaseMult, weaponMeleeMult, weaponCritBonus, weaponCritPoison, weaponDefBonus,
    weaponReachBonus, weaponTwin, weaponCrescent, weaponShockwave,
    weaponBleedSpec, weaponSunderSpec, weaponStunSpec, weaponUnarmedStunSpec, weaponVenomSpec,
    weaponNeverEndingDrive,
    weaponWhipStunSpec, weaponSnapback,
    weaponVolley, weaponSplinter, weaponDeadeyeMult, weaponBowRange, weaponIgnoresResist,
    shurikenTreeMult, shurikenFan, shurikenRangeBonus, smokeBombBonus,
    statusTreeIdFor, statusRanks, statusHasApex, statusPotencyMult, statusDurationMult,
    blindMissFor, blindSightFor, slowFactorFor, slowDurationMult, statusVulnMult,
    afflictionTreeTotals,
    parryWindowSecs, parryCooldownSecs, autoParryChance, perfectParryMult,
    shieldReflectChance, shieldReflectPower, shieldParryCutMult, shieldEquipped,
    wandCostMult, wandPowerMult, staffPowerMult, weaponAoeMult, weaponEcho,
    weaponTreeTotals, spellTreeTotal, techRanks,
    isTamableKind, isMountKind, mountInfo, makeTameFromMob, tameGainXp, activeTames, stabledTames,
    wildBody, initTameGrowth, applyTameGrowth,
    isBossMobKind, tameSlots, tameLevelCap, tameCanKind, tameEligible, tameDenyText,
    isApexTameKind, tamingTreeMaxed, apexTameAskRoll, resetTameSubmit,
    breedFamily, breedFamilyLabel, breedCompatible, breedEcon, breedCost, breedTimeMs, makeBreedOffspring,
    noteBestiarySeen, noteBestiarySlain, bestiarySeenCount, bestiarySlainCount,
    npcMounted, npcMountInfo, rollNpcMount, ensureNpcMount, npcMountSpeed, NPC_MOUNT_CHANCE,
  };
})();
