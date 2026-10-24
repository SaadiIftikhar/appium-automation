import { APP_PACKAGE } from '../../src/constants.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import OnboardingScreen, { ONBOARDING_PAGES } from '../../src/screens/OnboardingScreen.js';

describe('Onboarding', () => {
    beforeEach(async () => {
        await OnboardingScreen.waitForLaunch();
    });

    it('TC-ONB-01 shows the first page on a fresh install @smoke', async () => {
        await OnboardingScreen.waitForPage(ONBOARDING_PAGES[0]);
        expect(await OnboardingScreen.isSkipEnabled()).toBe(true);
    });

    it('TC-ONB-02 Continue walks through every page in order', async () => {
        for (const title of ONBOARDING_PAGES.slice(1)) {
            await OnboardingScreen.tapContinue();
            await OnboardingScreen.waitForPage(title);
        }
        expect(await OnboardingScreen.isOnLastPage()).toBe(true);
    });

    it('TC-ONB-03 swiping moves to the next page', async () => {
        await OnboardingScreen.swipeToNextPage();
        await OnboardingScreen.waitForPage(ONBOARDING_PAGES[1]);
    });

    it('TC-ONB-04 page dots jump straight to a page', async () => {
        await OnboardingScreen.tapDot(3);
        await OnboardingScreen.waitForPage(ONBOARDING_PAGES[2]);
        expect(await OnboardingScreen.isOnLastPage()).toBe(true);
    });

    it('TC-ONB-05 Skip is disabled on the last page', async () => {
        await OnboardingScreen.tapDot(3);
        await OnboardingScreen.waitForPage(ONBOARDING_PAGES[2]);
        expect(await OnboardingScreen.isSkipEnabled()).toBe(false);
    });

    it('TC-ONB-06 Skip lands on an empty home screen @smoke', async () => {
        await OnboardingScreen.skip();
        await HomeScreen.waitForDisplayed();
        expect(await HomeScreen.isEmptyStateShown()).toBe(true);
    });

    it('TC-ONB-07 "Not now" on the last page finishes onboarding', async () => {
        await OnboardingScreen.tapDot(3);
        await OnboardingScreen.notNow();
        await HomeScreen.waitForDisplayed();
    });

    it('TC-ONB-08 "Allow notifications" finishes onboarding', async () => {
        await OnboardingScreen.tapDot(3);
        await OnboardingScreen.allowNotifications();
        // Permission was granted at install, so no system dialog interrupts.
        await HomeScreen.waitForDisplayed();
    });

    it('TC-ONB-09 is not shown again after the app restarts', async () => {
        await OnboardingScreen.skip();
        await HomeScreen.waitForDisplayed();

        await driver.terminateApp(APP_PACKAGE);
        await driver.activateApp(APP_PACKAGE);

        await HomeScreen.waitForLaunch();
        expect(await OnboardingScreen.isDisplayed()).toBe(false);
    });
});
