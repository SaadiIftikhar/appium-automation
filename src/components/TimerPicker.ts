import { labelLine } from '../helpers/elements.js';
import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';

export interface TimerLength {
    hours?: number;
    minutes?: number;
    seconds?: number;
}

const UNIT_IDS = {
    hours: TestIds.timerHours,
    minutes: TestIds.timerMinutes,
    seconds: TestIds.timerSeconds,
} as const;

/**
 * The collapsible "Step timer" row with Hours / Minutes / Seconds dropdowns.
 * Each dropdown opens a menu of two-digit values, "00" to "59".
 */
class TimerPicker {
    private get header() {
        return $(byId(TestIds.timerToggle));
    }

    /** Value shown on the collapsed row: "None" or a duration like "01:30". */
    async summary(): Promise<string> {
        return labelLine(this.header, 1);
    }

    async expand(): Promise<void> {
        if (!(await $(byId(TestIds.timerMinutes)).isDisplayed())) await this.header.click();
        await $(byId(TestIds.timerMinutes)).waitForDisplayed();
    }

    async set(length: TimerLength): Promise<void> {
        await this.expand();
        for (const unit of ['hours', 'minutes', 'seconds'] as const) {
            const value = length[unit];
            if (value) await this.pick(UNIT_IDS[unit], value);
        }
    }

    async clear(): Promise<void> {
        await $(byId(TestIds.timerClear)).click();
    }

    /**
     * Dropdown menu items belong to Flutter's DropdownButton, not the app, so
     * they carry no ids; each is labelled with its two-digit value.
     */
    private async pick(unitId: string, value: number): Promise<void> {
        await $(byId(unitId)).click();
        const item =
            'android=new UiScrollable(new UiSelector().scrollable(true))' +
            `.scrollIntoView(new UiSelector().description("${String(value).padStart(2, '0')}"))`;
        await $(item).click();
    }
}

export default new TimerPicker();
