/* src/sprites/sprite_hell_parity2.js — PARITY v2: goddess-grade face lift + silhouette fixes.
 * Loaded AFTER sprite_hell_parity.js (outermost). Wraps Sprites.actor again for
 * the 20 listed kinds: draws back-layer extras (kitsune 9-tail fan, peter wings/
 * halo/blood, medusa stalks), draws the v1 parity sprite, then repaints the
 * face box (x10..21, y9..17 + bob) with goddess-grade detail:
 * skin base + lite top + dk bottom + side shade + forehead light, blush 2x1,
 * lash 3x1, iris 3x2 w/ pupil + catchlight, brow, nose, mouth (opens on atk).
 */
(function(){
"use strict";
const KINDS = ["hell_magus","ember_inquisitor","hollow_cantor","nether_abbess","pyre_queen","void_prelate","organ_choirmaster","skin_pope","succubus_matriarch","volcano_pontiff","umbral_matriarch","flesh_sculptor","blood_evangel","mirror_abbot","bile_cardinal","infernal_overlord","gut_empress","medusa_queen","kitsune_ninetails","peter_the_fallen"];
function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(x|0,y|0,w|0,h|0); }
function P_of(ph){ try{ return window.Anim.normP(ph); }catch(e){ return {f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; } }
function Hb_of(P){ try{ return window.Anim.hbob(P); }catch(e){ return 0; } }
function Hx_of(P){ try{ const a=window.Anim.limb(P); return a.hx||0; }catch(e){ return 0; } }

/* per-boss face palette + extras */
const FACE = {
 hell_magus:      {skin:"#d8b8d0",lite:"#f2e2f2",dk:"#9a789a",blush:"#e8a0c0",iris:"#c05aff",brow:"#3a1a4a",lip:"#8a2a5a",extra:"wiccan"},
 ember_inquisitor:{skin:"#e0b088",lite:"#ffe0b8",dk:"#a87858",blush:"#e89a78",iris:"#ffb82a",brow:"#4a2010",lip:"#8a2a1a",extra:"scar"},
 hollow_cantor:   {skin:"#c8c0d0",lite:"#ece8f2",dk:"#8a829a",blush:"#c09ab8",iris:"#a06aff",brow:"#2a2438",lip:"#7a2a4a",extra:"hollow"},
 nether_abbess:   {skin:"#d0b0c0",lite:"#f0d8e2",dk:"#907888",blush:"#d890a8",iris:"#9a4aff",brow:"#2a1230",lip:"#8a2a4a",extra:"veil"},
 pyre_queen:      {skin:"#f0c8a8",lite:"#ffe8d0",dk:"#b08868",blush:"#ff9a8a",iris:"#ff5a1a",brow:"#5a2010",lip:"#c01a1a",extra:"queen"},
 void_prelate:    {skin:"#b0a8c8",lite:"#e0d8f2",dk:"#6a6488",blush:"#a08ab8",iris:"#7a3aff",brow:"#141020",lip:"#5a2a6a",extra:"voidstar"},
 organ_choirmaster:{skin:"#e8c0b8",lite:"#ffe0d8",dk:"#a88880",blush:"#e89890",iris:"#4a2a3a",brow:"#3a2028",lip:"#7a1a1a",extra:"sing"},
 skin_pope:       {skin:"#e8c8a8",lite:"#ffecD0".toLowerCase(),dk:"#a88868",blush:"#d89a80",iris:"#5a3a2a",brow:"#4a3018",lip:"#8a3a2a",extra:"stitch"},
 succubus_matriarch:{skin:"#f2b8c8",lite:"#ffd8e2",dk:"#b07888",blush:"#ff8aa8",iris:"#ff2a6a",brow:"#4a1020",lip:"#d01a4a",extra:"beauty"},
 volcano_pontiff: {skin:"#d8a878",lite:"#ffD8a8".toLowerCase(),dk:"#986848",blush:"#c07850",iris:"#ff6a1a",brow:"#3a2010",lip:"#7a2a10",extra:"crack"},
 umbral_matriarch:{skin:"#d0b8d0",lite:"#f0dcf0",dk:"#887898",blush:"#b090b8",iris:"#8a4aff",brow:"#241a38",lip:"#6a1a4a",extra:"moon"},
 flesh_sculptor:  {skin:"#d8a8a0",lite:"#f8d0c8",dk:"#986868",blush:"#c08880",iris:"#2a8a4a",brow:"#3a2828",lip:"#7a2a2a",extra:"stitch"},
 blood_evangel:   {skin:"#e8c0b0",lite:"#ffdfd0",dk:"#a08070",blush:"#d89080",iris:"#c01a1a",brow:"#3a1818",lip:"#a01212",extra:"drip"},
 mirror_abbot:    {skin:"#d8dce2",lite:"#f4f6fa",dk:"#8a9098",blush:"#b0b8c0",iris:"#3a5a7a",brow:"#2a3438",lip:"#5a626a",extra:"crack"},
 bile_cardinal:   {skin:"#c8b888",lite:"#ece8c0",dk:"#887858",blush:"#a89868",iris:"#5a7a1a",brow:"#2a3410",lip:"#5a4a1a",extra:"boil"},
 infernal_overlord:{skin:"#e89a68",lite:"#ffd0a0",dk:"#a05a38",blush:"#c06a40",iris:"#ff2a00",brow:"#3a1808",lip:"#7a1a00",extra:"fang"},
 gut_empress:     {skin:"#d89890",lite:"#f8c0b8",dk:"#885858",blush:"#b86860",iris:"#ffb82a",brow:"#382018",lip:"#8a2a3a",extra:"maw"},
 medusa_queen:    {skin:"#b8d8a8",lite:"#dcf2d0",dk:"#688858",blush:"#90b880",iris:"#2a7a2a",brow:"#1a3a1a",lip:"#c05a7a",extra:"snakeeye"},
 kitsune_ninetails:{skin:"#f2c898",lite:"#ffe8c8",dk:"#b08858",blush:"#ff9a78",iris:"#c08a1a",brow:"#5a3010",lip:"#a04a2a",extra:"fox"},
 peter_the_fallen:{skin:"#c8b8d0",lite:"#e8dcf0",dk:"#685878",blush:"#8a5a7a",iris:"#ff2a5a",brow:"#0c0612",lip:"#4a0a1a",extra:"fallen"},
};

function paintFace(g, X0, Y0, o, atk){
  const {skin,lite,dk,blush,iris,brow,lip,extra} = o;
  // base box 12x9
  px(g,X0,Y0,12,9,skin);
  px(g,X0,Y0,12,1,lite);
  px(g,X0,Y0+7,12,2,dk);
  px(g,X0,Y0,1,9,dk); px(g,X0+11,Y0,1,9,dk);
  px(g,X0+1,Y0+1,10,1,lite);                       // forehead light
  px(g,X0+1,Y0+4,2,1,blush); px(g,X0+9,Y0+4,2,1,blush); // blush 2x1
  // brows
  px(g,X0+2,Y0+2,3,1,brow); px(g,X0+7,Y0+2,3,1,brow);
  // lash + iris 3x2 + pupil + catchlight
  px(g,X0+2,Y0+3,3,1,"#140a10"); px(g,X0+7,Y0+3,3,1,"#140a10");
  px(g,X0+2,Y0+4,3,2,iris);  px(g,X0+7,Y0+4,3,2,iris);
  px(g,X0+3,Y0+4,1,2,"#0a0a0a"); px(g,X0+8,Y0+4,1,2,"#0a0a0a");
  px(g,X0+2,Y0+4,1,1,"#fff"); px(g,X0+7,Y0+4,1,1,"#fff");
  if(extra==="voidstar"||extra==="snakeeye"||extra==="hollow"){ px(g,X0+3,Y0+5,1,1,"#fff"); px(g,X0+8,Y0+5,1,1,"#fff"); }
  // nose
  px(g,X0+6,Y0+5,1,1,dk); px(g,X0+6,Y0+6,1,1,dk);
  // mouth (opens on atk)
  if(atk){ px(g,X0+5,Y0+7,3,1,"#2a0a0a"); px(g,X0+5,Y0+7,3,1,lip); px(g,X0+6,Y0+7,1,1,"#fff"); }
  else px(g,X0+5,Y0+7,3,1,lip);
  // extras
  if(extra==="scar") px(g,X0+8,Y0+6,2,1,"#7a3a20");
  if(extra==="stitch"){ px(g,X0+1,Y0+6,1,1,"#5a2a2a"); px(g,X0+10,Y0+6,1,1,"#5a2a2a"); }
  if(extra==="fang"){ px(g,X0+5,Y0+7,1,1,"#fff"); px(g,X0+7,Y0+7,1,1,"#fff"); }
  if(extra==="maw"){ px(g,X0+4,Y0+7,5,1,"#3a0a12"); px(g,X0+5,Y0+7,1,1,"#fff"); }
  if(extra==="drip"){ px(g,X0+2,Y0+7,1,2,"#a01212"); px(g,X0+9,Y0+5,1,2,"#a01212"); }
  if(extra==="boil"){ px(g,X0+1,Y0+2,1,1,"#7a9a2a"); px(g,X0+10,Y0+3,1,1,"#7a9a2a"); }
  if(extra==="crack"){ px(g,X0+6,Y0+1,1,3,"rgba(0,0,0,0.35)"); }
  if(extra==="moon"){ px(g,X0+6,Y0,1,1,"#fff"); }
  if(extra==="queen"){ px(g,X0+5,Y0+7,3,1,"#e01a1a"); }
  if(extra==="beauty"){ px(g,X0+9,Y0+6,1,1,"#4a1020"); }
  if(extra==="veil"){ px(g,X0,Y0+8,12,1,"rgba(20,8,24,0.45)"); }
  if(extra==="hollow"){ px(g,X0+2,Y0+3,3,3,"#0c0614"); px(g,X0+7,Y0+3,3,3,"#0c0614"); px(g,X0+3,Y0+4,1,1,iris); px(g,X0+8,Y0+4,1,1,iris); px(g,X0+3,Y0+4,1,1,"#fff"); px(g,X0+8,Y0+4,1,1,"#fff"); }
  if(extra==="voidstar"){ px(g,X0+3,Y0+4,1,1,"#fff"); px(g,X0+8,Y0+5,1,1,"#c05aff"); }
  if(extra==="snakeeye"){ px(g,X0+3,Y0+4,2,1,"#ffd93d"); px(g,X0+8,Y0+4,2,1,"#ffd93d"); }
  if(extra==="fox"){
    px(g,X0-1,Y0+4,1,1,lite); px(g,X0+12,Y0+4,1,1,lite);   // cheek fur
    px(g,X0-2,Y0+5,2,1,"#5a3010"); px(g,X0+12,Y0+5,2,1,"#5a3010"); // whiskers
    px(g,X0-2,Y0+6,2,1,"#5a3010"); px(g,X0+12,Y0+6,2,1,"#5a3010");
  }
  if(extra==="fallen"){
    // bleeding brow + bigger glow pupils + idle fangs + blood tears
    px(g,X0+3,Y0+4,1,2,"#ff5a7a"); px(g,X0+8,Y0+4,1,2,"#ff5a7a");
    px(g,X0+2,Y0+3,1,2,"#ff2a5a"); px(g,X0+9,Y0+3,1,2,"#ff2a5a");
    px(g,X0+3,Y0+6,1,1,"#a01212"); px(g,X0+8,Y0+6,1,1,"#a01212");
    px(g,X0+5,Y0+7,3,1,"#0a0208");
    px(g,X0+5,Y0+7,1,1,"#fff"); px(g,X0+7,Y0+7,1,1,"#fff");
    if(atk){ px(g,X0+4,Y0+7,5,2,"#0a0208"); px(g,X0+5,Y0+7,1,1,"#fff"); px(g,X0+7,Y0+7,1,1,"#fff"); px(g,X0+5,Y0+8,3,1,"#a01212"); }
  }
  if(extra==="wicked"||extra==="wiccan"){ px(g,X0+6,Y0+1,1,1,"#8a3aaa"); }
}

/* back-layer extras drawn BEFORE base sprite */
function paintBack(g, kind, P){
  const hb = Hb_of(P);
  if(kind==="kitsune_ninetails"){
    // 9-tail fan: roots (16,28), tips fan out; orange w/ dark outline + white tips
    for(let i=-4;i<=4;i++){
      const tipX = 16 + i*3.4, tipY = 34 - Math.abs(i)*1.2 - 8;
      const midX = 16 + i*1.8, midY = 30;
      const c = i%2 ? "#e89a3a" : "#f0aa4a";
      // tail stalk (stepped, narrowed so tails separate)
      px(g,midX-1,midY,2,4,"#7a4a1a");
      px(g,midX-1,midY,2,4,c);
      px(g,tipX-2,tipY,4,6,"#7a4a1a");
      px(g,tipX-2,tipY+1,4,4,c);
      px(g,tipX-1,tipY,2,2,"#fff2d0");           // white tip
      px(g,tipX-1,tipY+1,1,1,"#fff");
    }
  }
  if(kind==="peter_the_fallen"){
    const flap = (window.Anim && window.Anim.flap) ? (()=>{try{return window.Anim.flap(P);}catch(e){return 0;}})() : 0;
    // huge torn wings
    for(const s of [-1,1]){
      const bx = s<0 ? 2 : 24;
      px(g,bx,10+hb+flap,6,14,"#0c0612");
      px(g,bx+(s<0?1:0),12+hb+flap,4,10,"#1e0f24");
      px(g,bx+(s<0?0:5),10+hb+flap,1,14,"#3a1a3a"); // bone finger
      px(g,bx+(s<0?2:2),14+hb+flap,2,3,"#a01212");  // tear blood
      px(g,bx+(s<0?1:3),22+hb+flap,2,1,"#ff2a5a");
      // membrane glints
      px(g,bx+1,12+hb+flap,1,3,"#5a2a5a"); px(g,bx+3,16+hb+flap,1,3,"#5a2a5a");
    }
    // blood pool rim
    px(g,6,36,20,2,"#40060c"); px(g,8,36,16,1,"#a01212"); px(g,10,36,3,1,"#ff2a5a");
    // brighter broken halo + shards + glow
    g.fillStyle="rgba(255,42,90,0.30)"; g.beginPath(); g.arc(16,5+hb,9,0,7); g.fill();
  }
  if(kind==="medusa_queen"){
    // extra side stalks + tongues
    for(const s of [-1,1]){
      px(g,s<0?6:24,6+hb,2,5,"#2a6a2a");
      px(g,s<0?6:24,5+hb,3,3,"#3a8a3a"); px(g,s<0?6:24,5+hb,3,1,"#5ad05a");
      px(g,s<0?7:25,6+hb,1,1,"#fff"); px(g,s<0?6:25,8+hb,2,1,"#c01a3a");
    }
  }
  if(kind==="succubus_matriarch"){
    // bat wings
    for(const s of [-1,1]){
      const bx = s<0?1:25;
      px(g,bx,14+hb,6,9,"#5a0a24"); px(g,bx+1,15+hb,4,7,"#8a1a3a");
      px(g,bx,14+hb,6,1,"#ff6a9a");
    }
  }
  if(kind==="pyre_queen"||kind==="infernal_overlord"||kind==="volcano_pontiff"||kind==="ember_inquisitor"){
    g.fillStyle="rgba(255,120,30,0.22)"; g.beginPath(); g.arc(16,20+hb,14,0,7); g.fill();
  }
  if(kind==="void_prelate"||kind==="umbral_matriarch"||kind==="nether_abbess"||kind==="hollow_cantor"){
    g.fillStyle="rgba(120,80,255,0.20)"; g.beginPath(); g.arc(16,20+hb,14,0,7); g.fill();
  }
  if(kind==="gut_empress"){
    // bulk sides
    px(g,4,22+hb,5,10,"#4a1420"); px(g,23,22+hb,5,10,"#4a1420");
    px(g,5,24+hb,3,6,"#6a1a2a"); px(g,24,24+hb,3,6,"#6a1a2a");
  }
}

const prev = window.Sprites.actor;
const cache = new Map();
window.Sprites.actor = function(kind,tint,seed,gear,app,gen,ph){
  if(FACE[kind]){
    gen=(gen==="male"||gen==="female")?gen:"";
    let P=null,bk="";
    try{ if(window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph); } else P=window.Anim.normP(null); } }catch(e){ P={f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0}; }
    const ck="HPAR2|"+kind+"|"+(tint||"#fff")+"|"+gen+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    const c=document.createElement("canvas"); c.width=32; c.height=40;
    const g=c.getContext("2d"); g.imageSmoothingEnabled=false; g.clearRect(0,0,32,40);
    try{
      paintBack(g, kind, P||{});
      const base = prev.call(this,kind,tint,seed,gear,app,gen,ph);
      g.drawImage(base,0,0);
      const hb=Hb_of(P||{}), hx=Hx_of(P||{});
      if(kind==="kitsune_ninetails"){
        // fox ears re-top (keep base ears, add inner + jewel) + face
        paintFace(g, 10+hx, 9+hb, FACE[kind], !!(P&&P.atk));
        px(g,11+hx,8+hb,2,1,"#fff2d0"); px(g,19+hx,8+hb,2,1,"#fff2d0");
      } else if(kind==="peter_the_fallen"){
        paintFace(g, 10+hx, 9+hb, FACE[kind], !!(P&&P.atk));
        // blaze eye bigger on forehead + crown glints + blood-edged blades
        px(g,13+hx,5+hb,6,4,"#ff2a5a"); px(g,14+hx,6+hb,4,2,"#fff");
        px(g,15+hx,6+hb,2,2,"#ff2a5a"); px(g,15+hx,6+hb,1,1,"#fff");
        px(g,13+hx,5+hb,6,1,"#ffd0e0"); px(g,13+hx,9+hb,6,1,"#40060c");
      } else {
        paintFace(g, 10+hx, 9+hb, FACE[kind], !!(P&&P.atk));
      }
      // universal gold glints on regalia rows
      px(g,7,29,1,1,"#fff"); px(g,24,29,1,1,"#fff");
    }catch(e){}
    let out=c; try{ out=window.Sprites.genderFX(c,gen); }catch(e){}
    try{ cache.set(ck,out); if(cache.size>800) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  }
  return prev.call(this,kind,tint,seed,gear,app,gen,ph);
};
window.__hellParity2Loaded = true;
})();
