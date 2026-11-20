/* Quests — preset programmed quest types with AI-chosen parameters.
 * window.Quests. State lives on player.quests (saved with the player, slot-isolated).
 * Types: fetch (pick up N x ITEM at PLACE), slay (kill N KIND), clear (kill the boss
 * of DUNGEON), deliver (carry ITEM to NPC at PLACE), siege (break an enemy holding
 * with a marching war party — slay its warlord). The AI only fills parameters;
 * all compute (place lookup/creation, spawning, progress, rewards) is plain code. */
window.Quests = (() => {
  const MAX_ACTIVE = 6;
  const RARE_COOLDOWN_MS = 90000;
  const SLAY_MOB_KINDS = ["slime", "bat", "goblin", "wolf", "mushroom", "skeleton", "cultist", "wraith", "bandit", "kobold", "redcap", "satyr", "minotaur_calf", "harpy", "anubite", "scarab_swarm", "kappa", "tanuki", "kelpie", "burrow_mole", "draugr", "mummy", "troll_whelp", "outlaw", "murderer"];
  const FETCH_ITEMS = ["herb", "wood", "stone", "sage_herb", "cinder_herb", "calm_herb", "bright_herb", "potion", "arrow_iron"];
  const MOB_LABEL = { slime: "slimes", bat: "cave bats", goblin: "goblins", wolf: "dire wolves", mushroom: "sporelings", skeleton: "skeletons", cultist: "cultists", wraith: "wraiths", bandit: "bandits", kobold: "kobolds", redcap: "redcaps", satyr: "satyrs", tanuki: "tanukis", kelpie: "kelpies", burrow_mole: "burrow moles", draugr: "draugr", mummy: "mummies", troll_whelp: "troll whelps", outlaw: "outlaws", murderer: "murderers", minotaur_calf: "minotaur calves", harpy: "harpies", anubite: "anubites", scarab_swarm: "scarab swarms", kappa: "kappas", cyclops_whelp: "cyclops whelps", siren: "sirens", centaur_foal: "centaur foals", stymphalian: "stymphalian birds", gorgon_spawn: "gorgon spawn", hydra_spawn: "hydra spawn", chimera_cub: "chimera cubs", fenrir_pup: "fenrir pups", hulder: "hulders", nokk: "nøkks", lindworm: "lindworms", valkyrie_renegade: "renegade valkyries", sphinx_cub: "sphinx cubs", sobek_spawn: "sobek spawn", khepri_beetle: "khepri beetles", oni_imp: "oni imps", tengu_crow: "crow tengus", kitsune_trickster: "kitsune tricksters", yuki_onna: "yuki-onna", gasha_skull: "gasha skulls", nurikabe: "nurikabe", banshee: "banshees", dullahan_herald: "dullahan heralds", puca: "púcas", leshy: "leshies", vodyanoy: "vodyanoys", rusalka: "rusalkas", striga: "strigas", domovoi_rogue: "rogue domovois", naga: "nagas", rakshasa_cub: "rakshasa cubs", lamassu_cub: "lamassu cubs", utukku: "utukku", jiangshi: "jiangshi", goblin_shaman: "goblin shamans", slime_empress: "slime empresses", wyvern_fledgling: "wyvern fledglings", gloomspinner: "gloomspinners", umbral_stag: "umbral stags", sandmaw: "sandmaws", rime_wolf: "rime wolves", shiver_owl: "shiver owls", coral_crab: "coral crabs", abyss_serpent: "abyss serpents", phoenix: "phoenixes", yeti: "yetis", peak_dragon: "peak dragons" };

  function P() { try { return window.Game.G.player; } catch (e) { return null; } }
  function ensure(p) {
    p = p || P(); if (!p) return [];
    if (!Array.isArray(p.quests)) p.quests = [];
    if (!(p.questSeq | 0)) p.questSeq = 1;
    // migrate old saves: every quest gets story fields so the log can narrate
    try {
      for (const q of p.quests) {
        if (!q) continue;
        if (!q.story && q.desc) q.story = String(q.desc).slice(0, 600);
        if (!Array.isArray(q.storyLog)) q.storyLog = q.story ? [String(q.story)] : (q.desc ? [String(q.desc)] : []);
        if (q.type === "chain" && !Array.isArray(q.stages)) { q.type = "slay"; q.mobKind = q.mobKind || "goblin"; q.need = q.need || 3; }
        if (q.type === "chain" && !(q.stageIdx | 0) && q.stageIdx !== 0) q.stageIdx = 0;
      }
    } catch (e) { }
    return p.quests;
  }
  function active(p) { return ensure(p).filter(q => q.status === "active" || q.status === "turnin"); }
  function completedQuests(p) { return ensure(p).filter(q => q.status === "done").sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)); }
  function abandonedQuests(p) { return ensure(p).filter(q => q.status === "abandoned").sort((a, b) => (b.abandonedAt || 0) - (a.abandonedAt || 0)); }
  function get(p, id) { return ensure(p).find(q => q.id === id) || null; }
  function save() { try { window.Game.saveGame(true); } catch (e) { } }
  // cap history so the save never bloats: keep all active, newest N done/abandoned
  function pruneHistory(p) {
    try {
      p = p || P(); if (!p) return;
      const qs = ensure(p);
      const keepDone = 30, keepAb = 30;
      const done = qs.filter(q => q.status === "done").sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
      const ab = qs.filter(q => q.status === "abandoned").sort((a, b) => (b.abandonedAt || 0) - (a.abandonedAt || 0));
      if (done.length > keepDone || ab.length > keepAb) {
        const drop = new Set();
        done.slice(keepDone).forEach(q => drop.add(q.id));
        ab.slice(keepAb).forEach(q => drop.add(q.id));
        p.quests = qs.filter(q => !drop.has(q.id));
      }
    } catch (e) { }
  }

  function normPlace(s) {
    return String(s || "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/[^\p{L}\p{N} '\-]/gu, "").trim().replace(/\s+/g, " ").slice(0, 32);
  }
  function normKey(s) { return normPlace(s).toLowerCase(); }

  // ---------- difficulty + rewards (pure compute, scaled to player + distance) ----------
  function difficultyFor(p, dist) {
    const lv = (p && p.lv) || 1;
    let d = 1 + Math.floor(lv / 12) + Math.floor((dist || 0) / 120);
    return Math.max(1, Math.min(5, d));
  }
  function rewardFor(p, diff) {
    const lv = (p && p.lv) || 1;
    let gm = 1;
    try { if (window.Entities && window.Entities.questGoldMult) gm = window.Entities.questGoldMult(p); } catch (e) { }
    const gold = Math.round((180 + 110 * lv) * diff * gm);
    const xp = Math.round((22 + 13 * lv) * diff);
    const items = [{ id: "potion", n: Math.min(3, 1 + (diff >> 1)) }];
    if (diff >= 2) items.push({ id: "arrow_iron", n: 3 + diff * 2 });
    if (diff >= 3) items.push({ id: "mana_potion", n: 1 });
    if (diff >= 4) items.push({ id: "bomb", n: 1 });
    return { gold, xp, items };
  }

  // ---------- story helpers (every quest narrates; chains narrate per stage) ----------
  function heroSummary(p) {
    try {
      if (!p) return "a nameless wanderer";
      const bits = [];
      bits.push(`${p.name || "Wanderer"} (lv${p.lv || 1})`);
      try {
        const race = (p.race || (p.appearance && p.appearance.race) || "human");
        bits.push(String(race));
      } catch (e) { }
      try {
        const w = p.equipment && p.equipment.weapon;
        if (w) {
          let wn = w;
          try { const it = window.Items.ITEMS[w]; if (it) wn = it.name; } catch (e2) { }
          bits.push(`wields ${wn}`);
        } else bits.push("fights bare-handed");
      } catch (e) { }
      try {
        const abs = Array.isArray(p.abilities) ? p.abilities.slice(-4) : [];
        if (abs.length) {
          const names = abs.map(id => { try { const a = (window.CFG.ABILITIES || {})[id]; return (a && a.name) || id; } catch (e) { return id; } });
          bits.push(`knows ${names.join(", ")}`);
        }
      } catch (e) { }
      try {
        if (p.appearance) {
          const a = p.appearance;
          const look = [a.hairStyle, a.accessory && a.accessory !== "none" ? "wearing " + a.accessory : null].filter(Boolean).join(", ");
          if (look) bits.push(look);
        }
      } catch (e) { }
      return bits.join(" · ");
    } catch (e) { return "a traveler"; }
  }
  function giverSummary(npc) {
    try {
      if (!npc) return "a villager";
      const bits = [`${npc.name || "Someone"}, a ${npc.role || "villager"}`];
      if (npc.personality) bits.push(`(${npc.personality})`);
      if (npc.placeName) bits.push(`of ${npc.placeName}`);
      if (npc.quirk) bits.push(`— quirk: ${npc.quirk}`);
      return bits.join(" ");
    } catch (e) { return "a villager"; }
  }
  function recentQuestLines(p, max) {
    try {
      const qs = ensure(p).slice(-8);
      return qs.map(q => `"${q.title}" (${q.type}${q.type === "chain" && q.stages ? `:${q.stages.map(s => s.type).join("+")}` : q.mobKind ? ":" + q.mobKind : ""})`).slice(-(max || 6));
    } catch (e) { return []; }
  }
  function cleanStory(s, fb) {
    s = String(s || "").replace(/\s+/g, " ").trim().slice(0, 900);
    return s || fb;
  }
  function pushStory(q, text) {
    try {
      q.storyLog = Array.isArray(q.storyLog) ? q.storyLog : [];
      const t = String(text || "").trim();
      if (t && !q.storyLog.includes(t)) {
        q.storyLog.push(t);
        if (q.storyLog.length > 12) q.storyLog = q.storyLog.slice(-12);
      }
    } catch (e) { }
  }
  // story heard SO FAR: premise + finished chapters + (for active) current chapter
  function storyHeardSoFar(q) {
    try {
      if (!q) return "";
      if (q.type !== "chain") {
        const prog = (q.status === "abandoned" && q.need > 1) ? ` [Left at ${Math.min(q.have | 0, q.need | 0)}/${q.need | 0}.]` : "";
        return (q.storyLog && q.storyLog.length ? q.storyLog.join(" ") : (q.story || q.desc || "")) + prog;
      }
      const out = [];
      if (q.story) out.push(q.story);
      const stages = Array.isArray(q.stages) ? q.stages : [];
      const doneN = q.status === "done" ? stages.length : Math.min(stages.length, (q.stageIdx | 0) + (q.status === "abandoned" ? 1 : 0));
      for (let i = 0; i < doneN; i++) {
        const st = stages[i];
        if (!st) continue;
        const tag = q.status === "abandoned" && i === (q.stageIdx | 0) ? " (unfinished — hearsay ends here)" : "";
        if (st.story) out.push(`Stage ${i + 1}: ${st.story}${tag}`);
      }
      if (!out.length && Array.isArray(q.storyLog) && q.storyLog.length) return q.storyLog.join(" ");
      return out.join(" ");
    } catch (e) { return ""; }
  }

  // ---------- tutorial quest (scripted onboarding, no AI needed) ----------
  // Ordered, guided lessons. The UI spotlight (window.UI.refreshTutGuide)
  // reads TUT_GUIDE for arrows/keys/dim targets — keep ids stable.
  const TUT_STEPS = [
    { id: "move", text: "Move around — WASD / arrows / left stick" },
    { id: "attack", text: "Swing your weapon — click, or the ⚔️ button" },
    { id: "battle", text: "Win a real fight — defeat 2 foes" },
    { id: "inv", text: "Open your pack (I) and check your gear" },
    { id: "unequip", text: "Unequip your weapon — 🎒 Inventory (I) → Equipped → Unequip" },
    { id: "equip", text: "Equip it again — 🎒 Inventory → tap your weapon → ⚔️ Default weapon" },
    { id: "tome", text: "Learn Frostbite — 🎒 Inventory (I) → 📕 Books → 📖 Read the Tome: Frostbite" },
    { id: "spell", text: "Cast Frostbite — press its hotbar key, watch your MP" },
    { id: "dodge", text: "Dodge spells — hold Shift + WASD (stick past the edge on touch) to sprint clear of incoming magic" },
    { id: "herb", text: "Gather a wild herb — E by glowing plants" },
    { id: "craft", text: "Craft something — 🎒 Inventory (I) → 🔨 Crafting → Craft (torches take 1 wood)" },
    { id: "dungeon", text: "Enter a dungeon — find purple 🕳️ (M for map), step in, press E" },
    { id: "party", text: "Recruit a companion — chat (E), raise 💛 to 10× their level, Recruit" },
    { id: "tame", text: "Tame a beast — weaken a wolf or horse until it submits 💛 (below 25% HP — giving up is only a chance, so keep weakening it carefully without killing it!), press E fast, then ride it from the Party menu (P)" },
  ];
  // Guide metadata per step: which key to press + where the arrow points.
  // focus is read by UI.refreshTutGuide: quest|move|attack|battle|inv|gear|tome|spell|dodge|herb|craft|dungeon|party|tame
  const TUT_GUIDE = {
    move:    { key: "WASD / arrows", focus: "move", tip: "Hold WASD (or arrows) to walk. Left stick on touch." },
    attack:  { key: "click / ⚔️", focus: "attack", tip: "Click, or tap the big ⚔️ button — that uses your default weapon/spell." },
    battle:  { key: "click + WASD", focus: "battle", tip: "Keep fighting! 2 foes fall — kite with WASD, strike with click." },
    inv:     { key: "I", focus: "inv", tip: "Press I (or tap 🎒 Inventory, top-right panel) to open your pack." },
    unequip: { key: "I → Unequip", focus: "gear", tip: "In 🎒 Inventory, find Equipped → weapon → Unequip. Bare hands build martial arts!" },
    equip:   { key: "I → Equip", focus: "gear", tip: "Pick the weapon again → Default weapon (binding to the default slot wields it; pressing a weapon hotkey makes it the default)." },
    tome:    { key: "I → 📕 Books → Read", focus: "tome", tip: "A ❄️ Tome: Frostbite was added to your pack. Open 🎒 (I) → 📕 Books → 📖 Read it." },
    spell:   { key: "hotbar key (3?)", focus: "spell", tip: "Frostbite auto-binds to a hotbar slot. Press its key (often 3) — watch blue MP drain." },
    dodge:   { key: "Shift + WASD", focus: "dodge", tip: "Hold Shift while moving to SPRINT — sidestep out of incoming bolts and blasts." },
    herb:    { key: "E", focus: "herb", tip: "Walk to a glowing 🌿 plant until you see “press E”, then press E (or tap E button)." },
    craft:   { key: "I → 🔨 Crafting", focus: "craft", tip: "Open 🎒 (I) → 🔨 Crafting tab → Craft anything. Torches take a single 🪵 wood; potions brew from 3 🌿 herbs." },
    dungeon: { key: "M → E", focus: "dungeon", tip: "Press M for the map — walk to a purple 🕳️, step onto it, press E to descend." },
    party:   { key: "E → Recruit", focus: "party", tip: "Talk (E) to anyone, raise 💛 by chatting, then Recruit. Up to 4 friends." },
    tame:    { key: "E then P", focus: "tame", tip: "Weaken a wolf, horse or crab until it submits 💛 (below 25% HP — only a chance to give up, so keep hurting it a little without killing it!) — press E fast, then ride it from the Party menu (P) → beasts → Ride." },
  };
  const TUT_REWARD_CHOICES = ["iron_sword", "iron_dagger", "iron_axe", "iron_hammer", "iron_spear", "iron_armor", "cloth_robe", "leather_armor", "old_bow", "oak_bow", "wand_quartz", "staff_quartz"];
  function tutorialSteps() { return TUT_STEPS.map(s => ({ id: s.id, text: s.text })); }
  function tutorialGuideFor(id) { try { return TUT_GUIDE[id] || null; } catch (e) { return null; } }
  function tutorialCurrentStep(q) {
    try { return (q && q.steps && q.steps.find(s => !s.done)) || null; } catch (e) { return null; }
  }
  function tutorialSpellKey() {
    // real hotbar label for the new spell so the arrow names the right key
    try {
      const p = P(); if (!p || !Array.isArray(p.hotbar)) return "3";
      const ids = ["frostbite", "fireball"];
      for (const want of ids) {
        const i = p.hotbar.findIndex(s => s && s.kind === "ability" && s.id === want);
        if (i >= 0) return String(i + 1);
      }
      return "3";
    } catch (e) { return "3"; }
  }
  // Old saves carry the 7-step list — carry their progress onto the new 13.
  function migrateTutorialQuest(q, p) {
    try {
      if (!q || q.type !== "tutorial" || !Array.isArray(q.steps)) return q;
      const hasNew = q.steps.some(s => s.id === "tome" || s.id === "dodge" || s.id === "dungeon" || s.id === "unequip");
      if (hasNew) {
        // older saves predate newer lessons — append any missing step, still to do
        try {
          let added = false;
          for (const s of TUT_STEPS) {
            if (!q.steps.some(x => x.id === s.id)) { q.steps.push({ id: s.id, text: s.text, done: false }); added = true; }
          }
          if (added) { q.need = q.steps.length; save(); }
        } catch (e) { }
        q.need = (q.steps || []).length; return q;
      }
      const doneById = {};
      for (const s of q.steps) if (s && s.done) doneById[s.id] = true;
      q.steps = TUT_STEPS.map(s => ({ id: s.id, text: s.text, done: !!doneById[s.id] }));
      // sensible backfill so returning trainees don't redo the obvious
      try {
        if (p && Array.isArray(p.abilities) && p.abilities.includes("frostbite")) {
          const t = q.steps.find(s => s.id === "tome"); if (t) t.done = true;
        }
      } catch (e) { }
      q.need = q.steps.length;
      q.have = q.steps.filter(x => x.done).length;
      // fresh starters may predate the frostbite gift — top it up below
      try { ensureTutorialTome(p); } catch (e) { }
      save();
      return q;
    } catch (e) { return q; }
  }
  function ensureTutorialTome(p) {
    try {
      p = p || P(); if (!p) return false;
      if (window.Items && window.Items.countItem && window.Items.addItem) {
        const known = Array.isArray(p.abilities) && p.abilities.includes("frostbite");
        const hasTome = (window.Items.countItem(p, "tome_frostbite") | 0) > 0;
        if (!known && !hasTome) {
          window.Items.addItem(p, "tome_frostbite", 1);
          try { if (window.UI) { window.UI.updateHUD(); window.UI.updateHotbar(); } } catch (e2) { }
          return true;
        }
      }
    } catch (e) { }
    return false;
  }
  function tutorialQuest(p) {
    try {
      p = p || P(); if (!p) return null;
      const q = (ensure(p).find(q => q.type === "tutorial" && q.status !== "done")) || null;
      if (q) migrateTutorialQuest(q, p);
      return q;
    } catch (e) { return null; }
  }
  function rewardText(r) {
    if (!r) return "";
    const bits = [`+${r.gold | 0} gold`, `+${r.xp | 0} XP`];
    for (const d of (r.items || [])) bits.push(itemLabel(d.id, d.n));
    return bits.join(" · ");
  }
  function startTutorial() {
    const p = P(); if (!p) return null;
    const old = tutorialQuest(p);
    if (old) { try { ensureTutorialTome(p); } catch (e) { } return old; }
    if (active(p).length >= MAX_ACTIVE) {
      try { window.UI.toast("📜 Quest log is full (6). Finish one first.", 3500); } catch (e) { }
      return null;
    }
    const q = {
      id: "q" + (p.questSeq++), type: "tutorial",
      title: "Wayfarer Training",
      desc: "Guided lessons: move, fight, gear, Frostbite, dodge, herbs, crafting, delves, friends, beasts. You can check 📜 Quests (J) anytime to see what is next. Finish every lesson, then claim iron-forged starter gear.",
      giver: { npcId: null, name: "Emberhold guide" },
      target: null, need: TUT_STEPS.length, have: 0, turnIn: false,
      diff: 1, status: "active", createdAt: Date.now(),
      steps: TUT_STEPS.map(s => ({ id: s.id, text: s.text, done: false })),
      startX: p.x, startY: p.y, startKills: p.kills | 0,
      _lx: p.x, _ly: p.y, _sprint: 0,
      reward: rewardFor(p, 1), rewardOffered: false,
    };
    ensure(p).push(q);
    try { ensureTutorialTome(p); } catch (e) { }
    // if they already learned frostbite somehow, skip straight past that line
    try {
      if (Array.isArray(p.abilities) && p.abilities.includes("frostbite")) {
        const t = q.steps.find(s => s.id === "tome"); if (t) t.done = true;
      }
      if (!p.equipment || !p.equipment.weapon) {
        // starts bare-handed (odd save) — nothing to take off
        const u = q.steps.find(s => s.id === "unequip"); if (u) u.done = true;
      }
      q.have = q.steps.filter(x => x.done).length;
    } catch (e) { }
    save();
    try {
      window.UI.toast(`🎓 Training begun — a ❄️ Tome: Frostbite was tucked into your pack. See 📜 Quests (J) anytime.`, 6500);
      if (window.UI.showQuestBanner) window.UI.showQuestBanner("🎓", "New quest: " + q.title, objectiveText(q) + "  ·  🎁 " + rewardText(q.reward));
      window.Sfx.talk();
      window.UI.updateHUD();
      if (window.UI.renderQuests) window.UI.renderQuests();
      if (window.UI.refreshTutGuide) window.UI.refreshTutGuide();
    } catch (e) { }
    return q;
  }
  function tutMarkDone(q, id) {
    if (!q || q.status !== "active") return false;
    const s = (q.steps || []).find(x => x.id === id);
    if (!s || s.done) return false;
    s.done = true;
    q.have = (q.steps || []).filter(x => x.done).length;
    save();
    try {
      window.UI.toast(`🎓 Training ${q.have}/${q.need}: ${s.text} ✓ — check 📜 Quests (J) for what is next.`, 4500);
      window.Sfx.coin();
      if (window.UI.renderQuests) window.UI.renderQuests();
    } catch (e) { }
    if ((q.steps || []).every(x => x.done) && !q.rewardOffered) {
      q.rewardOffered = true;
      save();
      try { if (window.UI.clearTutGuide) window.UI.clearTutGuide(); } catch (e) { }
      try { if (window.UI.showTutorialReward) window.UI.showTutorialReward(); } catch (e) { }
      return true;
    }
    // guided flow: after every lesson, reopen the quest log so the trainee
    // sees what is left, with the spotlight arrow already on the next step.
    try {
      if (window.UI && window.UI.toggleQuests) {
        // let the toast breathe for a beat, then show the log again
        setTimeout(() => {
          try {
            const still = tutorialQuest(P());
            if (!still || still.status !== "active" || still.id !== q.id) return;
            // don't yank focus while another reward/modal took over
            const rew = document.querySelector("#tutRewardModal");
            if (rew && !rew.hidden) return;
            // close the pack first so the log is actually on top
            try { const im = document.querySelector("#invModal"); if (im && !im.hidden) im.hidden = true; } catch (e2) { }
            window.UI.toggleQuests(true);
            if (window.UI.refreshTutGuide) window.UI.refreshTutGuide();
          } catch (e) { }
        }, 900);
      } else if (window.UI && window.UI.refreshTutGuide) window.UI.refreshTutGuide();
    } catch (e) { }
    return true;
  }
  // Event hook for scripted lesson tracking.
  function onTutorialEvent(type) {
    try {
      const p = P(); if (!p) return;
      const q = tutorialQuest(p);
      if (!q || q.status !== "active") return;
      if (type === "attack") tutMarkDone(q, "attack");
      else if (type === "inv") tutMarkDone(q, "inv");
      else if (type === "spell") tutMarkDone(q, "spell");
      else if (type === "herb") tutMarkDone(q, "herb");
      else if (type === "craft") tutMarkDone(q, "craft");
      else if (type === "party") tutMarkDone(q, "party");
      else if (type === "dodge") tutMarkDone(q, "dodge");
      else if (type === "dungeon") tutMarkDone(q, "dungeon");
      else if (type === "equip" || (type || "").indexOf("equip:") === 0) {
        const slot = String(type).split(":")[1] || "weapon";
        if (slot === "weapon") tutMarkDone(q, "equip");
      }
      else if (type === "unequip" || (type || "").indexOf("unequip:") === 0) {
        const slot = String(type).split(":")[1] || "weapon";
        if (slot === "weapon") tutMarkDone(q, "unequip");
      }
      else if ((type || "").indexOf("learn:") === 0) {
        const ab = String(type).split(":")[1] || "";
        if (ab === "frostbite") {
          tutMarkDone(q, "tome");
          // learning also proves they handled the book — keep spell step for casting
        }
      }
    } catch (e) { }
  }
  function tutorialTick() {
    try {
      const p = P(); if (!p || p.hp <= 0) return;
      const q = tutorialQuest(p);
      if (!q || q.status !== "active") return;
      const has = id => (q.steps || []).some(x => x.id === id && x.done);
      if (!has("move") && Math.hypot((p.x || 0) - (q.startX || 0), (p.y || 0) - (q.startY || 0)) > 4) tutMarkDone(q, "move");
      if (!has("battle") && (p.kills | 0) >= ((q.startKills | 0) + 2)) {
        tutMarkDone(q, "battle");
        tutMarkDone(q, "attack");
      }
      // learning the ice spell counts even if the event was missed (trade, old tome)
      if (!has("tome") && Array.isArray(p.abilities) && p.abilities.includes("frostbite")) tutMarkDone(q, "tome");
      // lost the frostbite tome (dropped/sold it)? tuck a fresh one back in —
      // otherwise the lesson has nothing to point at
      if (!has("tome")) { try { ensureTutorialTome(p); } catch (e) { } }
      // wielding through ANY path counts (hotkey/bind/trade/load syncs never
      // fired equip events, which used to stick the lesson with the blade
      // already worn); bare hands count for the unequip lesson the same way
      if (!has("equip") && has("unequip") && p.equipment && p.equipment.weapon) tutMarkDone(q, "equip");
      if (!has("unequip") && !(p.equipment && p.equipment.weapon)) tutMarkDone(q, "unequip");
      // no blade left to re-equip (sold/dropped it)? tuck one back in
      if (!has("equip") && has("unequip") && !(p.equipment && p.equipment.weapon)) {
        try {
          let owned = false;
          if (window.Items && window.Items.countItem) {
            for (const s of (p.inventory || [])) {
              const it = window.Items.ITEMS[s.id];
              if (it && it.type === "equipment" && it.slot === "weapon" && window.Items.countItem(p, s.id) > 0) { owned = true; break; }
            }
          }
          if (!owned && window.Items && window.Items.addItem) {
            window.Items.addItem(p, "rusted_sword", 1);
            try { if (window.UI) window.UI.toast("🗡️ A spare Rusted Sword was tucked into your pack — the lesson needs a blade.", 4500); } catch (e2) { }
          }
        } catch (e) { }
      }
      // entering any dungeon counts
      if (!has("dungeon") && p.inDungeon) {
        tutMarkDone(q, "dungeon");
        try { if (window.UI && window.UI.toggleQuests) { /* keep them oriented on return */ } } catch (e) { }
      }
      // dodging: sprinting (Shift + move) banks distance; sidestepping live
      // enemy bolts counts instantly. Either proves the lesson.
      if (!has("dodge")) {
        let sprinting = false, moving = false;
        try {
          const G = window.Game && window.Game.G;
          sprinting = !!((G && G.keys && G.keys["shift"]) || (G && G.joy && G.joy.sprint));
          moving = !!((G && G.keys && (G.keys["w"] || G.keys["a"] || G.keys["s"] || G.keys["d"] || G.keys["arrowup"] || G.keys["arrowdown"] || G.keys["arrowleft"] || G.keys["arrowright"])) || (G && G.joy && G.joy.active));
        } catch (e) { }
        try {
          const lx = (q._lx != null ? q._lx : p.x), ly = (q._ly != null ? q._ly : p.y);
          const d = Math.hypot((p.x || 0) - lx, (p.y || 0) - ly);
          if (sprinting && moving && d > 0) q._sprint = (q._sprint | 0) + d;
          q._lx = p.x; q._ly = p.y;
          if ((q._sprint | 0) >= 6) { tutMarkDone(q, "dodge"); }
          else {
            // sidestep a live hostile bolt: moving while one flies within ~7 tiles
            const G = window.Game && window.Game.G;
            if (moving && G && Array.isArray(G.projectiles)) {
              for (const pr of G.projectiles) {
                if (!pr || pr.visual || pr.life <= 0) continue;
                if (pr.src === p) continue;
                const d2 = Math.hypot((pr.x || 0) - (p.x || 0), (pr.y || 0) - (p.y || 0));
                if (d2 < 7) { tutMarkDone(q, "dodge"); break; }
              }
            }
          }
        } catch (e) { }
      }
    } catch (e) { }
  }
  function tutorialChoose(itemId) {
    try {
      const p = P(); if (!p) return false;
      const q = tutorialQuest(p);
      if (!q || q.status !== "active") return false;
      if (!TUT_REWARD_CHOICES.includes(itemId)) return false;
      try { window.Items.addItem(p, itemId, 1); } catch (e) { return false; }
      q.reward = q.reward || rewardFor(p, 1);
      q.reward.items = (q.reward.items || []).concat([{ id: itemId, n: 1 }]);
      try { p.tutorialDone = true; } catch (e) { }
      complete(q, "tutorial");
      return true;
    } catch (e) { return false; }
  }
  // Taming hook: called by Game.doTameMob when a beast joins (or stables).
  function onTame(tame) {
    try {
      const p = P(); if (!p) return;
      const q = tutorialQuest(p);
      if (q && q.status === "active") tutMarkDone(q, "tame");
    } catch (e) { }
  }

  // ---------- place lookup (mem first, then kv scan, cached per slot+epoch) ----------
  let placeCache = { slot: null, epoch: -1, map: new Map() };
  function cacheOk() {
    try {
      const s = window.World.getSlot(), e = window.World.slotEpoch();
      if (placeCache.slot !== s || placeCache.epoch !== e) placeCache = { slot: s, epoch: e, map: new Map() };
      return true;
    } catch (e) { return false; }
  }
  function memPlaces() {
    const out = [];
    try {
      for (const ch of window.World._mem.chunks.values()) {
        if (!ch.placeName) continue;
        out.push({ placeName: ch.placeName, cx: ch.cx, cy: ch.cy, gx: ch.cx * 16 + 8, gy: ch.cy * 16 + 8, dungeon: !!ch.hasDungeon });
      }
    } catch (e) { }
    return out;
  }
  function findPlace(name) {
    const want = normKey(name);
    if (!want) return null;
    for (const q of memPlaces()) if (normKey(q.placeName) === want) return q;
    return null;
  }
  async function findPlaceEverywhere(name) {
    const want = normKey(name);
    if (!want) return null;
    const hit = findPlace(name);
    if (hit) return hit;
    try {
      if (!cacheOk()) return null;
      if (placeCache.map.has(want)) return placeCache.map.get(want);
      let entries = [];
      try { entries = await window.World.chunkStore().entries(); } catch (e) { entries = []; }
      for (const [k, ch] of entries) {
        if (!ch || !ch.placeName) continue;
        if (normKey(ch.placeName) === want) {
          const q = { placeName: ch.placeName, cx: ch.cx, cy: ch.cy, gx: ch.cx * 16 + 8, gy: ch.cy * 16 + 8, dungeon: !!ch.hasDungeon };
          placeCache.map.set(want, q);
          return q;
        }
      }
      placeCache.map.set(want, null);
    } catch (e) { }
    return null;
  }
  function knownPlaceNames(max) {
    const seen = new Map();
    for (const q of memPlaces()) {
      const k = normKey(q.placeName);
      if (!k || seen.has(k)) continue;
      seen.set(k, q.placeName);
      if (seen.size >= (max || 14)) break;
    }
    return [...seen.values()];
  }
  function findDungeonEverywhere(name) {
    const want = normKey(name);
    const out = [];
    try {
      let _qdim = "surf", _qok = false;
      try { const _qd = (window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.dim) || null; if (_qd === "hell" || _qd === "heaven" || _qd === "surf") { _qdim = _qd; _qok = true; } } catch (e) {}
      try { if (!_qok && window.World && window.World.getDim) _qdim = window.World.getDim(); } catch (e2) {}
      for (const [id, d] of window.World._mem.dungeons) {
        if (!d || !d.name) continue;
        try { const _dd = d.dim || String(id).split(":")[0]; if ((_dd === "hell" ? "hell" : "surf") !== _qdim && (d.dim === "hell" || d.dim === "surf")) continue; } catch (e) {}
        if (!want || normKey(d.name) === want) {
          const _bid = String(d.baseId || String(id).split(":").slice(-1).join(":")).replace(/_L\d+$/, "");
          out.push({ dungeonId: _bid, dim: d.dim || _qdim, name: d.name, cx: d.cx, cy: d.cy, gx: (d.cx || 0) * 16 + 8, gy: (d.cy || 0) * 16 + 8 });
        }
      }
    } catch (e) { }
    return out;
  }
  async function findNpcEverywhere(name, placeName) {
    const want = String(name || "").trim().toLowerCase();
    if (!want) return null;
    try {
      const all = await window.World.allNpcs();
      const pk = placeName ? normKey(placeName) : null;
      let fb = null;
      for (const n of all) {
        if (!n || n.hp <= 0 && false) continue;
        if (String(n.name || "").trim().toLowerCase() !== want) continue;
        if (pk && normKey(n.placeName) === pk) return n;
        if (!fb) fb = n;
      }
      return fb;
    } catch (e) { return null; }
  }

  // ---------- location creation (fast compute; AI only named it) ----------
  function biomeFeature(biome) {
    switch (biome) {
      case "forest": return "Thicket";
      case "desert": return "Dunes";
      case "mountain": return "Crags";
      case "volcano": return "Ashfield";
      case "lake": return "Shores";
      case "sea": return "Reach";
      case "ocean": return "Expanse";
      case "tundra": return "Wastes";
      case "dark_forest": return "Gloam";
      case "wild": return "Marches";
      default: return "Fields";
    }
  }
  async function ensureOverworldPlace(name, flavor) {
    const p = P();
    name = normPlace(name);
    if (!name) {
      try {
        const b = window.World.biomeAt(Math.round(p.x), Math.round(p.y));
        const bt = String(b).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        name = `${bt} ${biomeFeature(b)}`;
      } catch (e) { name = "Far Marches"; }
    }
    const found = await findPlaceEverywhere(name);
    if (found) return found;
    // New location: settle a fresh chunk a few chunks out, name it, reveal it.
    const pcx = Math.floor(p.x / 16), pcy = Math.floor(p.y / 16);
    const ring = [[3, 0], [0, 3], [-3, 0], [0, -3], [3, 3], [-3, 3], [3, -3], [-3, -3], [4, 1], [-4, -1], [1, 4], [-1, -4]];
    let ch = null;
    for (const [dx, dy] of ring) {
      try {
        const c = await window.World.getChunk(pcx + dx, pcy + dy);
        if (!c) continue;
        const d = Math.hypot((c.cx * 16 + 8), (c.cy * 16 + 8));
        if (d < 40) continue; // keep the vale wild, not spawn-adjacent
        ch = c; break;
      } catch (e) { }
    }
    if (!ch) ch = await window.World.getChunk(pcx + 3, pcy);
    ch.placeName = name;
    ch.lore = flavor || "A place the road forgot — until today.";
    ch.enriched = true; // don't let the dreamer rename our quest site
    try {
      for (const poi of (ch.pois || [])) if (poi.type === "sign") poi.text = name;
    } catch (e) { }
    try { await window.World.saveChunk(ch); } catch (e) { }
    try {
      window.Game.G.explored.add(window.World.chunkKey(ch.cx, ch.cy));
      window.Game.G.chunks.set(ch.cx + "," + ch.cy, ch);
    } catch (e) { }
    let spot = null;
    try {
      const spots = window.World.findWalkableSpots(ch, 3) || [];
      const s0 = spots[0] || { lx: 8, ly: 8 };
      spot = { gx: ch.cx * 16 + s0.lx, gy: ch.cy * 16 + s0.ly };
    } catch (e) { spot = { gx: ch.cx * 16 + 8, gy: ch.cy * 16 + 8 }; }
    try { window.UI.toast(`🗺️ New location revealed: ${name}`, 4500); } catch (e) { }
    save();
    return { placeName: name, cx: ch.cx, cy: ch.cy, gx: spot.gx, gy: spot.gy, dungeon: false, fresh: true };
  }
  async function ensureDungeonTarget(name) {
    const p = P();
    name = normPlace(name);
    if (name) {
      const ds = findDungeonEverywhere(name);
      if (ds.length) {
        const d = ds[0];
        try {
          const dg = await window.World.getDungeon(d.dungeonId, d.cx, d.cy, 1);
          window.Game.G.explored.add(window.World.chunkKey(d.cx, d.cy));
          try { window.UI.toast(`🗺️ Quest marks a delve: ${dg.name || d.name}`, 4500); } catch (e) { }
          save();
          return { dungeonId: String(dg.baseId || dg.id).replace(/_L\d+$/, ""), name: dg.name || d.name, cx: d.cx, cy: d.cy, gx: d.gx, gy: d.gy };
        } catch (e) { return { dungeonId: d.dungeonId, name: d.name, cx: d.cx, cy: d.cy, gx: d.gx, gy: d.gy }; }
      }
    }
    // Nearest delve: mem scan first, else deterministic spiral via the same rule gen uses.
    // Always use the chunk's real dungeon POI id/coords (water delves carry
    // `_w` ids — a rebuilt `d_cx_cy` would miss the drowned dungeon).
    const poiOf = (ch) => { try { return (ch.pois || []).find(po => po && po.type === "dungeon"); } catch (e) { return null; } };
    let best = null, bd = 1e9;
    try {
      for (const ch of window.World._mem.chunks.values()) {
        if (!ch.hasDungeon) continue;
        const dx = ch.cx * 16 + 8 - p.x, dy = ch.cy * 16 + 8 - p.y;
        const d = Math.hypot(dx, dy);
        if (d < bd) { bd = d; best = ch; }
      }
    } catch (e) { }
    if (!best) {
      const pcx = Math.floor(p.x / 16), pcy = Math.floor(p.y / 16);
      outer: for (let r = 2; r <= 14; r++) {
        for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const cx = pcx + dx, cy = pcy + dy;
          const gx = cx * 16 + 8, gy = cy * 16 + 8;
          if (Math.hypot(gx, gy) < 40) continue;
          let h = 0;
          try { h = window.World.hash2(cx * 3 + 11, cy * 7 + 5); } catch (e) { continue; }
          if (h > 0.955) { try { best = await window.World.getChunk(cx, cy); } catch (e) { best = null; } if (best && best.hasDungeon) break outer; best = null; }
        }
      }
    }
    if (!best) return null;
    const dpoi = poiOf(best);
    const did = (dpoi && dpoi.dungeonId) || `d_${best.cx}_${best.cy}`;
    const dgx = (dpoi && dpoi.gx != null) ? dpoi.gx : best.cx * 16 + 8;
    const dgy = (dpoi && dpoi.gy != null) ? dpoi.gy : best.cy * 16 + 8;
    try {
      const dg = await window.World.getDungeon(did, best.cx, best.cy, 1);
      window.Game.G.explored.add(window.World.chunkKey(best.cx, best.cy));
      try { window.UI.toast(`🗺️ Quest marks a delve: ${dg.name || "Sunken Crypt"}`, 4500); } catch (e) { }
      save();
      return { dungeonId: String(dg.baseId || dg.id).replace(/_L\d+$/, ""), name: dg.name || "Sunken Crypt", cx: best.cx, cy: best.cy, gx: dgx, gy: dgy };
    } catch (e) { return null; }
  }

  // ---------- quest cache placement (fetch) ----------
  // The cache must be REACHABLE: caches land on the chunk's largest connected
  // landmass (flood-filled over non-solid tiles), preferring tiles with no
  // open water in their 8-neighbourhood — no more marooned-on-a-sandbar
  // caches. (And if water still lies between, the craftable 🛶 raft sails it.)
  async function placeQuestCache(q) {
    try {
      const t = q.target || {};
      const cx = Math.floor((t.gx || 0) / 16), cy = Math.floor((t.gy || 0) / 16);
      const ch = await window.World.getChunk(cx, cy);
      if (!ch) return false;
      let lx = 8, ly = 8;
      try {
        const T = window.CFG.T, SOLID = window.CFG.SOLID, N = 16;
        const W = ch.tiles;
        const solidAt = (x, y) => x < 0 || y < 0 || x >= N || y >= N || SOLID.has(W[y * N + x]);
        const seen = new Array(N * N).fill(false);
        let bestCells = null;
        // flood fill each non-solid pocket of the interior; keep the largest
        for (let sy = 1; sy < N - 1; sy++) for (let sx = 1; sx < N - 1; sx++) {
          if (seen[sy * N + sx] || solidAt(sx, sy)) continue;
          const cells = [];
          const stack = [[sx, sy]];
          seen[sy * N + sx] = true;
          while (stack.length) {
            const [qx, qy] = stack.pop();
            cells.push([qx, qy]);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = qx + dx, ny = qy + dy;
              if (nx < 1 || ny < 1 || nx >= N - 1 || ny >= N - 1) continue;
              if (seen[ny * N + nx] || solidAt(nx, ny)) continue;
              seen[ny * N + nx] = true;
              stack.push([nx, ny]);
            }
          }
          if (!bestCells || cells.length > bestCells.length) bestCells = cells;
        }
        if (bestCells && bestCells.length) {
          const wet = ([px, py]) => {
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = px + dx, ny = py + dy;
              if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
              const tt = W[ny * N + nx];
              if (tt === T.WATER || tt === T.DEEPWATER) return true;
            }
            return false;
          };
          const dry = bestCells.filter(c => !wet(c));
          const pool = dry.length ? dry : bestCells;
          const s = pool[(Math.random() * pool.length) | 0] || [8, 8];
          lx = s[0]; ly = s[1];
        } else {
          const spots = window.World.findWalkableSpots(ch, 5) || [];
          const s = spots[(Math.random() * spots.length) | 0] || { lx: 8, ly: 8 };
          lx = s.lx; ly = s.ly;
        }
      } catch (e) { }
      const gx = ch.cx * 16 + lx, gy = ch.cy * 16 + ly;
      ch.pois = ch.pois || [];
      ch.pois = ch.pois.filter(o => o.id !== `quest_${q.id}`);
      ch.pois.push({ id: `quest_${q.id}`, type: "quest", lx, ly, gx, gy, questId: q.id, itemId: q.itemId, n: q.need, taken: false });
      try { await window.World.saveChunk(ch); } catch (e) { }
      try {
        const g = window.Game.G.chunks.get(ch.cx + "," + ch.cy);
        if (g) { g.pois = ch.pois; }
      } catch (e) { }
      q.target.gx = gx; q.target.gy = gy; q.target.cx = ch.cx; q.target.cy = ch.cy;
      return true;
    } catch (e) { return false; }
  }

  // ---------- text ----------
  function itemLabel(id, n) {
    try {
      const it = window.Items.ITEMS[id];
      if (it) return `${it.name}${n > 1 ? " x" + n : ""}`;
    } catch (e) { }
    return `${id}${n > 1 ? " ×" + n : ""}`;
  }
  function mobLabel(kind, n) {
    const base = MOB_LABEL[kind] || (kind + "s");
    return n > 1 ? `${n} ${base}` : `a ${base.replace(/s$/, "")}`;
  }
  function objectiveText(q) {
    if (q && q.type === "chain") return chainObjectiveText(q);
    switch (q.type) {
      case "fetch": {
        const w = q.target && q.target.placeName ? ` at ${q.target.placeName}` : "";
        return `Pick up ${itemLabel(q.itemId, q.need)}${w} (${Math.min(q.have | 0, q.need | 0)}/${q.need | 0})`;
      }
      case "slay": {
        const w = q.target && q.target.placeName ? ` near ${q.target.placeName}` : "";
        return `Slay ${mobLabel(q.mobKind, q.need)}${w} (${Math.min(q.have | 0, q.need | 0)}/${q.need | 0})`;
      }
      case "clear": {
        const w = q.target && q.target.name ? ` ${q.target.name}` : " the delve";
        const v = q.target && q.target.placeName ? ` to save ${q.target.placeName}` : "";
        return `Clear${w}${v} — slay its boss${(q.have | 0) > 0 ? " (done!)" : ""}`;
      }
      case "siege": {
        const w = q.target && q.target.placeName ? ` ${q.target.placeName}` : " the holding";
        const b = q.bossName ? ` — slay ${q.bossName}` : " — slay its warlord";
        return `Destroy${w}${b} (${Math.min(q.have | 0, 1)}/1)`;
      }
      case "deliver": {
        const w = q.deliverTo ? ` to ${q.deliverTo.name}${q.target && q.target.placeName ? ` (${q.target.placeName})` : ""}` : "";
        return `Deliver ${itemLabel(q.itemId, q.need)}${w}`;
      }
      case "tutorial": {
        const steps = q.steps || [];
        const done = steps.filter(s => s.done).length;
        const next = steps.find(s => !s.done);
        let s = `Training ${done}/${steps.length}${next ? " — next: " + next.text : " — all done, claim below!"}`;
        // spell step names its real key so the log matches the spotlight
        try {
          if (next && next.id === "spell") {
            let k = "3";
            try { const p = P(); const i = (p.hotbar || []).findIndex(x => x && x.kind === "ability" && (x.id === "frostbite" || x.id === "fireball")); if (i >= 0) k = String(i + 1); } catch (e) { }
            s += ` (press ${k})`;
          }
        } catch (e) { }
        return s;
      }
      default: return q.desc || "Aid the realm.";
    }
  }
  // ---------- multi-stage sagas (chains of existing quest methods) ----------
  function chainStage(q) {
    try {
      if (!q || q.type !== "chain" || !Array.isArray(q.stages)) return null;
      return q.stages[Math.max(0, Math.min(q.stages.length - 1, q.stageIdx | 0))] || null;
    } catch (e) { return null; }
  }
  function stageObjectiveText(st, target, have, need) {
    try {
      const h = have | 0, n = need | 0 || st.need | 0 || 1;
      if (st.type === "fetch") {
        const w = target && target.placeName ? ` at ${target.placeName}` : (st.place ? ` at ${st.place}` : "");
        return `Pick up ${itemLabel(st.itemId || "herb", n)}${w} (${Math.min(h, n)}/${n})`;
      }
      if (st.type === "slay") {
        const w = target && target.placeName ? ` near ${target.placeName}` : (st.place ? ` near ${st.place}` : "");
        return `Slay ${mobLabel(st.mobKind || "goblin", n)}${w} (${Math.min(h, n)}/${n})`;
      }
      if (st.type === "clear") {
        const w = (target && target.name) || st.dungeon || " the delve";
        return `Clear ${w} — slay its boss${h > 0 ? " (done!)" : ""}`;
      }
      if (st.type === "deliver") {
        const who = (st.deliverTo && (st.deliverTo.name || st.deliverTo)) || st.deliverToName || "a friend";
        const w = target && target.placeName ? ` (${target.placeName})` : (st.place ? ` (${st.place})` : "");
        return `Deliver ${itemLabel(st.itemId || "herb", n)} to ${who}${w}`;
      }
    } catch (e) { }
    return "Aid the realm.";
  }
  function chainObjectiveText(q) {
    try {
      const stages = Array.isArray(q.stages) ? q.stages : [];
      const i = Math.max(0, Math.min(stages.length - 1, q.stageIdx | 0));
      const st = stages[i];
      if (!st) return q.desc || "A saga unfolds.";
      const cur = stageObjectiveText(st, q.target, q.have, q.need);
      return `Stage ${i + 1}/${stages.length} — ${cur}`;
    } catch (e) { return q.desc || "A saga unfolds."; }
  }
  function chainIsFinal(q) {
    try { return (q.stageIdx | 0) >= ((q.stages || []).length - 1); } catch (e) { return true; }
  }
  async function removeQuestCache(q, stageIdx) {
    try {
      const id = stageIdx == null ? `quest_${q.id}` : `quest_${q.id}_${stageIdx}`;
      const t = q.target || {};
      const cx = Math.floor((t.gx || 0) / 16), cy = Math.floor((t.gy || 0) / 16);
      const ch = await window.World.getChunk(cx, cy).catch(() => null);
      if (ch && ch.pois) {
        const before = ch.pois.length;
        ch.pois = ch.pois.filter(o => o.id !== id && o.id !== `quest_${q.id}`);
        if (ch.pois.length !== before) await window.World.saveChunk(ch).catch(() => { });
      }
    } catch (e) { }
  }
  async function setupChainStage(q, idx) {
    // resolve the idx-th stage into the live q.target/need/have/itemId fields
    const p = P(); if (!p || !q || q.type !== "chain") return false;
    const stages = Array.isArray(q.stages) ? q.stages : [];
    const st = stages[idx];
    if (!st) return false;
    q.stageIdx = idx;
    q.stageType = st.type;
    q.need = Math.max(1, Math.min(st.type === "slay" ? 10 : 6, Math.round(Number(st.need) || (st.type === "slay" ? 4 : 2))));
    q.have = 0;
    q.delivered = false;
    q.mobKind = st.mobKind || q.mobKind || "goblin";
    q.itemId = st.itemId || q.itemId || "herb";
    if (st.type === "deliver") q.deliverTo = { name: (st.deliverTo && st.deliverTo.name) || st.deliverToName || st.deliverTo || "a friend" };
    else if (st.deliverTo) q.deliverTo = st.deliverTo;
    q.turnIn = (idx >= stages.length - 1) ? !!q.finalTurnIn : false;
    if (st.type === "clear") {
      const d = await ensureDungeonTarget(st.place || st.dungeon || "");
      if (!d) return false;
      q.target = { dungeonId: d.dungeonId, name: d.name, placeName: null, gx: d.gx, gy: d.gy, cx: d.cx, cy: d.cy };
      stages[idx].target = q.target;
    } else if (st.type === "deliver") {
      let where = st.place ? await findPlaceEverywhere(st.place) : null;
      if (!where) where = await ensureOverworldPlace(st.place || "", st.story || "");
      const recipName = (st.deliverTo && st.deliverTo.name) || st.deliverToName || (typeof st.deliverTo === "string" ? st.deliverTo : "") || "a friend";
      const recip = await findNpcEverywhere(recipName, where && where.placeName);
      if (recip) {
        stages[idx].deliverTo = { name: recip.name, npcId: recip.id };
        q.deliverTo = { name: recip.name, npcId: recip.id };
        q.target = { placeName: recip.placeName || where.placeName, gx: recip.x ?? recip.gx, gy: recip.y ?? recip.gy, cx: null, cy: null };
      } else {
        // recipient gone — cache the parcel locally as a fetch instead
        st.type = "fetch";
        q.stageType = "fetch";
        stages[idx].type = "fetch";
        q.target = { placeName: where.placeName, gx: where.gx, gy: where.gy, cx: where.cx, cy: where.cy };
        q.turnIn = (idx >= stages.length - 1) ? !!q.finalTurnIn : false;
        if (!(await placeQuestCacheFor(q, idx))) return false;
        return true;
      }
      // entrust the parcel for this leg now
      try { window.Items.addItem(p, q.itemId, q.need); } catch (e) { }
      stages[idx].target = q.target;
    } else {
      let where = st.place ? await findPlaceEverywhere(st.place) : null;
      if (!where) where = await ensureOverworldPlace(st.place || "", st.story || "");
      q.target = { placeName: where.placeName, gx: where.gx, gy: where.gy, cx: where.cx, cy: where.cy };
      stages[idx].target = q.target;
      if (st.type === "fetch" && !(await placeQuestCacheFor(q, idx))) return false;
    }
    save();
    return true;
  }
  async function placeQuestCacheFor(q, stageIdx) {
    // stage-aware cache: POI id quest_<qid>_<stage>, item from the stage
    try {
      const st = (q.stages || [])[stageIdx] || {};
      const t = q.target || {};
      const cx = Math.floor((t.gx || 0) / 16), cy = Math.floor((t.gy || 0) / 16);
      const ch = await window.World.getChunk(cx, cy);
      if (!ch) return false;
      let lx = 8, ly = 8;
      try {
        const T = window.CFG.T, SOLID = window.CFG.SOLID, N = 16;
        const W = ch.tiles;
        const solidAt = (x, y) => x < 0 || y < 0 || x >= N || y >= N || SOLID.has(W[y * N + x]);
        const seen = new Array(N * N).fill(false);
        let bestCells = null;
        for (let sy = 1; sy < N - 1; sy++) for (let sx = 1; sx < N - 1; sx++) {
          if (seen[sy * N + sx] || solidAt(sx, sy)) continue;
          const cells = [];
          const stack = [[sx, sy]];
          seen[sy * N + sx] = true;
          while (stack.length) {
            const [qx, qy] = stack.pop();
            cells.push([qx, qy]);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = qx + dx, ny = qy + dy;
              if (nx < 1 || ny < 1 || nx >= N - 1 || ny >= N - 1) continue;
              if (seen[ny * N + nx] || solidAt(nx, ny)) continue;
              seen[ny * N + nx] = true;
              stack.push([nx, ny]);
            }
          }
          if (!bestCells || cells.length > bestCells.length) bestCells = cells;
        }
        if (bestCells && bestCells.length) {
          const wet = ([px, py]) => {
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = px + dx, ny = py + dy;
              if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
              const tt = W[ny * N + nx];
              if (tt === T.WATER || tt === T.DEEPWATER) return true;
            }
            return false;
          };
          const dry = bestCells.filter(c => !wet(c));
          const pool = dry.length ? dry : bestCells;
          const s = pool[(Math.random() * pool.length) | 0] || [8, 8];
          lx = s[0]; ly = s[1];
        } else {
          const spots = window.World.findWalkableSpots(ch, 5) || [];
          const s = spots[(Math.random() * spots.length) | 0] || { lx: 8, ly: 8 };
          lx = s.lx; ly = s.ly;
        }
      } catch (e) { }
      const gx = ch.cx * 16 + lx, gy = ch.cy * 16 + ly;
      const pid = `quest_${q.id}_${stageIdx}`;
      ch.pois = ch.pois || [];
      ch.pois = ch.pois.filter(o => o.id !== pid && o.id !== `quest_${q.id}`);
      ch.pois.push({ id: pid, type: "quest", lx, ly, gx, gy, questId: q.id, stageIdx, itemId: st.itemId || q.itemId, n: q.need, taken: false });
      try { await window.World.saveChunk(ch); } catch (e) { }
      try {
        const g = window.Game.G.chunks.get(ch.cx + "," + ch.cy);
        if (g) { g.pois = ch.pois; }
      } catch (e) { }
      q.target.gx = gx; q.target.gy = gy; q.target.cx = ch.cx; q.target.cy = ch.cy;
      try { const st2 = (q.stages || [])[stageIdx]; if (st2) st2.target = q.target; } catch (e) { }
      return true;
    } catch (e) { return false; }
  }
  async function advanceChain(q) {
    try {
      const p = P(); if (!p || !q || q.type !== "chain") return false;
      const stages = Array.isArray(q.stages) ? q.stages : [];
      const doneSt = stages[q.stageIdx | 0];
      if (doneSt && doneSt.story) pushStory(q, `Stage ${Math.min(stages.length, (q.stageIdx | 0) + 1)}: ${doneSt.story}`);
      if (chainIsFinal(q)) {
        if (q.turnIn || q.finalTurnIn) {
          q.status = "turnin";
          save();
          try { window.UI.toast(`📜 ${q.title}: report back to ${q.giver ? q.giver.name : "your giver"}!`, 5000); } catch (e) { }
          try { if (window.UI.renderQuests) window.UI.renderQuests(); } catch (e) { }
          return true;
        }
        complete(q, "chain");
        return true;
      }
      const next = (q.stageIdx | 0) + 1;
      // clear the finished leg's cache marker if any
      try { await removeQuestCache(q, q.stageIdx | 0); } catch (e) { }
      const ok = await setupChainStage(q, next);
      if (!ok) { complete(q, "chain-short"); return true; }
      const st = stages[next];
      pushStory(q, st && st.story ? `Stage ${next + 1}: ${st.story}` : "");
      save();
      try {
        window.UI.toast(`📜 ${q.title}: stage ${next + 1}/${stages.length} — ${chainObjectiveText(q)}`, 6000);
        if (window.UI.showQuestBanner) window.UI.showQuestBanner("📜", `${q.title} — stage ${next + 1}/${stages.length}`, chainObjectiveText(q));
        window.Sfx.coin();
        if (window.UI.renderQuests) window.UI.renderQuests();
      } catch (e) { }
      return true;
    } catch (e) { return false; }
  }
  function statusText(q) {
    if (q.status === "done") return "✅ Complete";
    if (q.status === "abandoned") return "🚫 Abandoned";
    if (q.status === "turnin") return q.turnIn ? "📨 Report back" : "✅ Ready";
    if (q && q.type === "chain") {
      try {
        const n = (q.stages || []).length || 1;
        const i = Math.min(n, (q.stageIdx | 0) + 1);
        const pct = q.need ? Math.round(100 * Math.min(1, (q.have | 0) / q.need)) : 0;
        return `📜 ${i}/${n} · ${pct}%`;
      } catch (e) { }
    }
    const pct = q.need ? Math.round(100 * Math.min(1, (q.have | 0) / q.need)) : 0;
    return `🗡️ ${pct}%`;
  }
  function targetPos(q) {
    try {
      const t = q.target || {};
      const curType = (q && q.type === "chain") ? (q.stageType || (chainStage(q) || {}).type) : q.type;
      if (curType === "clear" && (t.gx == null)) return null;
      if (t.gx != null && t.gy != null) return { x: t.gx, y: t.gy, dungeon: curType === "clear", dungeonId: t.dungeonId || null };
      return null;
    } catch (e) { return null; }
  }
  function distToTarget(q) {
    try {
      const p = P(); const tp = targetPos(q);
      if (!p || !tp) return null;
      if (p.inDungeon) return null;
      return Math.hypot(tp.x - p.x, tp.y - p.y);
    } catch (e) { return null; }
  }

  // ---------- core ops ----------
  function isObjectiveMet(q) {
    if (q && q.type === "chain") {
      const st = chainStage(q);
      const t = (st && st.type) || q.stageType;
      if (t === "clear") return (q.have | 0) > 0;
      if (t === "siege") return (q.have | 0) > 0;
      if (t === "deliver") return !!q.delivered;
      return (q.have | 0) >= (q.need | 0);
    }
    if (q.type === "clear") return (q.have | 0) > 0;
    if (q.type === "siege") return (q.have | 0) > 0;
    if (q.type === "deliver") return !!q.delivered;
    return (q.have | 0) >= (q.need | 0);
  }
  function checkAuto(q) {
    if (!q || q.status !== "active") return false;
    if (q.type === "tutorial") return false; // completes only via the reward choice
    if (q.type === "chain") {
      if (!isObjectiveMet(q)) return false;
      // advance async (resolves next stage target/cache); fire-and-forget from sync triggers
      try { advanceChain(q).catch(() => { }); } catch (e) { }
      return true;
    }
    if (!isObjectiveMet(q)) return false;
    if (q.turnIn && (q.type === "fetch" || q.type === "slay")) { q.status = "turnin"; save(); return true; }
    complete(q, "auto");
    return true;
  }
  function complete(q, how) {
    const p = P(); if (!p || !q || q.status === "done") return false;
    q.status = "done"; q.doneAt = Date.now();
    // finalize the saga's heard story: premise + every chapter in order
    try {
      if (q.type === "chain" && Array.isArray(q.stages)) {
        q.storyLog = [];
        if (q.story) q.storyLog.push(String(q.story));
        q.stages.forEach((st, i) => { if (st && st.story) q.storyLog.push(`Stage ${i + 1}: ${st.story}`); });
      } else if (!Array.isArray(q.storyLog) || !q.storyLog.length) {
        q.storyLog = [q.story || q.desc || ""].filter(Boolean);
      }
    } catch (e) { }
    const r = q.reward || rewardFor(p, q.diff || 1);
    try {
      p.gold = (p.gold | 0) + (r.gold | 0);
      const res = window.Entities.gainXp(p, r.xp | 0);
      if (res && res.leveled) {
        try {
          window.UI.toast(`⬆️ Level ${p.lv}! +${res.statPoints || 0} stat pts — press C (character). Skill trees earn their own points by use: hits, casts, parries.`, 6000);
          if (window.UI.showLevelUp) window.UI.showLevelUp(p.lv, res.statPoints, 0, res.newAbilities);
          window.UI.updateHUD(); window.UI.updateHotbar();
        } catch (e) { }
      }
      for (const it of (r.items || [])) { try { window.Items.addItem(p, it.id, it.n | 0 || 1); } catch (e) { } }
      if ((q.diff | 0) >= 3) {
        try {
          const isCata = (id) => { try { return window.Items.isCataTome(id); } catch (e) { return /^tome_(tidal_wave|energy_beam|meteorfall|whiteout|hurricane)$/.test(id); } };
          const unk = (window.Items.unknownTomes(p) || []).filter(id => !isCata(id));
          if (unk.length) {
            const t = unk[(Math.random() * unk.length) | 0];
            window.Items.addItem(p, t, 1);
            r.items = (r.items || []).concat([{ id: t, n: 1 }]);
          }
        } catch (e) { }
      }
    } catch (e) { }
    const bits = (r.items || []).map(d => itemLabel(d.id, d.n)).join(", ");
    try {
      window.UI.toast(`📜 Quest complete: ${q.title} — +${r.gold} gold, +${r.xp} XP${bits ? " · " + bits : ""}`, 6000);
      if (window.UI.showQuestBanner) window.UI.showQuestBanner("📜", "Quest complete: " + q.title, "🎁 " + rewardText(r));
      try { if (window.Game && window.Game.announceLoot) window.Game.announceLoot(`📜 ${q.title}`, r.gold | 0, r.items || []); } catch (e2) { }
      window.Sfx.level();
      window.UI.updateHUD(); window.UI.updateHotbar();
    } catch (e) { }
    try { pruneHistory(p); } catch (e) { }
    save();
    try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) { }
    return true;
  }
  function abandon(id) {
    const p = P(); if (!p) return false;
    const qs = ensure(p);
    const i = qs.findIndex(q => q.id === id);
    if (i < 0) return false;
    const q = qs[i];
    if (!q) return false;
    // snapshot the story heard so far BEFORE marking abandoned
    try {
      if (q.type === "chain") {
        const stages = Array.isArray(q.stages) ? q.stages : [];
        const log = [];
        if (q.story) log.push(String(q.story));
        const upto = Math.min(stages.length, (q.stageIdx | 0) + 1);
        for (let s = 0; s < upto; s++) {
          const st = stages[s];
          if (st && st.story) log.push(`Stage ${s + 1}${s === (q.stageIdx | 0) ? " (unfinished)" : ""}: ${st.story}`);
        }
        q.storyUpTo = log.join(" ").slice(0, 1800);
        q.storyLog = log;
      } else {
        const base = (Array.isArray(q.storyLog) && q.storyLog.length ? q.storyLog.join(" ") : (q.story || q.desc || "")).slice(0, 1200);
        const prog = (q.need > 1 && q.type !== "tutorial") ? ` [Left at ${Math.min(q.have | 0, q.need | 0)}/${q.need | 0}.]` : "";
        q.storyUpTo = (base + prog).slice(0, 1400);
        if (!Array.isArray(q.storyLog) || !q.storyLog.length) q.storyLog = [q.story || q.desc || ""].filter(Boolean);
      }
    } catch (e) { }
    q.status = "abandoned"; q.abandonedAt = Date.now();
    // release tagged mobs + remove unclaimed cache(s)
    try {
      for (const m of window.Game.G.mobs) if (m.questId === id) { m.questId = null; }
    } catch (e) { }
    try {
      if (q.type === "fetch") {
        const t = q.target || {};
        window.World.getChunk(Math.floor((t.gx || 0) / 16), Math.floor((t.gy || 0) / 16)).then(ch => {
          if (!ch || !ch.pois) return;
          ch.pois = ch.pois.filter(o => o.id !== `quest_${id}`);
          window.World.saveChunk(ch);
        }).catch(() => { });
      } else if (q.type === "chain") {
        removeQuestCache(q, q.stageIdx | 0).catch(() => { });
      }
    } catch (e) { }
    try { window.UI.toast(`📜 Quest abandoned: ${q.title}`, 3000); } catch (e) { }
    if (q && q.type === "tutorial") { try { if (window.UI && window.UI.clearTutGuide) window.UI.clearTutGuide(); } catch (e) { } }
    try { pruneHistory(p); } catch (e) { }
    save();
    try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) { }
    try { if (window.UI && window.UI.refreshTutGuide) window.UI.refreshTutGuide(); } catch (e) { }
    return true;
  }

  // ---------- triggers ----------
  function chainSlayKind(q) {
    try {
      if (q.type !== "chain") return q.mobKind;
      const st = chainStage(q);
      if (!st || st.type !== "slay") return null;
      return st.mobKind || q.mobKind;
    } catch (e) { return null; }
  }
  function onKill(src, tgt) {
    try {
      const p = P(); if (!p || !tgt) return;
      let changed = false;
      for (const q of ensure(p)) {
        if (q.status !== "active") continue;
        const curType = q.type === "chain" ? ((chainStage(q) || {}).type || q.stageType) : q.type;
        const curKind = q.type === "chain" ? chainSlayKind(q) : q.mobKind;
        if ((q.type === "slay" || (q.type === "chain" && curType === "slay")) && !isObjectiveMet(q)) {
          if ((tgt.kind === curKind || tgt.questKind === curKind) && (tgt.questId === q.id || tgt.xpReward != null)) {
            q.have = Math.min(q.need | 0, (q.have | 0) + 1);
            changed = true;
            try { window.UI.toast(`📜 ${q.title}: ${(q.have | 0)}/${q.need | 0} ${MOB_LABEL[curKind] || curKind}`, 2500); } catch (e) { }
            checkAuto(q);
          }
        } else if (q.type === "siege" && tgt.isBoss && tgt.baseId && q.target && q.target.baseId === tgt.baseId) {
          // the holding's warlord falls — whoever struck the blow
          q.have = 1;
          changed = true;
          complete(q, "siege");
        } else if ((q.type === "clear" || (q.type === "chain" && curType === "clear")) && tgt.isBoss && tgt.hp <= 0) {
          const qd = String((q.target && q.target.dungeonId) || "").replace(/_L\d+$/, "");
          const td = String(tgt.dungeonId || "").replace(/_L\d+$/, "");
          const inQ = !p.inDungeon ? false : String((window.Game.G.dungeon && (window.Game.G.dungeon.baseId || window.Game.G.dungeon.id)) || "").replace(/_L\d+$/, "") === qd;
          if ((qd && (qd === td || inQ)) || (!qd && p.inDungeon)) {
            q.have = 1;
            changed = true;
            if (q.type === "chain") checkAuto(q);
            else complete(q, "boss");
          }
        }
      }
      if (changed) { save(); try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) { } }
    } catch (e) { }
  }
  async function onTakeCache(poi) {
    try {
      const p = P(); if (!p || !poi || poi.type !== "quest" || poi.taken) return false;
      const q = get(p, poi.questId);
      if (!q || q.status === "done" || q.status === "abandoned") return false;
      const curType = q.type === "chain" ? ((chainStage(q) || {}).type || q.stageType) : q.type;
      if (q.type === "chain" && poi.stageIdx != null && (poi.stageIdx | 0) !== (q.stageIdx | 0)) return false;
      if (curType !== "fetch") return false;
      poi.taken = true;
      q.have = q.need | 0;
      try { window.Items.addItem(p, poi.itemId || q.itemId, poi.n || q.need || 1); } catch (e) { }
      try {
        window.UI.toast(`📜 ${q.title}: ${itemLabel(poi.itemId || q.itemId, poi.n || q.need || 1)} recovered!`, 4000);
        try { if (window.Game && window.Game.announceLoot) window.Game.announceLoot(`📜 ${q.title}`, 0, [{ id: poi.itemId || q.itemId, n: poi.n || q.need || 1 }]); } catch (e2) { }
        window.Sfx.coin();
      } catch (e) { }
      try {
        const ch = window.World._mem.chunks.get(window.World.chunkKey(Math.floor(poi.gx / 16), Math.floor(poi.gy / 16)));
        if (ch) { ch.pois = (ch.pois || []).filter(o => o.id !== poi.id); await window.World.saveChunk(ch); }
        // multiplayer: the taken cache vanishes on every screen too
        try {
          if (window.MP && window.MP.notifyPoiLooted) window.MP.notifyPoiLooted(poi.id, "removed", Math.floor(poi.gx / 16), Math.floor(poi.gy / 16));
        } catch (e2) { }
      } catch (e) { }
      checkAuto(q);
      save();
      try { window.UI.updateHUD(); window.UI.updateHotbar(); if (window.UI.renderQuests) window.UI.renderQuests(); } catch (e) { }
      return true;
    } catch (e) { return false; }
  }
  function onTalk(npc) {
    try {
      const p = P(); if (!p || !npc) return null;
      // talking to a quest target completes deliveries; talking to a giver
      // surfaces their awaiting turn-in (chat UI shows the report button)
      for (const q of ensure(p)) {
        if (q.status === "turnin" && q.giver && q.giver.npcId === npc.id) return { turnin: q };
        const curType = q.type === "chain" ? ((chainStage(q) || {}).type || q.stageType) : q.type;
        const curTo = q.deliverTo;
        if (q.status === "active" && (q.type === "deliver" || (q.type === "chain" && curType === "deliver")) && curTo && String(npc.name || "").trim().toLowerCase() === String(curTo.name || "").trim().toLowerCase()) {
          if (q.type === "chain") {
            q.delivered = true;
            try { checkAuto(q); } catch (e) { }
            save();
            try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e2) { }
            return { delivered: q };
          }
          q.delivered = true;
          complete(q, "deliver");
          return { delivered: q };
        }
      }
      return null;
    } catch (e) { return null; }
  }
  // Pre-response QUEST DECISION (runs before the AI replies): inspects the
  // message + quest state and returns context the reply must honor. Never
  // changes state — it only decides what the reply should be about, so the
  // NPC briefs the real quest instead of inventing one.
  function preTalk(npc, p, text) {
    try {
      if (!npc || !p) return "";
      const t = pendingTurnIn(npc);
      if (t) {
        return `(DECISION: ${p.name} already finished "${t.title}" — it awaits report. Confirm completion warmly, name the reward (${rewardText(t.reward)}), and tell them to use the 📜 Report button (or say "report"). Do NOT offer a new quest instead.)`;
      }
      if (/quest|errand|contract|\btask\b|\bjob\b|package|parcel|fetch|deliver|report/i.test(String(text || ""))) {
        const act = ensure(p).filter(q => (q.status === "active" || q.status === "turnin") && q.giver && q.giver.npcId === npc.id);
        if (act.length) {
          const q = act[0];
          const curItem = q.type === "chain" ? ((chainStage(q) || {}).itemId || q.itemId) : q.itemId;
          const tag = curItem === "mysterious_package" ? " (a sealed 📦 package — it must arrive unopened)" : "";
          return `(DECISION: they ask about work — they already carry your quest "${q.title}"${tag}: ${objectiveText(q)}. Brief them on THAT quest and its next step; do not invent another quest or item.)`;
        }
      }
      return "";
    } catch (e) { return ""; }
  }
  function pendingTurnIn(npc) {
    try {
      const p = P(); if (!p || !npc) return null;
      for (const q of ensure(p)) {
        if (q.status === "turnin" && q.giver && q.giver.npcId === npc.id) return q;
      }
      return null;
    } catch (e) { return null; }
  }
  function turnIn(q) {
    try {
      const p = P(); if (!p || !q || q.status !== "turnin") return false;
      // giver should be near (or in party); if gone from the world, accept remotely
      let near = false, gone = true;
      try {
        for (const n of window.Game.G.npcs) {
          if (n.id !== (q.giver && q.giver.npcId)) continue;
          gone = false;
          if (n.hp > 0) {
            const d = Math.hypot((n.x ?? n.gx) - p.x, (n.y ?? n.gy) - p.y);
            if (d < 9 || n.inParty) near = true;
          }
        }
      } catch (e) { }
      if (!near && !gone) {
        try { window.UI.toast(`📜 Find ${q.giver.name} to report back.`, 3500); } catch (e) { }
        return false;
      }
      complete(q, "turnin");
      return true;
    } catch (e) { return false; }
  }
  function onBossSpawn(mob) {
    try {
      const p = P(); if (!p || !mob) return;
      const d = window.Game.G.dungeon;
      const dBase = String((d && (d.baseId || d.id)) || mob.dungeonId || "").replace(/_L\d+$/, "");
      if (!dBase) return;
      for (const q of ensure(p)) {
        if ((q.status === "active" || q.status === "turnin") && q.type === "clear" && String((q.target && q.target.dungeonId) || "") === dBase) return;
        if (q.status === "done" && q.type === "clear" && String((q.target && q.target.dungeonId) || "") === dBase) return;
      }
      if (active(p).length >= MAX_ACTIVE) return;
      const dName = (d && d.name) || mob.name || "the crypt";
      // giver: nearest townsfolk, else the council
      let giver = { npcId: null, name: "Emberhold council" };
      try {
        let bd = 1e9;
        for (const n of window.Game.G.npcs) {
          if (n.inParty || n.hp <= 0) continue;
          const dd = Math.hypot((n.x ?? n.gx) - p.x, (n.y ?? n.gy) - p.y);
          if (dd < bd) { bd = dd; giver = { npcId: n.id, name: n.name }; }
        }
      } catch (e) { }
      // lorebooks, rarely: roll 1-3 fragments against THIS dungeon's boss.
      // A subject match (very rare) earns a directly-tied story — the giver
      // read the very book about the very thing below; a miss earns at most
      // a rumor line. Most boss quests stay lore-free, as before.
      let bossStory = `The stones of ${dName} have started to breathe at night — livestock missing, lights where no torch burns. ${heroSummary(p)} is the strongest blade within walking distance, so the plea falls on them: go down, find the thing wearing the dark like a cloak, and end it.`;
      let bossLoreRefs = [];
      try {
        const LB = window.Lorebooks;
        if (LB && Math.random() < 0.35) {
          const refs = LB.randomVols(1 + ((Math.random() * 3) | 0)) || [];
          const subj = LB.subjectForBoss(mob && mob.kind);
          const hit = subj ? refs.find(r => r.subject === subj) : null;
          const bossName = (mob && mob.name) || "the thing below";
          if (hit) {
            const faithName = (((LB.FAITHS || {})[hit.faith]) || {}).name || "old";
            const excerpt = String(hit.text || "").replace(/\s+/g, " ").trim().replace(/^Vol\. [IVX]+\s*[—–-]\s*/, "").slice(0, 150).replace(/\s+\S*$/, "");
            bossStory = `${giver.name} pressed a worn copy of "${hit.title}" into your hands — vol. ${hit.vol} of ${hit.nVols}, a ${faithName} telling — and named the thing below ${dName}: ${bossName}. "${excerpt}…" If even half of it is true, ${heroSummary(p).split(" · ")[0]} is the only blade within walking distance that can end it.`;
            bossLoreRefs = [hit.id];
          } else if (refs.length) {
            const r0 = refs[(Math.random() * refs.length) | 0];
            const faithName0 = (((LB.FAITHS || {})[r0.faith]) || {}).name || "old";
            bossStory += ` ${giver.name} quotes a ${faithName0} pamphlet, "${r0.title}," the way travelers quote weather — half belief, half habit.`;
            bossLoreRefs = [r0.id];
          }
        }
      } catch (e) { }
      const q = {
        id: "q" + (p.questSeq++), type: "clear",
        title: `Clear ${dName}`,
        desc: `Slay the boss stirring in ${dName}.`,
        story: bossStory,
        storyLog: [],
        loreRefs: bossLoreRefs,
        giver, target: { dungeonId: dBase, name: dName, placeName: null, gx: null, gy: null },
        need: 1, have: 0, turnIn: false,
        diff: difficultyFor(p, 120), status: "active", createdAt: Date.now(),
      };
      q.storyLog = [q.story];
      q.reward = rewardFor(p, q.diff);
      try {
        const ch = window.Game.G.chunks.get(window.World.chunkKey(Math.floor(p.x / 16), Math.floor(p.y / 16)));
        if (ch && ch.placeName) q.target.placeName = ch.placeName;
        else q.title = `Clear ${dName} to save Emberhold`;
      } catch (e) { }
      ensure(p).push(q);
      try {
        window.UI.toast(`📜 New quest: ${q.title} — slay its boss!`, 5500);
        if (window.UI.showQuestBanner) window.UI.showQuestBanner("📜", "New quest: " + q.title, "Slay its boss!  ·  🎁 " + rewardText(q.reward));
        window.Sfx.talk();
        window.UI.updateHUD();
        if (window.UI.renderQuests) window.UI.renderQuests();
      } catch (e) { }
      save();
    } catch (e) { }
  }
  function isRareDrop(id) {
    try {
      const it = window.Items;
      if (it.HYBRIDS && it.HYBRIDS.includes(id)) return true;
      if (it.LEGENDARIES && it.LEGENDARIES.includes(id)) return true;
      if (/dragonbone/i.test(id)) return true;
      const def = it.ITEMS[id];
      if (def && def.type === "equipment" && (def.price | 0) >= 750) return true;
    } catch (e) { }
    return false;
  }
  function onLootDrops(drops) {
    try {
      const p = P(); if (!p || !drops || !drops.length) return;
      if (active(p).length >= MAX_ACTIVE) return;
      if (P().__rareQcd && Date.now() < P().__rareQcd) return;
      let rare = null;
      for (const d of drops) { if (d && isRareDrop(d.id)) { rare = d.id; break; } }
      if (!rare) return;
      if (Math.random() > 0.5) return;
      let label = rare;
      try { const it = window.Items.ITEMS[rare]; if (it) label = it.name; } catch (e) { }
      const biome = (() => { try { return window.World.biomeAt(Math.round(p.x), Math.round(p.y)); } catch (e) { return "wild"; } })();
      const kindPool = { forest: ["wolf", "goblin", "satyr", "tanuki", "burrow_mole"], dark_forest: ["leshy", "striga", "naga", "gloomspinner"], wild: ["goblin", "slime", "kobold", "burrow_mole"], desert: ["cultist", "skeleton", "anubite", "sandmaw"], tundra: ["rime_wolf", "yuki_onna", "draugr"], mountain: ["skeleton", "cultist", "harpy", "yeti"], volcano: ["wraith", "cultist", "oni_imp", "phoenix"], lake: ["slime", "bat", "kappa"], sea: ["kelpie", "siren", "kappa"], ocean: ["siren", "kelpie", "abyss_serpent"], plains: ["slime", "goblin", "centaur_foal", "burrow_mole"], town: ["bat", "slime"] };
      const pool = kindPool[biome] || ["bat", "slime"];
      const kind = pool[(Math.random() * pool.length) | 0];
      const need = Math.min(8, 3 + (((p.lv || 1) / 10) | 0));
      const q = {
        id: "q" + (p.questSeq++), type: "slay",
        title: `The ${label} thirsts`,
        desc: `Your new relic hums for battle. Blood ${need} ${MOB_LABEL[kind]} with it in hand.`,
        story: `The ${label} has tasted its first battle and wants more — it hums against ${heroSummary(p).split(" · ")[0]}'s hip like a hound straining at the leash. Feed it ${need} ${MOB_LABEL[kind]} and it will settle; starve it and it may turn sullen.`,
        storyLog: [],
        giver: { npcId: null, name: label },
        target: { placeName: null, gx: Math.round(p.x), gy: Math.round(p.y) },
        mobKind: kind, need, have: 0, turnIn: false,
        diff: difficultyFor(p, 60), status: "active", createdAt: Date.now(),
      };
      q.storyLog = [q.story];
      q.reward = rewardFor(p, q.diff);
      ensure(p).push(q);
      p.__rareQcd = Date.now() + RARE_COOLDOWN_MS;
      try {
        window.UI.toast(`📜 New quest: ${q.title} — slay ${need} ${MOB_LABEL[kind]}!`, 5500);
        if (window.UI.showQuestBanner) window.UI.showQuestBanner("📜", "New quest: " + q.title, objectiveText(q) + "  ·  🎁 " + rewardText(q.reward));
        window.Sfx.talk();
        window.UI.updateHUD();
        if (window.UI.renderQuests) window.UI.renderQuests();
      } catch (e) { }
      save();
    } catch (e) { }
  }

  // ---------- Programmatic offer (director decides; compute validates + builds) ----------
  function offlineStorySingle(o, npc, p) {
    // Programmatic tale: giver voice + hero truth + task beat + context color.
    try {
      const hero = heroSummary(p);
      const heroShort = String(hero).split(" · ")[0] || "traveler";
      const giver = (npc && npc.name) || "I";
      const role = (npc && npc.role) || "villager";
      const pers = (npc && npc.personality) || "plain-spoken";
      const place = o.place || "the wilds";
      const speech = (npc && npc.speech) || "";
      const interests = ((npc && npc.interests) || []).slice(0, 3);
      const weaponNote = (() => { try { const w = p && p.equipment && p.equipment.weapon; if (w) { const it = window.Items.ITEMS[w]; return it ? it.name : w; } } catch (e) { } return "bare hands"; })();
      const lastAb = (() => { try { return (p && Array.isArray(p.abilities) && p.abilities.length) ? p.abilities.slice(-1)[0] : ""; } catch (e) { return ""; } })();
      const raceBit = (() => { try { const r = p && (p.race || (p.appearance && p.appearance.race)); return r && r !== "human" ? "your " + r + " stride " : ""; } catch (e) { return ""; } })();
      const tech = lastAb ? ` I saw how you handle ${lastAb} — few ${role}s could teach me that, but I can at least point your ${weaponNote} where it matters.` : ` With that ${weaponNote} and ${raceBit}traveler's legs, you're my best hope.`;
      const quir = (npc && npc.quirk) ? ` (${npc.quirk})` : "";
      const tpl = [
        `${giver} wrings their hands${quir}. "They say a ${pers} ${role} never begs, well — I'm begging.${tech} ${o.title} isn't glory work, but ${place} will remember ${heroShort} kindly for it."`,
        `"You walk like someone who's seen ${place} at its worst," ${giver} says, voice ${pers}. "That's why I'm trusting you.${tech} Do this for ${place}, and the tale stays yours to tell."`,
        `${giver} the ${role} leans close${quir}. "Between you and me — my kin laugh at my ${pers} ways, but this matters.${tech} ${place} raised me; help me pay it back."`,
        `"Funny," ${giver} muses (${pers} as ever${speech ? "; " + speech.split(";")[0] : ""}), "I watched you pass with that ${weaponNote} and thought: there's someone ${place} can believe in.${tech}"`,
        `${giver} counts on fingers, then gives up. "${pers} and proud of it — that's me. But ${place} needs more than pride right now.${tech}"`,
        `"No proverbs," ${giver} says, then offers one anyway. "A ${role}'s word is their bond${interests.length ? ", and mine is sworn on " + interests[0] : ""}.${tech}"`,
        `${giver} looks at your hands, then your eyes. "${heroShort} — I've heard what you can do with that ${weaponNote}.${tech}"`,
        `"The road took my ${interests.length ? interests[0] : "patience"} and left me this errand instead," ${giver} sighs (${pers}). "Take it, and take my thanks with it.${tech}"`,
      ];
      let s = tpl[(Math.random() * tpl.length) | 0];
      if (o.type === "slay") s += ` The ${MOB_LABEL[o.mobKind] || o.mobKind} took something I can't name without shaking — thin them so ${place} breathes again.`;
      else if (o.type === "fetch") { let lb = o.itemId; try { const it = window.Items.ITEMS[o.itemId]; if (it) lb = it.name; } catch (e) { } s += ` Bring me ${o.need}x ${lb} from ${place}; every one carries a little of my family's luck.`; }
      else if (o.type === "clear") s += ` The delve below ${place || "these hills"} stirs at night, and I hear my grandmother's warnings in it. Put its boss down and I'll sleep again.`;
      else if (o.type === "deliver") s += ` Carry it yourself — don't hire it out, don't peek. ${o.deliverTo || "My friend"} waits in ${place}, and this parcel is my word made heavy.`;
      // context color from LorePool (swappable, never the books retold)
      try {
        if (window.LorePool && Math.random() < 0.4) {
          const ctx = o.type === "slay" ? "quest_slay" : o.type === "fetch" ? "quest_fetch" : o.type === "clear" ? "quest_clear" : o.type === "deliver" ? "quest_deliver" : "quest_chain";
          const line = window.LorePool.get(ctx, "");
          if (line) s += " " + line;
        }
      } catch (e) {}
      return cleanStory(s, o.flavor || "The road is dangerous. Will you help?");
    } catch (e) { return String((o && o.flavor) || "The road is dangerous. Will you help?"); }
  }
  function biomeMobKind() {
    // context-aware slay target: undead only where dark, wolves only in forests
    try {
      const p = P(); if (!p) return SLAY_MOB_KINDS[(Math.random() * 6) | 0];
      let b = "wild";
      try { b = window.World.biomeAt(Math.round(p.x), Math.round(p.y)); } catch (e) {}
      const pools = {
        forest: ["wolf", "goblin", "satyr", "tanuki", "burrow_mole", "mushroom"],
        dark_forest: ["skeleton", "wraith", "leshy", "striga", "gloomspinner"],
        desert: ["cultist", "skeleton", "anubite", "sandmaw", "scarab_swarm"],
        tundra: ["wolf", "draugr", "rime_wolf", "yuki_onna", "troll_whelp"],
        mountain: ["skeleton", "cultist", "harpy", "yeti", "goblin"],
        volcano: ["wraith", "cultist", "oni_imp", "phoenix", "skeleton"],
        lake: ["slime", "bat", "kappa", "kelpie"],
        sea: ["kelpie", "siren", "kappa", "bat"],
        ocean: ["siren", "kelpie", "abyss_serpent"],
        wild: ["goblin", "slime", "kobold", "burrow_mole", "bandit", "bat"],
        plains: ["slime", "goblin", "centaur_foal", "burrow_mole", "outlaw"],
        town: ["bat", "slime", "goblin"],
      };
      const pool = pools[b] || pools.wild;
      // night/gloom admits undead anywhere dark
      try {
        let dark = false;
        try { dark = window.Game.isDarkAt(p.x, p.y); } catch (e2) { try { dark = window.Game.isNight && window.Game.isNight(); } catch (e3) {} }
        if (dark && Math.random() < 0.3) return Math.random() < 0.5 ? "skeleton" : "wraith";
      } catch (e) {}
      return pool[(Math.random() * pool.length) | 0];
    } catch (e) { return SLAY_MOB_KINDS[(Math.random() * SLAY_MOB_KINDS.length) | 0]; }
  }
  function fallbackOffer(npc, p) {
    const places = knownPlaceNames(14);
    const place = places.length && Math.random() < 0.6 ? places[(Math.random() * places.length) | 0] : "";
    const recent = recentQuestLines(p, 6).join(" | ").toLowerCase();
    const pickTitle = (cands) => {
      for (const c of cands) { if (recent.indexOf(c.toLowerCase().slice(0, 12)) < 0) return c; }
      return cands[(Math.random() * cands.length) | 0] + " anew";
    };
    const lv = (p && p.lv) || 1;
    // ~40% sagas (2-3 stages), else singles. Chains carry premise + per-stage chapters.
    if (Math.random() < 0.40) {
      const kind = biomeMobKind();
      const itemId = FETCH_ITEMS[(Math.random() * FETCH_ITEMS.length) | 0];
      const item2 = FETCH_ITEMS[(Math.random() * FETCH_ITEMS.length) | 0];
      const arch = (Math.random() * 6) | 0;
      const heroBit = (() => { try { const r = p && (p.race || (p.appearance && p.appearance.race)); return r && r !== "human" ? `, ${r}` : ""; } catch (e) { return ""; } })();
      const giverN = (npc && npc.name) || "I";
      if (arch === 0) {
        const title = pickTitle([`The ${place || "Vale"} Rite`, `Blood and Blade`, `A Family's Due`, `Oath of ${place || "the Hearth"}`]);
        const story = `${giverN} keeps an old ${place || "vale"} custom${heroBit ? `, and your${heroBit} stride tells me you respect old ways` : ""}: the ${MOB_LABEL[kind] || kind} must be thinned before the ceremonial blade can be lifted. Slay them, then bring the blade home so the rite holds.`;
        const s1 = `The old rite demands it — ${MOB_LABEL[kind] || kind} blood first, else the blade stays cold. ${place || "The wilds"} will test your arm before it trusts your hands.`;
        const s2 = `The blade sleeps in ${place || "a hidden cache"}. Lift it gently, carry it like kin — it has waited longer than I have lived.`;
        return { type: "chain", title, place, story, turnIn: Math.random() < 0.5, flavor: "Blood first, then the blade — as my family has always done.", stages: [{ type: "slay", mobKind: kind, need: 3 + ((Math.random() * 3) | 0), place, story: s1 }, { type: "fetch", itemId, need: 1 + ((Math.random() * 2) | 0), place, story: s2 }] };
      } else if (arch === 1) {
        const title = pickTitle([`Herbs for ${place || "the Hearth"}`, `The Healer's Debt`, `A Cure in Two Hands`, `Bitter Leaves`]);
        const story = `${giverN} owes ${place || "a neighbor"} a cure that takes two trips: gather, then carry. Times are lean and I can only trust a traveler who has already proven kind.`;
        return { type: "chain", title, place, story, turnIn: true, flavor: "Gather, then carry — two trips, one promise.", stages: [{ type: "fetch", itemId, need: 2 + ((Math.random() * 2) | 0), place, story: `The ${itemId} only grows wild near ${place || "the treeline"}. Pick it fresh — bruised leaves brew bitter.` }, { type: "deliver", itemId, need: 1 + ((Math.random() * 2) | 0), place, deliverTo: "", story: `The cure must travel warm to ${place || "my friend"}. Walk it there yourself; the road is the last ingredient.` }] };
      } else if (arch === 2) {
        const title = pickTitle([isNaN(0)?"x":`What Fled Below`, `Teeth in the Dark`, `The Crypt's Echo`, `Down Where They Ran`]);
        const story = `The ${MOB_LABEL[kind] || kind} you thin on the surface are only the spill — their heart nests in the delve below ${place || "the hills"}. Cut the pack, then descend and finish it.`;
        return { type: "chain", title, place, story, turnIn: false, flavor: "They run below when hurt. Follow.", stages: [{ type: "slay", mobKind: kind, need: 3 + ((Math.random() * 3) | 0), place, story: `They den near ${place || "the stones"}. Blood them and the rest will bolt for the dark.` }, { type: "clear", place: "", dungeon: "", need: 1, story: `The survivors fled down. The delve keeps their leavings — and their master. End it where it hides.` }] };
      } else if (arch === 3) {
        const title = pickTitle([`The Caravan's Price`, `Road Debts`, `Teeth on the Trail`]);
        const story = `${giverN} runs goods through country where ${MOB_LABEL[kind] || kind} tax every wheel. Clear the road, then walk the parcel through yourself — hired blades talk, and this cargo listens.`;
        return { type: "chain", title, place, story, turnIn: false, flavor: "Clear the road, then walk it.", stages: [{ type: "slay", mobKind: kind, need: 3 + ((Math.random() * 3) | 0), place, story: `They hit the last two wagons near ${place || "the bend"}. Leave none to report back.` }, { type: "deliver", itemId, need: 2, place, deliverTo: "", story: `The way is open — now the parcel must travel warm. Carry it yourself; the road is the last guard.` }] };
      } else if (arch === 4) {
        const title = pickTitle([`What Was Taken`, `The Empty Shelf`, `Sealed and Stolen`]);
        const story = `Something sealed went missing on the way to ${place || "the market"} — ${giverN} won't say what, only that it must come back unopened. Find what's scattered, carry what's left, and ask no questions.`;
        return { type: "chain", title, place, story, turnIn: true, flavor: "Find it, carry it, don't open it.", stages: [{ type: "fetch", itemId: "mysterious_package", need: 1, place, story: `One parcel lies where it fell near ${place || "the stones"}. Lift it gently — the seal matters more than the weight.` }, { type: "deliver", itemId: "mysterious_package", need: 1, place, deliverTo: "", story: `Now walk it the rest of the way yourself. Don't hire it out, don't peek.` }] };
      } else {
        const kind2 = biomeMobKind();
        const title = pickTitle([`Two Nests`, `The Spreading Dark`, `Roots and Teeth`]);
        const story = `${place || "The wilds"} has two problems wearing the same shadow: ${MOB_LABEL[kind] || kind} above, and worse below. ${giverN} has watched both from a window too long.`;
        return { type: "chain", title, place, story, turnIn: false, flavor: "Two nests, one shadow.", stages: [{ type: "slay", mobKind: kind, need: 3 + ((Math.random() * 2) | 0), place, story: `First nest: ${MOB_LABEL[kind] || kind} near ${place || "the treeline"}. Thin them.` }, { type: "slay", mobKind: kind2, need: 3 + ((Math.random() * 2) | 0), place, story: `Second nest: ${MOB_LABEL[kind2] || kind2} where the first fled. Finish it.` }, { type: "clear", place: "", dungeon: "", need: 1, story: `The rest ran below. End it where it hides.` }].slice(0, 2 + ((Math.random() * 2) | 0)) };
      }
    }
    // Singles: type weighted by context (clear needs a nearby delve to resolve)
    const roll = Math.random();
    let t = roll < 0.30 ? "slay" : roll < 0.55 ? "fetch" : roll < 0.70 ? "deliver" : roll < 0.85 ? "clear" : "slay";
    let o;
    if (t === "slay") {
      const kind = biomeMobKind();
      const need = Math.max(3, Math.min(8, 3 + ((lv / 12) | 0) + ((Math.random() * 3) | 0)));
      o = { type: "slay", title: pickTitle([`Cull the ${MOB_LABEL[kind]}`, `Teeth at ${place || "the fence"}`, `Quiet the ${MOB_LABEL[kind]}`, `Blood for ${place || "the Hearth"}`, `The ${MOB_LABEL[kind]} Tithe`]), mobKind: kind, need, place, turnIn: Math.random() < 0.35, flavor: "They press in on every side." };
    } else if (t === "clear") o = { type: "clear", title: pickTitle(["A delve needs clearing", `Dark below ${place || "the hills"}`, "What stirs below", `Silence ${place || "the Deep"}`]), dungeon: "", turnIn: false, flavor: "Something stirs below." };
    else if (t === "deliver") {
      const itemId = FETCH_ITEMS[(Math.random() * FETCH_ITEMS.length) | 0];
      o = { type: "deliver", title: pickTitle(["Carry my goods", `A parcel for ${place || "a friend"}`, "Sealed with trust", `Warm Hands to ${place || "the Hearth"}`]), itemId, need: 1 + ((Math.random() * 2) | 0), place, turnIn: false, flavor: "It must reach them unopened." };
    } else {
      const itemId = FETCH_ITEMS[(Math.random() * FETCH_ITEMS.length) | 0];
      o = { type: "fetch", title: pickTitle(["Gather supplies", `What ${place || "the stores"} lack`, "Against the lean days", `The ${place || "Vale"} Stores`]), itemId, need: 2 + ((Math.random() * 3) | 0) + ((lv / 20) | 0), place, turnIn: Math.random() < 0.6, flavor: "The stores run thin." };
    }
    o.story = offlineStorySingle(o, npc, p);
    try {
      const LB = window.Lorebooks;
      if (LB && Math.random() < 0.5) {
        const refs = LB.randomVols(1) || [];
        const r = refs[0];
        if (r) {
          const faithName = (((LB.FAITHS || {})[r.faith]) || {}).name || "old";
          const tpl = [
            ` A ${faithName} page they once heard read aloud — "${r.title}" — put the thought in their head, though they'd deny reading such things.`,
            ` They swear a verse from "${r.title}" (a ${faithName} telling) backs them up, and dare you to find the book and prove otherwise.`,
            ` It started, they admit, with a torn page of "${r.title}" blowing down the road — they kept it, and it kept them.`,
          ];
          o.story = cleanStory(o.story + tpl[(Math.random() * tpl.length) | 0], o.flavor);
          o.loreRefs = [r.id];
        }
      }
    } catch (e) { }
    return o;
  }
  async function offerFor(npc, opts) {
    const p = P(); if (!p || !npc) return null;
    opts = opts || {};
    if (active(p).length >= MAX_ACTIVE) return { error: "full" };
    // war parties ask for one thing only: help break their holding. No AI
    // call — the target, boss and place are already known, and the fiction
    // must not wobble into a fetch quest mid-march.
    if (npc.armyBase && npc.armyBase.baseId) {
      let bossName = "its warlord";
      try {
        const tpl = window.CFG.MOB_TEMPLATES[npc.armyBase.boss];
        if (tpl && tpl.name) bossName = tpl.name;
      } catch (e) { }
      return coerceOffer({
        type: "siege",
        title: `Break ${npc.armyBase.name}`,
        place: npc.armyBase.name,
        need: 1, turnIn: false,
        flavor: `${bossName} must fall. March with us, ${p.name}!`,
        story: `The war party marches on ${npc.armyBase.name} because ${bossName} has held these roads too long. ${heroSummary(p)} fights beside the column — not for pay, but because holdings that prey on travelers must fall.`,
      }, npc, p);
    }
    // Programmatic director: no AI. Lore fragments color the offer
    // indirectly (rumor hook, never retold) — same rule as before.
    let loreRefs = [];
    try {
      if (window.Lorebooks && Math.random() < 0.6) loreRefs = window.Lorebooks.randomVols(1 + ((Math.random() * 4) | 0)) || [];
    } catch (e) { loreRefs = []; }
    let data = fallbackOffer(npc, p);
    try { if (loreRefs.length && data) data.loreRefs = loreRefs.map(r => r.id); } catch (e) {}
    return coerceOffer(data, npc, p);
  }
  function coerceOffer(data, npc, p) {
    const type = ["fetch", "slay", "clear", "deliver", "siege", "chain"].includes(data.type) ? data.type : "slay";
    if (type === "chain") return coerceChainOffer(data, npc, p);
    // Doability gate: the item MUST exist in the game, or the quest is
    // impossible. An AI-invented name ("dragon egg", "moonpetal") becomes a
    // 📦 mysterious package instead — the giver wraps something sealed.
    let itemId = "herb", itemSub = false;
    if (type === "fetch" || type === "deliver") {
      const named = String(data.itemId || "").trim();
      try {
        if (named && window.Items.ITEMS[named]) itemId = named;
        else { itemId = "mysterious_package"; itemSub = !!named; }
      } catch (e) { itemId = "mysterious_package"; itemSub = !!named; }
    }
    const o = {
      type,
      title: String(data.title || "A villager's plea").slice(0, 48) || "A villager's plea",
      place: normPlace(data.place || ""),
      mobKind: SLAY_MOB_KINDS.includes(data.mobKind) ? data.mobKind : SLAY_MOB_KINDS[(Math.random() * 6) | 0],
      need: Math.max(1, Math.min(type === "slay" ? 10 : 6, Math.round(Number(data.need) || 4))),
      itemId,
      itemSub, // true when the AI named something unreal — a sealed package stands in
      deliverTo: String(data.deliverTo || (data.deliverToName || "") || "").slice(0, 32),
      turnIn: data.turnIn !== false && type !== "clear" ? true : !!data.turnIn,
      flavor: String(data.flavor || "The road is dangerous. Will you help?").slice(0, 220),
      story: cleanStory(data.story, String(data.flavor || "The road is dangerous. Will you help?")),
      loreRefs: Array.isArray(data.loreRefs) ? data.loreRefs.slice(0, 4) : [],
    };
    if (type === "slay") o.turnIn = !!data.turnIn;
    if (type === "clear") o.turnIn = false;
    if (type === "deliver") o.turnIn = false;
    if (type === "siege") { o.turnIn = false; o.need = 1; }
    return o;
  }
  function coerceStage(raw, fbPlace) {
    const type = ["fetch", "slay", "clear", "deliver"].includes(raw && raw.type) ? raw.type : "slay";
    let itemId = "herb", itemSub = false;
    if (type === "fetch" || type === "deliver") {
      const named = String((raw && raw.itemId) || "").trim();
      try {
        if (named && window.Items.ITEMS[named]) itemId = named;
        else { itemId = "mysterious_package"; itemSub = !!named; }
      } catch (e) { itemId = "mysterious_package"; itemSub = !!named; }
    }
    return {
      type,
      place: normPlace((raw && (raw.place || raw.dungeon)) || fbPlace || ""),
      dungeon: normPlace((raw && raw.dungeon) || ""),
      mobKind: SLAY_MOB_KINDS.includes(raw && raw.mobKind) ? raw.mobKind : SLAY_MOB_KINDS[(Math.random() * 6) | 0],
      need: Math.max(1, Math.min(type === "slay" ? 10 : 6, Math.round(Number((raw && raw.need)) || (type === "slay" ? 4 : 2)))),
      itemId, itemSub,
      deliverTo: String((raw && (raw.deliverTo || raw.deliverToName)) || "").slice(0, 32),
      deliverToName: String((raw && (raw.deliverTo || raw.deliverToName)) || "").slice(0, 32),
      story: cleanStory(raw && raw.story, raw && raw.flavor ? String(raw.flavor).slice(0, 400) : "The road winds on."),
    };
  }
  function coerceChainOffer(data, npc, p) {
    try {
      const rawStages = Array.isArray(data.stages) ? data.stages.slice(0, 3) : [];
      const fbPlace = normPlace(data.place || "");
      let stages = rawStages.map(s => coerceStage(s, fbPlace)).filter(s => s && s.type);
      // need at least 2 valid, distinct-ish legs; else collapse to a single
      if (stages.length < 2) {
        const single = coerceStage({ type: "slay", place: fbPlace, need: 4, story: data.story }, fbPlace);
        return { type: single.type, title: String(data.title || "A villager's plea").slice(0, 48), place: single.place, mobKind: single.mobKind, need: single.need, itemId: single.itemId, itemSub: single.itemSub, deliverTo: single.deliverTo, turnIn: !!data.turnIn, flavor: String(data.flavor || "The road is dangerous.").slice(0, 220), story: cleanStory(data.story, String(data.flavor || "The road is dangerous.")) };
      }
      // cap to 3, ensure consecutive legs differ (no slay→same-slay repeats)
      stages = stages.slice(0, 3);
      for (let i = 1; i < stages.length; i++) {
        if (stages[i].type === stages[i - 1].type && stages[i].type === "slay" && stages[i].mobKind === stages[i - 1].mobKind) {
          stages[i].mobKind = SLAY_MOB_KINDS[(Math.random() * SLAY_MOB_KINDS.length) | 0];
        }
      }
      const o = {
        type: "chain",
        title: String(data.title || "A tangled errand").slice(0, 48) || "A tangled errand",
        place: fbPlace,
        turnIn: data.turnIn !== false ? true : !!data.turnIn,
        finalTurnIn: data.turnIn !== false ? true : !!data.turnIn,
        flavor: String(data.flavor || "It will take more than one road.").slice(0, 220),
        story: cleanStory(data.story, String(data.flavor || "It will take more than one road.")),
        stages,
        loreRefs: Array.isArray(data.loreRefs) ? data.loreRefs.slice(0, 4) : [],
      };
      // deliver legs never demand a mid-saga report; only the finale may
      o.turnIn = false;
      return o;
    } catch (e) {
      return { type: "slay", title: "A villager's plea", place: "", mobKind: "goblin", need: 4, itemId: "herb", deliverTo: "", turnIn: false, flavor: "The road is dangerous.", story: "The road is dangerous. Will you help?" };
    }
  }
  async function acceptChainOffer(offer, npc) {
    const p = P(); if (!p || !offer || offer.type !== "chain") return null;
    const stages = Array.isArray(offer.stages) ? offer.stages.slice(0, 3) : [];
    if (stages.length < 2) return null;
    const dist = (() => { try { return Math.hypot(p.x, p.y); } catch (e) { return 60; } })();
    const diff = Math.min(5, difficultyFor(p, dist + 60 * stages.length) + 1);
    const story = cleanStory(offer.story, offer.flavor);
    const q = {
      id: "q" + (p.questSeq++), type: "chain",
      title: String(offer.title || "A tangled errand").slice(0, 48),
      desc: String(offer.flavor || "It will take more than one road.").slice(0, 220),
      story, storyLog: [story],
      giver: { npcId: npc.id, name: npc.name, placeName: npc.placeName || null },
      target: { placeName: null, gx: null, gy: null, cx: null, cy: null },
      need: 1, have: 0, turnIn: false, finalTurnIn: !!offer.finalTurnIn,
      diff, status: "active", createdAt: Date.now(),
      stages: stages.map(s => ({ type: s.type, place: s.place || "", dungeon: s.dungeon || "", mobKind: s.mobKind || "goblin", need: s.need, itemId: s.itemId || "herb", deliverTo: s.deliverTo ? { name: s.deliverTo } : (s.deliverToName ? { name: s.deliverToName } : null), deliverToName: s.deliverToName || s.deliverTo || "", story: cleanStory(s.story, "") })),
      loreRefs: Array.isArray(offer.loreRefs) ? offer.loreRefs.slice(0, 4) : [],
      stageIdx: 0, stageType: stages[0].type,
    };
    // richer saga reward: gold/xp scaled + stages count
    q.reward = rewardFor(p, diff);
    try { q.reward.gold = Math.round(q.reward.gold * (1 + 0.35 * (stages.length - 1))); q.reward.xp = Math.round(q.reward.xp * (1 + 0.35 * (stages.length - 1))); } catch (e) { }
    const ok = await setupChainStage(q, 0);
    if (!ok) { try { window.UI.toast("📜 The trail went cold — quest withdrawn.", 3500); } catch (e) { } return null; }
    try {
      const st0 = (q.stages || [])[0];
      if (st0 && st0.story) pushStory(q, `Stage 1: ${st0.story}`);
    } catch (e) { }
    ensure(p).push(q);
    try {
      npc.memories = npc.memories || { summary: "", tail: [] };
      npc.memories.tail.push(`Traveler: accepted my saga "${q.title}" (${q.stages.length} stages).`);
      if (npc.memories.tail.length > 14) npc.memories.tail = npc.memories.tail.slice(-14);
      await window.World.saveNpc(npc);
    } catch (e) { }
    try {
      window.UI.toast(`📜 Saga accepted: ${q.title} — ${chainObjectiveText(q)}`, 6000);
      if (window.UI.showQuestBanner) window.UI.showQuestBanner("📜", "New saga: " + q.title, chainObjectiveText(q) + "  ·  🎁 " + rewardText(q.reward));
      try { if (q.stageType === "deliver" && window.Game && window.Game.announceLoot) window.Game.announceLoot("📦 Quest parcel", 0, [{ id: q.itemId, n: q.need || 1 }]); } catch (e2) { }
      try {
        const hasFetch = (q.stages || []).some(s => s.type === "fetch");
        if (hasFetch && window.Items && (window.Items.countItem(p, "raft") | 0) < 1) {
          setTimeout(() => { try { window.UI.toast("🛶 Water in the way? Lash a Raft: 🎒 Inventory → 🔨 Crafting (6 🪵). Sail with WASD, E-grab from the hull.", 6000); } catch (e) { } }, 6000);
        }
      } catch (e) { }
      window.Sfx.coin();
      window.UI.updateHUD();
      if (window.UI.renderQuests) window.UI.renderQuests();
    } catch (e) { }
    save();
    return q;
  }
  async function acceptOffer(offer, npc) {
    const p = P(); if (!p || !offer) return null;
    if (active(p).length >= MAX_ACTIVE) {
      try { window.UI.toast("📜 Quest log is full (6). Finish one first.", 3500); } catch (e) { }
      return null;
    }
    if (offer.type === "chain") return acceptChainOffer(offer, npc);
    const dist = (() => { try { return Math.hypot(p.x, p.y); } catch (e) { return 60; } })();
    const diff = difficultyFor(p, dist + ((offer.type === "clear" || offer.type === "siege") ? 120 : offer.place ? 60 : 0));
    const story = cleanStory(offer.story, offer.flavor);
    const q = {
      id: "q" + (p.questSeq++), type: offer.type,
      title: offer.title, desc: offer.flavor,
      story, storyLog: [story],
      giver: { npcId: npc.id, name: npc.name, placeName: npc.placeName || null },
      target: { placeName: offer.place || null, gx: null, gy: null, cx: null, cy: null },
      need: offer.need, have: 0, turnIn: !!offer.turnIn,
      loreRefs: Array.isArray(offer.loreRefs) ? offer.loreRefs.slice(0, 4) : [],
      diff, status: "active", createdAt: Date.now(),
    };
    if (offer.type === "fetch" || offer.type === "deliver") {
      // last-line doability gate (behind coerceOffer): a fetch/deliver whose
      // item somehow isn't real is impossible — stand a sealed package in.
      try { if (!window.Items.ITEMS[offer.itemId]) { offer.itemId = "mysterious_package"; offer.itemSub = true; } } catch (e) { }
      q.itemId = offer.itemId;
      if (offer.itemSub) q.itemSub = true;
    }
    if (offer.type === "slay") { q.mobKind = offer.mobKind; }
    if (offer.type === "deliver") { q.deliverTo = { name: offer.deliverTo || "a friend" }; }
    q.reward = rewardFor(p, diff);
    // resolve + place
    if (offer.type === "siege") {
      // break an enemy holding with the war party: the target is the
      // holding itself (marked on map + minimap via targetPos), completion
      // is the warlord's death (onKill). No parcel, no report-back.
      const ab = (npc && npc.armyBase) || null;
      let gx = null, gy = null, baseId = null, placeName = offer.place || "the holding", bossName = "its warlord";
      const bossOf = (kind) => {
        try {
          const tpl = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
          return (tpl && tpl.name) || "its warlord";
        } catch (e) { return "its warlord"; }
      };
      if (ab && ab.baseId) {
        // the holding must still stand
        let ruined = false;
        try {
          const W = window.World;
          const ch = W._mem.chunks.get(W.chunkKey(Math.floor(ab.gx / 16), Math.floor(ab.gy / 16)));
          ruined = !!(ch && ch.baseRuined);
        } catch (e) { }
        if (ruined) { try { window.UI.toast("📜 That holding already lies broken — no quest left there.", 3500); } catch (e) { } return null; }
        gx = ab.gx; gy = ab.gy; baseId = ab.baseId; placeName = ab.name || placeName;
        bossName = bossOf(ab.boss);
      } else {
        // no war party at hand (old save, stray talk): nearest holding
        let b = null;
        try { b = window.Game.nearestBaseTo ? window.Game.nearestBaseTo(p.x, p.y, 480) : null; } catch (e) { }
        if (!b) { try { window.UI.toast("📜 No enemy holding stirs within marching range.", 3500); } catch (e) { } return null; }
        try {
          const W = window.World;
          const ch = W._mem.chunks.get(W.chunkKey(Math.floor(b.cx / 16), Math.floor(b.cy / 16)));
          if (ch && ch.baseRuined) { try { window.UI.toast("📜 That holding already lies broken.", 3500); } catch (e) { } return null; }
        } catch (e) { }
        const kinds = (() => { try { return (window.World.BASE_KINDS || {})[b.type] || {}; } catch (e) { return {}; } })();
        gx = b.cx; gy = b.cy; baseId = window.World.baseIdFor(b); placeName = window.World.baseName(b);
        bossName = bossOf(kinds.boss);
      }
      // v18: stamp the dimension — holdings share numbers across dims.
      let qdim = "surf";
      try { qdim = (window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.dim === "hell") ? "hell" : "surf"; } catch (e) {}
      try { if (window.World && window.World.getDim) qdim = window.World.getDim(); } catch (e2) {}
      q.target = { placeName, gx, gy, cx: null, cy: null, baseId, dim: qdim };
      q.bossName = bossName;
      q.need = 1; q.have = 0; q.turnIn = false;
      q.title = `${offer.title}: ${placeName}`;
    } else if (offer.type === "clear") {
      const d = await ensureDungeonTarget(offer.place);
      if (!d) { try { window.UI.toast("📜 No delve stirs nearby — quest withdrawn.", 3500); } catch (e) { } return null; }
      q.target = { dungeonId: d.dungeonId, name: d.name, placeName: null, gx: d.gx, gy: d.gy, cx: d.cx, cy: d.cy };
      q.title = `${offer.title}: ${d.name}`;
    } else if (offer.type === "deliver") {
      // recipient must exist somewhere; else it becomes a turn-in fetch for the giver
      let where = offer.place ? await findPlaceEverywhere(offer.place) : null;
      if (!where) where = await ensureOverworldPlace(offer.place, offer.flavor);
      const recip = await findNpcEverywhere(offer.deliverTo, where && where.placeName);
      if (!recip) {
        q.type = "fetch";
        q.title = `${offer.title} (${where.placeName})`;
        q.target = { placeName: where.placeName, gx: where.gx, gy: where.gy, cx: where.cx, cy: where.cy };
        q.turnIn = true;
        // the cache IS the quest — if it can't be placed, the quest is
        // impossible: withdraw instead of stranding a broken log entry.
        if (!(await placeQuestCache(q))) {
          try { window.UI.toast("📜 The trail went cold — quest withdrawn.", 3500); } catch (e) { }
          return null;
        }
      } else {
        q.deliverTo = { name: recip.name, npcId: recip.id };
        q.target = { placeName: recip.placeName || where.placeName, gx: recip.x ?? recip.gx, gy: recip.y ?? recip.gy, cx: null, cy: null };
        let entrusted = false;
        try { entrusted = window.Items.addItem(p, q.itemId, q.need); } catch (e) { entrusted = false; }
        if (!entrusted) {
          try { window.UI.toast("📜 The parcel slipped away — quest withdrawn.", 3500); } catch (e) { }
          return null;
        }
      }
    } else {
      let where = offer.place ? await findPlaceEverywhere(offer.place) : null;
      if (!where) where = await ensureOverworldPlace(offer.place, offer.flavor);
      q.target = { placeName: where.placeName, gx: where.gx, gy: where.gy, cx: where.cx, cy: where.cy };
      if (offer.type === "fetch" && !(await placeQuestCache(q))) {
        try { window.UI.toast("📜 The trail went cold — quest withdrawn.", 3500); } catch (e) { }
        return null;
      }
    }
    ensure(p).push(q);
    try {
      npc.memories = npc.memories || { summary: "", tail: [] };
      npc.memories.tail.push(`Traveler: accepted my quest "${q.title}".`);
      if (npc.memories.tail.length > 14) npc.memories.tail = npc.memories.tail.slice(-14);
      await window.World.saveNpc(npc);
    } catch (e) { }
    try {
      window.UI.toast(`📜 Quest accepted: ${q.title} — ${objectiveText(q)}`, 5500);
      if (window.UI.showQuestBanner) window.UI.showQuestBanner("📜", "New quest: " + q.title, objectiveText(q) + "  ·  🎁 " + rewardText(q.reward));
      // the entrusted parcel lands in the pack now — card it like any pickup
      try { if (q.type === "deliver" && window.Game && window.Game.announceLoot) window.Game.announceLoot("📦 Quest parcel", 0, [{ id: q.itemId, n: q.need || 1 }]); } catch (e2) { }
      // fetch caches can sit across rivers/lakes — point at the raft exactly once
      try {
        if (q.type === "fetch" && window.Items && (window.Items.countItem(p, "raft") | 0) < 1) {
          setTimeout(() => { try { window.UI.toast("🛶 Water in the way? Lash a Raft: 🎒 Inventory → 🔨 Crafting (6 🪵). Sail with WASD, E-grab from the hull.", 6000); } catch (e) { } }, 6000);
        }
      } catch (e) { }
      window.Sfx.coin();
      window.UI.updateHUD();
      if (window.UI.renderQuests) window.UI.renderQuests();
    } catch (e) { }
    save();
    return q;
  }

  // ---------- per-frame (throttled) ----------
  let tickT = 0, spawnCd = 0;
  function tick(dt) {
    try {
      const p = P(); if (!p || p.hp <= 0) return;
      tickT -= dt; spawnCd -= dt;
      if (tickT > 0) return;
      tickT = 1.0;
      // quest mob spawning near slay targets when the player closes in
      if (spawnCd <= 0) {
        spawnCd = 2.5;
        // multiplayer thin client: only a simulator mints quest mobs (the
        // host, or the elected area owner when the host is quiet/far).
        // Near-host joiners skip — their kills on the host's shared wilds
        // already credit via onKill (any same-kind mob with xpReward counts),
        // and anything they mint locally is wiped within a tick, which used
        // to flicker glitchy almost-enemies around them.
        let qSim = true;
        try {
          if (window.MP && window.MP.M && window.MP.M.active && window.MP.isHost && !window.MP.isHost()) {
            qSim = !!(window.MP.amAreaSim && window.MP.amAreaSim());
          }
        } catch (e) { qSim = true; }
        for (const q of ensure(p)) {
          if (!qSim) break;
          const curSlay = q.type === "slay" ? q.mobKind : (q.type === "chain" ? chainSlayKind(q) : null);
          if (!curSlay) continue;
          if (q.status !== "active" || isObjectiveMet(q)) continue;
          const t = q.target || {};
          if (t.gx == null || p.inDungeon) continue;
          const dp = Math.hypot(t.gx - p.x, t.gy - p.y);
          if (dp > 26) continue;
          let alive = 0;
          try {
            for (const m of window.Game.G.mobs) {
              if (m.questId === q.id && m.hp > 0 && !m.corpse) alive++;
            }
          } catch (e) { }
          const remaining = (q.need | 0) - (q.have | 0) - alive;
          if (remaining <= 0) continue;
          try {
            const dist = Math.hypot(t.gx, t.gy);
            // quest summons obey the wilds' rules: undead only after dark/in the
            // gloom, wolves only in forests — substitutes still credit the quest
            let kind = curSlay, qtag = null;
            try {
              const G = window.Game;
              let dark = false;
              try { dark = G.isDarkAt(t.gx, t.gy); } catch (e2) { dark = !!G.isNight && G.isNight(); }
              let isUndeadKind = (kind === "skeleton" || kind === "wraith");
              try { if (!isUndeadKind && window.Items && window.Items.isUndead) isUndeadKind = !!window.Items.isUndead({ kind }); } catch (e3) { }
              if (isUndeadKind && !dark) { kind = "goblin"; qtag = curSlay; }
              else if (kind === "wolf") {
                let b = null;
                try { b = window.World.biomeAt(Math.round(t.gx), Math.round(t.gy)); } catch (e3) { }
                if (b !== "forest") { kind = "goblin"; qtag = curSlay; }
              }
            } catch (e) { }
            const m = window.Entities.makeMob(kind, window.Game.mobLevelFor(dist), dist, 0);
            const ang = Math.random() * Math.PI * 2, r = 4 + Math.random() * 5;
            let mx = t.gx + Math.cos(ang) * r, my = t.gy + Math.sin(ang) * r;
            try { if (!window.Game.walkable(mx, my)) { mx = t.gx; my = t.gy; } } catch (e) { }
            m.x = mx; m.y = my; m.homeX = mx; m.homeY = my;
            m.hp = m.maxHp; m.mp = m.maxMp;
            m.questId = q.id;
            if (qtag) m.questKind = qtag; // ecological substitute, credits the quest
            window.Game.G.mobs.push(m);
          } catch (e) { }
        }
      }
      // passive auto-complete sweep (caches taken while modal closed, etc.)
      tutorialTick();
      for (const q of ensure(p)) if (q.status === "active") checkAuto(q);
      try { if (window.MainStory && window.MainStory.tick) window.MainStory.tick(); } catch (e) {}
    } catch (e) { }
  }

  return {
    ensure, active, completedQuests, abandonedQuests, get, objectiveText, statusText, targetPos, distToTarget,
    storyHeardSoFar, heroSummary, giverSummary,
    offerFor, acceptOffer, abandon, turnIn, pendingTurnIn, preTalk,
    onKill, onTakeCache, onTalk, onBossSpawn, onLootDrops, onTame,
    tick, complete, rewardFor, rewardText, startTutorial, tutorialQuest, tutorialSteps, onTutorialEvent, tutorialChoose, TUT_REWARD_CHOICES,
    tutorialGuideFor, tutorialCurrentStep, tutorialSpellKey, ensureTutorialTome, migrateTutorialQuest,
    TUT_GUIDE,
    findPlaceEverywhere, knownPlaceNames,
    MAX_ACTIVE,
    _test: { coerceOffer, fallbackOffer, normPlace, difficultyFor, rewardFor, isObjectiveMet, isRareDrop, placeQuestCache },
  };
})();
