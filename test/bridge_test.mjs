// Standalone test for overlay/src/tauri-bridge.js (the Tauri overlay source;
// it is copied into generated frontend/src/ by `npm run sync`)
// Run: npm test   (uses only Node, no dependencies)
// Two isolated VM contexts:
//   A) with Tauri internals   -> blob download click routes to the native command
//   B) without Tauri (browser) -> bridge is a no-op, click passes through
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const BRIDGE = fileURLToPath(new URL("../overlay/src/tauri-bridge.js", import.meta.url));
const src = readFileSync(BRIDGE, "utf8");

// anchor factory + invocation, evaluated INSIDE the sandbox so `instanceof`
// and prototype checks behave like a real webview
const vmSetup = `
function makeAnchor() {
  var a = new HTMLAnchorElement();
  a.href = "blob:fake-url";
  a.download = "emberhold-slot1-Bob-2026-11-20.json";
  a._attrs = { download: a.download };
  a.hasAttribute = function (n) { return n in a._attrs; };
  a.getAttribute = function (n) { return a._attrs[n]; };
  a.removeAttribute = function (n) { delete a._attrs[n]; a.download = ""; };
  a.setAttribute = function (n, v) { a._attrs[n] = v; };
  a.remove = function () { a.removed = true; };
  return a;
}
HTMLAnchorElement.prototype.click = function () { this.clicks = (this.clicks || 0) + 1; };
`;

function makeCtx(withTauri, log) {
  const invoked = [];
  const toasts = [];
  const ctx = {
    HTMLAnchorElement: function HTMLAnchorElement() { },
    console,
    invoked,
    toasts,
    EmberholdDesktop: undefined,
    window: {},
    URL: { createObjectURL: () => "blob:fake-url", revokeObjectURL: () => { log.revoked = true; } },
    fetch: (u) => Promise.resolve({ text: () => Promise.resolve(JSON.stringify({ save: { player: { name: "Bob" } } })) }),
  };
  if (withTauri) {
    ctx.window.__TAURI_INTERNALS__ = {
      invoke: (cmd, args) => { invoked.push({ cmd, args }); return Promise.resolve("/tmp/emberhold-slot1-Bob.json"); },
    };
    ctx.window.UI = { toast: (m, ms) => toasts.push(m) };
  }
  vm.createContext(ctx);
  vm.runInContext(vmSetup, ctx);       // original prototype.click (counting)
  vm.runInContext(src, ctx);           // bridge patches it (or no-ops)
  const anchor = vm.runInContext("makeAnchor()", ctx);
  ctx.anchor = anchor;
  vm.runInContext("HTMLAnchorElement.prototype.click.call(anchor)", ctx); // patched click
  return { ctx, anchor, invoked, toasts };
}

// --- A) Tauri present ---
const logA = {};
const A = makeCtx(true, logA);

// --- B) browser, no Tauri ---
const logB = {};
const B = makeCtx(false, logB);

setTimeout(() => {
  const checks = {
    A_command_called: A.invoked.length === 1 && A.invoked[0].cmd === "save_export_file",
    A_filename: A.invoked[0] && A.invoked[0].args.filename === "emberhold-slot1-Bob-2026-11-20.json",
    A_contents: A.invoked[0] && typeof A.invoked[0].args.contents === "string" && A.invoked[0].args.contents.includes("Bob"),
    A_original_click_suppressed: !A.anchor.clicks,
    A_toast_shown: A.toasts.length === 1,
    A_cleanup: logA.revoked === true && A.anchor.removed === true,
    B_no_bridge: B.ctx.EmberholdDesktop === undefined,
    B_no_invoke: B.invoked.length === 0,
    B_original_click_ran: B.anchor.clicks === 1,
  };
  const ok = Object.values(checks).every(Boolean);
  console.log("checks:", JSON.stringify(checks, null, 1));
  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
}, 100);