/**
 * Habit frequency is modeled as "complete `target` times every `windowDays`
 * days". That single shape covers every case we need:
 *
 *   Daily              -> windowDays: 1, target: 1
 *   Weekly             -> windowDays: 7, target: 1
 *   Every 3 days       -> windowDays: 3, target: 1
 *   4 days a week      -> windowDays: 7, target: 4
 *
 * Time is bucketed into fixed-size periods of `windowDays` days, anchored to
 * a fixed Monday (ANCHOR_DATE) so that windowDays: 7 lines up with normal
 * Mon-Sun calendar weeks. A habit can be checked in at most `target` times
 * within its current period, and at most once per calendar day regardless
 * of target, so mashing the check-in button can't outrun the frequency.
 *
 * "Calendar day" throughout this module means the server's *local* day
 * (see dayBucketStart), not the UTC day -- see its comment for why.
 *
 * This is a pure, stateless module (no DB access) so it can be shared by
 * server actions and by page components that just need to render progress.
 */

export type FrequencyPreset = {
    label: string;
    shortLabel: string;
    windowDays: number;
    target: number;
};

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
    { label: "Daily", shortLabel: "Daily", windowDays: 1, target: 1 },
    { label: "Every 2 days", shortLabel: "Every 2 days", windowDays: 2, target: 1 },
    { label: "Every 3 days", shortLabel: "Every 3 days", windowDays: 3, target: 1 },
    { label: "Weekly", shortLabel: "Weekly", windowDays: 7, target: 1 },
    { label: "2 days a week", shortLabel: "2x / week", windowDays: 7, target: 2 },
    { label: "3 days a week", shortLabel: "3x / week", windowDays: 7, target: 3 },
    { label: "4 days a week", shortLabel: "4x / week", windowDays: 7, target: 4 },
    { label: "5 days a week", shortLabel: "5x / week", windowDays: 7, target: 5 },
];

export const MIN_WINDOW_DAYS = 1;
export const MAX_WINDOW_DAYS = 90;

// A known Monday, used purely as a fixed reference point so weekly buckets
// (windowDays a multiple of 7) line up with real Mon-Sun weeks.
const ANCHOR_DATE = Date.UTC(2024, 0, 1);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// "Today" means the server's *local* calendar day, not the UTC day. If we
// bucketed by UTC, then for any timezone ahead of UTC (e.g. Europe/Bucharest,
// UTC+3), a check-in made in the first few hours after local midnight would
// still land in *yesterday's* UTC bucket -- the exact "I checked in today
// but it's not there" bug. We still build the bucket boundary with
// Date.UTC(...) (using the local Y/M/D), not `new Date(y, m, d)`, so the
// resulting instant is timezone-independent from here on out -- that's what
// keeps it a stable, unambiguous value to store and compare against.
function dayBucketStart(date: Date): number {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** `date`, normalized to the start of its local calendar day. This is the day bucket completions are stored under. */
export function utcDateOnly(date: Date): Date {
    return new Date(dayBucketStart(date));
}

function daySinceAnchor(date: Date): number {
    return Math.floor((dayBucketStart(date) - ANCHOR_DATE) / MS_PER_DAY);
}

/** The last `count` local calendar days as day-bucket dates, oldest first, ending on `end` (default today). */
export function lastNDays(count: number, end: Date = new Date()): Date[] {
    const endBucket = dayBucketStart(end);
    return Array.from(
        { length: count },
        (_, i) => new Date(endBucket - (count - 1 - i) * MS_PER_DAY),
    );
}

/** Which fixed-size bucket of `windowDays` days `date` falls into. */
export function periodIndexForDate(date: Date, windowDays: number): number {
    return Math.floor(daySinceAnchor(date) / windowDays);
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
    return dayBucketStart(a) === dayBucketStart(b);
}

export type HabitFrequencyState = {
    frequencyWindowDays: number;
    frequencyTarget: number;
    periodIndex: number | null;
    periodCompletions: number;
    lastCompletedAt: Date | null;
};

export type CheckInEligibility =
    | { allowed: true }
    | { allowed: false; reason: "already-done-today" }
    | { allowed: false; reason: "target-met"; completions: number; target: number };

/**
 * Pure check: given a habit's stored frequency state, can it be checked in
 * "now"? Doesn't touch the DB — safe to call from a Server Component just to
 * render button state, and re-checked authoritatively inside the action
 * that actually performs the check-in.
 */
export function getCheckInEligibility(
    habit: HabitFrequencyState,
    now: Date = new Date(),
): CheckInEligibility {
    if (habit.lastCompletedAt && isSameCalendarDay(habit.lastCompletedAt, now)) {
        return { allowed: false, reason: "already-done-today" };
    }

    const currentPeriod = periodIndexForDate(now, habit.frequencyWindowDays);
    const completionsThisPeriod =
        habit.periodIndex === currentPeriod ? habit.periodCompletions : 0;

    if (completionsThisPeriod >= habit.frequencyTarget) {
        return {
            allowed: false,
            reason: "target-met",
            completions: completionsThisPeriod,
            target: habit.frequencyTarget,
        };
    }

    return { allowed: true };
}

/** How many completions have landed in the *current* period (for progress UI). */
export function completionsInCurrentPeriod(
    habit: HabitFrequencyState,
    now: Date = new Date(),
): number {
    const currentPeriod = periodIndexForDate(now, habit.frequencyWindowDays);
    return habit.periodIndex === currentPeriod ? habit.periodCompletions : 0;
}

/** A single day-bucket date for local year/month(0-indexed)/day, comparable with utcDateOnly's output. */
export function dayBucket(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day));
}

function daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * `month` (0-indexed) laid out as Monday-start weeks, padded with `null` so
 * every week has exactly 7 slots -- ready to render as a calendar grid.
 */
export function monthWeeks(year: number, month: number): (Date | null)[][] {
    const numDays = daysInMonth(year, month);
    // getUTCDay(): 0=Sun..6=Sat -> shift so Monday is 0.
    const firstWeekday = (dayBucket(year, month, 1).getUTCDay() + 6) % 7;

    const cells: (Date | null)[] = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: numDays }, (_, i) => dayBucket(year, month, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

/** Every (year, month) pair from `start` to `end`, inclusive, in local calendar terms. */
export function monthsBetween(
    start: Date,
    end: Date,
): { year: number; month: number }[] {
    const months: { year: number; month: number }[] = [];
    let y = start.getFullYear();
    let m = start.getMonth();
    const endY = end.getFullYear();
    const endM = end.getMonth();

    while (y < endY || (y === endY && m <= endM)) {
        months.push({ year: y, month: m });
        m += 1;
        if (m > 11) {
            m = 0;
            y += 1;
        }
    }
    return months;
}

export function formatFrequency(windowDays: number, target: number): string {
    const preset = FREQUENCY_PRESETS.find(
        (p) => p.windowDays === windowDays && p.target === target,
    );
    if (preset) return preset.shortLabel;
    if (target === 1) return `Every ${windowDays} days`;
    return `${target}x / ${windowDays} days`;
}
