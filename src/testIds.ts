/**
 * Automation ids exposed by the Cadence app.
 *
 * Mirrors lib/testing/test_ids.dart in the app repo. The app tags widgets
 * with `Semantics(identifier: ...)`, which Android reports as the node's
 * `resource-id`. Ids name what a widget is; repeated widgets (a card per
 * reminder, a row per step) share an id and are told apart by their label.
 */
export const TestIds = {
    // Onboarding
    onboardingSkip: 'onboarding-skip',
    onboardingTitle: 'onboarding-title',
    /** Continue on the first pages, Allow notifications on the last. */
    onboardingPrimary: 'onboarding-primary',
    onboardingNotNow: 'onboarding-not-now',
    onboardingDot: (page: number) => `onboarding-dot-${page}`,

    // Home shell
    homeAddButton: 'home-add-button',
    homeEmpty: 'home-empty',
    reminderCard: 'reminder-card',
    navHome: 'nav-home',
    navCalendar: 'nav-calendar',
    navSettings: 'nav-settings',

    // Anchored menus
    menuAddRoutine: 'menu-add-routine',
    menuAddStep: 'menu-add-step',
    menuEdit: 'menu-edit',
    menuToggle: 'menu-toggle',
    menuDelete: 'menu-delete',

    // Confirmation dialogs (delete, mark done, reset)
    dialogCancel: 'dialog-cancel',
    dialogConfirm: 'dialog-confirm',

    // Reminder editor
    editorSave: 'editor-save',
    editorTitleField: 'editor-title-field',
    editorIcon: 'editor-icon',
    editorTime: 'editor-time',
    editorRepeat: 'editor-repeat',
    editorNotifications: 'editor-notifications',
    editorAlarm: 'editor-alarm',
    editorAddImage: 'editor-add-image',
    editorAddStep: 'editor-add-step',
    editorNoSteps: 'editor-no-steps',
    editorStepRow: 'editor-step-row',
    editorStepIcon: 'editor-step-icon',
    hintDismiss: 'hint-dismiss',

    // Step timer picker
    timerToggle: 'timer-toggle',
    timerHours: 'timer-hours',
    timerMinutes: 'timer-minutes',
    timerSeconds: 'timer-seconds',
    timerClear: 'timer-clear',

    // Repeat dialog
    repeatSummary: 'repeat-summary',
    repeatOk: 'repeat-ok',
    repeatCancel: 'repeat-cancel',
    repeatDay: (day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => `repeat-day-${day}`,
    repeatPreset: (preset: 'every-day' | 'weekdays' | 'weekend') => `repeat-preset-${preset}`,

    // Step editor
    stepEditorSave: 'step-editor-save',
    stepEditorDelete: 'step-editor-delete',
    stepEditorTitleField: 'step-editor-title-field',

    // Icon picker
    iconSearchField: 'icon-search-field',
    iconSearchClear: 'icon-search-clear',
    iconCell: 'icon-cell',
    iconEmpty: 'icon-empty',

    // Routine checklist
    routineProgress: 'routine-progress',
    routineStepRow: 'routine-step-row',
    routineReset: 'routine-reset',
    routineDone: 'routine-done',

    // Running a step
    stepTitle: 'step-title',
    stepDone: 'step-done',
    stepReset: 'step-reset',
    timerStartPause: 'timer-start-pause',
    timerRestart: 'timer-restart',
    timerRemaining: 'timer-remaining',

    // Calendar
    calendarEmpty: 'calendar-empty',
    calendarReminder: 'calendar-reminder',
    calendarSelectedDay: 'calendar-selected-day',

    // Settings
    settingsPermissions: 'settings-permissions',
    settingsExport: 'settings-export',
    settingsImport: 'settings-import',
    settingsAbout: 'settings-about',
} as const;
