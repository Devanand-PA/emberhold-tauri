/* src/sprites/sprite_ink_outline.js — SMOOTH THIN INK OUTLINES (outermost).
 * Wraps Sprites.actor (all mobs/bosses/NPCs/player+gear, 32x40 -> 64x80) and
 * Sprites.boat (32x32 -> 64x64). Every other consumer draws actor/boat art
 * with explicit dw/dh or is fixed below, so the 2x output is safe:
 *   - pixels are exact 2x2 blocks (nearest upscale), so smoothing-OFF
 *     renderers show identical pixels, only finer;
 *   - the ink is a true vector stroke at 2x (thinner than 1 native px and
 *     smoother), so it stays crisp when zoomed in instead of going blocky.
 * Pipeline per unique sprite (cached; ~2ms cold, 0ms warm):
 *   solid-pixel mask (alpha>=128; faint auras/glows/ground shadows excluded)
 *   -> drop detached components <5px (sparkles/embers excluded)
 *   -> gaussian blur 0.7px (rounds the stairs; fallback where unsupported)
 *   -> bilinear upscale to 4x smooth field
 *   -> MARCHING SQUARES iso-contours (sub-pixel, saddles disambiguated)
 *   -> contour tracing, tiny-loop rejection, CHAIKIN smoothing x2
 *   -> round-join Path2D stroke centered on the true edge (like hand inking)
 * Interior detail pipeline (same smooth style, thinner ~0.45 native px):
 *   quantize opaque colors to coarse bins -> 2x DOWNSAMPLE by majority vote
 *   (thin 1px separators/highlights dissolve, major shapes touch) -> keep
 *   big lowres regions (>=4 cells) -> boundaries between different big
 *   regions -> fullres edge pixels (darker side, 1px silhouette gap) ->
 *   drop small components <6px -> walk ordered polylines (junction-split)
 *   -> CHAIKIN -> thin round-cap vector stroke. Safety: total kept >160px
 *   means too busy -> silhouette only.
 * Deliberately NOT inked: ground tiles (would grid the world), chests (their
 * canvas is grass-backed, so there is no chest silhouette to ring), emoji
 * item icons (font glyphs, not sprite art).
 * Debug: window.__noInk=true passes everything through un-inked (for A/B);
 *   window.__noInterior=true keeps silhouette ink but skips interior lines.
 */
(function(){
"use strict";
var FIELD_S = 4;              // field supersample for sub-pixel edge location
var OUT = 2;                  // output upscale (thin + zoom-proof ink)
var SOLID_TH = 128;           // mask keeps only solid pixels
var MINPX = 5;                // drop detached components smaller than this
var ISO = 128;                // contour centered on the true silhouette edge
var LINE_W = 1.3;             // vector stroke width in OUTPUT px (~0.65 native: thin)
var INK = [5, 5, 10];         // near-black ink
var CACHE_CAP = 800;
var INT_BIN = 32;             // interior: color quantization bin size
var INT_MINL = 4;             // interior: lowres cells a region needs to count as major
var INT_MINPX = 6;            // interior: drop edge components smaller than this
var INT_MAXTOT = 160;         // interior: too busy -> silhouette only
var INT_W = 0.9;              // interior stroke width in OUTPUT px (~0.45 native: thinner)
var INT_A = 0.85;             // interior stroke alpha (a touch softer than silhouette)

var maskC = null, blurC = null, bigC = null;
function cv(w,h){ const c=document.createElement("canvas"); c.width=w; c.height=h; return c; }
function pools(w,h){
  if(!maskC || maskC.width!==w || maskC.height!==h){
    maskC=cv(w,h); blurC=cv(w,h); bigC=cv(w*FIELD_S,h*FIELD_S);
  }
}

// connected-component filter on binary mask: returns Uint8 mask of kept pixels
function keepMask(bin, w, h){
  const n=w*h, seen=new Uint8Array(n), keep=new Uint8Array(n);
  const stack=[];
  for(let i=0;i<n;i++){
    if(!bin[i]||seen[i]) continue;
    stack.length=0; stack.push(i); seen[i]=1;
    const comp=[];
    while(stack.length){
      const p=stack.pop(); comp.push(p);
      const x=p%w, y=(p/w)|0;
      if(x>0&&bin[p-1]&&!seen[p-1]){seen[p-1]=1;stack.push(p-1);}
      if(x<w-1&&bin[p+1]&&!seen[p+1]){seen[p+1]=1;stack.push(p+1);}
      if(y>0&&bin[p-w]&&!seen[p-w]){seen[p-w]=1;stack.push(p-w);}
      if(y<h-1&&bin[p+w]&&!seen[p+w]){seen[p+w]=1;stack.push(p+w);}
    }
    if(comp.length>=MINPX){ for(let k=0;k<comp.length;k++) keep[comp[k]]=1; }
  }
  return keep;
}

/* ink any canvas: returns a 2x canvas, pixels nearest-upscaled (exact),
 * silhouette stroked with thin smooth vector ink on top. */
function inkCanvas(base){
  const W=base.width, H=base.height, S=FIELD_S, BW=W*S, BH=H*S;
  if(!W||!H) return base;
  let src;
  try{ src=base.getContext("2d").getImageData(0,0,W,H).data; }
  catch(e){ return base; }
  const m1=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++) m1[i]=src[i*4+3]>=SOLID_TH?1:0;
  const keep=keepMask(m1,W,H);
  pools(W,H);
  const mg=maskC.getContext("2d");
  mg.clearRect(0,0,W,H);
  const mid=mg.createImageData(W,H);
  for(let i=0;i<W*H;i++){ mid.data[i*4]=255; mid.data[i*4+1]=255; mid.data[i*4+2]=255; mid.data[i*4+3]=keep[i]?255:0; }
  mg.putImageData(mid,0,0);
  try{
    const bc=blurC.getContext("2d");
    bc.clearRect(0,0,W,H);
    try{ bc.filter="blur(0.7px)"; }catch(e){}
    bc.drawImage(maskC,0,0);
    try{ bc.filter="none"; }catch(e){}
  }catch(e){}
  const bg=bigC.getContext("2d");
  bg.imageSmoothingEnabled=true;
  try{ bg.imageSmoothingQuality="high"; }catch(e){}
  bg.clearRect(0,0,BW,BH);
  bg.drawImage(blurC,0,0,BW,BH);
  let field;
  try{ field=bg.getImageData(0,0,BW,BH).data; }catch(e){ return base; }
  const F=new Uint8Array(BW*BH);
  for(let i=0;i<BW*BH;i++) F[i]=field[i*4+3];
  const polys=traceContours(F,BW,BH,ISO);
  // 2x output, exact 2x2 pixel blocks + thin vector ink
  const out=cv(W*OUT,H*OUT), og=out.getContext("2d");
  og.imageSmoothingEnabled=false;
  og.clearRect(0,0,out.width,out.height);
  og.drawImage(base,0,0,out.width,out.height);
  if(!polys.length) return out;
  const k=OUT/S; // field px -> output px
  const minPer=(W+H)*0.35;
  og.strokeStyle="rgba("+INK[0]+","+INK[1]+","+INK[2]+",0.95)";
  og.lineWidth=LINE_W; og.lineJoin="round"; og.lineCap="round";
  const path=new Path2D();
  for(const poly of polys){
    let per=0;
    for(let i=1;i<poly.pts.length;i++){ const a=poly.pts[i-1], b=poly.pts[i]; per+=Math.hypot(b[0]-a[0], b[1]-a[1]); }
    if(poly.closed && poly.pts.length>1){ const a=poly.pts[poly.pts.length-1], b=poly.pts[0]; per+=Math.hypot(b[0]-a[0], b[1]-a[1]); }
    if(per<minPer) continue;
    const sm=chaikin(poly.pts, poly.closed);
    path.moveTo(sm[0][0]*k, sm[0][1]*k);
    for(let i=1;i<sm.length;i++) path.lineTo(sm[i][0]*k, sm[i][1]*k);
    if(poly.closed) path.closePath();
  }
  og.stroke(path);
  // ---- interior detail lines (same hand-inked style, thinner) ----
  try{
    if(!window.__noInterior){
      const lines=interiorDetail(src,W,H);
      if(lines&&lines.length){
        og.strokeStyle="rgba("+INK[0]+","+INK[1]+","+INK[2]+","+INT_A+")";
        og.lineWidth=INT_W; og.lineJoin="round"; og.lineCap="round";
        const ipath=new Path2D();
        for(const ln of lines){
          const pts=(ln.length>=3)?chaikin(ln,false):ln;
          ipath.moveTo(pts[0][0]*OUT, pts[0][1]*OUT);
          for(let i=1;i<pts.length;i++) ipath.lineTo(pts[i][0]*OUT, pts[i][1]*OUT);
        }
        og.stroke(ipath);
      }
    }
  }catch(e){}
  return out;
}

/* interior detail: quantized lowres majority regions -> boundaries between
 * major regions -> ordered sub-pixel polylines in BASE coords. Returns array
 * of point arrays ([x,y] in base px, pixel centers = integers+0.5). */
function interiorDetail(px,W,H,cap){
  const N=W*H;
  const maxTot=(typeof cap==="number"&&cap>0)?cap:INT_MAXTOT;
  const op=new Uint8Array(N);
  for(let i=0;i<N;i++) op[i]=px[i*4+3]>=SOLID_TH?1:0;
  const B=INT_BIN;
  const q=new Int32Array(N);
  for(let i=0;i<N;i++){
    if(!op[i]){ q[i]=-1; continue; }
    q[i]=(((px[i*4]/B)|0)*8+((px[i*4+1]/B)|0))*8+((px[i*4+2]/B)|0);
  }
  // 2x downsample by majority vote (thin 1px separators dissolve)
  const LW=Math.max(1,(W/2)|0), LH=Math.max(1,(H/2)|0);
  const lq=new Int32Array(LW*LH).fill(-1), lop=new Uint8Array(LW*LH);
  for(let ly=0;ly<LH;ly++)for(let lx=0;lx<LW;lx++){
    let best=-1,bn=0,n=0;
    const votes=Object.create(null);
    for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
      const x=lx*2+dx, y=ly*2+dy;
      if(x>=W||y>=H) continue;
      const i=y*W+x;
      if(!op[i]) continue;
      n++;
      const v=q[i], c=(votes[v]|0)+1;
      votes[v]=c;
      if(c>bn){ bn=c; best=v; }
    }
    if(n>=2){ lop[ly*LW+lx]=1; lq[ly*LW+lx]=best; }
  }
  // lowres connected components of equal bins; keep major regions
  const seen=new Uint8Array(LW*LH), cid=new Int32Array(LW*LH).fill(-1);
  const sizes=[];
  let nc=0;
  for(let i=0;i<LW*LH;i++){
    if(!lop[i]||seen[i]) continue;
    const stack=[i]; seen[i]=1;
    const cells=[], qq=lq[i];
    while(stack.length){
      const p=stack.pop(); cells.push(p);
      const x=p%LW;
      const nb=[p-1,p+1,p-LW,p+LW], xs=[x-1,x+1,x,x];
      for(let t=0;t<4;t++){
        if(t<2&&(xs[t]<0||xs[t]>=LW)) continue;
        const j=nb[t];
        if(j<0||j>=LW*LH) continue;
        if(lop[j]&&!seen[j]&&lq[j]===qq){ seen[j]=1; stack.push(j); }
      }
    }
    for(let t=0;t<cells.length;t++) cid[cells[t]]=nc;
    sizes.push(cells.length); nc++;
  }
  const big=new Uint8Array(nc);
  for(let t=0;t<nc;t++) if(sizes[t]>=INT_MINL) big[t]=1;
  const isB=(li)=>lop[li]&&big[cid[li]];
  // fullres edge pixels on major boundaries (darker side) + sub-pixel points
  const lum=new Float32Array(N);
  for(let i=0;i<N;i++) lum[i]=0.299*px[i*4]+0.587*px[i*4+1]+0.114*px[i*4+2];
  const edge=new Uint8Array(N);
  const ex=new Float32Array(N), ey=new Float32Array(N);
  let ecount=0;
  for(let ly=0;ly<LH;ly++)for(let lx=0;lx<LW;lx++){
    const li=ly*LW+lx;
    if(!isB(li)) continue;
    // right neighbor
    if(lx+1<LW){
      const lj=li+1;
      if(isB(lj)&&cid[lj]!==cid[li]){
        for(let dy=0;dy<2;dy++){
          const y=ly*2+dy;
          if(y>=H) continue;
          const xa=lx*2+1, xb=(lx+1)*2;
          if(xa>=W||xb>=W) continue;
          const a=y*W+xa, b=y*W+xb;
          if(!op[a]||!op[b]) continue;
          const t=(lum[a]<lum[b])?a:b, o=(t===a)?b:a;
          const tx=t%W, ty=(t/W)|0, ox=o%W, oy=(o/W)|0;
          if(!edge[t]){ edge[t]=1; ecount++; ex[t]=tx+0.5+(ox-tx)*0.5; ey[t]=ty+0.5+(oy-ty)*0.5; }
        }
      }
    }
    // down neighbor
    if(ly+1<LH){
      const lj=li+LW;
      if(isB(lj)&&cid[lj]!==cid[li]){
        for(let dx=0;dx<2;dx++){
          const x=lx*2+dx;
          if(x>=W) continue;
          const ya=ly*2+1, yb=(ly+1)*2;
          if(ya>=H||yb>=H) continue;
          const a=ya*W+x, b=yb*W+x;
          if(!op[a]||!op[b]) continue;
          const t=(lum[a]<lum[b])?a:b, o=(t===a)?b:a;
          const tx=t%W, ty=(t/W)|0, ox=o%W, oy=(o/W)|0;
          if(!edge[t]){ edge[t]=1; ecount++; ex[t]=tx+0.5+(ox-tx)*0.5; ey[t]=ty+0.5+(oy-ty)*0.5; }
        }
      }
    }
  }
  if(!ecount||ecount>maxTot) return null;
  // 1px silhouette gap so interior never touches the outline
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x;
    if(!edge[i]) continue;
    const l=x>0?op[i-1]:0, r=x+1<W?op[i+1]:0, u=y>0?op[i-W]:0, dn=y+1<H?op[i+W]:0;
    if(!l||!r||!u||!dn){ edge[i]=0; ecount--; }
  }
  if(!ecount) return null;
  // fullres components, drop small ones
  const seen2=new Uint8Array(N), comp=new Int32Array(N).fill(-1);
  const csizes=[];
  let nc2=0;
  for(let i=0;i<N;i++){
    if(!edge[i]||seen2[i]) continue;
    const stack=[i]; seen2[i]=1;
    const cells=[];
    while(stack.length){
      const p=stack.pop(); cells.push(p);
      const x=p%W, y=(p/W)|0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy) continue;
        const nx=x+dx, ny=y+dy;
        if(nx<0||ny<0||nx>=W||ny>=H) continue;
        const j=ny*W+nx;
        if(edge[j]&&!seen2[j]){ seen2[j]=1; stack.push(j); }
      }
    }
    for(let t=0;t<cells.length;t++) comp[cells[t]]=nc2;
    csizes.push(cells.length); nc2++;
  }
  const keep=new Uint8Array(N);
  let kept=0;
  for(let i=0;i<N;i++){
    if(edge[i]&&csizes[comp[i]]>=INT_MINPX){ keep[i]=1; kept++; }
  }
  if(!kept||kept>maxTot) return null;
  // walk ordered polylines (junction-split), positions from boundary points
  const deg=new Int8Array(N);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x;
    if(!keep[i]) continue;
    let n=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy) continue;
      const nx=x+dx, ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H) continue;
      if(keep[ny*W+nx]) n++;
    }
    deg[i]=n;
  }
  const seen3=new Uint8Array(N), lines=[];
  function walk(s){
    const line=[];
    let cur=s, prev=-1;
    for(let guard=0;guard<N+8;guard++){
      seen3[cur]=1;
      line.push([ex[cur],ey[cur]]);
      const x=cur%W, y=(cur/W)|0;
      const cands=[];
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy) continue;
        const nx=x+dx, ny=y+dy;
        if(nx<0||ny<0||nx>=W||ny>=H) continue;
        const j=ny*W+nx;
        if(j===prev) continue;
        if(keep[j]&&!seen3[j]) cands.push(j);
      }
      if(!cands.length) break;
      if(cands.length>1) break; // junction: end segment here
      prev=cur; cur=cands[0];
    }
    return line;
  }
  for(let i=0;i<N;i++) if(keep[i]&&!seen3[i]&&deg[i]===1){
    const ln=walk(i);
    if(ln.length>=2) lines.push(ln);
  }
  for(let i=0;i<N;i++) if(keep[i]&&!seen3[i]){
    const ln=walk(i);
    if(ln.length>=2) lines.push(ln);
  }
  return lines.length?lines:null;
}

/* marching squares: grid points = field pixels, iso-contour -> ordered
 * loops/paths. Nodes are grid EDGES ("h x,y" / "v x,y") so shared crossings
 * hash exactly; saddle cases (5, 10) resolved by cell average. */
function traceContours(F, BW, BH, iso){
  const nodePos=new Map(), segs=[];
  function node(id,x,y){ if(!nodePos.has(id)) nodePos.set(id,[x,y]); }
  function cross(v0,x0,y0,v1,x1,y1){ const t=(iso-v0)/(v1-v0); return [x0+t*(x1-x0), y0+t*(y1-y0)]; }
  for(let cy=0;cy<BH-1;cy++){
    for(let cx=0;cx<BW-1;cx++){
      const a=F[cy*BW+cx], b=F[cy*BW+cx+1], c=F[(cy+1)*BW+cx+1], d=F[(cy+1)*BW+cx];
      let idx=0;
      if(a>iso)idx|=8; if(b>iso)idx|=4; if(c>iso)idx|=2; if(d>iso)idx|=1;
      if(idx===0||idx===15) continue;
      const top="h"+cx+","+cy, right="v"+(cx+1)+","+cy, bot="h"+cx+","+(cy+1), left="v"+cx+","+cy;
      const pT=cross(a,cx,cy,b,cx+1,cy), pR=cross(b,cx+1,cy,c,cx+1,cy+1),
            pB=cross(d,cx,cy+1,c,cx+1,cy+1), pL=cross(a,cx,cy,d,cx,cy+1);
      const emit=(i1,q1,i2,q2)=>{ node(i1,q1[0],q1[1]); node(i2,q2[0],q2[1]); segs.push([i1,i2]); };
      switch(idx){
        case 1: case 14: emit(left,pL,bot,pB); break;
        case 2: case 13: emit(bot,pB,right,pR); break;
        case 3: case 12: emit(left,pL,right,pR); break;
        case 4: case 11: emit(top,pT,right,pR); break;
        case 6: case 9: emit(top,pT,bot,pB); break;
        case 7: case 8: emit(top,pT,left,pL); break;
        case 5: case 10: {
          const merge=((a+b+c+d)/4)>iso;
          if(idx===5){
            if(merge){ emit(top,pT,left,pL); emit(right,pR,bot,pB); }
            else { emit(top,pT,right,pR); emit(left,pL,bot,pB); }
          } else {
            if(merge){ emit(top,pT,right,pR); emit(left,pL,bot,pB); }
            else { emit(top,pT,left,pL); emit(right,pR,bot,pB); }
          }
          break;
        }
      }
    }
  }
  const adj=new Map();
  segs.forEach((s,i)=>{
    if(!adj.has(s[0]))adj.set(s[0],[]);
    if(!adj.has(s[1]))adj.set(s[1],[]);
    adj.get(s[0]).push(i); adj.get(s[1]).push(i);
  });
  const used=new Uint8Array(segs.length), polys=[];
  function step(cur){
    const cand=adj.get(cur)||[];
    for(let k=0;k<cand.length;k++){ if(!used[cand[k]]) return cand[k]; }
    return -1;
  }
  for(let i=0;i<segs.length;i++){
    if(used[i]) continue;
    used[i]=1;
    const s0=segs[i], startId=s0[0];
    const pts=[nodePos.get(s0[0]), nodePos.get(s0[1])];
    let cur=s0[1], closed=false, guard=segs.length+16;
    while(guard-->0){
      if(cur===startId){ closed=true; break; }
      const j=step(cur);
      if(j<0) break;
      used[j]=1;
      const s=segs[j], nxt=(s[0]===cur)?s[1]:s[0];
      pts.push(nodePos.get(nxt)); cur=nxt;
    }
    if(!closed){
      cur=startId; guard=segs.length+16;
      while(guard-->0){
        const j=step(cur);
        if(j<0) break;
        used[j]=1;
        const s=segs[j], nxt=(s[0]===cur)?s[1]:s[0];
        pts.unshift(nodePos.get(nxt)); cur=nxt;
      }
    }
    polys.push({pts:pts, closed:closed});
  }
  return polys;
}

/* Chaikin curve smoothing: 2 passes, corners cut into flowing curves */
function chaikin(pts, closed){
  let p=pts;
  for(let k=0;k<2;k++){
    const q=[];
    if(closed){
      for(let i=0;i<p.length;i++){
        const a=p[i], b=p[(i+1)%p.length];
        q.push([a[0]*0.75+b[0]*0.25, a[1]*0.75+b[1]*0.25]);
        q.push([a[0]*0.25+b[0]*0.75, a[1]*0.25+b[1]*0.75]);
      }
    } else {
      q.push(p[0]);
      for(let i=0;i<p.length-1;i++){
        const a=p[i], b=p[i+1];
        q.push([a[0]*0.75+b[0]*0.25, a[1]*0.75+b[1]*0.25]);
        q.push([a[0]*0.25+b[0]*0.75, a[1]*0.25+b[1]*0.75]);
      }
      q.push(p[p.length-1]);
    }
    p=q;
  }
  return p;
}

var prevActor=null, prevBoat=null;
try{ prevActor=window.Sprites.actor; }catch(e){}
try{ if(window.Sprites.boat) prevBoat=window.Sprites.boat; }catch(e){}
if(prevActor){
  const cache=new Map();
  try{ (window.__spriteCacheResets=window.__spriteCacheResets||[]).push(function(){ cache.clear(); }); }catch(e){}
  window.Sprites.actor=function(kind,tint,seed,gear,app,gen,ph){
    if(window.__noInk){ try{ return prevActor.call(this,kind,tint,seed,gear,app,gen,ph); }catch(e){} }
  let P=null,bk="";
  try{ if(window.Anim){ if(ph){ P=window.Anim.normP(ph); bk="|"+window.Anim.bucket(ph); } else P=window.Anim.normP(null); } }catch(e){}
  let gearK="", appK="";
  try{
    if(gear){
      if(gear.w||gear.a||gear.s||gear.o) gearK=(gear.w||"")+"|"+(gear.a||"")+"|"+(gear.s||"")+"|"+(gear.o||"");
      else gearK=String(JSON.stringify(gear)).slice(0,160);
    }
  }catch(e){}
  try{
    if(app){
      if(window.Appearance&&window.Appearance.key) appK=window.Appearance.key(app);
      else appK=String(JSON.stringify(app)).slice(0,160);
    }
  }catch(e){}
  const ck="INK3|"+kind+"|"+(tint||"")+"|"+String(seed||"")+"|"+(gen||"")+"|"+gearK+"|"+appK+bk;
    let hit=null; try{ hit=cache.get(ck); }catch(e){}
    if(hit) return hit;
    let base=null;
    try{ base=prevActor.call(this,kind,tint,seed,gear,app,gen,ph); }catch(e){ return null; }
    let out=null;
    try{ out=(base&&base.width===32&&base.height===40)?inkCanvas(base):base; }catch(e){ out=base; }
    try{ cache.set(ck,out); if(cache.size>CACHE_CAP) cache.delete(cache.keys().next().value); }catch(e){}
    return out;
  };
}
if(prevBoat){
  const bcache=new Map();
  try{ (window.__spriteCacheResets=window.__spriteCacheResets||[]).push(function(){ bcache.clear(); }); }catch(e){}
  window.Sprites.boat=function(kind){
    if(window.__noInk){ try{ return prevBoat.call(this,kind); }catch(e){} }
    const ck="INKC|"+String(kind||"raft");
    let hit=null; try{ hit=bcache.get(ck); }catch(e){}
    if(hit) return hit;
    let base=null;
    try{ base=prevBoat.call(this,kind); }catch(e){ return null; }
    let out=null;
    try{ out=(base&&base.width>0&&base.height>0)?inkCanvas(base):base; }catch(e){ out=base; }
    try{ bcache.set(ck,out); if(bcache.size>16) bcache.delete(bcache.keys().next().value); }catch(e){}
    return out;
  };
}
window.__inkOutlineLoaded=true;
})();
