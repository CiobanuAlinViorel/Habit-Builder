"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = {
    value: string;
    label: string;
};

type Props = {
    id?: string;
    name?: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

/**
 * Themed dropdown that replaces the native <select>, whose popup/options
 * can't be styled to match the app (dark modal, brand colors). Behaves like
 * a standard select: click or Enter/Space/ArrowDown to open, arrow keys to
 * move, Enter/Space to choose, Escape or an outside click to dismiss.
 */
export default function Select({
    id,
    name,
    value,
    options,
    onChange,
    placeholder = "Select…",
    className = "",
}: Props) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        if (!open) return;

        function onPointerDown(event: PointerEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        listRef.current?.focus();
    }, [open]);

    function openList() {
        const index = options.findIndex((option) => option.value === value);
        setHighlighted(index === -1 ? 0 : index);
        setOpen(true);
    }

    function selectAt(index: number) {
        const option = options[index];
        if (!option) return;
        onChange(option.value);
        setOpen(false);
    }

    function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openList();
        }
    }

    function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((current) => Math.min(current + 1, options.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((current) => Math.max(current - 1, 0));
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectAt(highlighted);
        } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === "Tab") {
            setOpen(false);
        }
    }

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            {name && <input type="hidden" name={name} value={value} />}

            <button
                type="button"
                id={id}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onButtonKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 rounded-md border border-brand-slate/40 bg-brand-blue-deep/50 px-3 py-2 text-left text-sm text-brand-offwhite outline-none transition-colors hover:border-brand-slate/60 focus:border-brand-emerald"
            >
                <span className={selected ? "" : "text-brand-slate"}>
                    {selected?.label ?? placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-brand-slate transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <ul
                    ref={listRef}
                    role="listbox"
                    tabIndex={-1}
                    onKeyDown={onListKeyDown}
                    aria-activedescendant={options[highlighted] ? `${id}-option-${highlighted}` : undefined}
                    className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-md border border-brand-slate/30 bg-brand-navy-dark p-1 shadow-lg outline-none"
                >
                    {options.map((option, index) => {
                        const isSelected = option.value === value;
                        const isHighlighted = index === highlighted;
                        return (
                            <li
                                key={option.value}
                                id={`${id}-option-${index}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setHighlighted(index)}
                                onClick={() => selectAt(index)}
                                className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${isHighlighted ? "bg-brand-emerald/20" : ""
                                    } ${isSelected ? "font-semibold text-brand-mint" : "text-brand-offwhite/90"}`}
                            >
                                {option.label}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
