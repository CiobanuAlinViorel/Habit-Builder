"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
    checkInHabit,
    deleteHabit,
    resetHabitStreak,
    updateHabit,
    type HabitActionState,
} from "@/shared/actions/HabitActions";
import {
    completionsInCurrentPeriod,
    formatFrequency,
    getCheckInEligibility,
} from "@/shared/lib/habitFrequency";
import FrequencyFields from "./FrequencyFields";

type Habit = {
    id: string;
    title: string;
    streak: number;
    frequencyWindowDays: number;
    frequencyTarget: number;
    periodIndex: number | null;
    periodCompletions: number;
    lastCompletedAt: Date | null;
};

export default function HabitCard({ habit }: { habit: Habit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [checkInMessage, setCheckInMessage] = useState<string | null>(null);
    const [editState, editAction, editPending] = useActionState<HabitActionState, FormData>(
        updateHabit,
        undefined,
    );

    const eligibility = getCheckInEligibility(habit);
    const progress = completionsInCurrentPeriod(habit);
    const frequencyLabel = formatFrequency(habit.frequencyWindowDays, habit.frequencyTarget);

    function handleCheckIn() {
        setCheckInMessage(null);
        startTransition(async () => {
            const result = await checkInHabit(habit.id);
            if (!result.ok) {
                setCheckInMessage(result.message);
            }
        });
    }

    return (
        <li className="flex flex-col gap-3 rounded-lg border border-brand-slate/30 p-4">
            {isEditing ? (
                <form
                    action={async (formData) => {
                        await editAction(formData);
                        setIsEditing(false);
                    }}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                    <input type="hidden" name="habitId" value={habit.id} />
                    <div className="flex-1">
                        <label htmlFor={`title-${habit.id}`} className="text-sm font-medium">
                            Title
                        </label>
                        <input
                            id={`title-${habit.id}`}
                            name="title"
                            defaultValue={habit.title}
                            autoFocus
                            maxLength={120}
                            className="mt-1.5 w-full rounded-md border border-brand-slate/40 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand-emerald"
                        />
                    </div>
                    <FrequencyFields
                        defaultWindowDays={habit.frequencyWindowDays}
                        defaultTarget={habit.frequencyTarget}
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={editPending}
                            className="rounded-md border border-brand-slate/40 px-3 py-1.5 text-sm font-medium hover:bg-white/5"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-sm text-brand-slate hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                    {editState?.error && (
                        <p className="text-sm text-red-500 sm:basis-full">{editState.error}</p>
                    )}
                </form>
            ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-left text-base font-medium hover:underline"
                        >
                            {habit.title}
                        </button>
                        <p className="text-xs text-brand-slate">
                            {frequencyLabel}
                            {habit.frequencyTarget > 1 && ` · ${progress}/${habit.frequencyTarget} this period`}
                            {" · "}
                            <Link href={`/habits/${habit.id}`} className="text-brand-emerald hover:underline">
                                View history
                            </Link>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {habit.streak > 1 && (
                            <span className="rounded-full bg-brand-emerald/15 px-3 py-1 text-sm font-semibold text-brand-emerald">
                                🔥 {habit.streak} days
                            </span>
                        )}

                        <button
                            type="button"
                            disabled={isPending || !eligibility.allowed}
                            onClick={handleCheckIn}
                            title={
                                eligibility.allowed
                                    ? "Mark today done"
                                    : eligibility.reason === "already-done-today"
                                      ? "Already checked in today"
                                      : "Target already met for this period"
                            }
                            className="rounded-md bg-brand-emerald px-3 py-1.5 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint disabled:cursor-not-allowed disabled:bg-brand-slate/40 disabled:text-brand-offwhite/70"
                        >
                            {eligibility.allowed ? "+1" : "✓"}
                        </button>
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => startTransition(() => resetHabitStreak(habit.id))}
                            className="rounded-md border border-brand-slate/40 px-3 py-1.5 text-sm font-medium hover:bg-white/5 disabled:opacity-60"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                                if (confirm(`Delete "${habit.title}"?`)) {
                                    startTransition(() => deleteHabit(habit.id));
                                }
                            }}
                            className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {checkInMessage && <p className="text-xs text-brand-slate">{checkInMessage}</p>}
        </li>
    );
}
