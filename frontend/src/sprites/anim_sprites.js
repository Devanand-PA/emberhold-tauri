/* src/sprites/anim_sprites.js — TRUE limb animation: phase-aware sprite painters.
   Loaded AFTER sprite_overhaul.js; outermost Sprites.actor wrapper.
   Painters take (g, tint, P) where P = Anim.pose():
     {f:0..3 walk frame, moving, hurt, atk, atkKind, idle:0/1, t:sec}
   Legacy painters ignore the extra arg; D2 painters below re-render real
   leg/arm/wing/tail cycles. Cache key carries a small pose bucket, so at
   most a few canvases per kind (walk 4 + idle 2 + hurt 2 + atk 1).
   Portraits and non-moving callers pass no pose -> rest frame, same as ever.
*/
(function(){
  "use strict";
  function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x,y,w,h); }
  function shade(hex,amt){
    const n=parseInt(String(hex).slice(1),16);
    if(isNaN(n)) return hex;
    let r=(n>>16)+amt, gg=((n>>8)&255)+amt, b=(n&255)+amt;
    r=Math.max(0,Math.min(255,r)); gg=Math.max(0,Math.min(255,gg)); b=Math.max(0,Math.min(255,b));
    return "#"+((r<<16)|(gg<<8)|b).toString(16).padStart(6,"0");
  }
  function cv(){ const c=document.createElement("canvas"); c.width=32; c.height=40; return c; }
  const D2 = {};
  function N(ph){
    if (ph && typeof ph === "object" && typeof ph.f === "number") return ph;
    return { f:0, moving:false, hurt:false, atk:false, atkKind:"melee", idle:0, t:0 };
  }
  // front-facing biped limb offsets: legs march, arms counter-swing.
  // hurt = stagger-brace (left leg up, right planted, both arms flung wide).
  // atk  = weapon (right) arm raised high.
  // Delegates to the shared core (src/anim.js) so every file beats with
  // the same 4-distinct-frames gait; local fallback mirrors it exactly.
  function biped(P){
    try { if (window.Anim) return window.Anim.limb(P); } catch(e){}
    if (P.hurt) return { ld:-1, rd:1, lx:-1, rx:1, la:2, ra:2, lax:-1, rax:1, hx:0, wide:1, crouch:1 };
    if (P.atk && P.atkKind !== "cast") return { ld:1, rd:1, lx:-1, rx:1, la:1, ra:-4, lax:0, rax:1, hx:0, wide:1, crouch:1 };
    if (!P.moving) return { ld:0, rd:0, lx:0, rx:0, la:0, ra:0, lax:0, rax:0, hx:0, wide:0, crouch:0 };
    const f = P.f & 3;
    return { ld:[0,-1,-3,-1][f], lx:[0,1,1,-1][f], rd:[-3,-1,0,-1][f], rx:[-1,-1,0,1][f],
      la:[2,1,-2,-1][f], lax:[0,-1,0,1][f], ra:[-2,-1,2,1][f], rax:[0,1,0,-1][f], hx:[0,1,0,-1][f], wide:0, crouch:0 };
  }
  // serpent segment sway: travelling wave while moving, slow sway at rest.
  function slx(P,i,a){
    a = a || 1;
    try { if (window.Anim) return window.Anim.seg(P,i,a); } catch(e){}
    if (P.moving) { const S=[0,2,-1,1]; return S[(P.f+i)&3]*a; }
    return ((((P.t*1.5)|0)+i)&1) ? a : -a;
  }
  function hby(P){ try { if (window.Anim) return window.Anim.hbob(P); } catch(e){} return P.moving ? [0,-1,-2,-1][P.f&3] : (P.idle ? -1 : 0); }

  /* ============ BOSSES ============ */

  // GOBLIN KING v3: bulky monarch — big bat ears, heavy brow, 3-spike crown
  // with blood-gem, purple mantle, bare war-belly, gold skull-buckle belt,
  // bone sceptre (raised on attack), bowed marching legs.
  D2.goblin_king = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const skin=tint&&tint!=="#ffffff"?tint:"#3f9e4d", dk=shade(skin,-45), deep=shade(skin,-70), lite=shade(skin,40);
    const cr=B.crouch?1:0;
    // MANTLE: royal purple shoulder cape, hem sways with stride
    const sw=P.moving?((P.f&1)?1:-1):0;
    px(g,6+sw,14,4,12,"#5a2a7a"); px(g,22-sw,14,4,12,"#5a2a7a");
    px(g,6+sw,14,4,2,"#7a4aaa"); px(g,22-sw,14,4,2,"#7a4aaa");
    px(g,7+sw,25,2,3,"#7a4aaa"); px(g,23-sw,25,2,3,"#7a4aaa");
    // BOWED LEGS: stubby, march ±, sandals
    px(g,10+B.lx,29+B.ld,4,6,skin); px(g,18+B.rx,29+B.rd,4,6,skin);
    px(g,10+B.lx,31+B.ld,4,2,dk); px(g,18+B.rx,31+B.rd,4,2,dk);
    px(g,9+B.lx,34+B.ld,6,2,"#4a2f1a"); px(g,17+B.rx,34+B.rd,6,2,"#4a2f1a");
    // BELLY torso: war-belly + chest + gold belt + skull buckle
    px(g,9,18+cr,14,12,skin);
    px(g,11,22+cr,10,6,lite);
    px(g,12,24+cr,8,2,dk);
    px(g,9,27+cr,14,3,"#c9a227"); px(g,9,27+cr,14,1,"#f4d35e");
    px(g,14,26+cr,4,5,"#e8e0d0"); px(g,15,27+cr,2,2,"#111"); px(g,14,29+cr,1,1,"#111"); px(g,17,29+cr,1,1,"#111");
    // ARMS: left holds orb, right holds sceptre (raised on atk)
    const axL=B.wide?6:8, axR=B.wide?24:22;
    px(g,axL+B.lax,19+B.la+cr,3,7,skin); px(g,axR+B.rax,19+B.ra+cr,3,7-(P.atk?2:0),skin);
    px(g,axL+B.lax,25+B.la,3,2,lite); px(g,axR+B.rax,25+B.ra-(P.atk?2:0),3,2,lite);
    // orb of command (left fist)
    px(g,axL+B.lax,25+B.la,3,3,"#c02040"); px(g,axL+B.lax,25+B.la,1,1,"#ff8fa0");
    // bone sceptre (right fist): shaft + skull head
    const sx=axR, sy=14+B.ra+cr-(P.atk?4:0);
    if(!P.atk){ px(g,sx,sy+6,3,10,"#e8e0d0"); }
    else { px(g,sx+1,sy-2,2,12,"#e8e0d0"); }
    px(g,sx-1,sy-2+(P.atk?-4:0),5,4,"#fff");
    px(g,sx,sy-1+(P.atk?-4:0),1,2,"#111"); px(g,sx+2,sy-1+(P.atk?-4:0),1,2,"#111");
    // HEAD: heavy brow, warts, underbite fangs
    px(g,9,6+cr,14,11,skin);
    px(g,9,6+cr,14,3,dk); // brow ridge shadow
    // BAT EARS sticking out sideways
    px(g,3,9+cr,6,4,skin); px(g,23,9+cr,6,4,skin);
    px(g,4,10+cr,4,2,lite); px(g,24,10+cr,4,2,lite);
    px(g,5,13+cr,2,1,"#a02040"); px(g,25,13+cr,2,1,"#c9a227"); // ear rings
    // eyes: yellow, angry angled brows
    px(g,11,10+cr,4,3,"#ffe95e"); px(g,17,10+cr,4,3,"#ffe95e");
    px(g,12,11+cr,2,2,"#111"); px(g,18,11+cr,2,2,"#111");
    px(g,10,8+cr,5,2,deep); px(g,17,8+cr,5,2,deep);
    // nose + fanged underbite grin
    px(g,14,13+cr,4,2,dk);
    px(g,11,15+cr,10,2,"#5a1a1a");
    px(g,12,15+cr,2,2,"#fff"); px(g,18,15+cr,2,2,"#fff");
    px(g,15,13+cr,2,2,"#fff");
    px(g,14,9+cr,1,1,dk); px(g,18,14+cr,1,1,dk); // warts
    // CROWN: gold band + 3 spikes + blood gem
    px(g,9,2+cr,14,4,"#c9a227"); px(g,9,3+cr,14,1,"#f4d35e");
    px(g,10,0+cr,3,3,"#c9a227"); px(g,15,0+cr,2,3,"#f4d35e"); px(g,19,0+cr,3,3,"#c9a227");
    px(g,14,2+cr,4,3,"#c02040"); px(g,15,2+cr,1,1,"#ff8fa0");
  };

  // ONI DAIMYO v3: hulking red warlord — horned great-kabuto with gold
  // crescent, sode shoulder guards, corded black armor, war-banner,
  // gold-studded kanabo (raised overhead on attack), stomping sandals.
  D2.oni_daimyo = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const skin="#c22e1f", dk="#7a1408", lite="#ff6a4a";
    const cr=B.crouch?1:0;
    // SASHIMONO war banner pole on back, cloth sways with stride
    const sw=P.moving?((P.f&1)?1:-1):0;
    px(g,24,2+cr,2,20,"#8a6a3a"); // banner pole: bright wood, not lost on armor
    px(g,24,1+cr,2,2,"#c9a227"); // gold pole tip
    px(g,25+sw,3+cr,5,9,"#f2ede0");
    px(g,25+sw,3+cr,5,1,"#c9a227"); // gold hem
    px(g,26+sw,4+cr,3,2,"#c22e1f"); px(g,26+sw,7+cr,3,2,"#c22e1f");
    // STOMP LEGS: bare + straw sandals, big march
    px(g,10+B.lx,28+B.ld,4,7,"#a02818"); px(g,18+B.rx,28+B.rd,4,7,"#a02818");
    px(g,9+B.lx,34+B.ld,6,2,"#d9c27f"); px(g,17+B.rx,34+B.rd,6,2,"#d9c27f");
    px(g,10+B.lx,35+B.ld,4,1,"#7a5a2a"); px(g,18+B.rx,35+B.rd,4,1,"#7a5a2a");
    // armored skirt (kusazuri plates)
    for(let i=0;i<4;i++){ px(g,9+i*4,24+cr,3,5,"#2a2a33"); px(g,9+i*4,24+cr,3,1,"#55555f"); }
    // TORSO: black plates + gold cords
    px(g,8,15+cr,16,10,"#2a2a33");
    for(let i=0;i<3;i++){ px(g,8,17+cr+i*3,16,1,"#c9a227"); }
    px(g,8,15+cr,2,10,"#55555f"); px(g,22,15+cr,2,10,"#55555f");
    // SODE: massive layered shoulder guards
    px(g,3+B.lax,13+cr+B.la,6,5,"#3a3a44"); px(g,23+B.rax,13+cr+B.ra,6,5,"#3a3a44");
    px(g,3+B.lax,15+cr+B.la,6,1,"#c9a227"); px(g,23+B.rax,15+cr+B.ra,6,1,"#c9a227");
    px(g,4+B.lax,17+cr+B.la,4,3,skin); px(g,24+B.rax,17+cr+B.ra,4,3,skin);
    // ARMS: left fist clenched, right hefts kanabo (overhead on atk)
    const axR=24;
    px(g,4+B.lax,18+B.la+cr,3,6,skin);
    if(!P.atk){
      px(g,axR+B.rax,18+B.ra+cr,3,8,skin);
      px(g,26,20,3,12,"#5a3a22"); // kanabo shaft grounded-side
      px(g,26,18,5,4,"#7a5230"); px(g,27,18,1,1,"#c9a227"); px(g,29,19,1,1,"#c9a227");
      px(g,27,22,1,1,"#c9a227"); px(g,26,25,1,1,"#c9a227");
    } else {
      px(g,axR,12,3,7,skin); // arm thrown up
      px(g,22,2,3,12,"#5a3a22"); // kanabo raised overhead
      px(g,21,0,5,4,"#7a5230");
      px(g,21,1,1,1,"#c9a227"); px(g,24,1,1,1,"#c9a227"); px(g,22,3,1,1,"#ffd93d");
    }
    // HEAD: snarling maw, tusks up, gold eyes
    px(g,9,6+cr,14,10,skin);
    px(g,11,9+cr,4,3,"#ffe95e"); px(g,17,9+cr,4,3,"#ffe95e");
    px(g,12,10+cr,2,2,"#111"); px(g,18,10+cr,2,2,"#111");
    px(g,10,7+cr,5,2,dk); px(g,17,7+cr,5,2,dk);
    px(g,11,13+cr,10,3,"#4a0d06");
    px(g,12,13+cr,2,3,"#fff"); px(g,18,13+cr,2,3,"#fff"); // tusks up
    px(g,14,14+cr,4,1,"#fff");
    // GREAT KABUTO: black bowl + gold crescent + side horns
    px(g,8,1+cr,16,6,dk);
    px(g,8,1+cr,16,1,"#55555f");
    px(g,2,4+cr,5,3,"#e8e0d0"); px(g,25,4+cr,5,3,"#e8e0d0"); // horns
    px(g,13,0,6,2,"#c9a227"); px(g,12,0,2,3,"#c9a227"); px(g,18,0,2,3,"#c9a227"); // crescent
  };

  // WYVERN MATRIARCH v3: draconic queen in profile — long neck, crown of
  // horns, broad membranes that BEAT (lift on f1, sweep on f3), fore/hind
  // legs alternate, barbed tail sways, gold belly scales.
  D2.wyvern_matriarch = (g,tint,ph)=>{
    const P=N(ph);
    const grn=tint&&tint!=="#ffffff"?tint:"#2d7d46", dk=shade(grn,-50), deep=shade(grn,-75), lite=shade(grn,45);
    const lift = P.hurt ? 2 : P.atk ? -4 : P.moving ? [0,-4,0,3][P.f&3] : (P.idle ? -1 : 1);
    const legF = P.moving ? [0,-2,0,1][P.f&3] : 0;
    const legH = P.moving ? [0,1,0,-2][P.f&3] : 0;
    const sw = slx(P,0,1);
    // TAIL: barbed, curling west, sways
    px(g,2+sw,27,9,3,grn); px(g,1+sw,25,4,4,grn); px(g,0+sw,23,3,3,dk);
    px(g,0+sw,23,2,1,"#e8e0d0");
    px(g,4+sw,27,2,1,lite); px(g,7+sw,27,2,1,lite);
    // WINGS: BROAD sails anchored at shoulder, beating with lift.
    // Bigger + pale-edged so they read at a glance, not as back spikes.
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(15,21); g.lineTo(0,2+lift); g.lineTo(1,10+lift); g.lineTo(4,7+lift); g.lineTo(6,15+lift); g.lineTo(10,19+lift); g.fill();
    g.beginPath(); g.moveTo(18,21); g.lineTo(31,3+lift); g.lineTo(30,11+lift); g.lineTo(27,8+lift); g.lineTo(25,16+lift); g.lineTo(22,20+lift); g.fill();
    g.fillStyle=lite;
    g.beginPath(); g.moveTo(14,20); g.lineTo(3,5+lift); g.lineTo(4,10+lift); g.lineTo(7,13+lift); g.fill();
    g.beginPath(); g.moveTo(19,20); g.lineTo(28,6+lift); g.lineTo(27,11+lift); g.lineTo(24,14+lift); g.fill();
    px(g,0,2+lift,2,11,"#e8e0d0"); px(g,30,3+lift,2,10,"#e8e0d0"); // pale spars
    px(g,2,5+lift,1,7,dk); px(g,29,6+lift,1,6,dk);
    // BODY: haunches + gold belly
    px(g,9,20,14,8,grn);
    px(g,11,22,10,5,"#d9b45e"); px(g,12,22,8,1,"#f4d35e");
    for(let i=0;i<3;i++) px(g,12+i*3,23,1,3,"#a08434");
    px(g,9,20,14,1,lite);
    // FORELEG + HINDLEG alternate
    px(g,10,27+legF,3,6,dk); px(g,9,32+legF,4,2,deep);
    px(g,20,27+legH,3,6,dk); px(g,19,32+legH,4,2,deep);
    px(g,9,32+legF,1,2,"#e8e0d0"); px(g,19,32+legH,1,2,"#e8e0d0");
    // NECK rising east + head
    const hy = 8 + hby(P);
    px(g,19,12,5,10,grn); px(g,19,13,2,8,lite);
    px(g,20,hy+6,9,7,grn); // skull
    px(g,21,hy+7,7,3,lite);
    // horn crown: 3 swept spikes
    px(g,20,hy+2,2,5,dk); px(g,23,hy+1,2,6,dk); px(g,26,hy+2,2,5,dk);
    px(g,20,hy+2,2,1,"#e8e0d0"); px(g,23,hy+1,2,1,"#e8e0d0");
    // snout + jaw (opens on atk)
    px(g,26,hy+8,5,3,grn);
    if (!P.atk) { px(g,27,hy+10,4,1,"#7a1408"); }
    else { px(g,27,hy+10,4,3,"#7a1408"); px(g,28,hy+10,2,1,"#fff"); px(g,28,hy+12,1,1,"#fff"); }
    // matriarch eye: gold, lashed
    px(g,22,hy+8,3,3,"#ffe95e"); px(g,23,hy+9,2,2,"#111"); px(g,23,hy+9,1,1,"#fff");
    px(g,22,hy+7,3,1,deep);
    // egg-guard gold band on neck
    px(g,19,16,5,2,"#c9a227");
  };

  // FENRIR ALPHA v3.1: full wolf rebuild — taller legs, deep chest, big
  // wedge head carried HIGH above the back line, open-jaw snarl on atk,
  // slashed (not windowed) ice runes, large brush tail, hackled ridge.
  D2.fenrir_alpha = (g,tint,ph)=>{
    const P=N(ph);
    void tint;
    const fur="#23232e", dk="#101016", lite="#3d3d52", ice="#7fd4ff", deep="#0a2a3a";
    let f1=0,f2=0,h1=0,h2=0,sx1=0,sx2=0;
    if (P.hurt) { f1=-1; h1=1; }
    else if (P.atk) { f1=1; f2=1; sx1=-2; sx2=2; }
    else if (P.moving) { const f=P.f&3; f1=[0,-1,-2,-1][f]; h1=f1; f2=[-2,-1,0,-1][f]; h2=f2; sx1=[2,1,-2,-1][f]; sx2=[-2,-1,2,1][f]; }
    const wag = P.moving ? [0,2,-1,1][P.f&3] : (P.idle?1:-1);
    const cr = P.hurt?1:0;
    // BRUSH TAIL: big and bushy, carried high
    px(g,0,15+cr+wag,5,5,fur); px(g,0,14+cr+wag,4,2,lite);
    px(g,1,19+cr+wag,4,2,fur); px(g,2,20+cr+wag,3,1,ice);
    px(g,0,16+cr+wag,1,3,dk);
    // HIND LEGS: long, frost-pawed
    px(g,20+sx1,27+h1,4,7,fur); px(g,21+sx2,27+h2,4,7,dk);
    px(g,19+sx1,33+h1,6,2,ice); px(g,20+sx2,33+h2,6,2,deep);
    // FRONT LEGS: long, straight columns
    px(g,8+sx1,27+f1,4,7,fur); px(g,9+sx2,27+f2,4,7,dk);
    px(g,7+sx1,33+f1,6,2,ice); px(g,8+sx2,33+f2,6,2,deep);
    // BODY: deep barrel carried HIGH (belly at y29, back at y20)
    px(g,4,20+cr,22,9,fur);
    px(g,4,20+cr,22,1,lite);
    for(let i=0;i<6;i++) px(g,5+i*3,19+cr,2,2,dk); // hackled ridge
    // ICE-RUNE SLASHES: diagonal, broken rhythm — not windows
    px(g,7,23+cr,1,3,ice); px(g,8,25+cr,1,1,ice);
    px(g,12,23+cr,2,1,ice); px(g,13,24+cr,1,2,ice);
    px(g,17,24+cr,1,3,ice);
    px(g,21,23+cr,2,1,ice); px(g,22,24+cr,1,2,"#d8f4ff");
    // CHEST ruff + throat ice
    px(g,24,22+cr,3,7,lite); px(g,25,24+cr,2,4,ice);
    // NECK: thick, sloped forward to a HIGH head (no llama column)
    const hb = hby(P);
    px(g,21,13+hb+cr,6,9,fur); px(g,21,14+hb+cr,2,7,lite);
    px(g,23,8+hb+cr,8,7,fur); // skull: big block
    px(g,24,9+hb+cr,6,2,lite); // brow plate
    // EARS: tall, erect, angled slightly outward, ice-lined
    px(g,22,3+hb+cr,3,6,fur); px(g,28,3+hb+cr,3,6,fur);
    px(g,23,4+hb+cr,1,4,ice); px(g,29,4+hb+cr,1,4,ice);
    // SNOUT: long, jutting east
    px(g,28,11+hb+cr,4,4,fur);
    px(g,29,13+hb+cr,3,P.atk?3:2,dk); // open gape on atk
    px(g,30,11+hb+cr,2,2,"#000"); // nose at snout tip
    // fangs: upper row down, lower row up, more of them on atk
    px(g,28,13+hb+cr,1,2,"#fff"); px(g,30,13+hb+cr,1,2,"#fff");
    if (P.atk) { px(g,29,14+hb+cr,1,2,"#fff"); px(g,28,15+hb+cr,2,1,"#fff"); }
    else { px(g,29,14+hb+cr,1,1,"#fff"); }
    // ALPHA GLARE: big cyan eye + scar brow
    px(g,24,11+hb+cr,3,3,ice); px(g,25,12+hb+cr,2,2,"#062a3a"); px(g,25,12+hb+cr,1,1,"#fff");
    px(g,24,10+hb+cr,4,1,dk);
  };

  // LEVIATHAN v3: no more blue box — a coiled deep-sea serpent king.
  // Two body coils, finned spine, paddling pectoral fins (dive stroke cycles
  // with f), horned abyssal head with opening maw, lure + glow spots.
  D2.leviathan = (g,tint,ph)=>{
    const P=N(ph);
    const aby=tint&&tint!=="#ffffff"?tint:"#1c4f9e", dk=shade(aby,-40), deep=shade(aby,-65), lite=shade(aby,50);
    const glow="#7ff3ff", maw="#5a0d12";
    const pad = P.moving ? [0,-2,0,2][P.f&3] : (P.idle?-1:1); // fin paddle
    const sw0 = slx(P,0,1), sw1 = slx(P,2,1);
    // TAIL coil (west): tapering rings
    px(g,2+sw1,29,8,4,aby); px(g,3+sw1,29,6,1,lite);
    px(g,1+sw1,27,4,3,dk); px(g,0+sw1,25,3,3,dk); px(g,1+sw1,25,1,1,glow);
    // MAIN coil (massive body ring south)
    px(g,6+sw0,30,20,5,aby);
    px(g,7+sw0,30,18,1,lite);
    for(let i=0;i<5;i++){ px(g,8+sw0+i*4,31,2,3,dk); } // ring segments
    px(g,10+sw0,32,2,1,glow); px(g,18+sw0,32,2,1,glow); // glow spots
    // DORSAL FIN SPINES along the coil
    for(let i=0;i<5;i++){ px(g,8+sw0+i*4,26,2,4,lite); px(g,8+sw0+i*4,26,2,1,"#fff"); }
    // PECTORAL FINS: paddle the dive stroke
    px(g,10+sw0,24+pad,5,3,dk); px(g,11+sw0,24+pad,3,1,lite);
    px(g,20+sw0,24-pad,5,3,dk); px(g,21+sw0,24-pad,3,1,lite);
    // NECK rising east + abyssal head
    const hy = 10 + hby(P);
    px(g,22,16,5,12,aby); px(g,22,17,2,10,lite);
    px(g,21,hy+4,9,8,aby); // skull block
    px(g,22,hy+5,7,3,lite);
    // swept-back fin horns, pale-tipped so they read on the dark head
    px(g,20,hy+1,3,5,dk); px(g,27,hy+1,3,5,dk);
    px(g,20,hy+1,3,2,lite); px(g,27,hy+1,3,2,lite);
    // LURE stalk + bulb (angler light)
    px(g,24,hy-3,1,4,dk); px(g,23,hy-4,3,3,glow); px(g,24,hy-4,1,1,"#fff");
    // MAW: opens wide on atk, grim shut line otherwise
    px(g,25,hy+8,6,3,aby);
    if (!P.atk) { px(g,26,hy+10,5,1,maw); px(g,27,hy+9,1,1,"#fff"); }
    else {
      px(g,26,hy+10,5,4,maw);
      px(g,26,hy+10,5,1,"#fff"); px(g,26,hy+13,5,1,"#fff");
      px(g,27,hy+11,1,2,"#fff"); px(g,29,hy+11,1,2,"#fff");
    }
    // abyssal eye: big, glowing
    px(g,23,hy+7,3,3,glow); px(g,24,hy+8,2,2,"#041a24"); px(g,24,hy+8,1,1,"#fff");
    // gill slits
    px(g,22,hy+11,1,2,deep); px(g,22,hy+14,1,2,deep);
  };

  /* ============ SERPENTS ============ */
  // Shared: coils at the base wiggle with a travelling wave, necks bob,
  // jaws gape on attack, hurt = flattened flinch + tucked head.

  // NAGA v3: cobra royalty — heavy coil base, upright torso, flaring hood
  // (flares wide on atk), crown jewel, bangle arms, scimitar on atk arm.
  D2.naga = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const grn=tint&&tint!=="#ffffff"?tint:"#3f9e4d", dk=shade(grn,-45), deep=shade(grn,-70), lite=shade(grn,40);
    const duck = P.hurt?2:0; // tucked head when hurt
    // COIL BASE: 2 stacked rings, travelling wave
    const s0=slx(P,0,1), s1=slx(P,2,1);
    px(g,6+s0,32,20,4,grn); px(g,7+s0,32,18,1,lite);
    px(g,9+s1,28,14,4,dk); px(g,10+s1,28,12,1,grn);
    for(let i=0;i<4;i++) px(g,10+s1+i*3,29,1,2,deep);
    // HOOD: flares behind the head, wide + spectacled on atk
    const hw = P.atk?9:6;
    px(g,16-hw,8+duck,4,10,grn); px(g,16-hw,8+duck,2,10,lite);
    px(g,16+(8+hw)-4,8+duck,4,10,grn); px(g,18+(8+hw)-4-2,8+duck,2,10,lite);
    if (P.atk) { px(g,11,10+duck,2,4,"#e8d44a"); px(g,19,10+duck,2,4,"#e8d44a"); }
    // TORSO: scaled chest + belly plates
    px(g,12,16+duck,8,13,grn);
    px(g,13,17+duck,6,11,lite); px(g,14,18+duck,4,9,"#e8e0c8");
    for(let i=0;i<3;i++) px(g,14,19+duck+i*3,4,1,dk);
    // ARMS: bangles; right raises scimitar on atk
    px(g,8+B.lax,18+B.la+duck,3,6,grn); px(g,21+B.rax,18+B.ra+duck,3,6-(P.atk?2:0),grn);
    px(g,8+B.lax,22+B.la,3,2,"#c9a227"); px(g,21+B.rax,22+B.ra,3,2,"#c9a227");
    if (P.atk) { px(g,23,8+duck,2,8,"#cfd6dd"); px(g,23,8+duck,2,1,"#fff"); px(g,22,7+duck,4,2,"#8a6a3a"); }
    else { px(g,21+B.rax,24+B.ra,3,3,shade(grn,-20)); }
    // HEAD: cobra skull + crown jewel + forked tongue on atk
    px(g,12,6+duck,8,8,grn);
    px(g,13,7+duck,6,3,lite);
    px(g,13,9+duck,3,2,"#ffe95e"); px(g,13,10+duck,1,1,"#111");
    px(g,15,6+duck,2,2,"#c02040"); px(g,15,6+duck,1,1,"#ff8fa0"); // crown jewel
    px(g,14,12+duck,4,1,"#4a0d06");
    if (P.atk) { px(g,15,13+duck,1,3,"#c02040"); px(g,14,15+duck,3,1,"#c02040"); }
    // fangs
    px(g,14,12+duck,1,1,"#fff"); px(g,17,12+duck,1,1,"#fff");
  };

  // GORGON SPAWN v3: serpent-tailed woman whose 5 hair-snakes WRITHE —
  // each tip offset by (f+i), plus coil wave and clawed arms.
  D2.gorgon_spawn = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const grn=tint&&tint!=="#ffffff"?tint:"#4a9e5d", dk=shade(grn,-45), deep=shade(grn,-70), lite=shade(grn,40);
    const snk = P.atk ? "#c02040" : dk; // snakes flush red on attack
    const s0=slx(P,0,1), s1=slx(P,2,1);
    // coil tail
    px(g,7+s0,32,18,4,grn); px(g,8+s0,32,16,1,lite);
    px(g,10+s1,28,12,4,dk); px(g,11+s1,28,10,1,grn);
    px(g,4+s1,30,4,3,grn); px(g,4+s1,30,1,1,lite); // tail tip
    // torso: scaled corset
    px(g,11,18,10,11,grn);
    px(g,12,19,8,9,lite); px(g,13,20,6,7,"#e8d8b8");
    for(let i=0;i<2;i++) px(g,13,21+i*3,6,1,dk);
    // arms end in claws (no hands)
    px(g,7+B.lax,19+B.la,3,6,grn); px(g,22+B.rax,19+B.ra,3,6,grn);
    px(g,7+B.lax,24+B.la,3,2,"#e8e0d0"); px(g,22+B.rax,24+B.ra,3,2,"#e8e0d0");
    px(g,7+B.lax,25+B.la,1,1,dk); px(g,22+B.rax,25+B.ra,1,1,dk);
    // head: pale face, green eyes (no pupils — petrifier)
    px(g,12,8,8,7,lite);
    px(g,13,10,2,2,"#7fd4a0"); px(g,17,10,2,2,"#7fd4a0");
    px(g,14,13,4,1,"#4a0d06");
    // 5 HAIR SNAKES writhing: stems + heads, phase-offset tips
    for(let i=0;i<5;i++){
      const hx = 10+i*3, lift = P.moving ? [0,-1,0,1][(P.f+i)&3] : ((((P.t*1.5)|0)+i)&1?-1:0);
      px(g,hx,3+lift,2,6,snk);
      px(g,hx-1+(i%2),1+lift,3,3,snk); // head
      px(g,hx+(i%2),2+lift,1,1,"#ffe95e"); // eye
      if (P.atk) { px(g,hx,4+lift,1,1,"#fff"); } // fangs bared
    }
  };

  // HYDRA SPAWN v3: three necks at staggered heights swaying OUT OF PHASE
  // (each neck uses its own wave index) over a shared mound; center head
  // crowned; all maws gape on atk.
  D2.hydra_spawn = (g,tint,ph)=>{
    const P=N(ph);
    const grn=tint&&tint!=="#ffffff"?tint:"#3f8a4d", dk=shade(grn,-45), deep=shade(grn,-70), lite=shade(grn,40);
    // shared mound + tail
    const s0=slx(P,0,1), s1=slx(P,3,1);
    px(g,5+s0,30,22,5,grn); px(g,6+s0,30,20,1,lite);
    px(g,8+s1,27,16,4,dk);
    for(let i=0;i<5;i++) px(g,9+s1+i*3,28,2,2,deep);
    // three necks: west(low) center(high) east(mid), phase-offset sway
    const necks = [
      { x:9,  top:12, wave:0, crown:false },
      { x:15, top:6,  wave:2, crown:true },
      { x:21, top:10, wave:1, crown:false },
    ];
    for (const n of necks) {
      const swx = slx(P,n.wave,1);
      const ny = n.top + hby(P) + (P.hurt?2:0);
      px(g,n.x+swx,ny+6,4,16-(ny-6),grn); // neck column
      px(g,n.x+swx,ny+7,1,14-(ny-6),lite);
      // head: wider skull, brow, fanged jaw
      px(g,n.x-1+swx,ny,7,6,grn);
      px(g,n.x+swx,ny+1,5,2,lite);
      px(g,n.x+swx,ny,5,1,dk); // brow shadow
      if (n.crown) { px(g,n.x+swx,ny-2,4,2,"#c9a227"); px(g,n.x-1+swx,ny-3,2,2,"#c9a227"); px(g,n.x+3+swx,ny-3,2,2,"#c9a227"); }
      else { px(g,n.x+swx,ny-1,2,2,dk); }
      // eyes
      px(g,n.x+swx,ny+2,2,2,"#ffe95e"); px(g,n.x+swx,ny+3,1,1,"#111");
      // jaw: fanged seam, gapes on atk
      if (!P.atk) { px(g,n.x+swx,ny+4,5,1,"#4a0d06"); px(g,n.x+1+swx,ny+4,1,1,"#fff"); px(g,n.x+3+swx,ny+4,1,1,"#fff"); }
      else { px(g,n.x+swx,ny+4,5,3,"#4a0d06"); px(g,n.x+swx,ny+4,5,1,"#fff"); px(g,n.x+1+swx,ny+5,1,2,"#fff"); px(g,n.x+3+swx,ny+5,1,2,"#fff"); }
    }
  };

  // LINDWORM v3: two-legged wyrm — marching hind legs, nub wings flapping,
  // long low neck, dragging tail, fanged overbite.
  D2.lindworm = (g,tint,ph)=>{
    const P=N(ph);
    const grn=tint&&tint!=="#ffffff"?tint:"#4a7d3a", dk=shade(grn,-45), deep=shade(grn,-70), lite=shade(grn,40);
    const legL = P.moving?[0,-2,0,1][P.f&3]:0, legR = P.moving?[0,1,0,-2][P.f&3]:0;
    const flap = P.moving?[1,-2,-1,0][P.f&3]:(P.idle?-2:1);
    const sw = slx(P,1,1);
    // dragging tail (west), low
    px(g,1+sw,30,9,3,grn); px(g,0+sw,28,4,4,dk); px(g,0+sw,28,2,1,"#e8e0d0");
    // nub wings flutter
    px(g,12,18+flap,5,3,dk); px(g,13,18+flap,3,1,lite);
    px(g,19,18-flap,5,3,dk); px(g,20,18-flap,3,1,lite);
    // marching hind legs
    px(g,11,28+legL,3,6,dk); px(g,10,33+legL,4,2,deep);
    px(g,18,28+legR,3,6,dk); px(g,17,33+legR,4,2,deep);
    // low-slung body
    px(g,8,22,16,7,grn); px(g,8,22,16,1,lite);
    px(g,10,24,12,4,"#d9c27f"); px(g,11,24,10,1,"#f4e6a0");
    // long neck to the east + head
    const hy = 12 + hby(P);
    px(g,21,hy+4,5,11,grn); px(g,21,hy+5,2,9,lite);
    px(g,22,hy,7,6,grn);
    px(g,23,hy+1,5,2,lite);
    px(g,26,hy+2,4,3,grn); // snout
    px(g,27,hy+4+(P.atk?1:0),3,P.atk?2:1,"#4a0d06");
    if (P.atk) { px(g,27,hy+4,3,1,"#fff"); px(g,28,hy+5,1,1,"#fff"); }
    px(g,23,hy+2,3,2,"#ffe95e"); px(g,24,hy+3,1,1,"#111");
    px(g,23,hy,3,1,dk); // brow ridge
    // dorsal nubs
    px(g,12,20,2,2,dk); px(g,16,20,2,2,dk); px(g,20,hy+3,2,2,dk);
  };

  // SANDMAW v3: dune-burrowing worm — peristaltic plates (segments take
  // turns jutting), ringed round maw that OPENS on atk, flank fins.
  D2.sandmaw = (g,tint,ph)=>{
    const P=N(ph);
    const snd=tint&&tint!=="#ffffff"?tint:"#c9a24a", dk=shade(snd,-45), deep=shade(snd,-70), lite=shade(snd,45);
    // peristalsis: even/odd segments alternate ±1 while moving
    const seg = (i)=> P.moving ? [0,1,-1,0][(P.f+i)&3] : 0;
    // arched body: 4 hump segments
    for(let i=0;i<4;i++){
      const bx=5+i*6, by=26-Math.abs(1.5-i)*3+seg(i);
      px(g,bx,by,6,9-(by-24),snd);
      px(g,bx,by,6,1,lite);
      px(g,bx+1,by+3,4,1,dk);
    }
    // flank fins ripple
    px(g,6+seg(0),24,4,2,dk); px(g,18+seg(2),4,2,dk);
    // head mound east: darker capped skull so it stands off the humps
    const hy = 16 + hby(P);
    px(g,24,hy,6,12,shade(snd,-18)); px(g,24,hy,2,12,lite);
    px(g,24,hy,6,2,dk); // skull cap shadow
    // ROUND MAW: teeth ring; closed slit at rest, open pit on atk
    if (!P.atk) {
      px(g,26,hy+6,4,2,"#4a2c10");
      for(let i=0;i<4;i++){ px(g,26+i,hy+5,1,1,"#fff"); px(g,26+i,hy+8,1,1,"#fff"); }
    } else {
      px(g,26,hy+5,4,6,"#4a1408");
      for(let i=0;i<4;i++){ px(g,26+i,hy+5,1,2,"#fff"); px(g,26+i,hy+9,1,2,"#fff"); }
      px(g,27,hy+7,2,2,"#7a1e10");
    }
    // dune eyes under a heavy brow
    px(g,24,hy+2,3,1,dk);
    px(g,24,hy+3,3,2,"#111"); px(g,24,hy+3,1,1,"#fff");
    // sand spray on the move
    if (P.moving && (P.f&1)) { px(g,2,32,2,2,lite); px(g,4,34,1,1,dk); }
  };

  // TIDECALLER v3: lagoon serpent — waving crest fin (spikes alternate
  // height with f), paddling flippers, song-rings on atk.
  D2.tidecaller = (g,tint,ph)=>{
    const P=N(ph);
    const teal=tint&&tint!=="#ffffff"?tint:"#2a9e9e", dk=shade(teal,-45), deep=shade(teal,-65), lite=shade(teal,50);
    const sw0=slx(P,0,1), sw1=slx(P,2,1);
    // coils
    px(g,6+sw0,30,20,5,teal); px(g,7+sw0,30,18,1,lite);
    for(let i=0;i<5;i++) px(g,8+sw0+i*4,31,2,3,dk);
    px(g,2+sw1,28,5,3,dk); px(g,3+sw1,28,3,1,lite);
    // flippers paddle
    const pad = P.moving?[0,-2,0,2][P.f&3]:(P.idle?-1:1);
    px(g,10+sw0,24+pad,5,3,dk); px(g,11+sw0,24+pad,3,1,"#e8f4ff");
    px(g,18+sw0,24-pad,5,3,dk); px(g,19+sw0,24-pad,3,1,"#e8f4ff");
    // neck + head
    const hy = 10 + hby(P);
    px(g,22,15,5,13,teal); px(g,22,16,2,11,lite);
    px(g,21,hy+3,9,8,teal);
    px(g,22,hy+4,7,3,lite);
    // CREST FIN: 4 spikes waving out of phase
    for(let i=0;i<4;i++){
      const lift = P.moving ? [0,-2,0,-1][(P.f+i)&3] : ((((P.t*1.5)|0)+i)&1?-1:0);
      px(g,21+i*2,hy-1+lift,2,5-lift,"#ff7a5e");
      px(g,21+i*2,hy-1+lift,2,1,"#ffd0a8");
    }
    // eye + caller mouth (open singing on atk)
    px(g,23,hy+6,3,3,"#fff"); px(g,24,hy+7,2,2,"#062a3a"); px(g,24,hy+7,1,1,"#fff");
    if (!P.atk) px(g,26,hy+8,4,1,deep);
    else {
      px(g,26,hy+7,4,4,deep);
      px(g,28,hy+6,3,1,"rgba(127,243,255,0.9)"); px(g,29,hy+5,3,1,"rgba(127,243,255,0.6)");
    }
    // gill marks
    px(g,22,hy+10,1,2,deep); px(g,22,hy+13,1,2,deep);
  };

  // DEEPMAW v3: angler eel — ink-dark, lure swaying on a stalk, needle
  // teeth, huge gape on atk, drifting glow spots.
  D2.deepmaw = (g,tint,ph)=>{
    const P=N(ph);
    const ink=tint&&tint!=="#ffffff"?tint:"#1e2a4a", dk=shade(ink,-30), lite=shade(ink,45);
    const glow="#7ff3ff";
    const sw0=slx(P,0,1), sw1=slx(P,2,1);
    px(g,6+sw0,30,20,5,ink); px(g,7+sw0,30,18,1,lite);
    px(g,2+sw1,28,5,3,dk);
    // glow spots drift along the flank
    const dr = P.moving?(P.f&3):(P.idle*2);
    px(g,9+sw0+((dr===1)?1:0),32,1,1,glow); px(g,14+sw0-((dr===3)?1:0),32,1,1,glow); px(g,19+sw0,32,1,1,glow);
    // dorsal frill
    for(let i=0;i<4;i++) px(g,9+sw0+i*4,27,2,3,dk);
    // neck + blunt head
    const hy = 12 + hby(P);
    px(g,22,17,5,11,ink);
    px(g,21,hy+4,9,7,ink); px(g,22,hy+5,7,2,lite);
    // LURE stalk sways, bulb pulses brighter on idle-B
    const lw = slx(P,1,1);
    px(g,25+lw,hy-1,1,4,dk);
    px(g,24+lw,hy-3,3,3,P.idle?glow:"#3a9ebb"); px(g,25+lw,hy-3,1,1,"#fff");
    // needle teeth + gape
    if (!P.atk) {
      px(g,25,hy+8,5,1,"#04060c");
      px(g,26,hy+7,1,1,"#fff"); px(g,28,hy+7,1,1,"#fff");
    } else {
      px(g,25,hy+7,5,5,"#04060c");
      for(let i=0;i<5;i++){ px(g,25+i,hy+7,1,2,"#fff"); px(g,25+i,hy+10,1,2,"#fff"); }
    }
    px(g,23,hy+6,3,3,glow); px(g,24,hy+7,2,2,"#041a24");
  };

  // ABYSS SERPENT v3: the quiet deep eel — near-black, cyan pulse-dots
  // alternating down the flank, veil fins rippling, slit eyes.
  D2.abyss_serpent = (g,tint,ph)=>{
    const P=N(ph);
    const ink=tint&&tint!=="#ffffff"?tint:"#141c33", dk=shade(ink,-20), lite=shade(ink,50);
    const glow="#54e0ff";
    const sw0=slx(P,0,1), sw1=slx(P,2,1);
    px(g,6+sw0,30,20,5,ink); px(g,7+sw0,30,18,1,lite);
    px(g,2+sw1,28,5,3,dk);
    // pulse dots: even/odd alternate with stride or idle bucket
    const on = P.moving?(P.f&1):P.idle;
    for(let i=0;i<5;i++){
      if (((i&1)===on)) { px(g,8+sw0+i*4,32,2,1,glow); }
      else { px(g,8+sw0+i*4,32,2,1,shade(ink,18)); }
    }
    // veil fins ripple
    const rp = P.moving?[0,1,0,-1][P.f&3]:0;
    px(g,9+sw0,26+rp,6,2,dk); px(g,17+sw0,26-rp,6,2,dk);
    px(g,10+sw0,26+rp,4,1,glow); px(g,18+sw0,26-rp,4,1,glow);
    // long neck, narrow head, slit eyes
    const hy = 11 + hby(P);
    px(g,22,16,5,12,ink); px(g,22,17,1,10,lite);
    px(g,21,hy+3,9,7,ink);
    px(g,23,hy+5,4,1,glow); // slit eye
    px(g,25,hy+8,5,1,"#04060c");
    if (P.atk) { px(g,25,hy+8,5,3,"#04060c"); px(g,26,hy+9,1,2,glow); }
    px(g,20,hy+2,2,4,dk); // back-swept veil horn
  };

  // WRECK EEL v3: armored scavenger — riveted wood-iron plates, barnacle
  // dots, chain tail, lantern jaw hinge glowing on atk.
  D2.wreck_eel = (g,tint,ph)=>{
    const P=N(ph);
    const oak=tint&&tint!=="#ffffff"?tint:"#6a5a3a", dk=shade(oak,-45), deep=shade(oak,-65), lite=shade(oak,40);
    const iron="#4a4a55", riv="#c9c9d9";
    const sw0=slx(P,0,1), sw1=slx(P,2,1);
    // chain tail
    px(g,1+sw1,29,5,2,iron); px(g,2+sw1,29,1,1,riv); px(g,4+sw1,29,1,1,riv);
    // plated coils: wood bands + iron rivets + barnacles
    px(g,6+sw0,30,20,5,oak);
    for(let i=0;i<5;i++){
      px(g,7+sw0+i*4,30,1,5,iron);
      px(g,7+sw0+i*4,31,1,1,riv);
      if ((i+(P.moving?P.f:0))&1) px(g,9+sw0+i*4,33,1,1,"#cfd6dd"); // barnacles shift
    }
    px(g,7+sw0,30,18,1,lite);
    // neck + riveted skull
    const hy = 11 + hby(P);
    px(g,22,16,5,12,oak); px(g,22,16,1,12,iron);
    px(g,21,hy+3,9,8,oak);
    px(g,21,hy+3,9,1,iron); px(g,22,hy+4,1,1,riv); px(g,27,hy+4,1,1,riv);
    // porthole eye: brass ring
    px(g,23,hy+6,4,4,"#8a6a2a"); px(g,24,hy+7,2,2,"#0a2a3a"); px(g,24,hy+7,1,1,"#7ff3ff");
    // jaw hinge lantern: glows on atk
    px(g,25,hy+9,5,2,iron);
    if (!P.atk) px(g,26,hy+9,3,1,"#22222a");
    else { px(g,26,hy+9,4,3,"#ffb43d"); px(g,27,hy+10,2,1,"#fff"); px(g,26,hy+9,1,2,"#fff"); }
    // teeth
    px(g,26,hy+8,1,1,riv); px(g,28,hy+8,1,1,riv);
  };

  // MAGMA EEL v3: basalt body split by LAVA CRACKS that pulse with stride
  // and idle heat, flame-fin crest flickering (height cycles with f).
  D2.magma_eel = (g,tint,ph)=>{
    const P=N(ph);
    const bas=tint&&tint!=="#ffffff"?tint:"#2a1e1e", dk=shade(bas,-14), lite=shade(bas,40);
    const hot = (P.moving && (P.f===1||P.f===3)) || P.idle ? "#ffb43d" : "#ff5a1e";
    const core = (P.moving && (P.f===1||P.f===3)) || P.idle ? "#fff2b0" : "#c22e1f";
    const sw0=slx(P,0,1), sw1=slx(P,2,1);
    px(g,6+sw0,30,20,5,bas);
    // lava cracks pulse
    for(let i=0;i<5;i++){ px(g,8+sw0+i*4,31,2,2,hot); px(g,8+sw0+i*4,31,2,1,core); }
    px(g,2+sw1,28,5,3,dk);
    // flame-fin crest flicker
    for(let i=0;i<4;i++){
      const fl = P.moving?[3,5,3,4][(P.f+i)&3]:[3,4][(P.idle+i)&1]+2;
      px(g,8+sw0+i*4,27-fl,2,fl+1,"#ff5a1e");
      px(g,8+sw0+i*4,27-fl,2,2,hot);
    }
    // neck + ember head
    const hy = 11 + hby(P);
    px(g,22,16,5,12,bas);
    px(g,23,18,2,8,hot); px(g,23,19,1,6,core); // throat glow
    px(g,21,hy+3,9,8,bas);
    px(g,22,hy+4,7,2,hot);
    // ember eyes
    px(g,23,hy+6,3,3,hot); px(g,24,hy+7,2,2,"#3a0d06"); px(g,24,hy+7,1,1,"#fff");
    // cinder maw
    if (!P.atk) px(g,25,hy+8,5,1,hot);
    else { px(g,25,hy+7,5,4,"#3a0d06"); px(g,25,hy+7,5,1,hot); px(g,26,hy+9,1,2,core); px(g,28,hy+9,1,2,core); }
  };

  // FROSTWYRM v3: glacier wyrm — marching foretalons, flapping frost wings,
  // crystal spine row that SPARKLES (tips alternate white/blue with f),
  // sharded jaw breathing out ice on atk.
  D2.frostwyrm = (g,tint,ph)=>{
    const P=N(ph);
    const ice=tint&&tint!=="#ffffff"?tint:"#bfe3f2", dk=shade(ice,-60), deep=shade(ice,-90), lite="#ffffff";
    const legL = P.moving?[0,-2,0,1][P.f&3]:0, legR = P.moving?[0,1,0,-2][P.f&3]:0;
    const flap = P.atk?-4:(P.moving?[1,-3,-1,2][P.f&3]:(P.idle?-3:2));
    const sw0=slx(P,0,1);
    // tail coil with crystal tip
    px(g,2+sw0,29,7,4,ice); px(g,1+sw0,27,3,4,dk);
    px(g,1+sw0,26,3,2,P.idle?lite:"#7fd4ff");
    // frost wings: pale sails beating
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(14,20); g.lineTo(3,6+flap); g.lineTo(5,12+flap); g.lineTo(9,17+flap); g.fill();
    g.beginPath(); g.moveTo(19,20); g.lineTo(29,7+flap); g.lineTo(27,13+flap); g.lineTo(23,18+flap); g.fill();
    g.fillStyle=lite;
    g.beginPath(); g.moveTo(13,19); g.lineTo(5,8+flap); g.lineTo(7,12+flap); g.fill();
    // foretalons march
    px(g,11,27+legL,3,6,dk); px(g,10,32+legL,4,2,deep);
    px(g,18,27+legR,3,6,dk); px(g,17,32+legR,4,2,deep);
    px(g,10,32+legL,1,2,lite); px(g,17,32+legR,1,2,lite);
    // body + belly frost
    px(g,8,21,16,8,ice); px(g,8,21,16,1,lite);
    px(g,10,23,12,4,"#e8f4ff");
    // CRYSTAL SPINES sparkle in sequence
    for(let i=0;i<4;i++){
      const on = P.moving ? (((P.f+i)&3)===0) : (((P.idle+i)&1)===0);
      px(g,9+i*4+sw0,17,2,4,on?lite:"#7fd4ff");
      px(g,9+i*4+sw0,17,2,1,"#fff");
    }
    // neck + horned head
    const hy = 9 + hby(P);
    px(g,21,hy+5,5,12,ice); px(g,21,hy+6,2,10,lite);
    px(g,21,hy+1,9,7,ice);
    px(g,22,hy+2,7,2,lite);
    px(g,20,hy-1,2,4,dk); px(g,28,hy-1,2,4,dk); // frost horns
    px(g,20,hy-1,2,1,lite);
    // pale-blue eyes
    px(g,23,hy+4,3,3,"#e8f4ff"); px(g,24,hy+5,2,2,"#0a2a4a");
    // jaw: shut seam, or open + ice shards on atk
    if (!P.atk) px(g,25,hy+6,5,1,deep);
    else {
      px(g,25,hy+5,5,4,"#0a2a4a");
      px(g,26,hy+6,1,2,lite); px(g,28,hy+6,1,2,lite);
      px(g,30,hy+6,2,1,"#bfe9ff"); px(g,31,hy+5,1,1,"#fff"); // breath shards
    }
  };

  /* ============ HUMANOIDS (front-facing, marching limbs) ============ */

  // ONI IMP v3: small red hellion — horn nubs, big ears, fanged grin,
  // loincloth, nail-studded club raised on atk, whipping tail, big feet.
  D2.oni_imp = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const skin=tint&&tint!=="#ffffff"?tint:"#c23a2a", dk=shade(skin,-45), deep=shade(skin,-70), lite=shade(skin,45);
    const cr=B.crouch?1:0;
    // WHIP TAIL behind, lashing with stride
    const tw = slx(P,0,1);
    px(g,3+tw,26+cr,4,2,skin); px(g,2+tw,24+cr,2,3,skin); px(g,2+tw,24+cr,2,1,dk);
    // BIG FEET march
    px(g,9+B.lx,29+B.ld,4,5,skin); px(g,19+B.rx,29+B.rd,4,5,skin);
    px(g,8+B.lx,33+B.ld,6,2,deep); px(g,18+B.rx,33+B.rd,6,2,deep);
    px(g,8+B.lx,33+B.ld,2,1,"#e8d44a"); // toe claws
    // loincloth
    px(g,10,26+cr,12,4,"#3a2a1a"); px(g,14,26+cr,4,2,"#c9a227");
    // torso: pot belly + chest
    px(g,10,17+cr,12,10,skin);
    px(g,12,19+cr,8,6,lite);
    px(g,12,19+cr,8,1,dk);
    // arms: left clawed fist, right hefts club (overhead on atk)
    const axL=B.wide?6:7, axR=B.wide?22:21;
    px(g,axL+B.lax,18+B.la+cr,3,6,skin); px(g,axL+B.lax,23+B.la,3,2,dk);
    if (!P.atk) {
      px(g,axR+B.rax,18+B.ra+cr,3,7,skin);
      px(g,axR+3+B.rax,20+B.ra,3,9,"#5a3a22"); // club grounded at side
      px(g,axR+3+B.rax,18+B.ra,3,3,"#7a5230");
      px(g,axR+4+B.rax,19+B.ra,1,1,"#c9c9d9"); px(g,axR+5+B.rax,21+B.ra,1,1,"#c9c9d9");
    } else {
      px(g,axR,12+cr,3,6,skin);
      px(g,axR+1,2+cr,3,12,"#5a3a22"); // club swung overhead
      px(g,axR,0+cr,5,4,"#7a5230");
      px(g,axR+1,1+cr,1,1,"#c9c9d9"); px(g,axR+3,3+cr,1,1,"#c9c9d9");
    }
    // head: big grin, horn nubs, ear fans
    px(g,10,6+cr,12,12,skin);
    px(g,4,9+cr,6,5,skin); px(g,22,9+cr,6,5,skin); // ear fans
    px(g,5,10+cr,4,2,lite); px(g,23,10+cr,4,2,lite);
    px(g,10,3+cr,3,3,dk); px(g,19,3+cr,3,3,dk); // horn nubs
    px(g,10,3+cr,3,1,"#e8e0d0");
    px(g,12,9+cr,3,3,"#ffe95e"); px(g,17,9+cr,3,3,"#ffe95e");
    px(g,13,10+cr,2,2,"#111"); px(g,18,10+cr,2,2,"#111");
    px(g,11,13+cr,10,3,"#4a0d06"); // grin
    px(g,12,13+cr,2,2,"#fff"); px(g,18,13+cr,2,2,"#fff"); // tusks up
    px(g,14,14+cr,4,1,"#fff");
    px(g,13,8+cr,3,1,deep); px(g,18,8+cr,2,1,deep); // angry brows
  };

  // ORC SHAMAN v3: hunched mystic — tattered hood, tusks, bead necklace,
  // feather fetishes, heavy robe (hem sway), skull staff that BOBS while
  // walking and BLAZES on cast/attack.
  D2.orc_shaman = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const skin=tint&&tint!=="#ffffff"?tint:"#5a8a3a", dk=shade(skin,-45), deep=shade(skin,-70), lite=shade(skin,40);
    const robe="#4a3a5a", robeD="#33253f", robeL="#6a5a7a";
    const cr=B.crouch?1:0;
    // robe hem sways with stride
    const sw=P.moving?((P.f&1)?1:-1):0;
    px(g,8+sw,28+cr,6,7,robe); px(g,18-sw,28+cr,6,7,robe);
    px(g,8+sw,28+cr,6,1,robeL); px(g,18-sw,28+cr,6,1,robeL);
    // feet shuffle under robe
    px(g,10+B.lx,34+B.ld,4,2,skin); px(g,18+B.rx,34+B.rd,4,2,skin);
    // torso: robe + fur stole + bead necklace
    px(g,9,17+cr,14,12,robe);
    px(g,9,17+cr,14,1,robeL);
    px(g,9,19+cr,14,3,"#6a5a3a"); // fur stole
    px(g,11,22+cr,10,2,"#c9a227"); // beads
    px(g,13,22+cr,1,2,"#c02040"); px(g,17,22+cr,1,2,"#2a9e9e");
    // feather fetishes on shoulders
    px(g,6+B.lax,16+cr+B.la,2,5,"#c02040"); px(g,24+B.rax,16+cr+B.ra,2,5,"#2a9e9e");
    // left arm: clawed, bangles
    const axL=B.wide?5:7;
    px(g,axL+B.lax,19+B.la+cr,3,6,skin); px(g,axL+B.lax,24+B.la,3,1,"#c9a227");
    // right arm + SKULL STAFF: bobs while walking, raised + blazing on atk
    const staffBob = P.moving?[0,-1,0,1][P.f&3]:0;
    if (!P.atk) {
      px(g,22+B.rax,19+B.ra+cr,3,6,skin);
      px(g,25,10+cr+staffBob,2,20,"#5a3a22"); // staff grounded-side
      px(g,24,7+cr+staffBob,4,4,"#e8e0d0"); // skull head
      px(g,25,8+cr+staffBob,1,2,"#111"); px(g,27,8+cr+staffBob,1,2,"#111");
    } else {
      px(g,22,13+cr,3,6,skin); // arm thrown up
      px(g,24,2+cr,2,14,"#5a3a22");
      px(g,23,0+cr,4,4,"#fff"); // skull BLAZES
      px(g,24,1+cr,1,2,"#ffb43d"); px(g,26,1+cr,1,2,"#ffb43d");
      px(g,23,4+cr,4,1,"#ffb43d");
    }
    // head: hood frames a tusked face
    px(g,10,7+cr,12,10,skin);
    px(g,8,4+cr,16,6,robe); px(g,8,4+cr,16,1,robeL); // hood crown
    px(g,8,6+cr,3,10,robe); px(g,21,6+cr,3,10,robe); // hood sides
    px(g,9,5+cr,2,3,robeD); px(g,21,5+cr,2,3,robeD);
    px(g,12,10+cr,3,3,"#ffe95e"); px(g,17,10+cr,3,3,"#ffe95e");
    px(g,13,11+cr,2,2,"#111"); px(g,18,11+cr,2,2,"#111");
    px(g,10,7+cr,4,2,deep); px(g,18,7+cr,4,2,deep); // heavy brow
    px(g,12,13+cr,8,3,"#3a2010");
    px(g,13,13+cr,2,3,"#fff"); px(g,17,13+cr,2,3,"#fff"); // tusks up
    px(g,15,13+cr,2,1,"#fff");
    px(g,13,5+cr,1,2,skin); // wart
  };

  // KAPPA v3: turtle yokai — beaked face, head DISH with shimmering water,
  // shell back-plates, webbed feet marching, sumo stance (arms wide).
  D2.kappa = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const skin=tint&&tint!=="#ffffff"?tint:"#4a9e6a", dk=shade(skin,-45), deep=shade(skin,-70), lite=shade(skin,40);
    const shell="#3a5a3a", shellD="#243824", shellL="#5a7a4a";
    const cr=B.crouch?1:0;
    // WEBBED FEET march (wide sumo stance)
    px(g,7+B.lx,30+B.ld,5,4,skin); px(g,20+B.rx,30+B.rd,5,4,skin);
    px(g,6+B.lx,33+B.ld,7,2,dk); px(g,19+B.rx,33+B.rd,7,2,dk);
    px(g,6+B.lx,33+B.ld,2,2,lite); px(g,24+B.rx,33+B.rd,2,2,lite); // toe webbing
    // shell plates on the shoulders/back rim
    px(g,6,18+cr,3,8,shell); px(g,23,18+cr,3,8,shell);
    px(g,6,18+cr,3,1,shellL); px(g,23,18+cr,3,1,shellL);
    px(g,7,20+cr,1,4,shellD); px(g,24,20+cr,1,4,shellD);
    // torso: green belly + shell belt
    px(g,9,18+cr,14,12,skin);
    px(g,11,20+cr,10,7,lite);
    px(g,9,26+cr,14,3,shell); px(g,9,26+cr,14,1,shellL);
    // arms: sumo-wide, clawed
    px(g,5+B.lax,20+B.la+cr,3,6,skin); px(g,24+B.rax,20+B.ra+cr,3,6,skin);
    px(g,5+B.lax,25+B.la,3,2,dk); px(g,24+B.rax,25+B.ra,3,2,dk);
    // head: beak + head DISH with water (shimmer swaps with idle bucket)
    px(g,10,7+cr,12,10,skin);
    px(g,13,11+cr,6,4,"#e8b93d"); // beak
    px(g,14,12+cr,4,2,"#8a6a1a");
    px(g,15,13+cr,2,1,"#5a3a10");
    px(g,11,9+cr,3,3,"#fff"); px(g,18,9+cr,3,3,"#fff"); // round eyes
    px(g,12,10+cr,2,2,"#111"); px(g,19,10+cr,2,2,"#111");
    // dish: bald plate + water that SHIMMERS
    px(g,11,4+cr,10,3,skin);
    const wsh = P.moving?((P.f&1)?"#7ff3ff":"#3a9ebb"):(P.idle?"#7ff3ff":"#3a9ebb");
    px(g,12,4+cr,8,2,wsh);
    px(g,12,4+cr,8,1,"#d8f4ff");
    px(g,11,3+cr,10,1,dk); // dish rim
  };

  // KOBOLD v3: rat-dog skirmisher — long snout, big round ears, rag tunic,
  // rope tail whipping, digitigrade legs marching, spear thrust on atk.
  D2.kobold = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const fur=tint&&tint!=="#ffffff"?tint:"#7a6a3a", dk=shade(fur,-45), deep=shade(fur,-65), lite=shade(fur,40);
    const cr=B.crouch?1:0;
    // rope tail whips
    const tw = slx(P,0,1);
    px(g,4+tw,27+cr,4,2,fur); px(g,3+tw,25+cr,2,3,fur); px(g,3+tw,25+cr,1,1,dk);
    // digitigrade legs: haunch + shank, marching
    px(g,10+B.lx,27+B.ld,4,4,fur); px(g,10+B.lx,30+B.ld,3,4,dk);
    px(g,18+B.rx,27+B.rd,4,4,fur); px(g,19+B.rx,30+B.rd,3,4,dk);
    px(g,9+B.lx,33+B.ld,4,2,deep); px(g,19+B.rx,33+B.rd,4,2,deep);
    // rag tunic with rope belt
    px(g,9,19+cr,14,9,shade(fur,20));
    px(g,9,19+cr,14,1,lite);
    px(g,9,24+cr,14,2,"#4a3a22");
    px(g,15,19+cr,2,5,deep); px(g,18,20+cr,1,4,deep); // tears
    // arms: left torch? no — left claws, right spear (thrust east on atk)
    const axL=B.wide?6:7, axR=B.wide?22:21;
    px(g,axL+B.lax,20+B.la+cr,3,5,fur); px(g,axL+B.lax,24+B.la,3,1,dk);
    if (!P.atk) {
      px(g,axR+B.rax,20+B.ra+cr,3,5,fur);
      px(g,axR+1,12,2,14,"#5a3a22"); // spear held upright
      px(g,axR,10,4,2,"#8a8a9a"); px(g,axR+1,10,1,1,"#fff");
    } else {
      px(g,axR,18+cr,3,5,fur); // arm thrust forward
      px(g,20,20+cr,10,2,"#5a3a22"); // spear levelled east
      px(g,29,19+cr,3,3,"#8a8a9a"); px(g,30,19+cr,1,1,"#fff");
    }
    // head: long snout east, big round ears
    px(g,10,7+cr,11,9,fur);
    px(g,5,4+cr,6,6,fur); px(g,21,4+cr,6,6,fur); // round ears
    px(g,6,5+cr,4,4,lite); px(g,22,5+cr,4,4,lite);
    px(g,6,6+cr,2,2,dk); px(g,24,6+cr,2,2,dk); // inner ear
    px(g,18,10+cr,6,4,fur); // snout
    px(g,22,12+cr,2,2,"#000"); // nose
    px(g,18,13+cr,5,1,"#3a2010"); // mouth
    px(g,19,13+cr,1,1,"#fff"); // tooth
    // bead eyes
    px(g,12,9+cr,3,3,"#111"); px(g,13,9+cr,1,1,"#fff");
    // head rag band
    px(g,10,7+cr,11,2,"#8a3a2a");
  };

  // YUKI ONNA v3: NO LEGS — she floats. Kimono hem ripples (edge pixels
  // cycle with f/idle), long black hair sways, obi sash, snow motes drift,
  // sleeves billow; atk = sleeves flung wide + snow burst.
  D2.yuki_onna = (g,tint,ph)=>{
    const P=N(ph);
    const silk=tint&&tint!=="#ffffff"?tint:"#e8ecf2", dk=shade(silk,-40), deep="#8a92a8", obi="#3a4a8a";
    const sway = P.moving?[0,2,-1,1][P.f&3]:(P.idle?1:-1);
    const cr = P.hurt?2:0;
    // SNOW MOTES drifting around her (positions cycle with stride/idle)
    const m1=(P.moving?P.f:P.idle*2)&3;
    if (m1!==2) px(g,4,10+cr+m1,2,2,"#fff");
    if (m1!==0) px(g,26,14+cr-m1,2,2,"#d8ecff");
    if (m1===1||m1===3) px(g,6,26+cr,1,1,"#fff");
    // kimono: white column, hem RIPPLES (edge teeth alternate)
    px(g,10,18+cr,12,14,silk);
    px(g,10,18+cr,12,1,dk);
    for(let i=0;i<6;i++){
      const drop = [0,1,2,1][(i+(P.moving?P.f:P.idle))&3];
      px(g,10+i*2,30+cr+drop,2,2-drop,silk);
    }
    px(g,10,30+cr,12,1,"#7fd4ff"); // frost hem trim
    // obi sash + cord
    px(g,10,24+cr,12,3,obi); px(g,10,25+cr,12,1,"#8ab0ff");
    px(g,14,24+cr,4,3,"#2a3a6a");
    // collar V
    px(g,13,18+cr,6,4,silk); px(g,14,18+cr,4,3,dk); px(g,15,18+cr,2,2,"#d8b8c8");
    // SLEEVES billow: sway with stride, flung wide on atk
    const slL=P.atk?4:6, slR=P.atk?22:20;
    px(g,slL,19+sway+cr,4,8,silk); px(g,slL,19+sway+cr,4,1,dk);
    px(g,slR,19-sway+cr,4,8,silk); px(g,slR,19-sway+cr,4,1,dk);
    px(g,slL+1,26+sway+cr,2,2,"#d8ecff"); px(g,slR+1,26-sway+cr,2,2,"#d8ecff");
    if (P.atk) { // snow burst from both sleeves
      px(g,slL-2,22+cr,2,2,"#fff"); px(g,slL-3,24+cr,1,1,"#d8ecff");
      px(g,slR+4,22+cr,2,2,"#fff"); px(g,slR+5,24+cr,1,1,"#d8ecff");
    }
    // arms barely visible inside sleeves
    px(g,slL+1,20+sway+cr,2,4,"#f2d8d0"); px(g,slR+1,20-sway+cr,2,4,"#f2d8d0");
    // HEAD: pale face, black hair mass swaying, red lips, dark eyes
    px(g,11,6+cr,10,10,"#f6e8e4");
    px(g,9,3+cr+sway,4,14,"#14141c"); px(g,19,3+cr-sway,4,14,"#14141c"); // hair falls
    px(g,10,3+cr,12,4,"#14141c"); px(g,11,3+cr,10,1,"#3a3a4a"); // crown sheen
    px(g,10,5+cr,2,6,"#14141c"); px(g,20,5+cr,2,6,"#14141c");
    // dark hollow eyes (no white — ghost)
    px(g,13,9+cr,3,3,"#1a1a2a"); px(g,17,9+cr,3,3,"#1a1a2a");
    px(g,14,10+cr,1,1,"#7fd4ff"); px(g,18,10+cr,1,1,"#7fd4ff");
    px(g,15,12+cr,2,1,"#c02040"); // small red mouth
    // snow crown sparkle
    px(g,14,2+cr,1,1,P.idle?"#fff":"#7fd4ff"); px(g,17,3+cr,1,1,P.idle?"#7fd4ff":"#fff");
  };

  // TROLL WHELP v3: stocky brute — huge nose, wart field, moss patches,
  // stubby arms swinging WIDE, bowed legs stomping, club? no — claws.
  D2.troll_whelp = (g,tint,ph)=>{
    const P=N(ph), B=biped(P);
    const hide=tint&&tint!=="#ffffff"?tint:"#5a7d4a", dk=shade(hide,-45), deep=shade(hide,-65), lite=shade(hide,40);
    const moss="#3d6b35", wart="#7a8a3a";
    const cr=B.crouch?1:0;
    // BOWED LEGS stomp
    px(g,8+B.lx,28+B.ld,5,6,hide); px(g,19+B.rx,28+B.rd,5,6,hide);
    px(g,9+B.lx,30+B.ld,3,3,dk); px(g,20+B.rx,30+B.rd,3,3,dk);
    px(g,7+B.lx,33+B.ld,7,2,deep); px(g,18+B.rx,33+B.rd,7,2,deep);
    // whelp belly + moss patches
    px(g,8,19+cr,16,10,hide);
    px(g,10,21+cr,12,5,lite);
    px(g,9,20+cr,3,2,moss); px(g,20,24+cr,4,3,moss); px(g,12,26+cr,3,2,moss);
    px(g,11,20+cr,1,1,wart); px(g,22,22+cr,1,1,wart); px(g,14,25+cr,1,1,wart); // warts
    // STUBBY ARMS swing wide
    const axL=B.wide?4:6, axR=B.wide?22:20;
    px(g,axL+B.lax,20+B.la+cr,4,6,hide); px(g,axL+B.lax,25+B.la,4,2,dk);
    px(g,axR+B.rax,20+B.ra+cr,4,6,hide); px(g,axR+B.rax,25+B.ra,4,2,dk);
    px(g,axL+B.lax,25+B.la,2,1,"#e8e0d0"); px(g,axR+2+B.rax,25+B.ra,2,1,"#e8e0d0"); // claws
    // HEAD: low brow, HUGE nose, underbite
    px(g,9,6+cr,14,12,hide);
    px(g,9,6+cr,14,2,dk); // brow shadow
    px(g,11,9+cr,3,3,"#ffe95e"); px(g,18,9+cr,3,3,"#ffe95e");
    px(g,12,10+cr,2,2,"#111"); px(g,19,10+cr,2,2,"#111");
    px(g,11,8+cr,4,1,deep); px(g,17,8+cr,4,1,deep);
    // the nose: big, warty, dominant
    px(g,13,11+cr,6,5,shade(hide,-15));
    px(g,14,13+cr,1,1,deep); px(g,17,13+cr,1,1,deep); // nostrils
    px(g,14,11+cr,1,1,wart);
    px(g,11,15+cr,10,2,"#3a2410"); // underbite mouth
    px(g,13,15+cr,2,2,"#fff"); px(g,17,15+cr,2,2,"#fff"); // lower tusks
    // mossy scalp tufts
    px(g,10,4+cr,3,3,moss); px(g,19,4+cr,3,3,moss); px(g,14,3+cr,4,3,dk);
  };

  const prevActor = window.Sprites.actor;
  const cache = new Map();
  const CACHE_MAX = 800;
  try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(()=>cache.clear()); } catch(e){}
  function bucketOf(P){
    if (P.hurt) return "H"+((P.f&1));
    if (P.atk) return "A";
    if (P.moving) return "M"+(P.f&3);
    return "I"+(P.idle&1);
  }
  window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
    try {
      if (D2[kind]) {
        gen = (gen === "male" || gen === "female") ? gen : "";
        const P = N(ph);
        const ck = "an1|"+kind+"|"+(tint||"#fff")+"|"+gen+"|"+bucketOf(P);
        let hit = null; try { hit = cache.get(ck); } catch(e){}
        if (hit) return hit;
        const c = cv(); const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
        g.clearRect(0,0,32,40);
        g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
        try { D2[kind](g, tint || "#fff", P); } catch(e){}
        let out = c;
        try { out = window.Sprites.genderFX(c, gen); } catch(e){}
        try { cache.set(ck, out); if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value); } catch(e){}
        return out;
      }
    } catch(e){}
    return prevActor.call(this,kind,tint,seed,gear,app,gen,ph);
  };
  window.__D2 = D2;
})();
