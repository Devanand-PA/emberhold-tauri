/* src/sprites/anim.js — procedural entity animation: idle / walk / attack / hurt / death.
   Transform-based (translate/rotate/scale the cached sprite canvas), so it costs
   almost nothing and automatically covers every mob, NPC, player, tame + boss.
   Triggers are plain timestamp fields the combat code stamps on entities:
     o.atkUntil/o.atkKind/o.atkDur — swing, cast, shoot poses
     o.hurtUntil/o.hurtAng        — hit flash + directional jolt
   Movement is tracked per entity id, so walk cycles follow actual motion.
   Remote-replay attacks arrive as position pings (see ping()) since view
   objects are rebuilt every frame — ids stay stable so the state persists.
*/
(function(){
  "use strict";
  const S = new Map(); // "kind:id" -> {x,y,t,phase,still}
  const pings = [];    // {x,y,k,until,key}
  let lastSweep = 0;
  function num(v, d){ v = +v; return isFinite(v) ? v : d; }
  function ekey(o, kind){
    try { return (kind || "?") + ":" + (o.id || o.kind || "e"); }
    catch(e){ return "?:e"; }
  }
  function seedNum(s){
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296 * Math.PI * 2;
  }
  function bodyOf(o, kind){
    try {
      if (kind === "player" || kind === "npc") return "humanoid";
      const tpl = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[(o && o.kind) || kind] || {};
      return tpl.body || "beast";
    } catch(e){ return "beast"; }
  }
  // Remote attack visuals land here (playRemoteAct): adopted by whichever
  // entity stands on the ping when its next frame renders.
  function ping(x, y, atkKind, durMs){
    try {
      x = +x; y = +y;
      if (!isFinite(x) || !isFinite(y)) return;
      pings.push({ x, y, k: atkKind || "melee", until: performance.now() + (durMs || 300), key: null });
      if (pings.length > 40) pings.splice(0, pings.length - 40);
    } catch(e){}
  }
  // Full per-frame transform for one entity. w/h = on-screen sprite box px.
  function state(o, kind, now, w, h){
    const out = { dx: 0, dy: 0, rot: 0, scx: 1, scy: 1, flash: 0 };
    try {
      if (!o || !isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return out;
      if (now - lastSweep > 5000) {
        lastSweep = now;
        try {
          for (const [k, s] of S) if (now - s.t > 30000) S.delete(k);
          for (let i = pings.length - 1; i >= 0; i--) if (pings[i].until < now) pings.splice(i, 1);
        } catch(e){}
      }
      const k = ekey(o, kind);
      let s = S.get(k);
      const x = num(o.x ?? o.gx, NaN), y = num(o.y ?? o.gy, NaN);
      const sd = seedNum(k);
      if (!s){ s = { x, y, t: now, phase: sd, still: 9 }; S.set(k, s); }
      let dt = (now - s.t) / 1000;
      if (!(dt >= 0) || dt > 0.25) dt = 0.016;
      if (isFinite(x) && isFinite(y) && isFinite(s.x) && isFinite(s.y)) {
        const d = Math.hypot(x - s.x, y - s.y);
        if (d > 0.0006) { s.phase += d * 7; s.still = 0; s.x = x; s.y = y; }
        else s.still += dt;
      }
      s.t = now;
      // frozen solid: hold the pose
      try { if (window.Status && window.Status.isFrozen && window.Status.isFrozen(o)) return out; } catch(e){}
      // death tip-over owns the whole body (corpses keep lying there)
      if (o.hp <= 0 || o.corpse) {
        if (!o._deadAt) {
          // old corpses (loaded from a save long after death) arrive already
          // lying: snap straight to the final tipped pose instead of replaying
          // the 300ms fall. Fresh kills (deadAt seconds ago) still tip over.
          try {
            const age = Date.now() - (o.deadAt || 0);
            o._deadAt = (o.deadAt && age > 5000) ? now - 1000 : now;
          } catch(e){ try { o._deadAt = now; } catch(e2){} }
        }
        const dk = Math.max(0, Math.min(1, (now - (o._deadAt || now)) / 300));
        const e2 = 1 - Math.pow(1 - dk, 2);
        out.rot = (sd < Math.PI ? 1 : -1) * (Math.PI / 2) * e2;
        out.dy = 0.03 * h * e2;
        return out;
      } else if (o._deadAt) { try { o._deadAt = 0; } catch(e){} }
      const t = now / 1000, ph = s.phase;
      const moving = s.still < 0.12;
      const body = bodyOf(o, kind);
      if (body === "humanoid" || body === "undead") {
        if (moving) { out.dy -= Math.abs(Math.sin(ph)) * 0.045 * h; out.rot += Math.sin(ph) * 0.04; }
        else { const b = Math.sin(t * 2.1 + sd); out.scy += 0.02 * b; out.dy += 0.01 * h * b; }
        if (body === "undead" && moving) out.rot += Math.sin(ph * 0.5) * 0.03;
      } else if (body === "beast" || body === "brute") {
        if (moving) {
          out.dy -= Math.abs(Math.sin(ph)) * 0.05 * h;
          out.rot += Math.sin(ph) * (body === "brute" ? 0.03 : 0.055);
          if (body === "brute") out.rot += 0.03;
        } else { const b = Math.sin(t * 1.8 + sd); out.scy += 0.023 * b; out.scx -= 0.012 * b; }
      } else if (body === "winged") {
        const sp = moving ? 7 : 3.6, amp = (moving ? 0.075 : 0.05) * h;
        out.dy += Math.sin(t * sp + sd) * amp;
        out.rot += Math.sin(t * sp + sd + 1.3) * 0.045;
      } else if (body === "serpent") {
        if (moving) { out.rot += Math.sin(ph * 0.85) * 0.07; out.dx += Math.sin(ph * 0.85 + 0.6) * 0.02 * w; out.dy -= Math.abs(Math.sin(ph)) * 0.02 * h; }
        else { out.rot += Math.sin(t * 1.6 + sd) * 0.02; out.dy += Math.sin(t * 1.6 + sd) * 0.01 * h; }
      } else if (body === "swarm") {
        out.dx += Math.sin(t * 13 + sd) * 0.012 * w;
        out.dy += Math.sin(t * 17 + sd * 2.3) * 0.018 * h + Math.sin(t * 3 + sd) * 0.02 * h;
        out.rot += Math.sin(t * 11 + sd) * 0.03;
      } else if (body === "blob") {
        const f = moving ? ph : (t * 3 + sd), b = Math.sin(f), m2 = moving ? 1.4 : 1;
        out.scx += 0.07 * b * m2; out.scy -= 0.07 * b * m2;
        if (moving) out.dy -= Math.abs(Math.cos(f)) * 0.05 * h;
      } else if (body === "ghost") {
        out.dy += Math.sin(t * 2.6 + sd) * 0.05 * h;
        out.rot += Math.sin(t * 2.1 + sd) * 0.03;
      } else if (body === "construct") {
        if (moving) out.dy -= Math.abs(Math.sin(ph)) * 0.02 * h;
        else out.dy += Math.sin(t * 1.2 + sd) * 0.004 * h;
      } else {
        if (moving) { out.dy -= Math.abs(Math.sin(ph)) * 0.05 * h; out.rot += Math.sin(ph) * 0.05; }
        else { const b = Math.sin(t * 1.8 + sd); out.scy += 0.02 * b; }
      }
      // adopt a remote-attack ping if one landed on this spot
      try {
        if (isFinite(x) && isFinite(y)) {
          for (const pg of pings) {
            if (pg.until > now && pg.key !== k && Math.hypot(pg.x - x, pg.y - y) < 0.6) {
              pg.key = k;
              o.atkUntil = pg.until; o.atkKind = pg.k; o.atkDur = 300;
              break;
            }
          }
        }
      } catch(e){}
      // attack pose: punch curve 0 -> 1 -> 0 over the window
      try {
        const au = num(o.atkUntil, 0);
        if (au > now) {
          const dur = num(o.atkDur, 300) || 300;
          let kk = 1 - (au - now) / dur;
          kk = Math.max(0, Math.min(1, kk));
          const e3 = Math.sin(kk * Math.PI);
          const ak = o.atkKind || "melee";
          const fa = num(o.faceAng, 0);
          if (ak === "cast") {
            out.dy -= 0.07 * h * e3;
            const q = 1 + 0.06 * e3; out.scx *= q; out.scy *= q;
            out.rot -= 0.045 * e3;
          } else if (ak === "shoot") {
            out.dx -= Math.cos(fa) * 0.05 * w * e3;
            out.rot -= 0.03 * e3;
          } else {
            out.dx += Math.cos(fa) * 0.13 * w * e3;
            out.dy += Math.sin(fa) * 0.13 * w * e3;
            const q = 1 + 0.05 * e3; out.scx *= q; out.scy *= q;
            out.rot += 0.07 * e3 * (Math.cos(fa) >= 0 ? 1 : -1);
          }
        }
      } catch(e){}
      // hurt: white flash + directional jolt + shake
      try {
        const hu = num(o.hurtUntil, 0);
        if (hu > now) {
          const kk2 = Math.max(0, Math.min(1, (hu - now) / 120));
          out.flash = 0.65 * kk2;
          const ha = num(o.hurtAng, 0);
          out.dx += Math.cos(ha) * 0.06 * w * kk2 + Math.sin(now / 16 + sd) * 0.02 * w * kk2;
          out.dy += Math.sin(ha) * 0.06 * w * kk2;
        }
      } catch(e){}
    } catch(e){}
    return out;
  }
  // Draw a sprite box with feet pivot (squash stays grounded, falls tip over).
  function drawBoxed(ctx, spr, db, rot, mirror){
    try {
      ctx.save();
      ctx.translate(db.x + db.ww / 2, db.y + db.hh);
      if (rot) ctx.rotate(rot);
      if (mirror) ctx.scale(-1, 1);
      ctx.drawImage(spr, -db.ww / 2, -db.hh, db.ww, db.hh);
      ctx.restore();
    } catch(e){ try { ctx.restore(); } catch(e2){} }
  }
  // sprite-masked hit flash: a white silhouette clipped to the sprite's own
  // opaque pixels — never a box over the tiles (freeze keeps its ice block).
  let _flashC = null;
  function flashBox(ctx, spr, db, a, flip){
    try {
      if (!(a > 0.01) || !db || !(db.ww > 0) || !(db.hh > 0)) return;
      const al = Math.max(0, Math.min(0.75, a));
      if (!spr) {
        ctx.fillStyle = "rgba(255,255,255," + al.toFixed(3) + ")";
        ctx.fillRect(db.x, db.y, db.ww, db.hh);
        return;
      }
      const W = Math.max(1, Math.round(db.ww)), H = Math.max(1, Math.round(db.hh));
      if (!_flashC) { try { _flashC = document.createElement("canvas"); } catch (e) { return; } }
      if (_flashC.width !== W || _flashC.height !== H) { _flashC.width = W; _flashC.height = H; }
      const g = _flashC.getContext("2d");
      if (!g) return;
      g.clearRect(0, 0, W, H);
      if (flip) { g.save(); g.translate(W, 0); g.scale(-1, 1); g.drawImage(spr, 0, 0, W, H); g.restore(); }
      else g.drawImage(spr, 0, 0, W, H);
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "source-over";
      ctx.globalAlpha = al;
      ctx.drawImage(_flashC, db.x, db.y, db.ww, db.hh);
      ctx.globalAlpha = 1;
    } catch(e){ try { ctx.globalAlpha = 1; } catch(e2){} }
  }
  // Limb-animation pose for sprite re-rendering (src/anim_sprites.js).
  // Read-only: never advances the stride clock (state() owns that), so call
  // it before or after state() — at most one frame of lag either way.
  // Returns {f:0..3 walk frame, moving, hurt, atk, atkKind, idle:0/1, t:sec}.
  // Walk frames: one frame per ~0.22 tiles of stride distance (phase grows
  // d*7 per tile), i.e. ~4.5 frames/sec at a 1-tile/sec prowl, ~13 at a
  // full 3-tile/sec sprint — a real marching cycle, not a shimmer.
  function pose(o, kind, now){
    const P = { f: 0, moving: false, hurt: false, atk: false, atkKind: "melee", idle: 0, t: 0 };
    try {
      // corpses hold a single frozen rest pose: no walk cycle, no idle sway,
      // no hurt/attack flashes. t is pinned at 0 so every t-driven painter
      // detail (wing sway, segment drift, spark orbits) renders identically
      // every frame — the dead stay still.
      if (o && (o.hp <= 0 || o.corpse)) return P;
      now = +now;
      if (!isFinite(now)) now = performance.now();
      P.t = now / 1000;
      P.idle = Math.floor(P.t * 1.5) % 2;
      if (!o) return P;
      const k = ekey(o, kind);
      const s = S.get(k);
      if (s) {
        P.moving = s.still < 0.12 && o.hp > 0;
        if (P.moving) P.f = Math.abs(Math.floor(s.phase / 1.55)) % 4;
      }
      let frozen = false;
      try { frozen = !!(window.Status && window.Status.isFrozen && window.Status.isFrozen(o)); } catch(e){}
      if (frozen) { P.moving = false; P.f = 0; }
      if (o.hp > 0) {
        if (now < num(o.hurtUntil, 0)) P.hurt = true;
        if (now < num(o.atkUntil, 0)) { P.atk = true; P.atkKind = o.atkKind || "melee"; }
      }
    } catch(e){}
    return P;
  }
  // Shared limb-animation helpers for ALL painters (every sprite file calls
  // these at render time, so load order never matters). P is a normalized
  // pose: use normP() on the raw 7th actor arg first.
  function normP(ph){
    if (ph && typeof ph === "object" && typeof ph.f === "number") return ph;
    return { f:0, moving:false, hurt:false, atk:false, atkKind:"melee", idle:0, t:0 };
  }
  // front-facing biped limb offsets: legs march, arms counter-swing,
  // hurt = stagger-brace, atk = weapon (right) arm raised.
  // Every walk frame is a genuinely different pose: legs lift + stride
  // (lx/rx fore-aft, reads as march front-on and stride side-on), arms
  // counter-swing in both axes, head glances side to side (hx). f0 and f2
  // are NOT mirrors-identical to anything: all 4 frames differ.
  function limb(ph){
    const P = normP(ph);
    if (P.hurt) return { ld:-1, rd:1, lx:-1, rx:1, la:2, ra:2, lax:-1, rax:1, hx:0, wide:1, crouch:1 };
    if (P.atk && P.atkKind !== "cast") return { ld:1, rd:1, lx:-1, rx:1, la:1, ra:-4, lax:0, rax:1, hx:0, wide:1, crouch:1 };
    if (!P.moving) return { ld:0, rd:0, lx:0, rx:0, la:0, ra:0, lax:0, rax:0, hx:0, wide:0, crouch:0 };
    const f = P.f & 3;
    return {
      ld:[0,-1,-3,-1][f], lx:[0,1,1,-1][f],
      rd:[-3,-1,0,-1][f], rx:[-1,-1,0,1][f],
      la:[2,1,-2,-1][f], lax:[0,-1,0,1][f],
      ra:[-2,-1,2,1][f], rax:[0,1,0,-1][f],
      hx:[0,1,0,-1][f], wide:0, crouch:0
    };
  }
  // serpent segment travelling wave (walk) / slow sway (idle)
  // Walk wave hits 4 distinct values per segment so single-segment tails
  // wag instead of toggling between two frames.
  function seg(ph,i,a){
    const P = normP(ph); a = a || 1;
    if (P.moving) { const S=[0,2,-1,1]; return S[(P.f+i)&3]*a; }
    return ((((P.t*1.5)|0)+i)&1) ? a : -a;
  }
  function hbob(ph){
    const P = normP(ph);
    // head dips deepest as the passing leg lifts (f2); with limb hx the
    // head lands on a different pixel every frame.
    return P.moving ? [0,-1,-2,-1][P.f&3] : (P.idle ? -1 : 0);
  }
  // cache-bucket suffix for a pose ("" when no pose passed at all)
  function bucket(ph){
    if (!ph) return "";
    const P = normP(ph);
    if (P.hurt) return "H"+(P.f&1);
    if (P.atk) return "A";
    if (P.moving) return "M"+(P.f&3);
    return "I"+(P.idle&1);
  }
  // quadruped diagonal-pair offsets {d1,d2}: legs (0,2) vs (1,3).
  // Trot with fore-aft stride (x1/x2) + lift so side-view legs scissor
  // instead of hopping in place; all 4 frames differ.
  function quad(ph){
    const P = normP(ph);
    if (P.hurt) return { d1:-1, d2:1, x1:-1, x2:1 };
    if (P.atk) return { d1:1, d2:1, x1:-2, x2:2 };
    if (!P.moving) return { d1:0, d2:0, x1:0, x2:0 };
    const f = P.f & 3;
    return { d1:[0,-1,-2,-1][f], x1:[2,1,-2,-1][f], d2:[-2,-1,0,-1][f], x2:[-2,-1,2,1][f] };
  }
  // wing-beat angle (radians, + = wings raised) for flap-capable painters.
  // Walk cycles beat down-up-down; attacks slam down; hurt droops. Idling
  // hovers beat too (bucket-quantized so the I0/I1 cache frames differ):
  // perched painters that fold at rest don't call flap() at rest.
  function flap(ph){
    const P = normP(ph);
    if (P.hurt) return 0.28;
    if (P.atk) return -0.6;
    if (P.moving) return [0.5,0.15,-0.55,-0.1][P.f&3];
    return P.idle ? 0.5 : -0.55;
  }
  window.Anim = { state, drawBoxed, flashBox, ping, pose, normP, limb, quad, seg, hbob, bucket, flap };
})();
