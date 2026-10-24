# Cadence: Appium E2E tests

[![Android E2E](https://github.com/SaadiIftikhar/appium-automation/actions/workflows/android-e2e.yml/badge.svg)](https://github.com/SaadiIftikhar/appium-automation/actions/workflows/android-e2e.yml)

This repo holds end-to-end UI tests for **[Cadence](https://github.com/SaadiIftikhar/cadence)**, an Android
reminder app built with Flutter, for routines that you work through one step at a time.

The suite drives the **published release APK** as a black box. It uses Appium 3 and UiAutomator2,
written in TypeScript on WebdriverIO, and runs on every push in GitHub Actions on an Android emulator.

| | |
|---|---|
| **Stack** | Appium 3 · UiAutomator2 driver · WebdriverIO 10 · Mocha · TypeScript |
| **Pattern** | Page Object Model, with screens, reusable components and multi-screen flows |
| **Reporting** | Allure, plus a screenshot on every failure |
| **CI** | GitHub Actions on an API 34 emulator, run on push, on PRs and nightly |
| **Coverage** | 67 test cases across 10 feature areas. See the [test plan](docs/TEST_PLAN.md). |

## Why UiAutomator2 and not a Flutter driver?

Flutter widgets are not native Android views, so Appium has three ways in:

| Option | Trade-off |
|---|---|
| `appium-flutter-driver` | Needs a debug build with `flutter_driver` enabled. Built on Flutter's older driver API. |
| `appium-flutter-integration-driver` | Needs the app rebuilt with a test server compiled in. |
| **UiAutomator2 (chosen)** | Reads the accessibility tree that Flutter already publishes. It tests the exact APK users install. |

Testing the shipped artifact was the deciding factor.

## Locators: test ids in the app

Flutter widgets have no Android view ids of their own. The app tags every widget a test touches
with a Flutter `Semantics(identifier: ...)`, which Android reports as the accessibility node's
`resource-id`:

```dart
TestId(TestIds.homeAddButton, child: FloatingActionButton(...))
```

```ts
$(byId(TestIds.homeAddButton)) // android=new UiSelector().resourceId("home-add-button")
```

- **Ids are a contract.** They are listed once in the app's `lib/testing/test_ids.dart` and
  mirrored here in [src/testIds.ts](src/testIds.ts). Copy changes and translations do not
  break tests.
- **Ids are invisible to users.** Nothing reads them aloud or draws them, and they ship in
  the release build, so the APK under test is still the one users install.
- **Repeated widgets share an id** (one `reminder-card` per reminder) and are told apart by
  their visible label.
- **Framework UI has no ids.** Flutter's own time picker and dropdown menu items are matched
  by accessibility label, which is the only handle they offer.
- The app has widget tests that check each id lands on the node a test needs: the one with the
  label, the enabled state and the tap action.

## Project layout

```
config/            WebdriverIO configs: shared, local Android, CI, plus capabilities
src/
  screens/         One page object per screen (Home, Editor, Run step, ...)
  components/      Widgets reused across screens (dialogs, pickers, menus, bottom nav)
  flows/           Multi-screen journeys used as test setup
  helpers/         Selector builders and native gestures
  data/            Test-data builders with unique names
test/specs/        Test files, one per feature area
scripts/           APK download
docs/TEST_PLAN.md  Scope, approach and every test case
```

## Running locally

**You need:** Node.js 22.19+, JDK 17, and the Android SDK command-line tools with
`ANDROID_HOME` set. Android Studio installs both the SDK and the command-line tools.

### 1. Install

```bash
npm ci                   # Appium and the UiAutomator2 driver, pinned in package-lock.json
```

### 2. Get a device

**Emulator.** These scripts work on Windows, macOS and Linux:

```bash
npm run emulator:setup   # one-time: installs an Android 14 image, creates AVD "cadence-e2e"
npm run emulator:start   # boots it, waits for Android to finish starting, turns off animations
```

The emulator needs hardware acceleration:

- **Windows:** turn on *Windows Hypervisor Platform* in Windows Features.
- **Linux:** `/dev/kvm` must be accessible.
- **macOS:** nothing extra is needed. On Apple Silicon the scripts pick an arm64 image.

To run without a window, set `HEADLESS=1` before `npm run emulator:start`.

**Phone.** Plug it in with USB debugging on, and check that it shows in `adb devices`.

### 3. Run

```bash
npm run app:download     # fetches the Cadence build that matches the device's CPU
npm test                 # full suite
npm run test:smoke       # @smoke-tagged tests only
npm run report           # opens the Allure report
npm run doctor           # if a session fails to start: checks the Android setup
```

Run a single file:

```bash
npx wdio run config/wdio.android.conf.ts --spec test/specs/run-routine.spec.ts
```

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `APP_PATH` | `apps/cadence.apk` | Test a local build instead |
| `CADENCE_VERSION` | `latest` | Release tag for `app:download` |
| `CADENCE_ASSET` | matches the device | `Cadence-arm64.apk` or `Cadence-x86_64.apk` |
| `ANDROID_UDID` | — | Pick a device when several are connected |
| `ANDROID_PLATFORM_VERSION` | — | Pin the Android version |
| `AVD_NAME` / `AVD_API_LEVEL` | `cadence-e2e` / `34` | Emulator the scripts create and start |

## Practices used

- **Each test is independent.** App data is cleared before every test, so each test starts from
  a fresh install and can run alone or in any order.
- **Tests read as user journeys.** Specs call screen methods such as
  `HomeScreen.deleteReminder(title)`. They never use raw selectors.
- **Fast, stable locators.** Test ids are queried with UiSelector, which runs on the device.
  No XPath.
- **No fixed sleeps.** Every wait is for a condition, and ESLint rejects `browser.pause`.
- **Gestures go through native `mobile:` commands.** UiAutomator2 runs them on the device,
  which is steadier on Flutter than pointer actions sent step by step.
- **Tests assert behaviour, not pixels.** For example, validation tests check that an invalid
  form does not save. They do not check for a red outline.
- **The Appium version is pinned.** Appium and its driver are dev dependencies, locked by
  `package-lock.json`. No global install is needed.

## Licence

[MIT](LICENSE). This licence covers the test code in this repository only. The Cadence app
has its own licence.
