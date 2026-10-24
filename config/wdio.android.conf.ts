import { sharedConfig } from './wdio.shared.conf.js';
import { androidCapabilities } from './capabilities.js';

/**
 * Local run against whatever single Android device `adb devices` shows:
 * an emulator or a phone with USB debugging on.
 *
 * Override with env vars, for example:
 *   ANDROID_UDID=emulator-5554 APP_PATH=./apps/my.apk npm test
 */
export const config: WebdriverIO.Config = {
    ...sharedConfig,
    capabilities: [androidCapabilities()],
};
