/* Theme manager: multiple UI themes for the whole app. window.Theme
   - Themes are pure CSS: body[data-theme="..."] sets CSS variables in index.html.
   - Persisted in localStorage (global, not per-save) so title/HUD/menus all match.
   - Pickers live in the title screen + pause menu (rendered by UI).
*/
window.Theme = (() => {
  const KEY = "emberhold-theme-v1";
  const ORDER = ["ember", "brawl", "forest", "crimson", "sakura", "midnight"];
  const META = {
    ember:    { name: "Emberhold",  icon: "🔥", blurb: "Classic hearth-dark + gold" },
    brawl:    { name: "Brawl Blue", icon: "💙", blurb: "Bright arena blue, white ring" },
    forest:   { name: "Forest Vale", icon: "🌲", blurb: "Moss green + parchment" },
    crimson:  { name: "Crimson Crypt", icon: "🩸", blurb: "Blood-red dungeon dark" },
    sakura:   { name: "Sakura Dawn", icon: "🌸", blurb: "Light pink day theme" },
    midnight: { name: "Midnight Neon", icon: "🌙", blurb: "OLED black + cyan neon" },
  };
  function valid(n) { return ORDER.includes(n) ? n : "forest"; }
  function current() {
    try {
      const v = localStorage.getItem(KEY);
      if (v && ORDER.includes(v)) return v;
    } catch (e) { }
    return "forest";
  }
  function apply(name, silent) {
    name = valid(name);
    try { document.body.dataset.theme = name; } catch (e) { }
    try { localStorage.setItem(KEY, name); } catch (e) { }
    try {
      document.querySelectorAll("[data-theme-pick]").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-theme-pick") === name);
      });
      for (const id of ["titleThemeSel", "menuThemeSel"]) {
        const sel = document.getElementById(id);
        if (sel && sel.value !== name) sel.value = name;
      }
    } catch (e) { }
    if (!silent) {
      try { if (window.UI) window.UI.toast(`${META[name].name} theme`, 1800); } catch (e) { }
    }
    return name;
  }
  function init() {
    try { apply(current(), true); } catch (e) { }
  }
  // run immediately (script loads at end of body, before UI.boot)
  try { init(); } catch (e) { }
  return { ORDER, META, current, apply, init };
})();
