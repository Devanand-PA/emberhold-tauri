/* Boss data loader — reads src/data/bosses.yaml ONCE at page load and writes
 * the parsed tables straight into the live config (CFG.MOB_TEMPLATES,
 * CFG.BOSS_MIN_EFF, CFG.BOSS_THEMES, CFG.BOSS_BULWARK, CFG.BOSS_HP_TRIM,
 * CFG.BOSS_TIER_BULK, CFG.BOSS_MAGIC_TIER) — the same hash-map slots the
 * spawner, codex and practice summoner already read. After that the YAML text
 * is never touched again: spawning does no parsing, no fetching, no string
 * work. Rebalance freely; the running game costs nothing extra.
 *
 * The parser below is deliberately tiny: it supports exactly the schema used
 * by bosses.yaml (indented maps, scalars, flow lists, # comments) — not full
 * YAML. Keep the file in that shape and everything keeps working. If the file
 * fails to load or parse, the game logs a warning and keeps the built-in JS
 * defaults, so it always boots.
 */
window.BossData = (() => {
  const PATH = "src/data/bosses.yaml";
  const EXPECT_VERSION = 1;
  // Boolean template extras the YAML manages per boss. Anything listed in a
  // boss's `flags:` is set true; managed keys NOT listed are removed — so the
  // file is the whole truth. Unknown template fields (mount, summonKind,
  // hellMech, ...) are left alone for forward-compat.
  const FLAG_KEYS = ["archer", "aquatic", "diver", "undead", "lavaBorn",
    "burrower", "passive", "docile", "tamable", "guard", "civilized"];

  const state = {
    loaded: false,       // true once YAML values are live in CFG
    version: 0,
    bosses: {},          // kind -> normalized entry (the optimal in-memory form)
    tierBulk: null,      // {hp:{1:n..}, atk:{}, matk:{}, def:{}}
    magicTier: null,     // {1:n..}
    error: null,
  };

  // Strip a trailing # comment. Safe for our files: every literal # in the
  // YAML (tints, battle-cries) is inside double quotes, and flow lists never
  // contain a bare # — so # outside quotes/brackets always starts a comment.
  function stripComment(line) {
    let single = false, dbl = false, depth = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (single) { if (c === "'") single = false; continue; }
      if (dbl) {
        if (c === "\\") { i++; continue; }
        if (c === '"') dbl = false;
        continue;
      }
      if (c === "'") single = true;
      else if (c === '"') dbl = true;
      else if (c === "[") depth++;
      else if (c === "]") depth = Math.max(0, depth - 1);
      else if (c === "#" && depth === 0 && (i === 0 || line[i - 1] === " " || line[i - 1] === "\t")) {
        return line.slice(0, i);
      }
    }
    return line;
  }

  function parseScalar(raw) {
    const s = raw.trim();
    if (s === "" || s === "null" || s === "~") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
      return s.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    if (s.length >= 2 && s[0] === "'" && s[s.length - 1] === "'") {
      return s.slice(1, -1).replace(/''/g, "'");
    }
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return Number(s);
    return s;
  }

  function parseFlowList(raw) {
    // raw includes the brackets. Split on top-level commas (quotes respected).
    const inner = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
    const items = [];
    let cur = "", single = false, dbl = false;
    for (let i = 0; i < inner.length; i++) {
      const c = inner[i];
      if (single) { cur += c; if (c === "'") single = false; continue; }
      if (dbl) { cur += c; if (c === "\\") { cur += inner[++i] || ""; continue; } if (c === '"') dbl = false; continue; }
      if (c === "'") { single = true; cur += c; }
      else if (c === '"') { dbl = true; cur += c; }
      else if (c === ",") { if (cur.trim() !== "") items.push(parseScalar(cur)); cur = ""; }
      else cur += c;
    }
    if (cur.trim() !== "") items.push(parseScalar(cur));
    return items;
  }

  // Minimal indent-map parser. Returns nested plain objects; flow lists and
  // scalars at the leaves. 2-space indent as generated; tabs count as 2.
  function parseYaml(text) {
    const root = {};
    const stack = [{ indent: -1, obj: root }];
    const lines = String(text).split(/\r?\n/);
    for (let ln = 0; ln < lines.length; ln++) {
      const noComment = stripComment(lines[ln]);
      if (!noComment.trim()) continue;
      let indent = 0;
      while (noComment[indent] === " " || noComment[indent] === "\t") indent += (noComment[indent] === "\t" ? 2 : 1);
      const line = noComment.slice(indent);
      if (!line) continue;
      const colon = line.indexOf(":");
      if (colon < 0) throw new Error("bosses.yaml line " + (ln + 1) + ": no ':' — " + line.slice(0, 60));
      const key = line.slice(0, colon).trim();
      const rest = line.slice(colon + 1).trim();
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      const parent = stack[stack.length - 1].obj;
      if (rest === "") {
        const child = {};
        parent[key] = child;
        stack.push({ indent, obj: child });
      } else if (rest[0] === "[") {
        parent[key] = parseFlowList(rest);
      } else {
        parent[key] = parseScalar(rest);
      }
    }
    return root;
  }

  function num(v, dflt) {
    const n = Number(v);
    return (v != null && isFinite(n)) ? n : dflt;
  }

  // Apply ONE boss entry onto CFG. Public so late planters (goddess) can
  // re-apply YAML values over freshly planted defaults.
  function applyKind(kind, b) {
    try {
      const C = window.CFG;
      if (!C || !C.MOB_TEMPLATES || !b) return false;
      const T = C.MOB_TEMPLATES[kind] || (C.MOB_TEMPLATES[kind] = {});
      if (b.name != null) T.name = String(b.name);
      if (b.hp != null) T.hp = num(b.hp, T.hp);
      if (b.mp != null) T.mp = num(b.mp, T.mp);
      if (b.atk != null) T.atk = num(b.atk, T.atk);
      if (b.def != null) T.def = num(b.def, T.def);
      if (b.spd != null) T.spd = num(b.spd, T.spd);
      if (b.xp != null) T.xp = num(b.xp, T.xp);
      if (Array.isArray(b.abilities)) T.abilities = b.abilities.slice();
      if (b.body != null) T.body = String(b.body);
      if (b.tint != null) T.tint = String(b.tint);
      T.boss = true;
      if (b.heaven_boss) T.heavenBoss = true; else delete T.heavenBoss;
      const flags = Array.isArray(b.flags) ? b.flags : [];
      for (const f of FLAG_KEYS) {
        if (flags.indexOf(f) >= 0) T[f] = true; else delete T[f];
      }
      if (Array.isArray(b.tricks) && b.tricks.length) T.bossMech = b.tricks.slice();
      else delete T.bossMech;
      if (b.say != null) T.bossSay = String(b.say); else delete T.bossSay;
      if (C.BOSS_MIN_EFF) C.BOSS_MIN_EFF[kind] = Math.max(1, Math.round(num(b.tier, 1)) || 1);
      if (C.BOSS_THEMES) C.BOSS_THEMES[kind] = Array.isArray(b.themes) ? b.themes.slice() : [];
      if (b.frail != null || b.weak != null) {
        if (C.BOSS_BULWARK) C.BOSS_BULWARK[kind] = { frail: b.frail || "mag", weak: b.weak || "holy" };
      }
      if (C.BOSS_HP_TRIM) {
        if (b.hp_trim != null) C.BOSS_HP_TRIM[kind] = num(b.hp_trim, 1);
        else if (!(kind in C.BOSS_HP_TRIM)) C.BOSS_HP_TRIM[kind] = 1;
      }
      // Roster wiring: ensure membership, never remove (retire via
      // warlord:false + themes:[] in the YAML, which stops picks but keeps
      // the kind summonable).
      const warlord = (b.warlord !== false);
      const roster = String(b.roster || "surface");
      if (warlord) {
        if (C.BOSS_KINDS && C.BOSS_KINDS.indexOf(kind) < 0) C.BOSS_KINDS.push(kind);
        if (roster === "hell" && C.HELL_BOSS_KINDS && C.HELL_BOSS_KINDS.indexOf(kind) < 0) C.HELL_BOSS_KINDS.push(kind);
        if (roster === "heaven" && C.HEAVEN_BOSS_KINDS && C.HEAVEN_BOSS_KINDS.indexOf(kind) < 0) C.HEAVEN_BOSS_KINDS.push(kind);
      }
      if (kind === "goddess") {
        if (C.BOSS_KINDS && C.BOSS_KINDS.indexOf("goddess") < 0) C.BOSS_KINDS.push("goddess");
        if (C.HEAVEN_BOSS_KINDS && C.HEAVEN_BOSS_KINDS.indexOf("goddess") < 0) C.HEAVEN_BOSS_KINDS.push("goddess");
      }
      return true;
    } catch (e) { return false; }
  }

  function applyAll(data) {
    const C = window.CFG;
    if (!C) return 0;
    if (data && data.meta && data.meta.version != null) {
      state.version = num(data.meta.version, 0);
      if (state.version !== EXPECT_VERSION) {
        try { console.warn("[BossData] bosses.yaml version " + state.version + " != loader " + EXPECT_VERSION + " — applied anyway, check the schema."); } catch (e) {}
      }
    }
    // Tier bulk: normalize to {hp:{1:n..},...} with numeric values. Missing
    // rows fall back to the compiled defaults already in CFG.
    if (data && data.tier_bulk) {
      state.tierBulk = {};
      for (const sec of ["hp", "atk", "matk", "def"]) {
        const src = data.tier_bulk[sec] || {};
        const row = {};
        for (let t = 1; t <= 12; t++) {
          const v = num(src[String(t)], NaN);
          if (isFinite(v)) row[t] = v;
        }
        if (Object.keys(row).length) {
          state.tierBulk[sec.toUpperCase()] = row;
          try {
            if (C.BOSS_TIER_BULK) {
              C.BOSS_TIER_BULK[sec.toUpperCase()] = Object.assign({}, C.BOSS_TIER_BULK[sec.toUpperCase()], row);
            }
          } catch (e) {}
        }
      }
    }
    if (data && data.magic_tier) {
      state.magicTier = {};
      for (let t = 1; t <= 6; t++) {
        const v = num(data.magic_tier[String(t)], NaN);
        if (isFinite(v)) {
          state.magicTier[t] = v;
          try { if (C.BOSS_MAGIC_TIER) C.BOSS_MAGIC_TIER[t] = v; } catch (e) {}
        }
      }
    }
    let n = 0;
    const bosses = (data && data.bosses) || {};
    state.bosses = {};
    for (const kind of Object.keys(bosses)) {
      const b = bosses[kind] || {};
      state.bosses[kind] = b;   // the in-memory table: parsed once, read forever
      if (applyKind(kind, b)) n++;
    }
    return n;
  }

  async function load() {
    if (state.loaded) return true;
    try {
      const res = await fetch(PATH, { cache: "no-store" });
      if (!res || !res.ok) throw new Error("HTTP " + (res && res.status));
      const text = await res.text();
      const data = parseYaml(text);
      const n = applyAll(data);
      state.loaded = true;
      try { console.log("[BossData] bosses.yaml live: " + n + " warlords + tier bulk in memory."); } catch (e) {}
      return true;
    } catch (e) {
      state.error = String((e && e.message) || e);
      try { console.warn("[BossData] bosses.yaml not applied (" + state.error + ") — built-in defaults stand."); } catch (e2) {}
      return false;
    }
  }

  const ready = load();
  return {
    load, ready, applyKind,
    get loaded() { return state.loaded; },
    get error() { return state.error; },
    get version() { return state.version; },
    get bosses() { return state.bosses; },
    get tierBulk() { return state.tierBulk; },
    get magicTier() { return state.magicTier; },
    boss: (kind) => state.bosses[kind] || null,
  };
})();
