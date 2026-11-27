#!/usr/bin/env python3
"""Patch the generated Tauri Android project so the release build is signed
with the repository's stable release keystore.

Called by .github/workflows/release.yml ("Configure Android release signing")
after `npx tauri android init --ci` generates src-tauri/gen/android/. Writes
keystore.properties pointing at the release keystore provided by the
ANDROID_KEYSTORE_* repository secrets and injects signingConfigs plus the
signingConfig wiring into src-tauri/gen/android/app/build.gradle.kts, so
`npx tauri android build --ci` produces signature-compatible APKs/AABs.

A single stable keystore is required so that Android updates keep working:
every release must be signed with the same key. The script therefore FAILS
instead of generating a temporary key when the secrets are missing — APKs
signed with per-build random keys can never be updated over installed ones.

Run from the repository root (the workflow's workspace).
"""

import base64
import os
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "src-tauri" / "gen" / "android"
APP_GRADLE = ROOT / "app" / "build.gradle.kts"


def main() -> None:
    if not APP_GRADLE.exists():
        print("No app/build.gradle.kts found", file=sys.stderr)
        sys.exit(1)

    ks = os.environ.get("ANDROID_KEYSTORE_BASE64", "").strip()
    ks_pass = os.environ.get("ANDROID_KEYSTORE_PASSWORD", "").strip()
    alias = os.environ.get("ANDROID_KEY_ALIAS", "").strip()
    key_pass = os.environ.get("ANDROID_KEY_PASSWORD", "").strip()

    if not (ks and ks_pass and alias and key_pass):
        print(
            "ANDROID_KEYSTORE_* secrets are not set. A stable release "
            "keystore is required so Android APK/AAB updates stay "
            "signature-compatible; refusing to generate a temporary key. "
            "Set ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, "
            "ANDROID_KEY_ALIAS and ANDROID_KEY_PASSWORD in the repository "
            "secrets and run the workflow again.",
            file=sys.stderr,
        )
        sys.exit(1)

    keystore_path = ROOT / "release-keystore.jks"
    keystore_path.write_bytes(base64.b64decode(ks))
    print("Using release keystore from repository secrets.")

    props = ROOT / "keystore.properties"
    props.write_text(
        f"storeFile={keystore_path.resolve().as_posix()}\n"
        f"storePassword={ks_pass}\n"
        f"keyAlias={alias}\n"
        f"keyPassword={key_pass}\n"
    )

    s = APP_GRADLE.read_text()
    if "keystore.properties" not in s:
        # Insert signingConfigs into the android { } block. The generated
        # template already imports java.util.Properties and provides file(),
        # so no extra imports or top-level statements are needed — anything
        # prepended before the template breaks the script's parse (imports
        # must stay at the top of the file).
        #
        # Use rootProject.file(): a plain file("keystore.properties") resolves
        # relative to the :app project directory (gen/android/app), not the
        # Gradle root where keystore.properties is written below. Getting this
        # wrong leaves storeFile unset and Gradle fails at
        # :app:validateSigning*Release with "Keystore file not set".
        s = s.replace(
            "android {\n",
            """android {
    signingConfigs {
        create("release") {
            val ksProps = Properties()
            val ksFile = rootProject.file("keystore.properties")
            if (!ksFile.exists()) {
                error("Missing release signing properties: ${ksFile}")
            }
            ksProps.load(ksFile.inputStream())
            storeFile = rootProject.file(ksProps["storeFile"] as String)
            storePassword = ksProps["storePassword"] as String
            keyAlias = ksProps["keyAlias"] as String
            keyPassword = ksProps["keyPassword"] as String
        }
    }
""",
            1,
        )
        s = s.replace(
            "getByName(\"release\") {\n",
            """getByName("release") {
            signingConfig = signingConfigs.getByName("release")
""",
            1,
        )
        if "rootProject.file(\"keystore.properties\")" not in s or (
            "signingConfig = signingConfigs.getByName(\"release\")" not in s
        ):
            print(
                "Could not find the android {} / release build type blocks in "
                "the generated app/build.gradle.kts — Tauri's template may have "
                "changed.",
                file=sys.stderr,
            )
            sys.exit(1)
        APP_GRADLE.write_text(s)
        print("Patched app/build.gradle.kts with release signing config.")
    else:
        print("Release signing config already present.")


if __name__ == "__main__":
    main()