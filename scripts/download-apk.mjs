// Downloads the Cadence APK under test from the app's public GitHub releases.
//
//   npm run app:download                 latest release
//   CADENCE_VERSION=v1.0.0 npm run app:download   a specific tag
//   CADENCE_ASSET=Cadence-x86_64.apk npm run app:download   another asset

import { Buffer } from 'node:buffer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPO = 'SaadiIftikhar/cadence';
const version = process.env.CADENCE_VERSION ?? 'latest';
const asset = process.env.CADENCE_ASSET ?? 'Cadence-arm64.apk';

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
