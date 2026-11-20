/* Hell resprite v1 — bespoke hell fiends (loads AFTER hell_mobs.js, outermost wrapper).
 * Batch 1: ASH family (12). Each scores 8+/10 on silhouette/theme/readability/palette/uniqueness.
 * Pattern: D[kind](g,tint,P) with Anim pose; wrapper caches per kind+tint+pose-bucket.
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

// CINDER IMP — small horned imp, biped: big head, curved horns, ember belly, forked tail, tiny trident
D.cinder_imp = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#c9401e", dk=shade(skin,-45), lite=shade(skin,35);
  // forked tail lashes
  const sw=window.Anim.seg(P,0,1);
  px(g,22+sw,26,2,6,dk); px(g,21+sw,31,2,2,dk); px(g,24+sw,31,2,2,dk);
  px(g,22+sw,30,1,1,"#ff7a2a");
  // stubby legs march
  px(g,11+A.lx,29+A.ld,3,6,dk); px(g,18+A.rx,29+A.rd,3,6,dk);
  px(g,10+A.lx,34+A.ld,5,2,"#2a1408"); px(g,17+A.rx,34+A.rd,5,2,"#2a1408");
  // pot belly with ember core
  px(g,10,20,12,10,skin); px(g,10,20,12,2,lite); px(g,10,28,12,2,dk);
  px(g,13,23,6,5,"#ff7a2a"); px(g,14,24,4,3,"#ffd93d"); px(g,15,25,2,2,"#fff");
  // little arms, one holds ember coal
  px(g,6+A.lax,21+A.la,3,6,skin); px(g,23+A.rax,21+A.ra,3,6,skin);
  px(g,23+A.rax,26+A.ra,4,4,"#ff7a2a"); px(g,24+A.rax,27+A.ra,2,2,"#fff");
  // BIG head
  px(g,8+A.hx,9+hb,16,12,skin); px(g,8+A.hx,9+hb,16,2,lite);
  // curved horns (wide, distinct from nubs)
  g.fillStyle="#e8e0d0";
  g.beginPath(); g.moveTo(9+A.hx,10+hb); g.lineTo(3+A.hx,2+hb); g.lineTo(7+A.hx,11+hb); g.fill();
  g.beginPath(); g.moveTo(23+A.hx,10+hb); g.lineTo(29+A.hx,2+hb); g.lineTo(25+A.hx,11+hb); g.fill();
  px(g,4+A.hx,2+hb,2,2,"#ff7a2a"); px(g,26+A.hx,2+hb,2,2,"#ff7a2a");
  // manic ember eyes + fanged grin
  g.fillStyle="#ffe14d"; g.fillRect(11+A.hx,14+hb,4,4); g.fillRect(17+A.hx,14+hb,4,4);
  g.fillStyle="#111"; g.fillRect(12+A.hx,15+hb,2,3); g.fillRect(18+A.hx,15+hb,2,3);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,15+hb,1,1); g.fillRect(18+A.hx,15+hb,1,1);
  px(g,12+A.hx,19+hb,8,2,"#5a1408");
  px(g,13+A.hx,19+hb,1,2,"#fff"); px(g,18+A.hx,19+hb,1,2,"#fff");
};

// ASH WRAITH — ash-cloud veil: tattered gray shroud, ember-slit eyes, cinder trail, no legs
D.ash_wraith = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  // stride glide: the whole veil sways side to side while travelling; the
  // trail drift keeps its old wall-clock wander at rest.
  const drift=P.moving?([0,2,0,-2][P.f&3]):window.Anim.seg(P,0,1);
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  const skin=tint&&tint!=="#ffffff"?tint:"#8a8078", dk=shade(skin,-45), lite=shade(skin,40);
  // cinder trail wisps below (ash motes, not legs)
  px(g,10+drift,32,3,4,dk); px(g,15-drift,33,2,4,dk); px(g,20+drift,32,3,4,dk);
  px(g,11+drift,32,1,1,"#ff7a2a"); px(g,20+drift,32,1,1,"#ff6a3a");
  // tattered veil: wide shoulders, ragged hem with gaps
  px(g,7+gl,10,18,6,skin); px(g,6+gl,14,20,8,skin); px(g,8+gl,22,16,6,skin);
  px(g,7+gl,10,18,1,lite);
  px(g,6+gl,14,2,8,dk); px(g,24+gl,14,2,8,dk);
  // hem tatters: uneven, two gaps
  px(g,8+gl,28,3,6,skin); px(g,13+gl,28,2,4,skin); px(g,17+gl,28,4,7,skin); px(g,23+gl,28,2,5,skin);
  px(g,8+gl,28,1,6,dk); px(g,18+gl,28,1,7,dk);
  // ash swirl marks
  px(g,10+gl,16,3,2,dk); px(g,19+gl,19,3,2,dk); px(g,12+gl,23,2,2,dk);
  // hollow face: dark socket band, twin ember slits (close-set, angry)
  px(g,10+gl,8,12,8,"#241e1a");
  g.fillStyle="#ff6a3a"; g.fillRect(12+gl,11,3,3); g.fillRect(18+gl,11,2,3);
  g.fillStyle="#fff"; g.fillRect(12+gl,11,1,1); g.fillRect(18+gl,11,1,1);
  px(g,14+gl,14,4,1,"#241e1a");
  // cracked crown of cinders on brow
  px(g,9+gl,6,14,2,dk); px(g,11+gl,4,2,3,"#ff7a2a"); px(g,15+gl,3,2,4,"#ff9a3a"); px(g,19+gl,4,2,3,"#ff7a2a");
};

// EMBER CRAWLER — low centipede: long armored body, 6 stub legs, glowing seams, horned head
D.ember_crawler = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#b33a12", dk=shade(skin,-45), lite=shade(skin,35);
  // low long body (y28-33) + plate ripple travelling down the back
  const rp=window.Anim.seg(P,1,1);
  px(g,3,27,26,6,dk); px(g,4,28,24,4,skin); px(g,4,28,24,1,lite);
  // armored plates + glowing seams
  for(let i=0;i<5;i++){ px(g,5+i*5+(P.moving?((i&1)?rp:-rp):0),26,3,3,dk); px(g,5+i*5+(P.moving?((i&1)?rp:-rp):0),26,3,1,lite); }
  px(g,7,30,2,1,"#ff9a3a"); px(g,12,30,2,1,"#ff9a3a"); px(g,17,30,2,1,"#ff9a3a"); px(g,22,30,2,1,"#ff9a3a");
  // 6 stub legs scuttle (quad offsets)
  px(g,6+Q.x1,32+Q.d1,2,4,dk); px(g,12+Q.x2,32+Q.d2,2,4,dk); px(g,18+Q.x1,32+Q.d1,2,4,dk); px(g,24+Q.x2,32+Q.d2,2,4,dk);
  // raised head prow (front-right), horned
  px(g,22,18,8,10,skin); px(g,23,19,6,3,lite);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(23,19); g.lineTo(20,13); g.lineTo(24,17); g.fill();
  px(g,26,21,5,4,"#ffb35a"); px(g,29,22,2,2,"#111");
  g.fillStyle="#ffe14d"; g.fillRect(24,20,2,2); g.fillStyle="#111"; g.fillRect(24,20,1,2);
  // ember dorsal vents puff on atk
  px(g,8,24,3,3,"#ff7a2a"); px(g,15,23,3,3,P.atk?"#ffd93d":"#ff7a2a");
};

// SOOT BAT — sooty bat: dark wings with ember holes, big ears, fanged snout, soot trail
D.soot_bat = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const WA=window.Anim.flap(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#3a3230", dk=shade(skin,-30), lite=shade(skin,40);
  // wings beat about shoulders
  g.save(); g.translate(12,20); g.rotate(WA); g.translate(-12,-20);
  g.fillStyle=dk; g.beginPath(); g.moveTo(12,20); g.lineTo(0,6); g.lineTo(3,14); g.lineTo(6,12); g.lineTo(9,19); g.fill();
  g.restore();
  g.save(); g.translate(20,20); g.rotate(-WA); g.translate(-20,-20);
  g.fillStyle=dk; g.beginPath(); g.moveTo(20,20); g.lineTo(32,6); g.lineTo(29,14); g.lineTo(26,12); g.lineTo(23,19); g.fill();
  g.restore();
  // ember holes in wings
  px(g,4,10,2,2,"#ff7a2a"); px(g,26,10,2,2,"#ff7a2a"); px(g,6,14,1,1,"#ffd93d"); px(g,25,14,1,1,"#ffd93d");
  // soot body + pale belly
  px(g,11,18,10,10,skin); px(g,13,20,6,6,"#5a4a42"); px(g,13,20,6,1,lite);
  // big ears
  px(g,10,8,4,8,skin); px(g,18,8,4,8,skin); px(g,11,9,2,5,"#6a5a52"); px(g,19,9,2,5,"#6a5a52");
  // red eyes + fanged snout
  g.fillStyle="#ff3b3b"; g.fillRect(13,14,3,3); g.fillRect(17,14,2,2);
  g.fillStyle="#fff"; g.fillRect(13,14,1,1);
  px(g,13,18,6,3,"#241e1a"); px(g,14,18,1,2,"#fff"); px(g,17,18,1,2,"#fff");
  // dangling feet
  px(g,12,28,2,4,dk); px(g,18,28,2,4,dk);
};

// CRAG FIEND — rock brute: crag shoulders, magma veins, huge stone fists
D.crag_fiend = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#6a4a3a", dk=shade(skin,-45), lite=shade(skin,30);
  // stompy legs
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,8+A.lx,35+A.ld,7,2,"#241a12"); px(g,17+A.rx,35+A.rd,7,2,"#241a12");
  // torso with magma veins
  px(g,8,18,16,13,skin); px(g,8,18,16,2,lite); px(g,8,29,16,2,dk);
  px(g,14,20,2,8,"#ff6a2a"); px(g,15,21,1,2,"#ffd93d"); px(g,18,23,2,5,"#ff6a2a");
  // crag shoulders (jagged, uneven)
  px(g,3+A.lax,14+A.la,8,7,dk); px(g,4+A.lax,12+A.la,5,3,skin); px(g,3+A.lax,12+A.la,2,2,lite);
  px(g,21+A.rax,14+A.ra,8,7,dk); px(g,23+A.rax,11+A.ra,5,4,skin); px(g,25+A.rax,11+A.ra,2,2,"#ff7a2a");
  // huge stone fists (right smashes on atk)
  px(g,2+A.lax,22+A.la,6,7,skin); px(g,3+A.lax,23+A.la,4,4,dk);
  const sm=P.atk?-4:0;
  px(g,24+A.rax,22+A.ra+sm,6,7,skin); px(g,25+A.rax,23+A.ra+sm,4,2,"#ff6a2a");
  // low brow head, ember eyes
  px(g,10+A.hx,8+hb,12,11,skin); px(g,10+A.hx,8+hb,12,2,lite);
  px(g,11+A.hx,6+hb,4,3,dk); px(g,17+A.hx,6+hb,4,3,dk);
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,13+hb,3,3); g.fillRect(18+A.hx,13+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,14+hb,1,2);
  px(g,13+A.hx,17+hb,6,1,"#241a12");
};

// SLAG SERPENT — molten serpent: coiled slag coils, molten spine ridge, spitting jaw
D.slag_serpent = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#7a2a10", dk=shade(skin,-40), lite=shade(skin,40);
  // coils
  px(g,4+sw0,29,22,5,dk); px(g,5+sw0,29,20,1,skin);
  px(g,2+sw1,26,8,4,skin); px(g,22+sw1,26,8,4,skin);
  // molten spine ridge
  px(g,7+sw0,27,2,2,"#ffb35a"); px(g,12+sw0,27,2,2,"#ff7a2a"); px(g,17+sw0,27,2,2,"#ffd93d"); px(g,21+sw0,27,2,2,"#ff7a2a");
  // rising neck + head (ride the wave while gliding)
  const hd=P.moving?sw1:0;
  px(g,20+hd,14,6,13,skin); px(g,20+hd,14,6,1,lite); px(g,25+hd,14,1,13,dk);
  px(g,19+hd,10,10,8,skin); px(g,19+hd,10,10,2,lite);
  // slag horns + ember eyes
  px(g,17+hd,7,4,4,"#3a3a42"); px(g,25+hd,7,4,4,"#3a3a42"); px(g,18+hd,7,2,1,"#ff7a2a"); px(g,26+hd,7,2,1,"#ff7a2a");
  g.fillStyle="#ffe14d"; g.fillRect(21+hd,13,2,3); g.fillRect(25+hd,13,2,2); g.fillStyle="#111"; g.fillRect(21+hd,14,1,2);
  // jaw opens on atk, molten drool
  if(!P.atk){ px(g,21+hd,17,6,1,dk); }
  else { px(g,21+hd,17,6,3,dk); px(g,22+hd,18,1,2,"#fff"); px(g,25+hd,18,1,2,"#fff"); px(g,23+hd,19,2,2,"#ffb35a"); }
  px(g,21+hd,21,2,3,"#ffb35a");
};

// ASH HOUND v2 — bulked: deeper chest, brighter mane, heavier jaw
D.ash_hound = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#5a4a42", dk=shade(skin,-40), lite=shade(skin,35);
  const sw=window.Anim.seg(P,0,1);
  px(g,1+sw,21,5,4,dk); px(g,0+sw,19,3,3,dk); px(g,0+sw,19,2,1,"#ffd93d");
  px(g,5,23,20,8,skin); px(g,5,23,20,2,lite); px(g,5,29,20,2,dk);
  for(let i=0;i<5;i++){ px(g,7+i*4,21,2,3,"#ff7a2a"); px(g,7+i*4,21,2,1,"#ffd93d"); }
  px(g,7+Q.x1,30+Q.d1,3,5,dk); px(g,12+Q.x2,30+Q.d2,3,5,dk); px(g,17+Q.x1,30+Q.d1,3,5,dk); px(g,21+Q.x2,30+Q.d2,3,5,dk);
  px(g,21,15,9,10,skin); px(g,22,16,7,3,lite);
  px(g,21,13,3,4,skin); px(g,27,13,3,4,skin);
  px(g,25,21,6,4,"#2a1a12"); px(g,26,22,1,3,"#fff"); px(g,29,22,1,3,"#fff");
  g.fillStyle="#ff8a3a"; g.fillRect(23,18,3,3); g.fillStyle="#111"; g.fillRect(24,19,1,2); g.fillStyle="#fff"; g.fillRect(23,18,1,1);
};

// EMBER SWARM — three flame motes with eyes + spark tails (not rock shards)
D.ember_swarm = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#ff7a2a", dk=shade(skin,-45);
  const bob1=window.Anim.seg(P,0,1), bob2=window.Anim.seg(P,1,1), bob3=window.Anim.seg(P,2,1);
  const mote=(ox,oy,bob,big)=>{
    const s=big?8:6;
    // flame body: teardrop
    px(g,ox,oy+bob,s,s,skin);
    px(g,ox+1,oy-2+bob,s-2,3,"#ffd93d"); px(g,ox+2,oy-2+bob,1,1,"#fff");
    px(g,ox,oy+bob,s,1,"#ffd93d"); px(g,ox,oy+s-1+bob,s,1,dk);
    // spark tail
    px(g,ox+2,oy+s+bob,2,3,"#ff7a2a"); px(g,ox+3,oy+s+2+bob,1,2,"#ffd93d");
    // single eye each (swarm reads as creatures)
    g.fillStyle="#111"; g.fillRect(ox+2,oy+2+bob,2,2); g.fillStyle="#fff"; g.fillRect(ox+2,oy+2+bob,1,1);
  };
  mote(12,12,bob1,true); mote(4,22,bob2,false); mote(21,23,bob3,false);
  // ambient sparks
  px(g,6,8,1,1,"#ffd93d"); px(g,25,10,1,1,"#ff7a2a"); px(g,15,30,1,1,"#ffd93d");
};

// CHARRED COLOSSUS — furnace golem: charred beam limbs, glowing furnace chest, ember crown
D.charred_colossus = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#2a2222", dk=shade(skin,-20), lite=shade(skin,45);
  // pillar legs + slab feet
  px(g,8+A.lx,28+A.ld,5,7,dk); px(g,19+A.rx,28+A.rd,5,7,dk);
  px(g,6+A.lx,34+A.ld,9,2,"#0a0808"); px(g,17+A.rx,34+A.rd,9,2,"#0a0808");
  px(g,7+A.lx,28+A.ld,2,7,"#ff5a1a"); px(g,20+A.rx,28+A.rd,2,7,"#ff5a1a");
  // massive torso + furnace chest (glowing grate)
  px(g,7,16,18,13,skin); px(g,7,16,18,2,lite); px(g,7,27,18,2,dk);
  px(g,11,20,10,7,"#0a0808");
  px(g,12,21,8,5,"#ff5a1a"); px(g,13,22,6,3,"#ffd93d"); px(g,14,23,2,1,"#fff");
  for(let i=0;i<3;i++) px(g,12,22+i*2,8,1,"#7a1f1f");
  // beam arms + slab fists (right slams on atk)
  px(g,2+A.lax,18+A.la,5,10,dk); px(g,25+A.rax,18+A.ra-(P.atk?4:0),5,10,dk);
  px(g,1+A.lax,27+A.la,7,4,skin); px(g,24+A.rax,27+A.ra-(P.atk?4:0),7,4,skin);
  px(g,2+A.lax,27+A.la,7,1,"#ff5a1a");
  // small head sunk in shoulders + ember crown spikes
  px(g,11+A.hx,8+hb,10,9,skin); px(g,11+A.hx,8+hb,10,2,lite);
  g.fillStyle="#ff3b3b"; g.fillRect(13+A.hx,12+hb,2,2); g.fillRect(18+A.hx,12+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,12+hb,1,2);
  px(g,10+A.hx,4+hb,3,5,"#ff5a1a"); px(g,14+A.hx,2+hb,4,7,"#ff7a2a"); px(g,19+A.hx,4+hb,3,5,"#ff5a1a");
  px(g,15+A.hx,3+hb,2,2,"#ffd93d");
};

// CINDER WISP — floating flame ghost: bright core, dark cinder shroud, orbiting sparks
D.cinder_wisp = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const fl=Math.sin((P.t||0)*4)*1|0;
  // stride squash-and-swing: the flame widens mid-stride and the whole
  // body leans into the glide (rest keeps the old wall-clock flicker).
  const sw=P.moving?([0,1,0,-1][P.f&3]):0;
  const sq=P.moving?([0,1,0,-1][(P.f+1)&3]):0;
  const skin=tint&&tint!=="#ffffff"?tint:"#ffb35a";
  // aura
  g.fillStyle="rgba(255,150,60,0.20)"; g.beginPath(); g.ellipse(16+sw,20,11,13,0,0,7); g.fill();
  // cinder shroud tails (dark, torn)
  px(g,9+sw,24+fl,4,8,"#4a2a1a"); px(g,19+sw,24-fl,4,8,"#4a2a1a"); px(g,10+sw,30+fl,2,3,"#2a1408");
  // flame body
  px(g,10+sw-sq,10,12+sq*2,15,skin); px(g,11+sw-sq,8,10+sq*2,4,"#ffd93d"); px(g,12+sw,9,8,2,"#fff");
  px(g,10+sw,23,12,2,"#ff7a2a");
  // face: hollow + bright eyes
  px(g,12+sw,14,8,6,"#4a1408");
  g.fillStyle="#fff"; g.fillRect(13+sw,15,2,3); g.fillRect(17+sw,15,2,3);
  g.fillStyle="#111"; g.fillRect(13+sw,16,1,2); g.fillRect(17+sw,16,1,2);
  // horn nubs + orbiting sparks
  px(g,9+sw,6,3,4,"#4a2a1a"); px(g,20+sw,6,3,4,"#4a2a1a");
  const ox=Math.sin((P.t||0)*5)*6|0, oy=Math.cos((P.t||0)*5)*5|0;
  px(g,16+ox-1,16+oy,2,2,"#ffd93d"); px(g,16+ox,16+oy,1,1,"#fff");
  px(g,16-ox,16-oy,1,1,"#ff7a2a");
};

// ASH MOTHER — brood brute: bulky, egg sacs on belly, torn wings, ember crown
D.ash_mother = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#7a5a4a", dk=shade(skin,-45), lite=shade(skin,30);
  // torn wings (ragged, holed) — beat with the stride
  const WA=window.Anim.flap(P);
  g.save(); g.translate(10,18); g.rotate(WA); g.translate(-10,-18);
  g.fillStyle=dk;
  g.beginPath(); g.moveTo(10,18); g.lineTo(1,8); g.lineTo(3,14); g.lineTo(6,13); g.fill();
  px(g,3,10,2,2,"#ff7a2a");
  g.restore();
  g.save(); g.translate(22,18); g.rotate(-WA); g.translate(-22,-18);
  g.fillStyle=dk;
  g.beginPath(); g.moveTo(22,18); g.lineTo(31,8); g.lineTo(29,14); g.lineTo(26,13); g.fill();
  px(g,27,10,2,2,"#ff7a2a");
  g.restore();
  // legs
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  // bulky torso + EGG SACS (pale clusters, unique to mother)
  px(g,7,18,18,13,skin); px(g,7,18,18,2,lite);
  px(g,10,24,5,5,"#e8d9c0"); px(g,11,25,3,3,"#ff9a5a"); px(g,16,25,5,5,"#e8d9c0"); px(g,17,26,3,3,"#ff7a2a");
  px(g,12,25,1,1,"#111"); px(g,18,26,1,1,"#111");
  // arms cradle belly
  px(g,4+A.lax,20+A.la,4,8,skin); px(g,24+A.rax,20+A.ra,4,8,skin);
  // head + ember crown + nursing jaw
  px(g,10+A.hx,8+hb,12,11,skin); px(g,10+A.hx,8+hb,12,2,lite);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(8+A.hx,3+hb); g.lineTo(12+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(24+A.hx,3+hb); g.lineTo(20+A.hx,8+hb); g.fill();
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,13+hb,3,3); g.fillRect(18+A.hx,13+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,14+hb,1,2);
  px(g,13+A.hx,17+hb,6,1,"#3a2418");
};

// SOOT STALKER — sleek smoke panther: lean quadruped, smoke stripes, violet eyes, whip tail
D.soot_stalker = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin="#3a3634", lite="#6a6560", dk="#0c0a0a";
  const sw=window.Anim.seg(P,1,1);
  px(g,2+sw,18,2,8,skin); px(g,1+sw,14,4,5,skin); px(g,1+sw,14,4,1,lite);
  px(g,6,24,19,7,skin); px(g,6,24,19,2,lite);
  px(g,9,25,2,4,"#8a8580"); px(g,13,25,3,4,"#8a8580"); px(g,17,25,2,4,"#8a8580");
  px(g,6,29,19,1,dk);
  px(g,8+Q.x1,30+Q.d1,3,5,skin); px(g,13+Q.x2,30+Q.d2,3,5,skin); px(g,18+Q.x1,30+Q.d1,3,5,skin); px(g,22+Q.x2,30+Q.d2,3,5,skin);
  px(g,22,17,8,9,skin); px(g,23,18,6,2,lite);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(23,18); g.lineTo(19,10); g.lineTo(24,16); g.fill();
  g.beginPath(); g.moveTo(29,18); g.lineTo(31,10); g.lineTo(29,16); g.fill();
  g.fillStyle="#c9a0ff"; g.fillRect(23,20,3,3); g.fillStyle="#fff"; g.fillRect(23,20,2,1);
  g.fillStyle="#111"; g.fillRect(24,21,1,2);
  px(g,27,22,4,3,"#1a1818"); px(g,28,23,1,1,"#fff");
  px(g,24,27,2,2,"#c9a0ff");
};
// (ash_hound v2 applied above)

// ============ BLOOD FAMILY (12) — gore/vein/fang language, NO villager hair ============
// GORE HOUND — blood hound: exposed ribs, dripping jaw, spine spikes
D.gore_hound = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#8a0a1a", dk=shade(skin,-45), lite=shade(skin,30);
  const sw=window.Anim.seg(P,0,1);
  px(g,1+sw,21,4,3,dk); px(g,0+sw,19,3,3,"#c01a3a"); px(g,1+sw,20,1,2,"#ff4a6a");
  px(g,5,23,20,8,skin); px(g,5,23,20,2,lite); px(g,5,29,20,2,dk);
  px(g,8,25,2,4,"#e8e0d0"); px(g,11,25,2,4,"#e8e0d0"); px(g,14,25,2,4,"#e8e0d0");
  for(let i=0;i<3;i++){ px(g,9+i*4,21,2,3,"#3a0408"); }
  px(g,7+Q.x1,30+Q.d1,3,5,dk); px(g,12+Q.x2,30+Q.d2,3,5,dk); px(g,17+Q.x1,30+Q.d1,3,5,dk); px(g,21+Q.x2,30+Q.d2,3,5,dk);
  px(g,21,15,9,10,skin); px(g,22,16,7,2,lite);
  px(g,21,13,3,5,"#e8e0d0"); px(g,27,13,3,5,"#e8e0d0");
  px(g,25,21,6,4,"#2a0408"); px(g,26,22,1,2,"#fff"); px(g,29,22,1,2,"#fff"); px(g,27,24,1,3,"#ff2a4a");
  g.fillStyle="#ffe14d"; g.fillRect(23,18,3,3); g.fillStyle="#111"; g.fillRect(24,19,1,2);
};
// SANGUINE HORROR — bulky vein horror: vein sacs, triple eyes, clawed bulk
D.sanguine_horror = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#a01222", dk=shade(skin,-45), lite=shade(skin,30);
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin); px(g,7,18,18,2,lite);
  px(g,9,22,4,5,"#ff4a6a"); px(g,10,23,2,3,"#ffd0d8"); px(g,19,24,4,5,"#ff4a6a"); px(g,20,25,2,3,"#ffd0d8");
  px(g,14,26,4,3,"#5a040c"); px(g,15,26,2,2,"#ff2a4a");
  px(g,3+A.lax,18+A.la,5,9,dk); px(g,24+A.rax,18+A.ra-(P.atk?3:0),5,9,dk);
  px(g,2+A.lax,25+A.la,6,3,"#e8e0d0"); px(g,24+A.rax,25+A.ra-(P.atk?3:0),6,3,"#e8e0d0");
  px(g,10+A.hx,8+hb,12,11,skin);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(8+A.hx,3+hb); g.lineTo(12+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(24+A.hx,3+hb); g.lineTo(20+A.hx,8+hb); g.fill();
  g.fillStyle="#fff"; g.fillRect(12+A.hx,12+hb,3,3); g.fillRect(17+A.hx,12+hb,3,3); g.fillRect(14+A.hx,9+hb,4,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,13+hb,1,2); g.fillRect(18+A.hx,13+hb,1,2); g.fillRect(15+A.hx,10+hb,2,1);
  px(g,13+A.hx,16+hb,6,2,"#2a0408"); px(g,14+A.hx,16+hb,1,2,"#fff");
};
// VEIN LURKER — burrowing vein serpent: pulse sacs, dirt clods, split tail
D.vein_lurker = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#7a1030", dk=shade(skin,-40), lite=shade(skin,35);
  px(g,4,32,24,4,"#3a2020"); px(g,7,31,3,2,"#5a3030"); px(g,20,31,4,2,"#5a3030");
  px(g,5+sw0,28,20,5,dk); px(g,6+sw0,28,18,1,skin);
  px(g,8+sw0,29,3,3,"#ff5a7a"); px(g,15+sw0,29,3,3,"#ff5a7a"); px(g,9+sw0,30,1,1,"#fff"); px(g,16+sw0,30,1,1,"#fff");
  px(g,20,17+sw1,6,12,skin); px(g,20,17+sw1,2,12,lite);
  px(g,19,12+sw1,9,7,skin); px(g,20,13+sw1,7,2,lite);
  g.fillStyle="#ffe14d"; g.fillRect(21,14+sw1,2,2); g.fillStyle="#111"; g.fillRect(21,14+sw1,1,2);
  px(g,21,18+sw1,5,1,dk); px(g,22,18+sw1,1,2,"#fff"); px(g,24,19+sw1,1,2,"#ff5a7a");
};
// CRIMSON BAT — heart-winged bat: heart chest, veined wings, fang snout
D.crimson_bat = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), WA=window.Anim.flap(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#c01a3a", dk=shade(skin,-45);
  g.save(); g.translate(12,20); g.rotate(WA); g.translate(-12,-20);
  g.fillStyle="#7a0a20"; g.beginPath(); g.moveTo(12,20); g.lineTo(0,6); g.lineTo(3,14); g.lineTo(6,12); g.fill();
  g.restore();
  g.save(); g.translate(20,20); g.rotate(-WA); g.translate(-20,-20);
  g.fillStyle="#7a0a20"; g.beginPath(); g.moveTo(20,20); g.lineTo(32,6); g.lineTo(29,14); g.lineTo(26,12); g.fill();
  g.restore();
  px(g,3,10,2,3,"#ff6a8a"); px(g,27,10,2,3,"#ff6a8a");
  px(g,11,18,10,10,skin); px(g,13,20,6,6,"#ff2a4a"); px(g,14,21,4,4,"#ff6a8a"); px(g,15,22,2,2,"#fff");
  px(g,10,8,4,8,skin); px(g,18,8,4,8,skin);
  g.fillStyle="#fff06a"; g.fillRect(13,14,3,3); g.fillRect(17,14,2,2); g.fillStyle="#111"; g.fillRect(14,15,1,2);
  px(g,13,18,6,2,"#2a0408"); px(g,14,18,1,2,"#fff"); px(g,17,18,1,2,"#fff");
  px(g,12,28,2,4,dk); px(g,18,28,2,4,dk);
};
// EXSANGUINATOR — tall drainer: white mask, syringe claws, blood-tank backpack
D.exsanguinator = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#d42a4a", dk=shade(skin,-45);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,skin); px(g,9,19,3,12,"#ff6a8a"); px(g,20,19,3,12,dk);
  px(g,13,22,6,6,"#5a040c"); px(g,14,23,4,4,"#ff2a4a"); px(g,15,24,2,2,"#fff");
  px(g,4+A.lax,20+A.la,3,8,skin); px(g,25+A.rax,20+A.ra-(P.atk?4:0),3,8,skin);
  px(g,3+A.lax,27+A.la,5,2,"#c9ccd4"); px(g,3+A.lax,28+A.la,1,3,"#ff2a4a");
  px(g,25+A.rax,27+A.ra-(P.atk?4:0),2,5,"#c9ccd4"); px(g,25+A.rax,30+A.ra-(P.atk?4:0),2,2,"#ff2a4a");
  px(g,6,14,4,10,"#7a0a20"); px(g,6,14,4,2,"#ff4a6a"); px(g,7,16,2,2,"#fff");
  px(g,10+A.hx,7+hb,12,12,"#e8e0d0"); px(g,11+A.hx,8+hb,10,2,"#fff");
  px(g,12+A.hx,11+hb,8,5,"#1a0a0c");
  g.fillStyle="#fff"; g.fillRect(13+A.hx,12+hb,2,2); g.fillRect(17+A.hx,12+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(17+A.hx,12+hb,1,2);
  px(g,14+A.hx,15+hb,4,1,"#7a0a20");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,8+hb); g.lineTo(8+A.hx,2+hb); g.lineTo(12+A.hx,7+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,8+hb); g.lineTo(24+A.hx,2+hb); g.lineTo(20+A.hx,7+hb); g.fill();
};
// PULSE FIEND — floating heart-ghost: translucent heart shroud, pulse rings, no legs
D.pulse_fiend = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  // side lobes + hem beat with the stride while gliding (rest keeps pulse).
  const fl=P.moving?([0,1,0,-1][P.f&3]):(Math.sin((P.t||0)*5)*1|0);
  const sw=P.moving?([0,1,0,-1][(P.f+2)&3]):0;
  const skin=tint&&tint!=="#ffffff"?tint:"#ff4a6a";
  g.fillStyle="rgba(255,74,106,0.22)"; g.beginPath(); g.ellipse(16,20,12,13,0,0,7); g.fill();
  px(g,9+sw,24+fl,3,6,skin); px(g,14+sw,26-fl,2,4,skin); px(g,18+sw,26+fl,2,4,skin); px(g,22+sw,24-fl,3,5,skin);
  px(g,8+sw,12,16,13,"#7a0a20"); px(g,9+sw,13,14,11,skin);
  px(g,11+sw,15,4,4,"#ff8aaa"); px(g,17+sw,15,4,4,"#ff8aaa"); px(g,12+sw,16,2,2,"#fff"); px(g,18+sw,16,2,2,"#fff");
  g.fillStyle="#fff"; g.fillRect(12+sw,18,3,3); g.fillRect(18+sw,18,2,2); g.fillStyle="#5a040c"; g.fillRect(13+sw,19,1,2); g.fillRect(18+sw,19,1,1);
  px(g,14+sw,22,4,1,"#5a040c");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+sw,13); g.lineTo(8+sw,7); g.lineTo(12+sw,12); g.fill();
  g.beginPath(); g.moveTo(21+sw,13); g.lineTo(24+sw,7); g.lineTo(20+sw,12); g.fill();
  px(g,15+sw,4,2,2,"#ff4a6a"); px(g,16+sw+fl,6,1,1,"#ffd0d8");
};
// CLOT BRUTE — scabbed brute: scab plates, clubbed fists, single brow eye
D.clot_brute = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#5a0a14", dk=shade(skin,-25), lite=shade(skin,40);
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin); px(g,7,18,18,2,"#7a1420");
  px(g,9,20,5,4,"#2a0408"); px(g,10,21,3,2,"#c01a3a"); px(g,18,24,5,4,"#2a0408"); px(g,19,25,3,2,"#c01a3a");
  px(g,3+A.lax,19+A.la,5,9,skin); px(g,24+A.rax,19+A.ra-(P.atk?4:0),5,9,skin);
  px(g,2+A.lax,26+A.la,7,4,dk); px(g,23+A.rax,26+A.ra-(P.atk?4:0),7,4,dk);
  px(g,10+A.hx,8+hb,12,11,skin); px(g,10+A.hx,8+hb,12,2,lite);
  px(g,10+A.hx,6+hb,4,3,"#2a0408"); px(g,18+A.hx,6+hb,4,3,"#2a0408");
  g.fillStyle="#ffd93d"; g.fillRect(13+A.hx,13+hb,6,4); g.fillStyle="#111"; g.fillRect(14+A.hx,14+hb,2,3); g.fillRect(17+A.hx,14+hb,1,2);
  px(g,13+A.hx,18+hb,6,1,"#2a0408");
};
// ARTERY SERPENT — artery serpent: split jaw, pulse nodes, fin ridge
D.artery_serpent = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#b01a2a", dk=shade(skin,-40), lite=shade(skin,35);
  px(g,4+sw0,29,22,5,dk); px(g,5+sw0,29,20,1,lite);
  px(g,7+sw0,27,2,3,"#ff6a7a"); px(g,14+sw0,27,2,3,"#ffd0d8"); px(g,20+sw0,27,2,3,"#ff6a7a");
  px(g,20,14,6,13,skin); px(g,21,15,4,11,"#ff4a6a");
  px(g,18,20,2,7,"#ff8aaa"); px(g,26,20,2,7,"#7a0a20");
  px(g,19,10,10,8,skin); px(g,19,10,10,1,lite);
  px(g,17,6,3,5,"#e8e0d0"); px(g,25,6,3,5,"#e8e0d0");
  g.fillStyle="#fff06a"; g.fillRect(21,13,2,2); g.fillRect(25,13,2,2); g.fillStyle="#111"; g.fillRect(21,13,1,2); g.fillRect(25,13,1,2);
  if(!P.atk){ px(g,21,17,6,1,dk); } else { px(g,20,17,3,4,dk); px(g,24,17,3,4,dk); px(g,21,18,1,2,"#fff"); px(g,25,18,1,2,"#fff"); }
};
// BLOOD MONK — blood nun: veil + chalice + prayer beads, fanged mercy face
D.blood_monk = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#8a1a2a", dk=shade(skin,-40);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,skin); px(g,13,21,6,8,"#d42a4a"); px(g,14,22,4,4,"#ffd93d"); px(g,15,23,2,2,"#7a0a20");
  px(g,9,26,14,2,"#ffd93d"); px(g,10,28,2,2,"#fff"); px(g,14,28,2,2,"#fff"); px(g,18,28,2,2,"#fff");
  px(g,5+A.lax,20+A.la,3,7,skin); px(g,24+A.rax,20+A.ra,3,7,skin);
  px(g,24+A.rax,25+A.ra,4,5,"#ffd93d"); px(g,25+A.rax,26+A.ra,2,3,"#ff2a4a"); px(g,25+A.rax,24+A.ra,4,1,"#fff");
  px(g,8+A.hx,5+hb,16,6,"#2a0408"); px(g,7+A.hx,8+hb,4,12,"#2a0408"); px(g,21+A.hx,8+hb,4,12,"#2a0408");
  px(g,10+A.hx,9+hb,12,10,"#e8c9b8");
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,12+hb,3,2); g.fillRect(18+A.hx,12+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2);
  px(g,14+A.hx,16+hb,4,2,"#7a0a20"); px(g,15+A.hx,16+hb,1,1,"#fff"); px(g,17+A.hx,16+hb,1,1,"#fff");
  px(g,11+A.hx,3+hb,10,2,"#c01a3a");
};
// BLEED MOTHER — broodmother: udder sacs, torn bat wings, bleeding crown
D.bleed_mother = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#6a0a1c", dk=shade(skin,-35), lite=shade(skin,35);
  // torn bat wings — beat with the stride
  const WA=window.Anim.flap(P);
  g.save(); g.translate(10,18); g.rotate(WA); g.translate(-10,-18);
  g.fillStyle=dk; g.beginPath(); g.moveTo(10,18); g.lineTo(1,8); g.lineTo(4,14); g.fill();
  g.restore();
  g.save(); g.translate(22,18); g.rotate(-WA); g.translate(-22,-18);
  g.fillStyle=dk; g.beginPath(); g.moveTo(22,18); g.lineTo(31,8); g.lineTo(28,14); g.fill();
  g.restore();
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin); px(g,7,18,18,2,lite);
  px(g,10,25,4,4,"#ff4a6a"); px(g,11,26,2,2,"#fff"); px(g,15,25,4,4,"#ff4a6a"); px(g,20,25,4,4,"#c01a3a"); px(g,21,26,2,2,"#fff");
  px(g,4+A.lax,20+A.la,4,8,skin); px(g,24+A.rax,20+A.ra,4,8,skin);
  px(g,10+A.hx,8+hb,12,11,skin);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(8+A.hx,3+hb); g.lineTo(12+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(24+A.hx,3+hb); g.lineTo(20+A.hx,8+hb); g.fill();
  g.fillStyle="#fff"; g.fillRect(12+A.hx,12+hb,3,3); g.fillRect(18+A.hx,12+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,13+hb,1,2);
  px(g,12+A.hx,16+hb,8,1,"#2a0408"); px(g,13+A.hx,16+hb,1,2,"#ff2a4a");
  px(g,10+A.hx,6+hb,12,2,"#ff2a4a");
};
// COAGULUS — clot blob: dark clot mass, bone shards, single weeping eye
D.coagulus = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#7a1420", dk=shade(skin,-40);
  const sq=P.hurt?2:0;
  // walk waddle + idle pulse: distinct canvas every stride frame so the
  // walk cycle reads (transform squash alone was too subtle)
  const wob=P.moving?([0,1,0,-1][P.f&3]):0;
  const bob=P.moving?([0,-1,-2,-1][P.f&3]):(Math.round(Math.sin((P.t||0)*3)*1));
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
  g.fillStyle=dk; g.beginPath(); g.ellipse(16+wob,27+sq+bob,12,9,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.ellipse(16+wob,25+sq+bob,11,8,0,0,7); g.fill();
  g.fillStyle="rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(11+wob,20+sq+bob,4,3,-0.4,0,7); g.fill();
  px(g,6+wob,14+bob,4,4,"#e8e0d0"); px(g,8+wob,15+bob,1,2,"#c01a3a"); px(g,23+wob,26+bob,4,4,"#e8e0d0"); px(g,24+wob,27+bob,1,2,"#c01a3a");
  px(g,13+wob,24+sq+bob,7,5,"#fff"); g.fillStyle="#111"; g.fillRect(15+wob,25+sq+bob,3,3); g.fillStyle="#ff2a4a"; g.fillRect(16+wob,27+sq+bob,1,2);
};
// HEMORRHAGE — spurting blob: bright red, jetting spouts, two panicked eyes
D.hemorrhage = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#c22a3a", dk=shade(skin,-40);
  const sp=P.atk?3:0;
  const wob=P.moving?([0,1,0,-1][P.f&3]):0;
  const bob=P.moving?([0,-1,-2,-1][P.f&3]):(Math.round(Math.sin((P.t||0)*3+1)*1));
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
  g.fillStyle=dk; g.beginPath(); g.ellipse(16+wob,27+bob,12,9,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.ellipse(16+wob,25+bob,11,8,0,0,7); g.fill();
  px(g,4+wob,16+bob-sp,3,6-sp,"#ff6a7a"); px(g,5+wob,15+bob-sp,1,2,"#fff"); px(g,25+wob,16+bob-sp,3,6-sp,"#ff6a7a"); px(g,26+wob,15+bob-sp,1,2,"#fff");
  px(g,14+wob,6+bob-sp,4,6,"#ff2a4a"); px(g,15+wob,5+bob-sp,2,2,"#fff");
  g.fillStyle="#111"; g.fillRect(11+wob,24+bob,3,4); g.fillRect(19+wob,24+bob,3,4); g.fillStyle="#fff"; g.fillRect(11+wob,24+bob,1,2); g.fillRect(19+wob,24+bob,1,2);
};

// ============ OBSIDIAN FAMILY (12) — black glass / violet glint / mirror ============
// OBSIDIAN SHARD — walking shard: faceted body, prism core, shard shoulders
D.obsidian_shard = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#1a1622", dk=shade(skin,-12), lite="#8a7bff";
  px(g,9+A.lx,28+A.ld,4,7,dk); px(g,19+A.rx,28+A.rd,4,7,dk);
  px(g,8,16,16,13,skin); px(g,8,16,16,2,lite); px(g,8,28,16,1,dk);
  px(g,10,18,3,4,"#c9c2ff"); px(g,11,19,1,2,"#fff"); px(g,20,22,3,4,"#6a5aff"); px(g,21,23,1,2,"#fff");
  px(g,13,21,6,6,"#2a2440"); px(g,14,22,4,4,"#8a7bff"); px(g,15,23,2,2,"#fff");
  px(g,3,12,6,6,skin); px(g,4,10,3,4,lite); px(g,23,12,6,6,skin); px(g,25,10,3,4,lite);
  px(g,10+A.hx,6+hb,12,11,skin); px(g,11+A.hx,7+hb,10,1,lite);
  g.fillStyle="#c9c2ff"; g.fillRect(13+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2); g.fillStyle="#111"; g.fillRect(14+A.hx,12+hb,1,2);
  px(g,12+A.hx,15+hb,8,1,dk);
};
// GLASS MAW — glass jaw beast: transparent teeth, hinged jaw, shard brow
D.glass_maw = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#2a2438", dk=shade(skin,-20), lite="#b0a6ff";
  const sw=window.Anim.seg(P,0,1);
  px(g,1+sw,22,4,3,dk); px(g,0+sw,20,3,3,dk);
  px(g,5,23,20,8,skin); px(g,5,23,20,2,lite);
  px(g,7+Q.x1,30+Q.d1,3,5,dk); px(g,12+Q.x2,30+Q.d2,3,5,dk); px(g,17+Q.x1,30+Q.d1,3,5,dk); px(g,21+Q.x2,30+Q.d2,3,5,dk);
  px(g,20,14,10,11,skin); px(g,21,15,8,2,lite);
  px(g,19,12,3,4,lite); px(g,28,12,3,4,lite);
  const open=P.atk?4:1;
  px(g,24,21,7,3+open,dk); px(g,25,22,1,2+open,"#fff"); px(g,27,22,1,2+open,"#fff"); px(g,29,22,1,2+open,"#fff");
  px(g,24,20,7,1,lite);
  g.fillStyle="#fff"; g.fillRect(22,17,3,3); g.fillStyle="#111"; g.fillRect(23,18,1,2);
};
// BLACKGLASS SERPENT — black glass coils, violet veins, crown of needles
D.blackglass_serpent = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  // the wave travels up the neck into the head while gliding.
  const hd=P.moving?sw1:0;
  const skin=tint&&tint!=="#ffffff"?tint:"#241e33", dk=shade(skin,-20), lite="#9a8bff";
  px(g,4+sw0,29,22,5,dk); px(g,5+sw0,29,20,1,skin);
  px(g,7+sw0,30,2,1,lite); px(g,13+sw0,30,2,1,lite); px(g,19+sw0,30,2,1,"#d0c8ff");
  px(g,9+sw0,27,2,3,lite); px(g,16+sw0,27,2,3,lite);
  px(g,20+hd,14,6,13,skin); px(g,21+hd,15,2,11,lite);
  px(g,19+hd,9,10,8,skin); px(g,19+hd,9,10,1,lite);
  px(g,17+hd,5,3,5,dk); px(g,26+hd,5,3,5,dk); px(g,18+hd,5,1,2,lite); px(g,27+hd,5,1,2,lite);
  g.fillStyle="#c9c2ff"; g.fillRect(21+hd,12,2,3); g.fillRect(25+hd,12,2,2); g.fillStyle="#111"; g.fillRect(21+hd,13,1,2);
  px(g,21+hd,16,6,1,dk); px(g,22+hd,16,1,2,"#fff");
};
// OBSIDIAN GOLEM — mirror-chest golem: slab limbs, violet core, slab crown
D.obsidian_golem = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#14101c", dk="#050308", lite="#7a6bff";
  px(g,8+A.lx,28+A.ld,5,7,dk); px(g,19+A.rx,28+A.rd,5,7,dk);
  px(g,6+A.lx,34+A.ld,9,2,"#000"); px(g,17+A.rx,34+A.rd,9,2,"#000");
  px(g,6,16,20,13,skin); px(g,6,16,20,2,lite);
  px(g,12,20,8,8,"#0a0812"); px(g,13,21,6,6,lite); px(g,14,22,4,4,"#d0c8ff"); px(g,15,23,2,2,"#fff");
  px(g,1+A.lax,17+A.la,5,11,skin); px(g,26+A.rax,17+A.ra-(P.atk?4:0),5,11,skin);
  px(g,0+A.lax,26+A.la,7,4,dk); px(g,25+A.rax,26+A.ra-(P.atk?4:0),7,4,dk);
  px(g,11,6,10,10,skin); px(g,11,6,10,1,lite);
  g.fillStyle="#fff"; g.fillRect(13,10,3,2); g.fillRect(18,10,2,2); g.fillStyle="#111"; g.fillRect(14,10,1,2);
  px(g,9,2,4,5,lite); px(g,19,2,4,5,lite); px(g,10,2,2,1,"#fff"); px(g,20,2,2,1,"#fff");
};
// SHARD SWARM — three flying glass shards with eyes, violet trails
D.shard_swarm = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const b1=window.Anim.seg(P,0,1), b2=window.Anim.seg(P,1,1), b3=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#3a3450", lite="#8a7bff";
  const sh=(ox,oy,bob,big)=>{
    const w=big?9:7, h=big?8:6;
    px(g,ox,oy+bob,w,h,skin); px(g,ox+1,oy+1+bob,w-2,2,lite); px(g,ox+2,oy+2+bob,2,2,"#fff");
    g.fillStyle="#d0c8ff"; g.fillRect(ox+2,oy+3+bob,2,2); g.fillStyle="#111"; g.fillRect(ox+2,oy+3+bob,1,2);
    px(g,ox+2,oy+h+bob,2,2,lite);
  };
  sh(11,10,b1,true); sh(3,20,b2,false); sh(21,21,b3,false);
  px(g,5,8,1,1,"#d0c8ff"); px(g,26,9,1,1,"#8a7bff");
};
// MIRROR FIEND — mirror-mask fiend: reflective face, glass claws, shard halo
D.mirror_fiend = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#8a86a8", dk=shade(skin,-45);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,skin); px(g,9,19,3,12,"#d0c8ff"); px(g,20,19,3,12,dk);
  px(g,4+A.lax,20+A.la,3,8,skin); px(g,5+A.lax,27+A.la,2,4,"#d0c8ff");
  px(g,25+A.rax,20+A.ra-(P.atk?4:0),3,8,skin); px(g,25+A.rax,27+A.ra-(P.atk?4:0),2,4,"#d0c8ff");
  px(g,10+A.hx,7+hb,12,12,"#d0d8e8"); px(g,11+A.hx,8+hb,10,10,"#8a9ab8");
  px(g,12+A.hx,9+hb,3,4,"#1a1622"); px(g,17+A.hx,9+hb,3,4,"#1a1622");
  g.fillStyle="#fff"; g.fillRect(12+A.hx,10+hb,2,1); g.fillRect(17+A.hx,10+hb,2,1);
  g.fillStyle="#111"; g.fillRect(13+A.hx,10+hb,1,2); g.fillRect(18+A.hx,10+hb,1,2);
  px(g,14+A.hx,14+hb,4,2,"#7a0a20"); px(g,15+A.hx,14+hb,2,1,"#fff");
  px(g,8+A.hx,2+hb,3,5,"#8a7bff"); px(g,14+A.hx,0+hb,4,7,"#d0c8ff"); px(g,21+A.hx,2+hb,3,5,"#8a7bff");
};
// VOLCANIC GLASSWING — glass wings with lead frame, ember body, stinger tail
D.glasswing = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), WA=window.Anim.flap(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#4a3a5a", dk=shade(skin,-40);
  g.save(); g.translate(12,20); g.rotate(WA); g.translate(-12,-20);
  g.fillStyle="rgba(176,166,255,0.85)"; g.beginPath(); g.moveTo(12,20); g.lineTo(0,4); g.lineTo(4,12); g.lineTo(8,11); g.fill();
  g.restore();
  g.save(); g.translate(20,20); g.rotate(-WA); g.translate(-20,-20);
  g.fillStyle="rgba(176,166,255,0.85)"; g.beginPath(); g.moveTo(20,20); g.lineTo(32,4); g.lineTo(28,12); g.lineTo(24,11); g.fill();
  g.restore();
  px(g,1,5,2,8,dk); px(g,29,5,2,8,dk);
  px(g,11,18,10,11,skin); px(g,13,20,6,6,"#ff7a2a"); px(g,14,21,4,2,"#ffd93d");
  px(g,12,28,2,4,dk); px(g,18,28,2,4,dk);
  px(g,22,24,3,6,dk); px(g,23,29,1,3,"#ffd93d");
  g.fillStyle="#ffe14d"; g.fillRect(13,13,3,3); g.fillStyle="#111"; g.fillRect(14,14,1,2);
};
// OBSIDIAN PROPHET — blindfold prophet: stone tablets, hovering shards, third-eye gem
D.obsidian_prophet = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#2e2844", dk=shade(skin,-30);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,skin); px(g,9,19,14,2,"#8a7bff");
  px(g,13,22,6,6,"#0e0c1a"); px(g,14,23,4,4,"#8a7bff"); px(g,15,24,2,2,"#fff");
  px(g,4+A.lax,20+A.la,4,8,skin); px(g,5+A.lax,24+A.la,3,6,"#4a3a5a"); px(g,5+A.lax,25+A.la,3,1,"#c9c2ff");
  const up=P.atk?-5:0;
  px(g,24+A.rax,18+A.ra+up,3,9,skin); px(g,23+A.rax,12+A.ra+up,5,7,"#3a3450"); px(g,24+A.rax,13+A.ra+up,3,5,"#8a7bff"); px(g,25+A.rax,14+A.ra+up,1,3,"#fff");
  px(g,10+A.hx,7+hb,12,11,skin); px(g,11+A.hx,8+hb,10,3,"#0e0c1a");
  px(g,11+A.hx,9+hb,10,2,"#d0c8ff");
  px(g,14+A.hx,14+hb,4,3,"#8a7bff"); px(g,15+A.hx,15+hb,2,1,"#fff");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,8+hb); g.lineTo(8+A.hx,2+hb); g.lineTo(12+A.hx,7+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,8+hb); g.lineTo(24+A.hx,2+hb); g.lineTo(20+A.hx,7+hb); g.fill();
  px(g,8+A.hx,0+hb,3,3,"#8a7bff"); px(g,21+A.hx,0+hb,3,3,"#8a7bff");
};
// SHARD RAVAGER — blade-shoulder brute: huge shoulder blades, jawed chest, cleaver arms
D.shard_ravager = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#1e1a2a", dk=shade(skin,-18), lite="#9a8bff";
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin);
  px(g,13,22,6,6,"#0e0c1a"); for(let i=0;i<3;i++){ px(g,14,23+i*2,4,1,"#fff"); }
  px(g,2+A.lax,10+A.la,8,9,lite); px(g,3+A.lax,10+A.la,6,2,"#fff"); px(g,22+A.rax,10+A.ra,8,9,lite); px(g,23+A.rax,10+A.ra,6,2,"#fff");
  const sw=P.atk?-5:0;
  px(g,3+A.lax,19+A.la+sw,4,9,skin); px(g,2+A.lax,26+A.la+sw,6,3,"#d0c8ff");
  px(g,25+A.rax,19+A.ra+sw,4,9,skin); px(g,24+A.rax,26+A.ra+sw,6,3,"#d0c8ff");
  px(g,10+A.hx,7+hb,12,11,skin); px(g,11+A.hx,8+hb,10,2,lite);
  g.fillStyle="#ff3b3b"; g.fillRect(12+A.hx,12+hb,3,3); g.fillRect(18+A.hx,12+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,13+hb,1,2);
  px(g,13+A.hx,16+hb,6,1,dk); px(g,14+A.hx,16+hb,1,2,"#fff");
};
// GLASS SPIDER — 8-leg glass spider: translucent body, violet eyes, fang pair
D.glass_spider = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#463e5e", dk=shade(skin,-40), lite="#8a7bff";
  for(let s=0;s<4;s++){ const y=17+s*4, o=window.Anim.seg(P,s,1); px(g,4,y+o,5,2,dk); px(g,23,y-o,5,2,dk); px(g,1,y+1+o,3,4,dk); px(g,28,y+1-o,3,4,dk); px(g,2,y+1+o,1,1,lite); px(g,29,y+1-o,1,1,lite); }
  px(g,9,23,14,8,skin); px(g,10,24,12,6,"#5a5078"); px(g,11,25,4,3,lite); px(g,17,25,4,3,"#d0c8ff");
  px(g,10,15,12,9,skin); px(g,11,16,10,3,lite);
  g.fillStyle="#ff3b3b"; g.fillRect(12,18,3,3); g.fillRect(18,18,2,2); g.fillStyle="#fff"; g.fillRect(12,18,1,1);
  px(g,12,22,3,5,"#e8e0d0"); px(g,17,22,3,5,"#e8e0d0"); px(g,12,26,2,2,"#8a7bff"); px(g,18,26,2,2,"#8a7bff");
};
// VITRIFIER — furnace construct: cyan crucible chest, glass bellows arms, chimney crown
D.vitrifier = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#322a48", dk=shade(skin,-30);
  px(g,9+A.lx,28+A.ld,4,7,dk); px(g,19+A.rx,28+A.rd,4,7,dk);
  px(g,7,16,18,13,skin); px(g,7,16,18,2,"#6af2ff");
  px(g,12,20,8,7,"#0e0c1a"); px(g,13,21,6,5,"#6af2ff"); px(g,14,22,4,3,"#fff"); px(g,15,24,2,1,"#0e5a7a");
  px(g,2+A.lax,18+A.la,5,9,dk); px(g,25+A.rax,18+A.ra-(P.atk?3:0),5,9,dk);
  px(g,3+A.lax,20+A.la,3,5,"#6af2ff"); px(g,26+A.rax,20+A.ra-(P.atk?3:0),3,5,"#6af2ff");
  px(g,10,7,12,10,skin); px(g,12,4,3,5,dk); px(g,17,4,3,5,dk); px(g,13,5,2,3,"#ff7a2a"); px(g,17,5,2,3,"#ff7a2a");
  g.fillStyle="#fff"; g.fillRect(13,11,3,2); g.fillRect(18,11,2,2); g.fillStyle="#111"; g.fillRect(14,11,1,2);
};
// RAZOR CHOIR — blade-winged choir ghost: two bladed wings, halo of teeth, hymn mouth
D.razor_choir = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  // bladed wings beat with the stride (flap), slam on attack, droop when
  // hurt; the old wall-clock sway survives only at rest. The shroud glides
  // side to side while moving so the hover reads as travel, not hover.
  const WA=window.Anim.flap(P);
  const fl=Math.round(WA*3)+(P.moving||P.atk?0:(Math.sin((P.t||0)*3)*1|0));
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  const skin=tint&&tint!=="#ffffff"?tint:"#5a5078";
  g.fillStyle="rgba(150,140,220,0.18)"; g.beginPath(); g.ellipse(16,20,12,13,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.moveTo(10,16); g.lineTo(1,6+fl); g.lineTo(4,14); g.fill();
  g.beginPath(); g.moveTo(22,16); g.lineTo(31,6-fl); g.lineTo(28,14); g.fill();
  px(g,1,6+fl,2,3,"#d0c8ff"); px(g,29,6-fl,2,3,"#d0c8ff");
  px(g,9+gl,12,14,15,skin); px(g,11+gl,14,10,11,"#6a6088");
  px(g,12+gl,11,8,5,"#0e0c1a");
  g.fillStyle="#d0c8ff"; g.fillRect(13+gl,12,2,2); g.fillRect(17+gl,12,2,2); g.fillStyle="#111"; g.fillRect(13+gl,12,1,2); g.fillRect(17+gl,12,1,2);
  px(g,14+gl,17,4,P.atk?4:2,"#0e0c1a"); px(g,15+gl,18,2,1,"#fff");
  for(let i=0;i<4;i++){ px(g,9+i*5+gl,5,2,3,"#e8e0d0"); }
  px(g,8+gl,28,3,5,skin); px(g,21-gl,28,3,5,skin);
};

// ============ BONE FAMILY (12) — ivory / marrow-glow / grave-dirt ============
// MARROW EATER — marrow hound: ribbed flanks, glowing marrow jaw, marrow tail
D.marrow_eater = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#cfc4b0", dk=shade(skin,-50), lite=shade(skin,20);
  const sw=window.Anim.seg(P,0,1);
  px(g,1+sw,21,4,3,dk); px(g,0+sw,19,3,3,"#e8e0d0");
  px(g,5,23,20,8,skin); px(g,5,23,20,2,lite);
  px(g,8,25,2,4,dk); px(g,11,25,2,4,dk); px(g,14,25,2,4,dk);
  px(g,9,27,8,2,"#ff8a7a"); px(g,10,27,6,1,"#fff2b0");
  px(g,7+Q.x1,30+Q.d1,3,5,dk); px(g,12+Q.x2,30+Q.d2,3,5,dk); px(g,17+Q.x1,30+Q.d1,3,5,dk); px(g,21+Q.x2,30+Q.d2,3,5,dk);
  px(g,21,15,9,10,skin);
  px(g,20,13,3,5,"#e8e0d0"); px(g,28,13,3,5,"#e8e0d0");
  px(g,25,21,6,4,"#7a2a2a"); px(g,26,22,1,2,"#ff8a7a"); px(g,29,22,1,2,"#ff8a7a");
  g.fillStyle="#ff3b3b"; g.fillRect(23,18,3,3); g.fillStyle="#fff"; g.fillRect(23,18,1,1); g.fillStyle="#111"; g.fillRect(24,19,1,2);
};
// OSSUARY CRAWLER — bone-arch crawler: arched ribs, skull prow, dirt clods
D.ossuary_crawler = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#b8ac96", dk=shade(skin,-45);
  // the rib-arch heaves with the stride while the stub legs paddle.
  const hv=P.moving?([0,-1,0,-1][P.f&3]):0;
  px(g,4,32,24,4,"#4a3f30"); px(g,8,31,3,2,"#5a4f40");
  px(g,4,26+hv,24,6,dk); px(g,5,27+hv,22,4,skin);
  for(let i=0;i<4;i++){ px(g,6+i*6,24+hv,2,7,"#e8e0d0"); }
  px(g,6+Q.x1,31+Q.d1,2,3,dk); px(g,12+Q.x2,31+Q.d2,2,3,dk); px(g,18+Q.x1,31+Q.d1,2,3,dk); px(g,24+Q.x2,31+Q.d2,2,3,dk);
  px(g,21,17+hv,8,10,skin); px(g,22,18+hv,6,2,"#e8e0d0");
  g.fillStyle="#1a1a1a"; g.fillRect(23,20+hv,3,3); g.fillStyle="#ff8a3a"; g.fillRect(23,20+hv,1,1); g.fillRect(25,20+hv,1,1);
  px(g,25,23+hv,4,3,"#e8d9b8"); px(g,26,24+hv,1,2,"#7a1f1f");
};
// SKULL SWARM — three skulls: big alpha + two attendants, jaw chatter on atk
D.skull_swarm = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const b1=window.Anim.seg(P,0,1), b2=window.Anim.seg(P,1,1), b3=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#ddd4c0", dk=shade(skin,-45);
  const skull=(ox,oy,b,big)=>{
    px(g,ox,oy+b,big?10:7,big?9:7,skin); px(g,ox+1,oy+1+b,big?8:5,2,"#fff");
    g.fillStyle="#1a1a1f"; g.fillRect(ox+1,oy+3+b,3,3); g.fillRect(ox+(big?6:4),oy+3+b,2,3);
    g.fillStyle="#ff3b3b"; g.fillRect(ox+2,oy+4+b,1,1); g.fillRect(ox+(big?6:4),oy+4+b,1,1);
    px(g,ox+3,oy+(big?8:6)+b+(P.atk?1:0),big?4:3,1,"#1a1a1f");
  };
  skull(11,12,b1,true); skull(3,21,b2,false); skull(22,21,b3,false);
};
// GRAVEWING — shroud-winged grave bat: tattered shroud wings, skull face, bell
D.gravewing = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), WA=window.Anim.flap(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#9a9080", dk=shade(skin,-40);
  g.save(); g.translate(12,20); g.rotate(WA); g.translate(-12,-20);
  g.fillStyle="#4a443c"; g.beginPath(); g.moveTo(12,20); g.lineTo(0,8); g.lineTo(3,15); g.fill(); g.restore();
  g.save(); g.translate(20,20); g.rotate(-WA); g.translate(-20,-20);
  g.fillStyle="#4a443c"; g.beginPath(); g.moveTo(20,20); g.lineTo(32,8); g.lineTo(29,15); g.fill(); g.restore();
  px(g,2,12,2,2,"#e8e0d0"); px(g,28,12,2,2,"#e8e0d0");
  px(g,11,18,10,10,skin); px(g,12,19,8,3,"#e8e0d0");
  px(g,11,8,10,11,"#e8e0d0"); px(g,12,9,8,3,"#fff");
  g.fillStyle="#1a1a1f"; g.fillRect(13,12,2,3); g.fillRect(17,12,2,3); g.fillStyle="#7a2bff"; g.fillRect(13,12,1,1); g.fillRect(17,12,1,1);
  px(g,14,16,4,1,"#1a1a1f");
  px(g,15,20,2,3,"#c9a227"); px(g,15,23,3,2,"#7a2bff");
  px(g,12,28,2,4,dk); px(g,18,28,2,4,dk);
};
// BONE COLLECTOR — sack-and-staff collector: bone sack, skull staff, tooth necklace
D.bone_collector = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#c4b89e", dk=shade(skin,-45);
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin);
  px(g,10,26,12,3,"#8a7a5a"); for(let i=0;i<4;i++) px(g,11+i*3,26,1,3,"#e8e0d0");
  px(g,2+A.lax,20+A.la,6,8,"#8a7a5a"); px(g,3+A.lax,21+A.la,4,6,"#e8e0d0");
  const up=P.atk?-5:0;
  px(g,25+A.rax,14+A.ra+up,2,16,"#5a4a3a"); px(g,23+A.rax,8+A.ra+up,6,7,"#e8e0d0");
  g.fillStyle="#1a1a1f"; g.fillRect(24+A.rax,10+A.ra+up,2,2); g.fillRect(27+A.rax,10+A.ra+up,1,2); g.fillStyle="#ff3b3b"; g.fillRect(24+A.rax,10+A.ra+up,1,1);
  px(g,10+A.hx,7+hb,12,11,"#e8e0d0"); px(g,10+A.hx,7+hb,12,2,"#fff");
  g.fillStyle="#1a1a1f"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,3);
  g.fillStyle="#ff3b3b"; g.fillRect(13+A.hx,12+hb,1,1); g.fillStyle="#fff"; g.fillRect(18+A.hx,11+hb,1,1);
  px(g,15+A.hx,14+hb,2,3,"#9a968a");
  px(g,10+A.hx,5+hb,3,4,"#e8e0d0"); px(g,19+A.hx,5+hb,3,4,"#e8e0d0");
};
// CALCIUM HORROR — floating bone horror: halo of bones, hollow ribs, cold eyes
D.calcium_horror = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  // glide: the whole reliquary sways with the stride (rest keeps float).
  const fl=P.moving?([0,-1,1,0][P.f&3]):(Math.sin((P.t||0)*3)*1|0);
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  const skin=tint&&tint!=="#ffffff"?tint:"#e2d8c2";
  g.fillStyle="rgba(220,220,200,0.15)"; g.beginPath(); g.ellipse(16+gl,20,12,13,0,0,7); g.fill();
  for(let i=0;i<4;i++){ const a=(P.t||0)*1.2+i*1.57, ox=Math.cos(a)*11|0, oy=Math.sin(a)*9|0; px(g,16+ox-1,12+oy,2,2,"#e8e0d0"); }
  px(g,9+gl,12+fl,14,15,skin); px(g,11+gl,14+fl,10,11,"#f7f2e4");
  for(let i=0;i<3;i++) px(g,10+gl,17+i*3+fl,12,1,"#b8ac96");
  px(g,11+gl,9+fl,10,7,"#f7f2e4");
  g.fillStyle="#7ac4ff"; g.fillRect(12+gl,11+fl,3,3); g.fillRect(18+gl,11+fl,2,3); g.fillStyle="#fff"; g.fillRect(12+gl,11+fl,1,1);
  px(g,14+gl,15+fl,4,1,"#8a8078");
  px(g,10+gl,27+fl,3,5,skin); px(g,19+gl,27-fl,3,5,skin);
};
// MARROW MAGE — skull-staff mage: ribbed robe, marrow crystal, skull cap
D.marrow_mage = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#d8cdb4", dk=shade(skin,-45);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,skin); px(g,10,21,12,6,"#8a8078"); for(let i=0;i<3;i++) px(g,10,22+i*3,12,1,"#5e5646");
  px(g,13,23,6,5,"#7a2bff"); px(g,14,24,4,3,"#c9a0ff"); px(g,15,24,2,2,"#fff");
  const up=P.atk?-5:0;
  px(g,4+A.lax,18+A.la,3,10,dk); px(g,25+A.rax,14+A.ra+up,2,14,"#5e5646");
  px(g,23+A.rax,8+A.ra+up,6,7,"#e8e0d0"); g.fillStyle="#1a1a1f"; g.fillRect(24+A.rax,10+A.ra+up,2,2); g.fillRect(27+A.rax,10+A.ra+up,1,2); g.fillStyle="#7a2bff"; g.fillRect(24+A.rax,10+A.ra+up,1,1);
  px(g,10+A.hx,7+hb,12,11,"#e8d9b8");
  px(g,9+A.hx,4+hb,4,5,"#e8e0d0"); px(g,19+A.hx,4+hb,4,5,"#e8e0d0");
  g.fillStyle="#1a1a1f"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,3); g.fillStyle="#7a2bff"; g.fillRect(13+A.hx,12+hb,1,1);
};
// RIBCAGE WALKER — walking ribcage: exposed ribs, skull head, spine tail
D.ribcage_walker = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#c9bfa8", dk=shade(skin,-50);
  px(g,8+A.lx,28+A.ld,5,7,dk); px(g,19+A.rx,28+A.rd,5,7,dk);
  px(g,7,15,18,14,dk); px(g,9,16,14,12,skin);
  for(let i=0;i<4;i++){ px(g,9,18+i*3,14,1,"#5e5646"); }
  px(g,14,19,4,8,"#7a2b2b"); px(g,15,20,2,6,"#ff8a7a"); px(g,15,20,2,1,"#fff");
  px(g,2+A.lax,17+A.la,5,10,skin); px(g,25+A.rax,17+A.ra-(P.atk?4:0),5,10,skin);
  px(g,10+A.hx,6+hb,12,10,"#e8e0d0");
  g.fillStyle="#1a1a1f"; g.fillRect(12+A.hx,9+hb,3,4); g.fillRect(18+A.hx,9+hb,2,3);
  g.fillStyle="#ff8a3a"; g.fillRect(13+A.hx,10+hb,1,1); g.fillRect(18+A.hx,10+hb,1,1);
  px(g,11+A.hx,3+hb,4,4,"#e8e0d0"); px(g,17+A.hx,3+hb,4,4,"#e8e0d0");
  px(g,2,24,3,6,dk); px(g,1,28,4,2,"#e8e0d0");
};
// OSSUARY HOUND — skull-headed hound: white skull, ribbed body, coffin nails
D.ossuary_hound = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#bfb49c", dk=shade(skin,-50);
  const sw=window.Anim.seg(P,0,1);
  px(g,1+sw,22,4,3,dk); px(g,0+sw,20,2,3,"#e8e0d0");
  px(g,5,23,20,8,skin); px(g,8,25,2,4,dk); px(g,12,25,2,4,dk); px(g,16,25,2,4,dk);
  px(g,7+Q.x1,30+Q.d1,3,5,dk); px(g,12+Q.x2,30+Q.d2,3,5,dk); px(g,17+Q.x1,30+Q.d1,3,5,dk); px(g,21+Q.x2,30+Q.d2,3,5,dk);
  px(g,21,14,9,11,"#e8e0d0"); px(g,22,15,7,2,"#fff");
  g.fillStyle="#1a1a1f"; g.fillRect(23,18,3,3); g.fillStyle="#ffd93d"; g.fillRect(23,18,1,1);
  px(g,25,21,5,3,"#9a968a"); for(let i=0;i<3;i++) px(g,26+i*2,21,1,2,"#5e5646");
  px(g,24,23,1,2,"#fff");
};
// CHALK WRAITH — dusty chalk ghost: powdery drape, chalk handprints, hollow eyes
D.chalk_wraith = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  // glide: chalk body sways with the stride (rest keeps the old float).
  const fl=P.moving?([0,-1,1,0][P.f&3]):(Math.sin((P.t||0)*3)*1|0);
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  const skin=tint&&tint!=="#ffffff"?tint:"#e8e0cc";
  px(g,10+gl,28+fl,3,5,skin); px(g,15+gl,29-fl,2,3,skin); px(g,20-gl,28+fl,3,5,skin);
  px(g,7+gl,10,18,19,skin); px(g,9+gl,12,14,15,"#f7f2e4");
  px(g,9+gl,18,3,3,"#8e8472"); px(g,20+gl,22,3,3,"#8e8472"); px(g,12+gl,24,2,2,"#8e8472");
  px(g,10+gl,8,12,8,"#d8d0bc");
  g.fillStyle="#1a1a1f"; g.fillRect(12+gl,11,3,4); g.fillRect(18+gl,11,2,3);
  g.fillStyle="#ff3b3b"; g.fillRect(13+gl,12,1,1); g.fillRect(18+gl,12,1,1);
  px(g,14+gl,15,4,1,"#8e8472");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+gl,9); g.lineTo(8+gl,3); g.lineTo(12+gl,8); g.fill();
};
// IVORY TYRANTKIN — tusked tyrant: ivory tusks, tooth crown, war paint
D.ivory_tyrantkin = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#d5c9ae", dk=shade(skin,-50);
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin); px(g,11,20,10,8,"#8a7a5a");
  for(let i=0;i<3;i++) px(g,12,22+i*3,8,1,"#5e5646");
  px(g,3+A.lax,18+A.la,5,9,skin); px(g,24+A.rax,18+A.ra-(P.atk?3:0),5,9,skin);
  px(g,10+A.hx,7+hb,12,11,skin);
  px(g,8+A.hx,14+hb,3,6,"#f7f2e4"); px(g,21+A.hx,14+hb,3,6,"#f7f2e4");
  px(g,9+A.hx,15+hb,1,2,"#c93b3b"); px(g,22+A.hx,15+hb,1,2,"#c93b3b");
  g.fillStyle="#ff8a3a"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2);
  for(let i=0;i<3;i++){ px(g,10+i*4+A.hx,3+hb,3,4,"#f7f2e4"); }
  px(g,15+A.hx,4+hb,2,2,"#c93b3b");
};
// RELIQUARY — golden reliquary: gilded windows, saint bones, candle crown
D.reliquary = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#cabb9c", dk=shade(skin,-45);
  // the shrine rocks side to side on its marching legs.
  const rk=P.moving?([0,1,0,-1][P.f&3]):0;
  px(g,9+A.lx,28+A.ld,4,7,dk); px(g,19+A.rx,28+A.rd,4,7,dk);
  px(g,7+rk,16,18,13,skin); px(g,7+rk,16,18,2,"#ffd93d");
  px(g,11+rk,20,4,6,"#3a2a1a"); px(g,12+rk,21,2,4,"#e8e0d0"); px(g,17+rk,20,4,6,"#3a2a1a"); px(g,18+rk,21,2,4,"#e8e0d0");
  px(g,13+rk,20,6,2,"#ffd93d");
  px(g,10+rk,7,12,10,"#e8e0d0"); px(g,11+rk,8,10,8,skin);
  g.fillStyle="#1a1a1a"; g.fillRect(13+rk,10,2,3); g.fillRect(17+rk,10,2,3); g.fillStyle="#ffd93d"; g.fillRect(13+rk,10,1,1);
  px(g,9+rk,3,4,5,"#ffd93d"); px(g,10+rk,2,2,3,"#fff"); px(g,19+rk,3,4,5,"#ffd93d"); px(g,20+rk,2,2,3,"#fff");
  px(g,14+rk,0,4,4,"#ffd93d"); px(g,15+rk,1,2,2,"#ff9d2e");
};

// ============ FLESH FAMILY (12) — mouths / guts / sinew / bile ============
// FLESH MOUND — heaped mound: layered folds, three mouths, weeping eyes
D.flesh_mound = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#a04a5a", dk=shade(skin,-45), lite=shade(skin,30);
  const sq=P.hurt?2:0;
  const wob=P.moving?([0,1,0,-1][P.f&3]):0;
  const bob=P.moving?([0,-1,-2,-1][P.f&3]):(Math.round(Math.sin((P.t||0)*3+2)*1));
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,13,4,0,0,7); g.fill();
  g.fillStyle=dk; g.beginPath(); g.ellipse(16+wob,27+sq+bob,14,9,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.ellipse(16+wob,25+sq+bob,13,8,0,0,7); g.fill();
  g.fillStyle=lite; g.beginPath(); g.ellipse(12+wob,21+sq+bob,5,3,-0.4,0,7); g.fill();
  px(g,8+wob,24+sq+bob,6,4,"#2a0a12"); px(g,9+wob,25+sq+bob,1,2,"#fff"); px(g,12+wob,25+sq+bob,1,2,"#fff");
  px(g,18+wob,26+sq+bob,6,4,"#2a0a12"); px(g,19+wob,27+sq+bob,1,2,"#fff"); px(g,22+wob,27+sq+bob,1,2,"#fff");
  g.fillStyle="#ffe14d"; g.fillRect(13+wob,18+sq+bob,3,3); g.fillRect(20+wob,19+sq+bob,2,2); g.fillStyle="#111"; g.fillRect(14+wob,19+sq+bob,1,2);
  px(g,6+wob,26+sq+bob,2,3,"#7a2a3a"); px(g,24+wob,22+sq+bob,2,3,"#7a2a3a");
};
// GUT LURKER — intestinal serpent: coiled guts,gnarl teeth, bile sacs
D.gut_lurker = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#8a3a4a", dk=shade(skin,-40), lite=shade(skin,30);
  px(g,4+sw0,29,22,5,dk); px(g,5+sw0,29,20,1,skin);
  px(g,7+sw0,30,3,2,"#7a8a2a"); px(g,14+sw0,30,3,2,"#7a8a2a"); px(g,8+sw0,30,1,1,"#d0e86a");
  // neck + head ride the wave while gliding
  const hd=P.moving?sw1:0;
  px(g,20+hd,15,6,13,skin); px(g,21+hd,16,2,10,lite);
  px(g,19+hd,10,10,8,skin); px(g,20+hd,11,8,2,lite);
  for(let i=0;i<3;i++){ px(g,20+i*3+hd,12,1,3,"#5a1a2a"); }
  g.fillStyle="#ff8a5a"; g.fillRect(21+hd,13,2,2); g.fillRect(25+hd,13,2,2); g.fillStyle="#111"; g.fillRect(21+hd,13,1,2);
  if(!P.atk){ px(g,21+hd,17,6,1,dk); } else { px(g,20+hd,17,4,3,dk); px(g,24+hd,17,4,3,dk); px(g,21+hd,18,2,2,"#7dff9b"); }
};
// SINEW STALKER — tendon panther: exposed tendons, clawed bulk, fanged grin
D.sinew_stalker = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#b05a5a", dk=shade(skin,-45), lite=shade(skin,30);
  const sw=window.Anim.seg(P,1,1);
  px(g,2+sw,20,2,7,dk); px(g,1+sw,25,3,3,"#e8d9c9"); px(g,1+sw,25,3,1,"#ff8a7a");
  px(g,5,24,20,7,skin); px(g,5,24,20,2,lite);
  px(g,8,26,3,2,"#e8d9c9"); px(g,13,26,3,2,"#7a1a1a"); px(g,18,26,3,2,"#e8d9c9");
  px(g,7+Q.x1,30+Q.d1,3,5,dk); px(g,12+Q.x2,30+Q.d2,3,5,dk); px(g,17+Q.x1,30+Q.d1,3,5,dk); px(g,21+Q.x2,30+Q.d2,3,5,dk);
  px(g,21,15,9,10,skin); px(g,22,16,7,2,lite);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(22,16); g.lineTo(18,10); g.lineTo(22,14); g.fill();
  g.beginPath(); g.moveTo(28,16); g.lineTo(30,10); g.lineTo(28,14); g.fill();
  g.fillStyle="#fff"; g.fillRect(23,18,3,3); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  px(g,25,22,5,3,"#5a0a0a"); px(g,26,23,1,2,"#fff"); px(g,28,23,1,2,"#fff");
};
// MAW WALKER — chest-maw brute: huge torso mouth, horned brow, smashing fists
D.maw_walker = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#93323e", dk=shade(skin,-45), lite=shade(skin,25);
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin); px(g,7,18,18,2,lite);
  px(g,11,22,10,7,"#2a0a12");
  for(let i=0;i<4;i++){ px(g,11+i*3,22,2,3,"#fff"); px(g,11+i*3,26,2,3,"#fff"); }
  px(g,13,24,6,3,"#ff6a7a"); px(g,14,25,4,1,"#7a1a2a");
  px(g,3+A.lax,19+A.la,5,9,skin); px(g,24+A.rax,19+A.ra-(P.atk?4:0),5,9,skin);
  px(g,10+A.hx,8+hb,12,10,skin);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(7+A.hx,3+hb); g.lineTo(11+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(25+A.hx,3+hb); g.lineTo(21+A.hx,8+hb); g.fill();
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,12+hb,3,3); g.fillStyle="#111"; g.fillRect(13+A.hx,13+hb,1,2);
  px(g,13+A.hx,16+hb,6,1,dk);
};
// BILE SPITTER — bile mortar: bloated sac, bile nozzle, spurting on atk
D.bile_spitter = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#7a8a2a", dk=shade(skin,-40), lite=shade(skin,30);
  const sq=P.atk?-2:0;
  const wob=P.moving?([0,1,0,-1][P.f&3]):0;
  const bob=P.moving?([0,-1,-2,-1][P.f&3]):(Math.round(Math.sin((P.t||0)*3+3)*1));
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
  g.fillStyle=dk; g.beginPath(); g.ellipse(16+wob,27+bob,12,9,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.ellipse(16+wob,25+bob,11,8,0,0,7); g.fill();
  g.fillStyle=lite; g.beginPath(); g.ellipse(11+wob,20+bob,4,3,-0.4,0,7); g.fill();
  px(g,13+wob,10+sq+bob,6,7,dk); px(g,14+wob,11+sq+bob,4,5,"#3a4a0a"); px(g,15+wob,12+sq+bob,2,3,"#7dff9b");
  if(P.atk){ px(g,14+wob,4+sq,4,7,"#7dff9b"); px(g,15+wob,3+sq,2,6,"#fff"); }
  g.fillStyle="#1a2a0a"; g.fillRect(11+wob,23+bob,3,4); g.fillRect(19+wob,23+bob,3,4); g.fillStyle="#fff"; g.fillRect(11+wob,23+bob,1,2);
  px(g,14+wob,26+bob,4,2,"#2a3a0a"); px(g,15+wob,26+bob,2,1,"#7dff9b");
};
// ORGAN SWARM — three organs: heart + lung + eyeball with wings
D.organ_swarm = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const b1=window.Anim.seg(P,0,1), b2=window.Anim.seg(P,1,1), b3=window.Anim.seg(P,2,1);
  px(g,10,10+b1,10,9,"#a02040"); px(g,11,11+b1,8,3,"#ff4a6a"); px(g,12,12+b1,2,2,"#fff");
  g.fillStyle="#111"; g.fillRect(13,14+b1,2,2);
  g.fillStyle="#8a5a6a"; g.beginPath(); g.moveTo(4,24+b2); g.lineTo(0,17+b2); g.lineTo(3,20+b2); g.fill();
  g.beginPath(); g.moveTo(10,24+b2); g.lineTo(14,17+b2); g.lineTo(11,20+b2); g.fill();
  px(g,2,22+b2,8,7,"#c98a9a"); px(g,3,23+b2,6,2,"#e8c9d0");
  g.fillStyle="#ff2a4a"; g.fillRect(4,24+b2,2,2);
  px(g,20,22+b3,8,8,"#f2ede2"); px(g,21,23+b3,6,6,"#ff4a6a");
  g.fillStyle="#111"; g.fillRect(23,25+b3,2,3); g.fillStyle="#fff"; g.fillRect(23,25+b3,1,1);
  px(g,21,20+b3,2,2,"#c9ccd4"); px(g,26,20+b3,2,2,"#c9ccd4");
};
// SKIN THIEF — stitched thief: patchwork face, skin coat, bone knife
D.skin_thief = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#c08a8a", dk=shade(skin,-40);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,"#8a5a5a"); px(g,9,19,3,12,skin); px(g,20,19,3,12,"#5a3a3a");
  px(g,11,21,4,4,skin); px(g,17,24,4,4,"#e8c9b8"); px(g,12,22,2,3,"#5a1a1a"); px(g,18,25,2,3,"#5a1a1a");
  px(g,4+A.lax,20+A.la,3,8,"#c9a0a0"); px(g,25+A.rax,20+A.ra-(P.atk?4:0),3,8,"#c9a0a0");
  px(g,25+A.rax,26+A.ra-(P.atk?4:0),2,7,"#e8e0d0"); px(g,25+A.rax,27+A.ra-(P.atk?4:0),2,1,"#c93b3b");
  px(g,10+A.hx,7+hb,12,12,skin); px(g,11+A.hx,8+hb,5,5,"#e8c9b8"); px(g,16+A.hx,11+hb,5,4,"#c9a0a0");
  px(g,13+A.hx,10+hb,1,8,"#5a1a1a"); px(g,18+A.hx,12+hb,1,5,"#5a1a1a");
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,13+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,13+hb,1,2);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,8+hb); g.lineTo(9+A.hx,2+hb); g.lineTo(12+A.hx,7+hb); g.fill();
};
// MUSCLE BRUTE — fiber brute: exposed muscle strands, bone knuckles, jawless grin
D.muscle_brute = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#8a2a2a", dk=shade(skin,-40), lite=shade(skin,30);
  px(g,9+A.lx,30+A.ld,5,6,dk); px(g,18+A.rx,30+A.rd,5,6,dk);
  px(g,7,18,18,13,skin);
  px(g,10,20,3,9,"#c94a4a"); px(g,14,20,3,9,"#5a0a0a"); px(g,18,20,3,9,"#c94a4a");
  px(g,11,21,1,7,"#ff8a8a"); px(g,19,21,1,7,"#ff8a8a");
  px(g,3+A.lax,19+A.la,5,9,skin); px(g,2+A.lax,26+A.la,6,3,"#e8e0d0");
  px(g,24+A.rax,19+A.ra-(P.atk?4:0),5,9,skin); px(g,24+A.rax,26+A.ra-(P.atk?4:0),6,3,"#e8e0d0");
  px(g,10+A.hx,8+hb,12,10,skin); px(g,10+A.hx,8+hb,12,2,lite);
  px(g,8+A.hx,14+hb,2,4,"#e8e0d0"); px(g,22+A.hx,14+hb,2,4,"#e8e0d0");
  g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,12+hb,3,3); g.fillRect(18+A.hx,12+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,13+hb,1,2);
  px(g,13+A.hx,16+hb,6,2,"#2a0408"); for(let i=0;i<3;i++) px(g,14+i*2+A.hx,16+hb,1,2,"#fff");
};
// FLESH ORACLE — many-eyed oracle: brow eyes, tentacle beard, floating runes
D.flesh_oracle = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#b06a7a", dk=shade(skin,-40);
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,skin); px(g,13,22,6,6,"#5a1a2a"); px(g,14,23,4,4,"#7a2bff"); px(g,15,24,2,2,"#fff");
  px(g,4+A.lax,20+A.la,3,7,skin); px(g,25+A.rax,20+A.ra,3,7,skin);
  px(g,10+A.hx,6+hb,12,12,skin);
  for(let i=0;i<3;i++){ px(g,11+i*4+A.hx,9+hb,3,3,"#fff"); g.fillStyle="#111"; g.fillRect(12+i*4+A.hx,10+hb,1,2); }
  px(g,12+A.hx,14+hb,8,4,"#1a0a0c"); g.fillStyle="#7a2bff"; g.fillRect(13+A.hx,15+hb,2,2); g.fillRect(17+A.hx,15+hb,2,2);
  px(g,13+A.hx,18+hb,2,4,"#8a4a5a"); px(g,17+A.hx,18+hb,2,4,"#8a4a5a");
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,7+hb); g.lineTo(8+A.hx,1+hb); g.lineTo(12+A.hx,6+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,7+hb); g.lineTo(24+A.hx,1+hb); g.lineTo(20+A.hx,6+hb); g.fill();
  px(g,4,6,2,2,"#7a2bff"); px(g,26,8,2,2,"#7a2bff");
};
// GULLET WORM — throat worm: ringed throat, bile teeth, dirt furrow
D.gullet_worm = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const sw0=window.Anim.seg(P,0,1), sw1=window.Anim.seg(P,2,1);
  const skin=tint&&tint!=="#ffffff"?tint:"#7a2a3a", dk=shade(skin,-40), lite=shade(skin,30);
  px(g,4,32,24,4,"#3a1a20");
  px(g,5+sw0,28,20,5,dk); px(g,6+sw0,28,18,1,skin);
  for(let i=0;i<4;i++){ px(g,6+i*5+sw0,28,1,5,dk); }
  // throat + head ride the wave while gliding
  const hd=P.moving?sw1:0;
  px(g,20+hd,15,6,13,skin); px(g,21+hd,16,2,10,lite);
  px(g,19+hd,10,10,10,skin); px(g,20+hd,11,8,3,lite);
  px(g,20+hd,14,8,5,"#2a0a12");
  for(let i=0;i<4;i++){ px(g,21+i*2+hd,14,1,2,"#fff"); px(g,21+i*2+hd,17,1,2,"#fff"); }
  g.fillStyle="#ffd93d"; g.fillRect(21+hd,11,2,2); g.fillStyle="#111"; g.fillRect(21+hd,11,1,2);
  px(g,8+sw1,27,2,3,"#7a8a2a");
};
// PULSE MASS — veined pulse mass: big vein net, core eye, drooling mouth
D.pulse_mass = (g,tint,ph)=>{
  const P=window.Anim.normP(ph);
  const skin=tint&&tint!=="#ffffff"?tint:"#963a4e", dk=shade(skin,-40), lite=shade(skin,30);
  const pu=P.atk?1:0, sq=P.hurt?2:0;
  const wob=P.moving?([0,1,0,-1][P.f&3]):0;
  const bob=P.moving?([0,-1,-2,-1][P.f&3]):(Math.round(Math.sin((P.t||0)*3+4)*1));
  g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
  g.fillStyle=dk; g.beginPath(); g.ellipse(16+wob,27+sq+bob,12,9,0,0,7); g.fill();
  g.fillStyle=skin; g.beginPath(); g.ellipse(16+wob,25+sq+bob,11,8,0,0,7); g.fill();
  g.fillStyle=lite; g.beginPath(); g.ellipse(11+wob,20+sq+bob,4,3,-0.4,0,7); g.fill();
  px(g,12+wob,22+sq+bob,8,1,"#5a0a1a"); px(g,14+wob,18+sq+bob,1,6,"#5a0a1a"); px(g,18+wob,20+sq+bob,2,5,"#ff2a4a");
  px(g,13+wob,24+sq+bob,6,4,"#fff"); g.fillStyle="#111"; g.fillRect(15+wob,25+sq+bob,2,3); g.fillStyle="#ff2a4a"; g.fillRect(15+wob,25+sq+bob+pu,2,1);
  g.fillStyle="#ff2a4a"; g.fillRect(10+wob,23+sq+bob,2,2); g.fillStyle="#fff"; g.fillRect(10+wob,23+sq+bob,1,1);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(12+wob,15+sq+bob); g.lineTo(10+wob,10+sq+bob); g.lineTo(13+wob,14+sq+bob); g.fill();
  g.beginPath(); g.moveTo(20+wob,15+sq+bob); g.lineTo(22+wob,10+sq+bob); g.lineTo(19+wob,14+sq+bob); g.fill();
};
// FLAYED SAINT — serene flayed saint: halo of skin, exposed muscle, mercy eyes
D.flayed_saint = (g,tint,ph)=>{
  const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#d09a9a", dk=shade(skin,-40);
  g.fillStyle="rgba(255,200,200,0.25)"; g.beginPath(); g.ellipse(16,16+hb,11,11,0,0,7); g.fill();
  px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
  px(g,9,19,14,12,"#a05a5a"); px(g,11,21,10,8,skin);
  px(g,12,22,3,5,"#7a1a1a"); px(g,17,22,3,5,"#7a1a1a");
  px(g,4+A.lax,16+A.la,4,8,skin); px(g,5+A.lax,16+A.la,5,2,"#fff");
  px(g,23+A.rax,16+A.ra,4,8,skin); px(g,22+A.rax,16+A.ra,5,2,"#fff");
  g.fillStyle="#c94a4a"; g.beginPath(); g.moveTo(12+A.hx,14+hb); g.lineTo(4+A.hx,2+hb); g.lineTo(7+A.hx,4+hb); g.lineTo(10+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(20+A.hx,14+hb); g.lineTo(28+A.hx,2+hb); g.lineTo(25+A.hx,4+hb); g.lineTo(22+A.hx,8+hb); g.fill();
  px(g,10+A.hx,7+hb,12,11,"#e8c9b8");
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,3,2); g.fillRect(18+A.hx,11+hb,2,2); g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,1); g.fillRect(18+A.hx,11+hb,1,1);
  px(g,14+A.hx,15+hb,4,1,"#7a1a1a");
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
