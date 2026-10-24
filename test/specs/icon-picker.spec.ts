import { launchToHome } from '../../src/flows/reminders.flow.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import IconPickerScreen from '../../src/screens/IconPickerScreen.js';
import ReminderEditorScreen from '../../src/screens/ReminderEditorScreen.js';

describe('Icon picker', () => {
    beforeEach(async () => {
        await launchToHome();
        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
        await ReminderEditorScreen.dismissHints();
        await ReminderEditorScreen.chooseIcon();
        await IconPickerScreen.waitForDisplayed();
    });

    it('TC-ICON-01 searching finds icons by name', async () => {
        await IconPickerScreen.search('bed');
        expect(await IconPickerScreen.hasIcon('bed')).toBe(true);
    });

    it('TC-ICON-02 a search with no matches says so', async () => {
        await IconPickerScreen.search('zzqqxx');
        await expect(IconPickerScreen.emptyState).toBeDisplayed();
        expect(await IconPickerScreen.resultCount()).toBe(0);
    });

    it('TC-ICON-03 picking an icon returns to the editor', async () => {
        await IconPickerScreen.search('bed');
        await IconPickerScreen.pick('bed');
        await ReminderEditorScreen.waitForTitle('New step');
    });

    it('TC-ICON-04 back leaves the picker without changing anything', async () => {
        await IconPickerScreen.goBack();
        await ReminderEditorScreen.waitForTitle('New step');
    });

    it('TC-ICON-05 clearing a search brings the suggestions back', async () => {
        await IconPickerScreen.search('zzqqxx');
        await expect(IconPickerScreen.emptyState).toBeDisplayed();

        await IconPickerScreen.clearSearch();

        await expect(IconPickerScreen.emptyState).not.toBeDisplayed();
        expect(await IconPickerScreen.resultCount()).toBeGreaterThan(0);
    });
});
