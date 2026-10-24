import { TIMEOUT } from '../constants.js';
import { pressBack } from '../helpers/gestures.js';

type Element = ReturnType<typeof $>;

/**
 * Behaviour every screen shares. A screen object exposes what a user can
 * see and do there, never raw selectors, so specs read as user journeys and
 * a UI change is fixed in one place.
 */
export abstract class BaseScreen {
    /** Element whose presence proves this screen is showing. */
    protected abstract get trait(): Element;

    async waitForDisplayed(timeout: number = TIMEOUT.short): Promise<this> {
        await this.trait.waitForDisplayed({
            timeout,
            timeoutMsg: `${this.constructor.name} did not appear within ${timeout} ms`,
        });
        return this;
    }

    async isDisplayed(): Promise<boolean> {
        return this.trait.isDisplayed();
    }

    async goBack(): Promise<void> {
        await pressBack();
    }

    /** Clears a field and types into it. Flutter fields need a tap to focus first. */
    protected async typeInto(field: Element, value: string): Promise<void> {
        await field.click();
        await field.clearValue();
        await field.setValue(value);
    }
}
