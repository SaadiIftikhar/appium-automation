// Shared helpers for the emulator scripts: finding the Android SDK and its
// tools on Windows, macOS and Linux.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const isWindows = process.platform === 'win32';

export const AVD_NAME = process.env.AVD_NAME ?? 'cadence-e2e';
export const API_LEVEL = process.env.AVD_API_LEVEL ?? '34';

/** Apple Silicon hosts run arm64 images; everything else runs x86_64. */
export const HOST_ABI = os.arch() === 'arm64' ? 'arm64-v8a' : 'x86_64';
export const SYSTEM_IMAGE = `system-images;android-${API_LEVEL};google_apis;${HOST_ABI}`;

function defaultSdkLocations() {
    const home = os.homedir();
    if (isWindows) return [path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk')];
    if (process.platform === 'darwin') return [path.join(home, 'Library', 'Android', 'sdk')];
    return [path.join(home, 'Android', 'Sdk'), '/usr/local/lib/android/sdk'];
}

export function sdkRoot() {
    const candidates = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, ...defaultSdkLocations()];
    const found = candidates.find((dir) => dir && fs.existsSync(dir));
    if (!found) {
        fail(
            'Android SDK not found. Install Android Studio or the command-line tools,\n' +
                'then set ANDROID_HOME to the SDK folder.',
        );
    }
    return found;
}

/** Path to an SDK tool, with the right extension for this OS. */
export function tool(relative, { optional = false } = {}) {
    const root = sdkRoot();
    const ext = { sdkmanager: '.bat', avdmanager: '.bat', emulator: '.exe', adb: '.exe' };
    const base = path.basename(relative);
    const file = path.join(root, relative) + (isWindows ? (ext[base] ?? '') : '');
    if (!fs.existsSync(file)) {
        if (optional) return null;
        fail(`Missing ${file}.`);
    }
    return file;
}

export function cmdlineTool(name) {
    const root = sdkRoot();
    const dir = ['latest', ...safeReaddir(path.join(root, 'cmdline-tools')).sort().reverse()]
        .map((v) => path.join('cmdline-tools', v, 'bin', name))
        .find((rel) => fs.existsSync(path.join(root, rel) + (isWindows ? '.bat' : '')));
    if (!dir) {
        fail(
            'Android SDK command-line tools not found.\n' +
                'Install "Android SDK Command-line Tools (latest)" from Android Studio > SDK Manager.',
        );
    }
    return tool(dir);
}

function safeReaddir(dir) {
    try {
        return fs.readdirSync(dir);
    } catch {
        return [];
    }
}

/**
 * Windows can only run .bat files through cmd.exe, and Node refuses to pass
 * an argument list to a shell (DEP0190). So a .bat call is built into one
 * quoted command line; every other tool gets its arguments directly.
 */
function invoke(file, args, options) {
    const env = { ...process.env, ANDROID_HOME: sdkRoot(), ANDROID_SDK_ROOT: sdkRoot() };
    if (isWindows && file.endsWith('.bat')) {
        const quote = (s) => `"${String(s).replace(/"/g, '""')}"`;
        return spawnSync([file, ...args].map(quote).join(' '), { ...options, env, shell: true });
    }
    return spawnSync(file, args, { ...options, env });
}

/** Runs a tool to completion, streaming its output, optionally feeding stdin. */
export function run(file, args, { input } = {}) {
    const result = invoke(file, args, { stdio: [input ? 'pipe' : 'inherit', 'inherit', 'inherit'], input });
    if (result.status !== 0) fail(`${path.basename(file)} ${args.join(' ')} exited with ${result.status}`);
}

/** Runs a tool and returns its output, or '' if it fails. */
export function capture(file, args) {
    const result = invoke(file, args, { encoding: 'utf8' });
    return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

export function startDetached(file, args) {
    const child = spawn(file, args, { detached: true, stdio: 'ignore' });
    child.unref();
}

export function fail(message) {
    console.error(`\n${message}\n`);
    process.exit(1);
}
