/* Changelog popup — creator announcements from src/CHANGELOG.md.
   The md file carries its version in `<!-- changelog-version: N -->`.
   Each browser remembers the newest version it has seen (localStorage);
   when the file's version is newer, the popup shows once. Classic script:
   defines window.Changelog. */
window.Changelog = (() => {
  const FILE = "src/app/CHANGELOG.md";
  const SEEN_KEY = "emberhold-changelog-seen-v1";
  const VERSION_RE = /changelog-version:\s*(\d+)/i;

  function seenVersion() {
    try {
      const v = Number(localStorage.getItem(SEEN_KEY) || 0);
      return Number.isFinite(v) ? v : 0;
    } catch (e) { return 0; }
  }
  function markSeen(v) {
    try { localStorage.setItem(SEEN_KEY, String(v)); } catch (e) { }
  }
  function fileVersion(md) {
    try {
      const m = String(md).match(VERSION_RE);
      return m ? Number(m[1]) : 0;
    } catch (e) { return 0; }
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // inline: `code`, **bold**, *italic*, [text](url) — escape first, then decorate.
  function inline(s) {
    let h = esc(s);
    h = h.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
    h = h.replace(/\*\*([^*]+)\*\*/g, (_, b) => `<strong>${b}</strong>`);
    h = h.replace(/(^|[^*\w])\*([^*\n]+)\*/g, (_, pre, it) => `${pre}<em>${it}</em>`);
    h = h.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
    return h;
  }
  // tiny markdown subset: ## / ### headings, --- rules, - bullets, paragraphs.
  function render(md) {
    const lines = String(md || "").replace(/<!--[\s\S]*?-->/g, "").split("\n");
    let html = "", inList = false;
    const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, "");
      if (/^\s*$/.test(line)) { closeList(); continue; }
      let m;
      if ((m = line.match(/^###\s+(.*)/))) { closeList(); html += `<h4>${inline(m[1])}</h4>`; }
      else if ((m = line.match(/^##\s+(.*)/))) { closeList(); html += `<h3>${inline(m[1])}</h3>`; }
      else if ((m = line.match(/^#\s+(.*)/))) { closeList(); html += `<h2>${inline(m[1])}</h2>`; }
      else if (/^---+\s*$/.test(line)) { closeList(); html += "<hr>"; }
      else if ((m = line.match(/^\s*[-*]\s+(.*)/))) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${inline(m[1])}</li>`;
      }
      else { closeList(); html += `<p>${inline(line.trim())}</p>`; }
    }
    closeList();
    return html || "<p><em>The creator hasn't written anything here yet.</em></p>";
  }
  async function load() {
    const r = await fetch(FILE, { cache: "no-store" });
    if (!r.ok) throw new Error("changelog HTTP " + r.status);
    return await r.text();
  }
  function showModal(title, bodyHtml) {
    try {
      const t = document.getElementById("changelogTitle");
      const b = document.getElementById("changelogBody");
      const m = document.getElementById("changelogModal");
      if (!t || !b || !m) return false;
      t.textContent = title;
      b.innerHTML = bodyHtml;
      b.scrollTop = 0;
      m.hidden = false;
      return true;
    } catch (e) { return false; }
  }
  // Show once per version. Returns true if the popup opened.
  async function checkAndShow() {
    try {
      const md = await load();
      const v = fileVersion(md);
      if (!v || v <= seenVersion()) return false;
      if (!showModal("📜 What's new in Emberhold", render(md))) return false;
      try {
        const c = document.getElementById("changelogClose");
        if (c) c.onclick = () => hide(v);
      } catch (e) { }
      return true;
    } catch (e) { return false; }
  }
  // Manual open from Help / pause menu — shows whatever is in the file.
  async function openManual() {
    try {
      const md = await load();
      const v = fileVersion(md);
      showModal("📜 Changelog", render(md));
      try {
        const c = document.getElementById("changelogClose");
        if (c) c.onclick = () => hide(v || seenVersion());
      } catch (e) { }
    } catch (e) {
      showModal("📜 Changelog", "<p><em>Couldn't load the changelog just now — check back later.</em></p>");
    }
  }
  function hide(v) {
    try { document.getElementById("changelogModal").hidden = true; } catch (e) { }
    if (v) markSeen(v);
  }
  return { checkAndShow, openManual, hide, render, fileVersion, seenVersion };
})();
