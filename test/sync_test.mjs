// Regression checks for the generated frontend (run `npm run sync` first).
// In particular: the race/gender button groups must NOT be wrapped in a
// <label>, or WebKit/Chromium forwards a re-rendered button click back to the
// first button and snaps the choice back to Human/Male.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const INDEX = fileURLToPath(new URL("../frontend/index.html", import.meta.url));
const html = readFileSync(INDEX, "utf8");

const checks = {
  html5_doctype: /^<!DOCTYPE html>/i.test(html),
  bridge_loaded_first: html.includes('<script src="src/tauri-bridge.js"></script>'),
  bundled_logo: html.includes('src="assets/logo.jpg"'),
  race_picker_present: html.includes('id="hcRaces"'),
  gender_picker_present: html.includes('id="hcGenders"'),
  // No <label> may contain a .hc-races button group.
  pickers_not_in_label: !/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*class="hc-races"/i.test(html),
};
const ok = Object.values(checks).every(Boolean);
console.log("checks:", JSON.stringify(checks, null, 1));
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
