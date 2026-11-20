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

**Quick start (Android Studio):**

1. `npm install` once in the repo root, then `npx cap sync android` (creates the generated Capacitor files).
2. In Android Studio use *File > Open* and choose the **`android`** folder (not the repo root);
   `open-in-android-studio.bat` does the same. **Set *Settings > Build > Tools > Gradle > Gradle JDK*
   to a Java 21 JBR** (pick `jbr-21`, or *Download JDK...* > JetBrains Runtime 21). Studio's default
   JDK is Java 25, which Gradle 8.14 rejects ("Incompatible Gradle JVM version"); the sync then fails
   silently into a half-set-up project and no Android run configuration can be created.
3. Let Gradle sync, pick your phone in the device picker.
4. Run **Emberhold (S25)**. Debug builds rebuild the web bundle first (`npm run build:s25`), so you
   always get the current game code. Pass `-PskipWebBuild=true` to skip that (e.g. for live reload).

`node_modules` is installed per OS. The automatic web build runs only if the build tools for the OS
running Gradle are present; otherwise it prints a warning and you run `npm run build:s25` yourself
(e.g. from WSL) before pressing Run.

**From the command line (WSL):** `scripts/android-build.sh` builds the debug APK;
add `--install` to also install it on a connected device. The APK ends up at
`android/app/build/outputs/apk/debug/app-debug.apk`.

`android/local.properties` is machine-specific (and git-ignored): Android Studio on Windows
writes the Windows SDK path there, and the build script supplies the WSL path through
`ANDROID_HOME`, so both work side by side.

### Testing on a Galaxy S25

1. On the phone: enable Developer options, then USB debugging (or Wireless debugging), and accept the
   RSA prompt. The phone then shows up in Android Studio's device picker.
2. One-time: `cp .env.example .env.s25.local` and adjust the test knobs (all optional, defaults = shipped game):
   `VITE_DEBUG_FPS` (FPS/resolution readout), `VITE_ENCOUNTER_RATE_MULT`, `VITE_CLOCK_SPEED_MULT`.
3. `npm run build:s25` (type-check, bundle with `.env.s25.local`, `cap sync android`).
4. In Android Studio pick the S25 and Run `app` (debug variant). It installs as **Emberhold (Dbg)**
   with id `com.example.rpgprototype.debug`, so it never overwrites a release install.

What the build does for the S25: landscape only (both directions), immersive (system bars hidden,
swipe to peek), draws under the camera cutout, and the game canvas widens to the screen's aspect
ratio (up to 720x320 logical px) instead of letterboxing. Battle, menu and starter screens stay
480x320 and are centred; touch controls and dialogue keep a 24 px side inset.

Version numbers: `-PversionCode=2 -PversionName=1.1` (Android Studio: Settings > Build > Gradle, or
`android/gradle.properties`).

**Live reload** (edit code, see it on the phone): run `npm run dev -- --host`, then
`CAP_SERVER_URL=http://<pc-lan-ip>:3000 npx cap sync android` and Run from Android Studio.
Unset the variable and `npm run build:s25` to go back to the bundled build. Chrome DevTools:
open `chrome://inspect` on the PC with the phone attached.

Icon and splash art are generated from `resources/icon.png` and `resources/splash.png`:
`npx capacitor-assets generate --android`.
