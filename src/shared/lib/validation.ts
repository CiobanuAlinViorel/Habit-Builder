import * as z from "zod";
import { MAX_WINDOW_DAYS, MIN_WINDOW_DAYS } from "@/shared/lib/habitFrequency";

export const RegisterSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long."),
    email: z.email("Please enter a valid email.").trim().toLowerCase(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
        .regex(/[0-9]/, "Password must contain at least one number."),
});

export const LoginSchema = z.object({
    email: z.email("Please enter a valid email.").trim().toLowerCase(),
    password: z.string().min(1, "Password is required."),
});

export const HabitTitleSchema = z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title must be 120 characters or fewer.");

export const HabitFrequencySchema = z
    .object({
        windowDays: z.coerce
            .number()
            .int()
            .min(MIN_WINDOW_DAYS, `Frequency window must be at least ${MIN_WINDOW_DAYS} day.`)
            .max(MAX_WINDOW_DAYS, `Frequency window must be ${MAX_WINDOW_DAYS} days or fewer.`),
        target: z.coerce.number().int().min(1, "Target must be at least once."),
    })
    .refine((freq) => freq.target <= freq.windowDays, {
        error: "You can't complete a habit more times than the window has days.",
        path: ["target"],
    });

export const HabitFormSchema = z.object({
    title: HabitTitleSchema,
    frequency: HabitFrequencySchema,
});
