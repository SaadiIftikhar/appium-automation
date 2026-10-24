import { resetApp } from '../src/helpers/app.js';

/**
 * Mocha root hooks, loaded through `mochaOpts.require`.
 *
 * The reset lives here rather than in WebdriverIO's `beforeTest`, because
 * that one runs after each spec's own `beforeEach`: a spec waiting in its
 * `beforeEach` for the first screen would be looking at whatever the
 * previous test left behind. Root hooks run before every other hook.
 */
export const mochaHooks = {
    async beforeEach(): Promise<void> {
        await resetApp();
    },
};
