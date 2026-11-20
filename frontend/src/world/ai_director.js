/* Programmatic Director: chunk enrichment, NPC generation, Prexzy chat. window.AIDirector
   No ai-text-plugin. Background world-dreaming is fully programmatic
   (Names + LorePool + seeded roles). Prexzy (src/prexzy.js) is used ONLY for
   NPC chat replies; trade intent + summaries + quests are programmatic. */
window.AIDirector = (() => {
  function hasAI() { return false; } // background AI removed — chats use Prexzy, rest is code
  // Background queue removed: enrichment is synchronous code (no ai-text-plugin).
  const bgStatus = { done: 0, failed: 0, skipped: 0, last: "programmatic", lastError: null };
  // Large offline pools: the old 20-name lists collided after a dozen villagers
  // (two Gretas in Emberhold already). 60 deep so deterministic hash picks stay rare.
  const FALLBACK_FIRST = ["Asha", "Bram", "Celia", "Doran", "Elowen", "Finn", "Greta", "Halden", "Isolde", "Joren", "Kaia", "Liora", "Merrick", "Nyra", "Osric", "Petra", "Rowan", "Sella", "Tam", "Wren", "Alban", "Beatrix", "Corvin", "Delia", "Edric", "Faye", "Garrick", "Hester", "Ivor", "Jessamine", "Kellan", "Maren", "Nessa", "Odo", "Pella", "Quinn", "Rosalind", "Sten", "Tilda", "Ulric", "Vesper", "Ansel", "Brynn", "Cora", "Dunstan", "Elga", "Fenwick", "Gisela", "Harlow", "Ines", "Jory", "Kess", "Lark", "Mabel", "Noll", "Odette", "Perrin", "Sabine", "Tobias", "Una"];
  const FALLBACK_ROLES = ["blacksmith", "innkeeper", "healer", "cleric", "herbalist", "merchant", "hunter", "scholar", "guard", "farmer", "bard", "fisher", "ninja", "thief", "unemployed", "adventurer", "desert_nomad", "steppe_rider", "mesa_shaman", "frost_skald", "knight", "dockworker", "guildmaster"];
  const FALLBACK_QUIRKS = ["collects shiny pebbles", "hums old road songs", "is afraid of deep water", "dreams of the capital", "owes the inn money", "talks to crows", "carves wooden birds", "never removes their scarf"];
  const FALLBACK_PLACES = ["Mossy Hollow", "Thornhill", "Cinderbrook", "Foxglove Field", "Gloamwood", "Pebbleford", "Ashen Copse", "Willowmere"];
  // themed fallback names — all chunks of one settlement share the center-seeded name
  const THEME_PLACES = {
    village: ["Mossy Hollow", "Pebbleford", "Thornhill", "Barleyfield", "Dunmore", "Oatmeal", "Foxden", "Millbrook"],
    town: ["Cinderbrook", "Willowmere", "Thornhollow", "Emberford", "Gloamridge", "Havenshire", "Bellmere", "Oakhaven"],
    city: ["Kingsreach", "Highmarket", "Valoria", "Crownsgate", "Eldermere", "Stormhaven", "Goldspire", "Throneshire"],
    watergate: ["Tidegate", "Sluiceport", "Canalmere", "Lockwater", "Mirelock", "Floodgate", "Brinehaven", "Culvertown"],
    sakura: ["Sakuragawa", "Hanabira", "Yozakura", "Kitsunemori", "Momijimura", "Tsukimachi", "Hanamura", "Sakuramachi"],
    fortress: ["Stonehelm", "Irondeep", "Durhold", "Anvilgate", "Grimbarrow", "Kharaz-Kul", "Deephold", "Runehammer"],
    desert_souk: ["Sunspice Souk", "Amberwash", "Dunemarket", "Saffronhold", "Cinderbazaar", "Miragegate", "Sandspire", "Zephyr Souk"],
    steppe_ger: ["Windmane Camp", "Khansteppe", "Marehold", "Skyherd", "Gallopmere", "Feltwind", "Horsegate", "OpenSky"],
    mesa_pueblo: ["Redledge", "Sunbaked Terrace", "Cliffshade", "Turquoise Mesa", "Canyonhold", "Adobe Rest", "Eagleperch", "Painted Rock"],
    frost_hold: ["Snowmark", "Icebraid", "Frostlamp", "Wintergate", "Aurorahold", "Pinefrost", "Skaldhome", "Glacierrest"],
    trade_city: ["Goldmarket", "Grand Bazaar", "Silk Exchange", "Ivory Emporium", "Copper Crossing", "Freeharbor", "Marblerow", "Ambermart"],
    port_city: ["Saltport", "Tidehaven", "Gullquay", "Anchorlight", "Keelmouth", "Brinewatch", "Pearlreach", "Stormharbor"],
    capital: ["Kingshold", "Crowngard", "Thronespire", "Sovereignburg", "Imperial Haven", "Royalreach", "Elderthrone", "Highcrown"],
    angel_village: ["Dewmere", "Cloudrest", "Haloholt", "Meadowlight", "Petalthorpe", "Brookmere", "Sunfield", "Mistral"],
    angel_town: ["Radiance", "Dawnford", "Seraphine", "Hallowmere", "Lumenholt", "Choirgate", "Aurora", "Blessing"],
    angel_city: ["Celestia", "Empyrean", "Halcyon", "Seraphopolis", "Dawnspire", "Luminara", "Elysia", "Paragon"],
    pantheon: ["Radiant Pantheon"],
    pantheon_outpost: ["Dawnwatch", "Halowatch", "Auroragate"],
  };
  const THEME_LORE = {
    village: "Thatched roofs and woodsmoke. Someone's goat is loose again.",
    town: "Warm lamplight. The smell of bread.",
    city: "Bells over cobblestones. Coin and gossip change hands.",
    watergate: "Canals murmur under stone bridges. Barges knock softly at the locks.",
    sakura: "Pink petals drift over sand paths. A bell rings somewhere beyond the trees.",
    fortress: "Hammer-song echoes off black stone. The forges never sleep.",
    desert_souk: "Spice hangs in hot air. Awning canvas snaps over the bazaar din.",
    steppe_ger: "Horse bells across open grass. Felt walls breathe with the wind.",
    mesa_pueblo: "Sun-baked clay glows red. Turquoise glints in shaded doorways.",
    frost_hold: "Snow hush and pine smoke. A skald tunes strings by the fire.",
    trade_city: "Coin never sleeps. Banners of a hundred guilds snap over the market roar.",
    port_city: "Gulls and tar and brine. Ropes creak where tall ships lean at the quays.",
    capital: "Bells and banners over white stone. The castle watches over every street.",
    angel_village: "Soft cloud underfoot, morning in every breath. Someone's halo needs polishing.",
    angel_town: "Dawn light on white cloud. The market smells of bread and lilies.",
    angel_city: "Bells over bright cloud. Coin, kindness and gossip change hands.",
    pantheon: "The hush at the heart of dawn. The cloud holds you without asking.",
    pantheon_outpost: "A small watch of dawn on the cloud road. Lanterns never go out.",
    heaven_cloud: "Soft cloud holds your weight. Dawn light from below, somehow.",
    heaven_meadow: "Blooms drift on white. Tall grass bows in a wind you cannot feel.",
    heaven_grove: "Orchard shade on soft cloud. Petals fall up, sometimes.",
    heaven_lake: "Still reservoirs mirror a sky that is also ground. Drink gently.",
  };
  const THEME_NAMES = {
    sakura: ["Yuki", "Haruto", "Sakura", "Ren", "Aiko", "Kenji", "Hana", "Daiki", "Momo", "Itsuki", "Noa", "Sora", "Hina", "Sho", "Emi", "Riku", "Mei", "Kaito", "Yuna", "Sosuke"],
    fortress: ["Bromm", "Dagna", "Khazra", "Thrain", "Helga", "Durin", "Sigrun", "Bofur", "Hilda", "Rurik", "Gretta", "Snorri", "Baldin", "Eitri", "Fulla", "Grimhild", "Hodr", "Magni", "Ragnhild", "Skaldi"],
    watergate: ["Marlow", "Nixie", "Canal", "Brin", "Sluice", "Marina", "Dock", "Rill", "Coral", "Mira", "Shelly", "Wade", "Delmar", "Nerissa", "Pike", "Harbor"],
    desert_souk: ["Zara", "Samir", "Qasim", "Noura", "Aziz", "Safa", "Farid", "Jasmin", "Hakim", "Soraya", "Malik", "Amira", "Rashid", "Leila", "Omar", "Zahra"],
    steppe_ger: ["Khan", "Batu", "Tuya", "Mergen", "Naran", "Temur", "Bolormaa", "Chuluu", "Erdene", "Saran", "Tuguldur", "Oyuun"],
    mesa_pueblo: ["Sani", "Tawa", "Kaya", "Povi", "Masa", "Nita", "Tse", "Pola", "Yuma", "Kina", "Sitala", "Moki"],
    frost_hold: ["Aska", "Birgit", "Frode", "Skadi", "Torvald", "Ulf", "Sigrid", "Eirik", "Hafdis", "Inga", "Snorri", "Ylva"],
    trade_city: ["Aldous", "Beatrix", "Corvin", "Delia", "Edric", "Faye", "Garrick", "Hester", "Jory", "Kess"],
    port_city: ["Marlow", "Coral", "Mira", "Pike", "Harbor", "Wade", "Nerissa", "Delmar", "Brin", "Shelly"],
    capital: ["Aldric", "Seraphina", "Corvin", "Isolde", "Reginald", "Vesper", "Octavia", "Cassius", "Rowena", "Percival"],
  };
  // surnames so every NPC gets a first + last name (themed where it matters)
  const FALLBACK_LAST = ["Ashford", "Blackwood", "Thorne", "Grimsbane", "Honeycutt", "Oatfield", "Stonebridge", "Fairwind", "Cinder", "Marsh", "Dunley", "Barleycorn", "Foxglove", "Holloway", "Pebble", "Willowshade", "Ember", "Gloam", "Tawny", "Millerson", "Blackmoor", "Candlewick", "Dusk", "Emberline", "Foxworth", "Greenhollow", "Harrow", "Ironfield", "Juniper", "Kettle", "Larkspur", "Millbank", "Nightingale", "Oakhart", "Penny", "Quill", "Raven", "Salt", "Thistledown", "Underbough", "Vale", "Winter", "Yarrow", "Barrel", "Moss", "Flint", "Copper", "Storm", "Reed", "Birch", "Alder", "Fen", "Heath", "Bracken", "Clover", "Gale", "Hazel", "Mist", "Dandelion", "Wick"];
  const THEME_LAST = {
    sakura: ["Tanaka", "Sato", "Suzuki", "Takahashi", "Watanabe", "Yamamoto", "Nakamura", "Kobayashi", "Ito", "Kato", "Mori", "Hayashi", "Okada", "Hasegawa", "Murakami", "Fujita"],
    fortress: ["Ironhelm", "Stonebeard", "Anvilson", "Grimforge", "Deepdelver", "Runecarver", "Oathstone", "Coalback", "Goldseam", "Frostpeak", "Cinderhold", "Stormgrip"],
    watergate: ["Tide", "Lockwood", "Bridger", "Canaler", "Harbor", "Sluice", "Mire", "Brine", "Flood", "Dockett", "Rill", "Current"],
    desert_souk: ["Dunewalker", "Sunbrand", "Sandseer", "Spiceborn", "Miragewright", "Cinderjack", "Sirocco", "Oasisborn", "Zephyr", "Amberwright", "Sandmark", "Sunspear"],
    steppe_ger: ["Horserider", "Windmane", "Skymane", "Marehoof", "Steppeborn", "Khanward", "Windherd", "Gallopwind"],
    mesa_pueblo: ["Cliffshade", "Redrock", "Sunborn", "Turquoise", "Canyonsong", "Adobewalker", "Eagleeye", "Paintedrock"],
    frost_hold: ["Snowborn", "Icebraid", "Stormsong", "Wintermark", "Frostbeard", "Skaldsong", "Snowward", "Icemark"],
    trade_city: ["Goldmark", "Coinwright", "Freeborn", "Silkmark", "Ledger", "Bazaar", "Copperscale", "Marblemark"],
    port_city: ["Saltborn", "Tidecaller", "Anchormark", "Keelhaul", "Brineborn", "Gullcry", "Pearlmark", "Stormwatch"],
    capital: ["Crownguard", "Throneborn", "Kingsward", "Sovereign", "Highmark", "Royce", "Eldermark", "Regal"],
  };
  const THEME_ROLES = {
    sakura: ["samurai", "ninja", "priest", "cleric", "merchant", "scholar", "guard", "innkeeper", "healer", "farmer", "thief", "unemployed", "adventurer"],
    fortress: ["runesmith", "guard", "blacksmith", "merchant", "scholar", "healer", "cleric", "miner", "bard", "ninja", "unemployed", "adventurer"],
    watergate: ["tidewarden", "fisher", "merchant", "innkeeper", "guard", "scholar", "healer", "herbalist", "bard", "thief", "unemployed", "adventurer"],
    city: ["guard", "merchant", "scholar", "innkeeper", "healer", "cleric", "blacksmith", "bard", "priest", "herbalist", "ninja", "thief", "unemployed", "adventurer"],
    town: ["blacksmith", "innkeeper", "healer", "cleric", "herbalist", "merchant", "hunter", "scholar", "guard", "farmer", "ninja", "thief", "unemployed", "adventurer"],
    village: ["farmer", "hunter", "innkeeper", "healer", "herbalist", "fisher", "bard", "guard", "merchant", "thief", "unemployed", "adventurer"],
    desert_souk: ["desert_nomad", "merchant", "innkeeper", "healer", "scholar", "guard", "bard", "thief", "herbalist", "unemployed", "adventurer"],
    steppe_ger: ["steppe_rider", "hunter", "innkeeper", "healer", "bard", "guard", "merchant", "thief", "unemployed", "adventurer"],
    mesa_pueblo: ["mesa_shaman", "farmer", "merchant", "healer", "herbalist", "guard", "bard", "innkeeper", "unemployed", "adventurer"],
    frost_hold: ["frost_skald", "hunter", "healer", "guard", "merchant", "innkeeper", "bard", "fisher", "scholar", "unemployed", "adventurer"],
   trade_city: ["guildmaster", "merchant", "magistrate", "guard", "knight", "scholar", "innkeeper", "healer", "bard", "thief", "noble", "unemployed", "adventurer"],
   port_city: ["harbormaster", "dockworker", "fisher", "tidewarden", "merchant", "innkeeper", "guard", "scholar", "bard", "thief", "unemployed", "adventurer"],
   capital: ["monarch", "noble", "knight", "chancellor", "highpriest", "marshal", "magistrate", "guard", "scholar", "merchant", "priest", "bard", "unemployed", "adventurer"],
    // v16 hell holds: civilized demons act like NPCs (trade/chat/recruit).
    demon_village: ["civilized_succubus", "civilized_hellbeast", "civilized_infernal", "civilized_doom", "hell_merchant", "hell_guard", "healer", "unemployed", "adventurer"],
    demon_town: ["civilized_succubus", "civilized_hellbeast", "civilized_infernal", "civilized_doom", "hell_priest", "hell_merchant", "hell_guard", "healer", "scholar", "unemployed", "adventurer"],
    demon_city: ["civilized_succubus", "civilized_hellbeast", "civilized_infernal", "civilized_doom", "hell_priest", "hell_merchant", "hell_guard", "scholar", "guard", "unemployed", "adventurer"],
    hell_castle: ["civilized_doom", "hell_priest", "hell_guard", "civilized_infernal", "civilized_succubus", "unemployed", "adventurer"],
    angel_village: ["dawn_angel", "choir_angel", "angel_merchant", "healer", "herbalist", "farmer", "bard", "angel_guard", "heavendweller", "heavendweller", "unemployed", "adventurer"],
    angel_town: ["dawn_angel", "choir_angel", "seraph_guard", "scroll_angel", "angel_priest", "angel_merchant", "angel_guard", "healer", "heavendweller", "heavendweller", "scholar", "unemployed", "adventurer"],
    angel_city: ["seraph_guard", "dawn_angel", "choir_angel", "scroll_angel", "angel_priest", "angel_merchant", "scholar", "guard", "heavendweller", "heavendweller", "unemployed", "adventurer"],
    pantheon: ["seraph_guard", "angel_priest", "choir_angel", "scroll_angel", "dawn_angel", "heavendweller", "unemployed", "adventurer"],
    pantheon_outpost: ["angel_guard", "dawn_angel", "healer", "heavendweller", "heavendweller", "unemployed", "adventurer"],
  };
  const THEME_PROMPT = {
    village: "a small farming hamlet of thatch and timber",
    town: "a cozy market town of stone and timber",
    city: "a walled city of cobbles, guildhalls and lanterns",
    watergate: "a canal-city threaded with waterways, locks, stone bridges and a moat (Venice-like)",
    sakura: "an ancient maple-and-cherry town of sand paths, paper doors, stone lanterns and pink sakura trees (old-Japan-like)",
    fortress: "a dwarven mountain fortress of black stone walls, a lava moat, forge-glow and a great stone hall",
    desert_souk: "a sun-baked adobe souk of spice stalls, canvas awnings, a caravanserai and a sun temple (Morocco-like)",
    steppe_ger: "a windswept steppe camp of felt gers, horse pens, sky shrines and a khan hall (Mongolia-like)",
    mesa_pueblo: "a red-rock terrace pueblo of adobe houses, kivas, turquoise shops and shaded plazas (Southwest-like)",
    frost_hold: "a snow-bound northern hold of timber halls, runestones, saunas and skald fires (Norse-like)",
    trade_city: "a huge commercial trade-city of grand bazaars, counting houses, merchant villas and warehouses, humming with coin",
    port_city: "a bustling port-city of docks, warehouses, a lighthouse, fish markets and sail lofts around a sheltered harbor",
    capital: "a grand capital with double walls, a castle keep and palace, noble villas, a chancery, a high temple and a city watch",
  };
  // wild-region fallback: procedural mood+landform weave (seeded, stable),
  // pool only if the weaver is unavailable.
  function fallbackWildName(seedH) {
    try {
      if (window.Names && window.Names.wild) {
        const nm = window.Names.wild(((seedH || 0) * 2147483647) | 0);
        if (nm) return nm;
      }
    } catch (e) {}
    return FALLBACK_PLACES[(seedH * FALLBACK_PLACES.length) | 0] || "Wilds";
  }
  // heaven wilds drift under dawn names even when no hearth claims them
  function heavenWildName(seedH, dim) {
    try {
      if (dim === "heaven" && window.Names && window.Names.wildHeaven) {
        const nm = window.Names.wildHeaven(((seedH || 0) * 2147483647) | 0);
        if (nm) return nm;
      }
    } catch (e) {}
    return fallbackWildName(seedH);
  }
  function themeName(type, seedH) {
    // procedural culture-aware weave (seeded, stable per settlement) —
    // the fixed pools below survive only as AI-prompt examples + fallback.
    try {
      if (window.Names && window.Names.settlement) {
        const nm = window.Names.settlement(type, ((seedH || 0) * 2147483647) | 0);
        if (nm) return nm;
      }
    } catch (e) {}
    const pool = THEME_PLACES[type] || FALLBACK_PLACES;
    return pool[(seedH * pool.length) | 0] || pool[0];
  }

  // ---- letter-dice naming game ----
  // Roll 2-10 for the first-name letter count and 2-10 for the last-name letter
  // count, then roll that many random A-Z letters each. The programmatic
  // weaver must produce a first+last name containing them, which breaks it
  // out of pet names.
  // (Was 1-6; widened because short rolls fell back to Kaelen /
  // Elara-style repeats. rollInt is hoisted, so safe to use here.)
  function rollDie(sides) { return 1 + ((Math.random() * sides) | 0); }
  function rollLetters(n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(String.fromCharCode(65 + ((Math.random() * 26) | 0)));
    return [...new Set(out)]; // a doubled letter only constrains once
  }
  function rollNameSeeds() {
    return { first: rollLetters(rollInt(2, 10)), last: rollLetters(rollInt(2, 10)) };
  }
  function namingBlock(seeds) {
    return seeds.map((ns, idx) =>
      `NPC ${idx + 1}: first name MUST contain every one of [${ns.first.join(", ")}], last name MUST contain every one of [${ns.last.join(", ")}] (each letter at least once, any position, case-insensitive)`
    ).join("\n");
  }
  // Numbered fallback when a name repeats in one place ("Abnes Wilson 2").
  // Scoped to placeName: two villages may each have an Asha; one village may not.
  // NOTE: callers must await window.World.ensureMemLoaded() first so
  // stored-but-unloaded villagers count (mem alone only holds visited chunks).
  function uniquifyNpcName(name, placeName) {
    const want = String(name || "Traveler").trim().slice(0, 32) || "Traveler";
    const scope = String(placeName || "").toLowerCase();
    const taken = new Set();
    try {
      for (const n of window.World._mem.npcs.values()) {
        if (String(n.placeName || "").toLowerCase() !== scope) continue;
        taken.add(String(n.name || "").toLowerCase());
      }
    } catch (e) { }
    if (!taken.has(want.toLowerCase())) return want;
    let k = 2;
    while (taken.has(`${want} ${k}`.toLowerCase())) k++;
    return `${want} ${k}`;
  }

  // ---- region letter-dice naming game (mirrors the NPC naming game) ----
  // Roll two dice for letter counts (x=2..y=7 to start), then roll that many
  // random A-Z letters per group. The programmatic weaver must produce a
  // region name containing them all (e.g. 4 -> s,p,h,a and 5 -> m,n,t,n,s
  // could give "Sophia Mountains"). On collision the dice range widens
  // (3-8, 4-9, ...) and the weaver tries again until the name is new.
  function rollInt(min, max) {
    min |= 0; max |= 0;
    if (max < min) { const t = min; min = max; max = t; }
    return min + ((Math.random() * (max - min + 1)) | 0);
  }
  function rollRegionSeeds(min, max) {
    if (min == null) min = 2;
    if (max == null) max = 7;
    const n1 = rollInt(min, max), n2 = rollInt(min, max);
    return { first: rollLetters(n1), second: rollLetters(n2), n1, n2, min, max };
  }
  function regionNamingBlock(seed) {
    return `Region name MUST contain every one of [${seed.first.join(", ")}] and every one of [${seed.second.join(", ")}] (each letter at least once somewhere in the WHOLE name, any position, case-insensitive — e.g. s,p,h,a + m,n,t,n,s could give "Sophia Mountains"). Vary the form to fit the land (town, vale, mountains, forest, hollow, gate, ...).`;
  }
  // Has this place name already been generated? Same-settlement siblings share
  // one name on purpose, so they never count as a collision.
  function placeNameTaken(name, selfCh) {
    const want = String(name || "").trim().toLowerCase();
    if (!want) return false;
    try {
      for (const o of window.World._mem.chunks.values()) {
        if (selfCh && o === selfCh) continue;
        if (!o.placeName || String(o.placeName).trim().toLowerCase() !== want) continue;
        if (selfCh && selfCh.scx != null && o.scx === selfCh.scx && o.scy === selfCh.scy) continue;
        return true;
      }
    } catch (e) { }
    return false;
  }
  function uniquifyPlaceName(name, selfCh) {
    let base = String(name || "Wilds").trim().slice(0, 28) || "Wilds";
    if (!placeNameTaken(base, selfCh)) return base;
    const tags = ["North", "South", "East", "West", "Upper", "Lower", "Great", "Little", "Old", "New"];
    for (const t of tags) {
      const c = `${base} ${t}`.slice(0, 32);
      if (!placeNameTaken(c, selfCh)) return c;
    }
    let k = 2;
    while (placeNameTaken(`${base} ${k}`, selfCh)) { k++; if (k > 99) break; }
    return `${base} ${k}`.slice(0, 32);
  }
  // Programmatic region naming: seeded weave + uniqueness, no AI.
  // Retries widen the phonotactic seed until the name is new.
  function dreamRegionNameSync(selfCh, attempt) {
    try {
      const st = (selfCh && selfCh.settlementType) || null;
      const base = selfCh ? ((selfCh.cx * 918273 + selfCh.cy * 127373 + (attempt | 0) * 1013904223) | 0) : ((Math.random() * 1e9) | 0);
      for (let t = 0; t < 8; t++) {
        const seed = (base + t * 2246822519) | 0;
        let nm = null;
        try {
          if (st && window.Names && window.Names.settlement) nm = window.Names.settlement(st, seed);
          else if (selfCh && selfCh.dim === "heaven" && window.Names && window.Names.wildHeaven) nm = window.Names.wildHeaven(seed);
          else if (window.Names && window.Names.wild) nm = window.Names.wild(seed);
        } catch (e) { nm = null; }
        if (!nm && window.Names && window.Names.phoneticPlace) {
          try { nm = window.Names.phoneticPlace(seed); } catch (e2) {}
        }
        if (nm && !placeNameTaken(nm, selfCh) && String(nm).toLowerCase() !== "emberhold") return String(nm).slice(0, 32);
      }
    } catch (e) {}
    return uniquifyPlaceName(fallbackWildName(Math.random()), selfCh);
  }


  // ---- chunk enrichment ----
  // Slot-generation guard: every async dream captures the world it started in
  // (slot + epoch) and aborts the moment the player switches slots, deletes
  // the world, or starts a new game — so names dreamed in slot A can never
  // leak into slot B, and a deleted world's late dream can't resurrect.
  function dreamSlot() { try { return window.World.getSlot(); } catch (e) { return "1"; } }
  function dreamEpoch() { try { return window.World.slotEpoch(); } catch (e) { return 0; } }
  function dreamStale(mySlot, myEpoch) {
    try {
      if (window.World.getSlot() !== mySlot) return true;
      if (window.World.slotEpoch && window.World.slotEpoch() !== myEpoch) return true;
    } catch (e) { }
    return false;
  }
  async function enrichChunk(cx, cy, slot, epoch, dim) {
    const W = window.World;
    const mySlot = /^[1-5]$/.test(String(slot)) ? String(slot) : dreamSlot();
    const myEpoch = (epoch == null ? dreamEpoch() : epoch);
    // v18: enrich the chunk's own dimension (same numbers, separate stores).
    let ddim = "surf";
    try { ddim = (dim === "hell" || dim === "heaven" || dim === "surf") ? dim : (W.getDim ? W.getDim() : "surf"); } catch (e) {}
    let ch; try { ch = await W.getChunk(cx, cy, ddim); } catch (e) { return; }
    if (!ch || dreamStale(mySlot, myEpoch)) return;
    if (ch.enriched) return;
    try { if (W.ensureMemLoaded) await W.ensureMemLoaded(); } catch (e) { }
    if (dreamStale(mySlot, myEpoch)) return;
    // Fully programmatic: fallback weave + LorePool + NPCs, marked enriched at once.
    await applyFallbackChunk(ch, mySlot, myEpoch);
    if (dreamStale(mySlot, myEpoch)) return;
    await applyProgrammaticChunk(ch, mySlot, myEpoch);
    if (dreamStale(mySlot, myEpoch)) return;
    await W.saveChunk(ch, mySlot);
    bgStatus.done++;
  }
  // Background half removed: enrichment is inline & programmatic. Kept as
  // programmatic path (enrichChunk) is the only path.
  async function applyFallbackChunk(ch, slot, epoch) {
    if (ch.enriched) return;
    const W = window.World;
    const mySlot = /^[1-5]$/.test(String(slot)) ? String(slot) : dreamSlot();
    const myEpoch = (epoch == null ? dreamEpoch() : epoch);
    try { if (W.ensureMemLoaded) await W.ensureMemLoaded(); } catch (e) { }
    if (dreamStale(mySlot, myEpoch)) return;
    const st = ch.settlementType || null;
    const h = W.hash2(ch.cx * 91 + 7, ch.cy * 57 + 3);
    if (!ch.placeName) {
      if (st && ch.scx != null) {
        // every chunk of one settlement shares the center-seeded name
        const sh = W.hash2(ch.scx * 7 + 1, ch.scy * 13 + 2);
        ch.placeName = themeName(st, sh);
      } else ch.placeName = ch.biome === "town" ? themeName("town", h) :
        heavenWildName(h, ch.dim);
    }
    // fallback names still join the uniqueness game (same-settlement
    // siblings share on purpose and are exempt inside placeNameTaken)
    if (ch.placeName && ch.biome !== "town" && placeNameTaken(ch.placeName, ch)) {
      ch.placeName = uniquifyPlaceName(ch.placeName, ch);
    }
    // LorePool (swappable) wins; hardcoded biome lines survive as fallback.
    try {
      if (!ch.lore && window.LorePool) {
        const seed = ((ch.cx * 73856093) ^ (ch.cy * 19349663)) | 0;
        ch.lore = window.LorePool.loreForChunk(ch.biome, st, seed);
      }
    } catch (e) {}
    ch.lore = ch.lore || (st && THEME_LORE[st]) || (ch.biome === "town" ? "Warm lamplight. The smell of bread." :
      ch.biome === "forest" ? "Tall trees hush the wind." :
      ch.biome === "dark_forest" ? "No birdsong. The dark between the trees is watching." :
      ch.biome === "desert" ? "Hot sand sighs under a white sky." :
      ch.biome === "tundra" ? "Snow hisses sideways. Nothing grows but silence." :
      ch.biome === "sea" ? "Gulls and green swells. Land is a rumor." :
      ch.biome === "ocean" ? "A horizon of nothing but deep blue hunger." :
      ch.biome === "mountain" ? "Thin cold air. Stone and pine." :
      ch.biome === "volcano" ? "Ash drifts. The ground breathes heat." :
      ch.biome === "frostcrown" ? "Glacier light. The cold has teeth." :
      ch.biome === "blightmire" ? "Sweet rot. The bog watches back." :
      ch.biome === "stormcrag" ? "Thunder never quite leaves. The air tastes of iron." :
      ch.biome === "crystal_scar" ? "The stones hum faintly, out of tune with the world." :
      ch.biome === "umbral_waste" ? "Colour is thinner here. Something ate the brightness." :
      ch.biome === "lake" ? "Still water mirrors the sky." : "Open wilds under a wide sky.");
    for (const poi of ch.pois) if (poi.type === "sign") poi.text = ch.placeName;
    // spawn fallback NPCs for empty slots
    await ensureFallbackNpcs(ch, mySlot, myEpoch);
    ch.enriched = true; // programmatic world: fallback IS the world
    // multiplayer thin client: joiners never dream or populate — the host's
    // snapshots are the only villagers they ever see. Mark enriched so no
    // background dream is queued for a world that isn't theirs.
    try { if (window.MP && window.MP.M && window.MP.M.active && window.MP.isHost && !window.MP.isHost()) ch.enriched = true; } catch (e) { }
  }
  // Programmatic "enriched" pass: phonotactic re-roll on collision, LorePool
  // rumor, dungeon name/lure. Runs inline — no network, no cooldown.
  const DUNGEON_ADJ = ["Sunken", "Gloam", "Ember", "Whispering", "Hollow", "Weeping", "Iron", "Mossy", "Silent", "Burning", "Frozen", "Howling", "Barrow", "Grim", "Pale", "Thorned"];
  const DUNGEON_NOUN = ["Crypt", "Hollow", "Deep", "Maw", "Vault", "Warrens", "Tomb", "Burrow", "Grotto", "Delve", "Sepulcher", "Lair"];
  // Hell delves never wear overworld names: their own weaver (ash, blood,
  // obsidian, bone, ruin — no moss, no grottos). Same seed scheme, so names
  // stay stable per delve; `hell` switches the pools only.
  const HELL_DUNGEON_ADJ = ["Ashen", "Charred", "Bloodied", "Obsidian", "Howling", "Sundered", "Cinder", "Gore", "Bone", "Sable", "Infernal", "Doom", "Crimson", "Wailing", "Riven", "Ember"];
  const HELL_DUNGEON_NOUN = ["Pit", "Furnace", "Chasm", "Crucible", "Kiln", "Abattoir", "Charnel", "Rift", "Gullet", "Pyre", "Foundry", "Maw"];
  function programmaticDungeonName(seed, hell) {
    try {
      const ADJ = hell ? HELL_DUNGEON_ADJ : DUNGEON_ADJ;
      const NOUN = hell ? HELL_DUNGEON_NOUN : DUNGEON_NOUN;
      let h = (seed | 0) >>> 0;
      const rnd = () => { h = (Math.imul(h ^ (h >>> 15), 1 | h) + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 7), 61 | h) ^ h; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      return `${ADJ[(rnd() * ADJ.length) | 0]} ${NOUN[(rnd() * NOUN.length) | 0]}`.slice(0, 40);
    } catch (e) { return hell ? "Ashen Pit" : "Sunken Crypt"; }
  }
  async function applyProgrammaticChunk(ch, slot, epoch) {
    try {
      if (dreamStale(slot, epoch)) return;
      // Collision re-roll via phonotactics (widens naturally via seed salt).
      if (ch.placeName && ch.biome !== "town" && placeNameTaken(ch.placeName, ch)) {
        for (let a = 1; a <= 4; a++) {
          const nm = dreamRegionNameSync(ch, a);
          if (nm && !placeNameTaken(nm, ch)) { ch.placeName = nm; break; }
        }
        if (placeNameTaken(ch.placeName, ch)) ch.placeName = uniquifyPlaceName(ch.placeName, ch);
        try { for (const poi of (ch.pois || [])) if (poi.type === "sign") poi.text = ch.placeName; } catch (e2) {}
      }
      if (ch.placeName && String(ch.placeName).trim().toLowerCase() === "emberhold") {
        try {
          const W = window.World;
          const h2 = W.hash2(ch.cx * 91 + 7, ch.cy * 57 + 3);
          ch.placeName = uniquifyPlaceName(themeName(ch.settlementType || "town", h2), ch);
        } catch (e) { try { ch.placeName = "Emberford"; } catch (e2) {} }
      }
      if (!ch.rumor) {
        try {
          if (window.LorePool) ch.rumor = window.LorePool.get("rumor", "Travelers avoid the north treeline.");
          else ch.rumor = "Travelers avoid the north treeline.";
          ch.rumor = String(ch.rumor).slice(0, 200);
        } catch (e) {}
      }
      if (ch.hasDungeon && !ch.dungeonNamed) {
        try {
          const seed = ((ch.cx * 918273) ^ (ch.cy * 127373)) | 0;
          // hell ground weaves hell names (never the overworld pool). This
          // path only ever names the chunk's plain `d_cx_cy` delve — the
          // god-delve (`_god`) and drowned (`_w`) mouths keep their own ids.
          const hell = ch.dim === "hell";
          ch.dungeonHint = programmaticDungeonName(seed, hell);
          ch.dungeonNamed = true;
          const W = window.World;
          try {
            const d = await W.getDungeon(`d_${ch.cx}_${ch.cy}`, ch.cx, ch.cy, 1, ch.dim || undefined);
            if (d && !d.enriched) {
              d.name = String(ch.dungeonHint).slice(0, 40);
              try {
                if (window.LorePool) d.lore = window.LorePool.get(hell ? "hell_dungeon" : "dungeon", hell ? "Ash drifts down like grey snow. The dark below is hungry." : "Cold air rises from below.");
                d.lore = String(d.lore || "").slice(0, 220);
              } catch (e2) {}
              d.namePool = hell ? "hell" : "surf";
              d.enriched = true;
              await W.saveDungeon(d, slot);
            }
          } catch (e2) {}
        } catch (e) {}
      }
      ch.enriched = true;
      bgStatus.done++; bgStatus.last = `chunk ${ch.cx},${ch.cy} ✓`;
    } catch (e) {}
  }
  async function ensureFallbackNpcs(ch, slot, epoch) {
    const W = window.World;
    // multiplayer thin client: joiners don't populate villagers locally —
    // every NPC they see comes from the host's snapshots.
    try { if (window.MP && window.MP.M && window.MP.M.active && window.MP.isHost && !window.MP.isHost()) return; } catch (e) { }
    const mySlot = /^[1-5]$/.test(String(slot)) ? String(slot) : dreamSlot();
    const myEpoch = (epoch == null ? dreamEpoch() : epoch);
    try { if (W.ensureMemLoaded) await W.ensureMemLoaded(); } catch (e) { }
    if (dreamStale(mySlot, myEpoch)) return;
    // v19: dimension-local chunk key — surf and hell share coordinates, so
    // the bare key would count the other world's villagers as existing
    // (and skip spawning this world's), doubling one side's NPCs.
    const chKey = W.chunkKey(ch.cx, ch.cy, ch.dim);
    const existing = [...W._mem.npcs.values()].filter(n => n.chunkKey === chKey);
    if (existing.length >= ch.npcSlots) return;
    const st = ch.settlementType || null;
    const roles = (st && THEME_ROLES[st]) || FALLBACK_ROLES;
    const firstPool = (st && THEME_NAMES[st]) || FALLBACK_FIRST;
    const lastPool = (st && THEME_LAST[st]) || FALLBACK_LAST;
    const spots = W.findWalkableSpots(ch, ch.npcSlots);
    // First names are what players notice ("another Greta?"), so keep them
    // unique inside one placeName too — not just the full "First Last".
    const scope = String(ch.placeName || "").toLowerCase();
    const takenFull = new Set();
    const takenFirst = new Set();
    try {
      for (const n of W._mem.npcs.values()) {
        if (String(n.placeName || "").toLowerCase() !== scope) continue;
        takenFull.add(String(n.name || "").toLowerCase());
        takenFirst.add(String(n.name || "").split(" ")[0].toLowerCase());
      }
    } catch (e) { }
    for (let i = existing.length; i < ch.npcSlots; i++) {
      // Procedural culture-aware names (seeded by chunk+slot, so stable):
      // re-roll with a salted seed until the first name + full name are both
      // unused in this place, then uniquify as a backstop. Near-infinite
      // space means repeats are gone, not suffixed.
      const seed0 = ((ch.cx * 73856093) ^ (ch.cy * 19349663) ^ (i * 83492791)) | 0;
      const h = W.hash2(ch.cx * 131 + i * 17, ch.cy * 71 + i * 29);
      let first = null, last = null;
      try {
        if (window.Names && window.Names.npc) {
          for (let a = 0; a < 40 && !first; a++) {
            const pair = window.Names.npc(st, (seed0 + a * 1013904223) | 0);
            if (!takenFirst.has(String(pair[0]).toLowerCase()) &&
                !takenFull.has(`${pair[0]} ${pair[1]}`.toLowerCase())) {
              first = pair[0]; last = pair[1];
            }
          }
        }
      } catch (e) { first = null; }
      if (!first && window.Names && window.Names.phoneticFirst) {
        // C/V phonotactic tier: near-infinite, always sensible (no pools).
        try {
          for (let a = 0; a < 40 && !first; a++) {
            const seed = (seed0 + a * 2246822519 + 0x5F3759DF) | 0;
            const f = window.Names.phoneticFirst(seed);
            const l = window.Names.phoneticLast(seed);
            if (!takenFirst.has(String(f).toLowerCase()) &&
                !takenFull.has(`${f} ${l}`.toLowerCase())) {
              first = f; last = l;
            }
          }
        } catch (e2) { first = null; }
      }
      if (!first) {
        // pool fallback (shouldn't happen): walk the pools for an unused name
        const baseF = (h * firstPool.length) | 0;
        const baseL = (W.hash2(ch.cy * 17 + i * 31, ch.cx * 71 + i * 13) * lastPool.length) | 0;
        first = firstPool[baseF] || "Traveler";
        for (let k = 0; k < firstPool.length; k++) {
          const cand = firstPool[(baseF + k) % firstPool.length];
          if (!takenFirst.has(String(cand).toLowerCase())) { first = cand; break; }
          if (k === firstPool.length - 1) first = cand;
        }
        last = lastPool[baseL] || "Ashford";
        for (let k = 0; k < lastPool.length; k++) {
          const cand = lastPool[(baseL + k) % lastPool.length];
          if (!takenFull.has(`${first} ${cand}`.toLowerCase())) { last = cand; break; }
          if (k === lastPool.length - 1) last = cand;
        }
      }
      const name = uniquifyNpcName(first + " " + last, ch.placeName);
      takenFull.add(name.toLowerCase());
      takenFirst.add(String(name).split(" ")[0].toLowerCase());
      let role = roles[(W.hash2(ch.cx + i, ch.cy - i) * roles.length) | 0];
      try {
        // Workplace gating: a gated role with no free workplace slot in this
        // settlement becomes unemployed/adventurer instead.
        if (window.Schedule) {
          const key = window.Schedule.settleKeyForChunk(ch) || window.Schedule.settleKeyForPos(ch.cx * 16 + 8, ch.cy * 16 + 8);
          role = window.Schedule.gateRole(key, role);
        }
      } catch (e) { }
      const spot = spots[i % spots.length] || { lx: 8, ly: 8 };
      const npc = makeNpcObject({
        id: `npc_${ch.cx}_${ch.cy}_${i}`, name, role, fallback: true,
        quirk: FALLBACK_QUIRKS[(h * FALLBACK_QUIRKS.length) | 0],
        gx: ch.cx * 16 + spot.lx, gy: ch.cy * 16 + spot.ly,
        chunkKey: chKey, placeName: ch.placeName, dist: W.distOrigin(ch.cx * 16, ch.cy * 16),
        dim: ch.dim,
      });
      // Pin the home slot: even if the player switches worlds a heartbeat
      // later, this villager saves into its own world, never the new one.
      try { npc._slot = mySlot; } catch (e) { }
      try { maybeMarkDoppelganger(npc); } catch (e) { }
      W._mem.npcs.set(npc.id, npc);
      try { await W.saveNpc(npc, mySlot); } catch (e) { }
      if (dreamStale(mySlot, myEpoch)) return;
    }
    // Balance beds + workplaces for the whole settlement (priority to gated
    // roles; overflow without a bed gets nightDuty). Persists via saveNpc.
    try {
      if (window.Schedule) {
        const key = window.Schedule.settleKeyForChunk(ch) || window.Schedule.settleKeyForPos(ch.cx * 16 + 8, ch.cy * 16 + 8);
        if (key) await window.Schedule.assignSettlement(key);
      }
    } catch (e) { }
  }

  // ---- NPC persona: unique temperament, interests & talking style ----
  // Deterministic per npc id (stable across loads), but seeded from so many
  // inputs — id, name, role, gear — that no two NPCs feel alike. Works fully
  // offline. The AI dreamer may still override with bespoke values; generated
  // bits only ever fill gaps. Anything here can also be totally made up: every
  // NPC gets one odd hobby and one odd speech habit no matter what.
  function pHash(s) {
    let h = 2166136261;
    s = String(s == null ? "x" : s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pRng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const PERSONA_TEMPERAMENTS = [
    "gruff but tender-hearted", "wry and dry", "nervous and fussy", "bombastic and loud",
    "laconic and watchful", "dreamy and vague", "sardonic and teasing", "earnest and literal-minded",
    "sly and bargaining", "boisterous and laughing", "melancholic and poetic", "prim and proper",
    "superstitious and jumpy", "curious and nosy", "stoic and blunt", "mischievous and prankish",
    "gentle and soft-spoken", "hot-headed and quick to boast", "patient and proverbial", "gloomy and dramatic",
    "cheerful and humming", "suspicious and squinting", "scholarly and distracted", "salty and sea-worn",
  ];
  const PERSONA_RHYTHMS = [
    "short clipped bursts", "long winding sentences", "questions stacked on questions",
    "half-finished thoughts that trail off", "a proverb in every other line", "bursts of three quick remarks",
    "slow deliberate pronouncements", "muttered asides under their breath", "lists — everything in threes",
    "dramatic pauses before the point",
  ];
  const PERSONA_ROLE_VOICE = {
    blacksmith: ["forge metaphors for everything, calls people 'lad'", "rates everything by how it would survive the quench"],
    runesmith: ["forge metaphors for everything, calls people 'lad'", "lowers their voice for rune-talk, as if the stone listens"],
    innkeeper: ["hearty welcomes, gossip about every guest", "refills your cup mid-sentence, remembers every order"],
    healer: ["gentle blessings tucked into advice", "scolds like a kind aunt about rest and soup"],
    priest: ["gentle blessings tucked into advice", "speaks of the light the way others speak of weather"],
    cleric: ["gentle blessings tucked into advice", "battle-calm, blesses before and after everything"],
    herbalist: ["names a plant for every feeling", "sniffs everything before trusting it"],
    merchant: ["works prices into every metaphor, calls everyone 'friend'", "haggles out of habit, even with themselves"],
    hunter: ["tracking metaphors, goes quiet mid-thought to listen", "judges people by their footprints"],
    scholar: ["quotes dead sages, footnotes their own sentences", "corrects themselves twice per sentence"],
    guard: ["formal address, reports like a watch-log", "stands at parade rest even in conversation"],
    samurai: ["formal address, reports like a watch-log", "one-strike maxims, bows mid-sentence"],
    warrior: ["formal address, reports like a watch-log", "war stories that start 'this one time'"],
    farmer: ["weather in every sentence, crop omens", "compares people to livestock, fondly"],
    bard: ["rhymes by accident, sings the punchlines", "narrates your life back at you in third person"],
    fisher: ["tide and knot slang, weather-eye squint", "every story is about the one that got away"],
    tidewarden: ["tide and knot slang, weather-eye squint", "lock mechanics for every problem, storm stories for the rest"],
    miner: ["stone and depth metaphors, taps walls while thinking", "prices silence by the foot, like a tunnel"],
    unemployed: ["between jobs, full of odd plans, asks about openings", "cheerful idleness, people-watching chronicles"],
    adventurer: ["road stories that start mid-action, scars as punctuation", "restless wander-talk, maps everything by taverns"],
    ninja: ["low even tones, always planning the exit", "answers questions with questions, then changes the subject"],
    thief: ["prices everything by how pocketable it is", "brags about the one that almost caught them"],
    monarch: ["royal 'we', decrees folded into small talk", "weighs every word like a seal on wax"],
    noble: ["old-name dropping, vintage years for everything", "compliments like favors, slights like debts"],
    knight: ["oaths and honor, calls you 'good traveler'", "war stories polished into parables"],
    chancellor: ["ledgers for metaphors, seals for emphasis", "corrects protocol gently, always"],
    highpriest: ["benedictions between sentences", "speaks of the light the way others speak of weather"],
    marshal: ["drill-ground cadence, counts off points", "stand-at-ease warmth under the bark"],
    guildmaster: ["contracts in every metaphor, calls everyone 'partner'", "haggles out of habit, even over tea"],
    magistrate: ["cites ordinances, then translates them kindly", "weighs both sides aloud"],
    harbormaster: ["tide tables for every plan, storm stories for the rest", "harbor gossip, ship by ship"],
    dockworker: ["rope-and-tar slang, laughs mid-sentence", "every story is about the load that shifted"],
    desert_nomad: ["wind and star talk, water priceless", "haggles kindly, walks away smiling"],
    steppe_rider: ["horse metaphors for everything", "judges people by how they ride"],
    mesa_shaman: ["spirits in the canyon echo, cornmeal blessings", "listens twice as long as they speak"],
    frost_skald: ["sagas for every occasion, kennings for breakfast", "rhymes by accident, boasts on purpose"],
  };
  const PERSONA_ROLE_INTERESTS = {
    blacksmith: ["quenching songs", "nail patterns", "apprentice gossip", "coal grades"],
    runesmith: ["rune etymology", "hammer-song harmonies", "forge-ghost stories", "quenching oils"],
    innkeeper: ["regulars' secrets", "stew recipes", "lost-and-found oddities", "darts wagers"],
    healer: ["poultices", "bedside superstitions", "questionable tonics", "garden remedies"],
    priest: ["bell-ringing technique", "candle omens", "hymn rivalries", "pilgrim gossip"],
    cleric: ["bell-ringing technique", "field surgery tales", "hymn rivalries", "dawn vigils"],
    herbalist: ["moon-harvests", "companion planting", "tea blends", "mushroom gossip"],
    merchant: ["coin tricks", "far-off markets", "caravan rumors", "weighing scales"],
    hunter: ["game trails", "fletching", "wind reading", "snare craft"],
    scholar: ["dead languages", "marginalia", "star charts", "ink recipes"],
    guard: ["dice games", "polishing kits", "watch rotations", "tavern brawls (as a spectator)"],
    samurai: ["duel etiquette", "blade oiling", "war stories", "tea ceremony"],
    warrior: ["duel etiquette", "scar comparisons", "war stories", "arm-wrestling"],
    farmer: ["rain signs", "prize pumpkins", "scarecrow fashion", "soil arguments"],
    bard: ["old ballads", "rude limericks", "instrument repair", "heckler comebacks"],
    fisher: ["knot-tying", "tide tables", "the one that got away", "gull rivalries"],
    tidewarden: ["lock mechanics", "storm stories", "eel migrations", "bridge-toll gossip"],
    miner: ["gem grading", "tunnel songs", "canary care", "deep dark tales"],
    unemployed: ["odd jobs", "daydream schemes", "gossip", "loafing spots"],
    adventurer: ["road rumors", "monster tales", "far-off dungeons", "campfire cooking"],
    ninja: ["rooftop routes", "smoke-powder recipes", "knife balance", "silent footsteps"],
    thief: ["unlocked windows", "loose purse strings", "fence prices", "getaway routes"],
    monarch: ["seal collecting", "audience etiquette", "dynasty gossip", "crown jewels"],
    noble: ["vintages", "hunt meets", "bloodlines", "estate gardens"],
    knight: ["tourney lists", "oath keeping", "blade oiling", "squiredom tales"],
    chancellor: ["seals and writs", "tax ledgers", "court gossip", "ink recipes"],
    highpriest: ["bell-ringing technique", "candle omens", "hymn rivalries", "relic care"],
    marshal: ["drill songs", "watch rotations", "siege lore", "polishing kits"],
    guildmaster: ["charter law", "caravan rumors", "weighing scales", "apprentice gossip"],
    magistrate: ["statute books", "court procedure", "impartial teas", "precedent tales"],
    harbormaster: ["tide tables", "ship manifests", "harbor dues", "storm stories"],
    dockworker: ["knot-tying", "cargo chanteys", "dice games", "gull rivalries"],
    desert_nomad: ["star paths", "water finding", "camel care", "sand songs"],
    steppe_rider: ["horse lines", "felt making", "sky worship", "mare's milk"],
    mesa_shaman: ["kachina tales", "corn dances", "turquoise grading", "canyon echoes"],
    frost_skald: ["sagas", "rune songs", "mead brewing", "aurora watching"],
  };
  const PERSONA_DEFAULT_INTERESTS = ["pigeon racing", "cloud shapes", "lucky stones", "neighbor gossip"];
  const PERSONA_DEFAULT_VOICE = ["plain talk with one odd flourish", "says exactly what they mean, then winks"];
  // One odd hobby, always — this is the "totally made up" slot.
  const PERSONA_WILD = [
    "competitive cloud-watching", "extreme mushroom spotting", "beetle racing", "naming every crow in town",
    "collecting dented spoons", "yodeling at wells", "counting fence posts", "competitive napping",
    "pickling everything", "arguing with seagulls", "moss gardening", "puddle philosophy",
    "synchronized sighing", "left-handed whittling", "dramatic readings of tax ledgers", "snail sheltering",
    "fog collecting (in jars)", "echo hunting in alleys", "talking to statues", "dandelion clocks",
    "shadow-puppet epics", "toy-boat regattas in rain barrels", "worm charming", "pebble balancing",
    "moon howling (ironically)", "dust-mote taxonomy", "hat-tipping records", "apologizing to doors walked into",
  ];
  const PERSONA_MARKERS = ["Hm.", "Ah,", "Look,", "Well now,", "Eh?", "Say —", "Listen,", "Oho,", "Aye,", "Bah,", "Hush —", "Right then,"];
  const PERSONA_ROLE_GREET = {
    blacksmith: ["Mind the sparks — grab a stool.", "Come to talk iron, or just warm your hands?"],
    runesmith: ["Mind the sparks — the runes are listening.", "Speak low. The stone remembers."],
    innkeeper: ["Sit, sit! You look half-starved.", "Welcome in! Boots off by the hearth."],
    healer: ["Oh dear, you look peaky. Sit down.", "Come in out of the wind — let me look at you."],
    priest: ["The light keep you — what troubles you?", "Blessings. Come, sit a while."],
    cleric: ["The light keep you — what troubles you?", "Patched and prayed for — which do you need?"],
    herbalist: ["Wipe your feet — mind the drying racks.", "Ooh, a visitor! Tea's already on."],
    merchant: ["Ah, a customer with excellent taste!", "Come, look — everything's priced to move."],
    hunter: ["Quiet on the step. Sit.", "Wind's wrong for talk, but sit anyway."],
    scholar: ["One moment — ...yes? The books can wait.", "You interrupt footnote twelve. Proceed."],
    guard: ["State your business — then we'll talk.", "All quiet on my stretch. Pull up a crate."],
    samurai: ["State your business — then we'll talk.", "The gate holds. So may this conversation."],
    warrior: ["Ha! A fighter's walk. Sit.", "Scars first, names after. Go on."],
    farmer: ["Shut that gate behind you, eh?", "Rain's coming. Sit a spell."],
    bard: ["A new face! The song provides!", "Sit! You're just in time for the good verse."],
    fisher: ["Tide's out — I've a minute.", "Sit on that net. Mind the hooks."],
    tidewarden: ["Tide's out — I've a minute.", "Locks are holding. Sit, catch the mist."],
    miner: ["Helm off, sit. Mind the dust.", "Shift's done. Talk while the lamps last."],
    unemployed: ["Got a moment? Nobody's hiring me for one.", "Between jobs — got any work, or just talk?"],
    adventurer: ["Road's long — sit, trade tales?", "Another town, another rumor. What's yours?"],
    ninja: ["You didn't see me. We never met. ...Sit.", "Mind the shadows — I live in them. Talk."],
    thief: ["Didn't take anything. Yet. Talk.", "Shh — business or pleasure? Make it quick."],
    monarch: ["Approach. We grant you a moment.", "Speak, traveler — the crown listens."],
    noble: ["Ah, company with decent boots. Sit.", "Do sit — the help will bring wine."],
    knight: ["Well met, traveler. Sit a spell.", "The watch holds. So may this talk."],
    chancellor: ["One moment — the seal must dry... yes?", "State the matter plainly; I will minute it."],
    highpriest: ["The light keep you — what troubles you?", "Come, kneel or sit — both count as prayer."],
    marshal: ["Report, then rest. Go on.", "All quiet on my wall. Pull up a crate."],
    guildmaster: ["Ah, a partner with excellent timing!", "Sit — everything here is priced to move."],
    magistrate: ["State your case — then we shall weigh it.", "Order, order... now talk."],
    harbormaster: ["Tide's turning — I've a minute.", "Manifests can wait. Talk."],
    dockworker: ["Shift's half done. Sit on that crate.", "Mind the gulls — they steal lunch. Talk."],
    desert_nomad: ["Water and shade — sit, friend.", "The wind brought you. Good. Talk."],
    steppe_rider: ["Dismount, rest the horse. Sit.", "Wind's fair. Talk while the mares graze."],
    mesa_shaman: ["The canyon hears you. Sit.", "Smoke rises straight today. Good omen. Talk."],
    frost_skald: ["Come in from the snow — sit!", "Ale's warm, saga's warmer. Talk."],
  };
  const PERSONA_DEFAULT_GREET = ["Traveler! Mind the roads past dark.", "Well met — rest your feet a moment."];
  // stock item -> hobby nudge (their goods shape what they care about)
  const PERSONA_STOCK_NUDGE = [
    [/sage_herb|cinder_herb|calm_herb|bright_herb|herb/, "wild teas"],
    [/potion|mana_potion/, "home remedies"],
    [/antidote|burn_salve|warm_brew|focus_tea|clear_drops|panacea/, "cure-all claims"],
    [/arrow_/, "fletching"],
    [/bow/, "bow-making"],
    [/tome_/, "marginalia in spellbooks"],
    [/bomb/, "controlled demolitions (emphasis on controlled)"],
    [/wood/, "whittling"],
    [/stone/, "dry-stone walls"],
    [/sword|dagger|axe|staff|armor|robe|ring|amulet|charm/, "gear polishing"],
  ];
  function itemLabel(id) {
    try {
      const it = window.Items && window.Items.ITEMS[id];
      if (it) return (it.name || id);
    } catch (e) { }
    return String(id).replace(/^tome_/, "Tome: ").replace(/_/g, " ");
  }
  // Best weapon across worn gear (party members) and shop stock (townsfolk).
  function mainWeaponOf(npc) {
    try {
      const eq = npc && npc.equipment && npc.equipment.weapon;
      if (eq && window.Items && window.Items.ITEMS[eq]) {
        const it = window.Items.ITEMS[eq];
        return { id: eq, name: it.name || eq, icon: "" };
      }
    } catch (e) { }
    try {
      let best = null, bestPow = 0;
      for (const s of (npc.stock || [])) {
        let it = null;
        try { it = window.Items.ITEMS[s.id]; } catch (e2) { }
        if (!it || it.type !== "equipment" || it.slot !== "weapon" || !it.bonus) continue;
        const pow = Math.max(it.bonus.atk || 0, it.bonus.matk || 0);
        if (pow > bestPow) { bestPow = pow; best = { id: s.id, name: it.name, icon: "" }; }
      }
      if (best && bestPow >= 1) return best;
    } catch (e) { }
    return null;
  }
  function packNote(npc) {
    try {
      const seen = [];
      const sweep = (arr) => { for (const s of (arr || [])) if (s && s.id && (s.n | 0) > 0) seen.push(s); };
      sweep(npc.stock); sweep(npc.inventory);
      seen.sort((a, b) => (b.n | 0) - (a.n | 0));
      const bits = [];
      for (const s of seen) {
        if (/^(wood|stone|herb|potion)$/.test(s.id) && bits.length) continue; // basics only if nothing else
        bits.push(`${s.n}× ${itemLabel(s.id)}`);
        if (bits.length >= 2) break;
      }
      return bits.join(", ");
    } catch (e) { return ""; }
  }
  function normInterests(v) {
    try {
      const raw = Array.isArray(v) ? v : String(v == null ? "" : v).split(/[,;]+/);
      const out = [];
      for (const s of raw) {
        const t = String(s).trim().slice(0, 40);
        if (t && !out.includes(t)) out.push(t);
        if (out.length >= 3) break;
      }
      return out;
    } catch (e) { return []; }
  }
  // Full persona, deterministic for a given npc (id + name + role seed it all).
  function genPersona(npc) {
    const role = (npc && npc.role) || "villager";
    const name = (npc && npc.name) || "Traveler";
    const R = pRng(pHash(`${npc ? npc.id : "x"}|${name}|${role}`));
    const pick = (arr) => arr[(R() * arr.length) | 0];
    const temperament = pick(PERSONA_TEMPERAMENTS);
    const rhythm = pick(PERSONA_RHYTHMS);
    const voices = PERSONA_ROLE_VOICE[role] || PERSONA_DEFAULT_VOICE;
    let speech = `${rhythm}; ${pick(voices)}`;
    // name shapes the cadence: hissy names lilt, hammer-consonant names pound.
    const letters = (name.replace(/[^a-z]/gi, "") || "x").toLowerCase();
    const vowels = (letters.match(/[aeiou]/g) || []).length;
    speech += vowels >= letters.length - vowels ? ", lilting singsong flow" : ", blunt hammer-fall words";
    // their main weapon shapes how they boast.
    let w = null;
    try { w = mainWeaponOf(npc); } catch (e) { }
    if (w) {
      const id = w.id || "";
      const flavor = /bow|arrow/.test(id) ? "every problem needs a drawn bead"
        : /staff|tome|amulet|robe|wand|mana/.test(id) ? "reads meanings in smoke and sparks"
        : /sword|dagger|axe|blade|knife|sword/.test(id) ? "duelist's honor, boasts about scars"
        : `swears by their ${w.name}`;
      speech += `; ${flavor}`;
    }
    // interests: goods nudge (up to 1) + role flavor + always one odd hobby.
    const have = [];
    try {
      const ids = [];
      for (const s of (npc.stock || [])) ids.push(s.id);
      for (const s of (npc.inventory || [])) ids.push(s.id);
      for (const [re, hobby] of PERSONA_STOCK_NUDGE) {
        if (ids.some((id) => re.test(id)) && !have.includes(hobby)) { have.push(hobby); break; }
      }
    } catch (e) { }
    const rolePool = [...(PERSONA_ROLE_INTERESTS[role] || PERSONA_DEFAULT_INTERESTS)];
    while (have.length < 2 && rolePool.length) {
      const h = rolePool.splice((R() * rolePool.length) | 0, 1)[0];
      if (!have.includes(h)) have.push(h);
    }
    have.push(pick(PERSONA_WILD));
    const interests = have.slice(0, 3);
    const markerPool = pHash("marker|" + name) % 3 === 0
      ? PERSONA_MARKERS.filter((m) => /[hm]/i.test(m[0])) : PERSONA_MARKERS;
    const marker = markerPool[(pHash(name) % markerPool.length + markerPool.length) % markerPool.length] || "Well now,";
    const greets = PERSONA_ROLE_GREET[role] || PERSONA_DEFAULT_GREET;
    const greeting = `${marker} ${pick(greets)}`;
    return { temperament, speech: speech.slice(0, 140), interests, marker, greeting: greeting.slice(0, 140) };
  }
  function ensurePersona(npc) {
    if (!npc || npc.role === "mob") return npc;
    try { if (window.Trade) window.Trade.ensure(npc); } catch (e) { }
    let g = null;
    const need = (typeof npc.personality !== "string" || !npc.personality.trim() || npc.personality === "kind and practical")
      || (typeof npc.speech !== "string" || !npc.speech.trim())
      || (!Array.isArray(npc.interests) || !npc.interests.length)
      || (typeof npc.marker !== "string" || !npc.marker)
      || (typeof npc.greeting !== "string" || !npc.greeting.trim() || npc.greeting === "Traveler! Mind the roads past dark.")
      || !npc.quirk;
    if (!need) return npc;
    try { g = genPersona(npc); } catch (e) { return npc; }
    if (typeof npc.personality !== "string" || !npc.personality.trim() || npc.personality === "kind and practical") npc.personality = g.temperament;
    if (typeof npc.speech !== "string" || !npc.speech.trim()) npc.speech = g.speech;
    if (!Array.isArray(npc.interests) || !npc.interests.length) npc.interests = g.interests;
    else npc.interests = normInterests(npc.interests);
    if (typeof npc.marker !== "string" || !npc.marker) npc.marker = g.marker;
    if (typeof npc.greeting !== "string" || !npc.greeting.trim() || npc.greeting === "Traveler! Mind the roads past dark.") npc.greeting = g.greeting;
    if (!npc.quirk) npc.quirk = FALLBACK_QUIRKS[pHash(npc.id + ":q") % FALLBACK_QUIRKS.length] || "";
    return npc;
  }
  // One-line display version for chat + party panels.
  function personaLine(npc) {
    try {
      ensurePersona(npc);
      const ints = (npc.interests || []).slice(0, 3).join(" · ") || "gossip";
      return `${npc.personality} · talks: ${npc.speech} · into: ${ints}`;
    } catch (e) { return ""; }
  }

  // ---- NPC object ----
  const ROLE_TINT = { blacksmith: "#8a5a33", innkeeper: "#c96b4a", healer: "#5dd68a", cleric: "#7fd4ff", herbalist: "#5dd68a", merchant: "#ffd93d", hunter: "#3fa34d", scholar: "#9a7bff", guard: "#8a9aaa", farmer: "#d9a06b", bard: "#ff6b9d", fisher: "#59d6d6", warrior: "#ff6b6b", mage: "#9a7bff", rogue: "#666688", villager: "#4da3ff", samurai: "#c23b4e", priest: "#f2e7c9", runesmith: "#ff9d2e", tidewarden: "#59d6d6", miner: "#9a8a6a", unemployed: "#9a9a9a", adventurer: "#5dd68a", ninja: "#3a3a5e", thief: "#9a7a3a", monarch: "#ffd93d", noble: "#c9a0ff", knight: "#b9c2cc", chancellor: "#8a9aaa", highpriest: "#fff2b0", marshal: "#c23b4e", guildmaster: "#ffcf4d", magistrate: "#9adcff", harbormaster: "#4db8ff", dockworker: "#8a6a4a", desert_nomad: "#e0a050", steppe_rider: "#9ac06a", mesa_shaman: "#c96b4a", frost_skald: "#bfe9ff", civilized_succubus: "#ff6ab0", civilized_infernal: "#ff5a1a", civilized_hellbeast: "#8a1a1a", civilized_doom: "#3a0a0a", hell_priest: "#c9a0ff", hell_merchant: "#ffd93d", hell_guard: "#ff3a00", dawn_angel: "#ffe9a0", choir_angel: "#fffdf6", seraph_guard: "#f6d34e", scroll_angel: "#7ac8ff", angel_guard: "#fff2c0", angel_merchant: "#ffd93d", angel_priest: "#fff8dc", heavendweller: "#cfe8ff" };
  // ---- NPC gender from names ----
  // Title words decide outright (kings male, queens/matriarchs female, ...);
  // recognizable first names map via curated sets; anything else rolls
  // male/female from a name hash so the same name always reads the same.
  const MALE_FIRST = ["Bram", "Doran", "Finn", "Halden", "Joren", "Merrick", "Osric", "Tam", "Alban", "Corvin", "Edric", "Garrick", "Ivor", "Kellan", "Odo", "Sten", "Ulric", "Ansel", "Dunstan", "Fenwick", "Perrin", "Tobias", "Noll", "Dorn", "Fenn", "Hob", "Lorn", "Haruto", "Kenji", "Daiki", "Sho", "Kaito", "Sosuke", "Bromm", "Thrain", "Durin", "Bofur", "Rurik", "Snorri", "Baldin", "Eitri", "Hodr", "Magni", "Samir", "Qasim", "Aziz", "Farid", "Hakim", "Malik", "Rashid", "Omar", "Batu", "Mergen", "Temur", "Torvald", "Ulf", "Eirik", "Frode", "Aldric", "Reginald", "Cassius", "Percival", "Khan"];
  const FEMALE_FIRST = ["Asha", "Celia", "Elowen", "Greta", "Isolde", "Kaia", "Liora", "Nyra", "Petra", "Sella", "Wren", "Beatrix", "Delia", "Faye", "Hester", "Jessamine", "Maren", "Nessa", "Pella", "Rosalind", "Tilda", "Brynn", "Cora", "Elga", "Gisela", "Ines", "Kess", "Lark", "Mabel", "Odette", "Sabine", "Una", "Ash", "Cessa", "Essa", "Ilsa", "Kessa", "Aiko", "Hana", "Momo", "Hina", "Emi", "Mei", "Yuna", "Sakura", "Dagna", "Helga", "Sigrun", "Hilda", "Gretta", "Fulla", "Grimhild", "Ragnhild", "Zara", "Noura", "Safa", "Jasmin", "Soraya", "Amira", "Leila", "Zahra", "Tuya", "Bolormaa", "Saran", "Oyuun", "Aska", "Birgit", "Skadi", "Sigrid", "Hafdis", "Inga", "Ylva", "Seraphina", "Octavia", "Rowena", "Nixie", "Marina", "Coral", "Mira", "Nerissa"];
  const MALE_TITLE = ["king", "lord", "jarl", "raja", "maharaja", "emperor", "daimyo", "warlord", "alpha", "captain", "father", "master", "sir", "mister", "brother", "husband", "groom", "duke", "baron", "khan", "chief", "patriarch", "pharaoh", "sultan"];
  const FEMALE_TITLE = ["queen", "matriarch", "empress", "matron", "mistress", "madam", "madame", "lady", "dame", "mother", "bride", "maiden", "witch", "widow", "sister", "wife", "lass", "mermaid", "princess", "duchess", "baroness", "priestess", "huntress", "sorceress", "enchantress", "baba", "onna", "yaga", "harpy", "rusalka", "siren", "banshee", "valkyrie", "hulder", "gorgon", "medusa"];
  function guessGenderFromName(name) {
    try {
      const raw = String(name || "");
      const toks = raw.toLowerCase().split(/[^a-z]+/).filter(Boolean);
      for (const t of toks) if (MALE_TITLE.indexOf(t) >= 0) return "male";
      for (const t of toks) if (FEMALE_TITLE.indexOf(t) >= 0) return "female";
      const first = (raw.trim().split(/\s+/)[0] || "").replace(/[^A-Za-z]/g, "");
      if (first) {
        const fl = first.toLowerCase();
        for (const m of MALE_FIRST) if (m.toLowerCase() === fl) return "male";
        for (const f of FEMALE_FIRST) if (f.toLowerCase() === fl) return "female";
      }
      let h = 2166136261;
      for (let i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 16777619); }
      return ((h >>> 0) % 2 === 0) ? "male" : "female";
    } catch (e) { return "male"; }
  }
 function makeNpcObject(o) {
    o = (o && typeof o === "object") ? o : {};
    // Defensive defaults: legacy/quest/MP callers occasionally omit id/role/pos
    // (King/slave vendors pass x/y/home; old saves omit chunkKey/placeName).
    // Mint them here so no path can produce an id-less, role-less record —
    // those used to surface as a nameless "Villager" (1 HP, undefined class)
    // with broken stats that could never be repaired.
    try {
      if (typeof o.role !== "string" || !o.role.trim() || o.role === "undefined" || o.role === "mob") o.role = "villager";
      else o.role = o.role.trim().slice(0, 32);
    } catch (e) { o.role = "villager"; }
    try {
      if (typeof o.id !== "string" || !o.id.trim() || o.id === "undefined") {
        try { o.id = "npc_" + Math.random().toString(36).slice(2, 10); } catch (e2) { o.id = "npc_" + Date.now().toString(36); }
      }
    } catch (e) { try { o.id = "npc_" + Date.now().toString(36); } catch (e2) {} }
    // pos aliases: accept x/y/home (vendor shape) as gx/gy/homeGx/homeGy.
    try {
      if (!Number.isFinite(+o.gx) && Number.isFinite(+o.x)) o.gx = +o.x;
      if (!Number.isFinite(+o.gy) && Number.isFinite(+o.y)) o.gy = +o.y;
      if (!Number.isFinite(+o.gx)) o.gx = 0;
      if (!Number.isFinite(+o.gy)) o.gy = 0;
      if (o.homeGx == null && o.home && Number.isFinite(+o.home.x)) o.homeGx = +o.home.x;
      if (o.homeGy == null && o.home && Number.isFinite(+o.home.y)) o.homeGy = +o.home.y;
    } catch (e) { try { if (!Number.isFinite(+o.gx)) o.gx = 0; if (!Number.isFinite(+o.gy)) o.gy = 0; } catch (e2) {} }
    let explicitLv = null;
    try {
      const _lv = +o.lv;
      if (Number.isFinite(_lv) && _lv >= 1) explicitLv = Math.min(100, Math.round(_lv));
    } catch (e) {}
    let dist = 0;
    try {
      if (Number.isFinite(+o.dist)) dist = +o.dist;
      else dist = Math.hypot(+o.gx || 0, +o.gy || 0);
    } catch (e) { dist = 0; }
    try {
      if (typeof o.chunkKey !== "string" || !o.chunkKey) {
        try {
          if (window.World && window.World.chunkKey) o.chunkKey = window.World.chunkKey(Math.floor(o.gx / 16), Math.floor(o.gy / 16), o.dim);
          else o.chunkKey = null;
        } catch (e2) { o.chunkKey = null; }
      }
    } catch (e) {}
    try {
      if (typeof o.placeName !== "string" || !o.placeName.trim()) o.placeName = "Wilds";
      else o.placeName = o.placeName.trim().slice(0, 32);
    } catch (e) { o.placeName = "Wilds"; }
    // townsfolk follow the town-country bell (~3 near towns); frontier
    // levels rise with the land itself. Level cap 100 for every NPC.
    // Explicit lv (slaves, Kings, delvers) wins; otherwise the land decides.
    let lv = 1;
    try {
      if (explicitLv != null) lv = explicitLv;
      else if (window.Game && window.Game.overworldLevelFor) lv = window.Game.overworldLevelFor(o.gx, o.gy);
      else lv = dist < 30 ? 1 : Math.max(1, Math.round(1 + dist / 45 + Math.random() * 1.5));
    } catch (e) { lv = explicitLv != null ? explicitLv : (dist < 30 ? 1 : 2); }
    lv = Math.max(1, Math.min(100, Math.round(lv) || 1));
    // angels are high-level civilized NPCs (like civilized demons run hot in
    // hell): role floors hold even near the pantheon heart.
    try {
      const AF = { seraph_guard: 55, angel_priest: 50, dawn_angel: 48, choir_angel: 45, scroll_angel: 45, angel_guard: 42, angel_merchant: 40 };
      const fl = AF[o.role];
      if (fl && lv < fl) lv = Math.min(100, fl + ((Math.random() * 8) | 0));
    } catch (e) {}
    const st = window.Entities.makeNpcStatBlock(lv, o.role, dist);
    const kit = window.CFG.ROLE_KIT[o.role] || window.CFG.ROLE_KIT.villager;
    // v18 dimension stamp: villagers belong to the world they were born in.
    let ndim = "surf";
    try {
      if (o.dim === "hell" || o.dim === "heaven" || o.dim === "surf") ndim = o.dim;
      else if (window.World && window.World.getDim) ndim = window.World.getDim();
    } catch (e) {}
    // v19: hell-born residents run tougher than surface townsfolk (same
    // level bell, demonic body: +60% HP, +50% MP, +35% ATK/MATK, +30% DEF,
    // +0.3 SPD). Flagged so old saves backfill once in refreshNpcCache.
    let heavBorn = (ndim === "heaven");
    let hellBorn = (ndim === "hell");
    if (heavBorn) {
      try {
        const hb2 = (v, m) => Math.max(1, Math.round(v * m));
        st.maxHp = hb2(st.maxHp, 1.8); st.maxMp = hb2(st.maxMp, 1.7);
        st.atk = hb2(st.atk, 1.5); st.matk = hb2(st.matk, 1.5);
        st.def = hb2(st.def, 1.4);
        st.spd = +(((+st.spd) || 0) + 0.4).toFixed(2);
      } catch (e) { }
    }
    if (hellBorn) {
      try {
        const hb = (v, m) => Math.max(1, Math.round(v * m));
        st.maxHp = hb(st.maxHp, 1.6); st.maxMp = hb(st.maxMp, 1.5);
        st.atk = hb(st.atk, 1.35); st.matk = hb(st.matk, 1.35);
        st.def = hb(st.def, 1.3);
        st.spd = +(((+st.spd) || 0) + 0.3).toFixed(2);
      } catch (e) { }
    }
    // never mint a nameless villager: quest/MP/legacy callers occasionally
    // omit name, which used to surface as "undefined" on the nametag.
    function _nm() {
      try {
        if (typeof o.name === "string" && o.name.trim() && o.name !== "undefined") return o.name;
        try {
          if (window.Names && window.Names.npc) {
            const pr = window.Names.npc(null, (Math.random() * 1e9) | 0);
            if (pr && pr[0]) return pr[1] ? (pr[0] + " " + pr[1]) : String(pr[0]);
          }
        } catch (eNm) {}
        const rl = String(o.role || "villager").replace(/_/g, " ").trim() || "villager";
        return rl.replace(/\b[a-z]/g, c => c.toUpperCase());
      } catch (e) { return "Villager"; }
    }
    const _mintName = _nm();
    const npc = {
      id: o.id, name: _mintName, role: o.role, tint: ROLE_TINT[o.role] || "#4da3ff",
      personality: o.personality, quirk: o.quirk || "", greeting: o.greeting || "",
      speech: o.speech || "", interests: normInterests(o.interests), marker: o.marker || "",
      gx: o.gx, gy: o.gy, homeGx: o.gx, homeGy: o.gy, chunkKey: o.chunkKey, placeName: o.placeName,
      dim: ndim,
      hellTough: hellBorn,
      heavTough: heavBorn,
      ...st, hp: st.maxHp, mp: st.maxMp,
      // full role kit so townsfolk can actually fight back with spells + guards get whirlwind
      abilities: [...kit], cooldowns: {}, buffs: {}, slowUntil: 0, burnUntil: 0, burnTick: 0, status: {}, aidCd: 0,
      faceAng: Math.random() * Math.PI * 2, atkCd: 0, targetId: null, targetRef: null, hostileUntil: 0, deadUntil: null,
      loyalty: 10 + ((Math.random() * 15) | 0),
      recruitable: !["merchant", "monarch", "chancellor", "highpriest", "magistrate", "harbormaster", "guildmaster", "marshal"].includes(o.role) || Math.random() > 0.4,
      inParty: false, fallback: o.fallback === true || (!o.personality || o.personality === "kind and practical"),
      // sex from the name (kings male, queens female, ...); explicit o.gender wins
      gender: o.gender || guessGenderFromName(_mintName),
      lastSeen: Date.now(),
    };
    // Home-slot stamp (overridden with the dream's slot by callers): keeps
    // later saves routed to this villager's own world.
    try { npc._slot = o._slot || window.World.getSlot(); } catch (e) { }
    try { if (window.Schedule) window.Schedule.ensureNpc(npc); } catch (e) { }
    try {
      // settleKey from birth position (spawn vs settlement); work/home are
      // assigned by Schedule.assignSettlement after each spawn batch.
      if (window.Schedule && (npc.settleKey == null)) {
        try { npc.settleKey = window.Schedule.settleKeyForNpc(npc); } catch (e2) { }
      }
    } catch (e) { }
    try { if (window.Trade) window.Trade.ensure(npc); } catch (e) { }
    // varied faces — and varied folk: the outfit stays the role (identity),
    // everything else rolls. Replicas adopt the host's look when it rides
    // along (see syncSharedToGame). o.race pins a race; otherwise the
    // weighted village mix rolls (mostly human, beastfolk among them).
    try {
      if (window.Appearance) {
        const A = window.Appearance;
        let rc = null;
        if (typeof o.race === "string" && A.RACES.includes(o.race)) rc = o.race;
        else if (o.appearance && typeof o.appearance === "object") {
          const s = A.sanitize(o.appearance, o.role);
          if (s.race && s.race !== "human") rc = s.race;
        }
        if (o.appearance && typeof o.appearance === "object") npc.appearance = A.sanitize(o.appearance, o.role);
        else if (o.app && typeof o.app === "object") npc.appearance = A.sanitize(o.app, o.role);
        else npc.appearance = A.randomForRole(o.role, rc || A.rollRace(), npc.gender);
        try { npc.race = npc.appearance.race || "human"; } catch (e2) { npc.race = "human"; }
      }
    } catch (e) { }
    try { if (window.Items && window.Items.ensureNpcLoadout) window.Items.ensureNpcLoadout(npc); } catch (e) { }
    try { ensurePersona(npc); } catch (e) { }
    // personal mount roll (guards patrol mounted, hunters ride out, ...).
    // Deterministic per id — the same villager keeps the same beast.
    try { if (window.Entities && window.Entities.ensureNpcMount) window.Entities.ensureNpcMount(npc); } catch (e) { }
    try {
      const io = (npc.interests || []).slice(0, 2).join(" and ");
      const hellNote = hellBorn ? " Non-demons are seldom seen here." : "";
      npc.memories = { summary: `I live in ${o.placeName}.${hellNote}${npc.quirk ? " Quirk: " + npc.quirk + "." : ""}${io ? " Off duty I love " + io + "." : ""}`, tail: [`${npc.name}: "${npc.greeting || "Hello."}"`] };
    } catch (e) {
      npc.memories = { summary: `I live in ${o.placeName}.`, tail: [`${npc.name}: "${npc.greeting || "Hello."}"`] };
    }
    return npc;
  }

  // ---- dungeon enrichment ----
  async function enrichDungeon(id, slot, epoch, dim) {
    // Programmatic: name/lore immediately, no network.
    try {
      const W = window.World;
      const mySlot = /^[1-5]$/.test(String(slot)) ? String(slot) : dreamSlot();
      let d = null;
      try { d = await W.getDungeon(id, undefined, undefined, undefined, (dim === "hell" || dim === "heaven" || dim === "surf") ? dim : undefined); } catch (e) { return; }
      if (!d || d.enriched) return;
      try { if (window.MP && window.MP.M && window.MP.M.active && window.MP.isHost && !window.MP.isHost()) { d.enriched = true; return; } } catch (e) {}
      // the god-delve and drowned mouths keep their fixed bake names.
      try { if (/(_god|_w)(_L\d+)?$/.test(String(d.baseId || id))) { d.enriched = true; try { await W.saveDungeon(d, mySlot); } catch (e2) {} return; } } catch (e) {}
      const hellD = (d.dim || dim) === "hell";
      const seed = (parseInt(String(id).replace(/\D/g, "") || "7", 10) | 0) ^ ((d.cx | 0) * 918273) ^ ((d.cy | 0) * 127373);
      d.name = programmaticDungeonName(seed, hellD).slice(0, 40);
      try {
        if (window.LorePool) d.lore = String(window.LorePool.get(hellD ? "hell_dungeon" : "dungeon", hellD ? "Ash drifts down like grey snow. The dark below is hungry." : "Cold air rises from below.")).slice(0, 220);
        else d.lore = hellD ? "Ash drifts down like grey snow. The dark below is hungry." : "Cold air rises from below.";
      } catch (e) { d.lore = hellD ? "Ash drifts down like grey snow. The dark below is hungry." : "Cold air rises from below."; }
      d.namePool = hellD ? "hell" : "surf";
      d.enriched = true;
      try { await W.saveDungeon(d, mySlot); } catch (e) {}
      bgStatus.done++;
    } catch (e) {}
  }
  // Background half (removed): nothing is marked enriched on
  // failure — the pump requeues bounded times, then the "Sunken Crypt"
  // fallback name simply stands (and a later visit can dream again).

  // ---- NPC chat ----
  // Two-memory model (cf. aytk0olqqc's HBMA memory block: stable persona first
  // for prefix-cache, then per-turn recall + task last):
  //   1) GAME MEMORY — authoritative, computed LIVE from game state every reply.
  //      Never stored on the NPC, never written by the AI. Party roster, combat,
  //      HP, location. Overrides conversation memory on conflict.
  //   2) CONVERSATION MEMORY — npc.memories.summary + tail (talks + trade ledger).
  // Both are fed on EVERY reply, memories-first, so party members stop forgetting
  // they travel with you.
  function lookupNpc(id) {
    try {
      if (!id) return null;
      if (window.Game && window.Game.G) {
        if (window.Game.G.player && (id === "player" || id === window.Game.G.player.id)) return window.Game.G.player;
        const inCache = (window.Game.G.npcs || []).find(n => n.id === id);
        if (inCache) return inCache;
        const inMobs = (window.Game.G.mobs || []).find(m => m.id === id);
        if (inMobs) return inMobs;
      }
      try { if (window.World && window.World._mem.npcs.get(id)) return window.World._mem.npcs.get(id); } catch (e) { }
    } catch (e) { }
    return null;
  }
  function buildGameMemory(npc, player) {
    // GAME-ONLY writable: derived from live objects, never from npc.memories.
    const L = [];
    try {
      const inParty = !!npc.inParty;
      const npcHp = npc.hp > 0 ? `${Math.ceil(npc.hp)}/${npc.maxHp}` : "DOWN (awaiting revive)";
      let gTag = "";
      try { const E = window.Entities; const _g = E.ensureGender ? E.ensureGender(npc) : (npc.gender || ""); const _l = E.genderLabel ? E.genderLabel(_g) : ""; if (_l && _l !== "Unknown") gTag = _l + " "; } catch (x) {}
      L.push(`- You are ${npc.name} (${gTag}${npc.role} lv${npc.lv}, HP ${npcHp}, loyalty ${npc.loyalty | 0}/1000).`);
      if (inParty) L.push(`- You ARE traveling in ${player.name}'s party. Never claim otherwise, never ask to join, never act like a stranger.`);
      else L.push(`- You are NOT in ${player.name}'s party.`);
      // v19: hell residents know what they are — and what the hero isn't.
      // (Hero races are never demons, so this needs no condition.)
      try {
        const _hd = (npc.dim === "hell") || (String(npc.chunkKey || "").indexOf("h_") === 0);
        if (_hd) {
          L.push(`- You are a DEMON of Hell, living among your own kind. Non-demon races are a rare sight here — strangers get stared at.`);
          L.push(`- ${player.name} is NOT a demon. An outsider walks openly among demons, and everyone notices — you most of all.`);
        }
      } catch (e) { }
      // full roster with fellow members named (this is what stops the forgetting)
      const ids = (player.party || []);
      if (ids.length) {
        const bits = [];
        for (const id of ids) {
          const m = lookupNpc(id) || (id === npc.id ? npc : null);
          if (!m) { bits.push(`${id} (HP ?)`); continue; }
          const hp = m.hp > 0 ? `${Math.ceil(m.hp)}/${m.maxHp}` : "DOWN";
          bits.push(`${m.name} (${m.role} lv${m.lv}, HP ${hp})${m.id === npc.id ? " — YOU" : ""}`);
        }
        L.push(`- Party companions (${ids.length}/4, plus ${player.name} as leader): ${bits.join("; ")}.`);
        if (inParty && ids.length > 1) {
          const fellows = bits.filter(b => !b.endsWith("— YOU")).join("; ");
          if (fellows) L.push(`- Your fellow companion(s): ${fellows}. You know them, you fight beside them.`);
        } else if (inParty) L.push(`- Right now it is just you and ${player.name} on the road.`);
      } else L.push(`- Party: ${player.name} travels alone (no companions).`);
      // combat: who THIS npc fights + who the player fights
      let foe = null;
      try { foe = (window.Game && window.Game.resolveTarget) ? window.Game.resolveTarget(npc) : null; } catch (e) { foe = null; }
      if (!foe && npc.targetId) foe = lookupNpc(npc.targetId);
      if (foe && foe.hp > 0) {
        const fn = (foe === player) ? `${player.name} (the traveler before you!)` : `${foe.name || foe.id} (HP ${Math.ceil(foe.hp)}/${foe.maxHp || "?"})`;
        L.push(`- You are FIGHTING ${fn}. Act like it — no idle shop-talk.`);
      } else L.push(`- You are not fighting anyone right now.`);
      try {
        const pt = (window.Game && window.Game.resolveTarget) ? window.Game.resolveTarget(player) : null;
        if (pt && pt.hp > 0 && pt !== npc) {
          const pn = pt.name || pt.id || "someone";
          L.push(`- ${player.name} is fighting ${pn}.${inParty ? " Help them." : ""}`);
        }
      } catch (e) { }
      // location + vitals of the traveler before you
      const loc = npc.placeName || "the wilds";
      let where = loc;
      try {
        if (player.inDungeon && window.Game && window.Game.G.dungeon) where = `inside dungeon ${window.Game.G.dungeon.name || loc}`;
      } catch (e) { }
      L.push(`- Location: ${where}. ${player.name} (lv${player.lv}, HP ${Math.ceil(player.hp)}/${player.maxHp}) stands before you.`);
      try {
        if (npc.mount && npc.mount.kind) {
          let bk = npc.mount.kind, bn = bk;
          try { bn = ((window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[bk]) || {}).name || bk; } catch (e2) { }
          L.push(`- Mount: you ride your own ${bn} everywhere outdoors (it is stabled nowhere — it stays with you). Mention it if asked how you travel; in bed or in dungeons you go on foot.`);
        }
      } catch (e2) { }
      // war parties: marching soldiers say so, and press the hero to join
      try {
        if (npc.armyBase && npc.armyBase.name) {
          L.push(`- WAR MARCH: you march with a war party against ${npc.armyBase.name} (an enemy holding that must be destroyed — its warlord must die). If ${player.name} asks about work or quests, press them to join the assault: the 📜 Quest button seals it. Never offer any other quest.`);
        }
      } catch (e2) { }
      // schedule block: workplace/home/night-duty/time (GAME-writable only).
      // Never invent a workplace or bed — if it says none, you have none.
      try {
        if (window.Schedule && !npc.inParty) {
          const hr = window.Schedule.hourNow();
          const hh = Math.floor(hr), mm = Math.floor((hr - hh) * 60);
          const tstr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
          L.push(`- Time: ${tstr} game time. Work hours are 07:00-19:00, sleep is night 20:00-06:00.${window.Schedule.isWorkHours(hr) ? " It is currently WORK hours." : ""}${window.Schedule.isSleepHours(hr) ? " It is currently SLEEP hours." : ""}`);
          if (npc.work && npc.work.title) L.push(`- Work: ${npc.work.title} (${npc.role}) at tile (${Math.round(npc.work.x)}, ${Math.round(npc.work.y)}).${window.Schedule.isWorkHours(hr) ? " You should be there now — mention it if asked where you work." : " You work there by day."}`);
          else if (window.Schedule.needsWorkplace && window.Schedule.needsWorkplace(npc.role)) L.push(`- Work: your workplace is gone or full — you keep its title in name only until one frees up.`);
          else L.push(`- Work: none — no fixed workplace (you wander ${npc.role === "unemployed" ? "looking for odd jobs" : npc.role === "adventurer" ? "chasing rumors and road work" : "where the day takes you"}).`);
          if (npc.nightDuty) L.push(`- Home: none — you pull NIGHT DUTY, patrolling the settlement instead of sleeping. Say so if asked where you sleep.`);
          else if (npc.home && npc.home.title) L.push(`- Home: ${npc.home.title}, bed at tile (${npc.home.x}, ${npc.home.y}).${npc.sleeping ? " You are ASLEEP in it right now." : window.Schedule.isSleepHours(hr) ? " You should be asleep there now." : ""}`);
          else L.push(`- Home: no bed of your own yet.`);
        }
      } catch (e) { }
    } catch (e) { }
    return L.join("\n");
  }
  function buildConversationMemory(npc) {
    const mem = npc.memories || { summary: "", tail: [] };
    const tail = (mem.tail || []).slice(-10).join("\n") || "(none yet)";
    return `What you remember about this traveler (talks + trades; GAME MEMORY above overrides on conflict):\n${mem.summary || "(nothing yet)"}\nRecent exchanges, newest last (Shop ledger lines are authoritative trade outcomes):\n${tail}`;
  }
  function buildChatPrompt(npc, player, extraCtx) {
    try { ensurePersona(npc); } catch (e) { }
    const gameMem = buildGameMemory(npc, player);
    const convMem = buildConversationMemory(npc);
    const trade = tradeCtx(npc, player);
    let gearLine = "";
    try {
      const w = mainWeaponOf(npc);
      const pack = packNote(npc);
      if (w || pack) gearLine = `Gear: ${w ? `wields ${w.name}` : "no weapon to speak of"}${pack ? `; carries ${pack}` : ""}. They may brag about their gear.\n`;
    } catch (e) { }
    const interests = (npc.interests || []).slice(0, 3).join(", ") || "local gossip";
    return `GAME MEMORY (authoritative, game-written only — never contradict, overrides all below):\n${gameMem}\n\nCONVERSATION MEMORY (your talks + trades with this traveler):\n${convMem}\n\nYou are roleplaying ONE NPC in a 2D pixel RPG. Stay in character. Keep replies to 1-3 sentences. Never break character, never mention you are an AI. Speak plain medieval-fantasy: short concrete sentences, no modern slang, no marketing speech. NEVER use not-just-but phrasing (no [not just / not merely / not only] X, [but] Y; no [more than just] X; no [it is not X, it is Y]). Never use: embark, vibrant, tapestry, unlock, elevate, journey as a verb, delve into, free of charge, side-truth, weather/climate metaphors, arithmetic-as-metaphor.\nNPC: ${npc.name}, a ${npc.role} (level ${npc.lv}) living in ${npc.placeName || "the wilds"}.\nPersonality: ${npc.personality || "warm"}.${npc.quirk ? " Quirk: " + npc.quirk : ""}\nVoice: ${npc.speech || "plain talk"}. Let this rhythm and flavor color every reply.\nCares about: ${interests}. Weave one in when it fits — you light up on these topics.\n${gearLine}${trade ? "TRADING (you are an honest trader — follow these numbers exactly):\n" + trade + "\n" : ""}Current situation: ${extraCtx || ""} Loyalty ${npc.loyalty || 0}/1000.\nTASK: write your next spoken reply as '${npc.name}:' (one short paragraph in your own voice — your rhythm, your slang — may offer help, a rumor, or react to the player. If in party, act like a companion on the road, not a shopkeeper meeting a stranger).`;
  }
  // ---- AI trade-intent classifier (natural-language understanding) ----
  // The AI decides WHAT the player meant (item, side, qty, offer, plea,
  // accept). It never sets prices or moves gold — Trade.applyAiIntent
  // validates the id against real stock/pack and runs the shared game-side
  // executor. Returns null when AI is unavailable/failed: the caller falls
  // back to the regex path. Side-effect-free (never parks background AI).
  async function classifyTradeIntent(npc, player, userText) {
    // Programmatic trade-intent parser (no AI): mirrors Trade.decideMemoryTrade
    // shape {trade_related, side, item, qty, offer_each, plea, accept}.
    try {
      if (!npc || !player || !userText || !String(userText).trim()) return null;
      try { if (window.Trade) window.Trade.ensure(npc); } catch (e) {}
      const raw = String(userText);
      const t = raw.trim();
      if (!t) return null;
      const norm = (id) => { try { const it = window.Items.ITEMS[id]; return it ? it.name : String(id).replace(/_/g, " "); } catch (e) { return String(id); } };
      // find mentioned item: exact id or name substring in stock first, then pack
      let mentioned = null;
      try {
        const stock = (npc.stock || []).filter(x => x && x.id && (x.n | 0) > 0);
        const packIds = [];
        try { for (const x of (player.inventory || [])) if (x && x.id) packIds.push(x.id); } catch (e) {}
        const low = t.toLowerCase();
        for (const x of stock) {
          const nm = String(norm(x.id)).toLowerCase();
          if (low.includes(x.id.toLowerCase().replace(/_/g, " ")) || low.includes(nm) || low.includes(x.id.toLowerCase())) { mentioned = { id: x.id, side: "buy" }; break; }
        }
        if (!mentioned) for (const id of packIds) {
          const nm = String(norm(id)).toLowerCase();
          if (low.includes(String(id).toLowerCase().replace(/_/g, " ")) || low.includes(nm)) { mentioned = { id, side: "sell" }; break; }
        }
      } catch (e) {}
      const tradeRe = /buy|sell|trade|wares|goods|shop|price|cost|gold|offer|deal|cheaper|discount|how much|afford|broke/i.test(t);
      if (!tradeRe && !mentioned) return null;
      let focus = null;
      try { focus = (window.Trade && window.Trade.focusOf) ? window.Trade.focusOf(npc) : (npc.barter || null); } catch (e) {}
      let cand = mentioned || (focus && focus.id ? { side: focus.side, id: focus.id } : null);
      if (!cand) {
        if (tradeRe) return { trade_related: true, side: null, item: null, qty: 1, offer_each: null, plea: /cheaper|discount|too much|too expensive|afford|broke|poor/i.test(t), accept: false };
        return null;
      }
      // side: explicit signals win, else mentioned/focus side
      let side = cand.side || (focus && focus.id === cand.id ? focus.side : null);
      if (/\bmy\b|give me|sell me|take my|buy my|pay me|you pay|\b(buy|sell|offer|bid)\b/i.test(raw)) {
        // explicit verbs win: bare "sell X" = sell, bare "buy X" = buy, "my X" = sell
        if (/\bsell\b/i.test(raw) && !/\bbuy\b/i.test(raw)) side = "sell";
        else if (/\bbuy\b/i.test(raw) && !/\bsell\b/i.test(raw)) side = "buy";
        else if (/\bmy\b|take my|buy my/i.test(raw)) side = "sell";
      }
      if (!side) {
        try {
          const hasStock = (npc.stock || []).some(x => x && x.id === cand.id && (x.n | 0) > 0);
          let hasIt = false;
          try { hasIt = (window.Items.countItem(player, cand.id) | 0) > 0; } catch (e) {}
          side = hasStock && !hasIt ? "buy" : !hasStock && hasIt ? "sell" : hasStock ? "buy" : "sell";
        } catch (e) { side = "buy"; }
      }
      let qty = 1;
      try {
        const esc = String(norm(cand.id)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const qm = new RegExp("(\\d+)\\s*[x×]?\\s*(?:" + esc + ")", "i").exec(raw);
        if (qm) qty = Math.max(1, parseInt(qm[1], 10));
        else if (focus && focus.id === cand.id && (focus.n | 0) > 0) qty = focus.n | 0;
      } catch (e) {}
      qty = Math.max(1, Math.min(99, qty | 0 || 1));
      let offerEach = null;
      try {
        const nums = (raw.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => n > 0 && n < 100000);
        const hasOfferVerb = /take|offer|pay|give|for|how about|what about|would you|will you|deal|sound|accept|fine/i.test(raw);
        if (nums.length && hasOfferVerb && !/^(buy|sell|offer|bid)\b/i.test(t)) offerEach = nums[nums.length - 1];
      } catch (e) {}
      const plea = /cheaper|discount|lower|best price|too much|too expensive|afford|broke|poor/i.test(t);
      let accept = false;
      try {
        if (npc.deal && /\b(deal|sold|yes|take it|accept|deal!|agreed|fine)\b/i.test(t)) accept = true;
      } catch (e) {}
      return { trade_related: !!tradeRe || !!mentioned, side, item: cand.id, qty, offer_each: offerEach, plea, accept };
    } catch (e) { return null; }
  }
  async function chatReply(npc, player, userText, onChunk, extraCtx, ledger) {
    // Prexzy ONLY for NPC chats. Everything else is programmatic.
    // Memory + ledger bookkeeping is identical to before; the reply text
    // comes from Prexzy (or fallbackReply when offline/cooling/failing).
    try { if (window.Trade) window.Trade.ensure(npc); } catch (e) { }
    try { ensurePersona(npc); } catch (e) { }
    npc.memories = npc.memories || { summary: "", tail: [] };
    npc.memories.tail.push(`Traveler: ${String(userText).slice(0, 300)}`);
    if (ledger) {
      const clean = String(ledger).replace(/^\*+|\*+$/g, "").trim().slice(0, 200);
      const norm = (s) => String(s || "").replace(/^\*+|\*+$/g, "").replace(/^(Shop ledger:\s*)/i, "").trim().toLowerCase();
      const prev = npc.memories.tail.filter(x => /^Shop ledger:/i.test(x)).slice(-1)[0];
      if (clean && norm(`Shop ledger: ${clean}`) !== norm(prev)) npc.memories.tail.push(`Shop ledger: ${clean}`);
    }
    trimTail(npc);
    const prompt = buildChatPrompt(npc, player, extraCtx);
    const usePrexzy = (() => { try { return !!(window.Prexzy && window.Prexzy.chat) && !window.Prexzy.cooling(); } catch (e) { return false; } })();
    let clean = "";
    if (!usePrexzy) {
      clean = fallbackReply(npc, userText);
    } else {
      try {
        let full = await window.Prexzy.chat(prompt, { timeoutMs: 30000 });
        full = String(full || "").trim();
        if (!full) throw new Error("prexzy-empty");
        // strip leading name echo + wrapping quotes (same as before)
        clean = full.replace(new RegExp(`^${escapeReg(npc.name)}\\s*:\\s*`), "").trim().replace(/^["\u201c\u201d]+|["\u201c\u201d]+$/g, "").trim() || full.trim();
        clean = clean.slice(0, 600);
        // simulate streaming for the typing indicator
        try { if (onChunk) onChunk({ textChunk: clean, fullTextSoFar: clean }); } catch (e) {}
      } catch (e) {
        try { if (window.Prexzy) window.Prexzy.noteFailure(60000); } catch (e2) {}
        clean = fallbackReply(npc, userText);
      }
    }
    npc.memories.tail.push(`${npc.name}: ${String(clean).slice(0, 400)}`);
    trimTail(npc);
    try { await window.World.saveNpc(npc); } catch (e) { }
    try { maybeSummarize(npc); } catch (e) {}
    if (!npc.noLoyalty && npc.role !== "slave" && /thank|kind|help|please/i.test(String(userText||""))) npc.loyalty = Math.min(1000, (npc.loyalty || 0) + 3);
    return clean;
  }
  function tradeCtx(npc, player) {
    // Compact trade state for the prompt: gold, stock w/ asking prices, bids, pending deal.
    try {
      if (!window.Trade) return "";
      window.Trade.ensure(npc);
      const lines = [];
      lines.push(`You carry ${npc.gold | 0} gold. You may ONLY sell items from this stock (each at its asking price, or a little less if haggled — never below the floor), and you may ONLY buy if the total fits in your ${npc.gold | 0} gold. Never invent other goods or gold.`);
      const stock = (npc.stock || []).slice(0, 8);
      if (stock.length) lines.push(`YOUR GOODS: ${stock.map(s => `${s.n}× ${simpleName(s.id)} (ask ${window.Trade.ask(npc, s.id, player)}g, floor ${window.Trade.minAsk(npc, s.id, player)}g)`).join("; ")}.`);
      else lines.push(`YOUR GOODS: sold out — say so honestly.`);
      const theirs = [];
      try {
        for (const s of (player.inventory || []).slice(0, 8)) {
          if (window.Items.countItem(player, s.id) > 0) theirs.push(`${window.Items.countItem(player, s.id)}× ${simpleName(s.id)} (you'd pay up to ${window.Trade.maxPay(npc, s.id, player)}g each)`);
        }
      } catch (e) { }
      if (theirs.length) lines.push(`THEY CARRY: ${theirs.join("; ")}.`);
      if (!npc.deal && npc.barter && npc.barter.id) {
        lines.push(`UNDER DISCUSSION: ${npc.barter.n}× ${simpleName(npc.barter.id)} (they're ${npc.barter.side === "buy" ? "buying it from you" : "selling it to you"}). If they name just a number, it's an offer on this.`);
      }
      if (npc.deal) {
        const d = npc.deal;
        lines.push(d.side === "buy"
          ? `PENDING DEAL: you offered them ${d.n}× ${simpleName(d.id)} for ${d.price}g each. If they say yes/deal/accept, honor it happily; if they refuse, drop it gracefully.`
          : `PENDING DEAL: they asked ${d.price}g each for ${d.n}× ${simpleName(d.id)} of yours. If they say yes/deal/accept, pay it gladly (you can afford it); if they refuse, drop it gracefully.`);
      }
      lines.push(`If they haggle, you may counter ONCE by meeting near halfway (never past your floor/ceiling), then hold firm. If they say just a number, it is an offer on the item under discussion. The narrator's sys bubble (if any) already set the binding price and pending deal — echo its EXACT number, never invent another. Successful haggling pleases you (+regard).`);
      return lines.join("\n");
    } catch (e) { return ""; }
  }
  function simpleName(id) {
    try { const it = window.Items.ITEMS[id]; if (it) return it.name; } catch (e) { }
    return String(id).replace(/^tome_/, "Tome: ").replace(/_/g, " ");
  }
  function trimTail(npc) { if (npc.memories.tail.length > 14) npc.memories.tail = npc.memories.tail.slice(-14); }
  let summarizing = new Set();
  async function maybeSummarize(npc) {
    // Programmatic rolling memory: fold oldest tail into summary locally.
    // No AI summarizer — keeps names/promises/facts verbatim (capped).
    try {
      if (!npc || summarizing.has(npc.id)) return;
      const approx = (npc.memories.summary || "").length + (npc.memories.tail || []).join("\n").length;
      if (approx < 2600) return;
      summarizing.add(npc.id);
      try {
        npc.memories.summary = (String(npc.memories.summary || "") + " " + (npc.memories.tail || []).slice(0, 4).join(" ")).slice(-900);
        npc.memories.tail = (npc.memories.tail || []).slice(-8);
        try { await window.World.saveNpc(npc); } catch (e) {}
      } finally { summarizing.delete(npc.id); }
    } catch (e) {}
  }
  function fallbackReply(npc, userText) {
    // Offline voice: persona-flavored so every NPC still sounds like themselves.
    // Party/combat aware so companions don't forget the road even with no AI.
    try { ensurePersona(npc); } catch (e) { }
    const ints = (npc.interests || []).slice(0, 3);
    const mark = (p) => (npc.marker && Math.random() < (p == null ? 0.35 : p) ? npc.marker + " " : "");
    const t = userText.toLowerCase();
    if (/in (my|your|our|the) party|travel with|with you|fellow|companion/i.test(t) || (/party/.test(t) && /you|your|we|us|together/.test(t))) {
      if (npc.inParty) {
        let fellows = "";
        try {
          const ids = (window.Game.G.player.party || []).filter(id => id !== npc.id);
          const names = ids.map(id => { const m = lookupNpc(id); return m ? m.name : null; }).filter(Boolean);
          if (names.length) fellows = ` alongside ${names.join(", ")}`;
        } catch (e) { }
        return mark() + `Aye — I march with you${fellows}. Have you forgotten the road already?`;
      }
      return mark() + "Not yet, traveler. Chat a while, earn my trust, and ask me to join.";
    }
    if (/recruit|join|come/.test(t)) return mark() + (npc.recruitable ? "My blade is yours if you'll have me. Just say the word." : "I can't leave my post, but my prayers go with you.");
    if (/trade|wares|goods|shop|price|what.*sell|buy|sell/.test(t)) return tradePitch(npc);
    if (/heal|hurt|hp/.test(t)) return mark() + "Rest a moment. Even heroes need bread and bandages.";
    if (/dungeon|boss|danger/.test(t)) return mark() + "They say the crypts shift when no one watches. Bring torches. Bring friends.";
    if (/who are you|your name/.test(t)) return `I'm ${npc.name}, ${npc.role} of ${npc.placeName || "these parts"}. ${cap1(npc.personality || "warm and curious")}.${ints.length ? ` Ask me about ${ints[0]} — or better yet, ${ints[ints.length - 1]}.` : ""}`;
    if (/rumor|news|quest/.test(t)) return "A traveler swore the deep crypt's lord keeps a chest of star-iron. Could be wind. Could be true." + (ints.length > 1 && Math.random() < 0.5 ? ` Personally I'm more into ${ints[ints.length - 1]}.` : "");
    if (/weapon|sword|bow|blade|gear|fight/.test(t)) {
      try {
        const w = mainWeaponOf(npc);
        if (w) return mark() + `This? This is ${w.name}. ${ints.length ? `Near as dear to me as ${ints[0]}.` : "Had it years."}`;
      } catch (e) { }
      return mark() + "Steel's for them as needs it. I've my wits.";
    }
    if (ints.length && /hobby|love|like|do for fun|interest|passion|free time/.test(t)) return mark(0.6) + `Me? ${cap1(ints.join(", "))}.${npc.quirk ? ` Quirk: ${npc.quirk}.` : ""}`;
    const greets = ["The road treats you well, I hope.", "Fine day for wandering, eh?", "Mind the treeline after dusk.", "You carry yourself like someone with a story."];
    return mark(0.4) + greets[(Math.random() * greets.length) | 0];
  }
  function cap1(s) { s = String(s || ""); return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function tradePitch(npc) {
    try {
      if (!window.Trade) return "Trade? Name your terms, friend.";
      window.Trade.ensure(npc);
      const stock = npc.stock || [];
      if (!stock.length) return `Coin's thin on my side — I've got ${npc.gold | 0} gold and empty pockets. Come back another day.`;
      const bits = stock.slice(0, 6).map(s => `${s.n}× ${simpleName(s.id)} (${s.price}g)`);
      return `Here's my pack: ${bits.join(", ")}. I've ${npc.gold | 0} gold to spend too — press ⚖️ Trade, or just say "buy ..." / "sell ...". Haggling welcome.`;
    } catch (e) { return "Trade? Name your terms, friend."; }
  }
  function escapeReg(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  // ---- doppelgangers: 5% of spawns wear a borrowed face ----
  // Marked ONLY at spawn (fallback + enriched + dungeon-adventurer spawns).
  // Slaves / bound labor never host one. Female-biased 5:1; the disguise keeps
  // its name/role and re-rolls a matching face + persona for the new sex.
  function isDoppelgangerExcluded(npc) {
    try {
      if (!npc || typeof npc !== "object") return true;
      if (npc.isDoppelganger) return true;
      // heaven is doppelganger-free: angels and heavendwellers wear no
      // borrowed faces, whatever dimension tag the spawn carried.
      try {
        if (npc.dim === "heaven") return true;
        const rl = String(npc.role || "");
        if (rl === "heavendweller" || rl === "dawn_angel" || rl === "choir_angel" ||
            rl === "seraph_guard" || rl === "scroll_angel" || rl === "angel_priest" ||
            rl === "seraph_regent" || rl === "brook_seraph" || rl.indexOf("angel") >= 0) return true;
      } catch (e2) { }
      if (npc.role === "slave" || npc.slave || npc.noLoyalty) return true;
      if (npc.army || npc.siege || npc.isTame || npc.role === "mob") return true;
      return false;
    } catch (e) { return true; }
  }
  function maybeMarkDoppelganger(npc) {
    try {
      if (!npc || npc.isDoppelganger || npc.doppelRevealed) return npc;
      if (isDoppelgangerExcluded(npc)) return npc;
      let chance = 0.05;
      try { chance = (window.CFG && window.CFG.DOPPELGANGER && window.CFG.DOPPELGANGER.CHANCE) || 0.05; } catch (e) { }
      if (Math.random() >= chance) return npc;
      npc.isDoppelganger = true;
      npc.doppelRevealed = false;
      npc.doppelTricked = false;
      npc.doppelExposed = false;
      npc.doppelTrueKind = "doppelganger";
      try { npc.doppelLowTier = false; } catch (e) { }
      try { npc.disguiseName = npc.name; npc.disguiseRole = npc.role; } catch (e) { }
      // female-biased 5:1 — then re-roll the face + voice for the new sex
      try { npc.gender = (Math.random() < 5 / 6) ? "female" : "male"; } catch (e) { }
      try {
        if (window.Appearance) {
          const A = window.Appearance;
          let rc = null;
          try { rc = (npc.appearance && npc.appearance.race) || npc.race || null; } catch (e2) { }
          npc.appearance = A.randomForRole(npc.role, rc || A.rollRace(), npc.gender);
          try { npc.race = npc.appearance.race || "human"; } catch (e2) { }
        }
      } catch (e) { }
      try {
        const g = genPersona(npc);
        if (g) {
          npc.personality = g.temperament; npc.speech = g.speech;
          npc.interests = g.interests; npc.marker = g.marker; npc.greeting = g.greeting;
        }
      } catch (e) { }
      try {
        if (Array.isArray(npc.abilities)) {
          for (const a of ["whirlwind", "venom", "dazzle"]) if (npc.abilities.indexOf(a) < 0) npc.abilities.push(a);
        }
      } catch (e) { }
    } catch (e) { }
    return npc;
  }

  return { enrichChunk, enrichDungeon, chatReply, classifyTradeIntent, hasAI, makeNpcObject, ensurePersona, personaLine, genPersona, guessGenderFromName, mainWeaponOf, buildChatPrompt, buildGameMemory, buildConversationMemory, rollRegionSeeds, regionNamingBlock, placeNameTaken, uniquifyPlaceName, isDoppelgangerExcluded, maybeMarkDoppelganger, fallbackReply, programmaticDungeonName, dreamRegionNameSync, applyProgrammaticChunk, _test: { rollDie, rollLetters, rollNameSeeds, namingBlock, uniquifyNpcName, fallbackReply, rollRegionSeeds, regionNamingBlock, placeNameTaken, uniquifyPlaceName } };
})();
