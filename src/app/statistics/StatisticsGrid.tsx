"use client";

import { useEffect, useRef, useState } from "react";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const yearFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" });

/** UTC calendar year a day-bucket timestamp falls in. */
function yearOf(day: number): number {
    return new Date(day).getUTCFullYear();
}

// Kept in sync with the grid-template-columns below: day columns can shrink
// to DAY_COL_MIN, so this is how many we assume fit into whatever width we
// measure once the label column's fixed 1/3 share is set aside.
const DAY_COL_MIN = 44;
const MIN_DAYS_SHOWN = 5;
// Rendered before we can measure the container (first paint / no JS yet).
const FALLBACK_DAYS_SHOWN = 14;

export type StatisticsHabit = {
    id: string;
    title: string;
    /** Completion day-buckets, as epoch ms (see utcDateOnly). */
    completedDates: number[];
};

type Props = {
    habits: StatisticsHabit[];
    /** All fetched day-buckets, oldest first, as epoch ms. */
    days: number[];
    today: number;
};

/**
 * Renders the habit x day grid so it always fills the available width: the
 * habit-title column always takes up a third of it, the day columns share
 * the remaining two thirds evenly, and — since a wider screen has more room
 * for them — we show more days rather than leaving space unused. Days beyond
 * what's measured to fit are simply left off the (already-fetched) end of
 * `days`.
 */
export default function StatisticsGrid({ habits, days, today }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(() => Math.min(FALLBACK_DAYS_SHOWN, days.length));

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        function computeFromWidth(width: number) {
            // The label column reserves a third of the width, so the day
            // columns split the other two thirds.
            const available = (width * 2) / 3;
            const fit = Math.floor(available / DAY_COL_MIN);
            setVisibleCount(Math.max(MIN_DAYS_SHOWN, Math.min(days.length, fit)));
        }

        computeFromWidth(el.clientWidth);

        const observer = new ResizeObserver(([entry]) => {
            if (entry) computeFromWidth(entry.contentRect.width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [days.length]);

    const visibleDays = days.slice(days.length - visibleCount);
    // Weighting the label column at N/2 fr against N day columns of 1fr each
    // keeps it at exactly a third of the row's flexible width, however many
    // day columns end up visible.
    const labelWeight = visibleDays.length / 2;

    return (
        <div className="mt-8 w-full rounded-xl border border-white/20 p-4 text-white shadow-sm sm:p-6">
            <div ref={containerRef} className="w-full overflow-hidden">
                <div
                    className="grid text-sm"
                    style={{
                        gridTemplateColumns: `minmax(140px, ${labelWeight}fr) repeat(${visibleDays.length}, minmax(${DAY_COL_MIN}px, 1fr))`,
                    }}
                >
                    <div />
                    {visibleDays.map((day, index) => {
                        const isYearStart = index === 0 || yearOf(day) !== yearOf(visibleDays[index - 1]);
                        return (
                            <div
                                key={day}
                                className="overflow-visible whitespace-nowrap px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-white/60"
                            >
                                {isYearStart && yearFormatter.format(day)}
                            </div>
                        );
                    })}

                    <div className="px-3 pb-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-white/70">
                        Habit
                    </div>
                    {visibleDays.map((day) => (
                        <div
                            key={day}
                            className={`px-1 pb-3 text-center align-bottom font-medium text-white/70 ${day === today ? "text-brand-emerald" : ""
                                }`}
                        >
                            <div className="text-[10px] uppercase tracking-wide">
                                {weekdayFormatter.format(day)}
                            </div>
                            <div className="mt-0.5 text-base font-semibold text-white">
                                {dayFormatter.format(day)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-white/60">
                                {monthFormatter.format(day)}
                            </div>
                        </div>
                    ))}

                    {habits.map((habit, index) => {
                        const completed = new Set(habit.completedDates);
                        const zebra = index % 2 === 1 ? "bg-white/5" : "";

                        return (
                            <div key={habit.id} className="group contents">
                                <div
                                    className={`truncate border-t border-white/15 px-3 py-4 text-base font-semibold text-white transition-colors group-hover:bg-white/10 ${zebra}`}
                                    title={habit.title}
                                >
                                    {habit.title}
                                </div>
                                {visibleDays.map((day) => {
                                    const done = completed.has(day);
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center justify-center border-t border-white/15 py-4 transition-colors group-hover:bg-white/10 ${day === today ? "bg-brand-emerald/10" : zebra
                                                }`}
                                        >
                                            {done ? (
                                                <span
                                                    aria-label="done"
                                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-emerald/20 text-sm font-semibold text-brand-mint"
                                                >
                                                    ✓
                                                </span>
                                            ) : (
                                                <span
                                                    aria-hidden="true"
                                                    className="h-7 w-7 rounded-full border border-white/25"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
