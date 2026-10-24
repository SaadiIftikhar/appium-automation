import type { RoutineReminder, SingleStepReminder } from '../data/reminders.js';
import HomeScreen from '../screens/HomeScreen.js';
import OnboardingScreen from '../screens/OnboardingScreen.js';
import ReminderEditorScreen from '../screens/ReminderEditorScreen.js';
import StepEditorScreen from '../screens/StepEditorScreen.js';

/**
 * Multi-screen journeys used as setup by many specs. A spec that is *about*
 * creating a reminder drives the screens itself; one that only needs a
 * reminder to exist calls these.
 */

export async function launchToHome(): Promise<void> {
    await OnboardingScreen.dismiss();
    await HomeScreen.waitForDisplayed();
}

export async function createSingleStep(data: SingleStepReminder): Promise<void> {
    await HomeScreen.startNewStep();
    await ReminderEditorScreen.waitForTitle('New step');
    await ReminderEditorScreen.dismissHints();
    await ReminderEditorScreen.enterTitle(data.title);
    await ReminderEditorScreen.setTime(data.time);
    if (data.repeat) await ReminderEditorScreen.setRepeat(data.repeat);
    if (data.timer) await ReminderEditorScreen.setTimer(data.timer);
    await ReminderEditorScreen.save();
    await HomeScreen.waitForDisplayed();
}

export async function createRoutine(data: RoutineReminder): Promise<void> {
    await HomeScreen.startNewRoutine();
    await ReminderEditorScreen.waitForTitle('New routine');
    await ReminderEditorScreen.dismissHints();
    await ReminderEditorScreen.enterTitle(data.title);
    await ReminderEditorScreen.setTime(data.time);
    if (data.repeat) await ReminderEditorScreen.setRepeat(data.repeat);

    for (const step of data.steps) {
        await ReminderEditorScreen.tapAddStep();
        await StepEditorScreen.waitForDisplayed();
        await StepEditorScreen.dismissHints();
        await StepEditorScreen.enterTitle(step.title);
        if (step.timer) await StepEditorScreen.setTimer(step.timer);
        await StepEditorScreen.save();
        await ReminderEditorScreen.waitForTitle('New routine');
    }

    await ReminderEditorScreen.save();
    await HomeScreen.waitForDisplayed();
}
