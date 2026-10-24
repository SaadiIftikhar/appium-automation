import { labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';

/**
 * The floating pill menu anchored to the add button or to a held card.
 * Each entry carries its own id (menu-add-routine, menu-edit, ...).
 */
class ActionMenu {
    /** One entry, for `toBeDisplayed()` / `not.toBeDisplayed()`. */
    entry(id: string) {
        return $(byId(id));
    }

    async waitForEntry(id: string): Promise<void> {
        await this.entry(id).waitForDisplayed({ timeoutMsg: `Menu entry "${id}" did not appear` });
    }

    async labelOf(id: string): Promise<string> {
        return labelOf(this.entry(id));
    }

    async choose(id: string): Promise<void> {
        await this.entry(id).click();
    }
}

export default new ActionMenu();
