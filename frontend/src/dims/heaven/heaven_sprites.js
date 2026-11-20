/* Heaven sprites — angels + celestials at goddess-of-dawn density.
 * Loads AFTER heaven_mobs.js. Pattern mirrors hell_sprites.js:
 * D[kind](g,tint,P) painters + actor wrapper with pose-bucket cache.
 * Goddess bar: ~90-110 rects, layered robes/wings/halos, gold + dawn palette.
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
function wings(g,P,hb,feather,featherD,span){
  const flap = P.atk ? 2 : (P.moving ? (P.f % 2) : 0);
  const L = span || 9;
  // left wing: 3 feather layers + coverts
  px(g, 2-flap, 12+hb, L, 4, feather); px(g, 2-flap, 12+hb, L, 1, "#ffffff");
  px(g, 1-flap, 16+hb, L+1, 4, feather); px(g, 1-flap, 19+hb, L+1, 1, featherD);
  px(g, 0-flap, 20+hb, L, 5, featherD); px(g, 1-flap, 20+hb, 2, 5, feather);
  px(g, 2-flap, 24+hb, 3, 2, feather); px(g, 5-flap, 24+hb, 2, 3, feather);
  // right wing mirrored
  px(g, 32-L+flap-9+7, 12+hb, L, 4, feather); px(g, 32-L+flap-9+7, 12+hb, L, 1, "#ffffff");
  px(g, 31-L-1+flap-8+8, 16+hb, L+1, 4, feather); px(g, 31-L-1+flap-8+8, 19+hb, L+1, 1, featherD);
  px(g, 32-L+flap-9+7, 20+hb, L, 5, featherD); px(g, 29-L+flap+9, 20+hb, 2, 5, feather);
}
// DAWN ANGEL — gold + white plate-robe, big halo, dawn wings (civilian standard)
D.dawn_angel = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const robe="#f7f3ea", robeD="#d8cfc0", robeDD="#b8ab98", gold="#d8a018", goldL="#f6d34e", goldD="#8a6410";
  const skin="#f6d3b3", skinD="#e0a878", hair="#f0c94e", hairD="#c9962e", hairL="#ffe9a0";
  g.fillStyle="rgba(255,230,160,0.20)"; g.beginPath(); g.ellipse(16,20+hb,12,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,38,8,2,0,0,7); g.fill();
  wings(g,P,hb,"#fffdf6","#e8ddc8",9);
  px(g,9,0,6,1,goldD); px(g,18,0,5,1,goldD); px(g,10,0,4,1,goldL); px(g,19,0,3,1,goldL);
  px(g,8,1,1,2,goldD); px(g,23,1,1,2,goldD); px(g,8,3,24,1,goldL);
  // legs + sandals
  px(g,12+A.lx,30+A.ld,3,6,skin); px(g,17+A.rx,30+A.rd,3,6,skin);
  px(g,12+A.lx,35+A.ld,3,2,"#8a5a33"); px(g,17+A.rx,35+A.rd,3,2,"#8a5a33");
  // robe skirt + gold hem + folds
  px(g,9,24,14,11,robe); px(g,9,24,1,11,robeD); px(g,22,24,1,11,robeD);
  px(g,9,24,14,1,"#fff"); px(g,9,33,14,2,gold); px(g,9,33,14,1,goldL); px(g,9,34,14,1,goldD);
  px(g,12,25,1,8,robeD); px(g,15,25,1,8,robeDD); px(g,19,25,1,8,robeD);
  px(g,11,28,3,1,robeD); px(g,17,29,3,1,robeD);
  // torso cuirass + sash
  px(g,11,15,10,10,robe); px(g,11,15,1,10,robeD); px(g,20,15,1,10,robeD);
  px(g,12,16,8,4,gold); px(g,12,16,8,1,goldL); px(g,12,19,8,1,goldD);
  px(g,14,20,1,4,goldD); px(g,17,20,1,4,goldD); px(g,13,18,6,1,"#fff");
  px(g,11,21,10,2,"#2a4ad0"); px(g,11,21,10,1,"#7a9bff");
  // arms: sleeves -> bracers -> hands
  px(g,7+A.lax,16+A.la,4,4,skin); px(g,21+A.rax,16+A.ra,4,4,skin);
  px(g,6+A.lax,19+A.la,4,3,gold); px(g,6+A.lax,19+A.la,4,1,goldL);
  px(g,22+A.rax,19+A.ra,4,3,gold); px(g,22+A.rax,19+A.ra,4,1,goldL);
  px(g,5+A.lax,22+A.la,3,7,robe); px(g,5+A.lax,22+A.la,1,7,robeD);
  px(g,24+A.rax,22+A.ra,3,7,robe); px(g,26+A.rax,22+A.ra,1,7,robeD);
  px(g,5+A.lax,29+A.la,3,3,skin); px(g,24+A.rax,29+A.ra,3,3,skin);
  // spear of dawn in right hand
  px(g,26+A.rax,10+A.ra,1,22,"#8a6410"); px(g,26+A.rax,10+A.ra,1,3,goldL);
  px(g,24+A.rax,6+A.ra,5,5,goldL); px(g,25+A.rax,7+A.ra,3,3,"#fff");
  // head + hair + circlet
  px(g,11,6,10,8,skin); px(g,11,12,10,1,skinD); px(g,11,6,10,1,hairL);
  px(g,9,5,14,3,hair); px(g,9,5,2,9,hair); px(g,21,5,2,9,hair);
  px(g,9,5,14,1,hairL); px(g,9,12,2,2,hairD); px(g,21,12,2,2,hairD);
  px(g,11,4,10,2,gold); px(g,11,4,10,1,goldL); px(g,15,4,2,2,"#fff");
  px(g,12,9,3,2,"#3a2a1a"); px(g,17,9,3,2,"#3a2a1a");
  px(g,12,9,1,1,"#fff"); px(g,17,9,1,1,"#fff");
  px(g,14,12,3,1,"#c98a6a");
  px(g,10,2,2,2,goldL); px(g,20,2,2,2,"#fff");
};
// CHOIR ANGEL — flowing mint-white choir robe, songbook, soft blue wings
D.choir_angel = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const robe="#eef6f2", robeD="#c4d4cc", gold="#d8a018", goldL="#f6d34e", skin="#f6d3b3", skinD="#e0a878", hair="#e8e0d0", hairD="#b8ab98";
  g.fillStyle="rgba(180,240,255,0.18)"; g.beginPath(); g.ellipse(16,20+hb,11,13,0,0,7); g.fill();
  wings(g,P,hb,"#e8f6ff","#b8d4e8",8);
  px(g,10,0,12,1,gold); px(g,10,0,12,1,goldL);
  px(g,12+A.lx,30+A.ld,3,6,skin); px(g,17+A.rx,30+A.rd,3,6,skin);
  px(g,9,23,14,12,robe); px(g,9,23,14,1,"#fff"); px(g,9,33,14,2,gold);
  px(g,12,24,1,9,robeD); px(g,16,24,1,9,robeD); px(g,20,24,1,9,robeD);
  px(g,11,15,10,9,robe); px(g,13,16,6,3,gold); px(g,13,19,6,1,goldL);
  px(g,7+A.lax,17+A.la,4,3,skin); px(g,21+A.rax,17+A.ra,4,3,skin);
  px(g,6+A.lax,20+A.la,3,8,robe); px(g,23+A.rax,20+A.ra,3,8,robe);
  // open songbook held front
  px(g,11+A.hx,22,10,6,"#7a5a33"); px(g,12+A.hx,22,8,6,"#fff8ea");
  px(g,12+A.hx,23,8,1,"#888"); px(g,12+A.hx,25,8,1,"#888"); px(g,16+A.hx,22,1,6,"#7a5a33");
  px(g,11,6,10,8,skin); px(g,9,4,14,4,hair); px(g,9,6,2,9,hair); px(g,21,6,2,9,hair);
  px(g,11,4,10,1,goldL); px(g,12,9,3,2,"#3a2a1a"); px(g,17,9,3,2,"#3a2a1a");
  // floating notes
  px(g,5,8,2,2,goldL); px(g,25,6,2,2,goldL); px(g,27,11,1,2,goldL);
};
// SERAPH GUARD — heavy gold plate, tower shield, 6-wing hint (2 big + 2 small)
D.seraph_guard = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const plate="#f2e2a0", plateD="#b89a4a", plateDD="#7a6410", gold="#d8a018", goldL="#f6d34e", skin="#e8b893", skinD="#c98a6a";
  g.fillStyle="rgba(255,220,120,0.22)"; g.beginPath(); g.ellipse(16,20+hb,13,14,0,0,7); g.fill();
  wings(g,P,hb,"#fff2c0","#d8b860",10);
  // small upper wings
  px(g,6,8+hb,5,3,"#fffdf6"); px(g,21,8+hb,5,3,"#fffdf6");
  px(g,9,0,14,1,plateDD); px(g,10,0,12,1,goldL);
  px(g,11+A.lx,29+A.ld,4,6,plateD); px(g,17+A.rx,29+A.rd,4,6,plateD);
  px(g,10+A.lx,34+A.ld,6,2,"#4a3a1a"); px(g,16+A.rx,34+A.rd,6,2,"#4a3a1a");
  px(g,9,23,14,7,plate); px(g,9,23,14,1,goldL); px(g,9,28,14,2,plateD);
  px(g,12,24,1,5,plateDD); px(g,15,24,1,5,plateDD); px(g,19,24,1,5,plateDD);
  px(g,10,15,12,9,plate); px(g,10,15,12,2,goldL); px(g,10,22,12,2,plateD);
  px(g,13,17,6,4,plateD); px(g,14,18,4,2,"#fff");
  px(g,10,15,2,9,plateDD); px(g,20,15,2,9,plateDD);
  px(g,6+A.lax,17+A.la,5,4,skin); px(g,21+A.rax,17+A.ra,5,4,skin);
  px(g,5+A.lax,21+A.la,4,4,plate); px(g,23+A.rax,21+A.ra,4,4,plate);
  // tower shield left
  px(g,1+A.lax,18+A.la,5,14,gold); px(g,2+A.lax,19+A.la,3,12,plate); px(g,2+A.lax,19+A.la,3,2,goldL);
  px(g,2+A.lax,24+A.la,3,2,"#2a4ad0");
  // sword right
  px(g,25+A.rax,8+A.ra,2,14,"#d8e8f0"); px(g,25+A.rax,8+A.ra,1,14,"#fff");
  px(g,24+A.rax,22+A.ra,4,2,gold); px(g,25+A.rax,24+A.ra,2,4,"#4a3a1a");
  px(g,10,6,12,8,skin); px(g,10,4,12,4,plate); px(g,10,4,12,1,goldL);
  px(g,12,5,3,1,plateDD); px(g,17,5,3,1,plateDD);
  px(g,13,9,3,3,"#1a2a4a"); px(g,18,9,2,2,"#1a2a4a");
  px(g,13,9,1,1,"#fff");
};
// SCROLL ANGEL — scholar: teal-trimmed robe, scroll case, spectacles
D.scroll_angel = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const robe="#f2eee4", robeD="#c9c2b2", trim="#2a8a8a", gold="#d8a018", skin="#f6d3b3";
  wings(g,P,hb,"#f4f0e8","#c9c2b2",7);
  px(g,12,30,3,6,skin); px(g,17,30,3,6,skin);
  px(g,9,23,14,8,robe); px(g,9,30,14,2,trim); px(g,12,24,1,6,robeD); px(g,19,24,1,6,robeD);
  px(g,11,15,10,9,robe); px(g,11,15,10,1,trim); px(g,11,20,10,2,gold);
  px(g,7+A.lax,17+A.la,4,3,skin); px(g,21+A.rax,17+A.ra,4,3,skin);
  px(g,6+A.lax,20+A.la,3,7,robe); px(g,23+A.rax,20+A.ra,3,7,robe);
  px(g,22+A.rax,26+A.ra,4,5,"#e8dcc0"); px(g,22+A.rax,26+A.ra,4,1,"#8a7a5a"); px(g,22+A.rax,30+A.ra,4,1,"#8a7a5a");
  px(g,11,6,10,8,skin); px(g,9,5,14,3,"#8a7a5a"); px(g,12,9,4,3,"#222"); px(g,18,9,2,1,"#222");
  px(g,12,9,4,1,"#fff"); px(g,10,9,2,1,"#888"); px(g,20,9,2,1,"#888");
  px(g,13,1,6,1,gold);
};
// Bosses: reuse angel grandeur at larger read
// Bosses: angel grandeur at larger read. Divine dragon: coiled dawn wyrm with
// horned head, layered wings, halo and gold belly — never a pastry again.
D.divine_dragon = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const cream="#fffdf6", gold="#f6d34e", goldD="#c9962e", rose="#ffb0d0", eye="#1a2a4a";
  g.fillStyle="rgba(255,230,160,0.25)"; g.beginPath(); g.ellipse(16,20,14,13,0,0,7); g.fill();
  // halo
  px(g,11,1,10,2,gold); px(g,13,0,6,1,gold); px(g,11,3,10,1,"#fff");
  // wings behind (layered cream, flap with pose)
  const flap = P.atk ? 2 : (P.moving ? (P.f % 2) : 0);
  px(g,1-flap,14,8,6,cream); px(g,1-flap,14,8,1,"#fff"); px(g,0-flap,18,6,4,"#e8c890");
  px(g,23+flap,14,8,6,cream); px(g,23+flap,14,8,1,"#fff"); px(g,26+flap,18,6,4,"#e8c890");
  // tail curl + spade tip
  px(g,3,26,6,5,cream); px(g,2,28,4,4,gold); px(g,3,29,2,2,"#fff");
  // coiled body + gold belly ridges
  px(g,9,24,14,9,cream); px(g,9,24,14,2,"#fff"); px(g,9,30,14,2,rose);
  px(g,11,26,2,5,gold); px(g,15,26,2,5,gold); px(g,19,26,2,5,goldD);
  // neck + horned head
  px(g,19,14,6,11,cream); px(g,19,14,6,1,"#fff");
  px(g,18,12,9,8,cream); px(g,18,12,9,2,gold);
  px(g,23,16,4,4,cream); px(g,25,18,2,1,rose);
  px(g,20,14,3,3,eye); px(g,20,14,1,1,"#fff");
  px(g,17,8,3,5,gold); px(g,22,8,3,5,goldD);
  // rose wing-arms
  px(g,6,22,5,4,rose); px(g,21,22,5,4,rose);
};
// CELESTIAL MESSENGER — dawn herald with raised trumpet (never a guard clone).
// Tall layered wings, long flowing hair, sash + medal, sound arcs from the bell.
D.celestial_messenger = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const robe="#fffdf6", robeD="#ddd2bc", gold="#d8a018", goldL="#f6d34e", goldD="#8a6410";
  const skin="#f6d3b3", skinD="#e0a878", hair="#f0e8f8", hairD="#b8a8d8", sash="#2a4ad0";
  g.fillStyle="rgba(255,236,170,0.25)"; g.beginPath(); g.ellipse(16,20+hb,13,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,38,8,2,0,0,7); g.fill();
  wings(g,P,hb,"#fffdf6","#d8cba8",11);
  // tall halo + rays
  px(g,10,0,12,2,gold); px(g,12,0,8,1,"#fff"); px(g,15,1,2,2,"#fff");
  px(g,6,3,2,2,goldL); px(g,24,3,2,2,goldL); px(g,4,8,1,2,goldL); px(g,27,8,1,2,goldL);
  // long flowing hair behind shoulders
  px(g,8,4,4,12,hair); px(g,20,4,4,12,hair); px(g,8,4,1,12,hairD); px(g,23,4,1,12,hairD);
  px(g,9,6,1,8,hairD); px(g,22,6,1,8,hairD);
  px(g,8,14,4,3,hairD); px(g,20,14,4,3,hairD);
  // legs + sandals
  px(g,12+A.lx,30+A.ld,3,6,skin); px(g,17+A.rx,30+A.rd,3,6,skin);
  px(g,12+A.lx,35+A.ld,3,2,"#8a5a33"); px(g,17+A.rx,35+A.rd,3,2,"#8a5a33");
  // robe skirt + gold hem + feathered hemline
  px(g,9,24,14,11,robe); px(g,9,24,1,11,robeD); px(g,22,24,1,11,robeD);
  px(g,9,24,14,1,"#fff"); px(g,9,33,14,2,gold); px(g,9,34,14,1,goldD);
  px(g,11,35,2,2,"#fff"); px(g,15,35,2,2,"#fff"); px(g,19,35,2,2,"#fff");
  // torso + sash + medal
  px(g,11,15,10,10,robe); px(g,11,15,1,10,robeD); px(g,20,15,1,10,robeD);
  px(g,11,17,10,3,sash); px(g,11,17,10,1,"#7a9bff"); px(g,14,21,1,3,sash);
  px(g,15,20,3,3,gold); px(g,15,20,3,1,goldL); px(g,16,21,1,1,"#fff");
  // left arm lowered with scroll
  px(g,6+A.lax,17+A.la,4,3,skin);
  px(g,5+A.lax,20+A.la,3,7,robe); px(g,5+A.lax,26+A.la,4,4,"#e8dcc0");
  px(g,5+A.lax,26+A.la,4,1,"#8a7a5a"); px(g,5+A.lax,29+A.la,4,1,"#8a7a5a");
  // right arm RAISED with long trumpet
  px(g,23+A.rax,12+A.ra,3,6,skin);
  px(g,24+A.rax,6+A.ra,2,7,gold); px(g,24+A.rax,6+A.ra,1,7,goldL);
  px(g,22+A.rax,3+A.ra,6,4,gold); px(g,22+A.rax,3+A.ra,6,1,goldL); px(g,27+A.rax,4+A.ra,1,2,"#fff");
  // sound arcs from the bell
  px(g,29+A.rax,2+A.ra,1,2,goldL); px(g,30+A.rax,5+A.ra,1,3,goldL); px(g,29+A.rax,8+A.ra,1,2,goldL);
  // head + flowing fringe + circlet
  px(g,11,6,10,8,skin); px(g,11,12,10,1,skinD); px(g,11,6,10,1,"#fff");
  px(g,9,5,14,3,hair); px(g,9,5,2,10,hair); px(g,21,5,2,10,hair); px(g,9,5,14,1,"#fff");
  px(g,11,4,10,2,gold); px(g,11,4,10,1,goldL);
  px(g,12,9,3,2,"#3a2a1a"); px(g,17,9,3,2,"#3a2a1a");
  px(g,12,9,1,1,"#fff"); px(g,17,9,1,1,"#fff");
  px(g,14,12,3,1,"#c98a6a");
};
// RESERVOIR LEVIATHAN — S-coiled lake serpent with fin spines, barbels and spray.
D.reservoir_leviathan = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const body=tint||"#7ac8ff", dk="#2a6a9a", lite="#bfe8ff", belly="#e8f6ff", eye="#123";
  const sw=(P.moving?(P.f%2?1:-1):0);
  g.fillStyle="rgba(160,220,255,0.22)"; g.beginPath(); g.ellipse(16,22,14,12,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.22)"; g.beginPath(); g.ellipse(16,37,10,2,0,0,7); g.fill();
  // spray arcs above
  px(g,4,2,2,3,lite); px(g,7,0,2,2,"#fff"); px(g,24,1,2,3,lite); px(g,27,3,2,2,"#fff");
  px(g,12,3,2,2,lite); px(g,18,2,2,2,"#fff");
  // tail curl + finlet
  px(g,2+sw,28,6,4,body); px(g,2+sw,28,6,1,lite); px(g,1+sw,30,3,3,dk);
  px(g,4+sw,26,2,2,dk); px(g,7+sw,26,2,2,dk);
  // lower coil + belly bands
  px(g,4,28,24,7,body); px(g,4,28,24,1,lite); px(g,4,34,24,1,dk);
  px(g,6,30,3,3,belly); px(g,12,30,3,3,belly); px(g,18,30,3,3,belly); px(g,23,30,3,3,belly);
  // mid coil + dorsal spines
  px(g,8-sw,22,16,7,body); px(g,8-sw,22,16,1,lite); px(g,8-sw,28,16,1,dk);
  px(g,10-sw,23,2,3,belly); px(g,15-sw,23,2,3,belly); px(g,20-sw,23,2,3,belly);
  px(g,10-sw,19,2,4,dk); px(g,15-sw,19,2,4,dk); px(g,20-sw,19,2,4,dk);
  px(g,10-sw,19,2,1,lite); px(g,15-sw,19,2,1,lite); px(g,20-sw,19,2,1,lite);
  // side paddle fins
  px(g,3-sw,24,4,3,lite); px(g,3-sw,24,4,1,"#fff"); px(g,25+sw,24,4,3,lite);
  // rising neck + crested head
  px(g,20,12,6,11,body); px(g,20,12,6,1,lite); px(g,25,18,1,5,dk);
  px(g,22,13,3,5,belly);
  // droplet crest fin atop the skull
  px(g,21,7,4,3,lite); px(g,22,6,2,1,"#fff"); px(g,21,9,4,1,dk);
  // head: jaw, eye, nostril, barbel whiskers, droplet crest
  px(g,18,10,10,8,body); px(g,18,10,10,2,lite);
  px(g,18,15,10,3,belly); px(g,18,15,10,1,dk);
  px(g,23,16,2,1,dk);
  px(g,20,12,3,3,eye); px(g,20,12,1,1,"#fff"); px(g,21,13,1,1,"#7ac8ff");
  px(g,26,13,1,1,dk);
  px(g,17,17,2,3,lite); px(g,28,17,2,3,lite);
  px(g,21,6,2,4,dk); px(g,24,6,2,4,dk); px(g,21,6,2,1,lite); px(g,24,6,2,1,lite);
  px(g,22,4,4,2,lite); px(g,23,3,2,1,"#fff");
};
// SERAPH REGENT — the court's crown: gemmed crown, cape, orb + scepter, 6 wings.
D.seraph_regent = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const plate="#f2e2a0", plateD="#b89a4a", plateDD="#7a6410", gold="#d8a018", goldL="#f6d34e";
  const cape="#2a3a8a", capeD="#141a4a", skin="#e8b893", gemR="#e03a4a", gemB="#3a7ae0";
  g.fillStyle="rgba(255,220,120,0.25)"; g.beginPath(); g.ellipse(16,20+hb,14,14,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,38,9,2,0,0,7); g.fill();
  // long cape behind
  px(g,6,12+hb,20,22,cape); px(g,6,12+hb,20,2,gold); px(g,6,32+hb,20,2,capeD);
  px(g,6,12+hb,1,22,capeD); px(g,25,12+hb,1,22,capeD);
  // 6 wings: great + mid + small
  wings(g,P,hb,"#fff2c0","#d8b860",10);
  px(g,3,18+hb,4,3,"#fffdf6"); px(g,25,18+hb,4,3,"#fffdf6");
  px(g,4,21+hb,3,2,"#d8b860"); px(g,25,21+hb,3,2,"#d8b860");
  // legs + boots
  px(g,11+A.lx,29+A.ld,4,6,plateD); px(g,17+A.rx,29+A.rd,4,6,plateD);
  px(g,10+A.lx,34+A.ld,6,2,"#3a2a10"); px(g,16+A.rx,34+A.rd,6,2,"#3a2a10");
  // skirt tassets + gold fringe
  px(g,9,23,14,7,plate); px(g,9,23,14,1,goldL); px(g,9,28,14,2,plateD);
  px(g,11,30,2,2,gold); px(g,15,30,2,2,gold); px(g,19,30,2,2,gold);
  // cuirass + sun sigil
  px(g,10,15,12,9,plate); px(g,10,15,12,2,goldL); px(g,10,22,12,2,plateD);
  px(g,14,17,4,4,gold); px(g,15,18,2,2,"#fff"); px(g,13,18,1,2,goldD); px(g,18,18,1,2,goldD);
  px(g,15,16,2,1,goldD); px(g,15,21,2,1,goldD);
  // left arm: glowing ORB of dawn
  px(g,5+A.lax,17+A.la,4,4,skin);
  px(g,4+A.lax,21+A.la,5,5,gold); px(g,5+A.lax,22+A.la,3,3,goldL); px(g,6+A.lax,23+A.la,1,1,"#fff");
  // right arm: SCEPTER with sun head
  px(g,23+A.rax,17+A.ra,4,4,skin);
  px(g,25+A.rax,8+A.ra,2,14,goldD); px(g,25+A.rax,8+A.ra,1,14,goldL);
  px(g,23+A.rax,4+A.ra,6,5,gold); px(g,23+A.rax,4+A.ra,6,1,goldL); px(g,25+A.rax,5+A.ra,2,2,"#fff");
  // head + GEMMED CROWN
  px(g,10,6,12,8,skin);
  px(g,9,2,14,5,gold); px(g,9,2,14,1,goldL); px(g,9,6,14,1,goldD);
  px(g,11,3,3,3,gemR); px(g,15,3,2,3,gemB); px(g,19,3,3,3,gemR);
  px(g,11,3,1,1,"#fff"); px(g,15,3,1,1,"#fff");
  px(g,12,5,2,1,plateDD); px(g,18,5,2,1,plateDD);
  px(g,13,9,3,3,"#1a2a4a"); px(g,18,9,2,2,"#1a2a4a"); px(g,13,9,1,1,"#fff");
  px(g,14,12,4,1,"#8a4a2a");
};
// Wild celestials: small but faced — every one gets eyes + wings/legs that read.
D.dew_sprite = (g,t,ph)=>{
  const body="#bfe8ff", core="#7ac8ff";
  px(g,5,8,2,2,"#fff"); px(g,25,10,2,2,"#fff"); px(g,23,30,1,2,"#fff");
  px(g,12,4,8,2,"#fff");
  px(g,13,8,6,4,body);
  px(g,11,12,10,12,body); px(g,11,12,10,2,"#fff");
  px(g,13,15,6,6,core); px(g,15,16,2,4,"#fff");
  px(g,13,14,2,2,"#123"); px(g,17,14,2,2,"#123");
  px(g,9,26,14,4,body); px(g,11,28,10,2,core);
};
D.cloud_lamb = (g,t,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P);
  const wool="#f4f0e8", sh="#d8cfc0", eye="#222";
  px(g,22,4,4,3,"#ffe9a0"); px(g,23,3,2,1,"#fff");
  px(g,10+A.lx,28+A.ld,3,6,sh); px(g,19+A.rx,28+A.rd,3,6,sh);
  px(g,10+A.lx,33+A.ld,3,2,"#8a7a5a"); px(g,19+A.rx,33+A.rd,3,2,"#8a7a5a");
  px(g,8,18,16,11,wool); px(g,8,18,16,2,"#fff");
  px(g,9,16,3,3,wool); px(g,14,15,4,4,wool); px(g,20,16,3,3,wool);
  px(g,8,27,16,2,sh);
  px(g,20,12,8,9,"#fff"); px(g,22,15,2,2,eye); px(g,24,18,3,1,"#c9a95e");
  px(g,19,10,3,3,wool); px(g,26,10,3,3,wool);
  px(g,5,20,3,4,"#fff");
};
D.halo_finch = (g,t,ph)=>{
  const P=window.Anim.normP(ph);
  // wingbeats snap to whole pixels so the beat reads at 32px scale.
  const W2=Math.round(window.Anim.flap(P)*4);
  const y="#ffe9a0", yD="#e8b83e", eye="#222";
  px(g,12,6,8,2,"#f6d34e"); px(g,13,5,6,1,"#fff");
  // layered wings: covert + 2 feather rows with dark trailing edge
  px(g,3-W2,16,7,3,"#fff"); px(g,3-W2,19,7,3,"#f2ecdc"); px(g,3-W2,21,7,1,"#d8ccb0");
  px(g,3-W2,22,2,3,"#f2ecdc"); px(g,6-W2,22,2,3,"#e8e0cc"); px(g,9-W2,22,1,2,"#d8ccb0");
  px(g,22+W2,16,7,3,"#fff"); px(g,22+W2,19,7,3,"#f2ecdc"); px(g,22+W2,21,7,1,"#d8ccb0");
  px(g,22+W2,22,2,3,"#f2ecdc"); px(g,25+W2,22,2,3,"#e8e0cc"); px(g,28+W2,22,1,2,"#d8ccb0");
  px(g,14,29,4,4,yD);
  px(g,11,18,10,12,y); px(g,11,18,10,2,"#fff"); px(g,11,28,10,2,yD);
  px(g,14,20,4,8,"#fff8ea");
  px(g,13,21,2,2,eye); px(g,17,21,2,2,eye);
  px(g,15,23,2,2,"#e08a2e");
  px(g,13,30,2,2,"#c9962e"); px(g,17,30,2,2,"#c9962e");
};
D.petal_drake = (g,t,ph)=>{
  const P=window.Anim.normP(ph);
  const pink="#ffb0d0", pinkD="#e08aa8", cream="#fff", eye="#222";
  const flap = P.atk ? 2 : (P.moving ? (P.f % 2) : 0);
  px(g,2-flap,16,8,6,pink); px(g,2-flap,16,8,1,cream); px(g,3-flap,20,5,3,pinkD);
  px(g,22+flap,16,8,6,pink); px(g,22+flap,16,8,1,cream); px(g,24+flap,20,5,3,pinkD);
  px(g,4,27,7,4,pink); px(g,4,27,7,1,cream);
  px(g,10,23,12,8,pink); px(g,10,23,12,2,cream); px(g,10,29,12,1,pinkD);
  px(g,12,25,2,4,cream); px(g,17,25,2,4,cream);
  px(g,11,15,10,9,pink); px(g,11,15,10,1,cream);
  px(g,13,17,3,3,eye); px(g,18,17,2,2,eye); px(g,13,17,1,1,cream);
  px(g,12,11,3,5,pinkD); px(g,17,11,3,5,pinkD); px(g,14,9,4,3,cream);
};
D.sunbloom_tender = D.scroll_angel;
D.mist_choir = D.choir_angel;
D.brook_seraph = D.dawn_angel;
D.orchard_wisp = (g,t,ph)=>{
  const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
  // leaf-flutter on the move: shoulder leaves + head sprout bob a pixel
  // with the step cycle so the wisp reads as fluttering, not sliding
  const fl = P.moving ? (P.f % 2) : 0;
  const leaf="#5aa84e", leafD="#2e7d3a", leafL="#c8ffb0", glow="#fff8c8", eye="#123";
  g.fillStyle="rgba(200,255,176,0.20)"; g.beginPath(); g.ellipse(16,21+hb,11,12,0,0,7); g.fill();
  // leaf shoulders + head-leaf sprout (flutter offset when moving)
  px(g,5,16+hb-fl,5,4,leaf); px(g,5,16+hb-fl,5,1,leafL); px(g,22,16+hb+fl,5,4,leaf); px(g,22,16+hb+fl,5,1,leafL);
  px(g,14,2+hb-fl,4,4,leaf); px(g,14,2+hb-fl,4,1,leafL); px(g,15,0+hb-fl,2,2,leafD);
  // head: round apple-face with blush, joined to body by neck
  px(g,11,6+hb,10,9,leafL); px(g,11,6+hb,10,2,glow);
  px(g,13,8+hb,2,3,eye); px(g,17,8+hb,2,3,eye); px(g,13,8+hb,1,1,glow);
  px(g,12,11+hb,1,1,"#f0a090"); px(g,19,11+hb,1,1,"#f0a090");
  px(g,15,12+hb,2,1,leafD);
  px(g,13,15+hb,6,3,leaf); // neck joins head to torso
  // torso: tapered tunic with vine trim + glow core (no hard panel)
  px(g,11,18+hb,10,3,leaf); px(g,11,18+hb,10,1,leafL);
  px(g,12,21+hb,8,8,leaf); px(g,12,21+hb,2,8,leafD); px(g,18,21+hb,2,8,leafD);
  px(g,14,22+hb,4,5,glow); px(g,14,22+hb,4,1,"#fff"); px(g,15,23+hb,1,3,leafD);
  px(g,13,21+hb,1,8,leafL); px(g,18,21+hb,1,8,"#8ad98a"); // vine sides
  px(g,12,29+hb,8,2,leafD); // root hem
  // twig arms with leaf hands (leaves flutter opposite the shoulders)
  px(g,8,22+hb+fl,3,6,leaf); px(g,21,22+hb-fl,3,6,leaf);
  px(g,7,27+hb+fl,4,3,leafL); px(g,21,27+hb-fl,4,3,leafL);
  px(g,6,9+hb,2,2,"#fff"); px(g,24,12+hb,2,2,"#fff");
};
// GILDED STAG — antlered dawn grazer: branching tines, muzzle, gold flank bands.
D.gilded_stag = (g,t,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const gold=t||"#e8d090", dk="#8a6420", lite="#fff2c8", cream="#fffdf6", hoof="#3a2a12", eye="#1a1208";
  g.fillStyle="rgba(232,208,144,0.20)"; g.beginPath(); g.ellipse(16,22+hb,12,11,0,0,7); g.fill();
  // 4 legs: slender + joints + hooves (walk offsets)
  px(g,10+A.lx,27+A.ld,3,7,gold); px(g,18+A.rx,27+A.rd,3,7,gold);
  px(g,10+A.lx,27+A.ld,3,1,lite); px(g,18+A.rx,27+A.rd,3,1,lite);
  px(g,9+A.lx,33+A.ld,5,2,hoof); px(g,17+A.rx,33+A.rd,5,2,hoof);
  px(g,9+A.lx,33+A.ld,2,1,cream);
  // barrel body + light belly + flank bands
  px(g,8,18,16,10,gold); px(g,8,18,16,2,lite); px(g,8,26,16,2,dk);
  px(g,10,24,12,3,cream); px(g,10,24,12,1,lite);
  px(g,12,20,2,6,dk); px(g,16,20,2,6,dk); px(g,20,20,2,6,dk);
  px(g,12,20,2,1,lite); px(g,16,20,2,1,lite);
  // neck rising right + white tail puff left
  px(g,20,12,5,8,gold); px(g,20,12,5,1,lite); px(g,23,12,1,8,dk);
  px(g,5,19,3,4,cream); px(g,5,19,3,1,"#fff");
  // head: muzzle, nostril, jaw
  px(g,19,6,10,8,gold); px(g,19,6,10,2,lite);
  px(g,25,10,4,4,cream); px(g,25,10,4,1,"#fff"); px(g,27,11,1,2,dk);
  px(g,26,13,2,1,dk);
  // eye with catchlight + brow
  px(g,21,8,3,3,eye); px(g,21,8,1,1,"#fff"); px(g,22,9,1,1,lite);
  px(g,21,7,3,1,dk);
  // ear
  px(g,19,4,3,4,gold); px(g,19,4,3,1,lite); px(g,20,5,1,2,dk);
  // ANTLERS: main beams + 3 tines each (front grand, back hint)
  px(g,22,0,2,5,cream); px(g,22,0,2,1,"#fff");
  px(g,19,1,3,2,cream); px(g,25,1,3,2,cream);
  px(g,18,3,2,2,cream); px(g,26,3,2,2,cream); px(g,21,2,1,2,cream);
  px(g,27,0,2,4,lite); px(g,29,1,2,2,lite);
  // gold circlet between antlers + sparkles
  px(g,21,4,4,1,dk); px(g,22,4,2,1,"#f6d34e");
  px(g,4,8,1,1,lite); px(g,29,16,1,1,"#fff"); px(g,2,22,1,1,lite);
};
// CUMULUS MANTA — cloud-ray: scalloped wings, smiling face, puffs + tail whip.
D.cumulus_manta = (g,t,ph)=>{
  const P=window.Anim.normP(ph);
  const cloud=t||"#ffffff", sh="#b8d4e8", dk="#5a8ab0", belly="#e8f4ff", eye="#123";
  const flap=P.atk?2:(P.moving?(P.f%2):0);
  g.fillStyle="rgba(220,240,255,0.22)"; g.beginPath(); g.ellipse(16,22,14,10,0,0,7); g.fill();
  // wide wings: 3 scallop lobes + shaded trailing edge (flap with pose)
  px(g,0-flap,16,10,6,cloud); px(g,0-flap,16,10,1,"#fff");
  px(g,0-flap,20,8,3,cloud); px(g,1-flap,22,5,2,sh);
  px(g,22+flap,16,10,6,cloud); px(g,22+flap,16,10,1,"#fff");
  px(g,24+flap,20,8,3,cloud); px(g,26+flap,22,5,2,sh);
  // cloud puffs on wingtips
  px(g,1-flap,13,3,3,"#fff"); px(g,28+flap,13,3,3,"#fff");
  px(g,2-flap,12,2,1,"#fff"); px(g,28+flap,12,2,1,"#fff");
  // tail whip + tuft
  const sw=(P.moving?(P.f%2?1:-1):0);
  px(g,14+sw,28,4,6,cloud); px(g,15+sw,28,2,6,sh);
  px(g,12+sw,33,8,4,sh); px(g,13+sw,33,6,1,"#fff"); px(g,13+sw,36,6,1,dk);
  // body disc + face: eyes, smile, blush
  px(g,10,19,12,10,cloud); px(g,10,19,12,2,"#fff"); px(g,10,27,12,2,sh);
  px(g,12,24,8,3,belly);
  px(g,12,21,2,2,eye); px(g,18,21,2,2,eye);
  px(g,12,21,1,1,"#fff"); px(g,18,21,1,1,"#fff");
  px(g,14,24,4,1,dk); px(g,15,25,2,1,dk);
  px(g,11,23,1,1,"#f0a0a0"); px(g,20,23,1,1,"#f0a0a0");
  // gill slits + top shade
  px(g,13,26,1,1,sh); px(g,16,26,1,1,sh); px(g,19,26,1,1,sh);
  px(g,11,19,10,1,"#fff");
};
D.dawn_pilgrim = D.dawn_angel;
// LUMEN CUB — dawn lion-cub: mane ruff, big head, paws, halo ringlet, tail curl.
D.lumen_cub = (g,t,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const cream=t||"#fff2c0", mane="#e8b83e", maneD="#a87818", belly="#fffdf6", eye="#2a1a08";
  g.fillStyle="rgba(255,230,150,0.22)"; g.beginPath(); g.ellipse(16,22+hb,12,11,0,0,7); g.fill();
  // halo ringlet floating above
  px(g,12,0,8,2,"#f6d34e"); px(g,13,0,6,1,"#fff"); px(g,11,2,2,1,"#f6d34e"); px(g,19,2,2,1,"#f6d34e");
  // 4 paws + body
  px(g,9+A.lx,29+A.ld,4,5,cream); px(g,19+A.rx,29+A.rd,4,5,cream);
  px(g,9+A.lx,33+A.ld,4,2,maneD); px(g,19+A.rx,33+A.rd,4,2,maneD);
  px(g,9,22,14,9,cream); px(g,9,22,14,2,"#fff"); px(g,9,29,14,2,maneD);
  px(g,11,25,10,4,belly);
  // tail curl + tuft
  const sw=(P.moving?(P.f%2?1:-1):0);
  px(g,23+sw,26,4,4,cream); px(g,25+sw,24,3,3,mane); px(g,25+sw,24,3,1,"#fff");
  // MANE RUFF: scalloped ring around the head
  px(g,7,8,18,3,mane); px(g,7,8,18,1,"#fff2c8");
  px(g,7,8,3,12,mane); px(g,22,8,3,12,mane);
  px(g,7,17,18,3,mane); px(g,7,17,18,1,maneD);
  px(g,7,11,3,3,maneD); px(g,22,11,3,3,maneD); px(g,7,14,3,2,maneD); px(g,22,14,2,maneD);
  // round ears (dark-rimmed so they part from the mane)
  px(g,9,5,4,4,maneD); px(g,19,5,4,4,maneD);
  px(g,9,5,4,1,"#fff2c8"); px(g,19,5,4,1,"#fff2c8");
  px(g,10,6,2,2,cream); px(g,20,6,2,2,cream);
  // big head + face: eyes, nose, mouth, blush
  px(g,10+A.hx,8+hb,12,11,cream);
  px(g,10+A.hx,8+hb,12,2,"#fff");
  px(g,12+A.hx,11+hb,3,3,eye); px(g,17+A.hx,11+hb,3,3,eye);
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,15+A.hx,14+hb,2,2,"#8a5a33");
  px(g,14+A.hx,16+hb,4,1,"#8a5a33"); px(g,15+A.hx,17+hb,2,1,"#c98a6a");
  px(g,12+A.hx,14+hb,1,1,"#f0a090"); px(g,19+A.hx,14+hb,1,1,"#f0a0a0");
};
const prev = window.Sprites.actor;
const cache = new Map();
try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(()=>cache.clear()); } catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if (D[kind]){
    gen = (gen==="male"||gen==="female")?gen:"";
    let P=null, bk="";
    try { if (window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph);} else P=window.Anim.normP(null); } } catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck=kind+"|"+(tint||"#fff")+"|"+gen+bk;
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
