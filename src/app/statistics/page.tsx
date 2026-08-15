import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import { lastNDays, utcDateOnly } from "@/shared/lib/habitFrequency";

const DAYS_SHOWN = 14;

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });

export default async function StatisticsPage() {
    const { userId } = await verifySession();

    const days = lastNDays(DAYS_SHOWN);
    const rangeStart = days[0];

    const habits = await db.habit.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            title: true,
            completions: {
                where: { date: { gte: rangeStart } },
                select: { date: true },
            },
        },
    });

    const today = utcDateOnly(new Date()).getTime();

    return (
        <main className="w-full flex-1 px-6 py-10 lg:px-10">
            <h1 className="text-2xl font-semibold text-foreground">Statistics</h1>
            <p className="mt-1 text-sm text-brand-slate">
                Last {DAYS_SHOWN} days — a check mark means the habit was done that day.
            </p>

            {habits.length === 0 ? (
                <p className="mt-10 text-sm text-brand-slate">
                    No habits yet — add one on the Habits page to see it here.
                </p>
            ) : (
                <div className="mt-8 overflow-x-auto">
                    <table className="border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-background px-3 py-2 text-left align-bottom font-medium text-brand-slate">
                                    Habit
                                </th>
                                {days.map((day) => (
                                    <th
                                        key={day.getTime()}
                                        className={`w-12 px-2 py-2 text-center align-bottom font-medium text-brand-slate ${
                                            day.getTime() === today ? "text-brand-emerald" : ""
                                        }`}
                                    >
                                        <div className="text-[10px] uppercase">
                                            {weekdayFormatter.format(day)}
                                        </div>
                                        <div>{dayFormatter.format(day)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map((habit) => {
                                const completedDates = new Set(
                                    habit.completions.map((c) => c.date.getTime()),
                                );

                                return (
                                    <tr key={habit.id} className="border-t border-brand-slate/20">
                                        <td
                                            className="sticky left-0 max-w-64 truncate bg-background px-3 py-2 font-medium"
                                            title={habit.title}
                                        >
                                            {habit.title}
                                        </td>
                                        {days.map((day) => {
                                            const done = completedDates.has(day.getTime());
                                            return (
                                                <td
                                                    key={day.getTime()}
                                                    className={`w-12 px-2 py-2 text-center ${
                                                        day.getTime() === today
                                                            ? "bg-brand-emerald/5"
                                                            : ""
                                                    }`}
                                                >
                                                    {done && (
                                                        <span
                                                            aria-label="done"
                                                            className="text-brand-emerald"
                                                        >
                                                            ✓
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
