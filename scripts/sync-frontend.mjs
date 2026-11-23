#!/usr/bin/env node
/**
 * Rebuilds `frontend/` (the directory Tauri serves) from the game submodule:
 *
 *   game/  git submodule -> https://github.com/Devanand-PA/emberhold.git
 *
 * Upstream already carries everything the desktop build needs — the Tauri
 * bridge (src/tauri-bridge.js), the update checker (src/update-check.js),
 * the bundled title logo (assets/logo.jpg), the HTML5 head wrapper and the
 * unwrapped race/gender pickers — so this is a plain copy: no overlay, no
 * patches. Keep it that way: desktop-only additions belong upstream in
 * emberhold, guarded to no-op in a plain browser.
 *
 * `frontend/` is generated output and is gitignored — never edit it by hand.
 *
 * Usage:
 *   node scripts/sync-frontend.mjs            copy the pinned game commit
 *   node scripts/sync-frontend.mjs --latest   update the submodule to the game's
 *                                             latest master, then copy
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const gameDir = path.join(root, "game");
const outDir = path.join(root, "frontend");

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

// The game itself, excluding git metadata.
cpSync(gameDir, outDir, {
  recursive: true,
  filter: (src) => !src.split(path.sep).includes(".git"),
});

console.log(`sync-frontend: frontend/ rebuilt from game/ @ ${sourceCommit}` +
  (process.argv.includes("--latest") ? " (latest)" : ""));
