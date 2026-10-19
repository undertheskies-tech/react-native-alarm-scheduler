# Fork of react-native-alarm-scheduler

This repository is `undertheskies-tech/react-native-alarm-scheduler`, a fork of [prashantrajm/react-native-alarm-scheduler](https://github.com/prashantrajm/react-native-alarm-scheduler) maintained for the talking-alarm app (`~/personal/apps/talking-alarm`). It carries fixes the app needs before they are released upstream. The original README describes the library itself.

## Vocabulary

- **upstream:** the original repository, `prashantrajm/react-native-alarm-scheduler`. In this clone it's the git remote named `upstream`, fetch only (push is disabled).
- **origin:** this fork on GitHub, `undertheskies-tech/react-native-alarm-scheduler`.
- **fix branch:** a branch named `fix/<topic>` that starts from an upstream commit (currently the `v1.0.1` tag) and holds exactly one fix. It contains nothing fork-specific, so it can be offered upstream as a pull request unchanged.
- **release branch:** the branch named `release`, the version the app installs. It contains upstream's code, the merged fixes, and the fork-only changes listed below.
- **fork-only changes:** changes that exist only on `release` and are never offered upstream.
- **pin:** the app's `package.json` refers to one exact commit of `release` by its full hash, never to the branch name.

## Branches

- `main`: an exact copy of upstream's `main`. It's only used to bring in upstream updates; no fork commits go here.
- `fix/<topic>`: one per fix, see "Fixes".
- `release`: what the app installs.

## How the app installs it

In talking-alarm's `package.json`:

```json
"react-native-alarm-scheduler": "git+https://github.com/undertheskies-tech/react-native-alarm-scheduler.git#<full commit hash of release>"
```

- npm downloads public GitHub repositories over HTTPS (`codeload.github.com`), so EAS build servers need no SSH keys, even though `package-lock.json` records the source as `git+ssh://`.
- npm doesn't check a content hash for git dependencies ("skipping integrity check for git dependency"). The full commit hash in the pin is what fixes the exact code.
- Tested 2026-10-19 in a scratch copy of the app: a clean `npm ci` with an empty npm cache and SSH disabled installed from GitHub, the app's patches applied, and `expo prebuild` passed. Building `v1.0.1` from source gave files byte-identical to the npm package `react-native-alarm-scheduler@1.0.1`.

## Fork-only changes (on `release`)

- **`build/` is committed.** `.gitignore` re-includes the top-level `build/` folder (`!/build/`). This is the compiled JavaScript and type declarations from `src/`, which npm normally gets from the published package.
- **No `prepare` script in `package.json`.** When npm installs a package from git and it has a `prepare` script, npm first installs the package's development dependencies (Expo 55, React Native 0.82, `expo-module-scripts` with a `^` version range) and runs their install scripts, on the developer's laptop and on EAS. Without `prepare`, installing just copies the files listed in `files`. The `prepack` script stays: it's a plain Node check that the bundled silent sound exists.
- **This file, `FORK.md`.** It isn't in `files`, so it isn't installed into the app.

## Workflow

### A new fix

1. Create `fix/<topic>` from the upstream commit the fork is based on (now `v1.0.1`), as its own command: `git switch -c fix/<topic> v1.0.1`.
2. Commit the fix there, one topic per branch, upstream commit style (`fix: …`).
3. The user pushes the branch and opens a pull request into `release` **in this fork**, for review.
4. After merging into `release`: if the fix changed anything under `src/`, run `npm ci` (rebuilds `build/` through `expo-module prepare`, still present on fix branches) and commit the changed `build/` files on `release`.
5. In talking-alarm, update the pin to the new `release` commit and run `npm install`.

### Bringing in upstream updates

1. `git fetch upstream`, then update `main` to `upstream/main` (fast-forward only).
2. Read upstream's changelog and diff before anything else, as talking-alarm's `CLAUDE.md` requires for every library upgrade.
3. Merge the new upstream tag into `release`, resolve conflicts, rebuild `build/`, commit.
4. Fix branches that upstream hasn't merged yet may need rebasing onto the new tag before they're offered upstream.

### Offering a fix upstream

A fix branch becomes a pull request from `undertheskies-tech:fix/<topic>` to `prashantrajm:main`. Nothing is posted upstream without the user's explicit OK.

## Fixes

### Config plugin: pass the whole manifest document to the permission helpers

- **Problem:** the Android part of `app.plugin.js` passes `modResults.manifest` (the inner `<manifest>` element) to Expo's permission helper, which expects the whole manifest document (`modResults`). `expo prebuild` then fails with `TypeError: [android.manifest]: withAndroidManifestBaseMod: Cannot read properties of undefined (reading 'uses-permission')`, so no build can run.
- **Fix:** upstream issue #22, fixed by upstream PR #23 (by Giorgi Lomidze): collect the enabled permissions and apply them with `AndroidConfig.Permissions.ensurePermissions(modConfig.modResults, permissions)`, plus a test (`npm run test:plugin`).
- **In this fork:** PR #23's own commit `efe439e`, fetched with `git fetch upstream pull/23/head:pr-23` and fast-forwarded into `release`. Keeping the original commit keeps the author's credit, and upstream merging PR #23 later adds no duplicate.
- **Upstream status (2026-10-19):** issue #22 and PR #23 open, unmerged. To do, with the user's OK: comment on PR #23 that the fix works on Expo SDK 57.
- **Remove when:** upstream releases it.

### Direct boot: ring alarms after a reboot before the first unlock

- **Branch:** `fix/direct-boot` (commit `0e4944b`).
- **Problem:** after a phone restart, an alarm didn't ring until the user unlocked the phone, and an alarm due before that unlock was lost for good (talking-alarm spike test e2, 2026-10-18). Android keeps an app's normal private storage encrypted until the first unlock after a restart (Direct Boot mode) and only starts components marked `directBootAware`. The library's components weren't marked, and its alarm list and sound files lived in that normal storage.
- **Fix:**
  - `AndroidManifest.xml`: `android:directBootAware="true"` on `AlarmSchedulerReceiver`, `AlarmSchedulerBootReceiver` (which already listens for `LOCKED_BOOT_COMPLETED`), `AlarmSchedulerRingService` and `AlarmSchedulerRingActivity`. Android's own Clock app (AOSP DeskClock) marks the same four kinds of component.
  - `AlarmSchedulerStore.kt`, `AlarmSchedulerOccurrenceStore.kt`: the settings files (`SharedPreferences`) come from `createDeviceProtectedStorageContext()`.
  - `AlarmSchedulerSoundStore.kt`: copied sound files go to the device-protected `filesDir`.
- **Tested:** 2026-10-19 on an Honor X9d (Android 16), release-mode build of talking-alarm with the same change as a `patch-package` patch: after a restart the alarm rang while the phone was still locked, and Stop worked (spike test e2c in talking-alarm's `docs/research/alarm-libraries.md`). On Honor this also needs the phone's "App launch" setting for the app on manual with Auto-launch on; that's a phone setting, not part of the fix.
- **Not included:** moving data that existing installs saved in normal storage before this change. talking-alarm had no users yet, so it doesn't need it. Without it, an existing install's alarms, which Android keeps across an app update, would fire into an empty store and be silently missed.
- **Upstream status:** not offered. Before a pull request upstream it needs: the data-moving step (`moveSharedPreferencesFrom` for both preference files, the sound files, and the sound URIs stored in each alarm, run only once the user has unlocked), hiding "Open app" on the ring screen before the first unlock, probably an opt-in setting (device-protected storage is readable before the PIN is entered), and a note about phone makers' auto-start settings in the docs.
- **Remove when:** upstream releases an equivalent fix.

### Planned

From the talking-alarm reviews of 2026-10-19 (merged summary in the talking-alarm session; architecture decisions pending): stop the previous ring cleanly when a new alarm starts (Android's Clock app marks the old one "missed"), a native Snooze button, recompute local-time alarms after a time-zone change, don't delete a ringing or unsettled alarm at the first unlock, and hide or fix "Open app" before the first unlock. Each will be its own `fix/<topic>` branch.
