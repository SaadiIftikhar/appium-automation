import { APP_PACKAGE } from '../constants.js';

/**
 * Runtime permissions the app asks for. `pm clear` revokes these along with
 * the app's data, so they are granted again after every reset; otherwise the
 * first test would run with them and every later one without.
 */
const RUNTIME_PERMISSIONS = ['android.permission.POST_NOTIFICATIONS'];

/** Puts the app back to a fresh install: no data, permissions granted, running. */
export async function resetApp(): Promise<void> {
    await driver.terminateApp(APP_PACKAGE);
    await driver.execute('mobile: clearApp', { appId: APP_PACKAGE });
    await grantPermissions();
    await driver.activateApp(APP_PACKAGE);
}

async function grantPermissions(): Promise<void> {
    // POST_NOTIFICATIONS only exists from Android 13 (API 33); before that
    // notifications need no runtime grant.
    const apiLevel = Number((driver.capabilities as Record<string, unknown>)['deviceApiLevel'] ?? 0);
    if (apiLevel && apiLevel < 33) return;
    await driver.execute('mobile: changePermissions', {
        permissions: RUNTIME_PERMISSIONS,
        appPackage: APP_PACKAGE,
        action: 'grant',
    });
}

/** Closes and reopens the app without touching its data. */
export async function restartApp(): Promise<void> {
    await driver.terminateApp(APP_PACKAGE);
    await driver.activateApp(APP_PACKAGE);
}
