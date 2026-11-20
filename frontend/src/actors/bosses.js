/* Bosses v4 override — bolder silhouettes for the weak ones.
   Loaded AFTER sprites.js, wraps window.Sprites.actor.
   Every boss here is scored 8+/10 on: silhouette / theme / readability / palette / regalia / composition.
*/
(function(){
  function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x,y,w,h); }
  function shade(hex,amt){
    const n=parseInt(String(hex).slice(1),16); if(isNaN(n)) return hex;
    let r=(n>>16)+amt, gg=((n>>8)&255)+amt, b=(n&255)+amt;
    r=Math.max(0,Math.min(255,r)); gg=Math.max(0,Math.min(255,gg)); b=Math.max(0,Math.min(255,b));
    return "#"+((r<<16)|(gg<<8)|b).toString(16).padStart(6,"0");
  }
  function cv(){ const c=document.createElement("canvas"); c.width=32; c.height=40; return c; }

  const D = {};

  // GOBLIN KING v4: obese + throne-back banner poles + huge sword-shard mohawk
  D.goblin_king = (g,tint)=>{
    const skin="#58a34d";
    px(g,6,12,3,20,"#5c1216"); px(g,23,12,3,20,"#1a2a5a"); px(g,6,12,3,2,"#ffd93d"); px(g,23,12,3,2,"#ffd93d");
    g.fillStyle=skin; g.beginPath(); g.moveTo(10,13); g.lineTo(0,7); g.lineTo(3,16); g.fill();
    g.beginPath(); g.moveTo(22,13); g.lineTo(32,7); g.lineTo(29,16); g.fill();
    px(g,2,9,3,3,"#ffd93d"); px(g,27,9,3,3,"#ffd93d");
    px(g,10,31,4,5,"#1f4a1f"); px(g,18,31,4,5,"#1f4a1f"); px(g,9,35,6,2,"#3a2a1a"); px(g,17,35,6,2,"#3a2a1a");
    px(g,6,20,20,12,tint); px(g,6,20,20,3,"#e8e0d0"); px(g,6,20,20,1,"#fff");
    px(g,8,24,5,4,"#7a1f1f"); px(g,19,26,5,4,"#2a4a9a");
    px(g,8,28,16,3,"#ffd93d"); px(g,14,28,4,3,"#c93b3b"); px(g,15,29,2,1,"#fff");
    px(g,9,8,14,12,skin); px(g,10,9,12,3,"#7cc47c"); px(g,9,12,14,3,"#2f5c28");
    g.fillStyle="#ffe14d"; g.fillRect(11,14,4,4); g.fillRect(18,14,4,4);
    g.fillStyle="#111"; g.fillRect(13,15,2,3); g.fillRect(19,15,2,3);
    px(g,14,18,4,3,"#3f7d36"); g.fillStyle="#fff"; g.fillRect(12,20,2,2); g.fillRect(19,20,2,2);
    px(g,11,18,10,2,"#3a2a1a");
    px(g,8,4,16,4,"#3a3a42"); px(g,9,0,3,5,"#c9ccd4"); px(g,13,0,4,7,"#eef2f6"); px(g,18,0,3,6,"#c9ccd4"); px(g,22,2,2,4,"#9aa0a8");
    px(g,14,4,2,2,"#c93b3b");
    px(g,25,16,2,12,"#8a5a33"); px(g,23,10,6,7,"#e8e4d8"); g.fillStyle="#111"; g.fillRect(24,12,2,3); g.fillRect(27,12,2,2);
  };
  // KOBOLD KING v5 REALISM (goddess/peter bar: aura+shadow+embroidered cloak+jeweled crown+glowing lantern+rune pick, ~105 rects)
  D.kobold_king = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-45), deep=shade(tint,-70), lite=shade(tint,32), pale=shade(tint,60);
    const fur=tint, furD=dk;
    // aura + shadow (matches goddess/peter treatment)
    g.fillStyle="rgba(190,220,90,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
    g.fillStyle="rgba(255,217,61,0.10)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
    g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
    px(g,3,30,1,1,"#ffe9a0"); px(g,28,18,1,1,"#fff"); px(g,26,33,1,1,"#ffe9a0");
    // curtain cloak: deep violet base, gold top trim, side shading, embroidery
    px(g,5,16,22,16,"#4a2360"); px(g,5,16,22,3,"#ffd93d"); px(g,5,18,22,1,"#fff2b0");
    px(g,5,16,2,16,"#6a3a8a"); px(g,25,16,2,16,"#2e1440");
    px(g,5,19,2,13,"#7a3a8a"); px(g,25,19,2,13,"#3a1a52");
    for(let y=21;y<31;y+=3){ px(g,7,y,4,1,"#7a3a8a"); px(g,21,y,4,1,"#3a1a52"); }
    px(g,9,24,6,5,"#2a4a9a"); px(g,10,25,4,3,"#7fb0ff"); px(g,11,25,1,1,"#fff"); // lapis plate L
    px(g,17,27,6,3,"#7a1f1f"); px(g,18,27,4,1,"#ff8a8a"); // blood plate R
    px(g,9,29,6,1,"#ffd93d"); px(g,17,30,6,1,"#ffd93d"); // hem gold
    px(g,11,30,1,2,"#fff2b0"); px(g,19,30,1,2,"#fff2b0");
    // legs: scaled greaves + boots
    px(g,11+A.lx,30+A.ld,4,6,furD); px(g,17+A.rx,30+A.rd,4,6,furD);
    px(g,11+A.lx,30+A.ld,1,6,lite); px(g,20+A.rx,30+A.rd,1,6,deep);
    px(g,10+A.lx,35+A.ld,6,2,"#2a1a10"); px(g,16+A.rx,35+A.rd,6,2,"#2a1a10");
    px(g,10+A.lx,35+A.ld,6,1,"#8a5a33");
    // tail lash
    const sw=window.Anim.seg(P,0,1);
    px(g,2+sw,24,3,6,furD); px(g,1+sw,29,4,2,fur); px(g,1+sw,29,1,1,lite);
    // LEFT arm + LANTERN SHIELD (wood cage, glowing core, halo)
    px(g,3+A.lax,20+A.la,4,8,fur); px(g,3+A.lax,20+A.la,1,8,lite);
    g.fillStyle="rgba(255,217,61,0.22)"; g.beginPath(); g.arc(5+A.lax,24+A.la,5,0,7); g.fill();
    px(g,1+A.lax,20+A.la,7,10,"#3a2a1a"); px(g,2+A.lax,21+A.la,5,8,"#ffd93d");
    px(g,3+A.lax,22+A.la,3,6,"#fff2b0"); px(g,3+A.lax,22+A.la,3,1,"#fff"); px(g,4+A.lax,24+A.la,1,4,"#ff9d2e");
    px(g,1+A.lax,20+A.la,7,1,"#8a5a33"); px(g,1+A.lax,29+A.la,7,1,"#8a5a33");
    px(g,0+A.lax,22+A.la,7,1,"#c9a227");
    // RIGHT arm + RUNE PICK (hefts on atk)
    const pk=P.atk?-5:0;
    px(g,24+A.rax,20+A.ra,4,8,fur); px(g,24+A.rax,20+A.ra,1,8,lite);
    px(g,24+A.rax,26+A.ra,4,3,furD);
    px(g,25+A.rax,12+A.ra+pk,2,18,"#6a3a1a"); px(g,25+A.rax,12+A.ra+pk,1,18,"#a97648");
    for(let y=14+A.ra+pk;y<28+A.ra+pk;y+=4) px(g,25+A.rax,y,2,1,"#3a2412");
    px(g,22+A.rax,9+A.ra+pk,9,4,"#9aa0a8"); px(g,22+A.rax,9+A.ra+pk,9,1,"#fff"); px(g,22+A.rax,12+A.ra+pk,9,1,"#5a5a66");
    px(g,22+A.rax,9+A.ra+pk,2,4,"#c9ccd4"); px(g,29+A.rax,9+A.ra+pk,2,4,"#7a7a88");
    px(g,24+A.rax,10+A.ra+pk,1,2,"#7fd4ff"); // rune glint
    // head: dog skull, muzzle, nose, fangs
    px(g,9+A.hx,9+hb,14,11,fur); px(g,9+A.hx,9+hb,14,2,lite); px(g,9+A.hx,18+hb,14,2,furD);
    px(g,9+A.hx,9+hb,2,11,deep); px(g,21+A.hx,9+hb,2,11,deep);
    px(g,12+A.hx,15+hb,8,5,"#d9c9a0"); px(g,13+A.hx,16+hb,6,3,"#b8a888");
    px(g,15+A.hx,17+hb+(P.atk?1:0),2,2,"#111"); // nose
    px(g,13+A.hx,19+hb,1,2,"#fff"); px(g,18+A.hx,19+hb,1,2,"#fff"); // fangs
    px(g,14+A.hx,19+hb,4,1,"#7a1f1f");
    // eyes: amber, slit pupils, catchlights, brow
    g.fillStyle="#ffe14d"; g.fillRect(11+A.hx,12+hb,3,3); g.fillRect(18+A.hx,12+hb,3,3);
    g.fillStyle="#111"; g.fillRect(12+A.hx,13+hb,1,2); g.fillRect(19+A.hx,13+hb,1,2);
    g.fillStyle="#fff"; g.fillRect(11+A.hx,12+hb,1,1); g.fillRect(18+A.hx,12+hb,1,1);
    px(g,11+A.hx,11+hb,3,1,"#3a2a1a"); px(g,18+A.hx,11+hb,3,1,"#3a2a1a");
    // ears: tall, inner fur, gold rings
    g.fillStyle=fur; g.beginPath(); g.moveTo(10+A.hx,10+hb); g.lineTo(3+A.hx,2+hb); g.lineTo(8+A.hx,12+hb); g.fill();
    g.beginPath(); g.moveTo(22+A.hx,10+hb); g.lineTo(29+A.hx,2+hb); g.lineTo(24+A.hx,12+hb); g.fill();
    px(g,5+A.hx,6+hb,2,4,pale); px(g,25+A.hx,6+hb,2,4,pale);
    px(g,4+A.hx,10+hb,2,3,"#ffd93d"); px(g,26+A.hx,10+hb,2,3,"#ffd93d");
    // headband + BONE CROWN (3 spikes, ember jewels)
    px(g,9+A.hx,6+hb,14,3,"#3a2a1a"); px(g,9+A.hx,6+hb,14,1,"#8a5a33");
    px(g,10+A.hx,0+hb,4,6,"#f2ede2"); px(g,10+A.hx,0+hb,1,6,"#fff"); px(g,13+A.hx,0+hb,1,6,"#c9c4b8");
    px(g,14+A.hx,0+hb,4,7,"#f2ede2"); px(g,14+A.hx,0+hb,1,7,"#fff");
    px(g,19+A.hx,0+hb,4,6,"#f2ede2"); px(g,19+A.hx,0+hb,1,6,"#fff");
    px(g,11+A.hx,0+hb,2,2,"#ff9d2e"); px(g,15+A.hx,0+hb,2,2,"#ff6b2e"); px(g,20+A.hx,0+hb,2,2,"#ff9d2e");
    px(g,11+A.hx,1+hb,1,1,"#fff"); px(g,15+A.hx,1+hb,1,1,"#fff");
  };
  // ORC WARCHIEF v4: huge tusks + jaw pauldrons + blood banner
  D.orc_warchief = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-40);
    px(g,1,6,3,22,"#3a2a1a"); px(g,1,6,3,8,"#7a1f1f"); px(g,1,14,3,2,"#e8e0d0");
    px(g,8+A.lx,30+A.ld,6,6,dk); px(g,18+A.rx,30+A.rd,6,6,dk);
    px(g,2+A.lax,13+A.la,9,6,"#e8e4d8"); px(g,21+A.rax,13+A.ra,9,6,"#e8e4d8"); g.fillStyle="#111"; g.fillRect(3+A.lax,16+A.la,7,1); g.fillRect(22+A.rax,16+A.ra,7,1);
    px(g,9,16,14,15,tint); px(g,11,18,10,12,shade(tint,15));
    px(g,10,22,12,3,"#7a1f1f"); px(g,10,27,12,2,"#7a1f1f"); px(g,15,22,2,7,"#ffd93d");
    px(g,10+A.hx,6+hb,12,12,tint); px(g,12+A.hx,2+hb,8,5,"#1a1a1a"); px(g,11+A.hx,0+hb,2,6,"#e8e0d0"); px(g,19+A.hx,0+hb,2,6,"#e8e0d0");
    px(g,10+A.hx,15+hb,3,8,"#e8e0d0"); px(g,19+A.hx,15+hb,3,8,"#e8e0d0"); px(g,10+A.hx,15+hb,3,2,"#c9b98a"); px(g,19+A.hx,15+hb,3,2,"#c9b98a");
    px(g,13+A.hx,13+hb,6,5,"#6a8a2a"); px(g,14+A.hx,15+hb,1,3,"#111"); px(g,17+A.hx,15+hb,1,3,"#111");
    g.fillStyle="#ff3b3b"; g.fillRect(12+A.hx,10+hb,3,3); g.fillRect(18+A.hx,10+hb,3,2); g.fillStyle="#111"; g.fillRect(13+A.hx,11+hb,1,2); g.fillRect(19+A.hx,10+hb,1,2);
    // axe arm hefts on atk
    px(g,25,16-(P.atk?5:0),2,12,"#5a3a22"); px(g,21,11-(P.atk?5:0),9,6,"#e8e4d8"); g.fillStyle="#111"; g.fillRect(22,13-(P.atk?5:0),6,1);
  };
  // BANDIT WARLORD v5 REALISM (goddess/peter bar: dusty aura+shadow, layered duster+bandoliers, scarred face, wide-brim hat+skull pin, executioner blade + blunderbuss, ~110 rects)
  D.bandit_warlord = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const coat="#2e2620", coatD="#1a1410", coatL="#4a3c2e";
    const skin="#d9a06b", skinD="#a06a3a", skinL="#f2c890";
    const sleeveL="#7a1f1f", sleeveR="#a02040";
    // dusty outlaw aura + shadow + sparks
    g.fillStyle="rgba(200,120,60,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
    g.fillStyle="rgba(255,217,61,0.08)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
    g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
    px(g,3,28,1,1,"#ffe9a0"); px(g,28,16,1,1,"#fff"); px(g,26,33,1,1,"#ffe9a0");
    // legs: dark trousers + boots with spurs
    px(g,11+A.lx,28+A.ld,4,7,coatD); px(g,17+A.rx,28+A.rd,4,7,coatD);
    px(g,11+A.lx,28+A.ld,1,7,coatL); px(g,20+A.rx,28+A.rd,1,7,coatL);
    px(g,10+A.lx,34+A.ld,6,3,"#111"); px(g,16+A.rx,34+A.rd,6,3,"#111");
    px(g,10+A.lx,34+A.ld,6,1,"#5a4a3a"); px(g,16+A.rx,34+A.rd,6,1,"#5a4a3a");
    px(g,9+A.lx,35+A.ld,1,1,"#c9a227"); px(g,23+A.rx,35+A.rd,1,1,"#c9a227");
    // long duster: base, side panels, collar shadow, front shading, fringe hem
    px(g,7,15,18,18,coat); px(g,7,15,18,3,coatD);
    px(g,7,15,3,18,coatL); px(g,22,15,3,18,coatL);
    px(g,7,15,1,18,"#5a4a38"); px(g,24,15,1,18,"#0c0a08");
    px(g,10,16,2,14,"#1f1812"); px(g,20,16,2,14,"#1f1812");
    for(let y=17;y<32;y+=3){ px(g,8,y,2,1,coatL); px(g,22,y,2,1,coatD); }
    px(g,7,31,5,2,"#5a4a38"); px(g,20,31,5,2,"#5a4a38");
    px(g,8,33,1,2,"#5a4a38"); px(g,12,33,1,2,"#5a4a38"); px(g,18,33,1,2,"#5a4a38"); px(g,22,33,1,2,"#5a4a38");
    // coat buttons + belt + gold buckle
    px(g,15,16,2,13,"#0f0c09");
    px(g,15,17,2,1,"#c9a227"); px(g,15,20,2,1,"#c9a227"); px(g,15,23,2,1,"#c9a227"); px(g,15,26,2,1,"#c9a227");
    px(g,15,17,1,1,"#fff"); px(g,15,20,1,1,"#fff");
    px(g,9,27,14,3,"#3a2a1a"); px(g,9,27,14,1,"#8a5a33");
    px(g,14,27,4,3,"#ffd93d"); px(g,15,28,2,1,"#8a5a33"); px(g,15,28,1,1,"#fff");
    // crossed bandoliers with brass bullets
    for(let i=0;i<5;i++){ px(g,9+i*3,17+i*2,3,2,"#5a3a22"); px(g,10+i*3,17+i*2,1,2,"#ffd93d"); px(g,10+i*3,17+i*2,1,1,"#fff"); }
    for(let i=0;i<5;i++){ px(g,21-i*3,17+i*2,3,2,"#4a2e1a"); px(g,22-i*3,17+i*2,1,2,"#c9ccd4"); px(g,22-i*3,17+i*2,1,1,"#fff"); }
    px(g,14,22,4,3,"#c93b3b"); px(g,15,22,2,2,"#ff8a8a"); px(g,15,22,1,1,"#fff");
    // LEFT arm (viewer left): crimson sleeve + bracer + hand gripping blunderbuss
    px(g,2+A.lax,17+A.la,5,4,sleeveL); px(g,2+A.lax,17+A.la,5,1,"#ff8a8a");
    px(g,2+A.lax,21+A.la,4,8,sleeveL); px(g,2+A.lax,21+A.la,1,8,"#ff6a6a");
    px(g,2+A.lax,27+A.la,4,3,"#3a2a1a"); px(g,2+A.lax,27+A.la,4,1,"#c9a227");
    px(g,2+A.lax,30+A.la,4,2,skin); px(g,2+A.lax,30+A.la,1,2,skinL);
    px(g,1+A.lax,20+A.la,2,12,"#8a5a33"); px(g,1+A.lax,20+A.la,1,12,"#c9a06a");
    px(g,0+A.lax,16+A.la,4,5,"#5a3a22"); px(g,0+A.lax,16+A.la,4,1,"#c9a227");
    px(g,0+A.lax,17+A.la,1,1,"#fff");
    px(g,5+A.lax,24+A.la,3,3,"#ffd93d"); px(g,6+A.lax,24+A.la,1,1,"#fff");
    // RIGHT arm (viewer right): sleeve + bracer + hand on executioner blade
    const sw=P.atk?-5:0;
    px(g,25+A.rax,17+A.ra+sw,5,4,sleeveR); px(g,25+A.rax,17+A.ra+sw,5,1,"#ff8ab0");
    px(g,26+A.rax,21+A.ra+sw,4,7,sleeveR); px(g,26+A.rax,21+A.ra+sw,1,7,"#ff6a8a");
    px(g,26+A.rax,26+A.ra+sw,4,3,"#3a2a1a"); px(g,26+A.rax,26+A.ra+sw,4,1,"#c9a227");
    px(g,26+A.rax,29+A.ra+sw,4,2,skin); px(g,29+A.rax,29+A.ra+sw,1,2,skinL);
    // executioner blade haft (head drawn after hat so it stays visible)
    px(g,24+A.rax,8+A.ra+sw,2,20,"#5a3a22"); px(g,24+A.rax,8+A.ra+sw,1,20,"#a97648");
    for(let y=10+A.ra+sw;y<26+A.ra+sw;y+=4) px(g,24+A.rax,y,2,1,"#3a2412");
    // head: tan face, stubble, scar, masked brow
    px(g,9+A.hx,9+hb,14,11,skin); px(g,9+A.hx,9+hb,14,2,skinL); px(g,9+A.hx,18+hb,14,2,skinD);
    px(g,9+A.hx,9+hb,2,11,skinD); px(g,21+A.hx,9+hb,2,11,skinD);
    px(g,10+A.hx,11+hb,12,3,"#1a1410"); // mask band
    px(g,10+A.hx,11+hb,12,1,"#3a2e22");
    px(g,17+A.hx,12+hb,3,3,"#3a0a0a"); // covered eye
    g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,12+hb,2,2); g.fillStyle="#111"; g.fillRect(12+A.hx,12+hb,1,2);
    g.fillStyle="#fff"; g.fillRect(12+A.hx,12+hb,1,1);
    px(g,13+A.hx,15+hb,2,4,skinD); px(g,13+A.hx,17+hb,2,1,"#7a3a2a"); // nose + nostril shadow
    px(g,12+A.hx,18+hb,1,1,"#7a4a3a"); px(g,15+A.hx,19+hb,1,1,"#7a4a3a"); px(g,18+A.hx,18+hb,1,1,"#7a4a3a"); // stubble
    px(g,19+A.hx,14+hb,1,4,"#c93b3b"); px(g,19+A.hx,14+hb,1,1,"#ff8a8a"); // cheek scar
    px(g,12+A.hx,19+hb+(P.atk?1:0),6,1,"#5a1a1a"); px(g,13+A.hx,19+hb+(P.atk?1:0),4,1,"#7a2a2a"); // grim mouth
    // wide-brim hat: brim, tall crown, gold band, skull pin, feather
    px(g,4+A.hx,5+hb,24,4,coat); px(g,4+A.hx,5+hb,24,1,coatL); px(g,4+A.hx,8+hb,24,1,coatD);
    px(g,9+A.hx,0+hb,14,7,coat); px(g,9+A.hx,0+hb,2,7,coatL); px(g,21+A.hx,0+hb,2,7,coatD);
    px(g,9+A.hx,0+hb,14,2,"#5a4a38");
    px(g,9+A.hx,5+hb,14,2,"#c9a227"); px(g,9+A.hx,5+hb,5,1,"#ffd93d"); px(g,18+A.hx,5+hb,2,1,"#fff");
    px(g,15+A.hx,5+hb,3,3,"#e8e0d0"); g.fillStyle="#111"; g.fillRect(15+A.hx,6+hb,1,1); g.fillRect(17+A.hx,6+hb,1,1);
    px(g,24+A.hx,1+hb,3,4,"#7a1f1f"); px(g,24+A.hx,1+hb,1,4,"#ff8a8a"); // feather
    // executioner blade head in front (clears the hat)
    px(g,20+A.rax,4+A.ra+sw,10,6,"#c9ccd4"); px(g,20+A.rax,4+A.ra+sw,10,1,"#fff"); px(g,20+A.rax,9+A.ra+sw,10,1,"#5a5a66");
    px(g,20+A.rax,4+A.ra+sw,2,6,"#eef2f6"); px(g,28+A.rax,4+A.ra+sw,2,6,"#7a7a88");
    px(g,22+A.rax,5+A.ra+sw,6,1,"#8a9098");
    px(g,21+A.rax,8+A.ra+sw,8,1,"#7a1f1f"); px(g,22+A.rax,8+A.ra+sw,2,1,"#ff6a6a");
    px(g,24+A.rax,5+A.ra+sw,1,2,"#fff");
  };
  // SKELETON WARLORD v4: spread 4 arms, skull pauldrons, banner + blades
  D.skeleton_warlord = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const bone="#e8e4d8";
    px(g,1,4,2,22,"#5a3a22"); px(g,0,4,7,6,"#7a1f1f"); px(g,0,4,7,1,"#ffd93d"); px(g,1,8,5,1,"#e8e0d0");
    px(g,11+A.lx,30+A.ld,3,6,bone); px(g,18+A.rx,30+A.rd,3,6,bone); px(g,10+A.lx,36+A.ld,5,1,bone); px(g,17+A.rx,36+A.rd,5,1,bone);
    // 4 arms: uppers swing, lowers raise blades on atk
    px(g,0+A.lax,18+A.la,4,5,bone); px(g,28+A.rax,18+A.ra,4,5,bone); px(g,0+A.lax,23+A.la,5,2,"#9aa0a8"); px(g,27+A.rax,23+A.ra,5,2,"#9aa0a8");
    px(g,5+A.lax,20+A.la-(P.atk?3:0),3,6,bone); px(g,24+A.rax,20+A.ra-(P.atk?3:0),3,6,bone);
    px(g,2,13,7,6,bone); px(g,23,13,7,6,bone); g.fillStyle="#111"; g.fillRect(4,15,2,3); g.fillRect(26,15,2,3);
    px(g,14,18,4,13,bone); g.fillStyle="#1a1a1f"; for(let i=0;i<4;i++) g.fillRect(11,20+i*3,10,1);
    px(g,14,28,4,4,"#2a3a4a"); px(g,15,29,2,2,"#7fd4ff"); px(g,14,27,4,1,"#ffd93d");
    px(g,10+A.hx,5+hb,12,11,bone); px(g,10+A.hx,5+hb,12,3,"#ffd93d"); px(g,10+A.hx,13+hb,12,1,"#c9a227");
    px(g,12+A.hx,8+hb,8,6,"#1a1a1f"); g.fillStyle="#ff3b3b"; g.fillRect(13+A.hx,10+hb,2,3); g.fillRect(18+A.hx,10+hb,2,3);
    g.fillStyle="#fff"; g.fillRect(13+A.hx,10+hb,1,1); g.fillRect(18+A.hx,10+hb,1,1);
    px(g,15+A.hx,10+hb,2,4,"#9a968a"); g.fillStyle="#1a1a1f"; for(let t=0;t<4;t++) g.fillRect(12+t*3+A.hx,15+hb,1,1);
  };
  // DRAUGR KING v4: kelp mane + crab familiar + anchor blade
  D.draugr_king = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    px(g,11+A.lx,30+A.ld,3,6,"#9aa09a"); px(g,18+A.rx,30+A.rd,3,6,"#9aa09a");
    px(g,9,20,14,11,"#3a3a42"); px(g,11,20,10,11,"#6a7a6a");
    px(g,12,22,3,3,"#e8e0d0"); px(g,19,22,3,3,"#c9c9c9");
    px(g,14,23,4,5,"#7fd4ff"); px(g,15,24,2,3,"#fff"); px(g,14,23,4,1,"#fff");
    px(g,3+A.lax,16+A.la,5,14,"#2a5a3a"); px(g,4+A.lax,16+A.la,3,14,"#4a8a4a"); px(g,3+A.lax,16+A.la,5,2,"#7ac97a");
    px(g,10+A.hx,8+hb,12,10,"#9aa09a"); px(g,10+A.hx,8+hb,12,3,"#7aa07a"); px(g,12+A.hx,11+hb,8,5,"#1a3a2a");
    g.fillStyle="#7fd4ff"; g.fillRect(13+A.hx,12+hb,2,3); g.fillRect(18+A.hx,12+hb,2,3); g.fillStyle="#fff"; g.fillRect(13+A.hx,12+hb,1,1); g.fillRect(18+A.hx,12+hb,1,1);
    px(g,7+A.hx,2+hb,18,5,"#2a5a3a"); px(g,9+A.hx,0+hb,3,7,"#4a8a4a"); px(g,13+A.hx,0+hb,4,8,"#3a6a3a"); px(g,18+A.hx,0+hb,3,7,"#4a8a4a"); px(g,22+A.hx,2+hb,2,5,"#4a8a4a");
    px(g,11+A.hx,3+hb,2,1,"#ffd93d"); px(g,16+A.hx,4+hb,2,1,"#ffd93d");
    // anchor blade hefts on atk
    px(g,25,12-(P.atk?4:0),3,18,"#6a5a3a"); px(g,23,10-(P.atk?4:0),7,4,"#6a6a6a"); px(g,23,10-(P.atk?4:0),7,1,"#c9c9c9");
    px(g,26,5,5,6,"#c94a3a"); px(g,27,7,3,3,"#e06a5a"); px(g,28,8,1,1,"#111");
  };
  // DULLAHAN LORD v4: big glowing head + wheel shield + spinal whip
  D.dullahan_lord = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    // HEADLESS LORD: greatcoat, glowing stump, head held HIGH in right hand
    // legs march + boots
    px(g,9+A.lx,28+A.ld,5,6,"#14141c"); px(g,18+A.rx,28+A.rd,5,6,"#14141c");
    px(g,8+A.lx,33+A.ld,7,3,"#0c0c12"); px(g,17+A.rx,33+A.rd,7,3,"#0c0c12");
    // greatcoat with skirt + collar + belt medal
    px(g,8,14,16,16,"#14141c"); px(g,10,14,12,16,"#23232e");
    px(g,8,26,16,4,"#0c0c12"); px(g,10,16,2,12,"#3a3a4a"); px(g,20,16,2,12,"#3a3a4a");
    px(g,13,18,6,6,"#c9a227"); px(g,14,19,4,4,"#14141c"); px(g,15,20,2,2,"#c9a227");
    // neck stump: severed glow ring + rising wisp
    px(g,12,11,8,3,"#2a9ac9"); px(g,13,11,6,1,"#fff");
    px(g,14,8,4,3,"#7fd4ff"); px(g,15,8,2,1,"#fff");
    // left arm swings, spine-sword slashes on atk
    px(g,4+A.lax,16+A.la,4,10,"#14141c");
    px(g,2+A.lax,18+A.la-(P.atk?4:0),2,16,"#e8e8f2"); px(g,2+A.lax,26+A.la-(P.atk?4:0),2,3,"#999");
    // RIGHT ARM RAISED: shoulder -> up -> hand gripping the head (hoisted on atk)
    const hr=P.atk?3:0;
    px(g,22,18-hr,4,6,"#14141c"); px(g,22,18-hr,4,1,"#3a3a4a");
    px(g,22,13-hr,5,6,"#e8d9b8"); px(g,22,13-hr,5,1,"#fff");
    // THE HEAD, held aloft: pale face, dead glow eyes, grim jaw, hair curtains
    px(g,19,3-hr,11,10,"#e8d9b8"); px(g,20,3-hr,9,1,"#fff");
    px(g,18,3-hr,3,10,"#3a2a2a"); px(g,28,3-hr,3,10,"#3a2a2a");
    px(g,21,6-hr,7,4,"#111");
    g.fillStyle="#7fd4ff"; g.fillRect(22,7-hr,2,2); g.fillRect(26,7-hr,2,2);
    g.fillStyle="#fff"; g.fillRect(22,7-hr,1,1); g.fillRect(26,7-hr,1,1);
    px(g,23,11-hr,4,1,"#7a1f1f"); px(g,24,12-hr,2,1+(P.atk?1:0),"#c93b3b");
    px(g,22,16-hr,3,4,"#e8d9b8");
    px(g,25,0-hr,3,2,"#ff3b3b"); px(g,28,0-hr,3,2,"#ff3b3b"); // embers off crown
    // attached soul-wisps curling off the head
    px(g,18,5-hr,2,4,"#ff3b3b"); px(g,17,4-hr,2,2,"#ff6b5a");
    px(g,29,5-hr,2,4,"#ff3b3b"); px(g,30,4-hr,2,2,"#ff6b5a");
    // spine sword in the lowered left hand
    px(g,2+A.lax,18+A.la-(P.atk?4:0),2,14,"#fff"); px(g,2+A.lax,20+A.la-(P.atk?4:0),2,1,"#999"); px(g,2+A.lax,24+A.la-(P.atk?4:0),2,1,"#999"); px(g,2+A.lax,28+A.la-(P.atk?4:0),2,2,"#c9ccd4");
  };
  // WRAITH SOVEREIGN v4: wide cowl + split tails + orbiting shards + scythe
  D.wraith_sovereign = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const drift=window.Anim.seg(P,0,1), drift2=window.Anim.seg(P,2,1);
    // glide: crown, brow and scythe sway with the stride.
    const gl=P.moving?([0,1,0,-1][P.f&3]):0;
    g.fillStyle="rgba(89,214,214,0.16)"; g.beginPath(); g.ellipse(16,22,14,14,0,0,7); g.fill();
    const sh="#1e4a5a", mid="#59d6d6";
    // rooted crown: gold band seated ON the brow, spikes rising
    px(g,8+gl,6,16,4,sh); px(g,6+gl,10,20,5,sh); px(g,5+gl,15,22,4,sh);
    px(g,9+gl,15,14,12,mid); px(g,11+gl,16,10,10,"#0c0a12");
    px(g,14+gl,15,4,2,"#123a42");
    px(g,13+gl,18,3,4,"#0c0a12"); px(g,17+gl,18,1,4,"#bfe8ff"); px(g,19+gl,18,3,4,"#0c0a12");
    g.fillStyle="#e2feff"; g.fillRect(13+gl,19,2,3); g.fillRect(20+gl,19,2,2);
    px(g,14+gl,23,4,3,"#bfe8ff"); px(g,15+gl,24,2,1,"#0c0a12");
    // split tails writhe
    px(g,4,17+drift,4,10,sh); px(g,24,17+drift2,4,10,sh); px(g,4,26+drift,3,4,sh); px(g,25,26+drift2,3,4,sh);
    px(g,7,27+drift,4,10,sh); px(g,14,27,4,6,sh); px(g,20,27+drift2,4,10,sh);
    // crown band + spikes overlap the brow (no floating gap)
    px(g,8+gl,6+drift,16,3,"#ffd93d"); px(g,9+gl,6+drift,14,1,"#fff2b0");
    px(g,9+gl,2+drift,3,5,"#ffd93d"); px(g,9+gl,2+drift,3,1,"#fff");
    px(g,14+gl,1+drift,4,6,"#ffd93d"); px(g,14+gl,1+drift,4,1,"#fff"); px(g,15+gl,4+drift,2,2,"#c93b3b");
    px(g,20+gl,2+drift,3,5,"#ffd93d"); px(g,20+gl,2+drift,3,1,"#fff");
    // scythe hefts high on atk
    px(g,26+gl,10-(P.atk?5:0),2,20,"#3a2a1a"); px(g,25+gl,8-(P.atk?5:0),5,7,"#bfe8ff"); px(g,26+gl,9-(P.atk?5:0),3,5,"#fff");
  };
  // CULTIST HIEROPHANT v4: tower mitre + void face + tentacles + brazier
  D.cultist_hierophant = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const wr=window.Anim.seg(P,0,1);
    const robe="#2a1040";
    px(g,9,26,14,10,"#1a0a28"); px(g,8,18,16,10,robe); px(g,13,18,6,10,shade(robe,30));
    px(g,10,30,3,2,"#c77dff"); px(g,14,32,4,2,"#c77dff"); px(g,19,30,3,2,"#c77dff");
    px(g,14,20,4,6,"#ffd93d"); px(g,15,21,2,4,"#0c0a12");
    px(g,10,0,12,6,robe); px(g,12,0,8,2,"#ffd93d"); px(g,11,5,10,5,"#0c0a12");
    px(g,11,5,4,4,"#c77dff"); px(g,17,5,4,4,"#c77dff"); g.fillStyle="#fff"; g.fillRect(12,6,2,2); g.fillRect(18,6,2,2);
    px(g,13,10,6,6,"#0c0a12"); g.fillStyle="#ff9d2e"; g.fillRect(14,12,2,3); g.fillRect(17,12,2,3);
    if(P.atk){ g.fillStyle="#fff"; g.fillRect(14,12,1,1); g.fillRect(17,12,1,1); } // void eyes blaze on cast
    // tentacles writhe
    px(g,11,16+wr,2,5,"#8a4a6a"); px(g,14,16-wr,2,5,"#8a4a6a"); px(g,17,16+wr,2,5,"#8a4a6a"); px(g,20,16-wr,2,5,"#8a4a6a");
    // brazier arm rises on cast
    px(g,25,12-(P.atk?4:0),2,18,"#5a3a22"); px(g,22,6-(P.atk?4:0),8,8,"#1a0a28"); px(g,23,8-(P.atk?4:0),6,6,"#ff6b2e"); px(g,24,9-(P.atk?4:0),4,4,"#ffd93d"); px(g,25,10-(P.atk?4:0),2,2,"#fff");
    px(g,4,18+wr,3,10,"#1a0a28"); px(g,4,18+wr,3,2,"#c77dff");
  };
  // WYVERN MATRIARCH v4: grounded brooder, torn sails, egg mound, horned crown
  D.wyvern_matriarch = (g,tint)=>{
    const dk=shade(tint,-35), lite=shade(tint,25);
    px(g,4,26,24,8,dk); px(g,6,24,20,6,tint); px(g,6,24,20,2,lite);
    px(g,9,22,4,4,"#e8e0d0"); px(g,15,22,3,3,"#f2d0a0"); px(g,20,22,4,4,"#e8e0d0");
    g.fillStyle=dk; g.beginPath(); g.moveTo(13,22); g.lineTo(1,6); g.lineTo(4,15); g.lineTo(8,14); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(31,6); g.lineTo(28,15); g.lineTo(24,14); g.fill();
    px(g,4,12,5,1,"#d9c27f"); px(g,23,12,5,1,"#d9c27f"); px(g,6,14,3,2,"#7a1f1f"); px(g,23,16,3,2,"#7a1f1f");
    px(g,0,18,4,4,dk); px(g,0,17,5,2,"#9adc9a"); px(g,28,20,4,3,"#9adc9a");
    px(g,16,10,10,12,tint); px(g,17,11,8,3,lite);
    px(g,18,16,8,5,"#0c1a10"); for(let i=0;i<4;i++) px(g,19+i*2,17,1,3,"#fff");
    g.fillStyle="#ffe14d"; g.fillRect(19,13,2,3); g.fillRect(24,13,2,2); g.fillStyle="#111"; g.fillRect(19,13,1,2);
    px(g,13,8,3,3,"#c93b3b"); px(g,22,6,4,5,"#e8e0d0"); px(g,7,6,4,5,"#e8e0d0"); px(g,8,6,2,2,"#c93b3b"); px(g,23,6,2,2,"#c93b3b");
    px(g,12,28,8,2,"#ffd93d");
  };
  // HARPY MATRIARCH v4: ancient vulture, egg nest, birdcage staff
  D.harpy_matriarch = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-35), lite=shade(tint,25);
    // vulture wings FLAP about the shoulders
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    g.save(); g.translate(13,22); g.rotate(WA); g.translate(-13,-22);
    g.fillStyle=tint; g.beginPath(); g.moveTo(13,22); g.lineTo(1,8); g.lineTo(4,16); g.fill();
    g.restore();
    g.save(); g.translate(19,22); g.rotate(-WA); g.translate(-19,-22);
    g.fillStyle=tint; g.beginPath(); g.moveTo(19,22); g.lineTo(31,8); g.lineTo(28,16); g.fill();
    g.restore();
    px(g,2,14+hb,4,2,"#7a1f1f"); px(g,26,14+hb,4,2,"#2a6a9a");
    px(g,11+A.lx,28+A.ld,3,6,dk); px(g,18+A.rx,28+A.rd,3,6,dk); px(g,10+A.lx,34+A.ld,4,2,"#3a2a1a"); px(g,18+A.rx,34+A.rd,4,2,"#3a2a1a");
    px(g,10,15,12,13,tint); px(g,12,17,8,10,lite); px(g,12,25,8,3,"#5a3a22");
    px(g,7+A.hx,11+hb,18,7,"#e8e0d0"); px(g,8+A.hx,12+hb,16,5,"#f7f0e0"); px(g,7+A.hx,13+hb,2,5,"#c9b8a0"); px(g,23+A.hx,13+hb,2,5,"#c9b8a0");
    px(g,11+A.hx,6+hb,10,9,"#c9986a"); g.fillStyle="#111"; g.fillRect(13+A.hx,10+hb,2,3); g.fillRect(17+A.hx,10+hb,2,2);
    px(g,14+A.hx,13+hb,4,1,"#7a1f1f"); px(g,13+A.hx,20+hb+(P.atk?1:0),6,4,"#8a4a3a"); g.fillStyle="#fff"; g.fillRect(14+A.hx,21+hb,1,2); g.fillRect(17+A.hx,21+hb,1,2);
    px(g,7+A.hx,2+hb,18,4,"#5a3a22"); px(g,10+A.hx,0+hb,3,4,"#e8e0d0"); px(g,14+A.hx,0+hb,4,3,"#7fd4ff"); px(g,19+A.hx,0+hb,3,4,"#e8c9a0");
    // birdcage staff hefts on atk
    px(g,25,12-(P.atk?4:0),2,18,"#5a3a22"); px(g,23,16-(P.atk?4:0),6,8,"#8a5a33"); px(g,24,18-(P.atk?4:0),4,4,"#ffd93d"); px(g,25,19-(P.atk?4:0),2,2,"#fff");
  };
  // TENGU STORMLORD v5 REALISM (goddess/peter bar: storm aura+shadow, feathered wings, layered priest robe, long-nose face, gunbai + shakujo, ~110 rects)
  D.tengu_stormlord = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const robe=tint, dk=shade(tint,-42), lite=shade(tint,30), pale=shade(tint,55);
    const skin="#d9a06b", skinD="#a06a3a", skinL="#f2c890";
    // storm aura + shadow + sparks
    g.fillStyle="rgba(120,160,255,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
    g.fillStyle="rgba(255,217,61,0.07)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
    g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
    px(g,3,20,1,1,"#7fd4ff"); px(g,28,14,1,1,"#fff"); px(g,26,30,1,1,"#7fd4ff");
    // storm wings: flapping black feathers with blue sheen + red tips
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    g.save(); g.translate(13,22); g.rotate(WA); g.translate(-13,-22);
    g.fillStyle="#2a3452"; g.beginPath(); g.moveTo(13,22); g.lineTo(0,6); g.lineTo(4,16); g.fill();
    g.fillStyle="#3d4f7a"; g.beginPath(); g.moveTo(12,21); g.lineTo(3,10); g.lineTo(6,16); g.fill();
    g.restore();
    g.save(); g.translate(19,22); g.rotate(-WA); g.translate(-19,-22);
    g.fillStyle="#2a3452"; g.beginPath(); g.moveTo(19,22); g.lineTo(32,6); g.lineTo(28,16); g.fill();
    g.fillStyle="#3d4f7a"; g.beginPath(); g.moveTo(20,21); g.lineTo(29,10); g.lineTo(26,16); g.fill();
    g.restore();
    px(g,1,8+hb,3,2,"#c93b3b"); px(g,2,8+hb,1,1,"#ff8a8a");
    px(g,28,8+hb,3,2,"#c93b3b"); px(g,29,8+hb,1,1,"#ff8a8a");
    // storm-feather bars so wings read on black (Peter-style rim light)
    px(g,1,10+hb,2,6,"#4a5a8a"); px(g,3,12+hb,2,4,"#7fd4ff"); px(g,1,14+hb,1,2,"#fff");
    px(g,29,10+hb,2,6,"#4a5a8a"); px(g,27,12+hb,2,4,"#7fd4ff"); px(g,30,14+hb,1,2,"#fff");
    px(g,3,12+hb,2,3,"#3a3a4a"); px(g,27,12+hb,2,3,"#3a3a4a");
    // legs: black hakama + wooden geta
    px(g,11+A.lx,28+A.ld,4,7,"#1a1a24"); px(g,17+A.rx,28+A.rd,4,7,"#1a1a24");
    px(g,11+A.lx,28+A.ld,1,7,"#3a3a4a"); px(g,20+A.rx,28+A.rd,1,7,"#0c0c12");
    px(g,10+A.lx,34+A.ld,6,2,"#8a5a33"); px(g,16+A.rx,34+A.rd,6,2,"#8a5a33");
    px(g,10+A.lx,34+A.ld,6,1,"#c9a06a");
    // robe: layered priest coat, front panels, rope belt, thunder crest
    px(g,9,15,14,15,robe); px(g,9,15,14,2,lite); px(g,9,28,14,2,dk);
    px(g,9,15,2,15,dk); px(g,21,15,2,15,dk);
    px(g,11,17,3,11,pale); px(g,18,17,3,11,shade(tint,12));
    px(g,13,19,6,6,"#2a2a3a"); px(g,14,20,4,4,"#ffd93d"); px(g,15,21,2,2,"#c93b3b"); px(g,15,21,1,1,"#fff");
    px(g,10,24,12,2,"#c9a227"); px(g,10,24,12,1,"#fff2b0");
    // white shawl with pom-poms
    px(g,7+A.hx,11+hb,18,5,"#f2ede2"); px(g,7+A.hx,11+hb,18,1,"#fff");
    for(let i=0;i<4;i++) px(g,8+i*4+A.hx,15+hb,2,2,"#f2ede2");
    px(g,8+A.hx,15+hb,2,1,"#cfc4b8"); px(g,20+A.hx,15+hb,2,1,"#cfc4b8");
    // LEFT arm + shakujo ringed staff
    px(g,3+A.lax,16+A.la,4,9,robe); px(g,3+A.lax,16+A.la,1,9,lite);
    px(g,3+A.lax,23+A.la,4,3,skin); px(g,3+A.lax,23+A.la,1,3,skinL);
    px(g,4+A.lax,12+A.la,2,14,"#5a3a22"); px(g,4+A.lax,12+A.la,1,14,"#a97648");
    px(g,2+A.lax,8+A.la,6,5,"#c9a227"); px(g,2+A.lax,8+A.la,6,1,"#fff2b0");
    px(g,2+A.lax,9+A.la,1,3,"#ffd93d"); px(g,7+A.lax,9+A.la,1,3,"#ffd93d");
    px(g,3+A.lax,13+A.la,2,1,"#ff8a8a");
    // face: fierce red-tinged tengu, giant nose, fangs, brows
    px(g,11+A.hx,6+hb,10,11,skin); px(g,11+A.hx,6+hb,10,2,skinL); px(g,11+A.hx,15+hb,10,2,skinD);
    px(g,11+A.hx,6+hb,2,11,skinD); px(g,19+A.hx,6+hb,2,11,skinD);
    px(g,14+A.hx,10+hb,5,6,"#c98a5a"); px(g,15+A.hx,11+hb,3,5,"#a06a3a"); px(g,16+A.hx,15+hb,1,1,"#7a3a1a"); // long nose
    g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,8+hb,2,3); g.fillRect(18+A.hx,8+hb,2,3);
    g.fillStyle="#111"; g.fillRect(12+A.hx,9+hb,1,2); g.fillRect(18+A.hx,9+hb,1,2);
    g.fillStyle="#fff"; g.fillRect(12+A.hx,8+hb,1,1); g.fillRect(18+A.hx,8+hb,1,1);
    px(g,12+A.hx,7+hb,3,1,"#3a2a1a"); px(g,18+A.hx,7+hb,3,1,"#3a2a1a");
    px(g,13+A.hx,14+hb,1,2,"#fff"); px(g,18+A.hx,14+hb,1,2,"#fff"); // fangs
    px(g,14+A.hx,14+hb,4,1,"#7a1f1f");
    // black cap + gold horns/poms + white side hair
    px(g,11+A.hx,2+hb,10,5,"#c93b3b"); px(g,11+A.hx,2+hb,10,1,"#ff8a8a"); px(g,11+A.hx,6+hb,10,1,"#7a1f1f");
    px(g,7+A.hx,1+hb,4,5,"#ffd93d"); px(g,7+A.hx,1+hb,4,1,"#fff2b0");
    px(g,21+A.hx,1+hb,4,5,"#ffd93d"); px(g,21+A.hx,1+hb,4,1,"#fff2b0");
    px(g,8+A.hx,8+hb,3,8,"#e8e0d0"); px(g,21+A.hx,8+hb,3,8,"#e8e0d0");
    // RIGHT arm + gunbai war-fan (rises on atk)
    const fa=P.atk?-5:0;
    px(g,25+A.rax,16+A.ra+fa,4,9,robe); px(g,25+A.rax,16+A.ra+fa,1,9,lite);
    px(g,25+A.rax,23+A.ra+fa,4,2,skin);
    px(g,25+A.rax,12+A.ra+fa,5,7,"#e8e0d0"); px(g,25+A.rax,12+A.ra+fa,5,1,"#111");
    px(g,25+A.rax,14+A.ra+fa,5,5,"#c93b3b"); px(g,26+A.rax,15+A.ra+fa,3,3,"#ffd93d"); px(g,27+A.rax,16+A.ra+fa,1,1,"#fff");
    px(g,25+A.rax,12+A.ra+fa,1,7,"#8a8a8a"); px(g,29+A.rax,12+A.ra+fa,1,7,"#8a8a8a");
  };
  // MINOTAUR WARLORD v5 REALISM (goddess/peter bar: blood aura+shadow, fur+plate, twin axes, chain nose-ring, skull belt, horned head, ~110 rects)
  D.minotaur_warlord = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const fur=tint, dk=shade(tint,-42), lite=shade(tint,30), pale=shade(tint,55);
    // blood aura + shadow + embers
    g.fillStyle="rgba(200,60,40,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
    g.fillStyle="rgba(255,120,60,0.08)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
    g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
    px(g,4,22,1,1,"#ff8a6a"); px(g,28,16,1,1,"#fff"); px(g,26,32,1,1,"#ff8a6a");
    // twin axes crossed behind (rise on atk)
    const ax=P.atk?4:0;
    px(g,2,7-ax,3,14,"#5a3a22"); px(g,2,7-ax,1,14,"#a97648");
    px(g,0,5-ax,8,4,"#c9ccd4"); px(g,0,5-ax,8,1,"#fff"); px(g,0,8-ax,8,1,"#5a5a66");
    px(g,0,5-ax,2,4,"#eef2f6"); px(g,6,5-ax,2,4,"#7a7a88");
    px(g,27,7-ax,3,14,"#5a3a22"); px(g,27,7-ax,1,14,"#a97648");
    px(g,24,5-ax,8,4,"#c9ccd4"); px(g,24,5-ax,8,1,"#fff"); px(g,24,8-ax,8,1,"#5a5a66");
    px(g,24,5-ax,2,4,"#eef2f6"); px(g,30,5-ax,2,4,"#7a7a88");
    // legs: furred thighs, dark hooves, gold anklets
    px(g,9+A.lx,28+A.ld,5,7,fur); px(g,18+A.rx,28+A.rd,5,7,fur);
    px(g,9+A.lx,28+A.ld,1,7,lite); px(g,22+A.rx,28+A.rd,1,7,dk);
    px(g,8+A.lx,34+A.ld,7,3,"#2a1a10"); px(g,17+A.rx,34+A.rd,7,3,"#2a1a10");
    px(g,8+A.lx,34+A.ld,7,1,"#8a5a33");
    // torso: dark plate frame, fur chest, blue war-mark, bronze trim
    px(g,8,15,16,15,dk); px(g,8,15,16,2,fur);
    px(g,10,17,12,12,fur); px(g,10,17,12,2,lite); px(g,10,27,12,2,dk);
    px(g,10,17,2,12,dk); px(g,20,17,2,12,dk);
    px(g,12,19,8,7,"#2a4a9a"); px(g,13,20,6,5,"#3a6aba"); px(g,13,20,6,1,"#7fb0ff"); px(g,16,20,1,5,"#7fb0ff");
    px(g,17,23,3,3,"#ffd93d"); px(g,18,24,1,1,"#fff");
    px(g,8,15,2,15,"#5a3a22"); px(g,22,15,2,15,"#5a3a22");
    // skull belt: leather + 3 skulls
    px(g,9,28,14,3,"#3a2a1a"); px(g,9,28,14,1,"#8a5a33");
    for(let i=0;i<3;i++){ const sx=11+i*4; px(g,sx,28,3,3,"#e8e4d8"); px(g,sx,28,3,1,"#fff"); g.fillStyle="#111"; g.fillRect(sx+1,29,1,1); }
    // arms: furred + bracers + fists
    px(g,4+A.lax,17+A.la,4,9,fur); px(g,4+A.lax,17+A.la,1,9,lite);
    px(g,4+A.lax,24+A.la,4,3,"#5a3a22"); px(g,4+A.lax,24+A.la,4,1,"#c9a227");
    px(g,4+A.lax,27+A.la,4,3,fur); px(g,4+A.lax,27+A.la,1,3,dk);
    px(g,24+A.rax,17+A.ra,4,9,fur); px(g,24+A.rax,17+A.ra,1,9,lite);
    px(g,24+A.rax,24+A.ra,4,3,"#5a3a22"); px(g,24+A.rax,24+A.ra,4,1,"#c9a227");
    px(g,24+A.rax,27+A.ra,4,3,fur); px(g,27+A.rax,27+A.ra,1,3,dk);
    // head: broad bull skull, muzzle, nostrils flare on atk
    px(g,10+A.hx,6+hb,12,10,fur); px(g,10+A.hx,6+hb,12,2,lite); px(g,10+A.hx,14+hb,12,2,dk);
    px(g,10+A.hx,6+hb,2,10,dk); px(g,20+A.hx,6+hb,2,10,dk);
    px(g,12+A.hx,11+hb,8,5,"#d9a0a0"); px(g,13+A.hx,12+hb,6,3,"#b88a8a");
    px(g,14+A.hx,13+hb+(P.atk?1:0),1,2,"#5a0a0a"); px(g,17+A.hx,13+hb+(P.atk?1:0),1,2,"#5a0a0a");
    px(g,13+A.hx,15+hb,6,1,"#5a1a1a"); px(g,14+A.hx,16+hb,4,1,"#7a2a2a");
    // eyes: blood-glow, slit pupils, catchlights, heavy brow
    g.fillStyle="#ff3b3b"; g.fillRect(12+A.hx,8+hb,3,3); g.fillRect(18+A.hx,8+hb,3,3);
    g.fillStyle="#111"; g.fillRect(13+A.hx,8+hb,1,3); g.fillRect(19+A.hx,8+hb,1,3);
    g.fillStyle="#fff"; g.fillRect(12+A.hx,8+hb,1,1); g.fillRect(18+A.hx,8+hb,1,1);
    px(g,11+A.hx,7+hb,4,1,"#3a2a1a"); px(g,17+A.hx,7+hb,4,1,"#3a2a1a");
    // horns: great curved ivory + gold bands + shaded undersides
    g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11+A.hx,7+hb); g.lineTo(2+A.hx,0+hb); g.lineTo(7+A.hx,9+hb); g.fill();
    g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(21+A.hx,7+hb); g.lineTo(30+A.hx,0+hb); g.lineTo(25+A.hx,9+hb); g.fill();
    px(g,4+A.hx,3+hb,3,2,"#c9a227"); px(g,25+A.hx,3+hb,3,2,"#c9a227");
    px(g,4+A.hx,3+hb,1,1,"#fff"); px(g,25+A.hx,3+hb,1,1,"#fff");
    px(g,5+A.hx,5+hb,3,1,"#8a8078"); px(g,24+A.hx,5+hb,3,1,"#8a8078");
    // nose-ring: gold ring + chain to ear
    px(g,13+A.hx,15+hb,6,2,"#c9a227"); px(g,13+A.hx,15+hb,6,1,"#fff2b0");
    px(g,15+A.hx,17+hb,1,3,"#8a5a33"); px(g,16+A.hx,19+hb,2,1,"#ffd93d"); px(g,18+A.hx,18+hb,1,2,"#ffd93d");
  };
  // MEDUSA QUEEN v5 REALISM (goddess/peter bar: venom aura+shadow, jeweled coils, cobra hood, 6 snake stalks with heads/eyes/tongues, mirror shield, gold bodice, ~115 rects)
  D.medusa_queen = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const coil=tint, dk=shade(tint,-42), lite=shade(tint,32), pale=shade(tint,58);
    const skin="#f2d3b3", skinD="#c9986a", skinL="#fff2e0";
    // venom aura + shadow + motes
    g.fillStyle="rgba(80,220,120,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
    g.fillStyle="rgba(255,217,61,0.08)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
    g.fillStyle="rgba(0,0,0,0.30)"; g.beginPath(); g.ellipse(16,37,9,2.6,0,0,7); g.fill();
    px(g,3,26,1,1,"#7dff9b"); px(g,28,18,1,1,"#fff"); px(g,26,33,1,1,"#7dff9b");
    // serpent coils mound: dark base, mid coils, light belly ridges, jeweled bands
    px(g,5,29,22,8,dk); px(g,5,29,22,2,lite);
    px(g,7+A.lx,27+A.ld,8,6,coil); px(g,17+A.rx,27+A.rd,8,6,coil);
    px(g,7+A.lx,27+A.ld,8,1,pale); px(g,17+A.rx,27+A.rd,8,1,pale);
    px(g,8+A.lx,31+A.ld,6,2,dk); px(g,18+A.rx,31+A.rd,6,2,dk);
    px(g,10,28,4,2,"#ffd93d"); px(g,10,28,1,1,"#fff"); // gold coil jewel L
    px(g,18,28,4,2,"#c93b3b"); px(g,19,28,1,1,"#ff9a9a"); // ruby coil jewel R
    px(g,13,30,6,2,"#ffd93d"); px(g,14,30,4,1,"#fff2b0");
    px(g,9,33,3,2,lite); px(g,20,33,3,2,lite);
    // cobra hood behind torso
    px(g,4,12,6,12,coil); px(g,4,12,2,12,dk); px(g,4,12,1,12,pale);
    px(g,22,12,6,12,coil); px(g,26,12,2,12,dk); px(g,22,12,1,12,pale);
    px(g,5,14,2,3,"#ffd93d"); px(g,23,18,2,3,"#ffd93d");
    // torso: emerald scaled bodice + gold trim + cleavage gem
    px(g,10,16,12,13,coil); px(g,10,16,12,2,lite); px(g,10,27,12,2,dk);
    px(g,10,16,2,13,dk); px(g,20,16,2,13,dk);
    px(g,12,18,8,7,"#d9b96a"); px(g,13,19,6,5,"#f2e0a0"); px(g,13,19,6,1,"#fff");
    px(g,14,21,4,4,"#0e5a3a"); px(g,15,22,2,2,"#7dff9b"); px(g,15,22,1,1,"#fff");
    px(g,11,25,10,2,"#ffd93d"); px(g,11,25,10,1,"#fff2b0");
    // LEFT arm + MIRROR SHIELD (silver face, gold rim, glint)
    px(g,3+A.lax,17+A.la,4,8,skin); px(g,3+A.lax,17+A.la,1,8,skinL);
    px(g,3+A.lax,25+A.la,4,2,"#ffd93d");
    px(g,0+A.lax,18+A.la,6,12,"#c9a227"); px(g,1+A.lax,19+A.la,4,10,"#dfe9f2");
    px(g,1+A.lax,19+A.la,4,2,"#fff"); px(g,2+A.lax,22+A.la,2,5,"#7fd4ff"); px(g,2+A.lax,23+A.la,1,2,"#fff");
    px(g,0+A.lax,18+A.la,6,1,"#fff2b0"); px(g,0+A.lax,29+A.la,6,1,"#8a6a1a");
    // RIGHT arm + stone-gaze scepter (rises on atk)
    const sw=P.atk?-5:0;
    px(g,25+A.rax,17+A.ra+sw,4,8,skin); px(g,25+A.rax,17+A.ra+sw,1,8,skinL);
    px(g,25+A.rax,25+A.ra+sw,4,2,"#ffd93d");
    px(g,26+A.rax,12+A.ra+sw,2,15,"#5a3a22"); px(g,26+A.rax,12+A.ra+sw,1,15,"#a97648");
    px(g,24+A.rax,6+A.ra+sw,6,7,"#7fd4ff"); px(g,24+A.rax,6+A.ra+sw,6,1,"#fff");
    px(g,25+A.rax,8+A.ra+sw,4,4,"#0e5a3a"); px(g,26+A.rax,9+A.ra+sw,2,2,"#7dff9b"); px(g,26+A.rax,9+A.ra+sw,1,1,"#fff");
    px(g,24+A.rax,6+A.ra+sw,6,1,"#ffd93d"); px(g,24+A.rax,12+A.ra+sw,6,1,"#ffd93d");
    // neck + face: pale beauty, blush, red lips
    px(g,14+A.hx,14+hb,4,3,skin); px(g,14+A.hx,14+hb,4,1,skinD);
    px(g,10+A.hx,6+hb,12,10,skin); px(g,10+A.hx,6+hb,12,2,skinL); px(g,10+A.hx,14+hb,12,2,skinD);
    px(g,10+A.hx,6+hb,2,10,skinD); px(g,20+A.hx,6+hb,2,10,skinD);
    px(g,11+A.hx,12+hb,2,2,"#ffb0a0"); px(g,19+A.hx,12+hb,2,2,"#ffb0a0"); // blush
    px(g,14+A.hx,14+hb+(P.atk?1:0),4,1,"#a02040"); px(g,15+A.hx,14+hb+(P.atk?1:0),2,1,"#ff8ab0");
    // eyes: green gaze, slit pupils, catchlights, dark lashes
    g.fillStyle="#7dff9b"; g.fillRect(12+A.hx,9+hb,3,3); g.fillRect(18+A.hx,9+hb,3,3);
    g.fillStyle="#111"; g.fillRect(13+A.hx,9+hb,1,3); g.fillRect(19+A.hx,9+hb,1,3);
    g.fillStyle="#fff"; g.fillRect(12+A.hx,9+hb,1,1); g.fillRect(18+A.hx,9+hb,1,1);
    px(g,12+A.hx,8+hb,3,1,"#3a2a1a"); px(g,18+A.hx,8+hb,3,1,"#3a2a1a");
    // gold jewelry: diadem + emerald, earrings
    px(g,10+A.hx,4+hb,12,2,"#ffd93d"); px(g,10+A.hx,4+hb,12,1,"#fff2b0");
    px(g,14+A.hx,3+hb,4,3,"#ffd93d"); px(g,15+A.hx,4+hb,2,2,"#0e5a3a"); px(g,15+A.hx,4+hb,1,1,"#fff");
    px(g,8+A.hx,10+hb,2,4,"#ffd93d"); px(g,22+A.hx,10+hb,2,4,"#ffd93d");
    px(g,8+A.hx,13+hb,2,1,"#7dff9b"); px(g,22+A.hx,13+hb,2,1,"#7dff9b");
    // SNAKE MANE: 6 stalks with heads, eyes, tongues (writhe + lash on atk)
    for(let m=0;m<6;m++){
      const sn=window.Anim.seg(P,m,1);
      const sx=6+m*4+sn, sy=0+((m%2)?0:1);
      px(g,sx,sy,3,6,"#2e7d46"); px(g,sx,sy,1,6,"#7ac97a"); px(g,sx+2,sy,1,6,"#1e5a34");
      px(g,sx-1,sy+5,5,4,"#2e7d46"); px(g,sx,sy+5,3,1,"#7ac97a");
      g.fillStyle="#ffe14d"; g.fillRect(sx,sy+6,1,1); g.fillRect(sx+2,sy+6,1,1);
      g.fillStyle="#111"; g.fillRect(sx,sy+6,1,1);
      px(g,sx+1,sy+8+(P.atk?1:0),1,2,"#ff6b6b");
      if(m===0||m===5){ px(g,sx,sy-1,3,1,"#c93b3b"); }
    }
  };
  // TROLL KING v5 REALISM (goddess/peter bar: moss aura+shadow, rocky hide, root crown+ember gems, crystal back, shoulder pine, trunk club, ~115 rects)
  D.troll_king = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const hide=tint, dk=shade(tint,-42), lite=shade(tint,30), pale=shade(tint,55);
    // moss aura + shadow + spores
    g.fillStyle="rgba(110,200,110,0.16)"; g.beginPath(); g.ellipse(16,22+hb,13,14,0,0,7); g.fill();
    g.fillStyle="rgba(255,217,61,0.07)"; g.beginPath(); g.ellipse(16,24+hb,8,10,0,0,7); g.fill();
    g.fillStyle="rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(16,37,10,2.8,0,0,7); g.fill();
    px(g,4,24,1,1,"#9adc9a"); px(g,28,20,1,1,"#fff"); px(g,25,33,1,1,"#9adc9a");
    // legs: boulder greaves + moss + heavy feet
    px(g,9+A.lx,28+A.ld,6,8,dk); px(g,17+A.rx,28+A.rd,6,8,dk);
    px(g,9+A.lx,28+A.ld,2,8,"#5a5a5a"); px(g,21+A.rx,28+A.rd,2,8,"#3a3a3a");
    px(g,10+A.lx,30+A.ld,2,2,"#6b8a3a"); px(g,19+A.rx,32+A.rd,2,2,"#6b8a3a");
    px(g,8+A.lx,35+A.ld,8,2,"#3a2a1a"); px(g,16+A.rx,35+A.rd,8,2,"#3a2a1a");
    px(g,8+A.lx,35+A.ld,8,1,"#8a5a33");
    // torso: massive gut, stone plates, moss patches, belt
    px(g,7,15,18,15,hide); px(g,7,15,18,2,lite); px(g,7,28,18,2,dk);
    px(g,7,15,2,15,dk); px(g,23,15,2,15,dk);
    px(g,9,18,4,3,"#5a5a5a"); px(g,19,18,4,3,"#5a5a5a"); px(g,10,19,2,1,"#c9ccd4");
    px(g,12,22,3,3,"#6b8a3a"); px(g,18,24,4,2,"#6b8a3a"); px(g,13,26,2,2,"#4a6a2a");
    px(g,9,27,14,3,"#2f4a1f"); px(g,9,27,14,1,"#7ac97a");
    px(g,14,27,4,3,"#c9a227"); px(g,15,28,2,1,"#5a3a22");
    // crystal back shards (glowing blue, gold bases)
    px(g,2,14,3,7,"#7fd4ff"); px(g,2,14,3,1,"#fff"); px(g,2,19,3,2,"#c9a227");
    px(g,27,14,3,7,"#7fd4ff"); px(g,27,14,3,1,"#fff"); px(g,27,19,3,2,"#c9a227");
    px(g,3,16,1,4,"#fff"); px(g,28,16,1,4,"#bfe8ff");
    // shoulder pine (trunk + 3 foliage tiers + snow glints)
    px(g,4+A.lax,8+A.la,3,8,"#4a2f1a"); px(g,4+A.lax,8+A.la,1,8,"#8a5a33");
    px(g,1+A.lax,6+A.la,9,4,"#2f6a2f"); px(g,1+A.lax,6+A.la,9,1,"#3f8a3f");
    px(g,2+A.lax,3+A.la,7,4,"#2f6a2f"); px(g,2+A.lax,3+A.la,7,1,"#9adc9a");
    px(g,3+A.lax,0+A.la,5,3,"#2f6a2f"); px(g,3+A.lax,0+A.la,5,1,"#e8f2e8");
    // LEFT arm: mossy limb + stone fist
    px(g,4+A.lax,17+A.la,4,10,hide); px(g,4+A.lax,17+A.la,1,10,lite);
    px(g,4+A.lax,27+A.la,5,4,dk); px(g,4+A.lax,27+A.la,5,1,"#8a8a8a");
    // RIGHT arm + TRUNK CLUB (hefts on atk)
    const sw=P.atk?-5:0;
    px(g,24+A.rax,17+A.ra+sw,4,10,hide); px(g,24+A.rax,17+A.ra+sw,1,10,lite);
    px(g,24+A.rax,25+A.ra+sw,5,4,dk);
    px(g,25+A.rax,8+A.ra+sw,3,19,"#4a2f1a"); px(g,25+A.rax,8+A.ra+sw,1,19,"#8a5a33");
    px(g,22+A.rax,5+A.ra+sw,9,5,"#6b4226"); px(g,22+A.rax,5+A.ra+sw,9,1,"#9a6a45");
    px(g,23+A.rax,6+A.ra+sw,2,2,"#6b8a3a"); px(g,27+A.rax,7+A.ra+sw,2,2,"#c9ccd4");
    px(g,24+A.rax,5+A.ra+sw,1,1,"#fff");
    // head: heavy brow, warts, tusks, glowing eyes
    px(g,9+A.hx,7+hb,14,10,hide); px(g,9+A.hx,7+hb,14,2,lite); px(g,9+A.hx,15+hb,14,2,dk);
    px(g,9+A.hx,7+hb,2,10,dk); px(g,21+A.hx,7+hb,2,10,dk);
    px(g,12+A.hx,12+hb,8,5,"#d9c9a0"); px(g,13+A.hx,13+hb,6,3,"#b8a888");
    px(g,11+A.hx,13+hb,2,4,"#e8e0d0"); px(g,19+A.hx,13+hb,2,4,"#e8e0d0"); // tusks up
    px(g,11+A.hx,13+hb,2,1,"#fff"); px(g,19+A.hx,13+hb,2,1,"#fff");
    g.fillStyle="#ffe14d"; g.fillRect(12+A.hx,9+hb,2,2); g.fillRect(18+A.hx,9+hb,2,2);
    g.fillStyle="#111"; g.fillRect(12+A.hx,10+hb,1,1); g.fillRect(18+A.hx,10+hb,1,1);
    g.fillStyle="#fff"; g.fillRect(12+A.hx,9+hb,1,1); g.fillRect(18+A.hx,9+hb,1,1);
    px(g,11+A.hx,8+hb,4,1,"#3a2a1a"); px(g,17+A.hx,8+hb,4,1,"#3a2a1a");
    px(g,14+A.hx,15+hb+(P.atk?1:0),4,1,"#3a2a1a");
    px(g,10+A.hx,11+hb,1,1,"#6b8a3a"); px(g,21+A.hx,12+hb,1,1,"#6b8a3a"); // warts
    // root crown + ember gems
    px(g,8+A.hx,4+hb,16,3,"#3a2a1a"); px(g,8+A.hx,4+hb,16,1,"#5a4a2a");
    px(g,9+A.hx,1+hb,3,4,"#5a4a2a"); px(g,14+A.hx,0+hb,4,5,"#5a4a2a"); px(g,20+A.hx,1+hb,3,4,"#5a4a2a");
    px(g,10+A.hx,2+hb,1,2,"#ff9d2e"); px(g,15+A.hx,1+hb,2,2,"#ff6b2e"); px(g,21+A.hx,2+hb,1,2,"#ff9d2e");
    px(g,15+A.hx,1+hb,1,1,"#fff");
  };
  // NAGA RAJA v4: cobra throne-hood, 4 weapons, gem cuirass
  D.naga_raja = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const sway=window.Anim.seg(P,0,1), sway2=window.Anim.seg(P,2,1);
    const dk=shade(tint,-40), lite=shade(tint,30);
    px(g,6,28,20,8,dk); px(g,8,26,16,6,tint); px(g,8,30,5,2,"#ffd93d"); px(g,15,30,5,2,"#c93b3b");
    // 4 weapons sway; right blade slashes on atk
    px(g,4,18+sway,4,8,tint); px(g,24,18+sway2,4,8,tint); px(g,3,24+sway,4,3,"#ffd93d"); px(g,25,24+sway2-(P.atk?3:0),3,6,"#8a5a33"); px(g,24,22+sway2,5,2,"#d9c27f");
    px(g,11,14,10,14,tint); px(g,12,16,8,9,"#d9b96a"); px(g,14,19,4,4,"#c93b3b"); px(g,15,20,2,2,"#fff");
    px(g,3,4,26,10,tint); px(g,3,4,26,2,lite); px(g,3,12,26,2,shade(tint,-20));
    px(g,1,5+sway,6,7,tint); px(g,25,5+sway2,6,7,tint); px(g,9,1,4,7,tint); px(g,19,1,4,7,tint); px(g,14,0,4,8,tint);
    for(let i=0;i<5;i++){ const hx=2+i*5; px(g,hx,7+((i&1)?sway:sway2),4,4,lite); px(g,hx+1,8+((i&1)?sway:sway2),2,2,"#fff"); g.fillStyle="#111"; g.fillRect(hx+1,8+((i&1)?sway:sway2),1,2); }
    g.fillStyle="#ffe14d"; g.fillRect(14,12,4,3); g.fillStyle="#111"; g.fillRect(15,13,2,2);
    px(g,1,12,2,9,"#ffd93d"); px(g,1,12,2,2,"#fff"); px(g,29,12,2,9,"#c9ccd4"); px(g,29,12,2,2,"#fff");
  };
  // HYDRA BROODMOTHER v4: mound nest + alpha head + bone lotus
  D.hydra_broodmother = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-40), lite=shade(tint,30);
    px(g,4,28,24,8,dk); px(g,6,26,20,6,tint);
    px(g,8,24,5,4,"#e8e0d0"); px(g,19,24,5,4,"#e8e0d0"); px(g,13,25,6,3,"#ff6b6b");
    px(g,9,20,4,5,"#ff9d9d"); px(g,19,20,4,5,"#ff9d9d");
    const heads=[[1,12],[6,8],[11,4],[17,2],[22,6],[25,10],[13,10]];
    heads.forEach((h,i)=>{
      const sway=window.Anim.seg(P,i,1); // each neck sways out of phase
      const hx=h[0]+sway,hy=h[1]; const big=(i===3);
      px(g,hx,hy+6,2,9,tint); px(g,hx-1,hy,big?7:5,big?8:6,tint); px(g,hx,hy+1,3,3,lite);
      g.fillStyle="#ffe14d"; g.fillRect(hx,hy+3,1,1); g.fillRect(hx+3,hy+3,1,1);
      if(big && P.atk){ px(g,hx,hy+5,5,3,"#7a1f1f"); } // alpha jaw gapes on atk
      else if(big){ px(g,hx,hy+5,5,1,"#7a1f1f"); }
      if(big){ px(g,hx+1,hy+3,1,1,"#fff"); }
    });
    px(g,12,4,3,3,"#e8e0d0"); px(g,15,3,4,5,"#ff9dc9"); px(g,19,4,3,3,"#e8e0d0"); px(g,16,4,2,3,"#ffd93d");
  };
  // LEVIATHAN v4: whale bulk + coral antlers + harpoons + runes
  D.leviathan = (g,tint)=>{
    const dk=shade(tint,-40), lite=shade(tint,30);
    px(g,3,26,24,8,dk); px(g,5,24,20,6,tint); px(g,5,24,20,2,lite);
    px(g,7,28,4,2,"#e8e0d0"); px(g,13,28,4,2,"#c9c9c9"); px(g,19,28,4,2,"#e8e0d0");
    px(g,17,10,11,11,tint); px(g,18,11,9,3,lite); px(g,19,16,9,5,"#0c1a24");
    px(g,20,17,7,4,"#e8e0d0"); for(let i=0;i<4;i++) px(g,21+i*2,18,1,3,"#7a8a9a");
    g.fillStyle="#ffe14d"; g.fillRect(20,13,2,3); g.fillRect(25,13,2,3); g.fillStyle="#111"; g.fillRect(20,14,1,2); g.fillRect(25,14,1,2);
    px(g,12,14,6,3,"#7ad9f0"); px(g,13,15,4,4,"#0e5a7a"); px(g,14,16,2,2,"#bfe8ff");
    g.fillStyle=lite; g.beginPath(); g.moveTo(11,22); g.lineTo(3,10); g.lineTo(8,22); g.fill();
    px(g,9,2,3,6,"#ff8a7a"); px(g,13,1,4,7,"#ff6b5a"); px(g,18,2,3,6,"#ffb0a0"); px(g,10,2,2,1,"#fff"); px(g,14,1,2,1,"#fff");
    px(g,6,20,8,1,"#5a3a22"); px(g,7,19,6,1,"#8a5a33"); px(g,12,0,4,5,"#bfe8ff"); px(g,13,0,2,1,"#fff");
  };
  // THRESHOLD DEVOURER v4: the gate that lies. Stone arch fused to flesh,
  // void maw with a swirling core, four rim eyes, side tentacles, portal-
  // shard crown + runed pillars + claw arms. Reads as a dungeon gate first,
  // a boss second — nothing like the chest teeth.
  D.portal_devourer = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const pulse=P.atk?2:(P.moving?[0,1,0,-1][P.f&3]:0);
    const sw=window.Anim.seg(P,0,1);
    const stone="#6a6a7a", stoned="#3a3a4a", flesh="#4a2a8a", glow="#a678ff";
    // stub legs alternate the stomp while the portal advances.
    const st=P.moving?((P.f&1)?1:-1):0;
    px(g,10,31-(st>0?2:0),3,5,stoned); px(g,19,31-(st<0?2:0),3,5,stoned);
    px(g,9,35-(st>0?2:0),5,2,"#2a2a3a"); px(g,18,35-(st<0?2:0),5,2,"#2a2a3a");
    px(g,6,14,5,18,stone); px(g,21,14,5,18,stone); px(g,6,14,5,2,flesh); px(g,21,14,5,2,flesh);
    px(g,7,18,3,3,glow); px(g,8,19,1,1,"#fff"); px(g,22,22,3,3,glow); px(g,23,23,1,1,"#fff");
    px(g,7,26,3,2,"#c9a227"); px(g,22,26,3,2,"#c9a227");
    px(g,6,10,20,5,stone); px(g,6,10,20,1,"#e8e4d8"); px(g,6,13,20,2,stoned);
    px(g,10,4,3,7,glow); px(g,14,2,4,9,"#7a4ae0"); px(g,19,4,3,7,glow);
    px(g,11,4,1,2,"#fff"); px(g,15,2,2,3,"#fff"); px(g,20,4,1,2,"#fff");
    px(g,14,8,4,6,"#ffd93d"); g.fillStyle="#111"; g.fillRect(15,10,2,3); g.fillStyle="#fff"; g.fillRect(14,8,1,1);
    // void maw gapes + swirls on atk
    px(g,11,16,10,14,"#0c0a1a");
    px(g,12,17,8,3,"#7a4ae0"); px(g,13,20,6,3+pulse,glow); px(g,14,23,4,3,"#d9c9ff");
    px(g,14,20,4,4,"#fff"); g.fillStyle="#111"; g.fillRect(15,21,2,3);
    for(let i=0;i<4;i++){ px(g,11+i*3,14,2,3,"#e8e0d0"); px(g,11+i*3,29,2,3,"#e8e0d0"); }
    px(g,9,16,2,4,"#e8e0d0"); px(g,21,16,2,4,"#e8e0d0"); px(g,9,26,2,4,"#e8e0d0"); px(g,21,26,2,4,"#e8e0d0");
    g.fillStyle="#ffe14d"; g.fillRect(7,12,3,3); g.fillRect(22,12,3,3);
    g.fillStyle="#111"; g.fillRect(8,13,1,2); g.fillRect(23,13,1,2);
    g.fillStyle="#ff6b6b"; g.fillRect(7,27,3,3); g.fillRect(22,27,3,3);
    g.fillStyle="#111"; g.fillRect(8,28,1,2); g.fillRect(23,28,1,2);
    px(g,1,20+sw,5,10,stoned); px(g,26,20-sw,5,10,stoned);
    px(g,0,28+sw,6,3,"#e8e0d0"); px(g,26,28-sw,6,3,"#e8e0d0");
    px(g,2,14+sw,4,12,flesh); px(g,26,14-sw,4,12,flesh);
    px(g,3,16,2,2,"#e8d9e8"); px(g,3,20,2,2,"#e8d9e8"); px(g,27,16,2,2,"#e8d9e8"); px(g,27,20,2,2,"#e8d9e8");
  };
  // VOIDSTALKER v6: bright wide voidglass shard-blade (white core, violet
  // body, glints), gripped clear of the head; long-clawed lower arm; big
  // mask with bleeding eye; torn flank vent; sweeping crown; gold sash.
  D.voidstalker = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const hover=window.Anim.seg(P,0,1), hd=window.Anim.hbob(P);
    const cloak = "#131024", inner = "#2a1f5c", rim = "#7a4ae0", glow = "#d08aff";
    // aura
    g.fillStyle = "rgba(130,70,230,0.22)"; g.beginPath(); g.ellipse(16, 22, 12, 15, 0, 0, 7); g.fill();
    // hanging tatter strips writhe
    px(g,10,32+hover*2,2,5,"#0b0716"); px(g,14,33-hover*2,2,4,"#0b0716"); px(g,18,33+hover*2,2,4,"#0b0716"); px(g,21,31-hover*2,2,5,"#0b0716");
    // LEFT arm raised high, gripping the shard-blade — slashes down on atk
    const sw=P.atk?6:0;
    px(g,6,9+sw+hd,2,8,cloak); px(g,6,9+sw+hd,1,8,rim);
    px(g,4,15+sw+hd,4,3,cloak);
    px(g,3,17+sw+hd,2,2,"#e8e0d0"); px(g,6,17+sw+hd,2,2,"#e8e0d0");
    // voidglass shard-blade: BRIGHT violet wedge, white core, glints
    px(g,3,1+sw+hd,3,13,glow); px(g,4,1+sw+hd,1,13,"#ffffff");
    px(g,3,1+sw+hd,3,2,"#efe0ff");
    px(g,2,3+sw+hd,1,3,rim); px(g,6,5+sw+hd,1,4,rim);
    px(g,3,6+sw+hd,1,2,"#fff"); px(g,4,10+sw+hd,1,2,"#fff");
    // RIGHT arm lowered, long claws
    px(g,26,16,2,10,cloak);
    px(g,25,26,3,2,"#e8e0d0");
    px(g,25,28,1,6,"#e8e0d0"); px(g,26,28,1,5,"#cfc4b8"); px(g,27,28,1,6,"#e8e0d0");
    // torso: sloped shoulders, waist, flared skirt
    px(g,9,13,14,3,cloak);
    px(g,13,13,4,3,rim);
    px(g,11,16,10,6,cloak); px(g,12,17,8,5,inner);
    px(g,10,22,12,6,cloak); px(g,9,28,14,4,cloak);
    px(g,10,22,1,10,rim); px(g,21,22,1,6,rim);
    // diagonal fold shading
    px(g,13,17,1,4,"#0b0716"); px(g,16,20,1,4,"#0b0716"); px(g,14,24,1,4,"#0b0716");
    // torn flank venting void light
    px(g,19,20,2,5,glow); px(g,19,20,1,1,"#fff"); px(g,18,21,4,1,"#0b0716"); px(g,18,25,4,1,"#0b0716");
    // stars
    px(g,12,24,1,1,"#bfe8ff"); px(g,15,27,1,1,"#7fd4ff"); px(g,19,29,1,1,"#bfe8ff"); px(g,11,29,1,1,"#ffffff");
    // gold sash + big gem
    px(g,10,25,12,2,"#ffd93d"); px(g,15,25,3,3,"#c93b3b"); g.fillStyle="#fff"; g.fillRect(16,26,1,1);
    // long neck + big mask
    px(g,14,11+hd,4,3,"#cfc4b8");
    px(g,11,3+hd,10,9,"#e8e0d0"); px(g,12,3+hd,8,1,"#ffffff");
    px(g,11,3+hd,1,9,"#b8ac9c"); px(g,20,3+hd,1,9,"#8a8078");
    // blazing eye with halo bleed
    px(g,13,4+hd,6,8,"#2a1a4a");
    px(g,15,4+hd,2,8,glow);
    px(g,14,7+hd,1,2,glow); px(g,17,7+hd,1,2,glow);
    px(g,14,12+hd,2,1,glow); px(g,17,12+hd,2,1,glow);
    g.fillStyle="#fff"; g.fillRect(15,7+hd,2,3);
    g.fillStyle="#111"; g.fillRect(15,4+hd,2,1); g.fillRect(15,11+hd,2,1);
    // sweeping crown shards
    px(g,8,0+hd,2,5,rim); px(g,11,0+hd,2,7,"#2a1a4a"); px(g,14,0+hd,3,8,glow); px(g,18,0+hd,2,6,rim); px(g,21,1+hd,2,4,"#2a1a4a");
    px(g,8,0+hd,1,1,"#fff"); px(g,14,0+hd,1,2,"#fff"); px(g,18,0+hd,1,1,"#fff");
  };
  // BABA YAGA v4: huge hair + hut staff + skull garland
  D.baba_yaga = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    px(g,11+A.lx,28+A.ld,4,8,"#3a2a3a"); px(g,17+A.rx,28+A.rd,4,8,"#3a2a3a");
    px(g,9,18,14,12,"#4a2a4a"); px(g,10,24,12,4,"#2a1a2a"); px(g,14,26,4,2,"#c9b98a");
    px(g,4+A.hx,4+hb,24,16,"#8a8a8a"); px(g,6+A.hx,6+hb,20,12,"#c9c9c9");
    px(g,6+A.hx,0+hb,3,8,"#8a8a8a"); px(g,13+A.hx,0+hb,4,9,"#a0a0a0"); px(g,20+A.hx,0+hb,3,8,"#8a8a8a");
    px(g,7+A.hx,2+hb,2,3,"#e8e4d8"); px(g,23+A.hx,4+hb,2,3,"#e8e4d8");
    px(g,11+A.hx,8+hb,10,10,"#e8d9c0"); g.fillStyle="#111"; g.fillRect(12+A.hx,11+hb,2,4); g.fillRect(18+A.hx,11+hb,2,4);
    px(g,13+A.hx,15+hb,6,4,"#5a5a5a"); g.fillStyle="#222"; for(let b=0;b<3;b++) g.fillRect(14+b*2+A.hx,15+hb,1,4);
    px(g,13+A.hx,19+hb+(P.atk?2:0),6,1,"#7a1f1f");
    px(g,7+A.lax,18+A.la,4,4,"#e8e4d8"); px(g,21+A.rax,18+A.ra,4,4,"#e8e4d8"); g.fillStyle="#111"; g.fillRect(8+A.lax,19+A.la,1,2); g.fillRect(22+A.rax,19+A.ra,1,2);
    px(g,4+A.lax,24+A.la,3,7,"#c9c9c9"); px(g,25+A.rax,24+A.ra,3,7,"#c9c9c9");
    px(g,25+A.rax,12+A.ra-(P.atk?5:0),2,16,"#8a5a33"); px(g,22+A.rax,6+A.ra-(P.atk?5:0),8,7,"#6b4226"); px(g,23+A.rax,4+A.ra-(P.atk?5:0),6,3,"#8a5a33");
    px(g,23,8,2,3,"#2a1a0a"); px(g,27,8,2,3,"#2a1a0a"); px(g,24,11,4,1,"#ffd93d");
  };

  // DROWNED CAPTAIN v2: barnacled tricorn + kelp beard + crab epaulette + wheel medallion + cutlass + ghost lantern + drowned aura
  D.drowned_captain = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const coat = "#1e3a4a", dark = "#0e1e28", gold = "#c9a227", skin = "#8aa89a";
    // drowned aura
    g.fillStyle = "rgba(127,212,255,0.14)"; g.beginPath(); g.ellipse(16, 22, 13, 14, 0, 0, 7); g.fill();
    // peg leg + sea boot
    px(g,12+A.lx,31+A.ld,2,5,"#c9c9c9"); px(g,11+A.lx,35+A.ld,4,1,"#5a5a5a");
    px(g,18+A.rx,30+A.rd,4,6,"#3a2a1a"); px(g,17+A.rx,34+A.rd,6,2,"#1a1410");
    // flared greatcoat, long left tail
    px(g,7,16,18,14,coat); px(g,7,16,18,2,gold); px(g,7,28,18,3,dark);
    px(g,7,30,6,6,coat); px(g,18,30,6,4,coat); px(g,8,30,5,1,dark); px(g,19,30,4,1,dark);
    px(g,8,24,16,2,"#7a5a33"); px(g,15,22,2,6,"#7a5a33"); px(g,14,24,4,2,gold);
    px(g,15,18,2,2,gold); px(g,15,27,2,2,gold);
    // barnacle clusters on coat
    px(g,9,20,2,2,"#e8e4d8"); px(g,21,26,2,2,"#e8e4d8"); px(g,20,19,1,1,"#e8e4d8");
    // ship-wheel medallion
    px(g,13,20,6,6,"#5a3a22"); px(g,14,21,4,4,gold); px(g,15,22,2,2,dark);
    // crab epaulette (left, big) + rope pad (right)
    px(g,1,12,9,6,"#c94a3a"); px(g,2,13,7,3,"#e06a5a");
    g.fillStyle = "#111"; g.fillRect(3,14,1,2); g.fillRect(6,14,1,2); g.fillRect(8,14,1,2);
    px(g,4,12,2,1,"#fff"); px(g,7,12,2,1,"#fff");
    px(g,22,12,8,4,"#2a4a5a"); px(g,23,12,6,1,"#7fd4ff");
    // head bobs + kelp beard sways + gold tooth grin on atk
    px(g,10+A.hx,8+hb,12,9,skin); px(g,11+A.hx,9+hb,10,2,"#6a8a7a");
    px(g,11+A.hx,14+hb,10,3,"#2a5a3a"); px(g,12+A.hx,16+hb,3,3,"#4a8a4a"); px(g,17+A.hx,16+hb,2,3,"#4a8a4a");
    px(g,14+A.hx,15+hb,2,2,"#fff"); px(g,17+A.hx,15+hb+(P.atk?1:0),1,2,gold);
    g.fillStyle = "#7fd4ff"; g.fillRect(12+A.hx,11+hb,3,2); g.fillRect(18+A.hx,11+hb,3,2);
    g.fillStyle = "#fff"; g.fillRect(13+A.hx,11+hb,1,1); g.fillRect(19+A.hx,11+hb,1,1);
    px(g,9+A.hx,12+hb,2,2,gold);
    // barnacled tricorn rides the head with skull
    px(g,4+A.hx,2+hb,24,4,"#1a2a3a"); px(g,4+A.hx,2+hb,24,1,gold);
    px(g,0+A.hx,4+hb,7,4,"#1a2a3a"); px(g,25+A.hx,4+hb,7,4,"#1a2a3a"); px(g,0+A.hx,4+hb,7,1,gold); px(g,25+A.hx,4+hb,7,1,gold);
    px(g,13+A.hx,0+hb,6,4,"#1a2a3a"); px(g,13+A.hx,0+hb,6,1,gold);
    px(g,6+A.hx,3+hb,2,2,"#e8e4d8"); px(g,24+A.hx,3+hb,2,2,"#e8e4d8"); px(g,15+A.hx,1+hb,2,2,"#e8e4d8"); px(g,2+A.hx,5+hb,1,1,"#e8e4d8");
    px(g,14+A.hx,3+hb,4,3,"#e8e4d8"); g.fillStyle = "#111"; g.fillRect(15+A.hx,4+hb,1,1); g.fillRect(17+A.hx,4+hb,1,1);
    // long barnacled cutlass slashes on atk with glint
    const cs=P.atk?5:0;
    px(g,25+A.rax,18+A.ra-cs,2,12,"#8a5a33"); px(g,23+A.rax,16+A.ra-cs,6,3,gold);
    px(g,26+A.rax,6+A.ra-cs,2,14,"#c9ccd4"); px(g,26+A.rax,6+A.ra-cs,2,2,"#fff"); px(g,26+A.rax,12+A.ra-cs,1,3,"#fff");
    px(g,26+A.rax,18+A.ra-cs,3,2,"#7a8a99"); px(g,27+A.rax,10+A.ra-cs,1,3,"#5a6a7a");
    // ghost ship lantern sways in the other hand with halo
    g.fillStyle = "rgba(127,212,255,0.25)"; g.beginPath(); g.arc(4, 18+A.la, 5, 0, 7); g.fill();
    px(g,4+A.lax,18+A.la,2,10,"#3a2a1a"); px(g,1+A.lax,15+A.la,7,7,"#1a2a3a"); px(g,2+A.lax,16+A.la,5,5,"#7fd4ff"); px(g,3+A.lax,17+A.la,3,3,"#fff");
    px(g,2+A.lax,15+A.la,5,1,gold);
  };
  // KAPPA KING v2: sumo girth + golden dish + shell throne + sashimono war-flag + tide trident
  D.kappa_king = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const skin = "#3a9a5a", dark = "#1e5a2e", lite = "#5ac87a", gold = "#ffd93d";
    // sashimono war-flag (silhouette spike, wave emblem)
    px(g,24,0,2,18,"#3a2a1a"); px(g,22,1,10,8,"#1a5a6a"); px(g,22,1,10,1,"#fff");
    px(g,23,3,8,4,"#7fd4ff"); px(g,24,4,6,2,"#fff"); px(g,22,1,2,8,gold); px(g,30,1,2,8,gold);
    // webbed feet stamp
    px(g,9+A.lx,32+A.ld,5,4,dark); px(g,18+A.rx,32+A.rd,5,4,dark); px(g,8+A.lx,34+A.ld,6,2,"#2a4a3a"); px(g,18+A.rx,34+A.rd,6,2,"#2a4a3a");
    // sumo belly wide + mawashi belt
    px(g,5,20,22,12,skin); px(g,5,20,22,2,lite); px(g,5,28,22,3,dark);
    px(g,7,25,18,4,"#1a1a24"); px(g,13,25,6,4,gold); px(g,14,26,4,2,"#c93b3b");
    // kelp sash diagonal
    px(g,6,21,4,3,"#2a5a3a"); px(g,10,23,4,2,"#4a8a4a"); px(g,14,24,4,2,"#2a5a3a"); px(g,19,25,4,1,"#4a8a4a");
    // shell back plates + ridge
    px(g,2,18,4,10,"#5a3a22"); px(g,2,20,4,2,gold); px(g,27,18,3,10,"#5a3a22");
    px(g,6,19,2,6,"#5a3a22"); px(g,6,21,2,2,gold);
    // arms swing: webbed claws
    px(g,3+A.lax,20+A.la,3,8,skin); px(g,2+A.lax,27+A.la,4,3,"#9adcff"); px(g,26+A.rax,20+A.ra,3,8,skin); px(g,26+A.rax,27+A.ra,4,3,"#9adcff");
    // head bobs + beak snaps on atk + gold tooth + earring
    px(g,10+A.hx,10+hb,12,10,skin); px(g,11+A.hx,11+hb,10,3,lite);
    px(g,13+A.hx,15+hb+(P.atk?1:0),6,4,"#e8d9a0"); px(g,14+A.hx,16+hb+(P.atk?1:0),2,2,"#fff"); px(g,16+A.hx,16+hb+(P.atk?1:0),2,2,gold);
    g.fillStyle = "#ffe14d"; g.fillRect(12+A.hx,12+hb,3,3); g.fillRect(18+A.hx,12+hb,3,3);
    g.fillStyle = "#111"; g.fillRect(13+A.hx,13+hb,1,2); g.fillRect(19+A.hx,13+hb,1,2);
    px(g,9+A.hx,13+hb,2,2,gold);
    // golden dish crown rides the head with water shimmer
    px(g,9+A.hx,4+hb,14,4,gold); px(g,9+A.hx,4+hb,14,1,"#fff"); px(g,10+A.hx,5+hb,12,2,"#7fd4ff");
    px(g,11,5,3,1,"#fff"); px(g,16,5,4,2,"#2a9ac9"); px(g,20,5,2,1,"#fff");
    px(g,8,7,16,2,"#8a6a1a"); px(g,12,2,8,2,gold);
    // shell pauldrons (left big)
    px(g,3,14,7,5,"#5a3a22"); px(g,4,15,5,3,"#8a5a33"); px(g,22,14,6,5,"#5a3a22"); px(g,23,15,4,3,"#8a5a33");
    // tide trident stabs on atk with seaweed wrap
    px(g,1,6-(P.atk?5:0),2,24,"#8a5a33"); px(g,1,14-(P.atk?5:0),2,3,"#2a5a3a"); px(g,1,20-(P.atk?5:0),2,2,"#4a8a4a");
    px(g,0,4-(P.atk?5:0),5,4,"#7fd4ff"); px(g,1,2-(P.atk?5:0),1,4,"#7fd4ff"); px(g,3,2-(P.atk?5:0),1,4,"#7fd4ff");
    px(g,1,4-(P.atk?5:0),4,1,"#fff"); px(g,0,10-(P.atk?5:0),3,3,"#2a5a3a");
  };
  // RUSALKA QUEEN v2: waterfall mane + veil wings + pearl ice-crown + mirror staff + floating shards
  D.rusalka_queen = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const drift=window.Anim.seg(P,0,1), lift=P.atk?3:0;
    // glide: the whole figure sways with the stride while hovering.
    const gl=P.moving?([0,1,0,-1][P.f&3]):0;
    const skin = "#e8f0e8", hair = "#2a9a8a", hairD = "#1a5a4a", glow = "#bfe8ff";
    // drowned aura + floating shards
    g.fillStyle = "rgba(122,217,201,0.18)"; g.beginPath(); g.ellipse(16, 21, 14, 14, 0, 0, 7); g.fill();
    px(g,2,10,3,3,glow); px(g,27,6,3,3,glow); px(g,28,7,1,1,"#fff");
    // floating wisp tail drifts with foam
    g.fillStyle = "rgba(122,217,201,0.35)"; g.beginPath(); g.ellipse(16,34,7,4,0,0,7); g.fill();
    px(g,12,28+drift,8,8,hair); px(g,13,30+drift,6,5,hairD); px(g,11,32+drift,3,3,hair); px(g,18,32-drift,3,3,hair);
    px(g,14,30+drift,4,2,glow); px(g,15,30+drift,2,1,"#fff");
    // long wave-hem dress + pearl garland
    px(g,9+gl,20,14,12,"#1a4a5a"); px(g,9+gl,20,14,2,glow); px(g,9+gl,30,14,2,"#2a6a7a");
    px(g,11+gl,24,10,6,"#2a6a7a"); px(g,12+gl,26,3,3,"#7ad9c9"); px(g,18+gl,26,3,3,"#7ad9c9");
    px(g,13+gl,22,2,6,"#e8d9c0"); px(g,17+gl,22,2,6,"#e8d9c0");
    g.fillStyle = "#fff"; g.fillRect(14+gl,23,1,2); g.fillRect(18+gl,23,1,2);
    px(g,11+gl,20,10,2,"#fff"); px(g,12+gl,20,2,2,"#7ad9c9"); px(g,15+gl,20,2,2,glow); px(g,18+gl,20,2,2,"#7ad9c9");
    // arms sway pale + bracelets + wide veil wings (thrown up on atk)
    px(g,4+gl,18-lift,4,10,skin); px(g,24+gl,18-lift,4,10,skin);
    px(g,4+gl,24-lift,4,2,glow); px(g,24+gl,24-lift,4,2,glow);
    px(g,1+gl,14-lift,5,12,hair); px(g,1+gl,14-lift,5,2,glow); px(g,26+gl,14-lift,5,12,hair); px(g,26+gl,14-lift,5,2,glow);
    // head + weeping glow eyes
    px(g,11+gl,10,10,9,skin);
    g.fillStyle = "#7fd4ff"; g.fillRect(12+gl,13,3,3); g.fillRect(18+gl,12,3,2);
    g.fillStyle = "#fff"; g.fillRect(13+gl,13,1,2); g.fillRect(18+gl,12,1,1);
    px(g,12+gl,16,1,2,glow); px(g,19+gl,15,1,2,glow);
    px(g,14+gl,17,4,1,"#a02040");
    // wide waterfall mane
    px(g,3+gl,2,26,10,hair); px(g,3+gl,2,26,2,glow); px(g,2+gl,6,5,16,hair); px(g,25+gl,6,5,16,hair);
    px(g,2+gl,8,2,10,glow); px(g,28+gl,8,2,10,glow);
    px(g,7+gl,0,5,7,hair); px(g,20+gl,0,5,7,hair); px(g,13+gl,0,6,6,hairD); px(g,14+gl,1,4,4,hair);
    // fish + flower + pearl in hair
    px(g,5+gl,4,4,2,"#ff8a7a"); px(g,5+gl,4,1,1,"#111"); px(g,9+gl,5,1,1,glow);
    px(g,23+gl,3,3,3,"#fff"); px(g,24+gl,4,1,1,"#ffd93d"); px(g,6+gl,7,2,2,"#fff");
    // big pearl ice-crown
    px(g,10+gl,0,12,4,glow); px(g,10+gl,0,12,1,"#fff");
    px(g,10+gl,0,3,5,glow); px(g,15+gl,0,3,6,glow); px(g,19+gl,0,3,5,glow);
    px(g,11+gl,0,1,2,"#fff"); px(g,16+gl,0,1,3,"#fff"); px(g,20+gl,0,1,2,"#fff");
    px(g,13+gl,4,2,2,"#fff"); px(g,18+gl,4,1,1,"#fff");
    // mirror shard staff rises on atk with halo
    g.fillStyle = "rgba(191,232,255,0.3)"; g.beginPath(); g.arc(27+gl, 11-lift, 5, 0, 7); g.fill();
    px(g,26+gl,12-lift,2,18,"#8a5a33"); px(g,24+gl,7-lift,7,7,glow); px(g,25+gl,8-lift,5,5,"#fff"); px(g,26+gl,9-lift,3,3,"#7fd4ff"); px(g,26+gl,9-lift,1,1,"#fff");
    px(g,26+gl,18-lift,2,2,"#c9a227");
  };
  // INSECT BOSSES v1: broodmother, colony queen, sting emperor.
  // Each scores 8+/10 on: silhouette / theme / readability / palette / regalia / composition.
  D.tarantula_broodmother = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-45), lite=shade(tint,30);
    // dragline web strands + hanging egg sacs sway
    const swy=window.Anim.seg(P,1,0);
    px(g,2,0,1,14,"rgba(230,220,200,0.7)"); px(g,29,0,1,12,"rgba(230,220,200,0.7)");
    px(g,0,12+swy,5,5,"#e8d9c9"); px(g,1,13+swy,3,3,tint);
    px(g,27,10-swy,5,5,"#e8d9c9"); px(g,28,11-swy,3,3,tint);
    // eight massive legs alternate — kept on-canvas, jointed
    for(let s=0;s<4;s++){ const y=17+s*4, o=window.Anim.seg(P,s,1);
      px(g,4,y+o,5,2,dk); px(g,23,y-o,5,2,dk);
      px(g,1,y+2+o,3,5,dk); px(g,28,y+2-o,3,5,dk);
      px(g,2,y+2+o,2,1,lite); px(g,28,y+2-o,2,1,lite);
      px(g,1,y+6+o,3,1,dk); px(g,28,y+6-o,3,1,dk);
    }
    // brood abdomen: egg-pale clutch glowing through the dark
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,27,10,7,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,26,9,6,0,0,7); g.fill();
    g.fillStyle=lite; g.beginPath(); g.ellipse(14,23,4,3,-0.4,0,7); g.fill();
    for(let ei=0;ei<5;ei++) px(g,11+ei*2,26,1,2,"#ffe9a8");
    // cephalothorax + fang crown
    px(g,10,13,12,8,tint); px(g,11,14,10,2,lite);
    px(g,10,11,3,4,"#e8e0d0"); px(g,14,10,3,5,"#e8e0d0"); px(g,19,10,3,5,"#fff"); px(g,22,11,3,4,"#e8e0d0");
    // four bleeding eyes
    g.fillStyle="#ff3b3b"; g.fillRect(12,15,4,4); g.fillRect(18,15,3,3);
    g.fillStyle="#fff"; g.fillRect(13,15,1,1); g.fillRect(18,15,1,1);
    g.fillStyle="#7a1f1f"; g.fillRect(13,19,2,1); g.fillRect(18,19,2,1);
    // huge fangs drip venom on atk
    px(g,11,21,4,6,"#e8e0d0"); px(g,17,21,4,6,"#e8e0d0");
    px(g,12,27+(P.atk?2:0),2,2,"#7dff9b"); px(g,18,27+(P.atk?2:0),2,2,"#7dff9b");
    px(g,8,19,2,5,dk); px(g,22,19,2,5,dk);
  };
  D.siege_queen = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-45), lite=shade(tint,25), gold="#ffd93d";
    // royal carpet of dug earth + egg clutch
    px(g,2,32,28,4,"#4a3320"); px(g,6,31,4,2,"#5a4028"); px(g,22,31,4,2,"#5a4028");
    px(g,4,30,4,3,"#e8d9c9"); px(g,5,30,2,2,tint); px(g,24,30,4,3,"#e8d9c9"); px(g,25,30,2,2,tint);
    // six column legs stamp in waves
    for(let l=0;l<3;l++){ const y=23+l*3, o=window.Anim.seg(P,l,1); px(g,3,y+o,4,2,dk); px(g,25,y-o,4,2,dk); px(g,2,y+1+o,2,4,dk); px(g,28,y+1-o,2,4,dk); }
    // mountainous plated bulk (fused plates, gold trim)
    // mountainous plated bulk (fused plates, gold trim)
    px(g,7,24,18,9,dk); px(g,8,25,16,7,tint); px(g,8,25,16,2,lite);
    px(g,8,27,16,1,gold); px(g,8,30,16,1,gold);
    px(g,9,20,14,6,dk); px(g,10,21,12,4,tint);
    px(g,10,14,12,7,dk); px(g,11,15,10,5,tint); px(g,12,15,8,1,lite);
    // crown of the deep nest
    px(g,10,8,12,4,dk); px(g,10,8,12,1,gold);
    px(g,11,4,3,5,gold); px(g,15,3,3,6,"#fff"); px(g,19,4,3,5,gold);
    px(g,12,4,1,1,"#ff9d2e"); px(g,16,3,1,2,"#ff9d2e"); px(g,20,4,1,1,"#ff9d2e");
    // colossal mandibles snap shut on atk
    px(g,4,17,6,9,dk); px(g,2,22,4,6,tint); px(g,2,26,3,2,"#e8e0d0");
    px(g,22,17,6,9,dk); px(g,26,22,4,6,tint); px(g,27,26,3,2,"#e8e0d0");
    g.fillStyle="#ff9d2e"; g.fillRect(13,17,3,3); g.fillRect(18,17,2,2);
    if(P.atk){ px(g,16,17,2,3,"#fff"); px(g,13,20,7,2,"#7a1f1f"); }
    g.fillStyle="#ff9d2e"; g.fillRect(13,17,3,3); g.fillRect(18,17,2,2);
    g.fillStyle="#111"; g.fillRect(14,18,1,2);
  };
  D.scorpion_emperor = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-45), lite=shade(tint,35), gold="#ffd93d";
    // massive tail arcs high lashing side to side, imperial sting drips on atk
    const tw=window.Anim.seg(P,0,1), tw2=window.Anim.seg(P,1,1);
    px(g,2,22,5,6,dk); px(g,4,17,5,5,tint); px(g,7,12,5,5,tint); px(g,11,8,5,5,dk);
    px(g,15,5+tw,5,5,tint); px(g,19,3+tw2,5,4,dk); px(g,20,3+tw2,3,1,lite);
    px(g,21,0+tw2,5,4,"#1a1a1a"); px(g,22,0+tw2+(P.atk?1:0),3,3,"#7dff9b"); px(g,23,0+tw2,1,1,"#fff");
    // jeweled tail bands ride along
    px(g,8,12,3,2,gold); px(g,12,8,3,2,gold); px(g,16,5+tw,3,2,gold);
    // wide armored body heaves
    const heave=P.moving?[0,-1,0,1][P.f&3]:0;
    px(g,3,26+heave,22,7,dk); px(g,4,27+heave,20,5,tint);
    px(g,6,27+heave,2,5,lite); px(g,10,27+heave,2,5,lite); px(g,14,27+heave,2,5,lite); px(g,18,27+heave,2,5,lite); px(g,22,27+heave,2,5,lite);
    px(g,4,26+heave,20,1,gold);
    for(let l=0;l<3;l++){ px(g,6+l*6,33,2,3,dk); }
    // imperial head + BIG crusher claws snap on atk with pincer gaps
    const snap=P.atk?2:0;
    px(g,23,23,4,7,tint);
    px(g,26,20-snap,5,7,dk); px(g,27,19-snap,4,6,tint); px(g,27,19-snap,4,1,lite);
    px(g,27,22-snap,2,2,dk); px(g,30,22-snap,2,2,dk); // pincer gap + teeth
    px(g,28,24-snap,3,3,"#e8e0d0"); px(g,29,19-snap,2,2,gold);
    px(g,0,14,5,8,dk); px(g,0,12,4,6,tint); px(g,0,12,4,1,lite);
    px(g,0,16,2,2,dk); px(g,3,16,2,2,dk);
    px(g,1,19,2,3,"#e8e0d0");
    g.fillStyle="#ff3b3b"; g.fillRect(24,25,2,2); g.fillStyle="#fff"; g.fillRect(24,25,1,1);
    // sun-disk crown
    px(g,22,18,6,2,gold); g.fillStyle=gold; g.beginPath(); g.arc(25,15,3,0,7); g.fill();
    g.fillStyle="#ff9d2e"; g.beginPath(); g.arc(25,15,1.5,0,7); g.fill();
  };
  const orig = window.Sprites.actor;
  // NOTE: app (custom face/outfit) must be forwarded — heroes AND npcs use
  // it, and dropping it renders everyone in the legacy default look.
  // PERF: cache pure (kind,tint) boss paints (see mobs.js) — the old code
  // allocated a fresh canvas per boss per frame.
  const bossCache = new Map();
  try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(() => bossCache.clear()); } catch (e) {}
  window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
    if (D[kind]){
      gen = (gen === "male" || gen === "female") ? gen : "";
      let P = null, bk = "";
      try {
        if (window.Anim) {
          if (ph) { P = window.Anim.normP(ph); bk = "|"+window.Anim.bucket(ph); }
          else P = window.Anim.normP(null);
        }
      } catch(e){ P = { f:0, moving:false, hurt:false, atk:false, atkKind:"melee", idle:0, t:0 }; }
      const ck = kind + "|" + (tint || "#fff") + "|" + gen + bk;
      let hit = null;
      try { hit = bossCache.get(ck); } catch (e) { hit = null; }
      if (hit) return hit;
      const c=cv(); const g=c.getContext("2d"); g.imageSmoothingEnabled=false;
      g.clearRect(0,0,32,40);
      g.fillStyle="rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
      try{ D[kind](g,tint||"#fff",P); }catch(e){}
      let out = c;
      try { out = window.Sprites.genderFX(c, gen); } catch (e) {}
      try { bossCache.set(ck, out); if (bossCache.size > 700) bossCache.delete(bossCache.keys().next().value); } catch (e) {}
      return out;
    }
    return orig.call(this,kind,tint,seed,gear,app,gen,ph);
  };
})();
