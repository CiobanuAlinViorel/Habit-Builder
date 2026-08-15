import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import NewHabitForm from "./NewHabitForm";
import HabitCard from "./HabitCard";

export default async function HabitsPage() {
    const { userId } = await verifySession();

    const habits = await db.habit.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            title: true,
            streak: true,
            frequencyWindowDays: true,
            frequencyTarget: true,
            periodIndex: true,
            periodCompletions: true,
            lastCompletedAt: true,
        },
    });

    return (
        <main className="w-full flex-1 px-6 py-10 lg:px-10">
            <h1 className="text-2xl font-semibold text-foreground">Your habits</h1>
            <p className="mt-1 text-sm text-brand-slate">
                Add a habit, choose how often you want to do it, and check in to build
                your streak.
            </p>

            <div className="mt-6">
                <NewHabitForm />
            </div>

            {habits.length === 0 ? (
                <p className="mt-10 text-sm text-brand-slate">
                    No habits yet — add your first one above.
                </p>
            ) : (
                <ul className="mt-8 flex flex-col gap-3">
                    {habits.map((habit) => (
                        <HabitCard key={habit.id} habit={habit} />
                    ))}
                </ul>
            )}
        </main>
    );
}
