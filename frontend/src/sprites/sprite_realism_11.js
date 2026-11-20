/* src/sprites/sprite_realism_11.js — GODDESS/PETER BAR REALISM (11 targets).
 * Outermost wrapper. Loaded AFTER sprite_realism_22.js.
 * Bar: aura+shadow+sparkles, ~120-150 rects, 1px highlights/shading,
 * detailed face (lash/iris/pupil/catchlight/blush/mouth), texture rows,
 * jewelry/weapons, pose-aware via Anim.normP/limb/hbob/seg/quad/flap.
 * Kinds: rusalka, satyr, skeleton, sphinx_cub, tanuki, tide_turtle,
 * umbral_stag, umbral_wyrm, velociraptor, yeti, yuki_onna.
 * Passes goddess + peter_the_fallen through (reference bar, never repainted).
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
const D = {};

/* ============ 1. RUSALKA v7.1 — drowned songmaiden (goddess bar, refined face) ============ */
D.rusalka = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const sea=tint&&tint!=="#ffffff"?tint:"#7ad9c9";
  const dk=shade(sea,-42), deep=shade(sea,-74), lite=shade(sea,32), pale=shade(sea,58);
  const skin="#e8f2e8", skinS="#b9cec0", skinD="#8aa89a", skinL="#ffffff";
  const hair="#1e5a34", hairL="#7ac97a", hairD="#0f2e1c";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  auraShadow(g,hb,"rgba(110,220,200,0.24)","rgba(127,217,240,0.12)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,"#7ad9f0"]);
  const w0=Sg(P,0,1), w1=Sg(P,2,1);
  // floating weed-hair mass behind (drifts) + strand highlights
  px(g,6+w0,4,4,16,hair); px(g,6+w0,4,1,16,hairL); px(g,9+w0,4,1,16,hairD);
  px(g,22+w1,4,4,16,hair); px(g,25+w1,4,1,16,hairD); px(g,22+w1,4,1,16,hairL);
  px(g,5+w0,6,2,10,hairD); px(g,25+w1,6,2,10,hairD);
  px(g,7+w0,8,1,8,hairL); px(g,24+w1,8,1,8,hairL);
  px(g,7+w0,12,1,4,"#2f7a4a"); px(g,24+w1,12,1,4,"#2f7a4a");
  px(g,6+w0,18,3,4,hair); px(g,23+w1,18,3,4,hair);
  px(g,6+w0,18,1,4,hairL); px(g,25+w1,18,1,4,hairD);
  // tail: split fins + scales + glow edge + pearl dots
  const k0=P.moving?[0,2,-1,1][P.f&3]:w0, k1=P.moving?[0,-2,1,-1][P.f&3]:w1;
  px(g,9+k0,28,6,7,dk); px(g,9+k0,28,6,1,lite); px(g,13+k0,28,2,7,deep);
  px(g,17+k1,28,6,7,dk); px(g,17+k1,28,6,1,lite); px(g,17+k1,28,2,7,deep);
  for(let y=29;y<34;y+=2){ px(g,10+k0,y,4,1,"rgba(255,255,255,0.35)"); px(g,18+k1,y,4,1,"rgba(255,255,255,0.35)"); }
  px(g,10+k0,30,1,3,deep); px(g,13+k0,30,1,3,deep); px(g,18+k1,30,1,3,deep); px(g,21+k1,30,1,3,deep);
  px(g,8+k0,34,7,3,"#7ad9f0"); px(g,8+k0,34,7,1,"#fff"); px(g,9+k0,35,2,1,"#2a7a9a");
  px(g,17+k1,34,7,3,"#7ad9f0"); px(g,17+k1,34,7,1,"#fff"); px(g,21+k1,35,2,1,"#2a7a9a");
  px(g,8+k0,34,1,3,"#2a7a9a"); px(g,23+k1,34,1,3,"#2a7a9a");
  px(g,10+k0,30,2,2,pale); px(g,19+k1,30,2,2,pale); px(g,11+k0,31,1,1,"#fff"); px(g,20+k1,31,1,1,"#fff");
  // torso: scaled bodice + belly + side shade + waist cinch
  px(g,10,18,12,11,sea); px(g,10,18,12,2,lite); px(g,10,27,12,2,dk);
  px(g,10,18,2,11,deep); px(g,20,18,2,11,deep);
  for(let x=11;x<21;x+=3){ px(g,x,20,2,6,dk); px(g,x,20,1,2,lite); px(g,x+1,21,1,1,"#fff"); }
  px(g,13,22,6,5,shade(sea,22)); px(g,14,23,4,3,"#e8fff8"); px(g,14,23,4,1,"#fff");
  px(g,11,26,10,1,goldD); px(g,12,25,8,1,goldL);
  // shell necklace + pearl + gold chain + waist jewel
  px(g,11,17,10,2,gold); px(g,11,17,10,1,goldL); px(g,11,18,10,1,goldD);
  px(g,13,16,2,3,"#fff"); px(g,13,16,2,1,"#fff"); px(g,13,17,1,1,"#c9b8a0"); px(g,14,17,1,1,"#fff");
  px(g,16,16,2,2,gold); px(g,16,16,1,1,"#fff"); px(g,19,16,2,2,"#ff9dc9"); px(g,19,16,1,1,"#fff");
  // arms: pale + shell bracelets + webbed song-hands (rise on atk)
  const ar=P.atk?-3:0;
  px(g,5+A.lax+w0,17+A.la+ar,4,8,skin); px(g,5+A.lax+w0,17+A.la+ar,1,8,skinL); px(g,8+A.lax+w0,17+A.la+ar,1,8,skinS);
  px(g,5+A.lax+w0,21+A.la+ar,4,2,gold); px(g,5+A.lax+w0,21+A.la+ar,4,1,goldL);
  px(g,5+A.lax+w0,24+A.la+ar,4,2,"#bfe8f0"); px(g,5+A.lax+w0,25+A.la+ar,1,1,"#fff");
  px(g,23+A.rax+w1,17+A.ra+ar,4,8,skin); px(g,25+A.rax+w1,17+A.ra+ar,1,8,skinS); px(g,23+A.rax+w1,17+A.ra+ar,1,8,skinL);
  px(g,23+A.rax+w1,21+A.ra+ar,4,2,gold); px(g,23+A.rax+w1,21+A.ra+ar,4,1,goldL);
  px(g,23+A.rax+w1,24+A.ra+ar,4,2,"#bfe8f0"); px(g,26+A.rax+w1,25+A.ra+ar,1,1,"#fff");
  // face: pale + forehead light + cheek shade + blush (goddess construction)
  px(g,11+A.hx,8+hb,10,9,skin); px(g,11+A.hx,8+hb,10,1,skinL); px(g,11+A.hx,15+hb,10,2,skinS);
  px(g,11+A.hx,8+hb,1,9,skinS); px(g,20+A.hx,8+hb,1,9,skinS);
  px(g,12+A.hx,9+hb,8,1,"#f4fff8");
  px(g,12+A.hx,8+hb,8,1,"rgba(30,90,52,0.35)");
  px(g,11+A.hx,12+hb,2,2,"#ffb0c0"); px(g,19+A.hx,12+hb,2,2,"#ffb0c0");
  px(g,11+A.hx,13+hb,2,1,"#f0a0b0"); px(g,19+A.hx,13+hb,2,1,"#f0a0b0");
  // eyes: lash + deep-teal iris + pupil + catchlight (goddess layout, drowned palette)
  px(g,12+A.hx,10+hb,3,1,"#1a2a24"); px(g,17+A.hx,10+hb,3,1,"#1a2a24");
  px(g,12+A.hx,11+hb,3,2,"#0f3a3a"); px(g,17+A.hx,11+hb,3,2,"#0f3a3a");
  px(g,12+A.hx,11+hb,3,1,"#2a7a7a"); px(g,17+A.hx,11+hb,3,1,"#2a7a7a");
  px(g,13+A.hx,11+hb,1,2,"#0a1a1a"); px(g,18+A.hx,11+hb,1,2,"#0a1a1a");
  px(g,12+A.hx,11+hb,1,1,"#fff"); px(g,17+A.hx,11+hb,1,1,"#fff");
  px(g,13+A.hx,12+hb,1,1,"#bfe8ff"); px(g,18+A.hx,12+hb,1,1,"#bfe8ff");
  px(g,12+A.hx,9+hb,3,1,hairD); px(g,17+A.hx,9+hb,3,1,hairD);
  px(g,15+A.hx,13+hb,2,2,"#c98a8a"); px(g,15+A.hx,14+hb,1,1,"#8a5a5a");
  // song mouth: dark + teeth + tongue (opens wider on atk)
  if(!P.atk){ px(g,14+A.hx,15+hb,4,2,"#7a1f2e"); px(g,15+A.hx,15+hb,2,1,"#fff"); px(g,15+A.hx,16+hb,2,1,"#ff8a9a"); }
  else{ px(g,13+A.hx,14+hb,6,3,"#0c1a14"); px(g,13+A.hx,14+hb,6,1,"#fff"); px(g,14+A.hx,16+hb,4,1,"#ff8a9a"); px(g,15+A.hx,15+hb,2,1,"#fff"); }
  px(g,14+A.hx,15+hb,1,1,"#fff"); px(g,17+A.hx,15+hb,1,1,"#fff");
  // front fringe strands over forehead + face edges (goddess fringe idiom)
  px(g,10+A.hx,6+hb,3,3,hair); px(g,19+A.hx,6+hb,3,3,hair);
  px(g,10+A.hx,6+hb,1,3,hairL); px(g,21+A.hx,6+hb,1,3,hairD);
  px(g,11+A.hx,8+hb,1,3,hair); px(g,20+A.hx,8+hb,1,3,hair);
  // lily crown: leaves + 3 blooms + gold dots
  px(g,9+A.hx,2+hb,14,4,"#2a8a5a"); px(g,9+A.hx,2+hb,14,1,"#7ac97a"); px(g,9+A.hx,5+hb,14,1,"#1a5a34");
  px(g,10+A.hx,0+hb,4,3,gold); px(g,10+A.hx,0+hb,4,1,"#fff"); px(g,11+A.hx,1+hb,1,1,"#c9962e"); px(g,10+A.hx,2+hb,1,1,goldL);
  px(g,14+A.hx,0+hb,4,4,"#ff9dc9"); px(g,15+A.hx,1+hb,2,2,"#fff"); px(g,15+A.hx,0+hb,4,1,"#ffd0e0");
  px(g,19+A.hx,0+hb,4,3,"#fff"); px(g,19+A.hx,0+hb,4,1,"#fff"); px(g,20+A.hx,1+hb,1,1,"#ffd93d"); px(g,22+A.hx,1+hb,1,1,goldL);
};

/* ============ 2. SATYR PIPER v7 — goat piper (goddess bar) ============ */
D.satyr = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur=tint&&tint!=="#ffffff"?tint:"#a06a3a";
  const dk=shade(fur,-40), deep=shade(fur,-72), lite=shade(fur,32), pale=shade(fur,58);
  const skin="#e0aa72", skinD="#a06a3a", skinL="#f7d9b0";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const horn="#e8e0d0", hornD="#9a968a";
  auraShadow(g,hb,"rgba(200,150,80,0.22)","rgba(255,217,61,0.10)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,lite]);
  const sw=Sg(P,0,1);
  // goat tail nub + tuft
  px(g,4+sw,22,3,4,fur); px(g,4+sw,22,3,1,lite); px(g,3+sw,25,4,3,deep); px(g,3+sw,25,4,1,horn);
  // goat legs: furry thighs + knees + cannons + cloven hooves
  px(g,10+A.lx,28+A.ld,5,5,fur); px(g,10+A.lx,28+A.ld,1,5,lite); px(g,14+A.lx,28+A.ld,1,5,deep);
  px(g,17+A.rx,28+A.rd,5,5,fur); px(g,17+A.rx,28+A.rd,1,5,lite); px(g,21+A.rx,28+A.rd,1,5,deep);
  for(let y=29;y<33;y+=2){ px(g,11+A.lx,y+A.ld,3,1,"rgba(0,0,0,0.22)"); px(g,18+A.rx,y+A.rd,3,1,"rgba(0,0,0,0.22)"); }
  px(g,10+A.lx,32+A.ld,5,2,deep); px(g,17+A.rx,32+A.rd,5,2,deep);
  px(g,9+A.lx,34+A.ld,6,3,"#2a1a10"); px(g,9+A.lx,34+A.ld,6,1,"#5a4a3a"); px(g,10+A.lx,34+A.ld,2,2,"#111");
  px(g,16+A.rx,34+A.rd,6,3,"#2a1a10"); px(g,16+A.rx,34+A.rd,6,1,"#5a4a3a"); px(g,19+A.rx,34+A.rd,2,2,"#111");
  px(g,12+A.lx,34+A.ld,1,1,"#8a7a5a"); px(g,19+A.rx,34+A.rd,1,1,"#8a7a5a");
  px(g,10+A.lx,28+A.ld,5,1,pale);
  // torso: bare chest + hide vest + embroidery + belt
  px(g,9,18,14,11,skin); px(g,9,18,14,1,skinL); px(g,9,27,14,2,skinD);
  px(g,9,18,2,11,skinD); px(g,21,18,2,11,skinD);
  px(g,9,18,5,11,fur); px(g,9,18,5,1,lite); px(g,9,18,1,11,deep);
  px(g,18,18,5,11,fur); px(g,22,18,5,1,lite); px(g,22,18,1,11,deep);
  for(let y=19;y<27;y+=2){ px(g,10,y,3,1,deep); px(g,19,y,3,1,deep); }
  px(g,12,19,8,6,"#5a3a22"); px(g,12,19,8,1,"#8a5a33"); px(g,13,20,6,4,"#3a2412");
  px(g,13,20,2,2,gold); px(g,17,20,2,2,"#c93b3b"); px(g,13,20,1,1,goldL); px(g,17,20,1,1,"#ff8a8a");
  px(g,9,26,14,3,"#2a1a10"); px(g,9,26,14,1,"#5a4a3a");
  px(g,14,26,4,3,gold); px(g,14,26,4,1,goldL); px(g,15,27,2,1,"#8a5a33");
  // arms: furry + hands grip pipes (lift on atk)
  const ar=P.atk?-4:0;
  px(g,5+A.lax,19+A.la+ar,4,7,fur); px(g,5+A.lax,19+A.la+ar,1,7,lite); px(g,8+A.lax,19+A.la+ar,1,7,deep);
  px(g,23+A.rax,19+A.ra+ar,4,7,fur); px(g,23+A.rax,19+A.ra+ar,1,7,lite);
  px(g,5+A.lax,25+A.la+ar,4,3,skin); px(g,5+A.lax,25+A.la+ar,1,1,skinL);
  px(g,23+A.rax,25+A.la+ar,4,3,skin); px(g,25+A.rax,25+A.la+ar,1,1,skinL);
  // head: tan + beard + ears + curved horns
  px(g,10+A.hx,8+hb,12,10,skin); px(g,10+A.hx,8+hb,12,2,skinL); px(g,10+A.hx,16+hb,12,2,skinD);
  px(g,10+A.hx,8+hb,2,10,skinD); px(g,20+A.hx,8+hb,2,10,skinD);
  px(g,12+A.hx,9+hb,8,1,"#f7d9b0");
  // beard: dark + strands + chin tuft
  px(g,12+A.hx,15+hb,8,4,"#3a2412"); px(g,12+A.hx,15+hb,8,1,"#5a3a22");
  px(g,13+A.hx,16+hb,1,2,"#8a5a33"); px(g,15+A.hx,16+hb,1,3,"#8a5a33"); px(g,17+A.hx,16+hb,1,2,"#8a5a33");
  px(g,14+A.hx,18+hb,4,2,"#3a2412");
  // ears: goat + inner + gold ring
  px(g,6+A.hx,12+hb,4,4,skin); px(g,6+A.hx,12+hb,4,1,skinL); px(g,7+A.hx,13+hb,2,2,skinD);
  px(g,22+A.hx,12+hb,4,4,skin); px(g,22+A.hx,12+hb,4,1,skinL); px(g,23+A.hx,13+hb,2,2,skinD);
  px(g,6+A.hx,15+hb,2,2,gold); px(g,6+A.hx,15+hb,1,1,goldL);
  // horns: curved + rings + tips + shine
  px(g,6+A.hx,2+hb,4,7,horn); px(g,6+A.hx,2+hb,1,7,hornD); px(g,6+A.hx,2+hb,4,1,"#fff");
  px(g,22+A.hx,2+hb,4,7,horn); px(g,25+A.hx,2+hb,1,7,hornD); px(g,22+A.hx,2+hb,4,1,"#fff");
  px(g,6+A.hx,4+hb,4,1,hornD); px(g,6+A.hx,6+hb,4,1,hornD); px(g,22+A.hx,4+hb,4,1,hornD); px(g,22+A.hx,6+hb,4,1,hornD);
  px(g,5+A.hx,1+hb,2,2,horn); px(g,25+A.hx,1+hb,2,2,horn); px(g,5+A.hx,1+hb,1,1,"#fff");
  // eyes: amber + slit + catchlight + brows + blush (goddess layout)
  px(g,12+A.hx,11+hb,3,1,"#3a2412"); px(g,17+A.hx,11+hb,3,1,"#3a2412");
  px(g,12+A.hx,12+hb,3,2,"#ffe14d"); px(g,17+A.hx,12+hb,3,2,"#ffe14d");
  px(g,12+A.hx,12+hb,3,1,"#fff2b0"); px(g,17+A.hx,12+hb,3,1,"#fff2b0");
  px(g,13+A.hx,12+hb,1,2,"#111"); px(g,18+A.hx,12+hb,1,2,"#111");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,11+A.hx,13+hb,2,1,"#e8a090"); px(g,19+A.hx,13+hb,2,1,"#e8a090");
  px(g,14+A.hx,14+hb,1,2,"#a06a3a"); px(g,16+A.hx,14+hb,1,1,"#8a5a33");
  // smirk + tooth (grin wider on atk)
  if(!P.atk){ px(g,14+A.hx,15+hb,4,1,"#5a1a1a"); px(g,16+A.hx,15+hb,1,1,"#fff"); }
  else{ px(g,13+A.hx,14+hb,6,2,"#3a0e0e"); px(g,14+A.hx,14+hb,1,2,"#fff"); px(g,17+A.hx,14+hb,1,2,"#fff"); px(g,15+A.hx,15+hb,2,1,"#ff8a8a"); }
  // panpipes FRONT: held to lips (rise on atk), hands grip sides
  {
    const qx=11+A.hx, qy=16+hb+(P.atk?-3:-1);
    for(let i=0;i<5;i++){ const rx=qx+i*2; px(g,rx,qy,1,5,"#8a5a33"); px(g,rx,qy,1,1,"#c9a06a"); px(g,rx,qy+4,1,1,gold); }
    px(g,9+A.lax,qy+1,3,3,skin); px(g,20+A.rax,qy+1,3,3,skin);
    px(g,9+A.lax,qy+1,1,3,skinL); px(g,22+A.rax,qy+1,1,3,skinD);
  }
};

/* ============ 3. SKELETON v7.1 — marrow archer (goddess bar, slim + gaps) ============ */
D.skeleton = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const bone=tint&&tint!=="#ffffff"?tint:"#e8e8e8";
  const dk=shade(bone,-38), deep="#8a8078", lite="#ffffff", crack="#5a554e";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const steel="#c9ccd4", steelD="#6a6e78";
  auraShadow(g,hb,"rgba(230,220,190,0.26)","rgba(255,217,61,0.10)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,gold]);
  // legs: slim femur + knee gap + shin + toe bones (separated)
  px(g,11+A.lx,28+A.ld,3,5,bone); px(g,11+A.lx,28+A.ld,1,5,lite); px(g,13+A.lx,28+A.ld,1,5,dk);
  px(g,18+A.rx,28+A.rd,3,5,bone); px(g,18+A.rx,28+A.rd,1,5,lite);
  px(g,11+A.lx,32+A.ld,3,1,crack); px(g,18+A.rx,32+A.rd,3,1,crack);
  px(g,11+A.lx,33+A.ld,3,4,bone); px(g,11+A.lx,33+A.ld,1,4,lite);
  px(g,18+A.rx,33+A.rd,3,4,bone); px(g,20+A.rx,33+A.rd,1,4,dk);
  px(g,10+A.lx,37+A.ld,5,1,bone); px(g,18+A.rx,37+A.rd,5,1,bone);
  px(g,10+A.lx,37+A.ld,1,1,lite); px(g,18+A.rx,37+A.rd,1,1,lite);
  // pelvis + spine + ribcage (slim, gapped ribs)
  px(g,12,25,8,4,bone); px(g,12,25,8,1,lite); px(g,12,28,8,1,dk);
  px(g,13,26,2,2,crack); px(g,17,26,2,2,crack);
  px(g,15,18,2,8,bone); px(g,15,18,1,8,lite);
  for(let i=0;i<4;i++){ const y=19+i*2; px(g,11,y,10,1,bone); px(g,11,y,2,1,lite); px(g,19,y,2,1,dk); }
  px(g,10,22,1,4,deep); px(g,21,22,1,4,deep);
  px(g,13,22,2,2,gold); px(g,17,22,2,2,"#c93b3b"); px(g,13,22,1,1,"#fff"); px(g,17,22,1,1,"#ff8a8a");
  // shroud sash + skull charms
  px(g,10,26,12,2,"#3a2e1e"); px(g,10,26,12,1,"#8a7a5a");
  px(g,12,27,2,2,"#e8e4d8"); px(g,15,27,2,2,"#e8e4d8"); px(g,18,27,2,2,"#e8e4d8");
  px(g,12,27,1,1,"#fff"); px(g,12,28,1,1,"#111"); px(g,15,28,1,1,"#111");
  // LEFT arm slim + shortbow + arrow
  px(g,7+A.lax,19+A.la,2,7,bone); px(g,7+A.lax,19+A.la,1,7,lite);
  px(g,6+A.lax,26+A.la,3,3,bone);
  const bw=P.atk?-2:0;
  px(g,3+A.lax,12+A.la+bw,2,16,"#5a3a22"); px(g,3+A.lax,12+A.la+bw,1,16,"#8a5a33");
  px(g,2+A.lax,11+A.la+bw,4,2,"#5a3a22"); px(g,2+A.lax,26+A.la+bw,4,2,"#5a3a22");
  px(g,3+A.lax,12+A.la+bw,1,14,"#e8e0d0");
  px(g,4+A.lax,18+A.la+bw,4,1,steel); px(g,4+A.lax,18+A.la,1,1,"#fff");
  // RIGHT arm slim + rusted blade
  const sw2=P.atk?-5:0;
  px(g,23+A.rax,19+A.ra+sw2,2,7,bone); px(g,23+A.rax,19+A.ra+sw2,1,7,lite);
  px(g,24+A.rax,11+A.ra+sw2,2,9,steel); px(g,24+A.rax,11+A.ra+sw2,1,9,lite); px(g,25+A.rax,11+A.ra+sw2,1,9,steelD);
  px(g,24+A.rax,11+A.ra+sw2,2,1,"#fff"); px(g,24+A.rax,15+A.ra+sw2,1,2,"#8a4a2a");
  px(g,23+A.rax,20+A.ra+sw2,3,2,"#8a5a33"); px(g,23+A.rax,22+A.ra+sw2,3,2,bone);
  // skull: narrower + cheek hollows + glowing eyes + teeth
  px(g,11+A.hx,7+hb,10,10,bone); px(g,11+A.hx,7+hb,10,2,lite); px(g,11+A.hx,15+hb,10,2,dk);
  px(g,11+A.hx,7+hb,1,10,deep); px(g,20+A.hx,7+hb,1,10,deep);
  px(g,10+A.hx,12+hb,1,4,dk); px(g,21+A.hx,12+hb,1,4,dk);
  px(g,12+A.hx,11+hb,3,4,"#0a0a0a"); px(g,17+A.hx,11+hb,3,4,"#0a0a0a");
  px(g,13+A.hx,12+hb,1,2,"#ff3b3b"); px(g,18+A.hx,12+hb,1,2,"#ff3b3b");
  px(g,13+A.hx,12+hb,1,1,"#fff"); px(g,18+A.hx,12+hb,1,1,"#fff");
  px(g,15+A.hx,13+hb,2,3,deep);
  px(g,12+A.hx,15+hb,8,2,"#b8ab98"); px(g,13+A.hx,15+hb,1,2,"#111"); px(g,15+A.hx,15+hb,1,2,"#111"); px(g,17+A.hx,15+hb,1,2,"#111"); px(g,19+A.hx,15+hb,1,2,"#111");
  px(g,13+A.hx,15+hb,1,1,"#fff");
  px(g,11+A.hx,9+hb,2,1,crack); px(g,18+A.hx,8+hb,2,1,crack);
  px(g,11+A.hx,5+hb,10,2,gold); px(g,11+A.hx,5+hb,10,1,goldL); px(g,11+A.hx,6+hb,10,1,goldD);
  px(g,15+A.hx,3+hb,2,3,bone); px(g,15+A.hx,3+hb,1,1,"#fff");
};

/* ============ 4. SPHINX CUB v7 — riddle cub (goddess bar) ============ */
D.sphinx_cub = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const coat=tint&&tint!=="#ffffff"?tint:"#d9b96a";
  const dk=shade(coat,-40), deep=shade(coat,-72), lite=shade(coat,32), pale=shade(coat,58);
  const skin="#e8bd85", skinD="#a06a4a", skinL="#ffe9c9";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const nemes="#2a6a9a", nemesL="#7fb0ff", nemesD="#1a3a5a";
  auraShadow(g,hb,"rgba(220,190,110,0.22)","rgba(255,217,61,0.10)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,gold]);
  const sw=Sg(P,0,1);
  // tail: lion + tuft (swishes)
  px(g,2+sw,22,4,3,coat); px(g,2+sw,22,4,1,lite);
  px(g,0+sw,20,3,4,deep); px(g,0+sw,20,3,1,gold); px(g,0+sw,20,1,1,"#fff");
  // hind + fore paws: large + toe beans + claws (trot)
  px(g,5+Q.x1,30+Q.d1,4,5,coat); px(g,5+Q.x1,30+Q.d1,1,5,lite);
  px(g,10+Q.x2,30+Q.d2,4,5,coat); px(g,10+Q.x2,30+Q.d2,1,5,lite);
  px(g,17+Q.x1,30+Q.d1,4,5,coat); px(g,22+Q.x2,30+Q.d2,4,5,coat);
  px(g,4+Q.x1,34+Q.d1,6,2,skin); px(g,4+Q.x1,34+A.lx,1,1,"#fff");
  px(g,9+Q.x2,34+Q.d2,6,2,skin); px(g,16+Q.x1,34+Q.d1,6,2,skin); px(g,21+Q.x2,34+Q.d2,6,2,skin);
  px(g,4+Q.x1,34+Q.d1,1,2,"#fff"); px(g,6+Q.x1,34+Q.d1,1,2,skinD);
  // body: barrel + back + belly + coat rows
  px(g,5,23,20,8,coat); px(g,5,23,20,2,lite); px(g,5,29,20,2,dk);
  px(g,5,23,2,8,deep); px(g,5,23,1,8,pale);
  for(let x=7;x<22;x+=3){ px(g,x,25,2,3,dk); px(g,x,25,1,1,lite); }
  px(g,7,25,8,1,"rgba(255,255,255,0.25)");
  px(g,12,29,4,1,pale);
  // collar: gold + lapis + jewel
  px(g,18,22,7,3,gold); px(g,18,22,7,1,goldL); px(g,18,24,7,1,goldD);
  px(g,20,22,2,2,nemes); px(g,23,22,1,2,"#c93b3b"); px(g,20,22,1,1,"#fff");
  // nemes headdress: striped band + lappets + gold brow
  px(g,20+A.hx,12+hb,12,4,nemes); px(g,20+A.hx,12+hb,12,1,nemesL); px(g,20+A.hx,15+hb,12,1,nemesD);
  px(g,20+A.hx,14+hb,2,2,gold); px(g,24+A.hx,14+hb,2,2,gold); px(g,28+A.hx,14+hb,2,2,gold);
  px(g,21+A.hx,14+hb,1,1,goldL); px(g,25+A.hx,14+hb,1,1,goldL);
  px(g,19+A.hx,15+hb,3,9,nemes); px(g,19+A.hx,15+hb,1,9,nemesL); px(g,29+A.hx,15+hb,3,9,nemes); px(g,31+A.hx,15+hb,1,9,nemesD);
  px(g,19+A.hx,23+hb,3,1,goldD); px(g,29+A.hx,23+hb,3,1,goldD);
  // human cub face: warm skin + blush + calm eyes + mouth
  px(g,21+A.hx,16+hb,9,9,skin); px(g,21+A.hx,16+hb,9,1,skinL); px(g,21+A.hx,23+hb,9,2,skinD);
  px(g,21+A.hx,16+hb,1,9,skinD); px(g,29+A.hx,16+hb,1,9,skinD);
  px(g,21+A.hx,19+hb,2,2,"#ffb0a0"); px(g,28+A.hx,19+hb,2,2,"#ffb0a0");
  px(g,22+A.hx,18+hb,3,1,"#3a2412"); px(g,26+A.hx,18+hb,3,1,"#3a2412");
  px(g,22+A.hx,19+hb,3,2,"#3a2018"); px(g,26+A.hx,19+hb,3,2,"#3a2018");
  px(g,22+A.hx,19+hb,3,1,"#5a3a22"); px(g,26+A.hx,19+hb,3,1,"#5a3a22");
  px(g,23+A.hx,19+hb,1,2,"#111"); px(g,27+A.hx,19+hb,1,2,"#111");
  px(g,22+A.hx,19+hb,1,1,"#fff"); px(g,26+A.hx,19+hb,1,1,"#fff");
  px(g,24+A.hx,21+hb,3,1,skinD); px(g,25+A.hx,22+hb,1,1,"#8a5a33");
  if(!P.atk){ px(g,24+A.hx,23+hb,3,1,"#a06a5a"); } else{ px(g,23+A.hx,23+hb,5,2,"#5a1a1a"); px(g,24+A.hx,23+hb,1,2,"#fff"); px(g,26+A.hx,23+hb,1,2,"#fff"); }
  // ears: lion + inner
  px(g,20+A.hx,13+hb,3,5,coat); px(g,20+A.hx,13+hb,1,5,lite); px(g,21+A.hx,14+hb,1,3,skinD);
  px(g,29+A.hx,13+hb,3,5,coat); px(g,31+A.hx,13+hb,1,5,deep);
  // wing nubs: tiny feathered (cub flightless)
  px(g,9,18,4,6,lite); px(g,9,18,4,1,"#fff"); px(g,9,20,1,4,dk);
  px(g,12,19,2,4,pale);
};

/* ============ 5. TANUKI v7 — jolly shapechanger (goddess bar) ============ */
D.tanuki = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const fur=tint&&tint!=="#ffffff"?tint:"#6a4a2a";
  const dk=shade(fur,-40), deep=shade(fur,-72), lite=shade(fur,32), pale=shade(fur,58);
  const cream="#e8e0d0", creamD="#9a968a";
  const gold="#ffd93d", goldL="#fff2b0", goldD="#8a6410";
  const leaf="#2f7a3a", leafL="#7ac97a";
  auraShadow(g,hb,"rgba(160,120,70,0.22)","rgba(255,217,61,0.08)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,gold]);
  const sw=Sg(P,0,1);
  // striped tail (bushy + rings)
  px(g,2+sw,22,5,4,fur); px(g,2+sw,22,5,1,lite); px(g,2+sw,24,5,1,deep);
  px(g,0+sw,21,3,5,deep); px(g,0+sw,21,3,1,cream); px(g,1+sw,22,1,3,cream);
  px(g,3+sw,22,1,4,creamD); px(g,0+sw,24,1,2,"#fff");
  // legs: short + feet + claws (waddle)
  px(g,9+Q.x1,30+Q.d1,4,5,fur); px(g,9+Q.x1,30+Q.d1,1,5,lite);
  px(g,19+Q.x2,30+Q.d2,4,5,fur); px(g,22+Q.x2,30+Q.d2,1,5,deep);
  px(g,8+Q.x1,34+Q.d1,6,2,deep); px(g,18+Q.x2,34+Q.d2,6,2,deep);
  px(g,8+Q.x1,34+Q.d1,6,1,cream); px(g,9+Q.x1,34+Q.d1,1,1,"#fff");
  // belly: big + cream apron + navel + fur rows
  px(g,7,22,18,9,fur); px(g,7,22,18,2,lite); px(g,7,29,18,2,dk);
  px(g,7,22,2,9,deep); px(g,23,22,2,9,deep);
  for(let x=9;x<22;x+=4){ px(g,x,24,2,4,dk); px(g,x,24,1,1,lite); }
  px(g,11,24,10,6,cream); px(g,11,24,10,1,"#fff"); px(g,11,28,10,2,creamD);
  px(g,15,26,2,2,skin0()); function skin0(){ return "#c9a06a"; }
  // arms: short + paws (one holds sake bottle, one waves on atk)
  px(g,4+A.lax,22+A.la,3,6,fur); px(g,4+A.lax,22+A.la,1,6,lite);
  px(g,25+A.rax,22+A.ra-(P.atk?3:0),3,6,fur); px(g,25+A.rax,22+A.ra-(P.atk?3:0),1,6,lite);
  px(g,4+A.lax,27+A.la,3,2,deep); px(g,25+A.rax,27+A.ra-(P.atk?3:0),3,2,deep);
  // sake bottle (footed gourd + label + cork)
  const bx=25+A.rax, by=24+A.ra-(P.atk?3:0);
  px(g,bx,by,3,6,"#8a5a33"); px(g,bx,by,1,6,"#c9a06a"); px(g,bx,by+2,3,2,cream); px(g,bx,by+2,3,1,"#fff");
  px(g,bx,by+3,1,1,"#c93b3b"); px(g,bx+1,by+3,1,1,"#2a6a9a");
  px(g,bx+1,by-1,1,2,"#e8e0d0");
  // head: round + mask band + muzzle + ears
  px(g,9+A.hx,8+hb,14,11,fur); px(g,9+A.hx,8+hb,14,2,lite); px(g,9+A.hx,17+hb,14,2,dk);
  px(g,9+A.hx,8+hb,2,11,deep); px(g,21+A.hx,8+hb,2,11,deep);
  px(g,10+A.hx,6+hb,3,5,fur); px(g,19+A.hx,6+hb,3,5,fur);
  px(g,10+A.hx,6+hb,3,1,lite); px(g,19+A.hx,6+hb,3,1,lite); px(g,11+A.hx,7+hb,1,3,cream); px(g,20+A.hx,7+hb,1,3,cream);
  // mask band: dark + white rim + cream brow
  px(g,10+A.hx,11+hb,12,5,"#2a1a10"); px(g,10+A.hx,11+hb,12,1,"#4a3320");
  px(g,10+A.hx,11+hb,12,1,cream); px(g,10+A.hx,15+hb,12,1,creamD);
  // eyes: big gold + pupil + catchlight + lash (goddess layout)
  px(g,12+A.hx,12+hb,3,3,"#ffe14d"); px(g,17+A.hx,12+hb,3,3,"#ffe14d");
  px(g,12+A.hx,12+hb,3,1,"#fff2b0"); px(g,17+A.hx,12+hb,3,1,"#fff2b0");
  px(g,13+A.hx,13+hb,1,2,"#111"); px(g,18+A.hx,13+hb,1,2,"#111");
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,17+A.hx,12+hb,1,1,"#fff");
  px(g,12+A.hx,11+hb,3,1,"#1a1410"); px(g,17+A.hx,11+hb,3,1,"#1a1410");
  // muzzle: cream + nose + smile + tooth
  px(g,13+A.hx,15+hb,6,3,cream); px(g,13+A.hx,15+hb,6,1,"#fff");
  px(g,15+A.hx,15+hb,2,2,"#111"); px(g,15+A.hx,15+hb,1,1,"#555");
  if(!P.atk){ px(g,14+A.hx,17+hb,4,1,"#5a2a1a"); px(g,16+A.hx,17+hb,1,1,"#fff"); }
  else{ px(g,13+A.hx,16+hb,6,3,"#3a0e0e"); px(g,14+A.hx,16+hb,1,3,"#fff"); px(g,17+A.hx,16+hb,1,3,"#fff"); px(g,15+A.hx,18+hb,2,1,"#ff8a8a"); }
  px(g,12+A.hx,16+hb,2,1,"#e8a090"); px(g,18+A.hx,16+hb,2,1,"#e8a090");
  // straw hat: wide brim + crown + band + leaf
  px(g,7+A.hx,2+hb,18,3,"#d9c27f"); px(g,7+A.hx,2+hb,18,1,"#f2e8b0"); px(g,7+A.hx,4+hb,18,1,"#8a7a4a");
  px(g,11+A.hx,0+hb,10,3,"#c9b26e"); px(g,11+A.hx,0+hb,10,1,"#f2e8b0");
  px(g,11+A.hx,2+hb,10,1,"#8a1a1a"); px(g,12+A.hx,2+hb,8,1,"#c93b3b");
  px(g,20+A.hx,0+hb,4,3,leaf); px(g,20+A.hx,0+hb,4,1,leafL); px(g,21+A.hx,1+hb,1,1,"#fff");
  px(g,9+A.hx,3+hb,2,1,"#fff"); px(g,15+A.hx,3+hb,3,1,"#b8a86a");
};

/* ============ 6. TIDE TURTLE v7 — tidewalker (goddess bar) ============ */
D.tide_turtle = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const shell=tint&&tint!=="#ffffff"?tint:"#3a7a5a";
  const dk=shade(shell,-42), deep=shade(shell,-72), lite=shade(shell,32), pale=shade(shell,58);
  const skin="#7ab88a", skinD="#2e4a38", skinL="#d9f2e0";
  const gold="#ffd93d", goldL="#fff2b0";
  const tide="#7ad9f0", tideL="#d8f4ff", tideD="#2a7a9a";
  const cream="#e8e0d0";
  auraShadow(g,hb,"rgba(90,180,140,0.24)","rgba(127,217,240,0.12)");
  spark(g,[3,16,lite],[28,12,"#fff"],[26,33,tide]);
  const pad=P.moving?[-1,-2,1,2][P.f&3]:(P.idle?-1:1);
  const eb=hb;
  // hind + front flippers: broad paddles + claws + tide glints
  px(g,2,25+pad,6,5,skin); px(g,2,25+pad,6,1,skinL); px(g,2,29+pad,6,1,skinD);
  px(g,24,25-pad,6,5,skin); px(g,24,25-pad,6,1,skinL); px(g,24,29-pad,6,1,skinD);
  px(g,2,25+pad,1,3,tide); px(g,7,26+pad,1,2,tideD); px(g,24,25-pad,1,3,tideL);
  px(g,3,30+pad,2,1,cream); px(g,25,30-pad,2,1,cream);
  // shell: tall dome + rim + 3 scutes + tide band + barnacles + cracks
  px(g,5,18,21,12,deep); px(g,6,17,19,4,shell); px(g,6,17,19,1,lite);
  px(g,6,19,19,9,shell); px(g,6,19,2,9,lite); px(g,23,19,2,9,deep);
  px(g,6,27,19,3,dk); px(g,6,27,19,1,"rgba(255,255,255,0.25)");
  for(let i=0;i<3;i++){ const sx=8+i*6; px(g,sx,20,4,6,dk); px(g,sx,20,4,1,lite); px(g,sx+1,21,2,5,deep); px(g,sx,20,1,1,"#fff"); px(g,sx+1,24,2,1,tideD); }
  px(g,7,24,17,3,tide); px(g,7,24,17,1,tideL); px(g,8,25,2,1,"#fff"); px(g,14,25,3,1,"#fff"); px(g,20,25,2,1,"#fff");
  px(g,6,22,2,3,gold); px(g,6,22,1,1,"#fff"); px(g,24,22,2,3,cream); px(g,24,22,1,1,"#fff");
  px(g,10,18,2,3,cream); px(g,16,17,3,2,cream); px(g,17,17,1,1,"#fff"); px(g,21,18,2,2,cream);
  // neck + belly folds
  px(g,18,26,8,4,skin); px(g,18,26,8,1,skinL); px(g,18,29,8,1,skinD);
  px(g,19,27,2,2,skinD); px(g,22,27,2,2,skinD);
  // head: tall + brow + wise gold eyes + beak + smile (front-side 3/4)
  px(g,20+A.hx,12+eb,10,12,shell); px(g,20+A.hx,12+eb,10,2,lite); px(g,20+A.hx,22+eb,10,2,dk);
  px(g,20+A.hx,12+eb,2,12,deep); px(g,28+A.hx,12+eb,2,12,deep);
  px(g,20+A.hx,13+eb,10,1,pale);
  px(g,22+A.hx,11+eb,3,3,deep); px(g,25+A.hx,11+eb,3,3,deep); px(g,22+A.hx,11+eb,3,1,lite);
  px(g,22+A.hx,15+eb,3,4,"#ffe14d"); px(g,26+A.hx,15+eb,3,4,"#ffe14d");
  px(g,22+A.hx,15+eb,3,1,"#fff2b0"); px(g,26+A.hx,15+eb,3,1,"#fff2b0");
  px(g,23+A.hx,16+eb,1,3,"#111"); px(g,27+A.hx,16+eb,1,3,"#111");
  px(g,22+A.hx,15+eb,1,1,"#fff"); px(g,26+A.hx,15+eb,1,1,"#fff");
  px(g,21+A.hx,14+eb,4,1,deep); px(g,25+A.hx,14+eb,4,1,deep);
  px(g,23+A.hx,19+eb,5,4,"#d9c9b8"); px(g,23+A.hx,19+eb,5,1,"#f2e8d8"); px(g,24+A.hx,20+eb,3,2,"#8a7a6a");
  px(g,23+A.hx,19+eb,1,4,"#fff"); px(g,27+A.hx,19+eb,1,4,skinD);
  if(!P.atk){ px(g,24+A.hx,22+eb,3,1,"#5a4a3a"); px(g,25+A.hx,22+eb,1,1,"#8a7a6a"); } else{ px(g,23+A.hx,21+eb,5,3,"#3a2a1a"); px(g,24+A.hx,21+eb,1,3,"#fff"); px(g,26+A.hx,21+eb,1,3,"#fff"); px(g,24+A.hx,23+eb,3,1,tide); }
  px(g,21+A.hx,21+eb,1,2,tide); px(g,29+A.hx,21+eb,1,2,tide);
};

/* ============ 7. UMBRAL STAG v7.1 — voidhart (goddess bar, rim-lit) ============ */
D.umbral_stag = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const coat=tint&&tint!=="#ffffff"?tint:"#3a4a5a";
  const dk=shade(coat,-28), deep=shade(coat,-52), lite=shade(coat,42), pale="#b0a0ff";
  const glow="#8a7ae8", glowL="#e0d4ff", glowD="#4a3a8a";
  auraShadow(g,hb,"rgba(130,130,250,0.28)","rgba(138,122,232,0.14)");
  spark(g,[3,16,pale],[28,12,"#fff"],[26,33,glow]);
  const sw=Sg(P,0,1);
  // tail + wisps brighter
  px(g,2+sw,22,3,4,coat); px(g,2+sw,22,3,1,lite); px(g,1+sw,25,4,2,glow); px(g,1+sw,25,2,1,"#fff");
  px(g,0+sw,19,2,3,glow); px(g,0+sw,19,1,1,"#fff"); px(g,4+sw,20,2,2,glowD);
  // legs: taller + rim + glowing hooves
  px(g,6+Q.x1,28+Q.d1,3,6,lite); px(g,6+Q.x1,28+Q.d1,1,6,"#fff"); px(g,8+Q.x1,28+Q.d1,1,6,deep);
  px(g,11+Q.x2,28+Q.d2,3,6,lite); px(g,17+Q.x1,28+Q.d1,3,6,lite); px(g,22+Q.x2,28+Q.d2,3,6,lite);
  px(g,6+Q.x1,33+Q.d1,3,2,deep); px(g,22+Q.x2,33+Q.d2,3,2,deep);
  px(g,6+Q.x1,33+Q.d1,3,1,glow); px(g,11+Q.x2,33+Q.d2,3,1,glow); px(g,22+Q.x2,33+Q.d2,3,1,glow); px(g,6+Q.x1,33+Q.d1,1,1,"#fff");
  px(g,6+Q.x1,35+Q.d1,3,1,"#0a0a12");
  // body: brighter barrel + strong top light + stars
  px(g,5,23,20,7,coat); px(g,5,23,20,2,"#d0c8ff"); px(g,5,23,20,1,"#fff"); px(g,5,28,20,2,deep);
  px(g,5,23,2,7,lite); px(g,5,23,1,7,"#fff");
  for(let x=7;x<22;x+=4){ px(g,x,25,2,2,deep); px(g,x,25,1,1,lite); }
  px(g,8,26,2,2,glow); px(g,8,26,1,1,"#fff"); px(g,14,25,1,1,"#fff"); px(g,18,26,2,1,pale); px(g,19,26,1,1,"#fff"); px(g,11,27,1,1,glowL); px(g,15,26,2,1,glowL);
  px(g,9,29,5,1,glowD); px(g,16,29,5,1,glow);
  // neck + bright mane
  px(g,19,18,6,8,coat); px(g,19,18,6,1,"#fff"); px(g,19,18,2,8,lite); px(g,23,18,2,8,deep);
  px(g,18,18,2,8,glow); px(g,18,18,1,8,"#fff"); px(g,18,22,1,2,glowL);
  // head: larger + pale brow + big violet eyes
  px(g,19,12,10,10,coat); px(g,19,12,10,2,lite); px(g,19,12,10,1,"#fff"); px(g,19,20,10,2,deep);
  px(g,19,12,2,10,deep); px(g,27,12,2,10,deep);
  px(g,20,13,8,1,pale);
  px(g,21,16,3,4,pale); px(g,25,16,3,4,pale);
  px(g,21,16,3,1,"#fff"); px(g,25,16,3,1,"#fff");
  px(g,22,17,1,3,"#0a0a12"); px(g,26,17,1,3,"#0a0a12");
  px(g,21,16,1,1,"#fff"); px(g,25,16,1,1,"#fff");
  px(g,21,15,3,1,deep); px(g,25,15,3,1,deep);
  px(g,23,19,5,3,"#1a1426"); px(g,23,19,5,1,"#3a2a5a"); px(g,24,20,1,1,"#8a7ae8"); px(g,26,20,1,1,"#555");
  px(g,23,21,5,1,"#0a0a12"); px(g,24,21,1,1,glow);
  // antlers: taller beams + more tines + bright tips
  px(g,20,3,3,10,glow); px(g,20,3,1,10,"#fff"); px(g,22,3,1,10,glowD);
  px(g,24,3,3,10,glow); px(g,24,3,1,10,"#fff");
  px(g,18,7,3,2,pale); px(g,20,6,6,2,pale); px(g,24,8,5,2,pale); px(g,18,7,1,1,"#fff"); px(g,25,6,1,1,"#fff"); px(g,27,4,1,2,"#fff");
  px(g,17,5,2,4,glowD); px(g,27,2,2,4,glowD); px(g,17,5,1,1,"#fff"); px(g,28,2,1,1,"#fff");
  px(g,21,4,1,2,"#ffd93d"); px(g,25,4,1,2,"#ffd93d");
  px(g,12,24,3,3,glowD); px(g,13,25,1,1,"#fff");
};

/* ============ 8. UMBRAL WYRM v7.1 — void dragon (goddess bar, bright sail) ============ */
D.umbral_wyrm = (g,tint,ph)=>{
  const P=P_of(ph), hb=Hb_of(P);
  const body=tint&&tint!=="#ffffff"?tint:"#3a2a5a";
  const dk=shade(body,-10), deep="#0c0618", lite="#9a7ae8", pale="#c8b8ff", star="#ffffff";
  const horn="#e8e0d0", hornD="#9a968a";
  const gold="#ffd93d";
  auraShadow(g,hb,"rgba(140,110,255,0.30)","rgba(138,122,232,0.14)");
  spark(g,[3,14,star],[28,10,"#fff"],[26,33,pale]);
  const WA=Wflap(P), w0=Sg(P,0,1), w1=Sg(P,2,1);
  // wings: broad sails + violet rims + stars + claws (drawn wide)
  for(const s of [-1,1]){
    g.save(); g.translate(s<0?11:21,24); g.rotate(s<0?WA:-WA); g.translate(s<0?-11:-21,-24);
    g.fillStyle=s<0?"#3a2a6a":"#3a2a6a";
    g.beginPath(); if(s<0){ g.moveTo(11,24); g.lineTo(1,4); g.lineTo(3,12); g.lineTo(6,10); g.lineTo(8,18); } else { g.moveTo(21,24); g.lineTo(31,4); g.lineTo(29,12); g.lineTo(26,10); g.lineTo(24,18); } g.fill();
    g.restore();
    px(g,s<0?2:27,6,3,8,lite); px(g,s<0?2:27,6,3,1,"#fff");
    px(g,s<0?1:28,4,2,2,horn); px(g,s<0?1:28,4,1,1,"#fff");
    px(g,s<0?4:26,9,1,2,"#fff"); px(g,s<0?6:24,13,1,1,pale);
  }
  g.fillStyle="rgba(154,122,232,0.35)"; g.beginPath(); g.arc(6,10,4,0,7); g.fill(); g.beginPath(); g.arc(26,10,4,0,7); g.fill();
  // body coils brighter + starfield
  px(g,6+w0,28,19,6,"#2a1e4a"); px(g,6+w0,28,19,1,lite); px(g,6+w0,28,19,1,"#fff"); px(g,6+w0,32,19,2,deep);
  for(let x=7;x<23;x+=3){ px(g,x+w0,29,2,2,"#4a3a7a"); px(g,x+w0,29,1,1,lite); }
  px(g,8+w0,29,2,2,pale); px(g,8+w0,29,1,1,"#fff"); px(g,13+w0,30,2,2,star); px(g,14+w0,30,1,1,"#7a5ad0"); px(g,18+w0,29,2,2,pale); px(g,19+w0,29,1,1,"#fff");
  px(g,20+w1,15,7,14,"#2a1e4a"); px(g,20+w1,15,2,14,deep); px(g,25+w1,15,2,14,deep);
  px(g,20+w1,15,7,1,lite); px(g,20+w1,15,7,1,"#fff"); px(g,20+w1,25,7,2,deep);
  px(g,21+w1,18,1,4,star); px(g,23+w1,22,1,2,pale); px(g,22+w1,20,1,1,"#fff");
  px(g,19+w1,16,2,5,lite); px(g,19+w1,16,2,1,"#fff");
  // head: larger + brow + big glowing eye + jaw
  px(g,17+w1,7+hb,11,8,"#4a3a7a"); px(g,17+w1,7+hb,11,2,lite); px(g,17+w1,7+hb,11,1,"#fff"); px(g,17+w1,13+hb,11,2,deep);
  px(g,17+w1,7+hb,2,8,deep); px(g,26+w1,7+hb,2,8,deep);
  px(g,13+w1,4+hb,4,3,horn); px(g,13+w1,4+hb,4,1,"#fff"); px(g,24+w1,3+hb,4,3,horn); px(g,24+w1,3+hb,4,1,"#fff");
  px(g,19+w1,8+hb,6,5,"#0a0618"); px(g,19+w1,8+hb,6,1,lite);
  px(g,20+w1,9+hb,4,3,"#ffffff"); px(g,21+w1,10+hb,2,2,"#0c0618"); px(g,20+w1,9+hb,1,1,"#fff"); px(g,23+w1,9+hb,1,1,pale);
  px(g,21+w1,10+hb,1,1,"#b06aff");
  if(!P.atk){ px(g,19+w1,13+hb,7,2,deep); px(g,20+w1,13+hb,1,2,horn); px(g,24+w1,13+hb,1,2,horn); }
  else{ px(g,19+w1,13+hb,3,4,deep); px(g,23+w1,13+hb,3,4,deep); px(g,20+w1,14+hb,1,3,horn); px(g,24+w1,14+hb,1,3,horn); px(g,21+w1,15+hb,3,1,"#ff4a6a"); }
  px(g,18+w1,15+hb,2,2,pale); px(g,27+w1,15+hb,2,2,pale);
  px(g,15+w1,25+hb,2,2,gold); px(g,15+w1,25+hb,1,1,"#fff");
};
function Wflap(P){ try{ return (window.Anim&&window.Anim.flap?window.Anim.flap(P):0); }catch(e){ return 0; } }

/* ============ 9. VELOCIRAPTOR v7 — pack hunter (goddess bar) ============ */
D.velociraptor = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  let Q={d1:0,d2:0,x1:0,x2:0}; try{ Q=window.Anim.quad(P); }catch(e){}
  const hide=tint&&tint!=="#ffffff"?tint:"#c96b4a";
  const dk=shade(hide,-40), deep=shade(hide,-72), lite=shade(hide,32), pale=shade(hide,58);
  const cream="#e8d9b8", creamD="#8a7a5a";
  const gold="#ffe14d";
  auraShadow(g,hb,"rgba(220,120,70,0.22)","rgba(255,217,61,0.08)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,gold]);
  const sw=Sg(P,0,1);
  // tail: long counter-balance + stripes + tuft
  px(g,2+sw,20,6,3,hide); px(g,2+sw,20,6,1,lite); px(g,2+sw,22,6,1,dk);
  px(g,0+sw,19,3,4,deep); px(g,0+sw,19,3,1,cream); px(g,1+sw,20,1,2,deep);
  px(g,4+sw,20,2,2,deep); px(g,7+sw,20,2,1,deep);
  px(g,0+sw,19,1,1,"#fff");
  // legs: powerful thighs + shins + sickle claws (run cycle)
  px(g,10+A.lx,27+A.ld,5,5,hide); px(g,10+A.lx,27+A.ld,1,5,lite); px(g,14+A.lx,27+A.ld,1,5,deep);
  px(g,17+A.rx,27+A.rd,5,5,hide); px(g,17+A.rx,27+A.rd,1,5,lite);
  px(g,10+A.lx,31+A.ld,4,3,hide); px(g,17+A.rx,31+A.rd,4,3,hide);
  px(g,9+A.lx,34+A.ld,6,2,deep); px(g,16+A.rx,34+A.rd,6,2,deep);
  px(g,9+A.lx,34+A.ld,6,1,creamD); px(g,10+A.lx,34+A.ld,2,1,"#fff");
  px(g,19+A.rx,32+A.rd,4,2,steel0()); function steel0(){ return "#c9ccd4"; } px(g,19+A.rx,32+A.rd,4,1,"#fff"); px(g,20+A.rx,33+A.rd,1,1,"#6a6e78");
  px(g,11+A.lx,29+A.ld,3,1,"rgba(0,0,0,0.25)"); px(g,18+A.rx,29+A.rd,3,1,"rgba(0,0,0,0.25)");
  // body: lean barrel + back stripe + scale rows + belly
  px(g,8,23,16,7,hide); px(g,8,23,16,2,lite); px(g,8,23,16,1,"#fff"); px(g,8,28,16,2,dk);
  px(g,8,23,2,7,deep); px(g,8,23,1,7,pale);
  for(let x=10;x<22;x+=3){ px(g,x,25,2,2,dk); px(g,x,25,1,1,lite); }
  px(g,10,23,8,1,deep); px(g,11,24,6,1,"#8a3a2a");
  px(g,11,28,6,1,cream); px(g,12,29,4,1,pale);
  // arms: small + two-clawed (reach on atk)
  const ar=P.atk?-2:0;
  px(g,18+A.lax,23+A.la+ar,3,5,lite); px(g,18+A.lax,23+A.la+ar,1,5,"#fff"); px(g,20+A.lax,23+A.la+ar,1,5,deep);
  px(g,18+A.lax,27+A.la+ar,1,2,cream); px(g,20+A.lax,27+A.la+ar,1,2,cream);
  // feather crest + nape
  px(g,14,18,6,3,deep); px(g,14,18,6,1,"#ff9d5a"); px(g,15,18,1,1,"#fff"); px(g,17,18,1,1,"#fff");
  px(g,13,19,2,3,hide); px(g,13,19,2,1,lite);
  // head: long snout + brow + gold slit eyes + teeth
  px(g,15,14,10,8,hide); px(g,15,14,10,2,lite); px(g,15,14,10,1,"#fff"); px(g,15,20,10,2,dk);
  px(g,15,14,2,8,deep);
  px(g,22,17,5,4,cream); px(g,22,17,5,1,"#fff"); px(g,23,18,3,2,"#111"); px(g,24,19,1,1,"#555");
  px(g,17,15,3,3,gold); px(g,17,15,3,1,"#fff2b0"); px(g,18,16,1,2,"#111"); px(g,17,15,1,1,"#fff");
  px(g,16,14,4,1,deep);
  if(!P.atk){ px(g,22,20,5,1,"#3a1a10"); px(g,23,20,1,1,"#fff"); px(g,25,20,1,1,"#fff"); }
  else{ px(g,22,19,5,3,"#3a0e0e"); px(g,23,19,1,3,"#fff"); px(g,25,19,1,3,"#fff"); px(g,23,21,3,1,"#ff8a8a"); }
  px(g,16,18,1,2,deep); px(g,22,16,5,1,"#a04a2a");
  px(g,20,12,3,3,deep); px(g,20,12,3,1,lite);
};

/* ============ 10. YETI v7 — mountain shy apex (goddess bar) ============ */
D.yeti = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const fur=tint&&tint!=="#ffffff"?tint:"#dfe9f2";
  const dk=shade(fur,-50), shag=shade(fur,-20), lite="#ffffff", deep=shade(fur,-70);
  const skin="#9ab8cc", skinD="#5a7a8a";
  auraShadow(g,hb,"rgba(200,230,255,0.24)","rgba(255,255,255,0.10)");
  spark(g,[3,18,lite],[28,14,"#fff"],[26,33,"#7fc4ff"]);
  // legs: stompy + fur cuffs + ice claws
  px(g,9+A.lx,31+A.ld,5,4,shag); px(g,9+A.lx,31+A.ld,5,1,lite);
  px(g,18+A.rx,31+A.rd,5,4,shag); px(g,18+A.rx,31+A.rd,5,1,lite);
  px(g,8+A.lx,35+A.ld,7,2,"#3a3a44"); px(g,17+A.rx,35+A.rd,7,2,"#3a3a44");
  px(g,8+A.lx,35+A.ld,7,1,lite); px(g,9+A.lx,35+A.ld,2,1,"#7fc4ff"); px(g,18+A.rx,35+A.rd,2,1,"#7fc4ff");
  px(g,8+A.lx,33+A.ld,7,1,skin); px(g,17+A.rx,33+A.rd,7,1,skin);
  // torso: wide shoulders + taper + shag rows + snow
  px(g,7,16,18,6,fur); px(g,7,16,18,1,lite); px(g,7,16,18,1,"#fff");
  px(g,7,16,2,15,shag); px(g,23,16,2,15,dk);
  px(g,9,22,14,9,fur); px(g,9,22,2,9,shag); px(g,21,22,2,9,dk);
  px(g,9,22,14,1,"#fff"); px(g,9,30,14,2,dk);
  px(g,10,17,2,10,lite); px(g,14,17,2,8,shade(fur,12)); px(g,18,17,2,10,lite); px(g,12,19,2,4,"#fff"); px(g,17,19,2,4,"#fff");
  px(g,13,24,6,3,skin); px(g,14,25,4,2,"#d9f2ff"); px(g,14,25,4,1,"#fff");
  // arms: separated + shag + ice claws
  px(g,6,17,1,12,dk); px(g,25,17,1,12,dk);
  px(g,2+A.lax,17+A.la,4,12,shag); px(g,2+A.lax,17+A.la,4,2,lite); px(g,2+A.lax,17+A.la,1,12,"#fff");
  px(g,26+A.rax,17+A.ra,4,12,shag); px(g,26+A.rax,17+A.ra,4,2,lite);
  px(g,2+A.lax,27+A.la,4,3,lite); px(g,26+A.rax,27+A.ra,4,3,lite);
  px(g,2+A.lax,30+A.la,1,2,skinD); px(g,4+A.lax,30+A.la,1,2,"#fff"); px(g,26+A.rax,30+A.ra,1,2,skinD);
  // head: snowcap + heavy brow + glowing cyan eyes + fanged jaw
  px(g,10+A.hx,4+hb,12,2,lite); px(g,10+A.hx,4+hb,12,1,"#fff");
  px(g,9+A.hx,5+hb,14,3,shag); px(g,9+A.hx,5+hb,14,1,lite);
  px(g,9+A.hx,5+hb,2,9,shag); px(g,21+A.hx,5+hb,2,9,dk);
  px(g,11+A.hx,6+hb,10,8,fur); px(g,11+A.hx,6+hb,10,1,"#fff");
  px(g,11+A.hx,8+hb,10,3,dk); px(g,11+A.hx,8+hb,10,1,skinD);
  px(g,12+A.hx,9+hb,3,4,"#0a1a24"); px(g,17+A.hx,9+hb,3,4,"#0a1a24");
  px(g,13+A.hx,10+hb,2,2,"#7fc4ff"); px(g,18+A.hx,10+hb,2,2,"#7fc4ff");
  px(g,13+A.hx,10+hb,1,1,"#fff"); px(g,18+A.hx,10+hb,1,1,"#fff");
  px(g,12+A.hx,9+hb,3,1,"#fff"); px(g,17+A.hx,9+hb,3,1,"#fff");
  px(g,13+A.hx,13+hb,6,2,skin); px(g,15+A.hx,14+hb,2,1,skinD);
  if(!P.atk){ px(g,12+A.hx,14+hb,8,3,"#3a2a34"); px(g,13+A.hx,14+hb,2,3,"#fff"); px(g,17+A.hx,14+hb,2,3,"#fff"); px(g,15+A.hx,15+hb,2,1,"#ffb0a0"); }
  else{ px(g,11+A.hx,14+hb,10,5,"#2a1a24"); px(g,12+A.hx,14+hb,2,4,"#fff"); px(g,15+A.hx,14+hb,1,4,"#fff"); px(g,18+A.hx,14+hb,2,4,"#fff"); px(g,14+A.hx,17+hb,4,1,"#ff8a8a"); }
  px(g,8+A.hx,14+hb,4,2,dk); px(g,20+A.hx,14+hb,4,2,dk);
  px(g,10+A.hx,6+hb,2,2,"#fff"); px(g,19+A.hx,6+hb,2,2,"#fff");
};

/* ============ 11. YUKI-ONNA v7 — snow woman (goddess bar) ============ */
D.yuki_onna = (g,tint,ph)=>{
  const P=P_of(ph), A=A_of(P), hb=Hb_of(P);
  const robe=tint&&tint!=="#ffffff"?tint:"#e0f0ff";
  const dk=shade(robe,-30), deep=shade(robe,-62), lite="#ffffff";
  const skin="#f7d7d7", skinD="#c99a9a", skinS="#ffe9e9";
  const hair="#111118", hairL="#3a3a4a";
  const obi="#2a4ad0", obiL="#7a9bff", obiD="#1a2a8a";
  const gold="#ffd93d", goldL="#fff2b0";
  auraShadow(g,hb,"rgba(180,220,255,0.24)","rgba(180,220,255,0.10)");
  spark(g,[3,18,"#bfe8ff"],[28,14,"#fff"],[26,33,"#bfe8ff"]);
  const fl=Sg(P,0,1), fl2=Sg(P,1,1);
  // floating hem + snow tatters
  px(g,10+fl,28,3,8,robe); px(g,10+fl,28,1,8,dk); px(g,10+fl,35,3,1,lite);
  px(g,14-fl,28,2,6,robe); px(g,17+fl,28,4,8,robe); px(g,17+fl,28,1,8,dk); px(g,17+fl,35,4,1,lite);
  px(g,22-fl,28,2,7,robe); px(g,22-fl,34,2,1,dk);
  // gown: white-blue + folds + snow pattern + obi + fur collar
  px(g,11,16,10,13,robe); px(g,11,16,10,1,lite); px(g,11,27,10,2,dk);
  px(g,11,16,2,13,dk); px(g,19,16,2,13,deep);
  px(g,13,17,1,11,"rgba(120,160,200,0.45)"); px(g,15,17,1,11,"rgba(255,255,255,0.6)"); px(g,17,17,1,11,"rgba(120,160,200,0.45)");
  px(g,13,19,2,2,"#bfe8ff"); px(g,17,19,2,2,"#bfe8ff"); px(g,13,19,1,1,"#fff"); px(g,15,22,2,2,obi); px(g,15,22,1,1,obiL);
  px(g,11,22,10,2,obi); px(g,11,22,10,1,obiL); px(g,11,23,10,1,obiD);
  px(g,14,22,4,2,gold); px(g,15,23,2,1,obiD); px(g,14,22,1,1,goldL);
  px(g,11,16,10,2,"#f2f6ff"); px(g,12,16,8,1,"#d9e8f8");
  // arms: long sleeves + hands (wail on atk)
  const ar=P.atk?-3:0;
  px(g,6+fl,16+A.la+ar,3,8,robe); px(g,6+fl,16+A.la+ar,1,8,lite);
  px(g,23-fl,16+A.ra+ar,3,8,robe); px(g,25-fl,16+A.ra+ar,1,8,deep);
  px(g,6+fl,23+A.la+ar,3,2,skin); px(g,23-fl,23+A.ra+ar,3,2,skin);
  px(g,6+fl,25+A.la+ar,1,2,lite); px(g,24-fl,25+A.ra+ar,1,2,lite);
  // hair: long black + snow strands + blue shade + kanzashi
  px(g,8+A.hx,3+hb,3,15,hair); px(g,8+A.hx,3+hb,1,15,hairL); px(g,21+A.hx,3+hb,3,15,hair); px(g,23+A.hx,3+hb,1,15,hairL);
  px(g,8+A.hx,3+hb,16,2,hair); px(g,8+A.hx,3+hb,16,1,"#2a2a3a");
  px(g,9+A.hx,5+hb,1,10,"#7ad9f0"); px(g,22+A.hx,5+hb,1,10,"#7ad9f0"); px(g,9+A.hx,5+hb,1,1,"#fff");
  px(g,10+A.hx,2+hb,2,2,gold); px(g,10+A.hx,2+hb,1,1,"#fff"); px(g,20+A.hx,2+hb,2,3,"#ff9dc9"); px(g,20+A.hx,2+hb,1,1,"#fff");
  // face: pale + blush + dark eyes with snow glint + red lips
  px(g,11+A.hx,7+hb,10,9,skin); px(g,11+A.hx,7+hb,10,1,skinS); px(g,11+A.hx,14+hb,10,2,skinD);
  px(g,11+A.hx,7+hb,1,9,skinD); px(g,20+A.hx,7+hb,1,9,skinD);
  px(g,11+A.hx,11+hb,2,2,"#ffb0c0"); px(g,19+A.hx,11+hb,2,2,"#ffb0c0");
  px(g,12+A.hx,9+hb,3,1,"#2a1a1a"); px(g,17+A.hx,9+hb,3,1,"#2a1a1a");
  px(g,12+A.hx,10+hb,3,3,"#0a1a24"); px(g,17+A.hx,10+hb,3,3,"#0a1a24");
  px(g,13+A.hx,11+hb,1,2,"#bfe8ff"); px(g,18+A.hx,11+hb,1,2,"#bfe8ff");
  px(g,12+A.hx,10+hb,1,1,"#fff"); px(g,17+A.hx,10+hb,1,1,"#fff");
  px(g,14+A.hx,13+hb,2,2,"#c99a9a"); px(g,15+A.hx,14+hb,1,1,"#8a5a5a");
  if(!P.atk){ px(g,14+A.hx,15+hb,4,1,"#c02040"); px(g,15+A.hx,15+hb,2,1,"#ff6a8a"); }
  else{ px(g,13+A.hx,14+hb,6,3,"#0a0a12"); px(g,14+A.hx,15+hb,4,2,"#3a1a2a"); px(g,15+A.hx,16+hb,2,1,"#7ad9f0"); }
  // snow freckles + breath mist (cold)
  px(g,12+A.hx,12+hb,1,1,"#fff"); px(g,18+A.hx,12+hb,1,1,"#fff");
  if(P.atk){ px(g,10+A.hx,15+hb,1,2,"#bfe8ff"); px(g,21+A.hx,15+hb,1,2,"#bfe8ff"); }
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
    const ck="R11|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
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
