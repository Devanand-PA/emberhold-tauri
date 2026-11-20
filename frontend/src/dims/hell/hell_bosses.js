/* Hell warlords + legacy hell kinds — bespoke boss painters (loads AFTER hell_sprites.js).
 * Outermost wrapper: handles boss/legacy kinds, falls through to previous chain (wilds).
 * Each boss: full-canvas silhouette, unique headgear/weapon, family palette, NEVER villager hair.
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
// ============ ASH WARLORDS (inferno) ============
// ASH TYRANT v5 REALISM (goddess/peter bar: ash aura+shadow, basalt plate+ember core, slab pauldrons, ashfall crown, ember greatsword, ~95 rects)
D.ash_tyrant = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#4a3430", dk="#1e1412", lite="#8a7068";
  g.fillStyle="rgba(200,120,60,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,122,42,0.10)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,20,1,1,"#ff7a2a"); px(g,28,16,1,1,"#fff"); px(g,26,32,1,1,"#ff7a2a");
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,9+A.lx,29+A.ld,1,7,lite); px(g,22+A.rx,29+A.rd,1,7,"#000");
  px(g,8+A.lx,35+A.ld,7,2,"#0a0808"); px(g,17+A.rx,35+A.rd,7,2,"#0a0808");
  // ash cape: dark panels, ember hem, fold shading
  px(g,5,15,4,17,"#2e2220"); px(g,23,15,4,17,"#2e2220");
  px(g,5,15,1,17,"#4a3a34"); px(g,26,15,1,17,"#140e0c");
  px(g,5,15,4,2,"#ff7a2a"); px(g,23,15,4,2,"#ff7a2a"); px(g,5,15,4,1,"#ffd93d"); px(g,23,15,4,1,"#ffd93d");
  px(g,6,30,2,2,"#ff7a2a"); px(g,24,30,2,2,"#ff7a2a");
  // torso: basalt plate, ember core furnace, gold rivets
  px(g,8,16,16,14,skin); px(g,8,16,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,16,2,14,dk); px(g,22,16,2,14,dk);
  px(g,12,20,8,8,"#0e0a08"); px(g,13,21,6,6,"#ff7a2a"); px(g,14,22,4,4,"#ffd93d"); px(g,15,23,2,2,"#fff");
  px(g,12,20,8,1,"#ff9d5a"); px(g,12,27,8,1,"#7a2a0a");
  for(let i=0;i<3;i++){ px(g,9,18+i*3,3,1,lite); px(g,20,19+i*3,3,1,dk); }
  px(g,9,17,2,2,"#c9a227"); px(g,21,17,2,2,"#c9a227");
  // slab pauldrons: wide basalt, ash top, ember cracks
  px(g,1+A.lax,11+A.la,9,7,dk); px(g,1+A.lax,11+A.la,9,2,lite);
  px(g,3+A.lax,9+A.la,5,3,lite); px(g,3+A.lax,9+A.la,5,1,"#fff");
  px(g,2+A.lax,14+A.la,3,3,"#ff7a2a"); px(g,3+A.lax,15+A.la,1,1,"#fff");
  px(g,22+A.rax,11+A.ra,9,7,dk); px(g,22+A.rax,11+A.ra,9,2,"#ff7a2a");
  px(g,24+A.rax,9+A.ra,5,3,lite); px(g,25+A.rax,10+A.ra,3,1,"#ff7a2a");
  // left arm + ash bracer + fist
  px(g,2+A.lax,19+A.la,5,8,skin); px(g,2+A.lax,19+A.la,1,8,lite);
  px(g,2+A.lax,25+A.la,5,3,dk); px(g,2+A.lax,25+A.la,5,1,"#ff7a2a");
  px(g,2+A.lax,28+A.la,5,2,dk);
  // right arm + EMBER GREATSWORD (swings on atk)
  const sw=P.atk?-6:0;
  px(g,24+A.rax,19+A.ra+sw,4,8,skin); px(g,24+A.rax,25+A.ra+sw,4,2,dk);
  px(g,24+A.rax,13+A.ra+sw,3,15,"#8a8078"); px(g,24+A.rax,13+A.ra+sw,1,15,"#fff");
  px(g,24+A.rax,15+A.ra+sw,1,10,"#ff7a2a"); px(g,26+A.rax,15+A.ra+sw,1,8,"#5a4a42");
  px(g,22+A.rax,11+A.ra+sw,7,3,"#5a4a42"); px(g,22+A.rax,11+A.ra+sw,7,1,"#ffd93d");
  px(g,24+A.rax,26+A.ra+sw,3,3,"#ff7a2a"); px(g,25+A.rax,27+A.ra+sw,1,1,"#fff");
  // head: basalt helm-face, ember eyes, grim mouth
  px(g,10+A.hx,6+hb,12,11,skin); px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,dk);
  px(g,10+A.hx,6+hb,2,11,dk); px(g,20+A.hx,6+hb,2,11,dk);
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1);
  px(g,13+A.hx,15+hb,6,1,dk); px(g,14+A.hx,16+hb,4,1,"#ff7a2a");
  // ashfall crown: 5 basalt spikes, ember tips, gold roots
  for(let i=0;i<5;i++){ const cx=8+i*3+A.hx; px(g,cx,0+hb,3,7,"#5a4a42"); px(g,cx,0+hb,3,1,"#fff"); px(g,cx,0+hb,2,2,"#ff7a2a"); }
  px(g,9+A.hx,6+hb,14,1,"#c9a227");
};
// CINDER EMPEROR v5 REALISM (ember court: tall gold crown+red gems, orb + scepter, red cape w/ gold trim, ember cuirass, ~95 rects)
D.cinder_emperor = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#6a2a10", dk="#2a0e04", lite="#a05a2a";
  g.fillStyle="rgba(255,90,26,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,217,61,0.09)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff5a1a"); px(g,28,18,1,1,"#fff"); px(g,26,32,1,1,"#ff5a1a");
  px(g,10+A.lx,29+A.ld,4,7,dk); px(g,18+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,29+A.ld,1,7,lite); px(g,21+A.rx,29+A.rd,1,7,"#000");
  px(g,9+A.lx,35+A.ld,6,2,"#140802"); px(g,17+A.rx,35+A.rd,6,2,"#140802");
  // red cape: deep panels, gold top trim, fold shading, ember hem
  px(g,4,15,4,18,"#8a0a1a"); px(g,24,15,4,18,"#8a0a1a");
  px(g,4,15,1,18,"#c92a3a"); px(g,27,15,1,18,"#4a0410");
  px(g,4,15,4,2,"#ffd93d"); px(g,24,15,4,2,"#ffd93d"); px(g,4,15,4,1,"#fff2b0"); px(g,24,15,4,1,"#fff2b0");
  px(g,5,31,2,2,"#ff5a1a"); px(g,25,31,2,2,"#ff5a1a");
  // torso: ember skin + gold-banded cuirass + furnace gem
  px(g,8,17,16,13,skin); px(g,8,17,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,dk); px(g,22,17,2,13,dk);
  px(g,11,21,10,8,"#2a0e04"); px(g,12,22,8,6,"#ff5a1a"); px(g,13,23,6,4,"#ffd93d"); px(g,15,24,2,2,"#fff");
  for(let i=0;i<3;i++){ px(g,11,21+i*3,10,1,"#ffd93d"); px(g,11,21+i*3,10,1,"#fff2b0"); }
  // LEFT arm + EMBER ORB (blazes on atk)
  px(g,5+A.lax,19+A.la,3,7,skin); px(g,5+A.lax,19+A.la,1,7,lite);
  const bl=P.atk?1:0;
  px(g,4+A.lax,24+A.la-bl,6,6,"#ff7a2a"); px(g,4+A.lax,24+A.la-bl,6,1,"#ffd93d");
  px(g,5+A.lax,25+A.la-bl,4,4,"#ffd93d"); px(g,6+A.lax,26+A.la-bl,2,2,"#fff");
  px(g,4+A.lax,24+A.la-bl,6,1,"#fff2b0"); px(g,4+A.lax,29+A.la-bl,6,1,"#7a2a0a");
  // RIGHT arm + scepter (raises on atk)
  const up=P.atk?-5:0;
  px(g,24+A.rax,19+A.ra+up,3,8,skin);
  px(g,24+A.rax,11+A.ra+up,2,14,"#c9a227"); px(g,24+A.rax,11+A.ra+up,1,14,"#fff2b0");
  px(g,22+A.rax,6+A.ra+up,7,6,"#ffd93d"); px(g,22+A.rax,6+A.ra+up,7,1,"#fff");
  px(g,23+A.rax,8+A.ra+up,5,4,"#ff5a1a"); px(g,24+A.rax,9+A.ra+up,3,2,"#fff");
  // head + TALL GOLD CROWN with red gems
  px(g,10+A.hx,7+hb,12,10,skin); px(g,10+A.hx,7+hb,12,2,lite);
  px(g,10+A.hx,7+hb,2,10,dk); px(g,20+A.hx,7+hb,2,10,dk);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,3,2); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillRect(18+A.hx,11+hb,1,2);
  px(g,14+A.hx,15+hb,4,1,"#ffd93d");
  px(g,9+A.hx,0+hb,14,8,"#ffd93d"); px(g,9+A.hx,0+hb,14,1,"#fff2b0"); px(g,9+A.hx,7+hb,14,1,"#8a6a1a");
  px(g,9+A.hx,0+hb,2,8,"#c9a227"); px(g,21+A.hx,0+hb,2,8,"#c9a227");
  px(g,12+A.hx,2+hb,2,4,"#ff5a1a"); px(g,12+A.hx,2+hb,1,1,"#fff");
  px(g,15+A.hx,2+hb,2,4,"#c92a0a"); px(g,15+A.hx,2+hb,1,1,"#ff8a8a");
  px(g,18+A.hx,2+hb,2,4,"#ff5a1a"); px(g,18+A.hx,2+hb,1,1,"#fff");
};
// MAGMA MAULER v5 REALISM (lava construct: chimney crown+ember vents, magma chest, twin hammer fists, cracked basalt, ~95 rects)
D.magma_mauler = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#3a1a08", dk="#120803", lite="#8a4a1a";
  g.fillStyle="rgba(255,90,26,0.17)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,60,20,0.10)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,10,2.8,0,0,7); g.fill();
  px(g,3,24,1,1,"#ff5a1a"); px(g,28,18,1,1,"#fff"); px(g,25,33,1,1,"#ff5a1a");
  px(g,8+A.lx,28+A.ld,5,8,dk); px(g,19+A.rx,28+A.rd,5,8,dk);
  px(g,8+A.lx,28+A.ld,2,8,lite); px(g,22+A.rx,28+A.rd,2,8,"#000");
  px(g,7+A.lx,35+A.ld,7,2,"#000"); px(g,18+A.rx,35+A.rd,7,2,"#000");
  // torso: boxy basalt, magma core with crust bars, rivets
  px(g,6,14,20,15,skin); px(g,6,14,20,2,lite); px(g,6,27,20,2,dk);
  px(g,6,14,2,15,dk); px(g,24,14,2,15,dk);
  px(g,10,18,12,9,"#0e0502"); px(g,11,19,10,7,"#ff5a1a"); px(g,12,20,8,5,"#ffd93d"); px(g,15,21,2,3,"#fff");
  for(let i=0;i<3;i++) px(g,11,20+i*3,10,1,"#7a1f1f");
  px(g,7,15,3,2,"#c9a227"); px(g,22,15,3,2,"#c9a227");
  // twin HAMMER FISTS (slam on atk)
  const sm=P.atk?-5:0;
  px(g,1+A.lax,16+A.la+sm,5,9,skin); px(g,1+A.lax,16+A.la+sm,1,9,lite);
  px(g,0+A.lax,24+A.la+sm,8,6,dk); px(g,0+A.lax,24+A.la+sm,8,1,"#8a4a1a");
  px(g,1+A.lax,25+A.la+sm,6,2,"#ff5a1a"); px(g,2+A.lax,25+A.la+sm,2,1,"#fff");
  px(g,26+A.rax,16+A.ra+sm,5,9,skin); px(g,26+A.rax,16+A.ra+sm,1,9,lite);
  px(g,24+A.rax,24+A.ra+sm,8,6,dk); px(g,24+A.rax,24+A.ra+sm,8,1,"#8a4a1a");
  px(g,25+A.rax,25+A.ra+sm,6,2,"#ff5a1a"); px(g,28+A.rax,25+A.ra+sm,2,1,"#fff");
  // head + CHIMNEY CROWN with ember vents
  px(g,9,5+hb,14,11,skin); px(g,9,5+hb,14,2,lite); px(g,9,14+hb,14,2,dk);
  px(g,11,0+hb,4,6,dk); px(g,11,0+hb,4,1,lite); px(g,12,1+hb,2,4,"#ff5a1a"); px(g,12,1+hb,1,1,"#fff");
  px(g,17,0+hb,4,6,dk); px(g,17,0+hb,4,1,lite); px(g,18,1+hb,2,4,"#ff5a1a"); px(g,18,1+hb,1,1,"#fff");
  g.fillStyle="#ff3b3b"; g.fillRect(12,9+hb,3,3); g.fillRect(18,9+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13,10+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12,9+hb,1,1);
  px(g,12,14+hb,8,1,dk); px(g,13,15+hb,6,1,"#ff5a1a");
};
// PYRE QUEEN v5 REALISM (flame gown triangle, ember bodice, war fan sweeping, flame crown+white core, ~95 rects)
D.pyre_queen = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#ff4a1a", dk="#7a1e04", lite="#ff9a5a";
  g.fillStyle="rgba(255,110,30,0.17)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,217,61,0.10)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,26,1,1,"#ffd93d"); px(g,28,20,1,1,"#fff"); px(g,25,33,1,1,"#ffd93d");
  // gown: wide triangle, layered flames, gold waist, ember hem
  px(g,7,24,18,12,dk); px(g,7,24,18,2,"#ff7a2a");
  px(g,9,22,14,6,"#c92a0a"); px(g,9,22,14,2,"#ffd93d");
  px(g,11,26,4,8,skin); px(g,11,26,1,8,lite); px(g,17,26,4,8,skin); px(g,20,26,1,8,"#c92a0a");
  px(g,12,24,8,2,"#ffd93d"); px(g,12,24,8,1,"#fff2b0");
  px(g,13,21,6,5,"#7a1e04"); px(g,14,22,4,3,"#ffd93d"); px(g,15,23,2,1,"#fff");
  px(g,8,34,16,2,"#ff7a2a"); px(g,10,34,3,2,"#ffd93d"); px(g,19,34,3,2,"#ffd93d");
  // torso + arms
  px(g,9,15,14,8,skin); px(g,9,15,14,2,lite); px(g,9,21,14,2,dk);
  px(g,5+A.lax,17+A.la,3,7,skin); px(g,5+A.lax,17+A.la,1,7,lite);
  px(g,5+A.lax,23+A.la,3,3,"#ffd93d");
  // WAR FAN sweeping (fans out on atk)
  const fw=P.atk?2:-2;
  g.fillStyle="#ffd93d"; g.beginPath(); g.moveTo(24+A.rax,22+A.ra); g.lineTo(31+A.rax,13+A.ra+fw); g.lineTo(30+A.rax,23+A.ra); g.fill();
  g.fillStyle="#ff4a1a"; g.beginPath(); g.moveTo(25+A.rax,22+A.ra); g.lineTo(30+A.rax,15+A.ra+fw); g.lineTo(29+A.rax,22+A.ra); g.fill();
  px(g,24+A.rax,21+A.ra,6,2,"#7a1e04"); px(g,24+A.rax,21+A.ra,2,2,"#ffd93d");
  px(g,25+A.rax,23+A.ra,2,4,skin);
  // face + FLAME CROWN with white core
  px(g,10+A.hx,6+hb,12,10,"#e8a080"); px(g,10+A.hx,6+hb,12,2,"#fff2e0"); px(g,10+A.hx,14+hb,12,2,"#c97a5a");
  g.fillStyle="#111"; g.fillRect(12+A.hx,10+hb,3,3); g.fillRect(18+A.hx,10+hb,2,2);
  g.fillStyle="#ff3b3b"; g.fillRect(12+A.hx,10+hb,1,1); g.fillRect(18+A.hx,10+hb,1,1);
  px(g,13+A.hx,14+hb,6,1,"#7a1e04"); px(g,14+A.hx,15+hb,4,1,"#ff4a1a");
  px(g,8+A.hx,0+hb,4,7,"#ff7a2a"); px(g,8+A.hx,0+hb,1,7,"#ffd93d");
  px(g,13+A.hx,0+hb,6,8,"#ffd93d"); px(g,13+A.hx,0+hb,6,1,"#fff"); px(g,15+A.hx,2+hb,2,5,"#fff");
  px(g,20+A.hx,0+hb,4,7,"#ff7a2a"); px(g,23+A.hx,0+hb,1,7,"#ffd93d");
  px(g,10+A.hx,6+hb,12,1,"#ffd93d");
};
// SLAG COLOSSUS v5 REALISM (slab titan: offset slab shoulders, glowing seams, slab fists, basalt crown, ~95 rects)
D.slag_colossus = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#241a12", dk="#0a0603", lite="#5a4a34";
  g.fillStyle="rgba(255,106,26,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,217,61,0.08)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,10,2.8,0,0,7); g.fill();
  px(g,3,24,1,1,"#ff6a1a"); px(g,28,18,1,1,"#fff");
  px(g,7+A.lx,28+A.ld,6,8,dk); px(g,19+A.rx,28+A.rd,6,8,dk);
  px(g,7+A.lx,28+A.ld,2,8,lite); px(g,23+A.rx,28+A.rd,2,8,"#000");
  px(g,6+A.lx,35+A.ld,8,2,"#000"); px(g,18+A.rx,35+A.rd,8,2,"#000");
  // torso: wide basalt + glowing vertical seams + rivets
  px(g,5,13,22,16,skin); px(g,5,13,22,2,lite); px(g,5,27,22,2,dk);
  px(g,5,13,2,16,dk); px(g,25,13,2,16,dk);
  px(g,13,17,3,10,"#ff6a1a"); px(g,13,17,3,1,"#fff"); px(g,14,19,1,5,"#ffd93d");
  px(g,18,20,3,7,"#ff6a1a"); px(g,19,21,1,4,"#ffd93d");
  px(g,8,15,3,2,"#c9a227"); px(g,21,15,3,2,"#c9a227");
  for(let i=0;i<2;i++){ px(g,9,22+i*4,4,1,lite); px(g,20,21+i*4,3,1,dk); }
  // offset SLAB SHOULDERS + slab fists (slam on atk)
  px(g,0+A.lax,7+A.la,10,8,lite); px(g,0+A.lax,7+A.la,10,1,"#fff"); px(g,1+A.lax,9+A.la,8,2,"#ff6a1a");
  px(g,0+A.lax,7+A.la,2,8,"#8a7a5a"); px(g,8+A.lax,7+A.la,2,8,dk);
  px(g,22+A.rax,9+A.ra,10,8,lite); px(g,22+A.rax,9+A.ra,10,1,"#fff"); px(g,23+A.rax,11+A.ra,8,2,"#ff6a1a");
  px(g,22+A.rax,9+A.ra,2,8,dk); px(g,30+A.rax,9+A.ra,2,8,"#8a7a5a");
  const sm=P.atk?-5:0;
  px(g,1+A.lax,16+A.la+sm,6,9,skin); px(g,1+A.lax,16+A.la+sm,1,9,lite);
  px(g,0+A.lax,24+A.la+sm,8,5,dk); px(g,1+A.lax,25+A.la+sm,6,1,"#ff6a1a");
  px(g,25+A.rax,16+A.ra+sm,6,9,skin); px(g,25+A.rax,16+A.ra+sm,1,9,lite);
  px(g,24+A.rax,24+A.ra+sm,8,5,dk); px(g,25+A.rax,25+A.ra+sm,6,1,"#ff6a1a");
  // head: heavy basalt + amber eyes + slab crown horns
  px(g,10+A.hx,3+hb,12,11,skin); px(g,10+A.hx,3+hb,12,2,lite); px(g,10+A.hx,12+hb,12,2,dk);
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,7+hb,3,3); g.fillRect(18+A.hx,7+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,8+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,7+hb,1,1);
  px(g,13+A.hx,12+hb,6,1,dk);
  px(g,7+A.hx,0+hb,4,5,"#5a4a34"); px(g,7+A.hx,0+hb,1,5,"#fff");
  px(g,21+A.hx,0+hb,4,5,"#5a4a34"); px(g,21+A.hx,0+hb,1,5,"#fff");
};
// EMBER INQUISITOR v5 REALISM (pointed hood+gold trim, scripture book w/ burning page, brand shimmer, censer sparks, ~95 rects)
D.ember_inquisitor = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#8a3a0a", dk="#2e1204", lite="#c96a2a";
  g.fillStyle="rgba(255,122,42,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,217,61,0.08)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,26,1,1,"#ff7a2a"); px(g,28,20,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#140802"); px(g,16+A.rx,35+A.rd,6,2,"#140802");
  // cassock: ember panels, furnace stole, gold hem
  px(g,8,17,16,14,skin); px(g,8,17,16,2,lite); px(g,8,29,16,2,dk);
  px(g,8,17,2,14,dk); px(g,22,17,2,14,dk);
  px(g,12,19,8,10,"#2e1204"); px(g,13,20,6,8,"#ff7a2a"); px(g,14,21,4,6,"#ffd93d"); px(g,15,22,2,2,"#fff");
  px(g,8,29,16,2,"#ffd93d"); px(g,8,29,16,1,"#fff2b0");
  // LEFT arm + SCRIPTURE BOOK (burning page flares on atk)
  const fl=P.atk?1:0;
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,3+A.lax,24+A.la-fl,6,7,"#5a3a22"); px(g,3+A.lax,24+A.la-fl,6,1,"#c9a227");
  px(g,4+A.lax,25+A.la-fl,4,5,"#e8d9b8"); px(g,4+A.lax,25+A.la-fl,4,1,"#fff");
  px(g,5+A.lax,26+A.la-fl,2,3,"#ff5a1a"); px(g,5+A.lax,26+A.la-fl,1,1,"#fff");
  px(g,6+A.lax,28+A.la-fl,1,2,"#7a1f1f");
  // RIGHT arm + BRAND (raises on cast)
  const up=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+up,3,7,skin);
  px(g,25+A.rax,13+A.ra+up,2,12,"#5a4a42"); px(g,25+A.rax,13+A.ra+up,1,12,"#8a7a6a");
  px(g,23+A.rax,6+A.ra+up,6,8,"#ff7a2a"); px(g,23+A.rax,6+A.ra+up,6,1,"#fff"); px(g,24+A.rax,8+A.ra+up,4,4,"#fff");
  px(g,24+A.rax,9+A.ra+up,2,2,"#ff5a1a");
  px(g,23+A.rax,6+A.ra+up,6,1,"#ffd93d");
  // pointed HOOD + shadowed face + gold eyes
  px(g,8+A.hx,7+hb,16,5,dk); px(g,8+A.hx,7+hb,16,1,"#5a3a22");
  px(g,10+A.hx,3+hb,12,7,lite); px(g,10+A.hx,3+hb,12,1,"#ffd93d"); px(g,10+A.hx,3+hb,2,7,skin);
  px(g,13+A.hx,0+hb,6,5,skin); px(g,13+A.hx,0+hb,6,1,lite);
  px(g,11+A.hx,9+hb,10,7,"#1e0c02"); px(g,11+A.hx,9+hb,10,1,"#3a1a08");
  g.fillStyle="#ffd93d"; g.fillRect(13+A.hx,11+hb,2,2); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(14+A.hx,12+hb,1,1); g.fillRect(18+A.hx,12+hb,1,1);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,11+hb,1,1);
  px(g,15+A.hx,14+hb,2,1,"#ff7a2a");
  // censer sparks
  px(g,3,27,2,4,"#ff7a2a"); px(g,3,27,1,1,"#fff"); px(g,27,28,2,4,"#ff7a2a"); px(g,27,28,1,1,"#fff");
};
// CHAR KING v5 REALISM (blackened king: charred crown+red band, black greatsword w/ red fuller, furnace core, ~95 rects)
D.char_king = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#1e1410", dk="#000000", lite="#4a3c30";
  g.fillStyle="rgba(255,59,59,0.13)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(120,20,20,0.12)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff3b3b"); px(g,28,18,1,1,"#fff");
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,8+A.lx,35+A.ld,7,2,"#000"); px(g,17+A.rx,35+A.rd,7,2,"#000");
  // tattered black cape
  px(g,4,15,4,18,"#0a0808"); px(g,24,15,4,18,"#0a0808");
  px(g,4,15,1,18,"#2a2a2a"); px(g,27,15,1,18,"#000");
  px(g,4,31,4,2,"#3a3a3a"); px(g,24,31,4,2,"#3a3a3a");
  // torso: charred plate, red seam core, gold clasp
  px(g,7,17,18,13,skin); px(g,7,17,18,2,lite); px(g,7,28,18,2,dk);
  px(g,7,17,2,13,dk); px(g,23,17,2,13,dk);
  px(g,11,21,10,7,"#0a0808"); px(g,12,22,8,2,"#ff3b3b"); px(g,12,24,8,2,"#7a1f1f"); px(g,13,22,2,1,"#fff");
  px(g,14,26,4,2,"#c9a227"); px(g,15,26,2,1,"#fff");
  // left arm + charred bracer
  px(g,3+A.lax,19+A.la,5,8,skin); px(g,3+A.lax,19+A.la,1,8,lite);
  px(g,3+A.lax,25+A.la,5,3,dk); px(g,3+A.lax,25+A.la,5,1,"#ff3b3b");
  px(g,3+A.lax,28+A.la,5,2,dk);
  // right arm + BLACK GREATSWORD (red fuller, gold guard)
  const sw=P.atk?-6:0;
  px(g,24+A.rax,19+A.ra+sw,4,8,skin);
  px(g,24+A.rax,12+A.ra+sw,3,15,"#0a0808"); px(g,24+A.rax,12+A.ra+sw,1,13,"#ff3b3b"); px(g,26+A.rax,13+A.ra+sw,1,12,"#3a3a3a");
  px(g,24+A.rax,12+A.ra+sw,1,2,"#fff");
  px(g,22+A.rax,10+A.ra+sw,7,3,"#ffd93d"); px(g,22+A.rax,10+A.ra+sw,7,1,"#fff2b0");
  px(g,24+A.rax,25+A.ra+sw,3,3,dk);
  // head + CHARRED CROWN (3 spikes, red band, ember tips)
  px(g,10+A.hx,6+hb,12,11,skin); px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,dk);
  g.fillStyle="#ff3b3b"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1); g.fillRect(18+A.hx,11+hb,1,1);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2);
  px(g,13+A.hx,15+hb,6,1,dk);
  px(g,9+A.hx,1+hb,14,5,"#0a0808"); px(g,9+A.hx,1+hb,14,1,"#2a2a2a"); px(g,10+A.hx,5+hb,12,1,"#ff3b3b");
  for(let i=0;i<3;i++){ const cx=10+i*4+A.hx; px(g,cx,0+hb,3,4,"#4a3c30"); px(g,cx,0+hb,3,1,"#8a7a5a"); }
};
// VOLCANO PONTIFF v5 REALISM (split mitre+gold bands, lava-orb staff w/ halo, cope clasp+gold hem, ~95 rects)
D.volcano_pontiff = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#5a1e04", dk="#200a02", lite="#8a4a1a";
  g.fillStyle="rgba(255,122,42,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(255,217,61,0.09)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff7a2a"); px(g,28,18,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#0e0502"); px(g,16+A.rx,35+A.rd,6,2,"#0e0502");
  // cope: deep ember, gold clasp column, gold hem
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,13,19,6,9,"#ffd93d"); px(g,13,19,6,1,"#fff2b0");
  px(g,14,20,4,7,"#ff5a1a"); px(g,15,21,2,5,"#fff");
  px(g,7,29,18,2,"#ffd93d"); px(g,7,29,18,1,"#fff2b0");
  // left arm + blessing hand + gold cuff
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,4+A.lax,24+A.la,3,3,"#ffd93d"); px(g,4+A.lax,24+A.la,3,1,"#fff2b0");
  px(g,4+A.lax,27+A.la,3,2,skin);
  // right arm + LAVA-ORB STAFF (raises on cast, halo glow)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(255,122,42,0.25)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#3a2a1a"); px(g,25+A.rax,12+A.ra+up,1,16,"#8a5a33");
  px(g,22+A.rax,4+A.ra+up,8,9,"#ffd93d"); px(g,22+A.rax,4+A.ra+up,8,1,"#fff");
  px(g,23+A.rax,5+A.ra+up,6,7,"#ff5a1a"); px(g,24+A.rax,6+A.ra+up,4,4,"#fff"); px(g,25+A.rax,7+A.ra+up,2,2,"#ff5a1a");
  px(g,22+A.rax,11+A.ra+up,8,2,"#c9a227");
  // SPLIT MITRE + face
  px(g,9+A.hx,1+hb,14,9,"#ffd93d"); px(g,9+A.hx,1+hb,14,1,"#fff2b0");
  px(g,14+A.hx,1+hb,4,9,"#5a1e04"); px(g,14+A.hx,1+hb,1,9,"#8a4a1a"); px(g,17+A.hx,1+hb,1,9,"#8a4a1a");
  px(g,9+A.hx,8+hb,14,2,"#ff5a1a"); px(g,10+A.hx,8+hb,12,1,"#fff2b0");
  px(g,10+A.hx,10+hb,12,8,"#c98a5a"); px(g,10+A.hx,10+hb,12,1,"#f2d0a0");
  g.fillStyle="#111"; g.fillRect(12+A.hx,12+hb,3,2); g.fillRect(18+A.hx,12+hb,2,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,12+hb,1,1);
  px(g,15+A.hx,15+hb,2,1,dk);
};

// ============ ABYSS WARLORDS ============
// VOID PRELATE v5 REALISM (dark halo+shards, beam staff w/ halo glow, tattered stole+gold trim, ~95 rects)
D.void_prelate = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#1a0a2e", dk="#05030c", lite="#4a3a7a";
  g.fillStyle="rgba(122,74,224,0.22)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(138,123,255,0.12)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#8a7bff"); px(g,28,18,1,1,"#fff");
  // floating broken halo + shards
  px(g,9,1+hb,5,2,"#2a1a4a"); px(g,18,1+hb,5,2,"#2a1a4a");
  px(g,9,1+hb,5,1,"#8a7bff"); px(g,18,1+hb,5,1,"#8a7bff");
  px(g,7,3+hb,2,3,"#8a7bff"); px(g,7,3+hb,1,1,"#fff"); px(g,23,3+hb,2,3,"#8a7bff"); px(g,23,3+hb,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#000"); px(g,16+A.rx,35+A.rd,6,2,"#000");
  // cope: void panels, violet stole, gold hem
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,11,19,3,11,"#8a7bff"); px(g,11,19,3,1,"#fff"); px(g,18,19,3,11,"#3a2a7a"); px(g,18,19,3,1,"#8a7bff");
  px(g,7,29,18,2,"#c9a227"); px(g,7,29,18,1,"#fff2b0");
  // left arm + void tome
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,3+A.lax,24+A.la,5,6,"#2a1a4a"); px(g,3+A.lax,24+A.la,5,1,"#8a7bff");
  px(g,4+A.lax,25+A.la,3,4,"#8a7bff"); px(g,4+A.lax,25+A.la,1,1,"#fff");
  // right arm + BEAM STAFF (halo glow, flares on cast)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(138,123,255,0.25)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#0a0812"); px(g,25+A.rax,12+A.ra+up,1,16,"#4a3a7a");
  px(g,22+A.rax,4+A.ra+up,8,9,"#0a0812"); px(g,22+A.rax,4+A.ra+up,8,1,"#8a7bff");
  px(g,23+A.rax,5+A.ra+up,6,7,"#8a7bff"); px(g,24+A.rax,6+A.ra+up,4,5,"#fff"); px(g,25+A.rax,8+A.ra+up,2,2,"#8a7bff");
  if(P.atk){ px(g,24+A.rax,13+A.ra,2,8,"#8a7bff"); px(g,24+A.rax,13+A.ra,1,2,"#fff"); }
  // hooded void face: pale blaze eyes, slit pupils
  px(g,10+A.hx,8+hb,12,10,"#0a0812"); px(g,10+A.hx,8+hb,12,1,"#2a2a3a");
  g.fillStyle="#c9c2ff"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1);
  px(g,14+A.hx,15+hb,4,2,"#3a2a7a"); px(g,15+A.hx,16+hb,2,1,"#8a7bff");
};
// UMBRAL MATRIARCH v5 REALISM (violet gown w/ star trim, clawed sleeves, horned headdress+brow jewel, ~95 rects)
D.umbral_matriarch = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#2a1040", dk="#0c0416", lite="#5a3a8a";
  g.fillStyle="rgba(122,43,255,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(200,180,255,0.10)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,24,1,1,"#8a7bff"); px(g,28,18,1,1,"#fff");
  // gown: layered violet, star band, dark hem
  px(g,6,24,20,12,lite); px(g,6,24,20,2,"#8a7bff"); px(g,6,34,20,2,dk);
  px(g,8,26,16,8,skin); px(g,8,26,16,2,"#3a2a6a");
  px(g,9,28,5,2,"#8a7bff"); px(g,9,28,1,1,"#fff"); px(g,18,30,5,2,"#c9c2ff");
  px(g,6,24,2,12,dk); px(g,24,24,2,12,dk);
  // bodice + jeweled brooch
  px(g,8,16,16,10,skin); px(g,8,16,16,2,lite);
  px(g,13,19,6,6,"#1a0a2e"); px(g,14,20,4,4,"#8a7bff"); px(g,15,21,2,2,"#fff");
  // CLAWED SLEEVES (right slashes on atk)
  const sw=P.atk?-3:0;
  px(g,3+A.lax,17+A.la,4,8,skin); px(g,3+A.lax,17+A.la,1,8,lite);
  px(g,2+A.lax,23+A.la,5,4,"#c9c2ff"); px(g,2+A.lax,23+A.la,5,1,"#fff");
  px(g,2+A.lax,25+A.la,1,3,"#c9c2ff"); px(g,4+A.lax,25+A.la,1,3,"#c9c2ff"); px(g,6+A.lax,25+A.la,1,3,"#c9c2ff");
  px(g,25+A.rax,17+A.ra+sw,4,8,skin); px(g,25+A.rax,17+A.ra+sw,1,8,lite);
  px(g,25+A.rax,23+A.ra+sw,5,4,"#c9c2ff"); px(g,25+A.rax,23+A.ra+sw,5,1,"#fff");
  px(g,25+A.rax,25+A.ra+sw,1,3,"#c9c2ff"); px(g,27+A.rax,25+A.ra+sw,1,3,"#c9c2ff"); px(g,29+A.rax,25+A.ra+sw,1,3,"#c9c2ff");
  // face: pale violet, glowing eyes, dark lips
  px(g,10+A.hx,7+hb,12,10,"#d8b8d8"); px(g,10+A.hx,7+hb,12,1,"#fff"); px(g,10+A.hx,15+hb,12,2,"#b898b8");
  g.fillStyle="#7a2bff"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1); g.fillRect(18+A.hx,11+hb,1,1);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2);
  px(g,14+A.hx,15+hb,4,1,"#7a1a3a");
  // HORNED HEADDRESS + brow jewel + veil
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,8+hb); g.lineTo(6+A.hx,0+hb); g.lineTo(11+A.hx,7+hb); g.fill();
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(21+A.hx,8+hb); g.lineTo(26+A.hx,0+hb); g.lineTo(21+A.hx,7+hb); g.fill();
  px(g,6+A.hx,0+hb,2,2,"#8a7bff"); px(g,24+A.hx,0+hb,2,2,"#8a7bff");
  px(g,13+A.hx,2+hb,6,4,"#8a7bff"); px(g,14+A.hx,3+hb,4,2,"#c9c2ff"); px(g,15+A.hx,3+hb,1,1,"#fff");
};
// GLOOM SOVEREIGN v5 REALISM (heavy plate+violet bands, slit visor w/ glow, greatblade, helm wings, ~95 rects)
D.gloom_sovereign = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#120a20", dk="#000000", lite="#3a2a5a";
  g.fillStyle="rgba(90,60,160,0.20)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(138,123,255,0.10)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#8a7bff"); px(g,28,18,1,1,"#fff");
  px(g,8+A.lx,28+A.ld,5,8,dk); px(g,19+A.rx,28+A.rd,5,8,dk);
  px(g,8+A.lx,28+A.ld,5,1,lite); px(g,19+A.rx,28+A.rd,5,1,lite);
  px(g,7+A.lx,35+A.ld,7,2,"#000"); px(g,18+A.rx,35+A.rd,7,2,"#000");
  // heavy plate + violet bands + rivets
  px(g,5,15,22,15,skin); px(g,5,15,22,2,lite); px(g,5,28,22,2,dk);
  px(g,5,15,2,15,dk); px(g,25,15,2,15,dk);
  px(g,8,19,16,3,"#8a7bff"); px(g,8,19,16,1,"#c9c2ff");
  px(g,9,23,14,3,"#2a1a44"); px(g,9,23,14,1,"#4a3a6a");
  px(g,7,16,3,3,lite); px(g,22,16,3,3,lite);
  // pauldrons + arms
  px(g,2+A.lax,14+A.la,6,9,lite); px(g,2+A.lax,14+A.la,6,1,"#8a7bff"); px(g,2+A.lax,14+A.la,1,9,"#fff");
  px(g,24+A.rax,14+A.ra,6,9,lite); px(g,24+A.rax,14+A.ra,6,1,"#8a7bff"); px(g,29+A.rax,14+A.ra,1,9,"#fff");
  px(g,2+A.lax,21+A.la,5,7,skin); px(g,25+A.rax,21+A.ra,5,7,skin);
  // GREATBLADE (sweeps on atk) + hilt
  const sw=P.atk?-6:0;
  px(g,1+A.lax,20+A.la+sw,2,14,"#0a0812"); px(g,1+A.lax,20+A.la+sw,1,14,"#8a7bff"); px(g,1+A.lax,20+A.la+sw,1,2,"#fff");
  px(g,0+A.lax,18+A.la+sw,4,3,"#8a7bff"); px(g,0+A.lax,18+A.la+sw,4,1,"#fff");
  px(g,2+A.lax,21+A.la+sw,3,3,"#c9a227");
  // helm: slit visor glow, wings, crest
  px(g,9,5+hb,14,12,skin); px(g,9,5+hb,14,2,lite); px(g,9,15+hb,14,2,dk);
  px(g,10,8+hb,12,4,"#000"); g.fillStyle="#8a7bff"; g.fillRect(11,9+hb,10,1); g.fillStyle="#fff"; g.fillRect(12,9+hb,2,1);
  px(g,7,1+hb,5,6,lite); px(g,7,1+hb,5,1,"#fff"); px(g,7,1+hb,1,6,"#8a7bff");
  px(g,20,1+hb,5,6,lite); px(g,20,1+hb,5,1,"#fff"); px(g,24,1+hb,1,6,"#8a7bff");
  px(g,14,0+hb,4,3,"#8a7bff"); px(g,15,1+hb,2,1,"#fff");
};
// RIFT EATER v5 REALISM (serpent maw: teeth ring, rift tongue, rift rings, needle crown+glow, coiled tail, ~95 rects)
D.rift_eater = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin="#22103a", dk="#0a0414", lite="#5a3a9a";
  g.fillStyle="rgba(122,43,255,0.20)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,10,2.6,0,0,7); g.fill();
  px(g,3,24,1,1,"#8a3aff"); px(g,28,18,1,1,"#fff");
  // coiled tail mound + rift rings
  px(g,2+sw0,28,25,8,dk); px(g,2+sw0,28,25,2,lite);
  px(g,4+sw0,30,7,3,skin); px(g,18+sw0,30,7,3,skin);
  px(g,6+sw0,26,3,3,"#8a3aff"); px(g,6+sw0,26,3,1,"#fff");
  px(g,14+sw1,26,3,3,"#c9c2ff"); px(g,14+sw1,26,3,1,"#fff");
  px(g,22+sw0,26,3,3,"#8a3aff");
  // neck + head block
  px(g,18,14+hb,8,15,skin); px(g,18,14+hb,2,15,lite); px(g,24,14+hb,2,15,dk);
  const open=P.atk?6:2;
  px(g,16,9+hb,13,11+open,skin); px(g,16,9+hb,13,2,lite); px(g,16,18+hb,13,1,dk);
  px(g,17,16+hb,11,4+open,"#0a0414");
  for(let i=0;i<5;i++){ px(g,17+i*2,16+hb,1,2,"#fff"); px(g,17+i*2,19+hb+open,1,2,"#fff"); }
  px(g,20,19+hb,5,2+open,"#8a3aff"); px(g,21,19+hb,3,1+open,"#c9c2ff"); px(g,21,19+hb,1,1,"#fff");
  // eyes: red + catchlight, brow ridge
  g.fillStyle="#ff3b3b"; g.fillRect(18,12+hb,3,3); g.fillRect(24,12+hb,2,2);
  g.fillStyle="#fff"; g.fillRect(18,12+hb,1,1); g.fillRect(24,12+hb,1,1);
  g.fillStyle="#111"; g.fillRect(19,13+hb,1,2);
  px(g,17,11+hb,11,1,lite);
  // NEEDLE CROWN + glow tips
  px(g,14,4+hb,3,6,lite); px(g,14,4+hb,1,2,"#8a3aff"); px(g,14,4+hb,3,1,"#fff");
  px(g,25,4+hb,3,6,lite); px(g,26,4+hb,1,2,"#8a3aff"); px(g,25,4+hb,3,1,"#fff");
  px(g,19,2+hb,4,5,lite); px(g,20,2+hb,2,2,"#8a3aff"); px(g,20,2+hb,1,1,"#fff");
};
// NETHER ABBESS v5 REALISM (veil+gold trim, bell + swinging censer w/ glow, void icon, brow gem, ~95 rects)
D.nether_abbess = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#3a1a50", dk="#120820", lite="#6a3a8a";
  g.fillStyle="rgba(122,43,255,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,24,1,1,"#8a7bff"); px(g,28,18,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#000"); px(g,16+A.rx,35+A.rd,6,2,"#000");
  // habit: violet panels, void icon chest, gold hem
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,12,19,8,9,"#0e0616"); px(g,13,20,6,7,"#8a7bff"); px(g,14,21,4,5,"#c9c2ff"); px(g,15,22,2,2,"#fff");
  px(g,7,29,18,2,"#c9a227"); px(g,7,29,18,1,"#fff2b0");
  // LEFT arm + sanctus BELL (gold, dark band, clapper)
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,3+A.lax,24+A.la,6,6,"#c9a227"); px(g,3+A.lax,24+A.la,6,1,"#fff2b0");
  px(g,4+A.lax,26+A.la,4,3,skin); px(g,5+A.lax,29+A.la,2,2,"#8a7bff");
  // RIGHT arm + swinging CENSER (chain, glowing core)
  const sw=window.Anim.seg(P,1,1);
  px(g,25+A.rax,17+A.ra,2,7,"#c9a227"); px(g,25+A.rax,17+A.ra,1,7,"#fff2b0");
  g.fillStyle="rgba(138,123,255,0.25)"; g.beginPath(); g.arc(25+A.rax+sw,26+A.ra,5,0,7); g.fill();
  px(g,23+A.rax+sw,23+A.ra,5,6,"#c9a227"); px(g,23+A.rax+sw,23+A.ra,5,1,"#fff2b0");
  px(g,24+A.rax+sw,24+A.ra,3,4,"#8a7bff"); px(g,25+A.rax+sw,25+A.ra,1,1,"#fff");
  // VEIL + face + brow gem
  px(g,6+A.hx,5+hb,20,6,"#0e0616"); px(g,6+A.hx,5+hb,20,1,"#3a2a5a");
  px(g,7+A.hx,8+hb,18,4,"#0e0616");
  px(g,10+A.hx,10+hb,12,8,"#d8c8d8"); px(g,10+A.hx,10+hb,12,1,"#fff"); px(g,10+A.hx,16+hb,12,2,"#b8a8b8");
  g.fillStyle="#111"; g.fillRect(12+A.hx,12+hb,3,2); g.fillRect(18+A.hx,12+hb,2,2);
  g.fillStyle="#c9c2ff"; g.fillRect(13+A.hx,12+hb,1,1); g.fillRect(18+A.hx,12+hb,1,1);
  px(g,15+A.hx,15+hb,2,1,skin);
  px(g,14+A.hx,0+hb,4,5,"#8a7bff"); px(g,14+A.hx,0+hb,4,1,"#fff"); px(g,15+A.hx,2+hb,2,2,"#c9c2ff");
};
// MIRROR ABBOT v5 REALISM (mirror breastplate w/ reflected eyes, twin shard blades, halo shards+glow, ~95 rects)
D.mirror_abbot = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#6a6a90", dk="#26263a", lite="#9aa0c0";
  g.fillStyle="rgba(200,210,255,0.20)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#d0d8ff"); px(g,28,18,1,1,"#fff");
  // halo glow + 3 shards
  g.fillStyle="rgba(200,210,255,0.25)"; g.beginPath(); g.ellipse(16,4+hb,11,5,0,0,7); g.fill();
  px(g,7+A.hx,1+hb,3,5,"#d0d8ff"); px(g,7+A.hx,1+hb,1,5,"#fff");
  px(g,14+A.hx,0+hb,4,6,"#fff"); px(g,14+A.hx,0+hb,1,6,"#d0d8ff"); px(g,15+A.hx,1+hb,2,2,"#8a9ab8");
  px(g,22+A.hx,1+hb,3,5,"#d0d8ff"); px(g,24+A.hx,1+hb,1,5,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#101018"); px(g,16+A.rx,35+A.rd,6,2,"#101018");
  // robe + MIRROR BREASTPLATE with reflected eyes
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,10,19,12,10,"#d0d8ff"); px(g,10,19,12,1,"#fff"); px(g,10,27,12,2,"#8a9ab8");
  px(g,11,20,10,8,"#8a9ab8"); px(g,12,21,8,6,"#e8ecff"); px(g,13,22,2,2,"#fff");
  px(g,12,22,3,3,"#1a1622"); px(g,18,22,2,2,"#1a1622"); px(g,12,22,1,1,"#fff");
  px(g,7,29,18,2,"#c9a227"); px(g,7,29,18,1,"#fff2b0");
  // TWIN SHARD BLADES (rise on atk)
  const sw=P.atk?-5:0;
  px(g,3+A.lax,17+A.la+sw,3,11,"#8a86a8"); px(g,3+A.lax,17+A.la+sw,1,11,"#fff");
  px(g,2+A.lax,26+A.la+sw,5,4,"#d0d8ff"); px(g,2+A.lax,26+A.la+sw,5,1,"#fff"); px(g,3+A.lax,27+A.la+sw,1,1,"#8a9ab8");
  px(g,26+A.rax,17+A.ra+sw,3,11,"#8a86a8"); px(g,28+A.rax,17+A.ra+sw,1,11,"#fff");
  px(g,25+A.rax,26+A.ra+sw,5,4,"#d0d8ff"); px(g,25+A.rax,26+A.ra+sw,5,1,"#fff"); px(g,27+A.rax,27+A.ra+sw,1,1,"#8a9ab8");
  // mirrored mask face + red mouth
  px(g,10+A.hx,7+hb,12,10,"#d0d8ff"); px(g,10+A.hx,7+hb,12,1,"#fff"); px(g,10+A.hx,15+hb,12,2,"#8a9ab8");
  g.fillStyle="#1a1622"; g.fillRect(13+A.hx,10+hb,2,3); g.fillRect(18+A.hx,10+hb,2,3);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,10+hb,1,1); g.fillRect(18+A.hx,10+hb,1,1);
  px(g,14+A.hx,14+hb,4,2,"#7a0a20"); px(g,15+A.hx,14+hb,2,1,"#fff");
};
// EVENTIDE HORROR v5 REALISM (dusk gradient torso, sunset core, twin dusk blades, horned dusk crown, ~95 rects)
D.eventide_horror = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#0e0a18", dk="#000000", lite="#4a3a7a";
  g.fillStyle="rgba(200,107,74,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(90,58,138,0.14)"; g.beginPath(); g.ellipse(16,25+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,24,1,1,"#ff8a5a"); px(g,28,18,1,1,"#c9a0ff");
  px(g,8+A.lx,28+A.ld,5,8,dk); px(g,19+A.rx,28+A.rd,5,8,dk);
  px(g,8+A.lx,28+A.ld,5,1,lite);
  px(g,7+A.lx,35+A.ld,7,2,"#000"); px(g,18+A.rx,35+A.rd,7,2,"#000");
  // torso: dusk bands sunset->violet, core sun, rivets
  px(g,5,14,22,16,skin); px(g,5,14,22,2,"#c96b4a"); px(g,5,28,22,2,dk);
  px(g,5,18,22,3,"#5a3a8a"); px(g,5,22,22,3,lite); px(g,5,25,22,2,"#3a2a5a");
  px(g,11,19,10,8,"#000"); px(g,12,20,8,6,"#ff8a5a"); px(g,13,21,6,4,"#ffd93d"); px(g,15,22,2,2,"#fff");
  px(g,7,15,3,2,"#c9a227"); px(g,22,15,3,2,"#c9a227");
  // TWIN DUSK BLADES (rise on atk)
  const sw=P.atk?-5:0;
  px(g,1+A.lax,15+A.la+sw,4,10,"#3a2a5a"); px(g,1+A.lax,15+A.la+sw,1,10,"#8a7bbf");
  px(g,0+A.lax,23+A.la+sw,5,5,"#c96b4a"); px(g,0+A.lax,23+A.la+sw,5,1,"#ffd93d");
  px(g,27+A.rax,15+A.ra+sw,4,10,"#3a2a5a"); px(g,30+A.rax,15+A.ra+sw,1,10,"#8a7bbf");
  px(g,27+A.rax,23+A.ra+sw,5,5,"#c96b4a"); px(g,27+A.rax,23+A.ra+sw,5,1,"#ffd93d");
  px(g,1+A.lax,21+A.la+sw,5,7,skin); px(g,26+A.rax,21+A.ra+sw,5,7,skin);
  // face + DUSK CROWN HORNS
  px(g,9,4+hb,14,12,skin); px(g,9,4+hb,14,2,"#ff8a5a"); px(g,9,14+hb,14,2,dk);
  g.fillStyle="#c9a0ff"; g.fillRect(11,8+hb,3,3); g.fillRect(18,8+hb,2,3);
  g.fillStyle="#111"; g.fillRect(12,9+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(11,8+hb,1,1);
  px(g,12,13+hb,8,1,dk);
  px(g,7,0+hb,4,6,"#4a3a7a"); px(g,7,0+hb,4,1,"#8a7bbf"); px(g,7,0+hb,1,6,"#c9a0ff");
  px(g,21,0+hb,4,6,"#4a3a7a"); px(g,21,0+hb,4,1,"#8a7bbf"); px(g,24,0+hb,1,6,"#c9a0ff");
};
// HOLLOW CANTOR v5 REALISM (song ghost: hymn mouth, music rings, choir stole, mitre shards+glow, ~90 rects)
D.hollow_cantor = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), hb=window.Anim.hbob(P), fl=Math.sin((P.t||0)*4)*1|0;
  const skin="#33224e", lite="#5a4a8a", pale="#8a7abf";
  g.fillStyle="rgba(150,130,220,0.20)"; g.beginPath(); g.ellipse(16,20+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,37,9,2.4,0,0,7); g.fill();
  px(g,3,20,1,1,"#c9c2ff"); px(g,28,26,1,1,"#fff");
  // tattered ghost hem drifting
  px(g,8,23+fl,4,8,skin); px(g,13,25-fl,3,6,skin); px(g,18,25+fl,3,6,skin); px(g,23,23-fl,4,8,skin);
  px(g,8,23+fl,4,1,lite); px(g,23,23-fl,4,1,lite);
  // torso: choir robe + split stole (ivory + void)
  px(g,7,11+hb,18,14,skin); px(g,7,11+hb,18,2,lite); px(g,7,23+hb,18,2,"#1a0a2e");
  px(g,10,13+hb,4,10,"#e8e0d0"); px(g,10,13+hb,4,1,"#fff"); px(g,10,13+hb,1,10,"#b8ac9c");
  px(g,18,13+hb,4,10,"#1a0a2e"); px(g,18,13+hb,4,1,"#3a2a5a");
  px(g,14,15+hb,4,4,"#c9a227"); px(g,15,16+hb,2,2,"#8a7bff");
  // arms raised conducting (sway on song)
  px(g,3,14+hb-fl,4,7,skin); px(g,3,14+hb-fl,1,7,lite); px(g,2,20+hb-fl,5,2,"#e8e0d0");
  px(g,25,14+hb+fl,4,7,skin); px(g,28,14+hb+fl,1,7,lite); px(g,25,20+hb+fl,5,2,"#e8e0d0");
  // face: pale hymn mask, glowing eyes
  px(g,10,6+hb,12,9,"#1a0a2e"); px(g,10,6+hb,12,1,lite);
  g.fillStyle="#fff"; g.fillRect(12,8+hb,3,3); g.fillRect(18,8+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13,9+hb,1,2); g.fillRect(18,9+hb,1,2);
  // HYMN MAW (gapes on atk)
  const open=P.atk?5:2;
  px(g,12,12+hb,8,4+open,"#0a0414"); px(g,13,13+hb,6,2+open,"#7a2bff"); px(g,14,14+hb,4,1+open,"#c9c2ff");
  px(g,13,12+hb,2,1,"#fff"); px(g,17,12+hb,2,1,"#fff");
  // music rings + motes
  px(g,3,5+hb,3,3,"#c9c2ff"); px(g,3,5+hb,1,1,"#fff"); px(g,26,7+hb,3,3,"#c9c2ff"); px(g,27,8+hb,1,1,"#fff");
  px(g,5,10+hb+fl,2,2,"#fff"); px(g,25,12+hb-fl,1,1,"#fff");
  // mitre shards
  px(g,7,0+hb,4,6,lite); px(g,7,0+hb,4,1,pale); px(g,21,0+hb,4,6,lite); px(g,21,0+hb,4,1,pale);
};

// ============ FLESH/BLOOD WARLORDS ============
// GORE PATRIARCH v5 REALISM (blood plate+rivets, meat-cleaver w/ blood edge, trophy skulls, horned helm, ~95 rects)
D.gore_patriarch = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#5a0812", dk="#1c0206", lite="#a02a3a";
  g.fillStyle="rgba(255,42,74,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff2a4a"); px(g,28,18,1,1,"#fff");
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,8+A.lx,35+A.ld,7,2,"#0a0102"); px(g,17+A.rx,35+A.rd,7,2,"#0a0102");
  // torso: blood plate, dark core seam, rivets, gold clasp
  px(g,6,16,20,14,skin); px(g,6,16,20,2,lite); px(g,6,28,20,2,dk);
  px(g,6,16,2,14,dk); px(g,24,16,2,14,dk);
  px(g,10,20,12,7,"#2a0408"); px(g,11,21,10,2,"#ff2a4a"); px(g,11,23,10,2,"#7a0a1a"); px(g,12,21,2,1,"#fff");
  px(g,8,17,3,2,"#c9a227"); px(g,21,17,3,2,"#c9a227");
  for(let i=0;i<3;i++){ px(g,9,18+i*4,2,1,lite); px(g,21,19+i*4,2,1,dk); }
  // trophy skulls on belt + belt
  px(g,8,28,16,3,"#3a0a0e"); px(g,8,28,16,1,"#c9a227");
  px(g,9,28,3,3,"#e8e0d0"); px(g,9,28,3,1,"#fff"); g.fillStyle="#111"; g.fillRect(10,29,1,1);
  px(g,22,28,3,3,"#e8e0d0"); px(g,22,28,3,1,"#fff"); g.fillStyle="#111"; g.fillRect(23,29,1,1);
  px(g,14,28,4,3,"#c9a227"); px(g,15,29,2,1,"#7a0a1a");
  // left arm + bracer + fist
  px(g,3+A.lax,18+A.la,5,9,skin); px(g,3+A.lax,18+A.la,1,9,lite);
  px(g,3+A.lax,25+A.la,5,3,dk); px(g,3+A.lax,25+A.la,5,1,"#ff2a4a");
  px(g,3+A.lax,28+A.la,5,2,dk);
  // right arm + MEAT-CLEAVER (chops on atk)
  const sw=P.atk?-6:0;
  px(g,24+A.rax,17+A.ra+sw,4,8,skin);
  px(g,24+A.rax,15+A.ra+sw,3,9,"#5a3a2a"); px(g,24+A.rax,15+A.ra+sw,1,9,"#a97648");
  px(g,21+A.rax,21+A.ra+sw,9,7,"#c9ccd4"); px(g,21+A.rax,21+A.ra+sw,9,1,"#fff"); px(g,21+A.rax,27+A.ra+sw,9,1,"#5a5a66");
  px(g,21+A.rax,21+A.ra+sw,9,1,"#ff2a4a"); px(g,22+A.rax,22+A.ra+sw,2,2,"#fff");
  // head: horned helm + glowing eyes + fanged maw
  px(g,10+A.hx,6+hb,12,11,skin); px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,dk);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,10+hb,3,3); g.fillRect(18+A.hx,10+hb,2,3);
  g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillRect(18+A.hx,11+hb,1,2);
  g.fillStyle="#ff2a4a"; g.fillRect(12+A.hx,10+hb,1,1);
  px(g,13+A.hx,14+hb,6,2,"#2a0408"); px(g,14+A.hx,14+hb,1,2,"#ff2a4a"); px(g,17+A.hx,14+hb,1,2,"#ff2a4a");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,7+hb); g.lineTo(7+A.hx,1+hb); g.lineTo(12+A.hx,6+hb); g.fill();
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(21+A.hx,7+hb); g.lineTo(25+A.hx,1+hb); g.lineTo(20+A.hx,6+hb); g.fill();
  px(g,7+A.hx,1+hb,2,2,"#ff2a4a"); px(g,23+A.hx,1+hb,2,2,"#ff2a4a");
};
// MAW PRIMOGENITOR v5 REALISM (giant maw: teeth rings, inner tongues, horn crown+eyes, coiled mass, ~90 rects)
D.maw_primogenitor = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
  const skin="#7a1020", dk="#28060c", lite="#c94a5a";
  const sq=P.hurt?2:0, open=P.atk?4:0;
  // stride rock: the whole coiled mass sways side to side while travelling
  // (rest keeps the old wall-clock bob via hb).
  const sw=P.moving?([0,2,0,-2][P.f&3]):0;
  g.fillStyle="rgba(255,42,74,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,34+sq,13,4,0,0,7); g.fill();
  g.save(); g.translate(sw,0);
  px(g,3,24,1,1,"#ff5a7a"); px(g,28,20,1,1,"#fff");
  // coiled base mass
  g.fillStyle=dk; g.beginPath(); g.ellipse(16,26+sq,14,10,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.ellipse(16,24+sq,13,9,0,0,7); g.fill();
  g.fillStyle=lite; g.beginPath(); g.ellipse(11,19+sq,5,3,-0.4,0,7); g.fill();
  px(g,6,28+sq,4,2,dk); px(g,22,28+sq,4,2,dk);
  // gullet + teeth rings + tongues
  px(g,6,19+sq,20,9+open,"#1a0206");
  px(g,6,19+sq,20,1,"#c94a5a"); px(g,6,27+sq+open,20,1,"#7a1020");
  for(let i=0;i<6;i++){ px(g,7+i*3,19+sq,2,3,"#fff"); px(g,7+i*3,19+sq,2,1,"#ffd0d0"); px(g,7+i*3,25+sq+open,2,3,"#fff"); px(g,7+i*3,27+sq+open,2,1,"#c94a5a"); }
  px(g,12,22+sq,3,5+open,"#ff5a7a"); px(g,12,22+sq,1,2,"#fff");
  px(g,17,22+sq,3,4+open,"#ff8aaa"); px(g,18,22+sq,1,2,"#fff");
  // stalk eyes + horn crown
  g.fillStyle="#ffe14d"; g.fillRect(7,11+sq,3,3); g.fillRect(22,11+sq,3,3);
  g.fillStyle="#111"; g.fillRect(8,12+sq,1,2); g.fillRect(23,12+sq,1,2);
  g.fillStyle="#fff"; g.fillRect(7,11+sq,1,1); g.fillRect(22,11+sq,1,1);
  px(g,6,14+sq,5,2,dk); px(g,21,14+sq,5,2,dk);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(10,10+sq); g.lineTo(6,3+sq); g.lineTo(11,9+sq); g.fill();
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(22,10+sq); g.lineTo(26,3+sq); g.lineTo(21,9+sq); g.fill();
  px(g,6,3+sq,2,2,"#ff2a4a"); px(g,24,3+sq,2,2,"#ff2a4a");
  g.restore();
};
// FLESH SCULPTOR v5 REALISM (stained apron, needle staff + hook hand, goggles+band, bone nubs, ~95 rects)
D.flesh_sculptor = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#a05a6a", dk="#3c1a22", lite="#d08a9a";
  g.fillStyle="rgba(255,90,122,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff8aaa"); px(g,28,18,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#140a0e"); px(g,16+A.rx,35+A.rd,6,2,"#140a0e");
  // torso + stained apron + thread lines
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,10,19,12,10,"#5a3a34"); px(g,10,19,12,1,"#e8d9b8"); px(g,10,27,12,2,"#3a2428");
  px(g,12,20,2,7,"#c92a4a"); px(g,15,20,2,7,"#c9a227"); px(g,18,20,2,7,"#c92a4a");
  px(g,12,20,2,1,"#ff8aaa"); px(g,15,20,2,1,"#fff2b0");
  // LEFT arm + HOOK HAND (steel hook, blood groove)
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,3+A.lax,24+A.la,4,4,"#c9ccd4"); px(g,3+A.lax,24+A.la,4,1,"#fff");
  px(g,4+A.lax,27+A.la,1,3,"#c9ccd4"); px(g,5+A.lax,27+A.la,1,2,"#c92a4a");
  // RIGHT arm + NEEDLE STAFF (raises on stitch, glowing eye)
  const up=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+up,3,7,skin);
  px(g,25+A.rax,11+A.ra+up,2,16,"#8a6a4a"); px(g,25+A.rax,11+A.ra+up,1,16,"#c9a67a");
  px(g,24+A.rax,6+A.ra+up,4,6,"#c9ccd4"); px(g,24+A.rax,6+A.ra+up,4,1,"#fff");
  px(g,25+A.rax,8+A.ra+up,2,3,"#ff5a7a"); px(g,25+A.rax,8+A.ra+up,1,1,"#fff");
  // face + GOGGLES band + stitched mouth
  px(g,10+A.hx,7+hb,12,10,skin); px(g,10+A.hx,7+hb,12,1,lite); px(g,10+A.hx,15+hb,12,2,dk);
  px(g,10+A.hx,8+hb,12,4,dk); px(g,10+A.hx,8+hb,12,1,"#5a3a44");
  g.fillStyle="#7dffd4"; g.fillRect(12+A.hx,9+hb,3,3); g.fillRect(18+A.hx,9+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,10+hb,1,2); g.fillRect(18+A.hx,10+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,9+hb,1,1);
  px(g,13+A.hx,14+hb,6,2,dk); px(g,14+A.hx,14+hb,1,2,"#fff"); px(g,17+A.hx,14+hb,1,2,"#fff");
  px(g,10+A.hx,3+hb,3,4,"#8a6a4a"); px(g,10+A.hx,3+hb,1,4,"#c9a67a"); px(g,19+A.hx,3+hb,3,4,"#8a6a4a");
};
// ORGAN CHOIRMASTER v5 REALISM (ghost conductor: baton wave, organ-pipe collar, open song mouth, ~90 rects)
D.organ_choirmaster = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), hb=window.Anim.hbob(P), fl=Math.sin((P.t||0)*5)*1|0;
  const skin="#8a4a5a", lite="#c98a9a", pale="#e8b8c0";
  g.fillStyle="rgba(200,120,140,0.20)"; g.beginPath(); g.ellipse(16,20+hb,12,13,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,37,9,2.4,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff8aaa"); px(g,28,18,1,1,"#fff");
  // tattered tails
  px(g,8,24+fl,4,7,skin); px(g,8,24+fl,1,7,lite); px(g,13,26-fl,3,5,skin); px(g,18,26+fl,3,5,skin); px(g,23,24-fl,4,7,skin);
  // ORGAN-PIPE COLLAR (5 pipes, gold/silver alternating, dark gaps)
  for(let i=0;i<5;i++){ const cc=i%2?"#c9a227":"#8a8a9a"; px(g,6+i*4,12+hb,3,7,cc); px(g,6+i*4,12+hb,3,1,"#fff"); px(g,6+i*4,18+hb,3,1,"#3a2a30"); }
  // torso + song heart
  px(g,7,19+hb,18,10,skin); px(g,7,19+hb,18,2,lite); px(g,7,27+hb,18,2,"#3a1a24");
  px(g,13,22+hb,6,5,"#3a1a24"); px(g,14,23+hb,4,3,"#ff5a7a"); px(g,15,24+hb,2,1,"#fff");
  // arms: left holds score, right WAVES BATON (lifts on atk)
  const wv=P.atk?3:0;
  px(g,3,20+hb,4,6,skin); px(g,2,25+hb,5,4,"#e8e0d0"); px(g,3,26+hb,3,2,"#3a1a24");
  px(g,23,18+hb+wv,4,6,skin); px(g,22,16+hb+wv,7,2,"#e8e0d0"); px(g,26,13+hb+wv,2,4,"#ffd93d"); px(g,26,13+hb+wv,1,1,"#fff");
  // face: pale choir mask, open song mouth
  px(g,10,6+hb,12,8,"#2a0a12"); px(g,10,6+hb,12,1,pale);
  g.fillStyle="#fff"; g.fillRect(12,8+hb,3,3); g.fillRect(18,8+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13,9+hb,1,2);
  px(g,13,12+hb,6,4,"#2a0a12"); px(g,14,13+hb,4,2,"#ff5a7a"); px(g,15,13+hb,2,1,"#fff");
  px(g,4,5+hb,2,2,"#ff5a7a"); px(g,26,6+hb,2,2,"#ff8aaa"); px(g,5,6+hb,1,1,"#fff");
};
// BILE CARDINAL v5 REALISM (wide galero hat + tassels + cord, vial staff w/ drip, bile icon, ~95 rects)
D.bile_cardinal = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#5a6a1a", dk="#1e2406", lite="#8aa02a";
  g.fillStyle="rgba(125,255,155,0.14)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#7dff9b"); px(g,28,18,1,1,"#fff");
  // GALERO HAT: wide brim, low dome, cord + tassels
  px(g,3+A.hx,3+hb,26,4,"#3a4a0a"); px(g,3+A.hx,3+hb,26,1,"#5a6a1a"); px(g,3+A.hx,6+hb,26,1,"#1e2406");
  px(g,9+A.hx,0+hb,14,4,"#3a4a0a"); px(g,9+A.hx,0+hb,14,1,"#7a8a3a");
  px(g,10+A.hx,3+hb,12,1,"#c9a227");
  px(g,3+A.hx,6+hb,2,4,"#7dff9b"); px(g,3+A.hx,6+hb,1,1,"#fff"); px(g,27+A.hx,6+hb,2,4,"#7dff9b"); px(g,28+A.hx,6+hb,1,1,"#fff");
  px(g,5+A.hx,7+hb,2,1,"#c9a227"); px(g,25+A.hx,7+hb,2,1,"#c9a227");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#0c0e02"); px(g,16+A.rx,35+A.rd,6,2,"#0c0e02");
  // cassock + bile icon + gold hem
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,12,19,8,9,"#2a3606"); px(g,13,20,6,7,"#7dff9b"); px(g,14,21,4,5,"#c9e86a"); px(g,15,22,2,2,"#fff");
  px(g,7,29,18,2,"#c9a227"); px(g,7,29,18,1,"#fff2b0");
  // left arm + blessing hand
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,4+A.lax,26+A.la,3,2,skin);
  // right arm + VIAL STAFF (raises on bless, drips on atk)
  const up=P.atk?-4:0;
  px(g,25+A.rax,18+A.ra+up,3,7,skin);
  px(g,25+A.rax,12+A.ra+up,2,12,"#5a4a3a"); px(g,25+A.rax,12+A.ra+up,1,12,"#8a7a5a");
  px(g,23+A.rax,6+A.ra+up,6,8,"#c9e86a"); px(g,23+A.rax,6+A.ra+up,6,1,"#fff");
  px(g,24+A.rax,7+A.ra+up,4,6,"#7dff9b"); px(g,25+A.rax,8+A.ra+up,2,4,"#fff");
  px(g,23+A.rax,12+A.ra+up,6,2,"#3a4a0a");
  if(P.atk){ px(g,24+A.rax,14+A.ra,1,4,"#7dff9b"); px(g,24+A.rax,18+A.ra,2,2,"#7dff9b"); }
  // face: sallow mask, dark eyes, thin mouth
  px(g,10+A.hx,9+hb,12,9,"#c9b088"); px(g,10+A.hx,9+hb,12,1,"#e8d0a0"); px(g,10+A.hx,16+hb,12,2,"#a08868");
  g.fillStyle="#1a2a0a"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,11+hb,1,1); g.fillRect(18+A.hx,11+hb,1,1);
  px(g,14+A.hx,15+hb,4,1,skin);
};
// SINEW DESPOT v5 REALISM (beast tyrant: spiked harness+gold girth, whip tail+barb, crown spikes, drooling maw, ~90 rects)
D.sinew_despot = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P), hb=window.Anim.hbob(P);
  const skin="#93302e", dk="#380e0e", lite="#c96a5a";
  g.fillStyle="rgba(255,80,60,0.15)"; g.beginPath(); g.ellipse(16,24+hb,13,12,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,10,2.4,0,0,7); g.fill();
  px(g,3,26,1,1,"#ff8a6a"); px(g,28,22,1,1,"#fff");
  // WHIP TAIL + barb (lashes)
  const sw=window.Anim.seg(P,1,1);
  px(g,1+sw,18,3,9,dk); px(g,1+sw,18,1,9,lite); px(g,0+sw,26,5,3,"#c9ccd4"); px(g,0+sw,26,5,1,"#fff");
  // barrel + harness spikes + gold girth + belly shading
  px(g,4,22,21,9,skin); px(g,4,22,21,2,lite); px(g,4,29,21,2,dk);
  px(g,7,20,3,3,"#c9ccd4"); px(g,7,20,3,1,"#fff"); px(g,12,20,3,3,"#c9ccd4"); px(g,17,20,3,3,"#c9ccd4"); px(g,17,20,3,1,"#fff");
  px(g,7,25,17,3,"#ffd93d"); px(g,7,25,17,1,"#fff2b0"); px(g,7,27,17,1,"#8a6a1a");
  px(g,6,26,3,3,dk); px(g,22,26,3,3,dk);
  // legs (quadruped)
  px(g,7+Q.x1,30+Q.d1,3,6,dk); px(g,12+Q.x2,30+Q.d2,3,6,dk); px(g,17+Q.x1,30+Q.d1,3,6,dk); px(g,21+Q.x2,30+Q.d2,3,6,dk);
  px(g,7+Q.x1,35+Q.d1,4,2,"#140404"); px(g,20+Q.x2,35+Q.d2,4,2,"#140404");
  // head + CROWN SPIKES + glowing eye + drooling maw
  px(g,20,13+hb,10,12,skin); px(g,20,13+hb,10,2,lite); px(g,20,23+hb,10,2,dk);
  for(let i=0;i<3;i++){ const cx=22+i*3; px(g,cx,8+hb,2,6,"#ffd93d"); px(g,cx,8+hb,2,1,"#fff2b0"); px(g,cx,12+hb,2,1,"#8a6a1a"); }
  g.fillStyle="#fff06a"; g.fillRect(22,17+hb,3,3);
  g.fillStyle="#111"; g.fillRect(23,18+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(22,17+hb,1,1);
  px(g,24,21+hb,6,4,"#380e0e"); px(g,25,22+hb,1,2,"#fff"); px(g,28,22+hb,1,2,"#fff");
  px(g,26,25+hb+(P.atk?1:0),1,2,"#ff5a7a");
};
// SKIN POPE v5 REALISM (triple-tier mitre+gold bands, skin lantern staff w/ halo, white cope+stole, ~95 rects)
D.skin_pope = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#c09a8a", dk="#4a3430", lite="#e8c9b8";
  g.fillStyle="rgba(255,179,90,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ffb35a"); px(g,28,18,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#1c1210"); px(g,16+A.rx,35+A.rd,6,2,"#1c1210");
  // white cope + skin stole + blood clasp + gold hem
  px(g,7,17,18,14,"#e8d9c9"); px(g,7,17,18,2,"#fff"); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,11,19,10,10,skin); px(g,11,19,10,1,lite);
  px(g,13,21,6,6,"#7a1a1a"); px(g,14,22,4,4,"#ff8a8a"); px(g,15,23,2,2,"#fff");
  px(g,7,29,18,2,"#c9a227"); px(g,7,29,18,1,"#fff2b0");
  // left arm + blessing hand
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,4+A.lax,26+A.la,3,2,skin);
  // right arm + SKIN LANTERN (halo glow, raises on rite)
  const up=P.atk?-4:0;
  g.fillStyle="rgba(255,179,90,0.25)"; g.beginPath(); g.arc(26+A.rax,9+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#8a6a4a"); px(g,25+A.rax,12+A.ra+up,1,16,"#c9a67a");
  px(g,22+A.rax,5+A.ra+up,8,8,"#e8d9c9"); px(g,22+A.rax,5+A.ra+up,8,1,"#fff");
  px(g,23+A.rax,6+A.ra+up,6,6,"#ffb35a"); px(g,24+A.rax,7+A.ra+up,4,3,"#fff"); px(g,25+A.rax,8+A.ra+up,2,2,"#ff8a5a");
  px(g,22+A.rax,11+A.ra+up,8,2,"#c9a227");
  // TRIPLE-TIER MITRE + face
  px(g,10+A.hx,5+hb,12,4,"#fff"); px(g,10+A.hx,5+hb,12,1,"#e8d9c9"); px(g,10+A.hx,8+hb,12,1,"#c9a227");
  px(g,11+A.hx,1+hb,10,5,"#e8d9c9"); px(g,11+A.hx,1+hb,10,1,"#fff"); px(g,11+A.hx,5+hb,10,1,"#c9a227");
  px(g,12+A.hx,-2+hb+3,8,4,"#fff"); px(g,12+A.hx,1+hb,8,1,"#e8d9c9");
  px(g,10+A.hx,9+hb,12,9,lite); px(g,10+A.hx,9+hb,12,1,"#fff"); px(g,10+A.hx,16+hb,12,2,skin);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,3,2); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,1);
  px(g,14+A.hx,15+hb,4,1,"#7a1a1a");
};
// GUT EMPRESS v5 REALISM (serpent queen: coiled jeweled base, crown w/ red gems, war fan, ~90 rects)
D.gut_empress = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin="#6a1a2a", dk="#26060e", lite="#a04a5a";
  g.fillStyle="rgba(255,42,74,0.15)"; g.beginPath(); g.ellipse(16,23+hb,13,13,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,10,2.4,0,0,7); g.fill();
  px(g,3,28,1,1,"#ffd93d"); px(g,28,22,1,1,"#fff");
  // coiled base + jewel nodes
  px(g,2+sw0,28,26,8,dk); px(g,2+sw0,28,26,2,skin);
  px(g,5+sw0,30,8,3,skin); px(g,18+sw1,30,8,3,skin);
  px(g,7+sw0,26,4,3,"#7a8a2a"); px(g,7+sw0,26,4,1,"#c9e86a"); px(g,8+sw0,27,1,1,"#fff");
  px(g,14+sw1,26,4,3,"#ffd93d"); px(g,14+sw1,26,4,1,"#fff2b0");
  px(g,21+sw0,26,4,3,"#7a8a2a"); px(g,21+sw0,26,4,1,"#c9e86a");
  // neck + torso + gold collar
  px(g,18,14+hb,8,15,skin); px(g,18,14+hb,2,15,lite); px(g,24,14+hb,2,15,dk);
  px(g,16,9+hb,13,9,skin); px(g,16,9+hb,13,2,lite); px(g,16,16+hb,13,2,dk);
  g.fillStyle="#fff"; g.fillRect(18,12+hb,3,3); g.fillRect(24,12+hb,2,2);
  g.fillStyle="#111"; g.fillRect(19,13+hb,1,2);
  px(g,19,16+hb,7,2,dk); px(g,20,16+hb,1,2,"#fff"); px(g,24,16+hb,1,2,"#fff");
  // CROWN (4 spikes, red gems, gold band)
  for(let i=0;i<4;i++){ const cx=15+i*4; px(g,cx,3+hb,3,7,"#ffd93d"); px(g,cx,3+hb,3,1,"#fff2b0"); px(g,cx+1,4+hb,1,3,"#ff2a4a"); px(g,cx+1,4+hb,1,1,"#fff"); }
  px(g,15,8+hb,14,1,"#8a6a1a");
  // WAR FAN (fans on atk)
  const fw=P.atk?2:-2;
  g.fillStyle="#a04a5a"; g.beginPath(); g.moveTo(26,22+hb); g.lineTo(32,14+hb+fw); g.lineTo(31,23+hb); g.fill();
  g.fillStyle="#c96a7a"; g.beginPath(); g.moveTo(27,22+hb); g.lineTo(31,16+hb+fw); g.lineTo(30,22+hb); g.fill();
  px(g,26,21+hb,5,2,dk); px(g,26,21+hb,1,1,"#fff");
};
// DREAD MASTICATOR v5 REALISM (jaw construct: twin grinder plates, grinder teeth, throat glow, crest+eyes, ~90 rects)
D.dread_masticator = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#4a0e18", dk="#120309", lite="#8a2a3a";
  g.fillStyle="rgba(255,42,74,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff2a4a"); px(g,28,18,1,1,"#fff");
  px(g,8+A.lx,28+A.ld,5,8,dk); px(g,19+A.rx,28+A.rd,5,8,dk);
  px(g,7+A.lx,35+A.ld,7,2,"#000"); px(g,18+A.rx,35+A.rd,7,2,"#000");
  // torso plates
  px(g,5,14,22,16,skin); px(g,5,14,22,2,lite); px(g,5,28,22,2,dk);
  px(g,5,14,2,16,dk); px(g,25,14,2,16,dk);
  // JAW GRINDERS (chomp on atk)
  const ch=P.atk?3:0;
  px(g,9,18,14,5,"#0a0204"); px(g,9,18,14,1,"#8a2a3a");
  for(let i=0;i<6;i++){ px(g,9+i*2,19,1,3,"#e8e0d0"); px(g,9+i*2,19,1,1,"#fff"); }
  px(g,12,21,8,2+ch,"#ff2a4a"); px(g,13,21,6,1,"#ff8a8a");
  px(g,9,23+ch,14,5,"#0a0204"); px(g,9,23+ch,14,1,"#8a2a3a");
  for(let i=0;i<6;i++){ px(g,9+i*2,23+ch,1,3,"#e8e0d0"); }
  // arms
  const sm=P.atk?-4:0;
  px(g,0+A.lax,16+A.la+sm,6,9,skin); px(g,0+A.lax,16+A.la+sm,1,9,lite); px(g,0+A.lax,23+A.la+sm,6,3,dk);
  px(g,26+A.rax,16+A.ra+sm,6,9,skin); px(g,31+A.rax,16+A.ra+sm,1,9,lite); px(g,26+A.rax,23+A.ra+sm,6,3,dk);
  // head + CREST + eyes
  px(g,9,3+hb,14,12,skin); px(g,9,3+hb,14,2,lite); px(g,9,13+hb,14,2,dk);
  g.fillStyle="#ffd93d"; g.fillRect(11,7+hb,3,3); g.fillRect(18,7+hb,3,3);
  g.fillStyle="#111"; g.fillRect(12,8+hb,1,2); g.fillRect(19,8+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(11,7+hb,1,1); g.fillRect(18,7+hb,1,1);
  px(g,7,0+hb,4,5,lite); px(g,7,0+hb,4,1,"#ff8a8a"); px(g,21,0+hb,4,5,lite); px(g,21,0+hb,4,1,"#ff8a8a");
};
// BLOOD EVANGEL v5 REALISM (red book + chalice + raised tome, droplet halo, pale face, ~95 rects)
D.blood_evangel = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#a01228", dk="#38060e", lite="#d03a4a";
  g.fillStyle="rgba(255,42,74,0.20)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  // droplet HALO + falling drops
  g.fillStyle="rgba(255,42,74,0.28)"; g.beginPath(); g.ellipse(16,4+hb,10,4,0,0,7); g.fill();
  px(g,6,2+hb,2,4,"#ff2a4a"); px(g,6,2+hb,1,1,"#fff"); px(g,12,0+hb,2,4,"#ff2a4a"); px(g,19,0+hb,2,4,"#ff2a4a"); px(g,25,2+hb,2,4,"#ff2a4a"); px(g,25,2+hb,1,1,"#fff");
  px(g,2,12+hb,1,3,"#ff2a4a"); px(g,29,14+hb,1,3,"#ff2a4a");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#12020a"); px(g,16+A.rx,35+A.rd,6,2,"#12020a");
  // cope + BOOK SIGIL (gold book, red seal)
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,11,19,10,9,"#5a040c"); px(g,12,20,8,7,"#ffd93d"); px(g,13,21,6,5,"#ff2a4a"); px(g,14,22,4,2,skin); px(g,15,22,2,1,"#fff");
  px(g,7,29,18,2,"#ffd93d"); px(g,7,29,18,1,"#fff2b0");
  // LEFT arm + CHALICE (gold, red wine, glint)
  px(g,4+A.lax,19+A.la,3,7,skin);
  px(g,3+A.lax,24+A.la,5,6,"#ffd93d"); px(g,3+A.lax,24+A.la,5,1,"#fff2b0");
  px(g,4+A.lax,25+A.la,3,4,"#ff2a4a"); px(g,4+A.lax,25+A.la,1,1,"#fff");
  px(g,4+A.lax,29+A.la,3,1,"#8a6a1a");
  // RIGHT arm + RAISED TOME (lifts on sermon)
  const up=P.atk?-5:0;
  px(g,25+A.rax,20+A.ra+up,3,7,skin);
  px(g,23+A.rax,15+A.ra+up,6,8,"#e8d9b8"); px(g,23+A.rax,15+A.ra+up,6,1,"#fff"); px(g,23+A.rax,21+A.ra+up,6,2,"#5a040c");
  px(g,24+A.rax,17+A.ra+up,4,4,"#a01228"); px(g,25+A.rax,18+A.ra+up,2,2,"#ff2a4a");
  // face: pale, dark eyes, blood lips
  px(g,10+A.hx,7+hb,12,10,"#e8c9b8"); px(g,10+A.hx,7+hb,12,1,"#fff"); px(g,10+A.hx,15+hb,12,2,"#b898a8");
  g.fillStyle="#111"; g.fillRect(12+A.hx,10+hb,3,3); g.fillRect(18+A.hx,10+hb,2,2);
  g.fillStyle="#ff2a4a"; g.fillRect(13+A.hx,11+hb,1,1);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,10+hb,1,1);
  px(g,13+A.hx,14+hb,6,2,"#5a040c"); px(g,14+A.hx,14+hb,4,1,"#ff2a4a");
  px(g,9+A.hx,3+hb,14,4,"#5a040c"); px(g,9+A.hx,3+hb,14,1,"#7a1020");
};

// ============ MARROW SOVEREIGN (marrow_ossuary warlord) ============
// Bone-white sovereign: ribcage cuirass with marrow-glow heart, skull helm
// under a four-horn crown, grave-shroud cape, ossuary scepter (raises on
// atk). Skulls drift in its wake.
D.marrow_sovereign = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const bone="#e8e0cc", dk="#6a6252", lite="#fff8e8", shroud="#8a8478", glow="#ffd93d";
  g.fillStyle="rgba(232,224,204,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  // drifting skull motes
  px(g,2,14+hb,2,2,bone); px(g,3,14+hb,1,1,dk); px(g,29,10+hb,2,2,bone); px(g,29,10+hb,1,1,"#7a2bff");
  px(g,27,26,1,1,lite); px(g,4,26,1,1,glow);
  // grave-shroud cape
  px(g,4,15,4,17,shroud); px(g,24,15,4,17,shroud);
  px(g,4,15,1,17,lite); px(g,27,15,1,17,dk);
  px(g,4,30,4,2,dk); px(g,24,30,4,2,dk);
  // legs + bone sabatons
  px(g,10+A.lx,29+A.ld,5,7,dk); px(g,17+A.rx,29+A.rd,5,7,dk);
  px(g,9+A.lx,35+A.ld,7,2,bone); px(g,16+A.rx,35+A.rd,7,2,bone);
  // ribcage cuirass + marrow-glow heart
  px(g,8,16,16,14,bone); px(g,8,16,16,2,lite); px(g,8,28,16,2,dk);
  for(let i=0;i<3;i++){ px(g,9,19+i*4,14,2,dk); px(g,9,19+i*4,14,1,lite); }
  px(g,13,21,6,6,"#3a3428"); px(g,14,22,4,4,glow); px(g,15,23,2,2,"#fff");
  // pauldrons: stacked vertebrae
  px(g,2+A.lax,12+A.la,7,5,bone); px(g,2+A.lax,12+A.la,7,1,lite); px(g,3+A.lax,10+A.la,5,3,lite);
  px(g,23+A.rax,12+A.ra,7,5,bone); px(g,23+A.rax,12+A.ra,7,1,lite); px(g,24+A.rax,10+A.ra,5,3,lite);
  // LEFT arm + femur club
  px(g,3+A.lax,18+A.la,4,8,bone); px(g,3+A.lax,25+A.la,4,2,dk);
  px(g,2+A.lax,27+A.la,6,4,lite); px(g,2+A.lax,27+A.la,6,1,"#fff"); px(g,2+A.lax,30+A.la,6,1,dk);
  // RIGHT arm + OSSUARY SCEPTER (skull head, raises on atk)
  const up=P.atk?-6:0;
  px(g,25+A.rax,18+A.ra+up,4,8,bone); px(g,25+A.rax,24+A.ra+up,4,2,dk);
  px(g,24+A.rax,8+A.ra+up,6,11,lite); px(g,24+A.rax,8+A.ra+up,6,1,"#fff");
  px(g,25+A.rax,9+A.ra+up,4,5,bone); px(g,26+A.rax,10+A.ra+up,2,2,dk); px(g,28+A.rax,10+A.ra+up,1,2,dk);
  px(g,26+A.rax,12+A.ra+up,2,1,glow);
  // skull helm + FOUR-HORN crown
  px(g,10+A.hx,7+hb,12,10,lite); px(g,10+A.hx,7+hb,12,1,"#fff"); px(g,10+A.hx,15+hb,12,2,dk);
  g.fillStyle="#7a2bff"; g.fillRect(12+A.hx,10+hb,3,3); g.fillRect(17+A.hx,10+hb,3,3);
  g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillRect(18+A.hx,11+hb,1,2);
  px(g,14+A.hx,14+hb,4,2,dk); px(g,15+A.hx,14+hb,2,1,bone);
  px(g,8+A.hx,2+hb,4,6,bone); px(g,8+A.hx,2+hb,4,1,"#fff");
  px(g,20+A.hx,2+hb,4,6,bone); px(g,20+A.hx,2+hb,4,1,"#fff");
  px(g,12+A.hx,0+hb,3,4,dk); px(g,17+A.hx,0+hb,3,4,dk);
  px(g,12+A.hx,0+hb,3,1,lite); px(g,17+A.hx,0+hb,3,1,lite);
};

// ============ LEGACY HELL KINDS (distinct from generic fallback) ============
// HELL BEAST v5 REALISM (two-horned brute: spine ridge+embers, armored barrel, horned head, fanged maw, ~90 rects)
D.hell_beast = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P), hb=window.Anim.hbob(P);
  const skin="#8a1a1a", dk="#2e0606", lite="#c94a4a";
  const sw=window.Anim.seg(P,0,1);
  g.fillStyle="rgba(255,90,26,0.15)"; g.beginPath(); g.ellipse(16,24+hb,13,12,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,10,2.4,0,0,7); g.fill();
  px(g,3,26,1,1,"#ff5a1a"); px(g,28,22,1,1,"#fff");
  px(g,1+sw,21,4,4,dk); px(g,1+sw,21,1,4,lite); px(g,0+sw,19,3,3,dk); px(g,0+sw,19,3,1,"#ff5a1a");
  px(g,4,22,21,9,skin); px(g,4,22,21,2,lite); px(g,4,29,21,2,dk);
  for(let i=0;i<3;i++){ px(g,8+i*5,20,2,4,"#ff5a1a"); px(g,8+i*5,20,2,1,"#ffd93d"); px(g,8+i*5,23,2,1,"#7a1f1f"); }
  px(g,6,25,4,2,dk); px(g,22,25,4,2,dk);
  px(g,7+Q.x1,30+Q.d1,3,6,dk); px(g,12+Q.x2,30+Q.d2,3,6,dk); px(g,17+Q.x1,30+Q.d1,3,6,dk); px(g,21+Q.x2,30+Q.d2,3,6,dk);
  px(g,6+Q.x1,35+Q.d1,4,2,"#0c0202"); px(g,20+Q.x2,35+Q.d2,4,2,"#0c0202");
  px(g,20,13+hb,10,12,skin); px(g,20,13+hb,10,2,lite); px(g,20,23+hb,10,2,dk);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(22,14+hb); g.lineTo(17,7+hb); g.lineTo(23,12+hb); g.fill();
  g.beginPath(); g.moveTo(28,14+hb); g.lineTo(31,7+hb); g.lineTo(28,12+hb); g.fill();
  px(g,17,7+hb,2,2,"#ff5a1a"); px(g,30,7+hb,2,2,"#ff5a1a");
  g.fillStyle="#ffd93d"; g.fillRect(22,17+hb,3,3); g.fillStyle="#111"; g.fillRect(23,18+hb,1,2); g.fillStyle="#fff"; g.fillRect(22,17+hb,1,1);
  px(g,24,21+hb,6,4,dk); px(g,25,22+hb,1,2,"#fff"); px(g,28,22+hb,1,2,"#fff");
  px(g,26,25+hb+(P.atk?1:0),2,1,"#ff5a1a");
};
D.succubus = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#d42a3a", dk="#4a0a12", lite="#ff6a7a";
  g.fillStyle="rgba(255,42,106,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,37,9,2.4,0,0,7); g.fill();
  px(g,3,20,1,1,"#ff5a7a"); px(g,28,24,1,1,"#fff");
  const WA=window.Anim.flap(P);
  g.save(); g.translate(11,20); g.rotate(WA); g.translate(-11,-20);
  g.fillStyle="#7a0a1a"; g.beginPath(); g.moveTo(11,20); g.lineTo(0,4); g.lineTo(4,13); g.fill();
  g.fillStyle="#a01a2a"; g.beginPath(); g.moveTo(10,19); g.lineTo(3,9); g.lineTo(6,14); g.fill(); g.restore();
  g.save(); g.translate(21,20); g.rotate(-WA); g.translate(-21,-20);
  g.fillStyle="#7a0a1a"; g.beginPath(); g.moveTo(21,20); g.lineTo(32,4); g.lineTo(28,13); g.fill();
  g.fillStyle="#a01a2a"; g.beginPath(); g.moveTo(22,19); g.lineTo(29,9); g.lineTo(26,14); g.fill(); g.restore();
  px(g,0,4,2,2,"#ff2a6a"); px(g,30,4,2,2,"#ff2a6a");
  const sw=window.Anim.seg(P,0,1);
  px(g,24,24+sw,2,7,skin); px(g,24,24+sw,1,7,lite); px(g,23,30+sw,4,3,"#ff2a4a"); px(g,24,31+sw,2,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,"#8a1a24"); px(g,17+A.rx,29+A.rd,4,7,"#8a1a24");
  px(g,10+A.lx,35+A.ld,5,2,"#2a0408"); px(g,17+A.rx,35+A.rd,5,2,"#2a0408");
  px(g,9,18,14,13,skin); px(g,9,18,14,2,lite); px(g,9,29,14,2,dk);
  px(g,9,18,2,13,dk); px(g,21,18,2,13,dk);
  px(g,12,20,8,6,"#ff5a7a"); px(g,12,20,8,1,"#ffc0d0"); px(g,14,22,4,3,"#ffd93d"); px(g,15,23,2,1,"#fff");
  px(g,5+A.lax,19+A.la,3,7,skin); px(g,5+A.lax,19+A.la,1,7,lite);
  px(g,24+A.rax,19+A.ra-(P.atk?4:0),3,7,skin); px(g,24+A.rax,19+A.ra-(P.atk?4:0),1,7,lite);
  px(g,5+A.lax,25+A.la,3,2,"#ffd93d"); px(g,25+A.rax,25+A.ra-(P.atk?4:0),3,2,"#ffd93d");
  px(g,10+A.hx,6+hb,12,11,"#e8b098"); px(g,10+A.hx,6+hb,12,1,"#fff2e0"); px(g,10+A.hx,15+hb,12,2,"#c98878");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,7+hb); g.lineTo(7+A.hx,1+hb); g.lineTo(12+A.hx,6+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,7+hb); g.lineTo(25+A.hx,1+hb); g.lineTo(20+A.hx,6+hb); g.fill();
  px(g,7+A.hx,1+hb,2,2,"#ff2a6a"); px(g,23+A.hx,1+hb,2,2,"#ff2a6a");
  g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,10+hb,3,3); g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillStyle="#fff"; g.fillRect(12+A.hx,10+hb,1,1);
  g.fillStyle="#ffe14d"; g.fillRect(18+A.hx,10+hb,2,2); g.fillStyle="#111"; g.fillRect(19+A.hx,11+hb,1,2);
  px(g,14+A.hx,14+hb,4,2,"#7a0a1a"); px(g,15+A.hx,14+hb,2,1,"#fff");
};
D.doom_lord = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#3a0a0a", dk="#000000", lite="#6a2a2a";
  g.fillStyle="rgba(138,42,255,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#8a2aff"); px(g,28,18,1,1,"#fff");
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,8+A.lx,35+A.ld,7,2,"#000"); px(g,17+A.rx,35+A.rd,7,2,"#000");
  px(g,7,17,18,14,skin); px(g,7,17,18,2,lite); px(g,7,28,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,11,21,10,7,"#0a0202"); px(g,12,22,8,2,"#8a2aff"); px(g,12,24,8,2,"#3a1a6a"); px(g,13,22,2,1,"#fff");
  px(g,3+A.lax,19+A.la,5,8,skin); px(g,3+A.lax,19+A.la,1,8,lite);
  px(g,3+A.lax,25+A.la,5,3,dk);
  const sw=P.atk?-6:0;
  px(g,24+A.rax,19+A.ra+sw,4,8,skin);
  px(g,24+A.rax,12+A.ra+sw,3,15,"#8a8a9a"); px(g,24+A.rax,12+A.ra+sw,1,15,"#fff"); px(g,26+A.rax,14+A.ra+sw,1,11,"#3a3a4a");
  px(g,22+A.rax,10+A.ra+sw,7,3,"#c9ccd4"); px(g,22+A.rax,10+A.ra+sw,7,1,"#fff");
  px(g,9+A.hx,6+hb,14,11,skin); px(g,9+A.hx,6+hb,14,2,lite); px(g,9+A.hx,15+hb,14,2,dk);
  px(g,4+A.hx,7+hb,5,5,lite); px(g,4+A.hx,7+hb,5,1,"#fff"); px(g,4+A.hx,7+hb,1,5,"#8a2aff");
  px(g,23+A.hx,7+hb,5,5,lite); px(g,23+A.hx,7+hb,5,1,"#fff"); px(g,27+A.hx,7+hb,1,5,"#8a2aff");
  px(g,11+A.hx,2+hb,10,5,dk); px(g,12+A.hx,3+hb,8,1,"#8a2aff"); px(g,12+A.hx,4+hb,8,1,"#3a1a6a");
  g.fillStyle="#8affc9"; g.fillRect(12+A.hx,10+hb,3,2); g.fillRect(18+A.hx,10+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,10+hb,1,2); g.fillRect(18+A.hx,10+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,10+hb,1,1);
};
D.infernal = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#ff5a1a", dk="#4a1502", lite="#ff9d2e";
  g.fillStyle="rgba(255,120,30,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,37,9,2.4,0,0,7); g.fill();
  px(g,3,24,1,1,"#ffd93d"); px(g,28,20,1,1,"#fff");
  px(g,9+A.lx,28+A.ld,4,7,dk); px(g,19+A.rx,28+A.rd,4,7,dk);
  px(g,7,16,18,13,"#5a1e04"); px(g,9,18,14,9,skin); px(g,10,19,12,7,"#ff9d2e"); px(g,11,20,10,2,"#fff");
  px(g,7,16,18,2,lite); px(g,7,27,18,2,dk);
  const sm=P.atk?-4:0;
  px(g,2+A.lax,18+A.la+sm,5,8,dk); px(g,1+A.lax,24+A.la+sm,7,5,"#ff5a1a"); px(g,2+A.lax,25+A.la+sm,5,1,"#ffd93d"); px(g,2+A.lax,25+A.la+sm,2,1,"#fff");
  px(g,25+A.rax,18+A.ra+sm,5,8,dk); px(g,24+A.rax,24+A.ra+sm,7,5,"#ff5a1a"); px(g,25+A.rax,25+A.ra+sm,5,1,"#ffd93d");
  px(g,9,3+hb,4,6,"#ff5a1a"); px(g,9,3+hb,4,1,"#ffd93d"); px(g,19,3+hb,4,6,"#ff5a1a");
  px(g,13,0+hb,6,5,"#ffd93d"); px(g,13,0+hb,6,1,"#fff"); px(g,15,1+hb,2,3,"#fff");
  px(g,10,5+hb,12,12,skin); px(g,10,5+hb,12,2,"#ff9d2e"); px(g,10,14+hb,12,2,dk);
  g.fillStyle="#fff06a"; g.fillRect(12,9+hb,3,3); g.fillRect(18,9+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13,10+hb,1,2); g.fillRect(18,10+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12,9+hb,1,1);
  px(g,12,13+hb,8,3,dk); px(g,13,14+hb,6,1,"#ff5a1a");
};
D.hell_hound = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P), hb=window.Anim.hbob(P);
  const skin="#5a0a0a", dk="#1c0303", lite="#8a1e1e";
  const sw=window.Anim.seg(P,0,1);
  g.fillStyle="rgba(255,60,20,0.15)"; g.beginPath(); g.ellipse(16,24+hb,13,12,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,10,2.4,0,0,7); g.fill();
  px(g,2,24,1,1,"#ff5a1a"); px(g,29,20,1,1,"#fff");
  px(g,1+sw,21,4,3,dk); px(g,0+sw,19,3,3,dk); px(g,0+sw,19,3,1,"#ff5a1a");
  px(g,4,23,21,8,skin); px(g,4,23,21,2,lite); px(g,4,29,21,2,dk);
  for(let i=0;i<5;i++){ px(g,7+i*4,21,2,3,"#ff5a1a"); px(g,7+i*4,21,2,1,"#ffd93d"); }
  px(g,7+Q.x1,30+Q.d1,3,6,dk); px(g,12+Q.x2,30+Q.d2,3,6,dk); px(g,17+Q.x1,30+Q.d1,3,6,dk); px(g,21+Q.x2,30+Q.d2,3,6,dk);
  px(g,6+Q.x1,35+Q.d1,4,2,"#0c0101"); px(g,20+Q.x2,35+Q.d2,4,2,"#0c0101");
  px(g,20,13+hb,3,6,"#ff5a1a"); px(g,20,13+hb,3,1,"#ffd93d"); px(g,27,13+hb,3,6,"#ff5a1a"); px(g,27,13+hb,3,1,"#ffd93d");
  px(g,20,14+hb,11,12,skin); px(g,20,14+hb,11,2,lite); px(g,20,24+hb,11,2,dk);
  px(g,24,20+hb,7,5,dk);
  g.fillStyle="#ffd93d"; g.fillRect(22,17+hb,3,3); g.fillStyle="#111"; g.fillRect(23,18+hb,1,2); g.fillStyle="#fff"; g.fillRect(22,17+hb,1,1);
  px(g,24,21+hb,1,3,"#fff"); px(g,28,21+hb,1,3,"#fff");
  px(g,24,24+hb,6,1,"#ff5a1a"); px(g,25,25+hb+(P.atk?1:0),2,1,"#7a0a0a");
  for(let i=0;i<5;i++){ px(g,7+i*4,21,2,1,"#fff"); }
};
D.infernal_overlord = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#ff3a00", dk="#3a0c00", lite="#ff7a3a";
  g.fillStyle="rgba(255,90,20,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff9d2e"); px(g,28,18,1,1,"#fff");
  px(g,4,15,4,18,"#1a0500"); px(g,4,15,1,18,"#4a1502"); px(g,24,15,4,18,"#1a0500"); px(g,27,15,1,18,"#4a1502");
  px(g,4,15,4,2,"#d0ff2a"); px(g,24,15,4,2,"#d0ff2a");
  px(g,9+A.lx,29+A.ld,4,7,dk); px(g,19+A.rx,29+A.rd,4,7,dk);
  px(g,8+A.lx,35+A.ld,6,2,"#140400"); px(g,18+A.rx,35+A.rd,6,2,"#140400");
  px(g,7,16,18,14,"#5a1500"); px(g,7,16,18,2,lite);
  px(g,9,18,14,9,skin); px(g,9,18,14,1,"#ff9d2e"); px(g,10,20,12,6,"#ff9d2e"); px(g,11,21,10,2,"#fff");
  px(g,12,24,8,3,"#d0ff2a"); px(g,12,24,8,1,"#fff"); px(g,12,26,8,1,"#5a6a1a");
  const sm=P.atk?-4:0;
  px(g,2+A.lax,18+A.la+sm,5,8,dk); px(g,1+A.lax,24+A.la+sm,7,5,skin); px(g,2+A.lax,25+A.la+sm,5,1,"#ff9d2e");
  px(g,25+A.rax,18+A.ra+sm,5,8,dk); px(g,24+A.rax,23+A.ra+sm,7,6,skin); px(g,25+A.rax,24+A.ra+sm,5,4,"#d0ff2a"); px(g,26+A.rax,25+A.ra+sm,3,1,"#fff");
  px(g,10,5+hb,12,12,skin); px(g,10,5+hb,12,2,"#ff9d2e"); px(g,10,14+hb,12,2,dk);
  px(g,8,0+hb,4,6,"#ffd93d"); px(g,8,0+hb,4,1,"#fff"); px(g,14,0+hb,4,7,"#ff3a00"); px(g,14,0+hb,4,1,"#ffd93d"); px(g,20,0+hb,4,6,"#ffd93d"); px(g,20,0+hb,4,1,"#fff");
  g.fillStyle="#fff"; g.fillRect(12,9+hb,3,3); g.fillRect(18,9+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13,10+hb,1,2); g.fillRect(18,10+hb,1,2);
  g.fillStyle="#ff3a00"; g.fillRect(12,9+hb,1,1);
  px(g,13,14+hb,6,1,dk);
};
D.succubus_matriarch = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#ff6ab0", dk="#4a1028", lite="#ff9ac0";
  g.fillStyle="rgba(255,42,106,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16,37,9,2.4,0,0,7); g.fill();
  const WA=window.Anim.flap(P);
  g.save(); g.translate(11,20); g.rotate(WA); g.translate(-11,-20);
  g.fillStyle="#8a1a44"; g.beginPath(); g.moveTo(11,20); g.lineTo(0,4); g.lineTo(4,13); g.fill();
  g.fillStyle="#b02a5a"; g.beginPath(); g.moveTo(10,19); g.lineTo(3,9); g.lineTo(6,14); g.fill(); g.restore();
  g.save(); g.translate(21,20); g.rotate(-WA); g.translate(-21,-20);
  g.fillStyle="#8a1a44"; g.beginPath(); g.moveTo(21,20); g.lineTo(32,4); g.lineTo(28,13); g.fill();
  g.fillStyle="#b02a5a"; g.beginPath(); g.moveTo(22,19); g.lineTo(29,9); g.lineTo(26,14); g.fill(); g.restore();
  px(g,0,4,2,2,"#ff2a6a"); px(g,30,4,2,2,"#ff2a6a");
  px(g,6,25,20,11,"#a02a60"); px(g,6,25,20,2,"#ff8ac0"); px(g,6,34,20,2,dk);
  px(g,8,25,16,4,"#c93a70"); px(g,9,27,14,2,"#ffd93d"); px(g,9,27,14,1,"#fff2b0");
  px(g,7,16,18,10,skin); px(g,7,16,18,2,lite); px(g,7,24,18,2,dk);
  px(g,11,18,10,6,"#ff8ac0"); px(g,12,19,8,4,"#ffc0d0"); px(g,14,20,4,2,"#ff2a6a");
  const up=P.atk?-5:0;
  g.fillStyle="rgba(255,42,106,0.20)"; g.beginPath(); g.arc(26+A.rax,9+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,14,"#c9a227"); px(g,25+A.rax,12+A.ra+up,1,14,"#fff2b0");
  px(g,22+A.rax,6+A.ra+up,8,8,"#ff2a6a"); px(g,22+A.rax,6+A.ra+up,8,1,"#ffc0d0");
  px(g,23+A.rax,7+A.ra+up,6,5,"#fff"); px(g,24+A.rax,8+A.ra+up,4,3,"#ff2a6a");
  px(g,5+A.lax,18+A.la,3,7,skin); px(g,5+A.lax,18+A.la,1,7,lite);
  px(g,5+A.lax,24+A.la,3,2,"#ffd93d");
  px(g,10+A.hx,6+hb,12,10,"#e8b098"); px(g,10+A.hx,6+hb,12,1,"#fff2e0");
  for(let i=0;i<3;i++){ const ccx=11+i*4+A.hx; px(g,ccx,1+hb,3,6,"#ffd93d"); px(g,ccx,1+hb,3,1,"#fff"); px(g,ccx+1,2+hb,1,2,"#ff2a6a"); }
  g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,10+hb,3,3); g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillStyle="#fff"; g.fillRect(12+A.hx,10+hb,1,1);
  g.fillStyle="#ffe14d"; g.fillRect(18+A.hx,10+hb,2,2); g.fillStyle="#111"; g.fillRect(19+A.hx,11+hb,1,2);
  px(g,14+A.hx,14+hb,4,1,"#8a1a44"); px(g,15+A.hx,14+hb,2,1,"#ff8ab0");
};
D.doom_tyrant = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#1a0505", dk="#000000", lite="#4a1a1a";
  g.fillStyle="rgba(160,74,255,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#a04aff"); px(g,28,18,1,1,"#fff");
  px(g,8+A.lx,29+A.ld,5,7,dk); px(g,19+A.rx,29+A.rd,5,7,dk);
  px(g,7+A.lx,35+A.ld,7,2,"#000"); px(g,18+A.rx,35+A.rd,7,2,"#000");
  px(g,6,15,20,15,skin); px(g,6,15,20,2,lite); px(g,6,28,20,2,dk);
  px(g,11,21,10,7,"#0a0202"); px(g,12,22,8,2,"#a04aff"); px(g,12,24,8,2,"#3a1a6a");
  px(g,9,14,14,3,lite); px(g,9,14,14,1,"#8a4a4a");
  px(g,2+A.lax,9+A.la,8,9,lite); px(g,2+A.lax,9+A.la,8,1,"#fff");
  px(g,3+A.lax,7+A.la,2,6,"#a04aff"); px(g,3+A.lax,7+A.la,2,1,"#fff"); px(g,7+A.lax,7+A.la,2,6,"#a04aff"); px(g,7+A.lax,7+A.la,2,1,"#fff");
  px(g,22+A.rax,9+A.ra,8,9,lite); px(g,22+A.rax,9+A.ra,8,1,"#fff");
  px(g,23+A.rax,7+A.ra,2,6,"#a04aff"); px(g,23+A.rax,7+A.ra,2,1,"#fff"); px(g,27+A.rax,7+A.ra,2,6,"#a04aff"); px(g,27+A.rax,7+A.ra,2,1,"#fff");
  const sw=P.atk?-6:0;
  px(g,1+A.lax,20+A.la+sw,2,14,"#0a0a0a"); px(g,1+A.lax,20+A.la+sw,1,14,"#a04aff"); px(g,1+A.lax,20+A.la+sw,1,2,"#fff");
  px(g,0+A.lax,18+A.la+sw,4,3,"#a04aff"); px(g,0+A.lax,18+A.la+sw,4,1,"#fff");
  px(g,2+A.lax,21+A.la+sw,4,3,"#c9a227");
  px(g,25+A.rax,20+A.ra,5,8,skin); px(g,25+A.rax,20+A.ra,1,8,lite);
  px(g,9,4+hb,14,12,skin); px(g,9,4+hb,14,2,lite); px(g,9,14+hb,14,2,dk);
  g.fillStyle="#c9ffd9"; g.fillRect(11,8+hb,10,2);
  g.fillStyle="#111"; g.fillRect(13,8+hb,2,2); g.fillRect(18,8+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(11,8+hb,1,1);
  px(g,9,0+hb,4,6,lite); px(g,9,0+hb,4,1,"#8a4a4a"); px(g,19,0+hb,4,6,lite); px(g,19,0+hb,4,1,"#8a4a4a");
};
D.hell_magus = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#6a0a8a", dk="#1c0326", lite="#8a2aba";
  g.fillStyle="rgba(192,90,255,0.18)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#c05aff"); px(g,28,18,1,1,"#fff");
  px(g,11+A.lx,29+A.ld,4,7,dk); px(g,17+A.rx,29+A.rd,4,7,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#0c0210"); px(g,16+A.rx,35+A.rd,6,2,"#0c0210");
  px(g,7,17,18,14,skin); px(g,7,17,18,2,"#c05aff"); px(g,7,29,18,2,dk);
  px(g,7,17,2,14,dk); px(g,23,17,2,14,dk);
  px(g,12,21,8,7,"#12041a"); px(g,13,22,6,5,"#c05aff"); px(g,14,23,4,3,"#fff"); px(g,15,24,2,1,"#c05aff");
  px(g,7,29,18,2,"#c9a227"); px(g,7,29,18,1,"#fff2b0");
  px(g,4+A.lax,19+A.la,3,7,skin); px(g,4+A.lax,25+A.la,3,2,"#c9a227");
  const up=P.atk?-4:0;
  g.fillStyle="rgba(192,90,255,0.25)"; g.beginPath(); g.arc(26+A.rax,8+A.ra+up,6,0,7); g.fill();
  px(g,25+A.rax,12+A.ra+up,2,16,"#2a1a3a"); px(g,25+A.rax,12+A.ra+up,1,16,"#6a4a8a");
  px(g,22+A.rax,4+A.ra+up,8,9,"#2a1a3a"); px(g,22+A.rax,4+A.ra+up,8,1,"#c05aff");
  px(g,23+A.rax,5+A.ra+up,6,7,"#c05aff"); px(g,24+A.rax,6+A.ra+up,4,5,"#fff"); px(g,25+A.rax,7+A.ra+up,2,3,"#c05aff");
  px(g,8+A.hx,4+hb,16,5,"#12041a"); px(g,8+A.hx,4+hb,16,1,"#3a1a4a");
  px(g,10+A.hx,0+hb,12,5,"#3a0a4a"); px(g,10+A.hx,0+hb,12,1,"#5a1a6a"); px(g,12+A.hx,0+hb,8,2,"#c9a227"); px(g,12+A.hx,0+hb,2,1,"#fff");
  px(g,10+A.hx,9+hb,12,9,"#d8b8a8"); px(g,10+A.hx,9+hb,12,1,"#f2d8c8"); px(g,10+A.hx,16+hb,12,2,"#a88878");
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,3,2); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillRect(19+A.hx,11+hb,1,2);
  g.fillStyle="#c05aff"; g.fillRect(12+A.hx,11+hb,1,1);
  px(g,14+A.hx,14+hb,4,1,skin); px(g,15+A.hx,15+hb,2,1,dk);
};
// PETER THE FALLEN v1 — fallen god: tilted broken halo, big wings, horned crown, greatsword
// PETER THE FALLEN v2 — fallen god: huge layered wings, tilted halo ring, horned crown
// PETER THE FALLEN v3 — wingspan tyrant: edge-to-edge wings, high halo, spiked pauldrons, flame greatsword
// PETER THE FALLEN v4 — halo above horns, curved horns, feathered wings, lava-crack plate, long greatsword
// PETER THE FALLEN v5 — FINAL: shattered halo + shards, long ringed horns, rooted wings, gauntlet fist, jagged cape, glowing wound
// PETER THE FALLEN v10 — VOID TYRANT (PERFECT): blazing eye, smooth horns, torn wings, floating halo, maw heart, glowing blade — portrait path fixed to match
D.peter_the_fallen = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  // void aura + embers
  g.fillStyle="rgba(130,70,230,0.28)"; g.beginPath(); g.ellipse(16,22+hb,13,15,0,0,7); g.fill();
  g.fillStyle="rgba(160,90,255,0.18)"; g.beginPath(); g.ellipse(16,24+hb,8,11,0,0,7); g.fill();
  px(g,2,26,1,1,"#7a4ae0"); px(g,29,14,1,1,"#d08aff"); px(g,5,33,1,1,"#7a4ae0"); px(g,27,31,1,1,"#d08aff");
  px(g,12,1,1,1,"#fff"); px(g,24,33,1,1,"#fff");
  // tattered cape (brighter, violet hem)
  px(g,7,19,3,17,"#4a0a14"); px(g,12,19,3,17,"#4a0a14"); px(g,17,19,3,17,"#33070f"); px(g,22,19,3,17,"#4a0a14");
  px(g,7,35,3,1,"#7a4ae0"); px(g,12,35,3,1,"#7a4ae0"); px(g,17,35,3,1,"#7a4ae0"); px(g,22,35,3,1,"#7a4ae0");
  // torn void wings: joined dark roots, tears only in the outer half
  g.fillStyle="#0b0716";
  g.beginPath(); g.moveTo(11,23); g.lineTo(3,8); g.lineTo(6,7); g.lineTo(11,18); g.fill();
  g.beginPath(); g.moveTo(11,23); g.lineTo(0,5); g.lineTo(3,5); g.lineTo(9,16); g.fill();
  g.beginPath(); g.moveTo(21,23); g.lineTo(29,8); g.lineTo(26,7); g.lineTo(21,18); g.fill();
  g.beginPath(); g.moveTo(21,23); g.lineTo(32,5); g.lineTo(29,5); g.lineTo(23,16); g.fill();
  g.fillStyle="#221a52";
  g.beginPath(); g.moveTo(9,22); g.lineTo(4,13); g.lineTo(7,14); g.lineTo(10,21); g.fill();
  g.beginPath(); g.moveTo(23,22); g.lineTo(28,13); g.lineTo(25,14); g.lineTo(22,21); g.fill();
  px(g,0,5,2,2,"#7a4ae0"); px(g,1,7,1,3,"#d08aff"); px(g,30,5,2,2,"#7a4ae0"); px(g,30,7,1,3,"#d08aff");
  px(g,3,9,1,2,"#d08aff"); px(g,28,9,1,2,"#d08aff");
  // legs: darker greaves, dim seams, heavy boots
  px(g,10+A.lx,28+A.ld,5,8,"#0c0c12"); px(g,17+A.rx,28+A.rd,5,8,"#0c0c12");
  px(g,12+A.lx,29+A.ld,1,6,"#4a2a8a"); px(g,19+A.rx,29+A.rd,1,6,"#4a2a8a");
  px(g,10+A.lx,28+A.ld,5,1,"#2a2a38"); px(g,17+A.rx,28+A.rd,5,1,"#2a2a38");
  px(g,9+A.lx,36+A.ld,7,3,"#050508"); px(g,16+A.rx,36+A.rd,7,3,"#050508");
  px(g,9+A.lx,36+A.ld,7,1,"#1c1c28");
  // torso: black plate, violet cracks, dark chest maw with a hot heart
  px(g,9,18,14,12,"#101016"); px(g,9,18,14,1,"#2e2e40");
  px(g,9,18,1,12,"#23232f"); px(g,22,18,1,12,"#23232f");
  px(g,11,20,1,4,"#5a2fb0"); px(g,20,26,1,4,"#5a2fb0");
  px(g,13,22,6,4,"#0d0312");
  px(g,13,22,6,1,"#7a4ae0"); px(g,13,25,6,1,"#3a2060");
  px(g,14,22,1,1,"#fff"); px(g,16,22,1,1,"#fff");
  px(g,15,23,1,2,"#e08aff"); px(g,15,24,1,1,"#fff");
  px(g,15,25,1,1,"#d08aff");
  // spiked pauldrons, violet tips
  px(g,3,15,7,5,"#14141c"); px(g,3,15,7,1,"#3a3a4c");
  px(g,22,15,7,5,"#14141c"); px(g,22,15,7,1,"#3a3a4c");
  px(g,3,12,2,3,"#2a2a38"); px(g,3,12,2,1,"#d08aff");
  px(g,5,11,2,4,"#2a2a38"); px(g,5,11,2,1,"#d08aff");
  px(g,7,12,2,3,"#2a2a38"); px(g,7,12,2,1,"#d08aff");
  px(g,24,12,2,3,"#2a2a38"); px(g,24,12,2,1,"#d08aff");
  px(g,26,11,2,4,"#2a2a38"); px(g,26,11,2,1,"#d08aff");
  px(g,28,12,1,3,"#2a2a38"); px(g,28,12,1,1,"#d08aff");
  // left arm + short fang claws
  px(g,4+A.lax,21+A.la,4,7,"#101018");
  px(g,4+A.lax,27+A.la,5,3,"#1c1c26");
  px(g,4+A.lax,30+A.la,1,2,"#b8ac9c"); px(g,6+A.lax,30+A.la,1,2,"#e8e0d0"); px(g,8+A.lax,30+A.la,1,2,"#b8ac9c");
  // right arm + voidglass shard-blade with glow envelope, slim guard
  const sw=P.atk?-7:0;
  px(g,23+A.rax,19+A.ra+sw,4,8,"#101018");
  px(g,23+A.rax,26+A.ra+sw,4,3,"#1c1c26");
  px(g,25,7+sw,1,16,"#5a2fb0"); px(g,30,7+sw,1,16,"#5a2fb0");
  px(g,26,8+sw,1,16,"#2a1a4a"); px(g,27,6+sw,2,18,"#a04aff"); px(g,28,7+sw,1,16,"#fff");
  px(g,26,5+sw,3,2,"#d08aff"); px(g,27,4+sw,1,1,"#fff");
  px(g,27,10+sw,1,2,"#fff"); px(g,27,16+sw,1,2,"#fff");
  px(g,25,24+sw,4,2,"#2a1a4a"); px(g,26,24+sw,2,1,"#d08aff");
  // black demon mask: violet blaze eye, asymmetric bleed, fanged grin
  px(g,11+A.hx,8+hb,10,10,"#0a0a12");
  px(g,11+A.hx,8+hb,1,10,"#1e1e2e"); px(g,20+A.hx,8+hb,1,10,"#000");
  px(g,11+A.hx,8+hb,10,2,"#000");
  px(g,12+A.hx,8+hb,8,1,"#3a2060");
  px(g,12+A.hx,10+hb,8,3,"#7a4ae0"); px(g,13+A.hx,10+hb,6,2,"#d08aff"); px(g,15+A.hx,11+hb,2,1,"#fff");
  px(g,13+A.hx,13+hb,1,3,"#7a4ae0"); px(g,18+A.hx,13+hb,1,1,"#7a4ae0"); px(g,13+A.hx,15+hb,1,1,"#3a2060");
  px(g,13+A.hx,16+hb,6,2,"#000");
  px(g,13+A.hx,16+hb,1,1,"#fff"); px(g,15+A.hx,16+hb,1,1,"#fff"); px(g,17+A.hx,16+hb,1,1,"#fff");
  px(g,14+A.hx,17+hb,1,1,"#4a4a5e"); px(g,16+A.hx,17+hb,1,1,"#4a4a5e");
  // smooth swept bone horns: thin segments, 1px steps, shaded undersides
  px(g,8+A.hx,7+hb,2,2,"#e8e0d0"); px(g,6+A.hx,6+hb,2,2,"#e8e0d0"); px(g,4+A.hx,5+hb,2,2,"#e8e0d0");
  px(g,2+A.hx,3+hb,2,2,"#e8e0d0"); px(g,0+A.hx,1+hb,2,2,"#e8e0d0"); px(g,0+A.hx,0+hb,1,1,"#fff");
  px(g,8+A.hx,8+hb,2,1,"#8a8078"); px(g,6+A.hx,7+hb,2,1,"#8a8078"); px(g,4+A.hx,6+hb,2,1,"#8a8078"); px(g,2+A.hx,4+hb,2,1,"#8a8078");
  px(g,8+A.hx,7+hb,2,1,"#7a4ae0");
  px(g,22+A.hx,7+hb,2,2,"#e8e0d0"); px(g,24+A.hx,6+hb,2,2,"#e8e0d0"); px(g,26+A.hx,5+hb,2,2,"#e8e0d0");
  px(g,28+A.hx,3+hb,2,2,"#e8e0d0"); px(g,30+A.hx,1+hb,2,2,"#e8e0d0"); px(g,31+A.hx,0+hb,1,1,"#fff");
  px(g,22+A.hx,8+hb,2,1,"#8a8078"); px(g,24+A.hx,7+hb,2,1,"#8a8078"); px(g,26+A.hx,6+hb,2,1,"#8a8078"); px(g,28+A.hx,4+hb,2,1,"#8a8078");
  px(g,22+A.hx,7+hb,2,1,"#7a4ae0");
  // floating broken halo: thick bright arc, wide gap, big shards
  px(g,9,1,5,2,"#2a1a4a"); px(g,18,1,5,2,"#2a1a4a");
  px(g,9,1,5,1,"#d08aff"); px(g,18,1,4,1,"#d08aff");
  px(g,8,2,2,2,"#2a1a4a"); px(g,22,2,2,2,"#2a1a4a");
  px(g,5,4,3,3,"#7a4ae0"); px(g,5,4,2,1,"#fff"); px(g,25,3,3,3,"#7a4ae0"); px(g,25,3,2,1,"#fff");
};



// DEMON WARDEN v5 REALISM (obsidian guard: tower shield+gold sigil, hammer w/ ember, crested helm, ~90 rects)
D.demon_warden = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin="#8a1a00", dk="#2a0800", lite="#c94a1a";
  g.fillStyle="rgba(255,90,26,0.15)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
  px(g,3,22,1,1,"#ff5a1a"); px(g,28,18,1,1,"#fff");
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,8+A.lx,35+A.ld,7,2,"#0c0202"); px(g,17+A.rx,35+A.rd,7,2,"#0c0202");
  // obsidian plate + tabard sigil + gold trim
  px(g,6,17,20,14,skin); px(g,6,17,20,2,lite); px(g,6,29,20,2,dk);
  px(g,6,17,2,14,dk); px(g,24,17,2,14,dk);
  px(g,11,20,10,9,"#2a0800"); px(g,12,21,8,7,"#ff5a1a"); px(g,13,22,6,5,"#ffd93d"); px(g,15,23,2,2,"#fff");
  px(g,6,17,20,2,"#ffd93d"); px(g,6,17,20,1,"#fff2b0");
  // TOWER SHIELD (tall, gold sigil, steel rim)
  px(g,0+A.lax,15+A.la,6,15,"#1a1622"); px(g,0+A.lax,15+A.la,6,1,"#3a3450"); px(g,0+A.lax,29+A.la,6,1,"#0c0a14");
  px(g,1+A.lax,16+A.la,4,13,"#3a3450"); px(g,2+A.lax,20+A.la,2,5,"#ffd93d"); px(g,2+A.lax,20+A.la,1,1,"#fff");
  // HAMMER (raises on bash)
  const sm=P.atk?-5:0;
  px(g,25+A.rax,18+A.ra+sm,3,9,"#5a3a2a"); px(g,25+A.rax,18+A.ra+sm,1,9,"#a97648");
  px(g,23+A.rax,14+A.ra+sm,7,6,dk); px(g,23+A.rax,14+A.ra+sm,7,1,lite);
  px(g,23+A.rax,15+A.ra+sm,7,1,"#ff5a1a"); px(g,23+A.rax,16+A.ra+sm,2,2,"#fff");
  // crested HELM + glowing visor + horns
  px(g,9+A.hx,6+hb,14,11,skin); px(g,9+A.hx,6+hb,14,2,lite); px(g,9+A.hx,15+hb,14,2,dk);
  px(g,8+A.hx,3+hb,16,5,"#1a1622"); px(g,8+A.hx,3+hb,16,1,"#3a3450"); px(g,10+A.hx,4+hb,12,1,"#ffd93d");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,6+hb); g.lineTo(7+A.hx,0+hb); g.lineTo(12+A.hx,5+hb); g.fill();
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(21+A.hx,6+hb); g.lineTo(25+A.hx,0+hb); g.lineTo(20+A.hx,5+hb); g.fill();
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,11+hb,3,3); g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1);
  g.fillStyle="#ffd93d"; g.fillRect(18+A.hx,11+hb,2,2); g.fillStyle="#111"; g.fillRect(19+A.hx,12+hb,1,2);
};

const prev = window.Sprites.actor;
const cache = new Map();
try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(()=>cache.clear()); } catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if (D[kind]){
    gen = (gen==="male"||gen==="female")?gen:"";
    let P=null, bk="";
    try {
      if (window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph);} else P=window.Anim.normP(null); }
    } catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck=kind+"|"+(tint||"#fff")+"|"+gen+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=cv(); const g=c.getContext("2d"); g.imageSmoothingEnabled=false;
    g.clearRect(0,0,32,40);
    g.fillStyle="rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
    try{ D[kind](g,tint||"#fff",P); }catch(e){}
    let out=c;
    try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>700) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
})();
