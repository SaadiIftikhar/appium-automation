import { appears, labelOf } from '../helpers/elements.js';
import { byId, byIdAndLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** Month grid; the list under it shows reminders repeating on the chosen day. */
class CalendarScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.calendarSelectedDay));
    }

    /** The heading over the day's list, e.g. "Sunday, 18 October". */
    async selectedDay(): Promise<string> {
        return labelOf(this.trait);
    }

    async isNothingScheduled(): Promise<boolean> {
        return appears($(byId(TestIds.calendarEmpty)));
    }

    async hasReminder(title: string): Promise<boolean> {
        return $(byIdAndLabel(TestIds.calendarReminder, title)).isExisting();
    }
}

export default new CalendarScreen();
