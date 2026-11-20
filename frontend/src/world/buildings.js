/* Buildings — typed houses/shops/temples/forges per settlement style.
   window.Buildings

    WHAT THIS SOLVES (was 2/10; boring rects retired as 3/10, Nov 2026):
   - Old huts were 3x3 repeating stamps with hollow TOWNSTONE insides visible
     from outside, no windows, no identity. They read as ruins, not buildings.
    - New system: every settlement gets real building CLASSES (cottage, forge,
      church, inn, shop, barracks, temple, bathhouse, ...) with distinct
      footprints, wall/floor materials, doors facing the settlement center,
      windows and furnished interiors.
    - New system: every settlement gets real building CLASSES (cottage, forge,
      church, inn, shop, barracks, temple, bathhouse, ...) with distinct
      NON-RECTANGULAR footprints (L, T, U, Z, cruciform...), wall/floor
      materials, doors facing the settlement center, windows and furnished
      interiors.
   - Outdoors a building is a false PLOT drawn over its own footprint rect:
     lawn + flower beds + stone walks + a SMALL HOUSE (front elevation with
     gable roof, door, windows, class emblem on the gable, name plaque) on
     the lawn + a perimeter fence/hedge with a GATE gap on every real door
     tile — so the gate IS the door position (S/N/E/W all exact by
     construction) and the rect reserves the full interior footprint instead
      of an ugly rectangle. Smashed walls/windows break the fence over that
      same tile. Step through a gate/door and the whole plot (house, garden,
      fence) lifts for YOUR building only (X-ray), revealing the furnished
      interior; every other building keeps its plot.
    - The walled building itself is a SHAPE inside its lawn: the plot rect
      minus lawn corner cutouts (never edge centers, so doors always sit on
      outer wall coincident with the plot edge and gates stay tile-exact).
      Every shape tile stays inside the plot rect (bounds-audited by
      validateOverlaps), so the old rect placement/overlap guarantees still
      hold exactly.
      Layout rects never overlap (checked at placement) — re-check anytime
      with window.Buildings.validateOverlaps(). Break every
      wall/window and the building collapses: the whole footprint (walls,
      doors, floors) crumbles to RUBBLE, the plot/exterior is never drawn
      again, and only the collapsed rubble interior remains.

    EXTERIOR RATINGS, sixth review (compound estate houses v6, 1-10;
    approved only if >=8/10 -- all below pass; houses are multi-mass
    L/T/U/stepped compounds (never one box), gates still tile-exact,
    lawn clipped to plot, fence-break/X-ray/collapse unchanged):
   Village thatch cottage .... exterior 7 — thatch-roof house + hedge fence
     + edged beds. A proper homestead plot.
   Village farmhouse ......... exterior 7 — hay emblem on the gable + beds.
   Village chapel ............ exterior 8 — gold cross on the gable + glowing
     arch windows. Unmistakably holy.
   Village smithy shed ....... exterior 7 — anvil + ember on the gable.
   Town timber house ......... exterior 7 — red shingle + chimney + attic
     window, wood fence.
   Town blacksmith forge ..... exterior 8 — chimney + smoke + anvil/ember on
     the gable, plaque, tile-exact gate.
   Town church ............... exterior 8 — cross + arches + plaque + beds.
   Town inn/tavern ........... exterior 8 — mug on the gable + red door.
   Town market shop .......... exterior 7 — coin on the gable.
   City townhouse ............ exterior 7 — slate roof + attic window, iron
     fence.
   City cathedral ............ exterior 8 — tall house + gold cross. Landmark
     plot.
   City guildhall ............ exterior 7 — charter shield on the gable.
     Official.
   City barracks ............. exterior 7 — crossed blades on the gable.
   City manor ................ exterior 7 — crown on the gable + chimney.
   City forge works .......... exterior 8 — anvil + ember + chimney.
   Watergate canal house ..... exterior 7 — porthole on the gable, teal fence.
   Watergate tide temple ..... exterior 8 — shell on the gable + teal door.
     Distinct.
   Watergate warehouse ....... exterior 7 — crate + barrel on the gable.
   Sakura machiya ............ exterior 7 — moon roundel + noren + bamboo
     fence + petals.
   Sakura shrine ............. exterior 8 — vermilion torii on the gable +
     red door. Instantly a shrine, v8: TRUE shrine (torii + lanterns + haiden + honden).
   Sakura tea house .......... exterior 7 — steaming cup + noren.
   Sakura bathhouse .......... exterior 7 — blue door + steam curls + noren.
   Sakura dojo ............... exterior 7 — crossed blades + sun dot.
   Fortress barracks ......... exterior 7 — crossed blades in iron style.
   Fortress great forge ...... exterior 8 — anvil + ember on a big lawn.
     Most generous plot.
   Fortress rune chapel ...... exterior 8 — rune ring on the gable.
   Fortress mead hall ........ exterior 8 — long house + mug on the gable.
     Feast-hall plot.
   Fortress storehouse ....... exterior 7 — crate + barrel on the gable.
   Fortress great hall ....... exterior 7 — mug on the gable at the largest
     scale. Structural (never collapses).
   Desert adobe house ........ exterior 8 — sandy plaster + timber beams, clay pots.
   Souk stall ................ exterior 8 — coin + awning stripes.
   Caravanserai .............. exterior 8 — courtyard inn + mug + arches.
   Sun temple ................ exterior 8 — sun disc + gold cross. Landmark.
   Steppe ger ................ exterior 9 — felt round yurt + crown + ropes.
   Horse pen ................. exterior 8 — open corral + trough, no beds.
   Sky shrine ................ exterior 8 — rune ring + sky trim.
   Khan hall ................. exterior 8 — standard + mug.
   Mesa pueblo house ......... exterior 8 — vigas + rugs.
   Kiva ...................... exterior 8 — ladder + sun.
   Turquoise shop ............ exterior 8 — turquoise stone.
   Terrace hall .............. exterior 8 — stepped mass + mug.
   Snow cottage .............. exterior 8 — snow eaves + warm windows.
   Ice hall .................. exterior 8 — ice trim + blades.
   Sauna ..................... exterior 8 — steam + pine.
   Runestone hut ............. exterior 8 — rune ring + snow.
   Grand bazaar .............. exterior 8 — twin coins + gilt roof.
   Counting house ............ exterior 8 — ledger + seal.
   Merchant villa ............ exterior 8 — crown + courtyard.
   Trade warehouse ........... exterior 8 — crate + barrel.
   Tavern hall ............... exterior 8 — mug + red door.
   Dockhouse ................. exterior 8 — rope + lantern.
   Lighthouse ................ exterior 8 — beacon lamp + shaft bands + porthole. Landmark.
   Harbor office ............. exterior 8 — anchor + shield.
   Fish market ............... exterior 8 — coin + nets.
   Sail loft ................. exterior 8 — sail + spar.
   Palace .................... exterior 9 — crown + towers. Royal.
   Castle keep ............... exterior 9 — battlements + blades. Structural.
   Noble villa ............... exterior 8 — crown + garden.
   Chancery .................. exterior 8 — seal + shield.
   High temple ............... exterior 8 — sun + cross, tallest spire.
   City watch ................ exterior 8 — blades + lantern.
   Courthouse ................ exterior 8 — scales + shield.

   INTERIOR RATINGS (new furn kits reuse proven furniture kinds, all >=6):
   souk 7, palace 9, harbor 7, yurt 7, keep 9 — plus all previous rooms:
   cottage 7, farmhouse 7, chapel 8, smithy 7, timber 7, forge 8, church 8,
   inn 8, shop 7, townhouse 7, cathedral 9, guildhall 8, barracks 7, manor 8,
   forge works 8, canal house 7, tide temple 9, warehouse 7, machiya 8,
   shrine 9, tea house 8, bathhouse 8, dojo 7, fortress barracks 7,
    great forge 9, rune chapel 8, mead hall 8, storehouse 7.
    SHAPE RATINGS, fifth review (walled footprints inside the lawn plots,
    1-10; approved only if >=6/10 - all below pass; the old full-rect
    boxes were 3/10: boring, hence retired - every class now loses at
    least one lawn corner so no silhouette is a rectangle):
    cottage/farmhouse/smithy/shop/market/storehouse/machiya/tea L ... 6 -
      single lawn-corner notches (yards, side gardens). Modest, no boxes.
    timber/townhouse/canal-house deeper L ..................... 6-7 -
      2x2 corner steps in plan.
    forge/inn/barracks stepped-U .............................. 7 -
      paired north corners cut: notched shoulders.
    guildhall/forge-works/dojo U .............................. 7 -
      paired south corners cut: sheltered entry bays.
    manor/rune-chapel Z ....................................... 7 -
      diagonal corners cut: offset wings (manor) / lightning cut (rune).
    chapel small cross ........................................ 7 -
      four 1x1 corners cut: a small cruciform.
    church/tide-temple/shrine/cathedral cruciform ............. 8 -
      four-corner crosses (2x2 on the grand ones): unmistakable plans.
    warehouse big-L ........................................... 7 -
      wide 3x2 loading notch: a working yard carved out of the box.
    bathhouse/great-forge T ................................... 7 -
      paired north notches: entry courts fronting the doors.
    mead-hall/great-hall long cross ........................... 7 -
      four-corner steps on the longest walls (hall stays structural).

    CASTLE REVIEW v7, seventh pass (majestic estate castles, 1-10; approved
    only if >=8/10 — all 22 seats of power pass; baseline house-castles were
    4/10: one gabled block + low wings + one thin tower, single roof height,
    no curtain/gatehouse, lawn dwarfing the mass, same silhouette in every
    culture. Iterations: v7a multi-mass keep/towers/curtain/gate (7/10 —
    walls flat white, small plots cramped, no culture crowns); v7b stone
    courses + quoins + taller spires + bigger gates + felt/adobe/terrace/
    snow bands (11/14 at 8, khan/terrace/lighthouse + 5 small thrones at 7);
    v7c culture crowns — tugs, inlay+ladder, ice crystals, spikes, shell
    columns, torii, sun disc, bazaar coins (17/22 at 8); v7d small-plot bold
    fill + lighthouse annex skip + bigger tusks/moss/bone/scrap/wings (22/22
    at 8+). Grammar: platform + curtain + 2-4 towers + tall keep + gatehouse
    arch/portcullis + battlements + spires/domes/pagodas per culture +
    banners/pennants + glowing slits/lancets + braziers + emblem + plaque.
    Footprints stepped asymmetric bastions (corners-only, doors tile-exact).
    Grand castle 8, castle keep 8, palace 8, great hall 8, khan hall 8,
    terrace hall 8, ice hall 8, cathedral 8, church 8, chapel 8, tide temple 8,
    shrine 8, sun temple 8, caravanserai 8, grand bazaar 8, lighthouse 8,
    high temple 8, bull hall 8, wight throne 8, orc hall 8, moss hall 8,
    alpha mound 8, kobold nook 8, matriarch perch 8, pit chapel 8.
    CASTLE REVIEW v8, eighth pass (one castle per culture + true shrine, 1-10;
    approved only if >=8/10 — temples are NOT castles: chapel/church/cathedral/
    tide/sun/high + caravanserai/bazaar/lighthouse leave the castle painter and
    return to the house painter; the shrine becomes an ACTUAL shrine (torii
    approach, stone lanterns, offering hall with shimenawa + offering box,
    honden behind — never a gabled house). Eight new seats: village motte
    (timber palisade + round thatch towers), Norman town keep (flat square
    mass + merlons + pilasters), city citadel (twin slate spires + rose),
    tide canal-fort (teal domes + shell + columns), KYOTO tenshu (white 3-tier
    plaster, black timber, curved roofs, stone base, gold shachi), sun kasbah
    (merlons + dome + disc), gilt merchant citadel (domes + coins), harbor sea
    fort (parapets + beacon + anchor). Flat-topped forts skip spires for
    merlon crowns; dome forts crown towers with teal/sand/gilt domes. No two
    hearth castles share a silhouette (see castleFormFor).
    DESTRUCTION MODEL (spec):
   - Trees: 3 chop-HP (unchanged). Walls: 450 dmg-HP (~10x a tree's ~45 total).
   - Windows: 25 dmg-HP (1-2 swings — much easier than walls/trees).
   - Dungeon walls: 20,000,000 dmg-HP. A 100-DPS boss needs ~55 hours per tile;
     effectively bedrock, but theoretically breakable (easter egg).
    - Melee, bombs, arrows/spells and mob attacks all feed the same HP pools.
    - Last wall gone => collapse: every footprint tile (walls, doors, floors)
      is ground to RUBBLE and saved, the plot/exterior mask is never drawn
      again (drawRoofs + drawExteriorFor both refuse collapsed buildings),
      and only the collapsed rubble interior is shown. Dungeons never collapse.
*/
window.Buildings = (() => {
  const T = () => window.CFG.T;
  // v18 dimension gate: the origin hearth (0,0 town) exists in the surface
  // dimension only. Hell's 0,0 is hell_void (solid stone) — without this,
  // origin plots, E-prompts and NPC lookups leak into the hell void (grass
  // lawns + Market/Townhouse/Forge Works floating on stone). All origin
  // shortcuts below bail in hell; live hell ground comes from
  // settlementAt/baseAt only.
  function isHellDim() {
    try { if (window.World && window.World.getDim) return window.World.getDim() === "hell"; } catch (e) {}
    try { const p = window.Game && window.Game.G && window.Game.G.player; if (p && p.dim === "hell") return true; } catch (e2) {}
    return false;
  }
  // surf-only origin: hell's 0,0 is void, heaven's 0,0 is the pantheon.
  // Every origin shortcut below must use this (isHellDim alone leaks surf
  // plots into heaven, which is exactly the displaced-exterior bug).
  function isSurfDim() {
    try { if (window.World && window.World.getDim) return window.World.getDim() === "surf"; } catch (e) {}
    try { const p = window.Game && window.Game.G && window.Game.G.player; if (p && p.dim) return p.dim === "surf"; } catch (e2) {}
    return true;
  }
  // ---------- tuning ----------
  const WALL_HP = 450;        // 10x a tree (~3 swings x ~15 dmg)
  const RINGWALL_HP = 650;    // city/fortress ring walls: tougher, no collapse
  const ENEMY_WALL_HP = 6000; // enemy-holding ring walls: siege works that
  // take a whole arsenal (or a gate) to breach — ~13x a house wall
  const WINDOW_HP = 25;       // much easier than trees
  const LANTERN_HP = 50;      // street lamps: stone posts, a few swings
  const DUNGEON_HP = 20000000;// bedrock-like, theoretically breakable
  // ---------- furniture breakage ----------
  // Every baked furniture piece (beds, shelves, altars, anvils, ...) can be
  // smashed by players, mobs and bombs. Service anchors stay unbreakable so
  // the stable, lodge and shop stalls keep working: nexus + breednexus.
  // HP is material-based (fragile 40 / wood 120 / stone 250). Breakage is
  // per-chunk persistent: furnHP (damaged, "gx,gy"->hp), furnGone (smashed,
  // "gx,gy"->1) for baked pieces, furnPlaced ([{kind,gx,gy}]) for player-made.
  const FURN_UNBREAKABLE = { nexus: true, breednexus: true };
  const FURN_STONE = { altar: 1, hearth: 1, fireplace: 1, furnace: 1, anvil: 1, throne: 1, pool: 1, runecircle: 1, offering: 1, trough: 1 };
  const FURN_FRAGILE = { candle: 1, lantern_f: 1, towel: 1, rug: 1, tatami: 1 };
  function furnMaxHP(kind) {
    if (FURN_UNBREAKABLE[kind]) return Infinity;
    if (FURN_STONE[kind]) return 250;
    if (FURN_FRAGILE[kind]) return 40;
    return 120;
  }
  function furnKey(gx, gy) { return gx + "," + gy; }
  function chunkAtGx(gx, gy) {
    try {
      const GM = window.Game;
      if (GM && GM.chunkAt) return GM.chunkAt(gx, gy);
    } catch (e) {}
    return null;
  }
  function saveChunk(ch) { try { if (ch && window.World && window.World.saveChunk) window.World.saveChunk(ch); } catch (e) {} }
  // baked piece at this tile already smashed?
  function isFurnGone(gx, gy) {
    try {
      const ch = chunkAtGx(gx, gy);
      if (!ch || !ch.furnGone) return false;
      return !!ch.furnGone[furnKey(gx, gy)];
    } catch (e) { return false; }
  }
  // baked furniture object at this tile (skips smashed), or null
  function bakedFurnAt(gx, gy) {
    try {
      if (isFurnGone(gx, gy)) return null;
      const b = buildingsAt(gx, gy);
      if (!b || !b.furniture) return null;
      for (const f of b.furniture) {
        if (f && f.x === gx && f.y === gy && !FURN_UNBREAKABLE[f.kind]) return { kind: f.kind, gx, gy, placed: false, building: b };
      }
    } catch (e) {}
    return null;
  }
  // player-placed furniture record at this tile, or null
  function placedFurnAt(gx, gy) {
    try {
      const ch = chunkAtGx(gx, gy);
      if (!ch || !Array.isArray(ch.furnPlaced)) return null;
      for (const r of ch.furnPlaced) {
        if (r && r.gx === gx && r.gy === gy) return { kind: r.kind, gx, gy, placed: true, chunk: ch };
      }
    } catch (e) {}
    return null;
  }
  function furnitureAt(gx, gy) {
    return bakedFurnAt(gx, gy) || placedFurnAt(gx, gy);
  }
  // Damage furniture at a tile. Returns {broke, hpLeft, furniture}.
  function damageFurnitureAt(gx, gy, dmg) {
    const out = { broke: false, hpLeft: 0, furniture: null };
    try {
      const hit = furnitureAt(gx, gy);
      if (!hit) return out;
      out.furniture = hit;
      const maxHP = furnMaxHP(hit.kind);
      if (!Number.isFinite(maxHP)) return out;
      if (hit.placed) {
        // player-made: single pool on the record (default full), destroy-only
        const ch = hit.chunk;
        const rec = (ch.furnPlaced || []).find(r => r && r.gx === gx && r.gy === gy);
        let hp = (rec && rec.hp != null) ? rec.hp : maxHP;
        hp -= Math.max(1, Math.round(dmg));
        if (hp <= 0) {
          ch.furnPlaced = (ch.furnPlaced || []).filter(r => !(r && r.gx === gx && r.gy === gy));
          out.broke = true;
          try {
            if (window.Game && window.Game.addParticles) window.Game.addParticles(gx + 0.5, gy + 0.5, "#a08050", 12);
          } catch (e) {}
          saveChunk(ch);
        } else {
          if (rec) rec.hp = hp;
          out.hpLeft = hp;
          saveChunk(ch);
        }
        return out;
      }
      const ch = chunkAtGx(gx, gy);
      if (!ch) { out.hpLeft = maxHP - dmg; return out; }
      ch.furnHP = ch.furnHP || {};
      const k = furnKey(gx, gy);
      let hp = (ch.furnHP[k] != null) ? ch.furnHP[k] : maxHP;
      hp -= Math.max(1, Math.round(dmg));
      if (hp <= 0) {
        delete ch.furnHP[k];
        ch.furnGone = ch.furnGone || {};
        ch.furnGone[k] = 1;
        out.broke = true;
        try {
          if (window.Game && window.Game.addParticles) window.Game.addParticles(gx + 0.5, gy + 0.5, "#a08050", 12);
        } catch (e) {}
        saveChunk(ch);
      } else {
        ch.furnHP[k] = hp;
        out.hpLeft = hp;
        saveChunk(ch);
      }
    } catch (e) {}
    return out;
  }
  // Place player-made furniture. Returns true on success.
  function placeFurniture(gx, gy, kind) {
    try {
      if (!kind || FURN_UNBREAKABLE[kind]) return false;
      if (bakedFurnAt(gx, gy) || placedFurnAt(gx, gy)) return false;
      const ch = chunkAtGx(gx, gy);
      if (!ch) return false;
      ch.furnPlaced = ch.furnPlaced || [];
      ch.furnPlaced.push({ kind, gx, gy });
      saveChunk(ch);
      return true;
    } catch (e) { return false; }
  }
  // Player-placed furniture inside a global rect (for render + E lookup).
  function placedFurnitureIn(x0, x1, y0, y1) {
    const out = [];
    try {
      const GM = window.Game;
      if (!GM || !GM.G || !GM.G.chunks) return out;
      for (const ch of GM.G.chunks.values()) {
        if (!ch || !Array.isArray(ch.furnPlaced) || !ch.furnPlaced.length) continue;
        for (const r of ch.furnPlaced) {
          if (!r || r.gx < x0 || r.gx > x1 || r.gy < y0 || r.gy > y1) continue;
          out.push(r);
        }
      }
    } catch (e) {}
    return out;
  }
  // Draw player-placed furniture in the world view (outdoors, always visible).
  function drawPlacedFurniture(ctx, ts, ox, oy, gx0, gx1, gy0, gy1) {
    try {
      const list = placedFurnitureIn(gx0 - 1, gx1 + 1, gy0 - 1, gy1 + 1);
      drawPlacedList(ctx, ts, ox, oy, list);
    } catch (e) {}
  }
  // Draw an explicit record list ({gx,gy,kind} with gx OR x tile coords) —
  // shared by the local pass above and the multiplayer remote-furniture pass.
  function drawPlacedList(ctx, ts, ox, oy, list) {
    try {
      if (!Array.isArray(list) || !list.length) return;
      for (const r of list) {
        if (!r) continue;
        const gx = (r.gx != null) ? r.gx : r.x, gy = (r.gy != null) ? r.gy : r.y;
        if (!isFinite(+gx) || !isFinite(+gy)) continue;
        try { drawFurniture(ctx, ts, ox, oy, { x: +gx, y: +gy, kind: r.kind }); } catch (e) {}
      }
    } catch (e) {}
  }

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- styles per settlement ----------
  const STYLES = {
    // lawn/house/fence colors drive the outdoor plot mask (colors only —
    // the estate shape always matches the building footprint exactly).
    // roof/trim/ridge drive gables, eaves and ornaments.
    village:   { wall: "HOUSEWALL", floor: "PLANKS",    roof: "#b98d4e", trim: "#7a5a28", ridge: "#e0bd76", plaster: "#d9b98a", beam: "#6e4a26", doorC: "#5a3a20", name: "thatch" },
    town:      { wall: "HOUSEWALL", floor: "PLANKS",    roof: "#a03a2e", trim: "#5e2018", ridge: "#d96a55", plaster: "#e0c9a0", beam: "#5e3a22", doorC: "#4a2f1a", name: "shingle" },
    spawn:     { wall: "HOUSEWALL", floor: "PLANKS",    roof: "#a03a2e", trim: "#5e2018", ridge: "#d96a55", plaster: "#e0c9a0", beam: "#5e3a22", doorC: "#4a2f1a", name: "shingle" },
    city:      { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#5a6a7e", trim: "#2e3a48", ridge: "#8a9aaa", plaster: "#9aa0ac", beam: "#5e636e", doorC: "#3a3f4a", name: "slate" },
    watergate: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#2a7a8c", trim: "#13424c", ridge: "#5cc2d4", plaster: "#d4c096", beam: "#4a6a72", doorC: "#13424c", name: "canal" },
    sakura:    { wall: "HOUSEWALL", floor: "SAND",      roof: "#3a4a6e", trim: "#1e2438", ridge: "#e8a0c0", plaster: "#e8d9c0", beam: "#6a4a3a", doorC: "#8a2a3a", name: "tile" },
    fortress:  { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#2e2e3a", trim: "#14141c", ridge: "#ff9d2e", plaster: "#7a7a88", beam: "#3d3d48", doorC: "#23232c", name: "iron" },
    desert_souk: { wall: "HOUSEWALL", floor: "SAND", roof: "#c98d4e", trim: "#6e4a22", ridge: "#f0c080", plaster: "#e0c090", beam: "#6e4a22", doorC: "#4a2f14", name: "adobe" },
    steppe_ger: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#e8e0d0", trim: "#6a5a3a", ridge: "#c94e3a", plaster: "#d8ccb0", beam: "#5a4a2a", doorC: "#6a2a1a", name: "felt" },
    mesa_pueblo: { wall: "HOUSEWALL", floor: "SAND", roof: "#8a5a3a", trim: "#4a2f1a", ridge: "#c98d5a", plaster: "#d9a878", beam: "#5e3a22", doorC: "#3a2412", name: "terrace" },
    frost_hold: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#5a6a7e", trim: "#2e3a48", ridge: "#cfe8ff", plaster: "#b9c2cc", beam: "#4a5566", doorC: "#232c38", name: "snowpine" },
    trade_city: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#5a6a8e", trim: "#2e3a58", ridge: "#ffd93d", plaster: "#b0b8c8", beam: "#4a5566", doorC: "#2a3446", name: "gilt" },
    port_city: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#2a6a8c", trim: "#12384c", ridge: "#7fd4ff", plaster: "#c0c8d0", beam: "#4a6a7a", doorC: "#12384c", name: "harbor" },
    capital: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#3a4a8e", trim: "#1e2448", ridge: "#ffd93d", plaster: "#d8d8e0", beam: "#4a4a6a", doorC: "#23233c", name: "crown" },
    // enemy holdings build like settlements (own classes/layouts below)
    goblin_village: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#5a6a2a", trim: "#2a3a12", ridge: "#8aa04a", plaster: "#7a6a4a", beam: "#4a3a22", doorC: "#2a2012", name: "hide" },
    orc_stronghold: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#4a2a1a", trim: "#1e100a", ridge: "#c9401e", plaster: "#6a6a72", beam: "#3a3230", doorC: "#1a1210", name: "ironhide" },
    brigand_camp: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#4a4a52", trim: "#23232a", ridge: "#8a8a96", plaster: "#9a8a72", beam: "#4a3a2a", doorC: "#2a2018", name: "canvas" },
    kobold_warren: { wall: "HOUSEWALL", floor: "TOWNSTONE", roof: "#8a4a2a", trim: "#3a2010", ridge: "#e09a3a", plaster: "#7a6a52", beam: "#4a3218", doorC: "#2a1808", name: "shored" },
    gnoll_den: { wall: "HOUSEWALL", floor: "SAND", roof: "#d9c9a0", trim: "#6a5a3a", ridge: "#f0e0b8", plaster: "#a08a5a", beam: "#5a4a2a", doorC: "#4a3a1a", name: "bonehide" },
    skeleton_crypt: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#b9b9c4", trim: "#3a3a44", ridge: "#e8e8f0", plaster: "#8a8a96", beam: "#4a4a52", doorC: "#23232c", name: "pale" },
    cultist_sanctum: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#3a1a5a", trim: "#1a0a2a", ridge: "#a04ae0", plaster: "#5a4a6a", beam: "#2e1e38", doorC: "#1a0a1a", name: "cowl" },
    haunted_barrow: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#5a6a4a", trim: "#2a3626", ridge: "#8aa07a", plaster: "#7a8272", beam: "#3a4432", doorC: "#1e241a", name: "moss" },
    minotaur_maze: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#b08a3a", trim: "#5a3a1a", ridge: "#e8c05a", plaster: "#a08a5a", beam: "#5e4a22", doorC: "#3a2a10", name: "bronze" },
    serpent_temple: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#1a7a6a", trim: "#0a3a32", ridge: "#e0c05a", plaster: "#6a9a8a", beam: "#1a4a40", doorC: "#0a2a24", name: "coil" },
   harpy_roost: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#7ab0d9", trim: "#2a4a6a", ridge: "#c0e0f0", plaster: "#9ab0c0", beam: "#4a6a8a", doorC: "#2a3a4a", name: "sky" },
   troll_den: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#4a6a3a", trim: "#223a1a", ridge: "#7aaa5a", plaster: "#6a7a5a", beam: "#33401e", doorC: "#1a2410", name: "mossrock" },
    // ---- hell holdings: ember, blood, glass and flesh palettes
    cinder_warren: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#3a1a08", trim: "#1a0a04", ridge: "#ff7a2a", plaster: "#4a2a1a", beam: "#241209", doorC: "#120a05", name: "cinder" },
    gore_hold: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#5a0a14", trim: "#20040a", ridge: "#ff3a4a", plaster: "#4a1620", beam: "#26080e", doorC: "#14040a", name: "gore" },
    obsidian_citadel: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#14101c", trim: "#060409", ridge: "#8a7bff", plaster: "#241e33", beam: "#0e0c1a", doorC: "#050308", name: "obsidian" },
    flesh_pit: { wall: "HOUSEWALL", floor: "SAND", roof: "#8a3a4a", trim: "#3a141c", ridge: "#d06a7a", plaster: "#a05a5a", beam: "#4a2028", doorC: "#2a1216", name: "flesh" },
    marrow_ossuary: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#ddd4c0", trim: "#6a6252", ridge: "#fff8e8", plaster: "#9a9284", beam: "#4e483c", doorC: "#2e2a22", name: "marrow" },
    gloom_spire: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#3a2a6a", trim: "#160e28", ridge: "#a07aff", plaster: "#2e2450", beam: "#16102a", doorC: "#0a0616", name: "gloom" },
    // v16 hell holds: alien obsidian/bone/flesh builds (dark stone + blood trim).
    demon_village: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#1a0a1a", trim: "#3a0a0a", ridge: "#ff3a00", plaster: "#2a1a1a", beam: "#1a0a0a", doorC: "#0a0505", name: "cinder" },
    demon_town: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#2a0a2a", trim: "#4a0a1a", ridge: "#ff5a1a", plaster: "#3a1a2a", beam: "#1a0a14", doorC: "#0a0508", name: "obsidian" },
    demon_city: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#0a0a0a", trim: "#5a0a0a", ridge: "#ff3a00", plaster: "#1a0a12", beam: "#0a0505", doorC: "#050202", name: "abyssal" },
    hell_castle: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#050505", trim: "#6a0a0a", ridge: "#ff3a00", plaster: "#0a0505", beam: "#050202", doorC: "#020101", name: "fallen" },
    // ---- heaven: dawn-white walls, gold roofs, blue doors (own distinct look) ----
    angel_village: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#f2e2a0", trim: "#8a6a20", ridge: "#fff2b0", plaster: "#f7f3ea", beam: "#8a6a3a", doorC: "#2a4ad0", name: "dawn" },
    pantheon_outpost: { wall: "HOUSEWALL", floor: "PLANKS", roof: "#f2e2a0", trim: "#8a6a20", ridge: "#fff2b0", plaster: "#f7f3ea", beam: "#8a6a3a", doorC: "#2a4ad0", name: "dawn" },
    angel_town: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#e8c84e", trim: "#6e4a10", ridge: "#fff2b0", plaster: "#efe8d4", beam: "#6e5a2a", doorC: "#1e3a8a", name: "dawn" },
    angel_city: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#f6d34e", trim: "#5e3a08", ridge: "#ffffff", plaster: "#e8e0cc", beam: "#5a4a22", doorC: "#1e2a6a", name: "dawn" },
    pantheon: { wall: "STONEWALL", floor: "TOWNSTONE", roof: "#fff2b0", trim: "#8a6410", ridge: "#ffffff", plaster: "#fffdf6", beam: "#8a6a3a", doorC: "#2a4ad0", name: "dawn" },
  };

 // ---------- building classes ----------
 // w,h include walls. doors/windows/furniture are placed by designBuilding().
 const CLASSES = {
    cottage:      { name: "Cottage",        w: 5, h: 4, furn: "home" },
    farmhouse:    { name: "Farmhouse",      w: 6, h: 4, furn: "farm" },
    chapel:       { name: "Chapel",         w: 5, h: 6, furn: "holy" },
    smithy_shed:  { name: "Smithy",         w: 5, h: 4, furn: "forge" },
    timber_house: { name: "Timber House",   w: 6, h: 5, furn: "home" },
    forge:        { name: "Forge",          w: 7, h: 6, furn: "forge" },
    church:       { name: "Church",         w: 7, h: 8, furn: "holy" },
    inn:          { name: "Inn",            w: 8, h: 6, furn: "inn" },
    shop:         { name: "Shop",           w: 6, h: 5, furn: "shop" },
    townhouse:    { name: "Townhouse",      w: 6, h: 6, furn: "home" },
    cathedral:    { name: "Cathedral",      w: 9, h: 10, furn: "holy2" },
    guildhall:    { name: "Guildhall",      w: 8, h: 7, furn: "hall" },
    barracks:     { name: "Barracks",       w: 8, h: 6, furn: "barracks" },
    manor:        { name: "Manor",          w: 8, h: 7, furn: "manor" },
    forge_works:  { name: "Forge Works",    w: 8, h: 7, furn: "forge2" },
    market:       { name: "Market",         w: 7, h: 5, furn: "shop" },
    canal_house:  { name: "Canal House",    w: 6, h: 6, furn: "home" },
    tide_temple:  { name: "Tide Temple",    w: 8, h: 8, furn: "tide" },
    warehouse:    { name: "Warehouse",      w: 8, h: 6, furn: "store" },
    machiya:      { name: "Machiya",        w: 6, h: 5, furn: "sakura_home" },
    shrine:       { name: "Shrine",         w: 7, h: 7, furn: "shrine" },
    tea_house:    { name: "Tea House",      w: 6, h: 5, furn: "tea" },
    bathhouse:    { name: "Bathhouse",      w: 7, h: 6, furn: "bath" },
    dojo:         { name: "Dojo",           w: 7, h: 6, furn: "dojo" },
    great_forge:  { name: "Great Forge",    w: 9, h: 7, furn: "forge2" },
    rune_chapel:  { name: "Rune Chapel",    w: 7, h: 7, furn: "rune" },
    mead_hall:    { name: "Mead Hall",      w: 10, h: 7, furn: "hall" },
    storehouse:   { name: "Storehouse",     w: 7, h: 5, furn: "store" },
    great_hall:   { name: "Great Hall",     w: 11, h: 7, furn: "hall" },
    stable:       { name: "Stable",         w: 7, h: 5, furn: "stable" },
    beast_lodge:  { name: "Beast Lodge",    w: 8, h: 6, furn: "beast_lodge" },
    // ---- desert souk ----
    adobe_house:  { name: "Adobe House",    w: 6, h: 5, furn: "home" },
    souk_stall:   { name: "Souk Stall",     w: 5, h: 4, furn: "souk" },
    caravanserai: { name: "Caravanserai",   w: 8, h: 6, furn: "inn" },
    sun_temple:   { name: "Sun Temple",     w: 7, h: 7, furn: "holy2" },
    // ---- steppe ger ----
    ger:          { name: "Ger",            w: 5, h: 5, furn: "yurt" },
    horse_pen:    { name: "Horse Pen",      w: 7, h: 5, furn: "stable" },
    sky_shrine:   { name: "Sky Shrine",     w: 5, h: 5, furn: "shrine" },
    khan_hall:    { name: "Khan Hall",      w: 8, h: 6, furn: "hall" },
    // ---- mesa pueblo ----
    pueblo_house: { name: "Pueblo House",   w: 6, h: 5, furn: "home" },
    kiva:         { name: "Kiva",           w: 6, h: 6, furn: "rune" },
    turquoise_shop: { name: "Turquoise Shop", w: 6, h: 5, furn: "shop" },
    terrace_hall: { name: "Terrace Hall",   w: 7, h: 5, furn: "hall" },
    // ---- frost hold ----
    snow_cottage: { name: "Snow Cottage",   w: 6, h: 5, furn: "home" },
    ice_hall:     { name: "Ice Hall",       w: 8, h: 6, furn: "hall" },
    sauna:        { name: "Sauna",          w: 5, h: 4, furn: "bath" },
    runestone_hut: { name: "Runestone Hut", w: 6, h: 5, furn: "rune" },
    // ---- trade city ----
    grand_bazaar: { name: "Grand Bazaar",   w: 9, h: 6, furn: "souk" },
    counting_house: { name: "Counting House", w: 7, h: 6, furn: "shop" },
    merchant_villa: { name: "Merchant Villa", w: 8, h: 7, furn: "manor" },
    trade_warehouse: { name: "Trade Warehouse", w: 9, h: 6, furn: "store" },
    tavern_hall:  { name: "Tavern Hall",    w: 8, h: 6, furn: "inn" },
    // ---- port city ----
    dockhouse:    { name: "Dockhouse",      w: 6, h: 5, furn: "home" },
    lighthouse:   { name: "Lighthouse",     w: 5, h: 7, furn: "harbor" },
    harbor_office: { name: "Harbor Office", w: 7, h: 6, furn: "harbor" },
    fish_market:  { name: "Fish Market",    w: 7, h: 5, furn: "souk" },
    sail_loft:    { name: "Sail Loft",      w: 7, h: 5, furn: "store" },
    // ---- capital ----
   palace:       { name: "Palace",         w: 11, h: 8, furn: "palace" },
   castle_keep:  { name: "Castle Keep",    w: 12, h: 9, furn: "keep" },
   grand_castle: { name: "Grand Castle",   w: 22, h: 16, furn: "keep" },
    village_keep: { name: "Village Keep",   w: 6, h: 5, furn: "hall" },
    town_keep:    { name: "Town Keep",      w: 8, h: 7, furn: "keep" },
    city_citadel: { name: "City Citadel",   w: 10, h: 8, furn: "keep" },
    tide_keep:    { name: "Tide Keep",      w: 9, h: 7, furn: "keep" },
    sakura_castle: { name: "Sakura Castle", w: 10, h: 8, furn: "keep" },
    sun_keep:     { name: "Sun Keep",       w: 8, h: 6, furn: "keep" },
    gilt_keep:    { name: "Gilt Keep",      w: 9, h: 7, furn: "keep" },
    harbor_keep:  { name: "Harbor Keep",    w: 9, h: 7, furn: "keep" },
    noble_villa:  { name: "Noble Villa",    w: 8, h: 7, furn: "manor" },
    chancery:     { name: "Chancery",       w: 8, h: 6, furn: "hall" },
    high_temple:  { name: "High Temple",    w: 9, h: 9, furn: "holy2" },
    city_watch:   { name: "City Watch",     w: 8, h: 6, furn: "barracks" },
    courthouse:   { name: "Courthouse",     w: 8, h: 6, furn: "hall" },
    // ---- v12 service shops (all mid/large cities carry the full set) ----
    black_market: { name: "Black Market",   w: 7, h: 5, furn: "blackmarket" },
    arcane_shop:  { name: "Arcane Shop",    w: 7, h: 6, furn: "arcane" },
    library:      { name: "Library",        w: 8, h: 6, furn: "library" },
    bookstore:    { name: "Bookstore",      w: 6, h: 5, furn: "library" },
    // ---- enemy holdings: war-huts, tents, halls and lookouts of their own
    goblin_hut:   { name: "Goblin Hut",     w: 5, h: 4, furn: "home" },
    war_tent:     { name: "War Tent",       w: 6, h: 4, furn: "barracks" },
    warg_pen:     { name: "Warg Pen",       w: 6, h: 5, furn: "store" },
    orc_hut:      { name: "Orc Hut",        w: 6, h: 5, furn: "home" },
    orc_hall:     { name: "Warchief Hall",  w: 9, h: 7, furn: "hall" },
    lookout:      { name: "Lookout",        w: 4, h: 4, furn: "store" },
    brigand_tent: { name: "Brigand Tent",   w: 5, h: 4, furn: "home" },
    loot_house:   { name: "Loot House",     w: 6, h: 5, furn: "store" },
    // ---- kobold warren: shored burrows, scrap works, the king's nook
    kobold_burrow:   { name: "Kobold Burrow",   w: 4, h: 4, furn: "home" },
    scrap_workshop:  { name: "Scrap Workshop",  w: 5, h: 4, furn: "forge" },
    scrap_heap:      { name: "Scrap Heap",      w: 5, h: 4, furn: "store" },
    kobold_nook:     { name: "Kobold King's Nook", w: 6, h: 5, furn: "hall" },
    // ---- gnoll den: bone-hide tents around the alpha's mound
    gnoll_hide:   { name: "Gnoll Hide Tent", w: 5, h: 4, furn: "home" },
    bone_pile:    { name: "Bone Pile",       w: 5, h: 4, furn: "store" },
    alpha_mound:  { name: "Alpha's Mound",   w: 7, h: 5, furn: "hall" },
    // ---- skeleton crypt: chapels of bone around the wight throne
    bone_chapel:   { name: "Bone Chapel",       w: 6, h: 5, furn: "holy" },
    ossuary:       { name: "Ossuary",           w: 5, h: 5, furn: "store" },
    wight_throne:  { name: "Wight Throne Room", w: 8, h: 6, furn: "hall" },
    // ---- cultist sanctum: cells, rite circles, the pit chapel
    dark_cell:   { name: "Dark Cell",   w: 5, h: 4, furn: "barracks" },
    rite_circle: { name: "Rite Circle", w: 6, h: 6, furn: "rune" },
    pit_chapel:  { name: "Pit Chapel",  w: 7, h: 7, furn: "holy2" },
    // ---- haunted barrow: mounds, shrines and cairns in the bog
    barrow_mound:  { name: "Barrow Mound",  w: 7, h: 5, furn: "holy" },
    spirit_shrine: { name: "Spirit Shrine", w: 5, h: 5, furn: "shrine" },
    cairn:         { name: "Cairn",         w: 4, h: 4, furn: "store" },
    // ---- minotaur maze: cells and bronze works around the bull hall
    maze_cell:    { name: "Maze Cell",        w: 5, h: 4, furn: "barracks" },
    bronze_forge: { name: "Bronze Forge",     w: 6, h: 5, furn: "forge" },
    bull_hall:    { name: "Bull Throne Hall", w: 10, h: 7, furn: "hall" },
    // ---- serpent temple: coil dens and egg vaults around the sunken chapel
    coil_den:      { name: "Coil Den",      w: 5, h: 5, furn: "home" },
    sunken_chapel: { name: "Sunken Chapel", w: 7, h: 6, furn: "tide" },
    egg_vault:     { name: "Egg Vault",     w: 5, h: 5, furn: "store" },
    // ---- harpy roost: nest platforms and rookeries below the perch
    nest_platform:   { name: "Nest Platform",     w: 4, h: 4, furn: "store" },
    rookery:         { name: "Rookery",             w: 6, h: 4, furn: "barracks" },
    matriarch_perch: { name: "Matriarch's Perch",  w: 6, h: 5, furn: "hall" },
    // ---- troll den: hovels and caches around the mossy feast hall
    troll_hovel: { name: "Troll Hovel",       w: 6, h: 5, furn: "home" },
    moss_cache:  { name: "Moss Cache",        w: 5, h: 4, furn: "store" },
    moss_hall:   { name: "Mossy Feast Hall",  w: 8, h: 6, furn: "hall" },
    // ---- hell holdings: one war-band look per holding, built from the
    // existing furn kits (home/barracks/store/hall/forge/rune) so no new
    // furniture is needed — palettes above carry the hell read.
    cinder_hut:     { name: "Cinder Hut",       w: 5, h: 4, furn: "home" },
    ash_forge:      { name: "Ash Forge",        w: 6, h: 5, furn: "forge" },
    cinder_hall:    { name: "Cinder Hall",      w: 8, h: 6, furn: "hall" },
    gore_hovel:     { name: "Gore Hovel",       w: 5, h: 4, furn: "home" },
    blood_pit:      { name: "Blood Pit",        w: 6, h: 6, furn: "rune" },
    gore_hall:      { name: "Gore Hall",        w: 8, h: 6, furn: "hall" },
    obsidian_cell:  { name: "Obsidian Cell",    w: 5, h: 4, furn: "barracks" },
    glass_forge:    { name: "Glass Forge",      w: 6, h: 5, furn: "forge" },
    obsidian_throne:{ name: "Obsidian Throne",  w: 9, h: 7, furn: "hall" },
    flesh_hovel:    { name: "Flesh Hovel",      w: 6, h: 5, furn: "home" },
    gut_pit:        { name: "Gut Pit",          w: 6, h: 6, furn: "store" },
    flesh_heart:    { name: "Flesh Heart",      w: 7, h: 6, furn: "hall" },
    // ---- heaven: dawn-white builds of the angel hearths (own classes, same
    // furn kits as their base tiers — no new furniture needed) ----
    cloud_cottage: { name: "Cloud Cottage",   w: 5, h: 4, furn: "home" },
    halo_grove:    { name: "Halo Grove",      w: 6, h: 4, furn: "farm" },
    dawn_smithy:   { name: "Dawn Smithy",     w: 5, h: 4, furn: "forge" },
    halo_chapel:   { name: "Halo Chapel",      w: 5, h: 6, furn: "holy" },
    cloud_inn:     { name: "Cloud Inn",        w: 8, h: 6, furn: "inn" },
    sunlit_market: { name: "Sunlit Market",    w: 7, h: 5, furn: "shop" },
    dawn_church:   { name: "Dawn Church",      w: 7, h: 8, furn: "holy" },
    dawn_library:  { name: "Dawn Library",     w: 8, h: 6, furn: "library" },
    dawn_forge:    { name: "Dawn Forge",       w: 7, h: 6, furn: "forge" },
    radiant_cathedral: { name: "Radiant Cathedral", w: 9, h: 10, furn: "holy2" },
    seraph_barracks: { name: "Seraph Barracks", w: 8, h: 6, furn: "barracks" },
    dawn_manor:    { name: "Dawn Manor",       w: 8, h: 7, furn: "manor" },
  };
 // Repeat helper for the big-town layouts below (keeps the lists readable).
 function _rep(cls, n) { const a = []; for (let i = 0; i < n; i++) a.push(cls); return a; }
  // ---- settlement tiers (Nov 2026): important services concentrate in towns+ ----
  // SMALL hamlets (r11-13) keep homes + small holy + inns/stables only.
  // MID towns (r32-36) and LARGE metros (r75-95) carry the full service set
  // (market/smith/library/bookstore/dojo/black-market/arcane + guild halls).
  // CASTLES (keeps + grand castle + palace seats) are capital-only.
  const SMALL_HAMLET_TYPES = { village: 1, desert_souk: 1, steppe_ger: 1, mesa_pueblo: 1, frost_hold: 1, demon_village: 1, angel_village: 1, pantheon_outpost: 1 };
  const CASTLE_ONLY_KEYS = {
    grand_castle: 1, castle_keep: 1, village_keep: 1, town_keep: 1,
    city_citadel: 1, tide_keep: 1, sakura_castle: 1, sun_keep: 1,
    gilt_keep: 1, harbor_keep: 1, palace: 1,
  };
  // City-important classKeys: shops, guild halls, civic seats, grand holy,
  // guards. Hamlets never place these (see settlementBuildings guard below).
  // Small-footprint culture basics (smithy shed, souk stall, turquoise shop)
  // + caravanserai (desert inn) + plain inns/baths/small holy/homes/stables stay.
  const CITY_IMPORTANT_KEYS = {
    market: 1, shop: 1, grand_bazaar: 1, fish_market: 1,
    counting_house: 1, forge: 1, forge_works: 1,
    great_forge: 1, library: 1, bookstore: 1, dojo: 1,
    black_market: 1, arcane_shop: 1, tea_house: 1, tavern_hall: 1,
    guildhall: 1, khan_hall: 1, terrace_hall: 1, ice_hall: 1, mead_hall: 1,
    chancery: 1, courthouse: 1, city_watch: 1, high_temple: 1,
    cathedral: 1, barracks: 1,
  };
  const LAYOUTS = {
   // Tier rule: SMALL hamlets = homes + small holy + inn/stable only.
   // MID (town/watergate/sakura/fortress) + LARGE (city/trade/port/capital)
   // carry the full service set. Castles are capital-only: no keeps in
   // hamlets/towns/metros, enforced again by the placement guard below.
    village:   ["cottage", "smithy_shed", "farmhouse", "chapel", "cottage", "stable"],
    town:      ["forge", "church", "inn", "shop", "market", "library", "bookstore", "dojo", "black_market", "arcane_shop", "guildhall", "shop", "market", ..._rep("timber_house", 64), "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "market", "market", "market", "market", "market", "market", "market", "inn", "inn", "inn", "inn", "inn", "church", "church", "church", "forge", "forge", "library", "bookstore", "dojo", "black_market", "arcane_shop", "stable"],
    city:      ["cathedral", "cathedral", "guildhall", "guildhall", "guildhall", "barracks", "barracks", "barracks", "barracks", "manor", "manor", "manor", "manor", "forge_works", "forge_works", "market", "market", "market", "market", "library", "library", "bookstore", "dojo", "dojo", "black_market", "arcane_shop", ..._rep("townhouse", 160), "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "market", "market", "market", "market", "market", "market", "market", "market", "inn", "inn", "inn", "inn", "inn", "inn", "inn", "church", "church", "church", "church", "manor", "manor", "manor", "manor", "manor", "manor", "guildhall", "guildhall", "barracks", "barracks", "barracks", "barracks", "library", "bookstore", "dojo", "black_market", "arcane_shop", "stable"],
    watergate: ["tide_temple", "warehouse", "inn", "forge", "market", "library", "bookstore", "dojo", "black_market", "arcane_shop", "guildhall", "guildhall", ..._rep("canal_house", 64), "warehouse", "warehouse", "warehouse", "warehouse", "warehouse", "warehouse", "warehouse", "warehouse", "market", "market", "market", "market", "market", "market", "inn", "inn", "inn", "inn", "shop", "shop", "shop", "shop", "shop", "shop", "tide_temple", "tide_temple", "library", "bookstore", "dojo", "black_market", "arcane_shop", "stable"],
    sakura:    ["shrine", "tea_house", "bathhouse", "dojo", "library", "bookstore", "black_market", "arcane_shop", "market", "forge", "guildhall", "guildhall", "inn", "inn", "machiya", ..._rep("machiya", 60), "tea_house", "tea_house", "tea_house", "tea_house", "tea_house", "tea_house", "tea_house", "bathhouse", "bathhouse", "bathhouse", "bathhouse", "bathhouse", "bathhouse", "dojo", "dojo", "dojo", "dojo", "dojo", "shrine", "shrine", "shrine", "shop", "shop", "shop", "shop", "shop", "shop", "library", "bookstore", "black_market", "arcane_shop", "stable"],
    fortress:  ["great_hall", "great_forge", "rune_chapel", "mead_hall", "storehouse", "market", "library", "bookstore", "dojo", "black_market", "arcane_shop", "inn", "inn", "library", "bookstore", "dojo", "black_market", "arcane_shop", ..._rep("barracks", 24), ..._rep("storehouse", 12), ..._rep("timber_house", 28), "mead_hall", "mead_hall", "mead_hall", "mead_hall", "rune_chapel", "rune_chapel", "rune_chapel", "forge", "forge", "forge", "stable"],
    desert_souk: ["caravanserai", "sun_temple", "souk_stall", "adobe_house", "adobe_house", "adobe_house", "stable"],
    steppe_ger: ["ger", "ger", "ger", "sky_shrine", "horse_pen", "ger", "stable"],
    mesa_pueblo: ["pueblo_house", "pueblo_house", "kiva", "turquoise_shop", "sun_temple", "pueblo_house", "stable"],
    frost_hold: ["snow_cottage", "runestone_hut", "sauna", "snow_cottage", "stable"],
    trade_city: ["grand_bazaar", "grand_bazaar", "counting_house", "counting_house", "counting_house", "counting_house", "merchant_villa", "merchant_villa", "merchant_villa", "merchant_villa", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "tavern_hall", "tavern_hall", "guildhall", "guildhall", "library", "library", "bookstore", "dojo", "black_market", "arcane_shop", "forge", "market", ..._rep("townhouse", 110), ..._rep("merchant_villa", 40), "grand_bazaar", "grand_bazaar", "grand_bazaar", "grand_bazaar", "grand_bazaar", "counting_house", "counting_house", "counting_house", "counting_house", "counting_house", "counting_house", "counting_house", "counting_house", "counting_house", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "inn", "inn", "inn", "inn", "inn", "inn", "manor", "manor", "manor", "manor", "manor", "manor", "manor", "manor", "barracks", "barracks", "barracks", "barracks", "barracks", "barracks", "guildhall", "guildhall", "guildhall", "library", "bookstore", "dojo", "black_market", "arcane_shop", "stable"],
    port_city: ["lighthouse", "harbor_office", "guildhall", "guildhall", "fish_market", "fish_market", "sail_loft", "sail_loft", "tide_temple", "library", "bookstore", "dojo", "black_market", "arcane_shop", "market", "forge", ..._rep("dockhouse", 140), ..._rep("warehouse", 24), "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "trade_warehouse", "fish_market", "fish_market", "fish_market", "fish_market", "fish_market", "fish_market", "fish_market", "fish_market", "sail_loft", "sail_loft", "sail_loft", "sail_loft", "sail_loft", "sail_loft", "inn", "inn", "inn", "inn", "inn", "inn", "inn", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "harbor_office", "tide_temple", "tide_temple", "stable"],
    // Capital-only castles: the Grand Castle sits dead-center (see below); the
    // eight culture keeps stand as the capital's castle quarter (one each).
    capital: ["grand_castle", "palace", "sakura_castle", "city_citadel", "tide_keep", "gilt_keep", "harbor_keep", "sun_keep", "town_keep", "village_keep", "palace", "high_temple", "high_temple", "chancery", "chancery", "courthouse", "courthouse", "city_watch", "city_watch", "city_watch", "city_watch", "barracks", "barracks", "barracks", "barracks", "library", "library", "bookstore", "dojo", "dojo", "black_market", "black_market", "arcane_shop", "arcane_shop", "market", "forge", "inn", "inn", "inn", "inn", "inn", "cathedral", "cathedral", ..._rep("noble_villa", 60), ..._rep("townhouse", 150), "manor", "manor", "manor", "manor", "manor", "manor", "manor", "manor", "manor", "manor", "guildhall", "guildhall", "guildhall", "guildhall", "cathedral", "cathedral", "cathedral", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "market", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "shop", "inn", "inn", "inn", "inn", "inn", "inn", "inn", "city_watch", "city_watch", "city_watch", "city_watch", "barracks", "barracks", "barracks", "barracks", "barracks", "barracks", "chancery", "chancery", "courthouse", "courthouse", "high_temple", "high_temple", "library", "bookstore", "dojo", "black_market", "arcane_shop", "stable"],
    // ---- heaven: dawn mirrors of the base tiers (same sizes/seeds stay
    // consistent between bake + exterior because both use the real type now)
    angel_village: ["cloud_cottage", "dawn_smithy", "halo_grove", "halo_chapel", "cloud_cottage", "stable"],
    pantheon_outpost: ["cloud_cottage", "halo_chapel", "dawn_smithy", "cloud_cottage", "cloud_inn", "stable"],
    angel_town: ["dawn_forge", "dawn_church", "cloud_inn", "sunlit_market", "sunlit_market", "dawn_library", "bookstore", "dojo", "halo_chapel", "arcane_shop", "guildhall", "sunlit_market", "sunlit_market", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "dawn_church", "dawn_forge", "stable"],
    angel_city: ["radiant_cathedral", "guildhall", "seraph_barracks", "seraph_barracks", "dawn_manor", "dawn_manor", "dawn_forge", "sunlit_market", "sunlit_market", "dawn_library", "bookstore", "dojo", "sunlit_market", "arcane_shop", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "dawn_manor", "dawn_church", "dawn_forge", "stable", "cloud_inn", "cloud_inn"],
    pantheon: ["radiant_cathedral", "dawn_church", "dawn_library", "bookstore", "dojo", "guildhall", "cloud_inn", "sunlit_market", "sunlit_market", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "cloud_cottage", "dawn_forge", "stable"],
    // enemy holdings never take a stable (no lodge in a war camp)
    goblin_village: ["goblin_hut", "goblin_hut", "goblin_hut", "war_tent", "war_tent", "warg_pen", "lookout", "goblin_hut"],
    orc_stronghold: ["orc_hut", "orc_hut", "orc_hall", "war_tent", "orc_hut", "lookout", "warg_pen", "orc_hut"],
    brigand_camp: ["brigand_tent", "brigand_tent", "loot_house", "war_tent", "brigand_tent", "lookout"],
    kobold_warren: ["kobold_burrow", "kobold_burrow", "scrap_workshop", "kobold_burrow", "scrap_heap", "kobold_nook", "lookout"],
    gnoll_den: ["gnoll_hide", "gnoll_hide", "bone_pile", "gnoll_hide", "alpha_mound", "lookout"],
    skeleton_crypt: ["bone_chapel", "ossuary", "bone_chapel", "wight_throne", "ossuary", "lookout"],
    cultist_sanctum: ["dark_cell", "dark_cell", "rite_circle", "pit_chapel", "dark_cell", "lookout"],
    haunted_barrow: ["barrow_mound", "spirit_shrine", "cairn", "barrow_mound", "lookout"],
    minotaur_maze: ["maze_cell", "maze_cell", "bronze_forge", "maze_cell", "bull_hall", "maze_cell", "lookout"],
    serpent_temple: ["coil_den", "sunken_chapel", "coil_den", "egg_vault", "coil_den", "lookout"],
    harpy_roost: ["nest_platform", "nest_platform", "rookery", "matriarch_perch", "nest_platform", "lookout"],
   troll_den: ["troll_hovel", "troll_hovel", "moss_cache", "troll_hovel", "moss_hall", "lookout"],
    // ---- hell holdings: war-band camps of their own (never a stable)
    cinder_warren: ["cinder_hut", "cinder_hut", "ash_forge", "cinder_hut", "cinder_hall", "lookout"],
    gore_hold: ["gore_hovel", "gore_hovel", "blood_pit", "gore_hovel", "gore_hall", "lookout"],
    obsidian_citadel: ["obsidian_cell", "obsidian_cell", "glass_forge", "obsidian_cell", "obsidian_throne", "lookout"],
    flesh_pit: ["flesh_hovel", "flesh_hovel", "gut_pit", "flesh_hovel", "flesh_heart", "lookout"],
    marrow_ossuary: ["ossuary", "bone_chapel", "bone_pile", "ossuary", "wight_throne", "lookout"],
    gloom_spire: ["obsidian_cell", "dark_cell", "rite_circle", "obsidian_cell", "obsidian_throne", "lookout"],
    // v16 hell holds: alien builds from the existing catalogue (obsidian walls,
    // bone chapels, flesh halls) — ground/furn make them read as hell.
    demon_village: ["cottage", "chapel", "smithy_shed", "cottage", "stable"],
    demon_town: ["forge", "church", "inn", "shop", "market", "library", "dojo", "black_market", "arcane_shop", "guildhall", "timber_house", "timber_house", "timber_house", "timber_house", "timber_house", "timber_house", "chapel", "forge", "stable"],
    demon_city: ["cathedral", "guildhall", "barracks", "forge_works", "market", "library", "dojo", "black_market", "arcane_shop", "townhouse", "townhouse", "townhouse", "townhouse", "townhouse", "townhouse", "manor", "church", "forge", "stable", "inn", "inn"],
    hell_castle: ["grand_castle", "palace", "city_citadel", "high_temple", "barracks", "barracks", "cathedral"],
  };

  // ---------- non-rectangular footprints (Nov 2026) ----------
  // The plot rect (x0..x1, y0..y1) is the fenced LAWN. The walled building
  // is a SHAPE inside it: the full rect minus lawn corner cutouts. Corners
  // only, never edge centers: doors (which face the settlement center on
  // ANY side) always land on outer wall coincident with the plot edge, so
  // fence gates stay tile-exact by construction, and every shape tile stays
  // inside the plot rect (bounds-audited in validateOverlaps) - placement
  // and overlap guarantees carry over unchanged from the rect era.
  // Spec: [corner, width, height]; corners: NW NE SW SE.
  const SHAPES = {
    cottage: [["NE", 2, 1]], farmhouse: [["NE", 2, 1]],
    chapel: [["NW", 1, 2], ["NE", 2, 1], ["SW", 2, 2], ["SE", 1, 1]],
    smithy_shed: [["SW", 2, 1]],
    timber_house: [["NE", 2, 2]],
    forge: [["NW", 2, 2], ["NE", 2, 2]],
    church: [["NW", 2, 2], ["NE", 2, 3], ["SW", 3, 2], ["SE", 2, 2]],
    inn: [["NW", 2, 2], ["NE", 2, 2]],
    shop: [["SE", 2, 1]], townhouse: [["NE", 2, 2]],
    cathedral: [["NW", 2, 3], ["NE", 3, 2], ["SW", 3, 3], ["SE", 2, 2], ["NW", 1, 2], ["SE", 1, 3]],
    guildhall: [["SW", 2, 2], ["SE", 2, 2]],
    barracks: [["NW", 2, 2], ["NE", 2, 2]],
    manor: [["NW", 2, 2], ["SE", 2, 2]],
    forge_works: [["SW", 2, 2], ["SE", 2, 2]],
    market: [["SW", 2, 1]], canal_house: [["SW", 2, 2]],
    tide_temple: [["NW", 3, 2], ["NE", 2, 3], ["SW", 2, 2], ["SE", 3, 3]],
    warehouse: [["NE", 3, 2]], machiya: [["NE", 2, 1]],
    shrine: [["NW", 2, 3], ["NE", 3, 2], ["SW", 2, 2], ["SE", 2, 2], ["NE", 1, 3]],
    tea_house: [["SW", 2, 1]],
    bathhouse: [["NW", 2, 2], ["NE", 2, 2]],
    dojo: [["SW", 2, 2], ["SE", 2, 2]],
    great_forge: [["NW", 2, 2], ["NE", 2, 2]],
    adobe_house: [["NE", 2, 1]], souk_stall: [["SE", 2, 1]], caravanserai: [["SW", 2, 2], ["SE", 3, 2], ["SW", 1, 3]],
    sun_temple: [["NW", 3, 2], ["NE", 2, 2], ["SW", 2, 3], ["SE", 3, 3]],
    ger: [["NW", 1, 1], ["NE", 1, 1], ["SW", 1, 1], ["SE", 1, 1]],
    horse_pen: [["NE", 2, 1]], sky_shrine: [["NW", 1, 1], ["NE", 1, 1], ["SW", 1, 1], ["SE", 1, 1]],
    khan_hall: [["NW", 2, 2], ["NE", 3, 2], ["NW", 1, 3]],
    pueblo_house: [["NE", 2, 1]], kiva: [["NW", 2, 2], ["SE", 2, 2]],
    turquoise_shop: [["SE", 2, 1]], terrace_hall: [["SW", 2, 2], ["SE", 3, 2], ["SE", 1, 3]],
    snow_cottage: [["NE", 2, 1]], ice_hall: [["NW", 2, 2], ["NE", 3, 2], ["SW", 3, 3], ["SE", 2, 2], ["SW", 1, 2]],
    sauna: [["SW", 2, 1]], runestone_hut: [["NW", 2, 3], ["SE", 3, 2], ["NW", 1, 2]],
    grand_bazaar: [["SW", 3, 2], ["SE", 4, 2], ["SW", 1, 2], ["SE", 2, 2]], counting_house: [["SW", 2, 2], ["SE", 3, 2]],
    merchant_villa: [["NW", 2, 2], ["SE", 2, 2]], trade_warehouse: [["NE", 3, 2]],
    tavern_hall: [["NW", 2, 2], ["NE", 2, 2]],
    dockhouse: [["NE", 2, 1]], lighthouse: [["NW", 1, 1], ["NE", 2, 1], ["NE", 1, 2]],
    harbor_office: [["SW", 2, 2], ["SE", 2, 2]], fish_market: [["SW", 2, 1]], sail_loft: [["NE", 2, 1]],
   palace: [["NW", 2, 2], ["NE", 3, 2], ["SW", 3, 2], ["SE", 2, 3], ["NW", 1, 3], ["SE", 1, 2]],
   castle_keep: [["NW", 3, 2], ["NE", 3, 3], ["SW", 2, 3], ["SE", 3, 2], ["NW", 1, 4], ["NE", 1, 2], ["SW", 1, 2]],
   grand_castle: [["NW", 4, 3], ["NE", 5, 3], ["SW", 3, 5], ["SE", 4, 4], ["NW", 2, 6], ["NE", 2, 5], ["SW", 2, 2], ["SE", 2, 6]],
    village_keep: [["NW", 2, 1], ["SE", 2, 1]],
    town_keep: [["NW", 2, 2], ["NE", 2, 2], ["SW", 3, 2], ["SE", 2, 2]],
    city_citadel: [["NW", 2, 2], ["NE", 3, 2], ["SW", 3, 2], ["SE", 2, 3], ["NW", 1, 3]],
    tide_keep: [["NW", 3, 2], ["NE", 2, 3], ["SW", 2, 2], ["SE", 3, 2]],
    sakura_castle: [["NW", 2, 2], ["NE", 3, 2], ["SW", 3, 3], ["SE", 2, 2], ["NW", 1, 3]],
    sun_keep: [["NW", 3, 2], ["NE", 2, 2], ["SW", 2, 2], ["SE", 3, 2]],
    gilt_keep: [["NW", 2, 2], ["NE", 3, 2], ["SW", 2, 2], ["SE", 3, 3]],
    harbor_keep: [["NW", 2, 2], ["NE", 2, 3], ["SW", 3, 2], ["SE", 2, 2]],
    black_market: [["SW", 2, 1]],
    arcane_shop: [["SW", 2, 1]],
    library: [["SW", 2, 2], ["SE", 2, 2]],
    bookstore: [["SE", 2, 1]],
    noble_villa: [["NW", 2, 2], ["SE", 2, 3], ["NW", 1, 2]], chancery: [["SW", 2, 2], ["SE", 3, 2]],
    high_temple: [["NW", 3, 3], ["NE", 3, 2], ["SW", 2, 3], ["SE", 3, 3], ["NW", 1, 4]],
    city_watch: [["NW", 2, 2], ["NE", 3, 2]], courthouse: [["SW", 2, 2], ["SE", 3, 2]],
    rune_chapel: [["NW", 2, 3], ["SE", 3, 2], ["NW", 1, 2]],
    mead_hall: [["NW", 2, 2], ["NE", 3, 2], ["SW", 2, 3], ["SE", 2, 2]],
    storehouse: [["NE", 2, 1]],
    great_hall: [["NW", 2, 2], ["NE", 3, 2], ["SW", 2, 3], ["SE", 3, 3], ["NE", 1, 4]],
    stable: [["NE", 2, 1]],
    beast_lodge: [["NE", 2, 1]],
    // enemy holdings (were full-rect boxes — now stepped, corners-only so doors stay tile-exact)
    goblin_hut: [["NE", 2, 1]], war_tent: [["SW", 2, 1]], warg_pen: [["NE", 2, 1]],
    orc_hut: [["NW", 2, 1]], orc_hall: [["NW", 3, 2], ["NE", 2, 2], ["SW", 2, 3], ["SE", 3, 2]],
    lookout: [["NW", 1, 1]], brigand_tent: [["SW", 2, 1]], loot_house: [["SE", 2, 1]],
    kobold_burrow: [["NW", 1, 1]], scrap_workshop: [["SW", 2, 1]], scrap_heap: [["SE", 2, 1]],
    kobold_nook: [["NW", 1, 2], ["NE", 2, 1], ["SW", 2, 1]],
    gnoll_hide: [["NE", 2, 1]], bone_pile: [["SE", 2, 1]],
    alpha_mound: [["NW", 2, 1], ["NE", 1, 2], ["SW", 2, 2], ["SE", 2, 1]],
    bone_chapel: [["NW", 1, 2], ["NE", 1, 2]], ossuary: [["SW", 1, 1]],
    wight_throne: [["NW", 2, 3], ["NE", 2, 2], ["SW", 3, 2], ["SE", 2, 2]],
    dark_cell: [["SW", 1, 1]], rite_circle: [["NW", 1, 1], ["SE", 1, 1]],
    pit_chapel: [["NW", 2, 2], ["NE", 2, 3], ["SW", 3, 2], ["SE", 2, 3]],
    barrow_mound: [["NW", 2, 1], ["SE", 2, 1]], spirit_shrine: [["NW", 1, 1], ["NE", 1, 1]],
    cairn: [["SE", 1, 1]], maze_cell: [["SW", 1, 1]], bronze_forge: [["SE", 2, 1]],
    bull_hall: [["NW", 2, 2], ["NE", 3, 2], ["SW", 2, 2], ["SE", 2, 3]],
    coil_den: [["NE", 1, 1]], sunken_chapel: [["NW", 2, 2], ["SE", 2, 2]], egg_vault: [["SW", 1, 1]],
    nest_platform: [["NW", 1, 1]], rookery: [["NE", 2, 1]],
    matriarch_perch: [["NW", 2, 1], ["NE", 2, 2], ["SE", 1, 2]],
    troll_hovel: [["NE", 2, 1]], moss_cache: [["SW", 2, 1]],
    moss_hall: [["NW", 2, 2], ["NE", 2, 3], ["SW", 3, 2], ["SE", 2, 2]],
    cinder_hut: [["NE", 2, 1]], ash_forge: [["SE", 2, 1]],
    cinder_hall: [["NW", 2, 2], ["NE", 2, 3], ["SW", 3, 2], ["SE", 2, 2]],
    gore_hovel: [["SW", 2, 1]], blood_pit: [["NW", 1, 1], ["SE", 1, 1]],
    // heaven: dawn footprints (cruciform chapels, ringed cathedral)
    cloud_cottage: [["NE", 2, 1]], halo_grove: [["SW", 2, 1]], dawn_smithy: [["SW", 2, 1]],
    halo_chapel: [["NW", 1, 2], ["NE", 2, 1], ["SW", 2, 2], ["SE", 1, 1]],
    cloud_inn: [["NW", 2, 2], ["NE", 2, 2]], sunlit_market: [["SW", 2, 1]],
    dawn_church: [["NW", 2, 2], ["NE", 2, 3], ["SW", 3, 2], ["SE", 2, 2]],
    dawn_library: [["SW", 2, 2], ["SE", 2, 2]], dawn_forge: [["NW", 2, 2], ["NE", 2, 2]],
    radiant_cathedral: [["NW", 2, 3], ["NE", 3, 2], ["SW", 3, 3], ["SE", 2, 2], ["NW", 1, 2], ["SE", 1, 3]],
    seraph_barracks: [["NW", 2, 2], ["NE", 2, 2]], dawn_manor: [["NW", 2, 2], ["SE", 2, 3]],
    gore_hall: [["NW", 2, 1], ["NE", 1, 2], ["SW", 2, 2], ["SE", 2, 1]],
    obsidian_cell: [["SW", 1, 1]], glass_forge: [["SE", 2, 1]],
    obsidian_throne: [["NW", 2, 2], ["NE", 3, 2], ["SW", 2, 2], ["SE", 2, 3]],
    flesh_hovel: [["NE", 2, 1]], gut_pit: [["SE", 2, 1]],
    flesh_heart: [["NW", 2, 2], ["NE", 2, 2], ["SW", 2, 3], ["SE", 2, 2]],
  };
  // Local notch rects (inclusive) for a w,h plot. Clamped so every side
  // keeps a >=3-tile (or maximal) center run for doors.
  function notchRectsFor(clsKey, w, h) {
    const spec = SHAPES[clsKey];
    if (!spec) return [];
    const out = [];
    for (const s of spec) {
      const corner = s[0];
      const cw = Math.max(1, Math.min(s[1], w - 3));
      const ch = Math.max(1, Math.min(s[2], h - 3));
      if (cw <= 0 || ch <= 0) continue;
      if (corner === "NW") out.push({ lx0: 0, ly0: 0, lx1: cw - 1, ly1: ch - 1 });
      else if (corner === "NE") out.push({ lx0: w - cw, ly0: 0, lx1: w - 1, ly1: ch - 1 });
      else if (corner === "SW") out.push({ lx0: 0, ly0: h - ch, lx1: cw - 1, ly1: h - 1 });
      else if (corner === "SE") out.push({ lx0: w - cw, ly0: h - ch, lx1: w - 1, ly1: h - 1 });
    }
    return out;
  }
  // True when local tile (lx,ly) is walled building (not lawn cutout).
  // Buildings without notch cutouts are full rects.
  function inShape(b, lx, ly) {
    if (!b || lx < 0 || ly < 0 || lx >= b.w || ly >= b.h) return false;
    const ns = b.notches;
    if (!ns || !ns.length) return true;
    for (const n of ns) {
      if (lx >= n.lx0 && lx <= n.lx1 && ly >= n.ly0 && ly <= n.ly1) return false;
    }
    return true;
  }
  // True when a global tile is building WALL (shape tile touching lawn, the
  // plot rim, or a cutout). Doors/windows sit on such tiles.
  function isShapeEdge(b, gx, gy) {
    const lx = gx - b.x0, ly = gy - b.y0;
    if (!inShape(b, lx, ly)) return false;
    if (lx === 0 || ly === 0 || lx === b.w - 1 || ly === b.h - 1) return true;
    return !inShape(b, lx + 1, ly) || !inShape(b, lx - 1, ly) ||
      !inShape(b, lx, ly + 1) || !inShape(b, lx, ly - 1);
  }

  const cache = new Map(); // "type:cx,cy" -> buildings[]
  function cacheGet(k) { return cache.get(k) || null; }
  function cacheSet(k, v) { cache.set(k, v); if (cache.size > 40) { const f = cache.keys().next().value; cache.delete(f); } }
  // keys currently being built (see settlementBuildings guard): while set,
  // buildingTileAt must skip buildings so settleTile yields base ground.
  const _buildingInProgress = new Set();

  function rngFor(cx, cy, type) { return mulberry(hashStr(`${type}:${cx},${cy}`)); }

  function rectsOverlap(a, b, gap) {
    gap = gap || 0;
    return !(a.x1 + gap < b.x0 || b.x1 + gap < a.x0 || a.y1 + gap < b.y0 || b.y1 + gap < a.y0);
  }
  // settlement-level exclusions (rings, moats, canals, pond) — mirrors world.js.
  // skipSoft (stable fallback only): roads + the center plaza may host the
  // lodge — its door opens onto them — while every hard band still excludes.
  function inExclusion(sType, gx, gy, s, skipSoft) {
    const dx = gx - s.cx, dy = gy - s.cy, d = Math.hypot(dx, dy), R = s.radius;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (sType === "city" || sType === "angel_city") { if (d >= R - 3.2) return true; }
    if (sType === "pantheon") {
      if (d >= R - 3.2) return true;
      const cit = R * 0.4;
      if (d >= cit - 1.2 && d <= cit + 1.2) return true;
    }
    if (sType === "trade_city") { if (d >= R - 3.2) return true; }
    if (sType === "port_city") {
      if (d > R - 5) return true;
      const brx = R * 0.38, bry = R * 0.19;
      const hdx = gx - s.cx, hdy = gy - (s.cy + R - bry - 4);
      if ((hdx * hdx) / (brx * brx) + (hdy * hdy) / (bry * bry) <= 1) return true;
    }
    if (sType === "capital") {
      if (d >= R - 3.2) return true;
      const cit = R * 0.38;
      if (d >= cit - 1.2 && d <= cit + 1.2) return true;
    }
    if (sType === "frost_hold") {
      const pdx = gx - s.cx + 7, pdy = gy - s.cy + 5;
      if ((pdx * pdx) / 16 + (pdy * pdy) / 11 <= 1) return true;
    }
    if (sType === "desert_souk") {
      const odx = gx - s.cx + 7, ody = gy - s.cy + 5;
      if ((odx * odx) / 16 + (ody * ody) / 11 <= 1) return true;
    }
    if (sType === "watergate") {
      if (d > R - 5) return true;
      const inV = dx >= 5 && dx <= 6 && dy > -R + 4 && dy < R - 4;
      const inH = dy >= -6 && dy <= -5 && dx > -R + 4 && dx < R - 4;
      if (inV || inH) return true;
    }
    if (sType === "sakura") {
      const pdx = dx - 9, pdy = dy - 7;
      if ((pdx * pdx) / 16 + (pdy * pdy) / 11 <= 1) return true;
      if (dy === 12 && (dx === -2 || dx === 2)) return true;
    }
    if (sType === "fortress") { if (d > R - 4.6) return true; }
    // enemy holdings: war-huts stay clear of the ring + moat + gates so the
    // fortification band is never a building tile (its HP pool is separate).
    // Any BASE_DEF key counts — the roster grows without touching this.
    if (window.World && window.World.BASE_DEF && window.World.BASE_DEF[sType]) {
      if (d > R - 3.4) return true;
    }
    if (skipSoft) return false; // roads + plaza below may host the stable
    if (adx <= 1 || ady <= 1) return true; // roads
    if (Math.hypot(dx, dy) < 3.5) return true; // center plaza + sign
    void R;
    return false;
  }

  // ---- cross-settlement overlap guard ----
  // Region rolls are independent, so neighbouring settlements occasionally
  // overlap (verified live: two fortress centres 50 tiles apart, a
  // sakura/town pair 48 apart — both closer than the sum of their radii).
  // Each settlement used to place buildings knowing only its own radius, so
  // both claimed the same ground: the per-tile bake (nearest settlement
  // wins) drew one settlement's ground through the other's walls, and the
  // backfill stamped both footprints onto the same chunk — walls through
  // interiors, shops inside ring walls. A building is therefore only placed
  // where its own settlement wins every footprint tile plus every door
  // front (strictly nearest — ties lose, so the result never depends on
  // candidate scan order), and where no neighbouring settlement's exclusion
  // band (rings, moats, canals, ponds, roads, plaza) runs. The invariant
  // composes: buildings from different settlements can never cover the
  // same tile, and doors never open onto foreign ground. Isolated
  // settlements have no overlapping neighbours, so their layouts are
  // byte-identical to before (the fast path below).
  const _neighCache = new Map(); // settlement key -> overlapping neighbours
  function overlappingNeighbours(s) {
    try {
      const key = s.type + ":" + s.cx + "," + s.cy;
      if (_neighCache.has(key)) return _neighCache.get(key);
      const out = [];
      const W = window.World;
      if (W && W.regionSettlement) {
        const rx = Math.floor((s.cx / 16) / 8), ry = Math.floor((s.cy / 16) / 8);
        for (let ax = rx - 2; ax <= rx + 2; ax++) for (let ay = ry - 2; ay <= ry + 2; ay++) {
          let t = null;
          try { t = W.regionSettlement(ax, ay); } catch (e) { t = null; }
          if (!t || (t.cx === s.cx && t.cy === s.cy)) continue;
          if (Math.hypot(t.cx - s.cx, t.cy - s.cy) < (s.radius || 20) + (t.radius || 20) + 4) out.push(t);
        }
      }
      // the origin hearth is not a region roll — include it when close.
      try {
        // surface-only: hell has no origin hearth (its 0,0 is void).
        if (isSurfDim() && !(s.cx === 0 && s.cy === 0)) {
          const os = originSettlement();
          if (os && os.radius != null) {
            if (Math.hypot(s.cx, s.cy) < (s.radius || 20) + (os.radius || 20) + 4) {
              out.push({ cx: 0, cy: 0, radius: os.radius, type: os.type });
            }
          }
        }
      } catch (e) { }
      if (_neighCache.size > 60) { const f = _neighCache.keys().next().value; _neighCache.delete(f); }
      _neighCache.set(key, out);
      return out;
    } catch (e) { return []; }
  }
  // True when settlement s owns (gx,gy) under the bake's nearest-wins rule:
  // the strictly nearest covering settlement (reach +2 for watergate
  // moats) with no neighbouring exclusion band running through. Ties lose.
  function tileWonBy(s, gx, gy, neigh) {
    try {
      const sd = Math.hypot(gx - s.cx, gy - s.cy);
      const sReach = (s.radius || 20) + (s.type === "watergate" ? 2 : 0);
      if (sd > sReach) return false;
      const list = neigh || overlappingNeighbours(s);
      for (const n of list) {
        if (!n) continue;
        const nd = Math.hypot(gx - n.cx, gy - n.cy);
        const nReach = (n.radius || 20) + (n.type === "watergate" ? 2 : 0);
        if (nd > nReach) continue;
        if (nd <= sd) return false; // nearer-or-tied neighbour owns it
        // a neighbouring exclusion band (ring, moat, canal, pond, road)
        // never hosts foreign fabric, even where this settlement wins the
        // bake — but only inside the neighbour's reach (outside it the
        // band test is meaningless and must not reject).
        try { if (inExclusion(n.type, gx, gy, n)) return false; } catch (e) { }
      }
      return true;
    } catch (e) { return true; }
  }
  // Whole-footprint version (rect + door fronts) for placement checks.
  // Pass a precomputed neighbour list when checking many candidates.
  function footprintWins(s, b, neigh) {
    try {
      const list = neigh || overlappingNeighbours(s);
      if (!list.length) return true;
      for (let gy = b.y0; gy <= b.y1; gy++) for (let gx = b.x0; gx <= b.x1; gx++) {
        if (!tileWonBy(s, gx, gy, list)) return false;
      }
      for (const d of (b.doors || [])) {
        let f = null;
        try { f = doorFrontPos(b, d); } catch (e) { f = null; }
        if (f && !tileWonBy(s, f.x, f.y, list)) return false;
      }
      return true;
    } catch (e) { return true; }
  }

  function designBuilding(s, clsKey, x0, y0, rng, wh) {
    const cls = CLASSES[clsKey];
    const w = (wh && wh.w) || cls.w, h = (wh && wh.h) || cls.h;
    const x1 = x0 + w - 1, y1 = y0 + h - 1;
    // Capital-only castles keep their home-culture style even when raised in
    // the capital, so the v8 designs the user likes (teal canal, tile tenshu,
    // adobe kasbah, gilt gold, harbor blue...) survive the move.
    const KEEP_HOME_STYLE = { village_keep: "village", town_keep: "town", city_citadel: "city", tide_keep: "watergate", sakura_castle: "sakura", sun_keep: "desert_souk", gilt_keep: "trade_city", harbor_keep: "port_city" };
    const style = (KEEP_HOME_STYLE[clsKey] && STYLES[KEEP_HOME_STYLE[clsKey]]) || STYLES[s.type] || STYLES.town;
    const wallTile = style.wall === "STONEWALL" ? "STONEWALL" : "HOUSEWALL";
    const floorTile = style.floor;
    // Walled shape = plot rect minus lawn corner cutouts (local helpers so
    // doors/windows/furniture all land on real building tiles).
    const notches = notchRectsFor(clsKey, w, h);
    const inS = (lx, ly) => {
      if (lx < 0 || ly < 0 || lx >= w || ly >= h) return false;
      for (const n of notches) {
        if (lx >= n.lx0 && lx <= n.lx1 && ly >= n.ly0 && ly <= n.ly1) return false;
      }
      return true;
    };
    const edgeS = (lx, ly) => {
      if (!inS(lx, ly)) return false;
      if (lx === 0 || ly === 0 || lx === w - 1 || ly === h - 1) return true;
      return !inS(lx + 1, ly) || !inS(lx - 1, ly) || !inS(lx, ly + 1) || !inS(lx, ly - 1);
    };
    // door faces settlement center
    const bcx = x0 + w / 2 - 0.5, bcy = y0 + h / 2 - 0.5;
    const dx = s.cx - bcx, dy = s.cy - bcy;
    let side;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) side = "S";
    else if (Math.abs(dx) > Math.abs(dy)) side = dx > 0 ? "E" : "W";
    else side = dy > 0 ? "S" : "N";
    const doors = [];
    // Door rule: a door is a true shape edge, never a rect corner, and on
    // walls long enough to afford it never corner-adjacent either (corner
    // walls pinched such doorways shut). The center-first scan below keeps
    // every currently-valid door exactly where it is — center wins — and
    // only slides a door a notch or corner would otherwise swallow.
    const doorTileOk = (x, y) => {
      const lx = x - x0, ly = y - y0;
      if (!inS(lx, ly) || !edgeS(lx, ly)) return false;
      if ((lx === 0 || lx === w - 1) && (ly === 0 || ly === h - 1)) return false;
      return true;
    };
    const putDoor = (x, y) => {
      const horiz = (y === y0 || y === y1);
      // already valid (the common case): keep it, layouts stay identical.
      if (doorTileOk(x, y)) {
        const lx = x - x0, ly = y - y0;
        const cornerAdj = horiz ? (w >= 7 && (lx < 2 || lx > w - 3)) : (h >= 7 && (ly < 2 || ly > h - 3));
        if (!cornerAdj) { doors.push({ x, y }); return; }
      }
      // slide along the wall toward its center for the nearest valid tile.
      const lo = horiz ? x0 : y0, hi = horiz ? x1 : y1;
      const want = horiz ? x : y;
      const c = (lo + hi) / 2;
      const order = [];
      for (let d = 0; d <= hi - lo; d++) {
        const toward = want <= c ? want + d : want - d;
        const away = want <= c ? want - d : want + d;
        if (d === 0) { if (toward >= lo && toward <= hi) order.push(toward); continue; }
        if (toward >= lo && toward <= hi) order.push(toward);
        if (away >= lo && away <= hi) order.push(away);
      }
      for (const v of order) {
        const px = horiz ? v : x, py = horiz ? y : v;
        if (!doorTileOk(px, py)) continue;
        const lx = px - x0, ly = py - y0;
        if (horiz && w >= 7 && (lx < 2 || lx > w - 3)) continue;
        if (!horiz && h >= 7 && (ly < 2 || ly > h - 3)) continue;
        doors.push({ x: px, y: py });
        return;
      }
      // utter fallback (unreachable — rect walls always hold an edge):
      // keep the centered tile so the building still has a door.
      doors.push({ x, y });
    };
    if (side === "S") putDoor(x0 + 1 + Math.floor((w - 2) / 2), y1);
    else if (side === "N") putDoor(x0 + 1 + Math.floor((w - 2) / 2), y0);
    else if (side === "E") putDoor(x1, y0 + 1 + Math.floor((h - 2) / 2));
    else putDoor(x0, y0 + 1 + Math.floor((h - 2) / 2));
    // grand buildings get a second door on the south for crowds
    if ((clsKey === "cathedral" || clsKey === "church" || clsKey === "mead_hall" || clsKey === "great_hall" || clsKey === "tide_temple") && side !== "S") {
      putDoor(x0 + 1 + Math.floor((w - 2) / 2), y1);
    }
    // windows: north + flanks, never corners/doors
    const windows = [];
    const isDoor = (x, y) => doors.some(d => d.x === x && d.y === y);
    const tryWin = (x, y) => {
      if (x < x0 || x > x1 || y < y0 || y > y1) return;
      // Windows sit on shape edges only: corner cutouts removed the rect
      // corner tiles, so a rect-perimeter spot may now be lawn.
      if (!inS(x - x0, y - y0)) return;
      const onPerim = edgeS(x - x0, y - y0);
      if (!onPerim || isDoor(x, y)) return;
      windows.push({ x, y });
    };
    if (w >= 6) { tryWin(x0 + 1, y0); tryWin(x1 - 1, y0); }
    else tryWin(x0 + Math.floor(w / 2), y0);
    if (side !== "S") { if (w >= 7) { tryWin(x0 + 1, y1); tryWin(x1 - 1, y1); } }
    if (h >= 5) { tryWin(x0, y0 + 1 + Math.floor((h - 2) / 3)); tryWin(x1, y0 + 1 + Math.floor((h - 2) / 3)); }
    if (w >= 8 && h >= 6) { tryWin(x0 + Math.floor(w / 2), y0); tryWin(x0, y1 - 1); }
    // cap windows so walls dominate
    while (windows.length > 6) windows.pop();
    // furniture (interior, door-path kept clear)
    const furniture = [];
    const doorPath = new Set();
    for (const d of doors) {
      for (let i = 1; i <= 3; i++) {
        let fx = d.x, fy = d.y;
        if (d.y === y1) fy = d.y - i; else if (d.y === y0) fy = d.y + i;
        else if (d.x === x1) fx = d.x - i; else fx = d.x + i;
        if (fx > x0 && fx < x1 && fy > y0 && fy < y1) doorPath.add(fx + "," + fy);
      }
    }
    // Furniture lives in shape INTERIOR (never on walls, never in lawn
    // cutouts, never on the door path). If the classic spot fell into a
    // cutout, spiral out to the nearest free interior tile instead of
    // dropping the piece, so notched rooms stay furnished.
    const free = (x, y) => {
      if (x <= x0 || x >= x1 || y <= y0 || y >= y1) return false;
      if (!inS(x - x0, y - y0) || edgeS(x - x0, y - y0)) return false;
      if (doorPath.has(x + "," + y)) return false;
      return !furniture.some(f => f.x === x && f.y === y);
    };
    const put = (kind, x, y) => {
      if (free(x, y)) { furniture.push({ x, y, kind }); return; }
      for (let r = 1; r <= 3; r++) {
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (free(x + dx, y + dy)) { furniture.push({ x: x + dx, y: y + dy, kind }); return; }
        }
      }
    };
    const F = cls.furn;
    const cxI = x0 + (w >> 1);
    if (F === "home" || F === "sakura_home") {
      put("bed", x0 + 1, y0 + 1); put("table", cxI, y0 + 2); put("shelf", x1 - 1, y0 + 1);
      put("hearth", x1 - 1, y1 - 1); put("rug", cxI, y1 - 2);
      if (w >= 7) put("chair", cxI + 1, y0 + 2);
    } else if (F === "farm") {
      put("bunk", x0 + 1, y0 + 1); put("table", cxI, y0 + 2); put("crate", x1 - 2, y0 + 1);
      put("crate", x1 - 1, y0 + 1); put("hearth", x1 - 1, y1 - 1); put("barrel", x0 + 1, y1 - 1);
      put("shelf", x0 + 2, y1 - 1);
    } else if (F === "holy" || F === "holy2") {
      const rows = F === "holy2" ? 3 : 2;
      put("altar", cxI, y0 + 1); put("candle", cxI - 1, y0 + 1); put("candle", cxI + 1, y0 + 1);
      for (let r = 0; r < rows; r++) { put("pew_l", cxI - 1, y0 + 3 + r); put("pew_r", cxI + 1, y0 + 3 + r); }
      put("rug", cxI, y1 - 2);
      // lorebook shelves: side stacks for the chapel library (holy2 keeps a second stack)
      put("shelf", x0 + 1, y1 - 1);
      if (F === "holy2") put("shelf", x1 - 1, y1 - 1);
    } else if (F === "forge" || F === "forge2") {
      put("furnace", x0 + 1, y0 + 1); if (F === "forge2") put("furnace", x1 - 1, y0 + 1);
      put("anvil", cxI, y0 + 2); put("barrel", x0 + 1, y1 - 1); put("barrel", x0 + 2, y1 - 1);
      put("rack", x1 - 1, y0 + 2); put("trough", cxI + 1, y0 + 3); put("rug", cxI, y1 - 1);
    } else if (F === "inn") {
      put("counter", x0 + 1, y0 + 1); put("counter", x0 + 2, y0 + 1); put("table", cxI - 1, y0 + 3);
      put("table", cxI + 2, y0 + 3); put("fireplace", x1 - 1, y0 + 1); put("bunk", x0 + 1, y1 - 1);
      put("bunk", x0 + 2, y1 - 1); put("rug", cxI, y1 - 2);
    } else if (F === "shop") {
      put("counter", cxI, y0 + 2); put("shelf", x0 + 1, y0 + 1); put("shelf", x1 - 1, y0 + 1);
      put("crate", x0 + 1, y1 - 1); put("crate", x1 - 1, y1 - 1); put("rug", cxI, y1 - 2);
    } else if (F === "barracks") {
      put("bunk", x0 + 1, y0 + 1); put("bunk", x0 + 1, y0 + 2); put("bunk", x1 - 1, y0 + 1);
      put("rack", x1 - 1, y0 + 2); put("table", cxI, y0 + 3); put("rug", cxI, y1 - 1);
    } else if (F === "hall") {
      put("longtable", cxI - 1, y0 + 2); put("longtable", cxI, y0 + 2); put("hearth", cxI, y0 + 1);
      put("throne", cxI, y1 - 1); put("rug", cxI, y0 + 4); put("shelf", x0 + 1, y0 + 1);
      put("barrel", x1 - 1, y1 - 1);
    } else if (F === "manor") {
      put("bed", x0 + 1, y0 + 1); put("rug", cxI, y0 + 3); put("fireplace", x1 - 1, y0 + 1);
      put("shelf", x0 + 1, y1 - 1); put("table", cxI + 1, y0 + 2); put("chair", cxI + 2, y0 + 2);
    } else if (F === "store") {
      put("crate", x0 + 1, y0 + 1); put("crate", x0 + 2, y0 + 1); put("barrel", x1 - 1, y0 + 1);
      put("crate", x0 + 1, y1 - 1); put("barrel", x1 - 1, y1 - 1); put("crate", cxI, y0 + 2);
    } else if (F === "tide") {
      put("altar", cxI, y0 + 1); put("pool", cxI - 1, y0 + 3); put("pool", cxI + 1, y0 + 3);
      put("pew_l", cxI - 1, y0 + 4); put("pew_r", cxI + 1, y0 + 4); put("shell", x0 + 1, y0 + 1);
      put("shelf", x1 - 1, y1 - 1);
    } else if (F === "shrine") {
      put("altar", cxI, y0 + 1); put("offering", cxI, y0 + 3); put("lantern_f", x0 + 1, y0 + 1);
      put("lantern_f", x1 - 1, y0 + 1); put("rug", cxI, y1 - 2); put("shelf", x0 + 1, y1 - 1);
    } else if (F === "tea") {
      put("lowtable", cxI, y0 + 2); put("tatami", cxI - 1, y0 + 3); put("tatami", cxI + 1, y0 + 3);
      put("screen", x1 - 1, y0 + 1); put("kettle", x0 + 1, y0 + 1);
    } else if (F === "bath") {
      put("pool", cxI - 1, y0 + 2); put("pool", cxI + 1, y0 + 2); put("screen", x0 + 1, y0 + 1);
      put("stool", cxI, y0 + 4); put("towel", x1 - 1, y1 - 1);
    } else if (F === "dojo") {
      put("mat", cxI - 1, y0 + 2); put("mat", cxI, y0 + 2); put("rack", x0 + 1, y0 + 1);
      put("rack", x1 - 1, y0 + 1); put("drum", cxI, y0 + 1);
    } else if (F === "rune") {
      put("altar", cxI, y0 + 1); put("runecircle", cxI, y0 + 3); put("candle", cxI - 1, y0 + 1);
      put("candle", cxI + 1, y0 + 1); put("shelf", x0 + 1, y0 + 1); put("rug", cxI, y1 - 1);
    } else if (F === "stable") {
      // Beast lodge: hay + water + hitching posts around a central pen rug.
      // One nexus marker (runecircle-styled pen) anchors the store/retrieve UI.
      put("hay", x0 + 1, y0 + 1); put("hay", x1 - 1, y0 + 1);
      put("trough", cxI, y0 + 1); put("hitch", x0 + 1, y0 + 2); put("hitch", x1 - 1, y0 + 2);
      put("pen", cxI - 1, y0 + 3); put("pen", cxI + 1, y0 + 3);
      put("nexus", cxI, y1 - 1); put("rug", cxI, y0 + 2);
      put("crate", x0 + 1, y1 - 1); put("barrel", x1 - 1, y1 - 1);
    } else if (F === "beast_lodge") {
      // Beast Lodge: breeding lodge — two pens + a gene-cradle nexus.
      // breednexus anchors the breeding UI (E opens the Breed tab).
      put("hay", x0 + 1, y0 + 1); put("hay", x1 - 1, y0 + 1);
      put("trough", cxI, y0 + 1); put("hitch", x0 + 1, y0 + 2); put("hitch", x1 - 1, y0 + 2);
      put("pen", cxI - 2, y0 + 3); put("pen", cxI + 2, y0 + 3);
      put("breednexus", cxI, y0 + 3); put("rug", cxI, y1 - 2);
      put("breednexus", cxI, y1 - 1); put("rug", cxI, y0 + 2);
      put("crate", x0 + 1, y1 - 1); put("barrel", x1 - 1, y1 - 1);
    } else if (F === "souk") {
      // Grand bazaar stall rows: counters + crates + rugs, offering bowl at the heart.
      put("counter", cxI - 1, y0 + 2); put("counter", cxI + 1, y0 + 2);
      put("shelf", x0 + 1, y0 + 1); put("shelf", x1 - 1, y0 + 1);
      put("crate", x0 + 1, y1 - 1); put("crate", x1 - 1, y1 - 1);
      put("offering", cxI, y0 + 3); put("rug", cxI, y1 - 2);
      put("barrel", x0 + 2, y1 - 1);
    } else if (F === "yurt") {
      // Round-feel ger: central hearth, low table, bunks on the flanks, rug heart.
      put("hearth", cxI, y0 + 1); put("lowtable", cxI, y0 + 3);
      put("bed", x0 + 1, y0 + 1); put("bed", x1 - 1, y0 + 1);
      put("shelf", x0 + 1, y1 - 1); put("rug", cxI, y1 - 1);
      put("kettle", x1 - 1, y1 - 1);
    } else if (F === "palace") {
      // Palace audience suite: throne + long tables, candles, shelves, hearth.
      put("throne", cxI, y0 + 1); put("candle", cxI - 1, y0 + 1); put("candle", cxI + 1, y0 + 1);
      put("longtable", cxI - 1, y0 + 3); put("longtable", cxI + 1, y0 + 3);
      put("rug", cxI, y0 + 5); put("shelf", x0 + 1, y0 + 1); put("shelf", x1 - 1, y0 + 1);
      put("hearth", x0 + 1, y1 - 1); put("offering", x1 - 1, y1 - 1);
    } else if (F === "harbor") {
      // Harbor office / lighthouse watch: counter, crates, barrels, trough + rug.
      put("counter", cxI, y0 + 2); put("crate", x0 + 1, y0 + 1); put("barrel", x1 - 1, y0 + 1);
      put("shelf", x0 + 1, y1 - 1); put("trough", cxI + 1, y0 + 3);
      put("table", cxI - 1, y0 + 3); put("rug", cxI, y1 - 1);
      put("lantern_f", x1 - 1, y1 - 1);
    } else if (F === "keep") {
      // Castle keep great chamber: throne dais, war tables, racks, hearth, altar.
      put("throne", cxI, y0 + 1); put("hearth", cxI - 2, y0 + 1); put("hearth", cxI + 2, y0 + 1);
      put("longtable", cxI - 1, y0 + 3); put("longtable", cxI + 1, y0 + 3);
      put("rack", x0 + 1, y0 + 2); put("rack", x1 - 1, y0 + 2);
      put("altar", cxI, y1 - 2); put("rug", cxI, y0 + 5); put("shelf", x0 + 1, y1 - 1);
    } else if (F === "blackmarket") {
      // Black market: counter + crates + rug heart, offering bowl for deals.
      put("counter", cxI, y0 + 2); put("crate", x0 + 1, y0 + 1); put("crate", x1 - 1, y0 + 1);
      put("rug", cxI, y1 - 2); put("offering", cxI, y1 - 1); put("shelf", x0 + 1, y1 - 1);
      put("barrel", x1 - 1, y1 - 1);
    } else if (F === "arcane") {
      // Arcane circle: runecircle heart + altar + shelves + candles.
      put("runecircle", cxI, y0 + 3); put("altar", cxI, y0 + 1);
      put("candle", cxI - 1, y0 + 1); put("candle", cxI + 1, y0 + 1);
      put("shelf", x0 + 1, y0 + 1); put("shelf", x1 - 1, y0 + 1); put("rug", cxI, y1 - 1);
    } else if (F === "library") {
      // Library/bookstore: shelf stacks + tables + rug reading room.
      put("shelf", x0 + 1, y0 + 1); put("shelf", x1 - 1, y0 + 1); put("shelf", x0 + 1, y0 + 2);
      put("table", cxI, y0 + 3); put("rug", cxI, y1 - 2); put("candle", cxI, y0 + 1);
      put("chair", cxI + 1, y0 + 3);
    }
    void rng;
    const isHall = (clsKey === "great_hall" || clsKey === "castle_keep" || clsKey === "grand_castle");
    return {
      id: `b_${s.cx}_${s.cy}_${x0}_${y0}`, classKey: clsKey, title: cls.name, isHall,
      x0, y0, x1, y1, w, h, notches, wall: wallTile, floor: floorTile, style,
      doors, windows, furniture, settlement: { cx: s.cx, cy: s.cy, type: s.type },
    };
  }

  // The Stable is functional (store/retrieve/ride), not decoration: if the
  // normal scatter fails to fit it, force it in — first with many more
 // wide-band rolls, then with a full grid scan. Full 7x5 lodge first, then
 // a compact 6x5 paddock: dense towns can have no 7x5 hole at all (verified
 // live — Throneshire fits zero). Same classKey, notch rules and
 // furnishings either way, so tiles, nexus, backfill and art just work.
 // Only the stable gets this guarantee, so existing hearth layouts never
 // shift when it already fit.
  // ---- door-front reachability (Nov 2026): every door must open onto
  // walkable ground, not water/lava/wall and not into another walled shape.
  // Water/lava fronts get plank/stone crossings at bake/repair time, but
  // placement avoids them outright so new hearths never need the patch.
  function doorFrontPos(b, d) {
    if (d.y === b.y1) return { x: d.x, y: d.y + 1 };
    if (d.y === b.y0) return { x: d.x, y: d.y - 1 };
    if (d.x === b.x1) return { x: d.x + 1, y: d.y };
    return { x: d.x - 1, y: d.y };
  }
  function frontBlockedByBuildings(out, gx, gy) {
    for (const b2 of out) {
      if (!b2) continue;
      if (gx >= b2.x0 && gx <= b2.x1 && gy >= b2.y0 && gy <= b2.y1) {
        try { if (inShape(b2, gx - b2.x0, gy - b2.y0)) return true; } catch (e) { return true; }
      }
    }
    return false;
  }
  // A new neighbour must not seal an earlier building's doors: re-check
  // every already-placed building against the list with the candidate
  // added. Without this, placement order can seal a door — e.g. a stable
  // baked over a townhouse's door step (verified live: city townhouse
  // unreachable with its front inside the later stable's walls).
  function neighboursKeepDoorsOpen(s, out, candB) {
    try {
      const out2 = out.concat([candB]);
      for (const eb of out) {
        if (!eb) continue;
        if (!candidateDoorsReachable(s, out2, eb)) return false;
      }
    } catch (e) { return false; }
    return true;
  }
  function frontBlockedByBase(s, gx, gy) {
    try {
      const W = window.World;
      if (W && W.baseSolidAt) return !!W.baseSolidAt(s, gx, gy);
    } catch (e) { }
    // fallback when World is unavailable (unit tests): mirror the band rules.
    try {
      const dx = gx - s.cx, dy = gy - s.cy, d = Math.hypot(dx, dy), R = s.radius || 20;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      const diag = Math.abs(adx - ady) <= 1;
      const gate = (adx <= 1 || ady <= 1 || diag);
      if (s.type === "city") { if (d <= R && d >= R - 1) return !gate; return false; }
      if (s.type === "watergate") {
        if (d > R + 2) return false;
        if (d > R - 1) return !gate;
        if (d >= R - 3) return !gate;
        const inV = dx >= 5 && dx <= 6 && dy > -R + 4 && dy < R - 4;
        const inH = dy >= -6 && dy <= -5 && dx > -R + 4 && dx < R - 4;
        if (inV || inH) {
          if (adx <= 1 || ady <= 1) return false;
          if (inV && (Math.abs(dy - 8) <= 1 || Math.abs(dy + 12) <= 1)) return false;
          if (inH && (Math.abs(dx - 8) <= 1 || Math.abs(dx + 12) <= 1)) return false;
          return true;
        }
        return false;
      }
      if (s.type === "sakura") {
        const pdx = dx - 9, pdy = dy - 7;
        if ((pdx * pdx) / 9 + (pdy * pdy) / 6 <= 1) return !(pdy === 0 && pdx >= -3 && pdx <= 3);
        return false;
      }
      if (s.type === "fortress") {
        if (d > R) return false;
        if (d > R - 2) return !gate;
        if (d >= R - 4) {
          if (gate) return false;
          try { if (window.World && window.World.hash2 && window.World.hash2(gx, gy) > 0.90) return false; } catch (e2) { }
          return true;
        }
        return false;
      }
      if (s.type === "trade_city") { if (d <= R && d >= R - 1) return !gate; return false; }
      if (s.type === "frost_hold") {
        if (d <= R && d >= R - 1) return !gate;
        const pdx = dx + 7, pdy = dy + 5;
        if ((pdx * pdx) / 9 + (pdy * pdy) / 6 <= 1) return !(pdy === 0 && pdx >= -3 && pdx <= 3);
        return false;
      }
      if (s.type === "desert_souk") {
        const odx = dx + 7, ody = dy + 5;
        if ((odx * odx) / 9 + (ody * ody) / 6 <= 1) return !(ody === 0 && odx >= -3 && odx <= 3);
        return false;
      }
      if (s.type === "port_city") {
        if (d <= R && d >= R - 1) return !gate;
        const brx = R * 0.38, bry = R * 0.19;
        const hdx = dx, hdy = dy - (R - bry - 4);
        if ((hdx * hdx) / (brx * brx) + (hdy * hdy) / (bry * bry) <= 1) {
          if ((((dx % 14) + 14) % 14) <= 1 || adx <= 1 || ady <= 1) return false;
          return true;
        }
        return false;
      }
      if (s.type === "capital") {
        if (d <= R && d >= R - 1) return !gate;
        const cit = R * 0.38;
        if (d >= cit - 1 && d <= cit + 1) return !gate;
        return false;
      }
      return false;
    } catch (e) { return false; }
  }
  function candidateDoorsReachable(s, out, candB) {
    try {
      for (const dd of (candB.doors || [])) {
        const f = doorFrontPos(candB, dd);
        if (frontBlockedByBuildings(out, f.x, f.y)) return false;
        if (frontBlockedByBase(s, f.x, f.y)) return false;
      // pocket check: the front step needs at least one walkable approach
      // from the outside (not back through its own door). Otherwise a ring
      // of sakura/trees can seal the step even after the step itself is
      // cleared to PATH at bake time (verified live: shrine steps boxed in
      // by T-tiles on all three outer sides).
      // Grove (tree/pine/sakura) approaches count: bake/backfill clears the
      // step itself plus one grove approach to PATH, so a tree ring never
      // seals a new placement. Base solids (water/lava/wall) and walled
      // shapes still reject — those need bridges/gates, not a clearing.
        try {
          const W = window.World;
          const T = (window.CFG && window.CFG.T) || null;
          const SOLID = (window.CFG && window.CFG.SOLID) || null;
          if (W && T && SOLID && W.settleTile) {
            let approach = false;
            for (const [nx, ny] of [[f.x + 1, f.y], [f.x - 1, f.y], [f.x, f.y + 1], [f.x, f.y - 1]]) {
              if (nx === dd.x && ny === dd.y) continue; // the door itself doesn't count
              if (frontBlockedByBuildings(out, nx, ny)) continue;
              if (frontBlockedByBase(s, nx, ny)) continue;
              let tt = null;
              try { tt = W.settleTile(nx, ny, s); } catch (e) { tt = null; }
              if (tt == null) { approach = true; break; } // wild grass outside the bands
              if (tt === T.TREE || tt === T.PINE || tt === T.SAKURA) { approach = true; break; } // grove: bake/backfill clears one to a step
              if (SOLID.has(tt)) continue;
              // inside another building's walls/floor still needs that building's door
              try {
                let insideWalled = false;
                for (const b2 of out) {
                  if (!b2) continue;
                  if (nx >= b2.x0 && nx <= b2.x1 && ny >= b2.y0 && ny <= b2.y1) {
                    try { if (inShape(b2, nx - b2.x0, ny - b2.y0)) { insideWalled = true; break; } } catch (e2) { insideWalled = true; break; }
                  }
                }
                if (insideWalled) continue;
              } catch (e) { continue; }
              approach = true;
              break;
            }
            if (!approach) return false;
          }
        } catch (e) { return false; }
      }
    } catch (e) { return false; }
    return true;
  }
  function ensureStablePlaced(s, out, rng) {
    try {
      // war camps keep no lodge — beasts penned here are not for riding
      if (s && window.World && window.World.BASE_DEF && window.World.BASE_DEF[s.type]) return;
      if (out.some(b => b && b.classKey === "stable")) return;
      // cross-settlement neighbours for the footprint guard below
      const neighS = overlappingNeighbours(s);
      const cls = CLASSES.stable;
      if (!cls) return;
      const sizes7 = [{ w: cls.w, h: cls.h }, { w: 6, h: 5 }];
      // phase 0: strict (roads/plaza excluded, like every other building).
      // phase 1: relaxed — the lodge may sit on roads/plaza, door opening onto
      // them (small hearths whose road cross eats every strict hole still get
      // their lodge; rings/moats/canals/ponds, overlaps, ownership and both
      // door checks stay enforced, so nothing is stamped over), with a compact
      // 5x4 paddock as the last resort (verified live: a packed radius-12
      // village fits zero 6x5 holes but has room for 5x4).
      for (let phase = 0; phase < 2; phase++) {
      const relaxed = phase === 1;
      const sizes = relaxed ? sizes7.concat([{ w: 5, h: 4 }]) : sizes7;
      for (const sz of sizes) {
        if (!(sz.w >= 3 && sz.h >= 3)) continue;
      const fits = (x0, y0, gap) => {
        const x1 = x0 + sz.w - 1, y1 = y0 + sz.h - 1;
        const bcx = x0 + sz.w / 2 - 0.5, bcy = y0 + sz.h / 2 - 0.5;
        for (const [gx, gy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [Math.round(bcx), Math.round(bcy)]]) {
          if (Math.hypot(gx - s.cx, gy - s.cy) > s.radius - 2.0) return false;
          if (inExclusion(s.type, gx, gy, s, relaxed)) return false;
        }
        for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
          if (inExclusion(s.type, gx, gy, s, relaxed)) return false;
        }
        const rect = { x0, y0, x1, y1 };
        for (const b of out) if (rectsOverlap(rect, b, gap)) return false;
        return true;
      };
      for (let a = 0; a < 2000; a++) {
        const ang = rng() * Math.PI * 2;
        const dist = s.radius * 0.3 + rng() * s.radius * 0.5;
        const bcx = Math.round(s.cx + Math.cos(ang) * dist);
        const bcy = Math.round(s.cy + Math.sin(ang) * dist);
        const x0 = bcx - (sz.w >> 1), y0 = bcy - (sz.h >> 1);
        // strict 1-tile ring like every other building: no touching, ever.
        // Packed hamlets may lose the stable if no ringed hole fits — the
        // door checks still reject sealed placements either way.
        if (fits(x0, y0, 1)) {
          const cand = designBuilding(s, "stable", x0, y0, rng, sz);
          if (!footprintWins(s, cand, neighS)) continue;
          if (!candidateDoorsReachable(s, out, cand)) continue;
          if (!neighboursKeepDoorsOpen(s, out, cand)) continue;
          out.push(cand);
          return;
        }
      }
      const R = (s.radius || 20);
      const cx = s.cx, cy = s.cy;
      for (let y0 = cy - R; y0 <= cy + R; y0++) for (let x0 = cx - R; x0 <= cx + R; x0++) {
        if (fits(x0, y0, 1)) {
          const cand2 = designBuilding(s, "stable", x0, y0, rng, sz);
          if (!footprintWins(s, cand2, neighS)) continue;
          if (!candidateDoorsReachable(s, out, cand2)) continue;
          if (!neighboursKeepDoorsOpen(s, out, cand2)) continue;
          out.push(cand2);
          return;
        }
      }
    } // next size
      } // next phase (strict, then road-relaxed)
    } catch (e) { }
  }
  // classKey of the breeding lodge, now ("beast_lodge") or legacy ("bestiary"
  // from older-baked chunks) — old lodges keep working without a rebake.
  function isBeastLodgeKey(ck) { return ck === "beast_lodge" || ck === "bestiary"; }
  function beastLodgeWanted(s) {
    try {
      if (!s || !s.type) return true;
      if (window.World && window.World.BASE_DEF && window.World.BASE_DEF[s.type]) return false;
      // small hamlets (r<=13) only sometimes keep a beast lodge; towns and
      // metros always do. Deterministic per settlement so it never flickers.
      const R = s.radius | 0 || 20;
      if (R >= 20) return true;
      let h = 2166136261;
      const str = String(s.type) + ":" + s.cx + "," + s.cy;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return ((h >>> 0) % 100) < 50;
    } catch (e) { return true; }
  }
  function ensureBeastLodgePlaced(s, out, rng) {
    try {
      if (s && window.World && window.World.BASE_DEF && window.World.BASE_DEF[s.type]) return;
      if (out.some(b => b && isBeastLodgeKey(b.classKey))) return;
      if (!beastLodgeWanted(s)) return;
      const neighS = overlappingNeighbours(s);
      const cls = CLASSES.beast_lodge;
      if (!cls) return;
      const sizes0 = [{ w: cls.w, h: cls.h }, { w: 7, h: 5 }, { w: 6, h: 5 }];
      for (let phase = 0; phase < 2; phase++) {
        const relaxed = phase === 1;
        const sizes = relaxed ? sizes0.concat([{ w: 5, h: 4 }]) : sizes0;
        for (const sz of sizes) {
          if (!(sz.w >= 3 && sz.h >= 3)) continue;
          const fits = (x0, y0, gap) => {
            const x1 = x0 + sz.w - 1, y1 = y0 + sz.h - 1;
            const bcx = x0 + sz.w / 2 - 0.5, bcy = y0 + sz.h / 2 - 0.5;
            for (const [gx, gy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [Math.round(bcx), Math.round(bcy)]]) {
              if (Math.hypot(gx - s.cx, gy - s.cy) > s.radius - 2.0) return false;
              if (inExclusion(s.type, gx, gy, s, relaxed)) return false;
            }
            for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
              if (inExclusion(s.type, gx, gy, s, relaxed)) return false;
            }
            const rect = { x0, y0, x1, y1 };
            for (const b of out) if (rectsOverlap(rect, b, gap)) return false;
            return true;
          };
          for (let a = 0; a < 2000; a++) {
            const ang = rng() * Math.PI * 2;
            const dist = s.radius * 0.3 + rng() * s.radius * 0.5;
            const bcx = Math.round(s.cx + Math.cos(ang) * dist);
            const bcy = Math.round(s.cy + Math.sin(ang) * dist);
            const x0 = bcx - (sz.w >> 1), y0 = bcy - (sz.h >> 1);
            // strict 1-tile ring like every other building — the lodge is
            // placed only where the full perimeter fits (door checks apply).
            if (fits(x0, y0, 1)) {
              const cand = designBuilding(s, "beast_lodge", x0, y0, rng, sz);
              if (!footprintWins(s, cand, neighS)) continue;
              if (!candidateDoorsReachable(s, out, cand)) continue;
              if (!neighboursKeepDoorsOpen(s, out, cand)) continue;
              out.push(cand);
              return;
            }
          }
          const R = (s.radius || 20);
          const cx = s.cx, cy = s.cy;
          for (let y0 = cy - R; y0 <= cy + R; y0++) for (let x0 = cx - R; x0 <= cx + R; x0++) {
            if (fits(x0, y0, 1)) {
              const cand2 = designBuilding(s, "beast_lodge", x0, y0, rng, sz);
              if (!footprintWins(s, cand2, neighS)) continue;
              if (!candidateDoorsReachable(s, out, cand2)) continue;
              if (!neighboursKeepDoorsOpen(s, out, cand2)) continue;
              out.push(cand2);
              return;
            }
          }
        }
      }
    } catch (e) { }
  }
  function settlementBuildings(s) {
    const key = `${s.type}:${s.cx},${s.cy}`;
    const hit = cacheGet(key);
    if (hit) return hit;
    // re-entrancy guard: candidateDoorsReachable calls W.settleTile for
    // approach checks, which calls buildingTileAt->settlementBuildings for
    // this very key. Without this, placement recurses forever and freezes
    // the page. While building, return the partial list (placement checks
    // only need already-placed neighbours via `out`, and base ground via
    // settleTile with buildings skipped — see buildingTileAt's guard).
    if (_buildingInProgress.has(key)) return [];
    _buildingInProgress.add(key);
    try {
    const rng = rngFor(s.cx, s.cy, s.type);
    const order = LAYOUTS[s.type] || LAYOUTS.town;
    const out = [];
    // cross-settlement neighbours (usually none — then the check below is
    // a free pass and layouts are byte-identical to before).
    const neigh = overlappingNeighbours(s);
    // fortress keeps its great hall dead-center (old behavior, now furnished)
    if (s.type === "fortress") {
      const cls = CLASSES.great_hall;
      const x0 = s.cx - 5, y0 = s.cy - 3;
      out.push(designBuilding(s, "great_hall", x0, y0, rng));
      void cls;
    }
    // capital keeps its castle keep dead-center (structural, never collapses like great hall)
    if (s.type === "capital") {
      // v12: huge village-sized Grand Castle at the heart (throne room + garden plot).
      const cls = CLASSES.grand_castle;
      const x0 = s.cx - (cls.w >> 1), y0 = s.cy - (cls.h >> 1);
      out.push(designBuilding(s, "grand_castle", x0, y0, rng));
    }
    for (let i = 0; i < order.length; i++) {
      const ck = order[i];
      if (s.type === "fortress" && ck === "great_hall") continue; // already placed
      if (s.type === "capital" && (ck === "castle_keep" || ck === "grand_castle")) continue; // already placed dead-center
      // Tier enforcement: castles only rise in the capital; city-important
      // services (shops/guilds/civic/grand holy/guards) only in MID+LARGE.
      // Hamlets keep homes + small holy + inns/stables even if a layout drifts.
      if (CASTLE_ONLY_KEYS[ck] && s.type !== "capital") continue;
      if (SMALL_HAMLET_TYPES[s.type] && CITY_IMPORTANT_KEYS[ck]) continue;
      const cls = CLASSES[ck];
      if (!cls) continue;
      let placed = null;
      // big towns/metros hold dozens of buildings: cap the per-building
      // attempts so a full capital still places in well under a second.
      // (Bumped for the 1-tile spare ring below — tighter packing needs
      // more rolls, still under a second per settlement; results cache.)
      const maxA = out.length > 80 ? 500 : out.length > 30 ? 800 : 1500;
      for (let a = 0; a < maxA; a++) {
        const ang = rng() * Math.PI * 2;
        const dist = s.radius * (0.12 + rng() * 0.78);
        const bcx = Math.round(s.cx + Math.cos(ang) * dist);
        const bcy = Math.round(s.cy + Math.sin(ang) * dist);
        const x0 = bcx - (cls.w >> 1), y0 = bcy - (cls.h >> 1);
        const x1 = x0 + cls.w - 1, y1 = y0 + cls.h - 1;
       // inside settlement?
       let ok = true;
       for (const [gx, gy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [bcx, bcy]]) {
          if (Math.hypot(gx - s.cx, gy - s.cy) > s.radius - 2.0) { ok = false; break; }
          if (inExclusion(s.type, gx, gy, s)) { ok = false; break; }
        }
        if (!ok) continue;
        // no road/special tile inside footprint at all
        for (let gy = y0; gy <= y1 && ok; gy++) for (let gx = x0; gx <= x1; gx++) {
          if (inExclusion(s.type, gx, gy, s)) { ok = false; break; }
        }
        if (!ok) continue;
        const rect = { x0, y0, x1, y1 };
        // Free spare ring: every building keeps a full 1-tile gap to every
        // neighbour, so walls never touch and door fronts always open onto
        // open ground (never into an adjacent wall). Door-front + pocket
        // checks below still reject the exact sealed cases on top of this.
        for (const b of out) if (rectsOverlap(rect, b, 1)) { ok = false; break; }
        if (!ok) continue;
        placed = designBuilding(s, ck, x0, y0, rng);
        // cross-settlement guard: the whole footprint plus every door
        // front must be owned by s, else this lodge would bake as the
        // neighbour's ground and stamp walls through standing interiors.
        if (!footprintWins(s, placed, neigh)) continue;
        // every door must open onto walkable base ground, not water/lava/wall
        // and not into another walled shape — otherwise the lodge/shop is
        // sealed on arrival (the watergate canal trap). Also the newcomer
        // must not seal an earlier building's doors (order trap).
        if (!candidateDoorsReachable(s, out, placed)) continue;
        if (!neighboursKeepDoorsOpen(s, out, placed)) continue;
        out.push(placed);
        break;
      }
    void placed;
    }
    ensureStablePlaced(s, out, rng);
    ensureBeastLodgePlaced(s, out, rng);
    cacheSet(key, out);
    return out;
    } finally {
      _buildingInProgress.delete(key);
    }
  }

  // Origin hearth (v11): a typed settlement like any other — the kind is
  // stored on the player, so this is stable within a world. Every
  // origin-area query goes through originBuildings(), which is just the
  // normal layout for the origin settlement. No special spawn town, no
  // legacy grid — those retired with pre-v11 worlds.
  function originSettlement() {
    try {
      const W = window.World;
      if (W && W.originSettlement) return W.originSettlement();
      const info = W && W.spawnInfo ? W.spawnInfo() : null;
      const t = info && info.type;
      if (t && W && W.SETTLE_DEF && W.SETTLE_DEF[t]) {
        return { cx: 0, cy: 0, radius: W.SETTLE_DEF[t].radius, type: t };
      }
    } catch (e) { }
    return { cx: 0, cy: 0, radius: 34, type: "town" };
  }
  function originBuildings() {
    return settlementBuildings(originSettlement());
  }
  // Canonical per-settlement layout. The origin hearth resolves through
  // originBuildings() above; every other settlement — and every enemy
  // holding, which builds like a settlement with its own classes — goes
  // straight to settlementBuildings(). One path, no fallbacks.
  function buildingsFor(s) {
    try {
      if (!s) return [];
      if (s.cx === 0 && s.cy === 0) return originBuildings();
      return settlementBuildings(s);
    } catch (e) { return []; }
  }

  // Script-friendly overlap audit: checks every building rect (origin +
  // all settlements on a bounded region scan) for rect-vs-rect overlaps
  // AND for the mandatory 1-tile spare ring (gap 1 — no touching, ever),
  // and bounds-audits every SHAPE (all shape/door/window/
  // furniture tiles must sit inside the plot rect; doors on outer edges;
  // every building keeps >=1 interior tile). Returns
  // {ok, checked, pairs, shapeIssues}. Ring violations here mean two
  // buildings touch or share an edge on screen — there should be none.
  function validateOverlaps() {
    const pairs = [];
    let checked = 0;
    const pairDesc = (a, b) => 'new:' + a.classKey + '@' + a.x0 + ',' + a.y0 + ' ' + a.w + 'x' + a.h + ' <> new:' + b.classKey + '@' + b.x0 + ',' + b.y0 + ' ' + b.w + 'x' + b.h;
    try {
      const sp = originBuildings();
      for (let i = 0; i < sp.length; i++) for (let j = i + 1; j < sp.length; j++) {
        checked++;
        if (rectsOverlap(sp[i], sp[j], 1)) pairs.push(["origin", pairDesc(sp[i], sp[j])]);
      }
    } catch (e) { }
    try {
      const W = window.World;
      const found = {};
      for (let rx = -8; rx <= 8; rx++) for (let ry = -8; ry <= 8; ry++) {
        let s = null;
        try { s = W.regionSettlement(rx, ry); } catch (e) { }
        if (s && !found[s.type]) found[s.type] = s;
      }
      for (const t of Object.keys(found)) {
        const s = found[t];
        let list = [];
        try { list = settlementBuildings(s); } catch (e) { list = []; }
        for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
          checked++;
          if (rectsOverlap(list[i], list[j], 1)) pairs.push([t, pairDesc(list[i], list[j])]);
        }
      }
    } catch (e) { }
    // Shape bounds audit: shapes must never leave their plot rect.
    const shapeIssues = [];
    const auditShapes = (list, where) => {
      for (const b of list) {
        checked++;
        if (!b.notches || !b.notches.length) {
          if (b.classKey && SHAPES[b.classKey]) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} missing notches`);
          continue;
        }
        for (const n of b.notches) {
          checked++;
          if (n.lx0 < 0 || n.ly0 < 0 || n.lx1 >= b.w || n.ly1 >= b.h || n.lx0 > n.lx1 || n.ly0 > n.ly1) {
            shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} notch out of bounds`);
          }
        }
        let interior = 0, walls = 0;
        for (let ly = 0; ly < b.h; ly++) for (let lx = 0; lx < b.w; lx++) {
          if (!inShape(b, lx, ly)) continue;
          if (isShapeEdge(b, b.x0 + lx, b.y0 + ly)) walls++;
          else interior++;
        }
        checked++;
        if (!interior) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} has no interior tiles`);
        if (!walls) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} has no wall tiles`);
        for (const d of (b.doors || [])) {
          checked++;
          const lx = d.x - b.x0, ly = d.y - b.y0;
          if (!inShape(b, lx, ly)) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} door outside shape`);
          else if (!isShapeEdge(b, d.x, d.y)) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} door not on wall`);
          else if (d.x !== b.x0 && d.x !== b.x1 && d.y !== b.y0 && d.y !== b.y1) {
            shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} door inset from plot edge (gate could not align)`);
          }
        }
        for (const w2 of (b.windows || [])) {
          checked++;
          if (!inShape(b, w2.x - b.x0, w2.y - b.y0)) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} window outside shape`);
        }
        const furn = (b.furniture || []);
        for (const f of furn) {
          checked++;
          const lx = f.x - b.x0, ly = f.y - b.y0;
          if (!inShape(b, lx, ly) || isShapeEdge(b, f.x, f.y)) shapeIssues.push(`${where}:${b.classKey}@${b.x0},${b.y0} furniture ${f.kind} outside interior`);
        }
      }
    };
    try { auditShapes(originBuildings(), originSettlement().type); } catch (e) { }
    try {
      const W2 = window.World;
      const seen = {};
      for (let rx = -8; rx <= 8; rx++) for (let ry = -8; ry <= 8; ry++) {
        let s = null;
        try { s = W2.regionSettlement(rx, ry); } catch (e) { }
        if (s && !seen[s.type]) { seen[s.type] = true; try { auditShapes(settlementBuildings(s), s.type); } catch (e2) { } }
      }
    } catch (e) { }
    return { ok: pairs.length === 0 && shapeIssues.length === 0, checked, pairs, shapeIssues };
  }

  function buildingsAt(gx, gy) {
    // new-layout buildings first (origin hearth + settlements). Shape-aware: lawn
    // cutouts inside a plot rect are garden, not building - only shape tiles
    // claim the tile.
    try {
      const W = window.World;
      // surface-only: hell's 0,0 is void, never the origin town.
      if (isSurfDim() && Math.abs(gx) < 26 && Math.abs(gy) < 26) {
        for (const b of originBuildings()) {
          if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1 && inShape(b, gx - b.x0, gy - b.y0)) return b;
        }
      }
    } catch (e) { }
    try {
      const W = window.World;
      const s = W.settlementAt(gx, gy);
      if (s) {
        for (const b of settlementBuildings(s)) {
          if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1 && inShape(b, gx - b.x0, gy - b.y0)) return b;
        }
      }
    } catch (e) { }
    // enemy holdings build like settlements (own war-hut classes/layouts)
    try {
      const W = window.World;
      if (W && W.baseAt) {
        const eb = W.baseAt(gx, gy);
        if (eb) {
          for (const b of settlementBuildings({ cx: eb.cx, cy: eb.cy, radius: eb.radius, type: eb.type })) {
            if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1 && inShape(b, gx - b.x0, gy - b.y0)) return b;
          }
        }
      }
    } catch (e) { }
    return null;
  }

  function buildingsInView(gx0, gx1, gy0, gy1) {
    const out = [];
    const seen = new Set();
    const push = (b) => { if (b && !seen.has(b.id)) { seen.add(b.id); out.push(b); } };
    // sample-based: check settlement centers near the view, then their buildings
    try {
      const sCells = new Set();
      for (let gy = gy0 - 24; gy <= gy1 + 24; gy += 8) for (let gx = gx0 - 24; gx <= gx1 + 24; gx += 8) {
        let s = null;
        try { s = window.World.settlementAt(gx, gy); } catch (e) { }
        if (s) {
          const k = s.cx + "," + s.cy;
          if (!sCells.has(k)) {
            sCells.add(k);
            for (const b of settlementBuildings(s)) {
              if (b.x1 >= gx0 - 2 && b.x0 <= gx1 + 2 && b.y1 >= gy0 - 2 && b.y0 <= gy1 + 2) push(b);
            }
          }
        }
      }
    } catch (e) { }
    // enemy holdings: same sampling, so war-hut facades/X-ray work too
    try {
      const bCells = new Set();
      for (let gy = gy0 - 24; gy <= gy1 + 24; gy += 8) for (let gx = gx0 - 24; gx <= gx1 + 24; gx += 8) {
        let eb = null;
        try { eb = window.World.baseAt(gx, gy); } catch (e) { }
        if (eb) {
          const k = eb.cx + "," + eb.cy;
          if (!bCells.has(k)) {
            bCells.add(k);
            for (const b of settlementBuildings({ cx: eb.cx, cy: eb.cy, radius: eb.radius, type: eb.type })) {
              if (b.x1 >= gx0 - 2 && b.x0 <= gx1 + 2 && b.y1 >= gy0 - 2 && b.y0 <= gy1 + 2) push(b);
            }
          }
        }
      }
    } catch (e) { }
    try {
      // surface-only: hell's 0,0 is void, never the origin town.
      if (isSurfDim() && gx0 < 26 && gx1 > -26 && gy0 < 26 && gy1 > -26) {
        for (const b of originBuildings()) {
          if (b.x1 >= gx0 - 2 && b.x0 <= gx1 + 2 && b.y1 >= gy0 - 2 && b.y0 <= gy1 + 2) push(b);
        }
      }
    } catch (e) { }
    return out;
  }

  function isWallId(t) {
    try {
      const T = window.CFG.T;
      return t === T.HOUSEWALL || t === T.ROOF || t === T.STONEWALL || t === T.WINDOW;
    } catch (e) { return false; }
  }
  function maxHPFor(tile, isDungeon, isWindow) {
    if (isDungeon) return DUNGEON_HP;
    if (isWindow) return WINDOW_HP;
    try {
      const T = window.CFG.T;
      if (tile === T.WINDOW) return WINDOW_HP;
      if (tile === T.LANTERN) return LANTERN_HP;
      if (tile === T.ROOF || tile === T.HOUSEWALL || tile === T.STONEWALL) return WALL_HP;
    } catch (e) { }
    return WALL_HP;
  }
  function isRingWall(gx, gy) {
    // city/fortress rings: breakable but never collapse a building
    try {
      const W = window.World;
      const s = W.settlementAt(gx, gy);
      if (!s) return false;
      const d = Math.hypot(gx - s.cx, gy - s.cy);
      if (s.type === "city" && d >= s.radius - 1.6) return true;
      if (s.type === "fortress" && d >= s.radius - 4.6 && d <= s.radius - 1.4) return true;
      if (s.type === "watergate" && d >= s.radius - 3.6 && d <= s.radius - 0.6) return true;
    } catch (e) { }
    return false;
  }
  // enemy-holding fortification ring (gates are PATH, never walls): siege
  // works at ENEMY_WALL_HP, and never collapses a building (the ring band
  // holds no building tiles by construction — see inExclusion).
  // Thickness comes from the fort table, so new holding types just work.
  function isEnemyBaseWall(gx, gy) {
    try {
      const W = window.World;
      if (!W || !W.baseAt) return false;
      const b = W.baseAt(gx, gy);
      if (!b) return false;
      const d = Math.hypot(gx - b.cx, gy - b.cy);
      const R = b.radius;
      const thick = (W.BASE_DEF && W.BASE_DEF[b.type] && W.BASE_DEF[b.type].thick) || 1;
      return d >= R - thick && d <= R;
    } catch (e) { return false; }
  }

  function tileIsWindowOf(b, gx, gy, tile) {
    if (!b) return false;
    try {
      const T = window.CFG.T;
      if (tile === T.WINDOW) return true;
      return (b.windows || []).some(w => w.x === gx && w.y === gy);
    } catch (e) { return false; }
  }

  // Break/lookup helpers shared by overworld + dungeon paths.
  // Missing walls (stale-baked grass where a wall should be) are NOT
  // collapse: only real destruction (RUBBLE on the edge) collapses.
  // Stale chunks stay standing so the exterior can draw a broken fence
  // over the gap instead of hiding the whole building.
  function buildingCollapsed(b) {
    if (!b || b.isHall) return false; // fortress hall is structural
    try {
      const G = window.Game;
      if (!G || !G.tileAtGx) return false;
      const T = window.CFG.T;
      let sawRubble = false;
      for (let gy = b.y0; gy <= b.y1; gy++) for (let gx = b.x0; gx <= b.x1; gx++) {
        // Shape-aware: only walled shape-edge tiles count. Lawn cutouts are
        // garden, not walls; interior floors never counted.
        if (!inShape(b, gx - b.x0, gy - b.y0)) continue;
        if (!isShapeEdge(b, gx, gy)) continue;
        const isDoor = (b.doors || []).some(d => d.x === gx && d.y === gy);
        if (isDoor) continue;
        // Unloaded chunk = unknown, NOT destroyed. tileAtGx reports GRASS for
        // missing chunks, which used to read as "wall gone" — buildings near
        // the edge of the streamed area flickered between roofed/collapsed.
        try { if (G.chunkAt && !G.chunkAt(gx, gy)) return false; } catch (e) { return false; }
        let t = -1;
        try { t = window.Game.tileAtGx(gx, gy); } catch (e) { t = -1; }
        if (t === T.HOUSEWALL || t === T.STONEWALL || t === T.ROOF || t === T.WINDOW || t === T.DOOR) return false;
        if (t === T.RUBBLE) sawRubble = true;
      }
      return sawRubble;
    } catch (e) { return false; }
  }

  function playerBuilding() {
    try {
      const G = window.Game;
      const p = G && (G.player || (G.G && G.G.player));
      if (!p || p.inDungeon) return null;
      const gx = Math.floor(p.x), gy = Math.floor(p.y);
      const b = buildingRectAt(gx, gy);
      if (!b || buildingCollapsed(b)) return null;
      // The estate mask covers the WHOLE plot rect, so rect containment is
      // the test — not shape edges. L/T/U/Z rooms wrap around lawn cutouts,
      // and an interior floor tile next to a cutout is still interior (the
      // old edge test called it "outside", so the roof stayed on while you
      // stood in the room). Door, floor, lawn, rubble breaches and townstone
      // are all inside; only an intact wall/window tile reads as
      // outside (solid — you can't stand on one; smashed = rubble = inside).
      let t = -1;
      try { t = window.Game.tileAtGx(gx, gy); } catch (e) { t = -1; }
      if (isWallId(t)) return null;
      return b;
    } catch (e) { return null; }
  }
  // Rect-containment twin of buildingsAt: the estate drawing covers the
  // whole plot rect (lawn cutouts included), so X-ray uses the rect.
  // Shape-precision stays in buildingsAt for damage/audit paths.
  function buildingRectAt(gx, gy) {
    try {
      // surface-only: hell's 0,0 is void, never the origin town.
      if (isSurfDim() && Math.abs(gx) < 26 && Math.abs(gy) < 26) {
        for (const b of originBuildings()) {
          if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1) return b;
        }
      }
    } catch (e) { }
    try {
      const W = window.World;
      const s = W.settlementAt(gx, gy);
      if (s) {
        for (const b of settlementBuildings(s)) {
          if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1) return b;
        }
      }
      // enemy holdings (rect containment for the X-ray estate mask)
      if (W && W.baseAt) {
        const eb = W.baseAt(gx, gy);
        if (eb) {
          for (const b of settlementBuildings({ cx: eb.cx, cy: eb.cy, radius: eb.radius, type: eb.type })) {
            if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1) return b;
          }
        }
      }
    } catch (e) { }
    return null;
  }

  // ---------- wall damage (overworld) ----------
  // Returns {broke, collapsed, hpLeft, building} — tile maps + persistence
  // handled by the caller via callbacks so this stays testable headless.
  // On collapse the WHOLE footprint (walls, doors, floors) is ground to
  // RUBBLE and saved chunk by chunk, so the exterior mask (which refuses
  // collapsed buildings) lifts forever and only the collapsed rubble
  // interior is ever shown again. A building may span chunks, hence the
  // per-chunk collect-then-save.
  function collapseBuildingToRubble(b) {
    try {
      const GM = window.Game, W = window.World, T = window.CFG.T;
      if (!GM || !W || !b) return;
      const touched = new Map();
      const brokeTiles = [];
      for (let gy = b.y0; gy <= b.y1; gy++) for (let gx = b.x0; gx <= b.x1; gx++) {
        if (!inShape(b, gx - b.x0, gy - b.y0)) continue; // lawn stays lawn
        let ch = null;
        try { ch = GM.chunkAt ? GM.chunkAt(gx, gy) : null; } catch (e) { ch = null; }
        if (!ch || !ch.tiles) continue;
        const lx = gx - ch.cx * 16, ly = gy - ch.cy * 16;
        if (lx < 0 || ly < 0 || lx > 15 || ly > 15) continue;
        ch.tiles[ly * 16 + lx] = T.RUBBLE;
        if (ch.wallHP) delete ch.wallHP[lx + "," + ly];
        brokeTiles.push({ cx: ch.cx, cy: ch.cy, lx, ly, t: T.RUBBLE });
        touched.set(ch.cx + "," + ch.cy, ch);
      }
      for (const ch of touched.values()) { try { W.saveChunk(ch); } catch (e) { } }
      // multiplayer shared ground: the whole collapse lands everywhere at once
      try { if (window.MP && window.MP.publishTiles && brokeTiles.length) window.MP.publishTiles(brokeTiles); } catch (e) { }
    } catch (e) { }
  }
  function wallKey(lx, ly) { return lx + "," + ly; }
  function damageOverworldWall(gx, gy, dmg) {
    const out = { broke: false, collapsed: false, hpLeft: 0, building: null, tile: -1, ring: false, baseWall: false };
    try {
      const GM = window.Game, W = window.World, T = window.CFG.T;
      const G = (GM && GM.G) || GM;
      if (!GM || !W) return out;
      const tile = GM.tileAtGx(gx, gy);
      out.tile = tile;
      if (tile !== T.HOUSEWALL && tile !== T.ROOF && tile !== T.STONEWALL && tile !== T.WINDOW && tile !== T.DWALL && tile !== T.LANTERN) return out;
      if (tile === T.DWALL) return out; // overworld never has dungeon walls
      const ch = GM.chunkAt ? GM.chunkAt(gx, gy) : null;
      const b = buildingsAt(gx, gy);
      out.building = b;
      // street lamps are freestanding decor, never fortifications: flat HP,
      // no ring/enemy classification, no collapse — they just crumble.
      const isLamp = tile === T.LANTERN;
      const ring = !b && !isLamp && isRingWall(gx, gy);
      out.ring = ring;
      // fortification rings of enemy holdings: siege-grade HP, no collapse
      const ewall = !b && !ring && !isLamp && (tile === T.HOUSEWALL || tile === T.STONEWALL || tile === T.ROOF) && isEnemyBaseWall(gx, gy);
      out.baseWall = ewall;
      const isWin = tileIsWindowOf(b, gx, gy, tile);
      const maxHP = isLamp ? LANTERN_HP : ewall ? ENEMY_WALL_HP : ring ? RINGWALL_HP : maxHPFor(tile, false, isWin);
      if (!ch) {
        // no cached chunk (shouldn't happen in view) — still report
        out.hpLeft = maxHP - dmg;
        return out;
      }
      ch.wallHP = ch.wallHP || {};
      const lx = gx - ch.cx * 16, ly = gy - ch.cy * 16;
      const k = wallKey(lx, ly);
      let hp = ch.wallHP[k];
      if (hp == null) hp = maxHP;
      hp -= Math.max(1, Math.round(dmg));
     if (hp <= 0) {
       delete ch.wallHP[k];
        // Smashed street lamps leave no rubble scar: reveal the ground the
        // post stood on (path stays path), same treatment as felled trees.
        // Walls/windows keep the rubble (collapsed masonry).
        let brokeT = T.RUBBLE;
        if (isLamp) {
          try {
            const ub = (GM.overlayBaseTile ? GM.overlayBaseTile(gx, gy) : -1);
            if (ub != null && ub >= 0) brokeT = ub;
          } catch (e) { brokeT = T.RUBBLE; }
        }
        ch.tiles[ly * 16 + lx] = brokeT;
        out.broke = true;
        try {
          if (ewall && window.UI) {
            let bn = "the enemy holding";
            try { const bb = W.baseAt(gx, gy); if (bb) bn = W.baseName(bb); } catch (e2) { }
            window.UI.toast(`💥 Breached the walls of ${bn}!`, 4000);
          }
        } catch (e) { }
        try {
          if (GM.addParticles) GM.addParticles(gx + 0.5, gy + 0.5, "#9a9aa2", 14);
          if (GM.addDmgNum) GM.addDmgNum(gx + 0.5, gy + 0.3, "💥", "#ffd93d");
        } catch (e) { }
        try { W.saveChunk(ch); } catch (e) { }
        // multiplayer shared ground: everyone renders the same breach
        try {
          if (window.MP && window.MP.publishTiles) {
            window.MP.publishTiles([{ cx: ch.cx, cy: ch.cy, lx, ly, t: ch.tiles[ly * 16 + lx] }]);
          }
        } catch (e) { }
        // collapse?
        if (b && !ring) {
          try {
            if (buildingCollapsed(b)) {
              out.collapsed = true;
              try { collapseBuildingToRubble(b); } catch (e) { }
              try {
                const p = GM.player;
                if (p && Math.hypot(p.x - (b.x0 + b.w / 2), p.y - (b.y0 + b.h / 2)) < 24) {
                  if (window.UI) window.UI.toast(`🏚️ ${b.title} collapsed!`, 3500);
                }
              } catch (e) { }
            }
          } catch (e) { }
        }
      } else {
        ch.wallHP[k] = hp;
        out.hpLeft = hp;
        try {
          if (GM.addParticles) GM.addParticles(gx + 0.5, gy + 0.5, "#c9c9c9", 4);
          if (GM.addDmgNum) GM.addDmgNum(gx + 0.5, gy + 0.3, Math.round(dmg), "#e0e0e0");
        } catch (e) { }
        // persist HP lazily (throttle: every hit is fine, chunks are small)
        try { W.saveChunk(ch); } catch (e) { }
      }
    } catch (e) { }
    return out;
  }

  function damageDungeonWall(d, x, y, dmg) {
    const out = { broke: false, hpLeft: 0 };
    try {
      const T = window.CFG.T;
      if (!d || x < 0 || y < 0 || x >= d.w || y >= d.h) return out;
      if (d.tiles[y * d.w + x] !== T.DWALL) return out;
      d.wallHP = d.wallHP || {};
      const k = x + "," + y;
      let hp = d.wallHP[k];
      if (hp == null) hp = DUNGEON_HP;
      hp -= Math.max(1, Math.round(dmg));
      if (hp <= 0) {
        delete d.wallHP[k];
        d.tiles[y * d.w + x] = T.DFLOOR; // no collapse, ever — just a hole
        out.broke = true;
        try {
          const GM = window.Game;
          if (GM && GM.addParticles) GM.addParticles(x + 0.5, y + 0.5, "#55556a", 16);
          if (window.UI) window.UI.toast("⛏️ You cracked the crypt itself... how?!", 5000);
        } catch (e) { }
        try { window.World.saveDungeon(d); } catch (e) { }
      } else {
        d.wallHP[k] = hp;
        out.hpLeft = hp;
        try { window.World.saveDungeon(d); } catch (e) { }
      }
    } catch (e) { }
    return out;
  }

  // ---------- rendering ----------
  // Exterior facade for every building in view EXCEPT the one the player is
  // inside. Interiors draw only for the player's building (X-ray).
  // gx0..gy1 MUST be the render loop's exact visible tile bounds (passed in
  // by the caller). Recomputing them here from clientWidth drifted by a tile
  // or two versus the tile loop, which made edge buildings blink in and out.
  function drawRoofs(ctx, ts, ox, oy, insideB, gx0, gx1, gy0, gy1) {
    try {
      const GM = window.Game;
      const inner = (GM && GM.G) || {};
      const p = (GM && GM.player) || inner.player;
      if (!GM || !p || p.inDungeon) return;
      if (gx0 == null || gx1 == null || gy0 == null || gy1 == null) {
        // fallback: derive a generous range from the camera (CSS px units)
        const cam = inner.cam || { x: 0, y: 0 };
        const hw = (ctx.canvas.clientWidth || 800) / 2, hh = (ctx.canvas.clientHeight || 600) / 2;
        gx0 = Math.floor((cam.x - hw) / ts) - 2;
        gx1 = Math.ceil((cam.x + hw) / ts) + 2;
        gy0 = Math.floor((cam.y - hh) / ts) - 2;
        gy1 = Math.ceil((cam.y + hh) / ts) + 2;
      }
      const list = buildingsInView(gx0, gx1, gy0, gy1);
      for (const b of list) {
        if (insideB && b.id === insideB.id) continue;
        if (buildingCollapsed(b)) continue;
        drawExteriorFor(ctx, ts, ox, oy, b);
      }
    } catch (e) { }
  }
// ==== EXTERIOR V5 REPLACEMENT — lawn / walks / beds / props / curb ====
function lawnPaletteV5(sname){
  switch(sname){
    case "slate": return {A:"#5a9a58",dark:"#477d45",light:"#74b86e",soil:"#4a3826",tuft:"#3e7a35"};
    case "canal": return {A:"#5fae62",dark:"#4c8f50",light:"#7cc47c",soil:"#54402a",tuft:"#3f8340"};
    case "tile": return {A:"#63a86b",dark:"#4f8f57",light:"#82c48a",soil:"#5a4630",tuft:"#46854c"};
    case "iron": return {A:"#5d8a4e",dark:"#4a7140",light:"#72a060",soil:"#3e322a",tuft:"#416b38"};
    case "thatch": return {A:"#62a84e",dark:"#4f8c3e",light:"#7cc05e",soil:"#5a4028",tuft:"#438035"};
    case "hide": return {A:"#6f8f46",dark:"#5a7838",light:"#87a856",soil:"#5a4a2e",tuft:"#4f6e30"};
    case "ironhide": return {A:"#5f7a3e",dark:"#4c6332",light:"#75904e",soil:"#4a3826",tuft:"#425c2c"};
    case "canvas": return {A:"#66855a",dark:"#527046",light:"#7d9c6e",soil:"#54452e",tuft:"#47643e"};
    case "shored": return {A:"#6f8f52",dark:"#5a783e",light:"#88aa66",soil:"#5a452c",tuft:"#4f7036"};
    case "bonehide": return {A:"#8a9a58",dark:"#737f46",light:"#a3b26c",soil:"#6a5c38",tuft:"#66753e"};
    case "pale": return {A:"#6f8f68",dark:"#5a7554",light:"#88aa80",soil:"#54483a",tuft:"#4f6e4c"};
    case "cowl": return {A:"#4f6f52",dark:"#3f5c42",light:"#648a66",soil:"#3e3040",tuft:"#37503a"};
    case "moss": return {A:"#4c8452",dark:"#3d6c42",light:"#62a066",soil:"#46502e",tuft:"#356038"};
    case "bronze": return {A:"#7a9a52",dark:"#647f42",light:"#93b366",soil:"#5c4a2c",tuft:"#566f38"};
    case "coil": return {A:"#55a06a",dark:"#448556",light:"#6cba80",soil:"#4a4430",tuft:"#3a7a4c"};
    case "sky": return {A:"#62a86e",dark:"#4f8f5a",light:"#7cc486",soil:"#54462e",tuft:"#468252"};
    case "mossrock": return {A:"#577f52",dark:"#466842",light:"#6c9866",soil:"#4a4232",tuft:"#3c5e3a"};
    case "adobe": return {A:"#c9a86a",dark:"#a88a52",light:"#e0c080",soil:"#6a4a28",tuft:"#8a7a3a"};
    case "felt": return {A:"#7aaa5a",dark:"#648a46",light:"#93c46e",soil:"#5a4a2c",tuft:"#4f7036"};
    case "terrace": return {A:"#c08a5a",dark:"#a06a42",light:"#d9a06e",soil:"#5e3a24",tuft:"#8a6a3a"};
    case "snowpine": return {A:"#b9c9d4",dark:"#9aabb8",light:"#d4e2ec",soil:"#4a4232",tuft:"#6a8a9a"};
    case "gilt": return {A:"#6aaa62",dark:"#549050",light:"#84c47c",soil:"#4a3a28",tuft:"#46854c"};
    case "harbor": return {A:"#6aae7a",dark:"#549060",light:"#84c48e",soil:"#4a4230",tuft:"#46825a"};
    case "crown": return {A:"#6aaa62",dark:"#549050",light:"#84c47c",soil:"#3e322a",tuft:"#46854c"};
    default: return {A:"#5da24b",dark:"#4a8440",light:"#72b95c",soil:"#5a3f26",tuft:"#3f7d33"};
  }
}

  function extHash(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
  function extRand(seed){ let a=seed>>>0; return ()=>{ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
  // ---------- outdoor estate (false garden mask) ----------
  // The old front-elevation portraits read as ugly rectangles and their
  // painted doors could never sit exactly on the real door tile. New rule:
  // outdoors a building is a fenced GARDEN estate drawn over its own
  // footprint rect (never spilling onto neighbours). The fence/hedge runs
  // the perimeter with a GATE gap on every real door tile — so the gate IS
  // the door position, alignment is exact by construction, and the rect
  // reserves the full interior footprint as lawn instead of a blocky house.
  // Step through the gate/door and the whole garden lifts for YOUR building
  // only (X-ray), revealing the furnished interior walls underneath.
  // A small gate sign + one class marker (cross/anvil/mug/coin/torii/...)
  // keeps the type readable without rebuilding the rectangle.
  function estateRng(b) {
    try { return mulberry(hashStr("estate:" + b.id)); } catch (e) { return Math.random; }
  }
  function drawExteriorFor(ctx, ts, ox, oy, b) {
    // Collapsed buildings show ONLY their rubble interior: no lawn, no
    // house, no fence, ever again. (drawRoofs also skips them; this guard
    // covers direct callers too.)
    if (!b || buildingCollapsed(b)) return;
    try {
      const st = b.style || STYLES.town;
      const x0 = b.x0 * ts + ox, y0 = b.y0 * ts + oy;
      const W = b.w * ts, H = b.h * ts;
      if (W <= 0 || H <= 0) return;
      const u = ts / 32, cx = x0 + W / 2, cy = y0 + H / 2;
      const ck = b.classKey || "";
      const rng = estateRng(b);
      const ds = b.doors || [{ x: b.x0 + (b.w >> 1), y: b.y1 }];
      const onS = ds.filter(d => d.y === b.y1), onN = ds.filter(d => d.y === b.y0);
      const onE = ds.filter(d => d.x === b.x1), onW = ds.filter(d => d.x === b.x0);
      // ---- lawn base (manicured estate grass, per-style tint) ----
      const pal = lawnPaletteV5(st.name || "shingle");
      let lawnA = pal.A, soilC = pal.soil;
      const sname = st.name || "shingle";
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.fillRect(x0 + 2 * u, y0 + 3 * u, W, H);
      ctx.fillStyle = lawnA;
      ctx.fillRect(x0, y0, W, H);
      ctx.save();
      try { ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip(); } catch (e) {}
      // large soft tonal patches (mowing / wear), deterministic per building
      try {
        const prng = estateRng(b);
        for (let i = 0; i < 7; i++) {
          const ex = x0 + prng() * W, ey = y0 + prng() * H;
          const er = (0.8 + prng() * 1.6) * ts;
          ctx.fillStyle = prng() < 0.5 ? "rgba(255,255,255,0.055)" : "rgba(0,50,0,0.07)";
          ctx.beginPath(); ctx.ellipse(ex, ey, er, er * 0.55, prng() * 3, 0, 7); ctx.fill();
        }
        // fine speckle
        for (let i = 0; i < b.w * b.h * 2; i++) {
          const px = x0 + prng() * W, py = y0 + prng() * H;
          ctx.fillStyle = prng() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,60,0,0.08)";
          ctx.fillRect(px, py, Math.max(1.5, 2.5 * u), Math.max(1.5, 2.5 * u));
        }
        // grass tufts: 3-blade sprigs, denser away from walks (cheap: ~1 per tile)
        ctx.fillStyle = pal.tuft;
        const nt = Math.min(64, b.w * b.h + 10);
        for (let i = 0; i < nt; i++) {
          const px = x0 + 3 * u + prng() * (W - 6 * u), py = y0 + 3 * u + prng() * (H - 6 * u);
          const s = Math.max(1.5, 2.2 * u);
          ctx.fillRect(px, py - 3 * s * 0.5, s * 0.7, 3 * s * 0.5);
          ctx.fillRect(px - s * 0.8, py - 2 * s * 0.5, s * 0.7, 2 * s * 0.5);
          ctx.fillRect(px + s * 0.8, py - 2 * s * 0.5, s * 0.7, 2 * s * 0.5);
        }
        // pebbles
        ctx.fillStyle = "rgba(200,200,190,0.5)";
        for (let i = 0; i < Math.min(14, b.w + b.h); i++) {
          ctx.fillRect(x0 + prng() * W, y0 + prng() * H, Math.max(1.5, 2 * u), Math.max(1, 1.4 * u));
        }
        if (sname === "tile") {
          ctx.fillStyle = "rgba(232,160,192,0.6)";
          for (let i = 0; i < b.w + b.h + 4; i++) {
            const px = x0 + prng() * W, py = y0 + prng() * H;
            ctx.beginPath(); ctx.arc(px, py, Math.max(1.5, 2.6 * u), 0, 7); ctx.fill();
            ctx.fillStyle = "rgba(232,160,192,0.35)";
          }
        }
        if (sname === "cowl") {
          ctx.fillStyle = "rgba(160,74,224,0.35)";
          for (let i = 0; i < 6; i++) {
            const px = x0 + prng() * W, py = y0 + prng() * H;
            ctx.fillRect(px, py, Math.max(1.5, 2 * u), Math.max(1.5, 2 * u));
          }
        }
        if (sname === "pale" || sname === "bonehide") {
          ctx.fillStyle = "rgba(232,228,216,0.5)";
          for (let i = 0; i < 5; i++) {
            const px = x0 + prng() * W, py = y0 + prng() * H;
            ctx.fillRect(px, py, Math.max(2, 4 * u), Math.max(1, 1.6 * u));
          }
        }
        // cultural lawn scatter: pots / yucca / drifts / tufts (clear of house)
        const _hr = houseRectFor(b, x0, y0, W, H, ts);
        if (sname === "adobe") {
          for (let i = 0; i < 3; i++) {
            const px = x0 + (0.12 + prng() * 0.76) * W, py = y0 + (0.12 + prng() * 0.76) * H;
            if (px > _hr.hx - ts * 0.2 && px < _hr.hx + _hr.hw + ts * 0.2 && py > _hr.hy - ts * 0.2 && py < _hr.hy + _hr.hh + ts * 0.2) continue;
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.beginPath(); ctx.ellipse(px + u, py + u, 6 * u, 2.6 * u, 0, 0, 7); ctx.fill();
            ctx.fillStyle = "#a05a2e";
            ctx.fillRect(px - 5 * u, py - 6 * u, 10 * u, 7 * u);
            ctx.fillStyle = "#c97a3e";
            ctx.fillRect(px - 6 * u, py - 7.4 * u, 12 * u, 2.4 * u);
            ctx.fillStyle = "#3e7d3a";
            ctx.beginPath(); ctx.arc(px, py - 9 * u, 4 * u, 0, 7); ctx.fill();
            ctx.fillStyle = "#5aa84e";
            ctx.beginPath(); ctx.arc(px - 2 * u, py - 10 * u, 2 * u, 0, 7); ctx.fill();
          }
        } else if (sname === "terrace") {
          for (let i = 0; i < 4; i++) {
            const px = x0 + (0.1 + prng() * 0.8) * W, py = y0 + (0.1 + prng() * 0.8) * H;
            if (px > _hr.hx - ts * 0.2 && px < _hr.hx + _hr.hw + ts * 0.2 && py > _hr.hy - ts * 0.2 && py < _hr.hy + _hr.hh + ts * 0.2) continue;
            if (prng() < 0.5) {
              // yucca spikes
              ctx.fillStyle = "#4a6a2a";
              for (let b = -2; b <= 2; b++) ctx.fillRect(px + b * 1.8 * u, py - 8 * u + Math.abs(b) * 1.4 * u, 1.6 * u, 9 * u - Math.abs(b) * 1.4 * u);
              ctx.fillStyle = "#6a9a3a";
              ctx.fillRect(px - 1 * u, py - 9 * u, 2 * u, 9 * u);
            } else {
              // red-rock chunk
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.beginPath(); ctx.ellipse(px + u, py + u, 6 * u, 2.4 * u, 0, 0, 7); ctx.fill();
              ctx.fillStyle = "#9a5a3a";
              ctx.beginPath(); ctx.moveTo(px - 6 * u, py); ctx.lineTo(px - 1 * u, py - 6 * u); ctx.lineTo(px + 6 * u, py - 1 * u); ctx.lineTo(px + 4 * u, py + 1 * u); ctx.closePath(); ctx.fill();
              ctx.fillStyle = "#c98a5a";
              ctx.beginPath(); ctx.moveTo(px - 1 * u, py - 6 * u); ctx.lineTo(px + 6 * u, py - 1 * u); ctx.lineTo(px + 1 * u, py - 2 * u); ctx.closePath(); ctx.fill();
            }
          }
        } else if (sname === "snowpine") {
          ctx.fillStyle = "rgba(240,246,252,0.55)";
          for (let i = 0; i < 4; i++) {
            const px = x0 + (0.1 + prng() * 0.8) * W, py = y0 + (0.1 + prng() * 0.8) * H;
            ctx.beginPath(); ctx.ellipse(px, py, (6 + prng() * 8) * u, (2.5 + prng() * 2.5) * u, 0, 0, 7); ctx.fill();
          }
          ctx.fillStyle = "rgba(120,150,170,0.5)";
          for (let i = 0; i < 6; i++) {
            const px = x0 + prng() * W, py = y0 + prng() * H;
            ctx.fillRect(px, py, Math.max(1.5, 2 * u), Math.max(1, 1.4 * u));
          }
        } else if (sname === "felt") {
          ctx.fillStyle = "rgba(90,110,50,0.8)";
          for (let i = 0; i < 10; i++) {
            const px = x0 + 3 * u + prng() * (W - 6 * u), py = y0 + 3 * u + prng() * (H - 6 * u);
            const s = Math.max(1.5, 2.6 * u);
            ctx.fillRect(px, py - 3.4 * s * 0.5, s * 0.8, 3.4 * s * 0.5);
            ctx.fillRect(px - s, py - 2.2 * s * 0.5, s * 0.8, 2.2 * s * 0.5);
            ctx.fillRect(px + s, py - 2.2 * s * 0.5, s * 0.8, 2.2 * s * 0.5);
          }
        }
        // inner vignette: lawn reads as a sunken estate bed
        ctx.fillStyle = "rgba(0,0,0,0.10)";
        ctx.fillRect(x0, y0, W, Math.max(2, 3 * u));
        ctx.fillRect(x0, y0 + H - Math.max(2, 3 * u), W, Math.max(2, 3 * u));
        ctx.fillRect(x0, y0, Math.max(2, 3 * u), H);
        ctx.fillRect(x0 + W - Math.max(2, 3 * u), y0, Math.max(2, 3 * u), H);
      } catch (e) { }
      try { ctx.restore(); } catch (e) {}
      // ---- small house rect (front elevation, north-center of the plot) ----
      const HX = houseRectFor(b, x0, y0, W, H, ts);
      // ---- door walks (cobble / stepping-stone paths from each gate) ----
      const pathC = (sname === "iron" || sname === "slate") ? "#9a9aa4" : (sname === "tile" ? "#c9bfa8" : "#d4c9a8");
      const pathD = "rgba(0,0,0,0.28)";
      const pw = Math.max(6 * u, ts * 0.44);
      const drawPath = (px0, py0, pww, phh) => {
        ctx.fillStyle = pathD; ctx.fillRect(px0 - 1.5 * u, py0 - 1.5 * u, pww + 3 * u, phh + 3 * u);
        ctx.fillStyle = pathC; ctx.fillRect(px0, py0, pww, phh);
        // individual cobbles with highlight + shadow
        const step = ts * 0.30;
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        if (pww < phh) { for (let yy = py0 + 2 * u; yy < py0 + phh - 2 * u; yy += step) ctx.fillRect(px0 + 1, yy, pww - 2, 1.4 * u); }
        else { for (let xx = px0 + 2 * u; xx < px0 + pww - 2 * u; xx += step) ctx.fillRect(xx, py0 + 1, 1.4 * u, phh - 2); }
        ctx.fillStyle = "rgba(255,255,255,0.20)";
        if (pww < phh) { for (let yy = py0 + 2 * u; yy < py0 + phh - 2 * u; yy += step) ctx.fillRect(px0 + 1.5 * u, yy - 1.2 * u, pww - 3 * u, 1.2 * u); }
        else { for (let xx = px0 + 2 * u; xx < px0 + pww - 2 * u; xx += step) ctx.fillRect(xx - 1.2 * u, py0 + 1.5 * u, 1.2 * u, phh - 3 * u); }
        // moss flecks between stones
        ctx.fillStyle = "rgba(60,120,60,0.5)";
        const pr2 = estateRng(b);
        for (let i = 0; i < (pww * phh) / (ts * ts) * 3; i++) ctx.fillRect(px0 + pr2() * pww, py0 + pr2() * phh, 1.6 * u, 1.6 * u);
      };
      const pathLen = (tiles) => Math.min(tiles, 3.4) * ts;
      for (const d of ds) {
        const dcxP = (d.x - b.x0 + 0.5) * ts + x0, dcyP = (d.y - b.y0 + 0.5) * ts + y0;
        if (d.y === b.y1) drawPath(dcxP - pw / 2, y0 + H - pathLen(b.h), pw, pathLen(b.h));
        else if (d.y === b.y0) drawPath(dcxP - pw / 2, y0, pw, pathLen(b.h));
        else if (d.x === b.x1) drawPath(x0 + W - pathLen(b.w), dcyP - pw / 2, pathLen(b.w), pw);
        else drawPath(x0, dcyP - pw / 2, pathLen(b.w), pw);
      }
      // ---- flower beds + shrubs (clear of door walks AND the house) ----
      const blocked = new Set();
      for (const d of ds) {
        for (let i = 0; i <= 3; i++) {
          let fx = d.x, fy = d.y;
          if (d.y === b.y1) fy = d.y - i; else if (d.y === b.y0) fy = d.y + i;
          else if (d.x === b.x1) fx = d.x - i; else fx = d.x + i;
          blocked.add(fx + "," + fy);
        }
      }
      for (let gy = b.y0; gy <= b.y1; gy++) for (let gx = b.x0; gx <= b.x1; gx++) {
        const pcx = (gx - b.x0 + 0.5) * ts + x0, pcy = (gy - b.y0 + 0.5) * ts + y0;
        if (pcx > HX.hx - ts * 0.1 && pcx < HX.hx + HX.hw + ts * 0.1 && pcy > HX.hy - ts * 0.1 && pcy < HX.hy + HX.hh + ts * 0.1) blocked.add(gx + "," + gy);
      }
      const bedSpots = [];
      const cands = [
        { tx: b.x0 + 1, ty: b.y1 - 1, tw: 2, th: 1 },
        { tx: b.x1 - 2, ty: b.y1 - 1, tw: 2, th: 1 },
        { tx: b.x0 + 1, ty: b.y0 + 1, tw: 2, th: 1 },
        { tx: b.x1 - 2, ty: b.y0 + 1, tw: 2, th: 1 },
        { tx: b.x0 + 1, ty: b.y0 + 2, tw: 1, th: 2 },
        { tx: b.x1 - 1, ty: b.y0 + 2, tw: 1, th: 2 },
      ];
      for (const c of cands) {
        if (bedSpots.length >= 2) break;
        if (c.tx < b.x0 + 1 || c.ty < b.y0 + 1 || c.tx + c.tw > b.x1 || c.ty + c.th > b.y1) continue;
        let ok = true;
        for (let yy = c.ty; yy < c.ty + c.th && ok; yy++) for (let xx = c.tx; xx < c.tx + c.tw; xx++) {
          if (blocked.has(xx + "," + yy)) { ok = false; break; }
        }
        if (ok) bedSpots.push(c);
      }
      // per-style flower palettes
      let flowerCols = ["#e8546a", "#ffd93d", "#f2f2f2", "#e8a0c0", "#ff8a2e"];
      if (sname === "tile") flowerCols = ["#e8a0c0", "#f2f2f2", "#ffd93d", "#c77dff"];
      else if (sname === "iron" || sname === "slate") flowerCols = ["#e8e4d8", "#ffd93d", "#c77dff", "#ff6b6b"];
      else if (sname === "cowl") flowerCols = ["#c77dff", "#8a4ae0", "#e8a0c0", "#7fd4ff"];
      else if (sname === "pale" || sname === "bonehide") flowerCols = ["#e8e4d8", "#d9c9a0", "#c9b98a", "#ff8a5e"];
      else if (sname === "canal" || sname === "coil") flowerCols = ["#7fd4ff", "#f2f2f2", "#ffd93d", "#ff8a5e"];
      // corrals grow hay, not flower beds
      if (ck === "horse_pen") bedSpots.length = 0;
      bedSpots.forEach((c) => {
        const bx = x0 + (c.tx - b.x0) * ts, by = y0 + (c.ty - b.y0) * ts;
        const bw = c.tw * ts, bh = c.th * ts;
        const timber = (sname === "slate" || sname === "iron");
        // raised frame
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(bx - 2.5 * u, by - 2.5 * u, bw + 5 * u, bh + 5 * u);
        ctx.fillStyle = timber ? "#55555f" : "#6e4a26"; ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u);
        ctx.fillStyle = timber ? "#7a7a88" : "#8a5a33"; ctx.fillRect(bx - 2 * u, by - 2 * u, bw + 4 * u, 2 * u);
        ctx.fillStyle = soilC; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        for (let i = 0; i < bw / (8 * u); i++) ctx.fillRect(bx + i * 8 * u, by + bh - 3 * u, 4 * u, 2 * u);
        const n = Math.max(3, Math.floor(bw / (8 * u)));
        for (let i = 0; i < n; i++) {
          const r4 = estateRng({ id: b.id + ":bed" + c.tx + ":" + i });
          const fx = bx + (bw * (i + 0.5)) / n, fy = by + bh * 0.62;
          const tall = r4() < 0.3;
          const sh = tall ? 13 * u : 8 * u;
          ctx.fillStyle = "#2e7d3a";
          ctx.fillRect(fx - 1.4 * u, fy - sh, 2.8 * u, sh + 3 * u);
          ctx.fillStyle = "#3f9a46";
          ctx.fillRect(fx - 3.4 * u, fy - sh * 0.55, 3 * u, 5 * u);
          ctx.fillRect(fx + 0.8 * u, fy - sh * 0.75, 3 * u, 5 * u);
          const col = flowerCols[(i * 2 + c.tx) % flowerCols.length];
          ctx.fillStyle = col;
          const fr = tall ? Math.max(3, 5 * u) : Math.max(2.5, 4 * u);
          ctx.beginPath(); ctx.arc(fx, fy - sh - 1 * u, fr, 0, 7); ctx.fill();
          // petal ring
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2;
            ctx.beginPath(); ctx.arc(fx + Math.cos(a) * fr * 0.55, fy - sh - 1 * u + Math.sin(a) * fr * 0.55, fr * 0.32, 0, 7); ctx.fill();
          }
          ctx.fillStyle = "#fff3b0";
          ctx.beginPath(); ctx.arc(fx, fy - sh - 1 * u, fr * 0.34, 0, 7); ctx.fill();
        }
      });
      // corner shrubs / style props in free lawn corners
      try {
        const srng = estateRng({ id: b.id + ":shrub" });
        const corners = [
          { gx: b.x0, gy: b.y0 }, { gx: b.x1, gy: b.y0 },
          { gx: b.x0, gy: b.y1 }, { gx: b.x1, gy: b.y1 },
        ];
        for (const cn of corners) {
          if (blocked.has(cn.gx + "," + cn.gy)) continue;
          if (srng() < 0.35) continue;
          const sx = x0 + (cn.gx - b.x0 + 0.5) * ts, sy = y0 + (cn.gy - b.y0 + 0.5) * ts;
          if (sx > HX.hx - ts * 0.4 && sx < HX.hx + HX.hw + ts * 0.4 && sy > HX.hy - ts * 0.4 && sy < HX.hy + HX.hh + ts * 0.4) continue;
          const r0 = ts * 0.30;
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath(); ctx.ellipse(sx, sy + r0 * 0.5, r0, r0 * 0.5, 0, 0, 7); ctx.fill();
          ctx.fillStyle = sname === "tile" ? "#3e8a5a" : "#2e7d3a";
          ctx.beginPath(); ctx.arc(sx, sy, r0, 0, 7); ctx.fill();
          ctx.fillStyle = sname === "tile" ? "#55aa66" : "#3f9a46";
          ctx.beginPath(); ctx.arc(sx - r0 * 0.3, sy - r0 * 0.3, r0 * 0.7, 0, 7); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath(); ctx.arc(sx - r0 * 0.35, sy - r0 * 0.4, r0 * 0.28, 0, 7); ctx.fill();
          if (sname === "pale" || sname === "bonehide") {
            ctx.fillStyle = "#e8e4d8";
            ctx.fillRect(sx - 2 * u, sy - r0 - 4 * u, 4 * u, 3 * u);
          }
          blocked.add(cn.gx + "," + cn.gy);
        }
      } catch (e) { }
      // ---- low edging curb (plot edge, continuous incl. gates) ----
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(x0, y0, W, Math.max(2, 3 * u));
      ctx.fillRect(x0, y0 + H - Math.max(2, 3 * u), W, Math.max(2, 3 * u));
      ctx.fillRect(x0, y0, Math.max(2, 3 * u), H);
      ctx.fillRect(x0 + W - Math.max(2, 3 * u), y0, Math.max(2, 3 * u), H);
      ctx.fillStyle = (sname === "slate" || sname === "iron") ? "#6a6a76" : "rgba(255,255,255,0.14)";
      ctx.fillRect(x0, y0, W, 1);

      // ---- the small house (drawn over lawn + walks, inside the plot) ----
      // castles get the majestic multi-mass painter (plot passed so the keep
      // complex can fill the grounds instead of one manor block).
      try { drawHouse(ctx, { hx: HX.hx, hy: HX.hy, hw: HX.hw, hh: HX.hh, ts, u, st, ck, b, px0: x0, py0: y0, pW: W, pH: H }); } catch (e) { }
      // ---- fence with GATE gaps on real door tiles (style-built) ----
      let rail = "#8a5a33", post = "#5a3a22", hedge = null, stoneFence = false;
      if (sname === "dawn") { rail = "#e8ddc0"; post = "#a89058"; hedge = "#7ac890"; }
      else if (sname === "slate" || sname === "iron") { rail = "#3d3d48"; post = "#23232c"; stoneFence = (sname === "iron"); }
      else if (sname === "canal" || sname === "coil") { rail = "#4a7a8c"; post = "#2a4a55"; }
      else if (sname === "tile") { rail = "#a0764a"; post = "#6a4a2e"; hedge = "#3e8a44"; }
      else if (sname === "thatch") { hedge = "#2e7d3a"; rail = "#6e4a26"; post = "#4a2f1a"; }
      else if (sname === "pale" || sname === "bonehide") { rail = "#9a9482"; post = "#5a564a"; }
      else if (sname === "cowl") { rail = "#5a3a7a"; post = "#2a1840"; }
      else if (sname === "hide" || sname === "moss" || sname === "mossrock") { hedge = "#3e6e34"; rail = "#5a4a2e"; post = "#3a2f1c"; }
      const ft = Math.max(4, ts * 0.16);
      const ins = Math.max(3, 4 * u) + ft / 2;
      const gapsFor = (list, fixed) => list.map(d => {
        const c = (fixed === "x") ? (d.x - b.x0 + 0.5) * ts + x0 : (d.y - b.y0 + 0.5) * ts + y0;
        return [c - ts / 2, c + ts / 2];
      });
      const segs = (a0, a1, gaps) => {
        const g = gaps.slice().sort((p, q) => p[0] - q[0]);
        const out = []; let cur = a0;
        for (const gg of g) { if (gg[0] > cur) out.push([cur, Math.min(gg[0], a1)]); cur = Math.max(cur, gg[1]); }
        if (cur < a1) out.push([cur, a1]);
        return out;
      };
      const postEvery = ts;
      const drawHSeg = (y, a0, a1) => {
        if (a1 - a0 <= 0) return;
        if (stoneFence) {
          ctx.fillStyle = "#55555f";
          ctx.fillRect(a0, y - ft / 2 - 2 * u, a1 - a0, ft + 4 * u);
          ctx.fillStyle = "#7a7a88";
          ctx.fillRect(a0, y - ft / 2 - 2 * u, a1 - a0, 2 * u);
          ctx.fillStyle = "#3d3d48";
          for (let xx = a0 + 4 * u; xx < a1; xx += Math.max(10 * u, ts * 0.4)) ctx.fillRect(xx, y - ft / 2, 2 * u, ft);
          ctx.fillStyle = post;
          for (let xx = a0; xx < a1; xx += postEvery * 2) {
            ctx.fillRect(xx - 3 * u, y - ft / 2 - 5 * u, 6 * u, ft + 10 * u);
            ctx.fillStyle = "#ff9d2e";
            ctx.fillRect(xx - 3 * u, y - ft / 2 - 5 * u, 6 * u, 2 * u);
            ctx.fillStyle = post;
          }
        } else if (hedge) {
          ctx.fillStyle = hedge;
          ctx.fillRect(a0, y - ft / 2 - 2 * u, a1 - a0, ft + 4 * u);
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.fillRect(a0, y - ft / 2 - 2 * u, a1 - a0, Math.max(1.5, 2 * u));
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          for (let xx = a0 + 3 * u; xx < a1; xx += 7 * u) ctx.fillRect(xx, y + ft / 2 - 1 * u, 2.4 * u, 2.4 * u);
          ctx.fillStyle = post;
          for (let xx = a0; xx < a1; xx += postEvery) ctx.fillRect(xx - 2 * u, y - ft / 2 - 4 * u, 4 * u, ft + 8 * u);
          ctx.fillStyle = "#c9a86a";
          for (let xx = a0 + postEvery / 2; xx < a1; xx += postEvery) ctx.fillRect(xx - 1 * u, y - ft / 2 - 5 * u, 2 * u, 2 * u);
        } else {
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(a0, y - ft / 2 - 1 * u, a1 - a0, ft + 2 * u);
          ctx.fillStyle = rail;
          ctx.fillRect(a0, y - ft * 0.28, a1 - a0, ft * 0.30);
          ctx.fillRect(a0, y + ft * 0.02, a1 - a0, ft * 0.30);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(a0, y - ft * 0.28, a1 - a0, 1.2 * u);
          ctx.fillStyle = post;
          for (let xx = a0; xx < a1; xx += postEvery) {
            ctx.fillRect(xx - 2.5 * u, y - ft / 2 - 1 * u, 5 * u, ft + 2 * u);
            ctx.fillStyle = "rgba(255,255,255,0.18)";
            ctx.fillRect(xx - 2.5 * u, y - ft / 2 - 1 * u, 5 * u, 1.4 * u);
            ctx.fillStyle = post;
          }
        }
      };
      const drawVSeg = (x, a0, a1) => {
        if (a1 - a0 <= 0) return;
        if (stoneFence) {
          ctx.fillStyle = "#55555f";
          ctx.fillRect(x - ft / 2 - 2 * u, a0, ft + 4 * u, a1 - a0);
          ctx.fillStyle = post;
          for (let yy = a0; yy < a1; yy += postEvery * 2) ctx.fillRect(x - ft / 2 - 5 * u, yy - 3 * u, ft + 10 * u, 6 * u);
        } else if (hedge) {
          ctx.fillStyle = hedge;
          ctx.fillRect(x - ft / 2 - 2 * u, a0, ft + 4 * u, a1 - a0);
          ctx.fillStyle = post;
          for (let yy = a0; yy < a1; yy += postEvery) ctx.fillRect(x - ft / 2 - 4 * u, yy - 2 * u, ft + 8 * u, 4 * u);
        } else {
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(x - ft / 2 - 1 * u, a0, ft + 2 * u, a1 - a0);
          ctx.fillStyle = rail;
          ctx.fillRect(x - ft * 0.28, a0, ft * 0.30, a1 - a0);
          ctx.fillRect(x + ft * 0.02, a0, ft * 0.30, a1 - a0);
          ctx.fillStyle = post;
          for (let yy = a0; yy < a1; yy += postEvery) ctx.fillRect(x - ft / 2 - 1 * u, yy - 2.5 * u, ft + 2 * u, 5 * u);
        }
      };
      // ---- breached perimeter walls: missing fabric breaks fence+curb there ----
      // RUBBLE (player-smashed) AND stale-missing walls (old chunk baked
      // grass/path where a wall belongs) both read as a broken fence gap.
      // Purely visual: no tile is ever written, so this draws safely over
      // any ground without touching the world.
      let _T_RUB = 25, _T_HW = -1, _T_SW = -1, _T_WIN = -1, _T_ROOF = -1, _T_DOOR = -1;
      try { if (window.CFG && window.CFG.T) { const _TT = window.CFG.T; _T_RUB = _TT.RUBBLE; _T_HW = _TT.HOUSEWALL; _T_SW = _TT.STONEWALL; _T_WIN = _TT.WINDOW; _T_ROOF = _TT.ROOF; _T_DOOR = _TT.DOOR; } } catch (e) {}
      const _isWallLike = (_t) => _t === _T_HW || _t === _T_SW || _t === _T_WIN || _t === _T_ROOF || _t === _T_DOOR;
      const _breachS = [], _breachN = [], _breachE = [], _breachW = [];
      try {
        const _G = window.Game;
        if (_G && _G.tileAtGx) {
          const _isBreach = (gx, gy) => {
            try { if (_G.chunkAt && !_G.chunkAt(gx, gy)) return false; } catch (e) { return false; }
            let _t = -1; try { _t = _G.tileAtGx(gx, gy); } catch (e) { return false; }
            if (_t === _T_RUB) return true;
            let _exp = null;
            try { _exp = buildingTile(b, gx, gy); } catch (e) { _exp = null; }
            if (_exp == null || !_isWallLike(_exp)) return false;
            return !_isWallLike(_t);
          };
          const _isDoor = (gx, gy) => { try { return (b.doors || []).some(d => d.x === gx && d.y === gy); } catch (e) { return false; } };
          for (let gx = b.x0; gx <= b.x1; gx++) {
            if (_isDoor(gx, b.y1)) continue;
            if (_isBreach(gx, b.y1)) _breachS.push(gx);
          }
          for (let gx = b.x0; gx <= b.x1; gx++) {
            if (_isDoor(gx, b.y0)) continue;
            if (_isBreach(gx, b.y0)) _breachN.push(gx);
          }
          for (let gy = b.y0; gy <= b.y1; gy++) {
            if (_isDoor(b.x1, gy)) continue;
            if (_isBreach(b.x1, gy)) _breachE.push(gy);
          }
          for (let gy = b.y0; gy <= b.y1; gy++) {
            if (_isDoor(b.x0, gy)) continue;
            if (_isBreach(b.x0, gy)) _breachW.push(gy);
          }
        }
      } catch (e) {}
      const _brGaps = (tiles, fixed) => tiles.map(v => {
        const c = (fixed === "x") ? (v - b.x0 + 0.5) * ts + x0 : (v - b.y0 + 0.5) * ts + y0;
        return [c - ts / 2, c + ts / 2];
      });
      const gS = gapsFor(onS, "x").concat(_brGaps(_breachS, "x"));
      const gN = gapsFor(onN, "x").concat(_brGaps(_breachN, "x"));
      const gE = gapsFor(onE, "y").concat(_brGaps(_breachE, "y"));
      const gW = gapsFor(onW, "y").concat(_brGaps(_breachW, "y"));
      try {
        const yS = y0 + H - ins, yN = y0 + ins, xE = x0 + W - ins, xW = x0 + ins;
        for (const sg of segs(x0 + ins, x0 + W - ins, gS)) drawHSeg(yS, sg[0], sg[1]);
        for (const sg of segs(x0 + ins, x0 + W - ins, gN)) drawHSeg(yN, sg[0], sg[1]);
        for (const sg of segs(y0 + ins, y0 + H - ins, gE)) drawVSeg(xE, sg[0], sg[1]);
        for (const sg of segs(y0 + ins, y0 + H - ins, gW)) drawVSeg(xW, sg[0], sg[1]);
      } catch (e) {}
      try {
        const ct = Math.max(2, 3 * u);
        const rubbleAt = (px, py, r) => {
          ctx.fillStyle = "rgba(62,46,30,0.92)";
          ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.62, 0, 0, 7); ctx.fill();
          ctx.fillStyle = "#7a7a82";
          ctx.fillRect(px - r * 0.55, py - r * 0.35, r * 0.5, r * 0.42);
          ctx.fillStyle = "#9a9aa2";
          ctx.fillRect(px - r * 0.45, py - r * 0.42, r * 0.3, r * 0.22);
          ctx.fillStyle = "#55555c";
          ctx.fillRect(px + r * 0.05, py - r * 0.10, r * 0.45, r * 0.38);
          ctx.fillStyle = "#b0b0b8";
          ctx.fillRect(px + r * 0.12, py - r * 0.16, r * 0.22, r * 0.16);
          ctx.fillStyle = post;
          ctx.fillRect(px - r * 0.95, py - r * 0.5, r * 0.34, r * 0.62);
          ctx.fillRect(px + r * 0.61, py - r * 0.5, r * 0.34, r * 0.62);
        };
        for (const gx of _breachS) {
          const cx = (gx - b.x0 + 0.5) * ts + x0;
          ctx.fillStyle = lawnA; ctx.fillRect(cx - ts / 2, y0 + H - ct, ts, ct);
          rubbleAt(cx, y0 + H - ins, ts * 0.42);
        }
        for (const gx of _breachN) {
          const cx = (gx - b.x0 + 0.5) * ts + x0;
          ctx.fillStyle = lawnA; ctx.fillRect(cx - ts / 2, y0, ts, ct);
          rubbleAt(cx, y0 + ins, ts * 0.42);
        }
        for (const gy of _breachE) {
          const cy2 = (gy - b.y0 + 0.5) * ts + y0;
          ctx.fillStyle = lawnA; ctx.fillRect(x0 + W - ct, cy2 - ts / 2, ct, ts);
          rubbleAt(x0 + W - ins, cy2, ts * 0.42);
        }
        for (const gy of _breachW) {
          const cy2 = (gy - b.y0 + 0.5) * ts + y0;
          ctx.fillStyle = lawnA; ctx.fillRect(x0, cy2 - ts / 2, ct, ts);
          rubbleAt(x0 + ins, cy2, ts * 0.42);
        }
      } catch (e) {}
      // ---- gates: style posts + open leaves + threshold, exactly on door tiles ----
      const gatePostC = (sname === "tile") ? "#c0392b" : post;
      for (const d of ds) {
        const px = (d.x - b.x0 + 0.5) * ts + x0, py = (d.y - b.y0 + 0.5) * ts + y0;
        const pw2 = Math.max(4, 6 * u);
        if (d.y === b.y1 || d.y === b.y0) {
          const gy = (d.y === b.y1) ? y0 + H - ins : y0 + ins;
          // stone pillars for city/fortress, red posts for sakura
          if (stoneFence) {
            ctx.fillStyle = "#6a6a76";
            ctx.fillRect(px - ts / 2 - pw2 / 2 - 1 * u, gy - ft - 2 * u, pw2 + 2 * u, ft * 2 + 4 * u);
            ctx.fillStyle = "#8a8a96";
            ctx.fillRect(px - ts / 2 - pw2 / 2 - 1 * u, gy - ft - 2 * u, pw2 + 2 * u, 2.4 * u);
            ctx.fillRect(px + ts / 2 - pw2 / 2 - 1 * u, gy - ft - 2 * u, pw2 + 2 * u, ft * 2 + 4 * u);
            ctx.fillStyle = "#ff9d2e";
            ctx.fillRect(px - ts / 2 - pw2 / 2, gy - ft - 3 * u, pw2, 2.4 * u);
            ctx.fillRect(px + ts / 2 - pw2 / 2, gy - ft - 3 * u, pw2, 2.4 * u);
          } else {
            ctx.fillStyle = gatePostC;
            ctx.fillRect(px - ts / 2 - pw2 / 2, gy - ft - 1 * u, pw2, ft * 2 + 2 * u);
            ctx.fillRect(px + ts / 2 - pw2 / 2, gy - ft - 1 * u, pw2, ft * 2 + 2 * u);
            ctx.fillStyle = (sname === "tile") ? "#1e2438" : "#ffd93d";
            ctx.fillRect(px - ts / 2 - pw2 / 2, gy - ft - 3 * u, pw2, 2.5 * u);
            ctx.fillRect(px + ts / 2 - pw2 / 2, gy - ft - 3 * u, pw2, 2.5 * u);
          }
          ctx.fillStyle = rail;
          const inD = (d.y === b.y1) ? -1 : 1;
          ctx.fillRect(px - ts / 2, gy + inD * ft, 3.5 * u, inD * ts * 0.42);
          ctx.fillRect(px + ts / 2 - 3.5 * u, gy + inD * ft, 3.5 * u, inD * ts * 0.42);
          // lantern glow on tall posts
          ctx.fillStyle = "rgba(255,210,110,0.35)";
          ctx.beginPath(); ctx.arc(px - ts / 2, gy - ft, 5 * u, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(px + ts / 2, gy - ft, 5 * u, 0, 7); ctx.fill();
          ctx.fillStyle = pathC;
          ctx.fillRect(px - ts / 2 + 2, (d.y === b.y1 ? y0 + H - ts * 0.30 : y0 + ts * 0.08), ts - 4, ts * 0.22);
        } else {
          const gx = (d.x === b.x1) ? x0 + W - ins : x0 + ins;
          ctx.fillStyle = gatePostC;
          ctx.fillRect(gx - ft - 1 * u, py - ts / 2 - pw2 / 2, ft * 2 + 2 * u, pw2);
          ctx.fillRect(gx - ft - 1 * u, py + ts / 2 - pw2 / 2, ft * 2 + 2 * u, pw2);
          ctx.fillStyle = (sname === "tile") ? "#1e2438" : "#ffd93d";
          ctx.fillRect(gx - ft - 1 * u, py - ts / 2 - pw2 / 2, 2.5 * u, pw2);
          ctx.fillRect(gx - ft - 1 * u, py + ts / 2 - pw2 / 2, 2.5 * u, pw2);
          ctx.fillStyle = rail;
          const inD = (d.x === b.x1) ? -1 : 1;
          ctx.fillRect(gx + inD * ft, py - ts / 2, inD * ts * 0.42, 3.5 * u);
          ctx.fillRect(gx + inD * ft, py + ts / 2 - 3.5 * u, inD * ts * 0.42, 3.5 * u);
          ctx.fillStyle = pathC;
          ctx.fillRect((d.x === b.x1 ? x0 + W - ts * 0.30 : x0 + ts * 0.08), py - ts / 2 + 2, ts * 0.22, ts - 4);
        }
      }

      void cy;      void cy;
    } catch (e) { }
  }
  // keep the old name working (game.js used it before the garden rework)
  function drawRoofFor(ctx, ts, ox, oy, b) { drawExteriorFor(ctx, ts, ox, oy, b); }
  // Small-house rect inside the plot: estate house, never touching fence.
  function houseRectFor(b, x0, y0, W, H, ts) {
    let hw = W * 0.74, hh = H * 0.56;
    // grand classes get a bigger mass; tiny plots stay compact
    const grand = { cathedral: 1, church: 1, guildhall: 1, manor: 1, mead_hall: 1, great_hall: 1, tide_temple: 1, shrine: 1, forge_works: 1, great_forge: 1, bull_hall: 1, wight_throne: 1, pit_chapel: 1 };
    if (grand[b.classKey]) { hw = W * 0.80; hh = H * 0.62; }
    if (b.w <= 4 || b.h <= 4) { hw = W * 0.68; hh = H * 0.54; }
    hw = Math.max(ts * 1.8, Math.min(W * 0.88, hw));
    hh = Math.max(ts * 1.6, Math.min(H * 0.70, hh));
    if (hw > W * 0.94) { hw = W * 0.94; }
    if (hh > H * 0.82) { hh = H * 0.82; }
    const hx = x0 + (W - hw) / 2;
    const hy = y0 + Math.max(2, H * 0.06);
    return { hx, hy, hw, hh };
  }
  // The estate house: two-mass front elevation with style roofs, shutters,
  // dormers, chimneys, lanterns, awnings, steeples and class side-props.
  // ---- majestic castles (Nov 2026, v7): every culture's seat of power ----
  // The old house painter drew every castle as one gabled house + side wings:
  // at plot scale that reads as a manor, not a seat of power (baseline 4/10:
  // symmetric single ridge, one roof height, no curtain, no gatehouse, lawn
  // dwarfing the mass). Castles now get their own front-elevation grammar:
  // stone platform + curtain walls with crenellations + 2-4 towers of varied
  // height + tall central keep + gatehouse with arch/portcullis + battlements,
  // spires/domes/pagodas per culture + banners/pennants + glowing arrow slits
  // and lancets + braziers. All paint stays inside the plot rect (spire height
  // is budgeted from the plot top, so northern neighbours never overdraw).
  // Footprints were stepped in SHAPES in the same pass (asymmetric bastion
  // notches, still corners-only so doors stay tile-exact).
  // v8: temples are NOT castles (chapel/church/cathedral/tide/shrine/sun/high +
  // caravanserai/bazaar/lighthouse are houses with holy/market/tower painters).
  // Every hearth culture gets its OWN castle class (see castleFormFor).
  function isTrueCastleKey(ck) {
    return !!{ grand_castle: 1, castle_keep: 1, palace: 1, great_hall: 1, khan_hall: 1, terrace_hall: 1, ice_hall: 1, village_keep: 1, town_keep: 1, city_citadel: 1, tide_keep: 1, sakura_castle: 1, sun_keep: 1, gilt_keep: 1, harbor_keep: 1, bull_hall: 1, wight_throne: 1, orc_hall: 1, moss_hall: 1, alpha_mound: 1, kobold_nook: 1, matriarch_perch: 1, pit_chapel: 1 }[ck];
  }
  // Per-culture castle form: silhouette + roof + wall grammar. No two hearth
  // castles share a form — that was the v7 complaint (same grammar, paint only).
  function castleFormFor(ck) {
    if (ck === "sakura_castle") return "tenshu";
    if (ck === "village_keep") return "motte";
    if (ck === "town_keep") return "norman";
    if (ck === "city_citadel") return "citadel";
    if (ck === "tide_keep") return "canalfort";
    if (ck === "sun_keep") return "kasbah";
    if (ck === "gilt_keep") return "giltfort";
    if (ck === "harbor_keep") return "seafort";
    if (ck === "grand_castle" || ck === "castle_keep") return "royal";
    if (ck === "palace") return "palatial";
    if (ck === "great_hall") return "ironhold";
    if (ck === "khan_hall") return "ordos";
    if (ck === "terrace_hall") return "cliff";
    if (ck === "ice_hall") return "icekeep";
    if (ck === "bull_hall") return "bullhorn";
    if (ck === "wight_throne") return "pale";
    if (ck === "orc_hall") return "tusked";
    if (ck === "moss_hall") return "mossy";
    if (ck === "alpha_mound") return "bonearch";
    if (ck === "kobold_nook") return "scrap";
    if (ck === "matriarch_perch") return "aerie";
    if (ck === "pit_chapel") return "pit";
    return "generic";
  }
  function castleBattlements(ctx, x, y, w, u, capC, trimC) {
    const m = Math.max(3 * u, 4), gap = m * 0.9, h = Math.max(3 * u, 5);
    ctx.fillStyle = capC;
    ctx.fillRect(x, y, w, Math.max(2, 2.4 * u));
    ctx.fillStyle = trimC;
    for (let xx = x; xx + m * 0.6 < x + w + 1; xx += m + gap) {
      ctx.fillRect(xx, y - h, m, h + 2 * u);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fillRect(xx, y - h, m, 1.4 * u);
      ctx.fillStyle = trimC;
    }
  }
  function castleWallCourses(ctx, x, y, w, h, ts, u, stone, wallC, trimC, hr) {
    ctx.fillStyle = wallC;
    ctx.fillRect(x, y, w, h);
    // sun shade: left lit, right shaded, base grounded
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(x, y, Math.max(1.5, 2 * u), h);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(x + w - Math.max(1.5, 2.4 * u), y, Math.max(1.5, 2.4 * u), h);
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(x, y + h - Math.max(2, 3 * u), w, Math.max(2, 3 * u));
    if (stone) {
      const ch = Math.max(5, ts * 0.22);
      let row = 0;
      for (let yy = y; yy < y + h; yy += ch, row++) {
        ctx.fillStyle = row % 2 ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.10)";
        ctx.fillRect(x, yy + ch - 1.4 * u, w, 1.4 * u);
        for (let xx = x + (row % 2 ? ch * 0.9 : ch * 0.4); xx < x + w; xx += ch * 1.8) {
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.fillRect(xx, yy, 1.4 * u, ch);
        }
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(x, yy, w, 1);
      }
      // quoins: alternating corner blocks on stone keeps/towers
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      const qh = Math.max(4, ts * 0.16);
      for (let yy = y, qi = 0; yy < y + h - 1; yy += qh, qi++) {
        const qw = Math.max(3, ts * (qi % 2 ? 0.14 : 0.22));
        ctx.fillRect(x, yy, qw, qh * 0.8);
        ctx.fillRect(x + w - qw, yy + (qi % 2 ? qh * 0.4 : 0), qw, qh * 0.8);
      }
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 6; i++) ctx.fillRect(x + hr() * w, y + hr() * h, 2 * u, 1.4 * u);
    } else {
      ctx.fillStyle = "rgba(120,90,50,0.20)";
      for (let i = 0; i < 12; i++) ctx.fillRect(x + hr() * w, y + hr() * h, 2.4 * u, 1.6 * u);
      ctx.fillStyle = trimC;
      const bw = Math.max(2, ts * 0.08);
      ctx.fillRect(x, y, w, bw);
      ctx.fillRect(x, y + h * 0.5, w, bw);
      // timber studs
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let xx = x + w * 0.18; xx < x + w - 2; xx += Math.max(9 * u, ts * 0.4)) {
        ctx.fillRect(xx, y + bw, Math.max(1.5, 2 * u), h - bw);
      }
    }
  }
  function castleRoofSpire(ctx, x, y, w, rh, u, roofC, trimC, ridgeC, sname, finial) {
    const cx = x + w / 2;
    if (sname === "tile") {
      // pagoda: two flared tiers + horns + gold finial
      const t2h = rh * 0.52, t1h = rh * 0.48;
      ctx.fillStyle = roofC;
      ctx.beginPath();
      ctx.moveTo(x - 4 * u, y + t2h);
      ctx.quadraticCurveTo(x + w * 0.25, y + t2h - rh * 0.30, cx, y + t2h - rh * 0.28);
      ctx.quadraticCurveTo(x + w * 0.75, y + t2h - rh * 0.30, x + w + 4 * u, y + t2h);
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = Math.max(1.5, 2 * u); ctx.strokeStyle = trimC; ctx.stroke();
      ctx.fillStyle = roofC;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.30, y + t2h);
      ctx.quadraticCurveTo(cx - w * 0.12, y + t2h - t1h * 0.6, cx, y);
      ctx.quadraticCurveTo(cx + w * 0.12, y + t2h - t1h * 0.6, cx + w * 0.30, y + t2h);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = trimC; ctx.stroke();
      ctx.fillStyle = trimC;
      ctx.fillRect(x - 5 * u, y + t2h - 3 * u, 4 * u, 5 * u);
      ctx.fillRect(x + w + u, y + t2h - 3 * u, 4 * u, 5 * u);
      ctx.fillStyle = ridgeC;
      ctx.fillRect(cx - 1.4 * u, y - 5 * u, 2.8 * u, 6 * u);
      ctx.beginPath(); ctx.arc(cx, y - 6 * u, 2.6 * u, 0, 7); ctx.fill();
      return;
    }
    if (sname === "adobe" || sname === "felt" || sname === "gilt") {
      // dome: sand / white felt / gilt copper
      ctx.fillStyle = roofC;
      ctx.beginPath(); ctx.arc(cx, y + rh * 0.92, w * 0.52, Math.PI, 0); ctx.fill();
      ctx.lineWidth = Math.max(1.5, 2 * u); ctx.strokeStyle = trimC; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath(); ctx.arc(cx - w * 0.16, y + rh * 0.48, w * 0.10, 0, 7); ctx.fill();
      if (sname === "felt") {
        ctx.fillStyle = "#c94e3a";
        ctx.fillRect(x + 1 * u, y + rh * 0.86, w - 2 * u, Math.max(2, 3 * u));
      }
      if (sname === "adobe") {
        ctx.fillStyle = trimC;
        for (let xx = x + 4 * u; xx < x + w - 2 * u; xx += Math.max(8 * u, w / 6)) {
          ctx.beginPath(); ctx.arc(xx, y + rh * 0.92, Math.max(1.4, 2 * u), 0, 7); ctx.fill();
        }
      }
      ctx.fillStyle = ridgeC;
      ctx.fillRect(cx - 1.4 * u, y - 4 * u, 2.8 * u, 6 * u);
      ctx.beginPath(); ctx.arc(cx, y - 5 * u, 2.4 * u, 0, 7); ctx.fill();
      return;
    }
    if (sname === "terrace") {
      // stepped tiers
      const t2w = w * 0.62, t2x = cx - t2w / 2, t2h = rh * 0.46;
      ctx.fillStyle = wallC_terrace(trimC);
      ctx.fillRect(t2x, y, t2w, t2h);
      ctx.fillStyle = roofC;
      ctx.fillRect(t2x - 1 * u, y, t2w + 2 * u, Math.max(2, 3 * u));
      ctx.fillStyle = wallC_terrace(trimC);
      ctx.fillRect(x, y + t2h, w, rh - t2h);
      ctx.fillStyle = roofC;
      ctx.fillRect(x - 1 * u, y + t2h, w + 2 * u, Math.max(2, 2.5 * u));
      function wallC_terrace(t) { return "#d9a878"; }
      ctx.fillStyle = ridgeC;
      ctx.fillRect(cx - 1.4 * u, y - 4 * u, 2.8 * u, 5 * u);
      return;
    }
    // default: steep spire (snow capped for snowpine, ember tipped for iron)
    const apexY = y;
    ctx.fillStyle = roofC;
    ctx.beginPath();
    ctx.moveTo(x - 2 * u, y + rh); ctx.lineTo(cx, apexY); ctx.lineTo(x + w + 2 * u, y + rh);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = Math.max(1.6, 2 * u); ctx.strokeStyle = trimC; ctx.stroke();
    if (sname === "snowpine") {
      ctx.fillStyle = "rgba(240,246,252,0.92)";
      ctx.beginPath();
      ctx.moveTo(x - 2 * u, y + rh); ctx.lineTo(cx, apexY);
      ctx.lineTo(x + w + 2 * u, y + rh); ctx.lineTo(x + w + 2 * u, y + rh - rh * 0.40);
      ctx.lineTo(cx, apexY + rh * 0.34); ctx.lineTo(x - 2 * u, y + rh - rh * 0.40);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(215,235,248,0.95)";
      for (let xx = x + 2 * u; xx < x + w - 1 * u; xx += Math.max(7 * u, w / 5)) {
        const il = 3 * u;
        ctx.beginPath(); ctx.moveTo(xx, y + rh + 1 * u); ctx.lineTo(xx + 1.2 * u, y + rh + 1 * u + il); ctx.lineTo(xx + 2.4 * u, y + rh + 1 * u); ctx.closePath(); ctx.fill();
      }
    }
    if (sname === "iron" || sname === "ironhide") {
      ctx.fillStyle = "rgba(255,140,40,0.85)";
      ctx.fillRect(cx - 1.6 * u, apexY - 1 * u, 3.2 * u, 3 * u);
    }
    if (finial !== false) {
      ctx.fillStyle = ridgeC;
      ctx.fillRect(cx - 1.2 * u, apexY - 6 * u, 2.4 * u, 6 * u);
      ctx.beginPath(); ctx.arc(cx, apexY - 7 * u, 2.2 * u, 0, 7); ctx.fill();
    }
  }
  function castlePennant(ctx, x, y, len, u, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + 3 * u); ctx.lineTo(x, y + 6 * u); ctx.closePath(); ctx.fill();
  }
  function castleBanner(ctx, x, y, w, h, u, cloth, sigil) {
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(x + 1.2 * u, y + 1.5 * u, w, h);
    ctx.fillStyle = cloth;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x, y + h - 2.4 * u, w, 2.4 * u);
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w / 2, y + h + 4 * u); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = sigil;
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.38, Math.min(w * 0.22, 3.4 * u), 0, 7); ctx.fill();
    ctx.fillStyle = "#2b2118";
    ctx.fillRect(x + w / 2 - 1 * u, y + 1 * u, 2 * u, 3 * u);
  }
  // v8 bespoke: stepped merlons (kasbah / Norman / canal forts read flat-topped,
  // not spired — a different silhouette from every spired castle).
  function castleMerlons(ctx, x, y, w, u, capC, trimC) {
    const m = Math.max(4 * u, 6), gap = m * 0.7, h = Math.max(4 * u, 7);
    ctx.fillStyle = capC;
    ctx.fillRect(x, y, w, Math.max(2, 2.4 * u));
    ctx.fillStyle = trimC;
    for (let xx = x; xx + m * 0.6 < x + w + 1; xx += m + gap) {
      ctx.fillRect(xx, y - h, m, h + 2 * u);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fillRect(xx, y - h, m, 1.4 * u);
      ctx.fillStyle = trimC;
    }
  }
  // v8 bespoke: Kyoto/Himeji tenshu — white plaster tiers, black timber bands,
  // curved dark roofs, stone base, gold shachi. No torii (that belongs to the shrine).
  function drawTenshuCastle(ctx, P) {
    try {
      const ts = P.ts, u = P.u, st = P.st || {}, ck = P.ck || "sakura_castle";
      const b = P.b || null;
      const hr = extRand(extHash("tenshu:" + (b && b.id ? String(b.id) : ck)));
      const px0 = (P.px0 != null ? P.px0 : P.hx), py0 = (P.py0 != null ? P.py0 : P.hy);
      const PW = (P.pW != null ? P.pW : P.hw), PH = (P.pH != null ? P.pH : P.hh);
      if (!(PW > 0 && PH > 0)) return false;
      const trimC = "#1e2438", doorC = "#4a1f1f";
      const white = "#f2ede2", black = "#23232c";
      const roofC = "#2e3444", ridgeC = "#c9a227";
      const cw = PW * 0.84, cx0 = px0 + (PW - cw) / 2;
      const baseY = py0 + PH * 0.86;
      // stone base (musha-gaeshi batter)
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.fillRect(cx0 - 1 * u + 2 * u, baseY + 2 * u, cw + 2 * u, 5 * u);
      const baseH = Math.max(ts * 0.5, PH * 0.14);
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.moveTo(cx0 - 2 * u, baseY - baseH);
      ctx.lineTo(cx0 + cw + 2 * u, baseY - baseH);
      ctx.lineTo(cx0 + cw + 4 * u, baseY);
      ctx.lineTo(cx0 - 4 * u, baseY);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let yy = baseY - baseH + 2 * u; yy < baseY - 1; yy += Math.max(4, ts * 0.14)) {
        ctx.fillRect(cx0 - 2 * u, yy, cw + 4 * u, 1.2 * u);
      }
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(cx0 - 2 * u, baseY - baseH, cw + 4 * u, 1.5 * u);
      // three tiers, narrowing upward
      const tiers = [0.62, 0.48, 0.34];
      // roofs are budgeted from the plot top so northern neighbours never overdraw
      const tierH = (baseY - baseH - py0 - ts * 1.5) / 3;
      let ty = baseY - baseH;
      const cx = cx0 + cw / 2;
      const roofAt = (rwx, rwy, rww, rhh) => {
        // flared curved roof with upturned corners + gold under-eave line
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(rwx - 5 * u + 1.5 * u, rwy + 2 * u, rww + 10 * u - 3 * u, 3 * u);
        ctx.fillStyle = roofC;
        ctx.beginPath();
        ctx.moveTo(rwx - 7 * u, rwy);
        ctx.quadraticCurveTo(rwx + rww * 0.22, rwy - rhh * 0.75, rwx + rww / 2, rwy - rhh * 0.60);
        ctx.quadraticCurveTo(rwx + rww * 0.78, rwy - rhh * 0.75, rwx + rww + 7 * u, rwy);
        ctx.lineTo(rwx + rww + 4 * u, rwy + 2.5 * u);
        ctx.lineTo(rwx - 4 * u, rwy + 2.5 * u);
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = Math.max(1.6, 2 * u); ctx.strokeStyle = black; ctx.stroke();
        // sunlit upper slope
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(rwx, rwy - rhh * 0.55, rww, Math.max(1.2, 1.6 * u));
        ctx.fillStyle = ridgeC;
        ctx.fillRect(rwx + 2 * u, rwy + 0.5 * u, rww - 4 * u, Math.max(1.6, 2.4 * u));
        // upturned corner tips
        ctx.fillStyle = black;
        ctx.fillRect(rwx - 6 * u, rwy - 4 * u, 4 * u, 5 * u);
        ctx.fillRect(rwx + rww + 2 * u, rwy - 4 * u, 4 * u, 5 * u);
      };
      for (let i = 0; i < 3; i++) {
        const tw = cw * tiers[i], tx = cx - tw / 2;
        const th = tierH * (i === 2 ? 0.92 : 1.0);
        ty -= th;
        // white wall + black timber bands
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(tx + 1.5 * u, ty + 2 * u, tw, th);
        ctx.fillStyle = white;
        ctx.fillRect(tx, ty, tw, th);
        // sun shading: lit left, shaded right
        ctx.fillStyle = "rgba(255,255,255,0.20)";
        ctx.fillRect(tx, ty, Math.max(1.5, 2 * u), th);
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(tx + tw - Math.max(2, 3 * u), ty, Math.max(2, 3 * u), th);
        ctx.fillStyle = black;
        ctx.fillRect(tx, ty, tw, Math.max(2, 2.6 * u));
        ctx.fillRect(tx, ty + th - Math.max(2, 2.6 * u), tw, Math.max(2, 2.6 * u));
        // corner posts only (wide white fields between — no barcode)
        ctx.fillRect(tx, ty, Math.max(2, 3 * u), th);
        ctx.fillRect(tx + tw - Math.max(2, 3 * u), ty, Math.max(2, 3 * u), th);
        // warm shoji windows with glow
        const ww = Math.min(ts * 0.30, tw * 0.16);
        const wy = ty + th * 0.36;
        for (const sgn of [-1, 1]) {
          const wx = cx + sgn * tw * 0.24 - ww / 2;
          if (wx < tx + 2 || wx + ww > tx + tw - 2) continue;
          ctx.fillStyle = "rgba(255,200,90,0.30)";
          ctx.fillRect(wx - 3 * u, wy - 3 * u, ww + 6 * u, ww + 6 * u);
          ctx.fillStyle = black;
          ctx.fillRect(wx - 1.5 * u, wy - 1.5 * u, ww + 3 * u, ww + 3 * u);
          ctx.fillStyle = "#ffd97a";
          ctx.fillRect(wx, wy, ww, ww);
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.fillRect(wx, wy, ww, ww * 0.35);
          ctx.fillStyle = black;
          ctx.fillRect(wx + ww / 2 - u, wy, 2 * u, ww);
        }
        // roof over this tier (deep flared slabs — the tenshu read)
        const rh = i === 2 ? Math.min(ts * 0.8, tierH * 0.55) : Math.min(ts * 0.6, tierH * 0.45);
        roofAt(tx - tw * 0.12, ty, tw * 1.24, rh);
        ty -= 1 * u;
      }
      // gold shachi finial
      const apexY = ty - 2 * u;
      ctx.fillStyle = ridgeC;
      ctx.fillRect(cx - 1.4 * u, apexY - 6 * u, 2.8 * u, 7 * u);
      ctx.beginPath();
      ctx.moveTo(cx - 3 * u, apexY - 6 * u);
      ctx.quadraticCurveTo(cx - 4 * u, apexY - 12 * u, cx, apexY - 13 * u);
      ctx.quadraticCurveTo(cx + 4 * u, apexY - 12 * u, cx + 3 * u, apexY - 6 * u);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff2b0";
      ctx.beginPath(); ctx.arc(cx, apexY - 13 * u, 2 * u, 0, 7); ctx.fill();
      // fortified gate (yaguramon): white walls + dark curved roof, centered
      const gw = Math.min(cw * 0.30, ts * 0.9), gh = Math.max(ts * 0.5, PH * 0.13);
      const gx = cx - gw / 2, gy = baseY - baseH - gh + 2 * u;
      ctx.fillStyle = white;
      ctx.fillRect(gx, gy, gw, gh);
      ctx.fillStyle = black;
      ctx.fillRect(gx, gy, gw, Math.max(2, 2.4 * u));
      ctx.fillStyle = "#14101c";
      ctx.fillRect(gx + gw * 0.22, gy + gh * 0.30, gw * 0.56, gh * 0.70);
      ctx.beginPath(); ctx.arc(gx + gw / 2, gy + gh * 0.30, gw * 0.28, Math.PI, 0); ctx.fillStyle = "#14101c"; ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(gx + gw / 2 - 1 * u, gy + gh * 0.60, 2 * u, 2 * u);
      roofAt(gx - 4 * u, gy, gw + 8 * u, Math.min(ts * 0.34, gh * 0.5));
      // flanking white-turret annexes on wide plots
      if (cw > ts * 5.0) {
        for (const sgn of [-1, 1]) {
          const ax = sgn < 0 ? cx0 + 2 * u : cx0 + cw - 2 * u - cw * 0.16;
          const aw = cw * 0.16, ah = PH * 0.22, ay = baseY - baseH - ah;
          ctx.fillStyle = white;
          ctx.fillRect(ax, ay, aw, ah);
          ctx.fillStyle = black;
          ctx.fillRect(ax, ay, aw, Math.max(2, 2.4 * u));
          roofAt(ax - 2 * u, ay, aw + 4 * u, Math.min(ts * 0.3, ah * 0.4));
        }
      }
      // braziers + plaque
      for (const sgn of [-1, 1]) {
        const bx = cx + sgn * (gw / 2 + 8 * u);
        if (bx < cx0 + 2 || bx > cx0 + cw - 4) continue;
        ctx.fillStyle = "#3a3a44";
        ctx.fillRect(bx, baseY - 6 * u, 4 * u, 6 * u);
        ctx.fillStyle = "#ff9d2e";
        ctx.beginPath(); ctx.arc(bx + 2 * u, baseY - 7 * u, 2.6 * u, 0, 7); ctx.fill();
      }
      drawCastlePlaque(ctx, cx, baseY - baseH - 2 * u, cw * 0.6, ts, u, (b && b.title) || "Sakura Castle");
      void hr; void doorC;
      return true;
    } catch (e) { return false; }
  }
  // v8 bespoke: timber motte-and-bailey — log palisade, round timber towers
  // with conical roofs, small timber keep. The village seat of power.
  function drawMotteCastle(ctx, P) {
    try {
      const ts = P.ts, u = P.u, st = P.st || {}, ck = P.ck || "village_keep";
      const b = P.b || null;
      const hr = extRand(extHash("motte:" + (b && b.id ? String(b.id) : ck)));
      const px0 = (P.px0 != null ? P.px0 : P.hx), py0 = (P.py0 != null ? P.py0 : P.hy);
      const PW = (P.pW != null ? P.pW : P.hw), PH = (P.pH != null ? P.pH : P.hh);
      if (!(PW > 0 && PH > 0)) return false;
      const wallC = "#8a6a45", trimC = "#4a3320", roofC = "#a08040", ridgeC = "#e0bd76";
      const cw = PW * 0.86, cx0 = px0 + (PW - cw) / 2;
      const baseY = py0 + PH * 0.84;
      const ch = Math.min(PH * 0.62, ts * 2.6);
      const palY = baseY - ch * 0.55;
      // earth motte mound
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.beginPath(); ctx.ellipse(cx0 + cw / 2 + 2 * u, baseY + 2 * u, cw * 0.52, 6 * u, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#7a6a45";
      ctx.beginPath(); ctx.ellipse(cx0 + cw / 2, baseY, cw * 0.52, 7 * u, 0, 0, 7); ctx.fill();
      // log palisade (vertical pointed logs)
      const logW = Math.max(3 * u, ts * 0.12);
      for (let xx = cx0; xx < cx0 + cw - 1; xx += logW) {
        const lh = ch * 0.55 + hr() * ch * 0.08;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(xx + 1 * u, palY - lh + 2 * u, logW, lh);
        ctx.fillStyle = (Math.floor(xx / logW) % 2) ? "#7a5a35" : "#8a6a45";
        ctx.fillRect(xx, palY - lh, logW, lh);
        ctx.beginPath();
        ctx.moveTo(xx, palY - lh); ctx.lineTo(xx + logW / 2, palY - lh - 3 * u); ctx.lineTo(xx + logW, palY - lh);
        ctx.closePath(); ctx.fillStyle = "#9a7a4a"; ctx.fill();
      }
      ctx.fillStyle = trimC;
      ctx.fillRect(cx0, palY - ch * 0.30, cw, Math.max(1.6, 2 * u));
      // two round timber towers with conical thatch
      const twW = cw * 0.24;
      for (const tx of [cx0 + cw * 0.04, cx0 + cw * 0.96 - twW]) {
        const twH = ch * 0.78, twY = baseY - twH;
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(tx + 1.5 * u, twY + 2 * u, twW, twH);
        ctx.fillStyle = wallC;
        ctx.fillRect(tx, twY, twW, twH);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        for (let yy = twY + 4 * u; yy < twY + twH; yy += 6 * u) ctx.fillRect(tx, yy, twW, 1.4 * u);
        // conical roof
        ctx.fillStyle = roofC;
        ctx.beginPath();
        ctx.moveTo(tx - 2 * u, twY); ctx.lineTo(tx + twW / 2, twY - ch * 0.34); ctx.lineTo(tx + twW + 2 * u, twY);
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = Math.max(1.5, 2 * u); ctx.strokeStyle = trimC; ctx.stroke();
        ctx.fillStyle = ridgeC;
        ctx.fillRect(tx + twW / 2 - 1.2 * u, twY - ch * 0.34 - 4 * u, 2.4 * u, 5 * u);
        // slit glow
        ctx.fillStyle = "#ffd97a";
        ctx.fillRect(tx + twW / 2 - 1.4 * u, twY + twH * 0.35, 2.8 * u, 5 * u);
      }
      // timber keep behind the palisade
      const keepW = cw * 0.36, keepH = ch * 0.95;
      const keepX = cx0 + cw / 2 - keepW / 2, keepY = baseY - keepH;
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(keepX + 2 * u, keepY + 3 * u, keepW, keepH);
      castleWallCourses(ctx, keepX, keepY, keepW, keepH, ts, u, false, wallC, trimC, hr);
      const rhK = Math.min(keepH * 0.42, ts * 0.9);
      castleRoofSpire(ctx, keepX - 2 * u, keepY - rhK, keepW + 4 * u, Math.max(ts * 0.3, rhK), u, roofC, trimC, ridgeC, "thatch", true);
      castlePennant(ctx, keepX + keepW / 2 - 1 * u, keepY - rhK - 8 * u, Math.max(9 * u, ts * 0.5), u, "#c94e3a");
      // wooden gate with iron bands
      const gw = Math.min(keepW * 0.5, ts * 0.8), gh = Math.max(ts * 0.42, keepH * 0.30);
      const gx = keepX + keepW / 2 - gw / 2, gy = baseY - gh;
      ctx.fillStyle = trimC;
      ctx.fillRect(gx - 2 * u, gy - 2 * u, gw + 4 * u, gh + 2 * u);
      ctx.fillStyle = "#5a3a22";
      ctx.fillRect(gx, gy, gw, gh);
      ctx.fillStyle = "#2e2622";
      ctx.fillRect(gx, gy + gh * 0.3, gw, 1.6 * u);
      ctx.fillRect(gx, gy + gh * 0.65, gw, 1.6 * u);
      drawCastlePlaque(ctx, keepX + keepW / 2, gy, keepW, ts, u, (b && b.title) || "Village Keep");
      void st;
      return true;
    } catch (e) { return false; }
  }
  // v8 bespoke: an ACTUAL shrine — torii approach, stone lanterns, offering
  // hall with shimenawa + offering box on a stepped platform, honden behind.
  function drawTrueShrine(ctx, P) {
    try {
      const ts = P.ts, u = P.u, st = P.st || {}, ck = P.ck || "shrine";
      const b = P.b || null;
      const hr = extRand(extHash("shrine:" + (b && b.id ? String(b.id) : ck)));
      const px0 = (P.px0 != null ? P.px0 : P.hx), py0 = (P.py0 != null ? P.py0 : P.hy);
      const PW = (P.pW != null ? P.pW : P.hw), PH = (P.pH != null ? P.pH : P.hh);
      if (!(PW > 0 && PH > 0)) return false;
      const cx = px0 + PW / 2;
      const baseY = py0 + PH * 0.86;
      const cw = PW * 0.80, cx0 = cx - cw / 2;
      const verm = "#c0392b", dark = "#2b2118", wood = "#6a4a2e", roofC = "#2e3444";
      // gravel court
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(cx0 + 2 * u, baseY - PH * 0.30 + 2 * u, cw, PH * 0.30);
      ctx.fillStyle = "#c9bfa8";
      ctx.fillRect(cx0, baseY - PH * 0.30, cw, PH * 0.30);
      ctx.fillStyle = "rgba(120,100,80,0.4)";
      for (let i = 0; i < 14; i++) ctx.fillRect(cx0 + hr() * cw, baseY - PH * 0.30 + hr() * PH * 0.28, 2 * u, 1.4 * u);
      // stone steps to the hall
      const stW = Math.min(cw * 0.4, ts * 1.2);
      ctx.fillStyle = "#8a8a92";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(cx - stW / 2 - i * 2 * u, baseY - PH * 0.30 + 2 * u + i * 3 * u, stW + i * 4 * u, 3 * u);
      }
      const hallW = cw * 0.62, hallH = PH * 0.34;
      const hallX = cx - hallW / 2, hallY = baseY - PH * 0.30 - hallH;
      // honden (inner sanctuary) peeking behind
      const honW = hallW * 0.55, honH = hallH * 0.9;
      const honX = cx - honW / 2, honY = hallY - honH * 0.55;
      ctx.fillStyle = wood;
      ctx.fillRect(honX, honY, honW, honH);
      ctx.fillStyle = "#3a2c1e";
      ctx.fillRect(honX, honY, honW, 2.4 * u);
      // honden roof with chigi horns
      ctx.fillStyle = roofC;
      ctx.beginPath();
      ctx.moveTo(honX - 4 * u, honY);
      ctx.quadraticCurveTo(honX + honW * 0.25, honY - honH * 0.5, honX + honW / 2, honY - honH * 0.38);
      ctx.quadraticCurveTo(honX + honW * 0.75, honY - honH * 0.5, honX + honW + 4 * u, honY);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark;
      ctx.fillRect(honX + honW / 2 - 6 * u, honY - honH * 0.52, 3 * u, 8 * u);
      ctx.fillRect(honX + honW / 2 + 3 * u, honY - honH * 0.52, 3 * u, 8 * u);
      // offering hall: vermilion pillars, white walls, dark curved roof
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(hallX + 2 * u, hallY + 2 * u, hallW, hallH);
      ctx.fillStyle = "#f2ede2";
      ctx.fillRect(hallX, hallY, hallW, hallH);
      for (const px of [hallX + 2 * u, hallX + hallW - 4 * u, cx - 2 * u]) {
        ctx.fillStyle = verm;
        ctx.fillRect(px, hallY, 3.4 * u, hallH);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(px, hallY, 3.4 * u, 2 * u);
      }
      // shimenawa rope with shide paper across the front (below the name tablet)
      const ropeY = hallY + hallH * 0.52;
      ctx.strokeStyle = "#c9b98a"; ctx.lineWidth = Math.max(2.5, 4 * u);
      ctx.beginPath(); ctx.moveTo(hallX + 3 * u, ropeY); ctx.lineTo(hallX + hallW - 3 * u, ropeY); ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(hallX + 3 * u, ropeY + 1.5 * u, hallW - 6 * u, 1.6 * u);
      ctx.fillStyle = "#f2f2f2";
      for (const fx of [0.3, 0.5, 0.7]) {
        const fx0 = hallX + hallW * fx;
        ctx.save(); ctx.translate(fx0, ropeY); ctx.rotate(0.3);
        ctx.fillRect(-1.8 * u, -7 * u, 3.6 * u, 14 * u);
        ctx.restore();
      }
      // offering box (saisen-bako)
      const obW = Math.min(hallW * 0.44, ts * 0.8), obH = Math.max(6 * u, ts * 0.24);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(cx - obW / 2 + 1 * u, baseY - PH * 0.30 - obH + 2 * u, obW, obH);
      ctx.fillStyle = dark;
      ctx.fillRect(cx - obW / 2, baseY - PH * 0.30 - obH, obW, obH);
      ctx.fillStyle = "#8a6a45";
      for (let xx = cx - obW / 2 + 2 * u; xx < cx + obW / 2 - 1; xx += 4 * u) {
        ctx.fillRect(xx, baseY - PH * 0.30 - obH, 1.4 * u, obH);
      }
      // haiden roof (broad, curved, ridge horns)
      ctx.fillStyle = roofC;
      ctx.beginPath();
      ctx.moveTo(hallX - 5 * u, hallY);
      ctx.quadraticCurveTo(hallX + hallW * 0.25, hallY - hallH * 0.55, cx, hallY - hallH * 0.42);
      ctx.quadraticCurveTo(hallX + hallW * 0.75, hallY - hallH * 0.55, hallX + hallW + 5 * u, hallY);
      ctx.lineTo(hallX + hallW + 3 * u, hallY + 2 * u);
      ctx.lineTo(hallX - 3 * u, hallY + 2 * u);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark;
      ctx.fillRect(hallX - 6 * u, hallY - 4 * u, 4 * u, 5 * u);
      ctx.fillRect(hallX + hallW + 2 * u, hallY - 4 * u, 4 * u, 5 * u);
      // torii on the approach (hero element — stands tall on the court)
      const torW = Math.min(cw * 0.60, ts * 1.6);
      const torH = Math.max(16 * u, ts * 0.70);
      const torY = baseY - PH * 0.08;
      ctx.fillStyle = verm;
      ctx.fillRect(cx - torW / 2, torY - torH, 3 * u, torH);
      ctx.fillRect(cx + torW / 2 - 3 * u, torY - torH, 3 * u, torH);
      ctx.fillRect(cx - torW / 2 - 3 * u, torY - torH - 3 * u, torW + 6 * u, 3.2 * u);
      ctx.fillStyle = dark;
      ctx.fillRect(cx - torW / 2 - 3 * u, torY - torH - 5 * u, torW + 6 * u, 2.2 * u);
      ctx.fillStyle = verm;
      ctx.fillRect(cx - torW / 2 + 4 * u, torY - torH + 3 * u, torW - 8 * u, 1.6 * u);
      // stone lanterns flanking the steps
      for (const sgn of [-1, 1]) {
        const lx = cx + sgn * (stW / 2 + 7 * u);
        if (lx < cx0 + 2 || lx > cx0 + cw - 4) continue;
        const ly = baseY - PH * 0.30 + 4 * u;
        ctx.fillStyle = "#6a6a72";
        ctx.fillRect(lx - 2 * u, ly - 12 * u, 4 * u, 12 * u);
        ctx.fillStyle = "#55555c";
        ctx.fillRect(lx - 3.4 * u, ly - 14 * u, 6.8 * u, 2.4 * u);
        ctx.fillStyle = "#3a3a42";
        ctx.fillRect(lx - 2 * u, ly - 19 * u, 4 * u, 5 * u);
        ctx.fillStyle = "#ffd93d";
        ctx.fillRect(lx - 1.2 * u, ly - 18 * u, 2.4 * u, 3 * u);
        ctx.fillStyle = "rgba(255,220,120,0.30)";
        ctx.beginPath(); ctx.arc(lx, ly - 16.5 * u, 5 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#55555c";
        ctx.fillRect(lx - 3 * u, ly - 21 * u, 6 * u, 2 * u);
      }
      try {
        paintHouseEmblem(ctx, { hx: hallX, hy: honY, hw: hallW, hh: hallY - honY + hallH * 0.3, hcx: cx, ey: hallY, rh: hallH * 0.4, ts, u, st, ck, doorCX: cx, dy: baseY - PH * 0.30 });
      } catch (e) {}
      // name tablet under the eaves (above the rope, clear of the offering box)
      drawCastlePlaque(ctx, cx, hallY + hallH * 0.32, Math.max(hallW, torW) * 0.6, ts, u, (b && b.title) || "Shrine");
      void hr;
      return true;
    } catch (e) { return false; }
  }
  // Majestic front-elevation castle inside the plot. Returns true when handled.
  function drawCastleHouse(ctx, P) {
    try {
      const ts = P.ts, u = P.u, st = P.st || {}, ck = P.ck || "";
      const b = P.b || null;
      const idH = b && b.id ? String(b.id) : ck;
      const hr = extRand(extHash("castle:" + idH));
      const px0 = (P.px0 != null ? P.px0 : P.hx), py0 = (P.py0 != null ? P.py0 : P.hy);
      const PW = (P.pW != null ? P.pW : P.hw), PH = (P.pH != null ? P.pH : P.hh);
      if (!(PW > 0 && PH > 0)) return false;
      const sname = st.name || "shingle";
      // Norman + citadel masses are ashlar even though town style is timber.
      const stone = !!(b && b.wall === "STONEWALL") || ck === "town_keep" || ck === "city_citadel";
      const wallC = st.plaster || "#d8d8e0", trimC = st.trim || "#1e2448";
      const roofC = st.roof || "#3a4a8e", ridgeC = st.ridge || "#ffd93d", doorC = st.doorC || "#23233c";
      const R = (v) => Math.max(1, v * u);
      // ---- lighthouse: tall beacon tower + annex (own grammar, still in-plot) ----
      if (ck === "lighthouse") {
        const cw = PW * 0.86, cx0 = px0 + (PW - cw) / 2;
        const baseY = py0 + PH * 0.84;
        // Tiny 5-wide plots skip the side annexes so the shaft stays bold.
        const hasAnnex = cw >= ts * 4.2;
        const shaftW = Math.max(ts * 1.1, cw * (hasAnnex ? 0.30 : 0.44)), shaftX = cx0 + cw / 2 - shaftW / 2;
        const galY = py0 + 3 * u + ts * 0.55, shaftH = baseY - galY - ts * 0.5;
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(cx0 + 2 * u, baseY + 2 * u, cw, 5 * u);
        ctx.fillStyle = stone ? "#5a5a64" : "#7a6a55";
        ctx.fillRect(cx0 - 2 * u, baseY - 2 * u, cw + 4 * u, 6 * u);
        // annex sheds flanking the shaft (skipped on tiny plots)
        if (hasAnnex) for (const sgn of [-1, 1]) {
          const ax = sgn < 0 ? cx0 : cx0 + cw - cw * 0.24;
          const aw = cw * 0.24, ah = PH * 0.30, ay = baseY - ah;
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.fillRect(ax + 1.5 * u, ay + 2 * u, aw, ah);
          castleWallCourses(ctx, ax, ay, aw, ah, ts, u, stone, wallC, trimC, hr);
          ctx.fillStyle = roofC;
          ctx.beginPath();
          ctx.moveTo(ax - 2 * u, ay); ctx.lineTo(ax + aw / 2, ay - ah * 0.35); ctx.lineTo(ax + aw + 2 * u, ay);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = trimC; ctx.lineWidth = R(1.6); ctx.stroke();
          ctx.fillStyle = "#ffd97a";
          ctx.fillRect(ax + aw / 2 - 2 * u, ay + ah * 0.35, 4 * u, 5 * u);
        }
        // shaft with red bands
        castleWallCourses(ctx, shaftX, galY + ts * 0.5, shaftW, shaftH, ts, u, stone, "#e8e4da", trimC, hr);
        ctx.fillStyle = "#a03a2e";
        ctx.fillRect(shaftX, galY + ts * 0.5 + shaftH * 0.30, shaftW, Math.max(3, ts * 0.16));
        ctx.fillRect(shaftX, galY + ts * 0.5 + shaftH * 0.62, shaftW, Math.max(3, ts * 0.16));
        // gallery + lamp + dome
        ctx.fillStyle = trimC;
        ctx.fillRect(shaftX - 4 * u, galY + ts * 0.5 - 3 * u, shaftW + 8 * u, 4 * u);
        const lampW = shaftW * 0.66, lampX = shaftX + shaftW / 2 - lampW / 2, lampY = galY, lampH = ts * 0.5;
        const lgg = ctx.createLinearGradient(0, lampY, 0, lampY + lampH);
        lgg.addColorStop(0, "#fff8d0"); lgg.addColorStop(0.55, "#ffd93d"); lgg.addColorStop(1, "#c96a2e");
        ctx.fillStyle = lgg;
        ctx.fillRect(lampX, lampY, lampW, lampH);
        ctx.fillStyle = trimC;
        ctx.fillRect(shaftX + shaftW / 2 - u, lampY, 2 * u, lampH);
        ctx.fillStyle = roofC;
        ctx.beginPath();
        ctx.moveTo(lampX - 3 * u, lampY); ctx.lineTo(shaftX + shaftW / 2, lampY - ts * 0.30); ctx.lineTo(lampX + lampW + 3 * u, lampY);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,220,120,0.28)";
        ctx.beginPath(); ctx.arc(shaftX + shaftW / 2, lampY + lampH / 2, lampW * 0.8, 0, 7); ctx.fill();
        // glowing arrow slits up the shaft
        ctx.fillStyle = "#ffd97a";
        for (let i = 0; i < 3; i++) {
          const wy = galY + ts * 0.5 + shaftH * (0.18 + i * 0.20);
          ctx.fillRect(shaftX + shaftW / 2 - 1.4 * u, wy, 2.8 * u, 5 * u);
        }
        // gate arch at the shaft foot
        const gw = Math.min(shaftW * 0.52, ts * 0.6), gx = shaftX + shaftW / 2 - gw / 2, gy = baseY - ts * 0.42;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(gx - 2 * u, gy - 2 * u, gw + 4 * u, ts * 0.42 + 2 * u);
        ctx.fillStyle = doorC;
        ctx.fillRect(gx, gy, gw, ts * 0.42);
        ctx.beginPath(); ctx.arc(gx + gw / 2, gy, gw / 2, Math.PI, 0); ctx.fillStyle = doorC; ctx.fill();
        ctx.fillStyle = "#ffd93d";
        ctx.fillRect(gx + gw / 2 - 1 * u, gy + ts * 0.18, 2 * u, 2 * u);
        try { paintHouseEmblem(ctx, { hx: shaftX, hy: galY, hw: shaftW, hh: shaftH, hcx: shaftX + shaftW / 2, ey: galY + ts * 0.5, rh: ts * 0.5, ts, u, st, ck, doorCX: shaftX + shaftW / 2, dy: gy }); } catch (e) {}
        // plaque rides the walk below the gate (not on the narrow shaft).
        drawCastlePlaque(ctx, shaftX + shaftW / 2, baseY + 2 * u, Math.max(shaftW * 1.6, cw * 0.55), ts, u, (b && b.title) || ck);
        return true;
      }
      // ---- bespoke Kyoto tenshu + village motte (own grammars, still in-plot) ----
      if (ck === "sakura_castle") { if (drawTenshuCastle(ctx, P)) return true; }
      if (ck === "village_keep") { if (drawMotteCastle(ctx, P)) return true; }
      // ---- generic majestic castle (per-form silhouettes — never one shape) ----
      const form = castleFormFor(ck);
      const grand = (ck === "grand_castle" || ck === "castle_keep" || ck === "palace" || ck === "city_citadel");
      // flat-topped forts (Norman mass, kasbah merlons, canal/gilt/harbor parapets)
      const flatTop = (form === "norman" || form === "kasbah" || form === "canalfort" || form === "giltfort" || form === "seafort");
      // dome-crowned towers (canal teal, kasbah sand, gilt copper, harbor blue)
      const domeRoof = (form === "canalfort" || form === "kasbah" || form === "giltfort" || form === "seafort" || form === "ordos");
      const roofForm = domeRoof ? (form === "ordos" ? "felt" : form === "kasbah" ? "adobe" : "gilt") : sname;
      // gilt merchant domes read gold against the gray-blue ashlar
      const towerRoofC = (form === "giltfort") ? "#c9a227" : roofC;
      // Norman mass: one huge square keep, short corner turrets, no spires
      const normanMass = (form === "norman");
      // Small plots (5-8 tiles) get a bolder fill so the keep doesn't drown
      // in lawn: wider masses, taller gate, no fiddly turrets.
      const smallPlot = PW < ts * 7.2 || PH < ts * 6.2;
      const cw = PW * (ck === "grand_castle" ? 0.90 : grand ? 0.86 : smallPlot ? 0.88 : 0.82);
      const cx0 = px0 + (PW - cw) / 2;
      const baseY = py0 + PH * 0.84;
      const spireH = Math.min(PH * 0.30, ts * (grand ? 1.6 : 1.1));
      const topY = py0 + spireH + 2;
      const ch = Math.max(ts * 1.2, baseY - topY);
      const keepW = cw * (normanMass ? 0.46 : grand ? 0.36 : smallPlot ? 0.40 : 0.34), keepH = ch * (grand ? 0.98 : smallPlot ? 0.95 : 0.92);
      const keepX = cx0 + cw / 2 - keepW / 2, keepY = baseY - keepH;
      const towerW = cw * (normanMass ? 0.16 : smallPlot ? 0.22 : 0.20), towerH = ch * (normanMass ? 0.52 : smallPlot ? 0.72 : 0.68);
      const leftX = cx0 + cw * 0.015, rightX = cx0 + cw * 0.985 - towerW;
      const towerY = baseY - towerH;
      // Only true estates get outer turrets: small 5-7 tile plots stay a bold
      // 3-mass (keep + 2 towers) instead of 5 cramped slivers.
      const wide = cw > ts * 5.2 && PH > ts * 4.6;
      const turretW = wide ? cw * 0.12 : 0, turretH = wide ? ch * 0.46 : 0;
      const turL_X = cx0, turR_X = cx0 + cw - turretW;
      const turY = baseY - turretH;
      const curtH = ch * 0.34, curtY = baseY - curtH;
      // platform + steps
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.fillRect(cx0 - 2 * u + 2 * u, baseY + 2 * u, cw, 5 * u);
      ctx.fillStyle = stone ? "#5a5a64" : "#7a6a55";
      ctx.fillRect(cx0 - 2 * u, baseY - 1 * u, cw + 4 * u, 5 * u);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(cx0 - 2 * u, baseY - 1 * u, cw + 4 * u, 1.5 * u);
      // outer turrets (behind)
      if (wide) {
        for (const tx of [turL_X, turR_X]) {
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.fillRect(tx + 1.5 * u, turY + 2 * u, turretW, turretH);
          castleWallCourses(ctx, tx, turY, turretW, turretH, ts, u, stone, wallC, trimC, hr);
          castleBattlements(ctx, tx, turY, turretW, u, wallC, trimC);
          if (flatTop) { castleMerlons(ctx, tx, turY, turretW, u, wallC, trimC); }
          else { const rhT = Math.min(turretH * 0.5, ts * 0.55);
          castleRoofSpire(ctx, tx - 1 * u, turY - rhT, turretW + 2 * u, rhT, u, towerRoofC, trimC, ridgeC, roofForm, true); }
        }
      }
      // side towers
      for (const tx of [leftX, rightX]) {
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(tx + 1.5 * u, towerY + 2 * u, towerW, towerH);
        castleWallCourses(ctx, tx, towerY, towerW, towerH, ts, u, stone, wallC, trimC, hr);
        castleBattlements(ctx, tx, towerY, towerW, u, wallC, trimC);
        const rhT = Math.min(towerH * (flatTop ? 0.30 : 0.42), ts * 0.8);
        if (flatTop) { castleMerlons(ctx, tx, towerY, towerW, u, wallC, trimC); }
        else castleRoofSpire(ctx, tx - 1.5 * u, towerY - rhT, towerW + 3 * u, rhT, u, towerRoofC, trimC, ridgeC, roofForm, true);
        // tower flag (flat-topped forts fly the flag from a pole, not a spire tip)
        if (flatTop) castlePennant(ctx, tx + towerW / 2 - 1 * u, towerY - 12 * u, Math.max(7 * u, ts * 0.42), u, ridgeC);
        else castlePennant(ctx, tx + towerW / 2 - 1 * u, towerY - rhT - 7 * u, Math.max(7 * u, ts * 0.42), u, (ck === "castle_keep" || ck === "grand_castle") ? "#ffd93d" : ridgeC);
        // glowing slit + lancet (bolder so they read at plot scale)
        ctx.fillStyle = "#1a1210";
        ctx.fillRect(tx + towerW / 2 - 1.7 * u, towerY + towerH * 0.22, 3.4 * u, 8 * u);
        ctx.fillStyle = (sname === "iron" || sname === "cowl" || sname === "ironhide") ? "#ffb02e" : "#ffd97a";
        ctx.fillRect(tx + towerW / 2 - 1.7 * u, towerY + towerH * 0.22 + 1 * u, 3.4 * u, 3.6 * u);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(tx + towerW / 2 - 3.5 * u - 1 * u, towerY + towerH * 0.55 - 1 * u, 7 * u + 2 * u, 9 * u + 2 * u);
        ctx.fillStyle = (sname === "iron" || sname === "ironhide") ? "#ffb02e" : "#ffe9a0";
        ctx.fillRect(tx + towerW / 2 - 3.5 * u, towerY + towerH * 0.55, 7 * u, 9 * u);
        ctx.fillStyle = trimC;
        ctx.fillRect(tx + towerW / 2 - 1 * u, towerY + towerH * 0.55, 2 * u, 8 * u);
      }
      // curtain walls (keep <-> towers) with slits
      const curtL0 = leftX + towerW - 1 * u, curtL1 = keepX + 1 * u;
      const curtR0 = keepX + keepW - 1 * u, curtR1 = rightX + 1 * u;
      for (const c0c1 of [[curtL0, curtL1], [curtR0, curtR1]]) {
        const c0 = c0c1[0], c1 = c0c1[1];
        if (c1 - c0 < 4 * u) continue;
        ctx.fillStyle = "rgba(0,0,0,0.26)";
        ctx.fillRect(c0 + 1.5 * u, curtY + 2 * u, c1 - c0, curtH);
        castleWallCourses(ctx, c0, curtY, c1 - c0, curtH, ts, u, stone, wallC, trimC, hr);
        castleBattlements(ctx, c0, curtY, c1 - c0, u, wallC, trimC);
        ctx.fillStyle = "#1a1210";
        const nsl = Math.max(1, Math.floor((c1 - c0) / (10 * u)));
        for (let i = 0; i < nsl; i++) {
          const sx = c0 + (c1 - c0) * (i + 0.5) / nsl;
          ctx.fillRect(sx - 1.2 * u, curtY + curtH * 0.45, 2.4 * u, 6 * u);
        }
      }
      // central keep (front)
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(keepX + 2 * u, keepY + 3 * u, keepW, keepH);
      castleWallCourses(ctx, keepX, keepY, keepW, keepH, ts, u, stone, wallC, trimC, hr);
      // mid band for tall keeps
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(keepX - 1 * u, keepY + keepH * 0.52, keepW + 2 * u, Math.max(2, 3 * u));
      ctx.fillStyle = trimC;
      ctx.fillRect(keepX - 1 * u, keepY + keepH * 0.52, keepW + 2 * u, Math.max(1.5, 2 * u));
      castleBattlements(ctx, keepX, keepY, keepW, u, wallC, trimC);
      if (flatTop) castleMerlons(ctx, keepX, keepY, keepW, u, wallC, trimC);
      const keepRh = Math.min(keepH * 0.42, topY - py0 + spireH - 2, ts * (grand ? 1.9 : 1.5));
      const keepRoofY = keepY - Math.max(ts * 0.34, keepRh);
      if (flatTop) { /* crenellated crown stands on its own — no spire */ }
      else castleRoofSpire(ctx, keepX - 2 * u, keepRoofY, keepW + 4 * u, Math.max(ts * 0.3, keepRh), u, roofC, trimC, ridgeC, roofForm, true);
      // main pennant on the keep (pole on flat tops, spire tip otherwise)
      if (flatTop) { ctx.fillStyle = trimC; ctx.fillRect(keepX + keepW / 2 - 1 * u, keepY - 14 * u, 2 * u, 14 * u); castlePennant(ctx, keepX + keepW / 2 + 1 * u, keepY - 14 * u, Math.max(9 * u, ts * 0.5), u, "#ffd93d"); }
      else castlePennant(ctx, keepX + keepW / 2 - 1 * u, keepRoofY - 8 * u, Math.max(9 * u, ts * 0.5), u, sname === "iron" ? "#ff9d2e" : "#ffd93d");
      // Norman corner pilasters: flat square mass reads Romanesque, not spired
      if (normanMass) {
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(keepX + 2 * u, keepY, Math.max(3, ts * 0.12), keepH);
        ctx.fillStyle = "rgba(0,0,0,0.20)";
        ctx.fillRect(keepX + keepW - Math.max(3, ts * 0.16), keepY, Math.max(3, ts * 0.16), keepH);
        // tiny round-arched Norman windows high on the keep
        ctx.fillStyle = "#1a1210";
        for (const sgn of [-1, 1]) {
          const wx = keepX + keepW / 2 + sgn * keepW * 0.22;
          ctx.fillRect(wx - 2.4 * u, keepY + keepH * 0.20, 4.8 * u, 8 * u);
          ctx.beginPath(); ctx.arc(wx, keepY + keepH * 0.20, 2.4 * u, Math.PI, 0); ctx.fillStyle = "#1a1210"; ctx.fill();
          ctx.fillStyle = "#ffe9a0";
          ctx.fillRect(wx - 2.4 * u, keepY + keepH * 0.20 + 2 * u, 4.8 * u, 3 * u);
          ctx.fillStyle = "#1a1210";
        }
      }
      // keep windows: rose for the city citadel, slits + glow otherwise (temples
      // are no longer castles — only the citadel earns the rose)
      const holyK = (ck === "city_citadel");
      if (holyK && keepW > ts * 0.8) {
        const rw = Math.min(ts * 0.34, keepW * 0.20);
        const rx = keepX + keepW / 2, ry = keepY + keepH * 0.24;
        ctx.fillStyle = trimC;
        ctx.beginPath(); ctx.arc(rx, ry, rw + 2 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#ffe9a0";
        ctx.beginPath(); ctx.arc(rx, ry, rw, 0, 7); ctx.fill();
        ctx.strokeStyle = trimC; ctx.lineWidth = R(1.4);
        ctx.beginPath(); ctx.arc(rx, ry, rw * 0.55, 0, 7); ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(a) * rw, ry + Math.sin(a) * rw); ctx.stroke();
        }
      }
      // culture bands on the keep face (felt red sash, adobe/terrace vigas)
      if (sname === "felt") {
        ctx.fillStyle = "#c94e3a";
        ctx.fillRect(keepX, keepY + keepH * 0.16, keepW, Math.max(2.5, 4 * u));
        ctx.fillRect(keepX, keepY + keepH * 0.82, keepW, Math.max(2.5, 4 * u));
        ctx.fillStyle = "#efe8d6";
        for (let xx = keepX + 3 * u; xx < keepX + keepW - 2 * u; xx += 8 * u) {
          ctx.save(); ctx.translate(xx, keepY + keepH * 0.16 + 2 * u); ctx.rotate(Math.PI / 4);
          ctx.fillRect(-1.6 * u, -1.6 * u, 3.2 * u, 3.2 * u); ctx.restore();
        }
      }
      if (sname === "adobe" || sname === "terrace") {
        ctx.fillStyle = trimC;
        const vy = keepY + keepH * 0.30;
        for (let xx = keepX + 5 * u; xx < keepX + keepW - 3 * u; xx += Math.max(9 * u, ts * 0.34)) {
          ctx.beginPath(); ctx.arc(xx, vy, Math.max(1.6, 2.2 * u), 0, 7); ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath(); ctx.arc(xx, vy, Math.max(1, 1.2 * u), 0, 7); ctx.fill();
          ctx.fillStyle = trimC;
        }
      }
      if (sname === "snowpine") {
        ctx.fillStyle = "rgba(235,244,252,0.55)";
        ctx.fillRect(keepX, keepY + keepH * 0.52, keepW, 1.6 * u);
        ctx.fillStyle = "rgba(120,150,170,0.5)";
        for (let i = 0; i < 5; i++) ctx.fillRect(keepX + hr() * keepW, keepY + keepH * 0.6 + hr() * keepH * 0.3, 2 * u, 1.4 * u);
      }
      for (const wyF of [0.42, 0.62]) {
        const ww = Math.min(ts * 0.36, keepW * 0.19), wh = ww * 1.6;
        for (const sgn of [-1, 1]) {
          const wx = keepX + keepW / 2 + sgn * keepW * 0.22 - ww / 2;
          const wy = keepY + keepH * wyF;
          if (wx < keepX + 2 || wx + ww > keepX + keepW - 2) continue;
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fillRect(wx - 1.2 * u, wy - 1.2 * u, ww + 2.4 * u, wh + 2.4 * u);
          ctx.fillStyle = (sname === "iron" || sname === "cowl") ? "#ffb02e" : "#ffd97a";
          ctx.fillRect(wx, wy, ww, wh);
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillRect(wx, wy, ww, wh * 0.3);
          ctx.fillStyle = trimC;
          ctx.fillRect(wx + ww / 2 - u, wy, 2 * u, wh);
        }
      }
      // banners on the keep face
      if (keepW > ts * 1.1) {
        const bw = Math.max(6 * u, ts * 0.24), bh = Math.max(12 * u, ts * 0.5);
        const by = keepY + keepH * 0.58;
        const bcol = sname === "tile" ? "#1e2438" : sname === "iron" ? "#23232c" : sname === "crown" ? "#1e2448" : trimC;
        castleBanner(ctx, keepX + keepW * 0.12, by, bw, bh, u, bcol, ridgeC);
        castleBanner(ctx, keepX + keepW * 0.88 - bw, by, bw, bh, u, bcol, ridgeC);
      }
      // gatehouse: protruding arch + portcullis + steps
      const gw = Math.min(keepW * 0.54, ts * (grand ? 1.2 : 1.0)), gh = Math.max(ts * 0.55, keepH * 0.34);
      const gx = keepX + keepW / 2 - gw / 2, gy = baseY - gh;
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.fillRect(gx + 1.5 * u, gy + 2 * u, gw, gh + 2 * u);
      ctx.fillStyle = stone ? "#6a6a76" : trimC;
      ctx.fillRect(gx - 3 * u, gy - 2 * u, gw + 6 * u, gh + 2 * u);
      ctx.fillStyle = wallC;
      ctx.fillRect(gx, gy, gw, gh);
      // arch mouth
      ctx.fillStyle = "#14101c";
      ctx.fillRect(gx + 1.5 * u, gy + gh * 0.25, gw - 3 * u, gh * 0.75);
      ctx.beginPath(); ctx.arc(gx + gw / 2, gy + gh * 0.25, (gw - 3 * u) / 2, Math.PI, 0); ctx.fillStyle = "#14101c"; ctx.fill();
      // portcullis
      ctx.fillStyle = "rgba(160,160,170,0.9)";
      for (let xx = gx + 3 * u; xx < gx + gw - 2 * u; xx += 3.4 * u) ctx.fillRect(xx, gy + gh * 0.22, 1.4 * u, gh * 0.78);
      ctx.fillRect(gx + 1.5 * u, gy + gh * 0.55, gw - 3 * u, 1.6 * u);
      // glowing gate lanterns
      for (const sgn of [-1, 1]) {
        const lx = gx + (sgn < 0 ? -5 * u : gw + 3 * u);
        ctx.fillStyle = "#23232c";
        ctx.fillRect(lx, gy + gh * 0.35, 3.4 * u, 5 * u);
        ctx.fillStyle = "#ffd97a";
        ctx.fillRect(lx + 0.7 * u, gy + gh * 0.35 + 1 * u, 2 * u, 3 * u);
        ctx.fillStyle = "rgba(255,200,90,0.22)";
        ctx.beginPath(); ctx.arc(lx + 1.7 * u, gy + gh * 0.35 + 2.5 * u, 5 * u, 0, 7); ctx.fill();
      }
      // braziers flanking the gate
      for (const sgn of [-1, 1]) {
        const bx = gx + (sgn < 0 ? -9 * u : gw + 7 * u);
        if (bx < cx0 + 2 || bx > cx0 + cw - 4) continue;
        ctx.fillStyle = "#3a3a44";
        ctx.fillRect(bx, baseY - 6 * u, 4 * u, 6 * u);
        ctx.fillStyle = "#ff9d2e";
        ctx.beginPath(); ctx.arc(bx + 2 * u, baseY - 7 * u, 2.6 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#ffd93d";
        ctx.beginPath(); ctx.arc(bx + 2 * u, baseY - 7 * u, 1.3 * u, 0, 7); ctx.fill();
      }
      // class emblem on the keep + name plaque on the gate
      try {
        paintHouseEmblem(ctx, { hx: keepX, hy: keepRoofY, hw: keepW, hh: keepY - keepRoofY + keepH * 0.4, hcx: keepX + keepW / 2, ey: keepY, rh: Math.max(ts * 0.3, keepRh), ts, u, st, ck, doorCX: keepX + keepW / 2, dy: gy });
      } catch (e) {}
      drawCastlePlaque(ctx, keepX + keepW / 2, gy, keepW, ts, u, (b && b.title) || ck);
      // enemy menace crowns: horns / skulls / spikes on the keep roofline
      try { drawCastleMenace(ctx, keepX, keepY, keepW, towerY, ts, u, ck, trimC); } catch (e) {}
      // culture crowns: felt tugs, terrace inlay, ice crystals, iron spikes,
      // tide columns, torii, sun disc, bazaar coins — what makes each culture
      // read at a glance instead of same-castle-different-paint.
      try { drawCastleCulture(ctx, keepX, keepY, keepW, keepH, gx, gy, gw, baseY, cx0, cw, ts, u, ck, sname, ridgeC, hr); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  function drawCastlePlaque(ctx, cx, gy, keepW, ts, u, label) {
    try {
      const fs = Math.max(8, Math.min(ts * 0.30, (keepW * 0.9) / Math.max(4, String(label).length * 0.58)));
      ctx.font = "bold " + Math.round(fs) + "px sans-serif";
      const pwS = Math.min(keepW * 1.1, ctx.measureText(label).width + 12 * u);
      const phS = fs + 7 * u, px = cx - pwS / 2;
      let py = gy - phS - 5 * u;
      if (py < 0) py = gy + 2 * u;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(px + 1.5 * u, py + 2 * u, pwS, phS);
      ctx.fillStyle = "#4a3320";
      ctx.fillRect(px, py, pwS, phS);
      ctx.fillStyle = "#6b4e2e";
      ctx.fillRect(px + 1.5 * u, py + 1.5 * u, pwS - 3 * u, phS - 3 * u);
      ctx.strokeStyle = "#c9a86a"; ctx.lineWidth = 1.2;
      ctx.strokeRect(px + 0.5, py + 0.5, pwS - 1, phS - 1);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffe9b0";
      ctx.fillText(label, cx, py + phS / 2 + 1);
      ctx.textBaseline = "alphabetic";
    } catch (e) {}
  }
  function drawCastleMenace(ctx, keepX, keepY, keepW, towerY, ts, u, ck, trimC) {
    const cx = keepX + keepW / 2;
    if (ck === "bull_hall") {
      ctx.fillStyle = "#e8dcc0";
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + sgn * keepW * 0.18, keepY - 2 * u);
        ctx.quadraticCurveTo(cx + sgn * keepW * 0.42, keepY - 12 * u, cx + sgn * keepW * 0.30, keepY - 16 * u);
        ctx.lineTo(cx + sgn * keepW * 0.24, keepY - 10 * u);
        ctx.closePath(); ctx.fill();
      }
    } else if (ck === "wight_throne") {
      ctx.fillStyle = "rgba(127,212,255,0.9)";
      for (const fx of [0.2, 0.5, 0.8]) {
        const fx0 = keepX + keepW * fx;
        ctx.beginPath(); ctx.arc(fx0, keepY - 4 * u, 2.4 * u, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(fx0 + 1.5 * u, keepY - 9 * u, 3 * u, 0, 7); ctx.fill();
      }
    } else if (ck === "orc_hall") {
      // bigger war-tusks + iron jaw band
      ctx.fillStyle = "#e8ecf2";
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + sgn * keepW * 0.10, keepY + 1 * u);
        ctx.lineTo(cx + sgn * keepW * 0.26, keepY - 14 * u);
        ctx.lineTo(cx + sgn * keepW * 0.32, keepY + 1 * u);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#8a8f9a";
        ctx.fillRect(cx + sgn * keepW * 0.26 - 1 * u, keepY - 14 * u, 2 * u, 3 * u);
        ctx.fillStyle = "#e8ecf2";
      }
      ctx.fillStyle = "#1a1210";
      ctx.fillRect(cx - keepW * 0.30, keepY - 4 * u, keepW * 0.60, 3 * u);
    } else if (ck === "pit_chapel" || ck === "dark_cell") {
      ctx.fillStyle = "#ff3b3b";
      ctx.beginPath(); ctx.arc(cx, keepY - 5 * u, 2.2 * u, 0, 7); ctx.fill();
    } else if (ck === "moss_hall" || ck === "troll_hovel") {
      // moss beard + hanging vines on the roofline
      ctx.fillStyle = "rgba(90,170,90,0.9)";
      for (const fx of [0.15, 0.35, 0.55, 0.75]) {
        const fx0 = keepX + keepW * fx;
        ctx.fillRect(fx0 - 1.6 * u, keepY - 2 * u, 3.2 * u, (5 + (fx * 7) % 5) * u);
        ctx.beginPath(); ctx.arc(fx0, keepY - 2 * u + (5 + (fx * 7) % 5) * u, 2.2 * u, 0, 7); ctx.fill();
      }
    } else if (ck === "alpha_mound" || ck === "gnoll_hide" || ck === "bone_pile") {
      // bone arch: ribcage over the keep
      ctx.strokeStyle = "#e8e4d8"; ctx.lineWidth = Math.max(1.6, 2.2 * u);
      ctx.beginPath(); ctx.arc(cx, keepY + 2 * u, keepW * 0.30, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = "#e8e4d8";
      for (const fx of [0.28, 0.5, 0.72]) {
        ctx.fillRect(keepX + keepW * fx - 1 * u, keepY - keepW * 0.22, 2 * u, keepW * 0.22);
      }
    } else if (ck === "kobold_nook" || ck === "scrap_workshop") {
      // scrap crown: gear teeth + rivets
      ctx.fillStyle = "#8a5a33";
      for (let i = 0; i < 5; i++) {
        const gx0 = keepX + keepW * (0.2 + i * 0.15);
        ctx.fillRect(gx0 - 1.6 * u, keepY - 6 * u, 3.2 * u, 5 * u);
      }
      ctx.fillStyle = "#3a3a44";
      ctx.fillRect(keepX + keepW * 0.15, keepY - 2.5 * u, keepW * 0.70, 2.5 * u);
      ctx.fillStyle = "#ff9d2e";
      ctx.fillRect(keepX + keepW * 0.5 - 1.5 * u, keepY - 6 * u, 3 * u, 3 * u);
    } else if (ck === "matriarch_perch" || ck === "rookery") {
      // sky wings: feathered pinions on the keep
      ctx.fillStyle = "#c0e0f0";
      for (const sgn of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(cx + sgn * (keepW * 0.18 + i * 4 * u), keepY - (4 + i * 3) * u, 4.5 * u, 2 * u, sgn * 0.5, 0, 7);
          ctx.fill();
        }
      }
    }
  }
  // Culture crowns: the at-a-glance read that separates same-grammar castles.
  function drawCastleCulture(ctx, keepX, keepY, keepW, keepH, gx, gy, gw, baseY, cx0, cw, ts, u, ck, sname, ridgeC, hr) {
    const cx = keepX + keepW / 2;
    if (sname === "felt" || ck === "khan_hall") {
      // horsehair tug standards flanking the gate (steppe majesty)
      for (const sgn of [-1, 1]) {
        const px = gx + (sgn < 0 ? -12 * u : gw + 10 * u);
        if (px < cx0 + 2 || px > cx0 + cw - 2) continue;
        ctx.fillStyle = "#4a3a22";
        ctx.fillRect(px, gy - keepH * 0.55, 2.2 * u, keepH * 0.55 + (baseY - gy));
        ctx.fillStyle = "#c94e3a";
        ctx.fillRect(px - 2 * u, gy - keepH * 0.55, 6 * u, 4 * u);
        ctx.fillStyle = "#1a1210";
        for (let i = 0; i < 4; i++) ctx.fillRect(px - 1.5 * u, gy - keepH * 0.55 + 5 * u + i * 3 * u, 5 * u, 2 * u);
        ctx.fillStyle = "#ffd93d";
        ctx.beginPath(); ctx.arc(px + 1.1 * u, gy - keepH * 0.55 - 2 * u, 2.4 * u, 0, 7); ctx.fill();
      }
    }
    if (sname === "terrace") {
      // turquoise inlay band + wall ladder to the roof terrace
      ctx.fillStyle = "#2ba8a0";
      ctx.fillRect(keepX + 2 * u, keepY + keepH * 0.68, keepW - 4 * u, Math.max(2, 3 * u));
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let xx = keepX + 4 * u; xx < keepX + keepW - 3 * u; xx += 7 * u) ctx.fillRect(xx, keepY + keepH * 0.68, 2 * u, Math.max(2, 3 * u));
      const lxx = keepX + keepW - Math.max(7 * u, ts * 0.30);
      ctx.fillStyle = "#5e3a22";
      ctx.fillRect(lxx, keepY + keepH * 0.15, 2.2 * u, keepH * 0.5);
      ctx.fillRect(lxx + Math.max(5 * u, ts * 0.16), keepY + keepH * 0.15, 2.2 * u, keepH * 0.5);
      for (let yy = keepY + keepH * 0.20; yy < keepY + keepH * 0.60; yy += Math.max(4 * u, ts * 0.14)) {
        ctx.fillRect(lxx, yy, Math.max(5 * u, ts * 0.16) + 2.2 * u, 1.6 * u);
      }
    }
    if (sname === "snowpine" || ck === "ice_hall") {
      // ice crystals on the keep roofline
      ctx.fillStyle = "rgba(191,233,255,0.95)";
      for (const fx of [0.15, 0.35, 0.65, 0.85]) {
        const fx0 = keepX + keepW * fx;
        ctx.beginPath();
        ctx.moveTo(fx0 - 2 * u, keepY); ctx.lineTo(fx0, keepY - (6 + hr() * 6) * u); ctx.lineTo(fx0 + 2 * u, keepY);
        ctx.closePath(); ctx.fill();
      }
    }
    if (sname === "iron" || sname === "ironhide" || ck === "great_hall") {
      // forge spikes along the keep battlements + bigger ember braziers
      ctx.fillStyle = "#1a1a20";
      for (let xx = keepX + 3 * u; xx < keepX + keepW - 2 * u; xx += 9 * u) {
        ctx.beginPath();
        ctx.moveTo(xx, keepY - 3 * u); ctx.lineTo(xx + 1.8 * u, keepY - 9 * u); ctx.lineTo(xx + 3.6 * u, keepY - 3 * u);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = "rgba(255,140,40,0.9)";
      for (const sgn of [-1, 1]) {
        const bx = gx + (sgn < 0 ? -9 * u : gw + 7 * u);
        if (bx < cx0 + 2 || bx > cx0 + cw - 4) continue;
        ctx.beginPath(); ctx.arc(bx + 2 * u, baseY - 8 * u, 3.4 * u, 0, 7); ctx.fill();
      }
    }
    if (ck === "tide_keep" || ck === "tide_temple" || sname === "canal" || sname === "coil" || sname === "harbor") {
      // shell roundel above the gate + flanking columns
      const sx = cx, sy = gy - Math.max(8 * u, ts * 0.30);
      ctx.fillStyle = "#e8a0c0";
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(4 * u, ts * 0.20), Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#59d6d6";
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(2 * u, ts * 0.10), 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath(); ctx.arc(sx - 2 * u, sy - 2 * u, 1.4 * u, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(gx - 5 * u, gy, 3 * u, baseY - gy);
      ctx.fillRect(gx + gw + 2 * u, gy, 3 * u, baseY - gy);
    }
    if (ck === "shrine" || sname === "tile") {
      // vermilion torii standing over the gate walk
      const tx0 = gx - 6 * u, tx1 = gx + gw + 6 * u, ty = baseY - 1 * u, th = Math.max(10 * u, ts * 0.42);
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(tx0, ty - th, 3 * u, th);
      ctx.fillRect(tx1 - 3 * u, ty - th, 3 * u, th);
      ctx.fillRect(tx0 - 3 * u, ty - th - 3 * u, (tx1 - tx0) + 6 * u, 3.4 * u);
      ctx.fillStyle = "#2b2118";
      ctx.fillRect(tx0 - 3 * u, ty - th - 5.4 * u, (tx1 - tx0) + 6 * u, 2.4 * u);
    }
    if (ck === "sun_keep" || ck === "sun_temple" || sname === "adobe") {
      // sun disc above the gate + obelisks flanking the court
      const sx = cx, sy = gy - Math.max(9 * u, ts * 0.34);
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(4 * u, ts * 0.20), 0, 7); ctx.fill();
      ctx.fillStyle = "#c96a2e";
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(1.8 * u, ts * 0.09), 0, 7); ctx.fill();
      ctx.strokeStyle = "#ffd93d"; ctx.lineWidth = Math.max(1.2, 1.8 * u);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * (Math.max(4 * u, ts * 0.20) + 1 * u), sy + Math.sin(a) * (Math.max(4 * u, ts * 0.20) + 1 * u));
        ctx.lineTo(sx + Math.cos(a) * (Math.max(4 * u, ts * 0.20) + 4 * u), sy + Math.sin(a) * (Math.max(4 * u, ts * 0.20) + 4 * u)); ctx.stroke();
      }
    }
    if (ck === "gilt_keep" || ck === "grand_bazaar" || sname === "gilt") {
      // twin coins + gilt finials (trade majesty)
      for (const sgn of [-1, 1]) {
        const bx = cx + sgn * keepW * 0.28, by = keepY + keepH * 0.10;
        ctx.fillStyle = "#8a6a1a";
        ctx.beginPath(); ctx.arc(bx, by, Math.max(3.5 * u, ts * 0.16), 0, 7); ctx.fill();
        ctx.fillStyle = "#ffd93d";
        ctx.beginPath(); ctx.arc(bx, by, Math.max(2.4 * u, ts * 0.11), 0, 7); ctx.fill();
        ctx.fillStyle = "#8a6a1a";
        ctx.fillRect(bx - 1 * u, by - 3 * u, 2 * u, 5 * u);
      }
    }
    if (ck === "harbor_keep" || ck === "lighthouse" || ck === "harbor_office" || ck === "sail_loft") {
      // anchor + rope coils by the gate
      const ax = gx + gw + 6 * u;
      if (ax > cx0 + 2 && ax < cx0 + cw - 6) {
        ctx.strokeStyle = "#2a4a55"; ctx.lineWidth = Math.max(1.5, 2 * u);
        ctx.beginPath(); ctx.moveTo(ax, gy + 2 * u); ctx.lineTo(ax, gy + 12 * u); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax, gy + 13 * u, 4 * u, 0.3, Math.PI - 0.3); ctx.stroke();
      }
      // beacon lamp on the seafort's taller tower
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.arc(cx0 + cw - keepW * 0.2, keepY - 4 * u, 2.6 * u, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,220,120,0.25)";
      ctx.beginPath(); ctx.arc(cx0 + cw - keepW * 0.2, keepY - 4 * u, 5.5 * u, 0, 7); ctx.fill();
    }
    if (ck === "town_keep") {
      // royal rose + gold heart on the Norman mass (the citadel earns the
      // full traceried rose in the keep-window pass instead)
      ctx.fillStyle = "#c0392b";
      ctx.beginPath(); ctx.arc(cx, keepY + keepH * 0.14, Math.max(3 * u, ts * 0.13), 0, 7); ctx.fill();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.arc(cx, keepY + keepH * 0.14, Math.max(1.4 * u, ts * 0.06), 0, 7); ctx.fill();
    }
  }

  function drawHouse(ctx, P) {
    // Majestic castles first: keep / towers / curtain / gatehouse grammar.
    try {
      const _ck0 = (P && P.ck) || "";
      if (isTrueCastleKey(_ck0)) { if (drawCastleHouse(ctx, P)) return; }
      // Actual shrine: never a gabled house — torii + offering hall + honden.
      if (_ck0 === "shrine" || _ck0 === "spirit_shrine" || _ck0 === "sky_shrine") { if (drawTrueShrine(ctx, P)) return; }
    } catch (e) {}
    let hx = P.hx, hy = P.hy, hw = P.hw, hh = P.hh;
    const ts = P.ts, u = P.u, st = P.st, ck = P.ck || "";
    // lighthouse reads as a tower shaft: narrow the mass so the gable goes
    // steep and the beacon dormer below owns the roof (all stays in-plot —
    // paint above the plot rect would be overdrawn by northern neighbours).
    if (ck === "lighthouse") { const _nw = Math.min(hw, ts * 2.6); hx += (hw - _nw) / 2; hw = _nw; }
    const b = P.b || null;
    const idH = b && b.id ? String(b.id) : ck;
    const hr = extRand(extHash("house:" + idH));
    const R = (v) => Math.max(1, v * u);
    const stone = (b && b.wall === "STONEWALL");
    const japan = (st.name === "tile");
    const holy = (ck === "chapel" || ck === "church" || ck === "cathedral" || ck === "rune_chapel" || ck === "shrine" || ck === "tide_temple" || ck === "bone_chapel" || ck === "pit_chapel" || ck === "spirit_shrine" || ck === "barrow_mound" || ck === "sun_temple" || ck === "high_temple" || ck === "kiva" || ck === "sky_shrine" || ck === "runestone_hut" || ck === "halo_chapel" || ck === "dawn_church" || ck === "radiant_cathedral");
    const forgeCls = (ck === "forge" || ck === "forge_works" || ck === "great_forge" || ck === "smithy_shed" || ck === "bronze_forge" || ck === "scrap_workshop" || ck === "dawn_smithy" || ck === "dawn_forge");
    const hallCls = (ck === "mead_hall" || ck === "great_hall" || ck === "bull_hall" || ck === "moss_hall" || ck === "orc_hall" || ck === "wight_throne" || ck === "matriarch_perch" || ck === "kobold_nook" || ck === "alpha_mound" || ck === "khan_hall" || ck === "terrace_hall" || ck === "ice_hall" || ck === "palace" || ck === "castle_keep" || ck === "chancery" || ck === "courthouse" || ck === "city_watch" || ck === "tavern_hall" || ck === "caravanserai");
    const shopCls = (ck === "shop" || ck === "market" || ck === "sunlit_market" || ck === "warehouse" || ck === "storehouse" || ck === "moss_cache" || ck === "loot_house" || ck === "scrap_heap" || ck === "bone_pile" || ck === "ossuary" || ck === "egg_vault" || ck === "cairn" || ck === "souk_stall" || ck === "grand_bazaar" || ck === "fish_market" || ck === "turquoise_shop" || ck === "counting_house" || ck === "trade_warehouse" || ck === "sail_loft" || ck === "harbor_office");
    const tentCls = (ck === "war_tent" || ck === "brigand_tent" || ck === "goblin_hut" || ck === "orc_hut" || ck === "gnoll_hide" || ck === "kobold_burrow" || ck === "troll_hovel" || ck === "coil_den" || ck === "maze_cell" || ck === "dark_cell" || ck === "rookery" || ck === "nest_platform" || ck === "warg_pen" || ck === "lookout" || ck === "ger" || ck === "horse_pen");
    const stableCls = (ck === "stable" || isBeastLodgeKey(ck));
    const twoStory = (hh > ts * 2.0) || ck === "townhouse" || ck === "inn" || ck === "cloud_inn" || ck === "guildhall" || ck === "manor" || ck === "dawn_manor" || ck === "cathedral" || ck === "radiant_cathedral" || ck === "dawn_church" || ck === "forge_works" || ck === "tide_temple" || ck === "palace" || ck === "castle_keep" || ck === "high_temple" || ck === "grand_bazaar" || ck === "counting_house" || ck === "merchant_villa" || ck === "noble_villa" || ck === "chancery" || ck === "harbor_office" || ck === "lighthouse" || ck === "caravanserai";
    // ---- cultural roof/wall families (Phase B distinctiveness) ----
    const adobe = (st.name === "adobe");       // desert: flat roofs + parapets + vigas
    const felt = (st.name === "felt");         // steppe: white felt + red trim + tassels
    const terrace = (st.name === "terrace");   // mesa: stepped tiers + vigas + ladders
    const snowpine = (st.name === "snowpine"); // frost: steep roofs + snow + icicles
    // ---- bespoke painters: round yurt + open corral (never a gabled box) ----
    if (ck === "ger") {
      const gcx = hx + hw / 2, gy0 = hy + hh;
      const gr = Math.min(hw * 0.44, hh * 0.52);
      const gcy = gy0 - gr * 0.95;
      // ground shadow + trampled ring
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.beginPath(); ctx.ellipse(gcx + 2 * u, gy0 - 2 * u, gr + 4 * u, gr * 0.30, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#a89878";
      ctx.beginPath(); ctx.ellipse(gcx, gy0 - 2 * u, gr + 6 * u, gr * 0.32, 0, 0, 7); ctx.fill();
      // wall: felt white with lattice band
      ctx.fillStyle = "#efe8d6";
      ctx.beginPath(); ctx.ellipse(gcx, gcy, gr, gr * 0.92, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(120,90,50,0.55)"; ctx.lineWidth = Math.max(1, 1.4 * u);
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(gcx + (gr * i) / 3.4, gcy - gr * 0.55);
        ctx.lineTo(gcx + (gr * i) / 3.4, gcy + gr * 0.62); ctx.stroke();
      }
      ctx.fillStyle = "#6a5a3a";
      ctx.fillRect(gcx - gr, gcy + gr * 0.18, gr * 2, Math.max(2, 3 * u));
      // red tension bands top + bottom
      ctx.fillStyle = "#c94e3a";
      ctx.fillRect(gcx - gr * 0.99, gcy - gr * 0.62, gr * 1.98, Math.max(2, 4 * u));
      ctx.fillRect(gcx - gr * 0.99, gcy + gr * 0.60, gr * 1.98, Math.max(2, 4 * u));
      // conical roof with red seams
      const apexY = hy + 1;
      ctx.fillStyle = st.roof;
      ctx.beginPath(); ctx.moveTo(gcx - gr - 3 * u, gcy - gr * 0.30);
      ctx.lineTo(gcx, apexY); ctx.lineTo(gcx + gr + 3 * u, gcy - gr * 0.30);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = st.trim; ctx.lineWidth = Math.max(1.6, 2 * u); ctx.stroke();
      ctx.strokeStyle = "rgba(201,78,58,0.8)"; ctx.lineWidth = Math.max(1, 1.6 * u);
      for (const f of [-0.55, -0.25, 0.25, 0.55]) {
        ctx.beginPath(); ctx.moveTo(gcx + f * gr, gcy - gr * 0.28); ctx.lineTo(gcx, apexY + 4 * u); ctx.stroke();
      }
      // crown ring (toono) + poles
      ctx.fillStyle = "#6a2a1a";
      ctx.beginPath(); ctx.ellipse(gcx, apexY + 3 * u, Math.max(3, ts * 0.16), Math.max(2, ts * 0.09), 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.ellipse(gcx, apexY + 3 * u, Math.max(1.5, ts * 0.07), Math.max(1, ts * 0.04), 0, 0, 7); ctx.fill();
      // guy ropes to ground stakes
      ctx.strokeStyle = "rgba(90,70,40,0.9)"; ctx.lineWidth = Math.max(1, 1.2 * u);
      for (const sgn of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(gcx + sgn * gr * 0.3, apexY + 5 * u);
        ctx.lineTo(gcx + sgn * (gr + 10 * u), gy0 - 2 * u); ctx.stroke();
        ctx.fillStyle = "#4a3a22";
        ctx.fillRect(gcx + sgn * (gr + 10 * u) - u, gy0 - 6 * u, 2.4 * u, 5 * u);
      }
      // felt door flap + tassels
      const fdw = Math.max(ts * 0.4, gr * 0.42), fdx = gcx - fdw / 2, fdy = gcy + gr * 0.10;
      const fdh = gy0 - 4 * u - fdy;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(fdx - 2 * u, fdy - 2 * u, fdw + 4 * u, fdh + 2 * u);
      ctx.fillStyle = "#7a2a1a"; ctx.fillRect(fdx, fdy, fdw, fdh);
      ctx.fillStyle = "#c94e3a"; ctx.fillRect(fdx, fdy, fdw, Math.max(2, 3 * u));
      ctx.fillStyle = "#ffd93d";
      for (let tx = fdx + 3 * u; tx < fdx + fdw - 2 * u; tx += 6 * u) {
        ctx.beginPath(); ctx.moveTo(tx, fdy + fdh); ctx.lineTo(tx + 1.6 * u, fdy + fdh + 4 * u); ctx.lineTo(tx + 3.2 * u, fdy + fdh); ctx.closePath(); ctx.fill();
      }
      // smoke wisp from the crown
      ctx.fillStyle = "rgba(210,210,215,0.5)";
      ctx.beginPath(); ctx.arc(gcx + 4 * u, apexY - 8 * u, 3.4 * u, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(210,210,215,0.35)";
      ctx.beginPath(); ctx.arc(gcx + 9 * u, apexY - 15 * u, 4.6 * u, 0, 7); ctx.fill();
      return;
    }
    if (ck === "horse_pen") {
      // open corral: dirt ring, post-and-rail fence with gate gaps, hay + trough
      const px = hx + hw * 0.08, py = hy + hh * 0.10, pw = hw * 0.84, ph = hh * 0.80;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(px + 2 * u, py + 3 * u, pw, ph);
      ctx.fillStyle = "#8a6f45";
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = "rgba(120,90,50,0.35)";
      for (let i = 0; i < 26; i++) ctx.fillRect(px + hr() * pw, py + hr() * ph, 2.4 * u, 1.6 * u);
      // hay piles
      for (const hxp of [0.24, 0.68]) {
        const hx0 = px + pw * hxp, hy0 = py + ph * 0.62;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath(); ctx.ellipse(hx0 + 2 * u, hy0 + 2 * u, pw * 0.13, ph * 0.10, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#d9b83d";
        ctx.beginPath(); ctx.ellipse(hx0, hy0, pw * 0.13, ph * 0.10, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#f0d060";
        ctx.beginPath(); ctx.ellipse(hx0 - pw * 0.03, hy0 - ph * 0.03, pw * 0.07, ph * 0.05, 0, 0, 7); ctx.fill();
      }
      // water trough
      const tx0 = px + pw * 0.36, ty0 = py + ph * 0.18, twd = pw * 0.28, tht = Math.max(6 * u, ts * 0.22);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(tx0 + 1.5 * u, ty0 + 2 * u, twd, tht);
      ctx.fillStyle = "#5e3a22"; ctx.fillRect(tx0, ty0, twd, tht);
      ctx.fillStyle = "#3a7bd4"; ctx.fillRect(tx0 + 2 * u, ty0 + 2 * u, twd - 4 * u, tht * 0.45);
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fillRect(tx0 + 2 * u, ty0 + 2 * u, twd - 4 * u, 1.4 * u);
      // post-and-rail fence with center gate gaps on all sides
      const post = (fx, fy) => {
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(fx + 1 * u, fy - tht * 0.4 + 1.5 * u, 3 * u, tht * 0.4 + 8 * u);
        ctx.fillStyle = "#4a3a22"; ctx.fillRect(fx, fy - tht * 0.4, 3 * u, tht * 0.4 + 8 * u);
        ctx.fillStyle = "#6e4a26"; ctx.fillRect(fx, fy - tht * 0.4, 3 * u, 2 * u);
      };
      const railH = (x0, x1, y) => {
        if (x1 - x0 < 4 * u) return;
        ctx.fillStyle = "#6e4a26"; ctx.fillRect(x0, y, x1 - x0, 2.2 * u);
        ctx.fillStyle = "#8a5f36"; ctx.fillRect(x0, y, x1 - x0, 1 * u);
      };
      const railV = (y0, y1, x) => {
        if (y1 - y0 < 4 * u) return;
        ctx.fillStyle = "#6e4a26"; ctx.fillRect(x, y0, 2.2 * u, y1 - y0);
        ctx.fillStyle = "#8a5f36"; ctx.fillRect(x, y0, 1 * u, y1 - y0);
      };
      const step = Math.max(10 * u, ts * 0.42);
      const gap = (a, b, c) => Math.abs(c - (a + b) / 2) > (b - a) * 0.10;
      for (let fx = px; fx <= px + pw + 1; fx += step) {
        const fxc = Math.min(fx, px + pw);
        if (gap(px, px + pw, fxc)) { post(fxc - 1.5 * u, py); post(fxc - 1.5 * u, py + ph - 8 * u); }
      }
      for (let fy = py; fy <= py + ph + 1; fy += step) {
        const fyc = Math.min(fy, py + ph);
        if (gap(py, py + ph, fyc)) { post(px, fyc); post(px + pw - 3 * u, fyc); }
      }
      for (const ry of [py + 3 * u, py + ph * 0.5]) {
        railH(px, px + pw * 0.40, ry); railH(px + pw * 0.60, px + pw, ry);
      }
      for (const rx of [px + 3 * u, px + pw * 0.5]) {
        railV(py, py + ph * 0.40, rx); railV(py + ph * 0.60, py + ph, rx);
      }
      // hitch rail with hanging rope
      ctx.fillStyle = "#4a3a22";
      ctx.fillRect(px + pw * 0.12, py - 6 * u, 3 * u, 10 * u);
      ctx.fillRect(px + pw * 0.30, py - 6 * u, 3 * u, 10 * u);
      ctx.fillRect(px + pw * 0.12, py - 6 * u, pw * 0.18, 2.4 * u);
      ctx.strokeStyle = "#8a7a5a"; ctx.lineWidth = Math.max(1, 1.2 * u);
      ctx.beginPath(); ctx.moveTo(px + pw * 0.21, py - 4 * u);
      ctx.lineTo(px + pw * 0.21, py + 4 * u); ctx.stroke();
      return;
    }
    // ---- multi-mass layout: the house is a COMPOUND, never one box ----
    // Main block stays centered (door stays on the walk axis); side wings,
    // towers and sheds break the outline into L / T / U / stepped masses.
    const _fx = hx, _fy = hy, _fw = hw, _fh = hh;
    const _tiny = (b && (b.w <= 4 || b.h <= 4)) || hw < ts * 2.1;
    const _grandU = { cathedral: 1, church: 1, guildhall: 1, manor: 1, mead_hall: 1, great_hall: 1, tide_temple: 1, shrine: 1, forge_works: 1, great_forge: 1, bull_hall: 1, wight_throne: 1, pit_chapel: 1, inn: 1, townhouse: 1, warehouse: 1, palace: 1, castle_keep: 1, high_temple: 1, sun_temple: 1, grand_bazaar: 1, khan_hall: 1, terrace_hall: 1, ice_hall: 1, caravanserai: 1, lighthouse: 1, chancery: 1, harbor_office: 1 }[ck];
    let _wingMode = "none";
    if (!_tiny) {
      if (_grandU) _wingMode = "both";
      else if (tentCls) _wingMode = hr() < 0.6 ? "right" : "left";
      else _wingMode = hr() < 0.33 ? "left" : hr() < 0.66 ? "right" : "both";
      if (stableCls || shopCls) _wingMode = hr() < 0.5 ? "left" : "right";
    }
    const _ov = Math.max(3 * u, ts * 0.10);
    let _mx = _fx, _mw = _fw;
    if (_wingMode === "both") { _mw = _fw * 0.52; _mx = _fx + (_fw - _mw) / 2; }
    else if (_wingMode !== "none") { _mw = _fw * 0.64; _mx = _fx + (_fw - _mw) / 2; }
    const _mh = _fh, _my = _fy;
    const _wh = _fh * (forgeCls || stableCls || shopCls || tentCls ? 0.52 : 0.62);
    const _wy = _fy + _fh - _wh;
    // small wing-mass painter (wall + gable + one window + foundation)
    const _paintWing = (wx, ww) => {
      if (ww < ts * 0.4) return;
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(wx + 2 * u, _wy + 3 * u, ww, _wh);
      ctx.fillStyle = stone ? "#5a5a64" : "#7a6a55";
      ctx.fillRect(wx - 1.5 * u, _wy + _wh - Math.max(3, ts * 0.14), ww + 3 * u, Math.max(3, ts * 0.14) + 2 * u);
      ctx.fillStyle = st.plaster;
      ctx.fillRect(wx, _wy, ww, _wh);
      if (stone) {
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        for (let yy = _wy + ts * 0.22; yy < _wy + _wh; yy += ts * 0.24) ctx.fillRect(wx, yy, ww, 1.3 * u);
      } else if (!tentCls) {
        ctx.fillStyle = st.beam;
        const bw2 = Math.max(2, ts * 0.08);
        ctx.fillRect(wx, _wy, ww, bw2);
        ctx.fillRect(wx, _wy + _wh * 0.5, ww, bw2);
        ctx.fillRect(wx, _wy, bw2, _wh);
        ctx.fillRect(wx + ww - bw2, _wy, bw2, _wh);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        for (let xx = wx + 3 * u; xx < wx + ww; xx += 7 * u) ctx.fillRect(xx, _wy, 1.4 * u, _wh);
      }
      // wing gable roof (lower ridge than the main roof -> stepped skyline)
      const wrh = Math.min(_wh * 0.5, ts * 0.8), wey = _wy + wrh, wcx = wx + ww / 2;
      const wov = Math.max(2.5 * u, ts * 0.10);
      ctx.beginPath();
      if (japan) {
        ctx.moveTo(wx - wov, wey);
        ctx.quadraticCurveTo(wx + ww * 0.25, wey - wrh * 0.55, wcx, _wy + 1);
        ctx.quadraticCurveTo(wx + ww * 0.75, wey - wrh * 0.55, wx + ww + wov, wey);
        ctx.closePath();
      } else {
        ctx.moveTo(wx - wov, wey); ctx.lineTo(wcx, _wy + 1); ctx.lineTo(wx + ww + wov, wey); ctx.closePath();
      }
      ctx.fillStyle = st.roof; ctx.fill();
      ctx.lineWidth = Math.max(1.6, 2 * u); ctx.strokeStyle = st.trim; ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(wx - wov, wey, ww + wov * 2, Math.max(1.5, 2 * u));
      ctx.fillStyle = st.ridge;
      ctx.fillRect(wcx - 2 * u, _wy, 4 * u, Math.max(2.5, 5 * u));
      // one wing window with crossbars
      const www = Math.min(ts * 0.34, ww * 0.34);
      if (www > 4 * u && _wh > ts * 0.7) {
        const wwx = wcx - www / 2, wwy = wey + (_wy + _wh - wey) * 0.30, wwh2 = www;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(wwx - 1.5 * u, wwy - 1.5 * u, www + 3 * u, www + 3 * u);
        ctx.fillStyle = forgeCls ? "#ffb02e" : "#ffd97a";
        ctx.fillRect(wwx, wwy, www, www);
        ctx.fillStyle = st.trim;
        ctx.fillRect(wwx + www / 2 - u, wwy, 2 * u, www);
        ctx.fillRect(wwx, wwy + www / 2 - u, www, 2 * u);
        ctx.fillStyle = stone ? "#7a7a88" : "#8a6a45";
        ctx.fillRect(wwx - 2 * u, wwy + www + 1 * u, www + 4 * u, 2.4 * u);
      }
    };
    let _towerLeft = false;
    // tower painter (breaks the skyline upward); drawn BEFORE main so it sits behind
    if (!_tiny && (holy || ck === "manor" || ck === "dawn_manor" || ck === "guildhall" || ck === "townhouse" || ck === "lookout" || ck === "forge_works" || hallCls)) {
      const _tw = Math.min(_fw * 0.20, ts * 0.72);
      const _th = _fh * 0.9 + ts * 0.55;
      const _leftSide = hr() < 0.5; _towerLeft = _leftSide;
      const _tx = _leftSide ? _fx + _fw * 0.06 : _fx + _fw * 0.94 - _tw;
      const _ty = _fy - ts * 0.42;
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(_tx + 2 * u, _ty + 2 * u, _tw, _th);
      ctx.fillStyle = stone ? "#8a8a96" : st.plaster;
      ctx.fillRect(_tx, _ty, _tw, _th);
      if (stone) {
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        for (let yy = _ty + 4 * u; yy < _ty + _th; yy += ts * 0.24) ctx.fillRect(_tx, yy, _tw, 1.3 * u);
      } else {
        ctx.fillStyle = st.beam;
        ctx.fillRect(_tx, _ty, _tw, Math.max(2, ts * 0.08));
        ctx.fillRect(_tx, _ty + _th * 0.5, _tw, Math.max(2, ts * 0.08));
      }
      // pyramid cap + finial
      ctx.fillStyle = st.roof;
      ctx.beginPath();
      ctx.moveTo(_tx - 2 * u, _ty); ctx.lineTo(_tx + _tw / 2, _ty - ts * 0.5); ctx.lineTo(_tx + _tw + 2 * u, _ty);
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = Math.max(1.5, 2 * u); ctx.strokeStyle = st.trim; ctx.stroke();
      ctx.fillStyle = "#ffd93d";
      ctx.fillRect(_tx + _tw / 2 - 1.2 * u, _ty - ts * 0.5 - 4 * u, 2.4 * u, 5 * u);
      // slit window glowing near the top
      ctx.fillStyle = "#ffe9a0";
      ctx.fillRect(_tx + _tw / 2 - 2 * u, _ty + ts * 0.18, 4 * u, 7 * u);
      ctx.fillStyle = st.trim;
      ctx.fillRect(_tx + _tw / 2 - 2 * u, _ty + ts * 0.18, 4 * u, 1.6 * u);
    }
    if (!_tiny && (ck === "cathedral" || ck === "radiant_cathedral")) {
      // twin pinnacle mirrored across the front
      const _tw2 = Math.min(_fw * 0.20, ts * 0.72);
      const _th2 = _fh * 0.9 + ts * 0.55;
      const _tx2 = _towerLeft ? _fx + _fw * 0.94 - _tw2 : _fx + _fw * 0.06;
      const _ty2 = _fy - ts * 0.42;
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(_tx2 + 2 * u, _ty2 + 2 * u, _tw2, _th2);
      ctx.fillStyle = stone ? "#8a8a96" : st.plaster;
      ctx.fillRect(_tx2, _ty2, _tw2, _th2);
      ctx.fillStyle = st.roof;
      ctx.beginPath();
      ctx.moveTo(_tx2 - 2 * u, _ty2); ctx.lineTo(_tx2 + _tw2 / 2, _ty2 - ts * 0.5); ctx.lineTo(_tx2 + _tw2 + 2 * u, _ty2);
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = Math.max(1.5, 2 * u); ctx.strokeStyle = st.trim; ctx.stroke();
      ctx.fillStyle = "#ffd93d";
      ctx.fillRect(_tx2 + _tw2 / 2 - 1.2 * u, _ty2 - ts * 0.5 - 4 * u, 2.4 * u, 5 * u);
      ctx.fillStyle = "#ffe9a0";
      ctx.fillRect(_tx2 + _tw2 / 2 - 2 * u, _ty2 + ts * 0.18, 4 * u, 7 * u);
    }
    // draw wings (behind main)
    if (_wingMode === "both" || _wingMode === "left") _paintWing(_fx, _mx - _fx + _ov);
    if (_wingMode === "both" || _wingMode === "right") _paintWing(_mx + _mw - _ov, _fx + _fw - (_mx + _mw - _ov));
    // lean-to shed for work buildings (single-slope annex on the free side)
    if (!_tiny && (forgeCls || stableCls || shopCls || ck === "farmhouse")) {
      const _freeLeft = _wingMode !== "left";
      const _sx = _freeLeft ? _fx : _fx + _fw - ts * 0.62;
      const _sw = ts * 0.62, _sh = _fh * 0.44, _sy = _fy + _fh - _sh;
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(_sx + 1.5 * u, _sy + 2 * u, _sw, _sh);
      ctx.fillStyle = "#5a4a33";
      ctx.fillRect(_sx, _sy, _sw, _sh);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      for (let yy = _sy + 3 * u; yy < _sy + _sh; yy += 5 * u) ctx.fillRect(_sx, yy, _sw, 1.4 * u);
      // single-slope lid
      ctx.fillStyle = st.roof;
      ctx.beginPath();
      ctx.moveTo(_sx - 2 * u, _sy); ctx.lineTo(_sx + _sw + 2 * u, _sy - ts * 0.16); ctx.lineTo(_sx + _sw + 2 * u, _sy - ts * 0.16 + 3 * u); ctx.lineTo(_sx - 2 * u, _sy + 3 * u);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = st.trim; ctx.lineWidth = Math.max(1.2, 1.6 * u); ctx.stroke();
    }
    // main block takes over hx/hy/hw/hh from here (door stays centered on the walk)
    hx = _mx; hw = _mw; hy = _my; hh = _mh;

    // shadow + foundation
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(hx + 2.5 * u, hy + 3.5 * u, hw, hh);
    const foundH = Math.max(3, ts * 0.16);
    ctx.fillStyle = stone ? "#5a5a64" : "#7a6a55";
    ctx.fillRect(hx - 2 * u, hy + hh - foundH, hw + 4 * u, foundH + 2 * u);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(hx - 2 * u, hy + hh - foundH, hw + 4 * u, 1.5 * u);
    // wall body
    ctx.fillStyle = st.plaster;
    ctx.fillRect(hx, hy, hw, hh);
    if (stone) {
      // ashlar courses with per-block tone shift
      const ch = Math.max(5, ts * 0.24);
      let row = 0;
      for (let yy = hy; yy < hy + hh; yy += ch, row++) {
        ctx.fillStyle = row % 2 ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.07)";
        ctx.fillRect(hx, yy + ch - 1.4 * u, hw, 1.4 * u);
        for (let xx = hx + (row % 2 ? ch * 0.9 : ch * 0.4); xx < hx + hw; xx += ch * 1.8) {
          ctx.fillStyle = "rgba(0,0,0,0.14)";
          ctx.fillRect(xx, yy, 1.4 * u, ch);
        }
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(hx, yy, hw, 1);
      }
      // moss flecks on old stone
      ctx.fillStyle = "rgba(80,140,80,0.4)";
      for (let i = 0; i < 8; i++) ctx.fillRect(hx + hr() * hw, hy + hh * 0.5 + hr() * hh * 0.5, 2 * u, 1.6 * u);
    } else if (adobe || terrace) {
      // sun-baked plaster: soft mottling + viga course + corner feet
      ctx.fillStyle = "rgba(150,100,55,0.22)";
      for (let i = 0; i < 12; i++) ctx.fillRect(hx + hr() * hw, hy + hr() * hh, 3 * u, 2 * u);
      ctx.fillStyle = "rgba(255,235,200,0.12)";
      for (let i = 0; i < 8; i++) ctx.fillRect(hx + hr() * hw, hy + hr() * hh, 2 * u, 1.4 * u);
      ctx.fillStyle = st.beam;
      const vy = hy + hh * 0.30;
      for (let xx = hx + 5 * u; xx < hx + hw - 3 * u; xx += Math.max(9 * u, ts * 0.34)) {
        ctx.beginPath(); ctx.arc(xx, vy, Math.max(1.6, 2.2 * u), 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.arc(xx, vy, Math.max(1, 1.2 * u), 0, 7); ctx.fill();
        ctx.fillStyle = st.beam;
      }
      if (adobe) {
        // sloped buttress feet at both corners
        ctx.fillStyle = st.plaster;
        for (const sgn of [0, 1]) {
          const bx = sgn ? hx + hw - ts * 0.34 : hx;
          ctx.beginPath();
          ctx.moveTo(bx, hy + hh);
          ctx.lineTo(bx + (sgn ? -ts * 0.34 : ts * 0.34), hy + hh - ts * 0.5);
          ctx.lineTo(bx + (sgn ? -ts * 0.34 : ts * 0.34), hy + hh);
          ctx.closePath(); ctx.fill();
        }
      } else {
        // wall ladder to the roof terrace
        const lxx = hx + hw - Math.max(8 * u, ts * 0.34);
        ctx.fillStyle = st.beam;
        ctx.fillRect(lxx, hy + hh * 0.2, 2.4 * u, hh * 0.8);
        ctx.fillRect(lxx + Math.max(6 * u, ts * 0.2), hy + hh * 0.2, 2.4 * u, hh * 0.8);
        for (let yy = hy + hh * 0.26; yy < hy + hh; yy += Math.max(5 * u, ts * 0.18)) {
          ctx.fillRect(lxx, yy, Math.max(6 * u, ts * 0.2) + 2.4 * u, 1.8 * u);
        }
      }
    } else if (felt) {
      // felt panels: vertical seams + rope lattice + red hem
      ctx.fillStyle = "rgba(120,90,50,0.30)";
      for (let xx = hx + 5 * u; xx < hx + hw - 3 * u; xx += Math.max(9 * u, ts * 0.32)) {
        ctx.fillRect(xx, hy + 2 * u, 1.6 * u, hh - 4 * u);
      }
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      for (let xx = hx + 6 * u; xx < hx + hw - 3 * u; xx += Math.max(9 * u, ts * 0.32)) {
        ctx.fillRect(xx, hy + 2 * u, 1, hh - 4 * u);
      }
      ctx.fillStyle = "#c94e3a";
      ctx.fillRect(hx, hy + hh - Math.max(3, ts * 0.12), hw, Math.max(3, ts * 0.12));
      ctx.strokeStyle = "rgba(90,70,40,0.7)"; ctx.lineWidth = Math.max(1, 1.2 * u);
      ctx.beginPath(); ctx.moveTo(hx, hy + hh * 0.5); ctx.lineTo(hx + hw, hy + hh * 0.5); ctx.stroke();
    } else if (snowpine) {
      // horizontal log courses with snow chinking
      const lh = Math.max(4, ts * 0.16);
      let lrow = 0;
      for (let yy = hy + 2 * u; yy < hy + hh - 1; yy += lh, lrow++) {
        ctx.fillStyle = lrow % 2 ? "rgba(0,0,0,0.20)" : "rgba(0,0,0,0.08)";
        ctx.fillRect(hx, yy + lh - 1.6 * u, hw, 1.6 * u);
        ctx.fillStyle = "rgba(235,244,252,0.5)";
        ctx.fillRect(hx, yy + lh - 2.6 * u, hw, 1 * u);
      }
      // log ends at the corners
      ctx.fillStyle = st.beam;
      for (let yy = hy + 3 * u; yy < hy + hh - 2; yy += lh * 2) {
        ctx.beginPath(); ctx.arc(hx + 1 * u, yy, Math.max(1.4, 2 * u), 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(hx + hw - 1 * u, yy, Math.max(1.4, 2 * u), 0, 7); ctx.fill();
      }
    } else if (tentCls) {
      // stitched hide / canvas: vertical seams + patches
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      for (let xx = hx + 4 * u; xx < hx + hw; xx += Math.max(8 * u, ts * 0.3)) ctx.fillRect(xx, hy, 1.6 * u, hh);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let xx = hx + 5 * u; xx < hx + hw; xx += Math.max(8 * u, ts * 0.3)) ctx.fillRect(xx, hy, 1, hh);
      // patches
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(hx + hw * 0.18, hy + hh * 0.30, hw * 0.16, hh * 0.18);
      ctx.fillRect(hx + hw * 0.66, hy + hh * 0.52, hw * 0.13, hh * 0.15);
      ctx.strokeStyle = "rgba(40,26,14,0.6)"; ctx.lineWidth = 1;
      ctx.strokeRect(hx + hw * 0.18, hy + hh * 0.30, hw * 0.16, hh * 0.18);
      // bone pins along the top
      ctx.fillStyle = "#e8e4d8";
      for (let xx = hx + 6 * u; xx < hx + hw - 4 * u; xx += 9 * u) ctx.fillRect(xx, hy + 2 * u, 2.4 * u, 3 * u);
    } else {
      // timber-frame plaster: beams + pegs + speckle
      ctx.fillStyle = "rgba(120,90,50,0.18)";
      for (let i = 0; i < 14; i++) ctx.fillRect(hx + hr() * hw, hy + hr() * hh, 2.4 * u, 1.6 * u);
      ctx.fillStyle = st.beam;
      const bw = Math.max(2, ts * 0.09);
      ctx.fillRect(hx, hy, bw, hh); ctx.fillRect(hx + hw - bw, hy, bw, hh);
      ctx.fillRect(hx, hy, hw, bw);
      const railY = hy + hh * 0.54;
      ctx.fillRect(hx, railY, hw, bw);
      for (let xx = hx + hw * 0.16; xx < hx + hw - bw; xx += Math.max(10 * u, ts * 0.5)) ctx.fillRect(xx, hy + bw, bw * 0.8, hh - bw);
      // pegs
      ctx.fillStyle = "rgba(30,18,8,0.7)";
      for (let xx = hx + hw * 0.16; xx < hx + hw - bw; xx += Math.max(10 * u, ts * 0.5)) {
        ctx.fillRect(xx + 1, hy + 1.5 * u, 1.6 * u, 1.6 * u);
        ctx.fillRect(xx + 1, railY + 1, 1.6 * u, 1.6 * u);
      }
      if (japan) {
        // dark wood lattice band at the base
        ctx.fillStyle = "#2e2018";
        ctx.fillRect(hx, hy + hh - ts * 0.30, hw, ts * 0.30);
        ctx.fillStyle = "#5a4a33";
        for (let xx = hx + 3 * u; xx < hx + hw; xx += 7 * u) ctx.fillRect(xx, hy + hh - ts * 0.30, 2 * u, ts * 0.30);
      }
    }
    // mid floor band for two-story masses
    const bandY = hy + hh * 0.46;
    if (twoStory && !tentCls) {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(hx - 1 * u, bandY, hw + 2 * u, Math.max(2, 3.5 * u));
      ctx.fillStyle = st.trim;
      ctx.fillRect(hx - 1 * u, bandY, hw + 2 * u, Math.max(1.5, 2 * u));
    }
    // ---- roof ----
    const rh = Math.min(hh * 0.42, ts * 1.35);
    const ey = hy + rh, hcx = hx + hw / 2;
    const over = Math.max(3 * u, ts * 0.14);
    const drawGableRoof = () => {
      if (adobe) {
        // flat rammed-earth roof behind a parapet, timber viga ends below
        const slabY = hy + Math.max(4 * u, ts * 0.16);
        const parH = Math.max(5 * u, ts * 0.24);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(hx - over + 2 * u, slabY - parH + 3 * u, hw + over * 2, parH);
        ctx.fillStyle = st.plaster;
        ctx.fillRect(hx - over, slabY - parH, hw + over * 2, parH);
        ctx.fillStyle = st.roof;
        ctx.fillRect(hx - over, slabY - parH, hw + over * 2, Math.max(2, 3 * u));
        // packed-earth slab
        ctx.fillStyle = "#b98a52";
        ctx.fillRect(hx, slabY, hw, Math.max(2, 2.5 * u));
        ctx.fillStyle = "rgba(255,235,200,0.25)";
        ctx.fillRect(hx, slabY, hw, 1.2 * u);
        // viga ends: protruding beam row under the parapet
        for (let xx = hx + 5 * u; xx < hx + hw - 3 * u; xx += Math.max(9 * u, ts * 0.34)) {
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath(); ctx.arc(xx + 1 * u, slabY + 3 * u, Math.max(1.6, 2.2 * u), 0, 7); ctx.fill();
          ctx.fillStyle = st.beam;
          ctx.beginPath(); ctx.arc(xx, slabY + 2 * u, Math.max(1.6, 2.2 * u), 0, 7); ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath(); ctx.arc(xx, slabY + 2 * u, Math.max(1, 1.2 * u), 0, 7); ctx.fill();
        }
        return;
      }
      if (terrace) {
        // stepped pueblo tiers: two receding flat masses with vigas each
        const slabY = hy + Math.max(4 * u, ts * 0.16);
        const parH = Math.max(4 * u, ts * 0.18);
        const tierH = Math.max(8 * u, ts * 0.34);
        const tw2 = hw * 0.60, tx2 = hcx - tw2 / 2;
        // upper tier (behind)
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(tx2 + 2 * u, slabY - tierH - parH + 3 * u, tw2, tierH + parH);
        ctx.fillStyle = st.plaster;
        ctx.fillRect(tx2, slabY - tierH - parH, tw2, tierH + parH);
        ctx.fillStyle = st.roof;
        ctx.fillRect(tx2, slabY - tierH - parH, tw2, Math.max(2, 2.5 * u));
        ctx.fillStyle = st.beam;
        for (let xx = tx2 + 4 * u; xx < tx2 + tw2 - 2 * u; xx += Math.max(8 * u, ts * 0.3)) {
          ctx.beginPath(); ctx.arc(xx, slabY - tierH + 1 * u, Math.max(1.4, 2 * u), 0, 7); ctx.fill();
        }
        // lower tier (front, full width)
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(hx - over + 2 * u, slabY - parH + 3 * u, hw + over * 2, parH);
        ctx.fillStyle = st.plaster;
        ctx.fillRect(hx - over, slabY - parH, hw + over * 2, parH);
        ctx.fillStyle = st.roof;
        ctx.fillRect(hx - over, slabY - parH, hw + over * 2, Math.max(2, 3 * u));
        ctx.fillStyle = st.beam;
        for (let xx = hx + 5 * u; xx < hx + hw - 3 * u; xx += Math.max(9 * u, ts * 0.34)) {
          ctx.beginPath(); ctx.arc(xx, slabY + 1 * u, Math.max(1.4, 2 * u), 0, 7); ctx.fill();
        }
        return;
      }
      if (snowpine) {
        // steep alpine gable with snow cap + icicles
        const rh2 = Math.min(hh * 0.66, ts * 2.1);
        const apexY = hy + rh - rh2;
        ctx.beginPath();
        ctx.moveTo(hx - over, ey); ctx.lineTo(hcx, apexY + 1); ctx.lineTo(hx + hw + over, ey); ctx.closePath();
        ctx.fillStyle = st.roof; ctx.fill();
        ctx.lineWidth = Math.max(2, 2.2 * u); ctx.strokeStyle = st.trim; ctx.stroke();
        ctx.save();
        ctx.clip();
        // snowfields sliding down both faces
        ctx.fillStyle = "rgba(235,244,252,0.92)";
        ctx.beginPath();
        ctx.moveTo(hx - over, ey); ctx.lineTo(hcx, apexY + 1); ctx.lineTo(hx + hw + over, ey);
        ctx.lineTo(hx + hw + over, ey - rh2 * 0.42); ctx.lineTo(hcx, apexY + rh2 * 0.30);
        ctx.lineTo(hx - over, ey - rh2 * 0.42); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillRect(hcx - 2 * u, apexY, 4 * u, rh2 * 0.5);
        ctx.restore();
        // ridge beam tip
        ctx.fillStyle = st.beam;
        ctx.fillRect(hcx - 1.4 * u, apexY - 4 * u, 2.8 * u, 6 * u);
        // eave shadow + icicles
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(hx - over, ey, hw + over * 2, Math.max(2, 3 * u));
        ctx.fillStyle = "rgba(215,235,248,0.95)";
        for (let xx = hx + 2 * u; xx < hx + hw - 1 * u; xx += Math.max(7 * u, ts * 0.26)) {
          const il = (2.5 + hr() * 4) * u;
          ctx.beginPath(); ctx.moveTo(xx, ey + 2 * u); ctx.lineTo(xx + 1.4 * u, ey + 2 * u + il); ctx.lineTo(xx + 2.8 * u, ey + 2 * u); ctx.closePath(); ctx.fill();
        }
        return;
      }
      ctx.beginPath();
      if (japan) {
        // curved eaves: upturned corners
        ctx.moveTo(hx - over, ey);
        ctx.quadraticCurveTo(hx + hw * 0.25, ey - rh * 0.55, hcx, hy + 1);
        ctx.quadraticCurveTo(hx + hw * 0.75, ey - rh * 0.55, hx + hw + over, ey);
        ctx.lineTo(hx + hw + over - 2 * u, ey + 2 * u);
        ctx.lineTo(hx - over + 2 * u, ey + 2 * u);
        ctx.closePath();
      } else {
        ctx.moveTo(hx - over, ey); ctx.lineTo(hcx, hy + 1); ctx.lineTo(hx + hw + over, ey); ctx.closePath();
      }
      ctx.fillStyle = st.roof; ctx.fill();
      ctx.lineWidth = Math.max(2, 2.2 * u); ctx.strokeStyle = st.trim; ctx.stroke();
      ctx.save();
      ctx.clip();
      const rn = st.name || "";
      if (rn === "thatch" || rn === "bonehide") {
        ctx.strokeStyle = "rgba(90,64,26,0.6)"; ctx.lineWidth = Math.max(1, 1.4 * u);
        for (let yy = hy + 3 * u; yy < ey; yy += Math.max(4, ts * 0.13)) {
          ctx.beginPath(); ctx.moveTo(hx - over, yy + hr() * 2); ctx.lineTo(hx + hw + over, yy); ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,240,200,0.14)";
        ctx.fillRect(hcx - hw * 0.2, hy, hw * 0.4, rh * 0.5);
      } else if (rn === "tile") {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        for (let yy = hy + 4 * u; yy < ey; yy += Math.max(5, ts * 0.17)) ctx.fillRect(hx - over, yy, hw + over * 2, 1.8 * u);
        ctx.fillStyle = "rgba(232,160,192,0.35)";
        ctx.fillRect(hcx - 2 * u, hy, 4 * u, rh);
      } else if (rn === "slate" || rn === "iron" || rn === "ironhide" || rn === "bronze") {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        const g = Math.max(5, ts * 0.20);
        for (let yy = hy + 3 * u; yy < ey; yy += g) ctx.fillRect(hx - over, yy, hw + over * 2, 1.6 * u);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        for (let yy = hy + 1.5 * u; yy < ey; yy += g) ctx.fillRect(hx - over, yy, hw + over * 2, 1);
        if (rn === "iron" || rn === "ironhide") {
          ctx.fillStyle = "#1a1a20";
          for (let xx = hx; xx < hx + hw; xx += 10 * u) ctx.fillRect(xx, hy + rh * 0.3, 1.6 * u, rh * 0.6);
        }
        if (rn === "bronze") {
          ctx.fillStyle = "rgba(255,220,120,0.25)";
          ctx.fillRect(hcx - 3 * u, hy, 6 * u, rh);
        }
      } else if (rn === "cowl" || rn === "coil") {
        ctx.fillStyle = rn === "cowl" ? "rgba(160,74,224,0.5)" : "rgba(224,192,90,0.45)";
        for (let yy = hy + 5 * u; yy < ey; yy += Math.max(6, ts * 0.2)) ctx.fillRect(hx - over, yy, hw + over * 2, 1.6 * u);
      } else if (rn === "pale") {
        ctx.fillStyle = "rgba(60,60,70,0.35)";
        for (let yy = hy + 4 * u; yy < ey; yy += Math.max(6, ts * 0.2)) ctx.fillRect(hx - over, yy, hw + over * 2, 1.6 * u);
      } else if (rn === "hide" || rn === "canvas" || rn === "shored" || rn === "sky" || rn === "moss" || rn === "mossrock") {
        ctx.strokeStyle = "rgba(30,20,10,0.5)"; ctx.lineWidth = 1.2 * u;
        for (let yy = hy + 4 * u; yy < ey; yy += Math.max(6, ts * 0.19)) {
          ctx.beginPath(); ctx.moveTo(hx - over, yy); ctx.lineTo(hx + hw + over, yy); ctx.stroke();
        }
        // stitch dashes
        ctx.fillStyle = "rgba(240,230,200,0.5)";
        for (let xx = hx + 4 * u; xx < hx + hw; xx += 8 * u) ctx.fillRect(xx, hy + rh * 0.4, 2 * u, 1.4 * u);
      } else {
        // shingle rows
        ctx.fillStyle = "rgba(0,0,0,0.20)";
        for (let yy = hy + 4 * u; yy < ey; yy += Math.max(6, ts * 0.19)) ctx.fillRect(hx - over, yy, hw + over * 2, Math.max(1, 2 * u));
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        for (let yy = hy + 2.5 * u; yy < ey; yy += Math.max(6, ts * 0.19)) ctx.fillRect(hx - over, yy, hw + over * 2, 1);
      }
      // ridge cap
      if ((st.name === "thatch") || (st.name === "bonehide")) {
        ctx.fillStyle = st.ridge;
        ctx.fillRect(hcx - hw * 0.28, hy - 1 * u, hw * 0.56, Math.max(3, 6 * u));
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let xx = hcx - hw * 0.28; xx < hcx + hw * 0.28; xx += 6 * u) ctx.fillRect(xx, hy - 1 * u, 1.6 * u, Math.max(3, 6 * u));
      } else {
        ctx.fillStyle = st.ridge;
        ctx.fillRect(hcx - 2.5 * u, hy - 1 * u, 5 * u, rh + 1 * u);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(hcx - 2.5 * u, hy - 1 * u, 1.4 * u, rh + 1 * u);
      }
      if (japan) {
        // ridge horns
        ctx.fillStyle = st.trim;
        ctx.fillRect(hx - over - 1 * u, ey - 5 * u, 4 * u, 6 * u);
        ctx.fillRect(hx + hw + over - 3 * u, ey - 5 * u, 4 * u, 6 * u);
      }
      ctx.restore();
      // eave shadow + barge trim
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(hx - over, ey, hw + over * 2, Math.max(2, 3 * u));
      ctx.fillStyle = st.trim;
      ctx.fillRect(hx - over, ey, hw + over * 2, Math.max(1.5, 2 * u));
      // rafter tails under the eaves
      ctx.fillStyle = "rgba(30,20,10,0.55)";
      for (let xx = hx + 3 * u; xx < hx + hw - 2 * u; xx += Math.max(7 * u, ts * 0.28)) {
        ctx.fillRect(xx, ey + Math.max(1.5, 2 * u), 2.6 * u, Math.max(2, 4 * u));
      }
    };
    drawGableRoof();
    // steppe felt identity: red patterned eave band + tassel fringe
    if (felt) {
      const bh = Math.max(4 * u, ts * 0.16);
      ctx.fillStyle = "#c94e3a";
      ctx.fillRect(hx - over, ey - bh, hw + over * 2, bh);
      ctx.fillStyle = "#efe8d6";
      for (let xx = hx - over + 3 * u; xx < hx + hw + over - 2 * u; xx += 8 * u) {
        ctx.save(); ctx.translate(xx, ey - bh / 2); ctx.rotate(Math.PI / 4);
        ctx.fillRect(-1.6 * u, -1.6 * u, 3.2 * u, 3.2 * u); ctx.restore();
      }
      ctx.fillStyle = "#ffd93d";
      for (let xx = hx + 4 * u; xx < hx + hw - 2 * u; xx += 9 * u) {
        ctx.beginPath(); ctx.moveTo(xx, ey + 2 * u); ctx.lineTo(xx + 1.6 * u, ey + 6 * u); ctx.lineTo(xx + 3.2 * u, ey + 2 * u); ctx.closePath(); ctx.fill();
      }
    }
    // longhall shields along the eaves
    if (hallCls) {
      const cols = ["#c0392b", "#2b6fd4", "#ffd93d", "#3f9a46"];
      let si = 0;
      for (let xx = hx + 6 * u; xx < hx + hw - 6 * u; xx += Math.max(12 * u, ts * 0.42), si++) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(xx, ey + 3 * u, 8 * u, 10 * u);
        ctx.fillStyle = cols[si % cols.length];
        ctx.beginPath(); ctx.arc(xx + 4 * u, ey + 7 * u, 4.6 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#e8e0d0";
        ctx.beginPath(); ctx.arc(xx + 4 * u, ey + 7 * u, 1.8 * u, 0, 7); ctx.fill();
      }
    }
    // hide-tent identity: ridge pole, hanging fangs, war paint
    if (tentCls) {
      // ridge pole tips
      ctx.fillStyle = "#3a2c1c";
      ctx.fillRect(hx - over - 4 * u, ey - 3 * u, 5 * u, 3.4 * u);
      ctx.fillRect(hx + hw + over - 1 * u, ey - 3 * u, 5 * u, 3.4 * u);
      // hanging fangs / beads under the eave
      for (let fx = hx + 8 * u; fx < hx + hw - 6 * u; fx += 11 * u) {
        ctx.fillStyle = "#e8e4d8";
        ctx.beginPath(); ctx.moveTo(fx, ey + 2 * u); ctx.lineTo(fx + 1.6 * u, ey + 7 * u); ctx.lineTo(fx + 3.2 * u, ey + 2 * u); ctx.closePath(); ctx.fill();
      }
      // war paint stripes on the wall
      ctx.fillStyle = st.trim;
      const wpY = hy + hh * 0.30;
      for (let i = 0; i < 3; i++) ctx.fillRect(hx + hw * (0.2 + i * 0.22), wpY, 3 * u, hh * 0.12);
      if (ck === "warg_pen" || ck === "war_tent" || ck === "lookout") {
        // crossed spears over the door
        ctx.save(); ctx.translate(doorCX, dy - ts * 0.28); ctx.rotate(0.5);
        ctx.fillStyle = "#5a3a22"; ctx.fillRect(-1.4 * u, -10 * u, 2.8 * u, 20 * u); ctx.restore();
        ctx.save(); ctx.translate(doorCX, dy - ts * 0.28); ctx.rotate(-0.5);
        ctx.fillStyle = "#5a3a22"; ctx.fillRect(-1.4 * u, -10 * u, 2.8 * u, 20 * u); ctx.restore();
        ctx.fillStyle = "#c9ccd4";
        ctx.fillRect(doorCX - 8 * u, dy - ts * 0.28 - 11 * u, 3 * u, 4 * u);
        ctx.fillRect(doorCX + 5 * u, dy - ts * 0.28 - 11 * u, 3 * u, 4 * u);
      }
    }
    // chimney (+smoke) for homes, forges, halls
    const needsChimney = (ck === "cottage" || ck === "cloud_cottage" || ck === "halo_grove" || ck === "timber_house" || ck === "farmhouse" || ck === "forge" || ck === "forge_works" || ck === "great_forge" || ck === "smithy_shed" || ck === "dawn_smithy" || ck === "dawn_forge" || ck === "manor" || ck === "dawn_manor" || ck === "townhouse" || ck === "canal_house" || ck === "inn" || ck === "cloud_inn" || ck === "guildhall" || ck === "barracks" || ck === "mead_hall" || ck === "tavern" || forgeCls || hallCls);
    if (needsChimney && hw > ts * 1.4) {
      const cw = ts * 0.26, chx = hx + hw - ts * 0.78;
      const ctop = hy - ts * (forgeCls ? 0.55 : 0.34);
      if (chx > hx + hw * 0.5 && chx + cw < hx + hw + over) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(chx + 1.5 * u, ctop + 2 * u, cw, (ey - ctop));
        const brick = forgeCls ? "#6a4a42" : "#7a6a66";
        ctx.fillStyle = brick; ctx.fillRect(chx, ctop, cw, (ey - ctop) * 0.9);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        for (let yy = ctop + 3 * u; yy < ey; yy += 5 * u) ctx.fillRect(chx, yy, cw, 1.4 * u);
        ctx.fillStyle = "#3d3d48"; ctx.fillRect(chx - 2 * u, ctop, cw + 4 * u, R(4));
        ctx.fillStyle = "#23232c"; ctx.fillRect(chx + 1 * u, ctop + 1 * u, cw - 2 * u, 2 * u);
        // smoke puffs (static, deterministic)
        const sm = extRand(extHash("smoke:" + idH));
        for (let i = 0; i < (forgeCls ? 4 : 3); i++) {
          const sa = 3.5 * u + i * 2.2 * u + sm() * 1.5 * u;
          ctx.fillStyle = i === 0 ? "rgba(200,200,205,0.5)" : "rgba(200,200,205," + (0.42 - i * 0.1).toFixed(2) + ")";
          ctx.beginPath(); ctx.arc(chx + cw / 2 + (sm() - 0.5) * 8 * u + i * 2.5 * u, ctop - 5 * u - i * 7 * u, sa, 0, 7); ctx.fill();
        }
        if (forgeCls) {
          // ember glow at the chimney mouth
          ctx.fillStyle = "rgba(255,120,40,0.85)";
          ctx.fillRect(chx + 2 * u, ctop + 1 * u, cw - 4 * u, 1.8 * u);
        }
      }
    }
    // gabled dormers punch the main roof into a composite roofline
    // (lighthouses carry a central beacon lamp instead — see below)
    if (!tentCls && hw > ts * 2.2 && rh > ts * 0.45 && ck !== "lighthouse") {
      const _dormer = (dcx) => {
        const dwm = Math.min(ts * 0.58, hw * 0.20);
        if (dwm < 5 * u) return;
        const dtop = hy + rh * 0.18, dbase = ey - rh * 0.10, dhgt = dbase - dtop;
        const dx0 = dcx - dwm / 2;
        // shadow + cheeks + face
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        ctx.fillRect(dx0 + 1.5 * u, dtop + 2 * u, dwm, dhgt);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fillRect(dx0 - 2 * u, dtop, 2 * u, dhgt);
        ctx.fillRect(dx0 + dwm, dtop, 2 * u, dhgt);
        ctx.fillStyle = stone ? "#9aa0ac" : st.plaster;
        ctx.fillRect(dx0, dtop, dwm, dhgt);
        // dormer window
        const ww3 = dwm * 0.52, wh3 = dhgt * 0.52;
        const wx3 = dcx - ww3 / 2, wy3 = dtop + dhgt * 0.30;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(wx3 - 1.2 * u, wy3 - 1.2 * u, ww3 + 2.4 * u, wh3 + 2.4 * u);
        ctx.fillStyle = "#ffd97a";
        ctx.fillRect(wx3, wy3, ww3, wh3);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(wx3, wy3, ww3, wh3 * 0.3);
        ctx.fillStyle = st.trim;
        ctx.fillRect(wx3 + ww3 / 2 - u, wy3, 2 * u, wh3);
        // dormer cap roof (mini gable, peak below the main ridge)
        ctx.fillStyle = st.roof;
        ctx.beginPath();
        ctx.moveTo(dx0 - 2.5 * u, dtop); ctx.lineTo(dcx, dtop - rh * 0.30); ctx.lineTo(dx0 + dwm + 2.5 * u, dtop);
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = Math.max(1.2, 1.8 * u); ctx.strokeStyle = st.trim; ctx.stroke();
        ctx.fillStyle = st.ridge;
        ctx.fillRect(dcx - 1.6 * u, dtop - rh * 0.30, 3.2 * u, Math.max(2, 3.5 * u));
      };
      if (hw >= ts * 3.0) { _dormer(hcx - hw * 0.22); _dormer(hcx + hw * 0.22); }
      else _dormer(hcx + hw * 0.24);
    }
    // ---- door ----
    const dw = Math.max(ts * 0.36, Math.min(hw * (shopCls || stableCls || hallCls ? 0.34 : 0.24), ts * (shopCls || hallCls ? 1.1 : 0.78)));
    const dh = hh * (holy || hallCls ? 0.42 : 0.36);
    const doorCX = hcx, dx = doorCX - dw / 2, dy = hy + hh - dh - foundH * 0.4 - 1;
    const drawDoorCommon = (arch) => {
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      if (arch) {
        ctx.fillRect(dx - 2 * u, dy - dw * 0.28, dw + 4 * u, dh + dw * 0.28 + 2 * u);
      } else ctx.fillRect(dx - 2 * u, dy - 2 * u, dw + 4 * u, dh + 4 * u);
      // surround pilasters
      ctx.fillStyle = stone ? "#6a6a76" : st.beam;
      ctx.fillRect(dx - 4 * u, dy - 3 * u, 3.4 * u, dh + 4 * u);
      ctx.fillRect(dx + dw + 0.6 * u, dy - 3 * u, 3.4 * u, dh + 4 * u);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fillRect(dx - 4 * u, dy - 3 * u, 3.4 * u, 1.6 * u);
      ctx.fillRect(dx + dw + 0.6 * u, dy - 3 * u, 3.4 * u, 1.6 * u);
      // door leaf
      const leafC = (ck === "bathhouse") ? "#2b6fd4" : (tentCls ? "#4a3a26" : st.doorC);
      ctx.fillStyle = leafC;
      if (arch) {
        ctx.fillRect(dx, dy, dw, dh);
        ctx.beginPath(); ctx.arc(doorCX, dy, dw / 2, Math.PI, 0); ctx.fillStyle = leafC; ctx.fill();
      } else ctx.fillRect(dx, dy, dw, dh);
      // panels / planks
      ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = Math.max(1, 1.4 * u);
      if (stableCls) {
        ctx.beginPath(); ctx.moveTo(dx, dy + dh * 0.5); ctx.lineTo(dx + dw, dy + dh * 0.5); ctx.stroke();
        ctx.strokeRect(dx + 1, dy + 1, dw - 2, dh - 2);
      } else if (shopCls && !holy) {
        for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(dx + (dw * i) / 4, dy); ctx.lineTo(dx + (dw * i) / 4, dy + dh); ctx.stroke(); }
        ctx.strokeRect(dx + 1, dy + 1, dw - 2, dh - 2);
      } else {
        ctx.strokeRect(dx + 2 * u, dy + 2 * u, dw - 4 * u, dh - 4 * u);
        if (!arch) { ctx.beginPath(); ctx.moveTo(doorCX, dy); ctx.lineTo(doorCX, dy + dh); ctx.stroke(); }
      }
      // iron hinges + studs
      ctx.fillStyle = "#23232c";
      ctx.fillRect(dx + 1.5 * u, dy + dh * 0.2, 4 * u, 2 * u);
      ctx.fillRect(dx + 1.5 * u, dy + dh * 0.7, 4 * u, 2 * u);
      // knob
      ctx.fillStyle = "#ffd93d";
      ctx.fillRect(doorCX + (stableCls || shopCls ? dw * 0.32 : 2.5 * u), dy + dh * 0.55, Math.max(2, 2.4 * u), Math.max(2, 2.4 * u));
      ctx.fillStyle = "#fff2b0";
      ctx.fillRect(doorCX + (stableCls || shopCls ? dw * 0.32 : 2.5 * u), dy + dh * 0.55, 1.2 * u, 1.2 * u);
      // step + threshold
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(dx - 5 * u, dy + dh, dw + 10 * u, Math.max(2, 4.5 * u));
      ctx.fillStyle = stone ? "#8a8a96" : "#b9a888";
      ctx.fillRect(dx - 4 * u, dy + dh, dw + 8 * u, Math.max(2, 3.4 * u));
      // stoop: one more step spilling toward the lawn
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(dx - 6 * u, dy + dh + Math.max(2, 3.4 * u), dw + 12 * u, Math.max(2, 2.8 * u));
      ctx.fillStyle = stone ? "#7a7a88" : "#a89878";
      ctx.fillRect(dx - 5 * u, dy + dh + Math.max(2, 3.4 * u) - 0.8 * u, dw + 10 * u, Math.max(2, 2.4 * u));
    };
    if (holy || adobe || terrace) {
      // tall arched portal: glowing fanlight for holy, shaded adobe arch else
      if (!holy) {
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.beginPath(); ctx.arc(doorCX, dy, dw / 2 + 3 * u, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#2a1c10";
        ctx.beginPath(); ctx.arc(doorCX, dy, dw / 2, Math.PI, 0); ctx.fill();
        drawDoorCommon(true);
      } else {
        ctx.fillStyle = "#ffe9a0";
        ctx.beginPath(); ctx.arc(doorCX, dy, dw / 2, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "rgba(255,180,80,0.5)";
        ctx.beginPath(); ctx.arc(doorCX, dy, dw / 4, Math.PI, 0); ctx.fill();
        drawDoorCommon(true);
      }
    } else drawDoorCommon(false);
    // door lanterns (warm sconces flanking the door)
    if (hw > ts * 1.6 && !tentCls) {
      for (const sgn of [-1, 1]) {
        const lx = doorCX + sgn * (dw / 2 + 7 * u);
        if (lx < hx + 3 * u || lx > hx + hw - 5 * u) continue;
        const ly = dy + dh * 0.3;
        ctx.fillStyle = "#23232c";
        ctx.fillRect(lx, ly - 1 * u, 4 * u, 6 * u);
        const glow = (forgeCls || ck === "inn" || ck === "cloud_inn" || ck === "shop" || ck === "sunlit_market") ? "#ffb02e" : "#ffd97a";
        ctx.fillStyle = glow;
        ctx.fillRect(lx + 0.8 * u, ly, 2.4 * u, 4 * u);
        ctx.fillStyle = "rgba(255,200,90,0.25)";
        ctx.beginPath(); ctx.arc(lx + 2 * u, ly + 2 * u, 6 * u, 0, 7); ctx.fill();
      }
    }
    // shop / inn striped awning over door + windows (souk + harbor stalls too)
    if ((ck === "shop" || ck === "market" || ck === "sunlit_market" || ck === "inn" || ck === "cloud_inn" || ck === "tea_house" || ck === "souk_stall" || ck === "fish_market" || ck === "turquoise_shop" || ck === "grand_bazaar") && hw > ts * 1.8) {
      const aw = Math.min(hw * 0.72, dw + ts * 1.6), ah = ts * 0.30;
      const ax = doorCX - aw / 2, ay = dy - ah - 3 * u;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(ax + 1.5 * u, ay + 2 * u, aw, ah);
      const stripeA = ck === "inn" ? "#a03a2e" : ck === "tea_house" ? "#2b6fd4" : ck === "souk_stall" ? "#c94e3a" : ck === "fish_market" ? "#2b7fb4" : ck === "turquoise_shop" ? "#2ba8a0" : ck === "grand_bazaar" ? "#8a5a9a" : "#3f8a3f";
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#f2ede2" : stripeA;
        ctx.fillRect(ax + (aw * i) / 8, ay, aw / 8 + 1, ah);
      }
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(ax, ay + ah - 2 * u, aw, 2 * u);
      // scalloped hem
      ctx.fillStyle = stripeA;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.arc(ax + (aw * (i + 0.5)) / 8, ay + ah, aw / 16, 0, Math.PI); ctx.fill();
      }
    }
    // noren curtain for japanese houses
    if (ck === "machiya" || ck === "tea_house" || ck === "bathhouse" || ck === "dojo") {
      const nw = Math.min(dw + ts * 0.26, hw * 0.46), nh = ts * 0.28;
      const nx = doorCX - nw / 2, ny = dy - nh + 2;
      const cols = ck === "machiya" ? ["#1e2438", "#e8a0c0", "#1e2438"] : ck === "tea_house" ? ["#2b6fd4", "#f2f2f2", "#2b6fd4"] : ck === "dojo" ? ["#1e2438", "#f2f2f2", "#1e2438"] : ["#2b6fd4", "#2b6fd4", "#2b6fd4"];
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(nx, ny + 1.5 * u, nw, nh);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(nx + (nw * i) / 3, ny, nw / 3 + 1, nh); }
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      for (let i = 1; i < 3; i++) ctx.fillRect(nx + (nw * i) / 3 - 1, ny, 2, nh);
    }
    // ---- windows ----
    const winGlow = (forgeCls) ? "#ffb02e" : "#ffd97a";
    if (holy) {
      const ww = Math.min(ts * 0.46, hw * 0.14), wh = Math.min(ts * 0.95, (dy - ey) * 0.72);
      const wy = ey + (dy - ey) * 0.42, gap = Math.max(5 * u, ts * 0.16);
      for (const sgn of [-1, 1]) {
        const wx = doorCX + sgn * (dw / 2 + gap + ww / 2) - ww / 2;
        if (wx < hx + 3 || wx + ww > hx + hw - 3) continue;
        // stone surround + arch top
        ctx.fillStyle = stone ? "#5a5a64" : st.trim;
        ctx.fillRect(wx - 2.5 * u, wy - ww / 2 - 4 * u, ww + 5 * u, wh + 6 * u);
        const grad = ctx.createLinearGradient(0, wy - ww / 2, 0, wy + wh);
        grad.addColorStop(0, "#fff3c0"); grad.addColorStop(0.5, "#ffd97a"); grad.addColorStop(1, "#c96a2e");
        ctx.fillStyle = grad;
        ctx.fillRect(wx, wy - ww / 2, ww, wh);
        ctx.beginPath(); ctx.arc(wx + ww / 2, wy - ww / 2, ww / 2, Math.PI, 0); ctx.fill();
        // tracery: cross mullion + diamond
        ctx.fillStyle = st.trim;
        ctx.fillRect(wx + ww / 2 - u, wy - ww / 2, 2 * u, wh + ww / 2);
        ctx.fillRect(wx, wy + wh * 0.4, ww, 2 * u);
        ctx.fillStyle = ck === "shrine" || ck === "tide_temple" ? "#59d6d6" : "#c0392b";
        ctx.fillRect(wx + ww / 2 - 1.6 * u, wy + wh * 0.4 - 4 * u, 3.2 * u, 8 * u);
      }
      // rose window for the grandest
      if ((ck === "cathedral" || ck === "radiant_cathedral" || ck === "church" || ck === "dawn_church" || ck === "tide_temple") && hw > ts * 2.4) {
        const rw = Math.min(ts * 0.5, hw * 0.16);
        ctx.fillStyle = st.trim;
        ctx.beginPath(); ctx.arc(hcx, bandY - ts * 0.28, rw + 2.5 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#ffe9a0";
        ctx.beginPath(); ctx.arc(hcx, bandY - ts * 0.28, rw, 0, 7); ctx.fill();
        ctx.strokeStyle = st.trim; ctx.lineWidth = 1.6 * u;
        ctx.beginPath(); ctx.arc(hcx, bandY - ts * 0.28, rw * 0.55, 0, 7); ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(hcx, bandY - ts * 0.28);
          ctx.lineTo(hcx + Math.cos(a) * rw, bandY - ts * 0.28 + Math.sin(a) * rw); ctx.stroke();
        }
      }
    } else if (japan) {
      // shoji: glowing paper grid with wood frame
      const ww = Math.min(Math.max(hw * 0.17, ts * 0.42), ts * 0.72);
      const wh = ww * 1.15;
      const wy = ey + (dy - ey) * 0.40, gap = Math.max(5 * u, ts * 0.16);
      for (const sgn of [-1, 1]) {
        const wx = doorCX + sgn * (dw / 2 + gap + ww / 2) - ww / 2;
        if (wx < hx + 3 || wx + ww > hx + hw - 3) continue;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(wx - 2 * u, wy - 2 * u, ww + 4 * u, wh + 4 * u);
        ctx.fillStyle = "#f7efda";
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = "rgba(255,190,120,0.35)";
        ctx.fillRect(wx, wy, ww, wh * 0.4);
        ctx.fillStyle = "#3a2c1e";
        ctx.fillRect(wx + ww / 2 - u, wy, 2 * u, wh);
        ctx.fillRect(wx, wy + wh / 2 - u, ww, 2 * u);
        ctx.strokeStyle = "#3a2c1e"; ctx.lineWidth = Math.max(1.5, 2 * u);
        ctx.strokeRect(wx - u, wy - u, ww + 2 * u, wh + 2 * u);
        // wood sill + bamboo blind roll
        ctx.fillStyle = "#6a4a2e";
        ctx.fillRect(wx - 2 * u, wy + wh + 1 * u, ww + 4 * u, 2.6 * u);
      }
    } else {
      const ww = Math.min(Math.max(hw * 0.14, ts * 0.34), ts * 0.56);
      const wh = ww * (twoStory ? 1.05 : 1.0);
      const wy = ey + (dy - ey) * 0.36, gap = Math.max(5 * u, ts * 0.16);
      for (const sgn of [-1, 1]) {
        const wx = doorCX + sgn * (dw / 2 + gap + ww / 2) - ww / 2;
        if (wx < hx + 3 || wx + ww > hx + hw - 3) continue;
        // shutters
        const sw = Math.min(6 * u, ts * 0.18);
        ctx.fillStyle = tentCls ? "#3a2c1c" : st.trim;
        ctx.fillRect(wx - sw - 1.5 * u, wy - 1 * u, sw, wh + 2 * u);
        ctx.fillRect(wx + ww + 1.5 * u, wy - 1 * u, sw, wh + 2 * u);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        for (let sy = wy; sy < wy + wh; sy += 4 * u) {
          ctx.fillRect(wx - sw - 1.5 * u, sy, sw, 1.2 * u);
          ctx.fillRect(wx + ww + 1.5 * u, sy, sw, 1.2 * u);
        }
        // frame + glow
        ctx.fillStyle = "rgba(0,0,0,0.38)";
        ctx.fillRect(wx - 1.5 * u, wy - 1.5 * u, ww + 3 * u, wh + 3 * u);
        const gg = ctx.createLinearGradient(0, wy, 0, wy + wh);
        gg.addColorStop(0, "#fff0b8"); gg.addColorStop(0.35, winGlow); gg.addColorStop(1, "#b06a2a");
        ctx.fillStyle = gg;
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(wx, wy, ww, wh * 0.26);
        // crossbars
        ctx.fillStyle = st.trim;
        ctx.fillRect(wx + ww / 2 - u, wy, 2 * u, wh);
        ctx.fillRect(wx, wy + wh / 2 - u, ww, 2 * u);
        ctx.strokeStyle = st.trim; ctx.lineWidth = Math.max(1.5, 2 * u);
        ctx.strokeRect(wx - u, wy - u, ww + 2 * u, wh + 2 * u);
        // sill + flower box for homes
        ctx.fillStyle = stone ? "#7a7a88" : "#8a6a45";
        ctx.fillRect(wx - 2 * u, wy + wh + 1 * u, ww + 4 * u, 2.8 * u);
        if ((ck === "cottage" || ck === "cloud_cottage" || ck === "farmhouse" || ck === "halo_grove" || ck === "timber_house" || ck === "townhouse" || ck === "inn" || ck === "cloud_inn" || ck === "canal_house" || ck === "machiya") && wh > 6 * u) {
          ctx.fillStyle = "#5a3a22";
          ctx.fillRect(wx - 1 * u, wy + wh + 3.4 * u, ww + 2 * u, 4 * u);
          ctx.fillStyle = "#2e7d3a";
          ctx.fillRect(wx, wy + wh + 1.6 * u, ww, 3 * u);
          ctx.fillStyle = "#e8546a";
          ctx.fillRect(wx + 1 * u, wy + wh - 0.5 * u, 2.6 * u, 2.6 * u);
          ctx.fillStyle = "#ffd93d";
          ctx.fillRect(wx + ww / 2 - 1 * u, wy + wh - 0.5 * u, 2.6 * u, 2.6 * u);
          ctx.fillStyle = "#f2f2f2";
          ctx.fillRect(wx + ww - 3.4 * u, wy + wh - 0.5 * u, 2.6 * u, 2.6 * u);
        }
      }
      // attic round window under the gable for two-story houses
      if (twoStory && hw > ts * 2.0) {
        const ar = Math.min(ts * 0.16, hw * 0.05);
        const ax = hcx, ay = ey - rh * 0.42;
        ctx.fillStyle = st.trim;
        ctx.beginPath(); ctx.arc(ax, ay, ar + 2 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#9adcff";
        ctx.beginPath(); ctx.arc(ax, ay, ar, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath(); ctx.arc(ax - ar * 0.3, ay - ar * 0.3, ar * 0.35, 0, 7); ctx.fill();
        ctx.fillStyle = st.trim;
        ctx.fillRect(ax - ar, ay - 1 * u, ar * 2, 2 * u);
        ctx.fillRect(ax - 1 * u, ay - ar, 2 * u, ar * 2);
      }
      // harbor porthole: brass-ringed round light on the gable for harbor classes
      if ((ck === "lighthouse" || ck === "dockhouse" || ck === "harbor_office" || ck === "sail_loft") && hw > ts * 1.6) {
        const pr = Math.min(ts * 0.20, hw * 0.06);
        const px2 = hcx, py2 = bandY - ts * 0.30;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.arc(px2 + 1.5 * u, py2 + 2 * u, pr + 2.5 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#8a6a2a";
        ctx.beginPath(); ctx.arc(px2, py2, pr + 2.5 * u, 0, 7); ctx.fill();
        ctx.fillStyle = "#d9b83d";
        ctx.beginPath(); ctx.arc(px2, py2, pr + 1 * u, 0, 7); ctx.fill();
        const pgg = ctx.createRadialGradient(px2 - pr * 0.3, py2 - pr * 0.3, pr * 0.1, px2, py2, pr);
        pgg.addColorStop(0, "#e8fbff"); pgg.addColorStop(0.55, "#9adcff"); pgg.addColorStop(1, "#3a7bd4");
        ctx.fillStyle = pgg;
        ctx.beginPath(); ctx.arc(px2, py2, pr, 0, 7); ctx.fill();
        ctx.fillStyle = "#8a6a2a";
        ctx.fillRect(px2 - pr, py2 - 1 * u, pr * 2, 2 * u);
        ctx.fillRect(px2 - 1 * u, py2 - pr, 2 * u, pr * 2);
        // rivets around the brass ring
        ctx.fillStyle = "#5e4a1a";
        for (let ri = 0; ri < 6; ri++) {
          const ra = (ri / 6) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(px2 + Math.cos(ra) * (pr + 1.6 * u), py2 + Math.sin(ra) * (pr + 1.6 * u), Math.max(1, 1.2 * u), 0, 7); ctx.fill();
        }
      }
      // upper-floor windows row
      if (twoStory && hw > ts * 2.6) {
        const uw = ts * 0.30, uh = ts * 0.34;
        const uy = bandY - uh - 5 * u;
        for (let i = -1; i <= 1; i++) {
          const ux = hcx + i * (uw + ts * 0.34) - uw / 2;
          if (ux < hx + 4 || ux + uw > hx + hw - 4) continue;
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(ux - 1.5 * u, uy - 1.5 * u, uw + 3 * u, uh + 3 * u);
          ctx.fillStyle = winGlow;
          ctx.fillRect(ux, uy, uw, uh);
          ctx.fillStyle = st.trim;
          ctx.fillRect(ux + uw / 2 - u, uy, 2 * u, uh);
          ctx.fillRect(ux, uy + uh / 2 - u, uw, 2 * u);
        }
      }
    }
    // forge glow spilling from the door + windows
    if (forgeCls) {
      ctx.fillStyle = "rgba(255,140,40,0.30)";
      ctx.fillRect(dx - 6 * u, dy + dh - 2 * u, dw + 12 * u, 6 * u);
      ctx.fillStyle = "rgba(255,180,80,0.5)";
      ctx.fillRect(dx - 2 * u, dy + dh - 1 * u, dw + 4 * u, 2.4 * u);
    }
    // lighthouse beacon: red shaft bands flanking the door + a glowing lamp
    // dormer centered on the roof (dormer-scale, so it stays inside the plot)
    if (ck === "lighthouse") {
      // shaft bands (leave the door leaf alone)
      const bandH = Math.max(2, ts * 0.14);
      const wallTop = ey + 3 * u, wallBot = hy + hh - 2 * u;
      for (const fy of [wallTop + (wallBot - wallTop) * 0.22, wallTop + (wallBot - wallTop) * 0.55]) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(hx + 3 + 1.5 * u, fy + 1.5 * u, hw - 6, bandH);
        ctx.fillStyle = "#a03a2e";
        ctx.fillRect(hx + 3, fy, Math.max(1, dx - 3 - (hx + 3)), bandH);
        ctx.fillRect(dx + dw + 3, fy, Math.max(1, (hx + hw - 3) - (dx + dw + 3)), bandH);
      }
      // lamp dormer on the roof face
      const dwm = Math.min(ts * 1.0, hw * 0.44);
      const dtop = hy + rh * 0.22, dbase = ey - rh * 0.06, dhgt = dbase - dtop;
      const dx0 = hcx - dwm / 2;
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.fillRect(dx0 + 1.5 * u, dtop + 2 * u, dwm, dhgt);
      ctx.fillStyle = "#2e3a48";
      ctx.fillRect(dx0, dtop, dwm, dhgt);
      const lampX = dx0 + dwm * 0.18, lampW = dwm * 0.64, lampY = dtop + dhgt * 0.18, lampH = dhgt * 0.60;
      const lgg = ctx.createRadialGradient(hcx, lampY + lampH / 2, 1, hcx, lampY + lampH / 2, lampW);
      lgg.addColorStop(0, "#fff8d0"); lgg.addColorStop(0.55, "#ffd93d"); lgg.addColorStop(1, "#c96a2e");
      ctx.fillStyle = lgg;
      ctx.fillRect(lampX, lampY, lampW, lampH);
      ctx.fillStyle = "#2e3a48";
      ctx.fillRect(hcx - u, lampY, 2 * u, lampH);
      ctx.fillRect(lampX, lampY + lampH / 2 - u, lampW, 2 * u);
      // mini gable cap over the lamp (peak below the main ridge, as dormers)
      ctx.fillStyle = "#a03a2e";
      ctx.beginPath();
      ctx.moveTo(dx0 - 2.5 * u, dtop); ctx.lineTo(hcx, dtop - rh * 0.24); ctx.lineTo(dx0 + dwm + 2.5 * u, dtop);
      ctx.closePath(); ctx.fill();
      // warm halo hugging the lamp (over our own roof only)
      ctx.fillStyle = "rgba(255,220,120,0.25)";
      ctx.beginPath(); ctx.arc(hcx, lampY + lampH / 2, lampW * 0.85, 0, 7); ctx.fill();
    }
    // class emblem shield on the gable + name plaque
    try { paintHouseEmblem(ctx, { hx, hy, hw, hh, hcx, ey, rh, ts, u, st, ck, doorCX, dy }); } catch (e) { }
    const label = (P.b && P.b.title) || ck;
    const fs = Math.max(8, Math.min(ts * 0.27, (hw * 0.66) / Math.max(4, label.length * 0.58)));
    ctx.font = "bold " + Math.round(fs) + "px sans-serif";
    const pwS = Math.min(hw * 0.78, ctx.measureText(label).width + 12 * u);
    const phS = fs + 7 * u, px = hcx - pwS / 2;
    let py = ey + 3 * u;
    if (py + phS > dy - 3 * u) py = dy - phS - 3 * u;
    if (py < hy + 2) py = hy + 2;
    if (py + phS > hy + hh - 2) py = hy + hh - phS - 2;
    // carved wood plaque with nails
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(px + 1.5 * u, py + 2 * u, pwS, phS);
    ctx.fillStyle = "#4a3320";
    ctx.fillRect(px, py, pwS, phS);
    ctx.fillStyle = "#6b4e2e";
    ctx.fillRect(px + 1.5 * u, py + 1.5 * u, pwS - 3 * u, phS - 3 * u);
    ctx.fillStyle = "#3a2812";
    ctx.fillRect(px + 1 * u, py + 1 * u, 2 * u, 2 * u);
    ctx.fillRect(px + pwS - 3 * u, py + 1 * u, 2 * u, 2 * u);
    ctx.fillRect(px + 1 * u, py + phS - 3 * u, 2 * u, 2 * u);
    ctx.fillRect(px + pwS - 3 * u, py + phS - 3 * u, 2 * u, 2 * u);
    ctx.strokeStyle = "#c9a86a"; ctx.lineWidth = 1.2;
    ctx.strokeRect(px + 0.5, py + 0.5, pwS - 1, phS - 1);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe9b0";
    ctx.fillText(label, hcx, py + phS / 2 + 1);
    ctx.textBaseline = "alphabetic";
    // side props flanking the house (only where the lawn margin fits)
    try {
      const sideY = hy + hh - ts * 0.5;
      const lw = x0ofPlot(b, hx, hw, ts);
      void lw;
      const plotW = (b && b.w ? b.w * ts : hw / 0.74);
      const mL = hx - (hcx - plotW / 2), mR = (hcx + plotW / 2) - (hx + hw);
      if (mL > ts * 0.5) drawSideProp(ctx, hx - ts * 0.55, sideY, ts, u, st, ck, -1, hr);
      if (mR > ts * 0.5) drawSideProp(ctx, hx + hw + ts * 0.55 - ts * 0.4, sideY, ts, u, st, ck, 1, hr);
    } catch (e) { }
    // vines / ivy on old walls
    if ((ck === "cottage" || ck === "cloud_cottage" || ck === "chapel" || ck === "halo_chapel" || ck === "dawn_church" || ck === "farmhouse" || ck === "halo_grove" || ck === "shrine") && hw > ts * 1.6) {
      ctx.fillStyle = "rgba(46,125,58,0.85)";
      const vx = hx + 2 * u;
      for (let vy = hy + hh * 0.3; vy < hy + hh - 4 * u; vy += 6 * u) {
        ctx.fillRect(vx, vy, 3 * u, 4 * u);
        ctx.fillRect(vx + 3 * u, vy + 2 * u, 3 * u, 3 * u);
      }
      ctx.fillStyle = "rgba(120,200,130,0.5)";
      for (let vy = hy + hh * 0.3; vy < hy + hh - 4 * u; vy += 12 * u) ctx.fillRect(vx + 1 * u, vy + 1 * u, 1.6 * u, 1.6 * u);
    }
  }
  function x0ofPlot() { return 0; }
  // one flanking prop per side, chosen by class family
  function drawSideProp(ctx, sx, sy, ts, u, st, ck, dir, hr) {
    const s = ts * 0.4, R = (v) => Math.max(1, v * u);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath(); ctx.ellipse(sx + s / 2, sy + s * 0.55, s * 0.55, s * 0.22, 0, 0, 7); ctx.fill();
    if (ck === "forge" || ck === "forge_works" || ck === "great_forge" || ck === "smithy_shed" || ck === "dawn_smithy" || ck === "dawn_forge" || ck === "bronze_forge" || ck === "scrap_workshop") {
      // quench barrel + coal pile
      ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx, sy - s * 0.7, s * 0.7, s * 0.9);
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 1, sy - s * 0.7, s * 0.7 - 2, s * 0.9);
      ctx.fillStyle = "#2e2622"; ctx.fillRect(sx + 1, sy - s * 0.7, s * 0.7 - 2, 3 * u);
      ctx.fillStyle = "#23232c";
      ctx.fillRect(sx + s * 0.75, sy - s * 0.25, s * 0.5, s * 0.45);
      ctx.fillStyle = "#3a3a44";
      ctx.fillRect(sx + s * 0.8, sy - s * 0.2, 2.4 * u, 2.4 * u);
      ctx.fillStyle = "rgba(255,120,40,0.7)";
      ctx.fillRect(sx + s * 0.8, sy - s * 0.32, s * 0.5, 1.6 * u);
    } else if (ck === "warehouse" || ck === "storehouse" || ck === "moss_cache" || ck === "loot_house" || ck === "market" || ck === "sunlit_market" || ck === "shop" || ck === "scrap_heap" || ck === "bone_pile" || ck === "ossuary") {
      // stacked crate + barrel
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx, sy - s * 0.8, s * 0.8, s * 0.8);
      ctx.strokeStyle = "#5a3a22"; ctx.lineWidth = R(1.2);
      ctx.strokeRect(sx, sy - s * 0.8, s * 0.8, s * 0.8);
      ctx.beginPath(); ctx.moveTo(sx, sy - s * 0.8); ctx.lineTo(sx + s * 0.8, sy); ctx.stroke();
      ctx.fillStyle = "#6e4a26"; ctx.fillRect(sx + s * 0.35, sy - s * 0.15, s * 0.55, s * 0.35);
    } else if (ck === "sauna") {
      // stacked firewood + birch whisk
      ctx.fillStyle = "#6b4226";
      for (let i = 0; i < 3; i++) ctx.fillRect(sx + (dir < 0 ? s * 0.1 : 0) + (i % 2) * 2 * u, sy - s * (0.35 + i * 0.18), s * 0.65, 3 * u);
      ctx.fillStyle = "#8a5a33";
      ctx.fillRect(sx + (dir < 0 ? 0 : s * 0.55), sy - s * 0.9, 2.4 * u, s * 1.0);
      ctx.fillStyle = "#3e7d3a";
      ctx.beginPath(); ctx.ellipse(sx + (dir < 0 ? 1.2 * u : s * 0.55 + 1.2 * u), sy - s * 0.95, 4 * u, 2.6 * u, 0.5, 0, 7); ctx.fill();
    } else if (ck === "horse_pen" || ck === "farmhouse" || ck === "halo_grove" || ck === "cottage" || ck === "cloud_cottage" || ck === "stable" || ck === "warg_pen" || isBeastLodgeKey(ck)) {
      // hay bale / woodpile
      if ((hr() < 0.5)) {
        ctx.fillStyle = "#c9a83d"; ctx.fillRect(sx, sy - s * 0.55, s * 0.9, s * 0.6);
        ctx.strokeStyle = "#8a6a1a"; ctx.lineWidth = 1;
        ctx.strokeRect(sx, sy - s * 0.55, s * 0.9, s * 0.6);
        ctx.beginPath(); ctx.moveTo(sx, sy - s * 0.25); ctx.lineTo(sx + s * 0.9, sy - s * 0.25); ctx.stroke();
      } else {
        ctx.fillStyle = "#6b4226";
        for (let i = 0; i < 3; i++) ctx.fillRect(sx + i * 2 * u, sy - s * (0.3 + i * 0.18), s * 0.8, 3 * u);
      }
    } else if (st.name === "tile" || st.name === "dawn" || ck === "shrine" || ck === "tea_house" || ck === "bathhouse" || ck === "dojo" || ck === "machiya" || ck === "spirit_shrine") {
      // mini stone lantern
      ctx.fillStyle = "#6a6a72"; ctx.fillRect(sx + s * 0.25, sy - s * 0.2, s * 0.4, s * 0.35);
      ctx.fillStyle = "#55555c"; ctx.fillRect(sx + s * 0.15, sy - s * 0.3, s * 0.6, 2.4 * u);
      ctx.fillStyle = "#3a3a42"; ctx.fillRect(sx + s * 0.3, sy - s * 0.75, s * 0.3, s * 0.45);
      ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + s * 0.36, sy - s * 0.68, s * 0.18, s * 0.3);
      ctx.fillStyle = "#55555c"; ctx.fillRect(sx + s * 0.2, sy - s * 0.9, s * 0.5, 2.4 * u);
    } else if (ck === "inn" || ck === "cloud_inn" || ck === "tavern") {
      // barrel + hanging mug sign post
      ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + (dir < 0 ? s * 0.5 : 0), sy - s * 0.7, 2.4 * u, s * 0.9);
      ctx.fillStyle = "#c9a86a"; ctx.fillRect(sx + (dir < 0 ? 0 : s * 0.1), sy - s * 1.0, s * 0.7, s * 0.4);
      ctx.fillStyle = "#2b2118"; ctx.fillRect(sx + (dir < 0 ? s * 0.08 : s * 0.18), sy - s * 0.95, s * 0.54, s * 0.3);
    } else {
      // potted shrub / barrel generic
      ctx.fillStyle = "#7a4a2a"; ctx.fillRect(sx + s * 0.2, sy - s * 0.25, s * 0.5, s * 0.4);
      ctx.fillStyle = "#2e7d3a";
      ctx.beginPath(); ctx.arc(sx + s * 0.45, sy - s * 0.45, s * 0.35, 0, 7); ctx.fill();
      ctx.fillStyle = "#3f9a46";
      ctx.beginPath(); ctx.arc(sx + s * 0.35, sy - s * 0.55, s * 0.22, 0, 7); ctx.fill();
    }
  }

  // One class emblem per estate house, on a shield plaque on the gable.
  function paintHouseEmblem(ctx, E) {
    const hcx = E.hcx, hy = E.hy, rh = E.rh, hw = E.hw;
    const u = E.u, ts = E.ts, ck = E.ck || "";
    const st = E.st || {};
    const R = (v) => Math.max(1, v * u);
    const gy = hy + rh * 0.52;
    // shield backing so every emblem reads at plot scale
    const shW = Math.min(hw * 0.30, ts * 1.0), shH = shW * 1.15;
    const shX = hcx - shW / 2, shY = gy - shH / 2;
    // don't cover tiny gables
    if (shW < 10 * u) return;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(shX + 1.5 * u, shY + 2 * u, shW, shH);
    ctx.fillStyle = (st.name === "tile") ? "#2e2018" : "#3a2c1c";
    ctx.fillRect(shX, shY, shW, shH);
    ctx.fillStyle = (st.name === "tile") ? "#5a4a33" : "#6b4e2e";
    ctx.fillRect(shX + 1.5 * u, shY + 1.5 * u, shW - 3 * u, shH - 3 * u);
    ctx.strokeStyle = "#c9a86a"; ctx.lineWidth = 1.2;
    ctx.strokeRect(shX + 0.5, shY + 0.5, shW - 1, shH - 1);
    ctx.save();
    ctx.beginPath(); ctx.rect(shX + 1.5 * u, shY + 1.5 * u, shW - 3 * u, shH - 3 * u); ctx.clip();
    const cx = hcx, cy = shY + shH * 0.46;
    if (ck === "chapel" || ck === "church" || ck === "cathedral" || ck === "bone_chapel" || ck === "sun_temple" || ck === "high_temple" || ck === "kiva" || ck === "halo_chapel" || ck === "dawn_church" || ck === "radiant_cathedral") {
      ctx.fillStyle = "#ffd93d";
      ctx.fillRect(cx - R(2.4), cy - R(13), R(4.8), R(22));
      ctx.fillRect(cx - R(8), cy - R(7), R(16), R(4.8));
      ctx.fillStyle = "#fff";
      ctx.fillRect(cx - R(1), cy - R(12), R(2), R(20));
      if (ck === "cathedral" || ck === "radiant_cathedral") {
        ctx.fillStyle = "#c0392b";
        ctx.beginPath(); ctx.arc(cx, cy - R(16), R(3.4), 0, 7); ctx.fill();
      }
    } else if (ck === "rune_chapel" || ck === "rite_circle" || ck === "sky_shrine" || ck === "runestone_hut") {
      ctx.strokeStyle = "#ffb02e"; ctx.lineWidth = R(2.2);
      ctx.beginPath(); ctx.arc(cx, cy, R(9), 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R(5), 0, 7); ctx.stroke();
      ctx.fillStyle = "#ffb02e"; ctx.fillRect(cx - R(1.5), cy - R(13), R(3), R(6));
      ctx.fillRect(cx - R(1.5), cy + R(7), R(3), R(6));
    } else if (ck === "forge" || ck === "forge_works" || ck === "great_forge" || ck === "smithy_shed" || ck === "bronze_forge" || ck === "scrap_workshop" || ck === "dawn_smithy" || ck === "dawn_forge") {
      ctx.fillStyle = "#23232c";
      ctx.fillRect(cx - R(10), cy + R(1), R(20), R(6.5));
      ctx.fillRect(cx - R(3.5), cy - R(6), R(7), R(9));
      ctx.fillStyle = "#8a8f9a";
      ctx.fillRect(cx - R(10), cy + R(1), R(20), R(1.8));
      ctx.fillStyle = "#ff6b2e";
      ctx.beginPath(); ctx.arc(cx + R(15), cy + R(3), R(5.5), 0, 7); ctx.fill();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.arc(cx + R(15), cy + R(3), R(2.8), 0, 7); ctx.fill();
    } else if (ck === "inn" || ck === "cloud_inn" || ck === "mead_hall" || ck === "great_hall" || ck === "moss_hall" || ck === "bull_hall" || ck === "orc_hall" || ck === "tavern_hall" || ck === "caravanserai" || ck === "khan_hall" || ck === "terrace_hall" || ck === "ice_hall") {
      ctx.fillStyle = "#2b2118"; ctx.fillRect(cx - R(8), cy - R(10), R(16), R(18));
      ctx.fillStyle = "#c9a86a"; ctx.fillRect(cx - R(6), cy - R(8), R(12), R(14));
      ctx.fillStyle = "#fff"; ctx.fillRect(cx - R(6), cy - R(8), R(12), R(4.5));
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(cx - R(1.2), cy - R(8), R(2.4), R(14));
    } else if (ck === "shop" || ck === "market" || ck === "sunlit_market" || ck === "loot_house" || ck === "souk_stall" || ck === "grand_bazaar" || ck === "fish_market" || ck === "turquoise_shop" || ck === "counting_house") {
      ctx.fillStyle = "#8a6a1a";
      ctx.beginPath(); ctx.arc(cx, cy, R(9), 0, 7); ctx.fill();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.arc(cx, cy, R(7), 0, 7); ctx.fill();
      ctx.fillStyle = "#8a6a1a";
      ctx.fillRect(cx - R(1.6), cy - R(5.5), R(3.2), R(9));
      ctx.fillStyle = "#fff2b0";
      ctx.fillRect(cx - R(1.6), cy - R(5.5), R(3.2), R(2.4));
    } else if (ck === "shrine" || ck === "spirit_shrine") {
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(cx - R(14), cy - R(11), R(4.5), R(20));
      ctx.fillRect(cx + R(9.5), cy - R(11), R(4.5), R(20));
      ctx.fillRect(cx - R(17), cy - R(14), R(34), R(5.5));
      ctx.fillStyle = "#2b2118"; ctx.fillRect(cx - R(18), cy - R(18), R(36), R(3.4));
    } else if (ck === "tide_temple" || ck === "sunken_chapel") {
      ctx.fillStyle = "#e8a0c0";
      ctx.beginPath(); ctx.arc(cx, cy + R(4), R(9), Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#59d6d6";
      ctx.beginPath(); ctx.arc(cx, cy + R(6), R(4.5), 0, 7); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(cx - R(3), cy + R(2), R(1.6), 0, 7); ctx.fill();
    } else if (ck === "warehouse" || ck === "storehouse" || ck === "moss_cache" || ck === "ossuary" || ck === "egg_vault" || ck === "cairn" || ck === "scrap_heap" || ck === "bone_pile" || ck === "trade_warehouse" || ck === "sail_loft" || ck === "harbor_office") {
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(cx - R(10), cy - R(8), R(16), R(16));
      ctx.strokeStyle = "#4a2f1a"; ctx.lineWidth = R(1.6); ctx.strokeRect(cx - R(10), cy - R(8), R(16), R(16));
      ctx.beginPath(); ctx.moveTo(cx - R(10), cy - R(8)); ctx.lineTo(cx + R(6), cy + R(8)); ctx.stroke();
      ctx.fillStyle = "#8a5a33"; ctx.beginPath(); ctx.arc(cx + R(11), cy + R(4), R(8), 0, 7); ctx.fill();
      ctx.strokeStyle = "#4a2f1a"; ctx.beginPath(); ctx.arc(cx + R(11), cy + R(4), R(8), 0, 7); ctx.stroke();
    } else if (ck === "barracks" || ck === "seraph_barracks" || ck === "dojo" || ck === "maze_cell" || ck === "city_watch" || ck === "castle_keep") {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.6);
      ctx.fillStyle = "#e8ecf2"; ctx.fillRect(-R(1.6), -R(12), R(3.2), R(24)); ctx.restore();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.6);
      ctx.fillStyle = "#e8ecf2"; ctx.fillRect(-R(1.6), -R(12), R(3.2), R(24)); ctx.restore();
      ctx.fillStyle = ck === "dojo" ? "#c0392b" : "#ffd93d";
      ctx.beginPath(); ctx.arc(cx, cy + R(14), R(4.6), 0, 7); ctx.fill();
    } else if (ck === "guildhall" || ck === "kobold_nook" || ck === "chancery" || ck === "courthouse" || ck === "harbor_office" || ck === "counting_house") {
      ctx.fillStyle = "#5e2018"; ctx.fillRect(cx - R(8), cy - R(12), R(16), R(19));
      ctx.fillStyle = "#d9bd76"; ctx.beginPath(); ctx.arc(cx, cy - R(3), R(4), 0, 7); ctx.fill();
      ctx.fillStyle = "#5e2018"; ctx.fillRect(cx - R(5), cy + R(3), R(10), R(4));
    } else if (ck === "manor" || ck === "alpha_mound" || ck === "wight_throne" || ck === "palace" || ck === "noble_villa" || ck === "merchant_villa" || ck === "matriarch_perch") {
      ctx.fillStyle = "#ffd93d";
      ctx.fillRect(cx - R(9), cy - R(8), R(18), R(8));
      ctx.beginPath();
      ctx.moveTo(cx - R(9), cy - R(8)); ctx.lineTo(cx - R(9), cy - R(14)); ctx.lineTo(cx - R(4.5), cy - R(10));
      ctx.lineTo(cx, cy - R(15)); ctx.lineTo(cx + R(4.5), cy - R(10)); ctx.lineTo(cx + R(9), cy - R(14));
      ctx.lineTo(cx + R(9), cy - R(8)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c0392b";
      ctx.beginPath(); ctx.arc(cx, cy - R(4), R(2.4), 0, 7); ctx.fill();
    } else if (ck === "townhouse" || ck === "lookout" || ck === "lighthouse" || ck === "sauna") {
      ctx.strokeStyle = "#c9ccd4"; ctx.lineWidth = R(1.8);
      ctx.beginPath(); ctx.arc(cx, cy, R(7), 0, 7); ctx.stroke();
      ctx.fillStyle = "#26303c";
      ctx.beginPath(); ctx.arc(cx, cy, R(5.4), 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(140,180,220,0.85)";
      ctx.beginPath(); ctx.arc(cx - R(1.6), cy - R(1.6), R(1.8), 0, 7); ctx.fill();
    } else if (ck === "canal_house") {
      ctx.strokeStyle = "#5cc2d4"; ctx.lineWidth = R(2.6);
      ctx.beginPath(); ctx.arc(cx, cy, R(7.5), 0, 7); ctx.stroke();
      ctx.fillStyle = "#26303c";
      ctx.beginPath(); ctx.arc(cx, cy, R(4.4), 0, 7); ctx.fill();
      ctx.fillStyle = "#5cc2d4";
      ctx.beginPath(); ctx.arc(cx, cy, R(1.8), 0, 7); ctx.fill();
    } else if (ck === "farmhouse" || ck === "warg_pen") {
      ctx.fillStyle = "#d9a83d"; ctx.fillRect(cx - R(9), cy - R(7), R(18), R(14));
      ctx.strokeStyle = "#8a6a1a"; ctx.lineWidth = R(1.6);
      ctx.strokeRect(cx - R(9), cy - R(7), R(18), R(14));
      ctx.beginPath(); ctx.arc(cx, cy + R(1), R(6), 0, 7); ctx.stroke();
      ctx.fillStyle = "#8a6a1a";
      ctx.fillRect(cx - R(1.4), cy - R(4), R(2.8), R(9));
    } else if (ck === "cottage" || ck === "timber_house" || ck === "goblin_hut" || ck === "orc_hut" || ck === "troll_hovel" || ck === "coil_den" || ck === "gnoll_hide" || ck === "kobold_burrow" || ck === "brigand_tent" || ck === "war_tent" || ck === "adobe_house" || ck === "ger" || ck === "pueblo_house" || ck === "snow_cottage" || ck === "dockhouse" || ck === "horse_pen") {
      // round window / moon / eye per hide
      const moon = (ck === "goblin_hut" || ck === "kobold_burrow");
      ctx.fillStyle = moon ? "#8ae08a" : "#26303c";
      ctx.beginPath(); ctx.arc(cx, cy, R(6), 0, 7); ctx.fill();
      ctx.fillStyle = moon ? "#2a4a22" : "rgba(140,180,220,0.85)";
      ctx.beginPath(); ctx.arc(cx - R(1.6), cy - R(1.6), R(2), 0, 7); ctx.fill();
      if (ck === "war_tent" || ck === "brigand_tent") {
        ctx.fillStyle = "#c9ccd4";
        ctx.fillRect(cx + R(8), cy - R(6), R(2.4), R(12));
        ctx.fillRect(cx - R(10.5), cy - R(6), R(2.4), R(12));
      }
    } else if (ck === "machiya") {
      ctx.fillStyle = "#f2f2f2";
      ctx.beginPath(); ctx.arc(cx, cy, R(6.5), 0, 7); ctx.fill();
      ctx.fillStyle = "#1e2438";
      ctx.beginPath(); ctx.arc(cx, cy, R(6.5), Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
    } else if (ck === "tea_house") {
      ctx.fillStyle = "#f2ede2"; ctx.fillRect(cx - R(7), cy - R(2), R(14), R(8));
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(cx - R(7), cy - R(2), R(14), R(2.4));
      ctx.strokeStyle = "rgba(60,40,20,0.8)"; ctx.lineWidth = R(1.4);
      ctx.beginPath(); ctx.moveTo(cx - R(2), cy - R(4)); ctx.quadraticCurveTo(cx - R(4), cy - R(10), cx - R(1), cy - R(12)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + R(2), cy - R(4)); ctx.quadraticCurveTo(cx + R(4), cy - R(10), cx + R(1), cy - R(12)); ctx.stroke();
    } else if (ck === "bathhouse") {
      ctx.strokeStyle = "rgba(240,248,255,0.9)"; ctx.lineWidth = R(1.8);
      for (let i = -1; i <= 1; i++) {
        const sx = cx + i * R(5);
        ctx.beginPath(); ctx.moveTo(sx, cy + R(9));
        ctx.quadraticCurveTo(sx - R(4), cy, sx, cy - R(6));
        ctx.stroke();
      }
    } else if (ck === "stable" || ck === "nest_platform" || ck === "rookery" || isBeastLodgeKey(ck)) {
      ctx.strokeStyle = "#e8e4d8"; ctx.lineWidth = R(3);
      ctx.beginPath(); ctx.arc(cx, cy, R(7.5), Math.PI * 0.15, Math.PI * 0.85, true); ctx.stroke();
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(cx - R(10), cy - R(9), R(4.4), R(4.4));
      ctx.fillRect(cx + R(5.6), cy - R(9), R(4.4), R(4.4));
    } else if (ck === "pit_chapel" || ck === "dark_cell") {
      ctx.fillStyle = "#0c0a12";
      ctx.beginPath(); ctx.arc(cx, cy, R(7), 0, 7); ctx.fill();
      ctx.fillStyle = "#ff3b3b";
      ctx.beginPath(); ctx.arc(cx - R(2.4), cy - R(1), R(1.6), 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + R(2.4), cy - R(1), R(1.6), 0, 7); ctx.fill();
    } else if (ck === "village_keep" || ck === "town_keep" || ck === "city_citadel") {
      // keep tower: crenellated square + gate arch
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(cx - R(8), cy - R(6), R(16), R(16));
      ctx.fillStyle = "#5a5a64";
      for (let i = -1; i <= 1; i++) ctx.fillRect(cx + i * R(6) - R(2), cy - R(10), R(4), R(4));
      ctx.fillStyle = "#2b2118";
      ctx.beginPath(); ctx.arc(cx, cy + R(6), R(3.4), Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - R(3.4), cy + R(2), R(6.8), R(6));
      if (ck === "city_citadel") {
        ctx.fillStyle = "#ffd93d";
        ctx.beginPath(); ctx.arc(cx, cy - R(1), R(2), 0, 7); ctx.fill();
      }
    } else if (ck === "tide_keep" || ck === "harbor_keep") {
      // anchor over waves
      ctx.strokeStyle = "#5cc2d4"; ctx.lineWidth = R(2.4);
      ctx.beginPath(); ctx.moveTo(cx, cy - R(10)); ctx.lineTo(cx, cy + R(8)); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy + R(8), R(6), 0.3, Math.PI - 0.3); ctx.stroke();
      ctx.fillStyle = "#5cc2d4";
      ctx.fillRect(cx - R(6), cy - R(9), R(12), R(2.4));
    } else if (ck === "sakura_castle") {
      // gold shachi knot on black
      ctx.fillStyle = "#23232c";
      ctx.beginPath(); ctx.arc(cx, cy, R(8), 0, 7); ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(cx - R(4), cy + R(5));
      ctx.quadraticCurveTo(cx - R(5), cy - R(6), cx, cy - R(7));
      ctx.quadraticCurveTo(cx + R(5), cy - R(6), cx + R(4), cy + R(5));
      ctx.closePath(); ctx.fill();
    } else if (ck === "sun_keep" || ck === "gilt_keep") {
      // sun disc / coin
      ctx.fillStyle = ck === "sun_keep" ? "#c96a2e" : "#8a6a1a";
      ctx.beginPath(); ctx.arc(cx, cy, R(8), 0, 7); ctx.fill();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath(); ctx.arc(cx, cy, R(5.5), 0, 7); ctx.fill();
      ctx.fillStyle = ck === "sun_keep" ? "#c96a2e" : "#8a6a1a";
      ctx.beginPath(); ctx.arc(cx, cy, R(2), 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = "#c9ccd4";
      ctx.beginPath(); ctx.arc(cx, cy, R(5.5), 0, 7); ctx.fill();
      ctx.fillStyle = "#5a5a64";
      ctx.beginPath(); ctx.arc(cx, cy, R(2.4), 0, 7); ctx.fill();
    }
    ctx.restore();
    void ts;
  }

  // superseded painters: the garden era replaced full-plot facades. Kept as
  // no-ops so old save-era calls never crash.

  function drawInterior(ctx, ts, ox, oy, b) {
    if (!b || buildingCollapsed(b)) return;
    try {
      // warm lived-in light over the interior
      const ix0 = b.x0 * ts + ox, iy0 = b.y0 * ts + oy;
      ctx.fillStyle = "rgba(255,220,150,0.10)";
      ctx.fillRect(ix0, iy0, b.w * ts, b.h * ts);
      // inner wall shadow (cutaway depth)
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(ix0 + ts, iy0 + ts * 0.7, (b.w - 2) * ts, 3);
      const list = (b.furniture || []);
      for (const f of list) {
        if (!f) continue;
        try { if (f.x != null && isFurnGone(f.x, f.y)) continue; } catch (e) {}
        drawFurniture(ctx, ts, ox, oy, f);
        // a gold-book glint on shelves that hold a readable lorebook
        try {
          if (f && f.kind === "shelf" && window.Lorebooks) {
            let has = f._loreBook || null;
            if (f._loreDone !== true) {
              window.Lorebooks.shelfSpots(b);
              has = f._loreBook || null;
            }
            if (has) {
              const sx = f.x * ts + ox, sy = f.y * ts + oy;
              const s = ts / 32;
              ctx.fillStyle = "#ffd93d";
              ctx.fillRect(sx + 20 * s, sy + 8 * s, 6 * s, 3 * s);
              ctx.fillStyle = "#fff2b0";
              ctx.fillRect(sx + 21 * s, sy + 8 * s, 4 * s, 1 * s);
            }
          }
        } catch (e) { }
      }
      // room label (small, inside top wall so it never clips into neighbours)
      try {
        const lx = (b.x0 + b.w / 2) * ts + ox, ly = (b.y0 + 1) * ts + oy + Math.max(10, ts * 0.3);
        ctx.font = `bold ${Math.max(10, Math.round(ts * 0.26))}px sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.strokeText(b.title, lx, ly);
        ctx.fillStyle = "#ffe9b0";
        ctx.fillText(b.title, lx, ly);
      } catch (e) { }
    } catch (e) { }
  }
  function drawFurniture(ctx, ts, ox, oy, f) {
    const sx = f.x * ts + ox, sy = f.y * ts + oy;
    const s = ts / 32;
    ctx.save();
    try {
      switch (f.kind) {
        case "bed": {
          ctx.fillStyle = "#6b4226"; ctx.fillRect(sx + 4 * s, sy + 6 * s, 24 * s, 20 * s);
          ctx.fillStyle = "#a03a2e"; ctx.fillRect(sx + 5 * s, sy + 12 * s, 22 * s, 13 * s);
          ctx.fillStyle = "#f2ede2"; ctx.fillRect(sx + 6 * s, sy + 7 * s, 10 * s, 7 * s);
          break;
        }
        case "bunk": {
          ctx.fillStyle = "#5a4a3a"; ctx.fillRect(sx + 4 * s, sy + 6 * s, 24 * s, 9 * s);
          ctx.fillStyle = "#5a4a3a"; ctx.fillRect(sx + 4 * s, sy + 17 * s, 24 * s, 9 * s);
          ctx.fillStyle = "#7a9aaa"; ctx.fillRect(sx + 5 * s, sy + 7 * s, 22 * s, 7 * s);
          ctx.fillStyle = "#7a9aaa"; ctx.fillRect(sx + 5 * s, sy + 18 * s, 22 * s, 7 * s);
          break;
        }
        case "table": {
          ctx.fillStyle = "#4a2f1a"; ctx.fillRect(sx + 8 * s, sy + 18 * s, 3 * s, 10 * s); ctx.fillRect(sx + 21 * s, sy + 18 * s, 3 * s, 10 * s);
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 4 * s, sy + 10 * s, 24 * s, 9 * s);
          ctx.fillStyle = "#a06a3a"; ctx.fillRect(sx + 4 * s, sy + 10 * s, 24 * s, 2 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 13 * s, sy + 12 * s, 6 * s, 4 * s); // candle dish
          break;
        }
        case "lowtable": {
          ctx.fillStyle = "#6b4226"; ctx.fillRect(sx + 6 * s, sy + 16 * s, 20 * s, 6 * s);
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 6 * s, sy + 16 * s, 20 * s, 2 * s);
          ctx.fillStyle = "#f2e7c9"; ctx.fillRect(sx + 10 * s, sy + 12 * s, 4 * s, 4 * s);
          ctx.fillStyle = "#f2e7c9"; ctx.fillRect(sx + 18 * s, sy + 12 * s, 4 * s, 4 * s);
          break;
        }
        case "chair": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 11 * s, sy + 12 * s, 10 * s, 3 * s);
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 11 * s, sy + 15 * s, 3 * s, 12 * s);
          break;
        }
        case "pew_l": case "pew_r": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 5 * s, sy + 14 * s, 22 * s, 6 * s);
          ctx.fillStyle = "#7a4a2e"; ctx.fillRect(sx + 5 * s, sy + 14 * s, 22 * s, 2 * s);
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 5 * s, sy + 20 * s, 3 * s, 8 * s); ctx.fillRect(sx + 24 * s, sy + 20 * s, 3 * s, 8 * s);
          break;
        }
        case "longtable": {
          ctx.fillStyle = "#4a2f1a"; ctx.fillRect(sx + 2 * s, sy + 12 * s, 28 * s, 8 * s);
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 2 * s, sy + 12 * s, 28 * s, 2 * s);
          ctx.fillStyle = "#c9c9c9"; ctx.fillRect(sx + 8 * s, sy + 14 * s, 4 * s, 3 * s); ctx.fillRect(sx + 20 * s, sy + 14 * s, 4 * s, 3 * s);
          break;
        }
        case "altar": {
          ctx.fillStyle = "#8a8a92"; ctx.fillRect(sx + 6 * s, sy + 18 * s, 20 * s, 10 * s);
          ctx.fillStyle = "#f2f2f2"; ctx.fillRect(sx + 5 * s, sy + 14 * s, 22 * s, 6 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 14 * s, sy + 8 * s, 4 * s, 7 * s);
          break;
        }
        case "candle": {
          ctx.fillStyle = "#f2ede2"; ctx.fillRect(sx + 14 * s, sy + 18 * s, 4 * s, 8 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 14 * s, sy + 14 * s, 4 * s, 4 * s);
          ctx.fillStyle = "#fff2b0"; ctx.fillRect(sx + 15 * s, sy + 15 * s, 2 * s, 2 * s);
          break;
        }
        case "lantern_f": {
          ctx.fillStyle = "#55555c"; ctx.fillRect(sx + 11 * s, sy + 10 * s, 10 * s, 14 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 13 * s, sy + 13 * s, 6 * s, 8 * s);
          break;
        }
        case "anvil": {
          ctx.fillStyle = "#3a3f4a"; ctx.fillRect(sx + 10 * s, sy + 22 * s, 12 * s, 6 * s);
          ctx.fillStyle = "#5a606c"; ctx.fillRect(sx + 6 * s, sy + 14 * s, 20 * s, 8 * s);
          ctx.fillStyle = "#8a8f9a"; ctx.fillRect(sx + 6 * s, sy + 14 * s, 20 * s, 2 * s);
          break;
        }
        case "furnace": {
          ctx.fillStyle = "#4a4a55"; ctx.fillRect(sx + 4 * s, sy + 8 * s, 24 * s, 20 * s);
          ctx.fillStyle = "#23232c"; ctx.fillRect(sx + 9 * s, sy + 16 * s, 14 * s, 12 * s);
          ctx.fillStyle = "#ff9d2e"; ctx.fillRect(sx + 10 * s, sy + 19 * s, 12 * s, 7 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 12 * s, sy + 21 * s, 8 * s, 3 * s);
          break;
        }
        case "trough": {
          ctx.fillStyle = "#3a3f4a"; ctx.fillRect(sx + 6 * s, sy + 16 * s, 20 * s, 10 * s);
          ctx.fillStyle = "#59d6d6"; ctx.fillRect(sx + 8 * s, sy + 18 * s, 16 * s, 4 * s);
          break;
        }
        case "rack": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 6 * s, sy + 8 * s, 3 * s, 20 * s); ctx.fillRect(sx + 23 * s, sy + 8 * s, 3 * s, 20 * s);
          ctx.fillStyle = "#c9ccd4"; ctx.fillRect(sx + 10 * s, sy + 10 * s, 2 * s, 12 * s); ctx.fillRect(sx + 15 * s, sy + 10 * s, 2 * s, 12 * s); ctx.fillRect(sx + 20 * s, sy + 10 * s, 2 * s, 12 * s);
          break;
        }
        case "counter": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 4 * s, sy + 14 * s, 24 * s, 12 * s);
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 4 * s, sy + 14 * s, 24 * s, 3 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 8 * s, sy + 10 * s, 5 * s, 4 * s);
          ctx.fillStyle = "#5dd68a"; ctx.fillRect(sx + 18 * s, sy + 10 * s, 5 * s, 4 * s);
          break;
        }
        case "shelf": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 5 * s, sy + 8 * s, 22 * s, 18 * s);
          ctx.fillStyle = "#7a2b8f"; ctx.fillRect(sx + 7 * s, sy + 10 * s, 5 * s, 6 * s);
          ctx.fillStyle = "#2e7fe0"; ctx.fillRect(sx + 14 * s, sy + 10 * s, 5 * s, 6 * s);
          ctx.fillStyle = "#5dd68a"; ctx.fillRect(sx + 20 * s, sy + 10 * s, 5 * s, 6 * s);
          ctx.fillStyle = "#c9a86a"; ctx.fillRect(sx + 7 * s, sy + 18 * s, 18 * s, 4 * s);
          break;
        }
        case "crate": {
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 7 * s, sy + 13 * s, 18 * s, 14 * s);
          ctx.fillStyle = "#6b4226"; ctx.fillRect(sx + 7 * s, sy + 13 * s, 18 * s, 2 * s); ctx.fillRect(sx + 7 * s, sy + 19 * s, 18 * s, 2 * s);
          ctx.fillStyle = "#6b4226"; ctx.fillRect(sx + 7 * s, sy + 13 * s, 2 * s, 14 * s); ctx.fillRect(sx + 23 * s, sy + 13 * s, 2 * s, 14 * s);
          break;
        }
        case "barrel": {
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 9 * s, sy + 10 * s, 14 * s, 18 * s);
          ctx.fillStyle = "#6b4226"; ctx.fillRect(sx + 9 * s, sy + 15 * s, 14 * s, 2 * s); ctx.fillRect(sx + 9 * s, sy + 21 * s, 14 * s, 2 * s);
          ctx.fillStyle = "#a06a3a"; ctx.fillRect(sx + 9 * s, sy + 10 * s, 14 * s, 2 * s);
          break;
        }
        case "hearth": case "fireplace": {
          ctx.fillStyle = "#6a6a76"; ctx.fillRect(sx + 6 * s, sy + 8 * s, 20 * s, 20 * s);
          ctx.fillStyle = "#23232c"; ctx.fillRect(sx + 10 * s, sy + 16 * s, 12 * s, 10 * s);
          ctx.fillStyle = "#ff6b2e"; ctx.fillRect(sx + 11 * s, sy + 19 * s, 10 * s, 5 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 13 * s, sy + 20 * s, 6 * s, 3 * s);
          break;
        }
        case "rug": {
          ctx.fillStyle = "#7a2b4e"; ctx.fillRect(sx + 4 * s, sy + 10 * s, 24 * s, 14 * s);
          ctx.fillStyle = "#a03a5e"; ctx.fillRect(sx + 6 * s, sy + 12 * s, 20 * s, 10 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 6 * s, sy + 12 * s, 20 * s, 1 * s); ctx.fillRect(sx + 6 * s, sy + 21 * s, 20 * s, 1 * s);
          break;
        }
        case "tatami": {
          ctx.fillStyle = "#c9b98a"; ctx.fillRect(sx + 4 * s, sy + 10 * s, 24 * s, 14 * s);
          ctx.fillStyle = "#b0a172"; ctx.fillRect(sx + 4 * s, sy + 16 * s, 24 * s, 1 * s);
          break;
        }
        case "screen": {
          ctx.fillStyle = "#d9c9a8"; ctx.fillRect(sx + 8 * s, sy + 6 * s, 16 * s, 20 * s);
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 8 * s, sy + 6 * s, 16 * s, 2 * s); ctx.fillRect(sx + 8 * s, sy + 24 * s, 16 * s, 2 * s);
          ctx.fillStyle = "#e8a0c0"; ctx.fillRect(sx + 12 * s, sy + 12 * s, 8 * s, 8 * s);
          break;
        }
        case "pool": {
          ctx.fillStyle = "#8a8a92"; ctx.fillRect(sx + 3 * s, sy + 8 * s, 26 * s, 18 * s);
          ctx.fillStyle = "#2b6fd4"; ctx.fillRect(sx + 5 * s, sy + 10 * s, 22 * s, 14 * s);
          ctx.fillStyle = "#7fc4ff"; ctx.fillRect(sx + 5 * s, sy + 10 * s, 22 * s, 3 * s);
          break;
        }
        case "shell": {
          ctx.fillStyle = "#e8a0c0"; ctx.fillRect(sx + 10 * s, sy + 14 * s, 12 * s, 8 * s);
          ctx.fillStyle = "#f7d0e0"; ctx.fillRect(sx + 12 * s, sy + 15 * s, 8 * s, 3 * s);
          break;
        }
        case "offering": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 9 * s, sy + 16 * s, 14 * s, 10 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 11 * s, sy + 12 * s, 10 * s, 5 * s);
          break;
        }
        case "kettle": {
          ctx.fillStyle = "#3a3f4a"; ctx.fillRect(sx + 11 * s, sy + 16 * s, 10 * s, 8 * s);
          ctx.fillStyle = "#8a8f9a"; ctx.fillRect(sx + 13 * s, sy + 17 * s, 6 * s, 2 * s);
          break;
        }
        case "stool": {
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 11 * s, sy + 18 * s, 10 * s, 4 * s);
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 12 * s, sy + 22 * s, 2 * s, 6 * s); ctx.fillRect(sx + 18 * s, sy + 22 * s, 2 * s, 6 * s);
          break;
        }
        case "towel": {
          ctx.fillStyle = "#f2f2f2"; ctx.fillRect(sx + 8 * s, sy + 14 * s, 16 * s, 8 * s);
          ctx.fillStyle = "#7fc4ff"; ctx.fillRect(sx + 8 * s, sy + 18 * s, 16 * s, 2 * s);
          break;
        }
        case "mat": {
          ctx.fillStyle = "#4a6a8a"; ctx.fillRect(sx + 4 * s, sy + 12 * s, 24 * s, 12 * s);
          ctx.fillStyle = "#5a7a9a"; ctx.fillRect(sx + 4 * s, sy + 12 * s, 24 * s, 2 * s);
          break;
        }
        case "drum": {
          ctx.fillStyle = "#8a2a2e"; ctx.fillRect(sx + 10 * s, sy + 16 * s, 12 * s, 10 * s);
          ctx.fillStyle = "#f2ede2"; ctx.fillRect(sx + 10 * s, sy + 16 * s, 12 * s, 3 * s);
          break;
        }
        case "runecircle": {
          ctx.strokeStyle = "#ffb02e"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(sx + 16 * s, sy + 16 * s, 11 * s, 0, 7); ctx.stroke();
          ctx.fillStyle = "#ffb02e"; ctx.fillRect(sx + 14 * s, sy + 10 * s, 4 * s, 4 * s);
          break;
        }
        case "hay": {
          ctx.fillStyle = "#c9a227"; ctx.fillRect(sx + 6 * s, sy + 12 * s, 20 * s, 12 * s);
          ctx.fillStyle = "#e0c455"; ctx.fillRect(sx + 8 * s, sy + 13 * s, 16 * s, 3 * s);
          ctx.fillStyle = "#8a6a1a"; ctx.fillRect(sx + 8 * s, sy + 18 * s, 16 * s, 2 * s);
          break;
        }
        case "hitch": {
          ctx.fillStyle = "#5a3a22"; ctx.fillRect(sx + 7 * s, sy + 8 * s, 3 * s, 20 * s); ctx.fillRect(sx + 22 * s, sy + 8 * s, 3 * s, 20 * s);
          ctx.fillStyle = "#8a5a33"; ctx.fillRect(sx + 7 * s, sy + 8 * s, 18 * s, 3 * s);
          break;
        }
        case "pen": {
          ctx.strokeStyle = "#8a5a33"; ctx.lineWidth = 3;
          ctx.strokeRect(sx + 4 * s, sy + 6 * s, 24 * s, 20 * s);
          ctx.fillStyle = "rgba(201,162,39,0.25)"; ctx.fillRect(sx + 4 * s, sy + 6 * s, 24 * s, 20 * s);
          break;
        }
        case "nexus": {
          // beast-nexus: glowing pen ring — the stable store/retrieve point (E)
          ctx.fillStyle = "rgba(93,214,138,0.2)"; ctx.beginPath(); ctx.arc(sx + 16 * s, sy + 16 * s, 13 * s, 0, 7); ctx.fill();
          ctx.strokeStyle = "#5dd68a"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(sx + 16 * s, sy + 16 * s, 11 * s, 0, 7); ctx.stroke();
          ctx.fillStyle = "#5dd68a"; ctx.font = `bold ${Math.round(14 * s)}px sans-serif`; ctx.textAlign = "center";
          ctx.fillText("🐴", sx + 16 * s, sy + 22 * s);
          break;
        }
        case "breednexus": {
          // bestiary-nexus: violet gene-cradle ring — the breeding point (E)
          ctx.fillStyle = "rgba(154,123,255,0.22)"; ctx.beginPath(); ctx.arc(sx + 16 * s, sy + 16 * s, 13 * s, 0, 7); ctx.fill();
          ctx.strokeStyle = "#9a7bff"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(sx + 16 * s, sy + 16 * s, 11 * s, 0, 7); ctx.stroke();
          ctx.fillStyle = "#c9b8ff"; ctx.font = `bold ${Math.round(14 * s)}px sans-serif`; ctx.textAlign = "center";
          ctx.fillText("🧬", sx + 16 * s, sy + 22 * s);
          break;
        }
        case "throne": {
          ctx.fillStyle = "#8a6a1a"; ctx.fillRect(sx + 9 * s, sy + 8 * s, 14 * s, 18 * s);
          ctx.fillStyle = "#ffd93d"; ctx.fillRect(sx + 11 * s, sy + 10 * s, 10 * s, 8 * s);
          break;
        }
        default: {
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fillRect(sx + 10 * s, sy + 10 * s, 12 * s, 12 * s);
        }
      }
    } finally { ctx.restore(); }
  }

  // crack overlay for damaged walls (called from game render per visible wall)
  function drawCracks(ctx, ts, ox, oy, gx, gy, frac) {
    try {
      if (!(frac < 1)) return;
      const sx = gx * ts + ox, sy = gy * ts + oy;
      ctx.strokeStyle = frac < 0.35 ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.55)";
      ctx.lineWidth = Math.max(1, ts * 0.05);
      ctx.beginPath();
      ctx.moveTo(sx + ts * 0.2, sy + ts * 0.15);
      ctx.lineTo(sx + ts * 0.5, sy + ts * 0.45);
      ctx.lineTo(sx + ts * 0.35, sy + ts * 0.8);
      if (frac < 0.6) {
        ctx.moveTo(sx + ts * 0.5, sy + ts * 0.45);
        ctx.lineTo(sx + ts * 0.8, sy + ts * 0.6);
      }
      ctx.stroke();
    } catch (e) { }
  }

  // Tile id for a global tile known to sit inside building b (new-layout only).
  // Walls -> HOUSEWALL/STONEWALL, windows -> WINDOW, doors -> DOOR, else floor.
  function buildingTile(b, gx, gy) {
    try {
      const T = window.CFG.T;
      const lx = gx - b.x0, ly = gy - b.y0;
      if (lx < 0 || ly < 0 || lx >= b.w || ly >= b.h) return null;
      // Lawn cutouts inside the plot rect are garden ground, not building.
      if (!inShape(b, lx, ly)) return T.GRASS;
      if ((b.doors || []).some(d => d.x === gx && d.y === gy)) return T.DOOR;
      if ((b.windows || []).some(w => w.x === gx && w.y === gy)) return T.WINDOW;
      if (!isShapeEdge(b, gx, gy)) {
        const fl = b.floor || "TOWNSTONE";
        return T[fl] != null ? T[fl] : T.TOWNSTONE;
      }
      const wv = b.wall || "HOUSEWALL";
      return T[wv] != null ? T[wv] : T.HOUSEWALL;
    } catch (e) { return null; }
  }
  // ---------- stable (beast lodge) helpers ----------
  // Every hearth has one Stable (see LAYOUTS): the pen nexus inside (or the
  // doorway when the lodge is far) opens the store/retrieve UI.
  function findStableAt(gx, gy) {
    try {
      const b = buildingsAt(gx, gy) || buildingRectAt(gx, gy);
      if (b && b.classKey === "stable" && !buildingCollapsed(b)) return b;
    } catch (e) { }
    return null;
  }
  function stableNexusPos(b) {
    try {
      if (!b) return null;
      const f = (b.furniture || []).find(f => f && f.kind === "nexus");
      if (f) return { x: f.x + 0.5, y: f.y + 0.5 };
      const d = (b.doors || [])[0];
      if (d) return { x: d.x + 0.5, y: d.y + 0.5 };
      return { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
    } catch (e) { return null; }
  }
  // Compass guidance to the nearest lodge: used by the party panel's
  // "Find Stable" button and the place-discovery toast. Searches the local
  // hearth first, then an expanding ring (settlements are sparse, so a
  // coarse 16-tile sweep is plenty). Returns {x,y,d,dirName,title} or null.
  function compassName(dx, dy) {
    try {
      const a = Math.atan2(dy, dx) * 180 / Math.PI; // +x east, +y south
      if (a >= -22.5 && a < 22.5) return "east";
      if (a >= 22.5 && a < 67.5) return "south-east";
      if (a >= 67.5 && a < 112.5) return "south";
      if (a >= 112.5 && a < 157.5) return "south-west";
      if (a >= -157.5 && a < -112.5) return "north-west";
      if (a >= -112.5 && a < -67.5) return "north";
      if (a >= -67.5 && a < -22.5) return "north-east";
      return "west";
    } catch (e) { return "nearby"; }
  }
  function stableGuidance(px, py) {
    try {
      const W = window.World;
      if (!W || !W.settlementAt) return null;
      let best = null, bd = 1e9;
      const considerSettle = (s) => {
        if (!s) return;
        let list = null;
        try {
          list = buildingsFor(s);
        } catch (e) { list = null; }
        if (!list) return;
        for (const b of list) {
          if (!b || b.classKey !== "stable" || buildingCollapsed(b)) continue;
          const np = stableNexusPos(b) || { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
          const d = Math.hypot(np.x - px, np.y - py);
          if (d < bd) bd = d, best = { building: b, x: np.x, y: np.y };
        }
      };
      // local hearth (or origin) first
      try {
        if (isSurfDim() && Math.abs(px) < 30 && Math.abs(py) < 30) {
          const os = originSettlement();
          if (os) considerSettle({ cx: 0, cy: 0, radius: os.radius || 20, type: os.type });
        }
      } catch (e) { }
      try { considerSettle(W.settlementAt(Math.floor(px), Math.floor(py))); } catch (e) { }
      // expanding ring when out in the wilds
      if (!best) {
        for (let r = 16; r <= 256 && !best; r += 16) {
          for (let a = 0; a < 12; a++) {
            const gx = Math.floor(px + Math.cos(a / 12 * Math.PI * 2) * r);
            const gy = Math.floor(py + Math.sin(a / 12 * Math.PI * 2) * r);
            let s2 = null;
            try { s2 = W.settlementAt(gx, gy); } catch (e) { }
            if (s2) considerSettle(s2);
            if (best && bd < r) break;
          }
        }
      }
      if (!best) return null;
      return {
        x: best.x, y: best.y, d: bd,
        dirName: compassName(best.x - px, best.y - py),
        title: (best.building && (best.building.title || "Stable")) || "Stable",
      };
    } catch (e) { return null; }
  }
  // Nearest usable furniture to (px,py) within maxD (tiles). kinds is an
  // array of furniture kind strings. For E-to-use features (altars, anvils,
  // hearths, pools, ...). Global tile coords, skips collapsed buildings.
  function nearestFurn(px, py, kinds, maxD) {
    try {
      if (!Number.isFinite(px) || !Number.isFinite(py) || !Array.isArray(kinds) || !kinds.length) return null;
      maxD = maxD == null ? 2.2 : maxD;
      const want = {};
      for (const k of kinds) want[k] = true;
      let best = null, bd = maxD;
      const list = buildingsInView(Math.floor(px) - 3, Math.floor(px) + 3, Math.floor(py) - 3, Math.floor(py) + 3) || [];
      for (const b of list) {
        if (!b || buildingCollapsed(b)) continue;
        const furn = (b.furniture || []);
        for (const f of furn) {
          if (!f || !want[f.kind]) continue;
          try { if (isFurnGone(f.x, f.y)) continue; } catch (e) {}
          const d = Math.hypot(f.x + 0.5 - px, f.y + 0.5 - py);
          if (d < bd) { bd = d; best = { kind: f.kind, x: f.x + 0.5, y: f.y + 0.5, fx: f.x, fy: f.y, d, building: b }; }
        }
      }
      // player-placed furniture works too (beds sleep, altars heal, ...)
      try {
        const placed = placedFurnitureIn(Math.floor(px) - 3, Math.floor(px) + 3, Math.floor(py) - 3, Math.floor(py) + 3);
        for (const r of placed) {
          if (!r || !want[r.kind]) continue;
          const d = Math.hypot(r.gx + 0.5 - px, r.gy + 0.5 - py);
          if (d < bd) { bd = d; best = { kind: r.kind, x: r.gx + 0.5, y: r.gy + 0.5, fx: r.gx, fy: r.gy, d, building: null, placed: true }; }
        }
      } catch (e) {}
      return best;
    } catch (e) { return null; }
  }
  function nearestStable(px, py, maxD) {    try {
      maxD = maxD == null ? 3.2 : maxD;
      let best = null, bd = 1e9;
      const consider = (b) => {
        if (!b || b.classKey !== "stable" || buildingCollapsed(b)) return;
        const np = stableNexusPos(b);
        // near the nexus OR anywhere inside the pen rect counts
        let d = 1e9;
        try { if (np) d = Math.min(d, Math.hypot(np.x - px, np.y - py)); } catch (e) { }
        try {
          const cx = Math.max(b.x0, Math.min(b.x1 + 0.99, px)), cy = Math.max(b.y0, Math.min(b.y1 + 0.99, py));
          d = Math.min(d, Math.hypot(cx - px, cy - py));
        } catch (e) { }
        if (d < bd) { bd = d; best = b; }
      };
      try {
        const W = window.World;
        if (isSurfDim() && Math.abs(px) < 30 && Math.abs(py) < 30) for (const b of originBuildings()) consider(b);
        const s = W && W.settlementAt ? W.settlementAt(Math.floor(px), Math.floor(py)) : null;
        if (s) for (const b of settlementBuildings(s)) consider(b);
        // neighbour sweep: stables sit at the hearth edge — check the 8 around
        for (let dy = -32; dy <= 32 && !best; dy += 16) for (let dx = -32; dx <= 32; dx += 16) {
          let s2 = null;
          try { s2 = W.settlementAt(Math.floor(px) + dx, Math.floor(py) + dy); } catch (e) { }
          if (s2 && (!s || s2.cx !== s.cx || s2.cy !== s.cy)) for (const b of settlementBuildings(s2)) consider(b);
        }
      } catch (e) { }
      if (best && bd <= maxD) return { building: best, d: bd, nexus: stableNexusPos(best) };
      return null;
    } catch (e) { return null; }
  }
  // ---------- inn (retirement roster) helpers ----------
  // Inns room retired party members + slaves (global roster, paid rooms):
  // the counter inside (or the doorway when far) opens the inn UI. Any inn
  // retrieves anyone — rooms live on the player, not per building.
  const INN_KEYS = { inn: 1, caravanserai: 1, tavern_hall: 1 };
  function isInnKey(ck) { return !!INN_KEYS[ck]; }
  function innNexusPos(b) {
    try {
      if (!b) return null;
      const f = (b.furniture || []).find(f => f && f.kind === "counter");
      if (f) return { x: f.x + 0.5, y: f.y + 0.5 };
      const d = (b.doors || [])[0];
      if (d) return { x: d.x + 0.5, y: d.y + 0.5 };
      return { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
    } catch (e) { return null; }
  }
  function nearestInn(px, py, maxD) {
    try {
      maxD = maxD == null ? 3.2 : maxD;
      let best = null, bd = 1e9;
      const consider = (b) => {
        if (!b || !isInnKey(b.classKey) || buildingCollapsed(b)) return;
        const np = innNexusPos(b);
        let d = 1e9;
        try { if (np) d = Math.min(d, Math.hypot(np.x - px, np.y - py)); } catch (e) { }
        try {
          const cx = Math.max(b.x0, Math.min(b.x1 + 0.99, px)), cy = Math.max(b.y0, Math.min(b.y1 + 0.99, py));
          d = Math.min(d, Math.hypot(cx - px, cy - py));
        } catch (e) { }
        if (d < bd) { bd = d; best = b; }
      };
      try {
        const W = window.World;
        if (isSurfDim() && Math.abs(px) < 30 && Math.abs(py) < 30) for (const b of originBuildings()) consider(b);
        const s = W && W.settlementAt ? W.settlementAt(Math.floor(px), Math.floor(py)) : null;
        if (s) for (const b of settlementBuildings(s)) consider(b);
        // neighbour sweep: inns sit anywhere in the hearth — check the 8 around
        for (let dy = -32; dy <= 32 && !best; dy += 16) for (let dx = -32; dx <= 32; dx += 16) {
          let s2 = null;
          try { s2 = W.settlementAt(Math.floor(px) + dx, Math.floor(py) + dy); } catch (e) { }
          if (s2 && (!s || s2.cx !== s.cx || s2.cy !== s.cy)) for (const b of settlementBuildings(s2)) consider(b);
        }
      } catch (e) { }
      if (best && bd <= maxD) return { building: best, d: bd, nexus: innNexusPos(best) };
      return null;
    } catch (e) { return null; }
  }
  // Compass guidance to the nearest inn: used by the party panel's
  // "Find Inn" button. Mirrors stableGuidance.
  function innGuidance(px, py) {
    try {
      const W = window.World;
      if (!W || !W.settlementAt) return null;
      let best = null, bd = 1e9;
      const considerSettle = (s) => {
        if (!s) return;
        let list = null;
        try {
          list = buildingsFor(s);
        } catch (e) { list = null; }
        if (!list) return;
        for (const b of list) {
          if (!b || !isInnKey(b.classKey) || buildingCollapsed(b)) continue;
          const np = innNexusPos(b) || { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
          const d = Math.hypot(np.x - px, np.y - py);
          if (d < bd) bd = d, best = { building: b, x: np.x, y: np.y };
        }
      };
      // local hearth (or origin) first
      try {
        if (isSurfDim() && Math.abs(px) < 30 && Math.abs(py) < 30) {
          const os = originSettlement();
          if (os) considerSettle({ cx: 0, cy: 0, radius: os.radius || 20, type: os.type });
        }
      } catch (e) { }
      try { considerSettle(W.settlementAt(Math.floor(px), Math.floor(py))); } catch (e) { }
      // expanding ring when out in the wilds
      if (!best) {
        for (let r = 16; r <= 256 && !best; r += 16) {
          for (let a = 0; a < 12; a++) {
            const gx = Math.floor(px + Math.cos(a / 12 * Math.PI * 2) * r);
            const gy = Math.floor(py + Math.sin(a / 12 * Math.PI * 2) * r);
            let s2 = null;
            try { s2 = W.settlementAt(gx, gy); } catch (e) { }
            if (s2) considerSettle(s2);
            if (best && bd < r) break;
          }
        }
      }
      if (!best) return null;
      return {
        x: best.x, y: best.y, d: bd,
        dirName: compassName(best.x - px, best.y - py),
        title: (best.building && (best.building.title || "Inn")) || "Inn",
      };
    } catch (e) { return null; }
  }
  // ---------- beast lodge (breeding lodge) helpers ----------
  // Same shape as the stable, but classKey "beast_lodge" (+ legacy
  // "bestiary") with breednexus furniture. E on it opens the lodge modal
  // on its Breed tab.
  function findBeastLodgeAt(gx, gy) {
    try {
      const b = buildingsAt(gx, gy) || buildingRectAt(gx, gy);
      if (b && isBeastLodgeKey(b.classKey) && !buildingCollapsed(b)) return b;
    } catch (e) { }
    return null;
  }
  function beastLodgeNexusPos(b) {
    try {
      if (!b) return null;
      const f = (b.furniture || []).find(f => f && f.kind === "breednexus");
      if (f) return { x: f.x + 0.5, y: f.y + 0.5 };
      const d = (b.doors || [])[0];
      if (d) return { x: d.x + 0.5, y: d.y + 0.5 };
      return { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
    } catch (e) { return null; }
  }
  function nearestBeastLodge(px, py, maxD) {
    try {
      maxD = maxD == null ? 3.2 : maxD;
      let best = null, bd = 1e9;
      const consider = (b) => {
        if (!b || !isBeastLodgeKey(b.classKey) || buildingCollapsed(b)) return;
        const np = beastLodgeNexusPos(b);
        let d = 1e9;
        try { if (np) d = Math.min(d, Math.hypot(np.x - px, np.y - py)); } catch (e) { }
        try {
          const cx = Math.max(b.x0, Math.min(b.x1 + 0.99, px)), cy = Math.max(b.y0, Math.min(b.y1 + 0.99, py));
          d = Math.min(d, Math.hypot(cx - px, cy - py));
        } catch (e) { }
        if (d < bd) { bd = d; best = b; }
      };
      try {
        const W = window.World;
        if (isSurfDim() && Math.abs(px) < 30 && Math.abs(py) < 30) for (const b of originBuildings()) consider(b);
        const s = W && W.settlementAt ? W.settlementAt(Math.floor(px), Math.floor(py)) : null;
        if (s) for (const b of settlementBuildings(s)) consider(b);
        for (let dy = -32; dy <= 32 && !best; dy += 16) for (let dx = -32; dx <= 32; dx += 16) {
          let s2 = null;
          try { s2 = W.settlementAt(Math.floor(px) + dx, Math.floor(py) + dy); } catch (e) { }
          if (s2 && (!s || s2.cx !== s.cx || s2.cy !== s.cy)) for (const b of settlementBuildings(s2)) consider(b);
        }
      } catch (e) { }
      if (best && bd <= maxD) return { building: best, d: bd, nexus: beastLodgeNexusPos(best) };
      return null;
    } catch (e) { return null; }
  }
  function beastLodgeGuidance(px, py) {
    try {
      const W = window.World;
      if (!W || !W.settlementAt) return null;
      let best = null, bd = 1e9;
      const considerSettle = (s) => {
        if (!s) return;
        let list = null;
        try { list = buildingsFor(s); } catch (e) { list = null; }
        if (!list) return;
        for (const b of list) {
          if (!b || !isBeastLodgeKey(b.classKey) || buildingCollapsed(b)) continue;
          const np = beastLodgeNexusPos(b) || { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2 };
          const d = Math.hypot(np.x - px, np.y - py);
          if (d < bd) bd = d, best = { building: b, x: np.x, y: np.y };
        }
      };
      try {
        if (isSurfDim() && Math.abs(px) < 30 && Math.abs(py) < 30) {
          const os = originSettlement();
          if (os) considerSettle({ cx: 0, cy: 0, radius: os.radius || 20, type: os.type });
        }
      } catch (e) { }
      try { considerSettle(W.settlementAt(Math.floor(px), Math.floor(py))); } catch (e) { }
      if (!best) {
        for (let r = 16; r <= 256 && !best; r += 16) {
          for (let a = 0; a < 12; a++) {
            const gx = Math.floor(px + Math.cos(a / 12 * Math.PI * 2) * r);
            const gy = Math.floor(py + Math.sin(a / 12 * Math.PI * 2) * r);
            let s2 = null;
            try { s2 = W.settlementAt(gx, gy); } catch (e) { }
            if (s2) considerSettle(s2);
            if (best && bd < r) break;
          }
        }
      }
      if (!best) return null;
      return {
      x: best.x, y: best.y, d: bd,
        dirName: compassName(best.x - px, best.y - py),
        title: (best.building && (best.building.title === "Bestiary" ? "Beast Lodge" : (best.building.title || "Beast Lodge"))) || "Beast Lodge",
      };
    } catch (e) { return null; }
  }
  // Furniture KINDS per class key (usable pieces only, mirrors the furn-kit
  // branches in designBuilding above). Lets the Codex describe what each
  // building's interior actually does without duplicating layout data.
  function furnKinds(classKey) {
    try {
      const cls = CLASSES[classKey];
      if (!cls) return [];
      switch (cls.furn) {
        case "home": case "sakura_home": return ["bed", "hearth", "shelf"];
        case "farm": return ["bunk", "hearth", "shelf"];
        case "holy": case "holy2": return ["altar", "shelf"];
        case "forge": case "forge2": return ["anvil", "trough"];
        case "inn": return ["counter", "fireplace", "bunk"];
        case "shop": return ["counter", "shelf"];
        case "barracks": return ["bunk"];
        case "hall": return ["longtable", "hearth", "throne"];
        case "manor": return ["bed", "fireplace", "shelf"];
        case "store": return [];
        case "tide": return ["altar", "pool", "shelf"];
        case "shrine": return ["altar", "offering", "shelf"];
        case "tea": return ["lowtable", "kettle"];
        case "bath": return ["pool"];
        case "dojo": return ["drum"];
        case "rune": return ["altar", "runecircle", "shelf"];
        case "stable": return ["trough", "nexus"];
        case "beast_lodge": return ["trough", "breednexus"];
        case "souk": return ["counter", "offering"];
        case "yurt": return ["hearth", "lowtable", "bed", "kettle", "shelf"];
        case "palace": return ["throne", "longtable", "hearth", "offering", "shelf"];
        case "harbor": return ["counter", "trough"];
        case "keep": return ["throne", "hearth", "longtable", "altar", "shelf"];
        case "blackmarket": return ["counter", "offering"];
        case "arcane": return ["runecircle", "altar"];
        case "library": return ["shelf"];
        default: return [];
      }
    } catch (e) { return []; }
  }
  // Service pins for the minimap + Known World map: furniture-kit → glyph,
  // plus guild halls by class key (they all share furn "hall", which otherwise
  // never pins). Homes, farms, plain halls, manors, keeps, warehouses,
  // barracks and harbors never pin (regular houses stay off the maps). The
  // stable + horse pen share 🐴, the beast lodge 🧬; classKey "stable" and
  // lodge keys are pinned by their own nexus code, so they return null here
  // (no doubles). Tavern halls keep their 🛏️ inn pin (they already show on
  // the maps) even though they also host guild work.
  const SERVICE_PINS = {
    shop: "🪙", souk: "🪙", harbor: "🪙",
    inn: "🛏️",
    forge: "⚒️", forge2: "⚒️",
    library: "📖",
    blackmarket: "🌑",
    arcane: "✨",
    dojo: "⚔️",
    tea: "🍵",
    bath: "🛁",
    holy: "⛪", holy2: "⛪",
    tide: "🌊",
    shrine: "⛩️",
    rune: "🔮",
    stable: "🐴",
    beast_lodge: "🧬",
  };
  // Mirrors window.Guild.GUILD_KEYS minus tavern_hall (which already pins as
  // an inn). Kept as a local copy so the maps work even if guild.js loads late.
  const GUILD_PIN_KEYS = {
    guildhall: 1, khan_hall: 1, terrace_hall: 1, ice_hall: 1,
    mead_hall: 1, great_hall: 1, bull_hall: 1, moss_hall: 1,
    wight_throne: 1, kobold_nook: 1, alpha_mound: 1, matriarch_perch: 1,
    orc_hall: 1,
  };
  // Castles, civic seats, guard posts and port landmarks — all large,
  // navigationally important settlement buildings whose furn kits ("keep",
  // "palace", "hall", "barracks", "harbor") otherwise never pin. Houses,
  // farms, manors/villas, warehouses and plain storage stay off the maps.
  const CASTLE_PIN_KEYS = {
    grand_castle: 1, castle_keep: 1, palace: 1,
    town_keep: 1, city_citadel: 1, tide_keep: 1, sakura_castle: 1,
    sun_keep: 1, gilt_keep: 1, harbor_keep: 1, village_keep: 1,
  };
  const CIVIC_PIN_KEYS = { chancery: 1, courthouse: 1 };
  const GUARD_PIN_KEYS = { barracks: 1, city_watch: 1 };
  const PORT_PIN_KEYS = { harbor_office: 1, lighthouse: 1 };
  function servicePinFor(classKey) {
    try {
      if (!classKey) return null;
      if (classKey === "stable") return null;
      try { if (isBeastLodgeKey(classKey)) return null; } catch (e) { }
      if (GUILD_PIN_KEYS[classKey]) return "🏛️";
      if (CASTLE_PIN_KEYS[classKey]) return "🏰";
      if (CIVIC_PIN_KEYS[classKey]) return "🏤";
      if (GUARD_PIN_KEYS[classKey]) return "🛡️";
      if (PORT_PIN_KEYS[classKey]) return "⚓";
      const cls = CLASSES[classKey];
      if (!cls) return null;
      return SERVICE_PINS[cls.furn] || null;
    } catch (e) { return null; }
  }

  return {
    WALL_HP, RINGWALL_HP, WINDOW_HP, LANTERN_HP, DUNGEON_HP,
    STYLES, CLASSES, LAYOUTS, SHAPES, notchRectsFor, inShape, isShapeEdge,
    settlementBuildings, originSettlement, originBuildings, buildingsFor, buildingsAt, buildingsInView,
    validateOverlaps, collapseBuildingToRubble,    isWallId, tileIsWindowOf, isRingWall, isEnemyBaseWall, ENEMY_WALL_HP, buildingCollapsed, playerBuilding, buildingRectAt,
    damageOverworldWall, damageDungeonWall, buildingTile,
    furnMaxHP, isFurnGone, furnitureAt, damageFurnitureAt, placeFurniture, placedFurnitureIn, drawPlacedFurniture, drawPlacedList,
    furnKinds,
    servicePinFor,
    drawRoofs, drawRoofFor, drawExteriorFor, drawInterior, drawCracks,
   findStableAt, stableNexusPos, nearestStable, stableGuidance, nearestFurn,
    isInnKey, innNexusPos, nearestInn, innGuidance,
   isBeastLodgeKey, findBeastLodgeAt, beastLodgeNexusPos, nearestBeastLodge, beastLodgeGuidance, beastLodgeWanted, ensureBeastLodgePlaced,
   // legacy aliases (older-baked "bestiary" chunks + any outside callers)
   findBestiaryAt: findBeastLodgeAt, bestiaryNexusPos: beastLodgeNexusPos, nearestBestiary: nearestBeastLodge,
   bestiaryGuidance: beastLodgeGuidance, bestiaryWanted: beastLodgeWanted, ensureBestiaryPlaced: ensureBeastLodgePlaced,
    doorFrontPos, candidateDoorsReachable,
    _buildingInProgress,
  };
})();
