/* Normal mobs v1 — bespoke silhouettes for all 92 non-boss kinds.
   Loaded AFTER bosses.js, wraps window.Sprites.actor.
   Rubric: silhouette / theme / readability / palette / props / composition. Target >=8.
   Batch 1: classics + mounts + Greek.
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
  // ---- classics (polished, keep identity but push to 8+) ----
  D.slime = (g,tint)=>{
    const dk=shade(tint,-30);
    g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,28,12,9,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,26,11,8,0,0,7); g.fill();
    g.fillStyle="rgba(255,255,255,0.65)"; g.beginPath(); g.ellipse(11,21,4,3,-0.4,0,0,7); g.fill();
    g.fillStyle="#101418"; g.fillRect(11,25,3,5); g.fillRect(19,25,3,5);
    g.fillStyle="#fff"; g.fillRect(11,25,1,2); g.fillRect(19,25,1,2);
    g.fillStyle="#101418"; g.fillRect(14,30,4,2);
    px(g,15,32,5,2,"rgba(255,255,255,0.35)");
  };
  D.bat = (g,tint)=>{
    const dk=shade(tint,-30);
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(15,23); g.lineTo(1,11); g.lineTo(4,18); g.lineTo(7,17); g.lineTo(9,24); g.fill();
    g.beginPath(); g.moveTo(17,23); g.lineTo(31,11); g.lineTo(28,18); g.lineTo(25,17); g.lineTo(23,24); g.fill();
    px(g,3,13,3,2,tint); px(g,26,13,3,2,tint);
    px(g,12,12,2,5,"#2e2138"); px(g,18,12,2,5,"#2e2138");
    px(g,11,16,10,10,"#3a2b4f"); px(g,12,18,8,7,"#46345c");
    g.fillStyle="#ff3b3b"; g.fillRect(13,20,2,3); g.fillRect(17,20,2,3);
    g.fillStyle="#fff"; g.fillRect(13,20,1,1); g.fillRect(17,20,1,1);
    g.fillStyle="#fff"; g.fillRect(14,24,1,2); g.fillRect(17,24,1,2);
  };
  D.goblin = (g,tint)=>{
    const skin="#58a34d", dk="#2f7a2f";
    g.fillStyle=skin;
    g.beginPath(); g.moveTo(10,13); g.lineTo(1,10); g.lineTo(3,16); g.fill();
    g.beginPath(); g.moveTo(22,13); g.lineTo(31,10); g.lineTo(29,16); g.fill();
    px(g,11,31,4,5,dk); px(g,17,31,4,5,dk); px(g,10,35,5,2,"#5a3a22"); px(g,17,35,5,2,"#5a3a22");
    px(g,9,21,14,11,tint); px(g,9,29,14,3,dk); px(g,13,24,6,8,"#6b4226");
    px(g,6,22,3,8,skin); px(g,23,22,3,8,skin);
    px(g,9,8,14,12,skin); px(g,10,9,12,3,"#6fbf63"); px(g,9,12,14,3,"#3f7d36");
    g.fillStyle="#ffe14d"; g.fillRect(11,14,4,3); g.fillRect(18,14,4,3);
    g.fillStyle="#111"; g.fillRect(13,14,2,3); g.fillRect(19,14,2,3);
    px(g,14,17,4,3,"#3f7d36"); g.fillStyle="#fff"; g.fillRect(13,20,1,2); g.fillRect(18,20,1,2);
    px(g,25,24,2,8,"#cccccc"); px(g,24,31,4,2,"#6b4226");
  };
  D.wolf = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,2,22,4,3,dk); px(g,1,20,2,3,dk);
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25)); px(g,6,24,3,8,dk);
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,16,8,10,tint); px(g,23,17,6,3,shade(tint,30));
    px(g,22,14,3,4,tint); px(g,27,14,3,4,tint);
    px(g,27,21,5,4,"#d9c9b8"); px(g,30,22,2,2,"#111");
    g.fillStyle="#ffd93d"; g.fillRect(24,20,2,2); g.fillStyle="#111"; g.fillRect(24,20,1,1);
    px(g,8,24,5,2,"rgba(255,255,255,0.25)");
  };
  D.mushroom = (g,tint)=>{
    px(g,10,30,4,6,"#8a6a4a"); px(g,18,30,4,6,"#8a6a4a");
    px(g,11,22,10,12,"#f2e3c2"); px(g,12,24,8,8,"#e8d0a8");
    g.fillStyle="#101418"; g.fillRect(13,26,2,3); g.fillRect(17,26,2,3);
    g.fillStyle=tint; g.fillRect(5,12,22,10); g.fillRect(6,8,20,8); g.fillRect(9,5,14,5);
    g.fillStyle="rgba(255,255,255,0.85)"; g.fillRect(9,10,4,4); g.fillRect(18,9,4,4); g.fillRect(14,15,4,4);
    px(g,5,20,22,2,shade(tint,-45));
  };
  // ---- mounts: each reads as its element at a glance ----
  D.wild_horse = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,0,20,4,5,dk); px(g,0,18,3,4,"#3a2415");
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,12,4,9,"#3a2415"); px(g,22,8,4,6,"#3a2415"); px(g,23,9,2,9,"#111");
    px(g,22,16,8,10,tint); px(g,23,17,6,3,shade(tint,25));
    px(g,27,21,4,3,"#e8d9c0"); px(g,29,22,2,1,"#111");
    g.fillStyle="#111"; g.fillRect(24,19,2,2); g.fillStyle="#fff"; g.fillRect(24,19,1,1);
    px(g,8,26,10,2,"#a02040"); px(g,8,26,10,1,"#d06080");
  };
  D.tide_turtle = (g,tint)=>{
    px(g,1,26,5,4,"#3a7a5a"); px(g,26,26,5,4,"#3a7a5a");
    px(g,6,22,20,7,"#2a5a42"); px(g,9,19,14,6,"#4a9a72");
    px(g,12,20,2,3,"#d9e8c9"); px(g,16,20,2,3,"#d9e8c9"); px(g,21,20,2,3,"#d9e8c9");
    px(g,9,22,14,2,"#7ad9f0"); px(g,9,22,2,2,"#fff");
    px(g,22,16,8,8,tint); px(g,23,17,6,2,shade(tint,25));
    g.fillStyle="#111"; g.fillRect(24,19,2,2);
    px(g,27,20,4,3,"#d9c9b8");
  };
  D.cinder_steed = (g,tint)=>{
    const dk="#5a1408";
    px(g,0,20,4,6,"#ff7b2e"); px(g,1,18,2,4,"#ffd93d");
    px(g,6,24,19,8,tint); px(g,6,24,19,2,"#ff8a4a");
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,7,31,3,1,"#ff9d2e"); px(g,22,31,3,1,"#ff9d2e");
    px(g,22,8,4,10,"#ff7b2e"); px(g,23,8,2,8,"#ffd93d");
    px(g,22,16,8,10,tint); px(g,27,21,4,3,"#3a0f08"); px(g,28,22,3,2,"#ffd93d");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    px(g,8,26,10,2,"#5c1216");
  };
  D.magma_tortoise = (g,tint)=>{
    px(g,1,26,5,4,"#7a2a1a"); px(g,26,26,5,4,"#7a2a1a");
    px(g,6,22,20,7,"#3a1210"); px(g,9,19,14,6,"#7a2a1a");
    px(g,12,20,2,3,"#ff7b2e"); px(g,16,20,3,4,"#ffd93d"); px(g,21,20,2,3,"#ff7b2e");
    px(g,12,20,2,1,"#fff"); px(g,16,20,3,1,"#fff");
    px(g,22,16,7,8,tint); g.fillStyle="#111"; g.fillRect(24,19,2,2);
    px(g,27,20,4,3,"#8a5a33");
  };
  D.skeleton = (g,tint)=>{
    const bone="#e8e4d8";
    px(g,11,30,3,6,bone); px(g,18,30,3,6,bone); px(g,10,36,5,1,bone); px(g,17,36,5,1,bone);
    px(g,6,20,3,8,bone); px(g,23,20,3,8,bone);
    px(g,14,18,4,13,bone); g.fillStyle="#1a1a1f"; for(let i=0;i<4;i++) g.fillRect(11,20+i*3,10,1);
    px(g,10,5,12,11,bone); px(g,12,3,8,3,bone);
    g.fillStyle="#1a1a1f"; g.fillRect(12,8,4,5); g.fillRect(17,8,4,5);
    g.fillStyle="#ff3b3b"; g.fillRect(13,10,1,1); g.fillRect(18,10,1,1);
    px(g,15,10,2,4,"#9a968a"); g.fillStyle="#1a1a1f"; for(let x=0;x<4;x++) g.fillRect(12+x*3,15,1,2);
    px(g,25,14,2,12,"#9aa0a8"); px(g,24,25,4,3,"#5a3a22");
  };
  D.cultist = (g,tint)=>{
    const dk=shade(tint,-45);
    px(g,9,28,14,8,dk); px(g,10,18,12,12,tint); px(g,13,18,6,12,shade(tint,18));
    px(g,6,19,3,9,dk); px(g,23,19,3,9,dk);
    px(g,8,2,16,9,tint); px(g,8,2,3,15,tint); px(g,21,2,3,15,tint);
    px(g,11,6,10,9,"#0c0a12"); g.fillStyle="#c77dff"; g.fillRect(12,10,2,2); g.fillRect(18,10,2,2);
    px(g,9,24,14,2,dk); px(g,14,24,4,3,"#ffd93d");
    px(g,25,12,2,14,"#5a3a22"); px(g,24,8,4,5,"#c77dff");
  };
  D.wraith = (g,tint)=>{
    const sh="rgba(126,196,212,0.95)", mid="rgba(178,238,246,0.95)", dk="rgba(70,130,145,0.95)";
    px(g,13,4,6,2,sh); px(g,11,6,10,2,sh); px(g,10,8,12,3,sh); px(g,9,11,14,4,sh);
    px(g,9,11,2,17,dk); px(g,21,11,2,17,dk);
    px(g,11,15,10,13,sh); px(g,12,16,8,11,mid); px(g,15,16,1,11,"rgba(70,130,145,0.5)");
    px(g,13,12,6,3,"#0a1a20"); px(g,13,15,5,3,"#0a1a20"); px(g,14,13,4,6,"#060f14");
    g.fillStyle="#e2feff"; g.fillRect(14,14,1,3); g.fillRect(17,15,1,3);
    px(g,7,19,3,7,sh); px(g,22,17,3,7,sh);
    g.fillStyle=sh; g.fillRect(10,27,3,9); g.fillRect(14,27,2,5); g.fillRect(17,27,4,10); g.fillRect(22,27,2,6);
  };
  // ---- Greek: juveniles read as young/small, never boss clones ----
  D.lesser_wyvern = (g,tint)=>{
    const dk=shade(tint,-35);
    g.fillStyle=dk;
    g.beginPath(); g.moveTo(14,22); g.lineTo(3,12); g.lineTo(5,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(29,12); g.lineTo(27,17); g.fill();
    px(g,11,28,3,6,dk); px(g,18,28,3,6,dk);
    px(g,10,16,12,13,tint); px(g,12,18,8,8,shade(tint,25));
    px(g,14,23,4,3,"#fff");
    px(g,18,10,6,8,tint); g.fillStyle="#ffe14d"; g.fillRect(20,12,2,2); g.fillStyle="#111"; g.fillRect(20,12,1,2);
    px(g,2,22,5,2,dk); px(g,3,24,3,2,"#fff");
  };
  D.velociraptor = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,2,18,8,3,dk); px(g,1,16,3,4,dk);
    px(g,12,26,4,6,dk); px(g,18,26,4,6,dk); px(g,12,31,4,2,"#222"); px(g,18,31,4,1,"#c9ccd4");
    px(g,11,16,10,12,tint); px(g,11,16,10,2,shade(tint,30));
    px(g,9,24,2,5,tint); px(g,21,24,2,5,tint);
    px(g,15,8,10,8,tint); px(g,22,12,5,4,"#e8d9b8"); px(g,25,13,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(18,10,2,2); g.fillStyle="#111"; g.fillRect(18,10,1,2);
    px(g,11,18,3,6,shade(tint,30));
  };
  D.minotaur_calf = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,18,14,13,tint); px(g,11,20,10,9,shade(tint,18));
    px(g,11,6,10,9,tint);
    g.fillStyle="#e8e0d0"; g.beginPath(); g.moveTo(11,7); g.lineTo(6,1); g.lineTo(9,10); g.fill();
    g.beginPath(); g.moveTo(21,7); g.lineTo(26,1); g.lineTo(23,10); g.fill();
    px(g,13,11,6,4,"#d9a0a0"); g.fillStyle="#ffe14d"; g.fillRect(12,9,3,2); g.fillRect(18,9,2,1);
    g.fillStyle="#111"; g.fillRect(13,9,1,2);
    px(g,13,15,6,1,"#7a1f1f");
    px(g,25,20,3,8,"#6b4226");
  };
  D.harpy = (g,tint)=>{
    const dk=shade(tint,-35);
    g.fillStyle=shade(tint,15);
    g.beginPath(); g.moveTo(14,22); g.lineTo(3,12); g.lineTo(5,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(29,12); g.lineTo(27,17); g.fill();
    px(g,11,28,3,8,dk); px(g,18,28,3,8,dk);
    px(g,10,15,12,14,tint); px(g,12,17,8,9,shade(tint,25));
    px(g,9,6,14,8,"#e8b060"); px(g,12,20,8,4,"#d9a0a0");
    g.fillStyle="#111"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
    g.fillStyle="#fff"; g.fillRect(14,22,1,2); g.fillRect(17,22,1,2);
    px(g,14,23,4,3,"#e8a020");
  };
  D.cyclops_whelp = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,16,14,15,tint); px(g,11,18,10,11,shade(tint,15));
    px(g,11,6,10,9,tint); px(g,11,6,10,2,shade(tint,-25));
    g.fillStyle="#ffe14d"; g.fillRect(14,9,4,4); g.fillStyle="#111"; g.fillRect(15,10,2,2);
    g.fillStyle="#fff"; g.fillRect(15,9,1,1);
    px(g,25,20,3,8,"#6b4226"); px(g,25,18,5,3,"#888");
  };
  D.satyr = (g,tint)=>{
    px(g,11,30,4,6,"#3a2a1a"); px(g,17,30,4,6,"#3a2a1a");
    px(g,9,20,14,12,tint); px(g,13,24,6,4,"#8a5a33");
    px(g,6,21,3,7,tint); px(g,23,21,3,7,tint);
    px(g,9,9,14,11,tint);
    px(g,5,2,4,8,"#e8e0d0"); px(g,23,2,4,8,"#e8e0d0"); px(g,6,0,2,4,"#8a6a4a"); px(g,24,0,2,4,"#8a6a4a");
    g.fillStyle="#ffe14d"; g.fillRect(12,13,3,2); g.fillRect(18,13,2,1); g.fillStyle="#111"; g.fillRect(13,13,1,2);
    px(g,13,17,6,1,"#101418");
    px(g,25,18,2,8,"#8a5a33"); px(g,23,20,6,2,"#c9a227"); px(g,24,20,4,1,"#111");
  };
  D.siren = (g,tint)=>{
    const dk=shade(tint,-35);
    g.fillStyle=shade(tint,20);
    g.beginPath(); g.moveTo(14,22); g.lineTo(3,12); g.lineTo(5,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(29,12); g.lineTo(27,17); g.fill();
    px(g,11,28,3,8,dk); px(g,18,28,3,8,dk); px(g,10,28,12,4,"#2a6a7a");
    px(g,10,15,12,14,tint);
    px(g,9,4,14,7,"#e8f0ff"); px(g,9,4,3,12,"#e8f0ff"); px(g,20,4,3,12,"#e8f0ff");
    px(g,11,9,10,8,"#f2c9b8"); g.fillStyle="#111"; g.fillRect(13,11,2,2); g.fillRect(17,11,2,2);
    px(g,14,15,4,1,"#c94040"); px(g,12,22,8,3,"#a02040"); g.fillStyle="#fff"; g.fillRect(14,22,1,1); g.fillRect(17,22,1,1);
  };
  D.centaur_foal = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,2,24,4,3,dk); px(g,4,26,17,6,tint); px(g,4,26,17,2,shade(tint,25));
    px(g,5,31,3,5,dk); px(g,10,31,3,5,dk); px(g,15,31,3,5,dk);
    px(g,18,12,6,12,tint); px(g,14,14,4,6,tint);
    px(g,17,6,8,8,"#d9a06b"); px(g,18,7,6,2,"#8a5a33");
    g.fillStyle="#111"; g.fillRect(19,10,2,2); px(g,24,16,2,8,"#8a5a33");
    px(g,8,28,5,2,"#3a6a9a"); px(g,9,28,3,1,"#fff");
  };
  D.stymphalian = (g,tint)=>{
    px(g,11,28,3,8,"#5a5a1a"); px(g,18,28,3,8,"#5a5a1a");
    g.fillStyle="#c9a227";
    g.beginPath(); g.moveTo(14,22); g.lineTo(2,12); g.lineTo(5,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(30,12); g.lineTo(27,17); g.fill();
    g.fillStyle="#fff"; g.fillRect(5,12,4,1); g.fillRect(23,12,4,1);
    px(g,10,15,12,13,"#c9a227"); px(g,12,17,8,9,"#e8d060");
    px(g,12,6,8,4,"#8a6a1a"); px(g,14,22,4,4,"#e8a020");
    g.fillStyle="#111"; g.fillRect(13,19,2,2); g.fillRect(17,19,1,2);
    px(g,10,26,12,2,"#8a6a1a");
  };
  D.gorgon_spawn = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-35)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,tint); px(g,9,14,3,10,shade(tint,30)); px(g,20,14,3,10,shade(tint,30));
    px(g,12,8,8,8,tint);
    for(let i=0;i<3;i++){ px(g,10+i*5,3,3,6,"#2e7d46"); px(g,11+i*5,4,1,1,"#ffe14d"); }
    g.fillStyle="#ffe14d"; g.fillRect(13,10,2,2); g.fillRect(18,10,1,2); g.fillStyle="#111"; g.fillRect(13,10,1,2);
    px(g,15,14,2,3,"#a02020");
  };
  D.hydra_spawn = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,9,28,14,8,dk); px(g,11,26,10,5,tint);
    px(g,10,25,3,3,"#e8e0d0");
    const hx=[7,13,20];
    hx.forEach((x,i)=>{
      const y=12-(i===1?3:0);
      px(g,x,y+6,2,7,tint); px(g,x-1,y,5,6,tint);
      g.fillStyle="#ffe14d"; g.fillRect(x,y+3,1,1); g.fillRect(x+3,y+3,1,1);
    });
    px(g,13,14,2,2,"#7a1f1f");
    px(g,12,26,8,2,"#ff9d9d");
  };
  D.chimera_cub = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,8,22,6,4,"#e8c020"); px(g,6,12,4,6,"#e8e0d0");
    px(g,22,16,8,10,"#c96b2e"); px(g,27,22,3,8,"#2e7d46");
    g.fillStyle="#111"; g.fillRect(24,19,2,2);
    px(g,27,21,4,3,"#d9c9b8");
  };
  // ---- Norse ----
  D.kobold = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,9,20,14,2,shade(tint,25));
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(4,4); g.lineTo(8,12); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(28,4); g.lineTo(24,12); g.fill();
    px(g,9,9,14,11,tint); px(g,13,16,6,3,shade(tint,-50)); px(g,15,17,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(11,12,3,2); g.fillRect(18,12,2,1); g.fillStyle="#111"; g.fillRect(12,13,1,1);
    px(g,28,24,3,6,shade(tint,-30)); px(g,14,2,4,4,"#ffd93d"); px(g,15,1,2,2,"#ff9d2e");
  };
  D.draugr = (g,tint)=>{
    px(g,11,30,3,6,"#e8e4d8"); px(g,18,30,3,6,"#e8e4d8");
    px(g,9,20,14,11,"#3a3a42"); px(g,11,20,10,11,"#6a7a6a");
    g.fillStyle="#1a1a1f"; for(let i=0;i<3;i++) g.fillRect(12,22+i*3,8,1);
    px(g,10,8,12,10,"#e8e4d8"); px(g,12,10,8,6,"#1a3a2a");
    g.fillStyle="#7fd4ff"; g.fillRect(13,12,2,2); g.fillRect(18,12,1,2);
    px(g,24,16,2,10,"#6a7a6a"); px(g,9,16,3,3,"#2a5a3a");
  };
  D.troll_whelp = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,16,14,15,tint); px(g,11,18,10,11,shade(tint,20));
    px(g,14,10,4,3,"#8a9a6a"); px(g,12,20,3,3,"#6a8a4a"); px(g,18,24,3,3,"#6a8a4a");
    g.fillStyle="#ffe14d"; g.fillRect(12,9,3,2); g.fillRect(18,9,2,1); g.fillStyle="#111"; g.fillRect(13,9,1,2);
    px(g,5,4,6,4,"#4a6a3a"); px(g,13,24,6,2,"#101418");
  };
  D.fenrir_pup = (g,tint)=>{
    const dk=shade(tint,-30);
    px(g,1,20,3,3,dk); px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,14,3,6,"#111"); px(g,27,14,3,6,"#111");
    px(g,22,16,8,10,tint); px(g,27,21,4,3,"#d9c9b8"); px(g,30,22,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  };
  D.hulder = (g,tint)=>{
    px(g,11,30,4,6,"#3a2a1a"); px(g,17,30,4,6,"#3a2a1a");
    px(g,9,20,14,12,tint); px(g,12,21,8,2,"#3a6a2a");
    px(g,9,9,14,11,"#e8c9a0"); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    px(g,8,4,16,6,"#f2e3c2"); px(g,8,4,3,12,"#f2e3c2"); px(g,21,4,3,12,"#f2e3c2");
    px(g,12,5,8,2,"#d9b96a"); px(g,26,26,3,8,"#8a5a33");
  };
  D.nokk = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,12,21,8,6,shade(tint,25));
    px(g,7,4,5,14,"#7ad9f0"); px(g,20,4,5,14,"#7ad9f0");
    px(g,9,9,14,11,"#d9e8e0"); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    px(g,24,20,2,10,"#8a5a33"); px(g,22,22,6,4,"#6b4226");
  };
  D.lindworm = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,4,26,20,8,dk); px(g,6,24,16,6,tint);
    px(g,10,30,3,5,dk); px(g,16,30,3,5,dk);
    px(g,16,10,8,10,tint); px(g,17,11,6,3,shade(tint,25));
    px(g,22,16,5,3,"#e8d9b8"); px(g,25,17,2,1,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(18,13,2,2); g.fillStyle="#111"; g.fillRect(18,13,1,1);
    g.fillStyle=shade(tint,20); g.beginPath(); g.moveTo(12,22); g.lineTo(4,14); g.lineTo(8,22); g.fill();
  };
  D.valkyrie_renegade = (g,tint)=>{
    px(g,11,30,4,6,"#3a3a4a"); px(g,17,30,4,6,"#3a3a4a");
    g.fillStyle="#d9d9e0";
    g.beginPath(); g.moveTo(14,22); g.lineTo(4,10); g.lineTo(7,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(28,10); g.lineTo(25,17); g.fill();
    px(g,10,15,12,14,tint);
    px(g,9,4,14,6,"#a0a8b8"); px(g,9,4,14,2,"#fff"); px(g,4,2,4,6,"#fff"); px(g,24,2,4,6,"#fff");
    px(g,11,8,10,8,"#f2c9b8"); g.fillStyle="#111"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
    px(g,25,18,2,12,"#c9ccd4"); px(g,5,18,3,8,"#7a8a9a");
  };
  // ---- Egypt ----
  D.anubite = (g,tint)=>{
    const dk=shade(tint,-30);
    px(g,1,20,4,4,dk); px(g,6,24,19,8,"#2a2a2a"); px(g,6,24,19,2,"#4a4a4a");
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,8,3,8,"#111"); px(g,27,8,3,8,"#111");
    px(g,22,16,8,10,"#2a2a2a"); px(g,23,20,6,3,"#ffd93d"); px(g,22,12,8,2,"#111");
    px(g,27,21,5,4,"#d9c9b8"); px(g,30,22,2,2,"#111");
    g.fillStyle="#ff3b3b"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  };
  D.scarab_swarm = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,13,20,6,5,dk); px(g,14,17,4,4,tint); px(g,14,17,4,1,shade(tint,30)); px(g,16,17,1,5,dk);
    for(let l=0;l<3;l++){ px(g,12,20+l,1,1,dk); px(g,19,20+l,1,1,dk); }
    px(g,7,12,6,4,shade(tint,20)); px(g,19,11,6,4,shade(tint,20));
    g.fillStyle="#ff3b3b"; g.fillRect(15,18,1,1); g.fillRect(17,18,1,1);
    px(g,24,24,4,3,dk); px(g,25,22,2,3,tint);
    px(g,4,26,4,3,dk); px(g,5,24,2,3,tint);
  };
  D.mummy = (g,tint)=>{
    px(g,11,28,3,8,"#c9b98a"); px(g,18,28,3,8,"#c9b98a");
    px(g,9,16,14,14,"#c9b98a");
    for(let i=0;i<4;i++) px(g,9,18+i*3,14,1,"#8a7a5a");
    px(g,10,8,12,9,"#c9b98a"); px(g,10,8,12,2,"#e8e0d0");
    g.fillStyle="#111"; g.fillRect(12,11,3,3); g.fillRect(17,11,3,3);
    g.fillStyle="#7fd4ff"; g.fillRect(13,12,1,1); g.fillRect(18,12,1,1);
  };
  D.sphinx_cub = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,22,14,3,6,"#111"); px(g,27,14,3,6,"#111");
    px(g,23,18,6,6,"#d9a06b"); g.fillStyle="#111"; g.fillRect(24,21,2,2); g.fillRect(27,21,1,2);
    px(g,27,21,4,3,"#e8d9c0");
    px(g,20,10,10,4,"#2a6a9a"); px(g,21,11,8,2,"#ffd93d");
  };
  D.sobek_spawn = (g,tint)=>{
    px(g,0,24,8,6,shade(tint,-30)); px(g,6,24,19,8,tint);
    for(let i=0;i<4;i++) px(g,8+i*4,22,2,2,shade(tint,30));
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,22,16,8,10,tint); px(g,27,21,5,4,"#7aa07a"); px(g,30,22,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,1);
  };
  D.khepri_beetle = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,10,20,12,6,dk); px(g,12,16,8,5,tint); px(g,12,16,8,1,shade(tint,30)); px(g,16,16,1,9,dk);
    for(let l=0;l<3;l++){ px(g,8,20+l,2,1,dk); px(g,22,20+l,2,1,dk); }
    px(g,14,13,4,3,"#ffd93d"); g.fillStyle="#ff3b3b"; g.fillRect(15,17,1,1); g.fillRect(17,17,1,1);
    g.fillStyle="#ffd93d"; g.beginPath(); g.arc(16,8,4,0,7); g.fill();
    px(g,15,7,2,2,"#ff9d2e");
  };
  // ---- Japan ----
  D.kappa = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint);
    px(g,8,20,3,6,"#2a5a3a"); px(g,21,20,3,6,"#2a5a3a");
    px(g,9,9,14,11,tint); px(g,13,16,6,3,"#e8d9a0");
    g.fillStyle="#ffe14d"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2); g.fillStyle="#111"; g.fillRect(12,12,1,2); g.fillRect(18,12,1,2);
    px(g,12,4,8,3,"#2a7a9a"); px(g,13,5,6,1,"#9adcff");
  };
  D.oni_imp = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,16,14,15,tint);
    px(g,10,2,3,5,"#ffd93d"); px(g,19,2,3,5,"#ffd93d");
    px(g,10,6,12,11,tint);
    g.fillStyle="#ffe14d"; g.fillRect(12,10,3,2); g.fillRect(18,10,3,2); g.fillStyle="#111"; g.fillRect(13,10,1,2); g.fillRect(19,10,1,2);
    px(g,13,14,6,2,"#fff");
    px(g,25,16,3,10,"#5a3a22"); px(g,24,12,5,5,"#7a7a88");
  };
  D.tengu_crow = (g,tint)=>{
    g.fillStyle=shade(tint,-20);
    g.beginPath(); g.moveTo(14,22); g.lineTo(2,12); g.lineTo(5,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(30,12); g.lineTo(27,17); g.fill();
    px(g,11,28,3,8,"#1a1a24"); px(g,18,28,3,8,"#1a1a24");
    px(g,10,15,12,14,"#2a2a3a"); px(g,12,8,8,8,"#d9a06b");
    px(g,14,12,4,5,"#c98a5a"); g.fillStyle="#ffe14d"; g.fillRect(13,10,2,2); g.fillRect(18,10,2,2);
    g.fillStyle="#111"; g.fillRect(13,10,1,2); g.fillRect(18,10,1,2);
    px(g,12,6,8,3,"#111");
  };
  D.kitsune_trickster = (g,tint)=>{
    g.fillStyle=tint; g.beginPath(); g.ellipse(5,22,5,6,0.5,0,7); g.fill();
    g.fillStyle="#fff"; g.beginPath(); g.ellipse(3,25,2,3,0.5,0,7); g.fill();
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,22,10,3,6,tint); px(g,27,10,3,6,tint);
    px(g,22,16,8,10,tint); px(g,23,17,6,3,"#fff");
    g.fillStyle="#111"; g.fillRect(24,19,2,2); px(g,27,21,4,3,"#e8d9c0");
  };
  D.yuki_onna = (g,tint)=>{
    px(g,8,4,16,14,"#111"); px(g,10,6,12,16,"#e0f0ff");
    px(g,12,10,8,8,"#f7d7d7"); g.fillStyle="#111"; g.fillRect(13,13,2,2); g.fillRect(17,13,2,2);
    px(g,15,17,2,1,"#a02040"); px(g,10,22,12,12,"#e0f0ff"); px(g,10,28,12,2,"#7ad9f0");
  };
  D.gasha_skull = (g,tint)=>{
    px(g,8,8,16,14,"#e8e4d8"); px(g,10,6,12,3,"#fff");
    g.fillStyle="#111"; g.fillRect(11,12,5,6); g.fillRect(17,12,5,6);
    g.fillStyle="#ff3b3b"; g.fillRect(13,14,1,2); g.fillRect(19,14,1,2);
    for(let i=0;i<4;i++) g.fillRect(12+i*3,20,1,2);
    px(g,6,24,5,8,"#e8e4d8"); px(g,21,24,5,8,"#e8e4d8");
    px(g,4,4,4,4,"#ff9d2e"); px(g,24,4,4,4,"#ff9d2e");
  };
  D.nurikabe = (g,tint)=>{
    px(g,5,8,22,24,tint); px(g,5,8,22,3,shade(tint,25)); px(g,5,29,22,3,shade(tint,-30));
    px(g,5,18,22,1,shade(tint,-30)); px(g,11,8,1,24,shade(tint,-30)); px(g,20,8,1,24,shade(tint,-30));
    px(g,11,13,10,7,"#e8e0d0"); g.fillStyle="#111"; g.fillRect(13,15,2,3); g.fillRect(17,15,2,3);
    px(g,3,20,2,6,"#d9c9b0"); px(g,27,20,2,6,"#d9c9b0");
  };
  D.tanuki = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,"#3a2a1a");
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,3,20,5,5,shade(tint,-30)); px(g,3,20,5,1,"#c9c9c9"); px(g,3,23,5,1,"#c9c9c9");
    px(g,22,16,8,10,tint); px(g,22,16,8,2,shade(tint,25));
    g.fillStyle="#111"; g.fillRect(24,19,2,2); px(g,27,21,4,3,"#e8d9c0");
  };
  // ---- giant insects: tarantulas, scorpions, ants, hornets ----
  // Front/side poses with big readable silhouettes: leg fans, fangs, stings.
  D.giant_tarantula = (g,tint)=>{
    const dk=shade(tint,-45), lite=shade(tint,30);
    // eight splayed legs, jointed (dark chitin, pale knees) — kept on-canvas
    for(let s=0;s<4;s++){
      const y=15+s*4;
      px(g,3,y,5,2,dk); px(g,24,y,5,2,dk);
      px(g,1,y+1,3,4,dk); px(g,28,y+1,3,4,dk);
      px(g,2,y+1,2,1,lite); px(g,28,y+1,2,1,lite);
      px(g,1,y+4,3,1,dk); px(g,28,y+4,3,1,dk);
    }
    // great abdomen: dark bulb with violet sheen + hair flecks
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,26,9,7,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,25,8,6,0,0,7); g.fill();
    g.fillStyle=lite; g.beginPath(); g.ellipse(14,22,4,3,-0.4,0,7); g.fill();
    px(g,12,27,2,2,"#1a0f24"); px(g,18,27,2,2,"#1a0f24"); px(g,15,29,2,2,"#1a0f24");
    px(g,10,24,1,3,"#8a6a8a"); px(g,21,24,1,3,"#8a6a8a"); px(g,13,30,1,2,"#8a6a8a"); px(g,18,30,1,2,"#8a6a8a");
    // cephalothorax mass
    px(g,11,13,10,8,tint); px(g,12,14,8,2,lite);
    // eight eyes: two great + glints
    g.fillStyle="#ff3b3b"; g.fillRect(13,15,3,3); g.fillRect(17,15,2,3);
    g.fillStyle="#fff"; g.fillRect(13,15,1,1); g.fillRect(17,15,1,1);
    g.fillStyle="#ffe14d"; g.fillRect(12,18,1,1); g.fillRect(15,19,1,1); g.fillRect(18,18,1,1); g.fillRect(20,19,1,1);
    // huge curved fangs, venom-wet tips
    px(g,12,21,3,6,"#e8e0d0"); px(g,17,21,3,6,"#e8e0d0");
    px(g,12,26,3,1,"#7a1f1f"); px(g,17,26,3,1,"#7a1f1f");
    // pedipalp feelers
    px(g,9,19,2,5,dk); px(g,21,19,2,5,dk);
  };
  D.tomb_scorpion = (g,tint)=>{
    const dk=shade(tint,-45), lite=shade(tint,35);
    // tail: armored segments arcing up and over, stinger poised above the head
    px(g,4,24,5,5,dk); px(g,6,19,5,5,tint); px(g,9,14,5,5,tint); px(g,13,10,5,5,dk);
    px(g,17,7,5,5,tint); px(g,21,6,5,4,dk);
    px(g,22,6,3,1,lite); px(g,18,7,3,1,lite); px(g,14,10,3,1,lite);
    px(g,23,2,4,5,"#1a1a1a"); px(g,24,1,2,4,"#ff3b3b"); px(g,24,1,1,1,"#fff");
    // body: low segmented plates
    px(g,4,27,20,6,dk); px(g,5,28,18,4,tint);
    px(g,7,28,2,4,lite); px(g,11,28,2,4,lite); px(g,15,28,2,4,lite); px(g,19,28,2,4,lite);
    // six marching legs
    for(let l=0;l<3;l++){ px(g,7+l*5,33,2,3,dk); }
    // head + great crusher claw (right)
    px(g,22,24,5,7,tint); px(g,23,25,3,2,lite);
    g.fillStyle="#ff3b3b"; g.fillRect(24,26,2,2); g.fillStyle="#111"; g.fillRect(24,26,1,1);
    px(g,27,22,4,5,dk); px(g,29,20,3,5,tint); px(g,29,24,3,4,"#e8e0d0");
    px(g,27,20,2,2,lite);
    // left claw raised in guard
    px(g,0,16,4,6,dk); px(g,0,14,3,4,tint); px(g,1,18,2,3,"#e8e0d0");
  };
  D.siege_ant = (g,tint)=>{
    const dk=shade(tint,-45), lite=shade(tint,25), brass="#c9a227";
    // fresh diggings
    px(g,4,33,24,3,"#4a3320"); px(g,8,32,3,2,"#5a4028"); px(g,21,32,3,2,"#5a4028");
    // six plated legs
    for(let l=0;l<3;l++){ const y=24+l*3; px(g,5,y,3,2,dk); px(g,24,y,3,2,dk); px(g,4,y+1,2,3,dk); px(g,26,y+1,2,3,dk); }
    // three armored body plates with brass rivets
    px(g,9,26,14,7,dk); px(g,10,27,12,5,tint); px(g,11,27,10,1,lite);
    px(g,10,24,12,5,dk); px(g,11,25,10,3,tint);
    px(g,11,17,10,7,dk); px(g,12,18,8,5,tint); px(g,13,18,6,1,lite);
    px(g,12,20,1,1,brass); px(g,19,20,1,1,brass); px(g,12,28,1,1,brass); px(g,19,28,1,1,brass);
    // huge siege mandibles
    px(g,7,20,4,7,dk); px(g,5,24,3,5,tint); px(g,5,27,2,2,"#e8e0d0");
    px(g,21,20,4,7,dk); px(g,24,24,3,5,tint); px(g,25,27,2,2,"#e8e0d0");
    // antennae + furnace eyes
    px(g,12,12,2,5,dk); px(g,18,12,2,5,dk); px(g,11,10,3,3,brass); px(g,18,10,3,3,brass);
    g.fillStyle="#ff9d2e"; g.fillRect(14,19,2,2); g.fillRect(17,19,2,2);
    g.fillStyle="#111"; g.fillRect(14,19,1,2); g.fillRect(17,19,1,2);
  };
  D.hive_hornet = (g,tint)=>{
    const dk=shade(tint,-45), vein="#8a7a5a";
    // great veined wings beating overhead — broad translucent fans
    g.fillStyle="rgba(240,230,200,0.85)";
    g.beginPath(); g.moveTo(15,15); g.lineTo(2,1); g.lineTo(5,9); g.lineTo(10,14); g.fill();
    g.beginPath(); g.moveTo(17,15); g.lineTo(30,1); g.lineTo(27,9); g.lineTo(22,14); g.fill();
    px(g,9,5,2,6,vein); px(g,12,7,2,4,vein); px(g,21,5,2,6,vein); px(g,18,7,2,4,vein);
    px(g,4,4,2,2,"rgba(255,255,255,0.9)"); px(g,26,4,2,2,"rgba(255,255,255,0.9)");
    // striped abdomen hanging below a pinched wasp waist
    px(g,13,18,6,3,tint);
    px(g,12,21,8,11,tint);
    for(let s=0;s<3;s++) px(g,12,23+s*4,8,2,"#1a1a1a");
    px(g,13,21,6,1,shade(tint,30));
    // long stinger
    px(g,14,32,4,3,dk); px(g,15,35,2,3,"#1a1a1a");
    // thorax + head
    px(g,11,12,10,7,tint); px(g,12,13,8,2,shade(tint,30));
    px(g,5,15,4,2,dk); px(g,23,15,4,2,dk);
    px(g,10,24,3,4,dk); px(g,19,24,3,4,dk);
    // great compound eyes + jaws
    g.fillStyle="#ff3b3b"; g.fillRect(12,13,4,5); g.fillRect(18,13,3,4);
    g.fillStyle="#fff"; g.fillRect(12,13,1,1); g.fillRect(18,13,1,1);
    px(g,14,19,4,2,"#1a1a1a");
    // long antennae
    px(g,10,6,2,7,dk); px(g,20,6,2,7,dk);
    px(g,9,5,4,2,dk); px(g,19,5,4,2,dk);
  };
  //__MORE__

  // ---- Celtic ----
  D.banshee = (g,tint)=>{
    px(g,9,6,14,24,"#c9d9e8"); px(g,11,8,10,20,shade("#c9d9e8",25));
    px(g,12,12,8,10,"#0c0a12"); g.beginPath(); g.fillStyle="#0c0a12"; g.ellipse(16,18,3,4,0,0,7); g.fill();
    px(g,7,4,5,12,"#e8e0d0"); px(g,20,4,5,12,"#e8e0d0");
    px(g,8,22,16,2,"#8a8a92"); px(g,10,28,3,8,"#c9d9e8"); px(g,19,28,3,8,"#c9d9e8");
    g.fillStyle="#fff"; g.fillRect(14,13,1,3); g.fillRect(18,13,1,1);
  };
  D.redcap = (g,tint)=>{
    px(g,11,30,4,6,"#3a2a1a"); px(g,17,30,4,6,"#3a2a1a");
    px(g,10,35,5,2,"#3a2a1a"); px(g,17,35,5,2,"#3a2a1a");
    px(g,9,20,14,12,"#8a1a1a"); px(g,12,18,8,2,"#5a5a5a");
    px(g,9,2,14,7,"#c93b3b"); px(g,9,2,14,2,"#ff6a6a");
    px(g,9,9,14,11,"#d9a06b"); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    px(g,25,20,2,12,"#9aa0a8"); px(g,24,30,4,2,"#5a3a22");
  };
  D.kelpie = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,8,20,12,3,"#7ad9f0"); px(g,6,24,3,6,"#2a6a7a");
    px(g,22,8,3,8,"#1a2a3a"); px(g,22,16,8,10,tint);
    g.fillStyle="#7ad9f0"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,1);
    px(g,27,21,4,3,"#d9c9b8");
  };
  D.burrow_mole = (g,tint)=>{
    const dk=shade(tint,-35), lite=shade(tint,28);
    // fresh diggings: piled soil + scattered clods under the body
    px(g,4,32,24,4,"#4a3320"); px(g,6,31,9,2,"#5a4028"); px(g,17,31,8,2,"#5a4028");
    px(g,9,30,2,2,"#6e4e30"); px(g,21,30,2,2,"#6e4e30"); px(g,14,33,3,2,"#6e4e30");
    // low-slung velvet body with a paler back sheen
    px(g,6,24,19,8,tint); px(g,6,24,19,2,lite);
    px(g,9,29,11,2,"#8a7a6e");
    px(g,7,31,3,5,dk); px(g,22,31,3,5,dk);
    // blunt head mass, no neck (moles are one determined sausage)
    px(g,22,20,8,10,tint); px(g,23,21,6,3,lite);
    // huge digging forepaws: cream spades, claws fanned
    px(g,24,28,5,6,"#e8d9c0"); px(g,24,28,5,1,"#ffffff");
    px(g,25,29,1,4,shade("#e8d9c0",-30)); px(g,27,29,1,4,shade("#e8d9c0",-30));
    px(g,4,27,4,4,dk);
    // star nose: pink disc + radiating feelers
    px(g,27,21,4,4,"#e08a9a"); px(g,28,20,2,6,"#e08a9a"); px(g,26,22,6,2,"#e08a9a");
    g.fillStyle="#f2b0bc"; g.fillRect(28,22,2,2);
    // near-blind eyes: tiny dark slits behind the nose
    g.fillStyle="#111"; g.fillRect(24,21,2,1);
    // whisker pits + tail nub
    g.fillStyle=lite; g.fillRect(25,24,1,1); g.fillRect(26,25,1,1);
    px(g,2,25,3,3,dk);
  };
  D.tidecaller = (g,tint)=>{
    px(g,11,12,10,16,tint); px(g,9,14,3,10,shade(tint,25)); px(g,20,14,3,10,shade(tint,25));
    px(g,12,8,8,8,tint); px(g,14,2,4,6,"#bfe8ff");
    g.fillStyle="#fff7ae"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
    g.fillStyle=tint; g.beginPath(); g.moveTo(11,28); g.lineTo(4,22); g.lineTo(9,28); g.fill();
  };
  D.deepmaw = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-40)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,"#0e2a3a"); px(g,12,20,8,6,"#7a1f2e");
    for(let i=0;i<3;i++){ px(g,13+i*3,21,1,2,"#fff"); px(g,13+i*3,24,1,2,"#fff"); }
    px(g,12,8,8,8,tint); g.fillStyle="#ffe14d"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
  };
  D.dullahan_herald = (g,tint)=>{
    px(g,11,14,10,18,"#2a2a3a"); px(g,13,14,6,14,"#3a3a4a");
    px(g,11,12,10,3,"#c9ccd4"); px(g,6,28,6,4,"#1a1a24"); px(g,20,28,6,4,"#1a1a24");
    px(g,23,20,6,7,"#d9c9a0"); px(g,24,21,4,5,"#111");
    g.fillStyle="#7fd4ff"; g.fillRect(24,23,1,2); g.fillRect(27,23,1,2);
    px(g,24,14,2,8,"#9aa0a8");
  };
  D.puca = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,22,10,3,6,"#111"); px(g,27,10,3,6,"#111");
    px(g,22,16,8,10,tint); g.fillStyle="#7ad9f0"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,1);
    px(g,27,21,4,3,"#e8d9c0"); px(g,8,20,6,3,"#2a4a3a");
  };
  // ---- Slavic ----
  D.leshy = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,16,14,15,tint); px(g,12,18,8,6,"#2f4a1f"); px(g,12,16,8,1,"#7dd68a");
    px(g,6,2,4,8,"#4a2f1a"); px(g,22,2,4,8,"#4a2f1a"); px(g,8,4,3,4,"#3a6a2a"); px(g,21,4,3,4,"#3a6a2a");
    g.fillStyle="#ffe14d"; g.fillRect(12,9,3,2); g.fillRect(18,9,2,1); g.fillStyle="#111"; g.fillRect(13,9,1,2);
    px(g,13,13,6,1,"#2f4a1f");
  };
  D.vodyanoy = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,11,21,10,6,shade(tint,25));
    px(g,11,16,10,3,"#0f2a22"); g.fillStyle="#fff"; g.fillRect(12,16,2,1); g.fillRect(18,16,2,1);
    px(g,7,2,4,6,"#3a6a4a"); px(g,21,2,4,6,"#3a6a4a");
    px(g,9,9,14,11,tint); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
  };
  D.rusalka = (g,tint)=>{
    px(g,8,4,16,10,"#2a8a5a"); px(g,10,6,12,4,"#ffd93d");
    px(g,10,12,12,18,tint); px(g,12,14,8,6,"#0c0a12");
    g.fillStyle="#bfe8ff"; g.fillRect(13,15,2,2); g.fillRect(17,15,2,2);
    px(g,10,28,3,8,"#2a8a5a"); px(g,19,28,3,8,"#2a8a5a");
    px(g,6,12,3,10,"#7ad9c9"); px(g,23,12,3,10,"#7ad9c9");
  };
  D.striga = (g,tint)=>{
    px(g,10,8,12,14,tint); px(g,8,12,4,8,tint); px(g,20,12,4,8,tint);
    px(g,12,12,8,8,"#0c0a12"); g.fillStyle="#ffe14d"; g.fillRect(13,14,2,3); g.fillRect(17,14,2,3);
    px(g,15,17,2,2,"#e8a020"); px(g,7,8,4,4,"#e8e0d0"); px(g,21,8,4,4,"#e8e0d0");
    px(g,10,26,3,6,shade(tint,-30)); px(g,19,26,3,6,shade(tint,-30));
  };
  D.domovoi_rogue = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,11,17,10,5,"#c9c9c9");
    px(g,9,9,14,11,"#d9a06b"); g.fillStyle="#111"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    px(g,10,3,12,4,"#4a3a2a");
    px(g,25,18,2,14,"#8a5a33"); px(g,23,18,6,3,"#a06a3a");
  };
  // ---- wider myth ----
  D.naga = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-35)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,tint); px(g,9,14,3,10,shade(tint,30)); px(g,20,14,3,10,shade(tint,30));
    px(g,12,8,8,8,tint); px(g,9,2,3,6,shade(tint,30)); px(g,20,2,3,6,shade(tint,30));
    g.fillStyle="#ffe14d"; g.fillRect(13,10,2,2); g.fillRect(18,10,1,2); g.fillStyle="#111"; g.fillRect(13,10,1,2);
    px(g,15,14,2,3,"#a02020");
  };
  D.rakshasa_cub = (g,tint)=>{
    px(g,11,30,4,6,"#8a5a33"); px(g,17,30,4,6,"#8a5a33");
    px(g,9,20,14,12,tint); px(g,10,22,2,6,"#7a1f1f"); px(g,14,22,2,6,"#7a1f1f");
    px(g,9,9,14,11,tint); px(g,9,12,2,8,"#7a1f1f"); px(g,21,12,2,8,"#7a1f1f");
    g.fillStyle="#ffe14d"; g.fillRect(12,13,3,2); g.fillRect(18,13,2,1); g.fillStyle="#111"; g.fillRect(13,13,1,2);
    g.fillStyle="#fff"; g.fillRect(12,18,2,1); g.fillRect(18,18,2,1);
    px(g,4,8,4,4,shade(tint,25)); px(g,24,8,4,4,shade(tint,25));
  };
  D.lamassu_cub = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    g.fillStyle=shade(tint,25); g.beginPath(); g.moveTo(12,24); g.lineTo(2,12); g.lineTo(8,22); g.fill();
    px(g,22,14,3,5,"#111"); px(g,27,14,3,5,"#111");
    px(g,23,18,6,6,"#d9a06b"); g.fillStyle="#111"; g.fillRect(24,21,2,2); g.fillRect(27,21,1,2);
    px(g,20,12,10,4,"#2a6a9a"); px(g,21,13,8,2,"#ffd93d");
  };
  D.utukku = (g,tint)=>{
    px(g,8,8,16,20,tint); px(g,6,6,20,6,"#2a1f3a");
    px(g,12,12,8,8,"#0c0a12"); g.fillStyle="#c77dff"; g.fillRect(13,14,2,3); g.fillRect(17,14,2,3);
    px(g,6,20,3,8,"#2a1f3a"); px(g,23,20,3,8,"#2a1f3a");
    px(g,14,24,4,2,"#c77dff");
  };
  D.jiangshi = (g,tint)=>{
    px(g,9,2,14,6,"#1a1a24"); px(g,14,0,4,3,"#c93b3b"); px(g,15,8,2,6,"#ffd93d");
    px(g,9,16,14,16,"#2a4a6a"); px(g,13,16,6,16,"#e8e8e8");
    px(g,10,8,12,8,"#bfe8c9"); g.fillStyle="#111"; g.fillRect(12,11,2,2); g.fillRect(18,11,2,2);
    px(g,11,28,4,8,"#2a4a6a"); px(g,17,28,4,8,"#2a4a6a");
  };
  D.goblin_shaman = (g,tint)=>{
    const skin="#2f8a4f";
    g.fillStyle=skin; g.beginPath(); g.moveTo(10,12); g.lineTo(2,8); g.lineTo(4,15); g.fill();
    g.beginPath(); g.moveTo(22,12); g.lineTo(30,8); g.lineTo(28,15); g.fill();
    px(g,11,30,4,6,"#1f4a2f"); px(g,17,30,4,6,"#1f4a2f");
    px(g,9,20,14,12,tint); px(g,9,9,14,11,skin);
    g.fillStyle="#ffe14d"; g.fillRect(11,12,4,3); g.fillRect(18,12,2,2); g.fillStyle="#111"; g.fillRect(12,13,1,2);
    px(g,13,2,6,5,"#d9c27f"); px(g,15,0,2,4,"#c93b3b");
    px(g,25,18,2,10,"#5a3a22"); px(g,24,14,4,5,shade(tint,25));
  };
  // ---- garrisons: grunts read as troops, shamans as casters ----
  D.orc_grunt = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,9,16,14,15,tint); px(g,11,18,10,12,shade(tint,15));
    px(g,11,10,6,5,"#e8e0d0"); px(g,11,10,2,6,"#e8e0d0"); px(g,15,10,2,6,"#e8e0d0");
    g.fillStyle="#ffe14d"; g.fillRect(12,12,3,2); g.fillRect(18,12,2,1); g.fillStyle="#111"; g.fillRect(13,12,1,2);
    px(g,25,18,2,10,"#6b4226"); px(g,23,20,6,3,"#888");
  };
  D.orc_shaman = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,tint); px(g,9,20,14,3,"#d9c27f"); px(g,13,24,6,6,"#8a5a33");
    px(g,9,9,14,11,shade(tint,10));
    px(g,10,2,3,8,"#e8e0d0"); px(g,19,2,3,8,"#e8e0d0");
    g.fillStyle="#7fd4ff"; g.fillRect(12,12,3,2); g.fillRect(18,12,2,1); g.fillStyle="#111"; g.fillRect(13,12,1,2);
    px(g,25,16,2,12,"#5a3a22"); px(g,24,12,4,5,"#ff9d2e"); px(g,25,13,2,3,"#fff");
  };
  D.goblin_brute = (g,tint)=>{
    const dk=shade(tint,-40);
    px(g,8,30,6,6,dk); px(g,18,30,6,6,dk);
    px(g,6,18,8,13,tint); px(g,18,18,8,13,tint); px(g,9,14,14,17,dk); px(g,11,16,10,13,tint);
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(4,5); g.lineTo(7,11); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(28,5); g.lineTo(25,11); g.fill();
    g.fillStyle="#ff3b3b"; g.fillRect(12,9,3,2); g.fillRect(18,9,2,2); g.fillStyle="#111"; g.fillRect(13,9,1,2);
    px(g,25,20,3,10,"#6b4226"); px(g,23,18,6,3,"#9aa0a8");
  };
  D.kobold_shaman = (g,tint)=>{
    px(g,11,30,4,6,shade(tint,-35)); px(g,17,30,4,6,shade(tint,-35));
    px(g,9,20,14,12,"#2a4a7a"); px(g,9,20,14,2,"#7fb0ff");
    g.fillStyle=tint; g.beginPath(); g.moveTo(10,10); g.lineTo(5,3); g.lineTo(8,11); g.fill();
    g.beginPath(); g.moveTo(22,10); g.lineTo(27,3); g.lineTo(24,11); g.fill();
    px(g,9,9,14,11,tint); g.fillStyle="#ffe14d"; g.fillRect(12,12,2,2); g.fillRect(18,12,2,2);
    g.fillStyle="#111"; g.fillRect(12,12,1,2); g.fillRect(18,12,1,2);
    px(g,24,16,2,10,"#5a3a22"); px(g,23,12,4,5,"#ff6b2e");
  };
  D.gnoll = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,1,20,4,4,dk); px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,12,3,5,shade(tint,20)); px(g,27,12,3,5,shade(tint,20));
    px(g,22,16,8,10,tint); px(g,27,21,4,3,"#d9c9b8"); px(g,30,22,2,2,"#111");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    px(g,8,26,10,2,"#5a3a22");
  };
  D.gnoll_hunter = (g,tint)=>{
    const dk=shade(tint,-35);
    px(g,1,20,4,4,dk); px(g,6,24,19,8,tint); px(g,6,24,19,2,"#7a5a3a");
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,12,3,5,tint); px(g,27,12,3,5,tint);
    px(g,22,16,8,10,tint); px(g,27,21,4,3,"#d9c9b8");
    g.fillStyle="#7fd4ff"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    px(g,2,14,2,12,"#8a5a33"); px(g,0,14,6,2,"#d9c9c9");
    px(g,8,26,10,2,"#2a6a3a");
  };
  // ---- deep wilds + lake + apex + human foes ----
  D.slime_empress = (g,tint)=>{
    const dk=shade(tint,-30);
    g.fillStyle="rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16,33,12,4,0,0,7); g.fill();
    g.fillStyle=dk; g.beginPath(); g.ellipse(16,28,12,9,0,0,7); g.fill();
    g.fillStyle=tint; g.beginPath(); g.ellipse(16,26,11,8,0,0,7); g.fill();
    g.fillStyle="rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(11,21,4,3,-0.4,0,0,7); g.fill();
    px(g,6,26,4,4,shade(tint,25)); px(g,22,26,4,4,shade(tint,25));
    g.fillStyle="#101418"; g.fillRect(11,25,3,4); g.fillRect(19,25,3,4);
    g.fillStyle="#fff"; g.fillRect(11,25,1,1); g.fillRect(19,25,1,1);
    px(g,13,18,6,2,"#ffd93d"); px(g,14,19,4,1,"#fff"); px(g,15,13,2,2,"#c93b3b");
  };
  D.wyvern_fledgling = (g,tint)=>{
    const dk=shade(tint,-35);
    g.fillStyle=dk; g.beginPath(); g.moveTo(14,22); g.lineTo(4,12); g.lineTo(6,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(28,12); g.lineTo(26,17); g.fill();
    px(g,11,28,3,6,dk); px(g,18,28,3,6,dk);
    px(g,10,16,12,12,tint); px(g,17,11,7,7,tint);
    g.fillStyle="#ffe14d"; g.fillRect(19,13,2,2); g.fillStyle="#111"; g.fillRect(19,13,1,2);
    px(g,2,22,4,2,tint); px(g,13,28,6,2,"#e8e0d0");
  };
  D.gloomspinner = (g,tint)=>{
    px(g,11,16,10,14,tint); px(g,13,12,6,5,"#1a0f24");
    g.fillStyle="#ff3b3b"; g.fillRect(14,14,1,2); g.fillRect(17,14,2,2);
    for(let l=0;l<4;l++){ px(g,7,18+l*3,4,1,shade(tint,-20)); px(g,21,18+l*3,4,1,shade(tint,-20)); }
    px(g,12,24,8,4,"#0c0a12"); px(g,13,25,2,2,"#9a8ae8"); px(g,17,25,2,2,"#9a8ae8");
  };
  D.umbral_stag = (g,tint)=>{
    const dk=shade(tint,-30);
    px(g,1,20,4,5,dk); px(g,0,18,3,4,"#8a7ae8");
    px(g,6,24,19,8,tint); px(g,6,24,19,2,shade(tint,25));
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,20,4,3,10,"#8a7ae8"); px(g,23,4,3,10,"#8a7ae8"); px(g,20,4,8,3,"#b0a0ff");
    px(g,22,16,8,10,tint); g.fillStyle="#b0a0ff"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  };
  D.sandmaw = (g,tint)=>{
    px(g,7,28,18,8,shade(tint,-35)); px(g,9,26,14,6,tint);
    px(g,11,12,10,16,tint); px(g,9,14,3,10,shade(tint,30)); px(g,20,14,3,10,shade(tint,30));
    px(g,12,8,8,8,shade(tint,15));
    for(let i=0;i<3;i++){ px(g,10+i*5,5,2,4,shade(tint,-25)); }
    g.fillStyle="#111"; g.fillRect(13,12,3,3); g.fillRect(18,12,2,2);
    px(g,13,18,6,3,"#7a1f1f"); g.fillStyle="#fff"; g.fillRect(14,19,1,2); g.fillRect(17,19,1,2);
  };
  D.rime_wolf = (g,tint)=>{
    const dk=shade(tint,-30);
    px(g,2,22,4,3,dk); px(g,6,24,19,8,tint); px(g,6,24,19,2,"#ffffff");
    px(g,7,31,3,5,dk); px(g,12,31,3,5,dk); px(g,18,31,3,5,dk); px(g,22,31,3,5,dk);
    px(g,22,14,3,4,"#bfe0f0"); px(g,27,14,3,4,"#bfe0f0");
    px(g,22,16,8,10,tint); px(g,27,21,5,4,"#d9e8f2"); px(g,30,22,2,2,"#7ab0d0");
    g.fillStyle="#7fd4ff"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
  };
  D.shiver_owl = (g,tint)=>{
    g.fillStyle=shade(tint,-20);
    g.beginPath(); g.moveTo(14,20); g.lineTo(4,10); g.lineTo(7,16); g.fill();
    g.beginPath(); g.moveTo(18,20); g.lineTo(28,10); g.lineTo(25,16); g.fill();
    px(g,10,10,12,18,tint); px(g,12,12,8,12,"#f2f7fb");
    g.fillStyle="#111"; g.fillRect(13,15,3,4); g.fillRect(18,15,1,2);
    g.fillStyle="#7fd4ff"; g.fillRect(14,16,1,2);
    px(g,14,22,4,3,"#e8a020"); px(g,22,6,3,6,"#b9c9d9"); px(g,7,6,3,6,"#b9c9d9");
  };
  D.coral_crab = (g,tint)=>{
    px(g,6,24,20,10,tint); px(g,9,22,14,4,"#ff8a7a"); px(g,9,22,2,2,"#fff");
    px(g,22,18,8,6,"#c94a3a"); px(g,28,20,4,4,"#e06a5a"); px(g,0,20,4,4,"#c94a3a");
    px(g,12,16,3,6,"#ff8a7a"); px(g,17,16,3,6,"#ff8a7a");
    g.fillStyle="#111"; g.fillRect(13,20,2,2); g.fillRect(18,20,1,2);
    px(g,14,26,4,2,"#ffd93d");
  };
  D.abyss_serpent = (g,tint)=>{
    px(g,7,28,18,8,shade(tint,-40)); px(g,9,26,14,6,tint);
    px(g,11,12,10,16,"#0e2a3a"); px(g,10,14,3,10,shade(tint,30)); px(g,19,14,3,10,shade(tint,30));
    px(g,12,8,8,8,tint); px(g,13,4,2,5,"#7ad9f0"); px(g,17,4,2,5,"#7ad9f0");
    g.fillStyle="#ffe14d"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
    g.fillStyle="#7ad9f0"; g.fillRect(15,14,2,4);
  };
  D.mire_lurker = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,8,20,12,3,"#2a4a3a");
    px(g,6,24,3,6,"#4a6a2a"); px(g,10,22,4,2,"#9adc9a");
    px(g,7,31,3,5,shade(tint,-35)); px(g,12,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,22,16,8,10,tint); g.fillStyle="#9adc9a"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    px(g,27,21,4,3,"#3a2a1a");
  };
  D.wreck_eel = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-35)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,tint); px(g,10,22,3,3,"#d9c9a0"); px(g,19,24,3,3,"#d9c9a0");
    px(g,12,8,8,8,shade(tint,25)); g.fillStyle="#bfe8ff"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
    px(g,14,26,2,2,"#8a8a92");
  };
  D.magma_eel = (g,tint)=>{
    px(g,8,28,16,8,shade(tint,-40)); px(g,10,26,12,6,tint);
    px(g,11,12,10,16,tint); px(g,12,8,8,8,shade(tint,30));
    for(let i=0;i<4;i++) px(g,9+i*4,4,2,5,"#ffd93d");
    g.fillStyle="#ffe14d"; g.fillRect(13,10,2,2); g.fillRect(17,10,2,2);
    g.fillStyle="#ff7b2e"; g.fillRect(15,13,2,2);
  };
  D.cinder_maw = (g,tint)=>{
    px(g,6,24,19,8,tint); px(g,8,20,10,4,"#ff9d2e");
    px(g,22,12,3,5,"#ff7b2e"); px(g,7,31,3,5,shade(tint,-35)); px(g,18,31,3,5,shade(tint,-35));
    px(g,22,16,8,10,tint); px(g,27,21,5,4,"#3a0f08"); px(g,28,22,3,2,"#ff7b2e");
    g.fillStyle="#ffe14d"; g.fillRect(24,19,2,2); g.fillStyle="#111"; g.fillRect(24,19,1,2);
    g.fillStyle="#fff"; g.fillRect(27,22,1,2); g.fillRect(29,22,1,2);
  };
  D.abyss_tentacle = (g,tint)=>{
    px(g,12,14,8,20,tint); px(g,10,12,12,6,shade(tint,20));
    px(g,11,16,10,4,"#e8a0c9");
    for(let i=0;i<3;i++){ px(g,13+i*3,17,2,2,"#fff"); }
    px(g,14,8,4,5,"#ff6b9d"); px(g,15,9,2,3,"#fff");
    px(g,6,22,4,8,shade(tint,-20)); px(g,22,22,4,8,shade(tint,-20));
  };
  D.mimic = (g,tint)=>{
    const dk=shade(tint,-30);
    px(g,7,20,18,12,dk); px(g,7,16,18,6,tint); px(g,7,16,18,2,shade(tint,25));
    px(g,9,22,14,6,"#3a0a1a"); for(let i=0;i<5;i++){ px(g,10+i*3,22,1,2,"#fff"); px(g,10+i*3,28,1,2,"#fff"); }
    g.fillStyle="#ffe14d"; g.fillRect(12,18,2,2); g.fillRect(18,18,2,2); g.fillStyle="#111"; g.fillRect(12,18,1,2); g.fillRect(18,18,1,2);
    px(g,11,12,3,5,"#8a5a33"); px(g,18,12,3,5,"#8a5a33");
  };
  // LESSER MIMIC: small pale oak chest, mossy corners, one droopy eye, blunt
  // baby teeth, stubby legs, rusted latch. Reads young and hungry, not regal.
  D.lesser_mimic = (g,tint)=>{
    const wood="#a08050", dk="#6a5a3a";
    px(g,10,31,3,5,dk); px(g,19,31,3,5,dk); px(g,10,34,3,2,"#3a2a1a"); px(g,19,34,3,2,"#3a2a1a");
    px(g,9,22,14,10,dk); px(g,9,18,14,5,wood); px(g,9,18,14,2,"#d9c27f");
    px(g,9,22,3,3,"#5a7a3a"); px(g,20,29,3,3,"#5a7a3a"); px(g,22,22,1,2,"#5a7a3a");
    px(g,11,24,10,4,"#3a0a1a");
    for(let i=0;i<4;i++){ px(g,11+i*3,24,2,2,"#f2ede2"); px(g,11+i*3,26,2,2,"#f2ede2"); }
    g.fillStyle="#fffbe8"; g.fillRect(14,19,4,4); g.fillStyle="#111"; g.fillRect(15,20,2,3);
    g.fillStyle="#fff"; g.fillRect(14,19,1,1);
    px(g,14,29,4,2,"#7a5a3a"); px(g,15,29,2,2,"#3a2a1a");
    px(g,11,12,2,4,"#8a5a33"); px(g,19,12,2,4,"#8a5a33");
  };
  // GREATER MIMIC: tall iron-banded brute, angry red eyes, long fangs, claw
  // arms, lid spikes + chain. A vault guard, not a copy.
  D.greater_mimic = (g,tint)=>{
    const dk=shade(tint,-40), iron="#8a8a92", irond="#5a5a62";
    px(g,8,31,5,5,dk); px(g,19,31,5,5,dk); px(g,9,35,3,1,"#e8e0d0"); px(g,20,35,3,1,"#e8e0d0");
    px(g,6,20,20,12,dk); px(g,6,15,20,7,tint); px(g,6,15,20,2,shade(tint,25));
    px(g,9,15,2,17,iron); px(g,21,15,2,17,iron);
    px(g,9,18,2,2,"#e8e0d0"); px(g,9,24,2,2,"#e8e0d0"); px(g,21,18,2,2,"#e8e0d0"); px(g,21,24,2,2,"#e8e0d0");
    px(g,6,24,20,2,iron); px(g,6,24,20,1,"#e8e0d0");
    px(g,8,22,16,7,"#0c0a12");
    for(let i=0;i<6;i++){ px(g,8+i*3,22,2,3,"#fff"); px(g,8+i*3,26,2,3,"#fff"); }
    g.fillStyle="#ff3b3b"; g.fillRect(10,17,4,3); g.fillRect(18,17,4,3);
    g.fillStyle="#111"; g.fillRect(11,18,2,2); g.fillRect(19,18,2,2);
    g.fillStyle="#fff"; g.fillRect(10,17,1,1); g.fillRect(18,17,1,1);
    px(g,9,15,6,2,"#111"); px(g,17,15,6,2,"#111");
    px(g,8,10,2,5,"#c9ccd4"); px(g,14,9,2,6,"#e8e4d8"); px(g,20,11,2,4,"#c9ccd4");
    px(g,2,22,4,9,irond); px(g,26,22,4,9,irond);
    px(g,1,28,5,3,"#e8e0d0"); px(g,26,28,5,3,"#e8e0d0"); px(g,2,28,1,2,"#7a1f1f"); px(g,29,28,1,2,"#7a1f1f");
    px(g,12,29,8,2,"#c9a227"); px(g,15,29,2,2,"#7a1f1f");
  };
  // MIMIC DEVOURER: fleshy apex maw, three eyes, barbed tongue, side
  // tentacles, horned lid, veined flesh + drool. Pure hunger, no wood left.
  D.mimic_devourer = (g,tint)=>{
    const dk=shade(tint,-35), flesh=tint, vein="#c93b6b";
    px(g,7,30,4,6,dk); px(g,21,30,4,6,dk);
    px(g,1,20,4,12,"#5a1a3a"); px(g,27,20,4,12,"#5a1a3a");
    px(g,2,22,2,2,"#e8d9e8"); px(g,2,26,2,2,"#e8d9e8"); px(g,28,22,2,2,"#e8d9e8"); px(g,28,26,2,2,"#e8d9e8");
    px(g,5,20,22,12,dk); px(g,5,14,22,8,flesh); px(g,5,14,22,2,shade(tint,30));
    px(g,6,22,5,2,vein); px(g,21,28,5,2,vein); px(g,6,28,4,2,vein);
    px(g,7,10,3,6,"#e8e0d0"); px(g,22,10,3,6,"#e8e0d0"); px(g,8,10,1,2,"#c93b3b"); px(g,23,10,1,2,"#c93b3b");
    px(g,7,22,18,8,"#0c0a12");
    for(let i=0;i<7;i++){ px(g,7+i*3,22,2,3,"#fff"); px(g,7+i*3,27,2,3,"#fff"); }
    px(g,13,25,6,5,"#ff6b9d"); px(g,14,25,4,2,"#ffb0c9"); px(g,15,27,2,2,"#7a1f3a");
    g.fillStyle="#ffe14d"; g.fillRect(13,16,6,5); g.fillStyle="#111"; g.fillRect(14,17,4,3); g.fillStyle="#fff"; g.fillRect(13,16,2,1);
    g.fillStyle="#ff6b6b"; g.fillRect(7,17,3,3); g.fillRect(22,17,3,3); g.fillStyle="#111"; g.fillRect(8,18,1,2); g.fillRect(23,18,1,2);
    px(g,10,30,2,4,"#7dff9b"); px(g,20,30,2,3,"#7dff9b");
  };
  D.phoenix = (g,tint)=>{
    g.fillStyle="#ff9d2e";
    g.beginPath(); g.moveTo(14,22); g.lineTo(3,10); g.lineTo(6,17); g.fill();
    g.beginPath(); g.moveTo(18,22); g.lineTo(29,10); g.lineTo(26,17); g.fill();
    g.fillStyle="#ffd93d"; g.fillRect(5,14,4,2); g.fillRect(23,14,4,2);
    px(g,11,28,3,8,"#7a1f1f"); px(g,18,28,3,8,"#7a1f1f");
    px(g,10,15,12,13,tint); px(g,12,17,8,8,"#ffcf7a");
    px(g,11,6,10,8,"#ff5a2e"); px(g,13,4,6,4,"#ffd93d");
    g.fillStyle="#111"; g.fillRect(13,12,2,2); g.fillRect(17,12,2,2);
    px(g,14,22,4,3,"#c94040");
  };
  D.yeti = (g,tint)=>{
    px(g,8,30,6,6,shade(tint,-30)); px(g,18,30,6,6,shade(tint,-30));
    px(g,9,14,14,18,"#dfe9f2"); px(g,11,16,10,14,"#ffffff");
    px(g,9,16,4,10,"#b9c9d9"); px(g,19,16,4,10,"#b9c9d9");
    px(g,11,6,10,9,"#f2f7fb");
    g.fillStyle="#111"; g.fillRect(13,9,2,2); g.fillRect(17,9,2,2);
    px(g,13,13,6,2,"#7a9ab0"); px(g,25,18,3,10,"#b9c9d9");
  };
  D.peak_dragon = (g,tint)=>{
    const mid=shade(tint,-15), dk=shade(tint,-35), deep=shade(tint,-70), lite=shade(tint,45);
    const belly="#f2d0a0", bellyD=shade(belly,-32), horn="#e8e0d0", fire="#ff7b2e", ember="#ffd93d";
    // far wing: widened mid-red sail, outlined, 3 fingers
    g.fillStyle=mid;
    g.beginPath(); g.moveTo(11,22); g.lineTo(0,2); g.lineTo(2,10); g.lineTo(5,9); g.lineTo(6,16); g.lineTo(9,15); g.lineTo(11,22); g.fill();
    px(g,0,2,1,16,deep); px(g,0,2,5,1,deep);
    px(g,1,5,2,8,lite); px(g,5,9,2,7,lite); px(g,8,13,2,6,lite);
    px(g,1,8,3,10,shade(mid,-18));
    px(g,0,1,3,3,horn);
    px(g,10,20,4,3,dk); // shoulder joint
    // tail with spade
    px(g,1,29,9,3,dk); px(g,0,27,4,3,dk); px(g,4,29,5,1,deep);
    px(g,0,25,2,3,horn); px(g,0,24,4,1,horn);
    // hind leg
    px(g,8,28,6,6,dk); px(g,9,29,4,3,mid);
    px(g,7,33,9,3,deep);
    px(g,7,34,2,2,horn); px(g,11,34,2,2,horn); px(g,14,34,2,2,horn);
    // torso + scale rows + segmented belly
    px(g,7,22,18,9,tint); px(g,7,22,18,2,lite); px(g,7,29,18,2,deep);
    px(g,8,24,3,1,dk); px(g,13,24,3,1,dk); px(g,18,24,3,1,dk);
    px(g,9,26,14,3,belly); px(g,9,26,14,1,"#fff"); px(g,9,28,14,1,bellyD);
    px(g,13,26,1,3,bellyD); px(g,17,26,1,3,bellyD);
    // dorsal spikes on dark bases + center crown spike
    px(g,9,19,4,2,deep); px(g,13,18,4,2,deep); px(g,17,19,4,2,deep);
    px(g,10,16,3,4,horn); px(g,14,15,3,5,horn); px(g,18,16,3,4,horn);
    px(g,10,16,3,1,"#ffffff"); px(g,14,15,3,1,"#ffffff");
    // ember heart
    px(g,12,24,5,2,fire); px(g,13,24,3,1,ember);
    // near wing: bright sail, outlined, 3 fingers, claw, arm muscle
    g.fillStyle=tint;
    g.beginPath(); g.moveTo(19,22); g.lineTo(31,2); g.lineTo(29,10); g.lineTo(26,9); g.lineTo(25,16); g.lineTo(22,15); g.lineTo(20,22); g.fill();
    px(g,31,2,1,15,deep); px(g,27,2,4,1,deep);
    px(g,28,5,2,9,lite); px(g,24,9,2,8,lite); px(g,21,13,2,7,lite);
    px(g,22,8,6,8,shade(tint,-18));
    px(g,30,1,2,3,horn);
    px(g,18,20,5,3,mid);
    // foreleg
    px(g,20,28,5,6,tint); px(g,21,29,3,3,lite);
    px(g,19,33,8,3,deep);
    px(g,19,34,2,2,horn); px(g,23,34,2,2,horn);
    // neck + throat
    px(g,20,13,6,10,tint); px(g,21,15,3,7,belly); px(g,21,19,3,1,bellyD);
    // head profile: longer snout, attached fangs, crown
    px(g,18,7,10,6,tint); px(g,18,7,10,1,dk);
    px(g,25,9,7,4,mid); px(g,25,9,7,1,lite); px(g,25,12,7,1,dk);
    px(g,30,10,1,1,"#111"); px(g,30,12,1,1,fire);
    px(g,21,12,10,2,deep);
    px(g,22,13,2,3,"#fff"); px(g,26,13,2,3,"#fff"); px(g,29,12,2,3,"#fff");
    px(g,22,15,8,2,shade(tint,-15));
    // eye with ember glow ring + brow
    px(g,20,9,5,4,fire); px(g,21,9,4,4,ember); px(g,22,10,2,3,"#111"); px(g,22,9,2,1,"#fff");
    px(g,19,8,7,1,dk); px(g,19,7,7,1,deep);
    // horns: anchored swept-back pair + center crown nub
    px(g,14,4,4,2,horn); px(g,12,2,3,3,horn); px(g,14,4,4,1,"#ffffff");
    px(g,24,4,4,2,horn); px(g,27,2,3,3,horn); px(g,24,4,4,1,"#ffffff");
    px(g,19,4,3,2,horn);
  };
  // FROSTWYRM v2: glacier-crown serpent, ice-fin coils, boxed horned head
  D.frostwyrm = (g,tint)=>{
    const mid=shade(tint,-25), dk=shade(tint,-55), deep=shade(tint,-95), lite="#ffffff", ink="#0a2030";
    const belly="#eef7ff", fin="#d8f1ff", eye="#5ff2ff";
    // coil: heavy S across the base
    px(g,4,29,22,5,dk); px(g,4,29,22,1,mid);
    px(g,2,26,8,4,mid); px(g,22,26,8,4,mid); px(g,22,26,8,1,lite);
    px(g,6,24,6,3,tint); px(g,20,24,6,3,tint);
    // ice-fin spines along the coil
    px(g,6,21,3,4,fin); px(g,11,20,3,5,fin); px(g,16,20,3,5,fin); px(g,21,20,3,5,fin); px(g,26,22,2,4,fin);
    px(g,6,21,3,1,lite); px(g,11,20,3,1,lite); px(g,16,20,3,1,lite); px(g,21,20,3,1,lite);
    // tail tip crystal
    px(g,1,28,3,3,fin); px(g,1,28,3,1,lite);
    // rising neck + throat, dark rear edge + neck fin
    px(g,22,12,6,13,tint); px(g,22,12,6,2,mid); px(g,28,13,1,12,dk);
    px(g,23,14,4,9,belly); px(g,23,14,4,1,lite);
    px(g,20,16,2,7,fin); px(g,20,16,2,1,lite);
    px(g,20,8,10,6,tint); px(g,20,8,10,1,mid); px(g,29,8,1,6,dk);
    // snout + jaw line
    px(g,26,10,5,3,mid); px(g,26,10,5,1,lite); px(g,27,13,3,2,dk);
    px(g,25,13,6,1,ink);
    px(g,27,13,1,3,"#fff"); px(g,30,13,1,3,"#fff");
    // swept ice horns
    px(g,16,4,4,3,fin); px(g,14,2,3,3,fin); px(g,16,4,4,1,lite);
    px(g,22,3,4,3,fin); px(g,25,1,3,3,fin); px(g,22,3,4,1,lite);
    // bigger cyan eye: glow socket, ink pupil, glint, heavy brow
    px(g,20,9,6,5,eye); px(g,21,10,4,4,ink); px(g,22,11,2,2,"#fff"); px(g,21,9,2,1,lite);
    px(g,19,8,8,1,dk); px(g,19,7,8,1,deep);
    // frost breath wisps
    px(g,29,8,2,1,fin); px(g,30,6,2,1,fin); px(g,28,5,1,1,fin);
    // belly frost-runes
    px(g,8,30,4,1,fin); px(g,15,30,4,1,fin); px(g,24,27,3,1,fin);
  };
  // MIRE_HYDRA v1: three-headed bog horror, mossy coils, venom fangs
  D.mire_hydra = (g,tint)=>{
    const mid=shade(tint,-20), dk=shade(tint,-45), deep=shade(tint,-80), lite=shade(tint,35);
    const belly="#a8c98a", fang="#fff", eye="#ffe14d", venom="#7dff9b";
    // mud coil base + tail
    px(g,6,30,20,5,dk); px(g,6,30,20,1,mid); px(g,2,28,5,3,dk);
    px(g,8,32,3,2,"#5a4a33"); px(g,15,32,3,2,"#5a4a33"); px(g,22,32,2,2,"#5a4a33");
    // moss patches
    px(g,9,30,3,2,"#4a8a3a"); px(g,18,31,4,2,"#4a8a3a"); px(g,24,30,2,1,"#4a8a3a");
    // three necks rising
    px(g,5,14,6,17,tint); px(g,5,14,6,1,mid); px(g,6,16,3,13,belly);
    px(g,13,12,6,19,tint); px(g,13,12,6,1,lite); px(g,14,14,3,15,belly);
    px(g,21,14,6,17,tint); px(g,21,14,6,1,mid); px(g,23,16,3,13,belly);
    // left head
    px(g,3,8,10,7,tint); px(g,3,8,10,1,lite); px(g,3,13,10,2,deep);
    px(g,4,13,1,3,fang); px(g,11,13,1,3,fang);
    g.fillStyle=eye; g.fillRect(5,10,2,2); g.fillStyle="#111"; g.fillRect(5,10,1,2);
    px(g,2,6,3,3,dk);
    // center head (crowned with bog-horns)
    px(g,11,5,10,8,tint); px(g,11,5,10,1,lite); px(g,11,11,10,2,deep);
    px(g,12,11,2,3,fang); px(g,18,11,2,3,fang);
    px(g,12,12,2,1,venom); px(g,18,12,2,1,venom);
    g.fillStyle=eye; g.fillRect(13,7,2,2); g.fillRect(17,7,2,2); g.fillStyle="#111"; g.fillRect(14,7,1,2); g.fillRect(18,7,1,2);
    px(g,10,2,3,4,belly); px(g,19,2,3,4,belly);
    // right head
    px(g,19,8,10,7,tint); px(g,19,8,10,1,mid); px(g,19,13,10,2,deep);
    px(g,20,13,1,3,fang); px(g,27,13,1,3,fang);
    g.fillStyle=eye; g.fillRect(24,10,2,2); g.fillStyle="#111"; g.fillRect(25,10,1,2);
    px(g,27,6,3,3,dk);
    // dripping slime
    px(g,9,32,1,3,venom); px(g,17,32,1,2,venom);
  };
  // TEMPEST_ROC v1: stormwall raptor, broad slate wings, hooked beak, spark crest
  D.tempest_roc = (g,tint)=>{
    const mid=shade(tint,-20), dk=shade(tint,-50), deep=shade(tint,-90), lite=shade(tint,40);
    const cream="#f2e8d0", beak="#f2b63a", spark="#ffe14d";
    // wings: broad storm sails with pale tips
    g.fillStyle=mid;
    g.beginPath(); g.moveTo(13,24); g.lineTo(0,4); g.lineTo(3,12); g.lineTo(6,11); g.lineTo(8,18); g.lineTo(11,17); g.lineTo(13,24); g.fill();
    g.beginPath(); g.moveTo(19,24); g.lineTo(32,4); g.lineTo(29,12); g.lineTo(26,11); g.lineTo(24,18); g.lineTo(21,17); g.lineTo(19,24); g.fill();
    px(g,0,3,4,2,cream); px(g,28,3,4,2,cream); px(g,2,8,3,4,lite); px(g,27,8,3,4,lite);
    px(g,4,12,4,8,tint); px(g,24,12,4,8,tint);
    // tail fan
    px(g,13,30,6,5,dk); px(g,12,32,3,4,mid); px(g,17,32,3,4,mid); px(g,14,34,4,2,cream);
    // body + breastplate of pale feathers
    px(g,11,20,10,11,tint); px(g,11,20,10,2,lite); px(g,13,22,6,8,cream); px(g,14,22,4,8,cream);
    px(g,14,24,2,5,"#c9b896"); px(g,17,24,1,5,"#c9b896");
    // talons
    px(g,11,30,4,3,deep); px(g,17,30,4,3,deep);
    px(g,10,32,2,2,beak); px(g,13,32,2,2,beak); px(g,18,32,2,2,beak); px(g,21,32,2,2,beak);
    // head: hooked beak, fierce brow
    px(g,11,10,10,9,mid); px(g,12,12,8,6,tint);
    px(g,13,15,7,3,beak); px(g,14,17,5,2,shade(beak,-40));
    px(g,18,15,3,3,"#7a4a10");
    g.fillStyle="#fff"; g.fillRect(13,12,3,3); g.fillRect(18,12,2,2);
    g.fillStyle="#111"; g.fillRect(14,13,2,2); g.fillRect(18,12,2,2);
    px(g,11,10,10,1,dk);
    // spark crest zigzag
    px(g,14,6,2,3,spark); px(g,16,4,2,3,spark); px(g,18,2,2,3,spark); px(g,20,1,2,2,spark);
    px(g,10,8,2,2,spark); px(g,22,8,2,2,spark);
  };
  // PRISM_COLOSSUS v1: walking crystal bastion, faceted plates, singing core
  D.prism_colossus = (g,tint)=>{
    const mid=shade(tint,-20), dk=shade(tint,-50), deep=shade(tint,-95), lite="#ffffff";
    const core="#7ff2ff", gold="#e8c93a";
    // pillar legs + slab feet
    px(g,8,28,6,7,dk); px(g,18,28,6,7,dk); px(g,8,28,6,1,mid); px(g,18,28,6,1,mid);
    px(g,6,34,10,2,deep); px(g,16,34,10,2,deep); px(g,6,34,10,1,gold);
    // torso: faceted plates
    px(g,7,16,18,13,mid); px(g,7,16,18,2,tint); px(g,7,27,18,2,deep);
    px(g,7,18,5,9,dk); px(g,20,18,5,9,dk);
    px(g,9,18,3,3,lite); px(g,21,24,3,3,lite);
    // singing core: gold bezel + cyan diamond
    px(g,12,20,8,8,gold); px(g,13,21,6,6,core); px(g,14,22,4,2,lite); px(g,15,24,2,2,"#0a2030");
    // heavy arms + shard fists
    px(g,2,18,5,11,dk); px(g,25,18,5,11,dk); px(g,2,18,5,2,mid); px(g,25,18,5,2,mid);
    px(g,1,28,7,4,mid); px(g,24,28,7,4,mid); px(g,2,28,2,4,lite); px(g,27,28,2,4,lite);
    // shard shoulders
    px(g,1,12,7,5,tint); px(g,0,10,4,4,lite); px(g,24,12,7,5,tint); px(g,28,10,4,4,lite);
    px(g,2,12,5,1,lite);
    // head: single visor slit, crown shard
    px(g,11,8,10,8,mid); px(g,11,8,10,1,tint);
    px(g,12,11,8,3,core); px(g,12,11,8,1,lite); px(g,15,11,2,3,"#0a2030");
    px(g,14,2,4,6,tint); px(g,14,2,4,1,lite); px(g,15,5,2,3,core);
  };
  // UMBRAL_WYRM v2: void-touched wyrm, lit dusk wings, rune-lit coils
  D.umbral_wyrm = (g,tint)=>{
    const mid=shade(tint,45), dk=shade(tint,15), deep=shade(tint,-45);
    const membrane="#5a3a9a", edge="#7a5ad0", rune="#b09aff", bone="#e8e0d0", eye="#e0cfff";
    // wings: dusk sails with glowing torn edges + bone claws
    g.fillStyle=membrane;
    g.beginPath(); g.moveTo(11,24); g.lineTo(1,4); g.lineTo(4,10); g.lineTo(2,16); g.lineTo(7,15); g.lineTo(9,22); g.lineTo(11,24); g.fill();
    g.beginPath(); g.moveTo(21,24); g.lineTo(31,4); g.lineTo(28,10); g.lineTo(30,16); g.lineTo(25,15); g.lineTo(23,22); g.lineTo(21,24); g.fill();
    px(g,1,4,2,12,edge); px(g,29,4,2,12,edge);
    px(g,2,8,2,6,dk); px(g,28,8,2,6,dk); px(g,4,12,3,5,mid); px(g,25,12,3,5,mid);
    px(g,4,12,3,1,rune); px(g,25,12,3,1,rune);
    px(g,1,3,2,3,bone); px(g,29,3,2,3,bone);
    px(g,0,16,3,2,bone); px(g,29,16,3,2,bone);
    // coiled body + tail wisp, rim-lit
    px(g,7,28,18,5,dk); px(g,7,28,18,1,mid); px(g,2,26,5,3,dk); px(g,0,24,3,3,rune);
    px(g,25,29,5,2,dk); px(g,29,27,2,2,rune); px(g,29,26,2,1,rune);
    // rune marks along the coil
    px(g,9,29,3,2,rune); px(g,14,29,3,2,rune); px(g,19,29,3,2,rune); px(g,23,29,2,1,rune);
    // rising neck, rune spine
    px(g,20,14,6,15,dk); px(g,20,14,6,1,mid); px(g,25,14,1,15,edge);
    px(g,21,16,3,11,rune);
    // head: narrow void skull, swept bone horns
    px(g,17,7,11,7,dk); px(g,17,7,11,1,mid);
    px(g,24,9,6,4,mid); px(g,24,9,6,1,rune);
    px(g,13,4,4,3,bone); px(g,11,2,3,3,bone);
    px(g,24,3,4,3,bone); px(g,27,1,3,3,bone);
    // pale void eyes, bigger, with glints
    g.fillStyle=eye; g.fillRect(19,9,4,3); g.fillRect(24,9,2,2);
    g.fillStyle="#111"; g.fillRect(20,10,2,1);
    g.fillStyle="#fff"; g.fillRect(19,9,1,1); g.fillRect(24,9,1,1);
    px(g,18,12,9,2,deep);
    px(g,20,13,1,3,bone); px(g,24,13,1,3,bone);
    // crown rune
    px(g,20,5,4,2,rune);
    px(g,18,12,9,2,deep);
    px(g,20,13,1,3,bone); px(g,24,13,1,3,bone);
    // crown rune
    px(g,20,5,3,2,rune);
  };
  D.bandit = (g,tint)=>{
    px(g,11,30,4,6,"#33333e"); px(g,17,30,4,6,"#33333e");
    px(g,9,18,14,13,tint); px(g,9,24,14,2,"#5c1216");
    px(g,8,0,16,4,"#3a2e22"); px(g,10,9,12,4,"#1c1c22");
    px(g,10,6,12,12,"#d9a06b"); g.fillStyle="#111"; g.fillRect(12,11,2,2); g.fillRect(18,11,1,2);
    px(g,25,14,2,10,"#9aa0a8"); px(g,24,23,4,2,"#5a3a22");
  };
  D.outlaw = (g,tint)=>{
    px(g,11,30,4,6,"#33333e"); px(g,17,30,4,6,"#33333e");
    px(g,9,18,14,13,tint); px(g,9,18,14,4,"#4a3a52"); px(g,9,24,14,2,"#ffd93d");
    px(g,6,7,20,3,"#2e2620"); px(g,10,2,12,6,"#2e2620"); px(g,10,2,12,1,"#d9c27f");
    px(g,10,8,12,10,"#d9a06b"); g.fillStyle="#111"; g.fillRect(12,11,2,2); g.fillRect(18,11,1,2);
    px(g,25,14,2,10,"#9aa0a8");
  };
  D.murderer = (g,tint)=>{
    px(g,11,30,4,6,"#1a1a1f"); px(g,17,30,4,6,"#1a1a1f");
    px(g,9,18,14,13,"#3a0f14"); px(g,13,14,6,1,"#7a1f1f");
    px(g,8,2,16,9,"#3a0f14"); px(g,8,2,3,15,"#3a0f14"); px(g,21,2,3,15,"#3a0f14");
    px(g,11,6,10,9,"#0c0a12"); g.fillStyle="#ff3b3b"; g.fillRect(12,10,2,2); g.fillRect(18,10,2,2);
    px(g,25,14,2,10,"#c9ccd4");
  };
  D.doppelganger = (g,tint,ph)=>{
    const P=window.Anim.normP(ph), A=window.Anim.limb(P), hb=window.Anim.hbob(P);
    const dk=shade(tint,-40), lite=shade(tint,35);
    px(g,11+A.lx,30+A.ld,4,6,"#1a1a24"); px(g,17+A.rx,30+A.rd,4,6,"#1a1a24");
    px(g,9,18,14,13,tint); px(g,9,18,3,13,lite); px(g,20,18,3,13,dk);
    px(g,6+A.lax,19+A.la,3,9,dk); px(g,23+A.rax,19+A.ra,3,9,dk);
    px(g,6+A.lax,27+A.la,3,3,"#c9c9d9"); px(g,23+A.rax,27+A.ra,3,3,"#c9c9d9");
    // stolen face bobs: blank mask, three stolen eyes, grin widens on atk
    px(g,10+A.hx,6+hb,12,12,"#c9c9d9");
    g.fillStyle="#0c0a12"; g.fillRect(11+A.hx,9+hb,10,6);
    g.fillStyle="#ffd93d"; g.fillRect(12+A.hx,10+hb,2,2); g.fillRect(18+A.hx,10+hb,2,2); g.fillRect(15+A.hx,10+hb,2,2);
    px(g,13+A.hx,15+hb,6,1+(P.atk?2:0),"#0c0a12"); px(g,14+A.hx,16+hb,4,2,"#5a1f2e");
    px(g,9,24,14,2,dk);
  };
  //__MORE2__



  const prev = window.Sprites.actor;
  // NOTE: app (custom face/outfit) must be forwarded — heroes AND npcs use
  // it, and dropping it renders everyone in the legacy default look.
  // PERF: D[kind] painters are pure functions of (kind, tint), but the old
  // wrapper redrew a fresh canvas on EVERY call — i.e. once per mob per
  // frame (hundreds of canvases/sec in a fight, each a fresh GPU texture
  // upload). Cache per kind+tint: the kind set is fixed (~92), so this is
  // bounded and turns the per-frame cost into a cache hit.
  const mobCache = new Map();
  const MOB_CACHE_MAX = 400;
  try { (window.__spriteCacheResets = window.__spriteCacheResets || []).push(() => mobCache.clear()); } catch (e) {}
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
      try { hit = mobCache.get(ck); } catch (e) { hit = null; }
      if (hit) return hit;
      const c=cv(); const g=c.getContext("2d"); g.imageSmoothingEnabled=false;
      g.clearRect(0,0,32,40);
      g.fillStyle="rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16,37,9,3,0,0,7); g.fill();
      try{ D[kind](g,tint||"#fff",P); }catch(e){}
      let out = c;
      try { out = window.Sprites.genderFX(c, gen); } catch (e) {}
      try { mobCache.set(ck, out); if (mobCache.size > MOB_CACHE_MAX) mobCache.delete(mobCache.keys().next().value); } catch (e) {}
      return out;
    }
    return prev.call(this,kind,tint,seed,gear,app,gen,ph);
  };
})();
