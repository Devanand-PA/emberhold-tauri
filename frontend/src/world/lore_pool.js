/* LorePool — pre-generated, swappable lore for every context. window.LorePool.
   Everything here is static text: no AI calls, no network. To reskin the
   world, edit ONLY this file (or call LorePool.set(ctx, arr) at runtime):
     LorePool.set("village", ["your line", ...])
     LorePool.set("dungeon", [...])
     LorePool.set("rumor", [...])
   Contexts: settlement types (village/town/city/watergate/sakura/fortress/
   desert_souk/steppe_ger/mesa_pueblo/frost_hold/trade_city/port_city/capital/hell_castle/angel_village/angel_town/angel_city/pantheon/pantheon_outpost),
   wild biomes (forest/dark_forest/desert/tundra/sea/ocean/mountain/volcano/
   frostcrown/blightmire/stormcrag/crystal_scar/umbral_waste/lake/wild/heaven_cloud/heaven_meadow/heaven_grove/heaven_lake),
   dungeon, hell_dungeon, rumor, quest_fetch/quest_slay/quest_clear/quest_deliver/quest_chain.
   get(ctx) returns one line; pick(ctx, rng) is seeded (stable per chunk). */
window.LorePool = (() => {
  const D = {
    village: [
      "Thatched roofs and woodsmoke. Someone's goat is loose again.",
      "Barley dust on every sill. The well rope is newer than the gossip.",
      "Muddy lanes, warm hearths. Everyone knows whose dog dug whose garden.",
      "Rain barrels brim. The chapel bell counts cows more than hours.",
      "Fences mended with string and promises. Supper smells of onions.",
    ],
    town: [
      "Warm lamplight. The smell of bread.",
      "Cobbles worn smooth. Apprentices run messages past the market cross.",
      "Shutters bang in the lane wind. Somewhere a cooper argues with a barrel.",
      "Two inns glare at each other across the square. Both claim the better stew.",
      "Bell-ringers practice badly. Pigeons approve.",
    ],
    city: [
      "Bells over cobblestones. Coin and gossip change hands.",
      "Lantern rows hum. Guild seals stamp everything but the pigeons.",
      "Three crowds, four rumors, one truth — still being haggled over.",
      "Stone stairs, iron railings, a crier hoarse from proclamations.",
      "The night watch knows every alley; the alleys know the watch.",
    ],
    hell_castle: [
      "Black stone and old fire. The courts are swept; the stains are not.",
      "Bone drifts, blood pits, voidglass teeth. The portal-room hums at the heart.",
      "Ember vents breathe along the walls. The garrison never blinks.",
      "Two rings of stone, one moat of fire. Something vast dreams below.",
      "War-standards hang still in the hot air. The dark below keeps its own ledger.",
    ],
    watergate: [
      "Canals murmur under stone bridges. Barges knock softly at the locks.",
      "Wet rope, tar, and fried fish. Lock-keepers wave like minor royalty.",
      "Water stairs glisten. A tidewarden argues with a goose and loses.",
      "Moored skiffs bump the quay. Every bridge has its own beggar and song.",
    ],
    sakura: [
      "Pink petals drift over sand paths. A bell rings somewhere beyond the trees.",
      "Paper doors slide. Sandals whisper past stone lanterns.",
      "Tea steam curls. A shrine fox watches with painted eyes.",
      "Maple shade, raked gravel. Even the sparrows queue politely.",
    ],
    fortress: [
      "Hammer-song echoes off black stone. The forges never sleep.",
      "Rune-light crawls the gate arch. Boots ring on deep stairs.",
      "Coal dust and hot iron. The hall remembers every oath sworn in it.",
      "Beards and grudges, both long-kept. The lava moat glows at dusk.",
    ],
    desert_souk: [
      "Spice hangs in hot air. Awning canvas snaps over the bazaar din.",
      "Brass glints, dates stick, a water-seller's cry cuts the heat.",
      "Sand finds every pocket. Bargains find every ear.",
      "Caravan bells fade down the dune road. The sun temple keeps the shade.",
    ],
    steppe_ger: [
      "Horse bells across open grass. Felt walls breathe with the wind.",
      "Mare's milk, smoke, leather. The horizon is a promise, not a border.",
      "Fires dot the dusk like fallen stars. Someone tunes a horsehead fiddle.",
      "The khan's banner snaps. Foals race the wind and win.",
    ],
    mesa_pueblo: [
      "Sun-baked clay glows red. Turquoise glints in shaded doorways.",
      "Terraces climb like stairs for giants. Corn dries in bright strings.",
      "Canyon echo answers every hammer tap twice.",
      "Shade is currency. Stories are interest.",
    ],
    frost_hold: [
      "Snow hush and pine smoke. A skald tunes strings by the fire.",
      "Breath hangs. Runestones wear caps of snow like old men wear hats.",
      "Ale steam, wet wool, pine resin. The aurora minds its own business.",
      "The ice cellar holds summer's berries and winter's patience.",
    ],
    trade_city: [
      "Coin never sleeps. A hundred guild banners snap over the market roar.",
      "Ledgers slam, scales sing. Everything has a price, twice a day.",
      "Porters weave through silk and spice. The counting houses never blink.",
      "A charter is nailed to every third door. The fourth door sells nails.",
    ],
    port_city: [
      "Gulls and tar and brine. Ropes creak where tall ships lean at the quays.",
      "Fish markets shout the tide in. The lighthouse keeps its own counsel.",
      "Salt rusts every hinge. Sailors spend coin like it leaks.",
      "Harbor bells mark the ships; widows mark the ones that don't return.",
    ],
    capital: [
      "Bells and banners over white stone. The castle watches over every street.",
      "White stone and high bells. The castle keeps its own weather.",
      "Courtiers count banners; porters count steps. Both lose track.",
      "The high temple hums at noon. Even the pigeons stand straighter.",
    ],
    angel_village: [
      "Soft cloud underfoot, morning in every breath. Someone's halo needs polishing.",
      "Dew on cloud-grass. A choir practices scales behind the cottages.",
      "Cloud lanes, warm light. Everyone knows whose lamb drifted whose meadow.",
      "Mist bells count hours kindly. Supper smells of honey and rain.",
    ],
    angel_town: [
      "Dawn light on white cloud. The market smells of bread and lilies.",
      "Choir song over the square. Apprentice angels run messages on foot-worn cloud.",
      "Halos nod in the lane wind. The forge sings hymns while it works.",
      "Two tea-houses glare kindly at each other. Both claim the better dawn.",
    ],
    angel_city: [
      "Bells over bright cloud. Coin, kindness and gossip change hands.",
      "Lantern rows hum gold. Guild seals stamp everything but the finches.",
      "Three choirs, four rumors, one truth — still being sung over.",
      "White ramparts, soft thunder of wings. The watch knows every drift.",
    ],
    pantheon: [
      "The hush at the heart of dawn. The cloud holds you without asking.",
      "Gold light, slow wings. She is here, or nearly — the air says so.",
      "Watchers nod as you pass. The seal-marks remember every duel.",
      "No delves, no war. The whole point of heaven, kept in one circle.",
    ],
    pantheon_outpost: [
      "A small watch of dawn on the cloud road. Lanterns never go out.",
      "Way-markers hum faintly. Pilgrims rest their wings here.",
      "Quiet post, kind keepers. The pantheon's light reaches this far.",
    ],
    heaven_cloud: [
      "Soft cloud holds your weight. Dawn light from below, somehow.",
      "Mist that walks like ground. Every step sighs a little gold.",
    ],
    heaven_meadow: [
      "Blooms drift on white. Tall grass bows in a wind you cannot feel.",
      "Meadow-light on cloud. Finches stitch gold over the flowers.",
    ],
    heaven_grove: [
      "Orchard shade on soft cloud. Petals fall up, sometimes.",
      "Old trees root in morning. The grove hums low, like a choir warming.",
    ],
    heaven_lake: [
      "Still reservoirs mirror a sky that is also ground. Drink gently.",
      "Clear water cupped in cloud. Ripples ring gold, then forgive.",
    ],
    forest: ["Tall trees hush the wind.", "Moss swallows footfalls. Birds argue overhead.", "Light falls in green shafts. Something rustles, then thinks better of it."],
    dark_forest: ["No birdsong. The dark between the trees is watching.", "Gloom thick as water. Twigs snap where nothing walks.", "Pale fungi glow faintly. Best not to touch them."],
    desert: ["Hot sand sighs under a white sky.", "Dunes shift while you blink. Lizards judge your pace.", "A dry well, a bleached ribcage. Keep walking."],
    tundra: ["Snow hisses sideways. Nothing grows but silence.", "Ice cracks like old joints. The pines huddle dark.", "Whiteout swallows the trail. Follow the cairns."],
    sea: ["Gulls and green swells. Land is a rumor.", "Salt spray, bobbing weed. The horizon tilts and steadies."],
    ocean: ["A horizon of nothing but deep blue hunger.", "Swell on swell to the edge of the map. The deep keeps its own hours."],
    mountain: ["Thin cold air. Stone and pine.", "Goat bells from impossible heights. The path narrows."],
    volcano: ["Ash drifts. The ground breathes heat.", "Cinder crunches. The vents hiss lullabies for the deaf."],
    frostcrown: ["Glacier light. The cold has teeth.", "Blue ice groans. Frostbite writes on exposed skin."],
    blightmire: ["Sweet rot. The bog watches back.", "Black water mirrors a grey sky. Will-o'-wisps lie for sport."],
    stormcrag: ["Thunder never quite leaves. The air tastes of iron.", "Spires hum in the gale. Loose stones plot descents."],
    crystal_scar: ["The stones hum faintly, out of tune with the world.", "Glass-sharp ridges glitter. Echoes come back changed."],
    umbral_waste: ["Colour is thinner here. Something ate the brightness.", "Ash hangs windless. Shadows pool where no light casts them."],
    lake: ["Still water mirrors the sky.", "Reeds whisper. A fish jumps once, as if to check."],
    wild: ["Open wilds under a wide sky.", "Grass bends in waves. A hawk circles, unimpressed.", "The road is a suggestion. The wind is an argument."],
    dungeon: [
      "Cold air rises from below. The steps go down further than the map admits.",
      "Old stone sweats. Something below breathes in its sleep.",
      "Torch soot marks the arch. No torch-marks come back up.",
      "The dark down there is heavier — it leans on you.",
      "Water drips with metronome patience. The deep keeps count.",
      "Carved warnings worn smooth by hands that didn't heed them.",
    ],
    hell_dungeon: [
      "Ash drifts down like grey snow. The dark below is hungry.",
      "The steps descend into heat-shimmer. Something below breathes brimstone.",
      "Bone dust coats the arch. Nothing that went down came back up whole.",
      "The dark down there burns — it leans on you, and it is hot.",
      "Blood drips with metronome patience. The deep keeps count in red.",
      "Carved warnings, worn smooth, in a script that hurts to read.",
    ],
    rumor: [
      "They say the deep crypt's lord keeps a chest of star-iron.",
      "A traveler swears the old well grants wishes — for a price in teeth.",
      "The miller's daughter saw lights in the barrow field. Dancing. Counting.",
      "Someone's been buying up all the salt. Nobody admits to fishing.",
      "The blacksmith's quench-water steams black now. He won't say why.",
      "A one-eyed crow follows the tax collector. The collector pretends not to notice.",
      "The inn ran out of beds the night the bell rang twice. Nobody rang it.",
      "Wolves avoid the north treeline. The hunter won't say what's up there.",
    ],
    quest_fetch: [
      "The stores run thin, and winter has a long memory.",
      "What we need grows wild where the road forgets its name.",
      "No coin for this — only gratitude, and gratitude keeps poorly. Still: please.",
    ],
    quest_slay: [
      "They press in on every side. Thin them, or we bury our own.",
      "It took something I can't name without shaking. End it.",
      "The treeline moves at night. Make it stop.",
    ],
    quest_clear: [
      "The delve below stirs at night, and I hear my grandmother's warnings in it.",
      "Something down there wears the dark like a cloak. Put it down.",
      "The stones breathe. Go down, find the thing, end it.",
    ],
    quest_deliver: [
      "Carry it yourself — don't hire it out, don't peek.",
      "It must arrive unopened. The seal matters more than the contents.",
      "Walk it there warm. The road is the last ingredient.",
    ],
    quest_chain: [
      "It will take more than one road. Will you walk it?",
      "Blood first, then the blade — as my family has always done.",
      "Gather, then carry — two trips, one promise.",
    ],
  };
  function keys() { return Object.keys(D); }
  function all(ctx) {
    try { const a = D[String(ctx || "")]; return Array.isArray(a) && a.length ? a.slice() : null; }
    catch (e) { return null; }
  }
  function get(ctx, fb) {
    try {
      const a = all(ctx);
      if (a) return a[(Math.random() * a.length) | 0];
      return fb != null ? fb : "";
    } catch (e) { return fb != null ? fb : ""; }
  }
  function pick(ctx, seed) {
    // seeded (stable) variant: same seed -> same line. Used for chunks.
    try {
      const a = all(ctx);
      if (!a) return "";
      let s = (seed | 0) >>> 0;
      s = (Math.imul(s ^ 0x9E3779B9, 2654435761) >>> 0) % a.length;
      return a[s < 0 ? 0 : s];
    } catch (e) { return ""; }
  }
  function loreForChunk(biome, settlementType, seed) {
    try {
      const st = settlementType && D[settlementType] ? settlementType : null;
      const b = biome && D[biome] ? biome : "wild";
      // settlement voice wins; biome adds a second sentence half the time —
      // except the dark castle, which speaks with one voice (no town small-talk).
      const a = st ? pick(st, seed | 0) : pick(b, seed | 0);
      if (st === "hell_castle") return a;
      if (st && D[b] && ((seed | 0) & 1)) return a + " " + pick(b, (seed | 0) ^ 0x5F3759DF);
      return a || pick("wild", seed | 0) || "Open wilds under a wide sky.";
    } catch (e) { return "Open wilds under a wide sky."; }
  }
  function set(ctx, arr) {
    try {
      ctx = String(ctx || "");
      if (!Array.isArray(arr) || !arr.length) return false;
      D[ctx] = arr.map(s => String(s).slice(0, 280));
      return true;
    } catch (e) { return false; }
  }
  return { data: D, keys, all, get, pick, loreForChunk, set };
})();
