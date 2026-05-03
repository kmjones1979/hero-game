"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";

type Props = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

export function Tooltip({ label, children, side = "top", className }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={clsx("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <span
        id={id}
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-ash-grey/30 bg-ink/95 px-2 py-1 font-sans text-[10px] uppercase tracking-[0.18em] text-pearl-beige shadow-lg backdrop-blur-md transition-opacity duration-150",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        {label}
      </span>
    </span>
  );
}
