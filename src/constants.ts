/** Application id of the app under test, from android/app/build.gradle.kts. */
export const APP_PACKAGE = 'com.saadi.step_reminder';

/** Launcher activity, from AndroidManifest.xml. */
export const APP_ACTIVITY = '.MainActivity';

/**
 * Multiplies every wait, for slow devices. CI sets it, because a software-
 * rendered emulator on a shared runner is several times slower than a
 * desktop one.
 */
const SLOWDOWN = Number(process.env.TIMEOUT_FACTOR ?? 1);

/** Waits used across screens, in milliseconds. */
export const TIMEOUT = {
    /** A screen transition or dialog appearing. */
    short: 5_000 * SLOWDOWN,
    /** The app cold-starting after data is cleared. */
    launch: 20_000 * SLOWDOWN,
} as const;
