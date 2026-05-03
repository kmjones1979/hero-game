"use client";

import { motion } from "motion/react";
import clsx from "clsx";
import {
  STAT_LABEL,
  STAT_TOOLTIP,
  STAT_MAX,
  type StatKey,
} from "../lib/hero-style";
import { useCountUp } from "../lib/hooks/use-count-up";
import { useReducedMotion } from "../lib/hooks/use-reduced-motion";
import { StatIcon } from "./stat-icon";
import { Tooltip } from "./tooltip";

type Props = {
  stat: StatKey;
  value: number;
  /** Stagger index (0-3) — drives entrance delay. */
  order?: number;
  /** Ghost mode: backside of mint reveal. */
  ghost?: boolean;
};

export function StatBar({ stat, value, order = 0, ghost = false }: Props) {
  const reduced = useReducedMotion();
  const pct = Math.min(1, value / STAT_MAX);
  const delay = ghost ? 0 : 0.12 + order * 0.1;
  const display = useCountUp(ghost ? 0 : value, {
    duration: 800,
    delay: delay * 1000,
  });

  return (
    <div className="flex items-center gap-2.5">
      <Tooltip label={STAT_TOOLTIP[stat]}>
        <span
          className={clsx(
            "inline-flex h-5 w-5 items-center justify-center rounded-md text-pearl-beige/70 transition-colors duration-150",
            "hover:text-beige"
          )}
        >
          <StatIcon stat={stat} size={12} />
        </span>
      </Tooltip>
      <span className="w-7 font-sans text-[10px] uppercase tracking-[0.2em] text-pearl-beige/60">
        {STAT_LABEL[stat]}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ash-grey/20">
        <motion.div
          aria-hidden
          className="h-full origin-left rounded-full bg-muted-teal"
          initial={reduced ? { scaleX: pct } : { scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={{
            duration: reduced ? 0 : 0.8,
            delay: reduced ? 0 : delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "0% 50%" }}
        />
      </div>
      <span className="w-9 text-right font-sans text-[11px] tabular text-beige">
        {display}
      </span>
    </div>
  );
}
