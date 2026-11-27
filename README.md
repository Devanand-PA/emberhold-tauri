# Emberhold — Tauri desktop app

This wraps the [Emberhold](https://github.com/Devanand-PA/emberhold) generator (a plain static HTML/JS game) in a [Tauri v2](https://v2.tauri.app/) shell so it runs as a native desktop app.

The game is **linked, not copied**: `game/` is a git submodule pointing at the upstream game repository. When the game updates you no longer have to pull files into this repo by hand — see [Keeping the game up to date](#keeping-the-game-up-to-date).

## Layout

```
game/              git submodule -> github.com/Devanand-PA/emberhold (the live game,
                   including the Tauri bridge, update checker and bundled logo)
scripts/
  sync-frontend.mjs  copies game/ into frontend/ (plain copy, no patches)
  patch-android-fullscreen.mjs  immersive system-bar patch for the generated Android project
frontend/          GENERATED + gitignored — served by Tauri. Never edit by hand.
src-tauri/         Rust/Tauri project, config, icons
package.json       Tauri CLI as an npm dev-dependency (no frontend build step)
test/              unit tests for the bridge (plain node)
```

`npm run sync` copies `game/` into `frontend/` as-is. Everything the desktop
shell needs lives upstream in the game repo, so there is no overlay and no
patch step:

1. the HTML5 doctype / `<head>` wrapper (ahead of it, a UTF-8 BOM for hosts
   that send legacy charset headers),
2. the title logo bundled at `assets/logo.jpg` instead of a remote URL,
3. `<script src="src/tauri-bridge.js"></script>` and `src/update-check.js`
   before all game scripts (both no-op in a plain browser),
4. race/gender button groups unwrapped from `<label>` — browsers otherwise
   forward a re-rendered button click back to the first button, snapping the
   pick back to Human/Male.

Desktop-only additions belong upstream in emberhold, guarded to no-op outside
Tauri — never patch them in here.

`npm run dev` and `npm run build` run this automatically (via `predev` / `prebuild`).

The Perchance-specific `main.pjs` comes along in `game/` for reference only; the game never evaluates it. All gameplay lives in the game's `src/*.js`, which `index.html` loads with ordinary `<script src>` tags.

## Requirements

- Git (with submodule support)
- [Rust](https://www.rust-lang.org/tools/install) (1.77.2+)
- Node.js + npm (only to run the Tauri CLI)
- Tauri v2 [system prerequisites](https://v2.tauri.app/start/prerequisites/)
  (on Linux: WebKit2GTK, GTK3, libsoup, etc.)

## Run

```bash
git clone --recurse-submodules <this-repo>
npm install      # installs the Tauri CLI locally
npm run dev      # syncs frontend/, then launches the app in development mode
npm run build    # syncs frontend/, then produces installers in src-tauri/target/release/bundle/
npm test         # unit-test the tauri-bridge save-export logic (plain node)
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

`npm run tauri -- <args>` passes any arguments through to the Tauri CLI.

Verified on Linux (Arch, X11): `npm run build` produces
`Emberhold_1.0.0_amd64.deb`, `Emberhold-1.0.0-1.x86_64.rpm` and
`Emberhold_1.0.0_amd64.AppImage`; the window opens, the game boots
(IndexedDB world store + localStorage keys are written under
`~/.local/share/com.thevoidis999.emberhold`), and 📤 export reaches the native
save dialog.

## Keeping the game up to date

```bash
npm run update-game   # pull upstream master into game/ and regenerate frontend/
```

That is the whole update — one command, no copying files, no merge conflicts
from game changes in this repo. It is equivalent to `git submodule update
--remote game && npm run sync`.

**Packaged app (no `game/` checkout):** the app can't `git pull` from inside a
static bundle. Clicking **Reload to update** instead clones the upstream game
repo into your app-data dir
(`~/.local/share/com.thevoidis999.emberhold/game`) — the app then has an
on-disk checkout later calls `fetch` + `git merge --ff-only origin/master` on.
To actually play the update, install the latest app build (the toast says the
game dir it prepared).

To pin a specific game version instead, check out the desired commit inside
`game/`, run `npm run sync`, and commit the submodule pointer in this repo.
CI builds use the pinned commit for reproducible releases.

If you would rather every build use upstream HEAD automatically, change the
`sync` script in `package.json` to `node scripts/sync-frontend.mjs --latest`.

## Notes

- Saves use the webview's IndexedDB/localStorage and are kept per user profile,
  exactly like in the browser. There are 5 in-game slots.
- **Saves are durable on every build.** Every LocalKv put also mirrors the
  value to a per-key JSON file under `<app_data_dir>/localkv_shadow/<folder>/`
  through the Rust commands `kv_shadow_read`/`kv_shadow_write`/
  `kv_shadow_delete`/`kv_shadow_entries` (`src-tauri/src/lib.rs`); reads fall
  back to the shadow when IndexedDB misses. This covers WebKitGTK builds
  (Linux, incl. AppImage) where IndexedDB writes can be silently lost, so
  slot saves survive closing and reopening the app.
- The game fetches `src/data/bosses.yaml` and `src/app/CHANGELOG.md` from its
  own bundled assets (now under generated `frontend/`); no external files are
  required.
- NPC chat (Prexzy) and multiplayer (PeerJS) still use their public online
  services. Both degrade gracefully to offline play — NPC chat falls back to
  the built-in persona replies.
- The 📖 Codex is an in-tab movable panel (no second window), so nothing extra
  is needed there.
- **Save export** (📤 on a slot / multiplayer world row) normally triggers a
  blob download. WebKitGTK (Tauri on Linux) has no download handler, so
  `game/src/tauri-bridge.js` (upstream) intercepts those clicks and writes the
  backup through a native save dialog (Rust command `save_export_file`, using
  the `rfd` crate). Save import (📥) uses a file picker and works as-is. The
  bridge is a no-op when the same files are opened in a normal browser. Keep
  any bridge changes upstream in the game repo — edits to `frontend/` are
  overwritten by sync.
- To change the window size/title or bundle identifier, edit
  `src-tauri/tauri.conf.json`.

## Automated builds (GitHub Actions)

One workflow lives in `.github/workflows/release.yml`:

- **Desktop releases** — builds Windows x64 (`.msi` + NSIS `.exe`), macOS
  arm64 + x64 (`.app`/`.dmg`) and Linux x64 (`.deb`/`.rpm`/`.AppImage`) with
  the official `tauri-action`, then publishes everything to a GitHub release
  named `v<version>`.
- **Android APK + AAB** — installs the Android SDK/NDK and JDK, generates the
  Tauri Android project with `tauri android init --ci`, patches it for
  immersive fullscreen, signs it with the release keystore, and attaches the
  raw `.apk`/`.aab` files directly to the same published GitHub release (not
  as zipped workflow artifacts), so they download ready to install.

Both checks run `npm run sync` before building, since `frontend/` is
generated and not tracked by git. The workflow runs on a pushed `v*` tag (for
example `git tag v1.0.0 && git push origin v1.0.0`) or can be started
manually from the **Actions** tab → **Run workflow**.

Android releases must be signed with a single stable key so updates over
installed APKs keep working. Set these repository secrets:

- `ANDROID_KEYSTORE_BASE64` — base64-encoded `.jks`/`.keystore` file
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

If they are missing the Android build **fails** — the workflow never
generates a throwaway key, because each build signing with a random key would
break updates.

### Android fullscreen

Tauri's generated Android template calls `enableEdgeToEdge()`, which lets the
WebView draw behind the system bars but never hides them. The status bar
therefore keeps reserving space and the game is not truly fullscreen.

`scripts/patch-android-fullscreen.mjs` rewrites the generated
`MainActivity.kt` to hide the status and navigation bars in sticky-immersive
mode (swiping from an edge reveals them temporarily) and to re-hide them when
the activity regains focus. The Android workflow runs it after
`tauri android init`; for local builds run `npx tauri android init` once, then
use `npm run android:build` or `npm run android:dev`, which apply the patch
before invoking Tauri. `npm run android:patch` applies it on its own.
