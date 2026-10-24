import path from 'node:path';
import type { Options } from '@wdio/types';

import { APP_PACKAGE } from '../src/constants.js';

const ROOT = path.resolve(import.meta.dirname, '..');

/**
 * Settings shared by every run target (local emulator, real device, CI).
 * Platform-specific files spread this and add `capabilities`.
 */
export const sharedConfig: Omit<Options.Testrunner, 'capabilities'> = {
    runner: 'local',
    tsConfigPath: path.join(ROOT, 'tsconfig.json'),

    // Smoke tests are tagged "@smoke" in their titles and picked with
    // `npm run test:smoke`, which greps for the tag.
    specs: [path.join(ROOT, 'test/specs/**/*.spec.ts')],

    // One device means one session at a time. Raise this only alongside a
    // device pool, or sessions will fight over the same emulator.
    maxInstances: 1,

    logLevel: 'warn',
    outputDir: path.join(ROOT, 'reports/logs'),
    bail: 0,

    waitforTimeout: 10_000,
    connectionRetryTimeout: 180_000,
    connectionRetryCount: 2,

    // Appium is started and stopped by the runner, using the copy in
    // node_modules, so the Appium version is pinned by package-lock.json.
    services: [
        [
            'appium',
            {
                command: path.join(ROOT, 'node_modules/.bin/appium'),
                args: {
                    relaxedSecurity: false,
                    log: path.join(ROOT, 'reports/logs/appium.log'),
                },
            },
        ],
    ],

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 180_000,
        // A failed UI test is retried once to separate real failures from
        // device hiccups. A test that only passes on retry is flagged in Allure.
        retries: 1,
    },

    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: path.join(ROOT, 'reports/allure-results'),
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false,
                addConsoleLogs: true,
            },
        ],
    ],

    /**
     * Every test starts from a fresh install state: data cleared, app relaunched.
     * Tests never depend on what an earlier test left behind, so any one of them
     * can run alone or in any order.
     */
    beforeTest: async () => {
        await driver.execute('mobile: clearApp', { appId: APP_PACKAGE });
        await driver.activateApp(APP_PACKAGE);
    },

    afterTest: async (test, _context, { passed }) => {
        if (passed) return;
        const safeName = test.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 80);
        await driver.saveScreenshot(path.join(ROOT, `reports/screenshots/${safeName}.png`));
    },
};
