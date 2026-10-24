import { anyTextField, button, byLabel } from '../helpers/selectors.js';

export interface ClockTime {
    /** 1-12 */
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
}

/**
 * Flutter's Material time picker. It is framework UI, not the app's, so it
 * has no test ids and is driven by its accessibility labels. The dial is
 * awkward to drive by touch, so times go in through its keyboard mode.
 */
class TimePickerDialog {
    async waitForDisplayed(): Promise<void> {
        await $(button('OK')).waitForDisplayed({ timeoutMsg: 'Time picker did not open' });
    }

    /** Keeps the suggested time (8:00 AM for a new reminder). */
    async accept(): Promise<void> {
        await this.waitForDisplayed();
        await $(button('OK')).click();
    }

    async cancel(): Promise<void> {
        await $(button('Cancel')).click();
    }

    async set({ hour, minute, period }: ClockTime): Promise<void> {
        await this.waitForDisplayed();
        await $(byLabel('Switch to text input mode')).click();

        const hourField = $(anyTextField(0));
        await hourField.waitForDisplayed();
        await hourField.click();
        await hourField.setValue(String(hour));

        const minuteField = $(anyTextField(1));
        await minuteField.click();
        await minuteField.setValue(String(minute).padStart(2, '0'));

        await $(byLabel(period)).click();
        await $(button('OK')).click();
    }
}

export default new TimePickerDialog();
