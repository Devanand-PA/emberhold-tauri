/* src/sprites/sprite_boss_realism.js — BOSS REALISM PASS (goddess/peter bar).
   Outermost Sprites.actor wrapper. Loaded AFTER main_story.js so goddess/peter pass through.
   15 bosses rebuilt to ~100-130 rects each: aura+shadow+sparks, layered garb with
   trim/shading/highlights, jeweled regalia, signature weapons, animated limbs.
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
  g.fillStyle=c1; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
  g.fillStyle=c2; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
}
function P_of(ph){ try{ return window.Anim.normP(ph); }catch(e){ return {f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; } }
function A_of(P){ try{ return window.Anim.limb(P); }catch(e){ return {lx:0,rx:0,ld:0,rd:0,lax:0,rax:0,la:0,ra:0,hx:0}; } }
function Hb_of(P){ try{ return window.Anim.hbob(P); }catch(e){ return 0; } }
function Sg(P,i,a){ try{ return window.Anim.seg(P,i,a||1); }catch(e){ return 0; } }

/* ============ 1. GOBLIN KING — crowned war-monarch ============ */
D.goblin_king = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#55a04a", dk="#2c5a26", deep="#1a3a18", lite="#7ccc6a", pale="#a8e898";
  const gold="#d9a91e", goldL="#ffe37a", goldD="#8a6410";
  const mantle="#4a2060", mantleL="#7a3aaa";
  aura(g,hb,"rgba(110,200,90,0.20)","rgba(255,217,61,0.10)");
  px(g,3,26,1,1,goldL); px(g,28,18,1,1,"#fff"); px(g,26,33,1,1,goldL); px(g,4,32,1,1,"#fff");
  // legs: bowed green + sandals + gold anklets
  px(g,10+A.lx,29+A.ld,4,6,skin); px(g,18+A.rx,29+A.rd,4,6,skin);
  px(g,10+A.lx,29+A.ld,1,6,lite); px(g,21+A.rx,29+A.rd,1,6,dk);
  px(g,10+A.lx,33+A.ld,4,2,dk); px(g,18+A.rx,33+A.rd,4,2,dk);
  px(g,9+A.lx,35+A.ld,6,2,"#3a2a1a"); px(g,17+A.rx,35+A.rd,6,2,"#3a2a1a");
  px(g,9+A.lx,35+A.ld,6,1,"#8a5a33"); px(g,10+A.lx,35+A.ld,1,1,goldL);
  // royal mantle: purple shoulders, gold hem, embroidery
  px(g,5,14,4,16,mantle); px(g,23,14,4,16,mantle);
  px(g,5,14,4,2,mantleL); px(g,23,14,4,2,mantleL);
  px(g,5,14,1,16,"#7a3aaa"); px(g,26,14,1,16,"#2e1440");
  px(g,6,28,2,2,gold); px(g,24,28,2,2,gold);
  for(let y=17;y<27;y+=3){ px(g,6,y,2,1,mantleL); px(g,24,y,2,1,"#3a1a52"); }
  // war-belly torso: bare green chest + hide vest + gold skull belt
  px(g,8,17,16,13,skin);
  px(g,8,17,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,dk); px(g,22,17,2,13,dk);
  px(g,10,19,12,8,"#5a3a22"); px(g,10,19,12,2,"#8a5a33"); px(g,10,25,12,2,"#3a2412");
  px(g,12,21,8,4,"#7a4a2a"); px(g,13,22,2,2,gold); px(g,17,22,2,2,gold);
  px(g,11,20,2,6,"#8a5a33"); px(g,19,20,2,6,"#8a5a33");
  px(g,9,27,14,3,gold); px(g,9,27,14,1,goldL); px(g,9,29,14,1,goldD);
  px(g,14,27,4,3,"#e8e0d0"); px(g,15,28,2,1,"#111"); px(g,14,29,1,1,"#111"); px(g,17,29,1,1,"#111");
  px(g,15,27,1,1,"#fff");
  // LEFT arm + orb of command
  px(g,3+A.lax,19+A.la,4,7,skin); px(g,3+A.lax,19+A.la,1,7,lite);
  px(g,3+A.lax,25+A.la,4,3,dk);
  px(g,2+A.lax,26+A.la,5,5,"#8a1a2a"); px(g,3+A.lax,27+A.la,3,3,"#c02040");
  px(g,3+A.lax,27+A.la,1,1,"#ff8fa0"); px(g,2+A.lax,26+A.la,5,1,goldL);
  // RIGHT arm + bone sceptre (raises on atk)
  const sw=P.atk?-5:0;
  px(g,25+A.rax,19+A.ra+sw,4,7,skin); px(g,25+A.rax,19+A.ra+sw,1,7,lite);
  px(g,25+A.rax,25+A.ra+sw,4,2,dk);
  px(g,26+A.rax,12+A.ra+sw,2,14,"#e8e0d0"); px(g,26+A.rax,12+A.ra+sw,1,14,"#fff");
  for(let y=14+A.ra+sw;y<24+A.ra+sw;y+=3) px(g,26+A.rax,y,2,1,"#c9c4b8");
  px(g,24+A.rax,8+A.ra+sw,6,5,"#fff"); px(g,24+A.rax,8+A.ra+sw,6,1,"#fff");
  px(g,25+A.rax,9+A.ra+sw,1,2,"#111"); px(g,27+A.rax,9+A.ra+sw,1,2,"#111");
  px(g,24+A.rax,11+A.ra+sw,6,1,gold); px(g,25+A.rax,8+A.ra+sw,2,1,goldL);
  // bat ears + rings
  g.fillStyle=skin; g.beginPath(); g.moveTo(9+A.hx,12+hb); g.lineTo(1+A.hx,7+hb); g.lineTo(4+A.hx,16+hb); g.fill();
  g.beginPath(); g.moveTo(23+A.hx,12+hb); g.lineTo(31+A.hx,7+hb); g.lineTo(28+A.hx,16+hb); g.fill();
  px(g,2+A.hx,8+hb,3,3,gold); px(g,27+A.hx,8+hb,3,3,gold);
  px(g,3+A.hx,12+hb,4,3,skin); px(g,25+A.hx,12+hb,4,3,skin);
  px(g,4+A.hx,13+hb,2,1,"#c02040"); px(g,26+A.hx,13+hb,2,1,goldL);
  // head: heavy brow, warts, fanged grin
  px(g,9+A.hx,7+hb,14,11,skin);
  px(g,9+A.hx,7+hb,14,3,deep); px(g,10+A.hx,8+hb,12,1,lite);
  px(g,9+A.hx,7+hb,2,11,dk); px(g,21+A.hx,7+hb,2,11,dk);
  px(g,9+A.hx,16+hb,14,2,dk);
  px(g,11+A.hx,11+hb,4,3,"#ffe95e"); px(g,17+A.hx,11+hb,4,3,"#ffe95e");
  px(g,12+A.hx,12+hb,2,2,"#111"); px(g,18+A.hx,12+hb,2,2,"#111");
  px(g,11+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,10+A.hx,9+hb,5,1,deep); px(g,17+A.hx,9+hb,5,1,deep);
  px(g,14+A.hx,14+hb,4,2,dk);
  px(g,11+A.hx,16+hb,10,2,"#5a1a1a"); px(g,12+A.hx,16+hb,2,2,"#fff"); px(g,18+A.hx,16+hb,2,2,"#fff");
  px(g,15+A.hx,14+hb,2,1,"#fff");
  px(g,14+A.hx,10+hb,1,1,dk); px(g,19+A.hx,15+hb,1,1,dk);
  // CROWN: gold band + 3 sword-shard spikes + blood gem
  px(g,9+A.hx,3+hb,14,4,gold); px(g,9+A.hx,3+hb,14,1,goldL); px(g,9+A.hx,6+hb,14,1,goldD);
  px(g,10+A.hx,0+hb,3,4,"#c9ccd4"); px(g,10+A.hx,0+hb,1,4,"#fff"); px(g,15+A.hx,0+hb,2,4,"#eef2f6"); px(g,15+A.hx,0+hb,1,1,"#fff"); px(g,19+A.hx,0+hb,3,4,"#9aa0a8");
  px(g,14+A.hx,3+hb,4,3,"#c02040"); px(g,15+A.hx,3+hb,1,1,"#ff8fa0"); px(g,14+A.hx,3+hb,4,1,"#ff6a7a");
};

/* ============ 2. HIEROPHANT OF THE PIT ============ */
D.cultist_hierophant = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe="#3d1a5e", dk="#150820", lite="#7a3aaa", gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const voidc="#0c0a12", eyec="#c77dff";
  aura(g,hb,"rgba(140,60,220,0.22)","rgba(199,125,255,0.12)");
  px(g,3,20,1,1,eyec); px(g,28,26,1,1,"#fff"); px(g,25,33,1,1,eyec);
  const wr=Sg(P,0,1), wr2=Sg(P,2,1);
  // legs hidden under robe: hem + feet
  px(g,11+A.lx,32+A.ld,4,4,dk); px(g,17+A.rx,32+A.rd,4,4,dk);
  px(g,10+A.lx,35+A.ld,6,2,"#0c0a12"); px(g,16+A.rx,35+A.rd,6,2,"#0c0a12");
  // robe: layered panels, gold hem runes, side shading
  px(g,8,18,16,16,robe);
  px(g,8,18,16,2,lite); px(g,8,32,16,2,dk);
  px(g,8,18,2,16,"#8a4ad0"); px(g,22,18,2,16,"#241040");
  px(g,11,20,10,12,"#4a226e"); px(g,12,21,8,10,"#5a2a8a");
  px(g,14,20,4,12,"#2e1450"); px(g,15,22,2,8,goldD);
  px(g,9,30,5,3,gold); px(g,18,30,5,3,gold);
  px(g,10,30,2,1,goldL); px(g,19,30,2,1,goldL);
  px(g,15,18,2,3,eyec); px(g,15,18,1,1,"#fff");
  // chest amulet: gold sun drowned in violet
  px(g,13,19,6,6,gold); px(g,14,20,4,4,voidc);
  px(g,15,21,2,2,eyec); px(g,15,21,1,1,"#fff");
  px(g,13,19,6,1,goldL);
  // tentacles writhe from sleeves/hem
  px(g,6+A.lax,20+A.la+wr,3,8,"#8a4a6a"); px(g,7+A.lax,20+A.la+wr,1,8,"#c98aaa");
  px(g,6+A.lax,26+A.la+wr,3,2,"#5a2a4a");
  px(g,23+A.rax,20+A.ra+wr2,3,8,"#8a4a6a"); px(g,25+A.rax,20+A.ra+wr2,1,8,"#c98aaa");
  px(g,11,30+wr,2,5,"#8a4a6a"); px(g,14,30-wr,2,5,"#8a4a6a"); px(g,17,30+wr2,2,5,"#8a4a6a"); px(g,20,30-wr2,2,5,"#8a4a6a");
  px(g,11,33+wr,2,1,"#c98aaa"); px(g,17,33+wr2,2,1,"#c98aaa");
  // brazier arm rises on cast
  const cs=P.atk?-4:0;
  px(g,25+A.rax,14+A.ra+cs,3,12,"#5a3a22"); px(g,25+A.rax,14+A.ra+cs,1,12,"#a97648");
  px(g,22+A.rax,8+A.ra+cs,9,7,voidc); px(g,22+A.rax,8+A.ra+cs,9,1,gold);
  px(g,23+A.rax,10+A.ra+cs,7,5,"#ff6b2e"); px(g,24+A.rax,11+A.ra+cs,5,3,"#ffd93d");
  px(g,25+A.rax,12+A.ra+cs,3,2,"#fff"); px(g,26+A.rax,9+A.ra+cs,1,2,"#fff");
  g.fillStyle="rgba(255,107,46,0.25)"; g.beginPath(); g.arc(26+A.rax,12+A.ra+cs,5,0,7); g.fill();
  // LEFT arm: bell sleeve + claw
  px(g,4+A.lax,18+A.la,4,10,robe); px(g,4+A.lax,18+A.la,1,10,lite);
  px(g,4+A.lax,26+A.la,4,3,dk); px(g,4+A.lax,29+A.la,4,2,"#d9c9b0");
  // head: void face + blazing eyes
  px(g,11+A.hx,10+hb,10,9,voidc);
  px(g,11+A.hx,10+hb,1,9,lite); px(g,20+A.hx,10+hb,1,9,"#000");
  px(g,11+A.hx,10+hb,10,2,"#1a0a28");
  px(g,12+A.hx,12+hb,3,3,eyec); px(g,17+A.hx,12+hb,3,3,eyec);
  g.fillStyle="#ff9d2e"; g.fillRect(13+A.hx,13+hb,1,2); g.fillRect(18+A.hx,13+hb,1,2);
  if(P.atk){ px(g,13+A.hx,13+hb,1,1,"#fff"); px(g,18+A.hx,13+hb,1,1,"#fff"); }
  px(g,13+A.hx,17+hb,6,1,"#3a1a52");
  // TOWER MITRE: tall violet, gold bands, void eyes, skull pin
  px(g,10+A.hx,0+hb,12,7,robe); px(g,10+A.hx,0+hb,12,1,lite); px(g,10+A.hx,6+hb,12,1,gold);
  px(g,12+A.hx,0+hb,8,2,gold); px(g,12+A.hx,0+hb,8,1,goldL);
  px(g,11+A.hx,3+hb,4,3,eyec); px(g,17+A.hx,3+hb,4,3,eyec);
  px(g,12+A.hx,4+hb,1,1,"#fff"); px(g,18+A.hx,4+hb,1,1,"#fff");
  px(g,14+A.hx,7+hb,4,3,gold); px(g,15+A.hx,8+hb,2,1,"#111");
  px(g,9+A.hx,6+hb,2,4,gold); px(g,21+A.hx,6+hb,2,4,gold);
};

/* ============ 3. HARPY MATRIARCH (WITH WINGS) ============ */
D.harpy_matriarch = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const feather="#9a6ac9", dk="#4a2a6a", lite="#c9a7ff", skin="#f2c9a0", skinD="#c98a5a";
  const gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(170,120,230,0.22)","rgba(201,167,255,0.12)");
  px(g,3,18,1,1,lite); px(g,28,14,1,1,"#fff"); px(g,25,33,1,1,lite);
  // GREAT WINGS: broad feathered sails, pale rims (Peter-style rim light)
  const W=P.atk?-4:(P.moving?[0,-3,0,2][P.f&3]:0);
  g.fillStyle="#7a3aaa";
  g.beginPath(); g.moveTo(12,23+W); g.lineTo(0,3+W); g.lineTo(2,13+W); g.lineTo(5,10+W); g.lineTo(9,20+W); g.fill();
  g.beginPath(); g.moveTo(20,23+W); g.lineTo(32,3+W); g.lineTo(30,13+W); g.lineTo(27,10+W); g.lineTo(23,20+W); g.fill();
  g.fillStyle="#b48ae0";
  g.beginPath(); g.moveTo(11,22+W); g.lineTo(2,6+W); g.lineTo(4,13+W); g.lineTo(7,12+W); g.lineTo(9,20+W); g.fill();
  g.beginPath(); g.moveTo(21,22+W); g.lineTo(30,6+W); g.lineTo(28,13+W); g.lineTo(25,12+W); g.lineTo(23,20+W); g.fill();
  px(g,0,3+W,3,10,"#e0ccff"); px(g,29,3+W,3,10,"#e0ccff");
  px(g,1,5+W,2,7,"#fff"); px(g,29,5+W,2,7,"#fff");
  px(g,2,11+W,3,6,"#c9a7ff"); px(g,27,11+W,3,6,"#c9a7ff");
  px(g,3,16+W,3,4,lite); px(g,26,16+W,3,4,lite);
  px(g,0,7+W,2,4,"#fff"); px(g,30,7+W,2,4,"#fff");
  px(g,4,11+W,1,8,dk); px(g,27,11+W,1,8,dk);
  px(g,1,4+W,3,2,"#fff"); px(g,28,4+W,3,2,"#fff");
  // talon legs: scaled + black talons
  px(g,11+A.lx,28+A.ld,3,6,skin); px(g,18+A.rx,28+A.rd,3,6,skin);
  px(g,11+A.lx,30+A.ld,1,4,skinD); px(g,20+A.rx,30+A.rd,1,4,skinD);
  px(g,10+A.lx,34+A.ld,5,2,"#3a2a1a"); px(g,17+A.rx,34+A.rd,5,2,"#3a2a1a");
  px(g,9+A.lx,34+A.ld,2,2,"#1a1410"); px(g,13+A.lx,34+A.ld,2,2,"#1a1410"); px(g,18+A.rx,34+A.rd,2,2,"#1a1410"); px(g,21+A.rx,34+A.rd,2,2,"#1a1410");
  // feather skirt + sash
  px(g,10,23,12,6,feather); px(g,10,23,12,1,lite); px(g,10,27,12,2,dk);
  for(let i=0;i<4;i++){ px(g,10+i*3,26,2,3,dk); px(g,10+i*3,26,1,1,lite); }
  px(g,12,25,8,2,gold); px(g,15,25,2,2,"#c93b3b"); px(g,16,25,1,1,"#fff");
  // woman torso + feather bodice
  px(g,11,15,10,9,skin); px(g,11,15,1,9,skinD); px(g,20,15,1,9,skinD);
  px(g,11,18,10,4,feather); px(g,11,18,10,1,lite); px(g,12,19,8,2,"#b48ae0");
  px(g,13,16,2,2,skinD); px(g,17,16,2,2,skinD);
  // feathered arms + talon hands
  px(g,6+A.lax,17+A.la,4,8,feather); px(g,6+A.lax,17+A.la,1,8,lite);
  px(g,6+A.lax,24+A.la,4,2,skin); px(g,7+A.lax,26+A.la,2,2,"#e8e0d0");
  px(g,22+A.rax,17+A.ra,4,8,feather); px(g,24+A.rax,17+A.ra,1,8,lite);
  px(g,22+A.rax,24+A.ra,4,2,skin);
  // birdcage staff (rises on atk)
  const st=P.atk?-4:0;
  px(g,25+A.rax,12+A.ra+st,2,14,"#5a3a22"); px(g,25+A.rax,12+A.ra+st,1,14,"#a97648");
  px(g,23+A.rax,8+A.ra+st,6,7,"#8a5a33"); px(g,24+A.rax,9+A.ra+st,4,5,gold);
  px(g,25+A.rax,10+A.ra+st,2,3,"#fff2b0"); px(g,25+A.rax,10+A.ra+st,1,1,"#fff");
  // head: fierce beauty, gold eyes, beak-nose, song mouth
  px(g,11+A.hx,7+hb,10,9,skin);
  px(g,11+A.hx,7+hb,1,9,skinD); px(g,20+A.hx,7+hb,1,9,skinD);
  px(g,12+A.hx,10+hb,3,3,"#fff"); px(g,17+A.hx,10+hb,3,3,"#fff");
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,18+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,11+A.hx,9+hb,1,3,"#111"); px(g,20+A.hx,9+hb,1,3,"#111");
  px(g,14+A.hx,13+hb,3,2,"#d9a06b"); px(g,15+A.hx,14+hb,1,1,"#8a5a33");
  px(g,14+A.hx,15+hb+(P.atk?1:0),4,2,"#8a1a2a");
  px(g,8+A.hx,5+hb,3,12,"#3a2a1a"); px(g,21+A.hx,5+hb,3,12,"#3a2a1a");
  px(g,9+A.hx,4+hb,14,4,"#3a2a1a"); px(g,10+A.hx,4+hb,12,1,"#5a3a22");
  // NEST CROWN: twigs + 3 eggs + feather
  px(g,9+A.hx,1+hb,14,4,"#5a3a22"); px(g,9+A.hx,1+hb,14,1,"#8a5a33");
  px(g,10+A.hx,0+hb,3,3,"#e8e0d0"); px(g,14+A.hx,0+hb,3,3,"#7fd4ff"); px(g,18+A.hx,0+hb,3,3,"#e8c9a0");
  px(g,11+A.hx,0+hb,1,1,"#fff"); px(g,15+A.hx,0+hb,1,1,"#fff");
  px(g,22+A.hx,2+hb,3,3,lite);
};

/* ============ 4. KAPPA KING ============ */
D.kappa_king = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#3a9a5a", dk="#1e5a2e", lite="#6ad88a", gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(60,180,110,0.20)","rgba(127,212,255,0.10)");
  px(g,3,22,1,1,"#7fd4ff"); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,"#7fd4ff");
  // sashimono war-flag
  const sw=P.moving?((P.f&1)?1:-1):0;
  px(g,24,0,2,18,"#3a2a1a"); px(g,24,0,2,2,gold);
  px(g,22,1,10,8,"#1a5a6a"); px(g,22,1,10,1,"#fff"); px(g,22,8,10,1,gold);
  px(g,23,3,8,4,"#7fd4ff"); px(g,24,4,6,2,"#fff");
  px(g,22,1,2,8,gold); px(g,30,1,2,8,gold);
  px(g,25+sw,3,3,3,"#c93b3b"); px(g,26+sw,4,1,1,"#fff");
  // webbed feet
  px(g,9+A.lx,31+A.ld,5,4,dk); px(g,18+A.rx,31+A.rd,5,4,dk);
  px(g,8+A.lx,34+A.ld,6,2,"#2a4a3a"); px(g,18+A.rx,34+A.rd,6,2,"#2a4a3a");
  px(g,8+A.lx,34+A.ld,2,2,"#9adcff"); px(g,18+A.rx,34+A.rd,2,2,"#9adcff");
  // sumo bulk + mawashi + kelp sash
  px(g,5,19,22,13,skin);
  px(g,5,19,22,2,lite); px(g,5,30,22,2,dk);
  px(g,5,19,2,13,dk); px(g,25,19,2,13,dk);
  px(g,7,24,18,4,"#1a1a24"); px(g,13,24,6,4,gold); px(g,13,24,6,1,goldL); px(g,14,25,4,2,"#c93b3b"); px(g,15,26,1,1,"#fff");
  px(g,6,20,4,3,"#2a5a3a"); px(g,10,22,4,2,"#4a8a4a"); px(g,15,23,4,2,"#2a5a3a"); px(g,20,22,3,2,"#4a8a4a");
  px(g,8,21,3,5,"#2a7a3a"); px(g,21,21,3,5,"#2a7a3a");
  // shell back + ridge plates
  px(g,2,17,4,11,"#5a3a22"); px(g,2,17,4,1,"#8a5a33"); px(g,2,20,4,2,gold);
  px(g,26,17,4,11,"#5a3a22"); px(g,26,17,4,1,"#8a5a33");
  px(g,6,18,2,7,"#5a3a22"); px(g,6,20,2,2,gold);
  // webbed arms + claws
  px(g,3+A.lax,19+A.la,3,8,skin); px(g,3+A.lax,19+A.la,1,8,lite);
  px(g,2+A.lax,26+A.la,4,3,"#9adcff"); px(g,2+A.lax,26+A.la,4,1,"#fff");
  const tw=P.atk?-5:0;
  px(g,26+A.rax,19+A.ra+tw,3,8,skin); px(g,26+A.rax,19+A.ra+tw,1,8,lite);
  px(g,26+A.rax,26+A.ra+tw,4,3,"#9adcff");
  // tide trident (stabs on atk)
  px(g,27+A.rax,6+A.ra+tw,2,20,"#8a5a33"); px(g,27+A.rax,6+A.ra+tw,1,20,"#c9a06a");
  px(g,25+A.rax,2+A.ra+tw,6,4,"#7fd4ff"); px(g,25+A.rax,2+A.ra+tw,6,1,"#fff");
  px(g,25+A.rax,2+A.ra+tw,1,4,"#7fd4ff"); px(g,27+A.rax,1+A.ra+tw,2,5,"#7fd4ff"); px(g,29+A.rax,2+A.ra+tw,1,4,"#7fd4ff");
  px(g,26+A.rax,14+A.ra+tw,2,3,"#2a5a3a"); px(g,26+A.rax,15+A.ra+tw,2,1,"#4a8a4a");
  // head: beak, gold eyes, earring
  px(g,10+A.hx,9+hb,12,10,skin);
  px(g,10+A.hx,9+hb,12,2,lite); px(g,10+A.hx,17+hb,12,2,dk);
  px(g,13+A.hx,14+hb+(P.atk?1:0),6,4,"#e8d9a0"); px(g,14+A.hx,15+hb+(P.atk?1:0),2,2,"#fff"); px(g,16+A.hx,15+hb+(P.atk?1:0),2,2,gold);
  px(g,12+A.hx,11+hb,3,3,"#ffe14d"); px(g,18+A.hx,11+hb,3,3,"#ffe14d");
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,19+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,9+A.hx,12+hb,2,2,gold);
  // golden dish + water shimmer
  px(g,9+A.hx,3+hb,14,4,gold); px(g,9+A.hx,3+hb,14,1,goldL); px(g,9+A.hx,6+hb,14,1,"#8a6a1a");
  px(g,10+A.hx,4+hb,12,2,"#7fd4ff"); px(g,11+A.hx,4+hb,3,1,"#fff"); px(g,17+A.hx,4+hb,4,1,"#2a9ac9");
  px(g,12+A.hx,1+hb,8,2,gold); px(g,12+A.hx,1+hb,8,1,goldL);
  px(g,3+A.hx,13+hb,6,5,"#5a3a22"); px(g,4+A.hx,14+hb,4,3,"#8a5a33");
  px(g,23+A.hx,13+hb,6,5,"#5a3a22"); px(g,24+A.hx,14+hb,4,3,"#8a5a33");
};

/* ============ 5. GNOLL ALPHA ============ */
D.gnoll_alpha = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur="#b08a4a", dk="#6a4a22", deep="#3a2a12", lite="#d9b96a", cream="#f2e0b0";
  const bone="#e8e0d0", blood="#c93b3b", gold="#ffd93d";
  aura(g,hb,"rgba(200,150,70,0.20)","rgba(255,217,61,0.10)");
  px(g,3,20,1,1,gold); px(g,28,26,1,1,"#fff"); px(g,26,33,1,1,gold);
  // digitigrade legs + clawed feet
  px(g,10+A.lx,28+A.ld,4,6,fur); px(g,18+A.rx,28+A.rd,4,6,fur);
  px(g,10+A.lx,30+A.ld,4,2,dk); px(g,18+A.rx,30+A.rd,4,2,dk);
  px(g,9+A.lx,33+A.ld,6,3,"#2a1a10"); px(g,17+A.rx,33+A.rd,6,3,"#2a1a10");
  px(g,9+A.lx,33+A.ld,2,1,"#e8e0d0"); px(g,17+A.rx,33+A.rd,2,1,"#e8e0d0");
  // spotted torso: hide vest, war paint, belt trophies
  px(g,8,17,16,13,fur);
  px(g,8,17,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,dk); px(g,22,17,2,13,dk);
  px(g,10,19,12,8,"#5a3a22"); px(g,10,19,12,2,"#8a5a33");
  px(g,12,21,3,5,blood); px(g,17,21,3,5,"#2a4a9a");
  px(g,11,20,2,2,deep); px(g,15,22,2,2,deep); px(g,19,20,2,2,deep); px(g,13,25,2,2,deep);
  px(g,9,27,14,3,"#3a2a1a"); px(g,9,27,14,1,"#8a5a33");
  px(g,10,28,3,2,bone); px(g,14,28,3,2,"#c9b98a"); px(g,18,28,3,2,bone);
  // spotted shoulders
  px(g,5,15,6,5,fur); px(g,5,15,6,1,lite); px(g,6,16,2,2,deep);
  px(g,21,15,6,5,fur); px(g,21,15,6,1,lite); px(g,24,16,2,2,deep);
  // LEFT arm + notched cleaver
  px(g,4+A.lax,18+A.la,4,8,fur); px(g,4+A.lax,18+A.la,1,8,lite);
  px(g,4+A.lax,25+A.la,4,3,dk); px(g,4+A.lax,28+A.la,4,2,cream);
  px(g,2+A.lax,14+A.la,2,12,"#8a5a33"); px(g,2+A.lax,14+A.la,1,12,"#c9a06a");
  px(g,0+A.lax,10+A.la,6,5,"#c9ccd4"); px(g,0+A.lax,10+A.la,6,1,"#fff"); px(g,0+A.lax,14+A.la,6,1,"#5a5a66");
  px(g,0+A.lax,12+A.la,2,2,"#7a1f1f");
  // RIGHT arm + tail-club (hefts on atk)
  const sw=P.atk?-5:0;
  px(g,24+A.rax,18+A.ra+sw,4,8,fur); px(g,24+A.rax,18+A.ra+sw,1,8,lite);
  px(g,24+A.rax,25+A.ra+sw,4,2,dk);
  px(g,25+A.rax,10+A.ra+sw,2,16,"#6a3a1a"); px(g,25+A.rax,10+A.ra+sw,1,16,"#a97648");
  px(g,23+A.rax,6+A.ra+sw,6,5,bone); px(g,23+A.rax,6+A.ra+sw,6,1,"#fff");
  px(g,24+A.rax,7+A.ra+sw,1,3,dk); px(g,26+A.rax,7+A.ra+sw,1,3,dk);
  // tail lash
  const tw=Sg(P,0,1);
  px(g,1+tw,22,4,5,dk); px(g,0+tw,26,5,3,fur); px(g,0+tw,26,2,1,lite);
  // hyena head: laughing jaw, scar, amber eyes
  px(g,9+A.hx,7+hb,14,12,fur);
  px(g,9+A.hx,7+hb,14,2,lite); px(g,9+A.hx,17+hb,14,2,dk);
  px(g,9+A.hx,7+hb,2,12,dk); px(g,21+A.hx,7+hb,2,12,dk);
  px(g,6+A.hx,4+hb,5,7,fur); px(g,6+A.hx,4+hb,5,1,lite);
  px(g,21+A.hx,4+hb,5,7,fur); px(g,21+A.hx,4+hb,5,1,lite);
  px(g,7+A.hx,5+hb,3,4,cream); px(g,22+A.hx,5+hb,3,4,cream);
  px(g,11+A.hx,10+hb,4,3,"#ffe14d"); px(g,17+A.hx,10+hb,4,3,"#ffe14d");
  px(g,12+A.hx,11+hb,2,2,"#111"); px(g,18+A.hx,11+hb,2,2,"#111");
  px(g,11+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,10+A.hx,9+hb,5,1,deep); px(g,17+A.hx,9+hb,5,1,deep);
  px(g,12+A.hx,14+hb,8,4,cream); px(g,13+A.hx,15+hb,6,2,"#7a1f1f");
  px(g,13+A.hx,15+hb,1,2,"#fff"); px(g,18+A.hx,15+hb,1,2,"#fff");
  px(g,13+A.hx,17+hb,6,1,"#7a1f1f");
  px(g,14+A.hx,13+hb,4,1,"#111");
  px(g,19+A.hx,12+hb,1,4,blood);
  // BONE MOHAWK + gold war-ring
  px(g,14+A.hx,1+hb,4,7,bone); px(g,14+A.hx,1+hb,1,7,"#fff");
  px(g,11+A.hx,3+hb,3,5,bone); px(g,18+A.hx,3+hb,3,5,bone);
  px(g,15+A.hx,2+hb,2,2,blood); px(g,15+A.hx,2+hb,1,1,"#ff8a8a");
  px(g,10+A.hx,6+hb,12,2,"#3a2a1a");
};

/* ============ 6. ORC WARCHIEF ============ */
D.orc_warchief = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#4a7a2a", dk="#2a4a14", deep="#1a2e0c", lite="#6a9a3a", gold="#c9a227", goldL="#ffe37a";
  aura(g,hb,"rgba(120,200,80,0.20)","rgba(255,120,60,0.10)");
  px(g,3,24,1,1,"#ff8a6a"); px(g,28,18,1,1,"#fff"); px(g,26,33,1,1,"#ff8a6a");
  // legs: heavy + war boots
  px(g,9+A.lx,28+A.ld,5,7,dk); px(g,18+A.rx,28+A.rd,5,7,dk);
  px(g,9+A.lx,28+A.ld,1,7,lite);
  px(g,8+A.lx,34+A.ld,7,3,"#2a1a10"); px(g,17+A.rx,34+A.rd,7,3,"#2a1a10");
  px(g,8+A.lx,34+A.ld,7,1,"#8a5a33");
  // torso: scarred green + iron plate + blood war-paint + gold belt
  px(g,8,16,16,14,skin);
  px(g,8,16,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,16,2,14,dk); px(g,22,16,2,14,dk);
  px(g,10,18,12,9,"#3a3a42"); px(g,10,18,12,2,"#9aa0a8"); px(g,10,25,12,2,"#23232c");
  px(g,12,20,8,5,"#7a1f1f"); px(g,13,21,6,3,"#a02040"); px(g,13,21,1,1,"#ff8a8a");
  px(g,15,18,2,9,gold); px(g,15,18,2,1,goldL);
  px(g,9,27,14,3,gold); px(g,9,27,14,1,goldL); px(g,9,29,14,1,"#8a6a1a");
  px(g,14,27,4,3,"#e8e0d0"); px(g,15,28,2,1,"#111");
  // JAW PAULDRONS: bone jaws with teeth
  px(g,1+A.lax,12+A.la,9,6,"#e8e4d8"); px(g,1+A.lax,12+A.la,9,1,"#fff");
  px(g,2+A.lax,15+A.la,7,1,"#111");
  for(let i=0;i<3;i++){ px(g,3+i*2+A.lax,16+A.la,1,2,"#fff"); }
  px(g,22+A.rax,12+A.ra,9,6,"#e8e4d8"); px(g,22+A.rax,12+A.ra,9,1,"#fff");
  px(g,23+A.rax,15+A.ra,7,1,"#111");
  for(let i=0;i<3;i++){ px(g,24+i*2+A.rax,16+A.ra,1,2,"#fff"); }
  px(g,2+A.lax,13+A.la,3,2,"#c93b3b"); px(g,26+A.rax,13+A.ra,3,2,"#c93b3b");
  // LEFT arm + blood banner pole
  px(g,2+A.lax,18+A.la,3,10,skin);
  px(g,1+A.lax,4,3,22,"#3a2a1a"); px(g,1+A.lax,4,3,8,"#7a1f1f"); px(g,1+A.lax,12,3,2,"#e8e0d0");
  // RIGHT arm + executioner axe (hefts on atk)
  const ax=P.atk?-5:0;
  px(g,27+A.rax,18+A.ra+ax,3,9,skin); px(g,27+A.rax,18+A.ra+ax,1,9,lite);
  px(g,26+A.rax,14+A.ra+ax,2,12,"#5a3a22"); px(g,26+A.rax,14+A.ra+ax,1,12,"#a97648");
  px(g,22+A.rax,8+A.ra+ax,10,6,"#c9ccd4"); px(g,22+A.rax,8+A.ra+ax,10,1,"#fff"); px(g,22+A.rax,13+A.ra+ax,10,1,"#5a5a66");
  px(g,22+A.rax,8+A.ra+ax,2,6,"#eef2f6"); px(g,30+A.rax,8+A.ra+ax,2,6,"#7a7a88");
  // head: boar face, tusks, red eyes, topknot
  px(g,10+A.hx,6+hb,12,12,skin);
  px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,10+A.hx,6+hb,2,12,dk); px(g,20+A.hx,6+hb,2,12,deep);
  px(g,12+A.hx,10+hb,3,3,"#ff3b3b"); px(g,18+A.hx,10+hb,3,3,"#ff3b3b");
  px(g,13+A.hx,11+hb,1,2,"#111"); px(g,19+A.hx,11+hb,1,2,"#111");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,18+A.hx,10+hb,1,1,"#fff");
  px(g,13+A.hx,13+hb,6,4,"#6a8a2a"); px(g,14+A.hx,14+hb,1,2,"#111"); px(g,17+A.hx,14+hb,1,2,"#111");
  px(g,10+A.hx,15+hb,3,7,"#e8e0d0"); px(g,19+A.hx,15+hb,3,7,"#e8e0d0");
  px(g,10+A.hx,15+hb,3,2,"#c9b98a");
  px(g,12+A.hx,1+hb,8,6,"#1a1a1a"); px(g,11+A.hx,0+hb,2,6,bone); px(g,19+A.hx,0+hb,2,6,bone);
};

/* ============ 7. CURSED PHARAOH ============ */
D.cursed_pharaoh = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const gold="#d9a91e", goldL="#ffe37a", goldD="#8a6410", lapis="#2a6a9a", linen="#e8dfc8", linenD="#c9b98a";
  aura(g,hb,"rgba(220,180,80,0.22)","rgba(42,106,154,0.14)");
  px(g,3,20,1,1,goldL); px(g,28,26,1,1,"#7fd4ff"); px(g,26,33,1,1,goldL);
  // sandstone base + feet
  px(g,11+A.lx,31+A.ld,4,4,linenD); px(g,17+A.rx,31+A.rd,4,4,linenD);
  px(g,10+A.lx,34+A.ld,6,2,"#8a6a3a"); px(g,16+A.rx,34+A.rd,6,2,"#8a6a3a");
  // linen robe + gold collar + scarab jewel
  px(g,8,18,16,15,linen);
  px(g,8,18,16,2,"#fff"); px(g,8,31,16,2,linenD);
  px(g,8,18,2,15,gold); px(g,22,18,2,15,gold);
  px(g,10,18,12,5,gold); px(g,10,18,12,1,goldL); px(g,10,22,12,1,goldD);
  px(g,13,20,6,3,lapis); px(g,14,20,4,2,"#7fb0ff"); px(g,15,21,1,1,"#fff");
  px(g,14,24,4,5,"#1a5a2a"); px(g,15,25,2,3,gold); px(g,15,25,1,1,"#fff");
  px(g,11,27,10,3,lapis); px(g,12,27,8,1,"#7fb0ff");
  for(let i=0;i<4;i++) px(g,10+i*3,30,1,3,goldD);
  // LEFT arm + CROOK
  px(g,4+A.lax,19+A.la,4,8,linen); px(g,4+A.lax,19+A.la,1,8,"#fff");
  px(g,4+A.lax,26+A.la,4,2,linenD);
  px(g,2+A.lax,10+A.la,4,16,gold); px(g,2+A.lax,10+A.la,4,1,goldL);
  px(g,1+A.lax,8+A.la,6,4,gold); px(g,1+A.lax,8+A.la,6,1,goldL);
  // RIGHT arm + FLAIL (rises on atk)
  const fl=P.atk?-5:0;
  px(g,24+A.rax,19+A.ra+fl,4,8,linen); px(g,26+A.rax,19+A.ra+fl,1,8,"#fff");
  px(g,26+A.rax,10+A.ra+fl,2,14,"#5a3a22"); px(g,26+A.rax,10+A.ra+fl,1,14,"#a97648");
  px(g,24+A.rax,6+A.ra+fl,6,4,gold);
  for(let i=0;i<3;i++) px(g,24+i*2+A.rax,10+A.ra+fl,1,3,gold);
  px(g,24+A.rax,12+A.ra+fl,1,1,goldL);
  // jackal-faced death mask: gold + black + glowing eyes
  px(g,11+A.hx,9+hb,10,9,"#d9b96a");
  px(g,11+A.hx,9+hb,10,2,"#f2dc9a"); px(g,11+A.hx,16+hb,10,2,"#8a6a2a");
  px(g,13+A.hx,11+hb,2,3,"#111"); px(g,17+A.hx,11+hb,2,3,"#111");
  px(g,13+A.hx,11+hb,1,1,"#7fd4ff"); px(g,17+A.hx,11+hb,1,1,"#7fd4ff");
  px(g,14+A.hx,14+hb,4,2,"#5a3a1a"); px(g,15+A.hx,14+hb,2,1,"#111");
  // NEMES headdress: gold + lapis stripes + cobra + vulture
  px(g,7+A.hx,4+hb,18,7,lapis);
  px(g,7+A.hx,4+hb,4,12,gold); px(g,21+A.hx,4+hb,4,12,gold);
  px(g,7+A.hx,4+hb,4,1,goldL); px(g,21+A.hx,4+hb,4,1,goldL);
  for(let y=6+hb;y<10+hb;y+=2){ px(g,12+A.hx,y,8,1,gold); }
  px(g,14+A.hx,2+hb,4,4,gold); px(g,15+A.hx,3+hb,2,2,"#c93b3b"); px(g,15+A.hx,3+hb,1,1,"#fff");
  px(g,9+A.hx,0+hb,3,4,gold); px(g,20+A.hx,0+hb,3,4,lapis);
};

/* ============ 8. NAGA RAJA ============ */
D.naga_raja = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const skin="#2a9a5a", dk="#16502e", lite="#5ac87a", pale="#a8e8b0";
  const gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(60,200,120,0.22)","rgba(255,217,61,0.10)");
  px(g,3,22,1,1,"#7dff9b"); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,"#7dff9b");
  const sw=Sg(P,0,1), sw2=Sg(P,2,1);
  // coil mound: stacked emerald coils + gold bands + jewel
  px(g,5,29,22,7,dk); px(g,6,30,20,5,skin); px(g,6,30,20,1,lite);
  px(g,7,32,6,2,gold); px(g,15,33,6,2,"#c93b3b"); px(g,16,33,1,1,"#fff");
  px(g,9,27,14,4,skin); px(g,9,27,14,1,lite); px(g,9,30,14,1,dk);
  px(g,10,28,4,2,gold); px(g,18,28,4,2,gold);
  // 4 ARMS: outer blades + inner jewels; right slashes on atk
  px(g,3,18+sw,4,8,skin); px(g,3,18+sw,1,8,lite); px(g,2,24+sw,5,3,gold);
  px(g,25,18+sw2,4,8,skin); px(g,27,18+sw2,1,8,lite);
  const sl=P.atk?-3:0;
  px(g,25,22+sw2+sl,4,6,"#8a5a33"); px(g,24,20+sw2+sl,6,2,"#d9c27f"); px(g,24,20+sw2+sl,6,1,"#fff");
  px(g,3,24+sw,5,2,"#c9ccd4"); px(g,3,24+sw,5,1,"#fff");
  px(g,6,20+sw2,3,7,skin); px(g,22,20+sw,3,7,skin);
  px(g,6,25+sw2,3,3,gold); px(g,22,25+sw,3,3,"#7fd4ff"); px(g,7,26+sw2,1,1,"#fff");
  // gem cuirass torso
  px(g,10,15,12,13,skin); px(g,10,15,12,2,lite); px(g,10,26,12,2,dk);
  px(g,11,17,10,8,"#d9b96a"); px(g,12,18,8,6,"#8a6a2a");
  px(g,14,19,4,4,"#c93b3b"); px(g,15,20,2,2,"#ff8a8a"); px(g,15,20,1,1,"#fff");
  px(g,12,24,8,1,gold); px(g,12,24,8,2,"#8a6410");
  // FIVE-HEAD HOOD: cobra fan + 5 hooded heads with eyes
  px(g,2,4,28,11,skin); px(g,2,4,28,2,lite); px(g,2,13,28,2,dk);
  px(g,2,4,3,11,dk); px(g,27,4,3,11,dk);
  for(let i=0;i<5;i++){
    const hx=3+i*5, wob=((i&1)?sw:sw2);
    px(g,hx+wob,6,4,7,skin); px(g,hx+wob,6,4,1,lite);
    px(g,hx+wob,7,4,2,pale);
    px(g,hx+1+wob,8,1,2,"#111"); px(g,hx+2+wob,8,1,2,"#111");
    px(g,hx+1+wob,7,1,1,"#fff");
    px(g,hx+wob,12,4,1,gold);
  }
  // central royal face: gold eyes, fangs, crown jewel
  px(g,12,11,8,7,skin); px(g,12,11,8,1,lite);
  px(g,13,13,2,2,"#ffe14d"); px(g,17,13,2,2,"#ffe14d");
  px(g,13,13,1,2,"#111"); px(g,17,13,1,2,"#111");
  px(g,14,16,4,1,"#7a1f1f"); px(g,14,16,1,1,"#fff"); px(g,17,16,1,1,"#fff");
  px(g,14,8,4,3,gold); px(g,15,8,2,2,"#c93b3b"); px(g,15,8,1,1,"#fff");
  // spear + shield emblems at hood edge
  px(g,0,12,2,9,gold); px(g,0,12,2,2,goldL); px(g,30,12,2,9,"#c9ccd4"); px(g,30,12,2,2,"#fff");
};

/* ============ 9. RAKSHASA MAHARAJA ============ */
D.rakshasa_maharaja = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const silk="#c96a1a", dk="#6a3410", lite="#f09a3a", fur="#e08a3a";
  const gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(230,140,40,0.22)","rgba(255,217,61,0.12)");
  px(g,3,22,1,1,goldL); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,goldL);
  // legs: silk dhoti + tiger paws
  px(g,11+A.lx,28+A.ld,4,6,"#8a4a1a"); px(g,17+A.rx,28+A.rd,4,6,"#8a4a1a");
  px(g,10+A.lx,33+A.ld,6,3,fur); px(g,16+A.rx,33+A.rd,6,3,fur);
  px(g,10+A.lx,33+A.ld,2,1,"#111"); px(g,16+A.rx,33+A.rd,2,1,"#111");
  px(g,10+A.lx,35+A.ld,6,1,"#3a2a1a");
  // silk robe: orange + gold brocade + sash
  px(g,8,17,16,13,silk);
  px(g,8,17,16,2,lite); px(g,8,28,16,2,dk);
  px(g,8,17,2,13,dk); px(g,22,17,2,13,dk);
  px(g,10,19,12,8,"#8a2a2a"); px(g,11,20,10,6,"#a03030");
  for(let y=20;y<26;y+=2){ px(g,11,y,10,1,gold); }
  px(g,15,19,2,9,gold); px(g,15,19,2,1,goldL);
  px(g,9,27,14,3,gold); px(g,9,27,14,1,goldL); px(g,9,29,14,1,"#8a6410");
  px(g,14,27,4,3,"#1a5a6a"); px(g,15,28,2,1,"#7fd4ff"); px(g,15,28,1,1,"#fff");
  // tiger-stripe shoulders
  px(g,4,15,6,5,fur); px(g,5,16,4,1,"#111"); px(g,5,18,4,1,"#111");
  px(g,22,15,6,5,fur); px(g,23,16,4,1,"#111"); px(g,23,18,4,1,"#111");
  // clawed arms + bangles
  px(g,3+A.lax,18+A.la,4,8,fur); px(g,3+A.lax,22+A.la,4,1,"#111"); px(g,3+A.lax,25+A.la,4,2,gold);
  px(g,3+A.lax,27+A.la,4,3,cream0());
  function cream0(){ return "#f2d0a0"; }
  px(g,3+A.lax,28+A.la,1,3,"#111"); px(g,5+A.lax,28+A.la,1,2,"#111");
  const cl=P.atk?-4:0;
  px(g,25+A.rax,18+A.ra+cl,4,8,fur); px(g,25+A.rax,22+A.ra+cl,4,1,"#111");
  px(g,25+A.rax,25+A.ra+cl,4,2,gold);
  px(g,25+A.rax,27+A.ra+cl,4,3,"#f2d0a0");
  px(g,25+A.rax,29+A.ra+cl,1,3,"#fff"); px(g,27+A.rax,29+A.ra+cl,1,2,"#fff");
  // tiger head: stripes, fangs, blazing eyes
  px(g,10+A.hx,7+hb,12,11,fur);
  px(g,10+A.hx,7+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,"#a05a1a");
  px(g,10+A.hx,7+hb,2,11,"#8a4a1a"); px(g,20+A.hx,7+hb,2,11,"#8a4a1a");
  px(g,12+A.hx,8+hb,2,2,"#111"); px(g,18+A.hx,8+hb,2,2,"#111");
  px(g,13+A.hx,7+hb,6,1,"#111");
  px(g,11+A.hx,11+hb,3,3,"#ffe14d"); px(g,18+A.hx,11+hb,3,3,"#ffe14d");
  px(g,12+A.hx,12+hb,1,2,"#111"); px(g,19+A.hx,12+hb,1,2,"#111");
  px(g,11+A.hx,11+hb,1,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,15+hb,6,3,"#7a1f1f"); px(g,13+A.hx,15+hb,1,3,"#fff"); px(g,18+A.hx,15+hb,1,3,"#fff");
  px(g,14+A.hx,14+hb,4,1,"#5a1a1a");
  px(g,7+A.hx,5+hb,4,6,fur); px(g,7+A.hx,5+hb,4,1,"#fff");
  px(g,21+A.hx,5+hb,4,6,fur); px(g,21+A.hx,5+hb,4,1,"#fff");
  px(g,8+A.hx,8+hb,2,2,"#ff8a8a");
  // PEACOCK TURBAN: teal + gold + eye feather
  px(g,9+A.hx,1+hb,14,5,"#1a5a6a"); px(g,9+A.hx,1+hb,14,1,"#7fd4ff");
  px(g,9+A.hx,5+hb,14,1,gold);
  px(g,12+A.hx,2+hb,3,3,gold); px(g,17+A.hx,2+hb,3,3,gold);
  px(g,13+A.hx,3+hb,1,1,"#1a5a6a"); px(g,18+A.hx,3+hb,1,1,"#1a5a6a");
  px(g,15+A.hx,0+hb,2,4,"#2a9a8a"); px(g,15+A.hx,0+hb,2,1,"#bfe8ff");
  px(g,14+A.hx,3+hb,4,2,"#c93b3b"); px(g,15+A.hx,3+hb,1,1,"#fff");
};

/* ============ 16. THE JOKER — criminal mastermind (detailed old joker) ============ */
D.joker = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const lav="#9a6ac9", lavD="#4a2a6a", lavL="#c9a7ff", lavDK="#33204a";
  const cream="#f2ede2", creamD="#c9bda8";
  const cap="#5a3a22", capD="#3a2412", capL="#a97648";
  const skin="#d9a06a", skinD="#a06a3a", skinL="#f0c090";
  const dark="#1a0f24", oxblood="#8a2a2a", oxbloodD="#5a1a1a";
  const brass="#ffd93d", brassL="#fff2b0", brassD="#8a6410";
  const gemB="#7fd4ff", parch="#e8d9b0";
  const knotR="#8a2a2a", knotB="#2a5a8a";
  aura(g,hb,"rgba(150,90,190,0.20)","rgba(200,60,60,0.10)");
  px(g,3,20,1,1,lavL); px(g,28,26,1,1,"#fff"); px(g,25,33,1,1,brassL); px(g,5,32,1,1,creamD);
  const fl=Sg(P,0,1);
  // polished shoes + tailored legs
  px(g,10+A.lx,28+A.ld,4,6,lav); px(g,18+A.rx,28+A.rd,4,6,lav);
  px(g,10+A.lx,28+A.ld,1,6,lavL); px(g,18+A.rx,28+A.rd,1,6,lavL);
  px(g,13+A.lx,28+A.ld,1,6,lavD); px(g,21+A.rx,28+A.rd,1,6,lavD);
  px(g,10+A.lx,32+A.ld,4,2,lavD); px(g,18+A.rx,32+A.rd,4,2,lavD);
  px(g,9+A.lx,34+A.ld,6,2,"#2e1c10"); px(g,17+A.rx,34+A.rd,6,2,"#2e1c10");
  px(g,9+A.lx,34+A.ld,6,1,capL); px(g,17+A.rx,34+A.rd,6,1,capL);
  px(g,10+A.lx,34+A.ld,1,1,brassL); px(g,18+A.rx,34+A.rd,1,1,brassL);
  px(g,9+A.lx,33+A.ld,6,1,lavDK); px(g,17+A.rx,33+A.rd,6,1,lavDK);
  // tailored tunic: plain lavender, plum piping, brass buttons
  px(g,8,18,16,12,lav);
  px(g,8,18,16,2,lavL); px(g,8,28,16,2,lavD);
  px(g,8,18,2,12,lavD); px(g,22,18,2,12,lavD);
  px(g,10,20,1,8,lavL); px(g,21,20,1,8,lavDK);
  px(g,15,18,2,10,lavD); px(g,15,18,1,10,lavDK);
  px(g,16,19,1,1,brass); px(g,16,22,1,1,brass); px(g,16,25,1,1,brass);
  px(g,16,19,1,1,brassL);
  px(g,8,18,16,1,"#fff");
  // brown showman's belt + buckle + pouch with two white slots (callback)
  px(g,9,27,14,3,capD); px(g,9,27,14,1,capL);
  px(g,15,27,3,3,brassD); px(g,15,27,2,2,brass); px(g,15,27,1,1,brassL);
  px(g,11,28,5,4,cap); px(g,11,28,5,1,capL); px(g,11,31,5,1,capD);
  px(g,12,29,1,2,cream); px(g,14,29,1,2,cream);
  px(g,12,29,1,1,"#fff"); px(g,14,29,1,1,"#fff");
  px(g,11,28,1,4,capD); px(g,15,28,1,4,capD);
  // pocket chain + signet stud
  px(g,18,27,4,1,brass); px(g,21,27,1,2,brass); px(g,21,28,1,1,brassL);
  // layered white ruff collar with pleats
  px(g,7,15,18,3,cream); px(g,7,15,18,1,"#fff");
  px(g,7,17,18,1,creamD);
  px(g,8,16,16,1,creamD);
  for(let i=0;i<8;i++) px(g,8+i*2,16,1,2,creamD);
  px(g,9,17,14,2,cream); px(g,9,17,14,1,"#fff");
  for(let i=0;i<7;i++) px(g,10+i*2,18,1,1,creamD);
  // LEFT arm: thin lavender, red shoulder knot, white cuff, hand + black ledger
  px(g,5+A.lax,19+A.la,4,6,lav); px(g,5+A.lax,19+A.la,1,6,lavL); px(g,8+A.lax,19+A.la,1,6,lavD);
  px(g,5+A.lax,19+A.la,4,2,knotR); px(g,5+A.lax,19+A.la,4,1,"#c05a5a");
  px(g,4+A.lax,24+A.la,4,2,cream); px(g,4+A.lax,24+A.la,4,1,"#fff");
  px(g,4+A.lax,26+A.la,4,3,skin); px(g,4+A.lax,26+A.la,1,3,skinL); px(g,7+A.lax,26+A.la,1,3,skinD);
  const lb=P.atk?-2:0;
  px(g,0+A.lax,23+A.la+lb,5,7,"#241a2e"); px(g,0+A.lax,23+A.la+lb,5,1,"#3a2a4a");
  px(g,0+A.lax,23+A.la+lb,1,7,"#3a2a4a");
  px(g,1+A.lax,24+A.la+lb,3,5,"#e8e0d0");
  px(g,1+A.lax,24+A.la+lb,3,1,"#fff");
  px(g,1+A.lax,26+A.la+lb,3,1,"#c9bda8"); px(g,1+A.lax,28+A.la+lb,3,1,"#c9bda8");
  px(g,0+A.lax,23+A.la+lb,1,7,"#120c18"); px(g,4+A.lax,23+A.la+lb,1,7,"#120c18");
  px(g,2+A.lax,25+A.la+lb,1,3,brass); px(g,2+A.lax,25+A.la+lb,1,1,brassL);
  px(g,0+A.lax,29+A.la+lb,5,1,"#3a2a4a");
  // RIGHT arm: thin lavender, blue shoulder knot, white cuff, hand high with LANTERN
  const cs=P.atk?-5:0;
  px(g,23+A.rax,19+A.ra+cs,4,6,lav); px(g,23+A.rax,19+A.ra+cs,1,6,lavL); px(g,26+A.rax,19+A.ra+cs,1,6,lavD);
  px(g,23+A.rax,19+A.ra+cs,4,2,knotB); px(g,23+A.rax,19+A.ra+cs,4,1,"#5a8ac0");
  px(g,24+A.rax,24+A.ra+cs,4,2,cream); px(g,24+A.rax,24+A.ra+cs,4,1,"#fff");
  px(g,24+A.rax,26+A.ra+cs,4,3,skin); px(g,24+A.rax,26+A.ra+cs,1,3,skinL); px(g,27+A.rax,26+A.ra+cs,1,3,skinD);
  // lantern: brass cage, glowing glass, flame, halo
  g.fillStyle="rgba(255,217,61,0.25)"; g.beginPath(); g.arc(26+A.rax,20+A.ra+cs,6,0,7); g.fill();
  px(g,24+A.rax,14+A.ra+cs,5,2,capD); px(g,24+A.rax,14+A.ra+cs,5,1,capL);
  px(g,26+A.rax,12+A.ra+cs,1,2,brass); px(g,26+A.rax,12+A.ra+cs,1,1,brassL);
  px(g,23+A.rax,16+A.ra+cs,6,7,cap); px(g,23+A.rax,16+A.ra+cs,1,7,capL); px(g,28+A.rax,16+A.ra+cs,1,7,capD);
  px(g,24+A.rax,17+A.ra+cs,4,5,brass); px(g,24+A.rax,17+A.ra+cs,4,1,brassL);
  px(g,25+A.rax,18+A.ra+cs,2,4,"#ff9d2e"); px(g,25+A.rax,18+A.ra+cs,1,3,"#fff");
  if(fl) px(g,25+A.rax,19+A.ra+cs,2,1,"#ffcf6a");
  px(g,23+A.rax,23+A.ra+cs,6,1,capL); px(g,25+A.rax,24+A.ra+cs,2,1,capD);
  px(g,26+A.rax,17+A.ra+cs,1,1,"#fff");
  // mastermind face: tan square, shaded, cold slit eyes, thin smirk (no clown paint)
  px(g,11+A.hx,8+hb,10,8,skin);
  px(g,11+A.hx,8+hb,10,2,skinL);
  px(g,11+A.hx,8+hb,1,8,skinD); px(g,20+A.hx,8+hb,1,8,skinD);
  px(g,11+A.hx,14+hb,10,2,skinD);
  px(g,12+A.hx,9+hb,3,1,skinL); px(g,17+A.hx,9+hb,3,1,skinL);
  // heavy-lidded eyes + sharp angled brows
  px(g,12+A.hx,11+hb,3,1,dark); px(g,17+A.hx,11+hb,3,1,dark);
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,12+A.hx,10+hb,3,1,capD); px(g,17+A.hx,10+hb,3,1,capD);
  // thin calculating smirk, widens on attack
  px(g,14+A.hx,14+hb,4,1,oxblood);
  px(g,17+A.hx,13+hb,1,1,oxblood);
  if(P.atk){ px(g,14+A.hx,15+hb,4,1,oxbloodD); px(g,15+A.hx,15+hb,2,1,"#fff"); }
  // flat brown cap with three keepsakes: cream ticket, blue gem, tan card
  px(g,8+A.hx,4+hb,16,4,cap); px(g,8+A.hx,4+hb,16,1,capL); px(g,8+A.hx,7+hb,16,1,capD);
  px(g,8+A.hx,4+hb,1,4,capD); px(g,23+A.hx,4+hb,1,4,capD);
  px(g,10+A.hx,1+hb,4,4,cream); px(g,10+A.hx,1+hb,4,1,"#fff"); px(g,10+A.hx,4+hb,4,1,creamD);
  px(g,11+A.hx,2+hb,2,1,oxblood); px(g,11+A.hx,3+hb,1,1,oxblood);
  px(g,14+A.hx,1+hb,4,4,brassD); px(g,14+A.hx,1+hb,4,1,brass);
  px(g,15+A.hx,2+hb,2,2,gemB); px(g,15+A.hx,2+hb,1,1,"#fff");
  px(g,18+A.hx,1+hb,4,4,parch); px(g,18+A.hx,1+hb,4,1,"#fff"); px(g,18+A.hx,4+hb,4,1,"#b09a60");
  px(g,19+A.hx,2+hb,2,2,"#8a6a30"); px(g,19+A.hx,2+hb,1,1,"#c0a050");
};

/* ============ 10. SCORPION EMPEROR ============ */
D.scorpion_emperor = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const shell="#c89820", dk="#5a4410", lite="#f0d060", gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(220,180,60,0.24)","rgba(125,255,155,0.12)");
  px(g,3,22,1,1,"#7dff9b"); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,gold);
  const tw=Sg(P,0,1), tw2=Sg(P,1,1);
  // venom-glow halo around the sting so it reads at a glance
  g.fillStyle="rgba(125,255,155,0.30)"; g.beginPath(); g.arc(23,3+tw2,6,0,7); g.fill();
  // towering tail: bright segments, white crowns, jeweled bands
  px(g,3,22,5,6,dk); px(g,4,21,5,2,shell); px(g,3,22,5,1,gold);
  px(g,6,16,6,6,shell); px(g,6,16,6,1,goldL); px(g,6,21,6,1,dk);
  px(g,9,11,6,6,shell); px(g,9,11,6,1,goldL); px(g,9,16,6,1,dk);
  px(g,12,7,6,5,dk); px(g,13,7,4,4,shell); px(g,13,7,4,1,goldL);
  px(g,16,4+tw,6,5,shell); px(g,16,4+tw,6,1,"#fff"); px(g,16,8+tw,6,1,dk);
  px(g,20,2+tw2,5,5,dk); px(g,21,2+tw2,3,4,shell); px(g,21,2+tw2,3,1,goldL);
  px(g,7,17,4,2,gold); px(g,10,12,4,2,gold); px(g,13,8,4,1,gold); px(g,17,5+tw,4,1,gold);
  // imperial sting: black bulb, green venom, white glint
  px(g,21,0+tw2,5,3,"#1a1a1a"); px(g,21,0+tw2,5,1,gold);
  px(g,22,1+tw2+(P.atk?1:0),3,2,"#7dff9b"); px(g,22,1+tw2,3,1,"#d0ffd0");
  px(g,23,2+tw2,1,1,"#fff");
  // wide armored body + bright plates + gold keel + white rim
  const hv=P.moving?[0,-1,0,1][P.f&3]:0;
  px(g,4,25+hv,22,8,dk); px(g,5,26+hv,20,6,shell);
  px(g,5,26+hv,20,2,goldL);
  for(let i=0;i<5;i++){ px(g,7+i*4,28+hv,2,4,lite); px(g,7+i*4,28+hv,1,1,"#fff"); }
  px(g,5,25+hv,20,1,gold);
  px(g,5,31+hv,3,3,dk); px(g,12,31+hv,3,3,dk); px(g,19,31+hv,3,3,dk);
  px(g,5,31+hv,3,1,lite); px(g,12,31+hv,3,1,lite);
  // imperial head + red eyes + fangs
  px(g,22,23,5,7,shell); px(g,22,23,5,1,goldL); px(g,22,28,5,2,dk);
  px(g,23,25,2,2,"#ff3b3b"); px(g,25,25,1,2,"#ff3b3b");
  px(g,23,25,1,1,"#fff"); px(g,25,25,1,1,"#fff");
  px(g,23,28,3,1,"#e8e0d0");
  // SUN-DISK CROWN
  px(g,21,18,7,2,gold); px(g,21,18,7,1,goldL);
  g.fillStyle=gold; g.beginPath(); g.arc(24,15,3,0,7); g.fill();
  g.fillStyle="#ff9d2e"; g.beginPath(); g.arc(24,15,1.5,0,7); g.fill();
  g.fillStyle="#fff"; g.fillRect(23,13,1,1);
  // CRUSHER CLAWS, inset so they never clip: pale pincers, gold joints
  const sn=P.atk?2:0;
  px(g,24,20-sn,6,7,dk); px(g,25,19-sn,4,6,shell); px(g,25,19-sn,4,1,goldL);
  px(g,25,22-sn,2,2,dk); px(g,28,22-sn,2,2,dk);
  px(g,25,24-sn,4,3,"#fff"); px(g,26,24-sn,2,2,"#e8e0d0"); px(g,26,19-sn,2,2,gold);
  px(g,2,14,5,8,dk); px(g,2,13,4,6,shell); px(g,2,13,4,1,goldL);
  px(g,2,16,2,2,dk); px(g,4,16,2,2,dk);
  px(g,2,19,2,3,"#fff");
};

/* ============ 11. ONI DAIMYO ============ */
D.oni_daimyo = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const skin="#c22e1f", dk="#7a1408", lite="#ff6a4a", gold="#d9a91e", goldL="#ffe37a";
  const armor="#1a1a22", trim=gold;
  aura(g,hb,"rgba(220,60,40,0.22)","rgba(255,217,61,0.10)");
  px(g,3,22,1,1,"#ff8a6a"); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,"#ff8a6a");
  // sashimono banner
  const sw2=P.moving?((P.f&1)?1:-1):0;
  px(g,24,2,2,18,"#8a6a3a"); px(g,24,1,2,2,gold);
  px(g,25+sw2,3,5,9,"#f2ede0"); px(g,25+sw2,3,5,1,gold); px(g,25+sw2,11,5,1,gold);
  px(g,26+sw2,5,3,5,skin); px(g,27+sw2,7,1,1,"#fff");
  // stomping legs + sandals
  px(g,10+A.lx,28+A.ld,4,6,dk); px(g,18+A.rx,28+A.rd,4,6,dk);
  px(g,10+A.lx,28+A.ld,1,6,lite);
  px(g,9+A.lx,34+A.ld,6,2,"#2a1a10"); px(g,17+A.rx,34+A.rd,6,2,"#2a1a10");
  // corded black armor + gold studs + belly-face
  px(g,8,17,16,13,armor);
  px(g,8,17,16,2,"#3a3a4a"); px(g,8,28,16,2,"#0c0c12");
  px(g,10,19,12,9,"#23232e");
  for(let y=20;y<27;y+=2) for(let x=11;x<21;x+=3) px(g,x,y,1,1,gold);
  px(g,13,22,6,5,skin); px(g,14,23,2,2,"#ffe14d"); px(g,17,23,2,2,"#ffe14d");
  px(g,14,23,1,1,"#111"); px(g,17,23,1,1,"#111");
  px(g,14,25,4,2,"#5a1a1a"); px(g,14,25,1,1,"#fff"); px(g,17,25,1,1,"#fff");
  px(g,9,27,14,2,trim); px(g,9,27,14,1,goldL);
  // SODE shoulder guards
  px(g,2+A.lax,13+A.la,7,6,armor); px(g,2+A.lax,13+A.la,7,1,gold); px(g,3+A.lax,15+A.la,5,1,gold);
  px(g,23+A.rax,13+A.ra,7,6,armor); px(g,23+A.rax,13+A.ra,7,1,gold); px(g,24+A.rax,15+A.ra,5,1,gold);
  // LEFT fist + claws
  px(g,3+A.lax,19+A.la,4,8,skin); px(g,3+A.lax,19+A.la,1,8,lite);
  px(g,3+A.lax,26+A.la,4,3,dk);
  px(g,3+A.lax,29+A.la,1,2,"#e8e0d0"); px(g,5+A.lax,29+A.la,1,2,"#fff");
  // RIGHT + gold-studded KANABO (overhead on atk)
  const kb=P.atk?-6:0;
  px(g,25+A.rax,19+A.ra+kb,4,7,skin);
  px(g,25+A.rax,11+A.ra+kb,3,14,"#5a3a22"); px(g,25+A.rax,11+A.ra+kb,1,14,"#a97648");
  px(g,23+A.rax,5+A.ra+kb,7,7,"#3a2a1a"); px(g,23+A.rax,5+A.ra+kb,7,1,goldL);
  for(let y=6+A.ra+kb;y<11+A.ra+kb;y+=2) for(let x=24+A.rax;x<29+A.rax;x+=2) px(g,x,y,1,1,gold);
  // red demon face: fangs, gold eyes, snarl
  px(g,10+A.hx,8+hb,12,10,skin);
  px(g,10+A.hx,8+hb,12,2,lite); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,11+A.hx,11+hb,3,3,"#ffe14d"); px(g,18+A.hx,11+hb,3,3,"#ffe14d");
  px(g,12+A.hx,12+hb,1,2,"#111"); px(g,19+A.hx,12+hb,1,2,"#111");
  px(g,11+A.hx,11+hb,1,1,"#fff"); px(g,18+A.hx,11+hb,1,1,"#fff");
  px(g,12+A.hx,15+hb,8,3,"#5a1a1a"); px(g,13+A.hx,15+hb,1,3,"#fff"); px(g,18+A.hx,15+hb,1,3,"#fff");
  // GREAT KABUTO: black + gold crescent + horns
  px(g,9+A.hx,3+hb,14,6,armor); px(g,9+A.hx,3+hb,14,1,"#3a3a4a");
  px(g,9+A.hx,2+hb,14,2,gold); px(g,9+A.hx,2+hb,14,1,goldL);
  px(g,12+A.hx,0+hb,8,3,gold); px(g,13+A.hx,0+hb,6,1,goldL);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(10+A.hx,5+hb); g.lineTo(4+A.hx,0+hb); g.lineTo(8+A.hx,7+hb); g.fill();
  g.beginPath(); g.moveTo(22+A.hx,5+hb); g.lineTo(28+A.hx,0+hb); g.lineTo(24+A.hx,7+hb); g.fill();
};

/* ============ 12. SIEGE ANT QUEEN ============ */
D.siege_queen = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const shell="#5a2a0a", dk="#2e1404", lite="#8a4a1a", gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(160,90,30,0.22)","rgba(255,217,61,0.10)");
  px(g,3,22,1,1,goldL); px(g,28,18,1,1,"#fff"); px(g,26,33,1,1,goldL);
  // dug-earth carpet + egg clutch
  px(g,2,32,28,4,"#4a3320"); px(g,6,31,4,2,"#5a4028"); px(g,22,31,4,2,"#5a4028");
  px(g,4,30,4,3,"#e8d9c9"); px(g,5,30,2,2,shell); px(g,24,30,4,3,"#e8d9c9"); px(g,25,30,2,2,shell);
  // six column legs stamp in waves
  for(let l=0;l<3;l++){ const y=23+l*3, o=Sg(P,l,1); px(g,3,y+o,4,2,dk); px(g,25,y-o,4,2,dk); px(g,2,y+1+o,2,4,dk); px(g,28,y+1-o,2,4,dk); px(g,3,y+o,4,1,lite); }
  // mountainous plated bulk heaves as the leg waves travel (legs stay planted)
  const hv2=P.moving?([0,-1,0,1][P.f&3]):0;
  g.save(); g.translate(0,hv2);
  // mountainous plated bulk + gold trim + segment shading
  px(g,7,24,18,9,dk); px(g,8,25,16,7,shell); px(g,8,25,16,2,lite);
  px(g,8,27,16,1,gold); px(g,8,30,16,1,gold);
  for(let x=9;x<23;x+=3) px(g,x,26,1,5,dk);
  px(g,9,20,14,6,dk); px(g,10,21,12,4,shell); px(g,10,21,12,1,lite);
  px(g,10,14,12,7,dk); px(g,11,15,10,5,shell); px(g,12,15,8,1,lite);
  px(g,12,16,2,4,dk); px(g,18,16,2,4,dk);
  // royal thorax jewels
  px(g,14,21,4,3,gold); px(g,15,22,2,1,"#c93b3b"); px(g,15,22,1,1,"#fff");
  px(g,14,16,4,2,gold); px(g,15,16,1,1,"#fff");
  // CROWN OF THE DEEP NEST: gold palisade + ember gems
  px(g,10,8,12,4,dk); px(g,10,8,12,1,gold);
  px(g,11,4,3,5,gold); px(g,11,4,3,1,goldL); px(g,15,3,3,6,"#fff"); px(g,15,3,3,1,goldL); px(g,19,4,3,5,gold); px(g,19,4,3,1,goldL);
  px(g,12,5,1,2,"#ff9d2e"); px(g,16,4,1,2,"#ff9d2e"); px(g,20,5,1,2,"#ff9d2e");
  px(g,12,5,1,1,"#fff"); px(g,16,4,1,1,"#fff");
  // colossal mandibles snap on atk + antennae + eyes
  const sn2=P.atk?2:0;
  px(g,4,17-sn2,6,9,dk); px(g,2,22-sn2,4,6,shell); px(g,2,22-sn2,4,1,lite); px(g,2,26-sn2,3,2,"#e8e0d0");
  px(g,22,17+sn2,6,9,dk); px(g,26,22+sn2,4,6,shell); px(g,26,22+sn2,4,1,lite); px(g,27,26+sn2,3,2,"#e8e0d0");
  px(g,11,10,3,5,dk); px(g,18,10,3,5,dk);
  px(g,12,8,2,6,shell); px(g,18,8,2,6,shell);
  g.fillStyle="#ff9d2e"; g.fillRect(13,17,3,3); g.fillRect(18,17,2,2);
  g.fillStyle="#fff"; g.fillRect(14,17,1,1); g.fillRect(18,17,1,1);
  g.fillStyle="#111"; g.fillRect(14,18,1,1);
  if(P.atk){ px(g,13,20,8,2,"#7a1f1f"); }
  g.restore();
};

/* ============ 13. WYVERN MATRIARCH ============ */
D.wyvern_matriarch = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const scale="#3f7d3a", dk="#1e3a1e", lite="#6aaa5a", belly="#d9c27f";
  const gold="#d9a91e", blood="#c93b3b";
  aura(g,hb,"rgba(90,200,110,0.22)","rgba(255,180,60,0.10)");
  px(g,3,18,1,1,"#ffd93d"); px(g,28,14,1,1,"#fff"); px(g,26,33,1,1,"#ffd93d");
  // BROAD SAIL WINGS: bright membranes, white leading edges, torn ember tears
  const W=P.atk?-3:(P.moving?[0,-2,0,2][P.f&3]:0);
  g.fillStyle="#2e5a2e";
  g.beginPath(); g.moveTo(12,22+W); g.lineTo(0,5+W); g.lineTo(3,14+W); g.lineTo(7,13+W); g.lineTo(9,21+W); g.fill();
  g.beginPath(); g.moveTo(20,22+W); g.lineTo(32,5+W); g.lineTo(29,14+W); g.lineTo(25,13+W); g.lineTo(23,21+W); g.fill();
  g.fillStyle=scale;
  g.beginPath(); g.moveTo(11,21+W); g.lineTo(2,7+W); g.lineTo(4,13+W); g.lineTo(7,13+W); g.lineTo(9,20+W); g.fill();
  g.beginPath(); g.moveTo(21,21+W); g.lineTo(30,7+W); g.lineTo(28,13+W); g.lineTo(25,13+W); g.lineTo(23,20+W); g.fill();
  px(g,0,5+W,2,9,lite); px(g,30,5+W,2,9,lite);
  px(g,1,5+W,1,9,"#fff"); px(g,30,5+W,1,9,"#fff");
  px(g,1,7+W,3,8,scale); px(g,28,7+W,3,8,scale);
  px(g,2,11+W,2,6,lite); px(g,28,11+W,2,6,lite);
  px(g,4,12+W,4,1,blood); px(g,24,12+W,4,1,blood);
  px(g,6,15+W,2,3,"#7a1f1f"); px(g,24,15+W,2,3,"#7a1f1f");
  px(g,0,5+W,2,3,gold); px(g,30,5+W,2,3,gold);
  // tail + hind claws
  const tw3=Sg(P,0,1);
  px(g,1+tw3,26,5,5,dk); px(g,0+tw3,29,4,3,scale);
  px(g,26-tw3,26,5,5,dk); px(g,28-tw3,29,4,3,scale);
  // coiled brood body + pale belly + egg mound
  px(g,7,25,18,8,dk); px(g,8,26,16,6,scale); px(g,8,26,16,2,lite);
  px(g,10,28,12,3,belly); px(g,11,28,2,3,"#8a6a2a"); px(g,15,28,2,3,"#8a6a2a"); px(g,19,28,2,3,"#8a6a2a");
  px(g,9,31,4,3,"#e8e0d0"); px(g,15,31,3,3,"#f2d0a0"); px(g,20,31,3,3,"#e8e0d0");
  px(g,10,31,1,1,"#fff"); px(g,16,31,1,1,"#fff");
  // foreclaws grip mound
  px(g,8+A.lax,22+A.la,4,5,scale); px(g,8+A.lax,22+A.la,1,5,lite); px(g,8+A.lax,26+A.la,4,2,"#e8e0d0");
  px(g,20+A.rax,22+A.ra,4,5,scale); px(g,23+A.rax,22+A.ra,1,5,lite); px(g,20+A.rax,26+A.ra,4,2,"#e8e0d0");
  // long neck + horned draconic head + gaping maw
  px(g,13,12,6,12,scale); px(g,13,12,2,12,dk); px(g,13,12,6,2,lite);
  px(g,12+A.hx,6+hb,8,9,scale); px(g,12+A.hx,6+hb,8,2,lite); px(g,12+A.hx,13+hb,8,2,dk);
  px(g,12+A.hx,12+hb,8,5,"#0c1a10");
  for(let i=0;i<4;i++) px(g,13+i*2+A.hx,13+hb,1,3,"#fff");
  px(g,13+A.hx,10+hb,2,3,"#ffe14d"); px(g,17+A.hx,10+hb,2,2,"#ffe14d");
  px(g,13+A.hx,11+hb,1,2,"#111");
  px(g,13+A.hx,10+hb,1,1,"#fff");
  g.fillStyle="#e8e0d0";
  g.beginPath(); g.moveTo(12+A.hx,7+hb); g.lineTo(7+A.hx,2+hb); g.lineTo(10+A.hx,8+hb); g.fill();
  g.beginPath(); g.moveTo(20+A.hx,7+hb); g.lineTo(25+A.hx,2+hb); g.lineTo(22+A.hx,8+hb); g.fill();
  px(g,8+A.hx,2+hb,2,2,blood); px(g,22+A.hx,2+hb,2,2,blood);
  px(g,13+A.hx,4+hb,6,3,gold); px(g,14+A.hx,4+hb,1,1,"#fff");
};

/* ============ 14. JOTUNN JARL ============ */
D.jotunn_jarl = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const ice="#9ab8d9", dk="#3a5a7a", deep="#1e2e44", lite="#d0e8ff", fur="#e8e4d8";
  const gold="#ffd93d", goldL="#fff2b0";
  aura(g,hb,"rgba(140,190,240,0.22)","rgba(255,255,255,0.12)");
  px(g,3,20,1,1,"#fff"); px(g,28,16,1,1,"#7fd4ff"); px(g,26,33,1,1,"#fff");
  // massive legs + fur boots
  px(g,9+A.lx,28+A.ld,5,6,"#5a6a7a"); px(g,18+A.rx,28+A.rd,5,6,"#5a6a7a");
  px(g,9+A.lx,28+A.ld,1,6,lite);
  px(g,8+A.lx,33+A.ld,7,3,fur); px(g,17+A.rx,33+A.rd,7,3,fur);
  px(g,8+A.lx,33+A.ld,7,1,"#fff"); px(g,8+A.lx,35+A.ld,7,1,"#8a7a6a");
  // glacier plate torso + fur trim + rune gem
  px(g,7,16,18,14,dk);
  px(g,7,16,18,2,ice); px(g,7,28,18,2,deep);
  px(g,7,16,3,14,fur); px(g,22,16,3,14,fur);
  px(g,10,18,12,10,ice); px(g,10,18,12,2,lite); px(g,10,26,12,2,dk);
  px(g,14,20,4,6,"#2a6a9a"); px(g,15,21,2,4,"#7fd4ff"); px(g,15,21,1,1,"#fff");
  px(g,9,27,14,2,gold); px(g,9,27,14,1,goldL);
  // CRYSTAL SHOULDERS
  px(g,2+A.lax,12+A.la,7,6,ice); px(g,2+A.lax,12+A.la,7,1,"#fff"); px(g,2+A.lax,16+A.la,7,2,dk);
  px(g,3+A.lax,10+A.la,5,3,"#7fd4ff"); px(g,4+A.lax,10+A.la,1,2,"#fff");
  px(g,23+A.rax,12+A.ra,7,6,ice); px(g,23+A.rax,12+A.ra,7,1,"#fff"); px(g,23+A.rax,16+A.ra,7,2,dk);
  px(g,24+A.rax,10+A.ra,5,3,"#7fd4ff"); px(g,27+A.rax,10+A.ra,1,2,"#fff");
  // LEFT fist
  px(g,3+A.lax,18+A.la,4,8,"#d9b98a"); px(g,3+A.lax,18+A.la,1,8,"#fff");
  px(g,3+A.lax,25+A.la,4,3,"#8a6a4a");
  // RIGHT + glacier great-axe (hefts on atk)
  const ax2=P.atk?-5:0;
  px(g,25+A.rax,18+A.ra+ax2,4,8,"#d9b98a");
  px(g,26+A.rax,10+A.ra+ax2,2,16,"#5a3a22"); px(g,26+A.rax,10+A.ra+ax2,1,16,"#a97648");
  px(g,22+A.rax,6+A.ra+ax2,10,7,ice); px(g,22+A.rax,6+A.ra+ax2,10,1,"#fff"); px(g,22+A.rax,12+A.ra+ax2,10,1,dk);
  px(g,22+A.rax,6+A.ra+ax2,2,7,"#7fd4ff");
  // frost beard + face + glowing blue eyes
  px(g,10+A.hx,8+hb,12,10,ice);
  px(g,10+A.hx,8+hb,12,2,"#fff"); px(g,10+A.hx,16+hb,12,2,dk);
  px(g,11+A.hx,11+hb,3,2,"#2a6aba"); px(g,18+A.hx,11+hb,3,2,"#2a6aba");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,19+A.hx,11+hb,1,1,"#fff");
  px(g,12+A.hx,14+hb,8,4,lite); px(g,13+A.hx,15+hb,6,2,ice); px(g,14+A.hx,17+hb,4,1,dk);
  px(g,11+A.hx,9+hb,10,1,deep);
  // horned helm + gold band
  px(g,9+A.hx,2+hb,14,5,dk); px(g,9+A.hx,2+hb,14,1,lite);
  px(g,9+A.hx,6+hb,14,1,gold);
  g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(10+A.hx,4+hb); g.lineTo(4+A.hx,0+hb); g.lineTo(8+A.hx,6+hb); g.fill();
  g.beginPath(); g.moveTo(22+A.hx,4+hb); g.lineTo(28+A.hx,0+hb); g.lineTo(24+A.hx,6+hb); g.fill();
};

/* ============ 15. HYDRA BROODMOTHER ============ */
D.hydra_broodmother = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const scale="#1e6a36", dk="#0e3a1e", lite="#3a9a5a", belly="#d9c27f";
  const gold="#ffd93d";
  aura(g,hb,"rgba(60,200,110,0.22)","rgba(255,150,180,0.10)");
  px(g,3,20,1,1,"#7dff9b"); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,"#ff9dc9");
  // mound nest + eggs + bone lotus
  px(g,3,29,26,7,dk); px(g,5,30,22,5,scale); px(g,5,30,22,1,lite);
  px(g,7,28,4,3,"#e8e0d0"); px(g,13,27,4,4,"#f2d0a0"); px(g,21,28,4,3,"#e8e0d0");
  px(g,8,28,1,1,"#fff"); px(g,14,27,1,1,"#fff");
  px(g,11,24,10,3,"#ff6b8a"); px(g,12,23,8,2,"#ff9dc9");
  px(g,12,20,3,4,"#e8e0d0"); px(g,15,19,3,5,"#ff9dc9"); px(g,18,20,3,4,"#e8e0d0");
  px(g,16,20,1,3,gold); px(g,16,19,1,1,"#fff");
  // SEVEN-HEAD FAN: necks + heads + eyes + alpha gape
  const heads=[[1,14],[5,9],[10,5],[14,3],[19,5],[23,9],[26,13]];
  heads.forEach((h,i)=>{
    const sway=Sg(P,i,1), hx=h[0]+sway, hy=h[1], big=(i===3);
    px(g,hx,hy+6,2,10,scale); px(g,hx,hy+6,1,10,lite); px(g,hx+1,hy+6,1,10,dk);
    px(g,hx-1,hy,big?7:5,big?8:6,scale); px(g,hx-1,hy,big?7:5,1,lite);
    px(g,hx,hy+1,3,3,lite);
    g.fillStyle="#ffe14d"; g.fillRect(hx,hy+3,1,1); g.fillRect(hx+3,hy+3,1,1);
    g.fillStyle="#111"; g.fillRect(hx,hy+3,1,1);
    if(big){ px(g,hx+1,hy+3,1,1,"#fff"); if(P.atk){ px(g,hx,hy+5,5,3,"#7a1f1f"); px(g,hx+1,hy+6,3,1,"#ff8a8a"); } else px(g,hx,hy+5,5,1,"#7a1f1f"); px(g,hx+1,hy-1,3,2,gold); }
    else if(P.atk && (i===2||i===4)){ px(g,hx,hy+5,4,1,"#7a1f1f"); }
  });
  // central coils + gold bands
  px(g,9,28,14,4,scale); px(g,9,28,14,1,lite);
  px(g,10,29,3,2,gold); px(g,19,29,3,2,gold);
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
    const ck=kind+"|"+(tint||"#fff")+"|"+gen+bk;
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
