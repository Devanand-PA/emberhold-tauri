/* Hell dimension — parallel universe (window.Hell).
 * Pure helpers (deterministic, no Game) for worldgen + runtime hooks for
 * fragments, sphere, towers, sleep ambush, mob mechanics, dungeons.
 *
 * PARALLEL UNIVERSES (v19): hell mirrors the surface coordinate-for-coordinate.
 * Hell towers stand on the SAME numbers as the surface towers (tower E is
 * 1000,0 in both worlds — travel flips the dimension, never the position).
 * The castle stands at hell's own (0,0), right where the surface has its
 * starter town. Same numbers, separate ground, separate storage.
 */
window.Hell = (() => {
  const CENTER = { x: 0, y: 0 };
  const RADIUS = 3500;
  const CASTLE_RADIUS = 60;
  // Surface towers: far from spawn (~1000 ring, all 8 compass points).
  // Hell towers stand on the SAME coordinates in the hell dimension — each
  // pair is the same ground in the two worlds, so travel flips the dim and
  // keeps the position. (Kept as two lists so dim-local code keeps reading
  // its own side, but the numbers match exactly.)
  const SURFACE_TOWERS = [
    { x: 1000, y: 0, id: "hell_tower_E" },
    { x: 700, y: -700, id: "hell_tower_NE" },
    { x: -60, y: -1000, id: "hell_tower_N" },
    { x: -700, y: -700, id: "hell_tower_NW" },
    { x: -1000, y: 60, id: "hell_tower_W" },
    { x: -700, y: 700, id: "hell_tower_SW" },
    { x: 80, y: 1000, id: "hell_tower_S" },
    { x: 700, y: 700, id: "hell_tower_SE" },
  ];
  // Hell-side towers: the same coordinates as the surface ring — each pair
  // is the same ground in the two worlds, travel flips only the dimension.
  const HELL_TOWERS = SURFACE_TOWERS.map(t => ({ x: t.x, y: t.y, id: t.id }));
  const TOWER_RADIUS = 8;
  // Map-pin name for a tower (both dims share the scheme).
  function towerPin(tw) { try { return "Hell Tower 🗼 " + (tw.x | 0) + "," + (tw.y | 0); } catch (e) { return "Hell Tower 🗼"; } }
  // Global unlock: waking ANY one tower with a HELL SPHERE wakes them ALL
  // (both dims, all 16 pins charted) — and a woken ally shares the wake, so
  // allies wake without needing a sphere of their own. No sphere, no shared
  // wake, no prior unlock: the tower stays fully silent. Stale pins from
  // retired tower layouts are dropped.
  function unlockAllTowers(p, opts) {
    opts = opts || {};
    try {
      p = p || player();
      if (!p) return false;
      // SPHERE GATE: a fresh unlock needs a Hell Sphere forged from all 12
      // fragments — or a shared wake from a woken ally (viaAlly). Re-charting
      // an already-woken network is always fine; anything else is refused
      // silently.
      if (!p.hellTowersUnlocked && !opts.viaAlly && !hasSphere(p)) return false;
      const had = !!p.hellTowersUnlocked;
      if (!p.hellTowersUnlocked) p.hellTowersUnlocked = true;
      try {
        p.seenPlaces = p.seenPlaces || [];
        const keep = [];
        try {
          const near = (nm) => {
            const m = String(nm).match(/^Hell Tower 🗼 (-?\d+),(-?\d+)$/);
            if (!m) return true;
            const x = +m[1], y = +m[2];
            for (const t of SURFACE_TOWERS.concat(HELL_TOWERS)) {
              if (Math.hypot(x - t.x, y - t.y) < TOWER_RADIUS + 6) return true;
            }
            return false;
          };
          for (const nm of p.seenPlaces) { if (near(nm) && !keep.includes(nm)) keep.push(nm); }
        } catch (e) {}
        p.seenPlaces = keep;
        for (const t of SURFACE_TOWERS.concat(HELL_TOWERS)) {
          const tn = towerPin(t);
          if (!p.seenPlaces.includes(tn)) p.seenPlaces.push(tn);
        }
      } catch (e) {}
      if (!opts.silent) {
        try {
          if (opts.allyName) window.UI.toast(`🗼 ${opts.allyName} woke the hell towers — every tower stands open for you.`, 5000);
          else if (!had) window.UI.toast(`🗼 Every hell tower wakes — all eight stand open, here and in hell. Teleport anytime from the map.`, 5000);
        } catch (e) {}
      }
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
      // multiplayer: a woken ally's unlock is every ally's unlock.
      try {
        if (opts.broadcast !== false && window.MP && window.MP.broadcastHellTowers) window.MP.broadcastHellTowers();
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  function towersUnlocked(p) {
    try { p = p || player(); return !!(p && p.hellTowersUnlocked); } catch (e) { return false; }
  }
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  function isHellGround(gx, gy) {
    try { return dist(gx, gy, CENTER.x, CENTER.y) < RADIUS; } catch (e) { return false; }
  }
  // Active dimension (World.getDim when available). The disc test above is
  // dimension-blind on purpose — worldgen gates on dim + disc together.
  function curDim() {
    try { if (window.World && window.World.getDim) return window.World.getDim(); } catch (e) {}
    try {
      const p = player();
      if (p && (p.dim === "hell" || p.dim === "surf")) return p.dim;
    } catch (e2) {}
    return "surf";
  }
  function isCastleGround(gx, gy) {
    try { return dist(gx, gy, CENTER.x, CENTER.y) < CASTLE_RADIUS; } catch (e) { return false; }
  }
  // deterministic hash (mirrors World.hash2)
  function hash2(x, y) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  // Hell biome by distance + noise-ish hash. Castle core reads as town so
  // settlement baking paves it clean. v26: eight wild biomes — the alien
  // set (fungal mushroom forests, gloom violet wastes, verdant teal flats)
  // now outweighs the red ones (blood is rare, lava thin), so hell reads as
  // an alien world first and a furnace second.
  function hellBiomeFor(gx, gy) {
    try {
      const d = dist(gx, gy, CENTER.x, CENTER.y);
      if (d < CASTLE_RADIUS + 2) return "town";
      const h = hash2(gx * 3 + 11, gy * 5 + 7);
      const h2 = hash2(gx * 7 + 1, gy * 9 + 3);
      const m = hash2(gx * 13 + 41, gy * 11 + 29);
      const n = hash2(gx * 17 + 5, gy * 13 + 53);
      if (d < 400) {
        if (h < 0.32) return "hell_obsidian";
        if (h < 0.58) return "hell_ash";
        if (m < 0.40) return "hell_fungal";
        if (n < 0.40) return "hell_verdant";
        if (h < 0.92) return "hell_bone";
        return "hell_blood";
      }
      if (d < 1200) {
        if (h2 > 0.78) return "hell_flesh";
        if (m > 0.74) return "hell_fungal";
        if (n > 0.76) return "hell_gloom";
        if (h > 0.68) return "hell_bone";
        if (h > 0.45) return "hell_ash";
        if (h > 0.25) return "hell_verdant";
        return "hell_obsidian";
      }
      if (h2 > 0.88) return "hell_blood";
      if (m > 0.80) return "hell_fungal";
      if (n > 0.82) return "hell_gloom";
      if (h > 0.70) return "hell_bone";
      if (h > 0.45) return "hell_ash";
      if (h > 0.25) return "hell_verdant";
      if (h > 0.10) return "hell_obsidian";
      return "hell_flesh";
    } catch (e) { return "hell_ash"; }
  }
  // Map surface settlement types to demon equivalents inside hell ground.
  function demonTypeFor(orig, cx, cy) {
    try {
      if (!isHellGround(cx, cy)) return orig;
      if (orig === "city" || orig === "trade_city" || orig === "port_city" || orig === "capital") return "demon_city";
      if (orig === "town" || orig === "watergate" || orig === "sakura" || orig === "fortress") return "demon_town";
      return "demon_village";
    } catch (e) { return orig; }
  }
  // Tower structure tile (dimension-local: surface towers pave the surface
  // dim, hell towers the hell dim — never both). Circular stone tower, axis gates,
  // townstone heart. Returns tile id or null when outside any tower.
  function towerTile(gx, gy) {
    try {
      const T = window.CFG && window.CFG.T;
      if (!T) return null;
      const all = curDim() === "hell" ? HELL_TOWERS : SURFACE_TOWERS;
      for (const tw of all) {
        const d = dist(gx, gy, tw.x, tw.y);
        if (d > TOWER_RADIUS) continue;
          const adx = Math.abs(gx - tw.x), ady = Math.abs(gy - tw.y);
          if (d >= TOWER_RADIUS - 1) {
            if (adx <= 1 || ady <= 1) return T.PATH;
            return T.STONEWALL;
          }
          if (d < 2) return T.TOWNSTONE;
          // interior: check alien? keep townstone/path
          if (adx <= 1 || ady <= 1) return T.PATH;
          return T.TOWNSTONE;
      }
    } catch (e) {}
    return null;
  }
  function towerAt(gx, gy) {
    try {
      const surf = curDim() !== "hell";
      const all = surf ? SURFACE_TOWERS : HELL_TOWERS;
      for (let i = 0; i < all.length; i++) {
        const tw = all[i];
        if (dist(gx, gy, tw.x, tw.y) < TOWER_RADIUS) return { tower: tw, index: surf ? i : i + SURFACE_TOWERS.length, surface: surf };
      }
    } catch (e) {}
    return null;
  }
  // Hell castle tile: double stone ring + lava moat + townstone courts.
  // Portal room at the exact center (5x5) stays walkable for the dungeon mouth.
  // v19 Supreme Overlord's Castle: the same rings read far more evil — bone
  // drifts, blood pits and voidglass teeth inside the courts, ember vents on
  // the walls. Still exactly one castle, always at the hell heart.
  function castleTile(gx, gy) {
    try {
      // hell dimension only — the surface disc is open ocean.
      if (curDim() !== "hell") return null;
      const T = window.CFG && window.CFG.T;
      if (!T) return null;
      const d = dist(gx, gy, CENTER.x, CENTER.y);
      if (d > CASTLE_RADIUS) return null;
      const adx = Math.abs(gx - CENTER.x), ady = Math.abs(gy - CENTER.y);
      const gate = (adx <= 2 || ady <= 2);
      // outer lava moat band
      if (d > CASTLE_RADIUS - 3) {
        if (gate) return T.PATH;
        return T.LAVA;
      }
      // outer wall
      if (d >= CASTLE_RADIUS - 5 && d <= CASTLE_RADIUS - 3) {
        if (gate) return T.PATH;
        return T.STONEWALL;
      }
      // inner citadel wall at 0.38*R
      const cit = CASTLE_RADIUS * 0.38;
      if (d >= cit - 1 && d <= cit + 1) {
        if (gate) return T.PATH;
        return T.STONEWALL;
      }
      // portal room core (walkable)
      if (d < 6) return T.TOWNSTONE;
      if (d < 10) {
        const hh = hash2(gx * 3 + 1, gy * 5 + 2);
        if (hh > 0.93) return T.LANTERN;
        if (hh > 0.88) return T.CRYSTAL;
        if (hh > 0.83 && d > 6) return T.BLOOD;
        return T.TOWNSTONE;
      }
      const h = hash2(gx, gy);
      if (h > 0.96) return T.LANTERN;
      if (h > 0.93) return T.CRYSTAL;
      if (h > 0.90) return T.BONE;
      if (h > 0.87) return T.ASH;
      if (h > 0.85) return T.BLOOD;
      return T.TOWNSTONE;
    } catch (e) { return null; }
  }
  // ---- runtime (needs Game/World/UI) ----
  function player() { try { return window.Game && window.Game.G && window.Game.G.player; } catch (e) { return null; } }
  function hasSphere(p) {
    try {
      p = p || player();
      if (!p) return false;
      const inv = Array.isArray(p.inventory) ? p.inventory : (Array.isArray(p.pack) ? p.pack : []);
      return inv.some(s => s && s.id === "hell_sphere" && (s.n | 0) > 0);
    } catch (e) { return false; }
  }
  function fragmentCount(p) {
    try {
      p = p || player();
      if (!p) return 0;
      if (p.hellFragments && typeof p.hellFragments === "object") return Object.keys(p.hellFragments).length;
      // legacy: count items
      let n = 0;
      try { const inv = Array.isArray(p.inventory) ? p.inventory : (Array.isArray(p.pack) ? p.pack : []); for (const s of inv) if (s && s.id === "hell_fragment") n += (s.n | 0); } catch (e) {}
      return n;
    } catch (e) { return 0; }
  }
  function ensureProg(p) { try { if (window.Entities && window.Entities.ensureProgression) window.Entities.ensureProgression(p); } catch (e) {} }
  // Earned-own ledger: portal claims (delves YOU cleared) vs gifts. Story
  // dialogues (first vision, shard dreams) fire on EARNED shards only, so a
  // pooled hero who only ever received gifts still owes the dark a delve of
  // their own before the goddess speaks to them. Migrates from existing
  // saves: every non-gift_ mark counts as earned.
  function ensureEarned(p) {
    try {
      if (!p || typeof p !== "object") return;
      if (!p.hellEarned || typeof p.hellEarned !== "object" || Array.isArray(p.hellEarned)) {
        p.hellEarned = {};
        try { for (const k of Object.keys(p.hellFragments || {})) if (k && k.indexOf("gift_") !== 0) p.hellEarned[k] = 1; } catch (e) {}
      }
      if (!p.hellClaimTs || typeof p.hellClaimTs !== "object" || Array.isArray(p.hellClaimTs)) p.hellClaimTs = {};
    } catch (e) {}
  }
  // Shards this hero earned by clearing delves themselves (not gifts).
  function earnedFragmentCount(p) {
    try {
      p = p || player();
      if (!p) return 0;
      ensureEarned(p);
      return Object.keys(p.hellEarned || {}).length;
    } catch (e) { return 0; }
  }
  function ownsFragmentBid(p, bid) {
    try {
      if (typeof p === "string" && bid == null) { bid = p; p = player(); }
      p = p || player();
      if (!p || !bid) return false;
      bid = String(bid).replace(/_L\d+$/, "").slice(0, 64);
      return !!(p.hellFragments && p.hellFragments[bid]);
    } catch (e) { return false; }
  }
  // Hub-clock time of our own claim for a bid (0 = unknown/legacy: oldest, wins).
  function claimTsFor(p, bid) {
    try {
      if (typeof p === "string" && bid == null) { bid = p; p = player(); }
      p = p || player();
      if (!p || !bid) return 0;
      bid = String(bid).replace(/_L\d+$/, "").slice(0, 64);
      const t = +((p.hellClaimTs || {})[bid] || 0);
      return (isFinite(t) && t > 0) ? t : 0;
    } catch (e) { return 0; }
  }
  // Deterministic first-wins revocation: a fellow traveler's earlier claim
  // for a delve we also claimed stands — our double is removed (item +
  // earned mark), their spent-marker recorded, so exactly one hero holds
  // each dungeon's shard. Gifts are never revoked (we never owned the bid).
  function revokeFragmentClaim(bid, name) {
    try {
      const p = player();
      if (!p) return false;
      bid = String(bid || "").replace(/_L\d+$/, "").slice(0, 64);
      if (!bid) return false;
      ensureProg(p); ensureEarned(p);
      if (!p.hellFragments || !p.hellFragments[bid]) return false;
      delete p.hellFragments[bid];
      try { delete p.hellEarned[bid]; } catch (e) {}
      try { delete p.hellClaimTs[bid]; } catch (e2) {}
      try { if (window.Items && window.Items.removeItem) window.Items.removeItem(p, "hell_fragment", 1); } catch (e) {}
      if (!p.hellFragmentsRemote || typeof p.hellFragmentsRemote !== "object") p.hellFragmentsRemote = {};
      p.hellFragmentsRemote[bid] = { by: String(name || "A fellow traveler").slice(0, 16), at: Date.now() };
      try {
        if (window.UI && window.UI.toast) window.UI.toast(`🩸 This delve's shard was already claimed${name ? " — first taken by " + String(name).slice(0, 16) : ""} — yours fades back into the dark.`, 5000);
        if (window.UI && window.UI.updateHUD) window.UI.updateHUD();
        if (window.Game && window.Game.saveGame) window.Game.saveGame(true);
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  // Deprecated no-op kept so older callers never double-pay: shards are
  // claimed by stepping through the FINAL portal (see claimDelveFragment),
  // not by kills — and no kill is required at all.
  function onDungeonBossKilled(baseId) {
    try {
      const p = player();
      return { dup: true, count: fragmentCount(p) };
    } catch (e) { return null; }
  }
  // Claim a delve's distinct shard: call when the hero steps through
  // the final floor's portal to the surface (no boss kill needed).
  // Hell delves never pay; each delve pays once in its lifetime.
  function claimDelveFragment(baseId) {
    try {
      const p = player();
      if (!p) return null;
      if (!baseId || typeof baseId !== "string") return null;
      // hell delves never pay fragments (they pay hell loot instead).
      // NOTE: dimension decides, not the disc — delves share coordinates
      // across dims, so a surface delve near spawn sits inside the hell
      // disc without being a hell delve.
      try { if (isHellDelveRun(baseId)) return { dup: true, hell: true, count: fragmentCount(p) }; } catch (e) {}
      if (String(baseId).indexOf("hell_god") >= 0) return { dup: true, hell: true, count: fragmentCount(p) };
      ensureProg(p);
      if (!p.hellFragments || typeof p.hellFragments !== "object") p.hellFragments = {};
      const bid = String(baseId).replace(/_L\d+$/, "");
      if (p.hellFragments[bid]) return { dup: true, count: fragmentCount(p) };
      // multiplayer first-claimer wins: a fellow traveler already took
      // this delve's shard — this portal pays nothing.
      try {
        if (p.hellFragmentsRemote && p.hellFragmentsRemote[bid]) {
          const by = p.hellFragmentsRemote[bid].by;
          try { if (window.UI && window.UI.toast) window.UI.toast(`🩸 This delve's shard is already claimed${by ? " — first taken by " + by : ""}.`, 3500); } catch (eT) {}
          return { dup: true, remote: true, count: fragmentCount(p) };
        }
      } catch (eR) {}
      p.hellFragments[bid] = 1;
      // earned ledger: WE cleared this delve (gifts never land here), with
      // the local claim time for deterministic race resolution.
      try { ensureEarned(p); p.hellEarned[bid] = 1; p.hellClaimTs[bid] = Date.now(); } catch (eE) {}
      try {
        if (window.Items && window.Items.addItem) window.Items.addItem(p, "hell_fragment", 1);
      } catch (e) {}
      const c = fragmentCount(p);
      try {
        if (window.UI && window.UI.toast) {
          if (c >= 12) window.UI.toast(`🩸 Hell Fragment ${c}/12 — the set is complete! Join them (🎒 Inventory) into a Hell Sphere.`, 6000);
          else window.UI.toast(`🩸 Hell Fragment claimed (${c}/12 distinct delves).`, 4500);
        }
        if (window.Game && window.Game.saveGame) window.Game.saveGame(true);
      } catch (e) {}
      // multiplayer: first player through takes the delve — tell fellow
      // travelers so their later portal trips pay nothing for this delve.
      try { if (window.MP && window.MP.notifyFragmentClaimed) window.MP.notifyFragmentClaimed(bid); } catch (eN) {}
      return { dup: false, count: c };
    } catch (e) { return null; }
  }
  // Remote claim record: a fellow traveler took a delve's shard first.
  // Their delve is spent for us too — our later portal trip pays nothing
  // (but our own earned shards are never touched). Persists on the save.
  function noteRemoteFragmentClaim(bid, name) {
    try {
      const p = player();
      if (!p) return false;
      bid = String(bid || "").replace(/_L\d+$/, "").slice(0, 64);
      if (!bid) return false;
      ensureProg(p);
      if (p.hellFragments && p.hellFragments[bid]) return false;
      if (!p.hellFragmentsRemote || typeof p.hellFragmentsRemote !== "object") p.hellFragmentsRemote = {};
      if (p.hellFragmentsRemote[bid]) return false;
      p.hellFragmentsRemote[bid] = { by: String(name || "A fellow traveler").slice(0, 16), at: Date.now() };
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  // Take up to n owned shard-claims off this hero to hand to a fellow
  // traveler (multiplayer giving). Returns the bid keys the giver drops —
  // the giver's items move separately via the give itself. Never touches
  // remote (spent) marks: someone else's spent delve is not ours to give.
  function takeFragmentBids(n) {
    try {
      const p = player();
      if (!p) return [];
      ensureProg(p);
      n = Math.max(1, Math.min(99, n | 0 || 1));
      if (!p.hellFragments || typeof p.hellFragments !== "object") return [];
      const keys = Object.keys(p.hellFragments).slice(0, n);
      for (const k of keys) { try { delete p.hellFragments[k]; } catch (e) {} }
      // handed claims leave our earned ledger too (the receiver owns them now).
      try { ensureEarned(p); for (const k of keys) { try { delete p.hellEarned[k]; } catch (e2) {} try { delete p.hellClaimTs[k]; } catch (e3) {} } } catch (eE) {}
      try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
      return keys;
    } catch (e) { return []; }
  }
  // Receive shard-claims handed over by a fellow traveler (multiplayer
  // giving). Each handed bid moves ownership: our spent-marker for it (we
  // recorded the giver's claim as spent when they took it) is cleared and
  // the bid becomes OURS, so the pooled hero can reach 12/12 and forge the
  // sphere. Bids we already own (stale doubles) and any remainder beyond
  // the handed keys land as gift_ marks — still distinct, still forging —
  // so the item stack and the distinct count never drift apart.
  function receiveFragmentBids(bids, n, name) {
    try {
      const p = player();
      if (!p) return 0;
      ensureProg(p);
      n = Math.max(1, Math.min(99, n | 0 || 1));
      if (!p.hellFragments || typeof p.hellFragments !== "object") p.hellFragments = {};
      if (!p.hellFragmentsRemote || typeof p.hellFragmentsRemote !== "object") p.hellFragmentsRemote = {};
      let added = 0;
      const clean = (s) => String(s || "").replace(/_L\d+$/, "").slice(0, 64);
      const giftKey = () => ("gift_" + Date.now().toString(36) + "_" + ((Math.random() * 0xffffff) | 0).toString(36) + "_" + (added + Object.keys(p.hellFragments).length)).slice(0, 64);
      try {
        const list = Array.isArray(bids) ? bids : [];
        for (const raw of list.slice(0, n)) {
          if (added >= n) break;
          const bid = clean(raw);
          if (!bid) continue;
          if (p.hellFragments[bid]) {
            // already ours — keep the item meaningful as a distinct gift mark
            let g = giftKey();
            while (p.hellFragments[g]) g = giftKey() + ((Math.random() * 0xff) | 0).toString(36);
            p.hellFragments[g] = 1;
          } else {
            try { delete p.hellFragmentsRemote[bid]; } catch (e) {}
            p.hellFragments[bid] = 1;
          }
          added++;
        }
        while (added < n) {
          let g = giftKey();
          while (p.hellFragments[g]) g = giftKey() + ((Math.random() * 0xff) | 0).toString(36);
          p.hellFragments[g] = 1;
          added++;
        }
      } catch (e) {}
      const c = fragmentCount(p);
      try {
        if (window.UI && window.UI.toast) {
          const who = name ? " from " + String(name).slice(0, 16) : "";
          if (c >= 12) window.UI.toast(`🩸 Hell Fragments ${c}/12${who} — the set is complete! Join them (🎒 Inventory) into a Hell Sphere.`, 6000);
          else window.UI.toast(`🩸 Hell Fragment claimed (${c}/12 distinct)${who}.`, 4500);
        }
        if (window.UI && window.UI.updateHUD) window.UI.updateHUD();
        if (window.Game && window.Game.saveGame) window.Game.saveGame(true);
      } catch (e) {}
      return added;
    } catch (e) { return 0; }
  }
  // A delve run is a HELL delve when it was entered in the hell dimension.
  // Delves share coordinates across dimensions, so the disc test alone
  // cannot tell sides apart (a surface delve near spawn sits inside the
  // disc) — the live dungeon record / player dimension decides. Falls
  // back to the old disc test only with no live context.
  function isHellDelveRun(baseId) {
    try {
      const G = window.Game && window.Game.G;
      const d = G && G.dungeon;
      const norm = (s) => String(s || "").replace(/_L\d+$/, "");
      if (d && baseId && (d.baseId === baseId || d.id === baseId || norm(d.id) === norm(baseId) || norm(d.baseId) === norm(baseId))) {
        if (d.dim === "hell" || d.dim === "surf") return d.dim === "hell";
      }
    } catch (e) {}
    try {
      const p = player();
      if (p && p.inDungeon) {
        if (p.dim === "hell" || p.dim === "surf") return p.dim === "hell";
        const dd = window.World && window.World.getDim ? window.World.getDim() : null;
        if (dd === "hell" || dd === "surf") return dd === "hell";
      }
    } catch (e) {}
    try { return isHellGroundOfDungeon(baseId); } catch (e) { return false; }
  }
  function isHellGroundOfDungeon(baseId) {
    try {
      // dungeon ids: d_cx_cy... -> entrance chunk -> world tile
      const m = String(baseId).match(/d_(-?\d+)_(-?\d+)/);
      if (!m) return false;
      const cx = parseInt(m[1], 10), cy = parseInt(m[2], 10);
      return isHellGround(cx * 16 + 8, cy * 16 + 8);
    } catch (e) { return false; }
  }
  function isHellDungeonActive() {
    try {
      const G = window.Game && window.Game.G;
      if (!G || !G.player || !G.player.inDungeon) return false;
      const bid = G.player.inDungeon;
      if (String(bid).indexOf("hell_god") >= 0) return true;
      // v18: delves inherit their dimension — a delve entered in hell is a
      // hell delve even though coordinates overlap the surface ocean.
      try {
        const d = G.dungeon;
        if (d && d.dim) return d.dim === "hell";
      } catch (e) {}
      if (curDim() === "hell") return true;
      return isHellGroundOfDungeon(bid);
    } catch (e) { return false; }
  }
  function isHellOverworld() {
    try {
      const p = player();
      if (!p || p.inDungeon) return isHellDungeonActive();
      // v18: hell overworld = hell dimension + hell ground (void is stone).
      if (curDim() !== "hell" && p.dim !== "hell") {
        // fall back to the disc test for legacy callers mid-travel
        return isHellGround(p.x, p.y) && curDim() === "hell";
      }
      if (curDim() !== "hell") return false;
      return isHellGround(p.x, p.y);
    } catch (e) { return false; }
  }
  // v19 hell resident: an NPC-like record that belongs to the hell dimension.
  // Mobs/bosses/tames are never residents. Party members are never residents
  // either — they are travelers, so a hell-born friend keeps their own face
  // on every road instead of morphing into a demon outside hell. The dim
  // stamp decides (chunkKey h_ prefix agrees); the retired-continent check is
  // only a fallback for records that predate both. There is deliberately NO
  // bare-disc fallback: surf and hell share coordinates, so the disc covers
  // the surf spawn too, and unstamped records must default to surf (same as
  // npcDim) instead of misreading as demons.
  function isHellResident(ent) {
    try {
      if (!ent || ent.isTame) return false;
      if (ent.kind && ent.kind !== "npc") return false;
      // Party members (local + remote) are travelers, never residents — they
      // keep their own faces on every road instead of morphing into demons.
      // The party-list check covers objects whose inParty flag was lost
      // (stale copies, sync replicas) but whose id is still in the roster.
      try {
        if (ent.inParty || ent.isRemoteParty) return false;
        if (ent.id && window.Game && window.Game.G && window.Game.G.player) {
          const pp = window.Game.G.player.party || [];
          if (pp.indexOf(ent.id) >= 0) return false;
        }
      } catch (e2) {}
      // chunkKey prefix tells which world's chunk it was born in; when it
      // disagrees with a (possibly mis-stamped) dim, trust the chunkKey.
      // Unstamped records default to surf — surf and hell share coordinates,
      // so the retired-continent disc (16000,0) can never tell sides apart
      // and must not decide (it used to turn surf villagers near 16000,0
      // into demons after a save).
      try {
        const ck = String(ent.chunkKey || "");
        const ckHell = ck.indexOf("h_") === 0, ckSurf = ck.indexOf("c_") === 0;
        const dim = ent.dim;
        if ((dim === "hell" || dim === "surf") && (ckHell || ckSurf)) {
          if ((dim === "hell") !== ckHell) return ckHell;
          return dim === "hell";
        }
        if (dim === "hell") return true;
        if (dim === "surf") return false;
        if (ckHell) return true;
        if (ckSurf) return false;
      } catch (e3) {}
      return false;
    } catch (e) { return false; }
  }
  function canJoinSphere(p) { return fragmentCount(p || player()) >= 12 && !hasSphere(p || player()); }
  function joinSphere() {
    try {
      const p = player();
      if (!p) return { ok: false, error: "no hero" };
      ensureProg(p);
      if (hasSphere(p)) return { ok: false, error: "already have a Hell Sphere" };
      const c = fragmentCount(p);
      if (c < 12) return { ok: false, error: `need 12 distinct fragments (have ${c})` };
      // consume 12 fragments: clear distinct map + remove items
      let need = 12;
      try {
        if (p.hellFragments && typeof p.hellFragments === "object") {
          const keys = Object.keys(p.hellFragments);
          // keep any beyond 12 (should not happen, but be safe)
          const take = keys.slice(0, 12);
          for (const k of take) delete p.hellFragments[k];
        }
      } catch (e) {}
      try {
        if (window.Items && window.Items.removeItem) {
          // remove up to 12 fragment items (distinct tracking already cleared)
          let left = need;
          const inv = Array.isArray(p.inventory) ? [...p.inventory] : (Array.isArray(p.pack) ? [...p.pack] : []);
          for (const s of inv) {
            if (!s || s.id !== "hell_fragment") continue;
            const take = Math.min(left, s.n | 0);
            try { window.Items.removeItem(p, "hell_fragment", take); } catch (e) {}
            left -= take;
            if (left <= 0) break;
          }
        } else {
          const key = Array.isArray(p.inventory) ? "inventory" : "pack";
          if (Array.isArray(p[key])) {
          // fallback: strip manually
          let left = 12;
          for (const s of p[key]) {
            if (!s || s.id !== "hell_fragment" || left <= 0) continue;
            const take = Math.min(left, s.n | 0);
            s.n -= take; left -= take;
          }
          p[key] = p[key].filter(s => s && (s.n | 0) > 0);
          }
        }
      } catch (e) {}
      try { if (window.Items && window.Items.addItem) window.Items.addItem(p, "hell_sphere", 1); } catch (e) {}
      try {
        if (!p.hellUnlocked) p.hellUnlocked = true;
        if (window.UI && window.UI.toast) window.UI.toast(`🔮 The twelve shards fuse into a HELL SPHERE. The far towers (1000 out) will wake at your touch.`, 6000);
        if (window.UI && window.UI.updateHUD) window.UI.updateHUD();
        if (window.UI && window.UI.updateHotbar) window.UI.updateHotbar();
        if (window.Game && window.Game.saveGame) window.Game.saveGame(true);
      } catch (e) {}
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
  }
  // Tower travel: E on a hell_tower POI.
  async function useTower(poi) {
    try {
      const p = player();
      if (!p) return false;
      const G = window.Game && window.Game.G;
      if (!G) return false;
      if (p.inDungeon) { try { window.UI.toast(`🗼 No tower magic down here — climb out first.`, 3000); } catch (e) {} return true; }
      // find which tower: twin towers share coordinates, so the POI
      // matches BOTH lists — the SIDE comes from where the hero stands
      // (their dim), never from list order. (Matching the surface list
      // first used to read every hell tower as surf-side, so E in hell
      // "travelled" to the same tower it started from.)
      let tw = null, idx = -1;
      try {
        const all = SURFACE_TOWERS.concat(HELL_TOWERS);
        let bd = 1e9;
        for (const t of all) {
          const d = Math.hypot((poi.gx - t.x), (poi.gy - t.y));
          if (d < bd) { bd = d; tw = t; }
        }
        if (bd > TOWER_RADIUS + 6) tw = null;
        if (tw) for (let i = 0; i < SURFACE_TOWERS.length; i++) {
          if (Math.abs(SURFACE_TOWERS[i].x - tw.x) < 1 && Math.abs(SURFACE_TOWERS[i].y - tw.y) < 1) { idx = i; break; }
        }
      } catch (e) {}
      if (!tw || idx < 0) { try { window.UI.toast(`🗼 The tower is silent.`, 2500); } catch (e) {} return true; }
      let isSurface = true;
      try {
        const pd = p && p.dim;
        if (pd === "hell" || pd === "surf") isSurface = (pd !== "hell");
        else if (window.World && window.World.getDim) isSurface = (window.World.getDim() !== "hell");
      } catch (e) { }
      // cross-dim phantom POIs (a stale prompt from the other side) must
      // never flip the world: the hero has to be standing at the tower.
      try {
        if (Math.hypot(p.x - tw.x, p.y - tw.y) > TOWER_RADIUS + 6) {
          try { window.UI.toast(`🗼 The tower is silent.`, 2500); } catch (e) {}
          return true;
        }
      } catch (e) {}
      // the side above is the hero's own dim (twin coords match both
      // lists, so list order can never tell them apart).
      const curD = isSurface ? "surf" : "hell";
      // the seal yields only to a sphere or a shared ally wake: no sphere,
      // no shared wake and no prior unlock means the tower does not respond
      // at all — no hint, no sound, no travel, no unlock. Either side, same
      // silence.
      if (!hasSphere(p) && !towersUnlocked(p)) return true;
      // unlock the whole network (charts all 16 pins, shares with allies)
      try { if (isSurface && !p.hellUnlocked) p.hellUnlocked = true; } catch (e) {}
      try { unlockAllTowers(p); } catch (e) {}
      // travel (paired towers correspond exactly, so the far side is home)
      const destDim = isSurface ? "hell" : "surf";
      const dest = (isSurface ? HELL_TOWERS[idx] : SURFACE_TOWERS[idx]) || (isSurface ? HELL_TOWERS[0] : SURFACE_TOWERS[0]);
      // v18 dimension transit: each dimension remembers its own ground.
      // Tower E always lands inside the paired tower (same coordinates
      // as the tower just touched — the pair is the same ground in the
      // two worlds).
      try {
        p.posByDim = p.posByDim || {};
        p.posByDim[curD] = { x: p.x, y: p.y };
      } catch (e) {}
      let dx = dest.x + 0.5, dy = dest.y + 0.5, firstHell = false;
      // tower E always lands on the PAIRED tower — dx/dy above are its
      // heart (same coordinates as the tower just touched). No remembered-
      // spot override: using a tower takes you to the same tower in the
      // other dimension, every time.
      try {
        if (isSurface && !p.hellEntered) {
          p.hellEntered = true;
          p.hellSpawn = { x: dx, y: dy };
          firstHell = true;
        }
      } catch (e) {}
      // flip the world dimension FIRST so every bake below reads the
      // destination ground; drop the old dim's streaming state (stores are
      // dim-namespaced, so nothing writes into the wrong world).
      try { if (window.World && window.World.setDim) window.World.setDim(destDim); } catch (e) {}
      try { p.dim = destDim; } catch (e) {}
      try {
        if (p.posByDim && p.posByDim[destDim]) p.posByDim[destDim] = { x: dx, y: dy };
        else { p.posByDim = p.posByDim || {}; p.posByDim[destDim] = { x: dx, y: dy }; }
      } catch (e) {}
      // clear combat + move
      try {
        p.x = dx; p.y = dy;
        p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
        if (window.Game && window.Game.clearCombat) { try { window.Game.clearCombat(); } catch (e) {} }
        // drop live mobs/npcs (streaming rebuilds for the new ground)
        try { G.mobs = []; G.projectiles = []; G.npcs = []; G.chunks = new Map(); } catch (e) {}
        try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) {}
        try { if (window.Game && window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e) {}
        // party + active tames regroup at the landing (same as hearth
        // teleport / dungeon exit).
        try { if (window.Game && window.Game.summonParty) window.Game.summonParty({ quiet: true }); } catch (e) {}
        // v21: tower landings are vetted ground — stamp last safe hell spot
        // so an unbound hell death wakes back here, not at the corpse.
        try { if (destDim === "hell" && window.Game && window.Game.noteSafeHellGround) window.Game.noteSafeHellGround(true); } catch (e) {}
        try {
          if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround();
          else if (window.Game.G) window.Game.G._groundVer = (window.Game.G._groundVer || 0) + 1;
        } catch (e2) {}
        try { if (isSurface) window.UI.toast(`🔥 The sphere flares — HELL. (${Math.round(Math.hypot(dx - CENTER.x, dy - CENTER.y))} from the dark castle)`, 4500); else window.UI.toast(`✨ Daylight again.`, 3500); } catch (e) {}
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
        try { if (window.UI && window.UI.drawMinimap) window.UI.drawMinimap(); } catch (e) {}
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  // Hearth-portal tower road: E on a demon-hold portal offers the walk to a
  // woken surface tower. Twin towers share coordinates, so the nearest
  // surface tower to the hero's hell ground is the arrival. Sealed towers
  // stay silent: no sphere, no shared wake, no road. (Same recipe as
  // useTower's hell-ward half, but the landing is forced onto the tower —
  // posByDim's remembered surface ground must not override it.)
  async function portalToSurfaceTower() {
    try {
      const p = player();
      if (!p) return false;
      const G = window.Game && window.Game.G;
      if (!G || !window.Game) return false;
      if (p.inDungeon) { try { window.UI.toast(`🗼 No tower magic down here — climb out first.`, 3000); } catch (e) {} return true; }
      if (curDim() !== "hell") { try { window.UI.toast(`🗼 The tower road runs from hell's hearths.`, 3000); } catch (e) {} return true; }
      if (!towersUnlocked(p) && !hasSphere(p)) { try { window.UI.toast(`🗼 The towers sleep — wake one with a Hell Sphere and every tower stands open.`, 4500); } catch (e) {} return true; }
      try { unlockAllTowers(p); } catch (e) {}
      let tw = null, bd = 1e18;
      try {
        for (const t of SURFACE_TOWERS) {
          const d = dist(p.x, p.y, t.x, t.y);
          if (d < bd) { bd = d; tw = t; }
        }
      } catch (e) {}
      if (!tw) return false;
      try {
        p.posByDim = p.posByDim || {};
        p.posByDim.hell = { x: p.x, y: p.y };
      } catch (e) {}
      const dx = tw.x + 0.5, dy = tw.y + 0.5;
      try { if (window.World && window.World.setDim) window.World.setDim("surf"); } catch (e) {}
      try { p.dim = "surf"; } catch (e) {}
      try { p.posByDim.surf = { x: dx, y: dy }; } catch (e) {}
      try {
        p.x = dx; p.y = dy;
        p.targetId = null; p.targetRef = null; p.hostileUntil = 0;
        if (window.Game && window.Game.clearCombat) { try { window.Game.clearCombat(); } catch (e) {} }
        try { G.mobs = []; G.projectiles = []; G.npcs = []; G.chunks = new Map(); } catch (e) {}
        try { if (window.Game && window.Game.ensureChunks) await window.Game.ensureChunks(); } catch (e) {}
        try { if (window.Game && window.Game.refreshNpcCache) await window.Game.refreshNpcCache(true); } catch (e) {}
        try { if (window.Game && window.Game.summonParty) window.Game.summonParty({ quiet: true }); } catch (e) {}
        try {
          if (typeof window.Game.invalidateGround === "function") window.Game.invalidateGround();
          else if (window.Game.G) window.Game.G._groundVer = (window.Game.G._groundVer || 0) + 1;
        } catch (e2) {}
        try { window.UI.toast(`🗼 The tower road delivers you — Hell Tower ${tw.x | 0},${tw.y | 0}, daylight side. E on its heart returns.`, 5000); } catch (e) {}
        try { if (window.Game && window.Game.saveGame) window.Game.saveGame(true); } catch (e) {}
        try { if (window.UI && window.UI.drawMinimap) window.UI.drawMinimap(); } catch (e) {}
      } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  // Succubus sleep ambush: called when the hero sleeps in hell at night.
  // Drains HP/Stamina/MP then starts a real fight.
  async function maybeSuccubusAmbush() {
    try {
      const p = player();
      if (!p || p.hp <= 0) return false;
      if (!isHellOverworld()) return false;
      // v22 safe rest: tower + hearth ground is warded — no ambush there.
      try { if (window.Game && window.Game.hellSafeGround && window.Game.hellSafeGround(p.x, p.y)) return false; } catch (e) {}
      try {
        if (!(window.Game && window.Game.hellSafeGround)) {
          for (const tw of HELL_TOWERS) if (dist(p.x, p.y, tw.x, tw.y) < TOWER_RADIUS + 26) return false;
        }
      } catch (e) {}
      let night = false;
      try { night = window.Game && window.Game.isNight && window.Game.isNight(); } catch (e) {
        try { const t = window.Game.G.dayTime; const h = (t / 60) % 24; night = (h < 6 || h >= 20); } catch (e2) {}
      }
      if (!night) return false;
      if (Math.random() > 0.45) return false;
      // drain
      const drainHp = Math.max(8, Math.round(p.maxHp * 0.18));
      const drainMp = Math.max(6, Math.round(p.maxMp * 0.25));
      const drainSt = Math.max(6, Math.round((p.maxStamina || p.maxMp || 60) * 0.25));
      try {
        p.hp = Math.max(1, (p.hp | 0) - drainHp);
        p.mp = Math.max(0, (p.mp | 0) - drainMp);
        if (p.stamina != null) p.stamina = Math.max(0, p.stamina - drainSt);
      } catch (e) {}
      try { if (window.UI && window.UI.toast) window.UI.toast(`💋 A succubus drinks deep in the dark… (−${drainHp} HP, −${drainMp} MP, −${drainSt} stamina) — and then shows her teeth!`, 5500); } catch (e) {}
      try { if (window.Game && window.Game.spawnHellSuccubus) window.Game.spawnHellSuccubus(); } catch (e) {
        // fallback: spawn via generic mob spawn if hook missing
        try {
          const m = window.Entities.makeMob("succubus", Math.max(60, (p.lv | 0) || 60), 90, 12);
          m.x = p.x + 1.5; m.y = p.y; m.homeX = m.x; m.homeY = m.y;
          window.Game.G.mobs.push(m);
          if (window.Game.setHostile) window.Game.setHostile(m, p, 20);
        } catch (e2) {}
      }
      try { if (window.UI && window.UI.updateHUD) window.UI.updateHUD(); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }
  return {
    CENTER, RADIUS, CASTLE_RADIUS, SURFACE_TOWERS, HELL_TOWERS, TOWER_RADIUS,
    towerPin, towersUnlocked, unlockAllTowers,
    isHellGround, isCastleGround, hellBiomeFor, demonTypeFor, towerTile, towerAt, castleTile,
    hasSphere, fragmentCount, canJoinSphere, joinSphere, onDungeonBossKilled, claimDelveFragment, noteRemoteFragmentClaim,
    earnedFragmentCount, ownsFragmentBid, claimTsFor, revokeFragmentClaim,
    takeFragmentBids, receiveFragmentBids,
    isHellGroundOfDungeon, isHellDelveRun, isHellDungeonActive, isHellOverworld, isHellResident,
    useTower, portalToSurfaceTower, maybeSuccubusAmbush,
  };
})();
