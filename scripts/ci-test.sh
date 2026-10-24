#!/usr/bin/env bash
# Runs the suite in CI and always keeps the device log, whatever the outcome.
# Usage: scripts/ci-test.sh [extra wdio args]
set -u

mkdir -p reports/logs
node scripts/prepare-device.mjs
adb logcat -c || true

npm run test:ci -- "$@"
status=$?

adb logcat -d > reports/logs/logcat.txt 2>&1 || true
exit "$status"
