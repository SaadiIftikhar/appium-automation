import { hideKeyboard } from '../helpers/gestures.js';
import { byId, byIdAndExactLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/**
 * Searchable grid over ~4,300 icons. Every cell shares one id and is
 * labelled with the icon's name in words ("directions run").
 *
 * Names are not unique: the Material and Tabler sets both have a "bed", for
 * one. So an icon is matched by its exact name and the first match is used.
 */
class IconPickerScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.iconSearchField));
    }

    private icons(name: string) {
        return $$(byIdAndExactLabel(TestIds.iconCell, name));
    }

    async search(query: string): Promise<void> {
        await this.typeInto(this.trait, query);
        await hideKeyboard();
    }

    async clearSearch(): Promise<void> {
        await $(byId(TestIds.iconSearchClear)).click();
    }

    async hasIcon(name: string): Promise<boolean> {
        try {
            await browser.waitUntil(async () => (await this.icons(name).length) > 0);
            return true;
        } catch {
            return false;
        }
    }

    async pick(name: string): Promise<void> {
        const matches = await this.icons(name);
        if (matches.length === 0) throw new Error(`No icon named "${name}" in the results`);
        await matches[0].click();
    }

    async resultCount(): Promise<number> {
        return $$(byId(TestIds.iconCell)).length;
    }

    /** "No icons match that search." */
    get emptyState() {
        return $(byId(TestIds.iconEmpty));
    }
}

export default new IconPickerScreen();
