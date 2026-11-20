/* Names: procedural culture-aware name weaver. window.Names.
   Seeded syllable/morpheme weaving so every settlement and villager gets a
   fresh, culture-fitting name (Japanese-sounding for sakura, Norse-dwarven for
   fortress, nautical for watergate, pastoral English for village/town/city),
   plus a generic consonant/vowel phonotactic weaver for collisions.
   All entry points take an integer seed and are pure + deterministic — the
   same seed always yields the same name, so saves stay stable. */
window.Names = (() => {
  function rng32(seed) {
    let a = seed | 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[(r() * arr.length) | 0]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function chance(r, p) { return r() < p; }

  // ---------- Japanese (sakura) ----------
  // Hepburn-ish morae; syllabic n handled by the weaver below.
  const JM = ["a", "i", "u", "e", "o",
    "ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so",
    "ta", "chi", "tsu", "te", "to", "na", "ni", "nu", "ne", "no",
    "ha", "hi", "fu", "he", "ho", "ma", "mi", "mu", "me", "mo",
    "ya", "yu", "yo", "ra", "ri", "ru", "re", "ro", "wa",
    "ga", "gi", "gu", "ge", "go", "za", "ji", "zu", "ze", "zo",
    "da", "de", "do", "ba", "bi", "bu", "be", "bo",
    "pa", "pi", "pu", "pe", "po"];
  const JVOWEL_FIRST = ["a", "i", "u", "e", "o"];
  const JRENDAKU = {
    ka: "ga", ki: "gi", ku: "gu", ke: "ge", ko: "go",
    sa: "za", shi: "ji", su: "zu", se: "ze", so: "zo",
    ta: "da", chi: "ji", tsu: "zu", te: "de", to: "do",
    ha: "ba", hi: "bi", fu: "bu", he: "be", ho: "bo",
  };
  // weave n morae of proper Japanese: no leading n, syllabic n only finally
  // or before a vowel-mora, occasional geminate (Hattori/Nikko flavor).
  function jWeave(r, n) {
    const out = [];
    for (let k = 0; k < n; k++) {
      let m = pick(r, JM);
      if (out.length === 0 && (m === "n" || m === "wo")) m = pick(r, JM.filter(x => x !== "n" && x !== "wo"));
      if (out[out.length - 1] === "n" && JVOWEL_FIRST.indexOf(m.charAt(0)) < 0) {
        m = pick(r, JVOWEL_FIRST);
      }
      // geminate: double the next consonant (ka->kka, shi->sshi, chi->cchi)
      if (out.length > 0 && k < n - 1 && chance(r, 0.10)) {
        const c = m.charAt(0);
        if ("kstp".indexOf(c) >= 0 && m !== "n") {
          const dbl = (m === "shi") ? "sshi" : (m === "chi") ? "cchi" : (m === "tsu") ? "ttsu" : c + m;
          out.push(dbl);
          continue;
        }
      }
      out.push(m);
    }
    if (out[out.length - 1] === "n" && out.length > 1) out[out.length - 1] = pick(r, ["na", "mi", "ka", "to", "ro"]);
    return out.join("");
  }
  const JROOTS = ["hana", "yuki", "tsuki", "hoshi", "mori", "take", "matsu", "ume",
    "fuji", "kiku", "iwa", "suna", "nami", "kaze", "ame", "yama", "kawa", "suzu",
    "hagi", "kashi", "momo", "kuri", "nara", "michi", "kiri", "sakura", "tsubaki",
    "kaede", "hotaru", "suzume", "kamo", "aya", "sei", "rin", "yuu"];
  const JSUFFIX = ["yama", "kawa", "mura", "machi", "mori", "hama", "saki", "tani",
    "hara", "saka", "shima", "taki", "numa", "sato", "mine", "no"];
  const JPRE = ["o", "shin", "hon", "nishi", "higashi", "kita", "minami", "naga", "kami", "shimo"];
  function jSuffix(r) {
    let s = pick(r, JSUFFIX);
    // rendaku: kawa->gawa, saki->zaki, tani->dani, hara->bara, shima->jima
    if (chance(r, 0.65)) {
      for (const k of Object.keys(JRENDAKU)) {
        if (s.indexOf(k) === 0) { s = JRENDAKU[k] + s.slice(k.length); break; }
      }
      if (/^ha/.test(s) && chance(r, 0.5)) s = "ba" + s.slice(2); // hara->bara
    }
    return s;
  }
  function sakuraSettlement(r) {
    const roll = r();
    let s;
    if (roll < 0.55) s = pick(r, JROOTS) + jSuffix(r);
    else if (roll < 0.72) s = pick(r, JPRE) + pick(r, JROOTS) + jSuffix(r);
    else s = jWeave(r, 2 + ((r() * 3) | 0)) + jSuffix(r);
    return cap(s).slice(0, 24);
  }
  function sakuraFirst(r) {
    // first names stay short (2-3 morae) and never smuggle place-words in
    const banned = ["saka", "saku", "kawa", "yama", "mura", "machi", "shima",
      "hara", "gawa", "mori", "hama", "saki", "tani", "sato", "shimo", "kami",
      "kita", "nishi", "gashi", "nami", "naga", "shin", "hon"];
    for (let t = 0; t < 8; t++) {
      const w = jWeave(r, 2 + ((r() * 2) | 0));
      let bad = false;
      for (const b of banned) if (w !== b && w.indexOf(b) >= 0) { bad = true; break; }
      if (!bad) return cap(w).slice(0, 14);
    }
    return cap(jWeave(r, 2)).slice(0, 14);
  }
  const JLAST_A = ["yama", "kawa", "ta", "naka", "suzu", "matsu", "take", "hara",
    "ki", "mori", "haya", "fuji", "kiku", "iwa", "suna", "taka", "naga", "ino",
    "kita", "miya", "kudo"];
  const JLAST_B = ["moto", "kuchi", "mura", "yama", "kawa", "saki", "hara", "shima",
    "tani", "saka", "hashi", "oka", "da", "nabe", "hayashi", "sato", "e", "ue"];
  function sakuraLast(r) {
    const a = pick(r, JLAST_A);
    let b = pick(r, JLAST_B);
    // never stutter the same root twice (Harahara) — re-roll the back half
    for (let t = 0; t < 6 && b === a; t++) b = pick(r, JLAST_B);
    if (chance(r, 0.6)) {
      for (const k of Object.keys(JRENDAKU)) {
        if (b.indexOf(k) === 0) { b = JRENDAKU[k] + b.slice(k.length); break; }
      }
      if (/^ha/.test(b) && chance(r, 0.6)) b = "ba" + b.slice(2);
    }
    return cap(a + b).slice(0, 16);
  }

  // ---------- Dwarven/Norse (fortress) ----------
  const DON = ["br", "dr", "thr", "gr", "khr", "str", "sn", "sk", "st", "th",
    "b", "d", "g", "h", "m", "r", "k", "f", "n", "v", "dor", "thor"];
  const DNUC = ["o", "u", "a", "i", "au", "ai", "ou", "e"];
  const DCODA = ["", "m", "n", "r", "g", "k", "nn", "rr", "mm", "ll", "rn", "rd",
    "ld", "sk", "in", "li", "mir", "nar", "din", "grim", "bek"];
  function fortressFirst(r) {
    return cap(pick(r, DON) + pick(r, DNUC) + pick(r, DCODA)).slice(0, 14);
  }
  const DMAT = ["Iron", "Stone", "Grim", "Deep", "Oath", "Coal", "Gold", "Frost",
    "Rune", "Storm", "Cinder", "Oak", "Battle", "Ale", "Night", "Red"];
  const DPART = ["helm", "beard", "forge", "delver", "carver", "stone", "back",
    "seam", "peak", "hold", "grip", "brow", "axe", "guard", "bank", "fall"];
  function fortressLast(r) { return (pick(r, DMAT) + pick(r, DPART)).slice(0, 16); }
  const DHOLD1 = ["Stone", "Iron", "Dur", "Kaz", "Khar", "Nor", "Grim", "Deep",
    "Rune", "Anvil", "Frost", "Bar", "Thum", "Az", "Bal", "Gund"];
  const DHOLD2 = ["helm", "deep", "hold", "gate", "barrow", "dum", "din", "dor",
    "bad", "thol", "gar", "heim", "dal", "ost", "rak"];
  function fortressSettlement(r) {
    return (pick(r, DHOLD1) + pick(r, DHOLD2)).slice(0, 24);
  }

  // ---------- Nautical (watergate) ----------
  const WON = ["m", "br", "n", "c", "d", "p", "r", "sh", "w", "l", "k", "s", "t", "v", "gr", "th"];
  const WVOW = ["a", "e", "i", "o", "u", "ae", "ia", "ee", "oa"];
  const WCODA = ["", "n", "r", "l", "th", "sh", "nd", "ll", "ss", "m", "ck", "rey", "wen"];
  function waterFirst(r) {
    let s = pick(r, WON) + pick(r, WVOW) + pick(r, WCODA);
    if (s.length < 4 || chance(r, 0.35)) s += pick(r, WVOW) + pick(r, WCODA);
    return cap(s).slice(0, 14);
  }
  const WW1 = ["Tide", "Lock", "Bridge", "Canal", "Harbor", "Sluice", "Mire",
    "Brine", "Flood", "Dock", "Rill", "Marsh", "Gull", "Salt", "Bog", "Beck",
    "Reed", "Pond", "Foam", "Keel"];
  const WW2 = ["", "wood", "er", "water", "side", "wick", "ford", "man", "ley",
    "borne", "shaw", "mar", "ling"];
  function waterLast(r) { return (pick(r, WW1) + pick(r, WW2)).slice(0, 16); }
  const WWEND = ["port", "gate", "mere", "water", "haven", "mouth", "wick",
    "ford", "lock", "dam", "quay", "pool", "wich", "marsh"];
  function waterSettlement(r) {
    return (pick(r, WW1) + pick(r, WWEND)).slice(0, 24);
  }

  // ---------- Pastoral English (village / town / city) ----------
  const PROOT = ["Ash", "Oak", "Thorn", "Willow", "Moss", "Fern", "Alder",
    "Barley", "Oat", "Mill", "Bell", "Cinder", "Ember", "Fox", "Hart", "Raven",
    "Stag", "Brook", "Birch", "Rowan", "Hazel", "Heath", "Marsh", "Elder",
    "Oxen", "Alden", "Stour", "Dun", "Stan", "Bourne", "Cliff", "Wold", "Avon"];
  const PEND_V = ["ham", "ton", "ley", "den", "field", "ford", "brook", "holt",
    "stead", "wick", "by", "bourne", "ey", "shaw", "dale"];
  const PEND_T = ["bury", "mouth", "haven", "market", "combe", "chester",
    "minster", "bridge", "gate", "port", "fall"];
  const PCITY = ["Kings", "High", "Crown", "Elder", "Storm", "Gold", "Val",
    "Thorn", "Raven", "White", "Black", "Ember", "Bright", "Far"];
  const PEND_C = ["reach", "market", "gate", "mere", "haven", "spire", "throne",
    "burgh", "hold", "gard", "fall", "crest", "wick", "ford"];
  const PPRE = ["North", "South", "East", "West", "Upper", "Lower", "Little",
    "Great", "Old", "Nether"];
  function pastoralSettlement(r, tier) {
    let s;
    if (tier === "city") s = pick(r, PCITY) + pick(r, PEND_C);
    else if (tier === "town") s = pick(r, PROOT) + pick(r, PEND_V.concat(PEND_T));
    else s = pick(r, PROOT) + pick(r, PEND_V);
    if (chance(r, 0.14)) s = pick(r, PPRE) + " " + s;
    return s.slice(0, 24);
  }
  const PON = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r",
    "s", "t", "w", "br", "cr", "dr", "fr", "gr", "pr", "st", "th", "sh", "ch",
    "wh", "bl", "cl", "fl", "gl", "pl", "sl", "qu", "sk", "sp"];
  const PVOW = ["a", "e", "i", "o", "u", "ae", "ea", "eo", "ia", "ie"];
  const PCODA = ["", "n", "r", "l", "m", "th", "d", "s", "k", "rd", "nd", "ld",
    "wn", "ry", "nn", "tt", "sh"];
  const PTAIL = ["", "", "a", "ia", "en", "in", "ie", "wen", "ric", "win",
    "elle", "etta", "ous", "an"];
  function pastoralFirst(r) {
    let s = pick(r, PON) + pick(r, PVOW) + pick(r, PCODA) + pick(r, PTAIL);
    if (s.length < 3) s += pick(r, ["a", "o", "en", "in"]);
    return cap(s).slice(0, 14);
  }
  const PLAST = ["ford", "wood", "field", "shire", "worth", "bank", "dale",
    "moor", "ley", "ham", "bury", "thorne", "wich", "hollow", "bridge",
    "bourne", "shaw", "den", "stead", "grave", "lock", "mere"];
  const PBARE = ["Moss", "Flint", "Copper", "Storm", "Reed", "Birch", "Fen",
    "Heath", "Clover", "Gale", "Mist", "Penny", "Quill", "Raven", "Salt",
    "Vale", "Winter", "Yarrow", "Barrel", "Alder", "Bracken", "Dale"];
  function pastoralLast(r) {
    if (chance(r, 0.15)) return pick(r, PBARE);
    return cap(pick(r, PROOT).toLowerCase() + pick(r, PLAST)).slice(0, 16);
  }

  // ---------- Dawn (heaven): angel hearths keep dawn names, never pastoral ----
  const DAWN_V = ["Dewmere", "Cloudrest", "Haloholt", "Meadowlight", "Petalthorpe", "Brookmere", "Sunfield", "Mistral"];
  const DAWN_T = ["Radiance", "Dawnford", "Seraphine", "Hallowmere", "Lumenholt", "Choirgate", "Aurora", "Blessing"];
  const DAWN_C = ["Celestia", "Empyrean", "Halcyon", "Seraphopolis", "Dawnspire", "Luminara", "Elysia", "Paragon"];
  const DAWN_O = ["Dawnwatch", "Halowatch", "Auroragate"];
  const DAWNR = ["Dawn", "Radi", "Seraph", "Halo", "Lumen", "Auror", "Choir", "Bless", "Sun", "Morn", "Glor", "Elys", "Dew", "Brook", "Meadow", "Mist"];
  const DAWNE = ["mere", "rest", "holt", "light", "gate", "ford", "spire", "haven", "field", "song", "watch", "gard", "borne", "fall", "moor", "shire"];
  function dawnSettlement(r, tier) {
    // half the time a storied name, half a woven one (both stable per seed)
    if (r() < 0.5) {
      const p = tier === "city" ? DAWN_C : tier === "outpost" ? DAWN_O : tier === "village" ? DAWN_V : DAWN_T;
      return pick(r, p);
    }
    return (pick(r, DAWNR) + pick(r, DAWNE)).slice(0, 24);
  }
  const DAWNF = ["Auriel", "Seraph", "Lumen", "Dawnel", "Haliel", "Choriel", "Blessa", "Mirael", "Celeste", "Eviel", "Radian", "Gloriel", "Aurora", "Lumiel", "Seranna", "Morniel"];
  const DAWNL = ["Dawnward", "Lightborn", "Halobright", "Lumenglow", "Choirsong", "Aurorawatch", "Blessmark", "Morningsong", "Seraphwing", "Dewlight", "Cloudrest", "Hallowmere"];
  function dawnFirst(r) { return pick(r, DAWNF); }
  function dawnLast(r) { return pick(r, DAWNL); }
  // ---------- Heaven wilds: drifting dawn landforms, never barrows/moors ----
  const HWR = ["Cloud", "Dawn", "Mist", "Sunlit", "Halo", "Lumen", "High", "Soft", "Bright", "Pale"];
  const HWF = ["drift", "reach", "expanse", "garden", "fields", "veil", "acres", "meadow", "bank", "shoal"];
  function wildHeaven(seed) {
    const r = rng32(seed | 0);
    return (pick(r, HWR) + pick(r, HWF)).slice(0, 24);
  }

  // ---------- Desert souk ----------
  const DSON = ["za", "sa", "qa", "ra", "ma", "na", "ka", "sha", "sa", "am", "az", "um", "al", "ze", "su", "fa", "ha", "ja"];
  const DSVOW = ["a", "i", "u", "a", "ia", "ou"];
  const DSCODA = ["", "r", "n", "m", "d", "z", "ra", "na", "ir", "am", "im"];
  function desertFirst(r) { return cap((pick(r, DSON) + pick(r, DSVOW) + pick(r, DSCODA)).replace(/^./, c => c)).slice(0, 14); }
  const DSROOT = ["Amber", "Saffron", "Dune", "Sunspice", "Mirage", "Cinder", "Zephyr", "Sand", "Spice", "Ember", "Oasis", "Sirocco"];
  const DSEND = ["wash", "market", "hold", "bazaar", "gate", "spire", "souk", "ford", "rest"];
  function desertSettlement(r) { return (pick(r, DSROOT) + pick(r, DSEND)).slice(0, 24); }
  const DSLAST = ["Dunewalker", "Sunbrand", "Sandseer", "Spiceborn", "Miragewright", "Cinderjack", "Sirocco", "Oasisborn", "Zephyr", "Amberwright"];
  function desertLast(r) { return pick(r, DSLAST).slice(0, 16); }

  // ---------- Steppe ger ----------
  const STON = ["kha", "ba", "tu", "ma", "na", "te", "bo", "khu", "cha", "er", "ul", "gan"];
  function steppeFirst(r) { return cap(pick(r, STON) + pick(r, ["n", "r", "a", "ai", "oo", "en", "ar", "ul"])).slice(0, 14); }
  const STROOT = ["Windmane", "Khan", "Mare", "Skyherd", "Gallop", "Feltwind", "Horse", "OpenSky", "Tumen", "Ordu"];
  const STEND = ["camp", "steppe", "hold", "mere", "gate", "mane", "herd", "wind"];
  function steppeSettlement(r) { return (pick(r, STROOT) + pick(r, STEND)).slice(0, 24); }
  function steppeLast(r) { return (pick(r, ["Horse", "Wind", "Sky", "Mare", "Steppe", "Khan"]) + pick(r, ["rider", "born", "mane", "hoof", "wind", "herd"])).slice(0, 16); }

  // ---------- Mesa pueblo ----------
  const MSON = ["sa", "ta", "ka", "pa", "ma", "na", "tsi", "po", "ya", "wa", "ro", "chi"];
  function mesaFirst(r) { return cap(pick(r, MSON) + pick(r, ["a", "i", "o", "aya", "ona", "ima"])).slice(0, 14); }
  function mesaSettlement(r) { return (pick(r, ["Red", "Sunbaked", "Cliff", "Turquoise", "Canyon", "Adobe", "Eagle", "Painted"]) + pick(r, ["ledge", " Terrace", "shade", " Mesa", "hold", " Rest", "perch", " Rock"])).slice(0, 24); }
  function mesaLast(r) { return (pick(r, ["Cliff", "Redrock", "Sun", "Turquoise", "Canyon", "Adobe"]) + pick(r, ["shade", "walker", "born", "song", "rock", "dancer"])).slice(0, 16); }

  // ---------- Frost hold (Norse human) ----------
  const FRON = ["as", "bir", "fro", "ska", "tor", "ul", "sig", "eiri", "haf", "ing", "sno", "yll"];
  function frostFirst(r) { return cap(pick(r, FRON) + pick(r, ["a", "e", "i", "y", "ur", "ild", "olf", "unn"])).slice(0, 14); }
  function frostSettlement(r) { return (pick(r, ["Snow", "Ice", "Frost", "Winter", "Aurora", "Pinefrost", "Skald", "Glacier"]) + pick(r, ["mark", "braid", "lamp", "gate", "hold", "home", "rest", "fjord"])).slice(0, 24); }
  function frostLast(r) { return (pick(r, ["Snow", "Ice", "Storm", "Winter", "Frost", "Skald"]) + pick(r, ["born", "braid", "song", "beard", "mark", "ward"])).slice(0, 16); }

  // ---------- Trade city (grand mercantile) ----------
  function tradeSettlement(r) { return (pick(r, ["Gold", "High", "Grand", "Free", "Crown", "Ivory", "Silk", "Copper", "Amber", "Marble"]) + pick(r, ["market", "bazaar", "exchange", "emporium", "crossing", "harbor", "gate", "row"])).slice(0, 24); }
  // ---------- Port city ----------
  function portSettlement(r) { return (pick(r, ["Salt", "Tide", "Harbor", "Gull", "Anchor", "Keel", "Brine", "Coral", "Pearl", "Storm"]) + pick(r, ["port", "haven", "quay", "harbor", "mouth", "light", "watch", "reach"])).slice(0, 24); }
  // ---------- Capital ----------
  function capitalSettlement(r) { return (pick(r, ["Kings", "Crown", "Throne", "Sovereign", "Imperial", "Royal", "Elder", "High"]) + pick(r, ["reach", "hold", "gard", "spire", "throne", "crown", "haven", "burg"])).slice(0, 24); }
  function grandFirst(r) { return pastoralFirst(r); }
  function grandLast(r) { return pastoralLast(r); }

  // ---------- Wild regions (untamed land between hearths) ----------
  const WMOOD = ["Gloam", "Mist", "Thorn", "Ember", "Ashen", "Still", "Howling",
    "Whisper", "Barrow", "Foxglove", "Bramble", "Rook", "Cinder", "Hollow",
    "Stag", "Wren", "Moss", "Grim"];
  const WFORM = ["wood", "moor", "fens", "downs", "wold", "heath", "marsh",
    "hollow", "ridge", "vale", "copse", "mere", "fen", "thicket", "wilds",
    "field", "break", "weald"];
  function wild(r) {
    return (pick(r, WMOOD) + pick(r, WFORM)).slice(0, 24);
  }

  // ---------- public API (seeded, deterministic) ----------
  function settlement(type, seed) {
    const r = rng32(seed | 0);
    switch (type) {
      case "sakura": return sakuraSettlement(r);
      case "fortress": return fortressSettlement(r);
      case "watergate": return waterSettlement(r);
      case "city": return pastoralSettlement(r, "city");
      case "town": return pastoralSettlement(r, "town");
      case "village": return pastoralSettlement(r, "village");
      case "desert_souk": return desertSettlement(r);
      case "steppe_ger": return steppeSettlement(r);
      case "mesa_pueblo": return mesaSettlement(r);
      case "frost_hold": return frostSettlement(r);
      case "trade_city": return tradeSettlement(r);
      case "port_city": return portSettlement(r);
      case "capital": return capitalSettlement(r);
      case "angel_village": return dawnSettlement(r, "village");
      case "angel_town": return dawnSettlement(r, "town");
      case "angel_city": return dawnSettlement(r, "city");
      case "pantheon": return "Radiant Pantheon";
      case "pantheon_outpost": return dawnSettlement(r, "outpost");
      // the hell-heart castle is one named place, not a weaver roll —
      // every castle chunk shares it (same-settlement siblings are exempt
      // from uniquification, so all nine read the same).
      case "hell_castle": return "Dark Castle";
      default: return pastoralSettlement(r, "town");
    }
  }
  function npcFirst(type, seed) {
    const r = rng32(seed | 0);
    switch (type) {
      case "sakura": return sakuraFirst(r);
      case "fortress": return fortressFirst(r);
      case "watergate": return waterFirst(r);
      case "desert_souk": return desertFirst(r);
      case "steppe_ger": return steppeFirst(r);
      case "mesa_pueblo": return mesaFirst(r);
      case "frost_hold": return frostFirst(r);
      case "trade_city": case "port_city": case "capital": return grandFirst(r);
      case "angel_village": case "angel_town": case "angel_city": case "pantheon": case "pantheon_outpost": return dawnFirst(r);
      default: return pastoralFirst(r);
    }
  }
  function npcLast(type, seed) {
    const r = rng32((seed | 0) ^ 0x9E3779B9);
    switch (type) {
      case "sakura": return sakuraLast(r);
      case "fortress": return fortressLast(r);
      case "watergate": return waterLast(r);
      case "desert_souk": return desertLast(r);
      case "steppe_ger": return steppeLast(r);
      case "mesa_pueblo": return mesaLast(r);
      case "frost_hold": return frostLast(r);
      case "trade_city": case "port_city": case "capital": return grandLast(r);
      case "angel_village": case "angel_town": case "angel_city": case "pantheon": case "pantheon_outpost": return dawnLast(r);
      default: return pastoralLast(r);
    }
  }
  function npc(type, seed) {
    seed |= 0;
    return [npcFirst(type, seed), npcLast(type, seed)];
  }
  // ---------- Generic phonotactic fallback (consonant/vowel rules) ----------
  // Culture-neutral C/V weaving so we never repeat pools: onset + nucleus +
  // optional coda per syllable, 2 syllables for first names (3 at 20%),
  // root+suffix for places. Rules enforced: 1+ vowel, no 3 consonants in a
  // row, no 3 vowels in a row, q always qu, 3-12 chars, capitalized.
  // Deterministic via rng32(seed) — same seed always yields the same name.
  const PH_ON = ["b","br","c","cr","d","dr","f","fr","g","gr","h","j","k","l","m","n","p","pr","qu","r","s","sh","st","str","t","th","tr","v","w","y","z","ch","bl","cl","fl","gl","pl","sl","sk","sp"];
  const PH_NU = ["a","e","i","o","u","ai","ea","ee","oo","ou","a","e","i","o","u","a","e","o"];
  const PH_CO = ["","n","r","l","m","th","nd","rd","ld","rn","nn","ll","ss","sh","ck","rk","st","wn","ry","","","n","r","l"];
  const PH_PSUFFIX = ["ton","ham","ley","ford","mere","hold","gate","wick","bury","mouth","haven","shire","field","brook","stead","dale","moor","fell","holm","garde"];
  function phSyll(r) {
    let o = pick(r, PH_ON), n = pick(r, PH_NU), c = pick(r, PH_CO);
    if (o === "qu" && n.charAt(0) !== "a" && n.charAt(0) !== "e" && n.charAt(0) !== "i" && n.charAt(0) !== "o") n = "a" + n;
    return o + n + c;
  }
  function phClean(s, maxLen) {
    s = String(s || "").toLowerCase().replace(/[^a-z]/g, "");
    s = s.replace(/q(?!u)/g, "qu");
    // break 3-consonant runs by dropping the middle one, break 3-vowel runs likewise
    const isV = (c) => "aeiou".indexOf(c) >= 0;
    let out = "";
    for (const ch of s) {
      const L = out.length;
      if (L >= 2) {
        const a = out[L-2], b = out[L-1];
        if (!isV(a) && !isV(b) && !isV(ch)) continue; // skip 3rd consonant
        if (isV(a) && isV(b) && isV(ch)) continue; // skip 3rd vowel
      }
      out += ch;
    }
    if (!/[aeiou]/.test(out)) out = (out.slice(0, -1) || "b") + "a" + (out.slice(-1) || "n");
    return out.slice(0, maxLen || 12);
  }
  function phoneticFirst(seed) {
    const r = rng32(seed | 0);
    const nSyll = r() < 0.2 ? 3 : 2;
    let s = "";
    for (let i = 0; i < nSyll; i++) s += phSyll(r);
    s = phClean(s);
    if (s.length < 3) s += pick(r, ["a","o","en","in"]);
    return cap(s).slice(0, 12);
  }
  function phoneticLast(seed) {
    const r = rng32(((seed | 0) ^ 0x51F15EED) | 0);
    let s = phSyll(r) + phSyll(r);
    s = phClean(s);
    return cap(s).slice(0, 14);
  }
  function phoneticPlace(seed) {
    const r = rng32(((seed | 0) ^ 0x27D4EB2F) | 0);
    let root = phSyll(r);
    if (r() < 0.45) root += pick(r, PH_NU);
    const suf = pick(r, PH_PSUFFIX);
    // join across the root+suffix boundary with a buffer vowel when two
    // consonant edges would collide (keeps "brook"/"shire" readable instead
    // of the cleaner eating the suffix onset: "Frealdobrook", not "Frealdook")
    let join = root + suf;
    const trail = (root.match(/[^aeiou]+$/i) || [""])[0].length;
    const lead = (suf.match(/^[^aeiou]+/i) || [""])[0].length;
    if (trail + lead >= 3) join = root + "o" + suf;
    let s = cap(phClean(join, 16));
    if (r() < 0.12) s = pick(r, ["North ","South ","East ","West ","Upper ","Lower ","Old "]) + s;
    return s.slice(0, 24);
  }
  function phoneticWild(seed) {
    const r = rng32(((seed | 0) ^ 0x165667B1) | 0);
    return cap(phClean(phSyll(r) + phSyll(r))).slice(0, 18);
  }
  return { settlement, npc, npcFirst, npcLast, wild: (seed) => wild(rng32(seed | 0)), wildHeaven, phoneticFirst, phoneticLast, phoneticPlace, phoneticWild };
})();
