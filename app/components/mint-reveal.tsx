"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import clsx from "clsx";
import { rarityKey, type RarityKey } from "../lib/hero-style";
import { classLabel, rarityLabel } from "../lib/hero-pda";
import type { HeroEntry } from "../lib/hooks/use-heroes";
import { useReducedMotion } from "../lib/hooks/use-reduced-motion";
import { HeroPortrait } from "./hero-portrait";
import { StatBar } from "./stat-bar";

const PALETTE = ["#8e9b90", "#93c0a4", "#b6c4a2", "#d4cdab", "#dce2bd"];

const SIGIL: Record<RarityKey, string> = {
  common:
    "M50 20 L60 45 L85 50 L66 65 L72 90 L50 78 L28 90 L34 65 L15 50 L40 45 Z",
  rare: "M50 18 C70 30 78 50 78 62 C78 78 64 88 50 88 C36 88 22 78 22 62 C22 50 30 30 50 18 Z",
  epic: "M50 14 L62 38 L84 38 L66 55 L74 80 L50 65 L26 80 L34 55 L16 38 L38 38 Z",
  legendary:
    "M50 14 C56 26 64 28 70 28 C66 38 70 50 78 56 C66 56 58 64 56 76 C50 68 42 64 30 68 C36 56 32 44 22 38 C32 38 40 30 50 14 Z",
};

type Props = {
  hero: HeroEntry;
  onClose: () => void;
};

export function MintReveal({ hero, onClose }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const reduced = useReducedMotion();
  const rk = rarityKey(hero.data.rarity);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const flipDelay = reduced ? 200 : 800;
    const continueDelay = reduced ? 800 : 2500;

    const t1 = setTimeout(() => setRevealed(true), flipDelay);
    const t2 = setTimeout(() => setShowContinue(true), continueDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduced]);

  useEffect(() => {
    if (!revealed) return;
    if (reduced) return;

    if (rk === "epic") {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.55 },
        colors: PALETTE,
        scalar: 0.8,
        ticks: 160,
      });
    } else if (rk === "legendary") {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: PALETTE,
        scalar: 0.9,
        ticks: 200,
      });
      // Second smaller burst from the sides
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: PALETTE,
          scalar: 0.8,
        });
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: PALETTE,
          scalar: 0.8,
        });
      }, 240);
    }
  }, [revealed, rk, reduced]);

  return (
    <AnimatePresence>
      <motion.div
        key="reveal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 px-6 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Hero reveal"
      >
        {rk === "legendary" && revealed && (
          <div
            aria-hidden
            className="vignette-pulse pointer-events-none fixed inset-0"
            style={{
              boxShadow: "inset 0 0 200px 40px rgba(212,205,171,0.45)",
            }}
          />
        )}

        {rk === "rare" && revealed && !reduced && <RareParticles />}

        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm"
          style={{ perspective: 1200 }}
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={{
              duration: reduced ? 0.001 : 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative aspect-[3/4] w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <CardBack rarity={rk} />
            <CardFront hero={hero} revealed={revealed} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: showContinue ? 1 : 0, y: showContinue ? 0 : 8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center"
          >
            <button
              onClick={onClose}
              disabled={!showContinue}
              className="inline-flex items-center gap-2 rounded-md border border-muted-teal/40 bg-muted-teal/10 px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-beige transition-colors duration-200 hover:bg-muted-teal/20 disabled:pointer-events-none disabled:opacity-0"
            >
              Continue
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CardBack({ rarity }: { rarity: RarityKey }) {
  return (
    <div
      className={clsx(
        "absolute inset-0 overflow-hidden rounded-2xl border border-ash-grey/40 bg-ink/90",
        "flex items-center justify-center"
      )}
      style={{ backfaceVisibility: "hidden" }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(147,192,164,0.10), transparent 60%),
            repeating-linear-gradient(45deg, rgba(212,205,171,0.04) 0 2px, transparent 2px 12px)
          `,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        className="relative h-2/5 w-2/5 text-pearl-beige/70"
        fill="currentColor"
      >
        <path d={SIGIL[rarity]} />
      </svg>
    </div>
  );
}

function CardFront({ hero, revealed }: { hero: HeroEntry; revealed: boolean }) {
  const rk = rarityKey(hero.data.rarity);
  const isLegendary = rk === "legendary";

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      {isLegendary && (
        <div
          aria-hidden
          className="legendary-ring absolute -inset-[2px] rounded-2xl"
        />
      )}
      <div
        className={clsx(
          "relative h-full w-full rounded-2xl border bg-ink/95 p-5 backdrop-blur-sm",
          rk === "common" && "border-ash-grey/40",
          rk === "rare" &&
            "border-muted-teal/60 shadow-[0_0_30px_rgba(147,192,164,0.25)]",
          rk === "epic" &&
            "border-2 border-dry-sage shadow-[0_0_40px_rgba(182,196,162,0.32)]",
          isLegendary && "border-transparent"
        )}
      >
        <div className="mb-3 overflow-hidden rounded-xl">
          <HeroPortrait
            className="aspect-[5/6] w-full"
            cls={hero.data.class}
            rarity={hero.data.rarity}
            stats={hero.data}
            address={String(hero.address)}
          />
        </div>

        <div className="mb-3">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-pearl-beige/60">
            {classLabel(hero.data.class)} · {rarityLabel(hero.data.rarity)}
          </p>
          <h3 className="font-display text-xl font-semibold leading-tight text-beige">
            Hero #{String(hero.index).padStart(3, "0")}
          </h3>
        </div>

        {revealed && (
          <div className="space-y-1.5">
            <StatBar stat="hp" value={hero.data.hp} order={0} />
            <StatBar stat="attack" value={hero.data.attack} order={1} />
            <StatBar stat="defense" value={hero.data.defense} order={2} />
            <StatBar stat="speed" value={hero.data.speed} order={3} />
          </div>
        )}

        {isLegendary && revealed && (
          <div
            aria-hidden
            className="holo-sweep pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(220,226,189,0.4) 50%, transparent 60%)",
              mixBlendMode: "overlay",
            }}
          />
        )}
      </div>
    </div>
  );
}

function RareParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      x: 5 + Math.random() * 90,
      delay: Math.random() * 1.2,
      duration: 2.4 + Math.random() * 1.2,
      size: 2 + Math.random() * 3,
      key: i,
    }))
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0">
      {particles.map((p) => (
        <span
          key={p.key}
          className="particle-drift absolute bottom-1/4 rounded-full bg-muted-teal"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
