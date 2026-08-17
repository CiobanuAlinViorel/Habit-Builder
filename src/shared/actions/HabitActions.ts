"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { verifySession } from "@/shared/lib/auth/dal";
import { HabitFormSchema } from "@/shared/lib/validation";
import { getCheckInEligibility, periodIndexForDate, utcDateOnly } from "@/shared/lib/habitFrequency";

export type HabitActionState = { error?: string } | undefined;

function parseFrequencyFields(formData: FormData) {
    return {
        windowDays: formData.get("frequencyWindowDays"),
        target: formData.get("frequencyTarget"),
    };
}

export async function createHabit(
    _prevState: HabitActionState,
    formData: FormData,
): Promise<HabitActionState> {
    const { userId } = await verifySession();

    const parsed = HabitFormSchema.safeParse({
        title: formData.get("title"),
        frequency: parseFrequencyFields(formData),
    });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const { title, frequency } = parsed.data;

    await db.habit.create({
        data: {
            title,
            userId,
            frequencyWindowDays: frequency.windowDays,
            frequencyTarget: frequency.target,
        },
    });

    revalidatePath("/habits");
    revalidatePath("/statistics");
}

export async function updateHabit(
    _prevState: HabitActionState,
    formData: FormData,
): Promise<HabitActionState> {
    const { userId } = await verifySession();

    const habitId = String(formData.get("habitId") ?? "");
    const parsed = HabitFormSchema.safeParse({
        title: formData.get("title"),
        frequency: parseFrequencyFields(formData),
    });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const { title, frequency } = parsed.data;

    // Scope the update to the owner so a client can't edit someone else's habit.
    const { count } = await db.habit.updateMany({
        where: { id: habitId, userId },
        data: {
            title,
            frequencyWindowDays: frequency.windowDays,
            frequencyTarget: frequency.target,
        },
    });
    if (count === 0) {
        return { error: "Habit not found." };
    }

    revalidatePath("/habits");
    revalidatePath("/statistics");
}

export type CheckInResult =
    | { ok: true }
    | { ok: false; message: string };

/**
 * Logs a single completion for today, if the habit's frequency allows it.
 * A habit can only be checked in once per calendar day, and at most
 * `frequencyTarget` times per `frequencyWindowDays`-day period — so mashing
 * the button can't push the streak past what the frequency allows.
 */
export async function checkInHabit(habitId: string): Promise<CheckInResult> {
    const { userId } = await verifySession();

    const result = await db.$transaction(async (tx) => {
        const habit = await tx.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) {
            return { ok: false as const, message: "Habit not found." };
        }

        const now = new Date();
        const eligibility = getCheckInEligibility(habit, now);
        if (!eligibility.allowed) {
            const message =
                eligibility.reason === "already-done-today"
                    ? "Already checked in today."
                    : `You've already hit this habit's target (${eligibility.completions}/${eligibility.target}).`;
            return { ok: false as const, message };
        }

        const currentPeriod = periodIndexForDate(now, habit.frequencyWindowDays);
        const isNewPeriod = habit.periodIndex !== currentPeriod;
        const periodCompletions = isNewPeriod ? 1 : habit.periodCompletions + 1;

        // The streak only advances once per period -- extra check-ins within
        // a period you've already claimed (targets > 1) don't inflate it --
        // and only when the new period immediately follows the last one that
        // had a completion. Any gap (a missed day for a daily habit, a
        // missed week for a weekly one, and so on for every frequency)
        // restarts the streak at 1 instead of continuing it.
        const streak = !isNewPeriod
            ? habit.streak
            : habit.periodIndex !== null && currentPeriod === habit.periodIndex + 1
                ? habit.streak + 1
                : 1;

        await tx.habit.update({
            where: { id: habitId },
            data: {
                streak,
                lastCompletedAt: now,
                periodIndex: currentPeriod,
                periodCompletions,
            },
        });

        // Durable per-day record for the statistics table. Upsert (rather
        // than create) so this stays idempotent even if something ever
        // calls checkInHabit twice for the same day.
        await tx.habitCompletion.upsert({
            where: { habitId_date: { habitId, date: utcDateOnly(now) } },
            create: { habitId, date: utcDateOnly(now) },
            update: {},
        });

        return { ok: true as const };
    });

    revalidatePath("/habits");
    revalidatePath("/statistics");
    return result;
}

export async function resetHabitStreak(habitId: string): Promise<void> {
    const { userId } = await verifySession();

    await db.habit.updateMany({
        where: { id: habitId, userId },
        data: {
            streak: 0,
            periodIndex: null,
            periodCompletions: 0,
            lastCompletedAt: null,
        },
    });

    revalidatePath("/habits");
    revalidatePath("/statistics");
}

export async function deleteHabit(habitId: string): Promise<void> {
    const { userId } = await verifySession();

    await db.habit.deleteMany({
        where: { id: habitId, userId },
    });

    revalidatePath("/habits");
    revalidatePath("/statistics");
}
