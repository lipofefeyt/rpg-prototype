#!/usr/bin/env bash
# Builds the Emberhold debug APK from WSL: web bundle -> Capacitor sync -> Gradle.
#   scripts/android-build.sh             build only
#   scripts/android-build.sh --install   build, then install on a phone/emulator that
#                                        the Windows adb can see (USB debugging on)
set -euo pipefail
cd "$(dirname "$0")/.."

# android/local.properties holds the *Windows* SDK path (that is what Android Studio on
# Windows needs), so tell Linux Gradle where the same SDK is mounted instead.
if [[ -z "${ANDROID_HOME:-}" ]]; then
  WIN_LOCAL="$(cmd.exe /c 'echo %LOCALAPPDATA%' 2>/dev/null | tr -d '\r')"
  export ANDROID_HOME="$(wslpath "$WIN_LOCAL")/Android/Sdk"
fi
[[ -d "$ANDROID_HOME" ]] || { echo "Android SDK not found at $ANDROID_HOME" >&2; exit 1; }

npm run build
npx cap sync android
( cd android && ./gradlew assembleDebug -PskipWebBuild=true --console=plain )

APK="android/app/build/outputs/apk/debug/app-debug.apk"
echo
echo "APK: $(wslpath -w "$(realpath "$APK")")"

if [[ "${1:-}" == "--install" ]]; then
  "$ANDROID_HOME/platform-tools/adb.exe" install -r "$(wslpath -w "$(realpath "$APK")")"
fi
