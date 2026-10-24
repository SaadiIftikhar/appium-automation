import { restartApp } from '../../src/helpers/app.js';
import ActionMenu from '../../src/components/ActionMenu.js';
import { aRoutine, aStep } from '../../src/data/reminders.js';
import { createRoutine, createSingleStep, launchToHome } from '../../src/flows/reminders.flow.js';
import { pressBack } from '../../src/helpers/gestures.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import ReminderEditorScreen from '../../src/screens/ReminderEditorScreen.js';
import { TestIds } from '../../src/testIds.js';

describe('Manage reminders from the home list', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    it('TC-ACT-01 holding a card offers Edit, Turn off and Delete', async () => {
        const step = aStep();
        await createSingleStep(step);

        await HomeScreen.openActions(step.title);

        expect(await ActionMenu.labelOf(TestIds.menuEdit)).toBe('Edit');
        expect(await ActionMenu.labelOf(TestIds.menuToggle)).toBe('Turn off');
        expect(await ActionMenu.labelOf(TestIds.menuDelete)).toBe('Delete');
    });

    it('TC-ACT-02 Edit opens the right editor with saved values', async () => {
        const routine = aRoutine({ repeat: 'Weekend' });
        await createRoutine(routine);

        await HomeScreen.editReminder(routine.title);

        await ReminderEditorScreen.waitForTitle('Edit routine');
        expect(await ReminderEditorScreen.currentTitle()).toBe(routine.title);
        expect(await ReminderEditorScreen.repeatValue()).toBe('Weekend');
        expect(await ReminderEditorScreen.stepCount()).toBe(routine.steps.length);
    });

    it('TC-ACT-03 renaming a reminder updates the home list', async () => {
        const step = aStep();
        const renamed = `${step.title} renamed`;
        await createSingleStep(step);

        await HomeScreen.editReminder(step.title);
        await ReminderEditorScreen.waitForTitle('Edit step');
        await ReminderEditorScreen.enterTitle(renamed);
        await ReminderEditorScreen.save();

        await HomeScreen.waitForDisplayed();
        expect(await HomeScreen.hasReminder(renamed)).toBe(true);
    });

    it('TC-ACT-04 turning a reminder off flips the menu to "Turn on"', async () => {
        const step = aStep();
        await createSingleStep(step);

        await HomeScreen.toggleReminder(step.title);
        await HomeScreen.openActions(step.title);

        expect(await HomeScreen.toggleLabel()).toBe('Turn on');
        await pressBack();
    });

    it('TC-ACT-05 deleting after confirmation removes the reminder @smoke', async () => {
        const step = aStep();
        await createSingleStep(step);

        await HomeScreen.deleteReminder(step.title, { confirm: true });

        await HomeScreen.waitForReminderGone(step.title);
        await expect(HomeScreen.emptyState).toBeDisplayed();
    });

    it('TC-ACT-06 cancelling delete keeps the reminder', async () => {
        const step = aStep();
        await createSingleStep(step);

        await HomeScreen.deleteReminder(step.title, { confirm: false });

        expect(await HomeScreen.hasReminder(step.title)).toBe(true);
    });

    it('TC-ACT-07 reminders are ordered by time of day, earliest first', async () => {
        const evening = aStep({ title: `Evening ${Date.now() % 1000}`, time: { hour: 9, minute: 0, period: 'PM' } });
        const morning = aStep({ title: `Morning ${Date.now() % 1000}`, time: { hour: 7, minute: 0, period: 'AM' } });
        // Created latest-first, so list order cannot just be creation order.
        await createSingleStep(evening);
        await createSingleStep(morning);

        const titles = await HomeScreen.visibleReminderTitles();

        expect(titles.indexOf(morning.title)).toBeLessThan(titles.indexOf(evening.title));
    });

    it('TC-ACT-08 reminders survive the app being closed and reopened', async () => {
        const routine = aRoutine();
        await createRoutine(routine);

        await restartApp();

        await HomeScreen.waitForLaunch();
        expect(await HomeScreen.hasReminder(routine.title)).toBe(true);
    });
});
