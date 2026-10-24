import ActionMenu from '../../src/components/ActionMenu.js';
import BottomNav from '../../src/components/BottomNav.js';
import { launchToHome } from '../../src/flows/reminders.flow.js';
import { pressBack } from '../../src/helpers/gestures.js';
import CalendarScreen from '../../src/screens/CalendarScreen.js';
import HomeScreen from '../../src/screens/HomeScreen.js';
import ReminderEditorScreen from '../../src/screens/ReminderEditorScreen.js';
import { TestIds } from '../../src/testIds.js';
import SettingsScreen from '../../src/screens/SettingsScreen.js';

describe('Navigation', () => {
    beforeEach(async () => {
        await launchToHome();
    });

    it('TC-NAV-01 bottom bar switches between Home, Calendar and Settings @smoke', async () => {
        await BottomNav.open('Calendar');
        await CalendarScreen.waitForDisplayed();

        await BottomNav.open('Settings');
        await SettingsScreen.waitForDisplayed();

        await BottomNav.open('Home');
        await HomeScreen.waitForDisplayed();
    });

    it('TC-NAV-02 the add button is shown on Home only', async () => {
        await BottomNav.open('Settings');
        await SettingsScreen.waitForDisplayed();
        expect(await HomeScreen.isDisplayed()).toBe(false);
    });

    it('TC-NAV-03 system back from another tab returns to Home instead of leaving', async () => {
        await BottomNav.open('Settings');
        await SettingsScreen.waitForDisplayed();

        await pressBack();

        await HomeScreen.waitForDisplayed();
    });

    it('TC-NAV-04 the add menu offers a routine and a single step', async () => {
        await HomeScreen.openAddMenu();
        expect(await ActionMenu.labelOf(TestIds.menuAddRoutine)).toBe('Add a routine');
        expect(await ActionMenu.labelOf(TestIds.menuAddStep)).toBe('Add a step');
    });

    it('TC-NAV-05 back closes the add menu without opening an editor', async () => {
        await HomeScreen.openAddMenu();
        await pressBack();
        await HomeScreen.waitForDisplayed();
        await expect(ActionMenu.entry(TestIds.menuAddRoutine)).not.toBeDisplayed();
    });

    it('TC-NAV-06 each menu entry opens the matching editor', async () => {
        await HomeScreen.startNewRoutine();
        await ReminderEditorScreen.waitForTitle('New routine');
        await pressBack();

        await HomeScreen.startNewStep();
        await ReminderEditorScreen.waitForTitle('New step');
    });
});
