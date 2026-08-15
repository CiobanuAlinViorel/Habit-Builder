"use client";

import { useState } from "react";
import { FREQUENCY_PRESETS, MAX_WINDOW_DAYS } from "@/shared/lib/habitFrequency";

const CUSTOM_KEY = "custom";

function presetKey(windowDays: number, target: number): string {
    return `${windowDays}-${target}`;
}

function initialKey(windowDays: number, target: number): string {
    const match = FREQUENCY_PRESETS.some(
        (p) => p.windowDays === windowDays && p.target === target,
    );
    return match ? presetKey(windowDays, target) : CUSTOM_KEY;
}

/**
 * Frequency picker: a dropdown of common presets (Daily, Weekly, "4 days a
 * week", ...) plus a "Custom" option that reveals raw target/window-days
 * inputs. Always renders `frequencyWindowDays` and `frequencyTarget` form
 * fields under the hood, so the parent <form> just works with either mode.
 */
export default function FrequencyFields({
    defaultWindowDays = 1,
    defaultTarget = 1,
}: {
    defaultWindowDays?: number;
    defaultTarget?: number;
}) {
    const [selected, setSelected] = useState(() => initialKey(defaultWindowDays, defaultTarget));
    const [customWindowDays, setCustomWindowDays] = useState(defaultWindowDays);
    const [customTarget, setCustomTarget] = useState(defaultTarget);

    const isCustom = selected === CUSTOM_KEY;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="frequency-preset" className="text-sm font-medium">
                Frequency
            </label>
            <select
                id="frequency-preset"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="rounded-md border border-brand-slate/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-emerald"
            >
                {FREQUENCY_PRESETS.map((preset) => (
                    <option
                        key={presetKey(preset.windowDays, preset.target)}
                        value={presetKey(preset.windowDays, preset.target)}
                        className="bg-background text-foreground"
                    >
                        {preset.label}
                    </option>
                ))}
                <option value={CUSTOM_KEY} className="bg-background text-foreground">
                    Custom…
                </option>
            </select>

            {isCustom ? (
                <div className="flex items-center gap-2 text-sm">
                    <span>Complete</span>
                    <input
                        type="number"
                        name="frequencyTarget"
                        min={1}
                        max={customWindowDays}
                        value={customTarget}
                        onChange={(event) =>
                            setCustomTarget(Math.max(1, Number(event.target.value) || 1))
                        }
                        className="w-16 rounded-md border border-brand-slate/40 bg-transparent px-2 py-1 text-center outline-none focus:border-brand-emerald"
                    />
                    <span>times every</span>
                    <input
                        type="number"
                        name="frequencyWindowDays"
                        min={1}
                        max={MAX_WINDOW_DAYS}
                        value={customWindowDays}
                        onChange={(event) =>
                            setCustomWindowDays(Math.max(1, Number(event.target.value) || 1))
                        }
                        className="w-16 rounded-md border border-brand-slate/40 bg-transparent px-2 py-1 text-center outline-none focus:border-brand-emerald"
                    />
                    <span>days</span>
                </div>
            ) : (
                (() => {
                    const [windowDays, target] = selected.split("-").map(Number);
                    return (
                        <>
                            <input type="hidden" name="frequencyWindowDays" value={windowDays} />
                            <input type="hidden" name="frequencyTarget" value={target} />
                        </>
                    );
                })()
            )}
        </div>
    );
}
