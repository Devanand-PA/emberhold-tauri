/* Hell bestiary — 60 wild fiends + settlement warden + 30 warlords (v17).
 * window.HellMobs. Loads after config.js + hell.js; merges templates, boss
 * rosters, gender lists and look/behavior tables into window.CFG.
 * Row format: [key, name, hp, mp, atk, def, spd, xp, abilities, body, tint, mech, extra]
 * mech: wild behavior tag read by game.js hellMobTick.
 * extra: {summon, tamable, docile, lavaBorn, undead, minEff, themes, tricks, say, frail, weak, sex}
 */
window.HellMobs = (() => {
  const W = [
    // ---- ASH family (hell_ash) ----
    ["cinder_imp", "Cinder Imp", 200, 60, 30, 8, 4.6, 260, ["fireball", "ember_weapon"], "beast", "#c9401e", "frenzy", {}],
    ["ash_wraith", "Ash Wraith", 170, 120, 28, 6, 4.0, 280, ["frostbite", "dazzle"], "ghost", "#8a8078", "blink", {}],
    ["ember_crawler", "Ember Crawler", 230, 20, 32, 10, 3.4, 270, ["immolate"], "beast", "#b33a12", "aura", { lavaBorn: 1 }],
    ["soot_bat", "Soot Bat", 150, 40, 26, 6, 5.4, 240, ["dazzle", "venom"], "winged", "#3a3230", "blink", {}],
    ["crag_fiend", "Crag Fiend", 300, 30, 36, 14, 3.0, 330, ["whirlwind"], "brute", "#6a4a3a", "frenzy", {}],
    ["slag_serpent", "Slag Serpent", 240, 50, 34, 12, 4.4, 320, ["venom", "fireball"], "serpent", "#7a2a10", "thorns", { lavaBorn: 1 }],
    ["ash_hound", "Ash Hound", 260, 20, 34, 10, 5.0, 300, ["whirlwind"], "beast", "#5a4a42", "frenzy", { tamable: 1 }],
    ["ember_swarm", "Ember Swarm", 180, 60, 30, 8, 5.8, 290, ["fireball"], "swarm", "#ff7a2a", "split", {}],
    ["charred_colossus", "Charred Colossus", 420, 40, 42, 20, 2.4, 450, ["whirlwind", "shieldwall"], "construct", "#2a2222", "thorns", { lavaBorn: 1 }],
    ["cinder_wisp", "Cinder Wisp", 160, 140, 30, 6, 4.8, 300, ["immolate", "fireball"], "ghost", "#ffb35a", "aura", {}],
    ["ash_mother", "Ash Mother", 340, 120, 34, 12, 3.0, 400, ["fireball", "heal"], "brute", "#7a5a4a", "summon", { summon: "cinder_imp" }],
    ["soot_stalker", "Soot Stalker", 250, 60, 34, 10, 5.0, 340, ["shadowstep", "grapple"], "beast", "#2e2a28", "blink", {}],
    // ---- BLOOD family (hell_blood) ----
    ["gore_hound", "Gore Hound", 280, 20, 36, 12, 5.2, 330, ["whirlwind"], "beast", "#8a0a1a", "leech", { tamable: 1, mount: { speed: 1.65, swim: false } }],
    ["sanguine_horror", "Sanguine Horror", 300, 100, 34, 12, 3.6, 360, ["venom", "immolate"], "brute", "#a01222", "leech", {}],
    ["vein_lurker", "Vein Lurker", 220, 80, 32, 10, 4.2, 330, ["grapple", "venom"], "serpent", "#7a1030", "burrow", { burrower: 1 }],
    ["crimson_bat", "Crimson Bat", 170, 60, 28, 8, 5.6, 280, ["dazzle", "venom"], "winged", "#c01a3a", "leech", {}],
    ["exsanguinator", "Exsanguinator", 320, 120, 36, 12, 3.8, 390, ["venom", "immolate", "heal"], "humanoid", "#d42a4a", "leech", {}],
    ["pulse_fiend", "Pulse Fiend", 240, 100, 32, 10, 4.4, 350, ["lightning", "thunder_hex"], "ghost", "#ff4a6a", "blink", {}],
    ["clot_brute", "Clot Brute", 380, 30, 40, 18, 2.8, 420, ["whirlwind", "warcry"], "brute", "#5a0a14", "warcry", {}],
    ["artery_serpent", "Artery Serpent", 260, 60, 34, 12, 4.6, 350, ["venom", "tideburst"], "serpent", "#b01a2a", "split", {}],
    ["blood_monk", "Blood Monk", 250, 150, 32, 10, 3.8, 370, ["dazzle", "heal", "cleanse"], "humanoid", "#8a1a2a", "charm", {}],
    ["bleed_mother", "Bleed Mother", 340, 140, 36, 14, 3.2, 410, ["venom", "heal", "panacea"], "brute", "#6a0a1c", "summon", { summon: "crimson_bat" }],
    ["coagulus", "Coagulus", 310, 50, 36, 16, 2.6, 380, ["shieldwall", "grapple"], "blob", "#7a1420", "thorns", {}],
    ["hemorrhage", "Hemorrhage", 230, 90, 32, 10, 4.8, 340, ["water_jet", "venom"], "blob", "#c22a3a", "split", {}],
    // ---- OBSIDIAN family (hell_obsidian) ----
    ["obsidian_shard", "Obsidian Shard", 260, 60, 36, 16, 3.2, 350, ["whirlwind"], "construct", "#1a1622", "thorns", {}],
    ["glass_maw", "Glass Maw", 300, 40, 38, 14, 3.6, 370, ["grapple", "whirlwind"], "beast", "#2a2438", "frenzy", {}],
    ["blackglass_serpent", "Blackglass Serpent", 270, 70, 36, 14, 4.8, 370, ["lightning", "venom"], "serpent", "#241e33", "thorns", {}],
    ["obsidian_golem", "Obsidian Golem", 480, 50, 44, 24, 2.2, 500, ["shieldwall", "whirlwind"], "construct", "#14101c", "warcry", { lavaBorn: 1 }],
    ["shard_swarm", "Shard Swarm", 190, 50, 30, 10, 5.6, 300, ["dazzle"], "swarm", "#3a3450", "split", {}],
    ["mirror_fiend", "Mirror Fiend", 250, 130, 34, 10, 4.2, 370, ["dazzle", "shadowstep", "lightning"], "humanoid", "#8a86a8", "blink", {}],
    ["glasswing", "Volcanic Glasswing", 220, 60, 32, 10, 5.4, 340, ["fireball", "immolate"], "winged", "#4a3a5a", "aura", { lavaBorn: 1 }],
    ["obsidian_prophet", "Obsidian Prophet", 240, 170, 32, 12, 3.6, 390, ["thunder_hex", "dazzle", "heal"], "humanoid", "#2e2844", "charm", {}],
    ["shard_ravager", "Shard Ravager", 350, 60, 40, 16, 3.8, 430, ["whirlwind", "ember_weapon"], "brute", "#1e1a2a", "frenzy", {}],
    ["glass_spider", "Glass Spider", 230, 60, 34, 12, 4.6, 360, ["venom", "grapple"], "swarm", "#463e5e", "burrow", { burrower: 1 }],
    ["vitrifier", "Vitrifier", 330, 110, 36, 14, 3.2, 400, ["glacier", "dazzle"], "construct", "#322a48", "aura", {}],
    ["razor_choir", "Razor Choir", 260, 140, 32, 10, 3.6, 380, ["dazzle", "thunder_hex"], "ghost", "#5a5078", "warcry", {}],
    // ---- BONE family (hell_bone) ----
    ["marrow_eater", "Marrow Eater", 270, 40, 36, 12, 4.0, 350, ["whirlwind", "venom"], "beast", "#cfc4b0", "leech", {}],
    ["ossuary_crawler", "Ossuary Crawler", 300, 30, 38, 16, 2.8, 380, ["shieldwall"], "construct", "#b8ac96", "thorns", {}],
    ["skull_swarm", "Skull Swarm", 170, 40, 28, 8, 5.8, 290, ["dazzle"], "swarm", "#ddd4c0", "split", {}],
    ["gravewing", "Gravewing", 230, 70, 32, 10, 5.2, 350, ["frostbite", "thunder_hex"], "winged", "#9a9080", "blink", {}],
    ["bone_collector", "Bone Collector", 330, 80, 38, 14, 3.2, 400, ["venom", "heal"], "brute", "#c4b89e", "summon", { summon: "skull_swarm" }],
    ["calcium_horror", "Calcium Horror", 290, 110, 34, 12, 3.4, 380, ["glacier", "frostbite"], "ghost", "#e2d8c2", "aura", {}],
    ["marrow_mage", "Marrow Mage", 220, 160, 32, 10, 3.6, 390, ["lightning", "thunder_hex", "dazzle"], "humanoid", "#d8cdb4", "charm", {}],
    ["ribcage_walker", "Ribcage Walker", 360, 40, 40, 18, 2.6, 430, ["whirlwind", "warcry"], "construct", "#c9bfa8", "warcry", {}],
    ["ossuary_hound", "Ossuary Hound", 280, 20, 36, 12, 5.2, 350, ["whirlwind"], "beast", "#bfb49c", "frenzy", { tamable: 1 }],
    ["chalk_wraith", "Chalk Wraith", 240, 130, 32, 10, 4.0, 370, ["dazzle", "heal"], "ghost", "#e8e0cc", "blink", {}],
    ["ivory_tyrantkin", "Ivory Tyrantkin", 370, 70, 40, 16, 3.0, 430, ["shieldwall", "venom"], "brute", "#d5c9ae", "thorns", {}],
    ["reliquary", "Reliquary", 250, 150, 32, 12, 3.0, 390, ["smite", "heal"], "construct", "#cabb9c", "summon", { summon: "skull_swarm" }],
    // ---- FLESH family (hell_flesh) ----
    ["flesh_mound", "Flesh Mound", 420, 60, 40, 16, 2.4, 430, ["whirlwind", "venom"], "blob", "#a04a5a", "thorns", {}],
    ["gut_lurker", "Gut Lurker", 260, 60, 34, 12, 4.4, 360, ["grapple", "venom"], "serpent", "#8a3a4a", "burrow", { burrower: 1 }],
    ["sinew_stalker", "Sinew Stalker", 280, 80, 36, 12, 5.0, 370, ["shadowstep", "grapple"], "beast", "#b05a5a", "blink", {}],
    ["maw_walker", "Maw Walker", 340, 70, 38, 14, 3.4, 400, ["whirlwind", "immolate"], "brute", "#93323e", "frenzy", {}],
    ["bile_spitter", "Bile Spitter", 240, 100, 34, 10, 3.8, 370, ["venom", "water_jet"], "blob", "#7a8a2a", "summon", { summon: "organ_swarm" }],
    ["organ_swarm", "Organ Swarm", 190, 70, 30, 8, 5.6, 310, ["venom"], "swarm", "#a05a6a", "split", {}],
    ["skin_thief", "Skin Thief", 270, 120, 34, 10, 4.4, 380, ["dazzle", "shadowstep"], "humanoid", "#c08a8a", "charm", {}],
    ["muscle_brute", "Muscle Brute", 400, 40, 44, 18, 3.0, 450, ["whirlwind", "ember_weapon"], "brute", "#8a2a2a", "warcry", {}],
    ["flesh_oracle", "Flesh Oracle", 250, 170, 34, 12, 3.4, 390, ["heal", "venom", "thunder_hex"], "humanoid", "#b06a7a", "summon", { summon: "organ_swarm" }],
    ["gullet_worm", "Gullet Worm", 300, 50, 36, 14, 3.8, 380, ["venom", "grapple"], "serpent", "#7a2a3a", "burrow", { burrower: 1 }],
    ["pulse_mass", "Pulse Mass", 380, 90, 38, 14, 2.8, 420, ["heal", "venom"], "blob", "#963a4e", "leech", {}],
    ["flayed_saint", "Flayed Saint", 260, 160, 34, 10, 3.6, 390, ["dazzle", "panacea"], "humanoid", "#d09a9a", "charm", {}],
  ];
  // Bosses: [key, name, hp, mp, atk, def, spd, xp, abilities, body, tint, minEff, themes, tricks, say]
  const B = [
    ["ash_tyrant", "Ash Tyrant", 5550, 240, 62, 4, 3.2, 1350, ["meteorfall", "immolate", "whirlwind", "heal"], "brute", "#4a3430", 10, ["inferno"], ["meteor", "nova"], "🔥 Kneel in the ash!"],
    ["cinder_emperor", "Cinder Emperor", 6625, 280, 66, 4, 3.0, 1450, ["meteorfall", "ember_weapon", "warcry", "heal", "panacea"], "brute", "#6a2a10", 11, ["inferno"], ["meteor", "adds"], "🔥 The ember court rises!"],
    ["magma_mauler", "Magma Mauler", 5700, 180, 72, 5, 2.8, 1500, ["immolate", "whirlwind", "shieldwall", "heal"], "construct", "#3a1a08", 10, ["inferno"], ["nova", "adds"], "🌋 The floor is mine!"],
    ["pyre_queen", "Pyre Queen", 5500, 380, 60, 3, 4.0, 1400, ["meteorfall", "dazzle", "fireball", "panacea"], "humanoid", "#ff4a1a", 10, ["inferno", "flesh"], ["meteor", "charm"], "🔥 Burn beautifully!"],
    ["slag_colossus", "Slag Colossus", 7050, 150, 70, 6, 2.4, 1550, ["whirlwind", "shieldwall", "immolate", "heal"], "construct", "#241a12", 11, ["inferno"], ["quake", "adds"], "🪨 CRACK!"],
    ["ember_inquisitor", "Ember Inquisitor", 5475, 360, 62, 3, 3.8, 1400, ["immolate", "thunder_hex", "dazzle", "panacea", "heal"], "humanoid", "#8a3a0a", 10, ["inferno", "abyss"], ["charm", "beam"], "🔥 Confess in flame!"],
    ["char_king", "Char King", 6650, 260, 68, 5, 3.0, 1500, ["meteorfall", "warcry", "whirlwind", "heal"], "brute", "#1e1410", 11, ["inferno"], ["meteor", "nova"], "👑 Ashes to ashes!"],
    ["volcano_pontiff", "Volcano Pontiff", 6525, 420, 60, 4, 3.4, 1450, ["meteorfall", "tideburst", "heal", "angel_of_life"], "humanoid", "#5a1e04", 11, ["inferno", "flesh"], ["meteor", "tide"], "🌋 Erupt in praise!"],
    ["void_prelate", "Void Prelate", 5500, 400, 60, 3, 3.8, 1400, ["energy_beam", "dazzle", "shadowstep", "heal"], "humanoid", "#1a0a2e", 10, ["abyss"], ["beam", "blink"], "🕳️ The dark sees you."],
    ["umbral_matriarch", "Umbral Matriarch", 5525, 380, 62, 3, 4.2, 1450, ["dazzle", "venom", "thunder_hex", "panacea", "heal"], "humanoid", "#2a1040", 10, ["abyss"], ["charm", "adds"], "💜 Come closer, little spark."],
    ["gloom_sovereign", "Gloom Sovereign", 6675, 300, 68, 4, 3.2, 1500, ["energy_beam", "whiteout", "dazzle", "heal"], "brute", "#120a20", 11, ["abyss"], ["beam", "nova"], "🌑 Light dies here."],
    ["rift_eater", "Rift Eater", 5600, 320, 66, 4, 3.6, 1480, ["shadowstep", "whirlwind", "energy_beam", "heal"], "serpent", "#22103a", 10, ["abyss"], ["blink", "beam"], "🌀 I am the crack between!"],
    ["nether_abbess", "Nether Abbess", 5490, 420, 58, 3, 3.6, 1420, ["panacea", "thunder_hex", "dazzle", "heal", "whiteout"], "humanoid", "#3a1a50", 10, ["abyss", "mirror"], ["charm", "white"], "⛪ Pray into the hole."],
    ["mirror_abbot", "Mirror Abbot", 6550, 360, 62, 4, 3.4, 1450, ["dazzle", "energy_beam", "glacier", "heal", "panacea"], "humanoid", "#6a6a90", 11, ["abyss", "mirror"], ["beam", "adds"], "🪞 I am every you."],
    ["eventide_horror", "Eventide Horror", 7025, 280, 70, 5, 2.8, 1550, ["whiteout", "whirlwind", "dazzle", "heal"], "construct", "#0e0a18", 11, ["abyss"], ["white", "nova"], "🌆 Dusk never ends."],
    ["hollow_cantor", "Hollow Cantor", 5475, 400, 60, 3, 3.2, 1400, ["warcry", "thunder_hex", "energy_beam", "heal"], "ghost", "#33224e", 10, ["abyss", "flesh"], ["quake", "charm"], "🎵 Sing the hollow note!"],
    ["gore_patriarch", "Gore Patriarch", 5675, 260, 68, 5, 3.0, 1500, ["venom", "immolate", "whirlwind", "heal", "panacea"], "brute", "#5a0812", 10, ["flesh"], ["nova", "adds"], "🩸 Bleed for the family!"],
    ["maw_primogenitor", "Maw Primogenitor", 5750, 220, 72, 5, 2.8, 1580, ["grapple", "venom", "whirlwind", "heal"], "blob", "#7a1020", 10, ["flesh"], ["adds"], "👄 Feed me first!"],
    ["flesh_sculptor", "Flesh Sculptor", 5525, 380, 62, 4, 3.4, 1450, ["heal", "panacea", "venom", "dazzle"], "humanoid", "#a05a6a", 10, ["flesh"], ["adds", "charm"], "🎨 You'd look better opened."],
    ["organ_choirmaster", "Organ Choirmaster", 5500, 400, 58, 3, 3.2, 1420, ["warcry", "venom", "tideburst", "heal"], "ghost", "#8a4a5a", 10, ["flesh"], ["quake", "adds"], "🎶 A choir of guts!"],
    ["bile_cardinal", "Bile Cardinal", 5550, 360, 62, 4, 3.4, 1450, ["venom", "water_jet", "tideburst", "panacea", "heal"], "humanoid", "#5a6a1a", 10, ["flesh"], ["tide", "adds"], "🤢 Hurl with me!"],
    ["sinew_despot", "Sinew Despot", 6650, 240, 70, 5, 4.0, 1500, ["grapple", "shadowstep", "whirlwind", "heal"], "beast", "#93302e", 11, ["flesh"], ["blink", "nova"], "💪 Taut and terrible!"],
    ["skin_pope", "Skin Pope", 6510, 420, 60, 4, 3.2, 1450, ["dazzle", "panacea", "angel_of_life", "smite"], "humanoid", "#c09a8a", 11, ["flesh", "crypt"], ["charm", "beam"], "🙏 Wear your Sunday best — mine."],
    ["gut_empress", "Gut Empress", 7000, 300, 66, 4, 3.0, 1550, ["venom", "grapple", "whiteout", "heal", "panacea"], "serpent", "#6a1a2a", 11, ["flesh"], ["adds", "white"], "👸 The womb provides teeth."],
    ["dread_masticator", "Dread Masticator", 7025, 200, 74, 5, 3.2, 1600, ["whirlwind", "grapple", "immolate", "heal"], "construct", "#4a0e18", 11, ["flesh", "inferno"], ["quake", "nova"], "🦷 CHEW!"],
    ["blood_evangel", "Blood Evangel", 6540, 400, 62, 4, 3.6, 1480, ["venom", "smite", "tideburst", "heal", "panacea"], "humanoid", "#a01228", 11, ["flesh", "abyss"], ["tide", "beam"], "📖 The good news is red."],
    ["marrow_sovereign", "Marrow Sovereign", 6680, 320, 66, 5, 3.0, 1520, ["whirlwind", "venom", "shieldwall", "heal", "panacea"], "construct", "#e8e0cc", 10, ["abyss", "flesh"], ["adds", "nova"], "🦴 Kneel — the ossuary provides."],
  ];
  // params: [skin, dark, build, horns, wings, tail, crack, eyes]
  // build: H humanoid B bulky/brute Q quadruped W winged S serpent M swarm G ghost O blob C construct U undead
  // horns 0-4 (0 none 1 nubs 2 curved 3 long 4 crown) wings 0/1/2 tail 0/1/2
  const LOOKS = {
    cinder_imp: ["#c9401e", "#5a1a08", "Q", 1, 0, 1, "#ff7a2a", "#ffe14d"],
    ash_wraith: ["#8a8078", "#3a3632", "G", 0, 0, 0, null, "#ff6a3a"],
    ember_crawler: ["#b33a12", "#4a1408", "Q", 0, 0, 0, "#ff9a3a", "#ffe14d"],
    soot_bat: ["#3a3230", "#141112", "W", 1, 1, 0, null, "#ff3b3b"],
    crag_fiend: ["#6a4a3a", "#2a1c16", "B", 2, 0, 0, "#ff6a2a", "#ffd93d"],
    slag_serpent: ["#7a2a10", "#2e0e04", "S", 1, 0, 0, "#ffb35a", "#ffe14d"],
    ash_hound: ["#5a4a42", "#241e1a", "Q", 0, 0, 1, null, "#ff8a3a"],
    ember_swarm: ["#ff7a2a", "#7a2a08", "M", 0, 1, 0, null, "#fff06a"],
    charred_colossus: ["#2a2222", "#0a0808", "C", 3, 0, 0, "#ff5a1a", "#ff3b3b"],
    cinder_wisp: ["#ffb35a", "#7a4a1a", "G", 1, 0, 1, null, "#fff"],
    ash_mother: ["#7a5a4a", "#2e201a", "B", 2, 1, 1, "#ff7a2a", "#ffd93d"],
    soot_stalker: ["#2e2a28", "#0c0a0a", "Q", 2, 0, 2, null, "#c9a0ff"],
    gore_hound: ["#8a0a1a", "#2e0408", "Q", 1, 0, 2, "#ff2a4a", "#ffe14d"],
    sanguine_horror: ["#a01222", "#38060c", "B", 3, 1, 2, "#ff4a5a", "#fff"],
    vein_lurker: ["#7a1030", "#26040e", "S", 0, 0, 0, "#ff5a7a", "#ffe14d"],
    crimson_bat: ["#c01a3a", "#400612", "W", 1, 1, 1, null, "#fff06a"],
    exsanguinator: ["#d42a4a", "#480e18", "H", 4, 1, 1, null, "#fff"],
    pulse_fiend: ["#ff4a6a", "#5a1626", "G", 2, 0, 0, null, "#fff"],
    clot_brute: ["#5a0a14", "#1c0406", "B", 1, 0, 0, "#c01a3a", "#ffd93d"],
    artery_serpent: ["#b01a2a", "#3c0810", "S", 2, 0, 1, "#ff6a7a", "#fff06a"],
    blood_monk: ["#8a1a2a", "#2c0810", "H", 1, 0, 0, null, "#ffd93d"],
    bleed_mother: ["#6a0a1c", "#22040a", "B", 3, 1, 2, "#ff3a5a", "#fff"],
    coagulus: ["#7a1420", "#28060c", "O", 0, 0, 0, null, "#ffe14d"],
    hemorrhage: ["#c22a3a", "#420c14", "O", 1, 0, 0, "#ff6a7a", "#fff"],
    obsidian_shard: ["#1a1622", "#060408", "C", 0, 0, 0, "#8a7bff", "#c9c2ff"],
    glass_maw: ["#2a2438", "#0c0a14", "Q", 2, 0, 1, "#b0a6ff", "#fff"],
    blackglass_serpent: ["#241e33", "#0a0812", "S", 1, 0, 0, "#9a8bff", "#c9c2ff"],
    obsidian_golem: ["#14101c", "#050308", "C", 3, 0, 0, "#7a6bff", "#fff"],
    shard_swarm: ["#3a3450", "#121020", "M", 0, 1, 0, null, "#d0c8ff"],
    mirror_fiend: ["#8a86a8", "#32304a", "H", 2, 1, 0, null, "#fff"],
    glasswing: ["#4a3a5a", "#181222", "W", 0, 1, 1, "#b09aff", "#ffe14d"],
    obsidian_prophet: ["#2e2844", "#0e0c1a", "H", 4, 1, 1, "#8a7bff", "#d0c8ff"],
    shard_ravager: ["#1e1a2a", "#080610", "B", 3, 1, 2, "#9a8bff", "#ff3b3b"],
    glass_spider: ["#463e5e", "#161222", "Q", 0, 0, 0, null, "#ff3b3b"],
    vitrifier: ["#322a48", "#100c1c", "C", 2, 0, 0, "#6af2ff", "#fff"],
    razor_choir: ["#5a5078", "#1c1828", "G", 0, 2, 0, null, "#d0c8ff"],
    marrow_eater: ["#cfc4b0", "#6a6050", "Q", 1, 0, 1, null, "#ff3b3b"],
    ossuary_crawler: ["#b8ac96", "#5c5648", "C", 2, 0, 0, null, "#1a1a1a"],
    skull_swarm: ["#ddd4c0", "#7a7260", "M", 1, 1, 0, null, "#ff3b3b"],
    gravewing: ["#9a9080", "#45403a", "W", 1, 1, 1, null, "#7a2bff"],
    bone_collector: ["#c4b89e", "#5e5646", "B", 3, 0, 1, null, "#ff3b3b"],
    calcium_horror: ["#e2d8c2", "#8a8070", "G", 0, 0, 0, null, "#7ac4ff"],
    marrow_mage: ["#d8cdb4", "#7a6f5c", "H", 2, 0, 0, null, "#7a2bff"],
    ribcage_walker: ["#c9bfa8", "#655c4c", "C", 3, 1, 0, null, "#ff8a3a"],
    ossuary_hound: ["#bfb49c", "#5b5344", "Q", 0, 0, 2, null, "#ffd93d"],
    chalk_wraith: ["#e8e0cc", "#8e8472", "G", 1, 0, 0, null, "#ff3b3b"],
    ivory_tyrantkin: ["#d5c9ae", "#6b6152", "B", 4, 1, 1, null, "#ff8a3a"],
    reliquary: ["#cabb9c", "#62563f", "C", 1, 0, 0, "#ffd93d", "#1a1a1a"],
    flesh_mound: ["#a04a5a", "#482028", "O", 0, 0, 0, null, "#ffe14d"],
    gut_lurker: ["#8a3a4a", "#3c1620", "S", 0, 0, 0, null, "#ff8a5a"],
    sinew_stalker: ["#b05a5a", "#4e2424", "Q", 2, 0, 2, "#ff8a7a", "#fff"],
    maw_walker: ["#93323e", "#40141c", "B", 2, 0, 1, null, "#ffd93d"],
    bile_spitter: ["#7a8a2a", "#323a0c", "O", 0, 0, 0, null, "#1a2a0a"],
    organ_swarm: ["#a05a6a", "#48242e", "M", 0, 1, 0, null, "#ff2a4a"],
    skin_thief: ["#c08a8a", "#5c3c3c", "H", 1, 1, 1, null, "#fff"],
    muscle_brute: ["#8a2a2a", "#380e0e", "B", 1, 0, 0, "#ff5a4a", "#ffd93d"],
    flesh_oracle: ["#b06a7a", "#502a34", "H", 3, 0, 1, null, "#7a2bff"],
    gullet_worm: ["#7a2a3a", "#320e16", "S", 0, 0, 0, null, "#ffd93d"],
    pulse_mass: ["#963a4e", "#400f1e", "O", 2, 0, 0, null, "#ff2a4a"],
    flayed_saint: ["#d09a9a", "#6a4c4c", "H", 1, 2, 0, null, "#fff"],
    gloom_fiend: ["#3a2a5a", "#120c20", "G", 2, 1, 1, null, "#c9a0ff"],
    marrow_sovereign: ["#e8e0cc", "#8a8072", "H", 4, 1, 1, "#ffd93d", "#7a2bff"],
    nether_imp: ["#5a2a7a", "#200e30", "Q", 2, 1, 2, "#b05aff", "#fff06a"],
    umbral_stalker: ["#2a1a44", "#0c0618", "Q", 1, 0, 2, null, "#c9a0ff"],
    void_kissed: ["#4a2a6a", "#180c26", "H", 3, 1, 1, "#8a3aff", "#fff"],
    nether_drake: ["#6a1a8a", "#260830", "W", 3, 2, 2, "#c05aff", "#ffe14d"],
    grinning_shade: ["#46325e", "#161020", "G", 0, 0, 0, null, "#fff"],
    hollow_choir: ["#5a4a7a", "#1e1830", "G", 0, 2, 0, null, "#c9a0ff"],
    rift_born: ["#3a1a5a", "#120820", "B", 4, 2, 2, "#8a3aff", "#ff3b3b"],
    cinder_rider: ["#8a3a1a", "#301206", "Q", 3, 0, 1, "#ff7a2a", "#ffd93d"],
    doom_herald: ["#4a0e1e", "#16040a", "B", 4, 2, 2, "#ff2a4a", "#fff"],
    demon_warden: ["#8a1a00", "#2e0800", "C", 3, 1, 0, "#ff5a1a", "#ffd93d"],
    hell_beast: ["#8a1a1a", "#380808", "B", 2, 0, 2, null, "#ffd93d"],
    succubus: ["#d42a3a", "#5a0e18", "H", 2, 1, 1, null, "#ffe14d"],
    doom_lord: ["#3a0a0a", "#0c0202", "B", 3, 2, 1, "#8a2aff", "#8affc9"],
    infernal: ["#ff5a1a", "#5a1e04", "C", 2, 0, 0, "#b8ff2a", "#fff06a"],
    hell_hound: ["#5a0a0a", "#1c0303", "Q", 1, 0, 2, "#ff3b3b", "#ffd93d"],
    infernal_overlord: ["#ff3a00", "#4a1000", "C", 4, 1, 0, "#d0ff2a", "#fff"],
    succubus_matriarch: ["#ff6ab0", "#5a1638", "H", 3, 2, 2, null, "#fff"],
    doom_tyrant: ["#1a0505", "#000000", "B", 4, 2, 2, "#a04aff", "#c9ffd9"],
    hell_magus: ["#6a0a8a", "#22032e", "H", 4, 1, 1, "#c05aff", "#fff"],
    peter_the_fallen: ["#0a0a0a", "#000000", "B", 4, 2, 2, "#ff2a5a", "#ff3b3b"],
  };
  const ROLE_DEMON = {
    civilized_succubus: "succubus", civilized_hellbeast: "hell_beast",
    civilized_infernal: "infernal", civilized_doom: "doom_lord",
    hell_merchant: "mirror_fiend", hell_guard: "shard_ravager",
    hell_priest: "obsidian_prophet", demon_warden: "demon_warden",
  };
  // v19 resident looks: service roles that read human on the surface
  // (healer/scholar/guard) map to civilized demon kinds in hell holds; any
  // other role (unemployed/adventurer/...) gets a stable per-NPC pick from
  // the civilized pool so no hell resident ever renders as a villager.
  // Roles and behavior are untouched — this is looks only.
  const RESIDENT_LOOK = { guard: "shard_ravager", healer: "obsidian_prophet", scholar: "mirror_fiend" };
  const RESIDENT_POOL = ["succubus", "hell_beast", "infernal", "doom_lord"];
  function residentLookFor(role, seedStr) {
    try {
      if (ROLE_DEMON[role]) return ROLE_DEMON[role];
      if (RESIDENT_LOOK[role]) return RESIDENT_LOOK[role];
      let h = 2166136261; const s = String(seedStr == null ? role : seedStr);
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return RESIDENT_POOL[(h >>> 0) % RESIDENT_POOL.length];
    } catch (e) { return "succubus"; }
  }
  const POOLS = {
    hell_ash: ["cinder_imp", "ash_wraith", "ember_crawler", "soot_bat", "crag_fiend", "slag_serpent", "ash_hound", "ember_swarm", "cinder_wisp", "soot_stalker", "hell_beast", "hell_hound"],
    hell_blood: ["gore_hound", "sanguine_horror", "vein_lurker", "crimson_bat", "pulse_fiend", "artery_serpent", "blood_monk", "bleed_mother", "coagulus", "hemorrhage", "succubus", "hell_hound"],
    hell_obsidian: ["obsidian_shard", "glass_maw", "blackglass_serpent", "shard_swarm", "mirror_fiend", "glasswing", "obsidian_prophet", "glass_spider", "razor_choir", "infernal", "doom_lord"],
    hell_bone: ["marrow_eater", "ossuary_crawler", "skull_swarm", "gravewing", "calcium_horror", "marrow_mage", "ossuary_hound", "chalk_wraith", "reliquary", "hell_hound", "hell_beast"],
    hell_flesh: ["flesh_mound", "gut_lurker", "sinew_stalker", "maw_walker", "bile_spitter", "organ_swarm", "skin_thief", "flesh_oracle", "gullet_worm", "flayed_saint", "succubus", "doom_lord"],
    // v26 alien biomes: shared void-leaning / young-colony kinds. Their
    // heaviest hitters live in fortress garrisons only (see BASE_KINDS) —
    // the wild fungal/verdiant grounds hold weaker fiends by design.
    hell_fungal: ["gut_lurker", "bile_spitter", "organ_swarm", "gullet_worm", "sinew_stalker", "marrow_eater"],
    hell_gloom: ["mirror_fiend", "razor_choir", "obsidian_prophet", "chalk_wraith", "pulse_fiend", "glass_spider"],
    hell_verdant: ["marrow_eater", "ossuary_hound", "ash_hound", "cinder_imp", "ember_crawler", "bile_spitter"],
  };
  function install() {
    try {
      const C = window.CFG;
      if (!C || !C.MOB_TEMPLATES) return false;
      const T = C.MOB_TEMPLATES;
      for (const r of W) {
        const [key, name, hp, mp, atk, def, spd, xp, abs, body, tint, mech, _ex] = r;
        const ex = _ex || {};
        // stable-bred mount lines live in config (same kind, shop stats) —
        // keep a mount other code registered so the wild template never
        // un-teaches a sold/owned beast to be ridden.
        const keepMount = T[key] && T[key].mount;
        T[key] = { name, hp, mp, atk, def, spd, xp, abilities: abs.slice(), tint, body, hellMech: mech };
        if (keepMount) T[key].mount = keepMount;
        if (ex.summon) T[key].summonKind = ex.summon;
        if (ex.tamable) T[key].tamable = true;
        if (ex.mount) T[key].mount = ex.mount;
        if (ex.docile) T[key].docile = true;
        if (ex.lavaBorn) T[key].lavaBorn = true;
        if (ex.undead) T[key].undead = true;
        T[key].demon = true;
        if (ex.burrower) { T[key].burrower = true; T[key].diver = true; }
      }
      // settlement warden: passive boss-tier guard (retaliates when struck)
      T.demon_warden = { name: "Demon Warden", hp: 900, mp: 200, atk: 55, def: 30, spd: 2.8, xp: 800, abilities: ["shieldwall", "heal", "warcry"], tint: "#8a1a00", body: "construct", hellMech: "guard", guard: true, passive: true, docile: true, lavaBorn: true, demon: true };
      // boss-fry gloom fiend: summoned by warlord "adds" tricks outside
      // inferno/flesh themes (kept out of the wild W pool on purpose — it
      // only ever arrives as a warlord's brood, never as a wild spawn).
      T.gloom_fiend = { name: "Gloom Fiend", hp: 250, mp: 120, atk: 32, def: 10, spd: 4.2, xp: 340, abilities: ["dazzle", "thunder_hex", "shadowstep"], tint: "#3a2a5a", body: "ghost", hellMech: "blink", demon: true };
      for (const r of B) {
        const [key, name, hp, mp, atk, def, spd, xp, abs, body, tint, minEff, themes, tricks, say] = r;
        T[key] = { name, hp, mp, atk, def, spd, xp, abilities: abs.slice(), tint, body, boss: true, bossMech: tricks.slice(), bossSay: say, demon: true };
        if (!C.BOSS_KINDS) C.BOSS_KINDS = [];
        if (!C.HELL_BOSS_KINDS) C.HELL_BOSS_KINDS = [];
        C.BOSS_KINDS.push(key);
        C.HELL_BOSS_KINDS.push(key);
        if (C.BOSS_MIN_EFF) C.BOSS_MIN_EFF[key] = (minEff | 0);
        if (C.BOSS_THEMES) C.BOSS_THEMES[key] = themes.slice();
        if (C.BOSS_BULWARK) C.BOSS_BULWARK[key] = { frail: "mag", weak: "holy" };
      }
      // maw_primogenitor minEff arrived as string "10" above — normalize
      try { if (C.BOSS_MIN_EFF) for (const k of Object.keys(C.BOSS_MIN_EFF)) C.BOSS_MIN_EFF[k] = C.BOSS_MIN_EFF[k] | 0; } catch (e) {}
      // sexes: succubus kin female, constructs/golems/wisps genderless, rest roll
      try {
        const F = C.FEMALE_KINDS || [], M = C.MALE_KINDS || [], G = C.GENDERLESS_KINDS || [];
        for (const k of ["pyre_queen", "umbral_matriarch", "nether_abbess", "gut_empress", "blood_monk", "bleed_mother", "ash_mother", "skin_thief", "flayed_saint", "flesh_oracle", "exsanguinator"]) if (!F.includes(k)) F.push(k);
        for (const k of ["cinder_emperor", "magma_mauler", "slag_colossus", "char_king", "gore_patriarch", "maw_primogenitor", "flesh_sculptor", "sinew_despot", "skin_pope", "clot_brute", "muscle_brute", "ribcage_walker", "obsidian_golem", "charred_colossus", "bone_collector", "glass_maw"]) if (!M.includes(k)) M.push(k);
        for (const k of ["obsidian_shard", "shard_swarm", "skull_swarm", "organ_swarm", "ember_swarm", "cinder_wisp", "hollow_choir", "razor_choir", "reliquary", "vitrifier", "pulse_mass", "coagulus", "hemorrhage", "demon_warden", "gloom_fiend"]) if (!G.includes(k)) G.push(k);
      } catch (e) {}
      // civilized demon roles render as demons (see sprites.js drawDemon)
      try {
        if (C.ROLE_TINT) {
          C.ROLE_TINT.hell_merchant = "#8a86a8"; C.ROLE_TINT.hell_guard = "#1e1a2a"; C.ROLE_TINT.hell_priest = "#2e2844";
        }
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  function lookFor(kind) {
    try {
      if (ROLE_DEMON[kind]) kind = ROLE_DEMON[kind];
      return LOOKS[kind] || null;
    } catch (e) { return null; }
  }
  function mechFor(kind) {
    try {
      const t = (window.CFG.MOB_TEMPLATES || {})[kind];
      return (t && t.hellMech) || null;
    } catch (e) { return null; }
  }
  return { install, lookFor, mechFor, residentLookFor, ROLE_DEMON, POOLS, WILD: W.map(r => r[0]), BOSSES: B.map(r => r[0]) };
})();
try { window.HellMobs.install(); } catch (e) {}
