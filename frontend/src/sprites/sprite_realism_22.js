/* src/sprites/sprite_realism_22.js — GODDESS/PETER BAR REALISM (22 mobs + PETER v12).
 * Outermost wrapper. Loaded AFTER sprite_goddess_bar.js.
 * Bar: aura+shadow+sparkles, ~110-150 rects, 1px highlights/shading,
 * detailed face (lash/iris/pupil/catchlight/blush/mouth), texture rows,
 * jewelry/weapons, pose-aware via Anim.normP/limb/hbob/seg/quad/flap.
 * Also PETER THE FALLEN v12 — VOID TYRANT PERFECTED (10/10): masked black demon
 * face with voidstalker purple fire, bone horns, broken halo, torn wings,
 * chest maw, voidglass blade. Dialogue in main_story.js updated to match.
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

/* ============ 1. GOBLIN v7 — cave cutthroat (goddess bar) ============ */
D.goblin = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#3fa34d";
  const dk=shade(skin,-42), deep=shade(skin,-72), lite=shade(skin,32), pale=shade(skin,58);
  const gold="#d9a91e", goldL="#ffe37a", goldD="#8a6410";
  const leather="#5a3a22", leatherL="#8a5a33", bone="#e8e0d0";
  auraShadow(g,hb,"rgba(110,200,90,0.20)","rgba(255,217,61,0.08)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,lite]);
  // bowed legs + sandals + anklet
  px(g,10+A.lx,29+A.ld,4,6,skin); px(g,18+A.rx,29+A.rd,4,6,skin);
  px(g,10+A.lx,29+A.ld,1,6,lite); px(g,21+A.rx,29+A.rd,1,6,deep);
  px(g,10+A.lx,32+A.ld,4,2,dk); px(g,18+A.rx,32+A.rd,4,2,dk);
  px(g,9+A.lx,34+A.ld,6,2,"#3a2a1a"); px(g,17+A.rx,34+A.rd,6,2,"#3a2a1a");
  px(g,9+A.lx,34+A.ld,6,1,leatherL); px(g,10+A.lx,34+A.ld,1,1,goldL);
  // torso: bare chest + hide vest + skull belt
  px(g,8,17,16,13,skin); px(g,8,17,16,1,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,deep); px(g,22,17,2,13,deep);
  px(g,10,19,12,8,leather); px(g,10,19,12,2,leatherL); px(g,10,25,12,2,"#3a2412");
  px(g,11,20,2,6,leatherL); px(g,19,20,2,6,leatherL);
  px(g,12,21,8,3,"#4a2e1a"); px(g,13,22,2,1,"#8a5a33");
  px(g,9,27,14,3,gold); px(g,9,27,14,1,goldL); px(g,9,29,14,1,goldD);
  px(g,14,27,4,3,bone); px(g,15,28,2,1,"#111"); px(g,15,27,1,1,"#fff");
  // LEFT arm + dagger (low)
  px(g,3+A.lax,19+A.la,4,7,skin); px(g,3+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,25+A.la,4,2,dk);
  const sw=P.atk?-4:0;
  px(g,2+A.lax,12+A.la+sw,2,13,bone); px(g,2+A.lax,12+A.la+sw,1,13,"#fff");
  px(g,1+A.lax,10+A.la+sw,4,3,"#9aa0a8"); px(g,1+A.lax,10+A.la+sw,4,1,"#fff");
  px(g,2+A.lax,25+A.la,4,2,skin);
  // RIGHT arm + torch? no — fist + wrist wrap
  px(g,25+A.rax,19+A.ra,4,7,skin); px(g,25+A.rax,19+A.ra,1,7,lite);
  px(g,25+A.rax,25+A.ra,4,2,leather); px(g,25+A.rax,26+A.ra,4,1,leatherL);
  // bat ears + gold rings
  g.fillStyle=skin; g.beginPath(); g.moveTo(9+A.hx,12+hb); g.lineTo(1+A.hx,7+hb); g.lineTo(4+A.hx,16+hb); g.fill();
  g.beginPath(); g.moveTo(23+A.hx,12+hb); g.lineTo(31+A.hx,7+hb); g.lineTo(28+A.hx,16+hb); g.fill();
  g.fillStyle=lite; g.beginPath(); g.moveTo(8+A.hx,12+hb); g.lineTo(2+A.hx,8+hb); g.lineTo(4+A.hx,14+hb); g.fill();
  g.beginPath(); g.moveTo(24+A.hx,12+hb); g.lineTo(30+A.hx,8+hb); g.lineTo(28+A.hx,14+hb); g.fill();
  px(g,2+A.hx,8+hb,3,3,gold); px(g,27+A.hx,8+hb,3,3,gold);
  px(g,3+A.hx,12+hb,4,3,skin); px(g,25+A.hx,12+hb,4,3,skin);
  // head: heavy brow, warts, fanged grin
  px(g,9+A.hx,7+hb,14,11,skin); px(g,9+A.hx,7+hb,14,2,lite); px(g,9+A.hx,16+hb,14,2,dk);
  px(g,9+A.hx,7+hb,2,11,deep); px(g,21+A.hx,7+hb,2,11,deep);
  px(g,9+A.hx,7+hb,14,1,pale);
  px(g,11+A.hx,11+hb,4,3,"#ffe95e"); px(g,17+A.hx,11+hb,4,3,"#ffe95e");
  px(g,11+A.hx,11+hb,4,1,"#fff2b0"); px(g,17+A.hx,11+hb,4,1,"#fff2b0");
  px(g,12+A.hx,12+hb,2,2,"#111"); px(g,18+A.hx,12+hb,2,2,"#111");
  px(g,11+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,10+A.hx,9+hb,5,1,deep); px(g,17+A.hx,9+hb,5,1,deep);
  px(g,14+A.hx,10+hb,1,1,dk); px(g,19+A.hx,15+hb,1,1,dk);
  px(g,14+A.hx,14+hb,4,2,dk);
  px(g,11+A.hx,16+hb,10,2,"#5a1a1a"); px(g,12+A.hx,16+hb,2,2,"#fff"); px(g,18+A.hx,16+hb,2,2,"#fff");
  px(g,15+A.hx,14+hb,2,1,"#fff");
  px(g,12+A.hx,10+hb,3,1,"#7ccc6a");
};

/* ============ 2. GOBLIN BRUTE v7 — pit enforcer ============ */
D.goblin_brute = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#2a6a2a";
  const dk=shade(skin,-40), deep=shade(skin,-70), lite=shade(skin,30), pale=shade(skin,55);
  const iron="#5a5e66", ironL="#9aa0a8", blood="#c93b3b", gold="#d9a91e";
  auraShadow(g,hb,"rgba(110,200,90,0.22)","rgba(255,90,90,0.10)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,blood]);
  // tree-trunk legs + war boots
  px(g,8+A.lx,28+A.ld,6,7,skin); px(g,18+A.rx,28+A.rd,6,7,skin);
  px(g,8+A.lx,28+A.ld,2,7,lite); px(g,22+A.rx,28+A.rd,2,7,deep);
  px(g,8+A.lx,31+A.ld,6,2,dk); px(g,18+A.rx,31+A.rd,6,2,dk);
  px(g,7+A.lx,34+A.ld,8,2,"#2a1a10"); px(g,17+A.rx,34+A.rd,8,2,"#2a1a10");
  px(g,7+A.lx,34+A.ld,8,1,"#8a5a33");
  // barrel torso + iron pauldrons + war paint + belt
  px(g,6,16,20,14,skin); px(g,6,16,20,2,lite); px(g,6,28,20,2,dk);
  px(g,6,16,3,14,deep); px(g,23,16,3,14,deep);
  px(g,9,18,14,10,dk); px(g,10,19,12,8,skin); px(g,10,19,12,1,lite);
  px(g,12,20,3,6,blood); px(g,17,20,3,6,blood); px(g,12,20,3,1,"#ff8a8a");
  px(g,1+A.lax,13+A.la,9,6,iron); px(g,1+A.lax,13+A.la,9,1,ironL); px(g,2+A.lax,15+A.la,7,1,"#3a3d44");
  px(g,22+A.rax,13+A.ra,9,6,iron); px(g,22+A.rax,13+A.ra,9,1,ironL);
  px(g,2+A.lax,13+A.la,3,2,blood); px(g,26+A.rax,13+A.ra,3,2,blood);
  px(g,8,27,16,3,"#3a2a1a"); px(g,8,27,16,1,"#8a5a33");
  px(g,14,27,4,3,gold);
  // LEFT fist + knuckle studs
  px(g,2+A.lax,19+A.la,4,8,skin); px(g,2+A.lax,19+A.la,1,8,lite);
  px(g,2+A.lax,26+A.la,4,3,dk); px(g,2+A.lax,28+A.la,1,2,bone0()); px(g,4+A.lax,28+A.la,1,2,bone0());
  function bone0(){ return "#e8e0d0"; }
  // RIGHT + spiked club (hefts on atk)
  const ch=P.atk?-6:0;
  px(g,26+A.rax,19+A.ra+ch,4,7,skin);
  px(g,26+A.rax,10+A.ra+ch,3,14,"#5a3a22"); px(g,26+A.rax,10+A.ra+ch,1,14,"#a97648");
  px(g,23+A.rax,6+A.ra+ch,8,7,"#3a2a1a"); px(g,23+A.rax,6+A.ra+ch,8,1,"#8a5a33");
  px(g,24+A.rax,7+A.ra+ch,2,2,ironL); px(g,27+A.rax,7+A.ra+ch,2,2,ironL); px(g,24+A.rax,10+A.ra+ch,2,2,ironL);
  // head: low brow, red eyes, tusked maw, scar
  px(g,9+A.hx,6+hb,14,12,skin); px(g,9+A.hx,6+hb,14,2,lite); px(g,9+A.hx,16+hb,14,2,dk);
  px(g,9+A.hx,6+hb,2,12,deep); px(g,21+A.hx,6+hb,2,12,deep);
  g.fillStyle=skin; g.beginPath(); g.moveTo(10+A.hx,9+hb); g.lineTo(4+A.hx,4+hb); g.lineTo(7+A.hx,11+hb); g.fill();
  g.beginPath(); g.moveTo(22+A.hx,9+hb); g.lineTo(28+A.hx,4+hb); g.lineTo(25+A.hx,11+hb); g.fill();
  px(g,12+A.hx,9+hb,3,2,"#ff3b3b"); px(g,18+A.hx,9+hb,3,2,"#ff3b3b");
  px(g,13+A.hx,9+hb,1,2,"#111"); px(g,19+A.hx,9+hb,1,2,"#111");
  px(g,12+A.hx,9+hb,1,1,"#fff");
  px(g,11+A.hx,8+hb,5,1,deep); px(g,18+A.hx,8+hb,5,1,deep);
  px(g,12+A.hx,14+hb,8,4,"#5a1a1a"); px(g,12+A.hx,14+hb,2,4,"#fff"); px(g,18+A.hx,14+hb,2,4,"#fff");
  px(g,19+A.hx,11+hb,1,5,blood);
};

/* ============ 3. GOBLIN SHAMAN v7 — ember oracle ============ */
D.goblin_shaman = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe=tint&&tint!=="#ffffff"?tint:"#2f8a4f";
  const dk=shade(robe,-42), deep=shade(robe,-72), lite=shade(robe,32);
  const skin="#55a04a", skinD="#2c5a26", gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(110,220,120,0.22)","rgba(255,157,46,0.12)");
  spark(g,[3,16,lite],[28,14,"#fff"],[26,33,"#ff9d2e"]);
  // feet under robe
  px(g,11+A.lx,32+A.ld,4,3,skinD); px(g,17+A.rx,32+A.rd,4,3,skinD);
  px(g,10+A.lx,34+A.ld,6,2,"#3a2a1a"); px(g,16+A.rx,34+A.rd,6,2,"#3a2a1a");
  // layered robe + fur collar + beads + pouches
  px(g,8,18,16,16,robe); px(g,8,18,16,2,lite); px(g,8,32,16,2,deep);
  px(g,8,18,2,16,deep); px(g,22,18,2,16,deep);
  px(g,11,20,10,10,dk); px(g,12,21,8,8,shade(robe,-20));
  for(let y=21;y<29;y+=2) px(g,12,y,8,1,"rgba(0,0,0,0.25)");
  px(g,9,18,14,3,"#e8d9c0"); px(g,9,18,14,1,"#fff"); px(g,10,19,3,2,"#8a7a6a"); px(g,19,19,3,2,"#8a7a6a");
  for(let i=0;i<5;i++){ px(g,10+i*3,24,2,2,"#1a0a10"); px(g,10+i*3,24,1,1,"#ff9d2e"); }
  px(g,10,29,4,3,"#5a3a22"); px(g,18,29,4,3,"#5a3a22"); px(g,11,30,2,1,"#ff9d2e"); px(g,19,30,2,1,"#c9a227");
  px(g,14,20,4,2,gold); px(g,14,20,4,1,goldL);
  // LEFT: claw + fetish
  px(g,4+A.lax,19+A.la,4,7,skin);
  px(g,4+A.lax,26+A.la,4,3,skinD); px(g,4+A.lax,28+A.la,2,2,bone1()); px(g,6+A.lax,28+A.la,2,2,bone1());
  function bone1(){ return "#e8e0d0"; }
  // RIGHT: skull staff (rises on cast)
  const cs=P.atk?-5:0;
  px(g,25+A.rax,14+A.ra+cs,2,16,"#5a3a22"); px(g,25+A.rax,14+A.ra+cs,1,16,"#a97648");
  px(g,23+A.rax,8+A.ra+cs,6,7,bone1()); px(g,23+A.rax,8+A.ra+cs,6,1,"#fff");
  px(g,24+A.rax,9+A.ra+cs,1,2,"#111"); px(g,26+A.rax,9+A.ra+cs,1,2,"#111");
  px(g,24+A.rax,11+A.ra+cs,3,1,"#5a1a1a");
  g.fillStyle="rgba(255,157,46,0.35)"; g.beginPath(); g.arc(26+A.rax,10+A.ra+cs,5,0,7); g.fill();
  px(g,25+A.rax,9+A.ra+cs,2,2,"#ff9d2e"); px(g,25+A.rax,9+A.ra+cs,1,1,"#fff");
  px(g,22+A.rax,12+A.ra+cs,2,2,"#5a3a22"); px(g,28+A.rax,12+A.ra+cs,2,2,"#5a3a22");
  // head: bat ears + gold eyes + fangs + face paint
  g.fillStyle=skin; g.beginPath(); g.moveTo(9+A.hx,11+hb); g.lineTo(2+A.hx,7+hb); g.lineTo(5+A.hx,15+hb); g.fill();
  g.beginPath(); g.moveTo(23+A.hx,11+hb); g.lineTo(30+A.hx,7+hb); g.lineTo(27+A.hx,15+hb); g.fill();
  px(g,9+A.hx,7+hb,14,11,skin); px(g,9+A.hx,7+hb,14,2,"#7ccc6a"); px(g,9+A.hx,16+hb,14,2,skinD);
  px(g,9+A.hx,7+hb,2,11,skinD); px(g,21+A.hx,7+hb,2,11,skinD);
  px(g,11+A.hx,11+hb,4,3,"#ffe14d"); px(g,17+A.hx,11+hb,4,3,"#ffe14d");
  px(g,12+A.hx,12+hb,2,2,"#111"); px(g,18+A.hx,12+hb,2,2,"#111");
  px(g,11+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,12+A.hx,15+hb,2,4,"#fff"); px(g,18+A.hx,15+hb,2,4,"#fff");
  px(g,13+A.hx,8+hb,6,1,"#ff9d2e"); px(g,14+A.hx,9+hb,4,1,bone1());
  // feathered headdress: bone + red gems + feather
  px(g,11+A.hx,2+hb,10,5,"#d9c27f"); px(g,11+A.hx,2+hb,10,1,"#fff"); px(g,11+A.hx,6+hb,10,1,"#8a6a2a");
  px(g,12+A.hx,3+hb,2,3,"#c93b3b"); px(g,15+A.hx,3+hb,2,3,"#c93b3b"); px(g,18+A.hx,3+hb,2,3,"#c93b3b");
  px(g,15+A.hx,0+hb,2,3,"#c93b3b"); px(g,15+A.hx,0+hb,1,1,"#fff");
  px(g,22+A.hx,1+hb,3,4,"#7a9a3a"); px(g,22+A.hx,1+hb,1,1,"#fff");
};

/* ============ 4. KOBOLD v7 — candle miner ============ */
D.kobold = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const scale=tint&&tint!=="#ffffff"?tint:"#7a9a3a";
  const dk=shade(scale,-40), deep=shade(scale,-70), lite=shade(scale,30), pale=shade(scale,55);
  const belly="#e8d9b0", leather="#5a3a22", leatherL="#8a5a33", gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(170,190,80,0.20)","rgba(255,217,61,0.08)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,goldL]);
  // digitigrade legs + clawed feet
  px(g,10+A.lx,28+A.ld,4,6,scale); px(g,18+A.rx,28+A.rd,4,6,scale);
  px(g,10+A.lx,28+A.ld,1,6,lite); px(g,21+A.rx,28+A.rd,1,6,deep);
  px(g,10+A.lx,30+A.ld,4,2,dk); px(g,18+A.rx,30+A.rd,4,2,dk);
  px(g,9+A.lx,33+A.ld,6,3,"#2a1a10"); px(g,17+A.rx,33+A.rd,6,3,"#2a1a10");
  px(g,9+A.lx,33+A.ld,2,1,belly); px(g,17+A.rx,33+A.rd,2,1,belly);
  // tail lash
  const tw=Sg(P,0,1);
  px(g,2+tw,24,4,3,scale); px(g,1+tw,26,5,2,dk); px(g,1+tw,26,5,1,lite);
  // torso: scaled chest + belly + harness + lantern hook
  px(g,8,17,16,13,scale); px(g,8,17,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,deep); px(g,22,17,2,13,deep);
  px(g,11,19,10,9,belly); px(g,11,19,10,1,"#fff"); px(g,11,26,10,2,"#c9b98a");
  for(let y=21;y<26;y+=2) px(g,12,y,8,1,"rgba(0,0,0,0.18)");
  px(g,9,22,14,3,leather); px(g,9,22,14,1,leatherL);
  px(g,14,22,4,3,gold); px(g,15,23,2,1,"#111"); px(g,15,22,1,1,"#fff");
  // LEFT arm + candle lantern
  px(g,4+A.lax,19+A.la,3,8,scale); px(g,4+A.lax,19+A.la,1,8,lite);
  px(g,3+A.lax,26+A.la,4,4,"#3a2a1a"); px(g,3+A.lax,26+A.la,4,1,leatherL);
  px(g,3+A.lax,22+A.la,4,6,"rgba(255,200,90,0.25)");
  px(g,4+A.lax,23+A.la,2,4,"#ffe9a0"); px(g,4+A.lax,23+A.la,2,1,"#fff");
  px(g,4+A.lax,22+A.la,2,1,"#ff9d2e"); px(g,5+A.lax,21+A.la,1,2,"#ff9d2e");
  // RIGHT arm + spear (thrusts on atk)
  const th=P.atk?-4:0;
  px(g,25+A.rax,19+A.ra+th,3,8,scale); px(g,25+A.rax,19+A.ra+th,1,8,lite);
  px(g,25+A.rax,10+A.ra+th,2,16,leather); px(g,25+A.rax,10+A.ra+th,1,16,leatherL);
  px(g,24+A.rax,6+A.ra+th,4,5,"#9aa0a8"); px(g,24+A.rax,6+A.ra+th,4,1,"#fff"); px(g,24+A.rax,10+A.ra+th,4,1,"#5a5e66");
  px(g,25+A.rax,5+A.ra+th,2,2,"#e8e0d0");
  // head: long snout, nostrils, gold eyes, ear fins
  g.fillStyle=scale; g.beginPath(); g.moveTo(10+A.hx,10+hb); g.lineTo(4+A.hx,4+hb); g.lineTo(8+A.hx,13+hb); g.fill();
  g.beginPath(); g.moveTo(22+A.hx,10+hb); g.lineTo(28+A.hx,4+hb); g.lineTo(24+A.hx,13+hb); g.fill();
  g.fillStyle=lite; g.beginPath(); g.moveTo(9+A.hx,10+hb); g.lineTo(5+A.hx,5+hb); g.lineTo(8+A.hx,12+hb); g.fill();
  px(g,9+A.hx,7+hb,14,11,scale); px(g,9+A.hx,7+hb,14,2,lite); px(g,9+A.hx,16+hb,14,2,dk);
  px(g,9+A.hx,7+hb,2,11,deep); px(g,21+A.hx,7+hb,2,11,deep);
  px(g,11+A.hx,14+hb,10,4,belly); px(g,12+A.hx,15+hb,2,2,"#8a5a33"); px(g,18+A.hx,15+hb,2,2,"#8a5a33");
  px(g,12+A.hx,15+hb,1,1,"#111"); px(g,18+A.hx,15+hb,1,1,"#111");
  px(g,11+A.hx,11+hb,4,3,"#ffe14d"); px(g,17+A.hx,11+hb,4,3,"#ffe14d");
  px(g,11+A.hx,11+hb,4,1,"#fff2b0"); px(g,17+A.hx,11+hb,4,1,"#fff2b0");
  px(g,12+A.hx,12+hb,2,2,"#111"); px(g,18+A.hx,12+hb,2,2,"#111");
  px(g,11+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,10+A.hx,10+hb,5,1,deep); px(g,17+A.hx,10+hb,5,1,deep);
  px(g,14+A.hx,16+hb,4,1,"#7a4a2a");
  // miner candle helm: leather strap + wax + flame
  px(g,9+A.hx,4+hb,14,3,leather); px(g,9+A.hx,4+hb,14,1,leatherL);
  px(g,14+A.hx,1+hb,4,4,"#e8e0d0"); px(g,14+A.hx,1+hb,4,1,"#fff");
  px(g,15+A.hx,0+hb,2,2,"#ff9d2e"); px(g,15+A.hx,0+hb,1,1,"#fff");
  g.fillStyle="rgba(255,157,46,0.30)"; g.beginPath(); g.arc(16+A.hx,1+hb,4,0,7); g.fill();
};

/* ============ 5. CULTIST v7 — pit acolyte ============ */
D.cultist = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe=tint&&tint!=="#ffffff"?tint:"#7a2b8f";
  const dk=shade(robe,-42), deep=shade(robe,-72), lite=shade(robe,32);
  const gold="#ffd93d", goldL="#fff2b0", voidc="#0c0a12", eyec="#c77dff";
  auraShadow(g,hb,"rgba(140,60,220,0.22)","rgba(199,125,255,0.10)");
  spark(g,[3,20,eyec],[28,16,"#fff"],[26,33,eyec]);
  // feet + hem
  px(g,11+A.lx,32+A.ld,4,4,deep); px(g,17+A.rx,32+A.rd,4,4,deep);
  px(g,10+A.lx,35+A.ld,6,2,"#0c0a12"); px(g,16+A.rx,35+A.rd,6,2,"#0c0a12");
  // robe: panels, folds, gold hem runes
  px(g,8,18,16,16,robe); px(g,8,18,16,2,lite); px(g,8,32,16,2,deep);
  px(g,8,18,2,16,deep); px(g,22,18,2,16,"#3a1a52");
  px(g,11,20,10,12,"#5a2a7a"); px(g,12,21,8,10,"#6a3a8a");
  for(let y=22;y<30;y+=2) px(g,15,y,1,2,"rgba(0,0,0,0.25)");
  px(g,9,30,5,3,gold); px(g,18,30,5,3,gold); px(g,10,30,2,1,goldL); px(g,19,30,2,1,goldL);
  px(g,14,20,4,10,deep); px(g,15,21,2,8,"#2e1450");
  // chest amulet: gold + violet eye
  px(g,13,20,6,6,gold); px(g,13,20,6,1,goldL); px(g,14,21,4,4,voidc);
  px(g,15,22,2,2,eyec); px(g,15,22,1,1,"#fff");
  // LEFT: bell sleeve + claw
  px(g,4+A.lax,19+A.la,4,9,robe); px(g,4+A.lax,19+A.la,1,9,lite);
  px(g,4+A.lax,27+A.la,4,2,deep); px(g,4+A.lax,29+A.la,4,3,"#d9c9b0"); px(g,4+A.lax,29+A.la,1,3,"#fff");
  // RIGHT: ritual dagger (raises on atk)
  const up=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+up,4,7,robe); px(g,25+A.rax,19+A.ra+up,1,7,lite);
  px(g,25+A.rax,12+A.ra+up,2,12,"#5a3a22"); px(g,25+A.rax,12+A.ra+up,1,12,"#a97648");
  px(g,24+A.rax,8+A.ra+up,4,5,"#c9ccd4"); px(g,24+A.rax,8+A.ra+up,4,1,"#fff");
  px(g,25+A.rax,9+A.ra+up,1,1,eyec);
  px(g,25+A.rax,24+A.ra+up,4,2,"#3a2a1a");
  // head: hood + void face + blazing eyes
  px(g,8,4,16,8,robe); px(g,8,4,16,1,lite); px(g,8,10,16,2,deep);
  px(g,8,4,3,12,deep); px(g,21,4,3,12,deep);
  px(g,11+A.hx,9+hb,10,9,voidc); px(g,11+A.hx,9+hb,1,9,lite); px(g,20+A.hx,9+hb,1,9,"#000");
  px(g,12+A.hx,12+hb,3,3,eyec); px(g,17+A.hx,12+hb,3,3,eyec);
  g.fillStyle="#ff9d2e"; g.fillRect(13+A.hx,13+hb,1,2); g.fillRect(18+A.hx,13+hb,1,2);
  px(g,13+A.hx,12+hb,1,1,"#fff"); px(g,18+A.hx,12+hb,1,1,"#fff");
  px(g,13+A.hx,16+hb,6,1,"#3a1a52");
  px(g,10+A.hx,2+hb,12,3,gold); px(g,10+A.hx,2+hb,12,1,goldL);
  px(g,14+A.hx,5+hb,4,2,eyec); px(g,15+A.hx,5+hb,1,1,"#fff");
};

/* ============ 6. CROW TENGU v7 — storm crow ============ */
D.tengu_crow = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const feather=tint&&tint!=="#ffffff"?tint:"#2a2a3a";
  const dk=shade(feather,-30), deep="#0c0c12", lite=shade(feather,34);
  const skin="#d9a06b", skinD="#a06a3a", gold="#d9a91e", goldL="#ffe37a";
  const robe="#3a2a5a", robeL="#5a4a7a";
  const W=P.atk?-3:(P.moving?[0,-2,0,2][P.f&3]:(P.idle?-2:2));
  auraShadow(g,hb,"rgba(120,120,180,0.22)","rgba(127,212,255,0.10)");
  spark(g,[3,10,lite],[28,6,"#fff"],[26,33,"#7fd4ff"]);
  // wings: broad crow sails with pale tips + finger feathers
  g.fillStyle=deep;
  g.beginPath(); g.moveTo(12,22+W); g.lineTo(0,6+W); g.lineTo(3,14+W); g.lineTo(7,13+W); g.lineTo(9,21+W); g.fill();
  g.beginPath(); g.moveTo(20,22+W); g.lineTo(32,6+W); g.lineTo(29,14+W); g.lineTo(25,13+W); g.lineTo(23,21+W); g.fill();
  g.fillStyle=feather;
  g.beginPath(); g.moveTo(11,21+W); g.lineTo(2,8+W); g.lineTo(4,13+W); g.lineTo(8,20+W); g.fill();
  g.beginPath(); g.moveTo(21,21+W); g.lineTo(30,8+W); g.lineTo(28,13+W); g.lineTo(24,20+W); g.fill();
  px(g,0,6+W,2,7,"#e8e8f2"); px(g,30,6+W,2,7,"#e8e8f2");
  px(g,1,8+W,2,5,feather); px(g,29,8+W,2,5,feather);
  px(g,4,12+W,3,6,dk); px(g,25,12+W,3,6,dk);
  px(g,0,5+W,3,2,lite); px(g,29,5+W,3,2,lite);
  // geta legs
  px(g,11+A.lx,28+A.ld,3,6,"#1a1a24"); px(g,18+A.rx,28+A.rd,3,6,"#1a1a24");
  px(g,10+A.lx,34+A.ld,5,2,"#5a3a22"); px(g,17+A.rx,34+A.rd,5,2,"#5a3a22");
  // robe: priest layers + rope + bells
  px(g,8,17,16,13,robe); px(g,8,17,16,2,robeL); px(g,8,28,16,2,deep);
  px(g,8,17,2,13,deep); px(g,22,17,2,13,deep);
  px(g,10,19,12,8,"#4a3a6a"); px(g,11,20,10,6,"#5a4a7a");
  px(g,10,24,12,2,gold); px(g,10,24,12,1,goldL);
  px(g,14,20,2,3,"#7fd4ff"); px(g,17,20,2,3,"#7fd4ff"); px(g,15,21,1,1,"#fff");
  px(g,12,26,3,2,"#c9a227"); px(g,17,26,3,2,"#c9a227");
  // arms: feathered + hands
  px(g,5+A.lax,18+A.la,4,7,feather); px(g,5+A.lax,18+A.la,1,7,lite);
  px(g,5+A.lax,24+A.la,4,2,skin);
  const st=P.atk?-4:0;
  px(g,23+A.rax,18+A.ra+st,4,7,feather);
  px(g,24+A.rax,10+A.ra+st,2,14,"#5a3a22"); px(g,24+A.rax,10+A.ra+st,1,14,"#a97648");
  px(g,22+A.rax,8+A.ra+st,6,4,gold); px(g,23+A.rax,9+A.ra+st,4,2,robe);
  px(g,25+A.rax,12+A.ra+st,1,3,"#fff");
  // head: crow beak + gold eyes + headband
  px(g,10+A.hx,7+hb,12,10,skin); px(g,10+A.hx,7+hb,12,2,"#f2c890"); px(g,10+A.hx,15+hb,12,2,skinD);
  px(g,10+A.hx,12+hb,12,5,"#1a1a1a"); px(g,10+A.hx,12+hb,12,1,"#3a3a4a");
  px(g,13+A.hx,13+hb,6,3,"#e8d9a0"); px(g,14+A.hx,14+hb,4,2,"#c9a06a");
  px(g,12+A.hx,10+hb,3,3,"#ffe14d"); px(g,18+A.hx,10+hb,3,3,"#ffe14d");
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,19+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,18+A.hx,10+hb,1,1,"#fff");
  px(g,12+A.hx,9+hb,3,1,deep); px(g,17+A.hx,9+hb,3,1,deep);
  px(g,9+A.hx,5+hb,14,3,"#e8e0d0"); px(g,9+A.hx,5+hb,14,1,"#fff");
  px(g,14+A.hx,6+hb,4,2,"#c93b3b"); px(g,15+A.hx,6+hb,2,1,"#fff");
};

/* ============ 7. CYCLOPS WHELP v7 — one-eyed calf ============ */
D.cyclops_whelp = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#9a8a6a";
  const dk=shade(skin,-38), deep=shade(skin,-68), lite=shade(skin,30), pale=shade(skin,55);
  const cloth="#3a5a3a", clothL="#5a7a4a", iron="#8a8e96", bone="#e8e0d0";
  auraShadow(g,hb,"rgba(200,180,130,0.20)","rgba(255,217,61,0.08)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,lite]);
  // pillar legs + sandals
  px(g,9+A.lx,28+A.ld,5,7,skin); px(g,18+A.rx,28+A.rd,5,7,skin);
  px(g,9+A.lx,28+A.ld,2,7,lite); px(g,21+A.rx,28+A.rd,2,7,deep);
  px(g,8+A.lx,34+A.ld,7,2,"#2a1a10"); px(g,17+A.rx,34+A.rd,7,2,"#2a1a10");
  px(g,8+A.lx,34+A.ld,7,1,"#8a5a33");
  // torso: bare + strap + loincloth
  px(g,8,16,16,14,skin); px(g,8,16,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,16,3,14,deep); px(g,21,16,3,14,deep);
  px(g,10,22,12,5,cloth); px(g,10,22,12,1,clothL); px(g,15,22,2,5,"#2a4a2a");
  px(g,11,19,10,2,"#5a3a22"); px(g,11,19,2,2,bone);
  // LEFT fist
  px(g,3+A.lax,19+A.la,4,8,skin); px(g,3+A.lax,19+A.la,1,8,lite);
  px(g,3+A.lax,26+A.la,4,3,dk);
  // RIGHT + stone club (hefts on atk)
  const ch=P.atk?-6:0;
  px(g,25+A.rax,19+A.ra+ch,4,8,skin); px(g,25+A.rax,19+A.ra+ch,1,8,lite);
  px(g,26+A.rax,10+A.ra+ch,3,14,"#5a3a22"); px(g,26+A.rax,10+A.ra+ch,1,14,"#a97648");
  px(g,23+A.rax,6+A.ra+ch,8,6,"#8a8a92"); px(g,23+A.rax,6+A.ra+ch,8,1,"#c9ccd4"); px(g,23+A.rax,11+A.ra+ch,8,1,"#5a5e66");
  px(g,24+A.rax,7+A.ra+ch,2,2,"#fff");
  // head: heavy brow + SINGLE gold eye + blunt teeth + topknot
  px(g,10+A.hx,6+hb,12,12,skin); px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,10+A.hx,6+hb,2,12,deep); px(g,20+A.hx,6+hb,2,12,deep);
  px(g,10+A.hx,6+hb,12,2,pale);
  g.fillStyle="#ffe14d"; g.fillRect(13+A.hx,9+hb,6,5);
  g.fillStyle="#fff2b0"; g.fillRect(13+A.hx,9+hb,6,1);
  g.fillStyle="#111"; g.fillRect(15+A.hx,10+hb,2,3);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,9+hb,1,1);
  px(g,12+A.hx,8+hb,8,1,deep);
  px(g,12+A.hx,14+hb,8,3,"#5a3a2a"); px(g,13+A.hx,15+hb,2,2,"#fff"); px(g,17+A.hx,15+hb,1,2,"#fff");
  px(g,13+A.hx,4+hb,6,3,"#2a1a10"); px(g,14+A.hx,2+hb,4,3,"#2a1a10");
  px(g,11+A.hx,11+hb,1,3,skinD); px(g,20+A.hx,11+hb,1,3,skinD);
};

/* ============ 8. MINOTAUR CALF v7 — small horns, big temper ============ */
D.minotaur_calf = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur=tint&&tint!=="#ffffff"?tint:"#7a4a2b";
  const dk=shade(fur,-38), deep=shade(fur,-68), lite=shade(fur,30), pale=shade(fur,55);
  const gold="#d9a91e", goldL="#ffe37a", iron="#9aa0a8";
  auraShadow(g,hb,"rgba(180,120,60,0.22)","rgba(255,120,60,0.08)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,goldL]);
  // hooved legs
  px(g,9+A.lx,28+A.ld,5,6,fur); px(g,18+A.rx,28+A.rd,5,6,fur);
  px(g,9+A.lx,28+A.ld,2,6,lite); px(g,21+A.rx,28+A.rd,2,6,deep);
  px(g,8+A.lx,33+A.ld,7,3,"#2a1a10"); px(g,17+A.rx,33+A.rd,7,3,"#2a1a10");
  px(g,8+A.lx,33+A.ld,7,1,"#8a5a33"); px(g,10+A.lx,33+A.ld,2,1,iron);
  // torso: fur + hide vest + belt + nose-ring chain
  px(g,8,16,16,14,fur); px(g,8,16,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,16,3,14,deep); px(g,21,16,3,14,deep);
  px(g,10,19,12,8,"#4a2e1a"); px(g,10,19,12,2,"#6a4a2a"); px(g,15,19,2,8,gold);
  px(g,9,27,14,3,"#3a2a1a"); px(g,9,27,14,1,"#8a5a33");
  px(g,14,27,4,3,gold); px(g,15,28,2,1,"#111");
  // arms: fur + bracers
  px(g,3+A.lax,19+A.la,4,8,fur); px(g,3+A.lax,19+A.la,1,8,lite);
  px(g,3+A.lax,25+A.la,4,2,"#3a2a1a");
  const ax=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+ax,4,8,fur); px(g,25+A.rax,19+A.ra+ax,1,8,lite);
  px(g,26+A.rax,12+A.ra+ax,2,12,"#5a3a22");
  px(g,23+A.rax,8+A.ra+ax,8,5,iron); px(g,23+A.rax,8+A.ra+ax,8,1,"#fff"); px(g,23+A.rax,12+A.ra+ax,8,1,"#5a5e66");
  // head: calf muzzle, gold eyes, brass nose-ring, small horns
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(10+A.hx,8+hb); g.lineTo(5+A.hx,3+hb); g.lineTo(8+A.hx,10+hb); g.fill();
  g.beginPath(); g.moveTo(22+A.hx,8+hb); g.lineTo(27+A.hx,3+hb); g.lineTo(24+A.hx,10+hb); g.fill();
  px(g,10+A.hx,7+hb,12,11,fur); px(g,10+A.hx,7+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,12+A.hx,11+hb,3,3,"#ffe14d"); px(g,18+A.hx,11+hb,3,3,"#ffe14d");
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,19+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,14+hb,6,4,"#d9a0a0"); px(g,13+A.hx,14+hb,6,1,"#f2c0c0");
  px(g,15+A.hx,15+hb,2,2,gold); px(g,15+A.hx,17+hb,1,2,gold);
  px(g,14+A.hx,16+hb,4,1,"#5a1a1a");
};

/* ============ 9. DULLAHAN HERALD v8 — headless outrider (FIX: big readable head) ============ */
D.dullahan_herald = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const plate=tint&&tint!=="#ffffff"?tint:"#2a2a3a";
  const dk=shade(plate,-30), deep="#0c0c12", lite=shade(plate,34);
  const bone="#e8e4d8", gold="#d9a91e", goldL="#ffe37a", steel="#9aa0a8";
  auraShadow(g,hb,"rgba(120,140,220,0.26)","rgba(127,212,255,0.14)");
  spark(g,[3,16,"#7fd4ff"],[28,12,"#fff"],[26,33,"#7fd4ff"]);
  // armored legs + boots + knee sigils
  px(g,10+A.lx,28+A.ld,4,7,plate); px(g,18+A.rx,28+A.rd,4,7,plate);
  px(g,10+A.lx,28+A.ld,1,7,lite); px(g,21+A.rx,28+A.rd,1,7,deep);
  px(g,10+A.lx,30+A.ld,4,1,"#7a4ae0"); px(g,18+A.rx,30+A.rd,4,1,"#7a4ae0");
  px(g,9+A.lx,34+A.ld,6,2,"#0c0c12"); px(g,17+A.rx,34+A.rd,6,2,"#0c0c12");
  px(g,9+A.lx,34+A.ld,6,1,steel); px(g,9+A.lx,34+A.ld,1,1,"#fff");
  // torso: tall black plate + violet sash + spine jewel + gold belt
  px(g,8,16,16,14,plate); px(g,8,16,16,2,lite); px(g,8,28,16,2,deep);
  px(g,8,16,2,14,deep); px(g,22,16,2,14,deep);
  px(g,10,18,12,9,"#1a1a24"); px(g,11,19,10,7,"#2e2e40");
  px(g,13,20,2,5,"#7a4ae0"); px(g,17,20,2,5,"#7a4ae0"); px(g,15,21,2,2,"#d08aff"); px(g,15,21,1,1,"#fff");
  px(g,10,24,12,2,gold); px(g,10,24,12,1,goldL);
  px(g,9,27,14,3,gold); px(g,9,27,14,1,goldL); px(g,9,29,14,1,"#8a6410");
  px(g,14,27,4,3,bone); px(g,15,28,2,1,"#111"); px(g,15,27,1,1,"#fff");
  // neck stump: ragged flesh + violet soul-fire venting (voidstalker bleed)
  px(g,13+A.hx,7+hb,6,5,"#5a1a2a"); px(g,14+A.hx,7+hb,4,3,"#8a2a3a");
  px(g,14+A.hx,5+hb,2,4,"#a04aff"); px(g,15+A.hx,4+hb,1,2,"#fff");
  px(g,13+A.hx,7+hb,6,1,"#2a0a14");
  g.fillStyle="rgba(160,74,255,0.35)"; g.beginPath(); g.arc(16+A.hx,5+hb,4,0,7); g.fill();
  // cape: wider + violet hem + clasp
  px(g,4,15,4,17,"#1a0a14"); px(g,4,15,1,17,"#3a1a2a"); px(g,4,31,4,1,"#7a4ae0");
  px(g,24,15,4,17,"#1a0a14"); px(g,27,15,1,17,"#3a1a2a"); px(g,24,31,4,1,"#7a4ae0");
  px(g,6,15,2,2,gold); px(g,24,15,2,2,gold);
  // RIGHT arm + long herald sword (raises on atk)
  const sw2=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+sw2,4,7,plate); px(g,25+A.rax,19+A.ra+sw2,1,7,lite);
  px(g,25+A.rax,11+A.ra+sw2,2,13,steel); px(g,25+A.rax,11+A.ra+sw2,1,13,"#fff");
  px(g,25+A.rax,11+A.ra+sw2,2,1,"#fff"); px(g,25+A.rax,22+A.ra+sw2,2,1,"#5a5e66");
  px(g,23+A.rax,9+A.ra+sw2,6,3,gold); px(g,23+A.rax,9+A.ra+sw2,6,1,goldL); px(g,24+A.rax,16+A.ra+sw2,3,2,"#5a3a22");
  // LEFT arm cradles BIG severed head at chest height (readable!)
  px(g,3+A.lax,18+A.la,4,8,plate); px(g,3+A.lax,18+A.la,1,8,lite);
  px(g,2+A.lax,25+A.la,7,7,"#3a2a1a"); px(g,2+A.lax,25+A.la,7,1,"#5a3a22");
  // big head: 8x8 pale + jaw + cyan glowing eyes + frown + hair
  px(g,1+A.lax,22+A.la,8,8,"#d9c9a0"); px(g,1+A.lax,22+A.la,8,1,"#f2e0c0"); px(g,1+A.lax,29+A.la,8,1,"#a08a6a");
  px(g,1+A.lax,22+A.la,1,8,"#8a7a6a"); px(g,8+A.lax,22+A.la,1,8,"#8a7a6a");
  px(g,2+A.lax,20+A.la,6,3,"#3a2a1a"); px(g,2+A.lax,20+A.la,6,1,"#5a3a22");
  g.fillStyle="#0a2a3a"; g.fillRect(2+A.lax,24+A.la,3,4); g.fillRect(6+A.lax,24+A.la,3,4);
  g.fillStyle="#7fd4ff"; g.fillRect(3+A.lax,25+A.la,1,3); g.fillRect(7+A.lax,25+A.la,1,3);
  g.fillStyle="#fff"; g.fillRect(3+A.lax,25+A.la,1,1); g.fillRect(7+A.lax,25+A.la,1,1);
  g.fillStyle="#111"; g.fillRect(3+A.lax,26+A.la,1,1);
  px(g,3+A.lax,28+A.la,5,1,"#5a1a1a"); px(g,4+A.lax,28+A.la,3,1,"#2a0a0a");
  px(g,2+A.lax,23+A.la,2,1,"#f0a090"); px(g,7+A.lax,23+A.la,1,1,"#f0a090");
};

/* ============ 10. FROSTWYRM v8 — winter spine (FIX: bigger head, more ice) ============ */
D.frostwyrm = (g,tint,ph)=>{
  const P=P_of(ph);
  const ice=tint&&tint!=="#ffffff"?tint:"#bfe9ff";
  const dk=shade(ice,-38), deep=shade(ice,-70), lite="#ffffff", steel="#7fb0d0";
  auraShadow(g,Hb_of(P),"rgba(180,230,255,0.28)","rgba(127,212,255,0.16)");
  spark(g,[3,8,"#fff"],[28,4,"#7fd4ff"],[26,33,"#fff"]);
  const w0=Sg(P,0,1), w1=Sg(P,1,1), w2=Sg(P,2,1);
  // coiled body: taller mound + scale rows + frost glow + glints
  px(g,3+w0,29,24,7,deep); px(g,4+w0,29,22,1,steel); px(g,4+w0,29,22,1,"#fff"); px(g,4+w0,34,22,2,deep);
  for(let x=5;x<26;x+=3){ px(g,x+w0,30,2,3,steel); px(g,x+w0,30,1,1,"#fff"); px(g,x+w0,32,1,1,deep); }
  px(g,6+w0,30,2,2,"#7fd4ff"); px(g,12+w0,31,2,2,"#bfe8ff"); px(g,12+w0,31,2,1,"#fff"); px(g,18+w0,30,2,2,"#7fd4ff");
  px(g,7+w1,24,17,5,dk); px(g,7+w1,24,17,1,"#fff"); px(g,7+w1,28,17,1,deep);
  for(let x=8;x<23;x+=3){ px(g,x+w1,25,2,2,steel); px(g,x+w1,25,1,1,"#fff"); }
  px(g,9+w1,26,2,2,"#7fd4ff"); px(g,15+w1,26,2,1,"#fff");
  // ice-spike dorsal ridge: taller + white cores
  px(g,5+w0,24,2,6,steel); px(g,5+w0,24,2,1,"#fff"); px(g,9+w0,23,2,7,steel); px(g,9+w0,23,2,1,"#fff");
  px(g,13+w0,23,2,7,"#fff"); px(g,13+w0,23,2,1,"#fff"); px(g,17+w0,23,2,7,steel); px(g,17+w0,23,2,1,"#fff"); px(g,21+w0,24,2,6,steel);
  px(g,5+w0,27,18,2,"rgba(127,212,255,0.55)");
  // thick neck + BIG head (10x10)
  px(g,19+w2,14,8,13,ice); px(g,19+w2,14,2,13,deep); px(g,25+w2,14,2,13,deep);
  px(g,19+w2,14,8,2,"#fff"); px(g,19+w2,25,8,2,dk);
  px(g,20+w2,16,1,8,"#0a2a3a"); px(g,26+w2,16,1,8,"#0a2a3a");
  // antlers + brow + cheek plates
  px(g,17+w2,6,3,6,steel); px(g,17+w2,6,3,1,"#fff"); px(g,25+w2,6,3,6,steel); px(g,25+w2,6,3,1,"#fff");
  px(g,19+w2,5,2,4,"#bfe8ff"); px(g,24+w2,5,2,4,"#bfe8ff");
  px(g,18+w2,9,10,9,ice); px(g,18+w2,9,10,1,"#fff"); px(g,18+w2,16,10,2,dk);
  px(g,18+w2,9,2,9,deep); px(g,26+w2,9,2,9,deep);
  g.fillStyle="#7fd4ff"; g.fillRect(19+w2,11,3,4); g.fillRect(24+w2,11,3,4);
  g.fillStyle="#111"; g.fillRect(20+w2,12,1,3); g.fillRect(25+w2,12,1,3);
  g.fillStyle="#fff"; g.fillRect(19+w2,11,1,1); g.fillRect(24+w2,11,1,1);
  px(g,20+w2,10,7,1,"#0a2a3a");
  // fanged jaw + frost breath (gapes on atk)
  if(!P.atk){ px(g,19+w2,17,8,2,"#0a2a3a"); px(g,20+w2,17,2,2,"#fff"); px(g,24+w2,17,2,2,"#fff"); px(g,21+w2,18,4,1,"#7fd4ff"); }
  else{ px(g,18+w2,17,3,6,"#0a2a3a"); px(g,25+w2,17,3,6,"#0a2a3a"); px(g,19+w2,18,1,4,"#fff"); px(g,26+w2,18,1,4,"#fff"); px(g,20+w2,21,6,3,"#7fd4ff"); px(g,21+w2,21,4,1,"#fff"); }
  px(g,17+w2,18,2,3,"#7fd4ff"); px(g,27+w2,18,2,3,"#7fd4ff");
  // gill slits + side fin + snow glints
  px(g,19+w2,20,1,3,deep); px(g,20+w2,20,1,3,deep);
  px(g,15+w1,26,5,3,steel); px(g,15+w1,26,5,1,"#fff");
  px(g,6,28,1,1,"#fff"); px(g,23,29,1,1,"#fff");
};

/* ============ 11. HIVE HORNET v7 — hive opinion ============ */
D.hive_hornet = (g,tint,ph)=>{
  const P=P_of(ph);
  const gold=tint&&tint!=="#ffffff"?tint:"#d9a020";
  const dk=shade(gold,-45), deep=shade(gold,-75), lite=shade(gold,32);
  const WA=Wflap(P);
  auraShadow(g,Hb_of(P),"rgba(230,190,60,0.22)","rgba(255,217,61,0.10)");
  spark(g,[4,10,lite],[28,6,"#fff"],[26,33,lite]);
  // wings: veined translucent fans beating
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?13:19,14); g.rotate(s<0?WA:-WA); g.translate(s<0?-13:-19,-14);
    g.fillStyle="rgba(240,230,200,0.85)";
    g.beginPath(); if(s<0){ g.moveTo(14,15); g.lineTo(1,0); g.lineTo(4,9); g.lineTo(10,14); } else { g.moveTo(18,15); g.lineTo(31,0); g.lineTo(28,9); g.lineTo(22,14); } g.fill();
    g.restore();
  }
  px(g,8,4,2,7,"#8a7a5a"); px(g,11,6,2,5,"#8a7a5a"); px(g,22,4,2,7,"#8a7a5a"); px(g,19,6,2,5,"#8a7a5a");
  px(g,3,3,2,2,"rgba(255,255,255,0.9)"); px(g,27,3,2,2,"rgba(255,255,255,0.9)");
  // striped abdomen + waist + stinger
  px(g,13,18,6,3,gold); px(g,13,18,6,1,lite);
  px(g,12,21,8,11,gold); px(g,12,21,8,1,lite); px(g,12,30,8,2,dk);
  px(g,12,21,2,11,deep); px(g,18,21,2,11,deep);
  for(let s=0;s<3;s++){ px(g,12,23+s*4,8,2,"#1a1a1a"); px(g,12,24+s*4,8,1,"#3a3a3a"); }
  px(g,13,22,2,1,"#fff"); px(g,16,26,2,1,"#fff");
  px(g,14,32,4,3,dk); px(g,15,34,2,3,"#1a1a1a"); px(g,15,34,1,1,"#ff6a8a");
  // thorax fuzz + head
  px(g,11,12,10,7,gold); px(g,11,12,10,2,lite); px(g,11,17,10,2,dk);
  px(g,11,12,2,7,deep); px(g,19,12,2,7,deep);
  for(let x=12;x<20;x+=2) px(g,x,13,1,2,deep);
  px(g,5,15,4,3,dk); px(g,23,15,4,3,dk);
  px(g,10,24,3,4,dk); px(g,19,24,3,4,dk); px(g,10,27,3,1,"#fff"); px(g,19,27,3,1,"#fff");
  // compound eyes + jaws + antennae
  g.fillStyle="#c93b3b"; g.fillRect(11,13,4,5); g.fillRect(18,13,3,4);
  g.fillStyle="#ff8a8a"; g.fillRect(11,13,4,1); g.fillRect(18,13,3,1);
  g.fillStyle="#fff"; g.fillRect(11,13,1,1); g.fillRect(18,13,1,1);
  g.fillStyle="#111"; g.fillRect(12,15,1,2); g.fillRect(19,15,1,2);
  px(g,14,19,4,2,"#1a1a1a");
  px(g,10,6,2,7,dk); px(g,20,6,2,7,dk); px(g,9,5,4,2,dk); px(g,19,5,4,2,dk);
};

/* ============ 12. NOKK v7 — river fiddler ============ */
D.nokk = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const water=tint&&tint!=="#ffffff"?tint:"#3a8a9a";
  const dk=shade(water,-40), deep=shade(water,-70), lite=shade(water,32), pale=shade(water,58);
  const skin="#d9e8e0", skinD="#8aa89a", gold="#d9a91e", goldL="#ffe37a";
  auraShadow(g,hb,"rgba(80,180,200,0.22)","rgba(127,212,255,0.12)");
  spark(g,[3,10,"#7fd4ff"],[28,6,"#fff"],[26,33,"#7fd4ff"]);
  const sw=Sg(P,0,1);
  // watery legs + webbed feet
  px(g,11+A.lx,28+A.ld,4,6,water); px(g,17+A.rx,28+A.rd,4,6,water);
  px(g,11+A.lx,28+A.ld,1,6,lite); px(g,20+A.rx,28+A.rd,1,6,deep);
  px(g,10+A.lx,33+A.ld,6,3,"#1a3a44"); px(g,16+A.rx,33+A.rd,6,3,"#1a3a44");
  px(g,10+A.lx,33+A.ld,2,1,"#7fd4ff"); px(g,18+A.rx,33+A.rd,2,1,"#7fd4ff");
  // flowing robe of water + foam trim + pondweed sash
  px(g,8,18,16,13,water); px(g,8,18,16,2,lite); px(g,8,29,16,2,dk);
  px(g,8,18,2,13,deep); px(g,22,18,2,13,deep);
  for(let y=20;y<28;y+=2) px(g,11,y,10,1,"rgba(255,255,255,0.25)");
  px(g,9,26,14,3,"#2a5a3a"); px(g,9,26,14,1,"#4a8a4a");
  px(g,11,19,10,2,"#7fd4ff"); px(g,12,19,2,1,"#fff"); px(g,17,19,2,1,"#fff");
  // fins at shoulders/hips
  px(g,5,16,4,6,"#7ad9f0"); px(g,5,16,4,1,"#fff"); px(g,23,16,4,6,"#7ad9f0"); px(g,23,16,4,1,"#fff");
  // LEFT: holds fiddle
  px(g,4+A.lax,19+A.la,3,7,water); px(g,4+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,24+A.la,5,6,"#5a3a22"); px(g,3+A.lax,24+A.la,5,1,"#8a5a33");
  px(g,4+A.lax,25+A.la,3,4,"#8a5a33"); px(g,4+A.lax,27+A.la,3,1,"#3a2412");
  px(g,5+A.lax,25+A.la,1,3,"#d9c27f");
  // RIGHT: bow strokes (moves on atk)
  const bw=P.atk?-3:0;
  px(g,24+A.rax,18+A.ra+bw,3,6,water);
  px(g,25+A.rax,12+A.ra+bw,1,12,"#d9c27f"); px(g,25+A.rax,12+A.ra+bw,1,1,"#fff");
  // head: pale + drowned eyes + gills + flowing hair
  px(g,10+A.hx,8+hb,12,10,skin); px(g,10+A.hx,8+hb,12,1,"#fff"); px(g,10+A.hx,16+hb,12,2,skinD);
  px(g,7+A.hx,4+hb+sw,5,14,"#7ad9f0"); px(g,20+A.hx,4+hb-sw,5,14,"#7ad9f0");
  px(g,7+A.hx,4+hb,5,2,"#fff"); px(g,20+A.hx,4+hb,5,2,"#fff");
  g.fillStyle="#0a2a3a"; g.fillRect(12+A.hx,11+hb,3,4); g.fillRect(18+A.hx,11+hb,3,4);
  g.fillStyle="#7fd4ff"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(19+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,12+hb,1,1); g.fillRect(19+A.hx,12+hb,1,1);
  px(g,12+A.hx,10+hb,3,1,"#1a4a5a"); px(g,17+A.hx,10+hb,3,1,"#1a4a5a");
  px(g,14+A.hx,16+hb,4,1,"#5a7a8a");
  px(g,10+A.hx,3+hb,12,3,gold); px(g,10+A.hx,3+hb,12,1,goldL);
};

/* ============ 13. SANDMAW v7 — desert mouth ============ */
D.sandmaw = (g,tint,ph)=>{
  const P=P_of(ph);
  const sand=tint&&tint!=="#ffffff"?tint:"#c9a45a";
  const dk=shade(sand,-40), deep=shade(sand,-70), lite=shade(sand,30), pale=shade(sand,55);
  auraShadow(g,Hb_of(P),"rgba(220,190,120,0.22)","rgba(255,217,61,0.08)");
  spark(g,[4,26,pale],[28,16,"#fff"],[26,32,pale]);
  const w0=Sg(P,0,1), w1=Sg(P,2,1);
  const hv=P.moving?[0,-1,0,1][P.f&3]:0;
  // buried coil mound + dune ripples + pebbles
  px(g,4,29+hv,24,7,deep); px(g,5,30+hv,22,5,sand); px(g,5,30+hv,22,1,lite);
  for(let x=6;x<26;x+=4){ px(g,x,31+hv,3,1,dk); px(g,x,32+hv,2,1,"#8a6a2a"); }
  px(g,7,28+hv,3,2,"#e8d9b0"); px(g,21,28+hv,3,2,"#8a6a2a");
  px(g,2,33,3,2,"#8a6a2a"); px(g,27,33,2,2,"#e8d9b0");
  // upright maw stalk: ringed segments + scale rows
  px(g,10+w0,18,12,12,sand); px(g,10+w0,18,12,2,lite); px(g,10+w0,28,12,2,dk);
  px(g,10+w0,18,2,12,deep); px(g,20+w0,18,2,12,deep);
  for(let y=20;y<28;y+=3){ px(g,11+w0,y,10,1,dk); px(g,11+w0,y,3,1,lite); }
  // dorsal sand fins
  px(g,8+w0,16,3,5,dk); px(g,8+w0,16,3,1,lite); px(g,21+w0,16,3,5,dk); px(g,21+w0,16,3,1,lite);
  // MOUTH RING: outer lips + double tooth rings + dark gullet + tongue
  px(g,9+w1,6,14,9,sand); px(g,9+w1,6,14,2,lite); px(g,9+w1,13,14,2,dk);
  px(g,9+w1,6,2,9,deep); px(g,21+w1,6,2,9,deep);
  px(g,11+w1,8,10,6,"#3a0e0e");
  for(let i=0;i<5;i++){ px(g,11+i*2+w1,8,1,3,"#fff"); px(g,11+i*2+w1,13,1,2,"#fff"); }
  px(g,12+w1,10,8,2,"#7a1f1f"); px(g,14+w1,11,4,2,"#ff6a6a"); px(g,15+w1,11,2,1,"#fff");
  px(g,13+w1,12,6,1,"#2a0606");
  // stalk eyes: two per side + catchlights
  px(g,7+w0,10,3,4,dk); px(g,22+w0,10,3,4,dk);
  g.fillStyle="#ffe14d"; g.fillRect(7+w0,11,2,2); g.fillRect(23+w0,11,2,2);
  g.fillStyle="#111"; g.fillRect(8+w0,12,1,1); g.fillRect(24+w0,12,1,1);
  g.fillStyle="#fff"; g.fillRect(7+w0,11,1,1); g.fillRect(23+w0,11,1,1);
  // sand spray on atk
  if(P.atk){ px(g,6+w0,4,2,2,pale); px(g,24+w0,3,2,2,pale); px(g,12,2,2,2,"#fff"); }
};

/* ============ 14. PUCA v8 — spark shapeshifter (FIX: readable, rim-lit) ============ */
D.puca = (g,tint,ph)=>{
  const P=P_of(ph); const Q=Q_of(P);
  const fur=tint&&tint!=="#ffffff"?tint:"#4a4a52";
  const dk=shade(fur,-34), deep=shade(fur,-62), lite=shade(fur,36), pale=shade(fur,60);
  auraShadow(g,Hb_of(P),"rgba(150,130,200,0.26)","rgba(199,125,255,0.14)");
  spark(g,[4,18,"#c77dff"],[28,12,"#fff"],[26,32,"#c77dff"]);
  const sw=Sg(P,0,1);
  // tail: tufted + bright spark tips + halo
  px(g,1+sw,20,4,4,fur); px(g,1+sw,20,4,1,lite); px(g,0+sw,23,5,3,deep);
  px(g,0+sw,23,2,2,"#c77dff"); px(g,0+sw,23,1,1,"#fff"); px(g,3+sw,23,2,1,"#fff");
  g.fillStyle="rgba(199,125,255,0.30)"; g.beginPath(); g.arc(2+sw,24,4,0,7); g.fill();
  // shaggy barrel + PALE BACK RIM + belly + many sparks in coat
  px(g,6,23,18,8,fur); px(g,6,23,18,2,pale); px(g,6,29,18,2,dk);
  px(g,6,23,3,8,deep); px(g,6,23,18,1,pale);
  for(let x=8;x<22;x+=3){ px(g,x,25,2,3,dk); px(g,x,25,1,1,lite); }
  px(g,9,24,2,2,"#c77dff"); px(g,9,24,1,1,"#fff"); px(g,15,27,2,2,"#c77dff"); px(g,15,27,1,1,"#fff"); px(g,19,24,2,2,"#c77dff"); px(g,12,27,1,1,"#fff");
  px(g,8,22,6,2,"#5a4a5a"); px(g,8,22,6,1,pale); px(g,14,22,4,2,"#c9a227"); px(g,14,22,4,1,"#fff2b0");
  px(g,9,29,6,1,pale);
  // legs: shaggy + pale socks + cloven hooves
  px(g,7+Q.x1,30+Q.d1,3,5,fur); px(g,12+Q.x2,30+Q.d2,3,5,fur); px(g,17+Q.x1,30+Q.d1,3,5,fur); px(g,21+Q.x2,30+Q.d2,3,5,fur);
  px(g,7+Q.x1,30+Q.d1,1,5,lite); px(g,21+Q.x2,30+Q.d1,1,5,lite);
  px(g,7+Q.x1,33+Q.d1,3,2,"#e8e0d0"); px(g,12+Q.x2,33+Q.d2,3,2,"#e8e0d0"); px(g,17+Q.x1,33+Q.d1,3,2,"#e8e0d0"); px(g,21+Q.x2,33+Q.d2,3,2,"#e8e0d0");
  px(g,7+Q.x1,34+Q.d1,3,2,"#1a1410"); px(g,12+Q.x2,34+Q.d2,3,2,"#1a1410"); px(g,17+Q.x1,34+Q.d1,3,2,"#1a1410"); px(g,21+Q.x2,34+Q.d2,3,2,"#1a1410");
  // horned head: BIG gold eyes + blaze + beard + pale mane
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(23,16); g.lineTo(19,7); g.lineTo(22,15); g.fill();
  g.beginPath(); g.moveTo(29,16); g.lineTo(33,7); g.lineTo(30,15); g.fill();
  px(g,20,14,3,8,pale); px(g,29,14,3,8,pale);
  px(g,22,15,8,10,fur); px(g,22,15,8,1,pale); px(g,22,23,8,2,dk);
  px(g,22,15,2,10,deep);
  g.fillStyle="#ffe14d"; g.fillRect(23,18,3,3); g.fillStyle="#111"; g.fillRect(24,19,1,2); g.fillStyle="#fff"; g.fillRect(23,18,1,1);
  px(g,23,17,4,1,deep);
  px(g,26,21,4,3,"#e8d9c0"); px(g,27,22,2,1,"#111"); px(g,27,22,1,1,"#5a4a3a");
  px(g,24,24,4,3,"#1a1410"); px(g,25,25,3,2,"#5a4a5a"); px(g,25,25,1,1,"#c77dff");
  px(g,21,18,3,5,lite); px(g,28,18,2,5,lite);
};

/* ============ 15. REDCAP v7 — blood-capped reaper ============ */
D.redcap = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const coat=tint&&tint!=="#ffffff"?tint:"#8a1a1a";
  const dk=shade(coat,-40), deep=shade(coat,-70), lite=shade(coat,32);
  const skin="#d9a06b", skinD="#a06a3a", skinL="#f2c890", iron="#9aa0a8";
  auraShadow(g,hb,"rgba(200,60,60,0.22)","rgba(255,60,60,0.10)");
  spark(g,[3,18,"#ff6a6a"],[28,14,"#fff"],[26,33,"#ff6a6a"]);
  // iron-shod legs + boots
  px(g,11+A.lx,28+A.ld,4,6,"#3a2a1a"); px(g,17+A.rx,28+A.rd,4,6,"#3a2a1a");
  px(g,11+A.lx,28+A.ld,1,6,"#5a4a3a"); px(g,20+A.rx,28+A.rd,1,6,"#1a1410");
  px(g,10+A.lx,34+A.ld,6,2,"#1a1410"); px(g,16+A.rx,34+A.rd,6,2,"#1a1410");
  px(g,10+A.lx,34+A.ld,6,1,iron); px(g,16+A.rx,34+A.rd,6,1,iron);
  // coat: blood-red + belts + buckles + hem drips
  px(g,9,18,14,11,coat); px(g,9,18,14,2,lite); px(g,9,27,14,2,dk);
  px(g,9,18,2,11,deep); px(g,21,18,2,11,deep);
  for(let y=20;y<27;y+=2) px(g,11,y,10,1,"rgba(0,0,0,0.25)");
  px(g,9,23,14,3,"#2a1a10"); px(g,9,23,14,1,"#5a3a22");
  px(g,14,23,4,3,"#c9a227"); px(g,14,23,4,1,"#fff2b0");
  px(g,11,28,2,3,"#5a0a0a"); px(g,19,28,2,3,"#5a0a0a");
  // arms: sleeves + claws
  px(g,6+A.lax,19+A.la,3,8,coat); px(g,6+A.lax,19+A.la,1,8,lite);
  px(g,6+A.lax,26+A.la,3,3,skin); px(g,6+A.lax,28+A.la,1,2,"#fff");
  const sw3=P.atk?-5:0;
  px(g,23+A.rax,19+A.ra+sw3,3,8,coat);
  px(g,24+A.rax,11+A.ra+sw3,2,14,"#5a3a22"); px(g,24+A.rax,11+A.ra+sw3,1,14,"#a97648");
  px(g,22+A.rax,7+A.ra+sw3,6,5,iron); px(g,22+A.rax,7+A.ra+sw3,6,1,"#fff"); px(g,22+A.rax,11+A.ra+sw3,6,1,"#5a5e66");
  // head: grizzled beard, gold eyes, fanged grin, blood cap
  px(g,10+A.hx,9+hb,12,10,skin); px(g,10+A.hx,9+hb,12,2,skinL); px(g,10+A.hx,17+hb,12,2,skinD);
  px(g,10+A.hx,15+hb,12,5,"#8a8078"); px(g,11+A.hx,16+hb,10,3,"#a09a90");
  px(g,12+A.hx,15+hb,2,2,"#fff"); px(g,18+A.hx,15+hb,2,2,"#fff");
  px(g,13+A.hx,16+hb,6,1,"#3a2a1a");
  g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,3);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1);
  px(g,12+A.hx,10+hb,3,1,deep); px(g,17+A.hx,10+hb,3,1,deep);
  // gore cap: dripping red + dark brim + wet glint
  px(g,9+A.hx,2+hb,14,6,"#c93b3b"); px(g,9+A.hx,2+hb,14,1,"#ff8a8a"); px(g,9+A.hx,7+hb,14,1,"#7a0a0a");
  px(g,10+A.hx,7+hb,2,3,"#7a0a0a"); px(g,15+A.hx,7+hb,2,4,"#7a0a0a"); px(g,19+A.hx,7+hb,2,3,"#7a0a0a");
  px(g,11+A.hx,2+hb,3,2,"#ff6a6a"); px(g,16+A.hx,3+hb,2,1,"#fff");
};

/* ============ 16. RAKSHASA CUB v7 — tiger princeling ============ */
D.rakshasa_cub = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur=tint&&tint!=="#ffffff"?tint:"#d98a2a";
  const dk=shade(fur,-38), deep=shade(fur,-68), lite=shade(fur,32);
  const silk="#8a2a2a", gold="#ffd93d", goldL="#fff2b0";
  auraShadow(g,hb,"rgba(230,140,40,0.22)","rgba(255,217,61,0.10)");
  spark(g,[3,20,goldL],[28,16,"#fff"],[26,33,goldL]);
  // legs: silk pants + tiger paws
  px(g,11+A.lx,28+A.ld,4,6,"#8a4a1a"); px(g,17+A.rx,28+A.rd,4,6,"#8a4a1a");
  px(g,10+A.lx,33+A.ld,6,3,fur); px(g,16+A.rx,33+A.rd,6,3,fur);
  px(g,10+A.lx,33+A.ld,2,1,"#111"); px(g,16+A.rx,33+A.rd,2,1,"#111");
  // silk vest + gold brocade + sash jewel
  px(g,8,17,16,13,fur); px(g,8,17,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,deep); px(g,22,17,2,13,deep);
  px(g,10,19,12,8,silk); px(g,11,20,10,6,"#a03030");
  for(let y=20;y<26;y+=2) px(g,11,y,10,1,gold);
  px(g,15,19,2,9,gold); px(g,15,19,2,1,goldL);
  px(g,9,27,14,3,gold); px(g,9,27,14,1,goldL);
  px(g,14,27,4,3,"#1a5a6a"); px(g,15,28,2,1,"#7fd4ff"); px(g,15,28,1,1,"#fff");
  // striped shoulders + clawed arms + bangles
  px(g,4,15,6,5,fur); px(g,5,16,4,1,"#111"); px(g,5,18,4,1,"#111");
  px(g,22,15,6,5,fur); px(g,23,16,4,1,"#111"); px(g,23,18,4,1,"#111");
  px(g,3+A.lax,18+A.la,4,8,fur); px(g,3+A.lax,22+A.la,4,1,"#111");
  px(g,3+A.lax,25+A.la,4,2,gold); px(g,3+A.lax,27+A.la,4,3,"#f2d0a0");
  const cl=P.atk?-4:0;
  px(g,25+A.rax,18+A.ra+cl,4,8,fur); px(g,25+A.rax,22+A.ra+cl,4,1,"#111");
  px(g,25+A.rax,25+A.ra+cl,4,2,gold); px(g,25+A.rax,27+A.ra+cl,4,3,"#f2d0a0");
  px(g,25+A.rax,29+A.ra+cl,1,3,"#fff");
  // tiger head: stripes, fangs, gold eyes, ears
  g.fillStyle=fur; g.beginPath(); g.moveTo(11+A.hx,9+hb); g.lineTo(8+A.hx,4+hb); g.lineTo(12+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,9+hb); g.lineTo(24+A.hx,4+hb); g.lineTo(20+A.hx,8+hb); g.fill();
  px(g,10+A.hx,7+hb,12,11,fur); px(g,10+A.hx,7+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,12+A.hx,8+hb,2,2,"#111"); px(g,18+A.hx,8+hb,2,2,"#111");
  px(g,13+A.hx,7+hb,6,1,"#111");
  g.fillStyle="#ffe14d"; g.fillRect(11+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,3,3);
  g.fillStyle="#111"; g.fillRect(12+A.hx,12+hb,1,2); g.fillRect(19+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(11+A.hx,11+hb,1,1); g.fillRect(18+A.hx,11+hb,1,1);
  px(g,13+A.hx,15+hb,6,3,"#7a1f1f"); px(g,13+A.hx,15+hb,1,3,"#fff"); px(g,18+A.hx,15+hb,1,3,"#fff");
  px(g,14+A.hx,14+hb,4,1,"#5a1a1a");
  px(g,12+A.hx,5+hb,8,2,"#1a5a6a"); px(g,12+A.hx,5+hb,8,1,"#7fd4ff");
};

/* ============ 17. ROGUE DOMOVOI v7 — feral hearth ============ */
D.domovoi_rogue = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const coat=tint&&tint!=="#ffffff"?tint:"#7a5a3a";
  const dk=shade(coat,-38), deep=shade(coat,-68), lite=shade(coat,30);
  const skin="#d9a06b", skinD="#8a5a33", beard="#c9c9c9", ember="#ff9d2e";
  auraShadow(g,hb,"rgba(200,150,90,0.20)","rgba(255,157,46,0.08)");
  spark(g,[3,20,ember],[28,16,"#fff"],[26,33,ember]);
  // boots + ragged hem
  px(g,11+A.lx,30+A.ld,4,5,dk); px(g,17+A.rx,30+A.rd,4,5,dk);
  px(g,10+A.lx,34+A.ld,6,2,"#2a1a10"); px(g,16+A.rx,34+A.rd,6,2,"#2a1a10");
  px(g,9,28,14,4,dk); px(g,9,28,14,1,coat);
  // patched coat + soot + ember buttons + rope belt
  px(g,9,18,14,11,coat); px(g,9,18,14,2,lite); px(g,9,27,14,2,deep);
  px(g,9,18,2,11,deep); px(g,21,18,2,11,deep);
  px(g,11,21,4,4,"#4a3a2a"); px(g,17,21,4,3,"#2a4a5a");
  px(g,12,22,2,2,"#8a8078"); px(g,18,22,1,2,"#7fd4ff");
  px(g,14,20,2,2,ember); px(g,14,20,1,1,"#fff"); px(g,14,24,2,2,ember);
  px(g,9,26,14,3,"#3a2a1a"); px(g,9,26,14,1,"#8a5a33");
  // LEFT: broom (sweeps on atk)
  const sw4=P.atk?-4:0;
  px(g,3+A.lax,19+A.la,3,8,coat); px(g,3+A.lax,26+A.la,3,3,skin);
  px(g,2+A.lax,12+A.la+sw4,2,16,"#5a3a22"); px(g,2+A.lax,12+A.la+sw4,1,16,"#8a5a33");
  px(g,1+A.lax,26+A.la+sw4,4,5,"#c9a06a"); px(g,1+A.lax,26+A.la+sw4,4,1,"#e8d0a0");
  px(g,1+A.lax,30+A.la+sw4,4,1,"#8a5a33");
  // RIGHT: hearth poker + ember tip
  px(g,25+A.rax,19+A.ra,3,7,coat);
  px(g,26+A.rax,12+A.ra,2,12,"#3a3a44"); px(g,26+A.rax,12+A.ra,1,12,"#9aa0a8");
  px(g,25+A.rax,10+A.ra,4,3,ember); px(g,25+A.ra,10,0,0,ember); px(g,26+A.rax,10+A.ra,1,1,"#fff");
  // head: beard, ember eyes, cap
  px(g,10+A.hx,8+hb,12,12,skin); px(g,10+A.hx,8+hb,12,1,"#f2c890"); px(g,10+A.hx,18+hb,12,2,skinD);
  px(g,10+A.hx,14+hb,12,6,beard); px(g,11+A.hx,15+hb,10,4,"#e8e8e8");
  px(g,13+A.hx,16+hb,6,2,"#5a4a4a"); px(g,14+A.hx,16+hb,2,1,"#fff");
  g.fillStyle=ember; g.fillRect(12+A.hx,11+hb,3,2); g.fillRect(18+A.hx,11+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1); g.fillRect(18+A.hx,11+hb,1,1);
  px(g,12+A.hx,10+hb,3,1,deep); px(g,17+A.hx,10+hb,3,1,deep);
  px(g,9+A.hx,4+hb,14,5,"#4a3a2a"); px(g,9+A.hx,4+hb,14,1,lite); px(g,9+A.hx,8+hb,14,1,deep);
  px(g,14+A.hx,5+hb,4,2,ember); px(g,15+A.hx,5+hb,1,1,"#fff");
};

/* ============ 18. ORC GRUNT v7 — war trooper ============ */
D.orc_grunt = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin=tint&&tint!=="#ffffff"?tint:"#4a7a2a";
  const dk=shade(skin,-38), deep=shade(skin,-68), lite=shade(skin,30);
  const iron="#3a3a42", ironL="#9aa0a8", blood="#7a1f1f", gold="#c9a227";
  auraShadow(g,hb,"rgba(120,200,80,0.20)","rgba(255,120,60,0.08)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,"#ff8a6a"]);
  // heavy legs + boots
  px(g,9+A.lx,28+A.ld,5,7,dk); px(g,18+A.rx,28+A.rd,5,7,dk);
  px(g,9+A.lx,28+A.ld,1,7,lite);
  px(g,8+A.lx,34+A.ld,7,2,"#2a1a10"); px(g,17+A.rx,34+A.rd,7,2,"#2a1a10");
  px(g,8+A.lx,34+A.ld,7,1,"#8a5a33");
  // torso: green + iron plate + war paint + belt
  px(g,8,16,16,14,skin); px(g,8,16,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,16,2,14,dk); px(g,22,16,2,14,dk);
  px(g,10,18,12,9,iron); px(g,10,18,12,2,ironL); px(g,10,25,12,2,"#23232c");
  px(g,12,20,8,4,blood); px(g,13,21,6,2,"#a02040"); px(g,13,21,1,1,"#ff8a8a");
  px(g,15,18,2,9,gold); px(g,15,18,2,1,"#fff2b0");
  px(g,9,27,14,3,gold); px(g,9,27,14,1,"#fff2b0");
  // pauldrons: bone jaws
  px(g,2+A.lax,13+A.la,7,5,"#e8e4d8"); px(g,2+A.lax,13+A.la,7,1,"#fff"); px(g,3+A.lax,16+A.la,5,1,"#111");
  px(g,23+A.rax,13+A.ra,7,5,"#e8e4d8"); px(g,23+A.rax,13+A.ra,7,1,"#fff");
  // LEFT fist
  px(g,3+A.lax,18+A.la,3,9,skin);
  // RIGHT + cleaver (hefts on atk)
  const ch2=P.atk?-5:0;
  px(g,24+A.rax,18+A.ra+ch2,4,8,skin);
  px(g,25+A.rax,12+A.ra+ch2,2,12,"#5a3a22");
  px(g,23+A.rax,8+A.ra+ch2,7,5,"#c9ccd4"); px(g,23+A.rax,8+A.ra+ch2,7,1,"#fff"); px(g,23+A.rax,12+A.ra+ch2,7,1,"#5a5e66");
  px(g,23+A.rax,10+A.ra+ch2,2,2,blood);
  // boar face: tusks, red eyes, topknot
  px(g,10+A.hx,6+hb,12,12,skin); px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,12+A.hx,10+hb,3,3,"#ff3b3b"); px(g,18+A.hx,10+hb,3,3,"#ff3b3b");
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,19+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,18+A.hx,10+hb,1,1,"#fff");
  px(g,13+A.hx,13+hb,6,4,"#6a8a2a"); px(g,14+A.hx,14+hb,1,2,"#111"); px(g,17+A.hx,14+hb,1,2,"#111");
  px(g,10+A.hx,15+hb,3,6,"#e8e0d0"); px(g,19+A.hx,15+hb,3,6,"#e8e0d0");
  px(g,12+A.hx,2+hb,8,5,"#1a1a1a"); px(g,11+A.hx,0+hb,2,5,"#e8e0d0"); px(g,19+A.hx,0+hb,2,5,"#e8e0d0");
};

/* ============ 19. OUTLAW v7 — wanted blade ============ */
D.outlaw = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const cloth=tint&&tint!=="#ffffff"?tint:"#5a3a5a";
  const dk=shade(cloth,-38), deep=shade(cloth,-68), lite=shade(cloth,32);
  const skin="#c9986a", skinD="#8a5a33", skinL="#f2d0a0";
  const scarf="#8a1a2a", gold="#ffd93d", steel="#9aa0c9";
  auraShadow(g,hb,"rgba(150,110,200,0.20)","rgba(199,125,255,0.08)");
  spark(g,[3,20,lite],[28,16,"#fff"],[26,33,lite]);
  // trousers + boots
  px(g,11+A.lx,28+A.ld,4,6,"#2a1a2a"); px(g,17+A.rx,28+A.rd,4,6,"#2a1a2a");
  px(g,11+A.lx,28+A.ld,1,6,"#5a4a5a"); px(g,20+A.rx,28+A.rd,1,6,"#1a1410");
  px(g,10+A.lx,34+A.ld,6,2,"#111"); px(g,16+A.rx,34+A.rd,6,2,"#111");
  px(g,10+A.lx,34+A.ld,6,1,"#5a4a5a");
  // long coat + trim + bandolier + wanted poster roll
  px(g,8,18,16,12,cloth); px(g,8,18,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,18,2,12,deep); px(g,22,18,2,12,deep);
  for(let y=20;y<27;y+=2) px(g,11,y,10,1,"rgba(0,0,0,0.22)");
  px(g,13,19,2,7,"#3a2a4a"); px(g,17,19,2,7,"#3a2a4a");
  px(g,9,26,14,3,"#2a1a10"); px(g,9,26,14,1,"#8a5a33");
  px(g,15,26,3,3,gold); px(g,15,26,3,1,"#fff2b0");
  px(g,10,29,4,5,"#e8d9b0"); px(g,10,29,4,1,"#fff"); px(g,11,30,2,2,"#5a1a1a");
  // arms: sleeves + bracers + hands
  px(g,5+A.lax,19+A.la,3,8,cloth); px(g,5+A.lax,19+A.la,1,8,lite);
  px(g,5+A.lax,25+A.la,3,2,"#3a2a3a"); px(g,5+A.lax,27+A.la,3,3,skin);
  const up=P.atk?-4:0;
  px(g,24+A.rax,19+A.ra+up,3,8,cloth);
  px(g,24+A.rax,12+A.ra+up,2,12,steel); px(g,24+A.rax,12+A.ra+up,1,12,"#fff");
  px(g,23+A.rax,10+A.ra+up,4,3,"#5a1a2a"); px(g,24+A.rax,12+A.ra+up,1,6,"#3a2a4a");
  px(g,24+A.rax,24+A.ra+up,3,3,skin);
  // head: hood + mask + scar + gold eyes
  px(g,10+A.hx,9+hb,12,10,skin); px(g,10+A.hx,9+hb,12,2,skinL); px(g,10+A.hx,17+hb,12,2,skinD);
  px(g,11+A.hx,11+hb,10,3,"#2a1a2a");
  px(g,13+A.hx,12+hb,2,2,"#ffe14d"); px(g,18+A.hx,12+hb,2,2,"#ffe14d");
  px(g,13+A.hx,13+hb,1,2,"#111"); px(g,18+A.hx,13+hb,1,2,"#111");
  px(g,13+A.hx,12+hb,1,1,"#fff"); px(g,18+A.hx,12+hb,1,1,"#fff");
  px(g,19+A.hx,14+hb,1,4,"#c93b3b");
  px(g,14+A.hx,16+hb,4,1,"#5a1a1a");
  px(g,9+A.hx,5+hb,14,5,cloth); px(g,9+A.hx,5+hb,14,1,lite); px(g,9+A.hx,9+hb,14,1,deep);
  px(g,11+A.hx,2+hb,10,3,scarf); px(g,11+A.hx,2+hb,10,1,"#c05a5a");
};

/* ============ 20. MURDERER v7 — cutthroat ============ */
D.murderer = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const cloth=tint&&tint!=="#ffffff"?tint:"#7a1f1f";
  const dk=shade(cloth,-42), deep=shade(cloth,-72), lite=shade(cloth,32);
  const skin="#c9a080", skinD="#8a5a33", steel="#e07b7b";
  auraShadow(g,hb,"rgba(200,40,40,0.22)","rgba(255,60,60,0.10)");
  spark(g,[3,20,"#ff3b3b"],[28,16,"#fff"],[26,33,"#ff3b3b"]);
  // dark trousers + boots + blood splatter
  px(g,11+A.lx,28+A.ld,4,6,"#1a0a0a"); px(g,17+A.rx,28+A.rd,4,6,"#1a0a0a");
  px(g,11+A.lx,30+A.ld,1,4,"#5a1a1a"); px(g,19+A.rx,30+A.rd,1,2,"#ff3b3b");
  px(g,10+A.lx,34+A.ld,6,2,"#0c0a0a"); px(g,16+A.rx,34+A.rd,6,2,"#0c0a0a");
  px(g,10+A.lx,34+A.ld,6,1,"#5a2a2a");
  // blood-dark coat + straps + poison vials
  px(g,9,18,14,11,cloth); px(g,9,18,14,2,lite); px(g,9,27,14,2,deep);
  px(g,9,18,2,11,deep); px(g,21,18,2,11,deep);
  px(g,13,19,2,7,"#1a0a0a"); px(g,17,19,2,7,"#1a0a0a");
  px(g,11,26,3,3,"#2a4a2a"); px(g,11,26,3,1,"#7dff9b"); px(g,19,26,3,3,"#2a4a5a"); px(g,19,26,3,1,"#7fd4ff");
  px(g,9,27,14,2,"#1a0a0a");
  // LEFT: garrote wire + blood
  px(g,4+A.lax,20,4,3,"#c93b3b"); px(g,4+A.lax,20,4,1,"#ff8a8a");
  px(g,3+A.lax,19+A.la,3,7,cloth); px(g,3+A.lax,26+A.la,3,3,skin);
  // RIGHT: twin fang daggers (raised on atk)
  const up2=P.atk?-5:0;
  px(g,24+A.rax,19+A.ra+up2,3,7,cloth); px(g,24+A.rax,26+A.ra+up2,3,3,skin);
  px(g,24+A.rax,12+A.ra+up2,2,12,steel); px(g,24+A.rax,12+A.ra+up2,1,12,"#fff");
  px(g,27+A.rax,14+A.ra+up2,2,10,steel); px(g,27+A.rax,14+A.ra+up2,1,10,"#fff");
  px(g,24+A.rax,12+A.ra+up2,2,1,"#fff"); px(g,27+A.rax,14+A.ra+up2,2,1,"#fff");
  // head: cowl + red mask + glowing red eyes + scar
  px(g,10+A.hx,9+hb,12,10,skin); px(g,10+A.hx,9+hb,12,2,"#e8c0a0"); px(g,10+A.hx,17+hb,12,2,skinD);
  px(g,11+A.hx,11+hb,10,4,"#1a0a0a");
  g.fillStyle="#ff3b3b"; g.fillRect(13+A.hx,12+hb,2,2); g.fillRect(18+A.hx,12+hb,2,2);
  g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,12+hb,1,2);
  g.fillStyle="#fff"; g.fillRect(13+A.hx,12+hb,1,1); g.fillRect(18+A.hx,12+hb,1,1);
  px(g,15+A.hx,18+hb,2,1,deep); px(g,14+A.hx,19+hb,4,1,"#5a0a0a");
  px(g,19+A.hx,10+hb,1,5,"#ff3b3b"); px(g,19+A.hx,10+hb,1,1,"#fff");
  px(g,9+A.hx,5+hb,14,5,"#3a0a0a"); px(g,9+A.hx,5+hb,14,1,"#5a1a1a"); px(g,9+A.hx,9+hb,14,1,"#1a0a0a");
  px(g,11+A.hx,2+hb,10,3,"#1a0a0a");
};

/* ============ 21. CENTAUR FOAL v7 — four-hoof promise ============ */
D.centaur_foal = (g,tint,ph)=>{
  const P=P_of(ph); const Q=Q_of(P);
  const coat=tint&&tint!=="#ffffff"?tint:"#8a5a33";
  const dk=shade(coat,-36), deep=shade(coat,-68), lite=shade(coat,30);
  const skin="#f2c9a0", skinD="#c98a5a", skinL="#fff2e0";
  auraShadow(g,Hb_of(P),"rgba(200,160,100,0.20)","rgba(255,217,61,0.07)");
  spark(g,[3,22,lite],[28,16,"#fff"],[26,33,lite]);
  // horse barrel + back + belly + dapples + sheen
  px(g,4,24,14,7,coat); px(g,4,24,14,2,lite); px(g,4,29,14,2,dk);
  px(g,4,24,3,7,deep); px(g,15,24,3,7,deep);
  for(let x=6;x<16;x+=3){ px(g,x,26,2,2,dk); px(g,x,26,1,1,lite); }
  px(g,5,25,5,1,"rgba(255,255,255,0.25)"); px(g,6,28,3,1,"#f2ede2");
  // 4 slender foal legs + white socks + dark hooves
  px(g,4+Q.x1,30+Q.d1,3,4,coat); px(g,8+Q.x2,30+Q.d2,3,4,coat); px(g,12+Q.x1,30+Q.d1,3,4,coat); px(g,15+Q.x2,30+Q.d2,3,4,coat);
  px(g,4+Q.x1,30+Q.d1,1,4,lite);
  px(g,4+Q.x1,33+Q.d1,3,2,"#f2ede2"); px(g,8+Q.x2,33+Q.d2,3,2,"#f2ede2"); px(g,12+Q.x1,33+Q.d1,3,2,"#f2ede2"); px(g,15+Q.x2,33+Q.d2,3,2,"#f2ede2");
  px(g,4+Q.x1,34+Q.d1,3,2,"#2a2018"); px(g,8+Q.x2,34+Q.d2,3,2,"#2a2018"); px(g,12+Q.x1,34+Q.d1,3,2,"#2a2018"); px(g,15+Q.x2,34+Q.d2,3,2,"#2a2018");
  px(g,4+Q.x1,34+Q.d1,1,1,"#8a7a6a");
  // flaxen mane + tail + red braid bead
  px(g,3+Sg(P,0,1),20,3,6,"#e8d9a0"); px(g,3+Sg(P,0,1),20,3,1,"#fff");
  px(g,17,18,3,8,"#e8d9a0"); px(g,17,18,1,8,"#b8a888"); px(g,18,24,2,2,"#c93b3b"); px(g,18,24,1,1,"#fff");
  // child torso: tunic + belt + quiver + arrows
  px(g,15,15,9,10,skin); px(g,15,15,9,1,skinL); px(g,15,23,9,2,skinD);
  px(g,15,15,2,10,skinD); px(g,22,15,2,10,skinD);
  px(g,15,18,9,5,"#3a6a3a"); px(g,15,18,9,1,"#5a8a4a"); px(g,15,21,9,1,"#2a4a2a");
  px(g,15,22,9,2,"#c9a227"); px(g,15,22,9,1,"#fff2b0");
  px(g,20,14,4,7,"#5a3a22"); px(g,20,14,4,1,"#8a5a33");
  px(g,21,13,2,2,"#fff"); px(g,21,15,2,2,"#c93b3b");
  // arms: draw + bow
  px(g,12,17,3,6,skin); px(g,12,17,1,6,skinL);
  px(g,24,17-(P.atk?2:0),3,6,skin);
  px(g,25,12,2,12,"#5a3a22"); px(g,25,12,1,12,"#8a5a33");
  px(g,24,11,4,2,"#5a3a22"); px(g,24,22,4,2,"#5a3a22");
  px(g,26,13,1,10,"#e8e0d0");
  // foal head: big gold eyes + forelock + muzzle + blush
  px(g,16,7,9,9,skin); px(g,16,7,9,1,skinL); px(g,16,14,9,2,skinD);
  px(g,16,4,9,4,"#e8d9a0"); px(g,16,4,9,1,"#fff"); px(g,18,5,5,1,"#b8a888");
  px(g,14,8,3,5,"#e8d9a0"); px(g,14,8,1,5,"#b8a888");
  g.fillStyle="#ffe14d"; g.fillRect(18,10,3,3); g.fillRect(22,10,2,2);
  g.fillStyle="#111"; g.fillRect(19,11,1,2); g.fillStyle="#fff"; g.fillRect(18,10,1,1); g.fillRect(22,10,1,1);
  px(g,17,13,2,1,"#f0a090"); px(g,22,13,2,1,"#f0a090");
  px(g,19,13,3,2,"#d9a06b"); px(g,20,14,1,1,"#8a5a33");
  px(g,18,15,4,1,"#7a3a2a");
};

/* ============ 22. CINDER STEED v7 — galloping ember ============ */
D.cinder_steed = (g,tint,ph)=>{
  const P=P_of(ph); const Q=Q_of(P);
  const coat=tint&&tint!=="#ffffff"?tint:"#c9401e";
  const dk=shade(coat,-40), deep=shade(coat,-72), lite=shade(coat,32);
  auraShadow(g,Hb_of(P),"rgba(255,120,40,0.22)","rgba(255,120,40,0.08)");
  spark(g,[4,22,"#ff9d2e"],[28,16,"#fff"],[26,32,"#ffd93d"]);
  const sw=Sg(P,0,1);
  // tail: living flame tongues
  px(g,1+sw,20,3,6,"#ff7b2e"); px(g,0+sw,22,5,4,"#ff9d2e"); px(g,1+sw,22,3,2,"#ffd93d"); px(g,2+sw,22,1,1,"#fff");
  px(g,0+sw,25,2,2,"#7a1f0e");
  g.fillStyle="rgba(255,123,46,0.35)"; g.beginPath(); g.arc(2+sw,23,4,0,7); g.fill();
  // sleek body + flame dapples + belly + ember cracks
  px(g,5,23,18,7,coat); px(g,5,23,18,2,lite); px(g,5,28,18,2,dk);
  px(g,5,23,2,7,deep);
  px(g,8,25,3,2,"#ff7b2e"); px(g,13,26,3,2,"#ffd93d"); px(g,17,25,2,2,"#ff9d2e");
  px(g,9,25,1,1,"#fff"); px(g,14,26,1,1,"#fff");
  for(let x=6;x<20;x+=4) px(g,x,24,1,2,dk);
  px(g,9,29,6,1,"#ff5a1a"); px(g,14,27,4,1,"#ff9d2e");
  // long legs + ember hooves + glow
  px(g,6+Q.x1,29+Q.d1,3,5,coat); px(g,11+Q.x2,29+Q.d2,3,5,coat); px(g,16+Q.x1,29+Q.d1,3,5,coat); px(g,20+Q.x2,29+Q.d2,3,5,coat);
  px(g,6+Q.x1,29+Q.d1,1,5,lite);
  px(g,6+Q.x1,33+Q.d1,3,2,"#1a0e08"); px(g,11+Q.x2,33+Q.d2,3,2,"#1a0e08"); px(g,16+Q.x1,33+Q.d1,3,2,"#1a0e08"); px(g,20+Q.x2,33+Q.d2,3,2,"#1a0e08");
  px(g,6+Q.x1,33+Q.d1,3,1,"#ff7b2e"); px(g,11+Q.x2,33+Q.d2,3,1,"#ff7b2e");
  px(g,6+Q.x1,32+Q.d1,3,1,"#ffd93d");
  // neck + head + flame mane + forelock
  px(g,20,16,7,10,coat); px(g,20,16,7,2,lite); px(g,20,24,7,2,dk);
  px(g,20,16,2,10,deep);
  px(g,19,14,3,8,"#ff7b2e"); px(g,19,14,3,1,"#ffd93d"); px(g,20,16,2,6,"#ff9d2e"); px(g,20,16,1,2,"#fff");
  px(g,18,12,4,5,"#ff7b2e"); px(g,18,12,4,1,"#fff"); px(g,19,13,2,2,"#ffd93d");
  px(g,24,19,4,4,"#2a0e06"); px(g,25,20,2,2,"#111"); px(g,25,20,1,1,"#555");
  g.fillStyle="#ffe14d"; g.fillRect(22,18,2,2); g.fillStyle="#111"; g.fillRect(22,18,1,2); g.fillStyle="#fff"; g.fillRect(22,18,1,1);
  px(g,21,17,3,1,deep);
  px(g,25,23,3,1,"#5a1a0a");
};

/* ============ 23. PETER THE FALLEN v12 — VOID TYRANT PERFECTED (10/10) ============ */
D.peter_the_fallen = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  // deep void aura + purple fire embers + floating void shards
  g.fillStyle="rgba(130,70,230,0.32)"; g.beginPath(); g.ellipse(16,22+hb,13,15,0,0,7); g.fill();
  g.fillStyle="rgba(160,90,255,0.22)"; g.beginPath(); g.ellipse(16,24+hb,8,11,0,0,7); g.fill();
  px(g,2,26,1,1,"#7a4ae0"); px(g,29,14,1,1,"#d08aff"); px(g,5,33,1,1,"#7a4ae0"); px(g,27,31,1,1,"#d08aff");
  px(g,12,1,1,1,"#fff"); px(g,24,33,1,1,"#fff");
  px(g,1,20,1,2,"#a04aff"); px(g,30,18,1,2,"#a04aff");
  const orb=Sg(P,1,1);
  px(g,3+orb,5,2,2,"#a04aff"); px(g,3+orb,5,1,1,"#fff"); px(g,28-orb,7,2,2,"#a04aff"); px(g,28-orb,7,1,1,"#fff");
  // violet fire tongues on shoulders + horns + halo (voidstalker fire)
  const fl=P.moving?[0,1,0,-1][P.f&3]:0;
  px(g,6+fl,10,2,3,"#7a4ae0"); px(g,6+fl,9,2,1,"#d08aff"); px(g,6+fl,9,1,1,"#fff"); px(g,6+fl,8,1,1,"#a04aff");
  px(g,24-fl,10,2,3,"#7a4ae0"); px(g,24-fl,9,2,1,"#d08aff"); px(g,24-fl,9,1,1,"#fff"); px(g,24-fl,8,1,1,"#a04aff");
  px(g,10,3,2,2,"#a04aff"); px(g,10,2,2,1,"#fff"); px(g,20,3,2,2,"#a04aff"); px(g,20,2,2,1,"#fff");
  px(g,2,12,1,2,"#a04aff"); px(g,29,12,1,2,"#a04aff");
  g.fillStyle="rgba(160,74,255,0.30)"; g.beginPath(); g.arc(7+fl,9,4,0,7); g.fill(); g.beginPath(); g.arc(25-fl,9,4,0,7); g.fill();
  // tattered cape (violet hem + folds + clasp)
  px(g,7,19,3,17,"#4a0a14"); px(g,12,19,3,17,"#4a0a14"); px(g,17,19,3,17,"#33070f"); px(g,22,19,3,17,"#4a0a14");
  px(g,7,19,1,17,"#6a1a24"); px(g,22,19,1,17,"#2a050a");
  px(g,7,35,3,1,"#a04aff"); px(g,12,35,3,1,"#a04aff"); px(g,17,35,3,1,"#a04aff"); px(g,22,35,3,1,"#a04aff");
  px(g,14,19,4,2,"#2a0a14"); px(g,15,20,2,1,"#7a4ae0");
  // torn void wings: larger, dark roots, violet rims, fire tips
  g.fillStyle="#0b0716";
  g.beginPath(); g.moveTo(11,23); g.lineTo(2,7); g.lineTo(6,6); g.lineTo(11,18); g.fill();
  g.beginPath(); g.moveTo(11,23); g.lineTo(0,4); g.lineTo(3,4); g.lineTo(9,16); g.fill();
  g.beginPath(); g.moveTo(21,23); g.lineTo(30,7); g.lineTo(26,6); g.lineTo(21,18); g.fill();
  g.beginPath(); g.moveTo(21,23); g.lineTo(32,4); g.lineTo(29,4); g.lineTo(23,16); g.fill();
  g.fillStyle="#221a52";
  g.beginPath(); g.moveTo(9,22); g.lineTo(3,12); g.lineTo(7,13); g.lineTo(10,21); g.fill();
  g.beginPath(); g.moveTo(23,22); g.lineTo(29,12); g.lineTo(25,13); g.lineTo(22,21); g.fill();
  px(g,0,4,2,2,"#a04aff"); px(g,1,6,1,3,"#d08aff"); px(g,0,4,1,1,"#fff");
  px(g,30,4,2,2,"#a04aff"); px(g,30,6,1,3,"#d08aff"); px(g,31,4,1,1,"#fff");
  px(g,3,8,1,2,"#d08aff"); px(g,28,8,1,2,"#d08aff"); px(g,2,10,1,1,"#fff"); px(g,29,10,1,1,"#fff");
  // legs: darker greaves, violet fire seams, heavy boots
  px(g,10+A.lx,28+A.ld,5,8,"#0c0c12"); px(g,17+A.rx,28+A.rd,5,8,"#0c0c12");
  px(g,12+A.lx,29+A.ld,1,6,"#a04aff"); px(g,19+A.rx,29+A.rd,1,6,"#a04aff");
  px(g,12+A.lx,31+A.ld,1,2,"#fff");
  px(g,10+A.lx,28+A.ld,5,1,"#2a2a38"); px(g,17+A.rx,28+A.rd,5,1,"#2a2a38");
  px(g,9+A.lx,36+A.ld,7,3,"#050508"); px(g,16+A.rx,36+A.rd,7,3,"#050508");
  px(g,9+A.lx,36+A.ld,7,1,"#5a3a7a");
  // torso: black plate + MANY violet cracks + chest maw with teeth + beating heart
  px(g,9,18,14,12,"#101016"); px(g,9,18,14,1,"#2e2e40");
  px(g,9,18,1,12,"#23232f"); px(g,22,18,1,12,"#23232f");
  px(g,11,20,1,4,"#5a2fb0"); px(g,20,26,1,4,"#5a2fb0"); px(g,12,24,1,3,"#a04aff"); px(g,19,21,1,3,"#a04aff"); px(g,11,27,1,2,"#7a4ae0");
  px(g,13,22,6,4,"#0d0312");
  px(g,13,22,6,1,"#a04aff"); px(g,13,25,6,1,"#3a2060");
  px(g,13,22,1,2,"#fff"); px(g,18,22,1,2,"#fff");
  px(g,14,22,1,1,"#fff"); px(g,16,22,1,1,"#fff");
  px(g,15,23,1,2,"#ff6aff"); px(g,15,24,1,1,"#fff"); px(g,15,25,1,1,"#d08aff");
  px(g,13,23,1,1,"#fff"); px(g,18,23,1,1,"#fff"); px(g,14,24,1,1,"#a04aff");
  // spiked pauldrons, violet FIRE tips (tallest flames)
  px(g,3,15,7,5,"#14141c"); px(g,3,15,7,1,"#3a3a4c");
  px(g,22,15,7,5,"#14141c"); px(g,22,15,7,1,"#3a3a4c");
  px(g,3,12,2,3,"#2a2a38"); px(g,3,12,2,1,"#d08aff"); px(g,3,11,2,1,"#a04aff"); px(g,3,10,1,1,"#fff"); px(g,3,9,1,1,"#a04aff");
  px(g,5,11,2,4,"#2a2a38"); px(g,5,11,2,1,"#d08aff"); px(g,5,10,1,1,"#fff"); px(g,5,9,1,2,"#a04aff");
  px(g,7,12,2,3,"#2a2a38"); px(g,7,12,2,1,"#d08aff"); px(g,7,11,1,1,"#fff");
  px(g,24,12,2,3,"#2a2a38"); px(g,24,12,2,1,"#d08aff"); px(g,26,11,2,4,"#2a2a38"); px(g,26,11,2,1,"#d08aff"); px(g,26,10,1,1,"#fff"); px(g,26,9,1,2,"#a04aff");
  px(g,28,12,1,3,"#2a2a38"); px(g,28,12,1,1,"#d08aff"); px(g,28,11,1,1,"#a04aff"); px(g,28,10,1,1,"#fff");
  // LEFT arm + long fang claws + violet veins
  px(g,4+A.lax,21+A.la,4,7,"#101018"); px(g,4+A.lax,21+A.la,1,7,"#5a2fb0");
  px(g,4+A.lax,27+A.la,5,3,"#1c1c26");
  px(g,4+A.lax,30+A.la,1,2,"#b8ac9c"); px(g,6+A.lax,30+A.la,1,2,"#e8e0d0"); px(g,8+A.lax,30+A.la,1,2,"#b8ac9c");
  px(g,4+A.lax,23+A.la,1,3,"#a04aff");
  // RIGHT arm + voidglass shard-blade with violet FIRE envelope + halo
  const swb=P.atk?-7:0;
  px(g,23+A.rax,19+A.ra+swb,4,8,"#101018");
  px(g,23+A.rax,26+A.ra+swb,4,3,"#1c1c26");
  g.fillStyle="rgba(160,74,255,0.35)"; g.beginPath(); g.arc(28,14+swb,6,0,7); g.fill();
  px(g,25,7+swb,1,16,"#5a2fb0"); px(g,30,7+swb,1,16,"#5a2fb0");
  px(g,26,8+swb,1,16,"#2a1a4a"); px(g,27,6+swb,2,18,"#a04aff"); px(g,28,7+swb,1,16,"#fff");
  px(g,26,5+swb,3,2,"#d08aff"); px(g,27,4+swb,1,1,"#fff");
  px(g,27,10+swb,1,2,"#fff"); px(g,27,16+swb,1,2,"#fff");
  px(g,25,6+swb,1,3,"#a04aff"); px(g,30,6+swb,1,3,"#a04aff"); px(g,25,5+swb,1,1,"#fff"); px(g,30,5+swb,1,1,"#fff");
  px(g,25,24+swb,4,2,"#2a1a4a"); px(g,26,24+swb,2,1,"#d08aff");
  // BLACK DEMON MASK: violet blaze double-eye, fire tears, fanged grin
  px(g,11+A.hx,8+hb,10,10,"#0a0a12");
  px(g,11+A.hx,8+hb,1,10,"#1e1e2e"); px(g,20+A.hx,8+hb,1,10,"#000");
  px(g,11+A.hx,8+hb,10,2,"#000");
  px(g,12+A.hx,8+hb,8,1,"#a04aff");
  px(g,12+A.hx,10+hb,8,3,"#7a4ae0"); px(g,13+A.hx,10+hb,6,2,"#d08aff");
  px(g,12+A.hx,10+hb,3,3,"#a04aff"); px(g,17+A.hx,10+hb,3,3,"#a04aff");
  px(g,13+A.hx,11+hb,2,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,13+hb,1,3,"#a04aff"); px(g,18+A.hx,13+hb,1,2,"#a04aff"); px(g,13+A.hx,15+hb,1,1,"#5a2fb0");
  px(g,12+A.hx,14+hb,1,2,"#a04aff"); px(g,19+A.hx,14+hb,1,1,"#a04aff");
  px(g,15+A.hx,11+hb,2,1,"#fff");
  px(g,13+A.hx,16+hb,6,2,"#000");
  px(g,13+A.hx,16+hb,1,1,"#fff"); px(g,15+A.hx,16+hb,1,1,"#fff"); px(g,17+A.hx,16+hb,1,1,"#fff");
  px(g,14+A.hx,17+hb,1,1,"#4a4a5e"); px(g,16+A.hx,17+hb,1,1,"#4a4a5e");
  // long swept bone horns, violet-cracked
  px(g,8+A.hx,7+hb,2,2,"#e8e0d0"); px(g,6+A.hx,6+hb,2,2,"#e8e0d0"); px(g,4+A.hx,5+hb,2,2,"#e8e0d0");
  px(g,2+A.hx,3+hb,2,2,"#e8e0d0"); px(g,0+A.hx,1+hb,2,2,"#e8e0d0"); px(g,0+A.hx,0+hb,1,1,"#fff");
  px(g,8+A.hx,8+hb,2,1,"#8a8078"); px(g,6+A.hx,7+hb,2,1,"#8a8078"); px(g,4+A.hx,6+hb,2,1,"#8a8078"); px(g,2+A.hx,4+hb,2,1,"#8a8078");
  px(g,8+A.hx,7+hb,2,1,"#7a4ae0"); px(g,5+A.hx,6+hb,1,1,"#a04aff"); px(g,3+A.hx,4+hb,1,1,"#a04aff");
  px(g,22+A.hx,7+hb,2,2,"#e8e0d0"); px(g,24+A.hx,6+hb,2,2,"#e8e0d0"); px(g,26+A.hx,5+hb,2,2,"#e8e0d0");
  px(g,28+A.hx,3+hb,2,2,"#e8e0d0"); px(g,30+A.hx,1+hb,2,2,"#e8e0d0"); px(g,31+A.hx,0+hb,1,1,"#fff");
  px(g,22+A.hx,8+hb,2,1,"#8a8078"); px(g,24+A.hx,7+hb,2,1,"#8a8078"); px(g,26+A.hx,6+hb,2,1,"#8a8078"); px(g,28+A.hx,4+hb,2,1,"#8a8078");
  px(g,22+A.hx,7+hb,2,1,"#7a4ae0"); px(g,26+A.hx,6+hb,1,1,"#a04aff"); px(g,28+A.hx,4+hb,1,1,"#a04aff");
  // floating broken halo: thicker, violet fire, big shards + glints
  px(g,9,1,5,2,"#2a1a4a"); px(g,18,1,5,2,"#2a1a4a");
  px(g,9,1,5,1,"#d08aff"); px(g,18,1,4,1,"#d08aff"); px(g,9,0,5,1,"#a04aff"); px(g,18,0,5,1,"#a04aff");
  px(g,8,2,2,2,"#2a1a4a"); px(g,22,2,2,2,"#2a1a4a");
  px(g,5,4,3,3,"#a04aff"); px(g,5,4,2,1,"#fff"); px(g,25,3,3,3,"#a04aff"); px(g,25,3,2,1,"#fff");
  px(g,5,3,1,1,"#fff"); px(g,27,2,1,1,"#fff"); px(g,4,4,1,1,"#fff");
  // ground shadow
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
};

/* wrapper below */




const prev = window.Sprites.actor;
const cache = new Map();
try{ (window.__spriteCacheResets=window.__spriteCacheResets||[]).push(()=>cache.clear()); }catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if(kind==="goddess") return prev.call(this,kind,tint,seed,gear,app,gen,ph);
  if(D[kind]){
    gen=(gen==="male"||gen==="female")?gen:"";
    let P=null,bk="";
    try{ if(window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph); } else P=window.Anim.normP(null); } }catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck="R22|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=document.createElement("canvas"); c.width=32; c.height=40; const g2=c.getContext("2d"); g2.imageSmoothingEnabled=false;
    g2.clearRect(0,0,32,40);
    try{ D[kind](g2,tint||"#fff",P); }catch(e){}
    let out=c; try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>700) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
})();
