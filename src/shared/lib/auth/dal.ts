import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/shared/lib/db";
import { getSession } from "@/shared/lib/auth/session";

/**
 * Verifies the current request has a valid session. Redirects to /login
 * when it doesn't. Memoized per-request so it's cheap to call from
 * multiple Server Components/Actions in the same render pass.
 */
export const verifySession = cache(async () => {
    const session = await getSession();

    if (!session?.userId) {
        redirect("/login");
    }

    return { isAuth: true, userId: session.userId };
});

/**
 * Like verifySession, but returns null instead of redirecting. Use this
 * for optional auth (e.g. rendering different header states).
 */
export const getOptionalSession = cache(async () => {
    const session = await getSession();
    return session?.userId ? { userId: session.userId } : null;
});

export const getCurrentUser = cache(async () => {
    const session = await getOptionalSession();
    if (!session) return null;

    try {
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { id: true, name: true, email: true },
        });
        return user;
    } catch {
        return null;
    }
});
