// Standalone test for overlay/src/update-check.js (the upstream update check;
// copied into generated frontend/src/ by `npm run sync`).
// Run: npm test   (uses only Node, no dependencies)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const UPDATE_CHECK = fileURLToPath(new URL("../overlay/src/update-check.js", import.meta.url));
const src = readFileSync(UPDATE_CHECK, "utf8");

// Minimal DOM/window mock — update-check uses only these operations.
class FakeEl {
  constructor(tag) {
    this.tagName = tag.toLowerCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.style = "";
    this.textContent = "";
  }
  get id() { return this.attributes.id || ""; }
  set id(v) { this.attributes.id = v; }
  get className() { return this.attributes.class || ""; }
  set className(v) { this.attributes.class = v; }
  get hidden() { return Object.prototype.hasOwnProperty.call(this.attributes, "hidden"); }
  set hidden(v) { if (v) this.attributes.hidden = ""; else delete this.attributes.hidden; }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  click() { for (const f of this.listeners.click || []) f({ target: this }); }
}

function makeEnv({ tauri = false, invokeRejects = false, local = "49c1471", remote, seedHandled, fetchImpl, reloads, pullResult }) {
  const invoked = [];
  const toasts = [];
  const doc = { _all: [], readyState: "complete" };
  doc.createElement = (tag) => { const el = new FakeEl(tag); doc._all.push(el); return el; };
  doc.getElementById = (id) => doc._all.find((el) => el.id === id) || null;
  doc.addEventListener = () => { };
  doc.body = new FakeEl("body");

  const w = {
    document: doc,
    localStorage: (() => {
      const m = new Map();
      return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: (k) => m.delete(k),
      };
    })(),
    location: { reload: () => reloads.push(Date.now()) },
    setTimeout: (fn) => { fn(); },
    EmberholdGameCommit: local,
    console,
  };
  w.window = w;
  if (tauri) {
    w.__TAURI_INTERNALS__ = {
      invoke: (cmd) => {
        invoked.push(cmd);
        if (pullResult && cmd === "pull_game_updates") return Promise.resolve(pullResult);
        return invokeRejects ? Promise.reject(new Error("no game checkout found")) : Promise.resolve(local);
      },
    };
  }
  w.UI = { toast: (m) => toasts.push(m) };
  if (fetchImpl) {
    w.fetch = (url, opts) => fetchImpl(url, opts);
  }
  if (seedHandled) {
    w.localStorage.setItem("emberhold-update-prompt", JSON.stringify(seedHandled));
  }

  const ctx = vm.createContext(w);
  vm.runInContext(src, ctx); // auto-run: check() at load
  return { window: w, doc, invoked, toasts, reloads };
}

const flush = async (n = 20) => {
  for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r));
};

const LOCAL = "49c1471"; // game/ @ HEAD in this repo
const REMOTE_UP_TO_DATE = "49c147164d9dc7606c01620cbb1f26a5c3ef6f74"; // == local tip
const REMOTE_NEW = "9fceb02d0ae598e95dc970b74767f19372d61af8";
const NEW_SHA = "9fceb02"; // shortSha(REMOTE_NEW)
const PROMPT_KEY = "emberhold-update-prompt";

const checks = [];
const check = (name, cond) => checks.push([name, !!cond]);

const remoteFetch = (remote, reject) => () =>
  reject ? Promise.reject(new Error("offline")) : Promise.resolve({ ok: true, json: () => Promise.resolve([{ sha: remote }]) });

// 1) up to date: no prompt
{
  const env = makeEnv({ tauri: true, local: LOCAL, remote: REMOTE_UP_TO_DATE, fetchImpl: remoteFetch(REMOTE_UP_TO_DATE), reloads: [] });
  await flush();
  check("up-to-date: no prompt", env.doc.getElementById("updatePrompt") === null);
}

// 2) new upstream: prompt appears, Reload pulls + reloads
{
  const reloads = [];
  const env = makeEnv({ tauri: true, local: LOCAL, remote: REMOTE_NEW, fetchImpl: remoteFetch(REMOTE_NEW), reloads });
  await flush();
  const modal = env.doc.getElementById("updatePrompt");
  check("update-available: prompt shown", modal !== null && modal.hidden === false);
  const reloadBtn = env.doc.getElementById("updateReloadBtn");
  check("update-available: reload button", reloadBtn !== null);
  if (reloadBtn) reloadBtn.click();
  await flush();
  check("update-available: pull_game_updates invoked", env.invoked.includes("pull_game_updates"));
  check("update-available: reload after pull", reloads.length === 1);
  check("update-available: handled recorded", JSON.parse(env.window.localStorage.getItem(PROMPT_KEY)).sha === NEW_SHA);
}

// 3) "Later" dismisses, handled state stored, re-check skips
{
  const reloads = [];
  const env = makeEnv({ tauri: true, local: LOCAL, remote: REMOTE_NEW, fetchImpl: remoteFetch(REMOTE_NEW), reloads });
  await flush();
  check("later: prompt shown", env.doc.getElementById("updatePrompt")?.hidden === false);
  env.doc.getElementById("updateLaterBtn").click();
  await flush();
  check("later: prompt hidden", env.doc.getElementById("updatePrompt").hidden === true);
  check("later: handled stored", JSON.parse(env.window.localStorage.getItem(PROMPT_KEY)).sha === NEW_SHA);
  env.window.UpdateCheck.check();
  await flush();
  check("later: re-check does not re-prompt", env.doc.getElementById("updatePrompt").hidden === true);
}

// 4) handled SHA from a previous session skips the prompt
{
  const reloads = [];
  const env = makeEnv({
    tauri: true, local: LOCAL, remote: REMOTE_NEW, fetchImpl: remoteFetch(REMOTE_NEW), reloads,
    seedHandled: { sha: NEW_SHA, at: Date.now() },
  });
  await flush();
  check("handled: no prompt for handled SHA", env.doc.getElementById("updatePrompt") === null);
}

// 5) browser mode: prompt on reload without a pull
{
  const reloads = [];
  const env = makeEnv({ tauri: false, local: LOCAL, remote: REMOTE_NEW, fetchImpl: remoteFetch(REMOTE_NEW), reloads });
  await flush();
  check("browser: prompt shown", env.doc.getElementById("updatePrompt")?.hidden === false);
  env.doc.getElementById("updateReloadBtn").click();
  await flush();
  check("browser: reload without invoke", env.invoked.length === 0 && reloads.length === 1);
  check("browser: update toast", env.toasts.some((t) => t.includes("npm run update-game")));
}

// 6) offline: no prompt
{
  const env = makeEnv({ tauri: true, local: LOCAL, remote: null, fetchImpl: remoteFetch(null, true), reloads: [] });
  await flush();
  check("offline: no prompt", env.doc.getElementById("updatePrompt") === null);
}

// 7) no local commit resolvable: no prompt
{
  const env = makeEnv({ tauri: true, local: null, remote: REMOTE_NEW, fetchImpl: remoteFetch(REMOTE_NEW), reloads: [], invokeRejects: true });
  await flush();
  check("no-local: no prompt", env.doc.getElementById("updatePrompt") === null);
}

// 8) packaged: pull_game_updates returns {commit, served:false} → toast, no reload
{
  const reloads = [];
  const env = makeEnv({
    tauri: true, local: LOCAL, remote: REMOTE_NEW, fetchImpl: remoteFetch(REMOTE_NEW), reloads,
    pullResult: {
      commit: NEW_SHA,
      dir: "/home/u/.local/share/com.thevoidis999.emberhold/game",
      served: false,
    },
  });
  await flush();
  const modal = env.doc.getElementById("updatePrompt");
  check("packaged: prompt shown", modal !== null && modal.hidden === false);
  env.doc.getElementById("updateReloadBtn").click();
  await flush();
  check("packaged: pull_game_updates invoked", env.invoked.includes("pull_game_updates"));
  check("packaged: no reload", reloads.length === 0);
  check("packaged: update toast", env.toasts.some((t) => t.includes("install the latest app build")));
  check("packaged: commit set", env.window.EmberholdGameCommit === NEW_SHA);
}

const failed = checks.filter(([, ok]) => !ok);
console.log("checks:", JSON.stringify(checks, null, 1));
console.log(failed.length === 0 ? "PASS" : "FAIL");
process.exit(failed.length === 0 ? 0 : 1);
