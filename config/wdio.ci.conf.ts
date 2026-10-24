import { sharedConfig } from './wdio.shared.conf.js';
import { androidCapabilities } from './capabilities.js';

/**
 * CI run on a headless emulator. Cold emulators are slow, so install and
 * instrumentation timeouts are longer than locally.
 */
export const config: WebdriverIO.Config = {
    ...sharedConfig,
    logLevel: 'info',
    // A Mocha retry reuses the session, so it cannot recover from the
    // on-device UiAutomator2 server dying. Re-running the whole spec file in
    // a fresh session can, and is deferred to the end of the run.
    specFileRetries: 1,
    specFileRetriesDeferred: true,
    // The CI emulator renders in software; give every implicit wait the same
    // headroom that TIMEOUT_FACTOR gives the explicit ones.
    waitforTimeout: 10_000 * Number(process.env.TIMEOUT_FACTOR ?? 1),
    capabilities: [
        androidCapabilities({
            'appium:androidInstallTimeout': 180_000,
            'appium:uiautomator2ServerInstallTimeout': 120_000,
            'appium:uiautomator2ServerLaunchTimeout': 120_000,
            'appium:adbExecTimeout': 120_000,
        }),
    ],
};
