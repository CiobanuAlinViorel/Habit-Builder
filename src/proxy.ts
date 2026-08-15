import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Optimistic auth check: only reads the session cookie, no DB hit. The real
// authorization checks live in the DAL (src/shared/lib/auth/dal.ts) and run
// close to the data. See node_modules/next/dist/docs/01-app/02-guides/authentication.md.

const PROTECTED_ROUTES = ["/habits", "/profile", "/statistics"];
const AUTH_ROUTES = ["/login", "/register"];

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

async function hasValidSession(request: NextRequest): Promise<boolean> {
    const cookie = request.cookies.get("session")?.value;
    if (!cookie || !encodedKey) return false;

    try {
        await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
        return true;
    } catch {
        return false;
    }
}

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = PROTECTED_ROUTES.some(
        (route) => path === route || path.startsWith(`${route}/`),
    );
    const isAuthRoute = AUTH_ROUTES.some((route) => path === route);

    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    const authenticated = await hasValidSession(request);

    if (isProtectedRoute && !authenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", path);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && authenticated) {
        return NextResponse.redirect(new URL("/habits", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|ico|svg)$).*)"],
};
