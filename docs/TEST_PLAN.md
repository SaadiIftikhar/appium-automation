# Test plan: Cadence Android app

## Scope

Black-box UI tests for [Cadence](https://github.com/SaadiIftikhar/cadence). Cadence is a
Flutter reminder app for single steps and multi-step routines. The tests run against the
published release APK, the same build users install.

**In scope:** onboarding, navigation, creating and editing reminders, form validation,
running routines and timed steps, home-list actions (edit, turn off, delete), ordering and
persistence, the icon picker, the calendar, and the settings screen.

**Out of scope:**

| Area | Reason |
|---|---|
| Alarm and notification firing at a set time | Depends on wall-clock time and the OS scheduler. This is better covered by unit tests in the app repo, or by a dedicated test that moves the device clock. |
| Image picking and cropping | Hands off to the system gallery and to uCrop, outside the app's own UI. |
| Backup export / import file dialogs | Uses the system file picker (Storage Access Framework). The rows are checked, but the round trip is not. |
| Visual styling, such as red outlines on invalid fields | Colour is not exposed to the accessibility tree. Behaviour is asserted instead: the form does not save. |
| Image cards on the home list | Need a gallery image. The card carries the same `reminder-card` id as a plain one. |
| Drag-to-reorder of steps | Long-press drag on a Flutter `ReorderableListView` is unreliable through UiAutomator2. A candidate for a later W3C actions test. |

## Approach

- **Driver:** Appium 3 with UiAutomator2. No Flutter-specific driver, so no test hooks are
  compiled into the app.
- **Locators:** test ids the app sets with `Semantics(identifier: ...)`, which Android reports as
  `resource-id`, queried with UiSelector. Flutter's own time picker and dropdown menu items have
  no ids, so they are matched by accessibility label.
- **Isolation:** a Mocha root hook (`test/hooks.ts`) runs before every other hook. It clears
  app data with `mobile: clearApp`, re-grants the notification permission (which clearing
  revokes), and relaunches the app. Every test starts at onboarding with an empty database,
  and tests can run alone or in any order.
- **Environment:** an Android 14 (API 34) emulator, the same locally (`npm run emulator:setup`)
  and in CI. `scripts/prepare-device.mjs` turns off animations and Android's crash/ANR
  dialogs. A freshly booted CI emulator's launcher often stops responding, and its dialog
  covers the app and hides every element. The reset hook also taps **Wait** on any such
  dialog that appears anyway.
- **Test data:** builders in `src/data` give every reminder a unique name.
- **Waits and assertions:** explicit waits only; a lint rule rejects `browser.pause`. Whether
  something is shown or gone is asserted with WebdriverIO's retrying matchers
  (`toBeDisplayed`, `not.toBeDisplayed`), which wait either way and fail with a clear message.
- **Async safety:** type-aware ESLint rejects un-awaited promises, so a missing `await` on a
  WebdriverIO command fails the lint, not a test run later.
- **Retries:** one Mocha retry per test, to absorb emulator hiccups. Allure flags tests that
  pass only on retry. In CI, a spec file whose session dies (for example, the on-device
  UiAutomator2 server crashing) is re-run once in a fresh session.
- **Failure evidence:** each failed test saves a screenshot and the accessibility tree XML to
  `reports/failures/`. CI uploads both, with the device logcat, for each shard.
- **CI:** the suite is split across three emulators running in parallel, balanced by how long
  each spec takes. A static check fails the build if a spec file is left out of every shard.
  The shards' Allure results are merged into one report.

## Test cases

`@smoke` marks the quick health check run with `npm run test:smoke`.

### Onboarding (`onboarding.spec.ts`)
| ID | Case |
|---|---|
| TC-ONB-01 | First page shown on fresh install `@smoke` |
| TC-ONB-02 | Continue walks through all three pages in order |
| TC-ONB-03 | Swiping moves to the next page |
| TC-ONB-04 | Page dots jump straight to a page |
| TC-ONB-05 | Skip is disabled on the last page |
| TC-ONB-06 | Skip lands on an empty home screen `@smoke` |
| TC-ONB-07 | "Not now" finishes onboarding |
| TC-ONB-08 | "Allow notifications" finishes onboarding |
| TC-ONB-09 | Onboarding is not shown again after restart |

### Navigation (`navigation.spec.ts`)
| ID | Case |
|---|---|
| TC-NAV-01 | Bottom bar switches between tabs `@smoke` |
| TC-NAV-02 | Add button shown on Home only |
| TC-NAV-03 | System back from another tab returns to Home |
| TC-NAV-04 | Add menu offers a routine and a single step |
| TC-NAV-05 | Back closes the add menu |
| TC-NAV-06 | Each menu entry opens the matching editor |

### Create a single step (`create-step.spec.ts`)
| ID | Case |
|---|---|
| TC-STEP-01 | New step appears on the home list with its time `@smoke` |
| TC-STEP-02 | No repeat days reads "Today only" |
| TC-STEP-03 | Preset repeat shown by name |
| TC-STEP-04 | Hand-picked days listed in week order |
| TC-STEP-05 | Typed time is saved |
| TC-STEP-06 | Editor reflects chosen time, repeat and timer |
| TC-STEP-07 | Notification and alarm switches toggle |
| TC-STEP-08 | Backing out discards the draft |
| TC-STEP-09 | "No timer" takes a timer back off |

### Validation (`validation.spec.ts`)
| ID | Case |
|---|---|
| TC-VAL-01 | No title and no time: not saved |
| TC-VAL-02 | Title but no time: not saved |
| TC-VAL-03 | Time but no title: not saved |
| TC-VAL-04 | Whitespace-only title counts as empty |
| TC-VAL-05 | Routine without steps: not saved |
| TC-VAL-06 | Routine step without title: not saved |

### Create a routine (`create-routine.spec.ts`)
| ID | Case |
|---|---|
| TC-RTN-01 | Routine with three steps appears on home `@smoke` |
| TC-RTN-02 | Home card shows the step count |
| TC-RTN-03 | Opening it lists every step, none done |
| TC-RTN-04 | Steps listed in the order added |
| TC-RTN-05 | A step can be removed before saving |
| TC-RTN-06 | A brand-new step offers no delete |
| TC-RTN-07 | Step timer shown on the checklist |

### Run a routine (`run-routine.spec.ts`)
| ID | Case |
|---|---|
| TC-RUN-01 | Finishing a step moves on to the next `@smoke` |
| TC-RUN-02 | Progress counts finished steps |
| TC-RUN-03 | Finishing the last step returns to the checklist |
| TC-RUN-04 | Advancing only moves forward, never wraps |
| TC-RUN-05 | Reset unavailable until something is done |
| TC-RUN-06 | "Done" marks every step finished after confirmation |
| TC-RUN-07 | Reset clears progress after confirmation |
| TC-RUN-08 | Cancelling Reset keeps progress |

### Run a single step (`run-step.spec.ts`)
| ID | Case |
|---|---|
| TC-SRUN-01 | Single-step reminder opens on its step |
| TC-SRUN-02 | Done locks the step until Reset `@smoke` |
| TC-SRUN-03 | Timed step opens paused at full length |
| TC-SRUN-04 | Countdown runs, pauses, and restarts |
| TC-SRUN-05 | Finished step disables timer controls |

### Home-list actions (`reminder-actions.spec.ts`)
| ID | Case |
|---|---|
| TC-ACT-01 | Holding a card offers Edit, Turn off, Delete |
| TC-ACT-02 | Edit opens the editor with saved values |
| TC-ACT-03 | Renaming updates the home list |
| TC-ACT-04 | Turning off flips the menu to "Turn on" |
| TC-ACT-05 | Confirmed delete removes the reminder `@smoke` |
| TC-ACT-06 | Cancelled delete keeps it |
| TC-ACT-07 | Ordered by time of day, earliest first |
| TC-ACT-08 | Reminders survive an app restart |

### Icon picker (`icon-picker.spec.ts`)
| ID | Case |
|---|---|
| TC-ICON-01 | Search finds icons by name |
| TC-ICON-02 | No-match search says so |
| TC-ICON-03 | Picking returns to the editor |
| TC-ICON-04 | Back leaves without a change |
| TC-ICON-05 | Clearing a search brings the suggestions back |

### Calendar (`calendar.spec.ts`)
| ID | Case |
|---|---|
| TC-CAL-01 | Nothing scheduled with no repeating reminders |
| TC-CAL-02 | Every-day reminder listed under today |
| TC-CAL-03 | Of a weekdays and a weekend reminder, only the one for today is listed |

### Settings (`settings.spec.ts`)
| ID | Case |
|---|---|
| TC-SET-01 | Permissions, Backup and About sections shown |
| TC-SET-02 | Permissions reported as allowed |
| TC-SET-03 | Backup export and import offered |
