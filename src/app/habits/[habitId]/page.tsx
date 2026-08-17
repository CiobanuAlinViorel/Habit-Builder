import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import { formatFrequency, monthsBetween, utcDateOnly } from "@/shared/lib/habitFrequency";
import MonthCalendar from "./MonthCalendar";
import { ArrowLeft } from "lucide-react";

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
        <main className="w-full flex-1 px-6 py-2 bg-blue-500 text-white lg:px-10">
            <Link href="/habits" className="text-sm text-white/70 hover:text-white hover:underline flex justify-left items-center">

                <ArrowLeft className="w-5 h-5" />
                Back to the habits page
            </Link>

            <h1 className="mt-3 text-2xl font-semibold text-white">{habit.title}</h1>
            <p className="mt-1 text-sm text-white/70">
                {formatFrequency(habit.frequencyWindowDays, habit.frequencyTarget)} · tracking
                since {dateFormatter.format(habit.createdAt)}
            </p>

            <div className="mt-6 grid grid-cols-1 justify-items-center gap-6 sm:flex sm:flex-wrap sm:justify-center">
                {months.map(({ year, month }) => (
                    <MonthCalendar
                        key={`${year}-${month}`}
                        year={year}
                        month={month}
                        completedDates={completedDates}
                        habitCreatedAt={utcDateOnly(habit.createdAt)}
                        today={utcDateOnly(today)}
                    />
                ))}
            </div>
        </main>
    );
}
