"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export type SortKey = "newest" | "oldest" | "rarest";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "rarest", label: "Rarest" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = OPTIONS.find((o) => o.value === value)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-ash-grey/30 bg-ink/60 px-2.5 py-1.5 text-[11px] font-sans uppercase tracking-[0.18em] text-pearl-beige/80 transition-colors duration-150 hover:bg-muted-teal/10"
      >
        <span>{current.label}</span>
        <ChevronDown
          size={12}
          className={clsx(
            "text-pearl-beige/60 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-36 overflow-hidden rounded-lg border border-ash-grey/30 bg-ink/95 p-1 shadow-xl backdrop-blur-md">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={clsx(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-150 hover:bg-muted-teal/10",
                o.value === value ? "text-beige" : "text-pearl-beige/70"
              )}
            >
              {o.label}
              {o.value === value && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-muted-teal"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
