// Boots the test AVD in the background and waits until Android has finished
// starting, so the next command can run tests straight away.
//
//   npm run emulator:start              with a window
//   HEADLESS=1 npm run emulator:start   without one

import { setTimeout as sleep } from 'node:timers/promises';

import { AVD_NAME, capture, fail, startDetached, tool } from './android-sdk.mjs';

const adb = tool('platform-tools/adb');
const emulator = tool('emulator/emulator');

const BOOT_TIMEOUT_MS = 5 * 60_000;

function runningEmulators() {
    return capture(adb, ['devices'])
        .split(/\r?\n/)
        .filter((line) => /^emulator-\d+\s+device/.test(line));
}

if (runningEmulators().length > 0) {
    console.log('An emulator is already running:');
    console.log(runningEmulators().join('\n'));
    process.exit(0);
}

const args = ['-avd', AVD_NAME, '-no-snapshot-save', '-no-boot-anim', '-no-audio'];
if (process.env.HEADLESS) args.push('-no-window', '-gpu', 'swiftshader_indirect');

console.log(`Starting ${AVD_NAME}...`);
startDetached(emulator, args);

const deadline = Date.now() + BOOT_TIMEOUT_MS;
while (Date.now() < deadline) {
    await sleep(3_000);
    if (runningEmulators().length === 0) continue;
    if (capture(adb, ['shell', 'getprop', 'sys.boot_completed']).trim() === '1') {
        // Animations make UI tests slower and flakier; turn them off.
        for (const setting of ['window_animation_scale', 'transition_animation_scale', 'animator_duration_scale']) {
            capture(adb, ['shell', 'settings', 'put', 'global', setting, '0']);
        }
        console.log('Emulator is ready.');
        process.exit(0);
    }
}

fail(`Emulator did not finish booting within ${BOOT_TIMEOUT_MS / 60_000} minutes. Run "npm run emulator:setup" first?`);
