"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/shared/lib/db";
import { hashPassword } from "@/shared/lib/auth/password";
import { createSession } from "@/shared/lib/auth/session";
import { RegisterSchema } from "@/shared/lib/validation";

export type RegisterActionState = { error?: string } | undefined;

const EMAIL_TAKEN = "An account with this email already exists.";

export async function register(
    _prevState: RegisterActionState,
    formData: FormData,
): Promise<RegisterActionState> {
    const parsed = RegisterSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
        return { error: EMAIL_TAKEN };
    }

    const hashed = await hashPassword(password);

    let userId: string;
    try {
        const user = await db.user.create({
            data: { name, email, password: hashed },
            select: { id: true },
        });
        userId = user.id;
    } catch (err) {
        // Two concurrent signups can both pass the findUnique check above;
        // the unique constraint on email is the real guard against that race.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return { error: EMAIL_TAKEN };
        }
        throw err;
    }

    await createSession(userId);
    redirect("/habits");
}
