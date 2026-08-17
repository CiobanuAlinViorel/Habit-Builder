import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import ClientComponent from "./ClientComponent";
import { convertHabit } from "@/shared/lib/habitConverter";

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


        <main className="w-full flex-1 px-6 py-4 lg:px-10 bg-blue-700">
            <ClientComponent habits={convertHabit(habits)} />
        </main>
    );
}
