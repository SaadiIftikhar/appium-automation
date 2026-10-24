// One-time setup: installs the emulator and an Android 14 system image, then
// creates the AVD the tests run on.
//
//   npm run emulator:setup
//
// Env: AVD_NAME (default cadence-e2e), AVD_API_LEVEL (default 34).

import { API_LEVEL, AVD_NAME, HOST_ABI, SYSTEM_IMAGE, capture, cmdlineTool, run, tool } from './android-sdk.mjs';

const sdkmanager = cmdlineTool('sdkmanager');
const avdmanager = cmdlineTool('avdmanager');

console.log('Accepting SDK licences...');
run(sdkmanager, ['--licenses'], { input: 'y\n'.repeat(50) });

console.log(`Installing emulator, platform-tools and ${SYSTEM_IMAGE} (about 1.5 GB the first time)...`);
run(sdkmanager, ['emulator', 'platform-tools', SYSTEM_IMAGE]);

const existing = capture(avdmanager, ['list', 'avd', '-c']).split(/\r?\n/).map((l) => l.trim());
if (existing.includes(AVD_NAME)) {
    console.log(`AVD "${AVD_NAME}" already exists; leaving it as it is.`);
} else {
    console.log(`Creating AVD "${AVD_NAME}" (Pixel 6, API ${API_LEVEL}, ${HOST_ABI})...`);
    // "no" declines a custom hardware profile.
    run(avdmanager, ['create', 'avd', '--name', AVD_NAME, '--package', SYSTEM_IMAGE, '--device', 'pixel_6'], {
        input: 'no\n',
    });
}

const emulator = tool('emulator/emulator');
const accel = capture(emulator, ['-accel-check']);
console.log(accel.trim());
if (!/accel:\s*0/.test(accel) && !/is installed and usable/i.test(accel)) {
    console.warn(
        '\nHardware acceleration looks unavailable, so the emulator will be very slow.\n' +
            'Windows: enable "Windows Hypervisor Platform" in Windows Features.\n' +
            'Linux: make sure /dev/kvm exists and is accessible.\n' +
            'macOS: works out of the box.\n',
    );
}

console.log(`\nDone. Start it with: npm run emulator:start`);
