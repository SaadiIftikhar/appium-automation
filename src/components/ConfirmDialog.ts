import { labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';

/**
 * The app's confirmation dialogs (delete, mark done, reset) share two ids:
 * one for backing out, one for going ahead.
 */
class ConfirmDialog {
    private get confirmButton() {
        return $(byId(TestIds.dialogConfirm));
    }

    async waitForDisplayed(): Promise<void> {
        await this.confirmButton.waitForDisplayed({ timeoutMsg: 'Confirmation dialog did not appear' });
    }

    /** The confirm button's wording, e.g. "Delete", "Mark done", "Reset". */
    async confirmLabel(): Promise<string> {
        await this.waitForDisplayed();
        return labelOf(this.confirmButton);
    }

    async confirm(): Promise<void> {
        await this.waitForDisplayed();
        await this.confirmButton.click();
    }

    async cancel(): Promise<void> {
        await this.waitForDisplayed();
        await $(byId(TestIds.dialogCancel)).click();
    }
}

export default new ConfirmDialog();
