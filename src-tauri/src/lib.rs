#[cfg(not(any(target_os = "android", target_os = "ios")))]
use serde::Deserialize;
#[cfg(not(any(target_os = "android", target_os = "ios")))]
use std::path::{Path, PathBuf};
#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::Manager;
use tauri::WebviewWindow;

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

/// `game_commit`: short HEAD SHA of the local game checkout — the local side
/// of the frontend's GitHub-API comparison (frontend/src/update-check.js).
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
async fn game_commit(app: tauri::AppHandle) -> Result<String, String> {
    let dir = find_game_dir(&app).ok_or_else(|| "no game checkout found".to_string())?;
    short_head(&dir).ok_or_else(|| "could not read the game commit".to_string())
}

/// `pull_game_updates`: fast-forward the game checkout to origin/master
/// (`git merge --ff-only origin/master`) and, in the dev repo, regenerate
/// frontend/ from it via scripts/sync-frontend.mjs so a reload serves the
/// pulled game. Returns the new short HEAD.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
async fn pull_game_updates(app: tauri::AppHandle) -> Result<String, String> {
    let dir = find_game_dir(&app).ok_or_else(|| {
        "no game checkout found in this build — restart the app to pick up newer releases".to_string()
    })?;

    // Fetch the latest tip of the game repo (best effort: offline is not yet an error).
    let _ = git_out(&dir, &["fetch", "origin"]);
    let local = short_head(&dir).ok_or_else(|| "could not read the game commit".to_string())?;

    let remote = git_out(&dir, &["rev-parse", "origin/master"]);
    match remote.as_deref() {
        Some(r) if r.starts_with(local.as_str()) => return Ok(local), // already at origin/master
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

    Ok(short_head(&dir).unwrap_or(local))
}

#[tauri::command]
fn set_fullscreen(window: WebviewWindow, fullscreen: bool) -> Result<(), String> {
    window.set_fullscreen(fullscreen).map_err(|e| e.to_string())
}

#[tauri::command]
fn is_fullscreen(window: WebviewWindow) -> Result<bool, String> {
    window.is_fullscreen().map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_fullscreen(window: WebviewWindow) -> Result<bool, String> {
    let next = !window.is_fullscreen().map_err(|e| e.to_string())?;
    window.set_fullscreen(next).map_err(|e| e.to_string())?;
    Ok(next)
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
        toggle_fullscreen
    ]);

    #[cfg(any(target_os = "android", target_os = "ios"))]
    let builder = builder.invoke_handler(tauri::generate_handler![
        set_fullscreen,
        is_fullscreen,
        toggle_fullscreen
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running Emberhold");
}
