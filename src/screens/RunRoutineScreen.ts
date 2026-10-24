import ConfirmDialog from '../components/ConfirmDialog.js';
import { labelOf } from '../helpers/elements.js';
import { byId, byIdAndLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** Checklist of a routine's steps with a progress title and Reset / Done. */
class RunRoutineScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.routineProgress));
    }

    /** The app bar title, e.g. "1 of 3 done". */
    async progress(): Promise<string> {
        return labelOf(this.trait);
    }

    async waitForProgress(expected: string): Promise<void> {
        await browser.waitUntil(async () => (await this.progress()) === expected, {
            timeoutMsg: `Expected progress "${expected}", saw "${await this.progress()}"`,
        });
    }

    step(title: string) {
        return $(byIdAndLabel(TestIds.routineStepRow, title));
    }

    /** A step row's full label, e.g. "Plank\n00:45". */
    async stepDetails(title: string): Promise<string> {
        return labelOf(this.step(title));
    }

    async openStep(title: string): Promise<void> {
        await this.step(title).click();
    }

    async markAllDone(): Promise<void> {
        await $(byId(TestIds.routineDone)).click();
        await ConfirmDialog.confirm();
    }

    async reset({ confirm = true } = {}): Promise<void> {
        await $(byId(TestIds.routineReset)).click();
        if (confirm) await ConfirmDialog.confirm();
        else await ConfirmDialog.cancel();
    }

    async isResetEnabled(): Promise<boolean> {
        return $(byId(TestIds.routineReset)).isEnabled();
    }

    async isDoneEnabled(): Promise<boolean> {
        return $(byId(TestIds.routineDone)).isEnabled();
    }
}

export default new RunRoutineScreen();
