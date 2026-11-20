/* Codex — reference for bosses, mobs, spells, Deep Arts, weapons, armor,
 * playable races and NPC classes. window.Codex.
 *
 * Fully data-driven: every list is rebuilt from the LIVE data (window.CFG,
 * window.Items.ITEMS, window.Sprites, window.Entities, window.Appearance)
 * each time the Codex window is opened, so any balance/content edit is
 * reflected automatically with no codex-side changes. No stats are
 * hardcoded here.
 *
 * Opens as an in-tab panel (Codex.openPanel): a movable pseudo-window
 * hosting renderInto, so every picture renders live from code
 * (Sprites.actor + Buildings.drawExteriorFor) with no opener round-trip.
 * Any game UI can link straight to an entry — Codex.openPanel(cat, id)
 * or a #codex=&lt;cat&gt;/&lt;id&gt; deep link (🔗 button copies one) —
 * and the panel writes the hash back as you browse.
 * (openWindow/standaloneHtml remain as a legacy separate-window export.)
 * Detail figures zoom by dragging (double-click resets); building rows
 * carry live exterior thumbnails. Building entries describe each
 * building's gameplay function from live shop, stock, furniture,
 * staffing and placement data.
 * (src/shots/*.jpg are the title-screen slideshow, unrelated to Codex.)
 * Reopen the popup to refresh after balance edits. */
window.Codex = (() => {
  let cssDone = false;
  // Shared Codex styles: element-agnostic (.cdxspr covers both inline
  // <canvas> portraits and standalone <img> data-URL portraits).
  // All sprite art is canvas pixel-art (32x40, nearest-neighbor), so it
  // stays crisp at any size: every image dimension derives from
  // --cdx-zoom (set by the 🖼️ size slider, persisted in localStorage).
  function cssText() {
    return [
      ".cdxtabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0}",
      ".cdxtabs button:not([disabled]){padding:9px 18px;font-size:15.5px;line-height:1.3;background:#1a2634;color:#fff;border:1px solid #ffd93d;border-radius:8px;cursor:pointer}",
      ".cdxscope{--cdx-zoom:2}",
      ".cdxtools{display:flex;gap:8px;align-items:center;justify-content:center;margin:0 auto 10px auto;flex-wrap:wrap;max-width:1100px;width:100%}",
      "input.cdxsearch:not([disabled]){flex:1;min-width:220px;max-width:560px;display:block;margin:0;background:#0d141b;color:#fff;border:1px solid #3a4a5a;border-radius:8px;padding:11px 12px;font-size:15.5px;line-height:1.4;box-sizing:border-box}",
      ".cdxfig{float:right;margin:0 0 6px 8px;position:relative;cursor:grab;touch-action:none;background:#101820;border:1px solid #2a3644;border-radius:8px;padding:4px;user-select:none;-webkit-user-select:none}",
      ".cdxfig.drag{cursor:grabbing;border-color:#ffd93d;box-shadow:0 0 0 2px #ffd93d55}",
      ".cdxfig .cdxspr{width:calc(48px * var(--cdx-zoom,2));height:calc(60px * var(--cdx-zoom,2));image-rendering:pixelated;display:block;border-radius:6px;background:transparent;float:none;margin:0}",
      ".cdxfig .cdxbig{float:none;margin:0;font-size:calc(22px * var(--cdx-zoom,2));display:block;text-align:center}",
      ".cdxfighint{position:absolute;right:2px;bottom:2px;font-size:11px;opacity:.75;background:rgba(0,0,0,.6);border-radius:6px;padding:1px 6px;pointer-events:none;white-space:nowrap;color:#fff}",
      ".cdxfig.cdxwide{float:none;display:block;margin:0 0 6px 0}",
      ".cdxthumb{height:44px;width:auto;max-width:78px;image-rendering:auto;background:#101820;border-radius:6px;flex:none;display:block}",
      ".cdxwrap{display:grid;grid-template-columns:minmax(330px,470px) 1fr;gap:14px;align-items:stretch;width:100%;height:calc(100vh - 190px);min-height:440px;overflow:hidden}",
      ".cdxlist{height:100%;max-height:none;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px;min-height:0}",
      "button.cdxrow:not([disabled]){display:flex;gap:10px;align-items:center;background:#0d141b;border:1px solid #2a3644;border-radius:10px;padding:9px 12px;cursor:pointer;font-size:15.5px;line-height:1.35;text-align:left;color:#fff;width:100%;box-sizing:border-box}",
      ".cdxrow:hover{border-color:#4a5a6a}",
      ".cdxrow.on{border-color:#ffd93d}",
      ".cdxrow .cdxspr{width:52px;height:65px;image-rendering:pixelated;flex:none;background:#101820;border-radius:6px}",
      ".cdxico{font-size:28px;flex:none;width:40px;text-align:center}",
      ".cdxnm{font-weight:700;font-size:15.5px}",
      ".cdxsub{opacity:.75;font-size:13.5px;line-height:1.4}",
      ".cdxdet{--cdx-zoom:2;background:#0d141b;color:#fff;border:1px solid #2a3644;border-radius:10px;padding:18px 20px;font-size:16px;line-height:1.6;height:100%;max-height:none;overflow-y:auto;min-height:0;box-sizing:border-box}",
      ".cdxdet h4{margin:0 0 6px 0;font-size:19px}",
      ".cdxbig{font-size:calc(22px * var(--cdx-zoom,2));float:right;margin:0 0 6px 8px}",
      ".cdxkv{display:grid;grid-template-columns:auto 1fr;gap:5px 14px;margin:8px 0;font-size:14.5px;line-height:1.5}",
      ".cdxkv b{color:#9fc7ff;font-weight:600}",
      ".cdxdesc{opacity:.92;margin:8px 0;font-size:16px;line-height:1.6}",
      ".cdxnote{opacity:.7;font-size:13.5px;line-height:1.5;margin-top:8px}",
      ".cdxlvrow{display:flex;align-items:center;gap:10px;margin:10px 0;font-size:15.5px;font-weight:700}",
      ".cdxlvrow input[type=range]{flex:1;accent-color:#ffd93d}",
      ".cdxlv{font-weight:700;color:#ffd93d;min-width:60px;text-align:right}",
      ".cdxtbl{width:100%;border-collapse:collapse;font-size:14.5px;line-height:1.45;margin:8px 0}",
      ".cdxtbl th,.cdxtbl td{border:1px solid #2a3644;padding:6px 10px;text-align:right;white-space:nowrap}",
      ".cdxtbl th:first-child,.cdxtbl td:first-child{text-align:left}",
      ".cdxtbl th{background:#16202c;color:#9fc7ff;font-weight:600}",
      ".cdxgearprev{display:flex;gap:10px;align-items:center;margin:6px 0;background:#101820;border:1px solid #2a3644;border-radius:8px;padding:6px}",
      ".cdxgearprev .cdxfig{float:none;margin:0}",
      ".cdxchip{width:calc(24px * var(--cdx-zoom,2));height:calc(18px * var(--cdx-zoom,2));border-radius:6px;flex:none;border:1px solid #2a3644;box-sizing:border-box}",
      ".cdxbigchip{width:calc(42px * var(--cdx-zoom,2));height:calc(29px * var(--cdx-zoom,2));border-radius:8px;flex:none;border:1px solid #2a3644;box-sizing:border-box;float:right;margin:0 0 6px 8px}",
      ".cdxext{image-rendering:auto;height:auto;width:calc(var(--cdx-ext-w,120px) * var(--cdx-zoom,2) / 2);max-width:100%}",
      "@media(max-width:800px){.cdxwrap{grid-template-columns:1fr;height:auto;max-height:none;min-height:0}.cdxlist{height:auto;max-height:34vh}.cdxdet{height:auto;max-height:none;font-size:15px;padding:14px}}",
      ".cdxpanel{position:fixed;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1140px,96vw);height:min(84vh,920px);max-height:calc(100vh - 20px);display:flex;flex-direction:column;background:#0a1016;border:1px solid #ffd93d;border-radius:12px;box-shadow:0 12px 60px rgba(0,0,0,.75);box-sizing:border-box}",
      ".cdxpanel[hidden]{display:none}",
      ".cdxphead{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;background:linear-gradient(180deg,#1a2634,#0d141b);border-bottom:1px solid #2a3644;border-radius:11px 11px 0 0;color:#fff}",
      ".cdxphead:active{cursor:grabbing}",
      ".cdxptitle{font-weight:700;font-size:16px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "button.cdxpbtn:not([disabled]){background:#1a2634;color:#fff;border:1px solid #3a4a5a;border-radius:8px;cursor:pointer;font-size:15px;padding:4px 10px;line-height:1.4}",
      ".cdxpbtn:hover{border-color:#ffd93d}",
      ".cdxpbody{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:10px 14px 14px 14px;box-sizing:border-box}",
      ".cdxpanel .cdxwrap{flex:none;height:calc(min(84vh,920px) - 240px);min-height:320px}",
      "@media(max-width:800px){.cdxpanel{height:calc(100vh - 20px)}.cdxpanel .cdxwrap{height:auto;flex:none}.cdxpbody{overflow-y:auto}.cdxpanel .cdxlist{max-height:38vh}}",
    ].join("\n");
  }
  function ensureCss() {
    if (cssDone) return; cssDone = true;
    const st = document.createElement("style");
    st.textContent = cssText();
    document.head.appendChild(st);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // Portraits render live from procedural canvas code in both views
  // (<canvas> + hydrate). The popup draws through window.opener, so it
  // bakes ZERO raster images: no data-URL PNGs, no image files on disk.
  // forPopup is a text-mode flag only (which level-slider hook to emit);
  // it never changes how pictures render.
  let forPopup = false;
  // ---------- drag-to-zoom detail figures ----------
  // No global zoom button: the selected-entry figure (portrait, gear
  // preview, icon) is dragged to resize it, 0.5x-8x in 0.25 steps.
  // The factor lives on the .cdxdet element as --cdx-zoom, so every
  // detail image (including building exteriors) scales together.
  // Rows stay fixed-size. Double-click a figure to reset to 2x.
  let detZoom = 2;
  try {
    const saved = parseFloat(localStorage.getItem("emberhold_codex_zoom"));
    if (saved >= 0.5 && saved <= 8) detZoom = Math.round(saved * 4) / 4;
  } catch (e) {}
  function setDetZoom(v, detEl) {
    detZoom = Math.max(0.5, Math.min(8, Math.round(parseFloat(v) * 4) / 4 || 2));
    try { localStorage.setItem("emberhold_codex_zoom", String(detZoom)); } catch (e) {}
    try { if (detEl) detEl.style.setProperty("--cdx-zoom", detZoom); } catch (e) {}
    return detZoom;
  }
  function fig(inner) {
    return '<div class="cdxfig" title="Drag to zoom (double-click resets)">' + inner + '<span class="cdxfighint">⤢ drag to zoom</span></div>';
  }
  function wireFigZoom(root) {
    if (!root || !root.querySelectorAll) return;
    const figs = root.querySelectorAll(".cdxfig:not([data-zwired])");
    for (const f of figs) {
      try {
        f.setAttribute("data-zwired", "1");
        let sx = 0, sy = 0, start = 2, dragging = false;
        const det = (f.closest && f.closest(".cdxdet")) || null;
        const cur = () => {
          try {
            const v = parseFloat(getComputedStyle(det || f).getPropertyValue("--cdx-zoom"));
            if (v >= 0.5 && v <= 8) return v;
          } catch (e) {}
          return detZoom;
        };
        f.addEventListener("pointerdown", (ev) => {
          // Wide exterior strips stay touch-scrollable: mouse drag only.
          try { if (f.classList && f.classList.contains("cdxwide") && ev.pointerType && ev.pointerType !== "mouse") return; } catch (e) {}
          dragging = true; sx = ev.clientX; sy = ev.clientY; start = cur();
          try { f.setPointerCapture(ev.pointerId); } catch (e) {}
          f.classList.add("drag"); ev.preventDefault();
        });
        f.addEventListener("pointermove", (ev) => {
          if (!dragging) return;
          setDetZoom(start + ((ev.clientX - sx) - (ev.clientY - sy)) / 120, det);
        });
        const up = () => { dragging = false; f.classList.remove("drag"); };
        f.addEventListener("pointerup", up);
        f.addEventListener("pointercancel", up);
        f.addEventListener("dblclick", () => setDetZoom(2, det));
      } catch (e) {}
    }
  }
  function spriteCanvas(kind, tint) {
    return '<canvas class="cdxspr" data-kind="' + esc(kind) + '" data-tint="' + esc(tint || "#ffffff") + '" width="32" height="40"></canvas>';
  }
  // ---------- race example NPCs (one stable random per race per session) ----
  // Races render as people, not bare rows: every race entry (list row +
  // detail) shows a random NPC example of that race, rolled once per session
  // so rows and detail agree while browsing. The packed appearance rides in
  // data attributes; hydrateSprites (in-tab AND the standalone-popup copy)
  // draws it through Sprites.actor(role, tint, seed, gear, app, gen).
  const raceExampleCache = {};
  function raceExample(race) {
    try {
      if (raceExampleCache[race]) return raceExampleCache[race];
      const A = window.Appearance || {};
      const outs = ((A.OUTFITS || []).filter(o => !/(angel|dawn|seraph|scroll|choir|heavendweller)/i.test(String(o || ""))));
      const role = (outs.length ? outs[(Math.random() * outs.length) | 0] : "villager");
      const app = A.randomAppearance ? A.randomAppearance(role, race) : null;
      const ex = { role: role, app: app };
      raceExampleCache[race] = ex;
      return ex;
    } catch (e) { return { role: "villager", app: null }; }
  }
  function npcExampleCanvas(race) {
    try {
      const ex = raceExample(race);
      const packed = (window.Appearance && window.Appearance.pack && ex.app) ? window.Appearance.pack(ex.app) : null;
      return '<canvas class="cdxspr" data-npc="1" data-role="' + esc(ex.role || "villager") + '"' +
        (packed ? ' data-app="' + esc(JSON.stringify(packed)) + '"' : "") + ' width="32" height="40"></canvas>';
    } catch (e) { return ""; }
  }
  function gearCanvas(itemId) {
    try {
      const it = (window.Items && window.Items.ITEMS && window.Items.ITEMS[itemId]) || null;
      if (!it) return "";
      if (it.slot === "weapon") return '<canvas class="cdxspr" data-gear-w="' + esc(itemId) + '" width="32" height="40"></canvas>';
      if (it.slot === "armor") return '<canvas class="cdxspr" data-gear-a="' + esc(itemId) + '" width="32" height="40"></canvas>';
      if (it.slot === "shield" || it.shield) return '<canvas class="cdxspr" data-gear-s="' + esc(itemId) + '" width="32" height="40"></canvas>';
      return '<canvas class="cdxspr" data-kind="player" data-tint="#4da3ff" width="32" height="40"></canvas>';
    } catch (e) { }
    return "";
  }
  function hydrateSprites(root) {
    if (!root) return;
    const all = root.querySelectorAll ? root.querySelectorAll("canvas.cdxspr") : [];
    for (const c of all) {
      try {
        if (c.getAttribute("data-npc")) {
          const nrole = c.getAttribute("data-role") || "villager";
          let napp = null, nseed = nrole;
          try {
            const nraw = c.getAttribute("data-app");
            if (nraw && window.Appearance && window.Appearance.unpack) napp = window.Appearance.unpack(JSON.parse(nraw));
            if (napp && window.Appearance && window.Appearance.key) nseed = nrole + "|" + window.Appearance.key(napp);
          } catch (eA) {}
          const nspr = window.Sprites.actor(nrole, "#ffffff", nseed, null, napp, "");
          const ng = c.getContext("2d"); ng.imageSmoothingEnabled = false;
          ng.clearRect(0, 0, c.width, c.height);
          try { ng.imageSmoothingEnabled = true; } catch (e) {}
          ng.drawImage(nspr, 0, 0, c.width, c.height);
          try { ng.imageSmoothingEnabled = false; } catch (e) {}
          continue;
        }
        const gw = c.getAttribute("data-gear-w"), ga = c.getAttribute("data-gear-a"), gs = c.getAttribute("data-gear-s");
        if (gw || ga || gs) {
          const gear = { w: gw || null, a: ga || null, s: gs || null };
          const spr = window.Sprites.actor("player", "#4da3ff", "p", gear, null);
          const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
          g.clearRect(0, 0, c.width, c.height);
          // actor art may be supersampled (e.g. 2x with vector ink): scale
          // into the fixed box with smoothing so the downscale stays exact.
          try { g.imageSmoothingEnabled = true; } catch (e) {}
          g.drawImage(spr, 0, 0, c.width, c.height);
          try { g.imageSmoothingEnabled = false; } catch (e) {}
          continue;
        }
        const kind = c.getAttribute("data-kind"), tint = c.getAttribute("data-tint") || "#ffffff";
        const spr = window.Sprites.actor(kind, tint, kind);
        const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, c.width, c.height);
        try { g.imageSmoothingEnabled = true; } catch (e) {}
        g.drawImage(spr, 0, 0, c.width, c.height);
        try { g.imageSmoothingEnabled = false; } catch (e) {}
      } catch (err) { }
    }
  }
  // Exterior previews are procedural too (Buildings.drawExteriorFor): the
  // detail HTML only carries a placeholder with data attributes, and
  // hydrateExt fills it with live <canvas> drawings. Same placeholder
  // works in-page and in the popup (the popup's copy draws via opener).
  function cdxMockFor(ck, cls, t) {
    try {
      const B = window.Buildings;
      // Capital-only castles keep their home-culture style (same map as
      // designBuilding in buildings.js) so codex previews match the world.
      const KEEP_HOME = { village_keep: "village", town_keep: "town", city_citadel: "city", tide_keep: "watergate", sakura_castle: "sakura", sun_keep: "desert_souk", gilt_keep: "trade_city", harbor_keep: "port_city" };
      const st = variantStyle(KEEP_HOME[ck] || t);
      const w = cls.w || 6, hh = cls.h || 5;
      let notches = [];
      try { notches = (B && B.notchRectsFor) ? B.notchRectsFor(ck, w, hh) : []; } catch (e2) { notches = []; }
      return { classKey: ck, title: cls.name || ck, x0: 0, y0: 0, x1: w - 1, y1: hh - 1, w: w, h: hh, style: st, wall: (st && st.wall === "STONEWALL") ? "STONEWALL" : "HOUSEWALL", floor: (st && st.floor) || "TOWNSTONE", doors: [{ x: 1 + Math.floor((w - 2) / 2), y: hh - 1 }], windows: [{ x: 1, y: 0 }, { x: w - 2, y: 0 }], furniture: [], id: "cdx_" + ck + "_" + t, notches: notches };
    } catch (e) { return null; }
  }
  function extPlaceholder(ck, cls, types) {
    const all = types.slice(0, 12);
    return "<div class='cdxlvrow' style='margin-bottom:4px'>Exterior — every variant</div>"
      + "<div class='cdxfig cdxwide' title='Drag to zoom (double-click resets)' style='display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px' data-cdxext='1' data-ck='" + esc(ck) + "' data-w='" + (cls.w || 6) + "' data-h='" + (cls.h || 5) + "' data-nm='" + esc(cls.name || ck) + "' data-types='" + esc(all.join(",")) + "'></div>";
  }
  function hydrateExt(root) {
    if (!root || !root.querySelectorAll) return;
    const boxes = root.querySelectorAll("[data-cdxext]");
    for (const box of boxes) {
      if (box.getAttribute("data-done") === "1") continue;
      box.setAttribute("data-done", "1");
      try {
        const ck = box.getAttribute("data-ck");
        const w = +box.getAttribute("data-w") || 6, hh = +box.getAttribute("data-h") || 5;
        const nm = box.getAttribute("data-nm") || ck;
        const all = (box.getAttribute("data-types") || "").split(",").filter(Boolean);
        box.innerHTML = "";
        for (const t of all) {
          try {
            const mock = cdxMockFor(ck, { w: w, h: hh, name: nm }, t);
            if (!mock) continue;
            const st = variantStyle(t);
            const crop = extCropCanvas(window.Buildings, mock, 32, 64);
            if (!crop) continue;
            const cw = crop.width, chh = crop.height;
            const cv = document.createElement("canvas");
            cv.width = cw; cv.height = chh;
            cv.title = t + (st && st.name ? " — " + st.name + " roof" : "");
            cv.className = "cdxext";
            cv.style.setProperty("--cdx-ext-w", cw + "px");
            const ctx = cv.getContext("2d");
            ctx.fillStyle = "#0d141b"; ctx.fillRect(0, 0, cw, chh);
            ctx.drawImage(crop, 0, 0);
            const wrap = document.createElement("div");
            wrap.style.cssText = "text-align:center;font-size:13px;opacity:0.9;max-width:240px";
            wrap.appendChild(cv);
            const lb = document.createElement("div");
            lb.textContent = prettyType(t);
            wrap.appendChild(lb);
            const sub = document.createElement("div");
            sub.style.opacity = "0.7";
            sub.textContent = (st && st.name ? st.name + " roof" : t);
            wrap.appendChild(sub);
            box.appendChild(wrap);
          } catch (e2) {}
        }
      } catch (e) {}
    }
  }
  // Native-scale exterior render + transparent-margin trim. The exterior
  // is vector work tuned for game tiles (u = ts/32), so a ts=10
  // miniature turns hairlines, speckle, shingles and windows to mush:
  // draw big on a scratch canvas, trim to content, keep the crop.
  function extCropCanvas(B, mock, ts, MG) {
    try {
      if (!B || !B.drawExteriorFor || !mock) return null;
      const big = document.createElement("canvas");
      big.width = mock.w * ts + MG * 2; big.height = mock.h * ts + MG * 2;
      const bctx = big.getContext("2d");
      B.drawExteriorFor(bctx, ts, MG, MG, mock);
      let bx0 = big.width, by0 = big.height, bx1 = -1, by1 = -1;
      try {
        const bd = bctx.getImageData(0, 0, big.width, big.height).data;
        for (let yy = 0; yy < big.height; yy += 2) {
          for (let xx = 0; xx < big.width; xx += 2) {
            if (bd[(yy * big.width + xx) * 4 + 3] > 8) {
              if (xx < bx0) bx0 = xx; if (xx > bx1) bx1 = xx;
              if (yy < by0) by0 = yy; if (yy > by1) by1 = yy;
            }
          }
        }
      } catch (e2) { bx0 = 0; by0 = 0; bx1 = big.width - 1; by1 = big.height - 1; }
      if (bx1 < bx0) return null;
      const PAD = Math.max(2, Math.round(ts / 5));
      bx0 = Math.max(0, bx0 - PAD); by0 = Math.max(0, by0 - PAD);
      bx1 = Math.min(big.width - 1, bx1 + PAD); by1 = Math.min(big.height - 1, by1 + PAD);
      const cw = bx1 - bx0 + 1, chh = by1 - by0 + 1;
      const cv = document.createElement("canvas");
      cv.width = cw; cv.height = chh;
      cv.getContext("2d").drawImage(big, bx0, by0, cw, chh, 0, 0, cw, chh);
      return cv;
    } catch (e) { return null; }
  }
  // Building-list thumbnails: one trimmed exterior (first culture) per
  // row, drawn small (ts=12). Same live code as the detail previews.
  function thumbCanvas(ck, cls, t) {
    return '<canvas class="cdxthumb" data-ck="' + esc(ck) + '" data-w="' + (cls.w || 6) + '" data-h="' + (cls.h || 5)
      + '" data-nm="' + esc(cls.name || ck) + '" data-t="' + esc(t) + '" width="64" height="48"></canvas>';
  }
  function hydrateThumbs(root) {
    if (!root || !root.querySelectorAll) return;
    const all = root.querySelectorAll("canvas.cdxthumb:not([data-done])");
    for (const c of all) {
      c.setAttribute("data-done", "1");
      try {
        const ck = c.getAttribute("data-ck");
        const cls = { w: +c.getAttribute("data-w") || 6, h: +c.getAttribute("data-h") || 5, name: c.getAttribute("data-nm") || ck };
        let t = c.getAttribute("data-t");
        if (!t) { try { t = (buildingSettlements(ck) || [])[0] || ""; } catch (e2) { t = ""; } }
        if (!t) continue;
        const mock = cdxMockFor(ck, cls, t);
        if (!mock) continue;
        const crop = extCropCanvas(window.Buildings, mock, 12, 24);
        if (!crop) continue;
        c.width = crop.width; c.height = crop.height;
        const g = c.getContext("2d");
        g.fillStyle = "#101820"; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(crop, 0, 0);
      } catch (e) {}
    }
  }
 function cdxIcon(kind, id, size) { try { if (window.Icons) return window.Icons.img(kind, id, size || 40, "ico"); } catch (e) { } return ""; }
  function abName(id) {
   try { const a = window.CFG.ABILITIES[id]; if (a) return a.name; } catch (e) { }
   return id;
 }
  // ---------- live ability costs (base MP is the full cost, Deep Arts = 1.5x stamina) ----------
  // Data-driven: base MP comes from CFG.ABILITIES, multipliers + discounts
  // from Entities.effectiveMpCost / effectiveStamCost. Uses the live hero when
  // one exists (so Efficiency ranks + wand discounts show), else a neutral
  // caster (base / base x1.5, rounded, min 1 — same math as entities.js).
  function codexCaster() {
    try { const g = window.Game && window.Game.G; if (g && g.player) return g.player; } catch (e) {}
    return null;
  }
  function costBase(id) {
    try { const ab = (window.CFG.ABILITIES || {})[id]; return (ab && ab.mp | 0) || 0; } catch (e) { return 0; }
  }
  function liveMp(id) {
    try {
      const E = window.Entities || {};
      if (E.effectiveMpCost) {
        const v = E.effectiveMpCost(codexCaster() || { kind: "player" }, id);
        if (v != null && isFinite(v)) return v;
      }
    } catch (e) {}
    const b = costBase(id);
    if (!b) return 0;
    return Math.max(1, Math.round(b));
  }
  function liveStam(id) {
    try {
      const E = window.Entities || {};
      if (E.effectiveStamCost) {
        const v = E.effectiveStamCost(codexCaster() || { kind: "player" }, id);
        if (v != null && isFinite(v)) return v;
      }
    } catch (e) {}
    const b = costBase(id);
    if (!b) return 0;
    return Math.max(1, Math.round(b * 1.5));
  }
  function spellCostStr(id) {
    const b = costBase(id);
    if (!b) return "free (no MP)";
    const v = liveMp(id);
    return v + " MP (base " + b + (v !== b ? ", your Efficiency/wand discounts apply" : "") + ")";
  }
  function techCostStr(id) {
    const b = costBase(id);
    if (!b) return "free (no stamina)";
    const v = liveStam(id);
    return v + " \u26a1 stamina (base " + b + " x1.5" + (v !== b * 1.5 ? ", your Efficiency/wand discounts apply" : "") + ")";
  }
  function techFallbackStr(id) {
    const v = liveMp(id);
    return v + " MP \u2014 paid only by allies without a stamina pool";
  }
 function statusText(st) {
    if (!st) return "";
    const bits = [st.type];
    if (st.chance != null && st.chance < 1) bits.push(Math.round(st.chance * 100) + "%");
    if (st.duration != null) bits.push(st.duration + "s");
    if (st.durationMs != null) bits.push(Math.round(st.durationMs / 100) / 10 + "s");
    if (st.dps != null) bits.push(st.dps + "/s");
    if (st.pct != null) bits.push(Math.round(st.pct * 100) + "%/s");
    if (st.defDown != null) bits.push("−" + st.defDown + " DEF");
    return bits.join(" ");
  }
  // ---------- list builders (live data, no hardcoding) ----------
  function bossList() {
    const T = window.CFG.MOB_TEMPLATES || {};
    const anc = window.CFG.ANCIENT_KINDS || [];
    return Object.keys(T).filter(k => T[k] && T[k].boss).map(k => ({ id: k, t: T[k], ancient: anc.includes(k) }))
      .sort((a, b) => (a.t.hp || 0) - (b.t.hp || 0));
  }
  function mobList() {
    const T = window.CFG.MOB_TEMPLATES || {};
    return Object.keys(T).filter(k => T[k] && !T[k].boss).map(k => ({ id: k, t: T[k] }))
      .sort((a, b) => String(a.t.name || a.id).localeCompare(String(b.t.name || b.id)));
  }
  function spellList() {
    const A = window.CFG.ABILITIES || {};
    return Object.keys(A).filter(k => A[k] && A[k].kind !== "technique" && A[k].kind !== "melee")
      .map(k => ({ id: k, a: A[k] })).sort((a, b) => String(a.a.name).localeCompare(String(b.a.name)));
  }
  function techList() {
    const A = window.CFG.ABILITIES || {}, T = window.CFG.TECHNIQUES || {};
    return Object.keys(A).filter(k => A[k] && A[k].kind === "technique")
      .map(k => ({ id: k, a: A[k], t: T[k] || {} })).sort((a, b) => String(a.a.name).localeCompare(String(b.a.name)));
  }
  function weaponList() {
    const I = (window.Items && window.Items.ITEMS) || {};
    return Object.keys(I).filter(k => I[k] && I[k].type === "equipment" && I[k].slot === "weapon")
      .map(k => ({ id: k, it: I[k] })).sort((a, b) => (a.it.price || 0) - (b.it.price || 0));
  }
  function armorList() {
    const I = (window.Items && window.Items.ITEMS) || {};
    return Object.keys(I).filter(k => I[k] && I[k].type === "equipment" && (I[k].slot === "armor" || I[k].slot === "shield"))
      .map(k => ({ id: k, it: I[k] })).sort((a, b) => (a.it.price || 0) - (b.it.price || 0));
  }
  function matList() {
    const I = (window.Items && window.Items.ITEMS) || {};
    const ammo = (id) => { try { const it = I[id]; return it && (it.type === "ammo" || (it.type === "consumable" && it.shuriken)); } catch (e) { return false; } };
    return Object.keys(I).filter(k => I[k] && (I[k].type === "material" || ammo(k) || I[k].type === "ammo"))
      .map(k => ({ id: k, it: I[k] })).sort((a, b) => ((a.it.price || 0) - (b.it.price || 0)));
  }
  // Where does one finished item (or raw mat) come from? Delegates to the
  // live Items.lootHint table so codex rows never drift from drop rules.
  function whereFind(id) {
    try { if (window.Items && window.Items.lootHint) return window.Items.lootHint(id) || ""; } catch (e) {}
    return "";
  }
  function matDetail(e) {
    const it = e.it;
    const rows = [["Type", (it.type === "ammo" ? "ammo" : it.shuriken ? "thrown" : it.type || "")]];
    if (it.ammo && it.ammo.power != null) rows.push(["Power", "x" + it.ammo.power]);
    if (it.shuriken && it.shuriken.power != null) rows.push(["Power", "x" + it.shuriken.power + " (one spent per throw)"]);
    if (it.price != null) rows.push(["Price", it.price + "g"]);
    const wf = whereFind(e.id);
    if (wf) rows.push(["Where to find", wf]);
    return '<div class="cdxbig">' + cdxIcon("item", e.id, 40) + "</div><h4>" + esc(it.name || e.id) + "</h4>" +
      '<div class="cdxdesc">' + esc(it.desc || "") + "</div>" + kv(rows) +
      '<div class="cdxnote">Item key: <b>' + esc(e.id) + "</b></div>";
  }
 function raceList() {
   try {
     const A = window.Appearance || {};
     return (A.RACES || []).map(r => ({ id: r, race: r }));
   } catch (e) { return []; }
 }
  // ---------- divine figures (story NPCs with no mob template) ----------
  // The Goddess of Dawn has no MOB_TEMPLATES entry — she never spawns as a
  // wild mob, boss, tame or recruit. She appears only in Main Story
  // visual-novel scenes (kind "goddess", tint #ffe9a8, sprite painted by the
  // main_story.js Sprites.actor wrapper). A dedicated entry keeps her out
  // of the computed mob tables (no fake stats) while still showing her
  // live sprite + story role.
  function divineList() {
    return [{ id: "goddess", name: "Goddess of Dawn", sub: "Herald of the Morning", tint: "#ffe9a8" }];
  }
  function divineDetail(e) {
    const portrait = spriteCanvas("goddess", (e && e.tint) || "#ffe9a8");
    return fig(portrait || "") + "<h4>" + esc((e && e.name) || "Goddess of Dawn") + "</h4>" +
      '<div class="cdxsub">Non playable character · Herald of the Morning</div>' +
      "<div class='cdxdesc'>🌅 Dawn herself speaks. A radiant woman with a blonde bob tied with a blue ribbon, warm gold eyes, a white dress with a gold sash, long sleeves with gold armlets, and a soft halo of morning light.</div>" +
      "<div class='cdxdesc'>She watches over the hero and appears throughout the Main Story (📜 Quests → 🌟 Main) to guide them — first in visions, later in Hell and on the surface, and one last time at the end of the journey to carry them home.</div>" +
      "<div class='cdxnote'>Non playable character — she cannot be fought, traded with, recruited or tamed.</div>";
  }
  function className(role) {
    try {
      const L = window.Appearance && window.Appearance.OUTFIT_LABEL;
      if (L && L[role]) return L[role];
    } catch (e) {}
    return role;
  }
  function classList() {
    try {
      const K = (window.CFG && window.CFG.ROLE_KIT) || {};
      return Object.keys(K).map(r => ({ id: r, role: r }))
        .sort((a, b) => String(className(a.role)).localeCompare(String(className(b.role))));
    } catch (e) { return []; }
  }
  const ARSENAL_TIER_NAME = { 1: "hedge", 2: "battle", 3: "war", 4: "cataclysm" };
  function mobArsenalHtml(kind) {
    try {
      if (!(window.Entities && window.Entities.movepoolFor)) return "";
      const mp = window.Entities.movepoolFor(kind) || {};
      const spells = (mp.spells || []), techs = (mp.techs || []);
      if (!spells.length && !techs.length) return "";
      const names = spells.concat(techs).map(abName).join(", ");
      let rule = "";
      if (mp.isBoss) {
        const tn = ARSENAL_TIER_NAME[mp.maxTier] || ("T" + mp.maxTier);
        rule = "Boss arsenal T" + mp.maxTier + " (" + tn + "): spawns with up to 12 of these — always at least 3 top-tier spells (shortfall cascades a tier down) plus at least 2 Deep Arts (a thin Deep Art pool substitutes another high-tier spell). Signatures + heal/panacea always stay.";
      } else {
        try {
          const T = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[kind] || {};
          const PA = (window.CFG && window.CFG.MOB_ARSENAL) || {};
          const APEX = PA.APEX_XP != null ? PA.APEX_XP : 150;
          const POWER = PA.POWER_XP != null ? PA.POWER_XP : 100;
          const xp = T.xp | 0 || 0;
          if (xp >= APEX) rule = "Apex horror: spawns with a thematic cataclysm + a deep art inside its 7-move kit.";
          else if (xp >= POWER) rule = "Seasoned killer: spawns with war-magic (tornado) + an art inside its 7-move kit.";
          else rule = "Spawns with its signatures + 1-2 body-pool bonuses (up to 7 moves).";
        } catch (e2) { }
      }
      return "<div class='cdxlvrow' style='margin-bottom:0'>Arsenal (live movepool)</div>"
        + "<div class='cdxdesc'>" + esc(names) + "</div>"
        + (rule ? "<div class='cdxnote'>" + esc(rule) + "</div>" : "");
    } catch (e) { return ""; }
  }
  function mobWieldsHtml(kind) {
    // Live war-gear readout: mirrors the actual spawn fitting in entities.js
    // (equipMobTechniqueGear first for non-bosses, then equipMobWarGear which
    // keeps art steel and adds band plate). Every weapon name resolves through
    // gearIdForFamTier + ITEMS, so balance edits appear automatically.
    try {
      const E = window.Entities;
      if (!E || !E.mobWarTier || !E.gearIdForFamTier) return "";
      const T = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[kind] || {};
      const xp = T.xp | 0 || 0;
      const BK = (window.CFG && window.CFG.BOSS_KINDS) || [];
      const isBoss = !!(T.boss || BK.indexOf(kind) >= 0);
      const wname = (fam, tier) => {
        try {
          if (!fam || fam === "unarmed") return "bare fists";
          const id = E.gearIdForFamTier(fam, tier);
          const it = (id && window.Items && window.Items.ITEMS[id]) || null;
          return it ? it.name : (id || fam);
        } catch (e2) { return fam; }
      };
      const aname = (track, tier) => {
        try {
          const id = E.mobArmorIdForTier ? E.mobArmorIdForTier(track, tier) : null;
          const it = (id && window.Items && window.Items.ITEMS[id]) || null;
          return it ? it.name : (id || "plate");
        } catch (e2) { return "plate"; }
      };
      let track = "heavy";
      try { track = E.mobArmorTrack ? E.mobArmorTrack(kind, T) : "heavy"; } catch (e2) { }
      const trackNoun = { robe: "robes", habitus: "habitus", light: "light armor", heavy: "plate", kasaya: "kasaya" }[track] || "plate";
      // Bosses: war-gear draw at boss tiers (low steel, mid+ dragonbone),
      // plate on the same track. No technique weapons — a warlord IS the
      // weapon — but basic strikes ride the steel via meleeMult.
      if (isBoss) {
        const loT = E.mobWarTier(10, true, 0), hiT = E.mobWarTier(40, true, 0);
        const bowBit = T.archer ? " · always draws the band bow (" + esc(wname("bow", loT)) + " low / " + esc(wname("bow", hiT)) + " mid+)" : "";
        return "<div class='cdxdesc'>🗡️ <b>Wields:</b> warlord war-gear by level — below lv20 "
          + esc(wname("sword", loT)) + " + " + esc(aname(track, loT))
          + ", lv20+ " + esc(wname("sword", hiT)) + " + " + esc(aname(track, hiT)) + bowBit
          + " · needs no weapon for its arts (claws, fangs, living storm); basic strikes ride the steel.</div>";
      }
      const tLow = E.mobWarTier(10, false, xp);
      // mid band is a steel-or-mythril coin flip — except apex horrors
      // (template XP 150+), which floor mythril and always draw it mid too
      const midW = (fam) => xp >= 150 ? wname(fam, 4) : wname(fam, 2) + "/" + wname(fam, 4);
      const midA = xp >= 150 ? aname(track, 4) : aname(track, 2) + "/" + aname(track, 4);
      const midRule = xp >= 150 ? "mid mythril" : "mid steel-or-mythril";
      const plate = aname(track, tLow) + " · " + midA + " · " + aname(track, 5);
      const floorBit = xp >= 150 ? " · template XP floors mythril" : xp >= 100 ? " · template XP floors steel" : "";
      const fams = (E.mobTechniqueFams ? E.mobTechniqueFams(kind) : []) || [];
      const artFams = fams.filter(f => f && f !== "unarmed");
      const bareBit = fams.indexOf("unarmed") >= 0 ? " · Iron Palm fights bare-fisted" : "";
      // Art wielders: the art's family steel at the spawn's band tier.
      if (artFams.length) {
        const bits = artFams.map(f => esc(f) + ": " + esc(wname(f, tLow)) + " · " + esc(midW(f)) + " · " + esc(wname(f, 5)));
        return "<div class='cdxdesc'>🗡️ <b>Wields:</b> art steel by level (low · " + midRule + " · high dragonbone) — "
          + bits.join(" — ") + " · plus " + esc(trackNoun) + " (" + esc(plate) + ")" + floorBit + bareBit + ".</div>";
      }
      // Everyone else: the war-gear draw — random melee or bow at the same tiers.
      const ex = (fam) => esc(wname(fam, tLow)) + " · " + esc(midW(fam)) + " · " + esc(wname(fam, 5));
      const bowBit = T.archer ? "template archers always take the bow" : "about 22% take the bow";
      return "<div class='cdxdesc'>🗡️ <b>Wields:</b> war-gear draw by level (low · " + midRule + " · high dragonbone), random per spawn — "
        + "e.g. sword " + ex("sword") + " · spear " + ex("spear") + " · bow " + ex("bow")
        + " (swords/spears weighted; axes, hammers, daggers, whips in the mix; " + bowBit + ")"
        + " · plus " + esc(trackNoun) + " (" + esc(plate) + ")" + floorBit + bareBit + ".</div>";
    } catch (e) { return ""; }
  }
  // ---------- codex lore (short in-world description for every mob + boss) ----------
  const LORE = {
    slime: "A hunger with no bones. It ate the dungeon's crumbs for a century and grew big enough to eat the dungeon.",
    bat: "It navigates by screaming and holds a grudge against every torch ever lit.",
    goblin: "Small, spiteful, and weirdly proud of a spear it definitely stole.",
    wolf: "The pack's hunger given legs. It learned to fear fire and to test everything else.",
    mushroom: "A walking spore that dreams of becoming a forest. It starts with your corpse as fertilizer.",
    wild_horse: "Unbroken wind on four legs. Gentle it, and it will carry you farther than roads go.",
    stable_pony: "A mild-mannered meadow grazer. Slow, sweet, and almost impossible to frighten.",
    stable_courser: "Bred for the chase — it runs like gossip and stops like a rumor.",
    stable_destrier: "A wall of muscle in horse shape. It does not flinch; things flinch at it.",
    stable_zephyr: "Sired by a storm, allegedly. It outruns rain and resents the saddle for slowing it down.",
    stable_aegis: "A royal guard's horse, trained to stand between its rider and everything sharp.",
    tide_turtle: "It mistook the tide for a friend and the beach for a promise. Both were true.",
    cinder_steed: "A horse that burned and kept galloping. Its hooves strike sparks where shoes used to be.",
    magma_tortoise: "Slow as geology, hot as gossip. It has never once hurried, and never needed to.",
    skeleton: "A soldier who refused discharge. The bones remember the drill even if the cause is forgotten.",
    cultist: "It traded its name for a whisper from the Pit and considers the deal still open.",
    wraith: "What remains when grief learns to hate. It wears cold like a crown.",
    lesser_wyvern: "A runt with sky-sized ambitions. Every scar on it is a lesson it plans to return.",
    velociraptor: "It hunts in arithmetic: you plus two more of it equals dinner.",
    minotaur_calf: "Big horns, bigger temper, smallest labyrinth. It charges first and reads maps never.",
    harpy: "She collects shiny things and grudges, and can tell you exactly where each came from.",
    cyclops_whelp: "One eye, zero depth perception, infinite confidence in thrown rocks.",
    satyr: "Half goat, half party, all trouble. Its pipes can start a dance or a riot — sometimes both.",
    siren: "Her song is a map to a place you never leave. The rocks below are paved with listeners.",
    centaur_foal: "Four legs it hasn't grown into and opinions it absolutely has.",
    stymphalian: "Its feathers are arrows that file themselves. It molts ammunition.",
    gorgon_spawn: "Too young to turn you to stone — she practices on statues, and she is getting better.",
    hydra_spawn: "Cut off one head and it sulks. Cut off two and it calls its mother.",
    chimera_cub: "Three heads, one shared braincell, and they take turns using it.",
    kobold: "It worships dragons it has never met and steals candles for an altar of greater thefts.",
    draugr: "A miser who followed its gold into the grave and kept counting it ever since.",
    troll_whelp: "It regenerates faster than it learns. Currently it has learned nothing.",
    fenrir_pup: "A puppy the size of a wolf with a destiny the size of an apocalypse. Very good boy. For now.",
    hulder: "A beautiful cowherd from behind; from the front, too — don't look at the tail. Don't mention the tail.",
    nokk: "It plays the river's song on drowned strings. Answer it and the river keeps you.",
    lindworm: "A dragon that skipped the wings and legs but kept all of the pride.",
    valkyrie_renegade: "She deserted the choosers of the slain to choose her own battles. She chose yours.",
    anubite: "A jackal-headed guardian weighing your heart against a feather. Yours looks heavy.",
    scarab_swarm: "Thousands of tiny priests rolling the sun's dung across the dark. You are in the way.",
    mummy: "Wrapped in curses and linen, in that order. It woke up angry about both.",
    sphinx_cub: "It asks riddles with obvious answers and is devastated when you get them wrong.",
    sobek_spawn: "A crocodile that prayed to a crocodile god and got answered. It shows.",
    khepri_beetle: "It rolls the morning sun across the sky in miniature, every single day, without thanks.",
    kappa: "Polite, river-dwelling, and obsessed with etiquette — bow back, or lose your lunch and possibly more.",
    oni_imp: "A thimble of thunder with a club. It will grow into a mountain of trouble.",
    tengu_crow: "A crow that studied swordsmanship and manners, in that order. It corrects your stance, then your fate.",
    kitsune_trickster: "Nine tails to grow, one trickster already. It collects promises the way magpies collect spoons.",
    yuki_onna: "Beautiful as snowfall, cold as the rest of the metaphor. She only visits in white weather.",
    gasha_skull: "A skull the size of a cart, hungry the size of a famine. It remembers being a person the way fire remembers wood.",
    nurikabe: "An invisible wall that appears exactly where you're hurrying. It finds this very funny.",
    tanuki: "A jolly shapechanger with a big hat, big belly, and bigger lies. It means well. Mostly.",
    banshee: "Her wail is not a warning of death — it is death, RSVP'd.",
    redcap: "Its cap stays red by dipping it in travelers. It is running low. It is looking at you.",
    kelpie: "A beautiful horse that rises from the loch. Its back is sticky. Count your fingers after touching.",
    tidecaller: "An eel that conducts the sea like an orchestra. You are standing in the splash zone.",
    deepmaw: "It lives where light gave up. Its lantern is a lie and its mouth is the truth.",
    dullahan_herald: "A headless rider's outrider, carrying its master's spare spine and a warning.",
    puca: "A shapeshifter that offers rides and ruins. The ride is real. So is the ruin.",
    leshy: "The forest's landlord. It measures you in tree rings and finds you briefly adequate.",
    vodyanoy: "A drowned grandpa of the river who collects souls in cracked teapots. Mind your manners near his water.",
    rusalka: "She drowned on her wedding eve and dances still. Join hands and the river decides the steps.",
    striga: "An owl by night, a spite by nature. It drinks the day from the dying.",
    domovoi_rogue: "A house-spirit gone feral. It guards no hearth now — only its grudges.",
    naga: "Half serpent, all patience. It waited a thousand years to coil; it can wait one breath more.",
    rakshasa_cub: "A tiger-clawed trickster prince in training. It already lies beautifully.",
    lamassu_cub: "A winged bull-calf carved by gods to guard good thresholds. It takes the job very seriously.",
    utukku: "A restless ghost of the wastes that slipped its burial and found the living rude.",
    jiangshi: "A stiff official hopping to its hometown for burial, still collecting tolls en route.",
    goblin_shaman: "It read one mushroom and now speaks for the spirits. The spirits deny everything.",
    orc_grunt: "Muscle with a mailing address. It solves problems by applying forehead.",
    orc_shaman: "It paints its face with war and its enemies with lightning. Both stick.",
    goblin_brute: "The biggest goblin, which is like being the tallest mushroom. Still heavy when thrown at you.",
    kobold_shaman: "A candle-thief promoted to dragon-priest. Its sermons smell of wax and ambition.",
    gnoll: "It laughs when it hunts. It is always hunting.",
    gnoll_hunter: "It can track a secret across bare rock. Your scent is practically shouting.",
    slime_empress: "A sovereign of ooze holding court in a jelly palace. Her decrees are sticky and final.",
    wyvern_fledgling: "All wings and appetite. It has not yet learned that roofs are not prey.",
    gloomspinner: "It weaves webs from bad dreams and waits at the center, patient as insomnia.",
    umbral_stag: "A stag with twilight caught in its antlers. Hunters who follow it return changed, or not at all.",
    sandmaw: "The desert's mouth, opening where caravans step. Perfect table manners, no table.",
    burrow_mole: "Blind, soft, and strong enough to redecorate the dungeon. It means no harm. It causes it anyway.",
    giant_tarantula: "Eight legs, eight eyes, one grudge against anything warm.",
    tomb_scorpion: "It guarded a pharaoh's door for three thousand years. You are not on the guest list.",
    siege_ant: "A soldier built like a battering ram with six legs. The colony is the army; it is one marching boot.",
    hive_hornet: "Its sting carries the whole hive's opinion of you. The hive has decided.",
    rime_wolf: "A wolf carved from blizzard. Its breath freezes the howl halfway out.",
    shiver_owl: "It hunts by the sound of your teeth chattering. Try to be quiet.",
    coral_crab: "It wears the reef as armor and clicks its claws in a language that means mine.",
  };
  Object.assign(LORE, {
    abyss_serpent: "It has never seen the sun and resents everything that has.",
    mire_lurker: "The swamp's held breath. It surfaces only for food and bad decisions — yours.",
    wreck_eel: "It nests in sunken ships and charges its spine on drowned lightning.",
    magma_eel: "It swims in liquid rock and thinks water is a rumor.",
    cinder_maw: "A mouth with an ember for a heart. It eats coal, wood, travelers — in roughly that order of preference.",
    abyss_tentacle: "One arm of something much larger that you should never, ever meet.",
    lesser_mimic: "A chest with trust issues and teeth. It is still learning to sit still.",
    mimic: "It studied treasure chests for years and now performs one flawlessly, except for the teeth.",
    greater_mimic: "A wardrobe of a lie. It has eaten adventurers who read its approach in a bestiary like this one.",
    mimic_devourer: "It no longer imitates treasure — it imitates the room the treasure is in.",
    doppelganger: "It wears your face better than you do, and your voice, and your guilty conscience. Never in heaven — angels and heavendwellers wear no borrowed faces.",
    phoenix: "It dies beautifully and returns annoyed. Dying is its hobby; fire is its alibi.",
    yeti: "The mountain's shy apex. It only descends for storms and particularly loud expeditions.",
    peak_dragon: "It owns the highest crag and taxes every cloud that passes. True dragon at last — and when pressed it takes wing (blades can't reach it up there; arrows and spells can).",
    frostwyrm: "Winter with a spine. It does not hate you; it simply cannot notice anything unfrozen. When pressed it rides the storm up out of blade-reach.",
    mire_hydra: "Every head disagrees about dinner. All heads agree it is you. It wells up black pools around itself and dives under them.",
    tempest_roc: "Its wings are weather. Villages below check the sky the way sailors check the sea.",
    prism_colossus: "A walking cathedral window that focuses the sun into opinions.",
    umbral_wyrm: "A dragon that traded its fire for shadow and considers it an upgrade.",
    bandit: "It wants your purse, your boots, and ideally your lunch. In that order.",
    outlaw: "Wanted in three holds, welcome in none. It has made peace with this by taking purses.",
    murderer: "It stopped robbing travelers because corpses complain less. Run.",
    hell_beast: "The Pit's stray dog. It bites first and never learns names.",
    succubus: "She collects vows the way other demons collect skulls. Hers are warmer.",
    doom_lord: "Middle management of the apocalypse. It has a quota, and you are in it.",
    infernal: "A soldier poured from living magma and given orders instead of mercy.",
    hell_hound: "It tracks sinners by smell and everyone else by convenience.",
    cinder_imp: "Small, hot, and convinced arson is a love language.",
    ash_wraith: "Everything it was burned away except the grudge. The grudge walks.",
    ember_crawler: "It eats warmth and leaves gray. Campfires fear it; so should you.",
    soot_bat: "It drinks smoke and navigates by the screams of chimneys.",
    crag_fiend: "A cliff that grew teeth and opinions about climbers.",
    slag_serpent: "It swims through cooling lava the way otters swim through rivers — joyfully, and with teeth.",
    ash_hound: "It hunts in the gray wastes and howls in static.",
    ember_swarm: "One spark is pretty. Ten thousand is a verdict.",
    charred_colossus: "A burned giant that kept walking. It has been walking ever since.",
    cinder_wisp: "A lost spark looking for something to become. You look flammable.",
    ash_mother: "She births gray children by the hundred and mourns none of them.",
    soot_stalker: "It follows chimneys, campfires, and you — in that order of preference.",
    gore_hound: "It doesn't bark. It gurgles. Then it charges.",
    sanguine_horror: "A nightmare that bled into the world and liked it here.",
    vein_lurker: "It swims the blood-rivers of the deep Pit, sipping at the current.",
    crimson_bat: "It drinks deep and flies wobbly home. Avoid standing under its flight path.",
    exsanguinator: "A courteous killer that drains you like a wine cellar — slowly, and with commentary.",
    pulse_fiend: "It beats like a heart and hits like one stopping.",
    clot_brute: "A scab given fists. It blocks the way in every sense.",
    artery_serpent: "It rides the pulse of the Pit, constricting whatever the current brings.",
    blood_monk: "It took a vow of silence and a hobby of bleeding. Guess which it keeps better.",
    bleed_mother: "She mothers every wound in the Pit. They all call her Mama.",
    coagulus: "A living clot, thick and patient. It seals tombs, tunnels, and travelers.",
    hemorrhage: "It does not wound you. It simply reminds your blood of its options.",
    obsidian_shard: "A splinter of a volcano's temper, sharp enough to cut yesterday.",
    glass_maw: "A mouth of black glass that ate a mirror and now hungers for reflections.",
    blackglass_serpent: "It slides without sound across volcanic glass, leaving red footnotes.",
    obsidian_golem: "Carved from a volcano's bad mood. It takes orders literally and gives warnings never.",
    shard_swarm: "A glittering storm of edges. It applauds by cutting.",
    mirror_fiend: "It shows you yourself, slightly worse, right before it shows you nothing.",
    glasswing: "Its wings are stained-glass windows into somewhere hotter.",
    obsidian_prophet: "It read the future in volcanic glass and saw only itself, larger.",
    shard_ravager: "It eats statues, armor, and adventurers — roughage, it calls them.",
    glass_spider: "Transparent except for the venom. The venom glows, as a courtesy.",
    vitrifier: "It turns battlefields into glassware. Collectors pay well; survivors pay nothing.",
    razor_choir: "It sings in edges. The harmony is exquisite. The audience bleeds.",
    marrow_eater: "It sucks bones like straws and complains about the vintage.",
    ossuary_crawler: "A crypt's worth of spare parts, assembled by committee, given legs.",
    skull_swarm: "Every skull still argues about who it was. They unite on one point: you.",
    gravewing: "A bat woven from burial shrouds. It files your name under soon.",
    bone_collector: "It curates femurs the way nobles curate wine. Your legs interest it professionally.",
    calcium_horror: "Milk's revenge, three hundred years late and fully armed.",
    marrow_mage: "It studied at the university of bones and graduated with honors in ow.",
    ribcage_walker: "A cage that outlived its prisoner and went looking for a replacement.",
    ossuary_hound: "It fetches bones. It brings them back wrong. It does not care.",
    chalk_wraith: "A pale outline of a person, still trying to finish its last sentence.",
    ivory_tyrantkin: "A tyrant's heirloom carved from tusk and tyranny. It expects bowing.",
    reliquary: "A walking shrine full of saints' fingers, all pointing at you accusingly.",
    flesh_mound: "It has no face, only appetite arranged in layers.",
    gut_lurker: "It lives in the Pit's intestines and charges rent in travelers.",
    sinew_stalker: "Tendons with a hunting license. It strings its bow with whatever runs.",
    maw_walker: "A mouth that learned to walk so dinner couldn't run. Dinner runs anyway.",
    bile_spitter: "Its opinions are acidic and long-range.",
    organ_swarm: "A choir of spare parts, each humming a different death.",
    skin_thief: "It wears yesterday's travelers and complains about the fit.",
    muscle_brute: "No brain, all brawn, and the brawn has brawn.",
    flesh_oracle: "It reads the future in entrails — mostly yours, mostly soon.",
    gullet_worm: "The throat of the Pit, traveling. Swallow follows it like weather.",
    pulse_mass: "A heartbeat with nowhere to go. It borrows your chest. Briefly.",
    flayed_saint: "Martyred, peeled, and furious about the order of events.",
    demon_warden: "It guards the Pit's cells and collects inmates the way others collect stamps.",
  });
  Object.assign(LORE, {
    orc_warchief: "Its war-drums are other tribes' shields. It has never lost a rhythm, or a war it admits to.",
    bandit_warlord: "It taxes every road it can see and sees every road. Its toll booth is an ambush.",
    kobold_king: "Crowned in candle-wax and dragon-dreams, it rules the warrens with a borrowed scepter and real traps.",
    gnoll_alpha: "Its laugh is the pack's law. When it howls, every hyena-head agrees at once.",
    harpy_matriarch: "Queen of the high crags. Her scream rearranges the wind, and her flock rearranges you.",
    troll_king: "Moss-crowned and mountain-rooted, it knits its wounds while lecturing you on forestry.",
    leviathan: "The sea's oldest argument. Ships are punctuation; it eats sentences whole. Largest of all horrors — it drowns whole halls around itself and dives under the flood.",
    drowned_captain: "It went down with its ship and brought the ship back up. The crew never left. Neither will you.",
    kappa_king: "Lord of the river's tolls. It drinks deep of courtesy — and of your magic — and drowns the rude.",
    rusalka_queen: "She drowned a prince's court to build her own. Her song slows oars, hearts, and heroes.",
    portal_devourer: "It wears the way down like a mouth wears teeth. Step through politely — it bites.",
    voidstalker: "You never see it hunting. Survivors describe the moment after, if they can describe anything.",
    boss: "The dungeon's landlord, tax collector, and final notice. It raises the rent in skeletons.",
    goblin_king: "Crowned in scrap and spite, it drafts every goblin in reach and spends them like copper.",
    slime_sovereign: "It ate a kingdom's sewers and crowned itself with the gulping consensus of all ooze.",
    skeleton_warlord: "It drilled its phalanx for a thousand years in the dark. Inspection is now. You are the inspection.",
    wraith_sovereign: "Grief's landlord. It phases through walls, armor, and the line between haunting and hunting.",
    cultist_hierophant: "It read the Pit's scripture aloud until the Pit answered. The congregation is armed.",
    wyvern_matriarch: "Mother of the sky's teeth. Her dive ends arguments about whether dragons are extinct.",
    minotaur_warlord: "It memorized every corridor of its labyrinth and every way you could bleed in them.",
    medusa_queen: "Her gaze is a museum policy: look, and become part of the collection.",
    jotunn_jarl: "A winter that holds councils. It votes in blizzards and filibusters in ice.",
    draugr_king: "It counts its grave-gold nightly and its enemies never — the second list keeps shrinking.",
    cursed_pharaoh: "Death was a coronation it refused to attend. Its tomb sends scarabs in its place.",
    oni_daimyo: "A warlord the size of a siege engine with the manners of a falling mountain. Its club settles debates.",
    tengu_stormlord: "It commands the gale like a general and the crows like a critic. The lightning walks where it points.",
    kitsune_ninetails: "Nine tails, nine hundred lies, one fox laughing behind all of them. Nothing here is real except the burns.",
    naga_raja: "A serpent king coiled around a drowned treasury. Its venom floods; its fangs collect taxes.",
    rakshasa_maharaja: "It grants wishes the way traps grant cheese. Name your doom carefully — it is listening.",
    hydra_broodmother: "Every head is a queen and every neck a kingdom. Burn the stumps or the family keeps growing. It wells up pools around itself and dives under them — and its floor always holds plenty of water.",
    fenrir_alpha: "The moon's hound grown vast. Its hunt outruns rumors and its howl outruns the hunt.",
    dullahan_lord: "It carries its head like a lantern and its heralds like bad news. The howl finds the guilty.",
    baba_yaga: "She lives in a walking hut, flies in a mortar, and grades heroes the way ovens grade bread.",
    tarantula_broodmother: "She knits the dark with eight needles and rocks a cradle of ten thousand hungry legs.",
    joker: "A criminal mastermind in a flat cap, running the outlaw trade with a ledger, a lantern, and a smile that bills by the hour.",
    siege_queen: "An armored foundry with a crown. Her brood marches in formation; her shields march in front.",
    scorpion_emperor: "Its sting is imperial law, written in venom and enforced by everything with claws.",
    infernal_overlord: "It wears a crown of meteor-fire and taxes the damned in ash. Its court burns standing.",
    succubus_matriarch: "She rules desire like a treasury, spends daughters like coin, and always collects.",
    doom_tyrant: "It announces the end personally, with beams and beasts, and files you under DOOM.",
    hell_magus: "Its rites are bizarre on purpose — confusion is the liturgy, and you are the congregation.",
    peter_the_fallen: "A fallen god in a black demon-mask weeping violet fire, crowned in six bone spears under a broken halo. A heart beats in his chest-maw; his greatblade burns. When he swings, his eyes go white-hot. He chose Hell and holds it still.",
    divine_dragon: "A dragon of dawn-cloud and gold light. It basks over the reservoirs and has never started a fight; finish one near it and you will learn otherwise. Press it and it takes wing — blades can't follow, arrows and spells can.",
    celestial_messenger: "A herald with a trumpet of clear morning. Its message is peace; its smite is punctuation.",
    reservoir_leviathan: "The calm under the reservoir. It drinks deep and shares its healing with whoever bleeds near it — until struck thrice. Only the broadest reservoirs hold it, and it dives them like its deep-delve kin.",
    seraph_regent: "Regent of the radiant court while the goddess walks the surface. Kneel politely; it can afford to wait.",
    dew_sprite: "A droplet with opinions about sunlight. Mends small hurts.",
    cloud_lamb: "Wool of condensed morning. Follows the kind; ignores the cruel.",
    halo_finch: "Its ring never tarnishes. Sings the lost back to the path.",
    petal_drake: "A small dragon that smells of orchards. Breathes tide-magic and goodwill.",
    sunbloom_tender: "Keeps the grove flowers. Keeps you alive, incidentally.",
    mist_choir: "Sings in rounds with itself. The song closes wounds.",
    brook_seraph: "Wades the reservoirs, handing out clean water and clean wounds.",
    orchard_wisp: "An apple-blossom that learned to fly. Sweet, bright, mildly flammable.",
    gilded_stag: "Antlered sunrise. Lets the gentle touch its gold.",
    cumulus_manta: "Rides the high cloud like slow water. Glaciers fall off it like dandruff.",
    dawn_pilgrim: "Walks every island, blessing each. Hopes you walk with it.",
    lumen_cub: "A sunbeam that grew paws. Plays rough only when you start it.",
    dawn_angel: "A civilized angel of the dawn court — trades, chats, and can be recruited. High-level, courteous, and well-armed.",
    pegasus: "Dawn-bred wings, sold only in heaven's stables. The fastest saddle in the sky.",
    unicorn: "Moonhorn lines, sold only in heaven's stables. The pride of the dawn court.",
    choir_angel: "Keeps the choir books and the town gossip in equal measure.",
    seraph_guard: "The pantheon guard. Politeness backed by a tower shield.",
    scroll_angel: "Catalogues every cloud by shape and every hero by rumor.",
    ash_tyrant: "It eats the gray wastes and exhales meteor weather. Kneel, or be weather.",
    cinder_emperor: "Its court glows ember-red; its guards carry coals for hearts. It remembers every spark.",
    magma_mauler: "It claims the ground you stand on by melting it. Stand somewhere else — it is claimed too.",
    pyre_queen: "Beautiful as a burning city. She collects admirers the way fires collect fuel.",
    slag_colossus: "A mountain that stood up to object. Its objection is you.",
    ember_inquisitor: "It asks questions under rotating beams until every answer confesses.",
    char_king: "Ashes to ashes, it says, and means it as policy. Its warcry curdles the air.",
    volcano_pontiff: "It preaches eruption and practices deluge. Its blessings scald; its healings leave marks.",
    void_prelate: "It reads the dark like scripture and steps out of it behind you.",
    umbral_matriarch: "She mothers the shadows and married the dark. Her embrace is mass, and charming.",
    gloom_sovereign: "It declares the light dead on arrival. The dread nova is just the funeral.",
    rift_eater: "It lives in the crack between places and hunts across it. The crossfire is its table manners.",
    nether_abbess: "Her prayers are hollow and her choir is hexed. Kneel, and be emptied.",
    mirror_abbot: "It shows you every you, then sends them all to collect you. The dazzle is mercy.",
    eventide_horror: "Dusk that never ends, burning at the edges. It keeps the evening; you keep the burns.",
    hollow_cantor: "Its hymn shakes stone and charms the shaking. The choir sings in quakes.",
    gore_patriarch: "First father of the blood-rivers. Everything red downstream calls him sire.",
    maw_primogenitor: "The first mouth. Everything since is an imitation, including yours.",
    flesh_sculptor: "It sculpts living clay into opinions. You are excellent material, it says.",
    organ_choirmaster: "It conducts the spare-part choir. Every performance ends in a standing ovation and a lying-down audience.",
    bile_cardinal: "A prince of the Pit's church, anointed in acid. Its blessings digest.",
    sinew_despot: "It strung its kingdom together with tendons and rules it with a drawn bow.",
    skin_pope: "Infallible in stolen skin. Its vestments fit everyone exactly once.",
    gut_empress: "She reigns over the Pit's digestion. Tribute goes in; nothing comes out.",
    dread_masticator: "It chews battlefields the way oxen chew cud — slowly, thoroughly, and twice.",
    blood_evangel: "It preaches the red gospel to every vein. Conversion is compulsory and total.",
    marrow_sovereign: "It wears the ossuary as a crown and means it literally. Every bone in the hold answers when it calls.",
  });
  // ---------- boss trick labels (from game.js bossTick comments) ----------
  const BOSS_TRICKS = {
    boss: "DREAD RALLY — raises skeletons, shields, calls a wraith",
    goblin_king: "HOBGOBLIN DRAFT — endless goblin tide, a brute at half HP",
    skeleton_warlord: "BONE PHALANX — shielded skeleton wall, closes ranks as it falls",
    kobold_king: "TRAP HOARD — ring of buried blasts around you + tinkers",
    bandit_warlord: "AMBUSH — blinks behind you with a poisoned blade, calls outlaws",
    gnoll_alpha: "BLOOD HUNT — howl stacks ATK, pack grows",
    cultist_hierophant: "PIT RITUAL — elemental barrage + acolytes, hell-rift at low HP",
    drowned_captain: "BROADSIDE — cannon line across the water + drowned crew",
    slime_sovereign: "FISSION — splits at 66%/33%, venom sweats",
    kappa_king: "RIVER'S TOLL — drinks your MP, drowns you in summons",
    orc_warchief: "WAAAGH! — war-drums stack ATK, warband musters",
    troll_king: "REGROWTH — knits flesh unless burning + rock slams",
    harpy_matriarch: "SKY SCREAM — gale shove + blinding screech + flock",
    rusalka_queen: "SIREN SONG — blinds + slows all near, calls sisters",
    wraith_sovereign: "PHASE HAUNT — blinks onto you inside a freezing nova",
    minotaur_warlord: "LABYRINTH CHARGE — warned line-charge that stuns",
    draugr_king: "GRAVE COLD — freezing nova + shielded husks",
    cursed_pharaoh: "PLAGUE OF TOMBS — scarabs + sandstorm blindness",
    medusa_queen: "PETRIFYING GAZE — warned, then stone (freeze + stun) in range",
    oni_daimyo: "THUNDER CLUB — triple quake slam + demon guard",
    tengu_stormlord: "STORM CALL — lightning walks toward you + gale + crows",
    kitsune_ninetails: "ILLUSION — mirror images + body-swap + foxfire",
    naga_raja: "COIL CRUSH — venom flood + storm fangs + coils",
    rakshasa_maharaja: "TWISTED WISH — strips your blessings, names your doom",
    dullahan_lord: "HEAD HUNT — hurled head + deathly howl + heralds",
    baba_yaga: "HUT WALK — never where you left her + triple hex + servants",
    wyvern_matriarch: "SKYFIRE DIVE — warned slam from above that burns",
    jotunn_jarl: "WINTER'S END — deep-freeze nova + slowing cold + giants",
    hydra_broodmother: "MANY HEADS — every quarter-HP grows heads; burns stop regrowth; wells up pools and dives under them",
    fenrir_alpha: "MOON HUNT — endless wolves, howls stack speed + fury",
    voidstalker: "THE STALK — hunts unseen (see its entry); enrage only shortens the stalk",
    leviathan: "CRUSHING DEEP — breach novas as it falls + live tentacles; floods the deep around itself and dives under it",
    portal_devourer: "LYING GATE — wears the way-down portal; E bites 35% + 4s stun",
    tarantula_broodmother: "BROODMOTHER — spiderlings + venom (no unique trick; enrage + spells)",
    joker: "JOKER'S WILD — criminal mastermind: blinds, blinks behind you, calls its gang",
    siege_queen: "SIEGE QUEEN — armored brood + shields (no unique trick; enrage + spells)",
    scorpion_emperor: "STING EMPEROR — venom + immolate guard (no unique trick; enrage + spells)",
    infernal_overlord: "INFERNO CROWN — meteor + hound pack + burning ring",
    succubus_matriarch: "SIREN COURT — mass charm drain + daughters",
    doom_tyrant: "DOOM CALL — energy beam + beast tide, DOOM stacks",
    hell_magus: "BIZARRE RITES — rotating elements + mirror adds + blind nova",
    peter_the_fallen: "FALLEN GOD — meteor + beam + tide in sequence, court adds, triple FALL nova",
    divine_dragon: "DAWN WYRM — whiteout + mass heal guarded; takes wing when pressed",
    celestial_messenger: "HERALD — smite + dazzle + lifeward",
    reservoir_leviathan: "STILL WATER — tideburst deluge + mass heal; rules only great reservoirs, dives them",
    seraph_regent: "REGENT — smite + whiteout, panacea-guarded",
    ash_tyrant: "ASH TYRANT — meteor barrage inside a burning nova ring",
    cinder_emperor: "EMBER COURT — meteor + ember-weapon guards, musters cinder adds",
    magma_mauler: "MAGMA FLOOR — burning nova claims the ground, molten adds",
    pyre_queen: "BURNING BEAUTY — meteor + mass charm drain + daughters",
    slag_colossus: "CRACKDOWN — quake slams + slag adds, stonewall guard",
    ember_inquisitor: "CONFESSION — charm inquisition under rotating beam fire",
    char_king: "ASHES TO ASHES — meteor crown + burning nova, warcry court",
    volcano_pontiff: "ERUPTION RITE — meteor + tideburst deluge, mass heals",
    void_prelate: "DARK SEEING — energy beams, blinks onto you out of the dark",
    umbral_matriarch: "DARK EMBRACE — mass charm + shadow adds, hex ward",
    gloom_sovereign: "LIGHT DIES — beam + whiteout inside a dread nova",
    rift_eater: "THE CRACK BETWEEN — blink hunter, beam crossfire",
    nether_abbess: "HOLLOW PRAYER — charm + whiteout, panacea-guarded",
    mirror_abbot: "EVERY YOU — beam + mirror adds, dazzle wards",
    eventide_horror: "ENDLESS DUSK — whiteout + burning nova, shielded bulk",
    hollow_cantor: "HOLLOW NOTE — quake hymn + charm, hex choir",
    gore_patriarch: "FAMILY BLOOD — burning nova + kin adds, warcry",
    maw_primogenitor: "FEED ME FIRST — endless maw-spawn, grapple gullets",
    flesh_sculptor: "OPENING — charm + sculpted adds, knits itself shut",
    organ_choirmaster: "CHOIR OF GUTS — quake anthem + organ-swarm adds",
    bile_cardinal: "HURL — tideburst + bile adds, panacea bulk",
    sinew_despot: "TAUT TERROR — blink grapples inside a burning nova",
    skin_pope: "SUNDAY BEST — charm + smite beams, angel-warded",
    gut_empress: "WOMB TEETH — adds + whiteout, crushing coils",
    dread_masticator: "CHEW — quake + burning nova, grapple maw",
    blood_evangel: "RED GOSPEL — tideburst + smite beams, evangel heals",
    marrow_sovereign: "HOLLOW THRONE — bone-tide adds inside a marrow nova, panacea bulk",
  };
  // ---------- per-kind special mechanics (live data, text is fixed) ----------
  function mobSpecialHtml(kind) {
    try {
      const T = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[kind] || {};
      const BK = (window.CFG && window.CFG.BOSS_KINDS) || [];
      const isBoss = !!(T.boss || BK.indexOf(kind) >= 0);
      const out = [];
      // bosses: bulwark + enrage + trick + depth
      if (isBoss) {
        try {
          const tier = ((window.CFG.BOSS_MIN_EFF || {})[kind]) || 1;
          const prof = ((window.CFG.BOSS_BULWARK || {})[kind]) || {};
          const bits = [];
          if (prof.frail) bits.push(prof.frail === "mag" ? "spell-frail (SDEF 0.85x DEF)" : "blade-frail (SDEF 1.15x DEF)");
          if (prof.weak) bits.push("weak: " + prof.weak + " (+10%)");
          bits.push("wakes at depth " + tier + "+");
          try {
            if (window.Entities && window.Entities.movepoolFor) {
              const mp = window.Entities.movepoolFor(kind) || {};
              const tn = ARSENAL_TIER_NAME[mp.maxTier] || ("T" + (mp.maxTier || 1));
              bits.push("arsenal T" + (mp.maxTier || 1) + " " + tn + " (spawns ≤12: ≥3 top-tier spells + ≥2 Deep Arts, thin Deep Art pools substitute a high-tier spell)" + (kind === "portal_devourer" ? ", scales with depth" : ""));
            }
          } catch (e3) { }
          out.push("👹 Boss — " + bits.join(" · ") + ". Needs no weapon for its arts (claws/fangs/storm are the weapon). Enrages below 35% HP (+35% ATK/MATK, faster tricks).");
        } catch (e2) { out.push("👹 Boss — enrages below 35% HP (+35% ATK/MATK)."); }
        if (BOSS_TRICKS[kind]) out.push("🎲 Trick: " + BOSS_TRICKS[kind] + ".");
        if (((window.CFG.ANCIENT_KINDS || [])).indexOf(kind) >= 0) out.push("🏛️ Ancient — deep-floor horror (eff 8+), never an early delve.");
      }
      // mimics (live tiers)
      try {
        if (window.Game && window.Game.isMimicKind && window.Game.isMimicKind(kind)) {
          let info = null;
          try { info = window.Game.mimicInfoFor(kind); } catch (e2) { info = null; }
          const b = info && info.bite != null ? Math.round(info.bite * 100) : "?";
          const tr = info && info.trick != null ? Math.round(info.trick * 100) : "?";
          const st = info && info.stun != null ? info.stun : "?";
          out.push("🦷 Mimic — E on the closed chest: unavoidable " + b + "% max-HP bite + " + st + "s stun, then it fights with %" + " per-hit hunger (" + tr + "% of YOUR max HP per landed bite; dodge avoids, armor can't reduce). Strike the chest first (melee/arrow/spell/AoE/bomb) to expose it instead: no bite, no stun, your damage carries over and it fights with plain normal damage.");
        }
      } catch (e2) { }
      if (kind === "portal_devourer") out.push("🌀 Lying gate — wears the way-down portal (~18% of delves). E on the unrevealed portal: 35% bite + 4s stun + boss; strike it first for no bite/stun (damage carries); the real portal opens behind the teeth either way. Also wakes as a second boss beside the delve lord on ~15% of surface floors (any floor).");
      if (kind === "voidstalker") out.push("👁️ Stalker — invisible and immune while hidden (hits read VOID). Surfaces for one swipe, sometimes streaks past as a visible flyby you can hit if quick. Near the way-down portal it drops the act: 22% max-HP backstab from behind (unavoidable), then an open fight, blinking unseen only to dodge (hiding there burns mana fast). Leave the portal and it melts back into stalking.");
      if (kind === "leviathan") out.push("🐋 Deep horror — breeds abyss-tentacles in nearby water (~every 10s, up to 4) and, while surfaced, hurls tidebursts at a RANDOM nearby foe every few seconds even mid-prowl — and rides the Tidal Wave itself. Every ~30s it drowns a large disc of the dungeon around itself and dives under it. Always rules a sunken-lake drowned deep.");
      // v16 hell fiends: unique mechanics (see game.js hellMobTick + bossTick).
      if (kind === "hell_beast") out.push("🔥 Hell frenzy — below 35% HP hits 35% harder and 20% faster. Hunt hell's wastes in packs.");
      if (kind === "succubus") out.push("💋 Charm drain — every ~6s sips MP + stamina off a close hero; sleeping in hell at night risks an ambush (HP/MP/stamina drained, then a real fight).");
      if (kind === "doom_lord") out.push("💀 Doom call — every ~14s summons a hell hound when its pack thins (max 4).");
      if (kind === "infernal") out.push("🌋 Fire aura — standing within ~3.5 tiles burns (2% max HP/s). Lava-born: walks magma.");
      if (kind === "hell_hound") out.push("🐺 Hell pack — fast pursuit predator of the ash wastes. Tamable.");
      if (kind === "civilized_succubus" || kind === "civilized_hellbeast" || kind === "civilized_infernal" || kind === "civilized_doom") out.push("😈 Civilized demon — hell townsfolk. Trades, chats and recruits like any NPC. Burns like the undead: holy, silver, dawnstone and Smite bite it.");
      try {
        if (T && T.demon && !isBoss) out.push("😈 Demon — hell-fiend. Holy, silver, dawnstone and Smite bite it like the undead (but it never grave-hungers).");
      } catch (eD) { }
      // v19 heaven serenes: gentle celestials + dawnstone-bearing overworld bosses.
      try {
        if (T && T.heavenBoss) out.push("🌅 Heaven overworld boss — passive until struck repeatedly (two warnings, then it turns). Every kill pays 2-3 dawnstone shards + a dawnstone prize (sometimes the Daybreak legend). Raid the corpse (E). Dawnstone gear is never shelved, never forged from anything else, never in chests.");
        else if (T && T.heavenMech === "serene") out.push("🌅 Serene — gentle heaven celestial, passive unless struck repeatedly. While calm it mends you (status first, then low HP).");
      } catch (eHV) { }
      // v17 hell wild mechs (live hellMech tag; see game.js hellMobTick).
      try {
        const hm = (T && T.hellMech) || null;
        if (hm === "leech") out.push("🩸 Leech — every few seconds sips HP off a close foe to heal itself.");
        else if (hm === "blink") out.push("✨ Blink — teleports short range every few seconds, loves your back.");
        else if (hm === "thorns") out.push("🌵 Barbed hide — melee attackers bleed back a share of the blow.");
        else if (hm === "split") out.push("✂️ Fission — below half HP tears itself in two (each half a real fight).");
        else if (hm === "warcry") out.push("📯 Warcry — drums itself and nearby fiends into stacking attack fury.");
        else if (hm === "summon") out.push("➕ Broodmother — calls its own lesser kind to the fight on a timer.");
        else if (hm === "charm") out.push("💋 Beguile — dazes and drains (MP/stamina sip); keep your distance.");
        else if (hm === "aura") out.push("🔥 Burning aura — standing close cooks you (damage per second).");
        else if (hm === "frenzy") out.push("😡 Frenzy — below 35% HP hits harder and faster. Finish it fast.");
        else if (hm === "burrow") out.push("🕳️ Burrower — tunnels where you can't hit it, bursts out under prey.");
        else if (hm === "guard") out.push("🛡️ Demon Warden — passive boss-tier settlement guard. It will NOT attack unless struck — leave it alone and it leaves you alone.");
      } catch (e2) { }
      // divers + burrowers (live DIVE timings)
      try {
        if (T.diver) {
          let sMin = 8, sMax = 14, dMin = 6, dMax = 12;
          try { const D = window.CFG.DIVE || {}; if (D.SURFACE_MIN != null) sMin = D.SURFACE_MIN; if (D.SURFACE_MAX != null) sMax = D.SURFACE_MAX; if (D.DIVE_MIN != null) dMin = D.DIVE_MIN; if (D.DIVE_MAX != null) dMax = D.DIVE_MAX; } catch (e2) { }
          const med = T.burrower ? "solid ground (never water or magma)" : (T.lavaBorn ? "magma" : "water");
          const who = T.burrower ? "Burrower" : "Diver";
          let diveNote = "🌊 " + who + " — surfaces " + sMin + "-" + sMax + "s (fightable), submerged " + dMin + "-" + dMax + "s (glides toward prey, untargetable: melee, arrows, spells, AoEs and Deep Arts all skip it). Hides only in " + med + "; dragged out of its medium it breaches at once.";
          if (T.burrower) diveNote += " Burrow moles burst out spinning whirlwind.";
          out.push(diveNote);
        } else if (T.burrower) {
          out.push("🕳️ Burrower — tunnels through soil where you can't hit it, then bursts out under its prey.");
        }
      } catch (e2) { }
      if (T.aquatic && !T.diver) out.push("🏊 Aquatic — swims (water is walkable).");
      if (T.lavaBorn && !T.diver) out.push("🌋 Lava-born — walks magma.");
      if (T.undead && !isBoss) out.push("🪦 Grave hunger — every landed direct hit has a 10% chance to drag another of itself out of the dark (same kind, ~±1 lv, adjacent, hostile; summoned ones split too). Bosses never split.");
      if (T.archer) out.push("🏹 Archer — shoots arrows from range.");
      // taming gates (apex ancients first — their rule overrides everything)
      try {
        const TAM = (window.CFG && window.CFG.TAMING) || {};
        const IN = TAM.INSECT_KINDS || [], AN = TAM.ANIMAL_KINDS || [];
        const AX = TAM.APEX_TAME_KINDS || ["peak_dragon", "frostwyrm", "mire_hydra", "tempest_roc", "prism_colossus", "umbral_wyrm"];
        if (AX.indexOf(kind) >= 0) out.push("👑 Apex ancient — only a FULLY maxed 🐾 Taming tree (every node at max) can earn its trust, and even then only 1 in 20 beaten ancients ever asks (submit 0-25% HP, E within 45s). Overshooting the point kills it.");
        else if (isBoss) out.push("🚫 Never submits — bosses can't be tamed.");
        else if (T.tamable) out.push("💛 Tamable by any hero — weaken it to its submit point (each beast rolls 0-25% HP; Beastfriend widens it) and press E (45s offer, holds still). Ring of Mercy helps (leaves 1 HP). Overshooting the point kills it.");
        else if (IN.indexOf(kind) >= 0) out.push("🐛 Insect — needs Vermin Lore (Taming tree) before it can submit.");
        else if (AN.indexOf(kind) >= 0) out.push("🐾 Wild beast — needs Broad Kinship (needs Vermin Lore first) before it can submit.");
      } catch (e2) { }
      if (T.mount) {
        try {
          const m = T.mount;
          const bits = [];
          if (m.speed) bits.push("x" + m.speed + " speed");
          if (m.swim) bits.push("swims");
          if (m.lava) bits.push("lava-proof");
          out.push("🐴 Mount — rideable" + (bits.length ? " (" + bits.join(", ") + ")" : "") + ".");
        } catch (e2) { out.push("🐴 Mount — rideable."); }
      }
      if (T.docile) out.push("🕊️ Docile — won't start fights.");
      if (kind === "bandit" || kind === "outlaw" || kind === "murderer") out.push("🗡️ Brigand — hostile to you, your party AND villagers (guards intervene); never spawns near towns.");
      // overworld apex ancients: lair + warning aura
      try {
        const SIG = (window.CFG && window.CFG.APEX_SIGNATURE) || {};
        const AU = (window.CFG && window.CFG.APEX_AURA) || {};
        const homes = Object.keys(SIG).filter(b => SIG[b] === kind);
        const aura = AU[kind] || (kind === "peak_dragon" ? AU.peak_dragon : null);
        if (homes.length && aura) {
          const pretty = homes.map(h => String(h).replace(/_/g, " ")).join(" + ");
          out.push("👑 Apex lair — lv-70 ancient roosts in " + pretty + " (signature of those highlands; nothing else overworld passes 50). Its " + (aura.label || "aura") + " warns you off ~18 tiles out: slow max-HP drain + outward shove + clouded vision. Turn back or press on." + (kind === "peak_dragon" ? " In volcano calderas it wears cinderwind instead of hail." : "") + " Taming one demands a FULLY maxed 🐾 Taming tree — and even then only 1 in 20 beaten ancients ever asks.");
        }
      } catch (e2) { }
      if (T.tint && T.body === "ghost" && T.undead) { /* flavor covered by tables */ }
      if (!out.length) return "";
      return "<div class='cdxlvrow' style='margin-bottom:0'>Special</div><div class='cdxdesc'>" + out.map(esc).join("<br>") + "</div>";
    } catch (e) { return ""; }
  }
  // ---------- formulas tab (explicit damage math + when it skips) ----------
  function guideList() {
    return [
      { id: "g_melee", icon: "", name: "Melee damage", sub: "strike pipeline + weapon triangle" },
      { id: "g_spell", icon: "", name: "Spell damage + costs", sub: "ability power + MP / stamina costs" },
      { id: "g_bow", icon: "", name: "Bow damage", sub: "bow + arrow + tree scaling" },
      { id: "g_mitig", icon: "", name: "Mitigation order", sub: "dealDamage gates, Dodge → ward" },
      { id: "g_boss", icon: "", name: "Bosses: ward + enrage", sub: "caps, frail, weak, tricks" },
      { id: "g_mimic", icon: "", name: "Mimics + lying gate", sub: "tiers, bite/stun/hunger, expose" },
    { id: "g_dive", icon: "🌊", name: "Divers + voidstalker", sub: "dive cycle, stalk loop" },
      { id: "g_traits", icon: "✨", name: "Mob traits", sub: "taming, archer, split, docile…" },
      { id: "g_world", icon: "", name: "Highlands + lair auras", sub: "where the lv-70 ancients roost" },
      { id: "g_hero", icon: "", name: "Hero stats + regen", sub: "attributes, derived body, regen" },
      { id: "g_xp", icon: "", name: "Leveling + XP", sub: "XP curve, stat points, practice" },
      { id: "g_hell", icon: "", name: "Hell dimension", sub: "fragments, sphere, towers, fiends" },
      { id: "g_heaven", icon: "", name: "Heaven dimension", sub: "sphere, hearths, serenes, pantheon" },
  ];
  }
  function guideDetail(e) {
    const big = "";
    const head = (t) => "<h4>" + esc(t) + "</h4>";
    const note = (t) => "<div class='cdxnote'>" + t + "</div>";
    const li = (a) => "<ul style='margin:4px 0 8px 0;padding-left:20px;font-size:12px;line-height:1.5'>" + a.map(x => "<li>" + x + "</li>").join("") + "</ul>";
    const code = (t) => "<div class='cdxdesc' style='font-family:monospace;white-space:pre-wrap'>" + esc(t) + "</div>";
    switch (e && e.id) {
      case "g_melee":
        return big + head("Melee — strike / whirlwind pipeline") +
          "<div class='cdxsub'>ATK weapon · DEF mitigation · triangle</div>" +
          code("1) combatAtk = round(atk + NPCgear - strPenalty*1.5), min 1\n   (strPenalty lowers it while paralyzed/weakened)\n2) strikeDmg = round((atk*1.25*STRmult*ring(physical)\n   - targetDEF*0.55) * variance[0.9-1.1]), min 1\n   STRmult (hero only) = 1 + 0.01*(STR-5)\n3) strike/whirlwind only: x meleeMult\n   = (unholy? undeadMult : tierMult)\n   x dmgTypeMult(blade/pierce/blunt/lash vs kind)\n   x famDmgMult (swing-speed equalizer + slow bonus:\n     dagger 1.4591, sword/whip 1.9802, axe 2.345,\n     spear 2.6055, hammer 2.8661, bow 1.0,\n     wand 1.0526, staff 1.1842)\n   x ringMult(weapon element or physical)\n   x 1.25 if smite weapon vs unholy\n4) x weaponMeleeMult (skill trees) x techniqueStrikeMult\n   (Backstab 3x/3.5x halved vs bosses; Deadeye / Skirmisher /\n   Sentinel / Executioner 2x/2.5x when their condition holds;\n   Might +12%/rank; Apex x1.25; warcry x1.3; crack x1.3;\n   blessed x1.25; hone x1.1; rouse x1.05)\n   + Charm aura (party/tames +5 ATK per CHA via combatAtk)\n   + Usaghito Charm voice (hero/allies/party/tames/self +1 per singer CHA), clones x50%\n5) dealDamage gates (see Mitigation order)") +
          li(["Triangle lives in step 3 — it does <b>not</b> apply to bows, thrown weapons, pure spells, or physical Deep Arts (they never enter meleeMult). Whirlwind <b>does</b> use it.", "Silver and dawnstone bite in the tier slot (5x vs undead and demons); smite bites twice (weapon 1.25x here, spell power 2.5x in step 2 of Spells). Dawnstone garb wards the wearer (30% less damage from undead and demons).", "Unarmed = blunt 1.0x tier, 1.6 range. Wands poke pierce, staves crush blunt."]) +
          note("Keys: ATK/MATK/DEF/SDEF/XP roll per spawn (HP/MP/ATK ±8-10%, DEF/SDEF ±1, SPD ±0.2, XP ±10%).");
      case "g_spell":
        {
        let costEx = "";
        try {
          costEx = "e.g. Fireball " + spellCostStr("fireball") + "; Cinder Edge " + techCostStr("cinder_edge") + " (" + techFallbackStr("cinder_edge") + ")";
        } catch (e2) { costEx = ""; }
        return big + head("Spells + Deep Arts pipeline") +
          "<div class='cdxsub'>MATK vs ATK · DEF vs SDEF · elemental table</div>" +
          code("COSTS (paid on cast; fizzled casts refund it):\n  spell MP = round(base x (1 - 0.1 x efficiency) x wand)\n  art stamina = round(base x (1 - 0.1 x efficiency) x wand x 1.5)\n  (stamina-less allies pay the art's discounted base as MP)\n  " + costEx + "\n  cooldown = base x (1 - 0.08 x surge) x mastery 0.8\n  (Quicken shortens while a wand is wielded)\n\nDAMAGE:\nbase = MATK for pure spells,\n       ATK for strike/whirlwind/bowshot + ALL Deep Arts\nbase fallback: atk if matk missing; atkUp buff x1.3\npower = ability.power (Smite x2.5 vs unholy)\nraw = base x power x spellPowerMult\nspellPowerMult = (1 + 0.15*potency + 0.08*surge)\n  x (STRmult if physical/art else INTmult; hero only,\n     +1%/pt over 5) x wand/staff trees x staffPower\n  x ringMult(element) x holy vestments 1.25 / archmage 1.1\nmit = tdef*0.55, tdef = DEF if physical/art else SDEF\n   (mobs without sdef fall back to DEF; old saves too)\ndmg = round((raw - mit) * variance[0.9-1.1]), min 1\nthen combatDmg adds: techniqueStrikeMult for Deep Arts,\n  Charm aura (party/tames +5 MATK per CHA via combatMatk)\n  + Usaghito Charm voice (hero/allies/party/tames/self +1 per singer CHA), clones x50%\nthen dealDamage (element table for el != physical,\n  boss weak +10%, mimic %, parry, mercy…)") +
          li(["<b>Spell MP costs are final:</b> round(base x (1 − 0.1 x Efficiency) x wand) — Efficiency −10%/rank and wand discounts apply to the listed base. Every spell entry shows its live cost (base + your discounts).", "<b>Deep Arts cost 1.5x stamina:</b> round(base x (1 − 0.1 x Efficiency) x wand x <b>1.5</b>) — paid in ⚡, not MP. Every Deep Art entry shows its live stamina cost (base x1.5 + your discounts); the hotbar, 🎒 Inventory and skill trees show the same live number.", "<b>Stamina-less allies</b> (NPCs/allies with no stamina pool) pay the art's discounted base as MP instead — Deep Arts keep working in monster and ally hands.", "Deep Arts ride <b>ATK/DEF</b> even when they look magical (holy_sword, cinder_edge, avalanche hammer…). Only pure spells ride MATK/SDEF.", "Element table (fire/water/ice/electric/holy/nature) multiplies in dealDamage for el != physical — physical spells skip it (their triangle already ran for strike/whirlwind; bows/thrown keep element from arrow/bomb).", "Rings match the spell element (1.5x); staves: only the FIRST staff in hotbar order counts; wands cut mana the same way.", "Borrowed arts hit soft in monster hands: wild-mob Deep Arts land at 30% (techArtMult) — party members and tames deal full power. Bosses cast bare-handed (exempt from the wield check) but draw band war-gear like everyone: low warlords steel, mid+ warlords dragonbone, plus plate (robes for casters) — basic strikes ride the steel, and mob bows fire infinite arrows."]) +
          note("Fizzled Deep Arts refund the stamina. Eject is free (no MP, no stamina). Cooldowns x (1 − 0.08 x Surge), Mastery x0.8.");
        }
      case "g_bow":
        return big + head("Bows — arrow damage") +
          "<div class='cdxsub'>ATK vehicle · arrow element · no weapon triangle</div>" +
          code("bowAtk = bow bonus ATK; bpower = bow power; arrowPower\nab.power = 2.2 x arrowPower x bpower (LINEAR in bow ATK)\nmult = arrowPower x bpower x spellPowerMult(bowshot)\n  x bowMult (bow power + ring(element)) x treeBow\nraw = (atk+bowAtk) x ab.power x mult x treeBow / bpower\n  + Charm ATK in atk (party/tames +5 per CHA, + Usaghito voice +1 per singer CHA), variance[0.9-1.1], round, min 1\non hit: x techniqueStrikeMult (bowshot arts),\n  x Deadeye far (2x/2.5x) / Skirmisher close,\n  then dealDamage with el = arrow element\n  (or bow element, else physical)") +
          li(["Bows never touch dmgTypeMult — their matchup is the <b>arrow element</b> (cinder = fire, frost = ice + slow, poison = water) via the spell table.", "Enchanted bows carry their own bite (frostfang freezes…), one proc per cooldown window.", "Shurikens/thrown: same idea (best star hurled, consumed), fam thrown, element from the star; comet/slime arts ride the bow tree."]) +
          note("Arrow tiers scale arrowPower — iron 1.0, steel 1.3, silver 1.5, mythril 1.8, dragonbone 2.2, oblivion 2.8, dawnstone 3.1. Shurikens run 1.0/1.4/1.6/2.0/2.6/3.2/3.6 across the same ladder (oblivion 3.2, dawnstone 3.6).");
      case "g_mitig":
        return big + head("Mitigation order (dealDamage)") +
          "<div class='cdxsub'>every landed blow runs these gates in order</div>" +
          li(["<b>0. Immunity:</b> corpse/0 HP; <b>submerged</b> divers (0, no number); <b>VOID</b> hidden voidstalker; allies (both ways); tame-offer holds AI fire (heroes still hit); remote proxies route; <b>walls</b> block melee/AoE/Deep Arts/splash (projectiles die on walls) unless allowThroughWall (skyfire) or status tick.", "<b>1. Dodge</b> (hero ONLY: LUK +0.5%/pt, capped at 95% total, + dagger Fleetfoot / unarmed Focus; paralyze −5%) → MISS, no damage. <b>1b. Blind miss</b> (any blinded attacker, 20%): MISS, no damage (status ticks never miss).", "<b>2. Crit roll</b> (hero ONLY: 5% + 2%/LUK; Backstab Opening adds; weaponCritBonus). Breaks stealth (single-use unseen).", "<b>3. DEF/SDEF:</b> magic ? SDEF : DEF; shieldwall x1.8. dmg = amount − def x 0.4 (opts.pierce skips, e.g. crescent).", "<b>4. Armor:</b> plate/leather/kasaya cut physical, robes/habitus cut magic (cap 65%); sundered armor resists half (Juggernaut hammer).", "<b>5. Element:</b> x elemMult <b>only if el != physical</b> (melee triangle already ran — applying both would double-count).", "<b>6. Crit:</b> x1.8 (+10%/LUK over 5).", "<b>7. Boss:</b> weak element +10%; every single hit lands in full (no ward cap).", "<b>8. Mimic hunger:</b> tricked mimics overwrite with tier % of YOUR max HP (lesser 6%, classic 10%, greater 12%, devourer 15%, threshold 12%) — dodge still avoids, armor can't reduce; exposed mimics deal plain damage.", "<b>9. Parry</b> (hero + bosses, real hits only) → <b>Mercy</b> (ring leaves 1 HP) → subtract HP → log 30 recent hero hits → <b>undead split 10%</b> (direct hits, non-boss undead; summoned ones split too) → status application → kill/tame-offer/retaliation.", "<b>Status ticks</b> (poison/burn/…) skip walls, mimic %, and parry — everything else still applies."]) +
          note("No level-based resists and no per-hit caps anywhere: pure stats + the gates above.");
      case "g_boss":
        return big + head("Bosses: ward, frail, weak, enrage") +
          "<div class='cdxsub'>scaled bulk + capped single hits + tricks</div>" +
          li(["<b>Bulk by unlock tier (v251 experiment):</b> HP x12.5 (t1) / x16 (t2) / x40–48 (mid t3–4) / x55–60 (high t5–6) / x20–22 (hell t8–11) / x50 (Peter + goddess t12) over template HP (hell + heaven boss templates halved); DEF x2.5 low / x3.0 mid-high-hell / x3.4 Peter-goddess; ATK/MATK x(1+0.08t), MP x(1+0.15t), t = tier − 1; XP x(1+0.25t). SDEF = DEF x0.85 (spell-frail) or x1.15 (blade-frail). Weak element +10%. <b>Growth is tiered too:</b> low tiers barely compound with level, mid climbs, high climbs harder, hell harder still, Peter/goddess steepest — same level, higher tier pulls away.", "<b>Arsenal (tiered by depth):</b> hedge T1 (eff1) → +battle T2 (eff2-3) → +war T3 (eff4) → +cataclysm T4 (eff5-6). The movepool is uncapped; each spawn draws up to 12 with at least 3 of its highest-tier spells (shortfall cascades a tier down) plus at least 2 Deep Arts (a thin Deep Art pool substitutes another high-tier spell). Signatures + heal/panacea always stay (Peter keeps no self-heal); the lying gate tiers by spawn level. Bosses need no weapon for Deep Arts.", "<b>Enrage below 35% HP:</b> +35% ATK/MATK, faster tricks (bossT/T2 shortened; voidstalker stalk 1s; leviathan tent 3s/bolt 2s).", "<b>Tricks:</b> every warlord has one — see its Codex entry (🎲 Trick line): adds, novas, blinks, charges, gazes, storms, songs. Insect royals (broodmother/queen/emperor) run spells + enrage with no unique trick."]) +
          note("Boss kind keys + unlock depths live on each boss entry (Special line). Reopen the Codex after balance edits.");
      case "g_mimic": {
        let tiers = "lesser 20%/6%/2s · classic 30%/10%/3s · greater 35%/12%/3s · devourer 40%/15%/4s · threshold 35%/12%/4s";
        try {
          const g = window.Game;
          if (g && g.mimicInfoFor) {
            const ks = ["lesser_mimic", "mimic", "greater_mimic", "mimic_devourer", "portal_devourer"];
            tiers = ks.map(k => { const i = g.mimicInfoFor(k); return k + " " + Math.round(i.bite * 100) + "%/" + Math.round(i.trick * 100) + "%/" + i.stun + "s"; }).join(" · ");
          }
        } catch (e2) { }
        return big + head("Mimics + the lying gate") +
          "<div class='cdxsub'>~22% of dungeon chests (15% of vault caches; never sealed deep vaults)</div>" +
          li(["<b>Live tiers (bite / hunger-per-hit / stun):</b> " + tiers + ". Vault caches hunger one step up; deeper delves hunger bigger.", "<b>Tricked (E on closed chest):</b> chest consumed, tier mob spawns adjacent and aggros (+party piles on), opener takes the tier's max-HP bite (unavoidable) + stun. Only trickery stuns.", "<b>Exposed (hit it first):</b> melee/arrow/spell/AoE/bomb reveals it — NO bite, NO stun, your damage carries to the teeth, and it (mimicExposed, never mimicTricked) fights with plain normal damage.", "<b>Hunger:</b> tricked mimics chew tier % of victim max HP per landed hit (dodge avoids, armor can't blunt).", "<b>Threshold Devourer:</b> ~18% of delves lie about the way down (portal_devourer). E: 35% bite + 4s stun + boss; strike first: no bite/stun, damage carries, same boss, normal damage. The real 🌀 portal opens behind the teeth either way; the delve lord still spawns (mimics never replace it)."]) +
          note("Old boolean-save mimics read as classic. Dungeon-backfilled once per delve on entry.");
      }
      case "g_dive": {
        let dive = "surface 8-14s / dive 6-12s";
        try { const D = (window.CFG && window.CFG.DIVE) || {}; dive = "surface " + D.SURFACE_MIN + "-" + D.SURFACE_MAX + "s / dive " + D.DIVE_MIN + "-" + D.DIVE_MAX + "s"; } catch (e2) { }
        return big + head("Divers, burrowers + the Voidstalker") +
          "<div class='cdxsub'>untargetable hiding + the hunt that owns its frame</div>" +
          li(["<b>Dive cycle (" + dive + "):</b> surfaced = fightable; submerged = glides toward prey but can't be hit AND can't hit (melee, arrows, spells, AoEs, Deep Arts all skip it).", "<b>Mediums:</b> aquatics need water, lava-born need magma, <b>burrowers need solid ground</b> (moles/siege ants: never water or magma). Dragged out of medium while hidden → breaches at once (beached kelpie, mole lured to shallows).", "<b>Burrow moles</b> roam forests/plains/wilds, tunnel where you can't hit them (fresh-diggings mound), then burst out spinning whirlwind. Can't burrow through water/magma.", "<b>Voidstalker (boss):</b> never camps the portal — stalks the floor invisible and IMMUNE (hits read VOID), surfaces for one swipe, sometimes streaks past as a hittable flyby. Near the way down: 22% max-HP backstab from behind (unavoidable, routes to co-delvers), then an open fight that blinks unseen only to dodge (hiding there burns 30%/s mana). Leave the portal and it melts back into stalking. Enrage only shortens its stalk."]) +
          note("Projectiles arc over dungeon liquids (water/lava/blood). Divers spawn inside matching lake tiles.");
      }
      case "g_traits":
        return big + head("Mob traits primer") +
          "<div class='cdxsub'>what the flags on each entry mean</div>" +
          li(["<b>undead</b> — silver/dawnstone 5x, Smite 2.5x power, holy table up to 1.35-1.4x, dawnstone garb wards 30%, grave hunger: 10% per landed direct hit summons another (same kind ±1 lv; bosses exempt).", "<b>demon</b> — hell fiends, hell bosses and civilized demons burn like the undead (silver/dawnstone, Smite 2.5x, holy 1.35x, dawnstone garb wards 30%) but never grave-hunger.", "<b>archer</b> — shoots arrows (its shots ride bow damage).", "<b>tamable</b> — any hero can work it (submit 0-25% HP, E within 45s). <b>Insects</b> (tarantula/scorpion/ant/hornet/swarms/beetle/gloomspinner) need Vermin Lore; <b>wild animals</b> (wolves-to-wyverns list) need Broad Kinship (needs Vermin first). Warlords NEVER submit; 👑 <b>apex ancients</b> (Peak Dragon, Frostwyrm, Mire Hydra, Tempest Roc, Prism Colossus, Umbral Wyrm) submit ONLY for a fully maxed Taming tree (every node maxed) — and even then only 1 in 20 beaten ancients ever asks. Over-level submits are refused.", "<b>power bands (non-boss)</b> — seasoned killers (template XP 100+) spawn with war-magic (tornado) + a fight art; apex horrors (XP 150+) spawn with a thematic cataclysm + a deeper art. Art-wielders spawn carrying the art's matching tiered weapon (higher spawns carry higher tiers); bosses need no weapon. Mimics are exempt (their teeth are the threat).", "<b>mount (/swim /lava)</b> — rideable; speed/swim/lava cross their liquid. <b>docile</b> — won't start fights. <b>aquatic / lava-born</b> — water/magma walkable (divers hide there).", "<b>human foes</b> (bandit/outlaw/murderer) — hostile to you, party AND villagers (guards intervene); never spawn near towns; gated by distance (60/100/140).", "<b>ANCIENT</b> — deep-floor horror (eff 8+, theme-matched first). <b>archer/tamable/mount</b> stack (e.g. kelpie: tamable mount that dives).", "<b>👑 Apex lair</b> — lv-70 ancients (Peak Dragon, Frostwyrm, Mire Hydra, Tempest Roc, Prism Colossus, Umbral Wyrm) roost only in the seven highlands; each lair's weather (hail, whiteout, miasma, stormwall, soul-glare, voidchill, cinderwind) warns ~18 tiles out with drain + shove + clouded vision. See each mob's Special line."]) +
          note("Levels: overworld caps at 50 (apex ancients sit at 70 with mid-tier-boss bodies); delves scale with effective depth (tier + floors). Surface defenders cap at lv35 in holdings (warlords lv30-35); hell holdings muster lv60-80 with lv74-80 warlords. The seven highlands run ~40-46: mountain, volcano, frostcrown, blightmire, stormcrag, crystal scar, umbral waste.");
      case "g_world": {
        let rows = null;
        try {
          const SIG = (window.CFG && window.CFG.APEX_SIGNATURE) || {};
          const AU = (window.CFG && window.CFG.APEX_AURA) || {};
          const T = (window.CFG && window.CFG.MOB_TEMPLATES) || {};
          rows = Object.keys(SIG).map(b => {
            const k = SIG[b];
            const a = AU[k] || {};
            const nm = (T[k] && T[k].name) || k;
            const extra = (b === "volcano" && AU.caldera_ember) ? " (🔥 " + AU.caldera_ember.label + " in the caldera)" : "";
            return "<b>" + esc(String(b).replace(/_/g, " ")) + "</b> — " + esc(nm) + " lv70, " + esc(a.label || "lair aura") + " r" + (a.radius || 18) + esc(extra);
          });
        } catch (e2) { rows = null; }
        return big + head("Highlands + lair auras") +
          "<div class='cdxsub'>seven high-level wilds, one ancient each</div>" +
          li(["<b>Seven highlands</b> (overworld curve ~40-46, cap 50 — everything past 50 lives in delves or lairs): mountain (d>210) · volcano (d>260) · frostcrown (d>270) · blightmire (d>285) · stormcrag (d>300) · crystal scar (d>320) · umbral waste (d>340). Blobs are wide on purpose — these read as regions, not speckles.", "<b>One ancient each, lv70</b> (65% of that highland's rare rolls; nothing else overworld passes 50): Peak Dragon (mountain + volcano) · Frostwyrm · Mire Hydra · Tempest Roc · Prism Colossus · Umbral Wyrm. Mid-tier-boss bodies via per-instance bulk.", "<b>Lair weather warns ~18 tiles out</b>: slow max-HP drain (status tick — walls/wards never blunt it) + an outward shove that strengthens inside + a vision-clouding haze. The toast on entry is the choice: turn back or press on.", "<b>Old ground is redrawn</b>: pre-v14 saves keep the hero and wipe the terrain (chunks + delves), so the new highlands bake in clean."]) +
          (rows && rows.length ? li(rows) : "") +
          note("Frostwood and yggdrasil never chop \u2014 delve floor 5+ / 11+ finds only. Frostcrown pines chop like tundra pines. Mire hydras dive their bog pools. All six ancients (even the Peak Dragon) CAN submit — but only for a hero with a FULLY maxed 🐾 Taming tree, and only 1 in 20 beaten ancients ever asks.");
      }
      case "g_hero": {
        let rows = [];
        try {
          const S = (window.CFG && window.CFG.STATS) || {};
          const order = ["str", "end", "agi", "int", "cha", "luk", "for"];
          rows = order.filter(k => S[k]).map(k => "<b>" + esc(S[k].name || k) + ":</b> " + esc(S[k].desc || ""));
        } catch (e2) { rows = []; }
        let rates = "";
        try {
          const E = window.Entities || {};
          const at = (fn, st) => { try { return fn({ kind: "player", stats: st }); } catch (e3) { return "?"; } };
          const rS = at(E.staminaRegenBonus, { str: 5, end: 6, agi: 5, int: 5, cha: 5, luk: 5, for: 5 });
          const rH = at(E.hpRegenBonus, { str: 5, end: 5, agi: 5, int: 5, cha: 5, luk: 5, for: 6 });
          const rM = at(E.mpRegenBonus, { str: 5, end: 5, agi: 5, int: 6, cha: 5, luk: 5, for: 5 });
          rates = "live per-point rates: stamina +" + rS + "/s/END, HP +" + rH + "/s/FOR, MP +" + rM + "/s/INT";
        } catch (e2) { }
        return big + head("Hero stats + regen") +
          "<div class='cdxsub'>attributes drive the body · levels grant points, never stats</div>" +
          (rows.length ? li(rows) : "") +
          code("regen (5/s base, stat bonuses stack on top):\n  stamina/s = 5 + ENDrate x max(0, END-5)\n  HP/s      = 5 + FORrate x max(0, FOR-5)\n  MP/s      = 5 + INTrate x max(0, INT-5)\n" + rates + "\nsprinting drains 12 stamina/s; regen resumes 0.6s after effort") +
          li(["<b>Derived body (flat, no level term):</b> maxHP 40 + 10 per FOR over 5; maxMP 20 + 10 per INT over 5; ATK 8 + 10 per STR over 5; MATK 8 + 10 per INT over 5; DEF 3 + 10 per END over 5; SDEF 3 + 10 per FOR over 5; SPD 3.4 + 0.05 per AGI over 5; max stamina 100 + 10 per END over 5 — plus gear on top.", "<b>Every hero regens 5/s of each</b> — a fresh hero recovers stamina, HP and MP without spending a point; Endurance, Fortitude and Intellect push each trickle higher.", "<b>Levels grant points, not stats:</b> each level-up pays stat points to spend in the Character panel (C) — the points do the work, never the level number."]) +
          note("Sleeping, eating and healer NPCs heal directly — none of it runs through regen.");
      }
      case "g_xp": {
        let src = "", table = "";
        try {
          const xf = window.CFG && window.CFG.xpNext;
          src = (typeof xf === "function") ? String(xf) : "?";
          table = [1, 2, 3, 4, 5, 10, 20, 30, 50, 70, 100].map(lv => "lv " + lv + ": " + xf(lv) + " XP").join("\n");
        } catch (e2) { }
        let pts = 3, share = 0.6;
        try { pts = window.CFG.STAT_POINTS_PER_LEVEL || 3; } catch (e2) { }
        try { share = window.CFG.XP_SHARE; } catch (e2) { }
        return big + head("Leveling + XP") +
          "<div class='cdxsub'>XP to next level · what levels give</div>" +
          code("xpNext(lv) = " + src + "\n\n" + table) +
          li(["<b>Each level-up pays " + pts + " stat points</b> (spend in the Character panel, C) plus a small HP/MP refill — combat numbers come from attributes + gear only, never from the level number itself.", "<b>Skill points come from practice, not levels:</b> weapon trees earn by landed hits, spell/Deep Art trees by casts, Parrying/Shieldwork by parries — points never cross trees.", "<b>Guard shells earn their own points:</b> armor and robes by hits taken (12 each), kasaya by landed physical hits (25), habitus by landed spell hits (15) — wear the shell that feeds the tree.", "<b>New spells come from spellbooks only</b> (chests, dungeons, bosses); Deep Arts are learnt by deeds (tracked hits/kills/casts).", "<b>Party + NPCs ride the same curve</b> (non-player cap lv100): active party members take a " + share + "x XP share; downed allies earn nothing."]) +
          note("XP rewards scale with level, distance and depth — so points keep flowing even as the curve steepens.");
      }
      case "g_heaven": {
        return big + head("Heaven dimension") +
          "<div class='cdxsub'>sphere · hearths · serenes · pantheon · mock battle</div>" +
          li(["<b>Heavenly Sphere:</b> the goddess presses it into your hand when she carries you home after Peter falls. From then on every SURFACE hearth offers <b>Step into heaven</b> — same coordinates, dawn side (the sphere itself is the key: no sphere in hand, no ascent — the way back down is always open); every heaven hearth offers the way back. A fallen overworld boss sometimes looses a spare sphere — 🎁 Give / ⚖️ Trade it to a hero who missed Peter's fall.", "<b>Ground:</b> walkable cloud everywhere, lakes/reservoirs as water, grass+tree islands (meadows/groves), hearths with angels + heavendwellers. No dungeons. Practice worlds ride free (Surface/Hell/Heaven buttons).", "<b>Serenes (mobs + overworld bosses):</b> 12 wild celestials + Divine Dragon, Celestial Messenger, Reservoir Leviathan, Seraph Regent — all passive unless struck repeatedly. The four overworld bosses are the <b>ONLY dawnstone source</b>: every kill pays 2-3 dawnstone shards plus a dawnstone prize (sometimes the Daybreak legend). The first two hits earn a warning flash; the third turns them. While calm they drift like grazers and mend you (status first, then low HP, per-mob cooldown). Garrison-mates never fight each other.", "<b>Angels:</b> high-level civilized NPCs (dawn/choir/seraph/scroll kinds) in angel villages/towns/cities with their own builds — trade/chat/recruit like any townsfolk, tougher bodies than surf folk.", "<b>Pantheon (0,0):</b> the goddess of dawn resides at the center. Talk, or ask a mock battle: the pantheon seals with impenetrable walls, angels gather to watch, she fights at Peter-tier stats with sword + Holy Sword technique, blessed weapon and kin at half base cooldown, immune to status/stun. Your defeat revives you on the spot; her defeat revives her; the walls fall and she sighs. After the first mock battle (win or lose) she offers quests: move a divine dragon from a building, carry holy water to surface cathedrals, help heavendwellers reincarnate to the surface, and more."]) +
          note("Heaven is chill by design — the opposite road from hell. Bring the sphere; mind the dragons (gently).");
      }
      case "g_hell": {
        return big + head("Hell dimension") +
          "<div class='cdxsub'>fragments · sphere · towers · fiends · castle</div>" +
          li(["<b>12 Hell Fragments:</b> every SURFACE delve pays one DISTINCT shard — clear it to the bottom (12-15 floors, fixed per delve) and step through the final portal to daylight (no boss kill needed). Each delve pays its shard once — repeat clears pay nothing. Track: 🎒 Inventory + Hell.", "<b>Hell Sphere:</b> join 12/12 in 🎒 Inventory — the far towers (1000 out, all 8 compass points) wake at your touch. In multiplayer you can pool shards: 🎁 Give / ⚖️ Trade fragments (and whole spheres) to a fellow traveler — handed shards count toward THEIR 12, so one hero can forge while the rest hunt.", "<b>Travel:</b> E on the RED PORTAL at a tower's exact heart → hell (first entry lands inside the paired hell tower — same coordinates, dawn side becomes fire side); E on a hell tower heart → back. Every hell tower stands on the SAME coordinates as its surface twin, so each pair is the same place in two worlds — hell mirrors the surface, separate ground under shared numbers. Waking ANY one tower with the sphere wakes ALL of them, both sides — and in multiplayer your allies wake with you (forming an alliance shares the wake too). Strangers wake nothing of yours: every non-ally must wake the towers with a sphere of their own (any tower, any time — several heroes can wake the same tower side by side). A sealed tower with no sphere and no shared wake does not respond at all. Towers chart on the map — teleport back anytime, either side: a discovered tower's pin offers the surface heart and the hell heart (same place, two worlds). Demon holds are hearths too — E on a hold portal to travel or bind respawn, map teleport included. A hold portal also walks the 🗼 tower road: emerge at the nearest woken surface tower (needs the towers woken — a Hell Sphere or a shared ally wake). Hell delves never pay fragments.", "<b>Fiends (wilds cap lv69, delves higher):</b> 60 wild kinds in ash/blood/obsidian/bone/flesh families — leeches, blinkers, thorn-hides, splitters, warcriers, broodmothers, charmers — plus the passive boss-tier Demon Warden guarding holds (it won't attack unless struck). Garrison-mates never fight each other — neither do holding-mates anywhere else.", "<b>Hell holdings (4):</b> the Cinder Warren (ash fiends + Ash Tyrant), Gorehold (blood fiends + Gore Patriarch), Obsidian Citadel (obsidian fiends + Gloom Sovereign) and Fleshpit (flesh fiends + Maw Primogenitor) — mustered at lv60-80 with lv74-80 warlords, each with its own walls, buildings and war-sign. Hell never grows surface holdings.", "<b>Demon holds:</b> villages/towns/cities with civilized demons (trade/chat/recruit) in alien obsidian/bone/flesh builds, each with a hearth portal (travel + respawn binding, same as the surface); wild fiends spawn away from hold walls. Every hold resident is a demon through and through — even the healers and scholars — tougher than surface townsfolk, and they know an outsider when they see one.", "<b>Hell delves:</b> inferno/abyss/flesh only, deep (eff 10+), 26 warlords (Ash Tyrant … Blood Evangel) with their own walls, floors and tricks.", "<b>Center castle (hell 0,0, r60):</b> lava moat + double ring, portal room → Peter the Fallen (always max lv 125, full spell pool + summon waves + every quirk).", "<b>Hell loot:</b> chests pay 3x gold, always drop gear (mythril floor in delves), deep delves + warlords drop the new OBLIVION tier (weapons/armor/robes/foci/bow/shield) — also the new top adventurer rank (Oblivion, 200 contracts)."]) +
          note("Old saves: the world is redrawn (rebuildOldWorld) so the towers, holds and castle bake in.");
      }
      default:
        return big + head((e && e.name) || "Guide") + "<div class='cdxdesc'>Unknown topic.</div>";
    }
  }
  const CATS = [
    { id: "boss", label: "👹 Bosses", list: bossList },
    { id: "mob", label: "🐾 Mobs", list: mobList },
    { id: "divine", label: "🌅 Divine", list: divineList },
    { id: "spell", label: "🔮 Spells", list: spellList },
    { id: "tech", label: "⚔️ Deep Arts", list: techList },
    { id: "weapon", label: "🗡️ Weapons", list: weaponList },
    { id: "armor", label: "🛡️ Armor", list: armorList },
    { id: "mat", label: "🧪 Materials", list: matList },
    { id: "race", label: "🧑 Races", list: raceList },
    { id: "class", label: "🎭 Classes", list: classList },
    { id: "building", label: "🏛️ Buildings", list: buildingList },
    { id: "guide", label: "📐 Formulas", list: guideList },
  ];
  // ---------- detail renderers ----------
  function kv(rows) {
    return '<div class="cdxkv">' + rows.filter(r => r[1] != null && r[1] !== "").map(r => "<b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span>").join("") + "</div>";
  }
  function bonusText(b) {
    if (!b) return "";
    const parts = [];
    for (const k of Object.keys(b)) {
      const v = b[k];
      const lab = k.replace(/^maxHp$/, "HP").replace(/^maxMp$/, "MP").replace(/^atk$/, "ATK").replace(/^matk$/, "MATK").replace(/^def$/, "DEF").replace(/^sdef$/, "SDEF").replace(/^spd$/, "SPD");
      parts.push((v >= 0 ? "+" : "") + v + " " + lab);
    }
    return parts.join(", ");
  }
  // ---------- mob per-level stats (realtime, no storage) ----------
  // Mirrors Entities growth math deterministically (no random roll):
  // template = lv1 body, mobGrowth rates + mobLevelFactor accel, boss-kind
  // tier mults + bulwark sdef, augment MP floor for the spell kit. Ranges
  // come from CFG.MOB_VAR (HP/MP/ATK +-8-10%, DEF/SDEF +-1, SPD +-0.2).
  const mobLvMap = {};
  function mobMaxLv(kind) {
    try { const t = (window.CFG.MOB_TEMPLATES || {})[kind]; if (t && t.boss) return 125; } catch (e) {}
    return 100;
  }
  function mobLvFor(kind) {
    const m = mobMaxLv(kind);
    let v = mobLvMap[kind] | 0;
    if (!(v >= 1)) v = 1;
    return Math.max(1, Math.min(m, v));
  }
  function mobScaled(base, rate, lf, cap) {
    base = base | 0;
    if (!(base > 0)) return 0;
    const mult = Math.min(cap, 1 + rate * lf);
    return Math.max(1, Math.round(base * mult));
  }
  const MOB_SPELL_POOLS = {
    blob: ["water_jet", "venom", "glacier", "dazzle"],
    winged: ["lightning", "dazzle", "thunder_hex", "water_jet"],
    humanoid: ["fireball", "frostbite", "dazzle", "venom", "thunder_hex"],
    beast: ["venom", "water_jet", "dazzle", "whirlwind"],
    brute: ["immolate", "fireball", "shieldwall", "whirlwind", "thunder_hex"],
    serpent: ["venom", "glacier", "lightning", "water_jet", "dazzle"],
    ghost: ["frostbite", "glacier", "thunder_hex", "dazzle", "venom"],
    swarm: ["venom", "whirlwind", "dazzle"],
    construct: ["smite", "shieldwall", "fireball", "glacier", "lightning"],
    undead: ["thunder_hex", "frostbite", "venom", "smite", "glacier"]
  };
  function mobTypicalDearest(kind, isBoss) {
    try {
      const t = (window.CFG.MOB_TEMPLATES || {})[kind] || {};
      const AB = window.CFG.ABILITIES || {};
      let dear = 0;
      const consider = (a) => { try { const ab = AB[a]; if (ab && (ab.mp | 0) > dear) dear = ab.mp | 0; } catch (e2) {} };
      for (const a of (t.abilities || [])) consider(a);
      // tiered arsenals: the spawn loadout draws from the full movepool, so
      // the MP floor assumes the costliest trick the kind may field
      try {
        if (window.Entities && window.Entities.movepoolFor) {
          const mp = window.Entities.movepoolFor(kind) || {};
          for (const a of (mp.spells || [])) consider(a);
          for (const a of (mp.techs || [])) consider(a);
        } else {
          const pool = MOB_SPELL_POOLS[t.body] || MOB_SPELL_POOLS.humanoid;
          for (const a of pool) if (AB[a]) consider(a);
        }
      } catch (e2) { }
      if (isBoss) { consider("heal"); consider("panacea"); }
      return dear;
    } catch (e) { return 0; }
  }
  function mobBaseAt(kind, lv) {
    try {
      const T = (window.CFG.MOB_TEMPLATES || {})[kind];
      if (!T) return null;
      const E = window.Entities || {};
      const g = E.mobGrowth ? E.mobGrowth(kind, T) : null;
      if (!g) return null;
      const lf = E.mobLevelFactor ? E.mobLevelFactor(lv) : ((lv - 1) * (1 + (lv - 1) / 30));
      const n = Math.max(0, (lv | 0) - 1);
      let hp = mobScaled(T.hp, g.hp, lf, g.hpCap);
      let mp = mobScaled(T.mp, g.mp, lf, g.mpCap != null ? g.mpCap : g.hpCap);
      let atk = mobScaled(T.atk, g.atk, lf, g.atkCap);
      let matk = mobScaled(T.atk, g.matk, lf, g.matkCap != null ? g.matkCap : g.atkCap);
      let def = mobScaled(T.def, g.def, lf, g.defCap != null ? g.defCap : g.atkCap);
      let sdef = mobScaled(T.def, g.sdef, lf, g.sdefCap != null ? g.sdefCap : g.atkCap);
      const BK = (window.CFG.BOSS_KINDS || []);
      const isBossKind = !!(T.boss || BK.indexOf(kind) >= 0);
      if (isBossKind) {
        // v252: the same per-tier bulk makeMob applies (single source:
        // CFG.BOSS_TIER_BULK) — the codex mirrors the spawn, not history.
        const tier = ((window.CFG.BOSS_MIN_EFF || {})[kind]) || 1;
        const tt = Math.max(0, (tier | 0) - 1);
        const TB = (window.CFG && window.CFG.BOSS_TIER_BULK) || null;
        const hpB = (TB && TB.HP[tier] != null) ? TB.HP[tier] : 12.5;
        const atkB = (TB && TB.ATK[tier] != null) ? TB.ATK[tier] : (1 + tt * 0.08);
        const matkB = (TB && TB.MATK[tier] != null) ? TB.MATK[tier] : (1 + tt * 0.08);
        const defB = (TB && TB.DEF[tier] != null) ? TB.DEF[tier] : (tier <= 2 ? 2.5 : tier >= 12 ? 3.4 : 3.0);
        hp = Math.round(hp * hpB * ((((window.CFG && window.CFG.BOSS_HP_TRIM) || {})[kind]) || 1));
        atk = Math.round(atk * atkB);
        matk = Math.round((matk || atk) * matkB);
        def = Math.round(def * defB);
        mp = Math.round(mp * (1 + tt * 0.15));
        try {
          const prof = ((window.CFG.BOSS_BULWARK || {})[kind]) || {};
          sdef = Math.max(0, Math.round(def * (prof.frail === "mag" ? 0.85 : 1.15)));
        } catch (e2) {}
      }
      try {
        const dear = mobTypicalDearest(kind, isBossKind);
        const want = window.Entities.wantMpFor(T.mp, dear, isBossKind);
        if (mp < want) mp = want;
      } catch (e2) {}
      const spd = Math.round(((T.spd || 3) + Math.min(g.spdCap || 0.5, (g.spdRate || 0) * n * (1 + n / 60))) * 10) / 10;
      let bossXpm = 1;
      try { if (isBossKind) bossXpm = 1 + ((((window.CFG.BOSS_MIN_EFF || {})[kind]) || 1) - 1) * 0.25; } catch (e2) {}
      const xp = Math.max(1, Math.round((T.xp || 0) * (1 + (lv - 1) * 0.22) * bossXpm));
      return { hp, mp, atk, matk, def, sdef, spd, xp };
    } catch (e) { return null; }
  }
  function mobStatsHtml(kind, lv) {
    const s = mobBaseAt(kind, lv);
    if (!s) return "<div class='cdxsub'>No data.</div>";
    let fH = 0.08, fM = 0.10, fA = 0.08, fX = 0.10, sJ = 0.2;
    try {
      const V = window.CFG.MOB_VAR || {};
      if (V.HP != null) fH = V.HP;
      if (V.MP != null) fM = V.MP;
      if (V.ATK != null) fA = V.ATK;
      if (V.XP != null) fX = V.XP;
      if (V.SPD != null) sJ = V.SPD;
    } catch (e) {}
    const r = (v, f) => v + " (" + Math.max(0, Math.round(v * (1 - f))) + "-" + Math.round(v * (1 + f)) + ")";
    let h = "<table class='cdxtbl'><tr><th>Stat</th><th>Lv " + lv + " (range)</th></tr>";
    h += "<tr><td>HP</td><td>" + esc(r(s.hp, fH)) + "</td></tr>";
    h += "<tr><td>MP</td><td>" + esc(s.mp > 0 ? r(s.mp, fM) : "0") + "</td></tr>";
    h += "<tr><td>ATK</td><td>" + esc(r(s.atk, fA)) + "</td></tr>";
    h += "<tr><td>MATK</td><td>" + esc(r(s.matk, fA)) + "</td></tr>";
    h += "<tr><td>DEF</td><td>" + esc(s.def + " (" + Math.max(0, s.def - 1) + "-" + (s.def + 1) + ")") + "</td></tr>";
    h += "<tr><td>SDEF</td><td>" + esc(s.sdef + " (" + Math.max(0, s.sdef - 1) + "-" + (s.sdef + 1) + ")") + "</td></tr>";
    h += "<tr><td>SPD</td><td>" + esc(s.spd.toFixed(1) + " (" + Math.max(1, Math.round((s.spd - sJ) * 10) / 10).toFixed(1) + "-" + (Math.round((s.spd + sJ) * 10) / 10).toFixed(1) + ")") + "</td></tr>";
    h += "<tr><td>XP</td><td>" + esc(r(s.xp, fX)) + "</td></tr>";
    h += "</table>";
    try { const T = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[kind] || {}; if (T.boss || (window.CFG.BOSS_KINDS || []).indexOf(kind) >= 0) h += "<div class='cdxnote'>SDEF runs off DEF via bulwark.</div>"; } catch (e) {}
    h += "<div class='cdxnote'>Base roll: HP/MP/ATK +-8-10% (warlords +-3%), DEF/SDEF +-1 (warlords exact), SPD +-0.2, XP +-10%. MP assumes the costliest bonus-spell kit; cheaper kits roll lower. Tames inherit the roll.</div>";
    return h;
  }
  function mobMilestoneHtml(kind, maxLv) {
    const marks = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    if (maxLv > 100) marks.push(125);
    const use = marks.filter(v => v <= maxLv);
    let h = "<table class='cdxtbl'><tr><th>Lv</th><th>HP</th><th>ATK</th><th>MATK</th><th>DEF</th></tr>";
    for (const L of use) {
      const s = mobBaseAt(kind, L);
      if (!s) continue;
      h += "<tr><td>" + L + "</td><td>" + s.hp + "</td><td>" + s.atk + "</td><td>" + s.matk + "</td><td>" + s.def + "</td></tr>";
    }
    return h + "</table>";
  }
  function setMobLv(kind, val) {
    const lv = Math.max(1, Math.min(mobMaxLv(kind), Math.round(+val) || 1));
    mobLvMap[kind] = lv;
    try {
      const lab = document.getElementById("cdxlv-" + kind);
      if (lab) lab.textContent = "Lv " + lv;
      const box = document.getElementById("cdxmob-" + kind);
      if (box) box.innerHTML = mobStatsHtml(kind, lv);
    } catch (e) {}
  }
  function mobMatchupsHtml(kind) {
    try {
      if (!window.Items || !window.Items.dmgTypeMult) return "";
      const tpl = ((window.CFG && window.CFG.MOB_TEMPLATES) || {})[kind] || {};
      const tgt = { kind, body: tpl.body };
      const cell = (v) => {
        const n = Math.round(v * 100) / 100;
        const c = n > 1.001 ? "#5dd68a" : n < 0.999 ? "#ff7b7b" : "#fff";
        return "<td style='color:" + c + "'>x" + n + "</td>";
      };
      let h = "<table class='cdxtbl'><tr><th>Weapon</th><th>blade</th><th>pierce</th><th>blunt</th><th>lash</th></tr><tr><td>Mult</td>";
      for (const p of ["blade", "pierce", "blunt", "lash"]) {
        let v = 1;
        try { v = window.Items.dmgTypeMult(p, tgt); } catch (e2) { }
        h += cell(v);
      }
      h += "</tr></table>";
      h += "<table class='cdxtbl'><tr><th>Spell</th><th>fire</th><th>water</th><th>ice</th><th>elec</th><th>holy</th><th>nature</th></tr><tr><td>Mult</td>";
      for (const el of ["fire", "water", "ice", "electric", "holy", "nature"]) {
        let v = 1;
        try { v = window.Items.elemMult ? window.Items.elemMult(el, tgt) : 1; } catch (e2) { }
        h += cell(v);
      }
      h += "</tr></table>";
      h += "<div class='cdxnote'>Weapon triangle + spell elements, live from game data. Elemental weapons multiply both (e.g. fire sword = weapon x element).</div>";
      return h;
    } catch (e) { return ""; }
  }
  function mobDetail(e, isBoss) {
    const t = e.t;
    const portrait = spriteCanvas(e.id, t.tint);
    const flags = [];
    if (isBoss) flags.push("BOSS");
    if (e.ancient) flags.push("ANCIENT");
    if (t.undead) flags.push("undead");
    if (t.archer) flags.push("archer");
    if (t.tamable) flags.push("tamable");
    if (t.mount) flags.push("mount" + (t.mount.swim ? "/swim" : "") + (t.mount.lava ? "/lava" : ""));
    if (t.aquatic) flags.push("aquatic");
    if (t.lavaBorn) flags.push("lava-born");
    if (t.docile) flags.push("docile");
    const abs = (t.abilities || []).map(abName).join(", ") || "—";
const maxLv = mobMaxLv(e.id);
    const lv = forPopup ? 1 : mobLvFor(e.id);
    const sliderFn = forPopup ? ("cdxMobLvSet('" + e.id + "',this.value)") : ("window.Codex.setMobLv('" + e.id + "',this.value)");
    const slider = "<div class='cdxlvrow'>Lv <input type='range' min='1' max='" + maxLv + "' value='" + lv + "' oninput=\"" + sliderFn + "\"> <span class='cdxlv' id='cdxlv-" + e.id + "'>Lv " + lv + "</span></div>";
    const stats = "<div id='cdxmob-" + e.id + "'>" + mobStatsHtml(e.id, lv) + "</div>";
    return fig(portrait || "") + "<h4>" + esc(t.name || e.id) + "</h4>" +
      '<div class="cdxsub">' + esc([(t.body || ""), flags.join(" · ")].filter(Boolean).join(" — ")) + "</div>" +
      (LORE[e.id] ? "<div class='cdxdesc'>📜 " + esc(LORE[e.id]) + "</div>" : "") +
      kv([["Template HP", t.hp], ["Template MP", t.mp], ["Template ATK", t.atk], ["MATK base", (t.matk != null ? t.matk : t.atk)], ["Template DEF", t.def], ["SPD", t.spd], ["Template XP", t.xp], ["Signatures", abs]]) +
      mobArsenalHtml(e.id) +
      mobWieldsHtml(e.id) +
      "<div class='cdxlvrow' style='margin-bottom:0'>Matchups (live tables)</div>" +
      mobMatchupsHtml(e.id) +
      mobSpecialHtml(e.id) +
      "<div class='cdxlvrow' style='margin-bottom:0'>Stats by level (computed live)</div>" +
      slider + stats +
      "<div class='cdxlvrow' style='margin-bottom:0'>Milestones</div>" +
      mobMilestoneHtml(e.id, maxLv) +
      '<div class="cdxnote">Template base stats = level-1 body; slider computes every level live (no storage). Kind key: <b>' + esc(e.id) + "</b></div>";
  }
  function spellDetail(e) {
    const a = e.a;
    let chan = "";
    try { const s = window.Entities.spellChannelTime(e.id); if (s > 0) chan = s.toFixed(1) + "s channel"; } catch (err) { }
    let parent = "";
    try { const P = window.CFG.SPELL_PARENTS || {}; if (P[e.id]) parent = abName(P[e.id]); } catch (err) { }
    let children = "";
    try {
      const P = window.CFG.SPELL_PARENTS || {};
      children = Object.keys(P).filter(k => P[k] === e.id).map(abName).join(", ");
    } catch (err) { }
    let mastery = "";
    try { if (window.UI && window.UI.masteryDesc) mastery = window.UI.masteryDesc(e.id) || ""; } catch (err) { }
    return fig('<div class="cdxbig">' + cdxIcon("ability", e.id, 40) + "</div>") + "<h4>" + esc(a.name || e.id) + "</h4>" +
      '<div class="cdxsub">' + esc([a.kind, a.element].filter(Boolean).join(" · ")) + "</div>" +
      kv([["MP cost", spellCostStr(e.id)], ["Cooldown", a.cd + "s"], ["Range", a.range], ["Power", a.power], ["Status", statusText(a.status)], ["Channel", chan], ["Upgrades from", parent], ["Leads to", children]]) +
      '<div class="cdxdesc">' + esc(a.desc || "") + "</div>" +
      (mastery ? '<div class="cdxdesc">Mastery: ' + esc(mastery) + "</div>" : "") +
      (costBase(e.id) ? '<div class="cdxdesc">Costs ' + esc(spellCostStr(e.id)) + " per cast — Efficiency −10% MP/rank and wand discounts apply to the listed base (hotbar shows the same live number).</div>" : '<div class="cdxdesc">Free to cast — no MP, no stamina.</div>') +
      '<div class="cdxnote">Ranks from earlier tiers in the chain add in automatically. Ability key: <b>' + esc(e.id) + "</b></div>";
  }
  function techDetail(e) {
    const a = e.a, t = e.t;
    let fam = "";
    try { fam = (window.CFG.TECH_WEAPON_FAM || {})[e.id] || ""; } catch (err) { }
    let req = "";
    try {
      const r = t.req || {};
      const parts = [];
      if (r.el) for (const k of Object.keys(r.el)) parts.push(r.el[k] + " " + k + " dmg");
      if (r.fam) for (const k of Object.keys(r.fam)) parts.push(r.fam[k] + " " + k + " dmg");
      if (r.kills) parts.push(r.kills + " kills");
      req = parts.join(" + ");
    } catch (err) { }
    let mastery = "";
    try { if (window.UI && window.UI.masteryDesc) mastery = window.UI.masteryDesc(e.id) || ""; } catch (err) { }
    return fig('<div class="cdxbig">' + cdxIcon("ability", e.id, 40) + "</div>") + "<h4>" + esc(a.name || t.name || e.id) + "</h4>" +
      '<div class="cdxsub">' + esc([(t.active === false ? "passive" : "active"), (a.element || "")].filter(Boolean).join(" · ")) + "</div>" +
      kv([["Stamina cost", t.active === false ? "— (passive, no cast)" : techCostStr(e.id)], ["Mana fallback", t.active === false ? "—" : techFallbackStr(e.id)], ["Cooldown", a.cd + "s"], ["Weapon", fam || (t.active === false ? "varies" : "—")], ["Unlock", req], ["Hint", t.hint]]) +
      '<div class="cdxdesc">' + esc(a.desc || "") + "</div>" +
      (mastery ? '<div class="cdxdesc">Mastery: ' + esc(mastery) + "</div>" : "") +
      '<div class="cdxdesc">Stamina costs ' + esc(t.active === false ? "nothing (passive)" : techCostStr(e.id)) + " per use — Efficiency −10%/rank and wand discounts apply first, then the x3 stamina rate (hotbar shows the same live number). Fizzled casts refund it.</div>" +
      '<div class="cdxnote">Earned by deeds, not tomes — wield the matching family (bosses exempt; art-wielding horrors spawn carrying matching tiered steel — see mob entries). Key: <b>' + esc(e.id) + "</b></div>";
  }
  function gearDetail(e, isWeapon) {
    const it = e.it;
    const rows = [];
    let wf = "";
    try { if (window.Items && window.Items.lootHint) wf = window.Items.lootHint(e.id) || ""; } catch (e2) {}
    if (isWeapon) {
      rows.push(["Type", it.wtype || ""], ["Material", it.mat || ""], ["Damage", it.dmgType || ""]);
      if (it.bonus && it.bonus.atk != null) rows.push(["ATK bonus", "+" + it.bonus.atk]);
      if (it.bonus && it.bonus.matk != null) rows.push(["MATK bonus", "+" + it.bonus.matk]);
      if (it.tierMult) rows.push(["Tier mult", "x" + it.tierMult]);
      if (it.undeadMult) rows.push(["Vs unholy", "x" + it.undeadMult]);
      if (it.bowPower) rows.push(["Bow power", "x" + it.bowPower]);
      if (it.powerMult) rows.push(["Spell power", "x" + it.powerMult]);
      if (it.weaponRange) rows.push(["Reach", it.weaponRange]);
      if (it.weaponCd) rows.push(["Swing", it.weaponCd + "s"]);
      if (it.range) rows.push(["Range", it.range]);
      if (it.element) rows.push(["Element", it.element]);
      if (it.statusHit) rows.push(["On hit", statusText(it.statusHit) + " (" + Math.round((it.statusHit.chance || 0) * 100) + "%)"]);
      rows.push(["Bonus", bonusText(it.bonus)], ["Price", it.price != null ? it.price + "g" : ""]);
      if (wf) rows.push(["Where to find", wf]);
    } else {
      rows.push(["Slot", it.slot || ""]);
      if (it.slot === "armor") {
        // Guard-shell class + the tree it feeds: data-driven, so kasaya,
        // habitus and future shells document themselves.
        try {
          const cls = (window.Items && window.Items.armorClassFor) ? window.Items.armorClassFor(e.id) : null;
          if (cls) {
            const treeId = cls === "robe" ? "robe" : cls;
            let tnm = treeId;
            try {
              const T = (window.CFG && window.CFG.SKILL_TREES) || {};
              if (T[treeId] && T[treeId].name) tnm = T[treeId].name;
            } catch (e3) { }
            rows.push(["Shell", cls + " — feeds " + tnm]);
            try {
              const E = (window.CFG && window.CFG.TREE_EARN) || {};
              const need = E[treeId] || E[cls];
              if (need && need.per) rows.push(["Earns", need.per + " " + (need.unit || "uses") + " = 1 point (" + (need.how || "") + ")"]);
            } catch (e3) { }
          }
        } catch (e2) { }
      }
      rows.push(["Bonus", bonusText(it.bonus)]);
      if (it.resPhys != null) rows.push(["Physical resist", Math.round(it.resPhys * 100) + "%"]);
      if (it.resMagic != null) rows.push(["Magic resist", Math.round(it.resMagic * 100) + "%"]);
      try {
        if (window.Items && window.Items.wardForId && window.Items.wardForId(e.id) !== 1) rows.push(["Unholy ward", "30% less damage from undead and demons"]);
      } catch (e2) { }
      if (it.parryMult) rows.push(["Parry", "x" + it.parryMult]);
      rows.push(["Price", it.price != null ? it.price + "g" : ""]);
      if (wf) rows.push(["Where to find", wf]);
    }
    const prev = gearCanvas(e.id);
    const prevHtml = prev ? "<div class='cdxgearprev'>" + fig(prev) + "<div><b>In-world look</b><br><span class='cdxsub'>" + (isWeapon ? "Hero wielding it (game sprite)." : (it.slot === "armor" ? "Hero wearing it (game sprite)." : (it.slot === "shield" || it.shield ? "Hero wearing it on the left arm (game sprite)." : "Off-hand: no distinct world sprite."))) + "</span></div></div>" : "";
    return '<div class="cdxbig">' + cdxIcon("item", e.id, 40) + "</div><h4>" + esc(it.name || e.id) + "</h4>" +
      prevHtml +
      '<div class="cdxdesc">' + esc(it.desc || "") + "</div>" + kv(rows) +
      '<div class="cdxnote">Item key: <b>' + esc(e.id) + "</b></div>";
  }
  // ---------- races + NPC classes (live from Appearance / ROLE_KIT) ----------
  const RACE_STAT_ORDER = ["str", "end", "agi", "int", "cha", "luk", "for"];
  function raceBonusText(race) {
    try {
      const A = window.Appearance || {}, S = (window.CFG && window.CFG.STATS) || {};
      const b = (A.RACE_BONUS && A.RACE_BONUS[race]) || {};
      return RACE_STAT_ORDER.filter(k => b[k]).map(k => "+" + b[k] + " " + ((S[k] && S[k].name) || k)).join(", ");
    } catch (e) { return ""; }
  }
  function raceDetail(e) {
    const r = e.race;
    const A = window.Appearance || {};
    const portrait = npcExampleCanvas(r);
    const label = (A.RACE_LABEL && A.RACE_LABEL[r]) || r;
    const desc = (A.RACE_DESC && A.RACE_DESC[r]) || "";
    const ability = (A.RACE_ABILITY && A.RACE_ABILITY[r]) || "";
    const b = ((A.RACE_BONUS && A.RACE_BONUS[r]) || {});
    const S = (window.CFG && window.CFG.STATS) || {};
    const rows = RACE_STAT_ORDER.filter(k => b[k]).map(k => {
      const st = S[k] || {};
      return "<tr><td>" + esc(st.name || k) + "</td><td>+" + b[k] + "</td></tr>";
    });
    let h = (portrait ? fig(portrait) : "") + "<h4>" + esc(label) + "</h4>" +
      '<div class="cdxsub">playable race — random NPC example pictured</div>';
    if (rows.length) h += "<table class='cdxtbl'><tr><th>Attribute</th><th>Racial bonus</th></tr>" + rows.join("") + "</table>";
    if (ability) h += "<div class='cdxdesc'>✨ <b>Racial ability:</b> " + esc(ability) + "</div>";
    if (desc) h += "<div class='cdxdesc'>" + esc(desc) + "</div>";
    try {
      const bits = [];
      if (A.RACE_BODY_LABEL && A.RACE_BODY_LABEL[r]) bits.push([A.RACE_BODY_LABEL[r], ((A.RACE_SKINS && A.RACE_SKINS[r]) || []).length + " tones"]);
      if (A.RACE_HAIR_LABEL && A.RACE_HAIR_LABEL[r]) bits.push([A.RACE_HAIR_LABEL[r], ((A.RACE_MANES && A.RACE_MANES[r]) || []).length + " colors"]);
      if (bits.length) h += kv(bits);
    } catch (err) {}
    h += "<div class='cdxnote'>Racial points add to hero attributes at creation and restyle — swapping race swaps the bonus, never stacks. Race key: <b>" + esc(r) + "</b></div>";
    return h;
  }
  function classKit(role) {
    try { return (((window.CFG && window.CFG.ROLE_KIT) || {})[role] || []).slice(); } catch (e) { return []; }
  }
  function classMilestoneHtml(role) {
    try {
      if (!window.Entities || !window.Entities.makeNpcStatBlock) return "";
      let h = "<table class='cdxtbl'><tr><th>Lv</th><th>HP</th><th>MP</th><th>ATK</th><th>MATK</th><th>DEF</th></tr>";
      for (const L of [1, 10, 20, 35]) {
        let s = null;
        try { s = window.Entities.makeNpcStatBlock(L, role); } catch (e2) { s = null; }
        if (!s) continue;
        h += "<tr><td>" + L + "</td><td>" + s.maxHp + "</td><td>" + s.maxMp + "</td><td>" + s.atk + "</td><td>" + s.matk + "</td><td>" + s.def + "</td></tr>";
      }
      return h + "</table>";
    } catch (e) { return ""; }
  }
  function classDetail(e) {
    const role = e.role;
    const portrait = spriteCanvas(role, "#ffffff");
    const kit = classKit(role);
    let healer = false;
    try { healer = ((window.CFG.HEALER_ROLES || []).indexOf(role) >= 0); } catch (err) {}
    let mult = null;
    try { if (window.Entities && window.Entities.roleMult) mult = window.Entities.roleMult(role); } catch (err) {}
    let body = "average body (x1 all)";
    if (mult) {
      const parts = [["hp", "HP"], ["mp", "MP"], ["atk", "ATK"], ["matk", "MATK"], ["def", "DEF"]]
        .map(x => x[1] + " x" + mult[x[0]]);
      body = parts.join(" · ");
    }
    let borrowed = "";
    try {
      const outs = ((window.Appearance && window.Appearance.OUTFITS) || []);
      const K = ((window.CFG && window.CFG.ROLE_KIT) || {});
      borrowed = outs.filter(o => !K[o] && o !== "adventurer").map(className).join(", ");
    } catch (err) {}
    return fig(portrait || "") + "<h4>" + esc(className(role)) + "</h4>" +
      '<div class="cdxsub">NPC class' + (healer ? " · 💚 healer (mends allies)" : "") + "</div>" +
      kv([["Role key", role], ["Body", body], ["Kit (" + kit.length + ")", kit.map(abName).join(", ") || "—"]]) +
      "<div class='cdxlvrow' style='margin-bottom:0'>Stats by level (computed live)</div>" +
      classMilestoneHtml(role) +
      "<div class='cdxnote'>Body shapes the level-1 frame; level grows it (town defenders cap at lv35)." +
      (borrowed ? " Outfit-only roles with no kit of their own borrow the villager kit: " + esc(borrowed) + "." : "") + "</div>";
  }
  // ---------- buildings + cultural variants (live CLASSES/LAYOUTS/STYLES) ----------
  // A building's look comes from the settlement that raises it: STYLES keys
  // are the cultures (roof color + style name + wall/floor), LAYOUTS keys
  // are where each class appears. Staffing + per-lodge workforce caps come
  // from window.Schedule (WORKPLACE_CLASSES / capacityFor).
  const BUILDING_USE = {
    stable: "🐴 Store, retrieve, ride and revive tamed beasts in paid pen grids; buy stable-bred horses and sell yours at the Horse Market. No breeding, no archive.",
    beast_lodge: "🧬 Hand over two same-kin beasts to breed (timed hand-over); browse the 📖 Bestiary archive of every beast met.",
    inn: "🛏️ Retire party members and slaves into paid rooms (first rooms free, further rooms cost more); retrieve them from ANY inn. People only — beasts stay at stables.",
    guildhall: "🏛️ Guildhall — pin a posting from the wooden Noticeboard (culls point at real hunting grounds, houses can be vermin- or haunt-cleared), turn it in at any guild Counter. Pins rotate every few minutes and go to one hand. Commissions are player-posted work that never rotates — first finisher wins. Completions raise your weapon-tier adventurer rank (Rusty → Dragonbone → Oblivion → Dawnstone) for richer payouts.",
    // seats of power (fallback when Shops.BUILDING_USE has no entry)
    great_hall: "🏰 Fortress seat of power — muster hall, structural landmark at the heart of the hold.",
    khan_hall: "🏰 Steppe seat of power — the Khan's felt palace, muster and feast hall.",
    terrace_hall: "🏰 Mesa seat of power — stepped great hall above the pueblo.",
    ice_hall: "🏰 Frost seat of power — ice-bound hall of the hold.",
    cathedral: "⛪ City landmark temple — tall cruciform with rose window and twin towers.",
    church: "⛪ Town temple — arched glowing windows, holiest house in town.",
    chapel: "⛪ Village chapel — the parish heart, unmistakably holy at a glance.",
    village_keep: "🏰 Capital-only castle — timber motte-and-bailey with palisade, round towers and thatch. Only raised in capitals.",
    town_keep: "🏰 Capital-only castle — square Norman keep with crenellated crown and corner turrets. Only raised in capitals.",
    city_citadel: "🏰 Capital-only castle — tall ashlar citadel with twin slate spires and rose window. Only raised in capitals.",
    tide_keep: "🏰 Capital-only castle — canal fortress with teal domes, shell roundel and water gate. Only raised in capitals.",
    sakura_castle: "🏯 Capital-only castle — white Kyoto tenshu in three tiers with curved roofs and gold shachi. Only raised in capitals.",
    sun_keep: "🏰 Capital-only castle — sand kasbah with merlons, dome and sun disc. Only raised in capitals.",
    gilt_keep: "🏰 Capital-only castle — gilt-domed merchant citadel with twin coins. Only raised in capitals.",
    harbor_keep: "🏰 Capital-only castle — sea fort with beacon tower, anchor and rope coils. Only raised in capitals.",
    tide_temple: "🌊 Watergate temple — shell roundel, glowing arches, teal door.",
    shrine: "⛩️ Sakura shrine — a true shrine: torii approach, stone lanterns, offering hall with shimenawa and offering box, honden behind.",
    sun_temple: "☀️ Desert landmark — sun disc over a domed sanctuary.",
    caravanserai: "🍵 Desert courtyard inn — teas, brews and trail goods, rooms like an inn.",
    grand_bazaar: "🪙 Trade-city landmark — twin-coin gilt dome over stall rows.",
    lighthouse: "🗼 Harbor landmark — beacon tower with gallery, lamp and dome; annex sheds on wide plots.",
    high_temple: "⛪ Capital high temple — tallest spire in the city, holiest house in the realm.",
    bull_hall: "🏰 Minotaur throne hall — bronze-horned seat of the maze.",
    wight_throne: "🏰 Wight throne room — pale court wreathed in cold flame.",
    orc_hall: "🏰 Warchief hall — tusked ironhide seat of the stronghold.",
    moss_hall: "🏰 Mossy feast hall — vine-hung seat of the troll den.",
    alpha_mound: "🏰 Alpha's mound — bone-arched seat of the gnoll den.",
    kobold_nook: "🏰 Kobold King's nook — scrap-crowned seat of the warren.",
    matriarch_perch: "🏰 Matriarch's perch — winged seat of the roost.",
    pit_chapel: "🏰 Pit chapel — ember-eyed seat of the sanctum.",
    cloud_cottage: "🌅 Dawn cottage — cloud-plastered home with a gold-trimmed roof; heavendweller families live here.",
    halo_grove: "🌅 Halo grove — an orchard pen of dawn fruit trees worked like a farm.",
    dawn_smithy: "🌅 Dawn smithy — village forge singing hymns while it works.",
    halo_chapel: "🌅 Halo chapel — small glowing parish heart of an angel hamlet.",
    cloud_inn: "🌅 Cloud inn — paid rooms like an inn, above a dining room smelling of bread and lilies.",
    sunlit_market: "🌅 Sunlit market — open stalls of dawn produce and lily wine under gold awnings.",
    dawn_church: "🌅 Dawn church — arched glowing windows; the holiest house in an angel town.",
    dawn_library: "🌅 Dawn library — choir-kept shelves of hymnals and star charts.",
    dawn_forge: "🌅 Dawn forge — town forge with twin bellows and a hymn-tuned anvil.",
    radiant_cathedral: "🌅 Radiant cathedral — landmark temple of white stone and dawnfire glass, tallest roof in heaven.",
    seraph_barracks: "🌅 Seraph barracks — tower-shielded muster hall of the pantheon guard.",
    dawn_manor: "🌅 Dawn manor — galleried house of an angel notable, part residence and part court.",
  };
  // Proper building kinds (the old code called everything a "lodge").
  function buildingKind(ck) {
    if (/castle/i.test(ck)) return "Castle";
    if (/_keep$|_citadel$/i.test(ck)) return "Castle";
    if (ck === "palace" || /villa/i.test(ck)) return "Palace";
    if (/temple|cathedral|church|chapel|shrine|kiva|sun_temple|tide_temple|high_temple|pit_chapel|bone_chapel|barrow_mound|spirit_shrine|sky_shrine|runestone_hut|rune_chapel|rite_circle/i.test(ck)) return "Temple";
    if (/hall|throne|mound|nook|perch/i.test(ck)) return "Great hall";
    if (/forge|furnace|smithy|bronze_forge|scrap_workshop|great_forge|forge_works/i.test(ck)) return "Forge";
    if (/shop|market|stall|store|warehouse|bazaar|loft|office|counting|bookstore|library|arcane|black_market|souk|turquoise/i.test(ck)) return "Market";
    if (/inn|tavern|caravanserai|tea_house/i.test(ck)) return "Inn";
    if (/stable|lodge|pen|hitch|trough/i.test(ck)) return "Stable";
    if (/lighthouse|lookout/i.test(ck)) return "Tower";
    if (/tent|hut|burrow|den|hovel|cell|maze|coil|cairn|ossuary|nest|rookery|heap|pile|cache|shrine/i.test(ck)) return "Shelter";
    if (/dojo|bathhouse|sauna|shrine/i.test(ck)) return "House";
    return "Building";
  }
  function buildingShapeBlurb(ck, w, h) {
    try {
      const B = window.Buildings;
      if (!B || !B.notchRectsFor) return "";
      const ns = B.notchRectsFor(ck, w, h) || [];
      if (!ns.length) return "solid rectangle";
      const corners = ns.length;
      const stepped = ns.some((n, i) => ns.some((m, j) => j > i && Math.abs(n.lx0 - m.lx0) < 2 && Math.abs(n.ly0 - m.ly0) < 2));
      const cross = corners >= 4;
      if (cross && stepped) return corners + " notches · stepped bastion cross";
      if (cross) return corners + " notches · cruciform";
      if (stepped) return corners + " notches · stepped";
      return corners + " notch" + (corners === 1 ? "" : "es");
    } catch (e) { return ""; }
  }
  function prettyType(t) {
    try { return String(t).split("_").map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(" "); }
    catch (e) { return String(t); }
  }
  function buildingSettlements(ck) {
    try {
      const L = (window.Buildings && window.Buildings.LAYOUTS) || {};
      return Object.keys(L).filter(t => (L[t] || []).indexOf(ck) >= 0);
    } catch (e) { return []; }
  }
  function buildingStaff(ck) {
    try {
      const W = (window.Schedule && window.Schedule.WORKPLACE_CLASSES) || {};
      return Object.keys(W).filter(r => (W[r] || []).indexOf(ck) >= 0);
    } catch (e) { return []; }
  }
  function buildingList() {
    try {
      const C = (window.Buildings && window.Buildings.CLASSES) || {};
      return Object.keys(C).filter(k => C[k]).map(k => ({ id: k, ck: k, cls: C[k] }))
        .sort((a, b) => String((a.cls && a.cls.name) || a.id).localeCompare(String((b.cls && b.cls.name) || b.id)));
    } catch (e) { return []; }
  }
  function variantStyle(type) {
    try { return ((window.Buildings && window.Buildings.STYLES) || {})[type] || null; }
    catch (e) { return null; }
  }
  function roofChip(st, cls) {
    const c = (st && st.roof) || "#8a8a96";
    return '<span class="' + cls + '" style="background:' + esc(c) + '" title="' + esc((st && st.name) || "") + '"></span>';
  }
  // What furniture does when used (E): mirrors useFurniture in game.js
  // (altar/anvil/fireplace/pool/kettle/drum/throne/longtable/offering/
  // runecircle/trough), beds (sleep 6h), shelves (lorebooks), stable and
  // breeding nexuses, and shop counters.
  const FURN_USE = {
    altar: "altar — blessing (heal + cleanse), habitus vestry (novice/canon for sale), habitus workbench", anvil: "anvil — hone (+10% melee, 5 min)",
    fireplace: "fireplace — warm up (cures freeze) + mend", hearth: "hearth — warm up (cures freeze) + mend",
    pool: "bath pool — full HP/MP restore + cleanse", kettle: "tea kettle — steadying tea (+MP)",
    lowtable: "tea table — steadying tea (+MP)", drum: "war drum — rouse (+5% damage, 5 min)",
    throne: "throne — rest (+HP/MP)", longtable: "feast table — feast (+HP)",
    offering: "offering bowl — 10g for full restore + blessing", runecircle: "rune circle — clear mind (+MP)",
    trough: "trough — drink (+HP)", bed: "beds — sleep 6h (restores HP/MP)",
    bunk: "bunks — sleep 6h (restores HP/MP)", shelf: "shelves — lorebooks (E to read)",
    nexus: "stable nexus — store / retrieve / ride beasts", breednexus: "breeding cradle — breed beasts + Bestiary + 🏹 tack (low-tier whips/bows)",
    counter: "trade counter — opens the shop menu",
  };
  // Curated mechanics that data alone can't express (prices, room rules).
  const SHOP_NOTE = {
    dojo: "Separate 💰 Trade (low-tier kasayas: patched, ironthread), 🥋 Refund (1000g per stat point) and ⬆️ Upgrade tabs.",
    arcane_shop: "Trades quartz/ruby wands, staves and robes, tomes and reagents. Enchants plain weapons on its ✨ Enchant tab (price = tier × enchant strength); upgrades robes, staves and wands on its ⬆️ Upgrade tab — one copy per level — and names them free with ✏️.",
    black_market: "Sells drugs (temporary combat buffs), off-book beasts and bound labor.",
    court: "The King sells placement charters (market / smith / dojo / arcane / stable stalls).",
    castle_keep: "The King's throne room — buy placement charters here.",
    grand_castle: "The King sells placement charters here.",
    palace: "The court of the capital — buy placement charters here.",
    stable: "Paid pen grids: store, retrieve, ride and revive tames, plus a stable-bred horse market.",
    inn: "Paid rooms: retire party members and slaves, retrieve them from any inn (people only).",
    tavern_hall: "Paid rooms: retire party members and slaves, retrieve them from any inn (people only).",
    caravanserai: "Paid rooms like an inn, plus teas, brews and trail goods.",
    beast_lodge: "Hand over two same-kin beasts to breed; browse the Bestiary archive of every beast met. 🏹 Tack sells low-tier whips (rusted, iron, steel) + bows (oak, yew).",
  };
  // Data-driven "what it does": shop kind + example stock, curated
  // mechanics, usable interior furniture — all read live from game data.
  // When curated text already covers the shop function (curated=true),
  // the mechanics note is skipped so entries never repeat themselves.
  function buildingServices(ck, cls, curated) {
    const lines = [];
    let skind = null;
    try { skind = (window.Shops && window.Shops.CLASS_SHOP) ? window.Shops.CLASS_SHOP[ck] : null; } catch (e) {}
    if (skind) {
      let title = skind;
      try { title = (window.Shops.SHOP_TITLE && window.Shops.SHOP_TITLE[skind]) || skind; } catch (e) {}
      let stockTxt = "";
      try {
        const stock = (window.Shops.stockFor && window.Shops.stockFor(skind)) || [];
        if (stock.length) {
          const names = stock.slice(0, 6).map(id => {
            try { const it = window.Items.ITEMS[id]; return it ? it.name : id; }
            catch (e2) { return id; }
          });
          stockTxt = " — e.g. " + names.join(", ") + (stock.length > 6 ? " (+" + (stock.length - 6) + " more)" : "");
        }
      } catch (e) {}
      lines.push(title + stockTxt);
    }
    if (!curated) {
      const note = SHOP_NOTE[ck] || (skind === "court" ? "The King sells placement charters here."
        : skind === "dojo" ? "Separate 💰 Trade (low-tier kasayas: patched, ironthread), 🥋 Refund (1000g per stat point) and ⬆️ Upgrade tabs. Kasaya workbench: +50% flat stats/level (5 max, max +250%) for striker wraps, one copy per level, plus free ✏️ naming."
        : skind === "arcane" ? "Trades quartz/ruby wands, staves and robes, tomes and reagents. Enchants plain weapons on its ✨ Enchant tab (price = tier × enchant strength); upgrades robes, staves, wands on its ⬆️ Upgrade tab — one copy per level — plus free ✏️ naming."
        : skind === "blackmarket" ? "Sells drugs (temporary combat buffs), off-book beasts and bound labor." : "");
      if (note) lines.push(note);
    }
    let kinds = [];
    try { kinds = (window.Buildings && window.Buildings.furnKinds) ? window.Buildings.furnKinds(ck) : []; } catch (e) {}
    const feats = (kinds || []).filter(k => FURN_USE[k]).map(k => FURN_USE[k]);
    if (feats.length) lines.push("Inside: " + feats.join(" · "));
    return lines;
  }
  function buildingDetail(e) {
    const ck = e.ck, cls = e.cls || {};
    const types = buildingSettlements(ck);
    let holds = [];
    try { holds = Object.keys((window.World && window.World.BASE_DEF) || {}); } catch (err) {}
    const isHold = (t) => holds.indexOf(t) >= 0;
    const hearths = types.filter(t => !isHold(t)), holdings = types.filter(t => isHold(t));
    const firstSt = types.length ? variantStyle(types[0]) : null;
    let cap = null;
    try { if (window.Schedule && window.Schedule.capacityFor) cap = window.Schedule.capacityFor(ck); } catch (err) {}
    const staff = buildingStaff(ck);
    const furn = cls.furn ? String(cls.furn).split("_").map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(" ") : "—";
    const kind = buildingKind(ck);
    const shapeBlurb = buildingShapeBlurb(ck, cls.w || 6, cls.h || 5);
    let h = (firstSt ? roofChip(firstSt, "cdxbigchip") : "") + "<h4>" + esc(cls.name || ck) + "</h4>" +
      '<div class="cdxsub">' + esc((cls.w || "?") + "×" + (cls.h || "?") + " " + kind.toLowerCase() + (types.length ? " · " + types.length + " culture" + (types.length === 1 ? "" : "s") : "") + (shapeBlurb ? " · " + shapeBlurb : "")) + "</div>" +
      kv([["Footprint", (cls.w || "?") + "×" + (cls.h || "?") + " tiles (walls incl.)" + (shapeBlurb ? " — " + shapeBlurb : "")], ["Kind", kind], ["Interior kit", furn], ["Workforce", cap != null ? cap + " per " + kind.toLowerCase() : "—"]]);
    let useTxt = BUILDING_USE[ck];
    try { if (!useTxt && window.Shops && window.Shops.BUILDING_USE && window.Shops.BUILDING_USE[ck]) useTxt = window.Shops.BUILDING_USE[ck]; } catch (err) {}
    const curated = !!useTxt;
    if (!useTxt) {
      // Proper fallback so no building ever shows a bare stat block: derive
      // the role from kind + where it is raised.
      try {
        const where = types.length ? types.map(prettyType).join(", ") : "special placement";
        if (holdings.length && !hearths.length) useTxt = kind + " of the " + types.map(prettyType).join(", ") + " — hostile ground; expect defenders, loot and a throne worth reaching.";
        else if (kind === "Temple") useTxt = kind + " raised in " + where + " — holy ground with altar, candles and lorebook shelves.";
        else if (kind === "Great hall" || kind === "Castle" || kind === "Palace") useTxt = kind + " raised in " + where + " — seat of power with throne, war tables and guard muster.";
        else if (kind === "Forge") useTxt = kind + " raised in " + where + " — anvil, furnace and racks; expect smith work.";
        else if (kind === "Market") useTxt = kind + " raised in " + where + " — counters, crates and trade goods.";
        else if (kind === "Inn") useTxt = kind + " raised in " + where + " — beds, hearth and hospitality.";
        else if (kind === "Stable") useTxt = kind + " raised in " + where + " — pens, hay and beast handling.";
        else if (kind === "Tower") useTxt = kind + " raised in " + where + " — lookout and landmark.";
        else useTxt = kind + " raised in " + where + ".";
      } catch (e2) {}
    }
    // "What it does": curated role + live shop/stock data + usable
    // interior furniture, so every entry explains its gameplay function.
    const svcLines = [];
    if (useTxt) svcLines.push(esc(useTxt));
    try {
      for (const s of buildingServices(ck, cls, curated)) svcLines.push(esc(s));
    } catch (e2) {}
    if (svcLines.length) h += "<div class='cdxlvrow' style='margin-bottom:0'>What it does</div><div class='cdxdesc'>" + svcLines.join("<br>") + "</div>";
    // Castles are capital-only: say so explicitly on every Castle entry so the
    // codex never implies a keep belongs to a hamlet, town or metro.
    try {
      if (kind === "Castle") h += "<div class='cdxnote'>👑 Only raised in capitals — no other settlement raises a castle.</div>";
    } catch (e2) {}
    // exterior preview for every settlement variant (offscreen via drawExteriorFor).
    // Exterior preview: procedural drawExteriorFor canvases, filled in by
    // hydrateExt (in-page) or the popup's opener-based copy. No images.
    try {
      if (window.Buildings && window.Buildings.drawExteriorFor && types.length) {
        h += extPlaceholder(ck, cls, types);
      }
    } catch (e) {}
    const varRow = (t) => {
      const st = variantStyle(t);
      const look = st ? (st.name || "") + " roof · " + String(st.wall || "").toLowerCase() + " + " + String(st.floor || "").toLowerCase() : "no style data";
      return "<tr><td>" + roofChip(st, "cdxchip") + "</td><td>" + esc(prettyType(t)) + "</td><td>" + esc(look) + "</td></tr>";
    };
    if (hearths.length) {
      h += "<div class='cdxlvrow' style='margin-bottom:0'>Raised in (hearths)</div><table class='cdxtbl'><tr><th></th><th>Settlement</th><th>Look</th></tr>" +
        hearths.map(varRow).join("") + "</table>";
    }
    if (holdings.length) {
      h += "<div class='cdxlvrow' style='margin-bottom:0'>Raised in (enemy holdings)</div><table class='cdxtbl'><tr><th></th><th>Holding</th><th>Look</th></tr>" +
        holdings.map(varRow).join("") + "</table>";
    }
    if (!types.length) h += "<div class='cdxnote'>Placed by special logic (not in any layout list) — e.g. guaranteed or origin placement.</div>";
    if (staff.length) {
      h += "<div class='cdxlvrow' style='margin-bottom:0'>Staffs" + (cap != null ? " (up to " + cap + " per " + kind.toLowerCase() + ")" : "") + "</div>" +
        "<div class='cdxdesc'>" + esc(staff.map(className).join(", ")) + "</div>";
    }
    h += "<div class='cdxnote'>Class key: <b>" + esc(ck) + "</b></div>";
    return h;
  }
  // ---------- main render ----------
  let curCat = "boss", curQuery = "", curSel = null;
  function rowIcon(cat, e) {
    if (cat === "boss" || cat === "mob") return spriteCanvas(e.id, e.t && e.t.tint);
    if (cat === "divine") return spriteCanvas(e.id, e.tint);
    if (cat === "class") return spriteCanvas(e.role, "#ffffff");
    if (cat === "building") {
      try {
        const ts = buildingSettlements(e.ck);
        if (ts.length) return thumbCanvas(e.ck, e.cls || {}, ts[0]);
      } catch (err) {}
      const ts2 = buildingSettlements(e.ck);
      return roofChip(ts2.length ? variantStyle(ts2[0]) : null, "cdxchip");
    }
    if (cat === "race") return npcExampleCanvas(e.race);
    if (cat === "guide") return "";
    try {
      if (cat === "spell" || cat === "tech") return '<div class="cdxico">' + cdxIcon("ability", e.id, 22) + "</div>";
      if (cat === "weapon" || cat === "mat" || cat === "gear") return '<div class="cdxico">' + cdxIcon("item", e.id, 22) + "</div>";
    } catch (err) {}
    return "";
  }
  function rowSub(cat, e) {
    if (cat === "boss" || cat === "mob") {
      const t = e.t;
      return "HP " + t.hp + " · ATK " + t.atk + " · DEF " + t.def + (e.ancient ? " · ANCIENT" : "");
    }
    if (cat === "divine") return esc((e && e.sub) || "story only");
    if (cat === "race") {
      try {
        const b = raceBonusText(e.race) || "playable race";
        const ab = (window.Appearance && window.Appearance.RACE_ABILITY && window.Appearance.RACE_ABILITY[e.race]) || "";
        return esc(ab ? (b + " · " + ab) : b);
      } catch (err) { return esc("playable race"); }
    }
    if (cat === "class") {
      let h = "";
      try { if ((window.CFG.HEALER_ROLES || []).indexOf(e.role) >= 0) h = " · healer"; } catch (err) {}
      return esc((classKit(e.role).map(abName).join(", ") || "no kit").slice(0, 64)) + h;
    }
    if (cat === "building") {
      const types = buildingSettlements(e.ck);
      const st = types.length ? variantStyle(types[0]) : null;
      let kind = "building";
      try { kind = buildingKind(e.ck).toLowerCase(); } catch (err) {}
      return esc((e.cls.w || "?") + "×" + (e.cls.h || "?") + " " + kind + (st && st.name ? " · " + st.name : "") + (types.length > 1 ? " · +" + (types.length - 1) + " more" : ""));
    }
    if (cat === "guide") return esc((e && e.sub) || "");
    if (cat === "spell") return (costBase(e.id) ? liveMp(e.id) + " MP" : "free") + " · " + (e.a.kind || "") + " · " + (e.a.element || "");
    if (cat === "tech") return ((e.t && e.t.active === false) ? "passive" : liveStam(e.id) + " stamina") + " · " + (e.a.element || "");
    return ((e.it.price != null) ? e.it.price + "g · " : "") + esc((e.it && e.it.desc || "").slice(0, 48));
  }
  function rowName(cat, e) {
    if (cat === "building") return (e.cls && e.cls.name) || e.id;
    if (cat === "divine") return (e && e.name) || e.id;
    if (cat === "race") {
      try { if (window.Appearance && window.Appearance.RACE_LABEL && window.Appearance.RACE_LABEL[e.race]) return window.Appearance.RACE_LABEL[e.race]; } catch (err) {}
      return e.id;
    }
    if (cat === "class") return className(e.role);
    if (cat === "guide") return (e && e.name) || e.id;
    return (e.t && (e.t.name || e.a.name)) || (e.a && e.a.name) || (e.it && e.it.name) || e.id;
  }
  function detailHtml(cat, e) {
    if (cat === "boss") return mobDetail(e, true);
    if (cat === "mob") return mobDetail(e, false);
    if (cat === "divine") return divineDetail(e);
    if (cat === "guide") return guideDetail(e);
    if (cat === "spell") return spellDetail(e);
    if (cat === "tech") return techDetail(e);
    if (cat === "weapon") return gearDetail(e, true);
    if (cat === "race") return raceDetail(e);
    if (cat === "class") return classDetail(e);
    if (cat === "building") return buildingDetail(e);
    if (cat === "mat") return matDetail(e);
    return gearDetail(e, false);
  }
  function renderInto(root) {
    ensureCss();
    if (!root) return;
    root.innerHTML = "";
    try { root.classList.add("cdxscope"); } catch (e) {}
    const tabs = document.createElement("div"); tabs.className = "cdxtabs";
    for (const c of CATS) {
      let n = 0;
      try { n = c.list().length; } catch (err) { n = 0; }
      const b = document.createElement("button");
      b.textContent = c.label + " (" + n + ")";
      b.className = c.id === curCat ? "" : "ghost";
      b.onclick = () => { curCat = c.id; curSel = null; renderInto(root); };
      tabs.appendChild(b);
    }
    root.appendChild(tabs);
    const tools = document.createElement("div"); tools.className = "cdxtools";
    const q = document.createElement("input");
    q.className = "cdxsearch"; q.placeholder = "🔍 Filter by name or text…"; q.value = curQuery;
    q.oninput = () => { curQuery = q.value; paintList(); };
    tools.appendChild(q);
    root.appendChild(tools);
    const wrap = document.createElement("div"); wrap.className = "cdxwrap";
    const list = document.createElement("div"); list.className = "cdxlist";
    const det = document.createElement("div"); det.className = "cdxdet";
    wrap.appendChild(list); wrap.appendChild(det);
    root.appendChild(wrap);
    function entries() {
      const cat = CATS.find(c => c.id === curCat);
      let arr = [];
      try { arr = cat.list(); } catch (err) { arr = []; }
      const s = curQuery.trim().toLowerCase();
      if (s) arr = arr.filter(e => (rowName(curCat, e) + " " + JSON.stringify(e)).toLowerCase().includes(s));
      return arr;
    }
    function paintList() {
      list.innerHTML = "";
      const arr = entries();
      if (!arr.length) { list.innerHTML = '<div class="cdxsub" style="text-align:center;padding:12px">No entries match.</div>'; }
      for (const e of arr) {
        const b = document.createElement("button");
        b.className = "cdxrow" + (curSel === e.id ? " on" : "");
        b.innerHTML = rowIcon(curCat, e) + '<span><span class="cdxnm">' + esc(rowName(curCat, e)) + '</span><br><span class="cdxsub">' + rowSub(curCat, e) + "</span></span>";
        b.onclick = () => { curSel = e.id; paintList(); };
        list.appendChild(b);
      }
      paintDet(arr);
      hydrateSprites(list);
      hydrateThumbs(list);
    }
    function paintDet(arr) {
      const found = (arr || entries()).find(e => e.id === curSel);
      if (!found) {
        const n = entries().length;
        det.innerHTML = '<div class="cdxsub" style="text-align:center;padding:18px">Select an entry — ' + n + " listed, read live from game data.</div>";
        try { if (navHook) navHook(curCat, null); } catch (e) {}
        return;
      }
      try { det.innerHTML = detailHtml(curCat, found); } catch (err) { det.innerHTML = "Error: " + esc(err && err.message); }
      try { det.style.setProperty("--cdx-zoom", detZoom); } catch (e) {}
      hydrateSprites(det);
      hydrateExt(det);
      wireFigZoom(det);
      try { if (navHook) navHook(curCat, found.id); } catch (e) {}
    }
    paintList();
  }
  // ---------- in-tab panel (movable pseudo-window) ----------
  // The Codex lives in the same tab: a draggable panel hosting renderInto,
  // so pictures render live (no opener round-trip) and any game UI — toasts,
  // skill trees, item descriptions, chat — can link straight to an entry via
  // Codex.openPanel(cat, id) or a #codex=<cat>/<id> deep link.
  let panelEl = null, panelWired = false, navHook = null;
  function ensurePanel() {
    if (panelEl) return panelEl;
    panelEl = document.createElement("div");
    panelEl.id = "cdxPanel";
    panelEl.className = "cdxpanel";
    panelEl.hidden = true;
    panelEl.innerHTML = '<div class="cdxphead"><span class="cdxptitle">📖 Emberhold Codex</span>' +
      '<button class="cdxpbtn" data-act="link" title="Copy link to this entry">🔗</button>' +
      '<button class="cdxpbtn" data-act="close" title="Close (Esc)">✕</button></div>' +
      '<div class="cdxpbody"></div>';
    document.body.appendChild(panelEl);
    try {
      const head = panelEl.querySelector(".cdxphead");
      head.addEventListener("pointerdown", (ev) => {
        try {
          if (ev.target && ev.target.closest && ev.target.closest(".cdxpbtn")) return;
          const r = panelEl.getBoundingClientRect();
          const sx = ev.clientX - r.left, sy = ev.clientY - r.top;
          panelEl.style.transform = "none";
          const mv = (e2) => {
            panelEl.style.left = Math.max(0, Math.min(window.innerWidth - 80, e2.clientX - sx)) + "px";
            panelEl.style.top = Math.max(0, Math.min(window.innerHeight - 60, e2.clientY - sy)) + "px";
          };
          const up = () => { try { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); } catch (e) {} };
          window.addEventListener("pointermove", mv);
          window.addEventListener("pointerup", up);
          ev.preventDefault();
        } catch (e) {}
      });
    } catch (e) {}
    try { panelEl.querySelector('[data-act="close"]').onclick = () => closePanel(); } catch (e) {}
    try { panelEl.querySelector('[data-act="link"]').onclick = () => copyPanelLink(); } catch (e) {}
    if (!panelWired) {
      panelWired = true;
      try {
        window.addEventListener("keydown", (e) => {
          try { if ((e.key === "Escape" || e.key === "Esc") && panelEl && !panelEl.hidden) closePanel(); } catch (e2) {}
        });
      } catch (e) {}
    }
    return panelEl;
  }
  function panelLink() {
    try {
      const g = window.generatorName || "";
      return "https://perchance.org/" + g + "#codex=" + curCat + (curSel ? "/" + curSel : "");
    } catch (e) { return ""; }
  }
  function copyPanelLink() {
    const u = panelLink();
    if (!u) return;
    const done = () => { try { if (window.UI && window.UI.toast) window.UI.toast("🔗 Codex link copied.", 2500); } catch (e) {} };
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = u;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        done();
      } catch (e) {}
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }
  function syncPanelHash() {
    try {
      let h = "";
      try {
        const m = /(?:^#|&)channel=[A-Za-z0-9]{6,16}/.exec(location.hash || "");
        if (m) h = m[0][0] === "#" ? m[0] : "#" + m[0].slice(1);
      } catch (e) {}
      history.replaceState(null, "", (h ? h + "&" : "#") + "codex=" + curCat + (curSel ? "/" + curSel : ""));
    } catch (e) {}
  }
  function clearPanelHash() {
    try {
      const m = /(?:^#|&)channel=[A-Za-z0-9]{6,16}/.exec(location.hash || "");
      history.replaceState(null, "", m ? (m[0][0] === "#" ? m[0] : "#" + m[0].slice(1)) : (location.pathname + location.search));
    } catch (e) {}
  }
  function parseCodexHash(h) {
    try {
      const m = /(?:^#|&)codex=([A-Za-z0-9_\-]+)(?:\/([A-Za-z0-9_\-]+))?/.exec(h != null ? h : location.hash || "");
      if (!m) return null;
      return { cat: m[1], id: m[2] || null };
    } catch (e) { return null; }
  }
  function openPanel(cat, id) {
    ensureCss();
    ensurePanel();
    if (cat) {
      try {
        const c = CATS.find(c => c.id === cat);
        if (c) {
          curCat = cat;
          curQuery = "";
          let arr = [];
          try { arr = c.list(); } catch (e) {}
          curSel = (id && arr.some(e => e && e.id === id)) ? id : (arr.length ? arr[0].id : null);
        }
      } catch (e) {}
    }
    const body = panelEl.querySelector(".cdxpbody");
    navHook = () => syncPanelHash();
    renderInto(body);
    panelEl.hidden = false;
    syncPanelHash();
    try {
      const q = body.querySelector(".cdxsearch");
      if (q) q.focus();
    } catch (e) {}
    return true;
  }
  function closePanel() {
    try { if (panelEl) panelEl.hidden = true; } catch (e) {}
    navHook = null;
    clearPanelHash();
  }
  function isPanelOpen() {
    try { return !!(panelEl && !panelEl.hidden); } catch (e) { return false; }
  }
  // ---------- standalone window ----------
  // Popup shell: text/stats are snapshotted (pre-rendered sections + the
  // mob-level math tables), but every picture is drawn LIVE from game
  // code through window.opener (Sprites.actor, Buildings.drawExteriorFor).
  // Zero raster images are baked: no data-URLs, no image files. Tabs,
  // search and selection run from a small popup script; detail figures
  // zoom by dragging, row thumbnails hydrate from live exterior code.
  function standaloneHtml() {
    forPopup = true;
    try {
      let mobData = {}, mobVar = { HP: 0.08, MP: 0.10, ATK: 0.08, DEF: 1, SPD: 0.2, XP: 0.10 };
      try {
        mobVar = Object.assign(mobVar, window.CFG.MOB_VAR || {});
        const T = window.CFG.MOB_TEMPLATES || {};
        const BK = window.CFG.BOSS_KINDS || [];
        for (const k of Object.keys(T)) {
          const tpl = T[k] || {};
          let g = null;
          try { g = window.Entities.mobGrowth(k, tpl); } catch (e2) { g = null; }
          mobData[k] = {
            t: { hp: tpl.hp | 0, mp: tpl.mp | 0, atk: tpl.atk | 0, def: tpl.def | 0, spd: +tpl.spd || 3, xp: tpl.xp | 0 },
            g: g, tier: ((window.CFG.BOSS_MIN_EFF || {})[k]) || 1,
            frail: (((window.CFG.BOSS_BULWARK || {})[k] || {}).frail || null),
            maxLv: tpl.boss ? 125 : 100,
            isBoss: !!(tpl.boss || BK.indexOf(k) >= 0),
            dear: mobTypicalDearest(k, !!(tpl.boss || (window.CFG.BOSS_KINDS || []).indexOf(k) >= 0))
          };
        }
      } catch (e2) {}
      const mobDataJson = JSON.stringify(mobData).replace(/</g, "\\u003c");
      const mobVarJson = JSON.stringify(mobVar).replace(/</g, "\\u003c");
      const standaloneMobJs = "var cdxMobData=" + mobDataJson + ";var cdxMobVar=" + mobVarJson + ";"
        + "function cdxMS(b,r,lf,cap){b=b|0;if(!(b>0))return 0;var m=Math.min(cap,1+r*lf);return Math.max(1,Math.round(b*m));}"
        + "function cdxLF(lv){var n=Math.max(0,lv-1);return n*(1+n/30);}"
        + "function cdxBase(k,lv){var d=cdxMobData[k];if(!d||!d.g)return null;var g=d.g,lf=cdxLF(lv),n=Math.max(0,lv-1);"
        + "var hp=cdxMS(d.t.hp,g.hp,lf,g.hpCap),mp=cdxMS(d.t.mp,g.mp,lf,g.mpCap!=null?g.mpCap:g.hpCap),atk=cdxMS(d.t.atk,g.atk,lf,g.atkCap),"
        + "matk=cdxMS(d.t.atk,g.matk,lf,g.matkCap!=null?g.matkCap:g.atkCap),def=cdxMS(d.t.def,g.def,lf,g.defCap!=null?g.defCap:g.atkCap),sdef=cdxMS(d.t.def,g.sdef,lf,g.sdefCap!=null?g.sdefCap:g.atkCap);"
        + "if(d.isBoss){var tt=Math.max(0,(d.tier|0)-1);var bd=d.tier<=2?0:d.tier<=4?1:2;hp=Math.round(hp*(1+tt*0.55)*[12.5,75,100][bd]);atk=Math.round(atk*(1+tt*0.16));"
        + "matk=Math.round((matk||atk)*(1+tt*0.16));def=Math.round(def*(1+tt*0.22)*[3,4,5][bd]);mp=Math.round(mp*(1+tt*0.28));"
        + "sdef=Math.max(0,Math.round(def*(d.frail==='mag'?0.85:1.15)));}"
        + "var want=Math.round((d.t.mp||0)+d.dear*2.5+(d.isBoss?40:12));if(mp<want)mp=want;"
        + "var spd=Math.round(((d.t.spd||3)+Math.min(g.spdCap||0.5,(g.spdRate||0)*n*(1+n/60)))*10)/10;"
        + "var xpm=d.isBoss?1+(d.tier-1)*0.25:1;var xp=Math.max(1,Math.round((d.t.xp||0)*(1+(lv-1)*0.22)*xpm));"
        + "return {hp:hp,mp:mp,atk:atk,matk:matk,def:def,sdef:sdef,spd:spd,xp:xp};}"
        + "function cdxStatsHtml(k,lv){var s=cdxBase(k,lv);if(!s)return 'No data.';var V=cdxMobVar;"
        + "var r=function(v,f){return v+' ('+Math.max(0,Math.round(v*(1-f)))+'-'+Math.round(v*(1+f))+')';};"
        + "var h='<table class=cdxtbl><tr><th>Stat</th><th>Lv '+lv+' (range)</th></tr>';"
        + "h+='<tr><td>HP</td><td>'+r(s.hp,V.HP)+'</td></tr>';h+='<tr><td>MP</td><td>'+(s.mp>0?r(s.mp,V.MP):'0')+'</td></tr>';"
        + "h+='<tr><td>ATK</td><td>'+r(s.atk,V.ATK)+'</td></tr>';h+='<tr><td>MATK</td><td>'+r(s.matk,V.ATK)+'</td></tr>';"
        + "h+='<tr><td>DEF</td><td>'+s.def+' ('+Math.max(0,s.def-1)+'-'+(s.def+1)+')</td></tr>';"
        + "h+='<tr><td>SDEF</td><td>'+s.sdef+' ('+Math.max(0,s.sdef-1)+'-'+(s.sdef+1)+')</td></tr>';"
        + "h+='<tr><td>SPD</td><td>'+s.spd.toFixed(1)+' ('+Math.max(1,Math.round((s.spd-V.SPD)*10)/10).toFixed(1)+'-'+(Math.round((s.spd+V.SPD)*10)/10).toFixed(1)+')</td></tr>';"
        + "h+='<tr><td>XP</td><td>'+r(s.xp,V.XP)+'</td></tr></table>';return h;}"
        + "function cdxMobLvSet(k,v){var d=cdxMobData[k];var m=d?d.maxLv:100;var lv=Math.max(1,Math.min(m,Math.round(+v)||1));"
        + "var lab=document.getElementById('cdxlv-'+k);if(lab)lab.textContent='Lv '+lv;"
        + "var box=document.getElementById('cdxmob-'+k);if(box)box.innerHTML=cdxStatsHtml(k,lv);}";

      const secs = [];
      for (const c of CATS) {
        let arr = [];
        try { arr = c.list(); } catch (err) { arr = []; }
        const rows = [], dets = [];
        arr.forEach((e, i) => {
          const safeId = esc(e.id).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
          rows.push('<button class="cdxrow' + (i === 0 ? " on" : "") + '" data-id="' + esc(e.id) + '" onclick="cdxSel(\'' + c.id + "','" + safeId + "')\">" +
            rowIcon(c.id, e) + '<span><span class="cdxnm">' + esc(rowName(c.id, e)) + '</span><br><span class="cdxsub">' + rowSub(c.id, e) + "</span></span></button>");
          dets.push('<div class="cdxdetitem" data-id="' + esc(e.id) + '"' + (i === 0 ? "" : " hidden") + ">" + detailHtml(c.id, e) + "</div>");
        });
        secs.push({ id: c.id, label: c.label, n: arr.length, rows: rows.join(""), dets: dets.join("") });
      }
      const tabBtns = secs.map((s, i) =>
        '<button data-cat="' + s.id + '" class="' + (i === 0 ? "" : "ghost") + '" onclick="cdxTab(\'' + s.id + '\')">' + esc(s.label) + " (" + s.n + ")</button>").join("");
      const sections = secs.map((s, i) =>
        '<section class="cdxsec" data-cat="' + s.id + '"' + (i === 0 ? "" : " hidden") + '><div class="cdxwrap"><div class="cdxlist">' + s.rows +
        '</div><div class="cdxdet">' + (s.dets || '<div class="cdxsub" style="text-align:center;padding:18px">Nothing here yet.</div>') + "</div></div></section>").join("");
      return "<!DOCTYPE html><html><head>" + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        "<title>📖 Emberhold Codex</title><style>" +
        "html,body{box-sizing:border-box}body{background:#0a1016;color:#fff;font-family:system-ui,-apple-system,SegoeUIsans-serif;margin:0;padding:16px 22px;min-height:100vh;font-size:16px;line-height:1.5}" +
        ".cdxpage{max-width:2000px;width:100%;margin:0 auto;box-sizing:border-box}" +
        ".cdxpage h1{font-size:26px;margin:6px 0;text-align:center}" +
        ".cdxpage .cdxlede{font-size:14.5px;opacity:.72;text-align:center;margin:0 0 8px 0;max-width:1100px;margin-left:auto;margin-right:auto}" +
        ".cdxtabs button{background:#1a2634;color:#fff;border:1px solid #ffd93d;border-radius:8px;cursor:pointer}" +
        ".cdxtabs button.ghost{border-color:#3a4a5a;opacity:.8}" +
        cssText() +
        "</style></head>" + '<body><div class="cdxpage cdxscope"><h1>📖 Emberhold Codex</h1>' +
        '<p class="cdxlede">Every boss, beast, divine figure, spell, Deep Art, weapon, armor, playable race, NPC class and building — generated from live game data when opened. Reopen to refresh after balance edits.</p>' +
        '<div id="cdxDead" hidden style="background:#3a1e1e;border:1px solid #ff5b5b;border-radius:8px;padding:10px 12px;margin:0 auto 10px auto;max-width:900px;font-size:14.5px;text-align:center">⚠️ Game tab closed — pictures draw live from game code. Reopen 📖 Codex from the game.</div>' +
        '<div class="cdxtabs">' + tabBtns + "</div>" +
        '<div class="cdxtools"><input id="cdxq" class="cdxsearch" placeholder="🔍 Filter by name or text…" oninput="cdxSearch(this.value)"></div>' +
        sections +
        "<script>" + standaloneMobJs +
        'var cdxCat="boss";' +
        'var cdxDetZoom=2;try{var cdzs=parseFloat(localStorage.getItem("emberhold_codex_zoom"));if(cdzs>=0.5&&cdzs<=8)cdxDetZoom=Math.round(cdzs*4)/4;}catch(e){}' +
        'function cdxDetSet(v,det){cdxDetZoom=Math.max(0.5,Math.min(8,Math.round(parseFloat(v)*4)/4||2));try{localStorage.setItem("emberhold_codex_zoom",String(cdxDetZoom));}catch(e){}var ds=det?[det]:document.querySelectorAll(".cdxdet");for(var i=0;i<ds.length;i++){try{ds[i].style.setProperty("--cdx-zoom",cdxDetZoom);}catch(e2){}}}' +
        'function cdxFigZoom(root){if(!root||!root.querySelectorAll)return;var figs=root.querySelectorAll(".cdxfig:not([data-zwired])");for(var i=0;i<figs.length;i++){try{(function(fig){fig.setAttribute("data-zwired","1");var sx=0,sy=0,st=2,drag=false;var det=fig.closest?fig.closest(".cdxdet"):null;function cur(){try{var t=det||fig;var v=parseFloat(getComputedStyle(t).getPropertyValue("--cdx-zoom"));if(v>=0.5&&v<=8)return v;}catch(e){}return cdxDetZoom;}fig.addEventListener("pointerdown",function(ev){try{if(fig.classList&&fig.classList.contains("cdxwide")&&ev.pointerType&&ev.pointerType!=="mouse")return;}catch(e){}drag=true;sx=ev.clientX;sy=ev.clientY;st=cur();try{fig.setPointerCapture(ev.pointerId);}catch(e){}fig.classList.add("drag");ev.preventDefault();});fig.addEventListener("pointermove",function(ev){if(!drag)return;cdxDetSet(st+((ev.clientX-sx)-(ev.clientY-sy))/120,det);});function up(){drag=false;fig.classList.remove("drag");}fig.addEventListener("pointerup",up);fig.addEventListener("pointercancel",up);fig.addEventListener("dblclick",function(){cdxDetSet(2,det);});})(figs[i]);}catch(e){}}}' +
        'function cdxExtCrop(op,mock,ts,MG){try{if(!op||!op.Buildings||!mock)return null;var B=op.Buildings;var big=document.createElement("canvas");big.width=mock.w*ts+MG*2;big.height=mock.h*ts+MG*2;var bx=big.getContext("2d");B.drawExteriorFor(bx,ts,MG,MG,mock);var x0=big.width,y0=big.height,x1=-1,y1=-1;try{var dd=bx.getImageData(0,0,big.width,big.height).data;for(var yy=0;yy<big.height;yy+=2){for(var xx=0;xx<big.width;xx+=2){if(dd[(yy*big.width+xx)*4+3]>8){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy;}}}}catch(e2){x0=0;y0=0;x1=big.width-1;y1=big.height-1;}if(x1<x0)return null;var PD=Math.max(2,Math.round(ts/5));x0=Math.max(0,x0-PD);y0=Math.max(0,y0-PD);x1=Math.min(big.width-1,x1+PD);y1=Math.min(big.height-1,y1+PD);var cw=x1-x0+1,chh=y1-y0+1;var cv=document.createElement("canvas");cv.width=cw;cv.height=chh;cv.getContext("2d").drawImage(big,x0,y0,cw,chh,0,0,cw,chh);return cv;}catch(e){return null;}}' +
        'function cdxHydrateThumbs(root){if(!root||!root.querySelectorAll)return;var op=cdxOpener();if(!op)return;var all=root.querySelectorAll("canvas.cdxthumb:not([data-done])");for(var i=0;i<all.length;i++){var c=all[i];try{c.setAttribute("data-done","1");}catch(e){}try{var ck=c.getAttribute("data-ck");var cls={w:parseInt(c.getAttribute("data-w"),10)||6,h:parseInt(c.getAttribute("data-h"),10)||5,n:c.getAttribute("data-nm")||ck};var t=c.getAttribute("data-t");var mock=cdxMockFor(op,ck,cls,t);if(!mock)continue;var crop=cdxExtCrop(op,mock,12,24);if(!crop)continue;c.width=crop.width;c.height=crop.height;var g=c.getContext("2d");g.fillStyle="#101820";g.fillRect(0,0,c.width,c.height);g.drawImage(crop,0,0);}catch(e){}}}' +
        'cdxDetSet(cdxDetZoom,null);' +
        "function cdxTab(id){cdxCat=id;" +
        "var bs=document.querySelectorAll('.cdxtabs button');for(var i=0;i<bs.length;i++){bs[i].className=bs[i].getAttribute('data-cat')===id?'':'ghost';}" +
        "var ss=document.querySelectorAll('section.cdxsec');for(var j=0;j<ss.length;j++){ss[j].hidden=ss[j].getAttribute('data-cat')!==id;}" +
        "var q=document.getElementById('cdxq');cdxSearch(q?q.value:'');try{var sct=document.querySelector('section.cdxsec[data-cat=\"'+id+'\"]');cdxHydrateSprites(sct);cdxHydrateThumbs(sct);cdxHydrateExt(sct);cdxFigZoom(sct);}catch(e){}}" +
        "function cdxSel(cat,id){" +
        "var rs=document.querySelectorAll('section.cdxsec[data-cat=\"'+cat+'\"] .cdxrow');for(var i=0;i<rs.length;i++){if(rs[i].classList){rs[i].classList.toggle('on',rs[i].getAttribute('data-id')===id);}}" +
        "var ds=document.querySelectorAll('section.cdxsec[data-cat=\"'+cat+'\"] .cdxdetitem');for(var j=0;j<ds.length;j++){ds[j].hidden=ds[j].getAttribute('data-id')!==id;}try{var scs=document.querySelector('section.cdxsec[data-cat=\"'+cat+'\"]');cdxHydrateSprites(scs);cdxHydrateThumbs(scs);cdxHydrateExt(scs);cdxFigZoom(scs);}catch(e){}}" +
        "function cdxSearch(v){v=(v||'').toLowerCase();" +
        "var rs=document.querySelectorAll('section.cdxsec[data-cat=\"'+cdxCat+'\"] .cdxrow');for(var i=0;i<rs.length;i++){var t=rs[i].textContent||'';rs[i].style.display=t.toLowerCase().indexOf(v)>=0?'':'none';}}" +
        "function cdxOpener(){try{if(window.opener&&!window.opener.closed&&window.opener.Sprites&&window.opener.Buildings)return window.opener;}catch(e){}return null;}" +
        "function cdxPretty(t){try{return String(t).split('_').map(function(w){return w?w.charAt(0).toUpperCase()+w.slice(1):w;}).join(' ');}catch(e){return String(t);}}" +
        "function cdxHydrateSprites(root){var op=cdxOpener();var all=(root||document).querySelectorAll('canvas.cdxspr');if(!op){for(var z=0;z<all.length;z++){var ph=document.createElement('div');ph.className='cdxico';ph.textContent='\\u2753';all[z].parentNode.replaceChild(ph,all[z]);}return false;}for(var i=0;i<all.length;i++){var c=all[i];try{var gw=c.getAttribute('data-gear-w'),ga=c.getAttribute('data-gear-a'),gs=c.getAttribute('data-gear-s');var spr=null;if(c.getAttribute('data-npc')){try{var nr=c.getAttribute('data-role')||'villager';var na=null;try{var raw=c.getAttribute('data-app');if(raw&&op.Appearance&&op.Appearance.unpack)na=op.Appearance.unpack(JSON.parse(raw));}catch(eA){}var ns=nr;try{if(na&&op.Appearance&&op.Appearance.key)ns=nr+'|'+op.Appearance.key(na);}catch(eK){}spr=op.Sprites.actor(nr,'#ffffff',ns,null,na,'');}catch(eN){spr=null;}}else if(gw||ga||gs){spr=op.Sprites.actor('player','#4da3ff','p',{w:gw||null,a:ga||null,s:gs||null},null);}else{var kind=c.getAttribute('data-kind'),tint=c.getAttribute('data-tint')||'#ffffff';spr=op.Sprites.actor(kind,tint,kind);}var g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);try{g.imageSmoothingEnabled=true;}catch(e2){}if(spr){g.drawImage(spr,0,0,c.width,c.height);}else{continue;}try{g.imageSmoothingEnabled=false;}catch(e3){}}catch(e){}}return true;}" +
        "function cdxMockFor(op,ck,cls,t){try{var KEEP={village_keep:'village',town_keep:'town',city_citadel:'city',tide_keep:'watergate',sakura_castle:'sakura',sun_keep:'desert_souk',gilt_keep:'trade_city',harbor_keep:'port_city'};var B=op.Buildings;var st=(B.STYLES||{})[KEEP[ck]||t]||null;var w=cls.w||6,hh=cls.h||5;var notches=[];try{notches=B.notchRectsFor?B.notchRectsFor(ck,w,hh):[];}catch(e2){notches=[];}return {classKey:ck,title:cls.n||ck,x0:0,y0:0,x1:w-1,y1:hh-1,w:w,h:hh,style:st,wall:(st&&st.wall==='STONEWALL')?'STONEWALL':'HOUSEWALL',floor:(st&&st.floor)||'TOWNSTONE',doors:[{x:1+Math.floor((w-2)/2),y:hh-1}],windows:[{x:1,y:0},{x:w-2,y:0}],furniture:[],id:'cdx_'+ck+'_'+t,notches:notches};}catch(e){return null;}}" +
        "function cdxHydrateExt(root){if(!root||!root.querySelectorAll)return;var op=cdxOpener();var rows=root.querySelectorAll('[data-cdxext]');for(var i=0;i<rows.length;i++){var box=rows[i];if(box.getAttribute('data-done')==='1')continue;box.setAttribute('data-done','1');if(!op){box.innerHTML='<div class=cdxnote>Reopen the Codex from the game \\u2014 previews draw live from game code.</div>';continue;}try{var ck=box.getAttribute('data-ck'),w=parseInt(box.getAttribute('data-w'),10)||6,hh=parseInt(box.getAttribute('data-h'),10)||5,nm=box.getAttribute('data-nm')||ck;var all=(box.getAttribute('data-types')||'').split(',').filter(Boolean);box.innerHTML='';for(var k=0;k<all.length;k++){try{var t=all[k];var mock=cdxMockFor(op,ck,{w:w,h:hh,n:nm},t);if(!mock)continue;var st=null;try{var KH={village_keep:'village',town_keep:'town',city_citadel:'city',tide_keep:'watergate',sakura_castle:'sakura',sun_keep:'desert_souk',gilt_keep:'trade_city',harbor_keep:'port_city'};st=(op.Buildings.STYLES||{})[KH[ck]||t]||null;}catch(e2){}var ts=32,MG=64;var big=document.createElement('canvas');big.width=mock.w*ts+MG*2;big.height=mock.h*ts+MG*2;var bctx=big.getContext('2d');op.Buildings.drawExteriorFor(bctx,ts,MG,MG,mock);var bx0=big.width,by0=big.height,bx1=-1,by1=-1;try{var bd=bctx.getImageData(0,0,big.width,big.height).data;for(var yy=0;yy<big.height;yy+=2){for(var xx=0;xx<big.width;xx+=2){if(bd[(yy*big.width+xx)*4+3]>8){if(xx<bx0)bx0=xx;if(xx>bx1)bx1=xx;if(yy<by0)by0=yy;if(yy>by1)by1=yy;}}}}catch(e3){bx0=0;by0=0;bx1=big.width-1;by1=big.height-1;}if(bx1<bx0)continue;var PAD=6;bx0=Math.max(0,bx0-PAD);by0=Math.max(0,by0-PAD);bx1=Math.min(big.width-1,bx1+PAD);by1=Math.min(big.height-1,by1+PAD);var cw=bx1-bx0+1,chh=by1-by0+1;var cv=document.createElement('canvas');cv.width=cw;cv.height=chh;cv.title=t+((st&&st.name)?' \\u2014 '+st.name+' roof':'');cv.className='cdxext';cv.style.setProperty('--cdx-ext-w',cw+'px');var ctx=cv.getContext('2d');ctx.fillStyle='#0d141b';ctx.fillRect(0,0,cw,chh);ctx.drawImage(big,bx0,by0,cw,chh,0,0,cw,chh);var wrap=document.createElement('div');wrap.style.cssText='text-align:center;font-size:10px;opacity:0.9;max-width:220px';wrap.appendChild(cv);var lb=document.createElement('div');lb.textContent=cdxPretty(t);wrap.appendChild(lb);var sub=document.createElement('div');sub.style.opacity='0.7';sub.textContent=(st&&st.name)?st.name+' roof':t;wrap.appendChild(sub);box.appendChild(wrap);}catch(e2){}}}catch(e){}}}" +
        "var cdxLive=cdxHydrateSprites(document);try{var vs0=document.querySelector('section.cdxsec:not([hidden])');cdxHydrateThumbs(vs0);cdxHydrateExt(vs0);cdxFigZoom(vs0);}catch(e){}if(!cdxLive){var cdd=document.getElementById('cdxDead');if(cdd)cdd.hidden=false;}" +
        "<\/script></div></body></html>";
    } finally { forPopup = false; }
  }
  function openWindow() {
    let w = null;
    try {
      const aw = (window.screen && window.screen.availWidth) || 1600;
      const ah = (window.screen && window.screen.availHeight) || 900;
      const W = Math.max(1100, Math.min(2000, Math.floor(aw - 60)));
      const H = Math.max(720, Math.min(1200, Math.floor(ah - 60)));
      w = window.open("", "_blank", "width=" + W + ",height=" + H);
    } catch (err) { w = null; }
    if (!w) { try { if (window.UI && window.UI.toast) window.UI.toast("📖 Popup blocked — allow popups for this site, then try again.", 5000); } catch (e) { } return false; }
    let html = "";
    try { html = standaloneHtml(); } catch (err) { html = ""; }
    if (!html) { try { w.close(); } catch (err2) { } return false; }
    try {
      w.document.open();
      w.document.write(html);
      w.document.close();
      try { w.focus(); } catch (err2) { }
      return true;
    } catch (err) { try { w.close(); } catch (err2) { } return false; }
  }
  return { renderInto, openWindow, standaloneHtml, setMobLv, openPanel, closePanel, isPanelOpen, parseCodexHash };
})();
