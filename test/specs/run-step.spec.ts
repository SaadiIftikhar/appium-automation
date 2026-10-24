import { aStep } from '../../src/data/reminders.js';
import { createSingleStep, launchToHome } from '../../src/flows/reminders.flow.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import RunStepScreen from '../../src/screens/RunStepScreen.js';

describe('Run a single step', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    it('TC-SRUN-01 a single-step reminder opens straight on its step', async () => {
        const step = aStep();
        await createSingleStep(step);

        await HomeScreen.openReminder(step.title);

        await RunStepScreen.waitForStep(step.title);
        expect(await RunStepScreen.hasTimer()).toBe(false);
    });

    it('TC-SRUN-02 Done locks the step until Reset @smoke', async () => {
        const step = aStep();
        await createSingleStep(step);
        await HomeScreen.openReminder(step.title);
        await RunStepScreen.waitForStep(step.title);
        expect(await RunStepScreen.isResetEnabled()).toBe(false);

        await RunStepScreen.markDone();
        await HomeScreen.waitForDisplayed();
        await HomeScreen.openReminder(step.title);
        await RunStepScreen.waitForStep(step.title);

        expect(await RunStepScreen.isDoneEnabled()).toBe(false);
        expect(await RunStepScreen.isResetEnabled()).toBe(true);

        await RunStepScreen.reset();

        expect(await RunStepScreen.isDoneEnabled()).toBe(true);
        expect(await RunStepScreen.isResetEnabled()).toBe(false);
    });

    it('TC-SRUN-03 a timed step opens paused at its full length', async () => {
        const step = aStep({ timer: { minutes: 1 } });
        await createSingleStep(step);

        await HomeScreen.openReminder(step.title);

        await RunStepScreen.waitForStep(step.title);
        expect(await RunStepScreen.hasTimer()).toBe(true);
        expect(await RunStepScreen.isRunning()).toBe(false);
        expect(await RunStepScreen.remaining()).toBe('01:00');
    });

    it('TC-SRUN-04 the countdown runs, pauses, and returns to full time', async () => {
        const step = aStep({ timer: { minutes: 1 } });
        await createSingleStep(step);
        await HomeScreen.openReminder(step.title);
        await RunStepScreen.waitForStep(step.title);

        await RunStepScreen.start();
        expect(await RunStepScreen.isRunning()).toBe(true);
        // Let the clock move off its starting value.
        await browser.waitUntil(async () => (await RunStepScreen.remaining()) !== '01:00', {
            timeout: 5_000,
            timeoutMsg: 'Countdown did not start ticking',
        });

        await RunStepScreen.pause();
        expect(await RunStepScreen.isRunning()).toBe(false);

        await RunStepScreen.restartTimer();
        expect(await RunStepScreen.remaining()).toBe('01:00');
    });

    it('TC-SRUN-05 a finished timed step disables its timer controls', async () => {
        const step = aStep({ timer: { seconds: 30 } });
        await createSingleStep(step);
        await HomeScreen.openReminder(step.title);
        await RunStepScreen.waitForStep(step.title);

        await RunStepScreen.markDone();
        await HomeScreen.waitForDisplayed();
        await HomeScreen.openReminder(step.title);
        await RunStepScreen.waitForStep(step.title);

        expect(await RunStepScreen.areTimerControlsActive()).toBe(false);
    });
});
