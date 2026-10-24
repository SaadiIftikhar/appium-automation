import { attributeIsTrue, labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** One step on screen: its name, an optional countdown, Reset and Done. */
class RunStepScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.stepDone));
    }

    private get startPause() {
        return $(byId(TestIds.timerStartPause));
    }

    /**
     * Name of the step on screen. Moving to the next step slides the old one
     * out as the new one slides in, so for a moment both share the id; the
     * last match is the arriving step.
     */
    async currentStep(): Promise<string> {
        const titles = await $$(byId(TestIds.stepTitle));
        if (titles.length === 0) return '';
        return labelOf(titles[titles.length - 1]);
    }

    async waitForStep(title: string): Promise<void> {
        await browser.waitUntil(async () => (await this.currentStep()) === title, {
            timeoutMsg: `Step "${title}" is not on screen; saw "${await this.currentStep()}"`,
        });
    }

    async markDone(): Promise<void> {
        await this.trait.click();
    }

    async reset(): Promise<void> {
        await $(byId(TestIds.stepReset)).click();
    }

    async isDoneEnabled(): Promise<boolean> {
        return this.trait.isEnabled();
    }

    async isResetEnabled(): Promise<boolean> {
        return $(byId(TestIds.stepReset)).isEnabled();
    }

    // Timer controls, present only on a step with a timer ----------------------

    async hasTimer(): Promise<boolean> {
        return this.startPause.isExisting();
    }

    async start(): Promise<void> {
        if (!(await this.isRunning())) await this.startPause.click();
    }

    async pause(): Promise<void> {
        if (await this.isRunning()) await this.startPause.click();
    }

    async restartTimer(): Promise<void> {
        await $(byId(TestIds.timerRestart)).click();
    }

    /** The play/pause control is labelled by what tapping it would do. */
    async isRunning(): Promise<boolean> {
        return (await labelOf(this.startPause)) === 'Pause';
    }

    /**
     * Whether the timer controls respond. They are plain tap targets rather
     * than buttons, so "inert" shows up as not clickable, not as disabled.
     */
    async areTimerControlsActive(): Promise<boolean> {
        return attributeIsTrue(this.startPause, 'clickable');
    }

    /** The countdown reading, e.g. "01:00". */
    async remaining(): Promise<string> {
        return labelOf($(byId(TestIds.timerRemaining)));
    }
}

export default new RunStepScreen();
