"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

type Options = {
  duration?: number;
  delay?: number;
  /** Easing on normalized t in [0, 1]. Defaults to easeOutCubic. */
  ease?: (t: number) => number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animate a number from its previous render value to `target` using
 * requestAnimationFrame. When `prefers-reduced-motion: reduce` is set,
 * the hook returns the target value directly without animation.
 */
export function useCountUp(target: number, opts: Options = {}): number {
  const { duration = 800, delay = 0, ease = easeOutCubic } = opts;
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    let startedAt: number | null = null;
    const startValue = valueRef.current;

    const tick = (now: number) => {
      if (cancelled) return;
      if (startedAt === null) startedAt = now;
      const elapsed = now - startedAt - delay;
      if (elapsed < 0) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const next = startValue + (target - startValue) * ease(t);
      valueRef.current = next;
      setValue(next);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, delay, ease, reduced]);

  if (reduced) return target;
  return Math.round(value);
}
