import fs from 'node:fs';
import path from 'node:path';
import type { Options } from '@wdio/types';

const ROOT = path.resolve(import.meta.dirname, '..');
const FAILURES = path.join(ROOT, 'reports/failures');

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

    // Appium is started and stopped by the runner. With no `command` set, the
    // service resolves the copy in node_modules, so the Appium version is
    // pinned by package-lock.json. (Setting `command` makes the service spawn
    // `appium --version` first, which crashes intermittently on Windows.)
    services: [
        [
            'appium',
            {
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
        // Every test starts from a fresh install: data cleared, permissions
        // granted, app relaunched. See test/hooks.ts.
        require: [path.join(ROOT, 'test/hooks.ts')],
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

    onPrepare: () => {
        fs.mkdirSync(FAILURES, { recursive: true });
    },

    /**
     * A failed test leaves a screenshot (also attached to its Allure entry)
     * and the accessibility tree as XML. The tree shows every id and label
     * the device reported, which is usually what a failure comes down to.
     */
    afterTest: async (test, _context, { passed }) => {
        if (passed) return;
        const base = path.join(FAILURES, test.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 80));
        await driver.saveScreenshot(`${base}.png`);
        fs.writeFileSync(`${base}.xml`, await driver.getPageSource());
    },
};
