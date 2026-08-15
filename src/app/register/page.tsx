"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type RegisterActionState } from "./actions";

export default function RegisterPage() {
    const [state, formAction, pending] = useActionState<RegisterActionState, FormData>(
        register,
        undefined,
    );

    return (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
            <h1 className="text-2xl font-semibold text-foreground">Sign up</h1>
            <p className="mt-1 text-sm text-brand-slate">
                Start tracking habits and building streaks.
            </p>

            <form action={formAction} className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="rounded-md border border-brand-slate/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-emerald"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="rounded-md border border-brand-slate/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-emerald"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="rounded-md border border-brand-slate/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-emerald"
                    />
                    <p className="text-xs text-brand-slate">
                        At least 8 characters, with a letter and a number.
                    </p>
                </div>

                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

                <button
                    type="submit"
                    disabled={pending}
                    className="mt-2 rounded-md bg-brand-emerald px-4 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint disabled:opacity-60"
                >
                    {pending ? "Creating account…" : "Sign up"}
                </button>
            </form>

            <p className="mt-6 text-sm text-brand-slate">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-brand-emerald hover:underline">
                    Log in
                </Link>
            </p>
        </main>
    );
}
