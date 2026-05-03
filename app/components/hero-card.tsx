"use client";

import { useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import { rarityKey, dominantStat, type RarityKey } from "../lib/hero-style";
import { classLabel, rarityLabel } from "../lib/hero-pda";
import { useReducedMotion } from "../lib/hooks/use-reduced-motion";
import type { HeroEntry } from "../lib/hooks/use-heroes";
import { HeroPortrait } from "./hero-portrait";
import { StatBar } from "./stat-bar";
import { StatIcon } from "./stat-icon";

const RARITY_FRAME: Record<
  RarityKey,
  { container: string; backdrop: string; legendary?: boolean }
> = {
  common: {
    container: "border border-ash-grey/40",
    backdrop: "bg-ink/60",
  },
  rare: {
    container:
      "border border-muted-teal/60 shadow-[0_0_20px_rgba(147,192,164,0.15)]",
    backdrop: "bg-ink/60",
  },
  epic: {
    container:
      "border-2 border-dry-sage shadow-[0_0_28px_rgba(182,196,162,0.22)]",
    backdrop: "bg-gradient-to-br from-ink to-dry-sage/10",
  },
  legendary: {
    container: "",
    backdrop: "bg-gradient-to-br from-ink via-pearl-beige/5 to-muted-teal/10",
    legendary: true,
  },
};

type Props = {
  hero: HeroEntry;
  getExplorerUrl: (path: string) => string;
};

export function HeroCard({ hero, getExplorerUrl }: Props) {
  const { data, address, index } = hero;
  const rk = rarityKey(data.rarity);
  const frame = RARITY_FRAME[rk];
  const dom = dominantStat(data);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shimmer, setShimmer] = useState({ x: 0, visible: false });

  const rotX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const lift = useTransform(rotX, [-8, 8], [0, 0]);
  void lift;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotY.set((px - 0.5) * 16); // -8..+8
    rotX.set((0.5 - py) * 16);
    setShimmer({ x: px * 100, visible: true });
  };

  const handleLeave = () => {
    rotX.set(0);
    rotY.set(0);
    setShimmer((s) => ({ ...s, visible: false }));
  };

  return (
    <motion.article
      layoutId={`hero-${address}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      style={{ perspective: 1000 } as CSSProperties}
      className="relative"
    >
      {frame.legendary && (
        <div
          aria-hidden
          className="legendary-ring absolute -inset-[2px] rounded-2xl"
        />
      )}

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
        }}
        className={clsx(
          "relative overflow-hidden rounded-2xl backdrop-blur-sm",
          "transition-shadow duration-200",
          frame.container,
          frame.backdrop
        )}
      >
        <div className="p-4" style={{ transform: "translateZ(0)" }}>
          <div
            className="relative mb-3 overflow-hidden rounded-xl"
            style={{ transform: "translateZ(20px)" }}
          >
            <HeroPortrait
              className="aspect-[5/6] w-full"
              cls={data.class}
              rarity={data.rarity}
              stats={data}
              address={String(address)}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-ash-grey/30 bg-ink/70 px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-[0.2em] text-pearl-beige/80 backdrop-blur"
            >
              <StatIcon stat={dom} size={10} className="text-muted-teal" />
              <span>{rarityLabel(data.rarity)}</span>
            </div>
          </div>

          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold leading-tight text-beige">
                Hero #{String(index).padStart(3, "0")}
              </h3>
              <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.2em] text-pearl-beige/60">
                {classLabel(data.class)} · {rarityLabel(data.rarity)}
              </p>
            </div>
            <a
              href={getExplorerUrl(`/address/${address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-sans text-[10px] tabular text-pearl-beige/50 transition-colors hover:text-muted-teal"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              {String(address).slice(0, 4)}…{String(address).slice(-4)}
            </a>
          </div>

          <div className="space-y-1.5">
            <StatBar stat="hp" value={data.hp} order={0} />
            <StatBar stat="attack" value={data.attack} order={1} />
            <StatBar stat="defense" value={data.defense} order={2} />
            <StatBar stat="speed" value={data.speed} order={3} />
          </div>
        </div>

        {!reduced && frame.legendary && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: shimmer.visible ? 1 : 0,
              background: `linear-gradient(105deg, transparent ${Math.max(0, shimmer.x - 20)}%, rgba(220,226,189,0.30) ${shimmer.x}%, transparent ${Math.min(100, shimmer.x + 20)}%)`,
              mixBlendMode: "overlay",
            }}
          />
        )}
      </motion.div>
    </motion.article>
  );
}
