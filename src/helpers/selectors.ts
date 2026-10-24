/**
 * Selector builders for the Cadence Flutter app driven through UiAutomator2.
 *
 * Flutter does not create native Android views for its widgets. It publishes
 * an accessibility tree, and UiAutomator2 reads that:
 *   - `Semantics(identifier: ...)` arrives as the node's `resource-id`. The app
 *     tags every widget a test touches (see src/testIds.ts), so ids are the
 *     primary locator;
 *   - a widget's visible text arrives as `content-desc`. A tagged tile merges
 *     its texts into one, joined by newlines ("Stretch\n8:00 AM · Every day"),
 *     which is how repeated widgets sharing an id are told apart;
 *   - a text field is an `android.widget.EditText` with its value in `text`.
 *
 * UiSelector queries run on the device in one pass, rather than serialising
 * the whole tree as XPath does, so they are used throughout.
 *
 * Note the app's ids are bare ("home-add-button"), with no "package:id/"
 * prefix, so Appium's `id=` strategy does not match them; `resourceId()` does.
 */

function quote(value: string): string {
    return JSON.stringify(value);
}

const uiSelector = (body: string): string => `android=new UiSelector()${body}`;

/** Widget tagged with automation id `id`. */
export const byId = (id: string): string => uiSelector(`.resourceId(${quote(id)})`);

/** One of several widgets sharing `id`, picked by the start of its label. */
export const byIdAndLabel = (id: string, labelStart: string): string =>
    uiSelector(`.resourceId(${quote(id)}).descriptionStartsWith(${quote(labelStart)})`);

/** One of several widgets sharing `id`, picked by its exact label. */
export const byIdAndExactLabel = (id: string, label: string): string =>
    uiSelector(`.resourceId(${quote(id)}).description(${quote(label)})`);

/** Scrolls the screen's scrollable until the widget is in view. */
export const scrollToId = (id: string, labelStart?: string): string =>
    'android=new UiScrollable(new UiSelector().scrollable(true))' +
    `.scrollIntoView(new UiSelector().resourceId(${quote(id)})` +
    (labelStart ? `.descriptionStartsWith(${quote(labelStart)}))` : ')');

/**
 * Exact accessibility label. Only for widgets the app does not own, such as
 * Flutter's built-in time picker and dropdown menu items.
 */
export const byLabel = (label: string): string => `~${label}`;

/** Button by its label, for framework dialogs without ids. */
export const button = (label: string): string =>
    uiSelector(`.className("android.widget.Button").description(${quote(label)})`);

/** Any text input, by position, for framework dialogs without ids. */
export const anyTextField = (index = 0): string =>
    uiSelector(`.className("android.widget.EditText").instance(${index})`);
