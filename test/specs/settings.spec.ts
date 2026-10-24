import BottomNav from '../../src/components/BottomNav.js';
import { launchToHome } from '../../src/flows/reminders.flow.js';
import SettingsScreen from '../../src/screens/SettingsScreen.js';

describe('Settings', () => {
    beforeEach(async () => {
        await launchToHome();
        await BottomNav.open('Settings');
        await SettingsScreen.waitForDisplayed();
    });

    it('TC-SET-01 shows the permissions, backup and about rows', async () => {
        for (const row of ['permissions', 'export', 'import', 'about'] as const) {
            expect(await SettingsScreen.hasRow(row)).toBe(true);
        }
    });

    it('TC-SET-02 reports permissions as allowed when they were granted at install', async () => {
        // autoGrantPermissions grants POST_NOTIFICATIONS; USE_EXACT_ALARM is
        // granted by the system to any app that declares it.
        await browser.waitUntil(async () => (await SettingsScreen.permissionStatus()) !== 'Checking…', {
            timeoutMsg: 'Permission status never finished checking',
        });
        expect(await SettingsScreen.permissionStatus()).toBe('Notifications and exact alarms allowed');
    });

    it('TC-SET-03 explains what export and import do', async () => {
        expect(await SettingsScreen.rowDetails('export')).toContain('Save your reminders to a file');
        expect(await SettingsScreen.rowDetails('import')).toContain('Bring reminders in from a backup file');
    });
});
