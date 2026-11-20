/* Items, inventory, equipment, loot, spellbooks, crafting. window.Items */
window.Items = (() => {
  const ITEMS = {
    // ---- materials ----
    wood:  { name: "Wood", icon: "🪵", type: "material", desc: "Chopped from trees. Craft bombs, trade for favors." },
    stone: { name: "Stone", icon: "🪨", type: "material", desc: "Found in chests. Craft bombs." },
    herb:  { name: "Herb", icon: "🌿", type: "material", desc: "Wild herb. Craft potions. (Use: restores a little HP)" , usable: true },
    // ---- raw crafting materials (gathered from the world) ----
    // ores: miners/blacksmiths stock the low tiers; deep/dark mobs carry better ones
    iron_ore:    { name: "Iron Ore", icon: "⛏️", type: "material", desc: "Dug by miners, carried by goblins. Smelted into iron arms." },
    silver_ore:  { name: "Silver Ore", icon: "🌕", type: "material", desc: "Pale ore from crypt-haunters. Bites the unholy (undead and demons)." },
    mythril_ore: { name: "Mythril Ore", icon: "💠", type: "material", desc: "Sky-blue ore from the deep wilds. Light, hard, hungry for enchantment." },
    // dragon parts: boss-only loot (peak dragons, wyverns, hydras, ancient bosses)
    dragon_bone: { name: "Dragon Bone", icon: "🦴", type: "material", desc: "A dragon's bone, still warm. The finest blade-stock known." },
    dragon_horn: { name: "Dragon Horn", icon: "🦏", type: "material", desc: "A dragon's horn. Channels power like nothing else." },
    dawnstone_shard: { name: "Dawnstone Shard", icon: "🌟", type: "material", price: 800, desc: "A shard of solid dawn, warm as sunrise. Falls only from the overworld bosses of heaven — the Divine Dragon, Celestial Messenger, Reservoir Leviathan and Seraph Regent. Forged dawnstone bites the unholy (5x vs undead and demons, like silver) and wards its wearer (30% less damage from them)." },
    // hides: beasts of the wilds
    wolf_hide:   { name: "Wolf Hide", icon: "🐺", type: "material", desc: "Tough hide. Straps, grips, bowstrings, leather armor." },
    // rare logs: chop the right trees in the right lands (tundra pines, volcano growths, old forest)
    frostwood_log:    { name: "Frostwood", icon: "❄️", type: "material", desc: "Ice-rimed log from tundra pines. Cold to the touch." },
    emberwood_log:    { name: "Emberwood", icon: "🔥", type: "material", desc: "Char-warmed log from volcanic growths. Smoulders faintly." },
    yggdrasil_branch: { name: "Yggdrasil Branch", icon: "🌳", type: "material", desc: "A branch of the world-tree's kin. Hums with old magic." },
    // cut gems: chests of the deep, scholars, lucky kills
    ruby_gem:     { name: "Ruby", icon: "♦️", type: "material", desc: "Blood-red gem. Holds embers." },
    sapphire_gem: { name: "Sapphire", icon: "💎", type: "material", desc: "Deep-blue gem. Holds frost and storm." },
    emerald_gem:  { name: "Emerald", icon: "🟢", type: "material", desc: "Green gem. Holds growth and tide-magic." },
    // elemental bits: the wilds' trophies
    rime_crystal:  { name: "Rime Crystal", icon: "🧊", type: "material", desc: "Shed by yetis, rime wolves, winter ghosts. Pure cold." },
    ember_core:    { name: "Ember Core", icon: "🌋", type: "material", desc: "A phoenix ember that never cools. Pure flame." },
    storm_feather: { name: "Storm Feather", icon: "🪶", type: "material", desc: "From thunder-birds and sky hunters. Crackles." },
    tide_pearl:    { name: "Tide Pearl", icon: "🦪", type: "material", desc: "From deep-water hunters. Tastes of brine and poison." },
    holy_bead:     { name: "Holy Bead", icon: "📿", type: "material", desc: "Blessed bead from crypt-saints and priests. Burns the unholy (undead and demons)." },
    unicorn_hair:  { name: "Unicorn Hair", icon: "🦄", type: "material", desc: "Shed by the vale's shyest magic. The finest bowstring known." },
    // ---- consumables ----
    potion:      { name: "Potion", icon: "🧪", type: "consumable", desc: "Restores 50% max HP.", use: { hpPct: 0.5 } },
    mana_potion: { name: "Mana draught", icon: "🔮", type: "consumable", desc: "Restores 60% max MP.", use: { mpPct: 0.6 } },
    bomb:        { name: "Bomb", icon: "💣", type: "consumable", desc: "Hurls an explosive: heavy damage around the blast.", use: { bomb: true } },
    torch:       { name: "Torch", icon: "🔥", type: "material", usable: true, desc: "Bind to a hotbar slot, press its key, then click a nearby spot to plant it. Lights the dark until you pick it up (E)." },
    raft:        { name: "Raft", icon: "🛶", type: "consumable", desc: "Lashed logs. Use (or bind to hotbar) to launch / haul ashore — sails rivers, lakes and seas. Quest caches on far shores await!", use: { raft: true } },
   // ---- quest items (never sold, never used — delivered, not opened) ----
   mysterious_package: { name: "Mysterious Package", icon: "📦", type: "quest", quest: true, desc: "Sealed with wax, humming faintly. Its tag names the quest it belongs to — deliver it, don't open it." },
    // ---- HELL DIMENSION (v16): fragments from delve bosses -> sphere key ----
    hell_fragment: { name: "Hell Fragment", icon: "🩸", type: "quest", quest: true, desc: "A searing shard from the bottom of a delve (no boss kill needed — each delve pays once). Gather 12 different ones and join them into a Hell Sphere." },
    hell_sphere: { name: "Hell Sphere", icon: "🔮", type: "quest", quest: true, desc: "Twelve hell fragments fused into one. It hums for the far-off hell towers — E on a tower to wake the hell dimension." },
    heavenly_sphere: { name: "Heavenly Sphere", icon: "🌅", type: "quest", quest: true, desc: "A dawn-lit sphere from the goddess herself. At a surface hearth, E opens the way to the same ground in heaven." },
    holy_water: { name: "Holy Water", icon: "💧", type: "quest", quest: true, desc: "Blessed reservoir water for the surface cathedrals. The goddess\u2019s own errand." },
    // ---- MAIN STORYLINE (v2): dawn embers, hearth oaths, throne keepsake ----
    dawn_ember: { name: "Dawn Ember", icon: "🌅", type: "consumable", desc: "A coal of morning light. Quaff: restores 35% HP and burns away poison, burn, freeze, paralyze and blindness.", use: { cure: ["poison", "burn", "freeze", "paralyze", "blind"], hpPct: 0.35 } },
    oath_ember_charm: { name: "Ember Oath Charm", icon: "🔥", type: "equipment", slot: "trinket", ringBoost: { fire: 1.15 }, bonus: { atk: 8, maxHp: 40 }, desc: "+8 ATK, +40 HP, 1.15x fire damage. The Hearthkeeper's blessing on the Ember road." },
    oath_dawn_charm: { name: "Dawn Oath Charm", icon: "🌅", type: "equipment", slot: "trinket", ringBoost: { holy: 1.15 }, bonus: { maxHp: 60, maxMp: 60 }, desc: "+60 HP, +60 MP, 1.15x holy damage. The Hearthkeeper's blessing on the Dawn road." },
    oath_gloam_charm: { name: "Gloam Oath Charm", icon: "🕳️", type: "equipment", slot: "trinket", bonus: { def: 4, sdef: 6, maxHp: 40, maxMp: 20 }, desc: "+4 DEF, +6 SDEF, +40 HP, +20 MP. The Hearthkeeper's blessing on the Gloam road — for those who watch the dark back." },
    throne_sliver: { name: "Throne Sliver", icon: "👑", type: "equipment", slot: "trinket", bonus: { def: 6, sdef: 6, maxHp: 80 }, desc: "+80 HP, +6 DEF, +6 SDEF. A cold splinter of the broken throne. It dreams, faintly, of being held." },
    // ---- base-craft materials (markets stock these) ----
    clay: { name: "Clay", icon: "🟤", type: "material", desc: "River clay. Fired into bricks for base walls." },
    brick: { name: "Brick", icon: "🧱", type: "material", desc: "Fired brick. Base walls, doors and windows are raised from these." },
    quartz_crystal: { name: "Quartz Crystal", icon: "💠", type: "material", desc: "Clear quartz, humming faintly. Twelve raise a home portal." },
    plank_bundle: { name: "Plank Bundle", icon: "🪵", type: "material", desc: "Sawn planks. Doors and frames for base building." },
    glass_pane: { name: "Glass Pane", icon: "🪟", type: "material", desc: "Blown glass. Set into base windows." },
    // ---- placeables (crafted, then Used to set onto any walkable tile) ----
    brick_wall_kit: { name: "Brick Wall Kit", icon: "🧱", type: "placeable", place: "brick_wall", desc: "Use, then click any walkable tile to raise a brick wall (destroy-only removal)." },
    wooden_door_kit: { name: "Wooden Door Kit", icon: "🚪", type: "placeable", place: "wooden_door", desc: "Use, then click any walkable tile to set a wooden door." },
    glass_window_kit: { name: "Glass Window Kit", icon: "🪟", type: "placeable", place: "glass_window", desc: "Use, then click any walkable tile to set a glass window (fragile)." },
    // ---- player-made furniture (crafted, Used to place; breakable, never picked back up) ----
    bed_kit: { name: "Bed Kit", icon: "🛏️", type: "placeable", place: "furn_bed", desc: "Use, then click walkable ground to set a bed (E to sleep). Attack to destroy." },
    shelf_kit: { name: "Bookshelf Kit", icon: "📚", type: "placeable", place: "furn_shelf", desc: "Use, then click walkable ground to set a bookshelf. Attack to destroy." },
    table_kit: { name: "Table Kit", icon: "🪑", type: "placeable", place: "furn_table", desc: "Use, then click walkable ground to set a table. Attack to destroy." },
    chair_kit: { name: "Chair Kit", icon: "🪑", type: "placeable", place: "furn_chair", desc: "Use, then click walkable ground to set a chair. Attack to destroy." },
    crate_kit: { name: "Crate Kit", icon: "📦", type: "placeable", place: "furn_crate", desc: "Use, then click walkable ground to set a crate. Attack to destroy." },
    barrel_kit: { name: "Barrel Kit", icon: "🛢️", type: "placeable", place: "furn_barrel", desc: "Use, then click walkable ground to set a barrel. Attack to destroy." },
    hearth_kit: { name: "Hearth Kit", icon: "🔥", type: "placeable", place: "furn_hearth", desc: "Use, then click walkable ground to set a hearth (E to warm up). Attack to destroy." },
    altar_kit: { name: "Altar Kit", icon: "✨", type: "placeable", place: "furn_altar", desc: "Use, then click walkable ground to set an altar (E to heal). Attack to destroy." },
    anvil_kit: { name: "Anvil Kit", icon: "🛠️", type: "placeable", place: "furn_anvil", desc: "Use, then click walkable ground to set an anvil (E to hone). Attack to destroy." },
    trough_kit: { name: "Trough Kit", icon: "💧", type: "placeable", place: "furn_trough", desc: "Use, then click walkable ground to set a trough (E to drink). Attack to destroy." },
    home_portal_kit: { name: "Home Portal Kit", icon: "🌀", type: "placeable", place: "home_portal", desc: "Use, then click any walkable tile to raise a home portal (12 quartz). Works like a hearth portal; set it as respawn." },
    // ---- shop permission deeds (bought from the capital King, placed to found a stall) ----
    permit_market: { name: "Market Charter", icon: "📜", type: "placeable", place: "permit_market", desc: "Royal charter. Use, then click walkable ground to found a player market stall (consumed). Breakable." },
    permit_blacksmith: { name: "Smithy Charter", icon: "📜", type: "placeable", place: "permit_blacksmith", desc: "Royal charter. Use to found a player smithy stall (consumed). Breakable." },
    permit_dojo: { name: "Dojo Charter", icon: "📜", type: "placeable", place: "permit_dojo", desc: "Royal charter. Use to found a player dojo mat (consumed). Breakable." },
    permit_arcane: { name: "Arcane Charter", icon: "📜", type: "placeable", place: "permit_arcane", desc: "Royal charter. Use to found a player arcane circle (consumed). Breakable." },
    permit_stable: { name: "Stable Charter", icon: "📜", type: "placeable", place: "permit_stable", desc: "Royal charter. Use to found a player stable pen (consumed). Breakable." },
    // ---- black-market drugs (huge temp stats for HP/MP/stamina) ----
    crimson_rage: { name: "Crimson Rage", icon: "💊", type: "consumable", desc: "Black-market drug: +60% melee for 120s. Costs 25% HP + 20% stamina.", use: { drug: "rage" } },
    ironmind_draught: { name: "Ironmind Draught", icon: "💊", type: "consumable", desc: "Black-market drug: +60% spell power for 120s. Costs 30% MP + 10% HP.", use: { drug: "mind" } },
    swiftshade: { name: "Swiftshade", icon: "💊", type: "consumable", desc: "Black-market drug: +1.2 speed + 25% dodge for 90s. Costs 30% stamina + 15% MP.", use: { drug: "shade" } },
    // ---- status cures (also see Cleanse/Panacea spells) ----
    antidote:    { name: "Antidote", icon: "🧴", type: "consumable", desc: "Cures poison.", use: { cure: ["poison"] } },
    burn_salve:  { name: "Burn Salve", icon: "🩹", type: "consumable", desc: "Cures burn, soothes scorched endurance.", use: { cure: ["burn"] } },
    warm_brew:   { name: "Warm Brew", icon: "☕", type: "consumable", desc: "Cures freeze instantly (+ a little warmth).", use: { cure: ["freeze"], hpPct: 0.1 } },
    focus_tea:   { name: "Focus Tea", icon: "🍵", type: "consumable", desc: "Cures paralyze, steadies limbs.", use: { cure: ["paralyze"] } },
    clear_drops: { name: "Clear Drops", icon: "👁️", type: "consumable", desc: "Cures blindness.", use: { cure: ["blind"] } },
    panacea_brew:{ name: "Panacea Brew", icon: "🌿", type: "consumable", desc: "Cures ALL status + restores 25% HP.", use: { cure: ["poison", "burn", "freeze", "paralyze", "blind"], hpPct: 0.25 } },
    // ---- arrows (ammo: bind stacks to hotbar slots; bows fire them in slot order) ----
    arrow_iron:   { name: "Iron Arrow", icon: "➶", type: "ammo", desc: "Sturdy arrow. Bows fire these in hotbar slot order.", ammo: { power: 1.0 } },
    arrow_poison: { name: "Venom Arrow", icon: "🐍", type: "ammo", desc: "Poisons (3% max HP/s until cured). Fired before later slots.", ammo: { power: 0.9, status: { type: "poison", chance: 1, pct: 0.03, potency: 1 } } },
    arrow_cinder:{ name: "Cinder Arrow", icon: "🔥", type: "ammo", desc: "Ignites (burn dmg/s + lowers END until cured).", ammo: { power: 0.9, status: { type: "burn", chance: 1, dps: 4, potency: 1 } } },
    arrow_frost: { name: "Frost Arrow", icon: "🧊", type: "ammo", desc: "Chilling head: may freeze the victim still.", ammo: { power: 0.9, status: { type: "freeze", chance: 0.6, duration: 2, potency: 1 } } },
    arrow_steel:  { name: "Steel Arrow", icon: "➶", type: "ammo", desc: "Hardened shaft. Bows fire these in hotbar slot order.", ammo: { power: 1.3 } },
    arrow_silver: { name: "Silver Arrow", icon: "➶", type: "ammo", desc: "Bright shaft. Bows fire these in hotbar slot order.", ammo: { power: 1.5 } },
    arrow_mythril:{ name: "Mythril Arrow", icon: "➶", type: "ammo", desc: "Sky-blue shaft that flies true. Bows fire these in hotbar slot order.", ammo: { power: 1.8 } },
    arrow_dragonbone:{ name: "Dragonbone Arrow", icon: "➶", type: "ammo", desc: "A dragon's splinter, fletched. Bows fire these in hotbar slot order.", ammo: { power: 2.2 } },
    arrow_oblivion:{ name: "Oblivion Arrow", icon: "🌌", type: "ammo", desc: "A sliver of the end, fletched in warlord sinew. Bows fire these in hotbar slot order.", ammo: { power: 2.8 } },
    arrow_dawnstone:{ name: "Dawnstone Arrow", icon: "🌟", type: "ammo", desc: "A sunrise splinter, fletched in dawn light. Bows fire these in hotbar slot order.", ammo: { power: 3.1 } },
    // ---- thrown arms (consumables: hurled from the hand, one spent per throw) ----
    smoke_bomb:  { name: "Smoke Bomb", icon: "💨", type: "consumable", desc: "Hurls a choking cloud: blinds everyone caught (until cured). Stock up — one spent per throw.", use: { smoke: true } },
    shuriken_iron:   { name: "Iron Shuriken", icon: "✴️", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 1.0x power.", use: { shuriken: true }, shuriken: { power: 1.0 } },
    shuriken_steel:  { name: "Steel Shuriken", icon: "❇️", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 1.4x power.", use: { shuriken: true }, shuriken: { power: 1.4 } },
    shuriken_silver: { name: "Silver Shuriken", icon: "✳️", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 1.6x power.", use: { shuriken: true }, shuriken: { power: 1.6 } },
    shuriken_mythril:{ name: "Mythril Shuriken", icon: "💫", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 2.0x power.", use: { shuriken: true }, shuriken: { power: 2.0 } },
    shuriken_dragonbone:{ name: "Dragonbone Shuriken", icon: "☄️", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 2.6x power.", use: { shuriken: true }, shuriken: { power: 2.6 } },
    shuriken_oblivion:{ name: "Oblivion Shuriken", icon: "🌌", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 3.2x power.", use: { shuriken: true }, shuriken: { power: 3.2 } },
    shuriken_dawnstone:{ name: "Dawnstone Shuriken", icon: "🌟", type: "consumable", desc: "Hurl it (Use, or bind to hotbar) — one spent per throw. 3.6x power.", use: { shuriken: true }, shuriken: { power: 3.6 } },
    // ---- curative herbs (gatherable in the wilds; herbalists stock piles) ----
    sage_herb:   { name: "Sage Herb", icon: "🌱", type: "material", desc: "Bitter leaf. Cures poison. (Use: cure poison + a little HP)", usable: true, cure: ["poison"], herbHealPct: 0.08 },
    cinder_herb: { name: "Cinder Herb", icon: "🌺", type: "material", desc: "Warm petals. Cures burn. (Use: cure burn + a little HP)", usable: true, cure: ["burn"], herbHealPct: 0.08 },
    calm_herb:   { name: "Calm Herb", icon: "🍃", type: "material", desc: "Steadying fronds. Cures paralyze. (Use: cure paralyze)", usable: true, cure: ["paralyze"] },
    bright_herb: { name: "Bright Herb", icon: "🌼", type: "material", desc: "Sunlit bloom. Cures blindness. (Use: cure blindness)", usable: true, cure: ["blind"] },
    // ---- equipment (generated below: melee sets, bows, wands, staves, rings, armor) ----
    // Legacy practice blade (kept as-is for old saves / beginners).
    wooden_sword:    { name: "Wooden Sword", icon: "🗡️", type: "equipment", slot: "weapon", wtype: "sword", mat: "wood", tierMult: 0.6, undeadMult: 0.6, dmgType: "blade", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 6 }, desc: "Practice blade. Better than a stick. (blade, 1.8 reach)" },
    lucky_charm:   { name: "Lucky Charm", icon: "🍀", type: "equipment", slot: "trinket", bonus: { maxHp: 60, maxMp: 60 }, desc: "+60 HP, +60 MP. Feels fortunate." },
    hunter_ring:   { name: "Hunter Ring", icon: "💍", type: "equipment", slot: "trinket", ringBoost: { physical: 1.2 }, bonus: { atk: 20 }, desc: "+20 ATK, 1.2x physical damage. Keen-eyed." },
    scholar_amulet:{ name: "Scholar Amulet", icon: "📿", type: "equipment", slot: "trinket", ringBoost: { ice: 1.15, electric: 1.15 }, bonus: { maxMp: 80, def: 4, matk: 24 }, desc: "+24 MATK, +80 MP, +4 DEF, 1.15x ice/electric spells." },
    mercy_ring:    { name: "Ring of Mercy", icon: "🕊️", type: "equipment", slot: "trinket", mercy: true, bonus: { maxHp: 100 }, price: 6000, desc: "+100 HP. Your blows never kill — victims are left at 1 HP. Soften a beast to its submit point with zero fear of overshoot. (worn ring)" },
    // ---- spellbooks (one per spell) ----
    tome_fireball:   { name: "Tome: Fireball", icon: "📕", type: "spellbook", teaches: "fireball", desc: "Read to learn Fireball." },
    tome_heal:       { name: "Tome: Heal", icon: "📗", type: "spellbook", teaches: "heal", desc: "Read to learn Heal." },
    tome_whirlwind:  { name: "Tome: Whirlwind", icon: "📘", type: "spellbook", teaches: "whirlwind", desc: "Read to learn Whirlwind." },
    tome_frostbite:  { name: "Tome: Frostbite", icon: "📘", type: "spellbook", teaches: "frostbite", desc: "Read to learn Frostbite (biting ice — may freeze)." },
    tome_tornado:    { name: "Tome: Tornado", icon: "📘", type: "spellbook", teaches: "tornado", desc: "Read to learn Tornado (whirlwind's gale)." },
    tome_hurricane:  { name: "Tome: Hurricane", icon: "📘", type: "spellbook", teaches: "hurricane", desc: "Read to learn Hurricane (deep-delve cataclysm)." },
    tome_angel_of_life: { name: "Tome: Angel of Life", icon: "📗", type: "spellbook", teaches: "angel_of_life", desc: "Read to learn Angel of Life (cure ALL + revive party)." },
    tome_venom:      { name: "Tome: Venom Sting", icon: "📕", type: "spellbook", teaches: "venom", desc: "Read to learn Venom Sting (poison)." },
    tome_immolate:   { name: "Tome: Immolate", icon: "📕", type: "spellbook", teaches: "immolate", desc: "Read to learn Immolate (burn)." },
    tome_glacier:    { name: "Tome: Glacier", icon: "📘", type: "spellbook", teaches: "glacier", desc: "Read to learn Glacier (freeze)." },
    tome_thunder_hex:{ name: "Tome: Thunder Hex", icon: "📔", type: "spellbook", teaches: "thunder_hex", desc: "Read to learn Thunder Hex (paralyze)." },
    tome_dazzle:     { name: "Tome: Dazzle", icon: "📙", type: "spellbook", teaches: "dazzle", desc: "Read to learn Dazzle (blind)." },
    tome_smite:      { name: "Tome: Smite", icon: "📙", type: "spellbook", teaches: "smite", desc: "Read to learn Smite (holy — ruinous vs undead and demons)." },
    tome_tideburst:  { name: "Tome: Tideburst", icon: "📘", type: "spellbook", teaches: "tideburst", desc: "Read to learn Tideburst (water)." },
    tome_water_jet:  { name: "Tome: Water Jet", icon: "📘", type: "spellbook", teaches: "water_jet", desc: "Read to learn Water Jet (water)." },
    tome_cleanse:    { name: "Tome: Cleanse", icon: "📗", type: "spellbook", teaches: "cleanse", desc: "Read to learn Cleanse (cure poison/burn/bleed)." },
    tome_panacea:    { name: "Tome: Panacea", icon: "📗", type: "spellbook", teaches: "panacea", desc: "Read to learn Panacea (cure ALL + heal)." },
    tome_shieldwall: { name: "Tome: Shieldwall", icon: "📗", type: "spellbook", teaches: "shieldwall", desc: "Read to learn Shieldwall." },
    tome_revive:     { name: "Tome: Revive", icon: "📓", type: "spellbook", teaches: "revive", desc: "Read to learn Revive." },
    tome_lightning:  { name: "Tome: Lightning", icon: "📔", type: "spellbook", teaches: "lightning", desc: "Read to learn Lightning." },
    tome_shadowstep:{ name: "Tome: Shadowstep", icon: "📓", type: "spellbook", teaches: "shadowstep", desc: "Read to learn Shadowstep (blink behind a foe)." },
    tome_grapple:   { name: "Tome: Hook Snare", icon: "📓", type: "spellbook", teaches: "grapple", desc: "Read to learn Hook Snare (yank a foe to you)." },
    tome_warcry:    { name: "Tome: Warcry", icon: "📯", type: "spellbook", teaches: "warcry", desc: "Read to learn Warcry (+melee for you + allies)." },
    tome_ember_weapon:{ name: "Tome: Ember Weapon", icon: "📕", type: "spellbook", teaches: "ember_weapon", desc: "Read to learn Ember Weapon (strikes ignite)." },
    tome_blessed_weapon:{ name: "Tome: Blessed Weapon", icon: "📙", type: "spellbook", teaches: "blessed_weapon", desc: "Read to learn Blessed Weapon (strikes count holy)." },
   tome_tidal_wave:{ name: "Tome: Tidal Wave", icon: "📘", type: "spellbook", teaches: "tidal_wave", desc: "Read to learn Tidal Wave (deep-delve cataclysm)." },
    tome_energy_beam:{ name: "Tome: Energy Beam", icon: "📔", type: "spellbook", teaches: "energy_beam", desc: "Read to learn Energy Beam (deep-delve cataclysm)." },
    tome_meteorfall:{ name: "Tome: Meteorfall", icon: "📕", type: "spellbook", teaches: "meteorfall", desc: "Read to learn Meteorfall (deep-delve cataclysm)." },
    tome_whiteout:  { name: "Tome: Whiteout", icon: "📘", type: "spellbook", teaches: "whiteout", desc: "Read to learn Whiteout (deep-delve cataclysm)." },
    tome_wind_cutter: { name: "Tome: Wind Cutter", icon: "📘", type: "spellbook", teaches: "wind_cutter", desc: "Read to learn Wind Cutter (whirlwind's blades)." },
    tome_storm_of_blades: { name: "Tome: Storm of Blades", icon: "📘", type: "spellbook", teaches: "storm_of_blades", desc: "Read to learn Storm of Blades (deep-delve cataclysm)." },
    tome_whirlpool: { name: "Tome: Whirlpool", icon: "📘", type: "spellbook", teaches: "whirlpool", desc: "Read to learn Whirlpool (water jet's snare)." },
    tome_primordial_sea: { name: "Tome: Primordial Sea", icon: "📘", type: "spellbook", teaches: "primordial_sea", desc: "Read to learn Primordial Sea (deep-delve cataclysm)." },
    tome_line_of_fire: { name: "Tome: Line of Fire", icon: "📕", type: "spellbook", teaches: "line_of_fire", desc: "Read to learn Line of Fire (fireball's crack)." },
    tome_raging_volcano: { name: "Tome: Raging Volcano", icon: "📕", type: "spellbook", teaches: "raging_volcano", desc: "Read to learn Raging Volcano (deep-delve cataclysm)." },
    tome_icicle_line: { name: "Tome: Icicle Line", icon: "📘", type: "spellbook", teaches: "icicle_line", desc: "Read to learn Icicle Line (frostbite's skewer)." },
    tome_crystal_prison: { name: "Tome: Crystal Prison", icon: "📘", type: "spellbook", teaches: "crystal_prison", desc: "Read to learn Crystal Prison (deep-delve cataclysm)." },
    tome_burning_light: { name: "Tome: Burning Light", icon: "📙", type: "spellbook", teaches: "burning_light", desc: "Read to learn Burning Light (deep-delve cataclysm)." },
    tome_toxic_stab: { name: "Tome: Toxic Stab", icon: "📕", type: "spellbook", teaches: "toxic_stab", desc: "Read to learn Toxic Stab (venom's pierce)." },
    tome_barbed_plague: { name: "Tome: Barbed Plague", icon: "📕", type: "spellbook", teaches: "barbed_plague", desc: "Read to learn Barbed Plague (deep-delve cataclysm)." },
    tome_tamisra: { name: "Tome: Tamisra", icon: "📙", type: "spellbook", teaches: "tamisra", desc: "Read to learn Tamisra (dazzle's dark)." },
    tome_void_hole: { name: "Tome: Void Hole", icon: "📙", type: "spellbook", teaches: "void_hole", desc: "Read to learn Void Hole (deep-delve cataclysm)." },
    tome_life_drain: { name: "Tome: Life Drain", icon: "📗", type: "spellbook", teaches: "life_drain", desc: "Read to learn Life Drain (heal's hunger)." },
    tome_blood_hole: { name: "Tome: Blood Hole", icon: "📗", type: "spellbook", teaches: "blood_hole", desc: "Read to learn Blood Hole (deep-delve cataclysm)." },
  };
  // ================= generated arsenal =================
  // Melee material tiers (user spec): Rusty 1x, Iron 1.2x, Steel 1.5x,
  // Silver 5x vs undead and demons / 1.5x otherwise, Mythril 2x, Dragon's Bone 3x,
  // Oblivion 4x, Dawnstone 4.5x (top) and 5x vs undead and demons like silver.
  const WEAPON_MATS = [
    { mat: "rusty", label: "Rusty", mult: 1, undead: 1, price: 80 },
    { mat: "iron", label: "Iron", mult: 1.2, undead: 1.2, price: 350 },
    { mat: "steel", label: "Steel", mult: 1.5, undead: 1.5, price: 1100 },
    { mat: "silver", label: "Silver", mult: 1.5, undead: 5, price: 2200 },
    { mat: "mythril", label: "Mythril", mult: 2, undead: 2, price: 5200 },
    { mat: "dragonbone", label: "Dragon's Bone", mult: 3, undead: 3, price: 16000 },
    { mat: "oblivion", label: "Oblivion", mult: 4, undead: 4, price: 42000 },
    { mat: "dawnstone", label: "Dawnstone", mult: 4.5, undead: 5, price: 48000 },
  ];
  // Daggers are fast/short; swords/axes/hammers share 1.8 reach with
  // blade/pierce/blunt damage; spears are the longest melee range and
  // always thrust (narrow arc) instead of sweeping.
  const WTYPES = {
    dagger: { label: "Dagger", icon: "🔪", base: 3, range: 1.4, cd: 0.28, dmgType: "pierce", blurb: "Fastest swings, short pierce, lighter hits." },
    whip:   { label: "Whip", icon: "🪢", base: 2, range: 2.2, cd: 0.38, dmgType: "lash", arc: 2.0, sweep: 1.3, blurb: "Long lashing whip: weakest hits at sword speed, sweeping wide arcs — and every tier can stun." },
    sword:  { label: "Sword", icon: "🗡️", base: 6, range: 1.8, cd: 0.38, dmgType: "blade", blurb: "Balanced blade, middling swing, solid hits." },
    axe:    { label: "Axe", icon: "🪓", base: 8, range: 1.8, cd: 0.45, dmgType: "pierce", blurb: "Slower bearded war-axe, finds gaps (pierce), heavy hits." },
    hammer: { label: "Hammer", icon: "🔨", base: 9, range: 1.8, cd: 0.55, dmgType: "blunt", blurb: "Slowest crushing blunt, heaviest hits." },
    spear:  { label: "Spear", icon: "🔱", base: 8, range: 3.0, cd: 0.5, dmgType: "pierce", arc: 0.35, blurb: "Longest reach of any melee: a narrow thrusting line (no sweep), slow swing, heavy hits." },
  };
  const MAT_ID = { rusty: "rusted", iron: "iron", steel: "steel", silver: "silver", mythril: "mythril", dragonbone: "dragonbone", oblivion: "oblivion", dawnstone: "dawnstone" };
  // Flat boosts grow smoothly by tier (rusty ~+4, iron ~+12, steel ~+30, silver ~+42, mythril ~+75, dragonbone ~+163)
  // on top of base x mult, so late-game blades stay relevant. Multipliers unchanged.
  // Slow-swing compensation lives in two places: FAM_DMG equalizes swing speed
  // (family mult ∝ swing time, so the wielder's own ATK deals the same DPS in
  // any hand), and TYPE_DMG_BONUS lifts the visible weapon ATK of slower
  // families so their DPS runs slightly higher: whips/swords ≈ dagger,
  // axes ~+6%, spears ~+8%, hammers ~+10% (converges from above at low tiers,
  // where small base gaps loom larger). Bows are the deliberate exception:
  // ranged safety means bow DPS is tuned to dagger parity, never above it.
  const TYPE_DMG_BONUS = { dagger: 0, whip: 0.03, sword: 0.04, axe: 0.06, spear: 0.08, hammer: 0.10 };
  const MELEE_FLAT = { rusty: 6, iron: 18, steel: 45, silver: 63, mythril: 112, dragonbone: 245, oblivion: 480, dawnstone: 600 };
  const MAT_NAME = { rusty: "Rusted", iron: "Iron", steel: "Steel", silver: "Silver", mythril: "Mythril", dragonbone: "Dragon's Bone", oblivion: "Oblivion", dawnstone: "Dawnstone" };
  const WICON = { dagger: "🔪", sword: "🗡️", axe: "🪓", hammer: "🔨", spear: "🔱", whip: "🪢" };
  // effective display reach: sweeping families (whips) lash past base range
  function effWRange(w) { try { return Math.round((w.range || 0) * (w.sweep || 1) * 10) / 10; } catch (e) { return (w && w.range) || 0; } }
  for (const m of WEAPON_MATS) {
    for (const [wt, w] of Object.entries(WTYPES)) {
      const id = (m.mat === "rusty" && wt === "sword") ? "rusted_sword"
        : (m.mat === "iron" && wt === "sword") ? "iron_sword"
        : (m.mat === "steel" && wt === "sword") ? "steel_sword"
        : `${MAT_ID[m.mat]}_${wt}`;
      const atk = Math.max(1, Math.round((w.base * m.mult + (MELEE_FLAT[m.mat] || 0)) * (1 + (TYPE_DMG_BONUS[wt] || 0))));
      const extra = (id === "steel_sword") ? ", +120 HP" : "";
      const bonus = { atk };
      if (id === "steel_sword") bonus.maxHp = 120;
      const undeadTxt = (m.mat === "silver" || m.mat === "dawnstone") ? " 5x vs undead and demons!" : "";
      ITEMS[id] = {
        name: `${MAT_NAME[m.mat]} ${w.label}`, icon: wt === "sword" && m.mat === "steel" ? "🏅" : (WICON[wt] || "🗡️"),
        type: "equipment", slot: "weapon", wtype: wt, mat: m.mat,
        tierMult: m.mult, undeadMult: m.undead, dmgType: w.dmgType,
        weaponRange: w.range, weaponCd: w.cd,
        ...(w.arc != null ? { weaponArc: w.arc } : {}),
        ...(w.sweep != null ? { weaponSweep: w.sweep } : {}),
        bonus, price: Math.round(m.price * (w.base / 4)),
        desc: `+${atk} ATK${extra}. ${w.blurb} (${w.dmgType}, ${effWRange(w)} reach, x${m.mult}${undeadTxt})`,
      };
    }
  }
  // ---- whip stings: every tier can stun, better tiers sting longer ----
  // (basic crack: ~0.5s; dragonbone: 1.5s). Chance + duration grow by tier.
  const WHIP_STUN = {
    rusted_whip: { chance: 0.15, duration: 0.5 }, iron_whip: { chance: 0.2, duration: 0.6 },
    steel_whip: { chance: 0.25, duration: 0.8 }, silver_whip: { chance: 0.25, duration: 0.8 },
    mythril_whip: { chance: 0.35, duration: 1.2 }, dragonbone_whip: { chance: 0.45, duration: 1.5 },
    oblivion_whip: { chance: 0.55, duration: 2 },
    dawnstone_whip: { chance: 0.6, duration: 2.2 },
  };
  for (const [wid, st] of Object.entries(WHIP_STUN)) {
    try {
      if (ITEMS[wid]) {
        ITEMS[wid].statusHit = { type: "stun", chance: st.chance, duration: st.duration, procCd: 8 };
        ITEMS[wid].desc += ` Stuns (${Math.round(st.chance * 100)}%, ${st.duration}s, 8s cooldown).`;
      }
    } catch (e) { }
  }
  // ---- bows (speed, power) ----
  // Bow damage is LINEAR in bow ATK (see bowShotDamage in game.js): per-shot
  // ≈ (wielder ATK + 2x bow ATK) x 2.2 x arrow² x bow power, fired at the
  // 0.55s bow cadence. Bow ATK below is solved per tier-band so a bow firing
  // plain iron arrows deals the same DPS as the same-tier dagger — ranged
  // safety earns no slow-swing bonus. Better arrows / enchanted bows /
  // legendaries still rise above that line.
  const BOWS = [
    { id: "old_bow", name: "Old Bow", atk: 15, range: 8, speed: 1, power: 1, price: 120, desc: "Creaky but honest. (1x speed, 1x power) Ranged: DPS ≈ same-tier dagger." },
    { id: "oak_bow", name: "Oak Bow (Wood and Flax)", atk: 21, range: 9, speed: 1.1, power: 1.2, price: 180, desc: "Wood and flax string. (1.1x speed, 1.2x power) Ranged: DPS ≈ same-tier dagger." },
    { id: "yew_bow", name: "Yew Bow (Hardwood and Horsestring)", atk: 30, range: 10, speed: 1.1, power: 1.5, price: 450, desc: "Hardwood and horsestring. (1.1x speed, 1.5x power) Ranged: DPS ≈ same-tier dagger." },
    { id: "frostwood_bow", name: "Frostwood Bow (Yeti Braids)", atk: 51, range: 11, speed: 1.2, power: 1.75, element: "ice", price: 2900, desc: "Frostwood and yeti braids. Cold to the touch. (1.2x speed, 1.75x power, ice) Ranged: DPS ≈ same-tier dagger." },
    { id: "wardens_bow", name: "Warden's Bow (Emberwood and Salamander Tongue)", atk: 69, range: 11, speed: 1.4, power: 1.5, element: "fire", price: 3200, bonus2: { maxMp: 120 }, desc: "Emberwood and salamander tongue. (1.4x speed, 1.5x power, fire, +80 MP) Ranged: DPS ≈ same-tier dagger." },
    { id: "yggdrasil_bow", name: "Yggdrasil Bow (Unicorn String)", atk: 87, range: 12, speed: 1.5, power: 2, price: 13500, desc: "Yggdrasil branch and unicorn string. Hums. (1.5x speed, 2x power) Ranged: DPS ≈ same-tier dagger." },
    { id: "dawnstone_bow", name: "Dawnstone Bow (Sunstring)", atk: 128, range: 14, speed: 1.7, power: 3.0, element: "holy", price: 46000, desc: "Dawnstone limbs strung with dawn light. Sings at sunrise. (1.7x speed, 3.0x power, holy) Ranged: DPS ≈ same-tier dagger." },
    { id: "oblivion_bow", name: "Oblivion Bow (Nightmare String)", atk: 110, range: 13, speed: 1.6, power: 2.6, element: "fire", price: 34000, desc: "Dragonbone limbs strung with warlord sinew. Burns the air. (1.6x speed, 2.6x power, fire) Ranged: DPS ≈ same-tier dagger." },
  ];
  for (const b of BOWS) {
    const bonus = { atk: b.atk, ...(b.bonus2 || {}) };
    ITEMS[b.id] = {
      name: b.name, icon: "🏹", type: "equipment", slot: "weapon",
      wtype: "bow", bow: true, range: b.range, bowSpeed: b.speed, bowPower: b.power,
      element: b.element || null, bonus, price: b.price,
      desc: `+${b.atk} ATK${b.bonus2 && b.bonus2.maxMp ? `, +${b.bonus2.maxMp} MP` : ""}. Needs arrows (hotbar, slot order). ${b.desc}`,
    };
  }
  // ---- wands (mana) / staves (power): Quartz 1/1, Ruby .75/1.3, Sapphire .6/1.5,
  // Holy Bead .2/5x holy else .6/1.5, Emerald .5/2, Dragon's Horn .33/3 ----
  const FOCI = [
    { mat: "quartz", label: "Quartz", mana: 1, manaHoly: 1, power: 1, powerHoly: 1, price: 180 },
    { mat: "ruby", label: "Ruby", mana: 0.75, manaHoly: 0.75, power: 1.3, powerHoly: 1.3, price: 650 },
    { mat: "sapphire", label: "Sapphire", mana: 0.6, manaHoly: 0.6, power: 1.5, powerHoly: 1.5, price: 1900 },
    { mat: "holybead", label: "Holy Bead", mana: 0.6, manaHoly: 0.2, power: 1.5, powerHoly: 5, price: 5200 },
    { mat: "emerald", label: "Emerald", mana: 0.5, manaHoly: 0.5, power: 2, powerHoly: 2, price: 2900 },
    { mat: "dragonhorn", label: "Dragon's Horn", mana: 0.33, manaHoly: 0.33, power: 3, powerHoly: 3, price: 14500 },
    { mat: "dawnstone", label: "Dawnstone", mana: 0.2, manaHoly: 0.2, power: 4.5, powerHoly: 4.5, price: 44000 },
    { mat: "oblivion", label: "Oblivion", mana: 0.25, manaHoly: 0.25, power: 4, powerHoly: 4, price: 38000 },
  ];
  const FOCUS_WATK = { quartz: 8, ruby: 24, sapphire: 54, holybead: 112, emerald: 112, dragonhorn: 248, oblivion: 480, dawnstone: 570 };
  for (const f of FOCI) {
    const holyTxt = f.mat === "holybead" ? " (0.2x holy mana!)" : "";
    ITEMS[`wand_${f.mat}`] = {
      name: `${f.label} Wand`, icon: "🪄", type: "equipment", slot: "weapon",
      wtype: "wand", wand: true, mat: f.mat, manaMult: f.mana, manaHolyMult: f.manaHoly,
      weaponRange: 1.6, weaponCd: 0.4, dmgType: "pierce",
      bonus: { atk: FOCUS_WATK[f.mat], matk: FOCUS_WATK[f.mat] * 2 }, price: f.price,
      desc: `Focus: spells cost x${f.mana}${holyTxt}. Bind to a hotbar slot — only the FIRST wand in slot order counts. +${FOCUS_WATK[f.mat]} ATK poke, +${FOCUS_WATK[f.mat] * 2} MATK.`,
    };
    const holyPTxt = f.mat === "holybead" ? " (5x holy power!)" : "";
    const mpBonus = f.mat === "quartz" ? 22 : f.mat === "ruby" ? 75 : f.mat === "sapphire" ? 150 : f.mat === "holybead" ? 225 : f.mat === "emerald" ? 225 : f.mat === "dawnstone" ? 1125 : f.mat === "oblivion" ? 900 : 525;
    ITEMS[`staff_${f.mat}`] = {
      name: `${f.label} Staff`, icon: f.mat === "holybead" ? "✨" : "🔮", type: "equipment", slot: "weapon",
      wtype: "staff", staff: true, mat: f.mat, powerMult: f.power, powerHolyMult: f.powerHoly,
      weaponRange: 1.8, weaponCd: 0.45, dmgType: "blunt",
      bonus: { atk: FOCUS_WATK[f.mat] + 1, matk: (FOCUS_WATK[f.mat] + 1) * 2, maxMp: mpBonus }, price: f.price + 500,
      desc: `Focus: spells x${f.power} power${holyPTxt}. Bind to a hotbar slot — only the FIRST staff in slot order counts. +${FOCUS_WATK[f.mat] + 1} ATK, +${(FOCUS_WATK[f.mat] + 1) * 2} MATK, +${mpBonus} MP.`,
    };
  }
  // Legacy staves revalued as Quartz/Ruby foci (keep ids for saves).
  ITEMS.apprentice_staff = { name: "Apprentice Staff (Quartz)", icon: "🪄", type: "equipment", slot: "weapon", wtype: "staff", staff: true, mat: "quartz", powerMult: 1, powerHolyMult: 1, weaponRange: 1.8, weaponCd: 0.45, dmgType: "blunt", bonus: { atk: 9, matk: 18, maxMp: 22 }, price: 200, desc: "Quartz-capped trainer. Spells x1 power (first staff in hotbar counts). +9 ATK, +18 MATK, +22 MP." };
  ITEMS.fire_staff = { name: "Fire Staff (Ruby)", icon: "🔥", type: "equipment", slot: "weapon", wtype: "staff", staff: true, mat: "ruby", powerMult: 1.3, powerHolyMult: 1.3, element: "fire", weaponRange: 1.8, weaponCd: 0.45, dmgType: "blunt", bonus: { atk: 18, matk: 36, maxMp: 60 }, price: 550, desc: "Ruby-capped, warm. Spells x1.3 power, fire spells stronger with Obsidian. +18 ATK, +36 MATK, +60 MP." };
  // ---- elemental rings + strength (all 1.5x) ----
  const RINGS = [
    { id: "obsidian_ring", name: "Obsidian Ring", icon: "🔥", boost: { fire: 1.5 }, price: 4800, desc: "1.5x fire spells/weapons." },
    { id: "coral_ring", name: "Coral Ring", icon: "🪸", boost: { water: 1.5 }, price: 4800, desc: "1.5x water spells/weapons." },
    { id: "rime_ring", name: "Rime Ring", icon: "🧊", boost: { ice: 1.5 }, price: 4800, desc: "1.5x ice spells/weapons." },
    { id: "piezo_ring", name: "Piezo Ring", icon: "⚡", boost: { electric: 1.5 }, price: 4800, desc: "1.5x electric spells/weapons." },
    { id: "holy_ring", name: "Holy Ring", icon: "😇", boost: { holy: 1.5 }, price: 5200, desc: "1.5x holy spells/weapons." },
    { id: "strength_ring", name: "Ring of Strength", icon: "💪", boost: { physical: 1.5 }, price: 5000, desc: "1.5x physical damage (melee, bows, physical spells)." },
  ];
  for (const r of RINGS) {
    ITEMS[r.id] = { name: r.name, icon: r.icon, type: "equipment", slot: "trinket", ringBoost: r.boost, bonus: {}, price: r.price, desc: `${r.desc} (worn ring)` };
  }
  // ---- armor: light/heavy cut physical, enchanted robes cut magical ----
  // sdef is explicit magical defence (bonus.sdef) by tier: cloth/robes guard
  // the mind, light leathers a little, heavy plate barely any.
  const ARMORS = [
    { id: "cloth_robe", name: "Cloth Robe", icon: "🥋", def: 6, hp: 0, mp: 30, sdef: 8, matk: 9, phys: 0.05, magic: 0.1, price: 90, desc: "+9 MATK, +6 DEF, +8 SDEF, +30 MP. Light wrap: 5% physical, 10% magical resist." },
    { id: "leather_armor", name: "Leather Armor", icon: "🦺", def: 15, hp: 39, mp: 0, sdef: 6, phys: 0.12, magic: 0, price: 280, desc: "+15 DEF, +6 SDEF, +39 HP. Light: 12% physical resist." },
    { id: "wayfarer_garb", name: "Wayfarer Garb", icon: "🧥", def: 30, hp: 105, mp: 60, sdef: 12, phys: 0.18, magic: 0.05, spd: 0.1, price: 950, desc: "+30 DEF, +12 SDEF, +105 HP, +60 MP. Light: 18% physical, 5% magical resist. +0.1 SPD." },
    { id: "shadowweave_garb", name: "Shadowweave Garb", icon: "🥷", def: 60, hp: 225, mp: 0, sdef: 27, phys: 0.25, magic: 0.1, spd: 0.25, price: 4200, desc: "+60 DEF, +27 SDEF, +225 HP. Light: 25% physical, 10% magical. +0.25 SPD." },
    { id: "iron_armor", name: "Iron Armor", icon: "🛡️", def: 27, hp: 83, mp: 0, sdef: 6, phys: 0.28, magic: 0, price: 650, desc: "+27 DEF, +6 SDEF, +83 HP. Heavy: 28% physical resist." },
    { id: "steel_plate", name: "Steel Plate", icon: "🛡️", def: 48, hp: 180, mp: 0, sdef: 14, phys: 0.35, magic: 0, spd: -0.1, price: 2400, desc: "+48 DEF, +14 SDEF, +180 HP. Heavy: 35% physical resist. -0.1 SPD." },
    { id: "mythril_plate", name: "Mythril Plate", icon: "🛡️", def: 83, hp: 330, mp: 0, sdef: 30, phys: 0.42, magic: 0.05, spd: -0.1, price: 6800, desc: "+83 DEF, +30 SDEF, +330 HP. Heavy: 42% physical, 5% magical. -0.1 SPD." },
    { id: "dragonbone_plate", name: "Dragonbone Plate", icon: "🐲", def: 173, hp: 720, mp: 0, sdef: 54, phys: 0.5, magic: 0.1, spd: -0.2, price: 18500, desc: "+173 DEF, +54 SDEF, +720 HP. Heavy: 50% physical, 10% magical. -0.2 SPD." },
    { id: "mage_robe", name: "Mage Robe", icon: "🧙", def: 15, hp: 0, mp: 150, sdef: 24, matk: 33, phys: 0, magic: 0.25, price: 550, desc: "+33 MATK, +15 DEF, +24 SDEF, +150 MP. Enchanted: 25% magical resist." },
    { id: "archmage_robe", name: "Archmage Robe", icon: "🔮", def: 36, hp: 165, mp: 300, sdef: 42, matk: 83, phys: 0.05, magic: 0.35, price: 3900, desc: "+83 MATK, +36 DEF, +42 SDEF, +165 HP, +300 MP. Enchanted: 35% magical, 5% physical resist." },
    { id: "holy_vestments", name: "Holy Vestments", icon: "😇", def: 39, hp: 195, mp: 390, sdef: 51, matk: 98, phys: 0.05, magic: 0.45, price: 8800, desc: "+98 MATK, +39 DEF, +51 SDEF, +195 HP, +390 MP. Enchanted: 45% magical resist. Blessed." },
    { id: "wyrmshroud_robe", name: "Wyrmshroud Robe", icon: "🐲", def: 54, hp: 315, mp: 540, sdef: 84, matk: 143, phys: 0.08, magic: 0.45, price: 17500, desc: "+143 MATK, +54 DEF, +84 SDEF, +315 HP, +540 MP. Enchanted: 45% magical, 8% physical resist. Dragon-scale choir weave — the robe track's dragon tier." },
    { id: "eclipse_garb", name: "Eclipse Garb", icon: "🌒", def: 135, hp: 630, mp: 300, sdef: 90, matk: 60, phys: 0.32, magic: 0.25, spd: 0.3, price: 26000, desc: "+60 MATK, +135 DEF, +90 SDEF, +630 HP, +300 MP. Light: 32% physical, 25% magical. +0.3 SPD. Stitched from warlord shadows." },
    { id: "oblivion_plate", name: "Oblivion Plate", icon: "🌌", def: 300, hp: 1350, mp: 0, sdef: 105, phys: 0.55, magic: 0.15, spd: -0.2, price: 42000, desc: "+300 DEF, +105 SDEF, +1350 HP. Heavy: 55% physical, 15% magical resist. -0.2 SPD. Forged past the end of the world." },
    { id: "void_mantle", name: "Void Mantle", icon: "🕳️", def: 90, hp: 480, mp: 900, sdef: 120, matk: 225, phys: 0.1, magic: 0.55, price: 40000, desc: "+225 MATK, +90 DEF, +120 SDEF, +480 HP, +900 MP. Enchanted: 55% magical, 10% physical resist. Wears the dark like a crown." },
    { id: "dawnstone_plate", name: "Dawnstone Plate", icon: "🌟", def: 353, hp: 1650, mp: 0, sdef: 132, phys: 0.58, magic: 0.18, spd: -0.2, price: 48000, desc: "+353 DEF, +132 SDEF, +1650 HP. Heavy: 58% physical, 18% magical resist. -0.2 SPD. Wards the unholy: 30% less damage from undead and demons. Sunrise hammered into plate — heaven-boss prize." },
    { id: "dawnshroud_robe", name: "Dawnshroud Robe", icon: "🌅", def: 108, hp: 600, mp: 1080, sdef: 143, matk: 270, phys: 0.12, magic: 0.58, price: 46000, desc: "+270 MATK, +108 DEF, +143 SDEF, +600 HP, +1080 MP. Enchanted: 58% magical, 12% physical resist. Wards the unholy: 30% less damage from undead and demons. Woven dawnlight — heaven-boss prize." },
    { id: "patched_kasaya", name: "Patched Kasaya", icon: "🥻", atk: 9, def: 5, hp: 30, mp: 0, sdef: 6, phys: 0.05, magic: 0, price: 120, desc: "+9 ATK, +5 DEF, +6 SDEF, +30 HP. A mendicant's patched gi: 5% physical resist. Kasaya feed the Ascetic tree while worn." },
    { id: "ironthread_kasaya", name: "Ironthread Kasaya", icon: "🥻", atk: 24, def: 12, hp: 90, mp: 0, sdef: 12, phys: 0.12, magic: 0, price: 900, desc: "+24 ATK, +12 DEF, +12 SDEF, +90 HP. Iron-threaded saffron: 12% physical resist. Kasaya feed the Ascetic tree while worn." },
    { id: "sunsilk_kasaya", name: "Sunsilk Kasaya", icon: "🥻", atk: 51, def: 24, hp: 210, mp: 0, sdef: 21, phys: 0.2, magic: 0.05, price: 5200, desc: "+51 ATK, +24 DEF, +21 SDEF, +210 HP. Sun-bright weave: 20% physical, 5% magical resist. Kasaya feed the Ascetic tree while worn." },
    { id: "dragonhide_kasaya", name: "Dragonhide Kasaya", icon: "🥻", atk: 90, def: 45, hp: 450, mp: 0, sdef: 36, phys: 0.3, magic: 0.08, price: 15000, desc: "+90 ATK, +45 DEF, +36 SDEF, +450 HP. Cured dragon hide over saffron: 30% physical, 8% magical resist. Kasaya feed the Ascetic tree while worn." },
    { id: "novice_habit", name: "Novice Habit", icon: "🕯️", def: 6, hp: 0, mp: 60, sdef: 9, matk: 12, phys: 0, magic: 0.08, price: 130, desc: "+12 MATK, +6 DEF, +9 SDEF, +60 MP. A novice's dark tunic: 8% magical resist. Habitus feed the Devotion tree while worn." },
    { id: "canon_habit", name: "Canon Habit", icon: "🕯️", def: 12, hp: 0, mp: 150, sdef: 21, matk: 30, phys: 0, magic: 0.18, price: 950, desc: "+30 MATK, +12 DEF, +21 SDEF, +150 MP. Oath-bound black: 18% magical resist. Habitus feed the Devotion tree while worn." },
    { id: "vesper_habit", name: "Vesper Habit", icon: "🕯️", def: 21, hp: 0, mp: 300, sdef: 39, matk: 60, phys: 0, magic: 0.3, price: 5500, desc: "+60 MATK, +21 DEF, +39 SDEF, +300 MP. Evening-choir weave: 30% magical resist. Habitus feed the Devotion tree while worn." },
    { id: "seraph_habit", name: "Seraph Habit", icon: "🕯️", def: 36, hp: 0, mp: 525, sdef: 66, matk: 113, phys: 0, magic: 0.4, price: 16000, desc: "+113 MATK, +36 DEF, +66 SDEF, +525 MP. White-fire vestment: 40% magical resist. Habitus feed the Devotion tree while worn." },
    { id: "oblivion_kasaya", name: "Oblivion Kasaya", icon: "\u{1F30C}", atk: 158, def: 83, hp: 840, mp: 0, sdef: 68, phys: 0.35, magic: 0.1, price: 42000, desc: "+158 ATK, +83 DEF, +68 SDEF, +840 HP. Woven from the end of the world: 35% physical, 10% magical resist. Hell-only. Kasaya feed the Ascetic tree while worn." },
    { id: "void_habit", name: "Void Habit", icon: "\u{1F56F}\uFE0F", def: 75, hp: 450, mp: 825, sdef: 113, matk: 195, phys: 0.08, magic: 0.5, price: 40000, desc: "+195 MATK, +75 DEF, +113 SDEF, +450 HP, +825 MP. Enchanted: 50% magical, 8% physical resist. Wears the dark like a crown. Hell-only. Habitus feed the Devotion tree while worn." },
    { id: "dawnsilk_kasaya", name: "Dawnsilk Kasaya", icon: "\u{1F97B}", atk: 192, def: 102, hp: 1050, mp: 0, sdef: 87, phys: 0.38, magic: 0.12, price: 48000, desc: "+192 ATK, +102 DEF, +87 SDEF, +1050 HP. Sunrise hammered into silk: 38% physical, 12% magical resist. Wards the unholy: 30% less damage from undead and demons. Heaven-boss prize. Kasaya feed the Ascetic tree while worn." },
    { id: "dawnchoir_habit", name: "Dawnchoir Habit", icon: "\u{1F56F}\uFE0F", def: 93, hp: 600, mp: 1050, sdef: 138, matk: 240, phys: 0.10, magic: 0.56, price: 46000, desc: "+240 MATK, +93 DEF, +138 SDEF, +600 HP, +1050 MP. Enchanted: 56% magical, 10% physical resist. Wards the unholy: 30% less damage from undead and demons. Morning-choir weave \u2014 heaven-boss prize. Habitus feed the Devotion tree while worn." },
  ];
  for (const a of ARMORS) {
    const bonus = {};
    if (a.atk) bonus.atk = a.atk;
    if (a.def) bonus.def = a.def;
    if (a.sdef) bonus.sdef = a.sdef;
    if (a.matk) bonus.matk = a.matk;
    if (a.hp) bonus.maxHp = a.hp;
    if (a.mp) bonus.maxMp = a.mp;
    if (a.spd) bonus.spd = a.spd;
    ITEMS[a.id] = { name: a.name, icon: a.icon, type: "equipment", slot: "armor", bonus, resPhys: a.phys, resMagic: a.magic, price: a.price, desc: a.desc };
  }
  // ---- shields: the off-hand's best friend (parry + passive guard) ----
  // Parry math: a shield parry cuts the blow to 1/20 x parryMult (iron 0.9,
  // steel 0.8, silver 0.65, mythril 0.3, dragonbone 0.2 — so mythril takes
  // only 0.015 of the head-on damage). Worn, they also guard passively
  // (+DEF physical, +SDEF magical) by tier. Equip one (armor-style), bind a
  // slot as your off-hand, and press Q to parry with it.
  const SHIELDS = [
    { id: "wooden_buckler", name: "Wooden Buckler", icon: "🛡️", def: 8, sdef: 2, hp: 15, parry: 1.0, price: 110, desc: "+8 DEF, +2 SDEF, +15 HP. A plank with a boss: parries cut blows to 1/20 (x1.0)." },
    { id: "iron_shield", name: "Iron Shield", icon: "🛡️", def: 23, sdef: 6, hp: 75, parry: 0.9, price: 600, desc: "+23 DEF, +6 SDEF, +75 HP. Iron-bound: parries cut blows to 1/20 x0.9." },
    { id: "steel_shield", name: "Steel Shield", icon: "🛡️", def: 45, sdef: 14, hp: 180, parry: 0.8, price: 2300, desc: "+45 DEF, +14 SDEF, +180 HP. Soldier's wall: parries cut blows to 1/20 x0.8." },
    { id: "silver_shield", name: "Silver Shield", icon: "🛡️", def: 54, sdef: 23, hp: 225, parry: 0.65, price: 4600, desc: "+54 DEF, +23 SDEF, +225 HP. Blessed silver: parries cut blows to 1/20 x0.65. Bites the unholy back (undead and demons)." },
    { id: "mythril_shield", name: "Mythril Shield", icon: "🛡️", def: 83, sdef: 30, hp: 330, parry: 0.3, price: 9500, desc: "+83 DEF, +30 SDEF, +330 HP. Sky-blue aegis: parries cut blows to 1/20 x0.3 (0.015 of head-on)." },
    { id: "dragonbone_shield", name: "Dragonbone Shield", icon: "🐲", def: 173, sdef: 54, hp: 720, parry: 0.2, price: 22000, desc: "+173 DEF, +54 SDEF, +720 HP. A dragon's scapula: parries cut blows to 1/20 x0.2." },
    { id: "oblivion_aegis", name: "Oblivion Aegis", icon: "🌌", def: 300, sdef: 105, hp: 1350, parry: 0.1, price: 45000, desc: "+300 DEF, +105 SDEF, +1350 HP. A slab of the end: parries cut blows to 1/20 x0.1." },
    { id: "dawnstone_aegis", name: "Dawnstone Aegis", icon: "🌟", def: 353, sdef: 132, hp: 1650, parry: 0.08, price: 48000, desc: "+353 DEF, +132 SDEF, +1650 HP. A sunrise held edge-on: parries cut blows to 1/20 x0.08. Wards the unholy: 30% less damage from undead and demons. Heaven-boss prize." },
  ];
  for (const s of SHIELDS) {
    const bonus = {};
    if (s.def) bonus.def = s.def;
    if (s.sdef) bonus.sdef = s.sdef;
    if (s.hp) bonus.maxHp = s.hp;
    ITEMS[s.id] = { name: s.name, icon: s.icon, type: "equipment", slot: "shield", shield: true, parryMult: s.parry, bonus, price: s.price, desc: s.desc };
  }
  // ---- hybrids (enchanted: rare) ----
  // statusHit.procs carry an internal cooldown (procCd, seconds): the bite can
  // only trigger once per window, then goes quiet. Descs always state it.
  ITEMS.smite_blade = { name: "Smite Blade (Silver + Holy Bead)", icon: "⚜️", type: "equipment", slot: "weapon", wtype: "sword", mat: "silver", tierMult: 1.5, undeadMult: 6, dmgType: "blade", element: "holy", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 69 }, price: 12500, smite: true, statusHit: { type: "blind", chance: 0.5, potency: 1.2, procCd: 6 }, desc: "+69 ATK holy blade. 6x vs undead and demons, blinds (50%, 6s cooldown). Smite enchant. (blade/holy, 1.8 reach)" };
  ITEMS.frostfang_bow = { name: "Frostfang Bow (Frostwood + Sapphire)", icon: "🏹", type: "equipment", slot: "weapon", wtype: "bow", bow: true, range: 11, bowSpeed: 1.2, bowPower: 2.2, element: "ice", bonus: { atk: 29 }, price: 13000, statusHit: { type: "freeze", chance: 0.5, duration: 2, potency: 1.2, procCd: 8 }, desc: "+29 ATK frost bow. 2.2x power, freezes (50%, 2s, 8s cooldown). Sapphire frost enchant. Ranged: DPS ≈ same-tier dagger. Needs arrows." };
  ITEMS.cinderbrand = { name: "Cinderbrand (Steel + Ruby)", icon: "🔥", type: "equipment", slot: "weapon", wtype: "sword", mat: "steel", tierMult: 1.5, undeadMult: 1.5, dmgType: "blade", element: "fire", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 63 }, price: 9800, statusHit: { type: "burn", chance: 0.6, dps: 6, potency: 1.2, procCd: 6 }, desc: "+63 ATK fire blade. Ignites (60% burn, 6s cooldown). Ruby ember enchant. (blade/fire)" };
  // ---- more hybrids: every tier gets its enchanted teeth ----
  // iron band (ember / venom): cinder herbs and wild venoms on iron
  ITEMS.ember_dagger = { name: "Ember Dagger", icon: "🔪", type: "equipment", slot: "weapon", wtype: "dagger", mat: "iron", tierMult: 1.2, undeadMult: 1.2, dmgType: "pierce", element: "fire", weaponRange: 1.4, weaponCd: 0.28, bonus: { atk: 30 }, price: 2400, statusHit: { type: "burn", chance: 0.45, dps: 4, potency: 1, procCd: 10 }, desc: "+30 ATK ember dagger. Ignites (45% burn, 10s cooldown). Fast, short pierce. (pierce/fire)" };
  ITEMS.venom_spear = { name: "Venom Spear", icon: "🔱", type: "equipment", slot: "weapon", wtype: "spear", mat: "iron", tierMult: 1.2, undeadMult: 1.2, dmgType: "pierce", weaponRange: 3.0, weaponCd: 0.5, weaponArc: 0.35, bonus: { atk: 39 }, price: 2600, statusHit: { type: "poison", chance: 0.5, pct: 0.03, potency: 1, procCd: 8 }, desc: "+39 ATK venom spear. Envenoms (50%, 8s cooldown). Longest-reach thrust (3.0, narrow line)." };
  // steel band (frost / tide / storm / sanctified): frostwood, pearls, feathers, beads
  ITEMS.frost_axe = { name: "Frost Axe", icon: "🪓", type: "equipment", slot: "weapon", wtype: "axe", mat: "steel", tierMult: 1.5, undeadMult: 1.5, dmgType: "pierce", element: "ice", weaponRange: 1.8, weaponCd: 0.45, bonus: { atk: 68 }, price: 7200, statusHit: { type: "freeze", chance: 0.35, duration: 1.5, potency: 1.1, procCd: 12 }, desc: "+68 ATK frost axe. Freezes (35%, 1.5s, 12s cooldown). Finds gaps (pierce/ice)." };
  ITEMS.tidebrand = { name: "Tidebrand Cutlass", icon: "🌊", type: "equipment", slot: "weapon", wtype: "sword", mat: "steel", tierMult: 1.5, undeadMult: 1.5, dmgType: "blade", element: "water", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 63 }, price: 7400, statusHit: { type: "poison", chance: 0.5, pct: 0.03, potency: 1.1, procCd: 8 }, desc: "+63 ATK tide cutlass. Brine-poisons (50%, 8s cooldown). (blade/water)" };
  ITEMS.storm_hammer = { name: "Storm Hammer", icon: "🔨", type: "equipment", slot: "weapon", wtype: "hammer", mat: "steel", tierMult: 1.5, undeadMult: 1.5, dmgType: "blunt", element: "electric", weaponRange: 1.8, weaponCd: 0.55, bonus: { atk: 75 }, price: 7900, statusHit: { type: "paralyze", chance: 0.4, potency: 1.1, procCd: 10 }, desc: "+75 ATK storm hammer. Paralyzes (40%, 10s cooldown). Slow, crushing blunt. (blunt/electric)" };
  ITEMS.sanctified_maul = { name: "Sanctified Maul", icon: "😇", type: "equipment", slot: "weapon", wtype: "hammer", mat: "silver", tierMult: 1.5, undeadMult: 6, dmgType: "blunt", element: "holy", weaponRange: 1.8, weaponCd: 0.55, bonus: { atk: 80 }, price: 13500, smite: true, statusHit: { type: "blind", chance: 0.5, potency: 1.2, procCd: 8 }, desc: "+80 ATK sanctified maul. 6x vs undead and demons, blinds (50%, 8s cooldown). (blunt/holy)" };
  // mythril band (rime / inferno / tempest): the frost-enchanted mythril sword lives here
  ITEMS.rimebrand = { name: "Rimebrand (Mythril + Frostwood + Sapphire)", icon: "❄️", type: "equipment", slot: "weapon", wtype: "sword", mat: "mythril", tierMult: 2, undeadMult: 2, dmgType: "blade", element: "ice", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 128 }, price: 19000, statusHit: { type: "freeze", chance: 0.45, duration: 2, potency: 1.3, procCd: 10 }, desc: "+128 ATK frost-enchanted mythril sword. Freezes (45%, 2s, 10s cooldown). (blade/ice)" };
  ITEMS.inferbrand = { name: "Inferbrand", icon: "🌋", type: "equipment", slot: "weapon", wtype: "sword", mat: "mythril", tierMult: 2, undeadMult: 2, dmgType: "blade", element: "fire", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 128 }, price: 19000, statusHit: { type: "burn", chance: 0.6, dps: 8, potency: 1.3, procCd: 8 }, desc: "+128 ATK inferno mythril sword. Ignites (60% burn, 8s cooldown). (blade/fire)" };
  ITEMS.tempest_spear = { name: "Tempest Spear", icon: "🔱", type: "equipment", slot: "weapon", wtype: "spear", mat: "mythril", tierMult: 2, undeadMult: 2, dmgType: "pierce", element: "electric", weaponRange: 3.0, weaponCd: 0.5, weaponArc: 0.35, bonus: { atk: 138 }, price: 19500, statusHit: { type: "paralyze", chance: 0.5, potency: 1.3, procCd: 8 }, desc: "+138 ATK tempest spear. Paralyzes (50%, 8s cooldown). Longest-reach thrust (3.0, narrow line). (electric)" };
  // dragon band (wyrm enchants): bone + horn + an elemental heart
  ITEMS.frostwyrm_blade = { name: "Frostwyrm Blade", icon: "🐲", type: "equipment", slot: "weapon", wtype: "sword", mat: "dragonbone", tierMult: 3, undeadMult: 3, dmgType: "blade", element: "ice", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 269 }, price: 34000, statusHit: { type: "freeze", chance: 0.5, duration: 2.5, potency: 1.5, procCd: 8 }, desc: "+269 ATK dragonbone frost blade. Freezes (50%, 2.5s, 8s cooldown). (blade/ice)" };
  ITEMS.cinderwyrm_maul = { name: "Cinderwyrm Maul", icon: "🐲", type: "equipment", slot: "weapon", wtype: "hammer", mat: "dragonbone", tierMult: 3, undeadMult: 3, dmgType: "blunt", element: "fire", weaponRange: 1.8, weaponCd: 0.55, bonus: { atk: 294 }, price: 35000, statusHit: { type: "burn", chance: 0.7, dps: 8, potency: 1.5, procCd: 8 }, desc: "+294 ATK dragonbone ember maul. Ignites (70% burn, 8s cooldown). (blunt/fire)" };
  ITEMS.stormwyrm_halberd = { name: "Stormwyrm Halberd", icon: "🔱", type: "equipment", slot: "weapon", wtype: "spear", mat: "dragonbone", tierMult: 3, undeadMult: 3, dmgType: "pierce", element: "electric", weaponRange: 3.0, weaponCd: 0.5, weaponArc: 0.35, bonus: { atk: 284 }, price: 35000, statusHit: { type: "paralyze", chance: 0.55, potency: 1.5, procCd: 8 }, desc: "+284 ATK dragonbone storm halberd. Paralyzes (55%, 8s cooldown). Longest-reach thrust (3.0, narrow line). (electric)" };
  ITEMS.venomwyrm_fang = { name: "Venomwyrm Fang", icon: "🐍", type: "equipment", slot: "weapon", wtype: "dagger", mat: "dragonbone", tierMult: 3, undeadMult: 3, dmgType: "pierce", element: "water", weaponRange: 1.4, weaponCd: 0.28, bonus: { atk: 252 }, price: 33000, statusHit: { type: "poison", chance: 0.6, pct: 0.04, potency: 1.4, procCd: 8 }, desc: "+252 ATK dragonbone venom fang. Envenoms (60%, 8s cooldown). Fast, short pierce. (water)" };
  ITEMS.dawnwyrm_blade = { name: "Dawnwyrm Blade", icon: "🌅", type: "equipment", slot: "weapon", wtype: "sword", mat: "dragonbone", tierMult: 3, undeadMult: 4, dmgType: "blade", element: "holy", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 269, maxHp: 180 }, price: 38000, smite: true, statusHit: { type: "blind", chance: 0.6, potency: 1.4, procCd: 8 }, desc: "+269 ATK, +180 HP holy dragonbone blade. 4x vs undead and demons, blinds (60%, 8s cooldown). (blade/holy)" };
  // enchanted bows (string the storm and the tide)
  ITEMS.sparkbow = { name: "Sparkbow", icon: "🏹", type: "equipment", slot: "weapon", wtype: "bow", bow: true, range: 11, bowSpeed: 1.3, bowPower: 1.6, element: "electric", bonus: { atk: 26 }, price: 7200, statusHit: { type: "paralyze", chance: 0.35, potency: 1.1, procCd: 10 }, desc: "+26 ATK spark bow. 1.6x power, paralyzes (35%, 10s cooldown). Ranged: DPS ≈ same-tier dagger. Needs arrows." };
  ITEMS.tidebow = { name: "Tidebow", icon: "🏹", type: "equipment", slot: "weapon", wtype: "bow", bow: true, range: 11, bowSpeed: 1.2, bowPower: 1.6, element: "water", bonus: { atk: 26 }, price: 6900, statusHit: { type: "poison", chance: 0.4, pct: 0.03, potency: 1.1, procCd: 10 }, desc: "+26 ATK tide bow. 1.6x power, brine-poisons (40%, 10s cooldown). Ranged: DPS ≈ same-tier dagger. Needs arrows." };
  // enchanted armor (plate and robes that carry an element)
  ITEMS.dragonscale_vest = { name: "Dragonscale Vest", icon: "🐲", type: "equipment", slot: "armor", bonus: { def: 172, sdef: 54, maxHp: 720 }, resPhys: 0.4, resMagic: 0.12, price: 16500, desc: "+172 DEF, +54 SDEF, +720 HP. Dragonbone scales: 40% physical, 12% magical resist." };
  ITEMS.emberplate = { name: "Emberplate", icon: "🌋", type: "equipment", slot: "armor", bonus: { def: 60, sdef: 15, maxHp: 240 }, resPhys: 0.4, resMagic: 0.05, price: 7300, desc: "+60 DEF, +15 SDEF, +240 HP. Ember-lined steel: 40% physical resist. Warm." };
  ITEMS.rimeplate = { name: "Rimeplate", icon: "🧊", type: "equipment", slot: "armor", bonus: { def: 93, sdef: 33, maxHp: 360, maxMp: 240 }, resPhys: 0.42, resMagic: 0.15, price: 15500, desc: "+93 DEF, +33 SDEF, +360 HP, +240 MP. Rime-bound mythril: 42% physical, 15% magical resist." };
  ITEMS.tideward_robe = { name: "Tideward Robe", icon: "🌊", type: "equipment", slot: "armor", bonus: { def: 27, sdef: 48, matk: 81, maxHp: 120, maxMp: 300 }, resPhys: 0.05, resMagic: 0.42, price: 9600, desc: "+81 MATK, +27 DEF, +48 SDEF, +120 HP, +300 MP. Pearl-warded: 42% magical resist." };
  // ---- named legendaries (unique effects, dungeon/boss finds) ----
  ITEMS.dawnbreaker = { name: "Dawnbreaker", icon: "🌅", type: "equipment", slot: "weapon", wtype: "sword", mat: "holy", tierMult: 2.5, undeadMult: 4, dmgType: "blade", element: "holy", weaponRange: 1.8, weaponCd: 0.36, bonus: { atk: 150, maxHp: 225 }, price: 42000, legendary: true, smite: true, statusHit: { type: "blind", chance: 0.7, potency: 1.5 }, desc: "Legendary dawn-blade. +150 ATK, +225 HP. 4x vs undead and demons, sears the blind. (blade/holy)" };
  ITEMS.wyrmfang = { name: "Wyrmfang", icon: "🐍", type: "equipment", slot: "weapon", wtype: "dagger", mat: "dragonbone", tierMult: 3, undeadMult: 3, dmgType: "pierce", element: "fire", weaponRange: 1.4, weaponCd: 0.24, bonus: { atk: 255 }, price: 45000, legendary: true, statusHit: { type: "poison", chance: 0.8, pct: 0.04, potency: 1.4 }, statusHit2: { type: "burn", chance: 0.5, dps: 6, potency: 1.3 }, desc: "Legendary dragon-fang dagger. +255 ATK, venom + ember. Strikes blindingly fast." };
  ITEMS.stormcall = { name: "Stormcall", icon: "🌩️", type: "equipment", slot: "weapon", wtype: "hammer", mat: "mythril", tierMult: 2, undeadMult: 2.5, dmgType: "blunt", element: "electric", weaponRange: 1.8, weaponCd: 0.5, bonus: { atk: 143 }, price: 44000, legendary: true, statusHit: { type: "paralyze", chance: 0.6, potency: 1.4 }, desc: "Legendary storm-hammer. +143 ATK, calls paralyzing thunder. (blunt/electric)" };
  ITEMS.oathbow = { name: "Oathbow of Yggdrasil", icon: "🌈", type: "equipment", slot: "weapon", wtype: "bow", bow: true, range: 12, bowSpeed: 1.6, bowPower: 2.5, twin: true, bonus: { atk: 273 }, price: 48000, legendary: true, desc: "Legendary oath-bow. +273 ATK. Twin arrows per shot, 2.5x power. Needs arrows." };
  // ---- dawnstone hybrids + legend (heaven overworld-boss prizes only) ----
  ITEMS.dawnbrand = { name: "Dawnbrand", icon: "🌟", type: "equipment", slot: "weapon", wtype: "sword", mat: "dawnstone", tierMult: 4.5, undeadMult: 5, dmgType: "blade", element: "holy", weaponRange: 1.8, weaponCd: 0.38, bonus: { atk: 600 }, price: 58000, smite: true, statusHit: { type: "blind", chance: 0.6, potency: 1.5, procCd: 8 }, desc: "+600 ATK dawnstone holy blade. 5x vs undead and demons, blinds (60%, 8s cooldown). Smite enchant. Heaven-boss prize. (blade/holy)" };
  ITEMS.seraphsong_bow = { name: "Seraphsong Bow", icon: "🎶", type: "equipment", slot: "weapon", wtype: "bow", bow: true, range: 12, bowSpeed: 1.7, bowPower: 3.1, element: "holy", bonus: { atk: 138 }, price: 52000, statusHit: { type: "blind", chance: 0.5, potency: 1.3, procCd: 8 }, desc: "+138 ATK seraph bow. 3.1x power, blinds (50%, 8s cooldown). Heaven-boss prize. Ranged: DPS ≈ same-tier dagger. Needs arrows." };
  ITEMS.daybreak = { name: "Daybreak", icon: "🌅", type: "equipment", slot: "weapon", wtype: "sword", mat: "dawnstone", tierMult: 4.5, undeadMult: 6, dmgType: "blade", element: "holy", weaponRange: 1.8, weaponCd: 0.36, bonus: { atk: 705, maxHp: 450 }, price: 78000, legendary: true, smite: true, statusHit: { type: "blind", chance: 0.7, potency: 1.6 }, desc: "Legendary dawnstone greatblade. +705 ATK, +450 HP. 6x vs undead and demons, sears the blind. Heaven-boss prize. (blade/holy)" };
  const TOMES = Object.keys(ITEMS).filter(id => ITEMS[id].type === "spellbook");
  // stable self-ids: melee/bow procs key their internal cooldown by weapon id
  for (const _id in ITEMS) { try { ITEMS[_id].id = _id; } catch (e) { } }
  // Loot tiers: a new tier about every 20 levels. Tiers 0-2 drop in the
  // wild world (level-gated) and cap the overworld; tier 3 (mythril band)
  // surfaces ONLY from floor 5+ of surface delves, tier 4 (mythril band)
  // likewise, tier 5 (dragon band) ONLY from floor 11+ — never from shops,
  // overworld loot, bosses above those floors, or any other source.
  // Tier 6 (oblivion) is hell-only: deep hell delves and their warlords.
  // (Emerald foci live in tier 3, silver oddments in tier 2, the
  // yggdrasil bow in tier 5 — so each band gates with its own tier.)
  const EQUIP_BY_TIER = [
    ["rusted_sword", "rusted_dagger", "rusted_whip", "rusted_axe", "rusted_hammer", "rusted_spear", "wooden_sword", "cloth_robe", "leather_armor", "patched_kasaya", "novice_habit", "old_bow", "oak_bow", "apprentice_staff", "wand_quartz", "staff_quartz", "hunter_ring", "wooden_buckler"],
    ["iron_sword", "iron_dagger", "iron_whip", "iron_axe", "iron_hammer", "iron_spear", "leather_armor", "wayfarer_garb", "ironthread_kasaya", "canon_habit", "yew_bow", "fire_staff", "wand_ruby", "staff_ruby", "mage_robe", "coral_ring", "rime_ring", "iron_shield"],
    ["steel_sword", "steel_dagger", "steel_whip", "steel_axe", "steel_hammer", "steel_spear", "silver_sword", "silver_dagger", "silver_whip", "silver_spear", "silver_hammer", "steel_plate", "iron_armor", "ironthread_kasaya", "canon_habit", "archmage_robe", "wardens_bow", "wand_sapphire", "staff_sapphire", "obsidian_ring", "piezo_ring", "scholar_amulet", "lucky_charm", "mercy_ring", "cinderbrand", "steel_shield", "silver_shield"],
    ["mythril_sword", "mythril_dagger", "mythril_whip", "mythril_axe", "mythril_hammer", "mythril_spear", "wand_emerald", "staff_emerald", "mythril_plate", "shadowweave_garb", "sunsilk_kasaya", "vesper_habit", "frostwood_bow", "wand_holybead", "staff_holybead", "holy_vestments", "holy_ring", "frostfang_bow"],
    ["strength_ring", "mythril_sword", "mythril_axe", "mythril_spear", "mythril_whip", "mythril_plate", "shadowweave_garb", "sunsilk_kasaya", "vesper_habit", "frostwood_bow", "wand_holybead", "staff_holybead", "holy_vestments", "holy_ring", "mythril_shield"],
    ["dragonbone_sword", "dragonbone_dagger", "dragonbone_whip", "dragonbone_axe", "dragonbone_hammer", "dragonbone_spear", "dragonbone_plate", "dragonhide_kasaya", "seraph_habit", "wyrmshroud_robe", "wand_dragonhorn", "staff_dragonhorn", "yggdrasil_bow", "smite_blade", "dawnbreaker", "wyrmfang", "stormcall", "oathbow", "dragonbone_shield"],
    ["oblivion_sword", "oblivion_dagger", "oblivion_whip", "oblivion_axe", "oblivion_hammer", "oblivion_spear", "oblivion_plate", "eclipse_garb", "void_mantle", "oblivion_kasaya", "void_habit", "wand_oblivion", "staff_oblivion", "oblivion_bow", "oblivion_aegis", "arrow_oblivion"],
  ];
  const HYBRIDS = ["smite_blade", "frostfang_bow", "cinderbrand"];
  const HYBRID_EXTRA = ["ember_dagger", "venom_spear", "frost_axe", "tidebrand", "storm_hammer", "sanctified_maul", "rimebrand", "inferbrand", "tempest_spear", "frostwyrm_blade", "cinderwyrm_maul", "stormwyrm_halberd", "venomwyrm_fang", "dawnwyrm_blade", "sparkbow", "tidebow", "dragonscale_vest", "emberplate", "rimeplate", "tideward_robe"];
  for (const _h of HYBRID_EXTRA) HYBRIDS.push(_h);
  const LEGENDARIES = ["dawnbreaker", "wyrmfang", "stormcall", "oathbow", "daybreak"];
  // ---- dimension-exclusive bands ----
  // HELL_ONLY: oblivion finished goods (+ oblivion ammo) may exist ONLY in
  // the hell dimension (deep hell delves + warlord drops + hell forge).
  // Never shelved, never surfaced, never forged outside hell.
  const HELL_ONLY = ["oblivion_sword", "oblivion_dagger", "oblivion_whip", "oblivion_axe", "oblivion_hammer", "oblivion_spear", "oblivion_plate", "eclipse_garb", "void_mantle", "oblivion_kasaya", "void_habit", "wand_oblivion", "staff_oblivion", "oblivion_bow", "oblivion_aegis", "arrow_oblivion", "shuriken_oblivion"];
  // DAWNSTONE_ALL: dawnstone finished goods drop ONLY from heaven overworld
  // bosses (Divine Dragon, Celestial Messenger, Reservoir Leviathan, Seraph
  // Regent). Never shelved, never forged, never in chests or other drops.
  // Dawnstone shards (the mat) drop from the same bosses and forge into gear.
  const DAWNSTONE_ALL = ["dawnstone_sword", "dawnstone_dagger", "dawnstone_whip", "dawnstone_axe", "dawnstone_hammer", "dawnstone_spear", "dawnstone_plate", "dawnshroud_robe", "dawnsilk_kasaya", "dawnchoir_habit", "wand_dawnstone", "staff_dawnstone", "dawnstone_bow", "dawnstone_aegis", "arrow_dawnstone", "shuriken_dawnstone", "dawnbrand", "seraphsong_bow", "daybreak"];
  function isHellOnly(id) { try { return HELL_ONLY.includes(id); } catch (e) { return false; } }
  function isDawnstone(id) { try { return DAWNSTONE_ALL.includes(id) || id === "dawnstone_shard"; } catch (e) { return false; } }
  // Where does one finished item (or raw mat) come from? Single source of
  // truth for the codex where-to-find rows + guild fetch honesty.
  function lootHint(id) {
    try {
      if (!id) return "";
      if (isDawnstone(id)) {
        if (id === "dawnstone_shard") return "🌅 Heaven overworld bosses only (Divine Dragon, Celestial Messenger, Reservoir Leviathan, Seraph Regent) — raid the kill (E). Forge shards into dawnstone gear.";
        return "🌅 Heaven overworld bosses only (Divine Dragon, Celestial Messenger, Reservoir Leviathan, Seraph Regent) — or forged from dawnstone shards.";
      }
      if (isHellOnly(id)) return "🔥 Hell only — deep hell delves, hell warlords, hell forge.";
      if (isSurfGated(id)) {
        if (SURF_FLOOR11_GEAR.includes(id) || SURF_FLOOR11_MATS.includes(id)) return "⛏️ Surface delve floor 11+ only (chests, boss hoards, corpses) — never shops or overworld.";
        return "⛏️ Surface delve floor 5+ only (chests, boss hoards, corpses) — never shops or overworld.";
      }
      return "";
    } catch (e) { return ""; }
  }
  // ---- surface delve floor-gates (user spec): the mythril/emerald/
  // frostwood band surfaces ONLY from floor 5+ of a surface delve, the
  // dragonbone/yggdrasil/dragon-horn band ONLY from floor 11+ — and from
  // nowhere else in the surface world (not overworld chests/drops, not
  // bosses of any level, not shops, not chopping, not contracts). Hell
  // runs its own deep rules and is exempt from these gates.
  const SURF_FLOOR5_GEAR = [
    "mythril_sword", "mythril_dagger", "mythril_whip", "mythril_axe", "mythril_hammer", "mythril_spear",
    "frostwood_bow", "frostfang_bow", "wand_emerald", "staff_emerald",
    "mythril_plate", "mythril_shield", "rimebrand", "inferbrand", "tempest_spear", "rimeplate",
    "sunsilk_kasaya", "vesper_habit",
    "stormcall", "arrow_mythril", "shuriken_mythril",
  ];
  const SURF_FLOOR5_MATS = ["mythril_ore", "emerald_gem", "frostwood_log"];
  const SURF_FLOOR11_GEAR = [
    "dragonbone_sword", "dragonbone_dagger", "dragonbone_whip", "dragonbone_axe", "dragonbone_hammer", "dragonbone_spear",
    "dragonbone_plate", "dragonbone_shield", "wyrmshroud_robe", "wand_dragonhorn", "staff_dragonhorn", "yggdrasil_bow",
    "dragonhide_kasaya", "seraph_habit",
    "frostwyrm_blade", "cinderwyrm_maul", "stormwyrm_halberd", "venomwyrm_fang", "dawnwyrm_blade",
    "dragonscale_vest", "wyrmfang", "oathbow", "arrow_dragonbone", "shuriken_dragonbone",
  ];
  const SURF_FLOOR11_MATS = ["dragon_bone", "dragon_horn", "yggdrasil_branch"];
  const SURF_GATED_ALL = [...new Set([...SURF_FLOOR5_GEAR, ...SURF_FLOOR5_MATS, ...SURF_FLOOR11_GEAR, ...SURF_FLOOR11_MATS])];
  function isSurfGated(id) { try { return SURF_GATED_ALL.includes(id); } catch (e) { return false; } }
  // May the surface hero obtain floor-gated tiers right now? Hell delves
  // run their own deep rules (always allowed here — hell callers keep
  // their own depth checks); every other dimension must be a surface
  // delve at the gated floor or deeper. Overworld (and shallow floors)
  // get {mid:false, top:false}.
  function surfFloorGate(p) {
    try {
      try { if (window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()) return { mid: true, top: true }; } catch (e) { }
      const G = (window.Game && window.Game.G) || null;
      const pl = p || (G && G.player) || null;
      if (!pl || !pl.inDungeon) return { mid: false, top: false };
      let dim = null;
      try { dim = (G && G.dungeon && G.dungeon.dim) || null; } catch (e) { }
      if (!dim) { try { dim = (window.Game && window.Game.playerDim && window.Game.playerDim()) || "surf"; } catch (e) { dim = "surf"; } }
      if (dim && dim !== "surf") return { mid: false, top: false };
      let fl = 0;
      try { fl = ((pl && pl.dungeonLevel) | 0) || (((G && G.player && G.player.dungeonLevel) | 0)) || 1; } catch (e) { fl = 1; }
      return { mid: fl >= 5, top: fl >= 11 };
    } catch (e) { return { mid: false, top: false }; }
  }
  // Is one gated item id obtainable under this gate? (Ungated ids pass.)
  function surfGateAllows(id, gate) {
    try {
      if (!isSurfGated(id)) return true;
      const g = gate || { mid: false, top: false };
      if (SURF_FLOOR11_GEAR.includes(id) || SURF_FLOOR11_MATS.includes(id)) return !!g.top;
      return !!g.mid;
    } catch (e) { return false; }
  }
  const CRAFTS = [
    { id: "craft_brick", out: "brick", n: 2, cost: { clay: 2, wood: 1 }, name: "Fire Bricks (×2)", cat: "base" },
    { id: "craft_plank_bundle", out: "plank_bundle", n: 1, cost: { wood: 4 }, name: "Saw Plank Bundle", cat: "base" },
    { id: "craft_glass", out: "glass_pane", n: 1, cost: { stone: 4, wood: 1 }, name: "Blow Glass Pane", cat: "base" },
    { id: "craft_brick_wall", out: "brick_wall_kit", n: 1, cost: { brick: 4 }, name: "Raise Brick Wall Kit", cat: "base" },
    { id: "craft_door", out: "wooden_door_kit", n: 1, cost: { plank_bundle: 1, brick: 2 }, name: "Join Wooden Door Kit", cat: "base" },
    { id: "craft_window", out: "glass_window_kit", n: 1, cost: { glass_pane: 1, brick: 2 }, name: "Frame Glass Window Kit", cat: "base" },
    { id: "craft_home_portal", out: "home_portal_kit", n: 1, cost: { quartz_crystal: 12 }, name: "Attune Home Portal (12 quartz)", cat: "base" },
    { id: "craft_bed", out: "bed_kit", n: 1, cost: { wood: 6 }, name: "Build Bed Kit", cat: "base" },
    { id: "craft_shelf", out: "shelf_kit", n: 1, cost: { wood: 6 }, name: "Build Bookshelf Kit", cat: "base" },
    { id: "craft_table", out: "table_kit", n: 1, cost: { wood: 4 }, name: "Build Table Kit", cat: "base" },
    { id: "craft_chair", out: "chair_kit", n: 1, cost: { wood: 2 }, name: "Build Chair Kit", cat: "base" },
    { id: "craft_crate", out: "crate_kit", n: 1, cost: { wood: 3 }, name: "Build Crate Kit", cat: "base" },
    { id: "craft_barrel", out: "barrel_kit", n: 1, cost: { wood: 3 }, name: "Build Barrel Kit", cat: "base" },
    { id: "craft_hearth", out: "hearth_kit", n: 1, cost: { stone: 6, wood: 2 }, name: "Lay Hearth Kit", cat: "base" },
    { id: "craft_altar", out: "altar_kit", n: 1, cost: { stone: 8 }, name: "Raise Altar Kit", cat: "base" },
    { id: "craft_anvil", out: "anvil_kit", n: 1, cost: { iron_ore: 4, wood: 2 }, name: "Cast Anvil Kit", cat: "base" },
    { id: "craft_trough", out: "trough_kit", n: 1, cost: { wood: 4 }, name: "Build Trough Kit", cat: "base" },
    { id: "craft_potion", out: "potion", n: 1, cost: { herb: 3 }, name: "Brew Potion" },
    { id: "craft_mana", out: "mana_potion", n: 1, cost: { herb: 2, wood: 1 }, name: "Brew Mana Draught" },
    { id: "craft_bomb", out: "bomb", n: 1, cost: { wood: 3, stone: 2 }, name: "Assemble Bomb" },
    { id: "craft_torch", out: "torch", n: 2, cost: { wood: 1 }, name: "Whittle Torches (×2)" },
    { id: "craft_iron_arrows", out: "arrow_iron", n: 20, cost: { iron_ore: 1 }, name: "Fletch Iron Arrows (×20)" },
    { id: "craft_steel_arrows", out: "arrow_steel", n: 20, cost: { iron_ore: 2, wood: 1 }, name: "Fletch Steel Arrows (×20)" },
    { id: "craft_silver_arrows", out: "arrow_silver", n: 20, cost: { silver_ore: 2, wood: 1 }, name: "Fletch Silver Arrows (×20)" },
    { id: "craft_mythril_arrows", out: "arrow_mythril", n: 20, cost: { mythril_ore: 2, wood: 1 }, name: "Fletch Mythril Arrows (×20)" },
    { id: "craft_dragon_arrows", out: "arrow_dragonbone", n: 20, cost: { dragon_bone: 1, wood: 1 }, name: "Fletch Dragonbone Arrows (×20)" },
    { id: "craft_oblivion_arrows", out: "arrow_oblivion", n: 20, cost: { dragon_bone: 1, mythril_ore: 1, wood: 1 }, name: "Fletch Oblivion Arrows (×20)" },
    { id: "craft_dawnstone_arrows", out: "arrow_dawnstone", n: 20, cost: { dawnstone_shard: 1, wood: 1 }, name: "Fletch Dawnstone Arrows (×20)" },
    { id: "craft_smoke", out: "smoke_bomb", n: 3, cost: { wood: 2, herb: 2 }, name: "Mix Smoke Bombs (×3)" },
    { id: "craft_shuriken_iron", out: "shuriken_iron", n: 20, cost: { iron_ore: 1 }, name: "Cast Iron Shurikens (×20)" },
    { id: "craft_shuriken_steel", out: "shuriken_steel", n: 20, cost: { iron_ore: 3 }, name: "Cast Steel Shurikens (×20)" },
    { id: "craft_shuriken_silver", out: "shuriken_silver", n: 20, cost: { silver_ore: 2 }, name: "Cast Silver Shurikens (×20)" },
    { id: "craft_shuriken_mythril", out: "shuriken_mythril", n: 20, cost: { mythril_ore: 2 }, name: "Cast Mythril Shurikens (×20)" },
    { id: "craft_shuriken_dragon", out: "shuriken_dragonbone", n: 20, cost: { dragon_bone: 1 }, name: "Cast Dragonbone Shurikens (×20)" },
    { id: "craft_shuriken_oblivion", out: "shuriken_oblivion", n: 20, cost: { dragon_bone: 1, mythril_ore: 1 }, name: "Cast Oblivion Shurikens (×20)" },
    { id: "craft_shuriken_dawnstone", out: "shuriken_dawnstone", n: 20, cost: { dawnstone_shard: 1 }, name: "Cast Dawnstone Shurikens (×20)" },
    { id: "craft_antidote", out: "antidote", n: 1, cost: { sage_herb: 2 }, name: "Brew Antidote (cures poison)" },
    { id: "craft_salve", out: "burn_salve", n: 1, cost: { cinder_herb: 2 }, name: "Mix Burn Salve (cures burn)" },
    { id: "craft_warmbrew", out: "warm_brew", n: 1, cost: { cinder_herb: 1, herb: 1 }, name: "Brew Warm Draught (cures freeze)" },
    { id: "craft_tea", out: "focus_tea", n: 1, cost: { calm_herb: 2 }, name: "Steep Focus Tea (cures paralyze)" },
    { id: "craft_drops", out: "clear_drops", n: 1, cost: { bright_herb: 2 }, name: "Press Clear Drops (cures blindness)" },
    { id: "craft_panacea", out: "panacea_brew", n: 1, cost: { sage_herb: 1, cinder_herb: 1, calm_herb: 1, bright_herb: 1 }, name: "Brew Panacea (cures ALL + heal)" },
    { id: "craft_raft", out: "raft", n: 1, cost: { wood: 6 }, name: "Lash a Raft (sail water)" },
  ];
  // ================= forge recipes (raw materials -> finished gear) =================
  // Every craftable weapon/armor/focus is forged here from gathered mats:
  // chop trees (wood + frostwood/emberwood/yggdrasil by land), raid beasts and
  // dragons (hides, bones, horns), crack open chests and deep caches (ores,
  // gems), trade miners/smiths/scholars for the common stuff. Dragon bone and
  // horn drop ONLY from dragons and ancient bosses — never shops or chests.
  const FORGE_CRAFTS = [];
  const forge = (out, cost, name) => FORGE_CRAFTS.push({ id: "craft_" + out, out, n: 1, cost, name, cat: "forge" });
  // melee, all 5 shapes x all 6 tiers (rusty = scrap stone + wood)
  const MELEE_COST = {
    rusty: () => ({ stone: 2, wood: 1 }),
    iron: () => ({ iron_ore: 3, wood: 1 }),
    steel: () => ({ iron_ore: 5, wood: 2 }),
    silver: () => ({ silver_ore: 3, wood: 2 }),
    mythril: () => ({ mythril_ore: 4, wood: 1 }),
    dragonbone: (wt) => (wt === "dagger" ? { dragon_bone: 1, dragon_horn: 1 } : { dragon_bone: 2, dragon_horn: 1 }),
    oblivion: () => ({ dragon_bone: 2, dragon_horn: 1, mythril_ore: 2 }),
    dawnstone: (wt) => (wt === "dagger" ? { dawnstone_shard: 2, wood: 1 } : { dawnstone_shard: 3, wood: 1 }),
  };
  for (const m of WEAPON_MATS) {
    for (const wt of Object.keys(WTYPES)) {
      const id = (m.mat === "rusty" && wt === "sword") ? "rusted_sword"
        : (m.mat === "iron" && wt === "sword") ? "iron_sword"
        : (m.mat === "steel" && wt === "sword") ? "steel_sword"
        : `${MAT_ID[m.mat]}_${wt}`;
      if (!ITEMS[id]) continue;
      forge(id, MELEE_COST[m.mat](wt), `Forge ${ITEMS[id].name}`);
    }
  }
  // armor: cloth/leather/wayfarer/shadowweave, plate line, robe line
  forge("cloth_robe", { herb: 4 }, "Weave Cloth Robe");
  forge("leather_armor", { wolf_hide: 3 }, "Cure Leather Armor");
  forge("wayfarer_garb", { wolf_hide: 4, herb: 2 }, "Stitch Wayfarer Garb");
  forge("shadowweave_garb", { wolf_hide: 4, calm_herb: 2 }, "Stitch Shadowweave Garb");
  forge("iron_armor", { iron_ore: 4 }, "Forge Iron Armor");
  forge("steel_plate", { iron_ore: 6, wolf_hide: 2 }, "Forge Steel Plate");
  forge("mythril_plate", { mythril_ore: 4, wolf_hide: 2 }, "Forge Mythril Plate");
  forge("dragonbone_plate", { dragon_bone: 3, dragon_horn: 1, wolf_hide: 2 }, "Raise Dragonbone Plate");
  forge("eclipse_garb", { dragon_bone: 2, mythril_ore: 2, wolf_hide: 2 }, "Stitch Eclipse Garb");
  forge("oblivion_plate", { dragon_bone: 3, dragon_horn: 1, mythril_ore: 3 }, "Raise Oblivion Plate");
  forge("void_mantle", { dragon_bone: 2, unicorn_hair: 2, mythril_ore: 2 }, "Weave Void Mantle");
  forge("dawnstone_plate", { dawnstone_shard: 4, wolf_hide: 2 }, "Raise Dawnstone Plate");
  forge("dawnshroud_robe", { dawnstone_shard: 3, bright_herb: 2 }, "Weave Dawnshroud Robe");
  forge("wyrmshroud_robe", { dragon_bone: 2, dragon_horn: 1, bright_herb: 2 }, "Weave Wyrmshroud Robe");
  forge("mage_robe", { sage_herb: 2, bright_herb: 2 }, "Weave Mage Robe");
  // kasaya (striker wraps) + habitus (chanter tunics)
  forge("patched_kasaya", { herb: 4 }, "Stitch Patched Kasaya");
  forge("novice_habit", { herb: 4 }, "Sew Novice Habit");
  forge("ironthread_kasaya", { iron_ore: 3, wolf_hide: 1 }, "Stitch Ironthread Kasaya");
  forge("canon_habit", { sage_herb: 2, bright_herb: 2 }, "Sew Canon Habit");
  forge("sunsilk_kasaya", { mythril_ore: 3, bright_herb: 2 }, "Stitch Sunsilk Kasaya");
  forge("vesper_habit", { calm_herb: 2, bright_herb: 2, sapphire_gem: 1 }, "Sew Vesper Habit");
  forge("dragonhide_kasaya", { dragon_bone: 2, wolf_hide: 2 }, "Stitch Dragonhide Kasaya");
  forge("seraph_habit", { dragon_bone: 1, holy_bead: 2, bright_herb: 2 }, "Sew Seraph Habit");
  forge("oblivion_kasaya", { dragon_bone: 3, dragon_horn: 1, mythril_ore: 3 }, "Weave Oblivion Kasaya");
  forge("void_habit", { dragon_bone: 2, unicorn_hair: 2, mythril_ore: 2 }, "Sew Void Habit");
  forge("dawnsilk_kasaya", { dawnstone_shard: 4, bright_herb: 2 }, "Weave Dawnsilk Kasaya");
  forge("dawnchoir_habit", { dawnstone_shard: 3, holy_bead: 2 }, "Sew Dawnchoir Habit");
  // shields: plank, ingots and hide straps (dragonbone shields dragon-forged)
  forge("wooden_buckler", { wood: 4 }, "Shape Wooden Buckler");
  forge("iron_shield", { iron_ore: 3, wood: 1 }, "Forge Iron Shield");
  forge("steel_shield", { iron_ore: 5, wood: 1, wolf_hide: 1 }, "Forge Steel Shield");
  forge("silver_shield", { silver_ore: 3, wood: 1 }, "Forge Silver Shield");
  forge("mythril_shield", { mythril_ore: 4, wood: 1, wolf_hide: 1 }, "Forge Mythril Shield");
  forge("dragonbone_shield", { dragon_bone: 2, dragon_horn: 1 }, "Raise Dragonbone Shield");
  forge("oblivion_aegis", { dragon_bone: 2, dragon_horn: 1, mythril_ore: 2 }, "Raise Oblivion Aegis");  forge("archmage_robe", { calm_herb: 2, bright_herb: 2, ruby_gem: 1 }, "Weave Archmage Robe");
  forge("dawnstone_aegis", { dawnstone_shard: 4, wood: 1 }, "Raise Dawnstone Aegis");
  forge("holy_vestments", { sage_herb: 2, bright_herb: 2, holy_bead: 2 }, "Bless Holy Vestments");
  // bows: staves of wood, strings of hide, hearts of rare logs
  forge("old_bow", { wood: 3 }, "Shape Old Bow");
  forge("oak_bow", { wood: 4, wolf_hide: 1 }, "Shape Oak Bow");
  forge("yew_bow", { wood: 6, wolf_hide: 2, iron_ore: 1 }, "Shape Yew Bow");
  forge("frostwood_bow", { frostwood_log: 3, wolf_hide: 1, rime_crystal: 1 }, "Shape Frostwood Bow");
  forge("wardens_bow", { emberwood_log: 3, wolf_hide: 1, ember_core: 1 }, "Shape Warden's Bow");
  forge("yggdrasil_bow", { yggdrasil_branch: 3, unicorn_hair: 2 }, "String Yggdrasil Bow");
  forge("oblivion_bow", { dragon_bone: 2, unicorn_hair: 1, mythril_ore: 2 }, "String Oblivion Bow");
  forge("dawnstone_bow", { dawnstone_shard: 3, unicorn_hair: 1 }, "String Dawnstone Bow");
  // wands (cheap mana) / staves (power + MP): wood + a channel gem
  forge("wand_quartz", { wood: 2, stone: 2 }, "Carve Quartz Wand");
  forge("staff_quartz", { wood: 3, stone: 2 }, "Carve Quartz Staff");
  forge("wand_ruby", { wood: 2, ruby_gem: 1 }, "Carve Ruby Wand");
  forge("staff_ruby", { wood: 3, ruby_gem: 1 }, "Carve Ruby Staff");
  forge("wand_sapphire", { wood: 2, sapphire_gem: 1 }, "Carve Sapphire Wand");
  forge("staff_sapphire", { wood: 3, sapphire_gem: 1 }, "Carve Sapphire Staff");
  forge("wand_holybead", { wood: 2, holy_bead: 2 }, "Carve Holy Bead Wand");
  forge("staff_holybead", { wood: 3, holy_bead: 2 }, "Carve Holy Bead Staff");
  forge("wand_emerald", { wood: 2, emerald_gem: 1 }, "Carve Emerald Wand");
  forge("staff_emerald", { wood: 3, emerald_gem: 1 }, "Carve Emerald Staff");
  forge("wand_dragonhorn", { dragon_horn: 1, wood: 2 }, "Carve Dragon Horn Wand");
  forge("staff_dragonhorn", { dragon_horn: 1, dragon_bone: 1, wood: 2 }, "Carve Dragon Horn Staff");
  forge("wand_oblivion", { dragon_horn: 1, mythril_ore: 2, wood: 2 }, "Carve Oblivion Wand");
  forge("staff_oblivion", { dragon_horn: 1, dragon_bone: 1, mythril_ore: 2, wood: 2 }, "Carve Oblivion Staff");
  forge("wand_dawnstone", { dawnstone_shard: 2, wood: 2 }, "Carve Dawnstone Wand");
  forge("staff_dawnstone", { dawnstone_shard: 3, wood: 2 }, "Carve Dawnstone Staff");
  // ---- enchanted hybrids: base mats + an elemental heart ----
  const enchant = (out, cost, name) => FORGE_CRAFTS.push({ id: "craft_" + out, out, n: 1, cost, name, cat: "enchant" });
  enchant("ember_dagger", { iron_ore: 2, cinder_herb: 2, wood: 1 }, "Enchant Ember Dagger");
  enchant("venom_spear", { iron_ore: 2, sage_herb: 2, wood: 1 }, "Enchant Venom Spear");
  enchant("frost_axe", { iron_ore: 4, frostwood_log: 1, rime_crystal: 1 }, "Enchant Frost Axe");
  enchant("tidebrand", { iron_ore: 4, tide_pearl: 2, wood: 1 }, "Enchant Tidebrand Cutlass");
  enchant("storm_hammer", { iron_ore: 4, storm_feather: 2, wood: 1 }, "Enchant Storm Hammer");
  enchant("sanctified_maul", { silver_ore: 3, holy_bead: 2 }, "Bless Sanctified Maul");
  enchant("cinderbrand", { iron_ore: 5, ruby_gem: 1, wood: 2 }, "Enchant Cinderbrand");
  enchant("smite_blade", { silver_ore: 3, holy_bead: 2, wood: 1 }, "Bless Smite Blade");
  enchant("frostfang_bow", { frostwood_log: 3, wolf_hide: 1, sapphire_gem: 1 }, "Enchant Frostfang Bow");
  // the frost-enchanted mythril sword: mythril + frostwood + sapphire + rime
  enchant("rimebrand", { mythril_ore: 3, frostwood_log: 2, sapphire_gem: 1, rime_crystal: 1 }, "Enchant Rimebrand (frost mythril sword)");
  enchant("inferbrand", { mythril_ore: 3, ember_core: 1, ruby_gem: 1 }, "Enchant Inferbrand");
  enchant("tempest_spear", { mythril_ore: 3, storm_feather: 2, sapphire_gem: 1 }, "Enchant Tempest Spear");
  enchant("sparkbow", { wood: 4, wolf_hide: 2, storm_feather: 2 }, "Enchant Sparkbow");
  enchant("tidebow", { wood: 4, wolf_hide: 2, tide_pearl: 2 }, "Enchant Tidebow");
  enchant("emberplate", { iron_ore: 6, ember_core: 1, ruby_gem: 1 }, "Enchant Emberplate");
  enchant("rimeplate", { mythril_ore: 4, rime_crystal: 1, sapphire_gem: 1 }, "Enchant Rimeplate");
  enchant("tideward_robe", { calm_herb: 2, bright_herb: 2, tide_pearl: 2 }, "Enchant Tideward Robe");
  enchant("dragonscale_vest", { dragon_bone: 2, wolf_hide: 2 }, "Raise Dragonscale Vest");
  enchant("frostwyrm_blade", { dragon_bone: 2, dragon_horn: 1, rime_crystal: 1, sapphire_gem: 1 }, "Enchant Frostwyrm Blade");
  enchant("cinderwyrm_maul", { dragon_bone: 2, dragon_horn: 1, ember_core: 1, ruby_gem: 1 }, "Enchant Cinderwyrm Maul");
  enchant("stormwyrm_halberd", { dragon_bone: 2, dragon_horn: 1, storm_feather: 2 }, "Enchant Stormwyrm Halberd");
  enchant("venomwyrm_fang", { dragon_bone: 1, dragon_horn: 1, tide_pearl: 2 }, "Enchant Venomwyrm Fang");
  enchant("dawnwyrm_blade", { dragon_bone: 2, dragon_horn: 1, holy_bead: 2 }, "Bless Dawnwyrm Blade");
  enchant("dawnbrand", { dawnstone_shard: 3, holy_bead: 2, wood: 1 }, "Bless Dawnbrand");
  enchant("seraphsong_bow", { dawnstone_shard: 3, unicorn_hair: 1, holy_bead: 1 }, "Enchant Seraphsong Bow");
  enchant("daybreak", { dawnstone_shard: 5, holy_bead: 2, unicorn_hair: 1 }, "Bless Daybreak");
  for (const _f of FORGE_CRAFTS) CRAFTS.push(_f);

  // ---- per-copy gear identity (v235): upgraded/renamed pieces split off ----
  // A stack is {id, n, up?, nick?}: up = workbench levels 0-5, nick = custom
  // name (max 24 chars). Stacks merge ONLY on exact (id,up,nick), so a +19
  // iron sword, a plain one and "My Blade" are three separate entries.
  function clampUp(u) { u = (u | 0) || 0; return u < 0 ? 0 : u > GEAR_UP_MAX ? GEAR_UP_MAX : u; }
  function normNick(s) {
    try {
      s = String(s == null ? "" : s).trim().replace(/\s+/g, " ");
      if (s.length > 24) s = s.slice(0, 24).trim();
      return s;
    } catch (e) { return ""; }
  }
  function stackUp(s) { try { return clampUp(s && s.up); } catch (e) { return 0; } }
  function stackNick(s) { try { return normNick(s && s.nick); } catch (e) { return ""; } }
  // unique key for one inventory ROW (id + copy identity)
  function stackKey(s) { try { return (s.id || "") + "|" + stackUp(s) + "|" + stackNick(s); } catch (e) { return String((s && s.id) || ""); } }
  function sameVariant(a, b) {
    try {
      const aid = (a && a.id) || (typeof a === "string" ? a : "");
      const bid = (b && b.id) || (typeof b === "string" ? b : "");
      if (aid !== bid) return false;
      return stackUp(a) === stackUp(b) && stackNick(a) === stackNick(b);
    } catch (e) { return false; }
  }
  // display name of one copy: custom name wins, base name otherwise
  function variantName(s) {
    try {
      const id = (s && s.id) || (typeof s === "string" ? s : "");
      const nick = stackNick(s);
      if (nick) return nick;
      const it = id && ITEMS[id];
      return (it && it.name) || id;
    } catch (e) { return String((s && s.id) || s || ""); }
  }
  // find a stack of this item, preferring an exact variant match (n>0).
  // An identity ask (up and/or name given) that matches nothing returns
  // null — it never substitutes a different copy. A bare ask (no up, no
  // name: legacy binds, generic consumption) takes plain copies first, then
  // the least-worked ones, so generic use never eats a named blade.
  function findStack(p, id, variant) {
    try {
      const inv = (p && p.inventory) || [];
      if (variant && (stackUp(variant) > 0 || stackNick(variant))) {
        return inv.find(s => s.id === id && s.n > 0 && stackUp(s) === stackUp(variant) && stackNick(s) === stackNick(variant)) || null;
      }
      const cands = inv.filter(s => s.id === id && (s.n | 0) > 0);
      cands.sort((a, b) => (stackNick(a) ? 1 : 0) - (stackNick(b) ? 1 : 0) || stackUp(a) - stackUp(b));
      return cands[0] || null;
    } catch (e) { return null; }
  }
  // hotbar binds that name an exact copy follow it through bench work:
  // after an upgrade/rename/enchant, rewrite matching binds to the new
  // identity. Legacy id-only binds never rewrite — they follow the worn.
  function relinkBinds(p, fromId, fromV, toId, toV) {
    try {
      if (!Array.isArray(p.hotbar)) return;
      const fu = clampUp(fromV && fromV.up), fn = normNick(fromV && fromV.nick);
      const tu = clampUp(toV && toV.up), tn = normNick(toV && toV.nick);
      for (let i = 0; i < p.hotbar.length; i++) {
        const s = p.hotbar[i];
        if (!s || s.kind !== "item" || s.id !== fromId) continue;
        if (!(s.up > 0) && !s.nick) continue;
        if (clampUp(s.up) !== fu || normNick(s.nick) !== fn) continue;
        s.id = toId;
        if (tu > 0) s.up = tu; else try { delete s.up; } catch (e) { s.up = 0; }
        if (tn) s.nick = tn; else try { delete s.nick; } catch (e) { s.nick = ""; }
      }
    } catch (e) { }
  }
  function noStackLeft(p, id, v) {
    try {
      return !(p.inventory || []).some(s => s.id === id && (s.n | 0) > 0 && stackUp(s) === clampUp(v && v.up) && stackNick(s) === normNick(v && v.nick));
    } catch (e) { return false; }
  }
  function countItem(p, id) {
    let n = 0;
    for (const s of (p.inventory || [])) if (s.id === id) n += (s.n | 0) || 1;
    return n;
  }
  function countVariant(p, id, variant) {
    let n = 0;
    // an inventory STACK (has n) or an explicit {up,nick} filters exactly;
    // a bare id-like ({kind,id} hotbar bind) counts every copy, as before
    const exact = !!(variant && typeof variant === "object" && (variant.up != null || variant.nick != null || variant.n != null));
    for (const s of (p.inventory || [])) {
      if (s.id !== id) continue;
      if (exact) {
        if (stackUp(s) === clampUp(variant.up) && stackNick(s) === normNick(variant.nick)) n += (s.n | 0) || 1;
      } else n += (s.n | 0) || 1;
    }
    return n;
  }
  function addItem(p, id, n = 1, opts) {
    if (!ITEMS[id]) return false;
    p.inventory = p.inventory || [];
    const up = clampUp(opts && opts.up);
    const nick = normNick(opts && opts.nick);
    const stack = p.inventory.find(s => s.id === id && stackUp(s) === up && stackNick(s) === nick);
    if (stack) stack.n = (stack.n | 0) + n;
    else p.inventory.push(n > 1 || up > 0 || nick ? { id, n, ...(up > 0 ? { up } : {}), ...(nick ? { nick } : {}) } : { id, n });
    return true;
  }
  function removeItem(p, id, n = 1, variant) {
    if (countItem(p, id) < n) return false;
    let left = n;
    // exact variant first (when specified), then plain-first / least-worked
    const ordered = [...p.inventory].sort((a, b) => {
      const ae = variant ? (a.id === id && stackUp(a) === stackUp(variant) && stackNick(a) === stackNick(variant) ? 0 : 1) : 0;
      const be = variant ? (b.id === id && stackUp(b) === stackUp(variant) && stackNick(b) === stackNick(variant) ? 0 : 1) : 0;
      if (ae !== be) return ae - be;
      if (a.id !== id || b.id !== id) return 0;
      return ((stackNick(a) ? 1 : 0) - (stackNick(b) ? 1 : 0)) || (stackUp(a) - stackUp(b));
    });
    for (const s of ordered) {
      if (left <= 0) break;
      if (s.id !== id || (s.n | 0) <= 0) continue;
      const real = p.inventory.includes(s) ? s : p.inventory.find(q => q === s);
      if (!real) continue;
      const take = Math.min(real.n | 0, left);
      real.n -= take; left -= take;
      if (real.n <= 0) p.inventory.splice(p.inventory.indexOf(real), 1);
    }
    return left <= 0;
  }
  // ---- single-active utilities: only one boat sails at a time ----
  // utilityClass maps an item id to its exclusivity class (boats share "boat").
  // Launching a utility auto-disables whatever of the same class is active.
  const UTILITY_CLASS = { raft: "boat" };
  function utilityClass(id) { return UTILITY_CLASS[id] || null; }
  // Drop unwanted goods: unequips first, clears emptied hotbar bindings.
  // Dropped goods are gone (no ground piles) — the toast says so plainly.
  function dropItem(p, id, n, variant) {
    const it = ITEMS[id];
    if (!it) return { ok: false, msg: "Unknown item." };
    n = Math.max(1, Math.min(n | 0 || 1, countItem(p, id)));
    if (countItem(p, id) < 1) return { ok: false, msg: "None to drop." };
    const wornV = wornVariantOf(p, it.slot);
    try {
      if (p.equipment && p.equipment[it.slot] === id && (!wornV || sameVariant({ id, up: wornV.up, nick: wornV.nick }, variant || wornV))) {
        p.equipment[it.slot] = null;
        if (p.equipmentUp) p.equipmentUp[it.slot] = 0;
        if (p.equipmentNick) p.equipmentNick[it.slot] = "";
      }
    } catch (e) { }
    if (!removeItem(p, id, n, variant)) return { ok: false, msg: "Hmm, that slipped away." };
    const dn = variantName(variant && variant.id ? { id, up: variant.up, nick: variant.nick } : { id });
    try {
      if (countItem(p, id) < 1 && Array.isArray(p.hotbar)) {
        p.hotbar.forEach((s, i) => { if (s && s.kind === "item" && s.id === id && (!variant || hotbarBindMatches(s, variant))) p.hotbar[i] = null; });
      }
    } catch (e) { }
    try { if (p && p.kind === "player") syncPlayerAttackWeapon(p); } catch (e) {}
    return { ok: true, msg: "Dropped " + n + "x " + dn + " (gone for good)." };
  }
  function bindable(id) {
    const it = ITEMS[id];
    if (!it) return false;
    if (it.type === "placeable") return true;
    if (it.type === "ammo") return true;
    return it.type === "consumable" || it.type === "equipment" || it.type === "spellbook" || (it.usable && it.type === "material");
  }
  function learnSpell(p, abId) {
    window.Entities.ensureProgression(p);
    if (!window.CFG.ABILITIES[abId]) return { ok: false, msg: "No such spell." };
    if (p.abilities.includes(abId)) return { ok: false, msg: `${window.CFG.ABILITIES[abId].name} already known.` };
    p.abilities.push(abId);
    if (!p.unlocked.includes(abId)) p.unlocked.push(abId);
    // auto-bind to the first free hotbar slot — never the player's Attack or
    // Off-hand slot. Both may be deliberately empty (bare fists / bare-handed
    // parry), and a fresh spell landing there would arm them against their
    // will. When only those are free the spell stays unbound for manual bind.
    const hb = p.hotbar || [];
    let bound = hb.some(s => s && s.kind === "ability" && s.id === abId);
    if (!bound) {
      const i = firstFreeHotbarSlot(p);
      if (i >= 0) { hb[i] = { kind: "ability", id: abId }; bound = true; }
    }
    try { window.Entities.recalcDerived(p, true); } catch (e) { }
    try { if (p && p.kind !== "npc" && window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("learn:" + abId); } catch (e) { }
    return { ok: true, msg: bound ? `📖 Learned ${window.CFG.ABILITIES[abId].name}! Bound to hotbar.` : `📖 Learned ${window.CFG.ABILITIES[abId].name}! (no free slot — bind it in 🎒 Inventory)` };
  }
  function readTome(p, tomeId) {
    const it = ITEMS[tomeId];
    if (!it || it.type !== "spellbook") return { ok: false, msg: "Not a spellbook." };
    if (p.abilities.includes(it.teaches)) return { ok: false, msg: "Already known." };
    if (!removeItem(p, tomeId, 1)) return { ok: false, msg: "No tome." };
    const r = learnSpell(p, it.teaches);
    // swap any hotbar slots pointing at the consumed tome to the learned spell
    if (r.ok && p.hotbar) {
      p.hotbar.forEach((s, i) => {
        if (s && s.kind === "item" && s.id === tomeId) p.hotbar[i] = { kind: "ability", id: it.teaches };
      });
    }
    return r;
  }
  // ---- worn-copy tracking (v235): equipment holds the id; equipmentUp/Nick
  // say WHICH copy (workbench levels + custom name). Mobs/sprites/MP/quests
  // keep reading the plain id; bonuses read the slot helpers below.
  function wornVariantOf(p, slot) {
    try {
      return {
        up: clampUp(p && p.equipmentUp && p.equipmentUp[slot]),
        nick: normNick(p && p.equipmentNick && p.equipmentNick[slot]),
      };
    } catch (e) { return { up: 0, nick: "" }; }
  }
  function setWornVariant(p, slot, variant) {
    try {
      p.equipmentUp = (p.equipmentUp && typeof p.equipmentUp === "object") ? p.equipmentUp : {};
      p.equipmentNick = (p.equipmentNick && typeof p.equipmentNick === "object") ? p.equipmentNick : {};
      p.equipmentUp[slot] = clampUp(variant && variant.up);
      p.equipmentNick[slot] = normNick(variant && variant.nick);
    } catch (e) { }
  }
  function hotbarBindMatches(s, variant) {
    try {
      if (!s || s.kind !== "item" || !variant || !variant.id) return true;
      if (s.id !== variant.id) return false;
      // old binds carry no copy info: they match whatever copy is worn
      if (!(s.up > 0) && !s.nick && !(variant.up > 0) && !variant.nick) return true;
      return clampUp(s.up) === clampUp(variant.up) && normNick(s.nick) === normNick(variant.nick);
    } catch (e) { return true; }
  }
  function equip(p, itemId, variant) {
    const it = ITEMS[itemId];
    if (!it || it.type !== "equipment") return { ok: false, msg: "Not equipment." };
    const stack = findStack(p, itemId, variant);
    if (!stack) return { ok: false, msg: "Not in inventory." };
    window.Entities.ensureProgression(p);
    const slot = it.slot;
    const cur = p.equipment[slot];
    const wv = wornVariantOf(p, slot);
    if (cur === itemId && wv.up === stackUp(stack) && wv.nick === stackNick(stack)) return { ok: false, msg: "Already equipped." };
    p.equipment[slot] = itemId;
    setWornVariant(p, slot, stack);
    try { window.Entities.recalcDerived(p, true); } catch (e) { }
    try { if (p && p.kind !== "npc" && window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("equip:" + slot); } catch (e) { }
    return { ok: true, msg: `Equipped ${variantName(stack)}.` };
  }
  function unequip(p, slot) {
    window.Entities.ensureProgression(p);
    if (!p.equipment[slot]) return { ok: false, msg: "Nothing equipped." };
    const id = p.equipment[slot];
    const it = ITEMS[id];
    const wv = wornVariantOf(p, slot);
    p.equipment[slot] = null;
    setWornVariant(p, slot, null);
    // pulling it off strips its hotbar bindings too — the key goes quiet.
    // Only the worn COPY's bindings clear; other copies stay bound.
    try {
      if (Array.isArray(p.hotbar)) p.hotbar.forEach((s, i) => {
        if (s && s.kind === "item" && s.id === id && hotbarBindMatches(s, { id, up: wv.up, nick: wv.nick })) p.hotbar[i] = null;
      });
    } catch (e) { }
    try { window.Entities.recalcDerived(p, true); } catch (e) { }
    try { if (p && p.kind !== "npc" && window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("unequip:" + slot); } catch (e) { }
    return { ok: true, msg: `Unequipped ${it ? variantName({ id, up: wv.up, nick: wv.nick }) : slot}.` };
  }
  function isEquipped(p, itemId, variant) {
    if (!p.equipment) return false;
    const worn = p.equipment.weapon === itemId || p.equipment.armor === itemId || p.equipment.trinket === itemId || p.equipment.shield === itemId;
    // a bare id-like (hotbar bind without copy info) matches whatever copy
    // is worn; a stack or explicit {up,nick} must BE the worn copy
    const exact = !!(variant && typeof variant === "object" && (variant.up != null || variant.nick != null || variant.n != null));
    if (!worn || !exact) return worn;
    try {
      const vu = clampUp(variant.up), vn = normNick(variant.nick);
      for (const slot of ["weapon", "armor", "trinket", "shield"]) {
        if (p.equipment[slot] !== itemId) continue;
        const wv = wornVariantOf(p, slot);
        if (wv.up === vu && wv.nick === vn) return true;
      }
      return false;
    } catch (e) { return worn; }
  }
  // ---- gear upgrades: +50% of base flat stats per level, 5 levels max ----
  // Work is per COPY (v235): each stack carries its own `up` (0-5) and
  // optional `nick`. Upgrading/renaming one copy of a x5 stack splits it
  // off into its own entry. Only the flat `bonus` numbers grow — never
  // resists, procs, multipliers or power/speed lines.
  const GEAR_UP_MAX = 5, GEAR_UP_STEP = 0.50, GEAR_UP_PCT = GEAR_UP_STEP * 100;
  const GEAR_UP_COST_MULT = [0.5, 1, 2, 4, 8]; // to go 0->1, 1->2, ... 4->5
  const GEAR_UP_STAT_KEYS = ["atk", "matk", "def", "sdef", "maxHp", "maxMp", "maxStamina", "spd"];
  // legacy compat: highest level among your copies (old saves migrate their
  // p.gearUp onto every copy in ensureProgression, so this stays truthful)
  function gearUpLevel(p, id) {
    try {
      let best = (p && p.gearUp && p.gearUp[id]) | 0 || 0;
      for (const s of ((p && p.inventory) || [])) if (s.id === id) best = Math.max(best, stackUp(s));
      if (p && p.equipment) for (const slot of ["weapon", "armor", "trinket", "shield"]) {
        if (p.equipment[slot] === id) best = Math.max(best, clampUp(p.equipmentUp && p.equipmentUp[slot]));
      }
      return Math.max(0, Math.min(GEAR_UP_MAX, best));
    } catch (e) { return 0; }
  }
  function gearUpMult(p, id) { return 1 + gearUpLevel(p, id) * GEAR_UP_STEP; }
  // per-copy + per-worn-slot authorities (the live ones)
  function gearStackMult(stack) { return 1 + stackUp(stack) * GEAR_UP_STEP; }
  function gearSlotLevel(p, slot) {
    try {
      let lvl = clampUp(p && p.equipmentUp && p.equipmentUp[slot]);
      if (!(lvl > 0) && p && p.equipment && p.equipment[slot] && p.gearUp) lvl = clampUp(p.gearUp[p.equipment[slot]]);
      return lvl;
    } catch (e) { return 0; }
  }
  function gearSlotMult(p, slot) { return 1 + gearSlotLevel(p, slot) * GEAR_UP_STEP; }
  // Which venue upgrades this gear? forge (smith): melee weapons, bows,
  // mundane armor + shields. arcane: robes, staves, wands. holy (altars):
  // habitus. dojo: kasaya. Anything else (trinkets, quest goods) has no
  // venue and cannot be upgraded.
  function gearUpgradeVenue(id) {
    try {
      const it = id && ITEMS[id];
      if (!it || it.type !== "equipment" || !it.bonus) return null;
      if (it.slot === "weapon") {
        if (it.bow) return "forge";
        if (it.wtype === "staff" || it.wtype === "wand" || it.staff || it.wand) return "arcane";
        return "forge";
      }
      if (it.slot === "armor") {
        const cls = armorClassFor(id);
        if (cls === "kasaya") return "dojo";
        if (cls === "habitus") return "holy";
        if (cls === "robe") return "arcane";
        return "forge";
      }
      if (it.slot === "shield") return "forge";
      return null;
    } catch (e) { return null; }
  }
  // Flat stats this item actually grants (upgradeable ones only).
  function gearUpgradeStats(id) {
    try {
      const it = id && ITEMS[id];
      if (!it || !it.bonus) return [];
      return GEAR_UP_STAT_KEYS.filter(k => (it.bonus[k] | 0) !== 0 || it.bonus[k]);
    } catch (e) { return []; }
  }
  function gearBasePrice(id) {
    try {
      const it = id && ITEMS[id];
      if (it && typeof it.price === "number") return it.price;
      if (window.Trade && window.Trade.basePrice) return window.Trade.basePrice(id);
    } catch (e) { }
    return 10;
  }
  function gearUpgradeCostFor(id, lvl) {
    lvl = clampUp(lvl);
    if (lvl >= GEAR_UP_MAX) return { lvl, maxed: true, cost: 0 };
    return { lvl, maxed: false, cost: Math.max(1, Math.round(gearBasePrice(id) * GEAR_UP_COST_MULT[lvl])) };
  }
  function gearUpgradeCost(id) {
    try {
      const p = (window.Game && window.Game.G && window.Game.G.player) || null;
      return gearUpgradeCostFor(id, gearUpLevel(p, id));
    } catch (e) { return { lvl: 0, maxed: false, cost: 1 }; }
  }
  // Upgrade ONE copy: a x5 stack splits (1 worked copy + 4 plain). The worn
  // pointer follows the copy it was pointing at.
  function doGearUpgrade(id, variant) {
    try {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!p) return { ok: false, msg: "No hero." };
      const it = id && ITEMS[id];
      if (!it || it.type !== "equipment") return { ok: false, msg: "Not gear." };
      if (!gearUpgradeVenue(id)) return { ok: false, msg: `${it.name} cannot be upgraded anywhere.` };
      if (!gearUpgradeStats(id).length) return { ok: false, msg: `${it.name} grants no flat stats to boost.` };
      const stack = findStack(p, id, variant);
      if (!stack) return { ok: false, msg: `No ${it.name} in your pack.` };
      const lvl = stackUp(stack);
      const nick = stackNick(stack);
      const info = gearUpgradeCostFor(id, lvl);
      if (info.maxed) return { ok: false, msg: `${variantName(stack)} is already +${GEAR_UP_MAX * 10}% (max).` };
      if ((p.gold | 0) < info.cost) return { ok: false, msg: `Need ${info.cost}g (have ${p.gold | 0}g).` };
      p.gold -= info.cost;
      try { window.Entities.ensureProgression(p); } catch (e) { }
      if ((stack.n | 0) > 1) {
        stack.n -= 1;
        addItem(p, id, 1, { up: lvl + 1, nick });
      } else {
        if (lvl + 1 > 0) stack.up = lvl + 1; else try { delete stack.up; } catch (e) { }
      }
      let wornFollowed = false;
      try {
        for (const slot of ["weapon", "armor", "trinket", "shield"]) {
          if (p.equipment && p.equipment[slot] === id) {
            const wv = wornVariantOf(p, slot);
            if (wv.up === lvl && wv.nick === nick) { setWornVariant(p, slot, { up: lvl + 1, nick }); wornFollowed = true; }
          }
        }
        // binds naming the old copy follow it — the worn pointer moved, or
        // the old identity is gone entirely (nothing left to point at)
        if (wornFollowed || noStackLeft(p, id, { up: lvl, nick })) relinkBinds(p, id, { up: lvl, nick }, id, { up: lvl + 1, nick });
      } catch (e) { }
      try { window.Entities.recalcDerived(p, true); } catch (e) { }
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) { }
      try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) { }
      try { if (window.UI && window.UI.updateHotbar) window.UI.updateHotbar(); } catch (e) { }
      const pct = (lvl + 1) * 10;
      return { ok: true, msg: `⬆️ ${variantName(stack)} +${pct}% — flat stats boosted (${lvl + 1}/${GEAR_UP_MAX}).` };
    } catch (e) { return { ok: false, msg: "The workbench falters." }; }
  }
  // Rename ONE copy at its own bench (free): a x5 stack splits off the named
  // blade. Empty name clears the custom name (merges back with plain kin).
  function renameGear(id, variant, newName) {
    try {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!p) return { ok: false, msg: "No hero." };
      const it = id && ITEMS[id];
      if (!it || it.type !== "equipment") return { ok: false, msg: "Not gear." };
      if (!gearUpgradeVenue(id)) return { ok: false, msg: `${it.name} has no workbench — only bench gear can be named.` };
      const stack = findStack(p, id, variant);
      if (!stack) return { ok: false, msg: `No ${it.name} in your pack.` };
      const up = stackUp(stack), nick = stackNick(stack);
      const clean = normNick(newName);
      if (!clean) {
        if (!nick) return { ok: false, msg: "Type a name for it first." };
        if ((stack.n | 0) > 1) { stack.n -= 1; addItem(p, id, 1, { up }); }
        else { try { delete stack.nick; } catch (e) { stack.nick = ""; } }
        let wornFollowed = false;
        try {
          for (const slot of ["weapon", "armor", "trinket", "shield"]) {
            if (p.equipment && p.equipment[slot] === id) {
              const wv = wornVariantOf(p, slot);
              if (wv.up === up && wv.nick === nick) { setWornVariant(p, slot, { up, nick: "" }); wornFollowed = true; }
            }
          }
          if (wornFollowed || noStackLeft(p, id, { up, nick })) relinkBinds(p, id, { up, nick }, id, { up, nick: "" });
        } catch (e) { }
        try { window.Entities.recalcDerived(p, true); } catch (e) { }
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) { }
        try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) { }
        try { if (window.UI && window.UI.updateHotbar) window.UI.updateHotbar(); } catch (e) { }
        return { ok: true, msg: `The name is struck off — plain ${it.name} once more.` };
      }
      if (clean === nick) return { ok: false, msg: `Already called "${clean}".` };
      if ((stack.n | 0) > 1) {
        stack.n -= 1;
        addItem(p, id, 1, { up, nick: clean });
      } else {
        stack.up = up > 0 ? up : undefined;
        try { if (!(up > 0)) delete stack.up; } catch (e) { }
        stack.nick = clean;
        // merge: an identical named copy may already exist
        try {
          const dup = (p.inventory || []).find(s => s !== stack && s.id === id && (s.n | 0) > 0 && stackUp(s) === up && stackNick(s) === clean);
          if (dup) { dup.n += (stack.n | 0) || 1; p.inventory.splice(p.inventory.indexOf(stack), 1); }
        } catch (e) { }
      }
      try {
        let wornFollowed = false;
        for (const slot of ["weapon", "armor", "trinket", "shield"]) {
          if (p.equipment && p.equipment[slot] === id) {
            const wv = wornVariantOf(p, slot);
            if (wv.up === up && wv.nick === nick) { setWornVariant(p, slot, { up, nick: clean }); wornFollowed = true; }
          }
        }
        if (wornFollowed || noStackLeft(p, id, { up, nick })) relinkBinds(p, id, { up, nick }, id, { up, nick: clean });
      } catch (e) { }
      try { window.Entities.recalcDerived(p, true); } catch (e) { }
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) { }
      try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) { }
      try { if (window.UI && window.UI.updateHotbar) window.UI.updateHotbar(); } catch (e) { }
      return { ok: true, msg: `✏️ "${clean}" — the bench dubs it so.` };
    } catch (e) { return { ok: false, msg: "The naming fails." }; }
  }
  // ---- off-hand slot authority (player only) ----
  // Mirrors the default-weapon slot: p.offhandSlot is a hotbar index the
  // player picks in 🎒 Inventory. Q uses whatever sits there — spells and
  // throwables fire as normal, but a weapon, a shield, or an empty slot
  // parries instead of attacking. Default: slot 4 (index 3, empty for new
  // heroes, so Q parries with bare fists out of the gate). -1 = "No slot":
  // the player chose unarmed, so Q always parries bare-fisted.
  function getOffhandSlot(p) {
    try {
      if (!p || !Array.isArray(p.hotbar) || !p.hotbar.length) return 3;
      if (p.offhandSlot == null) return 3;
      if (Number(p.offhandSlot) === -1) return -1;
      let d = p.offhandSlot | 0;
      if (!(d >= 0) || d >= p.hotbar.length) d = 3;
      return d;
    } catch (e) { return 3; }
  }
  function setOffhandSlot(p, i) {
    try {
      if (!p || p.kind !== "player" || !Array.isArray(p.hotbar) || !p.hotbar.length) return 3;
      if (i === -1 || i === "none") { p.offhandSlot = -1; return -1; }
      let d = (i | 0);
      if (!(d >= 0) || d >= p.hotbar.length) d = 3;
      p.offhandSlot = d;
      return d;
    } catch (e) { return 3; }
  }
  function isShieldItem(id) {
    try { const it = typeof id === "string" ? ITEMS[id] : id; return !!(it && it.type === "equipment" && (it.slot === "shield" || it.shield)); } catch (e) { return false; }
  }
  // First hotbar slot free for auto-binds (spell tomes, deed techniques,
  // Eject backfill): never the player's Attack (default weapon) or Off-hand
  // slot. Both may be deliberately empty — bare fists on the attack button,
  // bare-handed parry on Q — and a fresh bind landing there would arm the
  // player against their will. Returns -1 when only those are free (or the
  // bar is full), so the caller learns the art unbound for manual binding.
  function firstFreeHotbarSlot(p) {
    try {
      const hb = p && p.hotbar;
      if (!Array.isArray(hb) || !hb.length) return -1;
      let def = -1, off = -1;
      if (p && p.kind === "player") {
        try { def = getDefaultWeaponSlot(p); } catch (e) { }
        try { off = getOffhandSlot(p); } catch (e) { }
      }
      for (let i = 0; i < hb.length; i++) {
        if (hb[i]) continue;
        if (i === def || i === off) continue;
        return i;
      }
      return -1;
    } catch (e) { return -1; }
  }
  // Thrown-star tiers, best first — techniques hurl the finest star in the pack.
  // Thrown-star tiers, best first — techniques hurl the finest star in the pack.
  const SHURIKEN_ORDER = ["shuriken_dawnstone", "shuriken_oblivion", "shuriken_dragonbone", "shuriken_mythril", "shuriken_silver", "shuriken_steel", "shuriken_iron"];
  function bestShuriken(p) {
    try {
      for (const id of SHURIKEN_ORDER) if (countItem(p, id) > 0) return id;
    } catch (e) { }
    return null;
  }
  // Use an item from inventory (hotbar or inventory click). Returns {ok, msg}.
  function useItem(p, itemId, variant) {
    const it = ITEMS[itemId];
    if (!it) return { ok: false, msg: "Unknown item." };
    // quest-tagged goods are delivered, never opened/spent
    if (it.quest || it.type === "quest") return { ok: false, msg: `Sealed — its tag names the quest. Deliver it, don't open it.` };
    if (it.type === "equipment") {
      if (isEquipped(p, itemId, variant)) return unequip(p, it.slot);
      return equip(p, itemId, variant);
    }
    if (it.type === "spellbook") {
      const r = readTome(p, itemId);
      try { window.UI && window.UI.updateHotbar(); window.UI.updateHUD(); } catch (e) { }
      return r;
    }
    if (countItem(p, itemId) < 1) return { ok: false, msg: `No ${it.name}.` };
    // placeables (base kits + charters): enter placement targeting, consumed on set
    if (it.type === "placeable") {
      try {
        if (window.Shops && window.Shops.startPlacement) { window.Shops.startPlacement(itemId); return { ok: true, msg: `Click walkable ground nearby to place ${it.name} (Esc cancels).` }; }
      } catch (e) { }
      return { ok: false, msg: "Can't place that here." };
    }
    // torches plant instead of being consumed: enter targeting, click ground
    if (itemId === "torch") {
      try { window.Game.startTorchTarget(); } catch (e) { }
      return { ok: true, msg: "🔥 Click a nearby spot to plant the torch." };
    }
    if (it.type === "material") {
      if (itemId === "herb") {
        removeItem(p, itemId, 1);
        p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.15));
        try { window.Sfx.heal(); } catch (e) { }
        try { window.Game.addFloatText(p.x, p.y, "+herb", "#5dd68a"); } catch (e) { }
        return { ok: true, msg: "🌿 Chewed an herb (+15% HP)." };
      }
      // curative herbs: cure their status (+ small heal where defined)
      if (it.usable && it.cure) {
        const had = window.Status ? window.Status.list(p) : [];
        const target = it.cure.filter(t => had.includes(t));
        if (!target.length && !(it.herbHealPct && p.hp < p.maxHp)) return { ok: false, msg: `No ${it.cure.join("/")} to cure right now.` };
        removeItem(p, itemId, 1);
        let cured = [];
        try { if (window.Status) { for (const t of it.cure) if (window.Status.cure(p, t)) cured.push(t); } } catch (e) { }
        if (it.herbHealPct && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * it.herbHealPct));
        try { window.Sfx.heal(); } catch (e) { }
        return { ok: true, msg: `${cured.length ? "Cured " + cured.join(", ") + "!" : "Crunched " + it.name + "."}` };
      }
      return { ok: false, msg: `${it.name} is crafting material.` };
    }
    if (it.type === "ammo") {
      return { ok: false, msg: `${it.name}: bind to a hotbar slot (I) and fire with a bow — not used by hand.` };
    }
    if (it.type === "consumable") {
      // black-market drugs: huge temp stats for HP/MP/stamina
      if (it.use && it.use.drug) {
        try {
          if (window.Shops && window.Shops.takeDrug) {
            const r = window.Shops.takeDrug(p, itemId);
            if (r && r.ok) { removeItem(p, itemId, 1); return r; }
            return r || { ok: false, msg: "You can't stomach another dose right now." };
          }
        } catch (e) { return { ok: false, msg: "Fizzle..." }; }
      }
      // reusable raft: boards / disembarks, never consumed
      if (it.use && it.use.raft) {
        try { return window.Game.toggleRaft(itemId); } catch (e) { return { ok: false, msg: "The raft comes apart in your hands..." }; }
      }
      // status cures (+ optional small heal)
      if (it.use.cure) {
        const had = window.Status ? window.Status.list(p) : [];
        const need = it.use.cure.filter(t => had.includes(t));
        const hurt = it.use.hpPct && p.hp < p.maxHp;
        if (!need.length && !hurt) return { ok: false, msg: "Nothing to cure — HP full, no such ailment." };
        removeItem(p, itemId, 1);
        let cured = [];
        try { if (window.Status) { for (const t of it.use.cure) if (window.Status.cure(p, t)) cured.push(t); } } catch (e) { }
        if (it.use.hpPct) p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * it.use.hpPct));
        try { window.Sfx.heal(); window.Game.addFloatText(p.x, p.y, cured.length ? "cured!" : "+" + Math.round(p.maxHp * (it.use.hpPct || 0)), "#5dd68a"); } catch (e) { }
        return { ok: true, msg: `${cured.length ? "Cured " + cured.join(", ") + "! " : ""}${it.use.hpPct ? "Soothed." : ""}` };
      }
      if (it.use.hpPct) {
        if (p.hp >= p.maxHp) return { ok: false, msg: "HP already full." };
        removeItem(p, itemId, 1);
        p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * it.use.hpPct));
        try { window.Sfx.heal(); window.Game.addFloatText(p.x, p.y, "+" + Math.round(p.maxHp * it.use.hpPct), "#5dd68a"); } catch (e) { }
        return { ok: true, msg: `Quaffed ${it.name}.` };
      }
      if (it.use.mpPct) {
        if (p.mp >= p.maxMp) return { ok: false, msg: "MP already full." };
        removeItem(p, itemId, 1);
        p.mp = Math.min(p.maxMp, p.mp + Math.round(p.maxMp * it.use.mpPct));
        try { window.Sfx.heal(); window.Game.addFloatText(p.x, p.y, "+MP", "#7fc4ff"); } catch (e) { }
        return { ok: true, msg: `Quaffed ${it.name}.` };
      }
      if (it.use.bomb) {
        removeItem(p, itemId, 1);
        try { window.Game.throwBomb(p); } catch (e) { return { ok: false, msg: "Fizzle..." }; }
        return { ok: true, msg: "💣 Thrown!" };
      }
      if (it.use.smoke) {
        removeItem(p, itemId, 1);
        try { window.Game.throwSmoke(p); } catch (e) { return { ok: false, msg: "Fizzle..." }; }
        return { ok: true, msg: "💨 Smoke out!" };
      }
      if (it.use.shuriken) {
        removeItem(p, itemId, 1);
        try { window.Game.throwShuriken(p, itemId); } catch (e) { return { ok: false, msg: "Fizzle..." }; }
        return { ok: true, msg: `Hurled!` };
      }
    }
    return { ok: false, msg: "Nothing happens." };
  }
  function craft(p, recipeId) {
    const r = CRAFTS.find(c => c.id === recipeId);
    if (!r) return { ok: false, msg: "No such recipe." };
    // Dimension locks: oblivion finished goods forge ONLY in hell.
    // Dawnstone needs no forge gate — its shards drop only from heaven
    // overworld bosses, so any forge is already boss-gated.
    try {
      if (isHellOnly(r.out)) {
        let hell = false;
        try { if (window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()) hell = true; } catch (e) {}
        try {
          if (!hell && p && (p.dim === "hell" || (window.Game && window.Game.playerDim && window.Game.playerDim() === "hell"))) hell = true;
        } catch (e) {}
        try {
          if (!hell && window.Game && window.Game.G && window.Game.G.dungeon && window.Game.G.dungeon.dim === "hell") hell = true;
        } catch (e) {}
        if (!hell) {
          const nm = (ITEMS[r.out] && ITEMS[r.out].name) || r.out;
          return { ok: false, msg: `🔥 ${nm} can only be forged in hell — its embers die anywhere else.` };
        }
      }
    } catch (e) {}
    for (const [id, n] of Object.entries(r.cost)) {
      if (countItem(p, id) < n) return { ok: false, msg: `Need ${n}× ${ITEMS[id].name}.` };
    }
    for (const [id, n] of Object.entries(r.cost)) removeItem(p, id, n);
    addItem(p, r.out, r.n);
    try { window.Sfx.coin(); } catch (e) { }
    try { if (window.Game && window.Game.announceLoot) window.Game.announceLoot("🔨 Crafted", 0, [{ id: r.out, n: r.n }]); } catch (e) { }
    try { if (p && p.kind !== "npc" && window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("craft"); } catch (e) { }
    return { ok: true, msg: `Crafted ${r.n}x ${ITEMS[r.out].name}.` };
  }
  function priceMult(p) {
    // Charm shop-price reduction retired (Nov 2026: Charm now grants party/tame stats instead).
    return 1;
  }
  function unknownTomes(p) {
    return TOMES.filter(id => !p.abilities.includes(ITEMS[id].teaches));
  }
 // cataclysm tomes never shelve with the common books: they surface only in
 // deep delves (effective depth 5+), never in shops, never overworld.
  const CATA_TOMES = ["tome_tidal_wave", "tome_energy_beam", "tome_meteorfall", "tome_whiteout", "tome_hurricane", "tome_storm_of_blades", "tome_primordial_sea", "tome_raging_volcano", "tome_crystal_prison", "tome_burning_light", "tome_barbed_plague", "tome_void_hole", "tome_blood_hole"];
  function isCataTome(id) { return CATA_TOMES.includes(id); }
  function unknownCataTomes(p) {
    try { return CATA_TOMES.filter(id => !p.abilities.includes(ITEMS[id].teaches)); }
    catch (e) { return []; }
  }
  // Master chest of an enemy holding: guarantees at least one MID-tier
  // (steel/silver tier-2) piece — the sapphire wands, steel blades and plate
  // the overworld never rolls above. Called after lootChest; mutates drops.
  function ensureMasterLoot(p, drops) {
    try {
      const tier = EQUIP_BY_TIER[2] || [];
      for (const d of (drops || [])) {
        if (d && tier.includes(d.id)) return d.id;
      }
      const pool = tier.filter(id => { try { return !HYBRIDS.includes(id) && !LEGENDARIES.includes(id); } catch (e) { return true; } });
      const src = pool.length ? pool : tier;
      const pick = src[(Math.random() * src.length) | 0];
      if (pick) {
        drops.push({ id: pick, n: 1 });
        try { if (p) addItem(p, pick, 1); } catch (e) { }
        return pick;
      }
    } catch (e) { }
    return null;
  }
  // ================= combat helpers for the expanded arsenal =================
  const UNDEAD_KINDS = new Set(["skeleton", "wraith", "boss"]);
  // pick up every template flagged undead (draugr, mummy, banshee, ...) so
  // smite stays ruinous against the whole growing crypt
  try {
    const T = (typeof window !== "undefined" && window.CFG && window.CFG.MOB_TEMPLATES) || null;
    if (T) for (const k of Object.keys(T)) if (T[k] && T[k].undead) UNDEAD_KINDS.add(k);
  } catch (e) { }
  function isUndead(ent) {
    try {
      if (!ent) return false;
      if (ent.isBoss) return true;
      const k = ent.kind;
      if (k && UNDEAD_KINDS.has(k)) return true;
      try {
        const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[k]) || null;
        if (t && t.undead) return true;
      } catch (e2) { }
      if (k === "mob" && ent.name && /skeleton|wraith|dungeon lord|lich|vampire|zombie|draugr|mummy|jiangshi|striga|banshee|dullahan|gasha/i.test(ent.name)) return true;
    } catch (e) { }
    return false;
  }
  // Civilized demon NPCs (hell townsfolk roles) + every hell-fiend
  // template flagged demon (hell_mobs.js install + the config hell rows).
  const DEMON_ROLES = new Set(["civilized_succubus", "civilized_infernal", "civilized_hellbeast", "civilized_doom", "hell_priest", "hell_merchant", "hell_guard"]);
  function isDemon(ent) {
    try {
      if (!ent) return false;
      if (ent.role && DEMON_ROLES.has(ent.role)) return true;
      const k = ent.kind;
      if (k) {
        try {
          const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[k]) || null;
          if (t && t.demon) return true;
        } catch (e2) { }
      }
    } catch (e) { }
    return false;
  }
  // The unholy: undead + demons. Silver, smite and holy light bite them all
  // alike. (Grave hunger stays undead-only — demons don't crawl out of
  // each other; slay-quest daytime swaps stay undead-only too.)
  function isUnholy(ent) { try { return isUndead(ent) || isDemon(ent); } catch (e) { return false; } }
  function isHolyAbility(abId) {
    try { return (window.CFG.ABILITIES[abId] || {}).element === "holy"; } catch (e) { return false; }
  }
  function abilityElement(abId) {
    try { return (window.CFG.ABILITIES[abId] || {}).element || "physical"; } catch (e) { return "physical"; }
  }
  // First wand/staff in hotbar slot order counts (hotbar slots 1..N). Falls back
  // to the wielded weapon, then (NPCs) the first in their pack.
  function hotbarFocus(ent, kind) {
    try {
      const hb = ent && ent.hotbar;
      if (Array.isArray(hb)) {
        for (let i = 0; i < hb.length; i++) {
          const s = hb[i];
          if (!s || s.kind !== "item" || !s.id) continue;
          const it = ITEMS[s.id];
          if (!it || !it[kind]) continue;
          if (countItem(ent, s.id) < 1 && !(ent.equipment && ent.equipment.weapon === s.id)) continue;
          return it;
        }
      }
      const wid = ent && ent.equipment && ent.equipment.weapon;
      const wit = wid && ITEMS[wid];
      if (wit && wit[kind]) return wit;
      if (ent && ent.kind !== "player") {
        for (const s of (ent.inventory || [])) {
          const it = s && ITEMS[s.id];
          if (it && it[kind] && (s.n | 0) > 0) return it;
        }
      }
    } catch (e) { }
    return null;
  }
  function wandFocus(ent) { return hotbarFocus(ent, "wand"); }
  function staffFocus(ent) { try { const it = hotbarFocus(ent, "staff"); return it; } catch (e) { return null; } }
  function wandManaMult(ent, abId) {
    try {
      const w = wandFocus(ent);
      if (!w) return 1;
      const holy = isHolyAbility(abId);
      const m = holy ? (w.manaHolyMult != null ? w.manaHolyMult : w.manaMult) : w.manaMult;
      return (typeof m === "number" && m > 0) ? m : 1;
    } catch (e) { return 1; }
  }
  function staffPowerMult(ent, abId) {
    try {
      const s = staffFocus(ent);
      if (!s) return 1;
      const holy = isHolyAbility(abId);
      const m = holy ? (s.powerHolyMult != null ? s.powerHolyMult : s.powerMult) : s.powerMult;
      return (typeof m === "number" && m > 0) ? m : 1;
    } catch (e) { return 1; }
  }
  // Worn ring: 1.5x when its element matches the spell/weapon element.
  function ringMult(ent, element) {
    try {
      const tid = ent && ent.equipment && ent.equipment.trinket;
      const it = tid && ITEMS[tid];
      if (!it || !it.ringBoost) return 1;
      const m = it.ringBoost[element];
      return (typeof m === "number" && m > 0) ? m : 1;
    } catch (e) { return 1; }
  }
  // Ring of Mercy: the wearer's blows leave victims at 1 HP instead of killing.
  function mercyWorn(ent) {
    try {
      const tid = ent && ent.equipment && ent.equipment.trinket;
      const it = tid && ITEMS[tid];
      return !!(it && it.mercy);
    } catch (e) { return false; }
  }
  function equippedWeapon(ent) {
    try { const id = ent && ent.equipment && ent.equipment.weapon; return (id && ITEMS[id]) || null; } catch (e) { return null; }
  }
  function meleeWeapon(ent) {
    const w = equippedWeapon(ent);
    if (w && w.wtype && ["dagger", "sword", "axe", "hammer", "spear", "wand", "staff"].includes(w.wtype)) return w;
    if (w && w.bow) return null;
    return w && w.slot === "weapon" ? w : null;
  }
  function meleeStats(ent) {
    const w = meleeWeapon(ent);
    if (!w) return { range: 1.6, cd: 0.38, dmgType: "blunt", tierMult: 1, undeadMult: 1, element: null, item: null, arc: 1.2, sweep: 1 };
    return {
      range: w.weaponRange || 1.8, cd: w.weaponCd || 0.38,
      dmgType: w.dmgType || "blade",
      tierMult: w.tierMult || 1, undeadMult: w.undeadMult != null ? w.undeadMult : (w.tierMult || 1),
      element: w.element || null, item: w,
      arc: w.weaponArc || 1.2, sweep: w.weaponSweep || 1,
    };
  }
  // Swing visual per weapon family: blades sweep a wide arc, daggers and
  // spears thrust (spears the longest line of all), blunt weapons fall
  // heavy, whips crack a long wide lash, bows stay shouldered (arrows fly
  // instead), bare hands barely stir the air.
  // An element tints the swing.
  const SWING_TINT = { fire: "#ff9d2e", ice: "#7fd6ff", electric: "#fff7ae", nature: "#7ddf6b", water: "#4fc3ef", holy: "#ffe27f" };
  function swingFx(wtype, element) {
    let fx;
    switch (wtype) {
      case "sword":
      case "axe": fx = { kind: "arc", color: "#ffffff", lw: 4, r: 0.9 }; break;
      case "dagger":
      case "wand": fx = { kind: "thrust", color: "#ffffff", lw: 2, r: 0.8 }; break;
      case "spear": fx = { kind: "thrust", color: "#ffe27f", lw: 3, r: 1.7 }; break;
      case "whip": fx = { kind: "arc", color: "#e8d9a0", lw: 3, r: 1.5, w: 2.0 }; break;
      case "hammer":
      case "staff": fx = { kind: "arc", color: "#ffd93d", lw: 6, r: 0.9 }; break;
      case "bow": fx = { kind: "arc", color: "#c9c9c9", lw: 2, r: 0.5 }; break;
      default: fx = { kind: "arc", color: "#ffffff", lw: 2, r: 0.55 };
    }
    if (element && SWING_TINT[element]) fx = { ...fx, color: SWING_TINT[element] };
    return fx;
  }
  // Physical matchup tables: every mob kind resolves through its body plan,
  // so ALL mobs have a blade/pierce/blunt/lash row (not just the 9 legacy
  // kinds). Kind overrides preserve the old hand-tuned values exactly.
  const PHYS_BY_BODY = {
    blob:      { blade: 1.2,  pierce: 0.9,  blunt: 1.1,  lash: 1.0  },
    winged:    { blade: 1.1,  pierce: 1.25, blunt: 1.0,  lash: 1.15 },
    humanoid:  { blade: 1.1,  pierce: 1.15, blunt: 1.0,  lash: 1.0  },
    beast:     { blade: 1.2,  pierce: 1.15, blunt: 1.0,  lash: 1.1  },
    construct: { blade: 0.9,  pierce: 0.8,  blunt: 1.3,  lash: 0.85 },
    undead:    { blade: 0.9,  pierce: 0.8,  blunt: 1.5,  lash: 0.9  },
    brute:     { blade: 1.0,  pierce: 1.0,  blunt: 1.15, lash: 0.9  },
    serpent:   { blade: 1.15, pierce: 1.1,  blunt: 0.9,  lash: 1.0  },
    ghost:     { blade: 0.85, pierce: 1.0,  blunt: 1.3,  lash: 1.0  },
    swarm:     { blade: 1.2,  pierce: 0.85, blunt: 1.1,  lash: 1.25 },
  };
  // Legacy hand-tuning, kept exact (blade/pierce/blunt match the old code;
  // lash added so whips also read honestly).
  const PHYS_BY_KIND = {
    skeleton: { blade: 0.9,  pierce: 0.8,  blunt: 1.5, lash: 0.9  },
    wraith:   { blade: 0.85, pierce: 1.05, blunt: 1.3, lash: 1.0  },
    boss:     { blade: 0.85, pierce: 1.05, blunt: 1.3, lash: 1.0  },
    mushroom: { blade: 1.2,  pierce: 0.9,  blunt: 1.1, lash: 1.0  },
    slime:    { blade: 1.2,  pierce: 0.9,  blunt: 1.1, lash: 1.0  },
    bat:      { blade: 1.1,  pierce: 1.25, blunt: 1.0, lash: 1.15 },
    goblin:   { blade: 1.1,  pierce: 1.15, blunt: 1.0, lash: 1.0  },
    wolf:     { blade: 1.2,  pierce: 1.15, blunt: 1.0, lash: 1.1  },
    cultist:  { blade: 1.1,  pierce: 1.25, blunt: 1.0, lash: 1.0  },
  };
  function mobBodyOf(target) {
    try {
      if (target && target.body) return target.body;
      const k = target && target.kind;
      if (k && window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[k])
        return window.CFG.MOB_TEMPLATES[k].body || null;
    } catch (e) { }
    return null;
  }
  // blade/pierce/blunt/lash vs enemy kinds (body fallback => all mobs covered).
  function dmgTypeMult(dmgType, target) {
    try {
      const k = target && target.kind;
      if (!k) return 1;
      const dt = String(dmgType || "blade").toLowerCase();
      const key = dt === "blunt" ? "blunt" : dt === "pierce" ? "pierce" : dt === "lash" ? "lash" : "blade";
      const ko = PHYS_BY_KIND[k];
      if (ko && ko[key] != null) return ko[key];
      const body = mobBodyOf(target);
      const row = body && PHYS_BY_BODY[body];
      if (row && row[key] != null) return row[key];
      // unknown bodies keep the old defaults
      if (key === "pierce") return 1.05;
      return 1;
    } catch (e) { return 1; }
  }
  // Spell-element matchup tables: same body-plan idea, so every mob also has
  // a fire/water/ice/electric/holy/nature row. Applied centrally in
  // game.js dealDamage for el != "physical" (physical melee already carries
  // its triangle via meleeMult — applying both would double-count).
  const ELEM_BY_BODY = {
    blob:      { fire: 1.0,  water: 0.8, ice: 1.2,  electric: 1.3,  holy: 1.0,  nature: 1.0, physical: 1.0  },
    winged:    { fire: 1.1,  water: 1.0, ice: 1.0,  electric: 1.25, holy: 1.0,  nature: 0.9, physical: 1.0  },
    humanoid:  { fire: 1.0,  water: 1.0, ice: 1.0,  electric: 1.0,  holy: 1.0,  nature: 1.0, physical: 1.0  },
    beast:     { fire: 1.25, water: 1.0, ice: 1.0,  electric: 1.0,  holy: 1.0,  nature: 1.0, physical: 1.0  },
    construct: { fire: 1.1,  water: 0.9, ice: 0.9,  electric: 0.8,  holy: 1.0,  nature: 0.8, physical: 0.9  },
    undead:    { fire: 1.2,  water: 1.0, ice: 1.0,  electric: 1.0,  holy: 1.35, nature: 0.8, physical: 1.0  },
    brute:     { fire: 1.25, water: 1.0, ice: 0.9,  electric: 1.0,  holy: 1.0,  nature: 1.0, physical: 1.0  },
    serpent:   { fire: 1.0,  water: 0.8, ice: 0.9,  electric: 1.25, holy: 1.0,  nature: 1.0, physical: 1.0  },
    ghost:     { fire: 1.0,  water: 1.0, ice: 1.1,  electric: 1.0,  holy: 1.3,  nature: 0.8, physical: 0.8  },
    swarm:     { fire: 1.3,  water: 0.9, ice: 1.1,  electric: 1.1,  holy: 1.0,  nature: 1.0, physical: 1.1  },
  };
  // Thematic exceptions on top of the body plan (dry wrappings burn, glacier
  // kin dread fire but shrug ice, lava kin dread water, dragons fear ice...).
  const ELEM_BY_KIND = {
    mummy:            { fire: 1.4 },
    yeti:             { fire: 1.3, ice: 0.6 },
    rime_wolf:        { fire: 1.3, ice: 0.6 },
    shiver_owl:       { fire: 1.25, ice: 0.7 },
    jotunn_jarl:      { fire: 1.35, ice: 0.6 },
    draugr_king:      { fire: 1.25, ice: 0.7 },
    magma_eel:        { fire: 0.6, water: 1.4, ice: 1.2 },
    cinder_maw:       { fire: 0.6, water: 1.4, ice: 1.2 },
    cinder_steed:     { fire: 0.7, water: 1.3 },
    phoenix:          { fire: 0.6, water: 1.25, ice: 1.2 },
    peak_dragon:      { fire: 0.7, ice: 1.25 },
    wyvern_matriarch: { fire: 0.8, ice: 1.25 },
    leviathan:        { electric: 1.35 },
    slime_sovereign:  { ice: 1.3, electric: 1.35 },
    slime_empress:    { ice: 1.25, electric: 1.3 },
    gloomspinner:     { fire: 1.35 },
    gasha_skull:      { holy: 1.4 },
    skeleton_warlord: { holy: 1.4 },
    wraith_sovereign: { holy: 1.4 },
    cultist_hierophant: { holy: 1.3 },
  };
  function elemMult(element, target) {
    try {
      const el = String(element || "physical").toLowerCase();
      const k = target && target.kind;
      // civilized demons walk on no template (NPC roles) — still burn
      if (!k) { try { return (el === "holy" && isDemon(target)) ? 1.35 : 1; } catch (e) { return 1; } }
      let tpl = null;
      try { tpl = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[k]) || null; } catch (e) { tpl = null; }
      const body = (target && target.body) || (tpl && tpl.body) || null;
      // players/NPCs have no mob template: stay neutral
      if (!tpl && !body) return 1;
      let m = 1;
      const row = body && ELEM_BY_BODY[body];
      if (row && row[el] != null) m = row[el];
      try {
        const fl = tpl || {};
        // crypt rot and hell demons hate holy light, whatever body they wear
        if (el === "holy" && (fl.undead || fl.demon)) m = Math.max(m, 1.35);
        if (fl.aquatic) {
          if (el === "water") m = Math.max(0.5, m * 0.7);
          if (el === "electric") m = Math.min(2, m * 1.25);
        }
        if (fl.lavaBorn) {
          if (el === "fire") m = Math.max(0.5, m * 0.6);
          if (el === "water") m = Math.min(2, m * 1.3);
          if (el === "ice") m = Math.min(2, m * 1.2);
        }
      } catch (e) { }
      // kind exceptions win outright (they already bake flags in)
      try {
        const ko = ELEM_BY_KIND[k];
        if (ko && ko[el] != null) m = ko[el];
      } catch (e) { }
      if (!(m > 0)) return 1;
      return Math.min(2, Math.max(0.5, m));
    } catch (e) { return 1; }
  }
  // ---- weapon swing cadence + DPS ladder (normal swings; flurry has its own) ----
  // Same-tier speed order: dagger > sword = whip > axe > spear > hammer.
  // Better tiers swing faster via a shared tier factor, so the order holds
  // at every tier. FAM_DMG equalizes swing speed exactly (family mult is
  // proportional to swing time, anchored at the dagger): the wielder's own
  // ATK then deals identical DPS in every hand, and the visible weapon-ATK
  // bonus above (TYPE_DMG_BONUS) puts slower families slightly ahead —
  // roughly: whip/sword ≈ dagger, axe ~+6%, spear ~+8%, hammer ~+10%.
  // Bows sit at 1.0 on purpose: with the linear bow formula below they land
  // at dagger DPS (ranged safety earns no slow-swing bonus; arrow choice
  // still shifts them up or down).
  const FAM_SWING = { dagger: 0.28, sword: 0.38, spear: 0.5, wand: 0.4, axe: 0.45, staff: 0.45, hammer: 0.55, bow: 0.55 };
  const FAM_DMG = { dagger: 1.4591, sword: 1.9802, axe: 2.345, hammer: 2.8661, bow: 1.0, spear: 2.6055, wand: 1.0526, staff: 1.1842, whip: 1.9802 };
  // Bow tiers ranked onto the melee material scale (old bow ~ rusty … yggdrasil ~ dragonbone).
  const BOW_TIER = { old_bow: 1, oak_bow: 1.2, yew_bow: 1.5, frostwood_bow: 2, wardens_bow: 2, yggdrasil_bow: 3, frostfang_bow: 2, sparkbow: 2, tidebow: 2, oathbow: 3 };
  BOW_TIER.oblivion_bow = 4; BOW_TIER.dawnstone_bow = 4.5; BOW_TIER.seraphsong_bow = 4.5;
  BOW_TIER.frostfang_bow = 2; BOW_TIER.sparkbow = 1.5; BOW_TIER.tidebow = 1.5;
  function weaponTierMult(w, weaponId) {
    try {
      if (!w) return 1;
      if (typeof w.tierMult === "number") return w.tierMult;
      if (w.bow) return BOW_TIER[weaponId] || 1;
    } catch (e) { }
    return 1;
  }
  function tierSwingMult(tm) {
    try { return Math.min(1.05, Math.max(0.85, 1 - 0.05 * (tm - 1))); } catch (e) { return 1; }
  }
  // Normal-swing cadence for whoever holds the weapon (unarmed: 0.38s).
  // Agility: +0.25% weapon speed per point (cooldown shrinks; flurry uses the same).
  // Quansalbar Shellblitz: unarmed strikes hit 2x as fast, ignoring the normal
  // 0.08s floor (a 0.02s absolute floor stays as an engine safety minimum).
  function attackCadence(ent) {
    try {
      const w = equippedWeapon(ent);
      if (!w || !w.wtype) {
        let baseU = 0.38;
        try { if (window.Entities && window.Entities.agiCdMult) baseU *= window.Entities.agiCdMult(ent); } catch (e) { }
        try { if (window.Races && window.Races.unarmedSpeedMult) baseU *= window.Races.unarmedSpeedMult(ent); } catch (e) { }
        return Math.max(0.02, baseU);
      }
      const fam = w.bow ? "bow" : w.wtype;
      const base = FAM_SWING[fam] || 0.38;
      let cd = base * tierSwingMult(weaponTierMult(w, ent && ent.equipment && ent.equipment.weapon));
      try { if (window.Entities && window.Entities.agiCdMult) cd *= window.Entities.agiCdMult(ent); } catch (e) { }
      return cd;
    } catch (e) { return 0.38; }
  }
  function famDmgMult(wtype) { try { return FAM_DMG[wtype] || 1; } catch (e) { return 1; } }
  // Full attacker-side melee multiplier for a target (tier/silver + type + rings).
  function meleeMult(att, target) {
    try {
      const st = meleeStats(att);
      const undead = isUnholy(target);
      let m = undead ? st.undeadMult : st.tierMult;
      m *= dmgTypeMult(st.dmgType, target);
      // family DPS ladder: slower families hit slightly harder per swing
      try { if (st.item && st.item.wtype) m *= famDmgMult(st.item.wtype); } catch (e) { }
      if (st.element) m *= ringMult(att, st.element);
      else m *= ringMult(att, "physical");
      if (st.item && st.item.smite && undead) m *= 1.25;
      return { mult: m, stats: st, undead };
    } catch (e) { return { mult: 1, stats: meleeStats(null), undead: false }; }
  }
  function bowStats(ent) {
    const w = equippedWeapon(ent);
    if (!w || !w.bow) return null;
    return { speed: w.bowSpeed || 1, power: w.bowPower || 1, range: w.range || 9, element: w.element || null, item: w };
  }
  function bowMult(att, arrowDef) {
    try {
      const b = bowStats(att);
      let m = (b ? b.power : 1);
      // bows ride the hammer DPS rung (same swing, same compensation)
      try { if (b && b.item) m *= famDmgMult("bow"); } catch (e) { }
      const el = (arrowDef && arrowDef.element) || (b && b.element) || null;
      if (el) m *= ringMult(att, el);
      else m *= ringMult(att, "physical");
      return { mult: m, element: el, bow: b };
    } catch (e) { return { mult: 1, element: null, bow: null }; }
  }
  function arrowElement(arrow) {
    try {
      if (!arrow) return null;
      if (arrow.element) return arrow.element;
      if (arrow.id === "arrow_cinder") return "fire";
      if (arrow.id === "arrow_frost") return "ice";
      if (arrow.id === "arrow_poison") return "water";
      return null;
    } catch (e) { return null; }
  }
  // Light/heavy cut physical, enchanted robes cut magical.
  // Guard-tree shell classes: robes (and vestments/mantles) feed the
  // Wardweave tree; kasaya feed Ascetic, habitus feed Devotion; every
  // other worn body armor feeds Stoneskin.
  const ROBE_IDS = { cloth_robe: 1, mage_robe: 1, archmage_robe: 1, holy_vestments: 1, wyrmshroud_robe: 1, void_mantle: 1, dawnshroud_robe: 1, tideward_robe: 1 };
  const KASAYA_IDS = { patched_kasaya: 1, ironthread_kasaya: 1, sunsilk_kasaya: 1, dragonhide_kasaya: 1, oblivion_kasaya: 1, dawnsilk_kasaya: 1 };
  const HABITUS_IDS = { novice_habit: 1, canon_habit: 1, vesper_habit: 1, seraph_habit: 1, void_habit: 1, dawnchoir_habit: 1 };
  function armorClassFor(itemId) {
    try {
      if (!itemId) return null;
      if (ROBE_IDS[itemId]) return "robe";
      if (KASAYA_IDS[itemId]) return "kasaya";
      if (HABITUS_IDS[itemId]) return "habitus";
      const it = ITEMS[itemId];
      if (it && it.slot === "armor") return "armor";
      return null;
    } catch (e) { return null; }
  }
  function armorClass(ent) {
    try {
      const aid = ent && ent.equipment && ent.equipment.armor;
      return armorClassFor(aid);
    } catch (e) { return null; }
  }
  function armorResist(ent) {
    let phys = 0, magic = 0;
    try {
      const aid = ent && ent.equipment && ent.equipment.armor;
      const it = aid && ITEMS[aid];
      if (it) { phys += it.resPhys || 0; magic += it.resMagic || 0; }
    } catch (e) { }
    // Stoneskin / Wardweave ranks harden the worn shell further.
    try {
      if (ent && ent.kind === "player" && window.Entities) {
        if (window.Entities.armorResistBonus) phys += window.Entities.armorResistBonus(ent) || 0;
        if (window.Entities.robeResistBonus) magic += window.Entities.robeResistBonus(ent) || 0;
      }
    } catch (e) { }
    return { phys: Math.min(0.65, phys), magic: Math.min(0.65, magic) };
  }
  // Dawnstone ward: dawn-forged shells turn the unholy blow. Wearing any
  // dawnstone-tier garb (plate, shroud, kasaya, habit) or bearing the
  // Dawnstone Aegis cuts damage from undead and demons by 30% (x0.7,
  // non-stacking — one warded piece is enough). Multiplicative with armor
  // resists, applied after them in dealDamage.
  const DAWNSTONE_WARD_IDS = { dawnstone_plate: 1, dawnshroud_robe: 1, dawnsilk_kasaya: 1, dawnchoir_habit: 1, dawnstone_aegis: 1 };
  function wardForId(id) { try { return DAWNSTONE_WARD_IDS[id] ? 0.7 : 1; } catch (e) { return 1; } }
  function unholyWard(ent) {
    try {
      const eq = ent && ent.equipment;
      if (!eq) return 1;
      if (eq.armor && DAWNSTONE_WARD_IDS[eq.armor]) return 0.7;
      if (eq.shield && DAWNSTONE_WARD_IDS[eq.shield]) return 0.7;
    } catch (e) { }
    return 1;
  }
  function describeFocus(ent) {
    try {
      const w = wandFocus(ent), s = staffFocus(ent);
      const bits = [];
      if (w) bits.push(`${w.name} (x${w.manaMult} mana)`);
      if (s) bits.push(`${s.name} (x${s.powerMult} power)`);
      const tid = ent && ent.equipment && ent.equipment.trinket;
      const t = tid && ITEMS[tid];
      if (t && t.ringBoost) bits.push(`${t.name}`);
      return bits.join(" · ");
    } catch (e) { return ""; }
  }
  // Effective loot level: your level, nudged up by remoteness and depth.
  // A new gear tier unlocks about every 20 levels (dragon tier only via
  // the boss path below — random rolls can never reach it).
  function tierForLevel(lv, dist, depth) {
    const eff = (lv || 1) + (dist || 0) / 100 + (depth || 0) * 8;
    if (eff >= 150) return 6;
    if (eff >= 115) return 5;
    if (eff >= 80) return 4;
    if (eff >= 60) return 3;
    if (eff >= 40) return 2;
    if (eff >= 20) return 1;
    return 0;
  }
  function randomEquipTier(p, dist, depth, cap) {
    cap = (cap == null) ? 4 : cap;
    const lv = (p && p.lv) || 1;
    let d = dist;
    try { if (d == null && window.Game && window.Game.G && window.Game.G.player) d = Math.hypot(window.Game.G.player.x, window.Game.G.player.y); } catch (e) { }
    let dep = depth;
    // Prefer the effective depth (delve tier + floors down) so deeper floors
    // roll higher tiers even when the caller passes nothing.
    try { if (dep == null && window.Game && window.Game.dungeonEffDepth) dep = window.Game.dungeonEffDepth(); } catch (e) { }
    try { if ((dep == null || dep === 0) && window.Game && window.Game.G) dep = (window.Game.G.dungeon && window.Game.G.dungeon.depth) || 0; } catch (e) { }
    const base = Math.min(cap, tierForLevel(lv, d || 0, dep || 0));
    const r = Math.random();
    if (r < 0.12 && base < cap) return base + 1;
    if (r > 0.85 && base > 0) return base - 1;
    return base;
  }
  // Max gear tier for a location. Overworld (chests AND wild drops) stops at
  // steel/silver no matter the level; deeper delves go higher, only the
  // last floors of the hardest delves (effective depth 10+) touch dragon —
  // and only DEEP HELL delves (hell ground or hell delve, eff 10+) touch
  // oblivion (tier 6). Surface never rolls oblivion.
  function gearTierCap(inDungeon, effDepth) {
    if (!inDungeon) return 2;
    const d = effDepth | 0;
    let hell = false;
    try { hell = !!(window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()); } catch (e) {}
    if (hell && d >= 10) return 6;
    if (d >= 10) return 5;
    if (d >= 6) return 4;
    if (d >= 3) return 3;
    return 2;
  }
  // Which tier a hybrid enchant belongs to (chests only offer hybrids at or
  // below the location cap, so no dragon-blades from roadside caches).
  function hybridTier(id) {
    try {
      for (let t = 0; t < EQUIP_BY_TIER.length; t++) if (EQUIP_BY_TIER[t].includes(id)) return t;
      const it = (typeof ITEMS !== "undefined" && ITEMS[id]) || {};
      const m = Math.max(it.tierMult || 1, it.undeadMult || 1);
      if (m >= 4) return 6;
      if (m >= 3) return 5;
      if (m >= 2) return 3;
      if (m > 1.2) return 2;
      return 1;
    } catch (e) { return 2; }
  }
  // Rare forge stock is sealed until the player proves themselves: each mat
  // needs a dungeon boss of at least the listed level slain (tracked on
  // player.bestBossLv). Dragon bone/horn need no boss-gate entry — they only
  // ever come from dragons — but mobDrop enforces a depth rule instead: no
  // dragonbone from delves below effective depth 6 (boss dragons + overworld
  // kills still pay).
  const BOSS_MAT_GATE = {
    ruby_gem: 10, sapphire_gem: 10, emerald_gem: 10,
    mythril_ore: 35,
    rime_crystal: 35, ember_core: 35, storm_feather: 35, tide_pearl: 35, holy_bead: 35,
    unicorn_hair: 50, yggdrasil_branch: 50, dawnstone_shard: 60,
  };
  function matNeedBossLv(id) { return BOSS_MAT_GATE[id] || 0; }
  // 0 = the player may find it; otherwise the boss level they must beat first.
  function matLocked(p, id) {
    const need = matNeedBossLv(id);
    if (!need) return 0;
    const best = (p && p.bestBossLv) | 0;
    return best >= need ? 0 : need;
  }
  // Effective dungeon depth for loot: delve tier + floors descended.
  function lootDepth(fallback) {
    try {
      if (window.Game && window.Game.dungeonEffDepth) return window.Game.dungeonEffDepth();
      return (window.Game && window.Game.G && window.Game.G.dungeon && window.Game.G.dungeon.depth) || fallback || 0;
    } catch (e) { return fallback || 0; }
  }
  // Chest loot. opts: {dungeon:boolean}
  function lootChest(p, opts = {}) {
    const drops = [];
    // (Luck gold/drop boosts retired: Luck now gives dodge.)
    const luckM = 1;
    const inDungeonEarly = !!(opts.dungeon || (p && p.inDungeon));
    const effEarly = lootDepth(inDungeonEarly ? 1 : 0);
    // Deeper floors pay more gold: +35% per effective depth past 1.
    const goldBase = opts.dungeon ? 600 + Math.random() * 1000 : 150 + Math.random() * 600;
    const goldMult = inDungeonEarly ? (1 + Math.max(0, effEarly - 1) * 0.35) : 1;
    let hellGold = false;
    // v18: hell ground is dimension-local — the surf disc is ocean, not hell.
    try { hellGold = !!(window.Hell && ((window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()) || (p && p.dim === "hell" && window.Hell.isHellGround && window.Hell.isHellGround(p.x, p.y)))); } catch (e) {}
    const gold = Math.round(goldBase * goldMult * luckM * (hellGold ? 3 : 1));
    const mats = ["wood", "wood", "stone", "herb", "herb", "sage_herb", "cinder_herb"];
    const nMat = opts.dungeon ? 2 + ((Math.random() * 2) | 0) : 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < nMat; i++) drops.push({ id: mats[(Math.random() * mats.length) | 0], n: 1 });
    // raw forge stock: ores everywhere, silver/gems/logs deeper, mythril +
    // elemental bits + unicorn hair + yggdrasil deep — and the rare ones
    // only surface once dungeon bosses have fallen (see matLocked).
    const effD = effEarly || 0;
    const gate = surfFloorGate(p); // surface floor-gates (hell: always open)
    const matOk = (id) => !matLocked(p, id);
    if (Math.random() < (opts.dungeon ? 0.4 : 0.15)) drops.push({ id: "iron_ore", n: 1 + ((Math.random() * 2) | 0) });
    if (effD >= 2 && Math.random() < 0.18) drops.push({ id: "silver_ore", n: 1 });
    // mythril surfaces ONLY from floor 5+ of surface delves (hell delves
    // keep their own depth rule) — never overworld, never shallow floors.
    if (matOk("mythril_ore") && Math.random() < 0.10 && ((hellGold && effD >= 4) || gate.mid)) drops.push({ id: "mythril_ore", n: 1 });
    if (effD >= 2 && matOk("ruby_gem") && Math.random() < 0.12) {
      // emeralds join the gem find ONLY from floor 5+ (same band as mythril)
      const gpool = (gate.mid && matOk("emerald_gem")) ? ["ruby_gem", "sapphire_gem", "emerald_gem"] : ["ruby_gem", "sapphire_gem"];
      drops.push({ id: gpool[(Math.random() * gpool.length) | 0], n: 1 });
    }
    if (effD >= 2 && Math.random() < 0.10) {
      // frostwood joins the log find ONLY from floor 5+ (mythril band)
      const lpool = gate.mid ? ["frostwood_log", "emberwood_log", "wolf_hide"] : ["emberwood_log", "wolf_hide"];
      drops.push({ id: lpool[(Math.random() * lpool.length) | 0], n: 1 });
    }
    if (effD >= 5 && matOk("rime_crystal") && Math.random() < 0.08) drops.push({ id: ["rime_crystal", "ember_core", "storm_feather", "tide_pearl", "holy_bead"][(Math.random() * 5) | 0], n: 1 });
    if (effD >= 3 && matOk("unicorn_hair") && Math.random() < 0.05) drops.push({ id: "unicorn_hair", n: 1 });
    // yggdrasil surfaces ONLY from floor 11+ of surface delves (dragon band)
    if (effD >= 4 && matOk("yggdrasil_branch") && Math.random() < 0.06 && gate.top) drops.push({ id: "yggdrasil_branch", n: 1 });
    if (hellGold && effD >= 6 && Math.random() < 0.10) drops.push({ id: "dragon_bone", n: 1 });
    if (hellGold && effD >= 8 && Math.random() < 0.06) drops.push({ id: "dragon_horn", n: 1 });
    if (Math.random() < (opts.dungeon ? 0.5 : 0.3)) drops.push({ id: "potion", n: 1 });
    if (Math.random() < (opts.dungeon ? 0.35 : 0.2)) drops.push({ id: "mana_potion", n: 1 });
    if (Math.random() < (opts.dungeon ? 0.35 : 0.12)) {
      // shafts scale with depth: steel past the shallows, dragonbone at the bottom
      const apool = ["arrow_iron", "arrow_iron", "arrow_poison"];
      if (effD >= 2) apool.push("arrow_steel");
      if (effD >= 4) apool.push("arrow_silver");
      // fletched tiers gate with their bands: mythril floor 5+, dragonbone 11+
      if (effD >= 6 && gate.mid) apool.push("arrow_mythril");
      if (effD >= 8 && gate.top) apool.push("arrow_dragonbone");
      if (effD >= 10 && hellGold) apool.push("arrow_oblivion", "arrow_oblivion");
      drops.push({ id: apool[(Math.random() * apool.length) | 0], n: 2 + ((Math.random() * 3) | 0) });
      if (Math.random() < 0.12) drops.push({ id: "shuriken_iron", n: 4 + ((Math.random() * 4) | 0) });
    }
    if (Math.random() < (opts.dungeon ? 0.12 : 0.05)) drops.push({ id: "smoke_bomb", n: 1 + ((Math.random() * 2) | 0) });
    if (Math.random() < 0.3) drops.push({ id: "torch", n: 1 + ((Math.random() * 2) | 0) });
    if (opts.dungeon && Math.random() < 0.3) drops.push({ id: ["antidote", "burn_salve", "focus_tea", "clear_drops"][(Math.random() * 4) | 0], n: 1 });
    if (Math.random() < (opts.dungeon ? 0.2 : 0.06)) drops.push({ id: "bomb", n: 1 });
    // spellbook: prefer unknown (common books only — cataclysms have their
    // own deep roll below)
    const unk = unknownTomes(p).filter(id => !isCataTome(id));
    const tomeP = opts.dungeon ? 0.45 : 0.2;
    if (unk.length && Math.random() < tomeP) drops.push({ id: unk[(Math.random() * unk.length) | 0], n: 1 });
    // sealed cataclysm lore: deep delves only (depth 5+, better odds at 8+)
    if (inDungeonEarly && effEarly >= 5) {
      const cata = unknownCataTomes(p);
      const cataP = effEarly >= 8 ? 0.14 : 0.08;
      if (cata.length && Math.random() < cataP) drops.push({ id: cata[(Math.random() * cata.length) | 0], n: 1 });
    }
    // equipment: capped by location (overworld stops at steel, whatever the
    // level); hybrids stay rare and can never out-tier the location cap.
    // v17 HELL PAYS: open waste-chests roll up to mythril, delve chests
    // always pay gear (floored mythril), deep hell delves reach oblivion.
    const inDungeon = inDungeonEarly;
    let depth = effEarly;
    let hell = false;
    try {
      hell = !!(window.Hell && (
        (window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()) ||
        (p && p.dim === "hell" && window.Hell.isHellGround && window.Hell.isHellGround(p.x, p.y))
      ));
    } catch (e) {}
    let cap = gearTierCap(inDungeon, depth);
    if (hell && !inDungeon) cap = 4;
    // surface delves gate by FLOOR, not remoteness: floors 1-4 cap at steel
    // (tier 2), floors 5-10 reach the mythril band (tier 4), floors 11+
    // reach the dragon band (tier 5). Overworld stays capped at steel.
    if (!hell) cap = !inDungeon ? 2 : gate.top ? 5 : gate.mid ? 4 : 2;
    const eqP = hell ? (inDungeon ? 1 : 0.6) : (inDungeon ? 0.34 : 0.1);
    if (Math.random() < eqP) {
      let tierIdx = randomEquipTier(p, null, inDungeon ? Math.max(depth, 1) : 0, cap);
      if (hell) tierIdx = Math.max(tierIdx, inDungeon ? 4 : 3);
      const tier = EQUIP_BY_TIER[tierIdx];
      let pool = tier.filter(id => !(HYBRIDS.includes(id) || LEGENDARIES.includes(id)));
      if (!pool.length) pool = tier;
      let pick = pool[(Math.random() * pool.length) | 0];
      // rare hybrid find, at or below the location's tier (never tier 0-1)
      if (cap >= 2 && Math.random() < (inDungeon ? 0.08 : 0.03)) {
        const hyPool = HYBRIDS.filter(h => hybridTier(h) <= cap && hybridTier(h) >= 2 && !isDawnstone(h) && !isHellOnly(h));
        if (hyPool.length) pick = hyPool[(Math.random() * hyPool.length) | 0];
      }
      drops.push({ id: pick, n: 1 });
    }
    // dungeon depths can hide a legend (deep) or dragon cache (last floors
    // of the hardest delves only) — overworld never sees either. Deep hell
    // delves add an oblivion cache on top.
    if (hell && inDungeon && depth >= 10 && Math.random() < 0.08) {
      drops.push({ id: EQUIP_BY_TIER[6][(Math.random() * EQUIP_BY_TIER[6].length) | 0], n: 1 });
    }
    // dragon caches (tier 5) surface ONLY from floor 11+ — even the last
    // floors of the hardest delves pay steel/mythril before that. Legend
    // caches (7+) pay stormcall from floor 5+, the rest from floor 11+.
    // Dawnstone legend (daybreak) NEVER surfaces from chests — heaven
    // overworld bosses only.
    const legendPool = (gate.top ? LEGENDARIES : gate.mid ? LEGENDARIES.filter(id => SURF_FLOOR5_GEAR.includes(id)) : []).filter(id => !isDawnstone(id));
    if (inDungeon && depth >= 10 && Math.random() < 0.05 && (hell || gate.top)) {
      drops.push({ id: EQUIP_BY_TIER[5][(Math.random() * EQUIP_BY_TIER[5].length) | 0], n: 1 });
    } else if (inDungeon && depth >= 7 && Math.random() < 0.03 && (hell || legendPool.length)) {
      const lpool = (hell ? LEGENDARIES : legendPool).filter(id => !isDawnstone(id));
      if (!lpool.length) { /* no legend here — dawnstone stays boss-only */ }
      else drops.push({ id: lpool[(Math.random() * lpool.length) | 0], n: 1 });
    }
    // stone fallback for forests
    for (const d of drops) addItem(p, d.id, d.n);
    return { gold, drops };
  }
  function mobDrop(p, mob) {
    const drops = [];
    const r = Math.random();
    // (Luck drop boosts retired: Luck now gives dodge.)
    const lukB = 0;
    if (mob.isBoss) {
      const unk = unknownTomes(p).filter(id => !isCataTome(id));
      if (unk.length) drops.push({ id: unk[(Math.random() * unk.length) | 0], n: 1 });
      let depth = lootDepth(1);
      // warlords of the deep hoard sealed cataclysm lore (depth 5+)
      if (depth >= 5 && Math.random() < 0.3) {
        const cata = unknownCataTomes(p);
        if (cata.length) drops.push({ id: cata[(Math.random() * cata.length) | 0], n: 1 });
      }
      // ---- heaven overworld bosses: the ONLY dawnstone source ----
      // Divine Dragon, Celestial Messenger, Reservoir Leviathan, Seraph
      // Regent — shards every kill, a dawnstone prize, sometimes Daybreak.
      try {
        const hk = (mob && mob.kind) || "";
        const HB = (window.CFG && window.CFG.HEAVEN_BOSS_KINDS) || ["divine_dragon", "celestial_messenger", "reservoir_leviathan", "seraph_regent"];
        if (HB.indexOf(hk) >= 0) {
          drops.push({ id: "dawnstone_shard", n: 2 + ((Math.random() * 2) | 0) });
          const dpool = DAWNSTONE_ALL.filter(id => id !== "daybreak");
          drops.push({ id: dpool[(Math.random() * dpool.length) | 0], n: 1 });
          if (Math.random() < 0.25) drops.push({ id: "daybreak", n: 1 });
          // a fallen seraph may loose its sphere: witnesses who missed
          // Peter's fall get into heaven on a gifted one (give/trade it).
          if (Math.random() < 0.25) drops.push({ id: "heavenly_sphere", n: 1 });
        }
      } catch (e) {}
      // gear follows the BOSS's level, but never above the delve's tier cap:
      // dragon tier from level 110+ bosses (the ancient horrors) at floor
      // 11+, oblivion from hell warlords — never from shops or open loot,
      // and on the surface never above the floor-gate (floors 1-4 steel,
      // 5-10 mythril band, 11+ dragon band), whatever the boss's level
      const blv = (mob && mob.lv) || 1;
      let hellBoss = false;
      try { hellBoss = !!(window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()); } catch (e) {}
      const bgate = hellBoss ? { mid: true, top: true } : surfFloorGate(p);
      const bcap = hellBoss ? Math.max(2, gearTierCap(true, depth)) : (bgate.top ? 5 : bgate.mid ? 4 : 2);
      let bTier = Math.min(tierForLevel(blv, 0, depth), bcap);
      if (blv >= 110 && !hellBoss && bgate.top) bTier = Math.max(bTier, 5); // ancient horrors hoard dragon-tier steel
      const tier = EQUIP_BY_TIER[bTier];
      let pool = tier.filter(id => !(HYBRIDS.includes(id) || LEGENDARIES.includes(id)));
      if (!pool.length) pool = tier;
      drops.push({ id: pool[(Math.random() * pool.length) | 0], n: 1 });
      if (hellBoss && blv >= 115) {
        // hell warlords hoard oblivion-tier steel — and often a legend
        drops.push({ id: EQUIP_BY_TIER[6][(Math.random() * EQUIP_BY_TIER[6].length) | 0], n: 1 });
        if (Math.random() < 0.4) { const _lp = LEGENDARIES.filter(id => !isDawnstone(id)); drops.push({ id: _lp[(Math.random() * _lp.length) | 0], n: 1 }); }
      } else if (blv >= 115 && bgate.top) {
        // ancient bosses always hoard dragon-tier steel — and often a legend
        drops.push({ id: EQUIP_BY_TIER[5][(Math.random() * EQUIP_BY_TIER[5].length) | 0], n: 1 });
        if (Math.random() < 0.4) { const _lp2 = LEGENDARIES.filter(id => !isDawnstone(id)); drops.push({ id: _lp2[(Math.random() * _lp2.length) | 0], n: 1 }); }
      } else {
        // lesser bosses can drop the good stuff, gated by their own level —
        // and by the surface floor-gates (no mythril band before floor 5,
        // no dragon band before floor 11, even for bosses)
        const hyA = HYBRIDS.filter(h => surfGateAllows(h, bgate) && !isDawnstone(h) && !isHellOnly(h));
        if (blv >= 40 && Math.random() < 0.3 && hyA.length) drops.push({ id: hyA[(Math.random() * hyA.length) | 0], n: 1 });
        const lgA = (bgate.top ? LEGENDARIES : bgate.mid ? LEGENDARIES.filter(id => SURF_FLOOR5_GEAR.includes(id)) : []).filter(id => !isDawnstone(id));
        if (blv >= 80 && Math.random() < 0.18 && lgA.length) drops.push({ id: lgA[(Math.random() * lgA.length) | 0], n: 1 });
      }
      drops.push({ id: "potion", n: 2 });
    } else {
      if (r < 0.10 + lukB) drops.push({ id: "herb", n: 1 });
      else if (r < 0.14 + lukB) drops.push({ id: ["sage_herb", "cinder_herb", "calm_herb", "bright_herb"][(Math.random() * 4) | 0], n: 1 });
      else if (r < 0.18 + lukB) drops.push({ id: Math.random() < 0.7 ? "arrow_iron" : "arrow_poison", n: 1 + ((Math.random() * 3) | 0) });
      else if (r < 0.21 + lukB) drops.push({ id: "potion", n: 1 });
      else if (r < 0.24 + lukB) {
        const unk = unknownTomes(p).filter(id => !isCataTome(id));
        if (unk.length) drops.push({ id: unk[(Math.random() * unk.length) | 0], n: 1 });
      }
      // tough wilds can drop real gear: tier follows the victim's level but
      // never above the location cap (overworld stops at steel; surface
      // delves gate by floor — 1-4 steel, 5-10 mythril band, 11+ dragon)
      let depth = lootDepth(0);
      const mobLv = (mob && mob.lv) || (p && p.lv) || 1;
      const eqP = 0.05 + Math.min(0.2, mobLv * 0.015) + lukB;
      if (Math.random() < eqP) {
        const fake = { lv: mobLv };
        const inDun = !!(p && p.inDungeon);
        let ncap = 2;
        if (inDun) {
          let isHell = false;
          try { isHell = !!(window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()); } catch (e) { }
          if (isHell) ncap = gearTierCap(true, depth);
          else { const ng = surfFloorGate(p); ncap = ng.top ? 5 : ng.mid ? 4 : 2; }
        }
        const tier = EQUIP_BY_TIER[randomEquipTier(fake, null, depth, ncap)];
        let pool = tier.filter(id => !(HYBRIDS.includes(id) || LEGENDARIES.includes(id)));
        if (!pool.length) pool = tier;
        drops.push({ id: pool[(Math.random() * pool.length) | 0], n: 1 });
      }
      if (/goblin|wolf|minotaur|centaur|tanuki|satyr|kobold|leshy|fenrir|kelpie/i.test(mob.kind) && Math.random() < 0.08) drops.push({ id: "wood", n: 1 });
      if (/goblin|kobold|redcap/i.test(mob.kind) && Math.random() < 0.06) drops.push({ id: "torch", n: 1 });
      // Brigands shoot back: archers drop plain shafts, murderers poisoned ones.
      // Seasoned brigands (lv20+) carry steel; killers sometimes pack iron stars.
      if (/^(bandit|outlaw|tengu_crow|stymphalian|harpy)$/.test(mob.kind || "") && Math.random() < 0.3) drops.push({ id: (mobLv >= 20 && Math.random() < 0.4) ? "arrow_steel" : "arrow_iron", n: 2 + ((Math.random() * 4) | 0) });
      if (/^(murderer|naga|gorgon_spawn)$/.test(mob.kind || "") && Math.random() < 0.3) drops.push({ id: "arrow_poison", n: 2 + ((Math.random() * 3) | 0) });
      if (/^(murderer|tengu_crow)$/.test(mob.kind || "") && Math.random() < 0.25) drops.push({ id: "shuriken_iron", n: 2 + ((Math.random() * 4) | 0) });
      // ---- raw forge stock from corpses (kind-based) ----
      // The rare bits only fall once dungeon bosses have: gems need a boss
      // of 10+, mythril + elemental hearts 35+, unicorn/yggdrasil 50+.
      // Dragon bone/horn need no gate — only dragons carry them anyway.
      try {
        const k = String(mob.kind || "");
        const R = Math.random;
        const matOk = (id) => !matLocked(p, id);
        // surface floor-gate for corpse mats (hell delves always open):
        // mythril/emerald/frostwood need floor 5+, dragonbone/yggdrasil/
        // dragon-horn floor 11+ — overworld corpses never pay them.
        const ngate = surfFloorGate(p);
        // dragons + drakes: bone + horn (the only source — never shops/chests).
        // Deep-dark stock only: dragonbone is high-tier forge material, so on
        // the surface it flows ONLY from delve floor 11+ (even boss dragons
        // and overworld kills pay nothing anywhere else). Hell keeps its own
        // depth rule below.
        // A fledgling torched on level 1 leaves no dragonbone behind; boss
        // dragons and overworld dragons pay nothing on the surface — the
        // floor-11+ delve kill is the only source.
        if (/peak_dragon|lesser_wyvern|wyvern_fledgling|wyvern_matriarch|hydra_spawn|hydra_broodmother|lindworm/i.test(k)) {
          let hellDn = false;
          try { hellDn = !!(window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()); } catch (e) { }
          const eff = hellDn ? lootDepth(0) : 0;
          const inDun = hellDn ? !!(p && p.inDungeon) : true;
          const bossMob = hellDn ? !!(mob && mob.isBoss) : false;
          if (hellDn ? (!inDun || bossMob || eff >= 6) : ngate.top) {
            drops.push({ id: "dragon_bone", n: 1 + ((R() * 2) | 0) });
            if (R() < 0.7) drops.push({ id: "dragon_horn", n: 1 });
          }
        }
        // winter hunters: rime + frostwood (frostwood needs floor 5+)
        if (/yeti|rime_wolf|shiver_owl|yuki_onna|jotunn_jarl/i.test(k)) {
          if (matOk("rime_crystal") && R() < 0.5) drops.push({ id: "rime_crystal", n: 1 });
          if (ngate.mid && R() < 0.3) drops.push({ id: "frostwood_log", n: 1 });
        }
        // volcano apex: phoenix ember + emberwood
        if (/phoenix|chimera_cub|sobek_spawn|oni_imp|magma_eel|cinder_maw|cinder_steed|magma_tortoise/i.test(k) && R() < 0.35) {
          if (matOk("ember_core") && (/phoenix/i.test(k) || R() < 0.3)) drops.push({ id: "ember_core", n: 1 });
          if (R() < 0.4) drops.push({ id: "emberwood_log", n: 1 });
        }
        // sky hunters: storm feathers
        if (/tengu|valkyrie|harpy|stymphalian|siren|shiver_owl/i.test(k) && matOk("storm_feather") && R() < 0.4) drops.push({ id: "storm_feather", n: 1 });
        // deep-water hunters: tide pearls
        if (/coral_crab|abyss_serpent|kelpie|nokk|kappa|sobek_spawn|vodyanoy|rusalka|tide_turtle|tidecaller|deepmaw|mire_lurker|wreck_eel/i.test(k) && matOk("tide_pearl") && R() < 0.4) drops.push({ id: "tide_pearl", n: 1 });
        // crypt saints + undead: silver + blessed beads
        if (/skeleton|draugr|mummy|striga|dullahan|jiangshi|gasha|wraith|banshee|utukku/i.test(k)) {
          if (R() < 0.3) drops.push({ id: "silver_ore", n: 1 });
          if (matOk("holy_bead") && R() < 0.18) drops.push({ id: "holy_bead", n: 1 });
        }
        // beasts: hides for leather, bows, plate straps
        if (/wolf|fenrir|anubite|sandmaw|centaur|satyr|tanuki|minotaur|chimera|lamassu|umbral_stag|velociraptor|sphinx_cub|wild_horse|tide_turtle|cinder_steed|cinder_maw|mire_lurker|magma_tortoise|burrow_mole/i.test(k) && R() < 0.45) drops.push({ id: "wolf_hide", n: 1 + ((R() * 2) | 0) });
        // fey-shy magic: unicorn hair (vale's rarest bowstring)
        if (/kitsune|gloomspinner|umbral_stag|hulder|puca|lamassu/i.test(k) && matOk("unicorn_hair") && R() < 0.2) drops.push({ id: "unicorn_hair", n: 1 });
        // delvers + goblinoids: iron, stone, old gems (emeralds need floor 5+)
        if (/goblin|kobold|redcap|nurikabe|troll|domovoi|khepri|scarab|nurikabe|oni|bandit|outlaw|murderer|burrow_mole/i.test(k)) {
          if (R() < 0.3) drops.push({ id: "iron_ore", n: 1 + ((R() * 2) | 0) });
          if (R() < 0.2) drops.push({ id: "stone", n: 1 + ((R() * 2) | 0) });
          if (matOk("ruby_gem") && R() < 0.06) {
            const dpool = (ngate.mid && matOk("emerald_gem")) ? ["ruby_gem", "sapphire_gem", "emerald_gem"] : ["ruby_gem", "sapphire_gem"];
            drops.push({ id: dpool[(R() * dpool.length) | 0], n: 1 });
          }
        }
        // old-forest wardens sometimes carry the world-tree's kin (floor 11+)
        if (/leshy|satyr|tanuki|puca/i.test(k) && matOk("yggdrasil_branch") && ngate.top && R() < 0.08) drops.push({ id: "yggdrasil_branch", n: 1 });
      } catch (e) { }
    }
    // boss dragons always leave their bones behind (plus the horn, usually) —
    // on the surface ONLY from delve floor 11+ (never overworld, never
    // shallow floors, even for bosses); hell keeps its own depth rule.
    try {
      if (mob.isBoss && /peak_dragon|wyvern_matriarch|hydra_broodmother|lindworm|lesser_wyvern/i.test(String(mob.kind || mob.name || ""))) {
        const effB = lootDepth(0);
        let hellDn = false;
        try { hellDn = !!(window.Hell && window.Hell.isHellDungeonActive && window.Hell.isHellDungeonActive()); } catch (e) { }
        if (hellDn ? (!(p && p.inDungeon) || effB >= 6) : surfFloorGate(p).top) {
          drops.push({ id: "dragon_bone", n: 2 });
          if (Math.random() < 0.8) drops.push({ id: "dragon_horn", n: 1 });
        }
      }
    } catch (e) { }
    // guild fetch contracts: source beasts minted near the gathering grounds
    // carry a questFetch tag — raiding one always pays one of the contracted
    // goods (while the contract still needs it), so the goods are genuinely
    // retrievable instead of a drop-rate lottery. Bounded: tags are only
    // minted against the remaining need (see Guild.topUpContracts).
    try {
      if (mob && mob.questFetch && mob.questGuild && window.Guild && window.Guild.ensure) {
        const gp = window.Game && window.Game.G && window.Game.G.player;
        const gq = gp && window.Guild.ensure(gp);
        const aq = gq && (gq.active || []).find(q => q && q.gid === mob.questGuild && q.status === "active" && q.kind === "fetch" && q.itemId === mob.questFetch);
        if (aq && (countItem(p, mob.questFetch) | 0) < (aq.need | 0) && surfGateAllows(mob.questFetch, surfFloorGate(p))) drops.push({ id: mob.questFetch, n: 1 });
      }
    } catch (e) { }
    for (const d of drops) addItem(p, d.id, d.n);
    return drops;
  }
  // ---- party-member loadouts (personal pack + worn gear, separate from shop stock) ----
  // NPC stat blocks mutate maxHp/atk/etc directly, so snapshot the gear-free base
  // once and re-derive on every change. Player objects must NOT come through here
  // (they use Entities.ensureProgression + recalcDerived instead).
  function ensureNpcLoadout(npc) {
    if (!npc || npc.kind === "player" || npc === (window.Game && window.Game.G && window.Game.G.player)) return npc;
    if (!Array.isArray(npc.inventory)) npc.inventory = [];
    if (!npc.equipment || typeof npc.equipment !== "object") npc.equipment = { weapon: null, armor: null, trinket: null, shield: null };
    else for (const s of ["weapon", "armor", "trinket", "shield"]) if (!(s in npc.equipment)) npc.equipment[s] = null;
    // per-copy identity piggybacks on every pack (v235): sanitize, never drop
    try {
      if (!npc.equipmentUp || typeof npc.equipmentUp !== "object") npc.equipmentUp = {};
      if (!npc.equipmentNick || typeof npc.equipmentNick !== "object") npc.equipmentNick = {};
      for (const s of ["weapon", "armor", "trinket", "shield"]) {
        npc.equipmentUp[s] = clampUp(npc.equipmentUp[s]);
        npc.equipmentNick[s] = normNick(npc.equipmentNick[s]);
      }
      for (const s of (npc.inventory || [])) {
        if (!s || typeof s !== "object") continue;
        if ((s.up | 0) > 0 || s.nick) { s.up = stackUp(s); s.nick = stackNick(s); if (!(s.up > 0)) delete s.up; if (!s.nick) delete s.nick; }
      }
    } catch (e) { }
    if (!Array.isArray(npc.disabledAbilities)) npc.disabledAbilities = [];
    // retired Slash + Quick Shot never come back (old saves, taught NPCs)
    try {
      if (Array.isArray(npc.abilities)) {
        if (npc.abilities.includes("slash")) npc.abilities = npc.abilities.filter(a => a !== "slash");
        if (npc.abilities.includes("quickshot")) npc.abilities = npc.abilities.filter(a => a !== "quickshot");
      }
      if (Array.isArray(npc.disabledAbilities)) npc.disabledAbilities = npc.disabledAbilities.filter(a => a !== "slash" && a !== "quickshot");
      if (Array.isArray(npc.hotbar)) for (let i = 0; i < npc.hotbar.length; i++) {
        const s = npc.hotbar[i];
        if (s && s.kind === "ability" && (s.id === "slash" || s.id === "quickshot")) npc.hotbar[i] = null;
      }
    } catch (e) { }
    try { ensureNpcBlade(npc); } catch (e) { }
    try { ensureNpcArcher(npc); } catch (e) { }
    if (npc.baseMaxHp == null) {
      const b = npcBonus(npc);
      npc.baseMaxHp = (npc.maxHp | 0) - (b.maxHp || 0);
      npc.baseMaxMp = (npc.maxMp | 0) - (b.maxMp || 0);
      npc.baseAtk = (npc.atk | 0) - (b.atk || 0);
      npc.baseMatk = ((npc.matk != null ? npc.matk : npc.atk) | 0) - (b.matk || 0);
      npc.baseDef = (npc.def | 0) - (b.def || 0);
      npc.baseSpd = (typeof npc.spd === "number" ? npc.spd : 3) - (b.spd || 0);
    }
    // old saves predate MATK: mirror ATK so their spells hit as before
    try { if (typeof npc.matk !== "number" && typeof npc.atk === "number") npc.matk = npc.atk; } catch (e) { }
    try { if (typeof npc.baseMatk !== "number" && typeof npc.baseAtk === "number") npc.baseMatk = npc.baseAtk; } catch (e) { }
    recalcNpc(npc);
    return npc;
  }
  // ---- every NPC's own blade (replaces the old slash spell) ----
  // If they own no weapon at all — worn, packed or in shop stock — they get a
  // humble level-fit blade in their pack and wield it. Runs inside
  // ensureNpcLoadout, so it backfills old saves the same way.
  function npcHasWeapon(npc) {
    try {
      const eq = npc.equipment && npc.equipment.weapon;
      const eit = eq && ITEMS[eq];
      if (eit && eit.type === "equipment" && eit.slot === "weapon") return true;
      const has = (arr) => (arr || []).some(s => {
        const it = s && ITEMS[s.id];
        return it && it.type === "equipment" && it.slot === "weapon";
      });
      if (has(npc.inventory)) return true;
      if (has(npc.stock)) return true;
    } catch (e) { }
    return false;
  }
  function ensureNpcBlade(npc) {
    if (!npc || npc.kind === "player" || npc.role === "mob") return npc;
    if (npcHasWeapon(npc)) return npc;
    // humble level-fit blade: a new tier about every 20 levels (never dragon)
    const lv = npc.lv || 1;
    const id = lv >= 80 ? "mythril_sword" : lv >= 40 ? "steel_sword" : lv >= 20 ? "iron_sword" : lv >= 3 ? "rusted_sword" : "wooden_sword";
    try {
      addItem(npc, id, 1);
      npc.equipment = npc.equipment || { weapon: null, armor: null, trinket: null };
      if (!npc.equipment.weapon) npc.equipment.weapon = id;
    } catch (e) { }
    return npc;
  }
  // ---- archers loose real arrows now that Quick Shot is gone ----
  // Hunter/rogue/samurai/adventurer roles fight at range: a level-fit bow
  // wielded plus a quiver in the pack. Idempotent — only fills gaps, so old
  // saves backfill the same way (their blade stays packed for a re-equip).
  const ARCHER_ROLES = ["hunter", "rogue", "samurai", "adventurer"];
  function npcHasBow(npc) {
    try {
      const eq = npc.equipment && npc.equipment.weapon;
      const eit = eq && ITEMS[eq];
      if (eit && eit.bow) return true;
      const has = (arr) => (arr || []).some(s => { const it = s && ITEMS[s.id]; return it && it.bow; });
      if (has(npc.inventory)) return true;
      if (has(npc.stock)) return true;
    } catch (e) { }
    return false;
  }
  function npcArrowCount(npc) {
    try {
      let n = 0;
      for (const arr of [npc.inventory, npc.stock]) for (const s of (arr || [])) {
        const it = s && ITEMS[s.id];
        if (it && it.type === "ammo") n += s.n | 0;
      }
      return n;
    } catch (e) { return 0; }
  }
  function ensureNpcArcher(npc) {
    if (!npc || npc.kind === "player" || npc.role === "mob") return npc;
    if (!ARCHER_ROLES.includes(npc.role)) return npc;
    if (!npcHasBow(npc)) {
      const lv = npc.lv || 1;
      const bid = lv >= 80 ? "yggdrasil_bow" : lv >= 40 ? "wardens_bow" : lv >= 20 ? "yew_bow" : lv >= 3 ? "oak_bow" : "old_bow";
      try {
        addItem(npc, bid, 1);
        npc.equipment = npc.equipment || { weapon: null, armor: null, trinket: null };
        npc.equipment.weapon = bid;
      } catch (e) { }
    }
    if (npcArrowCount(npc) < 8) { try { addItem(npc, "arrow_iron", 15); } catch (e) { } }
    return npc;
  }
  function npcBonus(npc) {
    const out = { atk: 0, matk: 0, def: 0, maxHp: 0, maxMp: 0, spd: 0 };
    try {
      if (!npc || !npc.equipment) return out;
      for (const slot of ["weapon", "armor", "trinket", "shield"]) {
        const id = npc.equipment[slot];
        const it = id && ITEMS[id];
        // allies keep the bench-work of gifted gear (worn copy's levels)
        let mult = 1;
        if (slot !== "trinket") {
          try { mult = 1 + clampUp(npc.equipmentUp && npc.equipmentUp[slot]) * GEAR_UP_STEP; } catch (e) { mult = 1; }
        }
        if (it && it.bonus) for (const k of Object.keys(out)) if (it.bonus[k]) out[k] += it.bonus[k] * mult;
      }
    } catch (e) { }
    return out;
  }
  function recalcNpc(npc) {
    if (!npc || npc.baseMaxHp == null) return npc;
    const b = npcBonus(npc);
    npc.maxHp = Math.max(1, Math.round(npc.baseMaxHp + (b.maxHp || 0)));
    npc.maxMp = Math.max(0, Math.round(npc.baseMaxMp + (b.maxMp || 0)));
    npc.atk = Math.max(1, Math.round(npc.baseAtk + (b.atk || 0)));
    npc.matk = Math.max(1, Math.round((npc.baseMatk != null ? npc.baseMatk : npc.baseAtk) + (b.matk || 0)));
    npc.def = Math.max(0, Math.round(npc.baseDef + (b.def || 0)));
    npc.spd = Math.max(1.5, (npc.baseSpd || 3) + (b.spd || 0));
    if (typeof npc.hp === "number") npc.hp = Math.min(npc.maxHp, Math.max(0, npc.hp));
    if (typeof npc.mp === "number") npc.mp = Math.min(npc.maxMp, Math.max(0, npc.mp));
    return npc;
  }
  function npcLevelUp(npc) {
    // shared by Entities.gainXp: the base body climbs the NPC level curve
    // (see makeNpcStatBlock — frontier levels mean real bulk), then gear is
    // re-applied on top so nothing equipped is lost. The level number still
    // climbs for gates even when the body is capped.
    if (!npc) return npc;
    ensureNpcLoadout(npc);
    try {
      const E = window.Entities;
      if (E && E.makeNpcStatBlock) {
        const st = E.makeNpcStatBlock(npc.lv, npc.role, 0);
        if (st) {
          npc.baseMaxHp = Math.max(1, st.maxHp | 0);
          npc.baseMaxMp = Math.max(0, st.maxMp | 0);
          npc.baseAtk = Math.max(1, st.atk | 0);
          npc.baseMatk = Math.max(1, st.matk | 0);
          npc.baseDef = Math.max(0, st.def | 0);
          // no baseSdef: NPC spell defence falls back to DEF + gear
          npc.baseSpd = (typeof st.spd === "number" ? st.spd : 3);
        }
      }
    } catch (e) {}
    recalcNpc(npc);
    return npc;
  }
  function countNpcItem(npc, id) {
    ensureNpcLoadout(npc);
    return countItem(npc, id);
  }
  function equipOnNpc(npc, itemId, variant) {
    ensureNpcLoadout(npc);
    const it = ITEMS[itemId];
    if (!it || it.type !== "equipment") return { ok: false, msg: "Not equipment." };
    const stack = findStack(npc, itemId, variant);
    if (!stack) return { ok: false, msg: `No ${it.name} in their pack.` };
    npc.equipment[it.slot] = itemId;
    setWornVariant(npc, it.slot, stack);
    recalcNpc(npc);
    return { ok: true, msg: `${npc.name} equipped ${variantName(stack)}.` };
  }
  function unequipNpcSlot(npc, slot) {
    ensureNpcLoadout(npc);
    if (!npc.equipment[slot]) return { ok: false, msg: "Nothing equipped." };
    const id = npc.equipment[slot];
    const it = ITEMS[id];
    const wv = wornVariantOf(npc, slot);
    npc.equipment[slot] = null;
    setWornVariant(npc, slot, null);
    recalcNpc(npc);
    return { ok: true, msg: `${npc.name} unequipped ${it ? variantName({ id, up: wv.up, nick: wv.nick }) : slot}.` };
  }
  function giveToNpc(player, npc, id, n = 1, variant) {
    ensureNpcLoadout(npc);
    n = Math.max(1, n | 0);
    const src = findStack(player, id, variant);
    if (!src || countItem(player, id) < n) return { ok: false, msg: `You only have ${countItem(player, id)}×.` };
    if (player.equipment && (player.equipment.weapon === id || player.equipment.armor === id || player.equipment.trinket === id) && countItem(player, id) <= n) {
      // taking their last copy of something you're wearing — allowed, gear stays until unequipped
    }
    const giveUp = stackUp(src), giveNick = stackNick(src);
    if (!removeItem(player, id, n, src)) return { ok: false, msg: "Hmm, that slipped away." };
    addItem(npc, id, n, { up: giveUp, nick: giveNick });
    return { ok: true, msg: `Gave ${n}× ${variantName(src)} to ${npc.name}.` };
  }
  function takeFromNpc(npc, player, id, n = 1, variant) {
    ensureNpcLoadout(npc);
    n = Math.max(1, n | 0);
    if (npc.equipment && (npc.equipment.weapon === id || npc.equipment.armor === id || npc.equipment.trinket === id)) {
      return { ok: false, msg: `${npc.name} is wearing that — unequip it first.` };
    }
    const src = findStack(npc, id, variant);
    if (!src || countItem(npc, id) < n) return { ok: false, msg: `${npc.name} only has ${countItem(npc, id)}×.` };
    const takeUp = stackUp(src), takeNick = stackNick(src);
    if (!removeItem(npc, id, n, src)) return { ok: false, msg: "Hmm, that slipped away." };
    addItem(player, id, n, { up: takeUp, nick: takeNick });
    return { ok: true, msg: `Took ${n}× ${variantName(src)} from ${npc.name}.` };
  }
  function useNpcItem(npc, itemId, variant) {
    ensureNpcLoadout(npc);
    const it = ITEMS[itemId];
    if (!it) return { ok: false, msg: "Unknown item." };
    if (it.type === "equipment") {
      if (npc.equipment[it.slot] === itemId) {
        try {
          // a row stack (or explicit identity) toggles only its own copy;
          // a bare id toggles whatever is worn (legacy binds)
          const exact = !!(variant && typeof variant === "object" && (variant.up != null || variant.nick != null || variant.n != null));
          if (!exact) return unequipNpcSlot(npc, it.slot);
          const wv = wornVariantOf(npc, it.slot);
          if (wv.up === clampUp(variant.up) && wv.nick === normNick(variant.nick)) return unequipNpcSlot(npc, it.slot);
        } catch (e) { }
      }
      return equipOnNpc(npc, itemId, variant);
    }
    if (it.type === "spellbook") {
      if ((npc.abilities || []).includes(it.teaches)) return { ok: false, msg: `${npc.name} already knows ${window.CFG.ABILITIES[it.teaches].name}.` };
      if (countItem(npc, itemId) < 1) return { ok: false, msg: `No ${it.name} in their pack.` };
      removeItem(npc, itemId, 1);
      npc.abilities = npc.abilities || [];
      npc.abilities.push(it.teaches);
      npc.disabledAbilities = (npc.disabledAbilities || []).filter(a => a !== it.teaches);
      return { ok: true, msg: `📖 ${npc.name} learned ${window.CFG.ABILITIES[it.teaches].name}!` };
    }
    if (countItem(npc, itemId) < 1) return { ok: false, msg: `No ${it.name} in their pack.` };
    if (it.type === "ammo") return { ok: false, msg: "Arrows are fired with a bow in battle, not from the party panel." };
    if (it.type === "material") {
      if (itemId === "herb") {
        removeItem(npc, itemId, 1);
        npc.hp = Math.min(npc.maxHp, npc.hp + Math.round(npc.maxHp * 0.15));
        return { ok: true, msg: `🌿 ${npc.name} chewed an herb (+15% HP).` };
      }
      if (it.usable && it.cure) {
        const had = window.Status ? window.Status.list(npc) : [];
        if (!it.cure.some(t => had.includes(t))) return { ok: false, msg: `${npc.name} has no ${it.cure.join("/")} to cure.` };
        removeItem(npc, itemId, 1);
        let cured = [];
        try { if (window.Status) { for (const t of it.cure) if (window.Status.cure(npc, t)) cured.push(t); } } catch (e) { }
        if (it.herbHealPct) npc.hp = Math.min(npc.maxHp, npc.hp + Math.round(npc.maxHp * it.herbHealPct));
        return { ok: true, msg: `${npc.name} cured ${cured.join(", ")}!` };
      }
      return { ok: false, msg: `${it.name} is crafting material.` };
    }
    if (it.type === "consumable") {
      if (it.use.cure) {
        const had = window.Status ? window.Status.list(npc) : [];
        if (!it.use.cure.some(t => had.includes(t)) && !(it.use.hpPct && npc.hp < npc.maxHp)) return { ok: false, msg: `${npc.name} needs no such cure.` };
        removeItem(npc, itemId, 1);
        let cured = [];
        try { if (window.Status) { for (const t of it.use.cure) if (window.Status.cure(npc, t)) cured.push(t); } } catch (e) { }
        if (it.use.hpPct) npc.hp = Math.min(npc.maxHp, npc.hp + Math.round(npc.maxHp * it.use.hpPct));
        try { window.Game.addFloatText(npc.x ?? npc.gx, npc.y ?? npc.gy, cured.length ? "cured!" : "+hp", "#5dd68a"); } catch (e) { }
        return { ok: true, msg: `${npc.name} ${cured.length ? "cured " + cured.join(", ") + "!" : "feels better."}` };
      }
      if (it.use.hpPct) {
        if (npc.hp >= npc.maxHp) return { ok: false, msg: `${npc.name} is already at full HP.` };
        removeItem(npc, itemId, 1);
        npc.hp = Math.min(npc.maxHp, npc.hp + Math.round(npc.maxHp * it.use.hpPct));
        try { window.Game.addFloatText(npc.x ?? npc.gx, npc.y ?? npc.gy, "+" + Math.round(npc.maxHp * it.use.hpPct), "#5dd68a"); } catch (e) { }
        return { ok: true, msg: `${npc.name} quaffed ${it.name}.` };
      }
      if (it.use.mpPct) {
        if (npc.mp >= npc.maxMp) return { ok: false, msg: `${npc.name} already has full MP.` };
        removeItem(npc, itemId, 1);
        npc.mp = Math.min(npc.maxMp, npc.mp + Math.round(npc.maxMp * it.use.mpPct));
        return { ok: true, msg: `${npc.name} quaffed ${it.name}.` };
      }
      if (it.use.bomb) return { ok: false, msg: "Bombs are thrown in battle, not from the party panel." };
      if (it.use.smoke || it.use.shuriken) return { ok: false, msg: "Thrown in battle, not from the party panel." };
    }
    return { ok: false, msg: "Nothing happens." };
  }
  // Teach a party member a spell using a tome from YOUR pack (consumes your tome).
  function teachNpcFromPlayer(player, npc, tomeId) {
    ensureNpcLoadout(npc);
    const it = ITEMS[tomeId];
    if (!it || it.type !== "spellbook") return { ok: false, msg: "Not a spellbook." };
    if ((npc.abilities || []).includes(it.teaches)) return { ok: false, msg: `${npc.name} already knows ${window.CFG.ABILITIES[it.teaches].name}.` };
    if (countItem(player, tomeId) < 1) return { ok: false, msg: `You don't have ${it.name}.` };
    removeItem(player, tomeId, 1);
    npc.abilities = npc.abilities || [];
    npc.abilities.push(it.teaches);
    npc.disabledAbilities = (npc.disabledAbilities || []).filter(a => a !== it.teaches);
    return { ok: true, msg: `📖 ${npc.name} learned ${window.CFG.ABILITIES[it.teaches].name}!` };
  }
  function setNpcAbilityEnabled(npc, abId, enabled) {
    ensureNpcLoadout(npc);
    npc.disabledAbilities = npc.disabledAbilities || [];
    if (enabled) npc.disabledAbilities = npc.disabledAbilities.filter(a => a !== abId);
    else if (!npc.disabledAbilities.includes(abId) && (npc.abilities || []).includes(abId)) npc.disabledAbilities.push(abId);
    return npc.disabledAbilities;
  }
  function npcAbilityEnabled(npc, abId) {
    try { return !((npc && npc.disabledAbilities) || []).includes(abId); } catch (e) { return true; }
  }
  // Attack-slot authority (player only): the normal attack (attack button,
  // mouse click / hold, empty Space) uses ONLY the player's default weapon slot
  // (p.defaultWeaponSlot, chosen in 🎒 Inventory, 0 = slot 1). -1 = "No slot":
  // the player chose unarmed, so the attack always uses bare fists. The default slot
  // may hold a weapon OR a spell: weapons swing/fire, spells cast. Spells become
  // the default ONLY from 🎒 Inventory (bind to the ⚔️ slot or its ⚔️ Default
  // button) — pressing a spell hotkey in-world only casts it, never moves the
  // default. equipment.weapon is kept in sync with that slot for weapon
  // defaults; a spell (or empty) default unwields to bare fists (wand/staff
  // item bonuses still apply from hotbar order). Other weapon slots never
  // leak into the attack. Empty/non-weapon default slot => bare fists.
  // Any in-world press of a weapon hotkey makes that slot the default first.
  function getDefaultWeaponSlot(p) {
    try {
      if (!p || !Array.isArray(p.hotbar) || !p.hotbar.length) return 0;
      if (p.defaultWeaponSlot == null) return 0;
      if (Number(p.defaultWeaponSlot) === -1) return -1;
      let d = p.defaultWeaponSlot | 0;
      if (!(d >= 0) || d >= p.hotbar.length) d = 0;
      return d;
    } catch (e) { return 0; }
  }
  function setDefaultWeaponSlot(p, i, quiet) {
    try {
      if (!p || p.kind !== "player" || !Array.isArray(p.hotbar) || !p.hotbar.length) return 0;
      if (i === -1 || i === "none") {
        p.defaultWeaponSlot = -1;
        if (!quiet) syncPlayerAttackWeapon(p);
        return -1;
      }
      let d = (i | 0);
      if (!(d >= 0) || d >= p.hotbar.length) d = 0;
      p.defaultWeaponSlot = d;
      if (!quiet) syncPlayerAttackWeapon(p);
      return d;
    } catch (e) { return 0; }
  }
  function syncPlayerAttackWeapon(p) {
    try {
      if (!p || p.kind !== "player" || !Array.isArray(p.hotbar)) return;
      // temporary side-slot swings suspend the authority while swapped
      if (p._suspendAttackSync) return;
      const s0 = p.hotbar[getDefaultWeaponSlot(p)];
      let want = null, wantV = { up: 0, nick: "" };
      if (s0 && s0.kind === "item" && s0.id) {
        const it = ITEMS[s0.id];
        if (it && it.type === "equipment" && it.slot === "weapon") {
          try {
            // bound copies carry their identity; old binds match the worn copy
            let stack = null;
            if ((s0.up | 0) > 0 || s0.nick) stack = findStack(p, s0.id, s0);
            if (stack) { want = s0.id; wantV = { up: stackUp(stack), nick: stackNick(stack) }; }
            else if (countItem(p, s0.id) >= 1 || (p.equipment && p.equipment.weapon === s0.id)) {
              want = s0.id;
              if (p.equipment && p.equipment.weapon === s0.id) wantV = wornVariantOf(p, "weapon");
              else { const fst = findStack(p, s0.id, null); if (fst) wantV = { up: stackUp(fst), nick: stackNick(fst) }; }
            }
          } catch (e) { want = s0.id; }
        }
      }
      p.equipment = p.equipment || { weapon: null, armor: null, trinket: null };
      if ((p.equipment.weapon || null) !== want) {
        p.equipment.weapon = want;
        setWornVariant(p, "weapon", want ? wantV : null);
        try { if (window.Entities && window.Entities.recalcDerived) window.Entities.recalcDerived(p, true); } catch (e) {}
        // silent wield/unwield (hotkey, bind dropdown, trade, load) proves the
        // tutorial lessons too — Items.equip/unequip events never fire here, so
        // without this a silently wielded blade sticks the equip lesson forever
        // (equip() early-returns "Already equipped" once it is worn)
        try {
          if (p && p.kind === "player" && window.Quests && window.Quests.onTutorialEvent) {
            window.Quests.onTutorialEvent(want ? "equip:weapon" : "unequip:weapon");
          }
        } catch (e2) {}
      } else if (want) {
        // same blade, but the bound COPY may differ (renamed twin in the slot)
        try {
          const wv = wornVariantOf(p, "weapon");
          if (wv.up !== wantV.up || wv.nick !== wantV.nick) {
            setWornVariant(p, "weapon", wantV);
            try { if (window.Entities && window.Entities.recalcDerived) window.Entities.recalcDerived(p, true); } catch (e) {}
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  return {
    ITEMS, TOMES, CRAFTS, EQUIP_BY_TIER, HYBRIDS, LEGENDARIES, WEAPON_MATS, WTYPES,
    CATA_TOMES, isCataTome, unknownCataTomes,
    countItem, addItem, removeItem, dropItem, utilityClass, UTILITY_CLASS, bindable, learnSpell, readTome,
    equip, unequip, isEquipped, useItem, craft, priceMult, syncPlayerAttackWeapon, getDefaultWeaponSlot, setDefaultWeaponSlot, getOffhandSlot, setOffhandSlot, firstFreeHotbarSlot, isShieldItem, SHURIKEN_ORDER, bestShuriken,
    GEAR_UP_MAX, GEAR_UP_STEP, GEAR_UP_PCT, gearUpLevel, gearUpMult, gearUpgradeVenue, gearUpgradeStats, gearBasePrice, gearUpgradeCost, gearUpgradeCostFor, doGearUpgrade, renameGear,
    clampUp, normNick, stackUp, stackNick, stackKey, sameVariant, variantName, findStack, countVariant, wornVariantOf, setWornVariant, hotbarBindMatches, relinkBinds, noStackLeft, gearStackMult, gearSlotLevel, gearSlotMult,
    lootChest, mobDrop, unknownTomes, ensureMasterLoot,
    ensureNpcLoadout, npcBonus, recalcNpc, npcLevelUp, countNpcItem,
    ensureNpcBlade, npcHasWeapon, ensureNpcArcher,
    equipOnNpc, unequipNpcSlot, giveToNpc, takeFromNpc, useNpcItem,
    teachNpcFromPlayer, setNpcAbilityEnabled, npcAbilityEnabled,
    isUndead, isDemon, isUnholy, abilityElement, wandFocus, staffFocus, wandManaMult, staffPowerMult,
    ringMult, mercyWorn, equippedWeapon, meleeWeapon, meleeStats, swingFx, dmgTypeMult, elemMult, PHYS_BY_BODY, ELEM_BY_BODY, PHYS_BY_KIND, ELEM_BY_KIND, meleeMult,
    unholyWard, wardForId,
    bowStats, bowMult, arrowElement, armorResist, armorClass, armorClassFor, describeFocus, tierForLevel, randomEquipTier, gearTierCap, hybridTier, matNeedBossLv, matLocked,
    attackCadence, famDmgMult, weaponTierMult,
    SURF_FLOOR5_GEAR, SURF_FLOOR5_MATS, SURF_FLOOR11_GEAR, SURF_FLOOR11_MATS, SURF_GATED_ALL, isSurfGated, surfFloorGate, surfGateAllows,
    HELL_ONLY, DAWNSTONE_ALL, isHellOnly, isDawnstone, lootHint,
  };
})();
