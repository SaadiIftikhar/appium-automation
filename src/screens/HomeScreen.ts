import ActionMenu from '../components/ActionMenu.js';
import ConfirmDialog from '../components/ConfirmDialog.js';
import { TIMEOUT } from '../constants.js';
import { appears, findScrolling, labelLine, labelOf } from '../helpers/elements.js';
import { longPress } from '../helpers/gestures.js';
import { byId, byIdAndLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** Home tab: the reminder list and the add button. */
class HomeScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.homeAddButton));
    }

    async waitForLaunch(): Promise<this> {
        return this.waitForDisplayed(TIMEOUT.launch);
    }

    async isEmptyStateShown(): Promise<boolean> {
        return appears($(byId(TestIds.homeEmpty)));
    }

    /** A reminder card, matched by the title its label starts with. */
    reminder(title: string) {
        return $(byIdAndLabel(TestIds.reminderCard, title));
    }

    async hasReminder(title: string): Promise<boolean> {
        return appears(await findScrolling(TestIds.reminderCard, title));
    }

    async waitForReminderGone(title: string): Promise<void> {
        await this.reminder(title).waitForDisplayed({
            reverse: true,
            timeoutMsg: `Reminder "${title}" is still on the home list`,
        });
    }

    /** Full merged label of a card, e.g. "Stretch\n8:00 AM · Today only". */
    async reminderDetails(title: string): Promise<string> {
        return labelOf(this.reminder(title));
    }

    /** Titles of every card on screen, top to bottom. */
    async visibleReminderTitles(): Promise<string[]> {
        const titles: string[] = [];
        for await (const card of $$(byId(TestIds.reminderCard))) {
            titles.push(await labelLine(card, 0));
        }
        return titles;
    }

    async openAddMenu(): Promise<void> {
        await this.trait.click();
        await ActionMenu.waitForEntry(TestIds.menuAddRoutine);
    }

    async startNewRoutine(): Promise<void> {
        await this.openAddMenu();
        await ActionMenu.choose(TestIds.menuAddRoutine);
    }

    async startNewStep(): Promise<void> {
        await this.openAddMenu();
        await ActionMenu.choose(TestIds.menuAddStep);
    }

    async openReminder(title: string): Promise<void> {
        await this.reminder(title).click();
    }

    async openActions(title: string): Promise<void> {
        await longPress(this.reminder(title));
        await ActionMenu.waitForEntry(TestIds.menuEdit);
    }

    async editReminder(title: string): Promise<void> {
        await this.openActions(title);
        await ActionMenu.choose(TestIds.menuEdit);
    }

    /** Label of the on/off entry in a card's menu: "Turn off" or "Turn on". */
    async toggleLabel(): Promise<string> {
        return ActionMenu.labelOf(TestIds.menuToggle);
    }

    async toggleReminder(title: string): Promise<void> {
        await this.openActions(title);
        await ActionMenu.choose(TestIds.menuToggle);
    }

    async deleteReminder(title: string, { confirm = true } = {}): Promise<void> {
        await this.openActions(title);
        await ActionMenu.choose(TestIds.menuDelete);
        if (confirm) await ConfirmDialog.confirm();
        else await ConfirmDialog.cancel();
    }
}

export default new HomeScreen();
