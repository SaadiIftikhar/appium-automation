import type { ChainablePromiseElement } from 'webdriverio';
import { byId, byIdAndLabel, scrollToId } from './selectors.js';

/** A single `$()` result or one item of a `$$()` list. */
type Element = ChainablePromiseElement | WebdriverIO.Element;

/** A node's merged label (its `content-desc`), or '' when it has none. */
export async function labelOf(element: Element): Promise<string> {
    const el = await element;
    return (await el.getAttribute('content-desc')) ?? '';
}

/** One line of a merged label: line 0 is the title, line 1 the value, ... */
export async function labelLine(element: Element, line: number): Promise<string> {
    return (await labelOf(element)).split('\n')[line] ?? '';
}

/** UiAutomator2 reports booleans as the strings "true" / "false". */
export async function attributeIsTrue(element: Element, name: 'checked' | 'clickable' | 'enabled'): Promise<boolean> {
    const el = await element;
    return (await el.getAttribute(name)) === 'true';
}

/** Whether the element is on screen within `timeout`, without throwing. */
export async function appears(element: Element, timeout?: number): Promise<boolean> {
    try {
        const el = await element;
        await el.waitForDisplayed({ timeout });
        return true;
    } catch {
        return false;
    }
}

/**
 * Finds a widget that may be below the fold. Looks on screen first, then
 * scrolls. Flutter only marks a list scrollable when its content overflows,
 * so a scroll-only lookup fails on a short list where nothing needs scrolling.
 */
export async function findScrolling(id: string, labelStart?: string): Promise<WebdriverIO.Element> {
    const direct = $(labelStart ? byIdAndLabel(id, labelStart) : byId(id));
    if (await appears(direct, 1_500)) return direct.getElement();
    return $(scrollToId(id, labelStart)).getElement();
}

/**
 * Whether the element stays on screen for the whole of `ms`, checked every
 * 250 ms. For asserting that something does *not* go away, such as a form
 * that should refuse to close.
 */
export async function staysDisplayed(element: Element, ms: number): Promise<boolean> {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
        const el = await element;
        if (!(await el.isDisplayed())) return false;
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return true;
}
