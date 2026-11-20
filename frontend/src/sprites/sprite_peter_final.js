/* src/sprites/sprite_peter_final.js — PETER THE FALLEN, final-boss redesign (outermost).
 * Loaded AFTER sprite_hell_parity2.js. Fully custom 32x40 painter for
 * peter_the_fallen only (does not call prev): the sprite must live up to the
 * dialogue — black demon-mask weeping violet fire, six-spear bone crown,
 * broken halo ringed in purple flame, torn wings, chest-maw with beating
 * heart, flame-wreathed voidglass greatblade.
 * Harvested terror: voidstalker (burning mask + shard-blade + purple aura),
 * infernal_overlord (magma-cracked bulk), gut_empress (chest/belly maw).
 */
(function(){
"use strict";
function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x|0,y|0,w|0,h|0); }
function P_of(ph){ try{ return window.Anim.normP(ph); }catch(e){ return {f:0,moving:false,hurt:false,atk:false,t:0}; } }
function A_of(P){ try{ return window.Anim.limb(P); }catch(e){ return {lx:0,rx:0,ld:0,rd:0,lax:0,rax:0,la:0,ra:0,hx:0}; } }
function Hb_of(P){ try{ return window.Anim.hbob(P); }catch(e){ return 0; } }
function Flap(P){ try{ return (window.Anim&&window.Anim.flap?window.Anim.flap(P):0); }catch(e){ return 0; } }

function peter(g, tint, P){
  P = P||{f:0,atk:false,t:0};
  const A=A_of(P), hb=Hb_of(P), WA=Flap(P);
  const fl = (P.f%2===0);            // flame-flicker frame
  const beat = (P.atk || (P.f%4<2)); // heart beats (fast on atk)
  // ---- purple-fire aura + ground hellglow + embers ----
  g.fillStyle="rgba(122,43,255,0.30)"; g.beginPath(); g.ellipse(16,22+hb,14,15,0,0,7); g.fill();
  g.fillStyle="rgba(255,42,90,0.14)"; g.beginPath(); g.ellipse(16,24+hb,10,11,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(16,37,11,2.6,0,0,7); g.fill();
  px(g,4,36,24,2,"#3a060c"); px(g,6,36,20,1,"#a01212");
  px(g,8,36,3,1,"#ff2a5a"); px(g,21,36,2,1,"#ff2a5a");
  px(g,fl?3:28,fl?14:10,1,1,"#d08aff"); px(g,fl?28:5,fl?8:20,1,1,"#a04aff"); px(g,15,fl?2:4,1,1,"#fff");
  // ---- torn wings (behind everything) ----
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?9:23,20); g.rotate(s<0?WA-0.18:-WA+0.18); g.translate(s<0?-9:-23,-20);
    const bx = s<0?0:25;
    px(g,bx,8,7,16,"#0a0612");
    px(g,bx+(s<0?1:1),10,5,12,"#1e1030");
    px(g,bx+(s<0?0:6),8,1,16,"#3a2a5a");           // bone finger spar
    px(g,bx+(s<0?0:6),8,1,8,"#8a4aff");              // rim light: separates wing from dark
    px(g,bx+(s<0?3:3),12,1,5,"#5a2a7a");
    px(g,bx+(s<0?2:3),16,2,4,"#7a0f24");            // torn holes bleed
    px(g,bx+(s<0?2:3),20,2,1,"#ff2a5a");
    px(g,bx+(s<0?1:4),11,1,4,"#8a4aff");            // membrane glints
    g.restore();
  }
  // ---- six-spear bone crown: varied heights, dark gaps so each spear reads ----
  const horns=[ [3,9,2,2],[6,5,3,4],[10,2,3,6],[19,2,3,6],[23,5,3,4],[27,9,2,2] ];
  for(const [hx,hy,hw,hh] of horns){
    px(g,hx+A.hx,hy+hb, hw,hh,"#e8e0d0");
    px(g,hx+A.hx,hy+hb+hh-1, hw,1,"#8a8078");
    px(g,hx+A.hx,hy+hb, hw,1,"#fff");
    px(g,hx+A.hx,hy+hb, 1,2,"#a04aff");            // violet root-fire
  }
  px(g,5+A.hx,10+hb,2,1,"#ff2a5a"); px(g,25+A.hx,10+hb,2,1,"#ff2a5a"); // outer horn blood
  // ---- broken halo: short burning segments (clear of horns) + 2 offset shards ----
  g.fillStyle="rgba(160,74,255,0.5)"; g.beginPath(); g.arc(16,3+hb,9,0,7); g.fill();
  px(g,9,0,4,1,"#d08aff"); px(g,20,0,4,1,"#d08aff");
  px(g,1,4,3,3,"#a04aff"); px(g,1,4,2,1,"#fff"); px(g,2,5,1,1,"#ff2a5a");   // left shard
  px(g,28,4,3,3,"#ff2a5a"); px(g,28,4,2,1,"#fff"); px(g,29,5,1,1,"#a04aff"); // right shard (blood)
  // ---- legs: iron greaves, violet seams, skull knees, war boots ----
  px(g,10+A.lx,28+A.ld,5,8,"#0c0c14"); px(g,17+A.rx,28+A.rd,5,8,"#0c0c14");
  px(g,10+A.lx,28+A.ld,5,1,"#2e2e40"); px(g,12+A.lx,29+A.ld,1,6,"#7a2bff"); px(g,19+A.rx,29+A.rd,1,6,"#ff2a5a");
  px(g,11+A.lx,31+A.ld,3,3,"#e8e0d0"); px(g,18+A.rx,31+A.rd,3,3,"#e8e0d0");
  px(g,12+A.lx,32+A.ld,1,1,"#0a0a0a"); px(g,19+A.rx,32+A.rd,1,1,"#0a0a0a");
  px(g,11+A.lx,33+A.ld,3,1,"#8a8078"); px(g,18+A.rx,33+A.rd,3,1,"#8a8078"); // jaw: reads as skull, not dice
  px(g,9+A.lx,36+A.ld,7,2,"#050508"); px(g,16+A.rx,36+A.rd,7,2,"#050508");
  px(g,9+A.lx,36+A.ld,7,1,"#5a2a7a");
  // ---- torso: broad black plate, magma cracks ----
  px(g,8,18,16,12,"#101018");
  px(g,8,18,16,1,"#3a3a4e"); px(g,8,29,16,1,"#000");
  px(g,8,18,1,12,"#2e2e3e"); px(g,23,18,1,12,"#000");
  px(g,10,20,1,6,"#7a2bff"); px(g,10,20,1,1,"#fff");
  px(g,21,20,1,6,"#ff2a5a"); px(g,21,20,1,1,"#fff");
  px(g,9,26,3,1,"#7a2bff"); px(g,20,27,3,1,"#ff2a5a");
  // ---- chest maw (gut horror): big toothed maw + beating heart ----
  px(g,12,21,8,7,"#0d0312");
  px(g,12,21,8,1,"#a04aff"); px(g,12,27,8,1,"#5a0f24");
  const hh2 = beat?4:3;
  px(g,14,22,4,hh2,"#ff2a5a");
  px(g,15,23,2,2,"#fff"); px(g,16,22,1,1,"#ff8aaa");
  for(let x=12;x<20;x+=1){ px(g,x,21,1,1,"#fff"); }          // upper teeth
  for(let x=13;x<20;x+=2){ px(g,x,27,1,1,"#e8e0d0"); }       // lower teeth
  px(g,12,24,1,2,"#ff2a5a"); px(g,19,24,1,2,"#ff2a5a");       // maw bleed
  // ---- spiked pauldrons: tapered predator slope, iron + violet + blood tips ----
  px(g,2,14,6,6,"#14141c"); px(g,1,15,8,4,"#14141c"); px(g,1,15,8,1,"#4a4a5e");
  px(g,24,14,6,6,"#14141c"); px(g,23,15,8,4,"#14141c"); px(g,23,15,8,1,"#4a4a5e");
  px(g,1,15,1,4,"#7a2bff"); px(g,30,15,1,4,"#ff2a5a");
  for(const [sx,sy] of [[2,11],[4,10],[6,11],[24,11],[26,10],[28,11]]){
    px(g,sx,sy,2,4,"#2a2a38"); px(g,sx,sy,2,1,(sx%2?"#ff8aaa":"#d08aff"));
  }
  // ---- left arm + talon claws: 2px bone w/ shade + blood tips ----
  px(g,2+A.lax,21+A.la,4,7,"#101018");
  px(g,2+A.lax,27+A.la,5,3,"#1c1c26");
  px(g,2+A.lax,30+A.la,2,4,"#cfc4b8"); px(g,4+A.lax,30+A.la,2,4,"#fff"); px(g,6+A.lax,30+A.la,1,4,"#cfc4b8");
  px(g,2+A.lax,33+A.la,2,1,"#ff2a5a"); px(g,4+A.lax,33+A.la,2,1,"#ff2a5a"); px(g,6+A.lax,33+A.la,1,1,"#7a0f24");
  // ---- right arm + voidglass GREATBLADE wreathed in violet flame ----
  const swM=P.atk?-4:0;   // small raise: the full blade must stay in frame
  if(P.atk){ // rage burst anchored to the true tip (tipY=6+swM), swollen glow
    const tipY=6+swM;
    g.fillStyle="rgba(160,74,255,0.55)"; g.beginPath(); g.ellipse(28,12+swM,7,11,0.2,0,7); g.fill();
    px(g,26,tipY-2,2,2,"#fff"); px(g,29,tipY-1,2,2,"#d08aff"); px(g,24,tipY+1,1,1,"#ff2a5a");
  }
  g.fillStyle="rgba(160,74,255,0.40)"; g.beginPath(); g.ellipse(28,14+swM,6,10,0.2,0,7); g.fill();
  g.fillStyle="rgba(255,42,90,0.25)"; g.beginPath(); g.ellipse(28,14+swM,4,8,0.2,0,7); g.fill();
  px(g,22+A.rax,19+A.ra+swM,5,8,"#101018");
  px(g,22+A.rax,26+A.ra+swM,5,3,"#1c1c26");
  px(g,fl?25:26,4+swM,1,3,"#d08aff"); px(g,fl?29:25,3+swM,2,2,"#ff2a5a"); // flame licks
  px(g,25,6+swM,1,18,"#5a2fb0"); px(g,31,6+swM,1,18,"#5a2fb0");
  px(g,26,7+swM,1,18,"#2a1a4a"); px(g,27,5+swM,2,20,"#a04aff");
  px(g,28,6+swM,1,19,"#fff"); px(g,29,7+swM,1,16,"#ff2a5a");
  px(g,27,4+swM,2,2,"#fff"); px(g,26,3+swM,4,2,"#d08aff");
  px(g,27,9+swM,1,2,"#fff"); px(g,27,15+swM,1,2,"#ff2a5a");
  px(g,25,24+swM,5,2,"#2a1a4a"); px(g,26,24+swM,3,1,"#ff2a5a");
  // ---- BLACK DEMON MASK: 14 wide, narrow hate-slits, weeping fire ----
  const MX=9+A.hx, MY=7+hb;
  px(g,MX,MY,14,11,"#06060c");
  px(g,MX,MY,14,2,"#000");
  px(g,MX,MY,1,11,"#14141c"); px(g,MX+13,MY,1,11,"#000");
  px(g,MX+1,MY+3,5,1,"#000"); px(g,MX+8,MY+3,5,1,"#000");          // angry brow shadow
  // burning hate-slits: 4x2 deep violet + glow above + 2px white core
  // (on atk the eyes go FULL WHITE-HOT with rage)
  px(g,MX+2,MY+4,4,1,"#7a2bff"); px(g,MX+8,MY+4,4,1,"#7a2bff");
  if(P.atk){
    px(g,MX+2,MY+5,4,2,"#fff"); px(g,MX+8,MY+5,4,2,"#fff");
    px(g,MX+2,MY+5,4,1,"#d08aff"); px(g,MX+8,MY+5,4,1,"#d08aff");
  } else {
    px(g,MX+2,MY+5,4,2,"#5a1ac8"); px(g,MX+8,MY+5,4,2,"#5a1ac8");
    px(g,MX+3,MY+5,2,1,"#fff"); px(g,MX+9,MY+5,2,1,"#fff");
  }
  px(g,MX+2,MY+7,4,1,"#2a0f5a"); px(g,MX+8,MY+7,4,1,"#2a0f5a");     // under-glow
  // long fire-tears weeping down the mask (voidstalker signature), clear of eyes
  px(g,MX+3,MY+8,1,5,"#7a2bff"); px(g,MX+3,MY+8,1,1,"#fff"); px(g,MX+3,MY+12,1,1,"#ff2a5a");
  px(g,MX+10,MY+8,1,5,"#7a2bff"); px(g,MX+10,MY+8,1,1,"#fff"); px(g,MX+10,MY+12,1,1,"#ff2a5a");
  // third eye: vertical blaze slit (voidstalker echo), red + white heart
  px(g,MX+6,MY+1,2,4,"#7a0f24"); px(g,MX+6,MY+1,2,4,"#ff2a5a");
  px(g,MX+6,MY+2,2,2,"#ffd0e0"); px(g,MX+6,MY+2,1,1,"#fff");
  // narrower cruel grin: 8 wide, 4 teeth, blood corners
  px(g,MX+3,MY+13,8,2,"#000");
  for(let x=0;x<8;x+=2){ px(g,MX+3+x,MY+13,1,1,"#fff"); }
  px(g,MX+5,MY+14,1,1,"#e8e0d0"); px(g,MX+8,MY+14,1,1,"#e8e0d0");
  px(g,MX+2,MY+13,1,2,"#ff2a5a"); px(g,MX+11,MY+13,1,2,"#ff2a5a");
  px(g,MX+1,MY+10,1,2,"#23232f"); px(g,MX+12,MY+10,1,2,"#23232f"); // scars
}

const prev = window.Sprites.actor;
const cache = new Map();
try{ (window.__spriteCacheResets=window.__spriteCacheResets||[]).push(()=>cache.clear()); }catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if(kind==="peter_the_fallen"){
    let P=null,bk="";
    try{ if(window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph); } else P=window.Anim.normP(null); } }catch(e){ P={f:0,atk:false,t:0}; }
    const ck="PETERF|"+(tint||"#fff")+"|"+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=document.createElement("canvas"); c.width=32; c.height=40;
    const g=c.getContext("2d"); g.imageSmoothingEnabled=false; g.clearRect(0,0,32,40);
    try{ peter(g,tint||"#fff",P); }catch(e){}
    let out=c; try{ out=window.Sprites.genderFX(c,""); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>400) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
window.__peterFinalLoaded = true;
})();
