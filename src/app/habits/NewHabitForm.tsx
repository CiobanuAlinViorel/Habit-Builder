"use client";

import { useActionState, useRef } from "react";
import { createHabit, type HabitActionState } from "@/shared/actions/HabitActions";
import FrequencyFields from "./FrequencyFields";

export default function NewHabitForm() {
    const [state, formAction, pending] = useActionState<HabitActionState, FormData>(
        createHabit,
        undefined,
    );
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                await formAction(formData);
                formRef.current?.reset();
            }}
            className="flex flex-col gap-3 rounded-lg border border-brand-slate/30 p-4 sm:flex-row sm:items-end"
        >
            <div className="flex-1">
                <label htmlFor="title" className="text-sm font-medium">
                    New habit
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Read for 20 minutes"
                    required
                    maxLength={120}
                    className="mt-1.5 w-full rounded-md border border-brand-slate/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-emerald"
                />
            </div>

            <FrequencyFields />

            <button
                type="submit"
                disabled={pending}
                className="shrink-0 rounded-md bg-brand-emerald px-4 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint disabled:opacity-60"
            >
                {pending ? "Adding…" : "Add habit"}
            </button>

            {state?.error && <p className="text-sm text-red-500 sm:basis-full">{state.error}</p>}
        </form>
    );
}
