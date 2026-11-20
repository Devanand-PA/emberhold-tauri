/* src/sprites/sprite_goddess_bar.js — GODDESS/PETER BAR REALISM PASS (18 sprites).
 * Outermost wrapper. Loaded AFTER sprite_boss_realism.js. Passes goddess/peter through.
 * Bar: aura+shadow+sparkles, ~120-150 rects, 1px highlights/shading, detailed face
 * (eyes with catchlights, blush, mouth), texture rows, jewelry/weapons, pose-aware.
 */
(function(){
"use strict";
function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x|0,y|0,w|0,h|0); }
function shade(hex,amt){
  const n=parseInt(String(hex).slice(1),16); if(isNaN(n)) return hex;
  let r=(n>>16)+amt, gg=((n>>8)&255)+amt, b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r)); gg=Math.max(0,Math.min(255,gg)); b=Math.max(0,Math.min(255,b));
  return "#"+((r<<16)|(gg<<8)|b).toString(16).padStart(6,"0");
}
function cv(){ const c=document.createElement("canvas"); c.width=32; c.height=40; return c; }
function auraShadow(g,hb,c1,c2){
  g.fillStyle=c1; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle=c2; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
}
function spark(g,a,b,c){ px(g,a[0],a[1],1,1,a[2]); px(g,b[0],b[1],1,1,b[2]); px(g,c[0],c[1],1,1,c[2]); }
function P_of(ph){ try{ return window.Anim.normP(ph); }catch(e){ return {f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; } }
function A_of(P){ try{ return window.Anim.limb(P); }catch(e){ return {lx:0,rx:0,ld:0,rd:0,lax:0,rax:0,la:0,ra:0,hx:0}; } }
function Hb_of(P){ try{ return window.Anim.hbob(P); }catch(e){ return 0; } }
function Sg(P,i,a){ try{ return window.Anim.seg(P,i,a||1); }catch(e){ return 0; } }
const D = {};

/* ============ 1. HARPY MATRIARCH v6 — storm-crone queen (goddess bar) ============ */
D.harpy_matriarch = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const feather=tint&&tint!=="#ffffff"?tint:"#9a6ac9";
  const dk=shade(feather,-45), deep=shade(feather,-75), lite=shade(feather,30), pale=shade(feather,58);
  const skin="#f2c9a0", skinD="#c98a5a", skinL="#fff2e0";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const hair="#3a2a1a";
  auraShadow(g,hb,"rgba(170,120,230,0.22)","rgba(201,167,255,0.12)");
  spark(g,[3,18,lite],[28,14,"#fff"],[25,33,lite]);
  // GREAT WINGS: layered sails with pale rims + feather separations
  const W=P.atk?-4:(P.moving?[0,-3,0,2][P.f&3]:0);
  const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?12:20,22+W); g.rotate(s<0?WA:-WA); g.translate(s<0?-12:-20,-22-W);
    g.fillStyle=s<0?"#7a3aaa":"#7a3aaa";
    g.beginPath(); if(s<0){ g.moveTo(12,23+W); g.lineTo(0,3+W); g.lineTo(2,13+W); g.lineTo(5,10+W); g.lineTo(9,20+W); } else { g.moveTo(20,23+W); g.lineTo(32,3+W); g.lineTo(30,13+W); g.lineTo(27,10+W); g.lineTo(23,20+W); } g.fill();
    g.fillStyle="#b48ae0";
    g.beginPath(); if(s<0){ g.moveTo(11,22+W); g.lineTo(2,6+W); g.lineTo(4,13+W); g.lineTo(7,12+W); g.lineTo(9,20+W); } else { g.moveTo(21,22+W); g.lineTo(30,6+W); g.lineTo(28,13+W); g.lineTo(25,12+W); g.lineTo(23,20+W); } g.fill();
    g.restore();
  }
  px(g,0,3+W,3,10,"#e0ccff"); px(g,29,3+W,3,10,"#e0ccff");
  px(g,1,5+W,2,7,"#fff"); px(g,29,5+W,2,7,"#fff");
  px(g,2,11+W,3,6,"#c9a7ff"); px(g,27,11+W,3,6,"#c9a7ff");
  px(g,3,16+W,3,4,lite); px(g,26,16+W,3,4,lite);
  px(g,0,7+W,2,4,"#fff"); px(g,30,7+W,2,4,"#fff");
  px(g,4,11+W,1,8,dk); px(g,27,11+W,1,8,dk);
  px(g,1,4+W,3,2,"#fff"); px(g,28,4+W,3,2,"#fff");
  // talon legs: scaled shins + splayed talons
  px(g,11+A.lx,28+A.ld,3,6,skin); px(g,18+A.rx,28+A.rd,3,6,skin);
  px(g,11+A.lx,28+A.ld,1,6,skinD); px(g,20+A.rx,28+A.rd,1,6,skinD);
  px(g,11+A.lx,30+A.ld,1,4,"#e8b890"); px(g,19+A.rx,30+A.rd,1,4,"#e8b890");
  px(g,10+A.lx,34+A.ld,5,2,"#3a2a1a"); px(g,17+A.rx,34+A.rd,5,2,"#3a2a1a");
  px(g,9+A.lx,34+A.ld,2,2,"#1a1410"); px(g,13+A.lx,34+A.ld,2,2,"#1a1410"); px(g,18+A.rx,34+A.rd,2,2,"#1a1410"); px(g,21+A.rx,34+A.rd,2,2,"#1a1410");
  px(g,10+A.lx,34+A.ld,1,1,"#8a6a4a"); px(g,18+A.rx,34+A.rd,1,1,"#8a6a4a");
  // feather skirt: layered + gold sash + jewel
  px(g,10,23,12,6,feather); px(g,10,23,12,1,lite); px(g,10,27,12,2,dk);
  px(g,10,23,1,6,deep); px(g,21,23,1,6,deep);
  for(let i=0;i<4;i++){ px(g,10+i*3,26,2,3,dk); px(g,10+i*3,26,1,1,lite); px(g,11+i*3,27,1,1,pale); }
  px(g,12,25,8,2,gold); px(g,12,25,8,1,goldL); px(g,12,26,8,1,goldD);
  px(g,15,25,2,2,"#c93b3b"); px(g,16,25,1,1,"#fff");
  // torso: skin + feather bodice with weave + trim
  px(g,11,15,10,9,skin); px(g,11,15,1,9,skinD); px(g,20,15,1,9,skinD);
  px(g,11,15,10,1,skinL); px(g,11,22,10,2,skinD);
  px(g,11,18,10,4,feather); px(g,11,18,10,1,lite); px(g,11,21,10,1,dk);
  px(g,12,19,8,2,"#b48ae0"); px(g,12,19,1,1,pale); px(g,19,19,1,1,pale);
  px(g,13,16,2,2,skinD); px(g,17,16,2,2,skinD);
  // arms: feathered + skin hands + talon nails
  px(g,6+A.lax,17+A.la,4,8,feather); px(g,6+A.lax,17+A.la,1,8,lite); px(g,9+A.lax,17+A.la,1,8,dk);
  px(g,6+A.lax,24+A.la,4,2,skin); px(g,6+A.lax,25+A.la,1,1,"#fff");
  px(g,7+A.lax,26+A.la,2,2,"#e8e0d0"); px(g,7+A.lax,26+A.la,1,1,"#fff");
  px(g,22+A.rax,17+A.ra,4,8,feather); px(g,24+A.rax,17+A.ra,1,8,lite); px(g,22+A.rax,17+A.ra,1,8,deep);
  px(g,22+A.rax,24+A.ra,4,2,skin); px(g,25+A.rax,24+A.ra,1,1,"#fff");
  // birdcage staff (rises on atk): wood + gold cage + light
  const st=P.atk?-4:0;
  px(g,25+A.rax,12+A.ra+st,2,14,"#5a3a22"); px(g,25+A.rax,12+A.ra+st,1,14,"#a97648");
  px(g,25+A.rax,16+A.ra+st,2,1,goldD); px(g,25+A.rax,20+A.ra+st,2,1,goldD);
  px(g,23+A.rax,8+A.ra+st,6,7,"#8a5a33"); px(g,23+A.rax,8+A.ra+st,6,1,"#c9a06a");
  px(g,24+A.rax,9+A.ra+st,4,5,gold); px(g,24+A.rax,9+A.ra+st,4,1,goldL);
  px(g,25+A.rax,10+A.ra+st,2,3,"#fff2b0"); px(g,25+A.rax,10+A.ra+st,1,1,"#fff");
  px(g,23+A.rax,8+A.ra+st,1,7,goldL); px(g,28+A.rax,8+A.ra+st,1,7,goldD);
  // head: aged beauty, gold eyes + red liner, beak-nose, song mouth
  px(g,11+A.hx,7+hb,10,9,skin); px(g,11+A.hx,7+hb,10,1,skinL); px(g,11+A.hx,14+hb,10,2,skinD);
  px(g,11+A.hx,7+hb,1,9,skinD); px(g,20+A.hx,7+hb,1,9,skinD);
  px(g,11+A.hx,9+hb,10,1,"#f7d9b0");
  px(g,12+A.hx,10+hb,3,1,"#3a2018"); px(g,17+A.hx,10+hb,3,1,"#3a2018");
  px(g,12+A.hx,11+hb,3,2,"#f6d34e"); px(g,17+A.hx,11+hb,3,2,"#f6d34e");
  px(g,12+A.hx,11+hb,3,1,"#d8a018"); px(g,17+A.hx,11+hb,3,1,"#d8a018");
  px(g,13+A.hx,11+hb,1,2,"#5a3208"); px(g,18+A.hx,11+hb,1,2,"#5a3208");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,12+A.hx,13+hb,3,1,"#c93b3b"); px(g,17+A.hx,13+hb,3,1,"#c93b3b");
  px(g,11+A.hx,9+hb,1,3,"#5a3a2a"); px(g,20+A.hx,9+hb,1,3,"#5a3a2a");
  px(g,12+A.hx,13+hb,2,1,"#f0a090"); px(g,18+A.hx,13+hb,2,1,"#f0a090");
  px(g,14+A.hx,13+hb,3,2,"#d9a06b"); px(g,15+A.hx,14+hb,1,1,"#8a5a33");
  px(g,14+A.hx,15+hb+(P.atk?1:0),4,2,"#8a1a2a"); px(g,15+A.hx,15+hb+(P.atk?1:0),2,1,"#ff6a7a");
  px(g,14+A.hx,15+hb,1,1,"#fff"); px(g,17+A.hx,15+hb,1,1,"#fff");
  // hair curtains + gray streaks
  px(g,8+A.hx,5+hb,3,12,hair); px(g,21+A.hx,5+hb,3,12,hair);
  px(g,8+A.hx,5+hb,1,12,"#5a3a22"); px(g,23+A.hx,5+hb,1,12,"#5a3a22");
  px(g,9+A.hx,7+hb,1,6,"#8a8078"); px(g,22+A.hx,7+hb,1,6,"#8a8078");
  px(g,9+A.hx,4+hb,14,4,hair); px(g,10+A.hx,4+hb,12,1,"#5a3a22");
  // NEST CROWN: twigs + 3 eggs + feather + gold
  px(g,9+A.hx,1+hb,14,4,"#5a3a22"); px(g,9+A.hx,1+hb,14,1,"#8a5a33"); px(g,9+A.hx,4+hb,14,1,"#3a2412");
  px(g,10+A.hx,0+hb,3,3,"#e8e0d0"); px(g,10+A.hx,0+hb,1,1,"#fff"); px(g,11+A.hx,1+hb,1,1,"#9a968a");
  px(g,14+A.hx,0+hb,3,3,"#7fd4ff"); px(g,14+A.hx,0+hb,1,1,"#fff"); px(g,15+A.hx,1+hb,1,1,"#2a7a9a");
  px(g,18+A.hx,0+hb,3,3,"#e8c9a0"); px(g,18+A.hx,0+hb,1,1,"#fff");
  px(g,22+A.hx,2+hb,3,3,lite); px(g,22+A.hx,2+hb,1,1,"#fff");
  px(g,9+A.hx,2+hb,1,2,gold); px(g,22+A.hx,0+hb,1,1,goldL);
};

/* ============ 2. KAPPA KING v6 — SLIM river lord (too-fat fixed) ============ */
D.kappa_king = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#3a9a5a", dk=shade(skin,-38), deep=shade(skin,-68), lite=shade(skin,32), pale=shade(skin,58);
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  auraShadow(g,hb,"rgba(60,180,110,0.20)","rgba(127,212,255,0.10)");
  spark(g,[3,22,"#7fd4ff"],[28,16,"#fff"],[26,33,"#7fd4ff"]);
  // sashimono war-flag (slim pole behind)
  const sw=P.moving?((P.f&1)?1:-1):0;
  px(g,24,0,2,18,"#3a2a1a"); px(g,24,0,1,18,"#5a4a3a"); px(g,24,0,2,2,gold); px(g,24,0,1,1,goldL);
  px(g,22,1,10,8,"#1a5a6a"); px(g,22,1,10,1,"#fff"); px(g,22,8,10,1,gold); px(g,22,1,2,8,gold); px(g,30,1,2,8,gold);
  px(g,23,3,8,4,"#7fd4ff"); px(g,24,4,6,2,"#fff"); px(g,24,4,6,1,"#bfe8ff");
  px(g,25+sw,3,3,3,"#c93b3b"); px(g,26+sw,4,1,1,"#fff"); px(g,26+sw,5,1,1,"#ff8a8a");
  // SLIM legs: narrow + webbed feet + claws (was 22 wide, now 14)
  px(g,11+A.lx,30+A.ld,4,5,skin); px(g,17+A.rx,30+A.rd,4,5,skin);
  px(g,11+A.lx,30+A.ld,1,5,lite); px(g,20+A.rx,30+A.rd,1,5,deep);
  px(g,11+A.lx,32+A.ld,1,3,"#2a5a3a"); px(g,19+A.rx,32+A.rd,1,3,"#2a5a3a");
  px(g,10+A.lx,34+A.ld,5,2,"#2a4a3a"); px(g,17+A.rx,34+A.rd,5,2,"#2a4a3a");
  px(g,10+A.lx,34+A.ld,5,1,"#4a6a5a"); px(g,17+A.rx,34+A.rd,5,1,"#4a6a5a");
  px(g,10+A.lx,34+A.ld,1,2,"#9adcff"); px(g,14+A.lx,34+A.ld,1,2,"#9adcff"); px(g,18+A.rx,34+A.rd,1,2,"#9adcff");
  // SLIM torso: 14 wide athletic (was 22), scale abs, mawashi, kelp
  px(g,9,19,14,13,skin); px(g,9,19,14,2,lite); px(g,9,30,14,2,dk);
  px(g,9,19,2,13,deep); px(g,21,19,2,13,deep);
  px(g,11,21,3,4,"#2a7a3a"); px(g,18,21,3,4,"#2a7a3a"); px(g,11,21,1,2,pale); px(g,18,21,1,2,pale);
  px(g,13,22,6,2,"#4a8a4a"); px(g,14,23,4,1,"#6ad88a");
  for(let y=20;y<30;y+=3) px(g,15,y,1,2,"rgba(0,0,0,0.18)");
  px(g,9,24,14,4,"#1a1a24"); px(g,9,24,14,1,"#3a3a4a");
  px(g,13,24,6,4,gold); px(g,13,24,6,1,goldL); px(g,13,27,6,1,goldD);
  px(g,14,25,4,2,"#c93b3b"); px(g,15,26,1,1,"#fff"); px(g,15,25,2,1,"#ff8a8a");
  // shell back plates (narrow)
  px(g,5,17,4,11,"#5a3a22"); px(g,5,17,4,1,"#8a5a33"); px(g,5,20,4,2,gold);
  px(g,23,17,4,11,"#5a3a22"); px(g,23,17,4,1,"#8a5a33"); px(g,23,20,4,2,gold);
  px(g,5,17,1,11,"#7a5233"); px(g,26,17,1,11,"#3a2412");
  // arms: lean + webbed claws
  px(g,6+A.lax,19+A.la,3,8,skin); px(g,6+A.lax,19+A.la,1,8,lite); px(g,8+A.lax,19+A.la,1,8,deep);
  px(g,5+A.lax,26+A.la,4,3,"#9adcff"); px(g,5+A.lax,26+A.la,4,1,"#fff"); px(g,5+A.lax,27+A.la,1,2,"#2a7a9a");
  const tw=P.atk?-5:0;
  px(g,23+A.rax,19+A.ra+tw,3,8,skin); px(g,23+A.rax,19+A.ra+tw,1,8,lite);
  px(g,23+A.rax,26+A.ra+tw,4,3,"#9adcff"); px(g,23+A.rax,26+A.ra+tw,4,1,"#fff");
  // tide trident (stabs on atk): shaft + 3 prongs + sea jewel
  px(g,24+A.rax,6+A.ra+tw,2,20,"#8a5a33"); px(g,24+A.rax,6+A.ra+tw,1,20,"#c9a06a");
  px(g,24+A.rax,12+A.ra+tw,2,1,"#3a2412"); px(g,24+A.rax,18+A.ra+tw,2,1,"#3a2412");
  px(g,22+A.rax,2+A.ra+tw,6,4,"#7fd4ff"); px(g,22+A.rax,2+A.ra+tw,6,1,"#fff"); px(g,22+A.rax,5+A.ra+tw,6,1,"#2a7a9a");
  px(g,22+A.rax,2+A.ra+tw,1,4,"#7fd4ff"); px(g,24+A.rax,1+A.ra+tw,2,5,"#7fd4ff"); px(g,26+A.rax,2+A.ra+tw,1,4,"#7fd4ff");
  px(g,24+A.rax,1+A.ra+tw,1,1,"#fff"); px(g,23+A.rax,13+A.ra+tw,4,3,"#2a5a3a"); px(g,24+A.rax,14+A.ra+tw,2,1,"#4a8a4a");
  // head: beak, gold eyes, dish with water
  px(g,10+A.hx,9+hb,12,10,skin); px(g,10+A.hx,9+hb,12,2,lite); px(g,10+A.hx,17+hb,12,2,dk);
  px(g,10+A.hx,9+hb,2,10,deep); px(g,20+A.hx,9+hb,2,10,deep);
  px(g,13+A.hx,14+hb+(P.atk?1:0),6,4,"#e8d9a0"); px(g,13+A.hx,14+hb,6,1,"#fff"); px(g,14+A.hx,15+hb+(P.atk?1:0),2,2,"#fff"); px(g,16+A.hx,15+hb,2,2,gold);
  px(g,14+A.hx,16+hb,4,1,"#8a6a3a");
  px(g,12+A.hx,11+hb,3,3,"#ffe14d"); px(g,18+A.hx,11+hb,3,3,"#ffe14d");
  px(g,12+A.hx,11+hb,3,1,"#fff2b0"); px(g,18+A.hx,11+hb,3,1,"#fff2b0");
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,19+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,11+A.hx,10+hb,4,1,"#1e5a2e"); px(g,17+A.hx,10+hb,4,1,"#1e5a2e");
  px(g,9+A.hx,12+hb,2,2,gold); px(g,9+A.hx,12+hb,1,1,goldL);
  px(g,9+A.hx,3+hb,14,4,gold); px(g,9+A.hx,3+hb,14,1,goldL); px(g,9+A.hx,6+hb,14,1,goldD);
  px(g,10+A.hx,4+hb,12,2,"#7fd4ff"); px(g,11+A.hx,4+hb,3,1,"#fff"); px(g,17+A.hx,4+hb,4,1,"#2a9ac9"); px(g,18+A.hx,4+hb,2,1,"#bfe8ff");
  px(g,12+A.hx,1+hb,8,2,gold); px(g,12+A.hx,1+hb,8,1,goldL);
  // side fins (kappa ears)
  px(g,6+A.hx,13+hb,4,4,"#2a7a3a"); px(g,6+A.hx,13+hb,4,1,"#6ad88a");
  px(g,22+A.hx,13+hb,4,4,"#2a7a3a"); px(g,22+A.hx,13+hb,4,1,"#6ad88a");
};

/* ============ 3. NAGA RAJA v6 ============ */
D.naga_raja = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const coil=tint&&tint!=="#ffffff"?tint:"#2a8a5a";
  const dk=shade(coil,-42), deep=shade(coil,-72), lite=shade(coil,32), pale=shade(coil,58);
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#e8c9a0", skinD="#b88a5a";
  auraShadow(g,hb,"rgba(60,200,120,0.22)","rgba(255,217,61,0.10)");
  spark(g,[3,22,"#7dff9b"],[28,16,"#fff"],[26,33,"#7dff9b"]);
  const sw=Sg(P,0,1), sw2=Sg(P,2,1);
  // coil mound: stacked + scale rows + gold bands + jewels
  px(g,5,29,22,7,deep); px(g,6,30,20,5,coil); px(g,6,30,20,1,lite); px(g,6,34,20,2,dk);
  for(let x=7;x<25;x+=3){ px(g,x,31,2,2,dk); px(g,x,31,1,1,lite); }
  px(g,7,32,6,2,gold); px(g,7,32,6,1,goldL); px(g,8,32,1,1,"#fff");
  px(g,15,33,6,2,"#c93b3b"); px(g,15,33,6,1,"#ff8a8a"); px(g,16,33,1,1,"#fff");
  px(g,9,27,14,4,coil); px(g,9,27,14,1,lite); px(g,9,30,14,1,dk);
  px(g,9,27,2,4,deep); px(g,21,27,2,4,deep);
  px(g,10,28,4,2,gold); px(g,10,28,1,1,goldL); px(g,18,28,4,2,gold); px(g,19,28,1,1,goldL);
  px(g,13,29,6,1,goldD);
  // 4 arms: scaled + bangles + weapons
  px(g,3,18+sw,4,8,coil); px(g,3,18+sw,1,8,lite); px(g,6,18+sw,1,8,deep);
  px(g,2,24+sw,5,3,gold); px(g,2,24+sw,5,1,goldL); px(g,3,24+sw,1,1,"#fff");
  px(g,25,18+sw2,4,8,coil); px(g,27,18+sw2,1,8,lite);
  const sl=P.atk?-3:0;
  px(g,25,22+sw2+sl,4,6,"#8a5a33"); px(g,25,22+sw2+sl,1,6,"#c9a06a");
  px(g,24,20+sw2+sl,6,2,"#d9c27f"); px(g,24,20+sw2+sl,6,1,"#fff"); px(g,24,21+sw2+sl,6,1,goldD);
  px(g,3,24+sw,5,2,"#c9ccd4"); px(g,3,24+sw,5,1,"#fff"); px(g,3,24+sw,1,1,"#fff");
  px(g,6,20+sw2,3,7,coil); px(g,6,20+sw2,1,7,lite); px(g,22,20+sw,3,7,coil); px(g,24,20+sw,1,7,lite);
  px(g,6,25+sw2,3,3,gold); px(g,6,25+sw2,1,1,"#fff"); px(g,22,25+sw,3,3,"#7fd4ff"); px(g,22,25+sw,1,1,"#fff");
  // torso: royal cuirass + gold + emerald heart
  px(g,10,15,12,13,coil); px(g,10,15,12,2,lite); px(g,10,26,12,2,dk);
  px(g,10,15,2,13,deep); px(g,20,15,2,13,deep);
  px(g,11,17,10,8,"#d9b96a"); px(g,11,17,10,1,"#f2e0a0"); px(g,11,23,10,2,goldD);
  px(g,12,18,8,6,"#8a6a2a"); px(g,13,19,6,4,"#c93b3b"); px(g,14,20,4,3,"#ff6a6a");
  px(g,14,19,4,1,"#ff8a8a"); px(g,15,20,1,1,"#fff"); px(g,16,20,1,1,"#fff");
  px(g,12,24,8,1,gold); px(g,12,24,8,1,goldL);
  // FIVE-HEAD HOOD: fan + 5 heads with eyes/fangs/gold
  px(g,2,4,28,11,coil); px(g,2,4,28,2,lite); px(g,2,13,28,2,dk);
  px(g,2,4,3,11,dk); px(g,27,4,3,11,dk); px(g,2,4,1,11,pale); px(g,29,4,1,11,pale);
  for(let i=0;i<5;i++){
    const hx=3+i*5, wob=((i&1)?sw:sw2);
    px(g,hx+wob,6,4,7,coil); px(g,hx+wob,6,4,1,lite); px(g,hx+wob,12,4,1,dk);
    px(g,hx+wob,7,4,2,pale); px(g,hx+wob,7,1,1,"#fff");
    px(g,hx+1+wob,8,1,2,"#111"); px(g,hx+2+wob,8,1,2,"#111");
    px(g,hx+1+wob,7,1,1,"#fff");
    px(g,hx+wob,10,1,2,"#fff"); px(g,hx+3+wob,10,1,2,"#fff");
    px(g,hx+wob,12,4,1,gold); px(g,hx+wob,12,1,1,goldL);
  }
  // central royal face
  px(g,12,11,8,7,skin); px(g,12,11,8,1,"#fff2e0"); px(g,12,16,8,2,skinD);
  px(g,12,11,1,7,skinD); px(g,19,11,1,7,skinD);
  px(g,12,12,2,1,"#ffb0a0"); px(g,18,12,2,1,"#ffb0a0");
  px(g,13,13,2,2,"#ffe14d"); px(g,17,13,2,2,"#ffe14d");
  px(g,13,13,1,2,"#111"); px(g,17,13,1,2,"#111");
  px(g,13,13,1,1,"#fff"); px(g,17,13,1,1,"#fff");
  px(g,14,16,4,1,"#7a1f1f"); px(g,14,16,1,1,"#fff"); px(g,17,16,1,1,"#fff"); px(g,15,16,2,1,"#ff8a8a");
  // crown: gold band + ruby + halo glints
  px(g,12,8,8,3,gold); px(g,12,8,8,1,goldL); px(g,12,10,8,1,goldD);
  px(g,15,8,2,2,"#c93b3b"); px(g,15,8,1,1,"#fff");
  px(g,11,7,2,2,gold); px(g,19,7,2,2,gold);
  // hood edge emblems
  px(g,0,12,2,9,gold); px(g,0,12,2,2,goldL); px(g,30,12,2,9,"#c9ccd4"); px(g,30,12,2,2,"#fff");
  px(g,0,14,1,3,"#fff"); px(g,30,14,1,3,"#7fd4ff");
};

/* ============ 4. SCORPION EMPEROR v6 ============ */
D.scorpion_emperor = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const shell=tint&&tint!=="#ffffff"?tint:"#c89820";
  const dk=shade(shell,-48), deep=shade(shell,-78), lite=shade(shell,32), pale=shade(shell,58);
  const gold="#ffd93d", goldL="#fff2b0";
  auraShadow(g,hb,"rgba(220,180,60,0.24)","rgba(125,255,155,0.12)");
  spark(g,[3,22,"#7dff9b"],[28,16,"#fff"],[26,33,gold]);
  const tw=Sg(P,0,1), tw2=Sg(P,1,1);
  g.fillStyle="rgba(125,255,155,0.30)"; g.beginPath(); g.arc(23,3+tw2,6,0,7); g.fill();
  // tail tower: segments with crowns + jewel bands
  px(g,3,22,5,6,dk); px(g,4,21,5,2,shell); px(g,4,21,5,1,lite); px(g,3,22,5,1,gold);
  px(g,6,16,6,6,shell); px(g,6,16,6,1,goldL); px(g,6,21,6,1,dk); px(g,6,16,1,6,deep);
  px(g,9,11,6,6,shell); px(g,9,11,6,1,goldL); px(g,9,16,6,1,dk); px(g,9,11,1,6,deep);
  px(g,12,7,6,5,dk); px(g,13,7,4,4,shell); px(g,13,7,4,1,goldL); px(g,13,7,1,4,deep);
  px(g,16,4+tw,6,5,shell); px(g,16,4+tw,6,1,"#fff"); px(g,16,8+tw,6,1,dk); px(g,16,4+tw,1,5,deep);
  px(g,20,2+tw2,5,5,dk); px(g,21,2+tw2,3,4,shell); px(g,21,2+tw2,3,1,goldL);
  px(g,7,17,4,2,gold); px(g,10,12,4,2,gold); px(g,13,8,4,1,gold); px(g,17,5+tw,4,1,gold);
  px(g,7,17,1,1,"#fff"); px(g,10,12,1,1,"#fff");
  // sting: black bulb + venom + glint + drip
  px(g,21,0+tw2,5,3,"#1a1a1a"); px(g,21,0+tw2,5,1,gold); px(g,21,0+tw2,1,3,"#3a3a3a");
  px(g,22,1+tw2+(P.atk?1:0),3,2,"#7dff9b"); px(g,22,1+tw2,3,1,"#d0ffd0"); px(g,23,2+tw2,1,1,"#fff");
  if(P.atk) px(g,23,3+tw2,1,2,"#7dff9b");
  // body: armored + plates + keel + legs
  const hv=P.moving?[0,-1,0,1][P.f&3]:0;
  px(g,4,25+hv,22,8,dk); px(g,5,26+hv,20,6,shell);
  px(g,5,26+hv,20,2,goldL); px(g,5,26+hv,20,1,"#fff");
  px(g,5,30+hv,20,2,dk);
  for(let i=0;i<5;i++){ px(g,7+i*4,28+hv,2,4,lite); px(g,7+i*4,28+hv,1,1,"#fff"); px(g,8+i*4,28+hv,1,4,deep); }
  px(g,5,25+hv,20,1,gold);
  // 6 legs (3 per side, scuttle)
  const lg=P.moving?[0,1,0,-1][P.f&3]:0;
  px(g,4,29+hv+lg,3,3,dk); px(g,25,29+hv-lg,3,3,dk);
  px(g,4,31+hv+lg,2,1,lite); px(g,26,31+hv-lg,2,1,lite);
  // middle leg pairs ripple in a travelling wave while walking (outer pair scuttles above)
  if(P.moving){ const MX=[8,12,17,21]; for(let i=0;i<4;i++){ px(g,MX[i],31+hv+([0,-1,-2,-1][(P.f+i)&3]),3,2,dk); } }
  else { px(g,8,31+hv,3,2,dk); px(g,12,31+hv,3,2,dk); px(g,17,31+hv,3,2,dk); px(g,21,31+hv,3,2,dk); }
  // head + red eyes + fangs + crown
  px(g,22,23,5,7,shell); px(g,22,23,5,1,goldL); px(g,22,28,5,2,dk); px(g,22,23,1,7,deep);
  px(g,23,25,2,2,"#ff3b3b"); px(g,23,25,2,1,"#ff8a8a"); px(g,23,25,1,1,"#fff");
  px(g,26,25,1,2,"#ff3b3b"); px(g,26,25,1,1,"#fff");
  px(g,23,28,3,1,"#e8e0d0"); px(g,23,28,1,1,"#fff");
  px(g,21,18,7,2,gold); px(g,21,18,7,1,goldL);
  g.fillStyle=gold; g.beginPath(); g.arc(24,15,3,0,7); g.fill();
  g.fillStyle="#ff9d2e"; g.beginPath(); g.arc(24,15,1.5,0,7); g.fill();
  g.fillStyle="#fff"; g.fillRect(23,13,1,1); g.fillRect(24,14,1,1);
  // crusher claws
  const sn=P.atk?2:0;
  px(g,24,20-sn,6,7,dk); px(g,25,19-sn,4,6,shell); px(g,25,19-sn,4,1,goldL); px(g,25,19-sn,1,6,deep);
  px(g,25,22-sn,2,2,dk); px(g,28,22-sn,2,2,dk);
  px(g,25,24-sn,4,3,"#fff"); px(g,26,24-sn,2,2,"#e8e0d0"); px(g,26,19-sn,2,2,gold); px(g,26,19-sn,1,1,"#fff");
  px(g,24,20-sn,1,7,"#fff");
};

/* ============ 5. ABYSS SERPENT v6 — deep horror eel ============ */
D.abyss_serpent = (g,tint,ph)=>{
  const P=P_of(ph);
  const deep=tint&&tint!=="#ffffff"?tint:"#1a4a6a";
  const dk=shade(deep,-38), abyss=shade(deep,-68), lite=shade(deep,32), pale=shade(deep,58);
  auraShadow(g,Hb_of(P),"rgba(80,160,220,0.20)","rgba(80,160,220,0.08)");
  spark(g,[3,10,"#9ae8ff"],[28,6,"#fff"],[26,33,"#7ad9f0"]);
  const w0=Sg(P,0,1), w1=Sg(P,1,1), w2=Sg(P,2,1);
  // long coiled body: 3 stacked loops + scale rows + glow spots
  px(g,4+w0,28,22,7,abyss); px(g,5+w0,28,20,2,deep); px(g,5+w0,33,20,2,abyss);
  for(let x=6;x<24;x+=3){ px(g,x+w0,29,2,3,deep); px(g,x+w0,29,1,1,lite); px(g,x+w0,31,1,1,dk); }
  px(g,6+w0,29,2,2,"#9ae8ff"); px(g,12+w0,30,2,2,"#7ad9f0"); px(g,18+w0,29,1,1,"#fff");
  px(g,8+w1,24,16,5,deep); px(g,8+w1,24,16,1,lite); px(g,8+w1,28,16,1,dk);
  for(let x=9;x<22;x+=3){ px(g,x+w1,25,1,2,dk); px(g,x+w1,25,1,1,pale); }
  // dorsal fin rays + translucent membrane
  px(g,6+w1,20,2,5,"#0a2a3a"); px(g,9+w1,19,2,6,"#0a2a3a"); px(g,12+w1,19,2,6,"#7ad9f0"); px(g,15+w1,20,2,5,"#0a2a3a");
  px(g,6+w1,20,2,1,"#bfe8ff"); px(g,12+w1,19,2,1,"#fff");
  px(g,7+w1,22,10,2,"rgba(122,217,240,0.5)");
  // neck rising + head
  px(g,20+w2,14,7,13,deep); px(g,20+w2,14,2,13,abyss); px(g,25+w2,14,2,13,abyss);
  px(g,20+w2,14,7,2,lite); px(g,20+w2,24,7,2,dk);
  px(g,21+w2,16,2,6,"#0a1a24"); px(g,24+w2,16,2,6,"#0a1a24");
  for(let y=15;y<24;y+=2) px(g,22+w2,y,3,1,"rgba(255,255,255,0.18)");
  // angler lure: stalk + glowing bulb + halo
  px(g,18+w2,8,2,7,"#0a2a3a"); px(g,18+w2,8,1,7,"#3a6a8a");
  g.fillStyle="rgba(154,232,255,0.35)"; g.beginPath(); g.arc(19+w2,6,4,0,7); g.fill();
  px(g,17+w2,4,4,4,"#bfe8ff"); px(g,17+w2,4,4,1,"#fff"); px(g,18+w2,5,2,2,"#fff");
  // head face: armored brow + glowing cyan eyes + fanged jaw
  px(g,19+w2,10,9,8,deep); px(g,19+w2,10,9,1,lite); px(g,19+w2,16,9,2,dk);
  px(g,19+w2,10,2,8,abyss); px(g,26+w2,10,2,8,abyss);
  px(g,21+w2,11,6,1,"#0a2a3a");
  g.fillStyle="#9ae8ff"; g.fillRect(21+w2,13,3,3); g.fillRect(25+w2,13,2,3);
  g.fillStyle="#111"; g.fillRect(22+w2,14,1,2); g.fillRect(26+w2,14,1,2);
  g.fillStyle="#fff"; g.fillRect(21+w2,13,1,1); g.fillRect(25+w2,13,1,1);
  px(g,20+w2,12,1,2,lite); px(g,27+w2,12,1,2,lite);
  // jaw: upper + lower + teeth + tongue
  px(g,20+w2,17,8,2,"#0a1a24");
  if(!P.atk){ px(g,20+w2,17,8,1,"#1a3a4a"); px(g,22+w2,17,1,1,"#fff"); px(g,25+w2,17,1,1,"#fff"); }
  else{ px(g,20+w2,17,3,4,"#0a1a24"); px(g,25+w2,17,3,4,"#0a1a24"); px(g,21+w2,18,1,2,"#fff"); px(g,26+w2,18,1,2,"#fff"); px(g,22+w2,19,4,1,"#ff6a7a"); }
  px(g,19+w2,18,2,3,"#7ad9f0"); px(g,28+w2,18,2,3,"#7ad9f0");
  // gill slits + side fin
  px(g,20+w2,19,1,3,abyss); px(g,21+w2,19,1,3,abyss);
  px(g,17+w1,26,4,3,"#0a2a3a"); px(g,17+w1,26,4,1,"#7ad9f0");
};

/* ============ 6. ARTERY SERPENT v6 — blood vessel horror ============ */
D.artery_serpent = (g,tint,ph)=>{
  const P=P_of(ph);
  const flesh=tint&&tint!=="#ffffff"?tint:"#b01a2a";
  const dk=shade(flesh,-42), deep=shade(flesh,-72), lite=shade(flesh,34), pale="#ffb0b0";
  auraShadow(g,Hb_of(P),"rgba(255,80,100,0.20)","rgba(255,80,100,0.08)");
  spark(g,[3,26,"#ff8a9a"],[28,18,"#fff"],[26,33,"#ffd0d8"]);
  const w0=Sg(P,0,1), w1=Sg(P,2,1);
  // thick pulsing body + vein texture + pulse nodes
  px(g,4+w0,29,22,5,deep); px(g,5+w0,29,20,1,lite); px(g,5+w0,32,20,2,deep);
  for(let x=6;x<24;x+=4){ px(g,x+w0,30,2,2,"#ff4a6a"); px(g,x+w0,30,1,1,"#fff"); px(g,x+w0,32,2,1,dk); }
  px(g,7+w0,27,2,3,"#ff6a7a"); px(g,7+w0,27,2,1,"#ffd0d8"); px(g,14+w0,27,2,3,"#ffd0d8"); px(g,14+w0,27,2,1,"#fff"); px(g,20+w0,27,2,3,"#ff6a7a");
  // fin ridge (fleshy spikes + membrane)
  px(g,6+w0,25,2,4,dk); px(g,10+w0,24,2,5,dk); px(g,14+w0,24,2,5,"#7a0a20"); px(g,18+w0,25,2,4,dk);
  px(g,6+w0,25,2,1,"#ff8a9a"); px(g,10+w0,24,2,1,"#ff8a9a"); px(g,14+w0,24,2,1,"#fff");
  px(g,6+w0,27,14,2,"rgba(255,138,154,0.5)");
  // neck + head
  px(g,20+w1,14,6,13,flesh); px(g,20+w1,14,2,13,deep); px(g,24+w1,14,2,13,deep);
  px(g,21+w1,15,4,11,"#ff4a6a"); px(g,22+w1,16,2,9,"#ff8a9a");
  px(g,20+w1,14,6,1,lite); px(g,20+w1,25,6,2,dk);
  px(g,18+w1,20,2,7,pale); px(g,26+w1,20,2,7,"#7a0a20");
  // skull ridges + horns
  px(g,19+w1,10,10,8,flesh); px(g,19+w1,10,10,1,lite); px(g,19+w1,16,10,2,dk);
  px(g,17+w1,6,3,5,"#e8e0d0"); px(g,17+w1,6,3,1,"#fff"); px(g,25+w1,6,3,5,"#e8e0d0"); px(g,25+w1,6,3,1,"#fff");
  px(g,17+w1,10,1,2,"#9a968a"); px(g,27+w1,10,1,2,"#9a968a");
  // eyes: gold + slit + catchlight + brow
  g.fillStyle="#fff06a"; g.fillRect(21+w1,13,2,2); g.fillRect(25+w1,13,2,2);
  g.fillStyle="#111"; g.fillRect(21+w1,13,1,2); g.fillRect(25+w1,13,1,2);
  g.fillStyle="#fff"; g.fillRect(21+w1,13,1,1); g.fillRect(25+w1,13,1,1);
  px(g,20+w1,12,4,1,deep); px(g,24+w1,12,4,1,deep);
  // split jaw with fangs + blood
  if(!P.atk){ px(g,21+w1,17,6,1,deep); px(g,22+w1,17,1,1,"#fff"); px(g,25+w1,17,1,1,"#fff"); }
  else{ px(g,20+w1,17,3,4,deep); px(g,24+w1,17,3,4,deep); px(g,21+w1,18,1,2,"#fff"); px(g,25+w1,18,1,2,"#fff"); px(g,22+w1,19,2,2,"#ff2a4a"); }
  px(g,23+w1,19,1,3,"#ff2a4a");
};

/* ============ 7. ASH HOUND v6 ============ */
D.ash_hound = (g,tint,ph)=>{
  const P=P_of(ph); let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const fur=tint&&tint!=="#ffffff"?tint:"#5a4a42";
  const dk=shade(fur,-38), deep=shade(fur,-70), lite=shade(fur,32), pale=shade(fur,55);
  auraShadow(g,Hb_of(P),"rgba(255,120,50,0.16)","rgba(255,120,50,0.07)");
  spark(g,[4,22,"#ff8a3a"],[28,16,"#fff"],[26,32,"#ff8a3a"]);
  const sw=Sg(P,0,1);
  // tail: bushy + ember tip + wag
  px(g,1+sw,20,5,3,fur); px(g,1+sw,20,5,1,lite); px(g,1+sw,22,5,1,dk);
  px(g,0+sw,19,3,3,dk); px(g,0+sw,19,2,1,"#ffd93d"); px(g,0+sw,19,1,1,"#fff");
  px(g,0+sw,21,1,2,deep);
  // body: barrel + back ridge + ember cracks + fur rows + belly
  px(g,6,23,19,8,fur); px(g,6,23,19,2,lite); px(g,6,29,19,2,dk);
  px(g,6,23,3,8,deep); px(g,6,23,1,8,"#3a2e2a");
  for(let x=8;x<23;x+=3){ px(g,x,25,2,3,dk); px(g,x,25,1,1,lite); }
  px(g,8,24,6,2,"rgba(255,255,255,0.20)"); px(g,14,27,2,1,"#ff7b2e"); px(g,18,27,2,1,"#ff9d2e"); px(g,16,28,1,1,"#ffd93d");
  px(g,10,29,4,1,pale); px(g,16,29,4,1,pale);
  // ember spine row
  for(let i=0;i<5;i++){ px(g,7+i*4,21,2,3,"#ff7b2e"); px(g,7+i*4,21,2,1,"#ffd93d"); px(g,7+i*4,21,1,1,"#fff"); }
  // legs: trot + charred paws + claws
  px(g,7+Q.x1,30+Q.d1,3,5,fur); px(g,13+Q.x2,30+Q.d2,3,5,fur); px(g,18+Q.x1,30+Q.d1,3,5,fur); px(g,22+Q.x2,30+Q.d2,3,5,fur);
  px(g,7+Q.x1,30+Q.d1,1,5,lite); px(g,22+Q.x2,30+Q.d2,1,5,deep);
  px(g,7+Q.x1,33+Q.d1,3,2,deep); px(g,13+Q.x2,33+Q.d2,3,2,deep); px(g,18+Q.x1,33+Q.d1,3,2,deep); px(g,22+Q.x2,33+Q.d2,3,2,deep);
  px(g,7+Q.x1,33+Q.d1,1,1,"#e8e0d0"); px(g,22+Q.x2,33+Q.d2,1,1,"#e8e0d0");
  // head: broad + muzzle + ears + ruff
  px(g,22,15,8,10,fur); px(g,22,15,8,2,lite); px(g,22,23,8,2,dk); px(g,22,15,2,10,deep);
  px(g,21,18,3,6,lite); px(g,21,18,3,1,pale); px(g,28,18,2,6,lite);
  px(g,22,13,3,4,fur); px(g,27,13,3,4,fur); px(g,22,13,3,1,lite); px(g,27,13,3,1,lite);
  px(g,23,14,1,2,"#e8b0b0"); px(g,28,14,1,2,"#e8b0b0");
  px(g,27,20,5,4,"#2a1a12"); px(g,27,20,5,1,"#4a2e22");
  px(g,30,21,2,2,"#111"); px(g,30,21,1,1,"#555");
  px(g,28,23,3,1,"#1a0e08"); px(g,29,23,1,1,"#fff");
  // eyes: ember orange + slit + catchlight + brow + scar
  g.fillStyle="#ff8a3a"; g.fillRect(24,18,3,3); g.fillStyle="#111"; g.fillRect(25,19,1,2); g.fillStyle="#fff"; g.fillRect(24,18,1,1);
  px(g,23,17,4,1,deep);
  px(g,24,21,1,1,"#ff7b2e");
  if(P.atk){ px(g,10,21,3,3,deep); px(g,14,20,3,3,deep); }
};

/* ============ 8. ASH MOTHER v6 — brood brute ============ */
D.ash_mother = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const hide=tint&&tint!=="#ffffff"?tint:"#7a5a4a";
  const dk=shade(hide,-42), deep=shade(hide,-72), lite=shade(hide,30), pale=shade(hide,55);
  auraShadow(g,hb,"rgba(255,120,50,0.18)","rgba(255,120,50,0.08)");
  spark(g,[3,10,"#ff7a2a"],[28,10,"#fff"],[26,33,"#ffd93d"]);
  // torn wings
  const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?10:22,18); g.rotate(s<0?WA:-WA); g.translate(s<0?-10:-22,-18);
    g.fillStyle=dk; g.beginPath(); if(s<0){ g.moveTo(10,18); g.lineTo(1,8); g.lineTo(3,14); g.lineTo(6,13); } else { g.moveTo(22,18); g.lineTo(31,8); g.lineTo(29,14); g.lineTo(26,13); } g.fill();
    g.restore();
  }
  px(g,3,10,2,2,"#ff7a2a"); px(g,27,10,2,2,"#ff7a2a"); px(g,3,10,1,1,"#fff"); px(g,27,10,1,1,"#fff");
  px(g,4,12,1,3,deep); px(g,27,12,1,3,deep);
  // legs: pillar + feet
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,9+A.lx,30+A.ld,2,6,"#5a4a3a"); px(g,21+A.rx,30+A.rd,2,6,"#3a2e2a");
  px(g,8+A.lx,35+A.ld,7,2,"#1a1410"); px(g,17+A.rx,35+A.rd,7,2,"#1a1410");
  px(g,8+A.lx,35+A.ld,7,1,"#8a5a33");
  // bulky torso + EGG SACS + ember veins
  px(g,7,18,18,13,hide); px(g,7,18,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,18,2,13,deep); px(g,23,18,2,13,deep);
  px(g,10,24,5,5,"#e8d9c0"); px(g,10,24,5,1,"#fff"); px(g,11,25,3,3,"#ff9a5a"); px(g,12,26,1,1,"#7a1f1f");
  px(g,16,25,5,5,"#e8d9c0"); px(g,16,25,5,1,"#fff"); px(g,17,26,3,3,"#ff7a2a"); px(g,18,27,1,1,"#7a1f1f");
  px(g,12,25,1,1,"#111"); px(g,18,26,1,1,"#111");
  px(g,10,29,3,1,"#ff7a2a"); px(g,19,29,3,1,"#ff7a2a");
  for(let y=20;y<28;y+=3) px(g,14,y,1,2,"rgba(0,0,0,0.20)");
  // arms cradle belly + claws
  px(g,4+A.lax,20+A.la,4,8,hide); px(g,4+A.lax,20+A.la,1,8,lite);
  px(g,24+A.rax,20+A.ra,4,8,hide); px(g,24+A.rax,20+A.ra,1,8,lite);
  px(g,4+A.lax,27+A.la,4,2,dk); px(g,24+A.rax,27+A.ra,4,2,dk);
  // head + ember crown + nursing jaw + glowing eyes
  px(g,10+A.hx,8+hb,12,11,hide); px(g,10+A.hx,8+hb,12,2,lite); px(g,10+A.hx,17+hb,12,2,dk);
  px(g,10+A.hx,8+hb,2,11,deep); px(g,20+A.hx,8+hb,2,11,deep);
  px(g,10+A.hx,8+hb,12,1,"#fff"); px(g,12+A.hx,10+hb,8,1,"#f7d9c0");
  g.fillStyle=hide; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(8+A.hx,3+hb); g.lineTo(12+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(24+A.hx,3+hb); g.lineTo(20+A.hx,8+hb); g.fill();
  px(g,9+A.hx,3+hb,2,2,"#ff7a2a"); px(g,21+A.hx,3+hb,2,2,"#ff7a2a"); px(g,9+A.hx,3+hb,1,1,"#fff");
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,13+hb,3,3); g.fillRect(18+A.hx,13+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,14+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,13+hb,1,1); g.fillRect(18+A.hx,13+hb,1,1);
  px(g,13+A.hx,17+hb,6,1,"#3a2418"); px(g,14+A.hx,18+hb,4,1,"#5a3320");
  px(g,10+A.hx,6+hb,12,1,"#5a4a3a");
};

/* ============ 9. BANDIT v6 — roadwolf outlaw ============ */
D.bandit = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const cloth=tint&&tint!=="#ffffff"?tint:"#8a5a33";
  const dk=shade(cloth,-38), deep=shade(cloth,-70), lite=shade(cloth,30);
  const skin="#d9a06b", skinD="#a06a3a", skinL="#f2c890";
  auraShadow(g,hb,"rgba(200,150,80,0.18)","rgba(255,217,61,0.07)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,lite]);
  // legs: trousers + boots + spurs
  px(g,11+A.lx,28+A.ld,4,6,"#3a2a1a"); px(g,17+A.rx,28+A.rd,4,6,"#3a2a1a");
  px(g,11+A.lx,28+A.ld,1,6,"#5a4a3a"); px(g,20+A.rx,28+A.rd,1,6,"#1a1410");
  px(g,10+A.lx,34+A.ld,6,2,"#111"); px(g,16+A.rx,34+A.rd,6,2,"#111");
  px(g,10+A.lx,34+A.ld,6,1,"#5a4a3a"); px(g,16+A.rx,34+A.rd,6,1,"#5a4a3a");
  // torso: tunic + belt + bandolier + pouch
  px(g,9,18,14,11,cloth); px(g,9,18,14,2,lite); px(g,9,27,14,2,dk);
  px(g,9,18,2,11,deep); px(g,21,18,2,11,deep);
  for(let y=20;y<27;y+=2) px(g,11,y,10,1,"rgba(0,0,0,0.20)");
  px(g,13,19,2,7,"#5a3a22"); px(g,17,19,2,7,"#5a3a22"); px(g,13,19,2,1,"#8a5a33");
  px(g,9,26,14,3,"#2a1a10"); px(g,9,26,14,1,"#5a3a22");
  px(g,14,26,4,3,"#c9a227"); px(g,14,26,4,1,"#fff2b0"); px(g,15,27,2,1,"#8a5a33");
  px(g,10,29,5,2,"#5a3a22"); px(g,10,29,1,1,"#8a5a33");
  // arms: sleeves + bracers + hands (right holds dagger, left holds loot)
  px(g,6+A.lax,19+A.la,3,8,cloth); px(g,6+A.lax,19+A.la,1,8,lite);
  px(g,6+A.lax,26+A.la,3,2,"#3a2a1a"); px(g,6+A.lax,28+A.la,3,3,skin); px(g,6+A.lax,28+A.la,1,3,skinL);
  px(g,23+A.rax,19+A.ra-(P.atk?3:0),3,8,cloth); px(g,23+A.rax,19+A.ra-(P.atk?3:0),1,8,lite);
  px(g,23+A.rax,26+A.ra-(P.atk?3:0),3,2,"#3a2a1a"); px(g,23+A.rax,28+A.ra-(P.atk?3:0),3,3,skin);
  // dagger in right fist (raised on atk)
  const dx=24+A.rax, dy=20+A.ra-(P.atk?5:0);
  px(g,dx,dy,2,9,"#c9ccd4"); px(g,dx,dy,1,9,"#fff"); px(g,dx+1,dy,1,9,"#6a6e78");
  px(g,dx,dy,2,1,"#fff"); px(g,dx,dy+4,1,2,"#8a4a2a");
  px(g,dx-1,dy+9,4,2,"#8a5a33"); px(g,dx,dy+11,2,2,"#3a2412");
  // head: tan + stubble + scar + mask + hood
  px(g,10+A.hx,9+hb,12,10,skin); px(g,10+A.hx,9+hb,12,2,skinL); px(g,10+A.hx,17+hb,12,2,skinD);
  px(g,10+A.hx,9+hb,2,10,skinD); px(g,20+A.hx,9+hb,2,10,skinD);
  px(g,11+A.hx,11+hb,10,3,"#2a1a10"); px(g,11+A.hx,11+hb,10,1,"#3a2a1a");
  px(g,13+A.hx,12+hb,2,2,"#ffe14d"); px(g,18+A.hx,12+hb,2,2,"#ffe14d");
  px(g,13+A.hx,12+hb,2,1,"#fff2b0"); px(g,18+A.hx,12+hb,2,1,"#fff2b0");
  px(g,13+A.hx,13+hb,1,2,"#111"); px(g,18+A.hx,13+hb,1,2,"#111");
  px(g,13+A.hx,12+hb,1,1,"#fff"); px(g,18+A.hx,12+hb,1,1,"#fff");
  px(g,19+A.hx,14+hb,1,4,"#c93b3b"); px(g,19+A.hx,14+hb,1,1,"#ff8a8a");
  px(g,12+A.hx,18+hb,1,1,"#7a4a3a"); px(g,15+A.hx,18+hb,1,1,"#7a4a3a"); px(g,18+A.hx,18+hb,1,1,"#7a4a3a");
  px(g,13+A.hx,16+hb,2,2,skinD);
  px(g,14+A.hx,18+hb+(P.atk?1:0),4,1,"#5a1a1a");
  // hood + scarf
  px(g,9+A.hx,5+hb,14,5,cloth); px(g,9+A.hx,5+hb,14,1,lite); px(g,9+A.hx,9+hb,14,1,deep);
  px(g,9+A.hx,5+hb,2,5,deep); px(g,21+A.hx,5+hb,2,5,deep);
  px(g,11+A.hx,2+hb,10,3,deep); px(g,11+A.hx,2+hb,10,1,lite);
};

/* ============ 10. BANSHEE v6 — wailing ghost ============ */
D.banshee = (g,tint,ph)=>{
  const P=P_of(ph);
  const shroud=tint&&tint!=="#ffffff"?tint:"#c9d9e8";
  const dk=shade(shroud,-30), deep=shade(shroud,-60), lite="#ffffff";
  auraShadow(g,Hb_of(P),"rgba(180,220,255,0.20)","rgba(180,220,255,0.08)");
  spark(g,[3,18,"#bfe8ff"],[28,14,"#fff"],[26,33,"#bfe8ff"]);
  const fl=Sg(P,0,1), fl2=Sg(P,1,1);
  // glide: gown, hair and face sway with the stride while hovering.
  const gl=P.moving?[0,1,0,-1][P.f&3]:0;
  // floating hem tatters
  px(g,10+fl,28,3,8,shroud); px(g,14-fl,28,2,6,shroud); px(g,17+fl,28,4,8,shroud); px(g,22-fl,28,2,7,shroud);
  px(g,10+fl,28,1,8,dk); px(g,18+fl,28,1,8,dk);
  px(g,10+fl,35,3,1,lite); px(g,17+fl,35,4,1,lite);
  // gown: pale + folds + spectral glow + waist sash
  px(g,11+gl,16,10,13,shroud); px(g,11+gl,16,10,1,lite); px(g,11+gl,27,10,2,dk);
  px(g,11+gl,16,2,13,dk); px(g,19+gl,16,2,13,dk);
  px(g,13+gl,17,1,11,"rgba(120,160,200,0.4)"); px(g,15+gl,17,1,11,"rgba(255,255,255,0.5)"); px(g,17+gl,17,1,11,"rgba(120,160,200,0.4)");
  px(g,11+gl,22,10,2,"#8a9ab0"); px(g,12+gl,22,8,1,"#e8f2ff");
  // arms raised wailing + claw hands
  px(g,6+fl,16,3,8,shroud); px(g,6+fl,16,1,8,lite); px(g,23-fl,16,3,8,shroud); px(g,25-fl,16,1,8,dk);
  px(g,6+fl,23,3,2,"#e8e0d0"); px(g,23-fl,23,3,2,"#e8e0d0");
  px(g,6+fl,25,1,2,"#fff"); px(g,24-fl,25,1,2,"#fff");
  // long flowing hair (white + blue shade + strands)
  px(g,8+gl,4,16,8,shroud); px(g,8+gl,4,16,1,lite); px(g,8+gl,10,16,2,dk);
  px(g,8+gl,4,3,14,dk); px(g,21+gl,4,3,14,dk); px(g,8+gl,4,1,14,"#8a9ab0"); px(g,23+gl,4,1,14,"#8a9ab0");
  for(let y=6;y<14;y+=2){ px(g,9+gl,y,2,1,lite); px(g,21+gl,y,2,1,dk); }
  // face: pale + dark hollow eyes + glowing pupils + wail mouth
  px(g,11+gl,8,10,9,"#f2f6ff"); px(g,11+gl,8,10,1,"#fff"); px(g,11+gl,15,10,2,dk);
  px(g,11+gl,8,1,9,dk); px(g,20+gl,8,1,9,dk);
  px(g,12+gl,11,3,3,"#0a1a24"); px(g,17+gl,11,3,3,"#0a1a24");
  g.fillStyle="#bfe8ff"; g.fillRect(13+gl,12,1,2); g.fillRect(18+gl,12,1,2);
  g.fillStyle="#fff"; g.fillRect(13+gl,12,1,1); g.fillRect(18+gl,12,1,1);
  px(g,12+gl,10,3,1,"#3a4a5a"); px(g,17+gl,10,3,1,"#3a4a5a");
  px(g,11+gl,14,2,1,"#ffb0c0"); px(g,19+gl,14,2,1,"#ffb0c0");
  // wail mouth open (larger on atk) + sound rings
  if(!P.atk){ px(g,14+gl,15,4,3,"#0a0a12"); px(g,15+gl,16,2,2,"#3a1a1a"); }
  else{ px(g,13+gl,15,6,4,"#0a0a12"); px(g,14+gl,16,4,3,"#5a1a2a"); px(g,15+gl,17,2,1,"#ff8a9a"); }
  if(P.atk){ px(g,10+gl,14,1,4,"#bfe8ff"); px(g,21+gl,14,1,4,"#bfe8ff"); }
};

/* ============ 11. BLOOD MONK v6 ============ */
D.blood_monk = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe=tint&&tint!=="#ffffff"?tint:"#8a1a2a";
  const dk=shade(robe,-42), deep=shade(robe,-72), lite=shade(robe,32);
  const skin="#e8b890", skinD="#b07a5a";
  const gold="#ffd93d", goldL="#fff2b0";
  auraShadow(g,hb,"rgba(255,60,80,0.20)","rgba(255,60,80,0.08)");
  spark(g,[3,22,"#ff8a9a"],[28,16,"#fff"],[26,33,"#ff8a9a"]);
  // legs: bare feet + robe hem
  px(g,11+A.lx,30+A.ld,4,5,"#c99878"); px(g,17+A.rx,30+A.rd,4,5,"#c99878");
  px(g,10+A.lx,34+A.ld,6,2,"#5a3320"); px(g,16+A.rx,34+A.rd,6,2,"#5a3320");
  px(g,9,28,14,4,dk); px(g,9,28,14,1,robe); px(g,9,31,14,2,deep);
  // robe: crimson + folds + gold trim + blood beads
  px(g,9,17,14,12,robe); px(g,9,17,14,2,lite); px(g,9,27,14,2,dk);
  px(g,9,17,2,12,deep); px(g,21,17,2,12,deep);
  for(let y=19;y<27;y+=2) px(g,15,y,1,2,"rgba(0,0,0,0.25)");
  px(g,11,19,3,7,"#5a0a14"); px(g,18,19,3,7,"#5a0a14");
  px(g,12,20,1,5,"#ff6a7a"); px(g,19,20,1,5,"#ff6a7a");
  px(g,11,25,10,2,gold); px(g,11,25,10,1,goldL);
  px(g,14,19,4,4,"#ffd93d"); px(g,15,20,2,2,"#7a0a1a"); px(g,15,20,1,1,"#fff");
  // prayer beads across chest
  for(let i=0;i<5;i++){ px(g,10+i*3,18,2,2,"#3a0a10"); px(g,10+i*3,18,1,1,"#ff6a7a"); }
  // arms: sleeves + hands in prayer (part on atk)
  const pr=P.atk?2:0;
  px(g,6+A.lax,19+A.la,3,7,robe); px(g,6+A.lax,19+A.la,1,7,lite);
  px(g,23+A.rax,19+A.ra,3,7,robe); px(g,25+A.rax,19+A.ra,1,7,lite);
  px(g,13-pr,24,3,3,skin); px(g,16+pr,24,3,3,skin);
  px(g,13-pr,24,3,1,"#fff"); px(g,16+pr,24,3,1,"#fff");
  // head: shaved + tattoo + fierce gold eyes + beads
  px(g,11+A.hx,7+hb,10,10,skin); px(g,11+A.hx,7+hb,10,1,"#fff"); px(g,11+A.hx,15+hb,10,2,skinD);
  px(g,11+A.hx,7+hb,2,10,skinD); px(g,19+A.hx,7+hb,2,10,skinD);
  px(g,14+A.hx,7+hb,4,3,"#7a0a1a"); px(g,15+A.hx,8+hb,2,2,"#ff2a4a"); px(g,15+A.hx,8+hb,1,1,"#fff");
  px(g,12+A.hx,11+hb,3,1,"#3a1a10"); px(g,17+A.hx,11+hb,3,1,"#3a1a10");
  g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,12+hb,3,2); g.fillRect(17+A.hx,12+hb,3,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,12+hb,1,1); g.fillRect(17+A.hx,12+hb,1,1);
  px(g,12+A.hx,15+hb,2,1,"#ff8a9a"); px(g,18+A.hx,15+hb,2,1,"#ff8a9a");
  px(g,14+A.hx,15+hb,4,1,"#5a0a14");
};

/* ============ 12. BURROW MOLE v6 ============ */
D.burrow_mole = (g,tint,ph)=>{
  const P=P_of(ph); let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const fur=tint&&tint!=="#ffffff"?tint:"#6b5a4e";
  const dk=shade(fur,-38), deep=shade(fur,-70), lite=shade(fur,30), pale=shade(fur,55);
  auraShadow(g,Hb_of(P),"rgba(150,120,90,0.18)","rgba(150,120,90,0.07)");
  spark(g,[4,22,pale],[28,16,"#fff"],[26,32,pale]);
  const sw=Sg(P,0,1);
  // tail nub
  px(g,2+sw,22,3,3,fur); px(g,2+sw,22,3,1,lite);
  // body: low barrel + fur rows + dirt + belly
  px(g,6,24,19,7,fur); px(g,6,24,19,2,lite); px(g,6,29,19,2,dk);
  px(g,6,24,3,7,deep);
  for(let x=8;x<23;x+=3){ px(g,x,26,2,2,dk); px(g,x,26,1,1,lite); }
  px(g,8,25,6,1,"rgba(255,255,255,0.18)");
  px(g,10,29,5,1,pale); px(g,16,29,5,1,pale);
  px(g,5,30,3,2,"#4a3a2e"); px(g,22,30,3,2,"#4a3a2e");
  // legs: stubby + huge clawed forepaws (burrow!)
  px(g,7+Q.x1,30+Q.d1,4,4,fur); px(g,17+Q.x1,30+Q.d1,4,4,fur);
  px(g,7+Q.x1,33+Q.d1,5,2,dk); px(g,17+Q.x1,33+Q.d1,5,2,dk);
  // foreclaws: 3 big pale claws each
  px(g,6+Q.x1,32+Q.d1,2,3,"#e8e0d0"); px(g,8+Q.x1,32+Q.d1,2,3,"#e8e0d0"); px(g,10+Q.x1,32+Q.d1,2,3,"#e8e0d0");
  px(g,6+Q.x1,32+Q.d1,1,1,"#fff"); px(g,8+Q.x1,32+Q.d1,1,1,"#fff");
  px(g,12+Q.x2,31+Q.d2,3,3,fur); px(g,22+Q.x2,31+Q.d2,3,3,fur);
  // head: blunt + star nose + tiny eyes + whiskers
  px(g,21,18,8,9,fur); px(g,21,18,8,2,lite); px(g,21,25,8,2,dk);
  px(g,21,18,2,9,deep);
  px(g,26,21,4,4,"#ff9a9a"); px(g,26,21,4,1,"#ffd0d0"); px(g,27,22,2,2,"#c93b5a"); px(g,27,22,1,1,"#fff");
  px(g,25,20,2,2,"#111"); px(g,25,20,1,1,"#fff");
  px(g,22,19,3,1,deep);
  px(g,18,21,3,1,"rgba(255,255,255,0.4)"); px(g,18,23,3,1,"rgba(255,255,255,0.4)"); px(g,29,21,2,1,"rgba(255,255,255,0.4)");
  px(g,24,24,4,1,"#3a2a20");
  // ear nubs + dirt clods
  px(g,22,16,3,3,fur); px(g,22,16,3,1,lite); px(g,23,17,1,1,"#ff9a9a");
  px(g,4,28,2,2,"#5a4a3a"); px(g,27,28,2,2,"#5a4a3a");
};

/* ============ 13. BONE COLLECTOR v6 ============ */
D.bone_collector = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const bone=tint&&tint!=="#ffffff"?tint:"#c4b89e";
  const dk=shade(bone,-38), deep=shade(bone,-70), lite="#ffffff";
  auraShadow(g,hb,"rgba(230,220,190,0.20)","rgba(230,220,190,0.08)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,"#ffd93d"]);
  // legs: shin + boots
  px(g,11+A.lx,28+A.ld,4,6,dk); px(g,17+A.rx,28+A.rd,4,6,dk);
  px(g,11+A.lx,28+A.ld,1,6,lite); px(g,20+A.rx,28+A.rd,1,6,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#2a241a"); px(g,16+A.rx,34+A.rd,6,2,"#2a241a");
  px(g,10+A.lx,34+A.ld,6,1,"#8a7a5a");
  // torso: ribcage coat + spine + belt + skulls
  px(g,9,18,14,11,bone); px(g,9,18,14,2,lite); px(g,9,27,14,2,dk);
  px(g,9,18,2,11,deep); px(g,21,18,2,11,deep);
  for(let y=20;y<27;y+=2){ px(g,10,y,12,1,deep); px(g,10,y,3,1,lite); }
  px(g,15,18,2,11,"#8a7a5a");
  px(g,9,26,14,3,"#3a2e1e"); px(g,9,26,14,1,"#8a7a5a");
  px(g,11,27,3,3,"#e8e4d8"); px(g,11,27,3,1,"#fff"); px(g,15,27,3,3,"#e8e4d8"); px(g,19,27,3,3,"#e8e4d8");
  g.fillStyle="#111"; g.fillRect(12,28,1,1); g.fillRect(16,28,1,1); g.fillRect(20,28,1,1);
  // arms: bone + claws (right holds femur club on atk)
  px(g,6+A.lax,19+A.la,3,8,bone); px(g,6+A.lax,19+A.la,1,8,lite);
  px(g,6+A.lax,27+A.la,3,3,dk); px(g,6+A.lax,29+A.la,1,2,lite);
  const sw=P.atk?-4:0;
  px(g,23+A.rax,19+A.ra+sw,3,8,bone); px(g,25+A.rax,19+A.ra+sw,1,8,lite);
  px(g,24+A.rax,12+A.ra+sw,2,10,"#8a7a5a"); px(g,24+A.rax,12+A.ra+sw,1,10,"#c9b896");
  px(g,23+A.rax,10+A.ra+sw,4,4,"#e8e4d8"); px(g,23+A.rax,10+A.ra+sw,4,1,"#fff");
  g.fillStyle="#111"; g.fillRect(24+A.rax,11+A.ra+sw,1,1); g.fillRect(26+A.rax,11+A.ra+sw,1,1);
  // head: skull helm + glowing red eyes + jaw + vertebrae crown
  px(g,10+A.hx,7+hb,12,10,bone); px(g,10+A.hx,7+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,dk);
  px(g,10+A.hx,7+hb,2,10,deep); px(g,20+A.hx,7+hb,2,10,deep);
  px(g,12+A.hx,11+hb,3,3,"#0a0a0a"); px(g,17+A.hx,11+hb,3,3,"#0a0a0a");
  g.fillStyle="#ff3b3b"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,12+hb,1,1); g.fillRect(18+A.hx,12+hb,1,1);
  px(g,15+A.hx,13+hb,2,3,"#8a8078");
  px(g,11+A.hx,15+hb,10,2,"#8a8078"); px(g,12+A.hx,15+hb,1,2,"#111"); px(g,14+A.hx,15+hb,1,2,"#111"); px(g,16+A.hx,15+hb,1,2,"#111");
  px(g,12+A.hx,15+hb,1,1,"#fff");
  px(g,10+A.hx,4+hb,12,3,"#c9a227"); px(g,10+A.hx,4+hb,12,1,"#fff2b0");
  px(g,12+A.hx,2+hb,2,3,"#e8e4d8"); px(g,15+A.hx,1+hb,2,4,"#e8e4d8"); px(g,18+A.hx,2+hb,2,3,"#e8e4d8");
  // sack of bones on back
  px(g,3,16,4,10,"#5a4a3a"); px(g,3,16,4,1,"#8a7a5a");
  px(g,3,14,4,3,"#e8e4d8"); px(g,4,14,1,1,"#111");
};

/* ============ 14. CAVE BAT + BAT v6 (same bar, tinted) ============ */
function paintBat(g,tint,ph){
  const P=P_of(ph);
  const fur=tint&&tint!=="#ffffff"?tint:"#3a2b4f";
  const dk=shade(fur,-38), deep=shade(fur,-70), lite=shade(fur,36);
  const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
  auraShadow(g,Hb_of(P),"rgba(150,120,255,0.16)","rgba(150,120,255,0.06)");
  spark(g,[3,10,lite],[28,6,"#fff"],[26,33,lite]);
  for(const s of [-1,1]){
    // whole wing (membrane + fingers + tips) rotates around the shoulder,
    // so the beat reads as one piece instead of a swinging membrane with
    // frozen fingers.
    g.save(); g.translate(s<0?12:20,20); g.rotate(s<0?WA:-WA); g.translate(s<0?-12:-20,-20);
    g.fillStyle=dk; g.beginPath();
    if(s<0){ g.moveTo(12,22); g.lineTo(0,6); g.lineTo(2,12); g.lineTo(5,10); g.lineTo(7,17); g.lineTo(10,21); }
    else { g.moveTo(20,22); g.lineTo(32,6); g.lineTo(30,12); g.lineTo(27,10); g.lineTo(25,17); g.lineTo(22,21); }
    g.fill();
    px(g,s<0?2:27,8,3,8,lite); px(g,s<0?6:23,11,2,6,fur);
    px(g,s<0?2:27,8,3,1,"#fff"); px(g,s<0?0:30,6,2,2,lite);
    px(g,s<0?5:26,7,1,9,deep); px(g,s<0?8:23,10,1,8,deep);
    px(g,s<0?0:30,5,2,2,deep); px(g,s<0?1:30,5,1,1,"#fff");
    px(g,s<0?4:26,13,2,2,"rgba(0,0,0,0.35)");
    g.restore();
  }
  // body: furry + belly + ruff
  px(g,11,16,10,11,fur); px(g,11,16,10,2,lite); px(g,11,25,10,2,deep);
  px(g,11,16,2,11,deep); px(g,19,16,2,11,deep);
  px(g,13,18,6,7,"#4a3a5a"); px(g,14,19,4,5,"#5a4a6a");
  for(let y=18;y<25;y+=2) px(g,13,y,6,1,"rgba(0,0,0,0.20)");
  px(g,14,16,4,1,"#6a5a7a");
  px(g,12,24,2,2,lite); px(g,18,24,2,2,lite);
  // ears tall + inner + tuft
  px(g,11,8,3,7,fur); px(g,18,8,3,7,fur); px(g,11,8,3,1,lite); px(g,18,8,3,1,lite);
  px(g,12,9,1,5,deep); px(g,19,9,1,5,deep);
  px(g,12,10,1,3,"#8a6a9a"); px(g,19,10,1,3,"#8a6a9a");
  px(g,11,7,3,1,lite); px(g,18,7,3,1,lite);
  // face: red glowing eyes + nose + fangs + whiskers
  px(g,12,17,3,4,"#ff3b3b"); px(g,17,17,3,4,"#ff3b3b");
  px(g,12,17,3,1,"#ff8a8a"); px(g,17,17,3,1,"#ff8a8a");
  px(g,13,18,1,2,"#111"); px(g,18,18,1,2,"#111");
  px(g,13,18,1,1,"#fff"); px(g,18,18,1,1,"#fff");
  px(g,15,19,2,2,deep); px(g,15,20,2,1,"#111");
  px(g,13,22,6,2,"#1a0f1f"); px(g,14,22,1,2,"#fff"); px(g,17,22,1,2,"#fff"); px(g,15,22,2,1,"#5a3a4a");
  px(g,8,20,3,1,"rgba(255,255,255,0.35)"); px(g,21,20,3,1,"rgba(255,255,255,0.35)");
  px(g,12,27,2,3,deep); px(g,18,27,2,3,deep);
  px(g,15,27,2,2,deep);
}
D.bat = (g,t,ph)=>paintBat(g,t,ph);
D.cave_bat = (g,t,ph)=>paintBat(g,t||"#2e2138",ph);

/* ============ 15. CENTAUR FOAL v6 ============ */
D.centaur_foal = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const coat=tint&&tint!=="#ffffff"?tint:"#8a5a33";
  const dk=shade(coat,-36), deep=shade(coat,-68), lite=shade(coat,30);
  const skin="#f2c9a0", skinD="#c98a5a", skinL="#fff2e0";
  auraShadow(g,hb,"rgba(200,160,100,0.18)","rgba(200,160,100,0.07)");
  spark(g,[3,22,lite],[28,16,"#fff"],[26,33,lite]);
  // horse barrel + back + belly + coat shine
  px(g,4,24,14,7,coat); px(g,4,24,14,2,lite); px(g,4,29,14,2,dk);
  px(g,4,24,3,7,deep);
  for(let x=6;x<16;x+=3){ px(g,x,26,2,2,dk); px(g,x,26,1,1,lite); }
  px(g,5,25,5,1,"rgba(255,255,255,0.20)");
  // 4 foal legs (slender + white socks + hooves)
  px(g,4+Q.x1,30+Q.d1,3,4,coat); px(g,8+Q.x2,30+Q.d2,3,4,coat); px(g,12+Q.x1,30+Q.d1,3,4,coat); px(g,15+Q.x2,30+Q.d2,3,4,coat);
  px(g,4+Q.x1,33+Q.d1,3,2,"#f2ede2"); px(g,8+Q.x2,33+Q.d2,3,2,"#f2ede2"); px(g,12+Q.x1,33+Q.d1,3,2,"#f2ede2"); px(g,15+Q.x2,33+Q.d2,3,2,"#f2ede2");
  px(g,4+Q.x1,34+Q.d1,3,2,"#2a2018"); px(g,8+Q.x2,34+Q.d2,3,2,"#2a2018"); px(g,12+Q.x1,34+Q.d1,3,2,"#2a2018"); px(g,15+Q.x2,34+Q.d2,3,2,"#2a2018");
  // mane + tail (flaxen + braid)
  px(g,3+Sg(P,0,1),20,3,6,"#e8d9a0"); px(g,3+Sg(P,0,1),20,3,1,"#fff");
  px(g,17,18,3,8,"#e8d9a0"); px(g,17,18,1,8,"#b8a888"); px(g,18,24,2,2,"#c93b3b"); px(g,18,24,1,1,"#fff");
  // child torso: tunic + belt + quiver
  px(g,15,15,9,10,skin); px(g,15,15,9,1,skinL); px(g,15,23,9,2,skinD);
  px(g,15,15,2,10,skinD); px(g,22,15,2,10,skinD);
  px(g,15,18,9,5,"#3a6a3a"); px(g,15,18,9,1,"#5a8a4a"); px(g,15,21,9,1,"#2a4a2a");
  px(g,15,22,9,2,"#c9a227"); px(g,15,22,9,1,"#fff2b0");
  // arms: one holds bow, one draws (atk draws)
  px(g,12+A.lax,17+A.la,3,6,skin); px(g,12+A.lax,17+A.la,1,6,skinL);
  px(g,24+A.rax,17+A.ra-(P.atk?2:0),3,6,skin);
  // small shortbow
  px(g,25+A.rax,12+A.ra,2,12,"#5a3a22"); px(g,25+A.rax,12+A.ra,1,12,"#8a5a33");
  px(g,24+A.rax,11+A.ra,4,2,"#5a3a22"); px(g,24+A.rax,22+A.ra,4,2,"#5a3a22");
  px(g,25+A.rax,12+A.ra,1,12,"#e8e0d0");
  // foal head: big gold eyes, forelock, blunt muzzle
  px(g,16+A.hx,7+hb,9,9,skin); px(g,16+A.hx,7+hb,9,1,skinL); px(g,16+A.hx,14+hb,9,2,skinD);
  px(g,16+A.hx,4+hb,9,4,"#e8d9a0"); px(g,16+A.hx,4+hb,9,1,"#fff"); px(g,18+A.hx,5+hb,5,1,"#b8a888");
  px(g,14+A.hx,8+hb,3,5,"#e8d9a0"); px(g,14+A.hx,8+hb,1,5,"#b8a888");
  g.fillStyle="#ffe14d"; g.fillRect(18+A.hx,10+hb,2,2); g.fillStyle="#111"; g.fillRect(18+A.hx,10+hb,1,2); g.fillStyle="#fff"; g.fillRect(18+A.hx,10+hb,1,1);
  px(g,19+A.hx,13+hb,3,2,"#d9a06b"); px(g,20+A.hx,14+hb,1,1,"#8a5a33");
  px(g,18+A.hx,15+hb,4,1,"#7a3a2a");
  px(g,16+A.hx,9+hb,1,3,skinD);
};

/* ============ 16. CINDER MAW v6 ============ */
D.cinder_maw = (g,tint,ph)=>{
  const P=P_of(ph); let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const hide=tint&&tint!=="#ffffff"?tint:"#8a1f0e";
  const dk=shade(hide,-40), deep=shade(hide,-72), lite=shade(hide,34);
  auraShadow(g,Hb_of(P),"rgba(255,100,30,0.20)","rgba(255,100,30,0.08)");
  spark(g,[4,22,"#ff7b2e"],[28,16,"#fff"],[26,32,"#ffd93d"]);
  const sw=Sg(P,0,1);
  // tail: segmented + ember tip
  px(g,1+sw,22,4,3,deep); px(g,0+sw,21,3,3,dk); px(g,0+sw,21,2,1,"#ff7b2e");
  // body: obsidian plates + lava cracks + belly glow
  px(g,5,23,18,8,hide); px(g,5,23,18,2,lite); px(g,5,29,18,2,dk);
  px(g,5,23,3,8,deep);
  px(g,8,25,4,1,"#ff7b2e"); px(g,14,27,4,1,"#ffd93d"); px(g,18,25,2,2,"#ff9d2e");
  px(g,9,26,1,3,deep); px(g,13,26,1,3,deep); px(g,17,26,1,3,deep);
  for(let x=7;x<21;x+=3){ px(g,x,24,2,2,dk); px(g,x,24,1,1,lite); }
  px(g,9,29,6,1,"#ff5a1a");
  // legs: clawed + ember ankles
  px(g,6+Q.x1,30+Q.d1,3,5,dk); px(g,11+Q.x2,30+Q.d2,3,5,dk); px(g,16+Q.x1,30+Q.d1,3,5,dk); px(g,20+Q.x2,30+Q.d2,3,5,dk);
  px(g,6+Q.x1,30+Q.d1,3,1,"#ff7b2e"); px(g,20+Q.x2,30+Q.d2,3,1,"#ff7b2e");
  px(g,6+Q.x1,34+Q.d1,3,2,"#0a0808"); px(g,11+Q.x2,34+Q.d2,3,2,"#0a0808"); px(g,16+Q.x1,34+Q.d1,3,2,"#0a0808"); px(g,20+Q.x2,34+Q.d2,3,2,"#0a0808");
  // head: massive jaw + upper fangs + glowing eyes + horn
  px(g,21,15,8,10,hide); px(g,21,15,8,2,lite); px(g,21,23,8,2,dk);
  px(g,21,15,2,10,deep);
  px(g,22,12,3,4,deep); px(g,22,12,3,1,lite); px(g,23,12,1,2,"#ff7b2e");
  g.fillStyle="#ffd93d"; g.fillRect(23,18,2,2); g.fillStyle="#111"; g.fillRect(23,18,1,2); g.fillStyle="#fff"; g.fillRect(23,18,1,1);
  px(g,22,17,3,1,deep);
  // MAW: ember mouth with teeth (gapes on atk)
  if(!P.atk){ px(g,24,21,5,2,"#2a0800"); px(g,25,21,1,2,"#fff"); px(g,27,21,1,2,"#fff"); px(g,25,22,2,1,"#ff7b2e"); }
  else{ px(g,24,20,5,5,"#2a0800"); px(g,24,20,5,1,"#ff7b2e"); px(g,25,21,1,3,"#fff"); px(g,27,21,1,3,"#fff"); px(g,25,23,3,1,"#ff9d2e"); px(g,26,22,1,1,"#ffd93d"); }
  px(g,24,20,5,1,"#ff9d2e");
};

/* ============ 17. CINDER STEED v6 ============ */
D.cinder_steed = (g,tint,ph)=>{
  const P=P_of(ph); let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const coat=tint&&tint!=="#ffffff"?tint:"#c9401e";
  const dk=shade(coat,-40), deep=shade(coat,-72), lite=shade(coat,32);
  auraShadow(g,Hb_of(P),"rgba(255,120,40,0.20)","rgba(255,120,40,0.08)");
  spark(g,[4,22,"#ff9d2e"],[28,16,"#fff"],[26,32,"#ffd93d"]);
  const sw=Sg(P,0,1);
  // tail: flame tongues
  px(g,1+sw,20,3,6,"#ff7b2e"); px(g,0+sw,22,5,4,"#ff9d2e"); px(g,1+sw,22,3,2,"#ffd93d"); px(g,2+sw,22,1,1,"#fff");
  px(g,0+sw,25,2,2,"#7a1f0e");
  // body: sleek + flame dapples + belly + back glow
  px(g,5,23,18,7,coat); px(g,5,23,18,2,lite); px(g,5,28,18,2,dk);
  px(g,5,23,2,7,deep);
  px(g,8,25,3,2,"#ff7b2e"); px(g,13,26,3,2,"#ffd93d"); px(g,17,25,2,2,"#ff9d2e");
  px(g,9,25,1,1,"#fff"); px(g,14,26,1,1,"#fff");
  for(let x=6;x<20;x+=4){ px(g,x,24,1,2,dk); }
  // legs: long + socks + ember hooves
  px(g,6+Q.x1,29+Q.d1,3,5,coat); px(g,11+Q.x2,29+Q.d2,3,5,coat); px(g,16+Q.x1,29+Q.d1,3,5,coat); px(g,20+Q.x2,29+Q.d2,3,5,coat);
  px(g,6+Q.x1,29+Q.d1,1,5,lite);
  px(g,6+Q.x1,33+Q.d1,3,2,"#1a0e08"); px(g,11+Q.x2,33+Q.d2,3,2,"#1a0e08"); px(g,16+Q.x1,33+Q.d1,3,2,"#1a0e08"); px(g,20+Q.x2,33+Q.d2,3,2,"#1a0e08");
  px(g,6+Q.x1,33+Q.d1,3,1,"#ff7b2e"); px(g,11+Q.x2,33+Q.d2,3,1,"#ff7b2e");
  // neck + head + flame mane
  px(g,20,16,7,10,coat); px(g,20,16,7,2,lite); px(g,20,24,7,2,dk);
  px(g,19,14,3,8,"#ff7b2e"); px(g,19,14,3,1,"#ffd93d"); px(g,20,16,2,6,"#ff9d2e"); px(g,20,16,1,2,"#fff");
  px(g,18,12,4,5,"#ff7b2e"); px(g,18,12,4,1,"#fff"); px(g,19,13,2,2,"#ffd93d");
  px(g,24,19,4,4,"#2a0e06"); px(g,25,20,2,2,"#111"); px(g,25,20,1,1,"#555");
  g.fillStyle="#ffe14d"; g.fillRect(22,18,2,2); g.fillStyle="#111"; g.fillRect(22,18,1,2); g.fillStyle="#fff"; g.fillRect(22,18,1,1);
  px(g,21,17,3,1,deep);
  px(g,25,23,3,1,"#5a1a0a");
};

/* ============ 18. CRIMSON BAT v6 ============ */
D.crimson_bat = (g,tint,ph)=>{
  const P=P_of(ph);
  const blood=tint&&tint!=="#ffffff"?tint:"#c01a3a";
  const dk=shade(blood,-42), deep=shade(blood,-72), lite=shade(blood,34);
  const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
  auraShadow(g,Hb_of(P),"rgba(255,60,80,0.20)","rgba(255,60,80,0.08)");
  spark(g,[3,10,"#ff6a8a"],[28,6,"#fff"],[26,33,"#ff6a8a"]);
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?12:20,20); g.rotate(s<0?WA:-WA); g.translate(s<0?-12:-20,-20);
    g.fillStyle="#7a0a20"; g.beginPath();
    if(s<0){ g.moveTo(12,20); g.lineTo(0,6); g.lineTo(3,14); g.lineTo(6,12); } else { g.moveTo(20,20); g.lineTo(32,6); g.lineTo(29,14); g.lineTo(26,12); }
    g.fill();
    g.restore();
    // veined membrane + claws + heart spots
    px(g,s<0?3:26,10,3,7,"#7a0a20"); px(g,s<0?4:27,11,1,5,"#ff4a6a");
    px(g,s<0?3:27,12,2,2,"#ff8a9a"); px(g,s<0?0:30,6,2,2,lite); px(g,s<0?1:30,6,1,1,"#fff");
    px(g,s<0?6:23,13,2,3,"#5a040c");
  }
  px(g,3,10,2,3,"#ff6a8a"); px(g,27,10,2,3,"#ff6a8a"); px(g,3,10,1,1,"#fff"); px(g,27,10,1,1,"#fff");
  // body: heart chest + fur + belly
  px(g,11,18,10,10,blood); px(g,11,18,10,1,lite); px(g,11,26,10,2,deep);
  px(g,11,18,2,10,deep); px(g,19,18,2,10,deep);
  px(g,13,20,6,6,"#ff2a4a"); px(g,13,20,6,1,"#ff8a8a"); px(g,14,21,4,4,"#ff6a8a"); px(g,15,22,2,2,"#fff");
  // ears tall + inner
  px(g,10,8,4,8,blood); px(g,18,8,4,8,blood); px(g,10,8,4,1,lite); px(g,18,8,4,1,lite);
  px(g,11,10,2,4,"#ff8a9a"); px(g,19,10,2,4,"#ff8a9a");
  // face: gold eyes + fangs + nose
  g.fillStyle="#fff06a"; g.fillRect(13,14,3,3); g.fillRect(17,14,2,2);
  g.fillStyle="#111"; g.fillRect(14,15,1,2);
  g.fillStyle="#fff"; g.fillRect(13,14,1,1); g.fillRect(17,14,1,1);
  px(g,12,13,4,1,deep); px(g,16,13,4,1,deep);
  px(g,13,18,6,2,"#2a0408"); px(g,14,18,1,2,"#fff"); px(g,17,18,1,2,"#fff");
  px(g,12,28,2,4,deep); px(g,18,28,2,4,deep);
};

const prev = window.Sprites.actor;
const cache = new Map();
try{ (window.__spriteCacheResets=window.__spriteCacheResets||[]).push(()=>cache.clear()); }catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if(kind==="goddess"||kind==="peter_the_fallen") return prev.call(this,kind,tint,seed,gear,app,gen,ph);
  if(D[kind]){
    gen=(gen==="male"||gen==="female")?gen:"";
    let P=null,bk="";
    try{ if(window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph); } else P=window.Anim.normP(null); } }catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck="GBAR1|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=cv(); const g2=c.getContext("2d"); g2.imageSmoothingEnabled=false;
    g2.clearRect(0,0,32,40);
    try{ D[kind](g2,tint||"#fff",P); }catch(e){}
    let out=c; try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>700) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
})();
