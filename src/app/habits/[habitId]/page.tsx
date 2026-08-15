import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import { formatFrequency, monthsBetween, utcDateOnly } from "@/shared/lib/habitFrequency";
import MonthCalendar from "./MonthCalendar";

const monthYearFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function HabitDetailPage(props: PageProps<"/habits/[habitId]">) {
    const { habitId } = await props.params;
    const { userId } = await verifySession();

    const habit = await db.habit.findFirst({
        where: { id: habitId, userId },
        include: {
            completions: { select: { date: true }, orderBy: { date: "asc" } },
        },
    });

    if (!habit) {
        notFound();
    }

    const completedDates = new Set(habit.completions.map((c) => c.date.getTime()));
    const today = new Date();
    const months = monthsBetween(habit.createdAt, today).reverse(); // newest month first

    return (
        <main className="w-full flex-1 px-6 py-10 lg:px-10">
            <Link href="/habits" className="text-sm text-brand-slate hover:underline">
                ← Back to habits
            </Link>

            <h1 className="mt-3 text-2xl font-semibold text-foreground">{habit.title}</h1>
            <p className="mt-1 text-sm text-brand-slate">
                {formatFrequency(habit.frequencyWindowDays, habit.frequencyTarget)} · tracking
                since {dateFormatter.format(habit.createdAt)}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:max-w-xl">
                <div className="rounded-lg border border-brand-slate/30 p-4">
                    <dt className="text-sm text-brand-slate">Current streak</dt>
                    <dd className="mt-1 text-xl font-semibold">{habit.streak}</dd>
                </div>
                <div className="rounded-lg border border-brand-slate/30 p-4">
                    <dt className="text-sm text-brand-slate">Days active</dt>
                    <dd className="mt-1 text-xl font-semibold">{habit.completions.length}</dd>
                </div>
                <div className="rounded-lg border border-brand-slate/30 p-4">
                    <dt className="text-sm text-brand-slate">Tracking since</dt>
                    <dd className="mt-1 text-xl font-semibold">
                        {dateFormatter.format(habit.createdAt)}
                    </dd>
                </div>
            </dl>

            <h2 className="mt-10 text-lg font-semibold text-foreground">History</h2>
            <p className="mt-1 text-sm text-brand-slate">
                Every day this habit was active — filled days were done, empty days weren&apos;t.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {months.map(({ year, month }) => (
                    <MonthCalendar
                        key={`${year}-${month}`}
                        year={year}
                        month={month}
                        label={monthYearFormatter.format(new Date(Date.UTC(year, month, 1)))}
                        completedDates={completedDates}
                        habitCreatedAt={utcDateOnly(habit.createdAt)}
                        today={utcDateOnly(today)}
                    />
                ))}
            </div>
        </main>
    );
}
