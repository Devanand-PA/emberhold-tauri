/* Races: active racial abilities. window.Races
   Human      Collective Immunity — every 10s, 50% to cleanse ALL statuses from you + nearby allied players and give them to a nearby foe
   Werewolf   Blood Fury — below 50% HP: +30% move speed, stamina regen, ATK
   Grenouille Bog Hunter — +25% dmg vs slowed; spell hits on slowed foes grant +30% speed for 3s
   Kinnatma   Spirit Mend — every 3s, separate 50% rolls to restore 10% HP + stamina + mana
   Quansalbar Shellblitz — unarmed attacks strike 2x as fast, ignoring the speed floor
   Usaghito   Lucky Chorus — nearby party/tames/allied players share your Luck bonuses (max, no stack)
              + Charm voice: +1 ATK/DEF/SDEF/MATK per point of your Charm (max, tracked separately; also buffs yourself)
   Player-only except Usaghito aura (allies benefit). Tunables live here so balance edits are one file. */
window.Races = (() => {
  const HUMAN_INTERVAL = 10000, HUMAN_CHANCE = 0.5, HUMAN_RANGE = 8;
  const KINNA_INTERVAL = 3000, KINNA_CHANCE = 0.5, KINNA_FRAC = 0.10;
  const GRENOUILLE_SLOWED_MULT = 1.25;
  const GRENOUILLE_HASTE_MULT = 1.30, GRENOUILLE_HASTE_MS = 3000;
  const WEREWOLF_MULT = 1.3;
  const AURA_RANGE = 10;

  function raceOf(ent) {
    try {
      if (ent && ent.appearance && typeof ent.appearance.race === "string") return ent.appearance.race;
      if (ent && typeof ent.race === "string") return ent.race;
    } catch (e) {}
    return "human";
  }
  function isRace(ent, r) { return raceOf(ent) === r; }
  function playerRace() {
    try {
      const G = window.Game && window.Game.G;
      if (G && G.player) return raceOf(G.player);
    } catch (e) {}
    return "human";
  }
  function heroPlayer(ent) {
    try {
      const G = window.Game && window.Game.G;
      return !!(G && G.player && ent === G.player);
    } catch (e) { return ent && ent.kind === "player"; }
  }
  // ---------- werewolf ----------
  function werewolfFuryActive(ent) {
    try {
      if (!ent || ent.hp <= 0) return false;
      if (raceOf(ent) !== "werewolf") return false;
      if (!(ent.maxHp > 0)) return false;
      return ent.hp < ent.maxHp * 0.5;
    } catch (e) { return false; }
  }
  // ---------- grenouille ----------
  function isSlowed(ent) {
    try { return performance.now() < (ent.slowUntil || 0); } catch (e) { return false; }
  }
  function isSpellHit(opts) {
    try {
      if (!opts) return false;
      if (opts.magic) return true;
      if (opts.fam === "spell") return true;
      if (typeof opts.move === "string" && opts.move) {
        const ab = (window.CFG && window.CFG.ABILITIES && window.CFG.ABILITIES[opts.move]) || null;
        if (ab && ab.kind !== "technique" && ab.kind !== "melee") return true;
      }
      return false;
    } catch (e) { return false; }
  }
  function grenouilleDmgMult(src, tgt) {
    try {
      if (!src || !tgt) return 1;
      if (!heroPlayer(src)) return 1;
      if (raceOf(src) !== "grenouille") return 1;
      if (!isSlowed(tgt)) return 1;
      return GRENOUILLE_SLOWED_MULT;
    } catch (e) { return 1; }
  }
  function grenouilleHasteMult(ent) {
    try {
      if (raceOf(ent) !== "grenouille") return 1;
      if (performance.now() < (ent._grenouilleSpdUntil || 0)) return GRENOUILLE_HASTE_MULT;
      return 1;
    } catch (e) { return 1; }
  }
  function noteGrenouilleHit(src, tgt, opts) {
    try {
      if (!src || !tgt || tgt.hp <= 0) return;
      if (!heroPlayer(src)) return;
      if (raceOf(src) !== "grenouille") return;
      if (!isSpellHit(opts)) return;
      // the victim must already be slowed — the snare you just applied doesn't count
      if (!isSlowed(tgt)) return;
      src._grenouilleSpdUntil = performance.now() + GRENOUILLE_HASTE_MS;
    } catch (e) {}
  }
  // ---------- quansalbar ----------
  function wieldedUnarmed(ent) {
    try {
      if (window.Entities && window.Entities.wieldedFamily) return window.Entities.wieldedFamily(ent) === "unarmed";
      return !!(ent && ent.equipment && !ent.equipment.weapon);
    } catch (e) { return false; }
  }
  function quansalbarUnarmed(ent) {
    try {
      if (!ent) return false;
      if (raceOf(ent) !== "quansalbar") return false;
      return wieldedUnarmed(ent);
    } catch (e) { return false; }
  }
  // unarmed swing interval multiplier (0.5 = double speed)
  function unarmedSpeedMult(ent) {
    try { return quansalbarUnarmed(ent) ? 0.5 : 1; } catch (e) { return 1; }
  }
  // ---------- usaghito luck chorus ----------
  // Luck counts points OVER 5 (so a 5-Luck hero lends nothing). Remote heroes
  // sync flat luk/cha on the pos channel (see multiplayer sendPos), so their
  // voices work too — old senders omit them and simply lend nothing.
  function lukOverOf(ent) {
    try {
      let raw = null;
      try { if (ent && ent.stats && isFinite(+ent.stats.luk)) raw = +ent.stats.luk; } catch (e) {}
      if (raw == null) { try { if (ent && isFinite(+ent.luk)) raw = +ent.luk; } catch (e) {} }
      if (raw == null) return 0;
      return Math.max(0, (raw | 0) - 5);
    } catch (e) { return 0; }
  }
  function dist(a, b) {
    try {
      const ax = a.x ?? a.gx, ay = a.y ?? a.gy, bx = b.x ?? b.gx, by = b.y ?? b.gy;
      if (ax == null || bx == null) return 1e9;
      return Math.hypot(ax - bx, ay - by);
    } catch (e) { return 1e9; }
  }
  // max Luck-over among nearby usaghito heroes sharing your cause (no stacking)
  function auraLukOver(ent) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !ent || ent.hp <= 0) return 0;
      let best = 0;
      const consider = (src) => {
        try {
          if (!src || src === ent || !(src.hp > 0)) return;
          if (raceOf(src) !== "usaghito") return;
          // must be an ally worth singing to
          let allied = false;
          try {
            if (window.Game && window.Game.isAlly) allied = window.Game.isAlly(src, ent);
            else allied = (src === G.player || src.inParty || src.isTame);
          } catch (e2) { allied = false; }
          if (!allied) return;
          if (dist(src, ent) > AURA_RANGE) return;
          const v = lukOverOf(src);
          if (v > best) best = v;
        } catch (e) {}
      };
      if (G.player) consider(G.player);
      for (const n of (G.npcs || [])) {
        if (!n || !(n.hp > 0)) continue;
        if (!n.inParty) continue;
        consider(n);
      }
      // allied players on other machines sing too
      try {
        if (window.MP && window.MP.getRemotes) {
          for (const r of (window.MP.getRemotes() || [])) {
            if (!r || !(r.hp > 0)) continue;
            // remote views carry race on appearance or .race
            let rc = null;
            try { rc = (r.appearance && r.appearance.race) || r.race || null; } catch (e) {}
            if (rc !== "usaghito") continue;
            let allied = false;
            try { allied = window.Game.isAlly(r, ent); } catch (e) { allied = true; }
            if (!allied) continue;
            if (dist(r, ent) > AURA_RANGE) continue;
            const v = lukOverOf(r);
            if (v > best) best = v;
          }
        }
      } catch (e) {}
      return best;
    } catch (e) { return 0; }
  }
  // effective Luck-over-5 for crit/dodge math: own + chorus (max, never stacked)
  function effectiveLukOver(ent) {
    try {
      if (!ent) return 0;
      const own = (ent.kind === "player") ? lukOverOf(ent) : 0;
      // player-shaped allies (party NPCs, tames) have no own Luck — the chorus IS their Luck
      if (ent.kind !== "player") {
        // party members that ARE usaghito sing with their own voice too
        let self = 0;
        try { if (raceOf(ent) === "usaghito" && ent.stats) self = lukOverOf(ent); } catch (e) {}
        return Math.max(self, auraLukOver(ent));
      }
      return Math.max(own, auraLukOver(ent));
    } catch (e) { return 0; }
  }
  function effectiveCritChance(ent) {
    try {
      const over = effectiveLukOver(ent);
      // allies only crit while the chorus reaches them
      if (ent.kind !== "player" && !(over > 0)) return 0;
      return Math.max(0, 0.05 + over * 0.02);
    } catch (e) { return 0; }
  }
  function effectiveCritMult(ent) {
    try {
      const over = effectiveLukOver(ent);
      if (ent.kind !== "player" && !(over > 0)) return 1.8;
      return Math.max(1.2, 1.8 + over * 0.10);
    } catch (e) { return 1.8; }
  }
  function effectiveDodge(ent) {
    try {
      const over = effectiveLukOver(ent);
      if (ent.kind !== "player" && !(over > 0)) return 0;
      return Math.min(0.95, Math.max(0, over * 0.005));
    } catch (e) { return 0; }
  }
  // ---------- usaghito charm voice (sibling of the luck chorus) ----------
  // +1 ATK/DEF/SDEF/MATK per point of the singer's TOTAL Charm (not over-5).
  // Only the highest singer counts — never stacked. Luck and Charm are tracked
  // separately, so a max-Charm singer and a max-Luck singer can both lend at
  // once. Reaches the same ears as Luck (party/tames/allied players) plus the
  // singer's own self (a solo usaghito still buffs itself with its own voice).
  function chaValueOf(ent) {
    try {
      if (!ent) return 0;
      if (ent.stats && isFinite(+ent.stats.cha)) return Math.max(0, (+ent.stats.cha) | 0);
      if (isFinite(+ent.cha)) return Math.max(0, (+ent.cha) | 0);
      return 0;
    } catch (e) { return 0; }
  }
  // max total-Charm among nearby allied usaghito singers (no stacking)
  function auraChaBonus(ent) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !ent || !(ent.hp > 0)) return 0;
      let best = 0;
      const consider = (src) => {
        try {
          if (!src || src === ent || !(src.hp > 0)) return;
          if (raceOf(src) !== "usaghito") return;
          // must be an ally worth singing to
          let allied = false;
          try {
            if (window.Game && window.Game.isAlly) allied = window.Game.isAlly(src, ent);
            else allied = (src === G.player || src.inParty || src.isTame);
          } catch (e2) { allied = false; }
          if (!allied) return;
          if (dist(src, ent) > AURA_RANGE) return;
          const v = chaValueOf(src);
          if (v > best) best = v;
        } catch (e) {}
      };
      if (G.player) consider(G.player);
      for (const n of (G.npcs || [])) {
        if (!n || !(n.hp > 0)) continue;
        if (!n.inParty) continue;
        consider(n);
      }
      // allied players on other machines sing too
      try {
        if (window.MP && window.MP.getRemotes) {
          for (const r of (window.MP.getRemotes() || [])) {
            if (!r || !(r.hp > 0)) continue;
            // remote views carry race on appearance or .race
            let rc = null;
            try { rc = (r.appearance && r.appearance.race) || r.race || null; } catch (e) {}
            if (rc !== "usaghito") continue;
            let allied = false;
            try { allied = window.Game.isAlly(r, ent); } catch (e) { allied = true; }
            if (!allied) continue;
            if (dist(r, ent) > AURA_RANGE) continue;
            const v = chaValueOf(r);
            if (v > best) best = v;
          }
        }
      } catch (e) {}
      return best;
    } catch (e) { return 0; }
  }
  // effective Charm voice for combat stats: own (usaghito only) vs chorus max.
  // Non-usaghito have no voice of their own — the chorus is all they get.
  function effectiveChaBonus(ent) {
    try {
      if (!ent) return 0;
      const aura = auraChaBonus(ent) || 0;
      let own = 0;
      try { if (raceOf(ent) === "usaghito") own = chaValueOf(ent) || 0; } catch (e) { own = 0; }
      return Math.max(own, aura);
    } catch (e) { return 0; }
  }
  // ---------- human cleanse + kinnatma mend (periodic, driven by tickPlayer) ----------
  function statusEntries(ent) {
    const out = [];
    try {
      if (window.Status && window.Status.list) {
        for (const t of (window.Status.list(ent) || [])) out.push(t);
      }
      if (performance.now() < (ent.slowUntil || 0)) out.push("slow");
    } catch (e) {}
    return out;
  }
  function nearestFoe(ent, range) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !ent) return null;
      let fighters = null;
      try { fighters = window.Game.allFighters ? window.Game.allFighters() : null; } catch (e) { fighters = null; }
      if (!fighters) {
        fighters = [];
        if (G.player) fighters.push(G.player);
        for (const n of (G.npcs || [])) fighters.push(n);
        for (const m of (G.mobs || [])) fighters.push(m);
      }
      let best = null, bd = range || HUMAN_RANGE;
      for (const f of fighters) {
        try {
          if (!f || f === ent || !(f.hp > 0)) continue;
          let foe = false;
          try {
            if (window.Game && window.Game.isAlly) foe = !window.Game.isAlly(ent, f);
            else foe = (f.role === "mob" && !f.isTame && !f.inParty);
          } catch (e2) { foe = false; }
          if (!foe) continue;
          const d = dist(ent, f);
          if (d <= bd) { bd = d; best = f; }
        } catch (e) {}
      }
      return best;
    } catch (e) { return null; }
  }
  function toast(msg, ms) { try { if (window.UI && window.UI.toast) window.UI.toast(msg, ms || 2600); } catch (e) {} }
  // Allies that share Collective Immunity: anything on the hero's team within
  // range — local party/tames/clones plus allied multiplayer heroes. Enemies
  // never pass the isAlly gate, so this is just "friends near me".
  function nearbyAllies(ent, range) {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !ent) return [];
      let pool = null;
      try { pool = window.Game.allFighters ? window.Game.allFighters() : null; } catch (e) { pool = null; }
      if (!pool || !pool.length) {
        pool = [];
        if (G.player) pool.push(G.player);
        for (const n of (G.npcs || [])) pool.push(n);
        for (const m of (G.mobs || [])) pool.push(m);
      }
      // remote hero views are rebuilt every call on some paths — include them
      // explicitly so allied players are never missed.
      try {
        if (window.MP && window.MP.getRemotes) {
          for (const r of (window.MP.getRemotes() || [])) {
            if (r && pool.indexOf(r) < 0) pool.push(r);
          }
        }
      } catch (e) {}
      const out = [];
      for (const f of pool) {
        try {
          if (!f || f === ent || !(f.hp > 0)) continue;
          let allied = false;
          try {
            if (window.Game && window.Game.isAlly) allied = !!window.Game.isAlly(ent, f);
            else allied = (f === G.player || !!(f.inParty || f.isTame || f.isShadowClone));
          } catch (e2) { allied = false; }
          if (!allied) continue;
          if (dist(ent, f) > range) continue;
          out.push(f);
        } catch (e) {}
      }
      return out;
    } catch (e) { return []; }
  }
  // Push one cleansed status onto the foe, preserving the strongest remaining
  // duration seen across the cleansed group. Returns true if it stuck.
  function transferStatusToFoe(foe, pick, srcCopy, now, sid, snm) {
    try {
      if (!foe || foe.hp <= 0) return false;
      if (pick === "slow") {
        const remain = Math.max(800, Math.min(4000, (srcCopy && srcCopy.until ? srcCopy.until - now : 2500)));
        if (window.Status && window.Status.applySlow) return !!window.Status.applySlow(foe, remain, sid, snm);
        foe.slowUntil = performance.now() + remain;
        foe.slowFactor = srcCopy && srcCopy.factor ? srcCopy.factor : 0.5;
        return true;
      }
      if (!window.Status) return false;
      const o = srcCopy || {};
      const remainMs = Math.max(800, (o.until ? o.until - now : 8000));
      const base = { srcName: snm, srcId: sid };
      if (pick === "poison") return !!window.Status.apply(foe, "poison", Object.assign({}, base, { pct: o.pct || 0.03, durationMs: remainMs, potency: 1 }));
      if (pick === "bleed") return !!window.Status.apply(foe, "bleed", Object.assign({}, base, { pct: o.pct || 0.025, durationMs: remainMs, potency: 1 }));
      if (pick === "burn") return !!window.Status.apply(foe, "burn", Object.assign({}, base, { dps: o.dps || 4, defDown: o.defDown || 2, durationMs: remainMs, potency: 1 }));
      if (pick === "freeze") return !!window.Status.apply(foe, "freeze", Object.assign({}, base, { duration: Math.max(0.8, remainMs / 1000), potency: 1 }));
      if (pick === "stun") return !!window.Status.apply(foe, "stun", Object.assign({}, base, { duration: Math.max(0.8, remainMs / 1000), potency: 1 }));
      if (pick === "paralyze") return !!window.Status.apply(foe, "paralyze", Object.assign({}, base, { durationMs: remainMs, agiDown: o.agiDown || 3, strDown: o.strDown || 3 }));
      if (pick === "blind") return !!window.Status.apply(foe, "blind", Object.assign({}, base, { durationMs: remainMs, miss: o.miss, sight: o.sight }));
      if (pick === "sunder") return !!window.Status.apply(foe, "sunder", Object.assign({}, base, { durationMs: remainMs, defDown: o.defDown || 3 }));
    } catch (e) {}
    return false;
  }
  function floatText(ent, txt, color) {
    try {
      const G = window.Game && window.Game.G;
      if (G && ent) {
        const x = ent.x ?? ent.gx, y = ent.y ?? ent.gy;
        if (x != null && window.Game && window.Game.addDmgNum) window.Game.addDmgNum(x, y - 0.8, txt, color || "#fff");
      }
    } catch (e) {}
  }
  function puff(ent, color, n) {
    try {
      if (window.Game && window.Game.addParticles && ent) {
        const x = ent.x ?? ent.gx, y = ent.y ?? ent.gy;
        if (x != null) window.Game.addParticles(x, y, color || "#fff", n || 8);
      }
    } catch (e) {}
  }
  function humanTick(p, now) {
    try {
      if (!p || p.hp <= 0) { p._raceHumanAt = now + HUMAN_INTERVAL; return; }
      if (raceOf(p) !== "human") return;
      if ((p._raceHumanAt || 0) > now) return;
      p._raceHumanAt = now + HUMAN_INTERVAL;
      if (Math.random() >= HUMAN_CHANCE) return;
      // Collective Immunity: cleanse EVERYTHING from you + every nearby ally,
      // then hand the whole bundle to one nearby enemy.
      const allies = nearbyAllies(p, HUMAN_RANGE);
      const targets = [p];
      for (const a of allies) if (a && targets.indexOf(a) < 0) targets.push(a);
      // snapshot the strongest copy of each status type across the group
      const collected = new Map(); // type -> srcCopy
      for (const t of targets) {
        let have = null;
        try { have = statusEntries(t); } catch (e) { have = null; }
        if (!have || !have.length) continue;
        for (const type of have) {
          let copy = null;
          try {
            if (type === "slow") copy = { type: "slow", until: t.slowUntil, factor: t.slowFactor };
            else if (t.status && t.status[type]) copy = Object.assign({}, t.status[type]);
          } catch (e) { copy = null; }
          if (!copy) copy = {};
          const prev = collected.get(type);
          if (!prev) { collected.set(type, copy); continue; }
          // keep the copy with the longest remaining time so the transfer
          // carries the worst case, not the first one we happened to see
          try {
            const aUntil = copy.until || 0, bUntil = prev.until || 0;
            if (aUntil > bUntil) collected.set(type, copy);
          } catch (e) {}
        }
      }
      if (!collected.size) return;
      let heroHad = false;
      try { heroHad = statusEntries(p).length > 0; } catch (e) { heroHad = false; }
      // cleanse first (the transfer never fails the cleanse)
      let cleansedAllies = 0;
      for (const t of targets) {
        try {
          let had = false;
          if (performance.now() < (t.slowUntil || 0)) { t.slowUntil = 0; try { delete t.slowFactor; } catch (e) {} had = true; }
          if (window.Status && t.status) {
            let lst = null;
            try { lst = window.Status.list(t) || []; } catch (e) { lst = null; }
            if (lst && lst.length) { try { if (window.Status.cure(t, lst)) had = true; } catch (e) {} }
          }
          if (t !== p && had) cleansedAllies++;
        } catch (e) {}
      }
      const picks = [...collected.keys()];
      const listTxt = picks.join(", ");
      // "from you + 2 allies" vs "from you" vs "from 2 allies" (you were clean)
      let fromTxt = "from you";
      if (heroHad && cleansedAllies > 0) fromTxt = `from you + ${cleansedAllies} ${cleansedAllies === 1 ? "ally" : "allies"}`;
      else if (!heroHad && cleansedAllies > 0) fromTxt = `from ${cleansedAllies} ${cleansedAllies === 1 ? "ally" : "allies"}`;
      // leave a buff-style chip in the profile card so the proc is visible
      try { p._raceHumanFlash = { until: performance.now() + 3500, label: listTxt, allies: cleansedAllies }; } catch (e) {}
      const foe = nearestFoe(p, HUMAN_RANGE);
      const meta = { poison: "🤢", burn: "🔥", freeze: "❄️", paralyze: "⚡", blind: "🌀", bleed: "🩸", sunder: "💔", stun: "💫", slow: "🐌" };
      if (!foe) {
        toast(`🧑 Collective Immunity cleansed ${listTxt} ${fromTxt} (no foe nearby).`);
        puff(p, "#5dd68a", 8);
        for (const t of targets) if (t !== p) puff(t, "#5dd68a", 6);
        return;
      }
      const sid = "player", snm = p.name || "Hero";
      const passed = [];
      for (const pick of picks) {
        try {
          if (transferStatusToFoe(foe, pick, collected.get(pick), now, sid, snm)) passed.push(pick);
        } catch (e) {}
      }
      const foeNm = (foe && (foe.name || foe.kind)) || "foe";
      if (passed.length) toast(`🧑 Collective Immunity: cleansed ${listTxt} ${fromTxt}, passed ${passed.join(", ")} to ${foeNm}!`);
      else toast(`🧑 Collective Immunity: cleansed ${listTxt} ${fromTxt} (${foeNm} resisted).`);
      floatText(p, `${meta[picks[0]] || "✨"} cleansed!`, "#5dd68a");
      for (const t of targets) if (t !== p) puff(t, "#5dd68a", 6);
      floatText(foe, `${passed.map(k => meta[k] || "☠️").join("")} ${passed.length ? passed.join("+") : picks.join("+")}!`, "#ff8aa0");
      puff(p, "#5dd68a", 8); puff(foe, "#ff8aa0", 8);
    } catch (e) {}
  }
  function kinnaTick(p, now) {
    try {
      if (!p || p.hp <= 0) { p._raceKinnaAt = now + KINNA_INTERVAL; return; }
      if (raceOf(p) !== "kinnatma") return;
      if ((p._raceKinnaAt || 0) > now) return;
      p._raceKinnaAt = now + KINNA_INTERVAL;
      // Independent 50% roll per pool, so at least one usually lands (~7/8
      // when all three are missing) instead of one all-or-nothing flip.
      const hpGain = Math.max(1, Math.round((p.maxHp || 1) * KINNA_FRAC));
      const mpGain = Math.max(1, Math.round((p.maxMp || 0) * KINNA_FRAC));
      const stGain = Math.max(1, Math.round((p.maxStamina || 0) * KINNA_FRAC));
      const needHp = (p.hp || 0) < (p.maxHp || 0), needMp = (p.mp || 0) < (p.maxMp || 0),
        needSt = (p.stamina || 0) < (p.maxStamina || 0);
      if (!needHp && !needMp && !needSt) return;
      let gotHp = false, gotMp = false, gotSt = false;
      if (needHp && Math.random() < KINNA_CHANCE) { p.hp = Math.min(p.maxHp, (p.hp || 0) + hpGain); gotHp = true; }
      if (needSt && Math.random() < KINNA_CHANCE) { p.stamina = Math.min(p.maxStamina || 0, (p.stamina || 0) + stGain); gotSt = true; }
      if (needMp && Math.random() < KINNA_CHANCE) { p.mp = Math.min(p.maxMp || 0, (p.mp || 0) + mpGain); gotMp = true; }
      if (!gotHp && !gotMp && !gotSt) return;
      // leave a buff-style chip in the profile card so the proc is visible
      try { p._raceKinnaFlash = { until: performance.now() + 3500, hp: gotHp ? hpGain : 0, mp: gotMp ? mpGain : 0, st: gotSt ? stGain : 0 }; } catch (e) {}
      const mparts = [];
      if (gotHp) mparts.push(`+${hpGain} HP`);
      if (gotSt) mparts.push(`+${stGain} Stamina`);
      if (gotMp) mparts.push(`+${mpGain} MP`);
      floatText(p, mparts.join(" ") + " 🦅", "#7ddf6b");
      puff(p, "#7ddf6b", 6);
    } catch (e) {}
  }
  function tickPlayer(p) {
    try {
      if (!p || p.hp <= 0) return;
      const now = performance.now();
      if ((p._raceHumanAt || 0) === 0) p._raceHumanAt = now + HUMAN_INTERVAL;
      if ((p._raceKinnaAt || 0) === 0) p._raceKinnaAt = now + KINNA_INTERVAL;
      humanTick(p, now);
      kinnaTick(p, now);
    } catch (e) {}
  }
  // Momentary proc indicators for the HUD profile card: humanTick/kinnaTick
  // stamp a flash on the player, and this turns it into buff-style chips
  // (green, alongside the red status chips) with a short countdown. The
  // painter (UI.effectsFor) formats `until` into secs — it stays dumb here.
  function flashChips(ent) {
    const out = [];
    try {
      if (!ent || !(ent.hp > 0)) return out;
      const now = performance.now();
      const hf = ent._raceHumanFlash;
      if (hf && hf.until > now) {
        const allyTxt = (hf.allies | 0) > 0 ? ` + ${hf.allies | 0} ${((hf.allies | 0) === 1) ? "ally" : "allies"}` : "";
        out.push({ kind: "buff", fx: "race:immunity", name: "🧑 Collective Immunity",
          sub: `cleansed ${hf.label || "a status"}${allyTxt}`, until: hf.until });
      }
      const kf = ent._raceKinnaFlash;
      if (kf && kf.until > now) {
        const bits = [];
        if (kf.hp > 0) bits.push(`+${kf.hp} HP`);
        if (kf.st > 0) bits.push(`+${kf.st} Stamina`);
        if (kf.mp > 0) bits.push(`+${kf.mp} MP`);
        out.push({ kind: "buff", fx: "race:mend", name: "🦅 Spirit Mend",
          sub: bits.length ? bits.join(" ") + " restored" : "restored HP and mana", until: kf.until });
      }
    } catch (e) {}
    return out;
  }
  return {
    HUMAN_INTERVAL, HUMAN_CHANCE, HUMAN_RANGE, KINNA_INTERVAL, KINNA_CHANCE, KINNA_FRAC,
    GRENOUILLE_SLOWED_MULT, GRENOUILLE_HASTE_MULT, GRENOUILLE_HASTE_MS, WEREWOLF_MULT, AURA_RANGE,
    raceOf, isRace, playerRace, werewolfFuryActive, isSlowed, grenouilleDmgMult, grenouilleHasteMult,
    noteGrenouilleHit, quansalbarUnarmed, unarmedSpeedMult, lukOverOf, auraLukOver, effectiveLukOver,
    effectiveCritChance, effectiveCritMult, effectiveDodge, chaValueOf, auraChaBonus, effectiveChaBonus, tickPlayer, nearestFoe, nearbyAllies, flashChips,
  };
})();
