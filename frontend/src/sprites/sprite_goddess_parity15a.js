/* src/sprites/sprite_goddess_parity15a.js — GODDESS-BAR PARITY batch A (5/15).
 * Loaded AFTER sprite_celestial_parity.js. Rebuilds vs Goddess of Dawn v2:
 * aura+shadow+sparkles, layered garb/wings, ~100 rects, goddess face
 * (skin base+lite/dk+blush+lash/iris/pupil/glint+brow+mouth).
 * Kinds: sunbloom_tender, wyvern_fledgling, wreck_eel, vitrifier, kitsune_ninetails.
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
/* goddess-layout humanoid face at head box (hx, top hb): skin base 10x7 + shades + blush + lash/iris/pupil/glint + brow + mouth */
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
  const w=smileW||3;
  px(g,15+hx,14+hb,w,1,mouth);
}

/* ============ 1. SUNBLOOM TENDER — flower-keeper (goddess bar) ============ */
D.sunbloom_tender = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#f7f3ea", robeD="#d8cfc0", leaf="#4a9a4d", leafD="#2c5a26", leafL="#7ccc6a";
  const gold="#d8a018", goldL="#f6d34e", goldD="#8a6410";
  const skin="#f6d3b3", skinD="#e0a878", hair="#8a5a2e", hairD="#5a3a1a";
  const sun=tint||"#ffd34e";
  aura(g,hb,"rgba(255,214,120,0.22)","rgba(180,255,170,0.14)");
  sparks(g,[goldL,leafL]);
  // legs: sandals + soil boots
  px(g,12+A.lx,30+A.ld,3,6,skin); px(g,17+A.rx,30+A.rd,3,6,skin);
  px(g,12+A.lx,35+A.ld,3,2,"#6b4226"); px(g,17+A.rx,35+A.rd,3,2,"#6b4226");
  px(g,12+A.lx,35+A.ld,3,1,"#a97648");
  // skirt: gardener apron over robe, soil hem + leaf trim
  px(g,9,24,14,11,robe); px(g,9,24,1,11,robeD); px(g,22,24,1,11,robeD);
  px(g,9,24,14,1,"#fff");
  px(g,11,25,10,9,"#6b4226"); px(g,11,25,10,1,"#a97648");
  px(g,12,27,3,5,leaf); px(g,17,27,3,5,leaf);
  px(g,12,27,1,5,leafL); px(g,17,27,1,5,leafL);
  px(g,11,33,10,2,leaf); px(g,11,33,10,1,leafL);
  px(g,14,28,4,3,sun); px(g,15,29,2,1,"#fff");
  // torso: cream blouse + soil apron bib + sunflower badge
  px(g,11,15,10,10,robe); px(g,11,15,1,10,robeD); px(g,20,15,1,10,robeD);
  px(g,11,15,10,1,"#fff");
  px(g,13,16,6,8,"#6b4226"); px(g,13,16,6,1,"#a97648");
  px(g,14,18,4,4,sun); px(g,15,19,2,2,"#8a5a1a"); px(g,15,19,1,1,"#fff");
  px(g,13,22,6,1,leaf); px(g,13,22,6,1,leafL);
  // arms: sleeves -> hands; right holds watering can, left holds bloom
  px(g,7+A.lax,16+A.la,4,3,skin); px(g,21+A.rax,16+A.ra,4,3,skin);
  px(g,6+A.lax,19+A.la,4,3,robe); px(g,6+A.lax,19+A.la,4,1,"#fff");
  px(g,22+A.rax,19+A.ra,4,3,robe); px(g,22+A.rax,19+A.ra,4,1,"#fff");
  px(g,5+A.lax,22+A.la,3,7,skin); px(g,5+A.lax,22+A.la,1,7,skinD);
  const sw=P.atk?-3:0;
  px(g,24+A.rax,22+A.ra+sw,3,7,skin); px(g,26+A.rax,22+A.ra+sw,1,7,skinD);
  // watering can (right hand): tin body + spout + drops
  px(g,23+A.rax,28+A.ra+sw,6,5,"#8a8a92"); px(g,23+A.rax,28+A.ra+sw,6,1,"#c9ccd4");
  px(g,23+A.rax,30+A.ra+sw,2,2,"#5a5a62");
  px(g,28+A.rax,29+A.ra+sw,2,2,"#8a8a92");
  if(P.atk||P.moving){ px(g,29+A.rax,32+A.ra+sw,1,2,"#7ac8ff"); px(g,27+A.rax,34+A.ra+sw,1,2,"#7ac8ff"); }
  // bloom (left hand): open sunbloom + stem + leaves
  px(g,3+A.lax,26+A.la,1,5,leaf);
  px(g,2+A.lax,24+A.la,5,4,sun); px(g,3+A.lax,25+A.la,3,2,"#fff2b0");
  px(g,4+A.lax,25+A.la,1,1,"#8a5a1a");
  px(g,1+A.lax,26+A.la,2,1,leafL); px(g,5+A.lax,27+A.la,2,1,leafL);
  gface(g,A.hx,hb,skin,skinD,"#4a8a2e",hairD,"#f0a090","#c06060",3);
  // hair: warm brown bob + soil band
  px(g,9+A.hx,5+hb,14,3,hair); px(g,9+A.hx,5+hb,14,1,"#a97648");
  px(g,8+A.hx,6+hb,3,8,hair); px(g,21+A.hx,6+hb,3,8,hair);
  px(g,8+A.hx,6+hb,1,8,hairD); px(g,23+A.hx,6+hb,1,8,hairD);
  // SUNFLOWER CROWN: big halo of petals + seed disc (signature, never a hood again)
  px(g,10+A.hx,1+hb,12,3,sun); px(g,10+A.hx,1+hb,12,1,goldL);
  px(g,8+A.hx,2+hb,3,3,sun); px(g,21+A.hx,2+hb,3,3,sun);
  px(g,12+A.hx,0+hb,8,2,sun); px(g,13+A.hx,2+hb,6,2,"#8a5a1a");
  px(g,14+A.hx,2+hb,4,1,goldL); px(g,15+A.hx,3+hb,2,1,"#5a3a1a");
};

/* ============ 2. WYVERN FLEDGLING — downy baby wyvern (goddess bar) ============ */
D.wyvern_fledgling = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const body=tint||"#5a9a4d", dk=shade(body,-40), lite=shade(body,35), pale="#f2ede2";
  const belly="#e8d9b8", eye="#2a6a2a";
  aura(g,hb,"rgba(140,220,140,0.20)","rgba(255,240,200,0.12)");
  sparks(g,["#fff",lite]);
  const flap=P.atk?2:(P.moving?(P.f%2):(P.idle?1:0));
  // wings: downy baby wings, 3 feather layers each side
  px(g,2-flap,14+hb,8,5,pale); px(g,2-flap,14+hb,8,1,"#fff"); px(g,3-flap,18+hb,5,2,body);
  px(g,1-flap,19+hb,7,4,pale); px(g,2-flap,21+hb,3,2,body);
  px(g,22+flap,14+hb,8,5,pale); px(g,22+flap,14+hb,8,1,"#fff"); px(g,24+flap,18+hb,5,2,body);
  px(g,24+flap,19+hb,7,4,pale); px(g,27+flap,21+hb,3,2,body);
  // tail nub + spade
  const sw2=(P.moving?(P.f%2?1:-1):0);
  px(g,4+sw2,27,6,4,body); px(g,4+sw2,27,6,1,lite); px(g,3+sw2,29,3,3,dk);
  // legs: stubby + claws
  px(g,11+A.lx,29+A.ld,3,6,body); px(g,18+A.rx,29+A.rd,3,6,body);
  px(g,11+A.lx,29+A.ld,1,6,lite); px(g,21+A.rx,29+A.rd,1,6,dk);
  px(g,10+A.lx,34+A.ld,5,2,dk); px(g,17+A.rx,34+A.rd,5,2,dk);
  px(g,10+A.lx,34+A.ld,1,1,"#fff");
  // chubby body: base + belly + back ridge knobs
  px(g,10,22,12,9,body); px(g,10,22,12,2,lite); px(g,10,29,12,2,dk);
  px(g,10,22,2,9,dk); px(g,20,22,2,9,dk);
  px(g,12,25,8,5,belly); px(g,12,25,8,1,"#fff"); px(g,13,27,2,2,shade(belly,-25));
  px(g,14,22,1,2,dk); px(g,17,22,1,2,dk);
  // arms: tiny wing-arms
  px(g,6+A.lax,22+A.la,4,4,body); px(g,22+A.rax,22+A.ra,4,4,body);
  px(g,6+A.lax,22+A.la,4,1,lite);
  // HUGE baby head: base + cheeks + snout
  px(g,9+A.hx,8+hb,14,12,body);
  px(g,9+A.hx,8+hb,14,2,lite); px(g,9+A.hx,18+hb,14,2,dk);
  px(g,9+A.hx,8+hb,2,12,dk); px(g,21+A.hx,8+hb,2,12,dk);
  px(g,11+A.hx,16+hb,10,4,belly); px(g,13+A.hx,17+hb,6,2,"#c9a95e");
  px(g,15+A.hx,16+hb,1,1,"#5a3a1a"); px(g,16+A.hx,16+hb,1,1,"#5a3a1a");
  px(g,14+A.hx,18+hb,4,1,"#7a5a33");
  // big baby eyes: lash + white + green iris + pupil + double glint
  px(g,11+A.hx,11+hb,5,1,"#2a3a1a"); px(g,18+A.hx,11+hb,4,1,"#2a3a1a");
  px(g,11+A.hx,12+hb,5,4,"#fff"); px(g,18+A.hx,12+hb,4,4,"#fff");
  px(g,12+A.hx,13+hb,3,3,eye); px(g,19+A.hx,13+hb,2,2,eye);
  px(g,13+A.hx,14+hb,1,2,"#111"); px(g,19+A.hx,14+hb,1,1,"#111");
  px(g,12+A.hx,13+hb,1,1,"#fff"); px(g,19+A.hx,13+hb,1,1,"#fff");
  px(g,11+A.hx,10+hb,5,1,dk); px(g,18+A.hx,10+hb,4,1,dk);
  px(g,12+A.hx,15+hb,1,1,"#f0a090"); px(g,19+A.hx,15+hb,1,1,"#f0a090");
  // downy head fluff + nub horns
  px(g,10+A.hx,5+hb,12,4,pale); px(g,10+A.hx,5+hb,12,1,"#fff");
  px(g,11+A.hx,4+hb,3,2,"#fff"); px(g,18+A.hx,4+hb,3,2,"#fff");
  px(g,8+A.hx,7+hb,2,3,dk); px(g,22+A.hx,7+hb,2,3,dk);
  px(g,8+A.hx,7+hb,2,1,belly);
};

/* ============ 3. WRECK EEL — drowned-lightning eel (goddess bar) ============ */
D.wreck_eel = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const body=tint||"#2a5a6a", dk=shade(body,-45), lite="#7ad9f0", pale="#d9e8e0";
  const wood="#6b4226", woodL="#a97648", brass="#d8a018", brassL="#f6d34e";
  aura(g,hb,"rgba(122,217,240,0.20)","rgba(60,120,160,0.14)");
  sparks(g,[lite,"#fff"]);
  // long serpent coil: 3 stacked bands + tail fin
  const sl=(P.moving?(P.f%2?1:-1):0);
  px(g,5+sl,30,22,5,dk); px(g,5+sl,30,22,1,body);
  px(g,4+sl,32,4,4,dk); px(g,4+sl,32,2,1,lite);
  px(g,7+sl,27,18,4,body); px(g,7+sl,27,18,1,lite);
  px(g,7+sl,27,2,4,dk); px(g,23+sl,27,2,4,dk);
  // wreck planks strapped on coil + barnacles + brass bands
  px(g,8+sl,25,6,3,wood); px(g,8+sl,25,6,1,woodL);
  px(g,9+sl,25,1,3,"#3a2412"); px(g,12+sl,25,1,3,"#3a2412");
  px(g,17+sl,30,5,3,"#8a8a92"); px(g,17+sl,30,5,1,"#c9ccd4");
  px(g,9+sl,27,2,2,pale); px(g,15+sl,28,2,2,pale); px(g,21+sl,27,2,2,pale);
  px(g,7+sl,29,3,1,brass); px(g,22+sl,29,3,1,brass);
  // dorsal finlets glowing
  for(let i=0;i<3;i++){ px(g,10+sl+i*5,24,2,3,lite); px(g,10+sl+i*5,24,1,1,"#fff"); }
  // rising neck + head ride the coil while gliding
  px(g,15+sl,13,7,13,body); px(g,15+sl,13,7,2,lite); px(g,15+sl,13,2,13,dk); px(g,20+sl,13,2,13,dk);
  px(g,16+sl,16,5,8,pale); px(g,17+sl,18,3,4,"#fff");
  // eel face: big lagoon eyes + glint, flared nostrils, fanged grin
  px(g,14+sl,9,10,7,body); px(g,14+sl,9,10,2,lite);
  px(g,16+sl,11,4,3,"#fff"); px(g,21+sl,11,2,2,"#fff");
  px(g,17+sl,12,2,2,"#0e2a3a"); px(g,21+sl,12,1,1,"#0e2a3a");
  px(g,16+sl,11,1,1,"#fff"); px(g,21+sl,11,1,1,"#fff");
  px(g,15+sl,10,4,1,dk); px(g,20+sl,10,3,1,dk);
  px(g,16+sl,14,2,1,"#123a52"); px(g,20+sl,14,1,1,"#123a52");
  px(g,15+sl,15,9,3,"#5a1a1a");
  px(g,16+sl,15,1,2,"#fff"); px(g,18+sl,15,1,2,"#fff"); px(g,20+sl,15,1,2,"#fff"); px(g,22+sl,15,1,2,"#fff");
  px(g,15+sl,17,9,1,dk);
  // lightning scars: charged spine lines + mast-stub crown
  px(g,16+sl,20,1,5,brassL); px(g,20+sl,20,1,5,brassL);
  px(g,13+sl,6,2,4,wood); px(g,13+sl,6,2,1,woodL); px(g,20+sl,6,2,4,wood); px(g,20+sl,6,2,1,woodL);
  px(g,12+sl,5,4,2,brass); px(g,19+sl,5,2,2,brass);
  // side fins paddle with the coil
  px(g,11+sl,20,3,6,lite); px(g,11+sl,20,1,6,"#fff"); px(g,22+sl,20,3,6,lite); px(g,24+sl,20,1,6,"#fff");
};

/* ============ 4. VITRIFIER — glass battlefield-into-glass (goddess bar) ============ */
D.vitrifier = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const glass=tint||"#322a48", dk="#100c1c", lite="#6af2ff", pale="#d9f2ff";
  const mag="#ff6bd9", amber="#ffd93d";
  aura(g,hb,"rgba(106,242,255,0.20)","rgba(255,107,217,0.12)");
  sparks(g,[lite,"#fff"]);
  // hover base: no legs — floating shards + shadow rings
  const fl=(P.moving?(P.f%2?1:-1):0);
  px(g,10,34+fl,12,2,dk); px(g,12,34+fl,8,1,lite);
  px(g,7+fl,30,3,4,glass); px(g,7+fl,30,2,1,pale);
  px(g,22-fl,30,3,4,glass); px(g,22-fl,30,2,1,pale);
  // glass obelisk body: dark core + mirrored panels + rainbow veins
  px(g,9,17,14,15,glass);
  px(g,9,17,14,2,"#4a3f66"); px(g,9,30,14,2,dk);
  px(g,9,17,2,15,dk); px(g,21,17,2,15,"#1c162e");
  px(g,11,19,4,11,"#241d3a"); px(g,17,19,4,11,"#241d3a");
  px(g,13,19,6,3,lite); px(g,13,19,2,1,"#fff");
  px(g,13,23,6,4,mag); px(g,14,24,4,2,"#fff");
  px(g,13,28,6,2,amber); px(g,14,28,2,1,"#fff");
  px(g,15,19,2,11,"#100c1c");
  // furnace core window: molten glass heart
  px(g,13,21,6,5,"#0c0a14");
  px(g,14,22,4,3,"#ff8a2e"); px(g,15,23,2,1,"#fff");
  // arms: shard blades + prism hands
  px(g,4+A.lax,20+A.la,4,8,glass); px(g,4+A.lax,20+A.la,1,8,pale);
  px(g,24+A.rax,20+A.ra,4,8,glass); px(g,27+A.rax,20+A.ra,1,8,pale);
  px(g,3+A.lax,27+A.la,5,4,pale); px(g,4+A.lax,28+A.la,3,2,lite);
  const sw=P.atk?-3:0;
  px(g,24+A.rax,27+A.ra+sw,5,4,pale); px(g,25+A.rax,28+A.ra+sw,3,2,mag);
  // head: faceted helm + glowing slit eyes + furnace grin
  px(g,10+A.hx,7+hb,12,9,glass);
  px(g,10+A.hx,7+hb,12,2,"#4a3f66"); px(g,10+A.hx,14+hb,12,2,dk);
  px(g,10+A.hx,7+hb,2,9,dk); px(g,20+A.hx,7+hb,2,9,dk);
  px(g,12+A.hx,9+hb,8,3,lite); px(g,13+A.hx,10+hb,6,1,"#0c2a33");
  px(g,13+A.hx,10+hb,1,1,"#111"); px(g,18+A.hx,10+hb,1,1,"#111");
  px(g,12+A.hx,9+hb,2,1,"#fff"); px(g,19+A.hx,9+hb,1,1,"#fff");
  px(g,12+A.hx,8+hb,8,1,"#4a3f66");
  px(g,13+A.hx,14+hb,6,1,amber); px(g,14+A.hx,14+hb,1,1,"#fff");
  // crown: upright glass shards, prismatic tips
  px(g,11+A.hx,2+hb,3,6,glass); px(g,11+A.hx,2+hb,1,6,pale); px(g,11+A.hx,2+hb,3,1,lite);
  px(g,14+A.hx,0+hb,4,8,glass); px(g,14+A.hx,0+hb,1,8,pale); px(g,14+A.hx,0+hb,4,1,mag);
  px(g,18+A.hx,2+hb,3,6,glass); px(g,18+A.hx,2+hb,1,6,pale); px(g,18+A.hx,2+hb,3,1,amber);
  // blush of refracted light on cheeks
  px(g,11+A.hx,12+hb,2,1,mag); px(g,19+A.hx,12+hb,2,1,lite);
};

/* ============ 5. NINE-TAILED KITSUNE — orange fox girl (native 32x40) ============ */
D.kitsune_ninetails = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  // Native 32x40 for crisp pixels (final output is exact 2x2 + thin ink).
  // Orange hair/ears, ivory tails with orange tips, orange kimono + blue panel, black obi + pink cord,
  // gold bells + green tassels + blue flowers, blue eyes, red pipe at mouth.
  const coat=tint||"#ef8c1e", coatD="#b35f0e", deep="#7a3f10", lite="#ffb54e";
  const blue="#2456d6", blueD="#162e7a", blueL="#6f96f5";
  const green="#1fae3e", greenD="#0f6e26";
  const obi="#242130", gold="#e8a81c", goldL="#ffe37a", cord="#e84a80", cordL="#ff8fb0";
  const hair="#f07d1a", hairD="#b34f0e", hairL="#ffab54";
  const skin="#ffe2c6", skinD="#e8a87e";
  const bell="#e8a81c", bellD="#8a5f10", tas="#0f8a3a";
  const flower="#2f7de1", flowerL="#8ac2ff";
  aura(g,hb,"rgba(245,154,46,0.26)","rgba(255,232,200,0.15)");
  sparks(g,["#ffd9a8","#ff9d4e"]);
  // NINE TAILS: peacock-display fan — all nine rise from behind the obi
  // and arc outward in a semicircle over her head (tips: top y~7, outer
  // x~1/30 y~23). Shafts plotted as stepped segments with dark rims so each
  // feather reads separately. Outer feathers first. Sways on move, flares on atk.
  const wag=(P.moving?(P.f%2?1:-1):0), flare=P.atk?-2:0;
  // stride-locked sway: each tail bends on its own phase so the fan ripples.
  // Driven by stride frame / idle toggle (the render cache is keyed on those
  // buckets), so every walk frame and both idle frames are distinct canvases.
  // Corpses pin f=0/idle=0 via pose(), so the dead stay still.
  const swayAmp=P.moving?2.2:1.0, swayAmpY=P.moving?1.5:0.7;
  const phF=P.moving?(P.f&3)*Math.PI/2:(P.idle?Math.PI:0);
  const order=[-4,4,-3,3,-2,2,-1,1,0];
  const rad=(d)=>d*Math.PI/180;
  // fox-fur palette: ORANGE plumes with cream tips, fanning wide like
  // the ukiyo-e print — orange, not pink
  const fur="#ef8c2a", furD="#c56a12", furDD="#6e3608", furL="#ffc25e";
  const tipO="#fff3dc", tipOL="#ffffff", tipOD="#b34f0e";
  for(const i of order){
    const ax=Math.abs(i), ang=rad(i*22);
    const side=i<0?-1:1;
    const baseX=16+i*1.0, baseY=29;
    const sway=Math.sin(phF+i*0.9)*swayAmp, swayY=Math.cos(phF+i*0.9)*swayAmpY;
    const tipX=16+17*Math.sin(ang)+wag*(ax>1?1.5:0.6)+sway, tipY=29-23*Math.cos(ang)+flare+ax*0.5+swayY;
    // plume: 10 stepped dabs swelling toward the tip (fox brush);
    // dark undercoat, ivory core, deep outer rim, pale inner glint
    for(let s=1;s<=10;s++){
      const tt=s/10;
      const sx=Math.round(baseX+(tipX-baseX)*tt), sy=Math.round(baseY+(tipY-baseY)*tt);
      const w=Math.round(2+4*tt), x0=sx-(w>>1);
      px(g,x0,sy-1,w,3,furD);
      px(g,x0,sy-1,w,2,fur);
      px(g,side<0?x0:x0+w-1,sy-1,1,3,furDD);
      px(g,side<0?x0+w-1:x0,sy-1,1,1,furL);
      if((s+ax)%2===0) px(g,side<0?x0-1:x0+w,sy,1,1,fur);
    }
    // tip: big fluffy ivory brush with a vivid orange cap — scalloped
    // edges + fur spikes so each of the nine reads separately
    const big=ax>=3?1:0, tx=Math.round(tipX), ty=Math.round(tipY)+big;
    const TW=9+big*2, TH=9+big;
    const fr=[0.5,0.72,0.9,1,1,0.95,0.84,0.68,0.5,0.34];
    for(let r=0;r<TH;r++){
      const w=Math.max(2,Math.round(TW*fr[r]));
      if(r<4) px(g,tx-(w>>1),ty+r,w,1,r===0?tipOL:tipO);
      else px(g,tx-(w>>1),ty+r,w,1,fur);
    }
    px(g,tx-(TW>>1),ty,TW,1,tipOL);
    // wavy orange/ivory boundary + pale crown sparkle
    px(g,tx-2,ty+3,2,1,tipOD); px(g,tx+1,ty+3,2,1,tipOD);
    px(g,tx-1,ty,3,1,"#ffffff");
    // deep rim down the outer side + fluff spikes + top tuft
    const lc=tx-(TW>>1)-1, rc=tx+(TW>>1)+1;
    if(i<=0) px(g,lc,ty+1,1,TH-2,furDD); else px(g,rc,ty+1,1,TH-2,furDD);
    if(i<=0) px(g,rc,ty+2,1,2,tipO); else px(g,lc,ty+2,1,2,tipO);
    px(g,lc,ty+4,1,2,fur); px(g,rc,ty+5,1,2,fur);
    px(g,tx-1,ty-2,3,1,tipO); px(g,tx,ty-1,1,1,tipOL);
  }
  // tabi + geta
  px(g,11+A.lx,34+A.ld,3,2,"#fff"); px(g,18+A.rx,34+A.rd,3,2,"#fff");
  px(g,10+A.lx,36+A.ld,5,2,"#222"); px(g,17+A.rx,36+A.rd,5,2,"#222");
  px(g,10+A.lx,36+A.ld,5,1,"#555");
  // kimono skirt: orange left, blue right, gold hem
  px(g,9,23,14,11,coat); px(g,9,23,1,11,coatD); px(g,22,23,1,11,blueD);
  px(g,9,23,14,1,lite);
  px(g,16,23,7,3,blue); px(g,16,23,1,3,blueL);
  px(g,17,26,6,3,blue); px(g,17,26,1,3,blueL);
  px(g,18,29,5,3,blue); px(g,18,29,1,3,blueL);
  px(g,19,32,4,2,blue); px(g,19,32,1,2,blueL);
  px(g,16,26,1,3,deep); px(g,17,29,1,3,deep); px(g,18,32,1,2,deep);
  px(g,9,32,7,2,gold); px(g,16,32,7,2,coatD);
  px(g,9,31,14,1,gold); px(g,10,32,1,1,"#fff"); px(g,14,32,1,1,"#fff"); px(g,19,32,1,1,"#fff");
  px(g,12,24,1,7,coatD); px(g,14,25,1,6,"#ffb54e");
  px(g,19,24,1,7,blueD);
  px(g,11,26,2,2,"#fff"); px(g,12,26,1,1,flower);
  px(g,19,29,2,2,"#fff"); px(g,20,29,1,1,flower);
  px(g,12,29,2,2,"#ffd2e6"); px(g,13,29,1,1,"#c7437a");
  px(g,18,26,1,2,flowerL);
  // torso: orange left / blue right + green collar V + white inner
  px(g,10,16,12,8,coat); px(g,10,16,1,8,deep); px(g,21,16,1,8,blueD);
  px(g,10,16,12,1,lite);
  px(g,16,16,6,2,blue); px(g,16,16,1,2,blueL);
  px(g,17,18,5,2,blue); px(g,17,18,1,2,blueL);
  px(g,18,20,4,2,blue); px(g,18,20,1,2,blueL);
  px(g,19,22,3,2,blue); px(g,19,22,1,2,blueL);
  px(g,16,18,1,2,deep); px(g,17,20,1,2,deep); px(g,18,22,1,2,deep);
  px(g,15,16,2,2,skin);
  px(g,14,16,1,2,"#fff"); px(g,17,16,1,2,"#fff");
  px(g,13,16,1,2,green); px(g,18,16,1,2,green);
  px(g,13,18,1,1,green); px(g,18,18,1,1,green);
  px(g,14,18,1,1,"#fff"); px(g,17,18,1,1,"#fff");
  px(g,14,19,1,1,green); px(g,17,19,1,1,green);
  px(g,15,19,2,1,"#fff");
  px(g,15,20,1,2,"#fff"); px(g,16,20,1,2,deep);
  px(g,15,22,1,2,deep);
  // black obi + gold top + pink cord bow
  px(g,11,24,10,3,obi); px(g,11,24,10,1,gold); px(g,11,24,10,1,goldL);
  px(g,12,25,2,1,gold); px(g,17,25,2,1,"#c03048");
  px(g,11,27,10,1,cord); px(g,11,27,10,1,cordL);
  px(g,14,27,4,2,cord); px(g,15,27,2,1,cordL);
  px(g,14,29,1,2,cord); px(g,17,29,1,2,cord);
  px(g,15,28,1,3,deep);
  // wide sleeves -> hands; right hand raised holding pipe end near mouth
  px(g,5+A.lax,19+A.la,5,7,coat); px(g,5+A.lax,19+A.la,1,7,deep);
  px(g,22+A.rax,19+A.ra,5,7,blue); px(g,26+A.rax,19+A.ra,1,7,blueD);
  px(g,5+A.lax,24+A.la,5,1,gold); px(g,22+A.rax,24+A.ra,5,1,gold);
  px(g,5+A.lax,25+A.la,5,2,"#fff2df"); px(g,22+A.rax,25+A.ra,5,2,"#dfe8ff");
  px(g,6+A.lax,27+A.la,3,3,skin); px(g,23+A.rax,27+A.ra,3,3,skin);
  // orange back hair mass (no slit for inker)
  px(g,9+A.hx,4+hb,14,4,hair); px(g,9+A.hx,4+hb,14,1,hairL);
  px(g,8+A.hx,5+hb,3,12,hair); px(g,8+A.hx,5+hb,1,12,hairD);
  px(g,21+A.hx,5+hb,3,12,hair); px(g,23+A.hx,5+hb,1,12,hairD);
  gface(g,A.hx,hb,skin,skinD,"#2f8fff","#8a2a4a","#ff9a9e","#a04a3a",2);
  // orange bangs fringe over forehead + sidelock shine
  px(g,10+A.hx,7+hb,12,2,hair);
  px(g,11+A.hx,8+hb,2,2,hair); px(g,15+A.hx,8+hb,2,2,hair); px(g,19+A.hx,8+hb,2,2,hair);
  px(g,12+A.hx,7+hb,2,1,hairL); px(g,17+A.hx,7+hb,2,1,hairL);
  // pointy ear tips (tall like the reference)
  px(g,9+A.hx,0+hb,3,1,hair); px(g,20+A.hx,0+hb,3,1,hair);
  // tall fox ears: orange + white inner
  px(g,8+A.hx,1+hb,5,5,hair); px(g,8+A.hx,1+hb,5,1,hairL); px(g,8+A.hx,1+hb,2,5,hairD);
  px(g,19+A.hx,1+hb,5,5,hair); px(g,19+A.hx,1+hb,5,1,hairL); px(g,19+A.hx,1+hb,2,5,hairD);
  px(g,9+A.hx,2+hb,3,3,"#fff"); px(g,20+A.hx,2+hb,3,3,"#fff");
  // bell strands: red cord + 2 gold bells + green tassel each side
  px(g,7+A.hx,6+hb,1,8,"#a01828"); px(g,24+A.hx,6+hb,1,8,"#a01828");
  px(g,6+A.hx,8+hb,3,3,bell); px(g,6+A.hx,8+hb,1,1,goldL); px(g,6+A.hx,10+hb,3,1,bellD);
  px(g,6+A.hx,12+hb,3,3,bell); px(g,6+A.hx,12+hb,1,1,goldL);
  px(g,23+A.hx,8+hb,3,3,bell); px(g,23+A.hx,8+hb,1,1,goldL); px(g,23+A.hx,10+hb,3,1,bellD);
  px(g,23+A.hx,12+hb,3,3,bell); px(g,23+A.hx,12+hb,1,1,goldL);
  px(g,6+A.hx,15+hb,3,4,tas); px(g,7+A.hx,15+hb,1,4,"#074d20");
  px(g,23+A.hx,15+hb,3,4,tas); px(g,24+A.hx,15+hb,1,4,"#074d20");
  // blue flowers in hair
  px(g,8+A.hx,6+hb,3,3,flower); px(g,9+A.hx,7+hb,1,1,"#fff");
  px(g,21+A.hx,6+hb,3,3,flower); px(g,22+A.hx,7+hb,1,1,"#fff");
  // hand raised to mouth holding the pipe (like the reference)
  px(g,22+A.rax,14+A.ra,3,4,skin); px(g,23+A.rax,14+A.ra,1,4,skinD);
  // red pipe stick from mouth to raised hand
  px(g,17+A.hx,13+hb,5,1,"#c02020"); px(g,22+A.rax,14+A.ra,2,2,"#7a1010");
  if(P.atk){
    px(g,22+A.rax,14+A.ra,2,2,"#fff");
    px(g,23+A.hx,10+hb,2,2,"rgba(220,220,228,0.8)"); px(g,24+A.hx,7+hb,3,2,"rgba(228,228,236,0.55)");
  }
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
