/* Heaven dimension — parallel universe (window.Heaven).
 * Post-Peter: the goddess returns the hero to spawn and gives a HEAVENLY
 * SPHERE. Surface-world hearths then offer teleport to the SAME coordinates
 * in the heaven dimension: walkable cloud surface, lakes/reservoirs, grass +
 * tree islands, hearths with angels + heavendweller NPCs, own culture and
 * buildings. No dungeons. Unique mobs + overworld bosses (Divine Dragon,
 * Celestial Messenger...) are passive unless provoked repeatedly; while
 * passive they heal the player (status + low HP). Center: the pantheon where
 * the goddess of dawn resides (talk, or mock battle).
 */
window.Heaven = (() => {
  const CENTER = { x: 0, y: 0 };
  const RADIUS = 3500;
  const PANTHEON_RADIUS = 60;
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  function isHeavenGround(gx, gy) {
    try { return dist(gx, gy, CENTER.x, CENTER.y) < RADIUS; } catch (e) { return false; }
  }
  function isPantheonGround(gx, gy) {
    try { return dist(gx, gy, CENTER.x, CENTER.y) < PANTHEON_RADIUS; } catch (e) { return false; }
  }
  function curDim() {
    try { if (window.World && window.World.getDim) return window.World.getDim(); } catch (e) {}
    try { const p = player(); if (p && (p.dim === "heaven" || p.dim === "hell" || p.dim === "surf")) return p.dim; } catch (e2) {}
    return "surf";
  }
  function hash2(x, y) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  // Heaven biome: cloud base everywhere inside the disc; lakes/reservoirs as
  // water blobs; grass+tree islands scattered. Pantheon core reads as town.
  // v26: bloom meadows (blossom fields), low mists (wisp hollows) and golden
  // pastures (grazing grounds) join the cloud/lake/grove/meadow set.
  function heavenBiomeFor(gx, gy) {
    try {
      const d = dist(gx, gy, CENTER.x, CENTER.y);
      if (d < PANTHEON_RADIUS + 2) return "town";
      const w = hash2(gx * 3 + 41, gy * 3 + 17);
      const g = hash2(gx * 5 + 7, gy * 5 + 3);
      const m = hash2(gx * 11 + 73, gy * 11 + 31);
      const n = hash2(gx * 13 + 7, gy * 17 + 61);
      if (w > 0.80) return "heaven_lake";
      if (m > 0.80) return "heaven_bloom";
      if (n > 0.80) return "heaven_mist";
      if (g > 0.62) return "heaven_grove";
      if (g > 0.45) return "heaven_meadow";
      if (g > 0.30) return "heaven_pasture";
      return "heaven_cloud";
    } catch (e) { return "heaven_cloud"; }
  }
  // Map surface settlement types to heaven equivalents inside heaven ground.
  function angelTypeFor(orig, cx, cy) {
    try {
      if (!isHeavenGround(cx, cy)) return orig;
      if (isPantheonGround(cx, cy)) return "pantheon";
      if (orig === "capital") return "pantheon_outpost";
      if (orig === "city" || orig === "trade_city" || orig === "port_city") return "angel_city";
      if (orig === "town" || orig === "watergate" || orig === "sakura" || orig === "fortress") return "angel_town";
      return "angel_village";
    } catch (e) { return orig; }
  }
  function player() { try { return window.Game && window.Game.G && window.Game.G.player; } catch (e) { return null; } }
  function hasSphere(p) {
    try {
      p = p || player();
      if (!p) return false;
      const inv = Array.isArray(p.inventory) ? p.inventory : (Array.isArray(p.pack) ? p.pack : []);
      return inv.some(s => s && s.id === "heavenly_sphere" && (s.n | 0) > 0);
    } catch (e) { return false; }
  }
  function heavenUnlocked(p) {
    try { p = p || player(); return !!(p && (p.heavenUnlocked || p.heavenEntered)); } catch (e) { return false; }
  }
  function markEntered(p) {
    try {
      p = p || player();
      if (!p) return;
      p.heavenUnlocked = true; p.heavenEntered = true;
      try {
        p.seenPlaces = p.seenPlaces || [];
        // chart the pantheon once
        const pn = "Radiant Pantheon 🌅 0,0";
        if (!p.seenPlaces.includes(pn)) p.seenPlaces.push(pn);
      } catch (e) {}
    } catch (e) {}
  }
  // v19-style resident test: angels + heavendwellers belong to heaven.
  function isHeavenResident(ent) {
    try {
      if (!ent || ent.isTame) return false;
      if (ent.kind && ent.kind !== "npc") return false;
      try {
        if (ent.inParty || ent.isRemoteParty) return false;
        if (ent.id && window.Game && window.Game.G && window.Game.G.player) {
          const pp = window.Game.G.player.party || [];
          if (pp.indexOf(ent.id) >= 0) return false;
        }
      } catch (e2) {}
      try {
        const ck = String(ent.chunkKey || "");
        const ckH = ck.indexOf("v_") === 0, ckSurf = ck.indexOf("c_") === 0;
        const dim = ent.dim;
        if ((dim === "heaven" || dim === "surf") && (ckH || ckSurf)) {
          if ((dim === "heaven") !== ckH) return ckH;
          return dim === "heaven";
        }
        if (dim === "heaven") return true;
        if (dim === "surf" || dim === "hell") return false;
        if (ckH) return true;
        if (ckSurf) return false;
      } catch (e3) {}
      return false;
    } catch (e) { return false; }
  }
  function isHeavenOverworld() {
    try {
      const p = player();
      if (!p || p.inDungeon) return false;
      if (curDim() !== "heaven" && p.dim !== "heaven") return false;
      if (curDim() !== "heaven") return false;
      return isHeavenGround(p.x, p.y);
    } catch (e) { return false; }
  }
  // Hearth travel: surface hearth (or heaven hearth) -> same coords, other side.
  // Gated on the heavenly sphere (like hell towers). Works both directions.
  async function useHearthGate(q) {
    try { installHooks();
      const p = player();
      if (!p) return false;
      const G = window.Game && window.Game.G;
      if (!G) return false;
      if (p.inDungeon) { try { window.UI.toast(`🌅 No heaven magic down here — climb out first.`, 3000); } catch (e) {} return true; }
      // mock battle locks the pantheon: no slipping out mid-duel
      try { if (_mock && _mock.active) { window.UI.toast(`🌅 The pantheon is sealed for the mock battle — finish the duel first.`, 3000); return true; } } catch (e) {}
      const curD = (p.dim === "heaven") ? "heaven" : "surf";
      if (curD !== "surf" && curD !== "heaven") return false;
      // sphere gate (like hell towers): the way INTO heaven demands the
      // physical sphere in hand. The way BACK is always open — a hero who
      // gave their sphere away in heaven can still walk home.
      const destDim = curD === "surf" ? "heaven" : "surf";
      if (destDim === "heaven" && !hasSphere(p)) { try { window.UI.toast(`🌅 The hearth hums faintly — only a Heavenly Sphere can lift you to the dawn side.`, 3000); } catch (e) {} return true; }
      // same coordinates, both worlds (spec)
      let dx = (q && isFinite(+q.x)) ? +q.x : p.x;
      let dy = (q && isFinite(+q.y)) ? +q.y : p.y;
      dx += 0.5; dy += 0.5;
      try {
        p.posByDim = p.posByDim || {};
        p.posByDim[curD] = { x: p.x, y: p.y };
      } catch (e) {}
      try {
        const back = p.posByDim && p.posByDim[destDim];
        if (back && isFinite(+back.x) && isFinite(+back.y)) { dx = +back.x; dy = +back.y; }
        else if (destDim === "heaven" && isFinite(+p.x)) {
          // first heaven entry lands at mirrored surface coords (same numbers)
          dx = p.x + 0.5; dy = p.y + 0.5;
          // keep inside the disc: far-frontier surface hearths clamp inward
          try {
            const d = Math.hypot(dx - CENTER.x, dy - CENTER.y);
            if (!(d < RADIUS - 4)) {
              const a = Math.atan2(dy - CENTER.y, dx - CENTER.x);
              dx = CENTER.x + Math.cos(a) * (RADIUS - 60);
              dy = CENTER.y + Math.sin(a) * (RADIUS - 60);
            }
          } catch (e) {}
        }
      } catch (e) {}
      const firstHeaven = destDim === "heaven" && !p.heavenEntered;
      try { if (window.World && window.World.setDim) window.World.setDim(destDim); } catch (e) {}
      try { p.dim = destDim; } catch (e) {}
      try {
        p.posByDim = p.posByDim || {};
        p.posByDim[destDim] = { x: dx, y: dy };
      } catch (e) {}
      try {
        p.x = dx; p.y = dy;
        p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
        if (window.Game && window.Game.clearCombat) { try { window.Game.clearCombat(); } catch (e) {} }
        try { G.mobs = (G.mobs || []).filter(m => m && m._goddessMock); } catch (e) { try { G.mobs = []; } catch (e2) {} }
        // end a mock battle if the player somehow leaves mid-duel
        try { if (_mock && _mock.active) endMockBattle("fled"); } catch (e) {}
        try { G.projectiles = []; G.npcs = []; G.chunks = new Map(); } catch (e) {}
        try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) {}
        try { if (window.Game && window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e) {}
        try { if (window.Game && window.Game.summonParty) window.Game.summonParty({ quiet: true }); } catch (e) {}
        try {
          if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround();
          else if (window.Game.G) window.Game.G._groundVer = (window.Game.G._groundVer || 0) + 1;
        } catch (e2) {}
        // heaven quest: holy-water errand notices the surface leg
        try {
          const hq = p.heavQ;
          if (hq && hq.water && hq.water.status === "active" && destDim === "surf") hq.water.sawSurf = true;
        } catch (e) {}
        if (destDim === "heaven") {
          try { markEntered(p); } catch (e) {}
          try { window.UI.toast(firstHeaven ? `🌅 The sphere lifts you — HEAVEN. Soft cloud underfoot.` : `🌅 Heaven again.`, 4500); } catch (e) {}
        } else {
          try { window.UI.toast(`✨ Back on the surface.`, 3500); } catch (e) {}
        }
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
        try { if (window.UI && window.UI.drawMinimap) window.UI.drawMinimap(); } catch (e) {}
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }

  // ================= PANTHEON + MOCK BATTLE + QUESTS =================
  const _mock = { active: false, goddessId: null, walls: new Map(), specs: [], stashed: [] };
  function isMockActive() { try { return !!(_mock && _mock.active); } catch (e) { return false; } }
  function isMockWall(gx, gy) {
    try { return !!(_mock && _mock.active && _mock.walls.has(gx + "," + gy)); } catch (e) { return false; }
  }
  function ensureGoddessTemplate() {
    try {
      const C = window.CFG;
      if (!C || !C.MOB_TEMPLATES) return;
      if (!C.MOB_TEMPLATES.goddess) {
        C.MOB_TEMPLATES.goddess = {
          name: "Goddess of Dawn", hp: 8225, mp: 850, atk: 110, def: 4, spd: 4.8,
          xp: 8000, abilities: ["holy_sword", "smite", "blessed_weapon", "heal", "panacea", "whiteout"],
          tint: "#ffe9a8", body: "humanoid", boss: true, heavenBoss: true,
        };
      } else {
        try {
          const t = C.MOB_TEMPLATES.goddess;
          t.hp = 8225; t.mp = 850; t.atk = 110; t.def = 4; t.spd = 4.8;
          t.xp = 8000;
          if (!Array.isArray(t.abilities)) t.abilities = [];
          for (const a of ["holy_sword", "smite", "blessed_weapon", "heal", "panacea", "whiteout"]) if (!t.abilities.includes(a)) t.abilities.push(a);
          t.boss = true;
        } catch (e) {}
      }
      try {
        if (C.BOSS_KINDS && !C.BOSS_KINDS.includes("goddess")) C.BOSS_KINDS.push("goddess");
        if (C.HEAVEN_BOSS_KINDS && !C.HEAVEN_BOSS_KINDS.includes("goddess")) C.HEAVEN_BOSS_KINDS.push("goddess");
        if (C.BOSS_MIN_EFF) C.BOSS_MIN_EFF.goddess = 12;
        if (C.BOSS_THEMES) C.BOSS_THEMES.goddess = ["dawn"];
        // YAML wins: re-apply the file's goddess row over these planted
        // defaults (edits to src/data/bosses.yaml stay authoritative).
        try { if (window.BossData && window.BossData.bosses && window.BossData.bosses.goddess) window.BossData.applyKind("goddess", window.BossData.bosses.goddess); } catch (e2) {}
      } catch (e) {}
    } catch (e) {}
  }
  function heavQ(p) {
    try {
      p = p || player();
      if (!p) return null;
      if (!p.heavQ || typeof p.heavQ !== "object") p.heavQ = {};
      return p.heavQ;
    } catch (e) { return null; }
  }
  function mockUnlocked(p) {
    try { p = p || player(); return !!(p && p.heavenEntered); } catch (e) { return false; }
  }
  function questsUnlocked(p) {
    try { p = p || player(); return !!p && !!(p.heavMockDone || (p.heavMockWins | 0) > 0 || (p.heavMockLosses | 0) > 0); } catch (e) { return false; }
  }
  function goddessPseudo() {
    return { id: "goddess_pantheon", name: "Goddess of Dawn", role: "Herald of the Morning · lv 100", lv: 100, hp: 100, maxHp: 100, gold: 0, memories: { summary: "", tail: [] }, isGoddessOutro: true, noTrade: true, kind: "goddess", tint: "#ffe9a8", appearance: null, persona: "🌅 Dawn herself receives you." };
  }
  function pantheonLine() {
    try {
      const p = player();
      const wins = (p && p.heavMockWins | 0) || 0, losses = (p && p.heavMockLosses | 0) || 0;
      if (_mock && _mock.active) return "The ring of dawnfire holds — finish the duel, hero.";
      if (wins + losses <= 0) return "You came up. Good — the cloud holds you. Breathe a moment; the hush here is the whole point of heaven.";
      if (wins > losses) return "*sigh* My shoulder still smarts, hero. The watchers talk of nothing else — and the paperwork talks of nothing but me. Being dawn is mostly forms in triplicate.";
      if (losses > wins) return "Up again so soon? The cloud missed your footsteps. Mind the seal rules — every duel doubles my filing. Eternity, and I spend it on incident reports.";
      return "The pantheon hums. The watchers nod as you pass. (She is pretending the duty roster fills itself.)";
    } catch (e) { return "The pantheon hums."; }
  }
  async function openPantheon(poi) {
    try { installHooks();
      const p = player();
      if (!p) return;
      if (p.dim !== "heaven") { try { window.UI.toast(`🌅 The heart hums — from the heaven side.`, 3000); } catch (e) {} return; }
      if (p.inDungeon) { try { window.UI.toast(`🌅 No pantheon magic down here.`, 3000); } catch (e) {} return; }
      const d = Math.hypot(p.x - (CENTER.x + 0.5), p.y - (CENTER.y + 0.5));
      if (!(d < PANTHEON_RADIUS + 14)) { try { window.UI.toast(`🌅 The Radiant Pantheon waits at heaven's heart (0,0).`, 3500); } catch (e) {} return; }
      try { checkWaterTurnin(); } catch (e) {}
      const U = window.UI;
      if (!U || !U.openChat) return;
      try { U.openChat(goddessPseudo()); } catch (e) { return; }
      setTimeout(() => {
        try {
          const log = document.getElementById("chatLog");
          if (!log) return;
          log.innerHTML = "";
          const q = document.createElement("div");
          q.className = "msg npc";
          q.innerHTML = "<span><b>Goddess of Dawn:</b> " + pantheonLine() + "</span>";
          log.appendChild(q);
          const mk = (label, fn) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.style.cssText = "display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px;";
            b.onclick = () => { try { fn(); } catch (e) {} };
            log.appendChild(b);
          };
          mk("🌅 Talk — what is this place?", () => {
            try {
              log.innerHTML = "";
              const t = document.createElement("div");
              t.className = "msg npc";
              t.innerHTML = "<span><b>Goddess of Dawn:</b> My quiet answer to hell. No delves, no war — cloud to walk, reservoirs to drink, groves to get lost in. The serenes (wild celestials, and the great ones) never strike first: two warnings, then teeth. While they are calm they mend whoever passes — status first, then wounds. Angels keep the hearths with the heavendwellers. And I keep the middle, in case you ever want to test your edge against mine.</span>";
              log.appendChild(t);
              try { log.scrollTop = 0; } catch (e) {}
            } catch (e) {}
          });
          if ((_mock && _mock.active)) {
            mk("⚔️ The duel is on — return to the ring", () => { try { U.closeChat(); } catch (e) {} });
          } else {
            mk("⚔️ Ask for a mock battle (sealed pantheon, to first fall)", () => { try { startMockBattle(); } catch (e) {} });
          }
          if (questsUnlocked(p)) {
            mk("📜 Ask for work (heaven quests)", () => { try { openHeavenQuests(); } catch (e) {} });
          } else {
            mk("📜 Ask for work", () => {
              try {
                log.innerHTML = "";
                const t = document.createElement("div");
                t.className = "msg npc";
                t.innerHTML = "<span><b>Goddess of Dawn:</b> First cross blades with me — gently, to first fall. Win or lose, I will trust you with the errands after. The seal keeps everyone safe.</span>";
                log.appendChild(t);
              } catch (e) {}
            });
          }
          mk("🚪 Take your leave", () => { try { U.closeChat(); } catch (e) {} });
          try { log.scrollTop = 0; } catch (e) {}
          try {
            for (const id of ["chatInput", "chatSend", "recruitBtn", "chatQuestBtn", "chatReportBtn", "healBtn", "giftBtn", "tradeBtn", "allyBtn"]) {
              const el = document.getElementById(id); if (el) el.hidden = true;
            }
            const tp = document.getElementById("npcTradePane"); if (tp) tp.hidden = true;
          } catch (e) {}
        } catch (e) {}
      }, 60);
    } catch (e) {}
  }
  function sealRing() {
    // impenetrable ring r=16 around the pantheon heart (chunk tiles + guard set)
    try {
      _mock.walls.clear();
      const G = window.Game && window.Game.G;
      if (!G) return;
      let ST = 14;
      try { ST = window.CFG.T.STONEWALL; } catch (e) {}
      const CH = 16;
      const r = 16;
      for (let a = 0; a < 64; a++) {
        const ang = a / 64 * Math.PI * 2;
        const gx = Math.round(CENTER.x + Math.cos(ang) * r), gy = Math.round(CENTER.y + Math.sin(ang) * r);
        const key = gx + "," + gy;
        if (_mock.walls.has(key)) continue;
        try {
          const cx = Math.floor(gx / CH), cy = Math.floor(gy / CH);
          const ch = G.chunks.get(cx + "," + cy) || null;
          if (!ch || !ch.tiles) continue;
          const lx = gx - cx * CH, ly = gy - cy * CH;
          if (lx < 0 || ly < 0 || lx >= CH || ly >= CH) continue;
          const idx = ly * CH + lx;
          const prev = ch.tiles[idx];
          _mock.walls.set(key, { ch, idx, prev });
          ch.tiles[idx] = ST;
        } catch (e) {}
      }
      try { if (window.Game && window.Game.invalidateGround) window.Game.invalidateGround(); } catch (e) {}
    } catch (e) {}
  }
  function unsealRing() {
    try {
      for (const rec of _mock.walls.values()) {
        try { if (rec && rec.ch && rec.ch.tiles && rec.idx >= 0) rec.ch.tiles[rec.idx] = rec.prev; } catch (e) {}
      }
    } catch (e) {}
    try { _mock.walls.clear(); } catch (e) {}
    try { if (window.Game && window.Game.invalidateGround) window.Game.invalidateGround(); } catch (e) {}
  }
  // The duel is fought alone: bystanders leave the ring before the seal
  // closes, and file back to their exact spots when it lifts. NPCs are
  // stashed (same objects, restored by reference — memories/schedules
  // untouched); stray wild mobs are simply set down outside with the
  // watching crowd (heaven refills its own wildlife). Party + tames stay:
  // they fight beside the hero, they are not bystanders.
  function evacuateRing() {
    try {
      const G = window.Game && window.Game.G;
      if (!G) return;
      _mock.stashed = [];
      const R = 16;
      const cx = CENTER.x + 0.5, cy = CENTER.y + 0.5;
      const inRing = (x, y) => { try { return Math.hypot(x - cx, y - cy) < R + 0.5; } catch (e) { return false; } };
      const outside = () => {
        const a = Math.random() * Math.PI * 2, r = R + 3 + Math.random() * 3;
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      };
      const hero = player();
      try {
        for (const n of (G.npcs || [])) {
          try {
            if (!n || n === hero) continue;
            if (n.inParty) continue;
            if (!inRing(n.x, n.y)) continue;
            _mock.stashed.push({ n, x: n.x, y: n.y });
            const s = outside();
            n.x = s.x; n.y = s.y;
            try { n.targetId = null; n.targetRef = null; n.hostileUntil = 0; } catch (e) {}
          } catch (e) {}
        }
      } catch (e) {}
      try {
        for (const m of (G.mobs || [])) {
          try {
            if (!m || m.id === _mock.goddessId || m._goddessMock || m._mockSpec) continue;
            if (!inRing(m.x, m.y)) continue;
            const s = outside();
            m.x = s.x; m.y = s.y; m.homeX = s.x; m.homeY = s.y;
            try { m.targetId = null; m.targetRef = null; m.hostileUntil = 0; m.aggro = false; } catch (e) {}
          } catch (e) {}
        }
      } catch (e) {}
    } catch (e) {}
  }
  function restoreRing() {
    try {
      for (const s of (_mock.stashed || [])) {
        try { if (s && s.n) { s.n.x = s.x; s.n.y = s.y; } } catch (e) {}
      }
    } catch (e) {}
    try { _mock.stashed = []; } catch (e) {}
  }
  function clearMockMobs() {
    try {
      const G = window.Game && window.Game.G;
      if (!G) return;
      const gid = _mock.goddessId;
      const sids = new Set(_mock.specs || []);
      G.mobs = (G.mobs || []).filter(m => {
        if (!m) return false;
        if (gid && m.id === gid) return false;
        if (sids.has(m.id)) return false;
        if (m._goddessMock || m._mockSpec) return false;
        return true;
      });
    } catch (e) {}
    try { _mock.specs = []; _mock.goddessId = null; } catch (e) {}
  }
  async function startMockBattle() {
    try { installHooks();
      const p = player();
      const G = window.Game && window.Game.G;
      if (!p || !G) return;
      try { if (window.UI && window.UI.closeChat) window.UI.closeChat(); } catch (e) {}
      if (_mock.active) { try { window.UI.toast(`🌅 The duel is already joined.`, 2500); } catch (e) {} return; }
      if (p.dim !== "heaven") { try { window.UI.toast(`🌅 The mock battle is fought in heaven.`, 3000); } catch (e) {} return; }
      if (p.inDungeon) { try { window.UI.toast(`🌅 Climb out first — the seal needs open sky.`, 3000); } catch (e) {} return; }
      if (!mockUnlocked(p)) { try { window.UI.toast(`🌅 Heaven has not yet let you in.`, 3000); } catch (e) {} return; }
      if (!(p.hp > 0)) return;
      try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) {}
      // pull both fighters to the heart: goddess at (0,3), hero just south
      let gx = CENTER.x + 0.5, gy = CENTER.y + 3.5;
      let px = CENTER.x + 0.5, py = CENTER.y + 8.5;
      try {
        if (window.Game.walkable && !window.Game.walkable(gx, gy)) {
          const s = window.Game.nearWalkable(gx, gy);
          if (s) { gx = s.x; gy = s.y; }
        }
        if (window.Game.walkable && !window.Game.walkable(px, py)) {
          const s2 = window.Game.nearWalkable(px, py);
          if (s2) { px = s2.x; py = s2.y; }
        }
      } catch (e) {}
      try {
        p.x = px; p.y = py;
        p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
        if (window.Game.clearCombat) try { window.Game.clearCombat(); } catch (e) {}
      } catch (e) {}
      sealRing();
      try { ensureGoddessTemplate(); } catch (e) {}
      // spectators: calm angels ringed outside the seal (never pilgrims)
      try {
        _mock.specs = [];
        const kinds = ["dawn_angel", "choir_angel", "seraph_guard", "scroll_angel", "dawn_angel", "choir_angel"];
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2 + 0.3;
          const sx = CENTER.x + 0.5 + Math.cos(a) * 20, sy = CENTER.y + 0.5 + Math.sin(a) * 20;
          try {
            const m = window.Entities.makeMob(kinds[i % kinds.length], Math.max(40, (p.lv | 0) || 40), 50, 0);
            m.x = sx; m.y = sy; m.homeX = sx; m.homeY = sy;
            m.hp = m.maxHp; m.mp = m.maxMp;
            m._mockSpec = true;
            try { m.passive = true; m.docile = true; } catch (e) { }
            try { m.targetId = null; m.targetRef = null; m.hostileUntil = 0; m.aggro = false; } catch (e) {}
            G.mobs.push(m);
            _mock.specs.push(m.id);
          } catch (e) {}
        }
      } catch (e) {}
      // the goddess herself — the real tier-12 warlord, not a mirror: the
      // goddess template at the hero's level, fought at player scale
      // (1x, like Peter). First to fall yields; no loot, no XP.
      // status/stun immune (game.js halves via _goddessMock, status.js immunizes)
      let g = null;
      try {
        const hl = Math.max(1, (p && p.lv) || 60);
        g = window.Entities.makeMob("goddess", hl, 50, 0);
        g.x = gx; g.y = gy; g.homeX = gx; g.homeY = gy; g.faceAng = Math.PI / 2;
        g.hp = g.maxHp; g.mp = g.maxMp;
        try { g.stamina = g.maxStamina; } catch (eSt) {}
        g.xp = 0; g.xpReward = 0;
        g.isBoss = true; g.boss = true;
        g._goddessMock = true; g._statusImmune = true;
        g.targetId = null; g.targetRef = null; g.hostileUntil = 0; g.aggro = true;
        g.cooldowns = {}; g.buffs = {};
        g.bossT = 2; g.bossT2 = 6; g.phase = 0; g.bossEnraged = false;
        g.atkCd = 0; g.wt = 0; g.wa = 0;
        // blessed weapon up at the bell, like warlords psyching up
        try { g.cooldowns.blessed_weapon = 0; } catch (e) {}
        G.mobs.push(g);
        _mock.goddessId = g.id;
        _mock.active = true;
        try { if (window.Game.setHostile) { window.Game.setHostile(g, p, 9999); window.Game.setHostile(p, g, 9999); } else { g.targetId = "player"; g.targetRef = p; g.hostileUntil = performance.now() + 9999 * 1000; } } catch (e) {
          try { g.targetId = "player"; g.targetRef = p; } catch (e2) {}
        }
      } catch (e) { try { unsealRing(); clearMockMobs(); } catch (e2) {} return; }
      try { p._heavMock = true; } catch (e) {}
      evacuateRing();
      try { window.UI.toast(`🌅 The pantheon seals — dawnfire ring, angels watching. First to fall yields.`, 5000); } catch (e) {}
      try { if (window.Sfx && window.Sfx.death) window.Sfx.death(); } catch (e) {}
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
    } catch (e) {}
  }
  function endMockBattle(how) {
    try {
      const p = player();
      unsealRing();
      restoreRing();
      clearMockMobs();
      const was = !!(_mock && _mock.active);
      try { _mock.active = false; } catch (e) {}
      try { if (p) delete p._heavMock; } catch (e) {}
      if (!was) return;
      try {
        if (p) {
          p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
          if (window.Game.clearCombat) try { window.Game.clearCombat(); } catch (e) {}
          if (how === "playerLost") { p.heavMockLosses = ((p.heavMockLosses | 0) || 0) + 1; p.heavMockDone = true; }
          else if (how === "goddessLost") { p.heavMockWins = ((p.heavMockWins | 0) || 0) + 1; p.heavMockDone = true; }
          else if (how === "fled") { /* no tally */ }
          try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
        }
      } catch (e) {}
      try {
        if (how === "playerLost") window.UI.toast(`🌅 Dawn catches you before the cloud does — whole again, on your feet. “Up you get.” *sigh* “The seal is lifted; the watchers saw nothing. Nothing at all. And now I have incident reports to file — do you know how much paperwork a mock battle makes?”`, 8000);
        else if (how === "goddessLost") window.UI.toast(`🌅 She sits up in the grass, laughing, then sighing. “Ow. Alright — alright! Seal's down, watchers dismissed. ...Do NOT tell Peter's ghost. Ugh, the forms for losing — 'supervising deity, state cause of defeat'...” Quests unlocked: ask her for work.`, 9000);
        else if (how !== "fled") window.UI.toast(`🌅 The dawnfire ring gutters out. The pantheon breathes again.`, 4000);
      } catch (e) {}
    } catch (e) {
      try { _mock.active = false; } catch (e2) {}
    }
  }
  function onPlayerDown(src, tgt) {
    try {
      if (!(_mock && _mock.active)) return false;
      const p = player();
      if (!p || (tgt !== p && tgt.kind !== "player")) return false;
      // instant revive on the spot, battle ends; no death screen
      try {
        p.hp = p.maxHp; p.mp = p.maxMp;
        try { if (p.stamina != null && p.maxStamina != null) p.stamina = p.maxStamina; } catch (e) {}
        try { if (window.Status && window.Status.cureAll) window.Status.cureAll(p); } catch (e) {}
        p.burnUntil = 0; p.slowUntil = 0; p.burnTick = 0;
        p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
        try { if (window.Game && window.Game.clearCombat) window.Game.clearCombat(); } catch (e) {}
        try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) {}
        try { window.Game.addParticles(p.x, p.y, "#ffe9a8", 18); } catch (e) {}
      } catch (e) {}
      try { endMockBattle("playerLost"); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  function onGoddessDown(src, tgt) {
    try {
      if (!(_mock && _mock.active)) return false;
      if (!tgt || !(tgt._goddessMock || (tgt.id && tgt.id === _mock.goddessId))) return false;
      // she revives at once, battle ends; no loot, no XP
      try { endMockBattle("goddessLost"); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  // ---- heaven quests (after first mock battle, win OR lose) ----
  function qState(p, id) {
    try {
      const hq = heavQ(p);
      if (!hq[id] || typeof hq[id] !== "object") hq[id] = { status: "locked", have: 0, need: 1 };
      return hq[id];
    } catch (e) { return null; }
  }
  function questDefs() {
    return [
      { id: "dragon", name: "A dragon naps on a roof", need: 1, kind: "divine_dragon",
        text: "A divine dragon has curled around some poor soul's rooftop and refuses to discuss it. Move it along — firmly, once it answers your knocking." },
      { id: "water", name: "Holy water for the surface", need: 3, item: "holy_water",
        text: "The surface cathedrals keep asking. Take 3 holy waters down (step back through a hearth), pour a measure at a cathedral altar (E), then bring yourself home and tell me." },
      { id: "return", name: "Heavendwellers, reborn downward", need: 3,
        text: "Three heavendwellers stand ready to reincarnate to the surface. Speak with angels and heavendwellers up here — hear three of them out — and the wheel turns." },
    ];
  }
  function openHeavenQuests() {
    try {
      const p = player();
      if (!p) return;
      if (!questsUnlocked(p)) { try { window.UI.toast(`🌅 Cross blades with me first — then errands.`, 3500); } catch (e) {} return; }
      const U = window.UI;
      try { U.openChat(goddessPseudo()); } catch (e) { return; }
      setTimeout(() => {
        try {
          const log = document.getElementById("chatLog");
          if (!log) return;
          const hq = heavQ(p);
          const render = () => {
            try {
              log.innerHTML = "";
              const h = document.createElement("div");
              h.className = "msg npc";
              h.innerHTML = "<span><b>Goddess of Dawn:</b> The cloud runs on small kindnesses. Take what you can carry.</span>";
              log.appendChild(h);
              for (const d of questDefs()) {
                const st = qState(p, d.id);
                const row = document.createElement("div");
                row.style.cssText = "margin:6px 0;padding:8px;border:1px solid #3a4a5a;border-radius:8px;";
                let stat = "";
                if (st.status === "done") stat = " ✅ done";
                else if (st.status === "active") stat = ` — ${st.have | 0}/${st.need} active`;
                else if (st.status === "turnin") stat = " — ready to turn in! 📜";
                row.innerHTML = "<b>📜 " + d.name + "</b>" + stat + "<br><span style='opacity:0.85'>" + d.text + "</span>";
                log.appendChild(row);
                const b = document.createElement("button");
                b.style.cssText = "display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px;";
                if (st.status === "done") { b.textContent = "✅ " + d.name + " — complete"; b.disabled = true; }
                else if (st.status === "turnin") { b.textContent = "📜 Turn in: " + d.name; b.onclick = () => { turnInQuest(d.id); setTimeout(render, 50); }; }
                else if (st.status === "active") { b.textContent = "📜 Abandon: " + d.name; b.onclick = () => { try { abandonQuest(d.id); } catch (e) {} setTimeout(render, 50); }; }
                else { b.textContent = "📜 Accept: " + d.name; b.onclick = () => { acceptQuest(d.id); setTimeout(render, 50); }; }
                log.appendChild(b);
              }
              const back = document.createElement("button");
              back.textContent = "🚪 Back";
              back.style.cssText = "display:block;width:100%;text-align:left;margin:6px 0;padding:8px 10px;";
              back.onclick = () => { try { openPantheon(); } catch (e) {} };
              log.appendChild(back);
              try { log.scrollTop = 0; } catch (e) {}
            } catch (e) {}
          };
          render();
          try {
            for (const id of ["chatInput", "chatSend", "recruitBtn", "chatQuestBtn", "chatReportBtn", "healBtn", "giftBtn", "tradeBtn", "allyBtn"]) {
              const el = document.getElementById(id); if (el) el.hidden = true;
            }
            const tp = document.getElementById("npcTradePane"); if (tp) tp.hidden = true;
          } catch (e) {}
        } catch (e) {}
      }, 60);
    } catch (e) {}
  }
  function acceptQuest(id) {
    try { installHooks();
      const p = player();
      if (!p || !questsUnlocked(p)) return;
      const st = qState(p, id);
      if (!st || st.status === "active" || st.status === "done" || st.status === "turnin") return;
      st.status = "active"; st.have = 0;
      if (id === "dragon") st.need = 1;
      if (id === "water") {
        st.need = 3;
        try { if (window.Items && window.Items.addItem) window.Items.addItem(p, "holy_water", 3); } catch (e) {}
        st.sawSurf = false;
        try { st.blessed = 0; } catch (e) {}
        try { window.UI.toast(`💧 3 Holy Waters entrusted — step back to the surface, pour at a cathedral altar (E), then return to her.`, 5000); } catch (e) {}
      } else if (id === "return") { st.need = 3; }
      else if (id === "dragon") { try { window.UI.toast(`📜 Quest accepted: move the divine dragon (slay 1 in heaven).`, 5000); } catch (e) {} }
      else { try { window.UI.toast(`📜 Quest accepted.`, 4000); } catch (e) {} }
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
      try { refreshQuestLog(); } catch (e) {}
    } catch (e) {}
  }
  function abandonQuest(id) {
    try {
      const p = player();
      if (!p) return;
      const st = qState(p, id);
      if (!st || st.status !== "active") return;
      st.status = "locked"; st.have = 0;
      try {
        const d = questDefs().find(q => q.id === id);
        if (window.UI) window.UI.toast(`📜 Set aside: ${d ? d.name : id}.`, 3000);
      } catch (e) {}
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
      try { refreshQuestLog(); } catch (e) {}
    } catch (e) {}
  }
  function turnInQuest(id) {
    try {
      const p = player();
      if (!p) return;
      const st = qState(p, id);
      if (!st || st.status !== "turnin") return;
      // rewards: gold + xp, water quest also blesses
      try {
        const r = rewardFor(id);
        p.gold = Math.max(0, ((p.gold | 0) || 0) + r.gold);
        try { const gr = window.Entities.gainXp(p, r.xp); if (gr && gr.leveled && window.Game && window.Game.onLevelUp) { try { window.Game.onLevelUp(p, gr.newAbilities, gr); } catch (e) {} } } catch (e) {}
        if (id === "water") {
          try { if (window.Items && window.Items.addItem) window.Items.addItem(p, "holy_water", 1); } catch (e) {}
        }
        window.UI.toast(`📜 Quest complete — +${r.gold} gold, +${r.xp} XP.`, 6000);
        try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) {}
      } catch (e) {}
      st.status = "done";
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
      try { refreshQuestLog(); } catch (e) {}
    } catch (e) {}
  }
  function rewardFor(id) {
    if (id === "dragon") return { gold: 1500, xp: 1200 };
    if (id === "water") return { gold: 900, xp: 800 };
    return { gold: 1200, xp: 1000 };
  }
  function objectiveFor(p, id) {
    try {
      const st = qState(p, id);
      if (!st) return "";
      if (st.status === "turnin") return "Return to the Goddess of Dawn at the Radiant Pantheon (0,0, heaven) and turn in.";
      if (id === "dragon") return `Slay 1 divine dragon in heaven (${st.have | 0}/${st.need | 0 || 1}).`;
      if (id === "water") {
        const blessed = (st.blessed | 0) || 0;
        if (!st.sawSurf && p && p.dim === "heaven") return "Step back to the surface through a hearth gate, then pour holy water at a cathedral altar (E).";
        if (p && p.dim !== "heaven") return `Pour holy water at a surface cathedral altar (E) — blessed ${blessed}/1 — then return to her in heaven.`;
        return `Pour measured (${blessed}/1 blessed) — then speak to her to turn in.`;
      }
      if (id === "return") return `Hear out angels / heavendwellers in heaven (${st.have | 0}/${st.need | 0 || 3}) — talk (E).`;
    } catch (e) {}
    return "";
  }
  // Quest-log view: villager/guild-agnostic rows the 📜 menu can render.
  // Every entry carries its goddess giver + pantheon turn-in, so the log
  // can show progress, rewards and directions without the pantheon modal.
  function listQuests(p) {
    try {
      p = p || player();
      if (!p || !questsUnlocked(p)) return [];
      const out = [];
      for (const d of questDefs()) {
        let st = null;
        try { st = qState(p, d.id); } catch (e) { st = null; }
        if (!st || !st.status || st.status === "locked") continue;
        const r = rewardFor(d.id);
        out.push({
          heavenId: d.id,
          id: "heaven:" + d.id,
          title: d.name,
          type: "heaven",
          status: st.status,
          have: st.have | 0,
          need: st.need | 0 || d.need | 0 || 1,
          desc: d.text,
          story: d.text,
          objective: objectiveFor(p, d.id),
          reward: { gold: r.gold, xp: r.xp, items: [] },
          giver: { name: "Goddess of Dawn" },
          blessed: st.blessed | 0,
          sawSurf: !!st.sawSurf,
        });
      }
      return out;
    } catch (e) { return []; }
  }
  function refreshQuestLog() {
    try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) {}
    try {
      const m = document.getElementById("questModal");
      if (m && !m.hidden && window.UI && window.UI.renderQuests) window.UI.renderQuests();
    } catch (e) {}
  }
  function noteKill(kind) {
    try {
      const p = player();
      if (!p || !questsUnlocked(p)) return;
      if (kind === "divine_dragon") {
        const st = qState(p, "dragon");
        if (st && st.status === "active") {
          st.have = Math.min(st.need, (st.have | 0) + 1);
          if (st.have >= st.need) {
            st.status = "turnin";
            try { window.UI.toast(`📜 The rooftop is clear. Return to the goddess.`, 5000); } catch (e) {}
          } else { try { window.UI.toast(`📜 Dragon moved along (${st.have}/${st.need}).`, 3500); } catch (e) {} }
          try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
          try { refreshQuestLog(); } catch (e) {}
        }
      }
    } catch (e) {}
  }
  function noteAngelTalk() {
    try {
      const p = player();
      if (!p || !questsUnlocked(p)) return;
      const st = qState(p, "return");
      if (st && st.status === "active" && p.dim === "heaven") {
        st.have = Math.min(st.need, (st.have | 0) + 1);
        if (st.have >= st.need) {
          st.status = "turnin";
          try { window.UI.toast(`📜 Three souls heard. Tell her — the wheel is ready.`, 5000); } catch (e) {}
        }
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
        try { refreshQuestLog(); } catch (e) {}
      }
    } catch (e) {}
  }
  function checkWaterTurnin() {
    try {
      const p = player();
      if (!p || !questsUnlocked(p)) return false;
      const st = qState(p, "water");
      if (st && st.status === "active" && st.sawSurf && p.dim === "heaven") {
        // grandfather: daylight visits before the cathedral-blessing rule count
        if (!(st.blessed >= 1)) { try { st.blessed = 1; } catch (e) { } }
        let n = 0;
        try { n = window.Items.countItem(p, "holy_water") | 0; } catch (e) {}
        if (n >= 1) { st.status = "turnin"; try { refreshQuestLog(); } catch (e) {} return true; }
      }
      return false;
    } catch (e) { return false; }
  }
  // hook into the shared kill/talk flows once (no game.js edits needed)
  function installHooks() {
    try {
      if (window.Quests && !window.Quests.__heavWrapped) {
        window.Quests.__heavWrapped = true;
        const prevKill = window.Quests.onKill;
        try {
          window.Quests.onKill = function (src, tgt) {
            try { if (tgt && tgt.kind) noteKill(tgt.kind); } catch (e) {}
            try { return prevKill ? prevKill.call(this, src, tgt) : undefined; } catch (e) { return undefined; }
          };
        } catch (e) {}
        const prevTalk = window.Quests.onTalk;
        try {
          window.Quests.onTalk = function (npc) {
            try {
              if (npc && npc.kind === "npc" && player() && player().dim === "heaven") {
                const r = isHeavenResident(npc) || /angel|heavendweller|dawn|choir|seraph/i.test(String((npc && npc.role) || "") + " " + String((npc && npc.name) || ""));
                if (r) noteAngelTalk();
              }
            } catch (e) {}
            try { return prevTalk ? prevTalk.call(this, npc) : null; } catch (e) { return null; }
          };
        } catch (e) {}
      }
    } catch (e) {}
    try {
      if (window.UI && window.UI.openChat && !window.UI.openChat.__heavWrapped) {
        const prev = window.UI.openChat;
        window.UI.openChat.__heavWrapped = true;
        window.UI.openChat = function (npc) {
          try {
            if (npc && npc.kind === "npc" && player() && player().dim === "heaven" && !npc.inParty) {
              try { noteAngelTalk(); } catch (e) {}
            }
          } catch (e) {}
          return prev.call(this, npc);
        };
      }
    } catch (e) {}
  }
  try { installHooks(); } catch (e) {}
  // re-hook after scripts reload (openChat gets redefined by ui.js on boot)
  try { setTimeout(installHooks, 1500); setTimeout(installHooks, 5000); } catch (e) {}

  return {
    CENTER, RADIUS, PANTHEON_RADIUS,
    isHeavenGround, isPantheonGround, heavenBiomeFor, angelTypeFor,
    hasSphere, heavenUnlocked, markEntered, isHeavenResident, isHeavenOverworld,
    useHearthGate,
    openPantheon, startMockBattle, isMockActive, isMockWall, onPlayerDown, onGoddessDown,
    questsUnlocked, openHeavenQuests, acceptQuest, abandonQuest, turnInQuest,
    checkWaterTurnin, noteKill, questDefs, qState, rewardFor, objectiveFor,
    listQuests, refreshQuestLog,
  };
})();
