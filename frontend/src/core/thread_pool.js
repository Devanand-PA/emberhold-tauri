/* Threads: Web Worker pool for heavy worldgen + perf helpers. window.Threads.
   - Moves pure wilderness chunk tile generation off the main thread so walking
     never hitches while new ground is computed. Pool scales with the machine
     (cores-1, capped at 4 workers — 8 froze low-end systems); each worker builds wild-chunk
     tiles in parallel and the main thread fans missing chunks out with Promise.all.
     Hung workers are replaced, repeated timeouts trip a 30s breaker, prefetch is idle-only.
   - Wired in index.html BEFORE world.js (world.js calls window.Threads at
     chunk time). If workers are unavailable it degrades to sync main-thread
     genBaseChunk — the game never depends on threads to function.
   - The worker source below is intentionally self-contained (no window, no
     fetch, no imports) so it works in the unsaved preview AND after saving.
     It mirrors the pure parts of src/world.js exactly (same hash/noise,
     same settlement/base placement, same wilderness tile rules). Chunks that
     touch settlements, bases, roads-by-building, spawn or portals return
     {needsMain:true} and the main thread runs the full genBaseChunk.
   - GPU side (see game.js): one tile-sprite atlas texture instead of ~35
     tiny canvases, a world-anchored ground cache (one blit per frame),
     half-res darkness overlay, and a throttled visible-tile checksum.
*/
window.Threads = (() => {
  const WGEN_V = 26; // v26: alien hell + blooming heaven — full regen
  const WORKER_SRC = `
"use strict";
var CHUNK = 16;
var RS = 8, RB = 6;
var T = {GRASS:0,TALLGRASS:1,FLOWER:2,TREE:3,PINE:4,WATER:5,DEEPWATER:6,SAND:7,PATH:8,TOWNSTONE:9,HOUSEWALL:10,ROOF:11,DOOR:12,DFLOOR:13,DWALL:14,DDOOR:15,BRIDGE:16,TORCH:17,STAIRS:18,LAVA:19,SAKURA:20,STONEWALL:21,LANTERN:22,WINDOW:23,PLANKS:24,RUBBLE:25,ICE:26,ASH:27,MOSS:28,BONE:29,CRYSTAL:30,WAX:31,FLESH:32,BLOOD:33,CLOUD:34,SHROOM:35,SPIRE:36};
var SETTLE_DEF = {village:{radius:12,npc:[2,3]},town:{radius:34,npc:[3,5]},city:{radius:75,npc:[2,3]},watergate:{radius:36,npc:[3,5]},sakura:{radius:32,npc:[3,5]},fortress:{radius:34,npc:[3,5]},desert_souk:{radius:13,npc:[2,3]},steppe_ger:{radius:12,npc:[2,3]},mesa_pueblo:{radius:13,npc:[2,3]},frost_hold:{radius:13,npc:[2,3]},trade_city:{radius:85,npc:[2,3]},port_city:{radius:80,npc:[2,3]},capital:{radius:95,npc:[2,3]}};
var BASE_DEF = {goblin_village:{radius:14,wall:"wood",thick:1,moat:"water"},orc_stronghold:{radius:16,wall:"stone",thick:2,moat:"lava"},brigand_camp:{radius:13,wall:"wood",thick:1,moat:null},kobold_warren:{radius:11,wall:"wood",thick:1,moat:null},gnoll_den:{radius:13,wall:"wood",thick:1,moat:null},skeleton_crypt:{radius:14,wall:"stone",thick:1,moat:null},cultist_sanctum:{radius:14,wall:"stone",thick:1,moat:"lava"},haunted_barrow:{radius:13,wall:"wood",thick:1,moat:"water"},minotaur_maze:{radius:16,wall:"stone",thick:2,moat:null},serpent_temple:{radius:15,wall:"stone",thick:1,moat:"water"},harpy_roost:{radius:13,wall:"wood",thick:1,moat:null},troll_den:{radius:14,wall:"stone",thick:1,moat:null},cinder_warren:{radius:14,wall:"stone",thick:1,moat:"lava"},gore_hold:{radius:13,wall:"stone",thick:1,moat:null},obsidian_citadel:{radius:16,wall:"stone",thick:2,moat:"lava"},flesh_pit:{radius:14,wall:"wood",thick:1,moat:null},marrow_ossuary:{radius:15,wall:"stone",thick:1,moat:null},gloom_spire:{radius:14,wall:"stone",thick:2,moat:null}};
var BASE_ROLL = [["goblin_village",0.15],["brigand_camp",0.28],["kobold_warren",0.39],["gnoll_den",0.49],["orc_stronghold",0.58],["skeleton_crypt",0.66],["cultist_sanctum",0.74],["troll_den",0.81],["haunted_barrow",0.88],["minotaur_maze",0.93],["serpent_temple",0.97],["harpy_roost",1.01]];
var HELL_BASE_ROLL = [["cinder_warren",0.17],["gore_hold",0.34],["obsidian_citadel",0.50],["flesh_pit",0.67],["marrow_ossuary",0.84],["gloom_spire",1.01]];
function hash2(x, y) {
  var h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function smooth(t) { return t * t * (3 - 2 * t); }
function valueNoise(x, y) {
  var xi = Math.floor(x), yi = Math.floor(y);
  var xf = x - xi, yf = y - yi;
  var a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  var u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { return valueNoise(x, y) * 0.6 + valueNoise(x * 2.3 + 7, y * 2.3 + 3) * 0.28 + valueNoise(x * 5.1 + 13, y * 5.1 + 29) * 0.12; }
function distOrigin(gx, gy) { return Math.hypot(gx, gy); }
function regionSettlementRaw(rx, ry) {
  var h = hash2(rx * 101 + 7, ry * 131 + 3);
  if (h < 0.35) return null;
  var t = hash2(rx * 37 + 1, ry * 53 + 9);
  var type = t < 0.22 ? "village" : t < 0.38 ? "town" : t < 0.48 ? "desert_souk" : t < 0.56 ? "steppe_ger" : t < 0.63 ? "mesa_pueblo" : t < 0.70 ? "frost_hold" : t < 0.78 ? "watergate" : t < 0.85 ? "sakura" : t < 0.90 ? "fortress" : t < 0.94 ? "city" : t < 0.965 ? "trade_city" : t < 0.985 ? "port_city" : "capital";
  var def0 = SETTLE_DEF[type];
  var cox = 1 + ((hash2(rx * 17 + 5, ry * 29 + 11) * 6) | 0);
  var coy = 1 + ((hash2(rx * 23 + 13, ry * 41 + 7) * 6) | 0);
  var cx = (rx * RS + cox) * CHUNK + 8, cy = (ry * RS + coy) * CHUNK + 8;
  var d0 = distOrigin(cx, cy);
  if (d0 < 72) return null;
  if (type === "capital" && d0 < 140) type = "town";
  else if (type === "trade_city" && d0 < 120) type = "town";
  else if (type === "port_city" && d0 < 120) type = "watergate";
  var def = SETTLE_DEF[type];
  if (distOrigin(cx, cy) > 170) { try { if (fbm(cx * 0.012 + 40, cy * 0.012 + 940) > 0.60) return null; } catch (e) {} }
  return { type: type, cx: cx, cy: cy, radius: def.radius };
}
var METRO_TYPES = {city:1,trade_city:1,port_city:1,capital:1};
function regionSettlement(rx, ry) {
  var s = regionSettlementRaw(rx, ry);
  if (!s || !METRO_TYPES[s.type]) return s;
  for (var ax = rx - 2; ax <= rx + 2; ax++) for (var ay = ry - 2; ay <= ry + 2; ay++) {
    if (ax === rx && ay === ry) continue;
    var t = regionSettlementRaw(ax, ay);
    if (!t) continue;
    if (Math.hypot(s.cx - t.cx, s.cy - t.cy) < s.radius + t.radius + 12) {
      return { type: "town", cx: s.cx, cy: s.cy, radius: SETTLE_DEF.town.radius };
    }
  }
  return s;
}
function settleLinks(rx, ry) {
  var s = regionSettlement(rx, ry);
  if (!s) return [];
  var cands = [{ cx: 0, cy: 0, spawn: true }];
  for (var ax = rx - 2; ax <= rx + 2; ax++) for (var ay = ry - 2; ay <= ry + 2; ay++) {
    if (ax === rx && ay === ry) continue;
    var t = regionSettlement(ax, ay);
    if (t) cands.push(t);
  }
  cands.sort(function(a, b) { return ((a.cx - s.cx) * (a.cx - s.cx) + (a.cy - s.cy) * (a.cy - s.cy)) - ((b.cx - s.cx) * (b.cx - s.cx) + (b.cy - s.cy) * (b.cy - s.cy)); });
  return cands.slice(0, 2).map(function(t2) { return [s, t2]; });
}
function segDist2(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay;
  var L2 = dx * dx + dy * dy;
  var t = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  var qx = ax + dx * t - px, qy = ay + dy * t - py;
  return qx * qx + qy * qy;
}
function settlementAt(gx, gy) {
  if (distOrigin(gx, gy) < 26) return null;
  var cx = Math.floor(gx / CHUNK), cy = Math.floor(gy / CHUNK);
  var rx = Math.floor(cx / RS), ry = Math.floor(cy / RS);
  var best = null, bestD = 1e9;
  for (var ax = rx - 1; ax <= rx + 1; ax++) for (var ay = ry - 1; ay <= ry + 1; ay++) {
    var s = regionSettlement(ax, ay);
    if (!s) continue;
    var d = Math.hypot(gx - s.cx, gy - s.cy);
    var reach = s.radius + (s.type === "watergate" ? 2 : 0);
    if (d <= reach && d < bestD) { best = s; bestD = d; }
  }
  return best;
}
function baseTypeFor(t) {
  for (var i = 0; i < BASE_ROLL.length; i++) if (t < BASE_ROLL[i][1]) return BASE_ROLL[i][0];
  return "harpy_roost";
}
function hellBaseTypeFor(t) {
  for (var i = 0; i < HELL_BASE_ROLL.length; i++) if (t < HELL_BASE_ROLL[i][1]) return HELL_BASE_ROLL[i][0];
  return "gloom_spire";
}
function isHellBaseGround(gx, gy) {
  // v19: workers bake the SURFACE dimension only (hell always builds on the
  // main thread) — and hell now shares surface coordinates, so no coordinate
  // test can stand in for the dimension. Always surface here.
  return false;
}
function baseCenterFor(rx, ry) {
  var t = hash2(rx * 733 + 5, ry * 691 + 9);
  var cox = 1 + ((hash2(rx * 97 + 3, ry * 113 + 7) * 4) | 0);
  var coy = 1 + ((hash2(rx * 131 + 11, ry * 151 + 13) * 4) | 0);
  var cx = (rx * RB + cox) * CHUNK + 8, cy = (ry * RB + coy) * CHUNK + 8;
  var type = isHellBaseGround(cx, cy) ? hellBaseTypeFor(t) : baseTypeFor(t);
  var def = BASE_DEF[type];
  return { type: type, cx: cx, cy: cy, radius: def.radius };
}
function biomeAt(gx, gy) {
  var d = distOrigin(gx, gy);
  if (d < 40) return "town"; // origin hearth ground (main thread owns the details)
  if (settlementAt(gx, gy)) return "town";
  var f = fbm(gx * 0.045, gy * 0.045);
  var w = fbm(gx * 0.03 + 100, gy * 0.03 + 50);
  var o = fbm(gx * 0.012 + 40, gy * 0.012 + 940);
  var c = fbm(gx * 0.02 + 900, gy * 0.02 + 100);
  var v = fbm(gx * 0.02 + 300, gy * 0.02 + 700);
  var m = fbm(gx * 0.03 + 700, gy * 0.03 + 300);
  var s = fbm(gx * 0.025 + 400, gy * 0.025 + 900);
  var g = fbm(gx * 0.08 + 250, gy * 0.08 + 600);
  var r = fbm(gx * 0.018 + 550, gy * 0.018 + 150);
  var b = fbm(gx * 0.022 + 250, gy * 0.022 + 350);
  var q = fbm(gx * 0.018 + 150, gy * 0.018 + 850);
  var k = fbm(gx * 0.018 + 850, gy * 0.018 + 450);
  var u = fbm(gx * 0.018 + 350, gy * 0.018 + 50);
  if (d > 340 && u > 0.58) return "umbral_waste";
  if (d > 320 && k > 0.58) return "crystal_scar";
  if (d > 300 && q > 0.58) return "stormcrag";
  if (d > 285 && b > 0.58) return "blightmire";
  if (d > 270 && r > 0.58) return "frostcrown";
  if (d > 260 && v > 0.64) return "volcano";
  if (d > 210 && m > 0.58) return "mountain";
  if (d > 170 && o > 0.60) return "ocean";
  if (d > 150 && c > 0.62) return "tundra";
  if (d > 130 && s > 0.60) return "desert";
  if (d > 100 && o > 0.56) return "sea";
  if (w > 0.68) return "lake";
  if (d > 90 && f > 0.52 && g > 0.60) return "dark_forest";
  if (f > 0.55) return "forest";
  if (d > 64) return f > 0.42 ? "wild" : "plains";
  return "plains";
}
function baseReach(b) {
  var fort = (b && BASE_DEF[b.type]) || null;
  return b.radius + (fort && fort.moat ? 2 : 0);
}
function regionBase(rx, ry) {
  if (hash2(rx * 331 + 17, ry * 397 + 41) < 0.72) return null;
  var b = baseCenterFor(rx, ry);
  if (distOrigin(b.cx, b.cy) < 150) return null;
  if (!isHellBaseGround(b.cx, b.cy) && distOrigin(b.cx, b.cy) > 170) {
    try { if (fbm(b.cx * 0.012 + 40, b.cy * 0.012 + 940) > 0.60) return null; } catch (e) {}
  }
  try {
    var bt = biomeAt(b.cx, b.cy);
    if (bt === "ocean" || bt === "sea" || bt === "lake") return null;
  } catch (e) {}
  for (var ax = rx - 1; ax <= rx + 1; ax++) for (var ay = ry - 1; ay <= ry + 1; ay++) {
    if (ax === rx && ay === ry) continue;
    var nb = baseCenterFor(ax, ay);
    if (Math.hypot(b.cx - nb.cx, b.cy - nb.cy) < 70) return null;
  }
  try {
    var ccx = Math.floor(b.cx / CHUNK), ccy = Math.floor(b.cy / CHUNK);
    var rrx = Math.floor(ccx / RS), rry = Math.floor(ccy / RS);
    for (var bx = rrx - 1; bx <= rrx + 1; bx++) for (var by = rry - 1; by <= rry + 1; by++) {
      var s = regionSettlement(bx, by);
      if (!s) continue;
      if (Math.hypot(b.cx - s.cx, b.cy - s.cy) < s.radius + 60) return null;
    }
  } catch (e) {}
  return b;
}
function genChunk(cx, cy) {
  var gx0 = cx * CHUNK, gy0 = cy * CHUNK;
  var ccx = gx0 + 8, ccy = gy0 + 8;
  var dCenter = distOrigin(ccx, ccy);
  // origin hearth + its outskirts always bake on the main thread
  if (dCenter < 56) return { needsMain: true, reason: "origin" };
  // v19: workers bake the surface dimension only — surface towers pave on the
  // main thread, so any chunk near ANY tower (all 8 compass points) bails.
  // (Hell shares these coordinates but never reaches the worker path.)
  try {
    var _hx = [1000, 700, -60, -700, -1000, -700, 80, 700];
    var _hy = [0, -700, -1000, -700, 60, 700, 1000, 700];
    for (var _ti = 0; _ti < 8; _ti++) {
      if (Math.hypot(ccx - _hx[_ti], ccy - _hy[_ti]) < 160) return { needsMain: true, reason: "helltower" };
    }
  } catch (_he) {}
  var cand = [];
  var brx = Math.floor(cx / RS), bry = Math.floor(cy / RS);
  var ax, ay;
  for (ax = brx - 1; ax <= brx + 1; ax++) for (ay = bry - 1; ay <= bry + 1; ay++) {
    var s = regionSettlement(ax, ay);
    if (s) cand.push(s);
  }
  var candB = [];
  var brbx = Math.floor(cx / RB), brby = Math.floor(cy / RB);
  for (ax = brbx - 1; ax <= brbx + 1; ax++) for (ay = brby - 1; ay <= brby + 1; ay++) {
    var b = regionBase(ax, ay);
    if (b) candB.push(b);
  }
  function settleFor(gx, gy) {
    if (distOrigin(gx, gy) < 26) return null;
    var best = null, bestD = 1e9;
    for (var i = 0; i < cand.length; i++) {
      var qq = cand[i];
      var d = Math.hypot(gx - qq.cx, gy - qq.cy);
      var reach = qq.radius + (qq.type === "watergate" ? 2 : 0);
      if (d <= reach && d < bestD) { best = qq; bestD = d; }
    }
    return best;
  }
  function baseFor(gx, gy) {
    if (distOrigin(gx, gy) < 100) return null;
    var best = null, bestD = 1e9;
    for (var i = 0; i < candB.length; i++) {
      var qq = candB[i];
      var d = Math.hypot(gx - qq.cx, gy - qq.cy);
      var reach = baseReach(qq);
      if (d <= reach && d < bestD) { best = qq; bestD = d; }
    }
    return best;
  }
  if (settleFor(ccx, ccy)) return { needsMain: true, reason: "settle" };
  if (baseFor(ccx, ccy)) return { needsMain: true, reason: "base" };
  var centerBiome = biomeAt(ccx, ccy);
  var roadSegs = [];
  var seenPair = {};
  var rxc = Math.floor(cx / RS), ryc = Math.floor(cy / RS);
  for (ax = rxc - 3; ax <= rxc + 3; ax++) for (ay = ryc - 3; ay <= ryc + 3; ay++) {
    var links = null;
    try { links = settleLinks(ax, ay); } catch (e) { links = null; }
    if (!links) continue;
    for (var li = 0; li < links.length; li++) {
      var pr = links[li];
      var a = pr[0], bb = pr[1];
      var ka = a.cx + "," + a.cy, kb = bb.spawn ? "spawn" : bb.cx + "," + bb.cy;
      var key = ka < kb ? ka + "|" + kb : kb + "|" + ka;
      if (seenPair[key]) continue;
      seenPair[key] = 1;
      roadSegs.push([a.cx, a.cy, bb.cx, bb.cy]);
    }
  }
  function nearRoad(gx, gy) {
    for (var i = 0; i < roadSegs.length; i++) {
      var sg = roadSegs[i];
      if (segDist2(gx, gy, sg[0], sg[1], sg[2], sg[3]) < 1.0) return true;
    }
    return false;
  }
  var tiles = new Array(CHUNK * CHUNK);
  for (var ly = 0; ly < CHUNK; ly++) for (var lx = 0; lx < CHUNK; lx++) {
    var gx = gx0 + lx, gy = gy0 + ly;
    var d = distOrigin(gx, gy);
    if (d < 40) return { needsMain: true, reason: "origin-tile" };
    if (settleFor(gx, gy)) return { needsMain: true, reason: "settle-tile" };
    var t = null;
    if (d >= 100) {
      var bHere = baseFor(gx, gy);
      if (bHere) return { needsMain: true, reason: "base-tile" };
    }
    var f = fbm(gx * 0.06, gy * 0.06);
    var w = fbm(gx * 0.035 + 100, gy * 0.035 + 50);
    var hh = hash2(gx * 5 + 1, gy * 5 + 9);
    if (centerBiome === "desert") {
      if (w > 0.72) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
      else if (hh > 0.95) t = T.TREE;
      else if (hh > 0.88) t = T.TALLGRASS;
      else t = T.SAND;
    } else if (centerBiome === "mountain") {
      if (w > 0.74) t = T.WATER;
      else if (f > 0.64) t = T.PINE;
      else if (f > 0.52) t = T.TOWNSTONE;
      else if (hh > 0.94) t = T.FLOWER;
      else t = T.GRASS;
    } else if (centerBiome === "frostcrown") {
      if (w > 0.70) t = T.ICE;
      else if (hh > 0.985) t = T.CRYSTAL;
      else if (f > 0.60) t = T.PINE;
      else if (f > 0.50) t = T.TOWNSTONE;
      else if (hh > 0.93) t = T.FLOWER;
      else t = T.GRASS;
    } else if (centerBiome === "blightmire") {
      if (w > 0.66) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
      else if (hh > 0.92) t = T.BONE;
      else if (f > 0.55) t = T.TALLGRASS;
      else t = T.MOSS;
    } else if (centerBiome === "stormcrag") {
      if (w > 0.74) t = T.WATER;
      else if (hh > 0.965) t = T.CRYSTAL;
      else if (f > 0.55) t = T.TOWNSTONE;
      else if (hh > 0.90) t = T.FLOWER;
      else t = T.GRASS;
    } else if (centerBiome === "crystal_scar") {
      if (hh > 0.955) t = T.CRYSTAL;
      else if (f > 0.55) t = T.TOWNSTONE;
      else if (w > 0.70) t = T.WATER;
      else t = T.SAND;
    } else if (centerBiome === "umbral_waste") {
      if (hh > 0.95) t = T.CRYSTAL;
      else if (f > 0.62) t = T.BONE;
      else if (f > 0.50) t = T.ASH;
      else if (hh > 0.90) t = T.TALLGRASS;
      else t = T.ASH;
    } else if (centerBiome === "volcano") {
      var lv = fbm(gx * 0.05 + 800, gy * 0.05 + 200);
      if (lv > 0.66) t = T.LAVA;
      else if (hh > 0.96) t = T.TORCH;
      else if (f > 0.55) t = T.TOWNSTONE;
      else t = T.SAND;
    } else if (centerBiome === "sea") {
      if (f > 0.70) t = T.SAND;
      else if (f > 0.66) t = T.TREE;
      else t = w > 0.45 ? T.DEEPWATER : T.WATER;
    } else if (centerBiome === "ocean") {
      if (f > 0.76) t = T.SAND;
      else if (f > 0.73) t = T.TREE;
      else t = w > 0.35 ? T.DEEPWATER : T.WATER;
    } else if (centerBiome === "tundra") {
      if (w > 0.72) t = T.ICE;
      else if (f > 0.62) t = T.PINE;
      else if (f > 0.52) t = T.TOWNSTONE;
      else if (hh > 0.92) t = T.FLOWER;
      else t = T.GRASS;
    } else if (centerBiome === "dark_forest") {
      if (f > 0.35) t = hh > 0.45 ? T.TREE : T.PINE;
      else if (hh > 0.90) t = T.TALLGRASS;
      else t = T.MOSS;
    }
    else if (w > 0.70) t = hh > 0.5 ? T.DEEPWATER : T.WATER;
    else if (w > 0.64) t = (hh > 0.6) ? T.SAND : T.WATER;
    else if (centerBiome === "forest" || centerBiome === "wild") {
      if (f > 0.62) t = hh > 0.4 ? T.TREE : T.PINE;
      else if (f > 0.55) t = T.TALLGRASS;
      else t = hh > 0.9 ? T.FLOWER : T.GRASS;
    } else {
      if (f > 0.66) t = T.TREE;
      else if (f > 0.60) t = T.PINE;
      else if (hh > 0.93) t = T.FLOWER;
      else if (hh > 0.88) t = T.TALLGRASS;
      else t = T.GRASS;
    }
    var p = fbm(gx * 0.02 + 500, gy * 0.02);
    if (t !== T.WATER && t !== T.DEEPWATER && Math.abs(p - 0.5) < 0.008) t = T.PATH;
    if ((t === T.GRASS || t === T.TALLGRASS || t === T.FLOWER || t === T.SAND || t === T.TREE || t === T.PINE) && nearRoad(gx, gy)) t = T.PATH;
    tiles[ly * CHUNK + lx] = t;
  }
  var h = hash2(cx * 3 + 11, cy * 7 + 5);
  var hasDungeon = dCenter > 40 && h > 0.955;
  return { needsMain: false, tiles: tiles, biome: centerBiome, hasDungeon: hasDungeon };
}
self.onmessage = function(e) {
  var m = e.data || {};
  if (m.op === "chunk") {
    var r;
    try { r = genChunk(m.cx | 0, m.cy | 0); }
    catch (err) { self.postMessage({ id: m.id, ok: false, error: String((err && err.message) || err) }); return; }
    r.id = m.id; r.ok = true; r.v = ${WGEN_V};
    // echo prefetch routing so late arrivals (after the 6s timer) still
    // land in the tile cache via the onMsg fallback path.
    try { if (m._prefetch) r._prefetch = 1; if (m._cx != null) r._cx = m._cx; if (m._cy != null) r._cy = m._cy; } catch (e2) {}
    self.postMessage(r);
    return;
  }
  self.postMessage({ id: m.id, ok: false, error: "unknown-op" });
};
`;

  // Freeze hardening (Nov 2026): the 8-worker pool + unbounded prefetch could
  // wedge the whole machine — hung workers stayed in rotation (every Nth
  // chunk stalled 1.5s), prefetch piled more work behind the jam faster
  // than workers drained it (100% CPU on every core), and one worker
  // onerror poisoned the pool forever via a sticky `failed` flag while
  // `ready` stayed true. Fixed with: fewer workers, per-worker queue
  // tracking + least-busy routing, timeout recovery (terminate + replace
  // the hung worker so its queue can't block later chunks), error
  // eviction (drop the dead worker, allow retry), a circuit breaker
  // (repeated timeouts park threads briefly and fall back to sync gen
  // instead of stalling every chunk 1.5s), and prefetch backpressure.
  let pool = [], seq = 0, ready = false;
  let workerUrl = null;
  // circuit breaker: consecutive worker timeouts/failures. While open,
  // genChunkTiles fails fast so the main thread uses sync gen instead of
  // stalling 1.5s per chunk behind hung workers.
  let consecFail = 0, cooldownUntil = 0;
  const FAIL_OPEN_AT = 5, COOLDOWN_MS = 30000;
  // prefetch backpressure: skip when the pool is already busy.
  const MAX_PENDING_TOTAL = 32, MAX_QUEUED_PER_WORKER = 3;
  const pending = new Map();
  const tileCache = new Map(); // "cx,cy" -> {tiles, biome, hasDungeon}
  const stats = { tasks: 0, hits: 0, needsMain: 0, fallback: 0, cached: 0, timeouts: 0, workerRestarts: 0, breakerTrips: 0, prefetchSkip: 0 };
  const MAX_CACHE = 96;

  function supported() {
    try {
      return typeof Worker !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined" && !!URL.createObjectURL;
    } catch (e) { return false; }
  }
  function makeWorker() {
    const w = new Worker(workerUrl);
    const rec = { w, queued: 0, alive: true };
    w.onmessage = onMsg;
    w.onerror = () => { try { evictWorker(rec, true); } catch (e) { } };
    return rec;
  }
  // Drop a dead/hung worker from rotation and replace it so one bad worker
  // can never wedge every Nth chunk. Replacement is best-effort: if the
  // browser refuses more workers we just run with fewer.
  function evictWorker(rec, fromError) {
    try {
      if (!rec || !rec.alive) return;
      rec.alive = false;
      const i = pool.indexOf(rec);
      if (i >= 0) pool.splice(i, 1);
      try { rec.w.onmessage = null; rec.w.onerror = null; } catch (e) { }
      try { rec.w.terminate(); } catch (e) { }
      // fail any still-queued pendings that were routed to this worker so
      // their callers fall back to sync gen instead of hanging to timeout
      for (const [id, p] of pending) {
        try {
          if (p && p.worker === rec) {
            pending.delete(id);
            try { clearTimeout(p.timer); } catch (e2) { }
            try { p.reject(new Error(fromError ? "worker-error" : "worker-restart")); } catch (e3) { }
          }
        } catch (e) { }
      }
      if (pool.length === 0) ready = false;
      else { try { const r = makeWorker(); pool.push(r); } catch (e) { } }
      try { stats.workerRestarts++; } catch (e) { }
    } catch (e) { }
  }
  function noteFail() {
    consecFail++;
    if (consecFail >= FAIL_OPEN_AT) {
      cooldownUntil = Date.now() + COOLDOWN_MS;
      try { stats.breakerTrips++; } catch (e) { }
      consecFail = 0;
    }
  }
  function noteOk() { consecFail = 0; }
  function breakerOpen() {
    try { if (Date.now() < cooldownUntil) return true; } catch (e) { }
    return false;
  }
  function ensure(n) {
    if (ready) return true;
    if (!supported()) return false;
    if (breakerOpen()) return false;
    try {
      // one worker per core minus the main thread, clamped 1..4 (was 1..8:
      // 8 workers oversubscribed low-end machines — 8 busy fbm workers +
      // the main thread + GPU compositing saturated every core and froze
      // the whole system. Wild-chunk tiles build in ~4ms, so 4 workers
      // still drain a 3x3 burst in one round while leaving headroom).
      const hw = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) | 0 || 4;
      const count = Math.max(1, Math.min(4, hw - 1));
      if (!workerUrl) {
        const blob = new Blob([WORKER_SRC], { type: "text/javascript" });
        workerUrl = URL.createObjectURL(blob);
      }
      for (let i = 0; i < (n || count); i++) {
        try { pool.push(makeWorker()); }
        catch (e) { break; }
      }
      ready = pool.length > 0;
      return ready;
    } catch (e) { ready = false; return false; }
  }
  function onMsg(e) {
    const m = e.data || {};
    const p = pending.get(m.id);
    if (!p) {
      // prefetch late-arrival (arrived after its 6s timer gave up): stash
      // in cache. The worker echoes the _prefetch tag + coords we sent.
      if (m.ok && !m.needsMain && m.tiles && (m._prefetch || m._cx != null)) {
        try {
          const k = m._cx + "," + m._cy;
          if (String(k).indexOf("undefined") < 0 && String(k).indexOf("null") < 0) {
            if (tileCache.size >= MAX_CACHE) { const fk = tileCache.keys().next().value; tileCache.delete(fk); }
            if (m.tiles.length === 256) tileCache.set(k, { tiles: m.tiles, biome: m.biome, hasDungeon: m.hasDungeon });
          }
        } catch (e2) { }
      }
      return;
    }
    pending.delete(m.id);
    try { clearTimeout(p.timer); } catch (e2) { }
    try { if (p.worker) p.worker.queued = Math.max(0, (p.worker.queued | 0) - 1); } catch (e3) { }
    if (m.ok) noteOk();
    if (m.ok) p.resolve(m);
    else { noteFail(); p.reject(new Error(String(m.error || "worker-fail"))); }
  }
  // Least-busy alive worker. Prefetch passes allowBusy=true and gets null
  // when every worker already has a queue — the caller then skips instead
  // of piling an ever-growing backlog behind a jam.
  function pickWorker(allowBusy) {
    let best = null;
    for (const r of pool) {
      if (!r || !r.alive) continue;
      if (!best || (r.queued | 0) < (best.queued | 0)) best = r;
    }
    if (!best) return null;
    if (!allowBusy && (best.queued | 0) >= MAX_QUEUED_PER_WORKER) return null;
    return best;
  }
  function callChunk(cx, cy, timeoutMs) {
    return new Promise((resolve, reject) => {
      if (!ensure()) { reject(new Error("no-threads")); return; }
      if (breakerOpen()) { reject(new Error("threads-cooldown")); return; }
      const rec = pickWorker(false);
      if (!rec) { reject(new Error("workers-busy")); return; }
      const id = ++seq;
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          const p = pending.get(id);
          pending.delete(id);
          try { if (p && p.worker) p.worker.queued = Math.max(0, (p.worker.queued | 0) - 1); } catch (e2) { }
          try { stats.timeouts++; } catch (e3) { }
          noteFail();
          // the worker that missed its deadline is hung or wedged behind a
          // pathological chunk: terminate + replace it so its whole queue
          // can't block every later chunk routed to it.
          try { if (p && p.worker) evictWorker(p.worker, false); } catch (e4) { }
          reject(new Error("worker-timeout"));
        }
      }, timeoutMs || 1500);
      rec.queued = (rec.queued | 0) + 1;
      pending.set(id, { resolve, reject, timer, worker: rec });
      stats.tasks++;
      try { rec.w.postMessage({ id, op: "chunk", cx, cy }); }
      catch (e) {
        pending.delete(id);
        try { clearTimeout(timer); } catch (e2) { }
        try { rec.queued = Math.max(0, (rec.queued | 0) - 1); } catch (e3) { }
        noteFail();
        try { evictWorker(rec, true); } catch (e4) { }
        reject(e);
      }
    });
  }
  async function genChunkTiles(cx, cy, timeoutMs) {
    const r = await callChunk(cx, cy, timeoutMs);
    if (!r || r.needsMain) { stats.needsMain++; return r; }
    // sanity: exact shape the main thread expects
    if (!r.tiles || r.tiles.length !== 256) { stats.fallback++; throw new Error("bad-tiles"); }
    stats.hits++;
    return r;
  }
  function takeCached(cx, cy) {
    const k = cx + "," + cy;
    const r = tileCache.get(k);
    if (r) { tileCache.delete(k); stats.cached++; }
    return r || null;
  }
  // Fire-and-forget ring prefetch around the player chunk: warms tileCache
  // with worker-built wilderness tiles while the player walks. Main-thread
  // chunks (settlements) resolve to needsMain and are simply not cached.
  function prefetch(cx, cy) {
    try {
      if (!ensure()) return;
      if (breakerOpen()) return;
      // backpressure: never pile prefetch behind a busy pool — the real
      // chunk path (callChunk) must win every race. If the pool is already
      // saturated or too many replies are outstanding, skip this round
      // entirely; the next 0.5s tick will try again.
      if (pending.size >= MAX_PENDING_TOTAL) { try { stats.prefetchSkip++; } catch (e) { } return; }
      let queued = 0;
      // 8 outer-ring tiles, not 16: half the worker load for the same
      // one-step lookahead (the 3x3 resident set is never prefetched).
      // stopOuter: the inner `break` below must stop the whole ring, not
      // just the current row — otherwise one busy worker costs up to 5
      // skip-counts per round and the accounting reads as a storm.
      let stopOuter = false;
      for (let dy = -2; dy <= 2 && queued < 8 && !stopOuter; dy++) for (let dx = -2; dx <= 2 && queued < 8; dx++) {
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) continue;
        const k = (cx + dx) + "," + (cy + dy);
        if (tileCache.has(k)) continue;
        const rec = pickWorker(true);
        // prefetch is strictly idle-only: if even the least-busy worker
        // already has one chunk queued, stop. Real chunk requests (callChunk)
        // allow deeper queues — prefetch must never steal their headroom or
        // deepen a backlog behind a jam (that storm pinned all cores).
        if (!rec || (rec.queued | 0) >= 1) { try { stats.prefetchSkip++; } catch (e) { } stopOuter = true; break; }
        const id = ++seq;
        const px = cx + dx, py = cy + dy;
        rec.queued = (rec.queued | 0) + 1;
        pending.set(id, {
          resolve: () => { pending.delete(id); }, reject: () => { pending.delete(id); }, worker: rec,
          timer: setTimeout(() => {
            try {
              const pp = pending.get(id);
              if (pp) { pending.delete(id); try { if (pp.worker) pp.worker.queued = Math.max(0, (pp.worker.queued | 0) - 1); } catch (e2) { } }
            } catch (e) { }
          }, 6000),
        });
        const entry = pending.get(id);
        const origRes = entry.resolve;
        entry.resolve = (m) => {
          pending.delete(id);
          try { clearTimeout(entry.timer); } catch (e) { }
          // NOTE: no queued-- here. onMsg already decremented this worker's
          // queue before invoking resolve; decrementing twice drove counters
          // negative, which broke least-busy routing (the most-successful
          // worker looked "least busy" forever and absorbed every later
          // chunk, jamming it while siblings idled).
          if (m && m.ok && !m.needsMain && m.tiles && m.tiles.length === 256) {
            try {
              if (tileCache.size >= MAX_CACHE) { const fk = tileCache.keys().next().value; tileCache.delete(fk); }
              tileCache.set(px + "," + py, { tiles: m.tiles, biome: m.biome, hasDungeon: m.hasDungeon });
            } catch (e) { }
          }
          try { origRes(m); } catch (e) { }
        };
        // tag + coords ride on the worker message so a reply that arrives
        // after its timer still lands in cache via the onMsg fallback.
        try { rec.w.postMessage({ id, op: "chunk", cx: px, cy: py, _prefetch: 1, _cx: px, _cy: py }); queued++; }
        catch (e) {
          pending.delete(id);
          try { rec.queued = Math.max(0, (rec.queued | 0) - 1); } catch (e2) { }
        }
      }
    } catch (e) { }
  }
  function noteHit() { }
  function noteNeedsMain() { }
  function threadStats() {
    let queued = 0;
    try { for (const p of pending.values()) queued++; } catch (e) { }
    return { ready, workers: pool.length, pending: queued, breakerOpen: breakerOpen(), ...stats, cachedNow: tileCache.size, wgen: WGEN_V };
  }
  return { ensure, supported, genChunkTiles, takeCached, prefetch, noteHit, noteNeedsMain, stats: threadStats };
})();
