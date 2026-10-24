import { appears } from '../helpers/elements.js';
import { hideKeyboard } from '../helpers/gestures.js';
import { byId, byIdAndLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/**
 * Searchable grid over ~4,300 icons. Every cell shares one id and is
 * labelled with the icon's name in words ("directions run").
 */
class IconPickerScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.iconSearchField));
    }

    private icon(name: string) {
        return $(byIdAndLabel(TestIds.iconCell, name));
    }

    async search(query: string): Promise<void> {
        await this.typeInto(this.trait, query);
        await hideKeyboard();
    }

    async clearSearch(): Promise<void> {
        await $(byId(TestIds.iconSearchClear)).click();
    }

    async hasIcon(name: string): Promise<boolean> {
        return appears(this.icon(name));
    }

    async pick(name: string): Promise<void> {
        await this.icon(name).click();
    }

    async resultCount(): Promise<number> {
        return $$(byId(TestIds.iconCell)).length;
    }

    async noResultsShown(): Promise<boolean> {
        return appears($(byId(TestIds.iconEmpty)));
    }
}

export default new IconPickerScreen();
