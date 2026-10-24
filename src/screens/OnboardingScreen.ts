import { TIMEOUT } from '../constants.js';
import { labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

export const ONBOARDING_PAGES = [
    'One step, or a whole routine',
    'Everything stays on your phone',
    'So it can actually remind you',
] as const;

/** First-run introduction: three pages, Skip, and the notification ask. */
class OnboardingScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.onboardingSkip));
    }

    /** Continue on pages 1-2, "Allow notifications" on page 3. */
    private get primaryButton() {
        return $(byId(TestIds.onboardingPrimary));
    }

    async waitForLaunch(): Promise<this> {
        return this.waitForDisplayed(TIMEOUT.launch);
    }

    /** Waits for the page with this title to settle on screen. */
    async waitForPage(title: string): Promise<void> {
        await browser.waitUntil(async () => (await this.currentTitle()) === title, {
            timeoutMsg: `Onboarding page "${title}" did not show; saw "${await this.currentTitle()}"`,
        });
    }

    /**
     * Title of the page on screen. While a page slides in, the outgoing one
     * briefly shares the id, so the last match is the arriving page.
     */
    async currentTitle(): Promise<string> {
        const titles = await $$(byId(TestIds.onboardingTitle));
        if (titles.length === 0) return '';
        return labelOf(titles[titles.length - 1]);
    }

    async tapContinue(): Promise<void> {
        await this.primaryButton.click();
    }

    async skip(): Promise<void> {
        await this.trait.click();
    }

    async tapDot(page: 1 | 2 | 3): Promise<void> {
        await $(byId(TestIds.onboardingDot(page))).click();
    }

    async isSkipEnabled(): Promise<boolean> {
        return this.trait.isEnabled();
    }

    async isOnLastPage(): Promise<boolean> {
        return (await labelOf(this.primaryButton)) === 'Allow notifications';
    }

    async allowNotifications(): Promise<void> {
        await browser.waitUntil(() => this.isOnLastPage(), { timeoutMsg: 'Not on the last onboarding page' });
        await this.primaryButton.click();
    }

    async notNow(): Promise<void> {
        await $(byId(TestIds.onboardingNotNow)).click();
    }

    async swipeToNextPage(): Promise<void> {
        const { width, height } = await driver.getWindowSize();
        await driver.execute('mobile: swipeGesture', {
            left: Math.round(width * 0.1),
            top: Math.round(height * 0.3),
            width: Math.round(width * 0.8),
            height: Math.round(height * 0.3),
            direction: 'left',
            percent: 0.8,
        });
    }

    /** The quickest way past onboarding, for specs that are about something else. */
    async dismiss(): Promise<void> {
        await this.waitForLaunch();
        await this.skip();
    }
}

export default new OnboardingScreen();
