import { verifySession } from "@/shared/lib/auth/dal";
import { db } from "@/shared/lib/db";
import { logout } from "@/shared/actions/LogoutAction";

export default async function ProfilePage() {
    const { userId } = await verifySession();

    const user = await db.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            createdAt: true,
            _count: { select: { habits: true } },
        },
    });

    return (
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-brand-blue-royal to-brand-emerald text-2xl font-semibold text-brand-offwhite">
                {user.name.charAt(0).toUpperCase()}
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-foreground">{user.name}</h1>
            <p className="text-sm text-brand-slate">{user.email}</p>

            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-brand-slate/30 p-4">
                    <dt className="text-brand-slate">Habits tracked</dt>
                    <dd className="mt-1 text-xl font-semibold">{user._count.habits}</dd>
                </div>
                <div className="rounded-lg border border-brand-slate/30 p-4">
                    <dt className="text-brand-slate">Member since</dt>
                    <dd className="mt-1 text-xl font-semibold">
                        {user.createdAt.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                        })}
                    </dd>
                </div>
            </dl>

            <form action={logout} className="mt-8">
                <button
                    type="submit"
                    className="rounded-md border border-brand-slate/40 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                >
                    Log out
                </button>
            </form>
        </main>
    );
}
