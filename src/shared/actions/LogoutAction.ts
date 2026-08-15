"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/shared/lib/auth/session";

export async function logout(): Promise<void> {
    await deleteSession();
    redirect("/login");
}
