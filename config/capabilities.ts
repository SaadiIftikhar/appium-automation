import fs from 'node:fs';
import path from 'node:path';

import { APP_ACTIVITY, APP_PACKAGE } from '../src/constants.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DEFAULT_APK = path.join(ROOT, 'apps/cadence.apk');

function resolveApk(): string {
    const apk = path.resolve(process.env.APP_PATH ?? DEFAULT_APK);
    if (!fs.existsSync(apk)) {
        throw new Error(`APK not found at ${apk}. Run "npm run app:download" or set APP_PATH to a local build.`);
    }
    return apk;
}

/**
 * UiAutomator2 capabilities for the Cadence release APK.
 *
 * Cadence is a Flutter app tested as a black box: no Flutter driver, no test
 * hooks compiled in. UiAutomator2 reads Flutter's accessibility tree, so the
 * build under test is the same APK users install.
 */
export function androidCapabilities(extra: WebdriverIO.Capabilities = {}): WebdriverIO.Capabilities {
    return {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'Android Emulator',
        ...(process.env.ANDROID_UDID ? { 'appium:udid': process.env.ANDROID_UDID } : {}),
        ...(process.env.ANDROID_PLATFORM_VERSION
            ? { 'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION }
            : {}),

        'appium:app': resolveApk(),
        'appium:appPackage': APP_PACKAGE,
        'appium:appActivity': APP_ACTIVITY,

        // Grants POST_NOTIFICATIONS and other runtime permissions at install,
        // so no system permission dialog interrupts a test.
        'appium:autoGrantPermissions': true,

        // The APK is installed once per session; each test then clears app data
        // (see beforeTest), which is far faster than reinstalling.
        'appium:noReset': false,
        'appium:fullReset': false,

        'appium:newCommandTimeout': 240,
        'appium:disableWindowAnimation': true,
        'appium:language': 'en',
        'appium:locale': 'US',
        ...extra,
    };
}
