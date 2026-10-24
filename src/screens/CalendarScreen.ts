import { byId, byIdAndLabel } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';
import { BaseScreen } from './BaseScreen.js';

/** Month grid; the list under it shows reminders repeating on the chosen day. */
class CalendarScreen extends BaseScreen {
    protected get trait() {
        return $(byId(TestIds.calendarSelectedDay));
    }

    /** "Nothing scheduled", shown when no reminder repeats on the chosen day. */
    get emptyState() {
        return $(byId(TestIds.calendarEmpty));
    }

    /** A reminder in the chosen day's list, matched by its title. */
    reminder(title: string) {
        return $(byIdAndLabel(TestIds.calendarReminder, title));
    }
}

export default new CalendarScreen();
