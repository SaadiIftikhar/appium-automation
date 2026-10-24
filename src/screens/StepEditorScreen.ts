import Hints from '../components/Hints.js';
import TimerPicker, { type TimerLength } from '../components/TimerPicker.js';
import { staysDisplayed } from '../helpers/elements.js';
import { hideKeyboard } from '../helpers/gestures.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** Editor for one step inside a routine, pushed from the routine editor. */
class StepEditorScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.stepEditorSave));
    }

    /** Whether the editor stays open for `ms`; see ReminderEditorScreen.staysOpen. */
    async staysOpen(ms = 2_000): Promise<boolean> {
        return staysDisplayed(this.trait, ms);
    }

    async dismissHints(): Promise<void> {
        await Hints.dismissAll();
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
