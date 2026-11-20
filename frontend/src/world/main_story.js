/* Main Storyline — Emberhold built-in campaign (window.MainStory), v2 director pass.
 *
 * CAST (visual-novel speaking parts — all VN-only, no world sim required):
 *  🔥 The Hearthkeeper — ember spirit bound to your first hearth (Ch 0).
 *     Old as the first fire lit on this ground; tends it still. Dry, kind,
 *     brutally practical. Offers the ORIGIN oath + oath-charm blessing.
 *  🌅 The Goddess of Dawn — herald of the morning (Ch 2/5/8/10).
 *     The sunrise that remembers you. Broke the Hell Heart long ago; needs a
 *     mortal blade because gods cannot unmake what they love — only a freely
 *     choosing mortal can cut an anchor.
 *  📜 The Pale Chronicler (voice only, quoted in shard dreams, Ch 3).
 *     A dead scholar whose marginalia surfaces in the shards. Believes Peter
 *     volunteered — and kept the receipts.
 *  🧙 The Tower Hermit (Ch 4 guide, Main-tab VN + tower-aim mechanic).
 *     Last keeper of the seal-stitches. Tells you which compass to walk and
 *     why the towers hum in your teeth.
 *  🖤 The Ashen Guide — demon defector (Ch 5 second speaker, Ch 6 whisper).
 *     A hell-born who deserted the castle garrison. Offers the HELL PATH
 *     choice: walk soft (stealth) or walk loud (bold). The castle answers each.
 *  👑 Peter the Fallen — Supreme Overlord of Hell (Ch 7/9).
 *     The Dawn's first champion. Volunteered to hold Hell shut from inside;
 *     the throne kept him like a trap. Tired, courteous, utterly done.
 *
 * CHAPTERS:
 *  mq_hearth_spark  — Ch 0 (STARTING quest, active from spawn): meet the
 *     Hearthkeeper, choose an ORIGIN (Ember/Dawn/Gloam/Wanderer) + oath charm,
 *     then descend for the first time. Completes on dungeon entry.
 *  mq_first_delve  — Ch 1 Echoes Below: full-clear your delve to the bottom.
 *  mq_first_shard  — Ch 2 The Goddess Wakes: first-fragment vision.
 *  mq_twelve_shards— Ch 3 Twelve Shards, One Sphere + 3 SHARD DREAM interludes
 *     (3/6/9 fragments: resolve/doubt/defy) granting 🌅 Dawn Embers.
 *  mq_towers       — Ch 4 The Far Towers (+ Hermit tower-aim choice).
 *  mq_hell_arrival — Ch 5 Ashes on the Wind (+ Ashen Guide hell-path choice).
 *  mq_heart_castle — Ch 6 The Dark Castle (objective honors your path).
 *  mq_audience     — Ch 7 Audience with the Fallen (origin/shard/lore-gated
 *     options; fight / spared / confront branches).
 *  mq_final_fight  — Ch 9 Fall of the Overlord (Dawn Embers + blessing).
 *  mq_confront     — Ch 8 The Goddess on Trial (surface interrogation).
 *  mq_epilogue     — Ch 10 Dawn's Return (3 endings + throne keepsake choice).
 *
 * NEW MECHANICS / ITEMS (v2):
 *  - ORIGIN flags (origin ember|dawn|gloam|wanderer): change Goddess/Peter/
 *    Guide lines, open gated dialogue options, recolor the epilogue.
 *  - Oath charms (🔥/🌅/🕳️, real trinkets in src/items.js) + Wanderer's pack.
 *  - 🌅 Dawn Ember (consumable heal + full cure): vision/dream/final rewards.
 *  - Shard-dream counters (resolve/doubt/defy): steer audience + confront.
 *  - Tower aim (E/NE/N/…): Hermit choice steers the Main-tab Track pin.
 *  - Hell path (stealth|bold): steers castle objective + grants smoke/potion.
 *  - Throne keepsake (👑 Throne Sliver trinket, epilogue choice) + endings.
 *
 * MIGRATION: the old backfill fabricated fake "Remembered from before the
 * Main tab kept records." done entries — those are purged on sight and NEVER
 * recreated. Old progress routes to the correct ACTIVE quest with an empty
 * history; only real completions are recorded going forward.
 *
 * Storage: player.mainStory = { active, done[], flags{} }. Saved with player.
 */
window.MainStory = (() => {
  const FIRST_NEED = 3;

  function P() { try { return window.Game && window.Game.G && window.Game.G.player; } catch (e) { return null; } }
  function save() { try { window.Game.saveGame(true); } catch (e) {} }
  function toast(m, ms) { try { window.UI.toast(m, ms || 4500); } catch (e) {} }
  function banner(e, t, s) { try { if (window.UI && window.UI.showQuestBanner) window.UI.showQuestBanner(e, t, s); } catch (e2) {} }
  function sfxTalk() { try { window.Sfx.talk(); } catch (e) {} }
  function sfxLevel() { try { window.Sfx.level(); } catch (e) {} }

  function ensure(p) {
    p = p || P(); if (!p) return null;
    if (!p.mainStory || typeof p.mainStory !== "object") p.mainStory = { active: null, done: [], flags: {} };
    if (!p.mainStory.active) p.mainStory.active = null;
    if (!Array.isArray(p.mainStory.done)) p.mainStory.done = [];
    if (!p.mainStory.flags || typeof p.mainStory.flags !== "object") p.mainStory.flags = {};
    return p.mainStory;
  }
  function flags(p) { const ms = ensure(p); return ms ? ms.flags : {}; }
  function activeQuest(p) { const ms = ensure(p); return ms ? ms.active : null; }
  function doneList(p) { const ms = ensure(p); return ms ? ms.done : []; }
  function originOf(p) { try { return flags(p).origin || null; } catch (e) { return null; } }
  function hellPathOf(p) { try { return flags(p).hellPath || null; } catch (e) { return null; } }
  // Intro fully resolved: the first main quest (Spark of the Hearth) is done
  // AND the charm decision is made — an oath charm chosen, or deliberately
  // refused (Wanderer "no oath" path). Gates out-of-intro offers (e.g. the
  // 🎓 tutorial invite) so they never interrupt the Hearthkeeper.
  function introResolved(p) {
    try {
      p = p || P(); if (!p) return false;
      const ms = ensure(p); if (!ms) return false;
      const sparkDone = Array.isArray(ms.done) && ms.done.some(q => q && q.id === "mq_hearth_spark");
      if (!sparkDone) return false;
      const f = flags(p);
      return !!(f.oathCharm || f.oathRefused);
    } catch (e) { return false; }
  }

  function fragCount(p) { try { return window.Hell ? window.Hell.fragmentCount(p || P()) : 0; } catch (e) { return 0; } }
  // Earned shards: delves this hero cleared themselves. Story dialogues
  // (first vision, shard dreams) fire on EARNED shards only — gifted shards
  // count toward the 12/12 forge but never stand in for your own first delve.
  function ecount(p) { try { if (window.Hell && window.Hell.earnedFragmentCount) return window.Hell.earnedFragmentCount(p || P()); } catch (e) {} return fragCount(p); }
  function hasSphere(p) { try { return window.Hell ? window.Hell.hasSphere(p || P()) : false; } catch (e) { return false; } }
  function hellEntered(p) { try { p = p || P(); return !!(p && (p.hellEntered || p.dim === "hell" || (window.Hell && window.Hell.towersUnlocked(p)))); } catch (e) { return false; } }
  function inHellDim() { try { if (window.World && window.World.getDim) return window.World.getDim() === "hell"; } catch (e) {} try { const p = P(); return p && p.dim === "hell"; } catch (e2) {} return false; }
  function distToHellHeart() {
    try { const p = P(); if (!p) return 1e9; return Math.hypot((p.x || 0) - 0, (p.y || 0) - 0); } catch (e) { return 1e9; }
  }
  function loreReadCount(p) {
    try { p = p || P(); if (p && p.loreRead && typeof p.loreRead === "object") return Object.keys(p.loreRead).length; } catch (e) {}
    return 0;
  }
  function homeHearthPos(p) {
    try {
      p = p || P(); if (!p) return null;
      if (p.homeHearth && isFinite(+p.homeHearth.x) && isFinite(+p.homeHearth.y)) return { x: +p.homeHearth.x, y: +p.homeHearth.y };
      if (p.spawnX != null && p.spawnY != null) return { x: +p.spawnX, y: +p.spawnY };
      if (p.spawn && p.spawn.x != null) return { x: +p.spawn.x, y: +p.spawn.y };
      if (p.startX != null && p.startY != null) return { x: +p.startX, y: +p.startY };
      return { x: 2.5, y: 4.5 };
    } catch (e) { return null; }
  }

  // ---------- quest constructors ----------
  function mkQuest(id, title, desc, story, objective, data) {
    return { id, title, desc, story, objective, status: "active", createdAt: Date.now(), data: data || {} };
  }
  function setActive(p, q) {
    const ms = ensure(p); if (!ms || !q) return;
    ms.active = q; save();
    try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
  }
  function completeActive(p, how) {
    const ms = ensure(p); if (!ms || !ms.active) return null;
    const q = ms.active;
    q.status = "done"; q.doneAt = Date.now(); q.doneHow = how || "";
    ms.done.push(q); ms.active = null;
    if (ms.done.length > 40) ms.done = ms.done.slice(-40);
    save();
    try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
    return q;
  }

  function grantEmbers(n) {
    try {
      const p = P(); if (!p || !(n > 0)) return;
      if (window.Items && window.Items.addItem) window.Items.addItem(p, "dawn_ember", n);
      try { if (window.UI) { window.UI.updateHUD(); window.UI.updateHotbar(); } } catch (e) {}
    } catch (e) {}
  }
  function grantOathCharm(id) {
    try {
      const p = P(); if (!p || !id) return false;
      const f = flags(p);
      if (f.oathCharm) return false; // one blessing per hearth, ever
      if (window.Items && window.Items.addItem) window.Items.addItem(p, id, 1);
      else return false;
      f.oathCharm = id;
      // auto-wear it if the trinket slot is free — the oath should be felt
      try {
        if (p.equipment && !p.equipment.trinket && window.Items && window.Items.equip) window.Items.equip(p, id);
        else if (window.Entities && window.Entities.recalcDerived) window.Entities.recalcDerived(p, true);
      } catch (e) {}
      try { if (window.UI) { window.UI.updateHUD(); window.UI.updateHotbar(); } } catch (e2) {}
      save();
      return true;
    } catch (e) { return false; }
  }
  function originName(o) {
    return o === "ember" ? "Ember" : o === "dawn" ? "Dawn" : o === "gloam" ? "Gloam" : o === "wanderer" ? "Wanderer" : null;
  }

  // ---------- Ch 0: starting quest ----------
  function startHearthSpark(p, silent) {
    const ms = ensure(p); if (!ms) return null;
    if (ms.active || ms.done.length) return ms.active;
    let hearth = "your first hearth";
    try {
      if (p.spawnName) hearth = p.spawnName;
      else if (p.homeHearth && p.homeHearth.name) hearth = p.homeHearth.name;
    } catch (e) {}
    const q = mkQuest("mq_hearth_spark", "Spark of the Hearth",
      "The hearth fire leans toward you. Listen.",
      "You woke at " + hearth + " with no prophecy on you — and that absence is the rarest thing in the vale. " +
      "The hearth fire leans toward you when no wind blows. At night you dream twice: once of a woman made of dawn, once of a man made of doors. " +
      "The old ember bound to this hearth has been waiting to tell you why. It will not chase you — but it will not wait forever either.",
      "Listen to the Hearthkeeper (🌟 Main → 🔥 Listen)",
      { listened: false, origin: null });
    setActive(p, q);
    if (!silent) {
      toast("🌟 New main quest: Spark of the Hearth — open 📜 Quests → 🌟 Main → 🔥 Listen.", 6500);
      banner("🌟", "New main quest: Spark of the Hearth", "The hearth fire leans toward you — listen.");
      sfxTalk();
    }
    return q;
  }

  function startFirstDelve(p, baseId, name, gx, gy) {
    const ms = ensure(p); if (!ms) return null;
    if (ms.active || ms.done.length) return ms.active; // already running
    // the first delve pays its shard only on a full clear: one lord per
    // floor down to the bottom (god-delve 5, ordinary delves 12-15)
    let need = FIRST_NEED;
    try { if (window.Game && window.Game.delveEndLevel && baseId) need = Math.max(3, window.Game.delveEndLevel(baseId) | 0 || FIRST_NEED); } catch (e) {}
    const f = flags(p);
    const og = originName(f.origin);
    const oathLine = og ? " You carry the " + og + " oath" + (f.oathCharm ? " and its charm" : "") + " — the dark will learn its weight." : "";
    const q = mkQuest("mq_first_delve", "Echoes Below",
      "Something stirs below your first delve. Clear it floor by floor.",
      "You stepped below for the first time and the dark noticed you back." + oathLine + " " +
      "Delve-lords keep one shard each of a broken Hell Heart — your first shard waits at the very bottom of this hole. " +
      "Slay every floor's lord on the way down if you can, but the way out itself pays the shard either way: reach the bottom, step through the final portal to daylight. " +
      "Take it, and listen: the light that finds you afterwards is not an accident.",
      "Delve " + (name || "the dark") + " to the bottom: step through the final portal (lords optional " + "(0/" + need + "))",
      { baseId: String(baseId || ""), name: name || "the dark", kills: 0, need, gx: gx | 0, gy: gy | 0 });
    setActive(p, q);
    toast("🌟 New main quest: Echoes Below — clear " + (name || "this delve") + " to the bottom (" + need + " depths). See 📜 Quests → 🌟 Main.", 6500);
    banner("🌟", "New main quest: Echoes Below", "Slay every depth's lord in " + (name || "this delve") + " (0/" + need + ")");
    sfxTalk();
    return q;
  }

  // Generic Echoes Below: counts ANY delve (no mouth bound yet — the first
  // mouth entered binds it, see bindDelveMouth). Used right after the intro
  // oath and for heroes whose descent predates Main records.
  function startGenericFirstDelve(p) {
    const ms = ensure(p); if (!ms) return null;
    const q = mkQuest("mq_first_delve", "Echoes Below",
      "Something stirs below every delve you enter.",
      "The Hearthkeeper's oath is sworn and the dark has noticed you back. Your oath charm fits your trinket slot — wear it proud. " +
      "Delve-lords keep one shard each of a broken Hell Heart: enter ANY dungeon mouth, slay its lords on every depth, and walk out through the bottom portal to daylight — the way out itself pays your first shard. Stairs and shortcuts pay nothing.",
      "Delve the dark to the bottom (" + FIRST_NEED + "+ lords slain, then out the bottom portal)",
      { baseId: "", name: "the dark", kills: 0, need: FIRST_NEED, gx: Math.round(p.x), gy: Math.round(p.y) });
    setActive(p, q);
    toast("🌟 Main quest: Echoes Below — clear any delve to the bottom.", 6000);
    banner("🌟", "Main quest: Echoes Below", "Enter any dungeon mouth (🕳️) and clear it");
    sfxTalk();
    return q;
  }
  function startFirstShard(p) {
    const ms = ensure(p); if (!ms) return null;
    // never stack: callers complete the old quest first, but the resume
    // router can race a transition — an active quest always wins.
    if (ms.active) return ms.active;
    const q = mkQuest("mq_first_shard", "The Goddess Wakes",
      "A voice in the shard. Listen.",
      "The first Hell Fragment burns cold in your pack — and then, impossibly, morning breaks underground. " +
      "She has found you. Hear her out: the other eleven shards, the sphere, and what the far towers are for.",
      "Listen to the Goddess of Dawn (auto — she finds you)",
      {});
    setActive(p, q);
    return q;
  }
  function startTwelve(p) {
    const c = fragCount(p);
    const q = mkQuest("mq_twelve_shards", "Twelve Shards, One Sphere",
      "Twelve distinct delves. One Hell Sphere.",
      "The Hell Heart was shattered into twelve shards and scattered among surface delve-lords — repeat kills of the same delve pay nothing twice. " +
      "Gather twelve DISTINCT shards, then join them in 🎒 Inventory into a Hell Sphere. Your tally is kept here, under 🌟 Main. " +
      "The shards whisper — at 3, 6 and 9 you will hear Peter dreaming through them. Do not answer him. " +
      "She gives you Dawn Embers: quaff one when the dark gets inside you.",
      "Gather Hell Fragments (" + c + "/12), then forge the 🔮 Hell Sphere in 🎒 Inventory",
      {});
    setActive(p, q);
    toast("🌟 Main quest: Twelve Shards, One Sphere — (" + c + "/12). See 🌟 Main tab.", 6000);
    banner("🌟", "Main quest: Twelve Shards, One Sphere", "Fragments " + c + "/12 → forge 🔮 in 🎒 Inventory");
    return q;
  }
  function startTowers(p) {
    const q = mkQuest("mq_towers", "The Far Towers",
      "Eight towers, one seal. Wake them.",
      "The sphere hums for the far-off hell towers — eight of them on the 1000-ring (E, NE, N, NW, W, SW, S, SE), same ground in both worlds. " +
      "Press E on a tower's red portal heart with the sphere in your pack. Waking ANY one tower wakes them ALL, here and in hell — then step through into Hell itself. " +
      "The towers remember where you stood in each world, and always return you where you left it. " +
      "The last keeper of the seal-stitches, the Tower Hermit, still walks the ring in stories. Open 🌟 Main → 🧙 Hear the Hermit before you march: he will tell you which compass to walk first, and what the humming means.",
      "Find a 🗼 hell tower (1000 out) and press E to enter Hell",
      {});
    setActive(p, q);
    grantEmbers(1);
    try { flags(p).hermitMet = false; } catch (e) {}
    toast("🌟 Main quest: The Far Towers — E on a tower heart (1000-ring) to enter Hell. The Hermit offers counsel in 🌟 Main.", 6500);
    banner("🗼", "Main quest: The Far Towers", "E on a hell tower heart → enter Hell (+🌅 Ember)");
    return q;
  }
  function startHellArrival(p) {
    const q = mkQuest("mq_hell_arrival", "Ashes on the Wind",
      "She meets you in Hell. Listen.",
      "You crossed. The air tastes of cinder and old vows, and dawn has no business here — yet she comes anyway. " +
      "Hear what she asks of you in Hell: the castle at the very center, and why you must walk to it. Someone else walks the ash too — someone who left the castle.",
      "Listen to the Goddess in Hell (she finds you)",
      {});
    setActive(p, q);
    return q;
  }
  function startHeart(p) {
    const f = flags(p);
    const path = f.hellPath === "stealth" ? " Walk soft: the Ashen Guide's blind canyons and ember-drifts will hide you until the moat." : f.hellPath === "bold" ? " Walk loud: the Guide's war-drum roads will draw the garrison out where you can see it." : "";
    const q = mkQuest("mq_heart_castle", "The Dark Castle",
      "The castle at the center of Hell.",
      "One castle stands at Hell's own (0,0) — lava moat, double ring, elite fiends and warlords at the heart." + path + " " +
      "Inside its portal room waits the mouth of the Supreme Overlord's Dungeon (5 levels down). Reach the heart, descend to level 5, and stand before Peter. " +
      "Your Main-tab compass holds the heading.",
      "Reach the Dark Castle at Hell 0,0, enter its dungeon, meet Peter on level 5",
      {});
    setActive(p, q);
    toast("🌟 Main quest: The Dark Castle — walk to Hell 0,0 and descend to Peter.", 6500);
    banner("🌟", "Main quest: The Dark Castle", "Reach Hell 0,0 → descend 5 levels → face Peter");
    return q;
  }
  function startAudience(p) {
    const q = mkQuest("mq_audience", "Audience with the Fallen",
      "Stand before Peter the Fallen and answer him.",
      "Level 5. The dark ends here. Peter waits dormant — approach and he will ask why you came. " +
      "Choose your words the way you would choose ground: every answer is a door. Some doors fight. One door listens. One door accuses the dawn itself.",
      "Stand before Peter on level 5 and answer his question",
      {});
    setActive(p, q);
    toast("👑 Audience: Peter waits ahead — approach and answer.", 5000);
    banner("👑", "Main quest: Audience with the Fallen", "Answer Peter's question");
    return q;
  }
  function startFinal(p, why) {
    const f = flags(p);
    const bless = (f.confrontEmpathy | 0) >= (f.confrontDefy | 0) ? "dawn" : "ash";
    const q = mkQuest("mq_final_fight", "Fall of the Overlord",
      "End Peter the Fallen. No more doors.",
      why || "The words are spent. What remains is the oldest argument: steel. Slay Peter the Fallen on level 5 of the Supreme Overlord's Dungeon. This time he will offer no parley — and you cannot run from what you now know.",
      "Slay 👑 Peter the Fallen (god-delve level 5)",
      { blessing: bless });
    setActive(p, q);
    grantEmbers(2);
    try {
      p.hp = p.maxHp; p.mp = p.maxMp;
      try { if (window.Status) { for (const t of (window.Status.list(p) || [])) window.Status.cure(p, t); } } catch (e) {}
      toast(bless === "dawn" ? "🌅 Dawn's Ward settles over you — wounds close, breath steadies. Two embers burn in your pack." : "🖤 Ashen Resolve settles over you — fear goes quiet. Two embers burn in your pack.", 6000);
    } catch (e) {}
    toast("🌟 Main quest: Fall of the Overlord — slay Peter. No parley this time.", 6000);
    banner("⚔️", "Main quest: Fall of the Overlord", "Slay Peter the Fallen");
    return q;
  }
  function startConfront(p) {
    const q = mkQuest("mq_confront", "The Goddess on Trial",
      "Track the dawn and make her answer.",
      "Peter spared you and paid for it with exile: his seal now bars his own dungeon until you confront the Goddess of Dawn herself. " +
      "Find her on the SURFACE world (she walks near your first hearth when called) and press her — round after round — until her fair tale cracks and the truth comes out. Only then will the way down reopen.",
      "On the SURFACE (not in a dungeon): open 🌟 Main → 🌅 Commune to confront her (" + confrontProgress(p) + ")",
      { rounds: 0, need: 4 });
    setActive(p, q);
    const f = flags(p); f.banGodDelve = true;
    save();
    toast("🌟 Main quest: The Goddess on Trial — return to the SURFACE and 🌅 Commune (🌟 Main tab). Peter's dungeon is sealed until then.", 7000);
    banner("🌅", "Main quest: The Goddess on Trial", "Surface → 🌟 Main → 🌅 Commune");
    return q;
  }
  function startEpilogue(p) {
    const q = mkQuest("mq_epilogue", "Dawn's Return",
      "Let her carry you home.",
      "It is done. The anchor is cut. She waits to carry you back to where you began — and to finally tell you everything, plainly, with nothing left to spend.",
      "Accept her return (she finds you)",
      {});
    setActive(p, q);
    return q;
  }

  function confrontProgress(p) {
    try { const ms = ensure(p); const q = ms && ms.active; if (q && q.id === "mq_confront") return Math.min(q.data.need | 0 || 4, q.data.rounds | 0) + "/" + (q.data.need | 0 || 4); } catch (e) {}
    return "0/4";
  }

  // ---------- visual novel engine (chatModal, no input/trade) ----------
  let vnOpen = false;
  function isModalOpen() {
    try { const m = document.getElementById("chatModal"); return m && !m.hidden; } catch (e) { return false; }
  }
  function hideChatChrome() {
    try {
      for (const id of ["chatInput", "chatSend", "npcTradePane", "tradePanel", "recruitBtn", "chatQuestBtn", "chatReportBtn", "healBtn", "giftBtn", "tradeBtn", "allyBtn"]) {
        const el = document.getElementById(id); if (el) el.hidden = true;
      }
      const log = document.getElementById("chatLog"); if (log) log.innerHTML = "";
    } catch (e) {}
  }
  // pages: [{sp, text, opts:[{label, next, run}], next, nextLabel}]
  // onDone: called when pages run out (or effect returns "done")
  function openVN(pseudo, pages, onDone) {
    try {
      const U = window.UI;
      if (!U || !U.openChat) { try { onDone && onDone(); } catch (e) {} return; }
      try { if (U.closeChat) U.closeChat(); } catch (e) {}
      vnOpen = true;
      U.openChat(pseudo);
      setTimeout(() => {
        try {
          hideChatChrome();
          try {
            document.getElementById("chatName").textContent = pseudo.blank ? "" : (pseudo.name || "???");
            document.getElementById("chatRole").textContent = pseudo.blank ? "" : (pseudo.role || "");
            const cp = document.getElementById("chatPersona");
            if (cp) { if (pseudo.blank) { cp.textContent = ""; cp.hidden = true; } else { cp.textContent = pseudo.persona || ""; cp.hidden = !pseudo.persona; } }
            try {
              const cv = document.getElementById("chatPortrait");
              const img = window.Sprites.drawPortrait({ kind: pseudo.kind || "goddess", id: pseudo.id, name: pseudo.name, role: pseudo.role, tint: pseudo.tint || "#ffe9a8", silhouette: !!pseudo.silhouette, blank: !!pseudo.blank }, 120, true);
              cv.width = 120; cv.height = 120;
              cv.getContext("2d").imageSmoothingEnabled = false;
              cv.getContext("2d").drawImage(img, 0, 0);
            } catch (e2) {}
          } catch (e3) {}
          sfxTalk();
          renderPage(0);
        } catch (e) { try { onDone && onDone(); } catch (e2) {} vnOpen = false; }
      }, 80);
      function renderPage(i) {
        try {
          const log = document.getElementById("chatLog");
          if (!log) { finish(); return; }
          log.innerHTML = "";
          if (i == null || i < 0 || i >= pages.length) { finish(); return; }
          const pg = pages[i];
          const d = document.createElement("div");
          d.className = "msg npc";
          const sp = document.createElement("span");
          const b = document.createElement("b");
          b.textContent = (pg.sp || pseudo.name || "???") + ": ";
          sp.appendChild(b);
          const t = document.createElement("span");
          t.innerHTML = pg.text || "";
          sp.appendChild(t);
          d.appendChild(sp);
          log.appendChild(d);
          const opts = Array.isArray(pg.opts) ? pg.opts : null;
          if (opts && opts.length) {
            opts.forEach((o) => {
              const btn = document.createElement("button");
              btn.textContent = o.label || "…";
              btn.style.cssText = "display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px;";
              btn.onclick = () => {
                try { if (o.run) o.run(); } catch (e) {}
                sfxTalk();
                if (o.next === "done") finish();
                else renderPage(o.next != null ? o.next : (i + 1));
              };
              log.appendChild(btn);
            });
          } else {
            const btn = document.createElement("button");
            btn.textContent = pg.nextLabel || "➤ Continue";
            btn.style.cssText = "display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;";
            btn.onclick = () => { sfxTalk(); if (pg.next === "done" || i + 1 >= pages.length) finish(); else renderPage(pg.next != null ? pg.next : (i + 1)); };
            log.appendChild(btn);
          }
          log.scrollTop = 0;
        } catch (e) { finish(); }
      }
      function finish() {
        vnOpen = false;
        try { if (window.UI && window.UI.closeChat) window.UI.closeChat(); } catch (e) {}
        try { onDone && onDone(); } catch (e) {}
        try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e2) {}
        save();
      }
    } catch (e) { try { onDone && onDone(); } catch (e2) {} vnOpen = false; }
  }
  function goddessPseudo(tag) {
    return { id: tag || "goddess_vision", name: "Goddess of Dawn", role: "Herald of the Morning · lv 100", lv: 100, hp: 100, maxHp: 100, gold: 0, memories: { summary: "", tail: [] }, isGoddessOutro: true, noTrade: true, kind: "goddess", tint: "#ffe9a8", appearance: null, persona: "🌅 Dawn herself speaks." };
  }
  function hearthPseudo() {
    return { id: "hearthkeeper", name: "The Hearthkeeper", role: "Ember bound to your first hearth", lv: 60, hp: 60, maxHp: 60, gold: 0, memories: { summary: "", tail: [] }, isGoddessOutro: true, noTrade: true, kind: "npc", tint: "#e08a2e", appearance: null, persona: "🔥 The oldest fire on this ground speaks." };
  }
  // Peter's memories (shard dreams at 3/6/9): nobody's face — a blank
  // frame, never the Goddess, never Peter. No one is talking; the shards
  // themselves remember.
  function shadePseudo(tag) {
    return { id: tag, name: "", role: "", lv: 60, hp: 60, maxHp: 60, gold: 0, memories: { summary: "", tail: [] }, isGoddessOutro: true, noTrade: true, kind: "goddess", tint: "#ffe9a8", appearance: null, blank: true, persona: "" };
  }
  function hermitPseudo() {
    return { id: "tower_hermit", name: "The Tower Hermit", role: "Last keeper of the seal-stitches", lv: 80, hp: 80, maxHp: 80, gold: 0, memories: { summary: "", tail: [] }, isGoddessOutro: true, noTrade: true, kind: "npc", tint: "#9a7bff", appearance: null, persona: "🧙 He has walked the 1000-ring so long the humming lives in his teeth." };
  }
  function chroniclerQuote() {
    const lines = [
      "“He went down singing, the receipts say. Volunteered, torch high, for everyone.” — marginalia, Pale Chronicler",
      "“The throne keeps what it catches the way a trap keeps a mouse: fed, warm, never leaving.” — marginalia, Pale Chronicler",
      "“Twelve cuts, twelve vaults, twelve deaths to earn them. She made the lock expensive on purpose.” — marginalia, Pale Chronicler",
    ];
    return lines[(Math.random() * lines.length) | 0];
  }
  function peterPseudo(m) {
    return { id: "peter_intro", name: "Peter the Fallen", role: "Supreme Overlord of Hell · lv " + ((m && m.lv) || 125), lv: (m && m.lv) || 125, hp: (m && m.hp) || 1, maxHp: (m && m.maxHp) || 1, gold: 0, memories: { summary: "", tail: [] }, isPeterIntro: true, noTrade: true, kind: "peter_the_fallen", tint: "#0a0a0a", appearance: null, persona: "👑 The end of Hell asks why you came.", peterMobId: m && m.id };
  }

  // ---------- Ch 0: Hearthkeeper (starting VN, origin + oath) ----------
  // The Hearthkeeper speaks the moment the hero enters the world — an intro,
  // not a quest-log errand. maybePlayIntro opens it once (the 🌟 Main →
  // 🔥 Listen button stays as a fallback for anyone who closed it).
  // World-entry intro state: one auto-launch attempt per entry. The Hearthkeeper
  // speaks the moment the hero enters the world — an intro, not a quest-log
  // errand. Tick + startPlaying kicks call tryAutoIntro until it succeeds;
  // _introAutoFiredEntry stops the nag if the hero closes the VN early
  // (🌟 Main → 🔥 Listen stays as the fallback). noteWorldEntry resets it so
  // the next entry retries while the spark is still unlistened.
  let _introAutoFiredEntry = false;
  function noteWorldEntry() { _introAutoFiredEntry = false; }
  function maybePlayIntro(p) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || G.mode !== "playing") return false;
      try { const t = document.getElementById("titleScreen"); if (t && !t.hidden) return false; } catch (e) {}
      try { const l = document.getElementById("loadingScreen"); if (l && !l.hidden) return false; } catch (e) {}
      try { if (window.UI && window.UI.isModalOpen && window.UI.isModalOpen()) return false; } catch (e) {}
      if (vnOpen || isModalOpen()) return false;
      // practice grounds included: the intro is per-hero and its oath gifts
      // are meaningless next to the free Practice setup, so build-lab heroes
      // hear it too (it also makes the VN testable where builds are tested).
      p = p || P(); if (!p) return false;
      showHearthkeeper(p);
      try { flags(p).introShown = true; } catch (e2) {}
      _introAutoFiredEntry = true;
      save();
      return true;
    } catch (e) { return false; }
  }
  // Entry-safe wrapper: lights the spark first (fresh heroes have no quest
  // yet), then attempts the one auto-launch for this world entry.
  function tryAutoIntro(p) {
    try {
      p = p || P(); if (!p) return false;
      let ms = ensure(p); if (!ms) return false;
      if (!ms.active && !ms.done.length) {
        routeFromProgress(p);
        try { ms = ensure(p); } catch (e) {}
      }
      if (!ms || !ms.active || ms.active.id !== "mq_hearth_spark") return false;
      try { if (ms.active.data && ms.active.data.listened) return false; } catch (e) {}
      // the oath decision is the point of no return: charm taken (or
      // deliberately refused) but the VN closed early — never auto-nag
      // again. Manual 🌟 Main → 🔥 Listen and descent both still finish it.
      try { const fl = flags(p); if (fl && (fl.oathCharm || fl.oathRefused)) return false; } catch (e) {}
      if (_introAutoFiredEntry) return false;
      return maybePlayIntro(p);
    } catch (e) { return false; }
  }
  function openHearth() {
    const p = P(); if (!p) return;
    const ms = ensure(p);
    if (!ms.active || ms.active.id !== "mq_hearth_spark") { toast("🔥 No hearth to hear — the Main quest has moved on.", 3500); return; }
    if (vnOpen || isModalOpen()) { toast("🔥 Finish speaking first.", 2500); return; }
    if (ms.active.data.listened) { toast("🔥 The Hearthkeeper has spoken. Descend now — the dark waits.", 4000); return; }
    showHearthkeeper(p);
  }
  function showHearthkeeper(p, done) {
    const f = flags(p);
    let hearth = "your first hearth";
    try { if (p.spawnName) hearth = p.spawnName; else if (p.homeHearth && p.homeHearth.name) hearth = p.homeHearth.name; } catch (e) {}
    const pages = [
      { sp: "The Hearthkeeper", text: "The fire leans toward you though the air is still. A voice comes up out of the embers like a hand out of a sleeve: dry, kind, brutally practical.<br><br>“So. You're the one with no prophecy on them. Sit — no, stand, the stones are hot. I'm the <b>Hearthkeeper</b>: the ember they lit this hearth with, still tending it. I've watched a hundred heroes come through " + hearth + ". Tell me — why did <b>you</b> come ?”",
        opts: [
          { label: "🔥 “I was exiled. I fight because it's all I have.”", next: 1, run: () => { f.origin = "ember"; } },
          { label: "🌅 “Someone has to mend things. I heal what I can.”", next: 2, run: () => { f.origin = "dawn"; } },
          { label: "🕳️ “I watch the dark. Someone should — properly.”", next: 3, run: () => { f.origin = "gloam"; } },
          { label: "🚶 “No reason. I just… kept walking.”", next: 4, run: () => { f.origin = "wanderer"; } },
        ] },
      { sp: "The Hearthkeeper", text: "“Exiled. Good — the Ember road. Fighters who've lost everything make the most honest blades: nothing left to perform for.<br>Peter was exiled too, in his way — sent down and never let back up. Remember that when you stand before him: he will <b>recognize</b> you.”<br><br>“Now — an oath, and my blessing on it. <b>Choose what you carry into the dark.</b>”",
        opts: [
          { label: "🔥 Take the Ember Oath (+8 ATK charm, fire's favor)", next: 5, run: () => { grantOathCharm("oath_ember_charm"); try { window.Items.addItem(p, "torch", 2); window.Items.addItem(p, "bomb", 1); } catch (e) {} } },
          { label: "🌅 Take the Dawn Oath instead (+HP/MP charm)", next: 5, run: () => { f.origin = "dawn"; grantOathCharm("oath_dawn_charm"); try { window.Items.addItem(p, "potion", 1); window.Items.addItem(p, "mana_potion", 1); } catch (e) {} } },
          { label: "🕳️ Take the Gloam Oath instead (+ward charm)", next: 5, run: () => { f.origin = "gloam"; grantOathCharm("oath_gloam_charm"); try { window.Items.addItem(p, "smoke_bomb", 1); window.Items.addItem(p, "potion", 1); } catch (e) {} } },
        ] },
      { sp: "The Hearthkeeper", text: "“A mender. Good — the Dawn road. She will love you on sight, and that should <b>terrify</b> you: the Dawn collects menders the way I collect sparks.<br>Heal what you can. But when her fair tale cracks — and it will, when you make her answer on the surface, round after round — mend the <b>truth</b> first and the feelings second.”<br><br>“Now — an oath, and my blessing on it. <b>Choose what you carry.</b>”",
        opts: [
          { label: "🌅 Take the Dawn Oath (+HP/MP charm, holy's favor)", next: 5, run: () => { grantOathCharm("oath_dawn_charm"); try { window.Items.addItem(p, "potion", 1); window.Items.addItem(p, "mana_potion", 1); } catch (e) {} } },
          { label: "🔥 Take the Ember Oath instead (+ATK charm)", next: 5, run: () => { f.origin = "ember"; grantOathCharm("oath_ember_charm"); try { window.Items.addItem(p, "torch", 2); window.Items.addItem(p, "bomb", 1); } catch (e) {} } },
          { label: "🕳️ Take the Gloam Oath instead (+ward charm)", next: 5, run: () => { f.origin = "gloam"; grantOathCharm("oath_gloam_charm"); try { window.Items.addItem(p, "smoke_bomb", 1); window.Items.addItem(p, "potion", 1); } catch (e) {} } },
        ] },
      { sp: "The Hearthkeeper", text: "The embers go very still. When the voice comes back it is quieter but respectful.<br><br>“A watcher. The Gloam road. Then hear me plainly, watcher to ember: the thing below <b>dreams</b>, and the Gloam Witnesses are right about that much. Peter dreams of unmaking death by <b>merging the worlds</b> — to defy life and death, to undo the meaning of having lived well, to make it so that one can gain anything in any world.<br>Watch him, and <i>her</i> as well.”<br><br>“Take my blessing — the dark will test a watcher hardest.”",
        opts: [
          { label: "🕳️ Take the Gloam Oath (+ward charm, watcher's grace)", next: 5, run: () => { grantOathCharm("oath_gloam_charm"); try { window.Items.addItem(p, "smoke_bomb", 1); window.Items.addItem(p, "potion", 1); } catch (e) {} } },
          { label: "🔥 Take the Ember Oath instead", next: 5, run: () => { f.origin = "ember"; grantOathCharm("oath_ember_charm"); try { window.Items.addItem(p, "torch", 2); } catch (e) {} } },
          { label: "🌅 Take the Dawn Oath instead", next: 5, run: () => { f.origin = "dawn"; grantOathCharm("oath_dawn_charm"); try { window.Items.addItem(p, "potion", 1); } catch (e) {} } },
        ] },
      { sp: "The Hearthkeeper", text: "A laugh like a log settling. “No reason! The best reason. Wanderers map the world by accident and save it the same way.<br>Consider this a gift, wanderer — the dark charges admission, and I'd rather you paid in charm than in blood.”",
        opts: [
          { label: "🔥 Ember charm (+8 ATK)", next: 5, run: () => { f.origin = "ember"; grantOathCharm("oath_ember_charm"); try { window.Items.addItem(p, "torch", 2); } catch (e) {} } },
          { label: "🌅 Dawn charm (+HP/MP)", next: 5, run: () => { f.origin = "dawn"; grantOathCharm("oath_dawn_charm"); try { window.Items.addItem(p, "potion", 1); } catch (e) {} } },
          { label: "🕳️ Gloam charm (+ward)", next: 5, run: () => { f.origin = "gloam"; grantOathCharm("oath_gloam_charm"); try { window.Items.addItem(p, "smoke_bomb", 1); } catch (e) {} } },
          { label: "🚶 “I need no oath. Just the road.”", next: 5, run: () => { f.origin = "wanderer"; f.oathRefused = true; try { window.Items.addItem(p, "potion", 2); window.Items.addItem(p, "torch", 1); } catch (e) {} } },
        ] },
      { sp: "The Hearthkeeper", text: "“Done. The oath is sworn and the charm will warm when you need it most — wear it proud.<br><br>Now hear the only order I'll ever give you: <b>go down</b>. Any dungeon mouth will do, any depth. The dark below keeps a shard of something broken, and your road starts at the bottom of the first hole.<br>Go. And come back with your eyes still yours.”", next: "done" },
    ];
    openVN(hearthPseudo(), pages, () => {
      try {
        const ff = flags(p);
        if (!ff.origin) ff.origin = "wanderer";
        const ms2 = ensure(p);
        if (ms2 && ms2.active && ms2.active.id === "mq_hearth_spark") {
          ms2.active.data.listened = true;
          ms2.active.data.origin = ff.origin;
          completeActive(p, "oath-sworn");
          // the oath WAS the intro — the delve quest takes over immediately
          // (no quest-log errand in between)
          startGenericFirstDelve(p);
        }
        grantEmbers(1);
        toast("🔥 Oath sworn (" + (originName(flags(p).origin) || "Wanderer") + "). A 🌅 Dawn Ember burns in your pack — and the dark waits below.", 6000);
        sfxLevel();
        save();
      } catch (e) {}
      try { done && done(); } catch (e2) {}
    });
  }

  // ---------- Ch 4: Tower Hermit (Main-tab counsel + tower aim) ----------
  function openHermit() {
    const p = P(); if (!p) return;
    const ms = ensure(p);
    if (!ms.active || ms.active.id !== "mq_towers") { toast("🧙 The Hermit only walks while the towers call.", 3500); return; }
    if (vnOpen || isModalOpen()) { toast("🧙 Finish speaking first.", 2500); return; }
    showHermit(p);
  }
  function showHermit(p, done) {
    const f = flags(p);
    const pages = [
      { sp: "The Tower Hermit", text: "He finds <i>you</i> — which is how you know he's the Hermit. Frost in his beard in no season, humming in his teeth that matches the sphere in your pack note for note.<br><br>“So she finally found a free blade. Good. I'm the last keeper of the seal-stitches, and that sphere of yours is the needle. Eight towers out there on the 1000-ring, one for every compass point, the same ground in both worlds. Wake one and you wake them all — then walk through.<br>Now — <b>which compass will you walk first?</b> The ash favors some roads. I'll mark your map-mind for it.”",
        opts: [
          { label: "🧭 “East — the short road.”", next: 1, run: () => { f.towerAim = "E"; } },
          { label: "🧭 “North — the cold road.”", next: 1, run: () => { f.towerAim = "N"; } },
          { label: "🧭 “South — the warm road.”", next: 1, run: () => { f.towerAim = "S"; } },
          { label: "🧭 “West — the long road.”", next: 1, run: () => { f.towerAim = "W"; } },
          { label: "🧭 “Whichever hums loudest — you choose.”", next: 2, run: () => { f.towerAim = null; } },
        ] },
      { sp: "The Tower Hermit", text: "“Hm. That road. Yes — I can feel it agreeing with you already. The towers hum loudest for the willing.<br><br>Two truths for the road. <i>First:</i> the towers stand on the SAME place in both worlds — each place is the same place twice, so chart one and you've charted its twin. <i>Second:</i> hell-side, you land far from comfort — the castle sits in the boiling heart of hell and the ash between is hungry. Sleep lightly; the dark drinks deep there.<br>The humming will know your tread now. Go — and come back with your eyes still yours.”", next: "done" },
      { sp: "The Tower Hermit", text: "“Ha! Letting the hum choose. The hum <i>likes</i> that. Nearest tower it is — follow the pull in your teeth.<br><br>Remember : the towers stand on the SAME place in both worlds — each place is the same place twice, so chart one and you've charted its twin.<br><br>The castle you seek sits in the boiling heart of hell and the ash between is hungry. Sleep lightly; the dark drinks deep there.”", next: "done" },
    ];
    openVN(hermitPseudo(), pages, () => {
      try {
        flags(p).hermitMet = true;
        const ms2 = ensure(p);
        if (ms2 && ms2.active && ms2.active.id === "mq_towers") {
          const aim = flags(p).towerAim;
          ms2.active.objective = aim ? "Find a 🗼 hell tower (1000 out) — the Hermit counsels " + aim + " first — and press E to enter Hell" : "Find a 🗼 hell tower (1000 out) and press E to enter Hell";
        }
        save();
        try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
      } catch (e) {}
      try { done && done(); } catch (e2) {}
    });
  }

  // ---------- goddess: first vision (expanded: origin-aware, ember reward) ----------
  function showFirstVision(p, done) {
    const f = flags(p); if (f.vision1) { try { done && done(); } catch (e) {} return; }
    const og = f.origin;
    const originOpt = og === "ember"
      ? { label: "🔥 “I was exiled too, in a way. I know what cages feel like.”", next: 6 }
      : og === "dawn"
      ? { label: "🌅 “I mend what I can. Tell me how to mend this.”", next: 6 }
      : og === "gloam"
      ? { label: "🕳️ “I watch the dark. It dreams — doesn't it?”", next: 8 }
      : { label: "🚶 “I just walked. The Hearthkeeper sent me down.”", next: 6 };
    const pages = [
      { sp: "???", text: "The shard in your pack turns <b>cold</b> — then <b>morning</b> breaks where no morning should be. Gold spills across the stone. A woman's voice, patient as sunrise, says your name correctly on the first try.<br><br><i>“Oh. You can hear me. Good. I was feeling a little lonely here. But now that you have picked up a fragment, you have no choice but to listen to me.”</i>",
        opts: [
          { label: "🌅 “Who are you?”", next: 1 },
          { label: "🩸 “What did I just pick up?”", next: 2 },
          { label: "😳 “Am I dreaming?”", next: 3 },
          originOpt,
        ] },
      { sp: "Goddess of Dawn", text: "“I am the sunrise. Call me the <b>Goddess of Dawn</b> — One who is revered as the goddess of Emberhold itself. Herald, witness, and the one who broke the thing now burning in your pocket.<br>That shard is a splinter of the <b>Hell Heart</b>. Twelve delves hold twelve splinters. You hold the first.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“A splinter of the <b>Hell Heart</b> — the anchors that Peter the Fallen drove into the world when he took the throne below.<br>I shattered them, long ago, into the deep dungeons. Every surface delve-lord hoards <b>one distinct shard</b>. Yours is one of many.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“No — which is why you should listen twice as hard. The dreaming dead would <i>love</i> for you to sleep through me.<br>You are awake. The shard is real. I am real. If you wish to enter hell itself, you must collect eleven more of those, among the numerous scattered shards across the deep dungeons.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“Hell's shards, and no two from the same delve — the same ground twice pays only echoes. Bring any twelve together and they will remember being whole.<br><br>The sphere will wake the <b>far towers</b> — eight of them on the 1000-ring, the same ground in both worlds — and through them you will cross into <b>Hell itself</b>.<br><br><i>Mark this too:</i> the shards <b>whisper</b>. At 3, 6 and 9 you will hear Peter dreaming through them. Do not answer him. Not yet. <i>" + chroniclerQuote() + "</i>",
        opts: [
          { label: "⚔️ “I'll find them all.”", next: 5 },
          { label: "❓ “Why me? I'm nobody.”", next: 6 },
          { label: "🚪 “And if I refuse? If I sell the shard?”", next: 7 },
        ] },
      { sp: "Goddess of Dawn", text: "“Then the dark chose better than I dared hope. Go softly, strike cleanly, and bring me no shard twice-earned.<br>Take these embers — morning you can hold. When the sphere is whole, the towers will know your tread. I will know it too.”", next: "done" },
      { sp: "Goddess of Dawn", text: "“Because you <b>chose</b> to go down. Gods cannot unmake what a mortal never chose to touch — that is the oldest law, and Peter knows it.<br>You came into the dark with no prophecy on you. Which mean I can wield you as my blade. Take these embers, and spend them freely.”", next: "done" },
      { sp: "Goddess of Dawn", text: "“Then the shard cools, the towers sleep, and Hell keeps its king — and one day something with your face comes up out of a delve wearing your choices.<br>Keep it. Sell it. Bury it. The dark is patient. I am merely asking — because asking is all I have left. Please.. I beg of you to fulfil my one wish.”<br><br><i>She waits. The light does not dim.</i>", next: "done" },
      { sp: "Goddess of Dawn", text: "The light stills — sunrise holding its breath. “...The Hearthkeeper marked you, did they? Then you already know.<br>Yes, it dreams. Peter dreams of <b>merging the worlds</b> — no more dying, no more losing, no more <i>choosing</i>. It sounds like mercy, and it would leave no one free. The shards carry it like a fever.<br>Hold the line, watcher. Bring twelve together, and bring me your questions with the castle wall at your back. I will answer them <i>all</i>.”", next: "done" },
    ];
    openVN(goddessPseudo("goddess_first"), pages, () => {
      try {
        const ff = flags(p); ff.vision1 = true;
        grantEmbers(2);
        completeActive(p, "vision");
        startTwelve(p);
        sfxLevel();
      } catch (e) {}
      try { done && done(); } catch (e2) {}
    });
  }

  // ---------- shard dreams: 3/6/9 interludes (resolve/doubt/defy + embers) ----------
  function showShardDream(p, n, done) {
    const f = flags(p);
    const key = n === 3 ? "shardDream3" : n === 6 ? "shardDream6" : "shardDream9";
    if (f[key]) { try { done && done(); } catch (e) {} return; }
    let pages;
    if (n === 3) {
      pages = [
        { sp: "The Shards", text: "Three shards. They hum together in your pack — a chord with a laugh under it, far below, that knows your name.<br><br><i>" + chroniclerQuote() + "</i><br><br>That night you dream: a torch, a young man's laugh, a door closing. You wake with ash on your tongue. <b>What do you do with the dream?</b>",
          opts: [
            { label: "🛡️ “Steel it. Dreams are wind.” (+resolve)", next: 1, run: () => { f.shardResolve = (f.shardResolve | 0) + 1; } },
            { label: "❓ “Ask what the laugh wants.” (+doubt)", next: 2, run: () => { f.shardDoubt = (f.shardDoubt | 0) + 1; } },
            { label: "🖤 “Keep it. Dreams are doors too.” (+defy)", next: 3, run: () => { f.shardDefy = (f.shardDefy | 0) + 1; } },
          ] },
        { sp: "The Shards", text: "Good. Wind passes; walls stand. The hum settles into your step.<br><i>(+🌅 Dawn Ember. Peter will find no purchase in you.)</i>", next: "done" },
        { sp: "The Shards", text: "The laugh almost answers — then thinks better of it. Curiosity is a hook, hero; mind what bites it.<br><i>(+🌅 Dawn Ember. The Goddess will hear of your questions.)</i>", next: "done" },
        { sp: "The Shards", text: "You decide to keep the shards. The dark makes sure that you notice that it is noticing that you are noticing it.<br><i>(+🌅 Dawn Ember. Peter will remember your attention.)</i>", next: "done" },
      ];
    } else if (n === 6) {
      pages = [
        { sp: "Peter (dreaming)", text: "Six shards. Peter dreams through them now: a torch, a volunteer, a door closing — and this time the dream speaks.<br><br><i>“You count well, little counter. Six of my heart, carried so carefully. Ask her what she shattered — go on. Ask her to her face.”</i><br><br>The Goddess warned you not to answer. <b>Do you?</b>",
          opts: [
            { label: "🤐 Say nothing. Count seven. (+resolve)", next: 1, run: () => { f.shardResolve = (f.shardResolve | 0) + 1; } },
            { label: "🌅 “The Hearthkeeper warned me about you.”", next: 2, run: () => { f.shardDoubt = (f.shardDoubt | 0) + 1; } },
            { label: "🕳️ “What did she shatter, then? Tell me.” (+defy)", next: 3, run: () => { f.shardDefy = (f.shardDefy | 0) + 1; } },
          ] },
        { sp: "Peter (dreaming)", text: "Silence — then, impossibly, something like respect. <i>“Disciplined. Good. Hold fast.”</i> The dream lets go of you.<br><i>(+🌅 Dawn Ember.)</i>", next: "done" },
        { sp: "Peter (dreaming)", text: "<i>“The ember still tends its grudge, does it? Tell it the door remembers the hand that closed it.”</i> The dream thins — but it heard the Hearthkeeper in you.<br><i>(+🌅 Dawn Ember.)</i>", next: "done" },
        { sp: "Peter (dreaming)", text: "<i>“My mortal heart — cut small, while it was still mortal, so the throne could never swallow it whole. Twelve cuts. But my heart regrew. Another twelve cuts. She kept on breaking my hearts. Ask her why twelve. Ask her what the thirteenth thing was.”</i><br>The dream ends. Your hands are shaking. <i>(+🌅 Dawn Ember. You will have questions for her trial.)</i>", next: "done" },
      ];
    } else {
      pages = [
        { sp: "The Shards", text: "Nine shards. The whispers sharpen into a voice — your voice, worn older, speaking from the bottom of a stair:<br><br><i>“ASK HER WHAT SHE SHATTERED.”</i><br><br>Three left. The sphere is almost a thought. The dreams are almost a door. <b>How do you carry the last three?</b>",
          opts: [
            { label: "⚔️ “As a blade. Finish it.” (+resolve)", next: 1, run: () => { f.shardResolve = (f.shardResolve | 0) + 1; } },
            { label: "🌅 “As a question. She owes me answers.” (+doubt)", next: 2, run: () => { f.shardDoubt = (f.shardDoubt | 0) + 1; } },
            { label: "👑 “As a warning — to them both.” (+defy)", next: 3, run: () => { f.shardDefy = (f.shardDefy | 0) + 1; } },
          ] },
        { sp: "The Shards", text: "Then finish it like a blade: point first, no flourish. The last three delves will feel like walking downhill with the wind at your back.<br><i>(+🌅 Dawn Ember. The final fight will know your edge.)</i>", next: "done" },
        { sp: "The Shards", text: "Good. Carry the question the way you carry steel — ready, not eager. She will answer, round after round, until her fair tale cracks.<br><i>(+🌅 Dawn Ember. The trial will hear your patience.)</i>", next: "done" },
        { sp: "The Shards", text: "Both of them, warned. The dawn and the door. Let them both be afraid of what you choose freely.<br><i>(+🌅 Dawn Ember. The epilogue will remember this.)</i>", next: "done" },
      ];
    }
    openVN(shadePseudo("shade_dream" + n), pages, () => {
      try { flags(p)[key] = true; grantEmbers(1); save(); } catch (e) {}
      try { done && done(); } catch (e2) {}
    });
  }

  // ---------- goddess: hell arrival (expanded: Ashen Guide + hell path) ----------
  function showHellArrival(p, done) {
    const f = flags(p); if (f.visionHell) { try { done && done(); } catch (e) {} return; }
    const pages = [
      { sp: "Goddess of Dawn", text: "Ash takes your footprints. The sky is a wound that never quite bleeds — and then, absurd as sunrise, <b>she</b> is standing in it with cinders cooling on her shoulders.<br><br>“You crossed. Oh, brave fool. Oh, <i>lovely</i> fool. Breathe shallow here; the air remembers every oath ever broken in it.”",
        opts: [
          { label: "🏰 “Where is the castle?”", next: 1 },
          { label: "👹 “What walks here besides us?”", next: 2 },
          { label: "👑 “Tell me about Peter. No more riddles.”", next: 3 },
        ] },
      { sp: "Goddess of Dawn", text: "“Dead center. <b>In the heart of hell</b> — where your world's first hearth would be, if this were your world. Lava moat, double ring, bone and blood and voidglass in the courts.<br>Walk it. The portal room at its heart is a mouth: five levels down, and <b>he</b> is at the bottom.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“Fiends in families — ash, blood, obsidian, bone, flesh — and the four hell holdings with their warlords. Demon holds keep hearth portals like towns, and their folk will trade with you, civil as tax collectors.<br>Sleep lightly at night: <b>succubi drink deep in the dark</b> here. And never trust a war-sign that promises mercy — the garrison at the castle offers none.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“Not yet. You have earned the <i>road</i> to him, not the <i>truth</i> of him. Ask me again with the castle wall at your back and I will tell you plainer.<br>For now: he was mine. That is the whole of it and none of it. Go — to the heart of hell — and do not let the ash memorize you.”", next: 4 },
      { sp: "The Ashen Guide", text: "Something steps out of the ember-drift — hell-born, by the horns and the heat-shimmer, but its blade is sheathed and its hands are open. It nods to the Goddess like an old argument, and to you like a new one.<br><br>“I deserted the castle garrison. No oath left in me but this: nobody else walks in blind. Two roads to the moat, hero — <b>walk soft</b> and I'll show you the blind canyons, or <b>walk loud</b> and I'll drum the garrison out where you can see it. Choose. The castle answers each.”",
        opts: [
          { label: "🌙 “Soft. Show me the blind canyons.” (+💨 smoke)", next: 5, run: () => { const ff = flags(P()); ff.hellPath = "stealth"; try { window.Items.addItem(P(), "smoke_bomb", 2); } catch (e) {} } },
          { label: "🔥 “Loud. Drum them out.” (+🧪 potions)", next: 6, run: () => { const ff = flags(P()); ff.hellPath = "bold"; try { window.Items.addItem(P(), "potion", 2); } catch (e) {} } },
        ] },
      { sp: "The Ashen Guide", text: "“Soft it is. Ember-drifts, blind canyons, garrison patrols timed like a bad liturgy. Stick to my marks and the moat won't know you're coming until you're <i>in</i> it.<br>And if the dark talks to you in her voice — it won't be her. She only ever meets you <b>face to face, in light</b>. Remember that. It matters later.”", next: "done" },
      { sp: "The Ashen Guide", text: "A grin with too many teeth, and honest for all that. “Loud! Good — I was getting bored of whispering.<br>War-drum roads, muster-fields, the garrison drawn out in its pride where your blade can <i>see</i> it.<br>If the dark talks in her voice — it isn't her. Talk face to face, in light, always. Remember it.”", next: "done" },
    ];
    openVN(goddessPseudo("goddess_hell"), pages, () => {
      try {
        const ff = flags(p); ff.visionHell = true;
        if (!ff.hellPath) ff.hellPath = "bold";
        completeActive(p, "hell-vision");
        startHeart(p);
        sfxLevel();
      } catch (e) {}
      try { done && done(); } catch (e2) {}
    });
  }

  // ---------- goddess: kicked encouragement ----------
  function showKickedEncouragement(p, done) {
    const pages = [
      { sp: "Goddess of Dawn", text: "Light finds you the moment the dungeon spits you out — same gold, same patience, but her hands are shaking.<br><br>“You live. <i>You live.</i> Do you understand what that means? He <b>let</b> you live. Why did he let you live ? What did he see in you ? I must know.”",
        opts: [
          { label: "😤 “He threw me out like trash.”", next: 1 },
          { label: "😨 “I stood before him and froze.”", next: 2 },
          { label: "🤔 “He didn't feel… evil. Explain.”", next: 3 },
        ] },
      { sp: "Goddess of Dawn", text: "“He threw you out like <i>treasure</i>. Do not waste the insult. I know him better than anyone.<br>He is still the anchor. The throne still drinks through him. His mercy will not last — go back while the door stands open.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“Then you are wise. Fear is the correct liturgy down there.<br>But fear doesn't resolve anything. You must face him, because I cannot.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“No. He doesn't <i>feel</i> evil, because he is <i>not</i> evil. He is tired.<br>Listen: whatever he told you about me, bring it to me later if you must. But first — <b>end him</b>, before his weariness spends itself on you.”", next: 4 },
      { sp: "Goddess of Dawn", text: "“Go back down. He will not offer mercy twice — neither should you.”", next: "done" },
    ];
    openVN(goddessPseudo("goddess_kicked"), pages, () => {
      try { const ff = flags(p); ff.kickedSeen = true; } catch (e) {}
      try { done && done(); } catch (e2) {}
    });
  }

  // ---------- Peter audience (branching, expanded options) ----------
  function peterAudience(m) {
    const p = P(); if (!p) return;
    const ms = ensure(p);
    const f = flags(p);
    // final-fight revisit: no mercy, no trial — only steel.
    const noMercy = !!(f.peterSlain || f.confrontDone || (ms.active && ms.active.id === "mq_final_fight") || f.mercyUsed);
    if (noMercy) { peterFinalIntro(m); return; }
    try { window.__peterMob = m; } catch (e) {}
    const og = f.origin;
    const res = f.shardResolve | 0, dou = f.shardDoubt | 0, def = f.shardDefy | 0;
    const loreN = loreReadCount(p);
    const intro = [
      { sp: "Peter the Fallen", text: "The dark at the bottom of the world <b>sits up</b>. A black demon-mask weeping violet fire, twin burning slits glaring under a six-spear crown of bone, a third blaze eye seething on the forehead, torn wings mantled behind spiked pauldrons, a broken halo ringed in purple flame turning slow as a millstone. A heart beats in the fanged maw of his chest; his voidglass greatblade burns with the same fire — and when he swings, the burning slits go <b>white-hot</b>. His voice arrives before his mouth moves.<br><br>“Mortal. You stand at the <b>end of Hell itself</b>. The ash knows your tread. The throne knows your name before you speak it.<br><b>Why are you here?</b>”" + (res >= 2 ? "<br><br><i>He tilts his head. “You carry my dreams like orders. Disciplined. I almost hate to break you.”</i>" : def >= 2 ? "<br><br><i>He tilts his head. “You kept my dreams like knives. Careful, little keeper — knives cut the hand.”</i>" : ""),
        opts: [
          { label: "⚔️ “I came to end you, Overlord.”", next: "done", run: () => { f.peterChoice = "fight"; } },
          { label: "👑 “I seek the throne of Hell.”", next: 1 },
          { label: "🌀 “Wrong turn. This ends here anyway.”", next: 2 },
          { label: "❓ “Who are you, really?”", next: 3 },
          { label: "🏰 “What IS this place?”", next: 4 },
          { label: "🌅 “The goddess sent me.”", next: 5 },
        ].concat(
          og === "ember" ? [{ label: "🔥 “I was exiled too. You know what cages feel like.”", next: 3, run: () => { f.peterNotedOrigin = true; } }] :
          og === "dawn" ? [{ label: "🌅 “I mend what I can. Tell me how to mend this — plainly.”", next: 5, run: () => { f.peterNotedOrigin = true; } }] :
          og === "gloam" ? [{ label: "🕳️ “I dream the same dream you send. Tell me about the merging.”", next: 4, run: () => { f.peterNotedOrigin = true; } }] : []
        ).concat(
          loreN >= 10 ? [{ label: "📖 “I've read the books — all six faiths. They agree on what happened.”", next: 3, run: () => { f.peterNotedLore = true; } }] : []
        ) },
      { sp: "Peter the Fallen", text: "A laugh like a vault door easing. “The throne. Honest hunger, at least. Sit — no, stand; the floor remembers sitters.<br>This throne is wound. Whoever holds it holds Hell <i>shut</i> — and Hell pays its keeper in everything except peace.<br>Take it, and you will understand me by winter. Break it, and you will unmake me by spring. The throne has no mercy for ones like us.”",
        opts: [
          { label: "⚔️ “Then I'll break it. Starting with you.”", next: "done", run: () => { f.peterChoice = "fight"; } },
          { label: "🙏 “Spare me. I don't want the throne.”", next: 2 },
          { label: "🌅 “The goddess says you must die. Is she lying?”", next: 5 },
        ] },
      { sp: "Peter the Fallen", text: "He studies you like a stone sculpture.<br><br>“Lost. Tired. Small … I was once the same.<br>Go, then. Tell the dark you were <b>thrown out</b> - Not that she would believe it.”",
        opts: [
          { label: "🙏 “Thank you. I'll go.” (let him eject you)", next: "done", run: () => { f.peterChoice = "spared"; } },
          { label: "⚔️ “No. I came to finish this.” (attack!)", next: "done", run: () => { f.peterChoice = "fight"; } },
        ] },
      { sp: "Peter the Fallen", text: (f.peterNotedOrigin && og === "ember" ? "The burning slits widen — almost warm. “Exiled. Yes. I can smell the closed door on you.<br>" : "") + (f.peterNotedLore ? "“Six faiths and you read them. Then you know the events and the lies both — rare. Rarer than knights.<br>" : "") + "“Who was I? The Dawn's <b>first champion</b> — her morning star, her blade, her beloved , her greatest mistake. I volunteered to descend and <b>hold Hell shut from the inside</b>.<br>It worked. Oh, it worked. And the throne kept its half of the bargain the way a trap keeps a mouse: fed, warm, and never leaving.<br>Ask her what she shattered to seal me. Ask her what the twelve shards <i>are</i>. Then decide which of us is the monster.”",
        opts: [
          { label: "⚔️ “Pretty words. We end this now.”", next: "done", run: () => { f.peterChoice = "fight"; } },
          { label: "🌅 “If she's lying, I'll prove it. Give me the question.”", next: 5 },
          { label: "🙏 “I need time. Let me go.”", next: 2 },
        ] },
      { sp: "Peter the Fallen", text: (f.peterNotedOrigin && og === "gloam" ? "“The merging. So the ember taught you to listen properly. Then hear it from the source: death is a wound, and I mean to close it — one world, no losing, no choosing. Tell me, watcher — is a cage still a cage if nothing ever wants out?<br>" : "") + "“This? My <b>waiting room</b>. Five levels of hunger above a door that never opens. The castle above is the lock; the dungeon is the keyhole; I am the key, turning slowly in my own spine.<br>The twelve shards you gathered? You reassembled a copy of my <b>mortal heart</b> ? She told you they were a seal, didn't she ?”",
        opts: [
          { label: "⚔️ “Enough history. Fight me.”", next: "done", run: () => { f.peterChoice = "fight"; } },
          { label: "🌅 “She shattered your heart? I'll ask her to her face.”", next: 5 },
          { label: "🙏 “I didn't know. Let me leave.”", next: 2 },
        ] },
      { sp: "Peter the Fallen", text: "The burning slits <b>narrow</b>, fire-tears brightening. The halo stops turning.<br><br>“Ah. Her. My lovely dawn, my eternal chain, my slow executioner. Did she tell you what I am? An anchor. Did she tell you what happens to a sea when its anchor is cut? No. She told you to <i>kill</i> me.<br>Go back up. <b>Ask her to her lovely face</b> — round after round, until her fair tale cracks. If you still lift your blade after that, I will meet it honestly. If you won't ask, you are merely her knife — and I do not parley with cutlery.”" + (dou >= 2 ? "<br><br><i>“You carry questions already. Good. Bring them all — she owes you every answer.”</i>" : ""),
        opts: [
          { label: "🌅 “Give me the trial. I'll confront her.”", next: "done", run: () => { f.peterChoice = "confront"; } },
          { label: "⚔️ “No. Her knife cuts tonight.” (attack!)", next: "done", run: () => { f.peterChoice = "fight"; } },
          { label: "🙏 “I… need to think. Let me go.”", next: "done", run: () => { f.peterChoice = "spared"; } },
        ] },
    ];
    openVN(peterPseudo(m), intro, () => {
      try {
        const choice = flags(p).peterChoice || "fight";
        // audience quest completes into the branch
        try { completeActive(p, "audience:" + choice); } catch (e) {}
        if (choice === "fight") {
          startFinal(p, "You answered with war, and he rose to meet it. Slay Peter the Fallen — no parley, no second door.");
          try { beginPeterFight("“THEN FALL.”"); } catch (e) {}
        } else if (choice === "spared") {
          flags(p).mercyUsed = true;
          startFinal(p, "He let you live — and that mercy will curdle. Return down and end him before it turns. (The Goddess will find you outside.)");
          try { ejectFromGodDelve("spared"); } catch (e) {}
          setTimeout(() => { try { showKickedEncouragement(p); } catch (e) {} }, 1200);
        } else {
          startConfront(p);
          try { ejectFromGodDelve("confront"); } catch (e) {}
        }
        try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e2) {}
      } catch (e) {}
    });
  }
  function peterFinalIntro(m) {
    const p = P();
    try { window.__peterMob = m; } catch (e) {}
    const pages = [
      { sp: "Peter the Fallen", text: "He is already standing. The burning slits have gone <b>white-hot</b>; the broken halo turns the wrong way, ringed in purple flame; the fire-wreathed greatblade drinks the light; the heart in his fanged chest-maw beats faster.<br><br>“You returned. Good. The words are spent — <b>no more doors, no more trials</b>. Lift your blade, petty knife of the dawn, and let us finish it.”",
        opts: [
          { label: "⚔️ “For the Dawn!” (attack!)", next: "done" },
          { label: "🗡️ “For myself. For everyone.” (attack!)", next: "done" },
        ] },
    ];
    openVN(peterPseudo(m), pages, () => { try { beginPeterFight("“THEN FALL.”"); } catch (e) {} });
  }

  function beginPeterFight(answer) {
    try {
      const G = window.Game.G;
      const m = window.__peterMob || G.mobs.find(k => k && k.kind === "peter_the_fallen" && k.hp > 0 && !k.corpse);
      if (m) {
        m.peterDormant = false; m.peterAsked = true;
        m.bossT = 1.5; m.bossT2 = 5; m._pkWave = 60;
        try { m.targetId = "player"; m.targetRef = G.player; window.Game.setHostile(m, G.player, 30); } catch (e) {}
        try { window.Game.bossSay(m, answer ? "😈 \"" + answer + "\" — THEN FALL." : "😈 THEN FALL.", 3500); } catch (e2) {}
        try { window.Game.addParticles(m.x, m.y, "#0a0a0a", 16); } catch (e3) {}
      }
      try { window.__peterMob = null; } catch (e) {}
      try { if (window.UI && window.UI.closeChat) window.UI.closeChat(); } catch (e) {}
      try { if (window.Sfx && window.Sfx.death) window.Sfx.death(); } catch (e) {}
    } catch (e) {}
  }

  function ejectFromGodDelve(why) {
    try {
      const G = window.Game.G, p = G.player;
      if (!p) return;
      p.inDungeon = null; p.dungeonLevel = 1;
      G.dungeon = null; G.mobs = []; G.projectiles = []; G.shadowClones = []; G.bossSpawned = false;
      try { if (window.World && window.World.setDim) window.World.setDim("hell"); } catch (e) {}
      try { p.dim = "hell"; } catch (e2) {}
      // land outside the castle ring, on walkable ground
      let nx = 70, ny = 0;
      try {
        for (let t = 0; t < 40; t++) {
          const a = Math.random() * Math.PI * 2, r = 66 + Math.random() * 20;
          const cx = Math.cos(a) * r, cy = Math.sin(a) * r;
          try { if (window.Game.walkable(cx, cy)) { nx = cx; ny = cy; break; } } catch (e) {}
        }
      } catch (e) {}
      p.x = nx; p.y = ny;
      try { p.posByDim = p.posByDim || {}; p.posByDim.hell = { x: nx, y: ny }; } catch (e) {}
      try { p.targetId = null; p.targetRef = null; p.hostileUntil = 0; if (window.Game.clearCombat) window.Game.clearCombat(); } catch (e) {}
      try { G.mobs = []; G.projectiles = []; } catch (e2) {}
      (async () => {
        try { if (window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) {}
        try { if (window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e2) {}
        try { if (window.Game.summonParty) window.Game.summonParty({ quiet: true }); } catch (e3) {}
        try { if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround(); } catch (e4) {}
        try { window.UI.toast(why === "confront" ? "🚪 Peter ejects you — his seal bars the dungeon until you confront the Goddess." : "🚪 Peter casts you out of his dungeon — alive, which is more than he offers most.", 6000); } catch (e5) {}
        try { if (window.UI && window.UI.drawMinimap) window.UI.drawMinimap(); } catch (e6) {}
        try { window.Game.saveGame(true); } catch (e7) {}
      })();
    } catch (e) {}
  }

  // ---------- confront: multi-round interrogation (dream/origin-aware) ----------
  function openConfront() {
    const p = P(); if (!p) return;
    const ms = ensure(p);
    if (!ms.active || ms.active.id !== "mq_confront") { toast("🌅 No confrontation to hold — the quest is not active.", 3500); return; }
    if (p.inDungeon) { toast("🌅 Not down here — stand on the SURFACE world to call her.", 4000); return; }
    try { if (window.World && window.World.getDim && window.World.getDim() === "hell") { toast("🌅 Not in Hell — return to the SURFACE world to confront her.", 4000); return; } } catch (e) {}
    if (vnOpen || isModalOpen()) { toast("🌅 Finish speaking first.", 2500); return; }
    const f = flags(p);
    const empathy = f.confrontEmpathy | 0, press = f.confrontPress | 0;
    const dreamLine = (f.shardDefy | 0) >= 2 ? "“You dreamed with him, didn't you — kept his dreams like knives. Then you already know the shape of what I'm about to admit. Ask.”"
      : (f.shardDoubt | 0) >= 2 ? "“You carried questions all the way up from the shards. Good. Ask them all — I owe you every answer.”"
      : (f.shardResolve | 0) >= 2 ? "“You counted like a mason and never answered him. Good. Discipline deserves honesty, so ask — I will not run.”"
      : null;
    const pages = [
      { sp: "Goddess of Dawn", text: "You speak her name into morning light — and morning <b>answers</b>, too fast, too guilty-fast. She stands in ordinary daylight like a woman caught mid-letter.<br><br>“You called. From the surface, no less. … He let you live. Then he sent you to <i>me</i>. Say it plainly. What does my champion accuse me of?”" + (dreamLine ? "<br><br>" + dreamLine : ""),
        opts: [
          { label: "⚖️ “He says you lie. That the shards are his heart.”", next: 1, run: () => { f.confrontPress = press + 1; } },
          { label: "💔 “He says you shattered him to seal him.”", next: 1, run: () => { f.confrontPress = press + 1; } },
          { label: "🌅 “I don't accuse. I need the truth.”", next: 2, run: () => { f.confrontEmpathy = empathy + 1; } },
        ].concat(f.origin === "gloam" ? [{ label: "🕳️ “I dream his dreams. Tell me about the merging — plainly.”", next: 6, run: () => { f.confrontPress = (f.confrontPress | 0) + 1; f.confrontDefy = (f.confrontDefy | 0) + 1; } }] : []) },
      { sp: "Goddess of Dawn", text: "“Careful. Accusations are doors too. … Yes. The shards <b>are</b> his many mortal hearts — cut small, while it was still mortal, so the throne could never digest it whole. I scattered them among delve-lords and called it a seal.<br>But it wasn't a lie - it <i>was</i> a seal : while his heart lay scattered, the throne could not finish him. Ask your next question.”",
        opts: [
          { label: "👑 “Why twelve? Why delves?”", next: 3, run: () => { f.confrontPress = (f.confrontPress | 0) + 1; } },
          { label: "💔 “Did you love him?”", next: 4, run: () => { f.confrontEmpathy = (f.confrontEmpathy | 0) + 1; } },
          { label: "😠 “You used me as a knife.”", next: 5, run: () => { f.confrontDefy = (f.confrontDefy | 0) + 1; } },
        ] },
      { sp: "Goddess of Dawn", text: "“Then here is a true thing, freely given: Peter was my <b>first champion</b> — mortal, laughing, stupid-brave. When Hell pressed up, he <b>volunteered</b> to descend and hold it shut from the inside.<br>It worked. The throne kept him the way a trap keeps a mouse. Ask on. I will not run from the next one.”",
        opts: [
          { label: "👑 “Why twelve shards?”", next: 3, run: () => { f.confrontPress = (f.confrontPress | 0) + 1; } },
          { label: "💔 “Did you love him?”", next: 4, run: () => { f.confrontEmpathy = (f.confrontEmpathy | 0) + 1; } },
          { label: "😠 “You used me.”", next: 5, run: () => { f.confrontDefy = (f.confrontDefy | 0) + 1; } },
        ] },
      { sp: "Goddess of Dawn", text: "“Twelve ? My dear, I cut his hearts into many, many pieces. It just happened to be so that twelve of them could remake a copy of his heart.”",
        opts: [
          { label: "💔 “Did you love him? Plainly.”", next: 4, run: () => { f.confrontEmpathy = (f.confrontEmpathy | 0) + 1; } },
          { label: "⚔️ “Then why must he die? Why not free him?”", next: 6 },
        ] },
      { sp: "Goddess of Dawn", text: "The light goes very still. When she speaks again the herald is gone and only the woman is left.<br><br>“Yes. Beyond liturgy, beyond sense, beyond the centuries I have practiced not saying it. He was my morning star. I have loved nothing since the way I loved his laugh.<br>And I will love him <b>dead</b> before I love him <b>throned</b>. That is the whole of it. Ask me why he cannot simply be freed.”",
        opts: [
          { label: "⚔️ “Why can't he be freed?”", next: 6 },
          { label: "🌅 “I'm sorry. Truly.”", next: 6, run: () => { f.confrontEmpathy = (f.confrontEmpathy | 0) + 1; } },
        ] },
      { sp: "Goddess of Dawn", text: "She flinches — honestly flinches. “Fair. I <b>did</b> use you. Gods cannot unmake what they love; only a mortal who <b>chooses freely</b> can cut an anchor.<br>Every knight I sent before you carried my prophecy like a leash — so their choice was never free, and the throne ate them. You came with no prophecy. You chose every step. That is why your blade can do what mine cannot.”",
        opts: [
          { label: "⚔️ “Then why must he die?”", next: 6 },
          { label: "😠 “That's still using me.”", next: 6, run: () => { f.confrontDefy = (f.confrontDefy | 0) + 1; } },
        ] },
      { sp: "Goddess of Dawn", text: "“Because he <i>is</i> the cork and the wine both. While he sits the throne, Hell stays <b>shut</b> — but it also stays <b>hungry</b>, drinking through him, growing through him. He dreams of unmaking death by <b>merging the worlds</b>: no more dying, no more losing — and no more choosing, either. It sounds like mercy, and it would leave no one free.<br>Cut the anchor and Hell loses its throat. The fiends remain, the ash remains — but the <b>hunger with a will</b> ends. That is why he must die, and why it must be <b>you</b>, freely, face to face, with the whole truth in your hands.”<br><br><i>Mark this, since you pressed this far:</i> the towers were my seal-stitches; the sphere your needle. The castle garrison knows its master is dying — expect no mercy on your return.",
        opts: [
          { label: "⚔️ “I believe you. I'll finish it.” (lift the seal)", next: "done", run: () => { f.confrontDone = true; } },
          { label: "🔍 “Prove it. Show me one memory.”", next: 7 },
          { label: "🚪 “You used me — I refuse.”", next: 8, run: () => { f.confrontDefy = (f.confrontDefy | 0) + 1; } },
        ] },
      { sp: "Goddess of Dawn", text: "She touches your brow. Light, cinder, a young man's laugh, a volunteer stepping down into dark with a torch held high — <i>for everyone</i> — and centuries of a woman counting shards like beads.<br><br>“There. My proof and my shame together. Now — will you finish it?”",
        opts: [
          { label: "⚔️ “Yes. I'll finish it.” (lift the seal)", next: "done", run: () => { f.confrontDone = true; } },
          { label: "🚪 “I still refuse.”", next: 8, run: () => { f.confrontDefy = (f.confrontDefy | 0) + 1; } },
        ] },
      { sp: "Goddess of Dawn", text: "“Then refuse — and watch the refusal rot. The throne will still drink. The ash will still spread. And one day something wearing your face will walk up out of a dungeon someday as someone like Peter.<br>I will not compel you. I <i>cannot</i>. But I will wait — right here, in this light — until you choose again. The seal holds until you do.”",
        opts: [
          { label: "⚔️ “…Fine. I'll do it. For everyone.” (lift the seal)", next: "done", run: () => { f.confrontDone = true; } },
          { label: "🌅 “Give me a moment.” (leave, come back)", next: "done", run: () => { /* leave seal shut */ } },
        ] },
    ];
    openVN(goddessPseudo("goddess_trial"), pages, () => {
      try {
        const ff = flags(p);
        const qq = ensure(p).active;
        if (qq && qq.id === "mq_confront") qq.data.rounds = (qq.data.rounds | 0) + 1;
        if (ff.confrontDone) {
          completeActive(p, "confront-done");
          ff.banGodDelve = false;
          startFinal(p, "You heard her plainly, with nothing left to spend. Return down: no more doors, no more trials — only steel left.");
          sfxLevel();
          toast("🔓 Peter's seal breaks — the god-delve mouth opens again.", 5000);
        } else {
          toast("🌅 She waits. Open 🌟 Main → 🌅 Commune when ready.", 4500);
        }
        save();
      } catch (e) {}
    });
  }

  // ---------- epilogue (3 endings + keepsake choice) ----------
  function showEpilogue(p, hadConfront) {
    const f = flags(p);
    const name = (p && p.name) || "Wanderer";
    const lv = (p && p.lv) || 1;
    const kills = (p && p.kills) | 0, bosses = (p && p.bossKills) | 0, delves = (p && p.dungeonsEntered) | 0;
    const totalFrags = (f.totalFragments | 0) || fragCount(p) || 12;
    const mercy = !!f.mercyUsed;
    const defy = f.confrontDefy | 0, emph = f.confrontEmpathy | 0, res = f.shardResolve | 0;
    const og = originName(f.origin);
    const ending = defy > emph + 1 ? "ash" : (f.origin === "gloam" && defy >= emph ? "ash" : "dawn");
    const adv = "You came nameless to your first hearth and leave level " + lv + " with " + kills + " foes and " + bosses + " lords behind you — " + delves + " delves entered, " + totalFrags + " shards gathered" + (og ? ", " + og + " oath sworn" : "") + (mercy ? ", spared once by the very thing you came to kill" : "") + (hadConfront ? (defy > 0 ? ", and you made even the dawn flinch before you believed her" : ", and you heard the dawn plainly before you lifted the blade") : ", and you struck without demanding the whole truth first") + (f.hellPath ? (f.hellPath === "stealth" ? ", walking the blind canyons soft as smoke" : ", walking the war-drum roads loud as thunder") : "") + ".";
    const truth = hadConfront
      ? "“You already know the shape of it, so I will say it short: Peter was my first champion. He volunteered to hold Hell shut from inside, and the throne kept him like a trap. The twelve shards were his mortal heart, cut small so it could never be swallowed. He had to die because while he sits, Hell stays hungry <i>with a will</i> — dreaming of merging the worlds so no one ever has to lose again. You cut the anchor freely. That is why your blade worked where prophecies failed.”"
      : "“You struck without the whole truth, so hear it now, plainly, with nothing left to spend: Peter was my first champion — my morning star. He volunteered to descend and hold Hell shut from the inside, and the throne kept him. The twelve shards were his mortal heart, cut small and scattered so the throne could never digest it. Only a mortal who chose freely could cut that anchor. That was you, " + name + ". That will always be you.”";
    const endWord = ending === "ash"
      ? "“You argued with me to my face and chose anyway. The dawn will remember that longer than obedience.<br>Come — your first dawn is still keeping your footprints. And take this counsel: watch the dark. Properly. Someone should.”"
      : "“Home, then — to where you began. The fiends remain, the ash remains, but the hunger with a will is ended. Holds will quarrel. Delves will still stir. But no throne will ever again dream your name in the dark.<br>Come — I carry you to your first dawn.”";
    const pages = [
      { sp: "Goddess of Dawn", text: "Morning breaks in Hell — actual morning, gold on ash, impossible and gentle. She stands in it, tired and incandescent at once.<br><br>“It is done, hero. The <b>Supreme Overlord of Hell</b> has fallen by your hand, and the dark below loosens its grip on the world.”",
        opts: [
          { label: "🌅 “It's over? Truly?”", next: 1 },
          { label: "😮 “You came. In Hell. Again.”", next: 1 },
        ] },
      { sp: "Goddess of Dawn", text: truth + "<br><br><i>Of your road, minstrel-brief:</i> " + adv,
        opts: [
          { label: "🌅 “Carry me home.”", next: 2 },
          { label: "❓ “What happens to Hell now?”", next: 3 },
          { label: "👑 “The throne — what becomes of it?”", next: 4 },
        ] },
      { sp: "Goddess of Dawn", text: endWord + "<br><br><i>At your feet the broken throne cools. One splinter glows faintly — small enough to carry. <b>Take it, or let it crumble?</b></i>",
        opts: [
          { label: "👑 “I'll carry a sliver. Someone should remember.” (+keepsake)", next: "done", run: () => { const ff = flags(P()); ff.ending = ending; ff.endingKeep = true; try { window.Items.addItem(P(), "throne_sliver", 1); } catch (e) {} } },
          { label: "🌅 “Let it crumble. No more anchors.”", next: "done", run: () => { const ff = flags(P()); ff.ending = ending; ff.endingKeep = false; grantEmbers(2); } },
        ] },
      { sp: "Goddess of Dawn", text: "“It starves, properly, like any wilderness — instead of <i>wanting</i>. The holdings will quarrel without their throat. Delves will still birth lords, towers will still hum — but no will gathers them now.<br>And you? You go home. Come — your first dawn is still keeping your footprints.<br><br><i>At your feet the broken throne cools. One splinter glows faintly — small enough to carry. <b>Take it, or let it crumble?</b></i>”",
        opts: [
          { label: "👑 “I'll carry a sliver. Someone should remember.” (+keepsake)", next: "done", run: () => { const ff = flags(P()); ff.ending = ending; ff.endingKeep = true; try { window.Items.addItem(P(), "throne_sliver", 1); } catch (e) {} } },
          { label: "🌅 “Let it crumble.”", next: "done", run: () => { const ff = flags(P()); ff.ending = ending; ff.endingKeep = false; grantEmbers(2); } },
        ] },
      { sp: "Goddess of Dawn", text: "“Broken. Scattered. Crumbled to cold iron and old intent — by <i>your</i> hand, freely chosen, which is the only unmaking that holds.<br>One splinter still glows, small enough to carry. It dreams faintly of being held. Most would call that a warning. The Hearthkeeper would call it a <i>souvenir</i>.<br><b>Take it, or let it crumble?</b>”",
        opts: [
          { label: "👑 “Souvenir. Someone should remember.” (+keepsake)", next: "done", run: () => { const ff = flags(P()); ff.ending = ending; ff.endingKeep = true; try { window.Items.addItem(P(), "throne_sliver", 1); } catch (e) {} } },
          { label: "🌅 “Let it all crumble.”", next: "done", run: () => { const ff = flags(P()); ff.ending = ending; ff.endingKeep = false; grantEmbers(2); } },
        ] },
    ];
    openVN(goddessPseudo("goddess_outro"), pages, () => {
      try {
        completeActive(p, "epilogue");
        const ff = flags(p); ff.storyDone = true;
        save();
      } catch (e) {}
      try { goddessSendHome(); } catch (e2) {}
    });
  }
  async function goddessSendHome() {
    try { if (window.UI && window.UI.closeChat) window.UI.closeChat(); } catch (e) {}
    try {
      const G = window.Game.G, p = G.player;
      if (!p) return;
      try { p.inDungeon = null; p.dungeonLevel = 1; G.dungeon = null; G.mobs = []; G.projectiles = []; G.shadowClones = []; G.bossSpawned = false; } catch (e) {}
      try { if (window.World && window.World.setDim) window.World.setDim("surf"); } catch (e2) {}
      try { p.dim = "surf"; } catch (e3) {}
      try { p.posByDim = p.posByDim || {}; p.posByDim.hell = p.posByDim.hell || { x: p.x, y: p.y }; } catch (e4) {}
      // initial spawn: player's recorded spawn, else 2.5,4.5
      let sx = 2.5, sy = 4.5;
      try {
        if (p.spawnX != null && p.spawnY != null) { sx = +p.spawnX; sy = +p.spawnY; }
        else if (p.spawn && p.spawn.x != null) { sx = +p.spawn.x; sy = +p.spawn.y; }
        else if (p.startX != null && p.startY != null) { sx = +p.startX; sy = +p.startY; }
      } catch (e5) {}
      p.x = sx; p.y = sy;
      try { if (!window.Game.walkable(p.x, p.y)) { const s = window.Game.nearWalkable(p.x, p.y); if (s && window.Game.walkable(s.x, s.y)) { p.x = s.x; p.y = s.y; } } } catch (e6) {}
      try { if (p.posByDim) p.posByDim.surf = { x: p.x, y: p.y }; p.exitPos = { x: p.x, y: p.y }; } catch (e7) {}
      try {
        p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
        if (window.Game.clearCombat) window.Game.clearCombat();
        G.mobs = []; G.projectiles = []; G.shadowClones = [];
        if (window.Game.ensureChunks) await window.Game.ensureChunks();
        if (window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true);
        try { if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround(); } catch (e8) {}
        try { if (window.Items && window.Items.addItem) window.Items.addItem(p, "heavenly_sphere", 1); } catch (eg) {}
        try { p.heavenUnlocked = true; } catch (eg2) {}
        toast("🌅 The goddess sets you down where it all began — and presses a HEAVENLY SPHERE into your hand. \u201cEvery hearth that knows your name can lift you to the same ground in heaven now.\u201d", 8000);
        try { window.UI.updateHUD(); } catch (e9) {}
        try { window.UI.drawMinimap(); } catch (e10) {}
        window.Game.saveGame(true);
      } catch (e) {}
    } catch (e) {}
  }

  // ---------- migration: purge placeholders, route to the right ACTIVE quest ----------
  function purgePlaceholders(ms) {
    try {
      if (!ms || !Array.isArray(ms.done)) return false;
      const before = ms.done.length;
      ms.done = ms.done.filter(q => {
        if (!q) return false;
        if (q.data && q.data.backfilled) return false;
        if (q.story === "Remembered from before the Main tab kept records.") return false;
        return true;
      });
      return ms.done.length !== before;
    } catch (e) { return false; }
  }
  function routeFromProgress(p) {
    // No fabricated history: start the correct ACTIVE quest for real.
    try {
      const ms = ensure(p); if (!ms || ms.active || ms.done.length) return ms ? ms.active : null;
      const f = flags(p);
      const c = fragCount(p), sph = hasSphere(p);
      const hell = hellEntered(p) || (p && p.hellEntered);
      const delves = (p && p.dungeonsEntered) | 0;
      if (!delves && !c && !sph && !hell) { startHearthSpark(p, true); return ms.active; }
      // listened-by-descent: the hearth is answered, the dark is entered
      if (!f.origin) f.origin = "wanderer";
      if (delves > 0 && !c && !sph && !hell) {
        startGenericFirstDelve(p);
        return ms.active;
      }
      if (c > 0 && !sph && !hell) {
        f.totalFragments = Math.max(f.totalFragments | 0, ecount(p));
        // never skip the goddess: an EARNED shard routes to the vision
        // (shard dreams follow); gifts alone route to Twelve Shards — the
        // vision waits for a delve of your own.
        if (ecount(p) > 0) { startFirstShard(p); return ms.active; }
        startTwelve(p); return ms.active;
      }
      if (sph && !hell) { f.vision1 = true; startTowers(p); return ms.active; }
      if (hell && !f.visionHell) { f.vision1 = true; startHellArrival(p); return ms.active; }
      if (hell && f.visionHell) { startHeart(p); return ms.active; }
      startHearthSpark(p, true); return ms.active;
    } catch (e) { return null; }
  }
  // old name kept as an alias (nothing else calls it, but saves don't care)

  // ---------- hooks ----------
  function onDungeonEntry(baseId, level, dungeonName) {
    try {
      const p = P(); if (!p) return;
      const ms = ensure(p);
      if (purgePlaceholders(ms)) save();
      // Ch 0 completes by descent: listened or not, the dark is entered
      if (ms.active && ms.active.id === "mq_hearth_spark") {
        try {
          if (!ms.active.data.listened) {
            const f = flags(p);
            if (!f.origin) f.origin = "wanderer";
            ms.active.data.listened = "descent";
            ms.active.data.origin = f.origin;
          }
          completeActive(p, "descent");
          sfxLevel();
        } catch (e) {}
      }
      if (ms.active || ms.done.length) {
        // routed already (or just completed the spark) — start Echoes for this mouth
        if (!ms.active && ms.done.length && ms.done[ms.done.length - 1].id === "mq_hearth_spark") {
          let gx = 0, gy = 0;
          try { gx = Math.round(p.exitPos ? p.exitPos.x : p.x); gy = Math.round(p.exitPos ? p.exitPos.y : p.y); } catch (e) {}
          startFirstDelve(p, baseId, dungeonName, gx, gy);
        } else if (ms.active && ms.active.id === "mq_first_delve") {
          // intro-started Echoes (mouth-unknown) now knows its mouth — bind it
          bindDelveMouth(p, baseId, dungeonName);
        }
        return;
      }
      // true first-ever entry (tick hasn't routed yet)
      routeFromProgress(p);
      const ms2 = ensure(p);
      if (ms2.active && ms2.active.id === "mq_hearth_spark") {
        try { completeActive(p, "descent"); } catch (e) {}
        let gx = 0, gy = 0;
        try { gx = Math.round(p.exitPos ? p.exitPos.x : p.x); gy = Math.round(p.exitPos ? p.exitPos.y : p.y); } catch (e) {}
        startFirstDelve(p, baseId, dungeonName, gx, gy);
      } else if (ms2.active && ms2.active.id === "mq_first_delve" && !ms2.active.data.baseId) {
        // generic reconstruction now knows its mouth — bind it
        bindDelveMouth(p, baseId, dungeonName);
      }
    } catch (e) {}
  }
  // Bind a mouth-unknown Echoes Below to the delve just entered (objective
  // names the delve, lord kills count for this mouth from here on).
  function bindDelveMouth(p, baseId, dungeonName) {
    try {
      const ms = ensure(p);
      if (!ms || !ms.active || ms.active.id !== "mq_first_delve" || ms.active.data.baseId) return false;
      ms.active.data.baseId = String(baseId || "");
      ms.active.data.name = dungeonName || ms.active.data.name;
      try { if (window.Game && window.Game.delveEndLevel && baseId) ms.active.data.need = Math.max(3, window.Game.delveEndLevel(baseId) | 0 || FIRST_NEED); } catch (e) {}
      ms.active.objective = "Delve " + (ms.active.data.name || "the dark") + ": slay its lords on every depth (" + (ms.active.data.kills | 0) + "/" + (ms.active.data.need | 0 || FIRST_NEED) + ")";
      save();
      try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  function onBossKillInDungeon(baseId, kind) {
    try {
      const p = P(); if (!p) return;
      const ms = ensure(p); if (!ms || !ms.active) return;
      const q = ms.active;
      if (q.id === "mq_first_delve" && q.data) {
        const qb = String(q.data.baseId || "").replace(/_L\d+$/, "");
        const kb = String(baseId || "").replace(/_L\d+$/, "");
        // reconstructed (mouth-unknown) Echoes counts ANY delve's lords
        if (qb && kb && qb !== kb) return;
        q.data.kills = Math.min(q.data.need | 0 || FIRST_NEED, (q.data.kills | 0) + 1);
        const have = q.data.kills | 0, need = q.data.need | 0 || FIRST_NEED;
        q.objective = "Delve " + (q.data.name || "the dark") + ": slay its lords on every depth (" + have + "/" + need + ")";
        toast("🌟 Echoes Below: " + have + "/" + need + " lords felled in " + (q.data.name || "the delve") + ".", 4500);
        banner("🌟", "Echoes Below " + have + "/" + need, q.objective);
        if (have >= need) {
          completeActive(p, "cleared");
          sfxLevel();
          // the shard itself is paid by the final portal, not the kill
          toast("🌟 Delve cleared! Step through the bottom portal to daylight to claim your 🩸 Hell Fragment…", 6000);
        }
        save();
        try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
      }
    } catch (e) {}
  }
  function onFragment(p) {
    try {
      p = p || P(); if (!p) return;
      const f = flags(p);
      f.totalFragments = (f.totalFragments | 0) + 1;
      const c = ecount(p);
      // whispers stay as toasts here; the full dream VNs trigger from tick
      try {
        if (c === 3) toast("🩸 The three shards hum together — a laugh, far below, that knows your name. (🌟 Main holds a dream for you.)", 6000);
        else if (c === 6) toast("🩸 Six shards. Peter dreams through them now. (🌟 Main holds a dream for you.)", 6000);
        else if (c === 9) toast("🩸 Nine shards. The whispers sharpen into a voice. (🌟 Main holds a dream for you.)", 6000);
      } catch (e) {}
      save();
    } catch (e) {}
  }

  let lastTick = 0, lastFragSeen = -1, lastEarnSeen = -1;
  // ---------- ahead-of-schedule catch-up (multiplayer ally skips) ----------
  // If the hero reaches a milestone that belongs AFTER their current quest
  // (e.g. entering Hell via an ally's woken tower while still on Echoes or
  // Twelve Shards), every earlier chapter is marked done WITHOUT its rewards
  // and the hero resumes on the correct chapter. Only triggers on true skips
  // (desired 2+ ahead) so normal single-step progress keeps its visions,
  // rewards and doneHow.
  function mqIndex(id) {
    try {
      for (let i = 0; i < MQ_CHAIN.length; i++) if (MQ_CHAIN[i][0] === id) return i;
    } catch (e) {}
    return -1;
  }
  function worldAhead(p) {
    try {
      const c = fragCount(p), sph = hasSphere(p), ec = ecount(p);
      let towers = false;
      try { towers = !!(window.Hell && window.Hell.towersUnlocked && window.Hell.towersUnlocked(p)); } catch (e) {}
      // strict hell entry: the hero is/was actually in hell — NOT merely
      // sharing an ally's tower wake (that is `towers`, handled separately).
      let hell = false;
      try {
        hell = !!((p && p.hellEntered) || (p && p.dim === "hell") || inHellDim());
      } catch (e) {}
      const delves = (p && p.dungeonsEntered) | 0;
      let castleNear = false;
      try { castleNear = !!(hell && distToHellHeart() < 72); } catch (e) {}
      let visionHell = false;
      try { visionHell = !!(flags(p).visionHell); } catch (e) {}
      return { c, ec, sph, towers, hell, delves, castleNear, visionHell };
    } catch (e) { return { c: 0, ec: 0, sph: false, towers: false, hell: false, delves: 0, castleNear: false, visionHell: false }; }
  }
  function maybeCatchUpSkipped(p) {
    try {
      p = p || P(); if (!p) return false;
      const ms = ensure(p); if (!ms) return false;
      // late game (audience and beyond) is owned by Peter/confront/final
      // flow + the shared peter-slain backfill — never touch it here.
      const w = worldAhead(p);
      let doneImplied = -1;
      if (w.delves > 0 || w.c > 0 || w.sph || w.towers || w.hell) doneImplied = Math.max(doneImplied, 0);
      if (w.c > 0 || w.sph || w.towers || w.hell) doneImplied = Math.max(doneImplied, 1);
      if (w.sph || w.towers || w.hell) doneImplied = 3;
      if (w.hell) doneImplied = Math.max(doneImplied, 4);
      if (w.visionHell || (w.hell && w.castleNear)) doneImplied = Math.max(doneImplied, 5);
      if (doneImplied < 0 || doneImplied > 5) return false;
      const desired = doneImplied + 1; // index we should be ON (max 6 = heart)
      if (desired < 1 || desired > 6) return false;
      const f = flags(p);
      if (ms.active) {
        const aIdx = mqIndex(ms.active.id);
        if (aIdx < 0 || aIdx > 6) return false;
        // Single step: normal flow owns it (visions, rewards, doneHow) —
        // EXCEPT Twelve Shards with an ally-woken tower but no sphere/hell:
        // the normal Twelve flow needs a sphere and would strand the hero.
        const blockedTwelve = (aIdx === 3 && w.towers && !w.sph && !w.hell);
        if (desired <= aIdx + 1 && !blockedTwelve) return false; // single step: normal flow owns it
        const to = doneImplied;
        // minimal flags so the resumed chain works — and NO reward items.
        // (Spark skip: default Wanderer + refused oath so intro resolves
        // without granting any oath charm.)
        try {
          const have0 = new Set(ms.done.map(q => q && q.id));
          const sparkSkipped = (ms.active && ms.active.id === MQ_CHAIN[0][0]) || (!have0.has(MQ_CHAIN[0][0]) && 0 <= to);
          if (sparkSkipped) {
            if (!f.origin) f.origin = "wanderer";
            if (!f.oathCharm && !f.oathRefused) f.oathRefused = true;
          }
          if (to >= 2 || to >= 3) f.vision1 = true;
          if (to >= 3) f.totalFragments = Math.max(f.totalFragments | 0, w.ec | 0);
          if (to >= 4 && w.hell && !w.towers) { try { p.hellTowersUnlocked = true; } catch (e) {} }
          if (to >= 5) {
            f.visionHell = true;
            if (!f.hellPath) f.hellPath = "bold";
          }
        } catch (e) {}
        // complete the current chapter as skipped, backfill every missing
        // earlier chapter silently (covers gapped histories too).
        const skippedTitles = [];
        try { skippedTitles.push(ms.active.title || ms.active.id); } catch (e) {}
        try { completeActive(p, "skipped-ahead"); } catch (e) {}
        try {
          const have = new Set(ms.done.map(q => q && q.id));
          for (let i = 0; i <= to; i++) {
            const id = MQ_CHAIN[i][0], title = MQ_CHAIN[i][1];
            if (have.has(id)) continue;
            ms.done.push({ id, title, status: "done", doneAt: Date.now(), doneHow: "skipped-ahead" });
            have.add(id);
            skippedTitles.push(title);
          }
          if (ms.done.length > 60) ms.done = ms.done.slice(-60);
        } catch (e) {}
        try {
          if (desired === 1) startGenericFirstDelve(p);
          else if (desired === 2) startFirstShard(p);
          else if (desired === 3) startTwelve(p);
          else if (desired === 4) startTowers(p);
          else if (desired === 5) startHellArrival(p);
          else if (desired === 6) startHeart(p);
        } catch (e) {}
        try {
          const nowOn = (ensure(p).active && ensure(p).active.title) || MQ_CHAIN[desired][1];
          toast("📜 Main story caught up: " + skippedTitles.length + " chapter" + (skippedTitles.length === 1 ? "" : "s") + " marked done (no rewards) — now on " + nowOn + ".", 6500);
        } catch (e) {}
        try { save(); } catch (e) {}
        try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
        return true;
      }
      // no active quest: resume from history, but jump over skipped chapters.
      if (!ms.done.length) return false; // fresh: routeFromProgress owns it
      let maxDone = -1;
      try {
        for (const q of ms.done) {
          const i = mqIndex(q && q.id);
          if (i > maxDone) maxDone = i;
        }
      } catch (e) {}
      if (maxDone > 6) return false; // late game history: normal resume owns it
      if (maxDone < 0) return false;
      if (desired <= maxDone + 1) return false; // single step: normal resume owns it
      const to = doneImplied;
      try {
        const have0 = new Set(ms.done.map(q => q && q.id));
        if (!have0.has(MQ_CHAIN[0][0]) && 0 <= to) {
          if (!f.origin) f.origin = "wanderer";
          if (!f.oathCharm && !f.oathRefused) f.oathRefused = true;
        }
        if (to >= 2 || to >= 3) f.vision1 = true;
        if (to >= 3) f.totalFragments = Math.max(f.totalFragments | 0, w.ec | 0);
        if (to >= 4 && w.hell && !w.towers) { try { p.hellTowersUnlocked = true; } catch (e2) {} }
        if (to >= 5) {
          f.visionHell = true;
          if (!f.hellPath) f.hellPath = "bold";
        }
      } catch (e) {}
      const skippedTitles = [];
      try {
        const have = new Set(ms.done.map(q => q && q.id));
        for (let i = 0; i <= to; i++) {
          const id = MQ_CHAIN[i][0], title = MQ_CHAIN[i][1];
          if (have.has(id)) continue;
          ms.done.push({ id, title, status: "done", doneAt: Date.now(), doneHow: "skipped-ahead" });
          have.add(id);
          skippedTitles.push(title);
        }
        if (ms.done.length > 60) ms.done = ms.done.slice(-60);
      } catch (e) {}
      try {
        if (desired === 1) startGenericFirstDelve(p);
        else if (desired === 2) startFirstShard(p);
        else if (desired === 3) startTwelve(p);
        else if (desired === 4) startTowers(p);
        else if (desired === 5) startHellArrival(p);
        else if (desired === 6) startHeart(p);
      } catch (e) {}
      try {
        const nowOn = (ensure(p).active && ensure(p).active.title) || MQ_CHAIN[desired][1];
        toast("📜 Main story caught up: " + skippedTitles.length + " chapter" + (skippedTitles.length === 1 ? "" : "s") + " marked done (no rewards) — now on " + nowOn + ".", 6500);
      } catch (e) {}
      try { save(); } catch (e) {}
      try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  function tick() {
    try {
      const now = Date.now();
      if (now - lastTick < 1000) return;
      lastTick = now;
      const p = P(); if (!p || p.hp <= 0) return;
      let ms = ensure(p);
      if (purgePlaceholders(ms)) save();
      // new games (and routed saves): the hearth lights the road, not the
      // delve — then fall through so a freshly lit spark tries its intro
      // this same tick instead of waiting a beat.
      if (!ms.active && !ms.done.length) {
        routeFromProgress(p);
        try { ms = ensure(p); } catch (e2) {}
        if (!ms || !ms.active) return;
      }
      const c = fragCount(p), sph = hasSphere(p), ec = ecount(p);
      // if the player Esc'd out of a vision, release the lock
      try { if (vnOpen) { const m = document.getElementById("chatModal"); if (!m || m.hidden) vnOpen = false; } } catch (e) {}
      // fragment edge (EARNED shards only — gifts never speak; see ecount):
      try {
        if (ec !== lastEarnSeen) {
          if (lastEarnSeen >= 0 && ec > lastEarnSeen) onFragment(p);
          lastEarnSeen = ec;
        } else if (lastEarnSeen < 0) lastEarnSeen = ec;
        if (c !== lastFragSeen) lastFragSeen = c; else if (lastFragSeen < 0) lastFragSeen = c;
      } catch (e) {}
      if (vnOpen) return;
      try { if (isModalOpen()) return; } catch (e) {}
      // multiplayer ally skips (hell entry / tower wake / gifted sphere with
      // an early quest still active): fast-forward silently, no rewards.
      try { if (maybeCatchUpSkipped(p)) return; } catch (e) {}
      const q = ms.active;
      if (!q) {
        // nothing active: resume the chain where history left off
        try {
          if (ms.done.length) {
            const ids = ms.done.map(d => d.id);
            const has = (id) => ids.includes(id);
            if (has("mq_hearth_spark") && !has("mq_first_delve") && !has("mq_first_shard") && !has("mq_twelve_shards")) {
              // Spark done but no delve on record: the mouth entry may have
              // been missed (stairs/portal entries), or a veteran's
              // pre-records Echoes completion was purged as a "Remembered"
              // placeholder. The shard is the trigger now, not the mouth —
              // never strand a shard-holder (or a delver) here. Gifts don't
              // trigger the vision: only an EARNED shard earns her voice.
              if (ec >= 1) startFirstShard(p);
              else if (c >= 1) startTwelve(p);
              else if (((p && p.dungeonsEntered) | 0) > 0) startGenericFirstDelve(p);
              // else genuinely pre-descent: wait for a dungeon mouth.
            } else if (has("mq_first_delve") && !has("mq_first_shard") && !has("mq_twelve_shards")) {
              if (ec >= 1) startFirstShard(p);
              else if (c >= 1) startTwelve(p);
            } else if ((has("mq_first_shard") || has("mq_first_delve")) && !has("mq_twelve_shards")) {
              // vision done but twelve not started (e.g. reloaded mid-chain)
              if (!ms.active) startTwelve(p);
            } else if (!sph && c < 12 && !has("mq_twelve_shards")) { /* already handled */ }
            else if (sph && !hellEntered(p) && !has("mq_towers")) startTowers(p);
            else if (hellEntered(p) && !has("mq_hell_arrival") && !flags(p).visionHell) startHellArrival(p);
          }
        } catch (e) {}
        return;
      }
      const f = flags(p);
      if (q.id === "mq_hearth_spark") {
        // oath decided (charm taken or refused, VN closed early) stops the
        // auto-nag exactly like listening does — the manual Listen button
        // and descent both still complete the quest.
        if (!q.data.listened && !f.oathCharm && !f.oathRefused && !_introAutoFiredEntry) {
          // world-entry intro: the Hearthkeeper speaks on sight, no errand.
          // The 🌟 Main → 🔥 Listen button stays as a fallback.
          if (tryAutoIntro(p)) return;
        }
        q.objective = q.data.listened
          ? "Delve below: enter any dungeon mouth (🕳️) and clear it to the bottom — its lords keep your first 🩸 shard"
          : "Listen to the Hearthkeeper (🌟 Main → 🔥 Listen)";
        save();
        return;
      }
      if (q.id === "mq_first_shard") {
        if (!f.vision1 && ec >= 1) showFirstVision(p);
        else if (f.vision1) { try { completeActive(p, "vision"); startTwelve(p); } catch (e) {} }
        return;
      }
      if (q.id === "mq_first_delve") {
        // the shard is the trigger now, not the kill count: reaching the
        // bottom and stepping through pays the fragment with zero kills.
        // Earned shards only — gifts never complete your own descent.
        if (ec >= 1) { try { completeActive(p, "shard"); startFirstShard(p); } catch (e) {} }
        return;
      }
      if (q.id === "mq_twelve_shards") {
        // shard-dream interludes surface as VNs at 3/6/9 EARNED (once each)
        try {
          if (ec >= 3 && !f.shardDream3) { showShardDream(p, 3); return; }
          if (ec >= 6 && !f.shardDream6) { showShardDream(p, 6); return; }
          if (ec >= 9 && !f.shardDream9) { showShardDream(p, 9); return; }
        } catch (e) {}
        q.objective = sph
          ? "🔮 Hell Sphere forged! See 🌟 Main — the towers wake."
          : "Gather Hell Fragments (" + c + "/12 distinct delves), then join them in 🎒 Inventory into a 🔮 Hell Sphere";
        if (c >= 12 && !sph) {
          toast("🔮 Twelve shards! Open 🎒 Inventory → join them into the HELL SPHERE.", 6000);
        }
        if (sph) {
          try { completeActive(p, "sphere"); } catch (e) {}
          startTowers(p);
          sfxLevel();
        }
        save();
        return;
      }
      if (q.id === "mq_towers") {
        if (inHellDim() || (p.hellEntered && p.dim === "hell")) {
          try { completeActive(p, "entered-hell"); } catch (e) {}
          startHellArrival(p);
          setTimeout(() => { try { showHellArrival(P()); } catch (e) {} }, 1500);
        }
        return;
      }
      if (q.id === "mq_hell_arrival") {
        if (!f.visionHell) { showHellArrival(p); }
        else { try { completeActive(p, "hell-vision"); startHeart(p); } catch (e) {} }
        return;
      }
      if (q.id === "mq_heart_castle") {
        const d = distToHellHeart();
        const hell = inHellDim();
        const road = f.hellPath === "stealth" ? " (soft road: blind canyons)" : f.hellPath === "bold" ? " (loud road: war-drum roads)" : "";
        q.objective = hell
          ? "Reach the Dark Castle at Hell 0,0 (" + Math.round(d) + " away)" + road + ", enter its dungeon to level 5"
          : "Enter Hell first (🗼 tower heart), then walk to 0,0";
        if (hell && d < 72) {
          try { completeActive(p, "at-castle"); } catch (e) {}
          startAudience(p);
          sfxLevel();
        }
        save();
        return;
      }
      if (q.id === "mq_audience") {
        // completes via Peter's choice; nudge if standing before him dormant
        return;
      }
      if (q.id === "mq_confront") {
        q.objective = "On the SURFACE (not in a dungeon): open 🌟 Main → 🌅 Commune to confront her (" + confrontProgress(p) + ")";
        save();
        return;
      }
      if (q.id === "mq_final_fight") {
        return; // completes on kill
      }
      if (q.id === "mq_epilogue") {
        try {
          const done2 = (flags(p).storyDone);
          if (!done2) showEpilogue(p, !!(flags(p).confrontDone));
        } catch (e) {}
        return;
      }
    } catch (e) {}
  }

  // Full main-story chain (Ch 0-10) for backfill when Peter falls under
  // someone else's blade: every connected player closes the whole campaign.
  const MQ_CHAIN = [
    ["mq_hearth_spark", "Spark of the Hearth"],
    ["mq_first_delve", "Echoes Below"],
    ["mq_first_shard", "The Goddess Wakes"],
    ["mq_twelve_shards", "Twelve Shards, One Sphere"],
    ["mq_towers", "The Far Towers"],
    ["mq_hell_arrival", "Ashes on the Wind"],
    ["mq_heart_castle", "The Dark Castle"],
    ["mq_audience", "Audience with the Fallen"],
    ["mq_confront", "The Goddess on Trial"],
    ["mq_final_fight", "Fall of the Overlord"],
    ["mq_epilogue", "Dawn's Return"],
  ];
  // Complete the active main quest (if any) and backfill every earlier
  // chapter as done. includeEpilogue=false for witnesses who get the live
  // epilogue next (startEpilogue owns that chapter); true for everyone else.
  function completeChainForPeterSlain(p, includeEpilogue) {
    try {
      const ms = ensure(p); if (!ms) return;
      if (ms.active && /^mq_/.test(ms.active.id || "")) completeActive(p, "peter-slain");
      const have = new Set(ms.done.map(q => q && q.id));
      if (ms.active && ms.active.id) have.add(ms.active.id);
      for (const [id, title] of MQ_CHAIN) {
        if (id === "mq_epilogue" && !includeEpilogue) continue;
        if (have.has(id)) continue;
        ms.done.push({ id, title, status: "done", doneAt: Date.now(), doneHow: "peter-slain" });
        have.add(id);
      }
      if (ms.done.length > 60) ms.done = ms.done.slice(-60);
      try { if (window.UI && window.UI.renderQuests) window.UI.renderQuests(); } catch (e2) {}
    } catch (e) {}
  }

  function onPeterKilled() {
    try {
      const p = P(); if (!p) return;
      const ms = ensure(p);
      const f = flags(p);
      if (f.peterSlain) return; // he stays dead: no second epilogue, no return
      // the killer closes the whole campaign, not just the live chapter
      completeChainForPeterSlain(p, false);
      const hadConfront = !!f.confrontDone;
      f.peterSlain = true;
      try { p.peterSlain = true; } catch (e0) {}
      f.banGodDelve = false;
      startEpilogue(p);
      save();
      setTimeout(() => { try { showEpilogue(P(), hadConfront); } catch (e) {} }, 900);
    } catch (e) {}
  }

  // Multiplayer Peter-fall: one shared god-delve, one death, every connected
  // hero closes the campaign. wasPresent = this hero stood in Peter's dungeon
  // when he fell: full witness treatment (epilogue + sphere + carried home).
  // Everyone else: silent completion (quests close, Peter never returns, no
  // teleport, no sphere — heaven stays sphere-gated until one is gifted).
  function applySharedPeterSlain(wasPresent) {
    try {
      const p = P(); if (!p) return false;
      const ms = ensure(p);
      const f = flags(p);
      if (f.peterSlain) return false; // already closed: never twice
      const G = window.Game && window.Game.G;
      if (!G || G.mode !== "playing") return false;
      // He fell on a fellow traveler's screen: never spawns for anyone
      // again. A live Fallen still standing in our instance is the same
      // shared god-delve, so it goes with him (no corpse, no second kill).
      try { if (window.Game && window.Game.despawnPeterEverywhere) window.Game.despawnPeterEverywhere(); } catch (eD) {}
      if (wasPresent) {
        completeChainForPeterSlain(p, false);
        const hadConfront = !!f.confrontDone;
        f.peterSlain = true;
        try { p.peterSlain = true; } catch (e0) {}
        f.banGodDelve = false;
        startEpilogue(p);
        save();
        try { toast("👑 Peter the Fallen has fallen — the goddess comes to carry the witnesses home.", 7000); } catch (e2) {}
        setTimeout(() => { try { showEpilogue(P(), hadConfront); } catch (e) {} }, 900);
      } else {
        completeChainForPeterSlain(p, true);
        f.peterSlain = true;
        try { p.peterSlain = true; } catch (e0) {}
        f.banGodDelve = false;
        f.storyDone = true;
        save();
        try { toast("👑 Peter the Fallen has fallen — your Main story closes with his. (see 🌟 Main)", 7000); } catch (e2) {}
      }
      return true;
    } catch (e) { return false; }
  }

  function isGodDelveBanned(p) {
    try { p = p || P(); const f = flags(p); if (!f.banGodDelve) return false; if (f.confrontDone) return false; const ms = ensure(p); return !!(ms.active && ms.active.id === "mq_confront"); } catch (e) { return false; }
  }

  // ---------- UI text ----------
  function shardDreamLine(p) {
    try {
      const f = flags(p);
      const bits = [];
      if (f.shardDream3) bits.push("3rd: " + ((f.shardDefy | 0) > 0 && (f.shardResolve | 0) === 0 && (f.shardDoubt | 0) === 0 ? "kept" : (f.shardResolve | 0) > 0 ? "stelled" : (f.shardDoubt | 0) > 0 ? "questioned" : "dreamt"));
      const n = (f.shardDream3 ? 1 : 0) + (f.shardDream6 ? 1 : 0) + (f.shardDream9 ? 1 : 0);
      return n + "/3 dreams heard (resolve " + (f.shardResolve | 0) + " · doubt " + (f.shardDoubt | 0) + " · defy " + (f.shardDefy | 0) + ")";
    } catch (e) { return ""; }
  }
  function objectiveText(q) {
    try { if (q && q.objective) return q.objective; } catch (e) {}
    return "Aid the realm.";
  }
  function targetPos(q) {
    try {
      if (!q) return null;
      if (q.id === "mq_hearth_spark") { const h = homeHearthPos(P()); return h ? { x: h.x, y: h.y, dungeon: false } : null; }
      if (q.id === "mq_first_delve" && q.data && q.data.gx != null) return { x: q.data.gx, y: q.data.gy, dungeon: false };
      if (q.id === "mq_towers") {
        const p = P();
        let best = null, bd = 1e18;
        try {
          const arr = (window.Hell && window.Hell.SURFACE_TOWERS) || [];
          const aim = flags(p).towerAim;
          if (aim) {
            const want = arr.filter(t => {
              const dx = t.x, dy = t.y;
              if (aim === "E") return dx > 500 && Math.abs(dy) < 400;
              if (aim === "W") return dx < -500 && Math.abs(dy) < 500;
              if (aim === "N") return dy < -500;
              if (aim === "S") return dy > 500;
              return true;
            });
            const pool = want.length ? want : arr;
            for (const t of pool) { const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < bd) { bd = d; best = t; } }
          } else {
            for (const t of arr) { const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < bd) { bd = d; best = t; } }
          }
          if (best) return { x: best.x, y: best.y, dungeon: false };
        } catch (e) {}
        return null;
      }
      if (q.id === "mq_heart_castle" || q.id === "mq_audience" || q.id === "mq_final_fight") return { x: 0, y: 0, dungeon: false, hell: true };
      return null;
    } catch (e) { return null; }
  }
  function statusLine(p) {
    try {
      const ms = ensure(p); if (!ms) return "";
      if (ms.active) return "🌟 " + ms.active.title;
      if (ms.done.length) return "🌟 " + ms.done.length + " chapters closed";
      return "";
    } catch (e) { return ""; }
  }

  // goddess sprite: GODDESS OF DAWN v2 — reference-faithful anime detail at
  // Peter density (~100 rects): blonde bob + blue ribbon, gold eyes with red
  // liner, white halter bodice, gold waistband, draped slit skirt with side
  // bow + frill hem, long sleeves with gold armlets, stocking + gold garter,
  // dawn halo + aura. (Outermost wrapper — call prev for others.)
  try {
    const prev = window.Sprites && window.Sprites.actor;
    if (prev && !prev._mainStoryWrapped) {
      const wrap = function (kind, tint, seed, gear, app, gen, ph) {
        if (kind === "goddess") {
          try {
            const c = document.createElement("canvas"); c.width = 32; c.height = 40;
            const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
            g.clearRect(0, 0, 32, 40);
            const px = (gg, x, y, w, h, col) => { gg.fillStyle = col; gg.fillRect(x, y, w, h); };
            let P2 = { f: 0, moving: false, hurt: false, atk: false, atkKind: "melee", idle: 0, t: 0 };
            let A = { lx: 0, rx: 0, ld: 0, rd: 0, lax: 0, rax: 0, la: 0, ra: 0, hx: 0 }, hb = 0;
            try { if (window.Anim) { P2 = window.Anim.normP(ph); A = window.Anim.limb(P2); hb = window.Anim.hbob(P2); } } catch (e) {}
            const sw = P2.atk ? -3 : 0;
            // palette
            const hair = "#f0c94e", hairD = "#c9962e", hairL = "#ffe9a0", hairH = "#fff6d8";
            const rib = "#2a4ad0", ribD = "#1a2a8a", ribL = "#7a9bff";
            const skin = "#f6d3b3", skinD = "#e0a878";
            const dress = "#f7f3ea", dressD = "#d8cfc0", dressDD = "#b8ab98", frill = "#fffdf6", fold = "#c9bda8";
            const gold = "#d8a018", goldL = "#f6d34e", goldD = "#8a6410";
            const sleeve = "#f2ede2", sleeveD = "#cfc4b2";
            const stock = "#f4f0e8", stockD = "#cfc6b8";
            // dawn aura + ground shadow
            g.fillStyle = "rgba(255,214,120,0.22)"; g.beginPath(); g.ellipse(16, 20 + hb, 13, 15, 0, 0, 7); g.fill();
            g.fillStyle = "rgba(255,240,200,0.16)"; g.beginPath(); g.ellipse(16, 22 + hb, 8, 11, 0, 0, 7); g.fill();
            g.fillStyle = "rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16, 38, 8, 2, 0, 0, 7); g.fill();
            // dawn halo ring floating above (dark outline so it parts from the hair)
            px(g, 9, 0, 6, 1, goldD); px(g, 18, 0, 5, 1, goldD);
            px(g, 10, 0, 4, 1, goldL); px(g, 19, 0, 3, 1, goldL);
            px(g, 8, 1, 1, 2, goldD); px(g, 23, 1, 1, 2, goldD);
            px(g, 8, 1, 1, 1, goldL); px(g, 23, 1, 1, 1, goldL);
            px(g, 5, 5, 1, 1, goldL); px(g, 27, 4, 1, 1, "#fff"); px(g, 3, 12, 1, 1, goldL);
            // back hair mass (behind everything)
            px(g, 9, 3, 14, 3, hair);
            px(g, 8, 4, 3, 9, hair); px(g, 21, 4, 3, 9, hair);
            px(g, 8, 4, 1, 9, hairD); px(g, 23, 4, 1, 9, hairD);
            px(g, 8, 12, 3, 1, hairD); px(g, 21, 12, 3, 1, hairD);
            px(g, 12, 3, 5, 1, hairH); px(g, 9, 3, 3, 1, hairL);
            // blue ribbon (her left, viewer right): loops + knot + long tails
            px(g, 22, 1, 3, 3, rib); px(g, 22, 1, 3, 1, ribL);
            px(g, 25, 2, 3, 3, rib); px(g, 25, 2, 3, 1, ribL);
            px(g, 22, 4, 3, 1, ribD); px(g, 25, 5, 3, 1, ribD);
            px(g, 23, 3, 3, 2, ribD); px(g, 24, 3, 1, 2, ribL);
            px(g, 24, 5, 1, 4, rib); px(g, 24, 5, 1, 1, ribL);
            px(g, 26, 6, 2, 3, rib); px(g, 26, 6, 1, 1, ribL);
            // arms behind bodice: bare shoulders -> gold armlets -> long sleeves -> hands
            px(g, 8 + A.lax, 16 + A.la, 4, 3, skin); px(g, 20 + A.rax, 16 + A.ra, 4, 3, skin);
            px(g, 8 + A.lax, 18 + A.la, 4, 1, skinD); px(g, 20 + A.rax, 18 + A.ra, 4, 1, skinD);
            px(g, 7 + A.lax, 19 + A.la, 4, 2, gold); px(g, 7 + A.lax, 19 + A.la, 4, 1, goldL);
            px(g, 21 + A.rax, 19 + A.ra + sw, 4, 2, gold); px(g, 21 + A.rax, 19 + A.ra + sw, 4, 1, goldL);
            px(g, 5 + A.lax, 21 + A.la, 3, 9, sleeve); px(g, 5 + A.lax, 21 + A.la, 1, 9, sleeveD);
            px(g, 24 + A.rax, 21 + A.ra + sw, 3, 9, sleeve); px(g, 26 + A.rax, 21 + A.ra + sw, 1, 9, sleeveD);
            px(g, 6 + A.lax, 23 + A.la, 1, 6, frill);
            px(g, 5 + A.lax, 29 + A.la, 3, 1, dressD); px(g, 24 + A.rax, 29 + A.ra + sw, 3, 1, dressD);
            px(g, 5 + A.lax, 30 + A.la, 3, 3, skin); px(g, 24 + A.rax, 30 + A.ra + sw, 3, 3, skin);
            px(g, 5 + A.lax, 32 + A.la, 1, 1, skinD);
            // dawnblade carried in her right hand: bright blade, gold guard
            px(g, 27 + A.rax, 16 + A.ra + sw, 2, 14, "#dfe8f2");
            px(g, 27 + A.rax, 16 + A.ra + sw, 1, 14, "#ffffff");
            px(g, 26 + A.rax, 29 + A.ra + sw, 4, 2, gold);
            px(g, 26 + A.rax, 29 + A.ra + sw, 4, 1, goldL);
            px(g, 27 + A.rax, 31 + A.ra + sw, 2, 2, "#4a3a20");
            // skirt back layer (widest, behind legs)
            px(g, 8, 26, 16, 9, dress); px(g, 8, 26, 1, 9, dressD); px(g, 23, 26, 1, 9, dressD);
            px(g, 7, 30, 2, 6, dress); px(g, 24, 29, 2, 6, dress);
            // bare leg hint (viewer right, behind slit)
            px(g, 19, 30, 3, 6, skin); px(g, 21, 30, 1, 6, skinD);
            px(g, 19, 36, 3, 2, skin);
            // stocking leg (viewer left): thigh -> gold garter -> stocking -> sandal
            px(g, 13, 27, 4, 4, skin); px(g, 16, 27, 1, 4, skinD);
            px(g, 13, 30, 5, 2, gold); px(g, 13, 30, 5, 1, goldL); px(g, 13, 31, 5, 1, goldD);
            px(g, 14, 28, 1, 2, "#fff"); // thigh highlight
            px(g, 13, 32, 4, 5, stock); px(g, 16, 32, 1, 5, stockD);
            px(g, 13, 32, 4, 1, "#fff"); px(g, 13, 34, 1, 3, "#fff");
            px(g, 13, 37, 4, 1, "#8a5a33");
            px(g, 13, 38, 3, 1, skin);
            // skirt front drape over the legs
            px(g, 9, 26, 5, 8, dress); px(g, 17, 26, 6, 9, dress);
            px(g, 12, 26, 1, 8, fold); px(g, 16, 22, 1, 1, fold);
            px(g, 19, 26, 1, 9, fold); px(g, 21, 27, 1, 7, dressD);
            px(g, 9, 26, 5, 1, frill); px(g, 17, 26, 6, 1, frill);
            px(g, 10, 30, 3, 1, dressD); px(g, 18, 31, 4, 1, dressD);
            // frill hem scallops
            px(g, 7, 35, 3, 2, frill); px(g, 10, 36, 3, 2, frill); px(g, 14, 36, 3, 2, frill);
            px(g, 18, 36, 3, 2, frill); px(g, 21, 35, 3, 2, frill); px(g, 23, 34, 2, 2, frill);
            px(g, 7, 36, 3, 1, dressD); px(g, 14, 37, 3, 1, dressD); px(g, 21, 36, 3, 1, dressD);
            // side bow (viewer left waist): loops + knot + tails
            px(g, 5, 24, 3, 4, dress); px(g, 5, 24, 3, 1, frill); px(g, 5, 27, 3, 1, dressD);
            px(g, 8, 25, 3, 3, dress); px(g, 8, 25, 3, 1, frill);
            px(g, 7, 26, 3, 2, goldD); px(g, 8, 26, 2, 2, gold); px(g, 8, 26, 2, 1, goldL);
            px(g, 6, 28, 2, 4, dress); px(g, 6, 28, 1, 4, dressD);
            px(g, 9, 28, 2, 3, dress); px(g, 10, 28, 1, 3, dressD);
            // bodice: white halter bust + gold waistband
            px(g, 10, 17, 12, 7, dress);
            px(g, 10, 17, 1, 7, dressD); px(g, 21, 17, 1, 7, dressD);
            px(g, 12, 16, 2, 3, dress); px(g, 18, 16, 2, 3, dress); // halter straps
            px(g, 12, 16, 1, 3, dressD); px(g, 19, 16, 1, 3, dressD);
            px(g, 15, 18, 2, 4, fold); px(g, 15, 18, 1, 4, "#ded3c0"); // neckline valley
            px(g, 11, 21, 4, 1, "#e4dac8"); px(g, 17, 21, 4, 1, "#e4dac8"); // bust shade
            px(g, 10, 23, 12, 1, fold); // underbust shadow
            px(g, 10, 24, 12, 2, gold); px(g, 10, 24, 12, 1, goldL); px(g, 10, 25, 12, 1, goldD);
            px(g, 15, 24, 2, 2, goldL); px(g, 15, 24, 2, 1, "#fff"); // band jewel glint
            // neck + face
            px(g, 14, 15, 4, 2, skin); px(g, 14, 15, 4, 1, skinD);
            px(g, 11, 8, 10, 7, skin);
            px(g, 11, 8, 1, 6, skinD); px(g, 20, 8, 1, 6, skinD);
            px(g, 13, 15, 6, 1, skin); // chin
            px(g, 12, 13, 2, 1, "#f0a090"); px(g, 18, 13, 2, 1, "#f0a090"); // blush
            // gold anime eyes: dark lash, bright iris, dark pupil, catchlight
            px(g, 12, 10, 3, 1, "#3a2018"); px(g, 18, 10, 3, 1, "#3a2018");
            px(g, 12, 11, 3, 2, goldL); px(g, 18, 11, 3, 2, goldL);
            px(g, 12, 11, 3, 1, gold); px(g, 18, 11, 3, 1, gold);
            px(g, 13, 11, 1, 1, "#5a3208"); px(g, 19, 11, 1, 1, "#5a3208");
            px(g, 12, 12, 1, 1, "#fff"); px(g, 18, 12, 1, 1, "#fff");
            px(g, 12, 9, 3, 1, hairD); px(g, 18, 9, 3, 1, hairD); // brows
            px(g, 15, 14, 3, 1, "#c06060"); // smile
            // front hair: fringe + framing strands over back hair + face edges
            px(g, 10, 5, 12, 2, hair); px(g, 11, 6, 3, 2, hair); px(g, 15, 6, 2, 2, hair); px(g, 18, 6, 3, 2, hair);
            px(g, 10, 5, 12, 1, hairL); px(g, 13, 5, 4, 1, hairH);
            px(g, 10, 7, 2, 6, hair); px(g, 20, 7, 2, 6, hair);
            px(g, 10, 7, 1, 6, hairD); px(g, 21, 7, 1, 6, hairD);
            px(g, 10, 12, 2, 1, hairD); px(g, 20, 12, 2, 1, hairD);
            // sparkles in the aura
            px(g, 3, 20, 1, 1, goldL); px(g, 28, 22, 1, 1, "#fff"); px(g, 26, 33, 1, 1, goldL); px(g, 6, 33, 1, 1, "#fff");
            let out = c;
            try { out = window.Sprites.genderFX(c, gen); } catch (e) {}
            return out;
          } catch (e) { }
        }
        return prev.call(this, kind, tint, seed, gear, app, gen, ph);
      };
      wrap._mainStoryWrapped = true;
      window.Sprites.actor = wrap;
    }
  } catch (e) {}

  return {
    ensure, activeQuest, doneList, flags, statusLine, originOf, hellPathOf,
    introResolved,
    onDungeonEntry, onBossKillInDungeon, onFragment, shardDreamLine,
    tick, objectiveText, targetPos, confrontProgress,
    noteWorldEntry, maybePlayIntro, tryAutoIntro,
    isGodDelveBanned, peterAudience, peterFinalIntro, beginPeterFight,
    openConfront, openHearth, openHermit, onPeterKilled, applySharedPeterSlain, showFirstVision, showHellArrival,
    showKickedEncouragement, showEpilogue, goddessSendHome, maybeCatchUpSkipped,
  };
})();
