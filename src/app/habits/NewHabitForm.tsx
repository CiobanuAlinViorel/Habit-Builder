"use client";

import { useActionState, useEffect, useRef } from "react";
import { createHabit, type HabitActionState } from "@/shared/actions/HabitActions";
import FrequencyFields from "./FrequencyFields";
import { X } from "lucide-react";

type Props = {
    setClosed: (v: boolean) => void;
    closed: boolean;
}

export default function NewHabitForm(
    { setClosed, closed }: Props
) {
    const [state, formAction, pending] = useActionState<HabitActionState, FormData>(
        createHabit,
        undefined,
    );
    const formRef = useRef<HTMLFormElement>(null);

    function onClose() {
        setClosed(true);
    }

    useEffect(() => {
        if (closed) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closed]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${closed ? 'hidden' : 'flex'} `}
            aria-modal="true"
            role="dialog"
            aria-labelledby="new-habit-title"
        >

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md rounded-lg border border-brand-slate/20 bg-brand-navy-dark p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="new-habit-title" className="text-base font-semibold text-white">
                        New habit
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-100/60 transition-colors duration-200 hover:bg-white/10 hover:text-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    ref={formRef}
                    action={async (formData) => {
                        await formAction(formData);
                        formRef.current?.reset();
                    }}
                    className="flex flex-col gap-4 text-white"
                >
                    <div>
                        <label htmlFor="title" className="text-sm font-medium">
                            Title
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

                    {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

                    <button
                        type="submit"
                        disabled={pending}
                        className="mt-1 w-full rounded-md bg-brand-emerald px-4 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint disabled:opacity-60"
                    >
                        {pending ? "Adding…" : "Add habit"}
                    </button>
                </form>
            </div>
        </div>
    );
}