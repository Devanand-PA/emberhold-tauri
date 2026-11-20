/* src/sprites/sprite_goddess_parity15c.js — GODDESS-BAR PARITY batch C (5/15).
 * Loaded AFTER parity15b. Same goddess bar.
 * Kinds: gnoll, khepri_beetle, orchard_wisp, peak_dragon, petal_drake.
 */
(function(){
"use strict";
function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x,y,w,h); }
function shade(hex,amt){
  const n=parseInt(String(hex).slice(1),16); if(isNaN(n)) return hex;
  let r=(n>>16)+amt, gg=((n>>8)&255)+amt, b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r)); gg=Math.max(0,Math.min(255,gg)); b=Math.max(0,Math.min(255,b));
  return "#"+((r<<16)|(gg<<8)|b).toString(16).padStart(6,"0");
}
function cv(){ const c=document.createElement("canvas"); c.width=32; c.height=40; return c; }
const D = {};
function aura(g,hb,c1,c2){
  g.fillStyle=c1; g.beginPath(); g.ellipse(16,22+hb,13,15,0,0,7); g.fill();
  g.fillStyle=c2; g.beginPath(); g.ellipse(16,24+hb,8,11,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,38,8,2,0,0,7); g.fill();
}
function sparks(g,cols){
  px(g,3,20,1,1,cols[0]); px(g,28,18,1,1,"#fff");
  px(g,26,33,1,1,cols[0]); px(g,5,32,1,1,"#fff");
  if(cols[1]){ px(g,6,6,1,1,cols[1]); px(g,25,5,1,1,cols[1]); }
}
function P_of(ph){ try{ return window.Anim.normP(ph); }catch(e){ return {f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; } }
function A_of(P){ try{ return window.Anim.limb(P); }catch(e){ return {lx:0,rx:0,ld:0,rd:0,lax:0,rax:0,la:0,ra:0,hx:0}; } }
function Hb_of(P){ try{ return window.Anim.hbob(P); }catch(e){ return 0; } }
function gface(g,hx,hb,skin,skinD,iris,brow,blush,mouth,smileW){
  px(g,11+hx,8+hb,10,7,skin);
  px(g,11+hx,8+hb,1,6,skinD); px(g,20+hx,8+hb,1,6,skinD);
  px(g,11+hx,8+hb,10,1,"#fff8ea");
  px(g,12+hx,13+hb,2,1,blush); px(g,18+hx,13+hb,2,1,blush);
  px(g,12+hx,10+hb,3,1,"#3a2018"); px(g,18+hx,10+hb,3,1,"#3a2018");
  px(g,12+hx,11+hb,3,2,iris); px(g,18+hx,11+hb,3,2,iris);
  px(g,12+hx,11+hb,3,1,"#ffffff");
  px(g,13+hx,11+hb,1,1,"#2a1808"); px(g,19+hx,11+hb,1,1,"#2a1808");
  px(g,12+hx,12+hb,1,1,"#fff"); px(g,18+hx,12+hb,1,1,"#fff");
  px(g,12+hx,9+hb,3,1,brow); px(g,18+hx,9+hb,3,1,brow);
  px(g,15+hx,14+hb,(smileW||3),1,mouth);
}

/* ============ 11. GNOLL — laughing hyena hunter (goddess bar) ============ */
D.gnoll = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur=tint||"#9a7a4a", dk="#5a3a22", lite="#d8b878", cream="#efe0c0";
  aura(g,hb,"rgba(216,184,120,0.20)","rgba(255,240,200,0.12)");
  sparks(g,[lite,"#fff"]);
  // legs: digitigrade + claws
  px(g,10+A.lx,29+A.ld,4,6,fur); px(g,18+A.rx,29+A.rd,4,6,fur);
  px(g,10+A.lx,29+A.ld,1,6,lite); px(g,21+A.rx,29+A.rd,1,6,dk);
  px(g,9+A.lx,34+A.ld,6,2,dk); px(g,17+A.rx,34+A.rd,6,2,dk);
  px(g,9+A.lx,34+A.ld,2,1,cream);
  // torso: spotted hide + mane + bone necklace
  px(g,9,20,14,11,fur); px(g,9,20,14,2,lite); px(g,9,29,14,2,dk);
  px(g,9,20,2,11,dk); px(g,21,20,2,11,dk);
  px(g,12,22,2,2,dk); px(g,16,23,2,2,dk); px(g,19,22,2,2,dk); px(g,13,26,2,2,dk); px(g,18,27,2,2,dk);
  px(g,12,20,8,3,dk); px(g,13,20,6,1,"#7a5a33");
  px(g,13,24,6,2,cream); px(g,14,24,1,1,dk); px(g,17,24,1,1,dk);
  // arms: left buckler, right bone spear (raises on atk)
  px(g,5+A.lax,21+A.la,4,6,fur); px(g,23+A.rax,21+A.ra,4,6,fur);
  px(g,5+A.lax,21+A.la,1,6,lite);
  px(g,3+A.lax,24+A.la,4,7,"#6b4226"); px(g,3+A.lax,24+A.la,4,1,"#a97648");
  px(g,4+A.lax,26+A.la,2,3,cream);
  const sw=P.atk?-6:0;
  px(g,25+A.rax,8+A.ra+sw,2,16,"#6b4226"); px(g,25+A.rax,8+A.ra+sw,1,16,"#a97648");
  px(g,24+A.rax,5+A.ra+sw,4,4,"#e8e0d0"); px(g,24+A.rax,5+A.ra+sw,4,1,"#fff");
  // hyena head: muzzle + spotted cheeks + laughing grin (goddess eyes, beast snout)
  px(g,10+A.hx,8+hb,12,9,fur);
  px(g,10+A.hx,8+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,cream);
  px(g,10+A.hx,8+hb,2,9,dk); px(g,20+A.hx,8+hb,2,9,dk);
  px(g,12+A.hx,11+hb,3,1,"#3a2018"); px(g,17+A.hx,11+hb,3,1,"#3a2018");
  px(g,12+A.hx,12+hb,3,2,"#5a3a10"); px(g,17+A.hx,12+hb,3,2,"#5a3a10");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,13+A.hx,13+hb,1,2,"#111"); px(g,18+A.hx,13+hb,1,2,"#111");
  px(g,14+A.hx,14+hb,4,1,"#2a1a0a");
  px(g,13+A.hx,15+hb,6,2,"#4a1a1a"); px(g,14+A.hx,15+hb,1,2,"#fff"); px(g,17+A.hx,15+hb,1,2,"#fff");
  px(g,11+A.hx,13+hb,1,1,"#f0a090"); px(g,20+A.hx,13+hb,1,1,"#f0a090");
  // ears: round + tufts + notch
  px(g,8+A.hx,5+hb,4,5,fur); px(g,8+A.hx,5+hb,4,1,lite); px(g,9+A.hx,6+hb,2,3,dk);
  px(g,20+A.hx,5+hb,4,5,fur); px(g,20+A.hx,5+hb,4,1,lite); px(g,21+A.hx,6+hb,2,3,dk);
  // mane mohawk
  px(g,14+A.hx,3+hb,4,3,dk); px(g,15+A.hx,2+hb,2,2,"#7a5a33");
};

/* ============ 12. KHEPRI BEETLE — dawn-roller scarab (goddess bar) ============ */
D.khepri_beetle = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const shell=tint||"#5a3a8a", dk="#2a1a4a", lite="#9a7ae0", gold="#d8a018", goldL="#f6d34e";
  aura(g,hb,"rgba(154,122,224,0.22)","rgba(246,211,78,0.14)");
  sparks(g,[goldL,lite]);
  // six legs: jointed chitin
  px(g,6+A.lx,26+A.ld,3,5,dk); px(g,23+A.rx,26+A.rd,3,5,dk);
  px(g,7,29,3,4,dk); px(g,22,29,3,4,dk);
  px(g,5,24,3,3,dk); px(g,24,24,3,3,dk);
  px(g,6,24,1,3,lite); px(g,26,24,1,3,lite);
  // wing cases: violet elytra + gold suture + hieroglyph marks
  px(g,8,20,16,12,shell);
  px(g,8,20,16,2,lite); px(g,8,30,16,2,dk);
  px(g,8,20,2,12,dk); px(g,22,20,2,12,dk);
  px(g,15,20,2,12,gold); px(g,15,20,2,1,goldL);
  px(g,10,22,3,3,"#3a2a6a"); px(g,19,22,3,3,"#3a2a6a");
  px(g,10,26,3,2,lite); px(g,19,26,3,2,lite);
  px(g,11,23,1,1,goldL); px(g,20,23,1,1,goldL);
  // membranous flight wings hint
  const flap=P.atk?2:(P.moving?(P.f%2):0);
  px(g,5-flap,18,4,4,"#d9d4ff"); px(g,23+flap,18,4,4,"#d9d4ff");
  // head: broad + mandibles + goddess-layout jewel eyes
  px(g,11+A.hx,10+hb,10,8,shell);
  px(g,11+A.hx,10+hb,10,2,lite); px(g,11+A.hx,16+hb,10,2,dk);
  px(g,12+A.hx,12+hb,3,3,goldL); px(g,17+A.hx,12+hb,3,3,goldL);
  px(g,13+A.hx,13+hb,1,2,"#2a1a0a"); px(g,18+A.hx,13+hb,1,2,"#2a1a0a");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,13+A.hx,11+hb,1,1,dk); px(g,18+A.hx,11+hb,1,1,dk);
  px(g,12+A.hx,16+hb,2,2,dk); px(g,18+A.hx,16+hb,2,2,dk);
  px(g,14+A.hx,17+hb,4,1,dk);
  // horn + SUN DISC (signature: rolls the morning sun)
  px(g,14+A.hx,6+hb,4,5,dk); px(g,14+A.hx,6+hb,4,1,lite);
  px(g,12+A.hx,0+hb,8,6,gold); px(g,12+A.hx,0+hb,8,1,goldL); px(g,12+A.hx,5+hb,8,1,"#8a6410");
  px(g,14+A.hx,2+hb,4,2,"#fff2b0"); px(g,15+A.hx,2+hb,2,1,"#fff");
  px(g,10+A.hx,2+hb,2,2,gold); px(g,20+A.hx,2+hb,2,2,gold);
};

/* ============ 13. ORCHARD WISP — apple-blossom flame (goddess bar) ============ */
D.orchard_wisp = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const body=tint||"#c8ffb0", dk="#4a8a4d", lite="#eaffea", core="#6ad98a";
  const petal="#ffd9e8", gold="#f6d34e";
  aura(g,hb,"rgba(200,255,176,0.24)","rgba(255,217,232,0.16)");
  sparks(g,["#fff",petal]);
  // floating: no legs — trailing blossom tail + glow
  const fl=(P.moving?(P.f%2?1:-1):0);
  px(g,10,30+fl,12,4,body); px(g,10,30+fl,12,1,"#fff"); px(g,12,32+fl,8,2,core);
  px(g,8,28+fl,3,3,petal); px(g,21,28+fl,3,3,petal);
  px(g,9,29+fl,2,1,"#fff");
  // kimono-petal body: layered blossom robes ride the glide
  const gl=P.moving?[0,1,0,-1][P.f&3]:0;
  px(g,9+gl,20,14,11,body);
  px(g,9+gl,20,14,2,"#fff"); px(g,9+gl,29,14,2,dk);
  px(g,9+gl,20,2,11,dk); px(g,21+gl,20,2,11,dk);
  px(g,11+gl,22,10,7,core); px(g,12+gl,23,8,5,lite);
  px(g,13+gl,24,6,2,"#fff"); px(g,15+gl,25,2,2,core);
  px(g,11+gl,27,3,2,petal); px(g,18+gl,27,3,2,petal);
  // leaf arms: vines -> blossom hands
  px(g,5+A.lax,21+A.la,4,4,dk); px(g,23+A.rax,21+A.ra,4,4,dk);
  px(g,5+A.lax,21+A.la,4,1,core);
  px(g,4+A.lax,24+A.la,3,4,petal); px(g,4+A.lax,24+A.la,3,1,"#fff");
  px(g,25+A.rax,24+A.ra,3,4,petal); px(g,25+A.rax,24+A.ra,3,1,"#fff");
  // face: bright wisp eyes + blush + smile (goddess layout, ghost palette)
  px(g,11+A.hx,9+hb,10,8,lite);
  px(g,11+A.hx,9+hb,10,1,"#fff");
  px(g,12+A.hx,11+hb,3,3,"#123a24"); px(g,17+A.hx,11+hb,3,3,"#123a24");
  px(g,13+A.hx,12+hb,1,2,"#6ad98a"); px(g,18+A.hx,12+hb,1,2,"#6ad98a");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,12+A.hx,10+hb,3,1,"#4a8a4d"); px(g,17+A.hx,10+hb,3,1,"#4a8a4d");
  px(g,12+A.hx,14+hb,2,1,"#f0a090"); px(g,18+A.hx,14+hb,2,1,"#f0a090");
  px(g,15+A.hx,15+hb,2,1,"#4a8a4d");
  // APPLE-BLOSSOM CROWN: white-pink petals + gold heart + leaves
  px(g,10+A.hx,3+hb,12,4,"#fff"); px(g,10+A.hx,3+hb,12,1,petal);
  px(g,8+A.hx,4+hb,3,3,petal); px(g,21+A.hx,4+hb,3,3,petal);
  px(g,12+A.hx,1+hb,8,2,petal); px(g,14+A.hx,2+hb,4,2,gold); px(g,15+A.hx,2+hb,2,1,"#fff");
  px(g,9+A.hx,6+hb,2,2,dk); px(g,21+A.hx,6+hb,2,2,dk);
  // halo ringlet of petals
  px(g,9+A.hx,0+hb,14,1,gold); px(g,10+A.hx,0+hb,3,1,"#fff");
};

/* ============ 14. PEAK DRAGON — hail-tax apex, true dragon profile ============ */
/* Side-view drake: vast wings, long neck, horned profile head with a jaw
 * that gapes on attack, spaded hail-tip tail, ember heart, ice-rimmed
 * spikes — reads as a dragon at a glance, not a mascot. */
D.peak_dragon = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const R=tint||"#a01818";
  const mid=shade(R,-15), dk=shade(R,-35), deep=shade(R,-70), lite=shade(R,45);
  const belly="#e8d090", bellyD=shade(belly,-32), horn="#e8e0d0", fire="#ff7b2e", ember="#ffd93d";
  const ice="#cfeaff";
  aura(g,hb,"rgba(207,234,255,0.22)","rgba(160,24,24,0.16)");
  sparks(g,[ice,"#fff"]);
  const flap=P.atk?3:(P.moving?(P.f%2):0);
  // far wing: dark membrane rising high left, ice rim, wingtip claw
  g.fillStyle=mid;
  g.beginPath(); g.moveTo(12,23+hb); g.lineTo(1,2+hb); g.lineTo(3,10+hb); g.lineTo(6,9+hb); g.lineTo(7,16+hb); g.lineTo(10,15+hb); g.lineTo(12,23+hb); g.fill();
  px(g,1,2+hb,1,17,deep); px(g,1,2+hb,4,1,deep);
  px(g,2,5+hb,2,8,lite); px(g,6,9+hb,2,7,lite);
  px(g,0,1+hb,3,2,horn); px(g,0,1+hb,3,1,"#fff");
  // tail: heavy coil sweeping left + spaded hail tip
  const sw=(P.moving?(P.f%2?1:-1):0);
  px(g,1+sw,29+hb,9,3,dk); px(g,1+sw,29+hb,8,1,mid); px(g,4+sw,31+hb,5,1,deep);
  px(g,0+sw,27+hb,2,3,ice); px(g,0+sw,26+hb,4,1,"#fff");
  // hind leg: pillar + talons + ice spur (strides)
  px(g,8+A.lx,28+A.ld,6,6,dk); px(g,9+A.lx,29+A.ld,4,3,mid);
  px(g,7+A.lx,33+A.ld,9,3,deep);
  px(g,7+A.lx,33+A.ld,2,2,horn); px(g,11+A.lx,33+A.ld,2,2,horn); px(g,14+A.lx,33+A.ld,2,2,ice);
  // torso: armored barrel + scale rows + segmented belly + ember heart
  px(g,7,22+hb,18,9,R); px(g,7,22+hb,18,2,lite); px(g,7,29+hb,18,2,deep);
  px(g,8,24+hb,3,1,dk); px(g,13,24+hb,3,1,dk); px(g,18,24+hb,3,1,dk);
  px(g,9,26+hb,14,3,belly); px(g,9,26+hb,14,1,"#fff"); px(g,9,28+hb,14,1,bellyD);
  px(g,13,26+hb,1,3,bellyD); px(g,17,26+hb,1,3,bellyD);
  // dorsal spikes: dark bases + bone + ice caps (hail-tax)
  px(g,9,19+hb,4,2,deep); px(g,13,18+hb,4,2,deep); px(g,17,19+hb,4,2,deep);
  px(g,10,16+hb,3,4,horn); px(g,14,15+hb,3,5,horn); px(g,18,16+hb,3,4,horn);
  px(g,10,15+hb,3,1,ice); px(g,14,14+hb,3,1,ice); px(g,18,15+hb,3,1,ice);
  px(g,12,24+hb,5,2,fire); px(g,13,24+hb,3,1,ember);
  // near wing: bright sail sweeping high right, ice trailing edge
  g.fillStyle=R;
  g.beginPath(); g.moveTo(20,22+hb); g.lineTo(31,1+hb-flap); g.lineTo(29,9+hb); g.lineTo(26,8+hb); g.lineTo(25,15+hb); g.lineTo(22,14+hb); g.lineTo(21,22+hb); g.fill();
  px(g,31,1+hb-flap,1,15,deep); px(g,27,1+hb-flap,4,1,deep);
  px(g,28,4+hb,2,9,lite); px(g,24,8+hb,2,8,lite); px(g,21,12+hb,2,7,lite);
  px(g,30,0+hb-flap,2,3,horn); px(g,30,0+hb-flap,2,1,"#fff");
  px(g,30,20+hb,1,2,ice);
  // foreleg: muscled + talons (strides opposite)
  px(g,20+A.rx,28+A.rd,5,6,R); px(g,21+A.rx,29+A.rd,3,3,lite);
  px(g,19+A.rx,33+A.rd,8,3,deep);
  px(g,19+A.rx,33+A.rd,2,2,horn); px(g,23+A.rx,33+A.rd,2,2,horn);
  // neck: rising right + throat plates
  px(g,20,13+hb,6,10,R); px(g,21,15+hb,3,7,belly); px(g,21,19+hb,3,1,bellyD);
  px(g,25,13+hb,1,10,dk);
  // head: long snout in profile + brow + jaw that GAPES on atk
  px(g,18,7+hb,10,6,R); px(g,18,7+hb,10,1,dk);
  px(g,25,9+hb,7,4,mid); px(g,25,9+hb,7,1,lite);
  const gape=P.atk?3:0;
  px(g,25,12+hb,7,1+gape,deep);
  if(P.atk){ px(g,26,13+hb,5,2,"#7a1f1f"); px(g,27,14+hb,3,1,fire); }
  px(g,27,13+hb,1,2,"#fff"); px(g,30,13+hb,1,2,"#fff");
  px(g,30,10+hb,1,1,"#111"); px(g,30,12+hb,1,1,fire);
  // eye: ringed ember eye, keen not goggly + heavy brow
  px(g,21,9+hb,3,3,fire); px(g,21,9+hb,3,1,ember); px(g,22,10+hb,1,2,"#111"); px(g,22,9+hb,1,1,"#fff");
  px(g,20,8+hb,5,1,dk);
  // horns: thick swept-back crests in body-red (bone vanishes on sky),
  // rooted deep on the skull, pale crown edge
  px(g,14,5+hb,4,3,mid); px(g,21,5+hb,4,3,mid);
  px(g,10,2+hb,5,4,mid); px(g,10,2+hb,5,1,lite);
  px(g,19,0+hb,6,5,mid); px(g,19,0+hb,6,1,lite);
  // hail scars on the flank
  px(g,12,26+hb,2,2,ice); px(g,18,26+hb,2,2,ice);
};

/* ============ 15. PETAL DRAKE — orchard tide-dragon (goddess bar) ============ */
D.petal_drake = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const petal=tint||"#ffb0d0", dk="#a95e7e", lite="#ffd9e8", cream="#fff", tide="#7ac8ff";
  aura(g,hb,"rgba(255,176,208,0.22)","rgba(122,200,255,0.14)");
  sparks(g,["#fff",tide]);
  const flap=P.atk?2:(P.moving?(P.f%2):0);
  // petal wings: layered blossom + dew
  px(g,2-flap,15+hb,8,6,petal); px(g,2-flap,15+hb,8,1,cream); px(g,3-flap,19+hb,5,3,dk);
  px(g,1-flap,19+hb,6,4,lite); px(g,2-flap,22+hb,3,2,tide);
  px(g,22+flap,15+hb,8,6,petal); px(g,22+flap,15+hb,8,1,cream); px(g,24+flap,19+hb,5,3,dk);
  px(g,25+flap,19+hb,6,4,lite); px(g,27+flap,22+hb,3,2,tide);
  // vine tail + blossom tip
  const sw2=(P.moving?(P.f%2?1:-1):0);
  px(g,4+sw2,27,7,4,"#4a8a4d"); px(g,4+sw2,27,7,1,"#7ccc6a");
  px(g,2+sw2,28,3,3,petal); px(g,3+sw2,29,1,1,"#fff");
  // legs: stubby + petal feet
  px(g,11+A.lx,29+A.ld,3,5,petal); px(g,18+A.rx,29+A.rd,3,5,petal);
  px(g,10+A.lx,33+A.ld,5,2,dk); px(g,17+A.rx,33+A.rd,5,2,dk);
  // body: plump + cream belly + tide freckles
  px(g,10,22,12,9,petal); px(g,10,22,12,2,cream); px(g,10,29,12,2,dk);
  px(g,10,22,2,9,dk); px(g,20,22,2,9,dk);
  px(g,12,25,8,4,cream); px(g,12,25,8,1,"#fff");
  px(g,13,27,2,1,tide); px(g,17,27,2,1,tide);
  // arms: tiny + dew claws
  px(g,6+A.lax,22+A.la,4,4,petal); px(g,22+A.rax,22+A.ra,4,4,petal);
  px(g,5+A.lax,25+A.la,4,2,cream);
  // head: round + blossom frill (goddess eyes, drake snout)
  px(g,11+A.hx,8+hb,10,9,petal);
  px(g,11+A.hx,8+hb,10,2,cream); px(g,11+A.hx,15+hb,10,2,dk);
  px(g,11+A.hx,8+hb,2,9,dk); px(g,19+A.hx,8+hb,2,9,dk);
  px(g,13+A.hx,11+hb,3,1,"#3a2018"); px(g,18+A.hx,11+hb,2,1,"#3a2018");
  px(g,13+A.hx,12+hb,3,3,"#2a4a6a"); px(g,18+A.hx,12+hb,2,3,"#2a4a6a");
  px(g,14+A.hx,13+hb,1,2,"#111"); px(g,18+A.hx,13+hb,1,2,"#111");
  px(g,13+A.hx,12+hb,1,1,"#fff"); px(g,18+A.hx,12+hb,1,1,"#fff");
  px(g,12+A.hx,10+hb,3,1,dk); px(g,18+A.hx,10+hb,2,1,dk);
  px(g,14+A.hx,15+hb,4,1,"#7a3a52"); px(g,15+A.hx,15+hb,2,1,"#ff8aa8");
  px(g,13+A.hx,14+hb,1,1,"#f0a090"); px(g,19+A.hx,14+hb,1,1,"#f0a090");
  // frill: petal horns + dew crown
  px(g,9+A.hx,5+hb,3,5,petal); px(g,9+A.hx,5+hb,3,1,cream);
  px(g,20+A.hx,5+hb,3,5,petal); px(g,20+A.hx,5+hb,3,1,cream);
  px(g,13+A.hx,3+hb,6,2,cream); px(g,14+A.hx,3+hb,2,1,tide);
};

const prev = window.Sprites.actor;
const cache = new Map();
try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(()=>cache.clear()); } catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if (D[kind]){
    gen = (gen==="male"||gen==="female")?gen:"";
    let P=null, bk="";
    try { if (window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph);} else P=window.Anim.normP(null); } } catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck="PC|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=cv(); const g=c.getContext("2d"); g.imageSmoothingEnabled=false;
    g.clearRect(0,0,32,40);
    g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
    try{ D[kind](g,tint||"#fff",P); }catch(e){}
    let out=c;
    try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>700) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
})();
