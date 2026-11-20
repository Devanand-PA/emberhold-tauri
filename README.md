# Emberhold — Tauri desktop app

This wraps the [Emberhold](https://perchance.org/) generator (a plain static
HTML/JS game) in a [Tauri v2](https://v2.tauri.app/) shell so it runs as a
native desktop app.

## Layout

```
frontend/          the game itself (index.html + src/) — served by Tauri
  assets/logo.jpg  local copy of the title-screen logo
  src/tauri-bridge.js  native save-export bridge (loaded first; no-op in a browser)
src-tauri/         Rust/Tauri project, config, icons
package.json       Tauri CLI as an npm dev-dependency (no frontend build step)
README_EXPORT.txt  original Perchance export notes
```

The Perchance-specific `main.pjs` is kept in `frontend/` for reference only;
the game never evaluates it. All gameplay lives in `frontend/src/*.js`, which
`index.html` loads with ordinary `<script src>` tags.

## Requirements

- [Rust](https://www.rust-lang.org/tools/install) (1.77.2+)
- Node.js + npm (only to run the Tauri CLI)
- Tauri v2 [system prerequisites](https://v2.tauri.app/start/prerequisites/)
  (on Linux: WebKit2GTK, GTK3, libsoup, etc.)

## Run

```bash
npm install      # installs the Tauri CLI locally
npm run dev      # launch the app in development mode
npm run build    # produce installers in src-tauri/target/release/bundle/
```

`npm run tauri -- <args>` passes any arguments through to the Tauri CLI.

## Notes

- Saves use the webview's IndexedDB/localStorage and are kept per user profile,
  exactly like in the browser. There are 5 in-game slots.
- The game fetches `src/data/bosses.yaml` and `src/app/CHANGELOG.md` from its
  own bundled assets; no external files are required.
- NPC chat (Prexzy) and multiplayer (PeerJS) still use their public online
  services. Both degrade gracefully to offline play — NPC chat falls back to
  the built-in persona replies.
- The 📖 Codex is an in-tab movable panel (no second window), so nothing extra
  is needed there.
- **Save export** (📤 on a slot / multiplayer world row) normally triggers a
  blob download. WebKitGTK (Tauri on Linux) has no download handler, so
  `frontend/src/tauri-bridge.js` intercepts those clicks and writes the backup
  through a native save dialog (Rust command `save_export_file`, using the
  `rfd` crate). Save import (📥) uses a file picker and works as-is. The bridge
  is a no-op when the same files are opened in a normal browser.
- To change the window size/title or bundle identifier, edit
  `src-tauri/tauri.conf.json`.

## Automated builds (GitHub Actions)

Two workflows live in `.github/workflows/`:

- **Desktop releases** (`desktop.yml`) — builds Windows x64 (`.msi` + NSIS
  `.exe`), macOS arm64 + x64 (`.app`/`.dmg`) and Linux x64 (`.deb`/`.rpm`)
  with the official `tauri-action`, then uploads everything to a **draft**
  GitHub release named `v<version>`. Bundles are also attached as workflow
  artifacts.
- **Android APK** (`android.yml`) — installs the Android SDK/NDK and JDK,
  generates the Tauri Android project with `tauri android init --ci`, builds an
  installable debug-signed universal APK for all four ABIs, and uploads it as
  the `emberhold-android-apk` workflow artifact.

Both run on a pushed `v*` tag (for example `git tag v1.0.0 && git push origin v1.0.0`)
or can be started manually from the **Actions** tab → **Run workflow**.

The Android workflow uses a debug key so the APK installs directly. For a
Play-Store-ready signed AAB/APK, add a release keystore as repository secrets
and switch the build step to a release build with Tauri's Android signing
configuration.
