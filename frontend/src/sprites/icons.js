/* Emberhold icon engine: every item/spell/tree/status icon as pixel art.
   Weapons, armor and shields are rendered from the live in-game sprite
   painters (item only, no player); torch crops the torch-sconce tile and the
   raft reuses the boat sprite. Everything else (ammo, potions, materials,
   rings, tomes, kits, spells, trees, buffs) is bespoke pixel art drawn here.
   No emojis anywhere on this road. window.Icons */
window.Icons = (() => {
  const GRID = 24;
  const cache = {}; // "kind:id" -> dataURL
  function px(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function R(g, x, y, c) { px(g, x, y, 1, 1, c || "#fff"); }
  // ---- palette ----
  const EL = { fire: "#ff7b2e", ice: "#bfe9ff", electric: "#fff7ae", water: "#4fc3ef", holy: "#ffd93d", nature: "#7ddf6b", physical: "#c9ccd4" };
  const METAL = { wood: "#8a5a33", rusty: "#9aa0a8", iron: "#c9ccd4", steel: "#eef2f6", silver: "#f4f6ff", mythril: "#9adcff", dragonbone: "#ffb02e", holy: "#fff7ae", dawnstone: "#ffd93d", oblivion: "#6a2a9a" };
  // ---- autocrop transparent pixels (1px pad), then fit centered in GRID ----
  function crop(c, pad) {
    try {
      const g = c.getContext("2d");
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      if (x1 < 0) return c;
      const p = pad == null ? 1 : pad;
      x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p);
      x1 = Math.min(c.width - 1, x1 + p); y1 = Math.min(c.height - 1, y1 + p);
      const o = cv(x1 - x0 + 1, y1 - y0 + 1);
      o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
      return o;
    } catch (e) { return c; }
  }
  function fit(c) {
    try {
      const o = cv(GRID, GRID), g = o.getContext("2d");
      g.imageSmoothingEnabled = false;
      const s = Math.min(GRID / c.width, GRID / c.height, 1);
      const w = Math.max(1, Math.round(c.width * s)), h = Math.max(1, Math.round(c.height * s));
      g.drawImage(c, 0, 0, c.width, c.height, ((GRID - w) / 2) | 0, ((GRID - h) / 2) | 0, w, h);
      return o;
    } catch (e) { return c; }
  }
  function urlOf(key, painter) {
    try {
      if (cache[key]) return cache[key];
      const c = painter();
      const u = fit(crop(c)).toDataURL();
      cache[key] = u;
      return u;
    } catch (e) { return ""; }
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // ================= live in-game sprite pieces (item only) =================
  function liveWeapon(id) {
    const c = cv(32, 40), g = c.getContext("2d");
    try { window.Sprites.drawPlayerWeapon(g, { w: id }); } catch (e) { }
    return c;
  }
  function liveArmor(id) {
    const c = cv(32, 40), g = c.getContext("2d");
    try { window.Sprites.drawPlayerArmor(g, { a: id }); } catch (e) { }
    return c;
  }
  function liveShield(id) {
    const c = cv(32, 40), g = c.getContext("2d");
    try { window.Sprites.drawPlayerShield(g, { s: id }); } catch (e) { }
    return c;
  }
  function torchLive() {
    // torch sconce tile (in-game look), haft + wrap + flame only, no stone
    const o = cv(12, 32), g = o.getContext("2d");
    try {
      const t = window.Sprites.tiles[17];
      g.drawImage(t, 11, 0, 12, 32, 0, 0, 12, 32);
    } catch (e) { }
    return o;
  }
  function raftLive() {
    try {
      const b = window.Sprites.boat("raft");
      if (b) { const o = cv(b.width, b.height); o.getContext("2d").drawImage(b, 0, 0); return crop(o, 0); }
    } catch (e) { }
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 3, 12, 18, 6, "#6b4226"); px(g, 3, 12, 18, 1, "#a06a3a");
    for (let x = 5; x < 21; x += 4) px(g, x, 12, 1, 6, "#3a2412");
    return o;
  }
  // ================= small custom painters (24x24) =================
  function arrowIcon(id) {
    const o = cv(24, 24), g = o.getContext("2d");
    let head = "#c9ccd4", el = null;
    if (/oblivion/.test(id)) head = "#6a2a9a";
    else if (/dawnstone/.test(id)) head = "#ffd93d";
    else if (/dragonbone/.test(id)) head = "#ffb02e";
    else if (/mythril/.test(id)) head = "#9adcff";
    else if (/silver/.test(id)) head = "#f4f6ff";
    else if (/steel/.test(id)) head = "#eef2f6";
    else if (/poison/.test(id)) { head = "#7ddf6b"; el = "water"; }
    else if (/cinder/.test(id)) { head = "#ff7b2e"; el = "fire"; }
    else if (/frost/.test(id)) { head = "#bfe9ff"; el = "ice"; }
    px(g, 3, 11, 14, 2, "#8a5a33"); px(g, 3, 11, 14, 1, "#a06a3a"); // shaft
    px(g, 15, 10, 5, 4, head); px(g, 15, 10, 5, 1, "#fff"); // head
    px(g, 2, 9, 3, 6, el ? EL[el] : "#e8e0d0"); px(g, 2, 9, 1, 6, "#fff"); // fletch
    return o;
  }
  function shurikenIcon(id) {
    const o = cv(24, 24), g = o.getContext("2d");
    let m = "#c9ccd4";
    if (/oblivion/.test(id)) m = "#6a2a9a";
    else if (/dawnstone/.test(id)) m = "#ffd93d";
    else if (/dragonbone/.test(id)) m = "#ffb02e";
    else if (/mythril/.test(id)) m = "#9adcff";
    else if (/silver/.test(id)) m = "#f4f6ff";
    else if (/steel/.test(id)) m = "#eef2f6";
    px(g, 10, 3, 4, 18, m); px(g, 3, 10, 18, 4, m);
    px(g, 10, 3, 4, 2, "#fff"); px(g, 3, 10, 2, 4, "#fff");
    px(g, 11, 4, 2, 3, "#555"); px(g, 4, 11, 3, 2, "#555");
    px(g, 11, 10, 2, 4, "#333"); px(g, 10, 11, 4, 2, "#333"); // hub
    R(g, 12, 12, "#fff");
    return o;
  }
  function bombIcon(smoke) {
    const o = cv(24, 24), g = o.getContext("2d");
    if (smoke) {
      px(g, 7, 8, 10, 10, "#9aa0a8"); px(g, 9, 6, 6, 14, "#c9ccd4");
      px(g, 9, 8, 6, 2, "#eef2f6"); R(g, 11, 11, "#fff"); R(g, 13, 13, "#eef2f6");
      return o;
    }
    px(g, 7, 9, 11, 11, "#23232c"); px(g, 8, 10, 9, 9, "#3a3a48");
    px(g, 8, 10, 9, 2, "#55556a"); R(g, 10, 12, "#8a8a92");
    px(g, 14, 5, 3, 4, "#8a5a33"); // fuse
    px(g, 15, 2, 4, 3, "#ff7b2e"); px(g, 16, 1, 2, 1, "#ffd93d"); // spark
    return o;
  }
  function flaskIcon(body, cap, glow) {
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 10, 3, 4, 3, cap || "#8a5a33"); // cork
    px(g, 9, 6, 6, 2, "#c9ccd4"); // neck
    px(g, 6, 8, 12, 12, body); px(g, 6, 8, 12, 2, "#ffffff");
    px(g, 6, 8, 2, 12, "#ffffff");
    px(g, 8, 12, 3, 6, glow || "#ffffff"); // shine
    px(g, 6, 18, 12, 2, "rgba(0,0,0,0.25)"); // base shade
    return o;
  }
  function potionFor(id) {
    if (id === "mana_potion") return flaskIcon("#3f8ef0", "#2a5a8a", "#bfe9ff");
    if (id === "antidote") return flaskIcon("#5dd68a", "#2a6a3a", "#d0ffd0");
    if (id === "burn_salve") return flaskIcon("#ff7b2e", "#7a3a1a", "#ffd9b0");
    if (id === "warm_brew") return flaskIcon("#c96b2e", "#5a3a22", "#ffd9a0");
    if (id === "focus_tea") return flaskIcon("#7ddf6b", "#3a5a2f", "#e0ffd0");
    if (id === "clear_drops") return flaskIcon("#7fd6ff", "#2a6a8a", "#ffffff");
    if (id === "panacea_brew") return flaskIcon("#c77dff", "#5a2a8a", "#ffe0ff");
    if (id === "dawn_ember") return flaskIcon("#ff9d2e", "#5a2a10", "#fff7ae");
    if (id === "crimson_rage") return flaskIcon("#c92a2a", "#3a0a0a", "#ffb0b0");
    if (id === "ironmind_draught") return flaskIcon("#7fc4ff", "#1a3a5a", "#ffffff");
    if (id === "swiftshade") return flaskIcon("#c9ccd4", "#3a3a44", "#ffffff");
    return flaskIcon("#e04a4a", "#7a2a1a", "#ffb0b0"); // potion
  }
  function herbIcon(leaf, stem) {
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 11, 12, 2, 9, stem || "#3a5a2f"); // stem
    px(g, 6, 8, 6, 7, leaf); px(g, 12, 5, 7, 8, leaf); // two leaves
    px(g, 6, 8, 6, 1, "#fff"); px(g, 12, 5, 7, 1, "#fff");
    px(g, 8, 10, 2, 4, "rgba(0,0,0,0.25)"); px(g, 14, 7, 2, 5, "rgba(0,0,0,0.25)");
    R(g, 14, 9, "#fff");
    return o;
  }
  function oreIcon(nug, rock) {
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 5, 9, 14, 11, rock || "#6a6a72"); px(g, 5, 9, 14, 2, "#9a9aa2");
    px(g, 7, 7, 5, 4, rock || "#6a6a72"); px(g, 13, 6, 6, 5, rock || "#6a6a72");
    px(g, 8, 12, 4, 4, nug); px(g, 12, 14, 5, 4, nug); px(g, 9, 16, 3, 2, nug);
    R(g, 9, 13, "#fff"); R(g, 13, 15, "#fff");
    return o;
  }
  function gemIcon(c) {
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 8, 6, 8, 4, c); px(g, 7, 10, 10, 6, c); px(g, 9, 16, 6, 4, c);
    px(g, 8, 6, 8, 1, "#fff"); px(g, 9, 10, 2, 6, "#fff");
    px(g, 7, 10, 10, 1, "#fff");
    R(g, 10, 12, "#fff");
    return o;
  }
  function logIcon(bark, heart) {
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 4, 9, 16, 8, bark); px(g, 4, 9, 16, 1, heart || "#a06a3a");
    for (let x = 5; x < 20; x += 4) px(g, x, 10, 1, 6, "rgba(0,0,0,0.25)");
    px(g, 19, 9, 3, 8, heart || "#c9a45a"); // cut end
    px(g, 20, 10, 1, 6, "#8a6c46"); px(g, 20, 12, 1, 2, "#5a3a22");
    return o;
  }
  function materialFor(id) {
    switch (id) {
      case "wood": return logIcon("#6b4226", "#a06a3a");
      case "frostwood_log": return logIcon("#7fa8bc", "#e8faff");
      case "emberwood_log": return logIcon("#5a3220", "#ff9d2e");
      case "yggdrasil_branch": return logIcon("#6b6a2a", "#e8f5a0");
      case "stone": return oreIcon("#8a8a92", "#55555f");
      case "iron_ore": return oreIcon("#c9ccd4", "#55555f");
      case "silver_ore": return oreIcon("#f4f6ff", "#55555f");
      case "mythril_ore": return oreIcon("#9adcff", "#3a5a66");
      case "clay": return oreIcon("#a06a4a", "#7a4a30");
      case "brick": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 4, 9, 16, 8, "#a03a2a"); px(g, 4, 9, 16, 1, "#d96a55"); px(g, 4, 12, 16, 1, "#5e2018"); px(g, 11, 9, 1, 8, "#5e2018"); return o; }
      case "plank_bundle": { const o = cv(24, 24), g = o.getContext("2d"); for (let i = 0; i < 3; i++) { px(g, 4, 7 + i * 5, 16, 4, "#8a5a33"); px(g, 4, 7 + i * 5, 16, 1, "#b08355"); } return o; }
      case "glass_pane": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 6, 4, 12, 16, "#9adcff"); px(g, 6, 4, 12, 16, "rgba(255,255,255,0.25)"); px(g, 6, 4, 12, 1, "#fff"); px(g, 6, 4, 1, 16, "#fff"); px(g, 8, 6, 2, 8, "#fff"); return o; }
      case "quartz_crystal": return gemIcon("#cfe8ff");
      case "ruby_gem": return gemIcon("#ff3b3b");
      case "sapphire_gem": return gemIcon("#3f8ef0");
      case "emerald_gem": return gemIcon("#5dd68a");
      case "rime_crystal": return gemIcon("#dff2fb");
      case "ember_core": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 7, 8, 10, 10, "#3a1a10"); px(g, 8, 9, 8, 8, "#ff7b2e"); px(g, 10, 11, 4, 4, "#ffd93d"); R(g, 11, 12, "#fff"); return o; }
      case "storm_feather": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 11, 4, 2, 16, "#e8ecf2"); px(g, 7, 6, 4, 10, "#e8f4ff"); px(g, 13, 6, 4, 10, "#bfe9ff"); px(g, 7, 6, 4, 1, "#fff"); px(g, 13, 6, 4, 1, "#fff"); return o; }
      case "tide_pearl": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 7, 7, 10, 10, "#f2e8f2"); px(g, 7, 7, 10, 3, "#fff"); R(g, 10, 10, "#fff"); px(g, 12, 12, 4, 4, "#e8bfe8"); return o; }
      case "holy_bead": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 9, 6, 6, 12, "#ffd93d"); px(g, 9, 6, 6, 2, "#fff7ae"); px(g, 11, 9, 2, 6, "#c9a227"); R(g, 10, 8, "#fff"); return o; }
      case "unicorn_hair": { const o = cv(24, 24), g = o.getContext("2d"); for (let i = 0; i < 4; i++) px(g, 6 + i * 3, 5 + ((i % 2) * 2), 2, 14, "#f2f2ff"); px(g, 5, 5, 14, 2, "#ffd93d"); return o; }
      case "dragon_bone": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 5, 10, 14, 3, "#e8dcbc"); px(g, 5, 8, 3, 7, "#e8dcbc"); px(g, 16, 8, 3, 7, "#e8dcbc"); px(g, 6, 9, 1, 1, "#fff"); px(g, 17, 9, 1, 1, "#fff"); return o; }
      case "dragon_horn": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 8, 5, 8, 3, "#ffb02e"); px(g, 9, 8, 6, 4, "#e8dcbc"); px(g, 10, 12, 4, 7, "#d9cfae"); px(g, 10, 12, 1, 7, "#fff"); return o; }
      case "dawnstone_shard": return gemIcon("#ffd93d");
      case "wolf_hide": { const o = cv(24, 24), g = o.getContext("2d"); px(g, 5, 7, 14, 11, "#9c8a6a"); px(g, 5, 7, 14, 2, "#c9b98a"); px(g, 8, 10, 8, 5, "#7a6a4e"); px(g, 5, 16, 3, 3, "#9c8a6a"); px(g, 16, 16, 3, 3, "#9c8a6a"); return o; }
      case "herb": return herbIcon("#4a9a4a");
      case "sage_herb": return herbIcon("#5a8a6a");
      case "cinder_herb": return herbIcon("#c96b2e");
      case "calm_herb": return herbIcon("#4a7a9a");
      case "bright_herb": return herbIcon("#b8a02e");
      default: return oreIcon("#9a9aa2", "#55555f");
    }
  }
  function ringFor(id) {
    let gem = "#c9ccd4", band = "#c9a227";
    try {
      const it = window.Items.ITEMS[id];
      if (it && it.boost) {
        const b = it.boost;
        if (b.fire) gem = EL.fire; else if (b.ice) gem = EL.ice; else if (b.electric) gem = EL.electric;
        else if (b.water) gem = EL.water; else if (b.holy) gem = EL.holy; else if (b.physical) gem = "#ff6b6b";
        else if (b.nature) gem = EL.nature;
      }
    } catch (e) { }
    if (/scholar|mercy/.test(id)) gem = "#7fd4ff";
    if (/lucky|oath/.test(id)) band = "#8a6a3a";
    if (/throne/.test(id)) { gem = "#3a1a5a"; band = "#55555f"; }
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 7, 8, 10, 10, band); px(g, 9, 10, 6, 6, "#101018");
    px(g, 7, 8, 10, 1, "#fff2b0");
    px(g, 9, 4, 6, 5, gem); px(g, 10, 5, 4, 3, gem);
    px(g, 9, 4, 6, 1, "#fff"); R(g, 11, 6, "#fff");
    return o;
  }
  function tomeFor(id) {
    // element band from the granted spell when known
    let el = "holy";
    try {
      const abId = id.replace(/^tome_/, "");
      const ab = window.CFG.ABILITIES[abId];
      if (ab && ab.element && EL[ab.element]) el = ab.element;
    } catch (e) { }
    const o = cv(24, 24), g = o.getContext("2d");
    px(g, 6, 3, 12, 18, "#5a3a22"); px(g, 6, 3, 2, 18, "#7d5230"); // cover + spine
    px(g, 8, 5, 8, 14, "#e8e0d0"); // pages
    px(g, 8, 5, 8, 3, EL[el]); // element band
    px(g, 10, 10, 4, 6, EL[el]); // glyph bar
    px(g, 10, 10, 4, 1, "#fff");
    R(g, 12, 13, "#fff");
    px(g, 6, 19, 12, 2, "#3a2412");
    return o;
  }
  function questFor(id) {
    const o = cv(24, 24), g = o.getContext("2d");
    if (/sphere/i.test(id)) {
      const c = /heavenly/i.test(id) ? "#ffd93d" : /hell/i.test(id) ? "#3a0a1a" : "#7fc4ff";
      px(g, 6, 6, 12, 12, c); px(g, 6, 6, 12, 3, "#fff"); px(g, 6, 6, 3, 12, "#fff");
      R(g, 10, 10, "#fff"); px(g, 12, 12, 4, 4, "rgba(255,255,255,0.5)");
      if (/heavenly/i.test(id)) { px(g, 4, 10, 2, 4, "#fff7ae"); px(g, 18, 10, 2, 4, "#fff7ae"); }
      return o;
    }
    if (/fragment/i.test(id)) { px(g, 9, 4, 6, 16, "#c22e1f"); px(g, 9, 4, 6, 2, "#ff9d2e"); R(g, 11, 8, "#ffd93d"); return o; }
    if (/holy_water/i.test(id)) return flaskIcon("#7fd6ff", "#c9a227", "#fff");
    // mysterious package: sealed parcel
    px(g, 5, 9, 14, 10, "#8a5a33"); px(g, 5, 9, 14, 1, "#b08355");
    px(g, 10, 9, 4, 10, "#c92a2a"); px(g, 5, 12, 14, 2, "#c92a2a"); // seal bands
    px(g, 10, 12, 4, 2, "#ffd93d"); // wax seal
    return o;
  }
  function kitFor(id) {
    const o = cv(24, 24), g = o.getContext("2d");
    const wood = "#6b4226", woodL = "#a06a3a";
    if (/permit/.test(id)) { // scroll with seal
      px(g, 7, 4, 10, 16, "#e8e0d0"); px(g, 7, 4, 10, 1, "#fff"); px(g, 7, 19, 10, 1, "#c9c0a8");
      px(g, 5, 3, 2, 18, wood); px(g, 17, 3, 2, 18, wood);
      px(g, 9, 8, 6, 1, "#8a8a92"); px(g, 9, 11, 6, 1, "#8a8a92");
      px(g, 10, 13, 4, 4, "#c92a2a"); R(g, 11, 14, "#ffd93d"); // seal
      return o;
    }
    if (/bed/.test(id)) { px(g, 3, 12, 18, 5, wood); px(g, 3, 8, 3, 9, wood); px(g, 4, 9, 2, 4, "#e8e0d0"); px(g, 6, 12, 12, 3, "#c92a2a"); return o; }
    if (/shelf/.test(id)) { px(g, 5, 4, 14, 16, wood); px(g, 6, 5, 12, 14, "#3a2412"); for (let s = 0; s < 3; s++) { px(g, 6, 6 + s * 5, 12, 1, woodL); px(g, 7 + s, 5 - 0 + s, 2, 2, "#3f8ef0"); } return o; }
    if (/table/.test(id)) { px(g, 4, 8, 16, 3, woodL); px(g, 5, 11, 2, 9, wood); px(g, 17, 11, 2, 9, wood); return o; }
    if (/chair/.test(id)) { px(g, 5, 6, 3, 10, wood); px(g, 5, 14, 11, 3, woodL); px(g, 14, 17, 2, 4, wood); return o; }
    if (/crate/.test(id)) { px(g, 6, 8, 12, 10, wood); px(g, 6, 8, 12, 1, woodL); px(g, 6, 12, 12, 1, "#3a2412"); px(g, 11, 8, 1, 10, "#3a2412"); return o; }
    if (/barrel/.test(id)) { px(g, 7, 6, 10, 13, wood); px(g, 7, 6, 10, 1, woodL); px(g, 7, 9, 10, 1, "#3a2412"); px(g, 7, 15, 10, 1, "#3a2412"); return o; }
    if (/hearth/.test(id)) { px(g, 5, 12, 14, 8, "#6a6a76"); px(g, 8, 14, 8, 6, "#1a1210"); px(g, 10, 12, 4, 6, "#ff7b2e"); px(g, 11, 10, 2, 4, "#ffd93d"); return o; }
    if (/altar/.test(id)) { px(g, 7, 13, 10, 7, "#8a8a92"); px(g, 6, 11, 12, 2, "#c9ccd4"); px(g, 11, 5, 2, 6, "#ffd93d"); px(g, 10, 6, 4, 2, "#ffd93d"); return o; }
    if (/anvil/.test(id)) { px(g, 5, 8, 14, 4, "#55555f"); px(g, 9, 12, 6, 3, "#3a3a42"); px(g, 7, 15, 10, 5, wood); px(g, 5, 8, 14, 1, "#9a9aa2"); return o; }
    if (/trough/.test(id)) { px(g, 4, 11, 16, 6, wood); px(g, 5, 9, 14, 3, "#4fc3ef"); px(g, 5, 9, 14, 1, "#fff"); return o; }
    if (/portal/.test(id)) { px(g, 6, 4, 12, 16, "#1a0a2a"); px(g, 7, 5, 10, 14, "#6a2a9a"); px(g, 9, 7, 6, 10, "#3a1a5a"); px(g, 10, 9, 4, 6, "#c9a227"); return o; }
    if (/door/.test(id)) { px(g, 8, 4, 8, 16, wood); px(g, 9, 5, 6, 14, "#4a2f1a"); px(g, 8, 10, 8, 1, "#2e1c0e"); px(g, 13, 12, 2, 2, "#ffd93d"); return o; }
    if (/window/.test(id)) { px(g, 6, 6, 12, 10, wood); px(g, 7, 7, 10, 8, "#9adcff"); px(g, 11, 7, 2, 8, wood); px(g, 7, 10, 10, 2, wood); return o; }
    // wall kit fallback: bricks
    px(g, 4, 8, 16, 10, "#8a8a92"); px(g, 4, 8, 16, 1, "#c9ccd4");
    px(g, 4, 12, 16, 1, "#55555f"); px(g, 11, 8, 1, 10, "#55555f");
    return o;
  }
  // ================= spells & deep arts: one bespoke sigil each =================
  // Same frame language as before (spell disc with kind-colored ring, art
  // badge with gold trim, tier pips along the bottom) so kind still reads at
  // a glance — but every ability now carries its own silhouette instead of
  // sharing one glyph per element. Unknown ids fall back to the old glyph.
  function abilityGlyph(g, id, el) {
    const F = EL.fire, IC = EL.ice, E = EL.electric, W = EL.water, H = EL.holy, N = EL.nature, P = EL.physical;
    switch (id) {
      // ---------- fire ----------
      case "fireball": px(g,10,8,4,8,F); px(g,9,11,6,5,F); px(g,11,12,2,4,"#fff7ae"); px(g,9,15,6,1,"#c22e1f"); R(g,15,7,F); break;
      case "immolate": px(g,10,6,4,7,F); px(g,11,8,2,3,"#fff7ae"); px(g,8,14,8,2,"#5a2a8a"); px(g,8,16,8,1,"#3a1a5a"); R(g,10,14,"#c9a7ff"); break;
      case "line_of_fire": px(g,4,17,16,2,"#3a2412"); px(g,5,16,4,1,F); px(g,11,16,3,1,"#ffd93d"); px(g,16,16,3,1,F); px(g,7,12,1,3,F); px(g,12,11,1,4,"#ffd93d"); px(g,16,12,1,3,F); break;
      case "raging_volcano": px(g,8,15,8,4,"#5a3a32"); px(g,10,13,4,2,"#5a3a32"); px(g,10,13,4,1,F); px(g,10,8,4,5,F); px(g,11,5,2,3,"#ffd93d"); px(g,8,4,2,2,"#8a8a92"); px(g,14,4,2,2,"#8a8a92"); break;
      case "meteorfall": px(g,13,5,5,5,"#8a6a4a"); px(g,14,6,2,2,"#fff"); px(g,5,15,7,2,F); px(g,8,12,5,2,"#ffd93d"); px(g,11,9,3,2,F); break;
      case "ember_weapon": px(g,11,6,2,8,"#c9ccd4"); px(g,10,5,4,1,"#eef2f6"); px(g,11,2,2,3,F); px(g,8,14,8,1,"#c9a227"); px(g,11,15,2,4,"#8a5a33"); break;
      case "cinder_edge": px(g,5,15,2,2,"#eef2f6"); px(g,8,12,2,2,"#eef2f6"); px(g,11,9,2,2,"#eef2f6"); px(g,14,6,2,2,"#fff"); R(g,16,12,F); R(g,6,10,"#ffd93d"); px(g,13,13,3,1,F); break;
      case "comet_shot": px(g,4,11,12,2,"#8a5a33"); px(g,4,11,4,1,F); px(g,16,10,5,4,"#c9ccd4"); px(g,16,10,5,1,"#fff"); px(g,7,8,2,2,F); break;
      case "exploding_shuriken": px(g,11,4,2,16,"#ffd93d"); px(g,4,11,16,2,"#ffd93d"); px(g,10,10,4,4,F); R(g,12,12,"#fff"); px(g,15,4,3,3,F); break;
      // ---------- ice ----------
      case "frostbite": px(g,10,5,4,9,"#ffffff"); px(g,12,6,2,8,IC); px(g,10,13,4,1,IC); R(g,7,7,IC); R(g,16,14,IC); break;
      case "glacier": px(g,7,9,10,9,IC); px(g,7,9,10,1,"#fff"); px(g,7,9,1,9,"#fff"); px(g,11,9,1,9,"#7fb6d9"); px(g,14,13,3,1,"#7fb6d9"); break;
      case "whiteout": px(g,6,12,12,2,"#ffffff"); px(g,8,9,8,2,"#dff2fb"); px(g,10,15,7,2,"#dff2fb"); R(g,7,8,IC); R(g,16,15,IC); R(g,14,6,"#fff"); break;
      case "icicle_line": px(g,5,6,3,8,IC); px(g,10,6,3,11,IC); px(g,15,6,3,8,IC); px(g,5,6,1,8,"#fff"); px(g,10,6,1,11,"#fff"); px(g,15,6,1,8,"#fff"); break;
      case "crystal_prison": px(g,6,5,12,2,IC); px(g,6,17,12,2,IC); px(g,6,5,2,14,IC); px(g,11,5,2,14,IC); px(g,16,5,2,14,IC); R(g,12,11,"#fff"); break;
      case "avalanche": px(g,8,12,8,6,"#dfe9f2"); px(g,10,10,4,2,"#fff"); px(g,6,6,2,2,IC); px(g,15,7,2,2,IC); px(g,11,5,2,2,IC); break;
      // ---------- water ----------
      case "water_jet": px(g,3,11,14,2,W); px(g,3,11,14,1,"#fff"); px(g,17,10,3,4,"#8a8a92"); px(g,18,11,2,2,"#c9ccd4"); break;
      case "tideburst": px(g,10,7,4,6,W); px(g,11,5,2,2,W); px(g,11,9,2,4,"#fff"); R(g,6,8,W); R(g,17,8,W); R(g,6,15,W); R(g,17,15,W); break;
      case "tidal_wave": px(g,5,14,14,4,W); px(g,5,14,14,1,"#fff"); px(g,5,11,8,3,W); px(g,5,11,8,1,"#fff"); px(g,14,7,5,5,W); px(g,14,7,5,1,"#fff"); break;
      case "whirlpool": px(g,7,7,10,2,W); px(g,7,15,10,2,W); px(g,7,7,2,10,W); px(g,15,7,2,10,W); px(g,10,10,4,4,"#1a3a5a"); R(g,12,12,"#fff"); break;
      case "primordial_sea": px(g,5,10,14,3,W); px(g,5,10,14,1,"#fff"); px(g,7,15,2,3,"#1a5a8a"); px(g,11,15,2,4,"#1a5a8a"); px(g,15,15,2,3,"#1a5a8a"); R(g,12,7,"#fff"); break;
      case "slime_shuriken": px(g,8,9,8,8,"#5dd68a"); px(g,8,9,8,2,"#d0ffd0"); px(g,10,4,4,2,"#5dd68a"); px(g,6,12,2,3,"#5dd68a"); px(g,16,12,2,3,"#5dd68a"); break;
      // ---------- electric ----------
      case "lightning": px(g,13,5,2,4,E); px(g,11,9,4,2,E); px(g,10,11,3,2,E); px(g,10,13,2,4,E); R(g,14,15,E); break;
      case "thunder_hex": px(g,9,5,6,2,E); px(g,9,17,6,2,E); px(g,7,7,2,10,E); px(g,15,7,2,10,E); px(g,11,9,2,4,"#7a2a9a"); R(g,12,11,"#fff"); break;
      case "energy_beam": px(g,10,4,4,16,E); px(g,11,4,2,16,"#fff"); px(g,7,17,10,2,E); px(g,8,19,8,1,"#c9a227"); break;
      case "tempest_lance": px(g,5,16,3,3,"#c9ccd4"); px(g,8,13,3,3,"#c9ccd4"); px(g,11,10,3,3,"#fff"); px(g,14,5,4,4,E); px(g,15,4,2,2,"#fff"); R(g,7,9,E); break;
      case "thundering_crack": px(g,11,4,2,4,"#c9a227"); px(g,11,8,4,2,"#c9a227"); px(g,13,10,2,3,"#c9a227"); px(g,11,13,4,2,E); px(g,9,15,4,2,E); break;
      // ---------- physical ----------
      case "whirlwind": px(g,5,15,5,2,P); px(g,9,12,6,2,"#fff"); px(g,14,9,5,2,P); px(g,11,6,4,2,"#eef2f6"); break;
      case "tornado": px(g,7,5,10,2,P); px(g,8,8,8,2,"#fff"); px(g,9,11,6,2,P); px(g,10,14,4,3,"#8a8a92"); break;
      case "hurricane": px(g,7,7,10,10,P); px(g,9,9,6,6,"#23232e"); px(g,11,11,2,2,"#fff"); px(g,7,11,2,2,H); break;
      case "wind_cutter": px(g,5,16,2,2,P); px(g,8,13,5,2,"#eef2f6"); px(g,10,10,5,2,P); px(g,13,7,5,2,"#eef2f6"); px(g,15,4,3,2,"#fff"); break;
      case "storm_of_blades": px(g,11,4,2,5,P); px(g,6,8,2,5,"#eef2f6"); px(g,16,8,2,5,P); px(g,8,13,2,5,"#eef2f6"); px(g,14,13,2,5,P); break;
      case "shieldwall": px(g,8,6,8,11,"#8a9ab0"); px(g,8,6,8,1,"#fff"); px(g,11,9,2,5,"#c9a227"); R(g,12,8,"#fff"); break;
      case "eject": px(g,8,15,8,3,"#8a5a33"); px(g,11,4,2,10,N); px(g,9,4,6,2,N); break;
      case "grapple": px(g,11,4,2,10,"#c9a227"); px(g,8,11,6,2,"#c9a227"); px(g,8,11,2,4,"#c9a227"); px(g,12,13,3,2,"#c9a227"); break;
      case "warcry": px(g,5,10,7,4,"#c9a227"); px(g,5,10,7,1,"#fff2b0"); px(g,12,9,3,6,"#8a5a33"); px(g,16,8,2,8,P); px(g,19,6,1,12,"#8a8a92"); break;
      case "skullsplitter": px(g,6,15,3,3,"#8a5a33"); px(g,9,12,3,3,"#8a5a33"); px(g,12,6,5,6,"#c9ccd4"); px(g,12,6,5,1,"#fff"); px(g,15,13,3,2,"#c22e1f"); break;
      case "spiral_pike": px(g,7,9,10,2,"#c9ccd4"); px(g,7,13,10,2,"#8a8a92"); px(g,7,9,2,6,"#c9ccd4"); px(g,15,9,2,6,"#8a8a92"); px(g,16,10,4,4,"#eef2f6"); break;
      case "iron_palm": px(g,7,10,10,7,"#d9a06a"); px(g,7,10,10,2,"#f2d0a0"); px(g,7,6,2,4,"#d9a06a"); px(g,10,6,2,4,"#d9a06a"); px(g,13,6,2,4,"#d9a06a"); px(g,16,6,2,5,"#d9a06a"); break;
      case "feint_attack": px(g,5,8,4,2,P); px(g,7,11,4,2,P); px(g,9,14,4,2,"#fff"); px(g,12,8,4,2,P); px(g,14,11,4,2,P); px(g,16,14,3,2,"#fff"); break;
      case "hammerfell_impact": px(g,7,4,10,4,"#8a8a92"); px(g,7,4,10,1,"#c9ccd4"); px(g,11,8,2,7,"#8a5a33"); px(g,6,16,12,1,P); px(g,8,18,8,1,"#8a8a92"); break;
      case "shadow_disciples": px(g,5,9,4,6,"#3a3a48"); px(g,10,8,4,7,"#55556a"); px(g,15,9,4,6,"#3a3a48"); R(g,6,11,"#c9a7ff"); R(g,11,10,"#fff"); R(g,16,11,"#c9a7ff"); break;
      case "stalwart_reflector": px(g,7,6,10,12,"#c9ccd4"); px(g,7,6,10,1,"#fff"); px(g,9,6,3,12,"#8a9ab0"); px(g,13,8,2,4,"#fff"); px(g,6,5,12,1,"#c9a227"); px(g,6,18,12,1,"#c9a227"); break;
      case "whirlwind_slinger": px(g,7,9,10,1,"#c9a227"); px(g,7,14,10,1,"#c9a227"); px(g,7,9,1,6,"#c9a227"); px(g,16,9,1,6,"#c9a227"); px(g,16,14,4,4,"#8a5a33"); break;
      case "backstab": px(g,8,14,2,6,"#c9ccd4"); px(g,8,5,2,9,"#eef2f6"); px(g,12,8,3,1,P); px(g,14,11,3,1,P); px(g,16,14,2,1,"#c22e1f"); break;
      case "executioner": px(g,8,7,8,7,"#e8e4d0"); px(g,9,9,2,2,"#23232e"); px(g,13,9,2,2,"#23232e"); px(g,10,13,4,2,"#23232e"); px(g,8,15,8,2,"#e8e4d0"); break;
      case "sentinel": px(g,11,4,2,8,"#c9ccd4"); px(g,10,4,4,2,"#fff"); px(g,11,12,2,6,"#8a5a33"); px(g,5,15,3,1,P); px(g,9,17,3,1,P); px(g,13,15,3,1,"#8a8a92"); break;
      case "deadeye": px(g,7,7,10,2,"#c22e1f"); px(g,7,15,10,2,"#c22e1f"); px(g,7,7,2,10,"#c22e1f"); px(g,15,7,2,10,"#c22e1f"); R(g,12,12,"#c22e1f"); break;
      case "skirmisher": px(g,5,6,2,12,"#8a5a33"); px(g,5,6,8,1,"#8a5a33"); px(g,5,17,8,1,"#8a5a33"); px(g,9,11,7,2,P); px(g,14,10,4,4,"#c9ccd4"); break;
      // ---------- nature ----------
      case "venom": px(g,5,15,8,2,"#8a5a33"); px(g,13,9,4,4,N); px(g,14,7,2,3,N); px(g,15,5,2,2,"#e0ffd0"); break;
      case "toxic_stab": px(g,3,11,14,2,"#c9ccd4"); px(g,3,11,14,1,"#fff"); px(g,17,10,4,4,N); R(g,8,15,N); R(g,12,16,"#3a5a2f"); break;
      case "barbed_plague": px(g,10,10,4,4,"#7ddf6b"); px(g,11,5,2,3,N); px(g,11,16,2,3,N); px(g,5,11,3,2,N); px(g,16,11,3,2,N); R(g,6,6,"#3a5a2f"); R(g,17,17,"#3a5a2f"); break;
      case "thorn_reign": px(g,11,6,2,6,N); px(g,7,8,2,5,"#3a5a2f"); px(g,15,8,2,5,"#3a5a2f"); px(g,5,11,2,4,N); px(g,17,11,2,4,N); px(g,8,15,8,2,"#3a5a2f"); break;
      case "dragon_coil": px(g,7,7,7,3,N); px(g,10,10,7,3,"#3a5a2f"); px(g,7,13,7,3,N); px(g,15,6,4,4,N); R(g,16,7,"#ffd93d"); break;
      case "locust_swarm": px(g,6,10,3,5,"#8a6a3a"); px(g,10,8,3,6,"#a08048"); px(g,14,10,3,5,"#8a6a3a"); px(g,6,8,3,2,"#d0c090"); px(g,10,6,3,2,"#d0c090"); px(g,14,8,3,2,"#d0c090"); break;
      case "viper_flurry": px(g,6,5,2,7,"#e8e4d0"); px(g,11,5,2,9,"#fff"); px(g,16,5,2,7,"#e8e4d0"); px(g,6,12,2,2,N); px(g,11,14,2,2,N); px(g,16,12,2,2,N); break;
      case "shadowstep": px(g,9,6,7,12,"#e8e4d0"); px(g,11,7,5,10,"#23232e"); px(g,5,16,2,1,N); px(g,8,18,2,1,N); px(g,11,16,2,1,"#3a5a2f"); break;
      // ---------- holy ----------
      case "heal": px(g,10,6,4,12,H); px(g,6,10,12,4,H); px(g,11,7,2,10,"#fff"); px(g,7,11,10,2,"#fff"); break;
      case "revive": px(g,10,5,4,14,"#fff7ae"); px(g,11,5,2,14,"#fff"); px(g,7,18,10,1,H); px(g,9,15,6,1,H); R(g,12,8,H); break;
      case "dazzle": px(g,11,4,2,4,"#fff"); px(g,4,11,4,2,"#fff"); px(g,11,16,2,4,"#fff"); px(g,16,11,4,2,"#fff"); px(g,10,10,4,4,H); R(g,12,12,"#fff"); break;
      case "smite": px(g,11,5,2,12,"#fff"); px(g,10,5,4,2,H); px(g,8,9,8,2,H); px(g,13,15,4,4,"#e8e4d0"); break;
      case "cleanse": px(g,7,7,10,10,"#7fd6ff"); px(g,8,8,8,8,"#23232e"); px(g,9,9,6,6,"#bfe9ff"); px(g,10,10,4,4,"#23232e"); R(g,12,12,"#fff"); px(g,10,5,4,2,"#fff"); break;
      case "panacea": px(g,6,12,8,5,N); px(g,6,12,8,1,"#e0ffd0"); px(g,13,6,2,3,H); px(g,14,5,4,2,H); R(g,10,14,"#fff"); break;
      case "angel_of_life": px(g,5,10,5,5,"#fff"); px(g,14,10,5,5,"#fff"); px(g,9,14,6,4,"#fff7ae"); px(g,9,5,6,2,H); R(g,12,6,"#fff"); break;
      case "holy_sword": px(g,11,7,2,9,"#eef2f6"); px(g,10,6,4,2,"#fff"); px(g,8,16,8,1,"#c9a227"); px(g,11,17,2,3,"#8a5a33"); px(g,8,10,2,2,H); px(g,14,10,2,2,H); break;
      case "blessed_weapon": px(g,11,9,2,8,"#c9ccd4"); px(g,10,8,4,1,"#fff"); px(g,8,17,8,1,"#c9a227"); px(g,6,6,3,2,H); px(g,10,4,3,2,H); px(g,14,6,3,2,H); break;
      case "burning_light": px(g,10,10,4,4,"#ffd93d"); px(g,11,4,2,2,H); px(g,11,18,2,2,H); px(g,4,11,2,2,H); px(g,18,11,2,2,H); px(g,6,6,2,2,H); px(g,16,6,2,2,H); px(g,6,16,2,2,H); px(g,16,16,2,2,H); break;
      case "tamisra": px(g,8,8,8,8,"#0e0e16"); px(g,8,8,8,1,"#3a3a5a"); px(g,8,15,8,1,"#3a3a5a"); R(g,10,10,"#fff"); R(g,14,12,"#c9a7ff"); R(g,11,14,"#fff"); break;
      case "void_hole": px(g,8,8,8,8,"#000000"); px(g,8,8,8,1,"#6a2a9a"); px(g,8,15,8,1,"#6a2a9a"); px(g,8,8,1,8,"#6a2a9a"); px(g,15,8,1,8,"#6a2a9a"); R(g,14,7,"#c9a7ff"); break;
      case "life_drain": px(g,7,9,5,4,"#c22e1f"); px(g,12,9,5,4,"#c22e1f"); px(g,8,13,8,4,"#c22e1f"); px(g,10,16,4,2,"#c22e1f"); px(g,15,5,2,6,"#fff"); px(g,14,5,4,1,"#fff"); break;
      case "blood_hole": px(g,9,7,6,6,"#c22e1f"); px(g,10,8,4,4,"#ff6b6b"); px(g,7,15,3,1,"#c22e1f"); px(g,10,17,4,1,"#c22e1f"); px(g,14,15,3,1,"#c22e1f"); break;
      default: glyph(g, el, 12, 12, 1);
    }
  }
  function glyph(g, el, cx, cy, s, c) {
    c = c || EL[el] || "#fff";
    switch (el) {
      case "fire": px(g, cx - 2, cy - 4, 4, 8, c); px(g, cx - 3, cy - 2, 6, 5, c); px(g, cx - 1, cy - 5, 2, 3, c); px(g, cx - 1, cy - 1, 2, 4, "#fff7ae"); px(g, cx - 3, cy + 3, 6, 1, "#c22e1f"); break;
      case "ice": px(g, cx, cy - 5, 1, 10, c); px(g, cx - 4, cy - 2, 8, 1, c); px(g, cx - 3, cy - 4, 6, 1, c); px(g, cx - 3, cy + 3, 6, 1, c); R(g, cx, cy, "#fff"); break;
      case "electric": px(g, cx + 1, cy - 5, 2, 4, c); px(g, cx - 1, cy - 1, 4, 2, c); px(g, cx - 2, cy + 1, 3, 2, c); px(g, cx - 2, cy + 3, 2, 2, c); break;
      case "water": px(g, cx - 1, cy - 5, 2, 2, c); px(g, cx - 3, cy - 3, 6, 6, c); px(g, cx - 2, cy + 3, 4, 2, c); R(g, cx - 1, cy - 1, "#fff"); break;
      case "holy": px(g, cx - 1, cy - 5, 2, 10, c); px(g, cx - 4, cy - 2, 8, 2, c); R(g, cx, cy - 1, "#fff"); break;
      case "nature": px(g, cx - 4, cy - 1, 8, 4, c); px(g, cx - 4, cy - 1, 8, 1, "#e0ffd0"); px(g, cx, cy - 4, 1, 3, "#3a5a2f"); break;
      default: px(g, cx - 4, cy - 3, 8, 6, c); px(g, cx - 4, cy - 3, 8, 1, "#fff"); px(g, cx - 2, cy, 4, 2, "#55555f"); break; // physical fist-bar
    }
  }
  function abilityFor(id) {
    const o = cv(24, 24), g = o.getContext("2d");
    let ab = null;
    try { ab = window.CFG.ABILITIES[id] || null; } catch (e) { }
    if (!ab) { try { ab = (window.CFG.TECHNIQUES || {})[id] ? { kind: "technique", element: "physical", name: id } : null; } catch (e2) { } }
    const kind = (ab && ab.kind) || "projectile", el = (ab && ab.element) || "physical";
    const tech = kind === "technique";
    // frame: spell disc vs art blade-badge
    if (tech) {
      px(g, 4, 4, 16, 16, "#2a2a34"); px(g, 4, 4, 16, 1, "#c9a227"); px(g, 4, 19, 16, 1, "#c9a227");
      px(g, 6, 6, 12, 12, "#3a3a48");
    } else {
      px(g, 12, 3, 0, 0, "#000");
      g.fillStyle = "#23232e"; g.beginPath(); g.arc(12, 12, 9, 0, 7); g.fill();
      g.strokeStyle = kind === "heal" || kind === "support" || kind === "revive" ? "#5dd68a" : kind === "buff" ? "#c9a227" : kind === "blink" || kind === "eject" || kind === "pull" ? "#7ddf6b" : "#7fc4ff";
      g.lineWidth = 2; g.beginPath(); g.arc(12, 12, 8, 0, 7); g.stroke();
    }
    abilityGlyph(g, id, el);
    // tier pips along the bottom
    let tier = 0;
    try {
      const ST = window.CFG.SPELL_TIER || {}, TT = window.CFG.TECH_TIER || {};
      tier = tech ? (TT[id] | 0) : (ST[id] | 0);
    } catch (e) { }
    if (tier > 0) for (let i = 0; i < Math.min(4, tier); i++) px(g, 8 + i * 3, 20, 2, 1, "#ffd93d");
    return o;
  }
  // ================= skill trees: family medallions =================
  const TREE_ITEM = { sword: "iron_sword", axe: "iron_axe", hammer: "iron_hammer", dagger: "iron_dagger", whip: "iron_whip", spear: "iron_spear", bow: "yew_bow", wand: "wand_ruby", staff: "staff_ruby", shield: "iron_shield", armor: "steel_plate", robe: "mage_robe", kasaya: "ironthread_kasaya", habitus: "canon_habit", shuriken: "shuriken_iron" };
  function treeFor(id) {
    if (TREE_ITEM[id]) {
      const it = TREE_ITEM[id];
      if (/shuriken/.test(it)) return shurikenIcon(it);
      try {
        const ent = window.Items.ITEMS[it];
        if (ent && ent.slot === "weapon") return liveWeapon(it);
        if (ent && ent.slot === "armor") return liveArmor(it);
        if (ent && ent.slot === "shield") return liveShield(it);
      } catch (e) { }
    }
    const o = cv(24, 24), g = o.getContext("2d");
    if (id === "unarmed") { // fist
      px(g, 7, 8, 10, 9, "#d9a06a"); px(g, 7, 8, 10, 2, "#f2d0a0");
      px(g, 7, 8, 2, 5, "#c98a55"); px(g, 10, 8, 2, 4, "#c98a55"); px(g, 13, 8, 2, 4, "#c98a55"); px(g, 16, 8, 2, 5, "#c98a55");
      return o;
    }
    if (id === "parry") { // crossed blades
      px(g, 5, 5, 3, 14, "#c9ccd4"); px(g, 16, 5, 3, 14, "#c9ccd4");
      px(g, 5, 5, 3, 2, "#fff"); px(g, 16, 5, 3, 2, "#fff");
      px(g, 4, 17, 5, 2, "#c9a227"); px(g, 15, 17, 5, 2, "#c9a227");
      return o;
    }
    // taming: paw
    px(g, 9, 11, 6, 6, "#e8bfe8"); px(g, 10, 12, 4, 4, "#c98ac9");
    px(g, 6, 7, 3, 3, "#e8bfe8"); px(g, 10, 6, 3, 3, "#e8bfe8"); px(g, 15, 7, 3, 3, "#e8bfe8");
    return o;
  }
  // ================= buffs & statuses =================
  function fxFor(key) {
    const o = cv(24, 24), g = o.getContext("2d");
    const sm = { poison: "nature", burn: "fire", freeze: "ice", paralyze: "electric", blind: "physical", bleed: "fire", sunder: "physical", stun: "electric" };
    const paint = (fn) => fn(g);
    switch (key) {
      case "defUpUntil": return liveShield("iron_shield");
      case "warcryUntil": paint((g) => { px(g, 6, 8, 12, 8, "#c9a227"); px(g, 6, 8, 12, 2, "#fff2b0"); px(g, 14, 8, 6, 3, "#8a5a33"); }); return o;
      case "emberUntil": paint((g) => { px(g, 9, 6, 6, 12, "#ff7b2e"); px(g, 10, 4, 4, 3, "#ff7b2e"); px(g, 10, 10, 4, 4, "#ffd93d"); }); return o;
      case "blessedUntil": paint((g) => { px(g, 11, 5, 2, 14, "#ffd93d"); px(g, 7, 9, 10, 2, "#ffd93d"); R(g, 12, 11, "#fff"); }); return o;
      case "atkUpUntil": return liveWeapon("iron_sword");
      case "unseenUntil": paint((g) => { g.fillStyle = "#8a9ac9"; g.beginPath(); g.arc(12, 12, 8, 0, 7); g.fill(); g.fillStyle = "#23232e"; g.beginPath(); g.arc(15, 10, 6, 0, 7); g.fill(); }); return o;
      case "honeUntil": return liveWeapon("iron_dagger");
      case "rouseUntil": paint((g) => { px(g, 7, 9, 10, 8, "#8a3a3a"); px(g, 7, 9, 10, 1, "#d96a6a"); px(g, 5, 8, 2, 10, "#5a3a22"); px(g, 17, 8, 2, 10, "#5a3a22"); }); return o;
      case "slowed": paint((g) => { px(g, 6, 13, 12, 7, "#7ddf6b"); px(g, 6, 13, 12, 2, "#bfe9bf"); px(g, 14, 8, 5, 6, "#7ddf6b"); R(g, 16, 10, "#23232e"); px(g, 14, 8, 5, 1, "#bfe9bf"); }); return o;
      default: break;
    }
    // status types: elemental rune chips
    let el = "physical";
    try {
      const t = String(key).replace(/^status:/, "");
      el = sm[t] || "physical";
    } catch (e) { }
    paint((g) => {
      px(g, 5, 5, 14, 14, "#23232e"); px(g, 5, 5, 14, 1, EL[el]); px(g, 5, 18, 14, 1, EL[el]);
      glyph(g, el, 12, 12, 1);
    });
    return o;
  }
  // ================= stats (STR/END/AGI/INT/CHA/LUK/FOR) =================
  function statFor(key) {
    const o = cv(24, 24), g = o.getContext("2d");
    const pal = { str: "#ff6b6b", end: "#c9a45a", agi: "#7ddf6b", int: "#7fc4ff", cha: "#e8a0d8", luk: "#ffd93d", for: "#bfe9ff" };
    const c = pal[key] || "#c9ccd4";
    px(g, 5, 5, 14, 14, "#23232e"); px(g, 5, 5, 14, 2, c); px(g, 5, 17, 14, 2, c);
    if (key === "str") { px(g, 9, 8, 6, 8, c); px(g, 9, 8, 6, 2, "#fff"); } // blade
    else if (key === "end") { px(g, 8, 8, 8, 8, c); px(g, 9, 9, 6, 6, "#23232e"); px(g, 10, 10, 4, 4, c); } // bulwark ring
    else if (key === "agi") { px(g, 11, 6, 2, 8, c); px(g, 7, 10, 10, 2, c); px(g, 9, 14, 6, 2, c); } // swift chevrons
    else if (key === "int") { px(g, 11, 6, 2, 12, c); px(g, 8, 9, 8, 2, c); R(g, 12, 11, "#fff"); } // mind candle
    else if (key === "cha") { px(g, 8, 8, 8, 8, c); px(g, 9, 9, 6, 6, "#23232e"); R(g, 11, 11, c); R(g, 13, 13, c); } // bright face
    else if (key === "luk") { px(g, 8, 8, 8, 8, c); px(g, 9, 6, 2, 2, c); px(g, 13, 6, 2, 2, c); px(g, 12, 16, 2, 2, c); } // clover dice
    else { px(g, 10, 6, 4, 12, c); px(g, 7, 10, 10, 2, c); } // forge hammer
    return o;
  }
  // ================= dispatch + public API =================
  function itemCanvas(id) {
    try {
      const it = window.Items.ITEMS[id];
      if (!it) return null;
      if (it.slot === "weapon") return liveWeapon(id);
      if (it.slot === "armor") return liveArmor(id);
      if (it.slot === "shield") return liveShield(id);
      if (id === "torch") return torchLive();
      if (id === "raft" || (it.use && it.use.raft)) return raftLive();
      if (it.type === "ammo" || /^arrow_/.test(id)) return arrowIcon(id);
      if (/^shuriken_/.test(id)) return shurikenIcon(id);
      if (id === "bomb") return bombIcon(false);
      if (id === "smoke_bomb") return bombIcon(true);
      if (it.type === "consumable") return potionFor(id);
      if (it.type === "material") return materialFor(id);
      if (it.slot === "trinket") return ringFor(id);
      if (it.type === "spellbook") return tomeFor(id);
      if (it.type === "quest") return questFor(id);
      if (it.type === "placeable") return kitFor(id);
    } catch (e) { }
    return null;
  }
  function canvasFor(kind, id) {
    try {
      if (kind === "item") return itemCanvas(id);
      if (kind === "ability") return abilityFor(id);
      if (kind === "tree") return treeFor(id);
      if (kind === "fx") return fxFor(id);
      if (kind === "stat") return statFor(id);
    } catch (e) { }
    return null;
  }
  function url(kind, id) {
    const key = kind + ":" + id;
    if (cache[key]) return cache[key];
    const u = urlOf(key, () => canvasFor(kind, id) || blank());
    return u;
  }
  function blank() { return cv(4, 4); }
  function img(kind, id, size, cls) {
    const s = size | 0 || 22;
    const u = url(kind, id);
    if (!u) return "";
    return '<img class="' + esc(cls || "ico") + '" width="' + s + '" height="' + s + '" draggable="false" alt="" src="' + u + '">';
  }
  function set(el, kind, id, size) {
    try {
      if (!el) return;
      el.textContent = "";
      el.innerHTML = img(kind, id, size || 22);
    } catch (e) { }
  }
  // name + icon html for rows/toasts that render HTML
  function tag(kind, id, name) {
    try {
      let nm = name;
      if (nm == null) {
        if (kind === "ability") nm = (window.CFG.ABILITIES[id] || {}).name || id;
        else if (kind === "item") nm = (window.Items.ITEMS[id] || {}).name || id;
        else nm = id;
      }
      return img(kind, id, 20) + " " + esc(nm);
    } catch (e) { return esc(name || id); }
  }
  // plain name for text-only contexts (canvas floats, <option>, AI prompts)
  function name(kind, id) {
    try {
      if (kind === "ability") return ((window.CFG.ABILITIES[id] || {}).name) || id;
      if (kind === "item") return ((window.Items.ITEMS[id] || {}).name) || id;
      return id;
    } catch (e) { return id; }
  }
  return { url, img, set, tag, name, canvasFor, itemCanvas, abilityFor, EL };
})();
