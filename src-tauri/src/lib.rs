#[cfg(not(any(target_os = "android", target_os = "ios")))]
use serde::Deserialize;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder.invoke_handler(tauri::generate_handler![save_export_file]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running Emberhold");
}
