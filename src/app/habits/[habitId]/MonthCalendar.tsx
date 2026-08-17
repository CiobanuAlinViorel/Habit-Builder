import { monthWeeks, WEEKDAY_LABELS } from "@/shared/lib/habitFrequency";

export default function MonthCalendar({
    year,
    month,
    completedDates,
    habitCreatedAt,
    today,
}: {
    year: number;
    month: number;
    /** Epoch ms of every completed day bucket. */
    completedDates: Set<number>;
    /** Day bucket the habit was created on (days before this are outside the tracked range). */
    habitCreatedAt: Date;
    /** Today's day bucket (days after this haven't happened yet). */
    today: Date;
}) {
    const weeks = monthWeeks(year, month);

    return (
        <div className="w-full max-w-72 rounded-lg border border-white/20 p-4 bg-white sm:w-72 sm:max-w-none sm:shrink-0">
            <table className="w-full border-separate border-spacing-1 text-center text-xs">
                <thead>
                    <tr>
                        {WEEKDAY_LABELS.map((day) => (
                            <th key={day} className="font-normal text-blue-950/60">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                            {week.map((day, dayIndex) => {
                                if (!day) {
                                    return <td key={dayIndex} />;
                                }

                                const time = day.getTime();
                                const outOfRange = time < habitCreatedAt.getTime() || time > today.getTime();
                                const done = completedDates.has(time);

                                return (
                                    <td key={dayIndex} className="p-0">
                                        <div
                                            title={day.toISOString().slice(0, 10)}
                                            className={`mx-auto flex aspect-square w-full max-w-8 items-center justify-center rounded ${outOfRange
                                                ? "text-blue-950/90"
                                                : done
                                                    ? "bg-brand-emerald text-brand-navy-dark font-bold"
                                                    : "border border-white/25 text-blue-800/70"}`}
                                        >
                                            {day.getUTCDate()}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
