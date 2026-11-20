/* Appearance: hero/villager look customization. window.Appearance
   Pure data + validation, no dependencies. Sprites reads it optionally.
   Appearance shape (full keys, used on entities + saves):
     { skin, hairStyle, hairColor, eyeColor, outfit, accessory, race }
   - skin/hairColor/eyeColor: "#rrggbb" hex (skin = fur/scales/plumage for beasts)
   - hairStyle: short|long|bald|ponytail|mohawk|buns (mane/crest for beasts)
   - outfit: an NPC role id whose visuals the hero borrows, or "adventurer"
   - accessory: none|glasses|beard|scar|earring|circlet
   - race: human|werewolf|grenouille|kinnatma|quansalbar|usaghito
   Over the wire we use short keys {sk,hs,hc,ec,of,ac,ra} to save bytes. */
window.Appearance = (() => {
  const SKINS = ["#f2c89b", "#d9a06b", "#a06b42", "#f7d7b0", "#8a5a3a", "#5a3a26"];
  const HAIR_COLORS = ["#2e2e2e", "#6b4226", "#d9c27f", "#a03a2e", "#4a4a5a", "#e8e4d8", "#7a2b8f", "#2f6b3a"];
  const EYE_COLORS = ["#111111", "#3a2a1a", "#2a4a6a", "#2f6b3a", "#6a3a6a", "#7a1f1f"];
  const HAIR_STYLES = ["short", "long", "bald", "ponytail", "mohawk", "buns"];
  const ACCESSORIES = ["none", "glasses", "beard", "scar", "earring", "circlet"];
  // Playable races. Bonuses use short stat keys (str/end/agi/int/cha/luk).
  const RACES = ["human", "werewolf", "grenouille", "kinnatma", "quansalbar", "usaghito"];
  const RACE_LABEL = { human: "Human", werewolf: "Werewolf", grenouille: "Grenouille", kinnatma: "Kinnatma", quansalbar: "Quansalbar", usaghito: "Usaghito" };
  const RACE_ICON = { human: "🧑", werewolf: "🐺", grenouille: "🐸", kinnatma: "🦅", quansalbar: "🦐", usaghito: "🐰" };
  const RACE_ABILITY = {
    human: "Collective Immunity — every 10s, 50% chance to cleanse ALL status conditions from you and nearby allied players and pass them to a nearby enemy.",
    werewolf: "Blood Fury — while HP is below 50%, +30% movement speed, stamina regen and ATK.",
    grenouille: "Bog Hunter — +25% damage to slowed targets. Hitting a slowed foe with a spell grants +30% movement speed for 3s.",
    kinnatma: "Spirit Mend — every 3s, a separate 50% chance each to restore 10% of max HP, stamina and mana.",
    quansalbar: "Shellblitz — unarmed attacks strike twice as fast and ignore the attack-speed floor.",
    usaghito: "Lucky Chorus — nearby party members, tamed beasts and allied players share your Luck bonuses (best singer only, does not stack). Charm voice: they also gain +1 ATK, DEF, SDEF and MATK per point of your Charm (best Charm singer only; Luck and Charm tracked separately; also buffs yourself).",
  };
  const RACE_DESC = {
    human: "+1 all stats. Versatile and ambitious. Collective Immunity — every 10s, 50% chance to cleanse ALL statuses from you and nearby allied players and give them to a nearby enemy.",
    werewolf: "+4 Strength, +3 Agility. Nightdwellers with keen claws. Blood Fury — below 50% HP: +30% move speed, stamina regen and ATK.",
    grenouille: "+4 Intellect, +3 Agility. Half-frog spies — slippery and quick. Bog Hunter — +25% damage to slowed targets; spell hits on slowed foes grant +30% speed for 3s.",
    kinnatma: "+4 Strength, +3 Fortitude. Half-spirit bird martial artists. Spirit Mend — every 3s, a separate 50% chance each to restore 10% HP, stamina and mana.",
    quansalbar: "+4 Fortitude, +3 Endurance. Mantis-shrimp shellpunchers — armored clubs, blunt and unhurried. Shellblitz — unarmed attacks hit 2x as fast, ignoring the speed floor.",
    usaghito: "+4 Charm, +3 Luck. Bunny folk — quick-footed, silver-tongued, hard to pin down. Lucky Chorus — nearby allies share your Luck bonuses and gain +1 ATK/DEF/SDEF/MATK per point of your Charm (each voice best-singer-only, no stacking).",
  };
  const RACE_BONUS = {
    human: { str: 1, end: 1, agi: 1, int: 1, cha: 1, luk: 1, for: 1 },
    werewolf: { str: 4, agi: 3 },
    grenouille: { int: 4, agi: 3 },
    kinnatma: { str: 4, for: 3 },
    quansalbar: { for: 4, end: 3 },
    usaghito: { cha: 4, luk: 3 },
  };
  // body-label for the creator ("Skin" vs "Fur" ...), and mane-label for hair
  const RACE_BODY_LABEL = { human: "Skin", werewolf: "Fur", grenouille: "Skin", kinnatma: "Plumage", quansalbar: "Shell", usaghito: "Fur" };
  const RACE_HAIR_LABEL = { human: "Hair", werewolf: "Mane", grenouille: "Crest", kinnatma: "Crest", quansalbar: "Antennae", usaghito: "Ears" };
  const HAIR_LABEL = { short: "Short", long: "Long", bald: "Bald", ponytail: "Topknot", mohawk: "Ridge", buns: "Twin tufts" };
  // race-flavored color palettes (rolling + creator defaults)
  const RACE_SKINS = {
    human: SKINS,
    werewolf: ["#2a2a33", "#3a3a48", "#4a4a5a", "#1e1e26", "#5a5a6e", "#6e3a3a"],
    grenouille: ["#3a7a8c", "#2f6b5a", "#4a9a8c", "#5ab0a0", "#2a5a7a", "#6ac0a0"],
    kinnatma: ["#f2e7c9", "#e8d5b0", "#d9c9a8", "#c9b896", "#f7f0dd", "#e8c9a0"],
    quansalbar: ["#c93b3b", "#e06a2e", "#a03a2e", "#7a1f1f", "#d95a4a", "#8a2a2a"],
    usaghito: ["#f2e7e7", "#e8d5d5", "#d9c9c9", "#f7f0f0", "#c9a0a0", "#8a6a6a"],
  };
  const RACE_MANES = {
    human: HAIR_COLORS,
    werewolf: ["#1a1a22", "#2e2e2e", "#4a4a5a", "#6b4226", "#8a8a92", "#a03a2e", "#c9c9d4"],
    grenouille: ["#2f6b5a", "#3a7a8c", "#7ac0a0", "#c9d96a", "#e8e4d8", "#2a5a7a"],
    kinnatma: ["#c93b3b", "#e06a2e", "#e8a93d", "#f2e7c9", "#a03a2e", "#7a1f1f", "#ffd93d"],
    quansalbar: ["#2fd4c0", "#7fd4ff", "#e8a93d", "#c93b3b", "#f2e7c9", "#111111"],
    usaghito: ["#2e2e2e", "#e8e4d8", "#d9a0b8", "#8a5a6a", "#f2c9d4", "#6b4226"],
  };
  const RACE_EYES = {
    human: EYE_COLORS,
    werewolf: ["#c93b3b", "#ff6b3b", "#e8a93d", "#111111", "#7a1f1f", "#e8e4d8"],
    grenouille: ["#111111", "#3a2a1a", "#c9d96a", "#e8a93d", "#2a4a6a"],
    kinnatma: ["#2f6b3a", "#c93b3b", "#111111", "#e8a93d", "#2a4a6a", "#7a1f1f"],
    quansalbar: ["#e8a93d", "#ffd93d", "#c93b3b", "#111111", "#2a4a6a"],
    usaghito: ["#2a4a6a", "#6a9ae8", "#c93b3b", "#111111", "#7a1f1f", "#2f6b3a"],
  };
  // Outfits are NPC role visuals the hero can borrow. "adventurer" = classic hero.
  const OUTFITS = [
    "adventurer", "villager", "guard", "warrior", "samurai", "hunter", "rogue",
    "ninja", "thief",
    "mage", "scholar", "healer", "cleric", "herbalist", "priest", "blacksmith",
    "runesmith", "tidewarden", "merchant", "innkeeper", "bard", "fisher",
    "farmer", "miner",
    "monarch", "noble", "knight", "chancellor", "highpriest", "marshal",
    "guildmaster", "magistrate", "harbormaster", "dockworker",
    "desert_nomad", "steppe_rider", "mesa_shaman", "frost_skald",
  ];
  const OUTFIT_LABEL = {
    adventurer: "Adventurer (classic)", villager: "Villager", guard: "Guard",
    warrior: "Warrior", samurai: "Samurai", hunter: "Hunter", rogue: "Rogue",
    ninja: "Ninja", thief: "Thief",
    mage: "Mage", scholar: "Scholar", healer: "Healer", cleric: "Cleric",
    herbalist: "Herbalist", priest: "Priest", blacksmith: "Blacksmith",
    runesmith: "Runesmith", tidewarden: "Tidewarden", merchant: "Merchant",
    innkeeper: "Innkeeper", bard: "Bard", fisher: "Fisher", farmer: "Farmer",
    miner: "Miner",
    monarch: "Monarch", noble: "Noble", knight: "Knight", chancellor: "Chancellor",
    highpriest: "High Priest", marshal: "Marshal", guildmaster: "Guildmaster",
    magistrate: "Magistrate", harbormaster: "Harbormaster", dockworker: "Dockworker",
    desert_nomad: "Desert Nomad", steppe_rider: "Steppe Rider",
    mesa_shaman: "Mesa Shaman", frost_skald: "Frost Skald",
    dawn_angel: "Dawn Angel", choir_angel: "Choir Angel",
    seraph_guard: "Seraph Guard", scroll_angel: "Scroll Angel",
    angel_guard: "Angel Guard", angel_merchant: "Angel Merchant",
    angel_priest: "Angel Priest", heavendweller: "Heavendweller",
  };
  function isHex(s) { return typeof s === "string" && /^#[0-9a-fA-F]{6}$/.test(s); }
  function pick(arr, fb) {
    if (!Array.isArray(arr) || !arr.length) return fb;
    return arr[(Math.random() * arr.length) | 0];
  }
  function defaultAppearance() {
    return { skin: SKINS[0], hairStyle: "short", hairColor: HAIR_COLORS[0], eyeColor: EYE_COLORS[0], outfit: "adventurer", accessory: "none", race: "human" };
  }
  function rollRace() {
    const r = Math.random();
    return r < 0.60 ? "human" : r < 0.68 ? "werewolf" : r < 0.76 ? "grenouille" : r < 0.84 ? "kinnatma" : r < 0.92 ? "quansalbar" : "usaghito";
  }
  function sanitize(app, fallbackRole) {
    const d = defaultAppearance();
    try {
      if (!app || typeof app !== "object") {
        if (typeof app === "string" && OUTFITS.includes(app)) d.outfit = app;
        else if (fallbackRole && OUTFITS.includes(fallbackRole) && fallbackRole !== "adventurer") d.outfit = fallbackRole;
        return d;
      }
      // accept packed wire keys too
      const g = (k, pk) => (app[k] !== undefined ? app[k] : app[pk]);
      const skin = g("skin", "sk"), hs = g("hairStyle", "hs"), hc = g("hairColor", "hc"),
        ec = g("eyeColor", "ec"), of = g("outfit", "of"), ac = g("accessory", "ac"),
        rc = g("race", "ra");
      return {
        skin: isHex(skin) ? skin : d.skin,
        hairStyle: HAIR_STYLES.includes(hs) ? hs : d.hairStyle,
        hairColor: isHex(hc) ? hc : d.hairColor,
        eyeColor: isHex(ec) ? ec : d.eyeColor,
        outfit: OUTFITS.includes(of) ? of : (OUTFITS.includes(fallbackRole) ? fallbackRole : d.outfit),
        accessory: ACCESSORIES.includes(ac) ? ac : d.accessory,
        race: RACES.includes(rc) ? rc : d.race,
      };
    } catch (e) { return d; }
  }
  function randomAppearance(role, race, gender) {
    const d = defaultAppearance();
    const rc = RACES.includes(race) ? race : "human";
    d.race = rc;
    d.skin = pick(RACE_SKINS[rc] || SKINS, d.skin);
    const fem = String(gender || "").toLowerCase() === "female";
    const masc = String(gender || "").toLowerCase() === "male";
    // faces read the sex at a glance: females favor long hair and never
    // grow beards; males favor short cuts and may grow them
    if (fem) d.hairStyle = pick(["long", "long", "ponytail", "buns", "long", "ponytail", "short"], "long");
    else if (masc) d.hairStyle = pick(["short", "short", "mohawk", "bald", "ponytail", "short", "buns"], "short");
    else d.hairStyle = pick(HAIR_STYLES, "short");
    d.hairColor = pick(RACE_MANES[rc] || HAIR_COLORS, d.hairColor);
    d.eyeColor = pick(RACE_EYES[rc] || EYE_COLORS, d.eyeColor);
    if (fem) d.accessory = Math.random() < 0.55 ? "none" : pick(["glasses", "scar", "earring", "circlet", "earring"], "none");
    else d.accessory = Math.random() < 0.55 ? "none" : pick(ACCESSORIES.slice(1), "none");
    if (role && OUTFITS.includes(role)) d.outfit = role;
    return d;
  }
  // NPC variety: outfit stays the role (identity), everything else rolls.
  // Race usually rides along (o.race) so a village can host beastfolk; a bare
  // role call still rolls the full weighted mix for background variety.
  // gender (male/female/"") biases hair + accessories so sexes read apart.
  function randomForRole(role, race, gender) {
    const rc = RACES.includes(race) ? race : rollRace();
    return randomAppearance(OUTFITS.includes(role) ? role : "villager", rc, gender);
  }
  function ensure(ent) {
    try {
      if (!ent || typeof ent !== "object") return null;
      ent.appearance = sanitize(ent.appearance || ent.app, ent.role || ent.outfit);
      if (ent.app && !ent.appearance) ent.appearance = sanitize(ent.app);
      try { delete ent.app; } catch (e) {}
      return ent.appearance;
    } catch (e) { return null; }
  }
  function key(app) {
    try {
      const a = sanitize(app);
      return [a.skin, a.hairStyle, a.hairColor, a.eyeColor, a.outfit, a.accessory, a.race].join("|");
    } catch (e) { return "default"; }
  }
  // compact wire form {sk,hs,hc,ec,of,ac,ra}
  function pack(app) {
    try {
      const a = sanitize(app);
      return { sk: a.skin, hs: a.hairStyle, hc: a.hairColor, ec: a.eyeColor, of: a.outfit, ac: a.accessory, ra: a.race };
    } catch (e) { return null; }
  }
  function unpack(v) {
    try {
      if (!v || typeof v !== "object") return null;
      return sanitize({ skin: v.sk, hairStyle: v.hs, hairColor: v.hc, eyeColor: v.ec, outfit: v.of, accessory: v.ac, race: v.ra });
    } catch (e) { return null; }
  }
  return {
    SKINS, HAIR_COLORS, EYE_COLORS, HAIR_STYLES, ACCESSORIES, OUTFITS, OUTFIT_LABEL,
    RACES, RACE_LABEL, RACE_ICON, RACE_DESC, RACE_ABILITY, RACE_BONUS,
    RACE_BODY_LABEL, RACE_HAIR_LABEL, HAIR_LABEL,
    RACE_SKINS, RACE_MANES, RACE_EYES,
    defaultAppearance, randomAppearance, randomForRole, rollRace, sanitize, ensure, key, pack, unpack,
  };
})();
