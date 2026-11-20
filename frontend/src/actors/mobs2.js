/* Normal mobs v2 — polish pass for the <8 borderline kinds.
   Loaded AFTER mobs.js. Only overrides weak ones with bolder silhouettes.
*/
(function(){
  function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x,y,w,h); }
  function shade(hex,amt){
    const n=parseInt(String(hex).slice(1),16); if(isNaN(n)) return hex;
    let r=(n>>16)+amt, gg=((n>>8)&255)+amt, b=(n&255)+amt;
    r=Math.max(0,Math.min(255,r)); gg=Math.max(0,Math.min(255,gg)); b=Math.max(0,Math.min(255,b));
    return "#"+((r<<16)|(gg<<8)|b).toString(16).padStart(6,"0");
  }
  function cv(){ const c=document.createElement("canvas"); c.width=32; c.height=40; return c; }
  const D = {};
  D.lesser_wyvern = (g,tint)=>{
    const dk=shade(tint,-35), lite=shade(tint,35);
    g.fillStyle=lite;
    g.beginPath(); g.moveTo(14,22); g.lineTo(1,8); g.lineTo(4,16); g.lineTo(8,15); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(31,8); g.lineTo(28,16); g.lineTo(24,15); g.fill();
    px(g,3,12,3,2,"#fff"); px(g,26,12,3,2,"#fff");
    px(g,11,28,3,6,dk); px(g,18,28,3,6,dk);
    px(g,10,16,12,13,tint); px(g,12,18,8,8,lite); px(g,12,24,8,3,"#e8d9b8");
    px(g,18,10,7,8,tint); px(g,19,11,5,2,"#fff");
    g.fillStyle="#ffe14d"; g.fillRect(20,12,3,3); g.fillStyle="#111"; g.fillRect(21,13,1,2);
    px(g,1,21,5,2,dk); px(g,2,22,2,2,"#ff6b6b");
  };
  D.centaur_foal = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,1,22,5,3,dk); px(g,4,26,18,6,tint); px(g,4,26,18,2,shade(tint,30));
    px(g,4,28,4,2,"#fff"); px(g,10,28,3,2,"#fff"); px(g,16,28,3,2,"#fff");
    px(g,5,31,3,5,dk); px(g,11,31,3,5,dk); px(g,17,31,3,5,dk);
    px(g,17,10,7,14,tint); px(g,13,13,5,7,tint);
    px(g,7,18,5,5,"#8a5a33"); px(g,18,4,7,9,"#d9a06b"); px(g,19,5,5,2,"#8a5a33");
    g.fillStyle="#111"; g.fillRect(20,8,2,2);
    px(g,25,12,2,10,"#8a5a33"); px(g,21,12,6,2,"#d9c9c9");
    px(g,13,16,4,6,"#3a6a9a");
  };
  D.gorgon_spawn = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-35)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,tint); px(g,9,14,3,10,shade(tint,30)); px(g,20,14,3,10,shade(tint,30));
    px(g,12,8,8,8,tint);
    for(let i=0;i<5;i++){ px(g,8+i*4,1,3,7,"#2e7d46"); px(g,9+i*4,2,1,2,"#ffe14d"); }
    g.fillStyle="#7dff9b"; g.fillRect(13,10,3,2); g.fillRect(18,10,2,1); g.fillStyle="#111"; g.fillRect(14,10,1,2);
    px(g,15,14,2,4,"#a02020"); px(g,5,20,3,6,"#8a8a8a"); px(g,24,20,3,6,"#8a8a8a");
  };
  D.chimera_cub = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,30));
    px(g,8,20,7,5,"#e8c020"); px(g,5,10,6,7,"#e8e0d0"); px(g,6,12,4,2,"#111");
    px(g,20,12,8,12,"#c96b2e"); px(g,21,13,6,3,"#ff9d2e");
    g.fillStyle="#ff6b2e"; g.fillRect(26,15,3,2);
    px(g,27,22,3,8,"#2e7d46"); px(g,28,24,2,5,"#7ac97a");
    g.fillStyle="#111"; g.fillRect(23,16,2,2);
    px(g,7,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
  };
  D.fenrir_pup = (g,tint)=>{
    const dk=shade(tint,-30);
    px(g,0,19,5,4,dk); px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,6,31,4,6,dk); px(g,12,31,4,6,dk); px(g,18,31,4,6,dk); px(g,22,31,4,6,dk);
    px(g,22,12,4,7,"#3a3a4a"); px(g,26,12,4,7,"#3a3a4a");
    px(g,21,15,10,11,tint); px(g,21,15,10,3,"#5a5a6a");
    px(g,27,21,5,4,"#e8a0a0"); px(g,30,22,2,2,"#7a1f1f");
    g.fillStyle="#ffe14d"; g.fillRect(23,19,3,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    px(g,8,26,8,2,"#9adcff");
  };
  D.nokk = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,12,21,8,6,"#1a4a5a");
    px(g,6,4,6,13,"#7ad9f0"); px(g,20,4,6,13,"#7ad9f0"); px(g,7,3,4,3,"#2a8a5a"); px(g,21,3,4,3,"#2a8a5a");
    px(g,9,9,14,11,"#f2e8d0"); g.fillStyle="#111"; g.fillRect(12,12,2,3); g.fillRect(18,12,2,3);
    px(g,24,18,2,10,"#6b4226"); px(g,22,20,6,6,"#8a5a33"); px(g,23,21,4,4,"#1a1a1a"); px(g,24,22,2,2,"#d9c9a0");
  };
  D.tanuki = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,"#3a2a1a");
    px(g,1,20,6,6,"#3a2a1a"); px(g,1,20,6,2,"#c9c9c9"); px(g,1,24,6,2,"#c9c9c9");
    px(g,0,26,6,6,tint); px(g,1,27,4,4,"#3a2a1a");
    px(g,22,16,8,10,tint); px(g,22,18,8,4,"#3a2a1a"); px(g,24,20,4,2,"#fff");
    g.fillStyle="#111"; g.fillRect(24,19,3,2);
    px(g,7,4,18,3,"#d9c27f"); px(g,10,0,12,5,"#c9b26e");
    px(g,25,26,3,5,"#8a5a33"); px(g,25,26,3,1,"#d9c27f");
  };
  D.puca = (g,tint)=>{
    px(g,6,24,19,8,"#2a2a32"); px(g,6,24,19,2,"#4a4a5a");
    px(g,20,8,3,8,"#e8e0d0"); px(g,24,8,3,8,"#e8e0d0");
    px(g,22,14,8,12,tint); px(g,23,16,6,3,"#7ad9f0");
    g.fillStyle="#ffe14d"; g.fillRect(23,18,3,3); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    px(g,27,21,4,3,"#d9c9b8");
    px(g,7,31,3,5,"#111"); px(g,18,31,3,5,"#111");
    g.fillStyle="#7ad9f0"; g.fillRect(4,12,2,2); g.fillRect(28,10,2,2);
  };
  D.domovoi_rogue = (g,tint)=>{
    px(g,11,30,4,6,"#3a2a1a"); px(g,17,30,4,6,"#3a2a1a");
    px(g,9,20,14,12,"#4a3a2a"); px(g,11,15,10,7,"#e8e0d0");
    px(g,9,7,14,11,"#d9a06b"); px(g,11,15,10,3,"#999");
    g.fillStyle="#111"; g.fillRect(12,10,2,2); g.fillRect(18,10,2,2); g.fillStyle="#fff"; g.fillRect(12,10,1,1);
    px(g,9,2,14,5,"#2a2a2a"); px(g,14,0,4,3,"#5a5a5a");
    px(g,25,16,2,14,"#6b4226"); px(g,22,24,8,3,"#a06a3a"); px(g,22,24,8,1,"#d9b96a");
  };
  D.naga = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-35)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,tint); px(g,9,14,3,10,shade(tint,30)); px(g,20,14,3,10,shade(tint,30));
    px(g,10,6,12,9,tint); px(g,10,6,12,2,shade(tint,30));
    g.fillStyle="#ffe14d"; g.fillRect(13,10,3,2); g.fillStyle="#111"; g.fillRect(14,10,1,2);
    px(g,5,18,3,10,"#8a5a33"); px(g,5,18,3,2,"#d9c27f"); px(g,24,18,2,8,"#c9ccd4");
    px(g,15,14,2,4,"#a02020");
  };
  D.rakshasa_cub = (g,tint)=>{
    px(g,11,30,4,6,"#5a3a22"); px(g,17,30,4,6,"#5a3a22");
    px(g,9,20,14,12,tint); px(g,9,20,14,2,"#ffd93d");
    px(g,28,24,3,6,tint); px(g,29,24,2,2,"#7a1f1f");
    px(g,9,9,14,11,tint); px(g,10,10,2,7,"#7a1f1f"); px(g,15,10,2,7,"#7a1f1f"); px(g,20,10,2,7,"#7a1f1f");
    g.fillStyle="#ffe14d"; g.fillRect(12,13,3,3); g.fillStyle="#111"; g.fillRect(13,14,1,2);
    px(g,13,2,6,4,"#8a5a33"); px(g,4,8,4,5,"#e8e0d0"); px(g,24,8,4,5,"#e8e0d0");
  };
  D.gnoll = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,1,20,4,4,dk); px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,8,26,10,2,"#e8e0d0"); px(g,11,27,2,2,"#7a6a4a"); px(g,15,27,2,2,"#7a6a4a");
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,12,3,5,shade(tint,20)); px(g,27,12,3,5,shade(tint,20));
    px(g,22,16,8,10,tint); px(g,27,21,4,3,"#d9c9b8"); px(g,30,22,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  };
  D.wyvern_fledgling = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,10,4,12,4,"#f2ede2"); px(g,11,3,10,2,"#fff");
    g.fillStyle="#e8e0d0";
    g.beginPath(); g.moveTo(14,22); g.lineTo(5,14); g.lineTo(7,18); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(27,14); g.lineTo(25,18); g.fill();
    px(g,11,28,3,6,dk); px(g,18,28,3,6,dk);
    px(g,9,16,14,12,tint); px(g,16,10,9,9,tint); px(g,17,11,7,3,"#fff");
    g.fillStyle="#111"; g.fillRect(19,13,3,3); g.fillStyle="#fff"; g.fillRect(19,13,1,1); g.fillRect(21,13,1,1);
    px(g,22,18,4,3,"#e8d9b8"); px(g,12,24,8,2,"#f2ede2");
  };
  D.mire_lurker = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,7,20,13,4,"#2a4a3a"); px(g,9,19,3,3,"#d9ff9d");
    px(g,6,24,3,6,"#4a6a2a"); px(g,10,22,5,3,"#9adc9a"); px(g,11,23,3,1,"#fff");
    px(g,22,12,4,6,"#9adc9a"); px(g,22,12,4,2,"#d9ff9d");
    px(g,22,16,8,10,tint); g.fillStyle="#111"; g.fillRect(24,19,3,2); g.fillStyle="#9adc9a"; g.fillRect(25,19,1,1);
    px(g,27,21,4,3,"#3a2a1a");
    px(g,7,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
  };
  D.wreck_eel = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-35)); px(g,10,26,12,6,tint);
    px(g,10,20,4,6,"#6b4226"); px(g,10,20,4,1,"#a97648"); px(g,18,24,4,4,"#8a8a92");
    px(g,11,12,10,16,tint);
    px(g,12,8,8,8,shade(tint,25)); px(g,13,6,2,3,"#2a5a6a"); px(g,17,6,2,3,"#2a5a6a");
    g.fillStyle="#bfe8ff"; g.fillRect(13,10,3,2); g.fillStyle="#111"; g.fillRect(14,10,1,2);
  };
  const prev = window.Sprites.actor;
  // NOTE: app (custom face/outfit) must be forwarded — heroes AND npcs use
  // it, and dropping it renders everyone in the legacy default look.
  // PERF: same per-frame redraw trap as mobs.js — cache pure (kind,tint)
  // paints instead of allocating a canvas per mob per frame.
  const mob2Cache = new Map();
  const MOB2_CACHE_MAX = 400;
  try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(() => mob2Cache.clear()); } catch (e) {}
  window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
    if (D[kind]){
      gen = (gen === "male" || gen === "female") ? gen : "";
      let P = null, bk = "";
      try {
        if (window.Anim) {
          if (ph) { P = window.Anim.normP(ph); bk = "|"+window.Anim.bucket(ph); }
          else P = window.Anim.normP(null);
        }
      } catch(e){ P = { f:0, moving:false, hurt:false, atk:false, atkKind:"melee", idle:0, t:0 }; }
      const ck = kind + "|" + (tint || "#fff") + "|" + gen + bk;
      let hit = null;
      try { hit = mob2Cache.get(ck); } catch (e) { hit = null; }
      if (hit) return hit;
      const c=cv(); const g=c.getContext("2d"); g.imageSmoothingEnabled=false;
      g.clearRect(0,0,32,40);
      g.fillStyle="rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
      try{ D[kind](g,tint||"#fff",P); }catch(e){}
      let out = c;
      try { out = window.Sprites.genderFX(c, gen); } catch (e) {}
      try { mob2Cache.set(ck, out); if (mob2Cache.size > MOB2_CACHE_MAX) mob2Cache.delete(mob2Cache.keys().next().value); } catch (e) {}
      return out;
    }
    return prev.call(this,kind,tint,seed,gear,app,gen,ph);
  };
})();
