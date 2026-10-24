import { TIMEOUT } from '../constants.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';

/** How long the hint count must hold still before it counts as settled. */
const SETTLE_MS = 750;

/**
 * First-run hints ("Tap the icon to change it", ...) shown in the editors,
 * each with a dismiss button.
 *
 * They arrive asynchronously, after the app has read whether each was seen
 * before, so on a slow device the editor can be on screen for a moment with
 * none of them. Dismissing too early misses them; they then appear, push the
 * form down, and leave any element found in the meantime stale. So this
 * waits for the count to hold still, then dismisses each with a fresh lookup.
 */
class Hints {
    private count(): Promise<number> {
        return $$(byId(TestIds.hintDismiss)).length;
    }

    async dismissAll(): Promise<void> {
        await this.waitUntilSettled();
        for (let remaining = await this.count(); remaining > 0; remaining = await this.count()) {
            const before = remaining;
            await $$(byId(TestIds.hintDismiss))[0].click();
            await browser.waitUntil(async () => (await this.count()) < before, {
                timeout: TIMEOUT.short,
                timeoutMsg: 'A first-run hint did not go away when dismissed',
            });
        }
    }

    private async waitUntilSettled(): Promise<void> {
        let last = await this.count();
        let stableSince = Date.now();
        await browser.waitUntil(
            async () => {
                const now = await this.count();
                if (now !== last) {
                    last = now;
                    stableSince = Date.now();
                }
                return Date.now() - stableSince >= SETTLE_MS;
            },
            { timeout: TIMEOUT.short, interval: 150, timeoutMsg: 'First-run hints kept changing' },
        );
    }
}

export default new Hints();
