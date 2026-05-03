import type { ReactNode } from "react";

export function EmptyState({ action }: { action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-ash-grey/20 bg-ink/40 px-6 py-20 text-center">
      <svg
        viewBox="0 0 120 120"
        className="mb-6 h-28 w-28 text-muted-teal/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="60" cy="60" r="48" className="stroke-draw" opacity="0.6" />
        <path
          d="M60 28 L72 50 L96 54 L78 70 L82 94 L60 82 L38 94 L42 70 L24 54 L48 50 Z"
          opacity="0.85"
        />
        <line x1="38" y1="100" x2="82" y2="100" opacity="0.5" />
      </svg>

      <h3 className="font-display text-2xl font-semibold tracking-wide text-beige">
        Your Roster Awaits
      </h3>
      <p className="mt-2 max-w-sm font-sans text-sm text-pearl-beige/60">
        Summon your first hero to begin building your collection. Stats roll
        on-chain — every mint is unique.
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
