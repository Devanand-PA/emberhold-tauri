/* Canvas compatibility shim. Must load before any other game script.
 * Some environments (broken/blocklisted GPU, constrained webviews, headless
 * software GL) silently fail GPU-accelerated alpha 2D canvases above a tiny
 * size: draws become no-ops and readback is blank. That blanks the tile atlas,
 * the cached ground layer, the darkness overlay, the minimap, portraits...
 * i.e. "terrain missing, minimap glitching" with a healthy sim underneath.
 * This probes once at boot: if a 256x256 alpha canvas misbehaves but a
 * software-backed one works, 2D contexts are forced to software rendering.
 * Healthy browsers pass the probe and are completely untouched. */
(function () {
  "use strict";
  function probeBroken() {
    try {
      // 1) does a normal alpha canvas work at a size the game needs?
      var c1 = document.createElement("canvas");
      c1.width = 256; c1.height = 256;
      var g1 = c1.getContext("2d");
      if (!g1) return false;
      g1.fillStyle = "#ff0000";
      g1.fillRect(0, 0, 256, 256);
      var d1 = g1.getImageData(128, 128, 1, 1).data;
      if (d1[0] === 255 && d1[3] === 255) return false; // healthy
      // 2) does software backing work? Only patch if it does.
      var c2 = document.createElement("canvas");
      c2.width = 256; c2.height = 256;
      var g2 = null;
      try { g2 = c2.getContext("2d", { willReadFrequently: true }); }
      catch (e) { g2 = c2.getContext("2d"); }
      if (!g2) return false;
      g2.fillStyle = "#ff0000";
      g2.fillRect(0, 0, 256, 256);
      var d2 = g2.getImageData(128, 128, 1, 1).data;
      return (d2[0] === 255 && d2[3] === 255);
    } catch (e) { return false; }
  }
  var broken = false;
  try { broken = probeBroken(); } catch (e) { broken = false; }
  try { window.__swCanvas = !!broken; } catch (e) {}
  if (!broken) return;
  // Force software rendering for every 2D canvas in the game. Existing
  // options (e.g. {alpha:false} on the main canvas) are preserved and only
  // augmented. Non-2d contexts are untouched.
  try {
    var orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, opts) {
      if (type === "2d") {
        var o = { willReadFrequently: true };
        if (opts && typeof opts === "object") {
          for (var k in opts) {
            try { o[k] = opts[k]; } catch (e) {}
          }
          // explicit opt-out stays opted out
          if (opts.willReadFrequently === false) o.willReadFrequently = false;
        }
        try { return orig.call(this, type, o); } catch (e) {}
      }
      try { return orig.apply(this, arguments); }
      catch (e) { return null; }
    };
    try { HTMLCanvasElement.prototype.getContext._swPatched = true; } catch (e) {}
  } catch (e) {}
})();
