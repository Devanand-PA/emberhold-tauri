/* Heaven bestiary — gentle celestials + overworld bosses (window.HeavenMobs).
 * Row format mirrors hell_mobs: [key,name,hp,mp,atk,def,spd,xp,abilities,body,tint,mech,extra]
 * All heaven wilds are passive-unless-provoked (docile+passive) and heal the
 * player while calm (see game.js heaven tick). Provoke = repeated hits.
 */
window.HeavenMobs = (() => {
  const W = [
    ["dew_sprite", "Dew Sprite", 220, 120, 30, 10, 4.6, 300, ["heal", "cleanse", "dazzle"], "ghost", "#bfe8ff", "serene", { docile: 1 }],
    ["cloud_lamb", "Cloud Lamb", 280, 40, 32, 14, 3.2, 320, ["heal"], "beast", "#f4f0e8", "serene", { docile: 1, tamable: 1 }],
    ["halo_finch", "Halo Finch", 180, 80, 28, 8, 5.6, 290, ["dazzle", "heal"], "winged", "#ffe9a0", "serene", { docile: 1 }],
    ["petal_drake", "Petal Drake", 320, 100, 36, 14, 4.2, 380, ["heal", "tideburst"], "winged", "#ffb0d0", "serene", { docile: 1 }],
    ["sunbloom_tender", "Sunbloom Tender", 260, 150, 30, 12, 3.4, 360, ["heal", "panacea"], "humanoid", "#ffd34e", "serene", { docile: 1 }],
    ["mist_choir", "Mist Choir", 240, 160, 30, 10, 3.6, 370, ["heal", "dazzle", "cleanse"], "ghost", "#d8f0ff", "serene", { docile: 1 }],
    ["brook_seraph", "Brook Seraph", 300, 140, 34, 12, 4.0, 390, ["heal", "tideburst", "cleanse"], "humanoid", "#7ac8ff", "serene", { docile: 1 }],
    ["orchard_wisp", "Orchard Wisp", 200, 140, 28, 8, 4.8, 330, ["heal", "fireball"], "ghost", "#c8ffb0", "serene", { docile: 1 }],
    ["gilded_stag", "Gilded Stag", 380, 60, 40, 18, 4.4, 420, ["heal", "whirlwind"], "beast", "#e8d090", "serene", { docile: 1, tamable: 1 }],
    ["cumulus_manta", "Cumulus Manta", 340, 110, 34, 14, 4.0, 400, ["heal", "glacier"], "winged", "#ffffff", "serene", { docile: 1 }],
    ["dawn_pilgrim", "Dawn Pilgrim", 280, 150, 32, 12, 3.4, 380, ["heal", "smite", "cleanse"], "humanoid", "#f7f3ea", "serene", { docile: 1 }],
    ["lumen_cub", "Lumen Cub", 300, 60, 36, 14, 4.6, 370, ["heal", "whirlwind"], "beast", "#fff2c0", "serene", { docile: 1, tamable: 1 }],
  ];
  // Bosses: passive overworld bosses. Peter-tier stats handled in mock battle separately.
  const B = [
    ["divine_dragon", "Divine Dragon", 5800, 400, 70, 5, 3.4, 1700, ["whiteout", "heal", "panacea", "smite"], "winged", "#ffe9a0", 10, ["dawn"], ["nova", "beam"], "🌅 Bask, little one."],
    ["celestial_messenger", "Celestial Messenger", 5600, 420, 64, 4, 4.4, 1550, ["smite", "dazzle", "heal", "angel_of_life"], "winged", "#fffdf6", 10, ["dawn"], ["beam", "charm"], "📯 The dawn sends regards."],
    ["reservoir_leviathan", "Reservoir Leviathan", 7050, 300, 68, 5, 3.0, 1600, ["tideburst", "heal", "panacea"], "serpent", "#7ac8ff", 11, ["dawn"], ["tide", "nova"], "🌊 Drink deep, and be calm."],
    ["seraph_regent", "Seraph Regent", 6650, 380, 66, 4, 3.8, 1580, ["smite", "whiteout", "heal", "panacea"], "humanoid", "#f6d34e", 11, ["dawn"], ["beam", "white"], "👑 Kneel — gently."],
  ];
  const ROLE_ANGEL = {
    angel_guard: "seraph_guard", civilized_angel: "dawn_angel",
    angel_merchant: "dawn_angel", angel_priest: "choir_angel",
  };
  const RESIDENT_LOOK = { guard: "seraph_guard", healer: "choir_angel", scholar: "scroll_angel" };
  const RESIDENT_POOL = ["dawn_angel", "choir_angel", "seraph_guard"];
  function residentLookFor(role, seedStr) {
    try {
      if (ROLE_ANGEL[role]) return ROLE_ANGEL[role];
      if (RESIDENT_LOOK[role]) return RESIDENT_LOOK[role];
      let h = 2166136261; const s = String(seedStr == null ? role : seedStr);
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return RESIDENT_POOL[(h >>> 0) % RESIDENT_POOL.length];
    } catch (e) { return "dawn_angel"; }
  }
  const POOLS = {
    heaven_cloud: ["dew_sprite", "cloud_lamb", "halo_finch", "cumulus_manta", "lumen_cub", "mist_choir"],
    heaven_meadow: ["cloud_lamb", "gilded_stag", "lumen_cub", "sunbloom_tender", "dawn_pilgrim", "halo_finch"],
    heaven_grove: ["petal_drake", "orchard_wisp", "sunbloom_tender", "gilded_stag", "mist_choir", "dew_sprite"],
    heaven_lake: ["brook_seraph", "cumulus_manta", "dew_sprite", "orchard_wisp", "halo_finch", "mist_choir"],
    heaven_bloom: ["petal_drake", "halo_finch", "sunbloom_tender", "orchard_wisp", "mist_choir", "dew_sprite"],
    heaven_mist: ["mist_choir", "dew_sprite", "orchard_wisp", "halo_finch", "cumulus_manta", "dawn_pilgrim"],
    heaven_pasture: ["cloud_lamb", "gilded_stag", "lumen_cub", "dawn_pilgrim", "halo_finch", "sunbloom_tender"],
  };
  function install() {
    try {
      const C = window.CFG;
      if (!C || !C.MOB_TEMPLATES) return false;
      const T = C.MOB_TEMPLATES;
      for (const r of W) {
        const [key, name, hp, mp, atk, def, spd, xp, abs, body, tint, mech, _ex] = r;
        T[key] = { name, hp, mp, atk, def, spd, xp, abilities: abs.slice(), tint, body, heavenMech: mech, passive: true, docile: true };
        if ((_ex || {}).tamable) T[key].tamable = true;
      }
      // civilized angels: docile spectator bodies (mock-battle watchers) —
      // never wild-spawn (not in POOLS), shown in the codex like townsfolk.
      try {
        const ANG = [
          ["dawn_angel", "Dawn Angel", 900, 300, 55, 22, 4.2, ["smite", "heal", "cleanse"], "humanoid", "#ffe9a0"],
          ["choir_angel", "Choir Angel", 850, 320, 50, 20, 3.6, ["heal", "panacea", "dazzle"], "humanoid", "#eef6f2"],
          ["seraph_guard", "Seraph Guard", 1050, 220, 62, 28, 3.8, ["smite", "shieldwall", "whirlwind"], "humanoid", "#f2e2a0"],
          ["scroll_angel", "Scroll Angel", 800, 340, 48, 18, 3.4, ["smite", "heal", "dazzle"], "humanoid", "#f2eee4"],
        ];
        for (const a of ANG) {
          T[a[0]] = { name: a[1], hp: a[2], mp: a[3], atk: a[4], def: a[5], spd: a[6], xp: 0, abilities: a[7].slice(), tint: a[9], body: a[8], heavenMech: "serene", passive: true, docile: true, civilized: true };
        }
      } catch (e) { }
      for (const r of B) {
        const [key, name, hp, mp, atk, def, spd, xp, abs, body, tint, minEff, themes, tricks, say] = r;
        T[key] = { name, hp, mp, atk, def, spd, xp, abilities: abs.slice(), tint, body, boss: true, passive: true, docile: true, heavenBoss: true, bossMech: tricks.slice(), bossSay: say };
        // the reservoir's own horror lives IN the water and dives like its
        // deep-delve cousin (spawns only in large reservoirs — see spawnMobsForChunk)
        if (key === "reservoir_leviathan") { T[key].aquatic = true; T[key].diver = true; }
        if (!C.BOSS_KINDS) C.BOSS_KINDS = [];
        if (!C.HEAVEN_BOSS_KINDS) C.HEAVEN_BOSS_KINDS = [];
        if (!C.BOSS_KINDS.includes(key)) C.BOSS_KINDS.push(key);
        if (!C.HEAVEN_BOSS_KINDS.includes(key)) C.HEAVEN_BOSS_KINDS.push(key);
        if (C.BOSS_MIN_EFF) C.BOSS_MIN_EFF[key] = (minEff | 0);
        if (C.BOSS_THEMES) C.BOSS_THEMES[key] = themes.slice();
      }
      try {
        const F = C.FEMALE_KINDS || [], G = C.GENDERLESS_KINDS || [];
        for (const k of ["celestial_messenger", "seraph_regent", "brook_seraph", "dawn_pilgrim", "mist_choir"]) if (!F.includes(k)) F.push(k);
        for (const k of ["dew_sprite", "orchard_wisp", "mist_choir", "cumulus_manta"]) if (!G.includes(k)) G.push(k);
      } catch (e) {}
      try {
        if (C.ROLE_TINT) {
          C.ROLE_TINT.angel_guard = "#fff2c0"; C.ROLE_TINT.angel_merchant = "#ffe9a0"; C.ROLE_TINT.angel_priest = "#fffdf6";
        }
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  return { install, residentLookFor, ROLE_ANGEL, POOLS, WILD: W.map(r => r[0]), BOSSES: B.map(r => r[0]) };
})();
try { window.HeavenMobs.install(); } catch (e) {}
