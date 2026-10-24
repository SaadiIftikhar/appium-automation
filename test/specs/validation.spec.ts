import { launchToHome } from '../../src/flows/reminders.flow.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import ReminderEditorScreen from '../../src/screens/ReminderEditorScreen.js';
import StepEditorScreen from '../../src/screens/StepEditorScreen.js';

/**
 * The app blocks a save with missing fields by outlining them in red and
 * staying put. Colour is not in the accessibility tree, so these tests assert
 * the behaviour a user relies on: the editor refuses to close, and once the
 * user backs out, nothing was saved.
 */
describe('Form validation', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    async function expectSaveRejected(): Promise<void> {
        await ReminderEditorScreen.save();
        expect(await ReminderEditorScreen.staysOpen()).toBe(true);

        await ReminderEditorScreen.goBack();
        await HomeScreen.waitForDisplayed();
        expect(await HomeScreen.isEmptyStateShown()).toBe(true);
    }

    async function openNewStep(): Promise<void> {
        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
        await ReminderEditorScreen.dismissHints();
    }

    it('TC-VAL-01 a step with no title and no time is not saved', async () => {
        await openNewStep();
        await expectSaveRejected();
    });

    it('TC-VAL-02 a step with a title but no time is not saved', async () => {
        await openNewStep();
        await ReminderEditorScreen.enterTitle('No time set');
        await expectSaveRejected();
    });

    it('TC-VAL-03 a step with a time but no title is not saved', async () => {
        await openNewStep();
        await ReminderEditorScreen.setTime();
        await expectSaveRejected();
    });

    it('TC-VAL-04 a title of only spaces counts as empty', async () => {
        await openNewStep();
        await ReminderEditorScreen.enterTitle('   ');
        await ReminderEditorScreen.setTime();
        await expectSaveRejected();
    });

    it('TC-VAL-05 a routine with no steps is not saved', async () => {
        await HomeScreen.startNewRoutine();
        await ReminderEditorScreen.waitForTitle('New routine');
        await ReminderEditorScreen.dismissHints();
        await ReminderEditorScreen.enterTitle('Empty routine');
        await ReminderEditorScreen.setTime();
        expect(await ReminderEditorScreen.hasNoStepsMessage()).toBe(true);

        await expectSaveRejected();
    });

    it('TC-VAL-06 a routine step with no title is not saved', async () => {
        await HomeScreen.startNewRoutine();
        await ReminderEditorScreen.waitForTitle('New routine');
        await ReminderEditorScreen.dismissHints();
        await ReminderEditorScreen.tapAddStep();
        await StepEditorScreen.waitForDisplayed();
        await StepEditorScreen.dismissHints();

        await StepEditorScreen.save();
        expect(await StepEditorScreen.staysOpen()).toBe(true);

        await StepEditorScreen.goBack();
        await ReminderEditorScreen.waitForTitle('New routine');
        expect(await ReminderEditorScreen.stepCount()).toBe(0);
    });
});
