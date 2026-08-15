import Link from "next/link";
import { getOptionalSession } from "@/shared/lib/auth/dal";

export default async function Home() {
    const session = await getOptionalSession();

    return (
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Build habits that stick
            </h1>
            <p className="mt-3 max-w-md text-brand-slate">
                Track daily habits, log your streaks, and watch your consistency grow
                over time.
            </p>

            <Link
                href={session ? "/habits" : "/register"}
                className="mt-8 rounded-md bg-brand-emerald px-6 py-3 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint"
            >
                {session ? "Go to your habits" : "Get started"}
            </Link>
        </main>
    );
}
