import { labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';

/**
 * The floating pill menu anchored to the add button or to a held card.
 * Each entry carries its own id (menu-add-routine, menu-edit, ...).
 */
class ActionMenu {
    async waitForEntry(id: string): Promise<void> {
        await $(byId(id)).waitForDisplayed({ timeoutMsg: `Menu entry "${id}" did not appear` });
    }

    async has(id: string): Promise<boolean> {
        return $(byId(id)).isDisplayed();
    }

    async labelOf(id: string): Promise<string> {
        return labelOf($(byId(id)));
    }

    async choose(id: string): Promise<void> {
        await $(byId(id)).click();
    }
}

export default new ActionMenu();
