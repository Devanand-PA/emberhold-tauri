/* src/sprites/sprite_goddess_parity15b.js — GODDESS-BAR PARITY batch B (5/15).
 * Loaded AFTER parity15a. Same goddess bar.
 * Kinds: bleed_mother, chimera_cub, deepmaw, demon_warden, draugr.
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

/* ============ 6. BLEED MOTHER — mother of every wound (goddess bar) ============ */
D.bleed_mother = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#4a0a14", dk="#22040a", lite="#8a2a3a", pale="#ff8ac0";
  const skin="#e8b8a8", skinD="#b07868", blood="#c02040", bloodD="#6a0a1c";
  aura(g,hb,"rgba(200,30,60,0.24)","rgba(255,138,192,0.12)");
  sparks(g,[pale,blood]);
  // trailing hem: tattered veil + pooling blood
  px(g,10+A.lx,30+A.ld,4,6,robe); px(g,18+A.rx,30+A.rd,4,6,robe);
  px(g,9+A.lx,35+A.ld,6,2,dk); px(g,17+A.rx,35+A.rd,6,2,dk);
  px(g,8,33,16,3,blood); px(g,8,33,16,1,pale);
  px(g,10,35,2,2,bloodD); px(g,20,35,2,2,bloodD);
  // gown: dark red + ribbed folds + arterial trim
  px(g,8,22,16,12,robe);
  px(g,8,22,16,2,lite); px(g,8,32,16,2,dk);
  px(g,8,22,2,12,dk); px(g,22,22,2,12,"#1a0208");
  px(g,11,24,3,8,"#5a101c"); px(g,15,24,2,8,"#5a101c"); px(g,18,24,3,8,"#5a101c");
  px(g,11,24,3,1,pale); px(g,18,24,3,1,pale);
  // chest wound-maw: open stigma with teeth + heart glow (her motherhood)
  px(g,13,20,6,6,"#2a040a");
  px(g,13,20,6,1,blood); px(g,13,25,6,1,bloodD);
  px(g,14,21,4,3,blood); px(g,15,22,2,2,pale); px(g,15,22,1,1,"#fff");
  px(g,13,20,2,1,"#fff"); px(g,17,20,2,1,"#fff");
  px(g,14,24,1,1,"#fff"); px(g,17,24,1,1,"#fff");
  // arms: sleeves -> cradling hands; left holds wailing infant bundle
  px(g,5+A.lax,20+A.la,4,6,robe); px(g,5+A.lax,20+A.la,1,6,lite);
  px(g,23+A.rax,20+A.ra,4,6,robe); px(g,26+A.rax,20+A.ra,1,6,lite);
  px(g,4+A.lax,25+A.la,4,4,skin); px(g,4+A.lax,25+A.la,1,4,skinD);
  px(g,24+A.rax,25+A.ra,4,4,skin); px(g,27+A.rax,25+A.ra,1,4,skinD);
  px(g,3+A.lax,27+A.la,6,5,"#d8a898"); px(g,3+A.lax,27+A.la,6,1,"#fff");
  px(g,4+A.lax,28+A.la,2,2,"#5a1a1a"); px(g,4+A.lax,28+A.la,1,1,"#fff");
  // veil: torn bridal shroud over hair
  px(g,8+A.hx,4+hb,16,4,"#2a060c"); px(g,8+A.hx,4+hb,16,1,"#5a1a2a");
  px(g,6+A.hx,8+hb,3,10,"#2a060c"); px(g,23+A.hx,8+hb,3,10,"#2a060c");
  gface(g,A.hx,hb,skin,skinD,"#7a1a2a","#4a0a14","#c06070",bloodD,2);
  // suffering queen details: blood tears, knotted brows, wail mouth
  px(g,13+A.hx,12+hb,1,3,blood); px(g,18+A.hx,12+hb,1,3,blood);
  px(g,12+A.hx,9+hb,4,1,"#4a0a14"); px(g,18+A.hx,9+hb,2,1,"#4a0a14");
  px(g,14+A.hx,14+hb,4,2,"#4a0a10"); px(g,15+A.hx,15+hb,2,1,"#fff");
  // crown: broken marriage circlet + red gems
  px(g,10+A.hx,2+hb,12,2,"#8a6a3a"); px(g,10+A.hx,2+hb,12,1,pale);
  px(g,12+A.hx,1+hb,2,2,blood); px(g,18+A.hx,1+hb,2,2,blood);
  px(g,12+A.hx,1+hb,1,1,"#fff");
};

/* ============ 7. CHIMERA CUB — three heads, one braincell (goddess bar) ============ */
D.chimera_cub = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur=tint||"#c96b2e", dk="#7a3a1a", lite="#f0a95e", cream="#ffe8c0";
  const goat="#e8e0d0", scale="#4a8a4d";
  aura(g,hb,"rgba(240,169,94,0.20)","rgba(255,240,200,0.12)");
  sparks(g,[lite,"#fff"]);
  // legs: cub paws + claws
  px(g,9+A.lx,29+A.ld,4,6,fur); px(g,19+A.rx,29+A.rd,4,6,fur);
  px(g,9+A.lx,29+A.ld,1,6,lite); px(g,22+A.rx,29+A.rd,1,6,dk);
  px(g,8+A.lx,34+A.ld,6,2,dk); px(g,18+A.rx,34+A.rd,6,2,dk);
  px(g,8+A.lx,34+A.ld,2,1,"#fff");
  // body: tawny + belly + back stripe + tiny wings
  px(g,8,23,16,8,fur); px(g,8,23,16,2,lite); px(g,8,29,16,2,dk);
  px(g,8,23,2,8,dk);
  px(g,11,26,10,3,cream); px(g,11,26,10,1,"#fff");
  px(g,12,23,2,2,dk); px(g,16,23,2,2,dk); px(g,20,23,2,2,dk);
  const flap=P.atk?2:(P.moving?(P.f%2):0);
  px(g,9-flap,18,5,4,lite); px(g,9-flap,18,5,1,"#fff");
  px(g,18+flap,18,5,4,lite); px(g,18+flap,18,5,1,"#fff");
  // serpent tail: scaled + rattle
  const sw2=(P.moving?(P.f%2?1:-1):0);
  px(g,23+sw2,26,5,4,scale); px(g,23+sw2,26,5,1,"#7ccc6a");
  px(g,27+sw2,27,3,3,cream); px(g,28+sw2,28,1,1,dk);
  // CENTER head (lion cub): mane + goddess-layout eyes + nose + grin
  px(g,11+A.hx,9+hb,10,9,fur);
  px(g,9+A.hx,7+hb,14,4,dk); px(g,9+A.hx,7+hb,14,1,"#a95e2e");
  px(g,9+A.hx,7+hb,2,11,dk); px(g,21+A.hx,7+hb,2,11,dk);
  px(g,12+A.hx,11+hb,3,1,"#3a2018"); px(g,17+A.hx,11+hb,3,1,"#3a2018");
  px(g,12+A.hx,12+hb,3,2,"#5a3208"); px(g,17+A.hx,12+hb,3,2,"#5a3208");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,15+A.hx,13+hb,2,2,"#5a2a1a");
  px(g,13+A.hx,15+hb,6,1,"#5a2a1a"); px(g,14+A.hx,15+hb,1,1,"#fff"); px(g,17+A.hx,15+hb,1,1,"#fff");
  // LEFT head (goat kid): pale + beard + horn nubs + sideways eyes
  px(g,3+A.hx,11+hb,7,7,goat); px(g,3+A.hx,11+hb,7,1,"#fff");
  px(g,4+A.hx,12+hb,2,2,"#111"); px(g,7+A.hx,12+hb,2,2,"#111");
  px(g,4+A.hx,12+hb,1,1,"#fff");
  px(g,5+A.hx,16+hb,3,3,"#c9c4b8"); px(g,6+A.hx,18+hb,1,2,dk);
  px(g,3+A.hx,9+hb,2,3,dk); px(g,8+A.hx,9+hb,2,3,dk);
  // RIGHT head (serpent hatchling): green + forked tongue + slit eyes
  px(g,22+A.hx,11+hb,7,7,scale); px(g,22+A.hx,11+hb,7,1,"#7ccc6a");
  px(g,23+A.hx,12+hb,3,2,"#ffe14d"); px(g,26+A.hx,12+hb,1,2,"#ffe14d");
  px(g,24+A.hx,12+hb,1,2,"#111");
  px(g,23+A.hx,12+hb,1,1,"#fff");
  const tg=P.atk?2:0;
  px(g,24+A.hx,15+hb,3,2+tg,"#7a1f1f"); px(g,25+A.hx,16+hb,1,1,"#ff8a8a");
  // shared blush (one braincell, three cheeks)
  px(g,11+A.hx,13+hb,1,1,"#f0a090"); px(g,3+A.hx,14+hb,1,1,"#f0a090"); px(g,27+A.hx,14+hb,1,1,"#f0a090");
};

/* ============ 8. DEEPMAW — abyss lie-and-mouth (goddess bar) ============ */
D.deepmaw = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const body=tint||"#0e2a3a", dk="#050e18", lite="#3a6a8a", glow="#7ad9f0", lure="#bff2ff";
  aura(g,hb,"rgba(122,217,240,0.20)","rgba(20,60,90,0.20)");
  sparks(g,[glow,"#fff"]);
  // abyss coil: heavy serpent bands + finlets + glow spots
  const sl=(P.moving?(P.f%2?1:-1):0);
  px(g,5+sl,30,22,5,dk); px(g,5+sl,30,22,1,body);
  px(g,7+sl,27,18,4,body); px(g,7+sl,27,18,1,lite);
  px(g,7+sl,27,2,4,dk); px(g,23+sl,27,2,4,dk);
  px(g,9+sl,28,2,2,glow); px(g,15+sl,28,2,2,glow); px(g,21+sl,28,2,2,glow);
  px(g,10+sl,24,2,3,lite); px(g,19+sl,24,2,3,lite);
  // gill slits ride the coil
  px(g,12+sl,22,1,4,dk); px(g,14+sl,22,1,4,dk);
  // rising head mass rides the coil while gliding
  px(g,12+sl,12,11,13,body); px(g,12+sl,12,11,2,lite); px(g,12+sl,12,2,13,dk); px(g,21+sl,12,2,13,dk);
  // HUGE JAW: upper + lower + 2 rows of fangs + throat glow
  const jaw=P.atk?3:0;
  px(g,11+sl,8,13,7,body); px(g,11+sl,8,13,2,lite);
  px(g,16+sl,14,7,4,"#5a1a1a");
  for(let i=0;i<4;i++){ px(g,16+i*2+sl,14,1,3,"#fff"); px(g,16+i*2+sl,18+jaw,1,3,"#fff"); }
  px(g,15+sl,18+jaw,9,4,"#7a1f2e"); px(g,15+sl,18+jaw,9,1,"#a94a5a");
  px(g,17+sl,19+jaw,5,2,"#3a0e16");
  // lure stalk + glowing bulb (the lie)
  const bob=(P.moving?(P.f%2?-1:0):0);
  px(g,18+sl,2+bob,2,7,glow); px(g,18+sl,2+bob,2,1,"#fff");
  px(g,16+sl,0+bob,6,4,lure); px(g,17+sl,1+bob,4,2,"#fff"); px(g,18+sl,2+bob,2,2,glow);
  // angler eyes: big lagoon + glint, brow ridges
  px(g,13+sl,10,4,4,"#fff"); px(g,20+sl,10,3,3,"#fff");
  px(g,14+sl,11,2,3,"#123a52"); px(g,20+sl,11,2,2,"#123a52");
  px(g,13+sl,10,1,1,"#fff"); px(g,20+sl,10,1,1,"#fff");
  px(g,12+sl,9,5,1,dk); px(g,19+sl,9,4,1,dk);
  px(g,13+sl,14,2,1,"#f0a090");
  // side fins + tail glow paddle with the coil
  px(g,8+sl,20,3,6,lite); px(g,8+sl,20,1,6,"#fff"); px(g,23+sl,20,3,6,lite); px(g,25+sl,20,1,6,"#fff");
};

/* ============ 9. DEMON WARDEN — obsidian jailer (goddess bar) ============ */
D.demon_warden = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin=tint||"#8a1a00", dk="#2a0800", lite="#c94a1a";
  const iron="#1a1622", ironL="#3a3450", gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(255,90,26,0.20)","rgba(255,217,61,0.10)");
  sparks(g,["#ff5a1a",goldL]);
  // legs: armored greaves + boots
  px(g,9+A.lx,29+A.ld,5,7,dk); px(g,18+A.rx,29+A.rd,5,7,dk);
  px(g,9+A.lx,29+A.ld,1,7,lite); px(g,22+A.rx,29+A.rd,1,7,lite);
  px(g,8+A.lx,35+A.ld,7,2,"#0c0202"); px(g,17+A.rx,35+A.rd,7,2,"#0c0202");
  // obsidian plate: layered + gold hem + rivets
  px(g,6,17,20,14,skin); px(g,6,17,20,2,lite); px(g,6,29,20,2,dk);
  px(g,6,17,2,14,dk); px(g,24,17,2,14,"#1a0400");
  px(g,9,20,14,3,iron); px(g,9,20,14,1,ironL);
  px(g,11,24,10,6,dk); px(g,12,25,8,4,"#ff5a1a"); px(g,13,26,6,3,gold); px(g,15,27,2,1,"#fff");
  px(g,6,17,20,1,gold); px(g,6,17,20,1,goldL);
  px(g,8,28,2,2,gold); px(g,22,28,2,2,gold);
  // spiked pauldrons: layered obsidian + gold rivets + ember tips
  px(g,3,15,7,4,iron); px(g,3,15,7,1,ironL); px(g,4,15,5,1,gold);
  px(g,22,15,7,4,iron); px(g,22,15,7,1,ironL); px(g,23,15,5,1,gold);
  px(g,4,13,2,3,iron); px(g,4,13,2,1,goldL); px(g,26,13,2,3,iron); px(g,26,13,2,1,goldL);
  px(g,6,14,2,2,"#ff5a1a"); px(g,24,14,2,2,"#ff5a1a"); px(g,6,14,1,1,"#fff");
  // belt: jeweled skull-lock + hanging chains
  px(g,12,26,8,3,gold); px(g,12,26,8,1,goldL); px(g,15,27,2,1,"#111"); px(g,15,26,1,1,"#fff");
  px(g,10,29,2,3,goldD()); px(g,20,29,2,3,goldD());
  // boot trim: gold greave bands + ember anklets
  px(g,9+A.lx,32+A.ld,5,1,gold); px(g,17+A.rx,32+A.rd,5,1,gold);
  function goldD(){ return "#8a6410"; }
  // TOWER SHIELD (tall, steel rim, gold sigil, blood groove)
  px(g,0+A.lax,15+A.la,6,15,iron); px(g,0+A.lax,15+A.la,6,1,ironL); px(g,0+A.lax,29+A.la,6,1,"#0c0a14");
  px(g,1+A.lax,16+A.la,4,13,ironL); px(g,2+A.lax,20+A.la,2,5,gold); px(g,2+A.lax,20+A.la,1,1,"#fff");
  px(g,1+A.lax,26+A.la,4,1,bloodD()); function bloodD(){ return "#6a0a1c"; }
  px(g,2+A.lax,21+A.la,2,2,"#ff5a1a"); px(g,2+A.lax,21+A.la,1,1,"#fff");
  px(g,1+A.lax,16+A.la,4,1,goldL); px(g,1+A.lax,28+A.la,4,1,gold);
  // HAMMER (raises on bash): haft + ember head + glow
  const sm=P.atk?-5:0;
  px(g,25+A.rax,18+A.ra+sm,3,9,"#5a3a2a"); px(g,25+A.rax,18+A.ra+sm,1,9,"#a97648");
  px(g,23+A.rax,14+A.ra+sm,7,6,dk); px(g,23+A.rax,14+A.ra+sm,7,1,lite);
  px(g,23+A.rax,15+A.ra+sm,7,1,"#ff5a1a"); px(g,23+A.rax,16+A.ra+sm,2,2,"#fff");
  px(g,23+A.rax,19+A.ra+sm,7,1,gold);
  // crested HELM: dome + crest + cheek guards; glowing visor eyes
  px(g,9+A.hx,6+hb,14,11,skin); px(g,9+A.hx,6+hb,14,2,lite); px(g,9+A.hx,15+hb,14,2,dk);
  px(g,8+A.hx,3+hb,16,5,iron); px(g,8+A.hx,3+hb,16,1,ironL); px(g,10+A.hx,4+hb,12,1,gold);
  px(g,14+A.hx,0+hb,4,4,"#ff5a1a"); px(g,15+A.hx,0+hb,2,4,goldL);
  g.fillStyle="#e8e0d0";
  g.beginPath(); g.moveTo(11+A.hx,6+hb); g.lineTo(7+A.hx,0+hb); g.lineTo(12+A.hx,5+hb); g.fill();
  g.beginPath(); g.moveTo(21+A.hx,6+hb); g.lineTo(25+A.hx,0+hb); g.lineTo(20+A.hx,5+hb); g.fill();
  px(g,12+A.hx,11+hb,3,3,gold); px(g,18+A.hx,11+hb,2,2,gold);
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,19+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,11+hb,1,1,"#fff");
  px(g,12+A.hx,14+hb,3,1,dk); px(g,18+A.hx,14+hb,2,1,dk);
};

/* ============ 10. DRAUGR — grave-gold miser (goddess bar) ============ */
D.draugr = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const flesh=tint||"#6a7a6a", dk="#3a4a3a", lite="#9ab89a";
  const rust="#8a5a2e", gold="#d8a018", goldL="#f6d34e";
  aura(g,hb,"rgba(150,180,150,0.16)","rgba(216,160,24,0.12)");
  sparks(g,[goldL,lite]);
  // legs: rotted wraps + grave boots + gold anklet
  px(g,11+A.lx,29+A.ld,4,6,flesh); px(g,17+A.rx,29+A.rd,4,6,flesh);
  px(g,11+A.lx,29+A.ld,1,6,lite); px(g,20+A.rx,29+A.rd,1,6,dk);
  px(g,10+A.lx,34+A.ld,6,2,"#2a2418"); px(g,16+A.rx,34+A.rd,6,2,"#2a2418");
  px(g,10+A.lx,34+A.ld,6,1,gold);
  px(g,12+A.lx,31+A.ld,2,2,dk); px(g,18+A.rx,31+A.rd,2,2,dk);
  // torso: rusted mail + torn surcoat + coin belt
  px(g,9,20,14,11,flesh); px(g,9,20,14,2,lite); px(g,9,29,14,2,dk);
  px(g,9,20,2,11,dk); px(g,21,20,2,11,dk);
  px(g,11,22,10,6,rust); px(g,11,22,10,1,"#a97648");
  px(g,12,24,2,3,dk); px(g,16,24,2,3,dk); px(g,20,24,1,3,dk);
  px(g,9,28,14,3,gold); px(g,9,28,14,1,goldL); px(g,9,30,14,1,"#8a6410");
  px(g,14,28,3,3,"#e8e0d0"); px(g,15,29,1,1,"#111");
  // arms: vambraces -> claws; right raises notched sword on atk
  px(g,5+A.lax,21+A.la,4,6,flesh); px(g,23+A.rax,21+A.ra,4,6,flesh);
  px(g,5+A.lax,21+A.la,1,6,lite);
  px(g,4+A.lax,26+A.la,5,3,rust); px(g,24+A.rax,26+A.ra,5,3,rust);
  px(g,4+A.lax,29+A.la,1,2,lite); px(g,6+A.lax,29+A.la,1,2,lite);
  const sw=P.atk?-6:0;
  px(g,25+A.rax,10+A.ra+sw,2,14,"#c9ccd4"); px(g,25+A.rax,10+A.ra+sw,1,14,"#fff");
  px(g,24+A.rax,23+A.ra+sw,4,2,gold); px(g,25+A.rax,25+A.ra+sw,2,4,"#3a2a1a");
  // head: gaunt + moss + glowing grave-eyes (goddess layout, undead palette)
  px(g,10+A.hx,8+hb,12,9,flesh);
  px(g,10+A.hx,8+hb,12,2,lite); px(g,10+A.hx,15+hb,12,2,dk);
  px(g,10+A.hx,8+hb,2,9,dk); px(g,20+A.hx,8+hb,2,9,dk);
  px(g,12+A.hx,11+hb,3,3,"#bff2ff"); px(g,17+A.hx,11+hb,3,3,"#bff2ff");
  px(g,13+A.hx,12+hb,1,2,"#0e2a3a"); px(g,18+A.hx,12+hb,1,2,"#0e2a3a");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,11+A.hx,9+hb,4,1,dk); px(g,17+A.hx,9+hb,4,1,dk);
  px(g,12+A.hx,14+hb,2,1,"#4a5a4a"); px(g,18+A.hx,14+hb,2,1,"#4a5a4a");
  px(g,14+A.hx,15+hb,4,1,dk);
  // moss patches + cracked crown-band of grave gold
  px(g,10+A.hx,8+hb,3,2,"#4a7a3a"); px(g,19+A.hx,10+hb,2,2,"#4a7a3a");
  px(g,10+A.hx,5+hb,12,3,gold); px(g,10+A.hx,5+hb,12,1,goldL);
  px(g,15+A.hx,5+hb,2,3,"#7a1a1a"); px(g,15+A.hx,5+hb,1,1,"#ff8a8a");
};

const prev = window.Sprites.actor;
const cache = new Map();
try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(()=>cache.clear()); } catch(e){}
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if (D[kind]){
    gen = (gen==="male"||gen==="female")?gen:"";
    let P=null, bk="";
    try { if (window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph);} else P=window.Anim.normP(null); } } catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck="PB|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
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
