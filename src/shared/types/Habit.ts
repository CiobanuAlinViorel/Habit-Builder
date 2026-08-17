export type Habit = {
    id: string;
    title: string;
    streak: number;
    userId: string;
    frequencyWindowDays: number;
    frequencyTarget: number;
    periodIndex: number | null;
    periodCompletions: number;
    lastCompletedAt: Date | null;
    createdAt: Date;
}