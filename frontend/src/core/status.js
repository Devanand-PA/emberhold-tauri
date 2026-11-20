/* Status effects: poison, burn, freeze, paralyze, blind, bleed, sunder, stun. window.Status
   - Applied by weapons/spells/arrows with a potency scalar (spell power / weapon tier).
   - poison: % of max HP per second until cured (long timeout as fallback).
   - burn: flat dmg/sec + lowers endurance (DEF down) until cured.
   - freeze: cannot move/attack for duration.
   - paralyze: lowers AGI + STR until cured (slower, weaker, easier to hit).
   - blind: short sight — cannot notice/follow targets beyond a few tiles (until cured)
     + a small chance for its hits to miss outright (see BLIND_MISS).
   All live on ent.status = {poison:{...}, burn:{...}, ...}. Cures remove entries.
*/
window.Status = (() => {
  const TYPES = ["poison", "burn", "freeze", "paralyze", "blind", "bleed", "sunder", "stun"];
  const LONG = 45000; // fallback expiry for "until healed" effects (ms)
  // Blinded attackers miss outright this often (applies to every direct hit
  // routed through dealDamage — melee, bows, thrown arms, spells, techniques;
  // status ticks never miss). Kept as a named export so tuning is one number.
  const BLIND_MISS = 0.2;

  function ensure(ent) {
    if (!ent) return null;
    if (!ent.status || typeof ent.status !== "object") ent.status = {};
    return ent.status;
  }
  function has(ent, type) {
    try { return !!(ent && ent.status && ent.status[type]); } catch (e) { return false; }
  }
  function list(ent) {
    try {
      if (!ent || !ent.status) return [];
      return TYPES.filter(t => !!ent.status[t]);
    } catch (e) { return []; }
  }
  function describe(ent) {
    const out = list(ent);
    if (!out.length) return "";
    return out.map(t => {
      try {
        const meta = (window.CFG && window.CFG.STATUS && window.CFG.STATUS[t]) || { name: t, icon: "❔" };
        return `${meta.name}`;
      } catch (e) { return t; }
    }).join(" · ");
  }
  // srcId credits the attacker when a tick lands the killing blow ("player" or an
  // entity id; resolved lazily by tick via window.Game). Stored as a plain string
  // so saved entities stay serializable.
  function srcIdOf(caster) {
    try {
      const G = window.Game && window.Game.G;
      if (G && caster === G.player) return "player";
      if (caster && caster.id) return caster.id;
    } catch (e) { }
    return null;
  }
  function srcFor(s) {
    try {
      if (!s || !s.srcId) return null;
      const G = window.Game && window.Game.G;
      if (!G) return null;
      if (s.srcId === "player") return (G.player && G.player.hp > 0) ? G.player : null;
      for (const n of (G.npcs || [])) if (n && n.id === s.srcId && n.hp > 0) return n;
      for (const m of (G.mobs || [])) if (m && m.id === s.srcId && m.hp > 0) return m;
    } catch (e) { }
    return null;
  }
  // potency scales with spell power / weapon strength. potency >= 1 typical.
  // Player-caused afflictions ride the Afflictions trees (status_*): potency
  // sharpens the ailment, lingering stretches it, apex masters it. Every
  // successful player affliction credits that ailment's tree (12 = 1 point).
  // Warlords and apex ancients shrug off %HP venoms (else one dagger hit
  // melts any boss: pct × maxHp × 45-90s). Versus bulky targets poison and
  // bleed tick at most 1% of max HP per second and burn out after ~12s
  // (+Lingering). Flat burn DPS is unaffected. Bosses also cleanse when able.
  const BOSS_DOT_PCT = 0.01, BOSS_DOT_BASE_MS = 12000;
  function isBulky(ent) {
    try {
      if (!ent) return false;
      if (ent.isBoss || ent.boss) return true;
      const C = window.CFG || {};
      if (ent.kind) {
        if (Array.isArray(C.BOSS_KINDS) && C.BOSS_KINDS.indexOf(ent.kind) >= 0) return true;
        if (Array.isArray(C.HELL_BOSS_KINDS) && C.HELL_BOSS_KINDS.indexOf(ent.kind) >= 0) return true;
        if (Array.isArray(C.ANCIENT_KINDS) && C.ANCIENT_KINDS.indexOf(ent.kind) >= 0) return true;
        if (C.APEX_BULK && C.APEX_BULK[ent.kind]) return true;
        try { if (window.Entities && window.Entities.isApexTameKind && window.Entities.isApexTameKind(ent.kind)) return true; } catch (e2) { }
      }
    } catch (e) { }
    return false;
  }
  function playerForSrc(srcId) {
    try {
      if (srcId !== "player") return null;
      const G = window.Game && window.Game.G;
      return (G && G.player && G.player.hp > 0) ? G.player : ((G && G.player) || null);
    } catch (e) { return null; }
  }
  function creditStatus(P, type) {
    try { if (P && window.Entities && window.Entities.noteTreeUse) window.Entities.noteTreeUse(P, "status_" + type); } catch (e) { }
  }
  function applySlow(target, ms, srcId, srcName) {
    try {
      if (!target || target.hp <= 0) return false;
      try { if (target._statusImmune || target._goddessMock) return false; } catch (e) {}
      const now = performance.now();
      const P = playerForSrc(srcId);
      if (P) {
        let m = 1;
        try { m = window.Entities.slowDurationMult ? window.Entities.slowDurationMult(P) : 1; } catch (e) { m = 1; }
        let f = 0.5;
        try { f = window.Entities.slowFactorFor ? window.Entities.slowFactorFor(P, target) : 0.5; } catch (e) { }
        const until = now + Math.max(500, (ms || 2500) * m);
        try {
          target.slowUntil = Math.max(target.slowUntil || 0, until);
          if (!(target.slowFactor > 0)) target.slowFactor = f;
          else target.slowFactor = Math.min(target.slowFactor, f);
        } catch (e) { target.slowUntil = until; target.slowFactor = f; }
        creditStatus(P, "slow");
        return true;
      }
      const until = now + Math.max(500, ms || 2500);
      try {
        target.slowUntil = Math.max(target.slowUntil || 0, until);
        target.slowFactor = (target && target.kind === "player") ? 0.6 : 0.5;
      } catch (e) { }
      return true;
    } catch (e) { return false; }
  }
  function apply(ent, type, opts = {}) {
    if (!ent || ent.hp <= 0) return false;
    try { if (ent._statusImmune || ent._goddessMock) return false; } catch (e) {}
    if (!TYPES.includes(type)) return false;
    ensure(ent);
    const now = performance.now();
    const potency = Math.max(0.5, Number(opts.potency) || 1);
    const P = playerForSrc(opts.srcId);
    let potMult = 1, durMult = 1, apex = false;
    try {
      if (P && window.Entities) {
        potMult = window.Entities.statusPotencyMult ? window.Entities.statusPotencyMult(P, type) : 1;
        durMult = window.Entities.statusDurationMult ? window.Entities.statusDurationMult(P, type) : 1;
        apex = window.Entities.statusHasApex ? window.Entities.statusHasApex(P, type) : false;
      }
    } catch (e) { }
    if (type === "poison") {
      let until = now + (opts.durationMs || LONG) * durMult;
      try { if (isBulky(ent)) until = Math.min(until, now + BOSS_DOT_BASE_MS * durMult); } catch (e) { }
      ent.status.poison = {
        until,
        tickAcc: 0,
        pct: (opts.pct || 0.03) * potency * potMult, // fraction of maxHp per second
        src: opts.srcName || null,
        srcId: opts.srcId || null,
      };
      if (P && apex) {
        try {
          let f = 0.5;
          try { f = window.Entities.slowFactorFor ? window.Entities.slowFactorFor(P, ent) : 0.5; } catch (e2) { }
          ent.slowUntil = Math.max(ent.slowUntil || 0, now + 3000 * (window.Entities.slowDurationMult ? window.Entities.slowDurationMult(P) : 1));
          if (!(ent.slowFactor > 0)) ent.slowFactor = f; else ent.slowFactor = Math.min(ent.slowFactor, f);
          creditStatus(P, "slow");
        } catch (e2) { }
      }
    } else if (type === "burn") {
      ent.status.burn = {
        until: now + (opts.durationMs || LONG) * durMult,
        tickAcc: 0,
        dps: Math.max(1, Math.round((opts.dps || 4) * potency * potMult)),
        defDown: Math.max(1, Math.round((opts.defDown != null ? opts.defDown : 2) * potency * potMult * (apex ? 1.5 : 1))),
        src: opts.srcName || null,
        srcId: opts.srcId || null,
      };
    } else if (type === "freeze") {
      const dur = Math.max(0.5, (opts.duration || 2) * (0.7 + potency * 0.3) * potMult * durMult);
      ent.status.freeze = { until: now + dur * 1000, src: opts.srcName || null };
      try {
        let extra = 0;
        try { if (P && window.Entities.statusHasApex && window.Entities.statusHasApex(P, "freeze")) extra = 4000; } catch (e2) { }
        if (P) {
          let f = 0.5;
          try { f = window.Entities.slowFactorFor ? window.Entities.slowFactorFor(P, ent) : 0.5; } catch (e3) { }
          const slowMs = dur * 1000 + extra * (window.Entities.slowDurationMult ? window.Entities.slowDurationMult(P) : 1);
          ent.slowUntil = Math.max(ent.slowUntil || 0, now + slowMs);
          if (!(ent.slowFactor > 0)) ent.slowFactor = f; else ent.slowFactor = Math.min(ent.slowFactor, f);
          creditStatus(P, "slow");
        } else ent.slowUntil = Math.max(ent.slowUntil || 0, now + dur * 1000);
      } catch (e) { }
    } else if (type === "paralyze") {
      const extra = apex ? 2 : 0;
      ent.status.paralyze = {
        until: now + (opts.durationMs || LONG) * durMult,
        agiDown: Math.max(1, Math.round(3 * potency * potMult) + extra),
        strDown: Math.max(1, Math.round(3 * potency * potMult) + extra),
        src: opts.srcName || null,
      };
    } else if (type === "blind") {
      let miss = BLIND_MISS, sight = 3.5;
      try {
        if (P && window.Entities) {
          miss = window.Entities.blindMissFor ? window.Entities.blindMissFor(P) : BLIND_MISS;
          sight = window.Entities.blindSightFor ? window.Entities.blindSightFor(P) : 3.5;
        } else if (opts.miss != null || opts.sight != null) {
          miss = Number(opts.miss) || BLIND_MISS; sight = Number(opts.sight) || 3.5;
        }
      } catch (e) { }
      ent.status.blind = { until: now + (opts.durationMs || 60000) * durMult, src: opts.srcName || null, miss, sight };
    } else if (type === "bleed") {
      let bUntil = now + (opts.durationMs || 12000) * durMult;
      try { if (isBulky(ent)) bUntil = Math.min(bUntil, now + BOSS_DOT_BASE_MS * durMult); } catch (e) { }
      ent.status.bleed = {
        until: bUntil,
        tickAcc: 0,
        pct: (opts.pct || 0.025) * potency * potMult,
        src: opts.srcName || null,
        srcId: opts.srcId || null,
      };
      if (P && apex) {
        try {
          let f = 0.5;
          try { f = window.Entities.slowFactorFor ? window.Entities.slowFactorFor(P, ent) : 0.5; } catch (e2) { }
          ent.slowUntil = Math.max(ent.slowUntil || 0, now + 3000 * (window.Entities.slowDurationMult ? window.Entities.slowDurationMult(P) : 1));
          if (!(ent.slowFactor > 0)) ent.slowFactor = f; else ent.slowFactor = Math.min(ent.slowFactor, f);
          creditStatus(P, "slow");
        } catch (e2) { }
      }
    } else if (type === "sunder") {
      ent.status.sunder = {
        until: now + (opts.durationMs || 8000) * durMult,
        defDown: Math.max(1, Math.round((opts.defDown != null ? opts.defDown : 3) * potMult * (apex ? 1.5 : 1))),
        src: opts.srcName || null,
      };
    } else if (type === "stun") {
      const dur = Math.max(0.5, (opts.duration || 1) * potMult * durMult + (apex ? 0.5 : 0));
      ent.status.stun = { until: now + dur * 1000, src: opts.srcName || null };
      try {
        if (P) {
          let f = 0.5;
          try { f = window.Entities.slowFactorFor ? window.Entities.slowFactorFor(P, ent) : 0.5; } catch (e2) { }
          const slowMs = dur * 1000 * (window.Entities.slowDurationMult ? 1 : 1);
          ent.slowUntil = Math.max(ent.slowUntil || 0, now + slowMs);
          if (!(ent.slowFactor > 0)) ent.slowFactor = f; else ent.slowFactor = Math.min(ent.slowFactor, f);
          creditStatus(P, "slow");
        } else ent.slowUntil = Math.max(ent.slowUntil || 0, now + dur * 1000);
      } catch (e) { }
    }
    if (P) creditStatus(P, type);
    return true;
  }
  // apply from an ability definition (scales with caster spell power for players)
  function applyFromAbility(target, abId, caster) {
    let ab = null;
    try { ab = window.CFG.ABILITIES[abId]; } catch (e) { }
    const st = ab && ab.status;
    if (!ab || !st) return false;
    if (st.chance != null && Math.random() > st.chance) return false;
    let potency = st.potency || 1;
    try {
      if (caster && caster.kind === "player") potency *= window.Entities.spellPowerMult(caster, abId);
    } catch (e) { }
    const srcName = (caster && caster.name) || null;
    return apply(target, st.type, { ...st, potency, src: undefined, srcName, srcId: srcIdOf(caster) });
  }
  // apply from an arrow definition
  function applyFromArrow(target, arrow, caster) {
    if (!arrow || !arrow.status) return false;
    const st = arrow.status;
    if (st.chance != null && Math.random() > st.chance) return false;
    let potency = st.potency || 1;
    try {
      if (caster && caster.kind === "player" && caster.stats) {
        let m = 1;
        try { if (window.Entities && window.Entities.meleeDmgMult) m = window.Entities.meleeDmgMult(caster); } catch (e2) { m = 1 + 0.01 * (((caster.stats.str | 0) || 5) - 5); }
        potency *= m;
      }
    } catch (e) { }
    return apply(target, st.type, { ...st, potency, srcName: (caster && caster.name) || null, srcId: srcIdOf(caster) });
  }
  function cure(ent, types) {
    if (!ent || !ent.status) return false;
    let changed = false;
    for (const t of (Array.isArray(types) ? types : [types])) {
      if (ent.status[t]) { delete ent.status[t]; changed = true; }
    }
    return changed;
  }
  function cureAll(ent) { return cure(ent, TYPES); }
  function isFrozen(ent) {
    try { return !!(ent && ent.status && ent.status.freeze && performance.now() < ent.status.freeze.until); } catch (e) { return false; }
  }
  function isStunned(ent) {
    try { return !!(ent && ent.status && ent.status.stun && performance.now() < ent.status.stun.until); } catch (e) { return false; }
  }
  function isBlinded(ent) {
    try { return !!(ent && ent.status && ent.status.blind && performance.now() < ent.status.blind.until); } catch (e) { return false; }
  }
  // sweep expired entries; returns true if anything removed
  function sweep(ent) {
    if (!ent || !ent.status) return false;
    const now = performance.now();
    let changed = false;
    for (const t of TYPES) {
      const s = ent.status[t];
      if (s && s.until && now > s.until) { delete ent.status[t]; changed = true; }
    }
    return changed;
  }
  // per-frame ticks for poison/burn/bleed. dealDmg is injected to avoid cycles.
  // statusType rides along so the renderer can pulse in the element color
  // instead of the generic white hit-flash (see drawEntity in game.js).
  function tick(ent, dt, dealDmg) {
    if (!ent || ent.hp <= 0 || !ent.status) return;
    sweep(ent);
    const now = performance.now();
    const P = ent.status.poison;
    if (P && now < P.until) {
      P.tickAcc = (P.tickAcc || 0) + dt;
      if (P.tickAcc >= 1) {
        P.tickAcc = 0;
        let dmg = Math.max(1, Math.round((ent.maxHp || 10) * (P.pct || 0.03)));
        try { if (isBulky(ent)) dmg = Math.min(dmg, Math.max(1, Math.round((ent.maxHp || 10) * BOSS_DOT_PCT))); } catch (e) { }
        try { dealDmg(srcFor(P), ent, dmg, { color: "#7ddf6b", isStatus: true, statusType: "poison" }); } catch (e) { ent.hp -= dmg; }
      }
    }
    const BL = ent.status.bleed;
    if (BL && now < BL.until) {
      BL.tickAcc = (BL.tickAcc || 0) + dt;
      if (BL.tickAcc >= 1) {
        BL.tickAcc = 0;
        let dmg = Math.max(1, Math.round((ent.maxHp || 10) * (BL.pct || 0.025)));
        try { if (isBulky(ent)) dmg = Math.min(dmg, Math.max(1, Math.round((ent.maxHp || 10) * BOSS_DOT_PCT))); } catch (e) { }
        try { dealDmg(srcFor(BL), ent, dmg, { color: "#ff5b5b", isStatus: true, statusType: "bleed" }); } catch (e) { ent.hp -= dmg; }
      }
    }
    const B = ent.status.burn;
    if (B && now < B.until) {
      B.tickAcc = (B.tickAcc || 0) + dt;
      if (B.tickAcc >= 1) {
        B.tickAcc = 0;
        try { dealDmg(srcFor(B), ent, B.dps || 3, { color: "#ff7b2e", isStatus: true, statusType: "burn" }); } catch (e) { ent.hp -= (B.dps || 3); }
      }
    }
  }
  // stat penalties while afflicted (used by game.js combat + movement)
  function agiPenalty(ent) {
    try { return (ent && ent.status && ent.status.paralyze) ? (ent.status.paralyze.agiDown | 0) || 3 : 0; } catch (e) { return 0; }
  }
  function strPenalty(ent) {
    try { return (ent && ent.status && ent.status.paralyze) ? (ent.status.paralyze.strDown | 0) || 3 : 0; } catch (e) { return 0; }
  }
  function defPenalty(ent) {
    try {
      let d = 0;
      if (ent && ent.status) {
        if (ent.status.burn) d += (ent.status.burn.defDown | 0) || 0;
        if (ent.status.sunder) d += (ent.status.sunder.defDown | 0) || 0;
      }
      return d;
    } catch (e) { return 0; }
  }
  // blinded eyes see only ~3 tiles out (attacker's tree sharpens it)
  function sightRange(ent, base) {
    try {
      if (isBlinded(ent)) {
        const s = ent.status.blind.sight;
        return Math.min(base, (typeof s === "number" && s > 0) ? s : 3.5);
      }
    } catch (e) { }
    return base;
  }
  // small miss chance while blinded — every direct hit rolls this (the
  // dealDamage paths call rollBlindMiss; status ticks skip it).
  function blindMissChance(ent) {
    try {
      if (!isBlinded(ent)) return 0;
      const m = ent.status.blind.miss;
      return (typeof m === "number" && m > 0) ? m : BLIND_MISS;
    } catch (e) { return 0; }
  }
  function rollBlindMiss(ent) {
    try {
      if (!isBlinded(ent)) return false;
      const m = ent.status.blind.miss;
      const c = (typeof m === "number" && m > 0) ? m : BLIND_MISS;
      return Math.random() < c;
    } catch (e) { return false; }
  }
  // slowed legs move at a fraction of speed. Player-caused slows store
  // their snare strength on the victim (Snaring tree); everything else
  // falls back to the legacy 0.6 (hero) / 0.5 (everyone else).
  function slowMult(ent) {
    try {
      if (!ent || !(performance.now() < (ent.slowUntil || 0))) return 1;
      if (typeof ent.slowFactor === "number" && ent.slowFactor > 0) return ent.slowFactor;
      return (ent && ent.kind === "player") ? 0.6 : 0.5;
    } catch (e) { return 1; }
  }
  return {
    TYPES, ensure, has, list, describe, apply, applySlow, slowMult, isBulky, applyFromAbility, applyFromArrow,
    cure, cureAll, isFrozen, isBlinded, isStunned, sweep, tick,
    agiPenalty, strPenalty, defPenalty, sightRange, BLIND_MISS, blindMissChance, rollBlindMiss,
  };
})();
