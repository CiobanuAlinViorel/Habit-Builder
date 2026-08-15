import { monthWeeks, WEEKDAY_LABELS } from "@/shared/lib/habitFrequency";

export default function MonthCalendar({
    year,
    month,
    label,
    completedDates,
    habitCreatedAt,
    today,
}: {
    year: number;
    month: number;
    label: string;
    /** Epoch ms of every completed day bucket. */
    completedDates: Set<number>;
    /** Day bucket the habit was created on (days before this are outside the tracked range). */
    habitCreatedAt: Date;
    /** Today's day bucket (days after this haven't happened yet). */
    today: Date;
}) {
    const weeks = monthWeeks(year, month);

    return (
        <div className="rounded-lg border border-brand-slate/30 p-4">
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
            <table className="mt-3 w-full border-separate border-spacing-1 text-center text-xs">
                <thead>
                    <tr>
                        {WEEKDAY_LABELS.map((day) => (
                            <th key={day} className="font-normal text-brand-slate">
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
                                            className={`flex h-6 w-6 items-center justify-center rounded ${
                                                outOfRange
                                                    ? "text-brand-slate/30"
                                                    : done
                                                      ? "bg-brand-emerald text-brand-navy-dark font-semibold"
                                                      : "border border-brand-slate/30 text-brand-slate"
                                            }`}
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
