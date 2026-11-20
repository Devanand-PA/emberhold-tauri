/* src/sprites/sprite_celestial_parity.js — CELESTIAL PARITY: goddess-bar rebuilds.
 * Outermost wrapper (loaded AFTER sprite_hell_parity2.js, BEFORE sprite_peter_final.js).
 * Reworks, one by one vs Goddess of Dawn (~100 rects, aura+shadow+sparkles,
 * layered garments/wings, gold+dawn palette, goddess face construction):
 *  reservoir_leviathan, divine_dragon, seraph_regent, kitsune_ninetails,
 *  celestial_messenger, cloud_lamb, cumulus_manta, dawn_pilgrim, dew_sprite,
 *  flayed_saint, gilded_stag, giant_tarantula, hulder, ivory_tyrantkin,
 *  jiangshi, kelpie, lamassu_cub, kobold_shaman, lumen_cub, shiver_owl, wraith
 * (+ brook_seraph kept distinct from messenger/pilgrim).
 * Bar: auraShadow + spark() + pose-aware limbs (Anim) + 1px hi/shade +
 * texture rows + jewelry/weapons + detailed face (lash/iris/pupil/catchlight,
 * blush, brow, nose, mouth that opens on atk).
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
function Flap(P){ try{ return (window.Anim&&window.Anim.flap?window.Anim.flap(P):0); }catch(e){ return 0; } }
/* goddess face construction: skin base + lite/dk + blush + lash/iris/pupil/glint + brow + nose + mouth */
function gface(g,X0,Y0,o,atk){
  const skin=o.skin, lite=o.lite, dk=o.dk, blush=o.blush, iris=o.iris, brow=o.brow, lip=o.lip;
  px(g,X0,Y0,12,9,skin);
  px(g,X0,Y0,12,1,lite);
  px(g,X0,Y0+7,12,2,dk);
  px(g,X0,Y0,1,9,dk); px(g,X0+11,Y0,1,9,dk);
  px(g,X0+1,Y0+1,10,1,lite);
  px(g,X0+1,Y0+4,2,1,blush); px(g,X0+9,Y0+4,2,1,blush);
  px(g,X0+2,Y0+2,3,1,brow); px(g,X0+7,Y0+2,3,1,brow);
  px(g,X0+2,Y0+3,3,1,"#140a10"); px(g,X0+7,Y0+3,3,1,"#140a10");
  px(g,X0+2,Y0+4,3,2,iris); px(g,X0+7,Y0+4,3,2,iris);
  px(g,X0+3,Y0+4,1,2,"#0a0a0a"); px(g,X0+8,Y0+4,1,2,"#0a0a0a");
  px(g,X0+2,Y0+4,1,1,"#fff"); px(g,X0+7,Y0+4,1,1,"#fff");
  px(g,X0+6,Y0+5,1,1,dk); px(g,X0+6,Y0+6,1,1,dk);
  if(atk){ px(g,X0+5,Y0+7,3,2,"#4a1020"); px(g,X0+6,Y0+7,2,1,lip); px(g,X0+6,Y0+7,1,1,"#fff"); }
  else px(g,X0+5,Y0+7,3,1,lip);
}
const D = {};

/* ============ 1. CELESTIAL MESSENGER v2 — swift herald (NOT a spear angel) ============
 * Short courier tunic + diagonal sash, winged sandals, swept-back swift wings,
 * headband with wing-clasp, trumpet raised + olive branch. Reads fast, not martial. */
D.celestial_messenger = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#fffdf6", robeD="#ddd3bd", robeDD="#b3a586", gold="#d8a018", goldL="#f6d34e", goldD="#8a6410";
  const sash="#2a4ad0", sashL="#7a9bff", skin="#f6d3b3", skinD="#e0a878", hair="#e8b83e", hairD="#b08828", hairL="#ffe9a0";
  auraShadow(g,hb,"rgba(255,230,160,0.20)","rgba(255,244,200,0.12)");
  spark(g,[3,14,goldL],[28,10,"#fff"],[26,33,goldL]);
  // swift wings: swept back + up, 2 layers + speed lines (flap narrows on atk = blast)
  const W=P.atk?-2:(P.moving?[0,-3,0,2][P.f&3]:0);
  const WA=Flap(P);
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?10:22,18+W); g.rotate(s<0?(0.5+WA*0.1):-(0.5+WA*0.1)); g.translate(s<0?-10:-22,-18-W);
    px(g,s<0?0:24,10+W,8,4,"#fffdf6"); px(g,s<0?0:24,10+W,8,1,"#ffffff");
    px(g,s<0?0:24,12+W,8,1,"#e8ddc8");
    px(g,s<0?1:25,14+W,7,3,"#e8ddc8"); px(g,s<0?1:25,16+W,7,1,"#b8ab98");
    px(g,s<0?2:24,17+W,4,2,robeD); px(g,s<0?3:26,15+W,1,3,robeD);
    g.restore();
  }
  px(g,2,15,2,1,"#fff"); px(g,28,15,2,1,"#fff"); // speed-line glints
  // legs: bare + running (wide stride) + winged sandals
  px(g,11+A.lx,28+A.ld,3,6,skin); px(g,18+A.rx,28+A.rd,3,6,skin);
  px(g,11+A.lx,28+A.ld,1,6,skinD); px(g,20+A.rx,28+A.rd,1,6,skinD);
  px(g,10+A.lx,34+A.ld,5,2,"#8a5a33"); px(g,17+A.rx,34+A.rd,5,2,"#8a5a33");
  px(g,10+A.lx,34+A.ld,5,1,"#c9a06a");
  // sandal wings (tiny)
  px(g,8+A.lx,31+A.ld,3,2,"#fff"); px(g,21+A.rx,31+A.rd,3,2,"#fff");
  // short courier tunic: skirt above knee + gold hem + side slit
  px(g,10,22,12,9,robe); px(g,10,22,1,9,robeD); px(g,21,22,1,9,robeD);
  px(g,10,22,12,1,"#fff"); px(g,10,29,12,2,gold); px(g,10,29,12,1,goldL); px(g,10,30,12,1,goldD);
  px(g,13,23,1,6,robeD); px(g,18,23,1,6,robeD);
  px(g,19,24,2,6,skin); px(g,19,24,1,6,skinD); // slit leg hint
  // torso + diagonal sash + belt + pouch + scroll case
  px(g,11,14,10,9,robe); px(g,11,14,1,9,robeD); px(g,20,14,1,9,robeD);
  px(g,11,14,10,1,"#fff");
  for(let i=0;i<6;i++) px(g,12+i,15+i,2,2,sash); // sash diagonal
  px(g,12,15,2,1,sashL);
  px(g,10,21,12,3,goldD); px(g,10,21,12,1,goldL); px(g,14,21,3,3,gold);
  px(g,14,21,3,1,"#fff"); px(g,15,22,1,1,sash); // belt jewel
  px(g,7,23,3,4,"#8a5a33"); px(g,7,23,3,1,"#c9a06a"); // pouch
  px(g,22,22,3,6,"#e8dcc0"); px(g,22,22,3,1,"#8a7a5a"); px(g,22,27,3,1,"#8a7a5a"); // scroll case
  // arms: left cradles olive branch, right RAISES trumpet
  px(g,7+A.lax,16+A.la,4,4,skin); px(g,21+A.rax,16+A.ra,4,4,skin);
  px(g,6+A.lax,20+A.la,3,5,robe); px(g,23+A.rax,20+A.ra,3,5,robe);
  px(g,6+A.lax,20+A.la,1,5,robeD); px(g,25+A.rax,20+A.ra,1,5,robeD);
  px(g,5+A.lax,25+A.la,3,3,skin); px(g,24+A.rax,25+A.ra,3,3,skin);
  // olive branch (left hand)
  px(g,3+A.lax,24+A.la,3,1,"#3a6a2a"); px(g,4+A.lax,22+A.la,1,3,"#3a6a2a");
  px(g,2+A.lax,22+A.la,2,2,"#5da24a"); px(g,5+A.lax,23+A.la,2,2,"#5da24a");
  // TRUMPET (right hand, raised; bell flares on atk with note)
  const up=P.atk?-3:0;
  px(g,24+A.rax,8+A.ra+up,2,12,gold); px(g,24+A.rax,8+A.ra+up,1,12,goldL);
  px(g,23+A.rax,6+A.ra+up,4,4,goldL); px(g,24+A.rax,7+A.ra+up,2,2,"#fff");
  px(g,23+A.rax,6+A.ra+up,4,1,"#fff"); px(g,23+A.rax,9+A.ra+up,4,1,goldD);
  px(g,22+A.rax,10+A.ra+up,2,1,goldD);
  if(P.atk){ px(g,25+A.rax,4+A.ra+up,2,2,goldL); px(g,28+A.rax,2+A.ra+up,1,1,"#fff"); }
  // head + short hair + headband with wing-clasp
  px(g,11,6,10,8,skin); px(g,11,12,10,1,skinD);
  px(g,9,5,14,3,hair); px(g,9,5,2,8,hair); px(g,21,5,2,8,hair);
  px(g,9,5,14,1,hairL); px(g,10,7,1,4,hairD);
  px(g,10,6,12,2,sash); px(g,10,6,12,1,sashL); // headband
  px(g,20,5,4,4,"#fff"); px(g,21,6,2,2,sash); // wing clasp
  gface(g,11+A.hx,7+hb,{skin,lite:"#fff2e0",dk:skinD,blush:"#f0a090",iris:"#2a9ad0",brow:"#5a3a10",lip:"#c06060"},P.atk);
  // herald seal on chest
  px(g,15,17,2,2,goldL); px(g,15,17,2,1,"#fff");
};

/* ============ 2. DAWN PILGRIM v2 — hooded wayfarer (NO wings, NO spear) ============
 * Oatmeal cloak + hood up, shell staff, satchel + bedroll, dusty leg-wraps.
 * Reads humble + road-worn next to the goddess. */
D.dawn_pilgrim = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const cloak="#e8dcc2", cloakD="#b8a888", cloakDD="#8a7a5e", robe="#f7f3ea", robeD="#cfc2ab";
  const gold="#d8a018", goldL="#f6d34e", skin="#e8b890", skinD="#c98a6a", shell="#ffd9e8";
  auraShadow(g,hb,"rgba(240,220,180,0.16)","rgba(255,244,220,0.10)");
  spark(g,[4,20,goldL],[27,12,"#fff"],[25,33,goldL]);
  // cloak back + hem + patches
  px(g,8,22,16,11,cloak); px(g,8,22,1,11,cloakD); px(g,23,22,1,11,cloakD);
  px(g,8,31,16,2,cloakD); px(g,7,27,2,6,cloak); px(g,23,28,2,5,cloak);
  px(g,10,26,3,3,"#c9b088"); px(g,17,29,3,2,"#c9b088"); px(g,10,26,3,1,"#ded0b0");
  px(g,12,23,1,8,cloakDD); px(g,19,23,1,8,cloakDD);
  // legs: wraps + dusty sandals (small steps)
  px(g,12+A.lx,29+A.ld,3,5,"#c9b088"); px(g,17+A.rx,29+A.rd,3,5,"#c9b088");
  px(g,12+A.lx,31+A.ld,3,1,cloakDD); px(g,17+A.rx,31+A.rd,3,1,cloakDD);
  px(g,11+A.lx,34+A.ld,5,2,"#6a5233"); px(g,16+A.rx,34+A.rd,5,2,"#6a5233");
  // torso robe + rope belt + satchel + bedroll + shell badge
  px(g,11,15,10,9,robe); px(g,11,15,1,9,robeD); px(g,20,15,1,9,robeD);
  px(g,11,20,10,2,"#8a7a5a"); px(g,14,20,2,2,gold); px(g,15,20,1,1,"#fff");
  px(g,18,21,5,5,"#a97648"); px(g,19,22,3,3,"#7a5230"); px(g,18,21,5,1,"#d9b078"); // satchel
  px(g,6,19,3,5,"#b8a888"); px(g,6,19,3,1,cloak); // bedroll
  px(g,15,16,3,3,shell); px(g,16,16,1,2,"#fff"); px(g,15,18,3,1,"#e8a0b8"); // shell badge
  // arms in sleeves; right hand holds SHELL STAFF, left blesses
  px(g,6+A.lax,17+A.la,4,8,cloak); px(g,6+A.lax,17+A.la,1,8,cloakD);
  px(g,22+A.rax,17+A.ra,4,8,cloak); px(g,25+A.rax,17+A.ra,1,8,cloakD);
  px(g,5+A.lax,25+A.la,3,3,skin); px(g,23+A.rax,25+A.ra,3,3,skin);
  const st=P.atk?-3:0;
  px(g,24+A.rax,8+A.ra+st,2,22,"#7a5230"); px(g,24+A.rax,8+A.ra+st,1,22,"#a97648");
  px(g,22+A.rax,4+A.ra+st,6,5,shell); px(g,23+A.rax,5+A.ra+st,4,3,"#fff");
  px(g,23+A.rax,9+A.ra+st,4,1,"#e8a0b8");
  if(P.atk){ px(g,20+A.rax,3+A.ra+st,2,2,goldL); px(g,27+A.rax,5+A.ra+st,1,1,"#fff"); }
  // hood up + face in warm shadow + traveling cloak clasp
  px(g,8,3,16,5,cloak); px(g,8,3,16,1,"#f4ecd8"); px(g,8,7,16,1,cloakD);
  px(g,7,6,3,10,cloak); px(g,22,6,3,10,cloak);
  px(g,7,6,1,10,cloakD); px(g,24,6,1,10,cloakD);
  gface(g,10+A.hx,7+hb,{skin,lite:"#ffe8c8",dk:skinD,blush:"#d89070",iris:"#7a5a20",brow:"#4a3010",lip:"#a05a4a"},P.atk);
  px(g,9,12,2,3,cloakD); px(g,21,12,2,3,cloakD); // hood shadow cheeks
  px(g,10,4,3,1,gold); px(g,19,4,3,1,gold); // hood trim
};

/* ============ 3. BROOK SERAPH v2 — water warden (distinct: teal + bowl + round wings) ============ */
D.brook_seraph = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#eef6f8", robeD="#a8c8d0", robeDD="#6a98a8", trim="#2a8a8a", trimL="#7ad9d0";
  const gold="#d8a018", goldL="#f6d34e", skin="#f2cfa8", skinD="#d89a72", hair="#2a6a7a", hairL="#7ad9f0";
  auraShadow(g,hb,"rgba(140,220,235,0.20)","rgba(200,245,255,0.12)");
  spark(g,[4,16,trimL],[27,9,"#fff"],[26,32,trimL]);
  // ripples at feet
  px(g,8,35,16,1,trimL); px(g,10,36,12,1,trim);
  // rounded droplet wings (short, layered like water)
  const W=P.atk?-2:(P.moving?[0,-2,0,1][P.f&3]:(P.idle?-2:1));
  for(const s of [-1,1]){
    const bx=s<0?2:22;
    px(g,bx,14+W,8,5,"#cfeef4"); px(g,bx,14+W,8,1,"#fff");
    px(g,bx+(s<0?1:0),18+W,7,4,robeD); px(g,bx+(s<0?1:0),21+W,7,1,trim);
  }
  // wading legs + bare feet with droplets
  px(g,11+A.lx,28+A.ld,4,6,skin); px(g,17+A.rx,28+A.rd,4,6,skin);
  px(g,11+A.lx,28+A.ld,1,6,skinD); px(g,20+A.rx,28+A.rd,1,6,skinD);
  px(g,10+A.lx,34+A.ld,6,2,skinD); px(g,16+A.rx,34+A.rd,6,2,skinD);
  if(P.moving&&(P.f&1)) px(g,9+A.lx,36+A.ld,2,1,trimL);
  // hitched wading skirt: shorter + trim + folds
  px(g,9,23,14,8,robe); px(g,9,23,14,1,"#fff"); px(g,9,29,14,2,trim);
  px(g,9,29,14,1,trimL); px(g,9,23,1,8,robeD); px(g,22,23,1,8,robeD);
  px(g,12,24,1,5,robeD); px(g,16,24,1,5,robeD); px(g,20,24,1,5,robeD);
  px(g,15,24,2,4,skin); // raised hem knee hint
  // torso + wave bodice + reed belt
  px(g,11,15,10,9,robe); px(g,11,15,10,1,"#fff");
  px(g,11,15,1,9,robeD); px(g,20,15,1,9,robeD);
  px(g,11,18,10,3,trim); px(g,11,18,10,1,trimL); px(g,13,19,6,1,"#fff");
  px(g,10,21,12,3,"#7a5a33"); px(g,13,21,6,1,trimL); // reed belt
  // arms: left holds CLEANSING BOWL, right holds FLOW VIAL high
  px(g,7+A.lax,17+A.la,4,3,skin); px(g,21+A.rax,17+A.ra,4,3,skin);
  px(g,6+A.lax,20+A.la,3,6,robe); px(g,23+A.rax,20+A.ra,3,6,robe);
  px(g,5+A.lax,25+A.la,4,3,skin); px(g,22+A.rax,25+A.ra,4,3,skin);
  px(g,3+A.lax,24+A.la,7,4,trim); px(g,4+A.lax,24+A.la,5,1,"#fff"); // bowl
  px(g,4+A.lax,25+A.la,5,2,trimL);
  const up=P.atk?-3:0;
  px(g,24+A.rax,18+A.ra+up,4,7,"#bfe8ff"); px(g,24+A.rax,18+A.ra+up,4,1,"#fff"); // vial
  px(g,25+A.rax,20+A.ra+up,2,3,trim); px(g,24+A.rax,24+A.ra+up,4,1,trim);
  px(g,25+A.rax,15+A.ra+up,2,3,trimL); // pouring drop arc
  px(g,26+A.rax,13+A.ra+up,1,2,trimL);
  // head + wet hair + reed crown + droplet circlet
  px(g,11,6,10,8,skin); px(g,11,12,10,1,skinD);
  px(g,9,4,14,4,hair); px(g,9,5,2,9,hair); px(g,21,5,2,9,hair); px(g,9,4,14,1,hairL);
  px(g,10,3,3,2,"#3a6a3a"); px(g,14,2,2,3,"#3a6a3a"); px(g,18,3,3,2,"#3a6a3a"); // reeds
  px(g,11,3,10,1,trimL);
  px(g,15,4,2,2,"#bfe8ff"); px(g,15,4,1,1,"#fff"); // droplet gem
  gface(g,11+A.hx,7+hb,{skin,lite:"#ffe8c8",dk:skinD,blush:"#e89090",iris:"#1a8a8a",brow:"#1a4a4a",lip:"#b06060"},P.atk);
};

/* ============ 4. SERAPH REGENT v2 — radiant court plate (4 wings + ermine + gems) ============ */
D.seraph_regent = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const plate="#f2e2a0", plateD="#b89a4a", plateDD="#7a6410", gold="#d8a018", goldL="#f6d34e";
  const cape="#7a1f2e", capeD="#4a0f1e", ermine="#fffdf6", skin="#e8b893", skinD="#c98a6a";
  auraShadow(g,hb,"rgba(255,220,120,0.24)","rgba(255,240,200,0.14)");
  spark(g,[2,16,goldL],[29,12,"#fff"],[26,34,goldL]);
  // 4 wings: 2 grand + 2 small high
  const W=P.atk?-3:(P.moving?[0,-2,0,2][P.f&3]:0);
  const WA=Flap(P);
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?11:21,20+W); g.rotate(s<0?WA*0.8:-WA*0.8); g.translate(s<0?-11:-21,-20-W);
    const bx=s<0?0:22;
    px(g,bx,12+W,10,4,"#fff2c0"); px(g,bx,12+W,10,1,"#ffffff");
    px(g,bx,14+W,10,1,"#e8c890");
    px(g,bx+(s<0?0:1),16+W,9,4,"#e8c890"); px(g,bx+(s<0?0:1),19+W,9,1,plateD);
    px(g,bx+(s<0?4:5),16+W,1,4,plateD);
    px(g,bx+(s<0?1:5),20+W,4,4,"#d8b060"); px(g,bx+(s<0?2:5),22+W,2,2,plateDD);
    g.restore();
    px(g,s<0?4:23,9+hb,5,2,ermine); px(g,s<0?4:23,9+hb,5,1,"#ffffff");
    px(g,s<0?4:23,10+hb,5,1,gold); // small high wings tucked at cheeks
  }
  // ermine cape behind
  px(g,7,16,18,14,cape); px(g,7,16,1,14,capeD); px(g,24,16,1,14,capeD);
  px(g,7,16,18,1,ermine); px(g,8,19,2,2,ermine); px(g,13,19,2,2,ermine); px(g,18,19,2,2,ermine); px(g,22,22,2,2,ermine);
  // legs: plate greaves + gold knees + war boots
  px(g,11+A.lx,28+A.ld,4,6,plateD); px(g,17+A.rx,28+A.rd,4,6,plateD);
  px(g,12+A.lx,30+A.ld,2,2,goldL); px(g,18+A.rx,30+A.rd,2,2,goldL);
  px(g,10+A.lx,34+A.ld,6,2,"#4a3a1a"); px(g,16+A.rx,34+A.rd,6,2,"#4a3a1a");
  // skirt tassets + filigree
  px(g,9,23,14,6,plate); px(g,9,23,14,1,goldL); px(g,9,27,14,2,plateD);
  px(g,12,24,1,4,plateDD); px(g,15,24,1,4,plateDD); px(g,19,24,1,4,plateDD);
  px(g,13,25,2,2,gold); px(g,17,25,2,2,gold);
  // torso: broad plate + gem + sash of office
  px(g,10,15,12,9,plate); px(g,10,15,12,2,goldL); px(g,10,22,12,2,plateD);
  px(g,10,15,2,9,plateDD); px(g,20,15,2,9,plateDD);
  px(g,14,17,4,5,plateD); px(g,15,18,2,3,"#c93b6a"); px(g,15,18,1,1,"#fff"); // chest gem
  px(g,11,20,10,2,cape); px(g,11,20,10,1,"#a03040"); // sash
  // pauldrons + arms
  px(g,5,13,6,6,plate); px(g,21,13,6,6,plate); px(g,5,13,6,1,goldL); px(g,21,13,6,1,goldL);
  px(g,6,19,4,4,skin); px(g,22,19,4,4,skin);
  px(g,5,23,4,4,plate); px(g,23,23,4,4,plate);
  // tower shield left: gold rim + plate + dawn sigil + boss
  const sh=P.atk?-2:0;
  px(g,0+A.lax,16+A.la+sh,6,16,gold); px(g,1+A.lax,17+A.la+sh,4,14,plate);
  px(g,1+A.lax,17+A.la+sh,4,2,goldL); px(g,2+A.lax,20+A.la+sh,2,6,"#c93b6a");
  px(g,2+A.lax,22+A.la+sh,2,2,goldL); px(g,1+A.lax,28+A.la+sh,4,2,goldD);
  // sun-sword right (held high on atk)
  const sw=P.atk?-5:0;
  px(g,26+A.rax,10+A.ra+sw,2,14,"#e8f2fa"); px(g,26+A.rax,10+A.ra+sw,1,14,"#fff");
  px(g,25+A.rax,8+A.ra+sw,4,3,goldL); px(g,26+A.rax,9+A.ra+sw,2,1,"#fff");
  px(g,25+A.rax,24+A.ra+sw,4,2,gold); px(g,26+A.rax,26+A.ra+sw,2,4,"#4a3a1a");
  if(P.atk){ px(g,24+A.rax,6+A.ra+sw,2,2,goldL); px(g,29+A.rax,7+A.ra+sw,2,2,"#fff"); }
  // head + GEMMED CROWN (3 gems, distinct from goddess halo)
  px(g,10,6,12,8,skin); px(g,10,12,12,1,skinD);
  px(g,10,4,12,3,plate); px(g,10,4,12,1,goldL);
  px(g,11,2,3,3,gold); px(g,14,1,4,4,gold); px(g,19,2,3,3,gold);
  px(g,12,3,1,1,"#c93b6a"); px(g,15,2,2,2,"#2a4ad0"); px(g,16,2,1,1,"#fff"); px(g,20,3,1,1,"#5da24a");
  px(g,13,5,3,1,plateDD); px(g,17,5,3,1,plateDD);
  gface(g,10+A.hx,7+hb,{skin,lite:"#ffe8c8",dk:skinD,blush:"#d89090",iris:"#7a3aaa",brow:"#3a2a1a",lip:"#a04a5a"},P.atk);
};

/* ============ 5. RESERVOIR LEVIATHAN v2 — still-water serpent ============ */
D.reservoir_leviathan = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const deep="#2a6a9a", mid="#4d9ad0", lite="#bfe8ff", belly="#e8f6ff", gold="#d8a018", goldL="#f6d34e";
  auraShadow(g,hb,"rgba(120,200,240,0.22)","rgba(190,240,255,0.12)");
  spark(g,[3,14,lite],[28,8,"#fff"],[27,33,lite]);
  const surge=P.atk?-2:0;
  // the surge travels down the coils into the head while gliding.
  const sw0=window.Anim.seg(P,0,1);
  const hd=P.moving?window.Anim.seg(P,2,1):0;
  px(g,17+surge,3,9,2,mid); px(g,17+surge,3,9,1,lite);
  px(g,16+surge,5,1,6,mid); px(g,26+surge,5,1,6,mid);
  px(g,17+surge,11,9,1,mid);
  px(g,19+surge,5,5,1,"#fff");
  px(g,4+sw0,26,6,5,mid); px(g,4+sw0,26,6,1,lite); px(g,4+sw0,30,6,1,deep);
  px(g,1+sw0,23,4,7,mid); px(g,1+sw0,23,4,1,lite); px(g,1+sw0,28,4,2,deep);
  px(g,2+sw0,25,1,3,belly);
  px(g,8+sw0,23,14,8,mid); px(g,8+sw0,23,14,1,lite); px(g,8+sw0,29,14,2,belly); px(g,8+sw0,30,14,1,"#fff");
  px(g,8+sw0,23,1,8,deep); px(g,21+sw0,23,1,8,deep);
  for(let i=0;i<5;i++){ px(g,9+i*2+sw0,25,2,1,deep); px(g,10+i*2+sw0,27,1,1,lite); }
  px(g,9+sw0,24,3,1,"#fff"); px(g,14+sw0,24,2,1,"#fff");
  px(g,10+sw0,20,2,4,lite); px(g,10+sw0,20,2,1,"#fff");
  px(g,14+sw0,19,2,5,lite); px(g,14+sw0,19,2,1,"#fff");
  px(g,18+sw0,20,2,4,lite);
  px(g,14+A.lx,24,6,4,lite); px(g,14+A.lx,24,6,1,"#fff"); px(g,14+A.lx,27,6,1,deep);
  px(g,15+A.lx,25,1,2,deep); px(g,17+A.lx,25,1,2,deep);
  px(g,20,20,1,3,deep); px(g,22,20,1,3,deep);
  px(g,20+hd,13,6,11,mid); px(g,20+hd,13,6,1,lite);
  px(g,20+hd,13,1,11,deep); px(g,25+hd,13,1,11,deep);
  px(g,20+hd,20,6,3,belly);
  px(g,23+hd,15,1,5,lite); px(g,27+hd,15,1,5,lite);
  px(g,23+hd,19,1,1,"#fff"); px(g,27+hd,19,1,1,"#fff");
  px(g,19+hd+surge,7,9,8,mid); px(g,19+hd+surge,7,9,2,lite);
  px(g,23+hd+surge,11,6,4,mid); px(g,23+hd+surge,11,6,1,lite); px(g,23+hd+surge,14,6,1,deep);
  px(g,27+hd+surge,12,2,2,deep);
  px(g,18+hd+surge,3,3,5,gold); px(g,24+hd+surge,3,3,5,gold);
  px(g,18+hd+surge,3,3,1,goldL); px(g,24+hd+surge,3,3,1,goldL);
  px(g,20+hd+surge,9,3,1,"#0a1a20"); px(g,25+hd+surge,9,3,1,"#0a1a20");
  px(g,20+hd+surge,10,3,2,"#0e5a8a"); px(g,25+hd+surge,10,3,2,"#0e5a8a");
  px(g,21+hd+surge,10,1,2,"#061018"); px(g,26+hd+surge,10,1,2,"#061018");
  px(g,20+hd+surge,10,1,1,"#fff"); px(g,25+hd+surge,10,1,1,"#fff");
  px(g,21+hd+surge,12,2,1,"#0a3a5a"); px(g,26+hd+surge,12,2,1,"#0a3a5a");
  if(P.atk){ px(g,23+surge,13,6,3,"#06283a"); for(let x=0;x<6;x+=2) px(g,23+x+surge,13,1,1,"#fff"); px(g,24+surge,16,4,2,"#ff8a7a");
    px(g,27+surge,5,2,2,lite); px(g,29+surge,8,1,2,lite); px(g,15+surge,6,1,1,"#fff"); }
  else px(g,23+surge,13,6,1,"#0a3a5a");
  px(g,16+surge,16,1,2,lite); px(g,29+surge,16,1,1,"#fff");
};

/* ============ 6. DIVINE DRAGON v2 — dawn-cloud wyrm (pearl + mane + claws) ============ */
D.divine_dragon = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const cream="#fffdf6", creamD="#e3d3ae", gold="#f6d34e", goldD="#c9962e", rose="#ffb0d0", roseD="#e08aa8";
  auraShadow(g,hb,"rgba(255,230,160,0.24)","rgba(255,240,200,0.14)");
  spark(g,[3,12,gold],[28,9,"#fff"],[27,33,gold]);
  const rise=P.atk?-2:0;
  px(g,11,0,10,2,gold); px(g,13,0,6,1,"#fff"); px(g,11,2,10,1,"#fff");
  px(g,9,1,1,2,goldD); px(g,22,1,1,2,goldD);
  const flap=P.atk?2:(P.moving?[0,2,0,-1][P.f&3]:(P.idle?2:-1));
  px(g,1-flap,14,8,6,cream); px(g,1-flap,14,8,1,"#fff"); px(g,0-flap,18,6,4,creamD);
  px(g,2-flap,15,2,4,goldD);
  px(g,23+flap,14,8,6,cream); px(g,23+flap,14,8,1,"#fff"); px(g,26+flap,18,6,4,creamD);
  px(g,27+flap,15,2,4,goldD);
  px(g,3,26,6,5,cream); px(g,3,26,6,1,"#fff"); px(g,3,30,6,1,creamD);
  px(g,1,24,4,5,rose); px(g,1,24,4,1,"#fff"); px(g,2,27,2,2,roseD);
  px(g,7,28,18,7,cream); px(g,7,28,18,1,"#fff"); px(g,7,33,18,2,gold); px(g,7,33,18,1,"#fff");
  px(g,7,28,1,7,creamD); px(g,24,28,1,7,creamD);
  px(g,10,30,2,3,goldD); px(g,14,30,2,3,goldD); px(g,18,30,2,3,goldD); px(g,22,30,2,3,goldD);
  px(g,9,29,3,1,creamD); px(g,15,29,3,1,creamD); px(g,21,29,3,1,creamD);
  px(g,9+A.lx,32+A.ld,3,4,cream); px(g,20+A.rx,32+A.rd,3,4,cream);
  px(g,9+A.lx,35+A.ld,3,1,goldD); px(g,20+A.rx,35+A.rd,3,1,goldD);
  px(g,8+A.lx,35+A.ld,1,1,goldD); px(g,12+A.lx,35+A.ld,1,1,goldD); px(g,19+A.rx,35+A.rd,1,1,goldD); px(g,23+A.rx,35+A.rd,1,1,goldD);
  px(g,10,22,12,7,cream); px(g,10,22,12,1,"#fff"); px(g,10,27,12,2,gold);
  px(g,12,24,2,3,goldD); px(g,16,24,2,3,goldD); px(g,19,24,1,3,goldD);
  px(g,19,13,6,10,cream); px(g,19,13,6,1,"#fff"); px(g,19,13,1,10,creamD);
  px(g,17,14,2,4,rose); px(g,17,17,2,3,roseD); px(g,17,21,2,3,rose);
  px(g,18,7,9,8,cream); px(g,18,7,9,2,"#fff"); px(g,18,13,9,1,creamD);
  px(g,22,11,6,4,cream); px(g,22,11,6,1,"#fff"); px(g,22,14,6,1,creamD);
  px(g,26,12,2,1,roseD);
  px(g,17,3,3,5,gold); px(g,17,3,3,1,"#fff");
  px(g,23,3,3,5,goldD); px(g,23,3,3,1,gold);
  px(g,20,15,1,4,creamD); px(g,26,15,1,4,creamD);
  px(g,20,18,1,1,"#fff"); px(g,26,18,1,1,"#fff");
  px(g,19,9,3,1,"#3a2018"); px(g,24,9,3,1,"#3a2018");
  px(g,19,10,3,2,"#2a4a9a"); px(g,24,10,3,2,"#2a4a9a");
  px(g,20,10,1,2,"#0a0a18"); px(g,25,10,1,2,"#0a0a18");
  px(g,19,10,1,1,"#fff"); px(g,24,10,1,1,"#fff");
  px(g,20,15+rise,4,4,"#ffd9e8"); px(g,21,16+rise,2,2,"#fff");
  px(g,20,15+rise,4,1,"#fff"); px(g,20,18+rise,4,1,roseD);
  if(P.atk){ px(g,19,14+rise,6,6,"rgba(255,217,232,0.35)"); px(g,28,6,2,2,gold); px(g,4,10,1,1,"#fff"); }
  if(P.atk){ px(g,22,13,6,2,"#7a2a3a"); px(g,23,13,1,1,"#fff"); px(g,26,13,1,1,"#fff"); }
  else px(g,23,14,4,1,roseD);
};

/* ============ 7. NINE-TAILED KITSUNE v2 — fox first (muzzle + ears + 9 tails) ============ */
D.kitsune_ninetails = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur="#f08a2a", furD="#a05a1a", furDD="#7a3f10", cream="#ffe8c8", creamD="#d8a878", tipW="#fff6ea";
  const gold="#d8a018", goldL="#f6d34e";
  auraShadow(g,hb,"rgba(240,150,60,0.22)","rgba(255,200,120,0.12)");
  spark(g,[2,12,goldL],[29,10,"#fff"],[27,33,goldL]);
  for(let i=-4;i<=4;i++){
    const tipX=16+i*3.2, tipY=32-Math.abs(i)*1.3-8+(P.atk?-2:((P.f&1)?1:0));
    const midX=16+i*1.8, midY=29;
    px(g,midX-1,midY,2,4,furDD); px(g,midX-1,midY,2,4,fur);
    px(g,tipX-2,tipY,4,6,furDD); px(g,tipX-2,tipY+1,4,4,fur);
    px(g,tipX-2,tipY,1,6,furD); px(g,tipX+1,tipY,1,6,furD);
    px(g,tipX-1,tipY,2,2,tipW); px(g,tipX-1,tipY,1,1,"#fff");
  }
  px(g,13,28,6,3,furD);
  px(g,11+A.lx,27+A.ld,4,5,fur); px(g,17+A.rx,27+A.rd,4,5,fur);
  px(g,11+A.lx,29+A.ld,1,3,furD); px(g,20+A.rx,29+A.rd,1,3,furD);
  px(g,10+A.lx,32+A.ld,5,3,furD); px(g,17+A.rx,32+A.rd,5,3,furD);
  px(g,10+A.lx,34+A.ld,1,1,tipW); px(g,13+A.lx,34+A.ld,1,1,tipW); px(g,17+A.rx,34+A.rd,1,1,tipW); px(g,20+A.rx,34+A.rd,1,1,tipW);
  px(g,10+A.lx,32+A.ld,5,1,cream);
  px(g,10,22,12,7,fur); px(g,10,22,12,1,furD); px(g,10,27,12,2,furD);
  px(g,10,22,1,7,furDD); px(g,21,22,1,7,furDD);
  px(g,9,26,14,3,tipW); px(g,9,26,14,1,"#fff"); px(g,9,28,14,1,creamD);
  px(g,11,15,10,8,fur); px(g,11,15,10,1,furD);
  px(g,10,15,12,3,tipW); px(g,10,15,12,1,"#fff");
  px(g,11,20,10,3,goldD); px(g,11,20,10,1,goldL); px(g,15,20,2,3,gold); px(g,15,20,2,1,"#fff");
  px(g,15,23,2,2,goldL); px(g,16,23,1,1,"#fff");
  px(g,13,16,2,2,furD); px(g,17,16,2,2,furD);
  px(g,6+A.lax,17+A.la,4,6,fur); px(g,22+A.rax,17+A.ra,4,6,fur);
  px(g,6+A.lax,22+A.la,4,3,tipW); px(g,22+A.rax,22+A.ra,4,3,tipW);
  px(g,5+A.lax,25+A.la,3,3,fur); px(g,24+A.rax,25+A.ra,3,3,fur);
  px(g,5+A.lax,27+A.la,1,1,tipW); px(g,24+A.rax,27+A.ra,1,1,tipW);
  px(g,9+A.hx,0+hb,4,6,fur); px(g,19+A.hx,0+hb,4,6,fur);
  px(g,9+A.hx,0+hb,4,1,furDD); px(g,19+A.hx,0+hb,4,1,furDD);
  px(g,10+A.hx,2+hb,2,3,cream); px(g,20+A.hx,2+hb,2,3,cream);
  px(g,8+A.hx,4+hb,2,2,fur); px(g,22+A.hx,4+hb,2,2,fur);
  px(g,10+A.hx,6+hb,12,9,fur); px(g,10+A.hx,6+hb,12,1,cream);
  px(g,10+A.hx,6+hb,1,9,furD); px(g,21+A.hx,6+hb,1,9,furD);
  px(g,13+A.hx,12+hb,6,4,cream); px(g,13+A.hx,12+hb,6,1,"#fff");
  px(g,15+A.hx,13+hb,2,2,"#3a2018");
  px(g,9+A.hx,11+hb,2,2,cream); px(g,21+A.hx,11+hb,2,2,cream);
  px(g,8+A.hx,12+hb,3,1,furD); px(g,21+A.hx,12+hb,3,1,furD);
  px(g,7+A.hx,13+hb,2,1,"#5a3010"); px(g,23+A.hx,13+hb,2,1,"#5a3010");
  px(g,11+A.hx,8+hb,3,1,"#3a2018"); px(g,18+A.hx,8+hb,3,1,"#3a2018");
  px(g,11+A.hx,9+hb,3,2,"#c08a1a"); px(g,18+A.hx,9+hb,3,2,"#c08a1a");
  px(g,12+A.hx,9+hb,1,2,"#0a0a0a"); px(g,19+A.hx,9+hb,1,2,"#0a0a0a");
  px(g,11+A.hx,9+hb,1,1,"#fff"); px(g,18+A.hx,9+hb,1,1,"#fff");
  px(g,11+A.hx,8+hb,3,1,"#5a3010"); px(g,18+A.hx,8+hb,3,1,"#5a3010");
  px(g,12+A.hx,11+hb,2,1,"#ff9a78"); px(g,18+A.hx,11+hb,2,1,"#ff9a78");
  if(P.atk){ px(g,14+A.hx,14+hb,4,2,"#5a2010"); px(g,14+A.hx,14+hb,1,1,"#fff"); px(g,17+A.hx,14+hb,1,1,"#fff"); }
  else px(g,14+A.hx,14+hb,4,1,"#7a3a1a");
  px(g,14+A.hx,5+hb,4,2,gold); px(g,14+A.hx,5+hb,4,1,goldL); px(g,16+A.hx,6+hb,1,1,"#fff");
  const fl=(P.f%2===0);
  px(g,fl?3:27,fl?10:14,2,3,"#7ad9f0"); px(g,fl?3:27,fl?10:14,2,1,"#fff");
  px(g,fl?27:4,fl?16:8,1,1,goldL);
};

/* ============ 8. CLOUD LAMB v2 — wool of condensed morning ============ */
D.cloud_lamb = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const wool="#f4f0e8", sh="#d8cfc0", shD="#b3a894", eye="#22223a", gold="#f6d34e", goldD="#d8a018";
  auraShadow(g,hb,"rgba(240,240,250,0.20)","rgba(255,255,255,0.12)");
  spark(g,[4,12,gold],[28,8,"#fff"],[26,33,gold]);
  // halo ring above
  px(g,12,2,8,2,gold); px(g,13,1,6,1,"#fff"); px(g,12,4,8,1,goldD);
  px(g,11,2,1,2,goldD); px(g,20,2,1,2,goldD);
  // legs: 4 wool columns + dark hooves (grounded pairs, stride)
  px(g,10+A.lx,28+A.ld,3,6,sh); px(g,19+A.rx,28+A.rd,3,6,sh);
  px(g,13,29,3,5,sh); px(g,16,29,3,5,sh);
  px(g,10+A.lx,30+A.ld,1,4,shD); px(g,21+A.rx,30+A.rd,1,4,shD);
  px(g,10+A.lx,34+A.ld,3,2,"#6a5a48"); px(g,19+A.rx,34+A.rd,3,2,"#6a5a48");
  px(g,13,34,3,2,"#6a5a48"); px(g,16,34,3,2,"#6a5a48");
  // body: 3 wool rows + top puffs + belly shade
  px(g,8,18,16,11,wool); px(g,8,18,16,2,"#fff"); px(g,8,27,16,2,sh);
  px(g,8,18,1,11,sh); px(g,23,18,1,11,sh);
  px(g,9,21,3,3,sh); px(g,14,22,3,3,sh); px(g,19,21,3,3,sh);
  px(g,10,20,2,2,"#fff"); px(g,16,20,2,2,"#fff"); px(g,21,20,2,2,"#fff");
  px(g,9,16,4,3,wool); px(g,14,15,4,4,wool); px(g,19,16,4,3,wool);
  px(g,9,16,4,1,"#fff"); px(g,14,15,4,1,"#fff"); px(g,19,16,4,1,"#fff");
  // tail puff
  px(g,5,20,3,4,"#fff"); px(g,5,20,3,1,wool); px(g,5,23,3,1,sh);
  // head: round + wool cap + ears
  px(g,20,11,9,10,wool); px(g,20,11,9,2,"#fff"); px(g,28,11,1,10,sh);
  px(g,21,9,4,3,wool); px(g,26,9,4,3,wool); px(g,21,9,4,1,"#fff"); px(g,26,9,4,1,"#fff");
  px(g,18,12,3,3,wool); px(g,29,12,3,3,wool); // ear puffs
  px(g,22,10,5,2,sh);
  // face: dark sky eyes + glints + nose + smile + blush
  px(g,22,14,2,3,eye); px(g,26,14,2,3,eye);
  px(g,22,14,1,1,"#fff"); px(g,26,14,1,1,"#fff");
  px(g,22,13,2,1,"#3a3a5a"); px(g,26,13,1,1,"#3a3a5a");
  px(g,24,17,2,2,"#c98a6a"); px(g,24,18,2,1,"#8a5a48");
  px(g,23,19,4,1,"#8a5a48");
  px(g,21,16,1,1,"#ffb0c0"); px(g,28,16,1,1,"#ffb0c0");
  // cloud puffs at feet
  px(g,7,35,4,2,"#fff"); px(g,22,35,4,2,"#fff");
};

/* ============ 9. CUMULUS MANTA v2 — high-cloud ray (wings + smile + rain) ============ */
D.cumulus_manta = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const top="#ffffff", sh="#cfdde8", deep="#8fb4cc", eye="#12303f", drop="#7ac8ff";
  auraShadow(g,hb,"rgba(200,230,245,0.22)","rgba(255,255,255,0.12)");
  spark(g,[4,10,drop],[28,8,"#fff"],[25,33,drop]);
  // the whole disc ripples with the glide: wings beat, tail lashes.
  const glide=P.moving?[0,2,0,-2][P.f&3]:(P.atk?-3:(P.idle?2:-2));
  const tw=P.moving?[0,1,0,-1][P.f&3]:(P.idle?1:-1);
  // wide wings with scalloped trailing edge
  for(const s of [-1,1]){
    const bx=s<0?1:17;
    px(g,bx,16+glide+(s<0?0:0),14,5,top);
    px(g,bx,16+glide,14,1,"#fff");
    px(g,bx,20+glide,3,3,top); px(g,bx+4,21+glide,3,3,top); px(g,bx+8,20+glide,3,3,top);
    px(g,bx,20+glide,14,1,sh);
    px(g,bx+2,18+glide,2,2,sh); px(g,bx+7,18+glide,2,2,sh);
  }
  // cephalic fins (front lobes)
  px(g,11,20,3,4,top); px(g,18,20,3,4,top); px(g,11,23,3,1,sh); px(g,18,23,3,1,sh);
  // body disc + back swirls + drops
  px(g,11,18,10,9,top); px(g,11,18,10,1,"#fff");
  px(g,11,18,1,9,sh); px(g,20,18,1,9,sh);
  px(g,13,19,3,2,sh); px(g,17,21,2,2,sh);
  px(g,14,22,2,2,drop); px(g,18,19,2,2,drop); px(g,14,23,1,1,"#fff");
  // tail whip + tuft lash with the glide
  px(g,15+tw,27,2,7,top); px(g,15+tw,27,2,7,sh); px(g,15+tw,27,1,7,top);
  px(g,14+tw,33,4,2,deep); px(g,15+tw,33,2,1,"#fff");
  // face on front rim: round eyes + glints + smile
  px(g,13,22,2,3,eye); px(g,17,22,2,3,eye);
  px(g,13,22,1,1,"#fff"); px(g,17,22,1,1,"#fff");
  px(g,14,25,4,1,"#3a6a7a");
  px(g,12,24,1,1,"#ffb0c0"); px(g,19,24,1,1,"#ffb0c0");
  // rain sparkles below + sun glint above
  if(P.atk||P.moving){ px(g,9,30,1,2,drop); px(g,22,31,1,2,drop); px(g,13,32,1,1,drop); }
  px(g,15,12,2,1,"#fff"); px(g,10,14,1,1,"#fff");
};

/* ============ 10. DEW SPRITE v2 — droplet with opinions (leaf + limbs) ============ */
D.dew_sprite = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const body="#bfe8ff", deep="#5a9ac8", lite="#ffffff", leaf="#5da24a", leafD="#3a6a2a";
  auraShadow(g,hb,"rgba(150,220,255,0.24)","rgba(220,245,255,0.14)");
  spark(g,[4,12,lite],[27,9,"#fff"],[25,33,lite]);
  const bob=P.atk?-2:0;
  // leaf sprout on head
  px(g,14,2+bob,2,4,leafD); px(g,12,0+bob,4,3,leaf); px(g,16,1+bob,4,2,leaf);
  px(g,12,0+bob,4,1,"#8fd07a"); px(g,13,2+bob,1,1,leafD);
  // droplet body: round + point top + big highlight + side shade
  px(g,11,8+bob,10,4,body);
  px(g,13,5+bob,6,4,body); px(g,14,4+bob,4,2,body);
  px(g,9,12+bob,14,13,body); px(g,9,12+bob,14,2,lite);
  px(g,9,12+bob,2,13,deep); px(g,21,12+bob,2,13,deep);
  px(g,13,13+bob,4,9,lite); px(g,15,14+bob,2,6,"#fff");
  px(g,10,15+bob,1,7,deep);
  px(g,11,23+bob,10,2,deep); px(g,12,24+bob,8,1,"#8fd0f0");
  // tiny arms
  px(g,7+A.lax,16+A.la,3,3,body); px(g,22+A.rax,16+A.ra,3,3,body);
  px(g,7+A.lax,16+A.la,1,3,deep); px(g,24+A.rax,16+A.ra,1,3,deep);
  // goddess mini-face: big eyes + glints + blush + open smile
  px(g,12,14+bob,3,1,"#12303f"); px(g,17,14+bob,3,1,"#12303f");
  px(g,12,15+bob,3,3,"#1a5a7a"); px(g,17,15+bob,3,3,"#1a5a7a");
  px(g,13,15+bob,1,2,"#061018"); px(g,18,15+bob,1,2,"#061018");
  px(g,12,15+bob,1,1,"#fff"); px(g,17,15+bob,1,1,"#fff");
  px(g,11,17+bob,2,1,"#ff9ab0"); px(g,19,17+bob,2,1,"#ff9ab0");
  if(P.atk){ px(g,14,19+bob,4,2,"#12303f"); px(g,15,19+bob,2,1,"#ff8a9a"); }
  else px(g,14,19+bob,4,1,"#c05a7a");
  // base ripple
  px(g,8,35,16,1,deep); px(g,10,36,12,1,lite);
};

/* ============ 11. GILDED STAG v2 — antlered sunrise (branch + hooves) ============ */
D.gilded_stag = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const coat="#e8d090", dark="#a8843e", lite="#fff2c8", hoof="#4a3a22", eye="#2a1a08", gold="#f6d34e";
  auraShadow(g,hb,"rgba(255,215,130,0.22)","rgba(255,240,200,0.12)");
  spark(g,[3,12,gold],[28,8,"#fff"],[26,33,gold]);
  // legs: 4 slender + dark hooves
  px(g,9+A.lx,28+A.ld,3,6,coat); px(g,20+A.rx,28+A.rd,3,6,coat);
  px(g,13,29,3,5,coat); px(g,16,29,3,5,coat);
  px(g,9+A.lx,30+A.ld,1,4,dark); px(g,22+A.rx,30+A.rd,1,4,dark);
  px(g,9+A.lx,34+A.ld,3,2,hoof); px(g,20+A.rx,34+A.rd,3,2,hoof);
  px(g,13,34,3,2,hoof); px(g,16,34,3,2,hoof);
  // body + belly light + back shade + flank spot-rows
  px(g,8,20,16,9,coat); px(g,8,20,16,2,lite); px(g,8,27,16,2,dark);
  px(g,8,20,1,9,dark); px(g,23,20,1,9,dark);
  px(g,10,22,2,2,lite); px(g,14,22,2,2,lite); px(g,18,22,2,2,lite);
  px(g,11,24,2,1,dark); px(g,16,24,2,1,dark);
  // tail
  px(g,5,21,3,4,coat); px(g,5,24,3,1,lite);
  // neck + head + muzzle
  px(g,19,12,6,9,coat); px(g,19,12,1,9,dark); px(g,19,12,6,1,lite);
  px(g,18,10,9,8,coat); px(g,18,10,9,1,lite);
  px(g,22,14,6,4,coat); px(g,22,14,6,1,lite); px(g,26,15,2,2,hoof);
  px(g,25,17,2,1,"#7a3a22");
  // eyes: large + glint + liner + brow
  px(g,20,11,3,1,"#3a2410"); px(g,24,11,1,1,"#3a2410");
  px(g,20,12,3,3,"#4a2f10"); px(g,24,12,2,2,"#4a2f10");
  px(g,20,12,1,1,"#fff"); px(g,24,12,1,1,"#fff");
  px(g,19,14,1,1,"#ffb0c0"); px(g,26,14,1,1,"#ffb0c0");
  // ears
  px(g,17,8,3,4,coat); px(g,25,8,3,4,coat); px(g,17,8,3,1,lite); px(g,25,8,3,1,lite);
  // BRANCHED antlers: main beam + 3 tines each + gold leaf buds
  px(g,15,2,3,7,dark); px(g,24,2,3,7,dark); px(g,15,2,3,1,lite); px(g,24,2,3,1,lite);
  px(g,12,4,3,2,dark); px(g,17,3,3,2,dark); px(g,22,3,3,2,dark); px(g,27,4,3,2,dark);
  px(g,12,3,2,2,gold); px(g,18,1,2,2,gold); px(g,22,1,2,2,gold); px(g,28,3,2,2,gold);
  px(g,12,3,1,1,"#fff"); px(g,22,1,1,1,"#fff");
};

/* ============ 12. LUMEN CUB v2 — sunbeam with paws (mane rays + play) ============ */
D.lumen_cub = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur="#fff2c0", sh="#e0c890", shD="#b89a5a", eye="#5a3a08", gold="#f6d34e", goldD="#d8a018";
  auraShadow(g,hb,"rgba(255,230,150,0.24)","rgba(255,245,210,0.14)");
  spark(g,[3,12,gold],[28,9,"#fff"],[27,33,gold]);
  // halo
  px(g,12,1,8,2,gold); px(g,13,0,6,1,"#fff"); px(g,12,3,8,1,goldD);
  // mane rays: 8 spikes around head
  px(g,13,4,2,3,gold); px(g,17,4,2,3,gold);
  px(g,9,7,3,2,gold); px(g,21,7,3,2,gold);
  px(g,8,11,2,3,gold); px(g,22,11,2,3,gold);
  px(g,9,15,2,2,goldD); px(g,21,15,2,2,goldD);
  // legs + paws
  px(g,10+A.lx,28+A.ld,4,5,fur); px(g,18+A.rx,28+A.rd,4,5,fur);
  px(g,10+A.lx,30+A.ld,1,3,sh); px(g,21+A.rx,30+A.rd,1,3,sh);
  px(g,9+A.lx,33+A.ld,6,3,fur); px(g,17+A.rx,33+A.rd,6,3,fur);
  px(g,10+A.lx,33+A.ld,1,1,shD); px(g,18+A.rx,33+A.rd,1,1,shD);
  // body + belly
  px(g,9,22,14,8,fur); px(g,9,22,14,2,"#fff"); px(g,9,28,14,2,sh);
  px(g,9,22,1,8,sh); px(g,22,22,1,8,sh);
  px(g,12,24,2,2,"#fff"); px(g,17,24,2,2,"#fff");
  // tail + tuft
  px(g,4,24,4,3,fur); px(g,2,23,3,4,gold); px(g,2,23,3,1,"#fff");
  // head + ears
  px(g,10,12,12,10,fur); px(g,10,12,12,1,"#fff"); px(g,10,12,1,10,sh); px(g,21,12,1,10,sh);
  px(g,9,10,4,4,fur); px(g,19,10,4,4,fur); px(g,9,10,4,1,gold); px(g,19,10,4,1,gold);
  // face: big amber eyes + glints + nose + open playful mouth + whiskers
  px(g,12,15,3,1,"#3a2410"); px(g,17,15,3,1,"#3a2410");
  px(g,12,16,3,3,"#c08a1a"); px(g,17,16,3,3,"#c08a1a");
  px(g,13,16,1,2,"#0a0a0a"); px(g,18,16,1,2,"#0a0a0a");
  px(g,12,16,1,1,"#fff"); px(g,17,16,1,1,"#fff");
  px(g,11,18,2,1,"#ffb0a0"); px(g,19,18,2,1,"#ffb0a0");
  px(g,15,18,2,2,"#8a5a3a");
  if(P.atk){ px(g,14,20,4,2,"#5a3010"); px(g,15,20,2,1,"#ff9a9a"); }
  else px(g,14,20,4,1,"#8a5a3a");
  px(g,10,18,2,1,shD); px(g,20,18,2,1,shD);
};

/* ============ 13. FLAYED SAINT v2 — martyred, peeled, furious ============ */
D.flayed_saint = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const flesh="#d09a9a", musc="#b05050", muscD="#7a2f2f", blood="#a01212", cloth="#e8e0d0", clothD="#b8a898";
  auraShadow(g,hb,"rgba(170,40,50,0.20)","rgba(220,120,120,0.12)");
  spark(g,[3,14,blood],[28,9,"#fff"],[26,33,blood]);
  // thorn crown + pain halo
  px(g,10,2,12,2,"#4a2f1a"); px(g,10,2,12,1,"#7a5230");
  px(g,9,1,2,3,"#4a2f1a"); px(g,12,0,2,3,"#4a2f1a"); px(g,16,0,2,4,"#4a2f1a"); px(g,20,1,2,3,"#4a2f1a");
  px(g,9,1,2,1,blood); px(g,16,0,2,1,blood); px(g,20,1,2,1,blood);
  px(g,8,4,16,1,blood);
  // legs + bare feet, blood pooled
  px(g,11+A.lx,28+A.ld,4,6,flesh); px(g,17+A.rx,28+A.rd,4,6,flesh);
  px(g,11+A.lx,30+A.ld,1,4,muscD); px(g,20+A.rx,30+A.rd,1,4,muscD);
  px(g,10+A.lx,34+A.ld,6,2,flesh); px(g,16+A.rx,34+A.rd,6,2,flesh);
  px(g,8,36,16,1,blood); px(g,12,37,8,1,"#7a0f1e");
  // loincloth + sash
  px(g,10,23,12,6,cloth); px(g,10,23,12,1,"#fff"); px(g,10,27,12,2,clothD);
  px(g,15,23,2,6,blood); px(g,15,23,2,1,"#ff6a7a");
  // torso: exposed muscle with striations + rib hints + sternum line
  px(g,11,14,10,10,musc); px(g,11,14,10,1,"#d07a7a");
  for(let i=0;i<4;i++){ px(g,11,16+i*2,10,1,muscD); px(g,12,17+i*2,8,1,"#d07a7a"); }
  px(g,15,14,1,10,"#5a1f1f");
  px(g,12,18,2,2,"#e8a0a0"); px(g,18,18,2,2,"#e8a0a0"); // rib glints
  // arms: sinew + stigmata wounds (glow on atk)
  px(g,6+A.lax,16+A.la,4,8,flesh); px(g,22+A.rax,16+A.ra,4,8,flesh);
  px(g,6+A.lax,18+A.la,4,1,musc); px(g,22+A.rax,18+A.ra,4,1,musc);
  px(g,6+A.lax,21+A.la,4,1,muscD); px(g,22+A.rax,21+A.ra,4,1,muscD);
  px(g,5+A.lax,24+A.la,3,4,flesh); px(g,24+A.rax,24+A.ra,3,4,flesh);
  const st=P.atk?3:2;
  px(g,6+A.lax,25+A.la,1,st,blood); px(g,25+A.rax,25+A.ra,1,st,blood);
  if(P.atk){ px(g,5+A.lax,24+A.la,1,1,"#fff"); px(g,24+A.rax,24+A.ra,1,1,"#fff"); }
  // head + suffering goddess face (brows knotted, wail mouth)
  px(g,11,5,10,9,flesh); px(g,11,5,10,1,"#e8bcbc"); px(g,11,12,10,2,muscD);
  px(g,11,5,1,9,muscD); px(g,20,5,1,9,muscD);
  px(g,11,6,10,1,"#e8bcbc");
  px(g,12,7,3,1,"#5a1f1f"); px(g,17,7,3,1,"#5a1f1f"); // knotted brows
  px(g,12,8,3,2,"#ffd9d9"); px(g,17,8,3,2,"#ffd9d9"); // bloodshot whites
  px(g,13,8,1,2,"#4a1010"); px(g,18,8,1,2,"#4a1010");
  px(g,12,8,1,1,"#fff"); px(g,17,8,1,1,"#fff");
  px(g,12,10,2,1,blood); px(g,18,10,2,1,blood); // weeping blush
  if(P.atk){ px(g,14,12,4,3,"#3a0a0a"); px(g,15,12,2,1,"#ff8a8a"); }
  else px(g,14,12,4,1,"#7a2f2f");
  // blood drips from crown + arms
  px(g,10,5,1,3,blood); px(g,21,6,1,2,blood);
};

/* ============ 14. IVORY TYRANTKIN v2 — tusked heirloom brute ============ */
D.ivory_tyrantkin = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const ivory="#d5c9ae", dark="#6b6152", deep="#4a4238", blood="#8a2a1a", ember="#ff8a3a";
  auraShadow(g,hb,"rgba(200,170,120,0.20)","rgba(255,220,160,0.10)");
  spark(g,[3,14,ember],[28,9,"#fff"],[26,33,ember]);
  // legs: stubby pillars + clawed feet, grounded
  px(g,10+A.lx,29+A.ld,5,6,ivory); px(g,17+A.rx,29+A.rd,5,6,ivory);
  px(g,10+A.lx,29+A.ld,1,6,dark); px(g,21+A.rx,29+A.rd,1,6,dark);
  px(g,9+A.lx,35+A.ld,7,2,deep); px(g,16+A.rx,35+A.rd,7,2,deep);
  px(g,9+A.lx,35+A.ld,1,1,ivory); px(g,21+A.rx,35+A.rd,1,1,ivory);
  // torso: layered ivory plates + seams + cracks + war paint
  px(g,8,18,16,12,ivory); px(g,8,18,16,2,"#efe6d0"); px(g,8,28,16,2,dark);
  px(g,8,18,1,12,dark); px(g,23,18,1,12,dark);
  px(g,8,22,16,1,dark); px(g,8,26,16,1,dark);
  px(g,10,20,1,3,deep); px(g,14,24,1,3,deep); px(g,19,20,1,2,deep); // cracks
  px(g,10,19,6,2,blood); px(g,16,25,6,1,blood); // war paint stripes
  px(g,11,19,6,1,"#ff6a5a");
  // massive arms + claws
  px(g,4+A.lax,18+A.la,5,9,ivory); px(g,23+A.rax,18+A.ra,5,9,ivory);
  px(g,4+A.lax,18+A.la,1,9,dark); px(g,27+A.rax,18+A.ra,1,9,dark);
  px(g,3+A.lax,27+A.la,6,4,ivory); px(g,23+A.rax,27+A.ra,6,4,ivory);
  px(g,3+A.lax,30+A.la,2,2,deep); px(g,5+A.lax,30+A.la,2,2,deep); px(g,23+A.rax,30+A.ra,2,2,deep); px(g,25+A.rax,30+A.ra,2,2,deep);
  // trophy necklace: teeth + cord
  px(g,11,18,10,1,deep);
  for(let i=0;i<5;i++){ px(g,11+i*2,19,1,2,"#fff"); px(g,11+i*2,20,1,1,deep); }
  // head: heavy brow + small eyes + UP tusks
  px(g,10,8,12,9,ivory); px(g,10,8,12,2,"#efe6d0"); px(g,10,15,12,2,dark);
  px(g,10,8,1,9,dark); px(g,21,8,1,9,dark);
  px(g,10,11,12,2,deep); // brow shadow
  px(g,12,12,3,2,ember); px(g,17,12,3,2,ember);
  px(g,13,12,1,2,"#3a1000"); px(g,18,12,1,2,"#3a1000");
  px(g,12,12,1,1,"#fff"); px(g,17,12,1,1,"#fff");
  px(g,9,14,2,6,"#fff"); px(g,21,14,2,6,"#fff"); // tusks up
  px(g,9,14,2,1,ivory); px(g,21,14,2,1,ivory);
  px(g,14,15,4,2,deep); // snarling mouth
  if(P.atk){ px(g,14,15,4,1,blood); px(g,15,15,1,1,"#fff"); px(g,17,15,1,1,"#fff"); }
  px(g,11,8,4,1,blood); px(g,18,8,3,1,blood); // paint smears
  // ember cracks on shoulders
  px(g,5,19,2,2,ember); px(g,25,22,2,2,ember);
  if(P.atk){ px(g,5,19,1,1,"#fff"); px(g,25,22,1,1,"#fff"); }
};

/* ============ 15. GIANT TARANTULA v2 — GROUNDED (feet on the shadow) ============ */
D.giant_tarantula = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const fur="#4a2a5a", dark="#2a1a3a", lite="#7a4a8a", eye="#ff3b3b", fang="#fff";
  auraShadow(g,hb,"rgba(90,40,120,0.22)","rgba(150,80,180,0.10)");
  spark(g,[3,12,fang],[28,9,eye],[26,33,fang]);
  const step=(P.f&1)?1:0;
  // 8 LEGS: coxa out + femur up + tibia DOWN to the ground line (feet y36-37)
  // left 4 (right mirrored): knee heights stagger so legs separate
  const legs=[[-1,0],[ -1,1],[-1,2],[-1,3]];
  for(const s of [-1,1]){
    for(let i=0;i<4;i++){
      // Stride: diagonal leg pairs lift and reach with the gait.
      const lift=P.moving?(((i+P.f+(s<0?0:2))&1)?-2:0):0;
      const reach=P.moving?(((i+P.f+(s<0?0:2))&1)?1:0):0;
      const hipX=s<0?9:23, hipY=28+i;
      const kneeX=hipX+s*(4-i*0)+ (s<0?-3:3), kneeY=hipY-4+(i===1||i===2?1:0);
      const footX=hipX+s*(7-i)+(s<0?-1:1)+s*reach, footY=36+(i===0||i===3?1:0)+(s<0?step:1-step?0:0);
      const fy=36+((i+s+8)%2)+lift;
      px(g,Math.min(hipX,kneeX),Math.min(hipY,kneeY),Math.abs(kneeX-hipX)+1,2,fur);
      px(g,Math.min(hipX,kneeX),Math.min(hipY,kneeY),Math.abs(kneeX-hipX)+1,1,lite);
      const tx=Math.min(kneeX,footX), ty=Math.min(kneeY,fy);
      px(g,tx,ty,Math.abs(footX-kneeX)+1,Math.abs(fy-kneeY)+1,fur);
      px(g,footX,fy,2,1,dark); // foot on ground
    }
  }
  // abdomen (rear, raised) + urticating patch + spinnerets
  px(g,4,22,10,9,fur); px(g,4,22,10,2,lite); px(g,4,29,10,2,dark);
  px(g,6,24,6,5,dark); px(g,7,25,4,3,"#8a5a9a"); // hair patch
  px(g,7,25,1,1,lite); px(g,10,26,1,1,lite);
  px(g,2,28,3,3,dark); px(g,3,29,1,1,lite); // spinnerets
  // cephalothorax (front, low) + fur tufts
  px(g,14,25,11,8,fur); px(g,14,25,11,1,lite); px(g,14,31,11,2,dark);
  px(g,15,25,2,2,lite); px(g,20,25,2,2,lite); px(g,17,26,2,2,dark);
  // 8 EYES: 2 large center + 6 small crown
  px(g,16,27,3,3,"#1a0a1a"); px(g,21,27,3,3,"#1a0a1a");
  px(g,16,27,3,3,eye); px(g,21,27,3,3,eye);
  px(g,16,27,1,1,fang); px(g,21,27,1,1,fang);
  px(g,15,25,2,2,eye); px(g,19,25,2,2,eye); px(g,23,25,2,2,eye);
  px(g,15,30,2,1,dark); px(g,23,30,2,1,dark);
  // fangs + drool (drip on atk)
  px(g,16,31,2,4,fang); px(g,22,31,2,4,fang);
  px(g,16,34,2,1,"#cfc4b8"); px(g,22,34,1,1,"#cfc4b8");
  if(P.atk){ px(g,17,35,1,2,"#8fd07a"); px(g,23,35,1,2,"#8fd07a"); }
  else px(g,19,32,2,1,dark); // mouth line
};

/* ============ 16. HULDER v2 — veiled cowherd (tail out, never mentioned) ============ */
D.hulder = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#f2cfa8", skinD="#d89a72", hair="#5a3a22", hairD="#3a2412", hairL="#8a6238";
  const dress="#d9a0c0", dressD="#a86a88", dressDD="#7a4a5e", veil="#fffdf6", gold="#f6d34e", leaf="#3a6a2a";
  auraShadow(g,hb,"rgba(220,160,190,0.20)","rgba(255,210,230,0.12)");
  spark(g,[3,14,gold],[28,9,"#fff"],[26,33,gold]);
  // COW TAIL (signature, right side): hangs + dark tuft, sways
  const sw=P.moving?((P.f&1)?1:-1):0;
  px(g,23+sw,24,2,8,hair); px(g,23+sw,24,2,8,hairD); px(g,23+sw,24,1,8,hair);
  px(g,22+sw,31,4,4,"#2a1a10"); px(g,23+sw,31,2,2,"#4a3a28");
  // legs + shoes
  px(g,12+A.lx,29+A.ld,3,5,skin); px(g,17+A.rx,29+A.rd,3,5,skin);
  px(g,11+A.lx,34+A.ld,5,2,"#4a2f22"); px(g,16+A.rx,34+A.rd,5,2,"#4a2f22");
  // skirt + apron + folds
  px(g,9,22,14,9,dress); px(g,9,22,14,1,"#f2c8dc"); px(g,9,29,14,2,dressD);
  px(g,9,22,1,9,dressD); px(g,22,22,1,9,dressD);
  px(g,12,23,1,6,dressDD); px(g,16,23,1,6,dressDD); px(g,20,23,1,6,dressDD);
  px(g,13,23,6,6,"#efe0dc"); px(g,13,23,6,1,"#fff"); px(g,13,28,6,1,dressD); // apron
  px(g,15,25,2,2,leaf); // apron sprig
  // torso + laced bodice + shawl
  px(g,11,15,10,8,skin); px(g,11,15,1,8,skinD); px(g,20,15,1,8,skinD);
  px(g,11,16,10,6,dress); px(g,11,16,10,1,"#f2c8dc"); px(g,11,21,10,1,dressD);
  for(let i=0;i<3;i++){ px(g,15,17+i*2,2,1,"#fff"); px(g,15,17+i*2,2,1,dressDD); } // laces
  px(g,9,15,3,3,veil); px(g,20,15,3,3,veil); // shoulder shawl
  // arms + basket of herbs (left)
  px(g,7+A.lax,17+A.la,4,5,skin); px(g,21+A.rax,17+A.ra,4,5,skin);
  px(g,6+A.lax,22+A.la,4,4,dress); px(g,22+A.rax,22+A.ra,4,4,dress);
  px(g,5+A.lax,26+A.la,3,3,skin); px(g,23+A.rax,26+A.ra,3,3,skin);
  px(g,2+A.lax,25+A.la,6,5,"#7a5230"); px(g,2+A.lax,25+A.la,6,1,"#a97648");
  px(g,3+A.lax,23+A.la,2,3,leaf); px(g,5+A.lax,24+A.la,2,2,"#5da24a");
  // head + long hair + flower crown
  px(g,11,5,10,9,skin); px(g,11,12,10,1,skinD);
  px(g,9,4,3,11,hair); px(g,20,4,3,11,hair);
  px(g,9,4,1,11,hairD); px(g,22,4,1,11,hairD);
  px(g,9,4,14,2,hair); px(g,10,4,5,1,hairL);
  px(g,10,2,2,2,"#fff"); px(g,14,1,3,3,"#ff8ab0"); px(g,14,1,3,1,"#fff");
  px(g,18,2,2,2,"#f6d34e"); px(g,21,2,2,2,"#7ab8ff"); // crown flowers
  px(g,10,1,12,1,leaf);
  // VEIL over hair (translucent white, pinned)
  px(g,8,3,2,10,veil); px(g,22,3,2,10,veil);
  px(g,8,3,16,1,veil);
  px(g,10,3,1,1,gold); px(g,21,3,1,1,gold); // veil pins
  gface(g,11+A.hx,6+hb,{skin,lite:"#ffe8c8",dk:skinD,blush:"#e89090",iris:"#3a6a3a",brow:"#3a2410",lip:"#b06060"},P.atk);
  // cow ears peeking through hair
  px(g,7+A.hx,8+hb,2,3,hairD); px(g,23+A.hx,8+hb,2,3,hairD);
};

/* ============ 17. JIANGSHI v2 — hopping magistrate (hat + talisman + buttons) ============ */
D.jiangshi = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#2a4a6a", robeD="#1a2f4a", trim="#e8e8e8", gold="#d8a018", goldL="#f6d34e";
  const skin="#bfe8c9", skinD="#7aa892", paper="#ffe14d", paperD="#c9a018", red="#c93b3b";
  auraShadow(g,hb,"rgba(60,90,130,0.20)","rgba(120,160,200,0.10)");
  spark(g,[3,14,paper],[28,9,"#fff"],[26,33,paper]);
  const hop=P.moving?((P.f&1)?-1:0):0;
  // legs together (stiff hop) + black shoes
  px(g,12,28+hop,3,6,robe); px(g,17,28+hop,3,6,robe);
  px(g,12,28+hop,1,6,robeD); px(g,19,28+hop,1,6,robeD);
  px(g,11,34+hop,5,2,"#111"); px(g,16,34+hop,5,2,"#111");
  px(g,11,34+hop,5,1,"#333");
  // robe skirt + white trim + buttons
  px(g,9,22,14,8,robe); px(g,9,22,1,8,robeD); px(g,22,22,1,8,robeD);
  px(g,9,22,14,1,trim); px(g,9,28,14,2,robeD);
  px(g,12,23,1,5,trim); px(g,19,23,1,5,trim);
  px(g,15,23,2,2,gold); px(g,15,26,2,2,gold); // buttons
  px(g,15,23,1,1,"#fff"); px(g,15,26,1,1,"#fff");
  // torso + collar + cuffs
  px(g,11,14,10,9,robe); px(g,11,14,10,1,trim);
  px(g,11,14,1,9,robeD); px(g,20,14,1,9,robeD);
  px(g,13,14,6,2,trim); px(g,14,15,4,2,skinD);
  // arms thrust FORWARD stiff (both, sleeves + pale hands)
  px(g,4+A.lax,17+A.la,6,4,robe); px(g,22+A.rax,17+A.ra,6,4,robe);
  px(g,4+A.lax,17+A.la,6,1,trim); px(g,22+A.rax,17+A.ra,6,1,trim);
  px(g,2+A.lax,17+A.la,5,4,skin); px(g,25+A.rax,17+A.ra,5,4,skin);
  px(g,2+A.lax,17+A.la,5,1,"#fff");
  // Qing hat: black brim + red top + gold badge + queue braid
  px(g,9,0,14,6,"#1a1a24"); px(g,9,0,14,1,"#33334a"); px(g,9,5,14,1,red);
  px(g,14,-0+1,4,3,red); px(g,15,0,2,2,"#ff6a6a"); // hat top
  px(g,14,2,4,3,gold); px(g,15,3,2,1,"#fff"); // badge
  px(g,24,6,2,8,hair0()); px(g,24,6,2,8,"#111"); // queue braid
  function hair0(){ return "#111"; }
  // TALISMAN paper over face
  px(g,14,6,4,7,paper); px(g,14,6,4,1,"#fff"); px(g,14,12,4,1,paperD);
  px(g,15,7,1,1,red); px(g,16,9,1,2,red); px(g,15,11,2,1,red); // spell marks
  // pale face: CLOSED spell-eyes + brows + fangs
  px(g,10,7,13,8,skin); px(g,10,13,13,1,skinD);
  px(g,11,9,3,1,"#3a5a4a"); px(g,20,9,3,1,"#3a5a4a"); // closed lids
  px(g,11,8,3,1,skinD); px(g,20,8,3,1,skinD);
  px(g,12,13,2,2,"#fff"); px(g,18,13,2,2,"#fff"); // fangs
  px(g,14,14,4,1,"#3a5a4a");
  px(g,10,11,2,1,"#7ac8a0"); px(g,20,11,2,1,"#7ac8a0"); // corpse blush
};

/* ============ 18. KELPIE v2 — drowned horse (wet mane + eye-glow + weed) ============ */
D.kelpie = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const coat="#1e3a4a", dark="#0e2230", lite="#3a5a6a", mane="#7ad9f0", maneD="#2a6a7a";
  const weed="#3a6a2a", eye="#9af0ff";
  auraShadow(g,hb,"rgba(60,140,170,0.22)","rgba(140,220,240,0.12)");
  spark(g,[3,14,mane],[28,9,"#fff"],[27,33,mane]);
  const stride=P.moving?((P.f&1)?1:-1):0;
  // ripples at hooves
  px(g,7,35,6,1,mane); px(g,20,36,6,1,maneD);
  // legs: 4 dark columns + pale fetlocks + dark hooves + splash rings
  px(g,8+A.lx,27+A.ld,3,7,coat); px(g,21+A.rx,27+A.rd,3,7,coat);
  px(g,12,28-stride,3,6,coat); px(g,17,28+stride,3,6,coat);
  px(g,8+A.lx,32+A.ld,3,2,lite); px(g,21+A.rx,32+A.rd,3,2,lite);
  px(g,8+A.lx,34+A.ld,3,2,dark); px(g,21+A.rx,34+A.rd,3,2,dark);
  px(g,12,34-stride,3,2,dark); px(g,17,34+stride,3,2,dark);
  px(g,7+A.lx,34+A.ld,5,1,mane); px(g,20+A.rx,34+A.rd,5,1,mane);
  // body + wave sheen + ribs hint
  px(g,7,21,18,8,coat); px(g,7,21,18,2,lite); px(g,7,27,18,2,dark);
  px(g,7,21,1,8,dark);
  px(g,9,23,8,1,mane); px(g,9,23,3,1,"#fff");
  px(g,14,24,2,2,dark); px(g,17,24,2,2,dark);
  // dripping mane strands (icicle rows along crest)
  for(let i=0;i<5;i++){ px(g,9+i*3,14,2,5,mane); px(g,9+i*3,14,2,1,"#fff"); px(g,9+i*3,18,2,1,maneD); }
  // tail: heavy wet strands
  px(g,2,22,3,8,coat); px(g,2,22,3,1,lite);
  px(g,1,26,2,6,mane); px(g,3,28,2,4,maneD);
  // seaweed drapes
  px(g,6,22,2,6,weed); px(g,23,23,2,5,weed); px(g,12,29,2,3,weed);
  px(g,6,22,1,6,"#5da24a"); px(g,23,23,1,5,"#5da24a");
  // neck + head + fin ears
  px(g,20,12,6,10,coat); px(g,20,12,6,1,lite); px(g,20,12,1,10,dark);
  px(g,19,8,8,8,coat); px(g,19,8,8,2,lite);
  px(g,24,10,5,4,"#d9c9b8"); px(g,24,10,5,1,"#fff"); // muzzle
  px(g,27,11,2,2,"#0a1a20"); // nostril
  px(g,25,13,3,1,"#0a1a20"); // mouth
  px(g,25,13,1,1,eye); // teeth glint
  px(g,20,6,3,4,maneD); px(g,25,6,3,4,maneD); // fin ears
  px(g,20,6,3,1,mane); px(g,25,6,3,1,mane);
  // GLOWING eye + brow groove
  px(g,21,10,3,3,dark);
  px(g,21,10,3,2,eye); px(g,22,11,1,1,"#061018");
  px(g,21,10,1,1,"#fff");
  px(g,20,9,5,1,maneD);
  if(P.atk){ px(g,19,8,2,2,eye); px(g,28,12,1,2,eye); }
};

/* ============ 19. LAMASSU CUB v2 — winged bull-calf with a child's vow ============ */
D.lamassu_cub = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const hide="#d9c9a0", dark="#8a7a5a", lite="#f2e8d0", wing="#fffdf6", wingD="#c9b896";
  const gold="#d8a018", goldL="#f6d34e", skin="#d9a06b", skinD="#a86a3a";
  auraShadow(g,hb,"rgba(220,190,140,0.20)","rgba(255,230,190,0.12)");
  spark(g,[3,14,goldL],[28,9,"#fff"],[26,33,goldL]);
  // layered feathered wings (behind)
  const W=P.atk?-2:(P.moving?[0,-2,0,1][P.f&3]:(P.idle?-2:1));
  for(const s of [-1,1]){
    const bx=s<0?0:20;
    px(g,bx,12+W,12,4,wing); px(g,bx,12+W,12,1,"#fff");
    px(g,bx+(s<0?1:2),16+W,9,3,wingD); px(g,bx+(s<0?1:2),18+W,9,1,dark);
    px(g,bx+(s<0?2:5),19+W,5,3,wing); px(g,bx+(s<0?2:5),21+W,5,1,wingD);
  }
  // legs + hooves
  px(g,9+A.lx,28+A.ld,3,6,hide); px(g,20+A.rx,28+A.rd,3,6,hide);
  px(g,14,29,3,5,hide); px(g,17,29,3,5,hide);
  px(g,9+A.lx,34+A.ld,3,2,"#4a3a22"); px(g,20+A.rx,34+A.rd,3,2,"#4a3a22");
  px(g,14,34,3,2,"#4a3a22"); px(g,17,34,3,2,"#4a3a22");
  // bull body + belly + back ridge
  px(g,8,22,16,8,hide); px(g,8,22,16,1,lite); px(g,8,28,16,2,dark);
  px(g,8,22,1,8,dark); px(g,23,22,1,8,dark);
  px(g,10,24,3,2,lite); px(g,15,24,3,2,lite);
  // tail + tuft
  px(g,5,23,2,6,hide); px(g,4,28,4,3,dark); px(g,5,29,2,1,"#fff");
  // necklace of office
  px(g,17,22,7,1,gold); px(g,20,23,2,2,"#c93b3b"); px(g,21,23,1,1,"#fff");
  // HUMAN CHILD head + horned cap + side locks
  px(g,17,10,9,9,skin); px(g,17,10,9,1,"#f2cfa8"); px(g,17,17,9,2,skinD);
  px(g,17,8,9,4,dark); px(g,17,8,9,1,goldL); // cap band
  px(g,18,6,3,3,gold); px(g,22,6,3,3,gold); // horns
  px(g,18,6,3,1,"#fff");
  px(g,16,11,2,7,skinD); px(g,24,11,2,7,skinD); // side locks
  px(g,16,16,2,2,"#5a3a1a"); px(g,24,16,2,2,"#5a3a1a"); // braid ties
  gface(g,17+A.hx,10+hb,{skin,lite:"#f2cfa8",dk:skinD,blush:"#d08070",iris:"#4a2f10",brow:"#3a2410",lip:"#a05a4a"},P.atk);
  // bull ears + beard hint (cub: short)
  px(g,15+A.hx,12+hb,2,3,hide); px(g,25+A.hx,12+hb,2,3,hide);
  px(g,20+A.hx,19+hb,3,1,skinD);
};

/* ============ 20. KOBOLD SHAMAN v2 — candle-crowned dragon-priest ============ */
D.kobold_shaman = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const scale="#6a8a2a", dark="#3a5a1a", lite="#9ac84a", belly="#d9c9a0";
  const robe="#2a4a9a", robeD="#1a2f5a", gold="#d8a018", goldL="#f6d34e", bone="#e8e0d0";
  auraShadow(g,hb,"rgba(120,160,60,0.20)","rgba(200,230,140,0.12)");
  spark(g,[3,14,goldL],[28,9,"#fff"],[26,33,goldL]);
  // tail (reptilian, banded)
  const sw=P.moving?((P.f&1)?1:-1):0;
  px(g,4+sw,26,5,3,scale); px(g,4+sw,26,5,1,lite); px(g,3+sw,27,2,2,dark);
  // legs + clawed feet
  px(g,11+A.lx,29+A.ld,3,5,dark); px(g,18+A.rx,29+A.rd,3,5,dark);
  px(g,10+A.lx,34+A.ld,5,2,dark); px(g,17+A.rx,34+A.rd,5,2,dark);
  px(g,10+A.lx,34+A.ld,1,1,bone); px(g,17+A.rx,34+A.rd,1,1,bone);
  // patched shaman robe + cord + gourd + fetishes
  px(g,9,22,14,8,robe); px(g,9,22,14,1,"#5a7ac8"); px(g,9,28,14,2,robeD);
  px(g,9,22,1,8,robeD); px(g,22,22,1,8,robeD);
  px(g,10,25,4,3,"#5c1216"); px(g,18,25,4,3,"#3a5a1a"); // patches
  px(g,10,25,4,1,"#8a3a3a"); px(g,18,25,4,1,"#6a8a2a");
  px(g,9,24,14,2,goldD()); px(g,9,24,14,1,goldL); // cord
  function goldD(){ return "#8a6410"; }
  px(g,20,26,3,4,"#c9a06a"); px(g,21,27,1,2,dark); // gourd
  // torso scales + bead necklace
  px(g,11,15,10,8,scale); px(g,11,15,10,1,lite); px(g,12,17,8,1,dark);
  for(let i=0;i<4;i++){ px(g,12+i*2,19,1,2,bone); px(g,12+i*2,19,1,1,red0(i)); }
  function red0(i){ return ["#c93b3b","#2a8a8a","#f6d34e","#e8e0d0"][i]; }
  // arms: left holds BONE STAFF with skull, right shakes rattle
  px(g,6+A.lax,17+A.la,4,5,scale); px(g,22+A.rax,17+A.ra,4,5,scale);
  px(g,5+A.lax,22+A.la,3,3,scale); px(g,24+A.rax,22+A.ra,3,3,scale);
  const st=P.atk?-3:0;
  px(g,3+A.lax,8+A.la+st,2,18,"#8a7a5a"); px(g,3+A.lax,8+A.la+st,1,18,"#c9b896");
  px(g,1+A.lax,4+A.la+st,6,5,bone); px(g,2+A.lax,6+A.la+st,2,2,"#111"); px(g,4+A.lax,6+A.la+st,2,2,"#111");
  px(g,3+A.lax,8+A.la+st,2,1,"#999");
  px(g,25+A.rax,20+A.ra,3,4,"#7a5230"); px(g,26+A.rax,21,2,2,goldL);
  if(P.atk){ px(g,1+A.lax,3+A.la+st,2,2,goldL); px(g,6+A.lax,5+A.la+st,1,1,"#fff"); }
  // draconic head: snout + teeth + ears + candle-helmet
  px(g,11,7,10,8,scale); px(g,11,7,10,1,lite); px(g,11,13,10,2,dark);
  px(g,9,6,4,5,scale); px(g,19,6,4,5,scale); // ears
  px(g,9,6,4,1,lite); px(g,19,6,4,1,lite);
  // candle-helmet: wax band + 3 lit candles
  px(g,10,4,12,3,bone); px(g,10,4,12,1,"#fff");
  px(g,12,0,2,4,bone); px(g,15,0,3,5,bone); px(g,19,0,2,4,bone);
  const fl=(P.f%2===0);
  px(g,12,-0+0,2,1,fl?"#ff9d2e":"#ffd93d"); px(g,15,0,3,1,fl?"#ff9d2e":"#ffd93d"); px(g,19,-0+0,2,1,fl?"#ff9d2e":"#ffd93d");
  // snout + nose + teeth
  px(g,12,11,8,4,belly); px(g,12,11,8,1,"#fff");
  px(g,15,12,2,2,"#3a2a1a"); // nose
  px(g,13,14,1,1,"#fff"); px(g,18,14,1,1,"#fff"); // teeth
  // eyes: amber + glint + heavy brow + blush
  px(g,11,8,4,1,"#1a2a0a"); px(g,17,8,4,1,"#1a2a0a");
  px(g,12,9,3,2,"#ffb82a"); px(g,17,9,3,2,"#ffb82a");
  px(g,13,9,1,2,"#0a0a0a"); px(g,18,9,1,2,"#0a0a0a");
  px(g,12,9,1,1,"#fff"); px(g,17,9,1,1,"#fff");
  px(g,11,7,4,1,dark); px(g,17,7,4,1,dark);
  px(g,11,11,2,1,"#c96a5a"); px(g,19,11,2,1,"#c96a5a");
  px(g,14,14,4,1,"#3a2a1a");
};

/* ============ 21. SHIVER OWL v2 — frost-branch hunter (ear tufts + breath) ============ */
D.shiver_owl = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fe="#e8eef4", sh="#b9c9d9", dark="#7a8a9a", eye="#2a7ab8", beak="#e08a2e", frost="#bfe8ff";
  auraShadow(g,hb,"rgba(190,220,240,0.22)","rgba(240,250,255,0.12)");
  spark(g,[3,12,frost],[28,8,"#fff"],[26,33,frost]);
  // frost branch + snow (perched only — no branch mid-air)
  if (!P.moving) {
    px(g,4,33,24,3,"#5a4a3a"); px(g,4,33,24,1,"#8a7a6a");
    px(g,6,32,20,1,"#fff"); px(g,9,31,3,1,"#fff"); px(g,19,31,4,1,"#fff");
  }
  // talons grip the branch at rest; trail tucked in flight
  px(g,11,31,3,3,dark); px(g,18,31,3,3,dark);
  px(g,11,33,1,2,beak); px(g,13,33,1,2,beak); px(g,18,33,1,2,beak); px(g,20,33,1,2,beak);
  // body: round + belly scallops + wing bars
  const fl=P.atk?1:0;
  px(g,9,14,14,18,fe); px(g,9,14,14,2,"#fff");
  px(g,9,14,2,18,sh); px(g,21,14,2,18,sh);
  for(let i=0;i<4;i++){ px(g,11,20+i*3,10,2,sh); px(g,12,20+i*3,8,1,"#fff"); }
  // folded wings at rest; outspread and beating in flight (no perched branch
  // mid-air — the branch + snow only exist while perched)
  if (!P.moving) {
    px(g,6-fl,17,4,11,sh); px(g,22+fl,17,4,11,sh);
    px(g,6-fl,17,4,1,fe); px(g,22+fl,17,4,1,fe);
    px(g,6-fl,21,4,2,dark); px(g,22+fl,21,4,2,dark); px(g,6-fl,26,4,2,dark); px(g,22+fl,26,4,2,dark);
  } else {
    const WAo=Flap(P);
    g.save(); g.translate(9,16); g.rotate(WAo); g.translate(-9,-16);
    px(g,0,10,9,5,sh); px(g,0,10,9,1,fe); px(g,1,13,6,2,dark);
    g.restore();
    g.save(); g.translate(23,16); g.rotate(-WAo); g.translate(-23,-16);
    px(g,23,10,9,5,sh); px(g,23,10,9,1,fe); px(g,25,13,6,2,dark);
    g.restore();
  }
  // ear tufts
  px(g,8,8,4,6,fe); px(g,20,8,4,6,fe);
  px(g,8,8,4,1,sh); px(g,20,8,4,1,sh); px(g,9,8,1,3,dark); px(g,22,8,1,3,dark);
  // facial disc + HUGE forward eyes + glints + beak + breath
  px(g,10,11,12,10,"#fff");
  px(g,13,14,3,4,"#0e2a3a"); px(g,18,14,3,4,"#0e2a3a");
  px(g,13,14,4,4,eye); px(g,18,14,4,4,eye);
  px(g,14,15,2,2,"#061018"); px(g,19,15,2,2,"#061018");
  px(g,13,14,1,1,"#fff"); px(g,18,14,1,1,"#fff");
  px(g,14,18,1,1,"#bfe8ff"); px(g,19,18,1,1,"#bfe8ff");
  px(g,15,19,2,3,beak); px(g,15,19,2,1,"#ffd9a0");
  if(P.atk||((P.f&1)===0)){ px(g,13,23,2,2,"rgba(190,230,255,0.9)"); px(g,11,24,1,1,"#fff"); }
  px(g,12,21,2,1,"#ffb0a0"); px(g,19,21,2,1,"#ffb0a0");
  // snowflakes
  px(g,4,10,1,1,frost); px(g,27,12,1,1,"#fff"); px(g,25,28,1,1,frost);
};

/* ============ 22. WRAITH v2 — hollow choir (folds + wail + chains) ============ */
D.wraith = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const sh="rgba(126,196,212,0.95)", mid="rgba(178,238,246,0.95)", dk="rgba(70,130,145,0.95)", hollow="#060f14";
  auraShadow(g,hb,"rgba(120,200,220,0.22)","rgba(190,245,255,0.14)");
  spark(g,[3,14,"#e2feff"],[28,10,"#fff"],[25,33,"#e2feff"]);
  const wail=P.atk?2:0;
  // glide: the whole shroud sways with the stride while hovering.
  const gl=P.moving?([0,1,0,-1][P.f&3]):0;
  // hood: rounded dome stepped + crown fold
  px(g,13+gl,3,6,2,sh); px(g,11+gl,5,10,2,sh); px(g,10+gl,7,12,3,sh);
  px(g,9+gl,10,14,4,sh); px(g,12+gl,7,8,1,mid);
  // drape edges + fold shading (3 folds break the flat panel)
  px(g,9+gl,10,2,18,dk); px(g,21+gl,10,2,18,dk);
  px(g,11+gl,14,10,14,sh); px(g,12+gl,15,8,12,mid);
  px(g,15+gl,15,1,11,"rgba(70,130,145,0.5)"); px(g,18+gl,15,1,11,"rgba(70,130,145,0.35)");
  px(g,13+gl,14,1,4,dk);
  // single dark hollow (taller, wails open on atk)
  px(g,13+gl,11,6,3,"#0a1a20");
  if(P.atk){ px(g,13+gl,14,6,6,hollow); px(g,14+gl,15,4,4,"#12303f");
    px(g,14+gl,14,1,3,"#e2feff"); px(g,17+gl,14,1,3,"#e2feff");
    px(g,15+gl,18,2,2,"#0a3a4a"); }
  else { px(g,13+gl,14,5,3,"#0a1a20"); px(g,14+gl,17,4,2,"#0a1a20"); px(g,14+gl,15,4,4,hollow); }
  px(g,14+gl,12,4,6,"#060f14");
  // close-set uneven slit eyes + glow (visor break)
  px(g,14+gl,13+wail,2,4,"rgba(141,252,255,0.35)"); px(g,17+gl,14+wail,2,4,"rgba(141,252,255,0.35)");
  px(g,14+gl,13+wail,1,3,"#e2feff"); px(g,17+gl,14+wail,1,3,"#e2feff");
  // small dark mouth (below hollow when calm)
  if(!P.atk){ px(g,15+gl,20,2,1,hollow); }
  // chains across chest (binding the hollow)
  px(g,9+gl,21,14,1,"#5a6a7a"); px(g,11+gl,21,1,1,"#9adcff"); px(g,15+gl,21,1,1,"#9adcff"); px(g,19+gl,21,1,1,"#9adcff");
  px(g,10+gl,21,2,2,"#3a4a5a"); px(g,18+gl,21,2,2,"#3a4a5a");
  // arms: uneven, melting (right shorter) + wisps
  px(g,7+gl,18,3,7,sh); px(g,7+gl,24,2,4,sh);
  px(g,22+gl,16,3,7,sh); px(g,23+gl,22,2,5,sh);
  px(g,6+gl,25,1,3,mid); px(g,24+gl,24,1,4,mid);
  // ragged hem: varied widths + gaps + wisps
  px(g,10+gl,27,3,9,sh); px(g,14+gl,27,2,5,sh); px(g,17+gl,27,4,10,sh); px(g,22+gl,27,2,6,sh);
  px(g,10+gl,34,1,2,mid); px(g,19+gl,35,1,2,mid); px(g,23+gl,31,1,3,mid);
  px(g,13+gl,32,1,3,"rgba(126,196,212,0.6)"); px(g,20+gl,33,1,4,"rgba(126,196,212,0.6)");
};

/* Batch E complete: all 22 parity targets painted (21 requested + brook_seraph
 * kept distinct). No further kinds below this line. */
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
    try{ D[kind](g,tint||"#fff",P); }catch(e){}
    let out=c;
    try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>700) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
})();
