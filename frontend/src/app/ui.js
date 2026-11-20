/* UI: HUD, chat, party, map, title, joystick. window.UI */
window.UI = (() => {
  const $ = (id) => document.getElementById(id);
  let chatNpc = null, chatBusy = false, dreaming = 0;

  // ---------- notifications: fast single-line ticker + expandable log ----------
  const NOTIF_MAX = 200;
  const notifLog = []; // newest first: {t, msg}
  let notifQueue = [];
  let tickerBusy = false;
  let tickerTimer = null;
  let unread = 0;

  function fmtNotifTime(t) {
    try {
      const d = new Date(t);
      const p = (n) => String(n).padStart(2, "0");
      return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    } catch (e) { return ""; }
  }
  function renderNotifList() {
    const list = $("notifList"); if (!list) return;
    if (!notifLog.length) { list.innerHTML = '<div class="nempty">No notifications yet.</div>'; return; }
    list.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const e of notifLog) {
      const row = document.createElement("div");
      row.className = "notif-item";
      const tm = document.createElement("span");
      tm.className = "nt"; tm.textContent = fmtNotifTime(e.t);
      const tx = document.createElement("span");
      tx.textContent = e.msg;
      row.appendChild(tm); row.appendChild(tx);
      frag.appendChild(row);
    }
    list.appendChild(frag);
  }
  function markNotifRead() {
    unread = 0;
    const b = $("notifBadge"); if (b) { b.textContent = ""; b.hidden = true; }
  }
  function toggleNotifLog(force) {
    const p = $("notifLog"); if (!p) return;
    const wantOpen = typeof force === "boolean" ? force : p.hidden;
    p.hidden = !wantOpen;
    if (wantOpen) { renderNotifList(); markNotifRead(); }
  }
  // Free-space ticker: the pill sizes to its content up to the actual free
  // gap between the left cluster and the right profile, centered in that gap,
  // so it can be as wide as it wants without ever covering other top UI.
  function layoutTicker() {
    try {
      const wrap = $("tickerWrap");
      if (!wrap) return;
      const tickHidden = !!wrap.hidden;
      const leftCol = $("leftCol");
      const prof = $("profileHud");
      const mini = $("miniProfile");
      const vw = window.innerWidth || 1000;
      let freeL = 8, freeR = vw - 8;
      try {
        if (leftCol) {
          const r = leftCol.getBoundingClientRect();
          if (r && isFinite(r.right)) freeL = Math.max(freeL, Math.ceil(r.right) + 8);
        }
      } catch (e) { }
      try {
        let rightEl = null;
        if (mini && !mini.hidden) {
          let disp = "block";
          try { disp = getComputedStyle(mini).display; } catch (e2) { }
          if (disp !== "none") rightEl = mini;
        }
        if (!rightEl && prof) {
          let disp2 = "block";
          try { disp2 = getComputedStyle(prof).display; } catch (e3) { }
          const styleHide = (prof.style && prof.style.display === "none");
          if (disp2 !== "none" && !styleHide) rightEl = prof;
        }
        if (rightEl) {
          const r2 = rightEl.getBoundingClientRect();
          if (r2 && isFinite(r2.left)) freeR = Math.min(freeR, Math.floor(r2.left) - 8);
        }
      } catch (e) { }
      const freeW = Math.max(0, freeR - freeL);
      const crowded = freeW < 160;
      // Shared anchor: the clock centers on the same free-gap center as the
      // ticker (viewport-center vs gap-center differed by half the side-panel
      // asymmetry — the reported offset). Gaps too small to hold it keep the
      // clock on viewport center so it never clips under the side panels.
      try {
        const clockA = $("clockbox");
        if (clockA) {
          if (crowded) { clockA.style.left = ""; }
          else { clockA.style.left = Math.round((freeL + freeR) / 2) + "px"; }
        }
      } catch (e) { }
      if (tickHidden) {
        // Ticker slot is always reserved above the clock (pure CSS tops),
        // so showing/hiding the pill never moves anything else.
        return;
      }
      if (crowded) {
        // tiny top-row gap (portrait phones): dock the pill in the free band
        // right of the minimap and below the top row / clock / mini chip, so
        // it stays ~240px wide without covering any top UI (canvas only).
        try {
          const mmW = document.getElementById("minimapWrap") || document.getElementById("minimap");
          const lt = document.getElementById("leftTop");
          const clock = document.getElementById("clockbox");
          const miniEl = document.getElementById("miniProfile");
          let bandL = 8, bandTop = 44;
          if (mmW) {
            const mr = mmW.getBoundingClientRect();
            if (mr && isFinite(mr.right)) bandL = Math.ceil(mr.right) + 8;
          }
          const tops = [];
          if (lt) { const lr = lt.getBoundingClientRect(); if (lr && isFinite(lr.bottom)) tops.push(lr.bottom); }
          if (clock) { const cr = clock.getBoundingClientRect(); if (cr && isFinite(cr.bottom)) tops.push(cr.bottom); }
          if (miniEl && !miniEl.hidden) { const nr = miniEl.getBoundingClientRect(); if (nr && isFinite(nr.bottom)) tops.push(nr.bottom); }
          if (tops.length) bandTop = Math.ceil(Math.max.apply(null, tops)) + 6;
          if (bandTop < 40) bandTop = 40;
          const bandR = vw - 8;
          const bandW = Math.max(0, bandR - bandL);
          if (bandW >= 140) {
            const center = Math.round((bandL + bandR) / 2);
            wrap.style.transform = "translateX(-50%)";
            wrap.style.left = center + "px";
            wrap.style.right = "auto";
            wrap.style.width = "max-content";
            wrap.style.maxWidth = Math.max(140, bandW) + "px";
            wrap.style.top = bandTop + "px";
          } else {
            // no usable band (shouldn't happen): fall back to full-width just
            // below the top row; it only ever covers game canvas, never UI.
            wrap.style.transform = "translateX(-50%)";
            wrap.style.left = "50%";
            wrap.style.right = "auto";
            wrap.style.width = "max-content";
            wrap.style.maxWidth = Math.max(120, vw - 16) + "px";
            wrap.style.top = bandTop + "px";
          }
        } catch (e) {
          wrap.style.transform = "translateX(-50%)";
          wrap.style.left = "50%";
          wrap.style.right = "auto";
          wrap.style.width = "max-content";
          wrap.style.maxWidth = Math.max(120, vw - 16) + "px";
          wrap.style.top = "48px";
        }
      } else {
        const center = Math.round((freeL + freeR) / 2);
        wrap.style.transform = "translateX(-50%)";
        wrap.style.left = center + "px";
        wrap.style.right = "auto";
        wrap.style.width = "max-content";
        wrap.style.maxWidth = Math.max(120, freeW) + "px";
        try {
          wrap.style.top = document.body.classList.contains("touch")
            ? "calc(4px + env(safe-area-inset-top, 0px))"
            : "6px";
        } catch (e) { wrap.style.top = "6px"; }
      }
      // NOTE: the clock is parked below the ticker slot in pure CSS and is
      // never nudged here — toasts must not move mid-fight focus targets.
    } catch (e) { }
  }
  try {
    if (typeof window !== "undefined" && !window._tickerLayoutWired) {
      window._tickerLayoutWired = true;
      window.addEventListener("resize", () => { try { layoutTicker(); } catch (e) { } });
      window.addEventListener("orientationchange", () => { try { setTimeout(layoutTicker, 60); } catch (e) { } });
    }
  } catch (e) { }
  let tickerGen = 0; // stale animation/timer callbacks no-op unless their generation is current
  function pumpTicker() {
    if (tickerBusy) return;
    const next = notifQueue.shift();
    if (!next) return;
    const wrap = $("tickerWrap"), el = $("tickerMsg");
    if (!wrap || !el) { tickerBusy = false; return; }
    const myGen = ++tickerGen;
    const mine = () => myGen === tickerGen;
    tickerBusy = true;
    try { if (tickerTimer) { clearTimeout(tickerTimer); tickerTimer = null; } } catch (e) { }
    try { el.getAnimations().forEach((a) => { try { a.cancel(); } catch (e2) { } }); } catch (e) { }
    wrap.hidden = false;
    el.textContent = next.msg;
    try { layoutTicker(); } catch (e) { }
    // fade in, hold, fade out — in place, never scrolling, never stacked
    const HOLD = 2100;
    const finish = () => {
      if (!mine()) return;
      tickerBusy = false;
      if (notifQueue.length) pumpTicker();
      else {
        try { wrap.hidden = true; } catch (e) { }
        try { el.style.opacity = ""; } catch (e2) { }
        try { layoutTicker(); } catch (e3) { }
      }
    };
    try {
      el.style.opacity = "0";
      const fadeIn = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: "ease-out", fill: "forwards" });
      fadeIn.onfinish = () => {
        if (!mine()) return;
        try { el.style.opacity = "1"; } catch (e) { }
        tickerTimer = setTimeout(() => {
          if (!mine()) return;
          try {
            const fadeOut = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: "ease-in", fill: "forwards" });
            fadeOut.onfinish = () => { try { el.style.opacity = ""; } catch (e) { } finish(); };
            fadeOut.oncancel = () => { if (mine()) tickerBusy = false; };
          } catch (e) { finish(); }
        }, HOLD);
      };
      fadeIn.oncancel = () => { if (mine()) tickerBusy = false; };
    } catch (e) {
      // no Web Animations support: brief static flash of the single line
      tickerTimer = setTimeout(() => {
        if (!mine()) return;
        tickerBusy = false;
        if (notifQueue.length) pumpTicker();
        else { try { wrap.hidden = true; } catch (e2) { } }
      }, 1800);
    }
  }
  function toast(msg, ms = 3000) {
    msg = String(msg);
    notifLog.unshift({ t: Date.now(), msg });
    if (notifLog.length > NOTIF_MAX) notifLog.pop();
    try {
      const p = $("notifLog");
      if (p && !p.hidden) renderNotifList();
      else {
        unread++;
        const b = $("notifBadge");
        if (b) { b.textContent = unread > 99 ? "99+" : String(unread); b.hidden = false; }
        const btn = $("notifBtn");
        if (btn) {
          btn.classList.remove("attn");
          void btn.offsetWidth;
          btn.classList.add("attn");
          setTimeout(() => { try { btn.classList.remove("attn"); } catch (e) { } }, 900);
        }
      }
    } catch (e) { }
    void ms;
    notifQueue.push({ msg });
    // log keeps everything; the ticker only shows the latest few so it never stacks up
    if (notifQueue.length > 5) notifQueue.splice(0, notifQueue.length - 5);
    pumpTicker();
  }
  // ---------- loot popup: item cards under the minimap ----------
  // showLoot(title, rows): rows are {icon, label} (plain text, set via
  // textContent). Cards stack newest-on-top under the minimap, linger a few
  // seconds each, then fade. Hovering a card pauses its dismissal.
  const LOOT_MAX_CARDS = 4, LOOT_HOLD_MS = 5500;
  function showLoot(title, rows) {
    try {
      const pop = $("lootPop"); if (!pop) return;
      rows = (rows || []).filter(r => r && (r.label || r.icon || r.kind));
      if (!rows.length) return;
      const card = document.createElement("div");
      card.className = "loot-card";
      const h = document.createElement("div");
      h.className = "loot-title"; h.textContent = String(title || "Loot");
      card.appendChild(h);
      for (const r of rows.slice(0, 8)) {
        const row = document.createElement("div");
        row.className = "loot-row";
        const ic = document.createElement("span"); ic.className = "li"; try { if (r.kind && window.Icons) ic.innerHTML = window.Icons.img(r.kind, r.id, 22); else ic.textContent = ""; } catch (e) { ic.textContent = ""; }
        const tx = document.createElement("span"); tx.className = "lt"; tx.textContent = r.label || "";
        row.appendChild(ic); row.appendChild(tx);
        card.appendChild(row);
      }
      if (rows.length > 8) {
        const more = document.createElement("div");
        more.className = "loot-row";
        const tx = document.createElement("span"); tx.className = "lt"; tx.textContent = `+${rows.length - 8} more…`;
        more.appendChild(tx); card.appendChild(more);
      }
      pop.prepend(card);
      while (pop.children.length > LOOT_MAX_CARDS) pop.lastChild.remove();
      let timer = null, gone = false;
      const dismiss = () => {
        if (gone) return; gone = true;
        try { card.classList.add("out"); } catch (e) { }
        setTimeout(() => { try { card.remove(); } catch (e2) { } }, 450);
      };
      const arm = (ms) => { try { if (timer) clearTimeout(timer); } catch (e) { } timer = setTimeout(dismiss, ms); };
      arm(LOOT_HOLD_MS);
      card.addEventListener("pointerenter", () => { try { if (timer) clearTimeout(timer); timer = null; } catch (e) { } });
      card.addEventListener("pointerleave", () => { if (!gone && !timer) arm(2000); });
    } catch (e) { }
  }
 function setDreaming(on) {
   dreaming += on ? 1 : -1;
   if (dreaming < 0) dreaming = 0;
   const el = $("dreamingEl");
   if (el) el.hidden = dreaming <= 0;
 }

  // ---------- loading screen ----------
  let loadTipTimer = null;
  // biome ids print lowercase with spaces ("dark_forest" -> "dark forest")
  function prettyBiome(b) {
    try {
      const LABEL = { frostcrown: "frostcrown glacier", blightmire: "blightmire bog", stormcrag: "stormcrag cliff", crystal_scar: "crystal scar", umbral_waste: "umbral waste" };
      if (b != null && LABEL[b]) return LABEL[b];
      return String(b == null ? "wilds" : b).replace(/_/g, " ");
    } catch (e) { return "wilds"; }
  }  const LOAD_TIPS = [
    "Tip: press E to talk, trade, and recruit villagers.",
    "Tip: chop 🪓 trees for wood — wood fuels bombs and draughts.",
    "Tip: purple 🕳️ tiles hide dungeons — and bosses.",
    "Tip: bind potions and spells to hotkeys 1–8 in 🎒.",
    "Tip: raise an NPC's 💛 loyalty to 10× their level to recruit them (up to 4).",
    "Tip: spellbooks 📕 teach new spells — check chests.",
    "Tip: every region is saved by coordinates, forever.",
  ];
  function showLoading(title) {
    if ($("loadTitle") && title) $("loadTitle").textContent = title;
    setLoading(5, "Waking the hearth...");
    if ($("titleScreen")) $("titleScreen").hidden = true;
    if ($("loadingScreen")) $("loadingScreen").hidden = false;
    // rotate tips while we wait
    try {
      let i = Math.floor(Math.random() * LOAD_TIPS.length);
      const tipEl = $("loadTip");
      if (tipEl) tipEl.textContent = LOAD_TIPS[i % LOAD_TIPS.length];
      clearInterval(loadTipTimer);
      loadTipTimer = setInterval(() => {
        if ($("loadingScreen") && $("loadingScreen").hidden) { clearInterval(loadTipTimer); return; }
        i++;
        if (tipEl) tipEl.textContent = LOAD_TIPS[i % LOAD_TIPS.length];
      }, 2600);
    } catch (e) { }
  }
  function setLoading(pct, step) {
    try {
      if (typeof pct === "number" && $("loadFill")) $("loadFill").style.width = Math.max(3, Math.min(100, pct)) + "%";
      if (step && $("loadStep")) $("loadStep").textContent = step;
    } catch (e) { }
  }
  function hideLoading() {
    try {
      clearInterval(loadTipTimer);
      if ($("loadingScreen")) $("loadingScreen").hidden = true;
    } catch (e) { }
  }

  function updateHUD() {
    const p = window.Game && window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    // steady (non-blinking) attention on points row + achievements button when points wait
    try {
      let hasPts = (p.statPoints | 0) > 0;
      try { hasPts = hasPts || (window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : 0) > 0; } catch (e) { hasPts = hasPts || ((p.skillPoints | 0) > 0); }
      const prow = $("phPtsRow");
      if (prow) prow.classList.toggle("attn", hasPts);
      const pb = $("phAchBtn");
      if (pb) pb.classList.toggle("attn", hasPts);
      const ph = $("profileHud");
      if (ph) ph.style.display = (window.Game.G.mode === "playing") ? "block" : "none";
    } catch (e) { }
    // practice worlds get a 🛠️ setup button in the top-left HUD row (by 📜/🔔)
    try { const phb = $("practiceHudBtn"); if (phb) phb.hidden = !isPractice(); } catch (e) { }
    try { updateProfileHud(); } catch (e) { }
    try { refreshHotbarCooldowns(); } catch (e) { }
    try { if ($("profileModal") && !$("profileModal").hidden) renderProfile(); } catch (e) { }
    if ($("coordsEl")) {
      $("coordsEl").textContent = p.inDungeon
        ? `🕳️ ${(window.Game.G.dungeon && window.Game.G.dungeon.name) || "crypt"} · level ${((p.dungeonLevel | 0) || 1)} · ${p.x.toFixed(0)},${p.y.toFixed(0)}`
        // v18: the two dims share numbers — always show which world this is.
        : `${(p.dim === "hell") ? "🔥" : "📍"} ${p.x.toFixed(0)}, ${p.y.toFixed(0)}${(p.dim === "hell") ? " · HELL" : ""}`;
    }
    if ($("placeEl")) {
      let place = "Wilderness";
      if (p.inDungeon && window.Game.G.dungeon) place = `${window.Game.G.dungeon.name} · Lv ${((p.dungeonLevel | 0) || 1)}`;
      else {
        const ch = window.Game.G.chunks.get(Math.floor(p.x / 16) + "," + Math.floor(p.y / 16));
        if (ch) place = ch.placeName || prettyBiome(ch.biome);
      }
      $("placeEl").textContent = place;
    }
    // party icons: one box per line — name on top, level underneath in a
    // serif font, so the pairing is unambiguous and nothing overflows.
    const pi = $("phParty");
    if (pi) {
      pi.innerHTML = "";
      for (const id of (p.party || [])) {
        const n = window.World._mem.npcs.get(id);
        const s = document.createElement("div");
        s.className = "picon" + (n && n.hp <= 0 ? " dead" : "");
        const nm = document.createElement("div");
        nm.className = "pname";
        nm.textContent = n ? String(n.name || "?").split(" ")[0] : "?";
        const lv = document.createElement("div");
        lv.className = "plvl";
        lv.textContent = n ? `Level ${n.lv || 1} · ${n.role || "friend"}` : String(id);
        s.appendChild(nm);
        s.appendChild(lv);
        s.title = n ? `${n.name} (${n.role} lv${n.lv}) HP ${Math.ceil(n.hp)}/${n.maxHp} — click to manage` : id;
        s.style.pointerEvents = "auto";
        s.onclick = (e) => { try { e.stopPropagation(); } catch (_) { } toggleParty(true, id); };
        pi.appendChild(s);
      }
      pi.style.display = (p.party && p.party.length) ? "flex" : "none";
      // ridden mount badge (tap = dismount; long text truncated like names)
      try {
        const old = document.getElementById("phMount");
        if (old) old.remove();
        const am = window.Game.activeMount ? window.Game.activeMount() : null;
        if (am) {
          const d = document.createElement("div");
          d.id = "phMount";
          d.className = "picon";
          d.style.borderColor = "#ffd93d";
          const nm = document.createElement("div");
          nm.className = "pname";
          nm.textContent = `🐴 ${am.name}`;
          const lv = document.createElement("div");
          lv.className = "plvl";
          lv.textContent = `riding · lv ${am.lv} — tap to dismount`;
          d.appendChild(nm); d.appendChild(lv);
          d.title = `${am.name} (lv ${am.lv}) — tap to dismount`;
          d.style.pointerEvents = "auto";
          d.onclick = () => { try { window.Game.toggleMount(am.id); } catch (e) {} };
          pi.appendChild(d);
          pi.style.display = "flex";
        }
      } catch (e) {}
    }
    drawMinimap();
    try {
      const qb = $("questBtn");
      if (qb && window.Quests) {
        const p2 = window.Game.G.player;
        const qs = window.Quests.ensure(p2);
        const n = qs.filter(q => q.status === "active" || q.status === "turnin").length;
        let gn = 0, gReady = false;
        try {
          if (window.Guild && window.Guild.active) {
            const ga = window.Guild.active(p2) || [];
            gn = ga.length;
            gReady = ga.some(q => { try { return window.Guild.isReady(p2, q); } catch (e2) { return false; } });
          }
        } catch (e) { }
        let hn = 0, hReady = false;
        try {
          if (window.Heaven && window.Heaven.listQuests) {
            const ha = window.Heaven.listQuests(p2) || [];
            hn = ha.filter(q => q.status === "active" || q.status === "turnin").length;
            hReady = ha.some(q => q.status === "turnin");
          } else if (p2 && p2.heavQ) {
            for (const k of ["dragon", "water", "return"]) {
              const st = p2.heavQ[k];
              if (st && (st.status === "active" || st.status === "turnin")) {
                hn++;
                if (st.status === "turnin") hReady = true;
              }
            }
          }
        } catch (e) { }
        const total = n + gn + hn;
        qb.textContent = total ? `📜 ${total}` : "📜";
        qb.title = total ? `${total} active ${total === 1 ? "quest" : "quests"} (J)` : "Quests (J)";
        qb.classList.toggle("attn", qs.some(q => q.status === "turnin") || gReady || hReady);
      }
    } catch (e) { }
    // MP boxes follow play state (singleplayer keeps them hidden)
    try {
      if (mpActive() && window.Game.G.mode === "playing") { renderMpChat(); renderMpPresence(); }
      else {
        if ($("mpChatBox")) $("mpChatBox").hidden = true;
        if ($("mpPresence")) $("mpPresence").hidden = true;
      }
    } catch (e) { }
  }
  // ---------- Brawl-Stars-style player profile (right dock + card) ----------
  function fmtPlayTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${sec}s`;
  }
  function playerTag(p) {
    try {
      window.Entities.ensureProgression(p);
      return p.tag || "#------";
    } catch (e) { return "#------"; }
  }
  function drawAvatarInto(canvas, p, size) {
    try {
      if (!canvas) return;
      // portraits are deterministic per hero + gear + look: skip the redraw when nothing changed
      const key = ((p && p.tag) || "") + "|" + ((p && p.name) || "") + "|" + ((p && p.role) || "") + "|" + ((p && p.tint) || "") + "|" + ((window.Appearance && p.appearance) ? window.Appearance.key(p.appearance) : "") + "|" + ((p && p.equipment && p.equipment.weapon) || "") + "|" + ((p && p.equipment && p.equipment.armor) || "") + "|" + ((p && p.equipment && p.equipment.shield) || "") + "|" + (() => { try { const hb = p && p.hotbar; let oi = p && p.offhandSlot | 0; const sl = hb && hb[oi]; return (sl && sl.kind === "item" && sl.id) || ""; } catch (e) { return ""; } })() + "|" + (size || 112);
      if (canvas._pk === key) return;
      canvas._pk = key;
      // HUD panel + profile card already label the class in text, so keep the art clean
      const hudClean = canvas && (canvas.id === "phAvatarCv" || canvas.id === "brawlAvatarCv");
      const img = window.Sprites.drawPortrait({ kind: "player", id: (p && p.tag) || (p && p.name) || "x", name: (p && p.name) || "Wanderer", role: (p && p.role) || "adventurer", tint: (p && p.tint) || "#4da3ff", equipment: (p && p.equipment) || null, hotbar: (p && p.hotbar) || null, offhandSlot: (p && p.offhandSlot), appearance: (p && p.appearance) || null }, size || 112, !!hudClean);
      canvas.width = size || 112; canvas.height = size || 112;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    } catch (e) { }
  }
  // ---------- active buffs & debuffs (HUD panel, profile card, party tabs) ----------
  // Buffs live on ent.buffs as *Until timestamps (game.js sets them from spells,
  // techniques and furniture); debuffs live on ent.status (src/status.js) plus
  // the legacy slowUntil snare. One painter serves every surface.
  const FX_BUFF_DEFS = [
    ["defUpUntil", "Shieldwall", "+DEF"],
    ["warcryUntil", "Warcry", "+30% melee"],
    ["emberUntil", "Ember Weapon", "strikes ignite"],
    ["blessedUntil", "Blessed Weapon", "+25% · holy strikes"],
    ["atkUpUntil", "Empowered", "+attack"],
    ["unseenUntil", "Unseen", "opening strike"],
    ["honeUntil", "Honed", "+10% melee"],
    ["rouseUntil", "Roused", "+5% damage"],
  ];
  function fxSecs(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return s < 90 ? `${s}s` : `${Math.round(s / 60)}m`;
  }
  function effectsFor(ent) {
    const out = [];
    if (!ent) return out;
    const now = performance.now();
    try {
      const b = ent.buffs || {};
      for (const [key, name, sub] of FX_BUFF_DEFS) {
        if (typeof b[key] === "number" && b[key] > now) {
          out.push({ kind: "buff", fx: key, name, sub, secs: fxSecs(b[key] - now) });
        }
      }
    } catch (e) { }
    // Racial states (shared painter so HUD, profile card and party panes agree).
    try {
      if (window.Races) {
        if (window.Races.werewolfFuryActive && window.Races.werewolfFuryActive(ent)) {
          out.push({ kind: "buff", fx: "race:fury", name: "🐺 Blood Fury", sub: "+30% ATK, move speed, stamina regen (HP < 50%)", secs: "" });
        }
        if (window.Races.grenouilleHasteMult && window.Races.grenouilleHasteMult(ent) > 1) {
          out.push({ kind: "buff", fx: "race:bogspeed", name: "🐸 Bog Hunter", sub: "+30% move speed (spell hit a slowed foe)", secs: fxSecs((ent._grenouilleSpdUntil || 0) - now) });
        }
        if (window.Races.quansalbarUnarmed && window.Races.quansalbarUnarmed(ent)) {
          out.push({ kind: "buff", fx: "race:shellblitz", name: "🦐 Shellblitz", sub: "unarmed 2x speed, ignores the normal floor", secs: "" });
        }
        try {
          if (window.Races && window.Races.raceOf) {
            const notSinger = window.Races.raceOf(ent) !== "usaghito";
            let luk = 0, cha = 0;
            try { luk = window.Races.auraLukOver ? window.Races.auraLukOver(ent) | 0 : 0; } catch (e) { luk = 0; }
            try { cha = window.Races.auraChaBonus ? window.Races.auraChaBonus(ent) | 0 : 0; } catch (e) { cha = 0; }
            if (notSinger && (luk > 0 || cha > 0)) {
              const bits = [];
              if (luk > 0) bits.push(`Luck +${luk}`);
              if (cha > 0) bits.push(`+${cha} ATK/DEF/SDEF/MATK`);
              out.push({ kind: "buff", fx: "race:chorus", name: "🐰 Lucky Chorus", sub: "sharing a nearby Usaghito's " + bits.join(" and "), secs: "" });
            }
          }
        } catch (eA) { }
        // Momentary racial procs (human cleanse, kinnatma mend): green buff
        // chips with a short countdown so the trigger reads in the card.
        try {
          if (window.Races.flashChips) {
            for (const c of (window.Races.flashChips(ent) || [])) {
              out.push({ kind: "buff", fx: c.fx, name: c.name, sub: c.sub,
                secs: (c.until ? fxSecs(c.until - now) : "") });
            }
          }
        } catch (eF) { }
      }
    } catch (e) { }
    try {
      if (typeof ent.slowUntil === "number" && ent.slowUntil > now) {
        out.push({ kind: "debuff", fx: "slowed", name: "Slowed", sub: "moves much slower", secs: fxSecs(ent.slowUntil - now) });
      }
    } catch (e) { }
    try {
      if (window.Status && ent.status) {
        for (const t of window.Status.list(ent)) {
          const s = ent.status[t] || {};
          if (s.until && s.until <= now) continue; // sweep hasn't run yet
          let meta = null;
          try { meta = (window.CFG && window.CFG.STATUS && window.CFG.STATUS[t]) || null; } catch (e2) { }
          let secs = "";
          try { if (s.until) secs = fxSecs(s.until - now); } catch (e3) { }
          out.push({ kind: "debuff", fx: "status:" + t, name: (meta && meta.name) || t, sub: (meta && meta.desc) || "", secs });
        }
      }
    } catch (e) { }
    return out;
  }
  function paintFx(el, ent) {
    if (!el) return;
    try {
      const fx = effectsFor(ent);
      el.hidden = fx.length === 0;
      if (!fx.length) { el.innerHTML = ""; try { el._fxmap = {}; } catch (e) { } return; }
      // Stable nodes: the 1s ticker repaints constantly, and a full
      // innerHTML rebuild destroys the hovered chip before the native
      // title tooltip can appear (hence "sometimes doesn't show").
      // Reuse one span per effect so hover survives the countdown.
      let map = null;
      try { map = el._fxmap || (el._fxmap = {}); } catch (e) { map = {}; }
      const seen = {};
      for (const f of fx) {
        const k = `${f.kind}|${f.fx}|${f.name}`;
        seen[k] = true;
        const im = (() => { try { return window.Icons.img("fx", f.fx, 18, "ico"); } catch (e) { return ""; } })();
        const txt = `${f.name}${f.secs ? ` ${f.secs}` : ""}`;
        const tip = `${f.name}${f.sub ? ` — ${f.sub}` : ""}${f.secs ? ` (${f.secs} left)` : ""}`;
        let c = map[k];
        if (!c || !c.isConnected) {
          c = document.createElement("span");
          map[k] = c;
        }
        c.className = "fx-chip " + (f.kind === "buff" ? "fx-buff" : "fx-debuff");
        const html = `${im}${im ? " " : ""}${txt.replace(/&/g, "&amp;").replace(/</g, "&lt;")}`;
        if (c._fxh !== html) { c.innerHTML = html; c._fxh = html; }
        if (c.title !== tip) c.title = tip;
        el.appendChild(c); // re-appends in order; existing nodes move, not rebuilt
      }
      for (const k of Object.keys(map)) {
        if (!seen[k]) { try { map[k].remove(); } catch (e) { } delete map[k]; }
      }
    } catch (e) { }
  }
  // reference-style HUD panel (top-right): portrait, name, class, level/xp, points, HP, mana, gold
  function updateProfileHud() {
    const p = window.Game && window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    const ph = $("profileHud");
    if (!ph) return;
    try {
      const sp = p.statPoints | 0;
      let unsp = 0;
      try { unsp = window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : (p.skillPoints | 0); } catch (e) { unsp = p.skillPoints | 0; }
      if ($("phPts")) $("phPts").textContent = String(sp + unsp);
      const row = $("phPtsRow");
      if (row) row.classList.toggle("has", (sp + unsp) > 0);
    } catch (e2) { }
    try { drawAvatarInto($("phAvatarCv"), p, 160); } catch (e) { }
    if ($("phName")) $("phName").textContent = p.name || "Wanderer";
    if ($("phRole")) $("phRole").textContent = p.role || "adventurer";
    try { if ($("phMiniName")) $("phMiniName").textContent = `${p.name || "Wanderer"} · lv ${p.lv || 1}`; } catch (e0) { }
    try {
      const need = window.CFG.xpNext(p.lv || 1);
      if ($("phLv")) $("phLv").textContent = String(p.lv || 1);
      if ($("phXpTxt")) $("phXpTxt").textContent = `${p.xp || 0}/${need}`;
      if ($("phXpFill")) $("phXpFill").style.width = Math.max(0, Math.min(100, (p.xp || 0) / need * 100)) + "%";
    } catch (e3) { }
    try {
      if ($("phHpFill")) $("phHpFill").style.width = Math.max(0, (p.hp || 0) / (p.maxHp || 1) * 100) + "%";
      if ($("phHpTxt")) $("phHpTxt").textContent = `${Math.ceil(p.hp || 0)}/${p.maxHp || 1}`;
      if ($("phMpFill")) $("phMpFill").style.width = Math.max(0, (p.mp || 0) / Math.max(1, p.maxMp || 0) * 100) + "%";
      if ($("phMpTxt")) $("phMpTxt").textContent = `${Math.ceil(p.mp || 0)}/${p.maxMp || 0}`;
      try {
        if (window.Entities && window.Entities.ensureProgression) {
          if (typeof p.maxStamina !== "number" || typeof p.stamina !== "number") window.Entities.recalcDerived(p, true);
        }
      } catch (eS) { }
      if ($("phStamFill")) $("phStamFill").style.width = Math.max(0, (p.stamina || 0) / Math.max(1, p.maxStamina || 100) * 100) + "%";
      if ($("phStamTxt")) $("phStamTxt").textContent = `${Math.ceil(p.stamina || 0)}/${p.maxStamina || 100}`;
      if ($("phGold")) $("phGold").textContent = String(p.gold | 0);
    } catch (e4) { }
    try { paintFx($("phFx"), p); } catch (e5) { }
    try { updateMiniProfile(); } catch (e6) { }
  }
  // ---------- touch mini profile (top-right chip): portrait + HP/MP/stam,
  // level + points badges, Party/Inventory pills. Desktop keeps #profileHud.
  function updateMiniProfile() {
    const mp = $("miniProfile");
    if (!mp) return;
    const p = window.Game && window.Game.G.player;
    const playing = !!(window.Game && window.Game.G && window.Game.G.mode === "playing" && p);
    const touch = !!(document.body && document.body.classList.contains("touch"));
    mp.hidden = !(playing && touch);
    if (!playing || !touch || !p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    try { drawAvatarInto($("mpAvatarCv"), p, 96); } catch (e) { }
    try {
      if ($("mpHpFill")) $("mpHpFill").style.width = Math.max(0, (p.hp || 0) / (p.maxHp || 1) * 100) + "%";
      if ($("mpMpFill")) $("mpMpFill").style.width = Math.max(0, (p.mp || 0) / Math.max(1, p.maxMp || 0) * 100) + "%";
      if ($("mpStamFill")) $("mpStamFill").style.width = Math.max(0, (p.stamina || 0) / Math.max(1, p.maxStamina || 100) * 100) + "%";
    } catch (e) { }
    try { if ($("mpLv")) $("mpLv").textContent = String(p.lv || 1); } catch (e) { }
    try { if ($("mpGold")) $("mpGold").textContent = String(p.gold | 0); } catch (e) { }
    try {
      let n = (p.statPoints | 0);
      try { n += window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : (p.skillPoints | 0); } catch (e2) { n += (p.skillPoints | 0); }
      const badge = $("mpPts");
      if (badge) {
        if (n > 0) { badge.hidden = false; badge.textContent = `${n}`; badge.title = `${n} points to spend — Character (C)`; }
        else badge.hidden = true;
      }
    } catch (e) { }
    try { layoutTicker(); } catch (e) { }
  }
  // Aim a slot cast at a screen point, then fire it (drag-to-cast + aimed pad).
  function castSlotAtScreen(i, cx, cy) {
    const G = window.Game && window.Game.G;
    const p = G && G.player;
    if (!p) return;
    const s = p.hotbar && p.hotbar[i];
    if (!s) return;
    if (s.kind === "item" && s.id === "torch") {
      try { window.Game.placeTorchAtScreen(cx, cy); } catch (e) { }
      return;
    }
    try { if (window.Shops && window.Shops.isPlacing && window.Shops.isPlacing()) { window.Shops.placeAtScreen(cx, cy); return; } } catch (e) { }
    try {
      const cv = window.GameCanvas;
      if (cv) {
        const r = cv.getBoundingClientRect();
        const ang = Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2));
        p.faceAng = ang;
        G.mouse.x = cx; G.mouse.y = cy; G.mouse.aiming = true;
        clearTimeout(G.mouse._t);
        G.mouse._t = setTimeout(() => { try { G.mouse.aiming = false; } catch (e2) { } }, 800);
      }
    } catch (e) { }
    try { window.Game.triggerHotbar(i); } catch (e) { }
    try { window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e2) { }
  }
  function slotIconFor(s) {
    try {
      if (window.Icons) {
        if (s.kind === "ability" && window.CFG && window.CFG.ABILITIES[s.id]) return window.Icons.url("ability", s.id) || "";
        if (s.kind === "item" && window.Items && window.Items.ITEMS[s.id]) return window.Icons.url("item", s.id) || "";
      }
      if (s.kind === "ability" && window.CFG && window.CFG.ABILITIES[s.id]) return window.Icons ? window.Icons.url("ability", s.id) : "";
      if (s.kind === "item" && window.Items && window.Items.ITEMS[s.id]) return window.Icons ? window.Icons.url("item", s.id) : "";
    } catch (e) { }
    return "";
  }
  function slotIconImg(s, cls) {
    try {
      if (window.Icons) {
        if (s.kind === "ability") return window.Icons.img("ability", s.id, 24, cls || "hbico");
        if (s.kind === "item") return window.Icons.img("item", s.id, 24, cls || "hbico");
      }
    } catch (e) { }
    return "";
  }
  function toggleProfile(force) {
    const m = $("profileModal");
    if (!m) return;
    const show = force !== undefined ? force : m.hidden;
    m.hidden = !show;
    if (show) renderProfile();
  }
  // ---------- collapsible hero panel (expanded by default, remembered) ----------
  const PH_COLLAPSED_KEY = "emberhold-profile-collapsed-v1";
  function isProfileCollapsed() {
    try { return localStorage.getItem(PH_COLLAPSED_KEY) === "1"; } catch (e) { return false; }
  }
  function applyProfileCollapsed() {
    try {
      const collapsed = isProfileCollapsed();
      const ph = $("profileHud");
      if (ph) ph.classList.toggle("collapsed", collapsed);
      const b = $("phCollapseBtn");
      if (b) { b.textContent = collapsed ? "▸" : "▾"; b.title = collapsed ? "Expand hero panel" : "Collapse hero panel"; }
    } catch (e) { }
  }
  function setProfileCollapsed(collapsed) {
    try { localStorage.setItem(PH_COLLAPSED_KEY, collapsed ? "1" : "0"); } catch (e) { }
    applyProfileCollapsed();
  }
  function toggleProfileCollapsed() { setProfileCollapsed(!isProfileCollapsed()); }
  // ---------- resizable minimap (drag the corner, remembered) ----------
  const MM_SIZE_KEY = "emberhold-minimap-size-v2";
  const MM_SIZE_KEY_LEGACY = "emberhold-minimap-size-v1";
  const MM_MIN = 84, MM_MAX = 320, MM_DEFAULT = 192, MM_DEFAULT_MOBILE = 132, MM_LEGACY_DEFAULT = 132;
  function clampMmSize(n) {
    n = Math.round(Number(n) || MM_DEFAULT);
    return Math.max(MM_MIN, Math.min(MM_MAX, n));
  }
  function mmDefaultForViewport() {
    try {
      if (typeof window !== "undefined") {
        // landscape phones first: a short viewport always wants the small map,
        // even when the width also matches the narrow-portrait breakpoint.
        if (window.innerHeight && window.innerHeight <= 500) return 110;
        if (window.innerWidth && window.innerWidth <= 700) return MM_DEFAULT_MOBILE;
        if (window.innerHeight && window.innerHeight <= 650 && window.innerWidth && window.innerWidth <= 1000) return MM_DEFAULT_MOBILE;
      }
    } catch (e) { }
    return MM_DEFAULT;
  }
  // Cap the applied size to what the current viewport can actually hold, so a
  // stored 192-320px desktop size never covers a landscape phone screen.
  function maxMmForViewport() {
    try {
      if (typeof window !== "undefined" && window.innerWidth && window.innerHeight) {
        const byW = Math.floor(window.innerWidth * 0.30);
        const byH = Math.floor((window.innerHeight - 100) * 0.55);
        const cap = Math.min(byW, byH, MM_MAX);
        if (Number.isFinite(cap) && cap >= MM_MIN) return Math.min(MM_MAX, cap);
      }
    } catch (e) { }
    return MM_MAX;
  }
  function getStoredMmSize() {
    try {
      const v = Number(localStorage.getItem(MM_SIZE_KEY));
      if (Number.isFinite(v) && v >= MM_MIN && v <= MM_MAX) return Math.min(Math.round(v), maxMmForViewport());
    } catch (e) { }
    // one-time carry-over: keep a custom v1 resize, but don't pin users who
    // never touched it (old 132 default) to the old size — they get the new default.
    try {
      const old = Number(localStorage.getItem(MM_SIZE_KEY_LEGACY));
      if (Number.isFinite(old) && old >= MM_MIN && old <= MM_MAX && Math.round(old) !== MM_LEGACY_DEFAULT) {
        const kept = Math.round(old);
        try { localStorage.setItem(MM_SIZE_KEY, String(kept)); } catch (e2) { }
        return Math.min(kept, maxMmForViewport());
      }
    } catch (e) { }
    return mmDefaultForViewport();
  }
  function applyMinimapSize(px) {
    try {
      const size = Math.min(clampMmSize(px), maxMmForViewport());
      const cv = $("minimap");
      if (cv) {
        cv.width = size; cv.height = size;
        cv.style.width = size + "px"; cv.style.height = size + "px";
      }
      return size;
    } catch (e) { return MM_DEFAULT; }
  }
  function wireMinimapResize() {
    try {
      const handle = $("minimapResize"), cv = $("minimap");
      if (!handle || !cv || handle._wired) return;
      handle._wired = true;
      let drag = null;
      // keep closures simple: track last delta on window listeners
      let lastDx = 0, lastDy = 0;
      const onMove2 = (ev) => {
        if (!drag) return;
        lastDx = ev.clientX - drag.sx; lastDy = ev.clientY - drag.sy;
        applyMinimapSize(drag.start + Math.max(lastDx, lastDy));
        try { ev.preventDefault(); } catch (e) { }
      };
      const onUp2 = () => {
        if (!drag) return;
        const size = drag.start + Math.max(lastDx, lastDy);
        drag = null;
        try { window.removeEventListener("pointermove", onMove2); } catch (e) { }
        try { window.removeEventListener("pointerup", onUp2); } catch (e2) { }
        try { window.removeEventListener("pointercancel", onUp2); } catch (e3) { }
        try { localStorage.setItem(MM_SIZE_KEY, String(applyMinimapSize(size))); } catch (e4) { }
        try { drawMinimap(); } catch (e5) { }
      };
      handle.addEventListener("pointerdown", (ev) => {
        try { ev.stopPropagation(); } catch (e) { }
        try { ev.preventDefault(); } catch (e2) { }
        const cur = (cv && cv.width) || getStoredMmSize();
        drag = { sx: ev.clientX, sy: ev.clientY, start: cur };
        lastDx = 0; lastDy = 0;
        try { window.addEventListener("pointermove", onMove2); } catch (e3) { }
        try { window.addEventListener("pointerup", onUp2); } catch (e4) { }
        try { window.addEventListener("pointercancel", onUp2); } catch (e5) { }
      });
    } catch (e) { }
  }
  function renderProfile() {
    const p = window.Game && window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    try { drawAvatarInto($("brawlAvatarCv"), p, 168); } catch (e) { }
    if ($("brawlName")) $("brawlName").textContent = p.name || "Wanderer";
    if ($("brawlTag")) $("brawlTag").textContent = playerTag(p);
    if ($("brawlLevel")) $("brawlLevel").textContent = String(p.lv || 1);
    try {
      const need = window.CFG.xpNext(p.lv || 1);
      const pct = Math.max(0, Math.min(100, (p.xp || 0) / need * 100));
      if ($("brawlXpFill")) $("brawlXpFill").style.width = pct + "%";
      if ($("brawlXpText")) $("brawlXpText").textContent = `${p.xp || 0}/${need}`;
    } catch (e) { }
    // party / club box
    try {
      const n = (p.party || []).length, max = (window.CFG && window.CFG.PARTY_MAX) || 4;
      const solo = n === 0;
      if ($("brawlPartyIcon")) $("brawlPartyIcon").textContent = "";
      if ($("brawlPartyName")) $("brawlPartyName").textContent = solo ? "Solo" : `Party ${n}/${max}`;
      if ($("brawlPartyRole")) $("brawlPartyRole").textContent = solo ? "ADVENTURER" : "LEADER";
    } catch (e) { }
    // spend bar
    try {
      const sp = p.statPoints | 0;
      let unsp2 = 0;
      try { unsp2 = window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : (p.skillPoints | 0); } catch (e) { unsp2 = p.skillPoints | 0; }
      const bar = $("brawlSpendBar");
      if (bar) {
        if (sp + unsp2 > 0) {
          bar.hidden = false;
          if ($("brawlSpendText")) $("brawlSpendText").textContent = `Level ${p.lv}! ${sp} stat · ${unsp2} skill to spend!`;
        } else bar.hidden = true;
      }
    } catch (e) { }
    // active buffs & debuffs
    try { paintFx($("brawlFx"), p); } catch (e) { }
    // guild adventurer rank strip
    try {
      const bar = $("brawlGuild"), txt = $("brawlGuildText");
      if (bar && txt) {
        if (window.Guild && window.Guild.rankProgress) {
          let prog = null;
          try { prog = window.Guild.rankProgress(p); } catch (e2) { prog = null; }
          if (prog && prog.rec) {
            const nx = prog.next;
            let nxName = "highest rank";
            try { nxName = nx ? window.Guild.rankRec(nx.rank).name : "highest rank"; } catch (e3) { }
            txt.textContent = `Adventurer rank: ${prog.rec.name} · ${prog.done | 0} contracts done` +
              (nx ? ` · ${nx.need - (prog.done | 0)} quest${nx.need - (prog.done | 0) === 1 ? "" : "s"} till ${nxName} (${nx.need} total)` : ` · ${nxName}`) +
              ` · payouts x${prog.rec.mult || 1}`;
            bar.title = prog.rec.blurb || "Adventurer rank rises by turning in guild contracts.";
            bar.hidden = false;
          } else bar.hidden = true;
        } else bar.hidden = true;
      }
    } catch (e) { }
    // 3x3 real-game stats grid
    try {
      const grid = $("brawlGrid");
      if (grid) {
        grid.innerHTML = "";
        const tiles = [
          { icon: "", label: "Level", val: String(p.lv || 1) },
          { icon: "", label: "Kills", val: String(p.kills | 0) },
          { icon: "", label: "Bosses", val: String(p.bossKills | 0) },
          { icon: "", label: "Chests", val: String(p.chestsOpened | 0) },
          { icon: "", label: "Delves", val: String(p.dungeonsEntered | 0) },
          { icon: "", label: "Places", val: String((p.seenPlaces || []).length) },
          { icon: "", label: "Spells", val: String((p.abilities || []).length) },
          { icon: "", label: "Gold", val: String(p.gold | 0) },
          { icon: "", label: "Play time", val: fmtPlayTime(p.playTime) },
        ];
        for (const t of tiles) {
          const d = document.createElement("div");
          d.className = "brawl-tile";
          d.innerHTML = `<span class="ticon"></span><span class="tmeta"><div class="tlabel"></div><div class="tval"></div></span>`;
          d.querySelector(".ticon").textContent = "";
          d.querySelector(".tlabel").textContent = t.label;
          d.querySelector(".tval").textContent = t.val;
          grid.appendChild(d);
        }
      }
    } catch (e) { }
    try {
      if ($("brawlFoot")) {
        const kd = `${p.deaths | 0} falls · ${p.atk | 0} ATK · ${p.matk | 0} MATK · ${p.def | 0} DEF · ${p.sdef | 0} SDEF · ${Math.ceil(p.hp)}/${p.maxHp} HP · ${Math.ceil(p.mp)}/${p.maxMp} MP · ${Math.ceil(p.stamina || 0)}/${p.maxStamina || 100} stamina`;
        $("brawlFoot").textContent = kd;
      }
    } catch (e) { }
  }
  let levelBannerTimer = null;
  function showLevelUp(lv, sp, sk, newAbs) {
    try {
      const banner = $("levelUpBanner");
      if (!banner) return;
      const names = (newAbs || []).map(a => { try { return window.CFG.ABILITIES[a].name; } catch (e) { return a; } }).filter(Boolean);
      if ($("levelUpText")) $("levelUpText").textContent = `Level ${lv}! +${sp} stat${((sk | 0) > 0) ? ` · +${sk} legacy skill` : ""}${names.length ? " · " + names.join(", ") : ""}`;
      banner.hidden = false;
      clearTimeout(levelBannerTimer);
      levelBannerTimer = setTimeout(() => { try { banner.hidden = true; } catch (e) { } }, 9000);
      try { updateProfileHud(); } catch (e) { }
      try { if ($("profileModal") && !$("profileModal").hidden) renderProfile(); } catch (e) { }
    } catch (e) { }
  }
  function hideLevelUp() {
    try { if ($("levelUpBanner")) $("levelUpBanner").hidden = true; } catch (e) { }
    try { clearTimeout(levelBannerTimer); } catch (e) { }
  }
  // Quest splash banner (mirrors the level-up banner, sits just below it).
  let questBannerTimer = null;
  function showQuestBanner(icon, title, sub) {
    try {
      const banner = $("questBanner");
      if (!banner) return;
      if ($("questTitle")) $("questTitle").textContent = `${title || ""}`;
      if ($("questSub")) $("questSub").textContent = sub || "";
      banner.hidden = false;
      clearTimeout(questBannerTimer);
      questBannerTimer = setTimeout(() => { try { banner.hidden = true; } catch (e) { } }, 9000);
    } catch (e) { }
  }
  function hideQuestBanner() {
    try { if ($("questBanner")) $("questBanner").hidden = true; } catch (e) { }
    try { clearTimeout(questBannerTimer); } catch (e) { }
  }
  // Technique-learnt banner (mirrors the quest banner, sits below it).
  let techBannerTimer = null;
  function showTechBanner(t) {
    try {
      const banner = $("techBanner");
      if (!banner) return;
      if ($("techTitle")) $("techTitle").textContent = `Deep Art learnt: ${t.name || ""}`;
      if ($("techSub")) $("techSub").textContent = `${t.hint || ""}${t.active ? " (bound to a hotbar slot — see Inventory)" : " (always on from now)"}`;
      banner.hidden = false;
      clearTimeout(techBannerTimer);
      techBannerTimer = setTimeout(() => { try { banner.hidden = true; } catch (e) { } }, 9000);
    } catch (e) { }
  }
  function hideTechBanner() {
    try { if ($("techBanner")) $("techBanner").hidden = true; } catch (e) { }
    try { clearTimeout(techBannerTimer); } catch (e) { }
  }
  // hotbar: 10 slots on keys 1-9 + Space (last slot).
  // The player's default weapon slot wears the ⚔️ Attack marker (gold +
  // bigger): the attack button / click / empty Space use it.
  // Space is the extra slot: bound items/abilities fire on Space, empty Space = default attack.
  function hotkeyLabel(i, defIdx, offIdx) {
    if (i === -1 || i === "none" || i == null) return "— No slot";
    try {
      const n = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
      if (i === n - 1) return "␣ Space";
    } catch (e) {}
    try {
      const pl = window.Game && window.Game.G && window.Game.G.player;
      if (defIdx == null) {
        defIdx = (pl && window.Items && window.Items.getDefaultWeaponSlot) ? window.Items.getDefaultWeaponSlot(pl) : 0;
      }
      if (offIdx == null) {
        offIdx = (pl && window.Items && window.Items.getOffhandSlot) ? window.Items.getOffhandSlot(pl) : 3;
      }
      if (i === defIdx && i === offIdx) return "ATK+OFF " + (i + 1);
      if (i === defIdx) return "ATK " + (i + 1);
      if (i === offIdx) return "OFF " + (i + 1);
    } catch (e) {}
    return String(i + 1);
  }
  // per-frame refresh of cooldown tint only (cheap class toggles — no rebuild),
  // so slots stop looking greyed-out the moment their cooldown expires.
  function refreshHotbarCooldowns() {
    const p = window.Game && window.Game.G.player;
    if (!p || !p.hotbar) return;
    const now = performance.now() / 1000;
    for (let i = 0; i < p.hotbar.length; i++) {
      const b = $("hb" + i);
      if (!b) continue;
      const slot = p.hotbar[i];
      if (slot && slot.kind === "ability") b.classList.toggle("cooling", !!(p.cooldowns && p.cooldowns[slot.id] > now));
      else if (b.classList.contains("cooling")) b.classList.remove("cooling");
    }
  }
  function updateHotbar() {
    const p = window.Game && window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    const N = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
    let def = 0, off = 3;
    try { if (window.Items && window.Items.getDefaultWeaponSlot) def = window.Items.getDefaultWeaponSlot(p); } catch (e) { }
    try { if (window.Items && window.Items.getOffhandSlot) off = window.Items.getOffhandSlot(p); } catch (e) { }
    for (let i = 0; i < N; i++) {
      const b = $("hb" + i);
      if (!b) continue;
      const slot = p.hotbar && p.hotbar[i];
      b.innerHTML = `<small>${hotkeyLabel(i, def, off)}</small>`;
      b.disabled = false;
      b.title = "";
      try { b.classList.toggle("atkSlot", i === def); } catch (e) { }
      try { b.classList.toggle("offSlot", i === off); } catch (e) { }
      if (!slot) {
        b.innerHTML += `<span>—</span>`;
        try {
          const _n = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
          if (i === def && i === off) b.title = "Default Attack + Off-hand Slot — attack button / click uses whatever weapon is here; Q parries with it (or fires it, if it isn't a weapon/shield). Bind gear in inventory (I).";
          else if (i === def) b.title = "Default Attack Slot — your attack button / click uses whatever weapon is here. Bind a weapon in inventory (I), or pick one and hit Default weapon.";
          else if (i === off) b.title = "Off-hand Slot — Q uses whatever is here: spells/throwables fire, weapons/shields (or empty) parry. Pick the slot in inventory (I).";
          else if (i === _n - 1) b.title = "Space Slot — bound items/abilities fire on Space. Empty Space = extra attack button (uses the default Attack Slot weapon, or bare fists). Bind in inventory (I).";
          else b.title = `Empty — bind abilities/items in inventory (I)`;
        } catch (e) { b.title = "Empty — bind abilities/items in inventory (I)"; }
        b.onclick = () => toggleInv();
        continue;
      }
      if (slot.kind === "ability") {
        const ab = window.CFG.ABILITIES[slot.id];
        if (!ab || !p.abilities.includes(slot.id)) {
          b.innerHTML += `<span>—</span>`; b.title = "Unknown spell";
          b.onclick = () => toggleInv();
          continue;
        }
        let cost = ab.mp, costUnit = "mp", costName = "MP";
        try {
          if (ab.kind === "technique" && window.Entities.effectiveStamCost) { cost = window.Entities.effectiveStamCost(p, slot.id); costUnit = "st"; costName = "stamina"; }
          else cost = window.Entities.effectiveMpCost(p, slot.id);
        } catch (e) { }
        const cd = p.cooldowns && p.cooldowns[slot.id] > performance.now() / 1000;
        b.innerHTML += `<em>${ab.name}</em><span>${slotIconImg(slot, "hbico")}</span>${cost ? `<b class="cnt">${cost}${costUnit}</b>` : ""}`;
        b.title = `${ab.name} — ${ab.desc} (${cost} ${costName})${i === def ? " · default attack (click / attack / Space)" : ""}${i === off ? " · off-hand (Q)" : ""}`;
        b.classList.toggle("cooling", !!cd);
        b.onclick = () => { window.Game.triggerHotbar(i); };
      } else if (slot.kind === "item") {
        const it = window.Items.ITEMS[slot.id];
        if (!it) { b.innerHTML += `<span>—</span>`; b.onclick = () => toggleInv(); continue; }
        const n = window.Items.countItem(p, slot.id);
        const empty = (it.type === "consumable" || it.type === "spellbook" || it.type === "material") && n <= 0;
        let slotName = it.name;
        try {
          // legacy id-only binds name whatever copy is worn (they wield it);
          // copy-exact binds name their own copy
          let disp = slot;
          if (!(slot.up > 0) && !slot.nick && p.equipment && window.Items.wornVariantOf) {
            for (const sl of ["weapon", "armor", "trinket", "shield"]) {
              if (p.equipment[sl] === slot.id) {
                const wv = window.Items.wornVariantOf(p, sl);
                if (wv.up > 0 || wv.nick) disp = { id: slot.id, up: wv.up, nick: wv.nick };
                break;
              }
            }
          }
          slotName = window.Items.variantName(disp);
          const sup = window.Items.stackUp(disp);
          if (sup > 0) slotName += ` +${sup * ((window.Items && window.Items.GEAR_UP_PCT) || 50)}%`;
        } catch (e) { }
        b.innerHTML += `<em></em><span>${slotIconImg(slot, "hbico")}</span>${it.type !== "equipment" ? `<b class="cnt">×${n}</b>` : ""}`;
        try { b.querySelector("em").textContent = slotName; } catch (e) { }
        b.title = `${slotName} — ${it.desc}${n ? ` (x${n})` : ""}${i === def ? " · default attack (click / attack / Space)" : ""}${i === off ? " · off-hand (Q)" : ""}`;
        b.disabled = !!empty;
        b.onclick = () => { window.Game.triggerHotbar(i); };
      }
    }
    try { fitHotbar(); } catch (e) { }
  }
  // Hotbar auto-fit: shrink the whole bar (CSS zoom keeps every slot's
  // proportions) until all 10 slots sit inside the viewport — horizontally
  // within its left/right anchors and vertically above the screen bottom.
  // Runs after every hotbar refresh, resize and touch-layout swap; never
  // grows past 1 and never shrinks below 0.5 (below that it would be
  // unreadable — native scroll/wrap stays as the fallback).
  function fitHotbar() {
    const hb = $("hotbar");
    if (!hb) return;
    try { hb.style.zoom = ""; } catch (e) { }
    let availW = 0, needW = 0;
    try {
      availW = hb.clientWidth;
      needW = hb.scrollWidth;
    } catch (e) { return; }
    let z = 1;
    if (needW > availW && availW > 0) z = availW / needW;
    try {
      const r = hb.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const availH = vh - r.top - 4;
      if (availH > 0 && r.height > availH) z = Math.min(z, availH / r.height);
    } catch (e) { }
    if (z < 1) {
      try { hb.style.zoom = String(Math.max(0.5, Math.round(z * 100) / 100)); } catch (e) { }
    }
  }
  function updateInteractHint(t) {
    const el = $("interactHint");
    if (!el) return;
    try {
      if (window.Game && window.Game.G.torchTargeting) {
        el.hidden = false;
        el.textContent = "🔥 Click a nearby spot to plant the torch (torch hotkey cancels)";
        return;
      }
      if (window.Shops && window.Shops.isPlacing && window.Shops.isPlacing()) {
        el.hidden = false;
        el.textContent = "📦 Click walkable ground nearby to place (Esc cancels)";
        return;
      }
    } catch (e) { }
    if (!t) { el.hidden = true; return; }
    el.hidden = false;
    if (t.kind === "npc") el.textContent = `💬 ${t.npc.name} — press E / tap to talk`;
    else if (t.kind === "corpse") {
      const mob = !!(t.ent && t.ent.xpReward != null);
      el.textContent = `💀 ${t.ent.name} (lv.${t.ent.lv}) — E raid${mob ? "" : " (witnesses mind!)"} · ✨Revive needs lv ${t.ent.lv}`;
    }
    else if (t.kind === "fainted") el.textContent = `💀 ${t.ent.name} is down — cast ✨ Revive (needs lv ${t.ent.lv})`;
    else if (t.kind === "chest") el.textContent = `🎁 chest — press E to loot`;
    else if (t.kind === "quest") el.textContent = `📜 quest cache — press E to recover`;
    else if (t.kind === "dungeon") {
      try {
        const info = (window.Game && window.Game.dungeonEntranceInfo) ? window.Game.dungeonEntranceInfo(t.poi) : null;
        let best = 0;
        try { best = (window.Game.unlockedDungeonMax && window.Game.dungeonBaseOf) ? window.Game.unlockedDungeonMax(window.Game.G.player, window.Game.dungeonBaseOf(t.poi.dungeonId)) : 0; } catch (e2) { }
        el.textContent = info
          ? (best >= 1 ? `${info.name} — press E to choose depth (best: level ${best})` : `${info.name} — press E to descend`)
          : `🕳️ descend — press E`;
      } catch (e) { el.textContent = `🕳️ descend — press E`; }
    }
    else if (t.kind === "exit") el.textContent = `🪜 entry stairs — press E to travel (surface or a visited floor)`;
    else if (t.kind === "portal") el.textContent = `🌀 way down — press E to decide`;
    else if (t.kind === "hearthportal") el.textContent = `✨ hearth portal — press E to travel`;
    else if (t.kind === "hell_tower") el.textContent = `🗼 red portal — press E to travel (stand on the tower heart)`;
    else if (t.kind === "pantheon_heart") el.textContent = `🌅 Goddess of Dawn — press E to approach her`;    else if (t.kind === "tame") el.textContent = `💛 ${t.mob.name} submits! — press E to tame it before it dies`;
   else if (t.kind === "stable") el.textContent = `🐴 Stable — press E to manage tamed beasts`;
    else if (t.kind === "inn") el.textContent = `🛏️ Inn — press E to retire / retrieve party & slaves (paid rooms)`;
   else if (t.kind === "beast_lodge") el.textContent = `🧬 Beast Lodge — press E to breed tames & browse beasts`;
    else if (t.kind === "shop") el.textContent = `${(t.shopKind && window.Shops && window.Shops.SHOP_TITLE && window.Shops.SHOP_TITLE[t.shopKind]) || "🏪 Shop"} — press E to trade`;
    else if (t.kind === "guild") el.textContent = `🏛️ Guildhall — press E for Noticeboard / Counter`;
    else if (t.kind === "homeportal") el.textContent = `🌀 Home portal — press E to travel / bind respawn`;
    else if (t.kind === "torch") el.textContent = `🔥 planted torch — press E to collect`;
    else if (t.kind === "bed") el.textContent = `🛏️ bed — press E to sleep (+6h)`;
    else if (t.kind === "furn") {
      try { el.textContent = (window.Game && window.Game.furnHint) ? window.Game.furnHint(t.furn) : "press E to use"; } catch (e) { el.textContent = "press E to use"; }
    }
    else if (t.kind === "sign") el.textContent = `🪧 read — press E`;
    else if (t.kind === "book" || t.kind === "dbook") {
      try {
        const r = (window.Lorebooks && t.bookId) ? window.Lorebooks.get(t.bookId) : null;
        const mine = (window.Game && window.Game.G && window.Game.G.player) ? window.Lorebooks.readSet(window.Game.G.player) : {};
        el.textContent = r ? `📖 ${r.title} (vol. ${r.vol}/${r.nVols})${mine[r.id] ? " — re-read" : ""} — press E` : `📖 lorebook — press E to read`;
      } catch (e) { el.textContent = `📖 lorebook — press E to read`; }
    }
    else if (t.kind === "tree") el.textContent = "🪓 tree — attack button / click to chop";
    else if (t.kind === "wall") {
      if (t.isDun) el.textContent = "⛏️ crypt wall — nigh unbreakable (attack to chip it)";
      else if (t.isWin) el.textContent = "🪟 window — fragile! attack to smash through";
      else el.textContent = "🧱 wall — attack to break through (or use a door)";
    }
    else if (t.kind === "herb") {
      let htxt = "🌿 wild herbs — press E to gather";
      try {
        if (window.Game && window.Game.herbHintText) htxt = window.Game.herbHintText(t.herb) || htxt;
      } catch (e) { }
      el.textContent = htxt;
    }
    try {
      if (window.Status && window.Game && window.Game.G && window.Game.G.player) {
        const st = window.Status.describe(window.Game.G.player);
        if (st) el.textContent += " · " + st;
      }
    } catch (e) { }
  }

  // ---------- chat ----------
  function openChat(npc) {
    chatNpc = npc;
    const isRemote = !!(npc && npc.isRemotePlayer);
    // revealed teeth are foes, not conversation — E never reaches here
    // (nearestInteract skips them), but a stale target still must not chat
    if (npc && npc.isDoppelganger && npc.doppelRevealed) {
      try { toast("🦷 Teeth! Attack it — talking is over."); } catch (e) { }
      chatNpc = null;
      try { $("chatModal").hidden = true; } catch (e) { }
      return;
    }
    if (!isRemote) { try { if (window.Trade) window.Trade.ensure(chatNpc); } catch (e) { } }
    // Drop any held game keys so the player doesn't keep moving/attacking while chatting.
    try {
      const G = window.Game.G;
      for (const k of Object.keys(G.keys)) G.keys[k] = false;
      G.mouse.down = false;
    } catch (e) { }
    $("chatModal").hidden = false;
    // v19 Peter intro / goddess outro: NPC dialogue modal with NO input bar
    // and NO trade option — the question + answer buttons are laid by Game.
    try {
      if (npc && (npc.isPeterIntro || npc.isGoddessOutro)) {
        try { $("npcTradePane").hidden = true; } catch (e) {}
        try { $("tradePanel").hidden = true; } catch (e2) {}
        for (const id of ["chatInput", "chatSend", "recruitBtn", "chatQuestBtn", "chatReportBtn", "healBtn", "giftBtn", "tradeBtn", "allyBtn"]) {
          try { const el = $(id); if (el) el.hidden = true; } catch (e3) {}
        }
        try {
          if (npc.blank) {
            $("chatName").textContent = "";
            $("chatRole").textContent = "";
            const cp0 = $("chatPersona"); if (cp0) { cp0.textContent = ""; cp0.hidden = true; }
          } else {
          $("chatName").textContent = npc.name || (npc.isPeterIntro ? "Peter the Fallen" : "Goddess of Dawn");
          $("chatRole").textContent = npc.isPeterIntro ? "Supreme Overlord of Hell · lv " + (npc.lv || 130) : "Herald of the Morning · lv 100";
          const cp = $("chatPersona"); if (cp) { cp.textContent = npc.isPeterIntro ? "👑 The end of Hell asks why you came." : "🌅 Dawn herself thanks you."; cp.hidden = false; }
          }
          $("chatLoyalty").textContent = "";
          $("chatMem").textContent = "";
          try {
            const cv = $("chatPortrait");
            const img = window.Sprites.drawPortrait({ kind: npc.isPeterIntro ? "peter_the_fallen" : "goddess", id: npc.id, name: npc.name, role: npc.role, tint: npc.tint || "#fff", silhouette: !!npc.silhouette, blank: !!npc.blank }, 120, true);
            cv.width = 120; cv.height = 120;
            try { cv.getContext("2d").imageSmoothingEnabled = false; } catch (e4) {}
            cv.getContext("2d").drawImage(img, 0, 0);
          } catch (e5) {}
        } catch (e6) {}
        try { $("chatLog").innerHTML = ""; } catch (e7) {}
        try { $("chatLog").scrollTop = 0; } catch (e7b) {}
        try { window.Sfx.talk(); } catch (e8) {}
        return;
      }
    } catch (e) {}
    try {
      // new layout: trade pane stays visible like a market; ensure content is fresh
      const pane = $("npcTradePane"); if (pane) pane.hidden = false;
      const tp = $("tradePanel"); if (tp) tp.hidden = false;
      renderTrade();
    } catch (e) { }
    // Normal NPCs always get the full AI-chat chrome back: main-story VNs
    // (hideChatChrome) and the Peter/goddess branch above hide chatInput /
    // chatSend / action buttons with .hidden, and nothing else restores them —
    // without this the AI chat row stays dead for every NPC after the first
    // story dialogue. (renderChatHead/renderChatLog right below then correct
    // per-NPC details like the Report button + ally hiding.)
    try {
      for (const id of ["chatInput", "chatSend", "recruitBtn", "chatQuestBtn", "chatReportBtn", "healBtn", "giftBtn", "tradeBtn"]) {
        const el = $(id); if (el) el.hidden = false;
      }
    } catch (e) { }
    try { chatBusy = false; setChatLoading(false); } catch (e) { }
    renderChatHead();
    renderChatLog();
    if (isRemote) {
      try { window.Sfx.talk(); } catch (e) { }
      setTimeout(() => { try { $("chatInput").focus(); } catch (e) { } }, 50);
      return;
    }
    try {
      const qr = window.Quests ? window.Quests.onTalk(npc) : null;
      if (qr && qr.delivered) { sysBubble(`📜 Delivered: ${qr.delivered.title} — rewards granted!`); renderChatHead(); }
      else if (qr && qr.turnin) { sysBubble(`📨 ${npc.name} awaits your report — press ✅ Report above!`); renderChatHead(); }
    } catch (e) { }
    try { window.Sfx.talk(); } catch (e) { }
    setTimeout(() => { try { $("chatInput").focus(); } catch (e) { } }, 50);
    try { maybeAutoOffer(npc); } catch (e) { }
  }
  function closeChat() {
    $("chatModal").hidden = true; chatNpc = null;
    try {
      const G = window.Game.G;
      for (const k of Object.keys(G.keys)) G.keys[k] = false;
      G.mouse.down = false;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } catch (e) { }
  }
  function isTypingTarget(e) {
    const t = e && e.target;
    if (!t) return false;
    if (t.isContentEditable) return true;
    const tag = (t.tagName || "").toUpperCase();
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }
  function isModalOpen() {
    for (const id of ["chatModal", "partyModal", "questModal", "mapModal", "helpModal", "deathModal", "invModal", "charModal", "heroCreatorModal", "menuModal", "profileModal", "changelogModal", "portalModal", "dungeonTravelModal", "travelModal", "tutorialModal", "tutRewardModal", "stableModal", "innModal", "guildModal", "loreModal", "playerTradeModal", "practiceModal", "altarModal"]) {
      const el = $(id);
      if (el && !el.hidden) return true;
    }
    return false;
  }
  function renderChatHead() {
    const n = chatNpc; if (!n) return;
    // v19 Peter/goddess modal owns its own head — never run NPC recruit/trade logic.
    try { if (n.isPeterIntro || n.isGoddessOutro) return; } catch (e) {}
    // remote player: direct unmoderated chat — no AI persona, no recruit/quest/trade force
    if (n.isRemotePlayer) {
      $("chatName").textContent = "🧑‍🤝‍🧑 " + (n.name || "Traveler");
      $("chatRole").textContent = `${n.role || "adventurer"} · lv ${n.lv || 1}${(() => { try { const rc = (n.appearance && n.appearance.race) || "human"; return (rc && rc !== "human" && window.Appearance) ? ` · ${window.Appearance.RACE_ICON[rc] || ""} ${window.Appearance.RACE_LABEL[rc] || rc}` : ""; } catch (e) { return ""; } })()} · HP ${Math.ceil(n.hp || 0)}/${n.maxHp || 50}${n.sleeping ? " · 😴 asleep" : ""} · fellow traveler`;
      try {
        const cp = $("chatPersona");
        if (cp) { cp.textContent = "Direct player chat — no AI, no moderation. Be kind."; cp.hidden = false; }
      } catch (e) { }
      $("chatLoyalty").textContent = "";
      try {
        const cv = $("chatPortrait");
        const img = window.Sprites.drawPortrait({ kind: "player", id: n.remoteHash || n.name, remoteHash: n.remoteHash || null, name: n.name, role: n.role, tint: n.tint || "#4da3ff", equipment: n.equipment || null, appearance: n.appearance || null }, 120, true);
        cv.width = 120; cv.height = 120;
        try { cv.getContext("2d").imageSmoothingEnabled = false; } catch (e2) { }
        cv.getContext("2d").drawImage(img, 0, 0);
        try { cv.getContext("2d").imageSmoothingEnabled = false; } catch (e2) { }
        cv.getContext("2d").drawImage(img, 0, 0);
      } catch (e) { }
      $("chatMem").textContent = "Same party rules: trade only (voluntary give), heals welcome — you can't force, recruit or dismiss them.";
      try {
        const rb = $("recruitBtn"); if (rb) rb.hidden = true;
        const qq = $("chatQuestBtn"); if (qq) qq.hidden = true;
        const tq = $("chatReportBtn"); if (tq) tq.hidden = true;
        const tb = $("tradeBtn"); if (tb) tb.hidden = true;
        const hb = $("healBtn"); if (hb) { hb.hidden = false; hb.textContent = "💚 Heal them (10 MP)"; }
        const gb = $("giftBtn"); if (gb) { gb.hidden = false; gb.textContent = "🎁 Give / ⚖️ Trade…"; gb.title = "Open the in-game trade menu: give instantly or offer for trade"; }
        const ab = $("allyBtn");
        if (ab) {
          ab.hidden = false;
          let allied = false;
          try { allied = !!(window.MP && window.MP.isAlliedHash && n.remoteHash && window.MP.isAlliedHash(n.remoteHash)); } catch (e) { }
          ab.textContent = allied ? "🤝 Allied ✓ (end?)" : "🤝 Ally";
          ab.title = allied ? "Allied: no damage either way, shared Known World map — tap to end the alliance" : "Ask " + (n.name || "them") + " to ally: no damage either way, shared Known World map";
        }
      } catch (e) { }
      return;
    }
    try {
      const rb0 = $("recruitBtn"); if (rb0) rb0.hidden = false;
      const qq0 = $("chatQuestBtn"); if (qq0) qq0.hidden = false;
      const tb0 = $("tradeBtn"); if (tb0) tb0.hidden = false;
      const ab0 = $("allyBtn"); if (ab0) ab0.hidden = true;
      const isSlave = (n.role === "slave" || n.noLoyalty);
      const p0 = window.Game && window.Game.G ? window.Game.G.player : null;
      let hCost = 10, gCost = 5, pts = 1;
      try {
        pts = window.Entities.loyaltyPts(p0);
        gCost = window.Entities.giftCost(n, p0);
        hCost = window.Entities.npcHealCost(n, p0);
      } catch (e) { }
      const hb0 = $("healBtn");
      if (hb0) {
        hb0.hidden = false;
        hb0.textContent = isSlave ? `💚 Heal (100g field care)` : `💚 Heal (${hCost}g · +${pts} 💛)`;
        hb0.title = isSlave ? `${n.name} is bound — healing is flat field care, no loyalty` : `${n.name} heals you to full HP/MP for ${hCost} gold and likes you +${pts} 💛`;
      }
      const gb0 = $("giftBtn");
      if (gb0) {
        if (isSlave) { gb0.hidden = true; }
        else {
          gb0.hidden = false;
          gb0.textContent = `🎁 Gift (${gCost}g · +${pts} 💛)`;
          gb0.title = `Give ${gCost} gold — ${n.name} likes you +${pts} 💛`;
        }
      }
    } catch (e) { }
    try { if (window.AIDirector && window.AIDirector.ensurePersona) window.AIDirector.ensurePersona(n); } catch (e) { }
    $("chatName").textContent = n.name;
    try {
      let gIco = "";
      try { const E = window.Entities; if (E && E.ensureGender && E.genderIcon) gIco = E.genderIcon(E.ensureGender(n)) + " "; } catch (e2) { }
      const rc = (n.appearance && n.appearance.race) || n.race || "human";
      const rtag = (rc && rc !== "human" && window.Appearance) ? ` · ${(window.Appearance.RACE_ICON[rc] || "")} ${(window.Appearance.RACE_LABEL[rc] || rc)}` : "";
      $("chatRole").textContent = `${gIco}${n.role} · lv ${n.lv}${rtag} · HP ${Math.ceil(n.hp)}/${n.maxHp} · 🪙 ${n.gold | 0}`;
    } catch (e) {
      $("chatRole").textContent = `${n.role} · lv ${n.lv} · HP ${Math.ceil(n.hp)}/${n.maxHp} · 🪙 ${n.gold | 0}`;
    }
    try {
      const cp = $("chatPersona");
      if (cp) {
        let line = "";
        try { line = window.AIDirector.personaLine(n); } catch (e) { line = ""; }
        cp.textContent = line ? `🎭 ${line.slice(0, 160)}` : "";
        cp.hidden = !line;
      }
    } catch (e) { }
    $("chatLoyalty").textContent = (n.role === "slave" || n.noLoyalty) ? `⛓️ bound — no loyalty · breedable in beast lodges${n.inParty ? " · in party" : ""}` : `💛 loyalty ${n.loyalty || 0}${(() => { try { return (!n.inParty && n.recruitable) ? `/${window.Entities.recruitThreshold(n)}` : ""; } catch (e) { return ""; } })()}${n.inParty ? " · in party" : ""}`;
    const cv = $("chatPortrait");
    const img = window.Sprites.drawPortrait(n, 120);
    cv.width = 120; cv.height = 120;
    try { cv.getContext("2d").imageSmoothingEnabled = false; } catch (e) { }
    cv.getContext("2d").drawImage(img, 0, 0);
    try {
      const tg = $("npcTradeGold");
      if (tg) tg.textContent = `🪙 ${window.Game.G.player.gold | 0} · ${n.name.split(" ")[0]}: ${n.gold | 0}g`;
    } catch (e) { }
    try { renderTrade(); } catch (e) { }
    const mem = (n.memories && n.memories.summary) || "";
    $("chatMem").textContent = mem ? `remembers: ${mem.slice(0, 220)}` : "no memories yet — be their first story.";
    const rb = $("recruitBtn");
   // revealed teeth can never be recruited — hostile form is dismiss-only
   if (n.isDoppelganger && n.doppelRevealed) { rb.textContent = "🦷 Teeth — cannot recruit"; rb.disabled = true; rb.title = "A revealed doppelganger is hostile — drive it out, don't invite it in."; }
   else if (n.inParty) { rb.textContent = "Dismiss from party"; rb.disabled = false; }
    else if (n.inInn) { rb.textContent = "Roomed at an inn — retrieve"; rb.disabled = true; rb.title = "They rest in a paid inn room — retrieve them from any inn roster (E at an inn counter)."; }
   else if ((window.Game.G.player.party || []).length >= mpPartyCap()) {
     // party full: recruiting still works if an inn room is open (the new
     // friend rooms there); otherwise both house and party are full.
     let innOpen = false;
     try { innOpen = window.Game.innOpenSlot ? window.Game.innOpenSlot(window.Game.G.player) >= 0 : false; } catch (e) {}
     if (innOpen && n.recruitable) { rb.textContent = "Recruit to inn (party full)"; rb.disabled = false; rb.title = "Your party is full — they will rest in a vacant paid inn room (retrieve at any inn)."; }
     else { rb.textContent = "Party + inn full (" + mpPartyCap() + ")"; rb.disabled = true; rb.title = ""; }
   }
    else if (!n.recruitable) { rb.textContent = "Cannot leave post"; rb.disabled = true; }
    else { rb.textContent = `Recruit (${(window.Game.G.player.party || []).length}/${mpPartyCap()})`; rb.disabled = false; }
    try {
      const tq = $("chatReportBtn");
      if (tq) {
        const pend = window.Quests ? window.Quests.pendingTurnIn(n) : null;
        tq.hidden = !pend;
        if (pend) tq.textContent = `✅ Report: ${pend.title.slice(0, 28)}`;
      }
      const qq = $("chatQuestBtn");
      if (qq) qq.disabled = !!(window.Quests && window.Quests.active(window.Game.G.player).length >= window.Quests.MAX_ACTIVE);
    } catch (e) { }
  }
  function setChatLoading(on) {
    // Send button doubles as the loading indicator while the NPC replies:
    // spinner + wait cursor, input stays editable so text isn't lost.
    try {
      const btn = $("chatSend");
      if (!btn) return;
      btn.disabled = !!on;
      btn.classList.toggle("loading", !!on);
      if (on) btn.innerHTML = `<span class="spin" aria-hidden="true"></span>`;
      else btn.textContent = "➤";
    } catch (e) { }
  }
  function bubble(who, text) {
    const log = $("chatLog");
    const d = document.createElement("div");
    d.className = "msg" + (who === "you" ? " you" : " npc") + (text === "…" ? " thinking" : "");
    d.innerHTML = `<b></b><span></span>`;
    d.querySelector("b").textContent = who === "you" ? "Player :" : ((chatNpc && chatNpc.name ? chatNpc.name : "NPC") + " :");
    d.querySelector("span").textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function renderChatLog() {
    const log = $("chatLog"); log.innerHTML = "";
    if (chatNpc && chatNpc.isRemotePlayer) {
      // direct history: whispers exchanged with this traveler + channel context
      try {
        const M = window.MP && window.MP.M;
        const mine = M && M.hash, theirs = chatNpc.remoteHash;
        const items = (M && M.chat ? M.chat : []).filter(c => !c.sys && (c.whisper ? (c.from === mine && c.to === theirs) || (c.from === theirs) : false));
        for (const c of items.slice(-12)) {
          const who = c.from === mine ? "you" : "npc";
          bubble(who, c.text);
        }
      } catch (e) { }
      if (!log.children.length) bubble("npc", "Direct line open. Say hi — no AI is listening.");
      return;
    }
    const tail = (chatNpc.memories && chatNpc.memories.tail) || [];
    for (const line of tail.slice(-8)) {
      const m = line.match(/^(.*?):\s*(.*)$/);
      if (!m) continue;
      const who = /traveler|you/i.test(m[1]) ? "you" : "npc";
      bubble(who, m[2]);
    }
    if (!tail.length) bubble("npc", chatNpc.greeting || "Hello, traveler.");
  }
  async function sendChat() {
    if (!chatNpc || chatBusy) return;
    // v19 Peter/goddess modal has no input bar — answer buttons own the flow.
    try { if (chatNpc.isPeterIntro || chatNpc.isGoddessOutro) return; } catch (e) {}
    const inp = $("chatInput");
    const text = inp.value.trim();
    if (!text) return;
    inp.value = "";
    chatBusy = true; setChatLoading(true);
    bubble("you", text);
    // remote player: direct whisper, no AI/trade/quest involved
    if (chatNpc.isRemotePlayer) {
      try {
        await window.MP.whisper(chatNpc.remoteHash, text);
      } catch (e) {
        sysBubble("⚠️ " + (e.message || "Could not send — still in the channel?"));
      }
      chatBusy = false; setChatLoading(false);
      $("chatLog").scrollTop = $("chatLog").scrollHeight;
      return;
    }
    // trade intent first (buy/sell/haggle/deal) — executes, then Prexzy reacts.
    // tr.sys is the authoritative outcome; it is ALSO passed as ledger so
    // chatReply persists it into CONVERSATION MEMORY (tail) for future turns.
    let extra = "", ledger = "";
    // QUEST DECISION FIRST: before any trade parsing or chat reply, check quest
    // state (finished quest awaiting report? already carrying this NPC's
    // quest?) so the reply briefs the right quest instead of inventing one.
    try {
      if (window.Quests && window.Quests.preTalk) {
        const pq = window.Quests.preTalk(chatNpc, window.Game.G.player, text);
        if (pq) extra = pq;
      }
    } catch (e) { }
    // TRADE + QUEST DECISION SECOND: every message is analyzed for trade
    // intent and game-side changes (focus, shelf-price cuts, pending deals)
    // are applied BEFORE the chat reply. Explicit commands run first; when they
    // miss (natural phrasing like "lower the potion?" / "too expensive"),
    // the memory-driven fallback decides from loyalty + plea history.
    let explicitHandled = false;
    try {
      const tr = await handleTradeText(text);
      if (tr) {
        explicitHandled = true;
        if (tr.sys) { sysBubble(tr.sys); ledger = tr.sys; }
        extra = (extra ? extra + " " : "") + (tr.extra || "");
        try { renderTrade(); } catch (e2) { }
        try { renderChatHead(); } catch (e2) { }
      }
    } catch (e) { }
    if (!explicitHandled) {
      // PROGRAMMATIC-FIRST trade understanding: classifyTradeIntent decides
      // what the player meant (item, side, qty, offer, plea, accept);
      // game-side validation + execution stays deterministic in
      // Trade.applyAiIntent. When unsure, the regex memory fallback runs.
      let aiDone = false;
      try {
        if (window.AIDirector && window.AIDirector.classifyTradeIntent && window.Trade && window.Trade.applyAiIntent) {
          const aiIntent = await window.AIDirector.classifyTradeIntent(chatNpc, window.Game.G.player, text);
          if (aiIntent) {
            const ar = await window.Trade.applyAiIntent(window.Game.G.player, chatNpc, text, aiIntent);
            if (ar && !ar.fallback) {
              aiDone = true;
              if (ar.tradeRelated) {
                if (ar.sys) { sysBubble(ar.sys); ledger = ar.sys; }
                extra = (extra ? extra + " " : "") + (ar.extra || "");
              }
              if (ar.changed) {
                try { renderTrade(); } catch (e2) { }
                try { renderChatHead(); } catch (e2) { }
                try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e2) { }
              }
            }
          }
        }
      } catch (e) { }
      if (!aiDone) {
      try {
        if (window.Trade && window.Trade.decideMemoryTrade) {
          const md = await window.Trade.decideMemoryTrade(window.Game.G.player, chatNpc, text);
          if (md && md.tradeRelated) {
            if (md.sys) { sysBubble(md.sys); if (!ledger && !md.logDone) ledger = md.sys; }
            if (md.extra) extra = (extra ? extra + " " : "") + md.extra;
            if (md.changed) {
              try { renderTrade(); } catch (e2) { }
              try { renderChatHead(); } catch (e2) { }
              try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e2) { }
            }
          }
        }
      } catch (e) { }
      }
    }
    // "quest" talk fast-path: the programmatic director picks parameters
    try {
      if (/quest|errand|contract|\btask\b|\bjob\b/i.test(text)) {
        requestQuestOffer(chatNpc, false);
      }
    } catch (e) { }
    const thinking = bubble("npc", "…");
    const span = thinking.querySelector("span");
    try {
      const p = window.Game.G.player;
      const ch = window.Game.G.chunks.get(Math.floor(p.x / 16) + "," + Math.floor(p.y / 16));
      const ctx = (extra ? extra + " " : "") + (p.inDungeon ? `inside dungeon ${(window.Game.G.dungeon || {}).name}` : `at ${ch ? (ch.placeName || prettyBiome(ch.biome)) : "wilds"} (${p.x.toFixed(0)},${p.y.toFixed(0)})`);
      const reply = await window.AIDirector.chatReply(chatNpc, p, text, (d) => {
        span.textContent = (d.fullTextSoFar || "").replace(new RegExp("^" + chatNpc.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*"), "");
      }, ctx, ledger);
      span.textContent = reply;
    } catch (e) { span.textContent = "(the words won't come...)"; }
    try { thinking.classList.remove("thinking"); } catch (e2) { }
    chatBusy = false; setChatLoading(false);
    renderChatHead(); updateHUD();
    // prices/loyalty/gold may have moved during the exchange — refresh open panel
    try { if (!$("tradePanel").hidden) renderTrade(); } catch (e) { }
    $("chatLog").scrollTop = $("chatLog").scrollHeight;
  }
  // NPC companion cap (host-decided in multiplayer, static CFG solo).
  function mpPartyCap() { try { if (window.Game && window.Game.effectivePartyMax) return window.Game.effectivePartyMax(); } catch (e) {} return (window.CFG && window.CFG.PARTY_MAX) || 4; }
  async function toggleRecruit() {
    if (!chatNpc) return;
    if (chatNpc.isRemotePlayer) { toast("Fellow travelers can't be forced in or out — trade and heals only."); return; }
    // revealed teeth can never be recruited in hostile form (even via stale UI)
    if (chatNpc.isDoppelganger && chatNpc.doppelRevealed) { toast("🦷 Teeth! A revealed doppelganger can't be recruited — drive it out."); return; }
    const p = window.Game.G.player;
    p.party = p.party || [];
    const logLedger = (t) => {
      try {
        chatNpc.memories = chatNpc.memories || { summary: "", tail: [] };
        chatNpc.memories.tail.push(`Shop ledger: ${t}`.slice(0, 220));
        if (chatNpc.memories.tail.length > 14) chatNpc.memories.tail = chatNpc.memories.tail.slice(-14);
      } catch (e) { }
    };
   if (chatNpc.inParty) {
      try { if (window.Game && window.Game.unassignMountFromMember) window.Game.unassignMountFromMember(chatNpc.id, true); } catch (e) { }
      chatNpc.inParty = false;
      p.party = p.party.filter(id => id !== chatNpc.id);
      logLedger(`${chatNpc.name} left ${p.name}'s party.`);
      toast(`${chatNpc.name} leaves the party.`);
    } else {
      if (chatNpc.inInn) { toast(`${chatNpc.name} already rests in a paid inn room — retrieve them from any inn roster (E at an inn counter).`); return; }
      const isSlaveNpc = (chatNpc.role === "slave" || chatNpc.noLoyalty);
      const need = window.Entities.recruitThreshold(chatNpc);
      if (!isSlaveNpc && (chatNpc.loyalty || 0) < need) {
        toast(`💛 ${chatNpc.name} doesn't trust you yet (${chatNpc.loyalty}/${need}). Chat more, or give gold.`);
        return;
      }
      if (!chatNpc.recruitable) { toast(`${chatNpc.name} cannot leave their post.`); return; }
      if (p.party.length >= mpPartyCap()) {
        // party full: recruit straight into a vacant paid inn room, or fail
        // when the house is full too (nothing changes)
        let filed = null;
        try {
          // publish first: findInnNpc only sees cached NPCs
          const GN = window.Game.G;
          if (GN && Array.isArray(GN.npcs) && !GN.npcs.includes(chatNpc)) GN.npcs.push(chatNpc);
        } catch (e) { }
        try { filed = (window.Game && window.Game.innFileGuest) ? window.Game.innFileGuest(chatNpc.id) : null; } catch (e) { filed = null; }
        if (!filed || !filed.ok) { toast("⚠️ " + ((filed && filed.msg) || `Party is full (${mpPartyCap()}).`)); return; }
        logLedger(`${chatNpc.name} joined ${p.name}'s inn (room ${filed.room}, party full).`);
        toast(`🛏️ Party is full — ${chatNpc.name} rests in inn room ${filed.room} (retrieve at any inn).`);
        try { window.Sfx.level(); } catch (e) { }
        try { if (window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("party"); } catch (e) { }
        chatNpc.x = p.x + 1; chatNpc.y = p.y; chatNpc.gx = chatNpc.x; chatNpc.gy = chatNpc.y;
        try { window.Items.ensureNpcLoadout(chatNpc); } catch (e) { }
      } else {
        chatNpc.inParty = true;
        chatNpc.x = p.x + 1; chatNpc.y = p.y; chatNpc.gx = chatNpc.x; chatNpc.gy = chatNpc.y;
        try { window.Items.ensureNpcLoadout(chatNpc); } catch (e) { }
        if (!p.party.includes(chatNpc.id)) p.party.push(chatNpc.id);
        logLedger(`${chatNpc.name} joined ${p.name}'s party (now ${p.party.length}/${mpPartyCap()}).`);
        toast(`⚔️ ${chatNpc.name} joined your party! (${p.party.length}/${mpPartyCap()})`);
        try { window.Sfx.level(); } catch (e) { }
        try { if (window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("party"); } catch (e) { }
      }
    }
    try { await window.World.saveNpc(chatNpc); await window.Game.saveGame(true); } catch (e) { }
    renderChatHead(); updateHUD();
  }

  // ---------- trade (NPC inventories + haggling) ----------
  function sysBubble(text) {
    const log = $("chatLog"); if (!log) return;
    const d = document.createElement("div");
    d.className = "msg sys";
    d.innerHTML = `<span></span>`;
    d.querySelector("span").textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function normName(id) {
    try { const it = window.Items.ITEMS[id]; if (it) return it.name.toLowerCase(); } catch (e) { }
    return String(id).replace(/^tome_/, "").replace(/_/g, " ").toLowerCase();
  }
  function matchStock(npc, q) {
    q = String(q || "").toLowerCase().trim().replace(/[x×]$/, "").trim();
    if (!q) return null;
    const stock = (npc.stock || []).filter(s => s.n > 0);
    return stock.find(s => normName(s.id) === q || s.id.replace(/_/g, " ") === q)
      || stock.find(s => normName(s.id).includes(q) || q.includes(normName(s.id)))
      || null;
  }
  function matchPlayerItem(player, q) {
    q = String(q || "").toLowerCase().trim();
    if (!q) return null;
    const ids = [];
    try { for (const s of (player.inventory || [])) if (window.Items.countItem(player, s.id) > 0 && !ids.includes(s.id)) ids.push(s.id); } catch (e) { }
    return ids.find(id => normName(id) === q || id.replace(/_/g, " ") === q)
      || ids.find(id => normName(id).includes(q) || q.includes(normName(id)))
      || null;
  }
  function toggleTrade(force) {
    const pane = $("npcTradePane"), tp = $("tradePanel");
    if (!tp || !chatNpc) return;
    const show = force !== undefined ? force : (pane ? pane.hidden : tp.hidden);
    if (pane) pane.hidden = !show; else tp.hidden = !show;
    if (show) renderTrade();
  }
  function renderTrade() {
    const tp = $("tradePanel"); if (!tp || !chatNpc) return;
    try { if (chatNpc.isPeterIntro || chatNpc.isGoddessOutro) { tp.innerHTML = ""; return; } } catch (e) {}
    const n = chatNpc, p = window.Game.G.player, T = window.Trade;
    if (!T) { tp.textContent = "Trade unavailable."; return; }
    T.ensure(n);
    // remote players: no NPC stock — pane stays hidden-friendly with a hint
    if (n.isRemotePlayer) { tp.innerHTML = "<i style='font-size:12px;opacity:.7'>Direct trade: use 🎁 Give / ⚖️ Trade… below.</i>"; return; }
    tp.innerHTML = "";
    try {
      const tg = $("npcTradeGold");
      if (tg) tg.textContent = `🪙 ${p.gold | 0} · ${String(n.name || "").split(" ")[0]}: ${n.gold | 0}g`;
    } catch (e) { }
    const iconFor = (id) => { try { if (window.Icons) return window.Icons.img("item", id, 20); } catch (e) { } return ""; };
    const mk = (cls, html) => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; tp.appendChild(d); return d; };
    // market-style header is in #npcTradeHead; keep rows tight like a shop list
    if (n.deal) {
      const d = n.deal;
      const b = mk("tdeal", "");
      const what = d.side === "buy"
        ? `${n.name} offers ${d.n}× ${normName(d.id)} for ${d.price}g each (${d.price * d.n}g)`
        : `${n.name} will pay ${d.price}g each for your ${d.n}× ${normName(d.id)} (${d.price * d.n}g)`;
      b.innerHTML = `<span></span> `;
      b.querySelector("span").textContent = `🤝 ${what} — say "deal"?`;
      const ok = document.createElement("button"); ok.textContent = "Deal";
      ok.onclick = async () => {
        const r = await T.acceptDeal(p, n);
        sysBubble(r.ok ? `*${r.msg}*` : `*${r.msg}*`);
        renderTrade(); renderChatHead();
      };
      const no = document.createElement("button"); no.textContent = "No"; no.className = "ghost";
      no.onclick = async () => { T.declineDeal(n); sysBubble("*You let the deal lapse.*"); renderTrade(); };
      b.appendChild(ok); b.appendChild(no);
    }
    mk("tsec", "Their goods");
    const stock = (n.stock || []).filter(s => s.n > 0);
    if (!stock.length) mk("", "<i>Sold out.</i>");
    for (const s of stock) {
      const deal = n.deal && n.deal.side === "buy" && n.deal.id === s.id ? n.deal : null;
      const price = deal ? deal.price : T.ask(n, s.id, p);
      const lockedNeed = (() => { try { return window.Items && window.Items.matLocked ? window.Items.matLocked(p, s.id) : 0; } catch (e) { return 0; } })();
      const row = mk("trow", "");
      row.innerHTML = `<span class="tn"></span><span></span> `;
      row.querySelector(".tn").innerHTML = `${iconFor(s.id)} ${normName(s.id)} ×${deal ? deal.n : s.n}${deal ? " (agreed!)" : ""}${lockedNeed ? ` (boss lv${lockedNeed}+)` : ""}`;
      row.querySelectorAll("span")[1].textContent = `${price}g`;
      if (lockedNeed) {
        const lock = document.createElement("span");
        lock.textContent = "🔒 slay bosses";
        lock.title = `Sealed war-spoils — slay a dungeon boss of level ${lockedNeed}+ to buy this.`;
        lock.style.cssText = "opacity:0.7;font-size:12px;margin-left:6px";
        row.appendChild(lock);
        continue;
      }
      const b = document.createElement("button"); b.textContent = deal ? "Deal 🤝" : "Buy";
      b.onclick = async () => {
        const r = deal ? await T.acceptDeal(p, n) : await T.buy(p, n, s.id, 1, T.ask(n, s.id, p));
        sysBubble(r.ok ? `*${r.msg}*` : `*${r.msg}*`);
        renderTrade(); renderChatHead();
      };
      row.appendChild(b);
    }
    mk("tsec", "Your pack (what they'll pay)");
    const ids = [];
    try { for (const s of (p.inventory || [])) if (window.Items.countItem(p, s.id) > 0 && !ids.includes(s.id)) ids.push(s.id); } catch (e) { }
    if (!ids.length) mk("", "<i>Empty pockets.</i>");
    for (const id of ids) {
      const cnt = window.Items.countItem(p, id);
      let equipped = false;
      try { equipped = window.Items.isEquipped(p, id); } catch (e) { }
      const deal = n.deal && n.deal.side === "sell" && n.deal.id === id ? n.deal : null;
      const pay = deal ? deal.price : T.bid(n, id, p);
      const row = mk("trow", "");
      row.innerHTML = `<span class="tn"></span><span></span> `;
      row.querySelector(".tn").innerHTML = `${iconFor(id)} ${normName(id)} ×${cnt}${equipped ? " (equipped)" : ""}${deal ? " (agreed!)" : ""}`;
      row.querySelectorAll("span")[1].textContent = equipped ? "—" : `${pay}g`;
      const b = document.createElement("button"); b.textContent = deal ? "Deal 🤝" : "Sell";
      b.disabled = equipped;
      b.onclick = async () => {
        const r = deal ? await T.acceptDeal(p, n) : await T.sell(p, n, id, 1, T.bid(n, id, p));
        sysBubble(r.ok ? `*${r.msg}*` : `*${r.msg}*`);
        renderTrade(); renderChatHead();
      };
      row.appendChild(b);
    }
    const hint = mk("", "");
    hint.style.cssText = "opacity:0.7;font-size:12px;margin-top:6px";
    hint.textContent = `Buy straight away: "sell me X" / "can I buy X" — or haggle: "offer 20", "how about 18?", "cheaper?", then "deal". Just a number counts as an offer on the item under discussion.`;
  }
  // shared presentation for haggle results (counter/refuse/accept)
  function presentProposal(r, side, qty, id, offline) {
    const name = normName(id);
    if (r.decision === "accept") return { sys: `*${r.msg}*`, extra: `(Haggle success: ${r.msg} Be pleased.)` };
    if (r.decision === "counter") {
      const verb = r.firm ? "holds firm" : "counters";
      const sys = side === "buy"
        ? `*${chatNpc.name} ${verb}: ${qty}× ${name} for ${r.price}g each. Say "deal" (or press Deal 🤝 in Trade) to accept — or name another price.*`
        : `*${chatNpc.name} ${verb}: ${r.price}g for your ${name}. Say "deal" (or press Deal 🤝 in Trade) to accept — or name another price.*`;
      return offline
        ? { sys, extra: "" }
        : { sys, extra: side === "buy"
          ? `(You ${verb} at ${r.price}g each for ${qty}× ${name}. State EXACTLY ${r.price}g warmly (no other number) and remind them to say "deal".)`
          : `(You ${verb} at ${r.price}g for their ${name}. State EXACTLY ${r.price}g warmly (no other number) and remind them to say "deal".)` };
    }
    if (String(r.msg).startsWith("refuse:")) {
      const lim = r.msg.split(":")[1];
      if (side === "sell") return offline
        ? { sys: `*${chatNpc.name} won't go above ${lim}g for that.*`, extra: "" }
        : { sys: null, extra: `(They ask too much for ${name} — most you'll pay is ${lim}g. Decline in character, name your top price.)` };
      return offline
        ? { sys: `*${chatNpc.name} shakes their head — ${lim}g each is the lowest they'll go.*`, extra: "" }
        : { sys: null, extra: `(They offered too little for ${name} — your floor is ${lim}g each. Refuse in character, name your price.)` };
    }
    if (String(r.msg).startsWith("purse:")) {
      const purse = r.msg.split(":")[1];
      return offline
        ? { sys: `*${chatNpc.name} pats empty pockets — only ${purse}g to spend.*`, extra: "" }
        : { sys: null, extra: `(You only have ${purse}g and can't meet their price. Say so honestly in character.)` };
    }
    return { sys: `*${r.msg}*`, extra: "" };
  }
  // Parse trade intent from a chat line. Returns null (pure chat) or
  // {sys, extra} where sys is a narrator bubble and extra is context for the AI reply.
  async function handleTradeText(text) {
    const n = chatNpc, p = window.Game.G.player, T = window.Trade;
    if (!n || !T) return null;
    T.ensure(n);
    const t = String(text || "").trim();
    let m;
    const offline = !(window.AIDirector && window.AIDirector.hasAI && window.AIDirector.hasAI());
    const itemWord = (id) => normName(id);
    // pronouns + focus: "it/that/this" = whatever is under discussion
    const focusQ = (q) => {
      q = String(q || "").trim();
      if (/^(it|that|this|the one|same one|them)$/i.test(q)) {
        const f = T.focusOf(n);
        if (f) return normName(f.id);
      }
      return q;
    };
    // accept / decline pending deal (broad phrasing: "ok take it", "sold", "i'll take it"...)
    const tClean = t.toLowerCase().replace(/[?.!…]+$/g, "").replace(/\s+/g, " ").trim();
    // NOTE: handover phrases ("here you go", "take this") are NOT accepted
    // here — they fall through to the repeat/handover block below, which
    // accepts a pending deal when one exists or re-runs the focused trade
    // at the last price when none does.
    if (/^(deal|yes|accept|accepted|agreed|i accept|ok|ok deal|ok take it|ok i(?:'ll| will) take it|sure|sure take it|sold|done|deal then|you got a deal|we got a deal|let'?s do it|i(?:'ll| will) take it|i take it|take it|i(?:'ll| will) buy it|i(?:'ll| will) sell(?: it)?|sounds good|agreed then)$/i.test(tClean)) {
      if (!n.deal) {
        // No pending deal — but an explicit deal-word ("deal", "take it",
        // "sold", ...) with something under discussion still completes at
        // the live price. Bare "yes / ok / sure" alone stays pure chat so a
        // casual acknowledgement never spends gold by accident.
        if (!/^(deal|accept|accepted|agreed|sold|done|deal then|we got a deal|you got a deal|take it|i take it|sounds good)$/i.test(tClean)
          && !/^i (will|accept) /i.test(tClean) && !/^i will (buy it|sell)/i.test(tClean)) return null;
        const f0 = T.focusOf(n);
        const cand0 = (f0 && f0.id) ? f0 : (n.lastTrade && n.lastTrade.id ? { side: n.lastTrade.side, id: n.lastTrade.id, n: n.lastTrade.n } : null);
        if (cand0 && cand0.id) {
          let each0 = null;
          const lt0 = n.lastTrade;
          if (lt0 && lt0.id === cand0.id && lt0.side === cand0.side && (lt0.price | 0) > 0) each0 = lt0.price | 0;
          if (cand0.side === "buy") {
            const line0 = (n.stock || []).find(s => s.id === cand0.id);
            if (line0 && (line0.n | 0) > 0) {
              const q0 = Math.min(Math.max(1, (cand0.n | 0) || 1), line0.n | 0);
              if (each0 == null) each0 = T.ask(n, cand0.id, p);
              const r0 = await T.buy(p, n, cand0.id, q0, each0);
              renderTrade(); renderChatHead();
              return { sys: r0.ok ? `*${r0.msg}*` : `*${r0.msg}*`, extra: r0.ok ? `(You just sold them ${q0}× ${itemWord(cand0.id)}. React in character.)` : `(They agreed but: ${r0.msg})` };
            }
          } else {
            let have0 = 0;
            try { have0 = window.Items.countItem(p, cand0.id) | 0; } catch (e) { }
            if (have0 > 0) {
              const q0 = Math.min(Math.max(1, (cand0.n | 0) || 1), have0);
              if (each0 == null) each0 = T.bid(n, cand0.id, p);
              const r0 = await T.sell(p, n, cand0.id, q0, each0);
              renderTrade(); renderChatHead();
              return { sys: r0.ok ? `*${r0.msg}*` : `*${r0.msg}*`, extra: r0.ok ? `(You just bought ${q0}× ${itemWord(cand0.id)} from them. React in character.)` : `(They agreed but: ${r0.msg})` };
            }
          }
        }
        return null;
      }
      const r = await T.acceptDeal(p, n);
      renderTrade(); renderChatHead();
      return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just closed the deal: ${r.msg} Be warm about it.)` : `(The deal fell through: ${r.msg}.)` };
    }
    if (/^(no|no deal|never ?mind|forget it|pass|decline|no thanks)$/i.test(tClean)) {
      if (!n.deal) return null;
      T.declineDeal(n); renderTrade();
      return { sys: "*You let the deal lapse.*", extra: "(They declined your pending offer. Take it gracefully.)" };
    }
    // repeat last trade ("one more", "another one", "again") or handover
    // ("here you go" with no pending deal): re-runs the focused item at the
    // same unit price (pending deal price, else lastTrade price, else live
    // ask/bid) instead of just roleplaying. Number words supported.
    {
      const numWord = (w) => {
        const map = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, a: 1, an: 1 };
        if (w == null) return null;
        const s = String(w).toLowerCase();
        if (/^\d+$/.test(s)) return Math.max(1, parseInt(s, 10));
        return map[s] != null ? map[s] : null;
      };
      let rm = /^(one|two|three|four|five|six|seven|eight|nine|ten|\d+)?\s*(more|another(?: one)?|again|same again)(?:\s+(?:please\s+)?(?:of\s+)?(.+))?$|^do it again$|^same deal$|^repeat$/i.exec(tClean);
      // "here you go" with NO pending deal falls through to here (the accept
      // block above already returned when a deal exists).
      const handover = /^(here( you go| ya go| u go)?|there( you go)?|take this|here you are)$/i.test(tClean) || /^here(?:'s| is) /i.test(tClean) || /^here you go/i.test(tClean);
      if (rm || handover) {
        const f = T.focusOf(n);
        const last = n.lastTrade;
        // Resolve item: explicit remainder wins, else focus, else lastTrade.
        let rid = null, rside = null;
        const rest = (rm && rm[3]) ? String(rm[3]).trim() : "";
        if (rest && !/^(please|thanks|thank you)$/i.test(rest)) {
          const ls = matchStock(n, rest);
          const lp = (!ls) ? matchPlayerItem(p, rest) : null;
          if (ls && !lp) { rid = ls.id; rside = "buy"; }
          else if (lp && !ls) { rid = lp; rside = "sell"; }
          else if (ls && lp) {
            // both sides carry it — follow the existing focus/last side.
            rside = (f && f.id === ls.id) ? f.side : (last && last.id === ls.id) ? last.side : "buy";
            rid = ls.id;
          }
          if (!rid) { /* unknown item — leave to conversation, don't fake it */ }
        }
        if (!rid && f && f.id) { rid = f.id; rside = f.side; }
        if (!rid && last && last.id) { rid = last.id; rside = last.side; }
        if (rid) {
          if (!rside) rside = (f && f.id === rid) ? f.side : (last && last.id === rid) ? last.side : "buy";
          let rqty = null;
          if (rm && rm[1]) rqty = numWord(rm[1]);
          if (rqty == null) rqty = (f && f.id === rid && (f.n | 0) > 0) ? (f.n | 0) : ((last && last.id === rid && (last.n | 0) > 0) ? (last.n | 0) : 1);
          rqty = Math.max(1, Math.min(99, rqty | 0));
          // Pending deal for the same item wins (exact agreed price).
          if (n.deal && n.deal.id === rid && n.deal.side === rside) {
            const r = await T.acceptDeal(p, n);
            renderTrade(); renderChatHead();
            return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just closed the deal: ${r.msg} Be warm about it.)` : `(The deal fell through: ${r.msg}.)` };
          }
          let each = null;
          if (last && last.id === rid && last.side === rside && (last.price | 0) > 0) each = last.price | 0;
          if (rside === "buy") {
            const line = (n.stock || []).find(s => s.id === rid);
            if (!line || (line.n | 0) < 1) return { sys: `*${n.name} is sold out of ${normName(rid)}.*`, extra: `(They asked for another ${normName(rid)} but you're sold out. Say so plainly.)` };
            const qty = Math.min(rqty, line.n | 0);
            if (each == null) each = T.ask(n, rid, p);
            const r = await T.buy(p, n, rid, qty, each);
            renderTrade(); renderChatHead();
            return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just sold them ${qty}× ${itemWord(rid)}. React in character.)` : `(They wanted another ${itemWord(rid)} but: ${r.msg})` };
          } else {
            let have = 0;
            try { have = window.Items.countItem(p, rid) | 0; } catch (e) { }
            if (have < 1) return { sys: `*You have no more ${normName(rid)} to hand over.*`, extra: `(They say "one more / here you go" for ${normName(rid)} but carry none. Say so plainly.)` };
            const qty = Math.min(rqty, have);
            if (each == null) each = T.bid(n, rid, p);
            const r = await T.sell(p, n, rid, qty, each);
            renderTrade(); renderChatHead();
            return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just bought ${qty}× ${itemWord(rid)} from them. React in character.)` : `(They tried to hand over ${itemWord(rid)} but: ${r.msg})` };
          }
        }
        // Repeat/handover with no resolvable item: if it was a bare handover
        // ("here you go") with no focus, leave to conversation; if it was an
        // explicit repeat with no focus, say so plainly.
        if (rm && !handover) {
          return { sys: null, extra: `(They say "${t}" but there is no item under discussion and no last trade. Ask WHICH item they mean — never invent goods.)` };
        }
        // bare handover with nothing to accept — leave to AI roleplay.
      }
    }
    // buy N× item ("buy my X" is a SELL order phrasing — it falls through
    // to the plain-order block below, which is side-aware)
    if (!/^buy\s+my\b/i.test(t) && (m = /^buy (?:(\d+)\s*[x×]?\s+)?(.+?)[?.!…\s]*$/i.exec(t))) {
      const line = matchStock(n, focusQ(m[2]));
      if (!line) return null; // not their goods — leave to conversation
      const qty = Math.min(m[1] ? parseInt(m[1], 10) : 1, line.n);
      const r = await T.buy(p, n, line.id, qty, T.ask(n, line.id, p));
      renderTrade(); renderChatHead();
      return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just sold them ${qty}× ${itemWord(line.id)}. React in character.)` : `(They tried to buy ${itemWord(line.id)} but: ${r.msg})` };
    }
    // sell N× item ("sell me X" is a BUY order phrasing — it falls through
    // to the plain-order block below, which is side-aware; without this guard
    // the fuzzy matcher reads "me X for N" as containing X and sells the
    // player's own goods by accident)
    if (!/^sell\s+me\b/i.test(t) && (m = /^sell (?:(\d+)\s*[x×]?\s+)?(.+?)[?.!…\s]*$/i.exec(t))) {
      const id = matchPlayerItem(p, focusQ(m[2]));
      if (!id) return null;
      const qty = Math.min(m[1] ? parseInt(m[1], 10) : 1, window.Items.countItem(p, id));
      const r = await T.sell(p, n, id, qty, T.bid(n, id, p));
      renderTrade(); renderChatHead();
      return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just bought ${qty}× ${itemWord(id)} from them. React in character.)` : `(They tried to sell ${itemWord(id)} but: ${r.msg})` };
    }
    // offer N [gold] [for [qty] item] — buy proposal if it's their goods,
    // sell proposal if it's yours; bare "offer N" uses the focus item
    if ((m = /^(?:offer|bid|i(?:'ll| will) (?:pay|give you)|i offer)\s+(\d+)\s*(?:g(?:old)?)?(?:\s*for\s+(?:(\d+)\s*[x×]?\s+)?(.+?))?[?.!…\s]*$/i.exec(t))) {
      const hasItem = m[3] != null;
      const f = T.focusOf(n);
      const q = hasItem ? focusQ(m[3]) : (f ? normName(f.id) : null);
      if (!q) return null;
      if (hasItem) {
        // explicit "offer N for X": X in their stock = buy offer, else sell offer
        const line = matchStock(n, q);
        if (line) {
          const qty = Math.min(m[2] ? parseInt(m[2], 10) : 1, line.n);
          const r = await T.proposeBuy(p, n, line.id, qty, parseInt(m[1], 10));
          renderTrade(); renderChatHead();
          return presentProposal(r, "buy", qty, line.id, offline);
        }
        const sid = matchPlayerItem(p, q);
        if (!sid) return null;
        const sr = await T.proposeSell(p, n, sid, 1, parseInt(m[1], 10));
        renderTrade(); renderChatHead();
        return presentProposal(sr, "sell", 1, sid, offline);
      }
      // bare "offer N": follows the focus, never flips sides
      if (!f) return null;
      if (f.side === "buy") {
        const line = matchStock(n, normName(f.id));
        if (!line) {
          const msg = `*${n.name} is sold out of ${normName(f.id)}.*`;
          return offline ? { sys: msg, extra: "" } : { sys: msg, extra: `(They offered on ${normName(f.id)} but you're sold out. Say so plainly.)` };
        }
        const qty = Math.min(f.n || 1, line.n);
        const r = await T.proposeBuy(p, n, line.id, qty, parseInt(m[1], 10));
        renderTrade(); renderChatHead();
        return presentProposal(r, "buy", qty, line.id, offline);
      }
      const sid = matchPlayerItem(p, normName(f.id));
      if (!sid) return null;
      const sqty = Math.min(f.n || 1, window.Items.countItem(p, sid));
      const sr = await T.proposeSell(p, n, sid, sqty, parseInt(m[1], 10));
      renderTrade(); renderChatHead();
      return presentProposal(sr, "sell", sqty, sid, offline);
    }
    // [sell] [my] X for N gold (sell proposal) — tolerant of trailing
    // punctuation and question wrappers ("do you want a potion for 15 gold?").
    // Side-aware: "give me X for N" / "sell me X for N" / "your X for N" is a
    // BUY offer (player wants the NPC's goods); "my X for N" / "take my X" is
    // a SELL offer. Intent decides the order we try, so "give me wood for 1g"
    // never sells the player's wood by accident.
    {
      let u = t.replace(/[?.!…\s]+$/g, "").trim();
      u = u.replace(/^(do you want|would you (?:like|take|want|buy)|will you (?:take|buy)|do you wanna|would you wanna|could you (?:take|buy)|want to buy|wanna buy|interested in|need|want)\s+/i, "").replace(/^(?:to buy|to take)\s+/i, "").trim();
      if ((m = /^(?:(?:sell|give|hand)\s+)?(?:(?:me|you)\s+)?(?:my\s+)?(?:a\s+|an\s+|the\s+)?(?:one\s+piece\s+of\s+|piece\s+of\s+)?(.+?)\s+for\s+(\d+)\s*(?:g(?:old)?)?$/i.exec(u))) {
        const rawQ = focusQ(m[1]);
        const buyIntent = /give me|sell me|your\b|can you give|do you have|\bbuy\b|i(?:'ll| will) buy/i.test(t);
        const sellIntent = /\bmy\b|take my|buy my|i have|i(?:'ve| have) got|from me|\bsell\b|pay me/i.test(t);
        // Explicit "sell me / give me X" is ALWAYS a buy request even though it
        // contains the word "sell" — force the buy side first so shared items
        // (wood/potions on both sides) never sell the player's goods by accident.
        const explicitBuyReq = /(?:sell|give) me|can you (?:give me|sell me)/i.test(t);
        const tryBuyFirst = (buyIntent && !sellIntent) || explicitBuyReq;
        if (tryBuyFirst) {
          const line = matchStock(n, rawQ);
          if (line) {
            // qty words ("one piece of wood") default to 1; leading digits honored.
            let q2 = 1;
            const qm = /^(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i.exec(rawQ);
            if (qm) { const w = qm[1].toLowerCase(); q2 = /^\d+$/.test(w) ? parseInt(w, 10) : ({ one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }[w] || 1); }
            const qty = Math.min(Math.max(1, q2 | 0), line.n);
            const r = await T.proposeBuy(p, n, line.id, qty, parseInt(m[2], 10));
            renderTrade(); renderChatHead();
            return presentProposal(r, "buy", qty, line.id, offline);
          }
          // buy-intent but not their goods — never flip to selling by accident.
        } else {
          const id = matchPlayerItem(p, rawQ);
          if (id) {
            const r = await T.proposeSell(p, n, id, 1, parseInt(m[2], 10));
            renderTrade(); renderChatHead();
            return presentProposal(r, "sell", 1, id, offline);
          }
          // sell parse missed but the goods are on the shelf (e.g. long
          // "can you ... wood for 1g" without a give-me prefix match) — try buy.
          const line = matchStock(n, rawQ);
          if (line) {
            const r = await T.proposeBuy(p, n, line.id, 1, parseInt(m[2], 10));
            renderTrade(); renderChatHead();
            return presentProposal(r, "buy", 1, line.id, offline);
          }
        }
      }
    }
    // Plain purchase / sale orders ("sell me X", "can I buy X", "I want X",
    // "buy my X", "take my X", "I want to sell X"). Questions ("how much",
    // "do you have") skip this and get price info + a deal from the memory
    // fallback below — THESE execute immediately at live ask/bid, exactly
    // like the Trade panel Buy/Sell buttons.
    {
      const tl = String(t || "").trim();
      const tlLow = tl.toLowerCase();
      const questish = /quest|deliver|fetch|package|parcel|cache|report/i.test(tl);
      const numWord2 = (w) => {
        const map = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, a: 1, an: 1 };
        if (w == null) return null;
        const s2 = String(w).toLowerCase();
        if (/^\d+$/.test(s2)) return Math.max(1, parseInt(s2, 10));
        return map[s2] != null ? map[s2] : null;
      };
      const qtyOf = (rawQ) => {
        const qm = /^(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i.exec(String(rawQ || "").trim());
        if (qm) { const v = numWord2(qm[1]); if (v != null) return v; }
        return 1;
      };
      let mOrd = null, ordSide = null;
      if (!questish) {
        if ((mOrd = /^(?:please\s+)?(?:sell me|give me|can you (?:give me|sell me)|can i (?:buy|have|get)|could i (?:buy|have)|may i (?:buy|have)|i want to buy|i would like to buy|i will buy|i(?:'ll| am) (?:buy(?:ing)?|tak(?:ing|e))|let me (?:buy|have))\b\s*(?:your\s+)?(?:a\s+|an\s+|the\s+)?(.+?)[?.!…\s]*$/i.exec(tl))) ordSide = "buy";
        else if ((mOrd = /^(?:please\s+)?(?:buy my|take my|can you buy|will you buy|would you buy|could you buy|do you want to buy|i want to sell|i would like to sell|i will sell|i am selling)\b\s*(?:my\s+)?(?:a\s+|an\s+|the\s+)?(.+?)[?.!…\s]*$/i.exec(tl))) ordSide = "sell";
        else if (!/^(how much|how many|do you have|have you got|what (?:is|are) (?:the )?price|price of|do you sell|what do you (?:sell|have|stock)|tell me about|is there)/i.test(tlLow)
          && (mOrd = /^(?:please\s+)?(?:i want|i need|i would like|i gotta have|gimme)\b\s*(?:your\s+)?(?:a\s+|an\s+|the\s+)?(.+?)[?.!…\s]*$/i.exec(tl))) ordSide = "buy";
      }
      if (mOrd && ordSide) {
        const rawQ = focusQ(mOrd[1]);
        if (ordSide === "buy") {
          const line = matchStock(n, rawQ);
          if (line) {
            const qty = Math.min(Math.max(1, qtyOf(rawQ) | 0), line.n);
            const r = await T.buy(p, n, line.id, qty, T.ask(n, line.id, p));
            renderTrade(); renderChatHead();
            return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just sold them ${qty}× ${itemWord(line.id)}. React in character.)` : `(They tried to buy ${itemWord(line.id)} but: ${r.msg})` };
          }
        } else {
          const sid = matchPlayerItem(p, rawQ);
          if (sid) {
            const qty = Math.min(Math.max(1, qtyOf(rawQ) | 0), window.Items.countItem(p, sid));
            const r = await T.sell(p, n, sid, qty, T.bid(n, sid, p));
            renderTrade(); renderChatHead();
            return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just bought ${qty}× ${itemWord(sid)} from them. React in character.)` : `(They tried to sell ${itemWord(sid)} but: ${r.msg})` };
          }
        }
        // Item named but not found on the expected side — fall through to the
        // memory fallback so the reply names the real stock instead of nothing.
      }
    }
    // bare number = offer on whatever is under discussion ("24", "how about 20?")
    if ((m = /^(?:how about |what about |about |maybe |say )?(\d+)\s*(?:g(?:old)?)?\s*[?.!…]*$/i.exec(t))) {
      const f = T.focusOf(n);
      if (!f) return null;
      const num = parseInt(m[1], 10);
      if (n.deal && num === n.deal.price) {
        const r = await T.acceptDeal(p, n);
        renderTrade(); renderChatHead();
        return { sys: r.ok ? `*${r.msg}*` : `*${r.msg}*`, extra: r.ok ? `(You just closed the deal: ${r.msg} Be warm about it.)` : `(The deal fell through: ${r.msg}.)` };
      }
      const r = f.side === "buy"
        ? await T.proposeBuy(p, n, f.id, f.n, num)
        : await T.proposeSell(p, n, f.id, f.n, num);
      renderTrade(); renderChatHead();
      return presentProposal(r, f.side, f.n, f.id, offline);
    }
    // discount plea ("cheaper?", "too expensive", "best price?")
    // DECISION FIRST: memory (loyalty + past pleas) decides whether the NPC
    // bends — the price moves game-side before the AI replies, and the reply
    // must echo the decided number exactly.
    if (/^(cheaper|lower|discount|best price\??|too (?:expensive|pricey|much)|that'?s too much|too rich(?: for my blood)?|can you (?:do|go) (?:any )?lower|cut me a deal|any (?:room|wiggle room))[\?.!…]*$/i.test(t)) {
      const f = T.focusOf(n);
      if (!f) return null;
      try {
        const dec = T.decideConcession ? T.decideConcession(p, n, f) : { changed: false };
        if (dec && dec.changed) {
          renderTrade(); renderChatHead();
          try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) { }
          return { sys: dec.sys, extra: dec.extra };
        }
      } catch (e) { }
      if (f.side === "buy") {
        const a = T.ask(n, f.id, p), floor = T.minAsk(n, f.id, p);
        return offline
          ? { sys: `*${n.name} holds firm — ${a}g for ${normName(f.id)} (lowest ${floor}g).*`, extra: "" }
          : { sys: null, extra: `(They plead for a lower price on ${normName(f.id)} (your list ${a}g, floor ${floor}g). If their loyalty (${n.loyalty | 0}) is high you may concede a gold or two toward the floor as a firm counter; otherwise hold at ${a}g. They must name the number — then say "deal".)` };
      }
      const b = T.bid(n, f.id, p), ceil = T.maxPay(n, f.id, p);
      return offline
        ? { sys: `*${n.name} won't budge past ${b}g for that (at most ${ceil}g).*`, extra: "" }
        : { sys: null, extra: `(They want more for ${normName(f.id)} (you pay ${b}g, ceiling ${ceil}g). You may rise a little toward the ceiling if they're loyal; otherwise hold at ${b}g. They must name the number.)` };
    }
    return null;
  }

  // ---------- party modal (tabbed: you + one tab per companion) ----------
  // kind tabs (people / beasts / rooms) + boxes + detail pane per entry
  let partyTab = "player"; // "player" | npc id | "recruit" (people view)
  let partySection = "friends"; // top-level kind: "friends" | "beasts" | "rooms"
  let beastTab = null; // selected tame id (beasts view)
  function tamesOf(p) {
    let ts = [];
    try { window.Entities.ensureProgression(p); ts = (p.tames || []).filter(t => t); }
    catch (e) { try { ts = (p.tames || []).filter(t => t); } catch (e2) { ts = []; } }
    // with-you first, then lodged — the old section order, now as boxes
    try { if (Array.isArray(ts)) ts = ts.slice().sort((a, b) => ((a.stabled ? 1 : 0) - (b.stabled ? 1 : 0))); } catch (e) { }
    return ts;
  }
  function toggleParty(force, tab) {
    const m = $("partyModal");
    const show = force !== undefined ? force : m.hidden;
    if (tab !== undefined) {
      // tame ids deep-link straight to their beast box (parity with friend tabs)
      let isTame = false;
      try {
        const p0 = window.Game && window.Game.G ? window.Game.G.player : null;
        isTame = !!(p0 && (p0.tames || []).some(t => t && t.id === tab));
      } catch (e) { }
      if (isTame) { partySection = "beasts"; beastTab = tab; }
      else partyTab = tab;
    }
    m.hidden = !show;
    if (!m.hidden) renderParty();
  }
  function selectPartyTab(tab) {
    partyTab = tab;
    try { renderParty(); } catch (e) { }
  }
  function selectBeastTab(id) {
    beastTab = id;
    try { renderParty(); } catch (e) { }
  }
  function selectPartySection(sec) {
    partySection = sec;
    try { renderParty(); } catch (e) { }
  }
  function selectPartyTabByIndex(i) {
    try {
      const p = window.Game.G.player;
      if (!p) return;
      if (partySection === "beasts") {
        const ts = tamesOf(p);
        if (i >= 0 && i < ts.length) selectBeastTab(ts[i].id);
        return;
      }
      if (partySection === "rooms") return;
      const ids = ["player", ...partyNpcs(p).map(n => n.id)];
      if (partyNpcs(p).length < mpPartyCap()) ids.push("recruit");
      if (i >= 0 && i < ids.length) selectPartyTab(ids[i]);
    } catch (e) { }
  }
  function partyNpcs(p) {
    const out = [];
    try {
      for (const id of (p.party || [])) {
        const n = window.World._mem.npcs.get(id);
        if (n) out.push(n);
      }
    } catch (e) { }
    return out;
  }
  function portraitCanvas(ent, size, isPlayer) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    try {
      const src = isPlayer
        ? window.Sprites.drawPortrait({ kind: "player", id: (ent && ent.tag) || (ent && ent.name) || "x", name: (ent && ent.name) || "Wanderer", role: (ent && ent.role) || "adventurer", tint: (ent && ent.tint) || "#4da3ff", equipment: (ent && ent.equipment) || null, hotbar: (ent && ent.hotbar) || null, offhandSlot: (ent && ent.offhandSlot), appearance: (ent && (ent.appearance || ent.app)) || null }, size)
        : window.Sprites.drawPortrait(ent, size);
      cv.getContext("2d").drawImage(src, 0, 0);
    } catch (e) { }
    return cv;
  }
  // tiny builders (theme-safe: reuse .trow rows + .psec section cards)
  function pSec(body, title, sub) {
    const s = document.createElement("div");
    s.className = "psec";
    const h = document.createElement("div");
    h.className = "psec-h"; h.textContent = title;
    s.appendChild(h);
    if (sub) {
      const u = document.createElement("div");
      u.className = "psec-sub"; u.textContent = sub;
      s.appendChild(u);
    }
    body.appendChild(s);
    return s;
  }
  function pRow(text) {
    const r = document.createElement("div");
    r.className = "trow";
    r.innerHTML = `<span class="tn"></span>`;
    r.querySelector(".tn").textContent = text;
    return r;
  }
  // icon-bearing rows (item/ability names are static code data, safe for HTML)
  function pRowHtml(html) {
    const r = document.createElement("div");
    r.className = "trow";
    r.innerHTML = `<span class="tn"></span>`;
    try { r.querySelector(".tn").innerHTML = html; } catch (e) { r.querySelector(".tn").textContent = html; }
    return r;
  }
  function pBtn(row, label, fn, ghost, title) {
    const b = document.createElement("button");
    b.textContent = label;
    if (ghost) b.className = "ghost";
    if (title) b.title = title;
    b.onclick = fn;
    row.appendChild(b);
    return b;
  }
  function pBar(pct, cls) {
    const d = document.createElement("div");
    d.className = "pbar " + cls;
    const f = document.createElement("div");
    f.style.width = Math.max(0, Math.min(100, pct)) + "%";
    d.appendChild(f);
    return d;
  }
  function renderParty() {
    const p = window.Game.G.player;
    if (!p) return;
    const members = partyNpcs(p);
    const max = mpPartyCap();
    if (partyTab !== "player" && partyTab !== "recruit" && !members.some(n => n.id === partyTab)) partyTab = "player";
    const tames = tamesOf(p);
    if (!tames.some(t => t.id === beastTab)) beastTab = tames.length ? tames[0].id : null;
    renderPartyKindNav(p, members, max, tames);
    renderPartyTabs(p, members, max, tames);
    const body = $("partyList");
    body.innerHTML = "";
    renderPartyBanner(body, p, members, max);
    if (partySection === "beasts") renderBeastPane(body, p, tames);
    else if (partySection === "rooms") { try { renderInnSection(body, p); } catch (e) { } }
    else if (partyTab === "player") renderPlayerPane(body, p, members, max);
    else if (partyTab === "recruit") renderRecruitPane(body, p, members, max);
    else {
      const npc = members.find(n => n.id === partyTab);
      if (npc) renderMemberPane(body, p, npc, members, max);
    }
    try {
      const nTabs = partySection === "beasts" ? tames.length : 1 + members.length + (members.length < max ? 1 : 0);
      const aN = tames.filter(t => !t.stabled).length, sN = tames.filter(t => t.stabled).length;
      $("partyHint").textContent = `${members.length}/${max} friends · ${aN}+${sN} beasts · keys 1-${Math.min(9, Math.max(nTabs, 1))} switch`;
    } catch (e) { }
  }
  function partyNextStep(p, members, max) {
    // one-line beginner guidance: most urgent thing first
    try {
      if (p.hp < p.maxHp * 0.5) return "🩸 You're hurt — drink a potion below, or find a healer (💚).";
      const down = members.find(n => n.hp <= 0 && !(n.isDoppelganger && n.doppelRevealed));
      if (down) return `💀 ${down.name.split(" ")[0]} is down — open their tab to Revive them.`;
      const hurt = members.find(n => n.hp > 0 && n.hp < n.maxHp * 0.5 && !(n.isDoppelganger && n.doppelRevealed));
      if (hurt) return `🩸 ${hurt.name.split(" ")[0]} is hurt — open their tab and Heal them.`;
      const lost = members.find(n => {
        try {
          if (n.hp <= 0) return false;
          return Math.hypot(((n.x ?? n.gx) - p.x), ((n.y ?? n.gy) - p.y)) > 12;
        } catch (e) { return false; }
      });
      if (lost) return `📯 ${lost.name.split(" ")[0]} is far away — hit 📯 Summon party below.`;
      let partyPts = (p.statPoints | 0);
      try { partyPts += window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : (p.skillPoints | 0); } catch (e) { partyPts += (p.skillPoints | 0); }
      if (partyPts > 0) return "⬆️ You have points to spend — press 👤 Character (C).";
      if (!members.length) return "💛 No friends yet — talk to villagers (E), raise 💛 to 20, then Recruit.";
      if (members.length < max) return `💛 ${max - members.length} bedroll${max - members.length === 1 ? "" : "s"} free — more friends = easier fights.`;
      return "✅ Full team! Keep them fed with potions and gear.";
    } catch (e) { return ""; }
  }
  function renderPartyBanner(body, p, members, max) {
    const b = document.createElement("div");
    b.className = "party-banner";
    const dots = "●".repeat(members.length) + "○".repeat(Math.max(0, max - members.length));
    b.innerHTML = `<div></div>`;
    const top = b.querySelector("div");
    const xpShare = Math.round(((window.CFG && window.CFG.XP_SHARE) || 0.6) * 100);
    top.innerHTML = `<b>Your team:</b> you + ${members.length} friend${members.length === 1 ? "" : "s"} <span class="dots">${dots}</span> <span style="opacity:.75">(${members.length}/${max} · share ${xpShare}% XP)</span>`;
    const nx = document.createElement("div");
    nx.className = "party-next";
    nx.textContent = partyNextStep(p, members, max);
    b.appendChild(nx);
    if (members.length) {
      const row = document.createElement("div");
      row.className = "party-nav";
      const sb = document.createElement("button");
      const alive = members.filter(n => n.hp > 0).length;
      sb.textContent = `📯 Summon party (${alive} alive)`;
      sb.title = "Teleport living friends to your side — frees anyone stuck in terrain or left behind";
      sb.onclick = () => {
        try { window.Game.summonParty(); } catch (e) { }
        try { renderParty(); } catch (e2) { }
      };
      row.appendChild(sb);
      b.appendChild(row);
    }
    body.appendChild(b);
  }
  // top kind switch: people, beasts, or rooms — one tap from the top, no scrolling
  function renderPartyKindNav(p, members, max, tames) {
    const nav = $("partyKindNav");
    if (!nav) return;
    nav.innerHTML = "";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Party view: people, beasts, rooms");
    let tameActive = 0, tameStabled = 0;
    try {
      const ts = tames || tamesOf(p);
      tameActive = ts.filter(t => !t.stabled).length;
      tameStabled = ts.filter(t => t.stabled).length;
    } catch (e) { }
    let innUsed = 0, innUnlock = 0;
    try { innUnlock = window.Game.innUnlockEnsure(p) | 0; } catch (e) { }
    try { for (const id of (p.innRooms || [])) if (id) innUsed++; } catch (e) { }
    const mk = (key, label, title) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.title = title;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", partySection === key ? "true" : "false");
      if (partySection === key) b.classList.add("active");
      b.onclick = () => selectPartySection(key);
      nav.appendChild(b);
    };
    mk("friends", `🧑‍🤝‍🧑 People (${members.length}/${max})`, "You and your human companions");
    mk("beasts", `💛 Beasts (${tameActive}+${tameStabled})`, "Tamed beasts with you + stabled — same boxes-and-detail as people");
    mk("rooms", `🛏️ Rooms (${innUsed}/${innUnlock})`, "Retired friends resting at inns worldwide");
  }
  function beastPortrait(t, size) {
    // beasts carry no role banner (stable modal uses the same hideRole call)
    try { return window.Sprites.drawPortrait(t, size, true); }
    catch (e) { const c = document.createElement("canvas"); c.width = c.height = size; return c; }
  }
  // beast boxes: one tab per tame, same shape as the people tabs above
  function renderBeastTabs(tabs, p, tames) {
    tabs.setAttribute("aria-label", "Tamed beasts");
    if (!tames.length) return; // empty help lives in the pane below
    for (const t of tames) {
      const dead = !(t.hp > 0);
      const mountable = (() => { try { return window.Entities.isMountKind(t.kind); } catch (e) { return false; } })();
      const riding = (() => { try { return p.activeMountId === t.id && p.mounted; } catch (e) { return false; } })();
      let riderName = null;
      try {
        if (t.riderId && window.Game && window.Game.G) {
          const rn = (window.Game.G.npcs || []).find(n => n && n.id === t.riderId);
          riderName = rn ? String(rn.name || "friend").split(" ")[0] : "a friend";
        }
      } catch (e) { }
      const state = dead ? "down!" : riding ? "ridden" : t.stabled ? "stabled" : riderName ? `lends ${riderName}` : "with you";
      const b = document.createElement("button");
      b.className = "ptab beast" + (beastTab === t.id ? " active" : "") + (dead ? " dead" : "");
      b.title = `${t.name} (lv ${t.lv || 1} ${t.kind || "beast"}) — tab (pick who to help)`;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", beastTab === t.id ? "true" : "false");
      b.onclick = () => selectBeastTab(t.id);
      b.appendChild(beastPortrait(t, 76));
      const meta = document.createElement("span");
      meta.className = "pt-meta";
      const nm = document.createElement("div");
      nm.className = "pt-nm"; nm.textContent = `${(t.name || "?").split(" ")[0]}`;
      const lv = document.createElement("div");
      lv.className = "pt-lv"; lv.textContent = `Level ${t.lv || 1}`;
      const sb = document.createElement("div");
      sb.className = "pt-sub"; sb.textContent = `${dead ? "💀" : riding ? "🐴" : mountable ? "🐴" : "💛"} ${state}`;
      const bar = document.createElement("div");
      bar.className = "pt-hpbar";
      const fill = document.createElement("div");
      fill.style.width = Math.max(0, Math.min(100, (t.hp / (t.maxHp || 1)) * 100)) + "%";
      if (dead) fill.style.background = "#555";
      bar.appendChild(fill);
      meta.appendChild(nm); meta.appendChild(lv); meta.appendChild(sb); meta.appendChild(bar);
      b.appendChild(meta);
      tabs.appendChild(b);
    }
  }
  function renderPartyTabs(p, members, max, tames) {
    const tabs = $("partyTabs");
    if (!tabs) return;
    tabs.innerHTML = "";
    if (partySection === "rooms") { tabs.style.display = "none"; return; }
    tabs.style.display = "";
    if (partySection === "beasts") { renderBeastTabs(tabs, p, tames || tamesOf(p)); return; }
    tabs.setAttribute("aria-label", "Party members");
    const addTab = (key, name, lvl, sub, hpPct, ent, isPlayer, dead, title) => {
      const b = document.createElement("button");
      b.className = "ptab" + (partyTab === key ? " active" : "") + (dead ? " dead" : "");
      b.title = (title || name) + " — tab (pick who to help)";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", partyTab === key ? "true" : "false");
      b.onclick = () => selectPartyTab(key);
      b.appendChild(portraitCanvas(ent, 76, isPlayer));
      const meta = document.createElement("span");
      meta.className = "pt-meta";
      const nm = document.createElement("div");
      nm.className = "pt-nm"; nm.textContent = name;
      const lv = document.createElement("div");
      lv.className = "pt-lv"; lv.textContent = lvl;
      const sb = document.createElement("div");
      sb.className = "pt-sub"; sb.textContent = sub;
      const bar = document.createElement("div");
      bar.className = "pt-hpbar";
      const fill = document.createElement("div");
      fill.style.width = Math.max(0, Math.min(100, hpPct)) + "%";
      if (dead) fill.style.background = "#555";
      bar.appendChild(fill);
      meta.appendChild(nm); meta.appendChild(lv); meta.appendChild(sb); meta.appendChild(bar);
      b.appendChild(meta);
      tabs.appendChild(b);
    };
    addTab("player", `${(p.name || "You").split(" ")[0]}`, `Level ${p.lv || 1}`, `you · ${p.role || "adventurer"}`, (p.hp / (p.maxHp || 1)) * 100, p, true, p.hp <= 0, "Your hero (1)");
    members.forEach((n, i) => {
      try {
        if (n && n.isDoppelganger && n.doppelRevealed) {
          const was = n.disguiseName ? `was ${String(n.disguiseName).split(" ")[0]}` : "teeth";
          addTab(n.id, `🦷 Doppelganger`, `Level ${n.lv || 1} · ${was}`, `REVEALED — dismiss only!`, (n.hp / (n.maxHp || 1)) * 100, n, false, n.hp <= 0, `Doppelganger (${was}) — revealed`);
          try {
            const last = tabs.lastChild;
            if (last) { last.classList.add("doppel"); last.style.animation = "doppelBlink 1s infinite"; last.style.borderColor = "#ff3b3b"; }
          } catch (e) { }
          return;
        }
      } catch (e) { }
      addTab(n.id, `${(n.name || "?").split(" ")[0]}`, `Level ${n.lv || 1}`, `${n.role || "?"}${n.hp <= 0 ? " · down!" : ""}`, (n.hp / (n.maxHp || 1)) * 100, n, false, n.hp <= 0, `${n.name} (${i + 2})`);
    });
    if (members.length < max) {
      const b = document.createElement("button");
      b.className = "ptab empty" + (partyTab === "recruit" ? " active" : "");
      b.title = "How to recruit — tab (pick who to help)";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", partyTab === "recruit" ? "true" : "false");
      b.innerHTML = `<span class="pt-plus">＋</span><span class="pt-meta"><div class="pt-nm">Recruit</div><div class="pt-sub"></div></span>`;
      b.querySelector(".pt-sub").textContent = `${max - members.length} slot${max - members.length === 1 ? "" : "s"} open`;
      b.onclick = () => selectPartyTab("recruit");
      tabs.appendChild(b);
    }
  }
  function renderPlayerPane(body, p, members, max) {
    // ---- you ----
    const sec = pSec(body, `🧍 ${(p.name || "Wanderer").split(" ")[0]} — that's you`, "Your hero. This is your home tab — friends live on the tabs above.");
    const head = document.createElement("div");
    head.className = "phead";
    head.appendChild(portraitCanvas(p, 120, true));
    const info = document.createElement("div");
    info.style.flex = "1"; info.style.minWidth = "0";
    const nm = document.createElement("div");
    nm.className = "ph-nm"; nm.textContent = `${p.name || "Wanderer"}`;
    info.appendChild(nm);
    const lvL = document.createElement("div");
    lvL.className = "ph-lv"; lvL.textContent = `Level ${p.lv || 1} · ${p.role || "adventurer"}`;
    info.appendChild(lvL);
    try {
      const xp = document.createElement("div");
      xp.className = "ph-sub";
      xp.textContent = `XP ${p.xp || 0}/${window.CFG.xpNext(p.lv || 1)} · ⚔️ ${p.atk} ATK · 🔮 ${p.matk | 0} MATK · 🛡️ ${p.def} DEF · 🪙 ${p.gold | 0}`;
      info.appendChild(xp);
    } catch (e) { }
    const hpT = document.createElement("div");
    hpT.className = "pstatline"; hpT.textContent = `❤️ Health ${Math.ceil(p.hp)}/${p.maxHp}`;
    info.appendChild(hpT);
    info.appendChild(pBar((p.hp / (p.maxHp || 1)) * 100, "pbar-hp"));
    const mpT = document.createElement("div");
    mpT.className = "pstatline"; mpT.textContent = `💧 Mana ${Math.ceil(p.mp)}/${p.maxMp} (spells need this)`;
    info.appendChild(mpT);
    info.appendChild(pBar((p.mp / (p.maxMp || 1)) * 100, "pbar-mp"));
    head.appendChild(info);
    sec.appendChild(head);
    // active buffs & debuffs (live: refreshed by the fx ticker while open)
    try {
      const fx = document.createElement("div");
      fx.className = "fx-row";
      fx.setAttribute("data-fxfor", "player");
      sec.appendChild(fx);
      paintFx(fx, p);
    } catch (e) { }
    const acts = document.createElement("div");
    acts.className = "bigact";
    let pts = (p.statPoints | 0);
    try { pts += window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : (p.skillPoints | 0); } catch (e) { pts += (p.skillPoints | 0); }
    const b1 = document.createElement("button");
    b1.textContent = pts > 0 ? `👤 Spend ${pts} point${pts === 1 ? "" : "s"} (C)` : "👤 Stats & spells (C)";
    b1.onclick = () => { toggleParty(false); toggleChar(true); };
    acts.appendChild(b1);
    const b2 = document.createElement("button");
    b2.textContent = "🎒 Change gear (I)";
    b2.className = "ghost";
    b2.onclick = () => { toggleParty(false); toggleInv(true); };
    acts.appendChild(b2);
    sec.appendChild(acts);
    // ---- quick care in plain words ----
    const care = pSec(body, "💚 Feel better", "Red heals health · blue refills mana for spells.");
    const pot = window.Items.countItem(p, "potion");
    const mpot = window.Items.countItem(p, "mana_potion");
    if (!pot && !mpot) {
      const e = document.createElement("div");
      e.className = "invempty";
      e.textContent = "Pockets empty. Healers sell potions — or brew them from 🌿 herbs (🎒 Inventory → 🔨 Crafting).";
      care.appendChild(e);
    } else {
      if (pot > 0) {
        const r = pRow(`🧪 Red potion ×${pot} — drinks to refill half your health`);
        pBtn(r, "Drink", () => { const x = window.Items.useItem(p, "potion"); toast(x.msg); updateHUD(); updateHotbar(); renderParty(); });
        care.appendChild(r);
      }
      if (mpot > 0) {
        const r = pRow(`🔮 Blue draught ×${mpot} — drinks to refill mana`);
        pBtn(r, "Drink", () => { const x = window.Items.useItem(p, "mana_potion"); toast(x.msg); updateHUD(); updateHotbar(); renderParty(); });
        care.appendChild(r);
      }
    }
    // ---- your camp, one thing at a time: friends / beasts / inn rooms ----
    // ---- friends list lives here; beasts + rooms have their own top tabs now ----
    {
      // ---- friends list: big tap targets ----
      const cp = pSec(body, `🧑‍🤝‍🧑 Friends (${members.length}/${max})`, members.length ? "Tap Manage to heal, gear up or teach a friend." : "Nobody yet — that's OK! The ＋ Recruit tab shows how.");
      if (!members.length) {
        const r = pRow("💛 Empty bedrolls. Villagers love joining strong, kind heroes.");
        pBtn(r, "How to recruit →", () => selectPartyTab("recruit"));
        cp.appendChild(r);
      }
      for (const n of members) {
        const state = n.hp <= 0 ? "💀 Down — needs Revive" : n.hp < n.maxHp * 0.5 ? "🩸 Hurt — needs healing" : "✅ Ready";
        const row = pRow("");
        const tn = row.querySelector(".tn");
        tn.innerHTML = "";
        const fnm = document.createElement("div");
        fnm.className = "pt-nm"; fnm.textContent = `${n.hp <= 0 ? "💀" : "🙂"} ${n.name}`;
        const flv = document.createElement("div");
        flv.className = "pt-lv"; flv.textContent = `Level ${n.lv} · ${n.role} — ${state}`;
        tn.appendChild(fnm); tn.appendChild(flv);
        tn.title = `${n.name} (${n.role} lv${n.lv})`;
        pBtn(row, "Manage →", () => selectPartyTab(n.id));
        cp.appendChild(row);
      }
      let tameN = 0, roomN = 0;
      try { tameN = (p.tames || []).filter(t => t).length; } catch (e) { }
      try { roomN = (p.innRooms || []).filter(id => id).length; } catch (e) { }
      if (tameN || roomN) {
        const hint = pRow(`${tameN ? `💛 ${tameN} beast${tameN === 1 ? "" : "s"} live under 💛 Beasts above` : ""}${tameN && roomN ? " · " : ""}${roomN ? `🛏️ ${roomN} retired under 🛏️ Rooms above` : ""} — no scrolling needed.`);
        cp.appendChild(hint);
      }
    }
  }
  function reviveTame(p, t, fee) {
    if (!t || !(t.hp <= 0)) return;
    if ((p.lv || 1) < (t.lv || 1)) { toast(`Too strong to revive — reach lv ${t.lv} first (you're lv ${p.lv}).`); return; }
    if (p.gold < fee) { toast(`Need ${fee} gold.`); return; }
    p.gold -= fee; t.hp = Math.round(t.maxHp * 0.5); t.mp = t.maxMp;
    try { window.Game.saveGame(true); } catch (e) {}
    try { renderParty(); updateHUD(); } catch (e) { }
    toast(`💛 ${t.name} stirs back to life!`);
  }
  // ---------- beasts view: boxes on top (renderBeastTabs) + one beast's pane below ----------
  // Parity with party members: big portrait header, bars, big actions, quiet extras.
  function renderBeastPane(body, p, tames) {
    tames = tames || tamesOf(p);
    if (!tames.length) {
      const s = pSec(body, "💛 Tamed beasts (none yet)", "Beasts fight beside you, carry you, and can be lent to friends.");
      const r = pRow("No beasts yet — weaken a wolf, horse or crab until it submits 💛 (below 25% HP — only a chance to give up, so keep weakening it carefully). Press E fast — hitting it again can kill it, so be quick!");
      s.appendChild(r);
      try {
        const along = window.Entities.tameSlots ? window.Entities.tameSlots(p) : 1;
        const h = document.createElement("div");
        h.className = "invempty";
        h.textContent = `Up to ${along} beast${along === 1 ? "" : "s"} travel${along === 1 ? "s" : ""} with you (Ride / Dismount them here); the rest wait in a 🐴 Stable. Grow 🐾 Taming (C) for more slots, insects, and bigger game.`;
        s.appendChild(h);
      } catch (e) { }
      return;
    }
    const t = tames.find(x => x && x.id === beastTab) || tames[0];
    const ids = tames.map(x => x.id);
    const idx = Math.max(0, ids.indexOf(t.id));
    // prev/next (the boxes above are the list — mirrors member Prev/Next)
    if (ids.length > 1) {
      const nav = document.createElement("div");
      nav.className = "party-nav";
      const prev = document.createElement("button");
      prev.textContent = "◀ Prev";
      prev.className = "ghost";
      prev.title = "Previous beast";
      prev.onclick = () => selectBeastTab(ids[(idx - 1 + ids.length) % ids.length]);
      nav.appendChild(prev);
      const pos = document.createElement("span");
      pos.className = "pt-lv";
      pos.style.alignSelf = "center";
      pos.textContent = `Beast ${idx + 1} of ${ids.length}`;
      nav.appendChild(pos);
      const next = document.createElement("button");
      next.textContent = "Next ▶";
      next.className = "ghost";
      next.title = "Next beast";
      next.onclick = () => selectBeastTab(ids[(idx + 1) % ids.length]);
      nav.appendChild(next);
      body.appendChild(nav);
    }
    const dead = !(t.hp > 0);
    const mountable = (() => { try { return window.Entities.isMountKind(t.kind); } catch (e) { return false; } })();
    const riding = (() => { try { return p.activeMountId === t.id && p.mounted; } catch (e) { return false; } })();
    const loose = (() => { try { return p.activeMountId === t.id && !p.mounted; } catch (e) { return false; } })();
    let riderName = null;
    try {
      if (t.riderId && window.Game && window.Game.G) {
        const rn = (window.Game.G.npcs || []).find(n => n && n.id === t.riderId);
        riderName = rn ? String(rn.name || "friend").split(" ")[0] : "a friend";
      }
    } catch (e) { }
    const icon = dead ? "💀" : riding ? "🐴" : mountable ? "🐴" : "💛";
    const status = dead ? "💀 Down — needs Revive" : riding ? "🐴 Ridden — carries you" : t.breeding ? "🧬 At a beast lodge — breeding" : riderName ? `🐴 Carries ${riderName} — lent out` : t.stabled ? "🐴 Lodged at a Stable" : loose ? "✅ Your mount (standing by)" : "✅ With you";
    // ---- header box (mirrors the member header) ----
    const sec = pSec(body, `${icon} ${(t.name || "?").split(" ")[0]}`, `${status}`);
    const lvlD = document.createElement("div");
    lvlD.className = "ph-lv";
    lvlD.textContent = `Level ${t.lv || 1} · ${t.kind || "beast"}${mountable ? " · rides" : ""}`;
    try { sec.insertBefore(lvlD, sec.children[1] || null); } catch (e) { try { sec.appendChild(lvlD); } catch (e2) { } }
    const head = document.createElement("div");
    head.className = "phead";
    if (dead) head.style.opacity = "0.7";
    head.appendChild(beastPortrait(t, 120));
    const info = document.createElement("div");
    info.style.flex = "1"; info.style.minWidth = "0";
    const hpT = document.createElement("div");
    hpT.className = "pstatline"; hpT.textContent = dead ? "💀 Down — needs Revive" : `❤️ Health ${Math.ceil(Math.max(0, t.hp))}/${t.maxHp}`;
    info.appendChild(hpT);
    info.appendChild(pBar((t.hp / (t.maxHp || 1)) * 100, "pbar-hp"));
    const mpT = document.createElement("div");
    mpT.className = "pstatline"; mpT.textContent = `💧 Mana ${Math.ceil(Math.max(0, t.mp || 0))}/${t.maxMp || 0}`;
    info.appendChild(mpT);
    info.appendChild(pBar(((t.mp || 0) / (t.maxMp || 1)) * 100, "pbar-mp"));
    const st = document.createElement("div");
    st.className = "pstatline";
    const sp = (t.spd != null ? t.spd : 3);
    st.textContent = `⚔️ ${t.atk} attack · 🔮 ${t.matk != null ? t.matk : t.atk} MATK · 🛡️ ${t.def} defence · SDEF ${t.sdef != null ? t.sdef : 0} · SPD ${(typeof sp === "number" ? sp.toFixed(1) : sp)}`;
    info.appendChild(st);
    head.appendChild(info);
    sec.appendChild(head);
    try {
      const fx = document.createElement("div");
      fx.className = "fx-row";
      fx.setAttribute("data-fxfor", t.id);
      sec.appendChild(fx);
      paintFx(fx, t);
    } catch (e) { }
    // ---- big actions (mirrors member look-after-them) ----
    const acts = pSec(body, dead ? "🆘 1 · Bring them back" : "🩹 1 · Look after them", dead ? "Revive costs 50 gold and needs your level to be at least theirs." : "Ride, take back, stable or rename — right here, no stable trip needed.");
    const big = document.createElement("div");
    big.className = "bigact";
    if (dead) {
      const rb = document.createElement("button");
      rb.textContent = `✨ Revive — 50g (needs lv ${t.lv || 1})`;
      rb.title = `You are lv ${p.lv || 1}. Revive only works if your level is ${t.lv || 1} or higher. Costs 50 gold.`;
      rb.onclick = () => { reviveTame(p, t, 50); };
      big.appendChild(rb);
    } else if (t.breeding) {
      const note = pRow("🧬 Lodged at a beast lodge — collect parents + offspring at its Breed tab.");
      acts.appendChild(note);
    } else {
      if (mountable && !riderName) {
        const rb = document.createElement("button");
        rb.textContent = riding ? "Dismount" : "Ride 🐴";
        rb.title = riding ? "Dismount (it stays close by)" : "Ride this beast anywhere — rests whoever you're riding";
        rb.onclick = () => {
          let r = null;
          try { r = window.Game.toggleMount(t.id); } catch (e) { }
          if (r && !r.ok) toast("⚠️ " + (r.msg || "Couldn't ride."));
          try { renderParty(); updateHUD(); } catch (e) { }
        };
        big.appendChild(rb);
      }
      if (riderName) {
        const tb = document.createElement("button");
        tb.textContent = `Take back from ${riderName}`;
        tb.title = "Take the lent beast back (yours if your saddle is empty, else lodged)";
        tb.onclick = () => {
          let r = null;
          try { r = window.Game.unassignMountFromMember(t.riderId); } catch (e) { }
          if (r && !r.ok) toast("⚠️ " + (r.msg || "Couldn't take it back."));
          try { renderParty(); updateHUD(); } catch (e) { }
        };
        big.appendChild(tb);
      }
    }
    acts.appendChild(big);
    // ---- quiet rows: stable / find / name / release ----
    if (!t.breeding && !dead) {
      if (!t.stabled) {
        const sr = pRow("Rest them at a Stable (fetch or ride them back from anywhere).");
        pBtn(sr, "Stable", () => {
          let r = null;
          try { r = window.Game.storeTameAtStable(t.id); } catch (e) { }
          if (r && !r.ok) toast("⚠️ " + (r.msg || "Couldn't stable."));
          try { renderParty(); updateHUD(); } catch (e) { }
        }, true, "Rest this beast at a Stable");
        acts.appendChild(sr);
      } else if (mountable) {
        const fr = pRow("Lodged at a Stable — ride them straight back from here, anywhere.");
        pBtn(fr, "Ride 🐴", () => {
          let rr = null;
          try { rr = window.Game.rideTameFromStable(t.id); } catch (e) { }
          if (!rr || !rr.ok) toast("⚠️ " + ((rr && rr.msg) || "Couldn't ride."));
          try { renderParty(); updateHUD(); } catch (e) { }
        }, false, "Ride this beast now (rests whoever you're riding)");
        acts.appendChild(fr);
      } else {
        const fr = pRow("Lodged at a Stable — non-riders rest here until fetched at a Stable pen.");
        pBtn(fr, "Find Stable →", () => { findStableFromParty(); }, true);
        acts.appendChild(fr);
      }
    }
    if (!t.breeding) {
      const nr = pRow(dead ? "Gone for now — they keep their name when revived." : "Call them something you like (24 characters max).");
      pBtn(nr, "✏️ Name", () => {
        try {
          const next = prompt("Name this beast:", (t.name || t.kind || "beast"));
          if (next == null) return;
          const r = window.Game.renameTame(t.id, next);
          if (r && r.ok) { renderParty(); updateHUD(); }
          else toast("⚠️ " + ((r && r.msg) || "Couldn't rename."));
        } catch (e) {}
      }, true, "Give this beast a name");
      acts.appendChild(nr);
      const bye = pRow(dead ? "Or let them go — their body returns to the wild." : "Saying goodbye? They return to the wild forever.");
      pBtn(bye, "✕ Release", () => {
        if (!confirm(`Release ${t.name}? It returns to the wild forever.`)) return;
        try { window.Game.dismissTame(t.id); } catch (e) {}
        try { renderParty(); updateHUD(); } catch (e) { }
      }, true, "Release back to the wild");
      acts.appendChild(bye);
    }
    // ---- others: quick stable-side buttons (old lodge roster, preserved) ----
    const others = tames.filter(x => x && x.id !== t.id);
    if (others.length) {
      const withYou = others.filter(x => !x.stabled).length;
      const lodged = others.filter(x => x.stabled).length;
      const os = pSec(body, `💛 Others (${withYou} with you · ${lodged} lodged)`, "Quick stable-side buttons — Open jumps to their box above.");
      for (const o of others) {
        const oDead = !(o.hp > 0);
        const oMount = (() => { try { return window.Entities.isMountKind(o.kind); } catch (e) { return false; } })();
        const oRiding = (() => { try { return p.activeMountId === o.id && p.mounted; } catch (e) { return false; } })();
        const orow = pRow(`${oDead ? "💀" : oRiding ? "🐴" : oMount ? "🐴" : "💛"} ${o.name} (lv ${o.lv || 1} ${o.kind || "beast"})${o.stabled ? " — lodged" : ""} · HP ${Math.ceil(Math.max(0, o.hp))}/${o.maxHp}`);
        if (o.stabled && oMount && !oDead) pBtn(orow, "Ride 🐴", () => {
          let rr = null;
          try { rr = window.Game.rideTameFromStable(o.id); } catch (e) { }
          if (!rr || !rr.ok) toast("⚠️ " + ((rr && rr.msg) || "Couldn't ride."));
          try { renderParty(); updateHUD(); } catch (e) { }
        }, false, `Ride ${o.name} now (rests whoever you're riding)`);
        else if (oDead) pBtn(orow, "Revive — 50g", () => { reviveTame(p, o, 50); }, true, `Revive ${o.name} (stays where it is until you Ride it)`);
        pBtn(orow, "Open →", () => selectBeastTab(o.id), true);
        os.appendChild(orow);
      }
      if (others.some(x => x.stabled)) {
        const fr = pRow("Lodged beasts rest at a Stable — every hearth keeps one (roof sign 🐴 over the pen).");
        pBtn(fr, "Find Stable →", () => { findStableFromParty(); }, true);
        os.appendChild(fr);
      }
    }
    try {
      const along = window.Entities.tameSlots ? window.Entities.tameSlots(p) : 1;
      const h = document.createElement("div");
      h.className = "invempty";
      h.textContent = `Each beast submits (💛) at its own point below 25% HP — and only by chance, so keep weakening it carefully if it doesn't submit. Press E fast. Up to ${along} travel${along === 1 ? "s" : ""} with you; lend spares to friends from a friend's 🐴 Their mount box. Grow 🐾 Taming (C) for more slots.`;
      body.appendChild(h);
    } catch (e) { }
  }
  function findStableFromParty() {
    toggleParty(false);
    try {
      const gp = window.Game && window.Game.G ? window.Game.G.player : null;
      const g = window.Buildings && window.Buildings.stableGuidance && gp ? window.Buildings.stableGuidance(gp.x, gp.y) : null;
      if (g) toast(`🐴 Nearest Stable ${Math.round(g.d)} tiles ${g.dirName} — look for the lodge with the 🐴 pen nexus and press E.`, 6000);
      else toast("Every hearth keeps a 🐴 Stable — head for the nearest gold ⌂ ♛ 🌊 🌸 ⛰ hearth and look for the lodge with the hay pen.", 6000);
    } catch (e) { toast("Every hearth keeps a 🐴 Stable — press E at its pen nexus.", 5000); }
  }
  function renderInnSection(body, p) {
    let guests = [];
    try { guests = (window.Game && window.Game.innGuests) ? (window.Game.innGuests(p) || []) : []; } catch (e) { guests = []; }
    let unlock = 0, used = 0;
    try { unlock = window.Game.innUnlockEnsure(p) | 0; } catch (e) {}
    try { for (const id of (p.innRooms || [])) if (id) used++; } catch (e) {}
    const sec = pSec(body, `🛏️ Inn rooms (${used}/${unlock} taken)`, guests.length ? "Retired friends rest worldwide — retrieve them from ANY inn (E at its counter)." : "Retire party members and slaves at any inn (E at its counter) — paid rooms keep them safe worldwide.");
    if (guests.length) {
      for (const n of guests.slice(0, 6)) {
        const gr = pRow(`${n.hp <= 0 ? "💀" : "😴"} ${n.name} (lv ${n.lv} ${n.role || "friend"})${(n.role === "slave" || n.slave) ? " ⛓️" : ""} — roomed at an inn`);
        sec.appendChild(gr);
      }
      if (guests.length > 6) {
        const more = pRow(`…and ${guests.length - 6} more — see the full roster at any inn.`);
        sec.appendChild(more);
      }
    }
    const r = pRow("Every hearth keeps an inn — look for the mug on the gable and press E at its counter.");
    pBtn(r, "Find Inn →", () => {
      toggleParty(false);
      try {
        const gp = window.Game && window.Game.G ? window.Game.G.player : null;
        const g = window.Buildings && window.Buildings.innGuidance && gp ? window.Buildings.innGuidance(gp.x, gp.y) : null;
        if (g) toast(`🛏️ Nearest Inn ${Math.round(g.d)} tiles ${g.dirName} — press E at its counter to retire or retrieve.`, 6000);
        else toast("Every hearth keeps an 🛏️ inn — head for the nearest gold ⌂ ♛ 🌊 🌸 ⛰ hearth and press E at its counter.", 5000);
      } catch (e) { toast("Every hearth keeps an 🛏️ inn — press E at its counter.", 5000); }
    }, true);
    sec.appendChild(r);
  }

 function renderRecruitPane(body, p, members, max) {
    const s = pSec(body, `💛 Invite friends (${members.length}/${max})`, "Friends fight beside you and share XP. You don't need any to play — they just make it easier.");
    let pts = 1;
    try { pts = window.Entities.loyaltyPts(p); } catch (e) { }
    const exGift = 5, exHeal = 10;
    const steps = [
      ["💬", "Say hello", "Walk up to anyone and press E (or tap 💬) to talk."],
      ["🎁", "Be kind", "Chat, buy things, or give gifts. Watch their 💛 loyalty number."],
      ["", "Earn their trust", `A gold gift (+${pts} 💛) costs their level in gold (e.g. a lv 5 friend = ${exGift}g), healing you costs double (e.g. ${exHeal}g). Charm raises the +💛. At 💛 10× their level you can Recruit them.`],
      ["", "Care for them here", "Open their tab to hand them potions, gear and spells."],
    ];
    for (let si = 0; si < steps.length; si++) {
      const [icon, title, sub] = steps[si];
      const r = document.createElement("div");
      r.className = "howrow";
      r.innerHTML = `<span class="stepnum"></span><span></span>`;
      r.querySelector(".stepnum").textContent = String(si + 1);
      const txt = r.querySelectorAll("span")[1];
      txt.innerHTML = `<b></b><br><span></span>`;
      txt.querySelector("b").textContent = `${title}`;
      txt.querySelector("span").textContent = sub;
      s.appendChild(r);
    }
    const tip = document.createElement("div");
    tip.className = "invempty";
    tip.textContent = members.length >= max
      ? "Your camp is full — Dismiss someone from their tab to make room."
      : "Tip: healers and shopkeepers make great first friends — they carry potions.";
    s.appendChild(tip);
    if (p) {
      const r = pRow("Done reading? See your own hero.");
      pBtn(r, "Back to me", () => selectPartyTab("player"), true);
      s.appendChild(r);
    }
  }
  function renderMemberPane(body, p, npc, members, max) {
    try { window.Items.ensureNpcLoadout(npc); } catch (e) { }
    members = members || partyNpcs(p);
    max = max || mpPartyCap();
    const saveAndRefresh = async () => {
      try { window.Items.ensureNpcLoadout(npc); } catch (e) { }
      try { await window.World.saveNpc(npc); } catch (e) { }
      try { await window.Game.saveGame(true); } catch (e) { }
      try { updateHUD(); updateHotbar(); } catch (e) { }
      try { renderParty(); } catch (e) { }
    };
    const dead = npc.hp <= 0;
    const status = dead ? "Down" : npc.hp < npc.maxHp * 0.5 ? "Hurt" : "Ready";
    const bonus = (() => { try { return window.Items.npcBonus(npc); } catch (e) { return {}; } })();
    const gearBits = [];
    if (bonus.atk) gearBits.push(`+${bonus.atk} attack`);
    if (bonus.matk) gearBits.push(`+${bonus.matk} MATK`);
    if (bonus.def) gearBits.push(`+${bonus.def} defence`);
    if (bonus.maxHp) gearBits.push(`+${bonus.maxHp} health`);
    // back + prev/next navigation
    const nav = document.createElement("div");
    nav.className = "party-nav";
    const back = document.createElement("button");
    back.textContent = "⬅️ All friends";
    back.className = "ghost";
    back.title = "Back to your own tab";
    back.onclick = () => selectPartyTab("player");
    nav.appendChild(back);
    try {
      const ids = members.map(n => n.id);
      const i = ids.indexOf(npc.id);
      if (ids.length > 1) {
        const prev = document.createElement("button");
        prev.textContent = "◀ Prev";
        prev.className = "ghost";
        prev.onclick = () => selectPartyTab(ids[(i - 1 + ids.length) % ids.length]);
        nav.appendChild(prev);
        const next = document.createElement("button");
        next.textContent = "Next ▶";
        next.className = "ghost";
        next.onclick = () => selectPartyTab(ids[(i + 1) % ids.length]);
        nav.appendChild(next);
      }
    } catch (e) { }
    body.appendChild(nav);
    // ---- revealed doppelganger: teeth, never family — dismiss only ----
    try {
      if (npc && npc.isDoppelganger && npc.doppelRevealed) {
        const was = npc.disguiseName || "your friend";
        const wsec = pSec(body, `🦷 Doppelganger (${String(was).split(" ")[0]} was the mask)`, `REVEALED TEETH — no healing, no gear, no orders. Get it out of your party.`);
        try {
          wsec.style.animation = "doppelBlink 1s infinite";
          wsec.style.border = "2px solid #ff3b3b";
          wsec.style.borderRadius = "10px";
        } catch (e) { }
        const wr = pRow(`🦷 This thing wore ${was}'s face. It fights you now — dismiss it (it stays in the world, hostile).`);
        pBtn(wr, "Dismiss teeth", async () => {
          if (!confirm(`Drive the doppelganger out of your party? It stays in the world — hostile. Continue?`)) return;
          try { if (window.Game && window.Game.unassignMountFromMember) window.Game.unassignMountFromMember(npc.id, true); } catch (e) { }
          npc.inParty = false;
          try { npc.targetId = null; npc.targetRef = null; } catch (e) { }
          p.party = (p.party || []).filter(id => id !== npc.id);
          partyTab = "player";
          try { await window.World.saveNpc(npc); } catch (e) { }
          try { await window.Game.saveGame(true); } catch (e) { }
          try { updateHUD(); } catch (e) { }
          try { renderParty(); } catch (e) { }
          toast(`🦷 You drive the doppelganger out. It bares its teeth.`);
        }, false, "Remove the revealed doppelganger from your party");
        wsec.appendChild(wr);
        return;
      }
    } catch (e) { }
    // ---- 1 · how are they? (name over level, each member in its own box) ----
    const sec = pSec(body, `${(npc.name || "?").split(" ")[0]}`, `${status} · 💛 loyalty ${npc.loyalty | 0} · XP ${npc.xp || 0}/${(() => { try { return window.CFG.xpNext(npc.lv || 1); } catch (e) { return "?"; } })()}`);
    const lvlD = document.createElement("div");
    lvlD.className = "ph-lv";
    lvlD.textContent = `Level ${npc.lv} · ${npc.role}`;
    try { sec.insertBefore(lvlD, sec.children[1] || null); } catch (e) { try { sec.appendChild(lvlD); } catch (e2) { } }
    const head = document.createElement("div");
    head.className = "phead";
    if (dead) head.style.opacity = "0.7";
    head.appendChild(portraitCanvas(npc, 120, false));
    const info = document.createElement("div");
    info.style.flex = "1"; info.style.minWidth = "0";
    const hpT = document.createElement("div");
    hpT.className = "pstatline"; hpT.textContent = dead ? `💀 Down — needs Revive` : `❤️ Health ${Math.ceil(Math.max(0, npc.hp))}/${npc.maxHp}`;
    info.appendChild(hpT);
    info.appendChild(pBar((npc.hp / (npc.maxHp || 1)) * 100, "pbar-hp"));
    const mpT = document.createElement("div");
    mpT.className = "pstatline"; mpT.textContent = `💧 Mana ${Math.ceil(Math.max(0, npc.mp))}/${npc.maxMp}`;
    info.appendChild(mpT);
    info.appendChild(pBar((npc.mp / (npc.maxMp || 1)) * 100, "pbar-mp"));
    const st = document.createElement("div");
    st.className = "pstatline";
    st.textContent = `⚔️ ${npc.atk} attack · 🔮 ${npc.matk != null ? npc.matk : npc.atk} MATK · 🛡️ ${npc.def} defence${gearBits.length ? ` (wearing gear: ${gearBits.join(", ")})` : ""} · ✨ ${(npc.abilities || []).length} spell${(npc.abilities || []).length === 1 ? "" : "s"}`;
    info.appendChild(st);
    head.appendChild(info);
    sec.appendChild(head);
    // active buffs & debuffs (live: refreshed by the fx ticker while open)
    try {
      const fx = document.createElement("div");
      fx.className = "fx-row";
      fx.setAttribute("data-fxfor", npc.id);
      sec.appendChild(fx);
      paintFx(fx, npc);
    } catch (e) { }
    try {
      const pl = document.createElement("div");
      pl.className = "psec-sub"; pl.style.marginTop = "6px";
      let line = "";
      try { line = window.AIDirector.personaLine(npc); } catch (e) { line = ""; }
      if (line) { pl.textContent = `🎭 ${line.slice(0, 180)}`; sec.appendChild(pl); }
    } catch (e) { }
    // ---- 2 · what to do right now (big beginner buttons) ----
    const PARTY_HEAL = (window.Entities && window.Entities.PARTY_HEAL_COST) || 10;
    const PARTY_REVIVE = (window.Entities && window.Entities.PARTY_REVIVE_COST) || 50;
    const acts = pSec(body, dead ? "🆘 1 · Bring them back" : "🩹 1 · Look after them", dead ? `Revive costs ${PARTY_REVIVE} gold and needs your level to be at least theirs.` : "Healing here is instant — no need to find a healer.");
    const big = document.createElement("div");
    big.className = "bigact";
    if (dead) {
      const rb = document.createElement("button");
      rb.textContent = `✨ Revive — ${PARTY_REVIVE}g (needs lv ${npc.lv})`;
      rb.title = `You are lv ${p.lv || 1}. Revive only works if your level is ${npc.lv} or higher. Costs ${PARTY_REVIVE} gold.`;
      rb.onclick = async () => {
        if ((p.lv || 1) < (npc.lv || 1)) { toast(`Too strong to revive — reach lv ${npc.lv} first (you're lv ${p.lv}).`); return; }
        if (p.gold < PARTY_REVIVE) { toast(`Need ${PARTY_REVIVE} gold.`); return; }
        p.gold -= PARTY_REVIVE;
        if (npc.isDoppelganger) {
          try { window.Game.doppelReviveHostile(npc, Math.round(npc.maxHp * 0.5), 0); } catch (e) { }
          await saveAndRefresh();
          toast(`\u{1F9B7} ${npc.name} claws back — hostile teeth!`);
          return;
        }
        npc.hp = Math.round(npc.maxHp * 0.5); npc.mp = 0;
        npc.corpse = false; npc.looted = true; npc.deadUntil = null; npc.deadDay = null;
        npc.targetId = null; npc.targetRef = null; npc.hostileUntil = 0;
        await saveAndRefresh();
        toast(`${npc.name} stirs back to life!`);
      };
      big.appendChild(rb);
    } else {
      const hb = document.createElement("button");
      hb.textContent = `💚 Heal fully — ${PARTY_HEAL}g`;
      hb.title = `Restores all their health and mana instantly for ${PARTY_HEAL} gold`;
      hb.onclick = async () => {
        if (p.gold < PARTY_HEAL) { toast(`Not enough gold (need ${PARTY_HEAL}g).`); return; }
        p.gold -= PARTY_HEAL; npc.hp = npc.maxHp; npc.mp = npc.maxMp;
        await saveAndRefresh();
        toast(`${npc.name.split(" ")[0]} feels much better!`);
      };
      big.appendChild(hb);
      const pb = document.createElement("button");
      const pots = window.Items.countItem(p, "potion");
      pb.textContent = pots > 0 ? `🍵 Give them one of MY potions (${pots} left)` : "🍵 No spare potions";
      pb.className = "ghost";
      pb.title = "Uses one of YOUR red potions to heal them halfway — free, no gold";
      pb.disabled = !(pots > 0) || npc.hp >= npc.maxHp;
      pb.onclick = async () => {
        if (npc.hp >= npc.maxHp) { toast(`${npc.name} is already at full HP.`); return; }
        if (!window.Items.removeItem(p, "potion", 1)) { toast("No potion."); return; }
        npc.hp = Math.min(npc.maxHp, npc.hp + Math.round(npc.maxHp * 0.5));
        toast(`🍵 You share a potion with ${npc.name.split(" ")[0]}.`);
        await saveAndRefresh();
      };
      big.appendChild(pb);
    }
    acts.appendChild(big);
    const bye = pRow(dead ? "Or let them rest — they stay in your party." : "Saying goodbye? They stay in the world — you can invite them again later.");
    pBtn(bye, "Say goodbye", async () => {
      if (!confirm(`${npc.name} will leave your party and wait here. You can invite them again by talking to them. Continue?`)) return;
      try { if (window.Game && window.Game.unassignMountFromMember) window.Game.unassignMountFromMember(npc.id, true); } catch (e) { }
      npc.inParty = false;
      p.party = (p.party || []).filter(id => id !== npc.id);
      partyTab = "player";
      try { await window.World.saveNpc(npc); } catch (e) { }
      try { await window.Game.saveGame(true); } catch (e) { }
      try { updateHUD(); } catch (e) { }
      try { renderParty(); } catch (e) { }
      toast(`${npc.name.split(" ")[0]} waves goodbye.`);
    }, true, "Remove from your party (they stay in the world)");
   acts.appendChild(bye);
    const innHint = pRow("🛏️ Need them kept safe? Retire them at any inn (E at its counter) — paid rooms, retrievable worldwide.");
    acts.appendChild(innHint);
    // ---- 3 · backpack (tabbed browser: tabs + search + list + sidebar) ----
    const bs = pSec(body, "2 · Their backpack", "They drink potions and throw bombs BY THEMSELVES in fights from here. Keep a potion in here! Select a thing to see what it does.");
    const packSt = browserStateFor(packStates, npc.id);
    const packSearch = document.createElement("input");
    packSearch.type = "text"; packSearch.placeholder = "Search by name…"; packSearch.autocomplete = "off";
    packSearch.className = "invsearch"; packSearch.value = packSt.q || "";
    bs.appendChild(packSearch);
    const packTabs = document.createElement("div"); packTabs.className = "itabs"; bs.appendChild(packTabs);
    const packWrap = document.createElement("div"); packWrap.className = "invwrap";
    const packList = document.createElement("div"); packList.className = "packlist";
    const packSide = document.createElement("div"); packSide.className = "invside";
    packWrap.appendChild(packList); packWrap.appendChild(packSide); bs.appendChild(packWrap);
    paintBrowser({
      tabsEl: packTabs, searchEl: packSearch, listEl: packList, sideEl: packSide,
      owner: npc, mode: "npc", state: packSt, tabs: INV_TABS, showCraft: false,
      tabsLabel: "Filter their pack", listTitle: "Their backpack — they use these BY THEMSELVES in fights",
      giveFrom: p, onChange: saveAndRefresh,
    });
    // ---- mount: lend them one of your beasts ----
    try {
      const lent = (window.Game && window.Game.npcMountTame) ? window.Game.npcMountTame(npc) : null;
      const ms = pSec(body, "🐴 Their mount", lent ? "They ride at mount speed and keep up at a gallop — the beast sticks to them instead of you." : "Lend one of your ridable beasts and they'll keep up at a gallop instead of lagging behind.");
      if (lent) {
        const row = pRow(`🐴 ${lent.name} (lv ${lent.lv} ${lent.kind}) carries them.`);
        pBtn(row, "Take back", async () => {
          const r = window.Game.unassignMountFromMember(npc.id);
          if (!r.ok) toast("⚠️ " + (r.msg || "Couldn't take it back."));
          await saveAndRefresh();
        }, false, "Take the lent beast back (yours if your saddle is empty, else lodged)");
        ms.appendChild(row);
      } else {
        let loans = [];
        try {
          // lodge beasts lend straight from here — nothing roams free, ever
          loans = (p.tames || []).filter(t => {
            if (!t || !(t.hp > 0)) return false;
            try { if (!window.Entities.isMountKind(t.kind)) return false; } catch (e) { return false; }
            if (t.riderId) return false;
            return true;
          });
        } catch (e) { loans = []; }
        if (!loans.length) {
          const r = pRow("No spare ridable beasts — tame a horse, turtle, cinder steed or kelpie first (weaken until it yields 💛, then E).");
          ms.appendChild(r);
        }
        for (const t of loans) {
          const yourMount = (() => { try { return p.activeMountId === t.id; } catch (e) { return false; } })();
          const row = pRow(`${yourMount ? "🐴" : "💛"} ${t.name} (lv ${t.lv} ${t.kind})${t.stabled ? " — stabled" : ""}${yourMount ? " — your mount (lending hands it over)" : ""}`);
          pBtn(row, "Lend mount", async () => {
            const r = window.Game.assignMountToMember(t.id, npc.id);
            if (!r.ok) { toast("⚠️ " + (r.msg || "Couldn't lend.")); return; }
            await saveAndRefresh();
          }, false, yourMount ? "Hand over your mount (it carries them now)" : "Lend this beast — they ride it, it sticks to them");
          ms.appendChild(row);
        }
      }
    } catch (e) { }
    // ---- 4 · give from your pockets ----
    const gv = pSec(body, "🎁 3 · Give from YOUR pockets", "Tap Give — it lands in their backpack above.");
    // smart button: best spare weapon
    try {
      let best = null, bestPow = -1;
      for (const s of (p.inventory || [])) {
        const it = window.Items.ITEMS[s.id];
        if (!it || it.type !== "equipment" || it.slot !== "weapon") continue;
        try { if (window.Items.isEquipped(p, s.id, s)) continue; } catch (e) { }
        const a = Math.max((it.bonus && it.bonus.atk) || 0, (it.bonus && it.bonus.matk) || 0);
        if (a > bestPow && window.Items.countItem(p, s.id) > 0) { bestPow = a; best = s; }
      }
      const wornAtk = (() => { try { const w = npc.equipment && npc.equipment.weapon; const it = w && window.Items.ITEMS[w]; return Math.max((it && it.bonus && it.bonus.atk) || 0, (it && it.bonus && it.bonus.matk) || 0); } catch (e) { return 0; } })();
      if (best && bestPow > wornAtk) {
        const it = window.Items.ITEMS[best.id];
        const r = pRowHtml(`Recommended: ${window.Icons.tag("item", best.id)} (+${bestPow} attack) beats what they wear (+${wornAtk})`);
        pBtn(r, "Give & wear", async () => {
          const g = window.Items.giveToNpc(p, npc, best.id, 1, best);
          if (!g.ok) { toast(g.msg); return; }
          const u = window.Items.useNpcItem(npc, best.id, best);
          toast(u.msg);
          await saveAndRefresh();
        });
        gv.appendChild(r);
      }
    } catch (e) { }
    const giveSt = browserStateFor(giveStates, npc.id);
    const giveSearch = document.createElement("input");
    giveSearch.type = "text"; giveSearch.placeholder = "Search your pockets…"; giveSearch.autocomplete = "off";
    giveSearch.className = "invsearch"; giveSearch.value = giveSt.q || "";
    gv.appendChild(giveSearch);
    const giveTabs = document.createElement("div"); giveTabs.className = "itabs"; gv.appendChild(giveTabs);
    const giveWrap = document.createElement("div"); giveWrap.className = "invwrap";
    const giveList = document.createElement("div"); giveList.className = "packlist";
    const giveSide = document.createElement("div"); giveSide.className = "invside";
    giveWrap.appendChild(giveList); giveWrap.appendChild(giveSide); gv.appendChild(giveWrap);
    paintBrowser({
      tabsEl: giveTabs, searchEl: giveSearch, listEl: giveList, sideEl: giveSide,
      owner: p, mode: "give", state: giveSt, tabs: INV_TABS, showCraft: false,
      tabsLabel: "Filter your pockets", listTitle: "Your pockets — tap an item, then Give",
      giveFrom: p, giveTo: npc, onChange: saveAndRefresh,
    });
    // ---- teach (only if you actually have a teachable book) ----
    try {
      const teachable = window.Items.TOMES.filter(t => {
        const it = window.Items.ITEMS[t];
        return it && window.Items.countItem(p, t) > 0 && !(npc.abilities || []).includes(it.teaches);
      });
      if (teachable.length) {
        const ts = pSec(body, "📕 4 · Teach a spell", "Teaches them a brand-new spell. Uses up your book.");
        for (const t of teachable) {
          const it = window.Items.ITEMS[t];
          const ab = window.CFG.ABILITIES[it.teaches];
          const row = pRowHtml(`${window.Icons.tag("item", t)} → their new ${window.Icons.tag("ability", it.teaches)} — ${ab.desc}`);
          pBtn(row, "Teach", async () => {
            const r = window.Items.teachNpcFromPlayer(p, npc, t);
            toast(r.msg, 4000);
            await saveAndRefresh();
          });
          ts.appendChild(row);
        }
      }
    } catch (e) { }
    // ---- spells (advanced, collapsed by default for beginners with 3+ spells) ----
    const spCount = (npc.abilities || []).length;
    if (spCount) {
      const useDetails = spCount > 3;
      const spSec = pSec(body, `✨ Spells in battle (${spCount})`, "Green ON = they use it in fights. Tap to switch off spells you don't want.");
      let holder = spSec;
      if (useDetails) {
        const d = document.createElement("details");
        d.className = "padv";
        const sum = document.createElement("summary");
        sum.textContent = `Show all ${spCount} spells`;
        d.appendChild(sum);
        spSec.appendChild(d);
        holder = d;
      }
      for (const abId of (npc.abilities || [])) {
        const ab = window.CFG.ABILITIES[abId];
        if (!ab) continue;
        const on = window.Items.npcAbilityEnabled(npc, abId);
        const row = pRowHtml(`${window.Icons.tag("ability", abId)} — ${ab.desc}`);
        const b = pBtn(row, on ? "ON" : "OFF", async () => {
          window.Items.setNpcAbilityEnabled(npc, abId, !on);
          toast(`${ab.name} ${!on ? "ON — they will use it" : "OFF — they will skip it"}.`);
          await saveAndRefresh();
        }, !on, on ? "Tap to stop them using this" : "Tap to let them use this");
        b.classList.add("spellpill");
        if (on) b.classList.add("is-on");
        (useDetails ? holder : spSec).appendChild(row);
      }
    }
    // ---- worn gear (quiet, at the bottom — backpack Put on/Take off already covers it) ----
    const gs = pSec(body, "Worn gear", "What they wear right now. Take off returns it to their backpack.");
    let anyWorn = false;
    for (const slot of ["weapon", "armor", "trinket", "shield"]) {
      const id = npc.equipment && npc.equipment[slot];
      const it = id && window.Items.ITEMS[id];
      if (!id) continue;
      anyWorn = true;
      const row = pRowHtml(`${slot}: ${it ? `${window.Icons.tag("item", id)} — ${it.desc}` : "— empty"}`);
      pBtn(row, "Take off", async () => { const r = window.Items.unequipNpcSlot(npc, slot); toast(r.msg); await saveAndRefresh(); }, true);
      gs.appendChild(row);
    }
    if (!anyWorn) {
      const e = document.createElement("div");
      e.className = "invempty";
      e.textContent = "Nothing worn — put on gear from their backpack above.";
      gs.appendChild(e);
    }
  }


  // ---------- inventory ----------
  function toggleInv(force) {
    const m = $("invModal");
    if (!m) return;
    const show = force !== undefined ? force : m.hidden;
    m.hidden = !show;
    if (show) {
      renderInv();
      try { if (window.Quests && window.Quests.onTutorialEvent) window.Quests.onTutorialEvent("inv"); } catch (e) { }
    }
    try { refreshTutGuide(); } catch (e) { }
  }
  // one copy = one bind: binds carry the stack's own bench-work + name, so
  // "My Blade" in slot 2 and a plain twin in slot 3 never cross. Old binds
  // (id only) match whatever copy is worn.
  function bindSelectHTML(kind, stackOrId) {
    const N = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
    const p = window.Game.G.player;
    const id = (stackOrId && stackOrId.id) || stackOrId;
    let up = 0, nick = "";
    try {
      if (stackOrId && stackOrId.id && window.Items) {
        up = window.Items.stackUp(stackOrId);
        nick = window.Items.stackNick(stackOrId);
      }
    } catch (e) { }
    let cur = "";
    (p.hotbar || []).forEach((s, i) => {
      if (!s || s.kind !== kind || s.id !== id) return;
      if (kind === "item" && window.Items && !window.Items.hotbarBindMatches(s, { id, up, nick })) return;
      cur = String(i + 1);
    });
    let h = `<select data-bindkind="${kind}" data-bindid="${id}" data-bindup="${up}" data-bindnick="${nick.replace(/"/g, "&quot;")}" title="Bind to hotkey (1-9 + Space)">`;
    h += `<option value="">—</option>`;
    for (let i = 1; i <= N; i++) h += `<option value="${i}"${cur === String(i) ? " selected" : ""}>${hotkeyLabel(i - 1)}</option>`;
    return h + "</select>";
  }
  // ---------- shared item browser: VIEW tabs + FILTER chips + list + sidebar ----------
  // One component drives the player inventory and both party item sections.
  // Equip buttons are wearables-only (armor/trinket). Weapons, ammo, books and
  // consumables act through hotkey-slot binds or their Use buttons instead.
  // Menu-overhaul: the old single tab row mixed VIEW switches (Pockets vs
  // Spells vs Deep Arts vs Crafting) with FILTER chips (All vs Weapons …),
  // so new players couldn't tell tabs from items. Now VIEW is big gold pills
  // on their own row, FILTER is small quiet chips on a second row, ITEMS is
  // a counted list ("N items · tap to inspect →") and DETAILS is the sidebar.
  // Guildhall + black-market keep their own layouts (left untouched).
  function browserViewOf(o) {
    const t = o && o.state && o.state.tab;
    if (o && o.showSpells && (t === "spells" || t === "techs")) return t;
    if (o && o.showCraft && t === "crafting") return "crafting";
    return "pockets";
  }
  function browserListTitle(o, view) {
    if (o && o.listTitle) return o.listTitle;
    if (view === "crafting") return "Recipes — pick one to brew, forge or enchant";
    if (view === "spells") return "Spells — tap to inspect, bind below";
    if (view === "techs") return "Deep Arts — tap to inspect, bind below";
    if (o && o.mode === "npc") return "Their backpack — they use these BY THEMSELVES in fights";
    if (o && o.mode === "give") return "Your pockets — tap an item, then Give";
    if (o && o.mode === "trade") return "Your pockets — Give instantly, or Offer";
    if (o && o.mode === "counter") return "Your pockets — pick what to offer back";
    return "Pockets — tap an item to inspect";
  }
  function renderBrowserTabs(o) {
    const tabsEl = o.tabsEl;
    if (!tabsEl) return;
    tabsEl.innerHTML = "";
    tabsEl.setAttribute("role", "tablist");
    const hasViews = !!(o.showSpells || o.showCraft);
    const view = browserViewOf(o);
    const counts = tabCounts(o.owner, o.tabs);
    const mkBtn = (label, active, title, fn, big) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.title = title || label;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.classList.add("active");
      if (big) b.classList.add("viewtab");
      b.onclick = fn;
      return b;
    };
    if (hasViews) {
      const vrow = document.createElement("div");
      vrow.className = "menu-viewtabs";
      vrow.setAttribute("role", "tablist");
      vrow.setAttribute("aria-label", "View: what kind of thing");
      const lab = document.createElement("span");
      lab.className = "menu-tablabel";
      lab.textContent = "View";
      vrow.appendChild(lab);
      const goView = (v) => () => {
        if (v === "pockets") o.state.tab = "all";
        else o.state.tab = v;
        o.state.sel = null;
        renderBrowserTabs(o);
        paintBrowserListSide(o);
        if (o.onTabChange) try { o.onTabChange(); } catch (e) { }
      };
      vrow.appendChild(mkBtn(`Pockets x${counts.all || 0}`, view === "pockets", "Your carried items (filter below narrows them)", goView("pockets"), true));
      if (o.showSpells) {
        vrow.appendChild(mkBtn(`Spells x${spellCount(o.owner)}`, view === "spells", "Learned spells — bind them to hotkeys", goView("spells"), true));
        vrow.appendChild(mkBtn(`Deep Arts x${techCount(o.owner)}`, view === "techs", "Earned arts — actives bind, passives are always on", goView("techs"), true));
      }
      if (o.showCraft) vrow.appendChild(mkBtn("Crafting", view === "crafting", "Brew, forge and enchant here", goView("crafting"), true));
      tabsEl.appendChild(vrow);
      if (view === "pockets") {
        const frow = document.createElement("div");
        frow.className = "menu-filtertabs";
        frow.setAttribute("role", "tablist");
        frow.setAttribute("aria-label", "Filter pockets");
        const fl = document.createElement("span");
        fl.className = "menu-tablabel";
        fl.textContent = "Filter";
        frow.appendChild(fl);
        for (const [id, label] of o.tabs) {
          const b = mkBtn(`${label} ×${counts[id] || 0}`, o.state.tab === id, `Show only ${label}`, () => { o.state.tab = id; renderBrowserTabs(o); paintBrowserListSide(o); }, false);
          frow.appendChild(b);
        }
        tabsEl.appendChild(frow);
      }
      return;
    }
    // npc backpack / give / trade browsers: single FILTER row (no VIEW switch)
    const frow = document.createElement("div");
    frow.className = "menu-filtertabs";
    frow.setAttribute("role", "tablist");
    frow.setAttribute("aria-label", o.tabsLabel || "Filter items");
    const fl = document.createElement("span");
    fl.className = "menu-tablabel";
    fl.textContent = o.tabsLabel || "Filter";
    frow.appendChild(fl);
    for (const [id, label] of o.tabs) {
      const b = mkBtn(`${label} ×${counts[id] || 0}`, o.state.tab === id, `Show only ${label}`, () => { o.state.tab = id; renderBrowserTabs(o); paintBrowserListSide(o); }, false);
      frow.appendChild(b);
    }
    tabsEl.appendChild(frow);
  }
  let invState = { tab: "all", q: "", sel: null };
  const packStates = {}; // npc id -> {tab,q,sel} for their backpack
  const giveStates = {}; // npc id -> {tab,q,sel} for giving from your pockets
  const tradeStates = {}; // peer hash -> {tab,q,sel} for the player trade menu
  const INV_TABS = [
    ["all", "All"],
    ["weapons", "Weapons"],
    ["armor", "Armor"],
    ["medicine", "Medicine"],
    ["materials", "Materials"],
    ["ammo", "Ammo"],
    ["books", "Books"],
    ["utility", "Utilities"],
  ];
  function itemCatFor(id) {
    try {
      const it = window.Items.ITEMS[id];
      if (!it) return "misc";
      if (it.type === "equipment") return it.slot === "weapon" ? "weapons" : "armor";
      if (it.type === "ammo") return "ammo";
      if (it.type === "spellbook") return "books";
     if (it.type === "quest") return "utility";
     if (id === "torch") return "utility";
      if (it.type === "placeable") return "utility";
     if (it.type === "consumable") {
        if (it.use && (it.use.raft || it.use.bomb || it.use.smoke)) return "utility";
        if (it.use && it.use.shuriken) return "ammo";
        return "medicine";
      }
      if (it.type === "material") {
        if (it.usable) return "medicine";
        return "materials";
      }
    } catch (e) { }
    return "misc";
  }
  function browserStateFor(bucket, key) {
    if (!bucket[key]) bucket[key] = { tab: "all", q: "", sel: null };
    return bucket[key];
  }
  // short property lines for the sidebar (stats, resists, procs, price)
  // lvlOverride: the worked copy's own levels (unworn stacks don't read the
  // worn copy's). Omit it and the worn copy's levels apply, as before.
  function itemStatLines(it, lvlOverride) {
    const L = [];
    try {
      if (it.bonus) {
        const b = [];
        if (it.bonus.atk) b.push("+" + it.bonus.atk + " ATK");
        if (it.bonus.matk) b.push("+" + it.bonus.matk + " MATK");
        if (it.bonus.def) b.push("+" + it.bonus.def + " DEF");
        if (it.bonus.sdef) b.push("+" + it.bonus.sdef + " SDEF");
        if (it.bonus.maxHp) b.push("+" + it.bonus.maxHp + " HP");
        if (it.bonus.maxMp) b.push("+" + it.bonus.maxMp + " MP");
        if (it.bonus.spd) b.push((it.bonus.spd > 0 ? "+" : "") + it.bonus.spd + " SPD");
        if (b.length) L.push(b.join(" · "));
        // gear upgrades: this COPY's work levels boost its flat stats when
        // worn — show the boosted totals, not just the base.
        try {
          const lvl = (lvlOverride != null) ? lvlOverride
            : ((window.Items && it.id) ? window.Items.gearUpLevel((window.Game && window.Game.G && window.Game.G.player), it.id) : 0);
          const upMax = (window.Items && window.Items.GEAR_UP_MAX) || 5;
          if (lvl > 0 && it.slot !== "trinket") {
            const keys = window.Items.gearUpgradeStats(it.id);
            const lbl = { atk: "ATK", matk: "MATK", def: "DEF", sdef: "SDEF", maxHp: "HP", maxMp: "MP", maxStamina: "ST", spd: "SPD" };
            const step = (window.Items && window.Items.GEAR_UP_STEP) || 0.5;
            const eb = keys.map(k => {
              const v = it.bonus[k] * (1 + lvl * step);
              const r = Math.abs(v) < 10 ? Math.round(v * 10) / 10 : Math.round(v);
              return "+" + r + " " + (lbl[k] || k);
            });
            if (eb.length) L.push("⬆️ +" + (lvl * (((window.Items && window.Items.GEAR_UP_PCT) || 50))) + "% → " + eb.join(" · ") + "  (" + "●".repeat(lvl) + "○".repeat(Math.max(0, upMax - lvl)) + ")");
          }
        } catch (e) { }
      }
      const rs = [];
      if (it.resPhys) rs.push(Math.round(it.resPhys * 100) + "% physical resist");
      if (it.resMagic) rs.push(Math.round(it.resMagic * 100) + "% magical resist");
      if (rs.length) L.push(rs.join(" · "));
      if (it.wtype) {
        let w = it.wtype;
        if (it.dmgType) w += "/" + it.dmgType;
        if (it.element) w += "/" + it.element;
        if (it.weaponRange) w += " · " + it.weaponRange + " reach";
        try {
          const tn = window.CFG && window.CFG.SKILL_TREES && window.CFG.SKILL_TREES[it.wtype] && window.CFG.SKILL_TREES[it.wtype].name;
          if (tn) w += " · feeds " + tn;
        } catch (e) { }
        L.push(w);
      }
      if (it.bow) L.push("bow · " + it.range + " range · " + it.bowSpeed + "x speed · " + it.bowPower + "x power" + (it.element ? " · " + it.element : ""));
      if (it.wand) L.push("wand · spells cost x" + it.manaMult);
      if (it.staff) L.push("staff · spells x" + it.powerMult + " power");
      if (it.ringBoost) {
        const ks = Object.keys(it.ringBoost);
        if (ks.length) L.push("ring · " + ks.map(k => "1.5x " + k).join(", "));
      }
      if (it.ammo) {
        let a = "ammo · " + it.ammo.power + "x power";
        if (it.ammo.status) a += " · " + it.ammo.status.type;
        L.push(a);
      }
      for (const h of [it.statusHit, it.statusHit2]) {
        if (!h || !h.type) continue;
        let s = h.type + " " + Math.round((h.chance || 0) * 100) + "%";
        if (h.duration) s += " · " + h.duration + "s";
        if (h.dps) s += " · burn";
        if (h.pct) s += " · poison";
        if (h.procCd) s += " · " + h.procCd + "s cooldown";
        L.push("✨ " + s);
      }
      if (it.smite) L.push("⚜️ smite: extra ruin vs undead and demons");
      if (it.twin) L.push("twin arrows per shot");
      if (it.legendary) L.push("legendary find");
      if (typeof it.price === "number") L.push("~" + it.price + "g value");
    } catch (e) { }
    return L;
  }
  function wireBindSelects(rootEl, owner, onChange) {
    if (!rootEl || !owner || !Array.isArray(owner.hotbar)) return;
    rootEl.querySelectorAll("select[data-bindid]").forEach((sel) => {
      sel.onchange = () => {
        const kind = sel.getAttribute("data-bindkind"), sid = sel.getAttribute("data-bindid");
        const bup = Number(sel.getAttribute("data-bindup")) || 0;
        let bnick = "";
        try { bnick = sel.getAttribute("data-bindnick") || ""; } catch (e) { }
        const v = sel.value;
        owner.hotbar.forEach((s, i) => {
          if (!s || s.kind !== kind || s.id !== sid) return;
          // clear this exact copy's binds plus any legacy id-only binds of
          // the same item (they would point at an ambiguous copy now)
          if (kind === "item" && window.Items) {
            const legacy = !(s.up > 0) && !s.nick;
            if (!legacy && !window.Items.hotbarBindMatches(s, { id: sid, up: bup, nick: bnick })) return;
          }
          owner.hotbar[i] = null;
        });
        if (v) {
          let idx = Number(v) - 1;
          // Space binds as the last slot (value N means Space).
          try {
            const n = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
            if (Number(v) === n && owner.hotbar.length >= n) idx = n - 1;
          } catch (e) {}
          if (idx < 0) idx = 0;
          if (idx >= owner.hotbar.length) idx = owner.hotbar.length - 1;
          owner.hotbar[idx] = (kind === "item") ? { kind, id: sid, ...(bup > 0 ? { up: bup } : {}), ...(bnick ? { nick: bnick } : {}) } : { kind, id: sid };
          // Attack-slot authority: binding a weapon to the DEFAULT slot wields
          // it immediately; other slots just bind (no re-equip), so the normal
          // attack never follows a side slot.
          try {
            const dd = (owner && owner.kind === "player" && window.Items && window.Items.getDefaultWeaponSlot) ? window.Items.getDefaultWeaponSlot(owner) : 0;
            if (kind === "item" && idx === dd) {
              try {
                const it = window.Items && window.Items.ITEMS[sid];
                if (it && it.type === "equipment" && it.slot === "weapon" && !window.Items.isEquipped(owner, sid, { id: sid, up: bup, nick: bnick })) {
                  const r = window.Items.equip(owner, sid, { id: sid, up: bup, nick: bnick });
                  if (r && r.msg) toast(r.msg);
                }
              } catch (e) { }
            }
          } catch (e) { }
        }
        // keep the Attack Slot authoritative (clearing the default slot unwields to fists)
        try { if (owner && owner.kind === "player" && window.Items && window.Items.syncPlayerAttackWeapon) window.Items.syncPlayerAttackWeapon(owner); } catch (e) {}
        onChange();
      };
    });
  }
  function filteredStacks(owner, st, tabs) {
    const q = (st.q || "").trim().toLowerCase();
    const inv = [...(owner.inventory || [])];
    inv.sort((a, b) => {
      const ta = window.Items.ITEMS[a.id], tb = window.Items.ITEMS[b.id];
      return (ta ? ta.type : "z").localeCompare(tb ? tb.type : "z") || a.id.localeCompare(b.id);
    });
    return inv.filter((s) => {
      const it = window.Items.ITEMS[s.id];
      if (!it) return false;
      if (st.tab !== "all" && itemCatFor(s.id) !== st.tab) return false;
      if (q) {
        let nm = "";
        try { nm = (window.Items.variantName(s) || "").toLowerCase(); } catch (e) { }
        if (!(it.name || "").toLowerCase().includes(q) && !nm.includes(q)) return false;
      }
      return true;
    });
  }
  // one inventory ROW = one stack = one copy-identity (id + bench-work +
  // name). Named and worked pieces never collapse into their plain kin.
  function stackRowKey(s) {
    try { return window.Items.stackKey(s); } catch (e) { return String((s && s.id) || ""); }
  }
  function stackRowName(owner, s) {
    try {
      const it = window.Items.ITEMS[s.id];
      if (!it) return s.id;
      let nm = window.Items.variantName(s);
      const up = window.Items.stackUp(s);
      if (up > 0) nm += ` +${up * ((window.Items && window.Items.GEAR_UP_PCT) || 50)}%`;
      nm += " ×" + ((s.n | 0) || 1);
      return nm;
    } catch (e) {
      try { return (window.Items.ITEMS[s.id] || {}).name + " ×" + s.n; } catch (e2) { return s.id; }
    }
  }
  function stackWornMark(owner, s) {
    try { return window.Items.isEquipped(owner, s.id, s); } catch (e) { return false; }
  }
  function tabCounts(owner, tabs) {    const c = { all: 0 };
    for (const s of (owner.inventory || [])) {
      const it = window.Items.ITEMS[s.id];
      if (!it) continue;
      c.all++;
      const cat = itemCatFor(s.id);
      c[cat] = (c[cat] || 0) + 1;
    }
    return c;
  }
  function isTechAbility(id) { try { return (window.CFG.ABILITIES[id] || {}).kind === "technique"; } catch (e) { return false; } }
  function spellCount(p) {
    try { return (p && p.abilities ? p.abilities.filter(id => !isTechAbility(id)).length : 0); } catch (e) { return 0; }
  }
  function techCount(p) {
    try {
      const acts = (p && p.abilities ? p.abilities.filter(isTechAbility).length : 0);
      const T = (window.CFG && window.CFG.TECHNIQUES) || {};
      const pass = (p && p.techniques ? p.techniques.filter(id => T[id] && !T[id].active).length : 0);
      return acts + pass;
    } catch (e) { return 0; }
  }
  // spell list (the "spells" tab) vs technique list (the "techs" tab).
  // Active techniques live in BOTH p.abilities (so the hotbar can cast them)
  // and p.techniques (so deeds/progress know them) — the old single tab
  // rendered both lists, so every active art showed up twice. Split tabs fix
  // it: spells show non-technique abilities only, techs show each art once.
  function renderAbilityList(listEl, sideEl, p, q, mode) {
    if (mode === "techs") { renderTechList(listEl, sideEl, p, q); return; }
    renderSpellList(listEl, sideEl, p, q);
  }
  function spellRow(listEl, p, id, filt) {
    const ab = window.CFG.ABILITIES[id];
    if (!ab) return;
    if (!filt(ab.name)) return;
    const d = document.createElement("div");
    d.className = "invrow";
    d.style.cursor = "default";
    d.innerHTML = '<span class="invicon"></span><span class="invname"></span><span class="invact bindwrap"></span>';
    try { window.Icons.set(d.querySelector(".invicon"), "ability", id); } catch (e) { }
    let cost = ab.mp, costName = "MP";
    try {
      if (ab.kind === "technique" && window.Entities.effectiveStamCost) { cost = window.Entities.effectiveStamCost(p, id); costName = "stamina"; }
      else cost = window.Entities.effectiveMpCost(p, id);
    } catch (e) { }
    d.querySelector(".invname").textContent = ab.name + " — " + ab.desc + " (" + cost + " " + costName + ")";
    d.querySelector(".invact").innerHTML = "bind " + bindSelectHTML("ability", id);
    const act = d.querySelector(".invact");
    // Non-technique spells can be the default attack (click / ⚔️ / Space).
    // Set ONLY here in 🎒 — pressing the spell's hotkey in-world just casts it.
    try {
      if (ab.kind !== "technique") {
        let isDef = false;
        try {
          const dd = window.Items.getDefaultWeaponSlot(p);
          const ds = (p.hotbar || [])[dd];
          isDef = !!(ds && ds.kind === "ability" && ds.id === id);
        } catch (e2) { }
        const defBtn = document.createElement("button");
        defBtn.textContent = isDef ? "⚔️ Default ✓" : "⚔️ Default";
        defBtn.title = "Make this spell your default attack (attack button / left-click / empty Space use it). Hotkeys still just cast it — they never change the default.";
        defBtn.style.marginLeft = "6px";
        defBtn.disabled = !!isDef;
        defBtn.onclick = () => {
          try {
            let idx = -1;
            try {
              (p.hotbar || []).forEach((s, i) => { if (idx < 0 && s && s.kind === "ability" && s.id === id) idx = i; });
            } catch (e2) { }
            if (idx < 0) {
              // not bound anywhere: bind into the current default slot — or,
              // when the Attack slot is "No slot" (or otherwise unusable), the
              // first free non-Off-hand slot (never overwrite slot 1 blindly)
              try { idx = window.Items.getDefaultWeaponSlot(p); } catch (e2) { idx = 0; }
              if (!(idx >= 0) || idx >= p.hotbar.length) {
                try { idx = (window.Items && window.Items.firstFreeHotbarSlot) ? window.Items.firstFreeHotbarSlot(p) : (p.hotbar || []).findIndex(s => !s); } catch (e3) { idx = -1; }
              }
              if (!(idx >= 0) || idx >= p.hotbar.length) { try { toast("Hotbar full — free a slot in 🎒 Inventory first."); } catch (e3) { } saveAndRefreshInv(); return; }
              try {
                p.hotbar.forEach((s, i) => { if (s && s.kind === "ability" && s.id === id) p.hotbar[i] = null; });
              } catch (e2) { }
              p.hotbar[idx] = { kind: "ability", id };
              try { if (window.Items.setDefaultWeaponSlot) window.Items.setDefaultWeaponSlot(p, idx); } catch (e2) { }
            } else {
              try { if (window.Items.setDefaultWeaponSlot) window.Items.setDefaultWeaponSlot(p, idx); } catch (e2) { }
            }
            try { if (window.Items.syncPlayerAttackWeapon) window.Items.syncPlayerAttackWeapon(p); } catch (e2) { }
            try { toast("⚔️ " + ab.name + " is now your default attack (slot " + (idx + 1) + "). Click / ⚔️ / Space cast it; hotkeys just cast without changing the default."); } catch (e2) { }
          } catch (e2) { }
          saveAndRefreshInv();
        };
        act.appendChild(defBtn);
      }
    } catch (e) { }
    listEl.appendChild(d);
  }
  function renderSpellList(listEl, sideEl, p, q) {
    listEl.innerHTML = "";
    const filt = (nm) => !q || (nm || "").toLowerCase().includes(q);
    for (const id of (p.abilities || [])) {
      if (isTechAbility(id)) continue;
      try { spellRow(listEl, p, id, filt); } catch (e) { }
    }
    try {
      const unk = window.Items.unknownTomes(p);
      if (unk.length) {
        const hint = document.createElement("div");
        hint.className = "invempty";
        hint.textContent = "Undiscovered spells: " + unk.length + " — find 📕 spellbooks in chests and dungeons.";
        listEl.appendChild(hint);
      }
    } catch (e) { }
    wireBindSelects(listEl, p, () => saveAndRefreshInv());
    sideEl.innerHTML = "";
    const e = document.createElement("div");
    e.className = "invempty";
    e.textContent = q ? "Matching spells." : "✨ Spells cost MP — bind them to hotkeys, or press ⚔️ Default on one to hurl it with click / ⚔️ / Space. Hotkeys just cast; only 🎒 sets the default.";
    sideEl.appendChild(e);
  }
  function renderTechList(listEl, sideEl, p, q) {
    listEl.innerHTML = "";
    const filt = (nm) => !q || (nm || "").toLowerCase().includes(q);
    for (const id of (p.abilities || [])) {
      if (!isTechAbility(id)) continue;
      try { spellRow(listEl, p, id, filt); } catch (e) { }
    }
    try {
      const T = (window.CFG && window.CFG.TECHNIQUES) || {};
      const known = (p.techniques || []).filter(id => T[id] && !T[id].active && filt(T[id].name));
      for (const id of known) {
        const tt = T[id];
        const d = document.createElement("div");
        d.className = "invrow";
        d.style.cursor = "default";
        d.innerHTML = '<span class="invicon"></span><span class="invname"></span>';
        try { window.Icons.set(d.querySelector(".invicon"), "ability", id); } catch (e) { }
        d.querySelector(".invname").textContent = tt.name + " — " + (tt.hint || tt.desc || "deed-learnt Deep Art") + " (always on)";
        listEl.appendChild(d);
      }
      const locked = Object.keys(T).filter(id => !((p.techniques || []).includes(id)) && filt(T[id].name));
      if (locked.length) {
        const lh = document.createElement("div");
        lh.className = "invempty";
        lh.textContent = "Latent Deep Arts (learnt by deeds — progress below):";
        listEl.appendChild(lh);
      }
      for (const id of locked) {
        const tt = T[id];
        const bits = [];
        try {
          const req = tt.req || {};
          if (req.el) for (const k of Object.keys(req.el)) bits.push(k + " " + Math.min(req.el[k], Math.floor(((p.techXp.el || {})[k] || 0))) + "/" + req.el[k]);
          if (req.fam) for (const k of Object.keys(req.fam)) bits.push(k + " " + Math.min(req.fam[k], Math.floor(((p.techXp.fam || {})[k] || 0))) + "/" + req.fam[k]);
          if (req.kills) bits.push("kills " + Math.min(req.kills, p.techXp.kills || 0) + "/" + req.kills);
          if (req.undeadKills) bits.push("undead " + Math.min(req.undeadKills, p.techXp.undeadKills || 0) + "/" + req.undeadKills);
          if (req.uses) for (const k of Object.keys(req.uses)) {
            let label = k;
            try {
              const ab = (window.CFG.ABILITIES || {})[k];
              if (ab) label = ab.name || k;
              else if (k === "tame") label = "tames";
              else if (k === "insect_tame") label = "insect tames";
            } catch (e) { }
            let have = ((((p.techXp || {}).uses || {})[k] | 0) || 0);
            try {
              if (k === "tame" && window.Entities.lifetimeTames) have = Math.max(have, window.Entities.lifetimeTames(p));
              else if (k === "insect_tame" && window.Entities.lifetimeInsectTames) have = Math.max(have, window.Entities.lifetimeInsectTames(p));
            } catch (e2) { }
            bits.push(label + " " + Math.min(req.uses[k], have) + "/" + req.uses[k]);
          }
        } catch (e) { }
        const d = document.createElement("div");
        d.className = "invrow";
        d.style.cursor = "default";
        d.style.opacity = "0.75";
        d.innerHTML = '<span class="invicon"></span><span class="invname"></span>';
        try { window.Icons.set(d.querySelector(".invicon"), "ability", id); } catch (e) { }
        d.querySelector(".invname").textContent = tt.name + " (locked) — " + (tt.hint || "") + " [" + bits.join(" · ") + "]";
        listEl.appendChild(d);
      }
    } catch (e) { }
    wireBindSelects(listEl, p, () => saveAndRefreshInv());
    sideEl.innerHTML = "";
    const e = document.createElement("div");
    e.className = "invempty";
    e.textContent = q ? "Matching Deep Arts." : "⚔️ Deep Arts are earned by deeds, not books — actives bind like spells, passives are always on.";
    sideEl.appendChild(e);
  }
 // craft recipe list (the "craftables" tab content for the player inventory)
 function renderCraftList(listEl, p) {
   listEl.innerHTML = "";
    const groups = [["base", "🧱 Base-building"], ["field", "🌿 Fieldcraft"], ["forge", "⚒️ Forge"], ["enchant", "✨ Enchant"]];
   for (const [cat, label] of groups) {
     const list = window.Items.CRAFTS.filter(r => (r.cat || "field") === cat);
     if (!list.length) continue;
     const h = document.createElement("h4");
      h.textContent = cat === "base" ? "Base-building" : cat === "field" ? "Fieldcraft" : cat === "forge" ? "Forge" : "Enchant";
     h.style.margin = "8px 0 2px";
     listEl.appendChild(h);
      for (const r of list) {
        const out = window.Items.ITEMS[r.out];
        if (!out) continue;
        const cost = Object.entries(r.cost).map(function (pair) {
          var id = pair[0], n = pair[1];
          var nm = (window.Items.ITEMS[id] || {}).name || id;
          return window.Items.countItem(p, id) + "/" + n + " " + nm;
        }).join(" + ");
        const d = document.createElement("div");
        d.className = "invrow";
        d.style.cursor = "default";
        d.innerHTML = '<span class="invicon"></span><span class="invname"></span><span class="invact"></span>';
        try { window.Icons.set(d.querySelector(".invicon"), "item", r.out); } catch (e) { }
        d.querySelector(".invname").textContent = r.name + ": " + r.n + "× " + out.name + " (" + cost + ")";
        const b = document.createElement("button");
        b.textContent = "Craft";
        b.onclick = () => { const rr = window.Items.craft(p, r.id); toast(rr.msg); saveAndRefreshInv(); };
        d.querySelector(".invact").appendChild(b);
        listEl.appendChild(d);
      }
    }
  }
  // sidebar detail + buttons. stack: the selected inventory ROW (one copy-
  // identity) or null. mode: 'player' | 'npc' | 'give'
  function paintItemSide(sideEl, owner, stack, mode, o) {
    sideEl.innerHTML = "";
    const dh = document.createElement("div");
    dh.className = "menu-eyebrow items";
    dh.textContent = mode === "give" ? "Details — then Give" : mode === "npc" ? "Details — their thing" : mode === "trade" || mode === "counter" ? "Details — Give or Offer" : "Details — what it does + buttons";
    sideEl.appendChild(dh);
    const id = stack && stack.id;
    const it = id && window.Items.ITEMS[id];
    if (!it) {
      const e = document.createElement("div");
      e.className = "invempty";
      e.textContent = mode === "give" ? "Select one of YOUR things to read it, then Give it." : "Select an item to see its properties and buttons.";
      sideEl.appendChild(e);
      return;
    }
    const up = (() => { try { return window.Items.stackUp(stack); } catch (e) { return 0; } })();
    const nick = (() => { try { return window.Items.stackNick(stack); } catch (e) { return ""; } })();
    const n = (stack.n | 0) || 1;
    const dname = (() => { try { return window.Items.variantName(stack); } catch (e) { return it.name; } })();
    const head = document.createElement("h4");
    try { head.innerHTML = (window.Icons ? window.Icons.img("item", id, 20) : "") + " "; } catch (e) { }
    try {
      const tx = document.createElement("span");
      tx.textContent = (nick ? `"${nick}"${it.name !== nick ? ` (${it.name})` : ""}` : it.name) + (n > 1 ? " ×" + n : "") + (up > 0 ? ` +${up * ((window.Items && window.Items.GEAR_UP_PCT) || 50)}%` : "");
      head.appendChild(tx);
    } catch (e) { }
    sideEl.appendChild(head);
    const desc = document.createElement("div");
    desc.className = "sub";
    desc.textContent = it.desc || "";
    sideEl.appendChild(desc);
    for (const line of itemStatLines(it, up)) {
      const d = document.createElement("div");
      d.className = "statline";
      d.textContent = line;
      sideEl.appendChild(d);
    }
    // bench gear points at its own bench for upgrades + naming
    try {
      const venue = window.Items.gearUpgradeVenue(id);
      if (venue) {
        const vnm = { forge: "smithy", arcane: "arcane circle", holy: "holy altar", dojo: "dojo" }[venue] || venue;
        const v = document.createElement("div");
        v.className = "statline";
        v.textContent = `Worked + renamed at the ${vnm} — this copy lists on its own row.`;
        sideEl.appendChild(v);
      }
    } catch (e) { }
    if (mode === "player" && stackWornMark(owner, stack)) {
      const e = document.createElement("div");
      e.className = "statline";
      e.textContent = "✔ currently equipped (this copy)";
      sideEl.appendChild(e);
    }
    if (mode === "npc" && owner.equipment && (owner.equipment.weapon === id || owner.equipment.armor === id || owner.equipment.trinket === id)) {
      let mine = true;
      try {
        const sl = it.slot;
        if (sl && window.Items.wornVariantOf) {
          const wv = window.Items.wornVariantOf(owner, sl);
          mine = (wv.up === up && wv.nick === nick);
        }
      } catch (e) { }
      if (mine) {
        const e = document.createElement("div");
        e.className = "statline";
        e.textContent = "✔ they wear this copy";
        sideEl.appendChild(e);
      }
    }
    const btns = document.createElement("div");
    btns.className = "sidebtns";
    sideEl.appendChild(btns);
    const addBtn = (label, fn, ghost, title) => {
      const b = document.createElement("button");
      b.textContent = label;
      if (ghost) b.className = "ghost";
      if (/^Drop/.test(label)) b.classList.add("danger");
      if (title) b.title = title;
      b.onclick = fn;
      btns.appendChild(b);
      return b;
    };
    const sealed = it.quest || it.type === "quest";
    if (mode === "player") {
      if (it.type === "equipment" && (it.slot === "armor" || it.slot === "trinket" || it.slot === "shield")) {
        const worn = stackWornMark(owner, stack);
        addBtn(worn ? "Unequip" : "Equip", () => {
          const r = worn ? window.Items.unequip(owner, it.slot) : window.Items.equip(owner, id, stack);
          toast(r.msg); o.onChange();
        }, false, it.slot === "shield" ? "Wear this shield: passive +DEF/+SDEF, and Q parries at 1/20 x tier with it in your off-hand slot" : undefined);
      } else if (it.type === "equipment") {
        addBtn("⚔️ Default weapon", () => {
          // already bound somewhere? that slot becomes the default. Otherwise
          // bind THIS copy into the current default slot, then wield it.
          let idx = -1;
          try {
            (owner.hotbar || []).forEach((s, i) => {
              if (idx >= 0 || !s || s.kind !== "item" || s.id !== id) return;
              if (window.Items && !window.Items.hotbarBindMatches(s, stack)) return;
              idx = i;
            });
          } catch (e) { }
          if (idx < 0) {
            // Not bound anywhere: bind into the current default slot — or,
            // when the Attack slot is "No slot" (or otherwise unusable), the
            // first free non-Off-hand slot (never write hotbar[-1] / clobber
            // slot 1 blindly). Re-arming from "No slot" is deliberate, so the
            // new slot becomes the default.
            try { idx = window.Items.getDefaultWeaponSlot(owner); } catch (e) { idx = 0; }
            if (!(idx >= 0) || idx >= owner.hotbar.length) {
              try { idx = (window.Items && window.Items.firstFreeHotbarSlot) ? window.Items.firstFreeHotbarSlot(owner) : (owner.hotbar || []).findIndex(s => !s); } catch (e2) { idx = -1; }
            }
            if (!(idx >= 0) || idx >= owner.hotbar.length) { toast("Hotbar full — free a slot in 🎒 Inventory first."); o.onChange(); return; }
            owner.hotbar.forEach((s, i) => {
              if (!s || s.kind !== "item" || s.id !== id) return;
              if (window.Items && !window.Items.hotbarBindMatches(s, stack)) return;
              owner.hotbar[i] = null;
            });
            owner.hotbar[idx] = { kind: "item", id, ...(up > 0 ? { up } : {}), ...(nick ? { nick } : {}) };
            try { if (window.Items.setDefaultWeaponSlot) window.Items.setDefaultWeaponSlot(owner, idx); } catch (e) { }
          } else {
            try { if (window.Items.setDefaultWeaponSlot) window.Items.setDefaultWeaponSlot(owner, idx); } catch (e) { }
          }
          try {
            if (!window.Items.isEquipped(owner, id, stack)) {
              const r = window.Items.equip(owner, id, stack);
              if (r && r.msg) { toast(r.msg); o.onChange(); return; }
            }
          } catch (e) { }
          try { if (window.Items.syncPlayerAttackWeapon) window.Items.syncPlayerAttackWeapon(owner); } catch (e) { }
          toast("⚔️ " + dname + " is now your default weapon (slot " + (idx + 1) + ").");
          o.onChange();
        }, false, "Make this copy your default attack weapon (attack button / click / Space use it)");
        const h = document.createElement("div");
        h.className = "sub";
        try {
          const dd = window.Items.getDefaultWeaponSlot(owner);
          const ds = (dd >= 0 && owner.hotbar) ? owner.hotbar[dd] : null;
          let curTxt = (dd < 0) ? " Current: 🚫 No slot (always bare fists — pick a slot above to re-arm)." : " Current default: slot " + (dd + 1);
          try {
            if (ds && ds.kind === "ability" && ds.id && window.CFG.ABILITIES[ds.id]) curTxt += " (" + window.CFG.ABILITIES[ds.id].name + ")";
            else if (ds && ds.kind === "item" && ds.id) curTxt += ".";
            else curTxt += " (empty — bare fists).";
          } catch (e2) { curTxt += "."; }
          h.textContent = "The gold ⚔️ slot is your default Attack Slot — the attack button / click / empty Space use it (weapons swing, spells cast — set a spell default in Spells with its ⚔️ Default button). Pressing a weapon hotkey in-world makes that slot the default; spell hotkeys just cast." + curTxt;
        } catch (e) {
          h.textContent = "The gold ⚔️ slot is your default Attack Slot — the attack button / click / empty Space use it. Pressing a weapon hotkey in-world makes that slot the default; spell hotkeys just cast.";
        }
        sideEl.appendChild(h);
      }
      if (it.type === "consumable" || (it.type === "material" && it.usable)) {
        let label = "Use";
        if (id === "raft") label = owner.sailing ? "🛶 Haul ashore (put away)" : "🛶 Launch raft (use)";
        else if (id === "torch") label = "🔥 Plant torch";
        addBtn(label, () => { const r = window.Items.useItem(owner, id); toast(r.msg); o.onChange(); });
      }
      if (it.type === "spellbook") {
        if (owner.abilities.includes(it.teaches)) {
          const k = document.createElement("span");
          k.className = "known";
          k.textContent = "known";
          btns.appendChild(k);
        } else addBtn("📖 Read", () => { const r = window.Items.useItem(owner, id); toast(r.msg, 4000); o.onChange(); });
      }
      if (!sealed && window.Items.bindable(id)) {
        const wrap = document.createElement("span");
        wrap.innerHTML = "bind " + bindSelectHTML("item", stack);
        wrap.style.fontSize = "11px";
        wrap.style.opacity = "0.9";
        btns.appendChild(wrap);
        wireBindSelects(btns, owner, o.onChange);
      }
      if (!sealed) {
        addBtn("Drop", () => {
          const r = window.Items.dropItem(owner, id, 1, stack);
          try {
            const left = window.Items.countVariant ? window.Items.countVariant(owner, id, stack) : window.Items.countItem(owner, id);
            if (left < 1 && o.state) o.state.sel = null;
          } catch (e) { }
          toast(r.msg); o.onChange();
        }, true, "Drop 1 of this copy — gone for good");
        if (n > 1) addBtn("Drop all", () => {
          if (!confirm("Drop all " + n + "× " + dname + "? Gone for good.")) return;
          const r = window.Items.dropItem(owner, id, n, stack);
          if (o.state) o.state.sel = null;
          toast(r.msg); o.onChange();
        }, true, "Drop this whole row — gone for good");
      }
    } else if (mode === "npc") {
      const npc = owner;
      let worn = !!(npc.equipment && (npc.equipment.weapon === id || npc.equipment.armor === id || npc.equipment.trinket === id));
      try {
        if (worn && it.slot && window.Items.wornVariantOf) {
          const wv = window.Items.wornVariantOf(npc, it.slot);
          worn = (wv.up === up && wv.nick === nick);
        }
      } catch (e) { }
      if (it.type === "equipment") {
        addBtn(worn ? "Take off" : "Put on", async () => {
          const r = window.Items.useNpcItem(npc, id, stack);
          toast(r.msg); await o.onChange();
        }, worn);
      } else if (it.type === "spellbook") {
        if ((npc.abilities || []).includes(it.teaches)) {
          const k = document.createElement("span");
          k.className = "known";
          k.textContent = "already known";
          btns.appendChild(k);
        } else addBtn("📖 Teach", async () => { const r = window.Items.useNpcItem(npc, id, stack); toast(r.msg, 4000); await o.onChange(); });
      } else if (it.type === "consumable" || (it.type === "material" && it.usable)) {
        addBtn("Use now", async () => { const r = window.Items.useNpcItem(npc, id, stack); toast(r.msg); await o.onChange(); });
      }
      if (!worn && !sealed) {
        addBtn("Take back", async () => { const r = window.Items.takeFromNpc(npc, o.giveFrom, id, 1, stack); toast(r.msg); await o.onChange(); }, false, "Move 1 of this copy back to your pockets");
        addBtn("Drop", async () => {
          const r = window.Items.dropItem(npc, id, 1, stack);
          try {
            const left = window.Items.countVariant ? window.Items.countVariant(npc, id, stack) : window.Items.countItem(npc, id);
            if (left < 1 && o.state) o.state.sel = null;
          } catch (e) { }
          toast(r.msg); await o.onChange();
        }, true, "Drop 1 of this copy — gone for good");
        if (n > 1) addBtn("Drop all", async () => {
          if (!confirm("Drop all " + n + "× " + dname + " from " + (npc.name || "them") + "? Gone for good.")) return;
          const r = window.Items.dropItem(npc, id, n, stack);
          if (o.state) o.state.sel = null;
          toast(r.msg); await o.onChange();
        }, true, "Drop this whole row — gone for good");
      }
    } else if (mode === "trade") {
      // player-to-player trade browser: instant give, or an offer the other
      // side can answer (counter-give) before the first side approves.
      // Copies travel whole: bench-work and names arrive with the gift.
      const peer = o.tradePeer;
      const vv = { up, nick };
      addBtn("🎁 Give 1", async () => {
        try {
          await window.MP.give(peer, id, 1, null, vv);
          sysBubbleSafe(`*You give ${tradePeerShort(peer)} 1× ${dname}.*`);
          updateHUD(); updateHotbar(); o.onChange();
        } catch (e) { toast("⚠️ " + (e.message || "Give failed."), 4000); }
      }, false, "Give 1 of this copy instantly (no strings)");
      if (n > 1) {
        addBtn("🎁 Give all", async () => {
          if (!confirm("Give all " + n + "× " + dname + " to " + tradePeerShort(peer) + "?")) return;
          try {
            await window.MP.give(peer, id, n, null, vv);
            if (o.state) o.state.sel = null;
            sysBubbleSafe(`*You give ${tradePeerShort(peer)} ${n}× ${dname}.*`);
            updateHUD(); updateHotbar(); o.onChange();
          } catch (e) { toast("⚠️ " + (e.message || "Give failed."), 4000); }
        }, true, "Give this whole row instantly");
        addBtn("⚖️ Offer all", async () => {
          try {
            window.MP.tradeOffer(peer, id, n, vv);
            toast("⚖️ Offered " + n + "× " + dname + " — they can give something back, then you approve.", 5000);
            o.onChange();
          } catch (e) { toast("⚠️ " + (e.message || "Offer failed."), 4000); }
        }, false, "Offer this whole row for trade");
      }
      addBtn("⚖️ Offer 1", async () => {
        try {
          window.MP.tradeOffer(peer, id, 1, vv);
          toast("⚖️ Offered 1× " + dname + " — they can give something back, then you approve.", 5000);
          o.onChange();
        } catch (e) { toast("⚠️ " + (e.message || "Offer failed."), 4000); }
      }, false, "Offer 1 of this copy for trade (they answer, you approve)");
    } else if (mode === "counter") {
      // answering an incoming offer: pick what to give back for THEIR item
      const offerId = o.offerId;
      const vv = { up, nick };
      addBtn("↩️ Counter ×1", async () => {
        try {
          window.MP.tradeCounter(offerId, id, 1, vv);
          toast("↩️ You offer back 1× " + dname + " — they approve to seal it.", 5000);
          o.onChange();
        } catch (e) { toast("⚠️ " + (e.message || "Counter failed."), 4000); }
      }, false, "Offer back 1 of this copy");
      if (n > 1) addBtn("↩️ Counter all", async () => {
        try {
          window.MP.tradeCounter(offerId, id, n, vv);
          if (o.state) o.state.sel = null;
          toast("↩️ You offer back " + n + "× " + dname + " — they approve to seal it.", 5000);
          o.onChange();
        } catch (e) { toast("⚠️ " + (e.message || "Counter failed."), 5000); }
      }, true, "Offer back this whole row");
    } else if (mode === "give") {
      const npc = o.giveTo;
      addBtn("Give", async () => { const r = window.Items.giveToNpc(o.giveFrom, npc, id, 1, stack); toast(r.msg); await o.onChange(); }, false, "Give 1 of this copy × " + dname);
      if (n > 1) addBtn("Give all", async () => { const r = window.Items.giveToNpc(o.giveFrom, npc, id, n, stack); toast(r.msg); await o.onChange(); }, true, "Give this whole row × " + dname);
    }
  }
  function paintBrowserListSide(o) {
    const st = o.state;
    const view = browserViewOf(o);
    if (view === "crafting" && o.showCraft) {
      o.listEl.innerHTML = "";
      const lh = document.createElement("div");
      lh.className = "menu-eyebrow items";
      lh.textContent = browserListTitle(o, view);
      o.listEl.appendChild(lh);
      renderCraftList(o.listEl, o.owner);
      o.sideEl.innerHTML = "";
      const dh = document.createElement("div");
      dh.className = "menu-eyebrow items";
      dh.textContent = "Details — what it makes";
      o.sideEl.appendChild(dh);
      const e = document.createElement("div");
      e.className = "invempty";
      e.textContent = "Pick a recipe to brew, forge or enchant it. Finished gear lands in its own tab above.";
      o.sideEl.appendChild(e);
      return;
    }
    if ((view === "spells" || view === "techs") && o.showSpells) {
      renderAbilityList(o.listEl, o.sideEl, o.owner, (st.q || "").trim().toLowerCase(), view);
      try {
        const lh = document.createElement("div");
        lh.className = "menu-eyebrow items";
        lh.textContent = browserListTitle(o, view);
        o.listEl.insertBefore(lh, o.listEl.firstChild);
        const dh = document.createElement("div");
        dh.className = "menu-eyebrow items";
        dh.textContent = "Details — cost + how to cast";
        o.sideEl.insertBefore(dh, o.sideEl.firstChild);
      } catch (e) { }
      return;
    }
    const rows = filteredStacks(o.owner, st, o.tabs);
    o.listEl.innerHTML = "";
    const lh = document.createElement("div");
    lh.className = "menu-eyebrow items";
    lh.textContent = browserListTitle(o, view);
    o.listEl.appendChild(lh);
    const cnt = document.createElement("div");
    cnt.className = "invcount";
    const qtrim = (st.q || "").trim();
    cnt.innerHTML = "";
    const cb = document.createElement("b");
    cb.textContent = `${rows.length} item${rows.length === 1 ? "" : "s"}`;
    cnt.appendChild(cb);
    const cs = document.createElement("span");
    cs.textContent = qtrim ? ` · filter “${qtrim}” · tap to inspect →` : " · tap to inspect →";
    cnt.appendChild(cs);
    o.listEl.appendChild(cnt);
    if (!rows.length) {
      const e = document.createElement("div");
      e.className = "invempty";
      e.textContent = (st.q || "").trim() ? "Nothing matches that search." : "Nothing here yet.";
      o.listEl.appendChild(e);
    }
    for (const s of rows) {
      const it = window.Items.ITEMS[s.id];
      if (!it) continue;
      const key = stackRowKey(s);
      const d = document.createElement("div");
      d.className = "invrow" + (st.sel === key ? " sel" : "");
      d.innerHTML = '<span class="invicon"></span><span class="invname"></span>';
      try { window.Icons.set(d.querySelector(".invicon"), "item", s.id); } catch (e) { }
      let nm = stackRowName(o.owner, s);
      try {
        if (o.mode === "player" && stackWornMark(o.owner, s)) nm += " (equipped)";
        if (o.mode === "npc" && o.owner.equipment && (o.owner.equipment.weapon === s.id || o.owner.equipment.armor === s.id || o.owner.equipment.trinket === s.id)) {
          try {
            const sl = it.slot;
            const wv = (sl && window.Items.wornVariantOf) ? window.Items.wornVariantOf(o.owner, sl) : null;
            if (!wv || (wv.up === window.Items.stackUp(s) && wv.nick === window.Items.stackNick(s))) nm += " (worn)";
          } catch (e) { nm += " (worn)"; }
        }
      } catch (e) { }
      d.querySelector(".invname").textContent = nm;
      d.title = ((() => { try { const nk = window.Items.stackNick(s); if (nk) return `"${nk}" (${it.name}) — ${it.desc}`; } catch (e) { } return it.desc || it.name; })());
      d.onclick = () => { const k = stackRowKey(s); st.sel = (st.sel === k) ? null : k; paintBrowserListSide(o); };
      o.listEl.appendChild(d);
    }
    const selStack = st.sel ? rows.find(s => stackRowKey(s) === st.sel) || null : null;
    if (st.sel && !selStack) {
      // selection left the filter (searched away, dropped, tab switched)
      paintItemSide(o.sideEl, o.owner, null, o.mode, o);
    } else {
      paintItemSide(o.sideEl, o.owner, selStack, o.mode, o);
    }
  }
  // o: { tabsEl, searchEl, listEl, sideEl, owner, mode, state, tabs, showCraft,
  //      showSpells, tabsLabel, listTitle, giveFrom, giveTo, onChange, onTabChange }
  function paintBrowser(o) {
    renderBrowserTabs(o);
    if (o.searchEl && !o.searchEl._wired) {
      o.searchEl._wired = true;
      o.searchEl.oninput = () => { o.state.q = o.searchEl.value; paintBrowserListSide(o); };
    }
    if (o.searchEl && o.searchEl.value !== o.state.q) o.searchEl.value = o.state.q;
    if (o.searchEl) {
      try {
        if (o.mode === "npc") o.searchEl.placeholder = "🔍 Search their backpack…";
        else if (o.mode === "give") o.searchEl.placeholder = "🔍 Search your pockets to give…";
        else if (o.mode === "trade" || o.mode === "counter") o.searchEl.placeholder = "🔍 Search your pockets…";
        else o.searchEl.placeholder = "🔍 Search pockets by name…";
        o.searchEl.setAttribute("aria-label", o.searchEl.placeholder);
      } catch (e) { }
    }
    paintBrowserListSide(o);
  }
  function renderInv() {
    const p = window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    // equipment (worn) — slot rows read as WORN items, not filter tabs
    const eq = $("invEquip");
    if (eq) {
      eq.innerHTML = "";
      const slotLabel = { weapon: "WEAPON", armor: "ARMOR", trinket: "TRINKET", shield: "SHIELD" };
      for (const slot of ["weapon", "armor", "trinket", "shield"]) {
        const id = p.equipment && p.equipment[slot];
        const it = id && window.Items.ITEMS[id];
        const d = document.createElement("div");
        d.className = "invrow" + (id ? " sel" : "");
        d.style.cursor = "default";
        d.innerHTML = '<span class="invicon"></span><span class="invname"></span><span class="invact"></span>';
        try { if (it) window.Icons.set(d.querySelector(".invicon"), "item", id); } catch (e) { }
        let wornName = "empty";
        try {
          if (it) {
            wornName = window.Items.variantName({ id, up: (p.equipmentUp && p.equipmentUp[slot]) || 0, nick: (p.equipmentNick && p.equipmentNick[slot]) || "" });
            const wup = (p.equipmentUp && p.equipmentUp[slot]) || 0;
            if (wup > 0) wornName += ` +${wup * ((window.Items && window.Items.GEAR_UP_PCT) || 50)}%`;
            wornName += " (worn)";
          }
        } catch (e) { wornName = it ? it.name + " (worn)" : "empty"; }
        d.querySelector(".invname").textContent = (slotLabel[slot] || slot.toUpperCase()) + " — " + wornName;
        d.querySelector(".invname").title = it ? it.desc : "Empty slot — equip one from Pockets below";
        const act = d.querySelector(".invact");
        if (id) {
          const b = document.createElement("button");
          b.textContent = "Unequip"; b.className = "ghost";
          b.title = "Take off " + it.name;
          b.onclick = () => { const r = window.Items.unequip(p, slot); toast(r.msg); saveAndRefreshInv(); };
          act.appendChild(b);
        }
        eq.appendChild(d);
      }
      // attack slot picker: attack button / click / empty Space use this
      // hotbar slot (weapons swing, spells cast, empty = bare fists) — or
      // "No slot" to always fight unarmed.
      try {
        const arow = document.createElement("div");
        arow.className = "invrow";
        arow.style.cursor = "default";
        arow.style.borderColor = "#ffd76a";
        arow.innerHTML = '<span class="invicon"></span><span class="invname"></span><span class="invact"></span>';
        try { window.Icons.set(arow.querySelector(".invicon"), "tree", "unarmed"); } catch (e) { }
        const acur = window.Items.getDefaultWeaponSlot(p);
        const AHN = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
        arow.querySelector(".invname").textContent = "ATTACK — " + (acur < 0 ? "No slot (unarmed)" : hotkeyLabel(acur)) + " · attack button / click use it (empty = bare fists)";
        arow.querySelector(".invname").title = "Pick the hotbar slot your attack uses — or No slot to always fight bare-fisted. Pressing a weapon hotkey in-world re-arms that slot.";
        const asel = document.createElement("select");
        asel.title = "Pick the hotbar slot your attack uses (No slot = always bare fists)";
        const ano = document.createElement("option");
        ano.value = "none"; ano.textContent = "No slot — unarmed (bare fists)";
        if (acur < 0) ano.selected = true;
        asel.appendChild(ano);
        for (let i = 0; i < AHN; i++) {
          const op = document.createElement("option");
          op.value = String(i + 1); op.textContent = hotkeyLabel(i);
          if (i === acur) op.selected = true;
          asel.appendChild(op);
        }
        asel.onchange = () => { try { window.Items.setDefaultWeaponSlot(p, asel.value === "none" ? -1 : Number(asel.value) - 1); } catch (e) { } saveAndRefreshInv(); };
        arow.querySelector(".invact").appendChild(asel);
        eq.appendChild(arow);
      } catch (e) { }
      // off-hand slot picker: Q uses this hotbar slot (weapons/shields/empty parry)
      try {
        const orow = document.createElement("div");
        orow.className = "invrow";
        orow.style.cursor = "default";
        orow.style.borderColor = "#7fc4ff";
        orow.innerHTML = '<span class="invicon"></span><span class="invname"></span><span class="invact"></span>';
        try { window.Icons.set(orow.querySelector(".invicon"), "item", "iron_shield"); } catch (e) { }
        const cur = window.Items.getOffhandSlot(p);
        const HN = (window.CFG && window.CFG.HOTBAR_SIZE) || 10;
        orow.querySelector(".invname").textContent = "OFF-HAND (Q) — " + (cur < 0 ? "No slot (unarmed)" : hotkeyLabel(cur)) + " · Q uses it (spell/throwable fires, weapon/shield/empty parries)";
        orow.querySelector(".invname").title = "Pick any hotbar slot as your off-hand — or No slot to always parry bare-fisted. Q fires its spell/throwable, or parries with its weapon/shield (empty = bare fists).";
        const sel = document.createElement("select");
        sel.title = "Pick the hotbar slot Q uses as your off-hand (No slot = always bare-fists parry)";
        const no = document.createElement("option");
        no.value = "none"; no.textContent = "No slot — unarmed (bare-fists parry)";
        if (cur < 0) no.selected = true;
        sel.appendChild(no);
        for (let i = 0; i < HN; i++) {
          const op = document.createElement("option");
          op.value = String(i + 1); op.textContent = hotkeyLabel(i);
          if (i === cur) op.selected = true;
          sel.appendChild(op);
        }
        sel.onchange = () => { try { window.Items.setOffhandSlot(p, sel.value === "none" ? -1 : Number(sel.value) - 1); } catch (e) { } saveAndRefreshInv(); };
        orow.querySelector(".invact").appendChild(sel);
        eq.appendChild(orow);
      } catch (e) { }
      // v16 hell: fragment count + Join Sphere button (12 distinct delves -> sphere).
      try {
        const hrow = document.createElement("div");
        hrow.className = "invrow";
        hrow.style.cursor = "default";
        hrow.style.borderColor = "#ff3a00";
        hrow.innerHTML = '<span class="invicon"></span><span class="invname"></span><span class="invact"></span>';
        let fragN = 0, hasSph = false;
        try { fragN = window.Hell ? window.Hell.fragmentCount(p) : 0; } catch (e2) { fragN = 0; }
        try { hasSph = window.Hell ? window.Hell.hasSphere(p) : false; } catch (e2) { hasSph = false; }
        try { window.Icons.set(hrow.querySelector(".invicon"), "item", hasSph ? "hell_sphere" : "hell_fragment"); } catch (e) { }
        const nmEl = hrow.querySelector(".invname");
        nmEl.textContent = hasSph ? "HELL SPHERE — awake. E on a far tower (1000 out) to enter hell." : ("Hell fragments " + fragN + "/12 — slay 12 different delve lords." + (fragN >= 12 ? " Ready to join!" : ""));
        nmEl.title = "Hell fragments drop from surface delve lords (distinct delves only). Join 12 into a Hell Sphere to wake the far towers.";
        const act = hrow.querySelector(".invact");
        if (!hasSph && fragN >= 12) {
          const b = document.createElement("button");
          b.textContent = "Join 12 → Sphere";
          b.title = "Fuse 12 distinct hell fragments into a Hell Sphere";
          b.onclick = () => { try { const r = window.Hell.joinSphere(); toast(r && r.ok ? "HELL SPHERE forged!" : (((r && r.error) || "can't join"))); } catch (e2) { } saveAndRefreshInv(); };
          act.appendChild(b);
        }
        eq.appendChild(hrow);
      } catch (e) { }
    }
    // tabbed pockets + sidebar (+ crafting + spells tabs)
    paintBrowser({
      tabsEl: $("invTabs"), searchEl: $("invSearch"), listEl: $("invList"), sideEl: $("invSide"),
      owner: p, mode: "player", state: invState, tabs: INV_TABS, showCraft: true, showSpells: true,
      onChange: () => saveAndRefreshInv(),
    });
    // spells & Deep Arts live on their own ✨ Spells / ⚔️ Deep Arts tabs now (rendered by
    // paintBrowserListSide) — keep the old section hidden, never rendered.
    const abs = $("invAbilities");
    if (abs) { abs.innerHTML = ""; abs.hidden = true; }
  }

  function saveAndRefreshInv() {
    try { window.Entities.recalcDerived(window.Game.G.player, true); } catch (e) { }
    try { window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) { }
    try { window.Game.saveGame(true); } catch (e) { }
    try { renderInv(); } catch (e) { }
    try { if (!$("charModal").hidden) renderChar(); } catch (e) { }
  }

  // ---------- character: stats + magic perks ----------
  function toggleChar(force) {
    const m = $("charModal");
    const show = force !== undefined ? force : m.hidden;
    m.hidden = !show;
    if (show) renderChar();
  }
  function renderChar() {
    const p = window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) { }
    const info = $("charInfo");
    if (info) {
      const sp = p.statPoints | 0;
      let unsp = 0, legacy = 0;
      try { unsp = window.Entities.unspentSkillPoints ? window.Entities.unspentSkillPoints(p) : (p.skillPoints | 0); } catch (e) { unsp = p.skillPoints | 0; }
      try { legacy = Math.max(0, p.skillPoints | 0); } catch (e) { }
      if ($("charPts")) $("charPts").textContent = (sp + unsp) > 0 ? `· ✨ ${sp} stat · ${unsp} skill to spend` : "";
      info.innerHTML = "";
      const d = document.createElement("div");
      d.innerHTML = `<b></b> <span class="sub"></span>`;
      d.querySelector("b").textContent = `${p.name} · lv ${p.lv} · XP ${p.xp}/${window.CFG.xpNext(p.lv)}`;
      d.querySelector(".sub").textContent = `HP ${Math.ceil(p.hp)}/${p.maxHp} · MP ${Math.ceil(p.mp)}/${p.maxMp} · ⚡ ${Math.ceil(p.stamina || 0)}/${p.maxStamina || 100} · ATK ${p.atk} MATK ${p.matk | 0} DEF ${p.def} SDEF ${p.sdef | 0} SPD ${p.spd.toFixed(1)} — unspent: ${sp} stat · ${unsp} skill${legacy ? ` (${legacy} legacy, any tree)` : ""}`;
      try {
        const A = window.Appearance;
        if (A) {
          const rc = (p.appearance && p.appearance.race) || p.race || "human";
          const f = document.createElement("div");
          f.className = "sub";
          let bonus = "+1 all stats";
          try {
            if (rc !== "human") {
              const b = A.RACE_BONUS[rc] || {};
              const names = { str: "Strength", end: "Endurance", agi: "Agility", int: "Intellect", cha: "Charm", luk: "Luck", for: "Fortitude" };
              bonus = Object.keys(b).filter(k => b[k] > 0).map(k => `+${b[k]} ${names[k] || k}`).join(", ");
            }
          } catch (e2) { }
          f.textContent = `${A.RACE_ICON[rc] || "🌟"} Race: ${A.RACE_LABEL[rc] || rc} (${bonus})`;
          d.appendChild(f);
          try {
            const ab = (A.RACE_ABILITY && A.RACE_ABILITY[rc]) || "";
            if (ab) {
              const f2 = document.createElement("div");
              f2.className = "sub";
              f2.textContent = `✨ ${ab}`;
              d.appendChild(f2);
            }
          } catch (e3) { }
        }
      } catch (e) { }
      try {
        const focus = window.Items && window.Items.describeFocus ? window.Items.describeFocus(p) : "";
        if (focus) {
          const f = document.createElement("div");
          f.className = "sub";
          f.textContent = "🎯 " + focus + " (first wand/staff in hotbar counts)";
          d.appendChild(f);
        }
      } catch (e) { }
      info.appendChild(d);
    }
    // stats
    const sl = $("statList");
    if (sl) {
      sl.innerHTML = "";
      for (const [key, def] of Object.entries(window.CFG.STATS)) {
        const d = document.createElement("div");
        d.className = "invrow";
        d.innerHTML = `<span class="invicon"></span><span class="invname"></span><span class="invact"></span>`;
        try { window.Icons.set(d.querySelector(".invicon"), "stat", key); } catch (e) { }
        d.querySelector(".invname").textContent = `${def.name} ${p.stats[key]} — ${def.desc}`;
        const b = document.createElement("button");
        b.textContent = "+";
        b.disabled = (p.statPoints | 0) <= 0;
        b.title = (p.statPoints | 0) > 0 ? "Spend 1 stat point" : "Level up to earn stat points";
        b.onclick = () => {
          if (window.Entities.spendStatPoint(p, key)) { toast(`${def.name} → ${p.stats[key]}`); try { window.Sfx.level(); } catch (e) { } }
          else toast("No stat points. Level up to earn more.");
          saveAndRefreshInv(); renderChar();
        };
        d.querySelector(".invact").appendChild(b);
        sl.appendChild(d);
      }
    }
    // skill trees: Attributes | Weapons | Guard | Spells | Deep Arts tabs, gated node cards
    try { paintCharTabs(p); } catch (e) { }
    const showStats = charTab === "stats", showWeapons = charTab === "weapons", showGuard = charTab === "guard", showSpells = charTab === "spells", showTechs = charTab === "techs", showTaming = charTab === "taming", showAff = charTab === "afflictions";
    try {
      const intro = $("charIntro");
      if (intro) {
        const sp = p.statPoints | 0;
        let leg = 0;
        try { leg = Math.max(0, p.skillPoints | 0); } catch (e) { }
        const ptsHere = (() => {
          try {
            if (showStats) return sp;
            const E = window.Entities;
            if (!E.treePoints) return leg;
            if (showWeapons) {
              let n = leg;
              try { for (const id of Object.keys((window.CFG && window.CFG.SKILL_TREES) || {})) { if (id === "armor" || id === "robe" || id === "kasaya" || id === "habitus") continue; n += E.treePoints(p, id) | 0; } } catch (e) { }
              return n;
            }
            if (showGuard) {
              let n = leg;
              try { n += E.treePoints(p, "armor") | 0; n += E.treePoints(p, "robe") | 0; n += E.treePoints(p, "kasaya") | 0; n += E.treePoints(p, "habitus") | 0; } catch (e) { }
              return n;
            }
            if (showSpells) {
              let n = leg;
              try { for (const id of (p.abilities || [])) { const k = (window.CFG.ABILITIES[id] || {}).kind; if (k !== "technique") n += E.treePoints(p, id) | 0; } } catch (e) { }
              return n;
            }
            if (showTechs) {
              let n = leg;
              try {
                const T = (window.CFG && window.CFG.TECHNIQUES) || {};
                for (const id of (p.abilities || [])) { if ((window.CFG.ABILITIES[id] || {}).kind === "technique") n += E.treePoints(p, id) | 0; }
                for (const id of (p.techniques || [])) { if (T[id] && !T[id].active) n += E.treePoints(p, id) | 0; }
              } catch (e) { }
              return n;
            }
            if (showTaming) { try { return (E.treePoints(p, "taming") | 0) + leg; } catch (e) { return leg; } }
            if (showAff) {
              let n = leg;
              try { for (const id of Object.keys((window.CFG && window.CFG.STATUS_TREES) || {})) n += E.treePoints(p, id) | 0; } catch (e) { }
              return n;
            }
          } catch (e) { return 0; }
          return 0;
        })();
        const msgs = {
          stats: `📊 Attributes — spend ${sp} stat point${sp === 1 ? "" : "s"} from levels here. Only this tab spends stat points.`,
          weapons: `🗡️ Weapon mastery — each tree earns its own points by fighting (${ptsHere} to spend here). Pick a weapon below, then a node.`,
          guard: `🛡️ Guard — armor, robes, kasaya and habitus earn their own points (${ptsHere} to spend here). Stoneskin and Wardweave learn by taking hits; Ascetic by dealing physical hits in kasaya; Devotion by dealing spell hits in a habitus.`,
          spells: `✨ Spell mastery — each spell earns its own points by casting (${ptsHere} to spend here). Pick a spell below, then a node.`,
          techs: `⚔️ Deep Arts — each art earns its own points by deed and use (${ptsHere} to spend here). Actives bind like spells; passives are always on.`,
          taming: `🐾 Taming — each rank bends more beasts (${ptsHere} to spend here). Tame to earn.`,
          afflictions: `☠️ Afflictions — each ailment earns its own points by afflicting foes (${ptsHere} to spend here). Blind harder, slow deeper, exploit the suffering.`,
        };
        intro.textContent = msgs[charTab] || "";
        intro.style.borderColor = ptsHere > 0 ? "#ffd93d" : "";
        intro.style.color = ptsHere > 0 ? "#ffd93d" : "";
        intro.style.fontWeight = ptsHere > 0 ? "900" : "";
      }
    } catch (e) { }
    try {
      if ($("statH")) $("statH").hidden = !showStats;
      if ($("statList")) $("statList").hidden = !showStats;
      if ($("weaponH")) $("weaponH").hidden = !showWeapons;
      if ($("weaponList")) $("weaponList").hidden = !showWeapons;
      if ($("guardH")) $("guardH").hidden = !showGuard;
      if ($("guardList")) $("guardList").hidden = !showGuard;
      if ($("magicH")) $("magicH").hidden = !showSpells;
      if ($("magicList")) $("magicList").hidden = !showSpells;
      if ($("techH")) $("techH").hidden = !showTechs;
      if ($("techList")) $("techList").hidden = !showTechs;
      if ($("tameH")) $("tameH").hidden = !showTaming;
      if ($("tameList")) $("tameList").hidden = !showTaming;
      if ($("affH")) $("affH").hidden = !showAff;
      if ($("affList")) $("affList").hidden = !showAff;
    } catch (e) { }
    if (showWeapons) { try { renderWeaponTrees(p); } catch (e) { } }
    if (showGuard) { try { renderGuardTrees(p); } catch (e) { } }
    if (showSpells) { try { renderSpellTrees(p); } catch (e) { } }
    if (showTechs) { try { renderTechTrees(p); } catch (e) { } }
    if (showTaming) { try { renderTamingTrees(p); } catch (e) { } }
    if (showAff) { try { renderAfflictionTrees(p); } catch (e) { } }
  }

  // ---------- skill-tree state + renderers ----------
  let charTab = "stats"; // 'stats' | 'weapons' | 'guard' | 'spells' | 'techs' | 'taming' | 'afflictions'
  let charWeaponSel = "sword";
  let charGuardSel = "armor";
  let charSpellSel = null;
  let charTechSel = null;
  let charAffSel = "status_poison";
  const SPELL_MASTERY_DESC = {
    fireball: "Longer burn, +range, faster cooldown",
    frostbite: "Longer freeze, +range, faster cooldown", heal: "Also restores 25% MP",
    tornado: "+1.2 range, faster cooldown", hurricane: "Vast eye: wider storm, hurling winds, faster cooldown",
    angel_of_life: "Bigger MP refund, faster cooldown",
    whirlwind: "+1.2 range, faster cooldown",
    shieldwall: "9s guard, faster cooldown", revive: "Full-HP revive, +5 MP refund",
    lightning: "Chains to a 2nd foe, faster cooldown, longer paralyze",
    venom: "Stronger poison, faster cooldown",
    immolate: "Stronger burn, faster cooldown",
    glacier: "Longer freeze, faster cooldown",
    thunder_hex: "Longer paralyze pressure, faster cooldown",
    dazzle: "Longer blindness, faster cooldown",
    smite: "Ruinous vs undead and demons, longer blindness, faster cooldown",
    tideburst: "Stronger soak, longer slow, faster cooldown",
    water_jet: "Stronger jet, faster cooldown",
    holy_sword: "Wider dawn: longer cone, half the mana back",
    cinder_edge: "Longer arc, crueler burn (10 burn, 14 mastered)",
    skullsplitter: "Sunder bites deeper (-30 DEF)",
    avalanche: "Deeper freeze, wider ring",
    tempest_lance: "The storm forks: arcs to a 2nd foe",
    spiral_pike: "Harder whirl: 6x + 15s guard stance",
    dragon_coil: "Longer surge, harder venom (8.5x + stronger poison)",
    thorn_reign: "Two more thorns + venom on every barb",
    comet_shot: "Heavier comet: 11x, wider splash, crueler burn",
    hammerfell_impact: "Harder slam: 8x, wider ring, longer stun",
    sentinel: "Tip strikes bite deeper (2x -> 2.5x)",
    skirmisher: "Close shots bite deeper (2x -> 2.5x)",
    viper_flurry: "Eight strikes, stronger venom",
    iron_palm: "Heavier hand: 12x, longer stun",
    feint_attack: "A fourth feint: chain one more dash before the cooldown.",
    backstab: "Openings strike deeper (3x -> 3.5x)",
    deadeye: "Far shots bite deeper (2x -> 2.5x)",
    executioner: "Finish harder (2x -> 2.5x)",
    tidal_wave: "Wider wave, longer ride, soaking slow",
    energy_beam: "Longer beam that blinds",
    meteorfall: "Two more skyfires, crueler burn",
    whiteout: "Wider whiteout, longer freeze",
    cleanse: "Refunds MP with upgrades, faster cooldown",
    panacea: "Refunds MP with upgrades, faster cooldown",
    stalwart_reflector: "Longer mirror: 3s of reflection",
    locust_swarm: "Wider swarm (7 tiles), longer feast (16s)",
    thundering_crack: "Wider crack (6 tiles), tailwind lasts 12s",
    whirlwind_slinger: "Wider spiral (3.5 tiles), longer spin (7s), harder hits",
  };
  // Codex reads this live so mastery notes stay in sync with balance edits.
  function masteryDesc(abId) { try { return SPELL_MASTERY_DESC[abId] || ""; } catch (e) { return ""; } }
  function paintCharTabs(p) {
    const bar = $("charTabs");
    if (!bar) return;
    bar.innerHTML = "";
    const sp = p.statPoints | 0;
    let leg = 0;
    try { leg = Math.max(0, p.skillPoints | 0); } catch (e) { }
    // Points spendable inside a tab = that tab's own tree balances + the
    // retired generic pool (old saves), which spends in any tree.
    const spendIn = (ids) => {
      let n = leg;
      try {
        const E = window.Entities;
        if (E.treePoints) for (const id of ids) { try { n += E.treePoints(p, id) | 0; } catch (e) { } }
      } catch (e) { }
      return n;
    };
    let wIds = [];
    try { wIds = Object.keys((window.CFG && window.CFG.SKILL_TREES) || {}).filter(id => id !== "armor" && id !== "robe" && id !== "kasaya" && id !== "habitus"); } catch (e) { }
    let sIds = [], tIds = [];
    try {
      const isTech = (id) => { try { return (window.CFG.ABILITIES[id] || {}).kind === "technique"; } catch (e) { return false; } };
      sIds = (p.abilities || []).filter(id => !isTech(id));
      const T = (window.CFG && window.CFG.TECHNIQUES) || {};
      const pass = (p.techniques || []).filter(id => T[id] && !T[id].active);
      tIds = [...(p.abilities || []).filter(isTech), ...pass];
    } catch (e) { }
    let aIds = [];
    try { aIds = Object.keys((window.CFG && window.CFG.STATUS_TREES) || {}); } catch (e) { }
    const defs = [["stats", "📊 Attributes" + (sp ? " (" + sp + ")" : ""), 0],
      ["weapons", "🗡️ Weapons", spendIn(wIds)],
      ["guard", "🛡️ Guard", spendIn(["armor", "robe", "kasaya", "habitus"])],
      ["spells", "✨ Spells", spendIn(sIds)],
      ["techs", "⚔️ Deep Arts", spendIn(tIds)],
      ["taming", "🐾 Taming", spendIn(["taming"])],
      ["afflictions", "☠️ Afflictions", spendIn(aIds)]];
    for (const triple of defs) {
      const id = triple[0], n = triple[2];
      const b = document.createElement("button");
      b.textContent = triple[1] + (id !== "stats" && n > 0 ? " (+" + n + ")" : "");
      const cls = [];
      if (charTab === id) cls.push("active");
      if (id !== "stats" && n > 0) cls.push("haspts");
      b.className = cls.join(" ");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", charTab === id ? "true" : "false");
      if (id !== "stats" && n > 0) b.title = n + " point" + (n === 1 ? "" : "s") + " to spend in this tab";
      else b.title = triple[1] + " — tab (only one section shows at a time)";
      b.onclick = ((tid) => () => { charTab = tid; renderChar(); })(id);
      bar.appendChild(b);
    }
  }
  function renderWeaponTrees(p) {
    const list = $("weaponList");
    if (!list) return;
    list.innerHTML = "";
    const trees = (window.CFG && window.CFG.SKILL_TREES) || {};
    const ids = Object.keys(trees).filter(id => id !== "armor" && id !== "robe" && id !== "kasaya" && id !== "habitus");
    if (!ids.length) return;
    if (!trees[charWeaponSel] || charWeaponSel === "armor" || charWeaponSel === "robe" || charWeaponSel === "kasaya" || charWeaponSel === "habitus") charWeaponSel = ids[0];
    let totals = {};
    try { totals = window.Entities.weaponTreeTotals(p); } catch (e) { }
    const sub = document.createElement("div");
    sub.className = "wsub";
    for (const id of ids) {
      const b = document.createElement("button");
      const n = totals[id] | 0;
      let pts = 0;
      try { pts = window.Entities.treePoints ? window.Entities.treePoints(p, id) : 0; } catch (e) { }
      // spendable here = this tree's own balance + the retired generic pool
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e) { }
      const spend = (pts | 0) + leg;
      b.innerHTML = `${window.Icons.img("tree", id, 18)} ${trees[id].name}${n ? " ·" + n : ""}${spend ? " (+" + spend + ")" : ""}`;
      const cls = [];
      if (id === charWeaponSel) cls.push("active");
      if (spend) { cls.push("haspts"); b.title = spend + " point" + (spend === 1 ? "" : "s") + " to spend here"; }
      b.className = cls.join(" ");
      b.onclick = ((fid) => () => { charWeaponSel = fid; renderWeaponTrees(p); })(id);
      sub.appendChild(b);
    }
    list.appendChild(sub);
    const tr = trees[charWeaponSel];
    if (tr.hint) { const h = document.createElement("div"); h.className = "invempty"; h.textContent = tr.hint; list.appendChild(h); }
    // per-tree points: what this tree holds + how far the next point is
    try {
      const E = window.Entities;
      const own = E.treePoints ? E.treePoints(p, charWeaponSel) : 0;
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e2) { }
      const spend = (own | 0) + leg;
      const need = E.treeEarnNeed ? E.treeEarnNeed(charWeaponSel) : null;
      const bought = E.treeRanksBought ? E.treeRanksBought(p, charWeaponSel) : 0;
      const max = E.treeRanksMax ? E.treeRanksMax(charWeaponSel) : 0;
      if (need) {
        const d = document.createElement("div");
        d.className = "invempty";
        const prog = E.treeProgress ? E.treeProgress(p, charWeaponSel) : 0;
        let capped = false;
        try { capped = E.treeCapped ? !!E.treeCapped(p, charWeaponSel) : (bought + (own | 0) >= max); } catch (e2) { capped = (bought + (own | 0) >= max); }
        d.textContent = bought >= max
          ? `${tr.name} is complete (${bought}/${max})${spend ? ` · ${spend} unspent point${spend === 1 ? "" : "s"} left` : ""}.`
          : capped
            ? `${spend} ${tr.name} point${spend === 1 ? "" : "s"} to spend · enough to finish the tree — no more to earn.`
            : `${spend} ${tr.name} point${spend === 1 ? "" : "s"} to spend · earn more by ${need.how} (${prog}/${need.per} ${need.unit}).`;
        list.appendChild(d);
      }
    } catch (e) { }
    // Which technique trees ride this weapon tree (explicit, per request).
    try {
      const famTech = Object.keys((window.CFG && window.CFG.TECHNIQUES) || {}).filter(id => {
        try { return window.Entities.techWeaponFam ? (window.Entities.techWeaponFam(id) === charWeaponSel || (charWeaponSel === "shuriken" && (((window.CFG.TECHNIQUES[id].req || {}).fam || {}).thrown != null))) : ((window.CFG.TECHNIQUES[id].req || {}).fam || {})[charWeaponSel] != null; } catch (e) { return false; }
      });
      if (charWeaponSel === "parry") {
        const d = document.createElement("div");
        d.className = "invempty";
        d.textContent = "Empowers your guard: Open Window widens the Q parry window, Quick Recovery shortens its cooldown, Instinct answers blows on its own. Needs no weapon — the off-hand slot does the work (weapon 1/10, shield 1/20 x tier, fists 1/5).";
        list.appendChild(d);
      } else if (charWeaponSel === "shield") {
        const d = document.createElement("div");
        d.className = "invempty";
        const names = famTech.map(id => {
          try { const t = window.CFG.TECHNIQUES[id]; return (t.name || id); } catch (e) { return id; }
        }).join(", ");
        d.textContent = "Empowers Deep Arts: " + (names || "Stalwart Reflector") + ". Stalwart Reflector requires a shield equipped and inherits every unlocked rank of this tree. Shield parries cut blows to 1/20 x shield tier — and a worn shield guards passively (+DEF/+SDEF).";
        list.appendChild(d);
      } else if (famTech.length) {
        const names = famTech.map(id => {
          try { const t = window.CFG.TECHNIQUES[id]; return (t.name || id); } catch (e) { return id; }
        }).join(", ");
        const d = document.createElement("div");
        d.className = "invempty";
        d.textContent = "Empowers Deep Arts: " + names + ". Actives require this weapon as your default weapon, gain every unlocked rank of this tree, and scale with the wielded weapon's strength (iron > rusted, better bow > worse bow). Passives only trigger while this weapon is wielded.";
        list.appendChild(d);
      }
    } catch (e) { }
    renderSkillTree(list, p, charWeaponSel, tr.nodes, (p.weaponPerks && p.weaponPerks[charWeaponSel]) || {}, null);
  }
  // Guard tab (🛡️): Stoneskin + Wardweave + Ascetic + Devotion. Same
  // gated node cards as weapons; armor/robes earn by taking hits in the
  // matching shell, kasaya by dealing physical hits, habitus by spell hits.
  function renderGuardTrees(p) {
    const list = $("guardList");
    if (!list) return;
    list.innerHTML = "";
    const trees = (window.CFG && window.CFG.SKILL_TREES) || {};
    const ids = ["armor", "robe", "kasaya", "habitus"].filter(id => trees[id]);
    if (!ids.length) { const e = document.createElement("div"); e.className = "invempty"; e.textContent = "No guard shells yet."; list.appendChild(e); return; }
    if (!trees[charGuardSel]) charGuardSel = ids[0];
    let totals = {};
    try { totals = window.Entities.weaponTreeTotals(p); } catch (e) { }
    let worn = null;
    try { worn = window.Entities.armorWornClass ? window.Entities.armorWornClass(p) : null; } catch (e) { }
    const sub = document.createElement("div");
    sub.className = "wsub";
    for (const id of ids) {
      const b = document.createElement("button");
      const n = totals[id] | 0;
      let pts = 0;
      try { pts = window.Entities.treePoints ? window.Entities.treePoints(p, id) : 0; } catch (e) { }
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e) { }
      const spend = (pts | 0) + leg;
      b.innerHTML = `${window.Icons.img("tree", id, 18)} ${trees[id].name}${n ? " ·" + n : ""}${spend ? " (+" + spend + ")" : ""}${worn === id ? " ●" : ""}`;
      const cls = [];
      if (id === charGuardSel) cls.push("active");
      if (spend) { cls.push("haspts"); b.title = spend + " point" + (spend === 1 ? "" : "s") + " to spend here"; }
      if (worn === id) b.title = (b.title ? b.title + " · " : "") + (id === "kasaya" ? "worn now — dealing physical hits feeds this tree" : id === "habitus" ? "worn now — dealing spell hits feeds this tree" : "worn now — taking hits feeds this tree");
      b.className = cls.join(" ");
      b.onclick = ((fid) => () => { charGuardSel = fid; renderGuardTrees(p); })(id);
      sub.appendChild(b);
    }
    list.appendChild(sub);
    const tr = trees[charGuardSel];
    if (tr.hint) { const h = document.createElement("div"); h.className = "invempty"; h.textContent = tr.hint; list.appendChild(h); }
    try {
      const shell = document.createElement("div");
      shell.className = "invempty";
      let aname = "bare";
      try {
        const aid = p.equipment && p.equipment.armor;
        aname = aid && window.Items && window.Items.ITEMS[aid] ? window.Items.ITEMS[aid].name : "bare";
      } catch (e) { }
      const feeding = worn === "armor" ? "🛡️ Stoneskin is learning from your hits" : worn === "robe" ? "🧙 Wardweave is learning from your hits" : worn === "kasaya" ? "📿 Ascetic is learning from your strikes" : worn === "habitus" ? "🕯️ Devotion is learning from your spells" : "⚠️ Wear a shell — bare skin learns nothing";
      shell.textContent = `Worn shell: ${aname} · ${feeding}.`;
      list.appendChild(shell);
    } catch (e) { }
    try {
      const E = window.Entities;
      const own = E.treePoints ? E.treePoints(p, charGuardSel) : 0;
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e2) { }
      const spend = (own | 0) + leg;
      const need = E.treeEarnNeed ? E.treeEarnNeed(charGuardSel) : null;
      const bought = E.treeRanksBought ? E.treeRanksBought(p, charGuardSel) : 0;
      const max = E.treeRanksMax ? E.treeRanksMax(charGuardSel) : 0;
      if (need) {
        const d = document.createElement("div");
        d.className = "invempty";
        const prog = E.treeProgress ? E.treeProgress(p, charGuardSel) : 0;
        let capped = false;
        try { capped = E.treeCapped ? !!E.treeCapped(p, charGuardSel) : (bought + (own | 0) >= max); } catch (e2) { capped = (bought + (own | 0) >= max); }
        d.textContent = bought >= max
          ? `${tr.name} is complete (${bought}/${max})${spend ? ` · ${spend} unspent point${spend === 1 ? "" : "s"} left` : ""}.`
          : capped
            ? `${spend} ${tr.name} point${spend === 1 ? "" : "s"} to spend · enough to finish the tree — no more to earn.`
            : `${spend} ${tr.name} point${spend === 1 ? "" : "s"} to spend · earn more by ${need.how} (${prog}/${need.per} ${need.unit}).`;
        list.appendChild(d);
      }
    } catch (e) { }
    renderSkillTree(list, p, charGuardSel, tr.nodes, (p.weaponPerks && p.weaponPerks[charGuardSel]) || {}, null);
  }
  function renderSpellTrees(p) {
    const ml = $("magicList");
    if (!ml) return;
    ml.innerHTML = "";
    const isCata = (id) => { try { return (window.CFG.ABILITIES[id] || {}).kind === "cataclysm"; } catch (e) { return false; } };
    const spellIds = p.abilities.filter(id => { try { const k = (window.CFG.ABILITIES[id] || {}).kind; return k !== "technique" && k !== "cataclysm"; } catch (e) { return true; } });
    const cataIds = p.abilities.filter(isCata);
    if (!spellIds.length && !cataIds.length) { const e = document.createElement("div"); e.className = "invempty"; e.textContent = "No spells yet - read spellbooks."; ml.appendChild(e); return; }
    const allIds = [...spellIds, ...cataIds];
    if (!allIds.includes(charSpellSel)) charSpellSel = allIds[0];
    renderTreeSection(p, ml, "Spells", "Base spells are instant; higher tiers channel 1.5-2.5s by depth (rooted until release). Spells inherit previous tiers one-way (e.g. Glacier gains Frostbite's ranks, never the reverse).", spellIds);
    renderTreeSection(p, ml, "Cataclysms", "Deep-delve magic - channeled 1.5-2.5s, fight-ending. Each cataclysm inherits every unlocked rank of its element's lower tiers (one-way).", cataIds);
  }
  // Techniques live in their own tab now (⚔️ next to ✨): active arts the
  // hero cast, plus learnt passive arts that are always on.
  function renderTechTrees(p) {    const tl = $("techList");
    if (!tl) return;
    tl.innerHTML = "";
    const T = (window.CFG && window.CFG.TECHNIQUES) || {};
    const isTech = (id) => { try { return (window.CFG.ABILITIES[id] || {}).kind === "technique"; } catch (e) { return false; } };
    // learnt passive techniques have trees of their own (deeds, not spellbooks)
    const techPassiveIds = (p.techniques || []).filter(id => T[id] && !T[id].active);
    const techActiveIds = p.abilities.filter(isTech);
    if (!techActiveIds.length && !techPassiveIds.length) { const e = document.createElement("div"); e.className = "invempty"; e.textContent = "No Deep Arts yet - they are earned by deeds in battle, not bought."; tl.appendChild(e); return; }
    const allIds = [...techActiveIds, ...techPassiveIds];
    if (!allIds.includes(charTechSel)) charTechSel = allIds[0];
    renderTreeSection(p, tl, "Deep Arts", "Earned by deeds - all instant. Actives ride Strength, like strikes. Most require their weapon as your default weapon (bare fists for Iron Palm); thrown arts need only shurikens in your pack. Shield arts need a shield equipped. Actives also gain their weapon tree's ranks and scale with weapon strength.", techActiveIds, "tech");
    renderTreeSection(p, tl, "Passive Deep Arts", "Always on while their weapon is wielded - open the fight the right way and they bite.", techPassiveIds, "tech");
  }
  // Taming lives in its own tab now (🐾 next to ⚔️): alongside caps, kind +
  // level gates, and the deed counter toward 🦗 Locust Swarm.
  function renderTamingTrees(p) {
    const tl = $("tameList");
    if (!tl) return;
    tl.innerHTML = "";
    const E = window.Entities;
    let cap = 1, lvlCap = 15, vermin = false, broad = false, tamed = 0, bugs = 0;
    try { cap = E.tameSlots ? E.tameSlots(p) : 1; } catch (e) { }
    try { lvlCap = E.tameLevelCap ? E.tameLevelCap(p) : 15; } catch (e) { }
    try { vermin = E.tameCanKind ? !!E.tameCanKind(p, "giant_tarantula") : false; } catch (e) { }
    try { broad = E.tameCanKind ? !!E.tameCanKind(p, "anubite") : false; } catch (e) { }
    try { tamed = window.Entities.lifetimeTames ? window.Entities.lifetimeTames(p) : (((p.techXp && p.techXp.uses && p.techXp.uses.tame) | 0) || 0); } catch (e) { }
    try { bugs = window.Entities.lifetimeInsectTames ? window.Entities.lifetimeInsectTames(p) : (((p.techXp && p.techXp.uses && p.techXp.uses.insect_tame) | 0) || 0); } catch (e) { }
    const lvlTxt = lvlCap === Infinity ? "no limit" : ("lv " + lvlCap);
    const d = document.createElement("div");
    d.className = "invempty";
    d.textContent = `🐾 ${cap} beast${cap === 1 ? "" : "s"} alongside you (your mount counts; beasts lent to friends never do) · tame up to ${lvlTxt} · tamable now: horses + a few beasts${vermin ? " + insects" : ""}${broad ? " + most wild animals" : ""} · tamed ${Math.min(tamed, 50)}/50 (+ ${Math.min(bugs, 10)}/10 🪲) toward 🦗 Locust Swarm. Earn points by taming (1 per 2 tames). Warlords never submit; 👑 apex ancients need a FULLY maxed tree (1 in 20 asks).`;
    tl.appendChild(d);
    let def = null;
    try { def = E.skillTreeDef ? E.skillTreeDef("taming") : null; } catch (e) { }
    if (!def) { const e2 = document.createElement("div"); e2.className = "invempty"; e2.textContent = "The wilds are quiet."; tl.appendChild(e2); return; }
    try {
      const own = E.treePoints ? E.treePoints(p, "taming") : 0;
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e2) { }
      const spend = (own | 0) + leg;
      const need = E.treeEarnNeed ? E.treeEarnNeed("taming") : null;
      const bought = E.treeRanksBought ? E.treeRanksBought(p, "taming") : 0;
      const max = E.treeRanksMax ? E.treeRanksMax("taming") : 0;
      if (need) {
        const pd = document.createElement("div");
        pd.className = "invempty";
        const prog = E.treeProgress ? E.treeProgress(p, "taming") : 0;
        let capped = false;
        try { capped = E.treeCapped ? !!E.treeCapped(p, "taming") : (bought + (own | 0) >= max); } catch (e2) { capped = (bought + (own | 0) >= max); }
        pd.textContent = bought >= max
          ? `🌟 Beastmastery is complete (${bought}/${max})${spend ? ` · ${spend} unspent point${spend === 1 ? "" : "s"} left` : ""}.`
          : capped
            ? `🌟 ${spend} point${spend === 1 ? "" : "s"} to spend · enough to finish the tree — no more to earn.`
            : `🌟 ${spend} point${spend === 1 ? "" : "s"} to spend · earn more by ${need.how} (${prog}/${need.per} ${need.unit}).`;
        tl.appendChild(pd);
      }
    } catch (e) { }
    renderSkillTree(tl, p, "taming", def.nodes, (p.weaponPerks && p.weaponPerks.taming) || {}, null);
  }
  // Afflictions tab (☠️): one tree per status + slow. Same gated node cards
  // as weapons; points come only from afflicting foes with that ailment.
  function renderAfflictionTrees(p) {
    const list = $("affList");
    if (!list) return;
    list.innerHTML = "";
    const trees = (window.CFG && window.CFG.STATUS_TREES) || {};
    const ids = Object.keys(trees);
    if (!ids.length) return;
    if (!trees[charAffSel]) charAffSel = ids[0];
    let totals = {};
    try { totals = window.Entities.afflictionTreeTotals ? window.Entities.afflictionTreeTotals(p) : {}; } catch (e) { }
    const sub = document.createElement("div");
    sub.className = "wsub";
    for (const id of ids) {
      const b = document.createElement("button");
      const n = totals[id] | 0;
      let pts = 0;
      try { pts = window.Entities.treePoints ? window.Entities.treePoints(p, id) : 0; } catch (e) { }
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e) { }
      const spend = (pts | 0) + leg;
      b.innerHTML = `${window.Icons.img("fx", "status:" + id, 18)} ${trees[id].name}${n ? " ·" + n : ""}${spend ? " (+" + spend + ")" : ""}`;
      const cls = [];
      if (id === charAffSel) cls.push("active");
      if (spend) { cls.push("haspts"); b.title = spend + " point" + (spend === 1 ? "" : "s") + " to spend here"; }
      b.className = cls.join(" ");
      b.onclick = ((fid) => () => { charAffSel = fid; renderAfflictionTrees(p); })(id);
      sub.appendChild(b);
    }
    list.appendChild(sub);
    const tr = trees[charAffSel];
    if (tr.hint) { const h = document.createElement("div"); h.className = "invempty"; h.textContent = tr.hint; list.appendChild(h); }
    try {
      const E = window.Entities;
      const own = E.treePoints ? E.treePoints(p, charAffSel) : 0;
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e2) { }
      const spend = (own | 0) + leg;
      const need = E.treeEarnNeed ? E.treeEarnNeed(charAffSel) : null;
      const bought = E.treeRanksBought ? E.treeRanksBought(p, charAffSel) : 0;
      const max = E.treeRanksMax ? E.treeRanksMax(charAffSel) : 0;
      if (need) {
        const d = document.createElement("div");
        d.className = "invempty";
        const prog = E.treeProgress ? E.treeProgress(p, charAffSel) : 0;
        let capped = false;
        try { capped = E.treeCapped ? !!E.treeCapped(p, charAffSel) : (bought + (own | 0) >= max); } catch (e2) { capped = (bought + (own | 0) >= max); }
        d.textContent = bought >= max
          ? `${tr.name} is complete (${bought}/${max})${spend ? ` · ${spend} unspent point${spend === 1 ? "" : "s"} left` : ""}.`
          : capped
            ? `${spend} ${tr.name} point${spend === 1 ? "" : "s"} to spend · enough to finish the tree — no more to earn.`
            : `${spend} ${tr.name} point${spend === 1 ? "" : "s"} to spend · earn more by ${need.how} (${prog}/${need.per} ${need.unit}).`;
        list.appendChild(d);
      }
    } catch (e) { }
    renderSkillTree(list, p, charAffSel, tr.nodes, (p.weaponPerks && p.weaponPerks[charAffSel]) || {}, null);
  }
  // one tree group inside a tab (spells / cataclysms / techniques / passives).
  // The selected tree renders beneath its own group. `which` picks the tab's
  // selection ("spell" -> charSpellSel, "tech" -> charTechSel).
  function renderTreeSection(p, ml, title, hint, ids, which) {
    if (!ids.length) return;
    const isTechTab = which === "tech";
    const selId = () => (isTechTab ? charTechSel : charSpellSel);
    const setSelId = (v) => { if (isTechTab) charTechSel = v; else charSpellSel = v; };
    const rerender = () => { if (isTechTab) renderTechTrees(p); else renderSpellTrees(p); };
    const h = document.createElement("div");
    h.className = "stier";
    h.textContent = title;
    ml.appendChild(h);
    if (hint && ids.includes(selId())) { const d = document.createElement("div"); d.className = "invempty"; d.textContent = hint; ml.appendChild(d); }
    const sub = document.createElement("div");
    sub.className = "wsub";
    for (const id of ids) {
      let ab = null, tt = null;
      try { ab = window.CFG.ABILITIES[id]; } catch (e) { }
      try { tt = (window.CFG.TECHNIQUES || {})[id]; } catch (e) { }
      if (!ab && !tt) continue;
      const name = (ab && ab.name) || (tt && tt.name) || id;
      let n = 0;
      try { n = window.Entities.spellTreeTotal(p, id); } catch (e) { }
      let pts = 0;
      try { pts = window.Entities.treePoints ? window.Entities.treePoints(p, id) : 0; } catch (e) { }
      // spendable here = this tree's own balance + the retired generic pool
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e) { }
      const spend = (pts | 0) + leg;
      const b = document.createElement("button");
      b.innerHTML = `${window.Icons.img("ability", id, 18)} ${name}${n ? " ·" + n : ""}${spend ? " (+" + spend + ")" : ""}`;
      const cls = [];
      if (id === selId()) cls.push("active");
      if (spend) { cls.push("haspts"); b.title = spend + " point" + (spend === 1 ? "" : "s") + " to spend here"; }
      b.className = cls.join(" ");
      b.onclick = ((aid) => () => { setSelId(aid); rerender(); })(id);
      sub.appendChild(b);
    }
    ml.appendChild(sub);
    if (!ids.includes(selId())) return;
    const S = selId();
    const def = (() => { try { return window.Entities.skillTreeDef(S); } catch (e) { return null; } })();
    if (!def) return;
    // per-tree points for the open tree: balance + progress to the next one
    try {
      const E = window.Entities;
      const own = E.treePoints ? E.treePoints(p, S) : 0;
      let leg = 0;
      try { leg = Math.max(0, p.skillPoints | 0); } catch (e2) { }
      const spend = (own | 0) + leg;
      const need = E.treeEarnNeed ? E.treeEarnNeed(S) : null;
      const bought = E.treeRanksBought ? E.treeRanksBought(p, S) : 0;
      const max = E.treeRanksMax ? E.treeRanksMax(S) : 0;
      if (need) {
        const pd = document.createElement("div");
        pd.className = "invempty";
        const prog = E.treeProgress ? E.treeProgress(p, S) : 0;
        let capped = false;
        try { capped = E.treeCapped ? !!E.treeCapped(p, S) : (bought + (own | 0) >= max); } catch (e2) { capped = (bought + (own | 0) >= max); }
        pd.textContent = bought >= max
          ? `🌟 This tree is complete (${bought}/${max})${spend ? ` · ${spend} unspent point${spend === 1 ? "" : "s"} left` : ""}.`
          : capped
            ? `🌟 ${spend} point${spend === 1 ? "" : "s"} to spend · enough to finish the tree — no more to earn.`
            : `🌟 ${spend} point${spend === 1 ? "" : "s"} to spend · earn more by ${need.how} (${prog}/${need.per} ${need.unit}).`;
        ml.appendChild(pd);
      }
    } catch (e) { }
    try {
      const info = document.createElement("div");
      info.className = "invempty";
      if (def.kind === "tpass") {
        const tx = (window.CFG.TECHNIQUES || {})[S] || {};
        let reqTxt = "";
        try {
          const fam = window.Entities.techWeaponFam ? window.Entities.techWeaponFam(S) : null;
          if (fam) reqTxt = fam === "unarmed" ? " Requires bare fists (default slot empty); only triggers while unarmed." : " Requires a " + fam + " as your default weapon; only triggers while wielded.";
        } catch (e) { }
        info.textContent = def.name + " - passive, always on" + reqTxt + " \u00b7 " + (tx.hint || "");
      } else {
        const ab2 = window.CFG.ABILITIES[S];
        const mult = window.Entities.spellPowerMult(p, S);
        const techS = !!(ab2 && ab2.kind === "technique");
        const cost = techS && window.Entities.effectiveStamCost ? window.Entities.effectiveStamCost(p, S) : window.Entities.effectiveMpCost(p, S);
        let extra = "";
        try {
          if (ab2 && ab2.kind === "technique") {
            const fam = window.Entities.techWeaponFam ? window.Entities.techWeaponFam(S) : null;
            if (S === "locust_swarm") {
              extra = " Instant; needs no weapon wielded — a leech-cloud of untouchable locusts orbits you for 12s (Mastery: 16s, 7 tiles), draining nearby foes to feed you and your allies. Earn Locust Swarm ranks by casting it.";
            } else if (!fam) {
              extra = " Instant; needs no weapon wielded — hurls your best shuriken (consumed); inherits Hurling ranks.";
            } else if (fam === "shield") {
              extra = " Instant mirror guard (2s, Mastery 3s): every attack rebounds at half power while you take nothing. Requires a shield equipped; inherits Shieldwork ranks.";
            } else {
              let wname = fam || "?";
              try { if (window.CFG.SKILL_TREES && window.CFG.SKILL_TREES[fam]) wname = window.CFG.SKILL_TREES[fam].name; else if (fam === "unarmed") wname = "Martial Arts (bare fists)"; } catch (e) { }
              extra = " Instant; requires " + (fam === "unarmed" ? "bare fists (default slot empty)" : "a " + fam + " as your default weapon") + "; inherits " + wname + " ranks + scales with weapon strength.";
            }
            if (S === "shadow_disciples") {
              try {
                const s = window.Entities.shadowCloneStats ? window.Entities.shadowCloneStats(p) : null;
                if (s) extra += ` Splits into ${s.count} shadow clones (${s.lifeSec}s, x${s.dmgMult.toFixed(2)} damage) — each casts every move once, then fights beside you. Recast while aiming at a clone to trade places (free).`;
              } catch (e) { }
            }
          } else if (window.Entities.spellParent && window.Entities.spellParent(S)) {
            const lab = window.Entities.spellLineageLabel ? window.Entities.spellLineageLabel(S) : null;
            let chan = "";
            try { const s = window.Entities.spellChannelTime ? window.Entities.spellChannelTime(S) : 0; if (s > 0) chan = " Channels " + s.toFixed(1) + "s (move freely, attacks held)."; } catch (e) { }
            if (lab) extra = " Inherits every unlocked rank from: " + lab + " (one-way — lower tiers never gain from higher)." + chan;
            else if (chan) extra = chan;
          } else if (ab2 && (ab2.kind === "cataclysm")) {
            try { const s = window.Entities.spellChannelTime ? window.Entities.spellChannelTime(S) : 0; if (s > 0) extra = " Channels " + s.toFixed(1) + "s (move freely, attacks held)."; } catch (e) { }
          }
        } catch (e) { }
        info.textContent = ab2.name + " - x" + mult.toFixed(2) + " power \u00b7 " + cost + (techS ? " stamina" : " MP") + " \u00b7 " + ab2.desc + extra;
      }
      ml.appendChild(info);
    } catch (e) { }
    renderSkillTree(ml, p, S, def.nodes, (p.spellPerks && p.spellPerks[S]) || {}, S);
  }
  function renderSkillTree(listEl, p, treeId, nodes, store, masteryAbId) {
    const wrap = document.createElement("div");
    wrap.className = "stree";
    const depth = (n) => (!n.req ? 0 : 1 + Math.max.apply(null, [0].concat(Object.keys(n.req).map((r) => {
      const rn = nodes.find((x) => x.id === r);
      return rn ? depth(rn) : 0;
    }))));
    const order = nodes.slice().sort((a, b) => depth(a) - depth(b));
    let lastD = -1;
    for (const n of order) {
      const dd = depth(n);
      if (dd !== lastD) {
        lastD = dd;
        const t = document.createElement("div");
        t.className = "stier";
        t.textContent = dd === 0 ? "\u2014 Basics \u2014" : dd === 1 ? "\u2014 Deep Arts (unlock basics first) \u2014" : dd === 2 ? "\u2014 Advanced (unlock Deep Arts first) \u2014" : "\u2014 Capstone \u2014";
        wrap.appendChild(t);
      }
      wrap.appendChild(skillNodeCard(p, treeId, n, nodes, store, masteryAbId));
    }
    listEl.appendChild(wrap);
  }
  function skillNodeCard(p, treeId, node, nodes, store, masteryAbId) {
    const ranks = store[node.id] | 0;
    const maxed = ranks >= node.max;
    let lockName = null;
    if (node.req) for (const rn of Object.keys(node.req)) {
      if ((store[rn] | 0) < node.req[rn]) { const f = nodes.find((x) => x.id === rn); lockName = (f ? f.name : rn) + " " + node.req[rn]; break; }
    }
    // per-tree points first, retired generic pool (old saves) as fallback
    let own = 0, leg = 0, need = null, prog = 0, tname = treeId;
    try {
      const E = window.Entities;
      own = E.treePoints ? E.treePoints(p, treeId) : 0;
      need = E.treeEarnNeed ? E.treeEarnNeed(treeId) : null;
      prog = E.treeProgress ? E.treeProgress(p, treeId) : 0;
      try { const def = E.skillTreeDef ? E.skillTreeDef(treeId) : null; if (def && def.name) tname = def.name; } catch (e) { }
    } catch (e) { }
    leg = p.skillPoints | 0;
    const broke = (own + leg) <= 0;
    const d = document.createElement("div");
    d.className = "snode" + (node.max === 1 && !maxed ? " cap" : "") + (maxed ? " maxed" : "") + (lockName ? " locked" : "");
    const head = document.createElement("div");
    head.className = "shead";
    const ic = document.createElement("span"); ic.className = "li"; try { if (window.Icons) ic.innerHTML = window.Icons.img("tree", treeId, 18); } catch (e) { }
    const b = document.createElement("b"); b.textContent = node.name;
    const pp = document.createElement("span"); pp.className = "pips";
    pp.textContent = "\u25CF".repeat(ranks) + "\u25CB".repeat(Math.max(0, node.max - ranks));
    head.appendChild(ic); head.appendChild(b); head.appendChild(pp);
    d.appendChild(head);
    const desc = document.createElement("div");
    desc.className = "sdesc";
    desc.textContent = (masteryAbId && node.id === "mastery") ? ((SPELL_MASTERY_DESC[masteryAbId] || "Stronger, faster cooldown.") + " (Mastery)") : (node.desc || "");
    d.appendChild(desc);
    if (lockName) { const r = document.createElement("div"); r.className = "sreq"; r.textContent = "Requires " + lockName; d.appendChild(r); }
    const row = document.createElement("div");
    row.className = "srow";
    const btn = document.createElement("button");
    btn.textContent = maxed ? "Maxed" : "+ Learn (" + ranks + "/" + node.max + ")";
    btn.className = "ghost";
    let why = "";
    if (maxed) why = "Already maxed.";
    else if (lockName) why = "Locked \u2014 " + lockName + " first.";
    else if (broke) why = need ? `Need ${tname} points \u2014 earn by ${need.how} (${prog}/${need.per} ${need.unit}).` : "Need skill points.";
    btn.disabled = !!(maxed || lockName || broke);
    if (why) btn.title = why;
    btn.onclick = () => {
      if (window.Entities.spendSkillPoint(p, treeId, node.id)) {
        try { window.Sfx.coin(); } catch (e) { }
        toast(node.name + " learned!", 2500);
      } else toast(why || "Can\u2019t learn that yet.");
      saveAndRefreshInv(); renderChar();
    };
    row.appendChild(btn);
    if (why && !maxed) { const w = document.createElement("span"); w.className = "swhy"; w.textContent = why; row.appendChild(w); }
    d.appendChild(row);
    return d;
  }

    // ---------- travel map: terrain + hearths + roads (pan + zoom) ----------
  // mapView is a smooth float center in world-tile coords: {x, y, range}.
  // (Older code used integer chunk coords {cx, cy}; mapCenter() migrates it.)
  let mapView = null; // {x, y, range}
  let mapDrawQueued = false;
 const MAP_NODE_C = { town: "#e8a33d", village: "#d9c27f", city: "#ffd93d", watergate: "#59d6d6", sakura: "#f2a0c0", fortress: "#b0b0c0", desert_souk: "#e0a050", steppe_ger: "#9ac06a", mesa_pueblo: "#c96b4a", frost_hold: "#bfe9ff", trade_city: "#ffcf4d", port_city: "#4db8ff", capital: "#fff06a", base: "#e05252", forest: "#7fc48a", dark_forest: "#1d5a34", lake: "#6aa8e8", sea: "#3a7bd4", ocean: "#2b4fd4", tundra: "#cfe0ea", wild: "#9aa86a", plains: "#9aa86a", desert: "#e0c060", mountain: "#9a9aa8", volcano: "#e05252", frostcrown: "#dff2ff", blightmire: "#5a8a4a", stormcrag: "#5a6ad9", crystal_scar: "#c9a7ff", umbral_waste: "#3a2a6a", dungeon: "#9a5ae0", demon_village: "#ff5a1a", demon_town: "#ff3a00", demon_city: "#ff1a00", hell_castle: "#0a0a0a", hell_tower: "#ff3a00", hell_ash: "#4a2a1a", hell_blood: "#8a0a0a", hell_obsidian: "#1a0a1a", hell_bone: "#c9c0b0", hell_flesh: "#8a2a2a", hell_fungal: "#6a3aa0", hell_gloom: "#2e1a4a", hell_verdant: "#2a8a7a" };
  // v18 void: out-of-hell stone (map-only; the live game never walks it).
  try { MAP_NODE_C.hell_void = "#222228"; MAP_NODE_C.heaven_void = "#e8eef5"; MAP_NODE_C.heaven_cloud = "#f4f8ff"; MAP_NODE_C.heaven_lake = "#9adcff"; MAP_NODE_C.heaven_meadow = "#eef6df"; MAP_NODE_C.heaven_grove = "#cfe8c9"; MAP_NODE_C.heaven_bloom = "#f2b0d0"; MAP_NODE_C.heaven_mist = "#dfe8f2"; MAP_NODE_C.heaven_pasture = "#c9d68a"; MAP_NODE_C.angel_village = "#ffe9a8"; MAP_NODE_C.angel_town = "#ffd93d"; MAP_NODE_C.angel_city = "#fff2b0"; MAP_NODE_C.pantheon = "#fffbe0"; MAP_NODE_C.pantheon_outpost = "#f6d34e"; } catch (e) {}
  const SETTLE_GLYPH = { village: "⌂", town: "⌂", city: "♛", watergate: "🌊", sakura: "🌸", fortress: "⛰", desert_souk: "🏜️", steppe_ger: "🐎", mesa_pueblo: "🏜️", frost_hold: "❄️", trade_city: "💰", port_city: "⚓", capital: "👑", base: "☠️", demon_village: "😈", demon_town: "😈", demon_city: "😈", hell_castle: "🏰", hell_tower: "🗼", angel_village: "🌅", angel_town: "🌅", angel_city: "🌅", pantheon: "🌅", pantheon_outpost: "🌅" };
  function mapCenter() {
    if (!mapView) return null;
    if (Number.isFinite(mapView.x) && Number.isFinite(mapView.y)) return mapView;
    const cx = (mapView.cx | 0) || 0, cy = (mapView.cy | 0) || 0;
    mapView.x = cx * 16 + 8; mapView.y = cy * 16 + 8;
    try { delete mapView.cx; delete mapView.cy; } catch (e) { }
    return mapView;
  }
  // Delve mouth on the surface: exitPos (stamped on entry) is the exact
  // stairs; otherwise derive the mouth chunk from the delve id (d_cx_cy[_L#]).
  function dungeonMouthSurface(id, exitPos) {
    try {
      if (exitPos && isFinite(+exitPos.x) && isFinite(+exitPos.y)) return { x: +exitPos.x, y: +exitPos.y };
    } catch (e) { }
    try {
      const base = (window.Game && window.Game.dungeonBaseOf) ? window.Game.dungeonBaseOf(id) : String(id || "").replace(/_L\d+$/, "");
      const bc = (window.Game && window.Game.dungeonBaseCoords) ? window.Game.dungeonBaseCoords(base) : null;
      if (bc && isFinite(+bc.cx) && isFinite(+bc.cy)) return { x: (+bc.cx) * 16 + 8, y: (+bc.cy) * 16 + 8 };
    } catch (e) { }
    return null;
  }
  // Map focus: the hero's surface position — the delve mouth while inside,
  // so the map opens on where you are instead of spawn-area wilderness.
  function mapFocusForPlayer() {
    try {
      const p = window.Game.G.player;
      if (p && p.inDungeon) {
        const m = dungeonMouthSurface(p.inDungeon, p.exitPos);
        if (m) return m;
      }
      return { x: p.x, y: p.y };
    } catch (e) { return { x: 8, y: 8 }; }
  }
  function queueWorldDraw() {
    if (!mapView) return;
    if (mapDrawQueued) return;
    mapDrawQueued = true;
    try {
      requestAnimationFrame(() => { mapDrawQueued = false; try { drawWorldMap(); } catch (e) { } });
    } catch (e) { mapDrawQueued = false; try { drawWorldMap(); } catch (e2) { } }
  }
  // Known-world auto-fit: size the canvas to the leftover card space so the
  // whole menu (search, map, info, buttons, legend) shows with no card
  // scroll. Canvas art is fixed 520x360 internally — CSS only scales it.
  function fitMapCanvas() {
    try {
      const m = $("mapModal"), cv = $("worldmap");
      if (!m || m.hidden || !cv) return;
      const card = m.querySelector(".card");
      if (!card) return;
      const cs = getComputedStyle(card);
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const availW = Math.max(200, card.clientWidth - padX);
      let chromeH = padY + 24;
      for (const ch of card.children) {
        if (ch === cv || !ch.offsetHeight) continue;
        try {
          const ms = getComputedStyle(ch);
          chromeH += ch.offsetHeight + (parseFloat(ms.marginTop) || 0) + (parseFloat(ms.marginBottom) || 0) + 6;
        } catch (e) { chromeH += 40; }
      }
      const vh = window.innerHeight || 800;
      const maxCardH = vh * 0.94 - 24;
      const availH = Math.max(150, maxCardH - chromeH);
      const s = Math.min(availW / 520, availH / 360);
      cv.style.width = Math.max(200, Math.floor(520 * s)) + "px";
      cv.style.height = Math.floor(360 * s) + "px";
    } catch (e) { }
  }
  function toggleMap(force) {
    const m = $("mapModal");
    const show = force !== undefined ? force : m.hidden;
    m.hidden = !show;
    if (show) {
      try {
        const f = mapFocusForPlayer();
        mapView = { x: f.x, y: f.y, range: 6 };
      } catch (e) { mapView = { x: 8, y: 8, range: 6 }; }
      drawWorldMap();
      refreshHearthList();
      try { requestAnimationFrame(() => { try { fitMapCanvas(); } catch (e2) { } }); } catch (e3) { }
      try { setTimeout(() => { try { fitMapCanvas(); } catch (e4) { } }, 120); } catch (e5) { }
      // far hearths live in storage, not RAM: pull them into mem so the Known
      // world shows the whole journey, then redraw once they land
      try { if (window.World.ensureMemLoaded) window.World.ensureMemLoaded().then(() => { try { drawWorldMap(); refreshHearthList(); } catch (e2) {} }); } catch (e2) {}
    } else { mapView = null; mapDrawQueued = false; mapPortalMode = false; try { hideMapTeleportPrompt(); } catch (e) { } }
  }
  function mapPan(dx, dy) {
    if (!mapView) return;
    mapCenter();
    // smooth tile steps (half a chunk) — arrow keys repeat for gliding pans
    mapView.x += dx * 8; mapView.y += dy * 8;
    drawWorldMap();
  }
  function mapZoom(d) {
    if (!mapView) return;
    mapCenter();
    mapView.range = Math.min(12, Math.max(2, mapView.range + d));
    drawWorldMap();
  }
  function mapRecenter() {
    if (!mapView) return;
    mapCenter();
    try {
      const f = mapFocusForPlayer();
      mapView.x = f.x; mapView.y = f.y;
    } catch (e) { }
    drawWorldMap();
  }
  function mapTileRGB(t, gx, gy) {
    let c;
    switch (t) {
      case 3: case 4: c = [20, 48, 28]; break;      // trees: deep canopy
      case 5: c = [20, 57, 92]; break;              // water
      case 6: c = [16, 41, 74]; break;              // deep water
      case 7: c = [74, 63, 40]; break;              // sand
      case 8: c = [77, 65, 48]; break;              // path
      case 9: c = [61, 58, 53]; break;              // town stone
      case 10: case 11: case 12: c = [74, 58, 40]; break; // buildings
      case 13: c = [35, 35, 46]; break;             // dungeon floor
      case 14: c = [23, 23, 31]; break;             // dungeon wall
      case 15: case 16: case 17: c = [90, 74, 42]; break;
      case 18: c = [96, 80, 46]; break;              // stairs
      case 19: c = [120, 40, 26]; break;             // lava
      case 20: c = [96, 62, 66]; break;              // sakura canopy
      case 21: c = [52, 52, 60]; break;              // fortress stone wall
      case 22: c = [88, 80, 60]; break;              // lantern glow
      case 23: c = [96, 120, 140]; break;            // window glass
      case 24: c = [110, 82, 46]; break;             // plank floor
      case 25: c = [90, 82, 70]; break;              // rubble
      case 26: c = [150, 190, 210]; break;           // ice
      case 27: c = [45, 42, 40]; break;               // ash
      case 28: c = [30, 62, 34]; break;               // moss
      case 1: c = [38, 58, 34]; break;              // tall grass
      case 2: c = [44, 66, 38]; break;              // flower
      case 29: c = [110, 98, 80]; break;             // bone
      case 30: c = [150, 170, 220]; break;           // crystal
      case 31: c = [200, 150, 50]; break;            // wax
      case 32: c = [110, 45, 45]; break;             // flesh
      case 33: c = [130, 20, 20]; break;             // blood
      case 34: c = [228, 236, 246]; break;          // dawn cloud
      case 35: c = [122, 70, 170]; break;           // shroom cap (alien violet)
      case 36: c = [50, 170, 165]; break;           // spire crystal (alien teal)
      default: c = [34, 51, 31];                    // grass
    }
    let h = 0.5;
    try { h = window.World.hash2(gx, gy); } catch (e) { }
    const m = 0.9 + h * 0.2;
    return [(c[0] * m) | 0, (c[1] * m) | 0, (c[2] * m) | 0];
  }
  function mapPlaces() {
    // known hearths: real places only — settlement centers, delves, and the
    // spawn town. (Unnamed wilds chunks each carry a fallback name, but they
    // sit on chunk centers, so drawing them webbed the whole map in
    // axis-aligned grid links. Same name twice = one hearth.)
    const out = [];
    const seen = new Map();
    let px = 0, py = 0, spawnName = "Emberhold";
    try { const p = window.Game.G.player; px = p.x; py = p.y; if (p.spawnName) spawnName = p.spawnName; } catch (e) { }
    // v18: the map shows the hero's dimension only — same numbers, separate
    // worlds. (mem holds both dims' chunks under dim-prefixed keys.)
    // v21: single dim source — the hero's dim (the World mirrors it every
    // streaming tick). The World dim only backs up a missing hero record,
    // so terrain and pins can never resolve to different worlds for a frame.
    let pdim = "surf", pdok = false;
    try { const _pd = (window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.dim) || null; if (_pd === "heaven" || _pd === "hell" || _pd === "surf") { pdim = _pd; pdok = true; } } catch (e) {}
    try { if (!pdok && window.World && window.World.getDim) pdim = window.World.getDim(); } catch (e) {}
    try {
      for (const ch of window.World._mem.chunks.values()) {
        try {
          const cdim = (ch && (ch.dim === "hell" || ch.dim === "heaven" || ch.dim === "surf")) ? ch.dim : ((ch && ch.cx != null && window.World.isHellBaseGround && window.World.isHellBaseGround(ch.cx * 16 + 8, ch.cy * 16 + 8) && pdim === "hell") ? "hell" : "surf");
          if (cdim !== pdim) continue;
        } catch (e) {}
        let name = ch.placeName, kind = ch.settlementType || ch.biome || "wild";
        if (ch.hasDungeon) {
          let dn = null;
          try {
            const _dmk = (window.World.dungeonMemKey ? window.World.dungeonMemKey("d_" + ch.cx + "_" + ch.cy, pdim) : (pdim + ":d_" + ch.cx + "_" + ch.cy));
            const d = window.World._mem.dungeons.get(_dmk) || window.World._mem.dungeons.get("d_" + ch.cx + "_" + ch.cy);
            if (d && d.name) dn = d.name;
          } catch (e) { }
          name = name ? name + " 🕳️" : (dn || "Sunken Crypt");
          kind = "dungeon";
        } else if (ch.base && ch.base.cx != null) {
          // enemy holding whose center lies in this chunk — plotted at its
          // war-sign, skull-marked; never a hearth (no portal, no travel)
          try { name = window.World.baseName(ch.base); } catch (e) { name = name || "Dark Holding"; }
          kind = "base";
        } else {
          const hasSettlement = ch.settlementType && ch.scx != null;
          let isSpawn = !!ch.spawn;
          if (!isSpawn) {
            try { isSpawn = String(name) === String(spawnName) && Math.hypot(ch.cx * 16 + 8, ch.cy * 16 + 8) < 48; } catch (e) { }
          }
          if (!hasSettlement && !isSpawn) continue;
        }
        if (!name) continue;
        // true hearth position — NOT the chunk center. Settlement chunks plot
        // at their settlement's real center (arbitrary scatter, like
        // hand-placed towns); delves plot at their stair entrance; the spawn
        // town plots at the origin it was built around. Chunk centers sit on a
        // 16-tile grid, which made every connector axis-aligned and grid-like.
        let hx = ch.cx * 16 + 8, hy = ch.cy * 16 + 8;
        try {
          if (ch.scx != null && ch.scy != null) { hx = ch.scx; hy = ch.scy; }
          else if (ch.base && ch.base.cx != null && ch.base.cy != null) { hx = ch.base.cx; hy = ch.base.cy; }
          else if (ch.hasDungeon && Array.isArray(ch.pois)) {
            const st = ch.pois.find(pl => pl && pl.type === "dungeon" && Number.isFinite(pl.gx));
            if (st) { hx = st.gx; hy = st.gy; }
          } else if (!ch.hasDungeon) {
            let isSpawn = !!ch.spawn;
            if (!isSpawn) {
              try { isSpawn = String(name) === String(spawnName) && Math.hypot(hx, hy) < 48; } catch (e) { }
            }
            if (isSpawn) { hx = 0; hy = 0; }
          }
        } catch (e) { }
        const q = { x: hx, y: hy, name: String(name).slice(0, 28), kind, cx: ch.cx, cy: ch.cy };
        const prev = seen.get(q.name);
        if (prev) {
          // keep the copy nearest the player
          const dPrev = (prev.x - px) * (prev.x - px) + (prev.y - py) * (prev.y - py);
          const dNew = (q.x - px) * (q.x - px) + (q.y - py) * (q.y - py);
          if (dNew < dPrev) { const i = out.indexOf(prev); if (i >= 0) out[i] = q; seen.set(q.name, q); }
          continue;
        }
        seen.set(q.name, q);
        out.push(q);
      }
      // v18 hell towers + castle pins (current dim only, from live POIs).
      try {
        for (const ch of window.World._mem.chunks.values()) {
          if (!ch || !Array.isArray(ch.pois)) continue;
          try {
            const cdim = (ch.dim === "hell" || ch.dim === "heaven" || ch.dim === "surf") ? ch.dim : null;
            if (cdim && cdim !== pdim) continue;
          } catch (e) {}
          for (const poi of ch.pois) {
            if (!poi || poi.type !== "hell_tower") continue;
            // tower POIs are dim-local (their chunk already matched pdim
            // above): surf chunks hold surface towers, hell chunks hold hell
            // towers. Heaven bakes none of its own — a surf-list POI baked
            // into a heaven chunk stays hidden, so no phantom pins plot in
            // the wrong world. (The old coordinate guess misread surface
            // towers, which stand inside the hell-disc radius, as hell-side.)
            if (pdim === "heaven") continue;
            const nm = "Hell Tower 🗼";
            const q = { x: poi.gx, y: poi.gy, name: nm + " " + poi.gx + "," + poi.gy, kind: "hell_tower", cx: ch.cx, cy: ch.cy };
            if (seen.has(q.name)) continue;
            seen.set(q.name, q);
            out.push(q);
          }
        }
        // charted towers stay charted: a touched tower keeps its map pin even
        // after its chunk streams out of RAM (same static coords as the bake),
        // so map teleport reaches it exactly like a visited hearth. Uncharted
        // towers show too but only center the map until E charts them.
        try {
          const H = window.Hell;
          // charted towers stay charted on their own side only — surf pins
          // on surf, hell pins in hell, none in heaven (it has no towers).
          const list = H ? (pdim === "hell" ? (H.HELL_TOWERS || []) : pdim === "heaven" ? [] : (H.SURFACE_TOWERS || [])) : [];
          for (const tw of list) {
            if (!tw || !Number.isFinite(tw.x) || !Number.isFinite(tw.y)) continue;
            const nm = "Hell Tower 🗼 " + tw.x + "," + tw.y;
            if (seen.has(nm)) continue;
            const q = { x: tw.x, y: tw.y, name: nm, kind: "hell_tower", cx: Math.floor(tw.x / 16), cy: Math.floor(tw.y / 16) };
            seen.set(nm, q);
            out.push(q);
          }
        } catch (e3) {}
        try {
          if (pdim === "heaven" && window.Heaven && window.Heaven.CENTER) {
            const hx2 = window.Heaven.CENTER.x, hy2 = window.Heaven.CENTER.y;
            const ccx2 = Math.floor(hx2 / 16), ccy2 = Math.floor(hy2 / 16);
            let known2 = false;
            try { known2 = window.World._mem.chunks.has("v_" + ccx2 + "_" + ccy2); } catch (e2) {}
            if (known2) {
              // the settlement branch already pins "Radiant Pantheon" at the
              // same heart — don't stack a second dot + label on it.
              if (!seen.has("Radiant Pantheon")) {
                const nm2 = "Radiant Pantheon \u{1F305}";
                if (!seen.has(nm2)) { const q2 = { x: hx2, y: hy2, name: nm2, kind: "pantheon", cx: ccx2, cy: ccy2 }; seen.set(nm2, q2); out.push(q2); }
              }
            }
          }
        } catch (eP) {}
        // castle center pin (once hell ground is known).
        try {
          if (pdim === "hell" && window.Hell && window.Hell.CENTER) {
            const hx = window.Hell.CENTER.x, hy = window.Hell.CENTER.y;
            const ccx = Math.floor(hx / 16), ccy = Math.floor(hy / 16);
            let known = false;
            try { known = window.World._mem.chunks.has("h_" + ccx + "_" + ccy) || window.World._mem.chunks.has("c_" + ccx + "_" + ccy); } catch (e2) {}
            if (known) {
              // same dedup: the settlement branch already pins "Dark Castle"
              // at the same heart.
              if (!seen.has("Dark Castle")) {
                const nm = "Dark Castle 🏰";
                if (!seen.has(nm)) { const q = { x: hx, y: hy, name: nm, kind: "hell_castle", cx: ccx, cy: ccy }; seen.set(nm, q); out.push(q); }
              }
            }
          }
        } catch (e2) {}
      } catch (e) { }
    } catch (e) { }
    return out;
  }
  function drawMapInset(ctx, W, H) {
    let p = null;
    try { p = window.Game.G.player; } catch (e) { }
    let keys = [];
    try { keys = [...window.Game.G.explored]; } catch (e) { }
    const iw = 140, ih = 104, ix = W - iw - 10, iy = 10;
    ctx.save();
    ctx.fillStyle = "rgba(6,8,6,0.88)"; ctx.fillRect(ix, iy, iw, ih);
    // clip everything below to the inset so the viewport box can't spill
    // onto the main map when zoomed out beyond the known vale
    ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    const pts = [];
    // v18: fog keys are dim-prefixed (h_ hell, c_ surf, v_ heaven) — inset
    // shows the hero's dimension only (v21: heaven used to render surf).
    let insetDim = "surf", idok = false;
    try {
      const _id = p && p.dim;
      if (_id === "heaven" || _id === "hell" || _id === "surf") { insetDim = _id; idok = true; }
      else if (window.World && window.World.getDim) insetDim = window.World.getDim();
    } catch (e) {}
    for (const k of keys) {
      const m = /^[chv]_(-?\d+)_(-?\d+)$/.exec(k); if (!m) continue;
      try { if (k.charAt(0) !== (insetDim === "hell" ? "h" : insetDim === "heaven" ? "v" : "c")) continue; } catch (e) {}
      const cx = +m[1], cy = +m[2];
      pts.push({ cx, cy });
      if (cx < minx) minx = cx; if (cx > maxx) maxx = cx;
      if (cy < miny) miny = cy; if (cy > maxy) maxy = cy;
    }
    let pcx = 0, pcy = 0, hasP = false;
    if (p && !p.inDungeon) {
      pcx = Math.floor(p.x / 16); pcy = Math.floor(p.y / 16); hasP = true;
      if (pcx < minx) minx = pcx; if (pcx > maxx) maxx = pcx;
      if (pcy < miny) miny = pcy; if (pcy > maxy) maxy = pcy;
    }
    if (minx <= maxx) {
      const spanx = Math.max(1, maxx - minx + 1), spany = Math.max(1, maxy - miny + 1);
      const sc = Math.min((iw - 12) / spanx, (ih - 12) / spany);
      const ox = ix + 6 + (iw - 12 - sc * spanx) / 2, oy = iy + 6 + (ih - 12 - sc * spany) / 2;
      // continuous sketch: full cells, slightly overlapped so no dotted gaps
      for (const q of pts) {
        let col = "#3d5a3d";
        try {
          // v18: mem keys are dim-prefixed — try this dim's key first.
          let ch = null;
          try {
            const _pfx = insetDim === "hell" ? "h_" : insetDim === "heaven" ? "v_" : "c_";
            ch = window.World._mem.chunks.get(_pfx + q.cx + "_" + q.cy) || window.World._mem.chunks.get(q.cx + "," + q.cy);
          } catch (e2) { ch = window.World._mem.chunks.get(q.cx + "," + q.cy); }
          if (ch) col = ch.hasDungeon ? "#5a2d6a" : (MAP_NODE_C[ch.settlementType] || MAP_NODE_C[ch.biome] || (ch.biome === "town" ? "#c9a86a" : ch.biome === "lake" ? "#2b6fd4" : ch.biome === "forest" ? "#2d6a2d" : "#4a5d3a"));
        } catch (e) { }
        ctx.fillStyle = col;
        ctx.fillRect(ox + (q.cx - minx) * sc, oy + (q.cy - miny) * sc, sc + 0.6, sc + 0.6);
      }
      if (mapView) {
        try { mapCenter(); } catch (e) { }
        const R = mapView.range;
        const vcx = mapView.x / 16, vcy = mapView.y / 16;
        ctx.strokeStyle = "rgba(255,207,122,0.75)"; ctx.lineWidth = 1;
        ctx.strokeRect(ox + (vcx - R - minx) * sc, oy + (vcy - R - miny) * sc, (R * 2 + 1) * sc, (R * 2 + 1) * sc);
      }
      if (hasP) {
        const dx = ox + (pcx - minx) * sc + sc / 2, dy = oy + (pcy - miny) * sc + sc / 2;
        ctx.fillStyle = "#e8863d"; ctx.beginPath(); ctx.arc(dx, dy, 3.2, 0, 7); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(232,163,61,0.6)"; ctx.lineWidth = 1; ctx.strokeRect(ix, iy, iw, ih);
    ctx.restore();
  }
  let worldBuf = null;
  function drawWorldMap() {
    const cv = $("worldmap"); if (!cv || !mapView) return;
    mapCenter();
    const ctx = cv.getContext("2d");
    const W = cv.width = 520, H = cv.height = 360;
    const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, Math.max(W, H) * 0.75);
    bg.addColorStop(0, "#141a13"); bg.addColorStop(0.55, "#0d100d"); bg.addColorStop(1, "#070807");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    let p = null;
    try { p = window.Game.G.player; } catch (e) { }
    const R = mapView.range;
    const viewW = (R * 2 + 1) * 16, viewH = viewW * H / W;
    const tilePx = W / viewW;
    const wcx = mapView.x, wcy = mapView.y;
    const w2s = (wx, wy) => [(wx - (wcx - W / tilePx / 2)) * tilePx, (wy - (wcy - H / tilePx / 2)) * tilePx];
    let explored = null;
    try { explored = window.Game.G.explored; } catch (e) { }
    // terrain: rough low-res sampling, smoothed upscale — a proper sketch,
    // not dots, and fast enough to redraw every animation frame while panning
    try {
      const SW = 260, SH = Math.round(SW * H / W);
      if (!worldBuf || worldBuf.width !== SW || worldBuf.height !== SH) {
        worldBuf = document.createElement("canvas");
        worldBuf.width = SW; worldBuf.height = SH;
      }
      const bctx = worldBuf.getContext("2d");
      const img = bctx.createImageData(SW, SH);
      const data = img.data;
      let lastCX = 1e9, lastCY = 1e9, lastCh = null, lastKnown = false;
      const mem = (window.World && window.World._mem) || null;
      // v18: mem keys are dim-prefixed (c_ surf, h_ hell) — render this dim.
      // v21: single dim source, same as mapPlaces — the hero's dim, World
      // dim only as backup — so terrain can never disagree with the pins.
      let mapDim = "surf", mdok = false;
      try {
        const _p = window.Game && window.Game.G && window.Game.G.player;
        // inside a delve the map shows the delve's dimension (same mouth
        // numbers exist in every dim — the delve's own dim is the right one)
        try {
          const _dd = _p && _p.inDungeon && window.Game.G.dungeon && window.Game.G.dungeon.dim;
          if (_dd === "heaven" || _dd === "hell" || _dd === "surf") { mapDim = _dd; mdok = true; }
        } catch (e) { }
        const _pd = _p && _p.dim;
        if (!mdok && (_pd === "heaven" || _pd === "hell" || _pd === "surf")) { mapDim = _pd; mdok = true; }
        else if (!mdok && window.World && window.World.getDim) mapDim = window.World.getDim();
      } catch (e) {}
      const mapPfx = mapDim === "heaven" ? "v_" : mapDim === "hell" ? "h_" : "c_";
      for (let sy = 0; sy < SH; sy++) {
        const wy = wcy - viewH / 2 + (sy + 0.5) / SH * viewH;
        const gy = Math.floor(wy);
        const ccy = Math.floor(gy / 16);
        for (let sx = 0; sx < SW; sx++) {
          const wx = wcx - viewW / 2 + (sx + 0.5) / SW * viewW;
          const gx = Math.floor(wx);
          const ccx = Math.floor(gx / 16);
          if (ccx !== lastCX || ccy !== lastCY) {
            lastCX = ccx; lastCY = ccy; lastCh = null; lastKnown = false;
            try {
              if (mem) {
                lastCh = mem.chunks.get(mapPfx + ccx + "_" + ccy) || mem.chunks.get(ccx + "," + ccy) || null;
              }
            } catch (e) { lastCh = null; }
            if (!lastCh && explored && explored.has) {
              try { lastKnown = explored.has(mapPfx + ccx + "_" + ccy) || explored.has("c_" + ccx + "_" + ccy) || explored.has("v_" + ccx + "_" + ccy) || explored.has("h_" + ccx + "_" + ccy); } catch (e) { lastKnown = false; }
            }
          }
          let r = 10, g = 12, b = 10;
          if (!lastCh) {
            if (lastKnown) { r = 26; g = 34; b = 48; }
          } else {
            const lx = gx - lastCX * 16, ly = gy - lastCY * 16;
            let t = -1;
            try { t = (lx < 0 || ly < 0 || lx > 15 || ly > 15) ? -1 : lastCh.tiles[ly * 16 + lx]; } catch (e) { t = -1; }
            if (t != null && t >= 0) {
              const c = mapTileRGB(t, gx, gy);
              r = c[0]; g = c[1]; b = c[2];
            }
          }
          const idx = (sy * SW + sx) * 4;
          data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
        }
      }
      bctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      try { ctx.imageSmoothingQuality = "high"; } catch (e) { }
      ctx.drawImage(worldBuf, 0, 0, SW, SH, 0, 0, W, H);
    } catch (e) { }
    // hearth roads: thin khaki connectors, each hearth to its ~2 nearest
    // neighbours (deduped) — under dots + labels, like hand-drawn trade roads
    const places = mapPlaces();
    const inView = places.filter(q => { const s = w2s(q.x, q.y); return s[0] > -60 && s[1] > -60 && s[0] < W + 60 && s[1] < H + 60; });
    try {
      const seenEdge = new Set();
      ctx.save();
      ctx.strokeStyle = "rgba(188,178,138,0.5)";
      ctx.lineWidth = 1.25;
      for (const q of places) {
        const near = places
          .filter(o => o !== q)
          .map(o => ({ o, d: (o.x - q.x) * (o.x - q.x) + (o.y - q.y) * (o.y - q.y) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 2)
          .filter(e => e.d <= 160 * 160);
        for (const e of near) {
          const a = q.name < e.o.name ? q.name : e.o.name;
          const b = q.name < e.o.name ? e.o.name : q.name;
          const key = a + "||" + b;
          if (seenEdge.has(key)) continue;
          seenEdge.add(key);
          const s1 = w2s(q.x, q.y), s2 = w2s(e.o.x, e.o.y);
          ctx.beginPath(); ctx.moveTo(s1[0], s1[1]); ctx.lineTo(s2[0], s2[1]); ctx.stroke();
        }
      }
      ctx.restore();
    } catch (e) { }
    // biome aura per hearth
    for (const q of inView) {
      const s = w2s(q.x, q.y);
      const c = MAP_NODE_C[q.kind] || "#9a8a6a";
      const rg = ctx.createRadialGradient(s[0], s[1], 2, s[0], s[1], 30);
      rg.addColorStop(0, c + "55"); rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(s[0], s[1], 30, 0, 7); ctx.fill();
    }
    // hearth dots + glyphs
    let tick = 0;
    try { tick = performance.now() / 700; } catch (e) { }
    for (const q of inView) {
      const s = w2s(q.x, q.y);
      const c = MAP_NODE_C[q.kind] || "#9a8a6a";
      let seen = false;
      try { const _ss = (p.seenPlaces || []).map(s => String(s).slice(0, 28)); seen = p && _ss.includes(String(q.name).replace(" 🕳️", "").slice(0, 28)); } catch (e) { }
      const pu = 0.7 + 0.3 * Math.sin(tick + q.cx * 1.3 + q.cy * 1.7);
      ctx.save();
      ctx.globalAlpha = seen ? 0.65 : 1;
      ctx.shadowColor = c; ctx.shadowBlur = (seen ? 5 : 11) * pu;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(s[0], s[1], seen ? 4.5 : 6, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0b0b0b"; ctx.beginPath(); ctx.arc(s[0], s[1], 2.2, 0, 7); ctx.fill();
      ctx.restore();
      // travel-ready hearths announce their portal: visited (non-delve,
      // non-base) dots get a ✨ badge so "the portal shows up" on the map
      try {
        if (seen && q.kind !== "dungeon" && q.kind !== "base") { ctx.save(); ctx.font = "10px sans-serif"; ctx.textAlign = "center"; ctx.fillText("✨", s[0] + 9, s[1] - 7); ctx.restore(); }
      } catch (e2) {}
      ctx.textAlign = "center";
      if (SETTLE_GLYPH[q.kind]) { ctx.font = "13px Georgia, serif"; ctx.fillText(SETTLE_GLYPH[q.kind], s[0], s[1] - 9); }
      else if (q.kind === "dungeon") { ctx.font = "12px serif"; ctx.fillText("💀", s[0], s[1] - 10); }
    }
    // labels: priority + vertical separation
    {
      const labels = [];
      for (const q of inView) {
        const s = w2s(q.x, q.y);
        labels.push({ q, x: Math.min(Math.max(s[0], 70), W - 70), y: s[1] - 14, prio: q.kind === "dungeon" ? 0 : (q.kind === "town" || SETTLE_GLYPH[q.kind]) ? 1 : 2 });
      }
      labels.sort((a, b) => a.prio - b.prio);
      let kept = labels.slice(0, 40);
      // zoomed out: only delves, towns, and hearths near the traveler earn labels
      if (R >= 5 && p && !p.inDungeon) {
        kept = kept.filter(it => it.prio <= 1 || Math.hypot(it.q.x - p.x, it.q.y - p.y) <= 48);
      }
      kept.sort((a, b) => a.y - b.y);
      for (let i = 1; i < kept.length; i++) { if (kept[i].y - kept[i - 1].y < 14) kept[i].y = kept[i - 1].y + 14; }
      ctx.save();
      ctx.font = "12px Georgia, serif"; ctx.textAlign = "center";
      for (const it of kept) {
        const yy = Math.min(Math.max(it.y, 12), H - 6);
        // every hearth keeps a Stable lodge — the 🐴 suffix answers
        // "where do I stable my beasts?" right on the map
        let lname = it.q.name;
        try {
          if (it.q.kind && (SETTLE_GLYPH[it.q.kind] || it.q.kind === "town") && it.q.kind !== "dungeon") {
            if (!/🐴/.test(lname)) lname = lname + " 🐴";
          }
        } catch (e) { }
        ctx.fillStyle = "rgba(11,11,11,0.85)"; ctx.fillText(lname, it.x + 1, yy + 1);
        ctx.fillStyle = "rgba(240,228,207,0.92)"; ctx.fillText(lname, it.x, yy);
      }
      ctx.restore();
    }
    // service pins: one glyph per special building in each visible hearth
    // (markets, inns, forges, books, dojos, temples… — never plain houses).
    // Stables + lodges pin at their nexus; everything else pins at the
    // building's center. Collapsed buildings pin nothing.
    try {
      if (window.Buildings && window.World && p && !p.inDungeon) {
        ctx.save();
        ctx.font = "12px sans-serif"; ctx.textAlign = "center";
        const seenSettle = new Set();
        const pinFor = window.Buildings.servicePinFor;
        const isCollapsed = window.Buildings.buildingCollapsed;
        for (const q of inView) {
          if (!q || q.kind === "dungeon") continue;
          if (!(SETTLE_GLYPH[q.kind] || q.kind === "town")) continue;
          let s = null;
          try { s = window.World.settlementAt(Math.floor(q.x), Math.floor(q.y)); } catch (e) { }
          if (!s) continue;
          const sk = s.cx + "," + s.cy + ":" + s.type;
          if (seenSettle.has(sk)) continue;
          seenSettle.add(sk);
          let list = null;
          try { list = window.Buildings.settlementBuildings(s); } catch (e) { }
          if (!list) continue;
          for (const b of list) {
            if (!b || !b.classKey) continue;
            try { if (isCollapsed && isCollapsed(b)) continue; } catch (e) { }
            const isLodge = (() => { try { return window.Buildings.isBeastLodgeKey ? window.Buildings.isBeastLodgeKey(b.classKey) : (b.classKey === "beast_lodge" || b.classKey === "bestiary"); } catch (e) { return false; } })();
            let glyph = null, px = null, py = null;
            if (b.classKey === "stable" || isLodge) {
              try { const np = isLodge ? window.Buildings.beastLodgeNexusPos(b) : window.Buildings.stableNexusPos(b); if (np) { px = np.x; py = np.y; } } catch (e) { }
              glyph = isLodge ? "🧬" : "🐴";
            } else {
              try { glyph = pinFor ? pinFor(b.classKey) : null; } catch (e) { glyph = null; }
              if (glyph) { px = b.x0 + b.w / 2; py = b.y0 + b.h / 2; }
            }
            if (!glyph || px == null) continue;
            const sp = w2s(px, py);
            if (sp[0] < -20 || sp[1] < -20 || sp[0] > W + 20 || sp[1] > H + 20) continue;
            ctx.fillText(glyph, sp[0], sp[1] - 4);
          }
          if (seenSettle.size > 12) break;
        }
        ctx.restore();
      }
    } catch (e) { }
    // party dots (at the delve mouth while inside — the party delves with you)
    try {
      const _pinD = !!(p && p.inDungeon);
      const _pm = _pinD ? dungeonMouthSurface(p.inDungeon, p.exitPos) : null;
      for (const n of window.Game.G.npcs) {
        if (!n.inParty) continue;
        if (_pinD && !_pm) continue;
        const s = w2s(_pinD ? _pm.x : (n.x ?? n.gx), _pinD ? _pm.y : (n.y ?? n.gy));
        if (s[0] < -10 || s[1] < -10 || s[0] > W + 10 || s[1] > H + 10) continue;
        ctx.fillStyle = "#7dff7d"; ctx.beginPath(); ctx.arc(s[0], s[1], 2.5, 0, 7); ctx.fill();
      }
    } catch (e) { }
    // multiplayer travelers on the Known World map: allies glow green with a
    // name label, other travelers blue; their party members trail as dots.
    // Delvers plot at their delve MOUTH (surface coords) — that is where
    // they are on this map — with a 🕳️ depth tag, so allies can see exactly
    // which dungeon each traveler is inside. Only the shown dimension plots.
    try {
      if (window.MP && window.MP.M && window.MP.M.active && p) {
        const allied = window.MP.isAlliedHash;
        let _dittoMap = null;
        try { _dittoMap = (window.Game && window.Game.remoteCloneViews && window.Game.remoteCloneViews()) || []; } catch (eDD) { _dittoMap = []; }
        for (const r of window.MP.getRemotes()) {
          if (!r || r.x == null || r.y == null) continue;
          const _rInD = !!r.dun;
          let _rx, _ry, _rLv = 0;
          if (_rInD) {
            try { if (r.dim && r.dim !== mapDim) continue; } catch (e) { }
            const _rm = dungeonMouthSurface(r.dId, null);
            if (!_rm) continue;
            _rx = _rm.x; _ry = _rm.y; _rLv = (r.dLv | 0) || 0;
          } else {
            try { if (r.dim && r.dim !== mapDim) continue; } catch (e) { }
            _rx = r.x; _ry = r.y;
          }
          let isA = false;
          try { isA = !!(allied && r.remoteHash && allied(r.remoteHash)); } catch (e) { }
          const s = w2s(_rx, _ry);
          if (s[0] > -30 && s[1] > -30 && s[0] < W + 30 && s[1] < H + 30) {
            const c = isA ? "#5dd68a" : "#4da3ff";
            ctx.save();
            ctx.shadowColor = c; ctx.shadowBlur = 12;
            ctx.fillStyle = c;
            ctx.beginPath(); ctx.arc(s[0], s[1], 6, 0, 7); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.restore();
            if (isA) {
              ctx.font = "bold 11px Georgia, serif"; ctx.textAlign = "center";
              const nm = String(r.name || "Ally").slice(0, 16) + (_rInD ? ` 🕳️${_rLv ? "L" + _rLv : ""}` : "");
              ctx.fillStyle = "#0b0b0b"; ctx.fillText(nm, s[0] + 1, s[1] + 19);
              ctx.fillStyle = "#c9ffd9"; ctx.fillText(nm, s[0], s[1] + 18);
            }
          }
          try {
            for (const q of (r.party || [])) {
              if (!q || q.x == null || q.y == null) continue;
              // the party shares its owner's frame — delve-local while
              // inside, so plot at the mouth with the owner
              const sp = _rInD ? w2s(_rx, _ry) : w2s(q.x, q.y);
              if (sp[0] < -10 || sp[1] < -10 || sp[0] > W + 10 || sp[1] > H + 10) continue;
              ctx.fillStyle = isA ? "#5dd68a" : "#4da3ff";
              ctx.beginPath(); ctx.arc(sp[0], sp[1], 2.5, 0, 7); ctx.fill();
            }
          } catch (e) { }
          // their living shadow clones: same pin as the hero, never labeled —
          // the copies are indistinguishable on your map too
          try {
            const _rh = String(r.remoteHash || "").toLowerCase();
            for (const _cv of (_dittoMap || [])) {
              if (!_cv || !_cv.isRemoteClone) continue;
              try { if (String((_cv.remoteHash || "")).toLowerCase() !== _rh) continue; } catch (eH) { continue; }
              let _cx, _cy;
              if (_cv.dun) {
                try { if (_cv.dim && _cv.dim !== mapDim) continue; } catch (eD) { }
                const _cm = dungeonMouthSurface(_cv.dId, null);
                if (!_cm) continue;
                _cx = _cm.x; _cy = _cm.y;
              } else {
                try { if (_cv.dim && _cv.dim !== mapDim) continue; } catch (eD) { }
                _cx = _cv.x; _cy = _cv.y;
              }
              const sd = w2s(_cx, _cy);
              if (sd[0] < -30 || sd[1] < -30 || sd[0] > W + 30 || sd[1] > H + 30) continue;
              const c2 = isA ? "#5dd68a" : "#4da3ff";
              ctx.save();
              ctx.shadowColor = c2; ctx.shadowBlur = 12;
              ctx.fillStyle = c2;
              ctx.beginPath(); ctx.arc(sd[0], sd[1], 6, 0, 7); ctx.fill();
              ctx.shadowBlur = 0;
              ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
              ctx.restore();
            }
          } catch (eCV) { }
        }
      }
    } catch (e) { }
    // your own living shadow clones on the Known World map: purple pins, so
    // the caster can tell copies apart (local information only)
    try {
      if (p && !p.inDungeon && window.Game && window.Game.G && window.Game.G.shadowClones) {
        for (const c of window.Game.G.shadowClones) {
          if (!c || !(c.hp > 0)) continue;
          const cx = c.x ?? c.gx, cy = c.y ?? c.gy;
          if (cx == null || cy == null) continue;
          const s = w2s(cx, cy);
          if (s[0] > -30 && s[1] > -30 && s[0] < W + 30 && s[1] < H + 30) {
            ctx.save();
            ctx.shadowColor = "#b79bff"; ctx.shadowBlur = 12;
            ctx.fillStyle = "#b79bff";
            ctx.beginPath(); ctx.arc(s[0], s[1], 4, 0, 7); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.restore();
          }
        }
      }
    } catch (eOC) { }
    // quest target markers (active quests with overworld targets) — big + glowing
    try {
      if (p && !p.inDungeon && window.Quests) {
        let qt = 0;
        try { qt = performance.now() / 500; } catch (e) { }
        const qmarks = [];
        for (const q of window.Quests.active(p)) {
          const tp = window.Quests.targetPos(q);
          if (!tp || tp.dungeon || p.inDungeon) continue;
          // v18: quest targets are dimension-local — never mark foreign ground.
          // (v21: heaven heroes used to read as surf, hiding heaven marks.)
          try {
            const qd = q && q.target && (q.target.dim === "hell" || q.target.dim === "heaven" || q.target.dim === "surf") ? q.target.dim : null;
            const _pdd = p && p.dim;
            const pd = (_pdd === "hell" || _pdd === "heaven" || _pdd === "surf") ? _pdd : "surf";
            if (qd && qd !== pd) continue;
          } catch (e) {}
          qmarks.push({ x: tp.x, y: tp.y, title: q.title, glyph: "❗" });
        }
        // guild contracts mark their grounds too — Track centers on empty land otherwise
        try {
          if (window.Guild && window.Guild.active) {
            for (const q of (window.Guild.active(p) || [])) {
              const t = q && q.target;
              if (!t || !isFinite(t.gx) || !isFinite(t.gy)) continue;
              qmarks.push({ x: t.gx, y: t.gy, title: q.title, glyph: "🏛️" });
            }
          }
        } catch (eG) { }
        for (const m of qmarks) {
          const s = w2s(m.x, m.y);
          if (s[0] < -24 || s[1] < -24 || s[0] > W + 24 || s[1] > H + 24) continue;
          const pu = 0.6 + 0.4 * Math.sin(qt + s[0]);
          ctx.save();
          ctx.globalAlpha = 0.55 + 0.35 * pu;
          ctx.strokeStyle = "#ffd93d"; ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ffd93d"; ctx.shadowBlur = 14;
          ctx.beginPath(); ctx.arc(s[0], s[1], 11 + 2 * pu, 0, 7); ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.shadowColor = "#ffd93d"; ctx.shadowBlur = 12;
          ctx.fillStyle = "#ffd93d";
          ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(m.glyph, s[0], s[1] + 1);
          ctx.restore();
          ctx.font = "bold 13px Georgia, serif"; ctx.textAlign = "center";
          ctx.fillStyle = "rgba(11,11,11,0.9)"; ctx.fillText(String(m.title || "").slice(0, 30), s[0] + 1, s[1] + 21);
          ctx.fillStyle = "rgba(255,217,61,0.98)"; ctx.fillText(String(m.title || "").slice(0, 30), s[0], s[1] + 20);
        }
      }
    } catch (e) { }
    // player pin: the delve mouth while inside (with depth), live feet otherwise
    try {
      const _pinD = !!(p && p.inDungeon);
      const _pm = _pinD ? dungeonMouthSurface(p.inDungeon, p.exitPos) : null;
      if (!_pinD || _pm) {
        const s = w2s(_pinD ? _pm.x : p.x, _pinD ? _pm.y : p.y);
        if (s[0] > -30 && s[1] > -30 && s[0] < W + 30 && s[1] < H + 30) {
          ctx.save();
          ctx.shadowColor = "#e8863d"; ctx.shadowBlur = 14;
          ctx.fillStyle = "#e8863d";
          ctx.beginPath(); ctx.arc(s[0], s[1], 7, 0, 7); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
          const _plabel = _pinD ? `${p.name} 🕳️L${((p.dungeonLevel | 0) || 1)}` : p.name + " (you)";
          ctx.font = "bold 11px Georgia, serif"; ctx.textAlign = "center";
          ctx.fillStyle = "#0b0b0b"; ctx.fillText(_plabel, s[0] + 1, s[1] + 19);
          ctx.fillStyle = "#fff"; ctx.fillText(_plabel, s[0], s[1] + 18);
        }
      }
    } catch (e) { }
    // dashed gold frame
    ctx.save();
    ctx.strokeStyle = "rgba(232,163,61,0.35)"; ctx.setLineDash([8, 7]); ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 4, W - 8, H - 8);
    ctx.setLineDash([]); ctx.restore();
    // inset: the whole known vale
    drawMapInset(ctx, W, H);
    if ($("mapInfo")) {
      let visited = 0;
      try { visited = visitedHearths().length; } catch (e) { }
      $("mapInfo").textContent = p && p.inDungeon
        ? `Inside ${(window.Game.G.dungeon || {}).name || "dungeon"} — level ${((p.dungeonLevel | 0) || 1)}. Stairs climb out; the 🌀 portal goes deeper. Global exit: ${p.exitPos ? `${p.exitPos.x.toFixed(0)},${p.exitPos.y.toFixed(0)}` : "?"}`
        : p ? `Center ${(mapView.x / 16).toFixed(1)},${(mapView.y / 16).toFixed(1)} · drag to pan, wheel to zoom · You: ${p.x.toFixed(0)}, ${p.y.toFixed(0)} · ${visited} visited of ${places.length} known hearths`
        : "";
    }
  }
  async function wanderDream() {
    const p = window.Game.G.player;
    if (!p || p.inDungeon) { toast("Finish this delve first — dream afterwards."); return; }
    toast("🧭 The vale inhales... dreaming somewhere new.", 2500);
    try {
      const pcx = Math.floor(p.x / 16), pcy = Math.floor(p.y / 16);
      for (let tries = 0; tries < 24; tries++) {
        const cx = pcx + (2 + Math.floor(Math.random() * 5)) * (Math.random() < 0.5 ? -1 : 1);
        const cy = pcy + (2 + Math.floor(Math.random() * 5)) * (Math.random() < 0.5 ? -1 : 1);
        // Install the chunk into the live cache BEFORE walkable() checks:
        // walkable() reads G.chunks (GRASS fallback for missing chunks), so
        // testing without this happily picks a wall/tree as "open ground".
        try {
          const ch = await window.World.getChunk(cx, cy);
          try { window.Game.G.chunks.set(cx + "," + cy, ch); } catch (e2) { }
        } catch (e) { }
        for (let t = 0; t < 16; t++) {
          const x = cx * 16 + 2 + Math.random() * 12, y = cy * 16 + 2 + Math.random() * 12;
          if (window.Game.walkable(x, y)) {
            p.x = x; p.y = y;
            await window.Game.ensureChunks();
            await window.Game.refreshNpcCache();
            mapView = { x: p.x, y: p.y, range: mapView ? mapView.range : 6 };
            drawWorldMap();
            refreshHearthList();
            try { window.UI.updateHUD(); window.Game.saveGame(true); window.Sfx.stairs(); } catch (e) { }
            toast("🌙 You wake beneath unfamiliar stars.", 3500);
            try { window.AIDirector.enrichChunk(cx, cy); } catch (e) { }
            return;
          }
        }
      }
      toast("The dream slips away — try again.");
    } catch (e) { toast("The dream slips away — try again."); }
  }
  // ---------- hearth travel: portals + map teleport (visited hearths only) ----------
  function visitedHearths() {
    let seen = [];
    try { seen = (window.Game.G.player.seenPlaces) || []; } catch (e) { }
    try {
      const norm = new Set((seen || []).map(s => String(s).slice(0, 28)));
      return mapPlaces().filter(q => q.kind !== "dungeon" && q.kind !== "base" && norm.has(q.name));
    } catch (e) { return []; }
  }
  async function teleportToHearth(place) {
    const p = window.Game.G.player;
    if (!p || !place) return;
    try {
      if (p.inDungeon) await window.Game.exitDungeon();
      const heroDim = (p.dim === "hell") ? "hell" : (p.dim === "heaven") ? "heaven" : "surf";
      // v22 cross-dim tower jump: a discovered tower's map pin reaches BOTH
      // sides (twin towers share coordinates — the same place in two
      // worlds). Sealed network stays shut: no sphere/wake, no crossing.
      if (place.kind === "hell_tower" && (place.dim === "hell" || place.dim === "surf") && place.dim !== heroDim) {
        let ok = false;
        try { ok = !!(window.Hell && (window.Hell.towersUnlocked(p) || window.Hell.hasSphere(p))); } catch (e) { }
        if (!ok) { toast("🗼 The towers sleep — wake one with a Hell Sphere and every tower stands open.", 4500); return; }
        try { p.posByDim = p.posByDim || {}; p.posByDim[heroDim] = { x: p.x, y: p.y }; } catch (e) { }
        try { if (window.World && window.World.setDim) window.World.setDim(place.dim); } catch (e) { }
        try { p.dim = place.dim; } catch (e) { }
        const tx = place.x + 0.5, ty = place.y + 0.5;
        try { p.posByDim[place.dim] = { x: tx, y: ty }; } catch (e) { }
        // a map jump can be the first hell entry — it lands in the tower,
        // same as walking the red portal (stamped as the hell spawn)
        try { if (place.dim === "hell" && !p.hellEntered) { p.hellEntered = true; p.hellSpawn = { x: tx, y: ty }; } } catch (e) { }
        try {
          p.x = tx; p.y = ty;
          p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
          if (window.Game && window.Game.clearCombat) { try { window.Game.clearCombat(); } catch (e) { } }
          const G = window.Game.G;
          try { G.mobs = []; G.projectiles = []; G.npcs = []; G.chunks = new Map(); } catch (e) { }
          try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) { }
          try { if (window.Game && window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e) { }
          try { if (window.Game && window.Game.summonParty) window.Game.summonParty({ quiet: true }); } catch (e) { }
          try { if (window.Game.noteSafeHellGround) window.Game.noteSafeHellGround(true); } catch (e) { }
          try {
            if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround();
            else if (window.Game.G) window.Game.G._groundVer = (window.Game.G._groundVer || 0) + 1;
          } catch (e2) { }
        } catch (e) { }
        try { if (window.MP && window.MP.fetchTiles) await window.MP.fetchTiles(p.x, p.y, 3); } catch (e) { }
        try { mapCenter(); } catch (e) { }
        if (mapView) { mapView.x = p.x; mapView.y = p.y; }
        drawWorldMap();
        refreshHearthList();
        try { window.UI.updateHUD(); window.Game.saveGame(true); } catch (e) { }
        toast(`🗼 The tower takes you — Hell Tower ${(place.x | 0)},${(place.y | 0)}, ${place.dim === "hell" ? "fire" : "daylight"} side.`, 4000);
        return;
      }
      // Settle onto proper town ground: the hearth portal plaza when there is
      // one, else outdoor walkable. safeTownLanding loads the target chunks
      // FIRST — walkable() before that reads GRASS for unloaded chunks and
      // happily picks a wall. (Settlement centers can sit in walls/water.)
      let tx = place.x, ty = place.y;
      try {
        const s = await window.Game.safeTownLanding(place.x, place.y);
        if (s && Number.isFinite(s.x) && Number.isFinite(s.y)) { tx = s.x; ty = s.y; }
      } catch (e) {
        try {
          outer: for (let r = 0; r <= 12; r++) {
            for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
              if (window.Game.walkable(place.x + dx, place.y + dy)) { tx = place.x + dx; ty = place.y + dy; break outer; }
            }
          }
        } catch (e2) { }
      }
      p.x = tx; p.y = ty;
      try { window.Sfx.stairs(); } catch (e) { }
      await window.Game.ensureChunks();
      // v21: arrivals are vetted ground — stamp last safe hell ground so an
      // unbound hell death wakes back here, not at the corpse.
      try { if (window.Game.noteSafeHellGround) window.Game.noteSafeHellGround(true); } catch (e) { }
      // shared ground: stamp the host's wreckage onto the arrival chunks
      try { if (window.MP && window.MP.fetchTiles) await window.MP.fetchTiles(p.x, p.y, 3); } catch (e) { }
      // regroup living followers onto walkable tiles by the landing (silent —
      // they would otherwise chase from stale/far coords after the jump)
      try { window.Game.summonParty({ quiet: true }); } catch (e) { }
      await window.Game.refreshNpcCache();
      try { mapCenter(); } catch (e) { }
      if (mapView) { mapView.x = p.x; mapView.y = p.y; }
      drawWorldMap();
      refreshHearthList();
      try { window.UI.updateHUD(); window.Game.saveGame(true); } catch (e) { }
      toast(`✨ The miles fold away. ${place.name}.`, 3000);
    } catch (e) { }
  }
  function refreshHearthList() {
    // The old hearth dropdown is gone (it didn't scale past a handful of
    // towns). The map is the picker now: search narrows, dots teleport.
    // This just keeps an open search in sync after teleports/dreams.
    try { renderMapSearch(); } catch (e) { }
  }
  // ---------- map search + click-to-teleport ----------
  // Every known place (hearths + delves) is searchable; clicking a result
  // centers the map, clicking a glowing hearth dot prompts to teleport.
  let mapPortalMode = false; // map opened from a portal (closes on travel)
  function mapKnownPlaces() {
    try { return mapPlaces(); } catch (e) { return []; }
  }
  function isVisitedHearth(q) {
    if (!q || q.kind === "dungeon" || q.kind === "base") return false;
    try {
      const seen = (window.Game.G.player.seenPlaces) || [];
      const norm = new Set(seen.map(s => String(s).slice(0, 28)));
      return norm.has(String(q.name).slice(0, 28));
    } catch (e) { return false; }
  }
  function renderMapSearch() {
    try {
      const box = $("mapSearchResults");
      const inp = $("mapSearch");
      if (!box) return;
      const needle = inp ? (inp.value || "").trim().toLowerCase() : "";
      box.innerHTML = "";
      if (!needle) return;
      const hits = mapKnownPlaces().filter(q => q.name.toLowerCase().includes(needle)).slice(0, 8);
      if (!hits.length) {
        const d = document.createElement("div");
        d.style.cssText = "font-size:12px;opacity:0.7;padding:2px 4px";
        d.textContent = "No known place matches — explore further.";
        box.appendChild(d);
        return;
      }
      for (const q of hits) {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:6px;align-items:center;font-size:13px;min-height:44px";
        const go = document.createElement("button");
        go.className = "ghost";
        go.style.cssText = "flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:44px";
        const glyph = q.kind === "dungeon" ? "\u{1F573}\uFE0F " : q.kind === "hell_tower" ? "\u{1F5FC} " : "\u{1F4CD} ";
        const star = isVisitedHearth(q) ? "\u2728 " : "";
        go.textContent = star + glyph + q.name;
        go.title = q.kind === "hell_tower" ? "Center map here (teleport offers both sides)" : "Center map here";
        go.onclick = () => {
          try {
            mapCenter();
            if (mapView) { mapView.x = q.x; mapView.y = q.y; }
            drawWorldMap();
          } catch (e) { }
        };
        row.appendChild(go);
        if (isVisitedHearth(q)) {
          const tp = document.createElement("button");
          tp.textContent = "\u2728 go";
          tp.title = "Teleport to " + q.name;
          tp.onclick = async () => { await promptMapTeleport(q); };
          row.appendChild(tp);
        }
        box.appendChild(row);
      }
      try { fitMapCanvas(); } catch (e) { }
    } catch (e) { }
  }
  // screen (CSS px, relative to the canvas) -> world tiles
  function mapScreenToWorld(sx, sy, cw, ch) {
    mapCenter();
    const W = 520, H = 360, R = mapView.range;
    const vw = (R * 2 + 1) * 16, vh = vw * H / W;
    return {
      x: mapView.x - vw / 2 + sx / cw * vw,
      y: mapView.y - vh / 2 + sy / ch * vh,
      vw, vh,
    };
  }
  function handleMapClick(cssX, cssY, cssW, cssH) {
    try {
      if (!mapView || $("mapModal").hidden) return;
      const w = mapScreenToWorld(cssX, cssY, cssW, cssH);
      // nearest known place in screen space (scales with zoom)
      let best = null, bd = 28; // css px
      for (const q of mapKnownPlaces()) {
        const sx = (q.x - (mapView.x - w.vw / 2)) / w.vw * cssW;
        const sy = (q.y - (mapView.y - w.vh / 2)) / w.vh * cssH;
        const d = Math.hypot(sx - cssX, sy - cssY);
        if (d < bd) { bd = d; best = q; }
      }
      if (!best) return; // empty wilds — plain pan click
      hideMapTeleportPrompt();
      if (isVisitedHearth(best)) {
        try {
          const p = window.Game.G.player;
          // towers share coordinates across dims — never "already here",
          // the pin's side picker decides (surf side vs hell side)
          if (p && best.kind !== "hell_tower" && Math.hypot(best.x - p.x, best.y - p.y) < 3) {
            toast("You're already at " + best.name + ".");
            return;
          }
        } catch (e) { }
        promptMapTeleport(best);
      } else {
        // delve or not-yet-visited: center it so the player can look around
        try {
          mapCenter();
          if (mapView) { mapView.x = best.x; mapView.y = best.y; }
          drawWorldMap();
        } catch (e) { }
        toast(best.kind === "dungeon" ? ("\u{1F573}\uFE0F " + best.name + " — delves can't be teleported to.") : ("\u{1F4CD} " + best.name + " doesn't know your name yet — visit first."));
      }
    } catch (e) { }
  }
  function hideMapTeleportPrompt() {
    try {
      const box = $("mapTeleportPrompt");
      if (box) { box.hidden = true; box.innerHTML = ""; }
      try { fitMapCanvas(); } catch (e) { }
    } catch (e) { }
  }
  async function promptMapTeleport(q) {
    try {
      // towers reach both sides — twin towers share coordinates, so a
      // discovered tower's pin offers the surf side and the hell side
      if (q && q.kind === "hell_tower") { await promptTowerTeleport(q); return; }
      const box = $("mapTeleportPrompt");
      if (!box) { await teleportToHearth(q); return; }
      box.hidden = false;
      box.innerHTML = "";
      const label = document.createElement("span");
      label.textContent = "\u2728 Travel to " + q.name + "? ";
      const go = document.createElement("button");
      go.textContent = "\u2728 go";
      go.onclick = async () => {
        hideMapTeleportPrompt();
        if (mapPortalMode) { try { $("mapModal").hidden = true; mapView = null; mapPortalMode = false; } catch (e) { } }
        await teleportToHearth(q);
      };
      const no = document.createElement("button");
      no.className = "ghost";
      no.textContent = "stay";
      no.onclick = () => hideMapTeleportPrompt();
      box.appendChild(label); box.appendChild(go); box.appendChild(document.createTextNode(" ")); box.appendChild(no);
      try { go.focus(); } catch (e) { }
      try { fitMapCanvas(); } catch (e2) { }
    } catch (e) { }
  }
  // tower side picker: a discovered tower's pin teleports to EITHER side —
  // the twins share coordinates, so each button lands on that side's heart.
  // Crossing sides needs the woken network (sphere / shared wake / unlock);
  // the side you're standing on is always free.
  async function promptTowerTeleport(q) {
    try {
      const H = window.Hell, p = window.Game.G && window.Game.G.player;
      const box = $("mapTeleportPrompt");
      if (!H || !p || !box) { await teleportToHearth(q); return; }
      let sx = null, sy = null, hx = null, hy = null;
      try {
        for (const t of (H.SURFACE_TOWERS || [])) if (Math.hypot(q.x - t.x, q.y - t.y) < 2) { sx = t.x; sy = t.y; break; }
        for (const t of (H.HELL_TOWERS || [])) if (Math.hypot(q.x - t.x, q.y - t.y) < 2) { hx = t.x; hy = t.y; break; }
      } catch (e) { }
      if (sx == null && hx == null) { await teleportToHearth(q); return; }
      const heroDim = (p.dim === "hell") ? "hell" : (p.dim === "heaven") ? "heaven" : "surf";
      let unlocked = false;
      try { unlocked = !!(H.towersUnlocked(p) || H.hasSphere(p)); } catch (e) { }
      box.hidden = false;
      box.innerHTML = "";
      const label = document.createElement("span");
      const tx = (sx != null ? sx : hx) | 0, ty = (sy != null ? sy : hy) | 0;
      label.textContent = `\u{1F5FC} Hell Tower ${tx},${ty} — which side? `;
      box.appendChild(label);
      const goSide = (dim, txt, title) => {
        const b = document.createElement("button");
        b.textContent = txt; b.title = title;
        b.onclick = async () => {
          hideMapTeleportPrompt();
          if (dim !== heroDim && !unlocked) { toast("🗼 The towers sleep — wake one with a Hell Sphere and every tower stands open.", 4500); return; }
          if (mapPortalMode) { try { $("mapModal").hidden = true; mapView = null; mapPortalMode = false; } catch (e) { } }
          const px = dim === "hell" ? hx : sx, py = dim === "hell" ? hy : sy;
          await teleportToHearth({ x: px != null ? px : q.x, y: py != null ? py : q.y, name: q.name, kind: "hell_tower", dim });
        };
        box.appendChild(b);
        box.appendChild(document.createTextNode(" "));
      };
      if (sx != null) goSide("surf", heroDim === "surf" ? "✨ surface (here)" : "✨ surface side", "Teleport to the daylight side of this tower");
      if (hx != null) goSide("hell", heroDim === "hell" ? "🔥 hell (here)" : "🔥 hell side", "Teleport to the fire side of this tower");
      const no = document.createElement("button");
      no.className = "ghost";
      no.textContent = "stay";
      no.onclick = () => hideMapTeleportPrompt();
      box.appendChild(no);
      try { fitMapCanvas(); } catch (e2) { }
    } catch (e) { }
  }
  function openHearthTravel() {
    // Hearth portal choice: travel on through the Known world, or bind this
    // portal as the default respawn point.
    try {
      const here = portalHearthHere();
      if (!here) { openHearthMap(); return; }
      // v20: binds stamp the current dimension (hell holds bind hell-side).
      let dimNow = "surf", _dnok = false;
      try { const _dn = (window.Game.G.player.dim) || "surf"; if (_dn === "heaven" || _dn === "hell" || _dn === "surf") { dimNow = _dn; _dnok = true; } } catch (e) { }
      try { if (!_dnok && window.World && window.World.getDim) dimNow = window.World.getDim(); } catch (e) { }
      try { closeHearthTravel(); } catch (e) { }
      const m = $("travelModal");
      if (!m) { openHearthMap(); return; }
      try { $("travelTitle").textContent = "\u{1F300} " + here.name + " portal"; } catch (e) { }
      let cur = "the starting town";
      try { cur = window.Game.respawnHearthName ? window.Game.respawnHearthName() : cur; } catch (e) { }
      let isHome = false;
      try { const h = window.Game.getRespawnHearth ? window.Game.getRespawnHearth() : null; isHome = !!(h && h.name === here.name && h.dim === dimNow); } catch (e) { }
      try {
        const d = $("travelDesc");
        if (d) d.textContent = "The old stones hum. Every hearth that knows your name answers \u2014 and this one could wake you when you fall. (Respawn: " + cur + ".)";
      } catch (e) { }
      const go = $("travelGoBtn"), home = $("travelHomeBtn"), hv = $("travelHeavenBtn"), tw = $("travelTowerBtn");
      try {
        if (hv) {
          let showHv = false, hvLabel = "", hvTitle = "";
          try {
            const p = window.Game.G.player;
            const has = !!(window.Heaven && window.Heaven.hasSphere && window.Heaven.hasSphere(p));
            // INTO heaven demands the physical sphere in hand — a merely
            // unlocked hero without one stays grounded until one is gifted.
            if (dimNow === "surf" && has) { showHv = true; hvLabel = "🌅 Step into heaven (same ground, dawn side)"; hvTitle = "The heavenly sphere lifts you to the same coordinates in heaven."; }
            else if (dimNow === "heaven") { showHv = true; hvLabel = "✨ Step back to the surface (same ground)"; hvTitle = "Return to the same coordinates on the surface."; }
          } catch (eH) {}
          hv.hidden = !showHv;
          if (showHv) {
            hv.textContent = hvLabel; hv.title = hvTitle;
            hv.onclick = async () => {
              try { closeHearthTravel(); } catch (e) {}
              try {
                if (window.Heaven && window.Heaven.useHearthGate) await window.Heaven.useHearthGate(here);
              } catch (e2) { try { toast("🌅 The heavens are silent.", 3000); } catch (e3) {} }
            };
          } else hv.onclick = null;
        }
      } catch (eHv) {}
      if (go) go.onclick = () => { try { closeHearthTravel(); } catch (e) { } openHearthMap(); };
      // v21 tower road: a hell hearth portal walks the hero out through the
      // nearest woken surface tower (twin towers share coordinates). Sealed
      // towers stay listed but silent until a Hell Sphere wakes them.
      try {
        if (tw) {
          let showTw = false;
          try { showTw = (dimNow === "hell"); } catch (eT) { }
          tw.hidden = !showTw;
          if (showTw) {
            let wake = false;
            try {
              const p = window.Game.G.player;
              wake = !!((window.Hell && window.Hell.towersUnlocked && window.Hell.towersUnlocked(p)) || (window.Hell && window.Hell.hasSphere && window.Hell.hasSphere(p)));
            } catch (eT2) { }
            tw.textContent = wake ? "🗼 Walk the tower road — nearest surface tower" : "🗼 The towers sleep (need a Hell Sphere)";
            tw.title = wake ? "Leave hell through the tower road: emerge at the nearest woken surface tower." : "Wake any tower with a Hell Sphere first — then this road opens.";
            tw.onclick = async () => {
              try { closeHearthTravel(); } catch (e) { }
              try { if (window.Hell && window.Hell.portalToSurfaceTower) await window.Hell.portalToSurfaceTower(); } catch (e2) { try { toast("🗼 The tower road is silent.", 3000); } catch (e3) { } }
            };
          } else tw.onclick = null;
        }
      } catch (eTw) { }
      if (home) {
        home.disabled = isHome;
        home.textContent = isHome ? "\u{1F3E0} This is your respawn point" : ("\u{1F3E0} Set " + here.name + " as respawn");
        home.title = isHome ? "You already wake here when you fall" : "Death will wake you at this hearth's portal instead of " + cur;
        home.onclick = () => {
          try {
            const h = window.Game.setRespawnHearth(here.name, here.x, here.y, dimNow);
            if (h) {
              toast("\u{1F3E0} Respawn bound: " + h.name + " \u2014 death will wake you at its portal.", 4000);
              try { window.Game.saveGame(true); } catch (eSave) { }
            }
            else toast("Couldn't bind that portal.", 3000);
          } catch (e) { }
          try { closeHearthTravel(); } catch (e2) { }
        };
      }
      m.hidden = false;
    } catch (e) { }
  }
  // the hearth whose portal stones you are standing at (nearest known hearth)
  function portalHearthHere() {
    try {
      const p = window.Game.G.player;
      if (!p) return null;
      let best = null, bd = 60 * 60;
      for (const q of mapPlaces()) {
        if (!q || q.kind === "dungeon" || q.kind === "base") continue;
        const d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
        if (d < bd) { bd = d; best = q; }
      }
      if (best) return { name: best.name, x: best.x, y: best.y };
    } catch (e) { }
    return null;
  }
  function openHearthMap() {
    // the map half of the portal: search or click a glowing dot (closes on travel).
    try {
      try { closeHearthTravel(); } catch (e) { }
      mapPortalMode = true;
      hideMapTeleportPrompt();
      toggleMap(true);
      try {
        const inp = $("mapSearch");
        if (inp) { inp.value = ""; renderMapSearch(); }
      } catch (e) { }
      toast("\u2728 Every hearth that knows your name answers \u2014 click a glowing dot.");
    } catch (e) { }
  }
  function closeHearthTravel() { try { $("travelModal").hidden = true; } catch (e) { } }

  // ---------- minimap ----------
  let mmBuf = null;
  function mmRGB(t) {
    switch (t) {
      case 3: case 4: return [42, 158, 70];
      case 5: case 6: return [63, 142, 240];
      case 8: case 9: return [169, 138, 95];
      case 13: return [90, 90, 112];
      case 14: return [44, 44, 58];
      case 10: case 11: case 23: return [176, 138, 90];
      case 21: return [106, 106, 118];
      case 12: return [138, 106, 58];
      case 24: return [150, 112, 62];
      case 25: return [122, 106, 85];
      case 7: return [217, 194, 127];
      case 19: return [255, 91, 46];
      case 26: return [159, 212, 232];
      case 27: return [74, 58, 50];
      case 28: return [46, 139, 58];
      case 29: return [176, 168, 144];
     case 30: return [127, 212, 255];
     case 31: return [217, 160, 58];
     case 32: return [160, 74, 74];
     case 33: return [192, 16, 32];
      case 34: return [238, 244, 251];
      case 35: return [122, 70, 170];
      case 36: return [50, 170, 165];
      default: return [61, 122, 68];
    }
  }
  function drawMinimap() {
    const cv = $("minimap"); if (!cv || !window.Game.G.player) return;
    const ctx = cv._ctx2d || (cv._ctx2d = cv.getContext("2d"));
    const S = cv.width || MM_DEFAULT;
    const p = window.Game.G.player;
    // Fixed zoom that always fits inside the guaranteed-loaded chunks:
    // streaming keeps the player's chunk ±1 (3x3) resident, and from any
    // spot inside the player chunk that ring covers >=16 tiles in every
    // direction — so a 16-tile half-range never samples unloaded ground
    // and there is no black periphery. (32x32-tile area.)
    const range = 16;
    // rough low-res sampling, smoothed upscale: a continuous sketch, not dots
    try {
      const N = 64;
      if (!mmBuf || mmBuf.width !== N || mmBuf.height !== N) {
        mmBuf = document.createElement("canvas");
        mmBuf.width = N; mmBuf.height = N;
      }
      const bctx = mmBuf.getContext("2d");
      const img = bctx.createImageData(N, N);
      const data = img.data;
      const step = (range * 2) / N;
      const inDun = !!(p.inDungeon && window.Game.G.dungeon);
      const dun = inDun ? window.Game.G.dungeon : null;
      for (let j = 0; j < N; j++) {
        const gy = p.y - range + (j + 0.5) * step;
        for (let i = 0; i < N; i++) {
          const gx = p.x - range + (i + 0.5) * step;
          let t = 0, loaded = true;
          try {
            if (inDun) {
              const dx = Math.floor(gx), dy = Math.floor(gy);
              if (!dun || dx < 0 || dy < 0 || dx >= dun.w || dy >= dun.h) loaded = false;
              else t = dun.tiles[dy * dun.w + dx];
            } else {
              // Unloaded chunks are UNKNOWN — never let tileAtGx's GRASS
              // fallback paint them as plains. They stay black instead.
              const ch = window.Game.chunkAt ? window.Game.chunkAt(gx, gy) : null;
              if (!ch) loaded = false;
              else t = window.Game.tileAtGx(gx, gy);
            }
          } catch (e) { loaded = false; t = 0; }
          const c = loaded ? mmRGB(t) : [0, 0, 0];
          const idx = (j * N + i) * 4;
          data[idx] = c[0]; data[idx + 1] = c[1]; data[idx + 2] = c[2]; data[idx + 3] = 255;
        }
      }
      bctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      try { ctx.imageSmoothingQuality = "high"; } catch (e) { }
      ctx.fillStyle = "rgba(8,14,20,0.9)"; ctx.fillRect(0, 0, S, S);
      ctx.drawImage(mmBuf, 0, 0, N, N, 0, 0, S, S);
    } catch (e) {
      ctx.fillStyle = "rgba(8,14,20,0.9)"; ctx.fillRect(0, 0, S, S);
    }
    const dot = (x, y, c, r = 2.5) => {
      const sx = (x - p.x + range) / (range * 2) * S, sy = (y - p.y + range) / (range * 2) * S;
      if (sx < -8 || sy < -8 || sx > S + 8 || sy > S + 8) return;
      ctx.beginPath(); ctx.arc(sx, sy, r + 1.2, 0, 7); ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.fill();
    };
    // entity dots below are drawn in one frame each — inDun/dun above live
    // inside the terrain try-block, so recompute the (cheap) scope here
    const _mmInD = !!(p.inDungeon && window.Game.G.dungeon);
    const _mmDun = _mmInD ? window.Game.G.dungeon : null;
    for (const n of window.Game.G.npcs) {
      if (p.inDungeon && !n.inParty) continue;
      // delvers carry delve-local coords — never plot them on the surface
      // (their small numbers overlap the spawn area and read as ghosts)
      if (!p.inDungeon && n.dungeonId && !n.inParty) continue;
      dot(n.x ?? n.gx, n.y ?? n.gy, n.inParty ? "#7dff7d" : "#fff", 2.5);
    }
    for (const m of window.Game.G.mobs) {
      // dungeonId-scoped: the current delve instance only while inside,
      // never delve strays on the surface
      if (_mmInD) { if (!_mmDun || String(m.dungeonId || "") !== String(_mmDun.id)) continue; }
      else if (m.dungeonId) continue;
      dot(m.x, m.y, "#ff5b5b", 2);
    }
    // the caster's own clones read purple — local information only, so the
    // hero can tell copies apart on their own map (everyone else sees dittos)
    try {
      for (const c of (window.Game.G.shadowClones || [])) {
        if (!c || !(c.hp > 0)) continue;
        const cx = c.x ?? c.gx, cy = c.y ?? c.gy;
        if (cx == null || cy == null) continue;
        if (Math.abs(cx - p.x) > range || Math.abs(cy - p.y) > range) continue;
        dot(cx, cy, "#b79bff", 2);
      }
    } catch (eMM) { }
    try {
      if (window.MP && window.MP.M && window.MP.M.active) {
        let _dittoDots = null;
        try { _dittoDots = (window.Game && window.Game.remoteCloneViews && window.Game.remoteCloneViews()) || []; } catch (eDD) { _dittoDots = []; }
        // surf and delve grids never mix, and dims never mix: same world +
        // same instance only, so coincidental coords can't conjure ghosts
        // (surface dots near spawn used to overlay delve floors and vice versa)
        const _myDim = (() => { try { const _dd = (_mmInD && _mmDun && _mmDun.dim) || (p && p.dim); return (_dd === "hell" || _dd === "heaven") ? _dd : "surf"; } catch (e) { return "surf"; } })();
        const _myDid = (_mmInD && _mmDun) ? String(_mmDun.id) : null;
        for (const r of window.MP.getRemotes()) {
          if (!r || r.x == null || r.y == null) continue;
          if (!!r.dun !== _mmInD) continue;
          if (_mmInD && _myDid && r.dId && String(r.dId) !== _myDid) continue;
          try { const _rd = r.dim; if ((_rd === "hell" || _rd === "heaven" || _rd === "surf") && _rd !== _myDim) continue; } catch (e) { }
          if (Math.abs(r.x - p.x) > range || Math.abs(r.y - p.y) > range) continue;
          let allied = false;
          try { allied = !!(window.MP.isAlliedHash && r.remoteHash && window.MP.isAlliedHash(r.remoteHash)); } catch (e) { }
          dot(r.x, r.y, allied ? "#5dd68a" : "#4da3ff", 3);
          try {
            for (const q of (r.party || [])) {
              if (!q || q.x == null || q.y == null) continue;
              if (Math.abs(q.x - p.x) > range || Math.abs(q.y - p.y) > range) continue;
              dot(q.x, q.y, allied ? "#5dd68a" : "#4da3ff", 1.8);
            }
          } catch (e) { }
          // their living shadow clones: same dot as the hero, no label —
          // on your map the copies are indistinguishable too
          try {
            const _rh = String(r.remoteHash || "").toLowerCase();
            for (const _cv of (_dittoDots || [])) {
              if (!_cv || !_cv.isRemoteClone) continue;
              try {
                if (String((_cv.remoteHash || "")).toLowerCase() !== _rh) continue;
              } catch (eH) { continue; }
              try { if ((_cv.dim === "hell" || _cv.dim === "heaven" || _cv.dim === "surf") && _cv.dim !== _myDim) continue; } catch (eD) { }
              if (Math.abs(_cv.x - p.x) > range || Math.abs(_cv.y - p.y) > range) continue;
              dot(_cv.x, _cv.y, allied ? "#5dd68a" : "#4da3ff", 3);
            }
          } catch (eCV) { }
        }
      }
    } catch (e) { }
    try {
      if (window.Quests) {
        for (const q of window.Quests.active(p)) {
          const tp = window.Quests.targetPos(q);
          if (!tp || tp.dungeon || p.inDungeon) continue;
          if (Math.abs(tp.x - p.x) > range || Math.abs(tp.y - p.y) > range) continue;
          dot(tp.x, tp.y, "#ffd93d", 3.5);
        }
      }
      // guild contract grounds get the same gold dots
      if (window.Guild && window.Guild.active) {
        for (const q of (window.Guild.active(p) || [])) {
          const t = q && q.target;
          if (!t || !isFinite(t.gx) || !isFinite(t.gy) || p.inDungeon) continue;
          if (Math.abs(t.gx - p.x) > range || Math.abs(t.gy - p.y) > range) continue;
          dot(t.gx, t.gy, "#ffd93d", 3.5);
        }
      }
    } catch (e) { }
    try {
      for (const ch of window.Game.G.chunks.values()) {
        if (!ch || !ch.pois) continue;
        if (p.inDungeon) break;
        for (const poi of ch.pois) {
          if (!poi || poi.type !== "portal") continue;
          if (Math.abs(poi.gx + 0.5 - p.x) > range || Math.abs(poi.gy + 0.5 - p.y) > range) continue;
          dot(poi.gx + 0.5, poi.gy + 0.5, "#4de3ff", 3);
        }
      }
    } catch (e) { }
    // service pins: special buildings near the hero (markets, inns, forges,
    // books, dojos, temples… — never plain houses). Same glyphs as the
    // Known World map; one pin per tile so rows of shops don't stack.
    try {
      if (window.Buildings && window.World && !p.inDungeon) {
        const seenS = new Set(), seenT = new Set();
        const pinFor = window.Buildings.servicePinFor;
        const isCollapsed = window.Buildings.buildingCollapsed;
        const probes = [[p.x, p.y], [p.x - range, p.y], [p.x + range, p.y], [p.x, p.y - range], [p.x, p.y + range]];
        for (const pr of probes) {
          let s = null;
          try { s = window.World.settlementAt(Math.floor(pr[0]), Math.floor(pr[1])); } catch (e) { }
          if (!s) continue;
          const sk = s.cx + "," + s.cy + ":" + s.type;
          if (seenS.has(sk)) continue;
          seenS.add(sk);
          let list = null;
          try { list = window.Buildings.settlementBuildings(s); } catch (e) { }
          if (!list) continue;
          for (const b of list) {
            if (!b || !b.classKey) continue;
            try { if (isCollapsed && isCollapsed(b)) continue; } catch (e) { }
            const isLodge = (() => { try { return window.Buildings.isBeastLodgeKey ? window.Buildings.isBeastLodgeKey(b.classKey) : false; } catch (e) { return false; } })();
            let glyph = null, bx = null, by = null;
            if (b.classKey === "stable" || isLodge) {
              try { const np = isLodge ? window.Buildings.beastLodgeNexusPos(b) : window.Buildings.stableNexusPos(b); if (np) { bx = np.x; by = np.y; } } catch (e) { }
              glyph = isLodge ? "🧬" : "🐴";
            } else {
              try { glyph = pinFor ? pinFor(b.classKey) : null; } catch (e) { glyph = null; }
              if (glyph) { bx = b.x0 + b.w / 2; by = b.y0 + b.h / 2; }
            }
            if (!glyph || bx == null) continue;
            if (Math.abs(bx - p.x) > range || Math.abs(by - p.y) > range) continue;
            const tk = Math.round(bx) + "," + Math.round(by);
            if (seenT.has(tk)) continue;
            seenT.add(tk);
            const sx = (bx - p.x + range) / (range * 2) * S, sy = (by - p.y + range) / (range * 2) * S;
            if (sx < -8 || sy < -8 || sx > S + 8 || sy > S + 8) continue;
            ctx.save();
            ctx.font = Math.round(Math.max(9, Math.min(14, S * 0.075))) + "px sans-serif";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(glyph, sx, sy);
            ctx.restore();
          }
          if (seenS.size > 3) break;
        }
      }
    } catch (e) { }
    // 🪦 last death marker: where the hero last fell (overworld only, and
    // only while it is near enough to matter — same 16-tile minimap range).
    try {
      const ld = p.lastDeath;
      if (ld && typeof ld.x === "number" && typeof ld.y === "number" && !p.inDungeon && !ld.inDungeon) {
        if (Math.abs(ld.x - p.x) <= range && Math.abs(ld.y - p.y) <= range) dot(ld.x, ld.y, "#c9c9c9", 3);
      }
    } catch (e) { }
    dot(p.x, p.y, "#ffd93d", 3.5);
  }

  // ---------- stable (beast lodge) ----------
  function openStable(building) {
    try {
      const G = window.Game.G, p = G && G.player;
      if (!p) return;
      try { window.Entities.ensureProgression(p); } catch (e) {}
      stableBuilding = building || null;
      stableSelId = null;
      stableMoveId = null;
      stableTab = "boxes";
      const title = $("stableTitle");
      if (title) title.textContent = `🐴 Stable${building && building.title ? " — " + building.title : ""}`;
      const desc = $("stableDesc");
      if (desc) desc.innerHTML = `Tamed beasts rest here in bought pen grids (every pen cell and every new box costs gold — first row of each box is free). The <b>🐴 Horse Market</b> tab buys stable-bred horses (more HP, faster, tougher — but no attack training) and pays gold for your horses by level. Only horses ever trade. Breeding happens at the <b>🧬 Beast Lodge</b> (bigger hearths keep one beside the Stable). Bought horses count as tamed. Beasts only — party members and slaves retire at <b>🛏️ inns</b> (E at any inn counter), never in these pens.`;
      renderStable(building);
      $("stableModal").hidden = false;
    } catch (e) {}
  }
  function openBeastLodge(building) {
    try {
      const G = window.Game.G, p = G && G.player;
      if (!p) return;
      try { window.Entities.ensureProgression(p); } catch (e) {}
      stableBuilding = building || null;
      stableSelId = null; breedSelA = null; breedSelB = null;
      stableMoveId = null;
      stableTab = "breed";
      const title = $("stableTitle");
      if (title) {
        const bt = (building && building.title) || "Beast Lodge";
        title.textContent = (bt === "Beast Lodge" || bt === "Bestiary") ? `🧬 Beast Lodge` : `🧬 ${bt} (beast lodge)`;
      }
      const desc = $("stableDesc");
      if (desc) desc.innerHTML = `Hand two same-kin beasts (steeds: any horse × any horse, hounds, shellbacks, coils, skyborn, swarms — else same kind) to <b>this beast lodge</b> for a few real minutes — parents wait here and can't fight, ride, or stable meanwhile. Return <b>here</b> to collect both parents + one newborn (random mix of their stats/attacks, sometimes mutated — always counts as tamed). Several pairs can breed at once. The <b>🏹 Tack</b> tab sells low-tier whips + bows. Storage + horse trading live at the <b>🐴 Stable</b>, and <b>📖 Bestiary</b> catalogues every beast you've met.`;
      renderStable(building);
      $("stableModal").hidden = false;
    } catch (e) {}
  }
 function closeStable() { try { $("stableModal").hidden = true; } catch (e) {} try { if (breedTimer) { clearTimeout(breedTimer); breedTimer = null; } } catch (e) {} }
 // ---------- lorebooks (read-in-place, never picked up) ----------
  // ---------- inn (retire party + slaves, retrieve from any inn) ----------
  let innBuilding = null;
  // inn selection + room-swap carry (mirrors stableSelId/stableMoveId).
  let innSelId = null, innMoveId = null;
  function openInn(building) {
    try {
      const G = window.Game.G, p = G && G.player;
      if (!p) return;
      try { window.Entities.ensureProgression(p); } catch (e) {}
      innBuilding = building || null;
      innSelId = null; innMoveId = null;
      const title = $("innTitle");
      if (title) {
        const bt = (building && building.title) || "Inn";
        title.textContent = (bt === "Inn") ? "🛏️ Inn" : `🛏️ ${bt} (inn)`;
      }
      renderInn(building);
      $("innModal").hidden = false;
    } catch (e) {}
  }
  function closeInn() { try { $("innModal").hidden = true; } catch (e) {} }
  // ---------- guildhall (noticeboard + counter + commissions) ----------
  let guildBuilding = null, guildTab = "board";
  function openGuild(building) {
    try {
      const G = window.Game.G, p = G && G.player;
      if (!p) return;
      try { window.Entities.ensureProgression(p); } catch (e) {}
      try { if (window.Guild) window.Guild.ensure(p); } catch (e) {}
      guildBuilding = building || null;
      if (!guildTab) guildTab = "board";
      const title = $("guildTitle");
      if (title) {
        const bt = (building && building.title) || "Guildhall";
        title.textContent = (bt === "Guildhall") ? "Guildhall" : `${bt} (guildhall)`;
      }
      renderGuild();
      $("guildModal").hidden = false;
    } catch (e) {}
  }
  function closeGuild() { try { $("guildModal").hidden = true; } catch (e) {} }
  function guildItemName(id) { try { const it = window.Items.ITEMS[id]; if (it) return it.name; } catch (e) {} return id; }
  function guildMobLabel(kind) {
    try {
      if (window.Quests && window.Quests.MOB_LABEL && window.Quests.MOB_LABEL[kind]) return window.Quests.MOB_LABEL[kind];
      const t = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      if (t && t.name) return t.name + "s";
    } catch (e) {}
    return kind + "s";
  }
  function renderGuild() {
    const G = window.Game && window.Game.G;
    const p = G && G.player;
    if (!p) return;
    if (!window.Guild) return;
    try { window.Guild.ensure(p); } catch (e) {}
    const b = guildBuilding;
    const rankLine = $("guildRankLine"), tabs = $("guildTabs");
    const boardW = $("guildBoardWrap"), counterW = $("guildCounterWrap");
    const commW = $("guildCommWrap"), postW = $("guildPostWrap");
    const board = $("guildBoard"), boardMeta = $("guildBoardMeta");
    const cTop = $("guildCounterTop"), cList = $("guildCounterList"), hist = $("guildHistory");
    if (!board || !cList) return;
    try {
      const prog = window.Guild.rankProgress(p);
      const rec = prog.rec;
      const nx = prog.next;
      const mult = rec.mult || 1;
      let ladder = "";
      try {
        ladder = window.Guild.RANKS.map((r, i) => `${r.name} ${window.Guild.RANK_NEED[i]}`).join(" → ");
      } catch (e2) { ladder = "Rusty 0 → Iron 5 → Steel 10 → Mythril 30 → Dragonbone 100 → Oblivion 200 → Dawnstone 300"; }
      if (nx) {
        const nxRec = window.Guild.rankRec(nx.rank);
        rankLine.innerHTML = "";
        const main = document.createElement("div");
        main.textContent = `Adventurer rank: ${rec.name} · ${prog.done} contracts done · ${nx.need - prog.done} quest${nx.need - prog.done === 1 ? "" : "s"} till ${nxRec.name} (${nx.need} total) · payouts x${mult}`;
        const sub = document.createElement("div");
        sub.style.cssText = "font-weight:400;font-size:11px;opacity:0.85;margin-top:2px";
        sub.textContent = `Rank ladder: ${ladder}`;
        rankLine.appendChild(main);
        rankLine.appendChild(sub);
      } else {
        rankLine.innerHTML = "";
        const main = document.createElement("div");
        main.textContent = `Adventurer rank: ${rec.name} · ${prog.done} contracts done · highest rank · payouts x${mult}`;
        const sub = document.createElement("div");
        sub.style.cssText = "font-weight:400;font-size:11px;opacity:0.85;margin-top:2px";
        sub.textContent = `Rank ladder: ${ladder}`;
        rankLine.appendChild(main);
        rankLine.appendChild(sub);
      }
      rankLine.title = rec.blurb || "";
    } catch (e) { try { rankLine.textContent = ""; } catch (e2) {} }
    try {
      tabs.innerHTML = "";
      const mk = (id, label) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        if (guildTab === id) btn.className = "active";
        btn.onclick = () => { guildTab = id; renderGuild(); };
        tabs.appendChild(btn);
      };
      const actN = (() => { try { return window.Guild.active(p).length; } catch (e) { return 0; } })();
      const readyN = (() => { try { return window.Guild.active(p).filter(q => window.Guild.isReady(p, q)).length; } catch (e) { return 0; } })();
      const openN = (() => { try { return window.Guild.openCommissions(p).length; } catch (e) { return 0; } })();
      mk("board", "Noticeboard");
      mk("counter", `Counter${actN ? ` (${actN})` : ""}${readyN ? ` — ${readyN} ready!` : ""}`);
      mk("comm", `Commissions${openN ? ` (${openN})` : ""}`);
      mk("post", "New commission");
    } catch (e) {}
    try {
      boardW.hidden = guildTab !== "board"; counterW.hidden = guildTab !== "counter";
      if (commW) commW.hidden = guildTab !== "comm";
      if (postW) postW.hidden = guildTab !== "post";
    } catch (e) {}
    if (guildTab === "board") renderGuildBoard(p, b, board, boardMeta);
    else if (guildTab === "counter") renderGuildCounter(p, b, cTop, cList, hist);
    else if (guildTab === "comm") renderGuildComm(p);
    else if (guildTab === "post") renderGuildPost(p);
    // keep the quest log's Guild tab live while it is open (Counter/Noticeboard change it)
    try { if ($("questModal") && !$("questModal").hidden) renderQuests(); } catch (e) { }
  }
  function renderGuildBoard(p, b, board, boardMeta) {
    board.innerHTML = "";
    if (boardMeta) {
      try {
        const ms = window.Guild.msToRotate();
        const mm = Math.floor(ms / 60000), ss = Math.floor((ms % 60000) / 1000);
        boardMeta.textContent = `Culls point at real hunting grounds (kills only count near the grounds). Each pin goes to ONE hand — taken pins vanish. Fresh pins in ${mm}m ${ss}s.`;
      } catch (e) { boardMeta.textContent = ""; }
    }
    let offers = [];
    try { offers = window.Guild.boardOffers(p, b || { id: "guild_default", title: "Guildhall" }) || []; } catch (e) { offers = []; }
    if (!offers.length) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "The board is bare for your rank — turn in contracts to rise, or check back after the next rotation.";
      board.appendChild(d);
      return;
    }
    const active = (() => { try { return window.Guild.active(p); } catch (e) { return []; } })();
    const full = active.length >= window.Guild.MAX_ACTIVE;
    for (const o of offers) {
      const card = document.createElement("div");
      card.className = "gparch";
      const pin = document.createElement("div");
      pin.className = "gpin";
      card.appendChild(pin);
      const h = document.createElement("h4");
      const icon = "";
      h.textContent = `${o.title}`;
      card.appendChild(h);
      const tp = document.createElement("div");
      tp.className = "gsub";
      if (o.kind === "kill") {
        const t = o.target || {};
        tp.textContent = t.biome ? `Slay ${o.need} near the ${window.Guild.biomeLabel(t.biome)} (~${t.dist || "?"}t)` : `Slay ${o.need} in the wilds`;
      } else if (o.kind === "clear") {
        const t = o.target || {};
        tp.textContent = `Clear ${o.need}× ${guildMobLabel(o.mobKind)} at ${(t.houseTitle || "house")}`;
      } else tp.textContent = `Deliver ${o.need}x goods`;
      card.appendChild(tp);
      const ds = document.createElement("div");
      ds.textContent = o.desc || "";
      card.appendChild(ds);
      if (o.kind === "fetch") {
        const have = (() => { try { return window.Items.countItem(p, o.itemId) | 0; } catch (e) { return 0; } })();
        const pr = document.createElement("div");
        pr.className = "gsub";
        pr.textContent = `In pack now: ${Math.min(have, o.need)}/${o.need} ${guildItemName(o.itemId)}`;
        card.appendChild(pr);
        if (o.srcHint) {
          const hr = document.createElement("div");
          hr.className = "gsub";
          hr.textContent = o.srcHint;
          card.appendChild(hr);
        }
      }
      if (o.kind === "kill" || o.kind === "clear") {
        const pr = document.createElement("div");
        pr.className = "gsub";
        try {
          const t = o.target || {};
          if (t && isFinite(t.gx)) {
            const d = Math.round(Math.hypot(t.gx - p.x, t.gy - p.y));
            pr.textContent = o.kind === "clear" ? `${(t.houseTitle || "house")} — ~${d} tiles from you` : `Hunting ground ~${d} tiles — kills count within ~${t.r || 70} tiles`;
          }
        } catch (e) {}
        if (pr.textContent) card.appendChild(pr);
      }
      const rw = document.createElement("div");
      rw.className = "grew";
      try {
        const r = window.Guild.rewardFor(p, o.need, o.kind === "fetch" ? "fetch" : "kill", o);
        rw.textContent = `${r.gold}g · +${r.xp} XP${(o.minRank | 0) > 0 ? ` · rank ${window.Guild.rankRec(o.minRank).name}+` : ""}`;
      } catch (e) { rw.textContent = ""; }
      rw.title = "Payouts rise with adventurer rank";
      card.appendChild(rw);
      const btn = document.createElement("button");
      const dup = (() => { try { return active.some(q => q && q.kind === o.kind && (q.itemId === o.itemId || q.mobKind === o.mobKind)); } catch (e) { return false; } })();
      btn.textContent = full ? `Satchel full (${window.Guild.MAX_ACTIVE})` : (dup ? "Already carried" : "Take posting");
      btn.disabled = full || dup;
      btn.onclick = ((uid) => () => {
        let r = null;
        try { r = window.Guild.acceptOffer(p, b || { id: "guild_default", title: "Guildhall" }, uid); } catch (e) { r = { ok: false, msg: "Couldn't take it." }; }
        if (r && r.ok) { toast(`Contract taken: ${r.quest.title} — see the Counter.`, 4000); try { window.Sfx.talk(); } catch (e) {} }
        else toast(((r && r.msg) || "Couldn't take it."), 3000);
        renderGuild();
        try { updateHUD(); } catch (e) {}
      })(o.uid);
      card.appendChild(btn);
      board.appendChild(card);
    }
  }
  function renderGuildCounter(p, b, cTop, cList, hist) {
    cList.innerHTML = ""; hist.innerHTML = "";
    const g = (() => { try { return window.Guild.ensure(p); } catch (e) { return null; } })();
    const act = (() => { try { return window.Guild.active(p) || []; } catch (e) { return []; } })();
    try {
      cTop.innerHTML = `Turn in completed contracts at <b>any</b> guild Counter — goods change hands here. ` +
        `Active: <b>${act.length}/${window.Guild.MAX_ACTIVE}</b> · 🪙 <b>${(p.gold | 0)}g</b>` +
        `<div style="font-weight:400;font-size:12px;opacity:0.9;margin-top:3px">Culls only credit near their hunting grounds / houses — follow the 🧭 line on each contract.</div>`;
    } catch (e) {}
    if (!act.length) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "No contracts carried — pin one from the 📌 Noticeboard (or take a 📜 Commission) first.";
      cList.appendChild(d);
    }
    for (const q of act) {
      const ready = (() => { try { return window.Guild.isReady(p, q); } catch (e) { return false; } })();
      const row = document.createElement("div");
      row.className = "grow" + (ready ? " ready" : "");
      const t = document.createElement("div");
      t.style.fontWeight = "900";
      const icon = q.kind === "kill" ? "⚔️" : q.kind === "clear" ? "🏠" : "📦";
      t.textContent = `${icon} ${q.title}${q.commissionId ? " (commissioned)" : ""}${ready ? " — ✅ ready to turn in!" : ""}`;
      row.appendChild(t);
      if (q.commissionId) {
        const cm = document.createElement("div");
        cm.style.fontSize = "11px"; cm.style.opacity = "0.85";
        try {
          const c = window.Guild.findCommission(p, q.commissionId);
          cm.textContent = c ? `Commission by ${c.commissioner} · reward ${c.reward.gold}g · first finisher wins` : "Commission — first finisher wins";
        } catch (e) {}
        row.appendChild(cm);
      }
      const pr = document.createElement("div");
      pr.style.fontSize = "12px"; pr.style.opacity = "0.9";
      try { pr.textContent = window.Guild.progressText(p, q); } catch (e) { pr.textContent = ""; }
      row.appendChild(pr);
      const bar = document.createElement("div");
      bar.className = "gbar" + (ready ? " done" : "");
      const fill = document.createElement("div");
      try {
        const pct = q.kind === "fetch"
          ? Math.min(100, Math.round(100 * (window.Items.countItem(p, q.itemId) | 0) / (q.need || 1)))
          : Math.min(100, Math.round(100 * (q.have | 0) / (q.need || 1)));
        fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
      } catch (e) { fill.style.width = "0%"; }
      bar.appendChild(fill);
      row.appendChild(bar);
      const rw = document.createElement("div");
      rw.style.fontSize = "12px"; rw.style.marginTop = "3px";
      rw.textContent = `🎁 ${q.reward.gold}g · +${q.reward.xp} XP`;
      row.appendChild(rw);
      if (q.kind === "fetch" && q.srcHint) {
        const hr = document.createElement("div");
        hr.style.fontSize = "12px"; hr.style.opacity = "0.85";
        hr.textContent = q.srcHint;
        row.appendChild(hr);
      }
      const btns = document.createElement("div");
      btns.style.marginTop = "6px"; btns.style.display = "flex"; btns.style.gap = "6px";
      const tb = document.createElement("button");
      tb.textContent = ready ? `🛎️ Turn in` : "Not yet";
      tb.disabled = !ready;
      tb.title = ready ? "Hand it over at this counter" : "Finish the work first";
      tb.onclick = ((gid) => () => {
        let r = null;
        try { r = window.Guild.turnIn(p, gid); } catch (e) { r = { ok: false, msg: "Turn-in failed." }; }
        if (!(r && r.ok)) toast("⚠️ " + ((r && r.msg) || "Couldn't turn in."), 3500);
        renderGuild();
        try { updateHUD(); updateHotbar(); } catch (e) {}
      })(q.gid);
      btns.appendChild(tb);
      const ab = document.createElement("button");
      ab.textContent = "Abandon";
      ab.className = "ghost";
      ab.onclick = ((gid, ttl) => () => {
        if (!confirm(`Abandon "${ttl}"?`)) return;
        try { window.Guild.abandon(p, gid); } catch (e) {}
        toast(`📜 Contract abandoned: ${ttl}`, 2500);
        renderGuild();
      })(q.gid, q.title);
      btns.appendChild(ab);
      row.appendChild(btns);
      cList.appendChild(row);
    }
    try {
      const h = g && g.history ? g.history.slice(0, 8) : [];
      if (h.length) {
        const hh = document.createElement("div");
        hh.className = "tsec";
        hh.textContent = `📜 Recent turn-ins`;
        hist.appendChild(hh);
        for (const r of h) {
          const d = document.createElement("div");
          d.style.fontSize = "12px"; d.style.opacity = "0.8";
          d.textContent = `• ${r.title} — +${r.gold}g`;
          hist.appendChild(d);
        }
      }
    } catch (e) {}
  }
  function renderGuildComm(p) {
    const top = $("guildCommTop"), list = $("guildCommList");
    if (!top || !list) return;
    list.innerHTML = "";
    let open = [], done = [];
    try { open = window.Guild.openCommissions(p) || []; done = window.Guild.doneCommissions(p).slice(0, 12) || []; } catch (e) {}
    try {
      top.innerHTML = `Player-posted work — <b>${open.length} open</b> · 🪙 <b>${(p.gold | 0)}g</b>` +
        `<div style="font-weight:400;font-size:12px;opacity:0.9;margin-top:3px">Never rotates away. Adventurer NPCs, fellow travelers and you can all work the same commission — <b>first turn-in wins</b>. Commissioners collect goods/confirmation here after a win.</div>`;
    } catch (e) {}
    if (!open.length && !done.length) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "No commissioned work yet — post some from ➕ Commission.";
      list.appendChild(d);
      return;
    }
    const act = (() => { try { return window.Guild.active(p); } catch (e) { return []; } })();
    for (const c of open) {
      const row = document.createElement("div");
      row.className = "grow";
      const t = document.createElement("div");
      t.style.fontWeight = "900";
      t.textContent = `${c.kind === "kill" ? "⚔️" : "📦"} ${c.title} — ${c.reward.gold}g`;
      row.appendChild(t);
      const sub = document.createElement("div");
      sub.style.fontSize = "12px"; sub.style.opacity = "0.9";
      try {
        let where = "";
        if (c.kind === "kill" && c.target) {
          const d = Math.round(Math.hypot(c.target.gx - p.x, c.target.gy - p.y));
          where = ` · 🧭 ${window.Guild.biomeLabel(c.target.biome)} ~${d}t`;
        }
        const claims = (c.accepts || []).length;
        let npcN = 0;
        try { const G = window.Game && window.Game.G; for (const n of (G.npcs || [])) if (n && n.guildComm && n.guildComm.cid === c.cid) npcN++; } catch (e) {}
        sub.textContent = `by ${c.commissioner} · ${c.kind === "kill" ? `${c.mobKind} lv~${c.mobLv} ×${c.need}` : `${c.need}× ${guildItemName(c.itemId)}`}${where} · hands on it: ${claims + npcN}${npcN ? ` (${npcN} adventurer${npcN > 1 ? "s" : ""})` : ""}`;
      } catch (e) {}
      row.appendChild(sub);
      const ds = document.createElement("div");
      ds.style.fontSize = "12px"; ds.style.opacity = "0.85";
      try { ds.textContent = window.Guild.commissionDesc(c); } catch (e) {}
      row.appendChild(ds);
      const btns = document.createElement("div");
      btns.style.marginTop = "6px"; btns.style.display = "flex"; btns.style.gap = "6px"; btns.style.flexWrap = "wrap";
      const mine = act.some(q => q && q.commissionId === c.cid);
      const full = act.length >= window.Guild.MAX_ACTIVE;
      const ab = document.createElement("button");
      ab.textContent = mine ? "Carried ✓" : (full ? `Satchel full (${window.Guild.MAX_ACTIVE})` : "🤝 Take commission");
      ab.disabled = mine || full;
      ab.onclick = ((cid) => () => {
        let r = null;
        try { r = window.Guild.acceptCommission(p, cid); } catch (e) { r = { ok: false, msg: "Couldn't take it." }; }
        if (r && r.ok) toast(`🤝 Commission taken: ${r.quest.title}`, 4000);
        else toast("⚠️ " + ((r && r.msg) || "Couldn't take it."), 3500);
        renderGuild();
      })(c.cid);
      btns.appendChild(ab);
      row.appendChild(btns);
      list.appendChild(row);
    }
    for (const c of done) {
      const row = document.createElement("div");
      row.className = "grow" + (c.collected ? "" : " ready");
      const t = document.createElement("div");
      t.style.fontWeight = "900";
      t.textContent = `✅ ${c.title} — settled by ${c.doneBy || "?"}`;
      row.appendChild(t);
      const sub = document.createElement("div");
      sub.style.fontSize = "12px"; sub.style.opacity = "0.85";
      sub.textContent = c.kind === "fetch" && c.escrow ? `${c.escrow.n}× ${guildItemName(c.escrow.itemId)} waiting` : "extermination confirmed by the guild";
      row.appendChild(sub);
      const mine = (() => { try { return (c.commHash === ((window.MP && window.MP.M && window.MP.M.hash) || "local")) || (c.commissioner === (p.name || "Traveler")); } catch (e) { return false; } })();
      if (mine && !c.collected) {
        const btn = document.createElement("button");
        btn.textContent = c.kind === "fetch" ? "📦 Retrieve goods" : "🏛️ Collect confirmation";
        btn.onclick = ((cid) => () => {
          let r = null;
          try { r = window.Guild.collectCommission(p, cid); } catch (e) { r = { ok: false, msg: "Couldn't collect." }; }
          if (!(r && r.ok)) toast("⚠️ " + ((r && r.msg) || "Couldn't collect."), 3500);
          renderGuild();
          try { updateHUD(); updateHotbar(); } catch (e) {}
        })(c.cid);
        row.appendChild(btn);
      } else if (c.collected) {
        const s = document.createElement("div");
        s.style.fontSize = "11px"; s.style.opacity = "0.7";
        s.textContent = "collected";
        row.appendChild(s);
      }
      list.appendChild(row);
    }
  }
  let _postKind = "kill";
  function renderGuildPost(p) {
    const wrap = $("guildPostForm");
    if (!wrap) return;
    wrap.innerHTML = "";
    const box = document.createElement("div");
    box.className = "gform";
    const head = document.createElement("div");
    head.innerHTML = `<b>➕ Commission work</b> — you pay the bounty up front (20% guild fee). The first hand to turn it in wins the reward; fetch goods come back to you here.`;
    head.style.marginBottom = "6px";
    box.appendChild(head);
    const kindRow = document.createElement("div");
    kindRow.className = "frow";
    const kl = document.createElement("label"); kl.textContent = "Type";
    const ks = document.createElement("select");
    for (const [v, lbl] of [["kill", "⚔️ Kill beasts"], ["fetch", "📦 Fetch goods"]]) {
      const o = document.createElement("option"); o.value = v; o.textContent = lbl; if (_postKind === v) o.selected = true; ks.appendChild(o);
    }
    ks.onchange = () => { _postKind = ks.value; renderGuildPost(p); };
    kindRow.appendChild(kl); kindRow.appendChild(ks);
    box.appendChild(kindRow);
    const costEl = document.createElement("div");
    costEl.className = "gcost";
    const upd = () => {};
    if (_postKind === "kill") {
      let mobs = [];
      try { mobs = window.Guild.allMobIds(); } catch (e) { mobs = ["goblin"]; }
      const mr = document.createElement("div"); mr.className = "frow";
      const ml = document.createElement("label"); ml.textContent = "Beast";
      const ms = document.createElement("select");
      for (const k of mobs) { const o = document.createElement("option"); o.value = k; o.textContent = `${guildMobLabel(k)} (${k})`; ms.appendChild(o); }
      mr.appendChild(ml); mr.appendChild(ms); box.appendChild(mr);
      const lr = document.createElement("div"); lr.className = "frow";
      const ll = document.createElement("label"); ll.textContent = "Level 1–70";
      const li = document.createElement("input"); li.type = "number"; li.min = "1"; li.max = "70"; li.value = String(Math.max(1, Math.min(70, (p.lv | 0) || 1)));
      lr.appendChild(ll); lr.appendChild(li); box.appendChild(lr);
      const nr = document.createElement("div"); nr.className = "frow";
      const nl = document.createElement("label"); nl.textContent = "Count 1–20";
      const ni = document.createElement("input"); ni.type = "number"; ni.min = "1"; ni.max = "20"; ni.value = "3";
      nr.appendChild(nl); nr.appendChild(ni); box.appendChild(nr);
      const refresh = () => {
        try {
          const cost = window.Guild.commissionCostKill(ms.value, li.value | 0, ni.value | 0);
          const rw = Math.round(cost * 0.8);
          costEl.textContent = `Cost: ${cost}g (you carry ${(p.gold | 0)}g) · winner gets ${rw}g`;
        } catch (e) {}
      };
      ms.onchange = refresh; li.oninput = refresh; ni.oninput = refresh; refresh();
      const btn = document.createElement("button");
      btn.textContent = "📌 Post cull";
      btn.onclick = () => {
        let r = null;
        try { r = window.Guild.createCommission(p, { kind: "kill", mobKind: ms.value, mobLv: li.value | 0, need: ni.value | 0 }); } catch (e) { r = { ok: false, msg: "Couldn't post." }; }
        if (r && r.ok) { toast(`📌 Commission posted: ${r.comm.title} (${r.comm.cost}g).`, 5000); guildTab = "comm"; }
        else toast("⚠️ " + ((r && r.msg) || "Couldn't post."), 4000);
        renderGuild();
        try { updateHUD(); } catch (e) {}
      };
      box.appendChild(costEl);
      box.appendChild(btn);
    } else {
      let items = [];
      try { items = window.Guild.allItemIds(); } catch (e) { items = ["herb"]; }
      const ir = document.createElement("div"); ir.className = "frow";
      const il = document.createElement("label"); il.textContent = "Goods";
      const is = document.createElement("select");
      for (const id of items) { const o = document.createElement("option"); o.value = id; o.textContent = guildItemName(id); is.appendChild(o); }
      ir.appendChild(il); ir.appendChild(is); box.appendChild(ir);
      const nr = document.createElement("div"); nr.className = "frow";
      const nl = document.createElement("label"); nl.textContent = "Count 1–99";
      const ni = document.createElement("input"); ni.type = "number"; ni.min = "1"; ni.max = "99"; ni.value = "5";
      nr.appendChild(nl); nr.appendChild(ni); box.appendChild(nr);
      const refresh = () => {
        try {
          const cost = window.Guild.commissionCostFetch(is.value, ni.value | 0);
          const rw = Math.round(cost * 0.8);
          costEl.textContent = `Cost: ${cost}g (you carry ${(p.gold | 0)}g) · winner gets ${rw}g · goods return to you`;
        } catch (e) {}
      };
      is.onchange = refresh; ni.oninput = refresh; refresh();
      const btn = document.createElement("button");
      btn.textContent = "📌 Post fetch";
      btn.onclick = () => {
        let r = null;
        try { r = window.Guild.createCommission(p, { kind: "fetch", itemId: is.value, need: ni.value | 0 }); } catch (e) { r = { ok: false, msg: "Couldn't post." }; }
        if (r && r.ok) { toast(`📌 Commission posted: ${r.comm.title} (${r.comm.cost}g).`, 5000); guildTab = "comm"; }
        else toast("⚠️ " + ((r && r.msg) || "Couldn't post."), 4000);
        renderGuild();
        try { updateHUD(); } catch (e) {}
      };
      box.appendChild(costEl);
      box.appendChild(btn);
    }
    wrap.appendChild(box);
  }

  function renderInn(building) {
    const G = window.Game && window.Game.G;
    const p = G && G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) {}
    const list = $("innList");
    if (!list) return;
    list.innerHTML = "";
    try { if (building) innBuilding = building; } catch (e) {}
    let unlock = 0, fee = 0;
    try { unlock = window.Game.innUnlockEnsure(p); } catch (e) {}
    try { fee = window.Game.innRoomPrice(p); } catch (e) {}
    const members = partyNpcs(p);
    const max = mpPartyCap();
    let guests = [];
    try { guests = window.Game.innGuests(p) || []; } catch (e) {}
    const byId = {};
    try { for (const n of members) if (n && n.id) byId[n.id] = n; } catch (e) {}
    try { for (const n of guests) if (n && n.id && !byId[n.id]) byId[n.id] = n; } catch (e) {}
    // drop a stale room-swap carry (guest retrieved or parted ways)
    try { if (innMoveId && !byId[innMoveId]) innMoveId = null; } catch (e) { innMoveId = null; }
    let used = 0;
    try { for (const id of (p.innRooms || [])) if (id) used++; } catch (e) {}
    const head = document.createElement("div");
    head.className = "tsec";
    head.textContent = `🪙 ${(p.gold | 0)}g · Friends: ${members.length}/${max} · 🛏️ ${used}/${unlock} rooms taken — rooms are global: retire here, retrieve at ANY inn.`;
    list.appendChild(head);
    const sub = document.createElement("div");
    sub.className = "psec-sub";
    sub.textContent = "People rest at inns, beasts at stables — never the reverse. Slaves room here too (⛓️), never in stable pens. Guests mend while they rest, keep their levels, and never rot away.";
    list.appendChild(sub);
    if (members.length) {
      const elab = document.createElement("div");
      elab.className = "menu-eyebrow items";
      elab.textContent = "① With you — tap Retire to room one (items)";
      list.appendChild(elab);
      const h = document.createElement("div");
      h.className = "tsec";
      h.textContent = `🧑‍🤝‍🧑 With you (${members.length}) — Retire one into an open room`;
      list.appendChild(h);
      for (const n of members) {
        const row = document.createElement("div");
        row.className = "trow";
        const tn = document.createElement("span");
        tn.className = "tn";
        const slaveBit = (n.role === "slave" || n.slave || n.noLoyalty) ? " ⛓️" : "";
        tn.textContent = `${n.hp <= 0 ? "💀" : "🙂"} ${n.name} (lv ${n.lv} ${n.role || "friend"})${slaveBit} · HP ${Math.ceil(Math.max(0, n.hp))}/${n.maxHp}`;
        row.appendChild(tn);
        const b = document.createElement("button");
        b.textContent = "Retire 🛏️";
        b.className = "ghost";
        b.title = `Retire ${n.name} to an open inn room (buy one below if the house is full)`;
        b.onclick = ((id, nm) => () => {
          const r = window.Game.retireNpcToInn(id);
          if (r && r.ok) toast(`🛏️ ${String(nm).split(" ")[0]} retires to room ${r.room} — retrieve at any inn.`);
          else toast("⚠️ " + ((r && r.msg) || "Couldn't retire."));
          renderInn(building); updateHUD();
        })(n.id, n.name);
        row.appendChild(b);
        list.appendChild(row);
      }
    }
    const rh = document.createElement("div");
    rh.className = "menu-eyebrow items";
    rh.textContent = "② Rooms — tap a guest to inspect, Retrieve, swap beds, or part ways";
    list.appendChild(rh);
    const rh2 = document.createElement("div");
    rh2.className = "tsec";
    rh2.textContent = `🛏️ Rooms (${used}/${unlock} taken)${innMoveId && byId[innMoveId] ? ` · moving ${byId[innMoveId].name} — tap a bed (occupied = swap)` : ""}`;
    list.appendChild(rh2);
    const doInnSwap = (aIdx, bIdx) => {
      const r = window.Game.innSwapRooms(aIdx, bIdx);
      if (r && r.ok) {
        const movedId = innMoveId;
        innSelId = movedId; innMoveId = null;
        toast(r.same ? "Already in that room." : `🛏️ ${byId[movedId] ? String(byId[movedId].name).split(" ")[0] : "Guest"} → room ${r.room}.`);
      } else toast("⚠️ " + ((r && r.msg) || "Couldn't move."));
      renderInn(building); updateHUD();
    };
    const pickRoom = (ri) => {
      if (!innMoveId) { innSelId = null; renderInn(building); return; }
      const aIdx = (p.innRooms || []).indexOf(innMoveId);
      if (aIdx < 0) { innMoveId = null; renderInn(building); return; }
      doInnSwap(aIdx, ri);
    };
    const grid = document.createElement("div");
    grid.className = "sbox-grid";
    for (let i = 0; i < unlock; i++) {
      const id = (p.innRooms || [])[i];
      const n = (id && byId[id]) ? byId[id] : null;
      const c = document.createElement("button");
      if (n) {
        c.className = "sbox-cell full" + ((n.id === innSelId) ? " sel" : "");
        const e = document.createElement("div");
        e.className = "se";
        e.textContent = !(n.hp > 0) ? "💀" : "😴";
        const l = document.createElement("div");
        l.className = "sl";
        l.textContent = "lv" + n.lv;
        c.appendChild(e); c.appendChild(l);
        const slaveBit = (n.role === "slave" || n.slave || n.noLoyalty) ? " ⛓️" : "";
        c.title = `Room ${i + 1}: ${n.name} (lv ${n.lv} ${n.role || "friend"})${slaveBit} · HP ${Math.ceil(Math.max(0, n.hp))}/${n.maxHp}`;
        c.onclick = ((id2, ri) => () => {
          if (innMoveId && innMoveId !== id2) {
            const aIdx = (p.innRooms || []).indexOf(innMoveId);
            if (aIdx < 0) { innMoveId = null; renderInn(building); return; }
            doInnSwap(aIdx, ri);
            return;
          }
          innSelId = (innSelId === id2) ? null : id2; renderInn(building);
        })(n.id, i);
      } else if (id) {
        c.className = "sbox-cell locked";
        c.innerHTML = "<div class='se dim'>❓</div>";
        c.title = `Room ${i + 1}: a guest is still traveling here… (re-open the inn to meet them)`;
        c.onclick = ((ri) => () => {
          if (innMoveId) { pickRoom(ri); return; }
          toast("A guest is still traveling here… (re-open the inn to meet them)");
        })(i);
      } else {
        c.className = "sbox-cell empty";
        c.innerHTML = "<div class='se dim'>·</div>";
        c.title = `Room ${i + 1}: open bed`;
        c.onclick = ((ri) => () => { pickRoom(ri); })(i);
      }
      grid.appendChild(c);
    }
    const wrap = document.createElement("div");
    wrap.className = "sbox-wrap";
    wrap.appendChild(grid);
    const side = document.createElement("div");
    side.className = "sbox-side";
    const sel = (innSelId && byId[innSelId]) ? byId[innSelId] : null;
    if (sel) {
      const det = document.createElement("div");
      det.className = "sbox-detail";
      const dlab = document.createElement("div");
      dlab.className = "menu-eyebrow items";
      dlab.textContent = "Selected guest — details + buttons";
      det.appendChild(dlab);
      try {
        const pc = window.Sprites.drawPortrait(sel, 120);
        pc.className = "sbox-portrait";
        det.appendChild(pc);
      } catch (e) {}
      const slaveBit = (sel.role === "slave" || sel.slave || sel.noLoyalty) ? " ⛓️" : "";
      const nm = document.createElement("div");
      nm.className = "pt-nm";
      nm.textContent = `${sel.hp <= 0 ? "💀" : "😴"} ${sel.name} — lv ${sel.lv} ${sel.role || "friend"}${slaveBit}`;
      const sub = document.createElement("div");
      sub.className = "pt-lv";
      sub.textContent = `HP ${Math.ceil(Math.max(0, sel.hp))}/${sel.maxHp}`;
      det.appendChild(nm); det.appendChild(sub);
      const row = document.createElement("div");
      row.className = "sbox-btns";
      const mk = (label, fn, ghost, title) => {
        const b = document.createElement("button");
        b.textContent = label;
        if (ghost) b.className = "ghost";
        if (title) b.title = title;
        b.onclick = fn;
        row.appendChild(b);
      };
      mk("Retrieve", ((id2, nm2) => () => {
        const r = window.Game.retrieveNpcFromInn(id2);
        toast(r.ok ? `⚔️ ${String(nm2).split(" ")[0]} rejoins you!` : ("⚠️ " + (r.msg || "Party full.")));
        innSelId = null; renderInn(building); updateHUD();
      })(sel.id, sel.name), false, "Bring them back into your party (needs a free friend slot)");
      mk("Part ways", ((id2, nm2) => () => {
        if (!confirm(`${nm2} will leave the room and stay in the world. The room stays bought. Continue?`)) return;
        window.Game.dismissInnGuest(id2);
        toast(`👋 ${String(nm2).split(" ")[0]} parts ways.`);
        innSelId = null; renderInn(building); updateHUD();
      })(sel.id, sel.name), true, "They leave the room and stay in the world (like saying goodbye)");
      if (innMoveId === sel.id) mk("Cancel move", () => { innMoveId = null; renderInn(building); }, true, "Stop moving this guest");
      else mk("⇄ Move…", () => { innMoveId = sel.id; innSelId = null; renderInn(building); }, true, "Reorder: pick this guest up, then tap any bed (occupied = swap)");
      det.appendChild(row);
      side.appendChild(det);
    } else if (innMoveId && byId[innMoveId]) {
      const mv = byId[innMoveId];
      const det = document.createElement("div");
      det.className = "sbox-detail";
      const nm = document.createElement("div");
      nm.className = "pt-nm";
      nm.textContent = `🛏️ Moving ${mv.name} — tap any bed (occupied = swap).`;
      det.appendChild(nm);
      const row = document.createElement("div");
      row.className = "sbox-btns";
      const cb = document.createElement("button");
      cb.textContent = "Cancel";
      cb.className = "ghost";
      cb.onclick = () => { innMoveId = null; renderInn(building); };
      row.appendChild(cb);
      det.appendChild(row);
      side.appendChild(det);
    } else {
      const none = document.createElement("div");
      none.className = "sbox-none";
      none.textContent = used ? "Select a guest to inspect, retrieve, or swap beds." : "Empty beds — retire a party member to fill them.";
      side.appendChild(none);
    }
    wrap.appendChild(side);
    list.appendChild(wrap);
    const brow = document.createElement("div");
    brow.className = "trow";
    const btm = document.createElement("span");
    btm.className = "tn";
    btm.textContent = `Need more beds? Room ${unlock + 1} costs ${fee}g.`;
    brow.appendChild(btm);
    const bb = document.createElement("button");
    bb.textContent = `🔓 Buy room ${unlock + 1} (${fee}g)`;
    bb.title = `Buy room ${unlock + 1} for ${fee}g (rooms only get dearer)`;
    bb.onclick = () => {
      const r = window.Game.innBuyRoom(p);
      toast(r.ok ? `🔓 Room ${r.room} is yours — retire someone into it.` : ("⚠️ " + (r.msg || "Couldn't buy.")));
      renderInn(building); updateHUD();
    };
    brow.appendChild(bb);
    list.appendChild(brow);
    if (!members.length && !used) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "Empty beds. Recruit villagers into your party (E to talk, earn 💛, Recruit) — then retire them here to keep them safe while you roam.";
      list.appendChild(d);
    }
  }
  function loreRoman(n) {
    const t = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    return t[(n | 0) - 1] || String(n);
  }
  function openLore(bookId) {
    try {
      if (!window.Lorebooks) return;
      const rec = window.Lorebooks.get(bookId);
      if (!rec) { toast("📖 The pages crumble to illegible dust."); return; }
      const G = window.Game && window.Game.G, p = G && G.player;
      let isNew = false;
      try { if (p) isNew = window.Lorebooks.markRead(p, rec.id); } catch (e) { }
      const F = window.Lorebooks.FAITHS[rec.faith] || { name: rec.faith, icon: "📖", color: "#fff", blurb: "" };
      $("loreKicker").textContent = `${F.name} · ${rec.subject} · Vol. ${loreRoman(rec.vol)} of ${loreRoman(rec.nVols)}`;
      $("loreKicker").title = F.blurb || "";
      $("loreTitle").textContent = `📖 ${rec.title}`;
      const vv = $("loreVols"); vv.innerHTML = "";
      try {
        const mine = p ? window.Lorebooks.readSet(p) : {};
        for (let i = 1; i <= rec.nVols; i++) {
          const d = document.createElement("span");
          const id = rec.sid + ":v" + i;
          const has = !!mine[id];
          d.className = "lv" + (i === rec.vol ? " cur" : "") + (has ? "" : " miss");
          d.textContent = (has ? "● " : "○ ") + "Vol. " + loreRoman(i);
          d.title = has ? "Read — click to re-read" : "Not found yet — check libraries, homes, churches and delves";
          if (has && id !== rec.id) d.onclick = () => openLore(id);
          vv.appendChild(d);
        }
      } catch (e) { }
      $("loreBody").textContent = rec.text;
      // known fragments: re-readable, grouped by saga
      try {
        const known = $("loreKnown"); known.innerHTML = "";
        const mine = p ? window.Lorebooks.readSet(p) : {};
        const byS = {};
        for (const k in mine) {
          if (!mine[k]) continue;
          const r = window.Lorebooks.get(k);
          if (!r) continue;
          (byS[r.sid] = byS[r.sid] || []).push(r);
        }
        const sids = Object.keys(byS).sort((a, b) => {
          const ta = (byS[a][0] && byS[a][0].title) || a, tb = (byS[b][0] && byS[b][0].title) || b;
          return ta < tb ? -1 : 1;
        });
        if (sids.length) {
          const h = document.createElement("div");
          h.className = "psec-sub"; h.textContent = `🧩 Known fragments (${Object.keys(mine).filter(k => mine[k]).length}) — the tale so far:`;
          known.appendChild(h);
          for (const sid of sids.slice(0, 60)) {
            const rows = byS[sid].sort((a, b) => a.vol - b.vol);
            const line = document.createElement("div");
            const lab = document.createElement("span");
            lab.textContent = `${rows[0].title}: `;
            lab.style.opacity = "0.8";
            line.appendChild(lab);
            for (const r of rows) {
              const b = document.createElement("button");
              b.textContent = loreRoman(r.vol);
              b.title = r.id === rec.id ? "Reading now" : "Re-read";
              b.disabled = r.id === rec.id;
              b.onclick = () => openLore(r.id);
              line.appendChild(b);
            }
            known.appendChild(line);
          }
        }
      } catch (e) { }
      try {
        const pr = window.Lorebooks.progress(p);
        $("loreProg").textContent = `📚 Fragments read: ${pr.read}/${pr.total} — volumes scatter across libraries, homes, churches and dungeon deeps. Faiths quarrel; events agree. Piece it together.`;
      } catch (e) { }
      $("loreModal").hidden = false;
      try { window.Sfx.talk(); } catch (e) { }
      if (isNew) {
        try {
          const pr = window.Lorebooks.progress(p);
          toast(`📖 New fragment (${pr.read}/${pr.total}) — ${rec.title}, vol. ${loreRoman(rec.vol)}.`, 4000);
        } catch (e) { }
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) { }
      }
      try { updateHUD(); } catch (e) { }
    } catch (e) { }
  }
  function closeLore() { try { $("loreModal").hidden = true; } catch (e) {} }
  // selected beast in the box grid (tame id). Reset whenever the lodge opens.
  let stableSelId = null;
  // stable reorder carry: beast id picked up by ⇄ Move — tap a pen to drop
  // (occupied = swap). Survives box flips (< >), cleared on tab/open.
  let stableMoveId = null;
  // stable modal tab: "boxes" (paid pen grids), "market" (buy/sell horses),
  // "breed" (beast-lodge pairings — timed hand-over, same modal) or
  // "bestiary" (monster compendium — every kind the hero has met or slain).
  // Breed + archive tabs only exist at a beast lodge: stables store and
  // trade horses, nothing more. stableBuilding remembers the lodge whose
  // nexus opened the modal, so the breed tab's deposit/collect keys stay
  // pinned to the right lodge.
  let stableBuilding = null;
  let breedSelA = null, breedSelB = null;
  let stableTab = "boxes";
  // ---------- stable boxes: the lodge's paid 6x6 grids ----------
  // One box per page (BOX 1, BOX 2, ...), 36 pens each — every pen cell and
  // every new box is bought with gold (game.js stableBuySlot/stableBuyBox).
  // Stabled beasts live in cells; the With-you roster above the grid stores
  // into the open box. Flags stay authoritative (game.js stableBoxSync heals
  // every drift before each render).
  function renderStable(building) {
    const p = window.Game.G.player;
    if (!p) return;
    try { window.Entities.ensureProgression(p); } catch (e) {}
    try { if (window.Game.stableBoxSync) window.Game.stableBoxSync(p); } catch (e) {}
    const list = $("stableList");
    if (!list) return;
    list.innerHTML = "";
    try { if (building) stableBuilding = building; } catch (e) {}
    building = building || stableBuilding || null;
    const byId = {};
    try { for (const t of (p.tames || [])) if (t && t.id) byId[t.id] = t; } catch (e) {}
    // drop a stale reorder carry (carried beast retrieved, ridden, released…)
    try { if (stableMoveId && !(byId[stableMoveId] && byId[stableMoveId].stabled)) stableMoveId = null; } catch (e) { stableMoveId = null; }
    const geom = (() => { try { return window.Game.stableBoxGeom ? window.Game.stableBoxGeom() : { w: 9, h: 9, slots: 81 }; } catch (e) { return { w: 9, h: 9, slots: 81 }; } })();
    const boxes = (p.stableBoxes && p.stableBoxes.length) ? p.stableBoxes : [[]];
    if (!(p.stableBox >= 0) || p.stableBox >= boxes.length) p.stableBox = 0;
    const bi = p.stableBox | 0;
    const box = boxes[bi] || [];
    const counts = (() => { try { return window.Game.partyAndTameCount(); } catch (e) { return { npc: 0, tames: 0, total: 0, max: 4, mountMax: 5 }; } })();
    let used = 0;
    try { for (const b of boxes) for (const id of (b || [])) if (id && byId[id] && byId[id].stabled) used++; } catch (e) {}
    const head = document.createElement("div");
    head.className = "psec-sub";
    // ---- split duties: Stables store + trade (Boxes + Horse Market);
    // Beast Lodges breed + archive (Breed + Bestiary) and never sell ----
    const isLodge = (() => {
      try {
        const b = building || null;
        if (!b) return false;
        if (window.Buildings && window.Buildings.isBeastLodgeKey) return window.Buildings.isBeastLodgeKey(b.classKey);
        return b.classKey === "beast_lodge" || b.classKey === "bestiary";
      } catch (e) { return false; }
    })();
    if (isLodge) head.textContent = `🪙 ${(p.gold | 0)}g · beasts with you: ${counts.tames}/${counts.mountMax || 5} · breeding pairs lodge here (storage + horse trade live at the 🐴 Stable)`;
    else head.textContent = `🪙 ${(p.gold | 0)}g · Friends: ${counts.npc}/${counts.max} · beasts with you: ${counts.tames}/${counts.mountMax || 5} · ${used} resting in ${boxes.length} box${boxes.length === 1 ? "" : "es"} · they keep their levels.`;
    list.appendChild(head);
    if (isLodge && (stableTab === "boxes" || stableTab === "market")) stableTab = "breed";
    if (!isLodge && (stableTab === "breed" || stableTab === "bestiary" || stableTab === "tack")) stableTab = "boxes";
    const tlab = document.createElement("div");
    tlab.className = "menu-eyebrow tabs";
    tlab.textContent = isLodge ? "Tabs — breed pairs, browse the archive, or buy hunt gear (pick one)" : "Tabs — boxes (store) or horse market (pick one)";
    list.appendChild(tlab);
    const tabs = document.createElement("div");
    tabs.className = "sbox-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", isLodge ? "Beast lodge tabs" : "Stable tabs");
    const tabBtn = (id, label, title) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.title = (title || "") + " — tab (only one section shows)";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", stableTab === id ? "true" : "false");
      if (stableTab === id) b.className = "active";
      else b.className = "ghost";
      b.onclick = () => { stableTab = id; stableSelId = null; stableMoveId = null; renderStable(building); };
      tabs.appendChild(b);
    };
    if (isLodge) {
      tabBtn("breed", "🧬 Breed", "Hand two same-kin beasts to this beast lodge for a few minutes — return to collect parents + offspring");
      tabBtn("bestiary", "📖 Bestiary", "Every beast you've met — stats, abilities, slain counts");
      tabBtn("tack", "🏹 Tack", "Low-tier whips + bows for the hunt (unlimited, 0.9x)");
    } else {
      tabBtn("boxes", "📦 Boxes", "Your paid pen grids — unlock cells, raise boxes");
      tabBtn("market", "🐴 Horse Market", "Buy stable-bred horses, sell your horses");
    }
    list.appendChild(tabs);
    if (!isLodge && stableTab === "market") { renderStableMarket(list, p, building); return; }
    if (stableTab === "breed") { renderBreedTab(list, p, building); return; }
    if (stableTab === "bestiary") { renderBestiaryTab(list, p, building); return; }
    if (stableTab === "tack") { renderLodgeTrade(list, p, building); return; }
    // ---- with-you roster (Store files one into the open box) ----
    const active = (p.tames || []).filter(t => t && !t.stabled);
    if (active.length) {
      const h = document.createElement("div");
      h.className = "tsec";
      h.textContent = `💛 With you (${active.length}) — Store files one into BOX ${bi + 1}`;
      list.appendChild(h);
      for (const t of active) {
        const row = document.createElement("div");
        row.className = "trow";
        const tn = document.createElement("span");
        tn.className = "tn";
        const mountable = (() => { try { return window.Entities.isMountKind(t.kind); } catch (e) { return false; } })();
        const riding = (() => { try { return p.activeMountId === t.id && p.mounted; } catch (e) { return false; } })();
        tn.textContent = `${riding ? "🐴" : "💛"} ${t.name} (lv ${t.lv})${riding ? " — ridden" : mountable ? " · rides" : ""}${t.riderId ? " · lent out" : ""} · HP ${Math.ceil(t.hp)}/${t.maxHp}`;
        row.appendChild(tn);
        const mk = (label, fn, ghost, title) => {
          const b = document.createElement("button");
          b.textContent = label;
          if (ghost) b.className = "ghost";
          if (title) b.title = title;
          b.onclick = fn;
          row.appendChild(b);
        };
        if (mountable && t.hp > 0 && !t.riderId) mk(riding ? "Dismount" : "Ride 🐴", () => { window.Game.toggleMount(t.id); renderStable(building); updateHUD(); });
        mk("Store", () => { const r = window.Game.storeTameAtStable(t.id); try { if (window.Game.stableBoxSync) window.Game.stableBoxSync(p); } catch (e) {} if (r && !r.ok) toast("⚠️ " + (r.msg || "Couldn't stable.")); renderStable(building); updateHUD(); }, true, `Rest ${t.name} in BOX ${bi + 1}`);
        mk("✏️ Name", () => {
          try {
            const next = prompt("Name this beast:", (t.name || t.kind || "beast"));
            if (next == null) return;
            const r = window.Game.renameTame(t.id, next);
            if (r && r.ok) { renderStable(building); updateHUD(); }
            else toast("⚠️ " + ((r && r.msg) || "Couldn't rename."));
          } catch (e) {}
        }, true, "Give this beast a name");
        mk(t.fav ? "★" : "☆", () => { window.Game.stableSetFav(t.id, !t.fav); renderStable(building); updateHUD(); }, true, t.fav ? "Unfavourite" : "Favourite — pins to the ⭐ section");
        mk("✕", () => { if (confirm(`Release ${t.name}? It returns to the wild forever.`)) { window.Game.dismissTame(t.id); if (stableSelId === t.id) stableSelId = null; renderStable(building); updateHUD(); } }, true, "Release back to the wild");
        list.appendChild(row);
      }
    }
    // ---- favourites: starred stabled beasts, jump + retrieve ----
    const favs = (p.tames || []).filter(t => t && t.stabled && t.fav);
    if (favs.length) {
      const fh = document.createElement("div");
      fh.className = "tsec";
      fh.textContent = `⭐ Favourites (${favs.length}) — tap ★ on any beast to pin it here`;
      list.appendChild(fh);
      const boxOf = (id) => { for (let i = 0; i < boxes.length; i++) if ((boxes[i] || []).includes(id)) return i; return -1; };
      for (const t of favs) {
        const row = document.createElement("div");
        row.className = "trow";
        const tn = document.createElement("span");
        tn.className = "tn";
        const fbi = boxOf(t.id);
        tn.textContent = `⭐ ${t.name} (lv ${t.lv} ${t.kind})${fbi >= 0 ? ` · BOX ${fbi + 1}` : " · awaiting pen"}`;
        row.appendChild(tn);
        const mkf = (label, fn, ghost, title) => { const b = document.createElement("button"); b.textContent = label; if (ghost) b.className = "ghost"; if (title) b.title = title; b.onclick = fn; row.appendChild(b); };
        if (fbi >= 0) mkf("Go", () => { p.stableBox = fbi; stableSelId = t.id; stableMoveId = null; renderStable(building); }, true, `Open BOX ${fbi + 1} with ${t.name} selected`);
        mkf("Retrieve", () => { const r = window.Game.retrieveTameFromStable(t.id); toast(r.ok ? `💛 ${t.name} rejoins you!` : ("⚠️ " + (r.msg || "Party full."))); stableSelId = null; renderStable(building); updateHUD(); }, true, "Bring out as a companion on foot (needs an empty saddle)");
        mkf("★", () => { window.Game.stableSetFav(t.id, false); renderStable(building); updateHUD(); }, true, "Unfavourite");
        list.appendChild(row);
      }
    }
    // ---- box pager: < BOX n > + free extra boxes ----
    const pager = document.createElement("div");
    pager.className = "sbox-pager";
    const pg = (label, fn, ghost, title, disabled) => {
      const b = document.createElement("button");
      b.textContent = label;
      if (ghost) b.className = "ghost";
      if (title) b.title = title;
      if (disabled) b.disabled = true;
      b.onclick = fn;
      pager.appendChild(b);
    };
    let boxUsed = 0;
    try { for (const id of (box || [])) if (id && byId[id] && byId[id].stabled) boxUsed++; } catch (e) {}
    pg("<", () => { p.stableBox = (bi - 1 + boxes.length) % boxes.length; stableSelId = null; renderStable(building); }, false, "Previous box", boxes.length < 2);
    const lab = document.createElement("span");
    lab.className = "sbox-lab";
    const mover = (stableMoveId && byId[stableMoveId]) ? byId[stableMoveId] : null;
    lab.textContent = `══ BOX ${bi + 1} ══ · ${boxUsed}/${geom.slots} open` + (mover ? ` · carrying ${mover.name} — tap a pen` : "");
    pager.appendChild(lab);
    pg(">", () => { p.stableBox = (bi + 1) % boxes.length; stableSelId = null; renderStable(building); }, false, "Next box", boxes.length < 2);
    // pens are bought: each extra cell and each new box costs gold (and each
    // new box costs more than the last)
    let unlockN = 0;
    try { unlockN = ((window.Game.stableUnlockEnsure(p) || [])[bi] | 0) || 0; } catch (e) { }
    const nextSlotFee = (() => { try { return window.Game.stableSlotPrice(p, bi); } catch (e) { return -1; } })();
    if (nextSlotFee > 0) pg(`🔓 Pen ${unlockN + 1} (${nextSlotFee}g)`, () => {
      const r = window.Game.stableBuySlot(p, bi);
      toast(r.ok ? `🔓 Pen ${unlockN + 1} unlocked in BOX ${bi + 1}!` : ("⚠️ " + (r.msg || "Couldn't unlock.")));
      renderStable(building); updateHUD();
    }, true, `Unlock the next pen cell in BOX ${bi + 1} (${nextSlotFee}g)`);
    const nextBoxFee = (() => { try { return window.Game.stableBoxPrice(p); } catch (e) { return 0; } })();
    pg(`+ New Box (${nextBoxFee}g)`, () => {
      try {
        const r = window.Game.stableBuyBox(p);
        if (r && r.ok) { stableSelId = null; toast(`📦 BOX ${r.box + 1} raised — ${geom.slots} pens, first row open.`); }
        else toast("⚠️ " + ((r && r.msg) || "Couldn't raise a box."));
      } catch (e) {}
      renderStable(building); updateHUD();
    }, true, `Raise BOX ${boxes.length + 1} for ${nextBoxFee}g (opens with the first row unlocked)`);
    list.appendChild(pager);
    // ---- the 6x6 grid + beast sidebar (portrait + stats + actions) ----
    const grid = document.createElement("div");
    grid.className = "sbox-grid";
    for (let i = 0; i < geom.slots; i++) {
      const id = (box || [])[i];
      const t = (id && byId[id] && byId[id].stabled) ? byId[id] : null;
      const c = document.createElement("button");
      if (t) {
        const mountable = (() => { try { return window.Entities.isMountKind(t.kind); } catch (e) { return false; } })();
        c.className = "sbox-cell full" + ((t.id === stableSelId) ? " sel" : "");
        const e = document.createElement("div");
        e.className = "se";
        e.textContent = !(t.hp > 0) ? "💀" : (mountable ? "🐴" : "💛");
        const l = document.createElement("div");
        l.className = "sl";
        l.textContent = "lv" + t.lv;
        c.appendChild(e); c.appendChild(l);
        c.title = `${t.name} (lv ${t.lv} ${t.kind}) — HP ${Math.ceil(t.hp)}/${t.maxHp} · ATK ${t.atk} MATK ${t.matk != null ? t.matk : t.atk} DEF ${t.def}`;
        c.onclick = ((id2, si2) => () => {
          if (stableMoveId && stableMoveId !== id2) {
            const r = window.Game.stableSlotMove(p, stableMoveId, bi, si2);
            if (r && r.ok) {
              toast(r.same ? `${byId[stableMoveId].name} is already there.` : r.swapped ? `⇄ ${byId[stableMoveId].name} ⇄ ${r.swapped} — swapped.` : `📦 ${byId[stableMoveId].name} → pen ${si2 + 1}.`);
              stableSelId = stableMoveId;
            } else toast("⚠️ " + ((r && r.msg) || "Couldn't move."));
            stableMoveId = null;
            renderStable(building); updateHUD();
            return;
          }
          stableSelId = (stableSelId === id2) ? null : id2; renderStable(building);
        })(t.id, i);
      } else if (i >= unlockN) {
        c.className = "sbox-cell locked";
        c.innerHTML = "<div class='se dim'>🔒</div>";
        const fee = (() => { try { return window.Game.stableSlotPrice(p, bi); } catch (e) { return -1; } })();
        c.title = fee > 0 ? `Locked pen — unlock the next cell for ${fee}g` : "Locked pen";
        c.onclick = () => {
          if (stableMoveId) { toast("🔒 That pen is locked — pick an open pen."); return; }
          const r = window.Game.stableBuySlot(p, bi);
          toast(r.ok ? `🔓 Pen unlocked in BOX ${bi + 1}!` : ("⚠️ " + (r.msg || "Couldn't unlock.")));
          renderStable(building); updateHUD();
        };
      } else {
        c.className = "sbox-cell empty";
        c.innerHTML = "<div class='se dim'>·</div>";
        c.title = "Empty slot";
        c.onclick = ((si2) => () => {
          if (stableMoveId) {
            const r = window.Game.stableSlotMove(p, stableMoveId, bi, si2);
            if (r && r.ok) { toast(`📦 ${byId[stableMoveId].name} → pen ${si2 + 1}.`); stableSelId = stableMoveId; }
            else toast("⚠️ " + ((r && r.msg) || "Couldn't move."));
            stableMoveId = null;
            renderStable(building); updateHUD();
            return;
          }
          stableSelId = null; renderStable(building);
        })(i);
      }
      grid.appendChild(c);
    }
    const wrap = document.createElement("div");
    wrap.className = "sbox-wrap";
    wrap.appendChild(grid);
    const side = document.createElement("div");
    side.className = "sbox-side";
    // ---- selection detail (lives in the sidebar) ----
    const sel = (stableSelId && byId[stableSelId] && byId[stableSelId].stabled) ? byId[stableSelId] : null;
    if (sel) {
      const mountable = (() => { try { return window.Entities.isMountKind(sel.kind); } catch (e) { return false; } })();
      const det = document.createElement("div");
      det.className = "sbox-detail";
      const dlab = document.createElement("div");
      dlab.className = "menu-eyebrow items";
      dlab.textContent = "Selected beast — details + buttons";
      det.appendChild(dlab);
      try {
        const pc = window.Sprites.drawPortrait(sel, 120, true);
        pc.className = "sbox-portrait";
        det.appendChild(pc);
      } catch (e) {}
      const nm = document.createElement("div");
      nm.className = "pt-nm";
      nm.textContent = `${!(sel.hp > 0) ? "💀" : mountable ? "🐴" : "💛"} ${sel.name} — lv ${sel.lv} ${sel.kind}`;
      const sub = document.createElement("div");
      sub.className = "pt-lv";
      sub.textContent = `HP ${Math.ceil(sel.hp)}/${sel.maxHp} · MP ${Math.ceil(sel.mp || 0)}/${sel.maxMp || 0}`;
      const sub2 = document.createElement("div");
      sub2.className = "pt-lv";
      const sp = (sel.spd != null ? sel.spd : 3);
      sub2.textContent = `ATK ${sel.atk} · MATK ${sel.matk != null ? sel.matk : sel.atk} · DEF ${sel.def} · SDEF ${sel.sdef != null ? sel.sdef : 0} · SPD ${(typeof sp === "number" ? sp.toFixed(1) : sp)}${mountable ? " · rides" : ""}${sel.riderId ? " · lent out" : ""}`;
      det.appendChild(nm); det.appendChild(sub); det.appendChild(sub2);
      const row = document.createElement("div");
      row.className = "sbox-btns";
      const mk = (label, fn, ghost, title) => {
        const b = document.createElement("button");
        b.textContent = label;
        if (ghost) b.className = "ghost";
        if (title) b.title = title;
        b.onclick = fn;
        row.appendChild(b);
      };
      if (!(sel.hp > 0)) mk("✨ Revive — 50g", () => {
        const fee = 50;
        if ((p.lv || 1) < (sel.lv || 1)) { toast(`Too strong to revive — reach lv ${sel.lv} first (you're lv ${p.lv}).`); return; }
        if (p.gold < fee) { toast("Need 50 gold."); return; }
        p.gold -= fee; sel.hp = Math.round(sel.maxHp * 0.5); sel.mp = sel.maxMp;
        try { window.Game.saveGame(true); } catch (e) {}
        renderStable(building); updateHUD();
        toast(`💛 ${sel.name} stirs back to life!`);
      });
      else {
        if (mountable && !sel.riderId) mk("Ride 🐴", () => {
          const r = window.Game.rideTameFromStable(sel.id);
          toast(r.ok ? `🐴 You mount ${sel.name}!` : ("⚠️ " + (r.msg || "Couldn't ride.")));
          stableSelId = null; renderStable(building); updateHUD();
        }, false, "Ride this beast now (rests whoever you're riding)");
        mk("Retrieve", () => {
          const r = window.Game.retrieveTameFromStable(sel.id);
          toast(r.ok ? `💛 ${sel.name} rejoins you!` : ("⚠️ " + (r.msg || "Party full.")));
          stableSelId = null; renderStable(building); updateHUD();
        }, true, "Bring out as a companion on foot (needs an empty saddle)");
      }
      mk("✏️ Name", () => {
        try {
          const next = prompt("Name this beast:", (sel.name || sel.kind || "beast"));
          if (next == null) return;
          const r = window.Game.renameTame(sel.id, next);
          if (r && r.ok) { renderStable(building); updateHUD(); }
          else toast("⚠️ " + ((r && r.msg) || "Couldn't rename."));
        } catch (e) {}
      }, true, "Give this beast a name");
      mk(sel.fav ? "★" : "☆", () => { const r = window.Game.stableSetFav(sel.id, !sel.fav); if (!(r && r.ok)) toast("⚠️ Couldn't (un)favourite."); renderStable(building); updateHUD(); }, true, sel.fav ? "Unfavourite" : "Favourite — pins to the ⭐ section above");
      if (stableMoveId === sel.id) mk("Cancel move", () => { stableMoveId = null; renderStable(building); }, true, "Stop moving this beast");
      else mk("⇄ Move…", () => { stableMoveId = sel.id; stableSelId = null; renderStable(building); }, true, "Reorder: pick this beast up, then tap any pen (occupied = swap). Flip < > pages while carrying to move across boxes.");
      if (boxes.length > 1) {
        const mv = document.createElement("select");
        mv.className = "sbox-mv";
        mv.title = "Move to another box";
        for (let i = 0; i < boxes.length; i++) {
          const o = document.createElement("option");
          o.value = String(i);
          o.textContent = "BOX " + (i + 1);
          if (i === bi) o.disabled = true;
          mv.appendChild(o);
        }
        try { mv.value = String((bi + 1) % boxes.length); } catch (e) {}
        row.appendChild(mv);
        mk("⇄ Move", () => {
          const ni = parseInt(mv.value, 10);
          const r = window.Game.stableBoxMove(p, sel.id, ni);
          if (r) { p.stableBox = ni; stableSelId = sel.id; toast(`📦 ${sel.name} → BOX ${ni + 1}.`); }
          else toast(`⚠️ BOX ${ni + 1} is full — raise another.`);
          renderStable(building); updateHUD();
        }, true, "Move to the chosen box");
      }
      mk("✕", () => { if (confirm(`Release ${sel.name}? It returns to the wild forever.`)) { window.Game.dismissTame(sel.id); stableSelId = null; renderStable(building); updateHUD(); } }, true, "Release back to the wild");
      det.appendChild(row);
      side.appendChild(det);
    } else if (stableMoveId && byId[stableMoveId]) {
      const mvb = byId[stableMoveId];
      const mdet = document.createElement("div");
      mdet.className = "sbox-detail";
      const mnm = document.createElement("div");
      mnm.className = "pt-nm";
      mnm.textContent = `📦 Carrying ${mvb.name} — tap any open pen (occupied = swap). Flip < > pages while carrying to cross boxes.`;
      mdet.appendChild(mnm);
      const mrow = document.createElement("div");
      mrow.className = "sbox-btns";
      const mcb = document.createElement("button");
      mcb.textContent = "Cancel";
      mcb.className = "ghost";
      mcb.onclick = () => { stableMoveId = null; renderStable(building); };
      mrow.appendChild(mcb);
      mdet.appendChild(mrow);
      side.appendChild(mdet);
    } else {
      const none = document.createElement("div");
      none.className = "sbox-none";
      none.textContent = used ? "Select a beast to inspect its stats." : "Empty pens — tame a beast to fill them.";
      side.appendChild(none);
    }
    wrap.appendChild(side);
    list.appendChild(wrap);
    // stabled beasts with no open pen cell (lodge is full): they wait here
    // until a pen is unlocked — Retrieve still works if a saddle is free
    try {
      const boxed = {};
      for (const b of (boxes || [])) for (const id of (b || [])) if (id) boxed[id] = true;
      const homeless = (p.tames || []).filter(t => t && t.stabled && !boxed[t.id]);
      if (homeless.length) {
        const h = document.createElement("div");
        h.className = "tsec";
        h.textContent = `⏳ Awaiting pen space (${homeless.length}) — unlock pens above, then Pen them`;
        list.appendChild(h);
        for (const t of homeless) {
          const row = document.createElement("div");
          row.className = "trow";
          const tn = document.createElement("span");
          tn.className = "tn";
          tn.textContent = `💛 ${t.name} (lv ${t.lv} ${t.kind})`;
          row.appendChild(tn);
          const mk = (label, fn, ghost, title) => {
            const b = document.createElement("button");
            b.textContent = label;
            if (ghost) b.className = "ghost";
            if (title) b.title = title;
            b.onclick = fn;
            row.appendChild(b);
          };
          mk("Pen it", () => {
            const r = window.Game.stableBoxPlace(p, t.id);
            toast(r ? `📦 ${t.name} → BOX ${r.box + 1}.` : "⚠️ No unlocked pen space — unlock a slot or raise a box.");
            renderStable(building); updateHUD();
          }, false, "File into the first open pen");
          mk("Retrieve", () => {
            const r = window.Game.retrieveTameFromStable(t.id);
            toast(r.ok ? `💛 ${t.name} rejoins you!` : ("⚠️ " + (r.msg || "Party full.")));
            renderStable(building); updateHUD();
          }, true, "Bring out as a companion on foot");
          mk("✕", () => { if (confirm(`Release ${t.name}? It returns to the wild forever.`)) { window.Game.dismissTame(t.id); renderStable(building); updateHUD(); } }, true, "Release back to the wild");
          list.appendChild(row);
        }
      }
    } catch (e) { }
    if (!active.length && !used) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "Empty pens. Weaken a tamable beast (wolf, horse, turtle, crab, kelpie…) until it yields 💛 — then press E to tame it.";
      list.appendChild(d);
    }
  }
  // ---------- bestiary archive tab: the in-game monster compendium ----------
  // Data-driven like the title-screen Codex (never hardcode stats here), but
  // gated by discovery: unseen kinds show as ??? until first met, slain
  // counts accumulate from player-faction kills (Entities.noteBestiarySlain).
  // Lives on the lodge modal so every 🧬 Beast Lodge browses it.
  let bestiarySel = null, bestiaryQuery = "";
  function bestiaryAbName(id) {
    try { const a = (window.CFG && window.CFG.ABILITIES || {})[id]; if (a) return (a.name || id); } catch (e) { }
    return String(id);
  }
  function renderBestiaryTab(list, p, building) {
    try { window.Entities.ensureProgression(p); } catch (e) { }
    const T = (window.CFG && window.CFG.MOB_TEMPLATES) || {};
    const seen = ((p.bestiary && p.bestiary.seen) || {});
    const slain = ((p.bestiary && p.bestiary.slain) || {});
    const ids = Object.keys(T).filter(k => T[k]);
    let totalSlain = 0;
    try { for (const k of Object.keys(slain)) totalSlain += (slain[k] | 0) || 0; } catch (e) { }
    const head = document.createElement("div");
    head.className = "psec-sub";
    head.textContent = `📖 Bestiary — met ${Object.keys(seen).length}/${ids.length} kinds · ${totalSlain} slain · meet beasts out in the world, then browse them here`;
    list.appendChild(head);
    const q = document.createElement("input");
    q.placeholder = "🔍 search beasts…";
    q.value = bestiaryQuery || "";
    q.style.cssText = "width:100%;max-width:340px;display:block;margin:0 auto 8px auto;background:#0d141b;color:#fff;border:1px solid #3a4a5a;border-radius:8px;padding:8px;font-size:13px;box-sizing:border-box";
    list.appendChild(q);
    const detBox = document.createElement("div");
    list.appendChild(detBox);
    const resBox = document.createElement("div");
    list.appendChild(resBox);
    const drawDetail = () => {
      detBox.innerHTML = "";
      if (!bestiarySel || !T[bestiarySel]) return;
      const t = T[bestiarySel];
      const isSeen = !!seen[bestiarySel];
      const d = document.createElement("div");
      d.className = "trow";
      d.style.alignItems = "flex-start";
      try {
        if (isSeen) {
          const pc = window.Sprites.drawPortrait({ kind: bestiarySel, tint: t.tint, id: bestiarySel }, 96, true);
          pc.style.cssText = "width:64px;height:80px;image-rendering:pixelated;flex:none;background:#101820;border-radius:8px;margin-right:8px";
          d.appendChild(pc);
        } else {
          const qq = document.createElement("span");
          qq.textContent = "❓";
          qq.style.cssText = "font-size:40px;flex:none;width:64px;text-align:center";
          d.appendChild(qq);
        }
      } catch (e) { }
      const tx = document.createElement("span");
      tx.className = "tn";
      if (!isSeen) {
        tx.textContent = "??? — you haven't met this beast yet. Explore, fight and tame: sightings record here automatically.";
      } else {
        const nm = document.createElement("div");
        nm.style.fontWeight = "700";
        nm.textContent = `${t.boss ? "👹 " : ""}${t.name || bestiarySel}`;
        const tags = document.createElement("div");
        tags.style.cssText = "font-size:12px;opacity:.7";
        const bits = [bestiarySel];
        if (t.undead) bits.push("💀 undead");
        if (t.demon) bits.push("😈 demon");
        if (t.tamable) bits.push("💛 tamable");
        if (t.mount) bits.push("🐴 mount");
        if (t.aquatic) bits.push("🌊 aquatic");
        if (t.diver) bits.push("🤿 dives");
        try {
          const C = window.CFG || {};
          if (C.FEMALE_KINDS && C.FEMALE_KINDS.indexOf(bestiarySel) >= 0) bits.push("♀ always female");
          else if (C.MALE_KINDS && C.MALE_KINDS.indexOf(bestiarySel) >= 0) bits.push("♂ always male");
          else if (C.GENDERLESS_KINDS && C.GENDERLESS_KINDS.indexOf(bestiarySel) >= 0) bits.push("⚲ genderless");
          else bits.push("♂/♀ varies");
        } catch (e2) { }
        tags.textContent = bits.join(" · ");
        const kv = document.createElement("div");
        kv.style.cssText = "font-size:12px;margin-top:2px";
        kv.textContent = `HP ${t.hp} · MP ${t.mp || 0} · ATK ${t.atk} · MATK ${t.matk != null ? t.matk : t.atk} · DEF ${t.def} · SDEF ${t.sdef != null ? t.sdef : "—"} · SPD ${t.spd} · XP ${t.xp} · 💀 ${((slain[bestiarySel] | 0) || 0)} slain`;
        const ab = document.createElement("div");
        ab.style.cssText = "font-size:12px;margin-top:2px";
        ab.textContent = `Abilities: ${((t.abilities || []).map(bestiaryAbName).join(", ")) || "—"}`;
        tx.appendChild(nm); tx.appendChild(tags); tx.appendChild(kv); tx.appendChild(ab);
      }
      d.appendChild(tx);
      detBox.appendChild(d);
    };
    const drawResults = () => {
      resBox.innerHTML = "";
      const needle = (bestiaryQuery || "").trim().toLowerCase();
      const rows = ids.filter(k => {
        if (!needle) return true;
        const t = T[k];
        return k.toLowerCase().indexOf(needle) >= 0 || String((t && t.name) || "").toLowerCase().indexOf(needle) >= 0;
      }).sort((a, b) => {
        const sa = seen[a] ? 0 : 1, sb = seen[b] ? 0 : 1;
        if (sa !== sb) return sa - sb;
        const ba = T[a].boss ? 0 : 1, bb = T[b].boss ? 0 : 1;
        if (ba !== bb) return ba - bb;
        return String(T[a].name || a).localeCompare(String(T[b].name || b));
      });
      if (!rows.length) {
        const e2 = document.createElement("div");
        e2.className = "invempty";
        e2.textContent = "No beasts match.";
        resBox.appendChild(e2);
        return;
      }
      for (const k of rows.slice(0, 220)) {
        const t = T[k];
        const isSeen = !!seen[k];
        const row = document.createElement("div");
        row.className = "trow";
        row.style.cursor = "pointer";
        try {
          if (isSeen) {
            const pc = window.Sprites.drawPortrait({ kind: k, tint: t.tint, id: k }, 48, true);
            pc.style.cssText = "width:30px;height:38px;image-rendering:pixelated;flex:none;background:#101820;border-radius:6px;margin-right:8px";
            row.appendChild(pc);
          } else {
            const qq = document.createElement("span");
            qq.textContent = "❓";
            qq.style.cssText = "flex:none;width:30px;text-align:center;margin-right:8px";
            row.appendChild(qq);
          }
        } catch (e) { }
        const nm = document.createElement("span");
        nm.className = "tn";
        const nSlain = (slain[k] | 0) || 0;
        nm.textContent = isSeen
          ? `${bestiarySel === k ? "✅ " : ""}${t.boss ? "👹 " : ""}${t.name || k} — HP ${t.hp} · ATK ${t.atk} · MATK ${t.matk != null ? t.matk : t.atk} · DEF ${t.def}${nSlain ? ` · 💀 ${nSlain} slain` : ""}`
          : "???";
        row.appendChild(nm);
        row.title = isSeen ? "Inspect this beast" : "Not met yet — meet it in the wild first";
        row.onclick = ((kk) => () => { bestiarySel = (bestiarySel === kk) ? null : kk; drawDetail(); drawResults(); })(k);
        resBox.appendChild(row);
      }
      if (rows.length > 220) {
        const more = document.createElement("div");
        more.className = "invempty";
        more.textContent = `…and ${rows.length - 220} more — narrow the search.`;
        resBox.appendChild(more);
      }
    };
    // the search box lives outside the re-rendered boxes, so typing never loses focus
    q.oninput = () => { bestiaryQuery = q.value; drawDetail(); drawResults(); };
    drawDetail(); drawResults();
  }
  // ---------- tack tab: the beast lodge's hunt-gear counter (buy-only) ----------
  // Low-tier whips (rusted, iron, steel) + bows (oak, yew) at 0.9x base —
  // the old smith prices — priced through the shared shop trade path (like
  // the altar vestry), so values can never drift from the smith lists.
  // Higher tiers stay loot/forge-only. No sell pane: the smithy still buys
  // everything, and the lodge E-nexus keeps breeding priority.
  function renderLodgeTrade(list, p, building) {
    try { window.Entities.ensureProgression(p); } catch (e) {}
    const head = document.createElement("div");
    head.className = "psec-sub";
    head.textContent = `🏹 Tack — low-tier whips + bows (unlimited) · 🪙 ${(p.gold | 0)}g`;
    list.appendChild(head);
    let ids = [];
    try { ids = (window.Shops.stockFor ? window.Shops.stockFor("lodge") : ["rusted_whip", "iron_whip", "steel_whip", "oak_bow", "yew_bow"]) || []; } catch (e) { ids = []; }
    if (!ids.length) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "The tack wall is bare.";
      list.appendChild(d);
      return;
    }
    for (const id of ids) {
      let it = null;
      try { it = window.Items.ITEMS[id]; } catch (e) { it = null; }
      if (!it) continue;
      let price = 0;
      try { price = window.Shops.askPrice("lodge", id); } catch (e) { price = it.price | 0 || 10; }
      const row = document.createElement("div");
      row.className = "trow";
      const nm = document.createElement("span");
      nm.className = "tn";
      nm.textContent = `${it.name} — ${price}g`;
      try { nm.title = it.desc || ""; } catch (e) {}
      row.appendChild(nm);
      const b = document.createElement("button");
      b.textContent = "Buy";
      try { b.disabled = (p.gold | 0) < price; } catch (e) {}
      b.title = `Buy ${it.name} for ${price}g`;
      b.onclick = () => {
        let r = null;
        try { r = window.Shops.buyFromShop("lodge", id, 1); } catch (e) { r = { ok: false, msg: "Trade failed." }; }
        toast(r.msg, 3500);
        try { renderStable(building); } catch (e) {}
        try { updateHUD(); } catch (e) {}
      };
      row.appendChild(b);
      list.appendChild(row);
    }
  }
  // ---------- breed tab: the beast lodge's pairing board (stable UI reused) ----------
  // Pick two living, un-lent, non-breeding beasts of the same kinship family
  // (steeds, hounds, shellbacks, coils, skyborn, swarms — else same kind),
  // pay a
  // gold fee scaled by level/stats/attacks, and hand the pair over for a few
  // real minutes. Many pairs can lodge at once; collect at THIS beast lodge to
  // get parents + one bred offspring (random mix of stats/attacks, sometimes
  // mutated, always counts as tamed).
  function breedTameLabel(t) {
    try {
      const where = t.breeding ? "🧬 breeding" : (t.stabled ? "📦 stabled" : "💛 with you");
      const ab = (t.abilities || []).length ? ` · ${(t.abilities || []).join(",")}` : "";
      let fam = "";
      try { fam = window.Entities.breedFamilyLabel ? window.Entities.breedFamilyLabel(t.kind) : t.kind; } catch (e) { fam = t.kind; }
      let gi = "";
      try { gi = window.Entities.genderIcon ? window.Entities.genderIcon(window.Entities.ensureGender ? window.Entities.ensureGender(t) : t.gender) + " " : ""; } catch (e) { }
      return `${gi}${t.name} (lv ${t.lv} ${t.kind} · ${fam}) · HP ${Math.ceil(t.hp)}/${t.maxHp} · ATK ${t.atk} MATK ${t.matk != null ? t.matk : t.atk} DEF ${t.def}${ab} · ${where}`;
    } catch (e) { return String((t && t.name) || "beast"); }
  }
  function renderBreedTab(list, p, building) {
    try { window.Entities.ensureProgression(p); } catch (e) {}
    const jobs = (() => { try { return window.Game.breedJobsEnsure ? window.Game.breedJobsEnsure(p) : (p.breedJobs || []); } catch (e) { return []; } })();
    const hereKey = (() => { try { return window.Game.breedKeyFor ? window.Game.breedKeyFor(building) : "beast_lodge"; } catch (e) { return "beast_lodge"; } })();
    const intro = document.createElement("div");
    intro.className = "invempty";
    intro.textContent = `🧬 Beast-lodge breeding — same kin AND opposite sexes: steeds (any horse × any horse, incl. cinder steeds), hounds (wolves, pups, tanuki, jackals, foxes, gnolls), shellbacks (tide + magma turtles), coils (serpents/eels), skyborn (flyers), swarms (giant insects) — anything else breeds same-kind only. Every pairing needs one ♂ male and one ♀ female (genderless kin can't breed). Every wild beast rolls its own stats, so same-kind pairs combine their rolls. Fee scales with both parents' levels, stats and attacks. Parents lodge here a few real minutes (they can't fight, ride, or stable meanwhile); return to THIS beast lodge to collect both parents + one bred pup/chick/foal. Newborns count as tames. Several pairs can breed at once.`;
    list.appendChild(intro);
    // prune stale selections
    const byId = {};
    try { for (const t of (p.tames || [])) if (t && t.id) byId[t.id] = t; } catch (e) {}
    if (breedSelA && (!byId[breedSelA] || byId[breedSelA].breeding)) breedSelA = null;
    if (breedSelB && (!byId[breedSelB] || byId[breedSelB].breeding)) breedSelB = null;
    if (breedSelA && breedSelA === breedSelB) breedSelB = null;
    const cands = (p.tames || []).filter(t => t && !t.breeding);
    if (!cands.length) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = jobs.length ? "All your beasts are lodged at beast lodges — collect or reclaim them below." : "No beasts yet — tame a beast first (weaken it until it yields 💛, then E).";
      list.appendChild(d);
    } else {
      const h = document.createElement("div");
      h.className = "tsec";
      h.textContent = `💛 Choose two parents (${cands.length} available)`;
      list.appendChild(h);
      const mkRow = (t) => {
        const row = document.createElement("div");
        row.className = "trow";
        const nm = document.createElement("span");
        nm.className = "tn";
        nm.textContent = ((breedSelA === t.id || breedSelB === t.id) ? "✅ " : "") + breedTameLabel(t) + (!(t.hp > 0) ? " · 💀 down" : "") + (t.riderId ? " · lent out" : "");
        row.appendChild(nm);
        const selBtn = document.createElement("button");
        const isSel = (breedSelA === t.id || breedSelB === t.id);
        selBtn.textContent = isSel ? "✓ Picked" : ((!(t.hp > 0) || t.riderId) ? "Pick" : "Pick");
        selBtn.title = "Pick as a parent for this pairing";
        selBtn.onclick = () => {
          if (breedSelA === t.id) breedSelA = null;
          else if (breedSelB === t.id) breedSelB = null;
          else if (!breedSelA) breedSelA = t.id;
          else if (!breedSelB) breedSelB = t.id;
          else { breedSelA = breedSelB; breedSelB = t.id; }
          renderStable(building); updateHUD();
        };
        row.appendChild(selBtn);
        list.appendChild(row);
      };
      // show living, usable first, then the rest (down/lent still listed w/ reason)
      const okFirst = cands.slice().sort((a, b) => {
        const sa = ((a.hp > 0) && !a.riderId) ? 0 : 1, sb = ((b.hp > 0) && !b.riderId) ? 0 : 1;
        return sa - sb;
      });
      for (const t of okFirst.slice(0, 60)) mkRow(t);
      if (okFirst.length > 60) {
        const more = document.createElement("div");
        more.className = "invempty";
        more.textContent = `…and ${okFirst.length - 60} more — collect/reclaim breeders to slim the list.`;
        list.appendChild(more);
      }
      // pairing preview + deposit
      const prev = document.createElement("div");
      prev.className = "tsec";
      const A = breedSelA ? byId[breedSelA] : null, B = breedSelB ? byId[breedSelB] : null;
      if (A && B) {
        let chk = null;
        try { chk = window.Game.breedCostFor(A.id, B.id, p); } catch (e) {}
        if (!chk || !chk.ok) {
          prev.textContent = `⚠️ ${(chk && chk.msg) || "Those two can't breed."} Pick another pair.`;
          list.appendChild(prev);
          const clr = document.createElement("button");
          clr.className = "ghost"; clr.textContent = "Clear picks";
          clr.onclick = () => { breedSelA = null; breedSelB = null; renderStable(building); };
          list.appendChild(clr);
        } else {
          let durTxt = "";
          try {
            const ms = window.Entities.breedTimeMs(A, B);
            const mm = Math.max(1, Math.round(ms / 60000));
            durTxt = ` · ⏳ ~${mm} min`;
          } catch (e2) {}
          prev.textContent = `🧬 ${A.name} × ${B.name} — fee ${chk.cost}g (you carry ${(p.gold | 0)}g)${durTxt}. Parents lodge here; come back to collect 2 parents + 1 offspring.`;
          list.appendChild(prev);
          const go = document.createElement("button");
          go.textContent = `🧬 Breed for ${chk.cost}g`;
          go.title = "Hand both parents to this beast lodge (they leave your party/boxes until collected)";
          go.onclick = () => {
            const r = window.Game.breedDeposit(A.id, B.id, building);
            if (r && r.ok) { toast(`🧬 ${A.name} + ${B.name} lodge at the beast lodge — back soon with young!`); breedSelA = null; breedSelB = null; }
            else toast("⚠️ " + ((r && r.msg) || "Couldn't breed."));
            renderStable(building); updateHUD();
          };
          list.appendChild(go);
          const clr = document.createElement("button");
          clr.className = "ghost"; clr.textContent = "Clear";
          clr.onclick = () => { breedSelA = null; breedSelB = null; renderStable(building); };
          list.appendChild(clr);
          if ((p.gold | 0) < (chk.cost | 0)) {
            const w = document.createElement("div");
            w.className = "invempty";
            w.textContent = `Need ${chk.cost}g — delve, quest, or sell horses first.`;
            list.appendChild(w);
          }
        }
      } else {
        let famTxt = "";
        try { famTxt = A ? (window.Entities.breedFamilyLabel ? window.Entities.breedFamilyLabel(A.kind) : A.kind) : ""; } catch (e) { try { famTxt = (A && A.kind) || ""; } catch (e2) { famTxt = ""; } }
        prev.textContent = A ? `1/2 picked: ${A.name} — pick a second beast of the same kin (${famTxt}).` : "Pick two beasts above (same kin: steeds, hounds, shellbacks, coils, skyborn, swarms — else same kind).";
        list.appendChild(prev);
      }
    }
    // active pairings
    const jh = document.createElement("div");
    jh.className = "tsec";
    const mine = jobs.filter(j => j && String(j.bestiaryKey || "") === String(hereKey || ""));
    const elsewhere = jobs.filter(j => j && String(j.bestiaryKey || "") !== String(hereKey || ""));
    jh.textContent = mine.length ? `⏳ Breeding here (${mine.length})` : "⏳ Nothing breeding here yet";
    list.appendChild(jh);
    if (!mine.length) {
      const d = document.createElement("div");
      d.className = "invempty";
      d.textContent = "Hand over a pair above — up to several pairs at once.";
      list.appendChild(d);
    }
    for (const j of mine) {
      const a = byId[j.aId], b = byId[j.bId];
      let st = { ready: false, msLeft: 0, secsLeft: 0 };
      try { st = window.Game.breedJobStatus(j); } catch (e) {}
      const row = document.createElement("div");
      row.className = "trow";
      const nm = document.createElement("span");
      nm.className = "tn";
      const an = a ? `${a.name} (lv ${a.lv})` : "a lost beast";
      const bn = b ? `${b.name} (lv ${b.lv})` : "a lost beast";
      if (st.ready) nm.textContent = `🎉 ${an} × ${bn} — READY! Collect 2 parents + 1 newborn`;
      else {
        const s = st.secsLeft | 0, mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, "0");
        nm.textContent = `🧬 ${an} × ${bn} — ${mm}:${ss} left`;
      }
      row.appendChild(nm);
      if (st.ready) {
        const c = document.createElement("button");
        c.textContent = "🎁 Collect";
        c.title = "Collect both parents + the offspring";
        c.onclick = () => {
          const r = window.Game.breedCollect(j.id, building);
          if (r && r.ok) {
            const mut = r.child && r.child.mutated ? " ✨ Mutated!" : "";
            toast(`🎉 ${r.aName} + ${r.bName} return with ${r.child.name} (lv 1 ${r.child.kind})!${mut} (counts as tamed)`);
          } else toast("⚠️ " + ((r && r.msg) || "Not ready."));
          renderStable(building); updateHUD();
        };
        row.appendChild(c);
      } else {
        const w = document.createElement("button");
        w.className = "ghost"; w.textContent = "Refresh";
        w.title = "Recheck the timer";
        w.onclick = () => { renderStable(building); };
        row.appendChild(w);
      }
      const x = document.createElement("button");
      x.className = "ghost"; x.textContent = "Reclaim";
      x.title = "Take parents back now (no child, no refund)";
      x.onclick = () => {
        if (!confirm("Take the parents back now? No child, no refund.")) return;
        const r = window.Game.breedCancel(j.id);
        if (!(r && r.ok)) toast("⚠️ " + ((r && r.msg) || "Couldn't reclaim."));
        renderStable(building); updateHUD();
      };
      row.appendChild(x);
      list.appendChild(row);
    }
    if (elsewhere.length) {
      const eh = document.createElement("div");
      eh.className = "tsec";
      eh.textContent = `🧭 Breeding elsewhere (${elsewhere.length}) — collect each pair at its own beast lodge`;
      list.appendChild(eh);
      for (const j of elsewhere) {
        const row = document.createElement("div");
        row.className = "trow";
        const nm = document.createElement("span");
        nm.className = "tn";
        nm.textContent = `🧬 lodged at ${(j.bestiaryName === "Bestiary" ? "Beast Lodge" : null) || j.bestiaryName || "another beast lodge"}`;
        row.appendChild(nm);
        const g = document.createElement("button");
        g.className = "ghost"; g.textContent = "Where?";
        g.title = "Point the compass at a beast lodge";
        g.onclick = () => {
          try {
            const gp = window.Game.G.player;
            const gd = window.Buildings.beastLodgeGuidance ? window.Buildings.beastLodgeGuidance(gp.x, gp.y) : null;
            toast(gd ? `🧭 Nearest beast lodge: ${gd.title} ${gd.dirName} (${Math.round(gd.d)} tiles)` : "🧭 No beast lodge in sight — try a larger hearth.");
          } catch (e) {}
        };
        row.appendChild(g);
        list.appendChild(row);
      }
    }
    // ---- bound slaves: NPC x NPC in the lodge, never counts for taming ----
    try {
      const slaves = ((window.Game.G.npcs || []).filter(n => n && n.role === "slave" && n.hp > 0 && !n.isTame)).slice(0, 12);
      const sh = document.createElement("div");
      sh.className = "tsec";
      sh.textContent = `⛓️ Bound breeding — one ♂ male + one ♀ female slave (genderless can't breed), slave × slave only, never counts for taming (${slaves.length} slaves nearby)`;
      list.appendChild(sh);
      if (!slaves.length) {
        const dd = document.createElement("div");
        dd.className = "invempty";
        dd.textContent = "No bound slaves nearby — buy them at a Black Market.";
        list.appendChild(dd);
      } else {
        if (!window._slaveSel) window._slaveSel = [];
        for (const s of slaves) {
          const row = document.createElement("div");
          row.className = "trow";
          const nm = document.createElement("span");
          nm.className = "tn";
          const picked = (window._slaveSel || []).includes(s.id) ? "✅ " : "";
          let sgi = "";
          try { sgi = window.Entities.genderIcon ? window.Entities.genderIcon(window.Entities.ensureGender ? window.Entities.ensureGender(s) : s.gender) + " " : ""; } catch (e) { }
          nm.textContent = `${picked}⛓️ ${sgi}${s.name} lv${s.lv}`;
          row.appendChild(nm);
          const pb = document.createElement("button");
          pb.textContent = (window._slaveSel || []).includes(s.id) ? "✓ Picked" : "Pick";
          pb.onclick = () => {
            try {
              window._slaveSel = window._slaveSel || [];
              if (window._slaveSel.includes(s.id)) window._slaveSel = window._slaveSel.filter(x => x !== s.id);
              else { window._slaveSel.push(s.id); if (window._slaveSel.length > 2) window._slaveSel = window._slaveSel.slice(-2); }
              renderStable(building);
            } catch (e) {}
          };
          row.appendChild(pb);
          list.appendChild(row);
        }
        const sel = window._slaveSel || [];
        if (sel.length === 2) {
          const go = document.createElement("button");
          const cost = 400;
          go.textContent = `⛓️ Breed slaves (${cost}g+)`;
          go.onclick = () => {
            try {
              const r = window.Shops.breedSlaveDeposit(sel[0], sel[1], building);
              if (r && r.ok) { toast(`⛓️ Pair lodged — back soon with young!`); window._slaveSel = []; }
              else toast("⚠️ " + ((r && r.msg) || "Couldn't breed."));
              renderStable(building); updateHUD();
            } catch (e) { toast("⚠️ Bond failed."); }
          };
          list.appendChild(go);
        }
      }
      // slave jobs here
      try {
        const sj = (window.Shops.slaveJobsEnsure ? window.Shops.slaveJobsEnsure(p) : []).filter(j => j && String(j.bestiaryKey || "") === String(hereKey || ""));
        for (const j of sj) {
          const row = document.createElement("div");
          row.className = "trow";
          const nm = document.createElement("span");
          nm.className = "tn";
          const ready = Date.now() >= (j.readyAt | 0);
          nm.textContent = ready ? `🎉 Bound pair — READY! Collect` : `⛓️ Bound pair — waiting…`;
          row.appendChild(nm);
          if (ready) {
            const c = document.createElement("button");
            c.textContent = "🎁 Collect";
            c.onclick = () => { try { const r = window.Shops.breedSlaveCollect(j.id); toast(r && r.ok ? `🎉 A bound child joins you (never counts for taming)!` : "⚠️ " + ((r && r.msg) || "Not ready.")); } catch (e) {} renderStable(building); updateHUD(); };
            row.appendChild(c);
          }
          list.appendChild(row);
        }
      } catch (e) {}
    } catch (e) {}
    // live countdown while the tab stays open
    try {
      if (breedTimer) { clearTimeout(breedTimer); breedTimer = null; }
      if (stableTab === "breed" && !$("stableModal").hidden && mine.some(j => { try { return !window.Game.breedJobStatus(j).ready; } catch (e) { return false; } })) {
        breedTimer = setTimeout(() => { try { if (stableTab === "breed" && !$("stableModal").hidden) renderStable(stableBuilding || building); } catch (e) {} }, 1000);
      }
    } catch (e) {}
  }
  let breedTimer = null;
  // ---------- horse market: the stable's second tab (HORSES ONLY) ----------
  // Buy stable-bred horses (more HP / faster / tougher than wild horses, but
  // no attack training — better breeding costs more) and sell your horses
  // for a level-based price. No other mount or beast ever trades here.
  function renderStableMarket(list, p, building) {
    const byId = {};
    try { for (const t of (p.tames || [])) if (t && t.id) byId[t.id] = t; } catch (e) { }
    const d = document.createElement("div");
    d.className = "invempty";
    let dimBlurb = "🐴 Stable-bred horses: more HP, faster, tougher hides than any wild horse — but no attack training (they're bred for the saddle, not the fight). Better breeding costs more. Selling pays by level: train a horse up, sell it on.";
    try {
      const dim = (window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.dim) || (window.World && window.World.getDim && window.World.getDim()) || "surf";
      if (dim === "heaven") dimBlurb = "🌅 Dawn-bred pegasuses and moonhorn unicorns: the finest saddles in the world — faster, tougher, sturdier than any surface horse, but no attack training. Better breeding costs more. Selling pays by level.";
      else if (dim === "hell") dimBlurb = "🔥 Pit-bred hounds: ash-raised hell hounds and gore-bred bruisers — lava-footed, loyal, and meaner than any surface horse, but no attack training. Better breeding costs more. Selling pays by level.";
    } catch (e) { }
    d.textContent = dimBlurb;
    list.appendChild(d);
    const buyH = document.createElement("div");
    buyH.className = "tsec";
    buyH.textContent = "🛒 Buy a bred horse";
    list.appendChild(buyH);
    let stock = [];
    try { stock = window.Game.stableShopStock ? window.Game.stableShopStock() : []; } catch (e) { }
    if (!stock.length) {
      const e2 = document.createElement("div");
      e2.className = "invempty";
      e2.textContent = "No horses for sale right now.";
      list.appendChild(e2);
    }
    for (const s of (stock || [])) {
      let tpl = null;
      try { tpl = (window.CFG.MOB_TEMPLATES || {})[s.kind] || null; } catch (e) { }
      if (!tpl) continue;
      const row = document.createElement("div");
      row.className = "trow shoprow";
      try {
        const pc = window.Sprites.drawPortrait({ kind: s.kind, tint: tpl.tint, id: s.kind }, 64, true);
        pc.className = "shop-portrait";
        row.appendChild(pc);
      } catch (e) { }
      const nm = document.createElement("span");
      nm.className = "tn";
      const gifts = [];
      if ((tpl.hp | 0) >= 150) gifts.push("big HP");
      else if ((tpl.hp | 0) > 75) gifts.push("HP+");
      if ((tpl.spd || 0) >= 6.2) gifts.push("fast");
      if ((tpl.def | 0) >= 10) gifts.push("armored");
      else if ((tpl.def | 0) > 4) gifts.push("DEF+");
      nm.textContent = `🐴 ${tpl.name} — lv 1 · HP ${tpl.hp} · ATK ${tpl.atk} (no training) · DEF ${tpl.def} · SPD ${tpl.spd}${gifts.length ? " · " + gifts.join(" + ") : ""} — ${s.blurb || ""}`;
      row.appendChild(nm);
      const b = document.createElement("button");
      b.textContent = `Buy — ${s.price}g`;
      b.title = `Buy a ${tpl.name} for ${s.price}g (you carry ${(p.gold | 0)}g)`;
      b.onclick = () => {
        const r = window.Game.stableBuyHorse(s.kind);
        if (r && r.ok) toast(`🐴 ${r.name} trusts you!${r.alongside ? " It walks beside you." : " Rested at the stable."} (counts as tamed)`);
        else toast("⚠️ " + ((r && r.msg) || "Couldn't buy."));
        renderStable(building); updateHUD();
      };
      row.appendChild(b);
      list.appendChild(row);
    }
    const sellH = document.createElement("div");
    sellH.className = "tsec";
    sellH.textContent = "💰 Sell your horses (price grows with level)";
    list.appendChild(sellH);
    let horses = [];
    try { horses = (p.tames || []).filter(t => t && window.Game.isHorseKind(t.kind)); } catch (e) { }
    if (!horses.length) {
      const e2 = document.createElement("div");
      e2.className = "invempty";
      e2.textContent = (p.tames && p.tames.length) ? "No steeds to sell — the market only trades horses and hounds, never other mounts or beasts." : "No beasts yet — tame or buy one first.";
      list.appendChild(e2);
    }
    for (const t of horses) {
      const row = document.createElement("div");
      row.className = "trow";
      const nm = document.createElement("span");
      nm.className = "tn";
      let where = t.stabled ? "stabled" : "with you";
      if (t.riderId) where += " · lent out";
      if (p.activeMountId === t.id && p.mounted) where += " · ridden";
      let price = 0;
      try { price = window.Game.stableSellPrice(t); } catch (e) { }
      nm.textContent = `🐴 ${t.name} (lv ${t.lv} ${t.kind}) · HP ${Math.ceil(t.hp)}/${t.maxHp} · ATK ${t.atk} · DEF ${t.def} · SPD ${t.spd} · ${where} — sells for ${price}g`;
      row.appendChild(nm);
      const b = document.createElement("button");
      b.textContent = `Sell — ${price}g`;
      b.title = `Sell ${t.name} for ${price}g (level-based; history keeps counting)`;
      b.onclick = () => {
        if (!confirm(`Sell ${t.name} (lv ${t.lv}) for ${price}g?`)) return;
        const r = window.Game.stableSellHorse(t.id);
        if (r && r.ok) toast(`💰 Sold ${r.name} for ${r.price}g! (still counts as tamed)`);
        else toast("⚠️ " + ((r && r.msg) || "Couldn't sell."));
        if (stableSelId === t.id) stableSelId = null;
        renderStable(building); updateHUD();
      };
      row.appendChild(b);
      list.appendChild(row);
    }
  }
  // ---------- death ----------
  function showDeath(cause) {
    $("deathModal").hidden = false;
    const p = window.Game.G.player;
    $("deathInfo").textContent = `Fell at ${p.x.toFixed(0)}, ${p.y.toFixed(0)} · lv ${p.lv} · 🛡️ ${p.def} DEF / ${p.sdef != null ? p.sdef : p.def} SDEF · ❤️ ${p.maxHp} max HP · kills ${p.kills}`;
    // last blows: per-hit audit from the incoming-hit log (attacker + level +
    // element + damage), newest last — so a gang death reads as what it was.
    try {
      const box = $("deathHits");
      if (box) {
        box.innerHTML = "";
        const hits = (p.recentHits || []).slice(-8);
        if (!hits.length) box.hidden = true;
        else {
          box.hidden = false;
          const title = document.createElement("div");
          title.textContent = "Last blows:";
          title.style.fontWeight = "900";
          box.appendChild(title);
          for (const h of hits) {
            const row = document.createElement("div");
            const who = h.lv ? `${h.src} (lv.${h.lv})` : String(h.src || "the wilds");
            const how = h.magic ? (h.el ? `${h.el} spell` : "spell") : "strike";
            row.textContent = `• ${who} — ${how}: ${h.dmg}`;
            box.appendChild(row);
          }
        }
      }
    } catch (e) { }
    try {
      const dc = $("deathCause");
      if (dc) { dc.textContent = cause || ""; dc.hidden = !cause; }
      else if (cause) $("deathInfo").textContent += ` — ${cause}`;
    } catch (e) { }
    // the wake-up button names the bound respawn hearth when one is set
    try {
      const rb = $("respawnBtn");
      if (rb) {
        let nm = null;
        try {
          const pd = (window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.dim) || "surf";
          nm = window.Game.respawnHearthName ? window.Game.respawnHearthName(pd) : null;
          // v21: unbound hell deaths wake on last safe ground, not the tower.
          if (pd === "heaven") {
            let b2 = null;
            try { b2 = window.Game.getRespawnHearth ? window.Game.getRespawnHearth() : null; } catch (e5) { }
            if (!(b2 && b2.dim === "heaven")) nm = "holy ground";
          }
          if (pd === "hell") {
            let b = null;
            try { b = window.Game.getRespawnHearth ? window.Game.getRespawnHearth() : null; } catch (e4) { }
            if (!(b && b.dim === "hell")) nm = "safe ground";
          }
        } catch (e2) { }
        if (nm && nm !== "the starting town") rb.textContent = `🏠 Wake up at ${nm}`;
        else rb.textContent = "Wake up in town";
      }
    } catch (e) { }
  }
  async function respawn() {
    const p = window.Game.G.player;
    $("deathModal").hidden = true;
    if (p.inDungeon) { try { await window.Game.exitDungeon(); } catch (e) { p.inDungeon = null; } }
    // Land on proper town ground (portal plaza / outdoor walkable) — the old
    // hardcoded 2.5,4.5 can sit inside a typed spawn town's walls or hall.
    // Wakes at the bound home hearth's portal when one is set, else the
    // starting town, exactly like before.
    // v18: wake in the dimension you died in — hell deaths wake at the
    // hell tower (a surf hearth is another world away, not a walk).
    let rname = null;
    try {
      let rx = 0, ry = 0;
      let hellWake = false;
      try {
        if (p.dim === "hell") {
          hellWake = true;
          // v21: a bound hell hearth wakes here first; else last SAFE hell
          // ground (not the corpse — posByDim rewrites on every save, so it
          // trails the death spot); else legacy posByDim; else the tower.
          // safeTownLanding walks it off lava either way.
          let bound = null;
          try { bound = window.Game.getRespawnHearth ? window.Game.getRespawnHearth() : null; } catch (e3) { }
          if (bound && bound.dim === "heaven") { rx = bound.x; ry = bound.y; rname = bound.name; }
          else if (bound && bound.dim === "hell") { rx = bound.x; ry = bound.y; rname = bound.name; }
          else if (p.lastSafeHell && isFinite(+p.lastSafeHell.x) && isFinite(+p.lastSafeHell.y)) {
            rx = +p.lastSafeHell.x; ry = +p.lastSafeHell.y;
            rname = "your last safe ground";
          }
          else {
            if (p.posByDim && p.posByDim.hell && isFinite(+p.posByDim.hell.x)) {
              rx = +p.posByDim.hell.x; ry = +p.posByDim.hell.y;
              rname = "your last hell ground";
            }
            else if (window.Hell && window.Hell.HELL_TOWERS && window.Hell.HELL_TOWERS[0]) { rx = window.Hell.HELL_TOWERS[0].x; ry = window.Hell.HELL_TOWERS[0].y; rname = "the hell tower"; }
            else rname = "the hell tower";
          }
        } else if (p.dim === "heaven") {
          const rh2 = window.Game.getRespawnHearth ? window.Game.getRespawnHearth() : null;
          if (rh2 && rh2.dim === "heaven") { rx = rh2.x; ry = rh2.y; rname = rh2.name; }
          else { rx = 0; ry = 0; rname = "the radiant pantheon"; }
        } else {
          const rh = window.Game.getRespawnHearth ? window.Game.getRespawnHearth() : null;
          if (rh && rh.dim !== "hell" && rh.dim !== "heaven") { rx = rh.x; ry = rh.y; rname = rh.name; }
        }
      } catch (e2) { }
      const s = await window.Game.safeTownLanding(rx, ry);
      p.x = s.x; p.y = s.y;
    } catch (e) { p.x = 2.5; p.y = 4.5; }
    try { await window.Game.ensureChunks(); } catch (e) { }
    p.hp = Math.round(p.maxHp * 0.7); p.mp = p.maxMp;
    // the healer cleanses you: no waking up still burning/poisoned to death
    p.burnUntil = 0; p.slowUntil = 0; p.burnTick = 0;
    try { if (window.Status) window.Status.cureAll(p); } catch (e) { }
    p.gold = Math.max(0, p.gold - 10);
    for (const id of (p.party || [])) {
      const n = window.World._mem.npcs.get(id);
      if (n && n.hp <= 0) {
        n.hp = Math.round(n.maxHp * 0.5);
        try {
          const s = window.Game.nearWalkable
            ? window.Game.nearWalkable(p.x + 1, p.y)
            : (window.Game.walkable(p.x + 1, p.y) ? { x: p.x + 1, y: p.y } : { x: p.x, y: p.y });
          n.x = s.x; n.y = s.y;
        } catch (e) { n.x = p.x + 1; n.y = p.y; }
      }
    }
    for (const t of (p.tames || [])) {
      // the fallen stir, but the lodge keeps whoever it kept — no flag flips
      if (t && !(t.hp > 0)) { t.hp = Math.round(t.maxHp * 0.5); t.mp = t.maxMp; t.inParty = !t.stabled; }
    }
    // one saddle after waking, too — lodge anything left roaming
    try { if (window.Game && window.Game.enforceMountRules) window.Game.enforceMountRules(p); } catch (e) { }
    // living members regroup at the respawn point too (clears stale dungeon
    // targets so they don't chase phantoms or stay behind)
    try { window.Game.summonParty({ quiet: true }); } catch (e) { }
    try { await window.Game.refreshNpcCache(); } catch (e) { }
    try { window.Sfx.heal(); } catch (e) { }
    updateHUD();
    try { if (rname) toast(`🏠 You wake at ${rname}. (−10 gold)`, 3500); } catch (e2) { }
    // Angel of Life beacon: an ally's angel lit a landing light — offer the trip.
    try {
      const beacons = window.Game && window.Game.G ? window.Game.G.angelBeacons : null;
      if (beacons && beacons.length) {
        const nowB = performance.now();
        const live = beacons.filter(b => b && b.until > nowB);
        if (live.length) {
          const b = live[0];
          if (window.confirm("👼 An ally's Angel of Life burns nearby — teleport to their side?")) {
            try { p.x = b.x; p.y = b.y; await window.Game.ensureChunks(); } catch (e3) { p.x = b.x; p.y = b.y; }
            try { toast("👼 Borne on wings to your ally's side!", 3500); } catch (e3) { }
            try { updateHUD(); } catch (e3) { }
          }
        }
      }
    } catch (e2) { }
    try { await window.Game.saveGame(true); } catch (e) { }
  }

 // ---------- way-down portal (multi-level dungeons) ----------
  // ---------- delve floor travel: entry menu, way-down portal, entry stairs ----------
  // One modal, three doors. Every list is built from the LOCAL hero's
  // dungeonFloors map, so fellow travelers can only pick floors THEY earned.
  function openDungeonTravel(o) {
    try {
      const p = window.Game.G.player;
      if (!p || !o || !o.baseId) return;
      const mode = o.mode, baseId = o.baseId, name = o.name || "Delve";
      const depth0 = o.depth0 || 1, current = o.current || 0;
      const max = Math.max(1, o.max | 0 || 1);
      // Delves end: the god-delve at 5, ordinary delves at a deterministic
      // 12-15. Never list floors past the bottom.
      const end = Math.max(1, o.end | 0 || max);
      const cap = Math.min(max, end);
      const atBottom = (mode === "portal" || mode === "stairs") && current >= end;
      const G = window.Game;
      const effOf = (f) => { try { return G.dungeonFloorEff ? G.dungeonFloorEff(depth0, f) : ((depth0 | 0 || 1) + f - 1); } catch (e) { return f; } };
      const bossOf = (f) => { try { return G.bossLevelFor ? G.bossLevelFor(effOf(f)) : effOf(f) * 2; } catch (e) { return effOf(f) * 2; } };
      $("dungeonTravelTitle").textContent = mode === "entry" ? `🕳️ ${name} — choose your depth`
        : mode === "portal" ? `🌀 ${name} — level ${current}`
        : `🪜 Entry stairs — level ${current} of ${name}`;
      $("dungeonTravelDesc").textContent = mode === "entry"
        ? `You have charted ${cap} floor${cap === 1 ? "" : "s"} of this delve${end <= cap ? ` — it bottoms out at level ${end}` : ""}. Pick where to descend — every floor down hits harder and pays more.`
        : mode === "portal"
          ? (atBottom
            ? `You stand at the BOTTOM (depth ${effOf(current)}). Step through to daylight — the portal pays the delve's 🩸 Hell Fragment (no boss kill needed, one per delve).`
            : `You stand on depth ${effOf(current)} of ${end} (bottom: level ${end}). The way down is watched — the next floor's boss may already be stirring. Revisit any charted floor, push deeper, or climb out with what you carry.`)
          : (atBottom
            ? `The entry stairs remember every floor you charted — but only the bottom portal pays the delve's 🩸 Hell Fragment.`
            : `The entry stairs remember every floor you charted. Climb back to daylight, or step to a visited floor.`);
      const list = $("dungeonTravelList");
      list.innerHTML = "";
      for (let f = 1; f <= cap; f++) {
        const b = document.createElement("button");
        const here = (mode !== "entry" && f === current);
        b.textContent = here ? `📍 Level ${f} — you are here` : `Level ${f} · depth ${effOf(f)} · boss ~lv${bossOf(f)}`;
        b.disabled = !!here;
        b.title = here ? "You are standing on this floor" : `Travel to level ${f} (depth ${effOf(f)})`;
        if (!here) b.onclick = ((ff) => () => { closeDungeonTravel(); try { window.Game.travelDungeonTo(baseId, ff); } catch (e) { } })(f);
        list.appendChild(b);
      }
      if (mode === "portal") {
        // past the bottom there is no deeper dark to push into
        if (cap < end) {
          const nd = document.createElement("button");
          nd.textContent = `🌀 Descend to level ${cap + 1} — NEW depth ${effOf(cap + 1)} · boss ~lv${bossOf(cap + 1)}`;
          nd.title = "Push past your best into uncharted dark";
          nd.onclick = () => { closeDungeonTravel(); try { window.Game.travelDungeonTo(baseId, cap + 1); } catch (e) { } };
          list.appendChild(nd);
        }
        const sf = document.createElement("button");
        if (atBottom) {
          sf.textContent = "🩸 Step through to the surface — claim the Hell Fragment";
          sf.title = "Leave the delve via the final portal (pays the delve's one Hell Fragment)";
          sf.onclick = () => { closeDungeonTravel(); try { window.Game.exitDungeonViaPortal(); } catch (e) { } };
        } else {
          sf.className = "ghost"; sf.textContent = "🪜 Return to surface";
          sf.onclick = () => { closeDungeonTravel(); try { window.Game.exitDungeon(); } catch (e) { } };
        }
        list.appendChild(sf);
      } else if (mode === "stairs") {
        const sf = document.createElement("button");
        sf.textContent = "🪜 Return to surface";
        sf.title = "Climb back into daylight with what you carry";
        sf.onclick = () => { closeDungeonTravel(); try { window.Game.exitDungeon(); } catch (e) { } };
        list.appendChild(sf);
      }
      $("dungeonTravelModal").hidden = false;
    } catch (e) { }
  }
  function closeDungeonTravel() { try { $("dungeonTravelModal").hidden = true; } catch (e) { } }
  // entry mouth, revisited: offer the charted depths (each hero's own map).
  async function openDungeonEntry(poi) {
    try {
      const G = window.Game;
      const baseId = G.dungeonBaseOf(poi.dungeonId);
      const bc = G.dungeonBaseCoords(baseId);
      const d = await window.World.getDungeon(baseId, bc.cx, bc.cy, 1);
      const p = G.G.player;
      const max = G.unlockedDungeonMax(p, baseId);
      if (!(max >= 1)) { try { await G.enterDungeon(poi.dungeonId); } catch (e) { } return; }
      openDungeonTravel({ mode: "entry", baseId, name: (d && d.name) || "Delve", depth0: (d && d.depth) || 1, current: 0, max, end: G.delveEndLevel(baseId) });
    } catch (e) { }
  }
  function openPortal() {
    try {
      const G = window.Game.G, p = G && G.player;
      if (!p || !p.inDungeon || !G.dungeon) return;
      try { window.Entities.ensureProgression(p); } catch (e) { }
      const baseId = window.Game.dungeonBaseOf(G.dungeon.baseId || p.inDungeon);
      const max = Math.max(window.Game.unlockedDungeonMax(p, baseId), (p.dungeonLevel | 0) || 1);
      openDungeonTravel({ mode: "portal", baseId, name: G.dungeon.name || "Dungeon", depth0: G.dungeon.depth || 1, current: (p.dungeonLevel | 0) || 1, max, end: window.Game.delveEndLevel(baseId) });
    } catch (e) { }
  }
  function openStairs() {
    try {
      const G = window.Game.G, p = G && G.player;
      if (!p || !p.inDungeon || !G.dungeon) return;
      try { window.Entities.ensureProgression(p); } catch (e) { }
      const baseId = window.Game.dungeonBaseOf(G.dungeon.baseId || p.inDungeon);
      const max = Math.max(window.Game.unlockedDungeonMax(p, baseId), (p.dungeonLevel | 0) || 1);
      openDungeonTravel({ mode: "stairs", baseId, name: G.dungeon.name || "Dungeon", depth0: G.dungeon.depth || 1, current: (p.dungeonLevel | 0) || 1, max, end: window.Game.delveEndLevel(baseId) });
    } catch (e) { }
  }
  function closePortal() { try { $("portalModal").hidden = true; } catch (e) { } closeDungeonTravel(); }

 // ---------- pause menu + save slots (Esc) ----------
  function fmtSlotTime(ts) { try { return ts ? new Date(ts).toLocaleString() : ""; } catch (e) { return ""; } }
  function slotDesc(info) {
    if (!info || !info.player) return "empty — no save yet";
    const p = info.player;
    return (p.name || "Wanderer") + " · lv " + (p.lv || 1) + " · 🪙 " + (p.gold | 0) + " · " + fmtSlotTime(info.time);
  }
  // Reincarnate one slot: creator + confirm prompts run here so the flow
  // works identically inline (blocked popup) and in a world window.
  async function reincarnateFlow(slot) {
    slot = String(slot || "1");
    if ($("loadingScreen") && !$("loadingScreen").hidden) return;
    let cur = null;
    try { cur = await window.Game.loadSave(slot); } catch (e) { cur = null; }
    const curPlayer = cur && cur.player;
    const who = curPlayer ? ((curPlayer.name || "hero") + " (lv " + (curPlayer.lv || 1) + ")") : "";
    const picked = await openHeroCreator({
      title: `Reincarnate slot ${slot}${who ? " — " + who : ""}?`,
      sub: "Same world, fresh lv1 hero — new name, new face. The old hero is gone; the towns stay.",
      initialName: (curPlayer && curPlayer.name) || "Wanderer",
      appearance: (curPlayer && curPlayer.appearance) || null,
      tint: (curPlayer && curPlayer.tint) || "#4da3ff",
      gender: (curPlayer && curPlayer.gender) || "male",
      confirmLabel: "♻️ Rebirth",
    });
    if (!picked) return;
    const clean = picked.name;
    if (!confirm(`Rebirth as ${clean} in slot ${slot}? The old hero (items, gold, party, quests) is gone — the world stays.`)) return;
    showLoading("Kindling a new life...");
    try {
      setLoading(50, "A new soul stirs...");
      const loaded = await window.Game.reincarnateSlot(slot, clean, picked.appearance, picked.tint, picked.gender);
      if (!loaded) throw new Error("reincarnate failed");
      setLoading(80, "Opening the gates...");
      if ($("titleScreen")) $("titleScreen").hidden = true;
      await window.Game.startPlaying();
      hideLoading();
      toast(`♻️ ${clean} opens new eyes on a familiar world. (Slot ${slot})`, 5000);
    } catch (e) {
      console.error(e);
      hideLoading();
      toast("Reincarnation faltered — try again.", 4000);
    }
    await renderTitleSlots();
    try { await renderMenuSlots(); } catch (e2) { }
    refreshTitleStatus();
  }
  function slotRow(info, opts) {
    opts = opts || {};
    const d = document.createElement("div");
    d.className = "slotrow" + (opts.current ? " current" : "") + (opts.picked ? " picked" : "");
    if (opts.onPick) {
      d.classList.add("pickable");
      d.title = (d.title ? d.title + " — " : "") + "Click to select this slot";
      d.onclick = () => { try { opts.onPick(info.slot); } catch (e) { } };
    }
    const nm = document.createElement("span");
    nm.className = "sname";
    const b = document.createElement("b");
    b.textContent = "Slot " + info.slot + (opts.current ? " ●" : "");
    nm.appendChild(b);
    const sub = document.createElement("div");
    sub.className = "ssub";
    sub.textContent = slotDesc(info);
    nm.appendChild(sub);
    d.appendChild(nm);
    const load = document.createElement("button");
    load.textContent = opts.current ? "Reload" : "Load";
    load.disabled = !info.player;
    load.title = info.player ? "Play this slot" : "Empty slot";
    load.onclick = () => { loadSlotFlow(info.slot); };
    d.appendChild(load);
    // export: download this slot as one JSON backup file
    const exp = document.createElement("button");
    exp.textContent = "📤";
    exp.className = "ghost";
    exp.disabled = !info.player;
    exp.title = info.player ? `Export slot ${info.slot} to a backup file (move to another device, keep safe)` : "Empty slot";
    exp.onclick = () => exportSlotToFile(info.slot);
    d.appendChild(exp);
    // import: read a backup file into this slot (overwrites)
    const imp = document.createElement("button");
    imp.textContent = "📥";
    imp.className = "ghost";
    imp.title = `Import a backup file into slot ${info.slot} (overwrites what's there now)`;
    imp.onclick = () => importSlotFromFile(info.slot);
    d.appendChild(imp);
    // reincarnate: same world, fresh lv1 hero (new name, no items/spells/progress)
    const re = document.createElement("button");
    re.textContent = "♻️";
    re.className = "ghost";
    re.disabled = !info.player;
    re.title = info.player ? "Reincarnate: keep this world's towns/chunks, restart as a lv1 hero with a new name" : "Empty slot";
    re.onclick = async () => {
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      await reincarnateFlow(info.slot);
    };
    d.appendChild(re);
    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.className = "danger";
    del.disabled = !info.player;
    del.title = info.player ? ("Delete slot " + info.slot + " (and its world) forever") : "Empty slot";
    del.onclick = async () => {
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      const who = info.player ? ((info.player.name || "hero") + " (lv " + (info.player.lv || 1) + ")") : "";
      if (!confirm("Delete slot " + info.slot + (who ? " — " + who : "") + "? Its world is erased forever.")) return;
      const cur = window.Game.currentSlot ? window.Game.currentSlot() : "1";
      await window.Game.deleteSlot(info.slot);
      if (cur === String(info.slot) && window.Game.G && window.Game.G.mode === "playing") {
        await quitToTitle(false);
      } else {
        await renderTitleSlots();
        await renderMenuSlots();
        refreshTitleStatus();
      }
    };
    d.appendChild(del);
    return d;
  }
  // ---------- save export / import (one JSON file per slot) ----------
  function mpActive() { try { return !!(window.MP && window.MP.M && window.MP.M.active); } catch (e) { return false; } }
  async function exportSlotToFile(slot) {
    slot = String(slot || "1");
    if (mpActive()) { toast("Leave the multiplayer channel first — exports cover singleplayer slots.", 4000); return; }
    if (!window.World || !window.World.exportSlotData) { toast("Export isn't ready — reload the page.", 4000); return; }
    try {
      toast(`📤 Packing slot ${slot}…`);
      const payload = await window.World.exportSlotData(slot);
      if (!payload) { toast(`Slot ${slot} is empty — nothing to export.`, 4000); return; }
      if (payload.error === "world-too-large") { toast(`Slot ${slot} is too large to export as one file (${payload.chunks} chunks) — try again after exploring less, or delete the slot's farthest reaches.`, 7000); return; }
      let json = null;
      try { json = JSON.stringify(payload); }
      catch (e) { toast("Export failed: that save is too large to stringify (out of memory).", 6000); return; }
      if (json.length > 150 * 1024 * 1024) { toast("Export failed: packed save exceeds 150 MB.", 6000); return; }
      const blob = new Blob([json], { type: "application/json" });
      const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(/:/g, "");
      const hero = ((payload.save && payload.save.player && payload.save.player.name) || "hero").replace(/[^\w\- ]+/g, "").slice(0, 16) || "hero";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `emberhold-slot${slot}-${hero}-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) { } }, 5000);
      toast(`📤 Slot ${slot} exported (${(blob.size / 1024).toFixed(0)} KB) — keep the file somewhere safe.`, 5000);
    } catch (e) { try { console.error(e); } catch (e2) { } toast("Export failed — try again.", 4000); }
  }
  // ---------- multiplayer channel export (one JSON file per world) ----------
  // Unlike slot exports this is allowed mid-channel: when the open channel
  // is the one being packed, the hero record is flushed first so the file
  // holds current progress.
  async function exportChannelToFile(channelId) {
    channelId = String(channelId || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
    if (!/^[A-Z0-9]{6,16}$/.test(channelId)) { toast("That channel code looks wrong.", 4000); return; }
    if (!window.World || !window.World.exportChannelData) { toast("Export isn't ready — reload the page.", 4000); return; }
    try {
      try {
        if (window.MP && window.MP.M && window.MP.M.active && window.MP.M.channelId === channelId && window.MP.saveNow) await window.MP.saveNow();
      } catch (e) { }
      toast(`📤 Packing world ${channelId}…`);
      const payload = await window.World.exportChannelData(channelId);
      if (!payload) { toast(`World ${channelId} is empty on this machine — nothing to export.`, 5000); return; }
      if (payload.error === "world-too-large") { toast(`World ${channelId} is too large to export as one file (${payload.chunks} chunks) — try again after exploring less.`, 7000); return; }
      let json = null;
      try { json = JSON.stringify(payload); }
      catch (e) { toast("Export failed: that save is too large to stringify (out of memory).", 6000); return; }
      if (json.length > 150 * 1024 * 1024) { toast("Export failed: packed save exceeds 150 MB.", 6000); return; }
      const blob = new Blob([json], { type: "application/json" });
      const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(/:/g, "");
      const firstHero = payload.heroes && payload.heroes[0] && payload.heroes[0].save && payload.heroes[0].save.player;
      const hero = ((firstHero && firstHero.name) || "hero").replace(/[^\w\- ]+/g, "").slice(0, 16) || "hero";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `emberhold-channel${channelId}-${hero}-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) { } }, 5000);
      const who = (payload.heroes || []).length > 1 ? `(${(payload.heroes || []).length} heroes) ` : "";
      toast(`📤 World ${channelId} ${who}exported (${(blob.size / 1024).toFixed(0)} KB) — keep the file somewhere safe.`, 5000);
    } catch (e) { try { console.error(e); } catch (e2) { } toast("Export failed — try again.", 4000); }
  }
  function pickBackupFile() {
    return new Promise((resolve) => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".json,application/json";
      inp.onchange = () => resolve(inp.files && inp.files[0] ? inp.files[0] : null);
      inp.oncancel = () => resolve(null);
      // cancel event support varies; the timeout below covers dismissal too
      setTimeout(() => { try { if (!inp.files || !inp.files.length) resolve(null); } catch (e) { } }, 60000);
      try { inp.click(); } catch (e) { resolve(null); }
    });
  }
  async function importSlotFromFile(slot) {
    slot = String(slot || "1");
    if (mpActive()) { toast("Leave the multiplayer channel first — imports target singleplayer slots.", 4000); return; }
    if (!window.World || !window.World.importSlotData) { toast("Import isn't ready — reload the page.", 4000); return; }
    if ($("loadingScreen") && !$("loadingScreen").hidden) return;
    let file = null;
    try { file = await pickBackupFile(); } catch (e) { file = null; }
    if (!file) return;
    let payload = null;
    try {
      const text = await file.text();
      payload = JSON.parse(text);
    } catch (e) { toast("Can't read that file — pick an Emberhold slot-backup (.json).", 5000); return; }
    const heroName = payload && payload.save && payload.save.player && payload.save.player.name;
    const heroLv = payload && payload.save && payload.save.player && payload.save.player.lv;
    let occupied = null;
    try { occupied = await window.World.loadSlotData(slot); } catch (e) { occupied = null; }
    if (occupied && occupied.player) {
      const who = (occupied.player.name || "hero") + " (lv " + (occupied.player.lv || 1) + ")";
      if (!confirm(`Import into slot ${slot}? It currently holds ${who} — importing replaces that world${heroName ? ` with ${heroName} (lv ${heroLv || 1})` : ""}. This can't be undone.`)) return;
    } else if (!confirm(`Import into slot ${slot}${heroName ? ` as ${heroName} (lv ${heroLv || 1})` : ""}?`)) return;
    showLoading("Unpacking backup...");
    try {
      setLoading(25, "Reading the backup...");
      const res = await window.World.importSlotData(slot, payload);
      if (!res || !res.ok) {
        hideLoading();
        toast(`Import failed: ${(res && res.error) || "bad file"}`, 6000);
        return;
      }
      setLoading(70, "Waking villagers...");
      try { await renderTitleSlots(); } catch (e) { }
      try { await renderMenuSlots(); } catch (e) { }
      try { refreshTitleStatus(); } catch (e) { }
      // imported into the world we're standing in: show it at once instead of
      // leaving the stale pre-import world on screen (and never save-first —
      // that would write the old world straight over the import).
      let reloaded = false;
      try {
        const playing = !!(window.Game && window.Game.G && window.Game.G.mode === "playing" && window.Game.G.player);
        const cur = window.Game.currentSlot ? window.Game.currentSlot() : "1";
        if (playing && String(cur) === String(slot)) {
          setLoading(85, "Opening the gates...");
          const d = await window.Game.loadSlot(slot);
          if (d) { await window.Game.startPlaying(); reloaded = true; }
        }
      } catch (e) { try { console.error(e); } catch (e2) { } }
      hideLoading();
      if ($("titleScreen") && $("titleScreen").hidden === false) {
        // on the title screen: stay put, the slot row now shows the import
      } else if (!reloaded) {
        try { if ($("menuModal")) $("menuModal").hidden = true; } catch (e) { }
      }
      const c = res.counts || {};
      toast(`📥 Slot ${slot} now holds ${res.hero} — ${c.chunks | 0} map pieces, ${c.npcs | 0} villagers, ${c.dungeons | 0} delves.${reloaded ? " Welcome back." : " Load it to play."}`, 6000);
    } catch (e) {
      try { console.error(e); } catch (e2) { }
      try { hideLoading(); } catch (e3) { }
      toast("Import failed — the file may be corrupt.", 5000);
    }
  }
  // title-screen slot selection: clicking a save-file row picks the slot
  // that ✨ New game starts a fresh hero in (the old "Save to slot"
  // dropdown is gone); each row's Load button resumes its saved hero.
  // Defaults to the first empty slot, else the most recent save.
  let titleSlotSel = "1";
  // Default selection = first empty slot (so ✨ New game is safe first
  // click). Starting over an occupied slot still prompts before
  // overwriting, so picking a filled slot by accident is safe — the
  // confirm dialog catches it.
  function defaultTitleSlot(slots) {
    try {
      const empty = (slots || []).find((s) => !s.player);
      if (empty) return String(empty.slot);
      const used = (slots || []).filter((s) => s.player).sort((a, b) => (b.time || 0) - (a.time || 0));
      if (used.length) return String(used[0].slot);
    } catch (e) { }
    try { if (window.Game.currentSlot) return String(window.Game.currentSlot()); } catch (e2) { }
    return "1";
  }
  async function renderTitleSlots() {
    const ctn = $("titleSlots");
    if (!ctn) return;
    ctn.innerHTML = "";
    let slots = [];
    try { slots = await window.Game.listSlots(); } catch (e) { slots = []; }
    const cur = window.Game.currentSlot ? window.Game.currentSlot() : "1";
    for (const info of slots) ctn.appendChild(slotRow(info, {
      current: String(info.slot) === String(cur),
      picked: String(info.slot) === String(titleSlotSel),
      onPick: (s) => { titleSlotSel = String(s); renderTitleSlots(); },
    }));
    // the New game button acts on the selected slot — label it so.
    try { const nb = $("newBtn"); if (nb) nb.textContent = "✨ New game — Slot " + (titleSlotSel || "1"); } catch (e) { }
    try { fitTitle(); } catch (e) { }
  }
  async function renderMenuSlots() {
    const ctn = $("menuSlots");
    if (!ctn) return;
    ctn.innerHTML = "";
    let slots = [];
    try { slots = await window.Game.listSlots(); } catch (e) { slots = []; }
    const cur = window.Game.currentSlot ? window.Game.currentSlot() : "1";
    if ($("menuSlot")) $("menuSlot").textContent = cur === "P" ? "· Practice grounds" : "· Slot " + cur;
    for (const info of slots) ctn.appendChild(slotRow(info, { current: String(info.slot) === String(cur) }));
  }
  // ---------- title tabs (singleplayer / multiplayer / practice) ----------
  // Singleplayer is always the landing tab; multiplayer only takes over for
  // an actual invite link (#host=...). No sticky preference: returning to
  // the title must not strand players on a side tab.
  function selectTitleTab(which) {
    const panes = { sp: "paneSP", mp: "paneMP", pr: "panePR" };
    const tabs = { sp: "tabSP", mp: "tabMP", pr: "tabPR" };
    for (const k of Object.keys(panes)) {
      try { if ($(panes[k])) $(panes[k]).hidden = k !== which; } catch (e) { }
      try { if ($(tabs[k])) $(tabs[k]).className = k === which ? "" : "ghost"; } catch (e) { }
    }
    if (which === "mp") { try { renderMpWorlds(); } catch (e) { } }
    if (which === "pr") { try { refreshPracticeStatus(); } catch (e) { } }
    try { fitTitle(); } catch (e) { }
  }
  // ---------- practice grounds (consequence-free build lab, slot P) ----------
  // Title fit: shrink the whole title card (CSS zoom) just enough that it
  // fits the viewport with no scrolling. fitTitle() is called whenever the
  // title shows, its content changes, or the viewport resizes.
  function fitTitle() {
    try {
      const t = $("titleScreen");
      if (!t || t.hidden) return;
      const card = t.querySelector(".card");
      if (!card) return;
      // reset first so scrollHeight measures the true content height
      card.style.zoom = ""; card.style.maxHeight = ""; card.style.overflowY = "";
      // desktop keeps its full-size title + native scroll; auto-fit is for
      // touch phones and small/short viewports only.
      let small = false;
      try {
        small = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
          Math.min(window.innerWidth, window.innerHeight) < 700 || window.innerHeight < 650;
      } catch (e2) { small = true; }
      if (!small) return;
      const avail = window.innerHeight * 0.94 - 16;
      const need = card.scrollHeight;
      if (need > avail && need > 0) {
        const z = avail / need;
        // zoom scales rendering but not this engine's scrollbox math, so a
        // zoomed card must stop being a scroll container itself — else it
        // keeps scrolling inside a shrunken box. Below 0.5 it would be
        // unreadable anyway: leave native scrolling instead of a cut-off.
        if (z >= 0.5) {
          card.style.zoom = String(Math.round(z * 100) / 100);
          card.style.maxHeight = "none";
          card.style.overflowY = "visible";
        }
      }
    } catch (e) { }
  }
  // A separate world (slot "P", invisible to the 1-5 save lists) where the
  // hero sets their level, learns anything and grabs any gear — then walks
  // out and fights for real. Nothing here touches slots 1-5.
  function isPractice() {
    try { return !!(window.Game && window.Game.G && window.Game.G.player && window.Game.G.player.practice); } catch (e) { return false; }
  }
  function togglePractice(force) {
    const m = $("practiceModal");
    if (!m) return;
    const show = force !== undefined ? force : m.hidden;
    if (show) {
      if (!window.Game || !window.Game.G || window.Game.G.mode !== "playing" || !window.Game.G.player) return;
      // never open mid-switch: while the loading screen is up the world
      // underneath may be a different slot than the checked player (T mashed
      // during a pause-menu slot load used to strand the setup open over a
      // real singleplayer hero).
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      if (!isPractice()) { toast("Practice setup lives in practice worlds — title screen → 🛠️ Practice."); return; }
      try { toggleMenu(false); } catch (e) { }
      renderPractice();
      m.hidden = false;
    } else {
      m.hidden = true;
    }
    try { for (const k in window.Game.G.keys) window.Game.G.keys[k] = false; window.Game.G.mouse.down = false; } catch (e) { }
  }
  function practiceStripHotbar(p, abId) {
    try {
      if (Array.isArray(p.hotbar)) p.hotbar.forEach((s, i) => { if (s && s.kind === "ability" && s.id === abId) p.hotbar[i] = null; });
    } catch (e) { }
  }
  function practiceLearnTechQuiet(p, id) {
    if (!isPractice()) return false;
    let T = null;
    try { T = (window.CFG.TECHNIQUES || {})[id]; } catch (e) { }
    if (!T || !p || p.techniques.includes(id)) return false;
    p.techniques.push(id);
    if (T.active && T.abId) {
      if (!p.abilities.includes(T.abId)) p.abilities.push(T.abId);
      if (!p.unlocked.includes(T.abId)) p.unlocked.push(T.abId);
      try {
        // never into the Attack/Off-hand slot (both may be deliberately empty)
        const i = (window.Items && window.Items.firstFreeHotbarSlot) ? window.Items.firstFreeHotbarSlot(p) : (p.hotbar || []).findIndex(s => !s);
        if (i >= 0) p.hotbar[i] = { kind: "ability", id: T.abId };
      } catch (e) { }
    }
    return true;
  }
  function practiceUnlearnTech(p, id) {
    if (!isPractice()) return false;
    let T = null;
    try { T = (window.CFG.TECHNIQUES || {})[id]; } catch (e) { }
    if (!T || !p) return false;
    p.techniques = (p.techniques || []).filter(t => t !== id);
    if (T.active && T.abId) {
      p.abilities = (p.abilities || []).filter(a => a !== T.abId);
      p.unlocked = (p.unlocked || []).filter(a => a !== T.abId);
      practiceStripHotbar(p, T.abId);
      try { delete (p.spellPerks || {})[T.abId]; } catch (e) { }
    }
    return true;
  }
  function practiceResetStats(p, refund) {
    if (!p || !isPractice()) return 0;
    // refund=false: strip to base WITHOUT paying back into the pool (the
    // level-reset wipe — points vanish instead of being refunded).
    const payBack = refund !== false;
    let back = 0;
    try {
      let bonus = null;
      try { bonus = window.Entities.raceBonus(p.race || "human"); } catch (e) { bonus = null; }
      if (!p.stats || typeof p.stats !== "object") p.stats = window.Entities.defaultStats();
      for (const k of ["str", "end", "agi", "int", "cha", "luk", "for"]) {
        const cur = (typeof p.stats[k] === "number" ? p.stats[k] : 5) | 0;
        const target = 5 + ((bonus && bonus[k]) | 0);
        if (cur > target) {
          back += cur - target;
          p.stats[k] = target;
        } else if (cur < target) {
          // below base (old migrations) — normalize up for free, no refund
          p.stats[k] = target;
        }
      }
      if (back > 0 && payBack) p.statPoints = ((p.statPoints | 0) || 0) + back;
      window.Entities.ensureProgression(p);
      window.Entities.recalcDerived(p, true);
      window.Game.saveGame(true);
    } catch (e) { }
    try { window.UI.updateHUD(); renderPractice(); } catch (e) { }
    return back;
  }
  function practiceSetLevel(n) {
    const p = window.Game.G.player;
    if (!p || !isPractice()) return;
    n = Math.round(Number(n) || p.lv || 1);
    if (!isFinite(n)) n = p.lv || 1;
    n = Math.max(1, n);
    const d = n - (p.lv || 1);
    if (d !== 0) {
      p.lv = n; p.xp = 0;
      // stat points follow the practice level; skill points never come from
      // levels anymore — trees earn their own by use, even in practice.
      p.statPoints = Math.max(0, (p.statPoints | 0) + d * window.CFG.STAT_POINTS_PER_LEVEL);
      // resetting all the way back to 1 wipes the slate: attributes to base
      // + racial with NO refund and the pool to zero, so a fresh build starts
      // clean instead of inheriting a pumped hero or leftover points.
      if (n === 1 && d < 0) {
        try { practiceResetStats(p, false); } catch (e) { }
        try { p.statPoints = 0; } catch (e) { }
        try { toast("↩️ Level reset — stats wiped, no stat points left.", 3000); } catch (e) { }
      }
    }
    try { window.Entities.ensureProgression(p); } catch (e) { }
    try { window.Entities.recalcDerived(p, false); } catch (e) { }
    try { window.Game.saveGame(true); } catch (e) { }
    try { window.UI.updateHUD(); window.UI.updateHotbar(); } catch (e) { }
  }
  function renderPractice() {
    const p = window.Game.G.player;
    if (!p) return;
    // self-healing: a setup stranded open over a real world (e.g. T mashed
    // during a world switch) closes itself instead of showing live buttons.
    if (!isPractice()) { try { $("practiceModal").hidden = true; } catch (e) { } return; }
    try {
      if ($("practiceLvNow")) $("practiceLvNow").textContent = "Level " + (p.lv || 1) + " (+" + (p.statPoints | 0) + " stat)";
      try { if ($("practiceGoldNow")) $("practiceGoldNow").textContent = "💰 " + ((p.gold | 0) || 0).toLocaleString() + "g"; } catch (eGold) { }
      if ($("practiceLvInput") && document.activeElement !== $("practiceLvInput")) $("practiceLvInput").value = p.lv || 1;
      if ($("practiceDimNow")) $("practiceDimNow").textContent = (p.dim === "hell") ? "🔥 Hell" : (p.dim === "heaven") ? "🌅 Heaven" : "✨ Surface";
      if ($("practicePosNow")) $("practicePosNow").textContent = `📍 ${Math.round(p.x)}, ${Math.round(p.y)}`;
      // sparring roster: bosses by tier, then everything else A–Z (built once)
      try {
        const sel = $("practiceMobSel");
        if (sel && !sel.options.length) {
          const T = window.CFG.MOB_TEMPLATES || {};
          const BK = window.CFG.BOSS_KINDS || [];
          const ME = window.CFG.BOSS_MIN_EFF || {};
          const bosses = [], mobs = [];
          for (const k of Object.keys(T)) {
            if (!T[k] || !T[k].name) continue;
            if (T[k].boss || BK.indexOf(k) >= 0) bosses.push(k); else mobs.push(k);
          }
          const tierOf = (k) => (ME[k] || 1);
          bosses.sort((a, b) => (tierOf(a) - tierOf(b)) || String(T[a].name).localeCompare(String(T[b].name)));
          mobs.sort((a, b) => String(T[a].name).localeCompare(String(T[b].name)));
          const mk = (k, label) => { const o = document.createElement("option"); o.value = k; o.textContent = label; return o; };
          const g1 = document.createElement("optgroup"); g1.label = "👹 Bosses (tier · name)";
          for (const k of bosses) g1.appendChild(mk(k, `T${tierOf(k)} · ${T[k].name}`));
          // goddess has no template until the pantheon is visited — the
          // summoner plants it on demand, so list her anyway (T12 sorts last)
          try { if (!T.goddess) g1.appendChild(mk("goddess", "T12 · Goddess of Dawn")); } catch (eG) { }
          const g2 = document.createElement("optgroup"); g2.label = "🐾 Mobs";
          for (const k of mobs) g2.appendChild(mk(k, T[k].name));
          sel.appendChild(g1); sel.appendChild(g2);
        }
      } catch (e) { }
      const mlv = $("practiceMobLvInput");
      if (mlv && document.activeElement !== mlv) mlv.value = p.lv || 1;
      try { if ($("practiceGodBtn")) $("practiceGodBtn").textContent = "🛡️ Invincible: " + (p.invincible ? "ON" : "OFF"); } catch (eGod) { }
      const ax = $("practiceXInput"), ay = $("practiceYInput");
      if (ax && document.activeElement !== ax) ax.value = Math.round(p.x);
      if (ay && document.activeElement !== ay) ay.value = Math.round(p.y);
    } catch (e) { }
    // spells: every non-technique art, learnt ones solid
    try {
      const box = $("practiceSpells");
      if (box) {
        box.innerHTML = "";
        const ids = Object.keys(window.CFG.ABILITIES || {}).filter(id => {
          const a = window.CFG.ABILITIES[id];
          return a && a.kind !== "technique";
        }).sort((a, b) => String(window.CFG.ABILITIES[a].name).localeCompare(String(window.CFG.ABILITIES[b].name)));
        for (const id of ids) {
          const a = window.CFG.ABILITIES[id];
          const known = (p.abilities || []).includes(id);
          const b = document.createElement("button");
          b.textContent = (known ? "✓ " : "") + (a.name || id);
          if (!known) b.className = "ghost";
          b.title = (a.desc || "") + (known ? " — click to unlearn" : " — click to learn");
          b.onclick = ((aid) => () => {
            if ((p.abilities || []).includes(aid)) {
              p.abilities = p.abilities.filter(x => x !== aid);
              p.unlocked = (p.unlocked || []).filter(x => x !== aid);
              practiceStripHotbar(p, aid);
              try { delete (p.spellPerks || {})[aid]; } catch (e) { }
              toast("Unlearned " + window.CFG.ABILITIES[aid].name + ".", 2500);
            } else {
              let r = null;
              try { r = window.Items.learnSpell(p, aid); } catch (e) { r = null; }
              toast((r && r.msg) || ("Learned " + window.CFG.ABILITIES[aid].name + "."), 2500);
            }
            try { window.Entities.ensureProgression(p); window.Entities.recalcDerived(p, true); } catch (e) { }
            try { window.Game.saveGame(true); } catch (e) { }
            try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
          })(id);
          box.appendChild(b);
        }
      }
    } catch (e) { }
    // techniques: every deed-art, actives bind like spells
    try {
      const box = $("practiceTech");
      if (box) {
        box.innerHTML = "";
        const T = window.CFG.TECHNIQUES || {};
        const ids = Object.keys(T).sort((a, b) => String((T[a] && T[a].name) || a).localeCompare(String((T[b] && T[b].name) || b)));
        for (const id of ids) {
          const t = T[id];
          const known = (p.techniques || []).includes(id);
          const b = document.createElement("button");
          b.textContent = (known ? "✓ " : "") + (t.name || id) + (t.active ? "" : " (passive)");
          if (!known) b.className = "ghost";
          b.title = (t.hint || "") + (known ? " — click to unlearn" : " — click to learn");
          b.onclick = ((tid) => () => {
            if ((p.techniques || []).includes(tid)) {
              practiceUnlearnTech(p, tid);
              toast("Unlearned " + (window.CFG.TECHNIQUES[tid].name || tid) + ".", 2500);
            } else {
              practiceLearnTechQuiet(p, tid);
              toast("Deep Art learnt: " + (window.CFG.TECHNIQUES[tid].name || tid) + "!", 2500);
            }
            try { window.Entities.ensureProgression(p); window.Entities.recalcDerived(p, true); } catch (e) { }
            try { window.Game.saveGame(true); } catch (e) { }
            try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
          })(id);
          box.appendChild(b);
        }
      }
    } catch (e) { }
    // story items: hell fragments (with distinct delve-marks, or the forge
    // won't count them), Hell Sphere and Heavenly Sphere
    try {
      const sn = $("practiceStoryNow");
      if (sn) {
        let fragN = 0, hellSph = false, hevSph = false;
        try { fragN = window.Hell ? window.Hell.fragmentCount(p) : 0; } catch (e2) { }
        try { hellSph = window.Hell ? window.Hell.hasSphere(p) : false; } catch (e2) { }
        try { hevSph = window.Heaven ? window.Heaven.hasSphere(p) : false; } catch (e2) { }
        sn.textContent = `🩸 Fragments ${fragN}/12 · 🔮 Hell Sphere ${hellSph ? "✓" : "—"} · 🌅 Heavenly Sphere ${hevSph ? "✓" : "—"}`;
      }
    } catch (e) { }
    // gear dropdowns
    try {
      const ws = $("practiceWeaponSel"), as = $("practiceArmorSel");
      if (ws && !ws.options.length) {
        const items = window.Items.ITEMS || {};
        Object.keys(items).filter(id => items[id] && items[id].type === "equipment" && items[id].slot === "weapon")
          .sort((a, b) => String(items[a].name).localeCompare(String(items[b].name)))
          .forEach(id => { const o = document.createElement("option"); o.value = id; o.textContent = items[id].name; ws.appendChild(o); });
      }
      if (as && !as.options.length) {
        const items = window.Items.ITEMS || {};
        Object.keys(items).filter(id => items[id] && items[id].type === "equipment" && items[id].slot === "armor")
          .sort((a, b) => String(items[a].name).localeCompare(String(items[b].name)))
          .forEach(id => { const o = document.createElement("option"); o.value = id; o.textContent = items[id].name; as.appendChild(o); });
      }
    } catch (e) { }
  }
  async function refreshPracticeStatus() {
    const el = $("practiceStatus");
    if (!el) return;
    try {
      const d = await window.Game.loadSave("P");
      if (d && d.player) el.textContent = `${(d.player.name || "Hero")} (lv ${d.player.lv || 1}) waits in the grounds — enter to keep drilling. Reset wipes only practice.`;
      else el.textContent = "No practice world yet — enter to found one.";
    } catch (e) { el.textContent = ""; }
  }
  async function enterPracticeFlow() {
    if ($("loadingScreen") && !$("loadingScreen").hidden) return;
    // leaving a channel for the grounds: hosting ends the stream first,
    // joiners just drop presence (same prelude as loadSlotFlow)
    try {
      const mpOn = !!(window.MP && window.MP.M && window.MP.M.active);
      const hosting = mpOn && window.MP.isHost && window.MP.isHost();
      if (mpOn && hosting) { try { await window.MP.endHostStream(); } catch (e) { } }
      if (mpOn) await window.MP.leaveChannel(true);
    } catch (e) { }
    try { if ($("mpChatBox")) $("mpChatBox").hidden = true; } catch (e2) { }
    try { if ($("mpPresence")) $("mpPresence").hidden = true; } catch (e3) { }
    try {
      const cur = window.Game.currentSlot ? window.Game.currentSlot() : "1";
      if (window.Game.G && window.Game.G.player && window.Game.G.mode === "playing" && cur !== "P") await window.Game.saveGame(true);
    } catch (e) { }
    // Practice hero creator must come BEFORE the loading screen: the loader
    // (z-index 80) sits above the hero creator modal (z-index 70), so
    // prompting after showLoading() strands first-timers on "Raking the
    // sand..." behind an invisible dialog. Check for an existing grounds
    // first (fast kv read), prompt with the title visible, then load.
    let existing = null;
    try { existing = await window.Game.loadSave("P"); } catch (e) { existing = null; }
    if (!existing || !existing.player) {
      const picked = await promptHeroName("Name your practice hero:");
      if (!picked) { try { await renderTitleSlots(); } catch (e2) { } refreshPracticeStatus(); return; }
      showLoading("Opening the practice grounds...");
      try {
        setLoading(45, "Shaping forests and ruins...");
        const started = await window.Game.newGame(picked.name, "P", picked.appearance, picked.tint, picked.gender);
        if (!started) {
          hideLoading();
          toast("The dream faltered — try again.", 4000);
          await renderTitleSlots(); refreshPracticeStatus();
          return;
        }
        // seed spawn chunks + npcs
        setLoading(65, "Shaping forests and ruins...");
        await window.Game.ensureChunks();
        setLoading(80, "Dreaming up villagers...");
        try { await window.AIDirector.enrichChunk(0, 0); } catch (e) { }
        setLoading(85, "Lighting the braziers...");
        await window.Game.refreshNpcCache();
        try { window.Game.G.player.practice = true; } catch (e) { }
        setLoading(95, "Opening the gates...");
        try { await window.Game.saveGame(true); } catch (e) { }
        if ($("titleScreen")) $("titleScreen").hidden = true;
        await window.Game.startPlaying();
        hideLoading();
        toast("🥋 " + picked.name + " takes the grounds — press T or ☰ → 🛠️ Practice to set level, learn arts, grab gear. (Nothing here touches slots 1–5.)", 7000);
      } catch (e) {
        console.error(e);
        hideLoading();
        if ($("titleScreen")) $("titleScreen").hidden = false;
        toast("Could not open practice.", 4000);
      }
      try { await renderTitleSlots(); } catch (e) { }
      refreshPracticeStatus();
      return;
    }
    showLoading("Opening the practice grounds...");
    try {
      setLoading(20, "Raking the sand...");
      // NOTE: loadSlotFlow() early-returns while the loading screen is up,
      // so re-entry must load inline instead of delegating to it (delegating
      // left a hidden title + hidden loader = frozen black screen).
      setLoading(70, "Waking villagers...");
      const d = await window.Game.loadSlot("P");
      if (!d || !d.player) {
        hideLoading();
        if ($("titleScreen")) $("titleScreen").hidden = false;
        toast("The practice world is gone — enter again to found a new one.", 4000);
      } else {
        try { window.Game.G.player.practice = true; } catch (e2) { }
        try { await window.Game.saveGame(true); } catch (e3) { }
        if ($("titleScreen")) $("titleScreen").hidden = true;
        setLoading(90, "Opening the gates...");
        await window.Game.startPlaying();
        hideLoading();
        toast("🥋 Back in the practice grounds — press T or ☰ → 🛠️ Practice to rebuild.", 5000);
      }
    } catch (e) {
      console.error(e);
      hideLoading();
      if ($("titleScreen")) $("titleScreen").hidden = false;
      toast("Could not open practice.", 4000);
    }
    try { await renderTitleSlots(); } catch (e) { }
    refreshPracticeStatus();
  }
  // Practice dimension-hopping: free surf<->hell travel, no sphere or towers.
  // Each side remembers where you left (posByDim), like tower travel; the
  // first hell entry lands in the nearest hell tower (same ground as its
  // surface twin).
  async function practiceTravel(destDim) {
    try {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!G || !p || G.mode !== "playing") return;
      if (!isPractice()) return;
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      destDim = destDim === "heaven" ? "heaven" : destDim === "hell" ? "hell" : "surf";
      const curDim = (p.dim === "heaven") ? "heaven" : (p.dim === "hell") ? "hell" : "surf";
      if (p.inDungeon) { toast("🗼 No dimension magic down here — climb out of the delve first.", 3000); return; }
      if (destDim === curDim) { toast(destDim === "hell" ? "🔥 Already in hell." : destDim === "heaven" ? "🌅 Already in heaven." : "✨ Already on the surface.", 2500); return; }
      showLoading(destDim === "hell" ? "Tearing the veil..." : destDim === "heaven" ? "Rising on dawn light..." : "Climbing back to daylight...");
      try { if ($("practiceModal")) $("practiceModal").hidden = true; } catch (e) { }
      try {
        p.posByDim = p.posByDim || {};
        p.posByDim[curDim] = { x: p.x, y: p.y };
      } catch (e) { }
      let dx = null, dy = null, firstHell = false;
      try {
        const back = p.posByDim[destDim];
        if (back && isFinite(+back.x) && isFinite(+back.y)) { dx = +back.x; dy = +back.y; }
      } catch (e) { }
      if (dx == null) {
        if (destDim === "heaven") {
          try {
            const C2 = (window.Heaven && window.Heaven.CENTER) || { x: 0, y: 0 };
            dx = C2.x + 2.5; dy = C2.y + 4.5;
          } catch (e) { dx = 2.5; dy = 4.5; }
        } else if (destDim === "hell") {
          // first hell entry lands in the nearest hell tower (same
          // coordinates as its surface twin) — never the wilds.
          try {
            let bt = null, bd = 1e18;
            const arr = (window.Hell && window.Hell.HELL_TOWERS) || [];
            for (const t of arr) {
              const d = Math.hypot(p.x - t.x, p.y - t.y);
              if (d < bd) { bd = d; bt = t; }
            }
            if (bt) { dx = bt.x + 0.5; dy = bt.y + 0.5; }
            else { dx = 1000.5; dy = 0.5; }
          } catch (e) { dx = 1000.5; dy = 0.5; }
          try { p.hellEntered = true; p.hellSpawn = { x: dx, y: dy }; } catch (e2) {}
          firstHell = true;
        } else { dx = 2.5; dy = 4.5; }
      }
      try { if (window.World && window.World.setDim) window.World.setDim(destDim); } catch (e) { }
      try { p.dim = destDim; } catch (e) { }
      try { p.x = dx; p.y = dy; p.targetId = null; p.targetRef = null; p.hostileUntil = 0; } catch (e) { }
      try { if (window.Game && window.Game.clearCombat) window.Game.clearCombat(); } catch (e) { }
      try { G.mobs = []; G.projectiles = []; G.npcs = []; G.chunks = new Map(); } catch (e) { }
      try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) { }
      try { if (window.Game && window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e) { }
      try {
        if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround();
        else if (window.Game.G) window.Game.G._groundVer = (window.Game.G._groundVer || 0) + 1;
      } catch (e2) { }
      try { p.posByDim[destDim] = { x: dx, y: dy }; } catch (e) { }
      try { if (window.Game && window.Game.saveGame) await window.Game.saveGame(true); } catch (e) { }
      try { if (window.UI && window.UI.drawMinimap) window.UI.drawMinimap(); } catch (e) { }
      hideLoading();
      toast(firstHell ? `🔥 The veil tears — HELL. (Nothing here touches slots 1–5.)` : (destDim === "hell" ? `🔥 Back to hell.` : destDim === "heaven" ? `🌅 Up into heaven.` : `✨ Back to the surface.`), 4000);
      try { renderPractice(); } catch (e) { }
    } catch (e) { try { hideLoading(); } catch (e2) { } toast("Dimension travel faltered.", 3000); }
  }
  // Practice teleport: jump to X/Y in the CURRENT dimension, no gates.
  // Same streaming rebuild as travel so the new ground bakes correctly.
  async function practiceTeleport(x, y) {
    try {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!G || !p || G.mode !== "playing") return;
      if (!isPractice()) return;
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      if (p.inDungeon) { toast("📍 No teleport magic down here — climb out of the delve first.", 3000); return; }
      // number inputs report "" for empty/garbage — and +"" is 0, so reject
      // blanks BEFORE converting (else a typo blinks you to 0,0).
      if (String(x).trim() === "" || String(y).trim() === "") { toast("📍 Enter numeric X and Y coordinates.", 3000); return; }
      x = +x; y = +y;
      if (!isFinite(x) || !isFinite(y)) { toast("📍 Enter numeric X and Y coordinates.", 3000); return; }
      x = Math.max(-30000, Math.min(30000, x));
      y = Math.max(-30000, Math.min(30000, y));
      const curDim = (p.dim === "heaven") ? "heaven" : (p.dim === "hell") ? "hell" : "surf";
      showLoading("Blinking across the world...");
      try { if ($("practiceModal")) $("practiceModal").hidden = true; } catch (e) { }
      try {
        p.posByDim = p.posByDim || {};
        p.posByDim[curDim] = { x, y };
      } catch (e) { }
      try { p.x = x; p.y = y; p.targetId = null; p.targetRef = null; p.hostileUntil = 0; } catch (e) { }
      try { if (window.Game && window.Game.clearCombat) window.Game.clearCombat(); } catch (e) { }
      try { G.mobs = []; G.projectiles = []; G.npcs = []; G.chunks = new Map(); } catch (e) { }
      try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) { }
      try { if (window.Game && window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e) { }
      try {
        if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround();
        else if (window.Game.G) window.Game.G._groundVer = (window.Game.G._groundVer || 0) + 1;
      } catch (e2) { }
      try { if (window.Game && window.Game.saveGame) await window.Game.saveGame(true); } catch (e) { }
      try { if (window.UI && window.UI.drawMinimap) window.UI.drawMinimap(); } catch (e) { }
      hideLoading();
      // Hell mirrors the surface: outside the hell ground (3500 around the
      // castle at 0,0) there is only void stone — say so on landing, so a wall
      // of stone reads as intended.
      try {
        if (curDim === "heaven" && window.Heaven && window.Heaven.isHeavenGround && !window.Heaven.isHeavenGround(x, y)) {
          toast(`📍 ${Math.round(x)}, ${Math.round(y)} (heaven) — void stone. Heaven\u2019s ground lies within 3500 of (0, 0).`, 6000);
        } else if (curDim === "hell" && window.Hell && window.Hell.isHellGround && !window.Hell.isHellGround(x, y)) {
          toast(`📍 ${Math.round(x)}, ${Math.round(y)} (hell) — void stone. Hell's ground lies within 3500 of (0, 0); its towers share surface coordinates.`, 6000);
        } else toast(`📍 ${Math.round(x)}, ${Math.round(y)} (${curDim === "heaven" ? "heaven" : curDim === "hell" ? "hell" : "surface"}).`, 4000);
      } catch (e) { toast(`📍 ${Math.round(x)}, ${Math.round(y)} (${curDim === "heaven" ? "heaven" : curDim === "hell" ? "hell" : "surface"}).`, 4000); }
      try { renderPractice(); } catch (e) { }
    } catch (e) { try { hideLoading(); } catch (e2) { } toast("Teleport faltered.", 3000); }
  }
  function worldTitle(id) {
    try {
      const n = window.MP && window.MP.getWorldName ? window.MP.getWorldName(id) : "";
      if (n) return n;
    } catch (e) {}
    return String(id || "????");
  }
  function promptWorldNickname(id) {
    try {
      const cur = (window.MP && window.MP.getWorldName) ? window.MP.getWorldName(id) : "";
      const raw = prompt(`Nickname for world ${id} (just for you — every player keeps their own):`, cur || "");
      if (raw == null) return;
      const clean = String(raw).trim().slice(0, 32);
      try { window.MP.setWorldName(id, clean); } catch (e) {}
      renderMpWorlds();
      toast(clean ? `📛 World ${id} is now "${clean}" for you.` : `📛 Nickname cleared for ${id}.`, 3000);
    } catch (e) {}
  }
  async function copyWorldLink(id) {
    try {
      const link = window.MP.chanLink(id);
      try { await navigator.clipboard.writeText(link); toast("🔗 Channel link copied — share it to invite friends.", 4000); }
      catch (e) { try { prompt("Copy this channel link:", link); } catch (e2) { } }
    } catch (e) {}
  }
  async function copyWorldLink() {
    try {
      let hid = null;
      try { hid = window.MP.hostSessionId ? window.MP.hostSessionId() : (window.MP.M && window.MP.M.hostPeerId) || null; } catch (e) {}
      if (!hid) { toast('Host a world first — the invite link appears while you host.', 4000); return; }
      const link = window.MP.inviteLink(hid);
      try { await navigator.clipboard.writeText(link); toast('Invite link copied — share it to invite friends.', 4000); }
      catch (e) { try { prompt('Copy this invite link:', link); } catch (e2) {} }
    } catch (e) {}
  }
  function refreshMpHostShare(link) {
    try {
      const box = $('mpHostShare'), inp = $('mpHostLink');
      if (!box) return;
      if (!link && window.MP && window.MP.hostSessionId) {
        try { const hid = window.MP.hostSessionId(); if (hid && window.MP.inviteLink) link = window.MP.inviteLink(hid); } catch (e) {}
      }
      if (link && inp) { inp.value = link; box.hidden = false; }
      else box.hidden = true;
    } catch (e) {}
  }
  // Host this machine's world: fresh PeerJS id every time, invite link is
  // single-session (#host=<peerId>) and dies with the host tab (peer.destroy).
  async function hostGameFlow(worldId, preName, preApp, preTint, prePm) {
    if ($('loadingScreen') && !$('loadingScreen').hidden) return;
    // Host a CHOSEN world: its saves live on this machine and persist across
    // sessions; the invite link stays fresh per session.
    let w = null;
    try { w = window.MP.getHostWorld ? window.MP.getHostWorld(worldId) : null; } catch (e) {}
    if (!w) {
      try { w = window.MP.defaultHostWorld ? window.MP.defaultHostWorld() : null; } catch (e) {}
      if (!w) { toast('Create a world first (Host card above).', 4000); return; }
    }
    // Returning heroes skip the creator — the stored name and look ride along.
    let known = null;
    try {
      const heroes = window.MP.listChannelHeroes ? await window.MP.listChannelHeroes() : [];
      known = (heroes || []).find((h) => h && h.channelId === w.id && h.player) || null;
    } catch (e) {}
    const returning = !!(known && known.player && !preName);
    let name = preName || null, app = preApp || null, tint = preTint || null, pm = prePm;
    if (returning) name = String((known.player && known.player.name) || 'Wanderer').slice(0, 16);
    try {
      if (pm == null && $('mpPartyMaxSel')) { const v = Math.round(Number($('mpPartyMaxSel').value)); pm = isFinite(v) ? Math.max(0, Math.min(8, v)) : 4; }
    } catch (e) { pm = 4; }
    if (pm == null) pm = 4;
    if (!name) {
      const picked = await promptHeroName('Name your hero for ' + (w.name || 'this world') + ':');
      if (!picked) return;
      name = picked.name; app = picked.appearance; tint = picked.tint;
    }
    // The restore path uses the saved look regardless of app/tint args.
    showLoading('Opening ' + (w.name || 'your world') + '...');
    try {
      setLoading(25, 'Waking your world...');
      await window.MP.createChannel(name, pm, w.id);
      setLoading(55, 'Entering...');
      // Host enter: Hub loopback is already open, no invite arg needed.
      await window.MP.joinChannel('', name, app, tint);
      setLoading(94, 'Opening the gates...');
      if ($('titleScreen')) $('titleScreen').hidden = true;
      await window.Game.startPlaying();
      let hid = null;
      try { hid = window.MP.hostSessionId ? window.MP.hostSessionId() : null; } catch (e) {}
      let link = '';
      try { if (hid && window.MP.inviteLink) link = window.MP.inviteLink(hid); } catch (e) {}
      try { if (hid) history.replaceState(null, '', '#host=' + hid); } catch (e) {}
      hideLoading();
      renderMpChat(); renderMpPresence();
      try { refreshMpHostShare(link); } catch (e) {}
      try { if (link) await navigator.clipboard.writeText(link); } catch (e) {}
      toast('You host "' + (w.name || 'your world') + '" on THIS machine — link copied, share it to invite friends for this session. Saving & exiting ends the stream for everyone (the world stays saved here).', 7000);
      try { if (link) prompt('Share this invite link (anyone with it joins this live session):', link); } catch (e) {}
    } catch (e) {
      console.error(e);
      hideLoading();
      toast('Could not reach the rendezvous server — check your connection.', 5000);
    }
    try { await renderTitleSlots(); } catch (e2) {}
    try { await renderMpWorlds(); } catch (e2) {}
    try { refreshTitleStatus(); } catch (e2) {}
  }
  // Join with a host invite (bare code or full link — either works).
  async function joinGameFlow(raw) {
    if ($('loadingScreen') && !$('loadingScreen').hidden) return;
    raw = (raw == null && $('mpCodeInput')) ? $('mpCodeInput').value : raw;
    let hid = '';
    try { hid = window.MP.parseHostInvite ? window.MP.parseHostInvite(raw) : ''; } catch (e) {}
    if (!hid) { toast('That invite looks wrong — paste the host\'s code or full invite link.', 4000); return; }
    // No name prompt here: returning characters are restored by name
    // automatically; only true newcomers get the creator (post-handshake).
    await joinChannelFlow(hid, null, null, null);
  }
  // Legacy title flows (static channel codes, Created/Visited, settings):
  // gone with static ids. Stubs so old callers fail with the way out.
  async function hostCreatedFlow() { toast('Created Worlds are gone — Host my world gives a fresh invite link each session.', 5000); }
  async function rejoinVisitedFlow() { toast('Visited Worlds are gone — paste the host\'s fresh invite link to join.', 5000); }
  async function serverSettingsFlow() { toast('Channel settings are gone — pick companions on the Host card before hosting.', 5000); }
  async function deleteCreatedWorld() { toast('Created Worlds are gone — nothing to delete.', 4000); }
  async function forgetVisitedWorld() { toast('Visited Worlds are gone — nothing to forget.', 4000); }
  // Fast link (UDP-like) toggle: one global flag, a checkbox on both cards.
  function syncFastLinkBoxes() {
    let on = true;
    try { on = window.MPNet.fastOn ? window.MPNet.fastOn() : true; } catch (e) { on = true; }
    try { if ($('mpFastHost')) $('mpFastHost').checked = !!on; } catch (e) {}
    try { if ($('mpFastJoin')) $('mpFastJoin').checked = !!on; } catch (e) {}
  }
  function wireFastLinkBox(id) {
    try {
      const el = $(id);
      if (!el || el._fastWired) return;
      el._fastWired = true;
      el.onchange = () => {
        try { if (window.MPNet.setFastOn) window.MPNet.setFastOn(!!el.checked); } catch (e) {}
        syncFastLinkBoxes();
        toast(el.checked ? '\u26A1 Fast link on — movement/snapshots ride the UDP-like lane (next host/join).' : 'Fast link off — everything rides the reliable lane.', 4000);
      };
    } catch (e) {}
  }
  // Host worlds: pick one to host — saves live on this machine and persist
  // across sessions. The invite link stays fresh per session.
  async function renderMpWorlds() {
    try {
      const ctn = $('mpHostWorlds');
      const st = $('mpTitleStatus');
      let worlds = [];
      try { worlds = window.MP.listHostWorlds ? window.MP.listHostWorlds() : []; } catch (e) { worlds = []; }
      let heroes = [];
      try { heroes = window.MP.listChannelHeroes ? await window.MP.listChannelHeroes() : []; } catch (e) { heroes = []; }
      const heroByWorld = new Map();
      for (const h of (heroes || [])) {
        if (!h || !h.channelId) continue;
        const prev = heroByWorld.get(h.channelId);
        if (!prev || (h.time || 0) > (prev.time || 0)) heroByWorld.set(h.channelId, h);
      }
      let activeTxt = '';
      try {
        if (window.MP && window.MP.M && window.MP.M.active) {
          const isH = window.MP.isHost && window.MP.isHost();
          activeTxt = isH ? 'Hosting live — share the invite link to bring friends in.' : 'Joined a live session.';
        }
      } catch (e) {}
      if (st) {
        try {
          if (activeTxt) st.textContent = activeTxt;
          else if (!worlds.length) st.textContent = '';
          else st.textContent = worlds.length + (worlds.length === 1 ? ' world' : ' worlds') + ' on this machine';
        } catch (e) {}
      }
      if (ctn) {
        ctn.innerHTML = '';
        if (!worlds.length) {
          const e = document.createElement('p');
          e.style.cssText = 'font-size:12px;opacity:0.7';
          e.textContent = 'No worlds yet — name one below and press New world.';
          ctn.appendChild(e);
        }
        worlds.sort((a, b) => (b.lastHosted || 0) - (a.lastHosted || 0) || (b.created || 0) - (a.created || 0));
        for (const w of worlds) {
          const h = heroByWorld.get(w.id);
          const p = (h && h.player) || {};
          const d = document.createElement('div');
          d.className = 'slotrow';
          const nm = document.createElement('span');
          nm.className = 'sname';
          const b = document.createElement('b');
          b.textContent = '\uD83C\uDF0D ' + w.name;
          b.title = 'World ' + w.id + ' — saves live on this machine';
          nm.appendChild(b);
          const sub = document.createElement('div');
          sub.className = 'ssub';
          const heroTxt = h ? ((p.name || 'Wanderer') + ' \u00B7 lv ' + (p.lv || 1) + ' \u00B7 \uD83E\uDE99 ' + (p.gold | 0)) : 'no hero yet';
          let when = '';
          try { when = w.lastHosted ? (' \u00B7 hosted ' + fmtSlotTime(w.lastHosted)) : ''; } catch (e2) {}
          sub.textContent = w.id + ' \u00B7 ' + heroTxt + when;
          nm.appendChild(sub);
          d.appendChild(nm);
          const host = document.createElement('button');
          host.textContent = '\u25B6\uFE0F Host';
          host.title = 'Host this world (fresh invite link each session)';
          host.onclick = () => { hostGameFlow(w.id); };
          d.appendChild(host);
          const ren = document.createElement('button');
          ren.textContent = '\u270F\uFE0F'; ren.className = 'ghost'; ren.title = 'Rename world';
          ren.onclick = () => {
            try {
              const raw = prompt('Rename world "' + w.name + '":', w.name);
              if (raw == null) return;
              const clean = String(raw).trim().slice(0, 32);
              if (!clean) return;
              window.MP.renameHostWorld(w.id, clean);
              renderMpWorlds();
              toast('World renamed to "' + clean + '".', 3000);
            } catch (e2) {}
          };
          d.appendChild(ren);
          const del = document.createElement('button');
          del.textContent = '\uD83D\uDDD1\uFE0F'; del.className = 'danger'; del.title = 'Delete this world save on this machine';
          del.onclick = async () => {
            try {
              if (window.MP.M && window.MP.M.active && window.MP.M.channelId === w.id) { toast('Leave this world first, then delete it.', 4000); return; }
              if (!confirm('Delete world "' + w.name + '" (' + w.id + ')? Its local save (land + heroes) is erased forever on THIS machine.')) return;
              await window.MP.deleteHostWorld(w.id);
              toast('World "' + w.name + '" deleted on this machine.', 4000);
            } catch (e2) { toast('\u26A0\uFE0F ' + ((e2 && e2.message) || 'Delete failed.'), 4000); }
            await renderMpWorlds();
          };
          d.appendChild(del);
          ctn.appendChild(d);
        }
      }
      try {
        let link = '';
        try { const hid = window.MP.hostSessionId ? window.MP.hostSessionId() : null; if (hid && window.MP.inviteLink) link = window.MP.inviteLink(hid); } catch (e) {}
        refreshMpHostShare(link || '');
      } catch (e) {}
      try { syncFastLinkBoxes(); } catch (e) {}
    } catch (e) {}
  }
  async function renderMpSaves() { return renderMpWorlds(); }
  async function renderMpSaves() { return renderMpWorlds(); }
  async function renderMpSaves() { return renderMpWorlds(); }
  function refreshTitleStatus() {
    try {
      const el = $("titleStatus");
      if (!el) return;
      window.Game.listSlots().then((slots) => {
        const used = slots.filter((s) => s.player);
        if (!used.length) el.textContent = "No save yet — the frontier awaits.";
        else {
          const recent = used.slice().sort((a, b) => (b.time || 0) - (a.time || 0))[0];
          el.textContent = used.length + "/5 saves · most recent: " + recent.player.name + " lv" + recent.player.lv + " (slot " + recent.slot + ")";
        }
      }).catch(() => { });
    } catch (e) { }
  }
  function refreshSoundUI() {
    try {
      const v = window.Sfx.getVolume(), m = window.Sfx.isMuted();
      const sl = $("volSlider");
      if (sl) sl.value = String(m ? 0 : Math.round(v * 100));
      const mb = $("muteBtn");
      if (mb) { mb.textContent = m ? "🔇" : "🔊"; mb.title = m ? "Unmute" : "Mute"; }
    } catch (e) { }
  }
  // ---------- persistent storage (keep the browser from evicting saves) ----------
  // Saves live in IndexedDB, which the browser may wipe under storage pressure
  // unless the site holds a persistent-storage grant. Request it on boot (free,
  // silent) and offer an explicit re-prompt button, since some browsers only
  // grant it in response to a user gesture.
  function fmtBytes(n) {
    if (n == null || !isFinite(Number(n))) return "?";
    n = Number(n);
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(0) + " KB";
    if (n < 1073741824) return (n / 1048576).toFixed(1) + " MB";
    return (n / 1073741824).toFixed(2) + " GB";
  }
  async function storageStatus() {
    let persisted = null, usage = null, quota = null;
    try { if (navigator.storage && navigator.storage.persisted) persisted = await navigator.storage.persisted(); } catch (e) { }
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        usage = est.usage; quota = est.quota;
      }
    } catch (e) { }
    return { persisted, usage, quota };
  }
  async function refreshStorageUI() {
    const el = $("storageStatus");
    if (!el) return;
    el.textContent = "Checking…";
    const s = await storageStatus();
    let txt;
    if (s.persisted === true) txt = "🛡️ Saves protected — the browser will keep them.";
    else if (s.persisted === false) txt = "⚠️ Saves NOT protected — the browser may delete them when space runs low.";
    else txt = "Storage status unknown on this browser.";
    if (s.usage != null || s.quota != null) txt += ` (${fmtBytes(s.usage)} of ${fmtBytes(s.quota)} used)`;
    el.textContent = txt;
    const b = $("persistBtn");
    if (b) b.disabled = s.persisted === true;
  }
  async function requestPersistentStorage(fromUser) {
    let granted = false;
    try {
      if (navigator.storage && navigator.storage.persist) granted = await navigator.storage.persist();
      else {
        if (fromUser) toast("Persistent storage isn't supported in this browser — saves still work, they just can't be made eviction-proof.", 5000);
        return false;
      }
    } catch (e) { granted = false; }
    await refreshStorageUI();
    if (fromUser) toast(granted ? "🛡️ Saves protected — the browser will keep them." : "⚠️ The browser declined protection. Saves still work — but free up disk space and avoid private/incognito windows.", 6000);
    return granted;
  }
  const TOUCH_KEY = "emberhold-touch-v1";
  function touchSetting() {
    try {
      const v = localStorage.getItem(TOUCH_KEY);
      if (v === "on" || v === "off" || v === "auto") return v;
    } catch (e) { }
    return "auto";
  }
  function touchDevice() {
    try { if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true; } catch (e) { }
    try { if (("ontouchstart" in window) && Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 700) return true; } catch (e) { }
    return false;
  }
  function refreshFsUI() {
    // fullscreen button label + state line (settings menu only)
    try {
      const b = $("fsBtn"), st = $("fsState");
      const supported = !!(document.fullscreenEnabled || (document.documentElement && document.documentElement.webkitRequestFullscreen));
      if (b) b.textContent = document.fullscreenElement ? "⛶ Exit fullscreen" : "⛶ Go fullscreen";
      if (st) st.textContent = document.fullscreenElement ? "on" : (supported ? "" : "not supported here");
    } catch (e) { }
  }
  function applyTouchControls() {
    const mode = touchSetting();
    const show = mode === "on" || (mode === "auto" && touchDevice());
    try { const j = $("joyBase"); if (j) j.hidden = !show; } catch (e) { }
    try { const a = $("atkBtn"); if (a) a.hidden = !show; } catch (e) { }
    try { const i = $("intBtn"); if (i) i.hidden = !show; } catch (e) { }
    try { const o = $("offBtn"); if (o) o.hidden = !show; } catch (e) { }
    try { const s = $("touchSel"); if (s) s.value = mode; } catch (e) { }
    // touch layout swap: mini profile + diamond cluster + drag-to-cast CSS
    // all key off body.touch (desktop keeps the full panel + plain buttons).
    try { document.body.classList.toggle("touch", !!show); } catch (e) { }
    try { updateMiniProfile(); } catch (e) { }
    try { refreshFsUI(); } catch (e) { }
    try { layoutTicker(); } catch (e) { }
    try { fitHotbar(); } catch (e) { }
  }
  // ---------- tutorial prompts (global, all worlds; default ON) ----------
  const TUT_PROMPT_KEY = "emberhold-tutorial-v1";
  function tutorialPromptsEnabled() {
    try {
      const v = localStorage.getItem(TUT_PROMPT_KEY);
      if (v === "0" || v === "off") return false;
    } catch (e) { }
    return true; // default enabled
  }
  function syncTutorialToggles() {
    const on = tutorialPromptsEnabled();
    for (const id of ["titleTutToggle", "menuTutToggle"]) {
      try { const el = $(id); if (el) el.checked = on; } catch (e) { }
    }
  }
  function setTutorialPromptsEnabled(on) {
    try { localStorage.setItem(TUT_PROMPT_KEY, on ? "1" : "0"); } catch (e) { }
    try { syncTutorialToggles(); } catch (e2) { }
    toast(on ? "🎓 Tutorial prompts enabled for all worlds." : "🎓 Tutorial prompts off for all worlds. (🎓 Training stays available in ❓ Help and ☰.)", 3500);
  }
  // ---------- autosave interval (global, all worlds; title sidebar + pause menu stay in sync) ----------
  const AUTOSAVE_BLURBS = { 0: "manual saves only", 15: "every 15 seconds", 30: "every 30 seconds", 60: "every minute", 120: "every 2 minutes", 300: "every 5 minutes" };
  function syncAutosaveSels() {
    let v = 60;
    try { v = window.Game.getAutosaveSecs(); } catch (e) { }
    for (const id of ["titleAutosaveSel", "menuAutosaveSel"]) {
      try { const el = $(id); if (el) el.value = String(v); } catch (e) { }
    }
  }
  function setAutosaveSecs(v) {
    let nv = 60;
    try { nv = window.Game.setAutosaveSecs(v); } catch (e) { nv = Number(v) || 60; }
    try { syncAutosaveSels(); } catch (e2) { }
    const blurb = AUTOSAVE_BLURBS[nv] || ("every " + nv + "s");
    toast(nv === 0 ? "💾 Autosave off — save with ☰ → 💾 Save now (or Save & title). Slot switches and death still save." : `💾 Autosaving ${blurb}. (Manual + event saves still fire anytime.)`, 3500);
  }
  // ---------- themes (title sidebar + pause menu Appearance dropdowns) ----------
  const THEME_DOTS = {
    ember: "linear-gradient(135deg,#e08a2e 50%,#0d141b 50%)",
    brawl: "linear-gradient(135deg,#5cc2ff 50%,#0a2a6b 50%)",
    forest: "linear-gradient(135deg,#55aa55 50%,#0e1a12 50%)",
    crimson: "linear-gradient(135deg,#d05252 50%,#150a0c 50%)",
    sakura: "linear-gradient(135deg,#f2a0c0 50%,#fff5f8 50%)",
    midnight: "linear-gradient(135deg,#33e0ff 50%,#000 50%)",
  };
  function renderThemePickers() {
    try {
      if (!window.Theme) return;
      const cur = window.Theme.current();
      // legacy button rows (kept for backward compat if present)
      for (const id of ["titleThemeRow", "menuThemeRow"]) {
        const row = $(id);
        if (!row) continue;
        row.innerHTML = "";
        for (const key of window.Theme.ORDER) {
          const meta = window.Theme.META[key] || { name: key };
          const b = document.createElement("button");
          b.className = "theme-pick" + (key === cur ? " active" : "");
          b.setAttribute("data-theme-pick", key);
          b.title = meta.blurb || meta.name;
          const dot = document.createElement("span");
          dot.className = "dot";
          dot.style.background = THEME_DOTS[key] || "#888";
          b.appendChild(dot);
          const label = document.createElement("span");
          label.textContent = `${meta.name}`;
          b.appendChild(label);
          b.onclick = () => { try { window.Theme.apply(key); } catch (e) { } };
          row.appendChild(b);
        }
      }
      // dropdowns: title sidebar + pause-menu Appearance
      for (const id of ["titleThemeSel", "menuThemeSel"]) {
        const sel = $(id);
        if (!sel) continue;
        sel.innerHTML = "";
        for (const key of window.Theme.ORDER) {
          const meta = window.Theme.META[key] || { name: key };
          const o = document.createElement("option");
          o.value = key;
          o.textContent = `${meta.name}`;
          sel.appendChild(o);
        }
        sel.value = cur;
        sel.onchange = () => { try { window.Theme.apply(sel.value); } catch (e) { } };
      }
    } catch (e) { }
  }
  function toggleMenu(force) {
    const m = $("menuModal");
    if (!m) return;
    const show = force !== undefined ? force : m.hidden;
    if (show) {
      if (!window.Game || !window.Game.G || window.Game.G.mode !== "playing" || !window.Game.G.player) return;
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      m.hidden = false;
      renderMenuSlots();
      refreshSoundUI();
      try { if ($("practiceHudBtn")) $("practiceHudBtn").hidden = !isPractice(); } catch (e) { }
      try { refreshStorageUI(); } catch (e) { }
      try { applyTouchControls(); } catch (e) { }
      try { syncTutorialToggles(); } catch (e2) { }
      try { syncAutosaveSels(); } catch (e3) { }
    } else {
      m.hidden = true;
    }
    try {
      if (window.Game && window.Game.G) {
        for (const k in window.Game.G.keys) window.Game.G.keys[k] = false;
        window.Game.G.mouse.down = false;
      }
    } catch (e) { }
  }
  async function loadSlotFlow(slot) {
    if ($("loadingScreen") && !$("loadingScreen").hidden) return;
    slot = String(slot || "1");
    // leaving a channel for a singleplayer slot: a hosting player ends the
    // stream first (their world is going away); joiners just drop presence
    try {
      const mpOn = !!(window.MP && window.MP.M && window.MP.M.active);
      const hosting = mpOn && window.MP.isHost && window.MP.isHost();
      if (mpOn && hosting) { try { await window.MP.endHostStream(); } catch (e) { } }
      if (mpOn) await window.MP.leaveChannel(true);
    } catch (e) { }
    try { if ($("mpChatBox")) $("mpChatBox").hidden = true; } catch (e2) { }
    try { if ($("mpPresence")) $("mpPresence").hidden = true; } catch (e3) { }
    try {
      const cur = window.Game.currentSlot ? window.Game.currentSlot() : "1";
      if (window.Game.G && window.Game.G.player && window.Game.G.mode === "playing" && cur !== slot) {
        await window.Game.saveGame(true);
      }
    } catch (e) { }
    if ($("menuModal")) $("menuModal").hidden = true;
    showLoading("Remembering Emberhold...");
    try {
      setLoading(20, "Finding your trail...");
      const d = await window.Game.loadSlot(slot);
      if (!d) {
        hideLoading();
        if ($("titleScreen")) $("titleScreen").hidden = false;
        toast("Slot " + slot + " is empty.");
        await renderTitleSlots();
        return;
      }
      setLoading(70, "Waking villagers...");
      if ($("titleScreen")) $("titleScreen").hidden = true;
      setLoading(90, "Opening the gates...");
      await window.Game.startPlaying();
      hideLoading();
      toast("Welcome back, " + d.player.name + ". (Slot " + slot + ")", 4000);
    } catch (e) {
      console.error(e);
      hideLoading();
      if ($("titleScreen")) $("titleScreen").hidden = false;
      toast("Could not load that slot.", 4000);
    }
    await renderTitleSlots();
  }
  async function quitToTitle(save) {
    if (save === undefined) save = true;
    try {
      const mpOn = !!(window.MP && window.MP.M && window.MP.M.active);
      const hosting = mpOn && window.MP.isHost && window.MP.isHost();
      if (mpOn && hosting) {
        // Host save & exit: the world saves HERE, then every client gets the
        // explicit "server has ended the stream" notice + instant kick.
        // (Accidental drops never send it — they just reconnect.)
        if (save && window.Game.G.player && window.Game.G.mode === "playing") await window.Game.saveGame(true);
        try { await window.MP.endHostStream(); } catch (e) { }
        try { await window.MP.leaveChannel(true); } catch (e2) { }
      } else {
        if (save && window.Game.G.player && window.Game.G.mode === "playing") await window.Game.saveGame(true);
        // leaving the title from a channel: silently drop the socket presence
        try {
          if (mpOn) await window.MP.leaveChannel(true);
        } catch (e) { }
      }
    } catch (e) { }
    try { if ($("mpChatBox")) $("mpChatBox").hidden = true; } catch (e) { }
    try { if ($("mpPresence")) $("mpPresence").hidden = true; } catch (e) { }
    window.Game.G.mode = "title";
    // leaving the game: kill the tutorial spotlight immediately (the 900ms
    // guide timer would clear it anyway) and leave no gameplay UI over title
    try { clearTutGuide(); } catch (e) { }
    try { hideQuestBanner(); } catch (e2) { }
    const ids = ["menuModal", "partyModal", "questModal", "mapModal", "helpModal", "deathModal", "invModal", "charModal", "chatModal", "changelogModal", "profileModal", "portalModal", "dungeonTravelModal", "travelModal", "tutorialModal", "tutRewardModal", "stableModal", "innModal", "guildModal", "loreModal", "practiceModal"];
    for (const id of ids) { try { const el = $(id); if (el) el.hidden = true; } catch (e) { } }
    try {
      for (const k in window.Game.G.keys) window.Game.G.keys[k] = false;
      window.Game.G.mouse.down = false;
    } catch (e) { }
    if ($("titleScreen")) $("titleScreen").hidden = false;
    try {
      const slots = await window.Game.listSlots();
      titleSlotSel = defaultTitleSlot(slots);
    } catch (e) { }
    await renderTitleSlots();
    try { await renderMpSaves(); } catch (e) { }
    refreshTitleStatus();
  }
  function clearMenuKeys() {
    try {
      if (window.Game && window.Game.G) {
        for (const k in window.Game.G.keys) window.Game.G.keys[k] = false;
        window.Game.G.mouse.down = false;
      }
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } catch (e) { }
  }
  function onEscape() {
    if ($("loadingScreen") && !$("loadingScreen").hidden) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.tagName === "SELECT")) {
      try { ae.blur(); } catch (e) { }
      return;
    }
    try { if (window.Shops && window.Shops.isPlacing && window.Shops.isPlacing()) { window.Shops.cancelPlacement(); try { toast("Placement cancelled.", 1500); } catch (e) {} clearMenuKeys(); return; } } catch (e) {}
    try { const sm = $("shopModal"); if (sm && !sm.hidden) { sm.hidden = true; try { if (window.Shops) window.Shops.closeShop(); } catch (e) {} clearMenuKeys(); return; } } catch (e) {}
    const cm = $("chatModal");
    if (cm && !cm.hidden) { try { closeChat(); } catch (e) { cm.hidden = true; } clearMenuKeys(); return; }
    try {
      const nl = $("notifLog");
      if (nl && !nl.hidden) { nl.hidden = true; clearMenuKeys(); return; }
    } catch (e) { }
    const mm = $("menuModal");
    if (mm && !mm.hidden) { toggleMenu(false); clearMenuKeys(); return; }
    let closed = false;
    const ids = ["partyModal", "questModal", "mapModal", "helpModal", "invModal", "charModal", "profileModal", "portalModal", "dungeonTravelModal", "travelModal", "tutorialModal", "tutRewardModal", "stableModal", "innModal", "guildModal", "loreModal", "playerTradeModal", "practiceModal", "altarModal"];
    for (const id of ids) {
      const el = $(id);
      if (el && !el.hidden) { el.hidden = true; closed = true; }
    }
    // changelog close goes through its button so the version is marked seen
    try {
      const cm2 = $("changelogModal");
      if (cm2 && !cm2.hidden) { const cb = $("changelogClose"); if (cb) cb.click(); else cm2.hidden = true; closed = true; }
    } catch (e) { }
    if (closed) { clearMenuKeys(); try { refreshTutGuide(); } catch (e) { } return; }
    const dm = $("deathModal");
    if (dm && !dm.hidden) return;
    if ($("titleScreen") && !$("titleScreen").hidden) return;
    if (!window.Game || !window.Game.G || window.Game.G.mode !== "playing" || !window.Game.G.player) return;
    toggleMenu(true);
  }

  // ---------- player trade + allies (multiplayer, no prompt() anywhere) ----------
  let tradePeer = null; // remote hash the trade modal is open for
  const counterStates = {}; // offerId -> {tab,q,sel} for answering an offer
  function tradePeerShort(peer) {
    try {
      const rs = window.MP.getRemotes();
      const r = (rs || []).find(x => String(x.remoteHash || "").toLowerCase() === String(peer || "").toLowerCase());
      if (r && r.name) return String(r.name).slice(0, 16);
    } catch (e) { }
    return "them";
  }
  function tradeItemName(id, variant) {
    try {
      const it = window.Items.ITEMS[id];
      if (it) {
        let nm = it.name;
        try {
          if (variant && (variant.up > 0 || variant.nick) && window.Items.variantName) {
            nm = window.Items.variantName({ id, up: variant.up, nick: variant.nick });
            if ((variant.up | 0) > 0) nm += ` +${(variant.up | 0) * 10}%`;
          }
        } catch (e) { }
        return nm;
      }
    } catch (e) { }
    return String(id || "?").replace(/_/g, " ");
  }
  function sysBubbleSafe(text) {
    try {
      const m = $("chatModal");
      if (m && !m.hidden) { sysBubble(text); return; }
    } catch (e) { }
    toast(text, 4000);
  }
  function openPlayerTrade(peerHash) {
    if (!window.MP || !window.MP.M || !window.MP.M.active) { toast("Join a multiplayer channel first (title screen → Multiplayer).", 4000); return; }
    tradePeer = String(peerHash || "").toLowerCase();
    if (!tradePeer) return;
    const m = $("playerTradeModal");
    if (!m) { toast("Trade menu not ready — reload the page.", 4000); return; }
    m.hidden = false;
    renderPlayerTrade();
  }
  function closePlayerTrade() {
    const m = $("playerTradeModal");
    if (m) m.hidden = true;
    tradePeer = null;
  }
  // live receipt hook (called by the MP layer on every incoming give)
  function onTradeGive() {
    try { if ($("playerTradeModal") && !$("playerTradeModal").hidden) renderPlayerTrade(); } catch (e) { }
    try { updateHUD(); updateHotbar(); } catch (e) { }
  }
  // re-render presence + chat head + map after any ally handshake
  function renderAllyState() {
    try { renderMpPresence(); } catch (e) { }
    try {
      if (chatNpc && chatNpc.isRemotePlayer && $("chatModal") && !$("chatModal").hidden) renderChatHead();
    } catch (e) { }
    try { queueWorldDraw(); } catch (e) { }
    try { drawMinimap(); } catch (e) { }
  }
  function renderPlayerTrade() {
    const m = $("playerTradeModal");
    if (!m || m.hidden) return;
    const box = $("ptBody");
    if (!box) return;
    box.innerHTML = "";
    const p = window.Game.G.player;
    if (!p) return;
    const peer = tradePeer;
    const rname = tradePeerShort(peer);
    let allied = false;
    try { allied = !!(window.MP.isAlliedHash && peer && window.MP.isAlliedHash(peer)); } catch (e) { }
    const head = document.createElement("div");
    head.style.cssText = "font-size:15px;font-weight:900;margin-bottom:2px";
    head.textContent = "⚖️ Trade with " + rname + (allied ? " · 🤝 allied" : "");
    box.appendChild(head);
    const sub = document.createElement("div");
    sub.style.cssText = "font-size:12px;opacity:0.8;margin-bottom:8px";
    sub.textContent = allied
      ? "Allied: you can never hurt each other, and you share the Known World map."
      : "Travelers can only trade voluntarily — nothing is ever taken by force.";
    box.appendChild(sub);
    const tr = window.MP.M.trade;
    const status = document.createElement("div");
    status.style.cssText = "font-size:13px;background:#0d141b;border:1px solid #3a4a5a;border-radius:8px;padding:8px 10px;margin-bottom:8px;line-height:1.5";
    const sbtns = document.createElement("div");
    sbtns.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;margin-top:6px";
    status.appendChild(sbtns);
    const sBtn = (label, fn, ghost, title) => {
      const b = document.createElement("button");
      b.textContent = label;
      if (ghost) b.className = "ghost";
      if (title) b.title = title;
      b.onclick = fn;
      sbtns.appendChild(b);
      return b;
    };
    let showCounter = false, showPockets = true;
    const sTxt = document.createElement("div");
    status.insertBefore(sTxt, sbtns);
    if (tr && (tr.dir === "in" || tr.dir === "out") && tr.stage !== "done") {
      const mineOut = tr.dir === "out";
      const peerName = mineOut ? (tr.peerName || rname) : tradePeerShort(tr.peer);
      if (mineOut && tr.stage === "offered") {
        sTxt.textContent = `You offer ${tradeItemName(tr.myId, tr)} ×${tr.myN} — waiting for ${peerName} to answer (they pick something back, or take it as a gift).`;
        sBtn("Cancel offer", () => { try { window.MP.tradeDeclineMsg(tr.offerId); } catch (e) { toast("⚠️ " + (e.message || "Cancel failed."), 4000); } try { renderPlayerTrade(); } catch (e2) { } }, true);
      } else if (mineOut && tr.stage === "countered") {
        sTxt.textContent = tr.theirId
          ? `${peerName} offers back ${tradeItemName(tr.theirId, { up: tr.theirUp, nick: tr.theirNick })} ×${tr.theirN} for your ${tradeItemName(tr.myId, tr)} ×${tr.myN}. Approve to swap both items.`
          : `${peerName} takes your ${tradeItemName(tr.myId, tr)} ×${tr.myN} as a gift (nothing back). Approve to give it.`;
        sBtn("✅ Approve swap", async () => {
          try { await window.MP.approveTrade(); sysBubbleSafe(`*You trade ${peerName}: ${tr.myN}× ${tradeItemName(tr.myId, tr)}${tr.theirId ? (" for " + tr.theirN + "× " + tradeItemName(tr.theirId, { up: tr.theirUp, nick: tr.theirNick })) : ""}.*`); }
          catch (e) { toast("⚠️ " + (e.message || "Approve failed."), 4000); }
          try { renderPlayerTrade(); } catch (e2) { }
        });
        sBtn("Cancel", () => { try { window.MP.tradeDeclineMsg(tr.offerId); } catch (e) { } try { renderPlayerTrade(); } catch (e2) { } }, true);
      } else if (!mineOut && tr.stage === "offered") {
        sTxt.textContent = `${peerName} offers you ${tradeItemName(tr.theirId, { up: tr.theirUp, nick: tr.theirNick })} ×${tr.theirN}. Pick something back below — or take it as a gift, or decline.`;
        showCounter = true;
        sBtn("🎁 Take as gift (nothing back)", () => {
          try { window.MP.tradeCounter(tr.offerId, "", 0); toast("You take it as a gift — they approve to send it.", 4000); }
          catch (e) { toast("⚠️ " + (e.message || "Failed."), 4000); }
          try { renderPlayerTrade(); } catch (e2) { }
        });
        sBtn("Decline", () => { try { window.MP.tradeDeclineMsg(tr.offerId); } catch (e) { } try { renderPlayerTrade(); } catch (e2) { } }, true);
      } else if (!mineOut && tr.stage === "countered") {
        sTxt.textContent = `You offered back ${tradeItemName(tr.myId)} ×${tr.myN} — waiting for ${peerName} to approve the swap.`;
        sBtn("Cancel", () => { try { window.MP.tradeDeclineMsg(tr.offerId); } catch (e) { } try { renderPlayerTrade(); } catch (e2) { } }, true);
      }
    } else if (tr && tr.stage === "done") {
      sTxt.textContent = "✅ Trade complete — pick more below, or close the menu.";
      sBtn("Clear", () => { try { window.MP.M.trade = null; } catch (e) { } try { renderPlayerTrade(); } catch (e2) { } }, true);
    } else {
      sTxt.textContent = "Pick anything from your pockets: 🎁 Give sends it instantly, ⚖️ Offer lets them give something back first — then YOU approve.";
    }
    const stlab = document.createElement("div");
    stlab.className = "menu-eyebrow tabs";
    stlab.textContent = "① Status — what is on the table";
    status.insertBefore(stlab, status.firstChild);
    box.appendChild(status);
    // your pockets: tabbed browser with Give / Offer buttons
    const pk = document.createElement("div");
    pk.className = "menu-eyebrow items";
    pk.textContent = showCounter ? "② Your pockets — pick what to offer back (items below)" : "② Your pockets — give or offer (items below)";
    box.appendChild(pk);
    const tst = browserStateFor(tradeStates, peer || "none");
    const search = document.createElement("input");
    search.type = "text"; search.placeholder = "Search by name…"; search.autocomplete = "off";
    search.className = "invsearch"; search.value = tst.q || "";
    box.appendChild(search);
    const tabs = document.createElement("div"); tabs.className = "itabs"; box.appendChild(tabs);
    const wrap = document.createElement("div"); wrap.className = "invwrap";
    const list = document.createElement("div"); list.className = "packlist";
    const side = document.createElement("div"); side.className = "invside";
    wrap.appendChild(list); wrap.appendChild(side); box.appendChild(wrap);
    const paint = (browserMode, extra) => paintBrowser(Object.assign({
      tabsEl: tabs, searchEl: search, listEl: list, sideEl: side,
      owner: p, mode: browserMode, state: tst, tabs: INV_TABS, showCraft: false,
      onChange: () => { try { updateHUD(); updateHotbar(); } catch (e) { } renderPlayerTrade(); },
    }, extra || {}));
    if (showCounter && tr) {
      paint("counter", { offerId: tr.offerId });
      // keep the top pockets visible too: the counter browser IS the pockets
    } else {
      paint("trade", { tradePeer: peer });
    }
    void showPockets;
  }

  // ---------- multiplayer channels (MP-only bottom-left chat + presence) ----------
  function mpActive() { try { return !!(window.MP && window.MP.M && window.MP.M.active); } catch (e) { return false; } }
  function renderMpChat() {
    try {
      const box = $("mpChatBox"), log = $("mpChatLog");
      if (!box || !log) return;
      if (!mpActive() || !window.Game || !window.Game.G || window.Game.G.mode !== "playing") { box.hidden = true; return; }
      box.hidden = false;
      const M = window.MP.M;
      try {
        let ttl = "🌐 Channel " + (M.channelId || "");
        try {
          const nn = window.MP.getWorldName ? window.MP.getWorldName(M.channelId) : "";
          if (nn) ttl += ' · 📛 "' + nn + '"';
        } catch (e2) { }
        if ($("mpChatTitle")) $("mpChatTitle").textContent = ttl;
      } catch (e) { }
      log.innerHTML = "";
      const frag = document.createDocumentFragment();
      for (const c of (M.chat || []).slice(-40)) {
        const d = document.createElement("div");
        d.className = "m" + (c.sys ? " sys" : "") + (c.whisper ? " whis" : "") + (c.from === M.hash ? " me" : "");
        if (c.sys) { d.textContent = c.text; }
        else {
          const b = document.createElement("b");
          b.textContent = (c.whisper ? "🤫 " : "") + (c.name || "Traveler") + ": ";
          const s = document.createElement("span");
          s.textContent = c.text;
          d.appendChild(b); d.appendChild(s);
        }
        frag.appendChild(d);
      }
      log.appendChild(frag);
      log.scrollTop = log.scrollHeight;
    } catch (e) { }
  }
  function renderMpPresence() {
    try {
      const el = $("mpPresence");
      if (!el) return;
      if (!mpActive() || !window.Game || !window.Game.G || window.Game.G.mode !== "playing") { el.hidden = true; return; }
      el.hidden = false;
      const M = window.MP.M;
      el.innerHTML = "";
      const info = document.createElement("div");
      const remotes = window.MP.getRemotes();
      const s = M.sleepInfo || { sleeping: 0, online: 1 };
      let hostName = "…";
      try {
        const hh = String((M.hostHash || "")).toLowerCase();
        if (hh && hh === String(M.hash || "").toLowerCase()) hostName = "you";
        else {
          const hr = remotes.find(r => String(r.remoteHash || "").toLowerCase() === hh);
          if (hr) hostName = hr.name;
          else if (remotes.length) hostName = "…";
          else hostName = "you";
        }
      } catch (e) {}
      // Star topology: every guest holds one DataConnection to the host (no mesh).
     const isHost = !!(window.MP.isHost && window.MP.isHost());
     // latency readout: relay RTT (rpc echo) + P2P state. Relay ~350ms is
     // playable for this game; P2P direct (~30-80ms) is what makes combat crisp.
      // host-decided companion cap (channel setting, enforced by everyone)
      let partyCapN = 4;
      try { partyCapN = window.MP.partyCap ? window.MP.partyCap() : ((M.partyMax | 0) || 4); } catch (e) { partyCapN = 4; }
      let relayMs = null, pingAge = null;
      try {
        const ns = window.MP.M && window.MP.M.netStats;
        if (ns && isFinite(+ns.relayMs)) { relayMs = Math.round(+ns.relayMs); pingAge = ns.lastPing ? Math.round((Date.now() - ns.lastPing) / 1000) : null; }
      } catch (e) {}
      // No probe from render: renderMpPresence runs on many MP events, and a
      // probe-per-render plus a re-render-per-probe spun an rpc storm that
      // froze browsers. The 8s poll timer keeps relayMs fresh instead.
      let linkMode = remotes.length ? ('\uD83C\uDF10 live \u00B7 ' + remotes.length + ' fellow traveler' + (remotes.length === 1 ? '' : 's')) : '\uD83C\uDF10 live (alone)';
      if (relayMs != null) linkMode += ' \u00B7 ' + relayMs + 'ms';
      let wname = '';
      try { wname = (window.MP.getWorldName && M.channelId) ? (window.MP.getWorldName(M.channelId) || '') : ''; } catch (e) {}
      info.textContent = '\uD83C\uDF10 ' + (wname || M.channelId || 'world') + ' \u00B7 ' + (isHost ? '\uD83D\uDC51 you host' : '\uD83D\uDC51 ' + hostName + ' hosts') + ' \u00B7 ' + linkMode + ' \u00B7 \u23F3 Day ' + (1 + Math.floor((window.Game.G.dayTime || 0) / 1440));
      el.appendChild(info);
      const names = document.createElement("div");
      names.style.cssText = "opacity:0.85;margin-top:2px";
      if (!remotes.length) names.textContent = isHost ? "alone here — copy the invite link to bring friends in (link expires when you save & exit)" : "alone here — the host\u2019s world streams to you live";
      else {
        names.textContent = remotes.map(r => {
          const hh = String(M.hostHash || "").toLowerCase();
          const crown = String(r.remoteHash || "").toLowerCase() === hh ? "👑 " : "";
          let link = "🌐";
          // delvers announce their delve + depth so allies know which
          // dungeon each traveler is inside (world map pins the mouth)
          let where = "";
          try { if (r.dun) { const _lv = (r.dLv | 0) || 0; where = _lv ? ` 🕳️L${_lv}` : " 🕳️"; } } catch (e) {}
          return `${crown}${r.sleeping ? "😴 " : ""}${link}${r.name} (lv${r.lv})${where}`;
        }).join(" · ");
      }
     el.appendChild(names);
      // Companion cap is picked on the Host card each session (live cap shows above).
      // host member list with kick (invite control stays with the link: only
      // the host can remove members; anyone with the link can join)
      try {
        if (isHost && remotes.length) {
          const mem = document.createElement("div");
          mem.style.cssText = "margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;align-items:center";
          const lab = document.createElement("span");
          lab.style.cssText = "opacity:0.7;font-size:11px";
          lab.textContent = "Members:";
          mem.appendChild(lab);
          for (const r of remotes) {
            const b = document.createElement("button");
            b.textContent = "✖ " + (r.name || "Traveler");
            b.title = "Remove " + (r.name || "Traveler") + " from the channel (host only)";
            b.onclick = async () => {
              if (!confirm("Remove " + (r.name || "Traveler") + " from the channel?")) return;
              try { await window.MP.kickMember(r.remoteHash); toast("Removed " + (r.name || "Traveler") + ".", 3000); }
              catch (e) { toast("⚠️ " + (e.message || "Kick failed."), 4000); }
            };
            mem.appendChild(b);
          }
          el.appendChild(mem);
        }
      } catch (e) {}
      const row = document.createElement("div");
      const mk = (label, title, fn) => { const b = document.createElement("button"); b.textContent = label; b.title = title; b.onclick = fn; row.appendChild(b); return b; };
      mk("🔗 Copy invite", "Copy the invite link for this live session", async () => {
        let hid = null;
        try { hid = window.MP.hostSessionId ? window.MP.hostSessionId() : null; } catch (e) {}
        if (!hid && !isHost) { toast("Only the host has the invite link — ask them for a fresh one.", 4000); return; }
        if (!hid) { toast("No invite link for this session.", 4000); return; }
        const link = window.MP.inviteLink(hid);
        try { await navigator.clipboard.writeText(link); toast("🔗 Invite link copied — share it to invite friends.", 4000); }
        catch (e) { try { prompt("Copy this invite link:", link); } catch (e2) { } }
      });
      mk(M.sleeping ? "☀️ Wake" : "😴 Sleep", "Sleep vote: dawn comes when EVERY traveler sleeps", async () => {
        try { await window.MP.setSleeping(!M.sleeping); toast(M.sleeping ? "😴 You wake up." : "😴 You doze… waiting for all travelers. Move to wake.", 4000); }
        catch (e) { toast("⚠️ Sleep vote failed — retry.", 3000); }
      });
      mk("♻️ Reincarnate", "Same channel world, fresh lv1 hero", async () => {
        const p0 = window.Game.G.player;
        const picked = await openHeroCreator({
          title: "Reincarnate in this channel?",
          sub: "Same world, fresh lv1 hero — new name, new face. Belongings and party are gone; the shared world stays.",
          initialName: (p0 && p0.name) || "Wanderer",
          appearance: (p0 && p0.appearance) || null,
          tint: (p0 && p0.tint) || "#4da3ff",
          previewGear: (p0 && p0.equipment) || { w: "rusted_sword", a: null },
          confirmLabel: "♻️ Rebirth",
        });
        if (!picked) return;
        const clean = picked.name;
        if (!confirm(`Rebirth as ${clean}? Belongings/party gone — the shared world stays.`)) return;
        try { await window.MP.reincarnate(clean, picked.appearance, picked.tint); renderMpPresence(); }
        catch (e) { toast("⚠️ " + (e.message || "Reincarnate failed."), 4000); }
      });
      if (isHost) {
        mk("🛑 Save & end stream", "Save the world on this machine and end the session for everyone", async () => {
          if (!confirm("Save the world and END the stream? Every traveler is returned to the title.")) return;
          try { await window.MP.endHostStream(); } catch (e) { }
          try { await quitToTitle(false); } catch (e2) { }
          renderMpChat(); renderMpPresence();
          toast("🛑 Stream ended — world saved on this machine.", 4000);
        });
      } else {
        mk("🚪 Leave", "Leave the channel (your hero stays on your machine)", async () => {
          try { await window.MP.leaveChannel(false); } catch (e) { }
          try { await quitToTitle(false); } catch (e2) { }
          renderMpChat(); renderMpPresence();
          toast("🚪 Left the channel.", 3000);
        });
      }
      // allies + incoming requests + per-traveler quick actions (no prompts)
      try {
        const reqs = [...((M.allyReqs && M.allyReqs.entries) ? M.allyReqs.entries() : [])];
        if (reqs.length) {
          for (const [reqId, q] of reqs) {
            const pr = document.createElement("div");
            pr.style.cssText = "margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px";
            const lab = document.createElement("span");
            lab.textContent = "🤝 " + (q.name || "A traveler") + " wants to ally (no damage either way, shared map):";
            pr.appendChild(lab);
            const ok = document.createElement("button");
            ok.textContent = "Accept";
            ok.onclick = async () => { try { await window.MP.respondAlly(reqId, true); toast("🤝 Allied — no damage either way.", 4000); } catch (e) { toast("⚠️ " + (e.message || "Failed."), 4000); } };
            pr.appendChild(ok);
            const no = document.createElement("button");
            no.textContent = "Decline"; no.className = "ghost";
            no.onclick = async () => { try { await window.MP.respondAlly(reqId, false); } catch (e) { } };
            pr.appendChild(no);
            el.appendChild(pr);
          }
        }
        let allies = [];
        try { allies = window.MP.allyList ? window.MP.allyList() : []; } catch (e) { allies = []; }
        if (allies.length) {
          const ar = document.createElement("div");
          ar.style.cssText = "margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-size:12px";
          const lab = document.createElement("span");
          lab.style.cssText = "opacity:0.7";
          lab.textContent = "🤝 Allies:";
          ar.appendChild(lab);
          for (const h of allies) {
            let nm = "Traveler";
            try {
              const rr = remotes.find(x => String(x.remoteHash || "").toLowerCase() === String(h).toLowerCase());
              if (rr && rr.name) nm = rr.name;
            } catch (e) { }
            const b = document.createElement("button");
            b.textContent = "🤝 " + nm + " ✕";
            b.title = "End the alliance with " + nm + " (damage rules go back to normal)";
            b.onclick = async () => {
              if (!confirm("End your alliance with " + nm + "?")) return;
              try { window.MP.removeAlly(h); toast("💔 Alliance ended.", 3000); } catch (e) { toast("⚠️ " + (e.message || "Failed."), 4000); }
            };
            ar.appendChild(b);
          }
          el.appendChild(ar);
        }
        if (remotes.length) {
          const qr = document.createElement("div");
          qr.style.cssText = "margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-size:12px";
          const lab = document.createElement("span");
          lab.style.cssText = "opacity:0.7";
          lab.textContent = "Travelers:";
          qr.appendChild(lab);
          for (const r of remotes) {
            const h = String(r.remoteHash || "").toLowerCase();
            let allied = false;
            try { allied = !!(window.MP.isAlliedHash && window.MP.isAlliedHash(h)); } catch (e) { }
            const chip = document.createElement("span");
            chip.style.cssText = "display:inline-flex;gap:4px;align-items:center;border:1px solid #3a4a5a;border-radius:8px;padding:2px 4px 2px 8px";
            const nm = document.createElement("span");
            nm.textContent = (allied ? "🤝 " : "") + (r.name || "Traveler");
            chip.appendChild(nm);
            const mkq = (label, title, fn) => { const b = document.createElement("button"); b.textContent = label; b.title = title; b.onclick = fn; chip.appendChild(b); };
            mkq("💬", "Open direct chat with " + (r.name || "them"), () => {
              try {
                const live = (window.MP.getRemotes() || []).find(x => String(x.remoteHash || "").toLowerCase() === h);
                if (live) openChat(live);
              } catch (e) { }
            });
            mkq(allied ? "🤝✓" : "🤝", allied ? "Allied — tap to end the alliance" : "Ask to ally (no damage either way, shared map)", async () => {
              try {
                if (window.MP.isAlliedHash(h)) {
                  if (!confirm("End your alliance?")) return;
                  window.MP.removeAlly(h);
                } else {
                  window.MP.requestAlly(h);
                  toast("🤝 Ally request sent — they answer from 🌐 presence.", 4000);
                }
              } catch (e) { toast("⚠️ " + (e.message || "Ally failed."), 4000); }
            });
            mkq("⚖️", "Open the trade menu with " + (r.name || "them"), () => { try { openPlayerTrade(h); } catch (e) { toast("⚠️ " + (e.message || "Trade failed."), 4000); } });
            qr.appendChild(chip);
          }
          el.appendChild(qr);
          // per-traveler party rosters: who walks with whom (name lv + hp)
          try {
            const pr = document.createElement("div");
            pr.style.cssText = "margin-top:4px;display:flex;flex-direction:column;gap:2px;font-size:12px;opacity:0.9";
            for (const r of remotes) {
              const party = Array.isArray(r.party) ? r.party : null;
              if (!party || !party.length) continue;
              const line = document.createElement("div");
              let bits = "";
              try {
                bits = party.map((q) => {
                  const nm = String((q && q.n) || "Ally").slice(0, 16);
                  const lv = Math.max(1, (q && q.lv) | 0 || 1);
                  const hp = Math.max(0, Math.round(Number((q && q.hp) || 0)));
                  const mh = Math.max(1, Math.round(Number((q && q.maxHp) || 0) || 40));
                  return nm + " lv" + lv + " ❤" + hp + "/" + mh;
                }).join(" · ");
              } catch (e2) { bits = ""; }
              line.textContent = "👥 " + (r.name || "Traveler") + "'s party (" + party.length + "): " + bits;
              pr.appendChild(line);
            }
            if (pr.childNodes.length) el.appendChild(pr);
          } catch (e2) {}
        }
      } catch (e) { }
      el.appendChild(row);
    } catch (e) { }
  }
  async function joinChannelFlow(hostIdOrLink, name, appearance = null, tint = null, opts = null) {
    let hid = '';
    try { hid = window.MP && window.MP.parseHostInvite ? window.MP.parseHostInvite(hostIdOrLink) : ''; } catch (e) {}
    // Host enter (loopback): no invite needed — Hub is already open locally.
    let hostEnter = false;
    try { hostEnter = !!(window.MPNet && window.MPNet.hubOpenFor && window.MPNet.hubOpenFor() && !hid); } catch (e) {}
    if (!hid && !hostEnter) { toast('That invite looks wrong — paste the host\'s code or full invite link.', 4000); throw new Error('bad invite'); }
    opts = opts || {};
    // Fresh heroes only when nobody remembers you: the loader hides first so
    // the creator modal isn't buried under it, then reshows for the join.
    if (!opts.getName) opts.getName = async () => {
      try { hideLoading(); } catch (e) {}
      let picked = null;
      try { picked = await promptHeroName('Name your hero for this session:'); }
      catch (e) { picked = null; }
      try { showLoading(hostEnter ? 'Entering your world...' : 'Joining host...'); } catch (e2) {}
      try { setLoading(40, 'Finding fellow travelers...'); } catch (e2) {}
      return picked;
    };
    if (name) name = String(name).slice(0, 16) || 'Wanderer';
    showLoading(hostEnter ? 'Entering your world...' : 'Joining host...');
    try {
      setLoading(30, hostEnter ? 'Waking your world...' : 'Finding the host...');
      const j = await window.MP.joinChannel(hostEnter ? '' : hid, name, appearance, tint, opts);
      setLoading(70, 'Waking the shared vale...');
      try {
        if (window.MP.isHost && !window.MP.isHost()) {
          setLoading(78, 'Gathering villagers...');
          await window.MP.waitForInitialViewers((st) => {
            try {
              if (st.nearN > 0) setLoading(88, 'The vale wakes...');
              else if (st.snapCount > 0) setLoading(82, 'Listening for heartbeats... (' + Math.min(12, Math.round(st.elapsed / 1000)) + 's)');
            } catch (e) { }
          });
        }
      } catch (e) { }
      setLoading(94, 'Opening the gates...');
      if ($('titleScreen')) $('titleScreen').hidden = true;
      await window.Game.startPlaying();
      try {
        if (hostEnter) {
          let _h = null;
          try { _h = window.MP.hostSessionId ? window.MP.hostSessionId() : null; } catch (e) {}
          if (_h) history.replaceState(null, '', '#host=' + _h);
        } else history.replaceState(null, '', '#host=' + hid);
      } catch (e) { }
      hideLoading();
      renderMpChat(); renderMpPresence();
      try {
        const hosting = window.MP.isHost && window.MP.isHost();
        let link = '';
        try { const _h2 = window.MP.hostSessionId ? window.MP.hostSessionId() : (!hosting ? hid : null); if (_h2 && window.MP.inviteLink) link = window.MP.inviteLink(_h2); } catch (e) {}
        try { refreshMpHostShare(link); } catch (e) {}
        if (hosting) {
          try { if (link) await navigator.clipboard.writeText(link); } catch (e) {}
          toast('You host the world on THIS machine — link copied, share it to invite friends for this session.', 7000);
          try { if (link) prompt('Share this invite link (anyone with it joins this live session):', link); } catch (e) {}
        } else toast('Joined ' + name + ' — the world lives on the host\'s machine.', 6000);
      } catch (e) { toast('Joined as ' + name + '.', 6000); }
      return j;
    } catch (e) {
      console.error(e);
      hideLoading();
      toast(String((e && e.message) || 'Could not join — ask the host for a fresh link.'), 6000);
      try { await renderMpWorlds(); } catch (e2) { }
      throw e;
    }
  }
  async function createChannelFlow(name, appearance = null, tint = null, partyMax = 4, worldId = null) {
    // Legacy entry (callers pass a picked hero): host directly, no re-prompt.
    if (!name) return hostGameFlow(worldId, null, appearance, tint, partyMax);
    return hostGameFlow(worldId, name, appearance, tint, partyMax);
  }

  // ---------- title ----------  // ---------- title ----------
  // hero naming: no title-screen input — every fresh world/channel opens the
  // in-page creator once (empty box, no placeholder), then the name AND the
  // look ride the save/hero. Resolves {name, appearance, tint, gender} or null.
  let hcResolve = null, hcWired = false, hcPreviewGear = null, hcRaceSel = "human", hcGenderSel = "male";
  function hcFillSelect(el, items, cur, labels) {
    if (!el) return;
    el.innerHTML = "";
    for (const v of items) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = (labels && labels[v]) || v;
      if (v === cur) o.selected = true;
      el.appendChild(o);
    }
  }
  function hcRaceBonusText(race) {
    try {
      const A = window.Appearance;
      const labelFor = (k) => {
        if (k === "agi") return "Agility";
        const names = { str: "Strength", end: "Endurance", agi: "Agility", int: "Intellect", cha: "Charm", luk: "Luck", for: "Fortitude" };
        return names[k] || k;
      };
      let base = "";
      if (race === "human") base = "🧑 Human — +1 all stats. Versatile and ambitious.";
      else {
        const b = (A.RACE_BONUS && A.RACE_BONUS[race]) || {};
        const parts = Object.keys(b).filter(k => b[k] > 0).map(k => `+${b[k]} ${labelFor(k)}`);
        base = `${A.RACE_ICON[race] || "✨"} ${A.RACE_LABEL[race] || race} — ${parts.join(", ")}.`;
      }
      try {
        const ab = (A.RACE_ABILITY && A.RACE_ABILITY[race]) || ((window.Races && window.Races) ? null : null);
        if (ab) base += " " + ab;
        else if (A.RACE_DESC && A.RACE_DESC[race] && A.RACE_DESC[race].length > base.length) base = A.RACE_DESC[race].indexOf("—") >= 0 ? `${A.RACE_ICON[race] || "✨"} ${A.RACE_LABEL[race] || race} — ${A.RACE_DESC[race]}` : base + " " + A.RACE_DESC[race];
      } catch (e2) { }
      return base;
    } catch (e) { return ""; }
  }
  function hcPaintRaces() {
    try {
      const box = $("hcRaces");
      const A = window.Appearance;
      if (!box || !A) return;
      box.innerHTML = "";
      for (const rc of A.RACES) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hc-race" + (hcRaceSel === rc ? " sel" : "");
        b.dataset.race = rc;
        b.title = hcRaceBonusText(rc);
        const ic = document.createElement("span"); ic.className = "ri"; ic.textContent = A.RACE_ICON[rc] || "✨";
        const nm = document.createElement("span"); nm.textContent = A.RACE_LABEL[rc] || rc;
        b.appendChild(ic); b.appendChild(nm);
        b.onclick = () => { hcSetRace(rc, true); };
        box.appendChild(b);
      }
      const d = $("hcRaceDesc");
      if (d) {
        try {
          const A2 = window.Appearance || {};
          const rc = hcRaceSel;
          const b = (A2.RACE_BONUS && A2.RACE_BONUS[rc]) || {};
          const names = { str: "Strength", end: "Endurance", agi: "Agility", int: "Intellect", cha: "Charm", luk: "Luck", for: "Fortitude" };
          let stats = "";
          if (rc === "human") stats = "+1 all stats";
          else stats = Object.keys(b).filter(k => b[k] > 0).map(k => `+${b[k]} ${names[k] || k}`).join(", ");
          const ab = (A2.RACE_ABILITY && A2.RACE_ABILITY[rc]) || "";
          const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          d.innerHTML = `<b>${esc((A2.RACE_ICON[rc] || "") + " " + (A2.RACE_LABEL[rc] || rc))}</b> — ${esc(stats)}.<br>✨ ${esc(ab)}`;
          d.title = hcRaceBonusText(rc);
        } catch (eD) { d.textContent = hcRaceBonusText(hcRaceSel); }
      }
      // body/mane labels follow the race
      const sl = $("hcSkinLabel"), hl = $("hcHairLabel");
      if (sl && sl.childNodes && sl.childNodes[0]) sl.childNodes[0].textContent = `🧑 ${A.RACE_BODY_LABEL[hcRaceSel] || "Skin"} `;
      if (hl && hl.childNodes && hl.childNodes[0]) hl.childNodes[0].textContent = `💇 ${A.RACE_HAIR_LABEL[hcRaceSel] || "Hair"} `;
    } catch (e) { }
  }
  // pick a race in the creator; with defaults, reset the color pickers to
  // that race's signature palette so every race starts looking like itself
  // hero sex: picked once in the creator, slight look differences in game
  // (lashes + waist for females; males keep the legacy silhouette)
  const HC_GENDERS = [["male", "♂ Male"], ["female", "♀ Female"]];
  function hcPaintGenders() {
    try {
      const box = $("hcGenders");
      if (!box) return;
      box.innerHTML = "";
      for (const [v, label] of HC_GENDERS) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hc-race" + (hcGenderSel === v ? " sel" : "");
        b.dataset.gender = v;
        b.textContent = label;
        b.onclick = () => { hcGenderSel = v; hcPaintGenders(); hcDrawPreview(); };
        box.appendChild(b);
      }
    } catch (e) { }
  }
  function hcSetRace(race, applyDefaults) {
    try {
      const A = window.Appearance;
      if (!A || !A.RACES.includes(race)) return;
      hcRaceSel = race;
      if (applyDefaults) {
        const sk = (A.RACE_SKINS[race] || [])[0], mn = (A.RACE_MANES[race] || [])[0], ey = (A.RACE_EYES[race] || [])[0];
        if (sk && $("hcSkin")) $("hcSkin").value = sk;
        if (mn && $("hcHairColor")) $("hcHairColor").value = mn;
        if (ey && $("hcEyeColor")) $("hcEyeColor").value = ey;
      }
      hcPaintRaces();
      hcDrawPreview();
    } catch (e) { }
  }
  function hcReadAppearance() {
    try {
      const A = window.Appearance;
      if (!A) return null;
      return A.sanitize({
        skin: $("hcSkin") && $("hcSkin").value,
        hairStyle: $("hcHairStyle") && $("hcHairStyle").value,
        hairColor: $("hcHairColor") && $("hcHairColor").value,
        eyeColor: $("hcEyeColor") && $("hcEyeColor").value,
        outfit: $("hcOutfit") && $("hcOutfit").value,
        accessory: $("hcAccessory") && $("hcAccessory").value,
        race: hcRaceSel || "human",
      }, "adventurer");
    } catch (e) { return null; }
  }
  function hcDrawPreview() {
    try {
      const cv = $("hcPreview");
      if (!cv || !window.Sprites) return;
      const g = cv.getContext("2d");
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, cv.width, cv.height);
      const tint = ($("hcTint") && $("hcTint").value) || "#4da3ff";
      const app = hcReadAppearance();
      if (app && $("hcHairStyle")) app.hairStyle = $("hcHairStyle").value || app.hairStyle;
      // preview gear may arrive as player equipment ({weapon,armor}) or
      // sprite gear ({w,a}) — normalize so the held bow/armor shows.
      let pvg = hcPreviewGear || { w: "rusted_sword", a: null };
      try {
        if (pvg && !pvg.w && (pvg.weapon || pvg.armor)) pvg = { w: pvg.weapon || null, a: pvg.armor || null };
      } catch (e) { }
      const spr = window.Sprites.actor("player", tint, "p", pvg, app, hcGenderSel || "male");
      const s = Math.min(cv.width / 32, cv.height / 40);
      const dw = Math.max(1, Math.round(32 * s)), dh = Math.max(1, Math.round(40 * s));
      // actor art may be supersampled (2x + vector ink): smooth the fit blit
      // so fractional scales stay clean instead of shimmering.
      try { g.imageSmoothingEnabled = true; } catch (e) {}
      g.drawImage(spr, Math.round((cv.width - dw) / 2), Math.round(cv.height - dh), dw, dh);
    } catch (e) { }
  }
  function hcWireOnce() {
    if (hcWired) return;
    hcWired = true;
    try {
      const redraw = () => hcDrawPreview();
      for (const id of ["hcOutfit", "hcHairStyle", "hcAccessory"]) {
        const el = $(id);
        if (el) el.addEventListener("change", redraw);
      }
      for (const id of ["hcTint", "hcSkin", "hcHairColor", "hcEyeColor"]) {
        const el = $(id);
        if (el) el.addEventListener("input", redraw);
      }
      const rnd = $("hcRandomBtn");
      if (rnd) rnd.onclick = () => {
        try {
          const A = window.Appearance;
          if (!A) return;
          const rc = A.RACES[(Math.random() * A.RACES.length) | 0] || "human";
          hcRaceSel = rc;
          hcGenderSel = Math.random() < 0.5 ? "male" : "female";
          hcPaintGenders();
          const r = A.randomAppearance(null, rc);
          if ($("hcOutfit")) $("hcOutfit").value = r.outfit;
          if ($("hcHairStyle")) $("hcHairStyle").value = r.hairStyle;
          if ($("hcAccessory")) $("hcAccessory").value = r.accessory;
          if ($("hcSkin")) $("hcSkin").value = r.skin;
          if ($("hcHairColor")) $("hcHairColor").value = r.hairColor;
          if ($("hcEyeColor")) $("hcEyeColor").value = r.eyeColor;
          hcPaintRaces();
          hcDrawPreview();
        } catch (e) { }
      };
      const ok = $("hcConfirmBtn");
      if (ok) ok.onclick = () => {
        const raw = ($("hcName") && $("hcName").value) || "";
        const clean = String(raw).trim().slice(0, 16);
        if (!clean) { toast("That name is empty — try again.", 3000); try { $("hcName").focus(); } catch (e) { } return; }
        const tint = ($("hcTint") && $("hcTint").value) || "#4da3ff";
        const app = hcReadAppearance();
        if (app && $("hcHairStyle")) app.hairStyle = $("hcHairStyle").value || app.hairStyle;
        closeHeroCreator({ name: clean, appearance: app, tint, gender: hcGenderSel || "male" });
      };
      const no = $("hcCancelBtn");
      if (no) no.onclick = () => closeHeroCreator(null);
      const m = $("heroCreatorModal");
      if (m) m.addEventListener("keydown", (ev) => {
        if (!$("heroCreatorModal") || $("heroCreatorModal").hidden) return;
        if (ev.key === "Escape") { ev.stopPropagation(); ev.preventDefault(); closeHeroCreator(null); }
        else if (ev.key === "Enter" && ev.target && ev.target.id === "hcName") { ev.stopPropagation(); ev.preventDefault(); if ($("hcConfirmBtn")) $("hcConfirmBtn").click(); }
      }, true);
    } catch (e) { }
  }
  function closeHeroCreator(result) {
    try { if ($("heroCreatorModal")) $("heroCreatorModal").hidden = true; } catch (e) { }
    try {
      const G = window.Game && window.Game.G;
      if (G) for (const k of Object.keys(G.keys || {})) G.keys[k] = false;
      if (G) G.mouse.down = false;
    } catch (e) { }
    const r = hcResolve;
    hcResolve = null;
    hcPreviewGear = null;
    if (r) r(result);
  }
  // opts: {title, sub, confirmLabel, initialName, appearance, tint, gender,
  //        previewGear, allowCancel}
  function openHeroCreator(opts) {
    opts = opts || {};
    hcWireOnce();
    return new Promise((resolve) => {
      hcResolve = resolve;
      try {
        const A = window.Appearance;
        hcGenderSel = (opts.gender === "female" || opts.gender === "male") ? opts.gender : "male";
        hcPaintGenders();
        const initApp = (A && opts.appearance) ? A.sanitize(opts.appearance, "adventurer") : (A ? A.defaultAppearance() : null);
        if ($("hcTitle")) $("hcTitle").textContent = opts.title || "Name your hero";
        if ($("hcSub")) $("hcSub").textContent = opts.sub || "Name them, then dress them — borrow any NPC outfit, pick hair, colors and extras. The preview is exactly what fellow travelers will see.";
        if ($("hcConfirmBtn")) $("hcConfirmBtn").textContent = opts.confirmLabel || "✨ Begin";
        const cb = $("hcCancelBtn");
        if (cb) cb.hidden = opts.allowCancel === false;
        if ($("hcName")) $("hcName").value = (opts.initialName != null ? String(opts.initialName).slice(0, 16) : "");
        if (A && initApp) {
          hcFillSelect($("hcOutfit"), A.OUTFITS, initApp.outfit, A.OUTFIT_LABEL);
          hcFillSelect($("hcHairStyle"), A.HAIR_STYLES, initApp.hairStyle, A.HAIR_LABEL);
          hcFillSelect($("hcAccessory"), A.ACCESSORIES, initApp.accessory);
          if ($("hcSkin")) $("hcSkin").value = initApp.skin;
          if ($("hcHairColor")) $("hcHairColor").value = initApp.hairColor;
          if ($("hcEyeColor")) $("hcEyeColor").value = initApp.eyeColor;
          hcRaceSel = (initApp.race && A.RACES.includes(initApp.race)) ? initApp.race : "human";
          hcPaintRaces();
        }
        if ($("hcTint")) $("hcTint").value = opts.tint || "#4da3ff";
        hcPreviewGear = opts.previewGear || { w: "rusted_sword", a: null };
        try {
          const G = window.Game && window.Game.G;
          if (G) { for (const k of Object.keys(G.keys || {})) G.keys[k] = false; G.mouse.down = false; }
        } catch (e) { }
        if ($("heroCreatorModal")) $("heroCreatorModal").hidden = false;
        hcDrawPreview();
        setTimeout(() => { try { if ($("hcName")) $("hcName").focus(); } catch (e) { } }, 60);
      } catch (e) { resolve(null); }
    });
  }
  // Every fresh world/channel opens the creator once; returning heroes skip
  // it (their saved look rides along). Resolves {name, appearance, tint, gender}.
  async function promptHeroName(title, opts) {
    opts = opts || {};
    const picked = await openHeroCreator({
      title: title || "Name your hero",
      initialName: opts.initialName != null ? opts.initialName : "",
      appearance: opts.appearance || null,
      tint: opts.tint || "#4da3ff",
      gender: opts.gender || null,
      previewGear: opts.previewGear || { w: "rusted_sword", a: null },
      confirmLabel: opts.confirmLabel || "✨ Begin",
      allowCancel: opts.allowCancel !== false,
    });
    return picked;
  }
  async function boot() {
    // Boot gate: the loading screen is already visible from first paint
    // (the title starts hidden in the markup). Drive it through init and
    // reveal the title only once everything — saves included — is ready.
    try { showLoading("Dreaming Emberhold..."); } catch (e) { }
    try { setLoading(12, "Waking the hearth..."); } catch (e) { }
    wireInputs();
    window.Game.startLoop();
    try { setLoading(25, "Kindling the engine..."); } catch (e) { }
    // ask the browser to stop treating our saves as evictable cache (silent;
    // the pause menu's Storage section shows the result + can re-prompt)
    try { requestPersistentStorage(false); } catch (e) { }
    refreshSoundUI();
    try { renderThemePickers(); } catch (e) { }
    // title buttons
    // New game with the hero creator up front, so the flow works
    // identically inline (blocked popup) and in a world window. One button
    // for every slot: it starts a fresh hero in the SELECTED slot (asks
    // before overwriting); resuming a saved hero is each row's Load button.
    async function newJourneyFlow(slot) {
      slot = String(slot || "1");
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      const picked = await promptHeroName("Name your hero:");
      if (!picked) return;
      const name = picked.name;
      try {
        const existing = await window.Game.loadSave(slot);
        if (existing && existing.player) {
          if (!confirm("Slot " + slot + " holds " + (existing.player.name || "a hero") + " (lv " + (existing.player.lv || 1) + "). Overwrite it?")) return;
        }
      } catch (e) { }
      showLoading("Dreaming Emberhold...");
      try {
        setLoading(15, "Kindling a new frontier...");
        const started = await window.Game.newGame(name, slot, picked.appearance, picked.tint, picked.gender);
        if (!started) {
          hideLoading();
          toast("The dream faltered — try again.", 4000);
          await renderTitleSlots();
          refreshTitleStatus();
          return;
        }
        // seed spawn chunks + npcs
        setLoading(40, "Shaping forests and ruins...");
        await window.Game.ensureChunks();
        setLoading(65, "Dreaming up villagers...");
        await window.AIDirector.enrichChunk(0, 0);
        setLoading(85, "Lighting the braziers...");
        await window.Game.refreshNpcCache();
        setLoading(95, "Opening the gates...");
        $("titleScreen").hidden = true;
        await window.Game.startPlaying();
        hideLoading();
        toast("Welcome to " + ((window.Game.G.player && window.Game.G.player.spawnName) || "Emberhold") + ", " + name + ". (Slot " + slot + ") WASD to walk, E to talk, click to fight.", 5000);
      } catch (e) {
        console.error(e);
        hideLoading();
        if ($("titleScreen")) $("titleScreen").hidden = false;
        if ($("titleStatus")) $("titleStatus").textContent = "The dream faltered — try again.";
      }
      await renderTitleSlots();
      refreshTitleStatus();
    }
    $("newBtn").onclick = async () => {
      if ($("loadingScreen") && !$("loadingScreen").hidden) return;
      await newJourneyFlow(titleSlotSel || "1");
    };
    $("wipeBtn").onclick = async () => {
      if (!confirm("Forget EVERYTHING? All 5 slots and their worlds will be erased.")) return;
      try {
        for (let i = 1; i <= 5; i++) { try { await window.Game.deleteSlot(String(i)); } catch (e) { } }
      } catch (e) { }
      try { history.replaceState(null, "", String(location.href.split("#")[0])); } catch (e2) { }
      location.reload();
    };
    // multiplayer: Host picks one of its worlds (fresh invite link per
    // session); Join takes a host invite. Worlds + heroes persist here.
    try {
      const hid0 = window.MP && window.MP.parseHostInvite ? window.MP.parseHostInvite(location.hash || '') : '';
      if (hid0 && $('mpCodeInput')) $('mpCodeInput').value = hid0;
    } catch (e) { }
    if ($('mpNewWorldBtn')) $('mpNewWorldBtn').onclick = async () => {
      if ($('loadingScreen') && !$('loadingScreen').hidden) return;
      const raw = (($('mpNewWorldInput') && $('mpNewWorldInput').value) || '').trim().slice(0, 32);
      let w = null;
      try { w = window.MP.createHostWorld ? window.MP.createHostWorld(raw || 'My World') : null; } catch (e) {}
      if (!w) { toast('Could not create a world.', 4000); return; }
      try { if ($('mpNewWorldInput')) $('mpNewWorldInput').value = ''; } catch (e) {}
      await renderMpWorlds();
      toast('World "' + w.name + '" created — press Host to open it.', 4000);
    };
    if ($('mpJoinBtn')) $('mpJoinBtn').onclick = async () => {
      if ($('loadingScreen') && !$('loadingScreen').hidden) return;
      const raw = (($('mpCodeInput') && $('mpCodeInput').value) || '');
      await joinGameFlow(raw);
    };
    if ($('mpCopyLinkBtn')) $('mpCopyLinkBtn').onclick = async () => { await copyWorldLink(); };
    wireFastLinkBox('mpFastHost'); wireFastLinkBox('mpFastJoin');
    try { syncFastLinkBoxes(); } catch (e) {}

    // title tabs: singleplayer saves vs multiplayer worlds + practice
    if ($("tabSP")) $("tabSP").onclick = () => selectTitleTab("sp");
    if ($("tabMP")) $("tabMP").onclick = () => selectTitleTab("mp");
    if ($("tabPR")) $("tabPR").onclick = () => selectTitleTab("pr");
    // 📖 Codex opens as an in-tab panel (movable pseudo-window, deep-linkable)
    if ($("codexBtn")) $("codexBtn").onclick = () => {
      let ok = false;
      try { ok = !!(window.Codex && window.Codex.openPanel && window.Codex.openPanel()); } catch (e) { ok = false; }
      if (!ok) toast("Codex failed to open.", 4000);
    };
    if ($("titleChangelogBtn")) $("titleChangelogBtn").onclick = () => { try { window.Changelog.openManual(); } catch (e) { } };
    if ($("practiceEnterBtn")) $("practiceEnterBtn").onclick = () => { enterPracticeFlow(); };
    if ($("practiceResetBtn")) $("practiceResetBtn").onclick = async () => {
      if (!confirm("Erase the practice world? (Slots 1–5 are untouched.)")) return;
      try {
        if (window.Game.currentSlot && window.Game.currentSlot() === "P" && window.Game.G && window.Game.G.mode === "playing") {
          toast("You are standing in it — Save & title out first, then reset.", 4000);
          return;
        }
        await window.Game.deleteSlot("P");
        toast("Practice grounds raked flat.", 3000);
      } catch (e) { toast("Reset faltered.", 3000); }
      refreshPracticeStatus();
    };
    // practice setup modal (HUD 🛠️ button, practice worlds only)
    if ($("practiceHudBtn")) $("practiceHudBtn").onclick = () => togglePractice();
    if ($("practiceDimSurf")) $("practiceDimSurf").onclick = () => { practiceTravel("surf"); };
    if ($("practiceDimHell")) $("practiceDimHell").onclick = () => { practiceTravel("hell"); };
    if ($("practiceDimHeaven")) $("practiceDimHeaven").onclick = () => { practiceTravel("heaven"); };
    if ($("practiceGoBtn")) $("practiceGoBtn").onclick = () => {
      practiceTeleport($("practiceXInput") ? $("practiceXInput").value : 0, $("practiceYInput") ? $("practiceYInput").value : 0);
    };
    const practiceFmtPool = (hp) => {
      try {
        if (hp >= 1e6) return (Math.round(hp / 1e5) / 10) + "M";
        if (hp >= 1e4) return (Math.round(hp / 100) / 10) + "k";
        if (hp >= 1e3) return (Math.round(hp / 100) / 10) + "k";
        return String(hp);
      } catch (e) { return String(hp); }
    };
    if ($("practiceSummonBtn")) $("practiceSummonBtn").onclick = () => {
      const G = window.Game && window.Game.G;
      const p = G && G.player;
      if (!p) return;
      if (!isPractice()) { toast("Sparring lives in practice worlds — title screen → 🛠️ Practice."); return; }
      const kind = $("practiceMobSel") ? $("practiceMobSel").value : null;
      let lv = $("practiceMobLvInput") ? $("practiceMobLvInput").value : (p.lv || 1);
      if (String(lv).trim() === "") { toast("👹 Enter a level to summon at.", 2500); return; }
      let m = null;
      try { m = (typeof window.Game.practiceSummonMob === "function") ? window.Game.practiceSummonMob(kind, lv) : null; } catch (e) { m = null; }
      if (m && m.capped) { toast("👹 The lab is full — 🧹 Clear some summons first (12 max).", 3500); return; }
      if (!m) { toast("👹 Summon faltered — pick a kind and a level.", 3000); return; }
      try { window.UI.updateHUD(); } catch (e) { }
      toast(`👹 ${m.name} (lv ${m.lv}) steps out — ${practiceFmtPool(m.maxHp)} HP.`, 4000);
    };
    if ($("practiceClearBtn")) $("practiceClearBtn").onclick = () => {
      if (!isPractice()) { toast("Sparring lives in practice worlds — title screen → 🛠️ Practice."); return; }
      let n = 0;
      try { n = (typeof window.Game.practiceClearSummons === "function") ? window.Game.practiceClearSummons() : 0; } catch (e) { n = 0; }
      try { window.UI.updateHUD(); } catch (e) { }
      toast(n > 0 ? `🧹 Dismissed ${n} sparring ${n === 1 ? "mob" : "mobs"}.` : "🧹 Nothing summoned.", 3000);
    };
    if ($("practiceLvBtn")) $("practiceLvBtn").onclick = () => {
      practiceSetLevel($("practiceLvInput") ? $("practiceLvInput").value : 1);
      renderPractice();
    };
    if ($("practiceGoldBtn")) $("practiceGoldBtn").onclick = () => {
      const p = window.Game.G.player;
      if (!p || !isPractice()) return;
      const raw = $("practiceGoldInput") ? $("practiceGoldInput").value : "";
      if (String(raw).trim() === "") { toast("💰 Enter how much gold to grant.", 2500); return; }
      let n = Math.trunc(Number(raw));
      if (!isFinite(n) || n <= 0) { toast("💰 Enter how much gold to grant.", 2500); return; }
      n = Math.min(n, 999999999);
      try { p.gold = Math.max(0, ((p.gold | 0) || 0) + n); } catch (e) { }
      try { window.Game.saveGame(true); } catch (e) { }
      try { window.UI.updateHUD(); renderPractice(); } catch (e) { }
      toast("💰 +" + n.toLocaleString() + "g — purse: " + (((p.gold | 0) || 0).toLocaleString()) + "g.", 3000);
    };
    if ($("practiceAllSpells")) $("practiceAllSpells").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      let n = 0;
      try {
        for (const id of Object.keys(window.CFG.ABILITIES || {})) {
          if (window.CFG.ABILITIES[id].kind === "technique") continue;
          if ((p.abilities || []).includes(id)) continue;
          try { window.Items.learnSpell(p, id); n++; } catch (e) { }
        }
      } catch (e) { }
      try { window.Entities.ensureProgression(p); window.Entities.recalcDerived(p, true); } catch (e) { }
      try { window.Game.saveGame(true); } catch (e) { }
      try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
      toast(`📖 Learned ${n} spell${n === 1 ? "" : "s"}.`, 3000);
    };
    if ($("practiceAllTech")) $("practiceAllTech").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      let n = 0;
      try {
        for (const id of Object.keys(window.CFG.TECHNIQUES || {})) {
          if ((p.techniques || []).includes(id)) continue;
          if (practiceLearnTechQuiet(p, id)) n++;
        }
      } catch (e) { }
      try { window.Entities.ensureProgression(p); window.Entities.recalcDerived(p, true); } catch (e) { }
      try { window.Game.saveGame(true); } catch (e) { }
      try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
      toast(`⚔️ Learned ${n} Deep Art${n === 1 ? "" : "s"}.`, 3000);
    };
    const practiceGiveGear = (selId, after) => {
      const p = window.Game.G.player;
      if (!p) return;
      const sel = $(selId);
      const id = sel ? sel.value : null;
      if (!id || !window.Items.ITEMS[id]) { toast("Pick a piece first.", 2500); return; }
      try { window.Items.addItem(p, id, 1); } catch (e) { }
      try { if (after) after(p, id); } catch (e) { }
      try { window.Entities.recalcDerived(p, true); } catch (e) { }
      try { window.Game.saveGame(true); } catch (e) { }
      try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
      toast(`${window.Items.ITEMS[id].name} — in your pack.`, 3000);
    };
    if ($("practiceGiveWep")) $("practiceGiveWep").onclick = () => practiceGiveGear("practiceWeaponSel", null);
    if ($("practiceWieldWep")) $("practiceWieldWep").onclick = () => practiceGiveGear("practiceWeaponSel", (p, id) => {
      try {
        if (Array.isArray(p.hotbar)) {
          let dd = 0;
          try { if (window.Items && window.Items.getDefaultWeaponSlot) dd = window.Items.getDefaultWeaponSlot(p); } catch (e) { }
          p.hotbar[dd] = { kind: "item", id };
        }
      } catch (e) { }
      try { window.Items.syncPlayerAttackWeapon(p); } catch (e) { }
      toast(`Wielding ${window.Items.ITEMS[id].name} as your default weapon.`, 3000);
    });
    if ($("practiceFists")) $("practiceFists").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      try {
        if (Array.isArray(p.hotbar)) {
          let dd = 0;
          try { if (window.Items && window.Items.getDefaultWeaponSlot) dd = window.Items.getDefaultWeaponSlot(p); } catch (e) { }
          p.hotbar[dd] = null;
        }
        window.Items.syncPlayerAttackWeapon(p);
        window.Entities.recalcDerived(p, true);
        window.Game.saveGame(true);
      } catch (e) { }
      try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
      toast("🥋 Bare fists — Martial Arts is live.", 3000);
    };
    if ($("practiceGiveArm")) $("practiceGiveArm").onclick = () => practiceGiveGear("practiceArmorSel", null);
    if ($("practiceWearArm")) $("practiceWearArm").onclick = () => practiceGiveGear("practiceArmorSel", (p, id) => {
      let r = null;
      try { r = window.Items.equip(p, id); } catch (e) { }
      toast((r && r.msg) || "Equipped.", 3000);
    });
    const practiceRefreshAfterGive = (msg) => {
      const p = window.Game.G.player;
      try { window.Entities.recalcDerived(p, true); } catch (e) { }
      try { window.Game.saveGame(true); } catch (e) { }
      try { window.UI.updateHUD(); window.UI.updateHotbar(); renderPractice(); } catch (e) { }
      if (msg) toast(msg, 3500);
    };
    // Fragments are counted by DISTINCT delve-marks (p.hellFragments), not
    // by the item stack — handing the item alone would never forge. So each
    // practice fragment also plants a practice_N mark, up to 12 distinct.
    const practiceGiveFragments = (n) => {
      const p = window.Game.G.player;
      if (!p || !isPractice()) return;
      try {
        if (!p.hellFragments || typeof p.hellFragments !== "object") p.hellFragments = {};
        n = Math.max(1, Math.min(12, n | 0 || 1));
        let added = 0, i = 1;
        while (added < n && Object.keys(p.hellFragments).length < 12 && i < 500) {
          const key = "practice_" + i;
          i++;
          if (p.hellFragments[key]) continue;
          p.hellFragments[key] = 1;
          try { window.Items.addItem(p, "hell_fragment", 1); } catch (e) { }
          added++;
        }
        let fragN = 0;
        try { fragN = window.Hell ? window.Hell.fragmentCount(p) : Object.keys(p.hellFragments).length; } catch (e) { fragN = Object.keys(p.hellFragments).length; }
        practiceRefreshAfterGive(added ? `🩸 +${added} Hell Fragment${added === 1 ? "" : "s"} (${fragN}/12 distinct).` : "🩸 Already at 12/12 — join them (🎒 Inventory) into a Hell Sphere.");
      } catch (e) { }
    };
    const practiceGiveSphere = (kind) => {
      const p = window.Game.G.player;
      if (!p || !isPractice()) return;
      try {
        if (kind === "hell") {
          const has = window.Hell ? window.Hell.hasSphere(p) : false;
          if (has) { toast("🔮 Already holding a Hell Sphere.", 2500); return; }
          window.Items.addItem(p, "hell_sphere", 1);
          practiceRefreshAfterGive("🔮 Hell Sphere — in your pack. E on a far tower (1000 out) to wake hell.");
        } else {
          const has = window.Heaven ? window.Heaven.hasSphere(p) : false;
          if (has) { toast("🌅 Already holding a Heavenly Sphere.", 2500); return; }
          window.Items.addItem(p, "heavenly_sphere", 1);
          practiceRefreshAfterGive("🌅 Heavenly Sphere — in your pack. E on a surface hearth to rise.");
        }
      } catch (e) { }
    };
    if ($("practiceFragOne")) $("practiceFragOne").onclick = () => practiceGiveFragments(1);
    if ($("practiceFragFull")) $("practiceFragFull").onclick = () => practiceGiveFragments(12);
    if ($("practiceHellSphere")) $("practiceHellSphere").onclick = () => practiceGiveSphere("hell");
    if ($("practiceHeavenSphere")) $("practiceHeavenSphere").onclick = () => practiceGiveSphere("heaven");
    if ($("practiceHealBtn")) $("practiceHealBtn").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      try {
        p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina;
        window.UI.updateHUD();
      } catch (e) { }
      toast("💚 Whole again.", 2000);
    };
    if ($("practiceCureBtn")) $("practiceCureBtn").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      try {
        if (window.Status && window.Status.cureAll) window.Status.cureAll(p);
        p.burnUntil = 0; p.burnTick = 0; p.slowUntil = 0;
        window.UI.updateHUD();
      } catch (e) { }
      toast("🌿 Cleansed.", 2000);
    };
    if ($("practicePerkBtn")) $("practicePerkBtn").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      let back = 0;
      try {
        // refunded ranks flow back to their OWN tree's point pool — points
        // never cross trees, not even on refund.
        p.treePts = p.treePts || {};
        for (const store of [p.spellPerks, p.weaponPerks]) {
          if (!store || typeof store !== "object") continue;
          for (const k of Object.keys(store)) {
            const v = store[k];
            if (v && typeof v === "object") {
              for (const kk of Object.keys(v)) {
                const r = Math.max(0, v[kk] | 0);
                if (r > 0) {
                  back += r;
                  p.treePts[k] = ((p.treePts[k] | 0) || 0) + r;
                  delete v[kk];
                }
              }
            }
          }
        }
        window.Entities.ensureProgression(p);
        window.Entities.recalcDerived(p, true);
        window.Game.saveGame(true);
      } catch (e) { }
      try { window.UI.updateHUD(); renderPractice(); } catch (e) { }
      toast(back ? `↩️ Refunded ${back} perk rank${back === 1 ? "" : "s"} to their own trees.` : "No spent ranks to refund.", 3000);
    };
    if ($("practiceStatsBtn")) $("practiceStatsBtn").onclick = () => {
      const p = window.Game.G.player;
      if (!p) return;
      const back = practiceResetStats(p);
      toast(back ? `↩️ Stats reset — ${back} stat point${back === 1 ? "" : "s"} refunded.` : "Stats already at base — nothing to refund.", 3000);
    };
    if ($("practiceGodBtn")) $("practiceGodBtn").onclick = () => {
      const p = window.Game.G.player;
      if (!p || !isPractice()) return;
      try {
        p.invincible = !p.invincible;
        try { window.Game.saveGame(true); } catch (e2) { }
      } catch (e) { }
      try { window.UI.updateHUD(); renderPractice(); } catch (e) { }
      toast(p.invincible ? "🛡️ Invincible — nothing can hurt you. Toggle off to feel pain again." : "🛡️ Mortality restored — you bleed like everyone else.", 3000);
    };
    if ($("practiceClose")) $("practiceClose").onclick = () => togglePractice(false);
    if ($("altarBlessBtn")) $("altarBlessBtn").onclick = () => { try { window.Game.takeAltarBlessing(); } catch (e) { } };
    if ($("altarClose")) $("altarClose").onclick = () => { try { $("altarModal").hidden = true; } catch (e) { } };
    // Leaked-modal fuse: if the setup is ever open outside a practice world
    // (e.g. T mashed during a world switch), any click inside just closes it
    // instead of running practice cheats on a real hero. Covers every button
    // in the modal, present and future — the mutators below double-guard.
    if ($("practiceModal")) $("practiceModal").addEventListener("click", function (e) {
      try {
        if (!isPractice()) {
          e.stopPropagation();
          try { $("practiceModal").hidden = true; } catch (e2) { }
        }
      } catch (e) { }
    }, true);
    // title ⚙️ Settings button: scrolls the Options sidebar fully into view
    // (it sits below the fold on phones, half-cut on desktop) + flashes it
    if ($("titleSettingsBtn")) $("titleSettingsBtn").onclick = () => {
      try {
        const side = $("titleOptions");
        if (!side) return;
        try {
          const card = (side.closest && side.closest(".card")) || document.querySelector("#titleScreen .card");
          if (card && card.scrollHeight > card.clientHeight + 4) {
            const cr = card.getBoundingClientRect(), sr = side.getBoundingClientRect();
            card.scrollTo({ top: Math.max(0, card.scrollTop + sr.top - cr.top - 12), behavior: "smooth" });
          } else {
            try { side.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e2) { }
          }
        } catch (e) { try { side.scrollIntoView({ block: "center" }); } catch (e3) { } }
        side.classList.add("side-flash");
        setTimeout(() => { try { side.classList.remove("side-flash"); } catch (e) { } }, 1600);
        setTimeout(() => { try { const t = $("titleThemeSel"); if (t) t.focus({ preventScroll: true }); } catch (e) { } }, 500);
      } catch (e) { }
    };
    try {
      let startTab = "sp";
      try {
        let hasChan = false;
        try { hasChan = !!(window.MP && window.MP.parseHostInvite ? window.MP.parseHostInvite(location.hash || "") : (/[#&]host=([A-Za-z0-9_-]{4,80})/.exec(location.hash || "") || [])[1]); } catch (e) {}
        if (hasChan) startTab = "mp";
      } catch (e) {}
      selectTitleTab(startTab);
    } catch (e) { }
    // returning to this tab refreshes its slot list, in case saves changed
    // while it was away.
    try {
      window.addEventListener("focus", () => {
        try {
          if (window.Game && window.Game.G && window.Game.G.mode === "title") {
            renderTitleSlots();
            try { renderMpWorlds(); } catch (e2) { }
          }
        } catch (e) { }
      });
    } catch (e) { }
    // channel chat send: one rpc per message, echoed back by the server.
    // Guarded while a send is in flight so a double-click / double-Enter
    // can't fire two rpcs (which used to render the message twice). Text is
    // only cleared once the send is accepted — a press during the flight
    // keeps the text so the user can simply hit Enter again.
    let mpChatBusy = false;
    async function sendMpChatBox(text) {
      text = String(text || "").trim().slice(0, 300);
      if (!text || mpChatBusy) return false;
      mpChatBusy = true;
      try { if ($("mpChatSend")) $("mpChatSend").disabled = true; } catch (e) { }
      try { await window.MP.sendChannelChat(text); return true; }
      catch (e) { toast("⚠️ " + (e.message || "Chat failed."), 4000); return false; }
      finally {
        mpChatBusy = false;
        try { if ($("mpChatSend")) $("mpChatSend").disabled = false; } catch (e) { }
      }
    }
    if ($("mpChatSend")) $("mpChatSend").onclick = async () => {
      const inp = $("mpChatInput");
      const text = (inp && inp.value || "").trim();
      if (!text || mpChatBusy) return;
      inp.value = "";
      const ok = await sendMpChatBox(text);
      if (!ok && inp && !inp.value) inp.value = text; // send failed — restore the text
    };
    if ($("mpChatInput")) $("mpChatInput").addEventListener("keydown", async (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        const text = ($("mpChatInput").value || "").trim();
        if (!text || mpChatBusy) return;
        $("mpChatInput").value = "";
        const ok = await sendMpChatBox(text);
        if (!ok && !$("mpChatInput").value) $("mpChatInput").value = text; // send failed — restore the text
      }
    });
    if ($("mpChatHide")) $("mpChatHide").onclick = () => { try { $("mpChatBox").hidden = true; } catch (e) { } };
    // pause menu buttons
    if ($("menuBtn")) $("menuBtn").onclick = () => toggleMenu();
    if ($("notifBtn")) $("notifBtn").onclick = () => toggleNotifLog();
    // world scale is fixed — zooming is left to the browser (Ctrl/Cmd +/-,
    // Ctrl+wheel, pinch). No game zoom buttons, keys, or wheel handling.
    if ($("notifClose")) $("notifClose").onclick = () => toggleNotifLog(false);
    if ($("notifClear")) $("notifClear").onclick = () => { notifLog.length = 0; markNotifRead(); renderNotifList(); };
    if ($("resumeBtn")) $("resumeBtn").onclick = () => toggleMenu(false);
    if ($("menuClose")) $("menuClose").onclick = () => toggleMenu(false);
    if ($("menuSaveBtn")) $("menuSaveBtn").onclick = async () => {
      await window.Game.saveGame(false);
      await renderMenuSlots();
    };
    if ($("menuNameBtn")) $("menuNameBtn").onclick = async () => {
      const p = window.Game && window.Game.G && window.Game.G.player;
      if (!p) return;
      const picked = await openHeroCreator({
        title: "Rename + restyle your hero",
        sub: "Same hero, same journey — new name, new face. Outfits and gear still show for fellow travelers.",
        initialName: p.name || "",
        appearance: p.appearance || null,
        tint: p.tint || "#4da3ff",
        previewGear: p.equipment || { w: "rusted_sword", a: null },
        confirmLabel: "💾 Save look",
      });
      if (!picked) return;
      const clean = picked.name;
      p.name = clean;
      p.appearance = picked.appearance || p.appearance;
      p.tint = picked.tint || p.tint;
      // a new face can mean a new race: swap the racial bonus (never stack)
      try { if (window.Entities) { window.Entities.syncRace(p); window.Entities.recalcDerived(p, true); } } catch (e) { }
      try {
        if (window.MP && window.MP.M && window.MP.M.active) {
          window.MP.M.name = clean;
          if (window.MP.saveNow) await window.MP.saveNow();
        }
      } catch (e) { }
      try { await window.Game.saveGame(true); } catch (e) { }
      try { updateHUD(); } catch (e) { }
      try { if (window.UI.renderMpPresence) window.UI.renderMpPresence(); } catch (e) { }
      toast("📛 You are now " + clean + ".", 3000);
    };
    if ($("persistBtn")) $("persistBtn").onclick = () => requestPersistentStorage(true);
    // fullscreen button (touch / mobile settings only — desktop gets the F11 note)
    if ($("fsBtn") && !$("fsBtn")._wired) {
      $("fsBtn")._wired = true;
      $("fsBtn").onclick = async () => {
        try {
          if (document.fullscreenElement) {
            try { await document.exitFullscreen(); } catch (e) { }
            toast("⛶ Left fullscreen.", 2000);
          } else {
            const el = document.documentElement;
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else { toast("📱 This browser can't fullscreen the page — Add to Home Screen gives the full view.", 3500); return; }
            toast("⛶ Fullscreen on.", 2000);
          }
        } catch (e) { toast("📱 Fullscreen was blocked — try again, or Add to Home Screen.", 3500); }
        try { refreshFsUI(); } catch (e2) { }
      };
      if (!document._fsWired) {
        document._fsWired = true;
        document.addEventListener("fullscreenchange", () => { try { refreshFsUI(); } catch (e) { } });
      }
    }
    if ($("menuHelpBtn")) $("menuHelpBtn").onclick = () => { toggleMenu(false); $("helpModal").hidden = false; };
    if ($("menuTutBtn")) $("menuTutBtn").onclick = () => {
      try {
        const p = window.Game && window.Game.G.player;
        if (!p) { toast("Start or load a game first, then open ☰ → 🎓 Training.", 3500); return; }
        if (p.tutorialDone) { toggleMenu(false); toast("🎓 Training already complete — well done, wayfarer."); return; }
        const existing = window.Quests && window.Quests.tutorialQuest ? window.Quests.tutorialQuest(p) : null;
        if (existing) {
          toggleMenu(false);
          if (Array.isArray(existing.steps) && existing.steps.length && existing.steps.every(s => s.done)) { try { showTutorialReward(); } catch (e2) { toggleQuests(true); } return; }
          toggleQuests(true);
          return;
        }
        toggleMenu(false);
        const q = window.Quests.startTutorial();
        if (q) toggleQuests(true);
      } catch (e) { }
    };
    if ($("menuChangelogBtn")) $("menuChangelogBtn").onclick = () => { toggleMenu(false); try { window.Changelog.openManual(); } catch (e) { } };
    if ($("helpChangelogBtn")) $("helpChangelogBtn").onclick = () => { try { window.Changelog.openManual(); } catch (e) { } };
    if ($("quitTitleBtn")) $("quitTitleBtn").onclick = () => quitToTitle(true);
    if (!document._titleFitWired) {
      document._titleFitWired = true;
      // re-fit whenever the title appears, and on viewport changes
      try {
        const t = $("titleScreen");
        if (t) new MutationObserver(() => {
          try { if (!t.hidden) { requestAnimationFrame(() => fitTitle()); setTimeout(() => fitTitle(), 350); } }
          catch (e) { }
        }).observe(t, { attributes: true, attributeFilter: ["hidden"] });
      } catch (e) { }
      window.addEventListener("resize", () => {
        try { const t = $("titleScreen"); if (t && !t.hidden) fitTitle(); } catch (e) { }
        try { fitHotbar(); } catch (e) { }
        try { const m = $("mapModal"); if (m && !m.hidden) fitMapCanvas(); } catch (e) { }
      });
      // Android default-fullscreen: browsers only grant fullscreen from a
      // user gesture, so the first tap anywhere auto-expands — the closest
      // the platform allows to launching fullscreen.
      window.addEventListener("pointerdown", function fsAuto() {
        try {
          if (/Android/i.test(navigator.userAgent || "") && !document.fullscreenElement) {
            const el = document.documentElement;
            const pr = el.requestFullscreen ? el.requestFullscreen() : null;
            if (pr && pr.catch) pr.catch(() => { });
          }
        } catch (e) { }
        try { refreshFsUI(); } catch (e2) { }
      }, { once: true, passive: true });
    }
    if ($("muteBtn")) $("muteBtn").onclick = () => {
      try { window.Sfx.setMuted(!window.Sfx.isMuted()); } catch (e) { }
      refreshSoundUI();
    };
    if ($("volSlider")) $("volSlider").oninput = (e) => {
      try { window.Sfx.setVolume(Number(e.target.value) / 100); } catch (err) { }
      refreshSoundUI();
    };
    if ($("volTestBtn")) $("volTestBtn").onclick = () => { try { window.Sfx.test(); } catch (e) { } };
    if ($("touchSel")) $("touchSel").onchange = (e) => {
      try { localStorage.setItem(TOUCH_KEY, e.target.value); } catch (err) { }
      applyTouchControls();
    };
    // global tutorial-prompt toggles (title Options sidebar + pause menu stay in sync)
    try { syncTutorialToggles(); } catch (e) { }
    if ($("titleTutToggle")) $("titleTutToggle").onchange = (e) => { try { setTutorialPromptsEnabled(!!e.target.checked); } catch (err) { } };
    if ($("menuTutToggle")) $("menuTutToggle").onchange = (e) => { try { setTutorialPromptsEnabled(!!e.target.checked); } catch (err) { } };
    // player-chosen autosave interval (title Options sidebar + pause menu stay in sync)
    try { syncAutosaveSels(); } catch (e) { }
    if ($("titleAutosaveSel")) $("titleAutosaveSel").onchange = (e) => { try { setAutosaveSecs(e.target.value); } catch (err) { } };
    if ($("menuAutosaveSel")) $("menuAutosaveSel").onchange = (e) => { try { setAutosaveSecs(e.target.value); } catch (err) { } };
    // default new-game slot = first empty
    try { setLoading(55, "Reading save files..."); } catch (e) { }
    try {
      const slots = await window.Game.listSlots();
      titleSlotSel = defaultTitleSlot(slots);
    } catch (e) { }
    await renderTitleSlots();
    refreshTitleStatus();
    try { setLoading(85, "Polishing the hearth..."); } catch (e) { }
    updateHotbar();
    applyTouchControls();
    // restored HUD prefs: expanded hero panel by default, remembered minimap size
    try { applyProfileCollapsed(); } catch (e) { }
    try { applyMinimapSize(getStoredMmSize()); } catch (e2) { }
    try { wireMinimapResize(); } catch (e3) { }
    // rotate / split-screen: keep a stored desktop minimap size from covering
    // a newly-short viewport (landscape phone). Re-cap, don't overwrite the
    // stored pref, so enlarging restores the user's size.
    try {
      if (!window.__mmViewportTimer) {
        let mmRt = null;
        window.__mmViewportTimer = true;
        window.addEventListener("resize", () => {
          try { if (mmRt) clearTimeout(mmRt); } catch (e) { }
          mmRt = setTimeout(() => {
            try { applyMinimapSize(getStoredMmSize()); } catch (e) { }
            try { drawMinimap(); } catch (e2) { }
          }, 200);
        });
      }
    } catch (e) { }
    // creator changelog: pops once per update (tracked per browser)
    try { if (window.Changelog) window.Changelog.checkAndShow(); } catch (e) { }
    // boot init finished — only now reveal the title
    try { setLoading(100, "Opening the gates..."); } catch (e) { }
    try { hideLoading(); } catch (e) { }
    try { if ($("titleScreen")) $("titleScreen").hidden = false; } catch (e) { }
    // guided tutorial: keep the arrow glued to its target (resize, HUD moves)
    try {
      if (!window.__tutGuideTimer && !boot._tutGuideTimer) {
        boot._tutGuideTimer = setInterval(() => { try { refreshTutGuide(); } catch (e) { } }, 900);
        try { window.__tutGuideTimer = boot._tutGuideTimer; } catch (e2) { }
        window.addEventListener("resize", () => { try { refreshTutGuide(); } catch (e) { } });
      }
    } catch (e) { }
    // buff/debuff chips: repaint once a second while their UI is visible, so
    // countdowns tick down live (paintFx no-ops when nothing changed)
    try {
      if (!window.__fxTicker && !boot._fxTicker) {
        boot._fxTicker = setInterval(() => {
          try {
            const G = window.Game && window.Game.G;
            if (!G || !G.player) return;
            paintFx($("phFx"), G.player);
            if ($("profileModal") && !$("profileModal").hidden) paintFx($("brawlFx"), G.player);
            const pm = $("partyModal");
            if (pm && !pm.hidden) {
              const els = pm.querySelectorAll("[data-fxfor]");
              for (const el of els) {
                const who = el.getAttribute("data-fxfor");
                let ent = null;
                if (who === "player") ent = G.player;
                else { try { ent = window.World._mem.npcs.get(who) || null; } catch (e2) { } }
                if (ent) paintFx(el, ent);
              }
            }
          } catch (e) { }
        }, 1000);
        try { window.__fxTicker = boot._fxTicker; } catch (e2) { }
      }
    } catch (e) { }
  }


  function wireInputs() {
    const G = window.Game.G;
    window.addEventListener("keydown", (e) => {
      // every press (repeats included) proves the keyboard is still talking to
      // us — the game loop's stuck-key watchdog uses this timestamp.
      try { G.lastKeyT = performance.now(); } catch (e2) { }
      // Browser zoom is left alone: Ctrl/Cmd + (+/-/0), Ctrl+wheel and pinch
      // all reach the browser so the page (game included) scales natively.
      // Single Enter-to-send path: typing targets (chat input) and the open
      // chat modal both route here. Do not add more Enter bindings elsewhere.
      const submitChatIfOpen = () => {
        try { if (!$("chatModal").hidden) { e.preventDefault(); sendChat(); return true; } } catch (err) { }
        return false;
      };
      // Typing in any text field must never drive the game. (Space/arrows included —
      // no preventDefault here so the character actually gets typed.)
      if (isTypingTarget(e)) {
        if (e.key === "Enter") submitChatIfOpen();
        return;
      }
      const k = e.key.toLowerCase();
      const keyId = k === " " ? " " : k;
      // While a modal is up, suspend world input: no WASD movement, no space
      // attack, no ability/interact keys. Only modal shortcuts work.
      if (isModalOpen()) {
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(keyId)) e.preventDefault();
        // arrow-key panning on the world map (repeats allowed: hold to glide)
        if (!$("mapModal").hidden && ["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(keyId)) {
          if (keyId === "arrowup") mapPan(0, -1);
          else if (keyId === "arrowdown") mapPan(0, 1);
          else if (keyId === "arrowleft") mapPan(-1, 0);
          else if (keyId === "arrowright") mapPan(1, 0);
          return;
        }
        if (e.repeat) return;
        if (k === "enter") { submitChatIfOpen(); }
        else if (!$("partyModal").hidden && ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(k)) { selectPartyTabByIndex(Number(k) - 1); }
        else if (k === "m") toggleMap();
        else if (k === "j") toggleQuests();
        else if (k === "p") toggleParty();
        else if (k === "i") toggleInv();
        else if (k === "c") toggleChar();
        else if (k === "v") toggleProfile();
        else if (k === "n") toggleNotifLog();
        else if (!$("mapModal").hidden && (k === "+" || k === "=")) mapZoom(-1);
        else if (!$("mapModal").hidden && (k === "-" || k === "_")) mapZoom(1);
        else if (!$("mapModal").hidden && k === "0") mapRecenter();
        return;
      }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(keyId)) e.preventDefault();
      // Space is the 10th hotbar slot (empty Space = default attack via triggerHotbar)
      G.keys[keyId] = true;
      if (k === "enter") submitChatIfOpen();
    });
    window.addEventListener("keyup", (e) => {
      // Always clear, even when released from inside a text field — otherwise a
      // key held when a modal opened would stick on after it closes.
      const k = e.key.toLowerCase();
      G.keys[k === " " ? " " : k] = false;
    });
    const cv = () => window.GameCanvas;
    window.addEventListener("mousemove", (e) => {
      G.mouse.x = e.clientX; G.mouse.y = e.clientY;
      // Throttled aiming flag: per-pixel clearTimeout/setTimeout churned
      // timers at 60Hz mouse rates. Refresh at most every 200ms.
      try {
        const now = performance.now();
        G.mouse.aiming = true;
        if (!G.mouse._aimAt || now - G.mouse._aimAt > 200) {
          G.mouse._aimAt = now;
          clearTimeout(G.mouse._t);
          G.mouse._t = setTimeout(() => { G.mouse.aiming = false; }, 2500);
        }
      } catch (err) { G.mouse.aiming = true; }
    });
    const MOVE_KEYS = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const clearHeld = () => {
      // safety net: losing focus (alt-tab, task switch) can swallow keyup /
      // mouseup, which would otherwise leave the player walking/attacking.
      try { for (const k of Object.keys(G.keys)) G.keys[k] = false; } catch (e) { }
      G.mouse.down = false;
    };
    // Right-click used to open the native menu mid-stride. While the menu is
    // open the browser gives IT the keyboard focus, so a key released in that
    // moment never sends the page its keyup — G.keys still says "held" and the
    // hero keeps walking that way. So: never let the menu open over the game
    // (text fields keep theirs), never treat a non-left click as game input,
    // and drop held input the instant a menu opens anywhere anyway.
    window.addEventListener("contextmenu", (e) => {
      let allowMenu = false;
      try { allowMenu = !!(e.target && e.target.closest && e.target.closest("input,textarea,[contenteditable]")); } catch (err) { }
      // Capture-phase + stopPropagation: Shift+right-click is a browser
      // escape hatch that re-opens the native menu past bubble-phase
      // handlers, so kill it as early as possible. (Some browsers reserve
      // Shift+right-click and open the menu anyway — the parry already fired
      // on mousedown, and held keys re-engage on release, so at worst the
      // menu is a hiccup, never a lost parry.)
      if (!allowMenu) { e.preventDefault(); try { e.stopPropagation(); } catch (err3) { } }
      // The menu may still open (text fields, Shift+right-click hatch) — and
      // a keyup may already be lost in transit. Drop movement now; if the key
      // is still physically held, repeat keydowns re-engage it the moment the
      // menu closes.
      try { for (const k of MOVE_KEYS.concat([" "])) G.keys[k] = false; } catch (err2) { }
      G.mouse.down = false;
    }, true);
    // dragging across menus must never start a text selection or native drag
    window.addEventListener("dragstart", (e) => {
      try {
        if (e.target && e.target.closest && e.target.closest("input,textarea,[contenteditable]")) return;
      } catch (err) { }
      e.preventDefault();
    });
    window.addEventListener("blur", clearHeld);
    try { document.addEventListener("visibilitychange", () => { if (document.hidden) clearHeld(); }); } catch (e) { }
    window.addEventListener("mousedown", (e) => {
      if (e.target.closest("button,input,textarea,.modal,.hudbtn,#profileHud,#levelUpBanner,#notifLog,#minimapWrap,#placebox,#clockbox")) return;
      if (e.button === 1) { e.preventDefault(); return; } // no middle-click autoscroll over the game
      if (e.button === 2) { e.preventDefault(); return; } // right click: menu is handled on contextmenu, never game input
      if (e.button !== undefined && e.button !== 0) return; // left click only: attack / torch plant
      // torch planting: the next canvas click plants instead of attacking
      try {
        if (window.Shops && window.Shops.isPlacing && window.Shops.isPlacing()) {
          e.preventDefault();
          window.Shops.placeAtScreen(e.clientX, e.clientY);
          return;
        }
      } catch (err) {}
      try {
        if (window.Game.G.torchTargeting) {
          e.preventDefault();
          window.Game.placeTorchAtScreen(e.clientX, e.clientY);
          return;
        }
      } catch (err) { }
      G.mouse.down = true;
    });
    window.addEventListener("mouseup", (e) => {
      // swallow the right-button release too: its default feeds the menu
      // path (esp. Shift+right-click), never game input.
      try { if (e && e.button === 2) e.preventDefault(); } catch (err) { }
      G.mouse.down = false;
    });
    // touch joystick
    const base = $("joyBase"), knob = $("joyKnob");
    let joyId = null;
    const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px,${dy}px)`; };
    const handleJoy = (t) => {
      const r = base.getBoundingClientRect();
      let dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
      const m = Math.hypot(dx, dy), max = 40;
      // pushing the finger past the pad's own circle = sprint: the gold
      // ring lights up and G.joy.sprint feeds the same wantSprint as Shift.
      const sprint = m > r.width / 2;
      if (m > max) { dx = dx / m * max; dy = dy / m * max; }
      setKnob(dx, dy);
      G.joy.x = dx / max; G.joy.y = dy / max; G.joy.active = true; G.joy.sprint = sprint;
      try { base.classList.toggle("sprinting", sprint); } catch (e) { }
    };
    base.addEventListener("touchstart", (e) => { joyId = e.changedTouches[0].identifier; handleJoy(e.changedTouches[0]); e.preventDefault(); }, { passive: false });
    window.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) if (t.identifier === joyId) handleJoy(t);
    }, { passive: true });
    window.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) if (t.identifier === joyId) { joyId = null; G.joy.active = false; G.joy.x = G.joy.y = 0; G.joy.sprint = false; try { base.classList.remove("sprinting"); } catch (e2) { } setKnob(0, 0); }
    });
    // buttons
    // attack button = "use default weapon slot" (empty default slot => bare fists)
    $("atkBtn").onclick = () => { try { window.Game.doDefaultAttack(); } catch (e) { } };
    // off-hand button = "use off-hand slot" (Q): fires its spell/throwable, or parries
    if ($("offBtn")) $("offBtn").onclick = () => { try { window.Game.doOffhandUse(); } catch (e) { } };
    $("intBtn").onclick = () => window.Game.doInteract();
    for (let i = 0; i < ((window.CFG && window.CFG.HOTBAR_SIZE) || 10); i++) {
      const b = $("hb" + i);
      if (b) b.onclick = () => { try { window.Game.triggerHotbar(i); } catch (e) { } };
    }
    // touch mini profile buttons (tap chip = full profile, like the desktop panel)
    try {
      const mp = $("miniProfile");
      if (mp && !mp._wired) {
        mp._wired = true;
        mp.addEventListener("click", (e) => {
          try { if (e.target.closest("#mpPartyBtn,#mpInvBtn")) return; } catch (_) { }
          toggleProfile();
        });
      }
      if ($("mpPartyBtn") && !$("mpPartyBtn")._wired) {
        $("mpPartyBtn")._wired = true;
        $("mpPartyBtn").onclick = (e) => { try { e.stopPropagation(); } catch (_) { } toggleParty(); };
      }
      if ($("mpInvBtn") && !$("mpInvBtn")._wired) {
        $("mpInvBtn")._wired = true;
        $("mpInvBtn").onclick = (e) => { try { e.stopPropagation(); } catch (_) { } toggleInv(); };
      }
    } catch (e) { }
    // circle pads (touch): hold = keep fighting that way. Drag aims (locks
    // facing + mouse-aim so movement never steers it away); holding attack
    // sets mouse.down so the game loop keeps swinging — sprinting while held
    // is the normal sprint flurry. Holding off-hand repeats its use (parry
    // re-opens on cooldown, spells recast) while the drag direction guards.
    // attack circle-pad (touch): the button is the outer ring, the white knob
    // in the middle is the stick. Drag the knob toward the rim to attack in
    // that direction; taps on the ring do nothing. Holding at the rim keeps
    // swinging (mouse.down) so the sprint flurry still works; the drag
    // direction locks facing + mouse-aim so movement never steers it away.
    try {
      const ab = $("atkBtn");
      if (ab && !ab._padWired) {
        ab._padWired = true;
        ab.title = "Attack pad: drag the white knob toward an enemy";
        const arrow = document.createElement("span");
        arrow.id = "atkAim";
        arrow.textContent = "➤";
        ab.appendChild(arrow);
        let knob = $("atkKnob");
        if (!knob) {
          knob = document.createElement("span");
          knob.id = "atkKnob";
          knob.setAttribute("aria-hidden", "true");
          knob.textContent = "✕";
          ab.appendChild(knob);
        }
        const setKnob = (kx, ky) => {
          try { knob.style.transform = `translate(-50%,-50%) translate(${kx}px,${ky}px)`; } catch (_) { }
        };
        const resetKnob = () => { setKnob(0, 0); };
        resetKnob();
        let padId = null, padCx = 0, padCy = 0, padAng = null, padMoved = false, padAttacking = false;
        const setAtkAim = (ang) => {
          try {
            const p = window.Game && window.Game.G.player;
            if (p) p.faceAng = ang;
            const G = window.Game && window.Game.G;
            const cv = window.GameCanvas;
            if (G && cv) {
              const r = cv.getBoundingClientRect();
              G.mouse.x = r.left + r.width / 2 + Math.cos(ang) * 160;
              G.mouse.y = r.top + r.height / 2 + Math.sin(ang) * 160;
              G.mouse.aiming = true;
              try { clearTimeout(G.mouse._t); G.mouse._t = null; } catch (e) { }
            }
          } catch (e) { }
        };
        const padMetrics = () => {
          let outer = 124, knobW = 62;
          try { outer = ab.clientWidth || ab.getBoundingClientRect().width || 124; } catch (_) { }
          try { knobW = (knob && (knob.clientWidth || knob.getBoundingClientRect().width)) || 62; } catch (_) { }
          const maxK = Math.max(20, (outer - knobW) / 2);
          const fireR = Math.max(14, maxK * 0.55);
          const arm = Math.max(30, outer / 2 + 4);
          return { maxK, fireR, arm };
        };
        ab.addEventListener("touchstart", (e) => {
          try {
            if (padId !== null) { e.preventDefault(); return; }
            const t = e.changedTouches[0];
            padId = t.identifier;
            const r = ab.getBoundingClientRect();
            padCx = r.left + r.width / 2; padCy = r.top + r.height / 2;
            padAng = null; padMoved = false; padAttacking = false;
            resetKnob();
            ab.classList.remove("aiming");
            // no fire on touchdown: the attack only registers on drag-out
            try {
              const G = window.Game && window.Game.G;
              if (G) { G.mouse.down = false; G.mouse.aiming = false; }
            } catch (e2) { }
          } catch (_) { }
          e.preventDefault();
        }, { passive: false });
        window.addEventListener("touchmove", (e) => {
          if (padId === null) return;
          for (const t of e.changedTouches) {
            if (t.identifier !== padId) continue;
            const dx = t.clientX - padCx, dy = t.clientY - padCy;
            const dist = Math.hypot(dx, dy);
            const { maxK, fireR, arm } = padMetrics();
            const cl = dist > maxK ? maxK / dist : 1;
            setKnob(dx * cl, dy * cl);
            if (dist > 10) {
              padMoved = true; padAng = Math.atan2(dy, dx);
              ab.classList.add("aiming");
              try { arrow.style.transform = `translate(-50%,-50%) rotate(${padAng * 180 / Math.PI}deg) translateX(${arm}px)`; } catch (_) { }
              setAtkAim(padAng);
            }
            if (dist > fireR) {
              if (!padAttacking) {
                padAttacking = true;
                try {
                  const G = window.Game && window.Game.G;
                  if (G) { G.mouse.down = true; }
                } catch (e2) { }
                try { window.Game.doDefaultAttack(); } catch (e3) { }
              } else {
                try {
                  const G = window.Game && window.Game.G;
                  if (G) { G.mouse.down = true; }
                } catch (e4) { }
              }
            } else if (dist <= 10) {
              // back to center: pause the hold-swing until pushed out again
              padAttacking = false;
              try {
                const G = window.Game && window.Game.G;
                if (G) { G.mouse.down = false; }
              } catch (e5) { }
            }
          }
        }, { passive: true });
        const padEnd = (e) => {
          if (padId === null) return false;
          for (const t of e.changedTouches) {
            if (t.identifier !== padId) continue;
            padId = null;
            padAttacking = false;
            resetKnob();
            ab.classList.remove("aiming");
            ab._suppressClick = true;
            try {
              const G = window.Game && window.Game.G;
              if (G) {
                G.mouse.down = false;
                if (padMoved && padAng !== null) {
                  G.mouse.aiming = true;
                  try { clearTimeout(G.mouse._t); } catch (e2) { }
                  try { G.mouse._t = setTimeout(() => { try { G.mouse.aiming = false; } catch (e3) { } }, 600); } catch (e4) { }
                } else {
                  try { clearTimeout(G.mouse._t); } catch (e5) { }
                  G.mouse.aiming = false;
                }
              }
            } catch (err) { }
            return true;
          }
          return false;
        };
        window.addEventListener("touchend", (e) => { try { if (padEnd(e)) e.preventDefault(); } catch (_) { } }, { passive: false });
        window.addEventListener("touchcancel", (e) => {
          try {
            let mine = false;
            try { for (const t of e.changedTouches) if (t.identifier === padId) mine = true; } catch (e2) { mine = true; }
            if (!mine) return;
          } catch (e) { }
          padId = null;
          padAttacking = false;
          resetKnob();
          try { ab.classList.remove("aiming"); } catch (_) { }
          try {
            const G = window.Game && window.Game.G;
            if (G) {
              G.mouse.down = false;
              if (!(padMoved && padAng !== null)) { try { clearTimeout(G.mouse._t); } catch (e2) { } G.mouse.aiming = false; }
              else { try { clearTimeout(G.mouse._t); } catch (e3) { } try { G.mouse._t = setTimeout(() => { try { G.mouse.aiming = false; } catch (e4) { } }, 600); } catch (e5) { } }
            }
          } catch (e) { }
        });
        const prevClick = ab.onclick;
        ab.onclick = (e) => {
          if (ab._suppressClick) { ab._suppressClick = false; try { e.stopImmediatePropagation(); e.preventDefault(); } catch (_) { } return; }
          if (prevClick) return prevClick(e);
        };
      }
      // off-hand circle-pad (touch only): same stick contract as the attack
      // pad, in guard cyan. The button is the outer ring, the knob is the
      // stick: pull it toward the rim to use the off-hand slot in that
      // direction (spells/throwables fire, weapons/shields/empty parry);
      // taps do nothing. Holding at the rim repeats the use (parry re-opens
      // on cooldown, spells recast) via the repeat timer; the drag direction
      // aims + guards while held.
      const ob = $("offBtn");
      if (ob && !ob._padWired) {
        ob._padWired = true;
        ob.title = "Off-hand pad: drag the 🤚 knob toward a direction";
        const oarrow = document.createElement("span");
        oarrow.id = "offAim";
        oarrow.textContent = "➤";
        ob.appendChild(oarrow);
        let oknob = $("offKnob");
        if (!oknob) {
          oknob = document.createElement("span");
          oknob.id = "offKnob";
          oknob.setAttribute("aria-hidden", "true");
          oknob.textContent = "🤚";
          ob.appendChild(oknob);
        }
        const setOffKnob = (kx, ky) => {
          try { oknob.style.transform = `translate(-50%,-50%) translate(${kx}px,${ky}px)`; } catch (_) { }
        };
        const resetOffKnob = () => { setOffKnob(0, 0); };
        resetOffKnob();
        let offId = null, offCx = 0, offCy = 0, offAng = null, offMoved = false, offFiring = false, offTimer = null;
        const setOffAim = (ang) => {
          try {
            const p = window.Game && window.Game.G.player;
            if (p) p.faceAng = ang;
            const G = window.Game && window.Game.G;
            const cv = window.GameCanvas;
            if (G && cv) {
              const r = cv.getBoundingClientRect();
              G.mouse.x = r.left + r.width / 2 + Math.cos(ang) * 160;
              G.mouse.y = r.top + r.height / 2 + Math.sin(ang) * 160;
              G.mouse.aiming = true;
              try { clearTimeout(G.mouse._t); G.mouse._t = null; } catch (e) { }
            }
          } catch (e) { }
        };
        const offMetrics = () => {
          let outer = 88, knobW = 44;
          try { outer = ob.clientWidth || ob.getBoundingClientRect().width || 88; } catch (_) { }
          try { knobW = (oknob && (oknob.clientWidth || oknob.getBoundingClientRect().width)) || 44; } catch (_) { }
          const maxK = Math.max(16, (outer - knobW) / 2);
          const fireR = Math.max(12, maxK * 0.55);
          const arm = Math.max(24, outer / 2 + 4);
          return { maxK, fireR, arm };
        };
        const clearOffTimer = () => { try { if (offTimer) clearInterval(offTimer); } catch (e) { } offTimer = null; };
        const fireOffhand = () => { try { window.Game.doOffhandUse(); } catch (e2) { } };
        ob.addEventListener("touchstart", (e) => {
          try {
            if (offId !== null) { e.preventDefault(); return; }
            const t = e.changedTouches[0];
            offId = t.identifier;
            const r = ob.getBoundingClientRect();
            offCx = r.left + r.width / 2; offCy = r.top + r.height / 2;
            offAng = null; offMoved = false; offFiring = false;
            resetOffKnob();
            ob.classList.remove("aiming");
            // no fire on touchdown: the off-hand only registers on drag-out
            clearOffTimer();
          } catch (_) { }
          e.preventDefault();
        }, { passive: false });
        window.addEventListener("touchmove", (e) => {
          if (offId === null) return;
          for (const t of e.changedTouches) {
            if (t.identifier !== offId) continue;
            const dx = t.clientX - offCx, dy = t.clientY - offCy;
            const dist = Math.hypot(dx, dy);
            const { maxK, fireR, arm } = offMetrics();
            const cl = dist > maxK ? maxK / dist : 1;
            setOffKnob(dx * cl, dy * cl);
            if (dist > 8) {
              offMoved = true; offAng = Math.atan2(dy, dx);
              ob.classList.add("aiming");
              try { oarrow.style.transform = `translate(-50%,-50%) rotate(${offAng * 180 / Math.PI}deg) translateX(${arm}px)`; } catch (_) { }
              setOffAim(offAng);
            }
            if (dist > fireR) {
              if (!offFiring) {
                offFiring = true;
                fireOffhand();
                clearOffTimer();
                offTimer = setInterval(() => { try { window.Game.doOffhandUse(); } catch (e3) { } }, 260);
              }
            } else if (dist <= 8) {
              // back to center: pause the hold-repeat until pushed out again
              offFiring = false;
              clearOffTimer();
            }
          }
        }, { passive: true });
        const offEnd = (e) => {
          if (offId === null) return false;
          for (const t of e.changedTouches) {
            if (t.identifier !== offId) continue;
            offId = null;
            offFiring = false;
            clearOffTimer();
            resetOffKnob();
            ob.classList.remove("aiming");
            ob._suppressClick = true;
            try {
              const G = window.Game && window.Game.G;
              if (G) {
                if (offMoved && offAng !== null) {
                  G.mouse.aiming = true;
                  try { clearTimeout(G.mouse._t); } catch (e2) { }
                  try { G.mouse._t = setTimeout(() => { try { G.mouse.aiming = false; } catch (e3) { } }, 600); } catch (e4) { }
                } else if (!G.mouse.down) {
                  try { clearTimeout(G.mouse._t); } catch (e5) { }
                  // leave aiming alone if the attack pad is still holding it
                  try {
                    const ab2 = $("atkBtn");
                    const atkHolding = ab2 && ab2.classList.contains("aiming");
                    if (!atkHolding) G.mouse.aiming = false;
                  } catch (e6) { G.mouse.aiming = false; }
                }
              }
            } catch (err) { }
            return true;
          }
          return false;
        };
        window.addEventListener("touchend", (e) => { try { if (offEnd(e)) e.preventDefault(); } catch (_) { } }, { passive: false });
        window.addEventListener("touchcancel", (e) => {
          try {
            let mine = false;
            try { for (const t of e.changedTouches) if (t.identifier === offId) mine = true; } catch (e2) { mine = true; }
            if (!mine) return;
          } catch (e) { }
          offId = null;
          offFiring = false;
          clearOffTimer();
          resetOffKnob();
          try { ob.classList.remove("aiming"); } catch (_) { }
        });
        const prevOffClick = ob.onclick;
        ob.onclick = (e) => {
          if (ob._suppressClick) { ob._suppressClick = false; try { e.stopImmediatePropagation(); e.preventDefault(); } catch (_) { } return; }
          if (prevOffClick) return prevOffClick(e);
        };
      }
    } catch (e) { }
    // drag-to-cast (touch + mouse): drag a hotbar slot onto the overworld to
    // aim that slot at the drop point and fire. Plain taps still click through.
    try {
      const bar = $("hotbar");
      if (bar && !bar._dragWired) {
        bar._dragWired = true;
        let ghost = null;
        const ensureGhost = () => {
          if (ghost) return ghost;
          ghost = document.createElement("div");
          ghost.id = "spellGhost";
          ghost.hidden = true;
          document.body.appendChild(ghost);
          return ghost;
        };
        let drag = null; // {i,pid,sx,sy,icon,on}
        const hbN = () => ((window.CFG && window.CFG.HOTBAR_SIZE) || 10);
        for (let i = 0; i < hbN(); i++) {
          const b = $("hb" + i);
          if (!b || b._dragWired) continue;
          b._dragWired = true;
          b.addEventListener("click", (e) => {
            if (b._suppressClick) {
              b._suppressClick = false;
              try { e.stopImmediatePropagation(); e.preventDefault(); } catch (_) { }
            }
          }, true);
          b.addEventListener("pointerdown", (e) => {
            try {
              if (e.pointerType !== "touch" && e.pointerType !== "pen" && (e.button !== undefined && e.button !== 0)) return;
              const p = window.Game && window.Game.G.player;
              const s = p && p.hotbar && p.hotbar[i];
              if (!s) return;
              drag = { i, pid: e.pointerId, sx: e.clientX, sy: e.clientY, icon: slotIconFor(s), on: false, btn: b };
            } catch (_) { drag = null; }
          });
        }
        window.addEventListener("pointermove", (e) => {
          if (!drag || e.pointerId !== drag.pid) return;
          if (!drag.on && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 14) {
            drag.on = true;
            const g = ensureGhost();
            try {
              const ic = String(drag.icon || "");
              if (/^data:image/.test(ic)) g.innerHTML = '<img width="28" height="28" draggable="false" alt="" src="' + ic + '">';
              else g.textContent = ic;
            } catch (_) { try { g.textContent = ""; } catch (__) { } }
            g.style.left = e.clientX + "px";
            g.style.top = e.clientY + "px";
            g.hidden = false;
          } else if (drag.on) {
            const g = ensureGhost();
            g.style.left = e.clientX + "px";
            g.style.top = e.clientY + "px";
          }
        }, { passive: true });
        const dropDrag = (e) => {
          if (!drag || e.pointerId !== drag.pid) return false;
          const d = drag; drag = null;
          if (!d.on) return false;
          try { ensureGhost().hidden = true; } catch (_) { }
          // Only the hotbar cancels a drag: dropping the spell back onto
          // the hotbar is the single cancel gesture. Drops anywhere else —
          // overworld, ATK/E/off-hand buttons, joystick, HUD, minimap, etc —
          // aim + fire the dragged slot at the drop point.
          let dropEl = null;
          try { dropEl = document.elementFromPoint(e.clientX, e.clientY); } catch (_) { dropEl = null; }
          const overHotbar = !!(dropEl && dropEl.closest && dropEl.closest("#hotbar"));
          // Swallow the synthesized click from this drop so the source slot
          // (and any button under the finger) can't also trigger underneath.
          try { if (d.btn) d.btn._suppressClick = true; } catch (_) { }
          const swallowNextClick = () => {
            try {
              const killer = (ev) => {
                try { ev.stopImmediatePropagation(); ev.preventDefault(); } catch (_) { }
                try { window.removeEventListener("click", killer, true); } catch (_) { }
              };
              window.addEventListener("click", killer, true);
              setTimeout(() => { try { window.removeEventListener("click", killer, true); } catch (_) { } }, 600);
            } catch (_) { }
          };
          try {
            const t = dropEl && dropEl.closest ? dropEl.closest("button") : null;
            if (t && t !== d.btn) { try { t._suppressClick = true; } catch (_) { } }
          } catch (_) { }
          swallowNextClick();
          if (overHotbar) {
            try { e.preventDefault(); e.stopPropagation(); } catch (_) { }
            return true;
          }
          try { e.preventDefault(); e.stopPropagation(); } catch (_) { }
          try { castSlotAtScreen(d.i, e.clientX, e.clientY); } catch (_) { }
          return true;
        };
        window.addEventListener("pointerup", (e) => { try { dropDrag(e); } catch (_) { } }, true);
        window.addEventListener("pointercancel", (e) => {
          if (!drag || e.pointerId !== drag.pid) return;
          drag = null;
          try { ensureGhost().hidden = true; } catch (_) { }
        });
      }
    } catch (e) { }
    if ($("minimap")) $("minimap").onclick = () => toggleMap();
    const stop = (e) => { try { e.stopPropagation(); } catch (_) { } };
    if ($("phPartyBtn")) $("phPartyBtn").onclick = (e) => { stop(e); toggleParty(); };
    if ($("phAchBtn")) $("phAchBtn").onclick = (e) => { stop(e); toggleProfile(); };
    if ($("phInvBtn")) $("phInvBtn").onclick = (e) => { stop(e); toggleInv(); };
    if ($("phProfileBtn")) $("phProfileBtn").onclick = (e) => { stop(e); toggleProfile(true); };
    // hero panel: header toggles collapse, body opens the full profile card
    if ($("phCollapseBtn")) $("phCollapseBtn").onclick = (e) => { stop(e); toggleProfileCollapsed(); };
    if ($("phTop")) $("phTop").onclick = (e) => { stop(e); toggleProfileCollapsed(); };
    if ($("phBody")) $("phBody").onclick = () => toggleProfile();
    // location box (top-left) acts as the Location button: opens the world map
    if ($("placebox") && !$("placebox")._wired) { $("placebox")._wired = true; $("placebox").onclick = () => toggleMap(true); }
    // day/night clock: click toggles 12/24-hour format
    if ($("clockbox") && !$("clockbox")._wired) {
      $("clockbox")._wired = true;
      $("clockbox").onclick = (e) => {
        try { if (e.stopPropagation) e.stopPropagation(); } catch (e2) { }
        try {
          const twelve = window.Game.toggleClockFormat();
          toast(twelve ? "🕐 12-hour clock" : "🕐 24-hour clock", 1500);
        } catch (e3) { }
      };
    }
    if ($("phPtsRow")) $("phPtsRow").onclick = (e) => { try { e.stopPropagation(); } catch (e2) { } toggleChar(true); };
    if ($("profileClose")) $("profileClose").onclick = () => toggleProfile(false);
    if ($("brawlClose2")) $("brawlClose2").onclick = () => toggleProfile(false);
    if ($("brawlCharBtn")) $("brawlCharBtn").onclick = () => { toggleProfile(false); toggleChar(true); };
    if ($("brawlPartyBtn")) $("brawlPartyBtn").onclick = () => { toggleProfile(false); toggleParty(true); };
    if ($("brawlSpendBtn")) $("brawlSpendBtn").onclick = () => { toggleProfile(false); toggleChar(true); };
    if ($("levelUpSpendBtn")) $("levelUpSpendBtn").onclick = () => { hideLevelUp(); toggleChar(true); };
    if ($("levelUpDismissBtn")) $("levelUpDismissBtn").onclick = () => hideLevelUp();
    if ($("brawlEditBtn")) $("brawlEditBtn").onclick = async () => {
      const p = window.Game && window.Game.G.player;
      if (!p) return;
      const picked = await openHeroCreator({
        title: "Rename + restyle your hero",
        sub: "Same hero, same journey — new name, new face. Outfits and gear still show for fellow travelers.",
        initialName: p.name || "",
        appearance: p.appearance || null,
        tint: p.tint || "#4da3ff",
        previewGear: p.equipment || { w: "rusted_sword", a: null },
        confirmLabel: "💾 Save look",
      });
      if (!picked) return;
      const nm = picked.name;
      p.name = nm;
      p.appearance = picked.appearance || p.appearance;
      p.tint = picked.tint || p.tint;
      // restyle can change race too: swap the racial bonus (never stack)
      try { if (window.Entities) { window.Entities.syncRace(p); window.Entities.recalcDerived(p, true); } } catch (e) { }
      try { window.Game.saveGame(true); } catch (e) { }
      // channels: same identity keeps stats/class — only the name changes (server converges on next save)
      try { if (window.MP && window.MP.M && window.MP.M.active) { window.MP.M.name = nm; try { window.MP.saveNow(); } catch (e2) { } } } catch (e) { }
      try { updateHUD(); renderProfile(); } catch (e) { }
      toast(`📛 You are now ${nm}.`);
    };
    $("helpBtn").onclick = () => { $("helpModal").hidden = !$("helpModal").hidden; };
    $("helpClose").onclick = () => { $("helpModal").hidden = true; };
    if ($("tutHelpBtn")) $("tutHelpBtn").onclick = () => {
      try {
        const p = window.Game && window.Game.G.player;
        if (p && p.tutorialDone) { toast("🎓 Training already complete — well done, wayfarer."); return; }
        if (window.Quests && window.Quests.tutorialQuest(p)) { $("helpModal").hidden = true; toggleQuests(true); return; }
        const q = window.Quests.startTutorial();
        if (q) { $("helpModal").hidden = true; toggleQuests(true); }
      } catch (e) { }
    };
    if ($("questDismissBtn")) $("questDismissBtn").onclick = () => hideQuestBanner();
    if ($("techDismissBtn")) $("techDismissBtn").onclick = () => hideTechBanner();
    if ($("tutAcceptBtn")) $("tutAcceptBtn").onclick = () => {
      try { if ($("tutorialModal")) $("tutorialModal").hidden = true; } catch (e) { }
      try { const q = window.Quests.startTutorial(); if (q) { toggleQuests(true); try { refreshTutGuide(); } catch (e2) { } } } catch (e) { }
    };
    if ($("tutDeclineBtn")) $("tutDeclineBtn").onclick = () => {
      try { if ($("tutorialModal")) $("tutorialModal").hidden = true; } catch (e) { }
      try { clearTutGuide(); } catch (e2) { }
      try { toast("No training for now — find 🎓 Training in ❓ Help or the ☰ pause menu whenever you like."); } catch (e) { }
    };
    $("saveBtn").onclick = () => window.Game.saveGame(false);
    $("mapClose").onclick = () => { $("mapModal").hidden = true; mapView = null; mapPortalMode = false; try { hideMapTeleportPrompt(); } catch (e) { } try { refreshTutGuide(); } catch (e2) { } };
    if ($("mapCloseTop")) $("mapCloseTop").onclick = () => { try { $("mapClose").click(); } catch (e) { } };
    $("partyClose").onclick = () => { $("partyModal").hidden = true; try { refreshTutGuide(); } catch (e) { } };
    $("invClose").onclick = () => { $("invModal").hidden = true; try { refreshTutGuide(); } catch (e) { } };
    $("charClose").onclick = () => { $("charModal").hidden = true; try { refreshTutGuide(); } catch (e) { } };
    if ($("portalDescendBtn")) $("portalDescendBtn").onclick = async () => { closePortal(); try { await window.Game.descendDungeon(); } catch (e) { } };
    if ($("portalSurfaceBtn")) $("portalSurfaceBtn").onclick = async () => { closePortal(); try { await window.Game.exitDungeon(); } catch (e) { } };
    if ($("portalCloseBtn")) $("portalCloseBtn").onclick = () => closePortal();
    if ($("dungeonTravelClose")) $("dungeonTravelClose").onclick = () => closeDungeonTravel();
    if ($("mapZoomIn")) $("mapZoomIn").onclick = () => mapZoom(-1);
    if ($("mapZoomOut")) $("mapZoomOut").onclick = () => mapZoom(1);
    if ($("mapRecenter")) $("mapRecenter").onclick = () => mapRecenter();
    if ($("wanderBtn")) $("wanderBtn").onclick = () => wanderDream();
    if ($("mapSearch")) $("mapSearch").addEventListener("input", () => renderMapSearch());
    if ($("mapSearch")) $("mapSearch").addEventListener("keydown", (ev) => {
      // Enter jumps to the first match; Escape clears the search
      if (ev.key === "Enter") {
        try {
          const needle = ($("mapSearch").value || "").trim().toLowerCase();
          const hit = mapKnownPlaces().find(q => q.name.toLowerCase().includes(needle));
          if (hit) {
            mapCenter();
            if (mapView) { mapView.x = hit.x; mapView.y = hit.y; }
            drawWorldMap();
          }
        } catch (e) { }
        ev.preventDefault();
      } else if (ev.key === "Escape") {
        // first Escape clears the search; another one lets the global
        // handler close the map as usual
        try {
          if (($("mapSearch").value || "").trim()) {
            $("mapSearch").value = ""; renderMapSearch();
            ev.stopPropagation();
          }
        } catch (e) { }
      }
    });
    if ($("travelCloseBtn")) $("travelCloseBtn").onclick = () => closeHearthTravel();
    if ($("stableCloseBtn")) $("stableCloseBtn").onclick = () => closeStable();
    if ($("innCloseBtn")) $("innCloseBtn").onclick = () => closeInn();
    if ($("loreCloseBtn")) $("loreCloseBtn").onclick = () => closeLore();
    if ($("guildCloseBtn")) $("guildCloseBtn").onclick = () => closeGuild();
    // map pan (drag) + zoom (wheel / pinch / double-tap) — unified Pointer Events
    // so mouse, touch and pen share one path. One finger / left-button drag
    // pans, two fingers pinch-zoom (spread = see more, squeeze = see less) and
    // pan by midpoint, double-tap zooms in, wheel zooms. A press without drag
    // is a tap (maybe a hearth dot). touch-action:none on #worldmap (CSS)
    // keeps the browser from stealing the gesture for scroll/page-zoom.
    try {
      const wcv = $("worldmap");
      const viewTiles = (R, w, h) => ({ vw: (R * 2 + 1) * 16, vh: (R * 2 + 1) * 16 * h / w });
      const posOfXY = (cx, cy) => {
        const r = wcv.getBoundingClientRect();
        return { x: cx - r.left, y: cy - r.top, w: r.width, h: r.height };
      };
      const ptrs = new Map();
      let gesture = null;
      let lastTapAt = 0, lastTapX = 0, lastTapY = 0;
      const PINCH_PX_PER_STEP = 48;
      const TAP_MOVE_PX = 8, TAP_MS = 500, DOUBLE_TAP_MS = 320, DOUBLE_TAP_PX = 26;
      const startPan = (id, x, y) => {
        mapCenter();
        const q = posOfXY(x, y);
        gesture = { mode: "pan", pid: id, sx: x, sy: y, x: mapView.x, y: mapView.y, w: q.w, h: q.h, moved: false, downAt: performance.now() };
      };
      const startPinch = () => {
        mapCenter();
        const arr = [...ptrs.values()];
        if (arr.length < 2) return;
        const a = arr[0], b = arr[1];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const q = posOfXY(mx, my);
        gesture = { mode: "pinch", d0: d, r0: mapView.range, mx0: mx, my0: my, x0: mapView.x, y0: mapView.y, w: q.w, h: q.h, moved: true };
      };
      wcv.addEventListener("pointerdown", (ev) => {
        if (!mapView) return;
        try { if (ev.pointerType === "mouse" && ev.button !== undefined && ev.button !== 0) return; } catch (e) {}
        try { wcv.setPointerCapture(ev.pointerId); } catch (e) {}
        ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, id: ev.pointerId });
        if (ptrs.size === 1) startPan(ev.pointerId, ev.clientX, ev.clientY);
        else if (ptrs.size === 2) startPinch();
        try { ev.preventDefault(); } catch (e) {}
      });
      wcv.addEventListener("pointermove", (ev) => {
        if (!mapView || !gesture) return;
        if (!ptrs.has(ev.pointerId)) return;
        ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, id: ev.pointerId });
        if (gesture.mode === "pinch" && ptrs.size >= 2) {
          const arr = [...ptrs.values()];
          const a = arr[0], b = arr[1];
          const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const steps = Math.round((gesture.d0 - d) / PINCH_PX_PER_STEP);
          const R0 = gesture.r0 != null ? gesture.r0 : mapView.range;
          mapView.range = Math.min(12, Math.max(2, R0 + steps));
          const v = viewTiles(mapView.range, gesture.w, gesture.h);
          mapView.x = gesture.x0 - (mx - gesture.mx0) / gesture.w * v.vw;
          mapView.y = gesture.y0 - (my - gesture.my0) / gesture.h * v.vh;
          queueWorldDraw();
          try { ev.preventDefault(); } catch (e) {}
          return;
        }
        if (gesture.mode === "pan" && ptrs.size === 1) {
          mapCenter();
          if (Math.hypot(ev.clientX - gesture.sx, ev.clientY - gesture.sy) > TAP_MOVE_PX) gesture.moved = true;
          const R = mapView.range;
          const v = viewTiles(R, gesture.w, gesture.h);
          mapView.x = gesture.x - (ev.clientX - gesture.sx) / gesture.w * v.vw;
          mapView.y = gesture.y - (ev.clientY - gesture.sy) / gesture.h * v.vh;
          queueWorldDraw();
          try { ev.preventDefault(); } catch (e) {}
        }
      });
      const endPointer = (ev) => {
        try {
          const was = gesture;
          const wasCount = ptrs.size;
          ptrs.delete(ev.pointerId);
          if (was && was.mode === "pinch") {
            if (ptrs.size === 1) {
              const rem = [...ptrs.values()][0];
              mapCenter();
              const q = posOfXY(rem.x, rem.y);
              gesture = { mode: "pan", pid: rem.id, sx: rem.x, sy: rem.y, x: mapView.x, y: mapView.y, w: q.w, h: q.h, moved: true, downAt: performance.now() };
              return;
            }
            gesture = null;
            return;
          }
          if (was && was.mode === "pan" && wasCount === 1) {
            const moved = was.moved;
            const dt = performance.now() - (was.downAt || 0);
            gesture = null;
            if (!moved && dt < TAP_MS && mapView) {
              const r = wcv.getBoundingClientRect();
              const cx = ev.clientX - r.left, cy = ev.clientY - r.top;
              const now = performance.now();
              if (now - lastTapAt < DOUBLE_TAP_MS && Math.hypot(cx - lastTapX, cy - lastTapY) < DOUBLE_TAP_PX) {
                lastTapAt = 0;
                mapZoom(-1);
                return;
              }
              lastTapAt = now; lastTapX = cx; lastTapY = cy;
              handleMapClick(cx, cy, r.width, r.height);
            }
          } else if (ptrs.size === 0) {
            gesture = null;
          }
        } catch (e) { gesture = null; }
      };
      wcv.addEventListener("pointerup", endPointer);
      wcv.addEventListener("pointercancel", endPointer);
      wcv.addEventListener("wheel", (ev) => {
        if (!mapView) return;
        ev.preventDefault();
        mapZoom(ev.deltaY > 0 ? 1 : -1);
      }, { passive: false });
      wcv.addEventListener("touchend", (ev) => {
        try {
          if (gesture || ptrs.size) return;
          if (!mapView || !ev.changedTouches || !ev.changedTouches[0]) return;
          const t = ev.changedTouches[0];
          const r = wcv.getBoundingClientRect();
          handleMapClick(t.clientX - r.left, t.clientY - r.top, r.width, r.height);
        } catch (e) {}
      });
    } catch (e) { }
    $("chatClose").onclick = closeChat;
    if ($("chatCloseX")) $("chatCloseX").onclick = closeChat;
    if ($("allyBtn")) $("allyBtn").onclick = async () => {
      if (!chatNpc || !chatNpc.isRemotePlayer || !chatNpc.remoteHash) return;
      const h = String(chatNpc.remoteHash).toLowerCase();
      try {
        if (window.MP.isAlliedHash(h)) {
          if (!confirm("End your alliance with " + (chatNpc.name || "them") + "? Damage rules go back to normal.")) return;
          window.MP.removeAlly(h);
          toast("💔 Alliance ended.", 3000);
        } else {
          window.MP.requestAlly(h);
          toast("🤝 Ally request sent to " + (chatNpc.name || "them") + " — they answer from 🌐 presence.", 4000);
        }
        renderChatHead();
      } catch (e) { toast("⚠️ " + (e.message || "Ally failed."), 4000); }
    };
    if ($("ptClose")) $("ptClose").onclick = () => closePlayerTrade();
    $("chatSend").onclick = sendChat;
    $("recruitBtn").onclick = toggleRecruit;
    $("tradeBtn").onclick = () => toggleTrade();
    if ($("chatQuestBtn")) $("chatQuestBtn").onclick = () => { if (chatNpc) requestQuestOffer(chatNpc, false); };
    if ($("chatReportBtn")) $("chatReportBtn").onclick = () => {
      try {
        const pend = chatNpc && window.Quests ? window.Quests.pendingTurnIn(chatNpc) : null;
        if (pend && window.Quests.turnIn(pend)) {
          sysBubble(`📜 Reported: ${pend.title} — rewards granted!`);
          try {
            chatNpc.memories = chatNpc.memories || { summary: "", tail: [] };
            chatNpc.memories.tail.push(`Shop ledger: reported quest "${pend.title}", rewards granted.`.slice(0, 220));
            if (chatNpc.memories.tail.length > 14) chatNpc.memories.tail = chatNpc.memories.tail.slice(-14);
            window.World.saveNpc(chatNpc);
          } catch (e) { }
          renderChatHead(); updateHUD();
        }
      } catch (e) { }
    };
    if ($("questBtn")) $("questBtn").onclick = () => toggleQuests();
    if ($("questClose")) $("questClose").onclick = () => toggleQuests(false);
    $("healBtn").onclick = async () => {
      if (!chatNpc) return;
      // remote player: spend 10 MP to heal THEM (fellow traveler, no NPC gold cost)
      if (chatNpc.isRemotePlayer) {
        const p0 = window.Game.G.player;
        if ((p0.mp || 0) < 10) { toast("Not enough MP (need 10)."); return; }
        try {
          const amt = Math.round((chatNpc.maxHp || 50) * 0.25);
          p0.mp = Math.max(0, p0.mp - 10);
          await window.MP.healPlayer(chatNpc.remoteHash, amt);
          sysBubble(`*You mend ${chatNpc.name} for ${amt} HP.*`);
          updateHUD();
          try { window.Sfx.heal(); } catch (e) { }
        } catch (e) { toast("⚠️ " + (e.message || "Heal failed."), 4000); }
        return;
      }
      const p = window.Game.G.player;
      const isSlaveH = (chatNpc.role === "slave" || chatNpc.noLoyalty);
      const pts = window.Entities.loyaltyPts(p);
      const cost = isSlaveH ? 100 : window.Entities.npcHealCost(chatNpc, p);
      if (p.gold < cost) { toast(isSlaveH ? `Field care costs 100 gold.` : `Healing costs ${cost} gold (+${pts} 💛).`); return; }
      p.gold -= cost; p.hp = p.maxHp; p.mp = p.maxMp;
      if (!isSlaveH) chatNpc.loyalty = Math.min(1000, (chatNpc.loyalty || 0) + pts);
      try {
        chatNpc.memories = chatNpc.memories || { summary: "", tail: [] };
        chatNpc.memories.tail.push(`Shop ledger: healed ${p.name} to full for ${cost}g.`.slice(0, 220));
        if (chatNpc.memories.tail.length > 14) chatNpc.memories.tail = chatNpc.memories.tail.slice(-14);
      } catch (e) { }
      try { await window.World.saveNpc(chatNpc); } catch (e) { }
      toast(isSlaveH ? `💚 ${chatNpc.name} tends your wounds. (field care)` : `💚 ${chatNpc.name} tends your wounds. (+loyalty)`);
      updateHUD(); renderChatHead(); try { window.Sfx.heal(); } catch (e) { }
    };
    $("giftBtn").onclick = async () => {
      if (!chatNpc) return;
      // remote player: in-game trade menu (tabbed pockets, give or offer)
      if (chatNpc.isRemotePlayer) {
        try { openPlayerTrade(chatNpc.remoteHash); } catch (e) { toast("⚠️ " + (e.message || "Trade failed."), 4000); }
        return;
      }
      const p = window.Game.G.player;
      const pts = window.Entities.loyaltyPts(p);
      const cost = window.Entities.giftCost(chatNpc, p);
      if (p.gold < cost) { toast(`Need ${cost} gold for a gift (+${pts} 💛).`); return; }
      p.gold -= cost; chatNpc.loyalty = Math.min(1000, (chatNpc.loyalty || 0) + pts);
      try {
        chatNpc.memories = chatNpc.memories || { summary: "", tail: [] };
        chatNpc.memories.tail.push(`Shop ledger: ${p.name} gave a ${cost}g gift (loyalty ${chatNpc.loyalty}).`.slice(0, 220));
        if (chatNpc.memories.tail.length > 14) chatNpc.memories.tail = chatNpc.memories.tail.slice(-14);
      } catch (e) { }
      try { await window.World.saveNpc(chatNpc); } catch (e) { }
      toast(`🎁 ${chatNpc.name} appreciates it. Loyalty ${chatNpc.loyalty}.`);
      updateHUD(); renderChatHead();
    };
    $("respawnBtn").onclick = respawn;
    // tapping canvas near NPC talks
    window.addEventListener("click", (e) => {
      if (e.target.closest("button,input,textarea,.modal,.hudbtn,#joyBase,#profileHud,#levelUpBanner,#minimapWrap,#placebox,#notifLog,#tickerWrap")) return;
      const t = window.Game.nearestInteract();
      if (t && t.kind === "npc") {
        // only auto-open on tap (mobile) to avoid desktop misclicks
        if ("ontouchstart" in window) openChat(t.npc);
      }
    });
  }

  // ---------- tutorial quest offer + reward choice ----------
  let tutOfferRetry = null;
  function maybeOfferTutorial() {
    try {
      const p = window.Game && window.Game.G.player;
      if (!p) return;
      // global kill-switch (all worlds, default ON): veterans can silence the
      // invite entirely; manual 🎓 Training entry points still work
      if (!tutorialPromptsEnabled()) return;
      // offer is gameplay-only: never pop the training invite over the title
      // or loading screens (a quit inside the 3s delay just re-offers next game)
      if (!window.Game || !window.Game.G || window.Game.G.mode !== "playing") return;
      // build lab stays a lab: no training invite in practice worlds (the
      // Hearthkeeper intro does play there, but lessons + reward gear are for
      // real journeys). Manual 🎓 entry points still work everywhere.
      try { if (p && p.practice) return; } catch (e) { }
      try { if ($("titleScreen") && !$("titleScreen").hidden) return; } catch (e) { }
      try { if ($("loadingScreen") && !$("loadingScreen").hidden) return; } catch (e) { }
      if (p.tutorialOffered || p.tutorialDone) return;
      if (window.Quests && window.Quests.tutorialQuest(p)) { p.tutorialOffered = true; try { refreshTutGuide(); } catch (e) { } return; }
      // the Hearthkeeper goes first: no training invite until the first main
      // quest (Spark of the Hearth) is done and the oath-charm decision is
      // made (chosen or deliberately refused). Retry later — tutorialOffered
      // stays unset so the invite still fires once the intro resolves.
      try {
        if (!(window.MainStory && window.MainStory.introResolved && window.MainStory.introResolved(p))) {
          try { clearTimeout(tutOfferRetry); } catch (e) { }
          tutOfferRetry = setTimeout(() => { try { maybeOfferTutorial(); } catch (e) { } }, 20000);
          return;
        }
      } catch (e) { }
      // never pop over another modal — retry shortly instead
      if (isModalOpen && isModalOpen()) {
        try { clearTimeout(tutOfferRetry); } catch (e) { }
        tutOfferRetry = setTimeout(() => { try { maybeOfferTutorial(); } catch (e) { } }, 20000);
        return;
      }
      const list = $("tutStepList");
      if (list && window.Quests && window.Quests.tutorialSteps) {
        list.innerHTML = "";
        for (const s of window.Quests.tutorialSteps()) {
          const d = document.createElement("div");
          d.className = "tutstep";
          let keyTxt = "";
          try {
            const g = window.Quests && window.Quests.tutorialGuideFor ? window.Quests.tutorialGuideFor(s.id) : null;
            if (g && g.key) keyTxt = ` [${g.key}]`;
            if (s.id === "spell") {
              let k = "3";
              try { if (window.Quests.tutorialSpellKey) k = window.Quests.tutorialSpellKey(); } catch (e2) { }
              keyTxt = ` [${k}]`;
            }
          } catch (e) { }
          d.textContent = "• " + s.text + keyTxt;
          list.appendChild(d);
        }
        const hint = document.createElement("div");
        hint.className = "invempty";
        hint.textContent = "Guided: a golden arrow shows every key and menu, dimming the rest. After each lesson the 📜 Quests (J) log reopens — check it anytime.";
        list.appendChild(hint);
      }
      p.tutorialOffered = true;
      try { window.Game.saveGame(true); } catch (e) { }
      if ($("tutorialModal")) $("tutorialModal").hidden = false;
      try { window.Sfx.talk(); } catch (e) { }
    } catch (e) { }
  }
  function showTutorialReward() {
    try {
      const p = window.Game && window.Game.G.player;
      const q = window.Quests && window.Quests.tutorialQuest(p);
      if (!q) return;
      try { clearTutGuide(); } catch (e) { }
      const box = $("tutRewardList");
      if (box) {
        box.innerHTML = "";
        const choices = (window.Quests.TUT_REWARD_CHOICES || ["iron_sword"]);
        for (const id of choices) {
          let it = null;
          try { it = window.Items.ITEMS[id]; } catch (e) { }
          if (!it) continue;
          const b = document.createElement("button");
          b.innerHTML = `<b></b><span></span>`;
          b.querySelector("b").textContent = `${it.name}`;
          b.querySelector("span").textContent = it.desc || "";
          b.title = it.desc || it.name;
          b.onclick = () => {
            const ok = window.Quests.tutorialChoose(id);
            if (ok) { if ($("tutRewardModal")) $("tutRewardModal").hidden = true; renderQuests(); updateHUD(); updateHotbar(); try { clearTutGuide(); } catch (e2) { } }
            else toast("That reward slipped away — try again.");
          };
          box.appendChild(b);
        }
      }
      if ($("tutRewardModal")) $("tutRewardModal").hidden = false;
      try { window.Sfx.level(); } catch (e) { }
    } catch (e) { }
  }
  // ---------- guided tutorial spotlight (dim + arrow + key) ----------
  function tutVisible(el) {
    try {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    } catch (e) { return false; }
  }
  function clearTutGuide() {
    try { if ($("tutDim")) $("tutDim").hidden = true; } catch (e) { }
    try { if ($("tutTip")) $("tutTip").hidden = true; } catch (e) { }
    try { document.querySelectorAll(".tut-focus").forEach(el => el.classList.remove("tut-focus")); } catch (e) { }
  }
  function tutSetFocus(el) {
    try { document.querySelectorAll(".tut-focus").forEach(x => { if (x !== el) x.classList.remove("tut-focus"); }); } catch (e) { }
    try { if (el) el.classList.add("tut-focus"); } catch (e) { }
  }
  function tutPlaceTipNear(el, arrowDown) {
    try {
      const tip = $("tutTip"); if (!tip || !el) return;
      const r = el.getBoundingClientRect();
      tip.style.left = ""; tip.style.top = ""; tip.style.right = ""; tip.style.bottom = "";
      tip.style.transform = "";
      const w = Math.min(340, window.innerWidth * 0.86);
      let x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
      // prefer below the target, flip above when there is no room
      const below = r.bottom + 12 + 120 < window.innerHeight;
      const y = below ? (r.bottom + 12) : Math.max(30, r.top - 150);
      tip.style.left = x + "px";
      tip.style.top = y + "px";
      tip.style.maxWidth = w + "px";
      try {
        const ar = tip.querySelector(".tut-arrow");
        if (ar) ar.textContent = below ? "⬆️" : "⬇️";
      } catch (e) { }
    } catch (e) { }
  }
  function tutPlaceTipDocked() {
    // World-action lessons (tame, battle, dungeon…) have no menu target, so
    // never park the tip at screen center over the player — pin it to the
    // top edge below the clock/HUD, where it can't cover the action.
    try {
      const tip = $("tutTip"); if (!tip) return;
      const w = Math.min(300, window.innerWidth * 0.92);
      let top = 70;
      try {
        const c = $("clockbox");
        if (c) {
          const r = c.getBoundingClientRect();
          if (r && r.bottom > 0 && r.bottom < window.innerHeight) top = Math.max(top, r.bottom + 8);
        }
      } catch (e) { }
      top = Math.max(40, Math.min(top, Math.max(40, window.innerHeight - 160)));
      tip.style.left = Math.max(8, (window.innerWidth - w) / 2) + "px";
      tip.style.top = top + "px";
      tip.style.maxWidth = w + "px";
      tip.classList.add("docked");
      try { const ar = tip.querySelector(".tut-arrow"); if (ar) ar.textContent = ""; } catch (e) { }
    } catch (e) { }
  }
  function tutPlaceTipCenter() {
    try {
      const tip = $("tutTip"); if (!tip) return;
      const w = Math.min(340, window.innerWidth * 0.86);
      tip.style.left = Math.max(8, (window.innerWidth - w) / 2) + "px";
      tip.style.top = Math.max(70, window.innerHeight * 0.28) + "px";
      tip.style.maxWidth = w + "px";
      try { const ar = tip.querySelector(".tut-arrow"); if (ar) ar.textContent = "⬇️"; } catch (e) { }
    } catch (e) { }
  }
  function tutHotbarElForSpell() {
    try {
      const p = window.Game && window.Game.G.player;
      if (p && Array.isArray(p.hotbar)) {
        for (const want of ["frostbite", "fireball"]) {
          const i = p.hotbar.findIndex(s => s && s.kind === "ability" && s.id === want);
          if (i >= 0) {
            const el = $("hb" + i);
            if (el && tutVisible(el)) return { el, key: String(i + 1) };
          }
        }
      }
    } catch (e) { }
    try { const fb = $("hb2"); if (fb && tutVisible(fb)) return { el: fb, key: "3" }; } catch (e) { }
    return { el: null, key: "3" };
  }
  function tutGuideTarget(stepId) {
    try {
      const invIsOpen = (() => { try { const m = $("invModal"); return m && !m.hidden; } catch (e) { return false; } })();
      if (stepId === "move") return { el: null, center: true, key: "WASD / arrows", tip: "Hold WASD or arrow keys to walk (left stick on touch). Walk a few tiles." };
      if (stepId === "attack") {
        // Default Attack Slot is always on screen (touch ⚔️ only on mobile)
        const hb = $("hb0");
        const touch = $("atkBtn");
        const tgt = (touch && tutVisible(touch)) ? touch : ((hb && tutVisible(hb)) ? hb : null);
        return touchDevice() ? { el: tgt, center: !tgt, key: "tap ✕", tip: "Tap the big ink ✕ — that swings your gold default Attack Slot." } : { el: tgt, center: !tgt, key: "click / ⚔️", tip: "Click the world, or tap ⚔️ — that swings your gold default Attack Slot." };
      }
      if (stepId === "battle") {
        const hb = $("hb0");
        const touch = $("atkBtn");
        const tgt = (touch && tutVisible(touch)) ? touch : ((hb && tutVisible(hb)) ? hb : null);
        return touchDevice() ? { el: tgt, center: !tgt, key: "stick + ✕", tip: "Real fight! Kite with the stick, strike with ✕. Fell 2 foes." } : { el: tgt, center: !tgt, key: "click + WASD", tip: "Real fight! Kite with WASD, strike with click/⚔️. Fell 2 foes." };
      }
      if (stepId === "inv") {
        const b = $("phInvBtn");
        if (invIsOpen) return { el: null, center: true, key: "I ✓", tip: "Nice — your pack is open. Close it (I) and read the quest log for the next lesson." };
        return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "I", tip: "Press I — or tap 🎒 Inventory (top-right panel) — to open your pack." };
      }
      if (stepId === "unequip") {
        if (!invIsOpen) {
          const b = $("phInvBtn");
          return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "I", tip: "Press I to open 🎒 Inventory — then Unequip your weapon under Equipped." };
        }
        // inventory is open — the weapon row is first under Equipped; only
        // its Unequip button finishes this lesson (never a neighbor slot's)
        try {
          const eq = $("invEquip");
          if (eq) {
            const rows = eq.querySelectorAll(".invrow");
            const wrow = rows && rows[0];
            const btn = wrow && wrow.querySelector("button");
            if (btn && tutVisible(btn)) return { el: btn, key: "Unequip", tip: "Tap Unequip on ⚔️ WEAPON under Equipped. Bare hands teach martial arts!" };
            if (wrow && tutVisible(wrow)) return { el: wrow, key: "Unequip", tip: "Tap Unequip on ⚔️ WEAPON under Equipped." };
          }
        } catch (e) { }
        try {
          const card = document.querySelector("#invModal .card");
          if (card) return { el: card, key: "Unequip", tip: "Under 🛡️ Equipped, tap Unequip on your weapon." };
        } catch (e) { }
        return { el: null, center: true, key: "I", tip: "Use the 🎒 Inventory panel to unequip your weapon." };
      }
      if (stepId === "equip") {
        if (!invIsOpen) {
          const b = $("phInvBtn");
          return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "I", tip: "Press I to open 🎒 Inventory — then tap your weapon and hit ⚔️ Default weapon." };
        }
        // weapon already selected? spotlight its ⚔️ Default weapon button —
        // player weapons wield through the default slot, there is no plain Equip
        try {
          const side = $("invSide");
          if (side) {
            const dw = [...side.querySelectorAll(".sidebtns button")].find(b => /default weapon/i.test(b.textContent || ""));
            if (dw && tutVisible(dw)) return { el: dw, key: "⚔️ Default weapon", tip: "Tap ⚔️ Default weapon — binding it to the default slot wields it at once." };
          }
        } catch (e) { }
        // otherwise spotlight the weapon's own row in pockets (it just left
        // Equipped, so the Equipped section would be the wrong target)
        try {
          const p = window.Game && window.Game.G ? window.Game.G.player : null;
          const list = $("invList");
          if (p && list) {
            let wnames = [];
            try {
              for (const s of (p.inventory || [])) {
                const it = window.Items && window.Items.ITEMS[s.id];
                if (it && it.type === "equipment" && it.slot === "weapon" && wnames.indexOf(it.name) < 0) wnames.push(it.name);
              }
            } catch (e2) { }
            const rows = [...list.querySelectorAll(".invrow")];
            for (const nm of wnames) {
              const row = nm && rows.find(r => (r.textContent || "").indexOf(nm) >= 0);
              if (row && tutVisible(row)) return { el: row, key: "Tap → ⚔️ Default", tip: `Tap ${nm} to select it, then ⚔️ Default weapon in the detail panel.` };
            }
            // pockets open on another filter tab? point at the Weapons filter
            try {
              const tabs = $("invTabs");
              if (tabs) {
                const w = [...tabs.querySelectorAll("button")].find(b => /weapons/i.test(b.textContent || ""));
                if (w && tutVisible(w)) return { el: w, key: "🗡️ Weapons", tip: "Tap 🗡️ Weapons to list your blades, select one, then ⚔️ Default weapon." };
              }
            } catch (e2) { }
          }
        } catch (e) { }
        try {
          const card = document.querySelector("#invModal .card");
          if (card) return { el: card, key: "⚔️ Default weapon", tip: "Select your weapon in pockets → ⚔️ Default weapon. Binding wields it at once." };
        } catch (e) { }
        return { el: null, center: true, key: "I", tip: "Use the 🎒 Inventory panel to equip your weapon again." };
      }
      if (stepId === "tome") {
        if (!invIsOpen) {
          const b = $("phInvBtn");
          return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "I → 📕 Books", tip: "Your ❄️ Tome: Frostbite is in your pack. Press I → 📕 Books tab → 📖 Read it." };
        }
        // inventory is open — spotlight the real 📖 Read button when the
        // FROSTBITE tome is selected, so the tip parks beside it instead of
        // covering it (never a random tome — the lesson needs Frostbite)
        try {
          const side = $("invSide");
          if (side && /frostbite/i.test(side.textContent || "")) {
            const read = [...side.querySelectorAll(".sidebtns button")].find(b => /read/i.test(b.textContent || ""));
            if (read && tutVisible(read)) return { el: read, key: "📖 Read", tip: "Tap 📖 Read to learn ❄️ Frostbite — then hurl it with its hotbar key." };
          }
        } catch (e) { }
        // otherwise spotlight the Frostbite row itself (tapping it reveals 📖 Read)
        try {
          const list = $("invList");
          if (list) {
            const tomeRow = [...list.querySelectorAll(".invrow")].find(r => /frostbite/i.test(r.textContent || ""));
            if (tomeRow && tutVisible(tomeRow)) return { el: tomeRow, key: "Tap → 📖 Read", tip: "Tap ❄️ Tome: Frostbite to select it, then 📖 Read in the detail panel." };
          }
        } catch (e) { }
        try {
          const tabs = $("invTabs");
          if (tabs) {
            const btns = [...tabs.querySelectorAll("button")];
            const books = btns.find(b => /books/i.test(b.textContent || ""));
            if (books && tutVisible(books)) return { el: books, key: "📕 Books", tip: "Tap 📕 Books, select the ❄️ Tome: Frostbite, then 📖 Read." };
          }
        } catch (e) { }
        try {
          const card = document.querySelector("#invModal .card");
          if (card) return { el: card, key: "📖 Read", tip: "Open 📕 Books, select ❄️ Tome: Frostbite, then 📖 Read to learn it." };
        } catch (e) { }
        return { el: null, center: true, key: "📖 Read", tip: "In 🎒 Inventory → 📕 Books, 📖 Read the ❄️ Tome: Frostbite." };
      }
      if (stepId === "spell") {
        const hb = tutHotbarElForSpell();
        let k = "3";
        try { if (window.Quests && window.Quests.tutorialSpellKey) k = window.Quests.tutorialSpellKey(); } catch (e) { }
        if (hb.el) return { el: hb.el, key: k, tip: `Press ${k} to hurl ❄️ Frostbite — watch blue MP drain. Aim with the mouse.` };
        return { el: null, center: true, key: k, tip: `Press ${k} to cast ❄️ Frostbite (hotbar). Aim with the mouse, watch MP.` };
      }
      if (stepId === "dodge") {
        if (touchDevice()) return { el: null, center: true, key: "stick → past edge", tip: "Push the left stick PAST its edge to SPRINT (the ring turns gold) — sidestep out of incoming bolts and blasts." };
        return { el: null, center: true, key: "Shift + WASD", tip: "Hold Shift while moving to SPRINT — sidestep out of incoming bolts and blasts." };
      }
      if (stepId === "herb") {
        const b = $("intBtn");
        return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "E", tip: "Walk to a glowing 🌿 plant until “press E” shows, then press E (or tap the E button)." };
      }
      if (stepId === "craft") {
        if (!invIsOpen) {
          const b = $("phInvBtn");
          return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "I → 🔨 Crafting", tip: "Your pack brews and whittles. Press I → 🔨 Crafting tab → Craft anything." };
        }
        // crafting tab already open — spotlight the first Craft button itself
        try {
          const list = $("invList");
          if (list) {
            const cb = [...list.querySelectorAll("button")].find(b => /^craft$/i.test((b.textContent || "").trim()));
            if (cb && tutVisible(cb)) return { el: cb, key: "🔨 Craft", tip: "Tap Craft — torches take a single 🪵 wood, potions brew from 3 🌿 herbs." };
          }
        } catch (e) { }
        try {
          const tabs = $("invTabs");
          if (tabs) {
            const btns = [...tabs.querySelectorAll("button")];
            const cr = btns.find(b => /crafting/i.test(b.textContent || ""));
            if (cr && tutVisible(cr)) return { el: cr, key: "🔨 Crafting", tip: "Tap 🔨 Crafting, then Craft anything — torches take a single 🪵 wood." };
          }
        } catch (e) { }
        try {
          const card = document.querySelector("#invModal .card");
          if (card) return { el: card, key: "🔨 Craft", tip: "Open 🔨 Crafting and Craft anything — torches take a single 🪵 wood." };
        } catch (e) { }
        return { el: null, center: true, key: "🔨 Crafting", tip: "In 🎒 Inventory → 🔨 Crafting, craft anything." };
      }
      if (stepId === "dungeon") {
        const mm = $("minimapWrap") || $("minimap");
        return { el: (mm && tutVisible(mm)) ? mm : null, center: !(mm && tutVisible(mm)), key: "M → E", tip: "Press M for the map — walk to a purple 🕳️, step onto it, press E to descend." };
      }
      if (stepId === "party") {
        // point at the Party menu so they learn where it lives, E does the talking
        const pb = $("phPartyBtn");
        if (pb && tutVisible(pb)) return { el: pb, key: "E → Recruit (P)", tip: "Talk (E) to anyone, raise 💛 by chatting, then Recruit. Manage them in ⚔️ Party (P). Up to 4 friends." };
        const b = $("intBtn");
        return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "E → Recruit (P)", tip: "Talk (E) to anyone, raise 💛, then Recruit. Manage them in ⚔️ Party (P panel, top-right)." };
      }
      if (stepId === "tame") {
        // E tames, Party rides — point at the E button since taming comes first
        const b = $("intBtn");
        return { el: (b && tutVisible(b)) ? b : null, center: !(b && tutVisible(b)), key: "E then P", tip: "Weaken a wolf, horse or crab until it submits 💛 (below 25% HP — each beast gives up only by chance at its own point, so keep weakening it a little without killing it!) — press E fast, then ride it from the Party menu (P) → beasts → Ride." };
      }
    } catch (e) { }
    return { el: null, center: true, key: "J", tip: "Check 📜 Quests (J) to see what is next." };
  }
  function refreshTutGuide() {
    try {
      // the spotlight is gameplay-only: never over the title, the loading
      // screen, or any out-of-game state — no matter what is still active.
      const G = window.Game && window.Game.G;
      const playing = !!(G && G.mode === "playing" && G.player);
      let titleOpen = false, loadingOpen = false;
      try { const t = $("titleScreen"); titleOpen = !!(t && !t.hidden); } catch (e) { }
      try { const l = $("loadingScreen"); loadingOpen = !!(l && !l.hidden); } catch (e) { }
      if (!playing || titleOpen || loadingOpen) { clearTutGuide(); return; }
      let q = null;
      try { q = window.Quests && window.Quests.tutorialQuest ? window.Quests.tutorialQuest(window.Game && window.Game.G.player) : null; } catch (e) { q = null; }
      if (!q || q.status !== "active") { clearTutGuide(); return; }
      let cur = null;
      try { cur = window.Quests && window.Quests.tutorialCurrentStep ? window.Quests.tutorialCurrentStep(q) : (q.steps || []).find(s => !s.done); } catch (e) { cur = null; }
      if (!cur) { clearTutGuide(); return; }
      // the quest log itself is the checklist — when it is open, spotlight its
      // first unfinished row instead of floating a tip over it.
      try {
        const qm = $("questModal");
        if (qm && !qm.hidden) {
          clearTutGuide();
          try {
            const rows = [...document.querySelectorAll("#questList .psec")];
            const tutSec = rows.find(r => /Wayfarer Training/i.test(r.textContent || ""));
            if (tutSec) tutSec.classList.add("tut-focus");
          } catch (e) { }
          return;
        }
      } catch (e) { }
      const g = tutGuideTarget(cur.id);
      let meta = null;
      try { meta = window.Quests && window.Quests.tutorialGuideFor ? window.Quests.tutorialGuideFor(cur.id) : null; } catch (e) { }
      const key = (g && g.key) || (meta && meta.key) || "J";
      const tip = (g && g.tip) || (meta && meta.tip) || cur.text;
      const dim = $("tutDim"), tipEl = $("tutTip");
      if (!dim || !tipEl) return;
      // Dim ONLY when the lesson points at a menu to click (pack, gear rows,
      // tome, spell hotbar). World-action lessons (move, attack, battle,
      // dodge, herb, dungeon, party) never darken — they just float the tip.
      const DIM_STEPS = { inv: true, unequip: true, equip: true, tome: true, spell: true, craft: true };
      const wantsDim = !!DIM_STEPS[cur.id];
      if (!wantsDim) {
        try { dim.hidden = true; } catch (e) { }
        tipEl.hidden = false;
        try { $("tutTipKey").textContent = key; } catch (e) { }
        // a collapse never carries over to the next lesson
        try {
          if (tipEl.dataset.tutStep !== cur.id) { tipEl.dataset.tutStep = cur.id; tipEl.classList.remove("min"); }
        } catch (e) { }
        if (g && g.el && tutVisible(g.el)) {
          // anchored world tip (E button, hotbar, minimap…): park beside it
          try { tipEl.classList.remove("docked"); tipEl.classList.remove("min"); tipEl.onclick = null; } catch (e) { }
          tutSetFocus(g.el);
          try { $("tutTipText").textContent = "🎓 " + cur.text + " — " + tip; } catch (e) { }
          tutPlaceTipNear(g.el);
        } else {
          // no target on screen: dock to the top edge (never screen center),
          // compact text so it stays a thin banner above the action. Tap the
          // banner to collapse it to a badge, tap again to expand.
          try { document.querySelectorAll(".tut-focus").forEach(x => x.classList.remove("tut-focus")); } catch (e) { }
          try { $("tutTipText").textContent = "🎓 " + tip; } catch (e) { }
          tutPlaceTipDocked();
          try {
            tipEl.onclick = (ev) => {
              try {
                if (!tipEl.classList.contains("docked")) return;
                tipEl.classList.toggle("min");
                if (ev) { ev.preventDefault(); ev.stopPropagation(); }
              } catch (e2) { }
            };
          } catch (e) { }
        }
        return;
      }
      dim.hidden = false;
      tipEl.hidden = false;
      try { tipEl.classList.remove("docked"); tipEl.classList.remove("min"); tipEl.onclick = null; } catch (e) { }
      try { $("tutTipKey").textContent = key; } catch (e) { }
      try { $("tutTipText").textContent = "🎓 " + cur.text + " — " + tip; } catch (e) { }
      if (g && g.el && tutVisible(g.el)) {
        tutSetFocus(g.el);
        tutPlaceTipNear(g.el);
      } else {
        try { document.querySelectorAll(".tut-focus").forEach(x => x.classList.remove("tut-focus")); } catch (e) { }
        tutPlaceTipCenter();
      }
    } catch (e) { }
  }
  // ---------- quests ----------
  let questTab = "active"; // "active" | "main" | "guild" | "heaven" | "done" | "abandoned"
  function toggleQuests(force) {
    const m = $("questModal");
    if (!m) return;
    const show = force !== undefined ? force : m.hidden;
    m.hidden = !show;
    if (!m.hidden) {
      // tutorial checklist lives on Active — never strand trainees on history tabs
      try {
        const p = window.Game && window.Game.G && window.Game.G.player;
        if (p && window.Quests && window.Quests.tutorialQuest && window.Quests.tutorialQuest(p)) questTab = "active";
      } catch (e) { }
      renderQuests(); try { refreshTutGuide(); } catch (e) { }
    }
    else { try { refreshTutGuide(); } catch (e) { } }
  }
  function questDir(q) {
    try {
      const p = window.Game.G.player, tp = window.Quests.targetPos(q);
      if (!p || !tp) return "";
      const dirs = ["→ east", "↘ south-east", "↓ south", "↙ south-west", "← west", "↖ north-west", "↑ north", "↗ north-east"];
      const ang = Math.atan2(tp.y - p.y, tp.x - p.x);
      const idx = Math.round(ang / (Math.PI / 4)) & 7;
      const dist = Math.round(window.Quests.distToTarget(q) || 0);
      return `${dirs[idx]} · ${dist} tiles`;
    } catch (e) { return ""; }
  }
  function heavenQuestsFor(p) {
    try {
      if (window.Heaven && window.Heaven.listQuests) return window.Heaven.listQuests(p) || [];
    } catch (e) {}
    // fallback: read p.heavQ directly (Heaven not booted yet)
    try {
      if (!p || !p.heavQ) return [];
      const names = { dragon: "A dragon naps on a roof", water: "Holy water for the surface", return: "Heavendwellers, reborn downward" };
      const texts = {
        dragon: "A divine dragon has curled around some poor soul's rooftop and refuses to discuss it. Move it along — firmly, once it answers your knocking.",
        water: "The surface cathedrals keep asking. Take 3 holy waters down (step back through a hearth), pour a measure at a cathedral altar (E), then bring yourself home and tell me.",
        return: "Three heavendwellers stand ready to reincarnate to the surface. Speak with angels and heavendwellers up here — hear three of them out — and the wheel turns.",
      };
      const rewards = { dragon: { gold: 1500, xp: 1200, items: [] }, water: { gold: 900, xp: 800, items: [] }, return: { gold: 1200, xp: 1000, items: [] } };
      const out = [];
      for (const id of ["dragon", "water", "return"]) {
        const st = p.heavQ[id];
        if (!st || !st.status || st.status === "locked") continue;
        out.push({
          heavenId: id, id: "heaven:" + id, title: names[id] || id, type: "heaven",
          status: st.status, have: st.have | 0, need: (st.need | 0) || 3,
          desc: texts[id] || "", story: texts[id] || "",
          objective: `${st.have | 0}/${(st.need | 0) || 3} — return to the Goddess of Dawn at the Radiant Pantheon (0,0, heaven).`,
          reward: rewards[id] || { gold: 1000, xp: 800, items: [] },
          giver: { name: "Goddess of Dawn" },
        });
      }
      return out;
    } catch (e) { return []; }
  }
  function renderQuests() {
    const body = $("questList");
    if (!body) return;
    body.innerHTML = "";
    const p = window.Game.G.player;
    if (!p) { body.innerHTML = `<div class="invempty">No hero, no quests.</div>`; return; }
    const qs = window.Quests.ensure(p);
    const act = qs.filter(q => q.status === "active" || q.status === "turnin");
    let done = [], ab = [], guildAct = [], heavAll = [];
    try {
      done = window.Quests.completedQuests ? window.Quests.completedQuests(p) : qs.filter(q => q.status === "done").slice().reverse();
      ab = window.Quests.abandonedQuests ? window.Quests.abandonedQuests(p) : qs.filter(q => q.status === "abandoned").slice().reverse();
    } catch (e) { done = []; ab = []; }
    try { guildAct = (window.Guild && window.Guild.active) ? (window.Guild.active(p) || []) : []; } catch (e) { guildAct = []; }
    try { heavAll = heavenQuestsFor(p); } catch (e) { heavAll = []; }
    const heavAct = heavAll.filter(q => q.status === "active" || q.status === "turnin");
    const heavDone = heavAll.filter(q => q.status === "done");
    const doneAll = done.concat(heavDone);
    if (questTab !== "active" && questTab !== "main" && questTab !== "guild" && questTab !== "heaven" && questTab !== "done" && questTab !== "abandoned") questTab = "active";
    // main storyline counts
    let mainAct = null, mainDone = [];
    try {
      if (window.MainStory && window.MainStory.ensure) {
        const ms = window.MainStory.ensure(p);
        mainAct = ms ? ms.active : null;
        mainDone = ms ? (ms.done || []) : [];
      }
    } catch (e) { mainAct = null; mainDone = []; }
    const head = $("questHead");
    if (head) {
      if (questTab === "main") head.textContent = mainAct ? `🌟 ${mainAct.title}` : (mainDone.length ? `🌟 ${mainDone.length} chapters closed` : "🌟 The hearth fire leans toward you…");
      else if (questTab === "guild") head.textContent = guildAct.length ? `${guildAct.length} contracts (max ${window.Guild ? window.Guild.MAX_ACTIVE : 3}) — pin more at any 🏛️ guildhall` : "No contracts — pin work at any 🏛️ guildhall Noticeboard.";
      else if (questTab === "heaven") head.textContent = heavAct.length ? `${heavAct.length} goddess errands — ask her at the Radiant Pantheon (0,0, heaven)` : "No goddess errands — cross blades with her first (mock battle), then ask for work.";
      else if (questTab === "done") head.textContent = doneAll.length ? `${doneAll.length} tales closed` : "No completed quests yet.";
      else if (questTab === "abandoned") head.textContent = ab.length ? `${ab.length} trails left` : "No abandoned quests.";
      else head.textContent = (act.length + heavAct.length) ? `${act.length + heavAct.length} active (villager ${act.length} + goddess ${heavAct.length})` : "No active quests — talk to villagers (E), delve deep, loot legends, or ask the goddess in heaven.";
    }
    // tabs: Active | Main | Guild | Heaven | Completed | Abandoned
    try {
      const tabs = document.createElement("div");
      tabs.className = "ctabs";
      tabs.id = "questTabs";
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Quest log tabs");
      const mk = (key, label) => {
        const b = document.createElement("button");
        b.textContent = label;
        b.title = label + " — tab (only one list shows)";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", questTab === key ? "true" : "false");
        if (questTab === key) b.className = "active";
        b.onclick = () => { questTab = key; renderQuests(); };
        tabs.appendChild(b);
      };
      mk("active", `📜 Active (${act.length + heavAct.length})`);
      mk("main", `🌟 Main (${mainAct ? 1 : 0})`);
      mk("guild", `🏛️ Guild (${guildAct.length})`);
      mk("heaven", `🌅 Heaven (${heavAct.length})`);
      mk("done", `✅ Completed (${doneAll.length})`);
      mk("abandoned", `🚫 Abandoned (${ab.length})`);
      body.appendChild(tabs);
    } catch (e) { }
    if (questTab === "main") { renderMainQuests(body, mainAct, mainDone); return; }
    if (questTab === "guild") { renderGuildQuests(body, guildAct); return; }
    if (questTab === "heaven") { renderHeavenQuests(body, heavAll); return; }
    if (questTab === "done") { renderQuestHistory(body, doneAll, "done"); return; }
    if (questTab === "abandoned") { renderQuestHistory(body, ab, "abandoned"); return; }
    for (const q of act) {
      const sec = pSec(body, `${q.status === "turnin" ? "📨" : "📜"} ${q.title}`, `from ${q.giver ? q.giver.name : "the wilds"}${q.turnIn && q.status === "active" ? " · report back when done" : ""}`);
      sec.appendChild(pRow(`${window.Quests.objectiveText(q)}`));
      if (q.need > 1 && (q.type === "fetch" || q.type === "slay" || q.type === "tutorial")) {
        const pct = Math.min(100, Math.round(100 * (q.have | 0) / q.need));
        const bar = document.createElement("div");
        bar.className = "pbar";
        const fill = document.createElement("div");
        fill.style.width = pct + "%";
        bar.appendChild(fill);
        sec.appendChild(bar);
      }
      // guided tutorial: checklist with current lesson first, keys included
      if (q.type === "tutorial" && Array.isArray(q.steps)) {
        const list = document.createElement("div");
        list.style.margin = "4px 0";
        for (const s of q.steps) {
          const d = document.createElement("div");
          d.className = "tutstep";
          let keyTxt = "";
          try {
            const g = window.Quests && window.Quests.tutorialGuideFor ? window.Quests.tutorialGuideFor(s.id) : null;
            if (g && g.key) keyTxt = ` [${g.key}]`;
            if (s.id === "spell") {
              let k = "3";
              try { if (window.Quests.tutorialSpellKey) k = window.Quests.tutorialSpellKey(); } catch (e2) { }
              keyTxt = ` [${k}]`;
            }
          } catch (e) { }
          d.textContent = (s.done ? "✅ " : (!q.steps.some(x => !x.done) ? "• " : (q.steps.find(x => !x.done) === s ? "👉 " : "• "))) + s.text + (s.done ? "" : keyTxt);
          try { if (!s.done && q.steps.find(x => !x.done) === s) { d.style.fontWeight = "900"; d.style.color = "#ffd93d"; } } catch (e) { }
          list.appendChild(d);
        }
        sec.appendChild(list);
        const hint = document.createElement("div");
        hint.className = "invempty";
        hint.textContent = "You can check 📜 Quests (J) anytime to see what lesson is next — this log reopens after every step.";
        sec.appendChild(hint);
      }
      const tgt = window.Quests.targetPos(q);
      if (tgt && q.status !== "turnin") {
        const place = (q.target && (q.target.placeName || q.target.name)) || "the wilds";
        sec.appendChild(pRow(`📍 ${place} — ${questDir(q)}${q.type === "clear" ? " (delve entrance)" : ""}`));
      }
      if (q.reward) {
        const bits = [`+${q.reward.gold}g`, `+${q.reward.xp} XP`].concat((q.reward.items || []).map(d => {
          try { const it = window.Items.ITEMS[d.id]; return it ? `${it.name}${d.n > 1 ? "×" + d.n : ""}` : d.id; } catch (e) { return d.id; }
        }));
        sec.appendChild(pRow(`🎁 Reward: ${bits.join(" · ")}`));
      }
      if (q.desc) sec.appendChild(pRow(`💬 ${q.desc}`));
      // 📖 story: every quest narrates; sagas show heard-so-far chapters
      try {
        if (q.type === "chain" && Array.isArray(q.stages)) {
          if (q.story) sec.appendChild(questStoryEl(`📖 ${q.story}`));
          const sl = document.createElement("div");
          sl.style.margin = "4px 0";
          sl.style.display = "flex";
          sl.style.flexDirection = "column";
          sl.style.gap = "3px";
          const idx = Math.max(0, Math.min(q.stages.length - 1, q.stageIdx | 0));
          q.stages.forEach((st, i) => {
            const d = document.createElement("div");
            d.className = "tutstep";
            d.style.opacity = i < idx ? "0.75" : (i === idx ? "1" : "0.55");
            if (i === idx) { d.style.fontWeight = "900"; d.style.color = "#ffd93d"; }
            let label = "";
            try {
              if (st.type === "slay") { let mb = "foes"; try { mb = (window.Quests._test ? "" : "") || ""; } catch (e) { } label = `Slay ${st.need}x ${st.mobKind}${st.place ? " @ " + st.place : ""}`; }
              else if (st.type === "fetch") label = `Fetch ${st.need}x ${st.itemId}${st.place ? " @ " + st.place : ""}`;
              else if (st.type === "clear") label = `Clear ${st.place || st.dungeon || "the delve"}`;
              else if (st.type === "deliver") label = `Deliver to ${st.deliverToName || (st.deliverTo && st.deliverTo.name) || "friend"}${st.place ? " @ " + st.place : ""}`;
              else label = st.type;
            } catch (e) { label = st.type; }
            const mark = i < idx ? "✅ " : (i === idx ? "👉 " : "• ");
            d.textContent = mark + `Stage ${i + 1}/${q.stages.length}: ` + label;
            sl.appendChild(d);
            // heard chapters only: done + current (upcoming stays untold)
            if (i <= idx && st.story) sl.appendChild(questStoryEl(st.story, true));
          });
          sec.appendChild(sl);
        } else if (q.story) {
          sec.appendChild(questStoryEl(`📖 ${q.story}`));
        }
      } catch (e) { }
      const row = document.createElement("div");
      row.className = "bigact";
      // primary action: close the log and refocus THIS quest (gold, first —
      // so Abandon is never the button that looks like it should be pressed)
      const okb = document.createElement("button");
      okb.textContent = "✓ Ok";
      okb.className = "okbtn";
      okb.title = "Close and focus this quest";
      okb.onclick = () => {
        toggleQuests(false);
        try {
          let sub = "";
          try { sub = window.Quests.objectiveText(q); } catch (e) { }
          if (q.type === "tutorial") {
            try {
              const cur = window.Quests.tutorialCurrentStep ? window.Quests.tutorialCurrentStep(q) : (q.steps || []).find(s => !s.done);
              if (cur) sub = "👉 Next: " + cur.text;
              else if ((q.steps || []).length && (q.steps || []).every(s => s.done)) sub = "🎁 All lessons done — claim your reward!";
            } catch (e) { }
          }
          showQuestBanner(q.status === "turnin" ? "📨" : (q.type === "tutorial" ? "🎓" : "📜"), q.title, sub);
        } catch (e) { }
        try { refreshTutGuide(); } catch (e2) { }
      };
      row.appendChild(okb);
      if (q.type === "tutorial" && q.status === "active" && (q.steps || []).length && (q.steps || []).every(s => s.done)) {
        const cb = document.createElement("button");
        cb.textContent = "🎁 Claim reward";
        cb.onclick = () => { showTutorialReward(); };
        row.appendChild(cb);
      }
      if (q.status === "turnin") {
        const tb = document.createElement("button");
        tb.textContent = `✅ Report to ${q.giver ? q.giver.name.split(" ")[0] : "giver"}`;
        tb.onclick = () => { window.Quests.turnIn(q); renderQuests(); updateHUD(); };
        row.appendChild(tb);
      } else if (tgt) {
        const tb = document.createElement("button");
        tb.textContent = "📍 Track";
        tb.className = "ghost";
        tb.title = "Center the world map on this quest";
        tb.onclick = () => { centerMapOn(tgt.x, tgt.y); };
        row.appendChild(tb);
      }
      const ab = document.createElement("button");
      ab.textContent = "Abandon";
      ab.className = "ghost";
      ab.onclick = () => { if (confirm(`Abandon "${q.title}"?`)) { window.Quests.abandon(q.id); renderQuests(); updateHUD(); } };
      row.appendChild(ab);
      sec.appendChild(row);
    }
    // 🌅 goddess errands share the Active tab (they are easy to miss in a
    // separate tab only) — same cards as the 🌅 Heaven tab, filtered to
    // active/turnin here.
    try { renderHeavenRows(body, heavAct); } catch (e) {}
  }
  function heavenTrackPos(p, hq) {
    // Pantheon turn-in: only trackable while standing in heaven (the map is
    // dim-local — tracking (0,0) from the surface would center the wrong world).
    try {
      if (!p || p.dim !== "heaven") return null;
      if (window.Heaven && window.Heaven.CENTER) return { x: window.Heaven.CENTER.x, y: window.Heaven.CENTER.y };
      return { x: 0, y: 0 };
    } catch (e) { return null; }
  }
  function renderHeavenRows(body, list) {
    const p = window.Game.G.player;
    for (const q of list) {
      const sec = pSec(body, `${q.status === "turnin" ? "📨" : "🌅"} ${q.title}`, `from Goddess of Dawn${q.status === "active" ? " · report at the Radiant Pantheon (0,0, heaven) when done" : ""}`);
      try {
        const obj = q.objective || (window.Heaven && window.Heaven.objectiveFor ? window.Heaven.objectiveFor(p, q.heavenId) : `${q.have | 0}/${q.need | 0}`);
        sec.appendChild(pRow(`👉 ${obj}`));
      } catch (e) {}
      if ((q.need | 0) > 1) {
        const pct = Math.min(100, Math.round(100 * (q.have | 0) / (q.need || 1)));
        const bar = document.createElement("div");
        bar.className = "pbar";
        const fill = document.createElement("div");
        fill.style.width = pct + "%";
        bar.appendChild(fill);
        sec.appendChild(bar);
      }
      // water errand legs: surface vs heaven hint (map is dim-local)
      try {
        if (q.heavenId === "water" && q.status === "active") {
          if (p && p.dim !== "heaven") sec.appendChild(pRow(`📍 Pour at any surface cathedral altar (E), then hearth-travel back to heaven.`));
          else if (!q.sawSurf) sec.appendChild(pRow(`📍 Step back to the surface through a hearth gate first.`));
        }
      } catch (e) {}
      if (q.status === "turnin") {
        try {
          if (p && p.dim === "heaven") sec.appendChild(pRow(`📍 Radiant Pantheon (0,0) — heaven side`));
          else sec.appendChild(pRow(`📍 Return via a hearth gate to heaven, then to the Radiant Pantheon (0,0).`));
        } catch (e) {}
      }
      if (q.reward) sec.appendChild(pRow(`🎁 Reward: +${q.reward.gold | 0}g · +${q.reward.xp | 0} XP`));
      if (q.desc) sec.appendChild(pRow(`💬 ${q.desc}`));
      if (q.story) sec.appendChild(questStoryEl(`📖 ${q.story}`));
      const row = document.createElement("div");
      row.className = "bigact";
      const okb = document.createElement("button");
      okb.textContent = "✓ Ok";
      okb.className = "okbtn";
      okb.title = "Close and focus this errand";
      okb.onclick = () => {
        toggleQuests(false);
        try { showQuestBanner(q.status === "turnin" ? "📨" : "🌅", q.title, q.objective || ""); } catch (e) { }
        try { refreshTutGuide(); } catch (e2) { }
      };
      row.appendChild(okb);
      if (q.status === "turnin") {
        const tb = document.createElement("button");
        tb.textContent = `📜 Turn in (Goddess)`;
        tb.title = "Hand it over (same as telling her at the pantheon)";
        tb.onclick = () => { try { window.Heaven.turnInQuest(q.heavenId); } catch (e) {} renderQuests(); updateHUD(); };
        row.appendChild(tb);
        const tp = heavenTrackPos(p, q);
        if (tp) {
          const tr = document.createElement("button");
          tr.textContent = "📍 Track";
          tr.className = "ghost";
          tr.title = "Center the Known World map on the pantheon";
          tr.onclick = () => { centerMapOn(tp.x, tp.y); };
          row.appendChild(tr);
        }
      } else {
        const tp = (q.status === "active" && q.heavenId === "water" && q.sawSurf) ? heavenTrackPos(p, q) : null;
        if (tp) {
          const tr = document.createElement("button");
          tr.textContent = "📍 Track";
          tr.className = "ghost";
          tr.title = "Center the Known World map on the pantheon";
          tr.onclick = () => { centerMapOn(tp.x, tp.y); };
          row.appendChild(tr);
        }
      }
      if (q.status === "active") {
        const ab2 = document.createElement("button");
        ab2.textContent = "Abandon";
        ab2.className = "ghost";
        ab2.onclick = () => { if (confirm(`Abandon "${q.title}"?`)) { try { window.Heaven.abandonQuest(q.heavenId); } catch (e) {} renderQuests(); updateHUD(); } };
        row.appendChild(ab2);
      }
      sec.appendChild(row);
    }
  }
  // ---------- goddess errands (🌅 Heaven tab) ----------
  // ---------- guild contracts inside the quest log (read-only mirror of the Counter) ----------
  function renderGuildQuests(body, list) {
    const p = window.Game.G.player;
    try {
      if (window.Guild && window.Guild.rankProgress) {
        const prog = window.Guild.rankProgress(p);
        if (prog && prog.rec) {
          const nx = prog.next;
          let ladder = "";
          try { ladder = window.Guild.RANKS.map((r, i) => `${r.name} ${window.Guild.RANK_NEED[i]}`).join(" → "); } catch (e2) { ladder = "Rusty 0 → Iron 5 → Steel 10 → Mythril 30 → Dragonbone 100 → Oblivion 200 → Dawnstone 300"; }
          const hdr = document.createElement("div");
          hdr.className = "invempty";
          hdr.style.cssText = "border-color:#ffd93d;color:#ffd93d;font-weight:900";
          if (nx) {
            let nxRec = null;
            try { nxRec = window.Guild.rankRec(nx.rank); } catch (e3) { nxRec = null; }
            const left = nx.need - (prog.done | 0);
            hdr.textContent = `Adventurer rank: ${prog.rec.name} · ${prog.done | 0} done · ${left} quest${left === 1 ? "" : "s"} till ${nxRec ? nxRec.name : "next"} (${nx.need} total) — ${ladder}`;
          } else {
            hdr.textContent = `Adventurer rank: ${prog.rec.name} · ${prog.done | 0} done · highest rank — ${ladder}`;
          }
          body.appendChild(hdr);
        }
      }
    } catch (e) {}
    const hint = document.createElement("div");
    hint.className = "invempty";
    hint.textContent = "Guild contracts live here — pin postings from any 🏛️ guildhall Noticeboard, turn them in at any 🛎️ Counter.";
    body.appendChild(hint);
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "invempty";
      empty.textContent = "No contracts carried — visit a 🏛️ guildhall Noticeboard to pin work.";
      body.appendChild(empty);
    }
    for (const q of list) {
      let ready = false;
      try { ready = window.Guild.isReady(p, q); } catch (e) { ready = false; }
      const icon = q.kind === "kill" ? "⚔️" : q.kind === "clear" ? "🏠" : "📦";
      const sec = pSec(body, `${ready ? "✅" : icon} ${q.title}`, `guild contract · from ${q.boardName || "guild board"}${ready ? " · ready to turn in!" : ""}`);
      try { sec.appendChild(pRow(`📊 ${window.Guild.progressText(p, q)}`)); } catch (e) { }
      try {
        const bar = document.createElement("div");
        bar.className = "pbar";
        const fill = document.createElement("div");
        let have = 0;
        try { have = q.kind === "fetch" ? window.Guild.fetchHave(p, q) : (q.have | 0); } catch (e) { have = 0; }
        fill.style.width = Math.max(0, Math.min(100, Math.round(100 * have / (q.need || 1)))) + "%";
        bar.appendChild(fill);
        sec.appendChild(bar);
      } catch (e) { }
      try {
        const where = window.Guild.targetText(q);
        if (where) sec.appendChild(pRow(`📍 ${where}`));
      } catch (e) { }
      if (q.srcHint) sec.appendChild(pRow(q.srcHint));
      if (q.reward) sec.appendChild(pRow(`🎁 Reward: +${q.reward.gold | 0}g · +${q.reward.xp | 0} XP`));
      if (q.commissionId) sec.appendChild(pRow(`📜 Commissioned work — first finisher wins.`));
      if (q.desc) sec.appendChild(pRow(`💬 ${q.desc}`));
      const row = document.createElement("div");
      row.className = "bigact";
      const okb = document.createElement("button");
      okb.textContent = "✓ Ok";
      okb.className = "okbtn";
      okb.title = "Close and focus this contract";
      okb.onclick = () => {
        toggleQuests(false);
        try {
          let sub = "";
          try { sub = window.Guild.progressText(p, q); } catch (e) { }
          showQuestBanner(ready ? "✅" : "🏛️", q.title, sub);
        } catch (e) { }
        try { refreshTutGuide(); } catch (e2) { }
      };
      row.appendChild(okb);
      if (ready) {
        const tb = document.createElement("button");
        tb.textContent = `🛎️ Turn in`;
        tb.title = "Hand it over (same as any guild Counter)";
        tb.onclick = () => {
          let r = null;
          try { r = window.Guild.turnIn(p, q.gid); } catch (e) { r = { ok: false, msg: "Turn-in failed." }; }
          if (!(r && r.ok)) toast("⚠️ " + ((r && r.msg) || "Couldn't turn in."), 3500);
          try { updateHUD(); updateHotbar(); } catch (e) { }
          try { if ($("guildModal") && !$("guildModal").hidden) renderGuild(); } catch (e) { }
          renderQuests();
        };
        row.appendChild(tb);
      } else if (q.target && isFinite(q.target.gx) && isFinite(q.target.gy)) {
        const tb = document.createElement("button");
        tb.textContent = "📍 Track";
        tb.className = "ghost";
        tb.title = "Center the world map on this contract";
        tb.onclick = () => { centerMapOn(q.target.gx, q.target.gy); };
        row.appendChild(tb);
      }
      const ab2 = document.createElement("button");
      ab2.textContent = "Abandon";
      ab2.className = "ghost";
      ab2.onclick = () => {
        if (!confirm(`Abandon "${q.title}"?`)) return;
        try { window.Guild.abandon(p, q.gid); } catch (e) { }
        toast(`📜 Contract abandoned: ${q.title}`, 2500);
        try { updateHUD(); } catch (e) { }
        try { if ($("guildModal") && !$("guildModal").hidden) renderGuild(); } catch (e) { }
        renderQuests();
      };
      row.appendChild(ab2);
      sec.appendChild(row);
    }
    // recent turn-ins, newest first
    try {
      const g = window.Guild.ensure(p);
      const h = (g.history || []).slice(0, 8);
      if (h.length) {
        const hh = document.createElement("div");
        hh.className = "invempty";
        hh.textContent = `📜 Recent turn-ins`;
        body.appendChild(hh);
        for (const r of h) {
          const d = document.createElement("div");
          d.style.fontSize = "12px"; d.style.opacity = "0.8";
          d.textContent = `• ${r.title} — +${r.gold | 0}g`;
          body.appendChild(d);
        }
      }
    } catch (e) { }
  }
  function renderHeavenQuests(body, list) {
    const p = window.Game.G.player;
    const hint = document.createElement("div");
    hint.className = "invempty";
    hint.textContent = "Goddess errands live here — ask her at the Radiant Pantheon (0,0, heaven) after your first mock battle (win or lose). They also appear under 📜 Active while carried.";
    body.appendChild(hint);
    let unlocked = false;
    try { unlocked = window.Heaven && window.Heaven.questsUnlocked ? window.Heaven.questsUnlocked(p) : !!(p && (p.heavMockDone || (p.heavMockWins | 0) > 0 || (p.heavMockLosses | 0) > 0)); } catch (e) { unlocked = false; }
    if (!unlocked) {
      const empty = document.createElement("div");
      empty.className = "sbox-none";
      empty.textContent = "🌅 Cross blades with the Goddess of Dawn first — gently, to first fall (⚔️ mock battle at the pantheon). Win or lose, she will trust you with errands after.";
      body.appendChild(empty);
      return;
    }
    const act = (list || []).filter(q => q.status === "active" || q.status === "turnin");
    const doneH = (list || []).filter(q => q.status === "done");
    if (!act.length && !doneH.length) {
      const empty = document.createElement("div");
      empty.className = "invempty";
      empty.textContent = "No errands carried — speak to her at the pantheon and take what you can carry.";
      body.appendChild(empty);
      try {
        const row = document.createElement("div");
        row.className = "bigact";
        const b = document.createElement("button");
        b.textContent = "🌅 Talk to the goddess";
        b.title = "Open the pantheon (heaven 0,0 only)";
        b.onclick = () => { toggleQuests(false); try { window.Heaven.openPantheon(); } catch (e) {} };
        row.appendChild(b);
        body.appendChild(row);
      } catch (e) {}
      return;
    }
    try { renderHeavenRows(body, act); } catch (e) {}
    if (doneH.length) {
      const hh = document.createElement("div");
      hh.className = "invempty";
      hh.textContent = `✅ Finished errands (${doneH.length})`;
      body.appendChild(hh);
      for (const q of doneH) {
        const sec = pSec(body, `✅ ${q.title}`, "from Goddess of Dawn · done");
        if (q.reward) sec.appendChild(pRow(`🎁 Reward: +${q.reward.gold | 0}g · +${q.reward.xp | 0} XP`));
        if (q.story || q.desc) sec.appendChild(questStoryEl(`📖 ${q.story || q.desc}`));
      }
    }
  }
  function questStoryEl(text, small) {
    const d = document.createElement("div");
    d.className = "qstory";
    if (small) d.classList.add("small");
    d.textContent = text;
    return d;
  }
  // ---------- main storyline tab (🌟 Main) ----------
  function renderMainQuests(body, mainAct, mainDone) {
    const hint = document.createElement("div");
    hint.className = "invempty";
    hint.textContent = "The built-in campaign: hearth, delves, shards, towers, Hell, the castle, Peter and the dawn. It begins the moment you enter the world — the Hearthkeeper speaks, you swear an oath and choose its charm, then the delves wait.";
    body.appendChild(hint);
    if (!mainAct && !(mainDone && mainDone.length)) {
      const empty = document.createElement("div");
      empty.className = "sbox-none";
      empty.textContent = "🌟 No main quest yet — walk into any dungeon mouth (🕳️) and descend. The dark will notice you back.";
      body.appendChild(empty);
      return;
    }
    if (mainAct) {
      let obj = "";
      try { obj = window.MainStory ? window.MainStory.objectiveText(mainAct) : (mainAct.objective || ""); } catch (e) { obj = mainAct.objective || ""; }
      const sec = pSec(body, `🌟 ${mainAct.title}`, "main storyline · active");
      sec.appendChild(pRow(`👉 ${obj}`));
      if (mainAct.desc) sec.appendChild(pRow(`💬 ${mainAct.desc}`));
      if (mainAct.story) sec.appendChild(questStoryEl(`📖 ${mainAct.story}`));
      // progress extras
      try {
        if (mainAct.id === "mq_hearth_spark") {
          let og = null, listened = false;
          try { og = window.MainStory && window.MainStory.originOf ? window.MainStory.originOf(window.Game.G.player) : null; listened = !!(mainAct.data && mainAct.data.listened); } catch (e) {}
          sec.appendChild(pRow(listened ? (og ? `🔥 Oath sworn: ${og} — descend now; the dark waits.` : `🔥 The Hearthkeeper has spoken — descend now.`) : `🔥 The Hearthkeeper waits in the embers — press 🔥 Listen below.`));
        }
        if (mainAct.id === "mq_first_delve" && mainAct.data) {
          const have = mainAct.data.kills | 0, need = mainAct.data.need | 0 || 3;
          const bar = document.createElement("div"); bar.className = "pbar";
          const fill = document.createElement("div"); fill.style.width = Math.min(100, Math.round(100 * have / need)) + "%";
          bar.appendChild(fill); sec.appendChild(bar);
        }
        if (mainAct.id === "mq_twelve_shards") {
          let c = 0, sph = false;
          try { c = window.Hell.fragmentCount(window.Game.G.player); sph = window.Hell.hasSphere(window.Game.G.player); } catch (e) {}
          sec.appendChild(pRow(sph ? `🔮 Hell Sphere forged — the towers wake.` : `🩸 Fragments: ${c}/12 distinct. Join them in 🎒 Inventory when whole.`));
          try {
            const dl = window.MainStory && window.MainStory.shardDreamLine ? window.MainStory.shardDreamLine(window.Game.G.player) : "";
            if (dl) sec.appendChild(pRow(`💤 Shard dreams: ${dl}`));
          } catch (e) {}
          if (c >= 12 && !sph) {
            const fb = document.createElement("button");
            fb.textContent = "🔮 Forge hint: 🎒 Inventory → join 12 fragments";
            fb.onclick = () => { toggleQuests(false); try { toggleInv(true); } catch (e) {} };
            const row0 = document.createElement("div"); row0.className = "bigact"; row0.appendChild(fb); sec.appendChild(row0);
          }
        }
        if (mainAct.id === "mq_towers") {
          let aim = null, hermit = false;
          try { const fl = window.MainStory.flags(window.Game.G.player); aim = fl.towerAim; hermit = !!fl.hermitMet; } catch (e) {}
          sec.appendChild(pRow(hermit ? (aim ? `🧙 Hermit counsels ${aim} first — Track below walks his road.` : `🧙 The Hermit counsels the nearest hum — Track below.`) : `🧙 The Hermit offers counsel in this tab — hear him before you march.`));
        }
        if ((mainAct.id === "mq_heart_castle" || mainAct.id === "mq_hell_arrival") && window.MainStory && window.MainStory.hellPathOf) {
          try {
            const hp = window.MainStory.hellPathOf(window.Game.G.player);
            if (hp) sec.appendChild(pRow(hp === "stealth" ? `🌙 Soft road: the Ashen Guide's blind canyons hide you.` : `🔥 Loud road: the Guide drums the garrison out to meet you.`));
          } catch (e) {}
        }
      } catch (e) {}
      const row = document.createElement("div");
      row.className = "bigact";
      const okb = document.createElement("button");
      okb.textContent = "✓ Ok";
      okb.className = "okbtn";
      okb.title = "Close and focus this quest";
      okb.onclick = () => {
        toggleQuests(false);
        try { showQuestBanner("🌟", mainAct.title, obj); } catch (e) {}
      };
      row.appendChild(okb);
      // context buttons per stage
      try {
        const tp = window.MainStory ? window.MainStory.targetPos(mainAct) : null;
        if (tp && tp.x != null) {
          const tb = document.createElement("button");
          tb.textContent = "📍 Track";
          tb.className = "ghost";
          tb.title = tp.hell ? "Center the Known World map (Hell side is dim-local)" : "Center the world map on this quest";
          tb.onclick = () => { centerMapOn(tp.x, tp.y); };
          row.appendChild(tb);
        }
      } catch (e) {}
      try {
        if (mainAct.id === "mq_hearth_spark") {
          const hb = document.createElement("button");
          hb.textContent = "🔥 Listen";
          hb.title = "Hear the Hearthkeeper (starting vision: oath + blessing)";
          hb.onclick = () => { try { toggleQuests(false); setTimeout(() => { window.MainStory.openHearth(); }, 150); } catch (e) {} };
          row.appendChild(hb);
        }
        if (mainAct.id === "mq_towers") {
          const hb2 = document.createElement("button");
          hb2.textContent = "🧙 Hear the Hermit";
          hb2.title = "The Hermit counsels which compass to walk first";
          hb2.onclick = () => { try { toggleQuests(false); setTimeout(() => { window.MainStory.openHermit(); }, 150); } catch (e) {} };
          row.appendChild(hb2);
        }
        if (mainAct.id === "mq_confront") {
          const cb = document.createElement("button");
          cb.textContent = "🌅 Commune";
          cb.title = "Stand on the SURFACE (not in a dungeon) and confront her";
          cb.onclick = () => { try { toggleQuests(false); setTimeout(() => { window.MainStory.openConfront(); }, 150); } catch (e) {} };
          row.appendChild(cb);
        }
      } catch (e) {}
      sec.appendChild(row);
    }
    if (mainDone && mainDone.length) {
      const hh = document.createElement("div");
      hh.className = "invempty";
      hh.style.cssText = "border-color:#ffd93d;color:#ffd93d;font-weight:900";
      hh.textContent = `📜 Closed chapters (${mainDone.length})`;
      body.appendChild(hh);
      const list = mainDone.slice().reverse();
      for (const q of list.slice(0, 12)) {
        const sec = pSec(body, `✅ ${q.title}`, q.doneAt ? questDate(q.doneAt) : "done");
        if (q.story) sec.appendChild(questStoryEl(`📖 ${String(q.story).slice(0, 900)}`, true));
      }
      if (list.length > 12) {
        const more = document.createElement("div");
        more.className = "invempty";
        more.textContent = `…and ${list.length - 12} earlier chapters.`;
        body.appendChild(more);
      }
    }
  }
  function questDate(ts) {
    try {
      if (!ts) return "";
      const dt = new Date(ts);
      return dt.toLocaleDateString() + " " + dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }
  function renderQuestHistory(body, list, mode) {
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "invempty";
      empty.textContent = mode === "done" ? "No completed quests yet — finish one and its tale lands here." : "No abandoned quests — every trail you leave will keep its half-told tale here.";
      body.appendChild(empty);
      return;
    }
    for (const q of list) {
      const icon = mode === "done" ? "✅" : "🚫";
      const sub = `from ${q.giver ? q.giver.name : "the wilds"}${mode === "done" && q.doneAt ? " · " + questDate(q.doneAt) : ""}${mode === "abandoned" && q.abandonedAt ? " · left " + questDate(q.abandonedAt) : ""}`;
      const sec = pSec(body, `${icon} ${q.title}`, sub);
      try {
        if (q.type === "chain" && Array.isArray(q.stages)) {
          const heard = (window.Quests.storyHeardSoFar ? window.Quests.storyHeardSoFar(q) : (q.storyUpTo || q.story || q.desc || "")).slice(0, 2000);
          if (heard) sec.appendChild(questStoryEl(`📖 ${heard}`));
          const sl = document.createElement("div");
          sl.style.margin = "4px 0";
          sl.style.display = "flex";
          sl.style.flexDirection = "column";
          sl.style.gap = "3px";
          q.stages.forEach((st, i) => {
            const d = document.createElement("div");
            d.className = "tutstep";
            let doneMark = "• ";
            if (mode === "done") doneMark = "✅ ";
            else if (mode === "abandoned") doneMark = i < (q.stageIdx | 0) ? "✅ " : (i === (q.stageIdx | 0) ? "👉 (unfinished) " : "• (unheard) ");
            let label = st.type;
            try {
              if (st.type === "slay") label = `Slay ${st.need}x ${st.mobKind}${st.place ? " @ " + st.place : ""}`;
              else if (st.type === "fetch") label = `Fetch ${st.need}x ${st.itemId}${st.place ? " @ " + st.place : ""}`;
              else if (st.type === "clear") label = `Clear ${st.place || st.dungeon || "the delve"}`;
              else if (st.type === "deliver") label = `Deliver to ${st.deliverToName || (st.deliverTo && st.deliverTo.name) || "friend"}${st.place ? " @ " + st.place : ""}`;
            } catch (e) { }
            d.textContent = doneMark + `Stage ${i + 1}/${q.stages.length}: ` + label;
            sl.appendChild(d);
          });
          sec.appendChild(sl);
          if (mode === "abandoned") {
            try {
              const idx = q.stageIdx | 0;
              const prog = `Left on stage ${Math.min(q.stages.length, idx + 1)}/${q.stages.length}.`;
              sec.appendChild(pRow(`🚫 ${prog}`));
            } catch (e) { }
          }
        } else {
          let txt = "";
          try { txt = mode === "abandoned" ? ((q.storyUpTo || (window.Quests.storyHeardSoFar ? window.Quests.storyHeardSoFar(q) : q.story || q.desc)) || "") : ((window.Quests.storyHeardSoFar ? window.Quests.storyHeardSoFar(q) : q.story || q.desc) || ""); } catch (e) { txt = q.story || q.desc || ""; }
          if (txt) sec.appendChild(questStoryEl(`📖 ${String(txt).slice(0, 2000)}`));
          try {
            if (q.need > 1 && q.type !== "tutorial") {
              const hv = Math.min(q.have | 0, q.need | 0);
              sec.appendChild(pRow(mode === "abandoned" ? `🚫 Progress when left: ${hv}/${q.need | 0}` : `✅ Finished: ${hv}/${q.need | 0}`));
            } else if (mode === "abandoned" && q.type === "tutorial" && Array.isArray(q.steps)) {
              const dn = q.steps.filter(s => s.done).length;
              sec.appendChild(pRow(`🚫 Left at lesson ${dn}/${q.steps.length}`));
            }
          } catch (e) { }
        }
      } catch (e) { }
      try {
        if (q.reward) {
          const bits = [`+${q.reward.gold | 0}g`, `+${q.reward.xp | 0} XP`].concat((q.reward.items || []).map(d => {
            try { const it = window.Items.ITEMS[d.id]; return it ? `${it.name}${d.n > 1 ? "×" + d.n : ""}` : d.id; } catch (e) { return d.id; }
          }));
          sec.appendChild(pRow(`🎁 Reward: ${bits.join(" · ")}`));
        }
      } catch (e) { }
      if (q.desc) sec.appendChild(pRow(`💬 ${q.desc}`));
    }
  }
  function centerMapOn(x, y) {
    try {
      mapView = { x, y, range: 4 };
      toggleQuests(false);
      toggleMap(true);
      mapView = { x, y, range: 4 };
      drawWorldMap();
    } catch (e) { }
  }
  // chat quest offer: the AI picked the parameters, compute already validated them
  let questOffering = false;
  async function requestQuestOffer(npc, auto) {
    if (!npc || questOffering) return;
    if (!$("chatModal") || $("chatModal").hidden) return;
    const p = window.Game.G.player;
    if (!p) return;
    questOffering = true;
    try {
      const offer = await window.Quests.offerFor(npc);
      if (!$("chatModal") || $("chatModal").hidden || chatNpc !== npc) return;
      if (!offer || offer.error) {
        if (!auto) sysBubble(offer && offer.error === "full" ? "📜 Your log is full (6) — finish one first." : "📜 No work right now, traveler.");
        return;
      }
      presentQuestOffer(npc, offer);
    } finally { questOffering = false; }
  }
  function presentQuestOffer(npc, offer) {
    const log = $("chatLog"); if (!log) return;
    const d = document.createElement("div");
    d.className = "msg sys";
    d.innerHTML = `<span></span>`;
    let offerTxt = `❗ ${npc.name} offers: "${offer.title}" — ${offer.flavor}`;
    try {
      if (offer.type === "chain" && Array.isArray(offer.stages)) {
        offerTxt += ` [📜 ${offer.stages.length}-stage saga: ${offer.stages.map(s => s.type).join(" → ")}]`;
      }
    } catch (e) { }
    d.querySelector("span").textContent = offerTxt;
    log.appendChild(d);
    try {
      const story = document.createElement("div");
      story.className = "msg sys";
      story.innerHTML = `<span></span>`;
      let stxt = offer.story ? `📖 ${offer.story}` : "";
      if (offer.type === "chain" && Array.isArray(offer.stages)) {
        const chaps = offer.stages.map((s, i) => s.story ? `Stage ${i + 1}: ${s.story}` : "").filter(Boolean);
        if (chaps.length) stxt += (stxt ? " " : "") + chaps.join(" ");
      }
      if (stxt) {
        story.querySelector("span").textContent = stxt.slice(0, 900);
        log.appendChild(story);
      }
    } catch (e) { }
    const row = document.createElement("div");
    row.style.display = "flex"; row.style.gap = "6px"; row.style.margin = "4px 0 8px 0";
    const ok = document.createElement("button");
    ok.textContent = "✅ Accept quest";
    const no = document.createElement("button");
    no.textContent = "Decline";
    no.className = "ghost";
    ok.onclick = async () => {
      ok.disabled = true; no.disabled = true;
      const q = await window.Quests.acceptOffer(offer, npc);
      sysBubble(q ? `📜 Quest accepted: ${q.title} — ${window.Quests.objectiveText(q)} (see 📜 Quests, J)` : "📜 The moment passes.");
      renderChatHead(); updateHUD();
    };
    no.onclick = () => {
      ok.disabled = true; no.disabled = true;
      sysBubble("You decline politely. Perhaps another road, another day.");
    };
    row.appendChild(ok); row.appendChild(no);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    try { window.Sfx.talk(); } catch (e) { }
  }
  let lastOfferAt = 0;
  function maybeAutoOffer(npc) {
    try {
      if (!npc || npc.hp <= 0) return;
      if (Date.now() - lastOfferAt < 20000) return;
      const p = window.Game.G.player;
      if (!p) return;
      if (window.Quests.active(p).length >= window.Quests.MAX_ACTIVE) return;
      const chance = 0.30 + Math.min(0.25, ((npc.loyalty || 0) / 400));
      if (Math.random() > chance) return;
      lastOfferAt = Date.now();
      setTimeout(() => { try { if (chatNpc === npc) requestQuestOffer(npc, true); } catch (e) { } }, 2500);
    } catch (e) { }
  }

  return {
    boot, toast, toggleNotifLog, showLoot, setDreaming, updateHUD, updateHotbar, updateInteractHint, drawMinimap,
    openChat, closeChat, isModalOpen, toggleMap, toggleParty, selectPartyTab, toggleInv, toggleChar, toggleProfile,
    openPortal, closePortal, openDungeonEntry, openStairs, openDungeonTravel, closeDungeonTravel, openHearthTravel, closeHearthTravel, teleportToHearth, visitedHearths, refreshHearthList,
    onEscape, toggleMenu, quitToTitle, loadSlotFlow, renderTitleSlots, renderMenuSlots, togglePractice,
    exportSlotToFile, importSlotFromFile,
    showDeath, renderInv, renderChar, mapPan, mapZoom, mapRecenter, wanderDream,
    toggleTrade, renderTrade, handleTradeText, showLevelUp, showQuestBanner, hideQuestBanner, showTechBanner, hideTechBanner,
    renderProfile, updateProfileHud,
    applyTouchControls, touchDevice,
    toggleQuests, renderQuests, requestQuestOffer,
    openStable, closeStable, renderStable,
    openInn, closeInn, renderInn,
    openGuild, closeGuild, renderGuild,
    openBeastLodge, openBestiary: openBeastLodge,
    openLore, closeLore,
    maybeOfferTutorial, showTutorialReward,
    clearTutGuide, refreshTutGuide,
    tutorialPromptsEnabled, setTutorialPromptsEnabled,
    renderMpChat, renderMpPresence, joinChannelFlow, createChannelFlow, hostGameFlow, joinGameFlow, copyWorldLink,
    renderMpWorlds, renderMpSaves, hostCreatedFlow, rejoinVisitedFlow, serverSettingsFlow,
    openPlayerTrade, closePlayerTrade, renderPlayerTrade, onTradeGive, renderAllyState,
    masteryDesc,
  };
})();
