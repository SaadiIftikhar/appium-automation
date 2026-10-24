/** Application id of the app under test, from android/app/build.gradle.kts. */
export const APP_PACKAGE = 'com.saadi.step_reminder';

/** Launcher activity, from AndroidManifest.xml. */
export const APP_ACTIVITY = '.MainActivity';

/** Waits used across screens, in milliseconds. */
export const TIMEOUT = {
    /** A screen transition or dialog appearing. */
    short: 5_000,
    /** The app cold-starting after data is cleared. */
    launch: 20_000,
} as const;
