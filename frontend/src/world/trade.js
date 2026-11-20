/* NPC trade: personal inventories, gold, haggling. window.Trade (classic script). */
window.Trade = (() => {
  // Safe integer helpers: player/NPC gold and trade counts must never go
  // through `| 0` (wraps at ~2.1B) or `n | 0` (wraps large stacks).
  function toGold(v) {
    try {
      const n = Math.trunc(Number(v));
      if (!isFinite(n)) return 0;
      return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, n));
    } catch (e) { return 0; }
  }
  function toCount(v) {
    try {
      const n = Math.trunc(Number(v));
      if (!isFinite(n)) return 1;
      return Math.max(1, Math.min(999999, n));
    } catch (e) { return 1; }
  }
  function goldOf(ent) { try { return toGold(ent && ent.gold); } catch (e) { return 0; } }
  // Base values (gold each). NPC asking prices and bids derive from these.
  // Hand-written for legacy goods; anything generated in items.js falls back to
  // its own price field (or a tier-based estimate) via basePrice().
  const BASE = {
    wood: 2, stone: 3, herb: 4,
    sage_herb: 6, cinder_herb: 6, calm_herb: 6, bright_herb: 6,
    potion: 25, mana_potion: 30, bomb: 45,
    antidote: 18, burn_salve: 18, warm_brew: 16, focus_tea: 18, clear_drops: 18, panacea_brew: 60,
    arrow_iron: 3, arrow_poison: 6, arrow_cinder: 6, arrow_frost: 6,
    arrow_steel: 5, arrow_silver: 9, arrow_mythril: 15, arrow_dragonbone: 30,
    smoke_bomb: 40,
    shuriken_iron: 4, shuriken_steel: 8, shuriken_silver: 14, shuriken_mythril: 24, shuriken_dragonbone: 60,
    iron_ore: 8, silver_ore: 22, mythril_ore: 60,
    dragon_bone: 400, dragon_horn: 350, wolf_hide: 12,
    dawnstone_shard: 800,
    frostwood_log: 25, emberwood_log: 25, yggdrasil_branch: 120,
    ruby_gem: 90, sapphire_gem: 90, emerald_gem: 90,
    rime_crystal: 70, ember_core: 80, storm_feather: 45, tide_pearl: 45, holy_bead: 60, unicorn_hair: 150,
    wooden_sword: 40, cloth_robe: 90, oak_bow: 180, apprentice_staff: 200,
    yew_bow: 450, wardens_bow: 3200,
    iron_sword: 350, leather_armor: 280, fire_staff: 550, mage_robe: 550, hunter_ring: 1100,
    steel_sword: 1100, iron_armor: 650, scholar_amulet: 1400, lucky_charm: 1600,
    tome_fireball: 450, tome_heal: 450, tome_whirlwind: 450,
    tome_frostbite: 450, tome_shieldwall: 550,
    tome_tornado: 1150, tome_hurricane: 15000, tome_angel_of_life: 5200,
    tome_revive: 1300, tome_lightning: 1100,
    tome_venom: 450, tome_immolate: 1150, tome_glacier: 1150, tome_thunder_hex: 1150,
    tome_dazzle: 450, tome_smite: 1200, tome_tideburst: 1150, tome_water_jet: 450,
    tome_cleanse: 1100, tome_panacea: 2600,
    tome_shadowstep: 550, tome_grapple: 500, tome_warcry: 1150,
    tome_ember_weapon: 1200, tome_blessed_weapon: 2500,
    tome_tidal_wave: 15000, tome_energy_beam: 15000, tome_meteorfall: 15000, tome_whiteout: 15000,
    old_bow: 120, frostwood_bow: 2900, yggdrasil_bow: 13500,
    wayfarer_garb: 950, shadowweave_garb: 4200,
    steel_plate: 2400, mythril_plate: 6800, dragonbone_plate: 18500,
    archmage_robe: 3900, holy_vestments: 8800,
    wooden_buckler: 110, iron_shield: 600, steel_shield: 2300,
    silver_shield: 4600, mythril_shield: 9500, dragonbone_shield: 22000,
    obsidian_ring: 4800, coral_ring: 4800, rime_ring: 4800, piezo_ring: 4800, holy_ring: 5200, strength_ring: 5000,
    smite_blade: 12500, frostfang_bow: 13000, cinderbrand: 9800,
    crimson_rage: 320, ironmind_draught: 320, swiftshade: 300,
    clay: 3, brick: 6, quartz_crystal: 90, plank_bundle: 12, glass_pane: 14,
    brick_wall_kit: 30, wooden_door_kit: 32, glass_window_kit: 34, home_portal_kit: 1500,
    permit_market: 5000, permit_blacksmith: 5000, permit_dojo: 4000, permit_arcane: 6000, permit_stable: 3500,
    dawnbreaker: 42000, wyrmfang: 45000, stormcall: 44000, oathbow: 48000,
  };
  function basePrice(id) {
    if (BASE[id] != null) return BASE[id];
    try {
      const it = window.Items && window.Items.ITEMS[id];
      if (it && typeof it.price === "number") return it.price;
      if (it && it.tierMult) return Math.round(40 * it.tierMult * (Math.max((it.bonus && it.bonus.atk) || 0, (it.bonus && it.bonus.matk) || 0) || 4));
      if (it && (it.bowPower || it.powerMult || it.manaMult)) return 300;
      if (it && it.resPhys != null) return 250;
    } catch (e) { }
    return 10;
  }

  function hashStr(s) {
    let h = 2166136261;
    s = String(s == null ? "x" : s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Shop stock mirrors loot tiers 0-4 (a new tier about every 20 levels).
  // Tier 5 (dragon) is NEVER sold — boss loot only.
  const TIER_EQ = [
    ["rusted_sword", "rusted_dagger", "rusted_whip", "rusted_axe", "rusted_hammer", "rusted_spear", "wooden_sword", "cloth_robe", "leather_armor", "patched_kasaya", "novice_habit", "old_bow", "oak_bow", "apprentice_staff", "wand_quartz", "staff_quartz"],
    ["iron_sword", "iron_dagger", "iron_whip", "iron_axe", "iron_hammer", "iron_spear", "leather_armor", "wayfarer_garb", "ironthread_kasaya", "canon_habit", "yew_bow", "fire_staff", "wand_ruby", "staff_ruby", "mage_robe", "hunter_ring", "coral_ring", "rime_ring"],
    ["steel_sword", "steel_dagger", "steel_whip", "steel_axe", "steel_hammer", "silver_sword", "silver_dagger", "silver_whip", "steel_plate", "iron_armor", "ironthread_kasaya", "canon_habit", "archmage_robe", "wardens_bow", "wand_sapphire", "staff_sapphire", "wand_emerald", "staff_emerald", "obsidian_ring", "piezo_ring", "scholar_amulet", "lucky_charm", "cinderbrand"],
    ["mythril_sword", "mythril_dagger", "mythril_whip", "mythril_axe", "mythril_hammer", "mythril_spear", "mythril_plate", "shadowweave_garb", "sunsilk_kasaya", "vesper_habit", "frostwood_bow", "wand_holybead", "staff_holybead", "holy_vestments", "holy_ring", "frostfang_bow"],
    ["yggdrasil_bow", "strength_ring", "mythril_sword", "mythril_axe", "mythril_spear", "mythril_whip", "mythril_plate", "shadowweave_garb", "sunsilk_kasaya", "vesper_habit", "frostwood_bow", "wand_holybead", "staff_holybead", "holy_vestments", "holy_ring"],
    ["dragonbone_sword", "dragonbone_dagger", "dragonbone_axe", "dragonbone_hammer", "dragonbone_spear", "dragonbone_plate", "dragonhide_kasaya", "seraph_habit", "wyrmshroud_robe", "wand_dragonhorn", "staff_dragonhorn", "smite_blade", "dawnbreaker", "wyrmfang", "stormcall", "oathbow"],
  ];
  const TOMES = ["tome_fireball", "tome_heal", "tome_whirlwind", "tome_frostbite", "tome_tornado", "tome_shieldwall", "tome_revive", "tome_lightning", "tome_venom", "tome_immolate", "tome_glacier", "tome_thunder_hex", "tome_dazzle", "tome_smite", "tome_tideburst", "tome_water_jet", "tome_cleanse", "tome_panacea", "tome_angel_of_life", "tome_shadowstep", "tome_grapple", "tome_warcry", "tome_ember_weapon", "tome_blessed_weapon"];
  function tierFor(lv) { return lv >= 80 ? 4 : lv >= 60 ? 3 : lv >= 40 ? 2 : lv >= 20 ? 1 : 0; }
  // Loot-only, never on shelves: legendaries, hybrids, and all trinkets (rings/charms).
  function isSellable(id) {
    try {
      const t = window.Items.ITEMS[id];
      if (!t) return true;
      if (t.quest || t.type === "quest") return false; // quest-tagged goods are delivered, never shelved
      if (t.legendary) return false;
      if (window.Items.HYBRIDS && window.Items.HYBRIDS.includes(id)) return false;
      // Dimension-exclusive bands are never shelved anywhere: oblivion is
      // hell-only, dawnstone drops only from heaven overworld bosses.
      try {
        if (window.Items.isHellOnly && window.Items.isHellOnly(id)) return false;
        if (window.Items.isDawnstone && window.Items.isDawnstone(id)) return false;
      } catch (e) {}
      if (t.slot === "trinket") return false;
      return true;
    } catch (e) { return true; }
  }
  function pick(R, arr) { return arr[(R() * arr.length) | 0]; }

  function markup(role, id) {
    const type = itemType(id);
    if (role === "merchant" || role === "guildmaster") return 1.15;
    if ((role === "harbormaster" || role === "dockworker") && (type === "material" || type === "consumable")) return 1.0;
    if ((role === "monarch" || role === "noble" || role === "chancellor" || role === "magistrate") && type !== "equipment") return 1.1;
    if ((role === "blacksmith" || role === "runesmith") && (type === "equipment")) return 1.0;
    if ((role === "healer" || role === "priest" || role === "cleric") && (type === "consumable" || id === "tome_heal" || id === "tome_cleanse" || id === "tome_panacea" || id === "tome_angel_of_life")) return 1.0;
    if (role === "herbalist" && (type === "material" || type === "consumable")) return 1.0;
    if (role === "hunter" && (id === "oak_bow" || id === "yew_bow" || type === "ammo" || id === "smoke_bomb" || (id && id.indexOf("shuriken_") === 0))) return 1.0;
    if (role === "ninja" && (id === "iron_dagger" || id === "steel_dagger" || id === "rusted_dagger" || id === "smoke_bomb" || (id && id.indexOf("shuriken_") === 0))) return 1.0;
    if (role === "innkeeper" && type !== "equipment") return 1.0;
    return 1.2;
  }
  function itemType(id) {
    try { const it = window.Items.ITEMS[id]; if (it) return it.type; } catch (e) { }
    if (String(id).startsWith("tome_")) return "spellbook";
    return "material";
  }
  function itemName(id) {
    try { const it = window.Items.ITEMS[id]; if (it) return it.name; } catch (e) { }
    return id;
  }
  // Cataclysm tomes (deep-delve lore) are NEVER sold — dungeon chests at
  // effective depth 5+ and deep boss hoards only. No NPC, library or other
  // shop may stock or sell them (players can still sell spares back).
  const CATA_FALLBACK = ["tome_tidal_wave", "tome_energy_beam", "tome_meteorfall", "tome_whiteout", "tome_hurricane"];
  function isGatedSale(id) {
    try { if (window.Items && window.Items.isSurfGated) return !!window.Items.isSurfGated(id); } catch (e) { }
    return false;
  }
  function isCataSale(id) {
    try { if (window.Items && window.Items.isCataTome) return !!window.Items.isCataTome(id); } catch (e) { }
    return CATA_FALLBACK.includes(id);
  }

  // ---- generation (deterministic per npc id, stable even before persist) ----
  function genGold(npc) {
    const R = rng(hashStr(npc.id + ":gold"));
    const lv = npc.lv || 1;
    const base = (npc.role === "merchant" || npc.role === "guildmaster") ? 1200 + lv * 250
      : (npc.role === "monarch" || npc.role === "noble") ? 1500 + lv * 200
      : (npc.role === "harbormaster") ? 1000 + lv * 180
      : npc.role === "innkeeper" ? 700 + lv * 120
      : (npc.role === "blacksmith" || npc.role === "runesmith") ? 900 + lv * 150
      : (npc.role === "healer" || npc.role === "priest" || npc.role === "cleric") ? 500 + lv * 100
      : npc.role === "herbalist" ? 600 + lv * 120
      : 200 + lv * 80;
    return Math.max(5, Math.round(base * (0.7 + R() * 0.6)));
  }
  function genStock(npc) {
    const R = rng(hashStr(npc.id + ":stock"));
    const lv = npc.lv || 1, role = npc.role || "villager";
    const tier = TIER_EQ[tierFor(lv)];
    const stock = [];
    const add = (id, n) => {
      if (!id || n <= 0) return;
      if (isCataSale(id)) return; // sealed lore is never stocked for sale
      const line = stock.find(s => s.id === id);
      if (line) line.n += n;
      else stock.push({ id, n, price: Math.max(1, Math.round(basePrice(id) * markup(role, id))) });
    };
    const hasStock = id => stock.some(s => s.id === id);
    // Iron-tier basics every smith/scholar/hunter carries, from day one.
    const IRON_MELEE = ["iron_sword", "iron_dagger", "iron_whip", "iron_axe", "iron_hammer", "iron_spear"];
    const tome = () => pick(R, TOMES);
    switch (role) {
      case "guildmaster": case "harbormaster": case "monarch": case "noble": case "chancellor": case "magistrate": case "highpriest": case "marshal": case "knight": case "desert_nomad": case "steppe_rider": case "mesa_shaman": case "frost_skald": case "dockworker": {
        add("potion", 1 + ((R() * 2) | 0)); add("herb", 2 + ((R() * 4) | 0));
        if (R() < 0.5) add("mana_potion", 1);
        if (role === "guildmaster" || role === "monarch" || role === "harbormaster") {
          add("wood", 2 + ((R() * 4) | 0)); add("stone", 1 + ((R() * 3) | 0));
          const mt = tier.filter(isSellable);
          add(pick(R, mt.length ? mt : ["potion"]), 1);
        }
        if (role === "highpriest" || role === "mesa_shaman" || role === "frost_skald") {
          add("antidote", 1); add("burn_salve", 1);
          if (R() < 0.4) add("tome_heal", 1);
        }
        if (role === "knight" || role === "marshal") {
          const gw = TIER_EQ[Math.min(4, tierFor(lv))].filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "weapon" && isSellable(id); } catch (e) { return false; } });
          if (gw.length) add(pick(R, gw), 1);
        }
        break;
      }
      case "merchant": {
        add("potion", 1 + ((R() * 3) | 0)); add("mana_potion", 1 + ((R() * 2) | 0));
        if (R() < 0.5) add("bomb", 1);
        add("herb", 2 + ((R() * 5) | 0)); add("wood", 2 + ((R() * 5) | 0)); add("stone", 1 + ((R() * 4) | 0));
        const mt = tier.filter(isSellable);
        add(pick(R, mt.length ? mt : ["potion"]), 1);
        if (R() < 0.5) add(tome(), 1);
        break;
      }
      case "blacksmith": case "runesmith": {
        const melee = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "weapon" && t.wtype && ["sword", "axe", "hammer", "dagger", "whip", "spear"].includes(t.wtype) && isSellable(id); } catch (e) { return false; } });
        const plate = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "armor" && isSellable(id); } catch (e) { return false; } });
        const shields = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "shield" && isSellable(id); } catch (e) { return false; } });
        add(pick(R, melee.length ? melee : tier.filter(isSellable)), 1);
        add(pick(R, (plate.length && R() < 0.5) ? plate : (melee.length ? melee : ["iron_sword"])), 1);
        if (shields.length && R() < 0.6) add(pick(R, shields), 1);
        if (lv >= 40 && R() < 0.25) add(pick(R, ["silver_sword", "silver_dagger"]), 1);
        // iron-tier basics from day one, whatever the smith's own level
        add(pick(R, IRON_MELEE.filter(id => !hasStock(stock, id))), 1);
        if (!hasStock(stock, "iron_armor")) add("iron_armor", 1);
        if (!hasStock(stock, "iron_shield")) add("iron_shield", 1);
        add("iron_ore", 2 + ((R() * 4) | 0));
        if (lv >= 20 && R() < 0.6) add("silver_ore", 1 + ((R() * 2) | 0));
        if (role === "runesmith" && lv >= 40 && R() < 0.5) add("mythril_ore", 1 + ((R() * 2) | 0));
        add("stone", 2 + ((R() * 4) | 0)); add("wood", 2 + ((R() * 4) | 0));
        if (R() < 0.4) add("potion", 1);
        break;
      }
      case "innkeeper":
        add("potion", 2 + ((R() * 2) | 0)); add("herb", 2 + ((R() * 4) | 0));
        if (R() < 0.5) add("mana_potion", 1);
        if (R() < 0.3) add("bomb", 1);
        break;
      case "healer": {
        add("potion", 2 + ((R() * 2) | 0)); add("mana_potion", 1 + ((R() * 2) | 0));
        const robes = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "armor" && (t.resMagic > 0); } catch (e) { return false; } });
        if (robes.length && R() < 0.5) add(pick(R, robes), 1);
        add("antidote", 2); add("burn_salve", 2);
        if (R() < 0.5) add("tome_heal", 1);
        if (R() < 0.4) add("tome_cleanse", 1);
        if (lv >= 5 && R() < 0.5) add("tome_revive", 1);
        if (lv >= 4 && R() < 0.4) add("tome_panacea", 1);
        add("herb", 2 + ((R() * 3) | 0));
        break;
      }
      case "cleric":
        add("potion", 2 + ((R() * 2) | 0)); add("mana_potion", 1 + ((R() * 2) | 0));
        add("antidote", 2); add("burn_salve", 2); add("focus_tea", 1); add("panacea_brew", 1);
        add("tome_cleanse", 1);
        if (R() < 0.5) add("tome_heal", 1);
        if (lv >= 3 && R() < 0.5) add("tome_panacea", 1);
        if (lv >= 5 && R() < 0.4) add("tome_revive", 1);
        break;
      case "herbalist":
        // bulk curative herbs + finished cures
        add("sage_herb", 12 + ((R() * 8) | 0)); add("cinder_herb", 12 + ((R() * 8) | 0));
        add("calm_herb", 10 + ((R() * 8) | 0)); add("bright_herb", 10 + ((R() * 8) | 0));
        add("herb", 8 + ((R() * 6) | 0));
        add("antidote", 3); add("burn_salve", 3); add("focus_tea", 2); add("clear_drops", 2); add("panacea_brew", 1);
        add("potion", 1 + ((R() * 2) | 0));
        if (R() < 0.4) add("tome_cleanse", 1);
        if (R() < 0.25) add("tome_panacea", 1);
        break;
      case "priest":
        add("potion", 1 + ((R() * 2) | 0)); add("mana_potion", 1 + ((R() * 2) | 0));
        add("antidote", 1); add("burn_salve", 1);
        add("tome_cleanse", 1);
        add(lv >= 4 && R() < 0.5 ? "tome_revive" : "tome_heal", 1);
        if (lv >= 3 && R() < 0.35) add("tome_panacea", 1);
        if (lv >= 60 && R() < 0.3) add(pick(R, ["tome_smite", "holy_vestments", "staff_holybead"]), 1);
        break;
      case "hunter": {
        const bows = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.bow && isSellable(id); } catch (e) { return false; } });
        add(pick(R, bows.length ? bows : ["oak_bow"]), 1);
        if (!hasStock(stock, "oak_bow")) add("oak_bow", 1); // wood-and-flax bow, always in stock
        if (lv >= 60 && R() < 0.2) add("frostwood_bow", 1);
        add("wood", 2 + ((R() * 4) | 0)); add("herb", 1 + ((R() * 3) | 0));
        add("wolf_hide", 2 + ((R() * 3) | 0));
        if (R() < 0.5) add("frostwood_log", 1 + ((R() * 2) | 0));
        if (R() < 0.4) add("emberwood_log", 1 + ((R() * 2) | 0));
        add("arrow_iron", 8 + ((R() * 8) | 0)); add("arrow_poison", 4 + ((R() * 4) | 0));
        add("arrow_steel", 4 + ((R() * 4) | 0));
        if (lv >= 20) add("arrow_silver", 4);
        if (lv >= 40) add("arrow_mythril", 4);
        if (lv >= 60) add("arrow_dragonbone", 4);
        add("shuriken_iron", 6 + ((R() * 6) | 0));
        if (lv >= 20 && R() < 0.5) add("shuriken_steel", 6);
        if (R() < 0.3) add("smoke_bomb", 2);
        if (R() < 0.3) add("arrow_cinder", 4);
        if (R() < 0.3) add("arrow_frost", 4);
        break;
      }
      case "scholar": {
        add(tome(), 1); add(tome(), 1); add("mana_potion", 1 + ((R() * 2) | 0));
        const foci = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && (t.wand || t.staff) && isSellable(id); } catch (e) { return false; } });
        if (foci.length && R() < 0.7) add(pick(R, foci), 1);
        // quartz wand + staff from day one, whatever the scholar's level
        if (!hasStock(stock, "wand_quartz")) add("wand_quartz", 1);
        if (!hasStock(stock, "staff_quartz")) add("staff_quartz", 1);
        if (R() < 0.3) add(pick(R, ["tome_smite", "tome_tideburst", "tome_glacier", "tome_lightning"]), 1);
        if (lv >= 20 && R() < 0.6) add(pick(R, ["ruby_gem", "sapphire_gem", "emerald_gem"]), 1);
        if (lv >= 40 && R() < 0.4) add("holy_bead", 1);
        break;
      }
      case "guard": case "samurai": {
        add("potion", 1 + ((R() * 2) | 0));
        const gw = TIER_EQ[Math.min(4, tierFor(lv))].filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "weapon" && isSellable(id); } catch (e) { return false; } });
        if (lv >= 3) add(pick(R, gw.length ? gw : TIER_EQ[Math.min(4, tierFor(lv))]), 1);
        else add("wooden_sword", 1);
        break;
      }
      case "fisher": case "tidewarden": case "farmer":
        add("herb", 2 + ((R() * 4) | 0)); add("wood", 1 + ((R() * 4) | 0));
        if ((role === "fisher" || role === "tidewarden") && lv >= 35 && R() < 0.5) add("tide_pearl", 1 + ((R() * 2) | 0));
        add("potion", 1);
        break;
      case "bard": case "miner":
        add(role === "miner" ? "stone" : "herb", 2 + ((R() * 4) | 0));
        if (role === "miner") {
          add("iron_ore", 2 + ((R() * 4) | 0));
          if (lv >= 20 && R() < 0.5) add("silver_ore", 1 + ((R() * 2) | 0));
          if (lv >= 40 && R() < 0.3) add("mythril_ore", 1);
        }
        add("potion", 1 + ((R() * 2) | 0));
        break;
      case "ninja": {
        const blades = tier.filter(id => { try { const t = window.Items.ITEMS[id]; return t && t.slot === "weapon" && t.wtype === "dagger" && isSellable(id); } catch (e) { return false; } });
        add(pick(R, blades.length ? blades : ["iron_dagger"]), 1);
        if (!hasStock(stock, "iron_dagger")) add("iron_dagger", 1);
        add("potion", 1 + ((R() * 2) | 0));
        if (R() < 0.4) add("arrow_poison", 4);
        add("shuriken_iron", 6 + ((R() * 6) | 0));
        if (R() < 0.5) add("shuriken_steel", 6);
        if (lv >= 40 && R() < 0.3) add("shuriken_silver", 6);
        if (R() < 0.4) add("smoke_bomb", 2);
        break;
      }
      case "thief":
        add("torch", 2 + ((R() * 3) | 0));
        add("potion", 1 + ((R() * 2) | 0)); add("herb", 1 + ((R() * 3) | 0));
        if (R() < 0.4) {
          const pool = TIER_EQ[0].filter(isSellable);
          if (pool.length) add(pick(R, pool), 1);
        }
        break;
      default:
        add("potion", 1 + ((R() * 2) | 0)); add("herb", 1 + ((R() * 3) | 0));
        if (R() < 0.3) {
          const pool = TIER_EQ[0].filter(isSellable);
          if (pool.length) add(pick(R, pool), 1);
        }
        break;
    }
    // Surface floor-gates: mythril/emerald/frostwood-band and dragon-band
    // goods are NEVER shelved anywhere — they surface only from deep
    // surface-delve floors (5+ / 11+), not from any merchant.
    try {
      const gated = window.Items && window.Items.SURF_GATED_ALL;
      if (gated && gated.length) stock = stock.filter(s => s && !gated.includes(s.id));
    } catch (e) { }
    // Dimension-exclusive bands are NEVER shelved anywhere either
    // (hell-only oblivion, heaven-boss-only dawnstone).
    try {
      const I = window.Items;
      if (I && typeof I.isHellOnly === "function") stock = stock.filter(s => s && !I.isHellOnly(s.id) && !I.isDawnstone(s.id));
    } catch (e2) { }
    return stock;
  }
  // Backfill old NPCs (saved before trade existed). Persists lazily via saveNpc callers.
  // Also strips any sealed cataclysm lore that slipped into a shelf (old
  // saves, player resales) — it is never offered for sale.
  function ensure(npc) {
    if (!npc || npc.role === "mob") return npc;
    if (typeof npc.gold !== "number") npc.gold = genGold(npc);
    if (!Array.isArray(npc.stock)) npc.stock = genStock(npc);
    else if (npc.stock.some(s => s && isCataSale(s.id))) {
      npc.stock = npc.stock.filter(s => s && !isCataSale(s.id));
    }
    // strip floor-gated goods off old shelves too (deep-delve finds only)
    try {
      const gated = window.Items && window.Items.SURF_GATED_ALL;
      if (gated && gated.length && Array.isArray(npc.stock) && npc.stock.some(s => s && gated.includes(s.id))) {
        npc.stock = npc.stock.filter(s => s && !gated.includes(s.id));
      }
    } catch (e) { }
    // strip dimension-exclusive goods off old shelves too (hell-only
    // oblivion, heaven-boss-only dawnstone)
    try {
      const I = window.Items;
      if (I && typeof I.isHellOnly === "function" && Array.isArray(npc.stock) && npc.stock.some(s => s && (I.isHellOnly(s.id) || I.isDawnstone(s.id)))) {
        npc.stock = npc.stock.filter(s => s && !I.isHellOnly(s.id) && !I.isDawnstone(s.id));
      }
    } catch (e2) { }
    return npc;
  }

  // ---- pricing ----
  function chaBuyMult(p) { try { return window.Items.priceMult(p); } catch (e) { return 1; } } // <1 when charming
  function loyaltyDisc(npc) { return 1 - Math.min(0.15, ((npc.loyalty || 0) * 0.0015)); }
  function ask(npc, id, player) {
    const line = (npc.stock || []).find(s => s.id === id);
    const list = line ? line.price : Math.max(1, Math.round(basePrice(id) * markup(npc.role, id)));
    return Math.max(1, Math.round(list * chaBuyMult(player) * loyaltyDisc(npc)));
  }
  function wantMult(role, id) {
    const t = itemType(id);
    if (role === "merchant" || role === "guildmaster" || role === "harbormaster") return 1.0;
    if (role === "monarch" || role === "noble" || role === "chancellor" || role === "magistrate") return t === "consumable" ? 0.9 : 0.6;
    if (role === "knight" || role === "marshal") return (t === "consumable" || t === "equipment") ? 0.8 : 0.5;
    if (role === "dockworker" || role === "desert_nomad" || role === "steppe_rider") return (t === "material" || t === "consumable") ? 0.9 : 0.55;
    if (role === "mesa_shaman" || role === "frost_skald" || role === "highpriest") return (t === "consumable" || t === "material" || t === "spellbook") ? 1.0 : 0.6;
    if (role === "blacksmith" || role === "runesmith") return t === "equipment" ? 1.0 : t === "material" ? 0.85 : 0.5;
    if (role === "healer" || role === "priest" || role === "cleric") return (t === "consumable" || t === "material" || t === "spellbook") ? 1.0 : 0.6;
    if (role === "herbalist") return (t === "material" || t === "consumable") ? 1.0 : 0.5;
    if (role === "innkeeper") return t === "equipment" ? 0.5 : 0.9;
    if (role === "hunter") return (t === "material" || id === "oak_bow") ? 0.9 : 0.55;
    if (role === "scholar") return t === "spellbook" ? 1.1 : t === "material" ? 0.9 : t === "consumable" ? 0.8 : 0.5;
    if (role === "miner") return t === "material" ? 1.0 : 0.6;
    if (role === "fisher" || role === "tidewarden" || role === "farmer") return t === "equipment" ? 0.5 : 0.9;
    if (role === "guard" || role === "samurai") return (t === "consumable" || t === "equipment") ? 0.8 : 0.5;
    if (role === "ninja") return (t === "consumable" || t === "equipment") ? 0.8 : 0.5;
    if (role === "thief") return (t === "material" || t === "consumable") ? 0.9 : 0.55;
    return 0.6;
  }
  // Most the NPC will pay the player for one unit.
  function bid(npc, id, player) {
    const saleBoost = 1 / Math.max(0.5, chaBuyMult(player));
    const loy = 1 + Math.min(0.2, ((npc.loyalty || 0) * 0.002));
    return Math.max(1, Math.round(basePrice(id) * 0.45 * wantMult(npc.role, id) * saleBoost * loy));
  }
  // Haggle bands for the CURRENT player/npc state.
  function minAsk(npc, id, player) {
    const a = ask(npc, id, player);
    const give = Math.max(0.72, 0.95 - ((npc.loyalty || 0) * 0.0012) - ((1 - chaBuyMult(player)) * 0.5));
    return Math.max(1, Math.round(a * give));
  }
  function maxPay(npc, id, player) {
    const b = bid(npc, id, player);
    const stretch = Math.min(1.35, 1.08 + ((npc.loyalty || 0) * 0.0012) + ((1 - chaBuyMult(player)) * 0.4));
    return Math.max(1, Math.round(b * stretch));
  }

  // ---- memory: every CONDUCTED trade is written to CONVERSATION MEMORY ----
  // (Shop ledger lines). Called from buy/sell so panel-button deals are
  // remembered too, not just chat-typed ones. Cap mirrors chat tail (14).
  function logLedger(npc, line) {
    try {
      npc.memories = npc.memories || { summary: "", tail: [] };
      const clean = String(line || "").replace(/^\*+|\*+$/g, "").trim().slice(0, 220);
      if (!clean) return;
      npc.memories.tail.push(`Shop ledger: ${clean}`);
      if (npc.memories.tail.length > 14) npc.memories.tail = npc.memories.tail.slice(-14);
    } catch (e) { }
  }
 // Pre-response trade DECISION (memory-driven, runs before the AI replies):
 // the NPC looks at its own memory (loyalty + how often this traveler has
 // pleaded) and decides whether to concede on the focused item. A concession
 // lowers the pending deal to a new exact price (game-side, never by the AI)
 // and returns a DECISION summary the reply must echo exactly.
 function decideConcession(player, npc, focus) {
   try {
     ensure(npc);
     if (!focus || !focus.id) return { changed: false };
     const side = focus.side, id = focus.id, n = Math.max(1, focus.n | 0);
     npc.hagglePleas = (npc.hagglePleas | 0) + 1;
     const loyal = npc.loyalty | 0;
     const regular = loyal >= 20, nag = npc.hagglePleas >= 2;
     if (!regular && !nag) return { changed: false }; // hold firm — no reason to bend yet
     if (side === "buy") {
       const line = (npc.stock || []).find(s => s.id === id);
       if (!line || line.n < 1) return { changed: false };
       const qty = Math.min(n, line.n);
       const a = ask(npc, id, player), floor = minAsk(npc, id, player);
       const base = (npc.deal && npc.deal.side === "buy" && npc.deal.id === id) ? npc.deal.price : a;
       const cut = 1 + Math.floor(loyal / 25) + (npc.hagglePleas >= 3 ? 1 : 0);
       const price = Math.max(floor, base - cut);
       if (price >= base) return { changed: false }; // already at the floor
        // PERMANENT shelf cut: lower the listed stock price itself so the
        // trades section shows the lowered price (not just the pending deal).
        try {
          const mult = Math.max(0.2, chaBuyMult(player) * loyaltyDisc(npc));
          const implied = Math.max(1, Math.round(price / mult));
          if (implied < line.price) line.price = implied;
        } catch (e2) { }
       npc.deal = { side: "buy", id, n: qty, price };
       try { window.World.saveNpc(npc); } catch (e) { }
       const why = regular ? `for loyal ${player.name} (${loyal}💛)` : `after being asked ${npc.hagglePleas}×`;
       logLedger(npc, `${npc.name} conceded ${qty}× ${itemName(id)} to ${price}g each ${why} (list ${a}g, floor ${floor}g).`);
       return {
         changed: true, price,
         sys: `*${npc.name} softens ${why}: ${qty}× ${itemName(id)} for ${price}g each. Say "deal" (or press Deal 🤝) to accept — or name another price.*`,
         extra: `(DECISION: you just cut ${itemName(id)} to ${price}g each ${why} (list ${a}g, floor ${floor}g — this is BINDING, already saved). State EXACTLY ${price}g warmly, remind them to say "deal". Never invent any other number.)`,
       };
     }
     // sell side: they want more for their goods — rise toward the ceiling
     const have = (() => { try { return window.Items.countItem(player, id); } catch (e) { return 0; } })();
     if (have < 1) return { changed: false };
     const qty = Math.min(n, have);
     const b = bid(npc, id, player), ceil = maxPay(npc, id, player);
     const base = (npc.deal && npc.deal.side === "sell" && npc.deal.id === id) ? npc.deal.price : b;
     const raise = 1 + Math.floor(loyal / 25) + (npc.hagglePleas >= 3 ? 1 : 0);
     const price = Math.min(ceil, base + raise);
     if (price <= base) return { changed: false }; // already at the ceiling
     if (goldOf(npc) < price * qty) return { changed: false }; // can't afford the kinder offer
     npc.deal = { side: "sell", id, n: qty, price };
     try { window.World.saveNpc(npc); } catch (e) { }
     const why = regular ? `for loyal ${player.name} (${loyal}💛)` : `after being asked ${npc.hagglePleas}×`;
     logLedger(npc, `${npc.name} raised the offer for ${qty}× ${itemName(id)} to ${price}g each ${why} (bid ${b}g, ceiling ${ceil}g).`);
     return {
       changed: true, price,
       sys: `*${npc.name} stretches ${why}: ${price}g each for your ${qty}× ${itemName(id)}. Say "deal" (or press Deal 🤝) to accept — or name another price.*`,
       extra: `(DECISION: you just raised your offer to ${price}g each ${why} (bid ${b}g, ceiling ${ceil}g — BINDING, already saved). State EXACTLY ${price}g warmly, remind them to say "deal". Never invent any other number.)`,
     };
   } catch (e) { return { changed: false }; }
 }
  // ---- memory-driven pre-reply analysis (runs on EVERY chat line) ----
  // Analyzes the message for quest/trade intent using conversation memory
  // (loyalty, past pleas, ledger, focus) and applies game-side changes
  // BEFORE the AI replies: sets the bargaining focus, lowers shelf prices /
  // pending deals, routes missed natural-language offers into proposeBuy /
  // proposeSell. Returns {tradeRelated, changed, sys, extra, logDone}.
  function plainName(id) {
    try { const it = window.Items && window.Items.ITEMS[id]; if (it && it.name) return String(it.name).toLowerCase(); } catch (e) { }
    return String(id || "").replace(/^tome_/, "").replace(/_/g, " ").toLowerCase();
  }
  function findMentionedItem(player, npc, text) {
    try {
      const t = String(text || "").toLowerCase();
      if (!t) return null;
      // Word-level matching: generic words like "sword" must hit "iron sword".
      // Score: full-name hit (longest wins) > distinctive single-word hit.
      const words = t.replace(/[^a-z0-9_ ]/g, " ").split(/\s+/).filter(w => w.length >= 3);
      const wordSet = new Set(words);
      const cands = [];
      const consider = (side, id, nm, alt) => {
        if (!id) return;
        if (nm && t.includes(nm)) { cands.push({ side, id, len: nm.length + 50 }); return; }
        if (alt && alt !== nm && t.includes(alt)) { cands.push({ side, id, len: alt.length + 50 }); return; }
        // single distinctive word of the name ("sword" in "iron sword")
        const parts = String(nm || "").split(/\s+/).filter(w => w.length >= 4);
        for (const w of parts) {
          if (wordSet.has(w)) { cands.push({ side, id, len: w.length }); break; }
        }
      };
      try {
        for (const s of (npc.stock || [])) {
          if (!s || !s.id || (s.n | 0) <= 0) continue;
          const nm = plainName(s.id);
          const alt = String(s.id).replace(/_/g, " ").toLowerCase();
          consider("buy", s.id, nm, alt);
        }
      } catch (e) { }
      try {
        const seen = {};
        for (const s of (player.inventory || [])) {
          if (!s || !s.id || seen[s.id]) continue;
          seen[s.id] = 1;
          try { if (window.Items.countItem(player, s.id) < 1) continue; } catch (e) { }
          if (cands.some(c => c.id === s.id)) continue;
          const nm = plainName(s.id);
          const alt = String(s.id).replace(/_/g, " ").toLowerCase();
          const before = cands.length;
          consider("sell", s.id, nm, alt);
          // pack-side hits score slightly lower so shelf names win ties
          if (cands.length > before) cands[cands.length - 1].len -= 0.5;
        }
      } catch (e) { }
      if (!cands.length) return null;
      cands.sort((a, b) => b.len - a.len);
      return cands[0];
    } catch (e) { return null; }
  }
  function isPleaText(t) {
    return /cheap|discount|lower|best price|too (?:expensive|pricey|much)|too rich|can'?t afford|cannot afford|can'?t pay|broke|poor|please|beg|favor|favour|friend|bargain|haggle|cut me|do better|come down|reduce|any room|wiggle|kindness|help me out|lower the price|go lower/i.test(String(t || ""));
  }
  function isTradeTalkText(t) {
    const s = String(t || "");
    if (/price|cost|gold|coin|cheap|discount|lower|deal|offer|bid|\bbuy\b|\bsell\b|trade|wares|goods|shop|stock|how much|worth|afford|purse|expensive|broke|bargain|haggle/i.test(s)) return true;
    if (isPleaText(s)) return true;
    if (/\d/.test(s)) return true; // bare numbers are offers on the focus item
    return false;
  }
  function inferSide(player, npc, id, text, fallback) {
    const t = String(text || "").toLowerCase();
    // Direction signals — "give me X" / "sell me X" means the player wants
    // the NPC's goods (BUY), while "my X" / "take my X" / "pay me" means
    // the player offers their own (SELL). SELL signals run FIRST: "give me"
    // also appears inside "what'll you give me for MY herbs", and "how much"
    // appears inside "how much will you PAY" — the payment direction wins.
    let hasIt = false, hasStock = false;
    try { hasIt = (window.Items.countItem(player, id) | 0) > 0; } catch (e) { }
    try { hasStock = (npc.stock || []).some(s => s.id === id && (s.n | 0) > 0); } catch (e) { }
    // The NPC is the one paying ("you pay", "pay me", "you offer", or
    // "what will you give me FOR [my] X"). Plain "give me X" stays a BUY
    // request — it is handled below.
    if (/you\s+(will\s+|would\s+)?(pay|offer)\b|pay\s+(me|more)\b/i.test(t)) {
      if (hasIt || !hasStock) return "sell";
    }
    if (/give\s+me\s+for\s+(my\b)?/i.test(t)) {
      if (hasIt || !hasStock) return "sell";
    }
    // The player offers their own goods ("my X", "take my X", "I sell").
    if (/\bmy\b|take my|buy my|from me|\bi sell\b|i(?:'m| am) selling/i.test(t)) {
      if (hasIt) return "sell";
    }
    // Explicit BUY requests win next — even if the player happens to hold one.
    if (/give me|sell me|can you give|can i (have|buy)|do you have|i(?:'ll| will) buy/i.test(t)) {
      if (hasStock) return "buy";
    }
    if (/pay\s+(me|more)|take my|buy my|from me|i have|i(?:'ve| have) got|\bsell\b/i.test(t)) {
      if (hasIt) return "sell";
    }
    if (/buy|your|shop|stock|how much|what.*(?:cost|price)/i.test(t)) {
      if (hasStock) return "buy";
    }
    try {
      if (hasStock && !hasIt) return "buy";
      if (hasIt && !hasStock) return "sell";
    } catch (e) { }
    if (fallback && (fallback === "buy" || fallback === "sell")) return fallback;
    return "buy";
  }
  // ---- shared trade-intent executor (single game-side brain) ----
  // Both the AI classifier and the regex fallback parse a chat line into an
  // intent {side, id, qty, offerEach, plea, focusSet} and run it HERE, so
  // natural language and strict commands behave identically. Never invents
  // prices — every NPC number comes from ask()/bid()/minAsk()/maxPay() or
  // propose*(). `raw` is only read for kindness flavor ("please", "thanks").
  async function executeTradeIntent(player, npc, it, raw) {
    try { if (doppelTradeTrip(player, npc)) return { tradeRelated: true, changed: true, logDone: true, sys: `*🦷 ${npc.name} was teeth all along!*`, extra: `(DECISION: doppelganger revealed — no trade, fight!)` }; } catch (e) { }
    const side = it.side, qty = Math.max(1, Math.min(99, it.qty | 0 || 1));
    const focusSet = !!it.focusSet;
    try {
      // 1) OFFERS ("would you take 18 for the potion?", "my herb for 15?").
      if (it.offerEach != null) {
        const offer = it.offerEach, q2 = qty;
        try {
          if (side === "buy") {
            const r = await proposeBuy(player, npc, it.id, q2, offer);
            if (r && r.decision === "accept") return { tradeRelated: true, changed: true, logDone: false, sys: `*${r.msg}*`, extra: `(DECISION: deal CLOSED at their offer: ${r.msg} Be warm about it.)` };
            if (r && r.decision === "counter") {
              const nm = plainName(it.id);
              return { tradeRelated: true, changed: true, logDone: false, sys: `*${npc.name} counters: ${q2}× ${nm} for ${r.price}g each. Say "deal" (or press Deal 🤝) to accept — or name another price.*`, extra: `(DECISION: you countered at EXACTLY ${r.price}g each for ${q2}× ${nm} (BINDING pending deal, already saved). State EXACTLY ${r.price}g warmly, remind them to say "deal". Never invent another number.)` };
            }
            if (r) return { tradeRelated: true, changed: !!npc.deal, logDone: false, sys: `*${r.msg}*`, extra: `(DECISION: their offer fails: ${r.msg}. Decline in character, name your real price.)` };
          } else {
            const r = await proposeSell(player, npc, it.id, q2, offer);
            if (r && r.decision === "accept") return { tradeRelated: true, changed: true, logDone: false, sys: `*${r.msg}*`, extra: `(DECISION: deal CLOSED at their ask: ${r.msg} Be warm about it.)` };
            if (r && r.decision === "counter") {
              const nm = plainName(it.id);
              return { tradeRelated: true, changed: true, logDone: false, sys: `*${npc.name} counters: ${r.price}g each for your ${q2}× ${nm}. Say "deal" (or press Deal 🤝) to accept — or name another price.*`, extra: `(DECISION: you countered at EXACTLY ${r.price}g each for ${q2}× ${nm} (BINDING pending deal, already saved). State EXACTLY ${r.price}g warmly, remind them to say "deal". Never invent another number.)` };
            }
            if (r) return { tradeRelated: true, changed: !!npc.deal, logDone: false, sys: `*${r.msg}*`, extra: `(DECISION: their ask fails: ${r.msg}. Decline in character, name your real price.)` };
          }
        } catch (e) { }
      }
      // 2) Price pleas / poverty ("lower the potion?", "too expensive", "I'm broke"):
      // memory (loyalty + past pleas + kindness + affordability) decides.
      if (it.plea || isPleaText(raw) || /lower|cheaper|discount|best price|too much|too expensive|afford|broke|poor/i.test(String(raw || ""))) {
        npc.hagglePleas = (npc.hagglePleas | 0) + 1;
        const loyal = npc.loyalty | 0;
        const pleas = npc.hagglePleas | 0;
        const kind = /thank|please|kind|friend|love|great/i.test(String(raw || ""));
        if (side === "buy") {
          const line = (npc.stock || []).find(s => s.id === it.id);
          if (!line || (line.n | 0) < 1) {
            try { window.World.saveNpc(npc); } catch (e) { }
            return { tradeRelated: true, changed: focusSet, logDone: true, extra: `(DECISION: they plead about ${plainName(it.id)} but you are SOLD OUT. Say so plainly, offer an alternative from stock. Never invent stock.)` };
          }
          const q3 = Math.min(qty, line.n | 0);
          const a = ask(npc, it.id, player), floor = minAsk(npc, it.id, player);
          const broke = (goldOf(player) < a);
          const regular = loyal >= 10, nag = pleas >= 2, pity = broke && pleas >= 1, kindBonus = kind && loyal >= 5;
          if (!(regular || nag || pity || kindBonus)) {
            if (!npc.deal || npc.deal.id !== it.id || npc.deal.side !== "buy") npc.deal = { side: "buy", id: it.id, n: q3, price: a };
            try { window.World.saveNpc(npc); } catch (e) { }
            return { tradeRelated: true, changed: true, logDone: true,
              sys: `*${npc.name} holds firm: ${q3}× ${itemName(it.id)} for ${a}g each (lowest ${floor}g). Say "deal" (or press Deal 🤝) to take it — or name another price.*`,
              extra: `(DECISION: HOLD FIRM on ${plainName(it.id)} at EXACTLY ${a}g each (floor ${floor}g; loyalty ${loyal}, asked ${pleas}× — deal set at list, already saved). State EXACTLY ${a}g, remind them to say "deal". Never go below ${floor}g.)` };
          }
          const cut = 1 + Math.floor(loyal / 20) + (pleas >= 3 ? 1 : 0) + (kind ? 1 : 0);
          const base = (npc.deal && npc.deal.side === "buy" && npc.deal.id === it.id) ? npc.deal.price : a;
          const price = Math.max(floor, base - cut);
          if (price >= base) {
            if (!npc.deal || npc.deal.id !== it.id || npc.deal.side !== "buy") npc.deal = { side: "buy", id: it.id, n: q3, price: floor };
            try { window.World.saveNpc(npc); } catch (e) { }
            return { tradeRelated: true, changed: true, logDone: true,
              sys: `*${floor}g each is the lowest ${npc.name} can go for ${itemName(it.id)}. Say "deal" (or press Deal 🤝) to take it.*`,
              extra: `(DECISION: already at floor ${floor}g for ${plainName(it.id)} — cannot go lower (deal set at floor, already saved). State EXACTLY ${floor}g firmly, remind them to say "deal".)` };
          }
          try {
            const mult = Math.max(0.2, chaBuyMult(player) * loyaltyDisc(npc));
            const implied = Math.max(1, Math.round(price / mult));
            if (implied < line.price) line.price = implied;
          } catch (e) { }
          npc.deal = { side: "buy", id: it.id, n: q3, price };
          try { window.World.saveNpc(npc); } catch (e) { }
          const why = loyal >= 20 ? `for loyal ${player.name} (${loyal}💛)` : broke ? `taking pity (they hold ${goldOf(player)}g vs ${a}g)` : `after being asked ${pleas}×`;
          logLedger(npc, `${npc.name} conceded ${q3}× ${itemName(it.id)} to ${price}g each ${why} (list ${a}g, floor ${floor}g).`);
          return {
            tradeRelated: true, changed: true, logDone: true,
            sys: `*${npc.name} softens ${why}: ${q3}× ${itemName(it.id)} for ${price}g each. Say "deal" (or press Deal 🤝) to accept — or name another price.*`,
            extra: `(DECISION: you just cut ${itemName(it.id)} to ${price}g each ${why} (list ${a}g, floor ${floor}g — BINDING, shelf price lowered, already saved). State EXACTLY ${price}g warmly, remind them to say "deal". Never invent any other number.)`,
          };
        } else {
          let have = 0;
          try { have = window.Items.countItem(player, it.id) | 0; } catch (e) { }
          if (have < 1) {
            try { window.World.saveNpc(npc); } catch (e) { }
            return { tradeRelated: true, changed: focusSet, logDone: true, extra: `(DECISION: they plead about selling ${plainName(it.id)} but carry none. Say so plainly.)` };
          }
          const q3 = Math.min(qty, have);
          const b = bid(npc, it.id, player), ceil = maxPay(npc, it.id, player);
          const regular = loyal >= 10, nag = pleas >= 2, kindBonus = kind && loyal >= 5;
          if (!(regular || nag || kindBonus)) {
            if ((goldOf(npc) >= b * q3) && (!npc.deal || npc.deal.id !== it.id || npc.deal.side !== "sell")) npc.deal = { side: "sell", id: it.id, n: q3, price: b };
            try { window.World.saveNpc(npc); } catch (e) { }
            return { tradeRelated: true, changed: true, logDone: true,
              sys: `*${npc.name} holds firm: ${b}g each for your ${itemName(it.id)} (at most ${ceil}g). Say "deal" (or press Deal 🤝) to accept — or name another price.*`,
              extra: `(DECISION: HOLD FIRM buying ${plainName(it.id)} at EXACTLY ${b}g each (ceiling ${ceil}g; loyalty ${loyal} — deal set, already saved). State EXACTLY ${b}g, remind them to say "deal". Never exceed ${ceil}g.)` };
          }
          const raise = 1 + Math.floor(loyal / 20) + (pleas >= 3 ? 1 : 0) + (kind ? 1 : 0);
          const base = (npc.deal && npc.deal.side === "sell" && npc.deal.id === it.id) ? npc.deal.price : b;
          const price = Math.min(ceil, base + raise);
          if (price <= base || (goldOf(npc) < price * q3)) {
            if ((goldOf(npc) >= b * q3) && (!npc.deal || npc.deal.id !== it.id || npc.deal.side !== "sell")) npc.deal = { side: "sell", id: it.id, n: q3, price: b };
            try { window.World.saveNpc(npc); } catch (e) { }
            return { tradeRelated: true, changed: true, logDone: true,
              sys: `*${npc.name} cannot stretch past ${b}g each for your ${itemName(it.id)}. Say "deal" (or press Deal 🤝) to accept — or walk away.*`,
              extra: `(DECISION: cannot stretch past ${b}g for ${plainName(it.id)} (ceiling ${ceil}g, purse ${goldOf(npc)}g — deal set at bid when affordable, already saved). State EXACTLY ${b}g honestly, remind them to say "deal".)` };
          }
          npc.deal = { side: "sell", id: it.id, n: q3, price };
          try { window.World.saveNpc(npc); } catch (e) { }
          const why = loyal >= 20 ? `for loyal ${player.name} (${loyal}💛)` : `after being asked ${pleas}×`;
          logLedger(npc, `${npc.name} raised the offer for ${q3}× ${itemName(it.id)} to ${price}g each ${why} (bid ${b}g, ceiling ${ceil}g).`);
          return {
            tradeRelated: true, changed: true, logDone: true,
            sys: `*${npc.name} stretches ${why}: ${price}g each for your ${q3}× ${itemName(it.id)}. Say "deal" (or press Deal 🤝) to accept — or name another price.*`,
            extra: `(DECISION: you just raised your offer to ${price}g each ${why} (bid ${b}g, ceiling ${ceil}g — BINDING, already saved). State EXACTLY ${price}g warmly, remind them to say "deal". Never invent any other number.)`,
          };
        }
      }
      // 3) Price / stock questions ("how much for X?", "do you have X?", "what do you sell?"):
      // set a pending deal at the live price so "deal"/"yes" completes,
      // show the exact number in a sys bubble, and give the reply the numbers.
      if (side === "buy") {
        const line = (npc.stock || []).find(s => s.id === it.id);
        if (!line) {
          try { window.World.saveNpc(npc); } catch (e) { }
          return { tradeRelated: true, changed: focusSet, logDone: true, extra: `(DECISION: they ask about ${plainName(it.id)} but you don't carry it. Say so plainly, offer an alternative. Never invent stock.)` };
        }
        const a = ask(npc, it.id, player), floor = minAsk(npc, it.id, player);
        const q4 = Math.min(qty, line.n | 0);
        if (!npc.deal || npc.deal.id !== it.id || npc.deal.side !== "buy") npc.deal = { side: "buy", id: it.id, n: q4, price: a };
        try { window.World.saveNpc(npc); } catch (e) { }
        return { tradeRelated: true, changed: true, logDone: true,
          sys: `*${q4}× ${itemName(it.id)} for ${a}g each. Say "deal" (or press Deal 🤝) to buy — or name another price.*`,
          extra: `(DECISION: they ask about ${plainName(it.id)} — your price is EXACTLY ${a}g each (floor ${floor}g, ${line.n}× in stock — deal set, already saved). State EXACTLY ${a}g, remind them to say "deal". If they plead, you may concede toward ${floor}g per memory.)` };
      } else {
        let have = 0;
        try { have = window.Items.countItem(player, it.id) | 0; } catch (e) { }
        const b = bid(npc, it.id, player), ceil = maxPay(npc, it.id, player);
        if (have > 0 && (goldOf(npc) >= b) && (!npc.deal || npc.deal.id !== it.id || npc.deal.side !== "sell")) npc.deal = { side: "sell", id: it.id, n: Math.min(qty, have), price: b };
        try { window.World.saveNpc(npc); } catch (e) { }
        return { tradeRelated: true, changed: true, logDone: true,
          sys: `*${npc.name} will pay ${b}g each for your ${itemName(it.id)}. Say "deal" (or press Deal 🤝) to sell — or name another price.*`,
          extra: `(DECISION: they offer their ${plainName(it.id)} (they hold ${have}×) — you pay EXACTLY ${b}g each (ceiling ${ceil}g, purse ${goldOf(npc)}g — deal set when affordable, already saved). State EXACTLY ${b}g, remind them to say "deal". If they plead, you may stretch toward ${ceil}g per memory.)` };
      }
    } catch (e) { return { tradeRelated: false, changed: false }; }
  }
  // Main entry (regex fallback): analyze one chat line, mutate game state
  // first, describe the decision for the reply. Parses into an intent and
  // hands it to executeTradeIntent — the same brain the AI classifier feeds.
  async function decideMemoryTrade(player, npc, text) {
    try {
      ensure(npc);
      if (!player || !npc || !text) return { tradeRelated: false, changed: false };
      const raw = String(text);
      const t = raw.trim();
      if (!t) return { tradeRelated: false, changed: false };
      const mentioned = findMentionedItem(player, npc, raw);
      const focus = focusOf(npc);
      const tradeRe = isTradeTalkText(raw);
      if (!tradeRe && !mentioned) return { tradeRelated: false, changed: false };
      try { if (tradeRe && doppelTradeTrip(player, npc)) return { tradeRelated: true, changed: true, logDone: true, sys: `*🦷 ${npc.name} was teeth all along!*`, extra: `(DECISION: doppelganger revealed — no trade, fight!)` }; } catch (e) { }
      // Item word with no trade verbs (e.g. "I need herbs for a quest"):
      // pin it as focus so follow-ups ("cheaper?", "20?") resolve, but stay
      // out of the reply — the quest system owns this turn.
      if (!tradeRe && mentioned) {
        try {
          const qSide = inferSide(player, npc, mentioned.id, raw, mentioned.side || (focus && focus.side));
          const cur = focusOf(npc);
          if (!cur || cur.id !== mentioned.id || cur.side !== qSide) {
            setFocus(npc, qSide, mentioned.id, (focus && focus.id === mentioned.id && (focus.n | 0) > 0) ? focus.n : 1);
            try { window.World.saveNpc(npc); } catch (e2) { }
            return { tradeRelated: false, changed: true };
          }
        } catch (e2) { }
        return { tradeRelated: false, changed: false };
      }
      // Resolve which item is under discussion: explicit mention wins,
      // pronouns ("it/that") and bare numbers fall back to existing focus.
      let cand = null;
      if (mentioned) cand = mentioned;
      else if (focus && focus.id && (/^(it|that|this|them|the one|same one)\b/i.test(t) || /\b(it|that|this|them|the one|same one)\b/i.test(t) || /^\d+\s*(?:g(?:old)?)?\s*[?.!…]*$/.test(t) || isPleaText(t) || /\bdeal\b/i.test(t))) cand = { side: focus.side, id: focus.id };
      else if (focus && focus.id && tradeRe) cand = { side: focus.side, id: focus.id };
      if (!cand) {
        // Trade talk but no identifiable item: ask which goods they mean.
        // Still trade-related so the reply stays in trader character.
        return {
          tradeRelated: true, changed: false, logDone: true,
          extra: `(DECISION: they talk trade but name no clear item from your stock/pack. Ask WHICH item they mean and state you carry ${(npc.stock || []).slice(0, 4).map(s => plainName(s.id) + " " + ask(npc, s.id, player) + "g").join(", ") || "nothing right now"}. Never invent goods or prices.)`,
        };
      }
      const side = inferSide(player, npc, cand.id, raw, cand.side || (focus && focus.side));
      // Quantity: explicit "2x potion" / "2 potions" near the item, else focus qty, else 1.
      let qty = 1;
      try {
        const esc = plainName(cand.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const qm = new RegExp("(\\d+)\\s*[x×]?\\s*(?:" + esc + ")").exec(raw.toLowerCase());
        if (qm) qty = Math.max(1, parseInt(qm[1], 10));
        else if (focus && focus.id === cand.id && (focus.n | 0) > 0) qty = focus.n | 0;
      } catch (e) { }
      qty = Math.max(1, Math.min(99, qty | 0));
      // Always pin the focus so pronouns + bare numbers resolve next turn.
      let focusSet = false;
      try {
        const cur = focusOf(npc);
        if (!cur || cur.id !== cand.id || cur.side !== side || (cur.n | 0) !== qty) {
          setFocus(npc, side, cand.id, qty);
          try { window.World.saveNpc(npc); } catch (e) { }
          focusSet = true;
        }
      } catch (e) { }
      // Hand the parsed intent to the shared executor — the same brain the
      // AI classifier feeds, so regex-parsed and AI-parsed lines behave
      // identically. Only genuine player offers set `offerEach` (a number
      // plus offer verbs); pleas and questions resolve inside the executor.
      let offerEach = null;
      {
        const nums = (raw.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => n > 0 && n < 100000);
        const hasOfferVerb = /take|offer|pay|give|for|how about|what about|about|would you|will you|deal|sound|accept|fine/i.test(raw);
        if (nums.length && hasOfferVerb && !/^(buy|sell|offer|bid)\b/i.test(t)) {
          offerEach = nums[nums.length - 1];
          if (nums.length >= 2) {
            // "2 potions for 30": first number is qty, last is price.
            const firstAtQty = new RegExp("^\\s*" + nums[0] + "\\s*[x×]?\\s+").test(t) || new RegExp("\\b" + nums[0] + "\\s*[x×]?\\s+" + plainName(cand.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(raw.toLowerCase());
            if (firstAtQty) qty = Math.max(1, Math.min(99, nums[0] | 0));
          }
        }
      }
      const plea = isPleaText(raw) || /lower|cheaper|discount|best price|too much|too expensive|afford|broke|poor/i.test(raw);
      return executeTradeIntent(player, npc, { side, id: cand.id, qty, offerEach, plea, focusSet }, raw);
    } catch (e) { return { tradeRelated: false, changed: false }; }
  }
  // Explicit side signals in a raw line — "my", "give/sell/take/buy me",
  // "pay me", "you pay", or a bare buy/sell/offer/bid verb. When NONE of
  // these is present, the line is pronoun-like ("take 24 for it", "how about
  // 20?") and inherits the side already under discussion.
  function hasExplicitSideSignal(raw) {
    return /\bmy\b|give me|sell me|take my|buy my|pay me|you pay|\b(buy|sell|offer|bid)\b/i.test(String(raw || ""));
  }
  // ---- AI-classified intent: validate + apply ----
  // The AI (ai_director.classifyTradeIntent) decides WHAT the player meant:
  // item, side, quantity, offered price, plea, accept. Everything the game
  // DOES with that decision runs through the same validated executor above,
  // so the AI can never invent items, prices, or stock. Returns `fallback:true`
  // when the intent doesn't validate — the caller then runs the regex path.
  function validateAiIntent(player, npc, intent) {
    try {
      if (!intent || typeof intent !== "object") return null;
      const id = String(intent.item || "").trim();
      if (!id) return null;
      let hasStock = false, hasIt = false;
      try { hasStock = (npc.stock || []).some(s => s && s.id === id && (s.n | 0) > 0); } catch (e) { }
      try { hasIt = (window.Items.countItem(player, id) | 0) > 0; } catch (e) { }
      if (!hasStock && !hasIt) return null; // invented or unavailable item
      let side = intent.side === "sell" ? "sell" : intent.side === "buy" ? "buy" : null;
      if (side === "buy" && !hasStock) side = hasIt ? "sell" : null;
      if (side === "sell" && !hasIt) side = hasStock ? "buy" : null;
      if (!side) side = hasStock ? "buy" : "sell";
      let qty = parseInt(intent.qty, 10);
      if (!(qty > 0)) qty = 1;
      qty = Math.max(1, Math.min(99, qty));
      let offerEach = intent.offer_each != null ? Math.round(Number(intent.offer_each)) : null;
      if (!(offerEach > 0) || offerEach >= 100000) offerEach = null;
      return { side, id, qty, offerEach, plea: !!intent.plea, accept: !!intent.accept };
    } catch (e) { return null; }
  }
  async function applyAiIntent(player, npc, raw, intent) {
    try {
      ensure(npc);
      try { if (doppelTradeTrip(player, npc)) return { tradeRelated: true, changed: true, logDone: true, sys: `*🦷 ${npc.name} was teeth all along!*`, extra: `(DECISION: doppelganger revealed — no trade, fight!)` }; } catch (e) { }
      if (!player || !npc || intent == null) return { tradeRelated: false, changed: false, fallback: true };
      const clean = validateAiIntent(player, npc, intent);
      if (!clean) return { tradeRelated: false, changed: false, fallback: true };
      // Focus-side guard: the line refers to the SAME item already under
      // discussion but carries no explicit side signal ("take 24 for it",
      // "how about 20?") — inherit the focused side instead of trusting a
      // flipped AI guess. Lines that name a different item or carry an
      // explicit signal ("my", "give me", buy/sell verbs) keep the AI side.
      try {
        const f = focusOf(npc);
        if (f && f.id && clean.id === f.id && clean.side !== f.side && !hasExplicitSideSignal(raw)) {
          clean.side = f.side;
        }
      } catch (e) { }
      // AI says: not trade (quest delivery, party talk, rumor...). Mirror the
      // regex quest-pin: remember the item as focus, stay out of the reply.
      if (!intent.trade_related) {
        try {
          const cur = focusOf(npc);
          if (!cur || cur.id !== clean.id || cur.side !== clean.side) {
            setFocus(npc, clean.side, clean.id, clean.qty);
            try { window.World.saveNpc(npc); } catch (e2) { }
            return { tradeRelated: false, changed: true };
          }
        } catch (e2) { }
        return { tradeRelated: false, changed: false };
      }
      // Pin the focus so pronouns + bare numbers resolve next turn.
      let focusSet = false;
      try {
        const cur = focusOf(npc);
        if (!cur || cur.id !== clean.id || cur.side !== clean.side || (cur.n | 0) !== clean.qty) {
          setFocus(npc, clean.side, clean.id, clean.qty);
          try { window.World.saveNpc(npc); } catch (e) { }
          focusSet = true;
        }
      } catch (e) { }
      // AI-accepted pending deal: only honored when a real deal is pending.
      if (clean.accept && npc.deal) {
        const r = await acceptDeal(player, npc);
        try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e2) { }
        return { tradeRelated: true, changed: true, logDone: false,
          sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`,
          extra: r.ok ? `(DECISION: deal CLOSED: ${r.msg} Be warm about it.)` : `(DECISION: the deal fell through: ${r.msg}.)` };
      }
      return executeTradeIntent(player, npc, { side: clean.side, id: clean.id, qty: clean.qty, offerEach: clean.offerEach, plea: clean.plea, focusSet }, String(raw == null ? "" : raw));
    } catch (e) { return { tradeRelated: false, changed: false, fallback: true }; }
  }
  // ---- bargaining focus: what item is under discussion ("it", "that", bare numbers) ----
  function setFocus(npc, side, id, n) {
    try { npc.barter = { side, id, n: Math.max(1, n | 0) }; } catch (e) { }
  }
  function focusOf(npc) {
    if (npc && npc.deal) return { side: npc.deal.side, id: npc.deal.id, n: npc.deal.n };
    if (npc && npc.barter && npc.barter.id) return npc.barter;
    return null;
  }
  async function persist(npc, player) {
    try { await window.World.saveNpc(npc); } catch (e) { }
    try { await window.Game.saveGame(true); } catch (e) { }
    try { window.UI.updateHUD(); } catch (e) { }
  }
  function cleanHotbar(player) {
    try {
      let dirty = false;
      for (let i = 0; i < (player.hotbar || []).length; i++) {
        const s = player.hotbar[i];
        if (s && s.kind === "item" && window.Items.countItem(player, s.id) < 1) { player.hotbar[i] = null; dirty = true; }
      }
      if (dirty) {
        try { if (player && player.kind === "player" && window.Items && window.Items.syncPlayerAttackWeapon) window.Items.syncPlayerAttackWeapon(player); } catch (e2) {}
        try { window.UI.updateHotbar(); } catch (e) { }
      }
    } catch (e) { }
  }
  function bump(npc, n) { npc.loyalty = Math.min(1000, (npc.loyalty || 0) + n); }
  function doppelTradeTrip(player, npc) {
    try {
      if (!npc || !npc.isDoppelganger) return false;
      // revealed teeth never trade either — refuse outright (no re-reveal)
      if (npc.doppelRevealed) return true;
      if (npc.role === "slave" || npc.noLoyalty || npc.slave) return false;
      if (window.Game && window.Game.doppelRevealAmbush) {
        try { window.Game.doppelRevealAmbush(npc, { bite: true }); } catch (e) { }
      }
      return true;
    } catch (e) { return false; }
  }
  // Player buys n units from NPC stock at `each` gold (validated path).
  async function buy(player, npc, id, n, each) {
    ensure(npc);
    if (doppelTradeTrip(player, npc)) return { ok: false, msg: `🦷 ${npc.name} was teeth all along!` };
    if (isCataSale(id)) return { ok: false, msg: `🔒 ${itemName(id)} is sealed deep-delve lore — never sold, only found (depth 5+ chests, deep boss hoards).` };
    if (isGatedSale(id)) return { ok: false, msg: `🔒 ${itemName(id)} is a deep-delve find — never sold. Delve floor 5+ (mythril band) / 11+ (dragon band) or never.` };
    n = toCount(n);
    each = Math.max(1, Math.round(Number(each) || 0) || 1);
    const line = (npc.stock || []).find(s => s.id === id);
    if (!line || line.n < n) return { ok: false, msg: `${npc.name} hasn't got that${line ? ` (only ${line.n}×)` : ""}.` };
    // sealed war-spoils: rare forge stock is not for sale until dungeon
    // bosses have fallen (covers old stock too, not just new rolls)
    try {
      const need = window.Items && window.Items.matLocked ? window.Items.matLocked(player, id) : 0;
      if (need) return { ok: false, msg: `🔒 ${itemName(id)} is sealed war-spoils — ${npc.name} will only sell it after you slay a dungeon boss of level ${need}+ (strongest so far: lv${toGold(player.bestBossLv) || 0}).` };
    } catch (e) { }
    const total = each * n;
    if (goldOf(player) < total) return { ok: false, msg: `You need ${total} gold.` };
    player.gold = goldOf(player) - total; npc.gold = goldOf(npc) + total;
    line.n -= n;
    if (line.n <= 0) npc.stock = npc.stock.filter(s => s !== line);
    window.Items.addItem(player, id, n);
    npc.deal = null; setFocus(npc, "buy", id, n); bump(npc, 1);
    try { npc.lastTrade = { side: "buy", id, n, price: each }; } catch (e2) { }
    logLedger(npc, `${player.name} bought ${n}× ${itemName(id)} for ${total}g (${each}g each).`);
    await persist(npc, player);
    try { window.Sfx.coin(); } catch (e) { }
    try { if (window.Game && window.Game.announceLoot) window.Game.announceLoot("🛒 Bought", 0, [{ id, n }]); } catch (e) { }
    return { ok: true, msg: `Bought ${n}× ${itemName(id)} for ${total}g.`, total };
  }
  // Player sells n units of own inventory to NPC at `each` gold (validated path).
  async function sell(player, npc, id, n, each) {
    ensure(npc);
    if (doppelTradeTrip(player, npc)) return { ok: false, msg: `🦷 ${npc.name} was teeth all along!` };
    try {
      const it = window.Items && window.Items.ITEMS[id];
      if (it && (it.quest || it.type === "quest")) return { ok: false, msg: "That's bound to a quest — deliver it, don't sell it." };
    } catch (e) { }
    n = toCount(n);
    each = Math.max(1, Math.round(Number(each) || 0) || 1);
    try {
      if (window.Items.isEquipped(player, id)) return { ok: false, msg: "That's equipped — unequip it first (I → inventory)." };
    } catch (e) { }
    if (window.Items.countItem(player, id) < n) return { ok: false, msg: `You only have ${window.Items.countItem(player, id)}×.` };
    const total = each * n;
    if (goldOf(npc) < total) return { ok: false, msg: `${npc.name} can't afford ${total}g (has ${goldOf(npc)}g). Offer less or sell fewer.` };
    if (!window.Items.removeItem(player, id, n)) return { ok: false, msg: "Hmm, that slipped away." };
    player.gold = goldOf(player) + total; npc.gold = Math.max(0, goldOf(npc) - total);
    // Sealed lore never enters a shop shelf: the NPC pays the buyback, but
    // the tome leaves the world instead of being resold. Deep-delve gated
    // finds (mythril/dragon bands) never shelve either.
    if (!isCataSale(id) && !isGatedSale(id)) {
      const line = (npc.stock || []).find(s => s.id === id);
      if (line) line.n += n;
      else npc.stock.push({ id, n, price: Math.max(1, Math.round(basePrice(id) * markup(npc.role, id))) });
    }
    npc.deal = null; setFocus(npc, "sell", id, n); bump(npc, 1);
    try { npc.lastTrade = { side: "sell", id, n, price: each }; } catch (e2) { }
    logLedger(npc, `${player.name} sold ${n}× ${itemName(id)} for ${total}g (${each}g each).`);
    cleanHotbar(player);
    await persist(npc, player);
    try { window.Sfx.coin(); } catch (e) { }
    return { ok: true, msg: `Sold ${n}× ${itemName(id)} for ${total}g.`, total };
  }
  // Player proposes to BUY id×n for `offer` each. Returns {decision:'accept'|'counter'|'refuse', ...}.
  async function proposeBuy(player, npc, id, n, offer) {
    ensure(npc);
    if (doppelTradeTrip(player, npc)) return { decision: "refuse", msg: `🦷 teeth!` };
    if (isCataSale(id)) return { decision: "refuse", msg: `🔒 ${itemName(id)} is sealed deep-delve lore — never sold, only found (depth 5+ chests, deep boss hoards).` };
    if (isGatedSale(id)) return { decision: "refuse", msg: `🔒 ${itemName(id)} is a deep-delve find — never sold. Delve floor 5+ (mythril band) / 11+ (dragon band) or never.` };
    n = toCount(n); offer = Math.max(1, Math.round(Number(offer) || 0) || 1);
    setFocus(npc, "buy", id, n);
    const line = (npc.stock || []).find(s => s.id === id);
    if (!line || line.n < n) return { decision: "refuse", msg: `${npc.name} hasn't got that${line ? ` (only ${line.n}×)` : ""}.` };
    try {
      const need = window.Items && window.Items.matLocked ? window.Items.matLocked(player, id) : 0;
      if (need) return { decision: "refuse", msg: `🔒 ${itemName(id)} is sealed war-spoils — slay a dungeon boss of level ${need}+ first.` };
    } catch (e) { }
    if (goldOf(player) < offer * n) return { decision: "refuse", msg: `You haven't got ${offer * n} gold.` };
    const floor = minAsk(npc, id, player);
    const a = ask(npc, id, player);
    // Over-offers pay the fair asking price, not the inflated bid (the
    // surplus used to vanish into the NPC's purse).
    if (offer >= a) return { decision: "accept", ...(await buy(player, npc, id, n, a)) };
    if (offer >= Math.round(floor * 0.9)) {
     const counter = Math.max(floor, Math.round((offer + a) / 2));
     npc.deal = { side: "buy", id, n, price: counter };
     try { await window.World.saveNpc(npc); } catch (e) { }
     return { decision: "counter", price: counter, msg: `counter:${counter}` };
   }
   // Insulting offer: hold firm at the floor AND leave it as the pending deal,
   // so "deal" / panel Deal executes at exactly the spoken number.
   npc.deal = { side: "buy", id, n, price: floor };
   try { await window.World.saveNpc(npc); } catch (e) { }
   return { decision: "counter", price: floor, firm: true, msg: `counter:${floor}` };
 }
  // Player proposes to SELL id×n for `want` each.
  async function proposeSell(player, npc, id, n, want) {
    ensure(npc);
    if (doppelTradeTrip(player, npc)) return { decision: "refuse", msg: `🦷 teeth!` };
    n = toCount(n); want = Math.max(1, Math.round(Number(want) || 0) || 1);
    setFocus(npc, "sell", id, n);
    if (window.Items.countItem(player, id) < n) return { decision: "refuse", msg: `You only have ${window.Items.countItem(player, id)}×.` };
    const ceil = maxPay(npc, id, player);
    const b = bid(npc, id, player);
    if (goldOf(npc) < want * n) return { decision: "refuse", msg: `purse:${goldOf(npc)}` };
    // Under-asks are paid the fair bid, not the lowballed want (the
    // difference used to vanish from the player's purse).
    if (want <= b) return { decision: "accept", ...(await sell(player, npc, id, n, b)) };
    if (want <= Math.round(ceil * 1.12)) {
      const counter = Math.min(ceil, Math.round((want + b) / 2));
      if (goldOf(npc) < counter * n) return { decision: "refuse", msg: `purse:${goldOf(npc)}` };
      npc.deal = { side: "sell", id, n, price: counter };
      try { await window.World.saveNpc(npc); } catch (e) { }
      return { decision: "counter", price: counter, msg: `counter:${counter}` };
    }
    // Sky-high ask: hold firm at the ceiling AND leave it as the pending deal,
    // so "deal" / panel Deal executes at exactly the spoken number.
    npc.deal = { side: "sell", id, n, price: ceil };
    try { await window.World.saveNpc(npc); } catch (e) { }
    return { decision: "counter", price: ceil, firm: true, msg: `counter:${ceil}` };
  }
  async function acceptDeal(player, npc) {
    ensure(npc);
    if (doppelTradeTrip(player, npc)) return { ok: false, msg: `🦷 ${npc.name} was teeth all along!` };
    const d = npc.deal;
    if (!d) return { ok: false, msg: "No pending deal." };
    // Re-validate the pending price against live floors/ceilings: loyalty or
    // level shifts since the deal was struck must not lock in a stale price.
    try {
      if (d.side === "buy") {
        const floor = minAsk(npc, d.id, player), a = ask(npc, d.id, player);
        const price = Math.max(floor, Math.min(a, Math.round(Number(d.price) || 0) || a));
        return buy(player, npc, d.id, d.n, price);
      }
      const ceil = maxPay(npc, d.id, player), b = bid(npc, d.id, player);
      const price = Math.max(b, Math.min(ceil, Math.round(Number(d.price) || 0) || b));
      return sell(player, npc, d.id, d.n, price);
    } catch (e) {
      if (d.side === "buy") return buy(player, npc, d.id, d.n, d.price);
      return sell(player, npc, d.id, d.n, d.price);
    }
  }
 function declineDeal(npc) { if (npc) { npc.deal = null; try { window.World.saveNpc(npc); } catch (e) { } } }

  return {
    basePrice, itemType, itemName, isCataSale, ensure, genGold, genStock, focusOf,
    ask, bid, minAsk, maxPay, buy, sell, proposeBuy, proposeSell, acceptDeal, declineDeal,
    logLedger, decideConcession, decideMemoryTrade, applyAiIntent, executeTradeIntent, findMentionedItem, isTradeTalkText,
  };
})();
