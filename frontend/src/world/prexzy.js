/* Prexzy client — NPC chats only. window.Prexzy.
   Pattern follows https://perchance.org/b5177grvos (no API key):
     GET https://prexzyapis.com/ai/ch?q=<encoded>
     GET https://prexzyapis.com/ai/chatpro?prompt=<encoded>
     GET https://prexzyapis.com/ai/gemini?prompt=<encoded>
   Everything else in Emberhold is programmatic; only chatReply() in
   ai_director.js calls this. No streaming — one JSON reply per turn.
   Failure policy: short timeout, 60s cooldown, caller falls back to
   AIDirector.fallbackReply (persona-flavored, offline). */
window.Prexzy = (() => {
  const API_BASE = "https://prexzyapis.com";
  const LS_MODEL = "emberhold-prexzy-model-v1";
  let coolUntil = 0;
  let lastModel = "ch";
  try { lastModel = localStorage.getItem(LS_MODEL) || "ch"; } catch (e) {}
  if (!["ch", "chatpro", "gemini"].includes(lastModel)) lastModel = "ch";

  function cooling() { return Date.now() < coolUntil; }
  function noteFailure(ms) {
    try { coolUntil = Date.now() + (ms || 60000); } catch (e) {}
  }
  function clearCooldown() { coolUntil = 0; }
  function setModel(m) {
    if (!["ch", "chatpro", "gemini"].includes(m)) return lastModel;
    lastModel = m;
    try { localStorage.setItem(LS_MODEL, m); } catch (e) {}
    return lastModel;
  }
  function getModel() { return lastModel; }

  function buildUrl(model, text) {
    const q = encodeURIComponent(String(text || ""));
    if (model === "chatpro") return `${API_BASE}/ai/chatpro?prompt=${q}`;
    if (model === "gemini") return `${API_BASE}/ai/gemini?prompt=${q}`;
    return `${API_BASE}/ai/ch?q=${q}`; // default: simple, fast
  }
  function extractReply(data) {
    try {
      if (typeof data === "string") return data;
      if (data == null) return "";
      if (typeof data.response === "string") return data.response;
      if (data.data && typeof data.data.response === "string") return data.data.response;
      if (typeof data.result === "string") return data.result;
      if (data.result != null) return JSON.stringify(data.result);
      if (typeof data.answer === "string") return data.answer;
      return JSON.stringify(data).slice(0, 2000);
    } catch (e) { return ""; }
  }
  // Cap prompt so the GET URL stays sane. Keep head (persona+memory) and
  // tail (task+last lines); cut the middle like the old truncation did.
  function capPrompt(s, max) {
    s = String(s || "");
    max = max || 3500;
    if (s.length <= max) return s;
    const head = Math.floor(max * 0.45), tail = max - head;
    return s.slice(0, head) + "\n…[cut]…\n" + s.slice(s.length - tail);
  }
  async function chat(prompt, opts) {
    opts = opts || {};
    const model = opts.model || lastModel || "ch";
    const timeoutMs = opts.timeoutMs || 30000;
    if (cooling()) throw new Error("prexzy-cooling");
    const url = buildUrl(model, capPrompt(prompt, opts.maxChars || 3500));
    let timer = null;
    try {
      const ctrl = new AbortController();
      timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, timeoutMs);
      const res = await fetch(url, { signal: ctrl.signal });
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error("prexzy-status-" + res.status);
      const data = await res.json();
      const txt = (extractReply(data) || "").trim();
      if (!txt) throw new Error("prexzy-empty");
      if (/^sorry/i.test(txt) && txt.length < 80) throw new Error("prexzy-refused");
      return txt;
    } catch (e) {
      try { if (timer) clearTimeout(timer); } catch (e2) {}
      // Only park on likely-rate/transport errors, not on programming errors.
      noteFailure(60000);
      throw e;
    }
  }
  return { chat, cooling, noteFailure, clearCooldown, setModel, getModel, buildUrl, extractReply, API_BASE };
})();
