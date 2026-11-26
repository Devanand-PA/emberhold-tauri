#[cfg(not(any(target_os = "android", target_os = "ios")))]
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri::Window;

/// Native replacement for a blob download (WebKitGTK has no download handler,
/// so `<a download>` clicks silently fail on Linux).
///
/// Called by `frontend/src/tauri-bridge.js` when the game exports a save
/// backup: opens the platform save dialog and writes the file when confirmed.
/// Returns null when the player cancels the dialog.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[derive(Deserialize)]
struct SaveExportArgs {
    /// Suggested file name, e.g. "emberhold-slot1-Bob-2026-11-20.json".
    filename: String,
    /// Full file contents (JSON save backup).
    contents: String,
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
async fn save_export_file(args: SaveExportArgs) -> Result<Option<String>, String> {
    let mut name = args.filename.trim().to_string();
    if name.is_empty() {
        name = "emberhold-backup.json".to_string();
    }
    // never allow a path to escape the picked directory
    let safe: String = name
        .chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect();

    let dialog = rfd::AsyncFileDialog::new()
        .set_file_name(safe)
        .add_filter("Emberhold save backup", &["json"])
        .set_title("Save backup");

    let handle = match dialog.save_file().await {
        Some(h) => h,
        None => return Ok(None), // cancelled
    };

    let path = handle.path().to_path_buf();
    std::fs::write(&path, args.contents.as_bytes())
        .map_err(|e| format!("could not write {}: {}", path.display(), e))?;

    Ok(Some(path.display().to_string()))
}

/// Run `git -C <dir> <args>` and return trimmed stdout on success.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn git_out(dir: &Path, args: &[&str]) -> Option<String> {
    let out = std::process::Command::new("git")
        .arg("-C")
        .arg(dir)
        .args(args)
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    (!s.is_empty()).then_some(s)
}

/// Short (7-char) SHA of the current HEAD in <dir>, or None.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn short_head(dir: &Path) -> Option<String> {
    let s = git_out(dir, &["rev-parse", "--short", "HEAD"])?;
    let ok = s.len() >= 7 && s.chars().all(|c| c.is_ascii_hexdigit());
    ok.then_some(s)
}

/// Locate a real game checkout for the auto-update feature: a directory with
/// a git metadata dir (the `game/` submodule or a standalone clone) or an
/// index.html, whose HEAD we can read.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn find_game_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let mut seeds: Vec<PathBuf> = Vec::new();
    if let Ok(res) = app.path().resource_dir() {
        seeds.push(res);
    }
    if let Ok(cwd) = std::env::current_dir() {
        seeds.push(cwd.clone());
        seeds.push(cwd.join(".."));
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            seeds.push(dir.join(".."));
            seeds.push(dir.join("../.."));
        }
    }
    let mut candidates: Vec<PathBuf> = Vec::new();
    for seed in seeds {
        candidates.push(seed.join("game"));
        candidates.push(seed);
    }
    for c in candidates {
        if (c.join(".git")).exists() || c.join("index.html").is_file() {
            if short_head(&c).is_some() {
                return Some(c);
            }
        }
    }
    None
}

/// Upstream game repo: the remote `game/` points at.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
const GAME_REPO_URL: &str = "https://github.com/Devanand-PA/emberhold.git";

/// Result of `pull_game_updates`.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[derive(Serialize)]
struct PullResult {
    /// New short HEAD of the game dir after the update.
    commit: String,
    /// The game dir the app fetched/ff-ed in (for packaged builds).
    dir: Option<String>,
    /// Whether the new commit is actually served by the running build.
    /// `false` for packaged builds: their webview serves the embedded static
    /// bundle, so the update is downloaded to the app-data dir to build on —
    /// the user gets it with the next app build.
    served: bool,
}

/// In a packaged build the game lives at `app_data_dir/game` — the target of
/// `pull_game_updates`.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn app_data_game_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let dir = app.path().app_data_dir().ok()?.join("game");
    if (dir.join(".git")).exists() || dir.join("index.html").is_file() {
        Some(dir)
    } else {
        None
    }
}

/// Packaged update path: clone the upstream game repo into the app-data dir
/// so the game exists as an on-disk checkout later `pull_game_updates` calls
/// fetch/fast-forward.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn ensure_packaged_clone(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let dir = app_data.join("game");
    if short_head(&dir).is_some() {
        return Ok(dir);
    }
    std::fs::create_dir_all(&app_data).map_err(|e| e.to_string())?;
    // Verify the upstream is reachable before cloning.
    git_out(&app_data, &["ls-remote", GAME_REPO_URL, "HEAD"])
        .ok_or_else(|| "could not read the upstream commit — is git installed and can we reach the game repo?".to_string())?;
    let _ = std::fs::remove_dir_all(&dir);
    let out = std::process::Command::new("git")
        .arg("clone")
        .arg(GAME_REPO_URL)
        .arg(&dir)
        .output()
        .map_err(|e| format!("git clone failed to start: {e}"))?;
    if !out.status.success() {
        return Err(format!(
            "git clone failed: {}",
            String::from_utf8_lossy(&out.stderr).trim()
        ));
    }
    if short_head(&dir).is_none() {
        return Err("cloned game dir has no readable HEAD".to_string());
    }
    Ok(dir)
}

/// `game_commit`: short HEAD SHA of the local game checkout — the local side
/// of the frontend's GitHub-API comparison (frontend/src/update-check.js).
/// In a packaged build (no checkout under the usual seeds) it falls back to
/// the downloaded snapshot at `app_data_dir/game`.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
async fn game_commit(app: tauri::AppHandle) -> Result<String, String> {
    if let Some(dir) = find_game_dir(&app) {
        return short_head(&dir).ok_or_else(|| "could not read the game commit".to_string());
    }
    if let Some(dir) = app_data_game_dir(&app) {
        return short_head(&dir).ok_or_else(|| "could not read the game commit".to_string());
    }
    Err("no game checkout found".to_string())
}

/// `pull_game_updates`: fast-forward the game checkout to origin/master
/// (`git merge --ff-only origin/master`) and, in the dev repo, regenerate
/// frontend/ from it via scripts/sync-frontend.mjs so a reload serves the
/// pulled game. Returns the new short HEAD.
///
/// In a packaged build (no checkout under the usual seeds) the game is
/// downloaded instead: the upstream repo is cloned into the app-data dir and
/// later calls fetch/ff it. `served` is false there because the running build
/// serves its embedded game — the download builds on the next app build.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
async fn pull_game_updates(app: tauri::AppHandle) -> Result<PullResult, String> {
    let (dir, packaged) = match find_game_dir(&app) {
        Some(d) => (d, false),
        None => (ensure_packaged_clone(&app)?, true),
    };

    // Fetch the latest tip of the game repo (best effort: offline is not yet an error).
    let _ = git_out(&dir, &["fetch", "origin"]);
    let local = short_head(&dir).ok_or_else(|| "could not read the game commit".to_string())?;

    let remote = git_out(&dir, &["rev-parse", "origin/master"]);
    match remote.as_deref() {
        Some(r) if r.starts_with(local.as_str()) => {
            // already at origin/master
            return Ok(PullResult {
                commit: local,
                dir: Some(dir.display().to_string()),
                served: !packaged,
            });
        }
        None => {
            return Err(
                "could not read the upstream commit (origin/master) — is the game repo's origin configured?"
                    .to_string(),
            )
        }
        _ => {}
    }

    // Fast-forward the game working tree.
    let out = std::process::Command::new("git")
        .arg("-C")
        .arg(&dir)
        .args(["merge", "--ff-only", "origin/master"])
        .output()
        .map_err(|e| format!("git merge failed to start: {e}"))?;
    if !out.status.success() {
        return Err(format!(
            "git merge --ff-only origin/master failed: {}",
            String::from_utf8_lossy(&out.stderr).trim()
        ));
    }

    // Dev flow: the webview serves frontend/, so re-sync it from the pulled game.
    if let Some(root) = git_out(&dir, &["rev-parse", "--show-toplevel"]).map(PathBuf::from) {
        let script = root.join("scripts").join("sync-frontend.mjs");
        if script.is_file() {
            let _ = std::process::Command::new("node")
                .arg("scripts/sync-frontend.mjs")
                .current_dir(&root)
                .output();
        }
    }

    Ok(PullResult {
        commit: short_head(&dir).unwrap_or(local),
        dir: Some(dir.display().to_string()),
        served: !packaged,
    })
}

#[tauri::command]
fn set_fullscreen(window: Window, fullscreen: bool) -> Result<(), String> {
    #[cfg(desktop)]
    {
        window.set_fullscreen(fullscreen).map_err(|e| e.to_string())
    }
    #[cfg(mobile)]
    {
        let _ = (window, fullscreen);
        Err("fullscreen control is not supported on this platform".to_string())
    }
}

#[tauri::command]
fn is_fullscreen(window: Window) -> Result<bool, String> {
    #[cfg(desktop)]
    {
        window.is_fullscreen().map_err(|e| e.to_string())
    }
    #[cfg(mobile)]
    {
        let _ = window;
        // Mobile app runs fullscreen by default; native toggle API unavailable here.
        Ok(true)
    }
}

#[tauri::command]
fn toggle_fullscreen(window: Window) -> Result<bool, String> {
    #[cfg(desktop)]
    {
        let next = !window.is_fullscreen().map_err(|e| e.to_string())?;
        window.set_fullscreen(next).map_err(|e| e.to_string())?;
        Ok(next)
    }
    #[cfg(mobile)]
    {
        let _ = window;
        Err("fullscreen control is not supported on this platform".to_string())
    }
}

// ---------- LocalKv disk shadow ----------
//
// The game persists saves, world chunks, NPCs and dunge pic data through the
// webview's IndexedDB (see game/src/core/kv_local.js). WebKitGTK — the engine
// Tauri uses on Linux, including AppImage builds — can silently lose those
// writes: saves then vanish on restart because everything else falls back to
// in-memory maps. This shadow is a small JSON file per key written through
// the Rust side to `<app_data_dir>/localkv_shadow/<folder>/`, a location the
// webview's broken IndexedDB path can't affect. `storeGet`/`storePut` in
// LocalKv fall back to it when IndexedDB misses, so every build keeps its
// saves. Writes go to both stores, so where IndexedDB works nothing changes
// (the shadow is only ever a read fallback).

/// FNV-1a 64-bit hash of the (already-encoded) key — the file name for a
/// shadow entry. Stable across runs and safe for the filesystem.
fn shadow_hash(key: &str) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325;
    for b in key.as_bytes() {
        h ^= *b as u64;
        h = h.wrapping_mul(0x100000001b3);
    }
    h
}

/// Sanitized folder name (mirrors the game's folder names like "psave",
/// "wchunks_s2", "wchunks_ch_AB12CD34EF56").
fn shadow_folder_name(folder: &str) -> String {
    folder
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '-' || c == '.' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

fn shadow_dir(app: &tauri::AppHandle, folder: &str) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("localkv_shadow")
        .join(shadow_folder_name(folder)))
}

fn shadow_file(dir: &Path, key: &str) -> PathBuf {
    dir.join(format!("{:016x}.json", shadow_hash(key)))
}

/// Write one shadow entry: `<dir>/<hash>.json` containing `{"k": <key>, "v": <data>}`.
/// Atomic via write-to-temp + rename.
#[tauri::command]
fn kv_shadow_write(
    app: tauri::AppHandle,
    folder: String,
    key: String,
    data: serde_json::Value,
) -> Result<(), String> {
    let dir = shadow_dir(&app, &folder)?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let file = shadow_file(&dir, &key);
    let name = file
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "shadow.json".to_string());
    let tmp = file.with_file_name(format!("{name}.tmp"));
    let mut obj = serde_json::Map::new();
    obj.insert("k".into(), serde_json::Value::String(key));
    obj.insert("v".into(), data);
    let body = serde_json::to_vec(&serde_json::Value::Object(obj)).map_err(|e| e.to_string())?;
    std::fs::write(&tmp, body).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, &file).map_err(|e| format!("rename shadow file: {e}"))?;
    Ok(())
}

/// Read one shadow entry; None when absent/corrupt.
#[tauri::command]
fn kv_shadow_read(
    app: tauri::AppHandle,
    folder: String,
    key: String,
) -> Result<Option<serde_json::Value>, String> {
    let dir = shadow_dir(&app, &folder)?;
    let file = shadow_file(&dir, &key);
    let text = match std::fs::read_to_string(file) {
        Ok(t) => t,
        Err(_) => return Ok(None),
    };
    let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    Ok(v.get("v").cloned())
}

/// Delete one shadow entry (missing files are fine).
#[tauri::command]
fn kv_shadow_delete(app: tauri::AppHandle, folder: String, key: String) -> Result<(), String> {
    let dir = shadow_dir(&app, &folder)?;
    let file = shadow_file(&dir, &key);
    match std::fs::remove_file(file) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

/// Enumerate every shadow entry in a folder: Vec of [encoded key, value].
#[tauri::command]
fn kv_shadow_entries(app: tauri::AppHandle, folder: String) -> Result<Vec<(String, serde_json::Value)>, String> {
    let dir = shadow_dir(&app, &folder)?;
    let mut out: Vec<(String, serde_json::Value)> = Vec::new();
    let rd = match std::fs::read_dir(&dir) {
        Ok(rd) => rd,
        Err(_) => return Ok(out), // no shadow data for this folder yet
    };
    let mut paths: Vec<_> = rd.flatten().map(|e| e.path()).collect();
    paths.sort();
    for path in paths {
        if path.extension().map(|e| e != "json").unwrap_or(true) {
            continue; // skip .tmp files and junk
        }
        let text = match std::fs::read_to_string(&path) {
            Ok(t) => t,
            Err(_) => continue,
        };
        let v: serde_json::Value = match serde_json::from_str(&text) {
            Ok(v) => v,
            Err(_) => continue,
        };
        if let (Some(k), Some(val)) = (v.get("k").and_then(|x| x.as_str()), v.get("v").cloned()) {
            out.push((k.to_string(), val));
        }
    }
    Ok(out)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder.invoke_handler(tauri::generate_handler![
        save_export_file,
        game_commit,
        pull_game_updates,
        set_fullscreen,
        is_fullscreen,
        toggle_fullscreen,
        kv_shadow_read,
        kv_shadow_write,
        kv_shadow_delete,
        kv_shadow_entries
    ]);

    #[cfg(any(target_os = "android", target_os = "ios"))]
    let builder = builder.invoke_handler(tauri::generate_handler![
        set_fullscreen,
        is_fullscreen,
        toggle_fullscreen,
        kv_shadow_read,
        kv_shadow_write,
        kv_shadow_delete,
        kv_shadow_entries
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running Emberhold");
}
