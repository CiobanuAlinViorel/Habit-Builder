'use client';

import { useState } from "react";
import NewHabitForm from "./NewHabitForm";
import HabitCard from "./HabitCard";
import { Habit } from "@/shared/types/Habit";
import { Plus } from "lucide-react";


type Props = {
    habits: Habit[];
}

const ClientComponent = ({
    habits
}: Props) => {

    const [closed, setClosed] = useState(true);

    const handleClose = (v: boolean) => {
        setClosed(v);
    }

    return (
        <div>
            <div className="mt-1 flex items-center justify-end">
                <button
                    onClick={() => handleClose(false)}
                    className="rounded-md bg-blue-950 px-4 py-2 text-md font-semibold text-white transition-colors hover:bg-blue-900 flex gap-2 justify-center items-center"
                >

                    Add Habit
                    <Plus className="w-5 h-5" />
                </button>
                <NewHabitForm setClosed={handleClose} closed={closed} />
            </div>

            {habits.length === 0 ? (
                <p className="mt-10 text-sm text-brand-slate">
                    No habits yet — add your first one above.
                </p>
            ) : (
                <ul className="mt-8 flex flex-col gap-3">
                    {habits.map((habit) => (
                        <HabitCard key={habit.id} habit={habit} />
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ClientComponent