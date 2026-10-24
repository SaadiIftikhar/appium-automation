import TimerPicker, { type TimerLength } from '../components/TimerPicker.js';
import { appears } from '../helpers/elements.js';
import { hideKeyboard } from '../helpers/gestures.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** Editor for one step inside a routine, pushed from the routine editor. */
class StepEditorScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.stepEditorSave));
    }

    /** Whether the editor is still open, e.g. after a rejected save. */
    async isOpen(): Promise<boolean> {
        return appears(this.trait, 2_000);
    }

    async dismissHints(): Promise<void> {
        const hints = await $$(byId(TestIds.hintDismiss));
        if (hints.length > 0) await hints[0].click();
    }

    async enterTitle(title: string): Promise<void> {
        await this.typeInto($(byId(TestIds.stepEditorTitleField)), title);
        await hideKeyboard();
    }

    async setTimer(length: TimerLength): Promise<void> {
        await TimerPicker.set(length);
    }

    async save(): Promise<void> {
        await this.trait.click();
    }

    async delete(): Promise<void> {
        await $(byId(TestIds.stepEditorDelete)).click();
    }

    /** A step still being created has nothing to delete, so it has no button. */
    async canDelete(): Promise<boolean> {
        return $(byId(TestIds.stepEditorDelete)).isExisting();
    }
}

export default new StepEditorScreen();
