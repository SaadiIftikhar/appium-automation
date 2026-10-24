import { labelLine, labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

export type SettingsRow = 'permissions' | 'export' | 'import' | 'about';

const ROW_IDS: Record<SettingsRow, string> = {
    permissions: TestIds.settingsPermissions,
    export: TestIds.settingsExport,
    import: TestIds.settingsImport,
    about: TestIds.settingsAbout,
};

/** Permissions status, backup export / import, and the About row. */
class SettingsScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.settingsPermissions));
    }

    async hasRow(row: SettingsRow): Promise<boolean> {
        return $(byId(ROW_IDS[row])).isExisting();
    }

    /** A row's merged label: title, subtitle and any button text. */
    async rowDetails(row: SettingsRow): Promise<string> {
        return labelOf($(byId(ROW_IDS[row])));
    }

    /** The permissions row's subtitle, e.g. "Notifications and exact alarms allowed". */
    async permissionStatus(): Promise<string> {
        return labelLine(this.trait, 1);
    }
}

export default new SettingsScreen();
