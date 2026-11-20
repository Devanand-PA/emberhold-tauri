/* Sprite overhaul v1 — winged priority batch.
   Loaded AFTER mobs2.js, overrides Sprites.actor for weak winged kinds.
   Design: side/three-quarter silhouettes, full-span wings, thematic heads/tails.
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
  // Current limb pose for shared helpers (wingBroad/wingMemb/beastBase):
  // the actor wrapper sets this before each paint so helpers animate with
  // zero per-painter edits. Individual painters get P as their 3rd arg.
  let curP = null;

  // HARPY v2.1: layered pinions, scaled talons (rated 8.5 -> target 9+).
  D.harpy = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?2:P.atk?-4:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
    const dk=shade(tint,-45), mid=shade(tint,-10), lite=shade(tint,35), feather=shade(tint,15);
    // WINGS beat: whole sail assembly rides the lift
    g.save(); g.translate(0,W);
    // WINGS: dark outline sail + 2 feather rows + pale tips
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(13,22); g.lineTo(0,5); g.lineTo(2,13); g.lineTo(5,11); g.lineTo(7,18); g.lineTo(10,21); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(32,5); g.lineTo(30,13); g.lineTo(27,11); g.lineTo(25,18); g.lineTo(22,21); g.fill();
    px(g,1,6,3,6,mid); px(g,28,6,3,6,mid);
    px(g,2,12,3,5,feather); px(g,27,12,3,5,feather);
    px(g,3,16,3,3,lite); px(g,26,16,3,3,lite);
    px(g,0,8,2,3,lite); px(g,30,8,2,3,lite);
    px(g,5,12,1,6,dk); px(g,26,12,1,6,dk); // feather separations
    g.restore();
    // scaly bird legs + 3-toe talons: alternate strides
    px(g,11+A.lx,29+A.ld,3,6,"#d9a06b"); px(g,18+A.rx,29+A.rd,3,6,"#d9a06b");
    px(g,11+A.lx,31+A.ld,1,3,"#8a5a33"); px(g,19+A.rx,31+A.rd,1,3,"#8a5a33");
    px(g,10+A.lx,34+A.ld,5,2,"#3a2a1a"); px(g,17+A.rx,34+A.rd,5,2,"#3a2a1a");
    px(g,9+A.lx,34+A.ld,2,2,"#3a2a1a"); px(g,13+A.lx,34+A.ld,2,2,"#3a2a1a"); px(g,18+A.rx,34+A.rd,2,2,"#3a2a1a"); px(g,21+A.rx,34+A.rd,2,2,"#3a2a1a");
    // feather skirt with V notches
    px(g,10,24,12,6,tint); px(g,10,24,12,1,lite);
    for(let i=0;i<4;i++){ px(g,10+i*3,27,2,3,dk); px(g,10+i*3,27,1,1,lite); }
    // woman torso (skin) with feather top
    px(g,11,16,10,9,"#e8b98a");
    px(g,11,19,10,3,tint); px(g,12,20,8,2,lite);
    px(g,12,17,3,2,"#d9a06b"); px(g,17,17,3,2,"#d9a06b");
    // arms feathered: counter-swing, flung wide when hurt
    px(g,7+A.lax,18+A.la,3,7,feather); px(g,22+A.rax,18+A.ra,3,7,feather);
    px(g,7+A.lax,24+A.la,3,2,"#e8c9a0"); px(g,22+A.rax,24+A.ra,3,2,"#e8c9a0");
    // head: woman face, long dark hair flowing
    px(g,11,7,10,9,"#f2c9a0");
    px(g,8,5,4,14,"#3a2a1a"); px(g,20,5,4,14,"#3a2a1a"); // long hair sides
    px(g,9,4,14,4,"#3a2a1a"); px(g,10,4,12,1,"#5a3a22");
    px(g,12,7,8,1,"#5a3a22"); // hairline sheen
    px(g,11,9,4,2,"#fff"); px(g,17,9,4,2,"#fff");
    g.fillStyle="#111"; g.fillRect(13,10,2,2); g.fillRect(19,10,2,2);
    g.fillStyle="#fff"; g.fillRect(13,10,1,1); g.fillRect(19,10,1,1);
    // lashes + nose + song mouth
    px(g,11,9,1,2,"#111"); px(g,21,9,1,2,"#111");
    px(g,15,12,2,2,"#c98a5a");
    px(g,14,14,4,1,"#a02040");
    // feather earrings
    px(g,8,14,2,3,lite); px(g,22,14,2,3,lite);
  };

  // PHOENIX v2.1: taloned feet, broader flame sails (rated 8 -> target 9+).
  D.phoenix = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?2:P.atk?-5:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
    const deep="#5a1408", mid="#ff5a1e", lite="#ffd93d", pale="#fff2b0";
    // FIRE WINGS beat as one sail assembly
    g.save(); g.translate(0,W);
    // FIRE WINGS: red base, orange mid, yellow tips — broader sails
    g.fillStyle="#c22e1f";
    g.beginPath(); g.moveTo(13,23); g.lineTo(0,3); g.lineTo(2,11); g.lineTo(5,9); g.lineTo(7,17); g.lineTo(10,22); g.fill();
    g.beginPath(); g.moveTo(19,23); g.lineTo(32,3); g.lineTo(30,11); g.lineTo(27,9); g.lineTo(25,17); g.lineTo(22,22); g.fill();
    px(g,0,4,3,9,mid); px(g,29,4,3,9,mid);
    px(g,2,9,3,7,lite); px(g,27,9,3,7,lite);
    px(g,3,8,2,3,pale); px(g,27,8,2,3,pale);
    px(g,5,13,2,5,mid); px(g,25,13,2,5,mid);
    // flame fingers + embers
    px(g,0,2,3,3,mid); px(g,29,2,3,3,mid);
    px(g,1,2,1,1,pale); px(g,30,2,1,1,pale);
    px(g,6,15,1,2,lite); px(g,25,15,1,2,lite);
    g.restore();
    // tail plumes: 3 flowing ribbons, rippling with stride
    const sw=window.Anim.seg(P,0,1);
    px(g,11+sw,30,3,6,mid); px(g,11+sw,30,1,6,"#c22e1f");
    px(g,15-sw,31,2,5,lite); px(g,15-sw,31,1,5,pale);
    px(g,18+sw,30,3,6,mid); px(g,20+sw,30,1,6,"#c22e1f");
    // TALONS march (not boots): scaly orange + dark claws
    px(g,12+A.lx,28+A.ld,2,3,"#e8a020"); px(g,18+A.rx,28+A.rd,2,3,"#e8a020");
    px(g,11+A.lx,30+A.ld,4,1,"#3a2a1a"); px(g,18+A.rx,30+A.rd,4,1,"#3a2a1a");
    px(g,11+A.lx,31+A.ld,1,2,"#3a2a1a"); px(g,14+A.lx,31+A.ld,1,2,"#3a2a1a"); px(g,18+A.rx,31+A.rd,1,2,"#3a2a1a"); px(g,21+A.rx,31+A.rd,1,2,"#3a2a1a");
    // body: ember breast
    px(g,11,18,10,12,mid);
    px(g,12,19,8,9,lite); px(g,13,20,6,6,pale);
    px(g,11,18,2,12,"#c22e1f"); px(g,19,18,2,12,"#c22e1f");
    // head: crested firebird
    px(g,11,9,10,10,mid);
    px(g,12,10,8,6,lite); px(g,13,11,6,3,pale);
    // crest flames
    px(g,13,3,2,6,lite); px(g,15,1,2,8,mid); px(g,17,3,2,6,lite);
    px(g,15,1,2,2,pale); px(g,13,5,2,2,pale);
    // beak hooked gold
    px(g,14,14,4,3,"#e8a020"); px(g,15,16,2,2,"#7a4a10");
    // blazing eyes
    g.fillStyle="#fff"; g.fillRect(12,12,3,3); g.fillRect(18,12,2,2);
    g.fillStyle="#111"; g.fillRect(13,13,2,2); g.fillRect(18,13,1,1);
  };

 // LESSER WYVERN v2: small drake — membrane wings, long neck, barbed tail.
 D.lesser_wyvern = (g,tint,ph)=>{
   const P=window.Anim.normP(ph), A=window.Anim.limb(P);
   const W=P.hurt?2:P.atk?-4:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
   const dk=shade(tint,-45), mid=shade(tint,-15), lite=shade(tint,35);
    // membrane wings WIDE + pale so they read vs green body — beating
    g.save(); g.translate(0,W);
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(13,22); g.lineTo(0,2); g.lineTo(2,12); g.lineTo(5,10); g.lineTo(8,18); g.lineTo(11,21); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(32,2); g.lineTo(30,12); g.lineTo(27,10); g.lineTo(24,18); g.lineTo(21,21); g.fill();
    g.fillStyle=lite;
    g.beginPath(); g.moveTo(12,20); g.lineTo(3,5); g.lineTo(5,11); g.lineTo(8,16); g.fill();
    g.beginPath(); g.moveTo(20,20); g.lineTo(29,5); g.lineTo(27,11); g.lineTo(24,16); g.fill();
    px(g,0,2,2,10,dk); px(g,30,2,2,10,dk);
    px(g,3,5,1,8,"#fff"); px(g,28,5,1,8,"#fff");
    px(g,5,8,2,5,lite); px(g,25,8,2,5,lite);
    // finger spars dark
    px(g,4,9,1,7,dk); px(g,27,9,1,7,dk);
    g.restore();
    // tail with barb lashes as it walks
    const sw=window.Anim.seg(P,0,1);
    px(g,4+sw,27,10,3,mid); px(g,2+sw,25,4,4,mid); px(g,1+sw,24,3,2,dk);
    px(g,1+sw,24,2,1,"#e8e0d0");
    // hind legs march
    px(g,10+A.lx,28+A.ld,3,6,dk); px(g,19+A.rx,28+A.rd,3,6,dk);
    px(g,9+A.lx,33+A.ld,4,2,dk); px(g,19+A.rx,33+A.rd,4,2,dk);
    // body + belly scales
    px(g,10,20,12,9,tint); px(g,10,20,12,2,lite);
    px(g,12,24,8,4,"#e8d9b8"); px(g,13,25,2,2,"#c9b896"); px(g,17,25,2,2,"#c9b896");
    // dorsal nubs
    px(g,12,18,2,2,dk); px(g,16,18,2,2,dk); px(g,20,18,2,2,dk);
    // long neck + head
    px(g,18,11,6,10,tint); px(g,19,12,4,7,lite);
    px(g,19,17,5,3,"#e8d9b8");
    px(g,18,10,7,3,tint);
    // snout + nostril + jaw that drops open on atk
    px(g,22,14,4,3,tint); px(g,24,15,1,1,"#111");
    if (!P.atk) { px(g,19,17,6,1,dk); }
    else { px(g,19,17,6,3,dk); px(g,20,18,1,2,"#fff"); px(g,23,18,1,2,"#fff"); }
    px(g,20,17,1,2,"#fff"); px(g,23,17,1,2,"#fff");
    // eye fierce + horn nubs
    g.fillStyle="#ffe14d"; g.fillRect(20,12,3,3); g.fillStyle="#111"; g.fillRect(21,13,1,2);
    g.fillStyle="#fff"; g.fillRect(20,12,1,1);
    px(g,18,8,2,3,dk); px(g,22,8,2,3,dk);
  };

 // WYVERN FLEDGLING v2: baby — huge head, tiny wings, downy fluff, big eyes.
  D.wyvern_fledgling = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?1:P.atk?-3:P.moving?[0,-2,0,1][P.f&3]:(P.idle?-2:1);
   const dk=shade(tint,-35), lite=shade(tint,30);
    // fluffy white wings flutter — large so baby reads as wyvern
    g.save(); g.translate(0,W);
    g.fillStyle="#f2ede2";
    g.beginPath(); g.moveTo(12,22); g.lineTo(1,10); g.lineTo(3,16); g.lineTo(6,15); g.lineTo(9,21); g.fill();
    g.beginPath(); g.moveTo(20,22); g.lineTo(31,10); g.lineTo(29,16); g.lineTo(26,15); g.lineTo(23,21); g.fill();
    px(g,1,10,3,4,"#fff"); px(g,28,10,3,4,"#fff");
    g.restore();
    // downy fluff puffs on shoulders
    px(g,9,20,3,3,"#fff"); px(g,20,20,3,3,"#fff");
    px(g,8,23,2,2,"#fff"); px(g,22,23,2,2,"#fff");
    // stubby legs paddle + tail nub wags
    const sw=window.Anim.seg(P,0,1);
    px(g,11+A.lx,29+A.ld,3,5,dk); px(g,18+A.rx,29+A.rd,3,5,dk);
    px(g,4+sw,28,5,3,dk); px(g,4+sw,28,2,1,lite);
    // chubby body
    px(g,10,22,12,8,tint); px(g,10,22,12,2,lite);
    px(g,12,26,8,2,"#e8d9b8");
    // HUGE baby head
    px(g,9,9,14,13,tint); px(g,9,9,14,2,lite);
    px(g,10,10,12,2,"#fff");
    // big baby eyes
    g.fillStyle="#fff"; g.fillRect(11,13,5,5); g.fillRect(18,13,4,4);
    g.fillStyle="#111"; g.fillRect(13,14,3,4); g.fillRect(19,14,2,3);
    g.fillStyle="#fff"; g.fillRect(13,14,1,1); g.fillRect(19,14,1,1);
    // tiny snout + milk teeth
    px(g,14,19,4,2,"#e8d9b8"); px(g,15,20,1,1,"#111"); px(g,16,20,1,1,"#111");
    // head fluff + nub horns
    px(g,10,6,12,4,"#f2ede2"); px(g,11,5,3,2,"#fff"); px(g,18,5,3,2,"#fff");
    px(g,9,8,2,3,dk); px(g,21,8,2,3,dk);
  };

  // SIREN v2: songstress of the reef — veil, shell top, scaled tail-skirt.

  D.siren = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?2:P.atk?-4:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
    const dk=shade(tint,-40), lite=shade(tint,30);
    // lagoon wings beat as one assembly
    g.save(); g.translate(0,W);
    // lagoon wings: webbed, translucent feel via light panels
    g.fillStyle=tint;
    g.beginPath(); g.moveTo(13,22); g.lineTo(1,8); g.lineTo(4,15); g.lineTo(7,14); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(31,8); g.lineTo(28,15); g.lineTo(25,14); g.fill();
    px(g,2,10,3,5,lite); px(g,27,10,3,5,lite);
    g.restore();
    // flowing aqua veil/hair
    px(g,7,3,18,8,"#bfe8ff"); px(g,7,3,18,2,"#fff");
    px(g,6,6,3,14,"#bfe8ff"); px(g,23,6,3,14,"#bfe8ff");
    // face pale + song mouth opens wide on atk
    px(g,11,9,10,9,"#f2c9b8");
    g.fillStyle="#111"; g.fillRect(13,11,2,3); g.fillRect(17,11,2,3);
    g.fillStyle="#fff"; g.fillRect(13,11,1,1); g.fillRect(17,11,1,1);
    px(g,14,15,4,P.atk?5:3,"#7a1f1f"); px(g,15,15,2,1,"#fff");
    // shell top
    px(g,11,18,10,6,tint); px(g,12,19,3,4,"#e8d9c9"); px(g,17,19,3,4,"#e8d9c9");
    px(g,14,20,4,1,"#fff");
    // arms conduct the song: sway, thrown wide on atk
    px(g,7+A.lax,19+A.la,3,6,"#f2c9b8"); px(g,22+A.rax,19+A.ra,3,6,"#f2c9b8");
    // scaled skirt sways + fish tail hint kicks
    const sw=window.Anim.seg(P,0,1);
    px(g,10+sw,24,12,7,"#2a6a7a"); px(g,10+sw,24,12,2,lite);
    px(g,11+sw,27,3,2,"#7ad9c9"); px(g,15+sw,28,3,2,"#7ad9c9"); px(g,19+sw,27,2,2,"#7ad9c9");
    px(g,11+sw,30,3,4,dk); px(g,18+sw,30,3,4,dk);
    // pearl necklace
    px(g,13,18,6,1,"#fff"); px(g,15,18,2,1,"#ffd93d");
  };

  // STYMPHALIAN v2: bronze terror — metal wings with blade feathers, beak spear.
  D.stymphalian = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?2:P.atk?-5:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
    const dk="#5a4a1a", steel="#e8e8e8";
    // BRONZE WINGS beat as one assembly
    g.save(); g.translate(0,W);
    // BRONZE WINGS with steel tips
    g.fillStyle="#c9a227";
    g.beginPath(); g.moveTo(13,22); g.lineTo(0,6); g.lineTo(3,14); g.lineTo(7,13); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(32,6); g.lineTo(29,14); g.lineTo(25,13); g.fill();
    px(g,0,6,3,3,steel); px(g,29,6,3,3,steel);
    px(g,2,10,2,4,steel); px(g,28,10,2,4,steel);
    px(g,4,13,2,3,"#8a6a1a"); px(g,26,13,2,3,"#8a6a1a");
    // steel feather glints
    px(g,1,7,1,2,"#fff"); px(g,30,7,1,2,"#fff");
    g.restore();
    // armored body
    px(g,10,18,12,12,"#c9a227");
    px(g,10,18,12,2,"#e8d060"); px(g,10,28,12,2,dk);
    px(g,13,21,6,6,"#8a6a1a"); px(g,14,22,4,4,"#e8d060");
    // legs bronze: march
    px(g,11+A.lx,30+A.ld,3,5,dk); px(g,18+A.rx,30+A.rd,3,5,dk);
    // head crested helm-bird
    px(g,11,9,10,10,"#c9a227");
    px(g,11,9,10,2,"#e8d060");
    px(g,12,6,8,4,dk); px(g,13,5,6,2,"#ffd93d");
    // spear beak: lower mandible drops on atk
    px(g,13,15,6,4,"#e8e0d0"); px(g,14,18,4,P.atk?4:2,dk);
    // red eyes angry
    g.fillStyle="#ff3b3b"; g.fillRect(12,12,3,3); g.fillRect(18,12,2,3);
    g.fillStyle="#111"; g.fillRect(13,13,1,2); g.fillRect(18,13,1,2);
  };

  // CROW TENGU v2: mountain crow — big nose, black wings, shawl pom-poms.
  D.tengu_crow = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?2:P.atk?-4:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
    // black wings beat as one assembly
    g.save(); g.translate(0,W);
    g.fillStyle="#1a1a24";
    g.beginPath(); g.moveTo(13,22); g.lineTo(0,4); g.lineTo(2,12); g.lineTo(5,10); g.lineTo(8,18); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(32,4); g.lineTo(30,12); g.lineTo(27,10); g.lineTo(24,18); g.fill();
    px(g,1,6,3,3,"#4a4a5a"); px(g,28,6,3,3,"#4a4a5a");
    px(g,3,10,2,3,"#8a8a9a"); px(g,27,10,2,3,"#8a8a9a");
    g.restore();
    // legs stride
    px(g,11+A.lx,30+A.ld,3,6,"#1a1a24"); px(g,18+A.rx,30+A.rd,3,6,"#1a1a24");
    // robe crow-black with shawl pom-poms
    px(g,10,18,12,13,"#2a2a3a");
    px(g,9,18,14,3,"#f2ede2");
    px(g,10,18,2,2,"#f2ede2"); px(g,13,18,2,2,"#f2ede2"); px(g,16,18,2,2,"#f2ede2"); px(g,19,18,2,2,"#f2ede2");
    // crow head red-brown + HUGE nose (tengu!)
    px(g,11,8,10,11,"#d9a06b");
    px(g,13,11,6,7,"#c98a5a"); px(g,15,14,2,4,"#a06a3a");
    // beak-nose protruding
    px(g,15,13,3,5,"#8a5a33");
    // fierce eyes
    g.fillStyle="#ffe14d"; g.fillRect(12,11,3,3); g.fillRect(18,11,2,2);
    g.fillStyle="#111"; g.fillRect(13,12,1,2); g.fillRect(18,12,1,1);
    // cap + war fan: swept up on atk
    px(g,11,5,10,4,"#111");
    px(g,25,18+(P.atk?-6:0),2,8,"#8a5a33"); px(g,23,20+(P.atk?-6:0),6,2,"#c9a227");
  };

  // VALKYRIE RENEGADE v2: winged helm, spear + shield, white-gold plate.
  D.valkyrie_renegade = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const W=P.hurt?2:P.atk?-4:P.moving?[0,-4,0,3][P.f&3]:(P.idle?-4:3);
    // white wings beat as one assembly
    g.save(); g.translate(0,W);
    g.fillStyle="#e8e8f2";
    g.beginPath(); g.moveTo(13,22); g.lineTo(1,6); g.lineTo(4,14); g.fill();
    g.beginPath(); g.moveTo(19,22); g.lineTo(31,6); g.lineTo(28,14); g.fill();
    px(g,1,8,2,5,"#fff"); px(g,29,8,2,5,"#fff");
    px(g,3,12,2,3,"#a0a8b8"); px(g,27,12,2,3,"#a0a8b8");
    g.restore();
    // legs + boots march
    px(g,11+A.lx,30+A.ld,4,6,"#3a3a4a"); px(g,17+A.rx,30+A.rd,4,6,"#3a3a4a");
    px(g,10+A.lx,34+A.ld,6,2,"#8a8a92"); px(g,16+A.rx,34+A.rd,6,2,"#8a8a92");
    // plate torso gold-trimmed
    px(g,10,18,12,12,"#d9d9e0"); px(g,10,18,12,1,"#fff");
    px(g,10,18,2,12,"#a0a8b8"); px(g,20,18,2,12,"#a0a8b8");
    px(g,14,20,4,6,"#c9a227"); px(g,15,21,2,4,"#7a1f1f");
    // shield + spear: levelled high on atk
    px(g,3,18,5,10,"#7a8a9a"); px(g,4,20,3,6,"#d9d9e0"); px(g,5,22,1,2,"#c9a227");
    px(g,25,12+(P.atk?-4:0),2,18,"#c9ccd4"); px(g,24,10+(P.atk?-4:0),4,3,"#8a5a33");
    // head + winged helm
    px(g,11,9,10,9,"#f2c9b8");
    g.fillStyle="#111"; g.fillRect(13,12,2,2); g.fillRect(17,12,2,2);
    px(g,9,5,14,6,"#a0a8b8"); px(g,9,5,14,2,"#fff");
    // helm wings
    px(g,4,2,5,6,"#fff"); px(g,23,2,5,6,"#fff");
    px(g,5,2,3,2,"#c9a227"); px(g,24,2,3,2,"#c9a227");
  };



  // ---- BATCH 2: serpents — coils + rising necks, each head distinct ----
  // NAGA v2: lamia — woman torso on heavy coils, cobra hood, spear.
  D.naga = (g,tint)=>{
    const dk=shade(tint,-45), lite=shade(tint,30);
    px(g,4,30,24,5,dk); px(g,6,28,20,4,tint); px(g,6,28,20,1,lite);
    px(g,8,31,4,1,"#e8d9b8"); px(g,14,32,4,2,"#e8d9b8");
    // cobra hood flared
    px(g,7,10,4,12,tint); px(g,21,10,4,12,tint); px(g,7,10,4,2,lite); px(g,21,10,4,2,lite);
    px(g,9,8,14,6,tint); px(g,9,8,14,1,lite);
    // woman torso scaled
    px(g,11,14,10,14,tint); px(g,12,15,8,11,lite);
    px(g,13,17,6,6,"#e8c9a0"); px(g,14,19,4,3,"#d9a06b");
    // arms + spear + shield
    px(g,6,16,3,9,"#e8c9a0"); px(g,23,16,3,9,"#e8c9a0");
    px(g,2,12,2,18,"#8a5a33"); px(g,1,10,4,3,"#c9ccd4"); px(g,1,10,4,1,"#fff");
    px(g,26,18,3,8,"#8a5a33"); px(g,26,18,3,2,"#d9c27f");
    // head + forked tongue + hood eyes
    px(g,11,3,10,8,"#e8c9a0");
    px(g,9,1,3,5,lite); px(g,20,1,3,5,lite);
    g.fillStyle="#111"; g.fillRect(13,6,2,2); g.fillRect(18,6,2,2);
    g.fillStyle="#ffe14d"; g.fillRect(13,6,1,1); g.fillRect(18,6,1,1);
    px(g,15,8,2,3,"#a02020"); px(g,15,10,1,2,"#a02020"); px(g,16,10,1,2,"#a02020");
    px(g,10,4,2,2,lite); px(g,20,4,2,2,lite);
  };
  // GORGON SPAWN v2: snake-haired girl — distinct from naga: small coils, 5 snakes.
  D.gorgon_spawn = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,8,30,16,5,dk); px(g,10,28,12,4,tint);
    px(g,11,16,10,13,tint); px(g,12,17,8,10,shade(tint,25));
    px(g,9,18,2,7,"#e8c9a0"); px(g,21,18,2,7,"#e8c9a0");
    // girl face pale + green gaze
    px(g,11,10,10,8,"#f2c9a0");
    g.fillStyle="#7dff9b"; g.fillRect(12,12,3,3); g.fillRect(17,12,3,3);
    g.fillStyle="#111"; g.fillRect(13,13,1,2); g.fillRect(18,13,1,2);
    px(g,14,16,4,1,"#a02040");
    // 5 tall snake stalks with heads + eyes + tongues
    for(let i=0;i<5;i++){ const sx=5+i*5;
      px(g,sx,0,3,9,"#2e7d46"); px(g,sx,0,3,1,"#7ac97a");
      px(g,sx-1,7,5,4,"#2e7d46"); px(g,sx,8,3,2,"#7ac97a");
      g.fillStyle="#ffe14d"; g.fillRect(sx,8,1,1); g.fillRect(sx+2,8,1,1);
      px(g,sx+1,11,1,2,"#ff6b6b");
    }
    // snake bite arms
    px(g,5,20,3,6,"#2e7d46"); px(g,24,20,3,6,"#2e7d46");
  };
  // HYDRA SPAWN v2: 3 heads — outer + alpha center, shell back.
  D.hydra_spawn = (g,tint)=>{
    const dk=shade(tint,-40), lite=shade(tint,30);
    px(g,6,30,20,5,dk); px(g,8,28,16,4,tint);
    px(g,10,26,4,3,"#e8e0d0"); px(g,18,26,4,3,"#e8e0d0");
    const HX=[5,12,19];
    HX.forEach((hx,i)=>{
      const y=i===1?8:11, big=i===1;
      px(g,hx,y+6,3,8,tint); px(g,hx,y+6,3,1,lite);
      px(g,hx-1,y,big?7:6,big?8:6,tint); px(g,hx,y+1,3+(big?1:0),2,lite);
      g.fillStyle="#ffe14d"; g.fillRect(hx,y+3,2,2); g.fillRect(hx+3,y+3,1,2);
      g.fillStyle="#111"; g.fillRect(hx+1,y+4,1,1);
      if(big){ px(g,hx+1,y+5,3,1,"#7a1f1f"); }
      px(g,hx+1,y+7,1,2,"#fff"); px(g,hx+3,y+7,1,2,"#fff");
    });
    px(g,12,28,8,2,"#ff9d9d");
  };
  // LINDWORM v2: legless drake — long low body, finned neck, horned head.
  D.lindworm = (g,tint)=>{
    const dk=shade(tint,-40), lite=shade(tint,25);
    // long low serpent body, NO hind legs (lindworm = 2 foreclaws only)
    px(g,1,29,25,5,dk); px(g,2,27,23,5,tint); px(g,2,27,23,1,lite);
    px(g,3,30,4,2,"#e8d9b8"); px(g,10,31,4,1,"#e8d9b8"); px(g,17,31,4,1,"#e8d9b8");
    // fin ridge tall
    for(let i=0;i<6;i++) px(g,4+i*4,23,2,5,lite);
    px(g,4,23,22,1,"#fff");
    // rising neck + head right, dark rear edge for separation
    px(g,18,13,6,13,dk); px(g,19,13,5,13,tint); px(g,20,14,3,10,lite);
    px(g,19,9,9,6,dk); px(g,20,10,7,5,tint); px(g,21,10,6,2,lite);
    // pale wedge snout with nostril + fanged jaw
    px(g,24,13,6,4,"#f2e4c8"); px(g,26,13,5,1,"#fff"); px(g,28,14,2,2,"#111");
    px(g,19,17,8,1,dk);
    px(g,21,17,2,2,"#fff"); px(g,25,17,2,2,"#fff"); px(g,28,17,1,2,"#fff");
    // big fierce eye with brow ridge
    px(g,19,11,6,1,dk);
    g.fillStyle="#ffe14d"; g.fillRect(21,12,4,4); g.fillStyle="#111"; g.fillRect(22,13,2,3);
    g.fillStyle="#fff"; g.fillRect(21,12,2,2);
    px(g,18,8,3,4,dk); px(g,24,8,3,4,dk); // horn nubs
    px(g,18,8,3,1,lite); px(g,24,8,3,1,lite);
    // foreclaws (lindworms have 2)
    px(g,19,26,4,4,dk); px(g,19,29,2,2,"#e8e0d0"); px(g,22,29,2,2,"#e8e0d0");
  };
  // SANDMAW v2: dune shark-worm — armored segments, dorsal spines, jaw teeth.
  D.sandmaw = (g,tint)=>{
    const dk=shade(tint,-40), lite=shade(tint,25);
    px(g,5,28,22,6,dk); px(g,7,26,18,5,tint); px(g,7,26,18,1,lite);
    for(let i=0;i<3;i++) px(g,9+i*6,22,2,5,dk);
    px(g,13,20,2,3,"#8a6a2a"); px(g,18,20,2,3,"#8a6a2a");
    // head up right — wide jaw
    px(g,19,12,8,14,tint); px(g,20,13,6,10,lite);
    px(g,20,12,8,2,lite);
    px(g,20,18,7,6,"#7a1f1f"); px(g,20,18,7,1,"#ff9d9d");
    for(let i=0;i<3;i++){ px(g,21+i*2,19,1,2,"#fff"); px(g,21+i*2,23,1,2,"#fff"); }
    g.fillStyle="#111"; g.fillRect(21,14,3,3); g.fillStyle="#fff"; g.fillRect(21,14,1,1);
  };
  // TIDECALLER v2: reef eel — spout crest, glowing lure, finned coils.
  D.tidecaller = (g,tint)=>{
    const dk=shade(tint,-40), lite=shade(tint,25);
    px(g,6,29,20,5,dk); px(g,8,27,16,4,tint);
    px(g,8,27,4,2,lite); px(g,16,28,3,1,"#bfe8ff");
    px(g,18,16,5,12,tint); px(g,19,17,3,9,lite);
    px(g,17,10,7,8,tint); px(g,18,11,5,3,lite);
    // spout + lure
    px(g,19,3,2,8,"#bfe8ff"); px(g,19,3,2,1,"#fff");
    px(g,22,6,3,4,"#ffd93d"); g.fillStyle="#fff"; g.fillRect(23,7,1,1);
    g.fillStyle="#fff7ae"; g.fillRect(19,12,3,3); g.fillStyle="#111"; g.fillRect(20,13,1,2);
    // side fins
    px(g,14,20,3,6,lite); px(g,24,22,3,5,lite);
  };
  // DEEPMAW / ABYSS_SERPENT v2: angler horrors — huge jaws, lure, finlets.
  D.deepmaw = (g,tint)=>{
    px(g,5,29,22,6,shade(tint,-40)); px(g,7,27,18,5,tint); px(g,7,27,18,1,shade(tint,25));
    px(g,16,13,8,15,"#0e2a3a"); px(g,16,13,8,1,"#3a6a8a");
    px(g,17,19,6,7,"#7a1f2e");
    for(let i=0;i<3;i++){ px(g,18+i*2,20,1,2,"#fff"); px(g,18+i*2,24,1,2,"#fff"); }
    px(g,15,9,10,7,tint); px(g,15,9,10,1,shade(tint,30)); px(g,16,10,8,2,shade(tint,25));
    g.fillStyle="#ffe14d"; g.fillRect(17,11,3,3); g.fillRect(22,11,2,2);
    g.fillStyle="#111"; g.fillRect(18,12,1,2);
    g.fillStyle="#fff"; g.fillRect(17,11,1,1);
    px(g,19,4,2,6,"#7ad9f0"); px(g,19,4,2,1,"#fff"); // lure stalk
    g.fillStyle="#bff2ff"; g.fillRect(18,2,4,3); g.fillStyle="#fff"; g.fillRect(19,3,2,1); // glowing lure bulb
    px(g,12,16,3,5,shade(tint,25)); // gill fin
    px(g,10,26,2,2,"#7ad9f0"); px(g,20,26,2,2,"#7ad9f0");
  };
  D.abyss_serpent = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,5,29,22,6,dk); px(g,7,27,18,5,tint); px(g,7,27,18,1,shade(tint,25));
    px(g,14,15,9,13,"#0e2a3a"); px(g,14,15,9,1,"#3a6a8a"); px(g,15,16,7,3,"#123a52");
    px(g,13,9,11,8,tint); px(g,13,9,11,1,shade(tint,35)); px(g,14,10,9,2,shade(tint,30));
    g.fillStyle="#7dffef"; g.fillRect(14,11,4,4); g.fillRect(20,12,2,2);
    g.fillStyle="#111"; g.fillRect(15,12,2,2);
    g.fillStyle="#fff"; g.fillRect(14,11,1,1);
    // glowing barbels + dorsal lights
    px(g,15,19,3,4,"#7ad9f0"); px(g,16,20,1,2,"#fff");
    px(g,10,26,2,2,"#7ad9f0"); px(g,20,26,2,2,"#7ad9f0");
    px(g,11,4,2,6,"#7ad9f0"); px(g,18,4,2,6,"#7ad9f0");
    g.fillStyle="#fff"; g.fillRect(11,4,2,1); g.fillRect(18,4,2,1);
  };
  D.wreck_eel = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,6,29,20,5,dk); px(g,8,27,16,4,tint); px(g,8,27,16,1,shade(tint,25));
    // wreck planks strapped on body
    px(g,8,25,5,3,"#6b4226"); px(g,8,25,5,1,"#a97648");
    px(g,18,30,4,3,"#8a8a92"); px(g,19,30,2,1,"#c9ccd4");
    px(g,16,14,6,13,tint); px(g,17,15,4,10,shade(tint,25));
    px(g,15,9,8,7,tint); px(g,15,9,8,2,shade(tint,30));
    g.fillStyle="#bfe8ff"; g.fillRect(16,11,4,3); g.fillStyle="#111"; g.fillRect(17,12,2,2);
    g.fillStyle="#fff"; g.fillRect(16,11,1,1);
    px(g,14,6,2,3,"#2a5a6a"); px(g,21,6,2,3,"#2a5a6a"); // mast stubs on head
  };
  D.magma_eel = (g,tint)=>{
    const dk=shade(tint,-45);
    px(g,6,29,20,5,dk); px(g,8,27,16,4,tint);
    for(let i=0;i<4;i++){ px(g,8+i*5,23,2,4,"#ffd93d"); px(g,8+i*5,23,2,1,"#fff"); }
    px(g,16,13,6,14,tint); px(g,17,14,4,11,shade(tint,30));
    px(g,15,8,8,7,"#ff8a3a"); px(g,15,8,8,2,"#ffd93d");
    g.fillStyle="#ffe14d"; g.fillRect(16,10,4,3); g.fillStyle="#111"; g.fillRect(17,11,2,2);
    g.fillStyle="#fff"; g.fillRect(16,10,1,1);
    px(g,15,15,8,1,"#7a1f0e"); px(g,17,16,2,3,"#ff7b2e");
  };
  D.abyss_tentacle = (g,tint,ph)=>{
    // v2: reef horror — parrot beak, side eyes, sucker rows, glow rings, rock base.
    const P=window.Anim.normP(ph);
    const sway=window.Anim.seg(P,0,1), sway2=window.Anim.seg(P,2,1);
    const dk=shade(tint,-30), lite=shade(tint,25);
    // rock base
    px(g,7,32,18,4,"#2a2a32"); px(g,9,32,14,1,"#4a4a5a");
    px(g,10,30,12,3,dk);
    // central stalk sways with glow rings
    px(g,12+sway,14,8,19,tint); px(g,12+sway,14,8,2,lite);
    px(g,12+sway,14,2,19,dk); px(g,18+sway,14,2,19,dk);
    px(g,13+sway,20,6,1,"#7ad9f0"); px(g,13+sway,25,6,1,"#7ad9f0");
    px(g,13+sway,20,2,1,"#fff"); px(g,13+sway,25,2,1,"#fff");
    // sucker rows ride the stalk: white-rimmed pink cups
    for(let i=0;i<3;i++){ const y=16+i*4;
      px(g,13+sway,y,2,3,"#fff"); px(g,13+sway,y,2,2,"#ff6b9d");
      px(g,18+sway,y,2,3,"#fff"); px(g,18+sway,y,2,2,"#ff6b9d");
    }
    // parrot beak snaps on atk + brow
    px(g,13+sway,8,6,7,"#e8e0d0"); px(g,13+sway,8,6,2,"#fff");
    px(g,14+sway,12+(P.atk?2:0),4,3,"#3a2a1a"); px(g,15+sway,12+(P.atk?2:0),2,2,"#5a4a33");
    // side eyes glaring
    g.fillStyle="#111"; g.fillRect(10+sway,10,3,4); g.fillRect(20+sway,10,3,4);
    g.fillStyle="#ffe14d"; g.fillRect(11+sway,11,2,2); g.fillRect(20+sway,11,2,2);
    g.fillStyle="#fff"; g.fillRect(11+sway,11,1,1); g.fillRect(20+sway,11,1,1);
    // side arms wave with sucker tips
    px(g,2+sway2,20,7,5,dk); px(g,3+sway2,20,7,1,lite);
    px(g,3+sway2,21,2,2,"#fff"); px(g,5+sway2,21,2,2,"#ff6b9d"); px(g,7+sway2,21,2,2,"#fff");
    px(g,23-sway2,20,7,5,dk); px(g,23-sway2,20,7,1,lite);
    px(g,23-sway2,21,2,2,"#fff"); px(g,25-sway2,21,2,2,"#ff6b9d"); px(g,27-sway2,21,2,2,"#fff");
    px(g,4,27,5,4,dk); px(g,23,27,5,4,dk);
  };


  // ---- BATCH 3: beasts — side-view quadrupeds, each head/tail distinct ----
 function beastBase(g,tint,opts){
   opts=opts||{};
   // limb animation: legs trot in diagonal pairs, tails lash — all 17
   // caller kinds animate with zero per-painter edits. Pose comes from the
   // module-global curP set by the actor wrapper before each paint.
   const BP=(window.Anim?window.Anim.normP(curP):{f:0,moving:false,hurt:false,atk:false,idle:0,t:0});
    const QQ=(window.Anim?window.Anim.quad(BP):{d1:0,d2:0});
    const bF=QQ.d1, bH=QQ.d2;
    const bX1=QQ.x1||0, bX2=QQ.x2||0;
    const bL=0, bR=0; // hurt stagger already inside quad()
   const bSw=(window.Anim?window.Anim.seg(BP,0,1):0);
   const dk=shade(tint,-35), lite=shade(tint,25);
    // tail — per-kind shape so quadrupeds stop cloning (lashes as they walk)
    if(opts.tail==="flame") px(g,0+bSw,20,4,5,"#ff7b2e"), px(g,1+bSw,18,2,4,"#ffd93d");
    else if(opts.tail==="tuft") px(g,0+bSw,19,5,5,dk), px(g,0+bSw,17,4,4,lite), px(g,1+bSw,19,3,2,"#fff");
    else if(opts.tail==="fish") px(g,0+bSw,22,5,4,dk), px(g,0+bSw,19,3,5,"#7ad9f0"), px(g,0+bSw,19,3,1,"#fff");
    else if(opts.tail==="thin") px(g,1+bSw,22,2,5,dk), px(g,0+bSw,26,4,2,dk);
    else if(opts.tail==="brush") px(g,0+bSw,20,6,5,dk), px(g,0+bSw,20,6,2,lite), px(g,0+bSw,24,3,3,"#fff");
    else px(g,1+bSw,20,3,4,dk), px(g,0+bSw,22,4,2,dk);
    // body — geometry varies per kind (bx,by,bw,bh,legH)
    const bx=opts.bx!=null?opts.bx:6, by=opts.by!=null?opts.by:24, bw=opts.bw||19, bh=opts.bh||8;
    const legH=opts.legH||5, legY=by+bh-1;
    px(g,bx,by,bw,bh,tint); px(g,bx,by,bw,2,lite);
    px(g,bx,by,3,bh,dk);
    if(opts.belly) px(g,bx+3,by+bh-3,bw-6,2,opts.belly);
    if(opts.blanket) px(g,bx+2,by+2,10,3,opts.blanket), px(g,bx+2,by+2,10,1,opts.blanketHi||"#fff");
    if(opts.shell){ px(g,bx+1,by-2,17,6,"#2a1a12"); px(g,bx+3,by-4,13,5,opts.shell); }
    if(opts.stripe) for(let i=0;i<3;i++) px(g,bx+3+i*5,by+2,2,3,opts.stripe);
    // legs — diagonal pairs trot (tall/thin/stocky stances)
    const lw=opts.legW||3;
    px(g,bx+1+bX1,legY+bF+bL,lw,legH+1,dk); px(g,bx+6+bX2,legY+bH,lw,legH+1,dk); px(g,bx+12+bX1,legY+bF+bR,lw,legH+1,dk); px(g,bx+16+bX2,legY+bH,lw,legH+1,dk);
    if(opts.boots) px(g,bx+1+bX1,legY+legH-1+bF,lw,2,opts.boots), px(g,bx+16+bX2,legY+legH-1+bH,lw,2,opts.boots);
    else px(g,bx+1+bX1,legY+legH+bF,lw,1,"#222"), px(g,bx+16+bX2,legY+legH+bH,lw,1,"#222");
  }
 // WOLF v2: grey hunter — ruff, fangs, bushy tail.
 D.wolf = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    const dk=shade(tint,-35); beastBase(g,tint,{tail:"brush",bx:6,by:23,bw:19,bh:9,legH:5,belly:"#d9c9b8"});
    // head rides up/down as it lopes; jaw drops on atk
    px(g,22,16+hb,8,10,tint); px(g,23,17+hb,6,3,shade(tint,30));
    px(g,22,14+hb,3,4,tint); px(g,27,14+hb,3,4,tint); // ears
    px(g,27,21+hb,5,4,"#d9c9b8"); px(g,30,22+hb,2,2,"#111");
    px(g,22,21+hb,6,2,"#fff"); // fangs
    g.fillStyle="#ffe14d"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,2);
    px(g,23,24+hb+(P.atk?2:0),5,1,"#7a1f1f");
    px(g,8,24,5,2,"rgba(255,255,255,0.25)");
  };
 // RIME WOLF v2: frost — ice mane, snow paws, cyan eyes.
 D.rime_wolf = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P), Q=window.Anim.quad(P);
    const dk=shade(tint,-30); beastBase(g,tint,{tail:"brush",bx:5,by:24,bw:20,bh:8,legH:4,belly:"#fff"});
    // wolf skull bobs: short deep head, tall ears, dark outline against snow
    px(g,22,13+hb,3,6,"#2a4a5a"); px(g,27,13+hb,3,6,"#2a4a5a");
    px(g,22,13+hb,3,4,"#bfe0f0"); px(g,27,13+hb,3,4,"#bfe0f0");
    px(g,21,17+hb,9,10,"#eef7ff"); px(g,21,17+hb,9,2,"#fff");
    px(g,21,17+hb,2,10,"#9ac4dc"); px(g,28,17+hb,2,10,"#9ac4dc");
    px(g,20,19+hb,3,9,"#fff"); // ice ruff
    px(g,25,22+hb,6,4,"#d9e8f2"); px(g,29,23+hb,2,2,"#2a5a6a");
    px(g,25,25+hb+(P.atk?1:0),6,1,"#7ab0d0");
    px(g,26,23+hb,1,3,"#fff"); px(g,30,23+hb,1,3,"#fff"); // fangs
    g.fillStyle="#111"; g.fillRect(23,19+hb,4,4);
    g.fillStyle="#7fd4ff"; g.fillRect(24,20+hb,2,2); g.fillStyle="#fff"; g.fillRect(24,20+hb,1,1);
    px(g,7+Q.x1,34+Q.d1,3,2,"#fff"); px(g,22+Q.x2,34+Q.d2,3,2,"#fff"); // snow paws ride the legs
  };
 // FENRIR PUP v2: dark cub — chain collar, scar, ember eyes.
 D.fenrir_pup = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{tail:"brush",bx:7,by:25,bw:17,bh:7,legH:4,belly:"#4a4a5a"});
    px(g,22,14+hb,4,8,"#111"); px(g,26,14+hb,4,8,"#111"); // dark ears
    px(g,22,16+hb,8,10,tint); px(g,23,17+hb,6,3,shade(tint,20));
    px(g,27,21+hb,5,4,"#e8a0a0"); px(g,30,22+hb,2,2,"#7a1f1f");
    g.fillStyle="#ffe14d"; g.fillRect(23,19+hb,3,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,2);
    px(g,22,24+hb,8,2,"#9adcff"); px(g,23,24+hb,2,2,"#2a6a9a"); // chain collar
    px(g,25,16+hb,3,1,"#7a1f1f"); // scar
  };
 // ANUBITE v2: jackal guard — gold brow band, jackal ears tall, kilt.
 D.anubite = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{tail:"thin",bx:6,by:23,bw:19,bh:9,legH:6,legW:2,belly:"#111"});
    // tall jackal ears + head nod as it stalks
    px(g,22,8+hb,3,9,"#111"); px(g,27,8+hb,3,9,"#111"); // tall jackal ears
    px(g,22,8+hb,3,2,"#ffd93d");
    px(g,23,9+hb,1,6,"#ffd93d"); px(g,28,9+hb,1,6,"#ffd93d"); // ear gold rims
    px(g,22,16+hb,8,10,"#2a2a2a");
    px(g,23,17+hb,6,2,"#4a4a4a");
    px(g,22,15+hb,8,2,"#ffd93d"); // gold brow band
    px(g,23,20+hb,6,3,"#ffd93d"); // gold collar
    px(g,27,21+hb,6,4,"#d9c9b8"); px(g,31,22+hb,2,2,"#111"); // long jackal snout
    px(g,27,24+hb+(P.atk?1:0),6,1,"#8a7a7a");
    g.fillStyle="#ff3b3b"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,2);
    px(g,8,26,10,2,"#ffd93d"); // kilt trim
  };
 // GNOLL v2: hyena — spotted, laughing jaw, mohawk.
 D.gnoll = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{tail:"tuft",bx:6,by:25,bw:19,bh:7,legH:4,stripe:shade(tint,-25),belly:"#d9c9b8"});
    px(g,22,12+hb,3,5,shade(tint,20)); px(g,27,12+hb,3,5,shade(tint,20));
    px(g,22,16+hb,8,10,tint); px(g,22,16+hb,8,2,shade(tint,25));
    // laughing hyena jaw gapes wider on atk: open grin with teeth + tongue
    px(g,23,20+hb,7,3+(P.atk?2:0),"#fff"); px(g,24,21+hb,5,1,"#7a1f1f");
    px(g,24,20+hb,1,2,"#fff"); px(g,26,20+hb,1,2,"#fff"); px(g,28,20+hb,1,2,"#fff");
    px(g,25,22+hb+(P.atk?2:0),4,1,"#c93b3b");
    for(let i=0;i<4;i++) px(g,8+i*5,25,2,2,shade(tint,-30)); // spots
    g.fillStyle="#ffe14d"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,2);
    // spiky mohawk ridge rides the head, not a slab
    px(g,23,12+hb,2,3,"#e8e0d0"); px(g,26,11+hb,2,4,"#e8e0d0"); px(g,29,12+hb,2,3,"#e8e0d0");
    px(g,8,20,4,2,"#e8e0d0"); px(g,8,19,2,2,"#e8e0d0"); px(g,10,18,2,2,"#e8e0d0");
  };
 D.gnoll_hunter = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    const dk=shade(tint,-35); beastBase(g,tint,{blanket:"#2a6a3a", blanketHi:"#7ac97a",tail:"tuft",bx:6,by:24,bw:19,bh:8,legH:5});
    px(g,22,12+hb,3,5,tint); px(g,27,12+hb,3,5,tint);
    px(g,22,16+hb,8,10,tint); px(g,27,21+hb,4,3,"#d9c9b8");
    g.fillStyle="#7fd4ff"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,1);
    px(g,1,14,2,12,"#8a5a33"); px(g,0,14,5,2,"#d9c9c9"); // bow on back
  };
 // KITSUNE v2: fox — big tail with white tip, mask markings.
 D.kitsune_trickster = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    const sw=window.Anim.seg(P,0,1);
    g.fillStyle=shade(tint,-20); g.beginPath(); g.ellipse(4+sw,20,6,7,0.5,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(4+sw,20,5,6,0.5,0,7); g.fill();
    g.fillStyle="#fff"; g.beginPath(); g.ellipse(2+sw,24,3,4,0.5,0,7); g.fill();
    beastBase(g,tint,{tail:"brush",bx:7,by:24,bw:18,bh:8,legH:4,legW:2});
    px(g,22,10+hb,3,6,tint); px(g,27,10+hb,3,6,tint);
    px(g,23,11+hb,1,3,"#fff"); px(g,28,11+hb,1,3,"#fff");
    px(g,22,16+hb,8,10,tint); px(g,23,17+hb,6,3,"#fff");
    px(g,23,19+hb,6,3,"#c93b3b"); // mask stripe
    g.fillStyle="#111"; g.fillRect(24,19+hb,2,2);
    px(g,27,21+hb+(P.atk?1:0),4,3,"#e8d9c0");
  };
  // TANUKI v2: raccoon-dog — mask, bottle, hat.
  D.tanuki = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{});
    px(g,22,16+hb,8,10,tint); px(g,22,18+hb,8,4,"#3a2a1a"); // mask band
    px(g,24,20+hb,4,2,"#fff");
    g.fillStyle="#111"; g.fillRect(24,19+hb,3,2);
    px(g,4,20,5,5,shade(tint,-30)); px(g,4,20,5,1,"#c9c9c9"); // striped tail
    px(g,20,12+hb,12,4,"#d9c27f"); px(g,21,10+hb,10,3,"#c9b26e"); // straw hat rides the head
    px(g,25,26,3,5,"#8a5a33"); // bottle
  };
  // KELPIE v2: water-horse — kelp mane, webbed hooves, tide shimmer.
  D.kelpie = (g,tint,ph)=>{
    const Q=window.Anim.quad(ph);
    beastBase(g,tint,{tail:"fish"});
    px(g,22,12,4,8,"#1a2a3a"); px(g,23,13,2,7,"#7ad9f0"); // kelp mane on neck
    px(g,22,16,8,10,tint); px(g,23,17,6,2,shade(tint,25));
    px(g,8,24,12,2,"#7ad9f0"); px(g,8,24,3,2,"#fff");
    g.fillStyle="#7ad9f0"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,1);
    px(g,7+Q.x2,34+Q.d1,3,2,"#7ad9f0"); px(g,22+Q.x2,34+Q.d2,3,2,"#7ad9f0"); // webbed hooves ride the legs
  };
  // CENTAUR FOAL v2: horse body + boy torso + bow.
  D.centaur_foal = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P), A=window.Anim.limb(P);
    const dk=shade(tint,-35);
    // horse barrel trots + blanket + hooves ride along
    px(g,1,22,5,3,dk); px(g,2,26,17,6,tint); px(g,2,26,17,2,shade(tint,30));
    px(g,3+Q.x2,31+Q.d1,3,5,dk); px(g,9+Q.x2,31+Q.d2,3,5,dk); px(g,14+Q.x2,31+Q.d1,3,5,dk);
    px(g,3+Q.x2,35+Q.d1,4,1,"#222"); px(g,14+Q.x2,35+Q.d1,4,1,"#222");
    px(g,4,27,6,2,"#3a6a9a"); px(g,5,27,4,1,"#7fb0ff"); // blanket
    // boy torso SKIN (not horse tint) rising from withers
    px(g,15,12,7,14,"#d9a06b"); px(g,15,12,7,2,"#e8bd85");
    px(g,15,12,2,14,shade("#d9a06b",-25)); px(g,20,12,2,14,shade("#d9a06b",-25));
    px(g,12+A.lax,14+A.la,5,8,"#d9a06b"); // foreleg-arm reaching, swings
    px(g,12+A.lax,20+A.la,5,2,"#c98a5a");
    // quiver on back + bow in hand (drawn up on atk)
    px(g,23,13,3,8,"#6b4226"); px(g,23,13,3,1,"#a97648");
    px(g,24,11,1,3,"#e8e0d0"); px(g,24,15,1,3,"#ff3b3b");
    px(g,8,14+(P.atk?-4:0),2,10,"#8a5a33"); px(g,6,14+(P.atk?-4:0),6,2,"#8a5a33"); px(g,6,22+(P.atk?-4:0),6,2,"#8a5a33");
    px(g,8,15+(P.atk?-4:0),1,7,"#e8e0d0"); // bowstring
    px(g,7,17,3,1,"#c9ccd4"); // nocked arrow
    // boy head with hair + eyes
    px(g,16,5,8,8,"#e8bd85"); px(g,17,5,6,2,"#8a5a33");
    g.fillStyle="#111"; g.fillRect(18,9,2,2); g.fillRect(22,9,2,2);
    g.fillStyle="#fff"; g.fillRect(18,9,1,1);
  };
  // CHIMERA CUB v2: lion + goat + snake — all three heads.
  D.chimera_cub = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{tail:"tuft"});
    px(g,8,20+hb,7,5,"#e8c020"); // goat head mid-body bobs
    px(g,5,12+hb,5,7,"#e8e0d0"); px(g,6,13+hb,3,2,"#111"); // goat eyes
    px(g,22,16+hb,8,10,"#c96b2e"); px(g,23,17+hb,6,2,"#ff9d2e");
    g.fillStyle="#111"; g.fillRect(24,19+hb,2,2);
    px(g,28,22+window.Anim.seg(P,0,1),3,6,"#2e7d46"); px(g,29,23+window.Anim.seg(P,0,1),1,2,"#ff6b6b"); // snake tail-head sways
  };
  // SPHINX / LAMASSU CUB v2: human face + nemes + wings (lamassu).
  D.sphinx_cub = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{});
    // tall ceremonial ears ride the nodding head
    px(g,22,12+hb,3,7,"#111"); px(g,27,12+hb,3,7,"#111");
    px(g,22,18+hb,8,8,"#d9a06b"); px(g,23,18+hb,6,2,"#e8bd85");
    // nemes headdress: striped band + lappets framing the face
    px(g,20,13+hb,12,4,"#2a6a9a"); px(g,20,13+hb,12,1,"#7fb0ff");
    px(g,21,14+hb,2,2,"#ffd93d"); px(g,25,14+hb,2,2,"#ffd93d"); px(g,29,14+hb,2,2,"#ffd93d");
    px(g,20,15+hb,3,8,"#2a6a9a"); px(g,29,15+hb,3,8,"#2a6a9a");
    px(g,20,15+hb,3,1,"#ffd93d"); px(g,29,15+hb,3,1,"#ffd93d");
    // calm human eyes + mouth (opens on atk)
    g.fillStyle="#111"; g.fillRect(24,20+hb,2,2); g.fillRect(27,20+hb,2,2);
    g.fillStyle="#fff"; g.fillRect(24,20+hb,1,1);
    px(g,25,23+hb+(P.atk?1:0),3,1,"#a06a5a");
  };
  D.lamassu_cub = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    const lite=shade(tint,25);
    g.fillStyle=lite; g.beginPath(); g.moveTo(12,24); g.lineTo(2,12); g.lineTo(8,22); g.fill();
    beastBase(g,tint,{});
    px(g,22,12+hb,3,6,"#111"); px(g,27,12+hb,3,6,"#111");
    px(g,22,18+hb,8,8,"#d9a06b"); px(g,23,18+hb,6,2,"#e8bd85");
    px(g,20,13+hb,12,4,"#2a6a9a"); px(g,21,14+hb,10,1,"#7fb0ff"); px(g,22,14+hb,8,2,"#ffd93d");
    px(g,20,15+hb,3,7,"#2a6a9a"); px(g,29,15+hb,3,7,"#2a6a9a");
    g.fillStyle="#111"; g.fillRect(24,20+hb,2,2); g.fillRect(27,20+hb,1,1);
  };
  D.sobek_spawn = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{});
    px(g,20,16+hb,11,10,tint); px(g,21,17+hb,9,3,shade(tint,30));
    for(let i=0;i<3;i++) px(g,22+i*3,20+hb,2,2,shade(tint,30)); // scutes ride the head
    // long flat croc snout: jaw gapes on atk, full tooth row
    px(g,27,21+hb,6,4,"#7aa07a"); px(g,28,21+hb,5,1,shade(tint,30));
    px(g,27,24+hb+(P.atk?2:0),6,1,"#5a7a5a");
    px(g,28,22+hb,1,2,"#fff"); px(g,30,22+hb,1,2,"#fff"); px(g,32-1,22+hb,1,2,"#fff");
    px(g,30,19+hb,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(23,19+hb,2,2); g.fillStyle="#111"; g.fillRect(23,19+hb,1,2);
  };
  // HORSES v3: flowing manes, blanket borders, docked tails, proud heads.
  function horseKind(mane, blanket, tailC){
    return (g,tint,ph)=>{
      const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
      const sw=window.Anim.seg(P,0,1);
      const dk=shade(tint,-35), lite=shade(tint,25);
      // docked tail swishes + light tip
      px(g,0+sw,20,3,6,dk); px(g,0+sw,18,4,3,mane); px(g,0+sw,25,3,2,tailC||lite);
      px(g,0,18,4,1,lite);
      // barrel + back highlight + belly shade
      px(g,6,24,19,8,tint); px(g,6,24,19,2,lite); px(g,6,30,19,2,dk);
      // blanket with border pattern
      if(blanket){ px(g,8,25,10,4,blanket); px(g,8,25,10,1,lite); px(g,8,28,10,1,shade(blanket,-40)); px(g,9,26,2,2,lite); px(g,14,26,2,2,lite); }
      // 4 legs trot in diagonal pairs + dark hooves ride along
      px(g,7+Q.x2,31+Q.d1,3,5,dk); px(g,12+Q.x2,31+Q.d2,3,5,dk); px(g,18+Q.x2,31+Q.d1,3,5,dk); px(g,22+Q.x2,31+Q.d2,3,5,dk);
      px(g,7+Q.x2,34+Q.d1,3,2,"#222"); px(g,12+Q.x2,34+Q.d2,3,2,"#222"); px(g,18+Q.x2,34+Q.d1,3,2,"#222"); px(g,22+Q.x2,34+Q.d2,3,2,"#222");
      px(g,7,31,3,1,lite);
      // arched neck with mane crest + forelock
      px(g,21,14,5,12,mane); px(g,21,14,2,12,lite);
      px(g,22,8,4,7,mane); px(g,22,8,4,1,lite); px(g,23,10,2,8,"#111");
      // proud head: forehead plane, muzzle, nostril, jaw
      px(g,21,16,9,10,tint); px(g,22,16,7,2,lite);
      px(g,27,21,4,4,"#e8d9c0"); px(g,28,21,3,1,"#fff");
      px(g,29,22,2,1,"#7a4a2a"); // nostril
      px(g,21,24,9,2,dk); // jaw line
      // pricked ears
      px(g,21,11,2,4,mane); px(g,25,11,2,4,mane);
      // eye with glint
      g.fillStyle="#111"; g.fillRect(24,19,2,2); g.fillStyle="#fff"; g.fillRect(24,19,1,1);
    };
  }
  D.wild_horse = horseKind("#3a2415", "#a02040", null);
  D.stable_pony = horseKind("#3a5a2a", "#5da24a", null);
  D.stable_courser = horseKind("#1a2a4a", "#3a6ad9", null);
  D.stable_destrier = horseKind("#4a0f0f", "#a02020", null);
  D.stable_zephyr = horseKind("#5a6a7a", "#9adcff", null);
  D.stable_aegis = horseKind("#2a0a3a", "#6a2a8a", null);
  // DAWN-BRED: pegasus (heaven stable) — white horse + layered swan wings.
  D.pegasus = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
    const sw=window.Anim.seg(P,0,1);
    const dk=shade(tint,-35), lite=shade(tint,25), mane="#d8a018", maneL="#f6d34e";
    const flap=P.atk?2:(P.moving?[0,2,0,-1][P.f&3]:(P.idle?2:-1));
    // wings rise from the withers first (behind everything): covert cap,
    // stepped primaries with separated finger tips, shaded underwing
    px(g,10-flap,7,8,4,"#ffffff"); px(g,10-flap,7,8,1,"#f4f8ff");
    px(g,8-flap,11,10,4,"#eef4ff"); px(g,8-flap,14,10,1,"#c9dcf0");
    px(g,5-flap,15,9,4,"#dbe7f5"); px(g,5-flap,18,9,1,"#a9c8e8");
    px(g,3-flap,16,4,3,"#eef4ff"); px(g,3-flap,18,4,1,"#a9c8e8");
    px(g,2-flap,20,4,3,"#dbe7f5"); px(g,2-flap,22,4,1,"#8ab0d8");
    px(g,4-flap,24,4,2,"#c9dcf0");
    px(g,13-flap,4,4,2,maneL); // dawn glint on the wingtip
    // docked tail swishes + light tip
    px(g,0+sw,20,3,6,dk); px(g,0+sw,18,4,3,mane); px(g,0+sw,25,3,2,maneL);
    px(g,0,18,4,1,lite);
    // barrel + back highlight + belly shade
    px(g,6,24,19,8,tint); px(g,6,24,19,2,lite); px(g,6,30,19,2,dk);
    // 4 legs trot in diagonal pairs + dark hooves ride along
    px(g,7+Q.x2,31+Q.d1,3,5,dk); px(g,12+Q.x2,31+Q.d2,3,5,dk); px(g,18+Q.x2,31+Q.d1,3,5,dk); px(g,22+Q.x2,31+Q.d2,3,5,dk);
    px(g,7+Q.x2,34+Q.d1,3,2,"#222"); px(g,12+Q.x2,34+Q.d2,3,2,"#222"); px(g,18+Q.x2,34+Q.d1,3,2,"#222"); px(g,22+Q.x2,34+Q.d2,3,2,"#222");
    px(g,7,31,3,1,lite);
    // arched neck with gold mane crest + forelock
    px(g,21,14,5,12,mane); px(g,21,14,2,12,maneL);
    px(g,22,8,4,7,mane); px(g,22,8,4,1,maneL); px(g,23,10,2,8,"#111");
    // proud head: forehead plane, muzzle, nostril, jaw
    px(g,21,16,9,10,tint); px(g,22,16,7,2,lite);
    px(g,27,21,4,4,"#e8d9c0"); px(g,28,21,3,1,"#fff");
    px(g,29,22,2,1,"#7a4a2a"); px(g,21,24,9,2,dk);
    // pricked ears
    px(g,21,11,2,4,mane); px(g,25,11,2,4,mane);
    // eye with glint
    g.fillStyle="#111"; g.fillRect(24,19,2,2); g.fillStyle="#fff"; g.fillRect(24,19,1,1);
  };
  // DAWN-BRED: unicorn (heaven stable) — moon-white horse + spiral gold horn.
  D.unicorn = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
    const sw=window.Anim.seg(P,0,1), hb=window.Anim.hbob(P);
    const dk=shade(tint,-35), lite=shade(tint,25), mane="#e8a0c0", maneD="#c978a0";
    const gold="#d8a018", goldL="#f6d34e";
    // star-sparkle aura
    px(g,2,6,2,2,"#fffbe8"); px(g,29,10,2,2,"#fffbe8"); px(g,5,28+hb,2,2,"#ffedb8");
    // docked tail swishes + light tip
    px(g,0+sw,20,3,6,dk); px(g,0+sw,18,4,3,mane); px(g,0+sw,25,3,2,maneD);
    px(g,0,18,4,1,lite);
    // barrel + back highlight + belly shade
    px(g,6,24,19,8,tint); px(g,6,24,19,2,lite); px(g,6,30,19,2,dk);
    // moonmark flank: crescent blaze
    px(g,11,26,4,4,goldL); px(g,12,27,2,2,tint); px(g,11,26,4,1,"#fff");
    // 4 legs trot in diagonal pairs + gilded hooves
    px(g,7+Q.x2,31+Q.d1,3,5,dk); px(g,12+Q.x2,31+Q.d2,3,5,dk); px(g,18+Q.x2,31+Q.d1,3,5,dk); px(g,22+Q.x2,31+Q.d2,3,5,dk);
    px(g,7+Q.x2,34+Q.d1,3,2,gold); px(g,12+Q.x2,34+Q.d2,3,2,gold); px(g,18+Q.x2,34+Q.d1,3,2,gold); px(g,22+Q.x2,34+Q.d2,3,2,gold);
    px(g,7,31,3,1,lite);
    // arched neck with rose mane crest + forelock
    px(g,21,14,5,12,mane); px(g,21,14,2,12,"#f7d0e0");
    px(g,22,8,4,7,mane); px(g,22,8,4,1,"#f7d0e0"); px(g,23,10,2,8,maneD);
    // proud head: forehead plane, muzzle, nostril, jaw
    px(g,21,16,9,10,tint); px(g,22,16,7,2,lite);
    px(g,27,21,4,4,"#e8d9c0"); px(g,28,21,3,1,"#fff");
    px(g,29,22,2,1,"#7a4a2a"); px(g,21,24,9,2,dk);
    // spiral horn: gold shaft, light ridge, bright tip
    px(g,25,6+hb,3,9,gold); px(g,25,6+hb,1,9,goldL); px(g,26,4+hb,2,3,goldL); px(g,26,4+hb,2,1,"#fff");
    px(g,26,9+hb,2,1,maneD); px(g,26,12+hb,2,1,maneD);
    // pricked ears
    px(g,21,11,2,4,mane); px(g,25,14,2,3,mane);
    // eye with glint
    g.fillStyle="#111"; g.fillRect(24,19,2,2); g.fillStyle="#fff"; g.fillRect(24,19,1,1);
  };
  D.cinder_steed = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
    const sw=window.Anim.seg(P,0,1);
    const dk="#5a1408";
    px(g,0+sw,20,4,6,"#ff7b2e"); px(g,1+sw,18,2,4,"#ffd93d");
    px(g,6,24,19,8,tint); px(g,6,24,19,2,"#ff8a4a");
    px(g,7+Q.x2,31+Q.d1,3,5,dk); px(g,22+Q.x2,31+Q.d2,3,5,dk); px(g,7+Q.x2,31+Q.d1,3,1,"#ff9d2e");
    px(g,22,8,4,10,"#ff7b2e"); px(g,23,8,2,8,"#ffd93d");
    px(g,22,16,8,10,tint); px(g,27,21,4,3,"#3a0f08"); px(g,28,22,3,2,"#ffd93d");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  };
  D.tide_turtle = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const pad=P.moving?[-1,-2,1,2][P.f&3]:(P.idle?-1:1);
    const eb=window.Anim.hbob(P);
    px(g,1,26+pad,5,4,"#3a7a5a"); px(g,26,26-pad,5,4,"#3a7a5a");
    px(g,6,22,20,7,"#2a5a42"); px(g,9,19,14,6,"#4a9a72");
    px(g,12,20,2,3,"#d9e8c9"); px(g,16,20,2,3,"#d9e8c9"); px(g,21,20,2,3,"#d9e8c9");
    px(g,9,22,14,2,"#7ad9f0"); px(g,9,22,2,2,"#fff");
    px(g,22,16+eb,8,8,tint); g.fillStyle="#111"; g.fillRect(24,19+eb,2,2);
    px(g,27,20+eb,4,3,"#d9c9b8");
  };
  D.magma_tortoise = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const pad=P.moving?[-1,-2,1,2][P.f&3]:(P.idle?-1:1);
    const eb=window.Anim.hbob(P);
    px(g,1,26+pad,5,4,"#7a2a1a"); px(g,26,26-pad,5,4,"#7a2a1a");
    px(g,6,22,20,7,"#3a1210"); px(g,9,19,14,6,"#7a2a1a");
    px(g,12,20,2,3,"#ff7b2e"); px(g,16,20,3,4,"#ffd93d"); px(g,21,20,2,3,"#ff7b2e");
    px(g,22,16+eb,7,8,tint); g.fillStyle="#111"; g.fillRect(24,19+eb,2,2);
    px(g,27,20+eb,4,3,"#8a5a33");
  };
  D.coral_crab = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-40), lite=shade(tint,30);
    // walking legs scuttle: alternating pairs lift
    for(let s=0;s<3;s++){ const y=27+s*3+(P.moving?[0,-1,-2,-1][(s+P.f)&3]:0), xx=(P.moving?[0,1,1,-1][(s+P.f)&3]:0);
      px(g,4+xx,y,4,2,dk); px(g,3+xx,y+1,2,3,dk);
      px(g,24+xx,y,4,2,dk); px(g,27+xx,y+1,2,3,dk);
    }
    // broad oval carapace with segment ridges + rim
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,27,12,7,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,26,11,6,0,0,7); g.fill();
    px(g,8,22,16,2,lite);
    for(let i=0;i<4;i++) px(g,10+i*4,24,1,4,dk); // segment grooves
    px(g,8,25,16,1,lite); px(g,14,23,4,1,"#fff");
    // raised cheliped arms snap on atk + eyestalks bob
    const sn=P.atk?-2:P.hurt?2:0, eb=window.Anim.hbob(P);
    px(g,2,16+sn,4,9,dk); px(g,26,16+sn,4,9,dk);
    px(g,1,13+sn,6,5,dk); px(g,25,13+sn,6,5,dk);
    px(g,1,13+sn,6,2,lite); px(g,25,13+sn,6,2,lite);
    px(g,1,15+sn,2,3,dk); px(g,5,15+sn,2,3,dk); // left pincer gap teeth
    px(g,25,15+sn,2,3,dk); px(g,29,15+sn,2,3,dk);
    px(g,2,18+sn,2,2,"#fff"); px(g,26,18+sn,2,2,"#fff"); // pincer glints
    // tall eyestalks + eyes with glints bob as it walks
    px(g,12,14+eb,3,8,dk); px(g,17,14+eb,3,8,dk);
    px(g,12,14+eb,3,2,lite); px(g,17,14+eb,3,2,lite);
    g.fillStyle="#111"; g.fillRect(12,16+eb,3,3); g.fillRect(17,16+eb,3,3);
    g.fillStyle="#fff"; g.fillRect(12,16+eb,1,1); g.fillRect(17,16+eb,1,1);
    // coral polyps growing on shell
    px(g,10,20,2,3,"#ff8a7a"); px(g,11,19,1,2,"#fff");
    px(g,20,20,2,3,"#7ad9f0"); px(g,21,19,1,2,"#fff");
  };
  D.burrow_mole = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P);
    const dk=shade(tint,-35), lite=shade(tint,28);
    px(g,4,32,24,4,"#4a3320"); px(g,6,31,9,2,"#5a4028");
    px(g,6,24,19,8,tint); px(g,6,24,19,2,lite);
    px(g,7+Q.x2,31+Q.d1,3,5,dk); px(g,22+Q.x2,31+Q.d2,3,5,dk);
    px(g,22,20,8,10,tint); px(g,23,21,6,3,lite);
    px(g,24,28+(P.atk?-3:0),5,6,"#e8d9c0"); // digging spades scoop on atk
    px(g,27,21,4,4,"#e08a9a"); px(g,28,22,2,2,"#fff"); // star nose
    g.fillStyle="#111"; g.fillRect(24,21,2,1);
  };
 D.umbral_stag = (g,tint,ph)=>{
   const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
   const dk=shade(tint,-30);
    px(g,1,20,4,5,dk); px(g,0,18,3,4,"#8a7ae8");
    beastBase(g,tint,{tail:"thin",bx:5,by:23,bw:20,bh:9,legH:6,legW:2,belly:"#8a7ae8"});
    // branching void antlers nod with the head
    px(g,21,8+hb,2,9,"#8a7ae8"); px(g,24,8+hb,2,9,"#8a7ae8");
    px(g,19,11+hb,3,2,"#b0a0ff"); px(g,24,13+hb,4,2,"#b0a0ff"); px(g,21,10+hb,6,2,"#b0a0ff");
    px(g,22,16+hb,8,10,tint); g.fillStyle="#b0a0ff"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,2);
  };
  D.cinder_maw = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{});
    px(g,8,22,10,3,"#ff9d2e");
    px(g,22,12+hb,3,5,"#ff7b2e");
    px(g,22,16+hb,8,10,tint); px(g,27,21+hb+(P.atk?2:0),5,4,"#3a0f08");
    g.fillStyle="#ffe14d"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,1);
    g.fillStyle="#fff"; g.fillRect(27,22+hb+(P.atk?2:0),1,2); g.fillRect(29,22+hb+(P.atk?2:0),1,2);
  };
  D.mire_lurker = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    beastBase(g,tint,{});
    px(g,8,20,12,3,"#2a4a3a"); px(g,10,22,4,2,"#9adc9a");
    px(g,22,12+hb,4,6,"#9adc9a"); px(g,22,12+hb,4,2,"#d9ff9d"); // lure stalk nods
    px(g,22,16+hb,8,10,tint); g.fillStyle="#9adc9a"; g.fillRect(24,19+hb,2,2); g.fillStyle="#111"; g.fillRect(24,19+hb,1,1);
    px(g,27,21+hb+(P.atk?1:0),4,3,"#3a2a1a");
  };
  D.velociraptor = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-35);
    const sw=window.Anim.seg(P,0,1);
    px(g,1+sw,18,7,3,dk); px(g,0+sw,16,3,4,dk); // tail counter-balances
    px(g,12+A.lx,26+A.ld,4,6,dk); px(g,18+A.rx,26+A.rd,4,6,dk); px(g,18+A.rx,29+A.rd,4,2,"#c9ccd4"); // sickle claw
    px(g,11,16,10,12,tint); px(g,11,16,10,2,shade(tint,30));
    px(g,15,8,10,8,tint); px(g,16,9,8,3,shade(tint,30));
    px(g,22,12,5,4,"#e8d9b8"); px(g,25,13,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(18,10,2,2); g.fillStyle="#111"; g.fillRect(18,10,1,2);
    px(g,11+A.lax,18+A.la,3,6,shade(tint,30)); // striped arm swings
  };


  // ---- BATCH 4: humanoids / brutes / undead / ghosts / swarms / constructs ----
  // GOBLIN v2: big ears, loincloth, dagger — short but fierce.
  D.goblin = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const skin="#58a34d";
    g.fillStyle=skin; g.beginPath(); g.moveTo(10,13); g.lineTo(0,9); g.lineTo(3,16); g.fill();
    g.beginPath(); g.moveTo(22,13); g.lineTo(32,9); g.lineTo(29,16); g.fill();
    px(g,11+A.lx,31+A.ld,4,5,"#2f7a2f"); px(g,17+A.rx,31+A.rd,4,5,"#2f7a2f");
    px(g,9,21,14,11,tint); px(g,13,24,6,8,"#6b4226");
    px(g,6+A.lax,22+A.la,3,8,skin); px(g,23+A.rax,22+A.ra,3,8,skin);
    px(g,9,8,14,12,skin); px(g,10,9,12,3,"#6fbf63");
    g.fillStyle="#ffe14d"; g.fillRect(11,14,4,3); g.fillRect(18,14,4,3);
    g.fillStyle="#111"; g.fillRect(13,14,2,3); g.fillRect(19,14,2,3);
    px(g,14,17,4,3,"#3f7d36");
    g.fillStyle="#fff"; g.fillRect(13,20,1,2); g.fillRect(18,20,1,2);
    px(g,25,24+(P.atk?-5:0),2,8,"#cccccc"); px(g,24,31+(P.atk?-5:0),4,2,"#6b4226");
  };
  D.goblin_shaman = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const skin="#2f8a4f";
    g.fillStyle=skin; g.beginPath(); g.moveTo(10,12); g.lineTo(2,8); g.lineTo(4,15); g.fill();
    g.beginPath(); g.moveTo(22,12); g.lineTo(30,8); g.lineTo(28,15); g.fill();
    px(g,11+A.lx,30+A.ld,4,6,"#1f4a2f"); px(g,17+A.rx,30+A.rd,4,6,"#1f4a2f");
    px(g,9,20,14,12,tint); px(g,9,20,14,2,"#d9c27f");
    px(g,9,9,14,11,skin);
    g.fillStyle="#ffe14d"; g.fillRect(11,12,4,3); g.fillStyle="#111"; g.fillRect(12,13,1,2);
    px(g,13,2,6,5,"#d9c27f"); px(g,15,0,2,4,"#c93b3b"); // feather staff-top
    px(g,25,18+(P.atk?-7:0),2,10,"#5a3a22"); px(g,24,14+(P.atk?-7:0),4,5,shade(tint,25));
    if (P.atk) px(g,24,14-7,4,1,"#fff"); // staff-top blazes on cast
  };
  D.goblin_brute = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-40);
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(3,5); g.lineTo(6,12); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(29,5); g.lineTo(26,12); g.fill();
    px(g,8+A.lx,30+A.ld,6,6,dk); px(g,18+A.rx,30+A.rd,6,6,dk);
    px(g,7+A.lx,34+A.ld,3,2,"#111"); px(g,19+A.rx,34+A.rd,3,2,"#111");
    // broad armored shoulders, lit plates (not a dark blob)
    px(g,5,17,9,14,shade(tint,-15)); px(g,18,17,9,14,shade(tint,-15));
    px(g,5,17,9,2,shade(tint,20)); px(g,18,17,9,2,shade(tint,20));
    px(g,9,14,14,17,dk); px(g,11,16,10,13,shade(tint,15));
    px(g,11,16,10,2,shade(tint,35)); // chest light
    // heavy brow + red eyes
    px(g,10,9,12,3,dk);
    g.fillStyle="#ff3b3b"; g.fillRect(12,10,3,2); g.fillRect(18,10,2,2);
    g.fillStyle="#111"; g.fillRect(13,10,1,2);
    // cleaver raised high on atk
    px(g,25,20+(P.atk?-7:0),3,10,"#6b4226"); px(g,23,18+(P.atk?-7:0),6,3,"#9aa0a8");
    px(g,23,18+(P.atk?-7:0),6,1,"#fff");
  };
  D.kobold = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint);
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(4,4); g.lineTo(8,12); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(28,4); g.lineTo(24,12); g.fill();
    px(g,9,9,14,11,tint); px(g,13,16,6,3,shade(tint,-50));
    // snout + nose
    px(g,13,16,6,4,"#d9c9b8"); px(g,15,18,2,2,"#7a4a2a");
    g.fillStyle="#ffe14d"; g.fillRect(11,12,3,2); g.fillRect(18,12,3,2); g.fillStyle="#111"; g.fillRect(12,13,1,1); g.fillRect(19,13,1,1);
    // miner's helm candle: wax stub + flame + glow (not a gold slab)
    px(g,14,3,4,3,"#e8e0d0"); px(g,14,3,4,1,"#fff");
    px(g,15,0,2,3,"#ff9d2e"); px(g,15,0,2,1,"#fff");
    px(g,13,0,6,1,"rgba(255,200,80,0.5)");
  };
  D.kobold_shaman = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,4,6,shade(tint,-35)); px(g,17+A.rx,30+A.rd,4,6,shade(tint,-35));
    px(g,9,20,14,12,"#2a4a7a"); px(g,9,20,14,2,"#7fb0ff");
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(5,3); g.lineTo(8,11); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(27,3); g.lineTo(24,11); g.fill();
    px(g,9,9,14,11,tint);
    g.fillStyle="#ffe14d"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    g.fillStyle="#111"; g.fillRect(12,12,1,2); g.fillRect(18,12,1,2);
    px(g,24,16+(P.atk?-6:0),2,10,"#5a3a22"); px(g,23,12+(P.atk?-6:0),4,P.atk?7:5,"#ff6b2e");
    if (P.atk) px(g,24,11-6,2,2,"#ffd93d"); // torch flares on cast
  };
  D.orc_grunt = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-40);
    px(g,8+A.lx,30+A.ld,6,6,dk); px(g,18+A.rx,30+A.rd,6,6,dk);
    px(g,9,16,14,15,tint); px(g,11,18,10,11,shade(tint,12));
    // jaw tusks: small fangs jutting UP from the lower jaw (not a slab)
    px(g,11,18,2,4,"#e8e0d0"); px(g,19,18,2,4,"#e8e0d0");
    px(g,11,18,2,1,"#fff"); px(g,19,18,2,1,"#fff");
    px(g,13,21,6,3,"#7a1f1f"); // open snarl
    // heavy brow + eyes
    px(g,10,10,12,3,dk);
    g.fillStyle="#ffe14d"; g.fillRect(12,12,3,2); g.fillStyle="#111"; g.fillRect(13,12,1,2);
    px(g,25,18+(P.atk?-6:0),2,10,"#6b4226"); px(g,23,20+(P.atk?-6:0),6,3,"#888");
  };
  D.orc_shaman = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,9,20,14,3,"#d9c27f");
    px(g,9,9,14,11,shade(tint,10));
    px(g,10,2,3,8,"#e8e0d0"); px(g,19,2,3,8,"#e8e0d0");
    g.fillStyle="#7fd4ff"; g.fillRect(12,12,3,2); g.fillStyle="#111"; g.fillRect(13,12,1,2);
    px(g,25,16,2,12,"#5a3a22"); px(g,24,12,4,5,"#ff9d2e");
  };
  D.minotaur_calf = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-40);
    px(g,8+A.lx,30+A.ld,6,6,dk); px(g,18+A.rx,30+A.rd,6,6,dk);
    px(g,9,18,14,13,tint);
    px(g,11,6,10,9,tint);
    g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11,7); g.lineTo(6,1); g.lineTo(9,10); g.fill();
    g.beginPath(); g.moveTo(21,7); g.lineTo(26,1); g.lineTo(23,10); g.fill();
    px(g,13,11,6,4,"#d9a0a0");
    g.fillStyle="#ffe14d"; g.fillRect(12,9,3,2); g.fillStyle="#111"; g.fillRect(13,9,1,2);
    px(g,13,15,6,1,"#7a1f1f");
  };
  D.cyclops_whelp = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-35), lite=shade(tint,20);
    px(g,8+A.lx,30+A.ld,6,6,dk); px(g,18+A.rx,30+A.rd,6,6,dk);
    px(g,9,16,14,15,tint); px(g,11,18,10,10,lite);
    // head SAME tint, heavy brow unibrow over single eye
    px(g,10,6,12,10,tint); px(g,10,6,12,2,lite);
    px(g,11,8,10,2,dk);
    g.fillStyle="#ffe14d"; g.fillRect(13,10,6,5); g.fillStyle="#111"; g.fillRect(15,11,2,3);
    g.fillStyle="#fff"; g.fillRect(14,10,2,2);
    px(g,13,15,6,1,"#7a1f1f");
    px(g,25,20+(P.atk?-6:0),3,8,"#6b4226"); px(g,25,18+(P.atk?-6:0),5,3,"#888");
  };
  D.satyr = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,4,6,"#3a2a1a"); px(g,17+A.rx,30+A.rd,4,6,"#3a2a1a");
    px(g,9,20,14,12,tint); px(g,13,24,6,4,"#8a5a33");
    px(g,9,9,14,11,tint);
    px(g,5,2,4,8,"#e8e0d0"); px(g,23,2,4,8,"#e8e0d0"); // goat horns
    g.fillStyle="#ffe14d"; g.fillRect(12,13,3,2); g.fillStyle="#111"; g.fillRect(13,13,1,2);
    px(g,25,18+(P.atk?-4:0),2,8,"#8a5a33"); px(g,23,20+(P.atk?-4:0),6,2,"#c9a227"); // pipes raised to lips on atk
  };
  D.troll_whelp = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,16,14,15,tint); px(g,11,18,10,11,shade(tint,20));
    px(g,10,8,12,9,tint);
    px(g,14,10,4,3,"#8a9a6a"); px(g,12,20,3,3,"#6a8a4a");
    g.fillStyle="#ffe14d"; g.fillRect(12,9,3,2); g.fillStyle="#111"; g.fillRect(13,9,1,2);
    px(g,5,4,6,4,"#4a6a3a");
  };
  D.oni_imp = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,16,14,15,tint);
    px(g,10,2,3,5,"#ffd93d"); px(g,19,2,3,5,"#ffd93d");
    px(g,10,6,12,11,tint);
    g.fillStyle="#ffe14d"; g.fillRect(12,10,3,2); g.fillStyle="#111"; g.fillRect(13,10,1,2);
    px(g,13,14,6,2,"#fff");
    px(g,25,16,3,10,"#5a3a22"); px(g,24,12,5,5,"#7a7a88");
  };
  D.redcap = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,4,6,"#3a2a1a"); px(g,17+A.rx,30+A.rd,4,6,"#3a2a1a");
    px(g,9,20,14,12,"#8a1a1a");
    px(g,9,2,14,7,"#c93b3b"); px(g,9,2,14,2,"#ff6a6a"); // blood cap
    px(g,9,9,14,11,"#d9a06b"); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    px(g,25,20+(P.atk?-7:0),2,12,"#9aa0a8"); px(g,24,30+(P.atk?-7:0),4,2,"#5a3a22");
  };
  D.kappa = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint);
    px(g,8,20,3,6,"#2a5a3a"); px(g,21,20,3,6,"#2a5a3a");
    px(g,9,9,14,11,tint); px(g,13,16,6,3,"#e8d9a0"); // beak
    g.fillStyle="#ffe14d"; g.fillRect(12,12,2,2); g.fillStyle="#111"; g.fillRect(12,12,1,2);
    px(g,12,4,8,3,"#2a7a9a"); px(g,13,5,6,1,"#9adcff"); // water dish
  };
  D.hulder = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const sw=window.Anim.seg(P,0,1);
    // v2: forest bride — leaf crown, shaded hair, bark-trim bodice, proud tail.
    px(g,11+A.lx,30+A.ld,4,6,"#8a6a4a"); px(g,17+A.rx,30+A.rd,4,6,"#8a6a4a"); // bare feet + bark ankles
    px(g,11+A.lx,28+A.ld,4,2,"#5a4028"); px(g,17+A.rx,28+A.rd,4,2,"#5a4028");
    // pink skirt with hem trim + bark waistband
    px(g,9,20,14,11,tint); px(g,9,20,14,1,shade(tint,30));
    px(g,9,29,14,2,"#5a4028"); px(g,10,29,2,2,"#7ac97a"); px(g,15,29,2,2,"#7ac97a"); px(g,20,29,2,2,"#7ac97a");
    px(g,9,20,14,2,"#5a4028"); px(g,9,20,14,1,"#7a5a38"); // bark bodice band
    for(let i=0;i<4;i++) px(g,10+i*3,21,1,3,"#4a3320"); // bark grooves
    // arms pale with bark bracelets swing as she walks
    px(g,6+A.lax,20+A.la,3,7,"#e8c9a0"); px(g,23+A.rax,20+A.ra,3,7,"#e8c9a0");
    px(g,6+A.lax,24+A.la,3,2,"#5a4028"); px(g,23+A.rax,24+A.ra,3,2,"#5a4028");
    // face + lashes + smile
    px(g,11,9,10,10,"#f2c9a0"); px(g,11,9,10,1,"#fff");
    g.fillStyle="#111"; g.fillRect(13,12,2,3); g.fillRect(18,12,2,3);
    g.fillStyle="#fff"; g.fillRect(13,12,1,1); g.fillRect(18,12,1,1);
    px(g,12,12,1,2,"#111"); px(g,19,12,1,2,"#111"); // lashes
    px(g,15,16,3,1,"#a02040");
    // long flaxen hair with shadow strands
    px(g,7,4,4,16,"#f2e3c2"); px(g,21,4,4,16,"#f2e3c2");
    px(g,7,4,4,2,"#fff"); px(g,21,4,4,2,"#fff");
    px(g,8,6,2,12,"#c9a95e"); px(g,22,6,2,12,"#c9a95e");
    // LEAF CROWN with 3 flowers
    px(g,8,1,16,3,"#2f7a3a"); px(g,8,1,16,1,"#7ac97a");
    px(g,11,0,3,3,"#ff9dc9"); px(g,12,0,1,1,"#fff");
    px(g,15,1,3,2,"#ffd93d"); px(g,20,0,3,3,"#ff9dc9"); px(g,21,0,1,1,"#fff");
    // cow tail OUT where it reads: curved + dark tuft, swishing
    px(g,25+sw,24,3,6,"#8a5a33"); px(g,26+sw,29,4,3,"#3a2a1a"); px(g,26+sw,29,4,1,"#5a4a33");
  };
  D.nokk = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,4,6,shade(tint,-35)); px(g,17+A.rx,30+A.rd,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint);
    px(g,7,4,5,14,"#7ad9f0"); px(g,20,4,5,14,"#7ad9f0"); // water hair
    px(g,9,9,14,11,"#d9e8d0"); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    px(g,24,20+(P.atk?-4:0),2,10,"#8a5a33"); px(g,22,22+(P.atk?-4:0),6,4,"#6b4226"); // fiddle raised to play on atk
  };
  D.vodyanoy = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-35);
    // frog-fish waterman: fin ears, bulging eyes, wide toothless maw, gills
    px(g,11+A.lx,30+A.ld,4,6,dk); px(g,17+A.rx,30+A.rd,4,6,dk);
    px(g,10+A.lx,34+A.ld,5,2,"#1e4a3c"); px(g,17+A.rx,34+A.rd,5,2,"#1e4a3c"); // webbed feet
    px(g,9,20,14,12,tint); px(g,9,20,14,2,shade(tint,20));
    px(g,13,23,6,6,"#d9e8c9"); // pale belly
    px(g,11,16,10,3,"#0f2a22");
    px(g,7,1,4,7,"#3a6a4a"); px(g,21,1,4,7,"#3a6a4a"); // fin ears
    px(g,7,1,4,2,"#7ac97a"); px(g,21,1,4,2,"#7ac97a");
    px(g,9,8,14,12,tint);
    // bulging frog eyes on top
    px(g,11,6,4,5,shade(tint,20)); px(g,17,6,4,5,shade(tint,20));
    g.fillStyle="#ffe14d"; g.fillRect(12,7,2,3); g.fillRect(18,7,2,3);
    g.fillStyle="#111"; g.fillRect(12,8,2,2); g.fillRect(18,8,1,2);
    // wide maw OPENS on atk + gill slits
    px(g,12,16,8,P.atk?4:2,"#0f2a22"); px(g,11,15,1,3,"#0f2a22"); px(g,20,15,1,3,"#0f2a22");
    px(g,9,12,2,4,dk); px(g,21,12,2,4,dk);
    // webbed arms paddle
    px(g,6+A.lax,20+A.la,3,8,tint); px(g,23+A.rax,20+A.ra,3,8,tint);
    px(g,5+A.lax,26+A.la,2,3,tint); px(g,25+A.rax,26+A.ra,2,3,tint);
  };
  D.domovoi_rogue = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,4,6,"#3a2a1a"); px(g,17+A.rx,30+A.rd,4,6,"#3a2a1a");
    px(g,9,20,14,12,"#4a3a2a"); px(g,11,15,10,5,"#e8e0d0"); // beard
    px(g,9,7,14,11,"#d9a06b"); g.fillStyle="#111"; g.fillRect(12,10,2,2); g.fillRect(18,10,2,2);
    px(g,9,2,14,5,"#2a2a2a");
    px(g,25+(P.atk?-3:0),16,2,14,"#6b4226"); px(g,22+(P.atk?-3:0),24,8,3,"#a06a3a"); // broom sweeps on atk
  };
  D.rakshasa_cub = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,4,6,"#5a3a22"); px(g,17+A.rx,30+A.rd,4,6,"#5a3a22");
    px(g,9,20,14,12,tint); px(g,9,20,14,2,"#ffd93d");
    // tiger face: stripes, snarl with fangs, round ears (seated ON head)
    px(g,11,6,3,4,tint); px(g,18,6,3,4,tint);
    px(g,11,6,3,2,"#7a1f1f"); px(g,18,6,3,2,"#7a1f1f");
    px(g,9,9,14,11,tint); px(g,10,10,2,7,"#7a1f1f"); px(g,20,10,2,7,"#7a1f1f"); // stripes
    px(g,14,9,4,2,"#7a1f1f"); // brow stripe
    g.fillStyle="#ffe14d"; g.fillRect(12,13,3,3); g.fillRect(18,13,2,2); g.fillStyle="#111"; g.fillRect(13,14,1,2); g.fillRect(18,14,1,1);
    px(g,13,17,6,P.atk?4:2,"#7a1f1f");
    px(g,14,17,1,P.atk?3:2,"#fff"); px(g,17,17,1,P.atk?3:2,"#fff"); // fangs lengthen on atk
  };
  D.leshy = (g,tint,ph)=>{
    // v2: old bark warden — plated trunk, moss beard, clawed limbs, shelf fungi.
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-40);
    px(g,10+A.lx,30+A.ld,4,6,dk); px(g,18+A.rx,30+A.rd,4,6,dk);
    px(g,9+A.lx,33+A.ld,6,2,"#3a2a1a"); px(g,17+A.rx,33+A.rd,6,2,"#3a2a1a"); // root feet
    // trunk with horizontal bark plates
    px(g,9,16,14,15,tint); px(g,9,16,14,2,shade(tint,25));
    px(g,9,16,2,15,dk); px(g,21,16,2,15,dk);
    for(let i=0;i<3;i++){ const y=20+i*4; px(g,9,y,14,1,dk); px(g,10,y,4,1,shade(tint,25)); }
    px(g,12,18,8,5,"#2f4a1f"); px(g,13,19,6,3,"#7dd68a"); // moss patch
    // clawed branch arms rear up to slam on atk
    px(g,5+A.lax,18+(P.atk?-4:A.la),4,9,dk); px(g,23+A.rax,18+(P.atk?-4:A.ra),4,9,dk);
    px(g,5+A.lax,18+(P.atk?-4:A.la),4,2,shade(tint,20)); px(g,23+A.rax,18+(P.atk?-4:A.ra),4,2,shade(tint,20));
    px(g,4+A.lax,26+(P.atk?-4:A.la),2,3,"#e8e0d0"); px(g,6+A.lax,26+(P.atk?-4:A.la),2,2,"#e8e0d0"); px(g,24+A.rax,26+(P.atk?-4:A.ra),2,2,"#e8e0d0"); px(g,26+A.rax,26+(P.atk?-4:A.ra),2,3,"#e8e0d0");
    // shelf fungi on shoulder
    px(g,5,16,4,2,"#e8e0d0"); px(g,5,18,4,1,"#c93b3b"); px(g,24,15,3,2,"#e8e0d0"); px(g,24,17,3,1,"#c93b3b");
    // bark face + MOSS BEARD + big amber eyes
    px(g,10,6,12,11,tint); px(g,10,6,12,2,shade(tint,30)); px(g,10,6,2,11,dk); px(g,20,6,2,11,dk);
    px(g,13,8,6,2,dk); // brow furrow
    g.fillStyle="#111"; g.fillRect(12,9,4,4); g.fillRect(18,9,3,4);
    g.fillStyle="#ffd93d"; g.fillRect(13,10,2,2); g.fillRect(18,10,2,2);
    g.fillStyle="#fff"; g.fillRect(13,10,1,1); g.fillRect(18,10,1,1);
    for(let i=0;i<3;i++){ px(g,12+i*3,14,2,4,"#3a6a2a"); px(g,12+i*3,14,2,1,"#7ac97a"); } // beard
    // twig antlers with leaves
    px(g,7,1,3,6,"#4a2f1a"); px(g,22,1,3,6,"#4a2f1a");
    px(g,5,3,3,3,"#3a6a2a"); px(g,24,3,3,3,"#3a6a2a");
    px(g,9,0,2,3,"#3a6a2a"); px(g,21,0,2,3,"#3a6a2a");
  };
  D.bandit = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    // v2: masked cutthroat — domino mask, scarf, belt, dagger, boots.
    px(g,11+A.lx,30+A.ld,4,6,"#33333e"); px(g,17+A.rx,30+A.rd,4,6,"#33333e");
    px(g,10+A.lx,34+A.ld,6,2,"#1a1a1f"); px(g,16+A.rx,34+A.rd,6,2,"#1a1a1f"); // boots
    px(g,9,18,14,13,tint); px(g,9,18,14,1,shade(tint,20));
    px(g,9,18,2,13,shade(tint,-30)); // coat shading
    // scarf + belt with buckle + sheath
    px(g,9,17,14,3,"#a02020"); px(g,9,17,14,1,"#ff6a6a");
    px(g,4,20,3,4,"#a02020");
    px(g,9,25,14,2,"#3a2e22"); px(g,14,25,4,2,"#ffd93d"); px(g,15,25,2,2,"#7a5a10");
    // DOMINO MASK with eye glints
    px(g,10,9,12,4,"#1c1c22");
    g.fillStyle="#fff"; g.fillRect(12,10,3,2); g.fillRect(18,10,2,2);
    g.fillStyle="#111"; g.fillRect(13,10,1,2); g.fillRect(18,10,1,2);
    px(g,10,6,12,6,"#d9a06b"); px(g,12,6,8,2,shade("#d9a06b",20));
    px(g,14,14,4,1,"#7a4a2a"); // smirk
    // slouch cap + dagger slashes up on atk
    px(g,8,0,16,4,"#3a2e22"); px(g,8,0,16,1,"#5a4c38"); px(g,20,3,4,2,"#2e2620");
    px(g,25,14+(P.atk?-6:0),2,4,"#5a3a22"); px(g,25,18+(P.atk?-6:0),2,8,"#c9ccd4"); px(g,25,18+(P.atk?-6:0),2,1,"#fff");
    px(g,24,17,4,2,"#3a2e22");
  };
  D.outlaw = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    // v2: duster desperado — hat band, serape stripes, gunbelt, pistol, boots.
    px(g,11+A.lx,30+A.ld,4,6,"#33333e"); px(g,17+A.rx,30+A.rd,4,6,"#33333e");
    px(g,10+A.lx,34+A.ld,6,2,"#1a1a1f"); px(g,16+A.rx,34+A.rd,6,2,"#1a1a1f");
    px(g,9,18,14,13,tint); px(g,9,18,14,1,shade(tint,15));
    // serape stripes + gunbelt
    px(g,9,19,14,3,"#4a3a52"); px(g,9,19,14,1,"#7a6a8a");
    px(g,9,23,14,1,"#c93b3b"); px(g,9,26,14,2,"#3a2e22");
    px(g,14,26,4,2,"#ffd93d"); px(g,15,26,2,2,"#7a5a10");
    for(let i=0;i<3;i++) px(g,10+i*4,20,1,3,"#c93b3b"); // blanket stitches
    // face + mustache + bounty eyes
    px(g,10,8,12,10,"#d9a06b");
    g.fillStyle="#111"; g.fillRect(12,10,3,2); g.fillRect(18,10,2,2);
    px(g,13,13,6,2,"#3a2a1a"); px(g,14,13,4,1,"#5a4a33"); // mustache
    // wide hat with band + dent
    px(g,6,5,20,3,"#2e2620"); px(g,10,1,12,5,"#2e2620");
    px(g,10,3,12,2,"#c93b3b"); px(g,13,1,6,1,"#4a3f30");
    // PISTOL levels at the victim on atk (not a long blade)
    px(g,25,16+(P.atk?-3:0),2,5,"#5a3a22");
    px(g,24,20+(P.atk?-3:0),5,3,"#3a3a44"); px(g,24,20+(P.atk?-3:0),5,1,"#8a8a92"); px(g,27,20+(P.atk?-3:0),2,2,"#2a2a32");
    if (P.atk) px(g,29,20-3,2,2,"#ffd93d"); // muzzle flash
  };
  D.murderer = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    // v2: cowl killer — face shadow, red slit glow, bloody knife, cloak folds.
    px(g,11+A.lx,30+A.ld,4,6,"#1a1a1f"); px(g,17+A.rx,30+A.rd,4,6,"#1a1a1f");
    px(g,9,18,14,13,"#3a0f14"); px(g,9,18,14,1,shade("#3a0f14",25));
    px(g,9,18,2,13,"#1a080c"); px(g,13,20,2,9,"#1a080c"); px(g,19,20,2,9,"#1a080c"); // folds
    px(g,9,26,14,2,"#1a080c"); px(g,15,26,2,2,"#5a5a6a"); // rope belt
    // cowl + FACE SHADOW with red slits
    px(g,8,1,16,9,"#3a0f14"); px(g,8,1,16,1,shade("#3a0f14",30));
    px(g,8,1,3,15,"#3a0f14"); px(g,21,1,3,15,"#3a0f14");
    px(g,11,6,10,9,"#0c0a12");
    g.fillStyle="#ff3b3b"; g.fillRect(12,9,3,2); g.fillRect(18,9,2,2);
    g.fillStyle="#fff"; g.fillRect(12,9,1,1);
    px(g,14,13,4,1,"#3a0f14"); // hidden mouth
    // BLOODY KNIFE strikes up on atk: dark hilt + red-edged blade
    px(g,25,13+(P.atk?-7:0),2,6,"#1a1a1f");
    px(g,24,18+(P.atk?-7:0),3,10,"#c9ccd4"); px(g,24,18+(P.atk?-7:0),3,1,"#fff"); px(g,26,19+(P.atk?-7:0),1,8,"#c93b3b");
    px(g,26,19,1,2,"#ff6a6a");
  };
  // SKELETON v2: ribcage + skull + blade.
  D.skeleton = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const bone="#e8e4d8";
    px(g,11+A.lx,30+A.ld,3,6,bone); px(g,18+A.rx,30+A.rd,3,6,bone);
    px(g,6+A.lax,20+A.la,3,8,bone); px(g,23+A.rax,20+A.ra,3,8,bone);
    px(g,14,18,4,13,bone); for(let i=0;i<4;i++){ g.fillStyle="#1a1a1f"; g.fillRect(11,20+i*3,10,1); }
    px(g,10,5,12,11,bone); px(g,12,3,8,3,bone);
    g.fillStyle="#1a1a1f"; g.fillRect(12,8,4,5); g.fillRect(17,8,4,5);
    g.fillStyle="#ff3b3b"; g.fillRect(13,10,1,1); g.fillRect(18,10,1,1);
    px(g,15,10,2,4,"#9a968a"); for(let x=0;x<4;x++){ g.fillStyle="#1a1a1f"; g.fillRect(12+x*3,15,1,2); }
    px(g,25,14+(P.atk?-7:0),2,12,"#9aa0a8"); px(g,24,25+(P.atk?-7:0),4,3,"#5a3a22");
  };
  D.cultist = (g,tint,ph)=>{
    // v2: pit preacher — shaded hood, glowing eyes, rune stole, crystal staff.
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-45);
    const sw=window.Anim.seg(P,0,1);
    px(g,9+sw,28,14,8,dk); px(g,9+sw,28,14,1,shade(tint,-20));
    px(g,10,18,12,12,tint); px(g,10,18,12,2,shade(tint,20));
    px(g,10,18,2,12,dk); px(g,20,18,2,12,dk);
    // rune stole
    px(g,14,18,4,10,"#ffd93d"); px(g,15,20,2,2,"#7a1f2e"); px(g,15,23,2,2,"#7a1f2e"); px(g,15,26,2,1,"#7a1f2e");
    // hood with rim shadow + face void
    px(g,8,1,16,9,tint); px(g,8,1,16,2,shade(tint,25));
    px(g,8,1,3,15,dk); px(g,21,1,3,15,dk); px(g,8,8,16,2,dk);
    px(g,11,6,10,9,"#0c0a12");
    g.fillStyle="#c77dff"; g.fillRect(12,9,3,3); g.fillRect(18,9,2,3);
    g.fillStyle="#fff"; g.fillRect(12,9,1,1); g.fillRect(18,9,1,1);
    g.fillStyle="#0c0a12"; g.fillRect(13,10,1,2); g.fillRect(18,10,1,2);
    // sleeves sway + hands grip a crystal staff raised to curse on atk
    px(g,6+A.lax,20+A.la,4,8,dk); px(g,22+A.rax,20+A.ra,4,8,dk);
    px(g,6+A.lax,26+A.la,4,3,"#d9c9b8"); px(g,22+A.rax,24+A.ra,4,3,"#d9c9b8");
    px(g,26,10+(P.atk?-6:0),2,18,"#5a3a22"); px(g,25,6+(P.atk?-6:0),4,5,"#c77dff"); px(g,26,7+(P.atk?-6:0),2,3,"#fff");
    if (P.atk) px(g,25,4,4,2,"#fff"); // crystal flares
  };
  D.wraith = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const sh="rgba(126,196,212,0.95)", mid="rgba(178,238,246,0.95)", dk="rgba(70,130,145,0.95)";
    // tattered tail strips writhe out of phase
    const w0=P.atk?3:P.moving?[0,2,-1,1][P.f&3]:0, w1=P.atk?-3:P.moving?[0,-2,1,-1][P.f&3]:0;
    const wHu=P.hurt?2:0;
    px(g,13,4,6,2,sh); px(g,11,6,10,2,sh); px(g,10,8,12,3,sh); px(g,9,11,14,4,sh);
    px(g,11,15,10,13,sh); px(g,12,16,8,11,mid);
    px(g,13,12+wHu,6,3,"#0a1a20"); px(g,14,13+wHu,4,6,"#060f14");
    g.fillStyle="#e2feff"; g.fillRect(14,14+wHu,1,3); g.fillRect(17,15+wHu,1,3);
    px(g,7+w0,19,3,7,sh); px(g,22+w1,17,3,7,sh);
    g.fillStyle=sh; g.fillRect(10+w0,27,3,9); g.fillRect(14+w1,27,2,5); g.fillRect(17+w0,27,4,10); g.fillRect(22+w1,27,2,6);
  };
  D.banshee = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    // wailing ghost: flowing hair strands, small pale face, open wail, torn gown
    const w0=P.atk?3:P.moving?[0,2,-1,1][P.f&3]:0, w1=P.atk?-3:P.moving?[0,-2,1,-1][P.f&3]:(((P.t*1.5)|0)&1?-1:1);
    px(g,7+w0,2,5,16,"#e8e0d0"); px(g,20+w1,2,5,16,"#e8e0d0");
    px(g,7+w0,2,5,2,"#fff"); px(g,20+w1,2,5,2,"#fff");
    px(g,8+w0,6,2,10,"#c9b8c0"); px(g,22+w1,6,2,10,"#c9b8c0"); // hair shadow strands
    px(g,9,8,14,22,"#c9d9e8"); px(g,11,10,10,20,shade("#c9d9e8",25));
    // small pale screaming face
    px(g,12,12,8,9,"#f2e8e8");
    g.fillStyle="#111"; g.fillRect(13,14,2,2); g.fillRect(18,14,1,2);
    g.fillStyle="#fff"; g.fillRect(13,14,1,1);
    px(g,15,17,2,P.atk?6:4,"#0c0a12"); px(g,15,17,2,1,"#7a1f2e"); // open wail
    px(g,14,21,4,P.atk?5:3,"#fff"); px(g,15,22,2,P.atk?7:4,"#fff"); // wail stream pours out
    // grasping arms reach + torn gown hem kicks
    px(g,6+w0,20,3,8,"#c9d9e8"); px(g,23+w1,20,3,8,"#c9d9e8");
    px(g,6+w0,27,3,2,"#e8e0d0"); px(g,23+w1,27,3,2,"#e8e0d0");
    px(g,10+w0,30,3,6,"#c9d9e8"); px(g,19+w1,30,3,6,"#c9d9e8");
    px(g,10+w0,34,2,2,"#8a9ab0"); px(g,20+w1,34,2,2,"#8a9ab0");
  };
  D.striga = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    const dk=shade(tint,-40), lite=shade(tint,25);
    // spread bat wings FLAP about the shoulders: different sail every frame
    g.save(); g.translate(11,20); g.rotate(WA); g.translate(-11,-20);
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(11,20); g.lineTo(1,8); g.lineTo(3,14); g.lineTo(6,13); g.lineTo(8,19); g.fill();
    px(g,2,10,3,4,shade(tint,15));
    px(g,4,13,1,5,dk);
    g.restore();
    g.save(); g.translate(21,20); g.rotate(-WA); g.translate(-21,-20);
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(21,20); g.lineTo(31,8); g.lineTo(29,14); g.lineTo(26,13); g.lineTo(24,19); g.fill();
    px(g,27,10,3,4,shade(tint,15));
    px(g,27,13,1,5,dk);
    g.restore();
    // small fierce body
    px(g,11,18,10,12,tint); px(g,11,18,10,2,lite);
    px(g,13,22,6,6,shade(tint,-15));
    // big-eyed night face + hooked beak
    px(g,11,10,10,9,tint); px(g,12,10,8,2,lite);
    g.fillStyle="#ffe14d"; g.fillRect(12,12,4,4); g.fillRect(18,12,3,3);
    g.fillStyle="#111"; g.fillRect(13,13,2,3); g.fillRect(18,13,2,2);
    g.fillStyle="#fff"; g.fillRect(13,13,1,1); g.fillRect(18,12,1,1);
    px(g,15,16,3,3,"#e8a020"); px(g,16,18,1,2,"#7a4a10");
    // raking talons below stamp + on wings
    px(g,7,6,4,4,"#e8e0d0"); px(g,8,6,1,4,dk); px(g,21,6,4,4,"#e8e0d0"); px(g,23,6,1,4,dk);
    px(g,11+A.lx,30+A.ld,3,4,dk); px(g,18+A.rx,30+A.rd,3,4,dk);
    px(g,10+A.lx,33+A.ld,4,1,"#e8e0d0"); px(g,18+A.rx,33+A.rd,4,1,"#e8e0d0");
  };
  D.utukku = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-45), lite=shade(tint,25);
    // hulking demon: curved horns, heavy brow, fanged jaw, clawed arms
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(4,2); g.lineTo(4,6); g.lineTo(8,12); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(28,2); g.lineTo(28,6); g.lineTo(24,12); g.fill();
    px(g,4,2,3,3,"#e8e0d0"); px(g,25,2,3,3,"#e8e0d0"); // horn tips
    // legs stomp + clawed feet ride along
    px(g,10+A.lx,28+A.ld,4,8,dk); px(g,18+A.rx,28+A.rd,4,8,dk);
    px(g,9+A.lx,34+A.ld,6,2,dk); px(g,17+A.rx,34+A.rd,6,2,dk);
    px(g,9+A.lx,34+A.ld,2,2,"#e8e0d0"); px(g,18+A.rx,34+A.rd,2,2,"#e8e0d0");
    // barrel torso with lit chest rune
    px(g,8,14,16,16,tint); px(g,8,14,16,2,lite); px(g,8,14,3,16,dk); px(g,21,14,3,16,dk);
    px(g,13,20,6,5,"#2a1f3a"); px(g,14,21,4,3,"#c77dff"); px(g,15,22,2,1,"#fff");
    // arms rear up for the rend on atk, ending in 3 claws each
    px(g,5+A.lax,18+(P.atk?-4:A.la),3,10,dk); px(g,24+A.rax,18+(P.atk?-4:A.ra),3,10,dk);
    px(g,4+A.lax,27+A.la,2,4,"#e8e0d0"); px(g,6+A.lax,27+A.la,2,3,"#e8e0d0"); px(g,8+A.lax,27+A.la,2,4,"#e8e0d0");
    px(g,24+A.rax,27+A.ra,2,4,"#e8e0d0"); px(g,26+A.rax,27+A.ra,2,3,"#e8e0d0"); px(g,28+A.rax,27+A.ra,2,4,"#e8e0d0");
    // face glances side to side with the stride, bobs with the march
    px(g,10+A.hx,8+hb,12,10,shade(tint,10));
    px(g,10+A.hx,8+hb,12,2,dk);
    g.fillStyle="#c77dff"; g.fillRect(12+A.hx,11+hb,3,3); g.fillRect(18+A.hx,11+hb,2,3);
    g.fillStyle="#111"; g.fillRect(13+A.hx,12+hb,1,2); g.fillRect(18+A.hx,12+hb,1,2);
    g.fillStyle="#fff"; g.fillRect(12+A.hx,11+hb,1,1);
    px(g,12+A.hx,16+hb,8,P.atk?5:3,"#2a1f3a"); // jaw drops open on atk
    px(g,13+A.hx,16+hb,2,2,"#fff"); px(g,15+A.hx,16+hb,1,3,"#fff"); px(g,18+A.hx,16+hb,2,2,"#fff"); // fangs
  };
  D.yuki_onna = (g,tint)=>{
    px(g,8,4,16,14,"#111"); px(g,10,6,12,16,"#e0f0ff");
    px(g,12,10,8,8,"#f7d7d7"); g.fillStyle="#111"; g.fillRect(13,13,2,2); g.fillRect(17,13,2,2);
    px(g,10,22,12,12,"#e0f0ff"); px(g,10,28,12,2,"#7ad9f0"); // kimono snow
  };
  D.rusalka = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const dk=shade(tint,-35), lite=shade(tint,30);
    // drowned maiden: lily crown, flowing weed hair, songbird arms, scaled tail
    const w0=P.atk?3:P.moving?[0,2,-1,1][P.f&3]:0, w1=P.atk?-3:P.moving?[0,-2,1,-1][P.f&3]:(((P.t*1.5)|0)&1?-1:1);
    px(g,9,2,14,5,"#2a8a5a");
    px(g,10,1,4,3,"#ffd93d"); px(g,15,0,3,4,"#ff9dc9"); px(g,20,1,4,3,"#ffd93d");
    px(g,11,2,2,1,"#fff"); px(g,15,1,1,2,"#fff"); px(g,21,2,2,1,"#fff");
    px(g,6+w0,4,3,14,"#1e5a34"); px(g,23+w1,4,3,14,"#1e5a34"); // weed hair drifts
    px(g,6+w0,4,3,2,"#7ac97a"); px(g,23+w1,4,3,2,"#7ac97a");
    // pale face with dark drowned eyes + parted lips (wider song on atk)
    px(g,11,8,10,9,"#d9e8d5");
    g.fillStyle="#0c1a14"; g.fillRect(13,11,2,3); g.fillRect(18,11,2,3);
    g.fillStyle="#bfe8ff"; g.fillRect(13,11,1,1); g.fillRect(18,11,1,1);
    px(g,15,14,2,2,"#7a1f2e");
    // shell necklace + scaled torso
    px(g,13,17,6,1,"#fff"); px(g,15,17,2,1,"#ffd93d");
    px(g,10,18,12,10,tint); px(g,10,18,12,2,lite);
    px(g,12,20,8,5,shade(tint,20));
    // graceful arms sway in song
    px(g,6+w0,16,3,9,"#d9e8d5"); px(g,23+w1,16,3,9,"#d9e8d5");
    px(g,6+w0,23,3,2,"#bfe8f0"); px(g,23+w1,23,3,2,"#bfe8f0");
    // split fish tail kicks with fins
    px(g,10+w0,28,5,8,dk); px(g,17+w1,28,5,8,dk);
    px(g,10+w0,28,5,2,tint); px(g,17+w1,28,5,2,tint);
    px(g,9+w0,33,6,3,"#7ad9f0"); px(g,17+w1,33,6,3,"#7ad9f0");
  };
  D.draugr = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,11+A.lx,30+A.ld,3,6,"#e8e4d8"); px(g,18+A.rx,30+A.rd,3,6,"#e8e4d8");
    px(g,9,20,14,11,"#3a3a42"); px(g,11,20,10,11,"#6a7a6a");
    for(let i=0;i<3;i++){ g.fillStyle="#1a1a1f"; g.fillRect(12,22+i*3,8,1); }
    px(g,10,8,12,10,"#e8e4d8"); px(g,12,10,8,6,"#1a3a2a");
    g.fillStyle="#7fd4ff"; g.fillRect(13,12,2,2); g.fillRect(18,12,1,2);
    px(g,24,16+(P.atk?-6:0),2,10,"#6a7a6a"); // rusted axe raised on atk
  };
  D.dullahan_herald = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const bob=window.Anim.hbob(P)+(P.hurt?2:0), sw=(window.Anim?window.Anim.seg(P,1,2):0);
    px(g,11,14,10,18,"#2a2a3a"); px(g,13,14,6,14,"#3a3a4a");
    px(g,11,12,10,3,"#ff6b9d"); px(g,13,12,6,1,"#fff"); // neck stump glow + blood
    // BIG held head bobs as it is carried + grim mouth opens on atk
    px(g,21,18+bob,10,10,"#d9c9a0"); px(g,21,18+bob,10,2,"#f2e3c2");
    px(g,22,21+bob,3,3,"#111"); px(g,27,21+bob,3,3,"#111");
    g.fillStyle="#7fd4ff"; g.fillRect(23,22+bob,1,2); g.fillRect(28,22+bob,1,2);
    g.fillStyle="#fff"; g.fillRect(23,21+bob,1,1);
    px(g,23,25+bob,6,P.atk?3:1,"#7a1f1f"); // grim mouth
    px(g,24,14+(P.atk?-6:0)+sw,2,10,"#c9ccd4"); px(g,23,14+(P.atk?-6:0)+sw,4,2,"#fff"); // sword raised, sways marching
  };
  D.mummy = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    const wrap="#c9b98a", dark="#8a7a5a", lite="#e8dcb8";
    // legs shamble + feet with wrap folds
    px(g,11+A.lx,28+A.ld,3,8,wrap); px(g,18+A.rx,28+A.rd,3,8,wrap);
    px(g,11+A.lx,28+A.ld,1,8,dark); px(g,18+A.rx,34+A.rd,3,2,dark);
    // torso: STAGGERED wrap strips + shroud fold + sash
    px(g,9,16,14,14,wrap);
    for(let i=0;i<4;i++){ const y=17+i*3, off=(i%2)*4;
      px(g,9+off, y, 10, 2, lite); px(g,9+off, y+1, 10, 1, dark);
    }
    px(g,14,16,3,14,"#a89878"); // shroud fold
    px(g,14,16,3,1,lite);
    px(g,9,24,14,2,"#7a2a2a"); px(g,15,24,2,2,"#c93b3b"); // funerary sash
    // arms wrapped at sides reach forward on atk + hands
    px(g,6+A.lax,18+A.la,3,10,wrap); px(g,23+A.rax,18+A.ra,3,10,wrap);
    px(g,6+A.lax,26+A.la,3,3,"#b8a67e"); px(g,23+A.rax,26+A.ra,3,3,"#b8a67e");
    // headcloth + glowing dead eyes + sewn mouth
    px(g,10,5,12,4,wrap); px(g,10,5,12,1,lite);
    px(g,10,8,12,9,wrap);
    px(g,10,10,12,1,lite);
    g.fillStyle="#111"; g.fillRect(12,11,3,3); g.fillRect(17,11,3,3);
    g.fillStyle="#7fd4ff"; g.fillRect(13,12,1,1); g.fillRect(18,12,1,1);
    for(let s=0;s<4;s++) px(g,13+s*2,15,1,2,dark); // sewn mouth
  };
  D.jiangshi = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    // hops with BOTH feet together — crouch, liftoff, peak, landing: every frame differs
    const hop=P.hurt?2:P.moving?[0,-4,-1,1][P.f&3]:(P.atk?-2:0);
    const tsw=P.moving?[0,1,-1,0][P.f&3]:0;
    px(g,9,2+hop,14,6,"#1a1a24"); px(g,14,0+hop,4,3,"#c93b3b");
    px(g,9,16+hop,14,16,"#2a4a6a"); px(g,13,16+hop,6,16,"#e8e8e8");
    px(g,10,8+hop,12,8,"#bfe8c9"); g.fillStyle="#111"; g.fillRect(12,11+hop,2,2); g.fillRect(18,11+hop,2,2);
    px(g,15+tsw,8+hop,2,6,"#ffd93d"); // talisman swings
    px(g,11,28+hop,4,8,"#2a4a6a"); px(g,17,28+hop,4,8,"#2a4a6a");
  };
  // INSECTS: big readable chitin + fangs/stings.
  D.giant_tarantula = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-45), lite=shade(tint,30);
    for(let s=0;s<4;s++){ const y=15+s*4+(P.moving?[0,-1,-2,-1][(s+P.f)&3]:0), xx=(P.moving?[0,1,1,-1][(s+P.f)&3]:0);
      px(g,3+xx,y,5,2,dk); px(g,24+xx,y,5,2,dk); px(g,1+xx,y+1,3,4,dk); px(g,28+xx,y+1,3,4,dk); }
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,26,9,7,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,25,8,6,0,0,7); g.fill();
    g.fillStyle=lite; g.beginPath(); g.ellipse(14,22,4,3,-0.4,0,7); g.fill();
    px(g,11,13,10,8,tint);
    g.fillStyle="#ff3b3b"; g.fillRect(13,15,3,3); g.fillRect(17,15,2,3);
    g.fillStyle="#fff"; g.fillRect(13,15,1,1); g.fillRect(17,15,1,1);
    px(g,12,21,3,P.atk?8:6,"#e8e0d0"); px(g,17,21,3,P.atk?8:6,"#e8e0d0"); // fangs extend on atk
  };
  D.tomb_scorpion = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-45), lite=shade(tint,35);
    // tail arches overhead and lashes side to side with the stride.
    const tw=(i)=>P.moving?window.Anim.seg(P,i,1):0;
    px(g,4,24,5,5,dk); px(g,6+tw(1),19,5,5,tint); px(g,9+tw(2),14,5,5,tint); px(g,13+tw(3),10,5,5,dk);
    px(g,17+tw(4),7,5,5,tint); px(g,21+tw(5),6,5,4,dk);
    px(g,23+tw(6),2,4,5,"#1a1a1a"); px(g,24+tw(6),1,2,4,"#ff3b3b");
    px(g,4,27,20,6,dk); px(g,5,28,18,4,tint);
    for(let l=0;l<3;l++) px(g,7+l*5+(P.moving?[0,1,1,-1][(l+P.f)&3]:0),33+(P.moving?[0,-1,-2,-1][(l+P.f)&3]:0),2,3,dk);
    const tHu=P.hurt?2:0;
    px(g,22,24+tHu,5,7,tint); px(g,27,22+tHu,4,5,dk); px(g,29,20+(P.atk?3:0)+tHu,3,5,tint);
    g.fillStyle="#ff3b3b"; g.fillRect(24,26,2,2); g.fillStyle="#111"; g.fillRect(24,26,1,1);
  };
  D.siege_ant = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-45);
    for(let l=0;l<3;l++){ const y=24+l*3+(P.moving?[0,-1,-2,-1][(l+P.f)&3]:0), xx=(P.moving?[0,1,1,-1][(l+P.f)&3]:0); px(g,5+xx,y,3,2,dk); px(g,24+xx,y,3,2,dk); }
    px(g,9,26,14,7,dk); px(g,10,27,12,5,tint);
    px(g,10,24,12,5,dk); px(g,11,25,10,3,tint);
    px(g,11,17,10,7,dk); px(g,12,18,8,5,tint);
    px(g,7+(P.atk?1:0),20,4,7,dk); px(g,21-(P.atk?1:0),20,4,7,dk); // mandibles snap shut on atk
    const aHu=P.hurt?1:0;
    g.fillStyle="#ff9d2e"; g.fillRect(14,19+aHu,2,2); g.fillRect(17,19+aHu,2,2);
    g.fillStyle="#111"; g.fillRect(14,19+aHu,1,2); g.fillRect(17,19+aHu,1,2);
  };
  D.hive_hornet = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    const bb=window.Anim.hbob(P);
    const dk=shade(tint,-45);
    g.save(); g.translate(15,15); g.rotate(WA); g.translate(-15,-15);
    g.fillStyle="rgba(240,230,200,0.85)"; g.beginPath(); g.moveTo(15,15); g.lineTo(2,1); g.lineTo(5,9); g.fill();
    g.restore();
    g.save(); g.translate(17,15); g.rotate(-WA); g.translate(-17,-15);
    g.fillStyle="rgba(240,230,200,0.85)"; g.beginPath(); g.moveTo(17,15); g.lineTo(30,1); g.lineTo(27,9); g.fill();
    g.restore();
    g.save(); g.translate(0,bb);
    px(g,12,21,8,11,tint);
    for(let s=0;s<3;s++) px(g,12,23+s*4,8,2,"#1a1a1a");
    px(g,11,12,10,7,tint);
    g.fillStyle="#ff3b3b"; g.fillRect(12,13,4,5); g.fillRect(18,13,3,4);
    g.fillStyle="#fff"; g.fillRect(12,13,1,1); g.fillRect(18,13,1,1);
    px(g,14,32,4,P.atk?5:3,dk); // stinger extends on atk
    g.restore();
  };
  D.scarab_swarm = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-35);
    // prime beetle wings blur while the swarm seethes
    const fl=P.atk?2:P.moving?[0,2,-1,1][P.f&3]:(P.idle?-1:0);
    const s1=P.moving?[0,2,-1,1][P.f&3]:0, s2=P.moving?[0,-2,1,-1][P.f&3]:0;
    const scHu=P.hurt?2:0;
    px(g,13,20,6,5,dk); px(g,14,17,4,4,tint); px(g,16,17,1,5,dk);
    px(g,11,18+fl,3,2,"#e8e4d8"); px(g,18,18-fl,3,2,"#e8e4d8"); // wing blur
    px(g,7+s1-scHu,12+scHu,6,4,shade(tint,20)); px(g,19+s2+scHu,11+scHu,6,4,shade(tint,20));
    g.fillStyle="#ff3b3b"; g.fillRect(15,18,1,1); g.fillRect(17,18,1,1);
    px(g,24+s2,24,4,3,dk); px(g,4+s1,26,4,3,dk);
  };
  D.khepri_beetle = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-35);
    const bob=window.Anim.hbob(P)+(P.hurt?2:0);
    // sun disc rolls: glint orbits the rim as it walks
    const ga=P.moving?[0,1,2,3][P.f&3]:(P.idle*2);
    const gx=[14,17,17,14][ga], gy=[6,6,9,9][ga];
    for(let kl=0;kl<3;kl++){ const ky=22+kl*2+(P.moving?[0,-1,-2,-1][(kl+P.f)&3]:0), kx=(P.moving?[0,1,1,-1][(kl+P.f)&3]:0);
      px(g,7+kx,ky,3,2,dk); px(g,22+kx,ky,3,2,dk); }
    px(g,10,20+bob,12,6,dk); px(g,12,16+bob,8,5,tint); px(g,16,16+bob,1,9,dk);
    g.fillStyle="#ffd93d"; g.beginPath(); g.arc(16,8+bob-(P.atk?2:0),4,0,7); g.fill(); // sun disc heaves on atk
    if (P.atk) { g.fillStyle="#fff"; g.fillRect(10,5+bob,2,1); g.fillRect(20,5+bob,2,1); g.fillRect(15,1+bob,2,1); g.fillRect(15,14+bob,2,1); } // ward flash
    px(g,gx,gy+bob-(P.atk?2:0),2+(P.atk?1:0),2,"#fff"); // rolling glint flares on atk
    px(g,14,13,4,3,"#ffd93d");
  };
  D.gloomspinner = (g,tint,ph)=>{
    // v2: gloom weaver — jointed legs, fanged chelicerae, moon abdomen mark.
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-30);
    // 4 jointed legs per side step in alternating waves
    for(let l=0;l<4;l++){ const y=17+l*4+(P.moving?[0,-1,-2,-1][(l+P.f)&3]:0), xx=(P.moving?[0,1,1,-1][(l+P.f)&3]:0);
      px(g,8+xx,y,3,2,dk); px(g,6+xx,y+1,3,3,dk); px(g,5+xx,y+3,2,3,dk);
      px(g,21+xx,y,3,2,dk); px(g,23+xx,y+1,3,3,dk); px(g,25+xx,y+3,2,3,dk);
      px(g,6+xx,y+1,3,1,shade(tint,15)); px(g,23+xx,y+1,3,1,shade(tint,15));
    }
    // abdomen with pale moon mark + spinnerets
    px(g,11,22,10,10,dk); px(g,12,23,8,8,tint);
    px(g,14,24,4,6,"#9a8ae8"); px(g,15,25,2,2,"#e0d4ff");
    px(g,14,31,2,3,"#c9c9d9"); px(g,17,31,2,3,"#c9c9d9");
    // cephalothorax + crown
    px(g,11,14,10,10,tint); px(g,11,14,10,2,shade(tint,25));
    px(g,13,11,6,4,"#1a0f24"); px(g,14,11,4,1,"#9a8ae8");
    // 4 eyes: 2 big + 2 small
    g.fillStyle="#111"; g.fillRect(12,15,4,4); g.fillRect(18,15,3,4);
    g.fillStyle="#ff3b3b"; g.fillRect(13,16,2,2); g.fillRect(18,16,2,2);
    g.fillStyle="#fff"; g.fillRect(13,16,1,1); g.fillRect(18,16,1,1);
    g.fillStyle="#ff9d9d"; g.fillRect(12,14,1,1); g.fillRect(20,14,1,1);
    // fanged chelicerae spread on atk
    px(g,12,21,3,P.atk?6:4,"#e8e0d0"); px(g,17,21,3,P.atk?6:4,"#e8e0d0");
    px(g,13,24,1,2,"#7a1f1f"); px(g,18,24,1,2,"#7a1f1f");
    // silk strand
    px(g,4,8,1,8,"#c9c9d9"); px(g,4,8,1,1,"#fff");
  };
  D.slime = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-30);
    // leans into the stride, wobbles at rest
    const lean=window.Anim.seg(P,0,1);
    g.save(); g.translate(lean,0);
    g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,28,12,9,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,26,11,8,0,0,7); g.fill();
    g.fillStyle="rgba(255,255,255,0.65)"; g.beginPath(); g.ellipse(11,21,4,3,-0.4,0,0,7); g.fill();
    g.fillStyle="#101418"; g.fillRect(11,25,3,5); g.fillRect(19,25,3,5);
    g.fillStyle="#fff"; g.fillRect(11,25,1,2); g.fillRect(19,25,1,2);
    g.fillStyle="#101418"; g.fillRect(14,30,4,2);
    g.restore();
  };
  D.slime_empress = (g,tint,ph)=>{
    // v2: regal blob — tall jeweled crown, gloss, blush, smile, bubbles.
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-30);
    const lean=window.Anim.seg(P,0,1);
    g.save(); g.translate(lean,0);
    g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,28,12,9,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,26,11,8,0,0,7); g.fill();
    // inner bubbles
    g.fillStyle="rgba(255,255,255,0.5)"; g.beginPath(); g.arc(10,28,2,0,7); g.fill();
    g.beginPath(); g.arc(22,29,1,0,7); g.fill();
    // TALL crown: band + 3 points + jewels
    px(g,11,16,10,3,"#ffd93d"); px(g,11,16,10,1,"#fff");
    px(g,11,12,3,5,"#ffd93d"); px(g,15,11,3,6,"#ffd93d"); px(g,19,12,3,5,"#ffd93d");
    px(g,11,12,3,1,"#fff"); px(g,15,11,3,1,"#fff"); px(g,19,12,3,1,"#fff");
    px(g,12,17,2,2,"#ff3b3b"); px(g,15,17,2,2,"#7a5ad0"); px(g,18,17,2,2,"#2a9ad0");
    px(g,12,17,1,1,"#fff"); px(g,15,17,1,1,"#fff"); px(g,18,17,1,1,"#fff");
    // gloss + blush + smile
    g.fillStyle="rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(9,22,4,2,-0.4,0,7); g.fill();
    px(g,8,26,3,2,"#ff9dc9"); px(g,22,26,3,2,"#ff9dc9");
    g.fillStyle="#101418"; g.fillRect(11,24,3,4); g.fillRect(19,24,3,4);
    g.fillStyle="#fff"; g.fillRect(11,24,1,1); g.fillRect(19,24,1,1);
    px(g,14,29,4,P.atk?3:1,"#7a1f2e"); // smile opens into a maw on atk
    if (P.atk) { px(g,15,29,2,2,"#fff"); }
    g.restore();
  };
  D.mushroom = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P);
    px(g,10+A.lx,30+A.ld,4,6,"#8a6a4a"); px(g,18+A.rx,30+A.rd,4,6,"#8a6a4a");
    px(g,11,22,10,12,"#f2e3c2");
    g.fillStyle="#101418"; g.fillRect(13,26,2,3); g.fillRect(17,26,2,3);
    // cap bobbles as it waddles
    const bob=window.Anim.hbob(P);
    g.save(); g.translate(0,bob);
    g.fillStyle=tint; g.fillRect(5,12,22,10); g.fillRect(6,8,20,8); g.fillRect(9,5,14,5);
    g.fillStyle="rgba(255,255,255,0.85)"; g.fillRect(9,10,4,4); g.fillRect(18,9,4,4); g.fillRect(14,15,4,4);
    g.restore();
  };
  D.bat = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    const bb=window.Anim.hbob(P);
    const dk=shade(tint,-25);
    g.save(); g.translate(15,22); g.rotate(WA); g.translate(-15,-22);
    g.fillStyle=dk; g.beginPath(); g.moveTo(15,22); g.lineTo(2,12); g.lineTo(4,18); g.lineTo(7,17); g.lineTo(9,23); g.fill();
    g.restore();
    g.save(); g.translate(17,22); g.rotate(-WA); g.translate(-17,-22);
    g.fillStyle=dk; g.beginPath(); g.moveTo(17,22); g.lineTo(30,12); g.lineTo(28,18); g.lineTo(25,17); g.lineTo(23,23); g.fill();
    g.restore();
    g.save(); g.translate(0,bb);
    px(g,12,12,2,4,"#2e2138"); px(g,18,12,2,4,"#2e2138");
    px(g,11,16,10,10,"#3a2b4f");
    g.fillStyle="#ff3b3b"; g.fillRect(13,20,2,2); g.fillRect(17,20,2,2);
    g.fillStyle="#fff"; g.fillRect(14,24,1,2); g.fillRect(17,24,1,2);
    if (P.atk) { g.fillStyle="#fff"; g.fillRect(14,26,1,2); g.fillRect(17,26,1,2); } // fangs lengthen on the strike
    g.restore();
  };
  D.gasha_skull = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const fl=P.moving?[0,2,-1,1][P.f&3]:(P.idle?1:-1);
    // the skull hovers after its prey: whole bone sways with the stride.
    const gl=P.moving?[0,1,0,-1][P.f&3]:0;
    px(g,8+gl,8,16,14,"#e8e4d8");
    g.fillStyle="#111"; g.fillRect(11+gl,12,5,6); g.fillRect(17+gl,12,5,6);
    g.fillStyle="#ff3b3b"; g.fillRect(13+gl,14,1,2); g.fillRect(19+gl,14,1,2);
    for(let i=0;i<4;i++) g.fillRect(12+i*3+gl,20,1,2);
    // soul flames lick higher while it hunts, blaze on atk
    px(g,4-fl,4-fl,4+fl*2,4+fl*2,"#ff9d2e"); px(g,24-fl,4-fl,4+fl*2,4+fl*2,"#ff9d2e");
    px(g,5-fl,5-fl,2,2,"#ffd93d"); px(g,25-fl,5-fl,2,2,"#ffd93d");
    if (P.atk) { g.fillStyle="#ff3b3b"; g.fillRect(13,14,3,3); g.fillRect(18,14,3,3); } // eyes blaze
  };
  D.nurikabe = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    // living wall SHUFFLES: whole slab lurches side to side as it closes in
    const sh=P.moving?[0,2,-1,1][P.f&3]:0, nHu=P.hurt?2:0, nAtk=P.atk?2:0;
    g.save(); g.translate(sh+nAtk,nHu);
    px(g,5,8,22,24,tint); px(g,5,8,22,3,shade(tint,25)); px(g,5,29,22,3,shade(tint,-30));
    px(g,11,13,10,7,"#e8e0d0"); g.fillStyle="#111"; g.fillRect(13,15,2,3); g.fillRect(17,15,2,3);
    px(g,3,20,2,6,"#d9c9b0"); px(g,27,20,2,6,"#d9c9b0");
    if (P.atk) { g.fillStyle="#ff3b3b"; g.fillRect(13,15,4,1); g.fillRect(17,15,2,1); } // eyes bleed red on atk
    g.restore();
  };
  D.mimic = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const open=P.hurt?-2:P.atk?3:(P.moving?[0,2,-1,1][P.f&3]:0);
    // the whole chest rocks as the lid chomps.
    const rk=P.moving?[0,1,0,-1][P.f&3]:0;
    const dk=shade(tint,-30);
    px(g,7+rk,20,18,12,dk); px(g,7+rk,16-open,18,6,tint);
    px(g,9+rk,22,14,6,"#3a0a1a"); for(let i=0;i<5;i++){ px(g,10+i*3+rk,22,1,2,"#fff"); px(g,10+i*3+rk,28,1,2,"#fff"); }
    g.fillStyle="#ffe14d"; g.fillRect(12+rk,18-open,2,2); g.fillRect(18+rk,18-open,2,2);
    g.fillStyle="#111"; g.fillRect(12+rk,18-open,1,2); g.fillRect(18+rk,18-open,1,2);
  };
  D.lesser_mimic = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const open=P.hurt?-2:P.atk?2:(P.moving?[0,2,-1,1][P.f&3]:0);
    const rk=P.moving?[0,1,0,-1][P.f&3]:0;
    px(g,9+rk,22,14,10,"#6a5a3a"); px(g,9+rk,18-open,14,5,"#a08050");
    px(g,11+rk,24,10,4,"#3a0a1a"); for(let i=0;i<4;i++){ px(g,11+i*3+rk,24,2,2,"#f2ede2"); }
    g.fillStyle="#fffbe8"; g.fillRect(14+rk,19-open,4,4); g.fillStyle="#111"; g.fillRect(15+rk,20-open,2,3);
  };
  D.greater_mimic = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const open=P.hurt?-2:P.atk?3:(P.moving?[0,3,-2,2][P.f&3]:0);
    const rk=P.moving?[0,1,0,-1][P.f&3]:0;
    const dk=shade(tint,-40);
    px(g,6+rk,20,20,12,dk); px(g,6+rk,15-open,20,7,tint);
    px(g,8+rk,22,16,7,"#0c0a12"); for(let i=0;i<6;i++){ px(g,8+i*3+rk,22,2,3,"#fff"); px(g,8+i*3+rk,26,2,3,"#fff"); }
    g.fillStyle="#ff3b3b"; g.fillRect(10+rk,17-open,4,3); g.fillRect(18+rk,17-open,4,3);
  };
  D.mimic_devourer = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const open=P.hurt?-2:P.atk?4:(P.moving?[0,3,-2,2][P.f&3]:0);
    const rk=P.moving?[0,1,0,-1][P.f&3]:0;
    const dk=shade(tint,-35);
    px(g,5+rk,20,22,12,dk); px(g,5+rk,14-open,22,8,tint);
    px(g,7+rk,22,18,8,"#0c0a12"); for(let i=0;i<7;i++){ px(g,7+i*3+rk,22,2,3,"#fff"); px(g,7+i*3+rk,27,2,3,"#fff"); }
    px(g,13+rk,25+(P.atk?2:0),6,5,"#ff6b9d");
    g.fillStyle="#ffe14d"; g.fillRect(13+rk,16-open,6,5); g.fillStyle="#111"; g.fillRect(14+rk,17-open,4,3);
  };


  // ---- BATCH 5: remaining wilds + apex ancients ----
  D.puca = (g,tint,ph)=>{
    // shadow-goblin horse: dark coat, gold eyes, sparks.
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P), hb=window.Anim.hbob(P);
    px(g,6,24,19,8,"#2a2a32"); px(g,6,24,19,2,"#4a4a5a");
    px(g,8+Q.x2,31+Q.d1,3,4,"#2a2a32"); px(g,18+Q.x2,31+Q.d2,3,4,"#2a2a32"); // hooves trot
    px(g,20,8+hb,3,8,"#e8e0d0"); px(g,24,8+hb,3,8,"#e8e0d0"); // ears pale, nodding
    px(g,22,14+hb,8,12,tint);
    g.fillStyle="#ffe14d"; g.fillRect(23,18+hb,3,3); g.fillStyle="#111"; g.fillRect(24,19+hb,1,2);
    px(g,27,21+hb+(P.atk?2:0),4,3,"#d9c9b8"); // muzzle snaps on atk
    const fl=P.moving?[0,2,1,0][P.f&3]:P.idle;
    g.fillStyle="#7ad9f0"; g.fillRect(4,12-fl,2,2); g.fillRect(28,10+fl,2,2); // wisps flicker
  };
  D.yeti = (g,tint,ph)=>{
    // v4: break the fridge — separated head/arms/legs, tapered torso.
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-50), shag=shade(tint,-20), lite="#ffffff";
    // SNOWCAP head bobs: wide brow, dark outline, snow top
    px(g,10+A.hx,4+hb,12,2,lite); px(g,9+A.hx,5+hb,14,2,shag); px(g,9+A.hx,5+hb,2,9,shag); px(g,21+A.hx,5+hb,2,9,dk);
    px(g,11+A.hx,6+hb,10,8,"#f2f7fb"); px(g,11+A.hx,6+hb,10,1,lite);
    // heavy brow shadow band + deep-set glowing eyes
    px(g,11+A.hx,8+hb,10,3,dk);
    g.fillStyle="#111"; g.fillRect(12+A.hx,9+hb,3,4); g.fillRect(17+A.hx,9+hb,3,4);
    g.fillStyle="#7fc4ff"; g.fillRect(13+A.hx,10+hb,2,2); g.fillRect(18+A.hx,10+hb,2,2);
    g.fillStyle="#fff"; g.fillRect(13+A.hx,10+hb,1,1); g.fillRect(18+A.hx,10+hb,1,1);
    // flat nose + jaw drops open with 4 fangs ON the face on atk
    px(g,13+A.hx,13+hb,6,2,"#7a9ab0"); px(g,15+A.hx,14+hb,2,1,"#4a6a80");
    px(g,12+A.hx,14+hb,8,3+(P.atk?3:0),"#3a2a34"); px(g,13+A.hx,14+hb,2,3,"#fff"); px(g,15+A.hx,14+hb,1,3,"#fff");
    px(g,17+A.hx,14+hb,2,3,"#fff"); px(g,19+A.hx,14+hb,1,2,"#fff");
    // NECK GAP so the head sits apart from the shoulders
    px(g,8+A.hx,14+hb,4,3,dk); px(g,20+A.hx,14+hb,4,3,dk); px(g,13+A.hx,14+hb,6,2,"#c9d9e4");
    // TORSO: wide shoulders tapering to a narrower waist
    px(g,7,16,18,6,tint); px(g,7,16,18,1,lite);
    px(g,7,16,2,14,shag); px(g,23,16,2,14,dk);
    px(g,9,22,14,9,tint); px(g,9,22,2,9,shag); px(g,21,22,2,9,dk);
    // shag streaks down the chest + snow-dusted mane
    px(g,10,17,2,10,lite); px(g,14,17,2,8,shade(tint,12)); px(g,18,17,2,10,lite);
    px(g,12,19,2,4,"#ffffff"); px(g,17,19,2,4,"#ffffff");
    // ARMS swing fully separated from the torso by dark gaps
    px(g,6,17,1,12,dk); px(g,24,17,1,12,dk);
    px(g,2+A.lax,17+A.la,4,12,shag); px(g,26+A.rax,17+A.ra,4,12,shag);
    px(g,2+A.lax,17+A.la,4,2,lite); px(g,26+A.rax,17+A.ra,4,2,lite);
    px(g,2+A.lax,27+A.la,4,3,lite); px(g,26+A.rax,27+A.ra,4,3,lite);
    px(g,2+A.lax,29+A.la,1,3,dk); px(g,4+A.lax,29+A.la,1,3,dk); px(g,26+A.rax,29+A.ra,1,3,dk); px(g,28+A.rax,29+A.ra,1,3,dk);
    // LEGS stomp with a crotch gap + fur cuffs + ice claws
    px(g,9+A.lx,31+A.ld,5,4,shag); px(g,18+A.rx,31+A.rd,5,4,shag);
    px(g,9+A.lx,31+A.ld,5,1,lite); px(g,18+A.rx,31+A.rd,5,1,lite);
    px(g,8+A.lx,35+A.ld,7,2,"#3a3a44"); px(g,17+A.rx,35+A.rd,7,2,"#3a3a44");
    px(g,8+A.lx,35+A.ld,2,2,lite); px(g,17+A.rx,35+A.rd,2,2,lite);
  };
  D.shiver_owl = (g,tint,ph)=>{
    // round snow owl: disc face, ear tufts, talons — wings beat, head swivels.
    const P=window.Anim.normP(ph), hb=window.Anim.hbob(P);
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    g.save(); g.translate(12,22); g.rotate(WA); g.translate(-12,-22);
    g.fillStyle=shade(tint,-20);
    g.beginPath(); g.moveTo(12,22); g.lineTo(2,10); g.lineTo(4,16); g.lineTo(7,15); g.fill();
    g.restore();
    g.save(); g.translate(20,22); g.rotate(-WA); g.translate(-20,-22);
    g.fillStyle=shade(tint,-20);
    g.beginPath(); g.moveTo(20,22); g.lineTo(30,10); g.lineTo(28,16); g.lineTo(25,15); g.fill();
    g.restore();
    px(g,10,10+hb,12,16,tint); px(g,11,11+hb,10,13,"#f2f7fb"); // facial disc nods
    g.fillStyle="#111"; g.fillRect(12,14+hb,4,4); g.fillStyle="#111"; g.fillRect(18,14+hb,2,4);
    g.fillStyle="#fff"; g.fillRect(12,14+hb,1,1); g.fillRect(18,14+hb,1,1);
    g.fillStyle="#7fd4ff"; g.fillRect(13,15+hb,2,2); g.fillRect(18,15+hb,1+(P.atk?1:0),1);
    px(g,14,20+hb,4,3+(P.atk?1:0),"#e8a020"); px(g,15,21+hb,2,1,"#7a4a10"); // beak opens on atk
    px(g,9,6+hb,3,5,"#fff"); px(g,20,6+hb,3,5,"#fff"); // ear tufts + snow ride along
    px(g,11,28,3,4,"#e8a020"); px(g,18,28,3,4,"#e8a020");
  };
  D.frostwyrm = (g,tint)=>{
    // v2: glacier serpent — finned coils, fanged jaw, great cyan eye.
    const dk=shade(tint,-55), mid=shade(tint,-25);
    // long coiled body with snow top + ice fins
    px(g,2,29,26,5,dk); px(g,2,29,26,1,"#fff");
    px(g,4,27,22,3,mid); px(g,4,27,22,1,"#fff");
    for(let i=0;i<4;i++){ px(g,6+i*5,22,3,6,"#d8f1ff"); px(g,6+i*5,22,3,1,"#fff"); }
    px(g,1,26,4,4,"#d8f1ff"); px(g,1,26,4,1,"#fff"); // tail fin
    px(g,26,24,4,4,mid); // rear flipper
    // rising neck with throat plates
    px(g,22,12,6,14,tint); px(g,22,12,2,14,mid); px(g,26,12,2,14,dk);
    px(g,23,15,3,8,"#eef7ff"); px(g,23,18,3,1,mid);
    // head: snowy crown, OPEN FANGED JAW
    px(g,19,7,11,7,tint); px(g,19,7,11,2,"#fff"); px(g,19,7,2,7,mid);
    px(g,25,12,5,2,mid); px(g,27,13,2,2,dk);
    px(g,24,13,7,3,"#0a2030");
    px(g,24,13,1,3,"#fff"); px(g,27,13,1,3,"#fff"); px(g,30,13,1,3,"#fff");
    px(g,24,15,7,1,"#5ff2ff");
    px(g,24,11,7,1,"#0a2030");
    // GREAT cyan eye with brow + ice horns
    px(g,16,3,4,4,"#d8f1ff"); px(g,16,3,4,1,"#fff");
    px(g,22,2,4,4,"#d8f1ff"); px(g,22,2,4,1,"#fff");
    g.fillStyle="#0a2030"; g.fillRect(20,8,7,6);
    g.fillStyle="#5ff2ff"; g.fillRect(21,9,5,4); g.fillStyle="#0a2030"; g.fillRect(22,10,3,3);
    g.fillStyle="#fff"; g.fillRect(22,9,2,2);
    px(g,19,7,8,1,dk); // brow ridge
  };
  D.mire_hydra = (g,tint,ph)=>{
    // v2: bog broodmother — mound body, 3 SEPARATED necks, jawed heads, reeds.
    const P=window.Anim.normP(ph);
    const s0=window.Anim.seg(P,0,1), s1=window.Anim.seg(P,1,1), s2=window.Anim.seg(P,2,1);
    const dk=shade(tint,-45), lite=shade(tint,35);
    // bog mound with reeds + eggs
    px(g,4,30,24,5,"#2a3a22"); px(g,6,29,20,3,"#3a5a30");
    px(g,8,27,3,3,"#e8e0d0"); px(g,17,27,4,3,"#e8e0d0");
    px(g,2,26,2,6,"#3a6a2a"); px(g,28,25,2,7,"#3a6a2a"); px(g,2,26,2,1,"#7ac97a");
    // 3 necks with GAPS between (dark separators)
    px(g,4,14,6,16,tint); px(g,4,14,2,16,dk); px(g,4,14,6,1,lite);
    px(g,13,11,6,19,tint); px(g,13,11,2,19,dk); px(g,13,11,6,1,lite);
    px(g,22,14,6,16,tint); px(g,22,14,6,1,lite); px(g,26,14,2,16,dk);
    px(g,10,16,3,14,"#0c1410"); px(g,19,14,3,16,"#0c1410"); // gaps
    // belly scales on necks
    px(g,6,20,3,8,"#a8c98a"); px(g,15,18,3,9,"#a8c98a"); px(g,24,20,3,8,"#a8c98a");
    // heads sway out of phase: brow, eyes, JAWS snapping on atk
    // left head
    px(g,2+s0,7,10,8,tint); px(g,2+s0,7,10,1,lite); px(g,2+s0,7,2,8,dk);
    g.fillStyle="#ffe14d"; g.fillRect(4+s0,9,3,3); g.fillStyle="#111"; g.fillRect(5+s0,10,2,2);
    g.fillStyle="#fff"; g.fillRect(4+s0,9,1,1);
    px(g,3+s0,13,8,3+(P.atk?2:0),"#0c1410"); px(g,4+s0,13,1,3,"#fff"); px(g,7+s0,13,1,3,"#fff"); px(g,10+s0,13,1,3,"#fff");
    px(g,4+s0,11,1,2,"#111");
    // alpha center head (bigger, horned)
    px(g,11+s1,3,10,9,tint); px(g,11+s1,3,10,1,"#fff"); px(g,11+s1,3,2,9,dk);
    px(g,11+s1,1,3,3,"#a8c98a"); px(g,17+s1,1,3,3,"#a8c98a"); // bog horns
    g.fillStyle="#ffe14d"; g.fillRect(13+s1,5,3,4); g.fillStyle="#111"; g.fillRect(14+s1,6,2,3);
    g.fillStyle="#fff"; g.fillRect(13+s1,5,1,1);
    px(g,12+s1,10,8,3+(P.atk?2:0),"#0c1410"); px(g,13+s1,10,1,3,"#fff"); px(g,16+s1,10,1,3,"#fff"); px(g,19+s1,10,1,3,"#fff");
    px(g,13+s1,9,1,2,"#111"); px(g,18+s1,9,1,2,"#111");
    // right head
    px(g,20+s2,7,10,8,tint); px(g,20+s2,7,10,1,lite); px(g,28+s2,7,2,8,dk);
    g.fillStyle="#ffe14d"; g.fillRect(24+s2,9,3,3); g.fillStyle="#111"; g.fillRect(25+s2,10,2,2);
    g.fillStyle="#fff"; g.fillRect(24+s2,9,1,1);
    px(g,21+s2,13,8,3+(P.atk?2:0),"#0c1410"); px(g,22+s2,13,1,3,"#fff"); px(g,25+s2,13,1,3,"#fff"); px(g,28+s2,13,1,3,"#fff");
    px(g,27+s2,11,1,2,"#111");
  };
  D.prism_colossus = (g,tint,ph)=>{
    // v2: living geode — faceted torso, glowing core, pylon shoulders, shard claws.
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-50), mid=shade(tint,-20);
    // pillar legs stomp with cracks
    px(g,8+A.lx,28+A.ld,6,7,dk); px(g,18+A.rx,28+A.rd,6,7,dk);
    px(g,8+A.lx,28+A.ld,6,1,mid); px(g,18+A.rx,28+A.rd,6,1,mid);
    px(g,10+A.lx,30+A.ld,1,4,mid); px(g,20+A.rx,30+A.rd,1,4,mid);
    // faceted torso: alternating light/dark crystal faces
    px(g,7,16,18,13,mid);
    px(g,7,16,6,13,tint); px(g,13,16,6,13,mid); px(g,19,16,6,13,shade(tint,15));
    px(g,7,16,18,1,"#fff"); px(g,10,18,2,9,"#fff"); px(g,20,18,2,9,dk);
    px(g,14,18,4,6,"#8a6a1a"); px(g,12,20,8,8,"#e8c93a"); px(g,13,21,6,6,"#7ff2ff");
    px(g,14,22,4,4,"#0a2a3a"); px(g,15,23,2,2,"#fff");
    // pylon shoulders + floating shards
    px(g,1,12,7,6,tint); px(g,1,12,7,1,"#fff"); px(g,1,12,2,6,dk);
    px(g,24,12,7,6,tint); px(g,24,12,7,1,"#fff"); px(g,29,12,2,6,dk);
    px(g,2,8,3,4,"#7ff2ff"); px(g,27,8,3,4,"#7ff2ff");
    // shard-claw arms swing (raised on atk)
    px(g,2+A.lax,18+A.la-(P.atk?3:0),5,11,dk); px(g,25+A.rax,18+A.ra-(P.atk?3:0),5,11,dk);
    px(g,2+A.lax,18+A.la-(P.atk?3:0),5,1,mid); px(g,25+A.rax,18+A.ra-(P.atk?3:0),5,1,mid);
    px(g,1+A.lax,28+A.la-(P.atk?3:0),4,3,"#7ff2ff"); px(g,4+A.lax,28+A.la-(P.atk?3:0),2,3,dk); px(g,27+A.rax,28+A.ra-(P.atk?3:0),4,3,"#7ff2ff"); px(g,27+A.rax,28+A.ra-(P.atk?3:0),2,3,dk);
    // head nods: visor + floating crown shard bobs higher on atk
    px(g,11+A.hx,8+hb,10,8,mid); px(g,11+A.hx,8+hb,10,1,tint);
    px(g,11+A.hx,8+hb,2,8,dk); px(g,19+A.hx,8+hb,2,8,dk);
    px(g,12+A.hx,11+hb,8,3,"#7ff2ff"); px(g,13+A.hx,11+hb,6,1,"#fff");
    g.fillStyle="#0a2a3a"; g.fillRect(14+A.hx,11+hb,2,3); g.fillRect(17+A.hx,11+hb,1,3);
    px(g,14+A.hx,2+hb-(P.atk?2:0),4,6,tint); px(g,14+A.hx,2+hb-(P.atk?2:0),4,1,"#fff"); px(g,15+A.hx,4+hb-(P.atk?2:0),2,4,"#7ff2ff");
  };
  D.umbral_wyrm = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), Q=window.Anim.quad(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,15);
    // vast void wings beat with star lights
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(P):0);
    g.save(); g.translate(11,24); g.rotate(WA); g.translate(-11,-24);
    g.fillStyle="#3a2a6a";
    g.beginPath(); g.moveTo(11,24); g.lineTo(0,2); g.lineTo(2,10); g.lineTo(5,9); g.lineTo(8,17); g.fill();
    px(g,1,4,2,6,"#7a5ad0");
    px(g,3,6,1,2,"#fff"); px(g,5,12,1,1,"#e0cfff");
    px(g,0,2,3,2,"#e8e0d0"); // wing claw
    g.restore();
    g.save(); g.translate(21,24); g.rotate(-WA); g.translate(-21,-24);
    g.fillStyle="#3a2a6a";
    g.beginPath(); g.moveTo(21,24); g.lineTo(32,2); g.lineTo(30,10); g.lineTo(27,9); g.lineTo(24,17); g.fill();
    px(g,29,4,2,6,"#7a5ad0");
    px(g,28,8,1,2,"#fff");
    px(g,29,2,3,2,"#e8e0d0"); // wing claw
    g.restore();
    // starfield body + tail
    px(g,7,28,18,5,dk); px(g,7,28,18,1,"#7a5ad0");
    px(g,9,29,3,2,"#b09aff"); px(g,14,29,3,2,"#b09aff"); px(g,19,29,2,2,"#e0cfff");
    px(g,10,29,1,1,"#fff"); px(g,20,29,1,1,"#fff");
    px(g,20,14,6,15,dk); px(g,20,14,6,1,"#7a5ad0"); px(g,24,14,2,15,"#0c0618");
    px(g,21,18,1,2,"#e0cfff"); px(g,23,22,1,2,"#b09aff"); // body stars
    // crowned head bobs: big void eye + jaw drops on atk
    px(g,17,7+hb,11,7,dk); px(g,17,7+hb,11,1,"#7a5ad0");
    px(g,13,4+hb,4,3,"#e8e0d0"); px(g,24,3+hb,4,3,"#e8e0d0");
    px(g,14,4+hb,2,1,"#fff"); px(g,25,3+hb,2,1,"#fff");
    g.fillStyle="#0c0618"; g.fillRect(19,9+hb,5,4);
    g.fillStyle="#e0cfff"; g.fillRect(20,10+hb,3,2); g.fillStyle="#0c0618"; g.fillRect(21,10+hb,2,2);
    g.fillStyle="#fff"; g.fillRect(20,10+hb,1,1);
    px(g,19,13+hb+(P.atk?2:0),7,2,"#0c0618");
    px(g,20,13+hb+(P.atk?2:0),1,3,"#e8e0d0"); px(g,24,13+hb+(P.atk?2:0),1,3,"#e8e0d0"); // fangs lengthen
  };


  // ---- BATCH 6: boss touch-ups (rated 6.5-7.5 -> 9) ----
  // LEVIATHAN v2: bigger whale bulk, coral crown prominent, harpoon scars.
  D.leviathan = (g,tint)=>{
    const dk=shade(tint,-40), lite=shade(tint,30);
    px(g,2,26,28,8,dk); px(g,4,24,24,6,tint); px(g,4,24,24,2,lite);
    px(g,6,28,5,2,"#e8e0d0"); px(g,13,28,5,2,"#c9c9c9"); px(g,20,28,5,2,"#e8e0d0");
    px(g,17,12,11,11,tint); px(g,18,13,9,3,lite);
    px(g,19,17,9,5,"#0c1a24");
    px(g,20,18,7,3,"#e8e0d0"); for(let i=0;i<4;i++) px(g,21+i*2,18,1,3,"#7a8a9a");
    g.fillStyle="#ffe14d"; g.fillRect(20,14,2,3); g.fillRect(25,14,2,3); g.fillStyle="#111"; g.fillRect(20,14,1,2); g.fillRect(25,14,1,2);
    g.fillStyle="#fff"; g.fillRect(20,14,1,1);
    // coral crown bigger
    px(g,18,6,3,7,"#ff8a7a"); px(g,21,5,4,8,"#ff6b5a"); px(g,25,6,3,7,"#ffb0a0");
    px(g,19,6,2,1,"#fff"); px(g,22,5,2,1,"#fff");
    // fin + harpoons
    g.fillStyle=lite; g.beginPath(); g.moveTo(11,22); g.lineTo(3,10); g.lineTo(8,22); g.fill();
    px(g,5,18,7,2,"#5a3a22"); px(g,6,16,5,2,"#8a5a33");
    px(g,24,2,2,10,"#bfe8ff"); px(g,24,2,2,1,"#fff"); // spout strong
  };
  // FENRIR ALPHA v2: larger dread wolf, Gleipnir chain bright, lava maw.
  D.fenrir_alpha = (g,tint)=>{
    const dk=shade(tint,-30), rim=shade(tint,45);
    // tail + body with void-blue rim light (never a black box)
    px(g,0,20,5,4,dk); px(g,0,20,5,1,rim);
    px(g,6,24,19,8,tint); px(g,6,24,19,2,rim); px(g,6,24,2,8,rim);
    px(g,7,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,7,31,3,1,"#9adcff"); px(g,22,31,3,1,"#9adcff"); // frost claws
    // tall dread ears + ruff
    px(g,22,10,3,7,"#111"); px(g,27,10,3,7,"#111");
    px(g,22,10,3,2,rim); px(g,27,10,3,2,rim);
    px(g,20,15,3,11,rim);
    // massive head with rim + open lava maw full of teeth
    px(g,21,15,11,11,tint); px(g,21,15,11,2,rim);
    px(g,27,21,6,5,"#3a0f08");
    px(g,27,21,6,1,"#ff7b2e"); px(g,28,23,4,2,"#ffd93d"); px(g,29,22,2,3,"#fff");
    g.fillStyle="#fff"; g.fillRect(28,21,2,2); g.fillRect(31,21,1,2);
    px(g,27,25,6,1,"#ff7b2e");
    g.fillStyle="#ff3b3b"; g.fillRect(24,19,3,3); g.fillStyle="#111"; g.fillRect(24,19,2,2);
    g.fillStyle="#fff"; g.fillRect(24,19,1,1);
    // Gleipnir bright + runes
    px(g,6,26,20,2,"#9adcff"); px(g,8,26,2,2,"#2a6a9a"); px(g,14,26,2,2,"#2a6a9a"); px(g,20,26,2,2,"#fff");
  };
  // KITSUNE NINETAILS v2: 9-tail fan visible.
  D.kitsune_ninetails = (g,tint,ph)=>{
    const P=window.Anim.normP(ph);
    const dk=shade(tint,-35), lite=shade(tint,25);
    // 9-tail fan sways as the fox walks, drifts at rest
    const tw=window.Anim.seg(P,0,1);
    g.save(); g.translate(tw,0);
    // 9-tail fan: SEPARATED tails with dark gaps + white tips (not a slab)
    for(let i=0;i<5;i++){ const x=0+i*3;
      px(g,x,17,4,10,tint); px(g,x,17,4,2,lite);
      px(g,x+1,17,2,6,lite); px(g,x,25,4,2,"#fff");
      if(i<4) px(g,x+4,19,1,7,dk);
    }
    for(let i=0;i<4;i++){ const x=17+i*3;
      px(g,x,17,4,10,"#f08a2a"); px(g,x,17,4,2,"#ffb35a");
      px(g,x+1,17,2,6,"#fff"); px(g,x,25,4,2,"#fff");
      if(i<3) px(g,x+4,19,1,7,dk);
    }
    g.restore();
    // white chest bib + body
    px(g,9,24,14,8,"#f2ede2"); px(g,9,24,14,2,"#c93b3b");
    px(g,6,26,19,6,tint); px(g,6,26,19,2,lite);
    // fox head: mask, ears, muzzle
    px(g,22,16,8,10,tint); px(g,23,17,6,3,"#fff");
    px(g,22,10,3,6,tint); px(g,27,10,3,6,tint);
    px(g,23,11,1,4,"#fff"); px(g,28,11,1,4,"#fff");
    px(g,23,16,6,8,"#f7f0e0");
    px(g,27,21,4,3,"#e8d9c0"); px(g,30,22,2,2,"#7a4a2a");
    g.fillStyle="#c93b3b"; g.fillRect(24,18,4,1);
    g.fillStyle="#111"; g.fillRect(24,19,2,2); g.fillRect(27,19,1,1);
    g.fillStyle="#fff"; g.fillRect(24,19,1,1);
    // foxfire orbs with trails
    px(g,2,8,3,3,"#7fd4ff"); px(g,27,6,3,3,"#7fd4ff");
    g.fillStyle="#fff"; g.fillRect(3,8,1,1); g.fillRect(28,6,1,1);
    px(g,2,11,1,3,"#7fd4ff"); px(g,29,9,1,3,"#7fd4ff");
  };

  // ---- BATCH 7: winged v3 — broad feathered wings, readable heads ----
  // Shared broad-wing helper: dark outline sail, mid fill, 2 covert rows,
  // 5 pale-tipped primaries on the outer edge, bright leading edge. dir -1 left.
  function wingBroad(g, dir, C) {
    // wings FLAP: the whole sail rotates about the shoulder (power
    // downstroke to spread glide-up), so the wing is a different shape
    // every frame instead of a rigid bar sliding up and down.
    const WP=(window.Anim?window.Anim.normP(curP):{f:0,moving:false,hurt:false,atk:false,idle:0,t:0});
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(WP):0);
    g.save();
    if (dir < 0) { g.translate(14,23); g.rotate(WA); g.translate(-14,-23); }
    else { g.translate(18,23); g.rotate(-WA); g.translate(-18,-23); }
    const M = (x, w) => dir < 0 ? x : 32 - x - w;
    const P = (x, y, w, h, c) => px(g, M(x, w), y, w, h, c);
    g.fillStyle = C.edge;
    g.beginPath();
    if (dir < 0) { g.moveTo(14, 23); g.lineTo(1, 3); g.lineTo(0, 8); g.lineTo(0, 22); g.lineTo(6, 24); g.fill(); }
    else { g.moveTo(18, 23); g.lineTo(31, 3); g.lineTo(32, 8); g.lineTo(32, 22); g.lineTo(26, 24); g.fill(); }
    g.fillStyle = C.mid;
    g.beginPath();
    if (dir < 0) { g.moveTo(13, 22); g.lineTo(3, 5); g.lineTo(2, 10); g.lineTo(2, 20); g.lineTo(7, 22); g.fill(); }
    else { g.moveTo(19, 22); g.lineTo(29, 5); g.lineTo(30, 10); g.lineTo(30, 20); g.lineTo(25, 22); g.fill(); }
    for (let r = 0; r < 2; r++) {
      const y = 13 + r * 4;
      for (let i = 0; i < 3; i++) P(4 + i * 3, y, 4, 3, r ? C.covert2 : C.covert1);
      P(4, y, 11, 1, C.hi);
    }
    const tops = [4, 6, 9, 12, 15];
    for (let i = 0; i < 5; i++) {
      const x = 1 + i * 2, y0 = tops[i], len = 22 - y0 - (i === 4 ? 2 : 0);
      P(x, y0, 2, 2, C.tip);
      P(x, y0 + 2, 2, len, C.prim);
      P(x, y0 + 2 + len - 3, 2, 3, C.shade);
    }
    P(11, 18, 3, 2, C.hi); P(8, 13, 3, 2, C.hi); P(5, 8, 3, 2, C.hi); P(3, 5, 2, 2, C.tip);
    P(6, 12, 1, 8, C.edge); P(9, 15, 1, 6, C.edge);
    g.restore();
  }
  // Shared membrane-wing helper for drakes: dark outline, translucent-bright
  // panels between 3 finger spars, clawed tip. dir -1 left.
  function wingMemb(g, dir, C) {
    // membrane sails flap about the shoulder: spread downstroke, folded
    // recovery — a different silhouette every frame.
    const WP=(window.Anim?window.Anim.normP(curP):{f:0,moving:false,hurt:false,atk:false,idle:0,t:0});
    const WA=(window.Anim&&window.Anim.flap?window.Anim.flap(WP):0);
    g.save();
    if (dir < 0) { g.translate(14,23); g.rotate(WA); g.translate(-14,-23); }
    else { g.translate(18,23); g.rotate(-WA); g.translate(-18,-23); }
    const M = (x, w) => dir < 0 ? x : 32 - x - w;
    const P = (x, y, w, h, c) => px(g, M(x, w), y, w, h, c);
    g.fillStyle = C.edge;
    g.beginPath();
    if (dir < 0) { g.moveTo(14, 23); g.lineTo(0, 2); g.lineTo(1, 10); g.lineTo(4, 9); g.lineTo(5, 17); g.lineTo(9, 16); g.lineTo(11, 23); g.fill(); }
    else { g.moveTo(18, 23); g.lineTo(32, 2); g.lineTo(31, 10); g.lineTo(28, 9); g.lineTo(27, 17); g.lineTo(23, 16); g.lineTo(21, 23); g.fill(); }
    // membrane panels between spars
    P(2, 5, 3, 8, C.panel); P(6, 8, 3, 8, C.panel2); P(10, 12, 3, 8, C.panel);
    P(2, 5, 3, 1, C.hi); P(6, 8, 3, 1, C.hi); P(10, 12, 3, 1, C.hi);
    // finger spars + knuckle claws
    P(5, 6, 1, 11, C.edge); P(9, 10, 1, 9, C.edge); P(12, 14, 1, 7, C.edge);
    P(0, 2, 3, 2, C.claw); P(1, 2, 1, 1, C.hi);
    g.restore();
  }

  // HARPY v3: songbird predator — broad wings, feathered arms, talons, hair.
  D.harpy = (g, tint, ph) => {
    const P = window.Anim.normP(ph), A = window.Anim.limb(P), hb = window.Anim.hbob(P);
    const dk = shade(tint, -45), feather = shade(tint, 15), lite = shade(tint, 35);
    const C = { edge: dk, mid: tint, covert1: feather, covert2: lite, prim: feather, tip: "#f2ede2", shade: dk, hi: lite };
    wingBroad(g, -1, C); wingBroad(g, 1, C);
    // scaly legs march + 3-toe talons
    px(g, 11+A.lx, 29 + A.ld, 3, 6, "#d9a06b"); px(g, 18+A.rx, 29 + A.rd, 3, 6, "#d9a06b");
    px(g, 11+A.lx, 31 + A.ld, 1, 3, "#8a5a33"); px(g, 19+A.rx, 31 + A.rd, 1, 3, "#8a5a33");
    px(g, 10+A.lx, 34 + A.ld, 5, 2, "#3a2a1a"); px(g, 17+A.rx, 34 + A.rd, 5, 2, "#3a2a1a");
    px(g, 9+A.lx, 34 + A.ld, 2, 2, "#3a2a1a"); px(g, 13+A.lx, 34 + A.ld, 2, 2, "#3a2a1a"); px(g, 18+A.rx, 34 + A.rd, 2, 2, "#3a2a1a"); px(g, 21+A.rx, 34 + A.rd, 2, 2, "#3a2a1a");
    // feather skirt with V notches + waistband
    px(g, 10, 24, 12, 6, tint); px(g, 10, 24, 12, 1, lite);
    for (let i = 0; i < 4; i++) { px(g, 10 + i * 3, 27, 2, 3, dk); px(g, 10 + i * 3, 27, 1, 1, lite); }
    px(g, 10, 24, 12, 1, "#c9a227");
    // woman torso (skin) with feather top
    px(g, 11, 16, 10, 9, "#e8b98a");
    px(g, 11, 19, 10, 3, tint); px(g, 12, 20, 8, 2, lite);
    px(g, 12, 17, 3, 2, "#d9a06b"); px(g, 17, 17, 3, 2, "#d9a06b");
    // feathered arms counter-swing + clawed hands (flung wide when hurt)
    px(g, 7+A.lax, 18 + A.la, 3, 7, feather); px(g, 22+A.rax, 18 + A.ra, 3, 7, feather);
    px(g, 7+A.lax, 18 + A.la, 3, 1, lite); px(g, 22+A.rax, 18 + A.ra, 3, 1, lite);
    px(g, 7+A.lax, 24 + A.la, 3, 2, "#e8c9a0"); px(g, 22+A.rax, 24 + A.ra, 3, 2, "#e8c9a0");
    px(g, 7+A.lax, 25 + A.la, 1, 2, "#3a2a1a"); px(g, 23+A.rax, 25 + A.ra, 1, 2, "#3a2a1a");
    // head bobs as she flies: face, long dark hair with sheen + braid
    px(g, 11+A.hx, 7 + hb, 10, 9, "#f2c9a0");
    px(g, 8+A.hx, 5 + hb, 4, 14, "#3a2a1a"); px(g, 20+A.hx, 5 + hb, 4, 14, "#3a2a1a");
    px(g, 9+A.hx, 4 + hb, 14, 4, "#3a2a1a"); px(g, 10+A.hx, 4 + hb, 12, 1, "#5a3a22");
    px(g, 12+A.hx, 7 + hb, 8, 1, "#5a3a22");
    px(g, 9+A.hx, 6 + hb, 2, 10, "#6a4a2e"); px(g, 21+A.hx, 6 + hb, 2, 10, "#6a4a2e"); // hair sheen
    px(g, 11+A.hx, 9 + hb, 4, 2, "#fff"); px(g, 17+A.hx, 9 + hb, 4, 2, "#fff");
    g.fillStyle = "#111"; g.fillRect(13+A.hx, 10 + hb, 2, 2); g.fillRect(19+A.hx, 10 + hb, 2, 2);
    g.fillStyle = "#fff"; g.fillRect(13+A.hx, 10 + hb, 1, 1); g.fillRect(19+A.hx, 10 + hb, 1, 1);
    px(g, 11+A.hx, 9 + hb, 1, 2, "#111"); px(g, 21+A.hx, 9 + hb, 1, 2, "#111");
    px(g, 15+A.hx, 12 + hb, 2, 2, "#c98a5a");
    px(g, 14+A.hx, 14 + hb, 4, 1, "#a02040"); // song mouth
    px(g, 8+A.hx, 14 + hb, 2, 3, lite); px(g, 22+A.hx, 14 + hb, 2, 3, lite); // feather earrings
  };

  // PHOENIX v3: living flame — ember body, crest, hooked beak, ribbon tail.
  D.phoenix = (g, tint, ph) => {
    const P = window.Anim.normP(ph), A = window.Anim.limb(P), hb = window.Anim.hbob(P);
    const deep = "#5a1408", mid = "#ff5a1e", lite = "#ffd93d", pale = "#fff2b0";
    const C = { edge: deep, mid: "#c22e1f", covert1: mid, covert2: lite, prim: mid, tip: pale, shade: deep, hi: lite };
    wingBroad(g, -1, C); wingBroad(g, 1, C);
    // ribbon tail plumes with pale cores
    px(g, 10, 29, 3, 7, mid); px(g, 10, 29, 1, 7, deep);
    px(g, 11, 29, 1, 5, pale);
    px(g, 15, 30, 3, 6, lite); px(g, 16, 30, 1, 6, pale);
    px(g, 19, 29, 3, 7, mid); px(g, 21, 29, 1, 7, deep);
    px(g, 20, 29, 1, 5, pale);
    // ember flecks rising
    px(g, 6, 26, 2, 2, lite); px(g, 24, 25, 2, 2, mid); px(g, 8, 22, 1, 2, pale);
    // talons stamp as it lands: scaly orange + dark claws
    px(g, 12+A.lx, 28 + A.ld, 2, 4, "#e8a020"); px(g, 18+A.rx, 28 + A.rd, 2, 4, "#e8a020");
    px(g, 12+A.lx, 30 + A.ld, 1, 2, "#e8a020");
    px(g, 11+A.lx, 31 + A.ld, 4, 1, "#3a2a1a"); px(g, 18+A.rx, 31 + A.rd, 4, 1, "#3a2a1a");
    px(g, 11+A.lx, 32 + A.ld, 1, 2, "#3a2a1a"); px(g, 14+A.lx, 32 + A.ld, 1, 2, "#3a2a1a"); px(g, 18+A.rx, 32 + A.rd, 1, 2, "#3a2a1a"); px(g, 21+A.rx, 32 + A.rd, 1, 2, "#3a2a1a");
    // body: ember breast glowing core
    px(g, 11, 17, 10, 12, "#c22e1f");
    px(g, 12, 18, 8, 10, mid); px(g, 13, 19, 6, 8, lite); px(g, 14, 20, 4, 5, pale);
    px(g, 11, 17, 2, 12, deep); px(g, 19, 17, 2, 12, deep);
    // wing shoulders muscled
    px(g, 9, 19, 3, 5, "#c22e1f"); px(g, 20, 19, 3, 5, "#c22e1f");
    // head bobs on the neck: crested firebird, hooked gold beak, blazing eyes
    px(g, 11+A.hx, 8 + hb, 10, 10, mid);
    px(g, 12+A.hx, 9 + hb, 8, 6, lite); px(g, 13+A.hx, 10 + hb, 6, 3, pale);
    px(g, 13+A.hx, 2 + hb, 2, 7, lite); px(g, 15+A.hx, 0 + hb, 2, 9, mid); px(g, 17+A.hx, 2 + hb, 2, 7, lite);
    px(g, 15+A.hx, 0 + hb, 2, 2, pale); px(g, 13+A.hx, 4 + hb, 2, 2, pale); px(g, 17+A.hx, 4 + hb, 2, 2, pale);
    px(g, 14+A.hx, 13 + hb, 4, 3 + (P.atk ? 2 : 0), "#e8a020"); px(g, 15+A.hx, 15 + hb, 2, 2, "#7a4a10");
    g.fillStyle = "#fff"; g.fillRect(12+A.hx, 11 + hb, 3, 3); g.fillRect(18+A.hx, 11 + hb, 2, 2);
    g.fillStyle = "#111"; g.fillRect(13+A.hx, 12 + hb, 2, 2); g.fillRect(18+A.hx, 12 + hb, 1, 1);
  };

  // LESSER WYVERN v3: small drake — membrane wings, horned head, barbed tail.
  D.lesser_wyvern = (g, tint, ph) => {
    const P = window.Anim.normP(ph), Q = window.Anim.quad(P), hb = window.Anim.hbob(P);
    const dk = shade(tint, -45), lite = shade(tint, 35);
    const C = { edge: dk, panel: lite, panel2: shade(tint, 15), hi: "#ffffff", claw: "#e8e0d0" };
    wingMemb(g, -1, C); wingMemb(g, 1, C);
    // barbed tail curling west lashes as it scuttles
    const sw = window.Anim.seg(P, 0, 1);
    px(g, 4, 28 + sw, 10, 3, tint); px(g, 4, 28 + sw, 10, 1, lite);
    px(g, 2, 26 + sw, 4, 4, tint); px(g, 1, 24 + sw, 3, 3, dk);
    px(g, 1, 24 + sw, 2, 1, "#e8e0d0"); px(g, 0, 26 + sw, 2, 2, dk); // barb
    // hind legs scuttle in diagonal pairs, clawed feet ride along
    px(g, 10+Q.x2, 28 + Q.d1, 3, 6, dk); px(g, 19+Q.x2, 28 + Q.d2, 3, 6, dk);
    px(g, 9+Q.x2, 33 + Q.d1, 4, 2, dk); px(g, 19+Q.x2, 33 + Q.d2, 4, 2, dk);
    px(g, 9+Q.x2, 33 + Q.d1, 1, 2, "#e8e0d0"); px(g, 22+Q.x2, 33 + Q.d2, 1, 2, "#e8e0d0");
    // body + pale belly scales
    px(g, 10, 20, 12, 9, tint); px(g, 10, 20, 12, 2, lite);
    px(g, 12, 24, 8, 4, "#e8d9b8");
    px(g, 13, 25, 2, 2, "#c9b896"); px(g, 17, 25, 2, 2, "#c9b896");
    px(g, 12, 26, 2, 1, "#c9b896"); px(g, 18, 26, 2, 1, "#c9b896");
    // dorsal nubs
    px(g, 12, 18, 2, 2, dk); px(g, 16, 18, 2, 2, dk); px(g, 20, 18, 2, 2, dk);
    // long neck bobs + horned head, snout with nostril, jaw snaps on atk
    px(g, 18, 12 + hb, 6, 10, tint); px(g, 19, 13 + hb, 4, 7, lite);
    px(g, 19, 18 + hb, 5, 3, "#e8d9b8");
    px(g, 18, 10 + hb, 7, 4, tint); px(g, 18, 10 + hb, 7, 1, lite);
    px(g, 22, 14 + hb, 4, 3, tint); px(g, 24, 15 + hb, 1, 1, "#111");
    px(g, 19, 18 + hb, 6, 1, dk);
    px(g, 20, 18 + hb, 1, 2 + (P.atk ? 2 : 0), "#fff"); px(g, 23, 18 + hb, 1, 2 + (P.atk ? 2 : 0), "#fff");
    g.fillStyle = "#ffe14d"; g.fillRect(20, 12 + hb, 3, 3); g.fillStyle = "#111"; g.fillRect(21, 13 + hb, 1, 2);
    g.fillStyle = "#fff"; g.fillRect(20, 12 + hb, 1, 1);
    px(g, 18, 8 + hb, 2, 3, dk); px(g, 22, 8 + hb, 2, 3, dk); // horn nubs
  };

  // WYVERN MATRIARCH v3 (overrides bosses.js): grounded brooder — torn sails,
  // horned crown, egg mound, scarred jaw.
  D.wyvern_matriarch = (g, tint) => {
    const dk = shade(tint, -35), lite = shade(tint, 25);
    // egg mound she guards
    px(g, 4, 30, 24, 5, "#5a4028"); px(g, 5, 29, 22, 3, "#6b4c30");
    px(g, 9, 26, 4, 4, "#e8e0d0"); px(g, 15, 26, 3, 3, "#f2d0a0"); px(g, 20, 26, 4, 4, "#e8e0d0");
    px(g, 10, 26, 2, 1, lite); px(g, 21, 26, 2, 1, lite);
    // bulky coiled body over eggs
    px(g, 6, 22, 20, 6, dk); px(g, 7, 21, 18, 5, tint); px(g, 7, 21, 18, 1, lite);
    px(g, 9, 23, 4, 2, "#e8d9b8"); px(g, 15, 23, 4, 2, "#e8d9b8"); px(g, 21, 23, 3, 2, "#e8d9b8");
    // torn membrane sails: notches + scar patches
    g.fillStyle = dk;
    g.beginPath(); g.moveTo(13, 21); g.lineTo(1, 5); g.lineTo(2, 12); g.lineTo(5, 10); g.lineTo(4, 15); g.lineTo(8, 14); g.fill();
    g.beginPath(); g.moveTo(19, 21); g.lineTo(31, 5); g.lineTo(30, 12); g.lineTo(27, 10); g.lineTo(28, 15); g.lineTo(24, 14); g.fill();
    px(g, 2, 7, 3, 6, lite); px(g, 27, 7, 3, 6, lite);
    px(g, 3, 7, 2, 2, "#fff"); px(g, 27, 7, 2, 2, "#fff");
    px(g, 5, 12, 2, 3, "#d9c27f"); px(g, 25, 12, 2, 3, "#d9c27f"); // old scars
    px(g, 6, 14, 3, 2, "#7a1f1f"); px(g, 23, 14, 3, 2, "#7a1f1f");
    px(g, 4, 10, 1, 6, dk); px(g, 27, 10, 1, 6, dk); // spar tears
    // rising neck + crowned head, jaw full of teeth
    px(g, 16, 9, 10, 13, tint); px(g, 17, 10, 8, 3, lite);
    px(g, 18, 15, 9, 5, "#0c1a10");
    for (let i = 0; i < 5; i++) px(g, 19 + i * 2, 16, 1, 3, "#fff");
    px(g, 19, 19, 8, 1, "#7a1f1f");
    g.fillStyle = "#ffe14d"; g.fillRect(19, 12, 2, 3); g.fillRect(24, 12, 2, 2); g.fillStyle = "#111"; g.fillRect(19, 12, 1, 2);
    g.fillStyle = "#fff"; g.fillRect(19, 12, 1, 1);
    // horned crown: swept ivory horns rooted on the skull, bloody bases
    px(g, 19, 4, 3, 5, "#e8e0d0"); px(g, 19, 4, 3, 1, "#fff"); px(g, 19, 8, 3, 1, "#c93b3b");
    px(g, 15, 3, 3, 3, "#e8e0d0"); px(g, 12, 1, 4, 3, "#e8e0d0"); px(g, 12, 1, 4, 1, "#fff"); px(g, 15, 5, 3, 1, "#c93b3b");
    px(g, 24, 3, 3, 3, "#e8e0d0"); px(g, 26, 1, 4, 3, "#e8e0d0"); px(g, 26, 1, 4, 1, "#fff"); px(g, 24, 5, 3, 1, "#c93b3b");
    // gold torc: broodmother's hoard-piece
    px(g, 12, 28, 8, 2, "#ffd93d"); px(g, 14, 28, 2, 2, "#c93b3b");
  };

  // PEAK DRAGON v3 (overrides mobs.js): apex drake — broad sails, horned crown,
  // ember heart glow, armored belly, spaded tail.
  D.peak_dragon = (g, tint, ph) => {
    const P = window.Anim.normP(ph), Q = window.Anim.quad(P), hb = window.Anim.hbob(P);
    const dk = shade(tint, -35), mid = shade(tint, -15), lite = shade(tint, 40);
    const deep = shade(tint, -70), belly = "#f2d0a0", horn = "#e8e0d0";
    const C = { edge: deep, panel: mid, panel2: shade(tint, -25), hi: lite, claw: horn };
    wingMemb(g, -1, C); wingMemb(g, 1, C);
    // shoulder muscle anchoring wings
    px(g, 9, 19, 5, 4, mid); px(g, 18, 19, 5, 4, mid);
    // spaded tail curling east lashes as it stomps
    const sw = window.Anim.seg(P, 0, 1);
    px(g, 1, 28 + sw, 9, 3, dk); px(g, 0, 26 + sw, 4, 3, dk); px(g, 4, 28 + sw, 5, 1, deep);
    px(g, 27, 24 + sw, 3, 4, mid); px(g, 28, 22 + sw, 4, 3, mid); px(g, 28, 22 + sw, 4, 1, lite);
    px(g, 29, 20 + sw, 3, 3, horn); px(g, 29, 20 + sw, 3, 1, "#fff");
    // hind + fore legs stomp in diagonal pairs, claws ride along
    px(g, 8+Q.x2, 27 + Q.d1, 5, 6, dk); px(g, 9+Q.x2, 28 + Q.d1, 3, 3, mid);
    px(g, 7+Q.x2, 32 + Q.d1, 8, 3, deep);
    px(g, 7+Q.x2, 33 + Q.d1, 2, 2, horn); px(g, 11+Q.x2, 33 + Q.d1, 2, 2, horn); px(g, 14+Q.x2, 33 + Q.d1, 1, 2, horn);
    px(g, 19+Q.x2, 27 + Q.d2, 5, 6, mid); px(g, 20+Q.x2, 28 + Q.d2, 3, 3, lite);
    px(g, 18+Q.x2, 32 + Q.d2, 8, 3, deep);
    px(g, 18+Q.x2, 33 + Q.d2, 2, 2, horn); px(g, 22+Q.x2, 33 + Q.d2, 2, 2, horn);
    // torso: scale rows + segmented armored belly + ember heart
    px(g, 7, 21, 18, 9, tint); px(g, 7, 21, 18, 2, lite); px(g, 7, 28, 18, 2, deep);
    px(g, 8, 23, 3, 1, dk); px(g, 13, 23, 3, 1, dk); px(g, 18, 23, 3, 1, dk);
    px(g, 9, 25, 14, 4, belly); px(g, 9, 25, 14, 1, "#fff"); px(g, 9, 28, 14, 1, shade(belly, -32));
    px(g, 13, 25, 1, 4, shade(belly, -32)); px(g, 17, 25, 1, 4, shade(belly, -32)); px(g, 21, 25, 1, 4, shade(belly, -32));
    px(g, 12, 23, 5, 2, "#ff7b2e"); px(g, 13, 23, 3, 1, "#ffd93d"); // ember heart
    // dorsal spikes on dark bases
    px(g, 9, 18, 4, 2, deep); px(g, 13, 17, 4, 2, deep); px(g, 17, 18, 4, 2, deep);
    px(g, 10, 15, 3, 4, horn); px(g, 14, 14, 3, 5, horn); px(g, 18, 15, 3, 4, horn);
    px(g, 10, 15, 3, 1, "#fff"); px(g, 14, 14, 3, 1, "#fff");
    // neck cranes + throat
    px(g, 20, 12 + hb, 6, 10, tint); px(g, 21, 14 + hb, 3, 7, belly); px(g, 21, 20 + hb, 3, 1, shade(belly, -32));
    px(g, 25, 12 + hb, 1, 10, dk);
    // head: long snout, nostril, jaw drops open on atk, ember eye + brow
    px(g, 18, 6 + hb, 10, 6, tint); px(g, 18, 6 + hb, 10, 1, dk);
    px(g, 25, 8 + hb, 7, 4, mid); px(g, 25, 8 + hb, 7, 1, lite); px(g, 25, 11 + hb, 7, 1, dk);
    px(g, 30, 9 + hb, 1, 1, "#111"); px(g, 30, 11 + hb, 1, 1, "#ff7b2e");
    px(g, 21, 11 + hb, 10, 2, deep);
    px(g, 22, 12 + hb, 2, 3, "#fff"); px(g, 26, 12 + hb, 2, 3, "#fff"); px(g, 29, 11 + hb, 2, 3 + (P.atk ? 2 : 0), "#fff");
    px(g, 22, 14 + hb + (P.atk ? 2 : 0), 8, 2, mid);
    px(g, 20, 8 + hb, 5, 4, "#ff7b2e"); px(g, 21, 8 + hb, 4, 4, "#ffd93d"); px(g, 22, 9 + hb, 2, 3, "#111"); px(g, 22, 8 + hb, 2, 1, "#fff");
    px(g, 19, 7 + hb, 7, 1, deep); px(g, 19, 6 + hb, 7, 1, dk);
    // swept-back horn pair + crown nub ride the head
    px(g, 14, 3 + hb, 4, 2, horn); px(g, 12, 1 + hb, 3, 3, horn); px(g, 14, 3 + hb, 4, 1, "#fff");
    px(g, 24, 3 + hb, 4, 2, horn); px(g, 27, 1 + hb, 3, 3, horn); px(g, 24, 3 + hb, 4, 1, "#fff");
    px(g, 19, 3 + hb, 3, 2, horn);
  };

  // TEMPEST ROC v3: storm raptor — broad barred wings, hooked beak, spark crest.
  D.tempest_roc = (g, tint, ph) => {
    const P = window.Anim.normP(ph), A = window.Anim.limb(P), hb = window.Anim.hbob(P);
    const dk = shade(tint, -50), lite = shade(tint, 40);
    const C = { edge: dk, mid: tint, covert1: shade(tint, -20), covert2: lite, prim: shade(tint, -10), tip: "#f2e8d0", shade: dk, hi: lite };
    wingBroad(g, -1, C); wingBroad(g, 1, C);
    // storm bars across wings
    px(g, 2, 14, 4, 2, "#ffe14d"); px(g, 26, 14, 4, 2, "#ffe14d");
    px(g, 3, 17, 3, 1, "#fff"); px(g, 26, 17, 3, 1, "#fff");
    // fanned tail
    px(g, 12, 29, 8, 5, dk); px(g, 13, 29, 6, 2, tint);
    px(g, 13, 32, 2, 2, "#f2e8d0"); px(g, 17, 32, 2, 2, "#f2e8d0");
    // talons stamp, gripping lightning
    px(g, 11+A.lx, 28 + A.ld, 4, 3, "#e8a020"); px(g, 17+A.rx, 28 + A.rd, 4, 3, "#e8a020");
    px(g, 10+A.lx, 30 + A.ld, 5, 1, "#3a2a1a"); px(g, 17+A.rx, 30 + A.rd, 5, 1, "#3a2a1a");
    px(g, 14, 28 + Math.min(A.ld, A.rd), 4, 4, "#ffe14d"); px(g, 15, 29 + Math.min(A.ld, A.rd), 2, 2, "#fff"); // spark in grip
    // deep-keeled body
    px(g, 11, 19, 10, 11, tint); px(g, 13, 21, 6, 8, "#f2e8d0");
    px(g, 11, 19, 2, 11, dk); px(g, 19, 19, 2, 11, dk);
    // head bobs + big hooked beak snaps on atk + fierce brow
    px(g, 11+A.hx, 9 + hb, 10, 9, shade(tint, -20));
    px(g, 11+A.hx, 9 + hb, 10, 2, lite);
    px(g, 13+A.hx, 13 + hb, 7, 4, "#f2b63a"); px(g, 14+A.hx, 16 + hb + (P.atk ? 2 : 0), 5, 2, shade("#f2b63a", -40));
    px(g, 18+A.hx, 16 + hb + (P.atk ? 2 : 0), 2, 2, "#7a4a10");
    g.fillStyle = "#fff"; g.fillRect(13+A.hx, 11 + hb, 3, 3); g.fillStyle = "#111"; g.fillRect(14+A.hx, 12 + hb, 2, 2);
    g.fillStyle = "#fff"; g.fillRect(13+A.hx, 11 + hb, 1, 1);
    px(g, 12+A.hx, 10 + hb, 5, 1, dk); // angry brow
    // triple spark crest rides the head
    px(g, 13+A.hx, 4 + hb, 2, 4, "#ffe14d"); px(g, 16+A.hx, 2 + hb, 2, 5, "#ffe14d"); px(g, 19+A.hx, 0 + hb, 2, 5, "#ffe14d");
    px(g, 16+A.hx, 2 + hb, 2, 1, "#fff"); px(g, 19+A.hx, 0 + hb, 2, 1, "#fff");
  };

  // STYMPHALIAN v3: bronze terror — metal wings, spear beak, helm crest.
  D.stymphalian = (g, tint, ph) => {
    const P = window.Anim.normP(ph), A = window.Anim.limb(P), hb = window.Anim.hbob(P);
    const bronze = "#d9a92e", dk = "#4a3a10", steel = "#f2f2f2";
    const C = { edge: dk, mid: bronze, covert1: "#b8891f", covert2: "#ffe98a", prim: "#a8821f", tip: steel, shade: dk, hi: "#fff2b0" };
    wingBroad(g, -1, C); wingBroad(g, 1, C);
    // steel glints on primaries
    px(g, 2, 5, 1, 3, "#fff"); px(g, 29, 5, 1, 3, "#fff");
    // armored legs march
    px(g, 11+A.lx, 29 + A.ld, 3, 6, dk); px(g, 18+A.rx, 29 + A.rd, 3, 6, dk);
    px(g, 10+A.lx, 34 + A.ld, 5, 2, "#8a8a92"); px(g, 17+A.rx, 34 + A.rd, 5, 2, "#8a8a92");
    // bronze cuirass with boss + trim
    px(g, 10, 17, 12, 12, bronze);
    px(g, 10, 17, 12, 2, "#e8d060"); px(g, 10, 27, 12, 2, dk);
    px(g, 13, 20, 6, 6, "#8a6a1a"); px(g, 14, 21, 4, 4, "#e8d060"); px(g, 15, 22, 2, 2, dk);
    px(g, 10, 17, 2, 12, "#8a6a1a"); px(g, 20, 17, 2, 12, "#8a6a1a");
    // head bobs: crested helm-bird, spear beak dips on atk, angry red eyes
    px(g, 11+A.hx, 8 + hb, 10, 10, bronze);
    px(g, 11+A.hx, 8 + hb, 10, 2, "#e8d060");
    px(g, 12+A.hx, 5 + hb, 8, 4, dk); px(g, 13+A.hx, 4 + hb, 6, 2, "#ffd93d"); // crest
    px(g, 13+A.hx, 13 + hb + (P.atk ? 2 : 0), 6, 5, "#e8e0d0"); px(g, 14+A.hx, 17 + hb + (P.atk ? 2 : 0), 4, 2, dk); // spear beak
    px(g, 14+A.hx, 13 + hb + (P.atk ? 2 : 0), 4, 1, "#fff");
    g.fillStyle = "#ff3b3b"; g.fillRect(12+A.hx, 11 + hb, 3, 3); g.fillRect(18+A.hx, 11 + hb, 2, 3);
    g.fillStyle = "#111"; g.fillRect(13+A.hx, 12 + hb, 1, 2); g.fillRect(18+A.hx, 12 + hb, 1, 2);
  };

  // SIREN v3: songstress of the reef — veil, shell top, scaled tail-skirt.
  D.siren = (g, tint, ph) => {
    const P = window.Anim.normP(ph), A = window.Anim.limb(P), hb = window.Anim.hbob(P);
    const dk = shade(tint, -40), lite = shade(tint, 30);
    const C = { edge: "#1a5a6a", mid: tint, covert1: shade(tint, -15), covert2: lite, prim: shade(tint, -20), tip: "#bfe8ff", shade: dk, hi: lite };
    wingBroad(g, -1, C); wingBroad(g, 1, C);
    // webbed fingers hint
    px(g, 3, 16, 2, 3, "#bfe8ff"); px(g, 27, 16, 2, 3, "#bfe8ff");
    // flowing aqua veil/hair
    px(g, 7, 2, 18, 8, "#bfe8ff"); px(g, 7, 2, 18, 2, "#fff");
    px(g, 6, 5, 3, 15, "#bfe8ff"); px(g, 23, 5, 3, 15, "#bfe8ff");
    px(g, 6, 5, 3, 2, "#fff"); px(g, 23, 5, 3, 2, "#fff");
    px(g, 8, 8, 2, 8, "#7ad9f0"); px(g, 22, 8, 2, 8, "#7ad9f0"); // veil folds
    // face pales + song mouth opens wide on atk, head swaying
    px(g, 11+A.hx, 8 + hb, 10, 9, "#f2c9b8");
    px(g, 11+A.hx, 8 + hb, 10, 1, "#fff");
    g.fillStyle = "#111"; g.fillRect(13+A.hx, 10 + hb, 2, 3); g.fillRect(17+A.hx, 10 + hb, 2, 3);
    g.fillStyle = "#fff"; g.fillRect(13+A.hx, 10 + hb, 1, 1); g.fillRect(17+A.hx, 10 + hb, 1, 1);
    px(g, 15+A.hx, 12 + hb, 2, 1, "#c98a5a");
    px(g, 14+A.hx, 14 + hb, 4, 3 + (P.atk ? 2 : 0), "#7a1f1f"); px(g, 15+A.hx, 14 + hb, 2, 1, "#fff"); px(g, 15+A.hx, 15 + hb + (P.atk ? 2 : 0), 2, 1, "#ff9d9d");
    // pearl necklace + shell top
    px(g, 13, 17, 6, 1, "#fff"); px(g, 15, 17, 2, 1, "#ffd93d");
    px(g, 11, 18, 10, 6, tint); px(g, 12, 19, 3, 4, "#e8d9c9"); px(g, 17, 19, 3, 4, "#e8d9c9");
    px(g, 14, 20, 4, 1, "#fff");
    // arms sway as she sings + bracelets (thrown up on atk)
    px(g, 7+A.lax, 18 + A.la - (P.atk ? 3 : 0), 3, 6, "#f2c9b8"); px(g, 22+A.rax, 18 + A.ra - (P.atk ? 3 : 0), 3, 6, "#f2c9b8");
    px(g, 7+A.lax, 21 + A.la - (P.atk ? 3 : 0), 3, 1, "#ffd93d"); px(g, 22+A.rax, 21 + A.ra - (P.atk ? 3 : 0), 1, "#ffd93d");
    // scaled tail-skirt swishes + fins
    px(g, 10, 24, 12, 7, "#2a6a7a"); px(g, 10, 24, 12, 2, lite);
    px(g, 11, 26, 3, 2, "#7ad9c9"); px(g, 15, 27, 3, 2, "#7ad9c9"); px(g, 19, 26, 2, 2, "#7ad9c9");
    px(g, 11, 29, 3, 5, dk); px(g, 18, 29, 3, 5, dk);
    px(g, 10, 31, 5, 2, "#7ad9f0"); px(g, 17, 31, 5, 2, "#7ad9f0"); // tail fins
  };

  const prev = window.Sprites.actor;
  const cache = new Map();
  try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(() => cache.clear()); } catch(e){}
  window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
    if (D[kind]){
      gen = (gen==="male"||gen==="female")?gen:"";
      // limb-animation pose (7th arg from drawEntity): painters re-render
      // real limb cycles; portraits pass nothing -> rest frame, same key.
      let P = null, bk = "";
      try {
        if (window.Anim) {
          if (ph) { P = window.Anim.normP(ph); bk = "|"+window.Anim.bucket(ph); }
          else P = window.Anim.normP(null);
        }
      } catch(e){ P = { f:0, moving:false, hurt:false, atk:false, atkKind:"melee", idle:0, t:0 }; }
      const ck = "ov1|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
      let hit=null; try{ hit=cache.get(ck);}catch(e){}
      if(hit) return hit;
      const c=cv(); const g=c.getContext("2d"); g.imageSmoothingEnabled=false;
      g.clearRect(0,0,32,40);
      g.fillStyle="rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
      try{ curP = P; D[kind](g,tint||"#fff",P); }catch(e){} finally { try{ curP = null; }catch(e2){} }
      let out=c;
      try{ out=window.Sprites.genderFX(c,gen);}catch(e){}
      try{ cache.set(ck,out); if(cache.size>900) cache.delete(cache.keys().next().value);}catch(e){}
      return out;
    }
    return prev.call(this,kind,tint,seed,gear,app,gen,ph);
  };
})();
