#!/usr/bin/env node
/**
 * Rebuilds `frontend/` (the directory Tauri serves) from two inputs:
 *
 *   game/     git submodule -> https://github.com/Devanand-PA/emberhold.git
 *   overlay/  Tauri-only additions that must survive game updates:
 *               src/tauri-bridge.js  native save-export bridge
 *               src/update-check.js  upstream update check + reload prompt
 *               assets/logo.jpg      offline copy of the title logo
 *
 * Plus three small edits applied to the game's index.html:
 *   1. prepend the HTML5 doctype / <head> wrapper (the Perchance export omits it)
 *   2. point the title logo at the bundled copy instead of a remote URL
 *   3. load tauri-bridge.js before all other game scripts
 *   4. unwrap the race/gender pickers from <label> so clicks don't get
 *      forwarded back to the first (Human/Male) button
 *
 * `frontend/` is generated output and is gitignored — never edit it by hand.
 *
 * Usage:
 *   node scripts/sync-frontend.mjs            copy the pinned game commit
 *   node scripts/sync-frontend.mjs --latest   update the submodule to the game's
 *                                             latest master, then copy
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const gameDir = path.join(root, "game");
const overlayDir = path.join(root, "overlay");
const outDir = path.join(root, "frontend");
const indexOut = path.join(outDir, "index.html");
const headTemplate = path.join(root, "scripts", "index-head.html");

function die(message) {
  console.error(`sync-frontend: ${message}`);
  process.exit(1);
}

if (!existsSync(path.join(gameDir, "index.html"))) {
  die(
    "the game submodule is empty. Initialise it first:\n" +
    "  git submodule update --init --recursive"
  );
}
if (!existsSync(headTemplate)) die(`missing ${headTemplate}`);
if (!existsSync(path.join(overlayDir, "src", "tauri-bridge.js"))) {
  die("missing overlay/src/tauri-bridge.js");
}

if (process.argv.includes("--latest")) {
  console.log("sync-frontend: fetching latest game from origin...");
  execFileSync("git", ["submodule", "update", "--init", "--remote", "game"], {
    cwd: root,
    stdio: "inherit",
  });
}

let sourceCommit = "unknown";
try {
  sourceCommit = execFileSync("git", ["-C", gameDir, "rev-parse", "--short", "HEAD"], {
    encoding: "utf8",
  }).trim();
} catch {
  // not fatal — a plain copy of the repo still works
}

// Start from a clean directory so removed game files don't linger.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 1. the game itself, excluding git metadata.
cpSync(gameDir, outDir, {
  recursive: true,
  filter: (src) => !src.split(path.sep).includes(".git"),
});

// 2. Tauri-only files layered on top.
cpSync(overlayDir, outDir, { recursive: true });

// 3. patch index.html.
let html = readFileSync(indexOut, "utf8");

// HTML5 wrapper (Perchance exports start at <style>).
if (!/^\s*<!DOCTYPE html>/i.test(html)) {
  html = readFileSync(headTemplate, "utf8").trimEnd() + "\n" + html;
}

// Bundled logo, so the title screen works offline. Replace the <img src> of
// the first .title-logo heading regardless of which remote URL upstream uses.
html = html.replace(
  /<h1\b[^>]*\btitle-logo\b[^>]*>[\s\S]*?<img\b[^>]*\bsrc="[^"]*"/i,
  (match) => match.replace(/\bsrc="[^"]*"/i, 'src="assets/logo.jpg"')
);

// The race and gender pickers are button groups wrapped in <label> elements.
// Browsers treat the first button as the label's control and, because
// hcSetRace() re-renders the buttons mid-click (detaching the event target),
// forward a second click to that first button — snapping the pick back to
// Human/Male. Plain <div> wrappers keep the styling but not the label behavior.
html = html.replace(
  /<label class="hc-label">((?:(?!<\/label>)[\s\S])*class="hc-races"(?:(?!<\/label>)[\s\S])*)<\/label>/g,
  (match, inner) => `<div class="hc-label">${inner}</div>`
);

// Native save-export bridge must load before the game scripts that use it.
if (!html.includes("src/tauri-bridge.js")) {
  const tag = '<script src="src/tauri-bridge.js"></script>\n';
  if (/<script\s+src=/i.test(html)) {
    html = html.replace(/<script\s+src=/i, (match) => tag + match);
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, (match) => tag + match);
  } else {
    html += "\n" + tag;
  }
}

// Upstream update checker (overlay/src/update-check.js): embed the local game
// commit it compares against, and load the script before the game scripts.
const commitTag =
  "<script>window.EmberholdGameCommit = " +
  JSON.stringify(sourceCommit === "unknown" ? "" : sourceCommit) +
  ";</script>\n";
const updateTag = '<script src="src/update-check.js"></script>\n';
if (!html.includes(updateTag)) {
  const bridgeRe = /<script\s+src="src\/tauri-bridge\.js"><\/script>\n?/i;
  if (bridgeRe.test(html)) {
    html = html.replace(bridgeRe, (m) => m + commitTag + updateTag);
  } else if (/<script\s+src=/i.test(html)) {
    html = html.replace(/<script\s+src=/i, (m) => commitTag + updateTag + m);
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, (m) => commitTag + updateTag + m);
  } else {
    html += "\n" + commitTag + updateTag;
  }
}

writeFileSync(indexOut, html, "utf8");

console.log(
  `sync-frontend: frontend/ rebuilt from game/ @ ${sourceCommit}` +
  (process.argv.includes("--latest") ? " (latest)" : "")
);
