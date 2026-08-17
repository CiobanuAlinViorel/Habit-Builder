import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import { lastNDays, MAX_WINDOW_DAYS, utcDateOnly } from "@/shared/lib/habitFrequency";
import StatisticsGrid from "./StatisticsGrid";

// Fetch enough history to fill even a very wide screen; StatisticsGrid
// decides at render time how many of these (most recent) days actually fit.
const MAX_DAYS_FETCHED = MAX_WINDOW_DAYS;

export default async function StatisticsPage() {
    const { userId } = await verifySession();

    const days = lastNDays(MAX_DAYS_FETCHED);
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
        <main className="w-full flex-1 px-6 py-2 bg-blue-700 text-white lg:px-10">

            {habits.length === 0 ? (
                <p className="mt-10 text-sm text-white/70">
                    No habits yet — add one on the Habits page to see it here.
                </p>
            ) : (
                <StatisticsGrid
                    habits={habits.map((habit) => ({
                        id: habit.id,
                        title: habit.title,
                        completedDates: habit.completions.map((c) => c.date.getTime()),
                    }))}
                    days={days.map((day) => day.getTime())}
                    today={today}
                />
            )}
        </main>
    );
}
