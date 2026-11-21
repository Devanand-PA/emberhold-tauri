/* Upstream update check — Emberhold
 *
 * Defines window.UpdateCheck. On load it asks the GitHub commits API of the
 * upstream game repo (https://github.com/Devanand-PA/emberhold) and compares
 * the newest commit with the local game checkout:
 *
 *   - local:  window.EmberholdGameCommit (embedded by scripts/sync-frontend.mjs)
 *             or the `game_commit` Tauri command (src-tauri/src/lib.rs)
 *   - remote: https://api.github.com/repos/Devanand-PA/emberhold/commits
 *
 * When upstream is ahead, a modal prompt appears ("Updates available — reload
 * to pull them?"):
 *   - "Reload to update" runs the native `pull_game_updates` command
 *     (git pull + frontend re-sync in dev, src-tauri/src/lib.rs) and then
 *     reloads the game.
 *   - "Later" dismisses the prompt for 12h per upstream SHA (localStorage).
 *
 * In a plain browser (no Tauri) reloading pulls nothing new — game files in
 * raw source arrive via `npm run update-game`.
 */
(function () {
  "use strict";

  var UPSTREAM_URL = "https://api.github.com/repos/Devanand-PA/emberhold/commits?per_page=1";
  var PROMPT_KEY = "emberhold-update-prompt";
  var PROMPT_TTL_MS = 12 * 60 * 60 * 1000;

  var promptShown = false;

  function shortSha(v) {
    try {
      var s = String(v == null ? "" : v).trim().toLowerCase();
      return /^[0-9a-f]{7,40}$/.test(s) ? s.slice(0, 7) : null;
    } catch (e) {
      return null;
    }
  }

  function invoke(cmd) {
    try {
      var internals = window.__TAURI_INTERNALS__;
      if (!internals || typeof internals.invoke !== "function") return null;
      return internals.invoke(cmd, {});
    } catch (e) {
      return null;
    }
  }

  function toast(msg) {
    try {
      if (window.UI && typeof window.UI.toast === "function") { window.UI.toast(String(msg), 6000); return; }
    } catch (e) { }
    try { window.console.log(String(msg)); } catch (e2) { }
  }

  function reloadPage() {
    try { window.location.reload(); } catch (e) { }
  }

  // --- local state ---
  // Prefer the live Rust-side commit; fall back to the commit embedded by
  // sync-frontend.mjs (the only option in a plain browser).
  function localCommit() {
    var p = invoke("game_commit");
    if (p && typeof p.then === "function") {
      return p.then(function (v) {
        return shortSha(v) || shortSha(window.EmberholdGameCommit);
      }, function () {
        return shortSha(window.EmberholdGameCommit);
      });
    }
    return Promise.resolve(shortSha(window.EmberholdGameCommit));
  }

  // --- upstream state: newest commit on the game repo's default branch ---
  function remoteCommit() {
    try {
      var opts = { cache: "no-store" };
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
        opts.signal = AbortSignal.timeout(5000);
      }
      return fetch(UPSTREAM_URL, opts).then(function (r) {
        if (!r || !r.ok) return null;
        return r.json().then(function (data) {
          return (data && data[0] && data[0].sha) || null;
        });
      }, function () { return null; });
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  // --- "Later" bookkeeping: skip the prompt while the same remote SHA is handled ---
  function handledState() {
    try { return JSON.parse(window.localStorage.getItem(PROMPT_KEY) || "null"); } catch (e) { return null; }
  }
  function isHandled(remote) {
    var s = handledState();
    return !!s && s.sha === remote && typeof s.at === "number" && (Date.now() - s.at) < PROMPT_TTL_MS;
  }
  function saveHandled(remote) {
    try { window.localStorage.setItem(PROMPT_KEY, JSON.stringify({ sha: remote, at: Date.now() })); } catch (e) { }
  }

  // --- the modal (same .modal/.card classes as the game's own dialogs) ---
  function buildPrompt(remote) {
    var doc = window.document;
    var modal = doc.createElement("div");
    modal.id = "updatePrompt";
    modal.className = "modal update-prompt";
    modal.setAttribute("hidden", "");

    var card = doc.createElement("div");
    card.className = "card";
    card.style = "max-width:560px;text-align:left";

    var title = doc.createElement("h2");
    title.style = "margin:0 0 8px";
    title.textContent = "⬆️ Updates available";

    var para = doc.createElement("p");
    para.style = "font-size:13px;line-height:1.5;margin:6px 0";
    para.textContent = "The game on GitHub has newer commits than your local copy — reload to pull them in.";

    var row = doc.createElement("div");
    row.style = "font-size:12px;opacity:0.8;margin:6px 0";
    row.textContent = "Upstream: " + remote;

    var btnRow = doc.createElement("div");
    btnRow.style = "display:flex;gap:8px;justify-content:flex-end;margin-top:16px";

    var reloadBtn = doc.createElement("button");
    reloadBtn.id = "updateReloadBtn";
    reloadBtn.className = "ghost";
    reloadBtn.style = "padding:10px 18px;font-size:14px;font-weight:900";
    reloadBtn.textContent = "Reload to update";
    var laterBtn = doc.createElement("button");
    laterBtn.id = "updateLaterBtn";
    laterBtn.className = "ghost";
    laterBtn.style = "padding:10px 18px;font-size:14px";
    laterBtn.textContent = "Later (12h)";

    card.appendChild(title);
    card.appendChild(para);
    card.appendChild(row);
    btnRow.appendChild(reloadBtn);
    btnRow.appendChild(laterBtn);
    card.appendChild(btnRow);
    modal.appendChild(card);
    doc.body.appendChild(modal);

    reloadBtn.addEventListener("click", function () { onReload(remote); });
    laterBtn.addEventListener("click", function () { saveHandled(remote); hidePrompt(); });

    modal.hidden = false;
  }

  function showPrompt(remote) {
    var modal = window.document.getElementById("updatePrompt");
    if (!modal) buildPrompt(remote);
    else modal.hidden = false;
    promptShown = true;
  }

  function hidePrompt() {
    var modal = window.document.getElementById("updatePrompt");
    if (modal) modal.hidden = true;
    promptShown = false;
  }

  function onReload(remote) {
    hidePrompt();
    var p = invoke("pull_game_updates");
    if (p && typeof p.then === "function") {
      p.then(function (result) {
        var commit = (result && typeof result === "object" && typeof result.commit === "string")
          ? result.commit : result;
        if (typeof commit === "string" && commit) window.EmberholdGameCommit = commit;
        saveHandled(remote);
        toast("✅ Updates pulled — reloading the game…", 4000);
        window.setTimeout(reloadPage, 300);
      }, function (err) {
        toast("🔄 Couldn't pull updates: " + (err || "unknown error") + " — restart the app to pick them up.", 6000);
      });
    } else {
      // Browser: nothing to pull through — reload anyway.
      saveHandled(remote);
      toast("Reloading — pull new game files with `npm run update-game`.", 3000);
      window.setTimeout(reloadPage, 300);
    }
  }

  // --- check on load ---
  function check() {
    if (promptShown) return;
    localCommit().then(function (local) {
      if (!local) return;
      remoteCommit().then(function (remote) {
        var r = shortSha(remote);
        if (!r) return;
        if (r === local) return; // nothing newer
        if (isHandled(r)) return; // user already handled this SHA
        showPrompt(r);
      });
    });
  }

  window.UpdateCheck = {
    check: check,
    showPrompt: showPrompt,
    hidePrompt: hidePrompt,
    isHandled: isHandled,
    shortSha: shortSha,
  };

  try {
    var doc = window.document;
    if (doc && doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", function () { check(); });
    } else {
      check();
    }
  } catch (e) { }
})();
