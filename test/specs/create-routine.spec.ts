import { aRoutine } from '../../src/data/reminders.js';
import { createRoutine, launchToHome } from '../../src/flows/reminders.flow.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import ReminderEditorScreen from '../../src/screens/ReminderEditorScreen.js';
import RunRoutineScreen from '../../src/screens/RunRoutineScreen.js';
import StepEditorScreen from '../../src/screens/StepEditorScreen.js';

describe('Create a routine', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    it('TC-RTN-01 a routine with three steps appears on the home list @smoke', async () => {
        const routine = aRoutine();

        await createRoutine(routine);

        expect(await HomeScreen.hasReminder(routine.title)).toBe(true);
    });

    it('TC-RTN-02 the home card shows how many steps the routine has', async () => {
        const routine = aRoutine();
        await createRoutine(routine);
        // The badge is merged into the card's label after title and subtitle.
        expect(await HomeScreen.reminderDetails(routine.title)).toMatch(/\n3$/);
    });

    it('TC-RTN-03 opening a routine lists every step, none done yet', async () => {
        const routine = aRoutine();
        await createRoutine(routine);

        await HomeScreen.openReminder(routine.title);

        await RunRoutineScreen.waitForProgress('0 of 3 done');
        for (const step of routine.steps) {
            expect(await RunRoutineScreen.step(step.title).isDisplayed()).toBe(true);
        }
    });

    it('TC-RTN-04 steps added in the editor are listed in the order added', async () => {
        await HomeScreen.startNewRoutine();
        await ReminderEditorScreen.waitForTitle('New routine');
        await ReminderEditorScreen.dismissHints();

        for (const title of ['First', 'Second']) {
            await ReminderEditorScreen.tapAddStep();
            await StepEditorScreen.waitForDisplayed();
            await StepEditorScreen.dismissHints();
            await StepEditorScreen.enterTitle(title);
            await StepEditorScreen.save();
            await ReminderEditorScreen.waitForTitle('New routine');
        }

        expect(await ReminderEditorScreen.stepCount()).toBe(2);
        const first = await ReminderEditorScreen.step('First').getLocation('y');
        const second = await ReminderEditorScreen.step('Second').getLocation('y');
        expect(first).toBeLessThan(second);
    });

    it('TC-RTN-05 a step can be removed before the routine is saved', async () => {
        const routine = aRoutine({ steps: [{ title: 'Keep me' }, { title: 'Remove me' }] });
        await HomeScreen.startNewRoutine();
        await ReminderEditorScreen.waitForTitle('New routine');
        await ReminderEditorScreen.dismissHints();
        for (const step of routine.steps) {
            await ReminderEditorScreen.tapAddStep();
            await StepEditorScreen.waitForDisplayed();
            await StepEditorScreen.dismissHints();
            await StepEditorScreen.enterTitle(step.title);
            await StepEditorScreen.save();
            await ReminderEditorScreen.waitForTitle('New routine');
        }

        await ReminderEditorScreen.openStep('Remove me');
        await StepEditorScreen.waitForDisplayed();
        await StepEditorScreen.delete();

        await ReminderEditorScreen.waitForTitle('New routine');
        expect(await ReminderEditorScreen.stepCount()).toBe(1);
        expect(await ReminderEditorScreen.step('Remove me').isExisting()).toBe(false);
    });

    it('TC-RTN-06 a brand-new step cannot be deleted, only abandoned', async () => {
        await HomeScreen.startNewRoutine();
        await ReminderEditorScreen.waitForTitle('New routine');
        await ReminderEditorScreen.dismissHints();
        await ReminderEditorScreen.tapAddStep();
        await StepEditorScreen.waitForDisplayed();

        expect(await StepEditorScreen.canDelete()).toBe(false);
    });

    it('TC-RTN-07 a step timer is shown on the routine checklist', async () => {
        const routine = aRoutine({
            steps: [{ title: 'Plank', timer: { seconds: 45 } }, { title: 'Rest' }],
        });
        await createRoutine(routine);

        await HomeScreen.openReminder(routine.title);

        await RunRoutineScreen.waitForProgress('0 of 2 done');
        expect(await RunRoutineScreen.stepDetails('Plank')).toContain('00:45');
    });
});
