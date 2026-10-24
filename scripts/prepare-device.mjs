// Puts a connected device or emulator into a steady state for UI tests.
// Run by `npm run emulator:start`, and by CI before the suite.
//
//   node scripts/prepare-device.mjs

import { capture, tool } from './android-sdk.mjs';

const adb = tool('platform-tools/adb');

const settings = [
    // Animations make UI tests slower and flakier.
    ['global', 'window_animation_scale', '0'],
    ['global', 'transition_animation_scale', '0'],
    ['global', 'animator_duration_scale', '0'],
    // No "<app> isn't responding" or crash dialogs. On a freshly booted
    // emulator the launcher often stalls, and its dialog covers the app under
    // test, hiding every element from UiAutomator2.
    ['global', 'hide_error_dialogs', '1'],
    // Keep the screen on, so a slow test does not find it switched off.
    ['global', 'stay_on_while_plugged_in', '7'],
];

export function prepareDevice() {
    for (const [namespace, key, value] of settings) {
        capture(adb, ['shell', 'settings', 'put', namespace, key, value]);
    }
    // Close a dialog that is already showing.
    capture(adb, ['shell', 'am', 'broadcast', '-a', 'android.intent.action.CLOSE_SYSTEM_DIALOGS']);
}

// Run directly (not imported by start-emulator.mjs).
if (process.argv[1]?.endsWith('prepare-device.mjs')) {
    prepareDevice();
    console.log('Device prepared for UI tests.');
}
