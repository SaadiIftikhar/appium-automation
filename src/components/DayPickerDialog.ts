import { labelOf } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';

export type RepeatPreset = 'Every day' | 'Weekdays' | 'Weekend';
export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

const PRESET_IDS = {
    'Every day': TestIds.repeatPreset('every-day'),
    Weekdays: TestIds.repeatPreset('weekdays'),
    Weekend: TestIds.repeatPreset('weekend'),
} as const;

/** The "Repeat on" dialog: seven day chips, three presets, Cancel / OK. */
class DayPickerDialog {
    async waitForDisplayed(): Promise<void> {
        await $(byId(TestIds.repeatOk)).waitForDisplayed({ timeoutMsg: 'Repeat dialog did not open' });
    }

    async choosePreset(preset: RepeatPreset): Promise<void> {
        await $(byId(PRESET_IDS[preset])).click();
    }

    async toggleDay(day: Weekday): Promise<void> {
        const id = TestIds.repeatDay(day.toLowerCase() as Lowercase<Weekday>);
        await $(byId(id)).click();
    }

    /** The line under the chips describing the selection, e.g. "Mon, Wed". */
    async summary(): Promise<string> {
        return labelOf($(byId(TestIds.repeatSummary)));
    }

    async confirm(): Promise<void> {
        await $(byId(TestIds.repeatOk)).click();
    }

    async cancel(): Promise<void> {
        await $(byId(TestIds.repeatCancel)).click();
    }
}

export default new DayPickerDialog();
