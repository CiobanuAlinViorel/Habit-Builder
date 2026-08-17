export type ClientHabit = {
    id: string,
    title: string,
    streak: number,
    frequencyWindowDays: number,
    frequencyTarget: number,
    periodIndex: number | null,
    periodCompletions: number,
    lastCompletedAt: Date | null,
}