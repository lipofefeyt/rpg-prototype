# Emberhold

A medieval pixel-art RPG for mobile: pick a Knight, Mage or Ranger, explore the Crossroads,
the Limestone Cavern, Seaside Town, the Deep Forest and the Eastern Plains, tame monsters,
gear up, take on quests, and beat three bosses. Phaser 3 + TypeScript, packaged for Android
with Capacitor.

## Develop (browser)

```
npm install
npm run dev        # http://localhost:3000
npm run build      # type-check + production bundle in dist/
```

Keys: arrows/WASD move, **Z** interact/confirm, **X** (or M/Esc) menu/back. On touch screens
use the on-screen d-pad, A and MENU buttons.

## Android

The Android project lives in `android/` (app id `com.example.rpgprototype`, name **Emberhold**).

**In Android Studio:** double-click `open-in-android-studio.bat` (or *File > Open* and choose the
`android` folder inside this repo - *not* some other project), let Gradle sync, pick your device
and press Run on the `app` configuration. After changing game code, run
`npm run build && npx cap sync android` first so the new bundle is copied into the app.

**From the command line (WSL):** `scripts/android-build.sh` builds the debug APK;
add `--install` to also install it on a connected device. The APK ends up at
`android/app/build/outputs/apk/debug/app-debug.apk`.

`android/local.properties` is machine-specific (and git-ignored): Android Studio on Windows
writes the Windows SDK path there, and the build script supplies the WSL path through
`ANDROID_HOME`, so both work side by side.

Icon and splash art are generated from `resources/icon.png` and `resources/splash.png`:
`npx capacitor-assets generate --android`.
