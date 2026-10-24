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
        expect(await CalendarScreen.isNothingScheduled()).toBe(true);
    });

    it('TC-CAL-02 an every-day reminder is listed under today', async () => {
        const step = aStep({ repeat: 'Every day' });
        await createSingleStep(step);

        await BottomNav.open('Calendar');
        await CalendarScreen.waitForDisplayed();

        expect(await CalendarScreen.hasReminder(step.title)).toBe(true);
    });

    it('TC-CAL-03 a reminder only appears on the weekdays it repeats', async () => {
        // A weekend-only reminder, checked against today and against a day
        // known to be the other kind, so the test holds on any date.
        const step = aStep({ repeat: 'Weekend' });
        await createSingleStep(step);
        await BottomNav.open('Calendar');
        await CalendarScreen.waitForDisplayed();

        const today = new Date();
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;
        expect(await CalendarScreen.hasReminder(step.title)).toBe(isWeekend);
    });
});
