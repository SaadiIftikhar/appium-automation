import type { RepeatPreset, Weekday } from '../components/DayPickerDialog.js';
import type { ClockTime } from '../components/TimePickerDialog.js';
import type { TimerLength } from '../components/TimerPicker.js';

export interface StepData {
    title: string;
    timer?: TimerLength;
}

export interface SingleStepReminder {
    kind: 'step';
    title: string;
    time?: ClockTime;
    repeat?: RepeatPreset | Weekday[];
    timer?: TimerLength;
}

export interface RoutineReminder {
    kind: 'routine';
    title: string;
    time?: ClockTime;
    repeat?: RepeatPreset | Weekday[];
    steps: StepData[];
}

/**
 * Short random suffix, so a reminder created by one test can never be
 * mistaken for another's, even when data clearing is turned off locally.
 */
function uid(): string {
    return Math.random().toString(36).slice(2, 6);
}

export function aStep(overrides: Partial<SingleStepReminder> = {}): SingleStepReminder {
    return { kind: 'step', title: `Drink water ${uid()}`, ...overrides };
}

export function aRoutine(overrides: Partial<RoutineReminder> = {}): RoutineReminder {
    return {
        kind: 'routine',
        title: `Morning routine ${uid()}`,
        steps: [{ title: 'Make bed' }, { title: 'Stretch' }, { title: 'Brush teeth' }],
        ...overrides,
    };
}
