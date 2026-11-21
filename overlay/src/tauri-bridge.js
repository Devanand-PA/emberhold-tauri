/* Tauri desktop bridge — Emberhold
 *
 * The game is a plain static HTML/JS build; everything works inside the Tauri
 * webview as-is except ONE thing: writing files. On Linux the webview is
 * WebKitGTK, which has no download handler, so the game's 📤 save export
 * (`<a download>` + blob URL) silently does nothing.
 *
 * This bridge intercepts exactly those anchor clicks and routes them through a
 * native save dialog (Rust command `save_export_file` in src-tauri/src/lib.rs),
 * which writes the JSON backup anywhere the player chooses. Save IMPORT
 * (`<input type=file>`) already works in the webview and is left untouched.
 *
 * No Tauri JS API bundle is needed: Tauri v2 always exposes
 * `window.__TAURI_INTERNALS__.invoke` in the main frame, which is all we call.
 * In a browser (no Tauri) this file does nothing and downloads run natively.
 */
(function () {
  try {
    var internals = window.__TAURI_INTERNALS__;
    if (!internals || typeof internals.invoke !== "function") return; // browser: no-op

    var invoke = internals.invoke.bind(internals);
    window.EmberholdDesktop = {
      isDesktop: true,
      isTauri: true,
      saveExportFile: function (args) { return invoke("save_export_file", args); },
      setFullscreen: function (fullscreen) { return invoke("set_fullscreen", { fullscreen: !!fullscreen }); },
      isFullscreen: function () { return invoke("is_fullscreen"); },
      toggleFullscreen: function () { return invoke("toggle_fullscreen"); },
    };

    var toast = function (msg, ms) {
      try {
        if (window.UI && typeof window.UI.toast === "function") { window.UI.toast(msg, ms || 4000); return; }
      } catch (e) { }
      try { console.log(msg); } catch (e2) { }
    };

    // Route blob downloads through the native save dialog.
    var origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try {
        var isFileDownload =
          this instanceof HTMLAnchorElement &&
          this.hasAttribute && this.hasAttribute("download") &&
          typeof this.href === "string" && this.href.indexOf("blob:") === 0;
        if (!isFileDownload) return origClick.call(this);

        var anchor = this;
        var href = this.href;
        var name = this.getAttribute("download") || "emberhold-backup.json";
        // stop the in-page blob navigation/download path (it can't write a file here)
        try { if (typeof this.removeAttribute === "function") this.removeAttribute("download"); } catch (e) { }
        try { this.setAttribute("target", "_self"); } catch (e2) { }

        fetch(href)
          .then(function (r) { return r.text(); })
          .then(function (contents) {
            return internals.invoke("save_export_file", { filename: name, contents: contents });
          })
          .then(function (path) {
            if (path) toast("💾 Backup saved to " + path, 6000);
            else toast("📤 Export cancelled.", 3500);
          })
          .catch(function (err) {
            try { console.error("Emberhold export failed", err); } catch (e) { }
            toast("Export failed — could not write the backup file.", 5000);
          })
          .then(function () {
            try { URL.revokeObjectURL(href); } catch (e) { }
            try { anchor.remove(); } catch (e) { }
          });
        return;
      } catch (e) {
        try { return origClick.call(this); } catch (e2) { }
      }
    };
  } catch (e) { }
})();