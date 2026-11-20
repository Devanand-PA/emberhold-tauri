/* Shops: markets, smithies, tea houses, libraries, dojos, black markets, arcane circles.
   window.Shops — v12 shop/menu + base-placement system.

   - Settlement shops are building furniture nexuses (counter/table/rack/mat etc).
     E on the nexus opens a two-pane trade menu (shop stock left, player pack
     right) with per-kind tabs and price/name sorting. Markets sell cheaper
     than NPCs and buy fairer, with unlimited supply; smithies sell low-tier
     arms/armor and buy high-tier gear; tea houses add food/drink stock;
     libraries sell low-mid spell tomes.
   - Dojo refunds stat points (1000g each). Black market sells drugs (temp
     buffs for HP/MP/stamina), low-level tamable beasts (priced by stats/level,
     sellable, counts as tamed) and low-level slave NPCs (no loyalty, party friend slots never beast slots, breedable
     in beast lodges, never counts for taming skills). Arcane shop enchants any
     non-enchanted weapon (price by tier x enchant strength).
   - Base crafting: brick walls / doors / windows / home portals are crafted
     (Inventory) then Used to target a walkable tile. They bake into chunk
     tiles + wallHP/POI stores, so solidity, rendering, smash damage and saves
     all work through the existing tile machinery. Only destruction removes them.
   - Permissions: the capital King sells market/smith/dojo/arcane/stable charters
     as placeable items; placed stalls are consumed, 1-tile HOUSEWALL shops with
     a shopStalls record, breakable by players and mobs like any wall.
*/
window.Shops = (() => {
  const T = () => window.CFG.T;
  // building class -> shop kind
  const CLASS_SHOP = {
    market: "market", grand_bazaar: "market", souk_stall: "market", fish_market: "market", sunlit_market: "market",
    turquoise_shop: "market", shop: "market", counting_house: "market",
    forge: "smith", forge_works: "smith", great_forge: "smith", smithy_shed: "smith", bronze_forge: "smith", dawn_smithy: "smith", dawn_forge: "smith",
    tea_house: "tea", caravanserai: "tea", tavern_hall: "tea",
    library: "library", bookstore: "library", dawn_library: "library",
    dojo: "dojo",
    black_market: "blackmarket",
    arcane_shop: "arcane",
    grand_castle: "court", castle_keep: "court", palace: "court",
  };
  // player-placed stall tile -> shop kind
  const STALL_SHOP = {
    permit_market: "market", permit_blacksmith: "smith", permit_dojo: "dojo",
    permit_arcane: "arcane", permit_stable: "stable",
  };
  const SHOP_TITLE = {
    market: "🏪 Market", smith: "⚒️ Blacksmith", tea: "🍵 Tea House",
    library: "📚 Library", dojo: "🥋 Dojo", blackmarket: "🌑 Black Market",
    arcane: "✨ Arcane Shop", stable: "🐴 Stable Pen", court: "👑 Royal Court",
  };
  function shopKindForBuilding(b) {
    try {
      if (!b) return null;
      if (b.classKey && CLASS_SHOP[b.classKey]) return CLASS_SHOP[b.classKey];
      if (b.stallKind && STALL_SHOP[b.stallKind]) return STALL_SHOP[b.stallKind];
    } catch (e) {}
    return null;
  }
  // ---- pricing: shops undercut NPCs and pay fairer ----
  function basePrice(id) { try { return window.Trade.basePrice(id); } catch (e) { return 10; } }
  function sellMult(kind) {
    if (kind === "market") return 0.85;
    if (kind === "smith") return 0.9;
    if (kind === "tea") return 0.9;
    if (kind === "library") return 0.9;
    if (kind === "blackmarket") return 1.1;
    if (kind === "arcane") return 1.0;
    if (kind === "temple") return 1.0;
    if (kind === "lodge") return 0.9;
    return 0.9;
  }
  function buyMult(kind) {
    if (kind === "market") return 0.7;
    if (kind === "smith") return 0.65;
    if (kind === "tea") return 0.6;
    if (kind === "library") return 0.6;
    if (kind === "blackmarket") return 0.6;
    return 0.6;
  }
  function askPrice(kind, id) { return Math.max(1, Math.round(basePrice(id) * sellMult(kind))); }
  function bidPrice(kind, id) { return Math.max(1, Math.round(basePrice(id) * buyMult(kind))); }

  // ---- shop stocks (unlimited supply: buys never decrement) ----
  const MARKET_STOCK = ["potion", "mana_potion", "antidote", "burn_salve", "warm_brew", "focus_tea", "clear_drops", "panacea_brew",
    "wood", "stone", "herb", "sage_herb", "cinder_herb", "calm_herb", "bright_herb",
    "iron_ore", "clay", "brick", "plank_bundle", "glass_pane", "quartz_crystal", "torch", "bomb", "smoke_bomb", "mercy_ring"];
  const SMITH_STOCK = ["rusted_sword", "rusted_dagger", "rusted_axe", "rusted_hammer", "rusted_spear",
    "iron_sword", "iron_dagger", "iron_axe", "iron_hammer", "iron_spear",
    "steel_sword", "steel_dagger", "steel_axe", "steel_hammer", "steel_spear",
    "wooden_buckler", "iron_shield", "steel_shield", "leather_armor", "iron_armor", "steel_plate",
    "iron_ore"];
  // beast-lodge tack list (no shop counter — sold through the lodge modal's
  // 🏹 Tack tab, so E on the breednexus still breeds): the three low-tier
  // whips (rusted, iron, steel) and the two low-tier bows (oak, yew), all at
  // 0.9x like the old smith prices — higher tiers stay loot/forge-only.
  const LODGE_STOCK = ["rusted_whip", "iron_whip", "steel_whip", "oak_bow", "yew_bow"];
  const TEA_STOCK = ["focus_tea", "warm_brew", "clear_drops", "mana_potion", "potion", "herb", "sage_herb", "bright_herb", "panacea_brew"];
  // dojos vend the two lowest striker wraps (patched, ironthread) the way
  // smithies vend mundane armor — higher kasaya tiers stay loot/forge-only.
  const DOJO_STOCK = ["patched_kasaya", "ironthread_kasaya"];
  // temple vestry list (no shop counter — sold through the altar modal, so E
  // on altars still blesses/upgrades and shelves still read): the two lowest
  // choir tunics (novice, canon), mirroring arcane robes.
  const TEMPLE_STOCK = ["novice_habit", "canon_habit"];
  // arcane circles vend the two lowest wand/staff tiers (quartz, ruby) and
  // the two lowest robes (cloth, mage) plus novice/canon habitus alongside
  // their enchanting service —
  // see the ✨ Enchant tab (renderShopExtra) for the enchant UI.
  const ARCANE_STOCK = ["wand_quartz", "wand_ruby", "staff_quartz", "staff_ruby", "cloth_robe", "mage_robe", "novice_habit", "canon_habit"];
 const LIBRARY_STOCK = ["tome_fireball", "tome_heal", "tome_whirlwind", "tome_frostbite", "tome_shieldwall", "tome_water_jet",
   "tome_lightning", "tome_venom", "tome_immolate", "tome_glacier", "tome_thunder_hex",
   "tome_dazzle", "tome_smite", "tome_tideburst", "tome_cleanse", "tome_panacea", "tome_revive",
    "tome_dazzle", "tome_smite", "tome_tideburst", "tome_cleanse", "tome_panacea", "tome_revive",
    "tome_shadowstep", "tome_grapple", "tome_warcry", "tome_ember_weapon", "tome_blessed_weapon",
    "tome_wind_cutter", "tome_whirlpool", "tome_line_of_fire", "tome_icicle_line", "tome_toxic_stab", "tome_tamisra", "tome_life_drain"];
  function stockFor(kind) {
    if (kind === "market") return MARKET_STOCK.slice();
    if (kind === "smith") return SMITH_STOCK.slice();
    if (kind === "tea") return TEA_STOCK.slice();
    if (kind === "dojo") return DOJO_STOCK.slice();
    if (kind === "temple") return TEMPLE_STOCK.slice();
    if (kind === "lodge") return LODGE_STOCK.slice();
    if (kind === "library") return LIBRARY_STOCK.slice();
    if (kind === "blackmarket") return ["crimson_rage", "ironmind_draught", "swiftshade"];
    if (kind === "arcane") return ARCANE_STOCK.slice();
    return [];
  }
  function shopSells(kind, id) {
    // Sealed cataclysm lore is never sold anywhere (depth 5+ chests and
    // deep boss hoards only) — even if it somehow lands in a stock list.
    try { if (window.Items && window.Items.isCataTome && window.Items.isCataTome(id)) return false; } catch (e) {}
    try { if (window.Trade && window.Trade.isCataSale && window.Trade.isCataSale(id)) return false; } catch (e) {}
    const s = stockFor(kind);
    if (s.includes(id)) return true;
    if (kind === "smith") {
      // smiths also vend any low-tier gear id in stock list; buying side accepts all equipment
      return false;
    }
    return false;
  }
  function shopBuys(kind, id) {
    try {
      const it = window.Items.ITEMS[id];
      if (!it) return false;
      if (it.quest || it.type === "quest") return false;
      if (kind === "market") return it.slot !== "weapon" && !(it.slot === "armor" || it.slot === "shield" || it.slot === "trinket") && it.type !== "spellbook" && it.type !== "equipment";
      if (kind === "smith") return true;
      if (kind === "tea") return it.type === "consumable" || it.type === "material";
      if (kind === "library") return it.type === "spellbook";
      if (kind === "blackmarket") return it.type === "consumable" || it.type === "material";
      if (kind === "arcane") return it.type === "spellbook" || it.type === "consumable" || it.type === "material";
      if (kind === "temple") return it.type === "spellbook" || it.type === "consumable" || it.type === "material";
      if (kind === "lodge") return it.type === "consumable" || it.type === "material";
    } catch (e) {}
    return false;
  }

  // ---- drugs ----
  function takeDrug(p, itemId) {
    try {
      p.buffs = p.buffs || {};
      const now = performance.now();
      if (itemId === "crimson_rage") {
        const hpCost = Math.round(p.maxHp * 0.25), stCost = Math.round((p.maxStamina || 100) * 0.2);
        if (p.hp <= hpCost + 1) return { ok: false, msg: "Too weak to take Crimson Rage." };
        p.hp -= hpCost;
        try { if (window.Game.spendStamina) window.Game.spendStamina(stCost); else p.stamina = Math.max(0, (p.stamina || 0) - stCost); } catch (e) { p.stamina = Math.max(0, (p.stamina || 0) - stCost); }
        p.buffs.drugRageUntil = now + 120000;
        try { window.Game.addFloatText(p.x, p.y, "+RAGE", "#ff5b5b"); } catch (e) {}
        try { window.UI.updateHUD(); } catch (e) {}
        return { ok: true, msg: "💊 Crimson Rage surges — +60% melee for 2 min (−25% HP, −20% stamina)." };
      }
      if (itemId === "ironmind_draught") {
        const mpCost = Math.round(p.maxMp * 0.3), hpCost = Math.round(p.maxHp * 0.1);
        if (p.mp < mpCost || p.hp <= hpCost + 1) return { ok: false, msg: "Too drained for Ironmind." };
        p.mp -= mpCost; p.hp -= hpCost;
        p.buffs.drugMindUntil = now + 120000;
        try { window.Game.addFloatText(p.x, p.y, "+MIND", "#7fc4ff"); } catch (e) {}
        try { window.UI.updateHUD(); } catch (e) {}
        return { ok: true, msg: "💊 Ironmind sharpens — +60% spell power for 2 min (−30% MP, −10% HP)." };
      }
      if (itemId === "swiftshade") {
        const stCost = Math.round((p.maxStamina || 100) * 0.3), mpCost = Math.round(p.maxMp * 0.15);
        if ((p.stamina || 0) < stCost || p.mp < mpCost) return { ok: false, msg: "Too exhausted for Swiftshade." };
        try { if (window.Game.spendStamina) window.Game.spendStamina(stCost); else p.stamina -= stCost; } catch (e) { p.stamina = Math.max(0, (p.stamina || 0) - stCost); }
        p.mp -= mpCost;
        p.buffs.drugShadeUntil = now + 90000;
        try { window.Game.addFloatText(p.x, p.y, "+SHADE", "#c9a7ff"); } catch (e) {}
        try { window.UI.updateHUD(); } catch (e) {}
        return { ok: true, msg: "💊 Swiftshade veils you — +35% speed, +25% dodge for 90s (−30% stamina, −15% MP)." };
      }
    } catch (e) { return { ok: false, msg: "Fizzle..." }; }
    return { ok: false, msg: "Nothing happens." };
  }

  // ---- black-market beasts ----
  // All entries MUST exist in CFG.MOB_TEMPLATES — makeMob falls back to the
  // slime template for stats but keeps the requested kind, so an invalid
  // kind here used to mint "Slime"-named beasts that render as humanoid
  // NPCs (no template body). Valid low-tier equivalents only.
  const BM_BEAST_POOL = ["wolf", "fenrir_pup", "tanuki", "anubite", "kitsune_trickster", "gorgon_spawn", "naga", "burrow_mole", "goblin", "slime", "bat", "mushroom", "velociraptor", "gnoll", "lindworm"];
  function beastShopKey(building) {
    try { return (building && building.id) || "bm_default"; } catch (e) { return "bm_default"; }
  }
  function chunkOfBuilding(building) {
    try {
      const G = window.Game.G;
      for (const ch of G.chunks.values()) {
        if (!ch) continue;
        const bs = (window.Buildings.buildingsInView ? null : null);
        void bs;
        // match by footprint containment of the nexus
        const nx = building._nx != null ? building._nx : (building.x0 + (building.w >> 1));
        const ny = building._ny != null ? building._ny : (building.y0 + (building.h >> 1));
        if (nx >= ch.cx * 16 && nx < ch.cx * 16 + 16 && ny >= ch.cy * 16 && ny < ch.cy * 16 + 16) return ch;
      }
      const p = window.Game.G.player;
      const ch = window.Game.chunkAt(Math.floor(p.x), Math.floor(p.y));
      return ch;
    } catch (e) { return null; }
  }
  function hashStr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function beastPrice(t) {
    try {
      const lv = t.lv || 1;
      const stats = (t.atk || 0) + (t.def || 0) + (t.maxHp || 0) / 10 + (t.abilities || []).length * 25;
      return Math.max(200, Math.round((150 + lv * 90 + stats * 1.2) / 5) * 5);
    } catch (e) { return 500; }
  }
  function ensureBeastStock(building) {
    try {
      const ch = chunkOfBuilding(building);
      const key = beastShopKey(building);
      ch.shopBM = ch.shopBM || {};
      const isValidKind = (k) => { try { return !!(window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[k]); } catch (e) { return false; } };
      // Repair old saves: pre-fix stock holds invalid kinds (dire_wolf, jackal,
      // fox, cobra, python, giant_rat, raptor, warg, serpent) all named "Slime"
      // that render as humanoid NPCs. Drop the broken rows so they restock.
      if (Array.isArray(ch.shopBM[key])) {
        try {
          const before = ch.shopBM[key].length;
          ch.shopBM[key] = ch.shopBM[key].filter(s => s && isValidKind(s.kind));
          if (ch.shopBM[key].length !== before) { try { window.World.saveChunk(ch); } catch (e2) {} }
        } catch (e) {}
        if (ch.shopBM[key].length) return ch.shopBM[key];
        try { delete ch.shopBM[key]; } catch (e) {}
      }
      if (!Array.isArray(ch.shopBM[key])) {
        const R = (() => { let a = hashStr("bm:" + key); return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
        const arr = [];
        for (let i = 0; i < 4; i++) {
          const kind = BM_BEAST_POOL[(R() * BM_BEAST_POOL.length) | 0];
          if (!isValidKind(kind)) continue;
          const lv = 1 + ((R() * 8) | 0);
          let mob = null;
          try { mob = window.Entities.makeMob(kind, lv, 10, 0); } catch (e) { continue; }
          if (!mob || !isValidKind(mob.kind)) continue;
          mob.hp = mob.maxHp; mob.mp = mob.maxMp;
          arr.push({ kind: mob.kind, name: mob.name || kind, lv: mob.lv, maxHp: mob.maxHp, maxMp: mob.maxMp, atk: mob.atk, def: mob.def, matk: mob.matk, sdef: mob.sdef, spd: mob.spd, abilities: (mob.abilities || []).slice(0, 4), tint: mob.tint, gender: mob.gender });
        }
        ch.shopBM[key] = arr;
        try { window.World.saveChunk(ch); } catch (e) {}
      }
      return ch.shopBM[key] || [];
    } catch (e) { return []; }
  }
  function buyBeast(building, idx) {
    try {
      const p = window.Game.G.player;
      const stock = ensureBeastStock(building);
      const s = stock[idx];
      if (!s) return { ok: false, msg: "Gone." };
      // Defensive: refuse stale broken rows (pre-fix invalid kinds) instead of
      // minting another humanoid-looking "Slime".
      try {
        if (!(window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[s.kind])) {
          try { stock.splice(idx, 1); const ch0 = chunkOfBuilding(building); try { window.World.saveChunk(ch0); } catch (e2) {} } catch (e2) {}
          return { ok: false, msg: "That pen is empty (stale listing cleared) — pick another beast." };
        }
      } catch (e) {}
      const price = beastPrice(s);
      if ((p.gold | 0) < price) return { ok: false, msg: `Need ${price}g.` };
      // alongside share full + no open pen = no sale (gold stays put).
      // Otherwise the beast walks with you, or lodges in the open pen.
      let toStable = false;
      try {
        const counts = window.Game.partyAndTameCount ? window.Game.partyAndTameCount() : null;
        let cap = 1, loose = 0;
        try { cap = window.Entities.tameSlots ? window.Entities.tameSlots(p) : 1; } catch (e) { }
        try { loose = ((window.Entities.activeTames(p) || []).filter(t => t && !t.riderId) || []).length; } catch (e) { }
        const tTotal = counts ? (counts.tames | 0) : ((p.tames || []).filter(t => t && !t.stabled).length);
        const mmax = (counts && counts.mountMax) || (window.CFG && window.CFG.MOUNT_MAX) || 5;
        if (tTotal >= mmax || loose >= cap) {
          const open = window.Game.stableHasOpenPen ? window.Game.stableHasOpenPen(p) : true;
          if (!open) return { ok: false, msg: `No room — beasts alongside you are full (${cap}) and no stable pen is open. Unlock a pen slot or raise a box (🐴 Stable) first.` };
          toStable = true;
        }
      } catch (e) {}
      p.gold -= price;
      let tame = null;
      try {
        const fake = { kind: s.kind, lv: s.lv, maxHp: s.maxHp, maxMp: s.maxMp, atk: s.atk, def: s.def, matk: s.matk != null ? s.matk : s.atk, sdef: s.sdef != null ? s.sdef : s.def, spd: s.spd, abilities: s.abilities, tint: s.tint, name: s.name, hp: s.maxHp, mp: s.maxMp };
        tame = window.Entities.makeTameFromMob(fake);
      } catch (e) { return { ok: false, msg: "The beast slips away." }; }
      if (!tame) return { ok: false, msg: "The beast slips away." };
      p.tames = p.tames || [];
      if (toStable) { tame.stabled = true; tame.inParty = false; tame.x = p.x; tame.y = p.y; }
      else {
        tame.stabled = false; tame.inParty = true;
        tame.x = (p.x != null ? p.x + 1 : 0); tame.y = (p.y != null ? p.y : 0);
        if (!p.activeMountId) { p.activeMountId = tame.id; p.mounted = false; }
      }
      p.tames.push(tame);
      try { if (toStable && window.Game.stableBoxPlace) window.Game.stableBoxPlace(p, tame.id); } catch (e) {}
      try { if (window.Game.noteTameAcquired) window.Game.noteTameAcquired(p, tame.kind); } catch (e) {}
      // remove from stock, persist
      try {
        stock.splice(idx, 1);
        const ch = chunkOfBuilding(building);
        try { window.World.saveChunk(ch); } catch (e2) {}
      } catch (e) {}
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      return { ok: true, msg: toStable ? `💛 ${tame.name} trusts you! Beasts alongside you are full — rested at the Stable (fetch any via 🐴 Stable). (counts as tamed)` : `💛 ${tame.name} joins you! (counts as tamed)` };
    } catch (e) { return { ok: false, msg: "Trade failed." }; }
  }
  function sellBeast(tameId) {
    try {
      const p = window.Game.G.player;
      const t = (p.tames || []).find(x => x && x.id === tameId);
      if (!t) return { ok: false, msg: "No such beast." };
      if (t.breeding) return { ok: false, msg: "That beast is lodged for breeding." };
      const price = Math.max(100, Math.round(beastPrice(t) * 0.6 / 5) * 5);
      // remove (stable boxes sync)
      try {
        p.tames = (p.tames || []).filter(x => x && x.id !== tameId);
        if (window.Game.stableBoxClear) window.Game.stableBoxClear(p, tameId);
      } catch (e) { p.tames = (p.tames || []).filter(x => x && x.id !== tameId); }
      if (t.riderId) { try { if (window.Game.unassignMountFromMember) window.Game.unassignMountFromMember(t.riderId, true); } catch (e) {} }
      p.gold = Math.max(0, Math.trunc(Number(p.gold)||0) + Math.max(0, Math.trunc(Number(price)||0)));
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      return { ok: true, msg: `Sold ${t.name} for ${price}g.` };
    } catch (e) { return { ok: false, msg: "Sale failed." }; }
  }
  // ---- slaves ----
  const SLAVE_NAMES = ["Ash", "Bram", "Cessa", "Dorn", "Essa", "Fenn", "Greta", "Hob", "Ilsa", "Joren", "Kessa", "Lorn"];
  function ensureSlaveStock(building) {
    try {
      const ch = chunkOfBuilding(building);
      const key = "sl_" + beastShopKey(building);
      ch.shopBM = ch.shopBM || {};
      if (!Array.isArray(ch.shopBM[key])) {
        let a = hashStr("sl:" + key);
        const R = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const arr = [];
        for (let i = 0; i < 3; i++) {
          const lv = 1 + ((R() * 6) | 0);
          const sname = SLAVE_NAMES[(R() * SLAVE_NAMES.length) | 0];
          let sgender = "";
          try { sgender = (window.AIDirector && window.AIDirector.guessGenderFromName) ? window.AIDirector.guessGenderFromName(sname) : ""; } catch (e) { }
          if (!sgender) sgender = (R() < 0.5 ? "male" : "female");
          arr.push({ id: "sl_" + key + "_" + i, name: sname + " (slave)", lv, role: "slave", price: 800 + lv * 250 + ((R() * 200) | 0), gender: sgender });
        }
        ch.shopBM[key] = arr;
        try { window.World.saveChunk(ch); } catch (e) {}
      }
      return ch.shopBM[key] || [];
    } catch (e) { return []; }
  }
  function buySlave(building, idx) {
    try {
      const p = window.Game.G.player;
      const stock = ensureSlaveStock(building);
      const s = stock[idx];
      if (!s) return { ok: false, msg: "Gone." };
      p.party = p.party || [];
      const max = (window.Game && window.Game.effectivePartyMax) ? window.Game.effectivePartyMax() : ((window.CFG && window.CFG.PARTY_MAX) || 4);
      // party full: the slave can still room at an inn — but only with a
      // vacant paid room. No room, no sale (the gold stays in your pocket).
      let toInn = false;
      if (p.party.length >= max) {
        let open = -1;
        try { open = window.Game.innOpenSlot ? window.Game.innOpenSlot(p) : -1; } catch (e) { }
        if (!(open >= 0)) {
          let fee = 0;
          try { fee = window.Game.innRoomPrice ? window.Game.innRoomPrice(p) : 0; } catch (e) { }
          return { ok: false, msg: `Your party is full (${max}/${max}) and no inn room is open${fee ? ` — buy room ${((p.innUnlock | 0) || 0) + 1} for ${fee}g first` : ""}, or dismiss someone (P). Slaves take a friend slot, never a beast slot.` };
        }
        toInn = true;
      }
      if ((p.gold | 0) < s.price) return { ok: false, msg: `Need ${s.price}g.` };
      p.gold -= s.price;
      let npc = null;
      try {
        // Full birth record (id/pos/chunk/place): id-less saves used to land
        // under storage key "j:undefined" and surface as a nameless "Villager".
        let _ck = null, _pn = "Wilds", _dim = "surf";
        try {
          const _cx = Math.floor((p.x + 1) / 16), _cy = Math.floor(p.y / 16);
          if (window.World && window.World.chunkKey) _ck = window.World.chunkKey(_cx, _cy);
          try {
            const _ch = (window.Game && window.Game.G && window.Game.G.chunks && window.Game.G.chunks.get(_cx + "," + _cy))
              || (window.World && window.World._mem && window.World._mem.chunks && window.World._mem.chunks.get(_ck));
            if (_ch && _ch.placeName) _pn = String(_ch.placeName).slice(0, 32);
          } catch (e2) {}
          if (window.World && window.World.getDim) _dim = window.World.getDim();
        } catch (e2) {}
        npc = window.AIDirector.makeNpcObject({
          id: "npc_sl_" + Math.random().toString(36).slice(2, 9),
          name: s.name, role: "slave", lv: s.lv,
          gx: p.x + 1, gy: p.y, chunkKey: _ck, placeName: _pn,
          dist: Math.hypot(p.x + 1, p.y), dim: _dim, gender: s.gender,
        });
        // identity: rooming (inns), breeding and party tabs all key on npc.id
        if (!npc.id || npc.id === "undefined") npc.id = "npc_sl_" + Math.random().toString(36).slice(2, 9);
        npc.role = "slave"; npc.noLoyalty = true; npc.loyalty = 0;
        npc.slave = true;
        try { window.World.saveNpc(npc); } catch (e) {}
        if (toInn) {
          // party full: straight into the vacant paid room (already bought —
          // no extra gold), retrievable from any inn
          let filed = null;
          try {
            // findInnNpc only sees cached NPCs (saveNpc lands async), so
            // publish the newborn into the live list first
            const GN = window.Game.G;
            if (GN && Array.isArray(GN.npcs) && !GN.npcs.includes(npc)) GN.npcs.push(npc);
          } catch (e) { }
          try { filed = window.Game.innFileGuest ? window.Game.innFileGuest(npc.id) : null; } catch (e) { }
          if (!filed || !filed.ok) {
            try { p.gold += s.price; } catch (e2) { }
            return { ok: false, msg: "⚠️ " + ((filed && filed.msg) || "No open inn room.") };
          }
        } else {
          // recruit directly into a party friend slot
          p.party.push(npc.id); npc.inParty = true; try { window.World.saveNpc(npc); } catch (e2) {}
        }
        try { if (window.Game.refreshNpcCache) awaitRefresh(); } catch (e) {}
      } catch (e) { return { ok: false, msg: "The deal falls through." }; }
      try {
        stock.splice(idx, 1);
        const ch = chunkOfBuilding(building);
        try { window.World.saveChunk(ch); } catch (e2) {}
      } catch (e) {}
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      return { ok: true, msg: toInn ? `⛓️ ${s.name} joins you — party full, resting in inn room (retrieve at any inn). Breedable in beast lodges.` : `⛓️ ${s.name} joins you — no loyalty bar, breedable in beast lodges.` };
    } catch (e) { return { ok: false, msg: "Trade failed." }; }
  }
  function awaitRefresh() { try { return window.Game.refreshNpcCache(); } catch (e) {} }

  // ---- arcane enchanting ----
  const ENCHANTS = [
    { id: "fire", name: "Ember", element: "fire", statusHit: { type: "burn", chance: 0.5, dps: 6, potency: 1.2, procCd: 8 }, mult: 1.0, desc: "Ignites (burn)." },
    { id: "ice", name: "Frost", element: "ice", statusHit: { type: "freeze", chance: 0.4, duration: 2, potency: 1.2, procCd: 10 }, mult: 1.2, desc: "Freezes." },
    { id: "electric", name: "Storm", element: "electric", statusHit: { type: "paralyze", chance: 0.4, potency: 1.2, procCd: 10 }, mult: 1.3, desc: "Paralyzes." },
    { id: "water", name: "Tide", element: "water", statusHit: { type: "poison", chance: 0.45, pct: 0.03, potency: 1.1, procCd: 8 }, mult: 1.1, desc: "Brine-poisons." },
    { id: "holy", name: "Dawn", element: "holy", statusHit: { type: "blind", chance: 0.5, potency: 1.2, procCd: 8 }, mult: 1.6, desc: "Blinds, bites undead.", smite: true },
    { id: "venom", name: "Venom", element: "water", statusHit: { type: "poison", chance: 0.5, pct: 0.03, potency: 1.2, procCd: 8 }, mult: 1.1, desc: "Envenoms." },
  ];
  function weaponTierOf(it) {
    try {
      const m = Math.max(it.tierMult || 1, it.undeadMult || 1);
      if (m >= 4) return { tier: 6, base: 30000, label: "oblivion" };
      if (m >= 3) return { tier: 5, base: 12000, label: "dragon" };
      if (m >= 2) return { tier: 3, base: 5000, label: "mythril" };
      if ((it.mat === "silver") || m > 1.2) return { tier: 2, base: 2000, label: "steel/silver" };
      if (m > 1) return { tier: 1, base: 600, label: "iron" };
      return { tier: 0, base: 200, label: "rusty" };
    } catch (e) { return { tier: 0, base: 200, label: "rusty" }; }
  }
  function enchantPrice(it, ench, strength) {
    const t = weaponTierOf(it);
    const sm = strength === "greater" ? 2.2 : 1.0;
    return Math.max(100, Math.round(t.base * ench.mult * sm / 10) * 10);
  }
  function isEnchanted(it) {
    try { return !!(it && (it.statusHit || it.element || (window.Items.HYBRIDS && window.Items.HYBRIDS.includes(it.id)))); } catch (e) { return false; }
  }
  function doEnchant(itemId, enchId, strength, variant) {
    try {
      const p = window.Game.G.player;
      const it = window.Items.ITEMS[itemId];
      if (!it || it.type !== "equipment" || it.slot !== "weapon") return { ok: false, msg: "Not a weapon." };
      if (isEnchanted(it)) return { ok: false, msg: "Already enchanted — the arcane circle only takes plain steel." };
      const src = window.Items.findStack(p, itemId, variant);
      if (!src) return { ok: false, msg: "Not in your pack." };
      const ench = ENCHANTS.find(e => e.id === enchId);
      if (!ench) return { ok: false, msg: "No such enchantment." };
      const price = enchantPrice(it, ench, strength);
      if ((p.gold | 0) < price) return { ok: false, msg: `Need ${price}g.` };
      const nid = `${itemId}__${enchId}_${strength === "greater" ? "g" : "m"}`;
      if (!window.Items.ITEMS[nid]) {
        const st = strength === "greater"
          ? { type: ench.statusHit.type, chance: Math.min(0.75, ench.statusHit.chance + 0.15), potency: (ench.statusHit.potency || 1.2) + 0.2, procCd: ench.statusHit.procCd, ...(ench.statusHit.dps ? { dps: ench.statusHit.dps + 2 } : {}), ...(ench.statusHit.duration ? { duration: ench.statusHit.duration + 0.5 } : {}), ...(ench.statusHit.pct ? { pct: ench.statusHit.pct + 0.01 } : {}) }
          : { ...ench.statusHit };
        window.Items.ITEMS[nid] = {
          ...it, id: nid, name: `${ench.name} ${it.name}${strength === "greater" ? " (Greater)" : ""}`,
          element: ench.element, statusHit: st, ...(ench.smite ? { smite: true } : {}),
          price: Math.round((it.price || 300) + price * 0.8),
          desc: `${it.desc} ${ench.name} enchant (${ench.desc}${strength === "greater" ? " Greater" : ""}).`,
        };
      }
      p.gold -= price;
      // one copy goes under the circle; its bench-work and name survive
      const srcUp = window.Items.stackUp ? window.Items.stackUp(src) : 0;
      const srcNick = window.Items.stackNick ? window.Items.stackNick(src) : "";
      window.Items.removeItem(p, itemId, 1, src);
      window.Items.addItem(p, nid, 1, { up: srcUp, nick: srcNick });
      // a worn blade follows its own edge into the circle
      try {
        let followed = false;
        if (p.equipment && p.equipment.weapon === itemId && window.Items.wornVariantOf) {
          const wv = window.Items.wornVariantOf(p, "weapon");
          if (wv.up === srcUp && wv.nick === srcNick) {
            p.equipment.weapon = nid;
            if (window.Items.setWornVariant) window.Items.setWornVariant(p, "weapon", { up: srcUp, nick: srcNick });
            followed = true;
          }
        }
        // binds naming the old edge follow it: the worn blade moved, or the
        // last copy of that identity just went under the circle
        if (window.Items.relinkBinds && (followed || (window.Items.noStackLeft && window.Items.noStackLeft(p, itemId, { up: srcUp, nick: srcNick })))) {
          window.Items.relinkBinds(p, itemId, { up: srcUp, nick: srcNick }, nid, { up: srcUp, nick: srcNick });
        }
      } catch (e) {}
      try { window.Game.saveGame(true); window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) {}
      return { ok: true, msg: `✨ ${window.Items.ITEMS[nid].name} — ${price}g.` };
    } catch (e) { return { ok: false, msg: "Enchanting failed." }; }
  }

  // ---- buy/sell against unlimited shop stock ----
  function buyFromShop(kind, id, n) {
    try {
      // Sealed cataclysm lore is never sold (found only in deep delves).
      if (window.Items && window.Items.isCataTome && window.Items.isCataTome(id)) {
        return { ok: false, msg: "🔒 Sealed deep-delve lore — never sold, only found (depth 5+ chests, deep boss hoards)." };
      }
    } catch (e) { }
    try {
      const p = window.Game.G.player;
      n = Math.max(1, Math.min(99, n | 0 || 1));
      if (!shopSells(kind, id) && kind !== "blackmarket") {
        // smith/library/etc only sell listed stock
        const s = stockFor(kind);
        if (!s.includes(id)) return { ok: false, msg: "The shop doesn't stock that." };
      }
      const price = askPrice(kind, id) * n;
      if ((p.gold | 0) < price) return { ok: false, msg: `Need ${price}g.` };
      p.gold -= price;
      window.Items.addItem(p, id, n);
      try { window.Game.saveGame(true); window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) {}
      return { ok: true, msg: `Bought ${n}× ${window.Items.ITEMS[id].name} for ${price}g.` };
    } catch (e) { return { ok: false, msg: "Trade failed." }; }
  }
  function sellToShop(kind, id, n, variant) {
    try {
      const p = window.Game.G.player;
      n = Math.max(1, Math.min(99, n | 0 || 1));
      if (!shopBuys(kind, id)) return { ok: false, msg: "The shop doesn't want that." };
      if (window.Items.countItem(p, id) < n) return { ok: false, msg: "You don't have that many." };
      if (variant && window.Items.countVariant && window.Items.countVariant(p, id, variant) < n) {
        return { ok: false, msg: "Not that many of that copy." };
      }
      // smiths pay full fair price for high-tier gear, markets never take weapons/armor
      const price = bidPrice(kind, id) * n;
      window.Items.removeItem(p, id, n, variant);
      p.gold = (p.gold | 0) + price;
      try { window.Game.saveGame(true); window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) {}
      let dn = window.Items.ITEMS[id].name;
      try { if (variant && window.Items.variantName) dn = window.Items.variantName({ id, up: variant.up, nick: variant.nick }); } catch (e) {}
      return { ok: true, msg: `Sold ${n}× ${dn} for ${price}g.` };
    } catch (e) { return { ok: false, msg: "Sale failed." }; }
  }

  // ---- dojo ----
  function dojoRefund(stat) {
    try {
      const p = window.Game.G.player;
      if (!window.CFG.STATS[stat]) return { ok: false, msg: "No such stat." };
      if ((p.stats[stat] | 0) <= 5) return { ok: false, msg: "That stat is already at base." };
      if ((p.gold | 0) < 1000) return { ok: false, msg: "Need 1000g per refunded point." };
      p.gold -= 1000;
      p.stats[stat]--;
      p.statPoints = (p.statPoints | 0) + 1;
      try { window.Entities.recalcDerived(p, true); } catch (e) {}
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      return { ok: true, msg: `🥋 Refunded 1 ${stat} (−1 ${stat}, +1 point, −1000g).` };
    } catch (e) { return { ok: false, msg: "Dojo failed." }; }
  }

  // ---- king permits ----
  const PERMITS = [
    { id: "permit_market", label: "🏪 Market charter", price: 5000, blurb: "Found a player market stall anywhere." },
    { id: "permit_blacksmith", label: "⚒️ Smithy charter", price: 5000, blurb: "Found a player smithy stall anywhere." },
    { id: "permit_dojo", label: "🥋 Dojo charter", price: 4000, blurb: "Found a player dojo mat anywhere." },
    { id: "permit_arcane", label: "✨ Arcane charter", price: 6000, blurb: "Found a player arcane circle anywhere." },
    { id: "permit_stable", label: "🐴 Stable charter", price: 3500, blurb: "Found a player stable pen anywhere." },
  ];
  function buyPermit(id) {
    try {
      const p = window.Game.G.player;
      const rec = PERMITS.find(r => r.id === id);
      if (!rec) return { ok: false, msg: "No such charter." };
      if ((p.gold | 0) < rec.price) return { ok: false, msg: `Need ${rec.price}g.` };
      p.gold -= rec.price;
      window.Items.addItem(p, id, 1);
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      return { ok: true, msg: `📜 ${rec.label} — Use it on walkable ground to found the stall (consumed).` };
    } catch (e) { return { ok: false, msg: "The King waves you off." }; }
  }

  // ---- placement (base kits + charters + home portal) ----
  let placingId = null;
  function startPlacement(itemId) {
    placingId = itemId;
    try {
      const G = window.Game.G;
      G.torchTargeting = false;
      G.placeTargeting = itemId;
    } catch (e) {}
    try { window.UI.toast(`Click walkable ground nearby to place (Esc cancels).`, 3500); } catch (e) {}
  }
  function cancelPlacement() {
    placingId = null;
    try { window.Game.G.placeTargeting = null; } catch (e) {}
  }
  function isPlacing() { try { return placingId || window.Game.G.placeTargeting; } catch (e) { return placingId; } }
  function placeAtScreen(cx, cy) {
    const itemId = isPlacing();
    if (!itemId) return false;
    const it = window.Items.ITEMS[itemId];
    if (!it || it.type !== "placeable") { cancelPlacement(); return false; }
    const p = window.Game.G.player;
    const canvas = window.GameCanvas;
    if (!p || !canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const zoom = (() => { try { return window.Game.viewZoom ? window.Game.viewZoom() : 1; } catch (e) { return 1; } })();
    const ts = 32 * zoom;
    const cam = window.Game.G.cam;
    const gx = (cx - rect.left - rect.width / 2 + cam.x) / ts;
    const gy = (cy - rect.top - rect.height / 2 + cam.y) / ts;
    const tx = Math.floor(gx), ty = Math.floor(gy);
    const toast = (m) => { try { window.UI.toast(m, 2600); } catch (e) {} };
    if (p.inDungeon) { toast("Can't build down here."); return true; }
    if (Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y) > 4) { toast("Too far — click a spot near your feet."); return true; }
    // must be walkable tile, no building footprint, no POI
    try {
      if (!window.Game.walkable(tx + 0.5, ty + 0.5)) { toast("Can't build there — blocked."); return true; }
      if (window.Buildings && window.Buildings.buildingsAt && window.Buildings.buildingsAt(tx, ty)) { toast("Can't build inside a building."); return true; }
      const ch = window.Game.chunkAt(tx, ty);
      if (!ch) { toast("Ground not loaded yet."); return true; }
      if (Array.isArray(ch.pois) && ch.pois.some(q => q && q.gx === tx && q.gy === ty)) { toast("Something already stands there."); return true; }
      if (ch.shopStalls && ch.shopStalls[tx + "," + ty]) { toast("A stall already stands there."); return true; }
      try {
        if (window.Buildings && window.Buildings.furnitureAt && window.Buildings.furnitureAt(tx, ty)) { toast("Furniture already stands there."); return true; }
      } catch (e) {}
    } catch (e) { toast("Can't build there."); return true; }
    if (window.Items.countItem(p, itemId) < 1) { toast("None left."); cancelPlacement(); return true; }
    const ok = commitPlacement(tx, ty, itemId);
    if (ok) {
      window.Items.removeItem(p, itemId, 1);
      cancelPlacement();
      try { window.Game.saveGame(true); window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) {}
      // repaint inventory if open
      try { const m = document.querySelector("#invModal"); if (m && !m.hidden && window.UI.renderInv) window.UI.renderInv(); } catch (e) {}
    }
    return true;
  }
  function commitPlacement(tx, ty, itemId) {
    const toast = (m) => { try { window.UI.toast(m, 3500); } catch (e) {} };
    try {
      const ch = window.Game.chunkAt(tx, ty);
      if (!ch) return false;
      const T = window.CFG.T;
      const lx = tx - ch.cx * 16, ly = ty - ch.cy * 16;
      const setTile = (id) => {
        try {
          const W = window.World;
          if (W && W.setTile) W.setTile(ch, lx, ly, id);
          else ch.tiles[ly * 16 + lx] = id;
        } catch (e) { ch.tiles[ly * 16 + lx] = id; }
      };
      const it = window.Items.ITEMS[itemId];
      const kind = (it && it.place) || itemId;
      if (kind === "brick_wall") {
        setTile(T.HOUSEWALL);
        ch.wallHP = ch.wallHP || {}; ch.wallHP[lx + "," + ly] = 450;
        try { window.World.saveChunk(ch); } catch (e) {}
        // shared ground: peers render the same wall (destruction already syncs)
        try { if (window.MP && window.MP.publishTiles) window.MP.publishTiles([{ cx: ch.cx, cy: ch.cy, lx, ly, t: T.HOUSEWALL }]); } catch (e) {}
        toast("🧱 Brick wall raised (attack it to destroy).");
        return true;
      }
      if (kind === "wooden_door") {
        setTile(T.DOOR);
        ch.wallHP = ch.wallHP || {}; ch.wallHP[lx + "," + ly] = 450;
        try { window.World.saveChunk(ch); } catch (e) {}
        try { if (window.MP && window.MP.publishTiles) window.MP.publishTiles([{ cx: ch.cx, cy: ch.cy, lx, ly, t: T.DOOR }]); } catch (e) {}
        toast("🚪 Wooden door set (attack it to destroy).");
        return true;
      }
      if (kind === "glass_window") {
        setTile(T.WINDOW);
        ch.wallHP = ch.wallHP || {}; ch.wallHP[lx + "," + ly] = 25;
        try { window.World.saveChunk(ch); } catch (e) {}
        try { if (window.MP && window.MP.publishTiles) window.MP.publishTiles([{ cx: ch.cx, cy: ch.cy, lx, ly, t: T.WINDOW }]); } catch (e) {}
        toast("🪟 Glass window set (fragile — attack to destroy).");
        return true;
      }
      if (kind === "home_portal") {
        setTile(T.TOWNSTONE);
        ch.pois = ch.pois || [];
        ch.pois.push({ type: "portal", gx: tx, gy: ty, home: true, text: "Home Portal" });
        try { window.World.saveChunk(ch); } catch (e) {}
        // ground travels the tile channel; the portal overlay rides pos (see placeOut)
        try { if (window.MP && window.MP.publishTiles) window.MP.publishTiles([{ cx: ch.cx, cy: ch.cy, lx, ly, t: T.TOWNSTONE }]); } catch (e) {}
        toast("🌀 Home portal raised — E to travel or bind it as respawn.");
        return true;
      }
      if (STALL_SHOP[kind]) {
        setTile(T.HOUSEWALL);
        ch.wallHP = ch.wallHP || {}; ch.wallHP[lx + "," + ly] = 450;
        ch.shopStalls = ch.shopStalls || {};
        ch.shopStalls[tx + "," + ty] = { kind: STALL_SHOP[kind], charter: kind };
        try { window.World.saveChunk(ch); } catch (e) {}
        // ground travels the tile channel; the stall record rides pos (see placeOut)
        try { if (window.MP && window.MP.publishTiles) window.MP.publishTiles([{ cx: ch.cx, cy: ch.cy, lx, ly, t: T.HOUSEWALL }]); } catch (e) {}
        toast(`📜 ${SHOP_TITLE[STALL_SHOP[kind]]} stall founded — E to use, attack to destroy.`);
        return true;
      }
      // player-made furniture: baked into the chunk record, destroy-only
      if (typeof kind === "string" && kind.indexOf("furn_") === 0) {
        const fk = kind.slice(5);
        try {
          if (window.Buildings && window.Buildings.placeFurniture && window.Buildings.placeFurniture(tx, ty, fk)) {
            const label = (window.Items.ITEMS[itemId] || {}).name || "Furniture";
            toast(`🪑 ${label} placed — E to use it, attack to destroy.`);
            return true;
          }
        } catch (e) {}
        toast("Can't place that here.");
        return false;
      }
      toast("Can't place that here.");
      return false;
    } catch (e) { toast("Can't place that here."); return false; }
  }
  // break player tiles + stalls when walls are smashed (mobs included)
  function onWallBreach(gx, gy, ch) {
    try {
      if (ch && ch.shopStalls && ch.shopStalls[gx + "," + gy]) {
        delete ch.shopStalls[gx + "," + gy];
        try { window.World.saveChunk(ch); } catch (e) {}
        try { window.UI.toast("💥 A player stall crumbles.", 3000); } catch (e) {}
      }
      // home portals die with their tile
      if (ch && Array.isArray(ch.pois)) {
        const i = ch.pois.findIndex(q => q && q.gx === gx && q.gy === gy && q.home);
        if (i >= 0) {
          ch.pois.splice(i, 1);
          try { window.World.saveChunk(ch); } catch (e) {}
          try { window.UI.toast("💥 Your home portal collapses.", 3000); } catch (e) {}
        }
      }
    } catch (e) {}
  }
  function stallAt(gx, gy) {
    try {
      const ch = window.Game.chunkAt(gx, gy);
      if (ch && ch.shopStalls && ch.shopStalls[gx + "," + gy]) return { stall: ch.shopStalls[gx + "," + gy], chunk: ch };
    } catch (e) {}
    return null;
  }
  function homePortalPoi(poi) { return !!(poi && poi.type === "portal" && poi.home); }
  function openHomePortal(poi) {
    try {
      const p = window.Game.G.player;
      const name = "Home";
      const x = poi.gx + 0.5, y = poi.gy + 0.5;
      // E menu: travel is via map; binding is instant here (E sets respawn)
      if (window.Game.setRespawnHearth) window.Game.setRespawnHearth(name, x, y);
      try { window.Game.saveGame(true); } catch (e) {}
      try { window.UI.toast(`🌀 Home portal bound — you will wake here (${Math.round(x)}, ${Math.round(y)}). E again + map to travel.`, 4000); } catch (e) {}
      // also open normal travel so they can leave immediately
      try { if (window.UI.openHearthTravel) window.UI.openHearthTravel(); } catch (e) {}
    } catch (e) {}
  }

  // ---- shop nexus furniture ----
  // Counters/tables/racks/mats inside shop-class buildings anchor the menu.
  const SHOP_NEXUS = {
    market: ["counter", "shelf", "crate"],
    smith: ["anvil", "furnace", "rack"],
    tea: ["lowtable", "kettle"],
    library: ["shelf"],
    dojo: ["mat", "drum", "rack"],
    blackmarket: ["counter", "crate", "rug"],
    arcane: ["runecircle", "altar", "shelf"],
    stable: ["nexus"],
    court: ["throne", "longtable", "counter"],
  };
  function nearestShop(px, py, maxD) {
    try {
      if (window.Game.G.player.inDungeon) return null;
      const out = [];
      // settlement buildings: find shop-class buildings whose nexus is near
      const near = window.Buildings.buildingsInView
        ? window.Buildings.buildingsInView(Math.floor(px) - 3, Math.floor(px) + 3, Math.floor(py) - 3, Math.floor(py) + 3)
        : [];
      const list = Array.isArray(near) && near.length ? near : allNearBuildings(px, py);
      for (const b of (list || [])) {
        const kind = shopKindForBuilding(b);
        if (!kind) continue;
        const wants = SHOP_NEXUS[kind] || ["counter"];
        let found = false;
        for (const f of (b.furniture || [])) {
          if (!f || wants.indexOf(f.kind) < 0) continue;
          try { if (window.Buildings && window.Buildings.isFurnGone && window.Buildings.isFurnGone(f.x, f.y)) continue; } catch (e) {}
          found = true;
          const d = Math.hypot(f.x + 0.5 - px, f.y + 0.5 - py);
          if (d <= (maxD || 1.8)) out.push({ building: b, kind, nexus: f, d });
        }
        // every nexus piece smashed: the counter is gone but the shop keeps
        // trading from the bare floor (building center stands in)
        if (!found && !b.stallKind) {
          try {
            if (window.Buildings && window.Buildings.buildingCollapsed && window.Buildings.buildingCollapsed(b)) continue;
            const cx = b.x0 + b.w / 2, cy = b.y0 + b.h / 2;
            const d = Math.hypot(cx - px, cy - py);
            if (d <= (maxD || 1.8) + 2) out.push({ building: b, kind, nexus: { x: Math.floor(cx), y: Math.floor(cy), kind: "counter" }, d });
          } catch (e) {}
        }
        // stable-charter pens + permit stalls: any tile of the stall works
        if (b.stallKind) {
          const d = Math.hypot(b.x0 + 0.5 - px, b.y0 + 0.5 - py);
          if (d <= (maxD || 1.8) + 2) out.push({ building: b, kind, nexus: { x: b.x0, y: b.y0, kind: "counter" }, d });
        }
      }
      // player-placed 1-tile stalls (chunk.shopStalls)
      try {
        const G = window.Game.G;
        for (const ch of G.chunks.values()) {
          if (!ch || !ch.shopStalls) continue;
          for (const k of Object.keys(ch.shopStalls)) {
            const rec = ch.shopStalls[k];
            if (!rec) continue;
            const [sx, sy] = k.split(",").map(Number);
            const d = Math.hypot(sx + 0.5 - px, sy + 0.5 - py);
            if (d <= (maxD || 1.8)) {
              out.push({ building: { x0: sx, y0: sy, x1: sx, y1: sy, w: 1, h: 1, title: SHOP_TITLE[rec.kind] || "Stall", classKey: rec.charter, stallKind: rec.charter }, kind: rec.kind, nexus: { x: sx, y: sy, kind: "counter" }, d, stallKey: k, chunk: ch });
            }
          }
        }
      } catch (e) {}
      // fellow travelers' charter stalls (pos-channel overlays): visible +
      // usable while they're near. Stock/prices are programmatic (or your own
      // herd for stable pens), so sharing a counter is safe. Render + E-use
      // merge; smashing still resolves through the tile channel.
      try {
        if (window.MP && window.MP.getRemotes && window.Game && window.Game.G && window.Game.G.player && !window.Game.G.player.inDungeon) {
          const ST = (window.MP.PL_STALL || ["market", "smith", "dojo", "arcane", "stable"]);
          const CH = { market: "permit_market", smith: "permit_blacksmith", dojo: "permit_dojo", arcane: "permit_arcane", stable: "permit_stable" };
          let myDim = "surf";
          try { const _pp = window.Game.G.player; myDim = (_pp && _pp.dim === "hell") ? "hell" : "surf"; } catch (e2) {}
          const rems = window.MP.getRemotes() || [];
          for (const r of rems) {
            if (!r || !Array.isArray(r.pl) || !r.pl.length) continue;
            for (const q of r.pl) {
              if (!q || !isFinite(+q[0]) || !isFinite(+q[1])) continue;
              const code = (+q[2]) | 0;
              if (code < 16 || code >= 16 + ST.length) continue;
              if (((+q[3] === 1) ? "hell" : "surf") !== myDim) continue;
              const skind = ST[code - 16];
              const sx = Math.floor(+q[0]), sy = Math.floor(+q[1]);
              const d = Math.hypot(sx + 0.5 - px, sy + 0.5 - py);
              if (d <= (maxD || 1.8)) {
                const charter = CH[skind] || ("permit_" + skind);
                out.push({ building: { x0: sx, y0: sy, x1: sx, y1: sy, w: 1, h: 1, title: (SHOP_TITLE[skind] || "Stall") + " (ally)", classKey: charter, stallKind: charter }, kind: skind, nexus: { x: sx, y: sy, kind: "counter" }, d, stallKey: "remote:" + sx + "," + sy, chunk: null, remote: true });
              }
            }
          }
        }
      } catch (e) {}
      if (!out.length) return null;
      out.sort((a, b) => a.d - b.d);
      return out[0];
    } catch (e) { return null; }
  }
  function allNearBuildings(px, py) {
    try {
      const s = window.World.settlementAt ? window.World.settlementAt(Math.floor(px), Math.floor(py)) : null;
      const arr = [];
      if (s && window.Buildings.settlementBuildings) for (const b of window.Buildings.settlementBuildings(s)) arr.push(b);
      // surface-only: hell's 0,0 is void and heaven's 0,0 is the pantheon — never the origin town.
      else if (window.Buildings.originBuildings && (window.World && window.World.getDim && window.World.getDim() === "surf")) for (const b of window.Buildings.originBuildings()) arr.push(b);
      return arr.filter(b => b && Math.abs((b.x0 + b.w / 2) - px) < 30 && Math.abs((b.y0 + b.h / 2) - py) < 30);
    } catch (e) { return []; }
  }

  // ---- modal UI ----
  let cur = null; // {kind, building}
  let shopTab = "all", shopSort = "name", shopQuery = "";
  // category sub-filter under the 💰 Trade section (smith/arcane/dojo):
  // section tabs pick the service, this picks the item class — never mixed.
  let tradeCat = "all";
  function ensureModal() {
    let m = document.getElementById("shopModal");
    if (m) return m;
    m = document.createElement("div");
    m.className = "modal";
    m.id = "shopModal";
    m.hidden = true;
    m.innerHTML = `<div class="card" style="max-width:980px"><h2 id="shopTitle">🏪 Shop</h2>
      <p id="shopDesc" style="font-size:12px;opacity:0.8"></p>
      <div class="menu-eyebrow tabs">🗂️ Sections — pick a service (categories filter the 💰 Trade list)</div>
      <div id="shopTabs" class="itabs" style="margin:6px 0" role="tablist" aria-label="Shop categories"></div>
      <div style="display:flex;gap:8px;margin:6px 0;flex-wrap:wrap;align-items:center">
        <label style="font-size:11px;font-weight:900;letter-spacing:1px;opacity:0.8">SORT + SEARCH</label>
        <select id="shopSort" title="Sort shop and pack lists" aria-label="Sort shop and pack lists"><option value="name">Sort: Name</option><option value="priceAsc">Sort: Price ↑</option><option value="priceDesc">Sort: Price ↓</option></select>
        <input id="shopSearch" type="text" placeholder="🔍 Search shop + your pack…" aria-label="Search shop and pack" style="flex:1;min-width:140px;padding:8px;border-radius:8px;border:1px solid #3a4a5a;background:#0d141b;color:#fff">
        <span id="shopGold" style="font-weight:900"></span>
      </div>
      <div class="invwrap" style="display:flex;gap:10px"><div id="shopList" style="flex:1"></div><div id="shopPack" class="invside" style="flex:1"></div></div>
      <div id="shopExtra"></div>
      <div style="margin-top:8px"><button id="shopCloseBtn" class="ghost">Close (Esc)</button></div></div>`;
    document.body.appendChild(m);
    m.querySelector("#shopCloseBtn").onclick = closeShop;
    m.querySelector("#shopSort").onchange = (e) => { shopSort = e.target.value; renderShop(); };
    m.querySelector("#shopSearch").oninput = (e) => { shopQuery = e.target.value; renderShopLists(); };
    return m;
  }
  function openShop(kind, building) {
    cur = { kind, building: building || null };
    shopTab = "all"; shopQuery = ""; tradeCat = "all";
    try { window.Entities.ensureProgression(window.Game.G.player); } catch (e) {}
    const m = ensureModal();
    m.hidden = false;
    renderShop();
  }
  function closeShop() { try { document.getElementById("shopModal").hidden = true; } catch (e) {} cur = null; }
  function isOpen() { try { return !document.getElementById("shopModal").hidden; } catch (e) { return false; } }
  function itemTypeLabel(id) {
    try {
      const it = window.Items.ITEMS[id];
      if (!it) return "misc";
      if (it.type === "spellbook") return "tomes";
      if (it.type === "ammo") return "ammo";
      if (it.type === "consumable") return "consumables";
      if (it.type === "material") return "materials";
      if (it.type === "placeable") return "kits";
      if (it.type === "equipment") {
        if (it.slot === "weapon") return it.bow ? "bows" : "weapons";
        if (it.slot === "armor") return "armor";
        if (it.slot === "shield") return "shields";
        return "trinkets";
      }
      return it.type || "misc";
    } catch (e) { return "misc"; }
  }
  function renderShop() {
    if (!cur) return;
    const m = ensureModal();
    const { kind } = cur;
    m.querySelector("#shopTitle").textContent = SHOP_TITLE[kind] || "🏪 Shop";
    const descs = {
      market: "Fair prices, unlimited supply: medicines, ores, wood and base materials. No weapons or armor — see the smithy.",
      smith: "Low-tier melee weapons, shields and armor at fair prices (unlimited). Bows + whips moved to the 🧬 beast lodge 🏹 Tack; kasayas to dojos, habitus to altar vestries. Sells nothing high-tier, but BUYS your high-tier gear for a fair price. The ⬆️ Upgrade bench still hones melee weapons, bows, armor and shields (+50% flat stats/level per copy, 5 max) and names them free with ✏️.",
      tea: "Teas, brews and trail goods — served like a market.",
      library: "Low to mid spell tomes for the studious. Cataclysm lore never shelved here.",
      dojo: "🥋 Sells low-tier striker wraps (patched + ironthread kasaya). Separate 🥋 Refund (1000g/stat) and ⬆️ Upgrade tabs: the workbench boosts striker wraps (+50% flat stats/level per copy, 5 max) and names them free with ✏️.",
      blackmarket: "🌑 No questions. Drugs, off-book beasts and bound labor.",
      arcane: "✨ Trades quartz/ruby wands, staves and robes plus tomes and reagents — enchanting lives on the ✨ Enchant tab, upgrades on the ⬆️ Upgrade tab (robes, staves, wands). Enchant price = weapon tier × enchantment strength.",
      stable: "Player stable pen — store and retrieve tames here.",
      court: "👑 The King sells placement charters — found your own stalls anywhere.",
    };
    m.querySelector("#shopDesc").textContent = descs[kind] || "";
    if (m.querySelector("#shopSort")) m.querySelector("#shopSort").value = shopSort;
    renderShopTabs();
    renderShopLists();
    // black-market Beasts/Slaves live in the left column (lifted there by
    // renderShopLists) — re-rendering Extra would duplicate them below.
    if (!(kind === "blackmarket" && (shopTab === "beasts" || shopTab === "slaves"))) renderShopExtra();
  }
  function renderShopTabs() {
    const m = ensureModal();
    const box = m.querySelector("#shopTabs");
    box.innerHTML = "";
    const { kind } = cur;
    if (kind === "stable" || kind === "court") return;
    const tabBtn = (label, active, title, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.title = (title || label) + " — tab (switches the section below)";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.className = "active";
      b.onclick = fn;
      box.appendChild(b);
      return b;
    };
    // category sub-row: lives UNDER the 💰 Trade section (never beside
    // the service tabs) — picks the item class within the trade lists only.
    const catSubRow = (ids, cats) => {
      if (cats.length < 2) return;
      const sub = document.createElement("div");
      sub.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 6px 0;flex-basis:100%;width:100%";
      sub.setAttribute("role", "tablist");
      sub.setAttribute("aria-label", "Trade categories");
      for (const c of cats) {
        const b = document.createElement("button");
        b.textContent = c === "all" ? `All ×${ids.length}` : c;
        b.title = (c === "all" ? "all" : c) + " — filter (trade list only)";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", tradeCat === c ? "true" : "false");
        b.className = tradeCat === c ? "active" : "ghost";
        b.onclick = ((cc) => () => { tradeCat = cc; renderShop(); })(c);
        sub.appendChild(b);
      }
      box.appendChild(sub);
    };
    // fold a legacy category value (pre-section state) into the sub-row.
    const foldCat = (cats) => {
      if (cats.includes(shopTab)) { tradeCat = shopTab; shopTab = "trade"; }
      if (!cats.includes(tradeCat)) tradeCat = "all";
    };
    let ids = [];
    if (kind === "blackmarket") {
      // Tabs stay readable (Drugs/Beasts/Slaves) but the piles below stay messy on purpose.
      for (const t of ["goods", "beasts", "slaves"]) {
        tabBtn(t === "goods" ? "💊 Drugs" : t === "beasts" ? "🐾 Beasts" : "⛓️ Slaves",
          shopTab === t || (shopTab === "all" && t === "goods"), t,
          () => { shopTab = t; renderShopTabs(); renderShopLists(); if (shopTab !== "beasts" && shopTab !== "slaves") renderShopExtra(); });
      }
      if (shopTab !== "goods" && shopTab !== "beasts" && shopTab !== "slaves") shopTab = "goods";
      return;
    }
    if (kind === "arcane") {
      // sections on top, categories as a sub-row under 💰 Trade (their
      // UIs live in renderShopExtra and show only on that tab).
      ids = stockFor(kind);
      const cats = ["all", ...new Set(ids.map(itemTypeLabel))];
      foldCat(cats);
      if (shopTab !== "trade" && shopTab !== "enchant" && shopTab !== "upgrade") shopTab = "trade";
      tabBtn("💰 Trade", shopTab === "trade", "Trade quartz/ruby wands, staves and robes",
        () => { shopTab = "trade"; renderShop(); });
      tabBtn("✨ Enchant", shopTab === "enchant", "Enchant weapons (separate workbench)",
        () => { shopTab = "enchant"; renderShop(); });
      tabBtn("⬆️ Upgrade", shopTab === "upgrade", "Upgrade robes, staves, wands (+50% flat stats/level, 5 max)",
        () => { shopTab = "upgrade"; renderShop(); });
      if (shopTab === "trade") catSubRow(ids, cats);
      return;
    }
    if (kind === "smith") {
      // sections on top, categories as a sub-row under 💰 Trade — the
      // workbench UI lives in renderShopExtra on the ⬆️ Upgrade tab.
      ids = stockFor(kind);
      const cats = ["all", ...new Set(ids.map(itemTypeLabel))];
      foldCat(cats);
      if (shopTab !== "trade" && shopTab !== "upgrade") shopTab = "trade";
      tabBtn("💰 Trade", shopTab === "trade", "Buy low-tier melee, armor, shields",
        () => { shopTab = "trade"; renderShop(); });
      tabBtn("⬆️ Upgrade", shopTab === "upgrade", "Upgrade melee, bows, armor, shields (+50% flat stats/level, 5 max)",
        () => { shopTab = "upgrade"; renderShop(); });
      if (shopTab === "trade") catSubRow(ids, cats);
      return;
    }
    if (kind === "dojo") {
      // sections on top, categories as a sub-row under 💰 Trade — 🥋 Refund
      // and ⬆️ Upgrade are separate tabs instead of one stacked scroll.
      ids = stockFor(kind);
      const cats = ["all", ...new Set(ids.map(itemTypeLabel))];
      foldCat(cats);
      if (shopTab !== "trade" && shopTab !== "refund" && shopTab !== "upgrade") shopTab = "trade";
      tabBtn("💰 Trade", shopTab === "trade", "Buy low-tier kasayas",
        () => { shopTab = "trade"; renderShop(); });
      tabBtn("🥋 Refund", shopTab === "refund", "Refund assigned stat points (1000g each)",
        () => { shopTab = "refund"; renderShop(); });
      tabBtn("⬆️ Upgrade", shopTab === "upgrade", "Upgrade kasayas (+50% flat stats/level, 5 max)",
        () => { shopTab = "upgrade"; renderShop(); });
      if (shopTab === "trade") catSubRow(ids, cats);
      return;
    }
    // trade-only shops (market/tea/library): no service sections, so the
    // categories stay a single row — nothing to confuse them with.
    ids = stockFor(kind);
    const cats = ["all", ...new Set(ids.map(itemTypeLabel))];
    for (const c of cats) {
      tabBtn(c === "all" ? `All ×${ids.length}` : c,
        shopTab === c || !cats.includes(shopTab), c,
        () => { shopTab = c; renderShop(); });
    }
    if (!cats.includes(shopTab)) shopTab = "all";
  }
  function sortIds(ids, kind, dir) {
    const pri = (id) => dir === "sell" ? askPrice(kind, id) : bidPrice(kind, id);
    const q = (shopQuery || "").trim().toLowerCase();
    let arr = ids.slice();
    if (q) arr = arr.filter(id => { try { return (window.Items.ITEMS[id].name || id).toLowerCase().includes(q); } catch (e) { return true; } });
    arr.sort((a, b) => {
      if (shopSort === "priceAsc") return pri(a) - pri(b);
      if (shopSort === "priceDesc") return pri(b) - pri(a);
      try { return (window.Items.ITEMS[a].name || a).localeCompare(window.Items.ITEMS[b].name || b); } catch (e) { return 0; }
    });
    return arr;
  }
  function renderShopLists() {
    if (!cur) return;
    const m = ensureModal();
    const { kind, building } = cur;
    const list = m.querySelector("#shopList"), pack = m.querySelector("#shopPack");
    list.innerHTML = ""; pack.innerHTML = "";
    try { m.querySelector("#shopGold").textContent = `🪙 ${(window.Game.G.player.gold | 0)}g`; } catch (e) {}
    if (kind === "stable" || kind === "court") { renderShopExtra(); return; }
    if (kind === "blackmarket" && (shopTab === "beasts" || shopTab === "slaves")) {
      renderShopExtra();
      renderPackPane(pack, kind);
      // Beasts/Slaves own the LEFT column like Drugs does: lift the section
      // out of the below-the-fold Extra strip into the cleared left list,
      // so every tab reads the same (items left, pack right, nothing below).
      try {
        const extra = ensureModal().querySelector("#shopExtra");
        if (extra) while (extra.firstChild) list.appendChild(extra.firstChild);
      } catch (e) {}
      return;
    }
    // arcane enchanting + upgrades live on their own tabs — no buy/sell
    // lists there (their UIs render via renderShopExtra below). Same for
    // the smithy upgrade bench and the dojo refund + upgrade tabs.
    if (kind === "arcane" && shopTab !== "trade") return;
    if (kind === "smith" && shopTab !== "trade") return;
    if (kind === "dojo" && shopTab !== "trade") return;
    // left: shop stock
    let ids = stockFor(kind === "blackmarket" ? "blackmarket" : kind);
    if (kind === "dojo" || kind === "smith" || kind === "arcane") {
      // section shops filter by the Trade sub-row, never the section tabs.
      if (tradeCat !== "all") ids = ids.filter(id => itemTypeLabel(id) === tradeCat);
    }
    else if (shopTab !== "all" && shopTab !== "goods") ids = ids.filter(id => itemTypeLabel(id) === shopTab);
    if (kind === "blackmarket") ids = ["crimson_rage", "ironmind_draught", "swiftshade"];
    ids = sortIds(ids, kind, "sell");
    const h = document.createElement("div");
    if (kind === "blackmarket") {
      // INTENTIONALLY MESSY: black markets are disorganized by theme — keep
      // the cramped handwritten vibe (user asked to leave it). Only the tab
      // row above got labels; the goods pile below stays chaotic.
      h.className = "psec-sub";
      h.textContent = `💊 Drugs (unlimited) — ${ids.length} to pick through`;
    } else {
      h.className = "shop-col-head shop";
      const t = document.createElement("span");
      t.textContent = `🛒 Shop stock · ${ids.length} items — tap Buy`;
      const s = document.createElement("span");
      s.className = "sub";
      s.textContent = `sells at ${Math.round(sellMult(kind) * 100)}% · unlimited`;
      h.appendChild(t); h.appendChild(s);
    }
    list.appendChild(h);
    for (const id of ids) {
      const it = window.Items.ITEMS[id];
      if (!it) continue;
      const row = document.createElement("div");
      row.className = "trow shoprow";
      const nm = document.createElement("span");
      nm.className = "tn";
      nm.innerHTML = `${window.Icons ? window.Icons.img("item", id, 20) : ""} ${it.name} — ${askPrice(kind, id)}g`;
      nm.title = it.desc || "";
      row.appendChild(nm);
      const b = document.createElement("button");
      b.textContent = "Buy";
      b.onclick = () => { const r = buyFromShop(kind, id, 1); toast(r.msg); renderShopLists(); };
      row.appendChild(b);
      list.appendChild(row);
    }
    renderPackPane(pack, kind);
  }
  function renderPackPane(pack, kind) {
    pack.innerHTML = "";
    const h = document.createElement("div");
    if (kind === "blackmarket") {
      // Black-market pack stays as-is (messy on purpose — see above).
      h.className = "psec-sub";
      h.textContent = `🎒 Your pack — sells at ${Math.round(buyMult(kind) * 100)}% of base`;
    } else {
      h.className = "shop-col-head pack";
      const t = document.createElement("span");
      t.textContent = "🎒 Your pack — tap Sell";
      const s = document.createElement("span");
      s.className = "sub";
      s.textContent = `buys at ${Math.round(buyMult(kind) * 100)}%`;
      h.appendChild(t); h.appendChild(s);
    }
    pack.appendChild(h);
    let inv = [];
    try { inv = (window.Game.G.player.inventory || []).filter(s => s && s.id && (s.n | 0) > 0); } catch (e) {}
    let sellable = inv.filter(s => shopBuys(kind, s.id));
    // smith buys everything equipment (esp high-tier gear)
    if (kind === "smith") {
      sellable = inv.filter(s => { try { const it = window.Items.ITEMS[s.id]; return it && (it.type === "equipment" || it.type === "material"); } catch (e) { return false; } });
    }
    const q = (shopQuery || "").trim().toLowerCase();
    if (q) sellable = sellable.filter(s => { try { return (window.Items.ITEMS[s.id].name || s.id).toLowerCase().includes(q); } catch (e) { return true; } });
    sellable.sort((a, b) => {
      if (shopSort === "priceAsc") return bidPrice(kind, a.id) - bidPrice(kind, b.id);
      if (shopSort === "priceDesc") return bidPrice(kind, b.id) - bidPrice(kind, a.id);
      try { return (window.Items.ITEMS[a.id].name || a.id).localeCompare(window.Items.ITEMS[b.id].name || b.id); } catch (e) { return 0; }
    });
    if (!sellable.length) {
      const d = document.createElement("div");
      d.style.cssText = "font-size:12px;opacity:0.7";
      d.textContent = kind === "market" ? "Markets don't buy weapons or armor — try the smithy." : "Nothing they want.";
      pack.appendChild(d);
      return;
    }
    for (const s of sellable.slice(0, 80)) {
      const it = window.Items.ITEMS[s.id];
      if (!it) continue;
      const row = document.createElement("div");
      row.className = "trow shoprow";
      const nm = document.createElement("span");
      nm.className = "tn";
      let lbl = it.name;
      try {
        lbl = window.Items.variantName(s);
        const up = window.Items.stackUp(s);
        if (up > 0) lbl += ` +${up * (window.Items.GEAR_UP_PCT || 50)}%`;
      } catch (e) {}
      nm.innerHTML = `${window.Icons ? window.Icons.img("item", s.id, 20) : ""} `;
      nm.appendChild(document.createTextNode(`${s.n > 1 ? s.n + "x " : ""}${lbl} — ${bidPrice(kind, s.id)}g`));
      nm.title = it.desc || "";
      row.appendChild(nm);
      const b = document.createElement("button");
      b.textContent = (s.n | 0) > 1 ? "Sell 1" : "Sell";
      b.className = "ghost";
      b.onclick = () => { const r = sellToShop(kind, s.id, 1, s); toast(r.msg); renderShopLists(); };
      row.appendChild(b);
      pack.appendChild(row);
    }
  }
  // ---- gear upgrades: the per-venue workbench (shared by smith, arcane,
  // dojo and holy-altar UIs) ----
  // Each venue upgrades only its own gear (see Items.gearUpgradeVenue):
  // forge = melee/bows/mundane armor/shields, arcane = robes/staves/wands,
  // holy = habitus, dojo = kasaya. Work is per COPY: every stack lists its
  // own row with its own levels (+50% of base flat stats each, 5 max); cost
  // doubles per level from half price. ✏️ names one copy (free) — named and
  // worked pieces always list separately, even from identical kin.
  const UPGRADE_VENUE_NAME = { forge: "forge", arcane: "arcane circle", holy: "altar", dojo: "dojo" };
  const UPGRADE_STAT_LABEL = { atk: "ATK", matk: "MATK", def: "DEF", sdef: "SDEF", maxHp: "HP", maxMp: "MP", maxStamina: "ST", spd: "SPD" };
  function upgradeStatLine(id, lvl) {
    try {
      const it = window.Items.ITEMS[id];
      if (!it || !it.bonus) return "";
      const keys = window.Items.gearUpgradeStats(id);
      if (!keys.length) return "";
      const fmt = (l) => keys.map(k => {
        const base = it.bonus[k];
        const v = base * (1 + l * ((window.Items.GEAR_UP_STEP == null ? 0.5 : window.Items.GEAR_UP_STEP)));
        const r = Math.abs(v) < 10 ? Math.round(v * 10) / 10 : Math.round(v);
        return `+${r} ${UPGRADE_STAT_LABEL[k] || k}`;
      }).join(", ");
      if (lvl <= 0) return fmt(0) + ` → +${(window.Items.GEAR_UP_PCT == null ? 50 : window.Items.GEAR_UP_PCT)}% (lvl 1)`;
      const max = (window.Items.GEAR_UP_MAX == null ? 5 : window.Items.GEAR_UP_MAX);
      if (lvl >= max) return fmt(lvl) + " (MAX)";
      return fmt(lvl) + " → " + fmt(lvl + 1);
    } catch (e) { return ""; }
  }
  function renderUpgradeSection(box, venue, onDone) {
    try {
      const p = window.Game.G.player;
      const I = window.Items;
      const h = document.createElement("div");
      h.className = "psec-sub";
      const vnm = UPGRADE_VENUE_NAME[venue] || venue;
      h.textContent = `⬆️ Upgrade at the ${vnm} — +${(window.Items.GEAR_UP_PCT == null ? 50 : window.Items.GEAR_UP_PCT)}% of base flat stats per level per piece (max +${(window.Items.GEAR_UP_MAX || 5) * (window.Items.GEAR_UP_PCT == null ? 50 : window.Items.GEAR_UP_PCT)}%). First level costs half price, then full price, doubling each level. ✏️ names one copy free — named and worked pieces list on their own rows.`;
      box.appendChild(h);
      let owned = [];
      try {
        owned = (p.inventory || []).filter(s => s && s.id && (s.n | 0) > 0 && I.gearUpgradeVenue(s.id) === venue);
      } catch (e) { }
      const dname = (s) => { try { return I.variantName(s); } catch (e) { return (I.ITEMS[s.id] || {}).name || s.id; } };
      const dup = (s) => { try { return I.stackUp(s); } catch (e) { return 0; } };
      owned.sort((a, b) => {
        try { return dname(a).localeCompare(dname(b)) || dup(a) - dup(b); } catch (e) { return 0; }
      });
      if (!owned.length) {
        const d = document.createElement("div");
        d.style.cssText = "font-size:12px;opacity:0.7";
        d.textContent = venue === "holy" ? "No habitus in your pack — the altar blesses only worn tunics of the devoted."
          : venue === "dojo" ? "No kasaya in your pack — the dojo hones only striker wraps."
          : venue === "arcane" ? "No robes, staves or wands in your pack."
          : "No melee weapons, bows, armor or shields in your pack.";
        box.appendChild(d);
        return;
      }
      const max = (I.GEAR_UP_MAX == null ? 5 : I.GEAR_UP_MAX);
      for (const s of owned) {
        const id = s.id;
        const it = I.ITEMS[id];
        if (!it) continue;
        const lvl = dup(s);
        const nick = (() => { try { return I.stackNick(s); } catch (e) { return ""; } })();
        const info = I.gearUpgradeCostFor(id, lvl);
        const row = document.createElement("div");
        row.className = "trow shoprow";
        const nm = document.createElement("span");
        nm.className = "tn";
        let worn = "";
        try {
          const eq = p.equipment || {};
          const slot = it.slot;
          if (eq[slot] === id && I.wornVariantOf) {
            const wv = I.wornVariantOf(p, slot);
            if (wv.up === lvl && wv.nick === nick) worn = " (worn)";
          }
        } catch (e) { }
        const pips = "●".repeat(lvl) + "○".repeat(Math.max(0, max - lvl));
        const cnt = (s.n | 0) > 1 ? (" ×" + (s.n | 0)) : "";
        nm.innerHTML = "";
        try { const _im = document.createElement("span"); _im.innerHTML = window.Icons ? window.Icons.img("item", id, 20) : ""; nm.appendChild(_im); } catch (e) { }
        nm.appendChild(document.createTextNode(` ${dname(s)}${nick ? ` (${it.name})` : ""}${cnt}${worn} — ${pips} ${lvl ? "+" + (lvl * (I.GEAR_UP_PCT || 50)) + "%" : "unboosted"}`));
        nm.title = upgradeStatLine(id, lvl) + ` — base price ${I.gearBasePrice(id)}g`;
        row.appendChild(nm);
        // rename one copy (free): splits a xN stack, follows the worn blade
        const rwrap = document.createElement("span");
        rwrap.style.cssText = "display:inline-flex;gap:4px;margin-left:6px;align-items:center";
        const rin = document.createElement("input");
        rin.type = "text"; rin.maxLength = 24; rin.size = 10;
        rin.placeholder = "Name this piece…"; rin.value = nick || "";
        rin.title = "Give this copy a name (free). Empty + Rename clears the name.";
        rin.onclick = (e) => { try { e.stopPropagation(); } catch (e2) { } };
        const rbtn = document.createElement("button");
        rbtn.textContent = nick ? "✏️ Rename" : "✏️ Name";
        rbtn.className = "ghost";
        rbtn.title = nick ? "Rename this copy (free)" : "Name this copy (free)";
        rbtn.onclick = ((stk, inp) => () => {
          const r = I.renameGear(stk.id, stk, inp.value);
          toast(r.msg);
          try {
            if (typeof onDone === "function") onDone();
            else if (cur && isOpen()) renderShop();
          } catch (e) { }
        })(s, rin);
        rwrap.appendChild(rin); rwrap.appendChild(rbtn);
        row.appendChild(rwrap);
        const b = document.createElement("button");
        if (lvl >= max) {
          b.textContent = "MAX";
          b.disabled = true;
        } else {
          b.textContent = `+${I.GEAR_UP_PCT || 50}% — ${info.cost}g`;
          b.disabled = (p.gold | 0) < info.cost;
          b.title = upgradeStatLine(id, lvl) + ` — upgrades ONE copy (${info.cost}g)`;
          b.onclick = ((stk) => () => {
            const r = I.doGearUpgrade(stk.id, stk);
            toast(r.msg);
            // shop benches re-render the shop; the altar modal passes its
            // own refresher (it is not a shop).
            try {
              if (typeof onDone === "function") onDone();
              else if (cur && isOpen()) renderShop();
            } catch (e) { }
          })(s);
        }
        row.appendChild(b);
        box.appendChild(row);
      }
    } catch (e) { }
  }
  function renderShopExtra() {
    const m = ensureModal();
    const box = m.querySelector("#shopExtra");
    box.innerHTML = "";
    if (!cur) return;
    const { kind, building } = cur;
    // gear-upgrade benches live on the ⬆️ Upgrade tab (smith + arcane).
    if ((kind === "smith" || kind === "arcane") && shopTab === "upgrade") {
      renderUpgradeSection(box, kind === "smith" ? "forge" : "arcane", () => renderShop());
      return;
    }
    if (kind === "dojo") {
      // refund + kasaya workbench live on their own tabs now (the 💰 Trade
      // tab shows only the stock/pack lists above, nothing below).
      if (shopTab === "upgrade") {
        const uh = document.createElement("div");
        uh.className = "psec-sub";
        uh.textContent = "🥋 Kasaya workbench";
        box.appendChild(uh);
        renderUpgradeSection(box, "dojo", () => renderShop());
        return;
      }
      if (shopTab !== "refund") return;
      const p = window.Game.G.player;
      const h = document.createElement("div");
      h.className = "psec-sub";
      h.textContent = `🥋 Refund stat points — 1000g each (unspent: ${p.statPoints | 0})`;
      box.appendChild(h);
      for (const k of Object.keys(window.CFG.STATS || {})) {
        const row = document.createElement("div");
        row.className = "trow";
        const nm = document.createElement("span");
        nm.className = "tn";
        nm.textContent = `${k}: ${p.stats[k] | 0}`;
        row.appendChild(nm);
        const b = document.createElement("button");
        b.textContent = "Refund 1000g";
        b.disabled = (p.stats[k] | 0) <= 5 || (p.gold | 0) < 1000;
        b.onclick = () => { const r = dojoRefund(k); toast(r.msg); renderShop(); };
        row.appendChild(b);
        box.appendChild(row);
      }
      return;
    }
    if (kind === "arcane" && shopTab === "enchant") {
      const h = document.createElement("div");
      h.className = "psec-sub";
      h.textContent = "✨ Choose a plain weapon, an enchantment and a strength. Bench-work and names carry onto the enchanted edge.";
      box.appendChild(h);
      let weapons = [];
      try {
        const inv = window.Game.G.player.inventory || [];
        inv.forEach((s, i) => {
          const it = window.Items.ITEMS[s.id];
          if (it && it.type === "equipment" && it.slot === "weapon" && !isEnchanted(it) && (s.n | 0) > 0) weapons.push({ s, i });
        });
      } catch (e) {}
      if (!weapons.length) {
        const d = document.createElement("div");
        d.style.cssText = "font-size:12px;opacity:0.7";
        d.textContent = "No plain weapons in your pack — enchanted ones can't be re-enchanted.";
        box.appendChild(d);
        return;
      }
      const wsel = document.createElement("select");
      for (const { s, i } of weapons) {
        const it = window.Items.ITEMS[s.id];
        const o = document.createElement("option");
        o.value = String(i);
        let lbl = it.name;
        try {
          lbl = window.Items.variantName(s);
          const up = window.Items.stackUp(s);
          if (up > 0) lbl += ` (+${up * (window.Items.GEAR_UP_PCT || 50)}%)`;
          if ((s.n | 0) > 1) lbl += ` ×${s.n | 0}`;
        } catch (e) {}
        o.textContent = `${lbl} (${weaponTierOf(it).label})`;
        wsel.appendChild(o);
      }
      const esel = document.createElement("select");
      for (const e of ENCHANTS) {
        const o = document.createElement("option");
        o.value = e.id;
        o.textContent = `${e.name} — ${e.desc}`;
        esel.appendChild(o);
      }
      const ssel = document.createElement("select");
      ssel.innerHTML = `<option value="minor">Minor</option><option value="greater">Greater (2.2×)</option>`;
      const go = document.createElement("button");
      go.textContent = "Enchant";
      const priceEl = document.createElement("span");
      priceEl.style.marginLeft = "8px";
      const upd = () => {
        try {
          const s = (window.Game.G.player.inventory || [])[Number(wsel.value)];
          const it = s && window.Items.ITEMS[s.id];
          const en = ENCHANTS.find(e => e.id === esel.value);
          priceEl.textContent = it && en ? `${enchantPrice(it, en, ssel.value)}g` : "";
        } catch (e) {}
      };
      wsel.onchange = upd; esel.onchange = upd; ssel.onchange = upd; upd();
      go.onclick = () => {
        const s = (window.Game.G.player.inventory || [])[Number(wsel.value)];
        if (!s) return;
        const r = doEnchant(s.id, esel.value, ssel.value, s);
        toast(r.msg); renderShop();
      };
      box.appendChild(wsel); box.appendChild(esel); box.appendChild(ssel); box.appendChild(go); box.appendChild(priceEl);
      return;
    }
    if (kind === "stable") {
      const d = document.createElement("div");
      d.style.cssText = "font-size:12px;opacity:0.8";
      d.textContent = "Player stable pen — use the settlement Stable for boxes and horse market; this pen anchors your base herd.";
      box.appendChild(d);
      const b = document.createElement("button");
      b.textContent = "🐴 Open Stable";
      b.onclick = () => { try { closeShop(); window.UI.openStable(building); } catch (e) {} };
      box.appendChild(b);
      return;
    }
    if (kind === "court") {
      const d = document.createElement("div");
      d.style.cssText = "font-size:12px;opacity:0.8;margin-bottom:6px";
      d.textContent = "The King grants charters to founders. Each is consumed on placement; stalls smash like walls.";
      box.appendChild(d);
      kingPermitsUI(box);
      return;
    }
    // Black-market tabs are strict: Drugs shows only drugs, Beasts only
    // beasts (+ selling your own), Slaves only slaves. (The old code showed
    // beasts+slaves inside Drugs and never entered this block on the Slaves
    // tab, so that tab rendered empty.)
    if (kind === "blackmarket" && (shopTab === "beasts" || shopTab === "slaves")) {
      if (shopTab === "beasts") {
        const list = ensureBeastStock(building);
        const h = document.createElement("div");
        h.className = "psec-sub";
        h.textContent = `🐾 Off-book beasts (low level, non-horse) — price by stats/level`;
        box.appendChild(h);
        if (!list.length) {
          const d = document.createElement("div");
          d.style.cssText = "font-size:12px;opacity:0.7";
          d.textContent = "Sold out — check back later.";
          box.appendChild(d);
        }
        list.forEach((s, i) => {
          const row = document.createElement("div");
          row.className = "trow shoprow";
          const nm = document.createElement("span");
          nm.className = "tn";
          nm.textContent = `🐾 ${s.name} lv${s.lv} (ATK ${s.atk} DEF ${s.def} HP ${s.maxHp}) — ${beastPrice(s)}g`;
          try { const gi = window.Entities && window.Entities.genderIcon ? window.Entities.genderIcon(s.gender) : ""; if (gi) nm.textContent = `🐾 ${gi} ${s.name} lv${s.lv} (ATK ${s.atk} DEF ${s.def} HP ${s.maxHp}) — ${beastPrice(s)}g`; } catch (e) { }
          nm.title = (s.abilities || []).join(", ");
          row.appendChild(nm);
          const b = document.createElement("button");
          b.textContent = "Buy";
          b.onclick = () => { const r = buyBeast(building, i); toast(r.msg); renderShop(); };
          row.appendChild(b);
          box.appendChild(row);
        });
        // sell your beasts
        const h2 = document.createElement("div");
        h2.className = "psec-sub";
        h2.textContent = "💰 Sell your beasts";
        box.appendChild(h2);
        const tames = (() => { try { return window.Game.G.player.tames || []; } catch (e) { return []; } })();
        if (!tames.length) {
          const d = document.createElement("div");
          d.style.cssText = "font-size:12px;opacity:0.7";
          d.textContent = "No tames to sell.";
          box.appendChild(d);
        } else {
          for (const t of tames.slice(0, 20)) {
            const row = document.createElement("div");
            row.className = "trow shoprow";
            const nm = document.createElement("span");
            nm.className = "tn";
            nm.textContent = `💛 ${t.name} lv${t.lv} — ${Math.max(100, Math.round(beastPrice(t) * 0.6 / 5) * 5)}g`;
            try { const gi = window.Entities && window.Entities.genderIcon ? window.Entities.genderIcon(window.Entities.ensureGender ? window.Entities.ensureGender(t) : t.gender) : ""; if (gi) nm.textContent = `💛 ${gi} ${t.name} lv${t.lv} — ${Math.max(100, Math.round(beastPrice(t) * 0.6 / 5) * 5)}g`; } catch (e) { }
            row.appendChild(nm);
            const b = document.createElement("button");
            b.textContent = "Sell";
            b.className = "ghost";
            b.onclick = () => { const r = sellBeast(t.id); toast(r.msg); renderShop(); };
            row.appendChild(b);
            box.appendChild(row);
          }
        }
      }
      if (shopTab === "slaves") {
        const list = ensureSlaveStock(building);
        const h = document.createElement("div");
        h.className = "psec-sub";
        h.textContent = "⛓️ Bound labor — takes one of your party friend slots (never a beast slot). No loyalty bar, breedable in beast lodges (needs one ♂ male + one ♀ female), never counts for taming. Slaves room at inns (E at any inn counter), never in stables.";
        box.appendChild(h);
        if (!list.length) {
          const d = document.createElement("div");
          d.style.cssText = "font-size:12px;opacity:0.7";
          d.textContent = "No bound labor today — check back later.";
          box.appendChild(d);
        }
        list.forEach((s, i) => {
          const row = document.createElement("div");
          row.className = "trow shoprow";
          const nm = document.createElement("span");
          nm.className = "tn";
          nm.textContent = `⛓️ ${s.name} lv${s.lv} — ${s.price}g`;
          try { const gi = window.Entities && window.Entities.genderIcon ? window.Entities.genderIcon(s.gender) : ""; if (gi) nm.textContent = `⛓️ ${gi} ${s.name} lv${s.lv} — ${s.price}g`; } catch (e) { }
          row.appendChild(nm);
          const b = document.createElement("button");
          b.textContent = "Buy";
          b.onclick = () => { const r = buySlave(building, i); toast(r.msg); renderShop(); };
          row.appendChild(b);
          box.appendChild(row);
        });
      }
    }
  }
  function toast(m) { try { window.UI.toast(m, 3000); } catch (e) {} }

  // ---- capital King (placement charter vendor, seated on the throne) ----
  // Guaranteed once per refresh: finds the capital grand_castle/castle_keep
  // near the viewer, ensures a lv80 monarch "King" sits at its throne.
  let _kingAt = 0;
  async function ensureKing() {
    try {
      const now = Date.now();
      if (now - _kingAt < 30000) return null;
      _kingAt = now;
      const G = window.Game.G;
      const p = G.player;
      if (!p || p.inDungeon) return null;
      // find capital building in nearby chunks (player bubble covers capitals)
      let best = null, bd = 1e9;
      try {
        const W = window.World, B = window.Buildings;
        if (!W || !B) return null;
        const candSets = [];
        try {
          const s0 = W.settlementAt ? W.settlementAt(Math.floor(p.x), Math.floor(p.y)) : null;
          if (s0 && s0.type === "capital" && B.settlementBuildings) candSets.push(B.settlementBuildings(s0));
        } catch (e) {}
        try {
          // surface-only: hell's 0,0 is void and heaven's 0,0 is the pantheon, never the origin town.
          if (B.originBuildings && (window.World && window.World.getDim && window.World.getDim() === "surf")) {
            const os = B.originSettlement ? B.originSettlement() : null;
            if (os && os.type === "capital") candSets.push(B.originBuildings());
          }
        } catch (e) {}
        // wide ring scan for a capital (capitals are far-off finds)
        if (!candSets.length) {
          for (let dy = -160; dy <= 160 && !candSets.length; dy += 32) for (let dx = -160; dx <= 160; dx += 32) {
            let s2 = null;
            try { s2 = W.settlementAt(Math.floor(p.x) + dx, Math.floor(p.y) + dy); } catch (e) {}
            if (s2 && s2.type === "capital") {
              try { candSets.push(B.settlementBuildings(s2)); } catch (e2) {}
              break;
            }
          }
        }
        for (const list of candSets) for (const b of (list || [])) {
          if (!b || (b.classKey !== "grand_castle" && b.classKey !== "castle_keep")) continue;
          if (B.buildingCollapsed && B.buildingCollapsed(b)) continue;
          const d = Math.hypot((b.x0 + b.w / 2) - p.x, (b.y0 + b.h / 2) - p.y);
          if (d < bd) { bd = d; best = b; }
        }
      } catch (e) {}
      if (!best || bd > 60) return null;
      // throne seat
      let tx = best.x0 + (best.w >> 1), ty = best.y0 + 1;
      try {
        const th = (best.furniture || []).find(f => f && f.kind === "throne");
        if (th) { tx = th.x + 0.5; ty = th.y + 0.5; }
        else { tx = best.x0 + best.w / 2; ty = best.y0 + best.h / 2; }
      } catch (e) {}
      // already have a living king nearby?
      try {
        for (const n of (window.Game.G.npcs || [])) {
          if (n && n.role === "monarch" && /king/i.test(n.name || "") && n.hp > 0) {
            if (Math.hypot((n.x ?? n.gx) - tx, (n.y ?? n.gy) - ty) < 24) return n;
          }
        }
      } catch (e) {}
      // search persisted NPCs too (avoid duplicates across refreshes)
      try {
        const all = await window.World.allNpcs();
        for (const n of (all || [])) {
          if (n && n.role === "monarch" && /king/i.test(n.name || "") && (n.hp | 0) > 0) {
            const d = Math.hypot((n.gx ?? 0) - tx, (n.gy ?? 0) - ty);
            if (d < 30) return n;
          }
        }
      } catch (e) {}
      let npc = null;
      try {
        // Full birth record: the old x/y/home-only shape minted id-less
        // records under storage key "j:undefined" (nameless "Villager" glitch).
        let _kck = null, _kpn = "Capital", _kdim = "surf", _kdist = 0;
        try {
          const _kcx = Math.floor(tx / 16), _kcy = Math.floor(ty / 16);
          if (window.World && window.World.chunkKey) _kck = window.World.chunkKey(_kcx, _kcy);
          try {
            const _kch = (window.Game && window.Game.G && window.Game.G.chunks && window.Game.G.chunks.get(_kcx + "," + _kcy))
              || (window.World && window.World._mem && window.World._mem.chunks && window.World._mem.chunks.get(_kck));
            if (_kch && _kch.placeName) _kpn = String(_kch.placeName).slice(0, 32);
          } catch (e2) {}
          if (window.World && window.World.getDim) _kdim = window.World.getDim();
          _kdist = Math.hypot(tx, ty);
        } catch (e2) {}
        npc = window.AIDirector.makeNpcObject({
          id: "king_" + Math.floor(tx) + "_" + Math.floor(ty),
          name: "King", role: "monarch", lv: 80,
          gx: tx, gy: ty, chunkKey: _kck, placeName: _kpn,
          dist: _kdist, dim: _kdim,
        });
        npc.lv = 80; npc.hp = npc.maxHp; npc.mp = npc.maxMp;
        npc.noRecruit = true; npc.kingVendor = true;
        try { window.World.saveNpc(npc); } catch (e) {}
        try { await window.Game.refreshNpcCache(); } catch (e) {}
      } catch (e) { return null; }
      return npc;
    } catch (e) { return null; }
  }
  function kingPermitsUI(container) {
    try {
      const h = document.createElement("div");
      h.className = "psec-sub";
      h.textContent = "👑 Royal charters — placeable stalls (consumed on set, breakable)";
      container.appendChild(h);
      for (const rec of PERMITS) {
        const row = document.createElement("div");
        row.className = "trow shoprow";
        const nm = document.createElement("span");
        nm.className = "tn";
        nm.textContent = `${rec.label} — ${rec.price}g`;
        nm.title = rec.blurb;
        row.appendChild(nm);
        const b = document.createElement("button");
        b.textContent = "Buy";
        b.onclick = () => { const r = buyPermit(rec.id); toast(r.msg); try { renderShop(); } catch (e) {} };
        row.appendChild(b);
        container.appendChild(row);
      }
    } catch (e) {}
  }
  // ---- slave breeding (NPC x NPC in beast lodges, never counts for taming) ----
  function slaveJobsEnsure(p) {
    try {
      p.slaveJobs = p.slaveJobs || [];
      return p.slaveJobs;
    } catch (e) { return []; }
  }
  function breedSlaveDeposit(aId, bId, building) {
    try {
      const p = window.Game.G.player;
      if (!p) return { ok: false, msg: "No hero." };
      const all = window.Game.G.npcs || [];
      const a = all.find(n => n && n.id === aId) || (p.party || []).map(id => null) && null;
      const aa = (window.World && window.World._mem) ? null : null;
      void aa;
      // resolve from cache + party ids + persisted
      const findNpc = (id) => {
        try {
          for (const n of (window.Game.G.npcs || [])) if (n && n.id === id) return n;
          // party ids may not be in cache slice; search persisted via World cache is async — use in-memory party objects if present
          if (p.partyObjs) for (const n of p.partyObjs) if (n && n.id === id) return n;
        } catch (e) {}
        return null;
      };
      const A = findNpc(aId), B = findNpc(bId);
      void a;
      if (!A || !B) return { ok: false, msg: "Bound pair gone." };
      if (A.role !== "slave" || B.role !== "slave") return { ok: false, msg: "Only bound slaves breed together." };
      if (A.id === B.id) return { ok: false, msg: "Pick two different souls." };
      if (!(A.hp > 0) || !(B.hp > 0)) return { ok: false, msg: "Only the living can breed." };
      // different genders only: same-sex pairs and genderless slaves refuse
      try {
        const sc = window.Entities.breedSexCompatible ? window.Entities.breedSexCompatible(A, B) : { ok: A.gender !== B.gender };
        if (!sc.ok) return { ok: false, msg: `⛓️ ${sc.msg || "Need a male and a female."}` };
      } catch (e) { }
      const cost = 400 + ((A.lv | 0) + (B.lv | 0)) * 60;
      if ((p.gold | 0) < cost) return { ok: false, msg: `Need ${cost}g.` };
      p.gold -= cost;
      const key = (() => { try { return window.Game.breedKeyFor(building); } catch (e) { return "beast_lodge"; } })();
      const nm = (() => { try { return window.Game.breedNameFor(building); } catch (e) { return "Beast Lodge"; } })();
      const job = { id: "s_" + Math.random().toString(36).slice(2, 9), aId: A.id, bId: B.id, slave: true, bestiaryKey: key, bestiaryName: nm, startAt: Date.now(), readyAt: Date.now() + 180000, cost };
      slaveJobsEnsure(p).push(job);
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      return { ok: true, job, cost };
    } catch (e) { return { ok: false, msg: "Bond failed." }; }
  }
  function breedSlaveCollect(jobId) {
    try {
      const p = window.Game.G.player;
      const arr = slaveJobsEnsure(p);
      const ji = arr.findIndex(j => j && j.id === jobId);
      if (ji < 0) return { ok: false, msg: "Pairing gone." };
      const job = arr[ji];
      if (Date.now() < (job.readyAt | 0)) return { ok: false, msg: "Not ready yet." };
      p.party = p.party || [];
      const max = (window.Game && window.Game.effectivePartyMax) ? window.Game.effectivePartyMax() : ((window.CFG && window.CFG.PARTY_MAX) || 4);
      // party full: the newborn can still room at an inn with a vacant paid
      // room — otherwise the pairing waits at the lodge (not consumed)
      let toInn = false;
      if (p.party.length >= max) {
        let open = -1;
        try { open = window.Game.innOpenSlot ? window.Game.innOpenSlot(p) : -1; } catch (e) { }
        if (!(open >= 0)) {
          let fee = 0;
          try { fee = window.Game.innRoomPrice ? window.Game.innRoomPrice(p) : 0; } catch (e2) { }
          return { ok: false, msg: `Your party is full (${max}/${max}) and no inn room is open${fee ? ` — buy room ${((p.innUnlock | 0) || 0) + 1} for ${fee}g first` : ""}, then collect. The pairing waits.` };
        }
        toInn = true;
      }
      arr.splice(ji, 1);
      const nm = "Ash";
      let npc = null;
      try {
      const names = ["Ash", "Bram", "Cessa", "Dorn", "Essa", "Fenn"];
        const n2 = names[(Math.random() * names.length) | 0];
        // Full birth record (id/pos/chunk/place): id-less saves used to land
        // under storage key "j:undefined" and surface as a nameless "Villager".
        let _bk = null, _bpn = "Wilds", _bdim = "surf";
        try {
          const _bcx = Math.floor((p.x + 1) / 16), _bcy = Math.floor(p.y / 16);
          if (window.World && window.World.chunkKey) _bk = window.World.chunkKey(_bcx, _bcy);
          try {
            const _bch = (window.Game && window.Game.G && window.Game.G.chunks && window.Game.G.chunks.get(_bcx + "," + _bcy))
              || (window.World && window.World._mem && window.World._mem.chunks && window.World._mem.chunks.get(_bk));
            if (_bch && _bch.placeName) _bpn = String(_bch.placeName).slice(0, 32);
          } catch (e2) {}
          if (window.World && window.World.getDim) _bdim = window.World.getDim();
        } catch (e2) {}
        npc = window.AIDirector.makeNpcObject({
          id: "npc_sl_" + Math.random().toString(36).slice(2, 9),
          name: n2 + " (slave)", role: "slave", lv: 1,
          gx: p.x + 1, gy: p.y, chunkKey: _bk, placeName: _bpn,
          dist: Math.hypot(p.x + 1, p.y), dim: _bdim,
        });
        if (!npc.id || npc.id === "undefined") npc.id = "npc_sl_" + Math.random().toString(36).slice(2, 9);
        npc.role = "slave"; npc.noLoyalty = true; npc.loyalty = 0; npc.slave = true;
        try { window.World.saveNpc(npc); } catch (e) {}
        if (toInn) {
          // party full: straight into the vacant paid inn room (already bought),
          // retrievable from any inn
          let filed = null;
          try {
            // findInnNpc only sees cached NPCs (saveNpc lands async), so
            // publish the newborn into the live list first
            const GN = window.Game.G;
            if (GN && Array.isArray(GN.npcs) && !GN.npcs.includes(npc)) GN.npcs.push(npc);
          } catch (e2) { }
          try { filed = window.Game.innFileGuest ? window.Game.innFileGuest(npc.id) : null; } catch (e2) { }
          if (!filed || !filed.ok) {
            // pairing was already spliced — re-queue it so nothing is lost
            try { arr.push(job); } catch (e3) { }
            return { ok: false, msg: "⚠️ " + ((filed && filed.msg) || "No open inn room. The pairing waits.") };
          }
        } else {
          // room already checked above: the newborn takes a party friend slot
          p.party.push(npc.id); npc.inParty = true; try { window.World.saveNpc(npc); } catch (e2) {}
        }
        try { window.Game.refreshNpcCache(); } catch (e) {}
      } catch (e) { return { ok: false, msg: "Birth failed." }; }
      try { window.Game.saveGame(true); window.UI.updateHUD(); } catch (e) {}
      void nm;
      return { ok: true, child: npc };
    } catch (e) { return { ok: false, msg: "Birth failed." }; }
  }

  // codex data: building specialities + exterior variant rendering
  const BUILDING_USE = {
    court: "👑 Royal court — the King sells placement charters (market/smith/dojo/arcane/stable).",
    market: "🏪 Fair-price goods: medicines, ores, wood and base materials (unlimited) plus the 🕊️ Ring of Mercy. No weapons or armor.",
    forge: "⚒️ Low-tier melee weapons, shields and armor at fair prices (unlimited); buys high-tier gear fairly. Bows + whips at the 🧬 beast lodge 🏹 Tack, kasayas at dojos, habitus at altar vestries. ⬆️ Upgrade bench: melee weapons, bows, armor, shields (+50% flat stats/level, 5 max).",
    forge_works: "⚒️ Low-tier melee weapons, shields and armor at fair prices (unlimited); buys high-tier gear fairly. Bows + whips at the 🧬 beast lodge 🏹 Tack, kasayas at dojos, habitus at altar vestries. ⬆️ Upgrade bench: melee weapons, bows, armor, shields (+50% flat stats/level, 5 max).",
    great_forge: "⚒️ Low-tier melee weapons, shields and armor at fair prices (unlimited); buys high-tier gear fairly. Bows + whips at the 🧬 beast lodge 🏹 Tack, kasayas at dojos, habitus at altar vestries. ⬆️ Upgrade bench: melee weapons, bows, armor, shields (+50% flat stats/level, 5 max).",
    smithy_shed: "⚒️ Low-tier melee weapons, shields and armor at fair prices (unlimited); buys high-tier gear fairly. Bows + whips at the 🧬 beast lodge 🏹 Tack, kasayas at dojos, habitus at altar vestries. ⬆️ Upgrade bench: melee weapons, bows, armor, shields (+50% flat stats/level, 5 max).",
    bronze_forge: "⚒️ Low-tier melee weapons, shields and armor at fair prices (unlimited); buys high-tier gear fairly. Bows + whips at the 🧬 beast lodge 🏹 Tack, kasayas at dojos, habitus at altar vestries. ⬆️ Upgrade bench: melee weapons, bows, armor, shields (+50% flat stats/level, 5 max).",
    tea_house: "🍵 Teas, brews and trail goods in a market-style menu.",
    caravanserai: "🍵 Teas, brews and trail goods in a market-style menu.",
    tavern_hall: "🍵 Teas, brews and trail goods in a market-style menu.",
    library: "📚 Low to mid spell tomes (market-style menu).",
    bookstore: "📚 Low to mid spell tomes (market-style menu).",
    counting_house: "📚 Low to mid spell tomes (market-style menu).",
    dojo: "🥋 Separate 💰 Trade (low-tier kasayas), 🥋 Refund (1000g per stat point) and ⬆️ Upgrade tabs. Kasaya workbench: +50% flat stats/level (5 max) for striker wraps.",
    black_market: "🌑 Drugs (temp buffs for HP/MP/stamina), off-book beasts and bound labor. Beasts count as tamed; slaves never do — they take party friend slots.",
    arcane_shop: "✨ Enchants any plain weapon (price = tier × enchant strength). ⬆️ Upgrade bench: robes, staves, wands (+50% flat stats/level, 5 max).",
    castle_keep: "👑 Castle keep — the King's throne room. Buy placement charters here.",
    grand_castle: "👑 Grand castle — capital heart the size of a village, lavish throne room and great garden. The King sells placement charters.",
    palace: "👑 Palace audience suite; the court of the capital.",
    stable: "🐴 Stable pens and horse market.",
    beast_lodge: "🧬 Breed same-kin beasts; browse the Bestiary. 🏹 Tack sells low-tier whips + bows.",
    inn: "🛏️ Retire party members and slaves into paid rooms; retrieve them from any inn. People only — beasts stay at stables.",
    guildhall: "🏛️ Guildhall — rotating Noticeboard (culls in real hunting grounds, house vermin/haunt clearings) plus a Counter, Commissions (player-posted, first finisher wins) and commission posting. Contracts raise your weapon-tier adventurer rank for richer payouts.",
    khan_hall: "🏛️ Guild hall of the steppe — Noticeboard postings and Counter turn-ins; raises your adventurer rank.",
    terrace_hall: "🏛️ Guild hall of the mesa — Noticeboard postings and Counter turn-ins; raises your adventurer rank.",
    ice_hall: "🏛️ Guild hall of the frost — Noticeboard postings and Counter turn-ins; raises your adventurer rank.",
    mead_hall: "🏛️ Guild mead hall — Noticeboard postings and Counter turn-ins; raises your adventurer rank.",
    great_hall: "🏛️ Great guild hall — Noticeboard postings and Counter turn-ins; raises your adventurer rank.",
    tavern_hall: "🏛️ Guild tavern hall — Noticeboard postings plus Counter turn-ins; raises your adventurer rank.",
  };
  return {
    CLASS_SHOP, STALL_SHOP, SHOP_TITLE, BUILDING_USE,
    shopKindForBuilding, stockFor, askPrice, bidPrice, shopSells, shopBuys,
    buyFromShop, sellToShop, takeDrug, dojoRefund, doEnchant, ENCHANTS, weaponTierOf, renderUpgradeSection,
    buyBeast, sellBeast, ensureBeastStock, beastPrice, ensureSlaveStock, buySlave,
    PERMITS, buyPermit, kingPermitsUI, ensureKing,
    breedSlaveDeposit, breedSlaveCollect, slaveJobsEnsure,
    startPlacement, cancelPlacement, isPlacing, placeAtScreen, commitPlacement, onWallBreach, stallAt, homePortalPoi, openHomePortal,
    nearestShop, openShop, closeShop, isOpen, renderShop,
  };
})();
