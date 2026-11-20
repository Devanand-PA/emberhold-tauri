/* LocalKv — custom replacement for kv-plugin (no import needed). window.LocalKv.
   Same folder shape the game uses: LocalKv[folderName] ->
     { get, set, delete, entries, keys, has, getMany, setMany, update, deleteMany, clear, values }
   One IndexedDB database ("emberhold-localkv-v1"), one object store ("kv"),
   composite string keys: folder + "\0" + encoded key. No version upgrades ever
   (new folders/channels just add keys), so per-channel folders work for free.
   First boot auto-migrates every kv-plugin database ("<folder>-db-kv-plugin" /
   store "<folder>-store-kv-plugin") into the new store, so existing saves,
   channel caches and channel heroes survive the switch. If IndexedDB is
   unavailable (private mode), everything falls back to an in-memory Map.
   Boot wiring (bottom of file): assigns window.root.kv + window.kv, which is
   what world.js kvFolder() reads. This script must load before any save/load
   runs — it is the first src/ script in index.html. */
window.LocalKv = (() => {
  const DB_NAME = "emberhold-localkv-v1";
  const STORE = "kv";
  const SEP = "\0";
  const MIGRATION_FLAG = "localkv:migrated-v1";
  // Folders the game uses when indexedDB.databases() is unavailable (older
  // browsers) — per-channel folders (wchunks_ch_*) are covered by databases()
  // when present; channel caches are ephemeral host data and safe to miss.
  const KNOWN_FOLDERS = ["psave", "wchunks", "wnpcs", "wdungeons",
    "wchunks_s2", "wnpcs_s2", "wdungeons_s2",
    "wchunks_s3", "wnpcs_s3", "wdungeons_s3",
    "wchunks_s4", "wnpcs_s4", "wdungeons_s4",
    "wchunks_s5", "wnpcs_s5", "wdungeons_s5",
    "wchunks_sP", "wnpcs_sP", "wdungeons_sP"];

  function encKey(key) {
    if (typeof key === "string") return "s:" + key;
    if (typeof key === "number") return "n:" + key;
    try { return "j:" + JSON.stringify(key); } catch (e) { return "s:" + String(key); }
  }
  function decKey(enc) {
    if (enc.startsWith("s:")) return enc.slice(2);
    if (enc.startsWith("n:")) return Number(enc.slice(2));
    if (enc.startsWith("j:")) { try { return JSON.parse(enc.slice(2)); } catch (e) { return enc; } }
    return enc;
  }
  const fullKey = (folder, key) => folder + SEP + encKey(key);
  const folderPrefixLo = (folder) => folder + SEP;
  const folderPrefixHi = (folder) => folder + SEP + "\uffff";

  function req(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("idb failed"));
    });
  }
  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error("idb tx aborted"));
      tx.onerror = () => reject(tx.error || new Error("idb tx error"));
    });
  }

  let dbPromise = null;
  let memFallback = false;
  const memMap = new Map(); // full composite key -> value (memory fallback)

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = (async () => {
      if (!("indexedDB" in window)) { memFallback = true; return null; }
      try {
        const db = await req((() => {
          const r = window.indexedDB.open(DB_NAME, 1);
          r.onupgradeneeded = () => {
            if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE);
          };
          return r;
        })());
        return db;
      } catch (e) { memFallback = true; return null; }
    })();
    return dbPromise;
  }

  // ---------- migration from kv-plugin databases (one-time) ----------
  let migratePromise = null;
  // The engine may create/replace window.root after this script runs, so
  // re-assert the wiring on every op (runs before any store access).
  function assertWiring() {
    // NOTE: window.root is engine-managed — assigning a Proxy to window.root.kv
    // throws inside the engine's proxy machinery, so don't attempt it here.
    // world.js kvFolder() and multiplayer read window.LocalKv directly.
    try { if (window.kv !== api) window.kv = api; } catch (e) {}
  }
  function ensureReady() {
    assertWiring();
    if (!migratePromise) migratePromise = (async () => {
      const db = await openDb();
      if (!db) return; // memory fallback: nothing to migrate
      let done = [];
      try { done = (await storeGet(db, "localkv", MIGRATION_FLAG)) || []; } catch (e) { done = []; }
      if (Array.isArray(done) && done.includes("v1")) return;
      const migrated = new Set(Array.isArray(done) ? done : []);
      const folders = await discoverPluginFolders();
      for (const folder of folders) {
        if (migrated.has(folder)) continue;
        try {
          const n = await migrateFolder(db, folder);
          if (n >= 0) migrated.add(folder);
        } catch (e) { /* keep going: one bad folder must not block the rest */ }
      }
      try { await storePut(db, "localkv", MIGRATION_FLAG, [...migrated, "v1"]); } catch (e) {}
    })();
    return migratePromise;
  }
  async function discoverPluginFolders() {
    const found = new Set(KNOWN_FOLDERS);
    try {
      if (window.indexedDB && typeof window.indexedDB.databases === "function") {
        const dbs = await window.indexedDB.databases();
        for (const d of dbs) {
          const nm = d && d.name;
          if (typeof nm === "string" && nm.endsWith("-db-kv-plugin")) {
            found.add(nm.slice(0, -"-db-kv-plugin".length));
          }
        }
      }
    } catch (e) {}
    return [...found];
  }
  function openPluginDb(folder) {
    return req(window.indexedDB.open(folder + "-db-kv-plugin"));
  }
  async function migrateFolder(db, folder) {
    // Skip folders that already hold LocalKv data (never happens pre-migration,
    // but keeps a half-finished retry from duplicating anything).
    try {
      const existing = await storeKeys(db, folder);
      if (existing && existing.length) return 0;
    } catch (e) {}
    let src;
    try { src = await openPluginDb(folder); }
    catch (e) { return -1; } // no such database: nothing to copy
    try {
      const storeName = folder + "-store-kv-plugin";
      if (!src.objectStoreNames.contains(storeName)) {
        // Husk we just created by opening (or a foreign DB): remove it.
        try { window.indexedDB.deleteDatabase(folder + "-db-kv-plugin"); } catch (e) {}
        return 0;
      }
      const tx = src.transaction(storeName, "readonly");
      const st = tx.objectStore(storeName);
      let keys, vals;
      try {
        [keys, vals] = await Promise.all([
          req(st.getAllKeys ? st.getAllKeys() : null).catch(() => null),
          req(st.getAll ? st.getAll() : null).catch(() => null),
        ]);
      } catch (e) { keys = null; vals = null; }
      if (!keys || !vals) { // cursor fallback for very old browsers
        keys = []; vals = [];
        await new Promise((resolve) => {
          try {
            const tx2 = src.transaction(storeName, "readonly");
            const st2 = tx2.objectStore(storeName);
            const cur = st2.openCursor();
            cur.onsuccess = () => {
              const c = cur.result;
              if (c) { keys.push(c.key); vals.push(c.value); c.continue(); }
              else resolve();
            };
            cur.onerror = () => resolve();
          } catch (e) { resolve(); }
        });
      }
      // Batched writes: one transaction per 200 puts.
      for (let i = 0; i < keys.length; i += 200) {
        const txw = db.transaction(STORE, "readwrite");
        const wst = txw.objectStore(STORE);
        const end = Math.min(i + 200, keys.length);
        for (let j = i; j < end; j++) {
          try { wst.put(vals[j], fullKey(folder, keys[j])); } catch (e) {}
        }
        try { await txDone(txw); } catch (e) {}
      }
      // Tidy up: drop the husk when the plugin DB held nothing (open() above
      // creates missing DBs, so a never-used folder would linger otherwise).
      if (!keys.length) { try { window.indexedDB.deleteDatabase(folder + "-db-kv-plugin"); } catch (e) {} }
      return keys.length;
    } finally {
      try { src.close(); } catch (e) {}
    }
  }

  // ---------- raw store ops (assume ensureReady already awaited) ----------
  async function storeGet(db, folder, key) {
    const fk = fullKey(folder, key);
    if (memFallback || !db) return memMap.get(fk);
    try {
      const v = await req(db.transaction(STORE, "readonly").objectStore(STORE).get(fk));
      // A put that failed IDB structured-clone sits only in memMap (storePut
      // fallback). Prefer the IDB value, but don't hide the memMap one.
      if (v === undefined && memMap.has(fk)) return memMap.get(fk);
      return v;
    }
    catch (e) { return memMap.get(fk); }
  }
  async function storePut(db, folder, key, val) {
    const fk = fullKey(folder, key);
    if (memFallback || !db) { memMap.set(fk, val); return; }
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(val, fk);
      await txDone(tx);
    } catch (e) { memMap.set(fk, val); }
  }
  async function storeDel(db, folder, key) {
    const fk = fullKey(folder, key);
    memMap.delete(fk);
    if (memFallback || !db) return;
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(fk);
      await txDone(tx);
    } catch (e) {}
  }
  async function storeEntries(db, folder) {
    if (memFallback || !db) {
      const out = [];
      const lo = folderPrefixLo(folder);
      for (const [fk, v] of memMap) {
        if (fk.startsWith(lo) && fk.indexOf(SEP) === folder.length) out.push([decKey(fk.slice(lo.length)), v]);
      }
      return out;
    }
    try {
      const tx = db.transaction(STORE, "readonly");
      const st = tx.objectStore(STORE);
      const range = window.IDBKeyRange.bound(folderPrefixLo(folder), folderPrefixHi(folder), false, true);
      let keys, vals;
      if (st.getAllKeys && st.getAll) {
        [keys, vals] = await Promise.all([req(st.getAllKeys(range)), req(st.getAll(range))]);
      } else {
        keys = []; vals = [];
        await new Promise((resolve) => {
          try {
            const cur = st.openCursor(range);
            cur.onsuccess = () => {
              const c = cur.result;
              if (c) { keys.push(c.key); vals.push(c.value); c.continue(); }
              else resolve();
            };
            cur.onerror = () => resolve();
          } catch (e) { resolve(); }
        });
      }
      const lo = folderPrefixLo(folder);
      const out = [];
      for (let i = 0; i < keys.length; i++) {
        const k = String(keys[i]);
        if (!k.startsWith(lo)) continue;
        out.push([decKey(k.slice(lo.length)), vals[i]]);
      }
      return out;
    } catch (e) { return storeEntries(null, folder); }
  }
  async function storeKeys(db, folder) {
    const es = await storeEntries(db, folder);
    return es.map(([k]) => k);
  }
  async function storeClear(db, folder) {
    const ks = await storeKeys(db, folder);
    for (const k of ks) await storeDel(db, folder, k);
  }

  // ---------- folder objects ----------
  const folderCache = {};
  function folderObj(folder) {
    if (folderCache[folder]) return folderCache[folder];
    const F = {
      get: async (key) => { await ensureReady(); const db = await openDb(); return storeGet(db, folder, key); },
      set: async (key, val) => { await ensureReady(); const db = await openDb(); return storePut(db, folder, key, val); },
      delete: async (key) => { await ensureReady(); const db = await openDb(); return storeDel(db, folder, key); },
      entries: async () => { await ensureReady(); const db = await openDb(); return storeEntries(db, folder); },
      keys: async () => { await ensureReady(); const db = await openDb(); return storeKeys(db, folder); },
      values: async () => { await ensureReady(); const db = await openDb(); return (await storeEntries(db, folder)).map(([, v]) => v); },
      has: async (key) => { await ensureReady(); const db = await openDb(); return (await storeKeys(db, folder)).includes(key); },
      getMany: async (keys) => { await ensureReady(); const db = await openDb(); return Promise.all(keys.map((k) => storeGet(db, folder, k))); },
      setMany: async (entries) => { await ensureReady(); const db = await openDb(); for (const [k, v] of entries) await storePut(db, folder, k, v); },
      deleteMany: async (keys) => { await ensureReady(); const db = await openDb(); for (const k of keys) await storeDel(db, folder, k); },
      update: async (key, setterFn) => {
        await ensureReady(); const db = await openDb();
        const cur = await storeGet(db, folder, key);
        await storePut(db, folder, key, setterFn(cur));
      },
      clear: async () => { await ensureReady(); const db = await openDb(); return storeClear(db, folder); },
    };
    folderCache[folder] = F;
    return F;
  }

  const api = new Proxy({}, {
    get(target, folder) {
      if (typeof folder !== "string") return undefined;
      return folderObj(folder);
    },
  });

  // Boot wiring: world.js kvFolder() reads window.LocalKv first, then
  // (window.root || window).kv. window.root itself is engine-managed (assigning
  // a Proxy to window.root.kv throws in the engine's proxy machinery), so the
  // only root assignment attempted is the one below, best-effort.
  try { if (window.root && !window.root.kv) window.root.kv = api; } catch (e) {}
  try { window.kv = api; } catch (e) {}

  return api;
})();
