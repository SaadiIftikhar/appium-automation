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
