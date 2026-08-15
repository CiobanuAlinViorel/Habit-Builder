"use server";

import { redirect } from "next/navigation";
import { db } from "@/shared/lib/db";
import { verifyPassword } from "@/shared/lib/auth/password";
import { createSession } from "@/shared/lib/auth/session";
import { LoginSchema } from "@/shared/lib/validation";

export type LoginActionState = { error?: string } | undefined;

// Generic message for any credential failure so we don't leak which part
// (email vs password) was wrong.
const INVALID_CREDENTIALS = "Invalid email or password.";

export async function login(
    _prevState: LoginActionState,
    formData: FormData,
): Promise<LoginActionState> {
    const parsed = LoginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        return { error: INVALID_CREDENTIALS };
    }

    const passwordMatches = await verifyPassword(password, user.password);
    if (!passwordMatches) {
        return { error: INVALID_CREDENTIALS };
    }

    await createSession(user.id);
    redirect("/habits");
}
