import { aRoutine } from '../../src/data/reminders.js';
import { createRoutine, launchToHome } from '../../src/flows/reminders.flow.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import RunRoutineScreen from '../../src/screens/RunRoutineScreen.js';
import RunStepScreen from '../../src/screens/RunStepScreen.js';

describe('Run a routine', () => {
    const routine = aRoutine();
    const [first, second, third] = routine.steps;

    beforeEach(async () => {
        await launchToHome();
        await createRoutine(routine);
        await HomeScreen.openReminder(routine.title);
        await RunRoutineScreen.waitForProgress('0 of 3 done');
    });

    it('TC-RUN-01 finishing a step moves straight on to the next one @smoke', async () => {
        await RunRoutineScreen.openStep(first.title);
        await RunStepScreen.waitForStep(first.title);

        await RunStepScreen.markDone();

        await RunStepScreen.waitForStep(second.title);
    });

    it('TC-RUN-02 progress counts finished steps', async () => {
        await RunRoutineScreen.openStep(first.title);
        await RunStepScreen.markDone();
        await RunStepScreen.waitForStep(second.title);

        await RunStepScreen.goBack();

        await RunRoutineScreen.waitForProgress('1 of 3 done');
    });

    it('TC-RUN-03 finishing the last step returns to the checklist', async () => {
        await RunRoutineScreen.openStep(first.title);
        for (const step of [first, second, third]) {
            await RunStepScreen.waitForStep(step.title);
            await RunStepScreen.markDone();
        }

        await RunRoutineScreen.waitForProgress('3 of 3 done');
        expect(await RunRoutineScreen.isDoneEnabled()).toBe(false);
    });

    it('TC-RUN-04 advancing only moves forward; it never wraps to earlier steps', async () => {
        await RunRoutineScreen.openStep(second.title);
        await RunStepScreen.markDone();
        await RunStepScreen.waitForStep(third.title);

        await RunStepScreen.markDone();

        // The first step is still unfinished, but it lies behind, so the
        // run ends and the checklist shows what is left.
        await RunRoutineScreen.waitForProgress('2 of 3 done');
    });

    it('TC-RUN-05 Reset is unavailable until something is done', async () => {
        expect(await RunRoutineScreen.isResetEnabled()).toBe(false);
    });

    it('TC-RUN-06 "Done" marks every step finished after confirmation', async () => {
        await RunRoutineScreen.markAllDone();

        await HomeScreen.waitForDisplayed();
        await HomeScreen.openReminder(routine.title);
        await RunRoutineScreen.waitForProgress('3 of 3 done');
    });

    it('TC-RUN-07 Reset clears progress after confirmation', async () => {
        await RunRoutineScreen.openStep(first.title);
        await RunStepScreen.markDone();
        await RunStepScreen.goBack();
        await RunRoutineScreen.waitForProgress('1 of 3 done');

        await RunRoutineScreen.reset({ confirm: true });

        await RunRoutineScreen.waitForProgress('0 of 3 done');
    });

    it('TC-RUN-08 cancelling Reset keeps progress', async () => {
        await RunRoutineScreen.openStep(first.title);
        await RunStepScreen.markDone();
        await RunStepScreen.goBack();
        await RunRoutineScreen.waitForProgress('1 of 3 done');

        await RunRoutineScreen.reset({ confirm: false });

        await RunRoutineScreen.waitForProgress('1 of 3 done');
    });
});
