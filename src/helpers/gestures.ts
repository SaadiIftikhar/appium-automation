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

/** Swipes across the whole screen, away from the edges that trigger system gestures. */
export async function swipeScreen(direction: 'left' | 'right' | 'up' | 'down', percent = 0.8): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    await driver.execute('mobile: swipeGesture', {
        left: Math.round(width * 0.1),
        top: Math.round(height * 0.3),
        width: Math.round(width * 0.8),
        height: Math.round(height * 0.3),
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
