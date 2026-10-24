import { byId } from '../helpers/selectors.js';
import { TestIds } from '../testIds.js';

export type Tab = 'Home' | 'Calendar' | 'Settings';

const TAB_IDS: Record<Tab, string> = {
    Home: TestIds.navHome,
    Calendar: TestIds.navCalendar,
    Settings: TestIds.navSettings,
};

/** The three-tab bar at the bottom of the home shell. */
class BottomNav {
    async open(tab: Tab): Promise<void> {
        await $(byId(TAB_IDS[tab])).click();
    }
}

export default new BottomNav();
