import { ClientHabit } from "@/app/habits/types";
import { Habit } from "../types/Habit";

export function convertHabit(
    habits: ClientHabit[]
): Habit[] {
    return habits.map((habit) => ({
        id: habit.id,
        title: habit.title,
        streak: habit.streak,
        userId: "", // Placeholder, as userId is not provided in the parameters
        frequencyWindowDays: habit.frequencyWindowDays,
        frequencyTarget: habit.frequencyTarget,
        periodIndex: habit.periodIndex,
        periodCompletions: habit.periodCompletions,
        lastCompletedAt: habit.lastCompletedAt,
        createdAt: new Date(), // Placeholder, as createdAt is not provided in the parameters
    }));
}