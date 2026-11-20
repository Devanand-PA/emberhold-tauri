/* Emberhold config — tiles, abilities, mobs, tuning. Classic script: defines window.CFG. */
window.CFG = (() => {
  const TILE = 32, CHUNK = 16;
  // tile ids
 const T = {
   GRASS: 0, TALLGRASS: 1, FLOWER: 2, TREE: 3, PINE: 4, WATER: 5, DEEPWATER: 6,
   SAND: 7, PATH: 8, TOWNSTONE: 9, HOUSEWALL: 10, ROOF: 11, DOOR: 12,
   DFLOOR: 13, DWALL: 14, DDOOR: 15, BRIDGE: 16, TORCH: 17, STAIRS: 18, LAVA: 19,
   SAKURA: 20, STONEWALL: 21, LANTERN: 22,
   WINDOW: 23, PLANKS: 24, RUBBLE: 25,
   ICE: 26, ASH: 27, MOSS: 28, BONE: 29, CRYSTAL: 30,
    WAX: 31, FLESH: 32, BLOOD: 33,
    CLOUD: 34, SHROOM: 35, SPIRE: 36,
 };
  // NOTE: ROOF is a retired wall tile (pre-v11 worlds used it for hut
  // walls). It stays solid so any straggler tile still blocks, but nothing
  // places it anymore — v11 world construction uses HOUSEWALL/STONEWALL for
  // walls and WINDOW for windows only.
  // LANTERN blocks movement (plaza/path posts the hero must walk around);
  // TORCH stays walkable (planted light you can stand on). BLOOD/CRYSTAL/
  // LAVA are solid hazard lakes — cross only via bridges (attacks still fly
  // over them via segBlocked; solidity is movement-only).
  const SOLID = new Set([T.TREE, T.PINE, T.WATER, T.DEEPWATER, T.HOUSEWALL, T.ROOF, T.DWALL, T.LAVA, T.SAKURA, T.STONEWALL, T.LANTERN, T.WINDOW, T.CRYSTAL, T.BLOOD, T.SHROOM, T.SPIRE]);
  const TREE_TILES = new Set([T.TREE, T.PINE, T.SAKURA, T.SHROOM, T.SPIRE]);
  const HOTBAR_SIZE = 10; // 10 hotbar slots: keys 1-9 + Space (last slot)
  // Seven spendable attributes. Effects are applied in entities.recalcDerived().
  const STATS = {
    str: { name: "Strength", icon: "💪", desc: "+10 physical dmg, +1% melee dmg, +1% flurry dmg per pt" },
    end: { name: "Endurance", icon: "🛡️", desc: "+10 physical DEF, +10 max stamina, +0.25 stamina regen per pt" },
    agi: { name: "Agility", icon: "🤸", desc: "+0.05 move speed, +0.5% weapon & flurry speed per pt" },
    int: { name: "Intellect", icon: "🧠", desc: "+10 MATK, +10 max MP, +1% spell dmg, +0.25 MP regen per pt" },
    cha: { name: "Charm", icon: "😊", desc: "+5 ATK, +5 MATK, +5 DEF, +5 SDEF to party members and tamed beasts per pt; +4% loyalty per pt" },
    luk: { name: "Luck", icon: "🍀", desc: "+2% crit, crits +10% dmg, +0.5% dodge per pt (dodge caps at 95%)" },
    for: { name: "Fortitude", icon: "❤️‍🩹", desc: "+10 max HP, +10 spell defence, +0.25 HP regen per pt" },
  };
  const STAT_POINTS_PER_LEVEL = 3;
  const SKILL_POINTS_PER_LEVEL = 1;
  // Per-spell perk tracks (Skyrim-style). potency 0-5, efficiency 0-3, mastery 0/1.
  // (Kept for reference — the real definitions now live in SKILL_TREES below,
  // which adds unlock requirements plus a Surge capstone to every spell.)
  const PERKS = {
    potency: { max: 5, name: "Potency", icon: "⚡", desc: "+15% power per rank" },
    efficiency: { max: 3, name: "Efficiency", icon: "🔷", desc: "-10% MP cost per rank" },
    mastery: { max: 1, name: "Mastery", icon: "👑", desc: "Spell-specific master bonus" },
  };
  // Skill trees: one per weapon family plus one per spell. Nodes unlock skill
  // points into gated progressions: req {nodeId: minRanks} must be met first.
  // Weapon trees (keys match item wtype) live in p.weaponPerks; spell trees
  // (keys match ability id) extend the legacy p.spellPerks in place, so old
  // potency/efficiency/mastery ranks carry straight over.
  const SKILL_TREES = {
    sword: { name: "Swordplay", icon: "🗡️", kind: "weapon", nodes: [
      { id: "edge", name: "Keen Edge", icon: "⚔️", max: 5, desc: "+8% sword damage per rank." },
      { id: "twin", name: "Twin Fangs", icon: "🌀", max: 3, req: { edge: 2 }, desc: "15% chance per rank to strike twice (echo hits at 60%)." },
      { id: "execute", name: "Executioner", icon: "🩸", max: 3, req: { edge: 2 }, desc: "+15% damage per rank vs foes below 30% HP." },
      { id: "crescent", name: "Crescent Arc", icon: "🌙", max: 3, req: { twin: 1 }, desc: "Every 5th swing looses a moonlit wave (60/80/100% damage) that passes through foes." },
      { id: "master", name: "Swordmaster", icon: "👑", max: 1, req: { crescent: 1, execute: 1 }, desc: "+25% sword damage. Echoes hit at 80%; waves fly every 4th swing." },
    ]},
    axe: { name: "Reaving", icon: "🪓", kind: "weapon", nodes: [
      { id: "hewn", name: "Heavy Hewn", icon: "🪓", max: 5, desc: "+8% axe damage per rank." },
      { id: "gash", name: "Gushing Wound", icon: "🩸", max: 3, req: { hewn: 1 }, desc: "20% chance per rank to inflict Bleed (damage over time)." },
      { id: "ravage", name: "Ravage", icon: "💢", max: 3, req: { hewn: 3 }, desc: "+15% damage per rank vs bleeding foes." },
      { id: "deep", name: "Deep Cuts", icon: "🔻", max: 3, req: { gash: 1 }, desc: "Bleed ticks 40% harder per rank and lasts +4s per rank." },
      { id: "reaver", name: "Reaver", icon: "👑", max: 1, req: { deep: 2, ravage: 1 }, desc: "+30% axe damage. Your crits always inflict Bleed." },
    ]},
    hammer: { name: "Sundering", icon: "🔨", kind: "weapon", nodes: [
      { id: "crush", name: "Crushing Weight", icon: "🔨", max: 5, desc: "+8% hammer damage per rank." },
      { id: "sunder", name: "Sunder Armor", icon: "🛡️", max: 3, req: { crush: 1 }, desc: "25% chance per rank to Sunder: −3 DEF per rank for 8s." },
      { id: "shatter", name: "Shatter", icon: "💥", max: 3, req: { crush: 3 }, desc: "+15% damage per rank vs Sundered/Stunned foes; swings shock all adjacent foes." },
      { id: "concuss", name: "Concussion", icon: "💫", max: 3, req: { sunder: 1 }, desc: "12% chance per rank to Stun for 1s (no move, no attack)." },
      { id: "juggernaut", name: "Juggernaut", icon: "👑", max: 1, req: { shatter: 1, concuss: 2 }, desc: "+25% hammer damage. Sunder halves armor resist; stuns last 1.5s." },
    ]},
    dagger: { name: "Daggers", icon: "🔪", kind: "weapon", hint: "Fast stabbing blades — Wyrmfang and every dagger feed this tree (25 landed hits = 1 point). Not to be confused with the Venom Sting spell.", nodes: [
      { id: "fang", name: "Sharp Fang", icon: "🔪", max: 5, desc: "+8% dagger damage per rank." },
      { id: "backstab", name: "Backstab", icon: "🎯", max: 3, req: { fang: 1 }, desc: "+8% crit chance per rank with daggers." },
      { id: "fleet", name: "Fleetfoot", icon: "💨", max: 3, req: { fang: 3 }, desc: "+4% move speed, +3% dodge per rank while a dagger is wielded." },
      { id: "venom", name: "Envenom", icon: "🐍", max: 3, req: { backstab: 1 }, desc: "15% chance per rank to poison on hit." },
      { id: "assassin", name: "Assassin", icon: "👑", max: 1, req: { venom: 2, fleet: 1 }, desc: "+25% dagger damage; your crits also poison." },
    ]},
    whip: { name: "Crackling", icon: "🪢", kind: "weapon", hint: "Long lashing whips: weakest hits at sword speed, sweeping wide arcs — and every tier can stun; the taming arts answer only to a whip.", nodes: [
      { id: "lash", name: "Snapping Lash", icon: "🪢", max: 5, desc: "+8% whip damage per rank." },
      { id: "sting", name: "Barbed Sting", icon: "💫", max: 3, req: { lash: 1 }, desc: "12% chance per rank for whip swings to stun (0.5s + 0.25s per rank)." },
      { id: "coils", name: "Coiled Guard", icon: "🛡️", max: 3, req: { lash: 2 }, desc: "+2 DEF per rank while a whip is wielded." },
      { id: "snapback", name: "Snapback", icon: "🌀", max: 3, req: { sting: 1 }, desc: "Every 6th connected swing cracks twice (echo hits at 60%)." },
      { id: "crackmaster", name: "Crackmaster", icon: "👑", max: 1, req: { snapback: 2, coils: 1 }, desc: "+25% whip damage. Stuns last +0.5s longer; Snapback fires every 4th swing." },
    ]},
    spear: { name: "Phalanx", icon: "🔱", kind: "weapon", nodes: [
      { id: "point", name: "Sharp Point", icon: "🔱", max: 5, desc: "+8% spear damage per rank." },
      { id: "reach", name: "Long Haft", icon: "📏", max: 3, req: { point: 1 }, desc: "+0.25 spear reach per rank." },
      { id: "phalanx", name: "Phalanx Wall", icon: "🛡️", max: 3, req: { point: 3 }, desc: "+2 DEF and +5% damage per rank while a spear is wielded." },
      { id: "impale", name: "Impale", icon: "🗡️", max: 3, req: { reach: 1 }, desc: "+15% damage per rank to healthy foes (above 70% HP)." },
      { id: "lancer", name: "Lancer", icon: "👑", max: 1, req: { impale: 2, phalanx: 1 }, desc: "+25% spear damage, +0.5 reach. Impale bites foes above half HP." },
    ]},
    bow: { name: "Archery", icon: "🏹", kind: "weapon", nodes: [
      { id: "draw", name: "Strong Draw", icon: "🏹", max: 5, desc: "+8% bow damage per rank." },
      { id: "volley", name: "Volley", icon: "➶", max: 3, req: { draw: 1 }, desc: "12% chance per rank to loose a free twin arrow." },
      { id: "deadeye", name: "Deadeye", icon: "🎯", max: 3, req: { draw: 3 }, desc: "+10% damage per rank beyond 5 tiles; +1 arrow range per rank." },
      { id: "splinter", name: "Splinter Shot", icon: "⚡", max: 3, req: { volley: 1 }, desc: "15% chance per rank for arrows to arc to a 2nd foe for 50%." },
      { id: "huntsmaster", name: "Huntsmaster", icon: "👑", max: 1, req: { splinter: 2, deadeye: 1 }, desc: "+25% bow damage; twin arrows deal full damage." },
    ]},
    shuriken: { name: "Hurling", icon: "🌀", kind: "weapon", hint: "Thrown arms need no weapon wielded — hurl from the hand.", nodes: [
      { id: "sharp", name: "Sharp Edges", icon: "✴️", max: 5, desc: "+8% shuriken damage per rank." },
      { id: "fan", name: "Fan Toss", icon: "🌧️", max: 3, req: { sharp: 1 }, desc: "15% chance per rank to hurl a second shuriken free." },
      { id: "long_arm", name: "Long Arm", icon: "📏", max: 3, req: { sharp: 1 }, desc: "+1 shuriken range per rank." },
      { id: "smoke_veil", name: "Smoke Veil", icon: "💨", max: 3, req: { sharp: 2 }, desc: "Smoke bombs blind +4s longer and +0.5 tiles wider per rank." },
      { id: "storm", name: "Storm of Stars", icon: "👑", max: 1, req: { fan: 2, smoke_veil: 1 }, desc: "+25% shuriken damage. Free second throws hit at full force." },
    ]},
    wand: { name: "Channeling", icon: "🪄", kind: "weapon", hint: "Requires a wand wielded.", nodes: [
      { id: "channel", name: "Deep Channel", icon: "🪄", max: 5, desc: "Spells cost 5% less MP per rank." },
      { id: "focus", name: "Arcane Focus", icon: "🔮", max: 3, req: { channel: 1 }, desc: "+6% spell power per rank." },
      { id: "quicken", name: "Quicken", icon: "💨", max: 3, req: { channel: 2 }, desc: "Cooldowns 6% shorter per rank." },
      { id: "archmage", name: "Archmage", icon: "👑", max: 1, req: { focus: 2, quicken: 1 }, desc: "+15% spell power; spells cost 20% less." },
    ]},
    staff: { name: "Overcharge", icon: "🌟", kind: "weapon", hint: "Requires a staff wielded.", nodes: [
      { id: "power", name: "Overcharge", icon: "🌟", max: 5, desc: "+8% spell power per rank." },
      { id: "burst", name: "Wide Burst", icon: "💥", max: 3, req: { power: 1 }, desc: "Blast size +12% per rank." },
      { id: "echo", name: "Echo", icon: "🔁", max: 3, req: { burst: 1 }, desc: "10% chance per rank to refund a spell's MP cost." },
      { id: "archon", name: "Archon", icon: "👑", max: 1, req: { burst: 2, echo: 1 }, desc: "+20% spell power; Echo chance doubled." },
    ]},
    unarmed: { name: "Martial Arts", icon: "🥋", kind: "weapon", hint: "Requires bare hands — unequip your weapon.", nodes: [
      { id: "stance", name: "Iron Stance", icon: "🥋", max: 5, desc: "+8% unarmed damage per rank." },
      { id: "flurry", name: "Flurry of Blows", icon: "👊", max: 3, req: { stance: 2 }, desc: "15% chance per rank to strike twice (echo hits at 60%)." },
      { id: "palm", name: "Palm Strike", icon: "✋", max: 3, req: { stance: 1 }, desc: "12% chance per rank to Stun for 1s (no move, no attack)." },
      { id: "focus", name: "Inner Focus", icon: "🧘", max: 3, req: { flurry: 1 }, desc: "+8% crit chance and +3% dodge per rank while unarmed." },
      { id: "drive", name: "Never Ending Drive", icon: "♾️", max: 3, req: { flurry: 1, palm: 2 }, desc: "Restore HP equal to 10%/20%/30% of the damage dealt by unarmed attacks (incl. Iron Palm). 1s cooldown per trigger." },
      { id: "grandmaster", name: "Grandmaster", icon: "👑", max: 1, req: { palm: 2, focus: 1 }, desc: "+25% unarmed damage. Echoes hit at 80%; stuns last 1.5s." },
    ]},
    // ---- guard arts: the off-hand learns to answer (Q uses the off-hand slot) ----
    parry: { name: "Parrying", icon: "🤺", kind: "weapon", hint: "Your off-hand guard — press Q to parry with whatever the off-hand slot holds (weapon, shield, or bare fists). Only meets attacks from where you aim; flankers slip through. Needs no weapon wielded.", nodes: [
      { id: "timing", name: "Open Window", icon: "⏱️", max: 3, desc: "+0.15s parry window per rank (base 0.15s)." },
      { id: "recovery", name: "Quick Recovery", icon: "💨", max: 3, req: { timing: 1 }, desc: "Parry cooldown −0.12s per rank (base 1.0s)." },
      { id: "instinct", name: "Fighter's Instinct", icon: "👁️", max: 3, req: { timing: 1 }, desc: "4% chance per rank to auto-parry an incoming blow — no Q needed." },
      { id: "master", name: "Perfect Guard", icon: "👑", max: 1, req: { instinct: 2, recovery: 1 }, desc: "Parries leave half as much damage again (fractions halved); +5% auto-parry." },
    ]},
    shield: { name: "Shieldwork", icon: "🛡️", kind: "weapon", hint: "Wield a shield and guard with your off-hand — Q parries blows at 1/20 x shield tier. Shields also guard passively (+DEF/+SDEF).", nodes: [
      { id: "guard", name: "Shield Guard", icon: "🛡️", max: 5, desc: "+1 DEF and +1 SDEF per rank while a shield is equipped." },
      { id: "rebound", name: "Rebound", icon: "↩️", max: 3, req: { guard: 1 }, desc: "8% chance per rank to hurl half the parried blow back at the attacker (shield parries only)." },
      { id: "bulwark", name: "Bulwark", icon: "🧱", max: 3, req: { guard: 2 }, desc: "Shield parries cut another x0.9 per rank." },
      { id: "aegis", name: "Aegis", icon: "👑", max: 1, req: { rebound: 2, bulwark: 1 }, desc: "Rebound reflects at FULL power (+25% reflect chance); +2 DEF/SDEF while a shield is equipped." },
    ]},
    // ---- beastmastery: the taming tree. Earned by taming (1pt / 2 tames). ----
    taming: { name: "Beastmastery", icon: "🐾", kind: "taming", hint: "Tame beasts to earn this tree's points (1 point per 2 tames). Warlords never submit — nothing changes that; apex ancients demand a FULLY maxed tree, and even then only 1 in 20 beaten ancients asks.", nodes: [
      { id: "pack_bond", name: "Pack Bond", icon: "🐾", max: 4, desc: "+1 beast alongside you per rank (base 1, up to 5). Your mount counts; beasts lent to friends never do." },
      { id: "vermin_lore", name: "Vermin Lore", icon: "🪲", max: 1, desc: "Tame insects: tarantulas, scorpions, ants, hornets, scarabs, beetles, gloomspinners." },
      { id: "broad_kinship", name: "Broad Kinship", icon: "🦌", max: 1, req: { vermin_lore: 1 }, desc: "Tame most wild animals — wolves to wyverns, crabs to krakens' kin." },
      { id: "big_game", name: "Big Game", icon: "🏹", max: 3, desc: "+15 tame level cap per rank (base 15)." },
      { id: "apex_bond", name: "Apex Bond", icon: "👑", max: 1, req: { big_game: 2 }, desc: "No level limit on taming. Warlords still never submit; apex ancients need the whole tree maxed (and even then only 1 in 20 asks)." },
    ]},
    // ---- guard arts: plate learns by enduring, cloth learns by abiding ----
    // Armor and robe trees earn only from TAKING hits (12 landed direct
    // blows = 1 point) while wearing the matching shell — armor (plate,
    // leather, garb: anything slot=="armor" that is not a robe) feeds
    // Stoneskin, robes and vestments feed Wardweave. Bonuses apply only
    // while the matching shell is worn (take it off, lose the ranks' gifts).
    armor: { name: "Stoneskin", icon: "🛡️", kind: "armor", hint: "Take hits while wearing armor to earn this tree's points (12 hits taken = 1 point). Plate, leather and garb feed it — robes feed Wardweave instead. All bonuses apply only while armored.", nodes: [
      { id: "iron_skin", name: "Iron Skin", icon: "🛡️", max: 5, desc: "+3 DEF per rank while wearing armor." },
      { id: "tempered", name: "Tempered Plate", icon: "🔥", max: 3, req: { iron_skin: 1 }, desc: "+2% physical resist per rank while wearing armor." },
      { id: "vigor", name: "Vigor", icon: "❤️", max: 3, req: { iron_skin: 2 }, desc: "+25 max HP per rank while wearing armor." },
      { id: "second_wind", name: "Second Wind", icon: "💨", max: 3, req: { tempered: 1 }, desc: "+0.2 HP regen per rank while wearing armor." },
      { id: "adamant", name: "Adamant", icon: "👑", max: 1, req: { vigor: 2, second_wind: 1 }, desc: "+8 DEF and +4% physical resist while wearing armor." },
    ]},
    robe: { name: "Wardweave", icon: "🧙", kind: "robe", hint: "Take hits while wearing a robe to earn this tree's points (12 hits taken = 1 point). Cloth, mage, archmage, holy, void, dawnshroud and tideward robes feed it — plate and leather feed Stoneskin instead. All bonuses apply only while robed.", nodes: [
      { id: "wardweave", name: "Wardweave", icon: "🧙", max: 5, desc: "+3 SDEF per rank while wearing a robe." },
      { id: "spellward", name: "Spellward", icon: "✨", max: 3, req: { wardweave: 1 }, desc: "+2% magical resist per rank while wearing a robe." },
      { id: "deep_font", name: "Deep Font", icon: "🔷", max: 3, req: { wardweave: 2 }, desc: "+30 max MP and +6 MATK per rank while wearing a robe." },
      { id: "mindveil", name: "Mindveil", icon: "💧", max: 3, req: { spellward: 1 }, desc: "+0.2 MP regen per rank while wearing a robe." },
      { id: "archward", name: "Archward", icon: "👑", max: 1, req: { deep_font: 2, mindveil: 1 }, desc: "+8 SDEF and +4% magical resist while wearing a robe." },
    ]},
    // ---- striking wraps: kasaya learns by dealing, not enduring ----
    // Kasaya trees earn only from DEALING physical damage (25 landed
    // physical hits = 1 point) while wearing kasaya. Bonuses apply only
    // while the matching wrap is worn.
    kasaya: { name: "Ascetic", icon: "📿", kind: "kasaya", hint: "Deal physical damage while wearing kasaya to earn this tree's points (25 landed physical hits = 1 point). Spells and bare skin earn nothing. All bonuses apply only while wearing kasaya.", nodes: [
      { id: "strong_thread", name: "Strong Thread", icon: "🧵", max: 5, desc: "+4 ATK per rank while wearing kasaya." },
      { id: "forceful", name: "Forceful Blows", icon: "👊", max: 3, req: { strong_thread: 1 }, desc: "+3% physical damage per rank while wearing kasaya." },
      { id: "enduring", name: "Enduring March", icon: "🥾", max: 3, req: { strong_thread: 2 }, desc: "+0.15 stamina regen per rank while wearing kasaya." },
      { id: "iron_will", name: "Iron Will", icon: "🧘", max: 3, req: { forceful: 1 }, desc: "+10 max stamina per rank while wearing kasaya." },
      { id: "warrior_monk", name: "Warrior Monk", icon: "👑", max: 1, req: { enduring: 2, iron_will: 1 }, desc: "+10 ATK and +5% physical damage while wearing kasaya." },
    ]},
    // ---- choir tunics: habitus learns by dealing, not enduring ----
    // Habitus trees earn only from DEALING spell damage (15 landed spell
    // hits = 1 point) while wearing a habitus. Bonuses apply only while
    // the matching tunic is worn.
    habitus: { name: "Devotion", icon: "🕯️", kind: "habitus", hint: "Deal spell damage while wearing a habitus to earn this tree's points (15 landed spell hits = 1 point). Blades and bare skin earn nothing. All bonuses apply only while wearing a habitus.", nodes: [
      { id: "prayer_weave", name: "Prayer Weave", icon: "🕯️", max: 5, desc: "+4 MATK per rank while wearing a habitus." },
      { id: "empowered", name: "Empowered Prayer", icon: "🙏", max: 3, req: { prayer_weave: 1 }, desc: "+3% spell damage per rank while wearing a habitus." },
      { id: "litany", name: "Litany", icon: "📜", max: 3, req: { prayer_weave: 2 }, desc: "+25 max MP per rank while wearing a habitus." },
      { id: "clarity", name: "Clarity", icon: "💧", max: 3, req: { empowered: 1 }, desc: "+0.15 MP regen per rank while wearing a habitus." },
      { id: "seraph_voice", name: "Seraph Voice", icon: "👑", max: 1, req: { litany: 2, clarity: 1 }, desc: "+10 MATK and +5% spell damage while wearing a habitus." },
    ]},
  };
  // Every spell shares this shape: legacy potency/efficiency/mastery first
  // (same ids, same caps — old saves map straight on), then a Surge capstone.
  const SPELL_TREE_NODES = [
    { id: "potency", name: "Potency", icon: "⚡", max: 5, desc: "+15% power per rank." },
    { id: "efficiency", name: "Efficiency", icon: "🔷", max: 3, req: { potency: 1 }, desc: "−10% MP cost per rank." },
    { id: "mastery", name: "Mastery", icon: "👑", max: 1, req: { potency: 3 }, desc: "Spell-specific master bonus (shown under each spell)." },
    { id: "surge", name: "Surge", icon: "🌊", max: 3, req: { mastery: 1 }, desc: "+8% power and −8% cooldown per rank." },
  ];
  // ---- trimmed spell trees: nodes that do nothing are not offered ----
  // Audit (Nov 2026): Potency only matters where spellPowerMult is read —
  // damage/status spells (power or status via combatDmg/fireProjectileSpell),
  // heal (amount), support (MP refund), and active techniques (techArtMult).
  // Efficiency only matters when the spell costs MP (abilityCostBase needs
  // ab.mp). Removed ranks refund on load (see ensureProgression). Surge
  // (power + cooldown) and Mastery (cooldown x0.8 + bespoke bonus) matter
  // everywhere, so they stay on every tree. None of the trimmed trees are
  // spell parents/children, so no chain inherits from or through them.
  const SPELL_TREE_DROP = {
    eject: ["potency", "efficiency"],
    shieldwall: ["potency"], warcry: ["potency"], ember_weapon: ["potency"],
    blessed_weapon: ["potency"], shadowstep: ["potency"], grapple: ["potency"],
    revive: ["potency"],
  };
  // Per-spell node list: the shared shape minus dropped nodes, with reqs
  // rewired so nothing gates behind a removed node (mastery re-gates behind
  // 1 efficiency rank; eject has no efficiency, so its mastery is ungated;
  // surge still needs mastery).
  function spellTreeNodes(abId) {
    try {
      const drop = SPELL_TREE_DROP[abId];
      if (!drop || !drop.length) return SPELL_TREE_NODES;
      const keep = {};
      for (const n of SPELL_TREE_NODES) if (!drop.includes(n.id)) keep[n.id] = true;
      const out = [];
      for (const n of SPELL_TREE_NODES) {
        if (!keep[n.id]) continue;
        const c = { ...n };
        if (c.req) {
          const r2 = {};
          for (const k of Object.keys(c.req)) if (keep[k]) r2[k] = c.req[k];
          if (c.id === "mastery" && !r2.potency && keep.efficiency && !(r2.efficiency >= 1)) r2.efficiency = 1;
          if (Object.keys(r2).length) c.req = r2; else delete c.req;
        }
        out.push(c);
      }
      return out;
    } catch (e) { return SPELL_TREE_NODES; }
  }
  // Passive techniques get their OWN tree shape (no MP/cooldown nodes — the
  // openings are always on): Might sharpens the damage, Opening widens the
  // condition, Mastery is bespoke per technique, Apex caps it.
  // Per-tree skill points: use a tree to earn that tree's points. Each
  // entry is {per: actions for 1 point, unit: label}. Weapon trees earn on
  // landed hits with that family (thrown arms feed Hurling); spells on
  // casts; active techniques on casts; passive techniques when their
  // opening bites; parry/shield on successful parries; armor/robes on hits
  // TAKEN while wearing the matching shell; kasaya on physical damage
  // dealt while wearing kasaya; habitus on spell damage dealt while
  // wearing a habitus. Points never come
  // from level-ups and never cross trees. A tree stops earning once its
  // unspent points could buy every remaining rank (bought + unspent >=
  // max); old saves trim any surplus past that cap on load.
  const TREE_EARN = {
    weapon: { per: 25, unit: "landed hits", how: "landing hits with this weapon" },
    parry: { per: 6, unit: "parries", how: "successful parries (timed Q or instinct)" },
    shield: { per: 6, unit: "shield parries", how: "parrying with a shield in the off-hand" },
    spell: { per: 15, unit: "casts", how: "casting this spell" },
    technique: { per: 10, unit: "casts", how: "casting this Deep Art" },
    tpass: { per: 12, unit: "openings", how: "triggering this opening in a fight" },
    status: { per: 12, unit: "afflictions", how: "afflicting foes with this ailment" },
    taming: { per: 2, unit: "tames", how: "taming beasts" },
    cataclysm: { per: 8, unit: "casts", how: "casting this cataclysm" },
    armor: { per: 12, unit: "hits taken", how: "taking hits while wearing armor" },
    robe: { per: 12, unit: "hits taken", how: "taking hits while wearing a robe" },
    kasaya: { per: 25, unit: "landed physical hits", how: "dealing physical damage while wearing kasaya" },
    habitus: { per: 15, unit: "landed spell hits", how: "dealing spell damage while wearing a habitus" },
  };
  const TPASSIVE_NODES = [
    { id: "might", name: "Might", icon: "💪", max: 5, desc: "+12% passive damage per rank." },
    { id: "opening", name: "Opening", icon: "🎯", max: 3, req: { might: 1 }, desc: "Widens the opening (see each Deep Art)." },
    { id: "mastery", name: "Mastery", icon: "👑", max: 1, req: { might: 3 }, desc: "Deep Art master bonus (shown under each tree)." },
    { id: "apex", name: "Apex", icon: "🌟", max: 1, req: { mastery: 1, opening: 1 }, desc: "+25% passive damage." },
  ];
  // per-technique Opening text (rendered in place of the generic line)
  const TPASSIVE_OPENING = {
    backstab: "+15% crit chance per rank on opening strikes.",
    deadeye: "−1 tile of the far-shot threshold per rank (6 → 3).",
    executioner: "+5% of the wounded threshold per rank (30% → 45%).",
    sentinel: "+0.2 reach of the tip-strike opening per rank (2.2 → 1.6).",
    skirmisher: "+0.5 tiles of the close-shot window per rank (3.5 → 5).",
  };
  // ---- affliction trees: one per status + slow. Earned by AFFLICTING foes
  // (12 afflictions = 1 point in that ailment's tree). Potency sharpens the
  // ailment's own numbers (blind miss%/sight, slow strength), Lingering
  // stretches durations, Exploit makes afflicted victims take more damage
  // from you, and the capstone masters the ailment outright.
  const STATUS_TREES = {
    status_poison: { name: "Envenoming", icon: "🐍", kind: "status", type: "poison", hint: "Venoms, stings and poisoned blades feed this tree (12 afflictions = 1 point). Warlords & apex ancients resist venoms (1%/s, ~12s).", nodes: [
      { id: "potency", name: "Virulence", icon: "🐍", max: 5, desc: "+12% poison strength per rank (damage per second)." },
      { id: "lingering", name: "Lingering Venom", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% poison duration per rank." },
      { id: "exploit", name: "Weakened Veins", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Poisoned foes take +6% damage per rank from you." },
      { id: "apex", name: "Plaguebearer", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% poison strength & duration. Poisoned foes take +10% more damage and are slowed while poisoned." },
    ]},
    status_burn: { name: "Immolation", icon: "🔥", kind: "status", type: "burn", hint: "Burns from fire, cinder and ember weapons feed this tree (12 afflictions = 1 point).", nodes: [
      { id: "potency", name: "Kindling", icon: "🔥", max: 5, desc: "+12% burn strength per rank (damage per second)." },
      { id: "lingering", name: "Banked Coals", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% burn duration per rank." },
      { id: "exploit", name: "Exposed Flesh", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Burning foes take +6% damage per rank from you." },
      { id: "apex", name: "Wildfire", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% burn strength & duration. Burn strips +50% more DEF and victims take +10% more damage." },
    ]},
    status_freeze: { name: "Deep Frost", icon: "🧊", kind: "status", type: "freeze", hint: "Freezes from ice magic and frostbite feed this tree (12 afflictions = 1 point).", nodes: [
      { id: "potency", name: "Hard Freeze", icon: "🧊", max: 5, desc: "+12% freeze strength per rank (longer lock)." },
      { id: "lingering", name: "Permafrost", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% freeze duration per rank." },
      { id: "exploit", name: "Brittle Ice", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Frozen foes take +6% damage per rank from you." },
      { id: "apex", name: "Whiteout", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% freeze strength & duration. Victims stay slowed +4s after the thaw and take +10% more damage." },
    ]},
    status_paralyze: { name: "Storm Hex", icon: "🌩️", kind: "status", type: "paralyze", hint: "Paralysis from lightning and thunder hexes feeds this tree (12 afflictions = 1 point).", nodes: [
      { id: "potency", name: "High Voltage", icon: "🌩️", max: 5, desc: "+12% paralyze strength per rank (-AGI/-STR)." },
      { id: "lingering", name: "Held Charge", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% paralyze duration per rank." },
      { id: "exploit", name: "Trembling Guard", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Paralyzed foes take +6% damage per rank from you." },
      { id: "apex", name: "Lockjaw Storm", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% paralyze strength & duration. -2 extra AGI/STR and victims take +10% more damage." },
    ]},
    status_blind: { name: "Blinding", icon: "🕶️", kind: "status", type: "blind", hint: "Blindness from dazzle, smite and smoke bombs feeds this tree (12 afflictions = 1 point).", nodes: [
      { id: "potency", name: "Glaring Light", icon: "✨", max: 5, desc: "+4% blind miss chance and -0.3 sight per rank (base 20% miss, 3.5 sight)." },
      { id: "lingering", name: "Afterimages", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% blindness duration per rank." },
      { id: "exploit", name: "Cheap Shots", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Blinded foes take +6% damage per rank from you." },
      { id: "apex", name: "Eclipse", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% blindness duration. +10% miss, -0.5 sight, and blinded foes take +10% more damage." },
    ]},
    status_bleed: { name: "Hemorrhage", icon: "🩸", kind: "status", type: "bleed", hint: "Bleeds from axes and deep cuts feed this tree (12 afflictions = 1 point). Warlords & apex ancients resist bleeding (1%/s, ~12s).", nodes: [
      { id: "potency", name: "Deep Cuts", icon: "🩸", max: 5, desc: "+12% bleed strength per rank (damage per second)." },
      { id: "lingering", name: "Open Wounds", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% bleed duration per rank." },
      { id: "exploit", name: "Scent of Blood", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Bleeding foes take +6% damage per rank from you." },
      { id: "apex", name: "Exsanguinate", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% bleed strength & duration. Bleeding foes take +10% more damage and are slowed while bleeding." },
    ]},
    status_sunder: { name: "Fracturing", icon: "🔻", kind: "status", type: "sunder", hint: "Sunders from hammers and skullsplitter feed this tree (12 afflictions = 1 point).", nodes: [
      { id: "potency", name: "Crack Armor", icon: "🔻", max: 5, desc: "+12% sunder strength per rank (-DEF)." },
      { id: "lingering", name: "Crumbling Guard", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% sunder duration per rank." },
      { id: "exploit", name: "Split Open", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Sundered foes take +6% damage per rank from you." },
      { id: "apex", name: "Shatterpoint", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% sunder strength & duration. Sunder strips +50% more DEF and victims take +10% more damage." },
    ]},
    status_stun: { name: "Concussion", icon: "💫", kind: "status", type: "stun", hint: "Stuns from hammers, fists and whips feed this tree (12 afflictions = 1 point).", nodes: [
      { id: "potency", name: "Heavy Blows", icon: "💫", max: 5, desc: "+12% stun strength per rank (longer lock)." },
      { id: "lingering", name: "Ringing Ears", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% stun duration per rank." },
      { id: "exploit", name: "Helpless", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Stunned foes take +6% damage per rank from you." },
      { id: "apex", name: "Coup de Grace", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% stun strength & duration (+0.5s outright). Stunned foes take +10% more damage." },
    ]},
    status_slow: { name: "Snaring", icon: "🕸️", kind: "status", type: "slow", hint: "Slows from frost arrows, slime, frostbite and freezing feed this tree (12 slows = 1 point).", nodes: [
      { id: "potency", name: "Thick Snare", icon: "🕸️", max: 5, desc: "Your slows slow 5% harder per rank (lower move multiplier)." },
      { id: "lingering", name: "Clinging Mire", icon: "⏳", max: 3, req: { potency: 1 }, desc: "+20% slow duration per rank." },
      { id: "exploit", name: "Bogged Down", icon: "🎯", max: 3, req: { potency: 1 }, desc: "Slowed foes take +6% damage per rank from you." },
      { id: "apex", name: "Quagmire", icon: "👑", max: 1, req: { lingering: 1, exploit: 1 }, desc: "+25% slow duration. Your slows slow 10% harder still and victims take +10% more damage." },
    ]},
  };
  const ABILITIES = {
    fireball:   { id: "fireball", name: "Fireball", mp: 16, cd: 2.0, range: 8, power: 2.0, kind: "projectile", element: "fire", desc: "Hurls a burning bolt. May ignite (burn).", icon: "🔥", status: { type: "burn", chance: 0.35, dps: 4, potency: 1 } },
    heal:       { id: "heal", name: "Heal", mp: 20, cd: 5.0, range: 0, power: 0, kind: "heal", element: "holy", desc: "Restore 25% max HP.", icon: "💚" },
    whirlwind:  { id: "whirlwind", name: "Whirlwind", mp: 12, cd: 3.2, range: 2.2, power: 1.8, kind: "aoe", element: "physical", desc: "Spin, hitting all around — harder and faster now.", icon: "🌀" },
    tornado:    { id: "tornado", name: "Tornado", mp: 36, cd: 5.0, range: 3.0, power: 2.6, kind: "aoe", element: "physical", desc: "Howling war-spin, hitting all around. Whirlwind's gale.", icon: "🌪️" },
    hurricane:  { id: "hurricane", name: "Hurricane", mp: 76, cd: 50.0, range: 6, power: 6, kind: "cataclysm", element: "physical", desc: "Channel 2s, then become the storm's eye: a vast hurricane that hurls everything around you.", icon: "🌬️" },
    frostbite:  { id: "frostbite", name: "Frostbite", mp: 16, cd: 2.2, range: 6, power: 1.8, kind: "projectile", element: "ice", desc: "Cruel biting frost — often freezes its victim solid (0.5s).", icon: "❄️", status: { type: "freeze", chance: 0.2, duration: 0.5, potency: 1 } },
    shieldwall: { id: "shieldwall", name: "Shieldwall", mp: 10, cd: 6.0, range: 0, power: 0, kind: "buff", element: "physical", desc: "+DEF for 6s.", icon: "🛡️" },
   revive:     { id: "revive", name: "Revive", mp: 44, cd: 10.0, range: 4, power: 0, kind: "revive", element: "holy", desc: "Revive a corpse (anyone, even mobs). Needs your lv ≥ its lv. Full HP with mastery.", icon: "🕊️" },
    lightning:  { id: "lightning", name: "Lightning", mp: 36, cd: 3.0, range: 9, power: 2.6, kind: "projectile", element: "electric", desc: "Piercing sky-bolt. May paralyze. Already-paralyzed victims take double damage. Mastery: chains to a 2nd foe.", icon: "⚡", status: { type: "paralyze", chance: 0.25, potency: 1 } },
    // ---- status-inducing attacks ----
    venom:      { id: "venom", name: "Venom Sting", mp: 18, cd: 2.6, range: 8, power: 1.7, kind: "projectile", element: "nature", desc: "Envenomed dart: poisons (4% max HP/s until cured).", icon: "🐍", status: { type: "poison", chance: 1, pct: 0.04, potency: 1 } },
    immolate:   { id: "immolate", name: "Immolate", mp: 36, cd: 3.0, range: 7, power: 2.2, kind: "projectile", element: "fire", desc: "Cursed flame: burns (flat dmg/s + lowers END until cured), bursting with half-damage splash. Channel 1.5s.", icon: "🪔", status: { type: "burn", chance: 1, dps: 5, potency: 1 } },
    glacier:    { id: "glacier", name: "Glacier", mp: 34, cd: 3.0, range: 7, power: 2.0, kind: "projectile", element: "ice", desc: "Deep freeze: stops the victim moving/attacking (2.5s), bursting with half-damage splash. Channel 1.5s.", icon: "🧊", status: { type: "freeze", chance: 1, duration: 2.5, potency: 1 } },
    thunder_hex:{ id: "thunder_hex", name: "Thunder Hex", mp: 34, cd: 2.8, range: 8, power: 2.2, kind: "projectile", element: "electric", desc: "Storm hex: full storm damage + paralyzes (lowers AGI + STR until cured). Already-paralyzed victims take double damage. Channel 1.5s.", icon: "🧿", status: { type: "paralyze", chance: 1, potency: 1 } },
    dazzle:     { id: "dazzle", name: "Dazzle", mp: 16, cd: 2.4, range: 7, power: 1.2, kind: "projectile", element: "holy", desc: "Searing flash: burns bright (victim loses sight of distant targets and may miss hits).", icon: "💡", status: { type: "blind", chance: 1, potency: 1 } },
    water_jet:  { id: "water_jet", name: "Water Jet", mp: 16, cd: 2.2, range: 7, power: 1.9, kind: "projectile", element: "water", desc: "A thin high-pressure jet of water that punches through everything in its path.", icon: "💧" },
    smite:      { id: "smite", name: "Smite", mp: 36, cd: 2.8, range: 8, power: 2.2, kind: "projectile", element: "holy", desc: "Spear of holy light. Ruinous vs the unholy (undead and demons). May blind (blinded hits may miss). Channel 1.5s.", icon: "⚜️", status: { type: "blind", chance: 0.4, potency: 1 } },
    tideburst:  { id: "tideburst", name: "Tideburst", mp: 36, cd: 3.2, range: 7, power: 2.2, kind: "projectile", element: "water", desc: "Crushing burst of deep water. Often briefly freezes what it soaks (0.5s). Channel 1.5s.", icon: "💦", status: { type: "freeze", chance: 0.35, duration: 0.5, potency: 1 } },
    // ---- war-spells: steel-magic for the front line (tomes, like all spells) ----
    shadowstep:   { id: "shadowstep", name: "Shadowstep", mp: 20, cd: 6.0, range: 7, power: 0, kind: "blink", element: "nature", desc: "Vanish behind the nearest foe (unseen 2.5s) + blind it. Backstab combo. Holding attack lands a bonus swing on arrival.", icon: "🌙" },
    // ---- escape: everyone knows it, no tome, no MP — the walls move down here ----
    eject:        { id: "eject", name: "Eject", mp: 0, cd: 25.0, range: 0, power: 0, kind: "eject", element: "physical", desc: "Emergency eject: flings you to where you aim (mouse) — or a short distance to nearby open ground with no aim. Escape shifting walls and bad footing. 25s cooldown. Slipping away often (30 escapes) teaches Disciples of Shadow.", icon: "⏏️" },
    grapple:      { id: "grapple", name: "Hook Snare", mp: 18, cd: 7.0, range: 7, power: 0, kind: "pull", element: "physical", desc: "Yank the nearest foe to the ground before you. Holding attack lands a bonus swing as it lands.", icon: "🪝" },
    warcry:       { id: "warcry", name: "Warcry", mp: 40, cd: 20.0, range: 6, power: 0, kind: "buff", element: "physical", desc: "You + nearby allies deal +30% melee damage for 10s.", icon: "📯" },
    ember_weapon: { id: "ember_weapon", name: "Ember Weapon", mp: 20, cd: 18.0, range: 0, power: 0, kind: "buff", element: "fire", desc: "Your strikes ignite (burn) for 15s — and count as fire.", icon: "🌶️" },
    blessed_weapon: { id: "blessed_weapon", name: "Blessed Weapon", mp: 40, cd: 18.0, range: 0, power: 0, kind: "buff", element: "holy", desc: "Your strikes deal +25% and count as holy for 15s.", icon: "😇" },
    // ---- weapon techniques: active arts demand their weapon as the default ----
    // Every active also inherits its weapon family's skill tree and scales
    // with the wielded weapon's strength (see TECH_WEAPON_FAM).
    holy_sword:    { id: "holy_sword", name: "Holy Sword", mp: 40, cd: 60.0, range: 3, power: 0, kind: "technique", tech: "holy_sword", element: "holy", desc: "Instant 50x holy strike before you. Requires a sword as your default weapon. Inherits Swordplay + scales with sword tier.", icon: "🗡️" },
    cinder_edge:   { id: "cinder_edge", name: "Cinder Edge", mp: 20, cd: 25.0, range: 0, power: 0, kind: "technique", tech: "cinder_edge", element: "fire", desc: "A 10x burning sword arc. Requires a sword as your default weapon. Inherits Swordplay + scales with sword tier.", icon: "🎇" },
    skullsplitter: { id: "skullsplitter", name: "Skullsplitter", mp: 22, cd: 30.0, range: 2.2, power: 0, kind: "technique", tech: "skullsplitter", element: "physical", desc: "An 8x axe slam: all around you + sundered (-15 DEF). Requires an axe as your default weapon. Inherits Reaving + scales with axe tier.", icon: "🪓" },
    avalanche:     { id: "avalanche", name: "Avalanche Hammer", mp: 22, cd: 30.0, range: 3, power: 0, kind: "technique", tech: "avalanche", element: "ice", desc: "A 6x frozen hammer-slam that stops foes cold. Requires a hammer as your default weapon. Inherits Sundering + scales with hammer tier.", icon: "🏔️" },
    tempest_lance: { id: "tempest_lance", name: "Tempest Lance", mp: 20, cd: 22.0, range: 5, power: 0, kind: "technique", tech: "tempest_lance", element: "electric", desc: "A 40x piercing storm lance + paralysis. Requires a spear as your default weapon. Inherits Phalanx + scales with spear tier.", icon: "🌩️" },
    viper_flurry:  { id: "viper_flurry", name: "Viper Flurry", mp: 10, cd: 18.0, range: 0, power: 0, kind: "technique", tech: "viper_flurry", element: "nature", desc: "Six 1.2x venomed strikes in a heartbeat. Requires a dagger as your default weapon. Inherits Daggers + scales with dagger tier.", icon: "🥷" },
    iron_palm:    { id: "iron_palm", name: "Iron Palm", mp: 8, cd: 15.0, range: 0, power: 0, kind: "technique", tech: "iron_palm", element: "physical", desc: "A 10x bare-handed blow that stuns 2s. Requires bare fists (default slot empty). Inherits Martial Arts.", icon: "✋" },
    feint_attack: { id: "feint_attack", name: "Feint Attack", mp: 10, cd: 18.0, range: 0, power: 0, kind: "technique", tech: "feint_attack", element: "physical", desc: "Dash 3 times in quick succession (Mastery: 4) — each dash carves everyone in your path for 8x. Holding attack lands a bonus swing on every landing. Cooldown starts when the last dash lands. Requires a dagger as your default weapon. Inherits Daggers + scales with dagger tier.", icon: "💨" },
    // ---- spear arts: the phalanx learns to dance ----
    spiral_pike:  { id: "spiral_pike", name: "Spiral Pike", mp: 22, cd: 26.0, range: 0, power: 0, kind: "technique", tech: "spiral_pike", element: "physical", desc: "A 5x whirling sweep all around you + a 10s guard stance (Mastery: 6x + 15s guard). Requires a spear as your default weapon. Inherits Phalanx + scales with spear tier.", icon: "🥏" },
    dragon_coil:  { id: "dragon_coil", name: "Dragon Coil Rush", mp: 20, cd: 20.0, range: 0, power: 0, kind: "technique", tech: "dragon_coil", element: "nature", desc: "Coil back, then surge ~4.5 tiles through foes for a 7x venomed skewer (Mastery: 8.5x, longer surge, crueler venom). Holding attack lands a bonus swing where you stop. Requires a spear as your default weapon. Inherits Phalanx + scales with spear tier.", icon: "🐉" },
    // ---- bow arts: first true bow actives (no arrows spent) ----
    thorn_reign:  { id: "thorn_reign", name: "Thorn Reign", mp: 22, cd: 24.0, range: 9, power: 0, kind: "technique", tech: "thorn_reign", element: "nature", desc: "Loose a fan of 7 piercing thorn arrows, each 2.2x (Mastery: 9 arrows + venom). No arrows spent. Requires a bow as your default weapon. Inherits Archery + scales with bow strength.", icon: "🌧️" },
    comet_shot:   { id: "comet_shot", name: "Comet Shot", mp: 24, cd: 28.0, range: 14, power: 0, kind: "technique", tech: "comet_shot", element: "fire", desc: "A huge piercing comet arrow: 9x + burn + splash (Mastery: 11x, bigger splash, crueler burn). No arrows spent. Requires a bow as your default weapon. Inherits Archery + scales with bow strength.", icon: "🏹" },
    // ---- shuriken arts: no weapon required — the finest star in the pack is hurled (consumed) ----
    exploding_shuriken: { id: "exploding_shuriken", name: "Exploding Shuriken", mp: 22, cd: 26.0, range: 9, power: 0, kind: "technique", tech: "exploding_shuriken", element: "fire", desc: "Hurls your best shuriken (consumed): 6x + burn + splash. Needs no weapon wielded. Inherits Hurling. (Mastery: 7x, wider splash, crueler burn.)", icon: "💥" },
    slime_shuriken:  { id: "slime_shuriken", name: "Slime Shuriken", mp: 18, cd: 20.0, range: 9, power: 0, kind: "technique", tech: "slime_shuriken", element: "nature", desc: "Hurls 4 slime stars (consumes 1 best shuriken): each 3x + slowing slime + light poison. Needs no weapon wielded. Inherits Hurling. (Mastery: 4x each, longer slow, crueler venom.)", icon: "🟢" },
    // ---- hammer art: the earth answers ----
    hammerfell_impact: { id: "hammerfell_impact", name: "Hammerfell Impact", mp: 24, cd: 30.0, range: 0, power: 0, kind: "technique", tech: "hammerfell_impact", element: "physical", desc: "Slam the earth: a 7x shockwave in a huge ring that stuns 1.5s (Mastery: 8x, wider ring, 2.5s stun). Requires a hammer as your default weapon. Inherits Sundering + scales with hammer tier.", icon: "🔨" },
    // ---- unarmed art: the self, multiplied ----
    shadow_disciples: { id: "shadow_disciples", name: "Disciples of Shadow", mp: 30, cd: 45.0, range: 12, power: 0, kind: "technique", tech: "shadow_disciples", element: "physical", desc: "Split into shadow clones (2, +1 with Mastery, +1 at Surge 3): 50% of your HP, 50% of your damage x art ranks, each casts every move of yours once, fading after 10s (+2s/Surge). Recast while aiming at a clone to swap places with it — free, any number of times. Requires bare fists (default slot empty). Inherits Martial Arts.", icon: "🎭" },
    // ---- shield art: the off-hand wall answers back ----
    stalwart_reflector: { id: "stalwart_reflector", name: "Stalwart Reflector", mp: 20, cd: 25.0, range: 0, power: 0, kind: "technique", tech: "stalwart_reflector", element: "physical", desc: "A 2s mirror guard (Mastery: 3s): every attack aimed at you is hurled back at half power while you take nothing. Requires a shield equipped. Inherits Shieldwork.", icon: "🪞" },
    // ---- taming art: the swarm answers the beastfriend ----
    locust_swarm: { id: "locust_swarm", name: "Locust Swarm", mp: 24, cd: 30.0, range: 6, power: 0, kind: "technique", tech: "locust_swarm", element: "nature", desc: "Release a hungry locust swarm for 12s: untouchable locusts leech life off nearby foes and feed it to you and your allies. Earned by taming 50 beasts, including at least 10 insects. Requires a whip as your default weapon. Inherits Crackling + scales with whip tier.", icon: "🦗" },
    // ---- whip arts: the taming lash cracks twice ----
    thundering_crack: { id: "thundering_crack", name: "Thundering Crack", mp: 22, cd: 26.0, range: 5, power: 0, kind: "technique", tech: "thundering_crack", element: "electric", desc: "A 4x thundercrack that paralyzes every nearby foe, then cracks you faster and harder (+30% damage, +25% speed for 8s). Requires a whip as your default weapon. Inherits Crackling + scales with whip tier.", icon: "⛈️" },
    whirlwind_slinger: { id: "whirlwind_slinger", name: "Whirlwind Slinger", mp: 24, cd: 30.0, range: 0, power: 0, kind: "technique", tech: "whirlwind_slinger", element: "physical", desc: "Spin a long whip in a whirling spiral for 5s: everything it touches takes 1.5x and is batted away. Requires a whip as your default weapon. Inherits Crackling + scales with whip tier.", icon: "🪀" },
    // ---- cataclysms: deep-delve tier (tomes only at effective depth 5+) ----
    // long channels, dramatic releases, fight-ending power
   tidal_wave:  { id: "tidal_wave", name: "Tidal Wave", mp: 72, cd: 45.0, range: 13, power: 7, kind: "cataclysm", element: "water", desc: "Channel 2s, then RIDE a huge wave forward, crushing and hurling everything in your path. Holding attack hurls weapon swings down the foam line at flurry speed.", icon: "🏄" },
    energy_beam: { id: "energy_beam", name: "Energy Beam", mp: 80, cd: 60.0, range: 10, power: 9, kind: "cataclysm", element: "electric", desc: "Channel 2s gathering storm, then fire a devastating beam of raw lightning. Already-paralyzed victims take double damage.", icon: "🌠" },
    meteorfall:  { id: "meteorfall", name: "Meteorfall", mp: 76, cd: 50.0, range: 6.5, power: 6, kind: "cataclysm", element: "fire", desc: "Channel 2s, then call heavier skyfire down on everything near.", icon: "☄️" },
    whiteout:    { id: "whiteout", name: "Whiteout", mp: 70, cd: 45.0, range: 5, power: 6, kind: "cataclysm", element: "ice", desc: "Channel 2s, then a blinding blizzard nova that stops foes cold.", icon: "🌨️" },
    // ---- wind line: whirlwind -> wind cutter -> storm of blades ----
    wind_cutter: { id: "wind_cutter", name: "Wind Cutter", mp: 28, cd: 3.2, range: 8, power: 2.4, kind: "projectile", element: "physical", desc: "Hurl wind blades at your aim, shredding everything in their path and hurling victims downwind. Channel 1.5s.", icon: "🍃" },
    storm_of_blades: { id: "storm_of_blades", name: "Storm of Blades", mp: 76, cd: 50.0, range: 9, power: 7, kind: "cataclysm", element: "physical", desc: "Channel 2s, then loose homing wind blades that chase foes and hurl them on every hit. Already-pushed victims take extra damage.", icon: "🪃" },
    // ---- water line: water jet -> whirlpool -> primordial sea ----
    whirlpool: { id: "whirlpool", name: "Whirlpool", mp: 32, cd: 3.6, range: 7, power: 2.0, kind: "projectile", element: "water", desc: "Trap your aim in a whirlpool that slows, wounds and drags victims to its heart. Channel 1.5s.", icon: "🍥" },
    primordial_sea: { id: "primordial_sea", name: "Primordial Sea", mp: 76, cd: 55.0, range: 6, power: 6, kind: "cataclysm", element: "water", desc: "Channel 2s, then raise whirlpools around you that hunt foes and drag them in. Contact wounds + slows; already-slowed victims take extra.", icon: "🌊" },
    // ---- fire line: fireball -> line of fire -> raging volcano ----
    line_of_fire: { id: "line_of_fire", name: "Line of Fire", mp: 32, cd: 3.6, range: 8, power: 2.4, kind: "projectile", element: "fire", desc: "Crack the earth in a straight line — magma leaks out, wounding and burning anything that touches it. Channel 1.5s.", icon: "♨️" },
    raging_volcano: { id: "raging_volcano", name: "Raging Volcano", mp: 76, cd: 50.0, range: 6.5, power: 6, kind: "cataclysm", element: "fire", desc: "Channel 2s, then raise a mightier volcano at your aim that spouts lava at nearby foes — wounding, slowing and burning them. Already-burned victims take extra.", icon: "🌋" },
    // ---- ice line: frostbite -> icicle line -> crystal prison ----
    icicle_line: { id: "icicle_line", name: "Icicle Line", mp: 28, cd: 3.2, range: 8, power: 2.2, kind: "projectile", element: "ice", desc: "A line of ice that impales everything in its path and may freeze it. Already-frozen victims take extra damage. Channel 1.5s.", icon: "💠", status: { type: "freeze", chance: 0.25, duration: 1.0, potency: 1 } },
    crystal_prison: { id: "crystal_prison", name: "Crystal Prison", mp: 70, cd: 45.0, range: 5, power: 6, kind: "cataclysm", element: "ice", desc: "Channel 2s, then freeze the ground around you — foes slip on the ice while spikes rise and fall every 0.25s for 3s, wounding and freezing. Already-frozen victims take extra.", icon: "🏰" },
    // ---- holy line: smite -> burning light; dazzle -> tamisra -> void hole ----
    burning_light: { id: "burning_light", name: "Burning Light", mp: 80, cd: 60.0, range: 5, power: 7, kind: "cataclysm", element: "holy", desc: "Channel 2s, then glow for a few seconds — burning and blinding all nearby foes with heavy holy light.", icon: "☀️" },
    // ---- nature line: venom -> toxic stab -> barbed plague ----
    toxic_stab: { id: "toxic_stab", name: "Toxic Stab", mp: 24, cd: 2.6, range: 9, power: 2.0, kind: "projectile", element: "nature", desc: "A piercing venom skewer down the line: wounds and poisons (4% max HP/s until cured). Channel 1.5s.", icon: "🤺", status: { type: "poison", chance: 1, pct: 0.04, potency: 1 } },
    barbed_plague: { id: "barbed_plague", name: "Barbed Plague", mp: 80, cd: 60.0, range: 5, power: 6, kind: "cataclysm", element: "nature", desc: "Channel 2s, then wreath yourself in toxic spikes. Anything touching you is wounded + poisoned and gains the spikes, spreading them on contact. Only your enemies catch it; one victim never carries two plagues at once.", icon: "🦠" },
    // ---- dazzle line: dazzle -> tamisra -> void hole ----
    tamisra: { id: "tamisra", name: "Tamisra", mp: 40, cd: 6.0, range: 5, power: 3.0, kind: "aoe", element: "holy", desc: "Blind all nearby foes and wound them. Already-blinded victims take more damage.", icon: "🌑" },
    void_hole: { id: "void_hole", name: "Void Hole", mp: 84, cd: 60.0, range: 6, power: 8, kind: "cataclysm", element: "holy", desc: "Channel 2s, then loose a floating orb that zips around you for 5s — wounding, blinding, slowing and hurling foes. Already-blinded victims take more.", icon: "🕳️" },
    // ---- heal line: heal -> life drain -> blood hole ----
    life_drain: { id: "life_drain", name: "Life Drain", mp: 28, cd: 4.5, range: 7, power: 2.2, kind: "projectile", element: "holy", desc: "Drain your victim's life force, restoring HP equal to the damage dealt. Channel 1.5s.", icon: "🧛" },
    blood_hole: { id: "blood_hole", name: "Blood Hole", mp: 76, cd: 55.0, range: 6, power: 6, kind: "cataclysm", element: "holy", desc: "Channel 2s, then raise a red orb that reaps the life around you in 3 heavy waves over 3s, feeding it back to you. Victims are slowed; already-slowed victims feed more.", icon: "🫀" },
    // ---- support / cures ----
    cleanse:    { id: "cleanse", name: "Cleanse", mp: 30, cd: 4.0, range: 6, power: 0, kind: "support", element: "holy", desc: "Cure poison, burn + bleed on an ally (or yourself) + restore 33% HP. Upgrades refund MP instead of more HP. Channel 1.5s.", icon: "🧼", cures: ["poison", "burn", "bleed"] },
    panacea:    { id: "panacea", name: "Panacea", mp: 44, cd: 8.0, range: 6, power: 0, kind: "support", element: "holy", desc: "Cure ALL status + restore 50% HP. Clerics know this. Upgrades refund MP instead of more HP. Channel 2s.", icon: "🌿", cures: ["poison", "burn", "freeze", "paralyze", "blind", "bleed", "sunder", "stun"] },
    angel_of_life: { id: "angel_of_life", name: "Angel of Life", mp: 60, cd: 20.0, range: 6, power: 0, kind: "support", element: "holy", desc: "Cure ALL + restore 75% HP and revive fallen party members. Allies who respawn within 5s are offered a teleport to you. Upgrades refund MP. Channel 2.5s.", icon: "👼", cures: ["poison", "burn", "freeze", "paralyze", "blind", "bleed", "sunder", "stun"] },
  };
  // ---- weapon techniques: active arts demand their weapon as the default ----
  // TECH_WEAPON_FAM maps every technique (active + passive) to the weapon
  // family that must be wielded as the default weapon (press its hotkey, or
  // pick it in 🎒 Inventory; "unarmed" = bare fists) for it to execute. Actives
  // additionally inherit every unlocked rank of that weapon's skill tree and
  // scale with the wielded weapon's strength (tierMult / bow power). Heroes,
  // allies and technique-wielding mobs must hold the steel; bosses alone are
  // exempt (no weapon needed). Powerful non-boss mobs spawn wielding matching
  // tiered steel (see Entities.equipMobTechniqueGear).
  const TECH_WEAPON_FAM = {
    holy_sword: "sword", backstab: "dagger", cinder_edge: "sword",
    skullsplitter: "axe", avalanche: "hammer", tempest_lance: "spear",
    deadeye: "bow", viper_flurry: "dagger", iron_palm: "unarmed",
    feint_attack: "dagger", executioner: "axe", spiral_pike: "spear",
    dragon_coil: "spear", sentinel: "spear", thorn_reign: "bow",
    comet_shot: "bow", skirmisher: "bow", hammerfell_impact: "hammer",
    shadow_disciples: "unarmed", stalwart_reflector: "shield",
    locust_swarm: "whip", thundering_crack: "whip", whirlwind_slinger: "whip",
  };
  // ---- spell tiers: higher spells inherit every unlocked rank of their ----
  // previous tier's tree (one-way: lower tiers never gain from higher ones).
  // e.g. Glacier gains all of Frostbite's ranks (one-way: parents never gain
  // Frostbite never gains from Glacier. Cataclysms cap their element's chain.
 const SPELL_PARENTS = {
   glacier: "frostbite", whiteout: "glacier",
   immolate: "fireball", meteorfall: "immolate",
   thunder_hex: "lightning", energy_beam: "thunder_hex",
   tidal_wave: "tideburst", tideburst: "water_jet", cleanse: "heal", panacea: "cleanse",
   angel_of_life: "panacea",
   tornado: "whirlwind", hurricane: "tornado",
   smite: "dazzle",
    wind_cutter: "whirlwind", storm_of_blades: "wind_cutter",
    whirlpool: "water_jet", primordial_sea: "whirlpool",
    line_of_fire: "fireball", raging_volcano: "line_of_fire",
    icicle_line: "frostbite", crystal_prison: "icicle_line",
    burning_light: "smite",
    toxic_stab: "venom", barbed_plague: "toxic_stab",
    tamisra: "dazzle", void_hole: "tamisra",
    life_drain: "heal", blood_hole: "life_drain",
 };
  // req: lifetime damage by element (el) / weapon family (fam), plus kills.
  // Progress accumulates in dealDamage for the player only (game.js trackTech).
 const TECHNIQUES = {
    holy_sword:    { id: "holy_sword", abId: "holy_sword", name: "Holy Sword", icon: "🗡️", active: true, req: { el: { holy: 15000 }, fam: { sword: 15000 } }, hint: "Deal holy + sword damage (Blessed Weapon helps)." },
    backstab:      { id: "backstab", name: "Backstab", icon: "🔪", active: false, req: { fam: { dagger: 8000 }, kills: 250 }, hint: "Stab with daggers; fell 250 foes. Strike the distracted (Shadowstep)." },
    cinder_edge:   { id: "cinder_edge", abId: "cinder_edge", name: "Cinder Edge", icon: "🎇", active: true, req: { el: { fire: 10000 }, fam: { sword: 10000 } }, hint: "Deal fire + sword damage (Ember Weapon helps)." },
    skullsplitter: { id: "skullsplitter", abId: "skullsplitter", name: "Skullsplitter", icon: "🪓", active: true, req: { fam: { axe: 15000 }, kills: 200 }, hint: "Deal axe damage; fell 200 foes." },
    avalanche:     { id: "avalanche", abId: "avalanche", name: "Avalanche Hammer", icon: "🏔️", active: true, req: { el: { ice: 8000 }, fam: { hammer: 12000 } }, hint: "Deal ice + hammer damage." },
    tempest_lance: { id: "tempest_lance", abId: "tempest_lance", name: "Tempest Lance", icon: "🌩️", active: true, req: { el: { electric: 6000 }, fam: { spear: 12000 } }, hint: "Deal electric + spear damage." },
    deadeye:       { id: "deadeye", name: "Deadeye", icon: "🎯", active: false, req: { fam: { bow: 15000 }, kills: 300 }, hint: "Deal bow damage; fell 300 foes. Far shots pay double." },
    viper_flurry:  { id: "viper_flurry", abId: "viper_flurry", name: "Viper Flurry", icon: "🥷", active: true, req: { el: { nature: 6000 }, fam: { dagger: 12000 } }, hint: "Deal nature (venom) + dagger damage." },
    iron_palm:     { id: "iron_palm", abId: "iron_palm", name: "Iron Palm", icon: "✋", active: true, req: { fam: { unarmed: 6000 }, kills: 150 }, hint: "Fight bare-handed; fell 150 foes." },
    feint_attack:  { id: "feint_attack", abId: "feint_attack", name: "Feint Attack", icon: "💨", active: true, req: { fam: { dagger: 10000 }, kills: 150 }, hint: "Deal dagger damage; fell 150 foes. Strike, vanish, strike again." },
    executioner:   { id: "executioner", name: "Executioner", icon: "💀", active: false, req: { fam: { axe: 10000 }, kills: 400 }, hint: "Deal axe damage; fell 400 foes. Finish the wounded." },
    // ---- spear arts: the phalanx learns to dance ----
    spiral_pike:   { id: "spiral_pike", abId: "spiral_pike", name: "Spiral Pike", icon: "🥏", active: true, req: { fam: { spear: 16000 }, kills: 200 }, hint: "Deal spear damage; fell 200 foes. Sweep the ring, hold the line." },
    dragon_coil:   { id: "dragon_coil", abId: "dragon_coil", name: "Dragon Coil Rush", icon: "🐉", active: true, req: { el: { nature: 5000 }, fam: { spear: 18000 } }, hint: "Deal nature (venom spear) + spear damage." },
    sentinel:      { id: "sentinel", name: "Sentinel's Reach", icon: "📏", active: false, req: { fam: { spear: 22000 }, kills: 300 }, hint: "Deal spear damage; fell 300 foes. Strike with the very tip." },
    // ---- bow arts: first true bow actives + a close-range creed ----
    thorn_reign:   { id: "thorn_reign", abId: "thorn_reign", name: "Thorn Reign", icon: "🌧️", active: true, req: { fam: { bow: 18000 }, kills: 250 }, hint: "Deal bow damage; fell 250 foes. Rain thorns, spend no arrows." },
    comet_shot:    { id: "comet_shot", abId: "comet_shot", name: "Comet Shot", icon: "🏹", active: true, req: { el: { fire: 6000 }, fam: { bow: 16000 } }, hint: "Deal fire (cinder arrows) + bow damage." },
    skirmisher:    { id: "skirmisher", name: "Skirmisher", icon: "🦅", active: false, req: { fam: { bow: 22000 }, kills: 350 }, hint: "Deal bow damage; fell 350 foes. Deadeye's mirror: close shots pay double." },
    // ---- shuriken arts: the thrown family earns its own legends (no wield requirement) ----
    exploding_shuriken: { id: "exploding_shuriken", abId: "exploding_shuriken", name: "Exploding Shuriken", icon: "💥", active: true, req: { el: { fire: 8000 }, fam: { thrown: 10000 }, kills: 200 }, hint: "Deal fire + thrown damage (bombs count); fell 200 foes. Pack shurikens — the art hurls your finest." },
    slime_shuriken:  { id: "slime_shuriken", abId: "slime_shuriken", name: "Slime Shuriken", icon: "🟢", active: true, req: { el: { water: 5000 }, fam: { thrown: 8000 }, kills: 150 }, hint: "Deal water + thrown damage; fell 150 foes. Pack shurikens — the art hurls your finest." },
    // ---- hammer art: the earth answers ----
    hammerfell_impact: { id: "hammerfell_impact", abId: "hammerfell_impact", name: "Hammerfell Impact", icon: "🔨", active: true, req: { fam: { hammer: 18000 }, kills: 300 }, hint: "Deal hammer damage; fell 300 foes. Break the earth itself." },
    // ---- unarmed art: the self, multiplied ----
    shadow_disciples: { id: "shadow_disciples", abId: "shadow_disciples", name: "Disciples of Shadow", icon: "🎭", active: true, req: { fam: { unarmed: 15000 }, kills: 350, uses: { eject: 30 } }, hint: "Fight bare-handed; fell 350 foes; slip away with ⏏️ Eject 30 times. Become legion, then trade places with yourself." },
    // ---- shield art: parry blows, turn them back ----
    stalwart_reflector: { id: "stalwart_reflector", abId: "stalwart_reflector", name: "Stalwart Reflector", icon: "🪞", active: true, req: { fam: { shield: 4000 }, kills: 100 }, hint: "Parry blows and turn them back (the Bulwark Rebound teaches fastest)." },
    // ---- taming art: the swarm answers the beastfriend (no weapon needed) ----
    locust_swarm: { id: "locust_swarm", abId: "locust_swarm", name: "Locust Swarm", icon: "🦗", active: true, req: { uses: { tame: 50, insect_tame: 10 } }, hint: "Tame 50 beasts, including at least 10 insects, to earn the swarm's trust." },
    thundering_crack: { id: "thundering_crack", abId: "thundering_crack", name: "Thundering Crack", icon: "⛈️", active: true, req: { el: { electric: 6000 }, fam: { whip: 10000 } }, hint: "Deal electric + whip damage." },
    whirlwind_slinger: { id: "whirlwind_slinger", abId: "whirlwind_slinger", name: "Whirlwind Slinger", icon: "🪀", active: true, req: { fam: { whip: 12000 }, kills: 150 }, hint: "Deal whip damage; fell 150 foes. Spin the spiral." },
  };
  // ---- tiered arsenals: who may wield what magic ----
  // Spells are tiered hedge (T1) -> battle (T2) -> war (T3) -> cataclysm (T4).
  // Only abilities the mob brain can actually cast are listed here. Warlords
  // unlock deeper tiers by depth (BOSS_MIN_EFF): eff1 hedge only, eff2-3
  // +battle, eff4 +war, eff5-6 everything including cataclysms. Self-care
  // (heal/panacea) is exempt: every warlord mends itself. Never in any mob
  // pool: eject (escape tool), grapple (no mob AI), revive / angel_of_life
  // (dead slots — no mob AI casts them).
 const SPELL_TIER = {
   whirlwind: 1, fireball: 1, frostbite: 1, water_jet: 1, venom: 1, dazzle: 1,
   heal: 1, shieldwall: 1, shadowstep: 1,
   lightning: 2, immolate: 2, glacier: 2, thunder_hex: 2, smite: 2, tornado: 2, tideburst: 2,
    wind_cutter: 2, whirlpool: 2, line_of_fire: 2, icicle_line: 2, toxic_stab: 2, tamisra: 2, life_drain: 2,
   cleanse: 2, warcry: 2, ember_weapon: 2,
   panacea: 3, blessed_weapon: 3,
   tidal_wave: 4, energy_beam: 4, meteorfall: 4, whiteout: 4, hurricane: 4,
    storm_of_blades: 4, primordial_sea: 4, raging_volcano: 4, crystal_prison: 4, burning_light: 4, barbed_plague: 4, void_hole: 4, blood_hole: 4,
 };
  // Active weapon techniques by tier (passives are learnt, never cast). The
  // apex arts (holy_sword 50x, tempest_lance 40x) never arm mobs — even scaled
  // down they one-shot heroes through walls of armor — and neither do the
  // ammo arts (shurikens need a pack to hurl) nor shadow_disciples (clones
  // need the hero's shadow machinery).
  const TECH_TIER = {
    iron_palm: 1, viper_flurry: 1, feint_attack: 1,
    skullsplitter: 2, spiral_pike: 2, avalanche: 2, cinder_edge: 2,
    dragon_coil: 2, thorn_reign: 2, comet_shot: 2, stalwart_reflector: 2,
    hammerfell_impact: 3, thundering_crack: 3, whirlwind_slinger: 3, locust_swarm: 3,
  };
  // Max spell/tech tier a warlord's bonus arsenal reaches (template signatures
  // + self-care always stay, whatever their tier).
  const BOSS_MAGIC_TIER = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4 };
  // Non-boss power bands (template XP): seasoned killers earn war-magic,
  // apex horrors earn a cataclysm + deeper arts. Mimics are exempt: their
  // teeth (percent hunger) are the threat, never a sky falling on an ambush.
 const MOB_ARSENAL = { POWER_XP: 100, APEX_XP: 150 };
 const MIMIC_KINDS = ["lesser_mimic", "mimic", "greater_mimic", "mimic_devourer"];
  // Doppelganger infiltrator: disguised as townsfolk/adventurers, mimic-style
  // ambush teeth + party betrayal. Marked ONLY at spawn (see AIDirector).
  // Revealed teeth are permanently hostile to heroes (never recruitable),
  // hunt within 22 tiles across save/load, die as teeth and never revive
  // (no auto-wake, inn mend, spell/panacea/angel/MP revive or party triage).
  // Any blow — even friendly fire or status ticks — tears the disguise, and
  // any disguised teeth near a weak hero (< BETRAY_HP_FRAC, local or traveler)
  // show their teeth.
  const DOPPELGANGER = {
    CHANCE: 0.05, LOW_LV_MAX: 15,
    BETRAY_HP_FRAC: 0.3, REVEAL_AGGRO_RADIUS: 12, REVEAL_AGGRO_CHANCE: 0.7,
    AMBUSH_BASE_PCT: 0.05, AMBUSH_PER10_PCT: 0.02,
  };
  // Status effect ids shared with src/status.js (kept here so configs stay in one place).
  // desc is the hover-tooltip line: what the effect DOES to its victim.
  const STATUS = {
    poison: { name: "Poisoned", icon: "☠️", desc: "loses % max HP per second until cured" },
    burn: { name: "Burning", icon: "🔥", desc: "takes damage per second and −DEF until cured" },
    freeze: { name: "Frozen", icon: "🧊", desc: "cannot move or attack" },
    paralyze: { name: "Paralyzed", icon: "🌩️", desc: "−AGI and −STR: slower, weaker, easier to hit" },
    blind: { name: "Blinded", icon: "🕶️", desc: "sees ~3 tiles only; 20% of its attacks miss" },
    bleed: { name: "Bleeding", icon: "🩸", desc: "loses % max HP per second until healed" },
    sunder: { name: "Sundered", icon: "🔻", desc: "−DEF; armor resists half as well" },
    stun: { name: "Stunned", icon: "💫", desc: "cannot move or attack" },
  };
  const HEALER_ROLES = ["healer", "priest", "cleric", "highpriest", "mesa_shaman", "frost_skald", "angel_priest", "choir_angel"];
  const ROLE_KIT = {
    warrior: ["whirlwind", "shieldwall"],
    mage: ["fireball", "frostbite", "heal"],
    healer: ["heal", "cleanse", "panacea", "revive", "shieldwall"],
    rogue: ["whirlwind"],
    ninja: ["whirlwind", "dazzle", "venom"],
    thief: ["whirlwind"],
    hunter: ["heal"],
    villager: ["heal"],
    guard: ["shieldwall", "whirlwind"],
    scholar: ["frostbite", "glacier", "fireball", "heal", "cleanse"],
    samurai: ["shieldwall"],
    priest: ["heal", "cleanse", "panacea", "revive", "shieldwall"],
    cleric: ["heal", "cleanse", "panacea", "revive", "shieldwall"],
    herbalist: ["heal", "cleanse", "panacea"],
    runesmith: ["fireball", "immolate", "shieldwall"],
    tidewarden: ["frostbite", "glacier", "heal", "cleanse"],
    unemployed: ["heal"],
    adventurer: ["heal", "whirlwind"],
    monarch: ["shieldwall", "warcry", "heal"],
    noble: ["heal", "dazzle"],
    knight: ["shieldwall", "whirlwind", "warcry"],
    chancellor: ["heal", "cleanse"],
    highpriest: ["heal", "cleanse", "panacea", "revive", "shieldwall"],
    marshal: ["shieldwall", "whirlwind", "grapple"],
    guildmaster: ["heal"],
    magistrate: ["shieldwall", "heal"],
    harbormaster: ["water_jet", "heal"],
    dockworker: ["heal", "whirlwind"],
    desert_nomad: ["heal", "grapple"],
    steppe_rider: ["whirlwind", "heal"],
    mesa_shaman: ["heal", "cleanse", "dazzle"],
   frost_skald: ["frostbite", "heal", "dazzle"],
   slave: ["heal"],
    // v16 civilized demons: hell townsfolk act like NPCs (trade/chat/recruit).
    civilized_succubus: ["heal", "cleanse", "dazzle"],
    civilized_infernal: ["heal", "shieldwall", "immolate"],
    civilized_hellbeast: ["heal", "whirlwind"],
    civilized_doom: ["heal", "shieldwall", "warcry"],
    hell_priest: ["heal", "cleanse", "panacea", "revive", "shieldwall"],
    hell_merchant: ["heal", "dazzle"],
    hell_guard: ["shieldwall", "whirlwind", "immolate"],
    // v19+ heaven angels: civilized celestials act like NPCs (trade/chat/recruit).
    dawn_angel: ["heal", "cleanse", "smite", "shieldwall"],
    choir_angel: ["heal", "cleanse", "panacea", "dazzle"],
    seraph_guard: ["shieldwall", "whirlwind", "smite", "warcry"],
    scroll_angel: ["smite", "heal", "cleanse", "dazzle"],
    angel_guard: ["shieldwall", "whirlwind", "heal"],
    angel_merchant: ["heal", "dazzle"],
    angel_priest: ["heal", "cleanse", "panacea", "revive", "shieldwall", "smite"],
    heavendweller: ["heal"],
  };
  const MOB_TEMPLATES = {
    slime:    { name: "Slime", hp: 26, mp: 0, atk: 7, def: 1, spd: 2.2, xp: 10, abilities: [], tint: "#5dd66b", body: "blob" },
    bat:      { name: "Cave Bat", hp: 20, mp: 0, atk: 8, def: 0, spd: 4.2, xp: 12, abilities: [], tint: "#9a7bff", body: "winged" },
    goblin:   { name: "Goblin", hp: 40, mp: 6, atk: 11, def: 3, spd: 3.0, xp: 22, archer: true, abilities: [], tint: "#3fa34d", body: "humanoid" },
    wolf:     { name: "Dire Wolf", hp: 46, mp: 0, atk: 13, def: 2, spd: 4.6, xp: 26, abilities: [], tint: "#9c9c9c", body: "beast", tamable: true },
   mushroom: { name: "Sporeling", hp: 34, mp: 8, atk: 9, def: 4, spd: 1.8, xp: 18, abilities: [], tint: "#e07b39", body: "construct" },
    // ---- mounts & tamables (beast lodge / stable) ----
    wild_horse: { name: "Wild Horse", hp: 70, mp: 0, atk: 12, def: 4, spd: 5.4, xp: 40, abilities: [], tint: "#8a5a33", body: "beast", tamable: true, mount: { speed: 1.6, swim: false }, docile: true },
    // ---- stable-bred horses (horse market only — never spawn wild) ----
    // Bred for the saddle, not the fight: more HP, faster, tougher hides than
    // any wild horse — but no attack training (low ATK, no abilities).
    stable_pony:    { name: "Meadow Pony", hp: 105, mp: 0, atk: 5, def: 7, spd: 5.6, xp: 40, abilities: [], tint: "#b08355", body: "beast", tamable: false, mount: { speed: 1.6, swim: false }, docile: true },
    stable_courser: { name: "Gallant Courser", hp: 115, mp: 0, atk: 5, def: 5, spd: 6.4, xp: 40, abilities: [], tint: "#4a5a8a", body: "beast", tamable: false, mount: { speed: 1.75, swim: false }, docile: true },
    stable_destrier:{ name: "Bulwark Destrier", hp: 155, mp: 0, atk: 6, def: 11, spd: 5.2, xp: 40, abilities: [], tint: "#7a2a2a", body: "beast", tamable: false, mount: { speed: 1.55, swim: false }, docile: true },
    stable_zephyr:  { name: "Silverwind Charger", hp: 130, mp: 0, atk: 5, def: 7, spd: 6.6, xp: 40, abilities: [], tint: "#c9ccd4", body: "beast", tamable: false, mount: { speed: 1.9, swim: false }, docile: true },
    stable_aegis:   { name: "Royal Aegis", hp: 170, mp: 0, atk: 6, def: 13, spd: 6.3, xp: 40, abilities: [], tint: "#6a2a8a", body: "beast", tamable: false, mount: { speed: 1.8, swim: false }, docile: true },
    // ---- heaven-bred (heaven stables only — never spawn wild) ----
    // The finest saddle lines in the world: winged speed + moonhorn guard.
    pegasus: { name: "Dawn Pegasus", hp: 185, mp: 0, atk: 6, def: 12, spd: 7.0, xp: 40, abilities: [], tint: "#eef4ff", body: "winged", tamable: false, mount: { speed: 2.0, swim: false }, docile: true },
    unicorn: { name: "Moonhorn Unicorn", hp: 200, mp: 0, atk: 6, def: 14, spd: 6.6, xp: 40, abilities: [], tint: "#fbf3ff", body: "beast", tamable: false, mount: { speed: 1.9, swim: false }, docile: true },
    // ---- hell-bred hound mount: rideable wild line, also sold in hell stables ----
    tide_turtle: { name: "Tide Turtle", hp: 110, mp: 26, atk: 15, def: 10, spd: 3.0, xp: 70, abilities: ["water_jet"], tint: "#3a7a5a", body: "beast", tamable: true, mount: { speed: 1.35, swim: true, landMul: 0.9 }, aquatic: true, diver: true, docile: true },
    cinder_steed: { name: "Cinder Steed", hp: 85, mp: 0, atk: 14, def: 5, spd: 5.6, xp: 55, abilities: [], tint: "#c9401e", body: "beast", tamable: true, mount: { speed: 1.55, lava: true, landMul: 1 }, lavaBorn: true, diver: true, docile: true },
    magma_tortoise: { name: "Magma Tortoise", hp: 130, mp: 12, atk: 17, def: 11, spd: 2.8, xp: 85, abilities: ["immolate"], tint: "#7a2a1a", body: "beast", tamable: true, mount: { speed: 1.3, swim: true, lava: true, landMul: 0.9 }, aquatic: true, lavaBorn: true, diver: true, docile: true },
    skeleton: { name: "Skeleton", hp: 60, mp: 8, atk: 15, def: 5, spd: 2.8, xp: 38, archer: true, abilities: [], tint: "#e8e8e8", body: "undead", undead: true },
    cultist:  { name: "Cultist", hp: 55, mp: 20, atk: 14, def: 3, spd: 2.6, xp: 42, abilities: ["fireball", "frostbite"], tint: "#7a2b8f", body: "humanoid" },
    wraith:   { name: "Wraith", hp: 80, mp: 24, atk: 18, def: 4, spd: 3.4, xp: 65, abilities: ["frostbite", "fireball"], tint: "#59d6d6", body: "ghost", undead: true },
    lesser_wyvern: { name: "Lesser Wyvern", hp: 150, mp: 40, atk: 27, def: 8, spd: 4.2, xp: 170, abilities: ["fireball"], tint: "#3fa34d", body: "winged" },
    velociraptor:  { name: "Velociraptor", hp: 125, mp: 0, atk: 31, def: 6, spd: 5.4, xp: 155, abilities: ["whirlwind"], tint: "#c96b4a", body: "beast" },
    // ---- Greek ----
    minotaur_calf: { name: "Minotaur Calf", hp: 70, mp: 0, atk: 16, def: 6, spd: 2.6, xp: 45, abilities: ["whirlwind"], tint: "#7a4a2b", body: "brute" },
    harpy:    { name: "Harpy", hp: 48, mp: 12, atk: 15, def: 3, spd: 5.0, xp: 40, archer: true, abilities: ["whirlwind"], tint: "#b08ad9", body: "winged" },
    cyclops_whelp: { name: "Cyclops Whelp", hp: 90, mp: 0, atk: 18, def: 7, spd: 2.2, xp: 55, abilities: ["whirlwind"], tint: "#9a8a6a", body: "brute" },
    satyr:    { name: "Satyr Piper", hp: 44, mp: 14, atk: 13, def: 3, spd: 3.6, xp: 34, abilities: ["frostbite"], tint: "#a06a3a", body: "humanoid" },
    siren:    { name: "Siren", hp: 52, mp: 26, atk: 14, def: 3, spd: 3.8, xp: 48, abilities: ["frostbite", "dazzle"], tint: "#6ad9d0", body: "winged" },
    centaur_foal: { name: "Centaur Foal", hp: 66, mp: 6, atk: 16, def: 5, spd: 4.4, xp: 46, archer: true, abilities: [], tint: "#8a5a33", body: "beast" },
    stymphalian: { name: "Stymphalian Bird", hp: 40, mp: 8, atk: 16, def: 2, spd: 5.2, xp: 38, archer: true, abilities: [], tint: "#c9a227", body: "winged" },
    gorgon_spawn: { name: "Gorgon Spawn", hp: 58, mp: 18, atk: 16, def: 5, spd: 3.0, xp: 50, abilities: ["venom", "glacier"], tint: "#4a9a4a", body: "serpent" },
    hydra_spawn: { name: "Hydra Spawn", hp: 110, mp: 20, atk: 20, def: 6, spd: 2.8, xp: 90, abilities: ["venom", "whirlwind"], tint: "#2e7d46", body: "serpent" },
    chimera_cub: { name: "Chimera Cub", hp: 95, mp: 24, atk: 19, def: 5, spd: 3.8, xp: 80, abilities: ["fireball"], tint: "#c96b2e", body: "beast" },
    // ---- Norse ----
    kobold:   { name: "Kobold", hp: 30, mp: 6, atk: 10, def: 2, spd: 3.8, xp: 18, archer: true, abilities: [], tint: "#7a9a3a", body: "humanoid" },
    draugr:   { name: "Draugr", hp: 75, mp: 10, atk: 17, def: 6, spd: 2.4, xp: 55, abilities: ["shieldwall"], tint: "#6a7a6a", body: "undead", undead: true },
    troll_whelp: { name: "Troll Whelp", hp: 110, mp: 0, atk: 19, def: 8, spd: 2.0, xp: 70, abilities: ["whirlwind"], tint: "#5a7a5a", body: "brute" },
    fenrir_pup: { name: "Fenrir Pup", hp: 60, mp: 0, atk: 17, def: 3, spd: 5.0, xp: 50, abilities: [], tint: "#3a3a4a", body: "beast", tamable: true },
    hulder:   { name: "Hulder", hp: 50, mp: 20, atk: 14, def: 4, spd: 3.4, xp: 42, abilities: ["dazzle", "frostbite"], tint: "#d9a0c0", body: "humanoid" },
    nokk:     { name: "Nøkk", hp: 54, mp: 28, atk: 15, def: 3, spd: 3.2, xp: 48, abilities: ["water_jet", "frostbite"], tint: "#3a8a9a", body: "humanoid", aquatic: true, diver: true },
    lindworm: { name: "Lindworm", hp: 130, mp: 20, atk: 23, def: 7, spd: 3.6, xp: 120, abilities: ["venom"], tint: "#4a6a2a", body: "serpent" },
    valkyrie_renegade: { name: "Renegade Valkyrie", hp: 85, mp: 30, atk: 20, def: 6, spd: 4.2, xp: 95, abilities: ["lightning"], tint: "#d9d9e0", body: "winged" },
    // ---- Egyptian ----
    anubite:  { name: "Anubite Jackal", hp: 68, mp: 12, atk: 17, def: 5, spd: 4.0, xp: 55, archer: true, abilities: [], tint: "#2a2a2a", body: "beast" },
    scarab_swarm: { name: "Scarab Swarm", hp: 36, mp: 0, atk: 12, def: 1, spd: 4.6, xp: 22, abilities: [], tint: "#8a6a1a", body: "swarm" },
    mummy:    { name: "Mummy", hp: 85, mp: 14, atk: 18, def: 7, spd: 2.0, xp: 60, abilities: ["venom"], tint: "#c9b98a", body: "undead", undead: true },
    sphinx_cub: { name: "Sphinx Cub", hp: 80, mp: 30, atk: 18, def: 6, spd: 3.6, xp: 75, abilities: ["dazzle", "fireball"], tint: "#d9b96a", body: "beast" },
    sobek_spawn: { name: "Sobek Spawn", hp: 100, mp: 24, atk: 21, def: 8, spd: 3.0, xp: 80, abilities: ["water_jet"], tint: "#3a6a3a", body: "beast", aquatic: true, diver: true },
    khepri_beetle: { name: "Khepri Beetle", hp: 44, mp: 10, atk: 13, def: 6, spd: 2.6, xp: 30, abilities: ["shieldwall"], tint: "#5a3a8a", body: "swarm" },
    // ---- Japanese ----
    kappa:    { name: "Kappa", hp: 48, mp: 22, atk: 14, def: 4, spd: 3.2, xp: 40, abilities: ["water_jet"], tint: "#3a8a4a", body: "humanoid" },
    oni_imp:  { name: "Oni Imp", hp: 80, mp: 10, atk: 18, def: 6, spd: 2.8, xp: 58, abilities: ["whirlwind"], tint: "#c93b3b", body: "brute" },
    tengu_crow: { name: "Crow Tengu", hp: 56, mp: 24, atk: 16, def: 4, spd: 4.6, xp: 52, abilities: ["lightning"], tint: "#2a2a3a", body: "winged" },
    kitsune_trickster: { name: "Kitsune Trickster", hp: 52, mp: 34, atk: 15, def: 3, spd: 4.2, xp: 60, abilities: ["fireball", "dazzle"], tint: "#e08a3a", body: "beast" },
    yuki_onna: { name: "Yuki-onna", hp: 58, mp: 36, atk: 16, def: 3, spd: 3.4, xp: 62, abilities: ["glacier", "frostbite"], tint: "#e0f0ff", body: "ghost", undead: true },
    gasha_skull: { name: "Gasha Skull", hp: 70, mp: 0, atk: 17, def: 8, spd: 2.2, xp: 55, abilities: [], tint: "#e8e8e8", body: "construct", undead: true },
    nurikabe: { name: "Nurikabe", hp: 130, mp: 0, atk: 14, def: 14, spd: 1.2, xp: 70, abilities: ["shieldwall"], tint: "#8a8a92", body: "construct" },
    tanuki:   { name: "Tanuki", hp: 42, mp: 18, atk: 12, def: 4, spd: 3.4, xp: 30, abilities: ["dazzle", "whirlwind"], tint: "#6a4a2a", body: "beast", tamable: true },
    // ---- Celtic ----
    banshee:  { name: "Banshee", hp: 54, mp: 34, atk: 15, def: 2, spd: 3.6, xp: 58, abilities: ["dazzle", "thunder_hex"], tint: "#c9d9e8", body: "ghost", undead: true },
    redcap:   { name: "Redcap", hp: 46, mp: 6, atk: 16, def: 3, spd: 4.0, xp: 36, archer: true, abilities: [], tint: "#8a1a1a", body: "humanoid" },
    kelpie:   { name: "Kelpie", hp: 72, mp: 24, atk: 18, def: 5, spd: 4.4, xp: 65, abilities: ["water_jet", "glacier"], tint: "#1a4a5a", body: "beast", tamable: true, aquatic: true, diver: true, mount: { speed: 1.3, swim: true, landMul: 0.85 } },
    tidecaller: { name: "Tidecaller Eel", hp: 68, mp: 30, atk: 17, def: 4, spd: 4.0, xp: 62, abilities: ["water_jet", "lightning"], tint: "#2a9a8a", body: "serpent", aquatic: true, diver: true },
    deepmaw: { name: "Deepmaw", hp: 170, mp: 40, atk: 28, def: 9, spd: 3.4, xp: 160, abilities: ["venom", "tideburst"], tint: "#0e2a3a", body: "serpent", aquatic: true, diver: true },
    dullahan_herald: { name: "Dullahan Herald", hp: 78, mp: 16, atk: 19, def: 5, spd: 4.2, xp: 70, abilities: ["frostbite"], tint: "#2a2a3a", body: "undead", undead: true },
    puca:     { name: "Púca", hp: 60, mp: 26, atk: 16, def: 4, spd: 4.0, xp: 55, abilities: ["dazzle", "whirlwind"], tint: "#3a3a3a", body: "beast" },
    // ---- Slavic ----
    leshy:    { name: "Leshy", hp: 95, mp: 26, atk: 19, def: 7, spd: 2.8, xp: 75, abilities: ["whirlwind", "venom"], tint: "#3a6a2a", body: "brute" },
    vodyanoy: { name: "Vodyanoy", hp: 64, mp: 26, atk: 17, def: 5, spd: 2.8, xp: 55, abilities: ["water_jet"], tint: "#2a5a4a", body: "humanoid", aquatic: true, diver: true },
    rusalka:  { name: "Rusalka", hp: 50, mp: 32, atk: 14, def: 3, spd: 3.6, xp: 52, abilities: ["dazzle", "water_jet"], tint: "#7ad9c9", body: "ghost", undead: true, aquatic: true, diver: true },
    striga:   { name: "Striga", hp: 62, mp: 22, atk: 18, def: 4, spd: 3.8, xp: 60, abilities: ["venom"], tint: "#5a3a5a", body: "ghost", undead: true },
    domovoi_rogue: { name: "Rogue Domovoi", hp: 40, mp: 20, atk: 12, def: 5, spd: 3.0, xp: 32, abilities: ["shieldwall", "fireball"], tint: "#7a5a3a", body: "humanoid" },
    // ---- wider myth ----
    naga:     { name: "Naga", hp: 76, mp: 30, atk: 19, def: 5, spd: 3.6, xp: 72, abilities: ["venom", "lightning"], tint: "#3a9a6a", body: "serpent" },
    rakshasa_cub: { name: "Rakshasa Cub", hp: 66, mp: 28, atk: 18, def: 5, spd: 3.4, xp: 68, abilities: ["fireball"], tint: "#d98a2a", body: "humanoid" },
    lamassu_cub: { name: "Lamassu Cub", hp: 88, mp: 24, atk: 19, def: 8, spd: 3.2, xp: 78, abilities: ["shieldwall", "smite"], tint: "#d9c9a0", body: "beast" },
    utukku:   { name: "Utukku", hp: 58, mp: 28, atk: 17, def: 3, spd: 3.4, xp: 56, abilities: ["thunder_hex", "frostbite"], tint: "#4a3a6a", body: "ghost", undead: true },
    jiangshi: { name: "Jiangshi", hp: 72, mp: 12, atk: 17, def: 7, spd: 2.4, xp: 58, abilities: ["thunder_hex"], tint: "#2a4a6a", body: "undead", undead: true },
    goblin_shaman: { name: "Goblin Shaman", hp: 55, mp: 30, atk: 14, def: 4, spd: 3.0, xp: 48, abilities: ["fireball", "frostbite"], tint: "#2f8a4f", body: "humanoid" },
    // ---- enemy-base garrisons: twelve far-flung holdings. Defenders cap at
    // lv 35 in spawn code; bosses the same.
    orc_grunt: { name: "Orc Grunt", hp: 95, mp: 8, atk: 20, def: 7, spd: 2.8, xp: 70, abilities: ["whirlwind"], tint: "#4a7a2a", body: "brute" },
    orc_shaman: { name: "Orc Shaman", hp: 80, mp: 40, atk: 19, def: 5, spd: 2.8, xp: 85, abilities: ["fireball", "heal"], tint: "#6a9a2a", body: "humanoid" },
    orc_warchief: { name: "Orc Warchief", hp: 720, mp: 70, atk: 30, def: 4, spd: 3.0, xp: 420, abilities: ["whirlwind", "immolate", "heal", "panacea"], tint: "#3a5a1a", body: "brute", boss: true },
    goblin_brute: { name: "Goblin Brute", hp: 110, mp: 6, atk: 21, def: 8, spd: 2.6, xp: 75, abilities: ["whirlwind"], tint: "#2a6a2a", body: "brute" },
    bandit_warlord: { name: "Bandit Warlord", hp: 380, mp: 50, atk: 28, def: 4, spd: 3.4, xp: 380, abilities: ["whirlwind", "venom", "heal", "panacea"], tint: "#5a2a1a", body: "humanoid", boss: true },
    kobold_shaman: { name: "Kobold Shaman", hp: 48, mp: 30, atk: 13, def: 4, spd: 3.6, xp: 44, abilities: ["fireball"], tint: "#6a8a2a", body: "humanoid" },
    kobold_king: { name: "Kobold King", hp: 360, mp: 90, atk: 27, def: 4, spd: 3.6, xp: 400, abilities: ["whirlwind", "fireball", "heal", "panacea"], tint: "#8aaa3a", body: "humanoid", boss: true },
    gnoll: { name: "Gnoll", hp: 85, mp: 6, atk: 19, def: 6, spd: 4.2, xp: 65, abilities: ["whirlwind"], tint: "#9a7a4a", body: "beast" },
    gnoll_hunter: { name: "Gnoll Hunter", hp: 70, mp: 10, atk: 18, def: 5, spd: 4.4, xp: 68, archer: true, abilities: [], tint: "#7a5a3a", body: "beast" },
    gnoll_alpha: { name: "Gnoll Alpha", hp: 400, mp: 60, atk: 29, def: 4, spd: 4.4, xp: 410, abilities: ["whirlwind", "venom", "heal", "panacea"], tint: "#b08a4a", body: "beast", boss: true },
    harpy_matriarch: { name: "Harpy Matriarch", hp: 600, mp: 110, atk: 29, def: 4, spd: 5.0, xp: 430, archer: true, abilities: ["whirlwind", "lightning", "heal", "panacea"], tint: "#c09ae9", body: "winged", boss: true },
    troll_king: { name: "Troll King", hp: 760, mp: 50, atk: 31, def: 4, spd: 2.2, xp: 430, abilities: ["whirlwind", "shieldwall", "heal", "panacea"], tint: "#4a6a4a", body: "brute", boss: true },
    slime_empress: { name: "Slime Empress", hp: 140, mp: 40, atk: 20, def: 6, spd: 2.4, xp: 115, abilities: ["tideburst", "venom"], tint: "#ff6ad9", body: "blob" },
    wyvern_fledgling: { name: "Wyvern Fledgling", hp: 90, mp: 20, atk: 20, def: 5, spd: 4.4, xp: 85, abilities: ["fireball"], tint: "#5a9a4d", body: "winged" },
    // ---- deep wilds: dark forests, tundra, seas, peaks ----
    gloomspinner: { name: "Gloomspinner", hp: 75, mp: 20, atk: 20, def: 5, spd: 4.4, xp: 70, abilities: ["venom"], tint: "#3a2a4a", body: "swarm" },
    umbral_stag: { name: "Umbral Stag", hp: 90, mp: 30, atk: 21, def: 6, spd: 4.6, xp: 80, abilities: ["dazzle", "thunder_hex"], tint: "#2a3a4a", body: "beast" },
    sandmaw:  { name: "Sandmaw", hp: 130, mp: 10, atk: 24, def: 7, spd: 3.2, xp: 110, abilities: ["venom", "whirlwind"], tint: "#c9a45a", body: "serpent" },
    // Land-digger: burrows through soil (diver, but only on solid ground —
    // never in water or magma). Bursts out under its prey to strike.
    burrow_mole: { name: "Burrow Mole", hp: 78, mp: 10, atk: 17, def: 8, spd: 3.4, xp: 62, abilities: ["whirlwind"], tint: "#6b5a4e", body: "beast", diver: true, burrower: true },
    // ---- giant insects: tarantulas, burrowing ants, scorpions, hornets ----
    // Big chitinous hunters of the wilds and the hive. Locked behind
    // Vermin Lore (taming tree) — they never submit for an untrained hero.
    giant_tarantula: { name: "Giant Tarantula", hp: 130, mp: 20, atk: 24, def: 7, spd: 3.6, xp: 120, abilities: ["venom", "whirlwind"], tint: "#4a2a5a", body: "swarm" },
    tomb_scorpion: { name: "Tomb Scorpion", hp: 120, mp: 16, atk: 27, def: 9, spd: 3.0, xp: 120, abilities: ["venom", "shieldwall"], tint: "#b8862a", body: "swarm" },
    siege_ant: { name: "Siege Ant", hp: 150, mp: 8, atk: 23, def: 13, spd: 2.8, xp: 125, abilities: ["shieldwall", "whirlwind"], tint: "#6a3a1a", body: "swarm", diver: true, burrower: true },
    hive_hornet: { name: "Hive Hornet", hp: 80, mp: 24, atk: 25, def: 4, spd: 5.2, xp: 95, abilities: ["venom", "lightning"], tint: "#d9a020", body: "swarm" },
    rime_wolf: { name: "Rime Wolf", hp: 70, mp: 10, atk: 19, def: 5, spd: 5.0, xp: 60, abilities: ["frostbite"], tint: "#cfe0ea", body: "beast", tamable: true },
   shiver_owl: { name: "Shiver Owl", hp: 55, mp: 30, atk: 16, def: 3, spd: 4.8, xp: 55, abilities: ["dazzle", "frostbite"], tint: "#b9c9d9", body: "winged" },
    coral_crab: { name: "Coral Crab", hp: 85, mp: 26, atk: 18, def: 12, spd: 2.2, xp: 65, abilities: ["water_jet", "shieldwall"], tint: "#e06a5a", body: "beast", tamable: true, aquatic: true, diver: true, docile: true },
    abyss_serpent: { name: "Abyss Serpent", hp: 150, mp: 60, atk: 26, def: 8, spd: 3.8, xp: 150, abilities: ["tideburst", "glacier", "venom"], tint: "#1a4a6a", body: "serpent", aquatic: true, diver: true },
    // ---- dungeon lake ambushers: surface to strike, dive to hide ----
    mire_lurker: { name: "Mire Lurker", hp: 85, mp: 22, atk: 20, def: 6, spd: 3.0, xp: 75, abilities: ["water_jet", "venom"], tint: "#3a5a2a", body: "beast", aquatic: true, diver: true },
    wreck_eel: { name: "Wreck Eel", hp: 95, mp: 34, atk: 22, def: 5, spd: 3.8, xp: 85, abilities: ["water_jet", "lightning"], tint: "#2a5a6a", body: "serpent", aquatic: true, diver: true },
    magma_eel: { name: "Magma Eel", hp: 100, mp: 34, atk: 23, def: 6, spd: 3.8, xp: 88, abilities: ["fireball", "immolate"], tint: "#e05a1e", body: "serpent", lavaBorn: true, diver: true },
    cinder_maw: { name: "Cinder Maw", hp: 155, mp: 24, atk: 27, def: 9, spd: 3.0, xp: 150, abilities: ["fireball", "immolate", "whirlwind"], tint: "#8a1f0e", body: "beast", lavaBorn: true, diver: true },
    // ---- leviathan deep: the drowned water dungeon's own horrors ----
    // Every one dives (aquatic + diver), so the whole delve dodges underwater.
    leviathan: { name: "Leviathan", hp: 2880, mp: 230, atk: 46, def: 3, spd: 3.6, xp: 850, abilities: ["tideburst", "tidal_wave", "lightning", "glacier", "whirlwind", "heal", "panacea"], tint: "#123a52", body: "serpent", aquatic: true, diver: true, boss: true },
    abyss_tentacle: { name: "Abyss Tentacle", hp: 120, mp: 30, atk: 24, def: 8, spd: 3.2, xp: 110, abilities: ["tideburst", "venom"], tint: "#5a2a6a", body: "serpent", aquatic: true, diver: true },
    // ---- shallow-water lords: flooded halls and drowned wrecks needed
    // tier-1/2 warlords of their own, not borrowed pirates — all dive.
    drowned_captain: { name: "Drowned Captain", hp: 380, mp: 80, atk: 28, def: 4, spd: 3.2, xp: 390, abilities: ["tideburst", "whirlwind", "heal", "panacea"], tint: "#2a5a6a", body: "undead", boss: true, undead: true, aquatic: true, diver: true },
    kappa_king: { name: "Kappa King", hp: 690, mp: 100, atk: 28, def: 4, spd: 3.4, xp: 400, abilities: ["tideburst", "venom", "whirlwind", "heal", "panacea"], tint: "#2f8a4f", body: "humanoid", boss: true, aquatic: true, diver: true },
    rusalka_queen: { name: "Rusalka Queen", hp: 1000, mp: 140, atk: 30, def: 4, spd: 3.6, xp: 440, abilities: ["tideburst", "dazzle", "thunder_hex", "heal", "panacea"], tint: "#7ad9c9", body: "ghost", boss: true, undead: true, aquatic: true, diver: true },
    // ---- mimic family: chest-teeth in four strengths + a gate that lies ----
    // Lesser is a pale mossy chest with one eye (early floors); the classic
    // Mimic sits in the middle; Greater is iron-banded with claw arms; the
    // Devourer is a fleshy three-eyed maw. The Threshold Devourer is the
    // dungeon boss that lies as the way-down portal itself (see game.js).
    // Trickery (E to open / step through) always bites + stuns + leaves the
    // teeth hungry for percentages; striking first exposes plain normal damage.
    lesser_mimic: { name: "Lesser Mimic", hp: 110, mp: 20, atk: 18, def: 6, spd: 3.0, xp: 90, abilities: ["whirlwind"], tint: "#8aa86a", body: "blob" },
    mimic: { name: "Mimic", hp: 160, mp: 40, atk: 26, def: 8, spd: 3.4, xp: 150, abilities: ["whirlwind", "venom", "glacier"], tint: "#7a4a8a", body: "blob" },
    greater_mimic: { name: "Greater Mimic", hp: 220, mp: 60, atk: 32, def: 11, spd: 3.6, xp: 220, abilities: ["whirlwind", "venom", "immolate"], tint: "#5a2a3a", body: "blob" },
   mimic_devourer: { name: "Mimic Devourer", hp: 320, mp: 90, atk: 38, def: 13, spd: 3.8, xp: 340, abilities: ["whirlwind", "venom", "glacier", "immolate", "tideburst"], tint: "#8a1a4a", body: "blob" },
    doppelganger: { name: "Doppelganger", hp: 200, mp: 60, atk: 28, def: 10, spd: 3.6, xp: 200, abilities: ["whirlwind", "venom", "dazzle"], tint: "#6a4a8a", body: "humanoid" },
   portal_devourer: { name: "Threshold Devourer", hp: 520, mp: 140, atk: 34, def: 2, spd: 3.2, xp: 600, abilities: ["whirlwind", "venom", "glacier", "lightning", "heal", "panacea"], tint: "#4a2a8a", body: "construct", boss: true },
    voidstalker: { name: "Voidstalker", hp: 2640, mp: 230, atk: 42, def: 2, spd: 4.6, xp: 760, abilities: ["shadowstep", "venom", "lightning", "whirlwind", "heal", "panacea"], tint: "#1a0f2e", body: "humanoid", boss: true },
   // ---- elemental apex: volcanoes and mountain peaks ----
   phoenix:  { name: "Phoenix", hp: 120, mp: 60, atk: 24, def: 6, spd: 4.8, xp: 130, abilities: ["fireball", "immolate", "dazzle"], tint: "#ff7b2e", body: "winged" },
   yeti:     { name: "Yeti", hp: 150, mp: 30, atk: 26, def: 10, spd: 3.0, xp: 140, abilities: ["glacier", "frostbite"], tint: "#dfe9f2", body: "brute" },
    // ---- overworld apex: lv-70 ancients roost in the seven highlands
    // (mountain, volcano + the five far-frontier wilds below). The ONLY
    // overworld mobs allowed past 50 (spawn code sets lv 70 directly; the
    // biome curve itself caps at 50).
   peak_dragon: { name: "Peak Dragon", hp: 420, mp: 120, atk: 42, def: 14, spd: 4.6, xp: 300, abilities: ["fireball", "immolate", "whirlwind"], tint: "#a01818", body: "winged" },
    // ---- far-frontier apex: one signature ancient per new highland ----
    frostwyrm: { name: "Frostwyrm", hp: 440, mp: 140, atk: 40, def: 15, spd: 3.2, xp: 175, abilities: ["glacier", "frostbite", "whirlwind"], tint: "#bfe9ff", body: "serpent", tamable: true },
    mire_hydra: { name: "Mire Hydra", hp: 480, mp: 120, atk: 44, def: 13, spd: 2.8, xp: 180, abilities: ["venom", "tideburst", "whirlwind"], tint: "#2e6a3a", body: "serpent", aquatic: true, diver: true, tamable: true },
    tempest_roc: { name: "Tempest Roc", hp: 400, mp: 160, atk: 40, def: 12, spd: 5.0, xp: 175, abilities: ["lightning", "tornado", "dazzle"], tint: "#3a6ad9", body: "winged", tamable: true },
    prism_colossus: { name: "Prism Colossus", hp: 520, mp: 140, atk: 42, def: 16, spd: 2.4, xp: 185, abilities: ["dazzle", "glacier", "lightning"], tint: "#c9a7ff", body: "construct" },
    umbral_wyrm: { name: "Umbral Wyrm", hp: 460, mp: 180, atk: 43, def: 12, spd: 4.2, xp: 190, abilities: ["thunder_hex", "frostbite", "venom"], tint: "#2a1a4a", body: "winged", undead: true },
    // ---- human foes: hostile on sight like any mob (they hunt the player,
    // party AND villagers — guards intervene). Never spawn near towns.
    bandit:   { name: "Bandit", hp: 52, mp: 6, atk: 14, def: 4, spd: 3.4, xp: 40, archer: true, abilities: [], tint: "#8a5a33", body: "humanoid" },
    outlaw:   { name: "Outlaw", hp: 70, mp: 12, atk: 17, def: 5, spd: 3.6, xp: 58, archer: true, abilities: ["whirlwind"], tint: "#5a3a5a", body: "humanoid" },
    murderer: { name: "Murderer", hp: 95, mp: 18, atk: 21, def: 6, spd: 4.0, xp: 85, abilities: ["venom", "whirlwind"], tint: "#7a1f1f", body: "humanoid" },
    boss:     { name: "Dungeon Lord", hp: 320, mp: 60, atk: 24, def: 4, spd: 3.0, xp: 300, abilities: ["fireball", "whirlwind", "frostbite", "heal", "panacea"], tint: "#ff3b3b", body: "brute", boss: true, undead: true },
    // ---- mythic bosses: one per delve, picked by delve seed + floor ----
    goblin_king: { name: "Goblin King", hp: 380, mp: 80, atk: 28, def: 4, spd: 3.2, xp: 380, archer: true, abilities: ["whirlwind", "heal", "panacea"], tint: "#2f8a2f", body: "humanoid", boss: true },
    slime_sovereign: { name: "Slime Sovereign", hp: 750, mp: 120, atk: 26, def: 4, spd: 2.4, xp: 420, abilities: ["tideburst", "venom", "whirlwind", "heal", "panacea"], tint: "#ff4ad9", body: "blob", boss: true },
    skeleton_warlord: { name: "Skeleton Warlord", hp: 420, mp: 80, atk: 30, def: 4, spd: 3.0, xp: 430, abilities: ["whirlwind", "shieldwall", "heal", "panacea"], tint: "#f0f0f0", body: "undead", boss: true, undead: true },
    wraith_sovereign: { name: "Wraith Sovereign", hp: 1140, mp: 170, atk: 32, def: 4, spd: 3.6, xp: 510, abilities: ["frostbite", "fireball", "thunder_hex", "heal", "panacea"], tint: "#59d6d6", body: "ghost", boss: true, undead: true },
    cultist_hierophant: { name: "Hierophant of the Pit", hp: 380, mp: 160, atk: 28, def: 4, spd: 2.8, xp: 450, abilities: ["fireball", "immolate", "lightning", "heal", "panacea"], tint: "#4a1a6a", body: "humanoid", boss: true },
    wyvern_matriarch: { name: "Wyvern Matriarch", hp: 2700, mp: 190, atk: 42, def: 3, spd: 4.4, xp: 700, abilities: ["fireball", "immolate", "whirlwind", "heal", "panacea"], tint: "#3f7d3a", body: "winged", boss: true },
    minotaur_warlord: { name: "Minotaur Warlord", hp: 1040, mp: 90, atk: 36, def: 6, spd: 3.0, xp: 580, abilities: ["whirlwind", "shieldwall", "heal", "panacea"], tint: "#5a3a22", body: "brute", boss: true },
    medusa_queen: { name: "Medusa Queen", hp: 1170, mp: 170, atk: 32, def: 4, spd: 3.2, xp: 560, abilities: ["venom", "glacier", "dazzle", "heal", "panacea"], tint: "#3a8a3a", body: "serpent", boss: true },
    jotunn_jarl: { name: "Jötunn Jarl", hp: 2740, mp: 170, atk: 44, def: 3, spd: 2.8, xp: 720, abilities: ["glacier", "whirlwind", "frostbite", "heal", "panacea"], tint: "#9ab8d9", body: "brute", boss: true },
    draugr_king: { name: "Draugr King", hp: 1020, mp: 120, atk: 34, def: 6, spd: 2.6, xp: 590, abilities: ["shieldwall", "venom", "heal", "panacea"], tint: "#4a5a4a", body: "undead", boss: true, undead: true },
    cursed_pharaoh: { name: "Cursed Pharaoh", hp: 1290, mp: 190, atk: 32, def: 4, spd: 2.6, xp: 610, abilities: ["thunder_hex", "fireball", "shieldwall", "heal", "panacea"], tint: "#d9b96a", body: "undead", boss: true, undead: true },
    oni_daimyo: { name: "Oni Daimyō", hp: 1640, mp: 140, atk: 40, def: 6, spd: 3.0, xp: 660, abilities: ["whirlwind", "immolate", "heal", "panacea"], tint: "#c93b3b", body: "brute", boss: true },
    tengu_stormlord: { name: "Tengu Stormlord", hp: 1500, mp: 200, atk: 34, def: 4, spd: 4.6, xp: 620, abilities: ["lightning", "tornado", "heal", "panacea"], tint: "#1a1a2a", body: "winged", boss: true },
    kitsune_ninetails: { name: "Nine-Tailed Kitsune", hp: 1510, mp: 220, atk: 34, def: 4, spd: 4.4, xp: 670, abilities: ["fireball", "dazzle", "glacier", "heal", "panacea"], tint: "#f08a2a", body: "beast", boss: true },
    naga_raja: { name: "Nāga Rājā", hp: 1560, mp: 200, atk: 37, def: 4, spd: 3.6, xp: 650, abilities: ["venom", "lightning", "tideburst", "heal", "panacea"], tint: "#2a8a5a", body: "serpent", boss: true },
    rakshasa_maharaja: { name: "Rakshasa Maharaja", hp: 1560, mp: 210, atk: 37, def: 4, spd: 3.4, xp: 670, abilities: ["fireball", "dazzle", "heal", "panacea"], tint: "#c96a1a", body: "humanoid", boss: true },
    hydra_broodmother: { name: "Hydra Broodmother", hp: 2800, mp: 210, atk: 44, def: 3, spd: 2.8, xp: 780, abilities: ["venom", "whirlwind", "tideburst", "tidal_wave", "heal", "panacea"], tint: "#1e6a36", body: "serpent", aquatic: true, diver: true, boss: true },
    fenrir_alpha: { name: "Fenrir Alpha", hp: 2700, mp: 150, atk: 43, def: 2, spd: 5.0, xp: 740, abilities: ["whirlwind", "lightning", "heal", "panacea"], tint: "#23232e", body: "beast", boss: true },
    dullahan_lord: { name: "Dullahan Lord", hp: 2080, mp: 180, atk: 39, def: 2, spd: 4.4, xp: 640, abilities: ["frostbite", "thunder_hex", "heal", "panacea"], tint: "#1a1a24", body: "undead", boss: true, undead: true },
    baba_yaga: { name: "Baba Yaga", hp: 2060, mp: 250, atk: 36, def: 2, spd: 3.2, xp: 700, abilities: ["immolate", "thunder_hex", "venom", "heal", "panacea"], tint: "#5a3a6a", body: "humanoid", boss: true },
    // ---- insect bosses: broodmother, colony queen, sting emperor ----
    tarantula_broodmother: { name: "Tarantula Broodmother", hp: 1020, mp: 150, atk: 34, def: 4, spd: 3.4, xp: 600, abilities: ["venom", "glacier", "whirlwind", "heal", "panacea"], tint: "#3a1a4a", body: "swarm", boss: true },
    joker: { name: "The Joker", hp: 1180, mp: 180, atk: 33, def: 4, spd: 3.8, xp: 600, abilities: ["dazzle", "thunder_hex", "fireball", "heal", "panacea"], tint: "#8a4ad9", body: "humanoid", boss: true },
    siege_queen: { name: "Siege Ant Queen", hp: 1640, mp: 120, atk: 36, def: 6, spd: 2.4, xp: 680, abilities: ["shieldwall", "whirlwind", "venom", "heal", "panacea"], tint: "#5a2a0a", body: "swarm", boss: true, diver: true, burrower: true },
   scorpion_emperor: { name: "Scorpion Emperor", hp: 1580, mp: 140, atk: 38, def: 6, spd: 3.2, xp: 660, abilities: ["venom", "immolate", "whirlwind", "heal", "panacea"], tint: "#8a6a10", body: "swarm", boss: true },
    // ---- HELL DIMENSION (v16): high-stat fiends of the far continent ----
    // Base stats run hotter than any surface wilds — hell curve starts where
    // the surface caps. Each kind has a unique mechanic (see game.js hell tick
    // + codex special section).
    hell_beast: { name: "Hell Beast", hp: 280, mp: 40, atk: 38, def: 14, spd: 3.8, xp: 320, abilities: ["whirlwind", "immolate"], tint: "#8a1a1a", body: "brute", demon: true },
    succubus: { name: "Succubus", hp: 240, mp: 160, atk: 34, def: 10, spd: 4.2, xp: 340, abilities: ["dazzle", "venom", "thunder_hex"], tint: "#d94a8a", body: "humanoid", demon: true },
    doom_lord: { name: "Doom Lord", hp: 520, mp: 140, atk: 48, def: 16, spd: 3.0, xp: 480, abilities: ["immolate", "fireball", "whirlwind"], tint: "#3a0a0a", body: "brute", demon: true },
    infernal: { name: "Infernal", hp: 380, mp: 100, atk: 44, def: 18, spd: 2.6, xp: 420, abilities: ["immolate", "shieldwall"], tint: "#ff5a1a", body: "brute", lavaBorn: true, demon: true },
    hell_hound: { name: "Hell Hound", hp: 300, mp: 20, atk: 40, def: 12, spd: 5.2, xp: 350, abilities: ["whirlwind", "immolate"], tint: "#5a0a0a", body: "beast", tamable: true, mount: { speed: 1.6, swim: false }, demon: true },
    // ---- hell dungeon warlords (bizarre deep-hell abilities) ----
    infernal_overlord: { name: "Infernal Overlord", hp: 3200, mp: 260, atk: 65, def: 4, spd: 3.0, xp: 1200, abilities: ["immolate", "meteorfall", "whirlwind", "heal", "panacea"], tint: "#ff3a00", body: "brute", boss: true, lavaBorn: true, demon: true },
    succubus_matriarch: { name: "Succubus Matriarch", hp: 3050, mp: 380, atk: 60, def: 3, spd: 4.4, xp: 1250, abilities: ["dazzle", "venom", "thunder_hex", "panacea", "heal"], tint: "#ff6ab0", body: "humanoid", boss: true, demon: true },
    doom_tyrant: { name: "Doom Tyrant", hp: 4350, mp: 280, atk: 70, def: 5, spd: 3.2, xp: 1400, abilities: ["immolate", "energy_beam", "whirlwind", "heal", "panacea"], tint: "#1a0505", body: "brute", boss: true, demon: true },
    hell_magus: { name: "Hell Magus", hp: 3950, mp: 420, atk: 62, def: 3, spd: 3.6, xp: 1300, abilities: ["immolate", "thunder_hex", "whiteout", "heal", "panacea"], tint: "#6a0a8a", body: "humanoid", boss: true, demon: true },
    peter_the_fallen: { name: "Peter the Fallen", hp: 8225, mp: 850, atk: 110, def: 4, spd: 4.8, xp: 8000, abilities: ["immolate", "meteorfall", "energy_beam", "tideburst", "heal", "panacea", "wind_cutter", "storm_of_blades", "whirlpool", "primordial_sea", "line_of_fire", "raging_volcano", "icicle_line", "crystal_prison", "burning_light", "toxic_stab", "barbed_plague", "tamisra", "void_hole", "life_drain", "blood_hole"], tint: "#0a0a0a", body: "brute", boss: true, demon: true },
  };
  // Boss roster for per-delve picks (legacy "boss" = Dungeon Lord stays first).
  // Full 29-kind rotation: every boss:true template except the lying-gate
  // portal_devourer (which only ever wears the way-down portal). Order is
  // tier-ascending so fallbacks stay weak; bossKindFor() enforces min depth
  // + theme matching on top (see BOSS_MIN_EFF / BOSS_THEMES).
 const BOSS_KINDS = ["boss", "goblin_king", "skeleton_warlord", "kobold_king", "bandit_warlord", "gnoll_alpha", "cultist_hierophant", "drowned_captain", "slime_sovereign", "kappa_king", "orc_warchief", "troll_king", "harpy_matriarch", "rusalka_queen", "wraith_sovereign", "tarantula_broodmother", "joker", "minotaur_warlord", "draugr_king", "cursed_pharaoh", "medusa_queen", "oni_daimyo", "tengu_stormlord", "kitsune_ninetails", "siege_queen", "scorpion_emperor", "naga_raja", "rakshasa_maharaja", "dullahan_lord", "baba_yaga", "wyvern_matriarch", "jotunn_jarl", "hydra_broodmother", "fenrir_alpha", "voidstalker", "leviathan"];
  // v16 hell warlords: deep-hell dungeon bosses + the fallen god himself.
  const HELL_BOSS_KINDS = ["infernal_overlord", "succubus_matriarch", "doom_tyrant", "hell_magus", "peter_the_fallen"];
  const HEAVEN_BOSS_KINDS = [];
  for (const _hk of HELL_BOSS_KINDS) if (!BOSS_KINDS.includes(_hk)) BOSS_KINDS.push(_hk);
  // Deep-floor ancients (eff >= 8) rise from this short list when the theme
  // has no deeper horror of its own — bossKindFor() prefers theme-matched
  // deep bosses first, then falls back here.
  const ANCIENT_KINDS = ["hydra_broodmother", "fenrir_alpha", "wyvern_matriarch", "jotunn_jarl", "voidstalker", "leviathan", "dullahan_lord", "baba_yaga"];
  // Minimum effective depth (delve remoteness + floors down - 1) before a
  // warlord may wake. Starter crypts (eff 1-2) only ever see tier 1; the
  // OP horrors (voidstalker, leviathan, hydra, fenrir, jotunn, wyvern) all
  // need eff 6+, so floor 2 of a shallow delve can never roll them — and
  // because boss levels scale with eff, gating depth also gates levels.
  const BOSS_MIN_EFF = {
    boss: 1, goblin_king: 1, skeleton_warlord: 1, kobold_king: 1, bandit_warlord: 1, gnoll_alpha: 1, cultist_hierophant: 1, drowned_captain: 1,
    slime_sovereign: 2, kappa_king: 2, orc_warchief: 2, troll_king: 2, harpy_matriarch: 2,
    wraith_sovereign: 3, minotaur_warlord: 3, draugr_king: 3, cursed_pharaoh: 3, medusa_queen: 3, rusalka_queen: 3,
    tarantula_broodmother: 3,
    joker: 3,
    oni_daimyo: 4, tengu_stormlord: 4, kitsune_ninetails: 4, naga_raja: 4, rakshasa_maharaja: 4,
    siege_queen: 4, scorpion_emperor: 4,
   dullahan_lord: 5, baba_yaga: 5,
   wyvern_matriarch: 6, jotunn_jarl: 6, hydra_broodmother: 6, fenrir_alpha: 6, voidstalker: 6, leviathan: 6,
   // v16 hell warlords: hell delves run deep (eff 10+), Peter waits past 20.
    // v19 Peter the Fallen waits at eff 12 — the god-delve's level 5 only.
    infernal_overlord: 8, succubus_matriarch: 8, doom_tyrant: 9, hell_magus: 9,
    peter_the_fallen: 12,
  };
  // Which dungeon themes each warlord haunts. bossKindFor() filters the
  // depth-eligible roster to these, so e.g. leviathan only ever rules the
  // drowned leviathan deep, voidstalker only the abyss/shadow (plus crypt
  // vaults, mirror halls and sunken libraries that read its darkness),
  // jotunn only the glacier, oni only ember/inferno, etc. Every theme owns
  // at least one tier-1 warlord (or a depth-appropriate fallback) and at
  // least one eff 5+ horror, so deep floors always have a themed deep pick.
  const BOSS_THEMES = {
    boss: ["crypt", "shadow", "tomb"],
    goblin_king: ["cavern", "fungal", "grove"],
    skeleton_warlord: ["crypt", "tomb"],
    kobold_king: ["cavern", "hive", "clockwork"],
    bandit_warlord: ["cavern", "briar", "clockwork", "wreck", "flooded"],
    gnoll_alpha: ["cavern", "briar", "grove"],
    cultist_hierophant: ["ember", "shadow", "inferno", "abyss", "library", "flooded", "flesh"],
    slime_sovereign: ["fungal", "flooded", "flesh", "hive", "wreck"],
    drowned_captain: ["wreck", "flooded", "shadow"],
    kappa_king: ["flooded", "wreck", "fungal"],
    rusalka_queen: ["flooded", "wreck", "mirror", "leviathan"],
    orc_warchief: ["ember", "cavern", "inferno"],
    troll_king: ["cavern", "glacier", "briar", "grove"],
    harpy_matriarch: ["storm", "briar", "cavern", "hive"],
    wraith_sovereign: ["crypt", "shadow", "abyss", "mirror", "glacier"],
    minotaur_warlord: ["cavern", "tomb", "clockwork", "library"],    draugr_king: ["crypt", "glacier", "tomb", "wreck"],
    cursed_pharaoh: ["tomb", "library"],
    medusa_queen: ["tomb", "cavern", "fungal", "mirror"],
    oni_daimyo: ["ember", "inferno"],
    tengu_stormlord: ["storm", "library"],
    kitsune_ninetails: ["grove", "fungal", "briar", "library"],
    naga_raja: ["flooded", "wreck", "leviathan"],
    rakshasa_maharaja: ["library", "mirror", "ember", "clockwork"],
    tarantula_broodmother: ["hive", "cavern", "fungal", "flesh", "grove"],
    joker: ["mirror", "library", "clockwork"],
    siege_queen: ["hive", "cavern", "clockwork", "tomb"],
    scorpion_emperor: ["tomb", "cavern", "hive"],
    dullahan_lord: ["shadow", "crypt", "abyss", "tomb", "clockwork"],
    baba_yaga: ["briar", "fungal", "mirror", "flesh", "grove", "tomb", "library"],
    wyvern_matriarch: ["storm", "ember", "inferno", "hive"],
    jotunn_jarl: ["glacier"],
    hydra_broodmother: ["flooded", "fungal", "flesh", "wreck", "leviathan"],
    fenrir_alpha: ["glacier", "storm", "cavern", "grove", "briar"],
   voidstalker: ["abyss", "shadow", "crypt", "mirror", "library"],
   leviathan: ["leviathan"],
    // v16 hell warlords haunt the deep-hell themes (inferno/abyss/flesh) —
    // bossKindFor() in hell delves filters to these.
    infernal_overlord: ["inferno", "abyss", "flesh"],
    succubus_matriarch: ["abyss", "mirror", "flesh"],
    doom_tyrant: ["inferno", "abyss", "crypt"],
    hell_magus: ["abyss", "library", "mirror", "inferno"],
    peter_the_fallen: ["abyss", "inferno", "flesh"],
  };
  const BIOME = { TOWN: "town", FOREST: "forest", DARK_FOREST: "dark_forest", PLAINS: "plains", LAKE: "lake", SEA: "sea", OCEAN: "ocean", TUNDRA: "tundra", WILD: "wild", DESERT: "desert", MOUNTAIN: "mountain", VOLCANO: "volcano", DUNGEON: "dungeon" };
  // High-frontier wilds (all lv ~40-50, each with its own lv-70 apex + lair
  // aura): frostcrown glaciers, blightmire bogs, stormcrag cliffs, crystal
  // scars, umbral wastes. Added as plain BIOME keys so every biome-keyed
  // system (pools, curves, map colors, lore) picks them up.
 BIOME.FROSTCROWN = "frostcrown"; BIOME.BLIGHTMIRE = "blightmire";
 BIOME.STORMCRAG = "stormcrag"; BIOME.CRYSTAL_SCAR = "crystal_scar";
 BIOME.UMBRAL_WASTE = "umbral_waste";
  // v16 hell biomes (far-continent hell ground). Plain keys so pools/curves/
  // map colors/lore pick them up like the highlands.
  BIOME.HELL_ASH = "hell_ash"; BIOME.HELL_BLOOD = "hell_blood";
  BIOME.HELL_OBSIDIAN = "hell_obsidian"; BIOME.HELL_BONE = "hell_bone";
  BIOME.HELL_FLESH = "hell_flesh";
  BIOME.HELL_FUNGAL = "hell_fungal"; BIOME.HELL_GLOOM = "hell_gloom";
  BIOME.HELL_VERDANT = "hell_verdant";
  BIOME.HELL_VOID = "hell_void"; // out-of-hell void: impassable stone, no spawns
  BIOME.HEAVEN_CLOUD = "heaven_cloud"; BIOME.HEAVEN_LAKE = "heaven_lake";
  BIOME.HEAVEN_MEADOW = "heaven_meadow"; BIOME.HEAVEN_GROVE = "heaven_grove";
  BIOME.HEAVEN_BLOOM = "heaven_bloom"; BIOME.HEAVEN_MIST = "heaven_mist";
  BIOME.HEAVEN_PASTURE = "heaven_pasture";
  BIOME.HEAVEN_VOID = "heaven_void";
  // Boss bulwark identity: which defense runs a little lower (the slight
  // weakness — phys-frail hurts more from blades/techniques, mag-frail from
  // spells) + one thematic elemental weakness (~+10% from that element, see
  // dealDamage). (Retired: BOSS_WARD single-hit caps — bosses now take full
  // hits. Kept exported so old saves/notes referencing it don't break.)
  const BOSS_WARD = { low: 1, mid: 1, high: 1 };
  const BOSS_BULWARK = {
    boss: { frail: "mag", weak: "holy" },
    goblin_king: { frail: "mag", weak: "fire" },
    skeleton_warlord: { frail: "phys", weak: "holy" },
    kobold_king: { frail: "mag", weak: "ice" },
    bandit_warlord: { frail: "phys", weak: "electric" },
    gnoll_alpha: { frail: "mag", weak: "fire" },
    cultist_hierophant: { frail: "phys", weak: "holy" },
    drowned_captain: { frail: "mag", weak: "electric" },
    slime_sovereign: { frail: "phys", weak: "ice" },
    kappa_king: { frail: "mag", weak: "electric" },
    orc_warchief: { frail: "mag", weak: "water" },
    troll_king: { frail: "mag", weak: "fire" },
    harpy_matriarch: { frail: "phys", weak: "ice" },
    rusalka_queen: { frail: "phys", weak: "electric" },
    wraith_sovereign: { frail: "phys", weak: "holy" },
    minotaur_warlord: { frail: "mag", weak: "nature" },
    draugr_king: { frail: "mag", weak: "holy" },
    cursed_pharaoh: { frail: "phys", weak: "holy" },
    medusa_queen: { frail: "phys", weak: "ice" },
    oni_daimyo: { frail: "mag", weak: "water" },
    tengu_stormlord: { frail: "phys", weak: "fire" },
    kitsune_ninetails: { frail: "phys", weak: "water" },
    naga_raja: { frail: "mag", weak: "electric" },
    rakshasa_maharaja: { frail: "phys", weak: "holy" },
    tarantula_broodmother: { frail: "phys", weak: "fire" },
    joker: { frail: "phys", weak: "holy" },
    siege_queen: { frail: "mag", weak: "water" },
    scorpion_emperor: { frail: "mag", weak: "ice" },
    dullahan_lord: { frail: "mag", weak: "holy" },
    baba_yaga: { frail: "phys", weak: "fire" },
    wyvern_matriarch: { frail: "mag", weak: "ice" },
    jotunn_jarl: { frail: "phys", weak: "fire" },
    hydra_broodmother: { frail: "mag", weak: "fire" },
    fenrir_alpha: { frail: "phys", weak: "electric" },
   voidstalker: { frail: "mag", weak: "holy" },
   leviathan: { frail: "phys", weak: "electric" },
   portal_devourer: { frail: "mag", weak: "holy" },
    infernal_overlord: { frail: "mag", weak: "holy" },
    succubus_matriarch: { frail: "phys", weak: "holy" },
    doom_tyrant: { frail: "mag", weak: "holy" },
    hell_magus: { frail: "phys", weak: "holy" },
    peter_the_fallen: { frail: "phys", weak: "holy" },
    divine_dragon: { frail: "mag", weak: "holy" },
    celestial_messenger: { frail: "phys", weak: "holy" },
    reservoir_leviathan: { frail: "phys", weak: "electric" },
    seraph_regent: { frail: "mag", weak: "holy" },
  };
  // Per-tier warlord bulk (v252, fit to the boss distribution table): flat
  // multipliers over the level-grown template body (see entities.js makeMob).
  // Single source of truth — the spawner AND the codex both read these. HP
  // carries tier identity; ATK/MATK climb gently; DEF is flat per band.
  const BOSS_TIER_BULK = {
    HP: { 1: 33.27, 2: 33.12, 3: 25.45, 4: 17.52, 5: 15.15, 6: 16.17, 7: 26, 8: 5.44, 9: 26, 10: 26, 11: 1.92, 12: 1.35 },
    ATK: { 1: 0.99, 2: 1.08, 3: 1.16, 4: 1.24, 5: 1.33, 6: 1.41, 7: 1.48, 8: 1.64, 9: 1.48, 10: 1.48, 11: 1.8, 12: 1.89 },
    MATK: { 1: 1.01, 2: 1.09, 3: 1.17, 4: 1.24, 5: 1.32, 6: 1.4, 7: 1.48, 8: 1.63, 9: 1.48, 10: 1.48, 11: 1.81, 12: 1.87 },
    DEF: { 1: 2.5, 2: 2.5, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3, 12: 3.4 },
  };
  // Per-kind HP exact-fit corrections (v252): multiplier over the tier bulk
  // so each warlord's spawn pool lands ON the distribution table (the tier
  // mean is exact, but the table's per-boss pools vary beyond what the level
  // curve derives from templates — dragons pool deeper than their XP says,
  // sovereigns shallower). Default 1 when absent; measured live, so values
  // carry ~1% probe noise — well inside the +-3% spawn jitter.
  const BOSS_HP_TRIM = {
    bile_cardinal: 1, ash_tyrant: 1, cinder_emperor: 1, char_king: 1, sinew_despot: 1,
    gut_empress: 1, dread_masticator: 1.06, rift_eater: 1.057, celestial_messenger: 1,
    seraph_regent: 1, gloom_sovereign: 1.078, succubus_matriarch: 1, infernal_overlord: 1,
    boss: 1.152, portal_devourer: 0.838, harpy_matriarch: 1.11, skeleton_warlord: 0.928,
    troll_king: 1.098, slime_sovereign: 0.819, wraith_sovereign: 0.871,
    medusa_queen: 0.863, joker: 0.867, cursed_pharaoh: 0.92, draugr_king: 1.182,
    minotaur_warlord: 1.178, tengu_stormlord: 0.924, voidstalker: 0.883,
    magma_mauler: 1.178, gore_patriarch: 1.173, maw_primogenitor: 1.272,
    divine_dragon: 1.335, leviathan: 1.138, hell_magus: 0.876, doom_tyrant: 1.147,
    ember_inquisitor: 0.869, hollow_cantor: 0.855, nether_abbess: 0.881,
    pyre_queen: 0.889, void_prelate: 0.886, umbral_matriarch: 0.918,
    flesh_sculptor: 0.928, organ_choirmaster: 0.887, mirror_abbot: 0.878,
    eventide_horror: 1.115, blood_evangel: 0.879, skin_pope: 0.82,
    volcano_pontiff: 0.831, reservoir_leviathan: 1.117, slag_colossus: 1.121,
    siege_queen: 1.087, wyvern_matriarch: 0.939, kitsune_ninetails: 0.941,
    oni_daimyo: 1.066, tarantula_broodmother: 1.064, rusalka_queen: 1.062,
    hydra_broodmother: 1.059,
  };
  // Overworld apex bulk: final-stat multipliers giving mountain/volcano
  // ancients mid-tier-boss (eff 3-4) bodies at lv 70 — peak dragon ~22k HP,
  // lesser horrors ~6-13k. Applied per-instance in Game.spawnMobsForChunk,
  // so tameable/regular versions of these kinds are unaffected.
  const APEX_BULK = {
    peak_dragon: { hp: 2.2, mp: 1.5, atk: 1.15, def: 1.15 },
    frostwyrm: { hp: 2.1, mp: 1.6, atk: 1.15, def: 1.2 },
    mire_hydra: { hp: 2.0, mp: 1.4, atk: 1.2, def: 1.2 },
    tempest_roc: { hp: 2.0, mp: 1.8, atk: 1.15, def: 1.15 },
    prism_colossus: { hp: 2.4, mp: 1.6, atk: 1.2, def: 1.3 },
    umbral_wyrm: { hp: 2.2, mp: 1.8, atk: 1.2, def: 1.2 },
    lesser_wyvern: { hp: 4.3, mp: 2, atk: 1.4, def: 1.4 },
    velociraptor: { hp: 5.2, mp: 1, atk: 1.15, def: 1.6 },
    wyvern_fledgling: { hp: 6.1, mp: 2, atk: 1.4, def: 1.6 },
    kitsune_trickster: { hp: 8.0, mp: 3, atk: 1.85, def: 2.6 },
  };
  // Lair auras: the weather of dread around each apex ancient. radius is the
  // warning ring (tiles), rate the fraction of max HP drained per second,
  // push the outward shove (tiles/sec at the rim, stronger inside). The
  // peak dragon wears hail on its mountain and cinderwind in calderas.
  const APEX_AURA = {
    peak_dragon:    { label: "❄️ hailstorm", el: "ice", color: "#cfeaff", dark: "rgba(190,215,255,0.42)", ember: false, radius: 18, rate: 0.012, push: 1.6, msg: "❄️ Hail lashes down — the Peak Dragon's lair. Turn back or press on!" },
    caldera_ember:  { label: "🔥 cinderwind", el: "fire", color: "#ffb52e", dark: "rgba(255,140,50,0.34)", ember: true, radius: 18, rate: 0.012, push: 1.6, msg: "🔥 Cinderwind howls — something ancient roosts in the caldera. Turn back or press on!" },
    frostwyrm:      { label: "❄️ whiteout", el: "ice", color: "#e8f6ff", dark: "rgba(220,240,255,0.46)", radius: 18, rate: 0.011, push: 1.4, msg: "❄️ The air freezes mid-breath — the Frostwyrm's whiteout. Turn back or press on!" },
    mire_hydra:     { label: "☠️ miasma", el: "nature", color: "#9fe8a0", dark: "rgba(90,180,110,0.36)", radius: 18, rate: 0.010, push: 1.0, msg: "☠️ Sweet rot on the wind — the Mire Hydra's miasma. Turn back or press on!" },
    tempest_roc:    { label: "⛈️ stormwall", el: "electric", color: "#bcd2ff", dark: "rgba(90,110,200,0.44)", radius: 18, rate: 0.011, push: 1.8, msg: "⛈️ The sky leans down screaming — the Tempest Roc's stormwall. Turn back or press on!" },
    prism_colossus: { label: "✨ soul-glare", el: "holy", color: "#ffe9a8", dark: "rgba(255,230,160,0.36)", radius: 18, rate: 0.010, push: 1.2, msg: "✨ Light bends wrong here — the Prism Colossus's soul-glare. Turn back or press on!" },
    umbral_wyrm:    { label: "🌑 voidchill", el: "electric", color: "#8a7ae0", dark: "rgba(30,20,80,0.55)", radius: 18, rate: 0.012, push: 1.4, msg: "🌑 Cold without wind, dark without night — the Umbral Wyrm's voidchill. Turn back or press on!" },
  };
  // Signature ancient per highland (65% of that biome's apex rolls).
  const APEX_SIGNATURE = {
    mountain: "peak_dragon", volcano: "peak_dragon",
    frostcrown: "frostwyrm", blightmire: "mire_hydra", stormcrag: "tempest_roc",
    crystal_scar: "prism_colossus", umbral_waste: "umbral_wyrm",
  };
  // ---- tames / mounts / divers ----
  // TAMABLE: each beast rolls its own submit point in [SUBMIT_MIN, SUBMIT_MAX]
  // (fraction of max HP) — weaken it to that point and it submits (💛 E to tame),
  // but overshoot the point and it dies: missing the window is always possible.
  // CHA (Beastfriend) widens the window via CHA_HP_BONUS (cap CHA_HP_MAX).
  // OFFER_CHANCE / OFFER_CD_MS are legacy (chance-roll era) and unused.
  // divers surface for a while, then sink back into the depths.
  const TAME = { OFFER_HP_FRAC: 0.25, OFFER_CHANCE: 0.09, OFFER_CD_MS: 4000, CHA_BONUS: 0.03, CHA_HP_BONUS: 0.03, CHA_HP_MAX: 0.3, SUBMIT_MIN: 0, SUBMIT_MAX: 0.25 };
  // ---- taming progression (Beastmastery tree) ----
  // Only template-tamable kinds (horses + a few beasts) submit by default.
  // Vermin Lore unlocks INSECT_KINDS; Broad Kinship unlocks ANIMAL_KINDS.
  // Level gate: BASE_MAXLV + BIG_GAME_BONUS per Big Game rank (Apex Bond
  // removes it). Warlords (BOSS_KINDS / boss-flagged) NEVER submit, unlocked
  // or not. The six lv-70 👑 apex ancients (APEX_TAME_KINDS, incl. the Peak
  // Dragon) are the one exception: they submit ONLY for a fully maxed
  // Beastmastery tree (every node at max), and each beaten ancient rolls once
  // (APEX_TAME_CHANCE) for whether it ever asks — the rest never yield.
  const TAMING = {
    BASE_SLOTS: 1, BASE_MAXLV: 15, BIG_GAME_BONUS: 15,
    INSECT_KINDS: ["giant_tarantula", "tomb_scorpion", "siege_ant", "hive_hornet", "scarab_swarm", "khepri_beetle", "gloomspinner"],
    ANIMAL_KINDS: ["anubite", "sobek_spawn", "sphinx_cub", "chimera_cub", "lamassu_cub", "kitsune_trickster", "puca", "gnoll", "gnoll_hunter", "centaur_foal", "harpy", "stymphalian", "siren", "lindworm", "sandmaw", "tidecaller", "wyvern_fledgling", "lesser_wyvern", "velociraptor", "phoenix", "umbral_stag", "burrow_mole", "shiver_owl", "mire_lurker", "wreck_eel", "magma_eel", "hydra_spawn", "gorgon_spawn", "cinder_maw", "yeti", "troll_whelp", "kobold"],
    APEX_TAME_KINDS: ["peak_dragon", "frostwyrm", "mire_hydra", "tempest_roc", "prism_colossus", "umbral_wyrm"],
    APEX_TAME_CHANCE: 0.05,
  };
  // ---- stable economy: paid pens + the horse market ----
  // Pens are bought, not given: each box starts with FREE_SLOTS open and
  // every further cell costs SLOT_BASE + SLOT_STEP * (already-open cells);
  // each new box costs BOX_BASE + BOX_STEP * (boxes already owned) and opens
  // with FREE_SLOTS cells. Only HORSE_KINDS trade at the market — every
  // other mount/beast can only be tamed, never bought or sold.
  const STABLE_ECON = {
    FREE_SLOTS: 6, SLOT_BASE: 200, SLOT_STEP: 100, BOX_BASE: 1500, BOX_STEP: 1500,
    WILD_SELL_BASE: 800,
  };
 const HORSE_KINDS = ["wild_horse", "stable_pony", "stable_courser", "stable_destrier", "stable_zephyr", "stable_aegis", "pegasus", "unicorn", "hell_hound", "gore_hound"];
  // ---- wild individuality: every mob spawns its own body ----
  // Same kind + level are siblings, not clones — HP/MP/ATK ±8%, DEF/SDEF
  // ±1, SPD ±0.2, XP ±10%. Tames copy the mob they were caught from, so no
  // two wolves are alike — which is what makes same-kind breeding worth it.
  const MOB_VAR = { HP: 0.08, MP: 0.10, ATK: 0.08, DEF: 1, SPD: 0.2, XP: 0.10 };
  // ---- beast-lodge kinship: who may breed with whom ----
  // Same family may breed (offspring takes a random parent's kind); anything
  // unlisted breeds same-kind only. Horses cover the equine steeds (wild +
  // stable lines + cinder steeds); hounds the dog-kin (wolves, pups, tanuki,
  // jackals, foxes, gnolls); shellbacks the two shelled divers; coils all
  // serpents/eels; skyborn all flyers; swarms all giant insects.
  const BREED_FAMILIES = {
    horse: ["wild_horse", "stable_pony", "stable_courser", "stable_destrier", "stable_zephyr", "stable_aegis", "pegasus", "unicorn", "cinder_steed"],
    hound: ["wolf", "rime_wolf", "fenrir_pup", "tanuki", "anubite", "kitsune_trickster", "gnoll", "gnoll_hunter", "hell_hound", "gore_hound"],
    shell: ["tide_turtle", "magma_tortoise"],
    coils: ["lindworm", "sandmaw", "tidecaller", "wreck_eel", "magma_eel", "hydra_spawn", "gorgon_spawn", "frostwyrm", "mire_hydra"],
    sky: ["harpy", "stymphalian", "siren", "shiver_owl", "wyvern_fledgling", "lesser_wyvern", "phoenix", "tempest_roc"],
    swarm: ["giant_tarantula", "tomb_scorpion", "siege_ant", "hive_hornet", "scarab_swarm", "khepri_beetle", "gloomspinner"],
    slave: ["slave"],
  };
  const BREED_FAMILY_LABEL = { horse: "steeds", hound: "hounds", shell: "shellbacks", coils: "coils", sky: "skyborn", swarm: "swarms", slave: "bound" };
  // ---- kind gender: which mob/boss kinds are always one sex ----
  // Matriarchs/queens/witches/snow-women are always female; kings/warlords/
  // jarls/rajas/emperors/captains/alphas always male; mindless things
  // (mimics, constructs, horrors) are genderless and can never breed.
  // Everything unlisted rolls male/female per individual (see rollGender).
 const FEMALE_KINDS = ["harpy_matriarch", "rusalka_queen", "medusa_queen", "hydra_broodmother", "tarantula_broodmother", "siege_queen", "wyvern_matriarch", "slime_empress", "baba_yaga", "kitsune_ninetails", "yuki_onna", "rusalka", "banshee", "siren", "valkyrie_renegade", "hulder", "gorgon_spawn"];
  // v16: succubi (wild + civilized + matriarch) are always female.
  FEMALE_KINDS.push("succubus", "succubus_matriarch", "civilized_succubus");
  const MALE_KINDS = ["kobold_king", "goblin_king", "orc_warchief", "bandit_warlord", "gnoll_alpha", "troll_king", "skeleton_warlord", "draugr_king", "cultist_hierophant", "oni_daimyo", "tengu_stormlord", "drowned_captain", "kappa_king", "fenrir_alpha", "minotaur_warlord", "naga_raja", "rakshasa_maharaja", "dullahan_lord", "jotunn_jarl", "cursed_pharaoh", "scorpion_emperor", "joker", "satyr", "domovoi_rogue", "oni_imp", "doom_lord", "doom_tyrant", "infernal_overlord", "peter_the_fallen"];
  const GENDERLESS_KINDS = ["lesser_mimic", "mimic", "greater_mimic", "mimic_devourer", "portal_devourer", "nurikabe", "gasha_skull", "prism_colossus", "voidstalker", "leviathan", "abyss_tentacle", "infernal", "hell_magus"];
  // ---- beast-lodge breeding: timed hand-over at the lodge's Beast Lodge ----
  // Cost scales with both parents' levels + stats + attack training, so
  // breeding kings costs kingly gold. Time is a few real minutes (wall
  // clock, so it ticks while you delve). Mutations sometimes nudge stats
  // and/or teach an extra attack.
  const BREED_ECON = {
    BASE: 600, LV_MULT: 80, STAT_MULT: 6, HP_MULT: 1.5, ABILITY_MULT: 120,
    TIME_BASE_MS: 120000, TIME_PER_LV_MS: 5000, TIME_MAX_MS: 300000,
    MUTATE_STAT_CHANCE: 0.30, MUTATE_STAT_MIN: 0.05, MUTATE_STAT_MAX: 0.12,
    EXTRA_ABILITY_CHANCE: 0.15,
  };
  // Market stock: kind + price + sales pitch. Better-bred horses (more stats,
  // more combined gifts) cost more. All lack attack training.
  const STABLE_HORSES = [
    { kind: "stable_pony", price: 1500, blurb: "Sturdy + healthy (HP/DEF up). A gentle first horse." },
    { kind: "stable_courser", price: 3000, blurb: "Bred for speed (SPD up, HP up). Outruns trouble." },
    { kind: "stable_destrier", price: 3750, blurb: "A wall of muscle (big HP/DEF). Slow but unbreakable." },
    { kind: "stable_zephyr", price: 5750, blurb: "Wind in a hide (HP/SPD/DEF). The courier's pick." },
    { kind: "stable_aegis", price: 9500, blurb: "Royal lines (best HP/DEF/SPD). Bred for kings." },
  ];
  // Heaven stables sell the highest-bred lines: winged speed + moonhorn guard.
  const STABLE_HEAVEN = [
    { kind: "pegasus", price: 14000, blurb: "Dawn-bred wings (fastest saddle in the sky). Bred for heaven's stables." },
    { kind: "unicorn", price: 16000, blurb: "Moonhorn lines (finest HP/DEF). The pride of the dawn court." },
  ];
  // Hell stables sell pit-bred hounds: trackers and bruisers, lava-footed.
  const STABLE_HELL = [
    { kind: "hell_hound", price: 9000, blurb: "Ash-raised tracker (fast, loyal, bites daemons on command)." },
    { kind: "gore_hound", price: 12000, blurb: "Pit-bred bruiser (huge HP, never flinches)." },
  ];
  const DIVE = { SURFACE_MIN: 8, SURFACE_MAX: 14, DIVE_MIN: 6, DIVE_MAX: 12 };
  // ---- inn economy: paid rooms for retired party members + slaves ----
  // Rooms are global (any inn retrieves): the first FREE_ROOMS are open and
  // each further room costs ROOM_BASE + ROOM_STEP * (already-open rooms).
  // Mirrors the stable pen pricing shape on a smaller scale (parties cap at 4).
  const INN_ECON = {
    FREE_ROOMS: 2, ROOM_BASE: 300, ROOM_STEP: 150,
  };
  // Starting-hearth variety: each new game founds its spawn town as one of
  // these settlement kinds (stored on the player, so the choice persists).
  // Names are deliberately NOT Emberhold — that's the name of the game.
  // Metros (trade_city/port_city/capital) never spawn: they are far-off finds.
  const SPAWN_TYPES = ["village", "town", "city", "watergate", "sakura", "fortress", "desert_souk", "steppe_ger", "mesa_pueblo", "frost_hold"];
  const SPAWN_NAMES = {
    desert_souk: ["Sunspice Souk", "Amberwash", "Dunemarket", "Saffronhold", "Cinderbazaar", "Miragegate", "Sandspire", "Zephyr Souk"],
    steppe_ger: ["Windmane Camp", "Khansteppe", "Marehold", "Skyherd", "Gallopmere", "Feltwind", "Horsegate", "OpenSky"],
    mesa_pueblo: ["Redledge", "Sunbaked Terrace", "Cliffshade", "Turquoise Mesa", "Canyonhold", "Adobe Rest", "Eagleperch", "Painted Rock"],
    frost_hold: ["Snowmark", "Icebraid", "Frostlamp", "Wintergate", "Aurorahold", "Pinefrost", "Skaldhome", "Glacierrest"],
    village: ["Barrowfield", "Mossbank", "Thistledown", "Oatfield", "Fernhollow", "Dunhill", "Cloverbrook", "Wrennest"],
    town: ["Cinderford", "Bellhollow", "Oakhaven", "Millrest", "Ashcombe", "Thornbury", "Lanternwick", "Barleyholm"],
    city: ["Kingsreach", "Highmarket", "Valoria", "Crownsgate", "Eldermere", "Stormhaven", "Goldspire", "Throneshire"],
    watergate: ["Tidegate", "Sluiceport", "Canalmere", "Lockwater", "Mirelock", "Floodgate", "Brinehaven", "Culvertown"],
    sakura: ["Sakuragawa", "Hanabira", "Yozakura", "Kitsunemori", "Momijimura", "Tsukimachi", "Hanamura", "Sakuramachi"],
    fortress: ["Stonehelm", "Irondeep", "Durhold", "Anvilgate", "Grimbarrow", "Deephold", "Runehammer", "Cinderhold"],
  };
  return {
    TILE, CHUNK, T, SOLID, TREE_TILES, HOTBAR_SIZE, STATS, PERKS, SKILL_TREES, STATUS_TREES, SPELL_TREE_NODES,
    SPELL_TREE_DROP, spellTreeNodes,
    TPASSIVE_NODES, TPASSIVE_OPENING, TECH_WEAPON_FAM, SPELL_PARENTS, TREE_EARN,
    STAT_POINTS_PER_LEVEL, SKILL_POINTS_PER_LEVEL,
    ABILITIES, TECHNIQUES, STATUS, HEALER_ROLES, ROLE_KIT, MOB_TEMPLATES, BOSS_KINDS, HELL_BOSS_KINDS, HEAVEN_BOSS_KINDS, ANCIENT_KINDS, BOSS_MIN_EFF, BOSS_THEMES, BOSS_WARD, BOSS_BULWARK, BOSS_TIER_BULK, BOSS_HP_TRIM, APEX_BULK, APEX_AURA, APEX_SIGNATURE,
    SPELL_TIER, TECH_TIER, BOSS_MAGIC_TIER, MOB_ARSENAL, MIMIC_KINDS, DOPPELGANGER, BIOME,
   SPAWN_TYPES, SPAWN_NAMES, TAME, TAMING, DIVE, STABLE_ECON, INN_ECON, HORSE_KINDS, STABLE_HORSES, STABLE_HEAVEN, STABLE_HELL,
    BREED_ECON, BREED_FAMILIES, BREED_FAMILY_LABEL, FEMALE_KINDS, MALE_KINDS, GENDERLESS_KINDS, MOB_VAR,
    SAVE_VERSION: 26,
    PARTY_MAX: 4,
    MOUNT_MAX: 5,
    XP_SHARE: 0.6,
    INTERACT_RANGE: 1.8,
    xpNext: (lv) => Math.floor(60 * Math.pow(lv, 1.8)) + 100,
  };
})();
