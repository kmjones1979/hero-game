"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useCluster, CLUSTERS } from "./cluster-context";

export function ClusterSelect() {
  const { cluster, setCluster } = useCluster();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-ash-grey/30 bg-ink/60 px-2.5 py-1.5 text-[11px] font-sans uppercase tracking-[0.18em] text-pearl-beige/80 transition-colors duration-150 hover:bg-muted-teal/10"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-teal" />
        <span>{cluster}</span>
        <ChevronDown
          size={12}
          className={clsx(
            "text-pearl-beige/60 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-ash-grey/30 bg-ink/95 p-1 shadow-xl backdrop-blur-md">
          {CLUSTERS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCluster(c);
                setIsOpen(false);
              }}
              className={clsx(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-150 hover:bg-muted-teal/10",
                c === cluster ? "text-beige" : "text-pearl-beige/70"
              )}
            >
              <span
                className={clsx(
                  "h-1.5 w-1.5 rounded-full",
                  c === cluster ? "bg-muted-teal" : "bg-ash-grey/60"
                )}
              />
              <span>{c}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
