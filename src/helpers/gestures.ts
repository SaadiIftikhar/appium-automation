import type { ChainablePromiseElement } from 'webdriverio';

type Element = ChainablePromiseElement | WebdriverIO.Element;

/**
 * Touch gestures through UiAutomator2's native `mobile:` commands. These run
 * on the device in one call, which is steadier on Flutter than W3C pointer
 * actions assembled step by step from the client.
 */
export async function longPress(element: Element, durationMs = 800): Promise<void> {
    const el = await element;
    await driver.execute('mobile: longClickGesture', {
        elementId: el.elementId,
        duration: durationMs,
    });
}

export async function swipe(element: Element, direction: 'left' | 'right' | 'up' | 'down', percent = 0.75): Promise<void> {
    const el = await element;
    await driver.execute('mobile: swipeGesture', {
        elementId: el.elementId,
        direction,
        percent,
    });
}

export async function pressBack(): Promise<void> {
    await driver.execute('mobile: pressKey', { keycode: 4 });
}

export async function hideKeyboard(): Promise<void> {
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
}
