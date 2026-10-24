// Downloads the Cadence APK under test from the app's public GitHub releases.
//
//   npm run app:download                              latest release
//   CADENCE_VERSION=v1.1.0 npm run app:download       a specific tag
//   CADENCE_ASSET=Cadence-x86_64.apk npm run app:download
//
// Without CADENCE_ASSET, the build is picked to match the device: the ABI of
// the device `adb` sees, or failing that, of this machine (an emulator here
// runs this machine's architecture).

import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const REPO = 'SaadiIftikhar/cadence';
const ASSETS = { 'arm64-v8a': 'Cadence-arm64.apk', x86_64: 'Cadence-x86_64.apk' };

function deviceAbi() {
    const result = spawnSync('adb', ['shell', 'getprop', 'ro.product.cpu.abi'], { encoding: 'utf8' });
    const abi = result.status === 0 ? result.stdout.trim() : '';
    if (abi) return { abi, source: 'connected device' };
    return { abi: os.arch() === 'arm64' ? 'arm64-v8a' : 'x86_64', source: 'this machine' };
}

function chooseAsset() {
    if (process.env.CADENCE_ASSET) return process.env.CADENCE_ASSET;
    const { abi, source } = deviceAbi();
    const asset = ASSETS[abi];
    if (!asset) {
        console.error(`No Cadence build for ABI "${abi}" (${source}). Set CADENCE_ASSET to choose one.`);
        process.exit(1);
    }
    console.log(`Using ${asset} for ${abi} (${source}).`);
    return asset;
}

const version = process.env.CADENCE_VERSION ?? 'latest';
const asset = chooseAsset();
const url =
    version === 'latest'
        ? `https://github.com/${REPO}/releases/latest/download/${asset}`
        : `https://github.com/${REPO}/releases/download/${version}/${asset}`;

const target = path.resolve(import.meta.dirname, '..', 'apps', 'cadence.apk');

console.log(`Downloading ${url}`);
const response = await fetch(url);
if (!response.ok) {
    console.error(`Download failed: HTTP ${response.status} ${response.statusText}`);
    process.exit(1);
}

await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, Buffer.from(await response.arrayBuffer()));
console.log(`Saved to ${target}`);
