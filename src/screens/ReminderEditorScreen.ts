import DayPickerDialog, { type RepeatPreset, type Weekday } from '../components/DayPickerDialog.js';
import TimePickerDialog, { type ClockTime } from '../components/TimePickerDialog.js';
import TimerPicker, { type TimerLength } from '../components/TimerPicker.js';
import { appears, attributeIsTrue, findScrolling, labelLine } from '../helpers/elements.js';
import { hideKeyboard } from '../helpers/gestures.js';
import { byId, byIdAndLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

export type EditorTitle = 'New step' | 'Edit step' | 'New routine' | 'Edit routine';

const SWITCH_IDS = {
    Notifications: TestIds.editorNotifications,
    Alarm: TestIds.editorAlarm,
    'Add image': TestIds.editorAddImage,
} as const;
export type EditorSwitch = keyof typeof SWITCH_IDS;

/**
 * Create / edit form for both kinds of reminder: a single step (title,
 * optional timer) and a routine (name plus an ordered list of steps).
 */
class ReminderEditorScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.editorSave));
    }

    private get titleField() {
        return $(byId(TestIds.editorTitleField));
    }

    /** The app bar title. It is plain text, so it is matched by label. */
    async waitForTitle(title: EditorTitle): Promise<void> {
        await this.waitForDisplayed();
        await $(`~${title}`).waitForDisplayed({ timeoutMsg: `Editor "${title}" did not open` });
    }

    /** Whether the editor is still open, e.g. after a rejected save. */
    async isOpen(): Promise<boolean> {
        return appears(this.trait, 2_000);
    }

    /**
     * First-run hints ("Tap the icon to change it", ...) each carry a dismiss
     * button. They push the form down, so specs clear them first.
     */
    async dismissHints(): Promise<void> {
        for (let i = 0; i < 2; i++) {
            const hints = await $$(byId(TestIds.hintDismiss));
            if (hints.length === 0) return;
            await hints[0].click();
        }
    }

    async enterTitle(title: string): Promise<void> {
        await this.typeInto(this.titleField, title);
        await hideKeyboard();
    }

    async currentTitle(): Promise<string> {
        return (await this.titleField.getText()) ?? '';
    }

    async chooseIcon(): Promise<void> {
        await $(byId(TestIds.editorIcon)).click();
    }

    async setTime(time?: ClockTime): Promise<void> {
        await $(byId(TestIds.editorTime)).click();
        if (time) await TimePickerDialog.set(time);
        else await TimePickerDialog.accept();
    }

    /** Value on the Time row: "Set time" until one is picked, then e.g. "8:00 AM". */
    async timeValue(): Promise<string> {
        return labelLine($(byId(TestIds.editorTime)), 1);
    }

    async setRepeat(choice: RepeatPreset | Weekday[]): Promise<void> {
        await $(byId(TestIds.editorRepeat)).click();
        await DayPickerDialog.waitForDisplayed();
        if (Array.isArray(choice)) {
            for (const day of choice) await DayPickerDialog.toggleDay(day);
        } else {
            await DayPickerDialog.choosePreset(choice);
        }
        await DayPickerDialog.confirm();
    }

    async repeatValue(): Promise<string> {
        return labelLine($(byId(TestIds.editorRepeat)), 1);
    }

    async setTimer(length: TimerLength): Promise<void> {
        await TimerPicker.set(length);
    }

    async timerValue(): Promise<string> {
        return TimerPicker.summary();
    }

    /** Toggles a switch by tapping its row, the way a user would. */
    async toggle(name: EditorSwitch): Promise<void> {
        await (await findScrolling(SWITCH_IDS[name])).click();
    }

    async isSwitchOn(name: EditorSwitch): Promise<boolean> {
        return attributeIsTrue(await findScrolling(SWITCH_IDS[name]), 'checked');
    }

    // Routine-only ----------------------------------------------------------

    async tapAddStep(): Promise<void> {
        await (await findScrolling(TestIds.editorAddStep)).click();
    }

    async hasNoStepsMessage(): Promise<boolean> {
        return appears(await findScrolling(TestIds.editorNoSteps));
    }

    /** A step row in the routine being edited, matched by its title. */
    step(title: string) {
        return $(byIdAndLabel(TestIds.editorStepRow, title));
    }

    async openStep(title: string): Promise<void> {
        await (await findScrolling(TestIds.editorStepRow, title)).click();
    }

    async stepCount(): Promise<number> {
        return $$(byId(TestIds.editorStepRow)).length;
    }

    // ----------------------------------------------------------------------

    async save(): Promise<void> {
        await this.trait.click();
    }
}

export default new ReminderEditorScreen();
