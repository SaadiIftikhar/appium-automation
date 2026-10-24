import BottomNav from '../../src/components/BottomNav.js';
import { aStep } from '../../src/data/reminders.js';
import { createSingleStep, launchToHome } from '../../src/flows/reminders.flow.js';
import CalendarScreen from '../../src/screens/CalendarScreen.js';

describe('Calendar', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    it('TC-CAL-01 with no repeating reminders, today shows nothing scheduled', async () => {
        await BottomNav.open('Calendar');
        await CalendarScreen.waitForDisplayed();
        await expect(CalendarScreen.emptyState).toBeDisplayed();
    });

    it('TC-CAL-02 an every-day reminder is listed under today', async () => {
        const step = aStep({ repeat: 'Every day' });
        await createSingleStep(step);

        await BottomNav.open('Calendar');
        await CalendarScreen.waitForDisplayed();

        await expect(CalendarScreen.reminder(step.title)).toBeDisplayed();
        await expect(CalendarScreen.emptyState).not.toBeDisplayed();
    });

    it('TC-CAL-03 a reminder is listed only on the days it repeats', async () => {
        // One weekday reminder and one weekend reminder: whatever day the
        // test runs on, exactly one of them belongs to today. So the test
        // checks both that the right one is listed and that the other is not.
        const weekdays = aStep({ title: `Weekdays ${Date.now() % 10_000}`, repeat: 'Weekdays' });
        const weekend = aStep({ title: `Weekend ${Date.now() % 10_000}`, repeat: 'Weekend' });
        await createSingleStep(weekdays);
        await createSingleStep(weekend);

        await BottomNav.open('Calendar');
        await CalendarScreen.waitForDisplayed();

        // The emulator's clock follows the host's, so the host's weekday is
        // the device's weekday.
        const day = new Date().getDay();
        const isWeekend = day === 0 || day === 6;
        const [listed, notListed] = isWeekend ? [weekend, weekdays] : [weekdays, weekend];
        await expect(CalendarScreen.reminder(listed.title)).toBeDisplayed();
        await expect(CalendarScreen.reminder(notListed.title)).not.toBeDisplayed();
    });
});
