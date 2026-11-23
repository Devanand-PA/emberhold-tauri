// Standalone tests for the LocalKv disk shadow layer (game/src/core/kv_local.js
// + the kv_shadow_* Rust commands in src-tauri/src/lib.rs).
//
// Three VM contexts:
//   A) IDB "broken" (transactions throw, like WebKitGTK losing writes) ->
//      puts go to the shadow, gets read back through it, deletes remove it.
//   B) no indexedDB at all (browser-like) -> puts go to memMap + shadow,
//      gets read through the shadow.
//   C) healthy IDB -> put mirrors to IDB + shadow, get prefers the IDB value
//      (shadow is only a read fallback).
// Run: node test/kv_local_test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const KV_LOCAL = fileURLToPath(new URL("../game/src/core/kv_local.js", import.meta.url));
const src = readFileSync(KV_LOCAL, "utf8");

const assert = (cond, msg) => { if (!cond) throw new Error("FAIL: " + msg); };

// Mock of window.__TAURI_INTERNALS__.invoke backed by a plain Map standing in
// for the Rust-side shadow store. Keyed by "folder\0key" like the real
// kv_shadow_* commands (which store per-folder files and return entries for
// the folder). Returns null when a key is absent, like the Rust
// kv_shadow_read command.
const SEP = "\0";
function makeShadowMock() {
  const shadow = new Map(); // "folder\0key" -> value
  const calls = [];
  const keyOf = (folder, key) => folder + SEP + key;
  const invoke = async (cmd, args) => {
    calls.push({ cmd, args });
    const folder = args.folder;
    switch (cmd) {
      case "kv_shadow_read": return shadow.has(keyOf(folder, args.key)) ? shadow.get(keyOf(folder, args.key)) : null;
      case "kv_shadow_write": shadow.set(keyOf(folder, args.key), args.data); return;
      case "kv_shadow_delete": shadow.delete(keyOf(folder, args.key)); return;
      case "kv_shadow_entries": {
        const out = [];
        for (const [k, v] of shadow) {
          if (k.startsWith(folder + SEP)) out.push([k.slice(folder.length + SEP.length), v]);
        }
        return out;
      }
      default: throw new Error("unknown command: " + cmd);
    }
  };
  return { shadow, calls, invoke };
}

// reqObj: an IndexedDB request whose onsuccess fires on the next microtask,
// mirroring how `req()` in kv_local.js consumes it.
function reqObj(result) {
  const r = { result };
  let f = null;
  Object.defineProperty(r, "onsuccess", {
    set(fn) { f = fn; Promise.resolve().then(() => { if (f) f(); }); },
    get() { return f; },
  });
  Object.defineProperty(r, "onerror", { set() { }, get() { return null; } });
  return r;
}

function makeCtx(kind) {
  const mock = makeShadowMock();
  const ctx = { console, window: {} };
  ctx.window.__TAURI_INTERNALS__ = { invoke: mock.invoke };

  if (kind === "broken-idb") {
    const db = { transaction() { throw new Error("fake IDB: write lost"); } };
    ctx.window.indexedDB = {
      open: () => {
        const r = { result: db, onsuccess: null, onerror: null, onupgradeneeded: null };
        Promise.resolve().then(() => r.onsuccess());
        return r;
      },
      // no `databases` function on purpose
    };
  } else if (kind === "healthy-idb") {
    const idb = new Map(); // fullKey -> value
    const healthyDb = {
      transaction() {
        const st = {
          put(val, k) { idb.set(k, val); },
          delete(k) { idb.delete(k); },
          get(k) { return reqObj(idb.has(k) ? idb.get(k) : undefined); },
        };
        const tx = { objectStore: () => st, oncomplete: null, onabort: null, onerror: null };
        Promise.resolve().then(() => { if (tx.oncomplete) tx.oncomplete(); });
        return tx;
      },
    };
    ctx.window.indexedDB = {
      open: () => {
        const r = { result: healthyDb, onsuccess: null, onerror: null, onupgradeneeded: null };
        Promise.resolve().then(() => r.onsuccess());
        return r;
      },
    };
    ctx.__idb = idb;
  }
  // kind === "no-idb": leave window.indexedDB unset (browser: memFallback)

  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { ctx, LocalKv: ctx.window.LocalKv, mock, idb: ctx.__idb };
}

// A) IDB broken -> shadow is the durable store
async function testBrokenIdb() {
  const { LocalKv, mock } = makeCtx("broken-idb");
  const v1 = { name: "Bob", hp: 30, items: ["sword"] };
  await LocalKv.psave.set("k1", v1);
  assert(mock.shadow.get("psave\0s:k1") === v1, "A: set wrote the shadow");
  assert(mock.calls.some((c) => c.cmd === "kv_shadow_write" && c.args.folder === "psave"), "A: shadow write invoked");
  const got = await LocalKv.psave.get("k1");
  assert(got === v1, "A: get returns the value read from the shadow after IDB missed");
  const entries = await LocalKv.psave.entries();
  assert(entries.length === 1 && entries[0][0] === "k1" && entries[0][1] === v1, "A: entries() merges shadow");
  await LocalKv.psave.delete("k1");
  assert(!mock.shadow.has("psave\0s:k1"), "A: delete removes the shadow entry");
  const got2 = await LocalKv.psave.get("k1");
  assert(got2 === undefined, "A: get after delete returns undefined");
  const v2 = { v: 2 };
  await LocalKv.psave.set("slot_2", v2);
  assert(await LocalKv.psave.get("slot_2") === v2, "A: second round trip works");
  console.log("A) broken-idb: OK");
}

// B) no indexedDB at all -> shadow + memMap
async function testNoIdb() {
  const { LocalKv, mock } = makeCtx("no-idb");
  const v1 = { name: "Gwen", hp: 12 };
  await LocalKv.psave.set("k1", v1);
  assert(mock.shadow.get("psave\0s:k1") === v1, "B: set wrote the shadow");
  const got = await LocalKv.psave.get("k1");
  assert(got === v1, "B: get returns the shadow value (IDB unavailable)");
  console.log("B) no-idb: OK");
}

// C) healthy IDB -> put mirrors to IDB + shadow, get prefers the IDB value
async function testHealthyIdb() {
  const { LocalKv, mock, idb } = makeCtx("healthy-idb");
  const v1 = { name: "Cleo", hp: 50 };
  await LocalKv.psave.set("k1", v1);
  assert(idb.get("psave\0s:k1") === v1, "C: put wrote IDB");
  assert(mock.shadow.get("psave\0s:k1") === v1, "C: put mirrored to shadow");
  const got = await LocalKv.psave.get("k1");
  assert(got === v1, "C: get returns the value");
  assert(!mock.calls.some((c) => c.cmd === "kv_shadow_read" && c.args.key === "s:k1"), "C: IDB hit — shadow read not needed");
  const entries = await LocalKv.psave.entries();
  assert(entries.length === 1 && entries[0][0] === "k1" && entries[0][1] === v1, "C: entries() merges");
  await LocalKv.psave.delete("k1");
  assert(!idb.has("psave\0s:k1") && !mock.shadow.has("psave\0s:k1"), "C: delete removed from IDB + shadow");
  console.log("C) healthy-idb: OK");
}

await testBrokenIdb();
await testNoIdb();
await testHealthyIdb();
console.log("kv_local tests: all passed");
