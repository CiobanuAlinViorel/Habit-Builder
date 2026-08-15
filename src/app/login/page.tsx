"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginActionState } from "./actions";

export default function LoginPage() {
    const [state, formAction, pending] = useActionState<LoginActionState, FormData>(
        login,
        undefined,
    );

    return (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
            <h1 className="text-2xl font-semibold text-foreground">Log in</h1>
            <p className="mt-1 text-sm text-brand-slate">
                Welcome back. Keep those streaks alive.
            </p>

            <form action={formAction} className="mt-8 flex flex-col gap-4">
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
                        autoComplete="current-password"
                        required
                        className="rounded-md border border-brand-slate/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-emerald"
                    />
                </div>

                {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

                <button
                    type="submit"
                    disabled={pending}
                    className="mt-2 rounded-md bg-brand-emerald px-4 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint disabled:opacity-60"
                >
                    {pending ? "Logging in…" : "Log in"}
                </button>
            </form>

            <p className="mt-6 text-sm text-brand-slate">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-brand-emerald hover:underline">
                    Sign up
                </Link>
            </p>
        </main>
    );
}
