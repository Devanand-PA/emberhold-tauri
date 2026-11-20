/* Guild halls — regional postings, rotating boards, ranks, commissions.
   window.Guild
   - Any guildhall-class building posts work on its Noticeboard. Regular
     postings ROTATE every few minutes even if nobody takes them; each pin is
     exclusive (one accepter) and is replaced once taken.
   - Kill/clear work points at a REGION where the target naturally lives:
     hunting grounds (biome search), house infestations (a real nearby house),
     apex lairs (real highland ground / live ancient when one roosts nearby).
     Kill credit only counts near the target, so contracts send you out.
     - Adventurer rank (Rusty -> Iron -> Steel -> Mythril -> Dragonbone -> Oblivion -> Dawnstone) gates
     severity + scales payout. Thresholds are total completed contracts:
      Rusty 0, Iron 5, Steel 10, Mythril 30, Dragonbone 100, Oblivion 200, Dawnstone 300.
     Low ranks: fetch/kill + house bat infestations. High ranks: house work is
     haunt-only (banshees et al); peak-dragon culls at Dragonbone, hell-fiend
     culls only at Oblivion.
   - Commissions: players post their own kill/fetch work (gold cost by target).
     Separate board section, never rotates away, open until cleared. Multiple
     hands can work one commission; first turn-in wins. Commissioner collects
     the goods (fetch) or the confirmation (kill) at any Counter.
   - Adventurer NPCs pick up open commissions, walk out to the grounds, fight
     (and can die), and turn in. Other multiplayer travelers can take and turn
     in commissions too (first finisher wins) via guildClaim/guildComm sync.
*/
window.Guild = (() => {
  const MAX_ACTIVE = 3;
  const BOARD_SIZE = 4;
  const BOARD_POOL = 8;
  const ROTATE_MS = 5 * 60 * 1000;
  const TARGET_RADIUS = 70;
  const HOUSE_RADIUS = 18;
  const COMM_FEE = 0.2;
  const NPC_TICK_S = 4;

  const RANKS = [
    { id: "rusty", name: "Rusty", icon: "🗡️", mult: 1.0, blurb: "Unproven blade. Small postings, honest pay." },
    { id: "iron", name: "Iron", icon: "⚔️", mult: 1.4, blurb: "Trusted hireling. Better postings open up." },
    { id: "steel", name: "Steel", icon: "🛡️", mult: 1.8, blurb: "Seasoned steel. Guild postings pay well." },
    { id: "mythril", name: "Mythril", icon: "💠", mult: 2.9, blurb: "Sky-steel elite. Only the hard postings." },
    { id: "dragon", name: "Dragonbone", icon: "🐲", mult: 3.6, blurb: "Dragon-slayer. The guild's finest blade." },
    { id: "oblivion", name: "Oblivion", icon: "🌌", mult: 5.0, blurb: "Walker past the end. Only hell contracts — the pay is obscene." },
    { id: "dawnstone", name: "Dawnstone", icon: "🌅", mult: 6.0, blurb: "Dawn-forged. Heaven's overworld bosses fell to your hand — the guild bows." },
  ];
  // Total completed contracts needed to REACH each rank (cumulative):
  // Rusty 0 -> Iron 5 -> Steel 10 -> Mythril 30 -> Dragonbone 100 -> Oblivion 200 -> Dawnstone 300.
  const RANK_NEED = [0, 5, 10, 30, 100, 200, 300];

  const GUILD_KEYS = {
    guildhall: 1, khan_hall: 1, terrace_hall: 1, ice_hall: 1,
    mead_hall: 1, great_hall: 1, bull_hall: 1, moss_hall: 1,
    wight_throne: 1, kobold_nook: 1, alpha_mound: 1, matriarch_perch: 1,
    orc_hall: 1, tavern_hall: 1,
  };
  function isGuildhallKey(ck) { return !!GUILD_KEYS[ck]; }
  function isGuildBuilding(b) { try { return b && isGuildhallKey(b.classKey); } catch (e) { return false; } }

  // Biome pools mirrored from Game.pickWildKind (day pools; night adds undead
  // but the ground is the same). Used to point culls at real habitat.
  const BIOME_POOLS = {
    lake: ["slime", "bat", "kappa", "siren", "nokk", "sobek_spawn", "tide_turtle", "kelpie", "mire_lurker"],
    forest: ["slime", "goblin", "wolf", "mushroom", "bat", "bandit", "kobold", "satyr", "tanuki", "redcap", "centaur_foal", "fenrir_pup", "kitsune_trickster", "puca", "lindworm", "troll_whelp", "leshy", "goblin_shaman", "wild_horse", "burrow_mole", "giant_tarantula"],
    dark_forest: ["bat", "wolf", "leshy", "naga", "striga", "draugr", "banshee", "gloomspinner", "umbral_stag", "puca", "tanuki", "troll_whelp", "giant_tarantula"],
    desert: ["bat", "cultist", "bandit", "outlaw", "anubite", "scarab_swarm", "mummy", "khepri_beetle", "sphinx_cub", "lamassu_cub", "sandmaw", "tomb_scorpion", "siege_ant"],
    tundra: ["bat", "rime_wolf", "shiver_owl", "yuki_onna", "troll_whelp", "draugr", "fenrir_pup", "yeti"],
    mountain: ["bat", "cultist", "outlaw", "harpy", "cyclops_whelp", "stymphalian", "tengu_crow", "valkyrie_renegade", "troll_whelp", "wyvern_fledgling", "yeti", "peak_dragon"],
    volcano: ["cultist", "bat", "murderer", "oni_imp", "chimera_cub", "sobek_spawn", "phoenix", "cinder_steed", "magma_tortoise", "magma_eel", "cinder_maw", "peak_dragon"],
    frostcrown: ["bat", "rime_wolf", "shiver_owl", "yuki_onna", "troll_whelp", "draugr", "fenrir_pup", "yeti", "frostwyrm"],
    blightmire: ["bat", "mire_lurker", "naga", "striga", "leshy", "draugr", "hydra_spawn", "giant_tarantula", "mire_hydra"],
    stormcrag: ["bat", "harpy", "stymphalian", "tengu_crow", "valkyrie_renegade", "cyclops_whelp", "shiver_owl", "wyvern_fledgling", "tempest_roc"],
    crystal_scar: ["bat", "cultist", "kobold_shaman", "gloomspinner", "tomb_scorpion", "siege_ant", "puca", "khepri_beetle", "prism_colossus"],
    umbral_waste: ["bat", "wraith", "banshee", "dullahan_herald", "striga", "utukku", "gloomspinner", "umbral_stag", "umbral_wyrm"],
    sea: ["kelpie", "siren", "kappa", "nokk", "coral_crab", "bat", "tide_turtle", "tidecaller", "wreck_eel"],
    ocean: ["siren", "kelpie", "abyss_serpent", "coral_crab", "nokk", "sobek_spawn", "deepmaw", "tidecaller", "tide_turtle", "wreck_eel"],
    wild: ["slime", "goblin", "bat", "bandit", "outlaw", "kobold", "redcap", "puca", "fenrir_pup", "tanuki", "rakshasa_cub", "anubite", "burrow_mole", "hive_hornet", "siege_ant"],
    plains: ["slime", "goblin", "bat", "centaur_foal", "satyr", "redcap", "kobold", "wild_horse", "tanuki", "burrow_mole", "siege_ant"],
  };
  // night risers share the same grounds
  const NIGHT_EXTRA = {
    plains: ["skeleton", "dullahan_herald", "banshee"],
    desert: ["skeleton", "mummy", "utukku"],
    tundra: ["skeleton", "wraith", "striga"],
    mountain: ["skeleton", "wraith", "draugr", "striga"],
    volcano: ["skeleton", "wraith", "utukku"],
    frostcrown: ["skeleton", "wraith", "striga"],
    blightmire: ["skeleton", "jiangshi", "gasha_skull"],
    stormcrag: ["skeleton", "wraith", "banshee"],
    crystal_scar: ["skeleton", "utukku", "gasha_skull"],
    umbral_waste: ["skeleton", "jiangshi", "wraith"],
    wild: ["skeleton", "draugr", "striga", "jiangshi", "gasha_skull"],
    forest: ["skeleton", "draugr", "banshee", "striga", "naga"],
    dark_forest: ["skeleton", "wraith", "jiangshi", "gasha_skull"],
    lake: ["skeleton", "rusalka", "vodyanoy"],
    sea: ["skeleton", "rusalka", "vodyanoy"],
    ocean: ["rusalka", "vodyanoy", "wraith"],
  };
  const MOB_BIOMES = {};
  try {
    for (const [b, pool] of Object.entries(BIOME_POOLS)) {
      for (const k of pool) { (MOB_BIOMES[k] = MOB_BIOMES[k] || []).push(b); }
      for (const k of (NIGHT_EXTRA[b] || [])) {
        const arr = (MOB_BIOMES[k] = MOB_BIOMES[k] || []);
        if (!arr.includes(b)) arr.push(b);
      }
    }
    // a few cross-listed haunts that only rise at night elsewhere
    const extraHaunt = {
      banshee: ["dark_forest", "umbral_waste", "plains", "stormcrag", "forest"],
      wraith: ["umbral_waste", "tundra", "mountain", "volcano", "frostcrown", "ocean"],
      skeleton: ["plains", "wild", "forest", "desert", "tundra", "mountain"],
      draugr: ["tundra", "frostcrown", "mountain", "wild", "forest", "blightmire"],
      mummy: ["desert"],
      utukku: ["desert", "volcano", "crystal_scar", "umbral_waste"],
      striga: ["dark_forest", "forest", "tundra", "mountain", "wild", "umbral_waste", "blightmire"],
    };
    for (const [k, bs] of Object.entries(extraHaunt)) {
      const arr = (MOB_BIOMES[k] = MOB_BIOMES[k] || []);
      for (const b of bs) if (!arr.includes(b)) arr.push(b);
    }
  } catch (e) {}

  const APEX_KINDS = ["peak_dragon", "frostwyrm", "mire_hydra", "tempest_roc", "prism_colossus", "umbral_wyrm"];
  const APEX_BIOME = { peak_dragon: ["mountain", "volcano"], frostwyrm: ["frostcrown"], mire_hydra: ["blightmire"], tempest_roc: ["stormcrag"], prism_colossus: ["crystal_scar"], umbral_wyrm: ["umbral_waste"] };
  const APEX_AURA_LABEL = { peak_dragon: "❄️ hailstorm lair", frostwyrm: "❄️ whiteout lair", mire_hydra: "☠️ miasma lair", tempest_roc: "⛈️ stormwall lair", prism_colossus: "✨ soul-glare lair", umbral_wyrm: "🌑 voidchill lair" };

  // rank gating: minRank per target. Peak-dragon-tier at Dragonbone (4),
  // hell fiends only at Oblivion (5).
  // hell fiends only at Oblivion (5); Dawnstone (6) is the heaven-boss rank.
  // Ranks: 0 Rusty, 1 Iron, 2 Steel, 3 Mythril, 4 Dragonbone, 5 Oblivion, 6 Dawnstone.
  const SLAY_MIN_RANK = {
    slime: 0, bat: 0, goblin: 0, wolf: 0, mushroom: 0, kobold: 0, bandit: 0, tanuki: 0, redcap: 0, satyr: 0, burrow_mole: 0,
    skeleton: 1, anubite: 1, scarab_swarm: 1, kappa: 1, fenrir_pup: 1, puca: 1, centaur_foal: 0, wild_horse: 0, rakshasa_cub: 1, hive_hornet: 1, giant_tarantula: 1,
    cultist: 2, mummy: 2, outlaw: 2, harpy: 2, rime_wolf: 2, shiver_owl: 2, sandmaw: 2, leshy: 2, draugr: 2, kelpie: 1, nokk: 2, sobek_spawn: 2, coral_crab: 2, siren: 2, goblin_shaman: 2, troll_whelp: 2, kobold_shaman: 2,
    wraith: 2, striga: 2, naga: 2, mire_lurker: 2, gloomspinner: 2, banshee: 2, yeti: 2, stymphalian: 2, tengu_crow: 2, cyclops_whelp: 2, sphinx_cub: 2, lamassu_cub: 2, lindworm: 2, tidecaller: 2, wreck_eel: 2, dystopia: 2,
    dullahan_herald: 3, utukku: 3, gasha_skull: 3, jiangshi: 3, wyvern_fledgling: 3, hydra_spawn: 3, valkyrie_renegade: 3, oni_imp: 3, chimera_cub: 3, cinder_steed: 3, magma_tortoise: 3, magma_eel: 3, cinder_maw: 3, deepmaw: 3, abyss_serpent: 3, phoenix: 3, kitsune_trickster: 3, murderer: 3, khepri_beetle: 3, tomb_scorpion: 3, siege_ant: 3, umbral_stag: 3, yuki_onna: 2,
    peak_dragon: 4, frostwyrm: 4, mire_hydra: 4, tempest_roc: 4, prism_colossus: 4, umbral_wyrm: 4, lesser_wyvern: 3, velociraptor: 3,
    cinder_imp: 5, gore_hound: 5, obsidian_shard: 5, marrow_eater: 5, flesh_mound: 5, succubus: 5, infernal: 5, doom_lord: 5, hell_hound: 5, hell_beast: 5, ash_mother: 5, bleed_mother: 5, marrow_mage: 5, obsidian_golem: 5,
  };
  const REGULAR_SLAY = Object.keys(SLAY_MIN_RANK).filter(k => k !== "dystopia");
  const INFEST_LOW = ["bat", "bat", "bat", "slime", "mushroom", "goblin"];
  const HAUNT_HIGH = ["banshee", "banshee", "wraith", "dullahan_herald", "striga", "utukku", "gasha_skull"];
  const REGULAR_FETCH = {
    0: ["herb", "wood", "stone", "clay", "wolf_hide", "torch"],
    1: ["sage_herb", "iron_ore"],
    2: ["cinder_herb", "calm_herb", "bright_herb", "silver_ore", "rime_crystal", "storm_feather"],
    3: ["ember_core", "tide_pearl", "holy_bead"],
    // rank 4 keeps unicorn hair only: dragon bone/horn + yggdrasil are
    // floor-11+ delve finds now — no overworld ground could honestly
    // promise them, so they never post (same rule as mythril_ore below).
    4: ["unicorn_hair"],
  };
  // Where the goods come from. mobs: habitat ground + restocked source beasts
  // (corpses raided with E); biomes: gather/chop ground (herbs/wood are
  // everywhere, the marker points at the right biome); market: buy it.
  // mythril_ore is deliberately absent — it only surfaces in deep delve
  // chests, so no overworld ground could honestly promise it.
  const FETCH_SOURCE = {
    herb:             { biomes: ["wild", "plains", "forest"], hint: "🌿 Gather from flowers / tall grass (E)" },
    sage_herb:        { biomes: ["forest", "plains", "wild"], hint: "🌿 Gather from flowers / tall grass (E)" },
    bright_herb:      { biomes: ["desert", "lake"], hint: "🌿 Gather from flowers / tall grass (E) — sand or shore" },
    cinder_herb:      { biomes: ["volcano"], hint: "🌿 Gather from flowers / tall grass (E) — volcanic ground" },
    calm_herb:        { biomes: ["wild"], minR: 100, hint: "🌿 Gather from flowers / tall grass (E) — deep wilds" },
    wood:             { biomes: ["forest"], hint: "🪓 Chop trees for wood" },
    stone:            { mobs: ["goblin", "kobold"], hint: "⚔️ Goblinoids carry stone — or buy it at any market" },
    clay:             { market: true, hint: "🪙 Markets stock river clay (unlimited)" },
    wolf_hide:        { mobs: ["wolf", "goblin"], hint: "🐺 Raid beast corpses (E) for hides" },
    torch:            { biomes: ["forest"], hint: "🪓 Chop wood and whittle torches — or buy them at any market" },
    iron_ore:         { mobs: ["goblin", "kobold", "bandit"], hint: "⚔️ Delvers and goblinoids carry raw ore" },
    silver_ore:       { mobs: ["skeleton", "draugr", "mummy"], hint: "⚔️ The undead hoard pale silver — raid corpses (E)" },
    rime_crystal:     { mobs: ["yeti", "rime_wolf", "shiver_owl"], hint: "❄️ Winter hunters shed rime — raid corpses (E)" },
    storm_feather:    { mobs: ["harpy", "tengu_crow", "stymphalian"], hint: "⛈️ Sky hunters drop storm feathers — raid corpses (E)" },
    ember_core:       { mobs: ["phoenix", "chimera_cub", "magma_eel"], hint: "🌋 Volcano apexes carry embers — raid corpses (E)" },
    tide_pearl:       { mobs: ["kelpie", "kappa", "nokk"], hint: "🌊 Deep-water hunters carry tide pearls — raid corpses (E)" },
    holy_bead:        { mobs: ["skeleton", "draugr", "banshee", "wraith"], hint: "📿 Crypt undead carry blessed beads — raid corpses (E)" },
    dragon_bone:      { mobs: ["peak_dragon", "lesser_wyvern", "wyvern_fledgling", "lindworm"], hint: "🐲 Only dragons carry bone — raid the kill (E)" },
    dragon_horn:      { mobs: ["peak_dragon", "lesser_wyvern", "wyvern_fledgling", "lindworm"], hint: "🐲 Only dragons carry horn — raid the kill (E)" },
    unicorn_hair:     { mobs: ["kitsune_trickster", "puca", "gloomspinner"], hint: "🦄 The vale's shyest magic sheds it — raid corpses (E)" },
    yggdrasil_branch: { mobs: ["leshy", "satyr", "tanuki", "puca"], hint: "🌳 Old-forest wardens carry the world-tree's kin (E)" },
  };
  function fetchPoolForRank(rank, p) {
    const out = [];
    for (let r = 0; r <= Math.max(0, Math.min(4, rank | 0)); r++) {
      for (const id of (REGULAR_FETCH[r] || [])) {
        // never post goods the hero is boss-gated from obtaining
        if (p) {
          try { if (window.Items && window.Items.matLocked && window.Items.matLocked(p, id)) continue; } catch (e) {}
        }
        out.push({ id, minRank: r });
      }
    }
    return out.length ? out : REGULAR_FETCH[0].map(id => ({ id, minRank: 0 }));
  }
  const FETCH_N = { herb: [3, 6], wood: [4, 8], stone: [4, 8], clay: [3, 6], wolf_hide: [2, 4], torch: [2, 4], sage_herb: [2, 5], cinder_herb: [2, 5], calm_herb: [2, 5], bright_herb: [2, 5], iron_ore: [2, 5], silver_ore: [2, 4], rime_crystal: [1, 3], storm_feather: [1, 3], mythril_ore: [1, 3], ember_core: [1, 2], tide_pearl: [1, 3], holy_bead: [1, 3], dragon_bone: [1, 2], dragon_horn: [1, 1], unicorn_hair: [1, 2], yggdrasil_branch: [1, 2] };

  const MOB_LABEL = (() => { try { return (window.Quests && window.Quests.MOB_LABEL) || null; } catch (e) { return null; } })() || {};

  function P() { try { return window.Game.G.player; } catch (e) { return null; } }
  function ensure(p) {
    p = p || P(); if (!p) return null;
    if (!p.guild || typeof p.guild !== "object") p.guild = { rank: 0, completed: 0, active: [], boards: {}, seq: 1 };
    const g = p.guild;
    if (!(g.rank >= 0)) g.rank = 0;
    if (!(g.completed >= 0)) g.completed = 0;
    if (!Array.isArray(g.active)) g.active = [];
    if (!g.boards || typeof g.boards !== "object") g.boards = {};
    if (!(g.seq >= 1)) g.seq = 1;
    if (!Array.isArray(g.commissions)) g.commissions = [];
    if (!g.claims || typeof g.claims !== "object") g.claims = {};
    try { g.rank = rankForCompleted(g.completed | 0); } catch (e) {}
    return g;
  }
  function save() { try { window.Game.saveGame(true); } catch (e) {} }

  function rankForCompleted(done) {
    let r = 0;
    for (let i = 0; i < RANK_NEED.length; i++) if ((done | 0) >= RANK_NEED[i]) r = i;
    return Math.max(0, Math.min(RANKS.length - 1, r));
  }
  function rankOf(p) { const g = ensure(p); return g ? (g.rank | 0) : 0; }
  function rankRec(idx) { return RANKS[Math.max(0, Math.min(RANKS.length - 1, idx | 0))] || RANKS[0]; }
  function nextNeed(done) {
    done = done | 0;
    for (let i = 0; i < RANK_NEED.length; i++) if (RANK_NEED[i] > done) return { rank: i, need: RANK_NEED[i] };
    return null;
  }
  function payoutMult(rankIdx) { return rankRec(rankIdx).mult || 1; }

  function hashStr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function itemName(id) {
    try { const it = window.Items.ITEMS[id]; if (it) return it.name; } catch (e) {}
    return id;
  }
  function mobName(kind, n) {
    const base = MOB_LABEL[kind] || labelOf(kind);
    if ((n | 0) <= 1) return "a " + base.replace(/s$/, "");
    return `${n} ${base}`;
  }
  function labelOf(kind) {
    try {
      const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      if (t && t.name) return t.name + "s";
    } catch (e) {}
    return kind + "s";
  }
  function biomeLabel(b) {
    const m = { forest: "Forest", dark_forest: "Dark Forest", desert: "Desert", tundra: "Tundra", mountain: "Mountains", volcano: "Volcano", frostcrown: "Frostcrown Glaciers", blightmire: "Blightmire Bogs", stormcrag: "Stormcrag Cliffs", crystal_scar: "Crystal Scars", umbral_waste: "Umbral Wastes", sea: "Sea", ocean: "Ocean", lake: "Lakeshore", wild: "Wilds", plains: "Plains" };
    return m[b] || b;
  }

  function severityMult(ref) {
    try {
      const mr = (ref && ref.minRank) | 0;
      let m = 1 + mr * 0.14;
      if (ref && ref.mobKind) m *= 1 + Math.min(2.5, mobXp(ref.mobKind) / 120);
      else if (ref && ref.itemId) m *= 1 + Math.min(2.0, itemBasePrice(ref.itemId) / 250);
      return m;
    } catch (e) { return 1; }
  }
  function rewardFor(p, need, kind, ref) {
    const lv = (p && p.lv) || 1;
    const rank = rankOf(p);
    const mult = payoutMult(rank);
    const size = Math.max(1, need | 0);
    const base = (150 + 85 * lv + 45 * size) * mult * (kind === "kill" ? 1.15 : kind === "clear" ? 1.25 : 1.0) * severityMult(ref || null);
    const jitter = 0.85 + Math.random() * 0.4;
    const gold = Math.max(40, Math.round(base * jitter / 5) * 5);
    const xp = Math.max(10, Math.round((22 + 13 * lv) * (1 + rank * 0.22) * (0.7 + size * 0.18) * (ref ? severityMult(ref) : 1) * 0.9 + 5));
    return { gold, xp };
  }

  // ---------- shared rotating boards ----------
  function boardIdFor(building) {
    try { if (building && building.id) return String(building.id); } catch (e) {}
    return "guild_default";
  }
  function boardNameFor(building) {
    try { if (building && building.title) return String(building.title); } catch (e) {}
    return "Guildhall";
  }
  function epochNow() { return Math.floor(Date.now() / ROTATE_MS); }
  function msToRotate() { return ROTATE_MS - (Date.now() % ROTATE_MS); }

  function biomesForMob(kind) {
    if (APEX_BIOME[kind]) return APEX_BIOME[kind].slice();
    const arr = MOB_BIOMES[kind];
    if (arr && arr.length) return arr.slice();
    return ["wild", "plains", "forest"];
  }
  function dirLabel(dx, dy) {
    const dirs = [[0, -1, "north"], [1, -1, "north-east"], [1, 0, "east"], [1, 1, "south-east"], [0, 1, "south"], [-1, 1, "south-west"], [-1, 0, "west"], [-1, -1, "north-west"]];
    let best = "east", bd = 1e9;
    const a = Math.atan2(dy, dx);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8 * 0 + (i === 0 ? Math.PI / 2 : 0);
      void ang;
    }
    // simple octant
    const ang2 = Math.atan2(dy, dx);
    const oct = Math.round(ang2 / (Math.PI / 4));
    const names = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"];
    const idx = ((oct % 8) + 8) % 8;
    return names[idx] || "east";
  }

  // Find a real hunting ground for mobKind near (px,py): nearest tile whose
  // biome lists the kind. Apex kinds demand far highlands; live ancients win
  // when one roosts nearby (true lair, aura and all).
  function findHuntingGround(mobKind, px, py) {
    try {
      // live ancient first: point at the real beast
      if (APEX_KINDS.includes(mobKind)) {
        try {
          const G = window.Game && window.Game.G;
          if (G && Array.isArray(G.mobs)) {
            let best = null, bd = 1e9;
            for (const m of G.mobs) {
              if (!m || m.kind !== mobKind || !(m.hp > 0)) continue;
              const mx = (m.x != null ? m.x : m.gx), my = (m.y != null ? m.y : m.gy);
              if (!isFinite(mx) || !isFinite(my)) continue;
              const d = Math.hypot(mx - px, my - py);
              if (d < bd) { bd = d; best = m; }
            }
            if (best && bd < 900) {
              const mx = (best.x != null ? best.x : best.gx), my = (best.y != null ? best.y : best.gy);
              let biome = null;
              try { biome = window.World.biomeAt(Math.round(mx), Math.round(my)); } catch (e) {}
              return { biome: biome || (APEX_BIOME[mobKind] || ["mountain"])[0], gx: Math.round(mx), gy: Math.round(my), dist: Math.round(bd), live: true };
            }
          }
        } catch (e) {}
      }
      const wants = biomesForMob(mobKind);
      const isApex = APEX_KINDS.includes(mobKind);
      const radii = isApex ? [230, 300, 400, 520] : [36, 70, 110, 160, 230, 320];
      for (const r of radii) {
        for (let a = 0; a < 12; a++) {
          const th = (a / 12) * Math.PI * 2 + (r % 7) * 0.13;
          const gx = Math.round(px + Math.cos(th) * r), gy = Math.round(py + Math.sin(th) * r);
          let b = null;
          try { b = window.World.biomeAt(gx, gy); } catch (e) { continue; }
          if (!b || b === "town") continue;
          if (wants.includes(b)) {
            // human foes keep their distance gates
            try {
              if ((mobKind === "bandit" && window.World.distOrigin(gx, gy) < 60) ||
                  (mobKind === "outlaw" && window.World.distOrigin(gx, gy) < 100) ||
                  (mobKind === "murderer" && window.World.distOrigin(gx, gy) < 140)) continue;
            } catch (e) {}
            return { biome: b, gx, gy, dist: Math.round(Math.hypot(gx - px, gy - py)), live: false };
          }
        }
      }
      // fallback: name the habitat even if the spiral missed it
      const fb = wants[0] || "wild";
      const gx = Math.round(px + 90), gy = Math.round(py - 60);
      return { biome: fb, gx, gy, dist: Math.round(Math.hypot(gx - px, gy - py)), live: false };
    } catch (e) {
      return { biome: "wild", gx: Math.round(px + 80), gy: Math.round(py), dist: 80, live: false };
    }
  }

  // Gathering ground for a fetch item: source-mob habitat (shared with the
  // kill pins, live ancients included) or a matching gather biome. Market
  // goods (clay) and unknown items get no ground — buy/craft those.
  function findGatherGround(biomes, px, py, minR) {
    try {
      minR = minR || 0;
      const radii = [36, 70, 110, 160, 230, 320];
      for (const r of radii) {
        if (r < minR) continue;
        for (let a = 0; a < 12; a++) {
          const th = (a / 12) * Math.PI * 2 + (r % 7) * 0.13;
          const gx = Math.round(px + Math.cos(th) * r), gy = Math.round(py + Math.sin(th) * r);
          let b = null;
          try { b = window.World.biomeAt(gx, gy); } catch (e) { continue; }
          if (!b || b === "town") continue;
          if ((biomes || []).includes(b)) {
            return { biome: b, gx, gy, dist: Math.round(Math.hypot(gx - px, gy - py)), r: TARGET_RADIUS, live: false };
          }
        }
      }
      const fb = (biomes && biomes[0]) || "wild";
      return { biome: fb, gx: Math.round(px + 90), gy: Math.round(py - 60), dist: 108, r: TARGET_RADIUS, live: false };
    } catch (e) {
      return { biome: "wild", gx: Math.round(px + 80), gy: Math.round(py), dist: 80, r: TARGET_RADIUS, live: false };
    }
  }
  function groundForFetchItem(p, itemId, px, py) {
    try {
      const src = FETCH_SOURCE[itemId];
      if (!src) return { target: null, fetchMob: null, srcHint: "" };
      if (src.market) return { target: null, fetchMob: null, srcHint: src.hint };
      if (src.mobs && src.mobs.length) {
        const mobKind = src.mobs[0];
        const ground = findHuntingGround(mobKind, px, py);
        return {
          target: { biome: ground.biome, gx: ground.gx, gy: ground.gy, dist: ground.dist, r: TARGET_RADIUS, live: !!ground.live },
          fetchMob: mobKind, srcHint: src.hint,
        };
      }
      const ground = findGatherGround(src.biomes || ["wild"], px, py, src.minR || 0);
      return { target: ground, fetchMob: null, srcHint: src.hint };
    } catch (e) {
      return { target: null, fetchMob: null, srcHint: "" };
    }
  }
  const HOUSE_KEYS = { cottage: 1, farmhouse: 1, timber_house: 1, townhouse: 1, manor: 1, canal_house: 1, machiya: 1, adobe_house: 1, ger: 1, pueblo_house: 1, snow_cottage: 1, dockhouse: 1, merchant_villa: 1, noble_villa: 1 };
  function isHouseKey(ck) { return !!HOUSE_KEYS[ck]; }
  function housesNear(px, py, maxD) {
    const out = [];
    try {
      maxD = maxD || 140;
      const seen = new Set();
      const consider = (b) => {
        if (!b || !isHouseKey(b.classKey)) return;
        try {
          if (window.Buildings.buildingCollapsed && window.Buildings.buildingCollapsed(b)) return;
        } catch (e) {}
        const cx = b.x0 + b.w / 2, cy = b.y0 + b.h / 2;
        const d = Math.hypot(cx - px, cy - py);
        if (d > maxD) return;
        const key = b.id || (b.x0 + "," + b.y0);
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ b, cx, cy, d });
      };
      const W = window.World, B = window.Buildings;
      if (!W || !B) return out;
      try { const surfD = (W && W.getDim && W.getDim() === "surf"); if (surfD && Math.abs(px) < 40 && Math.abs(py) < 40) for (const b of B.originBuildings()) consider(b); } catch (e) {}
      let s0 = null;
      try { s0 = W.settlementAt(Math.floor(px), Math.floor(py)); } catch (e) {}
      if (s0) { try { for (const b of B.settlementBuildings(s0)) consider(b); } catch (e) {} }
      for (let dy = -48; dy <= 48 && out.length < 24; dy += 24) for (let dx = -48; dx <= 48 && out.length < 24; dx += 24) {
        if (!dx && !dy) continue;
        let s2 = null;
        try { s2 = W.settlementAt(Math.floor(px) + dx, Math.floor(py) + dy); } catch (e) { continue; }
        if (!s2) continue;
        if (s0 && s2.cx === s0.cx && s2.cy === s0.cy) continue;
        try { for (const b of B.settlementBuildings(s2)) consider(b); } catch (e) {}
      }
      out.sort((a, b2) => a.d - b2.d);
    } catch (e) {}
    return out;
  }

  const GIVERS = ["Guildmaster Ysolde", "Contract-Clerk Bram", "Bounty-keeper Sella", "Warden Orik", "Quartermaster Fen", "Charter-scribe Liora"];

  function makeDeterministicOffers(boardId, epoch, px, py, p) {
    const R = mulberry(hashStr(boardId + ":" + epoch));
    const offers = [];
    const pick = (arr) => arr[(R() * arr.length) | 0];
    const giver = () => GIVERS[(R() * GIVERS.length) | 0];
    const houseOf = (mobKind, need) => {
      const hs = housesNear(px, py, 140);
      if (!hs.length) return null;
      const h = hs[(R() * Math.min(6, hs.length)) | 0] || hs[0];
      const dir = dirLabel(h.cx - px, h.cy - py);
      const hName = (h.b && h.b.title) || "house";
      const haunt = HAUNT_HIGH.includes(mobKind);
      return { mobKind, house: h, dir, hName, haunt, need };
    };
    for (let i = 0; i < BOARD_POOL; i++) {
      const uid = `${boardId}@${epoch}:${i}`;
      if (i === 0) {
        // guaranteed vermin clearing (visible at low ranks)
        const mobKind = pick(INFEST_LOW);
        const need = Math.max(3, Math.min(8, Math.round(4 + R() * 3)));
        const hh = houseOf(mobKind, need);
        if (hh) {
          const t = { gx: Math.round(hh.house.cx), gy: Math.round(hh.house.cy), dist: Math.round(hh.house.d), r: HOUSE_RADIUS, houseTitle: hh.hName, houseId: (hh.house.b && hh.house.b.id) || null };
          offers.push({ uid, kind: "clear", title: `Vermin: ${hh.hName}`, desc: `${giver()} reports an infestation — ${mobName(mobKind, need)} in the ${hh.hName.toLowerCase()} ${hh.dir} (~${Math.round(hh.house.d)} tiles). Clear them OUT OF THAT HOUSE; kills elsewhere don't count.`, need, mobKind, minRank: 0, target: t, boardId, epoch, postedAt: Date.now() });
          continue;
        }
      }
      if (i === 1) {
        // guaranteed haunting (visible at Steel+ ranks)
        const mobKind = pick(HAUNT_HIGH);
        const need = Math.max(2, Math.min(6, Math.round(2 + R() * 3)));
        const hh = houseOf(mobKind, need);
        if (hh) {
          const t = { gx: Math.round(hh.house.cx), gy: Math.round(hh.house.cy), dist: Math.round(hh.house.d), r: HOUSE_RADIUS, houseTitle: hh.hName, houseId: (hh.house.b && hh.house.b.id) || null };
          offers.push({ uid, kind: "clear", title: `Haunt: ${hh.hName}`, desc: `${giver()} reports a haunting — ${mobName(mobKind, need)} in the ${hh.hName.toLowerCase()} ${hh.dir} (~${Math.round(hh.house.d)} tiles). Clear them OUT OF THAT HOUSE; kills elsewhere don't count.`, need, mobKind, minRank: 2, target: t, boardId, epoch, postedAt: Date.now() });
          continue;
        }
      }
      if (i === BOARD_POOL - 1) {
        // apex pin: always present in the pool, only visible at Dragonbone rank
        const kind = pick(APEX_KINDS);
        const ground = findHuntingGround(kind, px, py);
        const dir = dirLabel(ground.gx - px, ground.gy - py);
        const aura = ` Watch for its ${APEX_AURA_LABEL[kind] || "lair"} — the weather itself warns you.`;
        const liveBit = ground.live ? " Scouts swear the beast is denning there right now." : "";
        offers.push({ uid, kind: "kill", title: `Slay ${labelOf(kind).replace(/s$/, "")} — APEX`, desc: `${giver()} wants ${mobName(kind, 1)} culled in the ${biomeLabel(ground.biome)} ${dir} (~${ground.dist} tiles). Slay it NEAR those grounds — far kills don't count.${aura}${liveBit} Report to any guild Counter when done.`, need: 1, mobKind: kind, minRank: 4, target: { biome: ground.biome, gx: ground.gx, gy: ground.gy, dist: ground.dist, r: TARGET_RADIUS, live: !!ground.live }, boardId, epoch, postedAt: Date.now() });
        continue;
      }
      const roll = R();
      if (roll < 0.44) {
        // kill: rank-weighted mob
        const tierRoll = R();
        let pool = REGULAR_SLAY.filter(k => (SLAY_MIN_RANK[k] || 0) <= 2);
        if (tierRoll > 0.92) pool = REGULAR_SLAY.filter(k => (SLAY_MIN_RANK[k] || 0) >= 3);
        else if (tierRoll > 0.75) pool = REGULAR_SLAY.filter(k => (SLAY_MIN_RANK[k] || 0) >= 2);
        else if (tierRoll > 0.5) pool = REGULAR_SLAY.filter(k => (SLAY_MIN_RANK[k] || 0) >= 1);
        if (!pool.length) pool = REGULAR_SLAY;
        const kind = pick(pool);
        const minRank = SLAY_MIN_RANK[kind] || 0;
        const apex = APEX_KINDS.includes(kind);
        const need = apex ? 1 : Math.max(2, Math.min(10, Math.round(3 + R() * 3 + minRank * 0.9)));
        const ground = findHuntingGround(kind, px, py);
        const dir = dirLabel(ground.gx - px, ground.gy - py);
        const aura = apex ? ` Watch for its ${APEX_AURA_LABEL[kind] || "lair"} — the weather itself warns you.` : "";
        const liveBit = ground.live ? " Scouts swear the beast is denning there right now." : "";
        const title = apex ? `Slay ${labelOf(kind).replace(/s$/, "")} — APEX` : `Cull ${labelOf(kind)}`;
        const desc = `${giver()} wants ${mobName(kind, need)} culled in the ${biomeLabel(ground.biome)} ${dir} (~${ground.dist} tiles). Slay them NEAR those grounds — far kills don't count.${aura}${liveBit} Report to any guild Counter when done.`;
        offers.push({ uid, kind: "kill", title, desc, need, mobKind: kind, minRank, target: { biome: ground.biome, gx: ground.gx, gy: ground.gy, dist: ground.dist, r: TARGET_RADIUS, live: !!ground.live }, boardId, epoch, postedAt: Date.now() });
      } else if (roll < 0.72) {
        // fetch — pools skip boss-gated goods the hero can't obtain yet, and
        // every posting names its gathering grounds (habitat or biome)
        // maxTier 0 Rusty .. 4 Dragonbone
        const rankRoll = R();
        const maxTier = rankRoll > 0.92 ? 4 : rankRoll > 0.78 ? 3 : rankRoll > 0.6 ? 2 : rankRoll > 0.35 ? 1 : 0;
        const pool = fetchPoolForRank(maxTier, p);
        const f = pick(pool);
        const nn = FETCH_N[f.id] || [2, 5];
        const need = Math.max(nn[0], Math.min(nn[1] + maxTier, Math.round(nn[0] + R() * (nn[1] - nn[0]) + maxTier * 0.4)));
        const title = `Fetch ${itemName(f.id).replace(/^[^ ]+ /, "")}`;
        const fg = groundForFetchItem(p, f.id, px, py);
        let desc = `${giver()} needs ${need}× ${itemName(f.id)}. Bring them in your pack to any guild Counter — the goods change hands there.`;
        if (fg.target) {
          const dir = dirLabel(fg.target.gx - px, fg.target.gy - py);
          desc += ` The ${biomeLabel(fg.target.biome)} ${dir} (~${fg.target.dist} tiles) should yield them — follow the 🏛️ marker.`;
        }
        offers.push({ uid, kind: "fetch", title, desc, need, itemId: f.id, minRank: f.minRank | 0, target: fg.target, fetchMob: fg.fetchMob, srcHint: fg.srcHint, boardId, epoch, postedAt: Date.now() });
      } else {
        // house clear: rank decides vermin vs haunts (Steel+ sees haunts)
        const haunt = R() < 0.45;
        const mobKind = haunt ? pick(HAUNT_HIGH) : pick(INFEST_LOW);
        const minRank = haunt ? 2 : 0;
        const need = haunt ? Math.max(2, Math.min(6, Math.round(2 + R() * 3))) : Math.max(3, Math.min(8, Math.round(4 + R() * 3)));
        const hs = housesNear(px, py, 140);
        if (!hs.length) {
          // no houses nearby: fall back to a kill posting
          const kind = pick(REGULAR_SLAY.filter(k => (SLAY_MIN_RANK[k] || 0) <= 1));
          const ground = findHuntingGround(kind, px, py);
          const dir = dirLabel(ground.gx - px, ground.gy - py);
          offers.push({ uid, kind: "kill", title: `Cull ${labelOf(kind)}`, desc: `${giver()} wants ${mobName(kind, need)} culled in the ${biomeLabel(ground.biome)} ${dir} (~${ground.dist} tiles). Slay them near those grounds.`, need, mobKind: kind, minRank: SLAY_MIN_RANK[kind] || 0, target: { biome: ground.biome, gx: ground.gx, gy: ground.gy, dist: ground.dist, r: TARGET_RADIUS }, boardId, epoch, postedAt: Date.now() });
          continue;
        }
        const h = pick(hs.slice(0, Math.min(6, hs.length)));
        const dir = dirLabel(h.cx - px, h.cy - py);
        const hName = (h.b && h.b.title) || "house";
        const verb = haunt ? "haunting" : "infestation";
        const title = haunt ? `Haunt: ${hName}` : `Vermin: ${hName}`;
        const desc = `${giver()} reports a ${verb} — ${mobName(mobKind, need)} in the ${hName.toLowerCase()} ${dir} (~${Math.round(h.d)} tiles). Clear them OUT OF THAT HOUSE; kills elsewhere don't count.`;
        offers.push({ uid, kind: "clear", title, desc, need, mobKind, minRank, target: { gx: Math.round(h.cx), gy: Math.round(h.cy), dist: Math.round(h.d), r: HOUSE_RADIUS, houseTitle: hName, houseId: (h.b && h.b.id) || null }, boardId, epoch, postedAt: Date.now() });
      }
    }
    return offers;
  }

  function hallOrigin(building, p) {
    try {
      if (building && isFinite(building.x0) && isFinite(building.y0)) {
        return { x: building.x0 + (building.w || 6) / 2, y: building.y0 + (building.h || 6) / 2 };
      }
    } catch (e) {}
    return { x: (p && isFinite(p.x)) ? p.x : 0, y: (p && isFinite(p.y)) ? p.y : 0 };
  }
  function boardOffers(p, building) {
    const g = ensure(p); if (!g) return [];
    const bid = boardIdFor(building);
    const epoch = epochNow();
    let rec = g.boards[bid];
    // shared-board origin: the hall itself, so every traveler sees the same
    // pins (and the same UIDs for exclusivity) in a given epoch
    const org = hallOrigin(building, p);
    const px = org.x, py = org.y;
    if (!rec || !Array.isArray(rec.offers) || rec.epoch !== epoch || rec.v !== 2) {
      rec = { offers: makeDeterministicOffers(bid, epoch, px, py, p), name: boardNameFor(building), epoch, v: 2, expiresAt: Date.now() + msToRotate() };
      // drop offers already claimed this epoch (MP exclusivity)
      try {
        const claimed = g.claims || {};
        rec.offers = rec.offers.filter(o => !claimed[o.uid]);
      } catch (e) {}
      g.boards[bid] = rec;
      try { save(); } catch (e) {}
    }
    rec.name = boardNameFor(building);
    // filter by rank for this viewer (high-tier horrors stay hidden down low;
    // houses split: vermin jobs for Rusty/Iron, haunt jobs for Steel+)
    const rank = rankOf(p);
    try {
      return rec.offers.filter(o => {
        if ((o.minRank | 0) > rank) return false;
        if (o.kind === "clear") {
          const haunt = HAUNT_HIGH.includes(o.mobKind);
          if (rank >= 2) return haunt;
          return !haunt;
        }
        return true;
      });
    } catch (e) { return rec.offers; }
  }

  // ---------- active quests ----------
  function active(p) { const g = ensure(p); return g ? g.active : []; }
  function get(p, gid) { try { return ensure(p).active.find(q => q && q.gid === gid) || null; } catch (e) { return null; } }

  function acceptOffer(p, building, uid) {
    p = p || P(); const g = ensure(p); if (!g) return { ok: false, msg: "No hero." };
    const bid = boardIdFor(building);
    const rec = g.boards[bid];
    if (!rec || !Array.isArray(rec.offers)) return { ok: false, msg: "No such posting." };
    const i = rec.offers.findIndex(o => o && o.uid === uid);
    if (i < 0) return { ok: false, msg: "That posting is gone." };
    if (g.active.length >= MAX_ACTIVE) return { ok: false, msg: `Your contract satchel is full (${MAX_ACTIVE}). Turn one in first.` };
    const o = rec.offers[i];
    const rank = rankOf(p);
    if ((o.minRank | 0) > rank) return { ok: false, msg: "That work is above your adventurer rank." };
    try {
      if (g.active.some(q => q && q.kind === o.kind && (o.kind === "kill" || o.kind === "clear" ? q.mobKind === o.mobKind : q.itemId === o.itemId)))
        return { ok: false, msg: "You already carry that contract." };
    } catch (e) {}
    rec.offers.splice(i, 1);
    try { g.claims[o.uid] = Date.now(); } catch (e) {}
    const reward = rewardFor(p, o.need, o.kind === "fetch" ? "fetch" : "kill", o);
    const q = {
      gid: "gc" + (g.seq++), kind: o.kind, title: o.title, desc: o.desc,
      need: o.need, have: 0, itemId: o.itemId || null, mobKind: o.mobKind || null,
      reward, boardId: bid, boardName: boardNameFor(building),
      target: o.target || null, fetchMob: o.fetchMob || null, srcHint: o.srcHint || "",
      minRank: o.minRank | 0,
      acceptedAt: Date.now(), status: "active", offerUid: o.uid,
    };
    g.active.push(q);
    if (q.kind === "clear") { try { spawnHouseInfestation(q); } catch (e) {} }
    // apex cull: do NOT seed a dragon elsewhere — the target already points at
    // real habitat (or a live ancient). Nothing to spawn.
    save();
    try { mpBroadcast({ t: "guildClaim", uid: o.uid, boardId: bid }); } catch (e) {}
    try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    return { ok: true, quest: q };
  }

  function spawnHouseInfestation(q) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !Array.isArray(G.mobs) || !q || !q.target) return 0;
      const cx = q.target.gx, cy = q.target.gy;
      let lv = 5;
      try { lv = window.Game.overworldLevelFor(cx, cy); } catch (e) { try { lv = (P() && P().lv) || 5; } catch (e2) {} }
      lv = Math.max(1, Math.min(60, Math.round(lv)));
      let n = 0;
      for (let i = 0; i < (q.need | 0); i++) {
        try {
          const m = window.Entities.makeMob(q.mobKind, lv, 60, 0);
          const ox = (Math.random() * 8 - 4), oy = (Math.random() * 8 - 4);
          m.x = cx + ox; m.y = cy + oy; m.homeX = m.x; m.homeY = m.y;
          m.hp = m.maxHp; m.mp = m.maxMp;
          m.questInfest = q.gid;
          G.mobs.push(m); n++;
        } catch (e) {}
      }
      return n;
    } catch (e) { return 0; }
  }

  function abandon(p, gid) {
    p = p || P(); const g = ensure(p); if (!g) return false;
    const i = g.active.findIndex(q => q && q.gid === gid);
    if (i < 0) return false;
    g.active.splice(i, 1);
    save();
    try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    return true;
  }

  function fetchHave(p, q) {
    try {
      if (!q || q.kind !== "fetch") return q.have | 0;
      const n = window.Items.countItem(p, q.itemId) | 0;
      return Math.min(q.need | 0, n);
    } catch (e) { return 0; }
  }
  function isReady(p, q) {
    if (!q) return false;
    if (q.kind === "fetch") return fetchHave(p, q) >= (q.need | 0);
    return (q.have | 0) >= (q.need | 0);
  }
  function nearTarget(q, x, y) {
    try {
      const t = q && q.target;
      if (!t || !isFinite(t.gx) || !isFinite(t.gy)) return true;
      const r = (q.kind === "clear" ? HOUSE_RADIUS : TARGET_RADIUS);
      const rr = isFinite(t.r) ? t.r : r;
      return Math.hypot(x - t.gx, y - t.gy) <= rr + 8;
    } catch (e) { return true; }
  }
  function progressText(p, q) {
    if (!q) return "";
    if (q.kind === "fetch") {
      const h = fetchHave(p, q);
      return `${itemName(q.itemId)} ${Math.min(h, q.need)}/${q.need} in pack`;
    }
    const base = `${mobName(q.mobKind, q.need)} — ${Math.min(q.have | 0, q.need | 0)}/${q.need | 0} slain`;
    const where = targetText(q);
    return where ? `${base} · ${where}` : base;
  }
  function targetText(q) {
    try {
      const t = q && q.target;
      if (!t) return "";
      const p = P();
      const px = (p && isFinite(p.x)) ? p.x : t.gx, py = (p && isFinite(p.y)) ? p.y : t.gy;
      const d = Math.round(Math.hypot(t.gx - px, t.gy - py));
      const dir = dirLabel(t.gx - px, t.gy - py);
      if (q.kind === "clear") return `at ${(t.houseTitle || "house")} ${dir} ~${d}t`;
      if (t.biome) return `in ${biomeLabel(t.biome)} ${dir} ~${d}t`;
      return `${dir} ~${d}t`;
    } catch (e) { return ""; }
  }

  // kill hook: only player-faction kills within the contract grounds count
  function onKill(src, tgt) {
    try {
      const p = P(); if (!p || !tgt) return;
      const g = ensure(p); if (!g || !g.active.length) return;
      if (!(tgt.xpReward != null || tgt.kind)) return;
      const srcIsFaction = (src === p) || !!(src && (src.inParty || src.isTame || src.isShadowClone));
      if (!srcIsFaction) return;
      const vx = (tgt.x != null ? tgt.x : tgt.gx), vy = (tgt.y != null ? tgt.y : tgt.gy);
      let changed = false;
      for (const q of g.active) {
        if (!q || q.status !== "active") continue;
        if (q.kind !== "kill" && q.kind !== "clear") continue;
        if ((q.have | 0) >= (q.need | 0)) { q.status = "turnin"; changed = true; continue; }
        // ecological substitutes (daylight goblins standing in for undead, etc.)
        // carry a questKind tag scoped to their contract via questGuild
        const kindOk = tgt.kind === q.mobKind ||
          (tgt.questKind != null && tgt.questKind === q.mobKind && tgt.questGuild === q.gid);
        if (kindOk) {
          if (q.target && isFinite(vx) && isFinite(vy) && !nearTarget(q, vx, vy)) {
            // out-of-grounds kill: nudge once in a while, never spam
            try {
              const now = Date.now();
              if (!q._farHintAt || now - q._farHintAt > 25000) {
                q._farHintAt = now;
                window.UI.toast(`🏛️ That ${tgt.kind} fell far from the contract grounds (${targetText(q)}) — no credit.`, 3500);
              }
            } catch (e) {}
            continue;
          }
          q.have = Math.min(q.need | 0, (q.have | 0) + 1);
          if (q.have >= q.need) q.status = "turnin";
          changed = true;
          try { window.UI.toast(`🏛️ ${q.title}: ${Math.min(q.have, q.need)}/${q.need} ${MOB_LABEL[q.mobKind] || q.mobKind}`, 2500); } catch (e) {}
        }
      }
      if (changed) {
        save();
        try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
        try { checkCommissionProgress(src, tgt); } catch (e) {}
      } else {
        try { checkCommissionProgress(src, tgt); } catch (e) {}
      }
    } catch (e) {}
  }

  function turnIn(p, gid) {
    p = p || P(); const g = ensure(p);
    if (!g) return { ok: false, msg: "No hero." };
    const i = g.active.findIndex(q => q && q.gid === gid);
    if (i < 0) {
      // maybe a commissioned active copy whose template already closed?
      return { ok: false, msg: "No such contract." };
    }
    const q = g.active[i];
    if (q.commissionId) return turnInCommission(p, q);
    if (q.kind === "fetch") {
      let have = 0;
      try { have = window.Items.countItem(p, q.itemId) | 0; } catch (e) { have = 0; }
      if (have < (q.need | 0)) return { ok: false, msg: `Need ${q.need}× ${itemName(q.itemId)} in your pack (${have}/${q.need}).` };
      try { window.Items.removeItem(p, q.itemId, q.need); } catch (e) { return { ok: false, msg: "The goods slip away." }; }
    } else {
      if ((q.have | 0) < (q.need | 0)) return { ok: false, msg: `Not done yet (${Math.min(q.have | 0, q.need | 0)}/${q.need}).` };
    }
    const r = q.reward || rewardFor(p, q.need, q.kind);
    try {
      p.gold = Math.max(0, Math.trunc(Number(p.gold)||0) + Math.max(0, Math.trunc(Number(r.gold)||0)));
      const res = window.Entities.gainXp(p, r.xp | 0);
      if (res && res.leveled) {
        try {
          window.UI.toast(`⬆️ Level ${p.lv}! +${res.statPoints || 0} stat pts — press C (character).`, 6000);
          if (window.UI.showQuestBanner) window.UI.showQuestBanner("🏛️", "Guild contract complete: " + q.title, `+${r.gold}g · +${r.xp} XP`);
          if (window.UI.showLevelUp) window.UI.showLevelUp(p.lv, res.statPoints, 0, res.newAbilities);
        } catch (e) {}
      }
    } catch (e) {}
    g.active.splice(i, 1);
    g.completed = (g.completed | 0) + 1;
    const before = g.rank | 0;
    const after = rankForCompleted(g.completed);
    g.rank = after;
    g.history = g.history || [];
    try {
      g.history.unshift({ title: q.title, kind: q.kind, gold: r.gold | 0, xp: r.xp | 0, at: Date.now() });
      if (g.history.length > 30) g.history.length = 30;
    } catch (e) {}
    save();
    let rankMsg = "";
    if (after > before) {
      const rec = rankRec(after);
      rankMsg = `Rank up! ${rec.name} adventurer — postings now pay x${rec.mult}.`;
      try { window.Sfx.level(); } catch (e) {}
    } else {
      try { window.Sfx.coin(); } catch (e) {}
    }
    try {
      window.UI.toast(`🏛️ Contract complete: ${q.title} — +${r.gold}g, +${r.xp} XP.${rankMsg}`, 6000);
      if (window.UI.showQuestBanner) window.UI.showQuestBanner("🏛️", "Guild contract complete: " + q.title, `+${r.gold}g · +${r.xp} XP${rankMsg}`);
      try { if (window.Game && window.Game.announceLoot) window.Game.announceLoot(`🏛️ ${q.title}`, r.gold | 0, []); } catch (e2) {}
      window.UI.updateHUD(); window.UI.updateHotbar();
      if (window.UI.renderGuild) window.UI.renderGuild();
    } catch (e) {}
    return { ok: true, reward: r, rankUp: after > before };
  }

  function rankProgress(p) {
    const g = ensure(p); if (!g) return null;
    const done = g.completed | 0, rank = g.rank | 0;
    const nx = nextNeed(done);
    return { rank, rec: rankRec(rank), done, next: nx };
  }

  // ---------- guildhall lookup ----------
  function guildNexusPos(b) {
    try {
      if (!b) return null;
      const f = (b.furniture || []).find(f => f && (f.kind === "longtable" || f.kind === "counter" || f.kind === "throne"));
      if (f) return { x: f.x + 0.5, y: f.y + 0.5 };
      const d = (b.doors || [])[0];
      if (d) return { x: d.x + 0.5, y: d.y + 0.5 };
      return { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
    } catch (e) { return null; }
  }
  function nearestGuild(px, py, maxD) {
    try {
      maxD = maxD == null ? 3.2 : maxD;
      let best = null, bd = 1e9;
      const consider = (b) => {
        if (!isGuildBuilding(b)) return;
        try { if (window.Buildings.buildingCollapsed(b)) return; } catch (e) {}
        const np = guildNexusPos(b);
        let d = 1e9;
        try { if (np) d = Math.min(d, Math.hypot(np.x - px, np.y - py)); } catch (e) {}
        try {
          const cx = Math.max(b.x0, Math.min(b.x1 + 0.99, px)), cy = Math.max(b.y0, Math.min(b.y1 + 0.99, py));
          d = Math.min(d, Math.hypot(cx - px, cy - py));
        } catch (e) {}
        if (d < bd) { bd = d; best = b; }
      };
      try {
        const W = window.World;
        if (Math.abs(px) < 40 && Math.abs(py) < 40 && window.Buildings.originBuildings && (window.World && window.World.getDim && window.World.getDim() === "surf")) for (const b of window.Buildings.originBuildings()) consider(b);
        const s = W && W.settlementAt ? W.settlementAt(Math.floor(px), Math.floor(py)) : null;
        if (s && window.Buildings.settlementBuildings) for (const b of window.Buildings.settlementBuildings(s)) consider(b);
        for (let dy = -48; dy <= 48; dy += 24) for (let dx = -48; dx <= 48; dx += 24) {
          if (!dx && !dy) continue;
          let s2 = null;
          try { s2 = W.settlementAt(Math.floor(px) + dx, Math.floor(py) + dy); } catch (e) {}
          if (s2 && (!s || s2.cx !== s.cx || s2.cy !== s.cy) && window.Buildings.settlementBuildings) for (const b of window.Buildings.settlementBuildings(s2)) consider(b);
          if (best && bd <= 2.2) break;
        }
      } catch (e) {}
      if (best && bd <= maxD) return { building: best, d: bd, nexus: guildNexusPos(best) };
      return null;
    } catch (e) { return null; }
  }

  // ================= COMMISSIONS =================
  function myHash() { try { return (window.MP && window.MP.M && window.MP.M.hash) || "local"; } catch (e) { return "local"; } }
  function myName() { try { const p = P(); return (p && p.name) || "Traveler"; } catch (e) { return "Traveler"; } }
  function commissions(p) { const g = ensure(p); return g ? g.commissions : []; }
  function openCommissions(p) { try { return commissions(p).filter(c => c && c.status === "open"); } catch (e) { return []; } }
  function doneCommissions(p) { try { return commissions(p).filter(c => c && c.status !== "open"); } catch (e) { return []; } }
  function findCommission(p, cid) { try { return ensure(p).commissions.find(c => c && c.cid === cid) || null; } catch (e) { return null; } }

  function mobXp(kind) { try { return ((window.CFG.MOB_TEMPLATES || {})[kind] || {}).xp | 0 || 20; } catch (e) { return 20; } }
  function itemBasePrice(id) {
    try { if (window.Trade && window.Trade.basePrice) return window.Trade.basePrice(id) | 0; } catch (e) {}
    try { const it = window.Items.ITEMS[id]; if (it && typeof it.price === "number") return it.price | 0; } catch (e) {}
    return 10;
  }
  function commissionCostKill(mobKind, mobLv, need) {
    const xp = mobXp(mobKind);
    const lv = Math.max(1, Math.min(70, mobLv | 0 || 1));
    const n = Math.max(1, Math.min(20, need | 0 || 1));
    const rankGate = SLAY_MIN_RANK[mobKind] || 0;
    const cost = Math.round((60 + xp * 2.4 * (1 + lv * 0.12)) * n * (1 + rankGate * 0.12));
    return Math.max(100, cost);
  }
  function commissionCostFetch(itemId, need) {
    const base = Math.max(1, itemBasePrice(itemId));
    const n = Math.max(1, Math.min(99, need | 0 || 1));
    return Math.max(80, Math.round(base * n * 2.2 + 50));
  }
  function commissionReward(cost) { return Math.max(30, Math.round(cost * (1 - COMM_FEE))); }

  function allItemIds() {
    try {
      const out = [];
      const items = window.Items.ITEMS || {};
      for (const [id, it] of Object.entries(items)) {
        if (!it || it.type === "quest") continue;
        if (it.slot === "trinket" && it.legendary) continue;
        out.push(id);
      }
      // keep the list tight: materials + consumables + ammo first
      const score = (id) => {
        try {
          const t = window.Items.ITEMS[id].type;
          if (t === "material") return 0;
          if (t === "consumable" || t === "ammo") return 1;
          if (t === "spellbook") return 3;
          return 2;
        } catch (e) { return 2; }
      };
      out.sort((a, b) => score(a) - score(b) || String(a).localeCompare(String(b)));
      return out.slice(0, 220);
    } catch (e) { return ["herb", "wood", "stone", "iron_ore", "potion"]; }
  }
  function allMobIds() {
    try {
      const kinds = Object.keys((window.CFG && window.CFG.MOB_TEMPLATES) || {});
      const bossSet = new Set((window.CFG && window.CFG.BOSS_KINDS) || []);
      const out = kinds.filter(k => !bossSet.has(k) && !/king|warlord|queen|lord|emperor|matriarch|sovereign|pharaoh|raja|maharaja|daimyo|stormlord|ninetails|broodmother|baba|leviathan|voidstalker|fenrir_alpha|hydra_|wyvern_matriarch|jotunn|troll_king|gnoll_alpha|bandit_warlord|kobold_king|orc_warchief|slime_sovereign|drowned|captain|boss$/.test(k));
      out.sort();
      // ensure the familiar + apex kinds are present even if filtered oddly
      for (const k of ["slime", "bat", "goblin", "wolf", "mushroom", "skeleton", "cultist", "wraith", "banshee", "peak_dragon"]) if (!out.includes(k)) out.push(k);
      return out;
    } catch (e) { return REGULAR_SLAY.slice(); }
  }

  function createCommission(p, spec) {
    p = p || P(); const g = ensure(p);
    if (!g) return { ok: false, msg: "No hero." };
    spec = spec || {};
    const kind = spec.kind === "fetch" ? "fetch" : "kill";
    let cost = 0, comm = null;
    const px = (p && isFinite(p.x)) ? p.x : 0, py = (p && isFinite(p.y)) ? p.y : 0;
    if (kind === "kill") {
      const mobKind = String(spec.mobKind || "goblin");
      if (!((window.CFG.MOB_TEMPLATES || {})[mobKind])) return { ok: false, msg: "Unknown beast." };
      const mobLv = Math.max(1, Math.min(70, spec.mobLv | 0 || Math.max(1, (p.lv | 0) || 1)));
      const need = Math.max(1, Math.min(20, spec.need | 0 || 3));
      cost = commissionCostKill(mobKind, mobLv, need);
      if ((p.gold | 0) < cost) return { ok: false, msg: `Posting that cull costs ${cost}g — you carry ${p.gold | 0}g.` };
      const ground = findHuntingGround(mobKind, px, py);
      comm = {
        cid: `${myHash()}:${Date.now().toString(36)}:${(g.seq++)}`, kind: "kill",
        title: `Cull ${mobName(mobKind, need)}`, mobKind, mobLv, need,
        target: { biome: ground.biome, gx: ground.gx, gy: ground.gy, dist: ground.dist, r: TARGET_RADIUS },
        cost, reward: { gold: commissionReward(cost), xp: Math.max(20, Math.round((20 + 10 * mobLv) * need * 0.6)) },
        commissioner: myName(), commHash: myHash(), createdAt: Date.now(), status: "open",
        accepts: [], collected: false,
      };
    } else {
      const itemId = String(spec.itemId || "herb");
      if (!((window.Items.ITEMS || {})[itemId])) return { ok: false, msg: "Unknown goods." };
      const need = Math.max(1, Math.min(99, spec.need | 0 || 5));
      cost = commissionCostFetch(itemId, need);
      if ((p.gold | 0) < cost) return { ok: false, msg: `Posting that fetch costs ${cost}g — you carry ${p.gold | 0}g.` };
      const fg = groundForFetchItem(p, itemId, px, py);
      comm = {
        cid: `${myHash()}:${Date.now().toString(36)}:${(g.seq++)}`, kind: "fetch",
        title: `Fetch ${itemName(itemId)}`, need,
        itemId, target: fg.target, fetchMob: fg.fetchMob, srcHint: fg.srcHint,
        cost, reward: { gold: commissionReward(cost), xp: Math.max(15, Math.round(need * 8 + itemBasePrice(itemId) * 0.2)) },
        commissioner: myName(), commHash: myHash(), createdAt: Date.now(), status: "open",
        accepts: [], collected: false,
      };
    }
    p.gold = Math.max(0, Math.trunc(Number(p.gold)||0) - Math.max(0, Math.trunc(Number(cost)||0)));
    g.commissions.unshift(comm);
    if (g.commissions.length > 60) g.commissions.length = 60;
    save();
    try { mpBroadcast({ t: "guildCommNew", comm }); } catch (e) {}
    try { window.UI.updateHUD(); } catch (e) {}
    try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    return { ok: true, comm };
  }

  function acceptCommission(p, cid) {
    p = p || P(); const g = ensure(p);
    if (!g) return { ok: false, msg: "No hero." };
    const c = findCommission(p, cid);
    if (!c) return { ok: false, msg: "That commission is gone." };
    if (c.status !== "open") return { ok: false, msg: "That commission is already settled." };
    if (g.active.length >= MAX_ACTIVE) return { ok: false, msg: `Your contract satchel is full (${MAX_ACTIVE}).` };
    if (g.active.some(q => q && q.commissionId === cid)) return { ok: false, msg: "You already carry that commission." };
    const q = {
      gid: "cc" + (g.seq++), kind: c.kind, title: c.title + " (commissioned)",
      desc: commissionDesc(c), need: c.need, have: 0,
      itemId: c.itemId || null, mobKind: c.mobKind || null, mobLv: c.mobLv || null,
      reward: { gold: c.reward.gold | 0, xp: c.reward.xp | 0 },
      boardId: "__commission", commissionId: c.cid,
      target: c.target || null, fetchMob: c.fetchMob || null, srcHint: c.srcHint || "",
      acceptedAt: Date.now(), status: "active",
    };
    g.active.push(q);
    try {
      c.accepts = Array.isArray(c.accepts) ? c.accepts : [];
      c.accepts.push({ by: myName(), hash: myHash(), at: Date.now() });
    } catch (e) {}
    save();
    try { mpBroadcast({ t: "guildCommAccept", cid, by: myName() }); } catch (e) {}
    try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    return { ok: true, quest: q };
  }
  function commissionDesc(c) {
    if (!c) return "";
    if (c.kind === "kill") {
      const t = c.target;
      const where = t ? ` in the ${biomeLabel(t.biome)} (~${t.dist} tiles)` : "";
      return `${c.commissioner} offers ${c.reward.gold}g for ${mobName(c.mobKind, c.need)} (lv~${c.mobLv})${where}. Slay them near those grounds; first turn-in wins.`;
    }
    return `${c.commissioner} offers ${c.reward.gold}g for ${c.need}× ${itemName(c.itemId)} delivered to any guild Counter; first turn-in wins. The goods go to ${c.commissioner}.${c.target ? ` ${biomeLabel(c.target.biome)} grounds (~${c.target.dist} tiles) should yield them — follow the 🏛️ marker.` : ""}${c.srcHint ? " " + c.srcHint : ""}`;
  }

  // commissioned kill progress shares the regional rule; fetch progress reads the pack
  function checkCommissionProgress(src, tgt) {
    try {
      const p = P(); if (!p || !tgt) return;
      const g = ensure(p); if (!g) return;
      const srcIsFaction = (src === p) || !!(src && (src.inParty || src.isTame || src.isShadowClone));
      // NPC/MP completions arrive via explicit turn-ins; here we only advance
      // the LOCAL hero's commissioned kill copies.
      if (!srcIsFaction) return;
      const vx = (tgt.x != null ? tgt.x : tgt.gx), vy = (tgt.y != null ? tgt.y : tgt.gy);
      let changed = false;
      for (const q of g.active) {
        if (!q || q.kind !== "kill" || !q.commissionId || q.status !== "active") continue;
        if ((q.have | 0) >= (q.need | 0)) { q.status = "turnin"; changed = true; continue; }
        const cKindOk = tgt.kind === q.mobKind ||
          (tgt.questKind != null && tgt.questKind === q.mobKind && tgt.questGuild === q.gid);
        if (cKindOk) {
          if (q.target && isFinite(vx) && isFinite(vy) && !nearTarget(q, vx, vy)) continue;
          q.have = Math.min(q.need | 0, (q.have | 0) + 1);
          if (q.have >= q.need) q.status = "turnin";
          changed = true;
        }
      }
      if (changed) { save(); try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {} }
    } catch (e) {}
  }

  function turnInCommission(p, q) {
    const g = ensure(p);
    const c = findCommission(p, q.commissionId);
    if (!c) return { ok: false, msg: "That commission is gone." };
    if (c.status !== "open") return { ok: false, msg: "Already settled — another hand was faster." };
    if (q.kind === "fetch") {
      let have = 0;
      try { have = window.Items.countItem(p, q.itemId) | 0; } catch (e) { have = 0; }
      if (have < (q.need | 0)) return { ok: false, msg: `Need ${q.need}× ${itemName(q.itemId)} in your pack (${have}/${q.need}).` };
      try { window.Items.removeItem(p, q.itemId, q.need); } catch (e) { return { ok: false, msg: "The goods slip away." }; }
      c.escrow = { itemId: q.itemId, n: q.need | 0 };
    } else {
      if ((q.have | 0) < (q.need | 0)) return { ok: false, msg: `Not done yet (${Math.min(q.have | 0, q.need | 0)}/${q.need}).` };
    }
    const r = q.reward || c.reward;
    try {
      p.gold = Math.max(0, Math.trunc(Number(p.gold)||0)) + Math.max(0, Math.trunc(Number(r.gold)||0));
      const res = window.Entities.gainXp(p, r.xp | 0);
      if (res && res.leveled) {
        try {
          window.UI.toast(`⬆️ Level ${p.lv}! +${res.statPoints || 0} stat pts — press C (character).`, 6000);
          if (window.UI.showLevelUp) window.UI.showLevelUp(p.lv, res.statPoints, 0, res.newAbilities);
        } catch (e) {}
      }
    } catch (e) {}
    // close the template: first finisher wins everywhere
    c.status = "done"; c.doneBy = myName(); c.doneAt = Date.now(); c.collected = false;
    // remove MY copy; other locals' copies invalidate at render/turn-in time
    try {
      const i = g.active.findIndex(x => x && x.gid === q.gid);
      if (i >= 0) g.active.splice(i, 1);
      // invalidate other local copies of the same commission
      for (let k = g.active.length - 1; k >= 0; k--) {
        if (g.active[k] && g.active[k].commissionId === c.cid) g.active.splice(k, 1);
      }
    } catch (e) {}
    // release NPC claimants
    try { releaseNpcClaims(c.cid); } catch (e) {}
    g.completed = (g.completed | 0) + 1;
    g.rank = rankForCompleted(g.completed);
    g.history = g.history || [];
    try { g.history.unshift({ title: c.title + " (commission)", kind: c.kind, gold: r.gold | 0, xp: r.xp | 0, at: Date.now() }); if (g.history.length > 30) g.history.length = 30; } catch (e) {}
    save();
    // the escrow rides along so the commissioner's machine can hand over the
    // fetched goods at any Counter (collectCommission) — otherwise cross-
    // machine fetch goods vanish from the finisher's pack into nothing.
    try { mpBroadcast({ t: "guildCommDone", cid: c.cid, doneBy: c.doneBy, escrow: c.escrow ? { itemId: c.escrow.itemId, n: c.escrow.n } : null }); } catch (e) {}
    try {
      window.UI.toast(`🏛️ Commission complete: ${c.title} — +${r.gold}g, +${r.xp} XP. First hand wins!`, 6000);
      if (window.UI.showQuestBanner) window.UI.showQuestBanner("🏛️", "Commission complete: " + c.title, `+${r.gold}g · +${r.xp} XP`);
      try { if (window.Game && window.Game.announceLoot) window.Game.announceLoot(`🏛️ ${c.title}`, r.gold | 0, []); } catch (e2) {}
      try { window.Sfx.coin(); } catch (e2) {}
      window.UI.updateHUD(); window.UI.updateHotbar();
      if (window.UI.renderGuild) window.UI.renderGuild();
    } catch (e) {}
    return { ok: true, reward: r };
  }

  function collectCommission(p, cid) {
    p = p || P(); const g = ensure(p);
    const c = findCommission(p, cid);
    if (!c) return { ok: false, msg: "No such commission." };
    if (c.status !== "done") return { ok: false, msg: "Not settled yet." };
    if (c.collected) return { ok: false, msg: "Already collected." };
    const mine = (c.commHash === myHash()) || (c.commissioner === myName());
    if (!mine) return { ok: false, msg: "Only the commissioner collects." };
    if (c.kind === "fetch" && c.escrow) {
      try { window.Items.addItem(p, c.escrow.itemId, c.escrow.n); } catch (e) { return { ok: false, msg: "Your pack can't hold it." }; }
    }
    c.collected = true;
    save();
    try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    try { window.UI.toast(c.kind === "fetch" ? `📦 Collected ${c.escrow ? c.escrow.n + "× " + itemName(c.escrow.itemId) : "the goods"} from the Counter.` : `🏛️ The guild confirms the extermination (${c.title}) — filed and sealed.`, 5000); } catch (e) {}
    return { ok: true };
  }

  // ---------- MP sync ----------
  function mpBroadcast(obj) {
    try {
      if (window.MP && typeof window.MP.sendGuild === "function") { window.MP.sendGuild(obj); return; }
      // fallback: relay directly if exposed
    } catch (e) {}
  }
  function onMpClaim(uid, boardId) {
    try {
      const p = P(); if (!p) return;
      const g = ensure(p); if (!g) return;
      try { g.claims[uid] = Date.now(); } catch (e) {}
      const rec = g.boards[boardId];
      if (rec && Array.isArray(rec.offers)) {
        const i = rec.offers.findIndex(o => o && o.uid === uid);
        if (i >= 0) {
          rec.offers.splice(i, 1);
          try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
        }
      }
    } catch (e) {}
  }
  function onMpCommNew(comm) {
    try {
      if (!comm || !comm.cid) return;
      const p = P(); if (!p) return;
      const g = ensure(p);
      const have = g.commissions.find(c => c && c.cid === comm.cid);
      if (have) {
        // stale create arriving after we already learned the outcome (e.g. a
        // late-join sync settled it first): merge hands, never reopen.
        try {
          if (have.status === "open" && Array.isArray(comm.accepts)) {
            have.accepts = Array.isArray(have.accepts) ? have.accepts : [];
            const seen = new Set(have.accepts.map(a => (a && (a.hash || a.by)) || ""));
            for (const a of comm.accepts) {
              const k = (a && (a.hash || a.by)) || "";
              if (k && !seen.has(k)) { seen.add(k); have.accepts.push(a); }
            }
          }
        } catch (e) {}
        return;
      }
      comm.accepts = Array.isArray(comm.accepts) ? comm.accepts : [];
      g.commissions.unshift(comm);
      if (g.commissions.length > 60) g.commissions.length = 60;
      save();
      try { window.UI.toast(`📌 New commissioned work: ${comm.title} — see the guild Commissions.`, 5000); } catch (e) {}
      try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    } catch (e) {}
  }
  function onMpCommAccept(cid, by, fromHash) {
    try {
      if (typeof cid !== "string" || !cid) return;
      const p = P(); if (!p) return;
      const g = ensure(p);
      const c = findCommission(p, cid);
      if (!c || c.status !== "open") return;
      c.accepts = Array.isArray(c.accepts) ? c.accepts : [];
      const key = (fromHash && String(fromHash).toLowerCase()) || ("name:" + String(by || "?"));
      if (c.accepts.some(a => a && ((a.hash && String(a.hash).toLowerCase() === key) || (!a.hash && ("name:" + String(a.by || "?")) === key)))) return;
      c.accepts.push({ by: String(by || "a traveler").slice(0, 24), hash: fromHash ? String(fromHash).toLowerCase().slice(0, 64) : undefined, at: Date.now() });
      if (c.accepts.length > 12) c.accepts = c.accepts.slice(-12);
      save();
      try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    } catch (e) {}
  }
  function applyCommDone(c, g, doneBy, escrow) {
    if (!c || c.status !== "open") return false;
    c.status = "done"; c.doneBy = doneBy || "another traveler"; c.doneAt = Date.now();
    // fetch escrow rides the done message so the commissioner can collect
    // the goods at a Counter even when another machine turned it in.
    try {
      if (c.kind === "fetch" && escrow && typeof escrow.itemId === "string" && escrow.itemId && !c.escrow) {
        c.escrow = { itemId: escrow.itemId.slice(0, 40), n: Math.max(1, Math.min(99, escrow.n | 0 || 1)) };
      }
    } catch (e) {}
    try { releaseNpcClaims(c.cid); } catch (e) {}
    // drop local active copies — another hand was faster
    try {
      for (let k = g.active.length - 1; k >= 0; k--) {
        if (g.active[k] && g.active[k].commissionId === c.cid) g.active.splice(k, 1);
      }
    } catch (e) {}
    return true;
  }
  function onMpCommDone(cid, doneBy, escrow) {
    try {
      const p = P(); if (!p) return;
      const g = ensure(p);
      const c = findCommission(p, cid);
      if (!c || c.status !== "open") return;
      if (!applyCommDone(c, g, doneBy, escrow)) return;
      save();
      try { window.UI.toast(`🏛️ Commission settled by ${c.doneBy}: ${c.title}`, 5000); } catch (e) {}
      try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
    } catch (e) {}
  }
  // Late-join catch-up: whoever missed postings/settles/pins while away
  // merges them here. Monotonic only — done always wins over open, collects
  // and escrows are never clobbered, accepts merge by hand. Never rebroadcast.
  function onMpCommSync(payload) {
    try {
      if (!payload || typeof payload !== "object") return;
      const p = P(); if (!p) return;
      const g = ensure(p); if (!g) return;
      let changed = false;
      const mergeAccepts = (local, remote) => {
        try {
          if (!Array.isArray(remote)) return;
          local.accepts = Array.isArray(local.accepts) ? local.accepts : [];
          const seen = new Set(local.accepts.map(a => (a && (a.hash || ("name:" + (a.by || "?")))) || ""));
          for (const a of remote) {
            if (!a) continue;
            const k = (typeof a === "object" && (a.hash || ("name:" + (a.by || "?")))) || "";
            const ks = String(k).toLowerCase();
            if (ks && !seen.has(ks)) {
              seen.add(ks);
              local.accepts.push(typeof a === "object"
                ? { by: String(a.by || "a traveler").slice(0, 24), hash: a.hash ? String(a.hash).slice(0, 64) : undefined, at: a.at | 0 || Date.now() }
                : { by: String(a).slice(0, 24), at: Date.now() });
              changed = true;
            }
          }
          if (local.accepts.length > 12) { local.accepts = local.accepts.slice(-12); changed = true; }
        } catch (e) {}
      };
      if (Array.isArray(payload.done)) {
        for (const d of payload.done) {
          if (!d || !d.cid) continue;
          const c = findCommission(p, String(d.cid));
          if (c && c.status === "open") {
            if (applyCommDone(c, g, d.doneBy, d.escrow)) changed = true;
            mergeAccepts(c, d.accepts);
          } else if (!c) {
            // settled before we ever saw the posting: keep the record so the
            // board converges (commissioners collect on their own machine).
            try {
              g.commissions.unshift({
                cid: String(d.cid), kind: d.kind === "fetch" ? "fetch" : "kill",
                title: String(d.title || "Commission").slice(0, 80), need: Math.max(1, Math.min(99, d.need | 0 || 1)),
                itemId: d.itemId ? String(d.itemId).slice(0, 40) : null,
                mobKind: d.mobKind ? String(d.mobKind).slice(0, 40) : null,
                mobLv: d.mobLv | 0 || null, target: d.target || null,
                fetchMob: d.fetchMob ? String(d.fetchMob).slice(0, 40) : null,
                srcHint: d.srcHint ? String(d.srcHint).slice(0, 200) : "",
                reward: { gold: Math.max(0, d.reward && d.reward.gold | 0 || 0), xp: Math.max(0, d.reward && d.reward.xp | 0 || 0) },
                commissioner: String(d.commissioner || "Traveler").slice(0, 24),
                commHash: d.commHash ? String(d.commHash).slice(0, 64) : "",
                createdAt: d.createdAt | 0 || Date.now(), status: "done",
                doneBy: String(d.doneBy || "another traveler").slice(0, 32), doneAt: d.doneAt | 0 || Date.now(),
                escrow: (d.kind === "fetch" && d.escrow && d.escrow.itemId) ? { itemId: String(d.escrow.itemId).slice(0, 40), n: Math.max(1, Math.min(99, d.escrow.n | 0 || 1)) } : null,
                accepts: [], collected: false,
              });
              if (g.commissions.length > 60) g.commissions.length = 60;
              changed = true;
            } catch (e) {}
          }
        }
      }
      if (Array.isArray(payload.open)) {
        for (const o of payload.open) {
          if (!o || !o.cid) continue;
          const cid = String(o.cid);
          const c = findCommission(p, cid);
          if (!c) {
            try {
              g.commissions.unshift({
                cid, kind: o.kind === "fetch" ? "fetch" : "kill",
                title: String(o.title || "Commission").slice(0, 80), need: Math.max(1, Math.min(99, o.need | 0 || 1)),
                itemId: o.itemId ? String(o.itemId).slice(0, 40) : null,
                mobKind: o.mobKind ? String(o.mobKind).slice(0, 40) : null,
                mobLv: o.mobLv | 0 || null, target: o.target || null,
                fetchMob: o.fetchMob ? String(o.fetchMob).slice(0, 40) : null,
                srcHint: o.srcHint ? String(o.srcHint).slice(0, 200) : "",
                reward: { gold: Math.max(0, o.reward && o.reward.gold | 0 || 0), xp: Math.max(0, o.reward && o.reward.xp | 0 || 0) },
                commissioner: String(o.commissioner || "Traveler").slice(0, 24),
                commHash: o.commHash ? String(o.commHash).slice(0, 64) : "",
                createdAt: o.createdAt | 0 || Date.now(), status: "open",
                accepts: Array.isArray(o.accepts) ? o.accepts.slice(0, 12) : [], collected: false,
              });
              if (g.commissions.length > 60) g.commissions.length = 60;
              changed = true;
            } catch (e) {}
          } else if (c.status === "open") {
            mergeAccepts(c, o.accepts);
          }
        }
      }
      if (Array.isArray(payload.claims)) {
        for (const cl of payload.claims) {
          if (!cl || !cl.uid) continue;
          try {
            const uid = String(cl.uid).slice(0, 128);
            if (!g.claims[uid]) { g.claims[uid] = Date.now(); changed = true; }
            // board ids ride inside the uid ("hall@epoch:i"); hit every cached
            // rec whose id matches so an already-built board drops the pin.
            let bids = [];
            if (cl.boardId) bids.push(String(cl.boardId).slice(0, 128));
            const at = uid.indexOf("@");
            if (at > 0) bids.push(uid.slice(0, at));
            for (const bid of bids) {
              const rec = g.boards[bid];
              if (rec && Array.isArray(rec.offers)) {
                const i = rec.offers.findIndex(x => x && x.uid === uid);
                if (i >= 0) { rec.offers.splice(i, 1); changed = true; }
              }
            }
          } catch (e) {}
        }
      }
      if (changed) {
        save();
        try { if (window.UI && window.UI.renderGuild) window.UI.renderGuild(); } catch (e) {}
      }
    } catch (e) {}
  }
  function guildSyncSnapshot() {
    try {
      const p = P(); if (!p) return null;
      const g = ensure(p); if (!g) return null;
      const slim = (c) => {
        if (!c || !c.cid) return null;
        const o = {
          cid: String(c.cid).slice(0, 128), kind: c.kind === "fetch" ? "fetch" : "kill",
          title: String(c.title || "Commission").slice(0, 80), need: Math.max(1, Math.min(99, c.need | 0 || 1)),
          commissioner: String(c.commissioner || "Traveler").slice(0, 24),
          commHash: c.commHash ? String(c.commHash).slice(0, 64) : "",
          createdAt: c.createdAt | 0 || 0, status: c.status === "done" ? "done" : "open",
          reward: { gold: Math.max(0, c.reward && c.reward.gold | 0 || 0), xp: Math.max(0, c.reward && c.reward.xp | 0 || 0) },
        };
        if (o.kind === "kill") { if (c.mobKind) o.mobKind = String(c.mobKind).slice(0, 40); o.mobLv = c.mobLv | 0 || 1; }
        else if (c.itemId) o.itemId = String(c.itemId).slice(0, 40);
        if (c.target) o.target = c.target;
        if (c.fetchMob) o.fetchMob = String(c.fetchMob).slice(0, 40);
        if (c.srcHint) o.srcHint = String(c.srcHint).slice(0, 200);
        if (o.status === "done") {
          o.doneBy = String(c.doneBy || "another traveler").slice(0, 32);
          o.doneAt = c.doneAt | 0 || 0;
          if (o.kind === "fetch" && c.escrow && c.escrow.itemId) o.escrow = { itemId: String(c.escrow.itemId).slice(0, 40), n: Math.max(1, Math.min(99, c.escrow.n | 0 || 1)) };
        }
        if (Array.isArray(c.accepts) && c.accepts.length) o.accepts = c.accepts.slice(-8);
        return o;
      };
      const all = Array.isArray(g.commissions) ? g.commissions : [];
      const open = [], done = [];
      for (const c of all) {
        if (!c || !c.cid) continue;
        const s = slim(c);
        if (!s) continue;
        if (s.status === "done") { if (done.length < 12) done.push(s); }
        else if (open.length < 8) open.push(s);
      }
      const claims = [];
      try {
        for (const k of Object.keys(g.claims || {})) {
          if (claims.length >= 30) break;
          claims.push({ uid: String(k).slice(0, 128) });
        }
      } catch (e) {}
      if (!open.length && !done.length && !claims.length) return null;
      return { t: "guildCommSync", open, done, claims };
    } catch (e) { return null; }
  }

  // ---------- adventurer NPC simulation ----------
  let _npcAcc = 0;
  function releaseNpcClaims(cid) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !Array.isArray(G.npcs)) return;
      for (const n of G.npcs) {
        if (n && n.guildComm && n.guildComm.cid === cid) {
          try { delete n.guildComm; window.World.saveNpc(n); } catch (e) {}
        }
      }
    } catch (e) {}
  }
  // Proximity top-up: hunting grounds are real habitat, but the wilds don't
  // guarantee the contracted kind is standing there when the hero arrives
  // (house infestations also wander off / get cleared before arrival). Like
  // the villager-quest spawner, mint creditable mobs near the grounds while
  // the hero closes in — bounded by the remaining need so it never farms.
  function topUpContracts() {
    try {
      const p = P(); if (!p || p.hp <= 0 || p.inDungeon) return;
      const g = ensure(p); if (!g || !g.active.length) return;
      const G = window.Game && window.Game.G;
      if (!G || !Array.isArray(G.mobs)) return;
      // multiplayer thin client: only a simulator mints (mirrors Quests.tick)
      try {
        if (window.MP && window.MP.M && window.MP.M.active && window.MP.isHost && !window.MP.isHost()) {
          if (!(window.MP.amAreaSim && window.MP.amAreaSim())) return;
        }
      } catch (e) {}
      for (const q of g.active) {
        if (!q || q.status !== "active") continue;
        if (q.kind !== "kill" && q.kind !== "clear" && q.kind !== "fetch") continue;
        // legacy fetch contracts predate grounds: backfill once from the hero's spot
        if (q.kind === "fetch" && q.srcHint == null && q.itemId) {
          try {
            const fg = groundForFetchItem(p, q.itemId, p.x, p.y);
            q.target = q.target || fg.target;
            q.fetchMob = fg.fetchMob;
            q.srcHint = fg.srcHint;
            save();
          } catch (e) {}
        }
        if (q.kind === "fetch") {
          if ((fetchHave(p, q) | 0) >= (q.need | 0)) continue;
          if (!q.fetchMob) continue; // market/craft goods: nothing to mint
        } else {
          if ((q.have | 0) >= (q.need | 0)) { q.status = "turnin"; continue; }
        }
        if ((q.spawned | 0) > (q.need | 0) + 6) continue;
        const t = q.target;
        if (!t || !isFinite(t.gx) || !isFinite(t.gy)) continue;
        if (Math.hypot(t.gx - p.x, t.gy - p.y) > 30) continue;
        const wantKind = q.kind === "fetch" ? q.fetchMob : q.mobKind;
        let alive = 0;
        try {
          for (const m of G.mobs) {
            if (!m || !(m.hp > 0) || m.corpse) continue;
            if (m.questGuild === q.gid) { alive++; continue; }
            if (m.kind !== wantKind) continue;
            const mx = (m.x != null ? m.x : m.gx), my = (m.y != null ? m.y : m.gy);
            if (isFinite(mx) && isFinite(my) && nearTarget(q, mx, my)) alive++;
          }
        } catch (e) {}
        const haveN = q.kind === "fetch" ? (fetchHave(p, q) | 0) : (q.have | 0);
        const remaining = (q.need | 0) - haveN - alive;
        if (remaining <= 0) continue;
        // quest summons obey the wilds' rules: undead only after dark/in the
        // gloom, wolves only in forests — substitutes still credit the hunt
        // via their questKind + questGuild tags (see onKill above). Fetch
        // contracts always mint the REAL kind: the corpse must drop the goods.
        let kind = wantKind, qtag = null;
        if (q.kind !== "fetch") {
          try {
            let dark = false;
            try { dark = window.Game.isDarkAt(t.gx, t.gy); } catch (e2) { dark = !!window.Game.isNight && window.Game.isNight(); }
            let isUndead = (kind === "skeleton" || kind === "wraith");
            try { if (!isUndead && window.Items && window.Items.isUndead) isUndead = !!window.Items.isUndead({ kind }); } catch (e3) {}
            if (isUndead && !dark) { kind = "goblin"; qtag = wantKind; }
            else if (kind === "wolf") {
              let b = null;
              try { b = window.World.biomeAt(Math.round(t.gx), Math.round(t.gy)); } catch (e4) {}
              if (b !== "forest") { kind = "goblin"; qtag = wantKind; }
            }
          } catch (e) {}
        }
        let lv = 5;
        try { lv = window.Game.overworldLevelFor(t.gx, t.gy); } catch (e) { try { lv = (p && p.lv) || 5; } catch (e2) {} }
        lv = Math.max(1, Math.min(60, Math.round(lv)));
        const rr = q.kind === "clear" ? 6 : 10;
        const n = Math.min(remaining, 3);
        for (let i = 0; i < n; i++) {
          try {
            const m = window.Entities.makeMob(kind, lv, 60, 0);
            const ang = Math.random() * Math.PI * 2, rad = 3 + Math.random() * rr;
            let mx = t.gx + Math.cos(ang) * rad, my = t.gy + Math.sin(ang) * rad;
            try { if (window.Game.walkable && !window.Game.walkable(mx, my)) { mx = t.gx; my = t.gy; } } catch (e) {}
            m.x = mx; m.y = my; m.homeX = mx; m.homeY = my;
            m.hp = m.maxHp; m.mp = m.maxMp;
            m.questGuild = q.gid;
            if (qtag) m.questKind = qtag;
            if (q.kind === "clear") m.questInfest = q.gid;
            if (q.kind === "fetch" && q.itemId) m.questFetch = q.itemId;
            G.mobs.push(m);
          } catch (e) {}
        }
        q.spawned = (q.spawned | 0) + n;
      }
    } catch (e) {}
  }
  function tick(dt) {
    try {
      _npcAcc += dt;
      if (_npcAcc < NPC_TICK_S) return;
      _npcAcc = 0;
      const p = P(); if (!p) return;
      const g = ensure(p); if (!g) return;
      const G = window.Game && window.Game.G;
      if (!G || p.hp <= 0) return;
      // contract grounds restock while the hero closes in (runs even with no
      // open commissions — it is not part of the claimant drive below)
      try { topUpContracts(); } catch (e) {}
      // prune stale claims
      try {
        const now = Date.now();
        for (const k of Object.keys(g.claims || {})) { if (now - g.claims[k] > ROTATE_MS * 2) delete g.claims[k]; }
      } catch (e) {}
      const open = openCommissions(p);
      if (!open.length) { driveClaimants(dt); return; }
      // recruit adventurers for open commissions (max 2 NPC claimants each)
      try {
        const npcs = (G.npcs || []).filter(n => n && n.role === "adventurer" && (n.hp > 0) && !n.inParty && !n.inInn && !n.guildComm);
        for (const c of open) {
          if (c.status !== "open") continue;
          let npcN = 0;
          try { for (const n of (G.npcs || [])) if (n && n.guildComm && n.guildComm.cid === c.cid) npcN++; } catch (e) {}
          const playerN = (c.accepts || []).length;
          if (npcN + Math.min(2, playerN) >= 2) continue;
          if (!npcs.length) break;
          if (Math.random() > 0.35) continue;
          const n = npcs.splice((Math.random() * npcs.length) | 0, 1)[0];
          if (!n) continue;
          const t = c.target;
          const tx = (c.kind === "kill" && t) ? t.gx : Math.round(p.x + (Math.random() * 120 - 60));
          const ty = (c.kind === "kill" && t) ? t.gy : Math.round(p.y + (Math.random() * 120 - 60));
          n.guildComm = { cid: c.cid, have: 0, stage: "travel", tx, ty, workT: 0 };
          try { window.World.saveNpc(n); } catch (e) {}
          try {
            if (Math.hypot((n.x || 0) - p.x, (n.y || 0) - p.y) < 40) window.UI.toast(`🧭 Adventurer ${n.name} takes up "${c.title}" — follow if you like.`, 4500);
          } catch (e) {}
        }
      } catch (e) {}
      driveClaimants(NPC_TICK_S);
    } catch (e) {}
  }
  function driveClaimants(dt) {
    try {
      const p = P(); if (!p) return;
      const g = ensure(p); if (!g) return;
      const G = window.Game && window.Game.G;
      if (!G || !Array.isArray(G.npcs)) return;
      for (const n of G.npcs) {
        if (!n || !n.guildComm || !(n.hp > 0)) continue;
        const gc = n.guildComm;
        const c = findCommission(p, gc.cid);
        if (!c || c.status !== "open") { try { delete n.guildComm; } catch (e) {} continue; }
        if (n.inParty || n.inInn) { try { delete n.guildComm; } catch (e) {} continue; }
        const spd = 4.2 * (dt || NPC_TICK_S);
        if (gc.stage === "travel") {
          const dx = gc.tx - (n.x || 0), dy = gc.ty - (n.y || 0);
          const d = Math.hypot(dx, dy);
          const arriveR = c.kind === "kill" ? 26 : 14;
          if (d <= arriveR) { gc.stage = "work"; gc.workT = 0; }
          else {
            const step = Math.min(d, spd);
            const nx = (n.x || 0) + dx / (d || 1) * step, ny = (n.y || 0) + dy / (d || 1) * step;
            try {
              if (window.Game.npcSlide) window.Game.npcSlide(n, nx - (n.x || 0), ny - (n.y || 0));
              else { n.x = nx; n.y = ny; n.gx = nx; n.gy = ny; }
            } catch (e) { try { n.x = nx; n.y = ny; } catch (e2) {} }
            n.moving = true;
          }
        } else if (gc.stage === "work") {
          gc.workT = (gc.workT || 0) + (dt || NPC_TICK_S);
          // scuffle: conjure the quarry nearby so fights are visible
          if (gc.workT >= 6) {
            gc.workT = 0;
            if (c.kind === "kill") {
              // spawn one of the mark beside the adventurer (visible proof)
              try {
                let lv = c.mobLv || 5;
                const m = window.Entities.makeMob(c.mobKind, lv, 60, 0);
                m.x = (n.x || 0) + (Math.random() * 6 - 3); m.y = (n.y || 0) + (Math.random() * 6 - 3);
                m.homeX = m.x; m.homeY = m.y; m.hp = m.maxHp; m.mp = m.maxMp;
                try { m.hostileUntil = Date.now() + 30000; m.targetRef = n; m.aggro = true; } catch (e) {}
                G.mobs.push(m);
              } catch (e) {}
              // credit the adventurer's own tally (their blade does the rest)
              gc.have = (gc.have | 0) + 1;
              try {
                if (Math.hypot((n.x || 0) - p.x, (n.y || 0) - p.y) < 30) window.UI.toast(`⚔️ ${n.name} downs a ${c.mobKind} (${Math.min(gc.have, c.need)}/${c.need}) for "${c.title}".`, 3000);
              } catch (e) {}
            } else {
              gc.have = (gc.have | 0) + 1;
              try {
                if (Math.hypot((n.x || 0) - p.x, (n.y || 0) - p.y) < 30) window.UI.toast(`🎒 ${n.name} gathers ${c.itemId} (${Math.min(gc.have, c.need)}/${c.need}) for "${c.title}".`, 3000);
              } catch (e) {}
            }
            if ((gc.have | 0) >= (c.need | 0)) {
              gc.stage = "return";
              // head for the nearest guildhall
              try {
                const gd = nearestGuild(n.x || 0, n.y || 0, 1e9);
                if (gd && gd.nexus) { gc.tx = gd.nexus.x; gc.ty = gd.nexus.y; }
                else { gc.tx = p.x; gc.ty = p.y; }
              } catch (e) { gc.tx = p.x; gc.ty = p.y; }
            }
          }
        } else if (gc.stage === "return") {
          const dx = gc.tx - (n.x || 0), dy = gc.ty - (n.y || 0);
          const d = Math.hypot(dx, dy);
          if (d <= 4) {
            // turn in as the NPC: first finisher wins, even off-screen
            npcTurnIn(n, c);
            try { delete n.guildComm; } catch (e) {}
          } else {
            const step = Math.min(d, spd);
            const nx = (n.x || 0) + dx / (d || 1) * step, ny = (n.y || 0) + dy / (d || 1) * step;
            try {
              if (window.Game.npcSlide) window.Game.npcSlide(n, nx - (n.x || 0), ny - (n.y || 0));
              else { n.x = nx; n.y = ny; n.gx = nx; n.gy = ny; }
            } catch (e) { try { n.x = nx; n.y = ny; } catch (e2) {} }
            n.moving = true;
          }
        }
        try { window.World.saveNpc(n); } catch (e) {}
      }
    } catch (e) {}
  }
  function npcTurnIn(n, c) {
    try {
      const p = P(); if (!p) return;
      const g = ensure(p); if (!g || !c || c.status !== "open") return;
      if (c.kind === "fetch") c.escrow = { itemId: c.itemId, n: c.need | 0 };
      c.status = "done"; c.doneBy = (n && n.name) || "an adventurer"; c.doneAt = Date.now(); c.collected = false;
      // player's own copies of this commission fail: another hand was faster
      for (let k = g.active.length - 1; k >= 0; k--) {
        if (g.active[k] && g.active[k].commissionId === c.cid) g.active.splice(k, 1);
      }
      try { releaseNpcClaims(c.cid); } catch (e) { try { if (n) delete n.guildComm; } catch (e2) {} }
      try { n.gold = Math.max(0, Math.trunc(Number(n.gold)||0) + Math.max(0, Math.trunc(Number(c.reward.gold)||0))); window.World.saveNpc(n); } catch (e) {}
      save();
      try { mpBroadcast({ t: "guildCommDone", cid: c.cid, doneBy: c.doneBy, escrow: c.escrow ? { itemId: c.escrow.itemId, n: c.escrow.n } : null }); } catch (e) {}
      try {
        window.UI.toast(`🏛️ ${c.doneBy} turned in "${c.title}" (+${c.reward.gold}g). ${c.kind === "fetch" ? "The goods await the commissioner at any Counter." : "The commissioner can collect the confirmation at any Counter."}`, 6000);
        if (window.UI.renderGuild) window.UI.renderGuild();
      } catch (e) {}
    } catch (e) {}
  }

  return {
    RANKS, RANK_NEED, MAX_ACTIVE, BOARD_SIZE, BOARD_POOL, ROTATE_MS, TARGET_RADIUS, HOUSE_RADIUS, GUILD_KEYS,
    isGuildhallKey, isGuildBuilding, guildNexusPos, nearestGuild,
    ensure, rankOf, rankRec, rankForCompleted, nextNeed, payoutMult, rankProgress,
    boardIdFor, boardNameFor, boardOffers, acceptOffer, abandon,
    active, get, fetchHave, isReady, progressText, targetText, nearTarget, onKill, turnIn, rewardFor,
    msToRotate, epochNow, findHuntingGround, findGatherGround, groundForFetchItem, biomesForMob, biomeLabel, mobName,
    commissions, openCommissions, doneCommissions, findCommission, createCommission, acceptCommission, collectCommission,
    commissionCostKill, commissionCostFetch, commissionReward, allItemIds, allMobIds, commissionDesc,
    onMpClaim, onMpCommNew, onMpCommAccept, onMpCommDone, onMpCommSync, guildSyncSnapshot, releaseNpcClaims, tick,
  };
})();
