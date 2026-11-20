/* src/sprites/sprite_hell_parity.js — HELL PARITY vs GODDESS OF DAWN (20 bosses).
 * Loaded AFTER sprite_realism_11.js (outermost). Rebuilds all 20 user-listed
 * hell bosses + medusa + kitsune + peter to the goddess bar:
 * auraShadow + 3 sparkles, ~130-160 rects, 1px highlights/shading,
 * detailed face (lash/iris/pupil/catchlight/blush/brow/nose/mouth),
 * layered garb with trim/folds/texture rows, jeweled regalia, signature
 * weapons, pose-aware (normP/limb/hbob/seg/quad/flap).
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
function Q_of(P){ try{ return window.Anim.quad(P); }catch(e){ return {d1:0,d2:0,x1:0,x2:0}; } }
function Wflap(P){ try{ return (window.Anim&&window.Anim.flap?window.Anim.flap(P):0); }catch(e){ return 0; } }
const D = {};

/* ============ 1. HELL MAGUS v7 — bizarre-rite archmage ============ */
D.hell_magus = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#5a1a8a", dk=shade(robe,-44), deep=shade(robe,-76), lite=shade(robe,34), pale=shade(robe,60);
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#d8b8c8", skinD="#a88898", skinL="#f2e0ea";
  const eye="#c05aff";
  auraShadow(g,hb,"rgba(192,90,255,0.24)","rgba(192,90,255,0.12)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,eye]);
  // boots + hem runes
  px(g,11+A.lx,31+A.ld,4,4,deep); px(g,17+A.rx,31+A.rd,4,4,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#0c0210"); px(g,16+A.rx,34+A.rd,6,2,"#0c0210");
  px(g,10+A.lx,34+A.ld,6,1,"#5a3a6a");
  // robe: deep violet, panel folds, gold hem runes, side shade
  px(g,7,17,18,16,robe); px(g,7,17,18,2,lite); px(g,7,31,18,2,dk);
  px(g,7,17,2,16,deep); px(g,23,17,2,16,deep);
  px(g,10,19,12,11,"#3a1260"); px(g,11,20,10,9,"#4a1a72");
  for(let y=20;y<28;y+=2) px(g,14,y,4,1,"rgba(0,0,0,0.28)");
  for(let y=20;y<29;y+=3) px(g,11,y,2,2,"#6a2a9a");
  px(g,12,19,8,1,"#7a3aaa");
  // arcane chest core: rotating elements sigil (violet + white + gold)
  px(g,12,21,8,7,"#12041a"); px(g,13,22,6,5,eye); px(g,14,23,4,3,"#fff");
  px(g,15,23,2,2,eye); px(g,14,22,1,1,"#fff"); px(g,17,22,1,1,"#fff");
  px(g,12,21,8,1,gold); px(g,12,27,8,1,goldD);
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL); px(g,7,31,18,1,deep);
  px(g,9,30,2,1,"#fff"); px(g,14,30,2,1,eye); px(g,19,30,2,1,"#fff"); px(g,23,30,1,1,goldL);
  // LEFT arm: wide sleeve + claw + ring
  px(g,4+A.lax,18+A.la,4,9,robe); px(g,4+A.lax,18+A.la,1,9,lite); px(g,7+A.lax,18+A.la,1,9,deep);
  px(g,4+A.lax,26+A.la,4,2,dk); px(g,4+A.lax,28+A.la,4,3,skin); px(g,4+A.lax,28+A.la,1,3,skinL);
  px(g,5+A.lax,29+A.la,2,1,gold); px(g,5+A.lax,29+A.la,1,1,goldL);
  px(g,4+A.lax,19+A.la,4,1,"#7a3aaa");
  // RIGHT arm: orb staff (halo + rises on cast)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(192,90,255,0.30)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#2a1a3a"); px(g,25+A.rax,12+A.ra+up,1,16,"#8a6a9a");
  px(g,25+A.rax,18+A.ra+up,2,1,goldD); px(g,25+A.rax,23+A.ra+up,2,1,goldD);
  px(g,22+A.rax,4+A.ra+up,8,9,"#2a1a3a"); px(g,22+A.rax,4+A.ra+up,8,1,eye);
  px(g,23+A.rax,5+A.ra+up,6,7,eye); px(g,24+A.rax,6+A.ra+up,4,5,"#fff");
  px(g,25+A.rax,7+A.ra+up,2,3,eye); px(g,25+A.rax,7+A.ra+up,1,1,"#fff");
  px(g,22+A.rax,11+A.ra+up,8,2,gold); px(g,23+A.rax,11+A.ra+up,1,1,goldL);
  // face: pale mask, violet glow eyes with catchlights, blush, mouth
  px(g,11+A.hx,5+hb,10,4,"#12041a"); px(g,11+A.hx,5+hb,10,1,"#3a1a4a");
  px(g,10+A.hx,9+hb,12,9,skin); px(g,10+A.hx,9+hb,12,1,skinL); px(g,10+A.hx,16+hb,12,2,skinD);
  px(g,10+A.hx,9+hb,1,9,skinD); px(g,21+A.hx,9+hb,1,9,skinD);
  px(g,11+A.hx,9+hb,10,1,"#f2d8e2");
  px(g,11+A.hx,13+hb,2,1,"#e8a0b8"); px(g,19+A.hx,13+hb,2,1,"#e8a0b8");
  px(g,12+A.hx,11+hb,3,1,"#2a102a"); px(g,17+A.hx,11+hb,3,1,"#2a102a");
  px(g,12+A.hx,12+hb,3,3,eye); px(g,17+A.hx,12+hb,3,3,eye);
  px(g,12+A.hx,12+hb,3,1,"#e8c8ff"); px(g,17+A.hx,12+hb,3,1,"#e8c8ff");
  px(g,13+A.hx,13+hb,1,2,"#111"); px(g,18+A.hx,13+hb,1,2,"#111");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,13+A.hx,13+hb,1,1,"#ff9d2e"); px(g,18+A.hx,13+hb,1,1,"#ff9d2e");
  px(g,12+A.hx,10+hb,3,1,"#3a1a4a"); px(g,17+A.hx,10+hb,3,1,"#3a1a4a");
  px(g,15+A.hx,14+hb,2,2,"#8a4a6a"); px(g,15+A.hx,15+hb,1,1,"#5a2a4a");
  if(P.atk){ px(g,14+A.hx,15+hb,4,2,"#3a0a20"); px(g,15+A.hx,15+hb,2,1,"#ff8ab0"); }
  // tall horned hat: violet + gold bands + eye gem + brim
  px(g,8+A.hx,2+hb,16,4,"#3a0a4a"); px(g,8+A.hx,2+hb,16,1,"#6a2a9a"); px(g,8+A.hx,5+hb,16,1,gold);
  px(g,10+A.hx,-1+hb,12,4,"#2a0840"); px(g,10+A.hx,-1+hb,12,1,"#5a1a7a");
  px(g,12+A.hx,0+hb,8,2,gold); px(g,12+A.hx,0+hb,8,1,goldL); px(g,12+A.hx,1+hb,2,2,eye); px(g,13+A.hx,1+hb,1,1,"#fff");
  px(g,7+A.hx,5+hb,3,4,eye); px(g,7+A.hx,5+hb,1,4,"#fff"); px(g,22+A.hx,5+hb,3,4,eye); px(g,24+A.hx,5+hb,1,4,"#fff");
  px(g,9+A.hx,6+hb,14,1,"#1a0510");
};

/* ============ 2. EMBER INQUISITOR v7 — confession pyre ============ */
D.ember_inquisitor = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#7a2a0c", dk=shade(robe,-42), deep=shade(robe,-74), lite=shade(robe,32), pale=shade(robe,58);
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#e8a878", skinD="#b07a4a", skinL="#ffe0b8";
  auraShadow(g,hb,"rgba(255,122,42,0.24)","rgba(255,217,61,0.12)");
  spark(g,[3,18,"#ff7a2a"],[28,14,"#fff"],[26,33,"#ffd93d"]);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#140802"); px(g,16+A.rx,34+A.rd,6,2,"#140802");
  px(g,10+A.lx,34+A.ld,6,1,"#5a3a22");
  // cassock: ember panels, furnace stole, gold hem, fold shadows
  px(g,8,17,16,15,robe); px(g,8,17,16,2,lite); px(g,8,30,16,2,dk);
  px(g,8,17,2,15,deep); px(g,22,17,2,15,deep);
  px(g,11,19,10,11,"#2e1204"); px(g,12,20,8,9,"#ff7a2a"); px(g,13,21,6,7,"#ffd93d"); px(g,15,23,2,3,"#fff");
  px(g,14,20,1,8,"#7a1f0e"); px(g,17,20,1,8,"#7a1f0e");
  for(let y=22;y<29;y+=3) px(g,11,y,2,1,"#ff9d5a");
  px(g,15,19,2,2,"#c93b3b"); px(g,15,19,1,1,"#fff");
  px(g,8,29,16,2,gold); px(g,8,29,16,1,goldL); px(g,8,31,16,1,deep);
  px(g,10,30,2,1,"#fff"); px(g,16,30,2,1,"#ff7a2a");
  // LEFT arm + SCRIPTURE (burning page flares on atk)
  const fl=P.atk?1:0;
  px(g,4+A.lax,19+A.la,3,7,robe); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,24+A.la-fl,6,7,"#5a3a22"); px(g,3+A.lax,24+A.la-fl,6,1,gold);
  px(g,4+A.lax,25+A.la-fl,4,5,"#e8d9b8"); px(g,4+A.lax,25+A.la-fl,4,1,"#fff");
  px(g,5+A.lax,26+A.la-fl,2,3,"#ff5a1a"); px(g,5+A.lax,26+A.la-fl,1,1,"#fff");
  px(g,6+A.lax,28+A.la-fl,1,2,"#7a1f1f"); px(g,7+A.lax,28+A.la-fl,1,1,"#ff8a8a");
  px(g,3+A.lax,24+A.la-fl,1,7,"#8a5a33");
  // RIGHT arm + BRAND (raises on cast, ember glow)
  const up=P.atk?-5:0;
  g.fillStyle="rgba(255,122,42,0.30)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,5,0,7); g.fill();
  px(g,25+A.rax,19+A.ra+up,3,7,robe); px(g,25+A.rax,19+A.ra+up,1,7,lite);
  px(g,25+A.rax,13+A.ra+up,2,12,"#5a4a42"); px(g,25+A.rax,13+A.ra+up,1,12,"#c9a68a");
  px(g,23+A.rax,6+A.ra+up,6,8,"#ff7a2a"); px(g,23+A.rax,6+A.ra+up,6,1,"#fff"); px(g,24+A.rax,8+A.ra+up,4,4,"#fff");
  px(g,24+A.rax,9+A.ra+up,2,2,"#ff5a1a"); px(g,23+A.rax,6+A.ra+up,6,1,gold);
  px(g,24+A.rax,12+A.ra+up,4,1,"#7a1f0e");
  // pointed hood + shadowed face + gold eyes + blush
  px(g,8+A.hx,7+hb,16,5,deep); px(g,8+A.hx,7+hb,16,1,"#3a1c0a");
  px(g,10+A.hx,2+hb,12,7,lite); px(g,10+A.hx,2+hb,12,1,gold); px(g,10+A.hx,2+hb,2,7,robe);
  px(g,13+A.hx,0+hb,6,5,robe); px(g,13+A.hx,0+hb,6,1,lite);
  px(g,11+A.hx,9+hb,10,8,"#2a1204"); px(g,11+A.hx,9+hb,10,1,"#4a2008");
  px(g,11+A.hx,9+hb,10,7,skin); px(g,11+A.hx,9+hb,10,1,skinL); px(g,11+A.hx,15+hb,10,2,skinD);
  px(g,11+A.hx,9+hb,1,7,skinD); px(g,20+A.hx,9+hb,1,7,skinD);
  px(g,11+A.hx,13+hb,2,1,"#e8a080"); px(g,19+A.hx,13+hb,2,1,"#e8a080");
  px(g,12+A.hx,11+hb,3,1,"#3a1404"); px(g,17+A.hx,11+hb,3,1,"#3a1404");
  px(g,12+A.hx,12+hb,3,2,gold); px(g,17+A.hx,12+hb,3,2,gold);
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,18+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,15+A.hx,14+hb,2,1,"#7a2a0a"); px(g,15+A.hx,15+hb,2,1,"#ff7a2a");
  // censer sparks + brand shimmer
  px(g,3,27,2,4,"#ff7a2a"); px(g,3,27,1,1,"#fff"); px(g,27,28,2,4,"#ff7a2a"); px(g,27,28,1,1,"#fff");
  px(g,15,19,2,1,"#fff");
};

/* ============ 3. HOLLOW CANTOR v7 — song ghost ============ */
D.hollow_cantor = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const robe="#3a2a5e", dk=shade(robe,-38), deep=shade(robe,-70), lite=shade(robe,34), pale=shade(robe,58);
  const gold="#d9a91e", goldL="#ffe37a";
  const fl=P.moving?([0,2,-1,0][P.f&3]):(Math.sin((P.t||0)*4)*1|0);
  // glide: torso, mask and mitre sway with the stride while hovering.
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  auraShadow(g,hb,"rgba(150,130,220,0.26)","rgba(150,130,220,0.12)");
  spark(g,[3,20,"#c9c2ff"],[28,16,"#fff"],[26,33,"#c9c2ff"]);
  // tattered ghost hem drifting
  px(g,8,23+fl,4,9,robe); px(g,8,23+fl,1,9,lite);
  px(g,13,25-fl,3,7,robe); px(g,18,25+fl,3,7,robe); px(g,23,23-fl,4,9,robe); px(g,26,23-fl,1,9,lite);
  px(g,9,31+fl,2,1,pale); px(g,24,31-fl,2,1,pale);
  // torso: choir robe + split stole (ivory + void) + gold clasp + folds
  px(g,7+gl,11+hb,18,15,robe); px(g,7+gl,11+hb,18,2,lite); px(g,7+gl,24+hb,18,2,deep);
  px(g,7+gl,11+hb,2,15,deep); px(g,23+gl,11+hb,2,15,deep);
  px(g,10+gl,13+hb,4,11,"#e8e0d0"); px(g,10+gl,13+hb,4,1,"#fff"); px(g,10+gl,13+hb,1,11,"#b8ac9c");
  px(g,18+gl,13+hb,4,11,"#1a0a2e"); px(g,18+gl,13+hb,4,1,"#4a3a6a");
  for(let y=14+hb;y<23+hb;y+=2) px(g,15+gl,y,2,1,"rgba(0,0,0,0.25)");
  px(g,14+gl,15+hb,4,4,gold); px(g,14+gl,15+hb,4,1,goldL); px(g,15+gl,16+hb,2,2,"#8a7bff"); px(g,15+gl,16+hb,1,1,"#fff");
  px(g,14+gl,20+hb,4,2,"#c9a227");
  // arms raised conducting (sway on song) + pale hands + cuffs
  px(g,3,14+hb-fl,4,7,robe); px(g,3,14+hb-fl,1,7,lite); px(g,2,20+hb-fl,5,3,"#e8e0d0"); px(g,2,20+hb-fl,5,1,"#fff");
  px(g,25,14+hb+fl,4,7,robe); px(g,28,14+hb+fl,1,7,lite); px(g,25,20+hb+fl,5,3,"#e8e0d0"); px(g,25,20+hb+fl,5,1,"#fff");
  px(g,3,15+hb-fl,4,1,"#5a4a8a"); px(g,25,15+hb+fl,4,1,"#5a4a8a");
  // face: pale hymn mask, glowing violet eyes with catchlights, blush
  px(g,10+gl,6+hb,12,9,"#1a0a2e"); px(g,10+gl,6+hb,12,1,lite);
  px(g,10+gl,6+hb,12,9,"#e8e0ea"); px(g,10+gl,6+hb,12,1,"#fff"); px(g,10+gl,13+hb,12,2,"#b8a8c8");
  px(g,10+gl,6+hb,1,9,"#8a7a9a"); px(g,21+gl,6+hb,1,9,"#8a7a9a");
  px(g,11+gl,10+hb,2,1,"#e8a0b0"); px(g,19+gl,10+hb,2,1,"#e8a0b0");
  px(g,12+gl,8+hb,3,1,"#2a1a3a"); px(g,17+gl,8+hb,3,1,"#2a1a3a");
  px(g,12+gl,9+hb,3,3,"#fff"); px(g,17+gl,9+hb,3,3,"#fff");
  px(g,13+gl,10+hb,1,2,"#3a1a5a"); px(g,18+gl,10+hb,1,2,"#3a1a5a");
  px(g,13+gl,9+hb,1,1,"#fff"); px(g,18+gl,9+hb,1,1,"#fff");
  px(g,13+gl,10+hb,1,1,"#8a7bff"); px(g,18+gl,10+hb,1,1,"#8a7bff");
  // HYMN MAW (gapes on atk) + teeth + tongue
  const open=P.atk?5:2;
  px(g,12+gl,12+hb,8,4+open,"#0a0414"); px(g,13+gl,13+hb,6,2+open,"#7a2bff"); px(g,14+gl,14+hb,4,1+open,"#c9c2ff");
  px(g,13+gl,12+hb,2,1,"#fff"); px(g,17+gl,12+hb,2,1,"#fff");
  px(g,15+gl,15+hb,2,1,"#ff8a9a");
  // music rings + motes + breath
  px(g,3,5+hb,3,3,"#c9c2ff"); px(g,3,5+hb,1,1,"#fff"); px(g,26,7+hb,3,3,"#c9c2ff"); px(g,27,8+hb,1,1,"#fff");
  px(g,5,10+hb+fl,2,2,"#fff"); px(g,25,12+hb-fl,1,1,"#fff");
  if(P.atk){ px(g,2,12+hb,1,4,"#c9c2ff"); px(g,29,12+hb,1,4,"#c9c2ff"); }
  // mitre shards + gold trim + glow
  px(g,7+gl,0+hb,4,6,lite); px(g,7+gl,0+hb,4,1,pale); px(g,7+gl,0+hb,1,6,"#fff");
  px(g,21+gl,0+hb,4,6,lite); px(g,21+gl,0+hb,4,1,pale); px(g,24+gl,0+hb,1,6,"#fff");
  px(g,7+gl,5+hb,4,1,gold); px(g,21+gl,5+hb,4,1,gold);
};

/* ============ 4. NETHER ABBESS v7 — hollow prayer ============ */
D.nether_abbess = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#3a1a60", dk=shade(robe,-40), deep=shade(robe,-72), lite=shade(robe,34);
  const gold="#d9a91e", goldL="#ffe37a";
  const skin="#d8c8d8", skinD="#a898b8", skinL="#f2e8f2";
  auraShadow(g,hb,"rgba(122,43,255,0.24)","rgba(122,43,255,0.12)");
  spark(g,[3,20,"#8a7bff"],[28,16,"#fff"],[26,33,"#c9c2ff"]);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#000"); px(g,16+A.rx,34+A.rd,6,2,"#000");
  // habit: violet panels, void icon chest, gold hem, folds
  px(g,7,17,18,15,robe); px(g,7,17,18,2,lite); px(g,7,30,18,2,dk);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  for(let y=19;y<29;y+=2) px(g,15,y,1,2,"rgba(0,0,0,0.28)");
  px(g,12,19,8,9,"#0e0616"); px(g,13,20,6,7,"#8a7bff"); px(g,14,21,4,5,"#c9c2ff"); px(g,15,22,2,2,"#fff");
  px(g,12,19,8,1,gold); px(g,12,26,8,1,goldD0()); function goldD0(){ return "#8a6410"; }
  px(g,13,20,1,6,"#fff"); px(g,18,20,1,6,"#4a3a7a");
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL); px(g,7,31,18,1,deep);
  px(g,10,30,2,1,"#fff"); px(g,15,30,2,1,"#8a7bff"); px(g,21,30,2,1,"#fff");
  // LEFT arm + sanctus BELL (gold, dark band, clapper + glint)
  px(g,4+A.lax,19+A.la,3,7,robe); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,24+A.la,6,6,gold); px(g,3+A.lax,24+A.la,6,1,goldL);
  px(g,3+A.lax,28+A.la,6,1,"#8a6410");
  px(g,4+A.lax,26+A.la,4,3,robe); px(g,5+A.lax,29+A.la,2,2,"#8a7bff"); px(g,5+A.lax,29+A.la,1,1,"#fff");
  px(g,3+A.lax,24+A.la,1,6,"#fff");
  // RIGHT arm + swinging CENSER (chain, glowing core, halo)
  const sw=Sg(P,1,1);
  px(g,25+A.rax,17+A.ra,2,7,gold); px(g,25+A.rax,17+A.ra,1,7,goldL);
  g.fillStyle="rgba(138,123,255,0.30)"; g.beginPath(); g.arc(25+A.rax+sw,26+A.ra,5,0,7); g.fill();
  px(g,23+A.rax+sw,23+A.ra,5,6,gold); px(g,23+A.rax+sw,23+A.ra,5,1,goldL);
  px(g,24+A.rax+sw,24+A.ra,3,4,"#8a7bff"); px(g,25+A.rax+sw,25+A.ra,1,1,"#fff");
  px(g,23+A.rax+sw,28+A.ra,5,1,"#8a6410");
  // VEIL + face + brow gem + blush + detailed eyes
  px(g,6+A.hx,5+hb,20,6,"#0e0616"); px(g,6+A.hx,5+hb,20,1,"#3a2a5a");
  px(g,7+A.hx,8+hb,18,4,"#0e0616");
  px(g,10+A.hx,10+hb,12,8,skin); px(g,10+A.hx,10+hb,12,1,skinL); px(g,10+A.hx,16+hb,12,2,skinD);
  px(g,10+A.hx,10+hb,1,8,skinD); px(g,21+A.hx,10+hb,1,8,skinD);
  px(g,11+A.hx,12+hb,2,1,"#e8a0b0"); px(g,19+A.hx,12+hb,2,1,"#e8a0b0");
  px(g,12+A.hx,11+hb,3,1,"#2a1a3a"); px(g,17+A.hx,11+hb,3,1,"#2a1a3a");
  px(g,12+A.hx,12+hb,3,3,"#1a0a24"); px(g,17+A.hx,12+hb,3,3,"#1a0a24");
  px(g,13+A.hx,13+hb,1,2,"#c9c2ff"); px(g,18+A.hx,13+hb,1,2,"#c9c2ff");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,15+A.hx,15+hb,2,1,robe);
  if(P.atk){ px(g,14+A.hx,15+hb,4,2,"#3a0a20"); px(g,15+A.hx,15+hb,2,1,"#ff8ab0"); }
  px(g,14+A.hx,0+hb,4,5,"#8a7bff"); px(g,14+A.hx,0+hb,4,1,"#fff"); px(g,15+A.hx,2+hb,2,2,"#c9c2ff"); px(g,15+A.hx,2+hb,1,1,"#fff");
  px(g,13+A.hx,5+hb,6,1,gold);
};

/* ============ 5. PYRE QUEEN v7 — burning beauty ============ */
D.pyre_queen = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const flame="#ff4a1a", dk=shade(flame,-46), deep=shade(flame,-78), lite=shade(flame,36), pale="#ff9a6a";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#e8a080", skinD="#b06a4a", skinL="#ffe0c0";
  auraShadow(g,hb,"rgba(255,110,30,0.26)","rgba(255,217,61,0.14)");
  spark(g,[3,20,"#ffd93d"],[28,16,"#fff"],[25,33,"#ff7a2a"]);
  // gown: wide triangle, layered flames, gold waist, ember hem + folds
  px(g,7,24,18,8,deep); px(g,7,24,18,2,flame);
  px(g,9,22,14,6,"#c92a0a"); px(g,9,22,14,2,gold); px(g,9,22,14,1,goldL);
  for(let x=8;x<24;x+=3){ px(g,x,26,2,6,flame); px(g,x,26,1,1,lite); px(g,x+1,27,1,4,deep); }
  px(g,11,26,4,8,flame); px(g,11,26,1,8,lite); px(g,13,26,1,8,deep);
  px(g,17,26,4,8,flame); px(g,20,26,1,8,"#c92a0a");
  px(g,12,24,8,2,gold); px(g,12,24,8,1,goldL); px(g,12,25,8,1,goldD);
  px(g,15,25,2,2,"#c93b3b"); px(g,15,25,1,1,"#fff");
  px(g,8,34,16,2,"#ff7a2a"); px(g,10,34,3,2,gold); px(g,19,34,3,2,gold); px(g,11,34,1,1,"#fff");
  px(g,8,35,16,1,deep);
  // torso: ember bodice + gold + cleavage glow
  px(g,9,15,14,8,flame); px(g,9,15,14,2,lite); px(g,9,21,14,2,dk);
  px(g,9,15,2,8,deep); px(g,21,15,2,8,deep);
  px(g,12,17,8,5,"#7a1e04"); px(g,13,18,6,3,gold); px(g,14,19,4,2,"#fff"); px(g,15,19,2,1,"#ff5a1a");
  // arms: flame sleeves + gold cuffs + hands
  px(g,5+A.lax,17+A.la,3,7,flame); px(g,5+A.lax,17+A.la,1,7,lite);
  px(g,5+A.lax,23+A.la,3,3,gold); px(g,5+A.lax,23+A.la,3,1,goldL);
  px(g,5+A.lax,26+A.la,3,3,skin); px(g,5+A.lax,26+A.la,1,3,skinL);
  // WAR FAN sweeping (fans out on atk) + gold ribs + jewel
  const fw=P.atk?2:-2;
  g.fillStyle=gold; g.beginPath(); g.moveTo(24+A.rax,22+A.ra); g.lineTo(31+A.rax,13+A.ra+fw); g.lineTo(30+A.rax,23+A.ra); g.fill();
  g.fillStyle=flame; g.beginPath(); g.moveTo(25+A.rax,22+A.ra); g.lineTo(30+A.rax,15+A.ra+fw); g.lineTo(29+A.rax,22+A.ra); g.fill();
  px(g,24+A.rax,21+A.ra,6,2,"#7a1e04"); px(g,24+A.rax,21+A.ra,2,2,gold); px(g,28+A.rax,16+A.ra+fw,1,2,"#fff");
  px(g,25+A.rax,23+A.ra,2,4,skin);
  // face: warm beauty, gold-red eyes + catchlights + blush + red lips
  px(g,10+A.hx,6+hb,12,10,skin); px(g,10+A.hx,6+hb,12,2,skinL); px(g,10+A.hx,14+hb,12,2,skinD);
  px(g,10+A.hx,6+hb,2,10,skinD); px(g,20+A.hx,6+hb,2,10,skinD);
  px(g,11+A.hx,11+hb,2,1,"#f0a080"); px(g,19+A.hx,11+hb,2,1,"#f0a080");
  px(g,12+A.hx,9+hb,3,1,"#5a1408"); px(g,17+A.hx,9+hb,3,1,"#5a1408");
  px(g,12+A.hx,10+hb,3,3,"#ffe14d"); px(g,17+A.hx,10+hb,3,3,"#ff6a2a");
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,18+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,13+A.hx,14+hb,6,2,"#7a1e04"); px(g,14+A.hx,14+hb,4,1,"#ff6a6a"); px(g,15+A.hx,14+hb,2,1,"#fff");
  // FLAME CROWN with white core + gold base + ember tips
  px(g,10+A.hx,5+hb,12,2,gold); px(g,10+A.hx,5+hb,12,1,goldL);
  px(g,8+A.hx,0+hb,4,7,"#ff7a2a"); px(g,8+A.hx,0+hb,1,7,gold); px(g,9+A.hx,1+hb,1,4,"#fff");
  px(g,13+A.hx,-1+hb,6,8,gold); px(g,13+A.hx,-1+hb,6,1,"#fff"); px(g,15+A.hx,1+hb,2,5,"#fff"); px(g,15+A.hx,1+hb,1,1,"#fff");
  px(g,20+A.hx,0+hb,4,7,"#ff7a2a"); px(g,23+A.hx,0+hb,1,7,gold);
  px(g,13+A.hx,6+hb,6,1,"#ff9d5a");
};

/* ============ 6. VOID PRELATE v7 — dark seeing ============ */
D.void_prelate = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#1a0a30", dk=shade(robe,-22), deep="#05030c", lite="#4a3a8a";
  const eye="#8a7bff", eyeL="#c9c2ff";
  const gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(122,74,224,0.28)","rgba(138,123,255,0.14)");
  spark(g,[3,20,eye],[28,16,"#fff"],[26,33,eyeL]);
  // floating broken halo + shards + glints
  px(g,9,1+hb,5,2,"#2a1a4a"); px(g,18,1+hb,5,2,"#2a1a4a");
  px(g,9,1+hb,5,1,eye); px(g,18,1+hb,5,1,eye);
  px(g,7,3+hb,2,3,eye); px(g,7,3+hb,1,1,"#fff"); px(g,23,3+hb,2,3,eye); px(g,23,3+hb,1,1,"#fff");
  px(g,8,0+hb,2,2,eye); px(g,22,0+hb,2,2,eyeL);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#000"); px(g,16+A.rx,34+A.rd,6,2,"#000");
  // cope: void panels, violet stole, gold hem, folds
  px(g,7,17,18,15,robe); px(g,7,17,18,2,lite); px(g,7,30,18,2,deep);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  px(g,11,19,3,11,eye); px(g,11,19,3,1,"#fff"); px(g,18,19,3,11,"#3a2a7a"); px(g,18,19,3,1,eye);
  for(let y=20;y<29;y+=2) px(g,15,y,2,1,"rgba(138,123,255,0.30)");
  px(g,14,21,4,5,"#0a0616"); px(g,15,22,2,3,eye); px(g,15,22,1,1,"#fff");
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL);
  px(g,10,30,2,1,"#fff"); px(g,16,30,2,1,eye);
  // left arm + void tome (glowing pages)
  px(g,4+A.lax,19+A.la,3,7,robe); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,24+A.la,5,6,"#2a1a4a"); px(g,3+A.lax,24+A.la,5,1,eye);
  px(g,4+A.lax,25+A.la,3,4,eye); px(g,4+A.lax,25+A.la,1,1,"#fff"); px(g,5+A.lax,26+A.la,1,2,"#4a3a8a");
  // right arm + BEAM STAFF (halo glow, flares on cast)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(138,123,255,0.32)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#0a0812"); px(g,25+A.rax,12+A.ra+up,1,16,"#4a3a7a");
  px(g,22+A.rax,4+A.ra+up,8,9,"#0a0812"); px(g,22+A.rax,4+A.ra+up,8,1,eye);
  px(g,23+A.rax,5+A.ra+up,6,7,eye); px(g,24+A.rax,6+A.ra+up,4,5,"#fff"); px(g,25+A.rax,8+A.ra+up,2,2,eye);
  px(g,22+A.rax,11+A.ra+up,8,2,gold);
  if(P.atk){ px(g,24+A.rax,13+A.ra,2,8,eye); px(g,24+A.rax,13+A.ra,1,2,"#fff"); px(g,24+A.rax,21+A.ra,1,2,eyeL); }
  // hooded void face: pale blaze eyes + slit pupils + catchlights + mouth
  px(g,10+A.hx,7+hb,12,11,"#0a0812"); px(g,10+A.hx,7+hb,12,1,"#2a2a3a");
  px(g,10+A.hx,7+hb,2,11,lite); px(g,20+A.hx,7+hb,2,11,"#000");
  px(g,11+A.hx,7+hb,10,1,"#3a2a5a");
  px(g,12+A.hx,10+hb,3,1,"#1a0a24"); px(g,17+A.hx,10+hb,3,1,"#1a0a24");
  px(g,12+A.hx,11+hb,3,3,eyeL); px(g,17+A.hx,11+hb,3,3,eyeL);
  px(g,12+A.hx,11+hb,3,1,"#fff"); px(g,17+A.hx,11+hb,3,1,"#fff");
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,18+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,11+hb,1,1,"#fff");
  px(g,14+A.hx,15+hb,4,2,"#3a2a7a"); px(g,15+A.hx,16+hb,2,1,eye);
  if(P.atk){ px(g,14+A.hx,15+hb,4,1,"#fff"); }
};

/* ============ 7. ORGAN CHOIRMASTER v7 — choir of guts ============ */
D.organ_choirmaster = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const robe="#6a2a3a", dk=shade(robe,-36), deep=shade(robe,-68), lite=shade(robe,34), pale="#c98a9a";
  const gold="#d9a91e", goldL="#ffe37a";
  const fl=P.moving?([0,2,-1,0][P.f&3]):(Math.sin((P.t||0)*5)*1|0);
  // glide: torso, pipes and mask sway with the stride while hovering.
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  auraShadow(g,hb,"rgba(200,120,140,0.26)","rgba(200,120,140,0.12)");
  spark(g,[3,20,"#ff8aaa"],[28,16,"#fff"],[26,33,"#ffb0c0"]);
  // tattered tails + hems
  px(g,8,24+fl,4,9,robe); px(g,8,24+fl,1,9,lite);
  px(g,13,26-fl,3,7,robe); px(g,18,26+fl,3,7,robe);
  px(g,23,24-fl,4,9,robe); px(g,26,24-fl,1,9,lite);
  px(g,9,32+fl,2,1,pale); px(g,24,32-fl,2,1,pale);
  // ORGAN-PIPE COLLAR (5 pipes, gold/silver alternating, dark gaps + glints)
  for(let i=0;i<5;i++){ const cc=i%2?gold:"#8a8a9a"; px(g,6+i*4+gl,12+hb,3,7,cc); px(g,6+i*4+gl,12+hb,3,1,"#fff"); px(g,6+i*4+gl,18+hb,3,1,"#3a2a30"); px(g,6+i*4+gl,13+hb,1,3,"rgba(0,0,0,0.25)"); }
  px(g,6+gl,11+hb,23,2,gold); px(g,6+gl,11+hb,23,1,goldL);
  // torso + song heart + folds
  px(g,7+gl,19+hb,18,11,robe); px(g,7+gl,19+hb,18,2,lite); px(g,7+gl,28+hb,18,2,deep);
  px(g,7+gl,19+hb,2,11,deep); px(g,23+gl,19+hb,2,11,deep);
  for(let y=21+hb;y<28+hb;y+=2) px(g,15+gl,y,1,2,"rgba(0,0,0,0.25)");
  px(g,13+gl,22+hb,6,5,"#3a1a24"); px(g,14+gl,23+hb,4,3,"#ff5a7a"); px(g,15+gl,24+hb,2,1,"#fff");
  px(g,12+gl,22+hb,1,4,pale); px(g,19+gl,22+hb,1,4,pale);
  // arms: left holds score, right WAVES BATON (lifts on atk)
  px(g,3+gl,20+hb,4,6,robe); px(g,3+gl,20+hb,1,6,lite);
  px(g,2+gl,25+hb,5,4,"#e8e0d0"); px(g,2+gl,25+hb,5,1,"#fff"); px(g,3+gl,26+hb,3,2,"#3a1a24"); px(g,3+gl,26+hb,1,1,goldL);
  const wv=P.atk?3:0;
  px(g,23+gl,18+hb+wv,4,6,robe); px(g,23+gl,18+hb+wv,1,6,lite);
  px(g,22+gl,16+hb+wv,7,2,"#e8e0d0"); px(g,22+gl,16+hb+wv,7,1,"#fff");
  px(g,26+gl,13+hb+wv,2,4,gold); px(g,26+gl,13+hb+wv,1,1,"#fff");
  g.fillStyle="rgba(255,217,61,0.25)"; g.beginPath(); g.arc(27+gl,13+hb+wv,4,0,7); g.fill();
  // face: pale choir mask, open song mouth, glowing eyes + blush
  px(g,10+gl,6+hb,12,8,"#2a0a12"); px(g,10+gl,6+hb,12,1,pale);
  px(g,10+gl,6+hb,12,8,"#e8c8c8"); px(g,10+gl,6+hb,12,1,"#fff"); px(g,10+gl,12+hb,12,2,"#b898a8");
  px(g,10+gl,6+hb,1,8,"#8a6a7a"); px(g,21+gl,6+hb,1,8,"#8a6a7a");
  px(g,12+gl,8+hb,3,1,"#3a1a24"); px(g,17+gl,8+hb,3,1,"#3a1a24");
  px(g,12+gl,9+hb,3,3,"#1a0a12"); px(g,17+gl,9+hb,3,3,"#1a0a12");
  px(g,13+gl,10+hb,1,2,"#ff8aaa"); px(g,18+gl,10+hb,1,2,"#ff8aaa");
  px(g,12+gl,9+hb,1,1,"#fff"); px(g,17+gl,9+hb,1,1,"#fff");
  px(g,11+gl,11+hb,2,1,"#e8a0a0"); px(g,19+gl,11+hb,2,1,"#e8a0a0");
  if(!P.atk){ px(g,13+gl,12+hb,6,4,"#2a0a12"); px(g,14+gl,13+hb,4,2,"#ff5a7a"); px(g,15+gl,13+hb,2,1,"#fff"); }
  else{ px(g,12+gl,12+hb,8,5,"#2a0a12"); px(g,13+gl,13+hb,6,3,"#5a1a2a"); px(g,14+gl,14+hb,4,1,"#ff8aaa"); px(g,13+gl,12+hb,2,1,"#fff"); }
  px(g,4,5+hb,2,2,"#ff5a7a"); px(g,4,5+hb,1,1,"#fff"); px(g,26,6+hb,2,2,"#ff8aaa"); px(g,5,6+hb,1,1,"#fff");
};

/* ============ 8. SKIN POPE v7 — sunday best ============ */
D.skin_pope = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#c09a8a", dk=shade(skin,-42), deep=shade(skin,-72), lite="#e8c9b8";
  const gold="#d9a91e", goldL="#ffe37a", goldD="#8a6410";
  auraShadow(g,hb,"rgba(255,179,90,0.24)","rgba(255,217,61,0.12)");
  spark(g,[3,20,"#ffb35a"],[28,16,"#fff"],[26,33,"#ffb35a"]);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#1c1210"); px(g,16+A.rx,34+A.rd,6,2,"#1c1210");
  px(g,10+A.lx,34+A.ld,6,1,"#5a4a3a");
  // white cope + skin stole + blood clasp + gold hem + folds
  px(g,7,17,18,15,skin); px(g,7,17,2,15,deep);
  px(g,7,17,18,2,"#fff"); px(g,7,30,18,2,dk);
  for(let y=19;y<29;y+=2) px(g,15,y,1,2,"rgba(0,0,0,0.20)");
  px(g,11,19,10,10,"#a06a5a"); px(g,11,19,10,1,lite);
  px(g,11,19,2,10,deep); px(g,19,19,2,10,deep);
  px(g,13,21,6,6,"#7a1a1a"); px(g,14,22,4,4,"#ff8a8a"); px(g,15,23,2,2,"#fff");
  px(g,13,21,6,1,"#ffb0a0");
  px(g,14,27,4,2,gold); px(g,15,28,2,1,"#7a1a1a"); px(g,15,27,1,1,goldL);
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL); px(g,7,31,18,1,deep);
  // left arm + blessing hand + ring
  px(g,4+A.lax,19+A.la,3,7,skin); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,4+A.lax,26+A.la,3,2,lite); px(g,4+A.lax,28+A.la,3,3,skin);
  px(g,5+A.lax,29+A.la,2,1,gold); px(g,5+A.lax,29+A.la,1,1,goldL);
  // right arm + SKIN LANTERN (halo + raises on rite)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(255,179,90,0.30)"; g.beginPath(); g.arc(26+A.rax,9+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#8a6a4a"); px(g,25+A.rax,12+A.ra+up,1,16,"#e8c9a8");
  px(g,22+A.rax,5+A.ra+up,8,8,"#e8d9c9"); px(g,22+A.rax,5+A.ra+up,8,1,"#fff");
  px(g,23+A.rax,6+A.ra+up,6,6,"#ffb35a"); px(g,24+A.rax,7+A.ra+up,4,3,"#fff"); px(g,25+A.rax,8+A.ra+up,2,2,"#ff8a5a");
  px(g,22+A.rax,11+A.ra+up,8,2,gold); px(g,22+A.rax,5+A.ra+up,8,1,goldL);
  // face: sallow + stitched cheek + pale eyes + blood lips + blush
  px(g,10+A.hx,9+hb,12,9,lite); px(g,10+A.hx,9+hb,12,1,"#fff"); px(g,10+A.hx,16+hb,12,2,skin);
  px(g,10+A.hx,9+hb,1,9,skinD0()); function skinD0(){ return "#a08070"; }
  px(g,21+A.hx,9+hb,1,9,"#8a6a5a");
  px(g,11+A.hx,12+hb,2,1,"#e8a090"); px(g,19+A.hx,12+hb,2,1,"#e8a090");
  px(g,12+A.hx,10+hb,3,1,"#3a2a22"); px(g,17+A.hx,10+hb,3,1,"#3a2a22");
  px(g,12+A.hx,11+hb,3,3,"#fff"); px(g,17+A.hx,11+hb,3,3,"#fff");
  px(g,13+A.hx,12+hb,1,2,"#3a2a3a"); px(g,18+A.hx,12+hb,1,2,"#3a2a3a");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,11+hb,1,1,"#ff8a8a"); px(g,18+A.hx,11+hb,1,1,"#ff8a8a");
  px(g,11+A.hx,14+hb,1,3,"#7a1a1a"); px(g,13+A.hx,15+hb,1,1,"#7a1a1a"); px(g,15+A.hx,14+hb,1,1,"#7a1a1a");
  px(g,13+A.hx,15+hb,6,2,"#7a1a1a"); px(g,14+A.hx,15+hb,4,1,"#ff8a8a");
  // TRIPLE-TIER MITRE + gold bands + jewel + stitch
  px(g,10+A.hx,5+hb,12,4,"#fff"); px(g,10+A.hx,5+hb,12,1,"#e8d9c9"); px(g,10+A.hx,8+hb,12,1,gold);
  px(g,11+A.hx,1+hb,10,5,"#e8d9c9"); px(g,11+A.hx,1+hb,10,1,"#fff"); px(g,11+A.hx,5+hb,10,1,gold);
  px(g,12+A.hx,-2+hb+3,8,4,"#fff"); px(g,12+A.hx,1+hb,8,1,"#e8d9c9"); px(g,12+A.hx,2+hb,8,1,gold);
  px(g,15+A.hx,2+hb,2,2,"#c93b3b"); px(g,15+A.hx,2+hb,1,1,"#fff");
  px(g,13+A.hx,6+hb,6,1,"#8a6a5a");
};

/* ============ 9. SUCCUBUS MATRIARCH v7 — siren court ============ */
D.succubus_matriarch = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#ff6ab0", dk="#5a1638", deep="#2e0a1c", lite="#ff9ac0", pale="#ffc0d8";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const hair="#2a0a18";
  auraShadow(g,hb,"rgba(255,42,106,0.26)","rgba(255,42,106,0.12)");
  spark(g,[3,20,"#ff2a6a"],[28,14,"#fff"],[26,33,"#ff8ac0"]);
  const WA=Wflap(P);
  // wings: layered + pale rims + finger separations
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?11:21,20); g.rotate(s<0?WA:-WA); g.translate(s<0?-11:-21,-20);
    g.fillStyle="#8a1a44"; g.beginPath();
    if(s<0){ g.moveTo(11,20); g.lineTo(0,4); g.lineTo(2,12); g.lineTo(5,10); g.lineTo(8,16); } else { g.moveTo(21,20); g.lineTo(32,4); g.lineTo(30,12); g.lineTo(27,10); g.lineTo(24,16); }
    g.fill();
    g.fillStyle="#b02a5a"; g.beginPath();
    if(s<0){ g.moveTo(10,19); g.lineTo(3,9); g.lineTo(6,14); } else { g.moveTo(22,19); g.lineTo(29,9); g.lineTo(26,14); }
    g.fill(); g.restore();
    px(g,s<0?0:30,4,2,3,"#ff2a6a"); px(g,s<0?0:30,4,1,1,"#fff");
    px(g,s<0?2:28,8,2,5,pale); px(g,s<0?2:28,8,2,1,"#fff");
  }
  // gown: magenta + folds + gold belt + jewel
  px(g,6,25,20,8,dk); px(g,6,25,20,2,skin); px(g,6,32,20,2,deep);
  px(g,6,25,2,8,deep); px(g,24,25,2,8,deep);
  for(let x=8;x<24;x+=3){ px(g,x,27,2,4,dk); px(g,x,27,1,1,lite); }
  px(g,8,25,16,4,"#c93a70"); px(g,9,27,14,2,gold); px(g,9,27,14,1,goldL); px(g,10,28,2,1,"#fff");
  px(g,14,27,4,2,"#c93b3b"); px(g,15,28,1,1,"#fff");
  // torso: siren bodice + lace + heart jewel
  px(g,7,16,18,10,skin); px(g,7,16,18,2,lite); px(g,7,24,18,2,dk);
  px(g,7,16,2,10,deep); px(g,23,16,2,10,deep);
  px(g,11,18,10,6,"#ff8ac0"); px(g,12,19,8,4,pale); px(g,14,20,4,2,"#ff2a6a"); px(g,15,21,1,1,"#fff");
  px(g,12,22,8,1,goldD);
  // LEFT arm + claw + bracelet
  px(g,5+A.lax,18+A.la,3,7,skin); px(g,5+A.lax,18+A.la,1,7,lite);
  px(g,5+A.lax,24+A.la,3,2,gold); px(g,5+A.lax,24+A.la,3,1,goldL);
  px(g,5+A.lax,26+A.la,3,3,"#e8b098"); px(g,6+A.lax,27+A.la,1,2,"#fff");
  // RIGHT arm + heart lantern (halo + raises on charm)
  const up=P.atk?-5:0;
  g.fillStyle="rgba(255,42,106,0.30)"; g.beginPath(); g.arc(26+A.rax,9+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,14,"#8a6a2a"); px(g,25+A.rax,12+A.ra+up,1,14,goldL);
  px(g,22+A.rax,6+A.ra+up,8,8,"#ff2a6a"); px(g,22+A.rax,6+A.ra+up,8,1,pale);
  px(g,23+A.rax,7+A.ra+up,6,5,"#fff"); px(g,24+A.rax,8+A.ra+up,4,3,"#ff2a6a"); px(g,25+A.rax,9+A.ra+up,1,1,"#fff");
  px(g,22+A.rax,12+A.ra+up,8,2,gold);
  // face: warm beauty, gold eyes + lash + blush + red lips + fangs
  px(g,10+A.hx,6+hb,12,10,skin); px(g,10+A.hx,6+hb,12,1,pale); px(g,10+A.hx,14+hb,12,2,dk);
  px(g,10+A.hx,6+hb,1,10,deep); px(g,21+A.hx,6+hb,1,10,deep);
  px(g,11+A.hx,11+hb,2,1,"#ffb0c0"); px(g,19+A.hx,11+hb,2,1,"#ffb0c0");
  px(g,12+A.hx,9+hb,3,1,"#4a0a20"); px(g,17+A.hx,9+hb,3,1,"#4a0a20");
  px(g,12+A.hx,10+hb,3,3,"#ffe14d"); px(g,17+A.hx,10+hb,3,3,"#ffe14d");
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,18+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,13+A.hx,14+hb,6,2,"#7a0a20"); px(g,14+A.hx,15+hb,1,2,"#fff"); px(g,17+A.hx,15+hb,1,2,"#fff"); px(g,15+A.hx,15+hb,2,1,"#ff6a8a");
  // hair + triple heart crown + jewels
  px(g,9+A.hx,3+hb,14,4,hair); px(g,9+A.hx,3+hb,14,1,"#5a1a30");
  for(let i=0;i<3;i++){ const ccx=11+i*4+A.hx; px(g,ccx,1+hb,3,4,gold); px(g,ccx,1+hb,3,1,goldL); px(g,ccx+1,2+hb,1,2,"#ff2a6a"); px(g,ccx+1,2+hb,1,1,"#fff"); }
  px(g,9+A.hx,5+hb,14,1,goldD);
};

/* ============ 10. VOLCANO PONTIFF v7 — eruption rite ============ */
D.volcano_pontiff = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#5a1e04", dk=shade(robe,-28), deep="#200a02", lite="#8a4a1a";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6a1a";
  const skin="#c98a5a", skinD="#8a5a33", skinL="#f2c090";
  auraShadow(g,hb,"rgba(255,122,42,0.26)","rgba(255,217,61,0.12)");
  spark(g,[3,20,"#ff7a2a"],[28,16,"#fff"],[26,33,"#ff7a2a"]);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#0e0502"); px(g,16+A.rx,34+A.rd,6,2,"#0e0502");
  // cope: deep ember, gold clasp column, gold hem, folds
  px(g,7,17,18,15,robe); px(g,7,17,18,2,lite); px(g,7,30,18,2,deep);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  for(let y=19;y<29;y+=2) px(g,9,y,2,2,"rgba(0,0,0,0.25)");
  px(g,13,19,6,9,gold); px(g,13,19,6,1,goldL); px(g,13,26,6,2,goldD);
  px(g,14,20,4,7,"#ff5a1a"); px(g,15,21,2,5,"#fff"); px(g,15,21,1,1,"#fff"); px(g,16,23,1,2,"#ff5a1a");
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL);
  // left arm + blessing hand + gold cuff + ring
  px(g,4+A.lax,19+A.la,3,7,robe); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,4+A.lax,24+A.la,3,3,gold); px(g,4+A.lax,24+A.la,3,1,goldL);
  px(g,4+A.lax,27+A.la,3,2,skin); px(g,5+A.lax,28+A.la,1,1,goldL);
  // right arm + LAVA-ORB STAFF (raises on cast, halo glow)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(255,122,42,0.32)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#3a2a1a"); px(g,25+A.rax,12+A.ra+up,1,16,"#c9a068");
  px(g,22+A.rax,4+A.ra+up,8,9,gold); px(g,22+A.rax,4+A.ra+up,8,1,"#fff");
  px(g,23+A.rax,5+A.ra+up,6,7,"#ff5a1a"); px(g,24+A.rax,6+A.ra+up,4,4,"#fff"); px(g,25+A.rax,7+A.ra+up,2,2,"#ff5a1a");
  px(g,22+A.rax,11+A.ra+up,8,2,goldD); px(g,22+A.rax,4+A.ra+up,8,1,goldL);
  // SPLIT MITRE + face with blush + detailed eyes
  px(g,9+A.hx,1+hb,14,9,gold); px(g,9+A.hx,1+hb,14,1,"#fff");
  px(g,14+A.hx,1+hb,4,9,robe); px(g,14+A.hx,1+hb,1,9,"#8a4a1a"); px(g,17+A.hx,1+hb,1,9,"#8a4a1a");
  px(g,9+A.hx,8+hb,14,2,"#ff5a1a"); px(g,10+A.hx,8+hb,12,1,goldL);
  px(g,10+A.hx,10+hb,12,8,skin); px(g,10+A.hx,10+hb,12,1,skinL); px(g,10+A.hx,16+hb,12,2,skinD);
  px(g,10+A.hx,10+hb,1,8,skinD); px(g,21+A.hx,10+hb,1,8,skinD);
  px(g,11+A.hx,13+hb,2,1,"#e8a080"); px(g,19+A.hx,13+hb,2,1,"#e8a080");
  px(g,12+A.hx,11+hb,3,1,"#3a1a08"); px(g,17+A.hx,11+hb,3,1,"#3a1a08");
  px(g,12+A.hx,12+hb,3,2,"#1a0a04"); px(g,17+A.hx,12+hb,3,2,"#1a0a04");
  px(g,13+A.hx,13+hb,1,1,"#ff7a2a"); px(g,18+A.hx,13+hb,1,1,"#ff7a2a");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,15+A.hx,15+hb,2,1,deep);
  if(P.atk){ px(g,14+A.hx,15+hb,4,2,"#5a1a08"); px(g,15+A.hx,15+hb,2,1,"#ff8a5a"); }
  px(g,15+A.hx,2+hb,2,4,"#ff5a1a"); px(g,15+A.hx,2+hb,1,1,"#fff");
};

/* ============ 11. UMBRAL MATRIARCH v7 — dark embrace ============ */
D.umbral_matriarch = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#2a1040", dk=shade(robe,-22), deep="#0c0416", lite="#5a3a8a";
  const eye="#7a2bff", eyeL="#c9c2ff";
  const gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(122,43,255,0.28)","rgba(200,180,255,0.14)");
  spark(g,[3,20,"#8a7bff"],[28,16,"#fff"],[26,33,"#c9c2ff"]);
  // gown: layered violet, star band, dark hem + folds
  px(g,6,24,20,8,lite); px(g,6,24,20,2,"#8a7bff"); px(g,6,30,20,2,dk);
  px(g,8,26,16,8,robe); px(g,8,26,16,2,"#3a2a6a");
  for(let x=9;x<23;x+=3){ px(g,x,27,2,4,deep); px(g,x,27,1,1,lite); }
  px(g,9,28,5,2,"#8a7bff"); px(g,9,28,1,1,"#fff"); px(g,18,30,5,2,eyeL); px(g,19,30,1,1,"#fff");
  px(g,6,24,2,8,deep); px(g,24,24,2,8,deep);
  px(g,9,24,14,1,"#2a1a4a");
  // bodice + jeweled brooch + gold trim
  px(g,8,16,16,10,robe); px(g,8,16,16,2,lite); px(g,8,24,16,2,dk);
  px(g,13,19,6,6,"#1a0a2e"); px(g,14,20,4,4,eye); px(g,15,21,2,2,"#fff"); px(g,15,21,1,1,eyeL);
  px(g,11,24,10,1,gold); px(g,12,24,1,1,goldL);
  // CLAWED SLEEVES (right slashes on atk) + pale claws
  const sw=P.atk?-3:0;
  px(g,3+A.lax,17+A.la,4,8,robe); px(g,3+A.lax,17+A.la,1,8,lite);
  px(g,2+A.lax,23+A.la,5,4,"#c9c2ff"); px(g,2+A.lax,23+A.la,5,1,"#fff");
  px(g,2+A.lax,25+A.la,1,3,"#c9c2ff"); px(g,4+A.lax,25+A.la,1,3,"#c9c2ff"); px(g,6+A.lax,25+A.la,1,3,"#c9c2ff");
  px(g,25+A.rax,17+A.ra+sw,4,8,robe); px(g,25+A.rax,17+A.ra+sw,1,8,lite);
  px(g,25+A.rax,23+A.ra+sw,5,4,"#c9c2ff"); px(g,25+A.rax,23+A.ra+sw,5,1,"#fff");
  px(g,25+A.rax,25+A.ra+sw,1,3,"#c9c2ff"); px(g,27+A.rax,25+A.ra+sw,1,3,"#c9c2ff"); px(g,29+A.rax,25+A.ra+sw,1,3,"#c9c2ff");
  // face: pale violet beauty, glowing violet eyes + catchlights + blush + dark lips
  px(g,10+A.hx,7+hb,12,10,"#d8b8d8"); px(g,10+A.hx,7+hb,12,1,"#fff"); px(g,10+A.hx,15+hb,12,2,"#b898b8");
  px(g,10+A.hx,7+hb,1,10,"#a888a8"); px(g,21+A.hx,7+hb,1,10,"#a888a8");
  px(g,11+A.hx,11+hb,2,1,"#e8a0b8"); px(g,19+A.hx,11+hb,2,1,"#e8a0b8");
  px(g,12+A.hx,9+hb,3,1,"#2a1040"); px(g,17+A.hx,9+hb,3,1,"#2a1040");
  px(g,12+A.hx,10+hb,3,3,eye); px(g,17+A.hx,10+hb,3,3,eye);
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,18+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,14+A.hx,14+hb,4,2,"#7a1a3a"); px(g,15+A.hx,14+hb,2,1,"#ff6a8a");
  // HORNED HEADDRESS + brow jewel + veil + glints
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,8+hb); g.lineTo(6+A.hx,0+hb); g.lineTo(11+A.hx,7+hb); g.fill();
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(21+A.hx,8+hb); g.lineTo(26+A.hx,0+hb); g.lineTo(21+A.hx,7+hb); g.fill();
  g.fillStyle="#fff"; g.fillRect(6+A.hx,0+hb,1,1); g.fillRect(26+A.hx,0+hb,1,1);
  px(g,6+A.hx,0+hb,2,2,"#8a7bff"); px(g,24+A.hx,0+hb,2,2,"#8a7bff");
  px(g,13+A.hx,2+hb,6,4,"#8a7bff"); px(g,14+A.hx,3+hb,4,2,eyeL); px(g,15+A.hx,3+hb,1,1,"#fff");
  px(g,13+A.hx,2+hb,6,1,"#fff");
  px(g,8+A.hx,6+hb,2,4,"#2a1a3a"); px(g,22+A.hx,6+hb,2,4,"#2a1a3a");
};

/* ============ 12. FLESH SCULPTOR v7 — opening ============ */
D.flesh_sculptor = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#a05a6a", dk=shade(skin,-38), deep="#3c1a22", lite="#d08a9a";
  const gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(255,90,122,0.24)","rgba(255,90,122,0.12)");
  spark(g,[3,20,"#ff8aaa"],[28,16,"#fff"],[26,33,"#ffb0c0"]);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#140a0e"); px(g,16+A.rx,34+A.rd,6,2,"#140a0e");
  px(g,10+A.lx,34+A.ld,6,1,"#5a3a3a");
  // torso + stained apron + thread lines + blood + gold
  px(g,7,17,18,15,skin); px(g,7,17,18,2,lite); px(g,7,30,18,2,dk);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  px(g,10,19,12,10,"#5a3a34"); px(g,10,19,12,1,"#e8d9b8"); px(g,10,27,12,2,"#3a2428");
  for(let y=20;y<27;y+=2) px(g,15,y,1,3,"rgba(0,0,0,0.25)");
  px(g,12,20,2,7,"#c92a4a"); px(g,15,20,2,7,gold); px(g,18,20,2,7,"#c92a4a");
  px(g,12,20,2,1,"#ff8aaa"); px(g,15,20,2,1,"#fff2b0");
  px(g,12,26,2,1,"#7a0a1a"); px(g,18,26,2,1,"#7a0a1a");
  px(g,10,28,12,1,goldD1()); function goldD1(){ return "#8a6410"; }
  // LEFT arm + HOOK HAND (steel hook, blood groove)
  px(g,4+A.lax,19+A.la,3,7,skin); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,24+A.la,4,4,"#c9ccd4"); px(g,3+A.lax,24+A.la,4,1,"#fff");
  px(g,4+A.lax,27+A.la,1,3,"#c9ccd4"); px(g,5+A.lax,27+A.la,1,2,"#c92a4a");
  px(g,4+A.lax,24+A.la,1,4,"#fff");
  // RIGHT arm + NEEDLE STAFF (raises on stitch, glowing eye)
  const up=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+up,3,7,skin); px(g,25+A.rax,19+A.ra+up,1,7,lite);
  px(g,25+A.rax,11+A.ra+up,2,16,"#8a6a4a"); px(g,25+A.rax,11+A.ra+up,1,16,"#d9b98a");
  px(g,24+A.rax,6+A.ra+up,4,6,"#c9ccd4"); px(g,24+A.rax,6+A.ra+up,4,1,"#fff");
  px(g,25+A.rax,8+A.ra+up,2,3,"#ff5a7a"); px(g,25+A.rax,8+A.ra+up,1,1,"#fff");
  px(g,24+A.rax,11+A.ra+up,4,1,gold);
  // face + GOGGLES band + stitched mouth + blush + detailed lenses
  px(g,10+A.hx,7+hb,12,10,skin); px(g,10+A.hx,7+hb,12,1,lite); px(g,10+A.hx,15+hb,12,2,dk);
  px(g,10+A.hx,7+hb,1,10,deep); px(g,21+A.hx,7+hb,1,10,deep);
  px(g,11+A.hx,13+hb,2,1,"#e8a0a0"); px(g,19+A.hx,13+hb,2,1,"#e8a0a0");
  px(g,10+A.hx,8+hb,12,4,deep); px(g,10+A.hx,8+hb,12,1,"#5a3a44");
  px(g,12+A.hx,9+hb,3,3,"#7dffd4"); px(g,18+A.hx,9+hb,3,3,"#7dffd4");
  px(g,12+A.hx,9+hb,3,1,"#fff"); px(g,18+A.hx,9+hb,3,1,"#fff");
  px(g,13+A.hx,10+hb,1,2,"#111"); px(g,19+A.hx,10+hb,1,2,"#111");
  px(g,12+A.hx,9+hb,1,1,"#fff"); px(g,18+A.hx,9+hb,1,1,"#fff");
  px(g,10+A.hx,10+hb,12,1,"#8a6a4a");
  px(g,13+A.hx,14+hb,6,2,deep); px(g,14+A.hx,14+hb,1,2,"#fff"); px(g,17+A.hx,14+hb,1,2,"#fff"); px(g,15+A.hx,15+hb,2,1,"#ff8aaa");
  px(g,10+A.hx,3+hb,3,4,"#8a6a4a"); px(g,10+A.hx,3+hb,1,4,"#d9b98a"); px(g,19+A.hx,3+hb,3,4,"#8a6a4a"); px(g,21+A.hx,3+hb,1,4,"#8a6a4a");
};

/* ============ 13. BLOOD EVANGEL v7 — red gospel ============ */
D.blood_evangel = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#8a0e20", dk=shade(robe,-38), deep="#38060e", lite="#d03a4a";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#e8c9b8", skinD="#a88898", skinL="#fff2e2";
  auraShadow(g,hb,"rgba(255,42,74,0.28)","rgba(255,42,74,0.14)");
  spark(g,[3,20,"#ff2a4a"],[28,16,"#fff"],[26,33,"#ff8aaa"]);
  // droplet HALO + falling drops + glints
  g.fillStyle="rgba(255,42,74,0.30)"; g.beginPath(); g.ellipse(16,4+hb,10,4,0,0,7); g.fill();
  px(g,6,2+hb,2,4,"#ff2a4a"); px(g,6,2+hb,1,1,"#fff"); px(g,12,0+hb,2,4,"#ff2a4a"); px(g,19,0+hb,2,4,"#ff2a4a"); px(g,25,2+hb,2,4,"#ff2a4a"); px(g,25,2+hb,1,1,"#fff");
  px(g,2,12+hb,1,3,"#ff2a4a"); px(g,29,14+hb,1,3,"#ff2a4a");
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#12020a"); px(g,16+A.rx,34+A.rd,6,2,"#12020a");
  // cope + BOOK SIGIL (gold book, red seal, pages) + folds
  px(g,7,17,18,15,robe); px(g,7,17,18,2,lite); px(g,7,30,18,2,deep);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  for(let y=19;y<29;y+=2) px(g,9,y,1,3,"rgba(0,0,0,0.25)");
  px(g,11,19,10,9,"#5a040c"); px(g,12,20,8,7,gold); px(g,12,20,8,1,goldL);
  px(g,13,21,6,5,"#ff2a4a"); px(g,14,22,4,2,robe); px(g,15,22,2,1,"#fff"); px(g,13,21,1,4,"#fff");
  px(g,13,26,6,1,"#7a0a1a");
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL);
  // LEFT arm + CHALICE (gold, red wine, glint)
  px(g,4+A.lax,19+A.la,3,7,robe); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,24+A.la,5,6,gold); px(g,3+A.lax,24+A.la,5,1,goldL);
  px(g,4+A.lax,25+A.la,3,4,"#ff2a4a"); px(g,4+A.lax,25+A.la,1,1,"#fff");
  px(g,4+A.lax,29+A.la,3,1,goldD);
  // RIGHT arm + RAISED TOME (lifts on sermon, glowing verse)
  const up=P.atk?-5:0;
  px(g,25+A.rax,20+A.ra+up,3,7,robe); px(g,25+A.rax,20+A.ra+up,1,7,lite);
  px(g,23+A.rax,15+A.ra+up,6,8,"#e8d9b8"); px(g,23+A.rax,15+A.ra+up,6,1,"#fff"); px(g,23+A.rax,21+A.ra+up,6,2,"#5a040c");
  px(g,24+A.rax,17+A.ra+up,4,4,robe); px(g,25+A.rax,18+A.ra+up,2,2,"#ff2a4a"); px(g,25+A.rax,18+A.ra+up,1,1,"#fff");
  // face: pale, dark eyes with red glint + catchlights + blush + blood lips
  px(g,10+A.hx,7+hb,12,10,skin); px(g,10+A.hx,7+hb,12,1,skinL); px(g,10+A.hx,15+hb,12,2,skinD);
  px(g,10+A.hx,7+hb,1,10,skinD); px(g,21+A.hx,7+hb,1,10,skinD);
  px(g,11+A.hx,12+hb,2,1,"#e8a0a0"); px(g,19+A.hx,12+hb,2,1,"#e8a0a0");
  px(g,12+A.hx,10+hb,3,1,"#3a0a12"); px(g,17+A.hx,10+hb,3,1,"#3a0a12");
  px(g,12+A.hx,11+hb,3,3,"#1a0a0e"); px(g,17+A.hx,11+hb,3,3,"#1a0a0e");
  px(g,13+A.hx,12+hb,1,1,"#ff2a4a"); px(g,18+A.hx,12+hb,1,1,"#ff2a4a");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,14+hb,6,2,"#5a040c"); px(g,14+A.hx,14+hb,4,1,"#ff2a4a"); px(g,15+A.hx,14+hb,2,1,"#fff");
  px(g,9+A.hx,3+hb,14,4,"#5a040c"); px(g,9+A.hx,3+hb,14,1,"#7a1020"); px(g,9+A.hx,6+hb,14,1,gold);
  px(g,13+A.hx,4+hb,2,2,gold); px(g,14+A.hx,4+hb,1,1,"#fff");
};

/* ============ 14. MIRROR ABBOT v7 — every you ============ */
D.mirror_abbot = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#4a4a6a", dk=shade(robe,-36), deep="#1e1e2e", lite="#9aa0c8";
  const gold="#d9a91e", goldL="#ffe37a", goldD="#8a6410";
  auraShadow(g,hb,"rgba(200,210,255,0.28)","rgba(200,210,255,0.14)");
  spark(g,[3,20,"#d0d8ff"],[28,16,"#fff"],[26,33,"#d0d8ff"]);
  // halo glow + 3 shards + glints
  g.fillStyle="rgba(200,210,255,0.30)"; g.beginPath(); g.ellipse(16,4+hb,11,5,0,0,7); g.fill();
  px(g,7+A.hx,1+hb,3,5,"#d0d8ff"); px(g,7+A.hx,1+hb,1,5,"#fff");
  px(g,14+A.hx,0+hb,4,6,"#fff"); px(g,14+A.hx,0+hb,1,6,"#d0d8ff"); px(g,15+A.hx,1+hb,2,2,"#8a9ab8"); px(g,15+A.hx,1+hb,1,1,"#fff");
  px(g,22+A.hx,1+hb,3,5,"#d0d8ff"); px(g,24+A.hx,1+hb,1,5,"#fff");
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#101018"); px(g,16+A.rx,34+A.rd,6,2,"#101018");
  // robe + MIRROR BREASTPLATE with reflected eyes + gold hem + folds
  px(g,7,17,18,15,robe); px(g,7,17,18,2,lite); px(g,7,30,18,2,dk);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  for(let y=19;y<29;y+=2) px(g,9,y,1,3,"rgba(0,0,0,0.22)");
  px(g,10,19,12,10,"#d0d8ff"); px(g,10,19,12,1,"#fff"); px(g,10,27,12,2,"#8a9ab8");
  px(g,11,20,10,8,"#8a9ab8"); px(g,12,21,8,6,"#e8ecff"); px(g,13,22,2,2,"#fff");
  px(g,12,22,3,3,"#1a1622"); px(g,18,22,2,2,"#1a1622"); px(g,12,22,1,1,"#fff"); px(g,18,22,1,1,"#fff");
  px(g,13,23,1,1,"#8a7bff"); px(g,18,23,1,1,"#8a7bff");
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL);
  // TWIN SHARD BLADES (rise on atk) + hilts + glints
  const sw=P.atk?-5:0;
  px(g,3+A.lax,17+A.la+sw,3,11,"#8a86a8"); px(g,3+A.lax,17+A.la+sw,1,11,"#fff");
  px(g,2+A.lax,26+A.la+sw,5,4,"#d0d8ff"); px(g,2+A.lax,26+A.la+sw,5,1,"#fff"); px(g,3+A.lax,27+A.la+sw,1,1,"#8a9ab8");
  px(g,26+A.rax,17+A.ra+sw,3,11,"#8a86a8"); px(g,28+A.rax,17+A.ra+sw,1,11,"#fff");
  px(g,25+A.rax,26+A.ra+sw,5,4,"#d0d8ff"); px(g,25+A.rax,26+A.ra+sw,5,1,"#fff"); px(g,27+A.rax,27+A.ra+sw,1,1,"#8a9ab8");
  // mirrored mask face + dark eyes + red mouth + blush
  px(g,10+A.hx,7+hb,12,10,"#d0d8ff"); px(g,10+A.hx,7+hb,12,1,"#fff"); px(g,10+A.hx,15+hb,12,2,"#8a9ab8");
  px(g,10+A.hx,7+hb,1,10,deep); px(g,21+A.hx,7+hb,1,10,deep);
  px(g,11+A.hx,12+hb,2,1,"#b0a0c0"); px(g,19+A.hx,12+hb,2,1,"#b0a0c0");
  px(g,13+A.hx,10+hb,2,1,"#1a1622"); px(g,17+A.hx,10+hb,2,1,"#1a1622");
  px(g,13+A.hx,11+hb,2,3,"#1a1622"); px(g,18+A.hx,11+hb,2,3,"#1a1622");
  px(g,13+A.hx,11+hb,1,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,14+A.hx,14+hb,4,2,"#7a0a20"); px(g,15+A.hx,14+hb,2,1,"#fff"); px(g,15+A.hx,15+hb,2,1,"#ff8a8a");
  px(g,10+A.hx,9+hb,12,1,"rgba(255,255,255,0.5)");
};

/* ============ 15. BILE CARDINAL v7 — hurl ============ */
D.bile_cardinal = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#4a5a12", dk=shade(robe,-36), deep="#1e2406", lite="#8aa02a";
  const gold="#d9a91e", goldL="#ffe37a";
  const bile="#7dff9b", bileL="#c9e86a";
  auraShadow(g,hb,"rgba(125,255,155,0.24)","rgba(125,255,155,0.12)");
  spark(g,[3,20,bile],[28,16,"#fff"],[26,33,bileL]);
  // GALERO HAT: wide brim, low dome, cord + tassels + jewels
  px(g,3+A.hx,3+hb,26,4,"#3a4a0a"); px(g,3+A.hx,3+hb,26,1,"#5a6a1a"); px(g,3+A.hx,6+hb,26,1,deep);
  px(g,9+A.hx,0+hb,14,4,"#3a4a0a"); px(g,9+A.hx,0+hb,14,1,"#7a8a3a");
  px(g,10+A.hx,3+hb,12,1,gold);
  px(g,3+A.hx,6+hb,2,4,bile); px(g,3+A.hx,6+hb,1,1,"#fff"); px(g,27+A.hx,6+hb,2,4,bile); px(g,28+A.hx,6+hb,1,1,"#fff");
  px(g,5+A.hx,7+hb,2,1,gold); px(g,25+A.hx,7+hb,2,1,gold);
  px(g,5+A.hx,10+hb,1,2,gold); px(g,26+A.hx,10+hb,1,2,gold);
  px(g,11+A.lx,30+A.ld,4,5,deep); px(g,17+A.rx,30+A.rd,4,5,deep);
  px(g,10+A.lx,34+A.ld,6,2,"#0c0e02"); px(g,16+A.rx,34+A.rd,6,2,"#0c0e02");
  // cassock + bile icon + gold hem + folds + stains
  px(g,7,17,18,15,robe); px(g,7,17,18,2,lite); px(g,7,30,18,2,deep);
  px(g,7,17,2,15,deep); px(g,23,17,2,15,deep);
  for(let y=19;y<29;y+=2) px(g,15,y,1,2,"rgba(0,0,0,0.28)");
  px(g,12,19,8,9,"#2a3606"); px(g,13,20,6,7,bile); px(g,14,21,4,5,bileL); px(g,15,22,2,2,"#fff");
  px(g,13,20,1,6,"#fff"); px(g,18,20,1,6,"#4a5a1a");
  px(g,14,26,4,1,"#3a4a0a");
  px(g,7,29,18,2,gold); px(g,7,29,18,1,goldL);
  // left arm + blessing hand + ring
  px(g,4+A.lax,19+A.la,3,7,robe); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,4+A.lax,26+A.la,3,2,robe); px(g,4+A.lax,28+A.la,3,2,"#c9b088");
  px(g,5+A.lax,28+A.la,1,1,goldL);
  // right arm + VIAL STAFF (raises on bless, drips on atk)
  const up=P.atk?-4:0;
  px(g,25+A.rax,18+A.ra+up,3,7,robe); px(g,25+A.rax,18+A.ra+up,1,7,lite);
  px(g,25+A.rax,12+A.ra+up,2,12,"#5a4a3a"); px(g,25+A.rax,12+A.ra+up,1,12,"#c9b896");
  px(g,23+A.rax,6+A.ra+up,6,8,bileL); px(g,23+A.rax,6+A.ra+up,6,1,"#fff");
  px(g,24+A.rax,7+A.ra+up,4,6,bile); px(g,25+A.rax,8+A.ra+up,2,4,"#fff");
  px(g,23+A.rax,12+A.ra+up,6,2,"#3a4a0a"); px(g,23+A.rax,6+A.ra+up,6,1,gold);
  if(P.atk){ px(g,24+A.rax,14+A.ra,1,4,bile); px(g,24+A.rax,18+A.ra,2,2,bile); px(g,24+A.rax,18+A.ra,1,1,"#fff"); }
  // face: sallow mask, dark bile eyes + catchlights + blush + thin mouth
  px(g,10+A.hx,9+hb,12,9,"#c9b088"); px(g,10+A.hx,9+hb,12,1,"#e8d0a0"); px(g,10+A.hx,16+hb,12,2,"#a08868");
  px(g,10+A.hx,9+hb,1,9,"#8a7058"); px(g,21+A.hx,9+hb,1,9,"#8a7058");
  px(g,11+A.hx,12+hb,2,1,"#c9a080"); px(g,19+A.hx,12+hb,2,1,"#c9a080");
  px(g,12+A.hx,10+hb,3,1,"#2a2a0a"); px(g,17+A.hx,10+hb,3,1,"#2a2a0a");
  px(g,12+A.hx,11+hb,3,3,"#1a2a0a"); px(g,17+A.hx,11+hb,3,3,"#1a2a0a");
  px(g,13+A.hx,12+hb,1,1,bile); px(g,18+A.hx,12+hb,1,1,bile);
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,15+hb,6,1,robe);
  if(P.atk){ px(g,14+A.hx,15+hb,4,2,"#2a3606"); px(g,15+A.hx,15+hb,2,1,bile); }
};

/* ============ 16. INFERNAL OVERLORD v7 — inferno crown ============ */
D.infernal_overlord = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#ff3a00", dk="#3a0c00", deep="#1e0600", lite="#ff7a3a", pale="#ff9d6a";
  const gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(255,90,20,0.28)","rgba(255,90,20,0.14)");
  spark(g,[3,20,"#ff9d2e"],[28,16,"#fff"],[26,33,"#d0ff2a"]);
  // meteor crown + halo embers
  g.fillStyle="rgba(255,90,20,0.30)"; g.beginPath(); g.ellipse(16,4+hb,11,5,0,0,7); g.fill();
  // cape: charred + ember trim + fold
  px(g,4,15,4,18,"#1a0500"); px(g,4,15,1,18,"#4a1502"); px(g,24,15,4,18,"#1a0500"); px(g,27,15,1,18,"#4a1502");
  px(g,4,15,4,2,"#d0ff2a"); px(g,24,15,4,2,"#d0ff2a"); px(g,4,15,4,1,"#fff");
  px(g,5,17,1,14,"#5a1e04");
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,9+A.lx,29+A.ld,1,7,lite); px(g,22+A.rx,29+A.rd,1,7,deep);
  px(g,8+A.lx,35+A.ld,7,2,"#140400"); px(g,17+A.rx,35+A.rd,7,2,"#140400");
  px(g,8+A.lx,35+A.ld,7,1,"#5a1e04");
  // torso: magma plate + furnace core + rivets + gold bands
  px(g,7,16,18,14,deep); px(g,7,16,18,2,"#5a1500");
  px(g,9,18,14,9,skin); px(g,9,18,14,1,"#ff9d2e"); px(g,9,25,14,2,dk);
  px(g,10,20,12,6,"#ff9d2e"); px(g,11,21,10,2,"#fff"); px(g,11,21,10,1,"#ffe9c9");
  px(g,12,24,8,3,"#d0ff2a"); px(g,12,24,8,1,"#fff"); px(g,12,26,8,1,"#5a6a1a");
  for(let x=9;x<23;x+=3) px(g,x,18,1,2,"rgba(0,0,0,0.30)");
  px(g,9,18,2,2,gold); px(g,21,18,2,2,gold);
  // arms: magma fists + gold bands (slam on atk)
  const sm=P.atk?-4:0;
  px(g,2+A.lax,18+A.la+sm,5,8,dk); px(g,1+A.lax,24+A.la+sm,7,5,skin); px(g,2+A.lax,25+A.la+sm,5,1,"#ff9d2e"); px(g,2+A.lax,25+A.la+sm,2,1,"#fff");
  px(g,2+A.lax,27+A.la+sm,7,2,gold);
  px(g,25+A.rax,18+A.ra+sm,5,8,dk); px(g,24+A.rax,23+A.ra+sm,7,6,skin); px(g,25+A.rax,24+A.ra+sm,5,4,"#d0ff2a"); px(g,26+A.rax,25+A.ra+sm,3,1,"#fff");
  px(g,24+A.rax,27+A.ra+sm,7,2,gold);
  // head: horned overlord, blazing eyes + catchlights + fanged maw + blush
  px(g,10,5+hb,12,12,skin); px(g,10,5+hb,12,2,"#ff9d2e"); px(g,10,14+hb,12,2,dk);
  px(g,10,5+hb,2,12,deep); px(g,20,5+hb,2,12,deep);
  px(g,11,11+hb,2,1,"#ffb080"); px(g,19,11+hb,2,1,"#ffb080");
  px(g,12,9+hb,3,1,"#3a0c00"); px(g,17,9+hb,3,1,"#3a0c00");
  px(g,12,10+hb,3,3,"#fff"); px(g,17,10+hb,3,3,"#fff");
  px(g,13,11+hb,1,2,"#111"); px(g,18,11+hb,1,2,"#111");
  px(g,12,10+hb,1,1,"#fff"); px(g,17,10+hb,1,1,"#fff");
  px(g,12,10+hb,1,1,"#ff3a00");
  px(g,13,14+hb,6,2,deep); px(g,14,14+hb,1,2,"#fff"); px(g,17,14+hb,1,2,"#fff"); px(g,15,15+hb,2,1,"#ff5a1a");
  // INFERNO CROWN: 3 meteor spikes + gold + cores
  px(g,8,0+hb,4,7,gold); px(g,8,0+hb,4,1,"#fff"); px(g,9,1+hb,2,3,"#ff5a1a"); px(g,9,1+hb,1,1,"#fff");
  px(g,14,0+hb,4,8,"#ff3a00"); px(g,14,0+hb,4,1,goldL); px(g,15,1+hb,2,4,"#ffd93d"); px(g,15,1+hb,1,1,"#fff");
  px(g,20,0+hb,4,7,gold); px(g,20,0+hb,4,1,"#fff");
  px(g,8,6+hb,16,1,goldD1()); function goldD1(){ return "#8a6410"; }
};

/* ============ 17. GUT EMPRESS v7 — womb teeth (serpent queen, readable) ============ */
D.gut_empress = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const skin="#6a1a2a", dk="#26060e", deep="#12030a", lite="#a04a5a", pale="#c96a7a";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const sw0=Sg(P,0,1), sw1=Sg(P,2,1);
  auraShadow(g,hb,"rgba(255,42,74,0.26)","rgba(255,42,74,0.12)");
  spark(g,[3,22,"#ffd93d"],[28,16,"#fff"],[26,33,"#ff8aaa"]);
  // coiled base + jewel nodes + scale rows + rim
  px(g,2+sw0,28,26,8,dk); px(g,2+sw0,28,26,2,skin);
  px(g,5+sw0,30,8,3,skin); px(g,18+sw1,30,8,3,skin);
  for(let x=4;x<26;x+=3){ px(g,x+sw0,29,2,3,skin); px(g,x+sw0,29,1,1,lite); }
  px(g,7+sw0,26,4,3,"#7a8a2a"); px(g,7+sw0,26,4,1,"#c9e86a"); px(g,8+sw0,27,1,1,"#fff");
  px(g,14+sw1,26,4,3,gold); px(g,14+sw1,26,4,1,goldL); px(g,15+sw1,27,1,1,"#fff");
  px(g,21+sw0,26,4,3,"#7a8a2a"); px(g,21+sw0,26,4,1,"#c9e86a");
  px(g,2+sw0,28,26,1,lite); px(g,2+sw0,34,26,2,deep);
  // neck + torso + gold collar + chest jewel + folds
  px(g,18,14+hb,8,15,skin); px(g,18,14+hb,2,15,lite); px(g,24,14+hb,2,15,deep);
  px(g,16,9+hb,13,9,skin); px(g,16,9+hb,13,2,lite); px(g,16,16+hb,13,2,dk);
  px(g,16,9+hb,2,9,deep); px(g,27,9+hb,2,9,deep);
  px(g,18,14+hb,7,4,pale); px(g,19,15+hb,5,2,gold); px(g,20,16+hb,1,1,"#fff");
  // face: serpent queen, gold eyes + slit + catchlights + blush + fanged lips
  px(g,18,12+hb,3,1,"#2a060e"); px(g,24,12+hb,3,1,"#2a060e");
  px(g,18,13+hb,3,3,"#ffe14d"); px(g,24,13+hb,3,3,"#ffe14d");
  px(g,19,14+hb,1,2,"#111"); px(g,25,14+hb,1,2,"#111");
  px(g,18,13+hb,1,1,"#fff"); px(g,24,13+hb,1,1,"#fff");
  px(g,18,11+hb,2,1,"#e8a0a0"); px(g,24,11+hb,2,1,"#e8a0a0");
  px(g,19,17+hb,7,2,deep); px(g,20,17+hb,1,2,"#fff"); px(g,24,17+hb,1,2,"#fff"); px(g,21,18+hb,3,1,"#ff5a7a");
  // CROWN (4 spikes, red gems, gold band, glints)
  for(let i=0;i<4;i++){ const cx=15+i*4; px(g,cx,3+hb,3,7,gold); px(g,cx,3+hb,3,1,goldL); px(g,cx+1,4+hb,1,3,"#ff2a4a"); px(g,cx+1,4+hb,1,1,"#fff"); }
  px(g,15,8+hb,14,1,goldD); px(g,15,9+hb,14,1,"#fff2b0");
  // WAR FAN (fans on atk) + ribs
  const fw=P.atk?2:-2;
  g.fillStyle="#a04a5a"; g.beginPath(); g.moveTo(26,22+hb); g.lineTo(32,14+hb+fw); g.lineTo(31,23+hb); g.fill();
  g.fillStyle="#c96a7a"; g.beginPath(); g.moveTo(27,22+hb); g.lineTo(31,16+hb+fw); g.lineTo(30,22+hb); g.fill();
  px(g,26,21+hb,5,2,deep); px(g,26,21+hb,1,1,"#fff");
};

/* ============ 18. MEDUSA QUEEN v7 — petrifying gaze (CLEAR, goddess bar) ============ */
D.medusa_queen = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const coil="#2e8a4a", dk=shade(coil,-42), deep=shade(coil,-72), lite=shade(coil,32), pale=shade(coil,58);
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#f2d3b3", skinD="#c9986a", skinL="#fff2e0";
  auraShadow(g,hb,"rgba(80,220,120,0.26)","rgba(255,217,61,0.12)");
  spark(g,[3,20,"#7dff9b"],[28,14,"#fff"],[26,33,"#7dff9b"]);
  // serpent coils mound: dark base, mid coils, light ridges, jeweled bands + scales
  px(g,5,29,22,8,deep); px(g,6,30,20,5,coil); px(g,6,30,20,1,lite); px(g,6,34,20,2,dk);
  for(let x=7;x<25;x+=3){ px(g,x,31,2,2,dk); px(g,x,31,1,1,lite); }
  px(g,7,32,6,2,gold); px(g,7,32,6,1,goldL); px(g,8,32,1,1,"#fff");
  px(g,15,33,6,2,"#c93b3b"); px(g,15,33,6,1,"#ff8a8a"); px(g,16,33,1,1,"#fff");
  px(g,9,27,14,4,coil); px(g,9,27,14,1,lite); px(g,9,30,14,1,dk);
  px(g,9,27,2,4,deep); px(g,21,27,2,4,deep);
  px(g,10,28,4,2,gold); px(g,10,28,1,1,goldL); px(g,18,28,4,2,gold); px(g,19,28,1,1,goldL);
  px(g,13,29,6,1,goldD);
  // cobra hood behind torso + gold eyes + rim
  px(g,4,12,6,12,coil); px(g,4,12,1,12,pale); px(g,8,12,1,12,deep);
  px(g,22,12,6,12,coil); px(g,26,12,1,12,pale); px(g,22,12,1,12,deep);
  px(g,5,14,2,3,gold); px(g,23,18,2,3,gold); px(g,5,14,1,1,goldL);
  // torso: emerald scaled bodice + gold trim + cleavage emerald + folds
  px(g,10,16,12,12,coil); px(g,10,16,12,2,lite); px(g,10,26,12,2,dk);
  px(g,10,16,2,12,deep); px(g,20,16,2,12,deep);
  px(g,12,18,8,7,"#d9b96a"); px(g,13,19,6,5,"#f2e0a0"); px(g,13,19,6,1,"#fff");
  px(g,14,21,4,4,"#0e5a3a"); px(g,15,22,2,2,"#7dff9b"); px(g,15,22,1,1,"#fff");
  px(g,11,25,10,2,gold); px(g,11,25,10,1,goldL);
  // LEFT arm + MIRROR SHIELD (silver face, gold rim, glint, jewel)
  px(g,3+A.lax,17+A.la,4,8,skin); px(g,3+A.lax,17+A.la,1,8,skinL);
  px(g,3+A.lax,25+A.la,4,2,gold);
  px(g,0+A.lax,18+A.la,6,12,"#8a6a1a"); px(g,1+A.lax,19+A.la,4,10,"#dfe9f2");
  px(g,1+A.lax,19+A.la,4,2,"#fff"); px(g,2+A.lax,22+A.la,2,5,"#7fd4ff"); px(g,2+A.lax,23+A.la,1,2,"#fff");
  px(g,0+A.lax,18+A.la,6,1,goldL); px(g,0+A.lax,29+A.la,6,1,goldD);
  px(g,2+A.lax,26+A.la,2,2,"#0e5a3a"); px(g,2+A.lax,26+A.la,1,1,"#7dff9b");
  // RIGHT arm + stone-gaze scepter (rises on atk) + orb + halo
  const sw=P.atk?-5:0;
  g.fillStyle="rgba(125,255,155,0.22)"; g.beginPath(); g.arc(27+A.rax,9+A.ra+sw,5,0,7); g.fill();
  px(g,25+A.rax,17+A.ra+sw,4,8,skin); px(g,25+A.rax,17+A.ra+sw,1,8,skinL);
  px(g,25+A.rax,25+A.ra+sw,4,2,gold);
  px(g,26+A.rax,12+A.ra+sw,2,15,"#5a3a22"); px(g,26+A.rax,12+A.ra+sw,1,15,"#c9a068");
  px(g,24+A.rax,6+A.ra+sw,6,7,"#7fd4ff"); px(g,24+A.rax,6+A.ra+sw,6,1,"#fff");
  px(g,25+A.rax,8+A.ra+sw,4,4,"#0e5a3a"); px(g,26+A.rax,9+A.ra+sw,2,2,"#7dff9b"); px(g,26+A.rax,9+A.ra+sw,1,1,"#fff");
  px(g,24+A.rax,6+A.ra+sw,6,1,gold); px(g,24+A.rax,12+A.ra+sw,6,1,gold);
  // neck + face: pale beauty, forehead light, blush, red lips, nose shade
  px(g,14+A.hx,14+hb,4,3,skin); px(g,14+A.hx,14+hb,4,1,skinD);
  px(g,10+A.hx,6+hb,12,10,skin); px(g,10+A.hx,6+hb,12,2,skinL); px(g,10+A.hx,14+hb,12,2,skinD);
  px(g,10+A.hx,6+hb,2,10,skinD); px(g,20+A.hx,6+hb,2,10,skinD);
  px(g,11+A.hx,8+hb,10,1,"#f7d9c0");
  px(g,11+A.hx,12+hb,2,2,"#ffb0a0"); px(g,19+A.hx,12+hb,2,2,"#ffb0a0");
  px(g,14+A.hx,13+hb,2,2,"#d9a06b"); px(g,15+A.hx,14+hb,1,1,"#8a5a33");
  px(g,14+A.hx,14+hb+(P.atk?1:0),4,2,"#a02040"); px(g,15+A.hx,14+hb+(P.atk?1:0),2,1,"#ff8ab0"); px(g,15+A.hx,14+hb,1,1,"#fff");
  // eyes: green gaze, slit pupils, catchlights, dark lashes + brows (CLEAR)
  px(g,12+A.hx,9+hb,3,1,"#2a1a10"); px(g,17+A.hx,9+hb,3,1,"#2a1a10");
  px(g,12+A.hx,10+hb,3,3,"#7dff9b"); px(g,17+A.hx,10+hb,3,3,"#7dff9b");
  px(g,12+A.hx,10+hb,3,1,"#c8ffd8"); px(g,17+A.hx,10+hb,3,1,"#c8ffd8");
  px(g,13+A.hx,10+hb,1,3,"#111"); px(g,18+A.hx,10+hb,1,3,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,12+A.hx,8+hb,3,1,"#3a2a1a"); px(g,17+A.hx,8+hb,3,1,"#3a2a1a");
  // gold diadem + emerald + earrings + glints
  px(g,10+A.hx,4+hb,12,2,gold); px(g,10+A.hx,4+hb,12,1,goldL);
  px(g,14+A.hx,3+hb,4,3,gold); px(g,15+A.hx,4+hb,2,2,"#0e5a3a"); px(g,15+A.hx,4+hb,1,1,"#fff");
  px(g,8+A.hx,10+hb,2,4,gold); px(g,22+A.hx,10+hb,2,4,gold);
  px(g,8+A.hx,13+hb,2,1,"#7dff9b"); px(g,22+A.hx,13+hb,2,1,"#7dff9b");
  // SNAKE MANE: 6 stalks with heads, eyes, tongues (CLEAR: bigger heads, white glints, red tongues lash on atk)
  for(let m=0;m<6;m++){
    const sn=Sg(P,m,1);
    const sx=6+m*4+sn, sy=0+((m%2)?0:1);
    px(g,sx,sy,3,6,"#2e7d46"); px(g,sx,sy,1,6,"#7ac97a"); px(g,sx+2,sy,1,6,"#1e5a34");
    px(g,sx-1,sy+5,5,4,"#2e7d46"); px(g,sx,sy+5,3,1,"#7ac97a"); px(g,sx,sy+8,3,1,"#1e5a34");
    px(g,sx,sy+6,1,1,"#ffe14d"); px(g,sx+2,sy+6,1,1,"#ffe14d");
    px(g,sx,sy+6,1,1,"#fff");
    g.fillStyle="#111"; g.fillRect(sx,sy+6,1,1); g.fillRect(sx+2,sy+6,1,1);
    g.fillStyle="#fff"; g.fillRect(sx,sy+6,1,1);
    px(g,sx+1,sy+8+(P.atk?1:0),1,2,"#ff6b6b"); px(g,sx+1,sy+9,1,1,"#ff9a9a");
  }
};

/* ============ 19. NINE-TAILED KITSUNE v7 — foxfire empress ============ */
D.kitsune_ninetails = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur="#e08a2a", dk=shade(fur,-40), deep=shade(fur,-70), lite=shade(fur,32), pale=shade(fur,58);
  const cream="#fff2e0", gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const skin="#f2c9a0", skinD="#c98a5a", skinL="#fff2e0";
  auraShadow(g,hb,"rgba(255,170,80,0.28)","rgba(255,170,80,0.14)");
  spark(g,[3,16,"#ff9d2e"],[28,12,"#fff"],[26,33,"#ff9d2e"]);
  const sw=Sg(P,0,1);
  // NINE TAILS FAN: layered orange + cream tips + gold bands + glints (sway)
  for(let i=-4;i<=4;i++){
    const tx=6+i*2+sw+(i>0?1:0), ty=22-Math.abs(i);
    const tw2=3, th=9-Math.abs(i);
    px(g,tx,ty,tw2,th,i%2?fur:cream); px(g,tx,ty,tw2,1,lite);
    px(g,tx,ty+th-2,tw2,2,cream); px(g,tx,ty+th-2,tw2,1,"#fff");
    px(g,tx,ty+2,tw2,1,dk);
    if(i%2===0){ px(g,tx,ty+4,tw2,1,gold); px(g,tx,ty+4,1,1,goldL); }
  }
  px(g,7,28,2,2,gold); px(g,23,28,2,2,"#c93b3b");
  // hind paws + fore paws (foxfire glow)
  px(g,10+A.lx,30+A.ld,4,4,fur); px(g,18+A.rx,30+A.rd,4,4,fur);
  px(g,10+A.lx,33+A.ld,4,2,deep); px(g,18+A.rx,33+A.rd,4,2,deep);
  px(g,10+A.lx,33+A.ld,1,1,cream);
  // body: sleek + flame dapples + belly + back stripe + fur rows
  px(g,9,22,14,9,fur); px(g,9,22,14,2,lite); px(g,9,29,14,2,dk);
  px(g,9,22,2,9,deep); px(g,21,22,2,9,deep);
  px(g,11,24,4,3,"#ff7a2a"); px(g,11,24,1,1,"#fff"); px(g,16,26,4,3,gold); px(g,17,26,1,1,"#fff");
  for(let x=10;x<21;x+=3){ px(g,x,25,1,2,dk); }
  px(g,12,29,8,1,cream); px(g,12,29,8,1,"#fff");
  // foxfire orbs (3, float + glow, flare on atk)
  g.fillStyle="rgba(255,157,46,0.32)"; g.beginPath(); g.arc(4,10,4,0,7); g.fill(); g.beginPath(); g.arc(28,10,4,0,7); g.fill();
  px(g,3,9,3,3,"#ff9d2e"); px(g,3,9,3,1,"#fff"); px(g,4,10,1,1,"#fff");
  px(g,25,9,3,3,"#7fd4ff"); px(g,25,9,3,1,"#fff");
  if(P.atk){ px(g,14,6,4,4,"#ff9d2e"); px(g,14,6,4,1,"#fff"); }
  // arms: sleeves + gold bangles + hands (cast on atk)
  px(g,6+A.lax,20+A.la,3,7,fur); px(g,6+A.lax,20+A.la,1,7,lite);
  px(g,6+A.lax,25+A.la,3,2,gold); px(g,6+A.lax,25+A.la,3,1,goldL);
  px(g,23+A.rax,20+A.ra-(P.atk?3:0),3,7,fur);
  px(g,23+A.rax,25+A.ra-(P.atk?3:0),3,2,gold);
  // head: fox muzzle + cream cheeks + gold diadem + ears
  g.fillStyle=fur; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(7+A.hx,2+hb); g.lineTo(12+A.hx,8+hb); g.fill();
  g.fillStyle=fur; g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(25+A.hx,2+hb); g.lineTo(20+A.hx,8+hb); g.fill();
  g.fillStyle=cream; g.beginPath(); g.moveTo(10+A.hx,8+hb); g.lineTo(8+A.hx,3+hb); g.lineTo(11+A.hx,7+hb); g.fill();
  px(g,10+A.hx,7+hb,12,10,fur); px(g,10+A.hx,7+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,dk);
  px(g,10+A.hx,7+hb,2,10,deep); px(g,20+A.hx,7+hb,2,10,deep);
  px(g,12+A.hx,13+hb,8,4,cream); px(g,12+A.hx,13+hb,8,1,"#fff");
  px(g,15+A.hx,14+hb,2,2,"#111"); px(g,15+A.hx,14+hb,1,1,"#555");
  px(g,13+A.hx,12+hb,2,1,"#ffb0a0"); px(g,19+A.hx,12+hb,2,1,"#ffb0a0");
  // eyes: amber + slit + catchlight + lash + brow (goddess layout, fox palette)
  px(g,12+A.hx,10+hb,3,1,"#3a2010"); px(g,17+A.hx,10+hb,3,1,"#3a2010");
  px(g,12+A.hx,11+hb,3,3,"#ffe14d"); px(g,17+A.hx,11+hb,3,3,"#ffe14d");
  px(g,12+A.hx,11+hb,3,1,"#fff2b0"); px(g,17+A.hx,11+hb,3,1,"#fff2b0");
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,18+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,14+A.hx,15+hb,4,1,"#7a2a1a");
  if(P.atk){ px(g,13+A.hx,15+hb,6,2,"#5a0a0a"); px(g,14+A.hx,15+hb,1,2,"#fff"); px(g,17+A.hx,15+hb,1,2,"#fff"); }
  // gold brow diadem + red jewel + ear tips + glints
  px(g,11+A.hx,6+hb,10,2,gold); px(g,11+A.hx,6+hb,10,1,goldL);
  px(g,15+A.hx,5+hb,2,3,"#c93b3b"); px(g,15+A.hx,5+hb,1,1,"#fff");
  px(g,7+A.hx,2+hb,2,2,deep); px(g,23+A.hx,2+hb,2,2,deep); px(g,7+A.hx,2+hb,1,1,"#fff");
};

/* ============ 20. PETER THE FALLEN v13 — TERRIFYING FALLEN GOD (final boss) ============ */
D.peter_the_fallen = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  // darker void aura + blood rim + floating embers
  g.fillStyle="rgba(130,40,180,0.32)"; g.beginPath(); g.ellipse(16,22+hb,13,15,0,0,7); g.fill();
  g.fillStyle="rgba(255,42,90,0.16)"; g.beginPath(); g.ellipse(16,24+hb,8,11,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.34)"; g.beginPath(); g.ellipse(16,37,9,2.8,0,0,7); g.fill();
  px(g,2,24,1,1,"#a04aff"); px(g,29,12,1,1,"#ff2a5a"); px(g,5,33,1,1,"#a04aff"); px(g,27,31,1,1,"#ff8aaa");
  px(g,12,0,1,1,"#fff"); px(g,24,33,1,1,"#fff"); px(g,1,16,1,1,"#ff2a5a");
  // jagged cape (longer, blood hem, violet runes)
  px(g,6,18,3,18,"#2a060e"); px(g,11,18,3,18,"#3a0a14"); px(g,18,18,3,18,"#2a060e"); px(g,23,18,3,18,"#3a0a14");
  px(g,6,35,3,1,"#a04aff"); px(g,11,35,3,1,"#ff2a5a"); px(g,18,35,3,1,"#a04aff"); px(g,23,35,3,1,"#ff2a5a");
  px(g,7,20,1,12,"#5a1a2a"); px(g,24,20,1,12,"#5a1a2a");
  px(g,12,22,1,4,"#5a2fb0"); px(g,19,22,1,4,"#ff2a5a");
  // GREAT torn wings: taller, more tears, bone claws, violet membrane + blood tips
  const WA=Wflap(P);
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?11:21,20); g.rotate(s<0?WA-0.12:-WA+0.12); g.translate(s<0?-11:-21,-20);
    g.fillStyle="#080510";
    g.beginPath();
    if(s<0){ g.moveTo(11,23); g.lineTo(1,2); g.lineTo(4,2); g.lineTo(6,8); g.lineTo(9,16); g.lineTo(11,18); }
    else { g.moveTo(21,23); g.lineTo(31,2); g.lineTo(28,2); g.lineTo(26,8); g.lineTo(23,16); g.lineTo(21,18); }
    g.fill();
    g.fillStyle="#241a4a";
    g.beginPath();
    if(s<0){ g.moveTo(10,22); g.lineTo(4,10); g.lineTo(7,12); g.lineTo(10,20); }
    else { g.moveTo(22,22); g.lineTo(28,10); g.lineTo(25,12); g.lineTo(22,20); }
    g.fill();
    g.restore();
  }
  px(g,0,2,2,3,"#a04aff"); px(g,0,2,1,1,"#fff"); px(g,30,2,2,3,"#ff2a5a"); px(g,31,2,1,1,"#fff");
  px(g,2,6,1,3,"#d08aff"); px(g,29,6,1,3,"#ff8aaa");
  px(g,1,9,2,2,"#ff2a5a"); px(g,29,9,2,2,"#a04aff");
  px(g,5,4,2,2,"#fff"); px(g,25,4,2,2,"#fff");
  // legs: black greaves, violet seams, skull knees, heavy boots
  px(g,10+A.lx,28+A.ld,5,8,"#0c0c12"); px(g,17+A.rx,28+A.rd,5,8,"#0c0c12");
  px(g,10+A.lx,28+A.ld,5,1,"#2a2a38"); px(g,12+A.lx,29+A.ld,1,6,"#4a2a8a"); px(g,19+A.rx,29+A.rd,1,6,"#7a1a2a");
  px(g,11+A.lx,31+A.ld,3,3,"#e8e0d0"); px(g,18+A.rx,31+A.rd,3,3,"#e8e0d0"); px(g,12+A.lx,32+A.ld,1,1,"#111"); px(g,19+A.rx,32+A.rd,1,1,"#111");
  px(g,9+A.lx,36+A.ld,7,3,"#050508"); px(g,16+A.rx,36+A.rd,7,3,"#050508");
  px(g,9+A.lx,36+A.ld,7,1,"#3a2a4a");
  // torso: black plate, violet cracks, chest maw with HOT heart + teeth + blood
  px(g,9,18,14,12,skinP()); function skinP(){ return "#101016"; }
  px(g,9,18,14,1,"#3a3a4c"); px(g,9,29,14,1,"#000");
  px(g,9,18,1,12,"#2e2e3e"); px(g,22,18,1,12,"#2e2e3e");
  px(g,11,20,1,5,"#5a2fb0"); px(g,20,20,1,5,"#ff2a5a"); px(g,11,20,1,1,"#fff");
  px(g,13,22,6,5,"#0d0312");
  px(g,13,22,6,1,"#a04aff"); px(g,13,26,6,1,"#5a1a3a");
  px(g,14,23,4,3,"#ff2a5a"); px(g,15,24,2,2,"#fff"); px(g,15,23,1,1,"#fff"); px(g,17,23,1,1,"#ff8aaa");
  px(g,13,22,2,1,"#fff"); px(g,17,22,2,1,"#fff");
  px(g,14,22,1,2,"#fff"); px(g,17,22,1,2,"#fff");
  // spiked pauldrons, taller, violet + blood tips
  px(g,2,14,8,6,"#14141c"); px(g,2,14,8,1,"#4a4a5e");
  px(g,22,14,8,6,"#14141c"); px(g,22,14,8,1,"#4a4a5e");
  px(g,2,11,2,4,"#2a2a38"); px(g,2,11,2,1,"#d08aff");
  px(g,4,10,2,5,"#2a2a38"); px(g,4,10,2,1,"#ff8aaa");
  px(g,6,11,2,4,"#2a2a38"); px(g,6,11,2,1,"#d08aff");
  px(g,24,11,2,4,"#2a2a38"); px(g,24,11,2,1,"#ff8aaa");
  px(g,26,10,2,5,"#2a2a38"); px(g,26,10,2,1,"#d08aff");
  px(g,28,11,2,4,"#2a2a38"); px(g,28,11,2,1,"#ff8aaa");
  // left arm + long fang claws + blood
  px(g,3+A.lax,21+A.la,4,7,"#101018");
  px(g,3+A.lax,27+A.la,5,3,"#1c1c26");
  px(g,3+A.lax,30+A.la,1,3,"#e8e0d0"); px(g,5+A.lax,30+A.la,1,3,"#fff"); px(g,7+A.lax,30+A.la,1,3,"#e8e0d0");
  px(g,4+A.lax,32+A.la,1,1,"#ff2a5a");
  // right arm + voidglass shard-blade with BLOOD edge + glow envelope (terrifying)
  const swM=P.atk?-7:0;
  g.fillStyle="rgba(160,74,255,0.35)"; g.beginPath(); g.ellipse(28,15+swM,5,9,0.2,0,7); g.fill();
  g.fillStyle="rgba(255,42,90,0.22)"; g.beginPath(); g.ellipse(28,15+swM,3,7,0.2,0,7); g.fill();
  px(g,23+A.rax,19+A.ra+swM,4,8,"#101018");
  px(g,23+A.rax,26+A.ra+swM,4,3,"#1c1c26");
  px(g,25,7+swM,1,17,"#5a2fb0"); px(g,31,7+swM,1,17,"#5a2fb0");
  px(g,26,8+swM,1,17,"#2a1a4a"); px(g,27,6+swM,2,19,"#a04aff"); px(g,28,7+swM,1,18,"#fff"); px(g,29,8+swM,1,15,"#ff2a5a");
  px(g,27,5+swM,2,2,"#fff"); px(g,26,4+swM,4,2,"#d08aff"); px(g,27,10+swM,1,2,"#fff"); px(g,27,16+swM,1,2,"#ff2a5a");
  px(g,25,24+swM,4,2,"#2a1a4a"); px(g,26,24+swM,2,1,"#ff2a5a");
  // TERRIFYING mask: larger violet blaze eye + bleed + fanged grin + brow + scars
  px(g,10+A.hx,7+hb,12,11,"#08080e");
  px(g,10+A.hx,7+hb,1,11,"#2a2a3e"); px(g,21+A.hx,7+hb,1,11,"#000");
  px(g,10+A.hx,7+hb,12,2,"#000");
  px(g,11+A.hx,7+hb,10,1,"#4a2060");
  px(g,11+A.hx,9+hb,10,4,"#7a2fd0"); px(g,12+A.hx,10+hb,8,3,"#d08aff"); px(g,14+A.hx,11+hb,4,2,"#fff"); px(g,15+A.hx,11+hb,2,1,"#fff");
  px(g,12+A.hx,9+hb,10,1,"#fff");
  px(g,12+A.hx,13+hb,1,4,"#7a2bff"); px(g,19+A.hx,13+hb,1,2,"#ff2a5a"); px(g,12+A.hx,16+hb,1,1,"#3a2060");
  px(g,12+A.hx,16+hb,8,2,"#000");
  px(g,12+A.hx,16+hb,1,1,"#fff"); px(g,14+A.hx,16+hb,1,2,"#fff"); px(g,16+A.hx,16+hb,1,2,"#fff"); px(g,18+A.hx,16+hb,1,1,"#fff");
  px(g,13+A.hx,17+hb,2,1,"#4a4a5e"); px(g,16+A.hx,17+hb,2,1,"#4a4a5e");
  px(g,11+A.hx,12+hb,1,3,"#ff2a5a"); px(g,20+A.hx,12+hb,1,3,"#ff2a5a");
  // smooth swept bone horns: longer, thinner, shaded undersides, violet roots, blood tips
  px(g,7+A.hx,7+hb,2,2,"#e8e0d0"); px(g,5+A.hx,6+hb,2,2,"#e8e0d0"); px(g,3+A.hx,5+hb,2,2,"#e8e0d0");
  px(g,1+A.hx,3+hb,2,2,"#ff8aaa"); px(g,0+A.hx,1+hb,2,2,"#e8e0d0"); px(g,0+A.hx,0+hb,1,1,"#fff");
  px(g,7+A.hx,8+hb,2,1,"#8a8078"); px(g,5+A.hx,7+hb,2,1,"#8a8078"); px(g,3+A.hx,6+hb,2,1,"#8a8078");
  px(g,7+A.hx,7+hb,2,1,"#a04aff");
  px(g,23+A.hx,7+hb,2,2,"#e8e0d0"); px(g,25+A.hx,6+hb,2,2,"#e8e0d0"); px(g,27+A.hx,5+hb,2,2,"#e8e0d0");
  px(g,29+A.hx,3+hb,2,2,"#ff8aaa"); px(g,30+A.hx,1+hb,2,2,"#e8e0d0"); px(g,31+A.hx,0+hb,1,1,"#fff");
  px(g,23+A.hx,8+hb,2,1,"#8a8078"); px(g,25+A.hx,7+hb,2,1,"#8a8078"); px(g,27+A.hx,6+hb,2,1,"#8a8078");
  px(g,23+A.hx,7+hb,2,1,"#a04aff");
  // floating broken halo: thicker bright arc, wide gap, BIG shards + blood + white cores
  px(g,8,0,6,2,"#2a1a4a"); px(g,18,0,6,2,"#2a1a4a");
  px(g,8,0,6,1,"#d08aff"); px(g,18,0,6,1,"#d08aff");
  px(g,7,1,2,2,"#2a1a4a"); px(g,23,1,2,2,"#2a1a4a");
  px(g,4,3,4,4,"#a04aff"); px(g,4,3,3,1,"#fff"); px(g,5,4,1,2,"#ff2a5a");
  px(g,24,3,4,4,"#ff2a5a"); px(g,24,3,3,1,"#fff"); px(g,27,4,1,2,"#a04aff");
};

const prev = window.Sprites.actor;
const cache = new Map();
try{ (window.__spriteCacheResets=window.__spriteCacheResets||[]).push(()=>cache.clear()); }catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if(D[kind]){
    gen=(gen==="male"||gen==="female")?gen:"";
    let P=null,bk="";
    try{ if(window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph); } else P=window.Anim.normP(null); } }catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck="HPAR|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=document.createElement("canvas"); c.width=32; c.height=40; const g2=c.getContext("2d"); g2.imageSmoothingEnabled=false;
    g2.clearRect(0,0,32,40);
    try{ D[kind](g2,tint||"#fff",P); }catch(e){}
    let out=c; try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>800) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
})();
