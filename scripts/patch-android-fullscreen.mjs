#!/usr/bin/env node
/**
 * Patches the generated Tauri Android project for immersive fullscreen.
 *
 * `tauri android init` generates `src-tauri/gen/android` (gitignored) from a
 * template whose MainActivity only calls enableEdgeToEdge(). That lets the
 * WebView draw behind the system bars but never hides them, so the status bar
 * keeps reserving space and the game never becomes truly fullscreen.
 *
 * This script rewrites MainActivity.kt to hide both the status and navigation
 * bars in sticky-immersive mode, and to re-hide them whenever the activity
 * regains focus (returning from the notification shade, after rotation, ...).
 *
 * Run it after `tauri android init` and before `tauri android build|dev`.
 * The Android CI workflow runs it automatically; `npm run android:build` and
 * `npm run android:dev` run it too.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const androidDir = path.join(root, "src-tauri", "gen", "android");
const marker = "patched by scripts/patch-android-fullscreen.mjs";

function findMainActivities(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findMainActivities(entryPath));
    else if (entry.isFile() && entry.name === "MainActivity.kt") found.push(entryPath);
  }
  return found;
}

function mainActivitySource(pkg) {
  return `// ${marker} — re-run it if this file is regenerated.
package ${pkg}

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    // Draw edge-to-edge, then hide the bars so the game fills the whole screen.
    WindowCompat.setDecorFitsSystemWindows(window, false)
    hideSystemBars()
  }

  override fun onResume() {
    super.onResume()
    // Coming back from the background can restore the system bars.
    hideSystemBars()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) hideSystemBars()
  }

  /** Sticky immersive mode: hide the status and navigation bars. */
  private fun hideSystemBars() {
    WindowCompat.getInsetsController(window, window.decorView).apply {
      systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      hide(WindowInsetsCompat.Type.systemBars())
    }
  }
}
`;
}

const files = findMainActivities(androidDir);
if (files.length === 0) {
  console.error(
    "patch-android-fullscreen: no generated Android project found.\n" +
      "Run `npx tauri android init` first (the Android SDK/NDK must be installed)."
  );
  process.exit(1);
}

for (const file of files) {
  const current = readFileSync(file, "utf8");
  const pkg = current.match(/^\s*package\s+([A-Za-z_][\w.]*)\s*$/m);
  if (!pkg) {
    console.error(`patch-android-fullscreen: could not read the package name from ${file}`);
    process.exit(1);
  }

  const next = mainActivitySource(pkg[1]);
  if (current === next) {
    console.log(`patch-android-fullscreen: ${path.relative(root, file)} already patched`);
    continue;
  }

  writeFileSync(file, next, "utf8");
  console.log(`patch-android-fullscreen: patched ${path.relative(root, file)}`);
}
