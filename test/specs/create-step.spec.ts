import { aStep } from '../../src/data/reminders.js';
import { createSingleStep, launchToHome } from '../../src/flows/reminders.flow.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import ReminderEditorScreen from '../../src/screens/ReminderEditorScreen.js';

describe('Create a single-step reminder', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    it('TC-STEP-01 a new step appears on the home list with its time @smoke', async () => {
        const step = aStep();

        await createSingleStep(step);

        expect(await HomeScreen.hasReminder(step.title)).toBe(true);
        expect(await HomeScreen.reminderDetails(step.title)).toContain('8:00 AM');
        await expect(HomeScreen.emptyState).not.toBeDisplayed();
    });

    it('TC-STEP-02 a step with no repeat days is labelled "Today only"', async () => {
        const step = aStep();
        await createSingleStep(step);
        expect(await HomeScreen.reminderDetails(step.title)).toContain('Today only');
    });

    it('TC-STEP-03 a preset repeat is shown by name', async () => {
        const step = aStep({ repeat: 'Weekdays' });
        await createSingleStep(step);
        expect(await HomeScreen.reminderDetails(step.title)).toContain('Weekdays');
    });

    it('TC-STEP-04 hand-picked days are listed in week order', async () => {
        // Picked out of order on purpose: the summary must still read Monday first.
        const step = aStep({ repeat: ['Wed', 'Mon'] });
        await createSingleStep(step);
        expect(await HomeScreen.reminderDetails(step.title)).toContain('Mon, Wed');
    });

    it('TC-STEP-05 a time typed into the picker is saved', async () => {
        const step = aStep({ time: { hour: 7, minute: 45, period: 'PM' } });
        await createSingleStep(step);
        expect(await HomeScreen.reminderDetails(step.title)).toContain('7:45 PM');
    });

    it('TC-STEP-06 the editor shows the chosen values before saving', async () => {
        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
        await ReminderEditorScreen.dismissHints();

        expect(await ReminderEditorScreen.timeValue()).toBe('Set time');
        expect(await ReminderEditorScreen.repeatValue()).toBe('Today only');
        expect(await ReminderEditorScreen.timerValue()).toBe('None');

        await ReminderEditorScreen.setTime();
        await ReminderEditorScreen.setRepeat('Every day');
        await ReminderEditorScreen.setTimer({ minutes: 1, seconds: 30 });

        expect(await ReminderEditorScreen.timeValue()).toBe('8:00 AM');
        expect(await ReminderEditorScreen.repeatValue()).toBe('Every day');
        expect(await ReminderEditorScreen.timerValue()).toBe('01:30');
    });

    it('TC-STEP-07 notification and alarm switches start off and can be turned on', async () => {
        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
        await ReminderEditorScreen.dismissHints();

        expect(await ReminderEditorScreen.isSwitchOn('Notifications')).toBe(false);
        expect(await ReminderEditorScreen.isSwitchOn('Alarm')).toBe(false);

        await ReminderEditorScreen.toggle('Notifications');
        await ReminderEditorScreen.toggle('Alarm');

        expect(await ReminderEditorScreen.isSwitchOn('Notifications')).toBe(true);
        expect(await ReminderEditorScreen.isSwitchOn('Alarm')).toBe(true);
    });

    it('TC-STEP-08 backing out of the editor discards the draft', async () => {
        const title = aStep().title;
        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
        await ReminderEditorScreen.dismissHints();
        await ReminderEditorScreen.enterTitle(title);

        await ReminderEditorScreen.goBack();

        await HomeScreen.waitForDisplayed();
        await expect(HomeScreen.emptyState).toBeDisplayed();
    });

    it('TC-STEP-09 "No timer" takes a timer back off', async () => {
        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
        await ReminderEditorScreen.dismissHints();
        await ReminderEditorScreen.setTimer({ minutes: 2 });
        expect(await ReminderEditorScreen.timerValue()).toBe('02:00');

        await ReminderEditorScreen.clearTimer();

        expect(await ReminderEditorScreen.timerValue()).toBe('None');
    });
});
