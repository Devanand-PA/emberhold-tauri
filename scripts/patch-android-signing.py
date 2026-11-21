#!/usr/bin/env python3
"""Patch the generated Tauri Android project so the release build is signed.

Called by .github/workflows/android.yml ("Configure Android release signing")
after `npx tauri android init --ci` generates src-tauri/gen/android/. Writes
keystore.properties pointing at a release keystore (a temporary CI key when
the ANDROID_KEYSTORE_* secrets are absent) and injects signingConfigs plus
the signingConfig wiring into src-tauri/gen/android/app/build.gradle.kts, so
`npx tauri android build --ci` produces signature-compatible APKs/AABs.

Run from the repository root (the workflow's workspace).
"""

import base64
import os
import pathlib
import subprocess
import sys

ROOT = pathlib.Path("src-tauri/gen/android")
APP_GRADLE = ROOT / "app" / "build.gradle.kts"


def main() -> None:
    if not APP_GRADLE.exists():
        print("No app/build.gradle.kts found", file=sys.stderr)
        sys.exit(1)

    ks = os.environ.get("ANDROID_KEYSTORE_BASE64", "").strip()
    ks_pass = os.environ.get("ANDROID_KEYSTORE_PASSWORD", "").strip()
    alias = os.environ.get("ANDROID_KEY_ALIAS", "").strip()
    key_pass = os.environ.get("ANDROID_KEY_PASSWORD", "").strip()

    keystore_path = ROOT / "release-keystore.jks"
    if ks and ks_pass and alias and key_pass:
        keystore_path.write_bytes(base64.b64decode(ks))
        print("Using release keystore from repository secrets.")
    else:
        ks_pass = "emberhold-ci"
        alias = "emberhold"
        key_pass = "emberhold-ci"
        subprocess.check_call([
            "keytool", "-genkeypair", "-v",
            "-keystore", str(keystore_path),
            "-storepass", ks_pass,
            "-alias", alias,
            "-keypass", key_pass,
            "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
            "-dname", "CN=Emberhold CI, OU=CI, O=Emberhold, L=Internet, S=Internet, C=US",
        ])
        print("::warning::ANDROID_KEYSTORE_* secrets not set; generated temporary CI signing key. APKs are installable, but upgrades may not be signature-compatible across keys.")

    props = ROOT / "keystore.properties"
    props.write_text(
        f"storeFile={keystore_path.resolve().as_posix()}\n"
        f"storePassword={ks_pass}\n"
        f"keyAlias={alias}\n"
        f"keyPassword={key_pass}\n"
    )

    s = APP_GRADLE.read_text()
    if "keystore.properties" not in s:
        # Add imports and signing config.
        import_block = """import java.io.FileInputStream
import java.util.Properties

val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile()))
}
"""
        s = import_block + s
        s = s.replace(
            "android {\n",
            """android {
    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
            }
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
        APP_GRADLE.write_text(s)
        print("Patched app/build.gradle.kts with release signing config.")
    else:
        print("Release signing config already present.")


if __name__ == "__main__":
    main()
