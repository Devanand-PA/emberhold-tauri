/* Procedural pixel-art sprites. window.Sprites */
window.Sprites = (() => {
  const S = 32;
  function cv(s = S) { const c = document.createElement("canvas"); c.width = c.height = s; return c; }
  function px(g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(x, y, w, h); }
  // Deterministic pseudo random from string
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const tiles = {};
  const tileVariants = {}; // id -> [canvas...]; variant 0 === tiles[id] (back-compat)
  // Tiles drawn as transparent overlays over a ground underlay (canopy /
  // lantern only — no baked ground). The ground bake composites the nearest
  // ground-like neighbor underneath, so trees and lamps sit naturally on
  // grass, sand, townstone, snow... instead of dragging a grass square along.
  const OVERLAY_TILES = { 3: true, 4: true, 20: true, 22: true, 35: true, 36: true };
 // Ids that may show through beneath an overlay (walkable open ground).
  const GROUNDLIKE = { 0: 1, 1: 1, 2: 1, 7: 1, 8: 1, 9: 1, 13: 1, 24: 1, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 31: 1, 32: 1, 34: 1 };
  // Deterministic variant pick from world coords — stable across loads and
  // sessions, no storage needed.
  function tileVariantIndex(t, gx, gy) {
    try {
      const arr = tileVariants[t];
      if (!arr || arr.length < 2) return 0;
      let h = (Math.imul(gx | 0, 374761393) + Math.imul(gy | 0, 668265263)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) % arr.length;
    } catch (e) { return 0; }
  }
  function tileFor(t, gx, gy) {
    try {
      const arr = tileVariants[t];
      if (arr && arr.length) return arr[tileVariantIndex(t, gx, gy)] || arr[0] || tiles[t] || null;
      return tiles[t] || null;
    } catch (e) { return tiles[t] || null; }
  }
  // bakeOutline: a static 1px silhouette ring drawn DIRECTLY into the pixels
  // (every opaque pixel touching transparency takes the outline color).
  // Terrain and trees never change, so this runs once at paint time — zero
  // per-frame cost, unlike the sprite ink pass (kept for dynamic
  // mobs/bosses/NPCs/boats in sprite_ink_outline.js).
  function bakeOutline(c, r, gg, b) {
    try {
      const g = c.getContext("2d"), W = c.width, H = c.height;
      const img = g.getImageData(0, 0, W, H), d = img.data;
      const edge = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i + 3] < 128) continue;
        const l = x > 0 ? d[i - 1] : 0, rr = x < W - 1 ? d[i + 7] : 0;
        const u = y > 0 ? d[i - W * 4 + 3] : 0, dn = y < H - 1 ? d[i + W * 4 + 3] : 0;
        if (l < 128 || rr < 128 || u < 128 || dn < 128) edge[y * W + x] = 1;
      }
      for (let k = 0; k < W * H; k++) if (edge[k]) { const i = k * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; }
      g.putImageData(img, 0, 0);
    } catch (e) {}
    return c;
  }
  function grassBase(g, seed, base = "#4c9a4c", dark = "#438a43", light = "#5cab5c") {
    px(g, 0, 0, 32, 32, base);
    const r = mulberry(seed);
    for (let i = 0; i < 46; i++) {
      const x = (r() * 32) | 0, y = (r() * 32) | 0;
      px(g, x, y, 2, 2, r() < 0.5 ? dark : light);
    }
  }
  // --- ground painters: full-bleed opaque. Variants differ in speckle seed
  // and feature placement only — never outlines (rings would grid the world).
  function paintGrass(g, v) {
    if (!v) { grassBase(g, 7); return; }
    grassBase(g, 70 + v * 13);
    const r = mulberry(700 + v * 37);
    g.fillStyle = "#3a7a3a";
    for (let i = 0; i < 3; i++) { const x = 3 + ((r() * 26) | 0), y = 4 + ((r() * 24) | 0); g.fillRect(x, y, 1, 4); g.fillRect(x - 1, y + 1, 3, 1); }
    if (v === 2) { px(g, 20, 22, 3, 2, "#8a8a92"); px(g, 21, 21, 1, 1, "#c9ccd4"); }
    if (v === 3) { px(g, 6, 9, 2, 2, "#63b765"); px(g, 24, 18, 2, 2, "#63b765"); }
  }
  function paintTall(g, v) {
    grassBase(g, 11 + v * 5);
    g.fillStyle = "#2f7a2f";
    for (let i = 0; i < 9; i++) { const x = 2 + ((i * 3 + v * 5) % 28), y = 6 + (((i * 7) + v * 3) % 18); g.fillRect(x, y, 2, 6); g.fillRect(x - 1, y - 2, 2, 3); }
  }
 function paintFlower(g, v) {
   grassBase(g, 13 + v * 7);
   const cols = [["#ff6b9d", "#ffd93d", "#ffffff"], ["#ffd93d", "#ffffff", "#ff6b9d"], ["#ffffff", "#ff6b9d", "#ffd93d"]][v % 3];
    // Baked outline (static pixels, zero runtime cost): a dark-green rim is
    // painted behind each bloom + stem, then the flower is drawn on top, so
    // a 1px ring survives. Same treatment as the tree bakeOutline, but drawn
    // by hand — bakeOutline on this full-bleed opaque tile would only ring
    // the tile border and grid the world.
    for (let i = 0; i < 3; i++) {
      const x = 6 + ((i * 9 + v * 4) % 19), y = 8 + ((i * 5 + v * 6) % 12);
      px(g, x - 3, y - 7, 8, 6, "#234d1f"); // bloom rim (1px around the head)
      px(g, x - 1, y - 5, 4, 8, "#234d1f"); // stem rim (1px around the stalk)
      px(g, x, y - 4, 2, 6, "#2f7a2f"); px(g, x - 2, y - 6, 6, 4, cols[i]); px(g, x - 1, y - 5, 2, 2, "#ffea00");
    }
 }
  function paintSand(g, v) {
    px(g, 0, 0, 32, 32, "#d9c27f");
    const r = mulberry(41 + v * 17);
    for (let i = 0; i < 30; i++) px(g, (r() * 32) | 0, (r() * 32) | 0, 2, 1, r() < 0.5 ? "#c9b26e" : "#e6d194");
    if (v === 1) { px(g, 9, 12, 3, 2, "#b0a080"); px(g, 10, 11, 1, 1, "#d0c0a0"); px(g, 22, 20, 2, 2, "#b0a080"); }
    else if (v === 2) { px(g, 4, 10, 12, 1, "#c9b26e"); px(g, 16, 22, 12, 1, "#c9b26e"); }
    else if (v === 3) { px(g, 7, 18, 2, 2, "#f4ecd8"); px(g, 9, 18, 2, 2, "#e0d4b8"); px(g, 23, 8, 3, 2, "#c9b26e"); }
  }
 function paintPath(g, v) {
   px(g, 0, 0, 32, 32, "#a98a5f");
   const r = mulberry(51 + v * 19);
    // Speckle stays clear of the tile rim (2..29 x, 3..28 y) so no pixel
    // touches a neighbor tile — edge-touching speckle used to line up into
    // faint horizontal stripes across paths. Interior worn patches below
    // carry the texture instead of full-width bands (removed).
    for (let i = 0; i < 34; i++) px(g, 2 + ((r() * 28) | 0), 3 + ((r() * 26) | 0), 2, 2, r() < 0.5 ? "#96764f" : "#bb9c6c");
    if (v === 1) { px(g, 8, 12, 6, 3, "#96764f"); px(g, 20, 20, 4, 2, "#8a6c46"); }
    else if (v === 2) { px(g, 22, 8, 3, 2, "#bb9c6c"); px(g, 6, 22, 4, 2, "#8a6c46"); }
    else if (v === 3) { px(g, 12, 14, 8, 4, "#9a7a52"); px(g, 13, 15, 6, 2, "#8a6c46"); }
    else { px(g, 14, 8, 4, 3, "#96764f"); px(g, 8, 22, 5, 2, "#bb9c6c"); }
  }
  function paintTown(g, v) {
    px(g, 0, 0, 32, 32, "#9a9aa2"); px(g, 1, 1, 14, 13, "#a8a8b0"); px(g, 17, 1, 14, 13, "#a2a2aa"); px(g, 1, 16, 14, 15, "#a2a2aa"); px(g, 17, 16, 14, 15, "#a8a8b0");
    g.fillStyle = "#7a7a82"; g.fillRect(0, 14, 32, 2); g.fillRect(15, 0, 2, 32);
    if (v === 1) { px(g, 4, 4, 5, 1, "#6a6a72"); px(g, 8, 4, 1, 4, "#6a6a72"); }
    else if (v === 2) { px(g, 20, 20, 3, 2, "#5d7a4a"); px(g, 24, 6, 2, 2, "#5d7a4a"); }
  }
  function paintFloor(g, v) {
    px(g, 0, 0, 32, 32, "#3d3d4a"); px(g, 1, 1, 30, 30, "#464655");
    const r = mulberry(61 + v * 23);
    for (let i = 0; i < 16; i++) px(g, (r() * 30) | 0, (r() * 30) | 0, 2, 2, "#33333e");
    g.fillStyle = "#2c2c36"; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32);
    if (v === 1) { px(g, 20, 8, 4, 4, "#33333e"); px(g, 8, 22, 5, 3, "#33333e"); }
  }
  function paintPlanks(g, v) {
    px(g, 0, 0, 32, 32, "#8a5a33");
    for (let y = 0; y < 32; y += 8) { px(g, 0, y, 32, 7, (y + v * 8) % 16 ? "#96703e" : "#8a5a33"); px(g, 0, y + 7, 32, 1, "#4a2f1a"); px(g, 2, y + 2, 28, 1, "rgba(255,255,255,0.12)"); }
    for (let y = 4; y < 32; y += 8) for (let x = 4; x < 32; x += 12) { px(g, (x + v * 3) % 30 + 1, y, 1, 1, "#2e1c0e"); }
  }
  function paintRubble(g, v) {
    px(g, 0, 0, 32, 32, "#7a6a55");
    const r25 = mulberry(251 + v * 31);
    for (let i = 0; i < 26; i++) px(g, (r25() * 32) | 0, (r25() * 32) | 0, 2, 2, r25() < 0.5 ? "#6a5a46" : "#8a7a62");
    const o = v * 2;
    px(g, 4 + o, 18, 12, 9, "#8a8a92"); px(g, 5 + o, 19, 10, 7, "#9a9aa2"); px(g, 6 + o, 20, 3, 2, "#c9ccd4");
    px(g, 18 - o, 8, 10, 7, "#6b4226"); px(g, 19 - o, 9, 8, 2, "#8a5a33"); px(g, 20 - o, 12, 5, 2, "#4a2f1a");
    px(g, 8, 6, 6, 4, "#55555f"); px(g, 9, 7, 4, 2, "#7a7a88");
  }
  function paintIce(g, v) {
    px(g, 0, 0, 32, 32, "#9fd4e8");
    const r26 = mulberry(261 + v * 29);
    for (let i = 0; i < 14; i++) px(g, (r26() * 30) | 0, (r26() * 30) | 0, 3, 1, r26() < 0.5 ? "#c4ecfa" : "#8ac4dc");
    px(g, 4, 6, 10, 1, "#e8faff"); px(g, 18, 20, 9, 1, "#e8faff"); px(g, 10, 12, 1, 12, "#e8faff"); px(g, 0, 0, 32, 1, "#e8faff");
    if (v === 1) { px(g, 22, 6, 6, 1, "#e8faff"); px(g, 6, 24, 8, 1, "#8ac4dc"); }
  }
  function paintAsh(g, v) {
    px(g, 0, 0, 32, 32, "#3a3230");
    const r27 = mulberry(271 + v * 41);
    for (let i = 0; i < 18; i++) px(g, (r27() * 30) | 0, (r27() * 30) | 0, 2, 2, r27() < 0.5 ? "#2e2826" : "#4a4040");
    px(g, 5, 8, 8, 1, "#ff7b2e"); px(g, 18, 20, 9, 1, "#ff9d2e"); px(g, 12, 14, 1, 6, "#ffd93d");
    if (v === 1) { px(g, 22, 8, 6, 1, "#ff7b2e"); px(g, 8, 24, 1, 5, "#ffd93d"); }
  }
  function paintMoss(g, v) {
    px(g, 0, 0, 32, 32, "#2e6b34");
    const r28 = mulberry(281 + v * 43);
    for (let i = 0; i < 22; i++) px(g, (r28() * 30) | 0, (r28() * 30) | 0, 2, 2, r28() < 0.5 ? "#25602c" : "#3f8a46");
    const o = v * 6;
    px(g, 6 + o, 8, 2, 4, "#cfe8b0"); px(g, 7 + o, 6, 4, 2, "#e8f5d0"); px(g, 22 - o, 18, 2, 4, "#cfe8b0"); px(g, 21 - o, 16, 4, 2, "#e8f5d0");
  }
  function paintBone(g, v) {
    px(g, 0, 0, 32, 32, "#6e6250");
    const r29 = mulberry(291 + v * 47);
    for (let i = 0; i < 16; i++) px(g, (r29() * 30) | 0, (r29() * 30) | 0, 2, 1, r29() < 0.5 ? "#5e5346" : "#7e7260");
    const o = v * 3;
    px(g, 6, 10 + o, 12, 3, "#e8e4d8"); for (let x = 7; x < 17; x += 3) px(g, x, 10 + o, 1, 3, "#9a968a");
    px(g, 20 - o, 20, 6, 5, "#e8e4d8"); px(g, 21 - o, 22, 2, 2, "#1a1a1f"); px(g, 24 - o, 22, 2, 2, "#1a1a1f");
  }
  function paintWax(g, v) {
    px(g, 0, 0, 32, 32, "#c9922e");
    const r31 = mulberry(311 + v * 53);
    for (let i = 0; i < 16; i++) px(g, (r31() * 30) | 0, (r31() * 30) | 0, 3, 2, r31() < 0.5 ? "#b8821f" : "#d9a83f");
    const o = v * 4;
    px(g, 4 + o, 4, 8, 6, "#e8c05a"); px(g, 20 - o, 18, 8, 6, "#e8c05a"); px(g, 4 + o, 9, 8, 1, "#8a5f14"); px(g, 20 - o, 23, 8, 1, "#8a5f14");
  }
 function paintFlesh(g, v) {
   px(g, 0, 0, 32, 32, "#6e2a2a");
   const r32 = mulberry(321 + v * 59);
   for (let i = 0; i < 18; i++) px(g, (r32() * 30) | 0, (r32() * 30) | 0, 3, 1, r32() < 0.5 ? "#5e2222" : "#7e3434");
   const o = v * 3;
   px(g, 5, 10 + o, 10, 2, "#c98888"); px(g, 10 + o, 5, 2, 12, "#c98888"); px(g, 20 - o, 20, 8, 2, "#c98888"); px(g, 6, 22 - o, 6, 4, "#8a4040");
 }
  function paintCloud(g, v) {
    // walkable dawn-cloud: pearl white with soft blue shade + gold-lit puffs.
    // Full-bleed opaque like grass (never outlines — would grid the sky).
    // Keep the 2px border near base tones so neighbouring variants blend.
    px(g, 0, 0, 32, 32, "#e9f1fa");
    const r = mulberry(341 + v * 61);
    for (let i = 0; i < 30; i++) px(g, 2 + ((r() * 28) | 0), 2 + ((r() * 28) | 0), 3, 2, r() < 0.5 ? "#dbe7f5" : "#fbfdff");
    for (let i = 0; i < 10; i++) px(g, 2 + ((r() * 28) | 0), 2 + ((r() * 28) | 0), 2, 1, r() < 0.6 ? "#c9dcf0" : "#fff7dd");
    // soft billows: white caps over pale-blue shade
    const o = (v % 3) * 5;
    px(g, 4 + o, 18, 12, 7, "#d2e0f1"); px(g, 6 + o, 16, 8, 4, "#ffffff");
    px(g, 18 - o, 8, 10, 6, "#d2e0f1"); px(g, 20 - o, 6, 6, 4, "#ffffff");
    if (v === 0) {
      // dawn blush: pink-gold wash pooling low
      px(g, 3, 25, 11, 4, "#ffe3d0"); px(g, 5, 26, 7, 2, "#ffd0b8");
      px(g, 20, 5, 8, 3, "#fff3d8"); px(g, 22, 24, 6, 2, "#ffe9a8");
    } else if (v === 1) {
      // high curls: comma swirls riding the wind
      px(g, 8, 8, 7, 3, "#ffffff"); px(g, 13, 6, 4, 3, "#ffffff"); px(g, 15, 9, 2, 4, "#dbe7f5");
      px(g, 16, 20, 8, 3, "#ffffff"); px(g, 22, 18, 4, 3, "#ffffff"); px(g, 16, 23, 3, 2, "#c9dcf0");
      px(g, 6, 24, 8, 2, "#ffe9a8");
    } else if (v === 2) {
      // blue hollow: a scooped dip with deep shade + bright rim
      px(g, 10, 12, 12, 9, "#c2d8ee"); px(g, 12, 14, 8, 5, "#a9c8e8");
      px(g, 10, 12, 12, 2, "#ffffff"); px(g, 10, 12, 2, 9, "#f4f8ff");
      px(g, 13, 16, 3, 2, "#ffffff"); px(g, 24, 25, 6, 2, "#ffe9a8");
    } else if (v === 3) {
      // gold veins: thin dawnlight cracks + sparkle cluster
      px(g, 5, 6, 2, 10, "#ffdf9e"); px(g, 7, 10, 6, 2, "#ffdf9e");
      px(g, 21, 18, 2, 9, "#ffdf9e"); px(g, 19, 24, 6, 2, "#ffdf9e");
      px(g, 12, 14, 2, 2, "#fffbe8"); px(g, 25, 9, 2, 2, "#fffbe8"); px(g, 9, 22, 2, 2, "#fffbe8");
      px(g, 4, 26, 8, 2, "#ffe9a8");
    } else if (v === 4) {
      // puff cluster: stacked cotton billows with grey-blue underbellies
      px(g, 6, 20, 9, 6, "#ccdcef"); px(g, 7, 18, 7, 4, "#ffffff");
      px(g, 17, 22, 10, 6, "#ccdcef"); px(g, 18, 20, 8, 4, "#ffffff");
      px(g, 12, 9, 8, 5, "#d8e4f4"); px(g, 13, 7, 6, 4, "#ffffff");
      px(g, 23, 12, 5, 2, "#ffe9a8");
    } else {
      // still drift: glassy calm sheet, faint long ripples + lone glint
      px(g, 4, 12, 24, 1, "#f7fbff"); px(g, 6, 19, 20, 1, "#dde9f7"); px(g, 9, 25, 14, 1, "#f7fbff");
      px(g, 15, 15, 2, 2, "#fffbe8"); px(g, 15, 14, 1, 4, "#ffedb8"); px(g, 14, 15, 4, 1, "#ffedb8");
      px(g, 5, 27, 7, 2, "#ffe9a8");
    }
    px(g, 10, 10, 6, 2, "#ffffff"); px(g, 12, 22, 8, 2, "#f4f8ff");
  }
  // --- overlay painters: TRANSPARENT canvas, object only. Soft shadows use
  // low alpha (no outline ring); the silhouette gets a baked 1px rim.
  function shadowBlob(g, x, y, w, h) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, y, w, h); }
  function paintOak(g, v) {
    if (v === 0) {
      shadowBlob(g, 9, 29, 14, 2);
      px(g, 13, 18, 6, 14, "#6b4226"); px(g, 14, 20, 2, 10, "#8a5a33");
      px(g, 6, 4, 20, 16, "#2d6a2d"); px(g, 9, 2, 14, 8, "#3f8a3f"); px(g, 8, 8, 4, 4, "#55aa55"); px(g, 20, 6, 4, 4, "#55aa55");
    } else if (v === 1) {
      shadowBlob(g, 8, 29, 17, 2);
      px(g, 15, 17, 6, 15, "#6b4226"); px(g, 16, 19, 2, 11, "#8a5a33"); px(g, 12, 24, 2, 5, "#4a2f1a");
      px(g, 4, 5, 24, 15, "#2d6a2d"); px(g, 7, 3, 18, 7, "#3f8a3f"); px(g, 6, 9, 5, 4, "#55aa55"); px(g, 22, 8, 4, 4, "#55aa55"); px(g, 13, 5, 6, 3, "#6fbf6f");
    } else if (v === 2) {
      shadowBlob(g, 8, 29, 14, 2);
      px(g, 11, 18, 6, 14, "#6b4226"); px(g, 12, 20, 2, 10, "#8a5a33"); px(g, 16, 22, 3, 4, "#4a2f1a");
      px(g, 7, 3, 18, 17, "#2d6a2d"); px(g, 10, 1, 12, 7, "#3f8a3f"); px(g, 9, 7, 4, 4, "#55aa55"); px(g, 19, 10, 4, 4, "#55aa55");
   } else {
     shadowBlob(g, 7, 29, 18, 2);
      // Canopy (y6-19) overlaps the trunk top (y19): variant 3 used to leave
      // a fully transparent row 19 between them, so the crown read as
      // floating — bakeOutline then ringed both sides of the gap.
      px(g, 12, 19, 8, 13, "#6b4226"); px(g, 14, 21, 3, 9, "#8a5a33");
      px(g, 5, 6, 22, 14, "#2d6a2d"); px(g, 9, 3, 14, 7, "#3f8a3f"); px(g, 7, 9, 5, 5, "#55aa55"); px(g, 20, 8, 5, 5, "#55aa55"); px(g, 13, 9, 6, 4, "#6fbf6f");
    }
  }
  function paintPine(g, v) {
    if (v === 0) {
      shadowBlob(g, 11, 30, 10, 2);
      px(g, 14, 24, 4, 8, "#5a3a22");
      px(g, 16 - 8, 16, 16, 8, "#1f5c33"); px(g, 16 - 6, 9, 12, 8, "#256b3c"); px(g, 16 - 4, 3, 8, 7, "#2d7d46");
    } else if (v === 1) {
      shadowBlob(g, 10, 30, 12, 2);
      px(g, 14, 23, 4, 9, "#5a3a22");
      px(g, 7, 17, 18, 7, "#1f5c33"); px(g, 9, 10, 14, 8, "#256b3c"); px(g, 11, 4, 10, 7, "#2d7d46"); px(g, 13, 4, 4, 2, "#bfe3c8");
    } else if (v === 2) {
      shadowBlob(g, 12, 30, 8, 2);
      px(g, 15, 24, 4, 8, "#5a3a22");
      px(g, 9, 16, 14, 8, "#1f5c33"); px(g, 11, 9, 10, 8, "#256b3c"); px(g, 13, 2, 8, 8, "#2d7d46"); px(g, 12, 12, 2, 4, "#3f8a46");
    } else {
      shadowBlob(g, 11, 30, 10, 2);
      px(g, 14, 24, 4, 8, "#5a3a22");
      px(g, 8, 15, 16, 9, "#1f5c33"); px(g, 10, 8, 12, 8, "#256b3c"); px(g, 12, 2, 8, 7, "#2d7d46"); px(g, 13, 2, 6, 2, "#e8f4ff");
    }
  }
  function paintSakura(g, v) {
    if (v === 0) {
      shadowBlob(g, 10, 29, 12, 2);
      px(g, 13, 18, 6, 14, "#5a3a2a"); px(g, 14, 20, 2, 10, "#7a4a34");
      px(g, 5, 4, 22, 16, "#e8a0c0"); px(g, 8, 2, 16, 8, "#f2b8d0"); px(g, 7, 8, 5, 5, "#f7d0e0"); px(g, 20, 6, 5, 5, "#f7d0e0"); px(g, 12, 10, 8, 5, "#fff0f5");
    } else if (v === 1) {
      shadowBlob(g, 8, 29, 16, 2);
      px(g, 15, 18, 6, 14, "#5a3a2a"); px(g, 16, 20, 2, 10, "#7a4a34"); px(g, 12, 24, 2, 4, "#4a3226");
      px(g, 3, 5, 26, 15, "#e8a0c0"); px(g, 6, 3, 20, 7, "#f2b8d0"); px(g, 5, 9, 5, 5, "#f7d0e0"); px(g, 23, 8, 4, 4, "#f7d0e0"); px(g, 12, 11, 9, 4, "#fff0f5");
    } else if (v === 2) {
      shadowBlob(g, 10, 29, 12, 2);
      px(g, 12, 19, 6, 13, "#5a3a2a"); px(g, 13, 21, 2, 9, "#7a4a34");
      px(g, 6, 3, 20, 17, "#e8a0c0"); px(g, 9, 1, 14, 8, "#f2b8d0"); px(g, 8, 8, 4, 4, "#f7d0e0"); px(g, 20, 9, 4, 4, "#f7d0e0"); px(g, 12, 9, 7, 5, "#fff0f5");
    } else {
      shadowBlob(g, 9, 29, 14, 2);
      px(g, 14, 20, 5, 12, "#5a3a2a"); px(g, 15, 22, 2, 8, "#7a4a34"); px(g, 9, 16, 3, 6, "#5a3a2a");
      px(g, 4, 6, 24, 14, "#e8a0c0"); px(g, 8, 4, 16, 6, "#f2b8d0"); px(g, 6, 10, 6, 5, "#f7d0e0"); px(g, 21, 9, 5, 5, "#f7d0e0"); px(g, 12, 11, 8, 4, "#fff0f5");
    }
  }
  // --- alien trees (hell wilds): transparent overlays like oak/pine/sakura.
  // SHROOM: giant violet shroom-cap on a pale stalk, glowing spore dots.
  function paintShroom(g, v) {
    if (v === 0) {
      shadowBlob(g, 9, 29, 14, 2);
      px(g, 13, 16, 6, 14, "#cfc4d8"); px(g, 14, 18, 2, 10, "#a89ab8"); px(g, 17, 20, 2, 8, "#8a7a9e");
      px(g, 5, 6, 22, 12, "#6a3a9e"); px(g, 8, 3, 16, 6, "#8a5ac8"); px(g, 7, 8, 5, 5, "#9a6ad8"); px(g, 20, 7, 5, 5, "#9a6ad8");
      px(g, 10, 10, 3, 3, "#d0f0ff"); px(g, 18, 12, 2, 2, "#d0f0ff"); px(g, 14, 6, 3, 2, "#e8faff");
    } else if (v === 1) {
      shadowBlob(g, 8, 29, 16, 2);
      px(g, 15, 15, 5, 15, "#cfc4d8"); px(g, 16, 17, 2, 11, "#a89ab8");
      px(g, 3, 7, 26, 11, "#5a2e8e"); px(g, 6, 4, 20, 6, "#7a4ab8"); px(g, 5, 10, 5, 4, "#8a5ac8"); px(g, 23, 9, 4, 4, "#8a5ac8");
      px(g, 9, 9, 3, 2, "#bfe8ff"); px(g, 20, 12, 3, 3, "#d0f0ff"); px(g, 14, 5, 2, 2, "#e8faff");
    } else if (v === 2) {
      // rose-magenta morph: same pale stalk, warm cap so the four
      // variants read as one violet family (never a surface tree)
      shadowBlob(g, 10, 29, 12, 2);
      px(g, 12, 17, 6, 13, "#cfc4d8"); px(g, 13, 19, 2, 9, "#a89ab8");
      px(g, 6, 8, 20, 11, "#9e2e7e"); px(g, 9, 5, 14, 7, "#c85aa8"); px(g, 8, 11, 4, 4, "#e88ac8"); px(g, 21, 10, 4, 4, "#e88ac8");
      px(g, 11, 9, 2, 2, "#ffe8f4"); px(g, 19, 13, 3, 2, "#ffd0f0");
    } else {
      shadowBlob(g, 9, 29, 14, 2);
      px(g, 14, 14, 5, 16, "#cfc4d8"); px(g, 15, 16, 2, 12, "#a89ab8"); px(g, 9, 22, 3, 6, "#cfc4d8");
      px(g, 4, 5, 24, 12, "#6a3a9e"); px(g, 8, 2, 16, 6, "#8a5ac8"); px(g, 6, 8, 5, 5, "#9a6ad8"); px(g, 21, 7, 5, 5, "#9a6ad8");
      px(g, 10, 7, 3, 3, "#d0f0ff"); px(g, 18, 11, 2, 2, "#e8faff"); px(g, 13, 4, 2, 2, "#fff");
    }
  }
  // SPIRE: teal crystal spire cluster on dark stone foot, lit facets.
  function paintSpire(g, v) {
    if (v === 0) {
      shadowBlob(g, 10, 29, 12, 2);
      px(g, 9, 24, 14, 6, "#3a3450"); px(g, 11, 24, 10, 1, "#5a5078");
      px(g, 13, 6, 6, 19, "#2e8aa8"); px(g, 14, 6, 2, 19, "#bfefff"); px(g, 13, 6, 6, 2, "#e8fdff");
      px(g, 6, 14, 5, 11, "#28788e"); px(g, 7, 14, 1, 11, "#9ae8ff");
      px(g, 21, 12, 5, 13, "#3795ae"); px(g, 22, 12, 1, 13, "#bfefff");
    } else if (v === 1) {
      shadowBlob(g, 9, 29, 14, 2);
      px(g, 10, 24, 12, 6, "#3a3450");
      px(g, 8, 12, 6, 13, "#2e8aa8"); px(g, 9, 12, 2, 13, "#bfefff");
      px(g, 15, 4, 7, 21, "#3795ae"); px(g, 16, 4, 2, 21, "#e8fdff"); px(g, 15, 4, 7, 2, "#fff");
      px(g, 22, 16, 4, 9, "#28788e"); px(g, 23, 16, 1, 9, "#9ae8ff");
    } else if (v === 2) {
      shadowBlob(g, 10, 29, 12, 2);
      px(g, 11, 25, 10, 5, "#46345e"); px(g, 12, 25, 8, 1, "#6a5090");
      px(g, 12, 8, 8, 18, "#6a3ab8"); px(g, 13, 8, 2, 18, "#d8c8ff"); px(g, 12, 8, 8, 2, "#f0e8ff");
      px(g, 5, 16, 5, 10, "#4e2e8e"); px(g, 6, 16, 1, 10, "#b89aff");
      px(g, 22, 14, 5, 12, "#7a4ac8"); px(g, 23, 14, 1, 12, "#d8c8ff");
    } else {
      shadowBlob(g, 8, 29, 16, 2);
      px(g, 9, 24, 14, 6, "#3a3450"); px(g, 10, 24, 12, 1, "#5a5078");
      px(g, 11, 10, 5, 15, "#3795ae"); px(g, 12, 10, 1, 15, "#bfefff");
      px(g, 17, 2, 6, 23, "#2e8aa8"); px(g, 18, 2, 2, 23, "#e8fdff"); px(g, 17, 2, 6, 2, "#fff");
      px(g, 23, 16, 4, 9, "#28788e");
    }
  }
  function paintLantern(g, v) {    shadowBlob(g, 9, 28, 14, 2);
    const lift = v === 1 ? -2 : 0, wide = v === 2 ? 1 : 0;
    px(g, 12 - wide, 24 + lift, 8 + wide * 2, 5, "#5a5a64"); px(g, 12 - wide, 24 + lift, 8 + wide * 2, 1, "#8a8a96");
    px(g, 10 - wide, 22 + lift, 12 + wide * 2, 3, "#4a4a54");
    px(g, 13, 12 + lift, 6, 10, "#3a3a42"); px(g, 13, 12 + lift, 1, 10, "#23232c");
    px(g, 12, 10 + lift, 8, 4, "#42424c"); px(g, 12, 10 + lift, 8, 1, "#6a6a78");
    px(g, 10, 6 + lift, 12, 4, "#55555c"); px(g, 10, 6 + lift, 12, 1, "#7a7a88");
    px(g, 14, 13 + lift, 4, 6, "#ffd93d"); px(g, 15, 14 + lift, 2, 4, "#fff2b0");
    if (v === 2) { g.fillStyle = "rgba(255,217,61,0.20)"; g.fillRect(10, 9 + lift, 12, 14); px(g, 14, 13 + lift, 4, 1, "#fffbe0"); }
    else { g.fillStyle = "rgba(255,217,61,0.14)"; g.fillRect(11, 10 + lift, 10, 12); }
  }
  // --- water: flat BLUE base tiles (base + depth patches bake into the
  // ground; the MOTIFS live in scrolling flow strips). Full-bleed
  // opaque, never outlines (rings would grid the sea). Base matches the
  // bridge water strips so structures blend. Each frame drawWaterMotifs
  // scrolls the tile's own motif strip steadily eastward (a current, not a
  // sway) while crossfading between two motif sets so shapes genuinely
  // change, with glints twinkling in place. Motifs sit clear of the tile rim
  // in Y so adjacent tiles never stripe; X wraps seamlessly by construction
  // (pattern + mirror + pattern), so the flow never pops at tile edges.
  // Variants differ in motif mix and seeds only, so neighbours blend.
  // Grain-soft patch: rect fill + full-area dither back to the base color, so
  // depth fields read as grain rather than hard squares. Always dithers (on
  // dummyG the grain draws into the void) so every layer consumes identical
  // RNG.
  function ditherBack(g, r, x0, y0, x1, y1, base, p) {
    g.fillStyle = base;
    for (let y = Math.max(0, y0); y <= Math.min(31, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(31, x1); x++) {
        if (r() < p) g.fillRect(x, y, 1, 1);
      }
    }
  }
  function waterBlotches(g, r, n, dark, light, base) {
    for (let i = 0; i < n; i++) {
      const x = 2 + ((r() * 22) | 0), y = 2 + ((r() * 24) | 0), w = 4 + ((r() * 6) | 0), h = 2 + ((r() * 2) | 0);
      g.fillStyle = r() < 0.6 ? dark : light;
      g.fillRect(x, y, w, h);
      ditherBack(g, r, x - 1, y - 1, x + w, y + h, base, 0.30);
    }
  }
  // Shaded wave-stroke: a long low horizontal swell — faint halo, BROKEN crest
  // (lit only ~70% of its length, so the white reads thin), lit face, and a
  // two-tone shadow foot wider than the crest. Dark outweighs bright, so
  // water reads blue-first with light riding it. Y clamped 4..26.
  function waterWavelet(g, r, pal) {
    // strokes span the FULL tile height (y0 anywhere in 0..27) so every
    // horizontal slice of the tile — including the 6px bands top and bottom
    // that show beside bridge planks — catches strokes, not empty fringe.
    const y0 = ((r() * 28) | 0), x0 = 1 + ((r() * 10) | 0), len = 10 + ((r() * 5) | 0), ph = r() * 6.28;
    for (let i = 0; i < len; i++) {
      const x = x0 + i;
      const y = y0 + Math.round(Math.sin(ph + i * 0.4));
      if (y < 4 || y > 25) continue;
      g.fillStyle = pal.glow; g.fillRect(x, y - 1, 1, 1);
      if (r() < 0.7) { g.fillStyle = pal.crest; g.fillRect(x, y, 1, 1); }
      else { g.fillStyle = pal.mid; g.fillRect(x, y, 1, 1); }
      g.fillStyle = pal.mid; g.fillRect(x, y + 1, 1, 1);
      g.fillStyle = pal.shadow; g.fillRect(x - 1, y + 2, 3, 1);
      g.fillStyle = pal.deep; g.fillRect(x, y + 3, 1, 1);
      if (r() < 0.10) { g.fillStyle = pal.foam; g.fillRect(x, y, 1, 1); }
    }
  }
  const SHALLOW_WAVE = { glow: "rgba(150,205,245,0.18)", crest: "#f2fbff", mid: "#86bce6", shadow: "rgba(15,50,105,0.60)", deep: "rgba(10,30,80,0.55)", foam: "#ffffff" };
  const DEEP_WAVE = { glow: "rgba(90,150,200,0.15)", crest: "#9fc0dd", mid: "#5488b8", shadow: "rgba(5,16,42,0.62)", deep: "rgba(3,10,28,0.60)", foam: "rgba(230,245,255,0.9)" };
  // dummy context: draws into the void while consuming RNG identically, so
  // motif/glint layers land on exactly the bake sequence's pixel positions.
  const dummyG = cv(4).getContext("2d");
  function paintWater(g, v, layer) {
    // layer 0/undefined = ground-bake base (flat blue + depth fields +
    // patches only); layer 1 = shaded motifs on transparency; layer 2 =
    // glints only.
    const r = mulberry(410 + v * 97);
    const bake = !layer, bg = bake ? g : dummyG;
    if (bake) px(g, 0, 0, 32, 32, "#2b6fd4");
    // broad depth fields under the small patches (bake only; static depth
    // under the moving surface), fringes dithered back to flat blue
    for (let k = 0; k < 3; k++) {
      const x = 1 + ((r() * 18) | 0), y = 2 + ((r() * 18) | 0), w = 9 + ((r() * 6) | 0), h = 5 + ((r() * 3) | 0);
      bg.fillStyle = (k % 2) ? "rgba(90,160,230,0.10)" : "rgba(22,66,132,0.16)";
      bg.fillRect(x, y, w, h);
      ditherBack(bg, r, x - 1, y - 1, x + w, y + h, "#2b6fd4", 0.25);
    }
    // sky sheen: broad soft wash so shallows read REFLECTIVE, not flat paint
    for (let k = 0; k < 2; k++) {
      const x = 2 + ((r() * 12) | 0), y = 2 + ((r() * 20) | 0), w = 12 + ((r() * 8) | 0), h = 4 + ((r() * 3) | 0);
      bg.fillStyle = "rgba(175,218,250,0.10)";
      bg.fillRect(x, y, w, h);
      ditherBack(bg, r, x - 1, y - 1, x + w, y + h, "#2b6fd4", 0.45);
    }
    waterBlotches(bg, r, 5, "rgba(28,79,158,0.28)", "rgba(99,171,240,0.16)", "#2b6fd4");
    // per-variant motif mix: lively / calm / swell / glassy — dense enough
    // that every horizontal slice carries strokes (bridge bands included),
    // still horizontal current-strokes only, never curls.
    const cfg = [{ wv: 6, cu: 4, calm: 1 }, { wv: 4, cu: 2, calm: 2 }, { wv: 5, cu: 3, calm: 2 }, { wv: 3, cu: 2, calm: 2 }][v % 4];
    const mg = (layer === 1) ? g : dummyG;
    for (let k = 0; k < cfg.wv; k++) waterWavelet(mg, r, SHALLOW_WAVE);
    for (let k = 0; k < cfg.cu; k++) {
      // lap: a short horizontal current streak, tapered and shadowed below —
      // lies along the flow, never curls into a bird. Blue-tinted, never
      // near-white: only the mirror streaks get to flash white.
      const x = 2 + ((r() * 20) | 0), y = ((r() * 30) | 0), len = 5 + ((r() * 4) | 0);
      mg.fillStyle = "rgba(150,205,245,0.22)"; mg.fillRect(x, y - 1, len, 1);
      mg.fillStyle = "#a8d4f0"; mg.fillRect(x, y, len, 1);
      mg.fillStyle = "#7fa8d4"; mg.fillRect(x + 1, y + 1, Math.max(1, len - 2), 1);
      mg.fillStyle = "rgba(18,60,125,0.4)"; mg.fillRect(x + 1, y + 2, Math.max(1, len - 2), 1);
    }
    for (let k = 0; k < cfg.calm; k++) {
      // calm reach: soft blue core over a lit bed, shadowed foot
      const x = 3 + ((r() * 20) | 0), y = ((r() * 30) | 0), len = 4 + ((r() * 4) | 0), L = Math.min(len, 31 - x);
      mg.fillStyle = "rgba(150,205,245,0.25)"; mg.fillRect(x, y - 1, L, 1);
      mg.fillStyle = "#b8dcf2"; mg.fillRect(x, y, L, 1);
      mg.fillStyle = "rgba(143,195,238,0.5)"; mg.fillRect(x, y + 1, Math.max(1, L - 1), 1);
    }
    // mirror streaks: a few LONG bright level lines — still water flashing
    // the sky. Length is what sells "mirror": many short dashes read as
    // birds/confetti, so these span most of the tile, sparse and unbroken.
    for (let k = 0; k < 2; k++) {
      const y = 3 + ((r() * 26) | 0), len = 13 + ((r() * 9) | 0);
      const x = 1 + ((r() * Math.max(1, 30 - len)) | 0), L = Math.min(len, 31 - x);
      mg.fillStyle = "rgba(200,230,250,0.35)"; mg.fillRect(x - 1, y - 1, L + 2, 3);
      mg.fillStyle = "rgba(232,246,255,0.85)"; mg.fillRect(x, y, L, 1);
      mg.fillStyle = "rgba(150,198,238,0.45)"; mg.fillRect(x + 1, y + 1, Math.max(1, L - 2), 1);
    }
    // pinned edge strokes: the top and bottom bands always carry at least
    // one drifting stroke each, so bridge water never runs empty no matter
    // where the random wavelets land.
    for (const ey of [1 + ((r() * 3) | 0), 26 + ((r() * 3) | 0)]) {
      const ex = 2 + ((r() * 20) | 0), elen = 4 + ((r() * 5) | 0), L = Math.min(elen, 31 - ex);
      if (ey > 0) { mg.fillStyle = "rgba(150,205,245,0.22)"; mg.fillRect(ex, ey - 1, L, 1); }
      mg.fillStyle = "#a8d4f0"; mg.fillRect(ex, ey, L, 1);
      if (ey < 31) { mg.fillStyle = "rgba(18,60,125,0.4)"; mg.fillRect(ex + 1, ey + 1, Math.max(1, L - 1), 1); }
    }
    // sun-dapple: sparse bright flecks riding the current (scroll with it)
    for (let k = 0; k < 2; k++) {
      const x = 3 + ((r() * 24) | 0), y = ((r() * 30) | 0);
      mg.fillStyle = "rgba(220,245,255,0.20)"; mg.fillRect(x - 1, y, 3, 1); mg.fillRect(x, y - 1, 1, 3);
      mg.fillStyle = "rgba(235,250,255,0.35)"; mg.fillRect(x, y, 1, 1);
    }
    const gg = (layer === 2) ? g : dummyG;
    for (let k = 0; k < 3; k++) {
      const x = 3 + ((r() * 26) | 0), y = 4 + ((r() * 22) | 0);
      gg.fillStyle = "rgba(207,234,255,0.8)"; gg.fillRect(x - 1, y, 3, 1); gg.fillRect(x, y - 1, 1, 3);
      gg.fillStyle = "#ffffff"; gg.fillRect(x, y, 1, 1);
    }
    if (v % 2 === 1) {
      // foam dab: a filled bright patch with a shadowed foot — foam, not a bird
      const ax = 4 + ((r() * 18) | 0), ay = 6 + ((r() * 16) | 0);
      mg.fillStyle = "rgba(190,225,250,0.30)"; mg.fillRect(ax, ay - 1, 5, 1);
      mg.fillStyle = "#eaf7ff"; mg.fillRect(ax + 1, ay, 3, 1); mg.fillRect(ax, ay + 1, 5, 1);
      mg.fillStyle = "#a8d8f5"; mg.fillRect(ax + 1, ay + 2, 3, 1);
      mg.fillStyle = "rgba(18,60,125,0.5)"; mg.fillRect(ax, ay + 2, 5, 1); mg.fillRect(ax + 1, ay + 3, 3, 1);
    }
  }
  function paintDeep(g, v, layer) {
    // deep water: darker, heavier, dimmer motifs, fewer of them + abyssal
    // fields in the bake and faint teal drift-streaks riding the current
    const r = mulberry(510 + v * 113);
    const bake = !layer, bg = bake ? g : dummyG;
    if (bake) px(g, 0, 0, 32, 32, "#153f86");
    for (let k = 0; k < 3; k++) {
      const x = 1 + ((r() * 16) | 0), y = 2 + ((r() * 16) | 0), w = 10 + ((r() * 6) | 0), h = 6 + ((r() * 4) | 0);
      bg.fillStyle = (k % 2) ? "rgba(70,130,200,0.10)" : "rgba(5,17,42,0.26)";
      bg.fillRect(x, y, w, h);
      ditherBack(bg, r, x - 1, y - 1, x + w, y + h, "#153f86", 0.25);
    }
    waterBlotches(bg, r, 6, "rgba(10,32,72,0.30)", "rgba(70,130,200,0.14)", "#153f86");
    const n = [5, 4, 3][v % 3];
    const mg = (layer === 1) ? g : dummyG;
    for (let k = 0; k < n; k++) waterWavelet(mg, r, DEEP_WAVE);
    for (let k = 0; k < 2; k++) {
      // cold drift-streak: dim teal current line with a brighter core
      const x = 2 + ((r() * 18) | 0), y = ((r() * 28) | 0), len = 6 + ((r() * 5) | 0);
      mg.fillStyle = "rgba(110,200,215,0.14)"; mg.fillRect(x, y - 1, Math.min(len + 2, 31 - x), 3);
      mg.fillStyle = "rgba(150,220,230,0.16)"; mg.fillRect(x + 1, y, Math.min(len, 30 - x), 1);
    }
    // pinned edge strokes (deep-sea dim): top and bottom bands always carry
    // drifting strokes, so bridge water over the deeps never runs empty.
    for (const ey of [1 + ((r() * 3) | 0), 26 + ((r() * 3) | 0)]) {
      const ex = 2 + ((r() * 18) | 0), elen = 4 + ((r() * 5) | 0), L = Math.min(elen, 31 - ex);
      if (ey > 0) { mg.fillStyle = "rgba(110,200,215,0.16)"; mg.fillRect(ex, ey - 1, L, 1); }
      mg.fillStyle = "rgba(170,210,235,0.45)"; mg.fillRect(ex, ey, L, 1);
    }
    const gg = (layer === 2) ? g : dummyG;
    for (let k = 0; k < 2; k++) {
      const x = 3 + ((r() * 26) | 0), y = 4 + ((r() * 22) | 0);
      gg.fillStyle = "rgba(154,220,255,0.75)"; gg.fillRect(x, y, 1, 1);
    }
  }
  const waterFlows = {}; // "t:v" -> {a, b, glint}: scrolling flow strips + twinkling glints
  function waterFlow(t, v) {
    const key = t + ":" + v;
    let F = waterFlows[key];
    if (F) return F;
    // B set keeps the variant mix class (shallow +100 preserves %4, deep +99
    // preserves %3) while reseeding every motif position.
    const off = (t === 6) ? 99 : 100;
    const mcA = cv(), mcB = cv(), gc = cv();
    const P = (t === 6) ? paintDeep : paintWater;
    P(mcA.getContext("2d"), v, 1);
    P(mcB.getContext("2d"), v + off, 1);
    P(gc.getContext("2d"), v, 2);
    // 96px strip = [pattern | mirror | pattern]: any 32px window starting in
    // [0,64) is continuous, and offset wraps mod 64 with no seam or pop.
    const mkStrip = (mc) => {
      const s = document.createElement("canvas"); s.width = 96; s.height = 32;
      const g = s.getContext("2d");
      g.drawImage(mc, 0, 0);
      g.save(); g.scale(-1, 1); g.drawImage(mc, -64, 0); g.restore();
      g.drawImage(mc, 64, 0);
      return s;
    };
    F = { a: mkStrip(mcA), b: mkStrip(mcB), glint: gc };
    waterFlows[key] = F;
    return F;
  }
  // Per-frame water current: the tile's motif strip scrolls steadily eastward
  // (deep water lazier), crossfading between two motif sets so shapes change
  // as they flow, glints twinkling in place. Same art as the sprite's motifs,
  // so overlay and sprite agree; per-tile phase/speed keeps neighbours async.
  // The motif layer draws IN the water: shallows take a soft, nearly-still
  // layer (calm and clear — the static bake carries the look), the deeps a
  // weak one (dark, opaque — the base dominates).
  const MOTIF_ALPHA_SHALLOW = 0.38, MOTIF_ALPHA_DEEP = 0.38;
  // shared scroll-frame: which strip window + morph mix + twinkle for a
  // water tile at (gx,gy). ts = on-screen tile size, time in seconds.
  function motifFrame(t, vidx, gx, gy, ts, time) {
    const F = waterFlow(t, vidx);
    let h = (Math.imul(gx | 0, 374761393) + Math.imul(gy | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    const hu = (h >>> 0);
    const ph = (hu % 6400) / 100; // 0..64 scroll phase (tile-px)
    // shallows drift lazy and barely bob or morph — still, clear water.
    // The static bake carries the look; the flow is a whisper, not weather.
    const spBase = (t === 6) ? 3.5 : 2.5; // tile-px per second
    const sp = spBase + (hu % 100) / 100 * spBase * 0.5;
    const ox = (time * sp + ph) % 64;
    const u = ts / 32;
    const oy = Math.round(Math.sin(time * (t === 6 ? 0.9 : 0.5) + ph) * (t === 6 ? 0.8 : 0.3) * u);
    const morphRate = (t === 6) ? 0.5 : 0.22;
    const m = 0.5 + 0.5 * Math.sin(time * morphRate + (hu % 628) / 100);
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 2 + (hu % 628) / 100 * 2.3));
    const alpha = (t === 6) ? MOTIF_ALPHA_DEEP : MOTIF_ALPHA_SHALLOW;
    return { F, ox, oy, m, tw, alpha };
  }
  function drawStripWindow(g, F, ox, oy, m, dx, dy, ts, alpha) {
    if (m < 0.02) { g.globalAlpha = alpha; g.drawImage(F.a, ox, 0, 32, 32, dx, dy + oy, ts, ts); }
    else if (m > 0.98) { g.globalAlpha = alpha; g.drawImage(F.b, ox, 0, 32, 32, dx, dy + oy, ts, ts); }
    else {
      g.globalAlpha = alpha * (1 - m);
      g.drawImage(F.a, ox, 0, 32, 32, dx, dy + oy, ts, ts);
      g.globalAlpha = alpha * m;
      g.drawImage(F.b, ox, 0, 32, 32, dx, dy + oy, ts, ts);
    }
  }
  // Entity reflection on water: a vertically-flipped sprite anchored at a
  // contact line (the feet for bodies IN water, the water's edge for
  // shore-casters) and recomputed from screen position every frame, so it
  // tracks the body and can never detach or float away. Sliced into bands
  // with fading alpha + sinusoidal x-wobble for a water-shimmer read, washed
  // with the water color, edged with a bright waterline at contact.
  // (dx,dy,dw,dh) = the sprite's drawn box; o = {alpha, tint, squash, flip,
  // time, phase, dir (1 = mirror hangs below the anchor, -1 = rises above),
  // anchorY (defaults to the box feet)}.
  function drawReflection(g, spr, dx, dy, dw, dh, o) {
    try {
      if (!spr || !spr.width || !spr.height) return;
      o = o || {};
      const alpha = (o.alpha != null) ? o.alpha : 0.5;
      const tint = o.tint || "rgba(70,140,220,0.20)";
      const squash = o.squash || 0.9;
      const flip = !!o.flip;
      const time = o.time || 0, phase = o.phase || 0;
      const dir = (o.dir === -1) ? -1 : 1;
      const anchor = (o.anchorY != null) ? o.anchorY : dy + dh;
      const rh = Math.max(2, dh * squash);
      const N = 8, sw = spr.width, sh = spr.height;
      for (let i = 0; i < N; i++) {
        const sy0 = sh - (i + 1) * sh / N, sh0 = sh / N;
        // slice 0 = the boots, strongest, right at the contact line; the
        // fade is gentle so the far (head) end stays readable, not a ghost.
        const dy0 = (dir === 1) ? anchor + i * rh / N : anchor - (i + 1) * rh / N - 0.6;
        const dh0 = rh / N + 0.6;
        const wob = Math.sin(time * 3 + phase + i * 0.9) * (0.5 + i * 0.35);
        g.globalAlpha = Math.max(0, alpha * (1 - 0.45 * i / N));
        if (flip) {
          g.save(); g.translate(dx + dw / 2, 0); g.scale(-1, 1);
          g.drawImage(spr, 0, sy0, sw, sh0, -dw / 2 + wob, dy0, dw, dh0);
          g.restore();
        } else {
          g.drawImage(spr, 0, sy0, sw, sh0, dx + wob, dy0, dw, dh0);
        }
      }
      // water wash: none — a tint rect leaves a visible box edge. The slices
      // alone sink into the water; no hard rectangles anywhere.
      // waterline: bright contact edge exactly at the anchor (the anchor read)
      g.globalAlpha = Math.min(1, alpha + 0.2);
      g.fillStyle = "#e8f7ff";
      g.fillRect(dx, anchor - 0.5, dw, 1);
      g.globalAlpha = 1;
    } catch (e) { try { g.globalAlpha = 1; } catch (e2) {} }
  }
  function drawWaterMotifs(g, t, gx, gy, dx, dy, ts, time) {
    try {
      const vidx = tileVariantIndex(t, gx, gy);
      const fr = motifFrame(t, vidx, gx, gy, ts, time);
      drawStripWindow(g, fr.F, fr.ox, fr.oy, fr.m, dx, dy, ts, fr.alpha);
      g.globalAlpha = fr.tw * (t === 6 ? 0.5 : 1);
      g.drawImage(fr.F.glint, dx, dy, ts, ts);
      g.globalAlpha = 1;
    } catch (e) { try { g.globalAlpha = 1; } catch (e2) {} }
  }
  // Water under the bridge IS water: the tile renders exactly what a water
  // tile renders — same base variant, same motifs, same glints, same phase
  // for these coords, so the flow continues seamlessly under the bridge —
  // then the plank band redraws over the middle, like a bridge laid across
  // the current. No seams, no shadow lines, no dashes, no foam: nothing
  // marks where bridge meets water.
  // Layer order is water -> reflection -> planks: drawBridgeWater paints the
  // water base (under everything, including reflections), and
  // drawBridgePlanks repaints ONLY the opaque plank band. Entity rendering
  // calls the planks again after drawing a reflection that touches bridge
  // tiles, so the mirror visibly continues under the bridge and the planks
  // cut it where they cover it — while bodies (drawn after) stay on top.
  function drawBridgePlanks(g, gx, gy, dx, dy, ts) {
    try {
      const b = tiles[16];
      if (!b) return;
      const u = ts / 32;
      g.globalAlpha = 1;
      g.drawImage(b, 0, 6, 32, 20, dx, dy + 6 * u, ts, 20 * u);
      g.globalAlpha = 1;
    } catch (e) { try { g.globalAlpha = 1; } catch (e2) {} }
  }
  function drawBridgeWater(g, gx, gy, dx, dy, ts, time) {
    try {
      g.globalAlpha = 1;
      const base = tileFor(5, gx, gy);
      if (base) g.drawImage(base, dx, dy, ts, ts);
      drawWaterMotifs(g, 5, gx, gy, dx, dy, ts, time);
      drawBridgePlanks(g, gx, gy, dx, dy, ts);
      g.globalAlpha = 1;
    } catch (e) { try { g.globalAlpha = 1; } catch (e2) {} }
  }
  function mkVariants(n, painter) {
    const arr = [];
    for (let v = 0; v < n; v++) { const c = cv(); painter(c.getContext("2d"), v); arr.push(c); }
    return arr;
  }
  function makeTiles() {
    for (const k of Object.keys(tileVariants)) delete tileVariants[k];
    // grass
    tileVariants[0] = mkVariants(4, paintGrass); tiles[0] = tileVariants[0][0];
    // tall grass
    tileVariants[1] = mkVariants(3, paintTall); tiles[1] = tileVariants[1][0];
    // flower
    tileVariants[2] = mkVariants(3, paintFlower); tiles[2] = tileVariants[2][0];
    // tree (oak) — transparent overlay + baked rim
    tileVariants[3] = mkVariants(4, paintOak); tiles[3] = tileVariants[3][0];
    for (const c of tileVariants[3]) bakeOutline(c, 24, 52, 24);
    // pine — transparent overlay + baked rim
    tileVariants[4] = mkVariants(4, paintPine); tiles[4] = tileVariants[4][0];
    for (const c of tileVariants[4]) bakeOutline(c, 16, 44, 30);
    // water — textured static shallows base, 4 deterministic variants
    tileVariants[5] = mkVariants(4, paintWater); tiles[5] = tileVariants[5][0];
    // deep water — textured static base, darker, 3 variants
    tileVariants[6] = mkVariants(3, paintDeep); tiles[6] = tileVariants[6][0];
    // sand
    tileVariants[7] = mkVariants(4, paintSand); tiles[7] = tileVariants[7][0];
    // path (dirt)
    tileVariants[8] = mkVariants(4, paintPath); tiles[8] = tileVariants[8][0];
    // town stone
    tileVariants[9] = mkVariants(3, paintTown); tiles[9] = tileVariants[9][0];
    // house wall — timber-frame plaster: stone base, plaster face, dark beams
    let c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#d9c9a8"); px(g, 0, 0, 32, 3, "#8a6c46"); px(g, 0, 28, 32, 4, "#6a6a72"); px(g, 0, 28, 32, 1, "#9a9aa2"); px(g, 0, 3, 3, 25, "#5a3a22"); px(g, 29, 3, 3, 25, "#5a3a22"); px(g, 0, 12, 32, 3, "#5a3a22"); px(g, 14, 3, 4, 25, "#6b4226"); px(g, 0, 5, 32, 1, "rgba(255,255,255,0.35)"); const r10 = mulberry(101); for (let i = 0; i < 12; i++) px(g, (r10() * 30) | 0, 5 + ((r10() * 20) | 0), 2, 1, "#c4b08a"); } tiles[10] = c; tileVariants[10] = [c];
    // roof — overlapping shingle rows with ridge highlight + eave shadow
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#8e3327"); for (let y = 0; y < 32; y += 6) { px(g, 0, y + 4, 32, 2, "#5e2018"); px(g, 0, y, 32, 1, "#c14e3e"); for (let x = (y % 12 ? 2 : 6); x < 32; x += 8) px(g, x, y, 1, 5, "#5e2018"); } px(g, 0, 0, 32, 3, "#d96a55"); px(g, 0, 29, 32, 3, "#3a130e"); } tiles[11] = c; tileVariants[11] = [c];
    // door — arched timber door in a stone frame, iron bands + knob
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#8a8a92"); px(g, 2, 0, 28, 32, "#6f6f78"); px(g, 7, 4, 18, 28, "#3a2412"); px(g, 9, 2, 14, 30, "#4a2f1a"); px(g, 11, 4, 10, 26, "#6b4226"); px(g, 11, 4, 2, 26, "#7d5230"); px(g, 11, 10, 10, 2, "#2e1c0e"); px(g, 11, 20, 10, 2, "#2e1c0e"); px(g, 20, 16, 3, 3, "#ffd93d"); px(g, 20, 16, 1, 1, "#fff2b0"); } tiles[12] = c; tileVariants[12] = [c];
    // dungeon floor
    tileVariants[13] = mkVariants(2, paintFloor); tiles[13] = tileVariants[13][0];
    // dungeon wall
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#23232c"); px(g, 0, 20, 32, 12, "#3a3a48"); px(g, 0, 20, 32, 3, "#55556a"); px(g, 2, 24, 12, 6, "#2e2e3a"); px(g, 18, 24, 12, 6, "#2e2e3a"); } tiles[14] = c; tileVariants[14] = [c];
    // dungeon door
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#23232c"); px(g, 8, 0, 16, 32, "#6b4226"); px(g, 10, 2, 12, 28, "#4a2f1a"); px(g, 14, 14, 4, 4, "#ffd93d"); } tiles[15] = c; tileVariants[15] = [c];
    // bridge
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#2b6fd4"); px(g, 0, 6, 32, 20, "#8a5a33"); for (let x = 2; x < 32; x += 6) px(g, x, 6, 2, 20, "#6b4226"); px(g, 0, 6, 32, 2, "#a06a3a"); px(g, 0, 24, 32, 2, "#a06a3a"); } tiles[16] = c; tileVariants[16] = [c];
    // torch sconce: haft + rope wrap + layered flame on dungeon stone
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#3d3d4a"); px(g, 0, 30, 32, 2, "#33333e"); px(g, 13, 16, 6, 16, "#3a2412"); px(g, 14, 16, 4, 16, "#8a5a33"); px(g, 14, 16, 1, 16, "#a06a3a"); px(g, 13, 13, 6, 4, "#d9c27f"); px(g, 13, 13, 6, 1, "#8a6c46"); px(g, 11, 6, 10, 8, "#ff7b2e"); px(g, 13, 3, 6, 8, "#ffc93d"); px(g, 14, 8, 4, 4, "#fff2b0"); px(g, 15, 0, 2, 4, "#ff7b2e"); } tiles[17] = c; tileVariants[17] = [c];
    // stairs
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#22222a"); for (let i = 0; i < 5; i++) { px(g, 4, 4 + i * 5, 24, 3, i % 2 ? "#55556a" : "#3a3a48"); } px(g, 2, 0, 3, 32, "#ff9d2e"); px(g, 27, 0, 3, 32, "#ff9d2e"); } tiles[18] = c; tileVariants[18] = [c];
    // lava
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#c22e1f"); px(g, 4, 8, 8, 4, "#ff9d2e"); px(g, 18, 18, 10, 5, "#ffd93d"); px(g, 6, 22, 6, 3, "#ff6b2e"); } tiles[19] = c; tileVariants[19] = [c];
    // sakura (pink canopy tree) — transparent overlay + baked rim
    tileVariants[20] = mkVariants(4, paintSakura); tiles[20] = tileVariants[20][0];
    for (const o of tileVariants[20]) bakeOutline(o, 96, 48, 72);
    // stonewall (dwarven dark stone bricks)
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#3d3d48"); px(g, 1, 1, 30, 13, "#55555f"); px(g, 1, 16, 30, 15, "#46464f"); px(g, 0, 0, 32, 2, "#7a7a88"); px(g, 0, 14, 32, 2, "#23232c"); px(g, 0, 30, 32, 2, "#23232c"); for (let x = 0; x < 32; x += 8) { px(g, x, 2, 1, 12, "#23232c"); px(g, (x + 4) % 32, 16, 1, 15, "#23232c"); } px(g, 3, 4, 6, 3, "#7a7a88"); px(g, 18, 20, 8, 3, "#6a6a76"); px(g, 3, 5, 6, 1, "#9a9aa8"); } tiles[21] = c; tileVariants[21] = [c];
    // lantern (stone lantern, warm glow — transparent overlay, decor on any ground)
    tileVariants[22] = mkVariants(3, paintLantern); tiles[22] = tileVariants[22][0];
    for (const o of tileVariants[22]) bakeOutline(o, 24, 24, 34);
    // window — timber wall with a glazed, cross-barred window + stone sill
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#d9c9a8"); px(g, 0, 0, 32, 3, "#8a6c46"); px(g, 0, 28, 32, 4, "#6a6a72"); px(g, 0, 3, 3, 25, "#5a3a22"); px(g, 29, 3, 3, 25, "#5a3a22"); px(g, 6, 8, 20, 14, "#3a2a1a"); px(g, 8, 10, 16, 10, "#9adcff"); px(g, 8, 10, 16, 3, "#d0f0ff"); px(g, 15, 10, 2, 10, "#5a3a22"); px(g, 8, 14, 16, 2, "#5a3a22"); px(g, 8, 10, 16, 1, "#ffffff"); px(g, 6, 22, 20, 3, "#9a9aa2"); px(g, 6, 22, 20, 1, "#c9ccd4"); } tiles[23] = c; tileVariants[23] = [c];
    // planks — oiled wood floorboards with nails + grain
    tileVariants[24] = mkVariants(2, paintPlanks); tiles[24] = tileVariants[24][0];
    // rubble — collapsed wall: broken stone + splinters on trampled dirt (walkable)
    tileVariants[25] = mkVariants(2, paintRubble); tiles[25] = tileVariants[25][0];
    // ice — slick frozen floor, pale blue with white cracks (walkable, slippery)
    tileVariants[26] = mkVariants(2, paintIce); tiles[26] = tileVariants[26][0];
    // ash — ember-dark floor, charcoal with glowing cracks (walkable)
    tileVariants[27] = mkVariants(2, paintAsh); tiles[27] = tileVariants[27][0];
    // moss — soft fungal carpet, deep green with pale sporelings (walkable)
    tileVariants[28] = mkVariants(2, paintMoss); tiles[28] = tileVariants[28][0];
    // bone — ossuary floor, packed dirt strewn with ribs and skulls (walkable)
    tileVariants[29] = mkVariants(2, paintBone); tiles[29] = tileVariants[29][0];
    // crystal — pale glowing cluster on dark stone (solid, deep-level light)
    c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#23232c"); px(g, 4, 18, 24, 14, "#3a3a48"); px(g, 8, 10, 5, 12, "#7fd4ff"); px(g, 14, 5, 6, 17, "#c4ecff"); px(g, 21, 12, 5, 10, "#7fd4ff"); px(g, 9, 11, 2, 10, "#e8faff"); px(g, 15, 6, 2, 14, "#ffffff"); px(g, 22, 13, 2, 8, "#e8faff"); } tiles[30] = c; tileVariants[30] = [c];
    // wax — amber honeycomb floor, golden with comb cells (walkable)
    tileVariants[31] = mkVariants(2, paintWax); tiles[31] = tileVariants[31][0];
    // flesh — meaty warren floor, dark red with pale veins (walkable)
    tileVariants[32] = mkVariants(2, paintFlesh); tiles[32] = tileVariants[32][0];
   // blood — still blood-pools, dark red with bright slicks (solid hazard)
   c = cv(); { const g = c.getContext("2d"); px(g, 0, 0, 32, 32, "#7a1010"); px(g, 4, 8, 8, 4, "#c22e2e"); px(g, 18, 18, 10, 5, "#ff6b5b"); px(g, 6, 22, 6, 3, "#a02020"); } tiles[33] = c; tileVariants[33] = [c];
    // cloud — walkable dawn-cloud for heaven (pearl white, gold-lit puffs)
    tileVariants[34] = mkVariants(6, paintCloud); tiles[34] = tileVariants[34][0];
    // shroom — giant alien mushroom tree (violet cap, pale stalk, spore glow)
    tileVariants[35] = mkVariants(4, paintShroom); tiles[35] = tileVariants[35][0];
    for (const o of tileVariants[35]) bakeOutline(o, 90, 60, 140);
    // spire — teal crystal spire cluster on a stone foot (solid, choppable)
    tileVariants[36] = mkVariants(4, paintSpire); tiles[36] = tileVariants[36][0];
    for (const o of tileVariants[36]) bakeOutline(o, 40, 90, 120);
  }

  // ---------- equipped look: what the PLAYER wears and holds ----------
  // Armor id -> overlay style. Heavy plate covers the torso + pauldrons,
  // robes fall to the floor with a glowing trim, light garb dyes the belt.
  const ARMOR_LOOK = {
    cloth_robe: { k: "robe", c: "#6a5a48", trim: "#c9a45a" },
    leather_armor: { k: "light", c: "#6b4226", trim: "#d9c27f" },
    wayfarer_garb: { k: "light", c: "#3a5a2f", trim: "#c9b98a" },
    shadowweave_garb: { k: "light", c: "#23232e", trim: "#8a5ae0" },
    iron_armor: { k: "heavy", c: "#8a9aaa", trim: "#d0d6de" },
    steel_plate: { k: "heavy", c: "#b9c2cc", trim: "#c9a227" },
    mythril_plate: { k: "heavy", c: "#7fc4d4", trim: "#e0f4ff" },
    dragonbone_plate: { k: "heavy", c: "#d9cfae", trim: "#ffb02e" },
    mage_robe: { k: "robe", c: "#3a3a6a", trim: "#7fd4ff" },
    archmage_robe: { k: "robe", c: "#4a2a6a", trim: "#ffd93d" },
    holy_vestments: { k: "robe", c: "#ece4d2", trim: "#c9a227" },
    wyrmshroud_robe: { k: "robe", c: "#3a5a3a", trim: "#ffb02e" },
    // striker gi: karate/Shaolin-style kasaya uniforms (Ascetic shell)
    patched_kasaya: { k: "kasaya", c: "#c98a2e", trim: "#8a5a3a" },
    ironthread_kasaya: { k: "kasaya", c: "#d99a35", trim: "#9aa2ae" },
    sunsilk_kasaya: { k: "kasaya", c: "#f2b63a", trim: "#fff7ae" },
    dragonhide_kasaya: { k: "kasaya", c: "#b45a1a", trim: "#ffb02e" },
    // choir tunics: dark habitus (Devotion shell)
    novice_habit: { k: "habitus", c: "#3a3a44", trim: "#c9a45a" },
    canon_habit: { k: "habitus", c: "#2a3a5a", trim: "#e8ecf2" },
    vesper_habit: { k: "habitus", c: "#3a1a55", trim: "#c9a227" },
    seraph_habit: { k: "habitus", c: "#23232e", trim: "#ffd93d" },
    void_habit: { k: "habitus", c: "#101018", trim: "#7a3aaa" },
    dawnchoir_habit: { k: "habitus", c: "#e8dcc2", trim: "#ffd93d" },
    // endgame wraps: oblivion + dawnsilk kasaya
    oblivion_kasaya: { k: "kasaya", c: "#2a1a4a", trim: "#7a3aaa" },
    dawnsilk_kasaya: { k: "kasaya", c: "#f2d06a", trim: "#fff7ae" },
    // enchanted endgame armor (same overlay treatment, elemental trims)
    dragonscale_vest: { k: "heavy", c: "#4a5a3a", trim: "#ffb02e" },
    emberplate: { k: "heavy", c: "#5a2a1a", trim: "#ff7b2e" },
    rimeplate: { k: "heavy", c: "#8fc3d9", trim: "#f2fbff" },
    tideward_robe: { k: "robe", c: "#2a6a7a", trim: "#bfe9ff" },
  };
  const BLADE_COLOR = { wood: "#b08355", rusty: "#9aa0a8", iron: "#c9ccd4", steel: "#eef2f6", silver: "#f4f6ff", mythril: "#9adcff", dragonbone: "#ffb02e", holy: "#fff7ae", oblivion: "#6a2a9a" };
  const GEM_COLOR = { quartz: "#cfe8ff", ruby: "#ff3b3b", sapphire: "#3f8ef0", holybead: "#ffd93d", emerald: "#5dd68a", dragonhorn: "#ff9d2e" };
  // Compact gear identity for an entity: equipped weapon + armor item ids.
  // Only the player renders gear (NPCs keep their role outfits).
  function gearFor(ent) {
    try {
      const eq = ent && ent.equipment;
      const w = (eq && eq.weapon) || ent.w || null;
      const a = (eq && eq.armor) || ent.a || null;
      let s = (eq && eq.shield) || ent.s || null;
      // off-hand weapon id: hotbar off-hand slot holding a weapon (Q parries
      // with it, never swings it). Shown mirrored in the left hand. Shields
      // in the off-hand slot show as the shield when nothing is worn.
      let o = ent.o || null;
      try {
        const hb = ent && ent.hotbar;
        let oi = (ent && ent.offhandSlot | 0);
        if (!hb || !(oi >= 0) || oi >= hb.length) {
          try { oi = (window.Items && window.Items.getOffhandSlot) ? window.Items.getOffhandSlot(ent) : -1; } catch (e2) { oi = -1; }
        }
        const sl = (hb && oi >= 0 && hb[oi]) || null;
        if (sl && sl.kind === "item" && sl.id && window.Items && window.Items.ITEMS) {
          const it = window.Items.ITEMS[sl.id];
          if (it && it.type === "equipment" && it.slot === "weapon" && sl.id !== w) o = sl.id;
          else if (it && window.Items.isShieldItem && window.Items.isShieldItem(sl.id) && !s) s = sl.id;
        }
      } catch (e) { }
      if (!w && !a && !s && !o) return null;
      return { w: w || null, a: a || null, s: s || null, o: o || null };
    } catch (e) { return null; }
  }
  function gearCacheKey(gear) { return gear ? ((gear.w || "") + "|" + (gear.a || "") + "|" + (gear.s || "") + "|" + (gear.o || "")) : ""; }
  function gearWeaponDef(gear) {
    try {
      if (!gear || !gear.w) return null;
      if (!window.Items || !window.Items.ITEMS) return null;
      return window.Items.ITEMS[gear.w] || null;
    } catch (e) { return null; }
  }
  // Held weapon for the player sprite. Empty hands draw nothing at all.
  // BIG and distinct: every family has its own silhouette AND every tier its
  // own finish, drawn large enough to read at game zoom — rescue-short to
  // dragon-long blades with guards and pommel gems, single to double axe bits,
  // cudgels swelling to mauls, leaf heads to halberds, short bows to tall
  // recurves, foci growing claws and cages. The element always kisses an edge.
  const EDGE_KISS = { fire: "#ff7b2e", ice: "#bfe9ff", electric: "#fff7ae", nature: "#7ddf6b", water: "#4fc3ef", holy: "#fff7ae" };
  function gearTier(w) {
    const m = (w && w.mat) || "";
    if (m === "dawnstone") return 6;
    if (m === "oblivion") return 5;
    if (m === "dragonbone" || m === "holy") return 4;
    if (m === "mythril") return 3;
    if (m === "steel" || m === "silver") return 2;
    if (m === "iron") return 1;
    return 0;
  }
  // Focus (wand/staff) tiers follow the focus-stone ladder, not weapon mats.
  function focusTier(w) {
    const m = (w && w.mat) || "";
    if (m === "dawnstone") return 6;
    if (m === "oblivion") return 5;
    if (m === "dragonhorn") return 4;
    if (m === "holybead" || m === "emerald") return 3;
    if (m === "sapphire") return 2;
    if (m === "ruby") return 1;
    return 0;
  }
  // Bow tiers follow the fletching ladder (old -> yggdrasil -> oathbow).
  const BOW_TIER = { old_bow: 0, oak_bow: 1, yew_bow: 2, frostwood_bow: 2, wardens_bow: 3, yggdrasil_bow: 3, frostfang_bow: 3, sparkbow: 3, tidebow: 3, oathbow: 4, dawnstone_bow: 6, seraphsong_bow: 6, oblivion_bow: 5 };
  // Held weapon for the player sprite, drawn AFTER armor so hilts and heads
  // sit proud of pauldrons. Held in the right hand (~x24, y26): blades rise
  // along x23-27, wide heads spill left over the shoulder lane (never over
  // the face, which ends at x21). Every family has its own silhouette AND
  // every tier its own finish: rescue-short to lordly-long, wrapped grips,
  // swept guards, etched runes and element-kissed edges.
  function drawPlayerWeapon(g, gear) {
    const w = gearWeaponDef(gear);
    if (!w) return;
    const kiss = (w.element && EDGE_KISS[w.element]) || null;
    const leg = !!w.legendary;
    // single-pixel dot helper
    function R_(gg, x, y, c) { gg.fillStyle = c; gg.fillRect(x, y, 1, 1); }
    // wrapped grip: alternating leather bands over a dark core
    const grip = (x, y0, h, core) => {
      px(g, x, y0, 3, h, core || "#3a2a1a");
      for (let y = y0; y < y0 + h; y += 2) px(g, x, y, 3, 1, "#6b4226");
    };
    if (w.bow || w.wtype === "bow") {
      // recurve bow held OUT to the east, string on the archer side and the
      // nocked arrow riding fully outside the body pointing east (away).
      // Limbs swell east off the riser then sweep back west so both tips
      // meet a body-side string (x23); nothing crosses the torso or the
      // face lane (face ends at x21). Tiers: richer wood, thicker limbs,
      // gold inlay, glowing belly edge.
      const bt = (w && w.id && BOW_TIER[w.id] != null) ? BOW_TIER[w.id] : 1;
      let wood = bt >= 4 ? "#8a6a2a" : bt >= 3 ? "#5a3a22" : bt >= 2 ? "#6b4226" : "#8a5a33";
      let woodL = bt >= 4 ? "#e8c85a" : "#a06a3a";
      const el = w.element || null;
      if (el === "ice") { wood = "#7fa8bc"; woodL = "#e8faff"; } // frostwood: pale ice
      else if (el === "fire") { wood = "#5a3220"; woodL = "#ff9d2e"; } // emberwood: ember grain
      else if (w.id === "yggdrasil_bow") { wood = "#6b6a2a"; woodL = "#e8f5a0"; } // unicorn string shimmer
      // riser above/below the grip
      px(g, 24, 13, 2, 2, wood); px(g, 24, 20, 2, 2, wood);
      // upper limb: rises out of the riser, bellies east, recurves back west
      px(g, 25, 11, 2, 2, wood);
      px(g, 26, 9, 2, 2, wood); px(g, 27, 9, 1, 2, woodL);
      px(g, 27, 6, 2, 3, wood); px(g, 28, 6, 1, 3, woodL);
      px(g, 26, 4, 2, 2, wood); px(g, 25, 3, 1, 2, wood);
      px(g, 23, 2, 2, 2, wood); px(g, 23, 2, 1, 1, woodL);
      // lower limb (mirrored)
      px(g, 25, 22, 2, 2, wood);
      px(g, 26, 24, 2, 2, wood); px(g, 27, 24, 1, 2, woodL);
      px(g, 27, 27, 2, 3, wood); px(g, 28, 27, 1, 3, woodL);
      px(g, 26, 29, 2, 2, wood); px(g, 25, 29, 1, 2, wood);
      px(g, 23, 30, 2, 2, wood); px(g, 23, 31, 1, 1, woodL);
      if (bt >= 2) { px(g, 24, 11, 1, 2, woodL); px(g, 24, 22, 1, 2, woodL); } // limb fullering
      if (bt >= 3) { px(g, 27, 7, 1, 2, "#c9a227"); px(g, 27, 27, 1, 2, "#c9a227"); } // gold inlay
      if (kiss) { px(g, 25, 10, 1, 3, kiss); px(g, 25, 23, 1, 3, kiss); } // glowing belly edge
      if (leg) { R_(g, 22, 2, "#fff7ae"); R_(g, 22, 31, "#fff7ae"); R_(g, 25, 10, "#fff7ae"); R_(g, 25, 25, "#fff7ae"); } // dawn nocks
      grip(24, 15, 5); // leather grip in the right hand
      px(g, 23, 2, 1, 30, "#e8e0d0"); // string tip to tip, body-side of the limbs
      // nocked arrow(s) ride outside the body, pointing east (oathbow: twins)
      const ay = leg ? [17, 20] : [19];
      for (const yy of ay) {
        px(g, 25, yy, 4, 1, "#c9ccd4");
        px(g, 29, yy - 1, 2, 3, kiss || "#ff6b6b"); // head
        px(g, 23, yy - 1, 2, 3, "#e8e0d0"); // fletch at the string
      }
      return;
    }

    const blade = BLADE_COLOR[w.mat] || "#cccccc";
    const dark = shade(blade, -45), lite = "#ffffff";
    const tier = (w.wtype === "wand" || w.wtype === "staff") ? focusTier(w) : gearTier(w);
    // etched rune dashes down a blade (element color, else cold steel-blue)
    const etch = (x, y0, h, c) => { const cc = c || kiss || "#9adcff"; for (let y = y0 + 1; y < y0 + h - 1; y += 3) px(g, x, y, 1, 2, cc); };
    switch (w.wtype) {
      case "dagger": {
        // slim stiletto: a TRUE dagger — narrow needle blade (never wider
        // than 3px, so it can't read as a broadsword), straight slim guard,
        // thin grip, bead pommel. Length + finish grow by tier.
        const bw = 3;
        const len = 9 + tier * 1 + (leg ? 2 : 0);
        const y0 = 26 - len, x0 = 25 - ((bw / 2) | 0);
        px(g, x0, y0 + 2, bw, len - 2, blade); // slim blade body
        px(g, x0 + 1, y0, 1, 3, blade); // needle point
        px(g, x0 + 1, y0, 1, 1, lite); // glinting tip
        px(g, x0, y0 + 2, 1, len - 2, dark); // one-sided shade
        px(g, x0 + 1, y0 + 3, 1, len - 4, lite); // central fuller gleam
        if (tier <= 0) { px(g, x0 + 1, y0 + 4, 1, 2, "#6a4a2a"); } // rust pits
        if (tier >= 4) { px(g, x0 + 1, y0 - 2, 1, 2, blade); px(g, x0 + 1, y0 - 2, 1, 1, lite); } // bodkin point runs longer
        if (kiss) px(g, x0, y0 + 2, bw, 1, kiss); // envenomed / ember edge
        if (tier >= 2) etch(x0 + 1, y0 + 2, len - 3);
        if (leg) px(g, x0 + 1, y0 - 1, 1, 1, "#fff7ae");
        // slim straight guard, thin wrapped grip, bead pommel
        px(g, x0 - 2, 24, bw + 4, 1, tier >= 3 ? "#c9a227" : tier >= 1 ? "#8a5a33" : "#5a3a22");
        if (tier >= 2) { R_(g, x0 - 2, 24, lite); R_(g, x0 + bw + 1, 24, lite); }
        grip(x0, 25, 3);
        if (tier >= 3) px(g, x0, 28, bw, 2, tier >= 4 ? "#ffb02e" : "#9adcff"); // bead pommel
        else px(g, x0, 28, bw, 1, "#5a4a3a");
        break;
      }

      case "axe": {
        // VIKING battleaxe: broad single beard sweeping WEST ONLY (never
        // symmetric — symmetry is the hammer's read). Curved cutting edge on
        // the west rim, small poll/peen east of the haft, horn spike up top.
        px(g, 25, 8, 3, 22, "#6b4226");
        for (let y = 10; y < 29; y += 4) px(g, 25, y, 3, 1, "#3a2412"); // wrap bands
        if (tier >= 1) { px(g, 26, 8, 1, 10, "#8a8a92"); } // langet strip
        const bw = tier >= 4 ? 13 : tier >= 3 ? 12 : tier >= 2 ? 10 : tier >= 1 ? 8 : 6;
        const bh = tier >= 4 ? 9 : tier >= 2 ? 8 : tier >= 1 ? 7 : 6;
        const ax0 = 28 - bw, ay0 = 2; // blade crown; the haft (x25-27) is its east edge
        px(g, ax0, ay0, bw, 3, blade); // top bar
        px(g, ax0, ay0 + 3, bw, bh - 3, blade); // cheek
        px(g, ax0, ay0, 1, bh, lite); // curved cutting edge (west rim)
        px(g, ax0 + 1, ay0, bw - 3, 1, lite); // crown gleam
        px(g, ax0 + bw - 3, ay0 + 3, 2, bh - 3, dark); // shade by the haft
        if (tier <= 0) { px(g, ax0 + 2, ay0 + 3, 2, 2, "#6a4a2a"); } // rust pits
        // beard: lower edge hooks down at the cutting side, notched from haft
        const bd = tier >= 2 ? 3 : 2;
        px(g, ax0, ay0 + bh, 4, bd, blade); px(g, ax0, ay0 + bh, 1, bd, lite);
        px(g, ax0 + bw - 5, ay0 + 3, 2, bh - 3, dark); // beard notch cut
        if (tier >= 2) { px(g, 28, 4, 2, 3, blade); px(g, 28, 4, 2, 1, lite); } // rear peen
        if (tier >= 3) { px(g, ax0 + 2, ay0 + 4, bw - 6, 1, "#c9a227"); } // gold inlay
        if (tier >= 4) { px(g, 25, 0, 3, 2, blade); px(g, 26, 0, 1, 2, lite); px(g, 28, 4, 3, 3, blade); } // horn spike + big peen
        if (kiss) { px(g, ax0, ay0, 1, bh + bd, kiss); } // glowing cutting edge
        if (tier >= 2) etch(ax0 + 3, ay0 + 3, bh - 3);
        if (w.element === "holy" || tier >= 4) px(g, 22, 28, 7, 3, "#c9a227"); // blessed pommel cap
        else px(g, 23, 29, 5, 2, "#8a5a33");
        break;
      }
      case "hammer": {
        // MAUL: symmetric blocky head sitting LOW with the haft stub poking
        // out ABOVE it — the axe never protrudes, the spear never blocks.
        // Thickness + symmetry + twin peen caps = hammer at a glance.
        const hw = tier >= 4 ? 15 : tier >= 3 ? 13 : tier >= 2 ? 11 : 9;
        const x0 = 26 - ((hw / 2) | 0), hh = tier >= 2 ? 8 : 7, hy = 13 - hh;
        px(g, 25, 4, 3, 26, "#6b4226");
        for (let y = 14; y < 28; y += 4) px(g, 25, y, 3, 1, "#3a2412");
        px(g, 25, 4, 3, 1, "#a06a3a"); // haft cap above the head
        px(g, x0, hy, hw, hh, blade);
        px(g, x0, hy, hw, 2, lite); px(g, x0, hy + hh - 2, hw, 2, dark); // crown + foot
        px(g, x0, hy, 2, hh, dark); px(g, x0 + hw - 2, hy, 2, hh, lite); // chamfered cheeks
        px(g, x0 + 2, hy + 2, hw - 4, hh - 4, shade(blade, -18)); // sunk face panel
        px(g, x0 + 2, hy + 2, hw - 4, 1, lite); // panel catchlight
        if (tier >= 3) { px(g, x0 - 1, hy + 2, 1, 3, blade); px(g, x0 + hw, hy + 2, 1, 3, blade); } // twin peen caps
        if (w.element === "electric") { px(g, x0 + 2, hy + 3, hw - 4, 2, "#fff7ae"); px(g, x0 + 3, hy + 5, 2, 1, "#fff7ae"); px(g, x0 + hw - 5, hy + 5, 2, 1, "#fff7ae"); }
        else if (tier >= 4) { etch(x0 + 3, hy + 1, hh - 1); etch(x0 + hw - 4, hy + 1, hh - 1, lite); } // engraved runes
        if (kiss && w.element !== "electric") px(g, x0, hy, hw, 1, kiss);
        if (w.element === "holy" || leg) { px(g, x0, hy + hh, hw, 1, "#ffd93d"); px(g, x0 + 2, hy - 1, hw - 4, 1, "#fff7ae"); } // sanctified glow
        px(g, 22, 28, 7, 3, tier >= 4 ? "#c9a227" : "#8a5a33");
        break;
      }
      case "spear": {
        // TRUE spear: tallest + thinnest. 2px shaft, narrow diamond tip
        // (never wider than 5px) — a point, never a cleaver or a block.
        px(g, 25, 10, 2, 21, "#8a5a33");
        for (let y = 12; y < 29; y += 5) px(g, 25, y, 2, 1, "#5a3a22");
        const sw = tier >= 4 ? 5 : tier >= 3 ? 4 : 3;
        const sl = Math.min(9, 5 + tier + (leg ? 1 : 0));
        const sy = 10 - sl, sx0 = 26 - ((sw / 2) | 0);
        px(g, sx0, sy + 2, sw, sl - 2, blade); // leaf body
        px(g, 25, sy, 3, 3, blade); px(g, 26, sy - 1, 1, 3, blade); // diamond point
        px(g, 25, sy, 1, 3, lite); px(g, 26, sy - 1, 1, 1, lite); // point glint
        px(g, 26, sy + 2, 1, sl - 3, lite); // midrib gleam
        px(g, sx0, sy + 2, 1, sl - 2, dark); // one-sided shade
        if (tier <= 0) { px(g, sx0 + 1, sy + 3, 1, 2, "#6a4a2a"); } // rust pit
        if (tier >= 1) { px(g, 24, 10, 4, 2, tier >= 3 ? "#c9a227" : "#8a8a92"); } // binding collar
        if (tier >= 2) { px(g, sx0 - 1, 8, 1, 2, blade); px(g, sx0 + sw, 8, 1, 2, blade); } // small langet wings
        if (tier >= 3) { px(g, 24, 12, 4, 1, "#a02040"); px(g, 25, 13, 1, 2, "#c93b3b"); } // tassel knot + strand
        if (tier >= 3) { px(g, 24, 31, 4, 2, "#8a8a92"); px(g, 25, 33, 2, 2, blade); } // butt spike
        if (kiss) px(g, 25, sy, 3, 1, kiss); // element-kissed point
        if (leg) px(g, 25, sy - 3, 3, 1, "#fff7ae"); // dawn sparkle
        break;
      }
      case "wand": {
        // spiral-wrapped shaft, faceted gem with halo + claws at top tier.
        px(g, 24, 16, 3, 14, "#5a3a22");
        for (let y = 16; y < 30; y += 3) px(g, 24 + (((y / 3) | 0) % 2), y, 2, 1, "#8a5a33"); // spiral wrap
        const gem = GEM_COLOR[w.mat] || "#cfe8ff";
        const gs = tier >= 4 ? 8 : tier >= 3 ? 7 : tier >= 2 ? 6 : 5;
        const gx = 25 - ((gs / 2) | 0), gy = 16 - gs;
        px(g, gx + 1, gy - 2, gs - 2, 2, "#8a6a3a"); // fork prongs bed
        px(g, gx, gy, gs, gs, gem);
        px(g, gx, gy, gs, 2, "#ffffff"); px(g, gx, gy + gs - 2, gs, 2, shade(gem, -50)); // facet light + shade
        px(g, gx, gy, 2, gs, "#ffffff");
        R_(g, gx + 1, gy + 1, "#fff");
        if (kiss) px(g, gx + ((gs / 2) | 0) - 1, gy + ((gs / 2) | 0) - 1, 2, 2, kiss); // element heart
        else px(g, gx + ((gs / 2) | 0), gy + ((gs / 2) | 0), 1, 1, "#fff");
        if (tier >= 4) { px(g, gx - 2, gy + 2, 2, 4, "#8a6a3a"); px(g, gx + gs, gy + 2, 2, 4, "#8a6a3a"); px(g, gx - 2, gy + 1, 2, 1, "#ffb02e"); px(g, gx + gs, gy + 1, 2, 1, "#ffb02e"); } // dragon claws
        if (tier >= 3) { // halo ring
          const hx = gx + ((gs / 2) | 0), hy2 = gy + ((gs / 2) | 0), dd = ((gs / 2) | 0) + 2;
          R_(g, hx - dd, hy2, "#fff7ae"); R_(g, hx + dd, hy2, "#fff7ae"); R_(g, hx, hy2 - dd, "#fff7ae"); R_(g, hx, hy2 + dd, "#fff7ae");
        }
        if (leg) px(g, gx + 1, gy - 3, gs - 2, 1, "#fff7ae");
        break;
      }
      case "staff": {
        // towering shaft, big swirling orb: cage at low tier, crown at high.
        const orb = w.element === "fire" ? "#ff7b2e" : w.element === "ice" ? "#7fd6ff" : (GEM_COLOR[w.mat] || "#7fd4ff");
        const os = tier >= 4 ? 9 : tier >= 3 ? 8 : tier >= 2 ? 7 : 6;
        const ox = 25 - ((os / 2) | 0);
        px(g, 24, 8, 3, 23, "#5a3a22");
        for (let y = 10; y < 29; y += 4) px(g, 24, y, 3, 1, "#7d5230");
        if (tier >= 2) { px(g, 23, 31, 5, 1, "#8a8a92"); px(g, 24, 32, 3, 2, "#5a5a66"); } // butt spike
        px(g, ox, 0, os, os, orb);
        px(g, ox, 0, os, 2, "#ffffff"); px(g, ox, 0, 2, os, "#ffffff"); // arc light
        px(g, ox + os - 2, 2, 2, os - 2, shade(orb, -55)); // sphere shade
        px(g, ox + 2, 2, 3, 3, "#ffffff"); // specular
        px(g, ox + ((os / 2) | 0) - 1, 3 + ((tier * 7) % 3), 2, 2, kiss || "#ffffff"); // swirling mote
        if (tier >= 3) { // crown prongs with mini gems
          px(g, ox - 2, 1, 2, 6, "#8a6a3a"); px(g, ox + os, 1, 2, 6, "#8a6a3a"); px(g, ox, os - 1, os, 2, "#8a6a3a");
          px(g, ox - 2, 0, 2, 2, "#ffb02e"); px(g, ox + os, 0, 2, 2, "#ffb02e");
        } else { px(g, ox - 1, 2, 2, os - 2, "#8a6a3a"); px(g, ox + os - 1, 2, 2, os - 2, "#8a6a3a"); } // plain cage
        if (w.mat === "dragonhorn") { px(g, ox - 2, 2, 2, 3, "#ffb02e"); px(g, ox + os, 2, 2, 3, "#ffb02e"); } // horn talons
        if (leg) { R_(g, ox - 3, 3, "#fff7ae"); R_(g, ox + os + 2, 3, "#fff7ae"); R_(g, ox - 3, os - 2, "#fff7ae"); R_(g, ox + os + 2, os - 2, "#fff7ae"); } // radiant orbit
        break;
      }
      case "whip": {
        // coiled taming lash: braided handle in the fist, hanging coil loops
        // and a trailing lash with a barbed tip. Tiers: plain leather to
        // studded, gold-braided, dragon-hide with a glowing crack-tip.
        const leather = tier >= 4 ? "#7a3a1a" : tier >= 3 ? "#8a5a33" : tier >= 2 ? "#6b4226" : "#5a4028";
        const leatherL = tier >= 4 ? "#ffb02e" : tier >= 3 ? "#e8c85a" : "#a06a3a";
        grip(24, 24, 5, "#3a2a1a"); // braided handle in the right hand
        px(g, 23, 24, 1, 5, leatherL); // braid highlight
        if (tier >= 2) { px(g, 24, 24, 3, 1, "#c9a227"); px(g, 24, 28, 3, 1, "#c9a227"); } // gold bands
        // hanging coil: two loops below the fist
        px(g, 22, 29, 7, 2, leather); px(g, 22, 29, 7, 1, leatherL);
        px(g, 23, 31, 5, 2, leather);
        px(g, 22, 33, 7, 1, tier >= 2 ? "#c9a227" : leather);
        // trailing lash rising beside the arm, barbed crack-tip
        px(g, 28, 8, 2, 17, leather);
        px(g, 28, 8, 1, 17, leatherL);
        if (tier >= 1) for (let y = 10; y < 24; y += 4) px(g, 28, y, 2, 1, tier >= 3 ? "#c9a227" : "#3a2a2a"); // studs / braid knots
        px(g, 27, 5, 4, 3, blade); // crack-tip knot
        px(g, 28, 5, 1, 2, lite);
        if (tier >= 3) px(g, 27, 4, 4, 1, "#fff7ae"); // gold crack-flash
        if (tier >= 4) { px(g, 29, 6, 1, 3, "#ff7b2e"); px(g, 26, 6, 1, 2, "#ff7b2e"); } // dragon-ember barbs
        if (kiss) px(g, 27, 5, 4, 1, kiss); // element-kissed tip
        if (leg) R_(g, 28, 3, "#fff7ae");
        break;
      }
      default: {
        // swords: rescue-short to dawn-long; broad blades, swept guards, gems.
        const bw = tier >= 3 ? 5 : tier >= 1 ? 4 : 3;
        const len = 14 + tier * 2 + (leg ? 2 : 0);
        const y0 = 27 - len, x0 = 25 - ((bw / 2) | 0);
        px(g, x0, y0, bw, len, blade);
        px(g, x0, y0, 1, len, shade(blade, -40));
        px(g, x0 + 1, y0, Math.min(2, bw - 1), Math.min(7, len), lite); // fuller gleam
        if (tier <= 0) { px(g, x0 + 1, y0 + 3, 1, 4, "#6a4a2a"); px(g, x0, y0 + 8, 1, 2, "#6a4a2a"); } // rust pits
        if (tier >= 2) etch(x0 + ((bw / 2) | 0), y0, len); // etched runes
        if (tier >= 4 && w.mat === "dragonbone") { for (let i = 0; i < 4; i++) px(g, x0 + bw - 1, y0 + 2 + i * 4, 1, 3, "#b06a1a"); } // serrated spine
        if (kiss) px(g, x0, y0, bw, 2, kiss); // element tip
        // guards: nub -> bar -> swept gold -> ornate dawn guard
        if (tier >= 4) { px(g, 20, 25, 11, 2, "#c9a227"); px(g, 20, 25, 1, 3, "#c9a227"); px(g, 30, 25, 1, 3, "#c9a227"); }
        else if (tier >= 3) { px(g, 20, 25, 10, 2, "#c9a227"); px(g, 20, 24, 1, 2, "#c9a227"); px(g, 29, 24, 1, 2, "#c9a227"); }
        else if (tier >= 1) px(g, 25 - (tier >= 2 ? 4 : 3), 25, tier >= 2 ? 8 : 6, 2, w.mat === "silver" ? "#c9ccd4" : "#8a5a33");
        else px(g, 24, 25, 4, 2, "#5a3a22");
        grip(x0 + ((bw / 2) | 0) - 1, 27, 3);
        if (tier >= 3) { px(g, x0 + ((bw / 2) | 0) - 1, 30, 3, 2, tier >= 4 ? "#ffb02e" : "#9adcff"); R_(g, x0 + ((bw / 2) | 0), 30, "#fff"); }
        else px(g, x0 + ((bw / 2) | 0) - 1, 30, 3, 1, "#5a4a3a");
        if (w.mat === "holy" || w.element === "holy" || leg) { // dawn radiance flanking the blade
          for (let y = y0 + 2; y < y0 + len - 2; y += 4) { R_(g, x0 - 1, y, "#fff7ae"); R_(g, x0 + bw, y + 2, "#fff7ae"); }
        }
        break;
      }
    }
  }

  // Worn shield for the player sprite — left arm (x1-7, y16-29), drawn over
  // the outfit but under the off-hand weapon. Six tiers, each its own
  // silhouette + finish like weapons: plank buckler -> iron square ->
  // steel kite -> silver heater with holy cross -> mythril aegis with wings
  // -> dragonbone scapula. Reads at game zoom next to the main blade.
  function drawPlayerShield(g, gear) {
    let s = null;
    try { s = (gear && gear.s) || null; } catch (e) { }
    if (!s) return;
    if (!window.Items || !window.Items.ITEMS || !window.Items.ITEMS[s]) return;
    switch (s) {
      case "wooden_buckler": {
        px(g, 1, 18, 6, 9, "#5a3a22");
        px(g, 2, 19, 4, 7, "#8a5a33"); px(g, 2, 19, 4, 1, "#b08355");
        px(g, 2, 25, 4, 1, "#5a3a22");
        px(g, 3, 21, 2, 3, "#d9c27f"); px(g, 3, 21, 2, 1, "#fff2b0"); // boss
        px(g, 1, 18, 6, 1, "#3a2412"); px(g, 1, 26, 6, 1, "#3a2412");
        break;
      }
      case "iron_shield": {
        px(g, 1, 16, 7, 12, "#3a3a42");
        px(g, 2, 17, 5, 10, "#8a8a92"); px(g, 2, 17, 5, 1, "#c9ccd4");
        px(g, 3, 19, 1, 1, "#222"); px(g, 5, 19, 1, 1, "#222");
        px(g, 3, 24, 1, 1, "#222"); px(g, 5, 24, 1, 1, "#222"); // rivets
        px(g, 3, 21, 3, 3, "#5a5a66"); px(g, 4, 22, 1, 1, "#e8ecf2"); // boss
        break;
      }
      case "steel_shield": {
        // kite: wide top, pointed foot, gold trim
        px(g, 1, 16, 7, 11, "#5a5a66");
        px(g, 2, 17, 5, 9, "#c9ccd4"); px(g, 2, 17, 5, 1, "#eef2f6");
        px(g, 1, 16, 7, 1, "#c9a227"); px(g, 3, 27, 3, 2, "#c9a227");
        px(g, 3, 20, 3, 4, "#8a9aaa"); px(g, 4, 21, 1, 2, "#fff"); // pale field
        px(g, 4, 22, 1, 1, "#c9a227");
        break;
      }
      case "silver_shield": {
        // heater with holy cross — bites the undead back
        px(g, 1, 16, 7, 10, "#8a8a92");
        px(g, 2, 17, 5, 8, "#f4f6ff"); px(g, 2, 17, 5, 1, "#fff");
        px(g, 3, 18, 3, 6, "#c9a227"); px(g, 2, 20, 5, 1, "#c9a227"); // cross
        px(g, 4, 19, 1, 1, "#fff7ae");
        px(g, 3, 26, 3, 2, "#8a8a92");
        break;
      }
      case "mythril_shield": {
        // sky-blue aegis with white wings + gem heart
        px(g, 1, 16, 7, 11, "#2a6a8a");
        px(g, 2, 17, 5, 9, "#7fc4ff"); px(g, 2, 17, 5, 1, "#e0f4ff");
        px(g, 0, 18, 2, 5, "#e8f7ff"); px(g, 7, 18, 1, 5, "#e8f7ff"); // wings
        px(g, 3, 21, 3, 3, "#0a3a5a"); px(g, 4, 22, 1, 1, "#fff"); // gem
        px(g, 2, 17, 1, 9, "#fff"); px(g, 6, 17, 1, 9, "#2a6a8a");
        break;
      }
      case "dragonbone_shield": {
        // dragon scapula: big bone plate, teeth edge, ember core
        px(g, 0, 15, 8, 13, "#5a3a1a");
        px(g, 1, 16, 6, 11, "#d9cfae"); px(g, 1, 16, 6, 1, "#f2e8c9");
        px(g, 1, 27, 2, 1, "#b06a1a"); px(g, 3, 27, 2, 1, "#b06a1a"); px(g, 5, 27, 2, 1, "#b06a1a"); // teeth
        px(g, 3, 20, 3, 4, "#8a1f0e"); px(g, 3, 20, 3, 1, "#ff7b2e"); // ember core
        px(g, 4, 21, 1, 2, "#ffd93d");
        break;
      }
      case "dawnstone_aegis": {
        // sunrise held edge-on: gold disc on bright steel
        px(g, 1, 16, 7, 11, "#8a6a1a");
        px(g, 2, 17, 5, 9, "#fff2b0"); px(g, 2, 17, 5, 1, "#fff");
        px(g, 3, 20, 3, 4, "#ffb02e"); px(g, 4, 21, 1, 2, "#fff7ae");
        px(g, 3, 26, 3, 2, "#c9a227");
        break;
      }
      case "oblivion_aegis": {
        // slab of the end: void-violet plate, star sparks
        px(g, 1, 16, 7, 11, "#1a0a2a");
        px(g, 2, 17, 5, 9, "#3a1a5a"); px(g, 2, 17, 5, 1, "#5a2a8a");
        px(g, 3, 20, 1, 1, "#fff"); px(g, 5, 22, 1, 1, "#c9a227"); px(g, 3, 24, 1, 1, "#fff");
        px(g, 3, 21, 3, 2, "#0a0515");
        break;
      }
      default: {
        // future shields: iron-bound plank fallback, never invisible
        px(g, 1, 17, 6, 10, "#5a3a22");
        px(g, 2, 18, 4, 8, "#8a8a92"); px(g, 2, 18, 4, 1, "#c9ccd4");
        break;
      }
    }
  }

  // Off-hand weapon for the player sprite — mirrored into the LEFT hand
  // (x2-9) at ~0.85 scale so it never covers the face (face ends at x21 on
  // the right; the mirror keeps clear). Compact family silhouettes reusing
  // the same tier colors/edges as the main hand: blade length, axe bit,
  // hammer head, spear leaf, dagger stiletto, bow limbs, focus gem, whip coil.
  function drawPlayerOffhandWeapon(g, gear) {
    let oid = null;
    try { oid = (gear && gear.o) || null; } catch (e) { }
    if (!oid) return;
    let w = null;
    try { w = (window.Items && window.Items.ITEMS && window.Items.ITEMS[oid]) || null; } catch (e) { }
    if (!w || w.slot !== "weapon") return;
    const blade = (window.Items && null) || null;
    const BC = { wood: "#b08355", rusty: "#9aa0a8", iron: "#c9ccd4", steel: "#eef2f6", silver: "#f4f6ff", mythril: "#9adcff", dragonbone: "#ffb02e", holy: "#fff7ae" };
    const mat = w.mat || "iron";
    const col = BC[mat] || "#cccccc";
    const dark = col === "#cccccc" ? "#888888" : col;
    const kiss = (w.element && { fire: "#ff7b2e", ice: "#bfe9ff", electric: "#fff7ae", nature: "#7ddf6b", water: "#4fc3ef", holy: "#fff7ae" }[w.element]) || null;
    const tier = (() => {
      const m = mat;
      if (m === "dragonbone" || m === "holy") return 4;
      if (m === "mythril") return 3;
      if (m === "steel" || m === "silver") return 2;
      if (m === "iron") return 1;
      return 0;
    })();
    // left-hand anchor: grip around x5, y26
    const grip = (x, y0, h, core) => { px(g, x, y0, 3, h, core || "#3a2a1a"); for (let y = y0; y < y0 + h; y += 2) px(g, x, y, 3, 1, "#6b4226"); };
    switch (w.wtype) {
      case "dagger": {
        // slim stiletto to match the main hand: 2px needle blade, tiny guard.
        const bw = 2, len = 8 + tier;
        const x0 = 5 - ((bw / 2) | 0), y0 = 26 - len;
        px(g, x0, y0 + 1, bw, len - 1, col);
        px(g, x0, y0, bw, 1, "#fff");
        px(g, x0, y0 + 1, 1, len - 1, "#888");
        if (kiss) px(g, x0, y0 + 1, bw, 1, kiss);
        px(g, x0 - 1, 24, bw + 2, 1, tier >= 2 ? "#c9a227" : "#5a3a22");
        grip(x0, 25, 3);
        break;
      }
      case "sword": {
        const bw = tier >= 3 ? 4 : 3, len = 10 + tier * 2;
        const x0 = 5 - ((bw / 2) | 0), y0 = 27 - len;
        px(g, x0, y0, bw, len, col);
        px(g, x0, y0, 1, len, "#888");
        if (kiss) px(g, x0, y0, bw, 1, kiss);
        px(g, x0 - 1, 25, bw + 2, 2, tier >= 3 ? "#c9a227" : "#8a5a33");
        grip(x0, 27, 3);
        break;
      }
      case "axe": {
        // one-sided viking beard west of the haft; edge glints on the west rim.
        px(g, 5, 14, 2, 14, "#6b4226");
        const abw = tier >= 2 ? 4 : 3;
        px(g, 5 - abw, 14, abw, tier >= 2 ? 6 : 5, col);
        px(g, 5 - abw, 14, 1, tier >= 2 ? 6 : 5, "#fff"); // cutting edge
        px(g, 5 - abw, 14, abw, 1, "#fff"); // crown gleam
        if (tier >= 2) { px(g, 5 - abw, 20, 2, 2, col); } // beard hook
        else { px(g, 6, 16, 1, 2, "#6a4a2a"); } // rust pit
        if (tier >= 3) { px(g, 5, 13, 2, 2, col); } // rear peen
        if (kiss) px(g, 5 - abw, 14, 1, tier >= 2 ? 8 : 5, kiss);
        break;
      }
      case "hammer": {
        // symmetric blocky maul centered on the haft + stub above the head.
        const hw = 6 + tier;
        const x0 = 5 - ((hw / 2) | 0);
        px(g, 4, 12, 2, 16, "#6b4226");
        px(g, 4, 12, 2, 1, "#a06a3a"); // haft cap above head
        px(g, x0, 14, hw, 5, col);
        px(g, x0, 14, hw, 1, "#fff"); // crown
        px(g, x0, 18, hw, 1, "#888"); // foot shade
        px(g, x0, 14, 1, 5, "#888");
        if (tier >= 3) { px(g, x0 - 1, 15, 1, 2, col); px(g, x0 + hw, 15, 1, 2, col); } // twin peens
        if (kiss) px(g, x0, 14, hw, 1, kiss);
        break;
      }
      case "spear": {
        // narrow diamond point on a thin shaft — never wider than 3px.
        px(g, 4, 14, 2, 15, "#8a5a33");
        px(g, 3, 8, 5, 5, col); // leaf body
        px(g, 4, 6, 3, 3, col); px(g, 5, 5, 1, 2, col); // diamond point
        px(g, 4, 6, 1, 3, "#fff"); px(g, 5, 5, 1, 1, "#fff"); // point glint
        px(g, 5, 8, 1, 5, "#fff"); // midrib
        px(g, 3, 8, 1, 5, "#888"); // shade
        if (kiss) px(g, 4, 6, 3, 1, kiss);
        break;
      }
      case "bow": {
        px(g, 3, 14, 2, 8, "#8a5a33");
        px(g, 2, 10, 3, 4, "#8a5a33"); px(g, 2, 22, 3, 4, "#8a5a33");
        px(g, 5, 10, 1, 16, "#e8e0d0");
        break;
      }
      case "wand": {
        px(g, 4, 20, 3, 9, "#5a3a22");
        const gem = { quartz: "#cfe8ff", ruby: "#ff3b3b", sapphire: "#3f8ef0", holybead: "#ffd93d", emerald: "#5dd68a", dragonhorn: "#ff9d2e" }[mat] || "#cfe8ff";
        px(g, 3, 15, 5, 5, gem); px(g, 3, 15, 5, 1, "#fff");
        break;
      }
      case "staff": {
        px(g, 4, 12, 2, 17, "#5a3a22");
        const orb = w.element === "fire" ? "#ff7b2e" : w.element === "ice" ? "#7fd6ff" : "#7fd4ff";
        px(g, 2, 6, 6, 6, orb); px(g, 2, 6, 6, 1, "#fff");
        break;
      }
      case "whip": {
        grip(4, 24, 5, "#3a2a1a");
        px(g, 2, 29, 5, 2, "#6b4226");
        px(g, 2, 12, 2, 12, "#6b4226");
        if (kiss) px(g, 2, 12, 2, 1, kiss);
        break;
      }
      default: {
        px(g, 3, 16, 4, 9, col);
        px(g, 3, 16, 1, 9, "#888");
        grip(4, 25, 3);
        break;
      }
    }
    void blade;
  }


  // Worn armor for the player sprite (over the base tunic).
  // Worn armor for the player sprite (over the base tunic).
  // Bespoke per-armor overlays: silhouette + material + tier trim must read
  // at game zoom. Heavy = full plate + pauldrons + greaves, light = cuirass
  // + bracers + shoulder piece, robe = floor-length skirt + emblem.
  function drawPlayerArmor(g, gear) {
    let a = null;
    try { a = (gear && gear.a) || null; } catch (e) { }
    if (!a) return;
    const R = (x, y, c) => px(g, x, y, 1, 1, c || "#e8ecf2"); // rivet / spark pixel
    switch (a) {
      case "cloth_robe": {
        // humble sand wrap + rope belt + leg wraps
        px(g, 9, 20, 14, 10, "#6a5a48");
        px(g, 9, 20, 3, 10, "#7d6c56"); px(g, 20, 20, 3, 10, "#54432f");
        px(g, 9, 29, 14, 2, "#54432f");
        px(g, 9, 24, 14, 1, "#4a3a28");
        px(g, 14, 24, 3, 2, "#c9a45a"); // rope knot
        px(g, 16, 21, 1, 3, "#54432f"); // fold
        px(g, 10, 30, 3, 6, "#5a4a3a"); px(g, 19, 30, 3, 6, "#5a4a3a"); // leg wraps
        break;
      }
      case "leather_armor": {
        // stitched cuirass, belt + buckle, one pauldron, bracers
        px(g, 9, 18, 14, 11, "#6b4226");
        px(g, 9, 18, 2, 11, "#7d5230"); px(g, 20, 18, 2, 11, "#4e2f1a");
        px(g, 13, 18, 6, 11, "#75522e"); // chest panel
        for (let y = 19; y < 28; y += 2) { R(10, y, "#d9c27f"); R(21, y, "#d9c27f"); } // stitching
        px(g, 9, 26, 14, 2, "#3a2412"); px(g, 15, 26, 2, 2, "#c9a45a"); // belt + buckle
        px(g, 3, 17, 7, 4, "#6b4226"); px(g, 3, 17, 7, 1, "#8a5a33"); px(g, 3, 20, 7, 1, "#4e2f1a"); // pauldron
        px(g, 6, 23, 3, 4, "#4e2f1a"); px(g, 23, 23, 3, 4, "#4e2f1a"); // bracers
        px(g, 6, 24, 3, 1, "#c9a45a"); px(g, 23, 24, 3, 1, "#c9a45a");
        px(g, 9, 29, 14, 2, "#4e2f1a"); // skirt bands
        break;
      }
      case "wayfarer_garb": {
        // green cloak drape, scarf, cross strap
        px(g, 4, 17, 8, 12, "#3a5a2f");
        px(g, 4, 17, 2, 12, "#4a7040"); px(g, 10, 17, 2, 12, "#2a4422");
        px(g, 4, 28, 8, 2, "#2a4422");
        px(g, 10, 18, 2, 2, "#c9b98a"); // clasp
        px(g, 20, 18, 2, 1, "#5a3a22"); px(g, 17, 20, 3, 1, "#5a3a22"); px(g, 14, 22, 3, 1, "#5a3a22"); px(g, 11, 24, 3, 1, "#5a3a22"); px(g, 9, 26, 2, 1, "#5a3a22"); // strap
        px(g, 11, 16, 10, 2, "#c9b98a"); // scarf
        px(g, 19, 18, 3, 5, "#c9b98a"); px(g, 19, 22, 3, 1, "#8a6c46"); // scarf tail
        px(g, 12, 27, 10, 2, "#3a2a1a"); // belt
        break;
      }
      case "shadowweave_garb": {
        // dark indigo garb, glowing violet runes, high collar, purple hem
        px(g, 9, 18, 14, 12, "#23232e");
        px(g, 9, 18, 2, 12, "#34344a"); px(g, 20, 18, 2, 12, "#14141c");
        px(g, 12, 20, 1, 8, "#8a5ae0"); px(g, 19, 20, 1, 8, "#8a5ae0"); // rune seams
        R(12, 21, "#c9a9ff"); R(12, 24, "#c9a9ff"); R(12, 27, "#c9a9ff");
        R(19, 21, "#c9a9ff"); R(19, 24, "#c9a9ff"); R(19, 27, "#c9a9ff");
        px(g, 12, 22, 8, 1, "#5a3aa0"); R(14, 22, "#c9a9ff"); R(17, 22, "#c9a9ff"); // waist rune-row
        px(g, 10, 15, 12, 3, "#14141c"); px(g, 10, 15, 12, 1, "#c9a9ff"); // collar + bright rim
        px(g, 9, 29, 14, 1, "rgba(160,110,255,0.7)"); // hem glow
        px(g, 6, 23, 3, 4, "#16161e"); px(g, 23, 23, 3, 4, "#16161e"); // bracers
        R(6, 24, "#8a5ae0"); R(25, 24, "#8a5ae0");
        break;
      }

      case "iron_armor": {
        // riveted full plate: gorget, ridged breastplate, faulds, pauldrons
        px(g, 12, 16, 8, 2, "#6a7280"); px(g, 12, 16, 8, 1, "#9aa2ae"); // gorget
        px(g, 9, 18, 14, 11, "#8a9aaa");
        px(g, 9, 18, 2, 11, "#c3cad4"); px(g, 20, 18, 2, 11, "#5a626e");
        px(g, 15, 18, 2, 11, "#d0d6de"); px(g, 17, 18, 1, 11, "#5a626e"); // center ridge
        px(g, 11, 25, 10, 4, "#7d8592"); px(g, 11, 25, 10, 1, "#9aa2ae"); // plackart
        px(g, 9, 29, 14, 1, "#6a7280"); px(g, 10, 30, 12, 1, "#7d8592"); // faulds
        px(g, 3, 16, 7, 5, "#8a9aaa"); px(g, 3, 16, 7, 1, "#d0d6de"); px(g, 3, 19, 7, 1, "#5a626e"); // L pauldron
        px(g, 22, 16, 7, 5, "#8a9aaa"); px(g, 22, 16, 7, 1, "#d0d6de"); px(g, 22, 19, 7, 1, "#5a626e"); // R pauldron
        R(9, 18); R(22, 18); R(9, 28); R(22, 28); R(4, 17); R(27, 17); // rivets
        px(g, 11, 31, 4, 5, "#6a7280"); px(g, 17, 31, 4, 5, "#6a7280"); // greaves
        px(g, 12, 31, 2, 1, "#9aa2ae"); px(g, 18, 31, 2, 1, "#9aa2ae");
        px(g, 6, 22, 3, 5, "#6a7280"); px(g, 23, 22, 3, 5, "#6a7280"); // vambraces
        break;
      }
      case "steel_plate": {
        // brighter plate, gold trim, bigger pauldrons, plackart cross
        px(g, 12, 16, 8, 2, "#7d8592"); px(g, 12, 16, 8, 1, "#c9a227"); // gold gorget rim
        px(g, 9, 18, 14, 11, "#b9c2cc");
        px(g, 9, 18, 2, 11, "#eef2f6"); px(g, 20, 18, 2, 11, "#7d8592");
        px(g, 15, 18, 2, 11, "#ffffff"); px(g, 17, 18, 1, 11, "#7d8592");
        px(g, 11, 25, 10, 4, "#a8b0ba"); px(g, 11, 25, 10, 1, "#c9ccd4");
        px(g, 15, 25, 2, 4, "#c9a227"); px(g, 13, 26, 6, 1, "#c9a227"); // gold cross
        px(g, 9, 29, 14, 1, "#c9a227"); px(g, 10, 30, 12, 1, "#a8b0ba"); // gold fauld rim
        px(g, 2, 15, 8, 6, "#b9c2cc"); px(g, 2, 15, 8, 1, "#c9a227"); px(g, 2, 18, 8, 1, "#7d8592"); px(g, 2, 20, 8, 1, "#c9a227"); // L grand pauldron
        px(g, 22, 15, 8, 6, "#b9c2cc"); px(g, 22, 15, 8, 1, "#c9a227"); px(g, 22, 18, 8, 1, "#7d8592"); px(g, 22, 20, 8, 1, "#c9a227"); // R grand pauldron
        R(9, 19, "#fff"); R(22, 19, "#fff"); R(3, 16, "#fff"); R(28, 16, "#fff");
        px(g, 11, 31, 4, 5, "#8a929c"); px(g, 17, 31, 4, 5, "#8a929c"); // greaves
        px(g, 12, 31, 2, 1, "#eef2f6"); px(g, 18, 31, 2, 1, "#eef2f6");
        px(g, 8, 36, 3, 1, "#c9a227"); px(g, 21, 36, 3, 1, "#c9a227"); // sabaton toes
        px(g, 6, 22, 3, 5, "#8a929c"); px(g, 23, 22, 3, 5, "#8a929c");
        break;
      }
      case "mythril_plate": {
        // shimmering cyan plate, glow seams, rune ring on the chest
        px(g, 12, 16, 8, 2, "#4e8a9a"); px(g, 12, 16, 8, 1, "#e0f4ff");
        px(g, 9, 18, 14, 11, "#7fc4d4");
        px(g, 9, 18, 2, 11, "#e0f4ff"); px(g, 20, 18, 2, 11, "#4e8a9a");
        px(g, 15, 18, 2, 11, "#f2fbff");
        // glowing rune ring + heart gem
        R(13, 21, "#e0f4ff"); R(17, 21, "#e0f4ff"); R(13, 25, "#e0f4ff"); R(17, 25, "#e0f4ff");
        R(14, 20, "#e0f4ff"); R(16, 20, "#e0f4ff"); R(14, 26, "#e0f4ff"); R(16, 26, "#e0f4ff");
        px(g, 15, 22, 2, 3, "#bfe9ff"); R(15, 23, "#ffffff");
        px(g, 11, 25, 10, 1, "rgba(224,244,255,0.7)");
        px(g, 9, 29, 14, 1, "#e0f4ff");
        px(g, 10, 30, 12, 1, "rgba(224,244,255,0.6)");
        px(g, 2, 15, 8, 6, "#7fc4d4"); px(g, 2, 15, 8, 1, "#ffffff"); px(g, 2, 20, 8, 1, "#e0f4ff");
        px(g, 22, 15, 8, 6, "#7fc4d4"); px(g, 22, 15, 8, 1, "#ffffff"); px(g, 22, 20, 8, 1, "#e0f4ff");
        R(3, 16, "#fff"); R(28, 16, "#fff"); R(9, 19, "#fff"); R(22, 19, "#fff");
        px(g, 11, 31, 4, 5, "#5a9ab0"); px(g, 17, 31, 4, 5, "#5a9ab0");
        px(g, 12, 31, 1, 5, "#e0f4ff"); px(g, 19, 31, 1, 5, "#e0f4ff"); // glow seams
        px(g, 6, 22, 3, 5, "#5a9ab0"); px(g, 23, 22, 3, 5, "#5a9ab0");
        break;
      }
      case "dragonbone_plate": {
        // war-trophy bone: dark plates, gold rims, spiked pauldrons, skull plaque
        px(g, 12, 16, 8, 2, "#6a5a3a"); px(g, 12, 16, 8, 1, "#ffb02e"); // gorget + gold rim
        px(g, 9, 18, 14, 11, "#c4b28a");
        px(g, 9, 18, 2, 11, "#e8dcbc"); px(g, 20, 18, 2, 11, "#6a5a3a");
        for (let y = 20; y < 28; y += 3) px(g, 9, y, 14, 1, "#8a7648"); // plate segments
        px(g, 9, 18, 14, 1, "#ffb02e"); // gold collar rim
        // skull emblem riveted on a dark plaque
        px(g, 13, 21, 5, 5, "#3a2e1a");
        px(g, 14, 22, 3, 3, "#f2ead0"); R(14, 23, "#3a2a1a"); R(16, 23, "#3a2a1a");
        px(g, 15, 25, 1, 1, "#3a2a1a");
        R(13, 21, "#ffb02e"); R(17, 21, "#ffb02e"); R(13, 25, "#ffb02e"); R(17, 25, "#ffb02e");
        px(g, 9, 29, 14, 1, "#ffb02e");
        for (let x = 10; x < 22; x += 3) px(g, x, 30, 1, 1, "#6a5a3a"); // ribbed faulds
        // layered spiked pauldrons, gold-tipped
        px(g, 3, 17, 7, 4, "#c4b28a"); px(g, 3, 17, 7, 1, "#ffb02e"); px(g, 3, 19, 7, 1, "#8a7648");
        px(g, 5, 14, 2, 3, "#c4b28a"); px(g, 5, 13, 2, 1, "#ffb02e");
        px(g, 8, 14, 2, 3, "#b3a179"); px(g, 8, 13, 2, 1, "#ffb02e");
        px(g, 22, 17, 7, 4, "#c4b28a"); px(g, 22, 17, 7, 1, "#ffb02e"); px(g, 22, 19, 7, 1, "#8a7648");
        px(g, 25, 14, 2, 3, "#c4b28a"); px(g, 25, 13, 2, 1, "#ffb02e");
        px(g, 22, 14, 2, 3, "#b3a179"); px(g, 22, 13, 2, 1, "#ffb02e");
        R(4, 18, "#fff8e0"); R(27, 18, "#fff8e0");
        px(g, 11, 31, 4, 5, "#8a7648"); px(g, 17, 31, 4, 5, "#8a7648");
        px(g, 12, 31, 2, 2, "#ffb02e"); px(g, 18, 31, 2, 2, "#ffb02e"); // gold knees
        px(g, 6, 22, 3, 5, "#8a7648"); px(g, 23, 22, 3, 5, "#8a7648");
        break;
      }

      case "dragonscale_vest": {
        // overlapping scales, deep gaps, bright spine + gold trim
        for (let rI = 0; rI < 5; rI++) {
          const y = 19 + rI * 2, c = rI % 2 ? "#5d7048" : "#465637";
          px(g, 9, y, 14, 2, c);
          px(g, 9, y, 14, 1, rI % 2 ? "#7d9060" : "#5a6a46");
          for (let x = 10 + (rI % 2); x < 22; x += 3) R(x, y + 1, "#242e1c"); // deep scale gaps
        }
        px(g, 15, 19, 2, 10, "#8a7a3a"); // gold spine
        R(15, 20, "#ffd93d"); R(16, 23, "#ffd93d"); R(15, 26, "#ffd93d"); R(16, 28, "#ffd93d");
        px(g, 9, 29, 14, 1, "#ffb02e"); // gold hem
        px(g, 3, 17, 7, 4, "#465637"); px(g, 3, 17, 7, 1, "#ffb02e"); px(g, 4, 18, 5, 1, "#5d7048");
        px(g, 22, 17, 7, 4, "#465637"); px(g, 22, 17, 7, 1, "#ffb02e"); px(g, 23, 18, 5, 1, "#5d7048");
        px(g, 6, 23, 3, 4, "#2a3622"); px(g, 23, 23, 3, 4, "#2a3622"); // bracers
        break;
      }

      case "emberplate": {
        // black-red plate split by glowing lava cracks, jagged pauldrons
        px(g, 12, 16, 8, 2, "#2a100a"); px(g, 12, 16, 8, 1, "#ff7b2e");
        px(g, 9, 18, 14, 11, "#5a2a1a");
        px(g, 9, 18, 2, 11, "#7a3a24"); px(g, 20, 18, 2, 11, "#2a100a");
        // lava cracks (jagged orange with hot yellow cores)
        px(g, 11, 19, 1, 3, "#ff7b2e"); px(g, 12, 21, 2, 1, "#ff7b2e"); R(12, 21, "#ffd93d");
        px(g, 18, 20, 1, 4, "#ff7b2e"); R(18, 22, "#ffd93d"); px(g, 16, 24, 3, 1, "#ff7b2e"); R(17, 24, "#ffd93d");
        px(g, 13, 26, 1, 3, "#ff7b2e"); R(13, 27, "#ffd93d");
        px(g, 9, 29, 14, 1, "#ff7b2e");
        px(g, 3, 16, 7, 5, "#5a2a1a"); px(g, 3, 16, 7, 1, "#ff7b2e"); px(g, 3, 20, 2, 1, "#2a100a"); px(g, 8, 20, 2, 1, "#2a100a"); // jagged hem
        px(g, 22, 16, 7, 5, "#5a2a1a"); px(g, 22, 16, 7, 1, "#ff7b2e"); px(g, 22, 20, 2, 1, "#2a100a"); px(g, 27, 20, 2, 1, "#2a100a");
        R(5, 18, "#ff7b2e"); R(25, 19, "#ffd93d");
        px(g, 11, 31, 4, 5, "#3a1a10"); px(g, 17, 31, 4, 5, "#3a1a10");
        px(g, 12, 32, 1, 3, "#ff7b2e"); px(g, 18, 34, 1, 2, "#ff7b2e");
        px(g, 6, 22, 3, 5, "#3a1a10"); px(g, 23, 22, 3, 5, "#3a1a10");
        break;
      }
      case "rimeplate": {
        // ice plate: pale face, deep-blue valleys, white frost, sparkles
        px(g, 12, 16, 8, 2, "#4e7a8c"); px(g, 12, 16, 8, 1, "#f2fbff");
        px(g, 9, 18, 14, 11, "#8fc3d9");
        px(g, 9, 18, 2, 11, "#ffffff"); px(g, 20, 18, 2, 11, "#4e7a8c");
        px(g, 12, 18, 3, 11, "#bfe0ee"); px(g, 17, 18, 2, 11, "#6fa3b9"); // ice valleys
        px(g, 15, 18, 1, 11, "#ffffff"); // frozen ridge
        R(11, 20, "#fff"); R(18, 23, "#fff"); R(13, 26, "#fff"); R(20, 21, "#fff"); R(10, 24, "#fff"); R(16, 19, "#dff2fb");
        px(g, 11, 25, 10, 1, "#ffffff");
        px(g, 9, 29, 14, 1, "#f2fbff");
        px(g, 10, 30, 12, 1, "rgba(255,255,255,0.65)");
        px(g, 2, 15, 8, 6, "#8fc3d9"); px(g, 2, 15, 8, 1, "#ffffff"); px(g, 2, 17, 3, 4, "#bfe0ee"); px(g, 2, 20, 8, 1, "#f2fbff");
        px(g, 22, 15, 8, 6, "#8fc3d9"); px(g, 22, 15, 8, 1, "#ffffff"); px(g, 22, 17, 3, 4, "#bfe0ee"); px(g, 22, 20, 8, 1, "#f2fbff");
        R(4, 16, "#fff"); R(26, 18, "#fff"); R(24, 16, "#dff2fb");
        px(g, 11, 31, 4, 5, "#6fa3b9"); px(g, 17, 31, 4, 5, "#6fa3b9");
        px(g, 12, 31, 1, 5, "#f2fbff"); px(g, 19, 31, 1, 5, "#f2fbff");
        px(g, 6, 22, 3, 5, "#6fa3b9"); px(g, 23, 22, 3, 5, "#6fa3b9");
        break;
      }

      case "mage_robe": {
        // deep blue robe, silver rune, cyan hem, wide sleeves
        px(g, 5, 19, 5, 8, "#3a3a6a"); px(g, 22, 19, 5, 8, "#3a3a6a");
        px(g, 5, 25, 5, 2, "#7fd4ff"); px(g, 22, 25, 5, 2, "#7fd4ff"); // cuffs
        px(g, 11, 18, 10, 10, "#3a3a6a");
        px(g, 11, 18, 10, 1, "#565695"); px(g, 11, 18, 1, 10, "#565695");
        R(13, 20, "#cfe8ff"); R(17, 20, "#cfe8ff"); R(13, 24, "#cfe8ff"); R(17, 24, "#cfe8ff");
        px(g, 15, 21, 2, 3, "#7fd4ff"); R(15, 22, "#ffffff"); // rune heart
        px(g, 8, 28, 16, 11, "#33335e");
        px(g, 11, 29, 1, 9, "#26264a"); px(g, 15, 29, 1, 9, "#26264a"); px(g, 19, 29, 1, 9, "#26264a"); // folds
        px(g, 8, 37, 16, 2, "#7fd4ff"); // hem
        break;
      }
      case "archmage_robe": {
        // royal purple, gold stars, mantle, gold hem
        px(g, 6, 17, 6, 4, "#3a1a55"); px(g, 20, 17, 6, 4, "#3a1a55"); // mantle
        px(g, 8, 17, 2, 2, "#ffd93d"); px(g, 22, 17, 2, 2, "#ffd93d"); // clasps
        px(g, 5, 19, 5, 8, "#4a2a6a"); px(g, 22, 19, 5, 8, "#4a2a6a");
        px(g, 5, 25, 5, 2, "#ffd93d"); px(g, 22, 25, 5, 2, "#ffd93d");
        px(g, 11, 18, 10, 10, "#4a2a6a");
        px(g, 11, 18, 10, 1, "#6a4a8a");
        R(13, 20, "#ffd93d"); R(17, 20, "#ffd93d"); R(13, 24, "#ffd93d"); R(17, 24, "#ffd93d");
        px(g, 15, 21, 2, 3, "#c77dff"); R(15, 22, "#ffffff");
        px(g, 8, 28, 16, 11, "#3d2358");
        px(g, 11, 29, 1, 9, "#2c1842"); px(g, 15, 29, 1, 9, "#2c1842"); px(g, 19, 29, 1, 9, "#2c1842");
        R(10, 31, "#ffd93d"); R(16, 34, "#ffd93d"); R(21, 30, "#ffd93d"); R(13, 36, "#c77dff"); R(19, 33, "#c77dff"); // stars
        px(g, 8, 37, 16, 2, "#ffd93d"); // gold hem
        break;
      }
      case "holy_vestments": {
        // ivory + gold cross, radiant hem
        px(g, 5, 19, 5, 8, "#ece4d2"); px(g, 22, 19, 5, 8, "#ece4d2");
        px(g, 5, 25, 5, 2, "#c9a227"); px(g, 22, 25, 5, 2, "#c9a227");
        px(g, 11, 18, 10, 10, "#ece4d2");
        px(g, 11, 18, 1, 10, "#fffaf0"); px(g, 20, 18, 1, 10, "#d9cdb2");
        px(g, 15, 20, 2, 7, "#c9a227"); px(g, 13, 22, 6, 2, "#c9a227"); // gold cross
        R(16, 23, "#fff7ae");
        px(g, 8, 28, 16, 11, "#e2d6bd");
        px(g, 11, 29, 1, 9, "#c9bb9c"); px(g, 15, 29, 1, 9, "#c9bb9c"); px(g, 19, 29, 1, 9, "#c9bb9c");
        px(g, 8, 37, 16, 2, "#ffd93d");
        for (let x = 8; x < 24; x += 2) R(x, 39, "rgba(255,217,61,0.8)"); // radiant fringe
        break;
      }
      case "tideward_robe": {
        // deep teal, pearl clasp, bright wave rows, glowing hem
        px(g, 5, 19, 5, 8, "#2a6a7a"); px(g, 22, 19, 5, 8, "#2a6a7a");
        px(g, 5, 21, 5, 1, "#3a8a9a"); px(g, 22, 21, 5, 1, "#3a8a9a");
        px(g, 5, 25, 5, 2, "#bfe9ff"); px(g, 22, 25, 5, 2, "#bfe9ff");
        px(g, 11, 18, 10, 10, "#2a6a7a");
        px(g, 11, 18, 10, 1, "#4a9aaa"); px(g, 11, 18, 1, 10, "#4a9aaa");
        R(14, 21, "#ffffff"); R(17, 22, "#ffffff"); R(15, 25, "#e8faff"); // pearls
        px(g, 13, 24, 6, 1, "#ffd93d"); // shell clasp
        px(g, 8, 28, 16, 11, "#235e6d");
        for (let x = 9; x < 23; x += 4) { px(g, x, 30, 2, 1, "#bfe9ff"); px(g, x + 1, 33, 2, 1, "#ffffff"); px(g, x, 36, 2, 1, "#8fd0e8"); } // waves
        px(g, 8, 38, 16, 1, "#e8faff"); px(g, 8, 37, 16, 1, "#bfe9ff"); // glowing hem
        break;
      }
      case "patched_kasaya": {
        // mendicant's gi: weathered off-white jacket, crossed V lapels,
        // rope obi with knot, patched sleeves, loose pants
        px(g, 4, 18, 6, 6, "#cfc4ae"); px(g, 22, 18, 6, 6, "#cfc4ae"); // sleeves
        px(g, 4, 23, 6, 2, "#a89a80"); px(g, 22, 23, 6, 2, "#a89a80"); // cuffs
        px(g, 12, 20, 3, 2, "#8a5a3a"); // chest patch
        px(g, 9, 18, 14, 10, "#cfc4ae"); // jacket body
        px(g, 9, 18, 2, 10, "#e0d6c0"); px(g, 21, 18, 2, 10, "#a89a80"); // shading
        px(g, 14, 18, 4, 2, "#4a3a28"); // undershirt V
        px(g, 12, 18, 1, 5, "#a89a80"); px(g, 13, 22, 1, 3, "#a89a80"); // left lapel
        px(g, 19, 18, 1, 5, "#8a7c60"); px(g, 18, 22, 1, 3, "#8a7c60"); // right lapel
        R(11, 21, "#8a5a3a"); // sleeve patch stitch
        px(g, 9, 27, 14, 2, "#6a4028"); px(g, 14, 27, 4, 2, "#8a5a3a"); // rope obi + knot
        px(g, 15, 29, 2, 2, "#8a5a3a"); // knot tail
        px(g, 10, 29, 5, 7, "#b8ac92"); px(g, 17, 29, 5, 7, "#b8ac92"); // gi pants
        px(g, 10, 34, 5, 2, "#8a7c60"); px(g, 17, 34, 2, 2, "#8a7c60"); px(g, 20, 34, 2, 2, "#8a7c60"); // cuffs
        break;
      }
      case "ironthread_kasaya": {
        // iron-thread gi: saffron jacket, iron sleeve bands + rivets, dark obi
        px(g, 4, 18, 6, 6, "#d99a35"); px(g, 22, 18, 6, 6, "#d99a35");
        px(g, 4, 20, 6, 2, "#8a9aaa"); px(g, 22, 20, 6, 2, "#8a9aaa"); // iron bands
        R(5, 20); R(8, 20); R(23, 20); R(26, 20); // rivets
        px(g, 9, 18, 14, 10, "#d99a35");
        px(g, 9, 18, 2, 10, "#f2c060"); px(g, 21, 18, 2, 10, "#9a6420");
        px(g, 14, 18, 4, 2, "#5a3a1a"); // undershirt V
        px(g, 12, 18, 1, 5, "#f2c060"); px(g, 13, 22, 1, 3, "#f2c060");
        px(g, 19, 18, 1, 5, "#9a6420"); px(g, 18, 22, 1, 3, "#9a6420");
        px(g, 9, 27, 14, 2, "#3a2a1a"); px(g, 14, 27, 4, 2, "#8a9aaa"); // dark obi, iron knot
        px(g, 15, 29, 2, 2, "#8a9aaa");
        px(g, 10, 29, 5, 7, "#b87f2e"); px(g, 17, 29, 5, 7, "#b87f2e");
        px(g, 10, 34, 5, 2, "#7d5a20"); px(g, 17, 34, 5, 2, "#7d5a20");
        break;
      }
      case "sunsilk_kasaya": {
        // sun-silk gi: bright gold jacket, white lapel trim, sun disc,
        // gold obi, white pants
        px(g, 4, 18, 6, 6, "#f2b63a"); px(g, 22, 18, 6, 6, "#f2b63a");
        px(g, 4, 23, 6, 2, "#fff7ae"); px(g, 22, 23, 6, 2, "#fff7ae");
        px(g, 9, 18, 14, 10, "#f2b63a");
        px(g, 9, 18, 2, 10, "#ffd970"); px(g, 21, 18, 2, 10, "#c98420");
        px(g, 14, 18, 4, 2, "#fff7ae"); // undershirt V
        px(g, 12, 18, 1, 5, "#fff7ae"); px(g, 13, 22, 1, 3, "#fff7ae");
        px(g, 19, 18, 1, 5, "#fff7ae"); px(g, 18, 22, 1, 3, "#fff7ae");
        px(g, 15, 23, 2, 2, "#fff7ae"); R(15, 23, "#ff9d2e"); // sun disc
        px(g, 9, 27, 14, 2, "#8a5a10"); px(g, 14, 27, 4, 2, "#ffd93d"); // gold obi
        px(g, 15, 29, 2, 2, "#ffd93d");
        px(g, 10, 29, 5, 7, "#f7ead0"); px(g, 17, 29, 5, 7, "#f7ead0"); // white pants
        px(g, 10, 34, 5, 2, "#d9c9a0"); px(g, 17, 34, 5, 2, "#d9c9a0");
        break;
      }
      case "dragonhide_kasaya": {
        // ember dragonhide gi: dark-red jacket, scaled shoulders, gold obi
        px(g, 4, 18, 6, 6, "#b45a1a"); px(g, 22, 18, 6, 6, "#b45a1a");
        px(g, 4, 18, 6, 1, "#ffb02e"); px(g, 22, 18, 6, 1, "#ffb02e"); // ember cuffs top
        px(g, 5, 19, 4, 1, "#d97a2a"); px(g, 6, 20, 2, 1, "#8a3a10"); // scale rows
        px(g, 23, 19, 4, 1, "#d97a2a"); px(g, 24, 20, 2, 1, "#8a3a10");
        px(g, 9, 18, 14, 10, "#b45a1a");
        px(g, 9, 18, 2, 10, "#d97a2a"); px(g, 21, 18, 2, 10, "#7a3010");
        px(g, 14, 18, 4, 2, "#3a1408"); // undershirt V
        px(g, 12, 18, 1, 5, "#ffb02e"); px(g, 13, 22, 1, 3, "#ffb02e");
        px(g, 19, 18, 1, 5, "#ffb02e"); px(g, 18, 22, 1, 3, "#ffb02e");
        px(g, 9, 27, 14, 2, "#5a2a10"); px(g, 14, 27, 4, 2, "#ffd93d"); // gold obi
        px(g, 15, 29, 2, 2, "#ffd93d"); px(g, 17, 29, 1, 2, "#ffd93d");
        px(g, 10, 29, 5, 7, "#8a3a10"); px(g, 17, 29, 5, 7, "#8a3a10");
        px(g, 10, 34, 5, 2, "#5a2010"); px(g, 17, 34, 5, 2, "#5a2010");
        break;
      }
      case "novice_habit": {
        // novice dark tunic: charcoal wool, rope cord, lone candle dot
        px(g, 11, 18, 10, 12, "#3a3a44");
        px(g, 11, 18, 1, 12, "#4e4e5c"); px(g, 20, 18, 1, 12, "#26262e");
        px(g, 11, 18, 10, 1, "#4e4e5c");
        R(16, 22, "#ffd93d"); px(g, 15, 23, 2, 3, "#c9a45a"); // candle pin
        px(g, 9, 27, 14, 2, "#26262e"); px(g, 14, 27, 3, 2, "#8a7a5a"); // cord belt
        px(g, 8, 29, 16, 9, "#33333e");
        break;
      }
      case "canon_habit": {
        // canon navy + white stole, silver clasp
        px(g, 11, 18, 10, 12, "#2a3a5a");
        px(g, 11, 18, 1, 12, "#3e5480"); px(g, 20, 18, 1, 12, "#1a2438");
        px(g, 13, 18, 2, 12, "#e8ecf2"); px(g, 17, 18, 2, 12, "#e8ecf2"); // stole
        px(g, 13, 18, 2, 1, "#ffffff"); px(g, 17, 18, 2, 1, "#ffffff");
        R(16, 22, "#cfe8ff"); px(g, 14, 23, 4, 1, "#c9d4e8"); // clasp bar
        px(g, 9, 27, 14, 2, "#1a2438"); px(g, 14, 27, 3, 2, "#c9d4e8");
        px(g, 8, 29, 16, 9, "#24344e");
        px(g, 8, 37, 16, 1, "#c9d4e8"); // hem line
        break;
      }
      case "vesper_habit": {
        // vesper purple, gold trim, candle-glow hem
        px(g, 11, 18, 10, 12, "#3a1a55");
        px(g, 11, 18, 1, 12, "#5a2a7a"); px(g, 20, 18, 1, 12, "#241038");
        R(13, 20, "#ffd93d"); R(17, 20, "#ffd93d"); R(15, 24, "#ffd93d"); // stars
        px(g, 15, 21, 2, 4, "#c9a227"); R(15, 22, "#fff7ae"); // taper
        px(g, 9, 27, 14, 2, "#c9a227");
        px(g, 8, 29, 16, 9, "#2f1546");
        px(g, 11, 30, 1, 7, "#1e0c30"); px(g, 15, 30, 1, 7, "#1e0c30"); px(g, 19, 30, 1, 7, "#1e0c30");
        px(g, 8, 37, 16, 1, "rgba(255,217,61,0.8)"); // candle glow
        break;
      }
      case "seraph_habit": {
        // seraph black-gold: dark tunic, radiant cross, glowing hem
        px(g, 5, 19, 5, 8, "#23232e"); px(g, 22, 19, 5, 8, "#23232e");
        px(g, 5, 25, 5, 2, "#ffd93d"); px(g, 22, 25, 5, 2, "#ffd93d");
        px(g, 11, 18, 10, 12, "#23232e");
        px(g, 11, 18, 1, 12, "#3a3a4e"); px(g, 20, 18, 1, 12, "#101016");
        px(g, 15, 20, 2, 7, "#ffd93d"); px(g, 13, 22, 6, 2, "#ffd93d"); // radiant cross
        R(16, 23, "#fff7ae");
        px(g, 8, 29, 16, 9, "#1b1b24");
        px(g, 11, 30, 1, 7, "#101016"); px(g, 15, 30, 1, 7, "#101016"); px(g, 19, 30, 1, 7, "#101016");
        px(g, 8, 37, 16, 2, "#ffd93d");
        for (let x = 8; x < 24; x += 2) R(x, 39, "rgba(255,247,174,0.9)");
        break;
      }
      case "wyrmshroud_robe": {
        // dragon-scale choir weave: green-gold scales, gold spine, ember hem
        for (let rI = 0; rI < 5; rI++) {
          const y = 19 + rI * 2, c = rI % 2 ? "#4a6a42" : "#3a5a3a";
          px(g, 11, y, 10, 2, c);
          px(g, 11, y, 10, 1, rI % 2 ? "#6a8a5e" : "#4a6a46");
        }
        px(g, 5, 19, 5, 8, "#3a5a3a"); px(g, 22, 19, 5, 8, "#3a5a3a");
        px(g, 5, 25, 5, 2, "#ffb02e"); px(g, 22, 25, 5, 2, "#ffb02e");
        px(g, 15, 19, 2, 10, "#8a7a3a"); R(15, 20, "#ffd93d"); R(16, 24, "#ffd93d"); // gold spine
        px(g, 8, 29, 16, 10, "#33502f");
        px(g, 11, 30, 1, 8, "#243a22"); px(g, 15, 30, 1, 8, "#243a22"); px(g, 19, 30, 1, 8, "#243a22");
        px(g, 8, 37, 16, 2, "#ffb02e"); // ember hem
        break;
      }
      case "oblivion_kasaya": {
        // void gi: violet-black jacket, star sparks, black obi, dark pants
        px(g, 4, 18, 6, 6, "#2a1a4a"); px(g, 22, 18, 6, 6, "#2a1a4a"); // sleeves
        px(g, 4, 23, 6, 2, "#160c28"); px(g, 22, 23, 6, 2, "#160c28"); // cuffs
        R(5, 20, "#c9a9ff"); R(7, 22, "#ffffff"); R(24, 19, "#c9a9ff"); R(26, 21, "#ffffff");
        px(g, 9, 18, 14, 10, "#2a1a4a"); // jacket body
        px(g, 9, 18, 2, 10, "#3a2a5e"); px(g, 21, 18, 2, 10, "#160c28");
        px(g, 14, 18, 4, 2, "#0c0616"); // undershirt V
        px(g, 12, 18, 1, 5, "#7a3aaa"); px(g, 13, 22, 1, 3, "#7a3aaa");
        px(g, 19, 18, 1, 5, "#7a3aaa"); px(g, 18, 22, 1, 3, "#7a3aaa");
        R(13, 20, "#ffffff"); R(18, 24, "#c9a9ff"); R(16, 21, "#c9a9ff"); // star sparks
        px(g, 9, 27, 14, 2, "#0c0616"); px(g, 14, 27, 4, 2, "#2a1a4a"); // black obi
        px(g, 14, 27, 4, 1, "#7a3aaa"); // violet obi rim
        px(g, 15, 29, 2, 2, "#2a1a4a");
        px(g, 10, 29, 5, 7, "#1c1030"); px(g, 17, 29, 5, 7, "#1c1030"); // dark pants
        px(g, 10, 34, 5, 2, "#0c0616"); px(g, 17, 34, 5, 2, "#0c0616");
        break;
      }
      case "void_habit": {
        // abyssal tunic: black-violet, hollow cross, dripping dark hem
        px(g, 5, 19, 5, 8, "#101018"); px(g, 22, 19, 5, 8, "#101018");
        px(g, 5, 25, 5, 2, "#7a3aaa"); px(g, 22, 25, 5, 2, "#7a3aaa");
        px(g, 11, 18, 10, 12, "#101018");
        px(g, 11, 18, 1, 12, "#2a2440"); px(g, 20, 18, 1, 12, "#050508");
        px(g, 15, 20, 2, 7, "#050508"); px(g, 13, 22, 6, 2, "#050508"); // hollow cross
        px(g, 15, 20, 2, 7, "#7a3aaa"); R(16, 23, "#c9a9ff"); // violet rim + spark
        px(g, 8, 29, 16, 9, "#0c0c14");
        px(g, 10, 30, 2, 8, "#050508"); px(g, 14, 30, 2, 8, "#050508"); px(g, 18, 30, 2, 8, "#050508");
        px(g, 8, 37, 16, 1, "rgba(122,58,170,0.8)");
        break;
      }
      case "dawnsilk_kasaya": {
        // sunrise gi: radiant gold jacket, white lapels, gold obi, dawn pants
        px(g, 4, 18, 6, 6, "#f2d06a"); px(g, 22, 18, 6, 6, "#f2d06a"); // sleeves
        px(g, 4, 23, 6, 2, "#fff7ae"); px(g, 22, 23, 6, 2, "#fff7ae"); // cuffs
        px(g, 9, 18, 14, 10, "#f2d06a"); // jacket body
        px(g, 9, 18, 2, 10, "#ffe9a0"); px(g, 21, 18, 2, 10, "#c9982e");
        px(g, 14, 18, 4, 2, "#fff7ae"); // undershirt V
        px(g, 12, 18, 1, 5, "#ffffff"); px(g, 13, 22, 1, 3, "#ffffff");
        px(g, 19, 18, 1, 5, "#ffffff"); px(g, 18, 22, 1, 3, "#ffffff");
        px(g, 15, 23, 2, 2, "#ff9d2e"); R(15, 23, "#fff7ae"); // rising-sun disc
        px(g, 9, 27, 14, 2, "#c9982e"); px(g, 14, 27, 4, 2, "#ffd93d"); // gold obi
        px(g, 15, 29, 2, 2, "#ffd93d"); px(g, 17, 29, 1, 2, "#ffd93d");
        px(g, 10, 29, 5, 7, "#e8d9a8"); px(g, 17, 29, 5, 7, "#e8d9a8"); // dawn pants
        px(g, 10, 34, 5, 2, "#fff7ae"); px(g, 17, 34, 5, 2, "#fff7ae"); // radiant cuffs
        break;
      }
      case "dawnchoir_habit": {
        // morning-choir ivory: pale gold tunic, sun cross, dawn fringe
        px(g, 5, 19, 5, 8, "#e8dcc2"); px(g, 22, 19, 5, 8, "#e8dcc2");
        px(g, 5, 25, 5, 2, "#c9a227"); px(g, 22, 25, 5, 2, "#c9a227");
        px(g, 11, 18, 10, 12, "#e8dcc2");
        px(g, 11, 18, 1, 12, "#fffaf0"); px(g, 20, 18, 1, 12, "#c9bb9c");
        px(g, 15, 20, 2, 7, "#ff9d2e"); px(g, 13, 22, 6, 2, "#ff9d2e"); // sun cross
        R(16, 23, "#fff7ae");
        px(g, 8, 29, 16, 9, "#ddcfae");
        px(g, 11, 30, 1, 7, "#c9bb9c"); px(g, 15, 30, 1, 7, "#c9bb9c"); px(g, 19, 30, 1, 7, "#c9bb9c");
        px(g, 8, 37, 16, 2, "#ffd93d");
        for (let x = 8; x < 24; x += 2) R(x, 39, "rgba(255,157,46,0.9)");
        break;
      }

      default: {
        // Unknown/future armor ids still render SOMETHING: derive the cut
        // from the item def so a missing entry can never read as "no armor".
        let phys = 0, mag = 0;
        try {
          const it = window.Items && window.Items.ITEMS && window.Items.ITEMS[a];
          if (it && it.slot === "armor") { phys = +it.resPhys || 0; mag = +it.resMagic || 0; }
        } catch (e) { }
        if (phys >= 0.28) {
          px(g, 11, 19, 10, 12, "#8a9aaa"); px(g, 11, 19, 10, 2, "#d0d6de");
          px(g, 4, 17, 6, 4, "#8a9aaa"); px(g, 22, 17, 6, 4, "#8a9aaa");
        } else if (mag >= 0.2) {
          px(g, 9, 28, 14, 8, "#4a4a6a"); px(g, 9, 28, 14, 2, "#7fd4ff"); px(g, 15, 18, 2, 13, "#7fd4ff");
        } else {
          px(g, 9, 24, 14, 2, "#6b4226"); px(g, 14, 24, 4, 2, "#d9c27f");
        }
        break;
      }
    }
  }


  // Player hair — and beastfolk manes/crests. Same six styles, race-flavored
  // rendering so the creator's hair picker works for every race. Headgear
  // cases draw over this.
  function drawHairStyle(g, style, hairC, race) {
    if (race === "werewolf") {
      // heavy mane framing the face, spiked at the cheeks
      if (style === "bald") { px(g, 11, 5, 3, 1, "rgba(255,255,255,0.35)"); return; }
      if (style === "mohawk") { px(g, 13, 0, 6, 7, hairC); px(g, 12, 0, 8, 1, hairC); return; }
      px(g, 10, 4, 12, 3, hairC);
      if (style === "long") { px(g, 7, 4, 3, 12, hairC); px(g, 22, 4, 3, 12, hairC); }
      else if (style === "ponytail") { px(g, 22, 2, 3, 9, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); }
      else if (style === "buns") { px(g, 7, 1, 4, 4, hairC); px(g, 21, 1, 4, 4, hairC); }
      else { px(g, 10, 4, 12, 3, hairC); px(g, 8, 6, 2, 8, hairC); px(g, 22, 6, 2, 8, hairC); } // short: full frame
      return;
    }
    if (race === "grenouille") {
      // smooth crest: ridges, fins and knobs
      if (style === "bald") { px(g, 11, 5, 4, 1, "rgba(255,255,255,0.4)"); return; }
      if (style === "mohawk") { px(g, 14, 0, 4, 2, hairC); px(g, 14, 2, 4, 2, hairC); px(g, 15, 4, 2, 2, hairC); return; }
      if (style === "long") { px(g, 8, 5, 2, 9, hairC); px(g, 22, 5, 2, 9, hairC); return; }
      if (style === "ponytail") { px(g, 15, 0, 3, 6, hairC); px(g, 14, 4, 5, 2, "#c23b4e"); return; }
      if (style === "buns") { px(g, 9, 1, 4, 3, hairC); px(g, 19, 1, 4, 3, hairC); return; }
      px(g, 10, 4, 12, 2, hairC); // short: sleek cap
      return;
    }
    if (race === "kinnatma") {
      // feather crest, flame-tipped at high style
      if (style === "bald") { px(g, 11, 5, 3, 1, "rgba(255,255,255,0.4)"); return; }
      if (style === "mohawk") { px(g, 14, 0, 4, 7, hairC); px(g, 15, 0, 2, 2, "#ff6b3b"); return; }
      if (style === "long") { px(g, 7, 3, 3, 11, hairC); px(g, 22, 3, 3, 11, hairC); return; }
      if (style === "ponytail") { px(g, 22, 1, 3, 11, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); return; }
      if (style === "buns") { px(g, 7, 1, 5, 4, hairC); px(g, 20, 1, 5, 4, hairC); return; }
      px(g, 10, 3, 12, 3, hairC); px(g, 20, 1, 4, 2, hairC); // short: swept crest
      return;
    }
    if (race === "quansalbar") {
      // whip antennae, flame-tipped at high style
      if (style === "bald") { px(g, 11, 5, 3, 1, "rgba(255,255,255,0.35)"); return; }
      if (style === "mohawk") { px(g, 15, 0, 2, 6, hairC); px(g, 14, 0, 4, 1, hairC); px(g, 15, 0, 2, 2, "#e8a93d"); return; }
      if (style === "long") { px(g, 6, 2, 4, 2, hairC); px(g, 22, 2, 4, 2, hairC); px(g, 4, 4, 2, 5, hairC); px(g, 26, 4, 2, 5, hairC); return; }
      if (style === "ponytail") { px(g, 22, 1, 2, 8, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); return; }
      if (style === "buns") { px(g, 9, 1, 4, 3, hairC); px(g, 19, 1, 4, 3, hairC); px(g, 10, 0, 2, 1, hairC); px(g, 20, 0, 2, 1, hairC); return; }
      px(g, 11, 1, 2, 4, hairC); px(g, 19, 1, 2, 4, hairC); px(g, 11, 1, 2, 1, "#e8f4fa"); px(g, 19, 1, 2, 1, "#e8f4fa"); // short: twin nubs
      return;
    }
    if (race === "usaghito") {
      // forelock tuft between the ears; ears themselves are body
      if (style === "bald") { px(g, 11, 5, 3, 1, "rgba(255,255,255,0.35)"); return; }
      if (style === "mohawk") { px(g, 14, 0, 4, 7, hairC); return; }
      if (style === "long") { px(g, 7, 4, 3, 12, hairC); px(g, 22, 4, 3, 12, hairC); return; }
      if (style === "ponytail") { px(g, 22, 2, 3, 9, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); return; }
      if (style === "buns") { px(g, 7, 1, 4, 4, hairC); px(g, 21, 1, 4, 4, hairC); return; }
      px(g, 10, 4, 12, 3, hairC); // short: neat forelock
      return;
    }
    if (style === "bald") { px(g, 11, 5, 3, 1, "rgba(255,255,255,0.35)"); return; }
    if (style === "mohawk") { px(g, 14, 0, 4, 7, hairC); return; }
    px(g, 10, 4, 12, 4, hairC);
    if (style === "long") { px(g, 8, 4, 3, 12, hairC); px(g, 21, 4, 3, 12, hairC); }
    else if (style === "ponytail") { px(g, 22, 6, 3, 9, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); }
    else if (style === "buns") { px(g, 7, 1, 4, 4, hairC); px(g, 21, 1, 4, 4, hairC); }
  }
  // Visible hair OVER headgear (heroes only — see drawActor): every borrowed
  // profession shows the chosen hairstyle. Called after the outfit's
  // headgear so strands/ridges/tufts peek out from under helms, hoods and
  // hats; on bare-headed outfits it redraws the same pixels (no visual
  // change) except buns gain a natural hairline. Bald stays bare so it
  // still reads against short.
  function drawHairOver(g, style, hairC, race) {
    if (style === "bald") return;
    const fringe = () => px(g, 11, 7, 10, 1, hairC);
    if (style === "mohawk") {
      if (race === "grenouille") { px(g, 14, 0, 4, 2, hairC); px(g, 14, 2, 4, 2, hairC); px(g, 15, 4, 2, 2, hairC); }
      else if (race === "kinnatma") { px(g, 14, 0, 4, 7, hairC); px(g, 15, 0, 2, 2, "#ff6b3b"); }
      else if (race === "werewolf") { px(g, 13, 0, 6, 7, hairC); px(g, 12, 0, 8, 1, hairC); }
      else if (race === "quansalbar") { px(g, 15, 0, 2, 6, hairC); px(g, 14, 0, 4, 1, hairC); px(g, 15, 0, 2, 2, "#e8a93d"); }
      else if (race === "usaghito") { px(g, 14, 0, 4, 7, hairC); }
      else { px(g, 14, 0, 4, 7, hairC); }
      return;
    }
    if (style !== "bald" && style !== "mohawk" && style !== "buns" && style !== "long" && style !== "ponytail") {
      // short: race nubs/tufts peek past headgear
      if (race === "quansalbar") { px(g, 11, 1, 2, 4, hairC); px(g, 19, 1, 2, 4, hairC); return; }
      if (race === "usaghito") { px(g, 10, 4, 12, 3, hairC); return; }
    }
    if (race === "quansalbar" && style === "long") { px(g, 6, 2, 4, 2, hairC); px(g, 22, 2, 4, 2, hairC); px(g, 4, 4, 2, 5, hairC); px(g, 26, 4, 2, 5, hairC); return; }
    if (race === "quansalbar" && style === "ponytail") { px(g, 22, 1, 2, 8, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); return; }
    if (style === "buns") {
      fringe();
      if (race === "grenouille") { px(g, 9, 1, 4, 3, hairC); px(g, 19, 1, 4, 3, hairC); }
      else if (race === "kinnatma") { px(g, 7, 1, 5, 4, hairC); px(g, 20, 1, 5, 4, hairC); }
      else if (race === "quansalbar") { px(g, 9, 1, 4, 3, hairC); px(g, 19, 1, 4, 3, hairC); }
      else if (race === "usaghito") { px(g, 7, 1, 4, 4, hairC); px(g, 21, 1, 4, 4, hairC); }
      else { px(g, 7, 1, 4, 4, hairC); px(g, 21, 1, 4, 4, hairC); }
      return;
    }
    if (race === "usaghito" && style === "long") { fringe(); px(g, 7, 4, 3, 12, hairC); px(g, 22, 4, 3, 12, hairC); return; }
    if (race === "usaghito" && style === "ponytail") { fringe(); px(g, 22, 2, 3, 9, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); return; }
    if (style === "long") {
      fringe();
      if (race === "werewolf") { px(g, 7, 4, 3, 12, hairC); px(g, 22, 4, 3, 12, hairC); }
      else if (race === "grenouille") { px(g, 8, 5, 2, 9, hairC); px(g, 22, 5, 2, 9, hairC); }
      else if (race === "kinnatma") { px(g, 7, 3, 3, 11, hairC); px(g, 22, 3, 3, 11, hairC); }
      else { px(g, 8, 8, 3, 8, hairC); px(g, 21, 8, 3, 8, hairC); }
      return;
    }
    if (style === "ponytail") {
      fringe();
      if (race === "werewolf") { px(g, 22, 2, 3, 9, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); }
      else if (race === "grenouille") { px(g, 15, 0, 3, 6, hairC); px(g, 14, 4, 5, 2, "#c23b4e"); }
      else if (race === "kinnatma") { px(g, 22, 1, 3, 11, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); }
      else { px(g, 22, 6, 3, 9, hairC); px(g, 21, 5, 2, 2, "#c23b4e"); }
      return;
    }
    // short: hairline + race side volume so it reads against bald everywhere
    fringe();
    if (race === "werewolf") { px(g, 8, 6, 2, 8, hairC); px(g, 22, 6, 2, 8, hairC); }
    else if (race === "kinnatma") { px(g, 20, 1, 4, 2, hairC); }
  }
  // Small extras drawn last so they stay visible over hoods/helms.
  function drawAccessory(g, acc, hairC) {
    if (!acc || acc === "none") return;
    if (acc === "glasses") {
      g.fillStyle = "#222"; g.fillRect(11, 10, 4, 4); g.fillRect(17, 10, 4, 4);
      g.fillStyle = "#fff"; g.fillRect(12, 11, 1, 1); g.fillRect(18, 11, 1, 1);
    } else if (acc === "beard") { px(g, 12, 15, 8, 4, hairC || "#3a2a1a"); }
    else if (acc === "scar") { px(g, 18, 9, 1, 5, "#c93b3b"); }
    else if (acc === "earring") { px(g, 22, 14, 2, 2, "#ffd93d"); }
    else if (acc === "circlet") { px(g, 10, 4, 12, 2, "#ffd93d"); }
  }

  // characters: drawn at 32x40 (body + head). Non-human mobs get their own
  // silhouettes here so nothing reads as "human in a tinted shirt".
  // ---------- hell demons (v17 data-driven looks) ----------
  // look: [skin, dark, build, horns, wings, tail, crack, eyes]
  // build H humanoid B bulky Q quadruped W winged S serpent M swarm G ghost O blob C construct U undead
  function drawDemonHell(g, c, kind, look, tint, seedStr, ph) {
    const skin = look[0], dark = look[1], build = look[2] || "H";
    const horns = look[3] | 0, wings = look[4] | 0, tail = look[5] | 0;
    const crack = look[6] || null, eyeC = look[7] || "#ffe14d";
    const lite = shade(skin, 35);
    // wing-beat pose: flap while moving, slam on attack, droop on hurt,
    // faint sway at rest — threaded into batWings so every demon wing beats.
    let WA = 0;
    try {
      if (window.Anim && window.Anim.flap) {
        const P = window.Anim.normP ? window.Anim.normP(ph) : ph;
        WA = window.Anim.flap(P) || 0;
      }
    } catch (e) { WA = 0; }
    let isBoss = false;
    try { isBoss = !!((window.CFG.MOB_TEMPLATES || {})[kind] || {}).boss; } catch (e) {}
    g.clearRect(0, 0, 32, 40);
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16, 37, 9, 3, 0, 0, 7); g.fill();
    const eyes = (x, y, w) => { g.fillStyle = eyeC; g.fillRect(x, y, w || 2, 2); };
    const hornsAt = (y, spread) => {
      // spread: half-width of head (6 = wide brute, 5 = slim)
      g.fillStyle = "#e8e0d0";
      if (horns === 1) { px(g, 16 - spread, y - 3, 3, 4, "#e8e0d0"); px(g, 16 + spread - 3, y - 3, 3, 4, "#e8e0d0"); }
      else if (horns === 2) {
        g.beginPath(); g.moveTo(16 - spread, y); g.lineTo(16 - spread - 6, y - 8); g.lineTo(16 - spread - 2, y - 1); g.fill();
        g.beginPath(); g.moveTo(16 + spread, y); g.lineTo(16 + spread + 6, y - 8); g.lineTo(16 + spread + 2, y - 1); g.fill();
      }
      else if (horns === 3) {
        g.beginPath(); g.moveTo(16 - spread + 1, y); g.lineTo(16 - spread - 2, y - 12); g.lineTo(16 - spread + 4, y - 1); g.fill();
        g.beginPath(); g.moveTo(16 + spread - 1, y); g.lineTo(16 + spread + 2, y - 12); g.lineTo(16 + spread - 4, y - 1); g.fill();
      }
      else if (horns >= 4) {
        for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(16 + i * 5 - 2, y); g.lineTo(16 + i * 5, y - 9); g.lineTo(16 + i * 5 + 2, y); g.fill(); }
      }
    };
    const batWings = (y, big) => {
      const w = big ? 15 : 11, h = big ? 16 : 12;
      g.save(); g.translate(15, y); g.rotate(WA); g.translate(-15, -y);
      g.fillStyle = dark;
      g.beginPath(); g.moveTo(15, y); g.lineTo(15 - w, y - h); g.lineTo(15 - w + 4, y - h + 6); g.lineTo(15 - w + 7, y - h + 5); g.lineTo(15 - w + 8, y - 2); g.lineTo(15, y + 3); g.fill();
      g.fillStyle = skin;
      g.fillRect(15 - w + 2, y - h + 2, 3, 2);
      g.restore();
      g.save(); g.translate(17, y); g.rotate(-WA); g.translate(-17, -y);
      g.fillStyle = dark;
      g.beginPath(); g.moveTo(17, y); g.lineTo(17 + w, y - h); g.lineTo(17 + w - 4, y - h + 6); g.lineTo(17 + w - 7, y - h + 5); g.lineTo(17 + w - 8, y - 2); g.lineTo(17, y + 3); g.fill();
      g.fillStyle = skin;
      g.fillRect(17 + w - 5, y - h + 2, 3, 2);
      g.restore();
    };
    const tailAt = (x, y, long) => {
      g.fillStyle = dark;
      if (tail === 1) { px(g, x, y, 2, long ? 10 : 7, dark); px(g, x - 2, y + (long ? 10 : 7), 6, 3, dark); px(g, x - 1, y + (long ? 12 : 9), 4, 3, "#c01a3a"); }
      else { px(g, x, y, 3, long ? 9 : 6, dark); g.fillStyle = skin; g.fillRect(x, y + 2, 1, 3); g.fillRect(x, y + (long ? 11 : 8), 3, 2); }
    };
    const crackOn = (x, y, w, h) => {
      if (!crack) return;
      g.fillStyle = crack;
      g.fillRect(x + ((w / 2) | 0), y, 1, h);
      g.fillRect(x + ((w / 3) | 0), y + ((h / 3) | 0), 2, 1);
      g.fillRect(x + ((w * 2 / 3) | 0), y + ((h * 2 / 3) | 0), 2, 1);
    };
    const bossTrim = () => { if (isBoss) { px(g, 9, 33, 14, 2, "#ffd93d"); px(g, 4, 2, 3, 6, "#ffd93d"); px(g, 25, 2, 3, 6, "#ffd93d"); } };
    if (build === "Q") {
      // quadruped fiend
      px(g, 3, 22, 4, 3, dark); px(g, 1, 20, 3, 3, dark);
      px(g, 6, 23, 19, 8, skin); px(g, 6, 23, 19, 2, lite);
      px(g, 6, 23, 3, 8, dark);
      px(g, 7, 30, 3, 6, dark); px(g, 13, 30, 3, 6, dark); px(g, 18, 30, 3, 6, dark); px(g, 22, 28, 3, 6, dark);
      crackOn(8, 25, 12, 5);
      px(g, 21, 15, 9, 10, skin); px(g, 22, 16, 7, 3, lite);
      px(g, 27, 21, 5, 4, shade(skin, -15)); px(g, 30, 22, 2, 2, "#111");
      hornsAt(15, 4);
      eyes(23, 19); eyes(27, 19);
      if (tail) tailAt(3, 24, true);
      if (wings) batWings(22, wings > 1);
    } else if (build === "W") {
      batWings(20, true);
      px(g, 12, 26, 3, 8, dark); px(g, 17, 26, 3, 8, dark);
      px(g, 11, 18, 10, 10, skin); px(g, 11, 18, 10, 2, lite);
      crackOn(11, 20, 10, 6);
      px(g, 11, 8, 10, 11, skin); px(g, 12, 9, 8, 3, lite);
      hornsAt(8, 4);
      eyes(13, 12); eyes(18, 12);
      px(g, 14, 16, 4, 1, "#101418");
      if (tail) tailAt(15, 28, true);
    } else if (build === "S") {
      for (let i = 0; i < 4; i++) { px(g, 10 + (i % 2), 28 - i * 5, 12, 6, i % 2 ? dark : skin); }
      px(g, 11, 29, 10, 1, lite);
      crackOn(10, 14, 12, 12);
      px(g, 9, 4, 14, 11, skin); px(g, 10, 5, 12, 3, lite);
      hornsAt(5, 5);
      eyes(11, 9); eyes(19, 9);
      g.fillStyle = "#101418"; g.fillRect(14, 12, 4, 2);
      if (tail) { px(g, 14, 33, 4, 3, dark); }
    } else if (build === "M") {
      // three fluttering shards
      const offs = [[7, 20], [17, 16], [11, 27]];
      for (const [ox, oy] of offs) {
        px(g, ox, oy, 7, 6, skin); px(g, ox + 1, oy + 1, 5, 2, lite);
        eyes(ox + 1, oy + 2, 1); eyes(ox + 4, oy + 2, 1);
        g.fillStyle = dark;
        g.beginPath(); g.moveTo(ox + 1, oy + 3); g.lineTo(ox - 3, oy - 3); g.lineTo(ox + 1, oy - 1); g.fill();
        g.beginPath(); g.moveTo(ox + 6, oy + 3); g.lineTo(ox + 10, oy - 3); g.lineTo(ox + 6, oy - 1); g.fill();
      }
    } else if (build === "G") {
      // wailing veil: translucent robe, floating skull, no legs
      g.globalAlpha = 0.85;
      g.fillStyle = skin;
      g.beginPath(); g.moveTo(16, 4); g.lineTo(26, 34); g.lineTo(22, 30); g.lineTo(18, 35); g.lineTo(14, 30); g.lineTo(10, 34); g.lineTo(6, 34); g.fill();
      g.globalAlpha = 1;
      px(g, 11, 6, 10, 9, shade(skin, 25));
      hornsAt(6, 4);
      g.fillStyle = "#101418"; g.fillRect(12, 9, 3, 4); g.fillRect(17, 9, 3, 4);
      g.fillStyle = eyeC; g.fillRect(13, 10, 1, 1); g.fillRect(18, 10, 1, 1);
      g.fillStyle = "#101418"; g.fillRect(14, 13, 4, 1);
      if (wings) batWings(16, false);
      px(g, 4, 18, 4, 8, dark); px(g, 24, 18, 4, 8, dark);
    } else if (build === "O") {
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16, 33, 12, 4, 0, 0, 7); g.fill();
      g.fillStyle = dark; g.beginPath(); g.ellipse(16, 27, 12, 10, 0, 0, 7); g.fill();
      g.fillStyle = skin; g.beginPath(); g.ellipse(16, 25, 11, 8, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(11, 20, 4, 3, -0.4, 0, 7); g.fill();
      g.fillStyle = "#101418"; g.fillRect(10, 23, 4, 6); g.fillRect(19, 23, 4, 6);
      g.fillStyle = eyeC; g.fillRect(11, 24, 1, 1); g.fillRect(20, 24, 1, 1);
      g.fillStyle = "#101418"; for (let i = 0; i < 3; i++) g.fillRect(11 + i * 4, 28, 2, 2);
      eyes(8, 15, 2); eyes(22, 15, 2);
      if (horns) hornsAt(14, 6);
      if (crack) { g.fillStyle = crack; g.fillRect(15, 26, 2, 6); }
    } else if (build === "C" || build === "U") {
      // rocky / ossified brute
      px(g, 8, 28, 5, 8, dark); px(g, 19, 28, 5, 8, dark);
      px(g, 7, 33, 7, 3, "#111"); px(g, 18, 33, 7, 3, "#111");
      px(g, 5, 16, 9, 13, skin); px(g, 18, 16, 9, 13, skin);
      px(g, 6, 17, 7, 2, lite); px(g, 19, 17, 7, 2, lite);
      px(g, 9, 12, 14, 17, dark); px(g, 11, 14, 10, 13, skin);
      crackOn(11, 14, 10, 13);
      px(g, 9, 4, 14, 11, skin); px(g, 10, 5, 12, 3, lite);
      if (build === "U") { px(g, 9, 4, 14, 2, "#fff"); g.fillStyle = "#101418"; g.fillRect(12, 8, 4, 4); g.fillRect(17, 8, 4, 4); }
      hornsAt(4, 5);
      if (build === "U") { g.fillStyle = eyeC; g.fillRect(13, 9, 1, 1); g.fillRect(18, 9, 1, 1); }
      else { eyes(12, 8); eyes(19, 8); }
      g.fillStyle = "#101418"; g.fillRect(14, 12, 4, 1);
      if (wings) batWings(16, wings > 1);
      if (tail) tailAt(14, 29, false);
    } else {
      // H humanoid fiend + B bulky brute
      const wide = build === "B";
      const x0 = wide ? 8 : 10, ww = wide ? 16 : 12;
      px(g, x0 + 1, 30, 4, 6, dark); px(g, x0 + ww - 5, 30, 4, 6, dark);
      px(g, x0, 35, 6, 2, "#1a0c0c"); px(g, x0 + ww - 6, 35, 6, 2, "#1a0c0c");
      px(g, x0 - 3, 20, 4, 9, skin); px(g, x0 + ww - 1, 20, 4, 9, skin);
      g.fillStyle = lite; g.fillRect(x0 - 3, 27, 4, 2); g.fillRect(x0 + ww - 1, 27, 4, 2);
      px(g, x0, 19, ww, 12, skin); px(g, x0, 19, 3, 12, lite); px(g, x0 + ww - 3, 19, 3, 12, dark);
      crackOn(x0 + 2, 21, ww - 4, 8);
      // H demons wear dark hair like the reference succubus
      px(g, x0 - 1, 3, ww + 2, 7, "#14101a"); px(g, x0 - 1, 8, 3, 8, "#14101a"); px(g, x0 + ww - 2, 8, 3, 8, "#14101a");
      px(g, x0 + 1, 8, ww - 2, 11, skin); px(g, x0 + 2, 9, ww - 4, 3, lite);
      px(g, x0 + 1, 11, ww - 2, 3, dark);
      hornsAt(4, (ww / 2) | 0);
      eyes(x0 + 3, 13); eyes(x0 + ww - 5, 13);
      g.fillStyle = "#101418"; g.fillRect(x0 + ww / 2 - 2, 16, 4, 1);
      if (wide) { px(g, x0 + 4, 22, ww - 8, 5, shade(skin, -15)); }
      if (wings) batWings(18, wings > 1);
      if (tail) tailAt(x0 + ww - 4, 29, true);
    }
    bossTrim();
    return c;
  }
  function drawActor(kind, tint = "#4da3ff", seed = 1, gear = null, app = null, gen = "", ph = null) {
    const c = document.createElement("canvas"); c.width = 32; c.height = 40;
    const g = c.getContext("2d");
    gen = (gen === "male" || gen === "female") ? gen : "";
    const r = mulberry(hashStr(String(kind) + String(seed)) || 1);
    g.clearRect(0, 0, 32, 40);
    // shadow
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(16, 37, 9, 3, 0, 0, 7); g.fill();

    // ---------- mobs with unique silhouettes ----------
    if (kind === "slime") {
      // glossy blob: dark base, bright body, white shine, face
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16, 32, 12, 4, 0, 0, 7); g.fill();
      g.fillStyle = shade(tint, -30); g.beginPath(); g.ellipse(16, 27, 12, 10, 0, 0, 7); g.fill();
      g.fillStyle = tint; g.beginPath(); g.ellipse(16, 25, 11, 8, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,0.65)"; g.beginPath(); g.ellipse(11, 20, 4, 3, -0.4, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(15, 32, 5, 2);
      g.fillStyle = "#101418"; g.fillRect(11, 24, 3, 5); g.fillRect(19, 24, 3, 5);
      g.fillStyle = "#fff"; g.fillRect(11, 24, 1, 2); g.fillRect(19, 24, 1, 2);
      g.fillStyle = "#101418"; g.fillRect(14, 29, 4, 2);
      return c;
    }
    if (kind === "mushroom") {
      // sporeling: cream stem + big spotted cap, stubby feet (no human legs)
      px(g, 10, 30, 4, 6, "#8a6a4a"); px(g, 18, 30, 4, 6, "#8a6a4a");
      px(g, 11, 22, 10, 12, "#f2e3c2"); px(g, 12, 24, 8, 8, "#e8d0a8");
      g.fillStyle = "#101418"; g.fillRect(13, 26, 2, 3); g.fillRect(17, 26, 2, 3);
      px(g, 14, 30, 4, 1, "#7a4a3a");
      // cap
      g.fillStyle = shade(tint, -10) || "#c95a2e"; g.fillRect(5, 12, 22, 10);
      g.fillStyle = tint; g.fillRect(6, 8, 20, 8); g.fillRect(9, 5, 14, 5);
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.fillRect(9, 10, 4, 4); g.fillRect(18, 9, 4, 4); g.fillRect(14, 15, 4, 4); g.fillRect(22, 14, 3, 3);
      px(g, 5, 20, 22, 2, shade(tint, -45));
      return c;
    }
    if (kind === "bat") {
      // scalloped wings, small furry body, ears + fangs
      g.fillStyle = shade(tint, -25);
      g.beginPath(); g.moveTo(15, 22); g.lineTo(2, 12); g.lineTo(4, 18); g.lineTo(7, 17); g.lineTo(9, 23); g.lineTo(15, 26); g.fill();
      g.beginPath(); g.moveTo(17, 22); g.lineTo(30, 12); g.lineTo(28, 18); g.lineTo(25, 17); g.lineTo(23, 23); g.lineTo(17, 26); g.fill();
      g.fillStyle = tint; g.fillRect(3, 13, 3, 2); g.fillRect(26, 13, 3, 2);
      px(g, 12, 12, 2, 4, "#2e2138"); px(g, 18, 12, 2, 4, "#2e2138"); // ears
      px(g, 11, 16, 10, 10, "#3a2b4f"); px(g, 12, 18, 8, 7, "#46345c");
      g.fillStyle = "#ff3b3b"; g.fillRect(13, 20, 2, 2); g.fillRect(17, 20, 2, 2);
      g.fillStyle = "#fff"; g.fillRect(14, 24, 1, 2); g.fillRect(17, 24, 1, 2);
      return c;
    }
    if (kind === "wolf") {
      // quadruped: long body, 4 legs, tail, snout — never humanoid
      const fur = tint; const dark = shade(tint, -35);
      px(g, 2, 22, 4, 3, dark); px(g, 1, 20, 2, 3, dark); // tail
      px(g, 6, 24, 19, 8, fur); px(g, 6, 24, 19, 2, shade(tint, 25));
      px(g, 6, 24, 3, 8, dark); // haunch shadow
      px(g, 7, 31, 3, 5, dark); px(g, 12, 31, 3, 5, dark); px(g, 18, 31, 3, 5, dark); px(g, 22, 31, 3, 5, dark);
      px(g, 7, 35, 3, 1, "#222"); px(g, 12, 35, 3, 1, "#222"); px(g, 18, 35, 3, 1, "#222"); px(g, 22, 35, 3, 1, "#222");
      // head + snout + ears
      px(g, 22, 16, 8, 10, fur); px(g, 23, 17, 6, 3, shade(tint, 30));
      px(g, 22, 14, 3, 4, fur); px(g, 27, 14, 3, 4, fur); // ears
      px(g, 23, 15, 1, 2, "#e8b0b0"); px(g, 28, 15, 1, 2, "#e8b0b0");
      px(g, 27, 21, 5, 4, "#d9c9b8"); // muzzle
      px(g, 30, 22, 2, 2, "#111"); // nose
      g.fillStyle = "#ffd93d"; g.fillRect(24, 20, 2, 2);
      g.fillStyle = "#111"; g.fillRect(24, 20, 1, 1);
      px(g, 8, 24, 5, 2, "rgba(255,255,255,0.25)"); // back highlight
      return c;
    }
    if (kind === "goblin") {
      // short green humanoid: huge pointed ears, big nose, loincloth, dagger
      const skin = "#58a34d"; const dark = "#2f7a2f";
      // ears: long triangles sticking sideways
      g.fillStyle = skin;
      g.beginPath(); g.moveTo(10, 13); g.lineTo(1, 10); g.lineTo(3, 16); g.lineTo(10, 16); g.fill();
      g.beginPath(); g.moveTo(22, 13); g.lineTo(31, 10); g.lineTo(29, 16); g.lineTo(22, 16); g.fill();
      g.fillStyle = "#7cc47c"; g.fillRect(3, 12, 3, 1); g.fillRect(26, 12, 3, 1);
      // stubby legs + feet
      px(g, 11, 31, 4, 5, dark); px(g, 17, 31, 4, 5, dark);
      px(g, 10, 35, 5, 2, "#5a3a22"); px(g, 17, 35, 5, 2, "#5a3a22");
      // scrappy tunic + loincloth
      px(g, 9, 21, 14, 11, tint); px(g, 9, 29, 14, 3, dark);
      px(g, 13, 24, 6, 8, "#6b4226"); px(g, 14, 25, 4, 4, "#8a5a33");
      // skinny arms
      px(g, 6, 22, 3, 8, skin); px(g, 23, 22, 3, 8, skin);
      px(g, 6, 29, 3, 3, "#3f8a3f"); px(g, 23, 29, 3, 3, "#3f8a3f");
      // big green head + brow + nose + fangs
      px(g, 9, 8, 14, 12, skin); px(g, 10, 9, 12, 3, "#6fbf63");
      px(g, 9, 12, 14, 3, "#3f7d36"); // heavy brow band
      g.fillStyle = "#ffe14d"; g.fillRect(11, 14, 4, 3); g.fillRect(18, 14, 4, 3);
      g.fillStyle = "#111"; g.fillRect(13, 14, 2, 3); g.fillRect(19, 14, 2, 3);
      px(g, 14, 17, 4, 3, "#3f7d36"); px(g, 15, 18, 2, 2, "#2f5c28"); // nose
      g.fillStyle = "#fff"; g.fillRect(13, 20, 1, 2); g.fillRect(18, 20, 1, 2);
      // dagger
      px(g, 25, 24, 2, 8, "#cccccc"); px(g, 24, 31, 4, 2, "#6b4226");
      return c;
    }
    if (kind === "skeleton") {
      // skull head, ribcage, bare bone limbs — no skin anywhere
      const bone = "#e8e4d8"; const dark = "#1a1a1f"; const joint = "#9a968a";
      // rattly legs + arms
      px(g, 11, 30, 3, 6, bone); px(g, 18, 30, 3, 6, bone);
      px(g, 11, 32, 3, 1, joint); px(g, 18, 32, 3, 1, joint);
      px(g, 10, 36, 5, 1, bone); px(g, 17, 36, 5, 1, bone);
      px(g, 6, 20, 3, 8, bone); px(g, 23, 20, 3, 8, bone);
      px(g, 6, 23, 3, 1, joint); px(g, 23, 23, 3, 1, joint);
      px(g, 6, 28, 3, 3, bone); px(g, 23, 28, 3, 3, bone);
      // spine + ribs
      px(g, 14, 18, 4, 13, bone);
      g.fillStyle = dark; for (let i = 0; i < 4; i++) g.fillRect(11, 20 + i * 3, 10, 1);
      px(g, 14, 18, 4, 2, joint); // collar
      // skull
      px(g, 10, 5, 12, 11, bone); px(g, 12, 3, 8, 3, bone);
      px(g, 10, 5, 12, 2, "#fff");
      g.fillStyle = dark; g.fillRect(12, 8, 4, 5); g.fillRect(17, 8, 4, 5); // sockets
      g.fillStyle = "#ff3b3b"; g.fillRect(13, 10, 1, 1); g.fillRect(18, 10, 1, 1); // ember glint
      px(g, 15, 10, 2, 4, "#9a968a"); // nasal
      g.fillStyle = dark; for (let x = 0; x < 4; x++) g.fillRect(12 + x * 3, 15, 1, 2); // teeth
      // rusty blade
      px(g, 25, 14, 2, 12, "#9aa0a8"); px(g, 24, 25, 4, 3, "#5a3a22");
      return c;
    }
    if (kind === "cultist") {
      // floor-length robe, deep hood, glowing eyes, amulet
      const robe = tint; const dk = shade(tint, -45);
      px(g, 9, 28, 14, 8, dk); // robe skirt
      px(g, 10, 18, 12, 12, robe); px(g, 13, 18, 6, 12, shade(tint, 18));
      px(g, 6, 19, 3, 9, dk); px(g, 23, 19, 3, 9, dk);
      px(g, 6, 27, 3, 3, "#d9a06b"); px(g, 23, 27, 3, 3, "#d9a06b");
      // hood + void face
      px(g, 8, 2, 16, 9, robe); px(g, 8, 2, 3, 15, robe); px(g, 21, 2, 3, 15, robe);
      px(g, 11, 6, 10, 9, "#0c0a12");
      g.fillStyle = "#c77dff"; g.fillRect(12, 10, 2, 2); g.fillRect(18, 10, 2, 2);
      // amulet + sash
      px(g, 9, 24, 14, 2, dk);
      px(g, 14, 24, 4, 3, "#ffd93d"); px(g, 15, 25, 2, 1, "#7a2b8f");
      px(g, 25, 12, 2, 14, "#5a3a22"); px(g, 24, 8, 4, 5, "#c77dff"); // staff tip
      return c;
    }
    if (kind === "wraith") {
      // v4: rounded hood, single hollow cavity, close-set ember eyes, ragged drape
      g.fillStyle = "rgba(0,0,0,0.15)"; g.beginPath(); g.ellipse(16, 37, 7, 2, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(89,214,214,0.16)"; g.beginPath(); g.ellipse(16, 22, 12, 14, 0, 0, 7); g.fill();
      const sh = "rgba(126,196,212,0.95)", mid = "rgba(178,238,246,0.95)", dk = "rgba(70,130,145,0.95)";
      // hood rows: rounded dome (stepped), not a triangle
      px(g, 13, 4, 6, 2, sh); px(g, 11, 6, 10, 2, sh); px(g, 10, 8, 12, 3, sh);
      px(g, 9, 11, 14, 4, sh);
      px(g, 9, 11, 2, 17, dk); px(g, 21, 11, 2, 17, dk); // shaded drape edges
      px(g, 11, 15, 10, 13, sh);
      px(g, 12, 16, 8, 11, mid); // lit front panel
      px(g, 15, 16, 1, 11, "rgba(70,130,145,0.5)"); // cloth fold breaks the flat panel
      // single dark hollow (one cavity, taller than wide)
      px(g, 13, 12, 6, 3, "#0a1a20");
      px(g, 13, 15, 5, 3, "#0a1a20"); px(g, 14, 18, 4, 2, "#0a1a20");
      px(g, 14, 13, 4, 6, "#060f14");
      // close-set uneven slit eyes + faint glow (1px offset breaks visor symmetry)
      g.fillStyle = "rgba(141,252,255,0.35)"; g.fillRect(14, 14, 2, 4); g.fillRect(17, 15, 2, 4);
      g.fillStyle = "#e2feff"; g.fillRect(14, 14, 1, 3); g.fillRect(17, 15, 1, 3);
      // small dark mouth
      g.fillStyle = "#060f14"; g.fillRect(15, 19, 2, 1);
      // arms: uneven, melting into the drape (right arm shorter)
      px(g, 7, 19, 3, 7, sh); px(g, 7, 25, 2, 4, sh);
      px(g, 22, 17, 3, 7, sh); px(g, 23, 23, 2, 5, sh);
      // ragged hem: varied widths with a gap
      g.fillStyle = sh;
      g.fillRect(10, 27, 3, 9); g.fillRect(14, 27, 2, 5); g.fillRect(17, 27, 4, 10); g.fillRect(22, 27, 2, 6);
      return c;
    }
    // ---------- bespoke BOSS roster v3: no lazy crowns ----------
    // Every boss has a unique silhouette + built-in regalia (sword shards,
    // coral, candles, roots, bone...), never the generic gold sticker.
    if (kind === "boss") {
      // DUNGEON LORD: obsidian plate, lava veins, horned great-helm, flaming greatsword
      const plate = "#23262e", dk = "#12141a";
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const A=(window.Anim?window.Anim.limb(P):{ld:0,rd:0,lx:0,rx:0,la:0,ra:0,lax:0,rax:0,hx:0,wide:0,crouch:0});
      const hb=(window.Anim?window.Anim.hbob(P):0);
      px(g, 4 + A.lax, 14 + A.la, 3, 20, "#4a0f14"); px(g, 25 + A.rax, 14 + A.ra, 3, 20, "#4a0f14");
      px(g, 7 + A.lax, 14 + A.la, 1, 20, "#ff5a2e"); px(g, 24 + A.rax, 14 + A.ra, 1, 20, "#ff5a2e");
      px(g, 9 + A.lx, 30 + A.ld, 5, 6, dk); px(g, 18 + A.rx, 30 + A.rd, 5, 6, dk);
      px(g, 8 + A.lx, 35 + A.ld, 7, 2, "#0e0f14"); px(g, 17 + A.rx, 35 + A.rd, 7, 2, "#0e0f14");
      px(g, 8, 17, 16, 14, plate); px(g, 10, 19, 12, 9, "#343a46");
      px(g, 15, 19, 1, 6, "#ff5a2e"); px(g, 12, 23, 8, 1, "#ff5a2e"); px(g, 15, 23, 2, 3, "#ffd93d");
      px(g, 2, 13, 9, 7, plate); px(g, 21, 13, 9, 7, plate);
      px(g, 2, 18, 9, 1, "#ff5a2e"); px(g, 21, 18, 9, 1, "#ff5a2e");
      px(g, 3, 10, 2, 4, "#d9c27f"); px(g, 27, 10, 2, 4, "#d9c27f");
      px(g, 4 + A.lax, 20 + A.la, 3, 9, dk);
      px(g, 26 + A.rax, 6 + A.ra, 3, 20, "#3a3f4a"); px(g, 26 + A.rax, 6 + A.ra, 1, 20, "#ff5a2e"); px(g, 24 + A.rax, 25 + A.ra, 6, 2, "#5a3a22");
      px(g, 9 + A.hx, 3 + hb, 14, 12, plate); px(g, 14 + A.hx, 1 + hb, 4, 3, "#343a46");
      g.save(); g.translate(A.hx, hb);
      g.fillStyle = "#e8e0d0"; g.beginPath(); g.moveTo(9, 6); g.lineTo(1, 0); g.lineTo(5, 10); g.fill();
      g.beginPath(); g.moveTo(23, 6); g.lineTo(31, 0); g.lineTo(27, 10); g.fill();
      g.restore();
      px(g, 8 + A.hx, 5 + hb, 3, 2, "#ff5a2e"); px(g, 21 + A.hx, 5 + hb, 3, 2, "#ff5a2e");
      px(g, 11 + A.hx, 8 + hb, 10, 3, "#0a0c10");
      g.fillStyle = "#ff3b3b"; g.fillRect(12 + A.hx, 8 + hb, 3, 2); g.fillRect(18 + A.hx, 8 + hb, 3, 2);
      px(g, 12 + A.hx, 12 + hb, 8, 2, "#0e0f14"); px(g, 14 + A.hx, 12 + hb, 1, 2, "#ff5a2e"); px(g, 17 + A.hx, 12 + hb, 1, 2, "#ff5a2e");
      px(g, 14, 22, 4, 5, "#ff5a2e"); px(g, 15, 23, 2, 3, "#ffd93d");
      return c;
    }
    if (kind === "goblin_king") {
      // GOBLIN KING: fat-bellied, sword-shard crown, banner cape, skull scepter
      const skin = "#58a34d", dk = "#1f4a1f";
      px(g, 6, 14, 3, 16, "#5c1216"); px(g, 23, 14, 3, 16, "#1a2a5a");
      px(g, 6, 14, 3, 2, "#ffd93d"); px(g, 23, 14, 3, 2, "#ffd93d");
      g.fillStyle = skin;
      g.beginPath(); g.moveTo(10, 13); g.lineTo(0, 8); g.lineTo(3, 16); g.fill();
      g.beginPath(); g.moveTo(22, 13); g.lineTo(32, 8); g.lineTo(29, 16); g.fill();
      px(g, 2, 10, 2, 2, "#ffd93d"); px(g, 28, 10, 2, 2, "#ffd93d");
      px(g, 10, 31, 4, 5, dk); px(g, 18, 31, 4, 5, dk);
      px(g, 9, 35, 6, 2, "#3a2a1a"); px(g, 17, 35, 6, 2, "#3a2a1a");
      px(g, 7, 20, 18, 12, tint); px(g, 7, 20, 18, 2, "#e8e0d0");
      px(g, 9, 24, 4, 3, "#7a1f1f"); px(g, 19, 26, 4, 3, "#2a4a9a");
      px(g, 9, 28, 14, 2, "#ffd93d"); px(g, 15, 28, 2, 2, "#c93b3b");
      px(g, 4, 21, 3, 8, skin); px(g, 25, 21, 0, 0, skin);
      px(g, 9, 8, 14, 12, skin); px(g, 10, 9, 12, 3, "#7cc47c");
      px(g, 9, 12, 14, 3, "#2f5c28");
      g.fillStyle = "#ffe14d"; g.fillRect(11, 14, 4, 3); g.fillRect(18, 14, 4, 3);
      g.fillStyle = "#111"; g.fillRect(13, 14, 2, 3); g.fillRect(19, 14, 2, 3);
      px(g, 14, 17, 4, 3, "#3f7d36"); px(g, 10, 10, 1, 1, "#2a4a22");
      g.fillStyle = "#fff"; g.fillRect(13, 20, 1, 2); g.fillRect(18, 20, 1, 2);
      px(g, 9, 5, 14, 3, "#5a5a66");
      px(g, 10, 1, 3, 5, "#c9ccd4"); px(g, 14, 0, 3, 6, "#eef2f6"); px(g, 18, 1, 3, 5, "#c9ccd4");
      px(g, 11, 6, 1, 1, "#ffd93d"); px(g, 16, 6, 1, 1, "#ffd93d"); px(g, 20, 6, 1, 1, "#ffd93d");
      px(g, 25, 16, 2, 12, "#8a5a33"); px(g, 23, 11, 6, 6, "#e8e4d8");
      g.fillStyle = "#111"; g.fillRect(24, 13, 2, 2); g.fillRect(27, 13, 1, 2);
      return c;
    }
    if (kind === "kobold_king") {
      // KOBOLD KING: candle-dip crown, curtain cloak, pick + lantern shield, earrings
      const dk = shade(tint, -40), lite = shade(tint, 30);
      px(g, 2, 26, 6, 3, dk); px(g, 1, 24, 4, 5, "#ffd93d"); px(g, 2, 25, 2, 3, "#fff2b0");
      px(g, 11, 30, 4, 6, dk); px(g, 17, 30, 4, 6, dk);
      px(g, 7, 18, 18, 14, "#5a2a6a"); px(g, 7, 18, 18, 2, "#ffd93d");
      px(g, 10, 24, 5, 4, "#2a4a9a"); px(g, 16, 26, 6, 3, "#7a1f1f");
      px(g, 9, 20, 14, 12, tint);
      g.fillStyle = tint;
      g.beginPath(); g.moveTo(10, 10); g.lineTo(4, 4); g.lineTo(8, 12); g.fill();
      g.beginPath(); g.moveTo(22, 10); g.lineTo(28, 4); g.lineTo(24, 12); g.fill();
      px(g, 5, 11, 2, 2, "#ffd93d"); px(g, 25, 11, 2, 2, "#ffd93d");
      px(g, 9 + A.hx, 9 + hb, 14, 11, tint); px(g, 12, 15, 8, 5, "#d9c9a0");
      px(g, 15, 17, 2, 2, "#111");
      g.fillStyle = "#ffe14d"; g.fillRect(11, 12, 3, 2); g.fillRect(18, 12, 3, 2);
      g.fillStyle = "#111"; g.fillRect(12, 12, 1, 2); g.fillRect(19, 12, 1, 2);
      px(g, 9, 6, 14, 2, "#5a3a22");
      px(g, 11, 1, 3, 5, "#f2ede2"); px(g, 15, 0, 3, 6, "#f2ede2"); px(g, 19, 1, 3, 5, "#f2ede2");
      px(g, 12, 0, 1, 1, "#ff9d2e"); px(g, 16, 0, 1, 1, "#ff6b2e"); px(g, 20, 0, 1, 1, "#ff9d2e");
      px(g, 25, 14, 2, 16, "#8a5a33"); px(g, 22, 12, 8, 3, "#9aa0a8");
      px(g, 4, 20, 5, 8, "#3a2a1a"); px(g, 5, 22, 3, 4, "#ffd93d"); px(g, 6, 23, 1, 2, "#fff");
      return c;
    }
    if (kind === "orc_warchief") {
      // ORC WARCHIEF: boar tusks, jawbone pauldrons, war paint, bone topknot
      const dk = shade(tint, -40);
      px(g, 8, 30, 6, 6, dk); px(g, 18, 30, 6, 6, dk);
      px(g, 3, 14, 8, 5, "#e8e4d8"); px(g, 21, 14, 8, 5, "#e8e4d8");
      g.fillStyle = "#111"; g.fillRect(4, 17, 6, 1); g.fillRect(22, 17, 6, 1);
      px(g, 9, 16, 14, 15, tint); px(g, 11, 18, 10, 12, shade(tint, 15));
      px(g, 10, 22, 12, 2, "#7a1f1f"); px(g, 10, 26, 12, 1, "#7a1f1f");
      px(g, 10, 6, 12, 12, tint); px(g, 12, 2, 8, 5, "#1a1a1a");
      px(g, 11, 1, 2, 5, "#e8e0d0"); px(g, 19, 1, 2, 5, "#e8e0d0");
      px(g, 11, 16, 2, 6, "#e8e0d0"); px(g, 19, 16, 2, 6, "#e8e0d0");
      px(g, 13, 14, 6, 4, "#6a8a2a"); px(g, 14, 15, 1, 2, "#111"); px(g, 17, 15, 1, 2, "#111");
      g.fillStyle = "#ff3b3b"; g.fillRect(12, 10, 3, 2); g.fillRect(18, 10, 3, 2);
      g.fillStyle = "#111"; g.fillRect(13, 10, 1, 2); g.fillRect(19, 10, 1, 2);
      px(g, 5, 20, 3, 8, "#7a2b2b");
      px(g, 25, 16, 2, 12, "#5a3a22"); px(g, 22, 12, 8, 5, "#e8e4d8");
      g.fillStyle = "#111"; g.fillRect(23, 14, 5, 1);
      return c;
    }
    if (kind === "bandit_warlord") {
      // BANDIT WARLORD: duster coat, coin hat, twin scarves, crossbow, loot sack
      px(g, 8, 16, 16, 20, "#3a2e22"); px(g, 8, 16, 16, 3, "#2a211a");
      px(g, 15, 20, 2, 8, "#ffd93d");
      px(g, 2, 18, 6, 3, "#7a1f1f"); px(g, 2, 21, 3, 8, "#7a1f1f"); px(g, 24, 18, 6, 3, "#a02040");
      px(g, 11, 32, 3, 4, "#1a1a1a"); px(g, 18, 32, 3, 4, "#1a1a1a");
      px(g, 9, 9, 14, 11, "#d9a06b");
      px(g, 10, 11, 12, 3, "#1c1c22");
      px(g, 17, 11, 4, 4, "#111"); px(g, 17, 11, 4, 1, "#333");
      px(g, 12, 14, 1, 3, "#7a1f1f");
      g.fillStyle = "#ffe14d"; g.fillRect(12, 12, 2, 1);
      px(g, 6, 7, 20, 3, "#2e2620"); px(g, 10, 2, 12, 6, "#3a2e22");
      px(g, 11, 7, 2, 1, "#ffd93d"); px(g, 15, 7, 2, 1, "#ffd93d"); px(g, 19, 7, 2, 1, "#ffd93d");
      px(g, 4, 22, 2, 10, "#c9ccd4"); px(g, 26, 22, 2, 10, "#c9ccd4");
      px(g, 20, 10, 2, 14, "#5a3a22"); px(g, 17, 12, 8, 2, "#8a5a33");
      px(g, 5, 26, 5, 6, "#8a5a33"); px(g, 6, 24, 3, 3, "#ffd93d");
      return c;
    }
    if (kind === "gnoll_alpha") {
      // GNOLL ALPHA: bone mohawk, laughing jaw, scar, tail club
      const dk = shade(tint, -35), lite = shade(tint, 30);
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const Q=(window.Anim?window.Anim.quad(P):{d1:0,d2:0,x1:0,x2:0});
      const hb=(window.Anim?window.Anim.hbob(P):0);
      const sw=(window.Anim?window.Anim.seg(P,0,1):0);
      px(g, 1 + sw, 20, 4, 4, dk); px(g, 0 + sw, 18, 5, 5, "#5a3a22");
      px(g, 0 + sw, 18, 5, 1, "#8a8a8a"); px(g, 0 + sw, 22, 1, 1, "#8a8a8a"); px(g, 4 + sw, 22, 1, 1, "#8a8a8a");
      px(g, 6, 24, 19, 8, tint); px(g, 6, 24, 19, 2, lite);
      for (let _i = 0; _i < 4; _i++) px(g, 8 + _i * 4, 20, 2, 4, "#e8e0d0");
      px(g, 7 + Q.x1, 31 + Q.d1, 3, 5, dk); px(g, 12 + Q.x2, 31 + Q.d2, 3, 5, dk); px(g, 18 + Q.x1, 31 + Q.d1, 3, 5, dk); px(g, 22 + Q.x2, 31 + Q.d2, 3, 5, dk);
      px(g, 20, 16, 3, 10, "#3a2a1a");
      px(g, 22, 14 + hb, 8, 12, tint); px(g, 23, 15 + hb, 6, 3, lite);
      px(g, 22, 10 + hb, 4, 5, tint); px(g, 27, 10 + hb, 4, 5, tint);
      px(g, 22, 10 + hb, 4, 1, "#111"); px(g, 27, 10 + hb, 4, 1, "#111");
      px(g, 26, 21 + hb + (P.atk ? 2 : 0), 6, 5, "#d9c9b8"); px(g, 30, 22 + hb, 2, 2, "#111");
      g.fillStyle = "#fff"; g.fillRect(27, 23 + hb + (P.atk ? 2 : 0), 1, 2); g.fillRect(29, 23 + hb + (P.atk ? 2 : 0), 1, 2); g.fillRect(28, 25 + hb + (P.atk ? 2 : 0), 2, 1);
      px(g, 23, 17 + hb, 4, 1, "#7a1f1f");
      g.fillStyle = "#ff3b3b"; g.fillRect(24, 19 + hb, 2, 2); g.fillRect(27, 19 + hb, 1, 1);
      g.fillStyle = "#111"; g.fillRect(24, 19 + hb, 1, 2);
      px(g, 8, 26, 10, 2, "#e8e0d0");
      return c;
    }
    if (kind === "troll_king") {
      // TROLL KING: tree on shoulder, root crown, trunk club, crystal back
      const dk = shade(tint, -35), lite = shade(tint, 25);
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const A=(window.Anim?window.Anim.limb(P):{ld:0,rd:0,lx:0,rx:0,la:0,ra:0,lax:0,rax:0,hx:0,wide:0,crouch:0});
      const hb=(window.Anim?window.Anim.hbob(P):0);
      px(g, 8 + A.lx, 30 + A.ld, 6, 6, dk); px(g, 18 + A.rx, 30 + A.rd, 6, 6, dk);
      px(g, 9, 16, 14, 15, tint); px(g, 11, 18, 10, 11, lite);
      px(g, 10, 26, 12, 3, "#2f4a1f");
      px(g, 6, 14, 8, 6, tint);
      px(g, 7, 8, 3, 7, "#4a2f1a"); px(g, 5, 5, 7, 5, "#2f6a2f"); px(g, 6, 4, 5, 2, "#3f8a3f");
      px(g, 24, 14, 3, 6, "#7fd4ff"); px(g, 25, 15, 1, 4, "#fff");
      px(g, 10 + A.hx, 6 + hb, 12, 10, tint); px(g, 13 + A.hx, 10 + hb, 6, 5, "#d9c9a0");
      px(g, 15 + A.hx, 12 + hb, 2, 2, "#111"); px(g, 13 + A.hx, 8 + hb, 2, 2, "#ffe14d"); px(g, 18 + A.hx, 8 + hb, 2, 2, "#ffe14d");
      g.fillStyle = "#111"; g.fillRect(13 + A.hx, 8 + hb, 1, 2); g.fillRect(18 + A.hx, 8 + hb, 1, 2);
      px(g, 14 + A.hx, 13 + hb + (P.atk ? 1 : 0), 4, 2, "#3a2a1a");
      px(g, 9 + A.hx, 4 + hb, 14, 3, "#3a2a1a"); px(g, 10 + A.hx, 3 + hb, 3, 2, "#5a4a2a"); px(g, 14 + A.hx, 2 + hb, 2, 2, "#5a4a2a"); px(g, 19 + A.hx, 3 + hb, 3, 2, "#5a4a2a");
      px(g, 25 + A.rax, 12 + A.ra - (P.atk ? 4 : 0), 3, 20, "#4a2f1a"); px(g, 22 + A.rax, 10 + A.ra - (P.atk ? 4 : 0), 8, 4, "#6b4226"); px(g, 22 + A.rax, 10 + A.ra - (P.atk ? 4 : 0), 8, 1, "#8a5a33");
      px(g, 5 + A.lax, 20 + A.la, 3, 10, "#2a4a2a");
      return c;
    }
    if (kind === "slime_sovereign") {
      // SLIME SOVEREIGN: triple-lobed mass, swallowed treasure, ooze crown, 3 eyes
      const dk = shade(tint, -35), lite = shade(tint, 30);
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      // triple-lobed ooze wobbles side to side, squashes on hurt, crown spikes on atk
      const wb=P.hurt?0:P.moving?[1,2,-2,-1][P.f&3]:0;
      const sq=P.hurt?2:0, cr=P.atk?-2:0;
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16, 33, 13, 4, 0, 0, 7); g.fill();
      g.fillStyle = dk; g.beginPath(); g.ellipse(16 + wb, 27 + sq, 13, 10, 0, 0, 7); g.fill();
      g.fillStyle = tint; g.beginPath(); g.ellipse(16 + wb, 25 + sq, 12, 9, 0, 0, 7); g.fill();
      g.fillStyle = lite; g.beginPath(); g.arc(6 + wb * 2, 29 + sq, 4, 0, 7); g.fill();
      g.beginPath(); g.arc(26 + wb * 2, 29 + sq, 4, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(11 + wb, 19 + sq, 4, 3, -0.4, 0, 7); g.fill();
      px(g, 12 + wb, 26 + sq, 3, 3, "#ffd93d"); px(g, 19 + wb, 27 + sq, 2, 4, "#c9ccd4"); px(g, 20 + wb, 27 + sq, 1, 1, "#fff");
      px(g, 15 + wb, 25 + sq, 2, 2, "#8a5a33");
      g.fillStyle = "#101418"; g.fillRect(10 + wb, 23 + sq, 3, 4); g.fillRect(15 + wb, 22 + sq, 3, 5); g.fillRect(20 + wb, 23 + sq, 3, 4);
      g.fillStyle = "#fff"; g.fillRect(10 + wb, 23 + sq, 1, 2); g.fillRect(15 + wb, 22 + sq, 1, 2); g.fillRect(20 + wb, 23 + sq, 1, 2);
      g.fillStyle = tint;
      g.beginPath(); g.moveTo(8 + wb, 13 + cr); g.lineTo(10 + wb, 5 + cr); g.lineTo(13 + wb, 11 + cr); g.lineTo(16 + wb, 3 + cr * 2); g.lineTo(19 + wb, 11 + cr); g.lineTo(22 + wb, 5 + cr); g.lineTo(24 + wb, 13 + cr); g.fill();
      px(g, 8 + wb, 12, 16, 2, "#fff2b0"); px(g, 12 + wb, 13, 2, 2, "#ff4ad9"); px(g, 18 + wb, 13, 2, 2, "#ff4ad9");
      px(g, 4 + wb * 2, 26 + sq, 2, 5, tint); px(g, 26 + wb * 2, 26 + sq, 2, 5, tint);
      px(g, 3 + wb * 2, 24 + sq, 4, 3, "#7fd4ff"); px(g, 25 + wb * 2, 24 + sq, 4, 3, "#ffd93d");
      g.strokeStyle = "rgba(255,60,120,0.8)"; g.lineWidth = 2; g.beginPath(); g.ellipse(16, 26, 14, 10, 0, 0, 7); g.stroke();
      return c;
    }
    if (kind === "skeleton_warlord") {
      // SKELETON WARLORD: 4 arms, gold death mask, soul lantern, banner pole
      const bone = "#e8e4d8", joint = "#9a968a";
      px(g, 2, 8, 2, 18, "#5a3a22"); px(g, 0, 8, 6, 5, "#7a1f1f"); px(g, 0, 8, 6, 1, "#ffd93d");
      px(g, 11, 30, 3, 6, bone); px(g, 18, 30, 3, 6, bone);
      px(g, 10, 36, 5, 1, bone); px(g, 17, 36, 5, 1, bone);
      px(g, 4, 18, 3, 8, bone); px(g, 25, 18, 3, 8, bone);
      px(g, 4, 24, 3, 1, joint); px(g, 25, 24, 3, 1, joint);
      px(g, 6, 20, 3, 6, bone); px(g, 23, 20, 3, 6, bone);
      px(g, 14, 18, 4, 13, bone);
      g.fillStyle = "#1a1a1f"; for (let _r = 0; _r < 4; _r++) g.fillRect(11, 20 + _r * 3, 10, 1);
      px(g, 14, 28, 4, 4, "#2a3a4a"); px(g, 15, 29, 2, 2, "#7fd4ff"); px(g, 14, 27, 4, 1, "#ffd93d");
      px(g, 10, 5, 12, 11, bone); px(g, 10, 5, 12, 3, "#ffd93d");
      px(g, 12, 8, 8, 6, "#1a1a1f");
      g.fillStyle = "#ff3b3b"; g.fillRect(13, 10, 2, 3); g.fillRect(18, 10, 2, 3);
      px(g, 15, 10, 2, 4, joint);
      g.fillStyle = "#1a1a1f"; for (let _t = 0; _t < 4; _t++) g.fillRect(12 + _t * 3, 15, 1, 1);
      g.fillStyle = "#e8e0d0"; g.beginPath(); g.moveTo(10, 7); g.lineTo(4, 1); g.lineTo(7, 9); g.fill();
      g.beginPath(); g.moveTo(22, 7); g.lineTo(28, 1); g.lineTo(25, 9); g.fill();
      px(g, 1, 20, 3, 10, "#9aa0a8"); px(g, 28, 20, 3, 10, "#9aa0a8");
      px(g, 0, 29, 5, 2, "#5a3a22"); px(g, 27, 29, 5, 2, "#5a3a22");
      px(g, 3, 12, 4, 4, "#5c1216");
      return c;
    }
    if (kind === "draugr_king") {
      // DRAUGR KING: barnacled armor, seaweed crown, glowing wound, anchor sword
      const dk = "#2a3a2a";
      px(g, 11, 30, 3, 6, "#9aa09a"); px(g, 18, 30, 3, 6, "#9aa09a");
      px(g, 9, 20, 14, 11, "#3a3a42"); px(g, 11, 20, 10, 11, "#6a7a6a");
      px(g, 12, 22, 3, 2, "#e8e0d0"); px(g, 18, 24, 2, 2, "#e8e0d0"); px(g, 14, 27, 2, 2, "#c9c9c9");
      px(g, 14, 23, 4, 4, "#7fd4ff"); px(g, 15, 24, 2, 2, "#fff");
      g.fillStyle = "#1a1a1f"; g.fillRect(12, 21, 3, 1); g.fillRect(17, 26, 3, 1);
      px(g, 4, 16, 4, 14, "#2a5a3a"); px(g, 5, 16, 2, 14, "#4a8a4a");
      px(g, 10, 8, 12, 10, "#9aa09a"); px(g, 10, 8, 12, 2, "#7aa07a");
      px(g, 12, 10, 8, 6, "#1a3a2a");
      g.fillStyle = "#7fd4ff"; g.fillRect(13, 12, 2, 2); g.fillRect(18, 12, 2, 2);
      px(g, 8, 4, 16, 4, "#2a5a3a"); px(g, 10, 2, 2, 6, "#4a8a4a"); px(g, 14, 1, 3, 7, "#3a6a3a"); px(g, 19, 2, 2, 6, "#4a8a4a");
      px(g, 12, 4, 2, 1, "#ffd93d");
      px(g, 25, 14, 3, 16, "#6a5a3a"); px(g, 23, 12, 7, 3, "#6a6a6a"); px(g, 24, 13, 2, 1, "#3a3a3a");
      px(g, 26, 8, 4, 4, "#c94a3a"); px(g, 27, 9, 2, 2, "#fff");
      return c;
    }
    if (kind === "cursed_pharaoh") {
      // CURSED PHARAOH: half jackal funerary mask, nemes, crook+flail, sand halo
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const A=(window.Anim?window.Anim.limb(P):{ld:0,rd:0,lx:0,rx:0,la:0,ra:0,lax:0,rax:0,hx:0,wide:0,crouch:0});
      const hb=(window.Anim?window.Anim.hbob(P):0);
      px(g, 11 + A.lx, 30 + A.ld, 3, 6, "#8a7a5a"); px(g, 18 + A.rx, 30 + A.rd, 3, 6, "#8a7a5a");
      px(g, 9, 18, 14, 13, "#2a4a6a"); px(g, 11, 20, 10, 11, "#d9b96a");
      px(g, 10, 22, 3, 2, "#8a1a1a"); px(g, 19, 26, 3, 2, "#2a6a9a");
      for (let _j = 0; _j < 4; _j++) px(g, 11 + _j * 3, 28, 2, 3, "#8a7a5a");
      px(g, 24 + A.rax, 16 + A.ra - (P.atk ? 4 : 0), 2, 10, "#ffd93d"); px(g, 23 + A.rax, 14 + A.ra - (P.atk ? 4 : 0), 4, 3, "#fff"); px(g, 6 + A.lax, 16 + A.la, 2, 10, "#8a5a33"); px(g, 5 + A.lax, 13 + A.la, 4, 3, "#d9c27f");
      px(g, 8 + A.hx, 4 + hb, 16, 8, "#2a6a9a"); px(g, 8 + A.hx, 4 + hb, 4, 14, "#ffd93d"); px(g, 20 + A.hx, 4 + hb, 4, 14, "#ffd93d");
      for (let _s = 0; _s < 3; _s++) { px(g, 8 + A.hx, 6 + _s * 4 + hb, 4, 2, "#2a6a9a"); px(g, 20 + A.hx, 6 + _s * 4 + hb, 4, 2, "#2a6a9a"); }
      px(g, 10 + A.hx, 10 + hb, 6, 8, "#d9b96a"); px(g, 16 + A.hx, 10 + hb, 6, 8, "#e8e4d8");
      px(g, 10 + A.hx, 10 + hb, 6, 2, "#111"); g.fillStyle = "#ffd93d"; g.fillRect(12 + A.hx, 12 + hb, 2, 3);
      px(g, 17 + A.hx, 12 + hb, 4, 5, "#111"); g.fillStyle = "#ff3b3b"; g.fillRect(18 + A.hx, 13 + hb, 1, 2);
      px(g, 15 + A.hx, 13 + hb, 2, 5, "#9a968a");
      px(g, 5 + A.hx, 2 + hb, 2, 2, "#d9c27f"); px(g, 25 + A.hx, 2 + hb, 2, 2, "#d9c27f"); px(g, 13 + A.hx, 0 + hb, 2, 2, "#d9c27f");
      px(g, 13, 18, 6, 2, "#ffd93d");
      return c;
    }
    if (kind === "dullahan_lord") {
      // DULLAHAN LORD: neck flame, held head aloft, spinal whip, wheel shield
      px(g, 11, 14, 10, 18, "#1a1a24"); px(g, 13, 14, 6, 14, "#3a3a4a");
      px(g, 12, 12, 8, 3, "#7fd4ff"); px(g, 14, 11, 4, 2, "#2a9ac9"); px(g, 15, 10, 2, 1, "#fff");
      px(g, 6, 30, 6, 2, "#0c0c12"); px(g, 20, 30, 6, 2, "#0c0c12");
      px(g, 11, 28, 10, 4, "#2a2a3a"); px(g, 13, 30, 6, 2, "#c9ccd4");
      px(g, 2, 14, 7, 9, "#0c0c12"); px(g, 3, 15, 5, 7, "#2a2a3a");
      px(g, 4, 17, 3, 3, "#e8e4d8"); px(g, 5, 18, 1, 1, "#111");
      px(g, 23, 2, 7, 8, "#d9c9a0"); px(g, 24, 4, 5, 5, "#111");
      g.fillStyle = "#7fd4ff"; g.fillRect(24, 6, 2, 2); g.fillRect(27, 6, 2, 2);
      g.fillStyle = "#fff"; g.fillRect(25, 8, 3, 1);
      px(g, 25, 10, 3, 8, "#d9c9a0");
      px(g, 4, 2, 3, 3, "#5c1216"); px(g, 25, 0, 2, 2, "#5c1216");
      px(g, 26, 18, 2, 12, "#e8e4d8"); px(g, 26, 20, 2, 1, "#999"); px(g, 26, 24, 2, 1, "#999"); px(g, 26, 28, 2, 1, "#999");
      px(g, 4, 16, 3, 12, "#5c1216"); px(g, 4, 16, 3, 2, "#ffd93d");
      return c;
    }
    if (kind === "wraith_sovereign") {
      // WRAITH SOVEREIGN: triple-tail mantle, orbiting crown shards, soul cage, ice scythe
      g.fillStyle = "rgba(89,214,214,0.16)"; g.beginPath(); g.ellipse(16, 22, 13, 14, 0, 0, 7); g.fill();
      const sh = "#2a6a7a", mid = "#59d6d6", dk = "#123a42";
      px(g, 11, 6, 10, 3, sh); px(g, 9, 9, 14, 4, sh); px(g, 8, 13, 16, 4, sh);
      px(g, 11, 13, 10, 14, mid); px(g, 13, 15, 6, 10, "#0c0a12");
      px(g, 13, 17, 2, 3, "#bfe8ff"); px(g, 17, 17, 2, 3, "#bfe8ff"); px(g, 15, 21, 2, 2, "#bfe8ff");
      px(g, 7, 17, 3, 9, sh); px(g, 22, 17, 3, 9, sh);
      px(g, 8, 27, 3, 10, sh); px(g, 13, 27, 2, 6, sh); px(g, 17, 27, 3, 10, sh); px(g, 22, 27, 2, 7, sh);
      px(g, 13, 15, 6, 1, "#123a42");
      g.fillStyle = "#e2feff"; g.fillRect(13, 18, 2, 3); g.fillRect(18, 18, 1, 3);
      px(g, 6, 2, 4, 3, "#ffd93d"); px(g, 13, 0, 4, 3, "#ffd93d"); px(g, 22, 3, 4, 3, "#ffd93d");
      px(g, 26, 12, 2, 18, "#3a2a1a"); px(g, 27, 10, 4, 6, "#bfe8ff"); px(g, 28, 11, 2, 4, "#fff");
      return c;
    }
    if (kind === "cultist_hierophant") {
      // HIEROPHANT OF THE PIT: triple mask, tentacle beard, eye robe, pit brazier
      const robe = "#2a1040", trim = "#c77dff";
      px(g, 9, 26, 14, 10, "#1a0a28"); px(g, 10, 18, 12, 10, robe); px(g, 13, 18, 6, 10, shade(robe, 25));
      px(g, 11, 30, 3, 2, "#c77dff"); px(g, 15, 32, 2, 2, "#c77dff"); px(g, 19, 30, 3, 2, "#c77dff");
      px(g, 11, 0, 10, 5, robe); px(g, 12, 5, 8, 5, "#0c0a12");
      px(g, 11, 5, 3, 3, "#c77dff"); px(g, 18, 5, 3, 3, "#c77dff");
      g.fillStyle = "#fff"; g.fillRect(12, 6, 1, 1); g.fillRect(19, 6, 1, 1);
      px(g, 13, 10, 6, 5, "#0c0a12");
      g.fillStyle = "#ff9d2e"; g.fillRect(14, 11, 2, 2); g.fillRect(17, 11, 2, 2);
      px(g, 12, 15, 2, 4, "#8a4a6a"); px(g, 14, 16, 2, 4, "#8a4a6a"); px(g, 17, 16, 2, 4, "#8a4a6a"); px(g, 19, 15, 2, 4, "#8a4a6a");
      px(g, 25, 14, 2, 16, "#5a3a22"); px(g, 23, 8, 6, 7, "#1a0a28"); px(g, 24, 9, 4, 5, "#ff6b2e"); px(g, 25, 10, 2, 3, "#ffd93d");
      px(g, 14, 22, 4, 4, trim); px(g, 15, 23, 2, 2, "#0c0a12");
      return c;
    }
    if (kind === "baba_yaga") {
      // BABA YAGA: bone-stuck wild hair, iron teeth, skull shawl, hut-on-legs staff
      px(g, 11, 28, 4, 8, "#3a2a3a"); px(g, 17, 28, 4, 8, "#3a2a3a");
      px(g, 9, 18, 14, 12, "#4a2a4a"); px(g, 10, 24, 12, 3, "#2a1a2a");
      px(g, 6, 4, 20, 16, "#c9c9c9"); px(g, 9, 6, 14, 12, "#c9c9c9");
      px(g, 8, 2, 3, 6, "#8a8a8a"); px(g, 14, 0, 3, 7, "#8a8a8a"); px(g, 21, 2, 3, 6, "#8a8a8a");
      px(g, 9, 3, 2, 2, "#e8e4d8"); px(g, 19, 8, 2, 2, "#e8e4d8");
      px(g, 11, 8, 10, 10, "#e8d9c0");
      g.fillStyle = "#111"; g.fillRect(12, 11, 2, 3); g.fillRect(18, 11, 2, 3);
      g.fillStyle = "#5a5a5a"; g.fillRect(13, 12, 1, 1); g.fillRect(19, 12, 1, 1);
      px(g, 13, 15, 6, 3, "#5a5a5a"); g.fillStyle = "#222"; for (let _b = 0; _b < 3; _b++) g.fillRect(14 + _b * 2, 15, 1, 3);
      px(g, 8, 18, 3, 3, "#e8e4d8"); px(g, 21, 18, 3, 3, "#e8e4d8");
      g.fillStyle = "#111"; g.fillRect(8, 19, 1, 1); g.fillRect(22, 19, 1, 1);
      px(g, 5, 24, 2, 6, "#c9c9c9"); px(g, 25, 24, 2, 6, "#c9c9c9");
      px(g, 25, 14, 2, 14, "#8a5a33"); px(g, 23, 8, 6, 6, "#6b4226"); px(g, 24, 6, 4, 2, "#8a5a33");
      px(g, 24, 9, 1, 2, "#2a1a0a"); px(g, 27, 9, 1, 2, "#2a1a0a");
      return c;
    }
    if (kind === "rakshasa_maharaja") {
      // RAKSHASA MAHARAJA: tiger stripes, peacock turban, pelt cape, claw daggers
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const A=(window.Anim?window.Anim.limb(P):{ld:0,rd:0,lx:0,rx:0,la:0,ra:0,lax:0,rax:0,hx:0,wide:0,crouch:0});
      const hb=(window.Anim?window.Anim.hbob(P):0);
      px(g, 11 + A.lx, 30 + A.ld, 4, 6, "#8a5a33"); px(g, 17 + A.rx, 30 + A.rd, 4, 6, "#8a5a33");
      px(g, 9, 20, 14, 12, tint); px(g, 9, 20, 14, 2, "#ffd93d");
      px(g, 10, 22, 2, 6, "#7a1f1f"); px(g, 14, 22, 2, 6, "#7a1f1f"); px(g, 18, 22, 2, 6, "#7a1f1f");
      px(g, 13, 24, 6, 4, "#ffd93d"); px(g, 14, 25, 4, 2, "#c93b3b");
      px(g, 4, 16, 4, 14, "#c96a1a"); px(g, 4, 16, 4, 2, "#ffd93d");
      px(g, 9 + A.hx, 9 + hb, 14, 11, tint);
      px(g, 9 + A.hx, 9 + hb, 14, 2, "#7a1f1f"); px(g, 11 + A.hx, 11 + hb, 1, 6, "#7a1f1f"); px(g, 15 + A.hx, 11 + hb, 1, 6, "#7a1f1f"); px(g, 20 + A.hx, 11 + hb, 1, 6, "#7a1f1f");
      g.fillStyle = "#ffe14d"; g.fillRect(12 + A.hx, 13 + hb, 3, 2); g.fillRect(18 + A.hx, 13 + hb, 3, 2);
      g.fillStyle = "#111"; g.fillRect(13 + A.hx, 13 + hb, 1, 2); g.fillRect(19 + A.hx, 13 + hb, 1, 2);
      g.fillStyle = "#fff"; g.fillRect(12 + A.hx, 17 + hb, 2, 1); g.fillRect(18 + A.hx, 17 + hb, 2, 1);
      px(g, 8 + A.hx, 3 + hb, 16, 6, "#2a9a5a"); px(g, 8 + A.hx, 3 + hb, 16, 2, "#ffd93d");
      px(g, 14 + A.hx, 0 + hb, 4, 4, "#2a6a9a"); px(g, 15 + A.hx, 0 + hb, 2, 2, "#7fd4ff");
      px(g, 4 + A.hx, 8 + hb, 4, 4, "#e8e0d0"); px(g, 24 + A.hx, 8 + hb, 4, 4, "#e8e0d0");
      px(g, 25 + A.rax, 20 + A.ra - (P.atk ? 4 : 0), 2, 8, "#c9ccd4"); px(g, 25 + A.rax, 20 + A.ra - (P.atk ? 4 : 0), 2, 1, "#fff"); px(g, 25 + A.rax, 24 + A.ra - (P.atk ? 4 : 0), 2, 1, "#fff");
      px(g, 6 + A.lax, 22 + A.la, 2, 6, "#c9ccd4"); px(g, 6 + A.lax, 22 + A.la, 2, 1, "#fff"); px(g, 6 + A.lax, 25 + A.la, 2, 1, "#fff");
      return c;
    }
    if (kind === "wyvern_matriarch") {
      // WYVERN MATRIARCH: stitched wings, brood belly, horn circlet, tail barb
      const dk = shade(tint, -35), lite = shade(tint, 25);
      g.fillStyle = dk;
      g.beginPath(); g.moveTo(14, 22); g.lineTo(1, 8); g.lineTo(4, 16); g.lineTo(7, 15); g.lineTo(10, 23); g.fill();
      g.beginPath(); g.moveTo(18, 22); g.lineTo(31, 8); g.lineTo(28, 16); g.lineTo(25, 15); g.lineTo(22, 23); g.fill();
      px(g, 6, 14, 4, 1, "#d9c27f"); px(g, 22, 14, 4, 1, "#d9c27f");
      px(g, 7, 15, 3, 1, "#d9c27f"); px(g, 22, 17, 3, 1, "#d9c27f");
      px(g, 2, 22, 6, 3, tint); px(g, 0, 20, 3, 3, dk); px(g, 0, 19, 4, 2, "#9adc9a");
      px(g, 11, 28, 3, 8, dk); px(g, 18, 28, 3, 8, dk);
      px(g, 10, 15, 12, 15, tint); px(g, 12, 17, 8, 10, lite);
      px(g, 12, 24, 8, 4, "#e8e0d0"); px(g, 13, 25, 2, 2, "#e8c9a0"); px(g, 16, 25, 2, 2, "#e8c9a0"); px(g, 19, 25, 2, 2, "#e8c9a0");
      g.fillStyle = "#ffe14d"; g.fillRect(12, 19, 2, 2); g.fillRect(18, 19, 2, 2);
      g.fillStyle = "#111"; g.fillRect(12, 19, 1, 2); g.fillRect(18, 19, 1, 2);
      px(g, 13, 14, 2, 4, "#8a1a1a");
      px(g, 20, 10, 3, 5, lite);
      g.fillStyle = "#e8e0d0";
      g.beginPath(); g.moveTo(10, 10); g.lineTo(6, 4); g.lineTo(9, 11); g.fill();
      g.beginPath(); g.moveTo(22, 10); g.lineTo(26, 4); g.lineTo(23, 11); g.fill();
      px(g, 9, 9, 2, 2, "#c93b3b"); px(g, 21, 9, 2, 2, "#c93b3b");
      px(g, 14, 28, 4, 1, "#ffd93d");
      return c;
    }
    if (kind === "harpy_matriarch") {
      // HARPY MATRIARCH: vulture ruff, nest crown, cage staff, talon feet
      const dk = shade(tint, -35), lite = shade(tint, 25);
      g.fillStyle = lite;
      g.beginPath(); g.moveTo(14, 22); g.lineTo(2, 10); g.lineTo(5, 17); g.fill();
      g.beginPath(); g.moveTo(18, 22); g.lineTo(30, 10); g.lineTo(27, 17); g.fill();
      px(g, 5, 24, 4, 3, "#7a1f1f"); px(g, 23, 24, 4, 3, "#2a6a9a"); px(g, 12, 26, 8, 3, "#d9a0a0");
      px(g, 11, 28, 3, 8, dk); px(g, 18, 28, 3, 8, dk);
      px(g, 10, 34, 4, 2, "#3a2a1a"); px(g, 18, 34, 4, 2, "#3a2a1a");
      px(g, 10, 15, 12, 13, tint); px(g, 12, 17, 8, 8, lite);
      px(g, 9, 12, 14, 5, "#e8e0d0"); px(g, 10, 13, 12, 3, "#f7f0e0");
      px(g, 11, 6, 10, 8, "#d9a06b");
      g.fillStyle = "#111"; g.fillRect(13, 10, 2, 2); g.fillRect(17, 10, 2, 2);
      px(g, 14, 12, 4, 1, "#7a1f1f"); px(g, 12, 20, 8, 5, "#d9a0a0");
      g.fillStyle = "#fff"; g.fillRect(14, 22, 1, 2); g.fillRect(17, 22, 1, 2);
      px(g, 9, 4, 14, 3, "#5a3a22"); px(g, 12, 2, 3, 3, "#e8e0d0"); px(g, 17, 2, 2, 2, "#e8c9a0"); px(g, 14, 3, 2, 1, "#7fd4ff");
      px(g, 25, 14, 2, 16, "#5a3a22"); px(g, 24, 18, 4, 6, "#8a5a33"); px(g, 25, 19, 2, 4, "#ffd93d");
      return c;
    }
    if (kind === "tengu_stormlord") {
      // TENGU STORMLORD: long nose, pom-pom shawl, war fan, windbag, geta stilts
      const dk = "#1a1a24";
      g.fillStyle = dk;
      g.beginPath(); g.moveTo(14, 22); g.lineTo(2, 10); g.lineTo(5, 17); g.fill();
      g.beginPath(); g.moveTo(18, 22); g.lineTo(30, 10); g.lineTo(27, 17); g.fill();
      px(g, 3, 12, 3, 2, "#c93b3b"); px(g, 26, 12, 3, 2, "#c93b3b");
      px(g, 11, 28, 3, 6, dk); px(g, 18, 28, 3, 6, dk);
      px(g, 10, 34, 5, 2, "#8a5a33"); px(g, 17, 34, 5, 2, "#8a5a33");
      px(g, 10, 15, 12, 14, tint); px(g, 12, 17, 8, 10, "#3a3a4a");
      px(g, 9, 13, 14, 4, "#f2ede2");
      px(g, 10, 13, 2, 2, "#f2ede2"); px(g, 13, 13, 2, 2, "#f2ede2"); px(g, 16, 13, 2, 2, "#f2ede2"); px(g, 19, 13, 2, 2, "#f2ede2");
      px(g, 11, 7, 10, 9, "#d9a06b");
      px(g, 14, 10, 5, 4, "#c98a5a"); px(g, 17, 11, 3, 3, "#b07a4a");
      g.fillStyle = "#ffe14d"; g.fillRect(12, 9, 2, 2); g.fillRect(18, 9, 2, 2);
      g.fillStyle = "#111"; g.fillRect(12, 9, 1, 2); g.fillRect(18, 9, 1, 2);
      px(g, 12, 6, 8, 3, "#c93b3b"); px(g, 8, 5, 3, 3, "#ffd93d"); px(g, 21, 5, 3, 3, "#ffd93d");
      px(g, 25, 16, 3, 10, "#e8e0d0"); px(g, 25, 18, 3, 5, "#c93b3b"); px(g, 26, 19, 1, 3, "#ffd93d");
      px(g, 4, 18, 3, 10, "#7a6a4a"); px(g, 4, 18, 3, 2, "#9a8a5a");
      return c;
    }
    if (kind === "minotaur_warlord") {
      // MINOTAUR WARLORD: broken-horn gold cap, nose-chain, labyrinth tattoo, trophy belt
      const dk = shade(tint, -40);
      px(g, 8, 30, 6, 6, dk); px(g, 18, 30, 6, 6, dk);
      px(g, 6, 18, 8, 13, tint); px(g, 18, 18, 8, 13, tint);
      px(g, 9, 14, 14, 17, dk); px(g, 11, 16, 10, 13, tint);
      px(g, 12, 20, 8, 6, "#2a4a9a"); px(g, 13, 21, 6, 1, "#7fb0ff"); px(g, 14, 22, 1, 4, "#7fb0ff"); px(g, 17, 22, 1, 4, "#7fb0ff");
      px(g, 10, 28, 12, 3, "#3a2a1a");
      px(g, 11, 28, 3, 3, "#e8e4d8"); px(g, 15, 28, 3, 3, "#e8e4d8"); px(g, 19, 28, 2, 3, "#e8e4d8");
      g.fillStyle = "#111"; g.fillRect(12, 29, 1, 1); g.fillRect(16, 29, 1, 1);
      px(g, 11 + A.hx, 6 + hb, 10, 9, tint);
      g.fillStyle = "#e8e0d0"; g.beginPath(); g.moveTo(11, 7); g.lineTo(3, -1); g.lineTo(8, 10); g.fill();
      g.fillStyle = "#c9b98a"; g.beginPath(); g.moveTo(21, 7); g.lineTo(26, 1); g.lineTo(24, 10); g.fill();
      px(g, 23, 1, 4, 3, "#ffd93d");
      px(g, 13, 11, 6, 4, "#d9a0a0"); px(g, 15, 13, 2, 1, "#7a1f1f");
      g.fillStyle = "#ffe14d"; g.fillRect(12 + A.hx, 9 + hb, 3, 2); g.fillRect(18, 9, 2, 2);
      g.fillStyle = "#111"; g.fillRect(13, 9, 1, 2); g.fillRect(19, 9, 1, 2);
      px(g, 13, 15, 6, 1, "#7a1f1f"); px(g, 14, 15, 1, 2, "#ffd93d"); px(g, 17, 15, 1, 2, "#ffd93d");
      px(g, 25, 14, 3, 16, "#8a5a33"); px(g, 22, 12, 8, 3, "#c9ccd4"); px(g, 22, 12, 8, 1, "#fff");
      px(g, 4, 12, 6, 3, "#8a5a33"); px(g, 4, 12, 2, 8, "#5a3a22");
      return c;
    }
    if (kind === "oni_daimyo") {
      // ONI DAYMYO: crescent helm, tiger pelt, belly face, studded kanabo
      const dk = shade(tint, -40);
      px(g, 8, 30, 6, 6, dk); px(g, 18, 30, 6, 6, dk);
      px(g, 9, 22, 14, 9, "#e8a020"); px(g, 9, 24, 2, 5, "#111"); px(g, 13, 24, 2, 5, "#111"); px(g, 17, 24, 2, 5, "#111"); px(g, 21, 24, 2, 5, "#111");
      px(g, 9, 16, 14, 8, tint);
      px(g, 12, 22, 8, 4, "#f2d0a0"); g.fillStyle = "#111"; g.fillRect(13, 23, 2, 2); g.fillRect(17, 23, 2, 2);
      px(g, 14, 26, 4, 1, "#7a1f1f");
      px(g, 10, 6, 12, 11, tint);
      px(g, 10, 2, 3, 5, "#ffd93d"); px(g, 19, 2, 3, 5, "#ffd93d");
      px(g, 9, 4, 14, 5, "#1a1a24"); px(g, 9, 4, 14, 1, "#ffd93d");
      px(g, 13, 0, 6, 3, "#ffd93d"); px(g, 14, 0, 4, 1, "#fff2b0");
      g.fillStyle = "#ffe14d"; g.fillRect(12, 10, 3, 2); g.fillRect(18, 10, 3, 2);
      g.fillStyle = "#111"; g.fillRect(13, 10, 1, 2); g.fillRect(19, 10, 1, 2);
      px(g, 13, 14, 6, 2, "#fff"); px(g, 14, 14, 1, 2, "#7a1f1f"); px(g, 17, 14, 1, 2, "#7a1f1f");
      px(g, 25, 16, 3, 12, "#5a3a22"); px(g, 23, 11, 7, 6, "#7a7a88");
      px(g, 24, 12, 1, 1, "#fff"); px(g, 26, 14, 1, 1, "#fff"); px(g, 24, 15, 1, 1, "#fff");
      px(g, 4, 16, 3, 12, "#1a1a24"); px(g, 4, 16, 3, 2, "#c93b3b");
      px(g, 6, 28, 3, 4, "#8a5a33"); px(g, 6, 28, 3, 1, "#d9c27f");
      return c;
    }
    if (kind === "jotunn_jarl") {
      // JOTUNN JARL: crystal shoulders, ice-braid beard, frozen hammer, scar
      const dk = shade(tint, -40);
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const A=(window.Anim?window.Anim.limb(P):{ld:0,rd:0,lx:0,rx:0,la:0,ra:0,lax:0,rax:0,hx:0,wide:0,crouch:0});
      const hb=(window.Anim?window.Anim.hbob(P):0);
      px(g, 8 + A.lx, 30 + A.ld, 6, 6, dk); px(g, 18 + A.rx, 30 + A.rd, 6, 6, dk);
      px(g, 2, 10, 7, 8, "#bfe4ff"); px(g, 3, 8, 5, 4, "#e8faff"); px(g, 4, 11, 2, 5, "#fff");
      px(g, 23, 10, 7, 8, "#bfe4ff"); px(g, 24, 8, 5, 4, "#e8faff"); px(g, 27, 11, 2, 5, "#fff");
      px(g, 9, 16, 14, 15, tint); px(g, 11, 18, 10, 11, shade(tint, 20));
      px(g, 6, 18, 20, 8, "#dfe9f2"); px(g, 6, 24, 20, 2, "#9ab8d9");
      px(g, 11 + A.hx, 12 + hb, 10, 5, "#e0f0ff"); px(g, 13 + A.hx, 13 + hb, 2, 3, "#9ab8d9"); px(g, 17 + A.hx, 13 + hb, 2, 3, "#9ab8d9");
      px(g, 11 + A.hx, 6 + hb, 10, 9, tint);
      g.fillStyle = "#ffe14d"; g.fillRect(12 + A.hx, 9 + hb, 3, 2);
      px(g, 18 + A.hx, 9 + hb, 3, 2, "#7a1f1f"); px(g, 18 + A.hx, 8 + hb, 3, 1, "#7a1f1f");
      px(g, 8 + A.hx, 2 + hb, 16, 4, "#d9e8ff"); px(g, 8 + A.hx, 2 + hb, 16, 1, "#fff");
      px(g, 25 + A.rax, 18 + A.ra - (P.atk ? 5 : 0), 3, 12, "#7a8a9a"); px(g, 23 + A.rax, 16 + A.ra - (P.atk ? 5 : 0), 7, 4, "#bfe4ff"); px(g, 24 + A.rax, 17 + A.ra - (P.atk ? 5 : 0), 5, 2, "#fff");
      px(g, 5 + A.lax, 18 + A.la, 3, 10, "#7a8a9a"); px(g, 4 + A.lax, 24 + A.la, 4, 3, "#dfe9f2");
      return c;
    }
    if (kind === "medusa_queen") {
      // MEDUSA QUEEN: striking snake halo, cobra hood, mirror shield, jeweled coils
      const dk = shade(tint, -35), lite = shade(tint, 30);
      const P=(window.Anim?window.Anim.normP(ph):{f:0,moving:false,hurt:false,atk:false,atkKind:"melee",idle:0,t:0});
      const SN=(window.Anim?window.Anim.seg(P,3,1):0);
      px(g, 8, 28, 16, 8, dk); px(g, 10 + SN, 26, 12, 6, tint);
      px(g, 12 + SN, 30, 3, 2, "#ffd93d"); px(g, 18 + SN, 30, 3, 2, "#c93b3b");
      px(g, 11, 14, 10, 14, tint); px(g, 9, 16, 3, 10, lite); px(g, 20, 16, 3, 10, lite);
      px(g, 4, 18, 4, 10, "#c9ccd4"); px(g, 5, 19, 2, 8, "#7fd4ff"); px(g, 5, 19, 2, 2, "#fff");
      px(g, 11, 4, 10, 10, tint);
      px(g, 6, 12, 4, 10, "#2e7d46"); px(g, 22, 12, 4, 10, "#2e7d46");
      // snake mane: 5 stalks with real heads — eyes, jaws, tongues
      for (let _m = 0; _m < 5; _m++) { const sn=(window.Anim?window.Anim.seg(P,_m,1):0); px(g, 8 + _m * 4 + sn, 0, 3, 6, "#2e7d46"); px(g, 8 + _m * 4 + sn, 0, 3, 1, "#7ac97a"); px(g, 7 + _m * 4 + sn, 4, 5, 4, "#2e7d46"); px(g, 8 + _m * 4 + sn, 5, 3, 2, "#1e5a34"); g.fillStyle = "#ffe14d"; g.fillRect(8 + _m * 4 + sn, 5, 1, 1); g.fillRect(10 + _m * 4 + sn, 5, 1, 1); px(g, 9 + _m * 4 + sn, 7 + (P.atk?1:0), 1, 2, "#ff6b6b"); }
      px(g, 8 + SN, 0, 3, 2, "#c93b3b"); px(g, 20 + SN, 0, 3, 2, "#c93b3b");
      g.fillStyle = "#7dff9b"; g.fillRect(13, 8, 2, 2); g.fillRect(18, 8, 2, 2);
      g.fillStyle = "#111"; g.fillRect(13, 8, 1, 2); g.fillRect(18, 8, 1, 2);
      px(g, 15, 12, 2, 1, "#7a1f1f");
      px(g, 9, 20, 3, 4, "#ffd93d"); px(g, 20, 22, 3, 4, "#ffd93d");
      return c;
    }
    if (kind === "naga_raja") {
      // NAGA RAJA: 5-head cobra hood, 4 arms, jeweled chestplate, heavy coils
      const dk = shade(tint, -40), lite = shade(tint, 30);
      px(g, 7, 28, 18, 8, dk); px(g, 9, 26, 14, 6, tint);
      px(g, 9, 30, 4, 2, "#ffd93d"); px(g, 15, 30, 4, 2, "#c93b3b"); px(g, 21, 30, 2, 2, "#ffd93d");
      px(g, 5, 18, 4, 8, tint); px(g, 23, 18, 4, 8, tint);
      px(g, 4, 24, 4, 3, "#ffd93d"); px(g, 24, 24, 3, 8, "#8a5a33"); px(g, 23, 22, 5, 3, "#d9c27f");
      px(g, 11, 14, 10, 14, tint); px(g, 12, 16, 8, 8, "#d9b96a");
      px(g, 14, 18, 4, 4, "#c93b3b"); px(g, 15, 19, 2, 2, "#ffd93d");
      px(g, 6, 6, 20, 9, tint);
      px(g, 4, 8, 4, 6, tint); px(g, 24, 8, 4, 6, tint);
      px(g, 11, 4, 10, 7, tint);
      for (let _n = 0; _n < 5; _n++) { px(g, 6 + _n * 4, 8, 3, 3, lite); g.fillStyle = "#ffe14d"; g.fillRect(7 + _n * 4, 9, 1, 1); }
      px(g, 13, 12, 6, 3, tint);
      g.fillStyle = "#ffe14d"; g.fillRect(14, 12, 2, 2); g.fillRect(17, 12, 1, 2);
      px(g, 27, 12, 2, 6, "#c9ccd4"); px(g, 3, 14, 2, 6, "#ffd93d");
      return c;
    }
    if (kind === "hydra_broodmother") {
      // HYDRA BROODMOTHER: 7-head fan, egg sacs, bone-lotus crown, scarred alpha head
      const dk = shade(tint, -40), lite = shade(tint, 30);
      px(g, 7, 28, 18, 8, dk); px(g, 9, 26, 14, 6, tint);
      px(g, 10, 24, 3, 3, "#e8e0d0"); px(g, 19, 24, 3, 3, "#e8e0d0");
      for (let _h = 0; _h < 7; _h++) {
        const hx = 2 + _h * 4, hy = 10 - ((_h === 2 || _h === 4) ? 3 : (_h === 3 ? 5 : 0));
        px(g, hx, hy + 6, 2, 9, tint); px(g, hx - 1, hy, 5, 7, tint); px(g, hx, hy + 1, 3, 3, lite);
        g.fillStyle = "#ffe14d"; g.fillRect(hx, hy + 3, 1, 1); g.fillRect(hx + 3, hy + 3, 1, 1);
        if (_h === 3) { px(g, hx, hy + 5, 3, 1, "#7a1f1f"); px(g, hx + 3, hy + 3, 1, 1, "#7a1f1f"); px(g, hx, hy + 3, 1, 1, "#c9ccd4"); }
      }
      px(g, 9, 20, 4, 3, "#ff6b6b"); px(g, 19, 20, 4, 3, "#ff6b6b");
      px(g, 10, 6, 3, 3, "#e8e0d0"); px(g, 14, 5, 4, 4, "#ff9dc9"); px(g, 19, 6, 3, 3, "#e8e0d0");
      px(g, 11, 24, 2, 2, "#7fd4ff");
      return c;
    }
    if (kind === "leviathan") {
      // LEVIATHAN: whale-serpent, coral crown, barnacle plates, harpoon scars, spout
      const dk = shade(tint, -40), lite = shade(tint, 30);
      px(g, 4, 26, 22, 8, dk); px(g, 6, 24, 18, 6, tint);
      px(g, 6, 24, 18, 2, lite);
      px(g, 8, 28, 3, 2, "#e8e0d0"); px(g, 14, 28, 3, 2, "#c9c9c9"); px(g, 20, 28, 3, 2, "#e8e0d0");
      px(g, 18, 10, 10, 10, tint); px(g, 19, 11, 8, 3, lite);
      px(g, 20, 16, 8, 5, "#0c1a24"); px(g, 21, 17, 6, 3, "#e8e0d0");
      for (let _t2 = 0; _t2 < 3; _t2++) px(g, 22 + _t2 * 2, 18, 1, 2, "#7a8a9a");
      g.fillStyle = "#ffe14d"; g.fillRect(21, 13, 2, 2); g.fillRect(25, 13, 2, 2);
      g.fillStyle = "#111"; g.fillRect(21, 13, 1, 2); g.fillRect(25, 13, 1, 2);
      px(g, 14, 14, 5, 2, "#7ad9f0"); px(g, 15, 15, 3, 3, "#7ad9f0");
      g.fillStyle = lite; g.beginPath(); g.moveTo(12, 22); g.lineTo(4, 12); g.lineTo(9, 22); g.fill();
      g.beginPath(); g.moveTo(12, 26); g.lineTo(5, 28); g.lineTo(12, 28); g.fill();
      px(g, 10, 4, 3, 5, "#ff8a7a"); px(g, 14, 3, 3, 6, "#ff6b5a"); px(g, 18, 4, 3, 5, "#e8a0a0");
      px(g, 8, 20, 6, 1, "#5a3a22"); px(g, 9, 19, 4, 1, "#8a5a33");
      px(g, 13, 0, 3, 4, "#bfe8ff"); px(g, 14, 0, 1, 2, "#fff");
      return c;
    }
    if (kind === "kitsune_ninetails") {
      // NINE-TAILED KITSUNE: 9-tail fan, mask face, foxfire orbs, priestess robe
      const dk = shade(tint, -35), lite = shade(tint, 25);
      g.fillStyle = tint; g.beginPath(); g.ellipse(5, 22, 5, 7, 0.5, 0, 7); g.fill();
      g.fillStyle = lite; g.beginPath(); g.ellipse(3, 25, 3, 4, 0.5, 0, 7); g.fill();
      g.fillStyle = "#f08a2a"; g.beginPath(); g.ellipse(27, 22, 5, 7, -0.5, 0, 7); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(29, 25, 2, 3, -0.5, 0, 7); g.fill();
      px(g, 6, 14, 3, 6, tint); px(g, 23, 14, 3, 6, tint);
      px(g, 9, 24, 14, 8, "#f2ede2"); px(g, 9, 24, 14, 2, "#c93b3b");
      px(g, 14, 26, 4, 4, "#ffd93d");
      px(g, 6, 26, 19, 6, tint); px(g, 6, 26, 19, 2, lite);
      px(g, 7, 31, 3, 5, dk); px(g, 12, 31, 3, 5, dk); px(g, 18, 31, 3, 5, dk); px(g, 22, 31, 3, 5, dk);
      px(g, 22, 16, 8, 10, tint); px(g, 23, 17, 6, 3, "#fff");
      px(g, 22, 10, 3, 6, tint); px(g, 27, 10, 3, 6, tint); px(g, 23, 11, 1, 3, "#fff"); px(g, 28, 11, 1, 3, "#fff");
      px(g, 23, 16, 6, 8, "#f7f0e0");
      g.fillStyle = "#c93b3b"; g.fillRect(24, 18, 4, 1); g.fillRect(25, 21, 2, 2);
      g.fillStyle = "#111"; g.fillRect(24, 19, 2, 2); g.fillRect(27, 19, 1, 1);
      px(g, 3, 8, 3, 3, "#7fd4ff"); px(g, 1, 10, 2, 2, "#7fd4ff"); px(g, 27, 6, 3, 3, "#7fd4ff");
      px(g, 4, 9, 1, 1, "#fff"); px(g, 28, 7, 1, 1, "#fff");
      px(g, 14, 14, 4, 2, "#ffd93d"); px(g, 15, 13, 2, 1, "#c93b3b");
      return c;
    }
    if (kind === "fenrir_alpha") {
      // FENRIR ALPHA: Gleipnir chain, lava maw, stone shards, blind scar
      const dk = shade(tint, -30);
      px(g, 0, 20, 5, 4, dk); px(g, 0, 18, 3, 4, "#111");
      px(g, 6, 24, 19, 8, tint); px(g, 6, 24, 19, 2, shade(tint, 20));
      px(g, 8, 20, 3, 4, "#5a5a66"); px(g, 14, 18, 3, 5, "#5a5a66"); px(g, 19, 20, 2, 4, "#5a5a66");
      px(g, 7, 31, 3, 5, dk); px(g, 12, 31, 3, 5, dk); px(g, 18, 31, 3, 5, dk); px(g, 22, 31, 3, 5, dk);
      px(g, 22, 10, 3, 6, "#111"); px(g, 27, 10, 3, 6, "#111");
      px(g, 22, 16, 8, 10, tint); px(g, 23, 17, 6, 3, shade(tint, 30));
      px(g, 27, 21, 5, 4, "#3a0f08"); px(g, 28, 22, 3, 2, "#ff7b2e"); px(g, 28, 24, 2, 1, "#ffd93d");
      g.fillStyle = "#fff"; g.fillRect(28, 21, 1, 1); g.fillRect(30, 21, 1, 1);
      g.fillStyle = "#ff3b3b"; g.fillRect(24, 19, 2, 2);
      g.fillStyle = "#111"; g.fillRect(24, 19, 1, 2);
      px(g, 27, 16, 3, 1, "#7a1f1f"); px(g, 27, 15, 1, 3, "#7a1f1f");
      px(g, 8, 26, 16, 2, "#9adcff"); px(g, 10, 26, 2, 2, "#2a6a9a"); px(g, 15, 26, 2, 2, "#2a6a9a"); px(g, 21, 26, 1, 3, "#2a6a9a");
      return c;
    }


    // ---------- generic body families (mythic bestiary) v2 ----------
    // Hell demons (v17 HellMobs looks) render before the generic pass so
    // civilized roles and wild fiends never read as tint-swapped villagers.
    try {
      const dl = (window.HellMobs && window.HellMobs.lookFor) ? window.HellMobs.lookFor(kind) : null;
      if (dl) { drawDemonHell(g, c, kind, dl, tint, seed, ph); return c; }
    } catch (e) { }
    // Bespoke silhouettes above take precedence; anything else dispatches on
    // its CFG template `body`. v2 gives every species 2+ diagnostic traits
    // (ears/tails/props/headgear) so nothing reads as a tint-swap.
    try {
      const tpl = (window.CFG && window.CFG.MOB_TEMPLATES && window.CFG.MOB_TEMPLATES[kind]) || null;
      const handled = { slime: 1, mushroom: 1, bat: 1, wolf: 1, goblin: 1, skeleton: 1, cultist: 1, wraith: 1, boss: 1 };
      const body = tpl && tpl.body;
      if (body && !handled[kind]) {
        const dark = shade(tint, -35), lite = shade(tint, 30), dk2 = shade(tint, -55);
        const H = (s) => hashStr(String(kind) + s);
        const isBossKind = !!(tpl && tpl.boss);
        const eyes = (x, y, w = 2, col) => { g.fillStyle = col || (isBossKind ? "#ff3b3b" : "#ffe14d"); g.fillRect(x, y, w, 2); g.fillStyle = "#111"; g.fillRect(x, y, 1, 2); };
        const crown = (y = 4) => { g.fillStyle = "#ffd93d"; g.fillRect(10, y + 4, 12, 4); for (let i = 0; i < 3; i++) { g.fillRect(10 + i * 5, y, 4, 5); } g.fillStyle = "#fff2b0"; g.fillRect(10, y + 7, 12, 1); g.fillStyle = "#c93b3b"; g.fillRect(15, y + 5, 2, 2); };
        const bossTrim = () => { if (isBossKind) { px(g, 11, 32, 10, 2, "#ffd93d"); } };
        if (body === "blob") {
          // sovereign ooze: glossy mass + seeded buds + crown for royalty
          g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(16, 33, 12, 4, 0, 0, 7); g.fill();
          g.fillStyle = dark; g.beginPath(); g.ellipse(16, 27, 12, 10, 0, 0, 7); g.fill();
          g.fillStyle = tint; g.beginPath(); g.ellipse(16, 25, 11, 8, 0, 0, 7); g.fill();
          g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(11, 20, 4, 3, -0.4, 0, 0, 7); g.fill();
          const buds = 2 + (H("b") % 3);
          for (let i = 0; i < buds; i++) { const bx = 6 + (H(i) % 20); g.fillStyle = lite; g.beginPath(); g.arc(bx, 30 - (i % 2) * 3, 3, 0, 7); g.fill(); }
          g.fillStyle = "#101418"; g.fillRect(11, 24, 3, 5); g.fillRect(19, 24, 3, 5);
          g.fillStyle = "#fff"; g.fillRect(11, 24, 1, 2); g.fillRect(19, 24, 1, 2);
          g.fillStyle = "#101418"; g.fillRect(14, 29, 4, 2);
          if (/sovereign|empress|queen/i.test(String((tpl && tpl.name) || kind))) {
            g.fillStyle = "#ffd93d";
            g.beginPath(); g.moveTo(9, 12); g.lineTo(11, 4); g.lineTo(14, 11); g.lineTo(17, 3); g.lineTo(20, 11); g.lineTo(23, 4); g.lineTo(25, 12); g.fill();
            g.fillStyle = "#fff2b0"; g.fillRect(9, 11, 16, 2);
          }
          if (isBossKind) { g.strokeStyle = "rgba(255,60,60,0.7)"; g.lineWidth = 2; g.beginPath(); g.ellipse(16, 26, 13, 10, 0, 0, 7); g.stroke(); }
          return c;
        }
        if (body === "humanoid") {
          // base: heavy brow, claws — never a villager; per-kind props below
          px(g, 11, 30, 4, 6, dark); px(g, 17, 30, 4, 6, dark);
          px(g, 10, 35, 5, 2, "#222"); px(g, 17, 35, 5, 2, "#222");
          px(g, 9, 20, 14, 12, tint); px(g, 9, 20, 3, 12, lite); px(g, 20, 20, 3, 12, dark);
          px(g, 6, 21, 3, 7, tint); px(g, 23, 21, 3, 7, tint);
          g.fillStyle = lite; g.fillRect(6, 28, 3, 2); g.fillRect(23, 28, 3, 2);
          px(g, 9 + A.hx, 9 + hb, 14, 11, tint); px(g, 10, 10, 12, 3, lite);
          px(g, 9, 12, 14, 3, dark);
          eyes(12, 14); g.fillRect(18, 14, 2, 2); g.fillStyle = "#111"; g.fillRect(19, 14, 1, 2);
          g.fillStyle = "#101418"; g.fillRect(14, 18, 4, 1);
          const K = String(kind);
          if (K === "satyr") { px(g, 5, 2, 4, 8, "#e8e0d0"); px(g, 23, 2, 4, 8, "#e8e0d0"); px(g, 6, 0, 2, 4, "#8a6a4a"); px(g, 24, 0, 2, 4, "#8a6a4a"); px(g, 11, 30, 4, 6, "#3a2a1a"); px(g, 17, 30, 4, 6, "#3a2a1a"); px(g, 13, 24, 6, 4, "#8a5a33"); px(g, 14, 25, 4, 2, "#d9c27f"); }
          else if (K === "kobold") { px(g, 13, 16, 6, 3, dk2); px(g, 15, 17, 2, 2, "#111"); px(g, 4, 8, 4, 4, lite); px(g, 24, 8, 4, 4, lite); px(g, 28, 24, 3, 6, dark); px(g, 14, 2, 4, 4, "#ffd93d"); px(g, 15, 1, 2, 2, "#ff9d2e"); }
          else if (K === "hulder") { px(g, 8, 4, 16, 6, "#f2e3c2"); px(g, 8, 4, 3, 12, "#f2e3c2"); px(g, 21, 4, 3, 12, "#f2e3c2"); px(g, 12, 5, 8, 2, "#d9b96a"); px(g, 26, 26, 3, 8, "#8a5a33"); px(g, 27, 32, 2, 2, dark); px(g, 12, 21, 8, 2, "#3a6a2a"); }
          else if (K === "nokk") { px(g, 7, 4, 5, 14, "#7ad9f0"); px(g, 20, 4, 5, 14, "#7ad9f0"); px(g, 24, 20, 2, 10, "#8a5a33"); px(g, 22, 22, 6, 4, "#6b4226"); px(g, 23, 23, 4, 1, "#d9c27f"); }
          else if (K === "kappa") { px(g, 12, 4, 8, 3, "#2a7a9a"); px(g, 13, 5, 6, 1, "#9adcff"); px(g, 13, 16, 6, 3, "#e8d9a0"); px(g, 8, 20, 3, 6, "#2a5a3a"); px(g, 21, 20, 3, 6, "#2a5a3a"); }
          else if (K === "redcap") { px(g, 9, 2, 14, 7, "#c93b3b"); px(g, 9, 2, 14, 2, "#ff6a6a"); px(g, 10, 35, 5, 2, "#3a2a1a"); px(g, 17, 35, 5, 2, "#3a2a1a"); px(g, 25, 20, 2, 12, "#9aa0a8"); px(g, 24, 30, 4, 2, "#5a3a22"); px(g, 12, 18, 8, 2, "#5a5a5a"); }
          else if (K === "vodyanoy") { px(g, 11, 16, 10, 3, "#0f2a22"); g.fillStyle = "#fff"; g.fillRect(12, 16, 2, 1); g.fillRect(18, 16, 2, 1); px(g, 11, 21, 10, 6, lite); px(g, 7, 2, 4, 6, "#3a6a4a"); px(g, 21, 2, 4, 6, "#3a6a4a"); }
          else if (K === "domovoi_rogue") { px(g, 11, 17, 10, 5, "#c9c9c9"); px(g, 13, 19, 6, 2, "#999"); px(g, 25, 18, 2, 14, "#8a5a33"); px(g, 23, 18, 6, 3, "#a06a3a"); px(g, 10, 3, 12, 4, "#4a3a2a"); }
          else if (K === "rakshasa_cub" || K === "rakshasa_maharaja") { px(g, 9, 12, 2, 8, "#7a1f1f"); px(g, 21, 12, 2, 8, "#7a1f1f"); g.fillStyle = "#fff"; g.fillRect(12, 18, 2, 1); g.fillRect(18, 18, 2, 1); px(g, 4, 8, 4, 4, lite); px(g, 24, 8, 4, 4, lite); if (K === "rakshasa_maharaja") { crown(0); px(g, 25, 20, 2, 10, "#ffd93d"); px(g, 4, 16, 4, 14, "#5c1216"); } }
          else if (K === "bandit") { px(g, 8, 0, 16, 5, "#3a2e22"); px(g, 10, 12, 12, 3, "#1c1c22"); px(g, 9, 24, 14, 2, "#5c1216"); px(g, 25, 20, 2, 8, "#9aa0a8"); }
          else if (K === "outlaw") { px(g, 6, 5, 20, 3, "#2e2620"); px(g, 10, 0, 12, 6, "#2e2620"); px(g, 9, 20, 14, 5, "#4a3a52"); px(g, 25, 20, 2, 8, "#9aa0a8"); }
          else if (K === "murderer") { px(g, 8, 2, 16, 9, "#3a0f14"); px(g, 8, 2, 3, 14, "#3a0f14"); px(g, 21, 2, 3, 14, "#3a0f14"); px(g, 11, 9, 10, 5, "#0c0a12"); g.fillStyle = "#ff3b3b"; g.fillRect(12, 10, 2, 2); g.fillRect(18, 10, 2, 2); px(g, 25, 20, 2, 8, "#c9ccd4"); }
          else if (K === "goblin_shaman" || K === "goblin_king") { g.fillStyle = tint; g.beginPath(); g.moveTo(10, 12); g.lineTo(1, 8); g.lineTo(4, 15); g.fill(); g.beginPath(); g.moveTo(22, 12); g.lineTo(31, 8); g.lineTo(28, 15); g.fill(); px(g, 25, 18, 2, 10, "#5a3a22"); px(g, 24, 14, 4, 5, lite); if (K === "goblin_king") { crown(0); px(g, 4, 16, 4, 16, "#5c1216"); px(g, 13, 24, 6, 4, "#6b4226"); } else { px(g, 13, 2, 6, 5, "#d9c27f"); px(g, 15, 0, 2, 4, "#c93b3b"); } }
          else if (K === "cultist_hierophant") { px(g, 11, 0, 10, 8, "#2a1040"); px(g, 13, 1, 6, 3, "#ffd93d"); px(g, 9, 24, 14, 2, "#ffd93d"); px(g, 25, 14, 2, 14, "#5a3a22"); px(g, 24, 10, 4, 5, "#c77dff"); px(g, 14, 25, 4, 4, "#c77dff"); }
          else if (K === "baba_yaga") { px(g, 8, 4, 16, 6, "#7a2b2b"); px(g, 8, 4, 3, 14, "#7a2b2b"); px(g, 21, 4, 3, 14, "#7a2b2b"); px(g, 11, 17, 10, 4, "#c9c9c9"); px(g, 13, 24, 3, 3, "#e8e4d8"); px(g, 17, 24, 3, 3, "#e8e4d8"); px(g, 25, 20, 2, 12, "#8a5a33"); }
          else { const hs = H("") % 3; if (hs === 0) { g.fillStyle = lite; g.beginPath(); g.moveTo(9, 9); g.lineTo(3, 1); g.lineTo(7, 11); g.fill(); g.beginPath(); g.moveTo(23, 9); g.lineTo(29, 1); g.lineTo(25, 11); g.fill(); } else if (hs === 1) { px(g, 4, 8, 5, 2, lite); px(g, 23, 8, 5, 2, lite); } else { px(g, 13, 2, 6, 6, lite); } }
          bossTrim(); if (isBossKind && K !== "goblin_king" && K !== "rakshasa_maharaja") crown(0);
          return c;
        }
        if (body === "brute") {
          px(g, 8, 30, 6, 6, dark); px(g, 18, 30, 6, 6, dark);
          px(g, 6, 18, 8, 13, tint); px(g, 18, 18, 8, 13, tint);
          px(g, 7, 29, 6, 4, lite); px(g, 19, 29, 6, 4, lite);
          px(g, 9, 14, 14, 17, dark); px(g, 11, 16, 10, 13, tint);
          px(g, 11 + A.hx, 6 + hb, 10, 9, tint);
          const K = String(kind);
          if (K === "cyclops_whelp" || K === "cyclops" ) { g.fillStyle = "#ffe14d"; g.fillRect(14, 9, 4, 4); g.fillStyle = "#111"; g.fillRect(15, 10, 2, 2); px(g, 11, 6, 10, 2, dk2); px(g, 25, 20, 3, 10, "#6b4226"); px(g, 25, 18, 5, 3, "#888"); }
          else { eyes(13, 9); g.fillRect(18, 9, 2, 2); g.fillStyle = "#111"; g.fillRect(19, 9, 1, 2); }
          if (K === "minotaur_calf" || K === "minotaur_warlord") { g.fillStyle = "#e8e0d0"; g.beginPath(); g.moveTo(11, 7); g.lineTo(4, -1); g.lineTo(8, 10); g.fill(); g.beginPath(); g.moveTo(21, 7); g.lineTo(28, -1); g.lineTo(24, 10); g.fill(); px(g, 13, 11, 6, 4, "#d9a0a0"); px(g, 15, 13, 2, 1, "#7a1f1f"); if (K === "minotaur_warlord") { px(g, 25, 14, 3, 16, "#8a5a33"); px(g, 22, 12, 8, 3, "#c9ccd4"); crown(0); } }
          else if (K === "oni_imp" || K === "oni_daimyo") { px(g, 10, 2, 3, 5, "#ffd93d"); px(g, 19, 2, 3, 5, "#ffd93d"); px(g, 25, 16, 3, 12, "#5a3a22"); px(g, 24, 12, 5, 5, "#7a7a88"); px(g, 12, 22, 8, 4, "#e8c020"); px(g, 12, 22, 2, 4, "#111"); px(g, 18, 22, 2, 4, "#111"); if (K === "oni_daimyo") { crown(0); px(g, 4, 16, 4, 14, "#1a1a24"); } }
          else if (K === "troll_whelp") { px(g, 14, 10, 4, 3, "#8a9a6a"); px(g, 12, 20, 3, 3, "#6a8a4a"); px(g, 18, 24, 3, 3, "#6a8a4a"); px(g, 5, 4, 6, 4, "#4a6a3a"); }
          else if (K === "leshy") { px(g, 6, 2, 4, 8, "#4a2f1a"); px(g, 22, 2, 4, 8, "#4a2f1a"); px(g, 8, 4, 3, 4, "#3a6a2a"); px(g, 21, 4, 3, 4, "#3a6a2a"); px(g, 12, 18, 8, 6, "#2f4a1f"); px(g, 12, 16, 8, 1, "#7dd68a"); }
          else if (K === "jotunn_jarl") { px(g, 11, 12, 10, 5, "#e0f0ff"); px(g, 12, 14, 8, 2, "#9ab8d9"); px(g, 8, 2, 16, 4, "#d9e8ff"); px(g, 25, 18, 3, 12, "#7a8a9a"); px(g, 5, 18, 3, 10, "#7a8a9a"); crown(0); }
          else if (K !== "cyclops_whelp") { px(g, 11, 2, 10, 4, "#e8e0d0"); }
          px(g, 13, 24, 6, 2, "#101418");
          bossTrim(); if (isBossKind && K !== "minotaur_warlord" && K !== "oni_daimyo" && K !== "jotunn_jarl") crown(0);
          return c;
        }
        if (body === "beast") {
          const K = String(kind);
          if (K === "velociraptor") {
            px(g, 2, 18, 8, 3, dark); px(g, 1, 16, 3, 4, dark);
            px(g, 12, 26, 4, 6, dark); px(g, 18, 26, 4, 6, dark); px(g, 12, 31, 4, 2, "#222"); px(g, 18, 31, 4, 1, "#c9ccd4");
            px(g, 11, 16, 10, 12, tint); px(g, 11, 16, 10, 2, lite);
            px(g, 9, 24, 2, 5, tint); px(g, 21, 24, 2, 5, tint);
            px(g, 15, 8, 10, 8, tint); px(g, 16, 9, 8, 3, lite); px(g, 22, 12, 5, 4, "#e8d9b8"); px(g, 25, 13, 2, 2, "#111");
            eyes(18, 10);
            px(g, 11, 18, 3, 6, lite);
            return c;
          }
          if (K === "centaur_foal") {
            px(g, 2, 24, 4, 3, dark); px(g, 4, 26, 17, 6, tint); px(g, 4, 26, 17, 2, lite);
            px(g, 5, 31, 3, 5, dark); px(g, 10, 31, 3, 5, dark); px(g, 15, 31, 3, 5, dark);
            px(g, 18, 12, 6, 12, tint); px(g, 14, 14, 4, 6, tint); px(g, 23, 18, 3, 6, "#d9a06b");
            px(g, 17, 6, 8, 8, "#d9a06b"); px(g, 18, 7, 6, 2, "#8a5a33");
            eyes(19, 9); g.fillRect(22, 9, 1, 1);
            px(g, 24, 16, 2, 10, "#8a5a33");
            return c;
          }
          // generic quadruped with species ears/tails
          const longSnout = (K === "sobek_spawn" || K === "anubite" || K === "fenrir_pup" || K === "fenrir_alpha");
          px(g, 1, 20, 3, 4, dark); px(g, 0, 22, 5, 3, dark);
          if (K === "kitsune_trickster" || K === "kitsune_ninetails") { g.fillStyle = tint; g.beginPath(); g.ellipse(5, 22, 5, 6, 0.5, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(3, 25, 2, 3, 0.5, 0, 7); g.fill(); if (K === "kitsune_ninetails") { g.fillStyle = "#f08a2a"; g.beginPath(); g.ellipse(8, 18, 4, 5, -0.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(10, 24, 4, 5, 0.4, 0, 7); g.fill(); g.fillStyle = "#fff"; g.fillRect(2, 16, 3, 2); g.fillRect(8, 14, 3, 2); crown(0); } }
          if (K === "sobek_spawn") { px(g, 0, 24, 8, 5, dark); for (let i = 0; i < 4; i++) px(g, 8 + i * 4, 22, 2, 2, lite); }
          if (K === "lamassu_cub") { g.fillStyle = lite; g.beginPath(); g.moveTo(12, 24); g.lineTo(2, 12); g.lineTo(8, 22); g.fill(); g.beginPath(); g.moveTo(14, 24); g.lineTo(4, 10); g.lineTo(10, 22); g.fill(); }
          px(g, 6, 24, 19, 8, tint); px(g, 6, 24, 19, 2, lite);
          if (K === "chimera_cub") { px(g, 8, 22, 6, 4, "#e8c020"); px(g, 6, 12, 4, 6, "#e8e0d0"); px(g, 27, 22, 3, 8, "#2e7d46"); px(g, 28, 28, 3, 3, tint); }
          if (K === "sphinx_cub" || K === "lamassu_cub") { px(g, 20, 12, 10, 4, "#2a6a9a"); px(g, 20, 12, 2, 10, "#2a6a9a"); px(g, 28, 12, 2, 10, "#2a6a9a"); px(g, 21, 13, 8, 2, "#ffd93d"); }
          if (K === "kelpie") { px(g, 8, 20, 12, 3, "#7ad9f0"); px(g, 6, 24, 3, 6, "#2a6a7a"); }
          if (K === "wild_horse") { px(g, 22, 8, 4, 10, "#3a2415"); px(g, 23, 12, 2, 8, "#111"); px(g, 8, 24, 10, 3, "#a02040"); px(g, 0, 20, 3, 6, "#3a2415"); }
          if (K === "stable_pony") { px(g, 22, 8, 4, 10, "#3a5a2a"); px(g, 23, 12, 2, 8, "#111"); px(g, 8, 24, 10, 3, "#5da24a"); px(g, 8, 24, 10, 1, "#d0f0b0"); px(g, 0, 20, 3, 6, "#3a5a2a"); }
          if (K === "stable_courser") { px(g, 22, 8, 4, 10, "#1a2a4a"); px(g, 23, 12, 2, 8, "#111"); px(g, 8, 24, 10, 3, "#3a6ad9"); px(g, 8, 24, 10, 1, "#b0d0ff"); px(g, 0, 20, 3, 6, "#1a2a4a"); }
          if (K === "stable_destrier") { px(g, 22, 8, 4, 10, "#4a0f0f"); px(g, 23, 12, 2, 8, "#111"); px(g, 8, 24, 10, 3, "#a02020"); px(g, 8, 24, 10, 1, "#ffd93d"); px(g, 0, 20, 3, 6, "#4a0f0f"); }
          if (K === "stable_zephyr") { px(g, 22, 8, 4, 10, "#5a6a7a"); px(g, 23, 12, 2, 8, "#111"); px(g, 8, 24, 10, 3, "#9adcff"); px(g, 8, 24, 10, 1, "#ffffff"); px(g, 0, 20, 3, 6, "#5a6a7a"); }
          if (K === "stable_aegis") { px(g, 22, 8, 4, 10, "#2a0a3a"); px(g, 23, 12, 2, 8, "#111"); px(g, 8, 24, 10, 3, "#6a2a8a"); px(g, 8, 24, 10, 1, "#ffd93d"); px(g, 0, 20, 3, 6, "#2a0a3a"); }
          if (K === "cinder_steed") { px(g, 22, 8, 4, 10, "#ff7b2e"); px(g, 23, 8, 2, 8, "#ffd93d"); px(g, 8, 24, 10, 3, "#5c1216"); px(g, 0, 20, 3, 6, "#ff7b2e"); px(g, 7, 31, 3, 2, "#ff9d2e"); px(g, 22, 31, 3, 2, "#ff9d2e"); }
          if (K === "magma_tortoise") { px(g, 6, 22, 19, 6, "#3a1210"); px(g, 9, 20, 13, 5, "#7a2a1a"); px(g, 12, 21, 2, 3, "#ff7b2e"); px(g, 17, 21, 2, 3, "#ffd93d"); px(g, 21, 21, 2, 3, "#ff7b2e"); px(g, 1, 26, 5, 3, "#7a2a1a"); px(g, 26, 26, 5, 3, "#7a2a1a"); }
          if (K === "cinder_maw") { px(g, 27, 21, 5, 4, "#3a0f08"); px(g, 28, 22, 3, 2, "#ff7b2e"); px(g, 8, 24, 10, 2, "#ff9d2e"); px(g, 22, 12, 3, 5, "#ff7b2e"); }
          if (K === "mire_lurker") { px(g, 8, 20, 12, 3, "#2a4a3a"); px(g, 6, 24, 3, 6, "#4a6a2a"); px(g, 10, 22, 4, 2, "#9adc9a"); }
          if (K === "tide_turtle") { px(g, 6, 22, 19, 6, "#2a5a42"); px(g, 9, 20, 13, 5, "#4a9a72"); px(g, 12, 21, 2, 2, "#d9e8c9"); px(g, 16, 21, 2, 2, "#d9e8c9"); px(g, 20, 21, 2, 2, "#d9e8c9"); px(g, 1, 26, 5, 3, "#3a7a5a"); px(g, 26, 26, 5, 3, "#3a7a5a"); }
          if (K === "coral_crab") { px(g, 22, 18, 8, 6, "#c94a3a"); px(g, 28, 20, 4, 4, "#e06a5a"); px(g, 0, 20, 4, 4, "#c94a3a"); px(g, 9, 22, 13, 3, "#ff8a7a"); }
          if (K === "tanuki") { px(g, 6, 24, 19, 2, "#3a2a1a"); px(g, 3, 20, 5, 5, dark); px(g, 3, 20, 5, 1, "#c9c9c9"); px(g, 3, 23, 5, 1, "#c9c9c9"); }
          px(g, 7, 31, 3, 5, dark); px(g, 12, 31, 3, 5, dark); px(g, 18, 31, 3, 5, dark); px(g, 22, 31, 3, 5, dark);
          px(g, 22, 16, 8, 10, tint); px(g, 23, 17, 6, 3, lite);
          if (K === "anubite") { px(g, 22, 8, 3, 8, "#111"); px(g, 27, 8, 3, 8, "#111"); px(g, 22, 8, 3, 2, "#ffd93d"); px(g, 23, 20, 6, 3, "#ffd93d"); px(g, 22, 12, 8, 2, "#111"); }
          else if (K === "sphinx_cub" || K === "lamassu_cub") { px(g, 23, 18, 6, 6, "#d9a06b"); px(g, 24, 21, 2, 2, "#111"); px(g, 27, 21, 2, 2, "#111"); }
          else if (K === "kitsune_trickster" || K === "kitsune_ninetails") { px(g, 22, 10, 3, 6, tint); px(g, 27, 10, 3, 6, tint); px(g, 23, 11, 1, 3, "#fff"); }
          else if (K === "puca" || K === "fenrir_alpha") { px(g, 22, 10, 3, 6, "#111"); px(g, 27, 10, 3, 6, "#111"); }
          else { px(g, 22, 12, 3, 5, lite); px(g, 27, 12, 3, 5, lite); }
          if (longSnout) { px(g, 27, 21, 5, 4, K === "sobek_spawn" ? "#7aa07a" : "#d9c9b8"); px(g, 30, 22, 2, 2, "#111"); }
          else { px(g, 27, 21, 4, 3, "#e8d9c0"); px(g, 29, 22, 2, 1, "#111"); }
          if (K === "fenrir_alpha" || K === "anubite") eyes(24, 19, 2, "#ff3b3b"); else eyes(24, 19, 2);
          if (K === "kelpie" || K === "puca") { g.fillStyle = "#7ad9f0"; g.fillRect(24, 19, 1, 1); }
          if (isBossKind) { if (K === "fenrir_alpha") { px(g, 8, 26, 16, 2, "#888"); px(g, 12, 26, 2, 3, "#555"); } else crown(2); }
          return c;
        }
        if (body === "winged") {
          const K = String(kind);
          // fallback beat for kinds with no dedicated painter: wingtips rise
          // on the upbeat while moving (dedicated painters do fancier work).
          let wfl = 0;
          try { if (window.Anim && window.Anim.flap) wfl = Math.round((window.Anim.flap(window.Anim.normP(ph)) || 0) * 3); } catch (e) { wfl = 0; }
          // broad side wings (readable at 32px) + perched body
          const feather = !(K === "lesser_wyvern" || K === "wyvern_fledgling" || K === "wyvern_matriarch" || K === "tengu_crow" || K === "tengu_stormlord");
          g.fillStyle = feather ? lite : dark;
          g.beginPath(); g.moveTo(14, 22); g.lineTo(1, 10 - wfl); g.lineTo(3, 17); g.lineTo(6, 16); g.lineTo(9, 23); g.fill();
          g.beginPath(); g.moveTo(18, 22); g.lineTo(31, 10 - wfl); g.lineTo(29, 17); g.lineTo(26, 16); g.lineTo(23, 23); g.fill();
          g.fillStyle = tint; g.fillRect(3, 12, 3, 2); g.fillRect(26, 12, 3, 2);
          px(g, 11, 28, 3, 8, dark); px(g, 18, 28, 3, 8, dark);
          px(g, 11, 34, 3, 2, "#222"); px(g, 18, 34, 3, 2, "#222");
          px(g, 10, 15, 12, 15, tint); px(g, 12, 17, 8, 10, lite);
          eyes(12, 19); g.fillRect(18, 19, 2, 2); g.fillStyle = "#111"; g.fillRect(19, 19, 1, 2);
          if (K === "harpy") { px(g, 9, 6, 14, 8, "#e8b060"); px(g, 12, 20, 8, 5, "#d9a0a0"); g.fillStyle = "#fff"; g.fillRect(14, 22, 1, 2); g.fillRect(17, 22, 1, 2); }
          else if (K === "siren") { px(g, 9, 6, 14, 5, "#e8f0ff"); px(g, 9, 6, 3, 10, "#e8f0ff"); px(g, 20, 6, 3, 10, "#e8f0ff"); px(g, 12, 22, 8, 3, "#a02040"); px(g, 10, 28, 12, 4, "#2a6a7a"); g.fillStyle = "#fff"; g.fillRect(14, 22, 1, 1); g.fillRect(17, 22, 1, 1); }
          else if (K === "stymphalian") { px(g, 14, 22, 4, 4, "#e8a020"); px(g, 12, 6, 8, 4, "#8a6a1a"); px(g, 10, 26, 12, 2, "#8a6a1a"); g.fillStyle = "#fff"; g.fillRect(5, 12, 4, 1); g.fillRect(23, 12, 4, 1); }
          else if (K === "valkyrie_renegade") { px(g, 9, 4, 14, 6, "#a0a8b8"); px(g, 9, 4, 14, 2, "#fff"); px(g, 4, 2, 4, 6, "#fff"); px(g, 24, 2, 4, 6, "#fff"); px(g, 25, 18, 2, 12, "#c9ccd4"); px(g, 5, 18, 3, 8, "#7a8a9a"); }
          else if (K === "tengu_crow" || K === "tengu_stormlord") { px(g, 14, 22, 4, 4, "#e8a020"); if (K === "tengu_stormlord") { px(g, 12, 8, 8, 3, "#c93b3b"); px(g, 8, 6, 3, 3, "#ffd93d"); px(g, 21, 6, 3, 3, "#ffd93d"); } else { px(g, 12, 8, 8, 3, "#111"); } }
          else if (K === "lesser_wyvern" || K === "wyvern_fledgling" || K === "wyvern_matriarch") { px(g, 2, 22, 5, 3, tint); px(g, 0, 20, 3, 3, dark); px(g, 14, 23, 4, 3, "#fff"); px(g, 20, 10, 3, 5, lite); if (K === "wyvern_matriarch") { crown(2); px(g, 12, 26, 8, 2, "#ffd93d"); } }
          else { px(g, 14, 23, 4, 3, "#e8a020"); }
          if (isBossKind && K !== "wyvern_matriarch") crown(2);
          return c;
        }
        if (body === "serpent") {
          const K = String(kind);
          const royal = (K === "medusa_queen" || K === "naga_raja" || K === "hydra_broodmother");
          if (K === "naga" || K === "naga_raja" || K === "medusa_queen") {
            px(g, 8, 28, 16, 8, dark); px(g, 10, 26, 12, 6, tint);
            px(g, 11, 14, 10, 14, tint); px(g, 9, 16, 3, 10, lite); px(g, 20, 16, 3, 10, lite);
            px(g, 6, 20, 3, 6, tint); px(g, 23, 20, 3, 6, tint); g.fillStyle = lite; g.fillRect(6, 25, 3, 2); g.fillRect(23, 25, 3, 2);
            px(g, 11, 4, 10, 10, tint);
            if (K === "medusa_queen") { for (let i = 0; i < 5; i++) { px(g, 8 + i * 4, 0, 3, 6, "#2e7d46"); px(g, 8 + i * 4, 5, 3, 2, dark); } }
            else { px(g, 9, 2, 3, 6, lite); px(g, 20, 2, 3, 6, lite); }
            eyes(13, 8); g.fillRect(18, 8, 2, 2); g.fillStyle = "#111"; g.fillRect(19, 8, 1, 2);
            g.fillStyle = "#a02020"; g.fillRect(15, 12, 2, 1);
            if (royal) crown(0);
            return c;
          }
          if (K === "hydra_spawn" || K === "hydra_broodmother") {
            const n = (K === "hydra_broodmother") ? 5 : 3;
            px(g, 7, 28, 18, 8, dark); px(g, 9, 26, 14, 6, tint);
            for (let i = 0; i < n; i++) { const hx = 4 + i * 5; const hy = 12 - (i === 1 || i === 3 ? 3 : 0); px(g, hx, hy + 6, 2, 8, tint); px(g, hx - 1, hy, 5, 7, tint); px(g, hx, hy + 1, 3, 3, lite); g.fillStyle = "#ffe14d"; g.fillRect(hx, hy + 3, 1, 1); g.fillRect(hx + 3, hy + 3, 1, 1); }
            if (K === "hydra_broodmother") crown(0);
            return c;
          }
          if (K === "lindworm") { px(g, 4, 26, 20, 8, dark); px(g, 6, 24, 16, 6, tint); px(g, 10, 30, 3, 5, dark); px(g, 16, 30, 3, 5, dark); px(g, 16, 10, 8, 10, tint); px(g, 17, 11, 6, 3, lite); eyes(18, 13); px(g, 22, 16, 5, 3, "#e8d9b8"); px(g, 25, 17, 2, 1, "#111"); g.fillStyle = lite; g.beginPath(); g.moveTo(12, 22); g.lineTo(4, 14); g.lineTo(8, 22); g.fill(); return c; }
          if (K === "tidecaller") { px(g, 11, 12, 10, 16, tint); px(g, 9, 14, 3, 10, lite); px(g, 20, 14, 3, 10, lite); px(g, 12, 8, 8, 8, tint); px(g, 14, 2, 4, 6, "#bfe8ff"); g.fillStyle = "#fff7ae"; g.fillRect(13, 10, 2, 2); g.fillRect(17, 10, 2, 2); g.fillStyle = "#fff7ae"; g.beginPath(); g.moveTo(11, 28); g.lineTo(4, 22); g.lineTo(9, 28); g.fill(); return c; }
          if (K === "deepmaw" || K === "abyss_serpent") { px(g, 8, 28, 16, 8, dark); px(g, 10, 26, 12, 6, tint); px(g, 11, 12, 10, 16, "#0e2a3a"); px(g, 12, 20, 8, 6, "#7a1f2e"); for (let i = 0; i < 3; i++) { px(g, 13 + i * 3, 21, 1, 2, "#fff"); px(g, 13 + i * 3, 24, 1, 2, "#fff"); } px(g, 12, 8, 8, 8, tint); g.fillStyle = "#ffe14d"; g.fillRect(13, 10, 2, 2); g.fillRect(17, 10, 2, 2); if (K === "abyss_serpent") { g.fillStyle = "#7ad9f0"; g.fillRect(15, 14, 2, 4); } return c; }
          if (K === "magma_eel") { px(g, 8, 28, 16, 8, dark); px(g, 10, 26, 12, 6, tint); px(g, 11, 12, 10, 16, tint); px(g, 12, 8, 8, 8, lite); for (let i = 0; i < 4; i++) { px(g, 9 + i * 4, 4, 2, 5, "#ffd93d"); } px(g, 12, 20, 8, 4, "#7a1f0e"); g.fillStyle = "#ffe14d"; g.fillRect(13, 10, 2, 2); g.fillRect(17, 10, 2, 2); g.fillStyle = "#ff7b2e"; g.fillRect(15, 13, 2, 2); return c; }
          if (K === "wreck_eel") { px(g, 8, 28, 16, 8, dark); px(g, 10, 26, 12, 6, tint); px(g, 11, 12, 10, 16, tint); px(g, 10, 22, 3, 3, "#d9c9a0"); px(g, 19, 24, 3, 3, "#d9c9a0"); px(g, 14, 26, 2, 2, "#8a8a92"); px(g, 12, 8, 8, 8, lite); g.fillStyle = "#bfe8ff"; g.fillRect(13, 10, 2, 2); g.fillRect(17, 10, 2, 2); return c; }
          // gorgon default cobra
          px(g, 8, 28, 16, 8, dark); px(g, 10, 26, 12, 6, tint);
          px(g, 12, 28, 3, 3, lite); px(g, 18, 28, 3, 3, lite);
          px(g, 11, 12, 10, 16, tint); px(g, 9, 14, 3, 10, lite); px(g, 20, 14, 3, 10, lite);
          px(g, 12, 8, 8, 8, tint);
          for (let i = 0; i < 4; i++) { px(g, 9 + i * 4, 4, 2, 5, dark); }
          eyes(13, 10); g.fillRect(18, 10, 2, 2); g.fillStyle = "#111"; g.fillRect(19, 10, 1, 2);
          g.fillStyle = "#a02020"; g.fillRect(15, 14, 1, 3); g.fillRect(16, 14, 1, 3);
          return c;
        }
        if (body === "ghost") {
          const K = String(kind);
          g.fillStyle = "rgba(0,0,0,0.15)"; g.beginPath(); g.ellipse(16, 37, 7, 2, 0, 0, 7); g.fill();
          if (K === "yuki_onna") { px(g, 8, 4, 16, 14, "#111"); px(g, 10, 6, 12, 16, "#e0f0ff"); px(g, 12, 10, 8, 8, "#f7d7d7"); g.fillStyle = "#111"; g.fillRect(13, 13, 2, 2); g.fillRect(17, 13, 2, 2); px(g, 15, 17, 2, 1, "#a02040"); px(g, 10, 22, 12, 12, "#e0f0ff"); px(g, 10, 28, 12, 2, "#7ad9f0"); return c; }
          if (K === "banshee" || K === "wraith_sovereign") { const wt = (K === "wraith_sovereign") ? tint : "#c9d9e8"; px(g, 9, 6, 14, 24, wt); px(g, 11, 8, 10, 20, shade(wt, 25)); px(g, 12, 12, 8, 10, "#0c0a12"); if (K === "banshee") { g.fillStyle = "#0c0a12"; g.beginPath(); g.ellipse(16, 18, 3, 4, 0, 0, 7); g.fill(); px(g, 7, 4, 5, 12, "#e8e0d0"); px(g, 20, 4, 5, 12, "#e8e0d0"); px(g, 8, 22, 16, 2, "#8a8a92"); } else { g.fillStyle = "#ff6a6a"; g.fillRect(13, 14, 2, 3); g.fillRect(17, 14, 2, 3); crown(0); } px(g, 10, 28, 3, 8, wt); px(g, 19, 28, 3, 8, wt); return c; }
          if (K === "rusalka") { px(g, 8, 4, 16, 10, "#2a8a5a"); px(g, 10, 6, 12, 4, "#ffd93d"); px(g, 10, 12, 12, 18, tint); px(g, 12, 14, 8, 6, "#0c0a12"); g.fillStyle = "#bfe8ff"; g.fillRect(13, 15, 2, 2); g.fillRect(17, 15, 2, 2); px(g, 10, 28, 3, 8, "#2a8a5a"); px(g, 19, 28, 3, 8, "#2a8a5a"); return c; }
          if (K === "striga") { px(g, 10, 8, 12, 14, tint); px(g, 8, 12, 4, 8, tint); px(g, 20, 12, 4, 8, tint); px(g, 12, 12, 8, 8, "#0c0a12"); g.fillStyle = "#ffe14d"; g.fillRect(13, 14, 2, 3); g.fillRect(17, 14, 2, 3); px(g, 15, 17, 2, 2, "#e8a020"); px(g, 7, 8, 4, 4, "#e8e0d0"); px(g, 21, 8, 4, 4, "#e8e0d0"); return c; }
          if (K === "utukku") { px(g, 8, 8, 16, 20, tint); px(g, 6, 6, 20, 6, "#2a1f3a"); px(g, 12, 12, 8, 8, "#0c0a12"); g.fillStyle = "#c77dff"; g.fillRect(13, 14, 2, 3); g.fillRect(17, 14, 2, 3); px(g, 6, 20, 3, 8, "#2a1f3a"); px(g, 23, 20, 3, 8, "#2a1f3a"); return c; }
          px(g, 10, 8, 12, 22, tint); px(g, 12, 10, 8, 18, lite);
          px(g, 10, 26, 3, 8, dark); px(g, 14, 26, 3, 6, dark); px(g, 19, 26, 3, 8, dark);
          px(g, 12, 12, 8, 8, "#0c0a12");
          g.fillStyle = isBossKind ? "#ff6a6a" : "#bfe8ff"; g.fillRect(13, 14, 2, 3); g.fillRect(17, 14, 2, 3);
          if (isBossKind) crown(0);
          return c;
        }
        if (body === "swarm") {
          const K = String(kind);
          // one big readable beetle + 2 small attendants (never a tiny square)
          const beetle = (bx, by, s, dome, darkC, sun) => { px(g, bx - 3 * s, by, 6 * s, 4 * s, darkC); px(g, bx - 2 * s, by - 2 * s, 4 * s, 3 * s, dome); px(g, bx - 2 * s, by - 2 * s, 4 * s, 1, lite); px(g, bx, by - 2 * s, 1, 5 * s, darkC); for (let l = 0; l < 3; l++) { px(g, bx - 4 * s, by + l * s, 1 * s, 1, darkC); px(g, bx + 3 * s, by + l * s, 1 * s, 1, darkC); } px(g, bx - 1 * s, by - 3 * s, 2 * s, 1 * s, darkC); g.fillStyle = "#ff3b3b"; g.fillRect(bx - 1, by - 2, 1, 1); g.fillRect(bx + 1, by - 2, 1, 1); if (sun) { g.fillStyle = "#ffd93d"; g.beginPath(); g.arc(bx, by - 6 * s, 3, 0, 7); g.fill(); } };
          beetle(16, 24, 2, tint, dark, K === "khepri_beetle");
          beetle(7, 14, 1, lite, dk2, false); beetle(25, 13, 1, lite, dk2, false);
          eyes(15, 20, 1); g.fillRect(17, 20, 1, 1);
          return c;
        }
        if (body === "construct") {
          const K = String(kind);
          if (K === "gasha_skull") { px(g, 8, 8, 16, 14, "#e8e4d8"); px(g, 10, 6, 12, 3, "#fff"); g.fillStyle = "#111"; g.fillRect(11, 12, 5, 6); g.fillRect(17, 12, 5, 6); g.fillStyle = "#ff3b3b"; g.fillRect(13, 14, 1, 2); g.fillRect(19, 14, 1, 2); px(g, 15, 14, 2, 4, "#999"); for (let i = 0; i < 4; i++) g.fillRect(12 + i * 3, 20, 1, 2); px(g, 6, 24, 5, 8, "#e8e4d8"); px(g, 21, 24, 5, 8, "#e8e4d8"); px(g, 4, 4, 4, 4, "#ff9d2e"); px(g, 24, 4, 4, 4, "#ff9d2e"); return c; }
          // nurikabe living wall
          px(g, 5, 8, 22, 24, tint); px(g, 5, 8, 22, 3, lite); px(g, 5, 29, 22, 3, dark);
          px(g, 5, 18, 22, 1, dark); px(g, 11, 8, 1, 24, dark); px(g, 20, 8, 1, 24, dark);
          px(g, 11, 13, 10, 7, "#e8e0d0"); g.fillStyle = "#111"; g.fillRect(13, 15, 2, 3); g.fillRect(17, 15, 2, 3);
          px(g, 14, 24, 4, 2, "#111"); px(g, 3, 20, 2, 6, "#d9c9b0"); px(g, 27, 20, 2, 6, "#d9c9b0");
          return c;
        }
        if (body === "undead") {
          const K = String(kind);
          if (K === "mummy") { px(g, 11, 28, 3, 8, "#c9b98a"); px(g, 18, 28, 3, 8, "#c9b98a"); px(g, 9, 16, 14, 14, "#c9b98a"); for (let i = 0; i < 4; i++) px(g, 9, 18 + i * 3, 14, 1, "#8a7a5a"); px(g, 10, 8, 12, 9, "#c9b98a"); px(g, 10, 8, 12, 2, "#e8e0d0"); g.fillStyle = "#111"; g.fillRect(12, 11, 3, 3); g.fillRect(17, 11, 3, 3); g.fillStyle = "#7fd4ff"; g.fillRect(13, 12, 1, 1); g.fillRect(18, 12, 1, 1); return c; }
          if (K === "jiangshi") { px(g, 9, 2, 14, 6, "#1a1a24"); px(g, 14, 0, 4, 3, "#c93b3b"); px(g, 15, 8, 2, 6, "#ffd93d"); px(g, 16, 12, 1, 2, "#c93b3b"); px(g, 9, 16, 14, 16, "#2a4a6a"); px(g, 13, 16, 6, 16, "#e8e8e8"); px(g, 4, 16, 5, 3, "#2a4a6a"); px(g, 23, 16, 5, 3, "#2a4a6a"); px(g, 10, 8, 12, 8, "#bfe8c9"); g.fillStyle = "#111"; g.fillRect(12, 11, 2, 2); g.fillRect(18, 11, 2, 2); px(g, 11, 28, 4, 8, "#2a4a6a"); px(g, 17, 28, 4, 8, "#2a4a6a"); return c; }
          if (K === "dullahan_herald" || K === "dullahan_lord") { px(g, 11, 14, 10, 18, "#2a2a3a"); px(g, 13, 14, 6, 14, "#3a3a4a"); px(g, 11, 12, 10, 3, "#c9ccd4"); px(g, 6, 28, 6, 4, "#1a1a24"); px(g, 20, 28, 6, 4, "#1a1a24"); px(g, 23, 20, 6, 7, "#d9c9a0"); px(g, 24, 21, 4, 5, "#111"); g.fillStyle = "#7fd4ff"; g.fillRect(24, 23, 1, 2); g.fillRect(27, 23, 1, 2); if (K === "dullahan_lord") { crown(4); px(g, 4, 16, 3, 12, "#5c1216"); } else { px(g, 24, 14, 2, 8, "#9aa0a8"); } return c; }
          if (K === "draugr" || K === "draugr_king" || K === "cursed_pharaoh" || K === "skeleton_warlord") {
            px(g, 11, 30, 3, 6, "#e8e4d8"); px(g, 18, 30, 3, 6, "#e8e4d8");
            px(g, 9, 20, 14, 11, "#3a3a42"); px(g, 11, 20, 10, 11, "#e8e4d8");
            g.fillStyle = "#1a1a1f"; for (let i = 0; i < 3; i++) g.fillRect(12, 22 + i * 3, 8, 1);
            if (K === "cursed_pharaoh") { px(g, 8, 4, 16, 8, "#2a6a9a"); px(g, 8, 4, 4, 14, "#ffd93d"); px(g, 20, 4, 4, 14, "#ffd93d"); px(g, 10, 10, 12, 8, "#d9b96a"); g.fillStyle = "#111"; g.fillRect(12, 12, 3, 3); g.fillRect(17, 12, 3, 3); px(g, 25, 18, 2, 10, "#ffd93d"); px(g, 5, 18, 2, 10, "#ffd93d"); crown(0); }
            else if (K === "skeleton_warlord") { px(g, 10, 8, 12, 10, "#e8e4d8"); px(g, 12, 10, 8, 6, "#1a1a1f"); g.fillStyle = "#ff3b3b"; g.fillRect(13, 12, 2, 3); g.fillRect(18, 12, 2, 3); g.fillStyle = "#e8e0d0"; g.beginPath(); g.moveTo(10, 8); g.lineTo(3, 0); g.lineTo(7, 10); g.fill(); g.beginPath(); g.moveTo(22, 8); g.lineTo(29, 0); g.lineTo(25, 10); g.fill(); px(g, 4, 16, 4, 14, "#5c1216"); px(g, 24, 16, 3, 12, "#9aa0a8"); }
            else { px(g, 10, 8, 12, 10, K === "draugr_king" ? "#9aa09a" : "#e8e4d8"); px(g, 12, 10, 8, 6, "#1a3a2a"); g.fillStyle = K === "draugr_king" ? "#ff3b3b" : "#7fd4ff"; g.fillRect(13, 12, 2, 2); g.fillRect(18, 12, 2, 2); if (K === "draugr_king") { crown(2); px(g, 4, 16, 4, 14, "#2a3a2a"); } else { px(g, 24, 16, 2, 10, "#6a7a6a"); } }
            bossTrim(); return c;
          }
          // fallback risen
          px(g, 11, 30, 3, 6, "#e8e4d8"); px(g, 18, 30, 3, 6, "#e8e4d8");
          px(g, 9, 20, 14, 11, "#3a3a42"); px(g, 11, 20, 10, 11, "#e8e4d8");
          g.fillStyle = "#1a1a1f"; for (let i = 0; i < 3; i++) g.fillRect(12, 22 + i * 3, 8, 1);
          px(g, 10, 8, 12, 10, "#e8e4d8"); px(g, 12, 10, 8, 6, "#1a1a1f");
          g.fillStyle = isBossKind ? "#ff3b3b" : "#7fd4ff"; g.fillRect(14, 12, 2, 2); g.fillRect(18, 12, 2, 2);
          if (isBossKind) crown(0);
          return c;
        }
      }
    } catch (e) { }

    // ---------- humanoid base (player + NPC roles) ----------
    // appearance (skin/hair/eyes/outfit/extras/race) wins; seeds keep old variety.
    let ap = null;
    try { ap = app ? window.Appearance.sanitize(app, kind) : null; } catch (e) { ap = null; }
    const skin = (ap && ap.skin) || ["#f2c89b", "#d9a06b", "#a06b42", "#f7d7b0"][(r() * 4) | 0];
    const hairC = (ap && ap.hairColor) || ["#2e2e2e", "#6b4226", "#d9c27f", "#a03a2e", "#4a4a5a"][(r() * 5) | 0];
    const eyeC = (ap && ap.eyeColor) || "#111";
    const race = (ap && ap.race) || "human";
    const isF = (gen === "female");
    const dark = shade(tint, -40), lite = shade(tint, 25);
    // limb-animation pose for the humanoid rig: legs march, arms swing,
    // head bobs; role headgear + held gear follow the same offsets below.
    const P = (window.Anim ? window.Anim.normP(ph) : { f: 0, moving: false, hurt: false, atk: false, atkKind: "melee", idle: 0, t: 0 });
    const A = (window.Anim ? window.Anim.limb(P) : { ld: 0, rd: 0, la: 0, ra: 0, wide: 0, crouch: 0 });
    const hb = (window.Anim ? window.Anim.hbob(P) : (P.idle ? -1 : 0));
    if (race === "human") {
      // soft ground shadow (portraits get it too — grounds the sprite)
      try { g.fillStyle = "rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(16, 37.5, 8, 1.6, 0, 0, 7); g.fill(); } catch (e) {}
      // hero aura (player only — goddess/peter bar: dawn gold ring + sparkles)
      if (kind === "player") {
        try { g.fillStyle = "rgba(255,214,120,0.14)"; g.beginPath(); g.ellipse(16, 22, 12, 14, 0, 0, 7); g.fill(); } catch (e) {}
        px(g, 3, 18, 1, 1, "#ffe9a0"); px(g, 28, 24, 1, 1, "#fff");
      }
      // legs march (boots + pants) with outline + sole + toe caps + knees
      px(g, 11+A.lx, 30 + A.ld, 4, 6, "#33333e"); px(g, 17+A.rx, 30 + A.rd, 4, 6, "#33333e");
      px(g, 11+A.lx, 30 + A.ld, 1, 6, "rgba(0,0,0,0.35)"); px(g, 20+A.rx, 30 + A.rd, 1, 6, "rgba(0,0,0,0.35)");
      px(g, 12+A.lx, 30 + A.ld, 1, 4, "rgba(255,255,255,0.10)"); px(g, 18+A.rx, 30 + A.rd, 1, 4, "rgba(255,255,255,0.10)");
      px(g, 11+A.lx, 32 + A.ld, 4, 1, "rgba(0,0,0,0.25)"); px(g, 17+A.rx, 32 + A.rd, 4, 1, "rgba(0,0,0,0.25)");
      px(g, 10+A.lx, 36 + A.ld, 6, 1, "#222"); px(g, 10+A.lx, 35 + A.ld, 6, 1, "#4a4a55");
      px(g, 10+A.lx, 35 + A.ld, 2, 1, "#6a6a76");
      px(g, 16+A.rx, 36 + A.rd, 6, 1, "#222"); px(g, 16+A.rx, 35 + A.rd, 6, 1, "#4a4a55");
      px(g, 20+A.rx, 35 + A.rd, 2, 1, "#6a6a76");
      // neck + collar V (role chest panels cover it where they exist)
      px(g, 14+A.hx, 16 + hb, 4, 2, skin); px(g, 14+A.hx, 17 + hb, 4, 1, "rgba(0,0,0,0.25)");
      // torso with shading + side outline + collar shadow
      px(g, 9, 18, 14, 13, tint); px(g, 9, 18, 3, 13, lite); px(g, 20, 18, 3, 13, dark);
      px(g, 9, 18, 1, 13, "rgba(0,0,0,0.35)"); px(g, 22, 18, 1, 13, "rgba(0,0,0,0.35)");
      px(g, 9, 28, 14, 3, "rgba(0,0,0,0.2)");
      px(g, 11, 18, 10, 1, "rgba(255,255,255,0.18)");
      px(g, 10, 18, 3, 1, "rgba(255,255,255,0.15)"); px(g, 19, 18, 3, 1, "rgba(255,255,255,0.12)");
      px(g, 13, 18, 2, 2, dark); px(g, 17, 18, 2, 2, dark);
      px(g, 15, 20, 2, 8, "rgba(0,0,0,0.15)");
      px(g, 15, 22, 2, 1, "#e8e4d8"); px(g, 15, 25, 2, 1, "#e8e4d8"); px(g, 15, 28, 2, 1, "#c9c9d4");
      px(g, 10, 27, 12, 1, "rgba(0,0,0,0.18)");
      // arms swing with outline + cuffs + finger split
      px(g, 6+A.lax, 19 + A.la, 3, 9, tint); px(g, 23+A.rax, 19 + A.ra, 3, 9, tint);
      px(g, 6+A.lax, 19 + A.la, 1, 9, "rgba(0,0,0,0.3)"); px(g, 28+A.rax, 19 + A.ra, 1, 9, "rgba(0,0,0,0.3)");
      px(g, 6+A.lax, 26 + A.la, 3, 1, dark); px(g, 23+A.rax, 26 + A.ra, 3, 1, dark);
      px(g, 6+A.lax, 27 + A.la, 3, 3, skin); px(g, 23+A.rax, 27 + A.ra, 3, 3, skin);
      px(g, 7+A.lax, 27 + A.la, 1, 3, "rgba(0,0,0,0.25)"); px(g, 24+A.rax, 27 + A.ra, 1, 3, "rgba(0,0,0,0.25)");
      // ears ride the nodding head (headgear covers them where it exists)
      px(g, 8+A.hx, 11 + hb, 2, 3, skin); px(g, 22+A.hx, 11 + hb, 2, 3, skin);
      px(g, 8+A.hx, 12 + hb, 1, 1, shade(skin, -25)); px(g, 23+A.hx, 12 + hb, 1, 1, shade(skin, -25));
      // head bobs with jaw shading + cheek
      px(g, 10+A.hx, 6 + hb, 12, 12, skin); px(g, 10+A.hx, 6 + hb, 2, 12, "rgba(255,255,255,0.18)");
      px(g, 10+A.hx, 6 + hb, 1, 12, "rgba(0,0,0,0.25)"); px(g, 21+A.hx, 6 + hb, 1, 12, "rgba(0,0,0,0.25)");
      px(g, 12+A.hx, 15 + hb, 8, 2, "rgba(0,0,0,0.12)");
      px(g, 14+A.hx, 17 + hb, 4, 1, "rgba(0,0,0,0.10)");
      // brows + nose + mouth (masks/hoods draw over where they exist)
      px(g, 11+A.hx, 9 + hb, 4, 1, hairC); px(g, 17+A.hx, 9 + hb, 4, 1, hairC);
      px(g, 15+A.hx, 13 + hb, 2, 2, shade(skin, -20));
      px(g, 15+A.hx, 15 + hb, 2, 1, "#a05a5a");
      px(g, 11+A.hx, 13 + hb, 2, 2, "rgba(255,150,150,0.45)"); px(g, 19+A.hx, 13 + hb, 2, 2, "rgba(255,150,150,0.45)"); // cheek blush
      // eyes with glint (roles with masks/hoods override below)
      g.fillStyle = eyeC; g.fillRect(12+A.hx, 11 + hb, 2, 2); g.fillRect(18+A.hx, 11 + hb, 2, 2);
      g.fillStyle = "#fff"; g.fillRect(12+A.hx, 11 + hb, 1, 1); g.fillRect(18+A.hx, 11 + hb, 1, 1);
    } else if (race === "werewolf") {
      // nightdweller: tall ears, cheek spikes, muzzle + fangs, fur collar,
      // clawed hands, paw feet, bushy tail peeking out at the left.
      const fur = skin, furD = shade(skin, -32), furL = shade(skin, 32);
      // ears ride the nodding head (poking past most headgear)
      px(g, 7+A.hx, 2 + hb, 4, 5, fur); px(g, 8+A.hx, 0 + hb, 2, 3, fur); px(g, 8+A.hx, 3 + hb, 2, 4, furD);
      px(g, 21+A.hx, 2 + hb, 4, 5, fur); px(g, 22+A.hx, 0 + hb, 2, 3, fur); px(g, 22+A.hx, 3 + hb, 2, 4, furD);
      px(g, 8+A.hx, 1 + hb, 2, 2, furL); px(g, 22+A.hx, 1 + hb, 2, 2, furL); // ear tuft glint
      // legs lope + wide paws
      px(g, 11+A.lx, 30 + A.ld, 4, 6, fur); px(g, 17+A.rx, 30 + A.rd, 4, 6, fur);
      px(g, 10+A.lx, 35 + A.ld, 6, 2, furD); px(g, 16+A.rx, 35 + A.rd, 6, 2, furD);
      px(g, 10+A.lx, 36 + A.ld, 6, 1, "#1a1a20"); px(g, 16+A.rx, 36 + A.rd, 6, 1, "#1a1a20");
      // torso (clothing) with a fur collar ruff
      px(g, 9, 18, 14, 13, tint); px(g, 9, 18, 3, 13, lite); px(g, 20, 18, 3, 13, dark);
      px(g, 9, 28, 14, 3, "rgba(0,0,0,0.2)");
      px(g, 11, 18, 10, 2, fur); px(g, 12, 18, 8, 1, furL);
      // tail
      px(g, 3, 25, 3, 5, fur); px(g, 2, 28, 3, 4, fur); px(g, 2, 31, 2, 2, furL);
      px(g, 2, 31, 2, 1, "#fff"); // tail tip glint
      // shoulder spikes
      px(g, 4, 15, 2, 2, fur); px(g, 26, 15, 2, 2, fur);
      // arms swing + clawed hands ride along
      px(g, 6+A.lax, 19 + A.la, 3, 9, tint); px(g, 23+A.rax, 19 + A.ra, 3, 9, tint);
      px(g, 6+A.lax, 27 + A.la, 3, 3, fur); px(g, 23+A.rax, 27 + A.ra, 3, 3, fur);
      px(g, 6+A.lax, 30 + A.la, 1, 1, "#e8e4d8"); px(g, 7+A.lax, 30 + A.la, 1, 1, "#e8e4d8"); px(g, 8+A.lax, 30 + A.la, 1, 1, "#e8e4d8");
      px(g, 23+A.rax, 30 + A.ra, 1, 1, "#e8e4d8"); px(g, 24+A.rax, 30 + A.ra, 1, 1, "#e8e4d8"); px(g, 25+A.rax, 30 + A.ra, 1, 1, "#e8e4d8");
      // head nods with cheek spikes
      px(g, 10+A.hx, 6 + hb, 12, 12, fur); px(g, 10+A.hx, 6 + hb, 2, 12, "rgba(255,255,255,0.14)");
      px(g, 11+A.hx, 7 + hb, 10, 2, furL);
      px(g, 7+A.hx, 11 + hb, 3, 2, fur); px(g, 6+A.hx, 13 + hb, 3, 2, fur); px(g, 7+A.hx, 15 + hb, 3, 2, fur);
      px(g, 22+A.hx, 11 + hb, 3, 2, fur); px(g, 23+A.hx, 13 + hb, 3, 2, fur); px(g, 22+A.hx, 15 + hb, 3, 2, fur);
      // heavy brow + eyes
      px(g, 11+A.hx, 9 + hb, 4, 1, furD); px(g, 17+A.hx, 9 + hb, 4, 1, furD);
      g.fillStyle = eyeC; g.fillRect(12+A.hx, 11 + hb, 2, 2); g.fillRect(18+A.hx, 11 + hb, 2, 2);
      // muzzle, nose, fangs (jaw drops on atk)
      px(g, 12+A.hx, 13 + hb, 8, 4, furL);
      px(g, 13+A.hx, 13 + hb, 6, 1, "#fff"); // snout bridge glint
      px(g, 15+A.hx, 13 + hb, 2, 2, "#14141a");
      px(g, 14+A.hx, 12 + hb, 4, 1, furL);
      px(g, 12+A.hx, 16 + hb + (P.atk ? 1 : 0), 1, 2, "#fff"); px(g, 19+A.hx, 16 + hb + (P.atk ? 1 : 0), 1, 2, "#fff");
    } else if (race === "grenouille") {
      // frogfolk: smooth skin, raised eye bumps, ear discs, wide smile,
      // pale belly, webbed hands and big webbed feet.
      const fro = skin, froD = shade(skin, -32), froL = shade(skin, 30);
      // legs march + webbed feet
      px(g, 10+A.lx, 30 + A.ld, 5, 6, fro); px(g, 17+A.rx, 30 + A.rd, 5, 6, fro);
      px(g, 9+A.lx, 35 + A.ld, 7, 2, froD); px(g, 16+A.rx, 35 + A.rd, 7, 2, froD);
      px(g, 9+A.lx, 36 + A.ld, 7, 1, "#1c2a26"); px(g, 16+A.rx, 36 + A.rd, 7, 1, "#1c2a26");
      // torso (clothing) with a pale belly panel
      px(g, 9, 18, 14, 13, tint); px(g, 9, 18, 3, 13, lite); px(g, 20, 18, 3, 13, dark);
      px(g, 9, 28, 14, 3, "rgba(0,0,0,0.2)");
      px(g, 13, 21, 6, 8, froL);
      // arms swing + webbed hands ride along
      px(g, 6+A.lax, 19 + A.la, 3, 9, tint); px(g, 23+A.rax, 19 + A.ra, 3, 9, tint);
      px(g, 6+A.lax, 27 + A.la, 3, 3, fro); px(g, 23+A.rax, 27 + A.ra, 3, 3, fro);
      px(g, 5+A.lax, 28 + A.la, 2, 2, fro); px(g, 5+A.lax, 30 + A.la, 2, 1, froL);
      px(g, 25+A.rax, 28 + A.ra, 2, 2, fro); px(g, 25+A.rax, 30 + A.ra, 2, 1, froL);
      // head nods, eye bumps, ear discs ride along
      px(g, 10+A.hx, 6 + hb, 12, 12, fro); px(g, 10+A.hx, 6 + hb, 2, 12, "rgba(255,255,255,0.18)");
      px(g, 11+A.hx, 8 + hb, 4, 5, froL); px(g, 17+A.hx, 8 + hb, 4, 5, froL);
      px(g, 8+A.hx, 12 + hb, 2, 4, froD); px(g, 8+A.hx, 13 + hb, 2, 2, froL);
      px(g, 22+A.hx, 12 + hb, 2, 4, froD); px(g, 22+A.hx, 13 + hb, 2, 2, froL);
      px(g, 15+A.hx, 7 + hb, 1, 1, froD); px(g, 19+A.hx, 8 + hb, 1, 1, froD);
      // eyes + wide smile + nostrils + pale throat
      g.fillStyle = eyeC; g.fillRect(12+A.hx, 11 + hb, 2, 2); g.fillRect(18+A.hx, 11 + hb, 2, 2);
      px(g, 12+A.hx, 15 + hb + (P.atk ? 2 : 0), 8, 1, froD); px(g, 11+A.hx, 14 + hb, 1, 2, froD); px(g, 20+A.hx, 14 + hb, 1, 2, froD);
      px(g, 15+A.hx, 13 + hb, 1, 1, froD); px(g, 16+A.hx, 13 + hb, 1, 1, froD);
      px(g, 13+A.hx, 17 + hb + (P.atk ? 2 : 0), 6, 2, froL);
    } else if (race === "kinnatma" || race === "quansalbar" || race === "usaghito") {
      if (race === "quansalbar") {
        // mantis-shrimp shellkin: armored carapace, stalk eyes, club fists,
        // segmented legs with pale tips, fin wings peeking at the back.
        const sh = skin, shD = shade(skin, -32), shL = shade(skin, 30);
        const fin = "rgba(159,208,232,0.9)";
        px(g, 4, 20, 3, 8, fin); px(g, 25, 20, 3, 8, fin);
        px(g, 5, 18, 2, 3, "#e8f4fa"); px(g, 25, 18, 2, 3, "#e8f4fa");
        px(g, 11+A.lx, 30 + A.ld, 4, 5, sh); px(g, 17+A.rx, 30 + A.rd, 4, 5, sh);
        px(g, 11+A.lx, 32 + A.ld, 4, 1, shD); px(g, 17+A.rx, 32 + A.rd, 4, 1, shD);
        px(g, 10+A.lx, 35 + A.ld, 6, 2, "#e8e4d8"); px(g, 16+A.rx, 35 + A.rd, 6, 2, "#e8e4d8");
        px(g, 9, 18, 14, 13, tint); px(g, 9, 18, 3, 13, lite); px(g, 20, 18, 3, 13, dark);
        px(g, 9, 28, 14, 3, "rgba(0,0,0,0.2)");
        px(g, 13, 20, 6, 9, sh); px(g, 14, 21, 4, 7, shD);
        px(g, 14, 22, 4, 1, shL);
        px(g, 13, 20, 6, 1, shL); // carapace top sheen
        px(g, 13, 24, 6, 1, shD); // plate seam
        px(g, 6+A.lax, 19 + A.la, 3, 8, tint); px(g, 23+A.rax, 19 + A.ra, 3, 8, tint);
        px(g, 5+A.lax, 26 + A.la, 5, 6, sh); px(g, 22+A.rax, 26 + A.ra, 5, 6, sh);
        px(g, 5+A.lax, 26 + A.la, 5, 1, shL); px(g, 22+A.rax, 26 + A.ra, 5, 1, shL); // club knuckle sheen
        px(g, 6+A.lax, 28 + A.la, 1, 2, shD); px(g, 8+A.lax, 28 + A.la, 1, 2, shD); // club finger seams
        px(g, 23+A.rax, 28 + A.ra, 1, 2, shD); px(g, 25+A.rax, 28 + A.ra, 1, 2, shD);
        px(g, 6+A.lax, 27 + A.la, 3, 3, shL); px(g, 23+A.rax, 27 + A.ra, 3, 3, shL);
        px(g, 7+A.lax, 29 + A.la, 1, 1, "#e8a93d"); px(g, 24+A.rax, 29 + A.ra, 1, 1, "#e8a93d");
        px(g, 10+A.hx, 6 + hb, 12, 12, sh); px(g, 10+A.hx, 6 + hb, 2, 12, "rgba(255,255,255,0.16)");
        px(g, 13+A.hx, 2 + hb, 6, 5, sh); px(g, 14+A.hx, 1 + hb, 4, 2, shL);
        px(g, 12+A.hx, 3 + hb, 2, 4, shD); px(g, 18+A.hx, 3 + hb, 2, 4, shD);
        g.fillStyle = eyeC; g.fillRect(12+A.hx, 2 + hb, 2, 2); g.fillRect(18+A.hx, 2 + hb, 2, 2);
        g.fillStyle = "#fff"; g.fillRect(12+A.hx, 2 + hb, 1, 1); g.fillRect(18+A.hx, 2 + hb, 1, 1);
        px(g, 12+A.hx, 14 + hb + (P.atk ? 1 : 0), 8, 3, shD);
        px(g, 14+A.hx, 15 + hb + (P.atk ? 1 : 0), 4, 1, "#3a1a1a");
      } else if (race === "usaghito") {
        // bunny folk: tall ears, soft fur, pink pads, powder-puff tail.
        const fur = skin, furD = shade(skin, -28), furL = shade(skin, 28);
        px(g, 8+A.hx, 0 + hb, 5, 8, fur); px(g, 19+A.hx, 0 + hb, 5, 8, fur);
        px(g, 9+A.hx, 1 + hb, 3, 6, furL); px(g, 20+A.hx, 1 + hb, 3, 6, furL);
        px(g, 10+A.hx, 2 + hb, 1, 4, "#e8a0b0"); px(g, 21+A.hx, 2 + hb, 1, 4, "#e8a0b0");
        px(g, 11+A.lx, 30 + A.ld, 4, 6, fur); px(g, 17+A.rx, 30 + A.rd, 4, 6, fur);
        px(g, 10+A.lx, 35 + A.ld, 6, 2, furD); px(g, 16+A.rx, 35 + A.rd, 6, 2, furD);
        px(g, 12+A.lx, 35 + A.ld, 2, 1, "#e8a0b0"); px(g, 18+A.rx, 35 + A.rd, 2, 1, "#e8a0b0");
        px(g, 26, 27, 4, 4, "#f7f0f0"); px(g, 27, 28, 2, 2, "#e8d5d5");
        px(g, 9, 18, 14, 13, tint); px(g, 9, 18, 3, 13, lite); px(g, 20, 18, 3, 13, dark);
        px(g, 9, 28, 14, 3, "rgba(0,0,0,0.2)");
        px(g, 13, 19, 6, 4, furL);
        px(g, 6+A.lax, 19 + A.la, 3, 9, tint); px(g, 23+A.rax, 19 + A.ra, 3, 9, tint);
        px(g, 6+A.lax, 27 + A.la, 3, 3, fur); px(g, 23+A.rax, 27 + A.ra, 3, 3, fur);
        px(g, 10+A.hx, 6 + hb, 12, 12, fur); px(g, 10+A.hx, 6 + hb, 2, 12, "rgba(255,255,255,0.16)");
        px(g, 11+A.hx, 7 + hb, 10, 2, furL);
        px(g, 15+A.hx, 13 + hb, 2, 2, "#e8a0b0");
        px(g, 15+A.hx, 15 + hb + (P.atk ? 1 : 0), 2, 2, "#fff");
        g.fillStyle = eyeC; g.fillRect(12+A.hx, 11 + hb, 2, 2); g.fillRect(18+A.hx, 11 + hb, 2, 2);
        g.fillStyle = "#fff"; g.fillRect(12+A.hx, 11 + hb, 1, 1); g.fillRect(18+A.hx, 11 + hb, 1, 1);
        px(g, 11+A.hx, 14 + hb, 1, 1, furD); px(g, 20+A.hx, 14 + hb, 1, 1, furD);
      } else {
      // kinnatma: half-spirit bird — cream plumage, red war markings, gold
      // beak, feather-fringed wing arms, scaly talon legs, flame tail.
      const plu = skin, pluD = shade(skin, -30), pluL = shade(skin, 26);
      const mark = "#c93b3b";
     // scaly legs + talons
      px(g, 11+A.lx, 30 + A.ld, 4, 6, "#d97b2e"); px(g, 17+A.rx, 30 + A.rd, 4, 6, "#d97b2e");
      px(g, 11+A.lx, 32 + A.ld, 4, 1, "#a85a20"); px(g, 17+A.rx, 32 + A.rd, 4, 1, "#a85a20");
      px(g, 10+A.lx, 35 + A.ld, 6, 2, "#d97b2e"); px(g, 16+A.rx, 35 + A.rd, 6, 2, "#d97b2e");
      px(g, 9+A.lx, 36 + A.ld, 2, 1, "#5a3a22"); px(g, 12+A.lx, 36 + A.ld, 2, 1, "#5a3a22"); px(g, 15+A.lx, 36 + A.ld, 1, 1, "#5a3a22");
      px(g, 16+A.rx, 36 + A.rd, 1, 1, "#5a3a22"); px(g, 18+A.rx, 36 + A.rd, 2, 1, "#5a3a22"); px(g, 21+A.rx, 36 + A.rd, 2, 1, "#5a3a22");
      // torso (clothing) with a pale down sheen
      px(g, 9, 18, 14, 13, tint); px(g, 9, 18, 3, 13, lite); px(g, 20, 18, 3, 13, dark);
      px(g, 9, 28, 14, 3, "rgba(0,0,0,0.2)");
      px(g, 14, 20, 4, 9, pluL);
      // flame tail (bows and capes draw over it)
      px(g, 26, 26, 3, 3, mark); px(g, 27, 29, 2, 3, "#e06a2e"); px(g, 28, 31, 2, 2, "#e8a93d");
      // wing arms: feather fringe + talon fingers
      px(g, 6+A.lax, 19 + A.la, 3, 9, tint); px(g, 23+A.rax, 19 + A.ra, 3, 9, tint);
      px(g, 5+A.lax, 20 + A.la, 1, 3, plu); px(g, 5+A.lax, 23 + A.la, 1, 3, mark); px(g, 5+A.lax, 26 + A.la, 1, 2, plu);
      px(g, 26+A.rax, 20 + A.ra, 1, 3, plu); px(g, 26+A.rax, 23 + A.ra, 1, 3, mark); px(g, 26+A.rax, 26 + A.ra, 1, 2, plu);
      px(g, 6+A.lax, 27 + A.la, 3, 3, plu); px(g, 23+A.rax, 27 + A.ra, 3, 3, plu);
      px(g, 6+A.lax, 30 + A.la, 1, 1, "#e8a93d"); px(g, 8+A.lax, 30 + A.la, 1, 1, "#e8a93d");
      px(g, 23+A.rax, 30 + A.ra, 1, 1, "#e8a93d"); px(g, 25+A.rax, 30 + A.ra, 1, 1, "#e8a93d");
      // head nods, red brow stripes, cheek tufts ride along
      px(g, 10+A.hx, 6 + hb, 12, 12, plu); px(g, 10+A.hx, 6 + hb, 2, 12, "rgba(255,255,255,0.2)");
      px(g, 14+A.hx, 4 + hb, 4, 2, plu);
      px(g, 7+A.hx, 12 + hb, 3, 2, mark); px(g, 8+A.hx, 14 + hb, 2, 2, mark);
      px(g, 22+A.hx, 12 + hb, 3, 2, mark); px(g, 22+A.hx, 14 + hb, 2, 2, mark);
      px(g, 11+A.hx, 9 + hb, 4, 1, mark); px(g, 17+A.hx, 9 + hb, 4, 1, mark);
      g.fillStyle = eyeC; g.fillRect(12+A.hx, 11 + hb, 2, 2); g.fillRect(18+A.hx, 11 + hb, 2, 2);
      // gold beak + nostril slit (beak parts on atk)
      px(g, 14+A.hx, 13 + hb + (P.atk ? 1 : 0), 4, 3, "#e8a93d"); px(g, 15+A.hx, 13 + hb, 2, 1, "#c97b2e"); px(g, 15+A.hx, 15 + hb + (P.atk ? 2 : 0), 2, 1, "#8a5a2e");
      px(g, 14+A.hx, 14 + hb, 1, 1, "#8a5a2e");
      }
    }
    // sexual dimorphism (player + NPC roles): females read softer — lashes
    // at the outer eye corners, a pinched waist under the outfit. Males keep
    // the legacy silhouette, so every existing hero renders pixel-identical.
    if (isF) {
      g.fillStyle = "#14141a"; g.fillRect(11, 10, 1, 2); g.fillRect(20, 10, 1, 2);
      try { g.clearRect(9, 24, 1, 3); g.clearRect(22, 24, 1, 3); } catch (e) {}
    }

    // ---------- per-role identity ----------
    // heroes can borrow any NPC outfit; gear + extras draw after the outfit.
    const baseKind = kind;
    let ekind = kind;
    try {
      if (baseKind === "player" && ap && ap.outfit && ap.outfit !== "adventurer" && ap.outfit !== "player") ekind = ap.outfit;
    } catch (e) { }
    // Hair under-layer: every role that showed hair before still does (same
    // pixels); heroes additionally grow it under headgear, where the
    // visible over-layer after the switch picks it back up. NPC headgear
    // looks stay pixel-identical.
    var HEADGEAR = { guard: 1, warrior: 1, samurai: 1, hunter: 1, rogue: 1, ninja: 1, thief: 1, mage: 1, healer: 1, cleric: 1, herbalist: 1, priest: 1, tidewarden: 1, merchant: 1, innkeeper: 1, bard: 1, fisher: 1, farmer: 1, miner: 1, bandit: 1, outlaw: 1, murderer: 1, monarch: 1, noble: 1, knight: 1, chancellor: 1, highpriest: 1, marshal: 1, guildmaster: 1, magistrate: 1, harbormaster: 1, dockworker: 1, desert_nomad: 1, steppe_rider: 1, mesa_shaman: 1, frost_skald: 1 };
    // under-layer hair rides the nodding head (hb=0 at rest: pixel-identical)
    if (baseKind === "player" || !HEADGEAR[ekind]) { g.save(); try { g.translate(A.hx, hb); } catch (eH) {} try { drawHairStyle(g, (ap && ap.hairStyle) || "short", hairC, race); } catch (eH2) {} g.restore(); }
    switch (ekind) {
      case "player":
        px(g, 9, 24, 14, 2, "#333");
        px(g, 15, 24, 2, 2, "#ffd93d"); px(g, 15, 24, 2, 1, "#fff2b0"); // buckle
        px(g, 4, 20, 3, 3, "#ffd93d"); px(g, 4, 20, 3, 1, "#fff2b0"); // satchel
        px(g, 5, 21, 1, 1, "#8a5a33"); // satchel clasp
        px(g, 9, 29, 14, 1, "rgba(255,255,255,0.10)"); // hem stitch
        px(g, 9, 31, 14, 1, "#ffd93d");
        break;
      case "guard":
        g.save(); try { g.translate(A.hx, hb); } catch (eG1) {}
        px(g, 9, 2, 14, 6, "#8a9aaa"); px(g, 9, 2, 14, 2, "#d0d6de"); // helm
        px(g, 15, 0, 2, 4, "#c23b4e"); // plume
        px(g, 10, 8, 12, 1, "#555"); // visor shadow
        g.restore();
        px(g, 9, 24, 14, 2, "#555"); px(g, 14, 24, 4, 2, "#ffd93d");
        g.save(); try { g.translate(A.lax, A.la); } catch (eG2) {}
        px(g, 2, 18, 5, 10, "#6a7686"); px(g, 3, 20, 3, 6, "#8a9aaa"); // shield
        g.restore();
        g.save(); try { g.translate(A.rax, A.ra); } catch (eG3) {}
        px(g, 24, 14, 2, 12, "#ccc"); px(g, 25, 14, 1, 12, "#fff"); px(g, 22, 22, 6, 2, "#8a5a33"); // sword + crossguard
        px(g, 23, 24, 4, 3, "#8a5a33");
        g.restore();
        px(g, 15+A.hx, 2+hb, 2, 6, "#d0d6de"); // helm ridge
        px(g, 15+A.hx, 8+hb, 2, 2, "#8a9aaa"); // nose guard
        px(g, 11, 24, 1, 2, "#d0d6de"); px(g, 20, 24, 1, 2, "#d0d6de"); // belt studs
        px(g, 3+A.lax, 21+A.la, 3, 3, "#d0d6de"); // shield boss
        break;
      case "warrior":
        g.save(); try { g.translate(A.hx, hb); } catch (eW1) {}
        px(g, 9, 3, 14, 5, "#5a5a66"); // helm band
        g.fillStyle = "#d9c27f";
        g.beginPath(); g.moveTo(9, 5); g.lineTo(4, 0); g.lineTo(7, 7); g.fill();
        g.beginPath(); g.moveTo(23, 5); g.lineTo(28, 0); g.lineTo(25, 7); g.fill();
        g.restore();
        px(g, 5, 17, 5, 4, "#777"); px(g, 22, 17, 5, 4, "#777"); // pauldrons
        px(g, 9, 24, 14, 2, "#3a3a42");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eW2) {}
        px(g, 24, 14, 2, 12, "#ccc"); px(g, 25, 14, 1, 12, "#fff"); px(g, 22, 22, 6, 2, "#5a5a33");
        g.restore();
        px(g, 7, 18, 1, 1, "#d9c27f"); px(g, 24, 18, 1, 1, "#d9c27f"); // pauldron rivets
        px(g, 15, 24, 2, 2, "#d9c27f"); // belt buckle
        px(g, 13+A.hx, 11+hb, 6, 1, "#8a8078"); // brow band shade
        break;
      case "samurai":
        g.save(); try { g.translate(A.hx, hb); } catch (eS1) {}
        px(g, 8, 2, 16, 6, "#22222c"); px(g, 8, 2, 16, 2, "#c23b4e"); // kabuto
        px(g, 14, 0, 4, 3, "#ffd93d"); // crest
        g.restore();
        px(g, 9, 24, 14, 3, "#c23b4e"); px(g, 9, 24, 14, 1, "#ffd93d");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eS2) {}
        px(g, 25, 12, 2, 14, "#d9d9e0"); px(g, 25, 12, 1, 14, "#fff"); // katana
        px(g, 23, 25, 5, 2, "#222");
        g.restore();
        px(g, 14+A.hx, 1+hb, 4, 1, "#fff2b0"); // crest glint
        px(g, 13+A.hx, 8+hb, 6, 2, "#3a3a46"); // menpo mask shade
        px(g, 15, 25, 2, 3, "#ffd93d"); // obi knot
        px(g, 26, 14, 1, 10, "#fff"); // blade shine
        break;
      case "hunter":
        g.save(); try { g.translate(A.hx, hb); } catch (eHh1) {}
        px(g, 8, 2, 16, 8, "#2f6b3a"); px(g, 8, 2, 3, 14, "#2f6b3a"); px(g, 21, 2, 3, 14, "#2f6b3a"); // hood
        px(g, 11, 6, 10, 3, "#1d4423");
        g.restore();
        px(g, 9, 24, 14, 2, "#5a3a22");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eHh2) {}
        px(g, 25, 12, 2, 14, "#8a5a33"); px(g, 25, 12, 1, 14, "#d9c27f"); // bow
        g.restore();
        px(g, 27, 15, 3, 7, "#5a3a22"); px(g, 27, 13, 3, 2, "#d9c27f"); // quiver + fletch
        px(g, 15, 24, 2, 2, "#d9c27f"); // belt pouch clasp
        px(g, 13+A.hx, 4+hb, 6, 1, "#1d4423"); // hood fold shade
        break;
      case "rogue":
        g.save(); try { g.translate(A.hx, hb); } catch (eR1) {}
        px(g, 8, 2, 16, 8, "#1e1e2a"); px(g, 7, 2, 4, 15, "#1e1e2a"); px(g, 21, 2, 4, 15, "#1e1e2a"); // deep hood
        px(g, 9, 6, 14, 3, "#12121a"); // hood shadow over brow
        px(g, 10, 10, 12, 4, "#0c0c12"); // full mask band
        g.fillStyle = "#ffe14d"; g.fillRect(11, 11, 3, 2); g.fillRect(18, 11, 3, 2); // sharp eyes
        g.fillStyle = "#0c0c12"; g.fillRect(12, 11, 1, 2); g.fillRect(19, 11, 1, 2);
        g.restore();
        px(g, 9, 24, 14, 2, "#12121a"); px(g, 14, 24, 4, 2, "#3a3a4a");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eR2) {}
        px(g, 25, 14, 2, 10, "#d0d6de"); px(g, 25, 14, 1, 10, "#fff"); // bright dagger
        px(g, 23, 23, 5, 2, "#3a2a1a");
        g.restore();
        px(g, 11+A.hx, 11+hb, 3, 1, "#fff"); px(g, 18+A.hx, 11+hb, 3, 1, "#fff"); // mask eye shine
        px(g, 15, 24, 2, 2, "#8a8a9a"); // belt pouch clasp
        px(g, 13, 21, 6, 1, "rgba(255,255,255,0.12)"); // cloak clasp line
        px(g, 26, 14, 1, 8, "#fff"); // dagger shine
        break;
      case "ninja":
        g.save(); try { g.translate(A.hx, hb); } catch (eN1) {}
        px(g, 8, 2, 16, 7, "#23233a"); px(g, 8, 2, 3, 12, "#23233a"); px(g, 21, 2, 3, 12, "#23233a"); // night hood
        px(g, 12, 3, 8, 3, "#8a9aaa"); px(g, 14, 3, 4, 3, "#3a3a5a"); // steel brow plate
        px(g, 4, 4, 4, 2, "#c23b4e"); px(g, 2, 4, 3, 2, "#c23b4e"); // headband tails
        px(g, 9, 8, 14, 4, "#101018"); // face wrap
        g.fillStyle = "#ffe14d"; g.fillRect(11, 9, 3, 2); g.fillRect(18, 9, 3, 2); // eyes in the slit
        g.fillStyle = "#101018"; g.fillRect(12, 9, 1, 2); g.fillRect(19, 9, 1, 2);
        g.restore();
        px(g, 9, 24, 14, 2, "#23233a"); px(g, 14, 24, 4, 2, "#c23b4e"); // sash
        px(g, 25, 12, 2, 12, "#5a3a22"); px(g, 24, 9, 4, 3, "#d0d6de"); // tanto at the hip
        px(g, 13+A.hx, 4+hb, 1, 1, "#fff"); px(g, 18+A.hx, 4+hb, 1, 1, "#fff"); // brow-plate rivets
        px(g, 6+A.hx, 5+hb, 1, 1, "#ffd93d"); // headband knot glint
        px(g, 15, 24, 2, 2, "#c23b4e"); px(g, 15, 24, 2, 1, "#ff8a9a"); // sash knot
        px(g, 9, 28, 14, 1, "rgba(255,255,255,0.08)"); // hip wrap stitch
        break;
      case "thief":
        g.save(); try { g.translate(A.hx, hb); } catch (eT1) {}
        px(g, 8, 1, 16, 6, "#4a3a22"); px(g, 6, 6, 20, 2, "#4a3a22"); // slouch cap
        px(g, 9, 9, 14, 3, "#1c1c22"); // domino mask
        g.fillStyle = "#fff"; g.fillRect(11, 10, 2, 1); g.fillRect(19, 10, 2, 1);
        px(g, 10, 14, 12, 3, "#6a5a3a"); // scarf over the chin
        g.restore();
        px(g, 9, 24, 14, 2, "#6a5a3a"); px(g, 14, 24, 4, 2, "#3a2e1a"); // patched belt
        g.save(); try { g.translate(A.rax, A.ra); } catch (eT2) {}
        px(g, 24, 18, 5, 7, "#8a7a5a"); px(g, 25, 16, 3, 3, "#6a5a3a"); // loot sack
        px(g, 25, 16, 3, 1, "#d9c27f"); // sack tie
        g.restore();
        px(g, 15+A.hx, 1+hb, 2, 1, "#d9c27f"); // cap button
        px(g, 11+A.hx, 10+hb, 2, 1, "#fff"); // mask shine
        px(g, 11+A.hx, 15+hb, 10, 1, "#8a6a45"); // scarf fringe
        px(g, 15, 24, 2, 2, "#d9c27f"); // belt tool glint
        break;
      case "mage":
        g.save(); try { g.translate(A.hx, hb); } catch (eM1) {}
        px(g, 6, 6, 20, 3, "#4a3a6a"); // wide brim
        g.fillStyle = tint; g.beginPath(); g.moveTo(16, 6); g.lineTo(10, 6); g.lineTo(14, -2); g.lineTo(18, -2); g.fill();
        g.restore();
        px(g, 13, 18, 6, 13, "rgba(255,255,255,0.25)"); // robe opening
        g.save(); try { g.translate(A.rax, A.ra); } catch (eM2) {}
        px(g, 25, 10, 2, 16, "#5a3a22"); px(g, 24, 6, 4, 5, "#7fd4ff"); // staff orb
        px(g, 25, 7, 2, 2, "#fff"); // orb glint
        g.restore();
        px(g, 9, 7, 14, 1, "#8a6a9a"); // brim band
        px(g, 15, 0, 2, 1, "#fff2b0"); // hat tip star
        px(g, 13, 28, 6, 1, "rgba(255,255,255,0.18)"); // robe hem rune line
        px(g, 11, 18, 1, 10, "rgba(0,0,0,0.25)"); // robe fold
        break;
      case "scholar":
        g.save(); try { g.translate(A.hx, hb); } catch (eSc1) {}
        g.fillStyle = "#222"; g.fillRect(11, 10, 4, 4); g.fillRect(17, 10, 4, 4); // glasses
        g.fillStyle = "#fff"; g.fillRect(12, 11, 1, 1); g.fillRect(18, 11, 1, 1);
        g.restore();
        px(g, 12, 13, 8, 1, "#7a5a3a"); // mustache? no — book strap
        px(g, 13, 18, 6, 13, "#f2e7c9"); // tome on chest
        px(g, 13, 18, 6, 1, "#fff"); // page edge
        px(g, 14, 20, 4, 6, "#7a2b8f");
        px(g, 15, 21, 2, 1, "#d9a0ff"); // rune line
        px(g, 15, 24, 2, 2, "#8a6a3a"); // book clasp
        px(g, 13, 22, 1, 8, "rgba(0,0,0,0.25)"); // spine shade
        break;
      case "healer":
        g.save(); try { g.translate(A.hx, hb); } catch (eHl1) {}
        px(g, 8, 3, 16, 7, "#f2f2f2"); px(g, 8, 3, 3, 13, "#f2f2f2"); px(g, 21, 3, 3, 13, "#f2f2f2");
        g.restore();
        px(g, 14, 22, 4, 8, "#fff"); px(g, 12, 24, 8, 4, "#fff"); // cross
        px(g, 14, 22, 4, 8, "#5dd68a"); px(g, 12, 24, 8, 4, "#5dd68a");
        px(g, 14, 23, 4, 6, "#fff"); px(g, 13, 25, 6, 2, "#fff");
        px(g, 15, 22, 2, 1, "#fff"); // cross pin glint
        px(g, 13+A.hx, 4+hb, 6, 1, "#fff"); // veil crown shine
        px(g, 9, 29, 14, 1, "rgba(255,255,255,0.12)"); // apron hem
        break;
      case "cleric":
        g.save(); try { g.translate(A.hx, hb); } catch (eC1) {}
        px(g, 9, 1, 14, 8, "#bfe8ff"); px(g, 12, 0, 8, 3, "#fff"); // pale mitre
        g.restore();
        px(g, 13, 18, 6, 13, "#7fd4ff"); px(g, 14, 20, 4, 8, "#fff");
        px(g, 13, 18, 6, 1, "#fff"); // stole top shine
        px(g, 15, 22, 2, 2, "#c9a227"); // stole jewel
        g.save(); try { g.translate(A.rax, A.ra); } catch (eC2) {}
        px(g, 25, 12, 2, 14, "#d9c27f");
        px(g, 25, 12, 1, 14, "#fff2b0"); // staff shine
        g.restore();
        px(g, 14+A.hx, 1+hb, 4, 1, "#fff"); // mitre glint
        px(g, 9, 29, 14, 1, "rgba(255,255,255,0.12)"); // hem
        break;
      case "herbalist":
        g.save(); try { g.translate(A.hx, hb); } catch (eHb1) {}
        px(g, 6, 5, 20, 3, "#2f6b3a"); px(g, 10, 1, 12, 5, "#2f6b3a"); // leaf hood
        g.restore();
        px(g, 11, 18, 10, 13, "#3a5a2f");
        px(g, 13, 20, 3, 8, "#5dd68a"); px(g, 16, 20, 3, 8, "#7ddf6b"); // herb bundles
        g.save(); try { g.translate(A.rax, A.ra); } catch (eHb2) {}
        px(g, 25, 14, 2, 12, "#8a5a33");
        px(g, 25, 14, 1, 12, "#d9c27f"); // staff shine
        g.restore();
        px(g, 14+A.hx, 2+hb, 4, 2, "#7ddf6b"); // leaf sprig
        px(g, 15+A.hx, 1+hb, 2, 1, "#d9f0b0"); // sprig glint
        px(g, 18, 24, 3, 4, "#6b4226"); // belt pouch
        px(g, 18, 24, 3, 1, "#d9c27f"); // pouch tie
        break;
      case "priest":
        g.save(); try { g.translate(A.hx, hb); } catch (eP1) {}
        px(g, 9, 1, 14, 8, "#f2e7c9"); px(g, 12, 0, 8, 3, "#ffd93d"); // mitre
        g.restore();
        px(g, 13, 18, 6, 13, "#ffd93d"); px(g, 14, 20, 4, 8, "#fff");
        px(g, 13, 18, 6, 1, "#fff2b0"); // stole top shine
        px(g, 15, 22, 2, 2, "#c93b3b"); // stole jewel
        g.save(); try { g.translate(A.rax, A.ra); } catch (eP2) {}
        px(g, 25, 12, 2, 14, "#d9c27f");
        px(g, 25, 12, 1, 14, "#fff2b0"); // staff shine
        g.restore();
        px(g, 14+A.hx, 2+hb, 2, 3, "#ffd93d"); // mitre cross
        px(g, 13+A.hx, 3+hb, 4, 1, "#ffd93d");
        break;
      case "blacksmith":
        px(g, 6+A.lax, 19 + A.la, 3, 8, skin); px(g, 23+A.rax, 19 + A.ra, 3, 8, skin); // bare arms swing
        px(g, 11, 18, 10, 13, "#4a2f1a"); // apron
        px(g, 11, 18, 10, 1, "#6b4226"); // apron top hem
        px(g, 13, 18, 2, 6, "#2e1c10"); px(g, 17, 18, 2, 6, "#2e1c10"); // straps
        px(g, 15, 22, 2, 3, "#3a3a42"); // chest pocket + tools
        px(g, 13, 20, 6, 8, "#6b4226");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eB1) {}
        px(g, 24, 14, 4, 8, "#888"); px(g, 24, 14, 4, 1, "#d0d6de"); px(g, 24, 22, 4, 3, "#5a3a22"); // hammer
        g.restore();
        px(g, 7+A.lax, 24+A.la, 1, 2, "#3a2a1a"); px(g, 24+A.rax, 24+A.ra, 1, 2, "#3a2a1a"); // wristbands
        break;
      case "runesmith":
        px(g, 11, 18, 10, 13, "#2a2438"); // dark apron for contrast
        px(g, 13, 18, 6, 13, "#3a3050");
        g.fillStyle = "#ffb02e"; g.fillRect(14, 20, 4, 3); g.fillRect(14, 25, 4, 3); g.fillRect(15, 28, 2, 2); // big runes
        g.fillStyle = "rgba(255,176,46,0.45)"; g.fillRect(13, 19, 6, 5); g.fillRect(13, 24, 6, 5); // glow
        g.fillStyle = "#ffb02e"; g.fillRect(14, 20, 4, 3); g.fillRect(14, 25, 4, 3);
        g.save(); try { g.translate(A.rax, A.ra); } catch (eR1) {}
        px(g, 24, 14, 4, 8, "#d0d6de"); px(g, 24, 14, 4, 1, "#fff"); px(g, 24, 22, 4, 3, "#5a3a22");
        g.restore();
        px(g, 12+A.hx, 5+hb, 8, 2, "#3a3050"); // forge goggles strap
        px(g, 13+A.hx, 5+hb, 2, 2, "#ffb02e"); px(g, 17+A.hx, 5+hb, 2, 2, "#ffb02e"); // goggle glint
        px(g, 13, 18, 2, 13, "#1e1c2c"); px(g, 19, 18, 2, 13, "#1e1c2c"); // apron edge shade
        break;
      case "tidewarden":
        g.save(); try { g.translate(A.hx, hb); } catch (eT1) {}
        px(g, 8, 2, 16, 7, "#2a6a7a"); px(g, 8, 2, 3, 14, "#2a6a7a"); px(g, 21, 2, 3, 14, "#2a6a7a");
        g.restore();
        px(g, 13, 18, 6, 13, "rgba(125,249,255,0.5)"); // scale tabard
        px(g, 14, 19, 4, 2, "#2a6a7a"); px(g, 14, 23, 4, 2, "#2a6a7a"); // wave bands
        px(g, 15, 20, 2, 1, "#c9f6ff"); // tabard clasp
        g.save(); try { g.translate(A.rax, A.ra); } catch (eT2) {}
        px(g, 25, 8, 1, 18, "#c9ccd4"); px(g, 23, 8, 5, 2, "#c9ccd4"); // trident
        px(g, 25, 8, 1, 18, "#fff"); // tine shine
        g.restore();
        px(g, 14+A.hx, 4+hb, 4, 2, "#7fd4ff"); // hood fin
        px(g, 9, 28, 14, 2, "#1d4a55");
        break;
      case "merchant":
        g.save(); try { g.translate(A.hx, hb); } catch (eMe1) {}
        px(g, 9, 3, 14, 5, "#7a2b8f"); px(g, 11, 1, 10, 3, "#ffd93d"); // turban + coin band
        g.restore();
        px(g, 13, 24, 6, 5, "#6b4226"); px(g, 14, 25, 4, 3, "#ffd93d"); // coin purse
        px(g, 14, 25, 4, 1, "#fff2b0"); // coin glint
        px(g, 13, 24, 6, 1, "#8a5a33"); // purse tie
        px(g, 14+A.hx, 2+hb, 4, 2, "#ffd93d"); // turban jewel
        px(g, 15+A.hx, 2+hb, 2, 1, "#fff"); // jewel glint
        px(g, 11, 21, 10, 1, "rgba(255,255,255,0.10)"); // sash sheen
        break;
      case "innkeeper":
        g.save(); try { g.translate(A.hx, hb); } catch (eI1) {}
        px(g, 10, 3, 12, 4, "#e8e0d0"); // cap
        g.restore();
        px(g, 11, 18, 10, 13, "#f2ede2"); // apron
        px(g, 11, 18, 10, 1, "#fff"); // apron top shine
        px(g, 12, 22, 3, 4, "#d9d0c0"); // apron pocket
        g.save(); try { g.translate(A.rax, A.ra); } catch (eI2) {}
        px(g, 24, 20, 4, 5, "#8a5a33"); px(g, 24, 19, 4, 2, "#fff"); // mug
        px(g, 25, 19, 2, 1, "#d9f0ff"); // foam
        px(g, 28, 21, 1, 3, "#8a5a33"); // mug handle
        g.restore();
        px(g, 10+A.hx, 3+hb, 12, 1, "#fff"); // cap stitch
        break;
      case "bard":
        g.save(); try { g.translate(A.hx, hb); } catch (eBd1) {}
        px(g, 9, 2, 12, 5, "#7a2b4e"); px(g, 19, 1, 4, 3, "#ff6b9d"); // feathered cap
        g.restore();
        g.save(); try { g.translate(A.rax, A.ra); } catch (eBd2) {}
        px(g, 22, 18, 6, 8, "#8a5a33"); px(g, 24, 12, 2, 7, "#6b4226"); // lute
        px(g, 24, 14, 2, 10, "#d9c27f"); // strings
        px(g, 24, 20, 2, 2, "#3a2415"); // sound hole
        g.restore();
        px(g, 9, 24, 14, 2, "#ffd93d");
        px(g, 15, 24, 2, 2, "#7a2b4e"); // sash knot
        px(g, 20+A.hx, 2+hb, 2, 1, "#ffd93d"); // feather glint
        break;
      case "fisher":
        g.save(); try { g.translate(A.hx, hb); } catch (eF1) {}
        px(g, 7, 4, 18, 3, "#d9c27f"); px(g, 10, 0, 12, 5, "#c9b26e"); // rain hat
        g.restore();
        g.save(); try { g.translate(A.rax, A.ra); } catch (eF2) {}
        px(g, 25, 6, 2, 20, "#8a5a33"); // rod
        px(g, 26, 10, 1, 10, "#d9c27f"); // rod shine
        g.restore();
        px(g, 9, 24, 14, 2, "#2a6a7a");
        px(g, 12, 25, 3, 3, "#6b4226"); // creel basket
        px(g, 12, 25, 3, 1, "#8a5a33"); // creel lid
        px(g, 12+A.hx, 5+hb, 8, 1, "#8a6a3a"); // hat band
        break;
      case "farmer":
        g.save(); try { g.translate(A.hx, hb); } catch (eFa1) {}
        px(g, 6, 5, 20, 3, "#e0b64f"); px(g, 10, 1, 12, 5, "#e0b64f"); // straw hat
        g.restore();
        px(g, 9, 24, 14, 2, "#6b4226");
        px(g, 15, 24, 2, 2, "#d9c27f"); // belt buckle
        px(g, 18, 25, 3, 3, "#8a6a4a"); // seed pouch
        g.save(); try { g.translate(A.rax, A.ra); } catch (eFa2) {}
        px(g, 25, 12, 2, 14, "#8a5a33"); px(g, 23, 12, 6, 2, "#888"); // pitchfork
        px(g, 24, 12, 1, 14, "#d9c27f"); // haft shine
        g.restore();
        px(g, 12+A.hx, 2+hb, 8, 1, "#c9963f"); // hat band
        px(g, 11+A.hx, 6+hb, 2, 1, "#b0832f"); // hat patch
        break;
      case "miner":
        g.save(); try { g.translate(A.hx, hb); } catch (eMn1) {}
        px(g, 9, 3, 14, 5, "#8a6a3a"); px(g, 14, 4, 4, 3, "#ffd93d"); // lamp helm
        g.restore();
        px(g, 11, 18, 10, 13, "#5a4a3a");
        px(g, 11, 18, 10, 1, "#6a5a48"); // vest top hem
        px(g, 13, 20, 2, 6, "#3a2e24"); px(g, 17, 20, 2, 6, "#3a2e24"); // suspenders
        g.save(); try { g.translate(A.rax, A.ra); } catch (eMn2) {}
        px(g, 24, 12, 2, 12, "#8a5a33"); px(g, 22, 12, 6, 3, "#888"); // pick
        px(g, 22, 12, 6, 1, "#d0d6de"); // pick shine
        g.restore();
        px(g, 15+A.hx, 4+hb, 2, 2, "#fff2b0"); // lamp glint
        break;
      case "villager":
        px(g, 14, 18, 4, 5, "#f2ede2"); // collar shirt
        px(g, 14, 18, 4, 1, "#fff"); // collar shine
        px(g, 15, 20, 2, 8, "#999"); // buttons
        px(g, 15, 20, 2, 1, "#c9c9d4"); // top button glint
        px(g, 9, 24, 14, 2, "#5a3a22"); px(g, 14, 24, 4, 2, "#ffd93d"); // belt
        px(g, 15, 24, 2, 1, "#fff2b0"); // buckle glint
        px(g, 18, 21, 3, 3, "#d9d0b8"); // pocket
        px(g, 9, 29, 14, 1, "rgba(255,255,255,0.10)"); // hem stitch
        break;
      case "monarch":
        g.save(); try { g.translate(A.hx, hb); } catch (eMo1) {}
        px(g, 9, 0, 14, 5, "#ffd93d"); px(g, 9, 4, 14, 1, "#c9a227"); // crown band
        px(g, 10, 0, 2, 3, "#c93b3b"); px(g, 14, 0, 2, 3, "#3f8ef0"); px(g, 18, 0, 2, 3, "#5dd68a"); // jewels
        px(g, 15, -0, 2, 1, "#fff2b0");
        g.restore();
        px(g, 11, 18, 10, 3, "#f2ede2"); px(g, 12, 19, 8, 1, "#d9d0b8"); // ermine collar
        px(g, 9, 24, 14, 2, "#ffd93d"); px(g, 14, 24, 4, 2, "#c93b3b"); // royal belt
        g.save(); try { g.translate(A.rax, A.ra); } catch (eMo2) {}
        px(g, 24, 12, 2, 14, "#c9a227"); px(g, 23, 8, 4, 4, "#ffd93d"); // scepter + orb
        g.restore();
        px(g, 13, 18, 6, 8, "rgba(255,255,255,0.18)"); // purple sheen
        px(g, 15, 18, 2, 6, "#e8d0f0"); // sheen fold
        px(g, 11, 19, 1, 1, "#fff"); px(g, 20, 19, 1, 1, "#fff"); // ermine dots
        px(g, 15, 24, 2, 1, "#fff2b0"); // royal buckle glint
        break;
      case "noble":
        g.save(); try { g.translate(A.hx, hb); } catch (eNb1) {}
        px(g, 9, 2, 12, 5, "#3a3a6a"); px(g, 19, 1, 4, 3, "#c9a0ff"); // feathered cap
        g.restore();
        px(g, 9, 6, 14, 2, "#f2ede2"); // lace collar
        px(g, 13, 18, 6, 10, "#c9a227"); px(g, 15, 20, 2, 8, "#7a2b8f"); // brocade doublet
        px(g, 9, 24, 14, 2, "#2a2a3a");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eNb2) {}
        px(g, 24, 20, 4, 5, "#6b4226"); px(g, 24, 19, 4, 2, "#ffd93d"); // signet purse
        px(g, 25, 19, 2, 1, "#fff2b0"); // clasp glint
        g.restore();
        px(g, 15, 20, 2, 8, "#5a1f6e"); // doublet shade line
        px(g, 15, 22, 2, 1, "#e8d0ff"); // brocade glint
        px(g, 20+A.hx, 2+hb, 2, 1, "#fff"); // feather glint
        break;
      case "knight":
        g.save(); try { g.translate(A.hx, hb); } catch (eK1) {}
        px(g, 8, 2, 16, 7, "#b9c2cc"); px(g, 8, 2, 16, 2, "#eef2f6"); // great helm
        px(g, 10, 8, 12, 2, "#22222c"); // visor slit
        px(g, 15, 0, 2, 4, "#c23b4e"); // crest
        g.restore();
        px(g, 5, 17, 5, 4, "#8a9aaa"); px(g, 22, 17, 5, 4, "#8a9aaa"); // pauldrons
        px(g, 13, 18, 6, 10, "#f2f2f2"); px(g, 15, 18, 2, 10, "#c23b4e"); // tabard cross
        px(g, 9, 24, 14, 2, "#c9a227");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eK2) {}
        px(g, 24, 14, 2, 12, "#d0d6de"); px(g, 25, 14, 1, 12, "#fff"); px(g, 23, 24, 4, 3, "#5a3a22");
        g.restore();
        px(g, 12+A.hx, 4+hb, 8, 1, "#fff"); // helm shine
        px(g, 11+A.hx, 8+hb, 2, 2, "#555"); px(g, 19+A.hx, 8+hb, 2, 2, "#555"); // breath holes
        px(g, 15, 20, 2, 8, "#7a1f1f"); // tabard shade
        px(g, 15, 24, 2, 2, "#c9a227"); px(g, 15, 24, 2, 1, "#fff2b0"); // belt glint
        break;
      case "chancellor":
        g.save(); try { g.translate(A.hx, hb); } catch (eCh1) {}
        px(g, 9, 2, 14, 4, "#1e1e26"); px(g, 9, 6, 14, 1, "#3a3a48"); // black cap
        g.restore();
        px(g, 11, 18, 10, 2, "#f2ede2"); // white collar
        px(g, 12, 21, 8, 2, "#ffd93d"); px(g, 14, 23, 4, 2, "#c93b3b"); // chain of office
        px(g, 9, 24, 14, 2, "#2a2a34");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eCh2) {}
        px(g, 23, 20, 5, 7, "#e8dcc0"); px(g, 23, 21, 5, 1, "#c9b98a"); // scroll
        px(g, 25, 21, 2, 2, "#c93b3b"); // scroll seal
        g.restore();
        px(g, 12, 21, 8, 1, "#fff2b0"); // chain glint
        px(g, 15, 23, 2, 1, "#ff8a8a"); // jewel glint
        px(g, 15+A.hx, 2+hb, 2, 1, "#8a8a9a"); // cap button
        break;
      case "highpriest":
        g.save(); try { g.translate(A.hx, hb); } catch (eHp1) {}
        px(g, 9, 0, 14, 9, "#f7f3e8"); px(g, 12, 0, 8, 2, "#ffd93d"); // tall mitre
        px(g, 14, 3, 4, 5, "#ffd93d"); px(g, 15, 4, 2, 3, "#fff"); // sun cross
        g.restore();
        px(g, 13, 18, 6, 13, "rgba(255,217,61,0.35)"); // golden vestment glow
        px(g, 14, 21, 4, 4, "#ffd93d"); px(g, 15, 22, 2, 2, "#c93b3b"); // sun disc amulet
        g.save(); try { g.translate(A.rax, A.ra); } catch (eHp2) {}
        px(g, 25, 10, 2, 16, "#8a6a3a"); px(g, 24, 6, 4, 5, "#fff2b0"); // staff orb
        px(g, 25, 7, 2, 2, "#fff"); // orb glint
        g.restore();
        px(g, 13, 19, 1, 10, "#fff"); px(g, 18, 19, 1, 10, "#c9a227"); // vestment folds
        px(g, 14+A.hx, 1+hb, 4, 1, "#fff"); // mitre glint
        px(g, 14, 25, 2, 1, "#fff"); // disc glint
        break;
      case "marshal":
        g.save(); try { g.translate(A.hx, hb); } catch (eMa1) {}
        px(g, 8, 2, 16, 6, "#6a7686"); px(g, 8, 2, 16, 2, "#d0d6de"); // steel helm
        px(g, 14, 0, 4, 3, "#c23b4e"); // plume block
        g.restore();
        px(g, 5, 17, 5, 3, "#ffd93d"); px(g, 22, 17, 5, 3, "#ffd93d"); // epaulettes
        px(g, 11, 18, 10, 6, "#5a1f24"); px(g, 11, 24, 10, 2, "#f2ede2"); // crossbelt
        g.save(); try { g.translate(A.rax, A.ra); } catch (eMa2) {}
        px(g, 24, 18, 3, 8, "#5a3a22"); px(g, 23, 25, 5, 2, "#d0d6de"); // baton
        px(g, 24, 18, 1, 8, "#8a6a4a"); // baton shine
        g.restore();
        px(g, 6, 18, 3, 1, "#fff2b0"); px(g, 23, 18, 3, 1, "#fff2b0"); // epaulette fringe
        px(g, 15, 19, 2, 4, "#f2ede2"); // crossbelt glint
        px(g, 15+A.hx, 3+hb, 2, 1, "#fff"); // helm shine
        break;
      case "guildmaster":
        g.save(); try { g.translate(A.hx, hb); } catch (eGm1) {}
        px(g, 7, 3, 18, 4, "#4a2f1a"); px(g, 10, 0, 12, 4, "#4a2f1a"); // broad hat
        px(g, 10, 3, 12, 1, "#ffd93d"); // coin band
        g.restore();
        px(g, 11, 18, 10, 3, "#8a6a4a"); // fur collar
        px(g, 13, 21, 6, 7, "#2e2e3a"); // ledger book
        px(g, 14, 22, 4, 4, "#e8dcc0");
        px(g, 14, 22, 4, 1, "#fff"); // page edge
        px(g, 9, 24, 14, 2, "#ffd93d");
        px(g, 15, 24, 2, 1, "#fff2b0"); // buckle glint
        px(g, 12, 19, 8, 1, "rgba(255,255,255,0.12)"); // fur collar sheen
        break;
      case "magistrate":
        g.save(); try { g.translate(A.hx, hb); } catch (eMg1) {}
        px(g, 7, 5, 4, 9, "#e8e4d8"); px(g, 21, 5, 4, 9, "#e8e4d8"); // powdered wig curls
        px(g, 9, 3, 14, 4, "#e8e4d8");
        g.restore();
        px(g, 13, 18, 6, 4, "#fff"); // jabot
        px(g, 11, 22, 10, 6, "#1e1e26"); // black robe panel
        g.save(); try { g.translate(A.rax, A.ra); } catch (eMg2) {}
        px(g, 24, 20, 4, 4, "#8a5a33"); px(g, 24, 19, 4, 1, "#5a3a22"); // gavel
        px(g, 24, 19, 4, 1, "#d9c27f"); // gavel band shine
        g.restore();
        px(g, 15, 22, 2, 2, "#fff"); // jabot pin
        px(g, 12, 23, 8, 1, "rgba(255,255,255,0.08)"); // robe fold
        px(g, 15+A.hx, 3+hb, 2, 1, "#fff"); // wig shine
        break;
      case "harbormaster":
        g.save(); try { g.translate(A.hx, hb); } catch (eHm1) {}
        px(g, 8, 2, 16, 5, "#12384c"); px(g, 8, 6, 16, 1, "#ffd93d"); // captain hat
        px(g, 14, 3, 4, 2, "#ffd93d"); px(g, 15, 4, 2, 1, "#12384c"); // anchor badge
        g.restore();
        px(g, 13, 18, 6, 8, "#12384c"); px(g, 14, 20, 2, 2, "#ffd93d"); px(g, 14, 24, 2, 2, "#ffd93d"); // brass buttons
        g.save(); try { g.translate(A.rax, A.ra); } catch (eHm2) {}
        px(g, 23, 18, 4, 8, "#8a6a3a"); px(g, 24, 18, 2, 2, "#c4ecff"); // spyglass
        px(g, 26, 18, 1, 8, "#e8f6ff"); // tube shine
        g.restore();
        px(g, 15, 20, 1, 1, "#fff"); // button glint
        px(g, 15+A.hx, 4+hb, 2, 1, "#fff2b0"); // anchor glint
        break;
      case "dockworker":
        g.save(); try { g.translate(A.hx, hb); } catch (eD1) {}
        px(g, 9, 3, 14, 4, "#a03a2e"); px(g, 9, 6, 2, 3, "#a03a2e"); px(g, 21, 6, 2, 3, "#a03a2e"); // bandana
        g.restore();
        px(g, 6+A.lax, 19 + A.la, 3, 8, skin); px(g, 23+A.rax, 19 + A.ra, 3, 8, skin); // bare arms swing
        px(g, 11, 18, 10, 10, "#6a5a3a"); // canvas vest
        px(g, 9, 24, 14, 2, "#4a3a22");
        g.save(); try { g.translate(A.rax, A.ra); } catch (eD2) {}
        px(g, 24, 16, 2, 10, "#8a5a33"); px(g, 23, 14, 4, 3, "#888"); // hook
        px(g, 24, 16, 1, 10, "#d9c27f"); // hook shine
        g.restore();
        px(g, 11, 19, 10, 2, "#7a6a4a"); // vest stitch
        px(g, 15+A.hx, 3+hb, 2, 2, "#c94a3e"); // bandana knot
        px(g, 7+A.lax, 24+A.la, 1, 2, "#3a2a1a"); px(g, 24+A.rax, 24+A.ra, 1, 2, "#3a2a1a"); // wristbands
        break;
      case "desert_nomad":
        g.save(); try { g.translate(A.hx, hb); } catch (eDn1) {}
        px(g, 8, 1, 16, 6, "#e8dcc0"); px(g, 8, 6, 16, 2, "#c9a227"); // sand turban
        px(g, 10, 12, 12, 5, "#e8dcc0"); // veil over chin
        g.restore();
        px(g, 9, 24, 14, 2, "#c9a227"); // sash
        px(g, 13, 18, 6, 6, "#7a2b2e"); // chest band
        g.save(); try { g.translate(A.rax, A.ra); } catch (eDn2) {}
        px(g, 25, 16, 2, 10, "#d0d6de"); px(g, 25, 16, 1, 10, "#fff"); // curved dagger
        px(g, 24, 16, 1, 4, "#8a6a3a"); // hilt wrap
        g.restore();
        px(g, 13, 19, 6, 2, "#c9a227"); // chest band pattern
        px(g, 15, 24, 2, 2, "#c9a227"); px(g, 15, 24, 2, 1, "#fff2b0"); // sash glint
        px(g, 15+A.hx, 2+hb, 2, 2, "#7a2b2e"); // turban jewel
        break;
      case "steppe_rider":
        g.save(); try { g.translate(A.hx, hb); } catch (eSr1) {}
        px(g, 9, 0, 14, 6, "#5a3a22"); px(g, 9, 5, 14, 2, "#8a6a3a"); // fur-trimmed hat
        px(g, 15, 6, 2, 3, "#c93b3b"); // forehead jewel
        g.restore();
        px(g, 11, 18, 10, 4, "#2a6ab0"); px(g, 11, 24, 10, 2, "#e06a2e"); // deel sash
        g.save(); try { g.translate(A.rax, A.ra); } catch (eSr2) {}
        px(g, 25, 12, 2, 14, "#8a5a33"); px(g, 25, 12, 1, 14, "#d9c27f"); // bow
        px(g, 26, 12, 1, 14, "#fff2b0"); // bow shine
        g.restore();
        px(g, 11, 19, 10, 1, "#e8f0ff"); // deel trim
        px(g, 15, 25, 2, 1, "#ffd93d"); // sash glint
        px(g, 12+A.hx, 2+hb, 8, 1, "#8a6a3a"); // fur trim shine
        break;
      case "mesa_shaman":
        g.save(); try { g.translate(A.hx, hb); } catch (eMs1) {}
        px(g, 12, -1, 2, 5, "#e06a2e"); px(g, 15, -1, 2, 5, "#ffd93d"); px(g, 18, -1, 2, 5, "#3a8a9a"); // feathers
        px(g, 9, 3, 14, 3, "#5a3a22"); // headband
        g.restore();
        px(g, 12, 18, 8, 3, "#3aa0a0"); px(g, 13, 19, 6, 1, "#ffd93d"); // turquoise necklace
        px(g, 11, 22, 10, 4, "#a03a2e"); px(g, 11, 24, 10, 1, "#222"); // stepped pattern
        g.save(); try { g.translate(A.rax, A.ra); } catch (eMs2) {}
        px(g, 24, 18, 3, 6, "#8a5a33"); px(g, 24, 16, 3, 3, "#e8d9b0"); // rattle
        px(g, 24, 16, 3, 1, "#fff2b0"); // rattle shine
        g.restore();
        px(g, 13, 18, 6, 3, "#3aa0a0"); px(g, 13, 19, 6, 1, "#ffd93d"); // turquoise necklace
        px(g, 15, 19, 2, 2, "#c93b3b"); // pendant
        px(g, 12, 23, 8, 1, "#ffd93d"); // stepped dots
        break;
      case "frost_skald":
        g.save(); try { g.translate(A.hx, hb); } catch (eFs1) {}
        px(g, 8, 2, 16, 8, "#8a9aaa"); px(g, 8, 2, 3, 14, "#8a9aaa"); px(g, 21, 2, 3, 14, "#8a9aaa"); // fur hood
        px(g, 11, 6, 10, 3, "#5a6a7a");
        g.restore();
        px(g, 11, 18, 10, 4, "#2a4a8a"); px(g, 14, 22, 4, 2, "#ffd93d"); // knotwork brooch
        g.save(); try { g.translate(A.hx, hb); } catch (eFs2) {}
        px(g, 10, 14, 12, 3, "#e8e4d8"); // beard wrap
        g.restore();
        g.save(); try { g.translate(A.rax, A.ra); } catch (eFs3) {}
        px(g, 22, 18, 6, 8, "#8a5a33"); px(g, 24, 12, 2, 7, "#6b4226"); // lyre
        px(g, 24, 13, 2, 10, "#d9c27f"); // strings
        g.restore();
        px(g, 15, 23, 2, 1, "#fff2b0"); // brooch glint
        px(g, 11+A.hx, 15+hb, 10, 1, "#fff"); // beard wrap shine
        px(g, 13+A.hx, 4+hb, 6, 1, "#aabaca"); // hood fur edge
        break;
      case "bandit":
        g.save(); try { g.translate(A.hx, hb); } catch (eBa1) {}
        px(g, 8, 0, 16, 4, "#3a2e22"); // low hood
        px(g, 10, 9, 12, 4, "#1c1c22"); // mask band over the eyes
        px(g, 22, 10, 3, 2, "#1c1c22"); // mask tie
        g.restore();
        px(g, 9, 24, 14, 2, "#5c1216"); // sash
        g.save(); try { g.translate(A.rax, A.ra); } catch (eBa2) {}
        px(g, 25, 14, 2, 10, "#9aa0a8"); px(g, 24, 23, 4, 2, "#5a3a22"); // short blade
        px(g, 25, 14, 1, 10, "#fff"); // blade shine
        g.restore();
        px(g, 15, 24, 2, 2, "#d9c27f"); // sash buckle
        px(g, 13+A.hx, 3+hb, 6, 1, "#4a3a2e"); // hood seam
        break;
      case "outlaw":
        g.save(); try { g.translate(A.hx, hb); } catch (eO11) {}
        px(g, 6, 7, 20, 3, "#2e2620"); px(g, 10, 2, 12, 6, "#2e2620"); // wide-brim hat
        px(g, 10, 2, 12, 1, "#d9c27f"); // hat trim
        g.restore();
        px(g, 9, 18, 14, 4, "#4a3a52"); // poncho yoke
        px(g, 11, 19, 10, 1, "#5a4a62"); // yoke stitch
        px(g, 9, 24, 14, 2, "#ffd93d"); // belt
        px(g, 15, 24, 2, 2, "#8a6a2e"); // belt buckle
        g.save(); try { g.translate(A.rax, A.ra); } catch (eO12) {}
        px(g, 25, 14, 2, 10, "#9aa0a8"); px(g, 25, 14, 1, 10, "#fff"); px(g, 24, 23, 4, 2, "#5a3a22"); // short blade
        g.restore();
        px(g, 13+A.hx, 3+hb, 6, 1, "#d9c27f"); // hat trim glint
        break;
      case "murderer":
        g.save(); try { g.translate(A.hx, hb); } catch (eMu1) {}
        px(g, 8, 2, 16, 9, "#3a0f14"); px(g, 8, 2, 3, 15, "#3a0f14"); px(g, 21, 2, 3, 15, "#3a0f14"); // dark cowl
        px(g, 11, 6, 10, 9, "#0c0a12"); // shadowed face
        g.fillStyle = "#ff3b3b"; g.fillRect(12, 10, 2, 2); g.fillRect(18, 10, 2, 2); // red glint
        px(g, 13, 14, 6, 1, "#7a1f1f"); // war paint
        g.restore();
        g.save(); try { g.translate(A.rax, A.ra); } catch (eMu2) {}
        px(g, 25, 14, 2, 10, "#c9ccd4"); px(g, 25, 14, 1, 10, "#fff"); px(g, 24, 23, 4, 2, "#5a3a22"); // long knife
        g.restore();
        px(g, 13+A.hx, 10+hb, 2, 1, "#ff8a8a"); px(g, 18+A.hx, 10+hb, 2, 1, "#ff8a8a"); // glint under the red eyes
        px(g, 15+A.hx, 15+hb, 2, 1, "#ff6a6a"); // war paint drip
        px(g, 10+A.hx, 3+hb, 12, 1, "#5a1a20"); // cowl edge stitch
        break;
      default:
        px(g, 9, 24, 14, 1, "#33333355");
        break;
    }
    // Heroes show their hairstyle with EVERY profession: strands, ridges,
    // tails and tufts peek out over helms/hoods/hats (NPC looks unchanged).
    if (baseKind === "player") {
      g.save(); try { g.translate(A.hx, hb); } catch (eH3) {} try { drawHairOver(g, (ap && ap.hairStyle) || "short", hairC, race); } catch (e) { } g.restore();
    }
    // heroes always show their gear, whatever outfit they borrow (NPC
    // role-props stay as cosmetic extras underneath).
    if (baseKind === "player") {
      drawPlayerArmor(g, gear); // equipped armor over the outfit
      g.save(); try { g.translate(A.lax, A.la); } catch (eS) {} try { drawPlayerShield(g, gear); } catch (eS2) {} g.restore(); // shield rides the left arm
      g.save(); try { g.translate(A.rax, A.ra); } catch (eW) {} try { drawPlayerWeapon(g, gear); } catch (eW2) {} g.restore(); // weapon rides the raised right arm
      g.save(); try { g.translate(A.lax, A.la); } catch (eO) {} try { drawPlayerOffhandWeapon(g, gear); } catch (eO2) {} g.restore(); // off-hand rides the left arm
    }
    // face extras sit on the head, so they nod with it
    if (ap && ap.accessory) { g.save(); try { g.translate(A.hx, hb); } catch (eA) {} try { drawAccessory(g, ap.accessory, hairC); } catch (e) { } g.restore(); }
    return c;
  }

  function shade(hex, amt) {
    const n = parseInt(String(hex).slice(1), 16);
    if (isNaN(n)) return hex;
    let r = (n >> 16) + amt, gg = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); gg = Math.max(0, Math.min(255, gg)); b = Math.max(0, Math.min(255, b));
    return "#" + ((r << 16) | (gg << 8) | b).toString(16).padStart(6, "0");
  }

  // Gender post-pass for BEASTS (mobs + bosses — never player/NPC roles,
  // whose dimorphism is structural inside drawActor). Males darken, females
  // lighten and run ~10% smaller, anchored at the feet; genderless passes
  // through untouched. Runs once per cached variant, not per frame.
  function genderFX(c, gen) {
    try {
      if (gen !== "male" && gen !== "female") return c;
      const n = document.createElement("canvas"); n.width = 32; n.height = 40;
      const g = n.getContext("2d"); g.imageSmoothingEnabled = false;
      if (gen === "female") {
        const s = 0.9, dw = 32 * s, dh = 40 * s;
        g.drawImage(c, (32 - dw) / 2, 40 - dh, dw, dh);
        g.globalCompositeOperation = "source-atop";
        g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(0, 0, 32, 40);
      } else {
        g.drawImage(c, 0, 0);
        g.globalCompositeOperation = "source-atop";
        g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, 0, 32, 40);
      }
      g.globalCompositeOperation = "source-over";
      return n;
    } catch (e) { return c; }
  }
  function isHumanoidKind(kind) {
    try {
      if (kind === "player") return true;
      const A = window.Appearance;
      if (A && Array.isArray(A.OUTFITS) && A.OUTFITS.includes(kind)) return true;
    } catch (e) {}
    return false;
  }
  function sexOf(ent) {
    try {
      const s = String((ent && ent.gender) || "").toLowerCase();
      return (s === "male" || s === "female") ? s : "";
    } catch (e) { return ""; }
  }
  // Canonical overworld appearance for any entity — MUST mirror game.js drawEntity.
  // Player (or remote player): actor("player", tint, seed, gear, appearance).
  // NPC (no kind): actor(role, tint, id, null, appearance).
  // Mob/boss: actor(kind, tint, kind). Portraits use this so they can never drift.
  function spriteRefFor(ent) {
    ent = ent || {};
    // Missing appearance = legacy path (seed variety), never a forced default.
    const app = (ent.appearance && typeof ent.appearance === "object") ? ent.appearance : null;
    if (ent.kind === "player" || ent.id === "player" || ent.isRemotePlayer) {
      let gear = null;
      try { gear = gearFor(ent); } catch (e) { gear = null; }
      if (!gear && (ent.w || ent.a || ent.s || ent.o)) gear = { w: ent.w || null, a: ent.a || null, s: ent.s || null, o: ent.o || null };
      else if (!gear && ent.equipment && (ent.equipment.weapon || ent.equipment.armor || ent.equipment.shield)) {
        gear = { w: ent.equipment.weapon || null, a: ent.equipment.armor || null, s: ent.equipment.shield || null, o: null };
      }
      // callers passing a bare equipment object (drawEntity / portraits):
      // re-resolve through gearFor when hotbar is present so the off-hand
      // weapon + worn shield ride the same cache key as the overworld.
      if (gear && ent && (ent.hotbar || ent.offhandSlot != null)) {
        try {
          const full = gearFor({ equipment: { weapon: gear.w, armor: gear.a, shield: gear.s }, w: gear.w, a: gear.a, s: gear.s, hotbar: ent.hotbar, offhandSlot: ent.offhandSlot });
          if (full) gear = full;
        } catch (e) { }
      }
      return { kind: "player", tint: ent.tint || "#4da3ff", seed: ent.remoteHash || "p", gear, app, gen: sexOf(ent) };
    }
    if (ent.kind && ent.kind !== "npc") {
      // revealed doppelgangers wear their true monster face (portraits + map)
      try {
        if (ent.isDoppelganger && ent.doppelRevealed) {
          let tt = "#6a4a8a";
          try { tt = ((window.CFG.MOB_TEMPLATES || {}).doppelganger || {}).tint || tt; } catch (e2) { }
          return { kind: "doppelganger", tint: tt, seed: "doppelganger", gear: null, app: null, gen: "" };
        }
      } catch (e) { }
      return { kind: ent.kind, tint: ent.tint || "#ffffff", seed: ent.kind, gear: null, app: null, gen: sexOf(ent) };
    }
    const role = ent.role || "villager";
    // v17 civilized demons render as their demon kind, never as villagers.
    // v19: EVERY hell resident (demon holds + hell castle) renders as a
    // civilized demon — residentLookFor covers mapped roles, remaps service
    // roles (healer/scholar/guard) to demon kinds, and deals unmapped roles
    // a stable per-NPC demon from the civilized pool. Roles, behavior and
    // trade are untouched — looks only. Surface rendering is unchanged.
    let rk = role === "guard" ? "guard" : role;
    try {
      let hellRes = false;
      try { hellRes = !!(window.Hell && window.Hell.isHellResident && window.Hell.isHellResident(ent)); } catch (e2) { }
      // Party members (local + remote + roster ids) are travelers — they keep
      // their own faces and NEVER take the hell-resident remap, even if a
      // stale dim/chunkKey says hell. True demons by role (hell_guard,
      // civilized_*, ...) still render as demons everywhere via ROLE_DEMON
      // (they started as demons); normal roles never do.
      let isParty = false;
      try {
        isParty = !!(ent.inParty || ent.isRemoteParty);
        if (!isParty && ent.id && window.Game && window.Game.G && window.Game.G.player) {
          const pp = window.Game.G.player.party || [];
          if (pp.indexOf(ent.id) >= 0) isParty = true;
        }
      } catch (e3) {}
      let heavRes = false;
      try { heavRes = !!(window.Heaven && window.Heaven.isHeavenResident && window.Heaven.isHeavenResident(ent)); } catch (e4) { }
      if (!isParty && heavRes && window.HeavenMobs && window.HeavenMobs.residentLookFor) rk = window.HeavenMobs.residentLookFor(role, ent.id || ent.name);
      else if (!isParty && hellRes && window.HellMobs && window.HellMobs.residentLookFor) rk = window.HellMobs.residentLookFor(role, ent.id || ent.name);
      else if (window.HeavenMobs && window.HeavenMobs.ROLE_ANGEL && window.HeavenMobs.ROLE_ANGEL[role]) {
        rk = window.HeavenMobs.ROLE_ANGEL[role];
      }
      else if (window.HellMobs && window.HellMobs.ROLE_DEMON && window.HellMobs.ROLE_DEMON[role]) {
        // Party members with TRUE demon roles keep their demon faces
        // (they were recruited as demons); normal-role party members never
        // reach here since ROLE_DEMON only lists hell/civilized kinds.
        rk = window.HellMobs.ROLE_DEMON[role];
      }
    } catch (e) { }
    try {
      if (ent.isDoppelganger && ent.doppelRevealed) {
        let tt = "#6a4a8a";
        try { tt = ((window.CFG.MOB_TEMPLATES || {}).doppelganger || {}).tint || tt; } catch (e2) { }
        return { kind: "doppelganger", tint: tt, seed: "doppelganger", gear: null, app: null, gen: "" };
      }
    } catch (e) { }
    return { kind: rk, tint: ent.tint || "#4da3ff", seed: ent.id || ent.name || "x", gear: null, app, gen: sexOf(ent) };
  }

  function drawPortrait(npc, size = 64, hideRole = false) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    npc = npc || {};
    // blank portrait: empty frame, no sprite — used when a voice should have
    // no face (e.g. the first-fragment goddess vision).
    if (npc.blank || npc.kind === "blank" || npc.kind === "none") {
      g.fillStyle = "#0d141b"; g.fillRect(0, 0, size, size);
      g.fillStyle = "rgba(255,255,255,0.06)";
      g.fillRect(0, 0, size, Math.max(1, Math.round(size * 0.12)));
      if (!hideRole) {
        const k = size / 64;
        const label = String(npc.role || "?");
        g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 50 * k, 64 * k, 14 * k);
        g.fillStyle = "#fff"; g.textAlign = "center";
        let fs = 10 * k;
        try {
          g.font = `${fs}px sans-serif`;
          const w = g.measureText(label).width;
          if (w > 62 * k && w > 0) fs = (fs * 62 * k) / w;
        } catch (e) { }
        g.font = `${fs}px sans-serif`;
        g.fillText(label, 32 * k, 60 * k);
      }
      return c;
    }
    const ref = spriteRefFor(npc);
    // background stays per-identity (variety) — the SPRITE is what must match.
    // Silhouettes get a fixed ominous backdrop instead (no identity to vary).
    const h = hashStr(String(npc.id || npc.name || "x"));
    const bg = npc.silhouette ? "#16122a" : `hsl(${h % 360} 40% 22%)`;
    g.fillStyle = bg; g.fillRect(0, 0, size, size);
    g.fillStyle = npc.silhouette ? "rgba(150,120,255,0.08)" : "rgba(255,255,255,0.06)";
    g.fillRect(0, 0, size, Math.max(1, Math.round(size * 0.12)));
    // the overworld sprite itself, pixel-identical (shared cache), scaled up
    let spr = null;
    try { spr = window.Sprites.actor(ref.kind, ref.tint, ref.seed, ref.gear || null, ref.app || null, ref.gen || ""); } catch (e) { spr = null; }
    if (spr) {
      const scale = (size * 0.9) / 40;
      const dw = Math.max(1, Math.round(32 * scale));
      const dh = Math.max(1, Math.round(40 * scale));
      const dx = Math.round((size - dw) / 2);
      const dy = Math.round(size - dh - size * 0.02);
      if (npc.silhouette) {
        // dark silhouette: the shape with no face — an unknown presence.
        // (Mask on a temp canvas so the source-in fill can't touch the bg.)
        try {
          const t = document.createElement("canvas"); t.width = dw; t.height = dh;
          const tg = t.getContext("2d"); tg.imageSmoothingEnabled = false;
          tg.drawImage(spr, 0, 0, dw, dh);
          tg.globalCompositeOperation = "source-in";
          tg.fillStyle = "#050508"; tg.fillRect(0, 0, dw, dh);
          tg.globalCompositeOperation = "source-over";
          g.drawImage(t, dx, dy);
        } catch (e) { try { g.drawImage(spr, dx, dy, dw, dh); } catch (e2) {} }
      } else {
        try { g.drawImage(spr, dx, dy, dw, dh); } catch (e) { }
      }
    }
    // role banner: the FULL class name, shrunk to fit — never truncated
    // (demon classes like civilized_succubus are long). HUD panels that show
    // the class separately can still opt out via hideRole.
    if (!hideRole) {
      const k = size / 64;
      const label = String(npc.role || "?");
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 50 * k, 64 * k, 14 * k);
      g.fillStyle = "#fff"; g.textAlign = "center";
      let fs = 10 * k;
      try {
        g.font = `${fs}px sans-serif`;
        const w = g.measureText(label).width;
        if (w > 62 * k && w > 0) fs = (fs * 62 * k) / w;
      } catch (e) { }
      g.font = `${fs}px sans-serif`;
      g.fillText(label, 32 * k, 60 * k);
    }
    return c;
  }

  // Boats are masks under the sailor, same treatment as ridden mounts:
  // 32x32 canvases drawn 1.5x under the player sprite.
  const boatCache = {};
  function drawBoat(kind) {
    const c = cv(); const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    if ((kind || "raft") !== "raft") {
      // planked hull (future boats): dark shell, pale inner, bench seats
      px(g, 9, 2, 14, 28, "#4a2f1a");
      px(g, 10, 3, 12, 26, "#6b4226");
      px(g, 12, 5, 8, 22, "#8a5a33");
      px(g, 12, 5, 8, 2, "#a97648");
      px(g, 12, 12, 8, 3, "#4a2f1a");
      px(g, 12, 20, 8, 3, "#4a2f1a");
      px(g, 11, 3, 2, 26, "#a97648");
      px(g, 19, 3, 2, 26, "#a97648");
      return c;
    }
    // raft: five lashed logs seen from above, rope lashings across
    const logs = ["#8a5a33", "#7a4e2c", "#94643a", "#7a4e2c", "#8a5a33"];
    for (let i = 0; i < 5; i++) {
      const y = 4 + i * 5;
      px(g, 3, y, 26, 4, "#3a2415");
      px(g, 3, y, 26, 3, logs[i]);
      px(g, 3, y, 26, 1, "#b08355");
      px(g, 3, y + 1, 2, 2, "#5c3a20");
      px(g, 27, y + 1, 2, 2, "#5c3a20");
    }
    px(g, 8, 3, 2, 26, "#c9a45a");
    px(g, 22, 3, 2, 26, "#c9a45a");
    px(g, 8, 3, 2, 1, "#e8cf8a");
    px(g, 22, 3, 2, 1, "#e8cf8a");
    px(g, 8, 15, 2, 2, "#8a6c34");
    px(g, 22, 15, 2, 2, "#8a6c34");
    return c;
  }
  function boat(kind) {
    const k = kind || "raft";
    if (!boatCache[k]) boatCache[k] = drawBoat(k);
    return boatCache[k];
  }

  function chestSprite(opened) {
    // Transparent: POIs composite over whatever ground is baked below, so
    // chests read on sand, path, townstone... — never a grass square again.
    // Outline is baked into the pixels (static design, zero per-frame cost).
    const c = cv(); const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    // soft ground shadow (low alpha: grounds it, takes no outline ring)
    g.fillStyle = "rgba(0,0,0,0.28)"; g.fillRect(7, 27, 18, 3);
    const top = opened ? 20 : 16;
    g.fillStyle = "#4a2c14"; g.fillRect(7, top, 18, 12); // dark rim
    g.fillStyle = "#6b4226"; g.fillRect(8, top + 1, 16, 10);
    g.fillStyle = "#8a5a33"; g.fillRect(8, top + 1, 16, 4);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(8, top + 1, 16, 1);
    g.fillStyle = "#3a2412"; g.fillRect(8, top + 5, 16, 1);
    if (!opened) { g.fillStyle = "#ffd93d"; g.fillRect(14, 20, 4, 5); g.fillStyle = "#fff2b0"; g.fillRect(15, 21, 1, 2); }
    else { g.fillStyle = "#1a1210"; g.fillRect(9, 20, 14, 4); g.fillStyle = "#ffd93d"; g.fillRect(11, 15, 4, 4); g.fillStyle = "#fff2b0"; g.fillRect(12, 16, 1, 2); }
    return bakeOutline(c, 26, 18, 10);
  }

  makeTiles();
  // Actor sprite cache: NPC/hero looks are keyed per-identity (id + look),
  // so a long expedition could pin hundreds of 32x40 canvases (= hundreds
  // of GPU textures) forever. LRU-cap it — the working set in view is a
  // few dozen, so 400 entries never evicts anything visible.
  const actorCache = new Map();
  const ACTOR_CACHE_MAX = 400;
  function appearanceKey(app) {
    try {
      if (!app) return "";
      return window.Appearance ? window.Appearance.key(app) : "";
    } catch (e) { return ""; }
  }
  function actor(kind, tint, seed, gear, app, gen, ph) {
    gen = (gen === "male" || gen === "female") ? gen : "";
    // limb-animation pose (7th arg from drawEntity): humanoid painters
    // re-render real leg/arm cycles; portraits pass nothing -> rest frame.
    let bk = "";
    try {
      if (window.Anim) {
        if (ph) bk = "|" + window.Anim.bucket(ph);
        else ph = window.Anim.normP(null);
      }
    } catch (e) { ph = { f: 0, moving: false, hurt: false, atk: false, atkKind: "melee", idle: 0, t: 0 }; }
    const key = kind + "|" + tint + "|" + seed + "|" + gearCacheKey(gear || null) + "|" + appearanceKey(app || null) + "|" + gen + bk;
    let hit = actorCache.get(key);
    if (hit) { try { actorCache.delete(key); actorCache.set(key, hit); } catch (e) {} return hit; }
    let spr = drawActor(kind, tint, seed, gear || null, app || null, gen, ph);
    // beasts get the gender post-pass; humanoids already carry it structurally
    if (gen && !isHumanoidKind(kind)) { try { spr = genderFX(spr, gen); } catch (e) {} }
    try {
      actorCache.set(key, spr);
      if (actorCache.size > ACTOR_CACHE_MAX) { const fk = actorCache.keys().next().value; actorCache.delete(fk); }
    } catch (e) {}
    return spr;
  }
  // Chest sprites are requested for EVERY chest in view EVERY frame, and the
  // old chestSprite() allocated a fresh canvas per call (several canvases per
  // frame at 60fps = constant GC + GPU upload churn). Two states exist, so
  // cache both canvases once.
  const chestCache = {};
  function chestCached(opened) {
    const k = opened ? "open" : "shut";
    if (!chestCache[k]) chestCache[k] = chestSprite(opened);
    return chestCache[k];
  }
  // GPU context loss (large canvases, driver reset) blanks every cached
  // canvas: drop them all and rebuild the tile set so the next frame
  // repaints from live textures instead of dead ones.
  function resetCaches() {
    try { actorCache.clear(); } catch (e) {}
    try { for (const k of Object.keys(chestCache)) delete chestCache[k]; } catch (e) {}
    try { for (const k of Object.keys(boatCache)) delete boatCache[k]; } catch (e) {}
    // mob/boss paint caches live in their wrapper modules — they register
    // clearers here so one call drops every dead texture.
    try {
      const regs = window.__spriteCacheResets || [];
      for (const fn of regs) { try { fn(); } catch (e2) {} }
    } catch (e) {}
    try { makeTiles(); } catch (e) {}
  }
  return { tiles, tileVariants, tileFor, tileVariantIndex, OVERLAY_TILES, GROUNDLIKE, actor, drawActor, drawPortrait, spriteRefFor, gearFor, genderFX, chestSprite: chestCached, boat, TILE_SIZE: S, resetCaches,
    drawPlayerWeapon, drawPlayerShield, drawPlayerOffhandWeapon, drawPlayerArmor, px, drawWaterMotifs, drawReflection, waterFlow, drawBridgeWater, drawBridgePlanks };
})();
