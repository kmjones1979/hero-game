"use client";

import { useMemo } from "react";
import {
  RARITY_HALO,
  STAT_ACCENT,
  dominantStat,
  rarityKey,
  seedFromAddress,
  type HeroStats,
  type StatKey,
} from "../lib/hero-style";

type Props = {
  className: string;
  rarity: number;
  cls: number;
  stats: HeroStats;
  address: string;
};

const CLASS_NAMES = ["Warrior", "Mage", "Rogue", "Cleric", "Ranger"] as const;

/**
 * Procedural hero portrait. Shared 200x240 template + per-class silhouette
 * + per-stat accent overlay. Subtle PDA-derived variation in rotation and
 * accent placement keeps each card feeling unique without making the
 * silhouette unrecognizable.
 */
export function HeroPortrait({
  className,
  rarity,
  cls,
  stats,
  address,
}: Props) {
  const seed = useMemo(() => seedFromAddress(address), [address]);
  const dom = dominantStat(stats);
  const accent = STAT_ACCENT[dom];
  const halo = RARITY_HALO[rarityKey(rarity)];

  const rot = ((seed % 31) - 15) * 0.4; // -6 .. +6 deg backdrop wobble
  const accentOffset = ((seed >> 5) % 11) - 5; // -5 .. +5 px accent shift
  const speckSeed = (seed >> 10) & 0xff;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 200 240"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`${CLASS_NAMES[cls] ?? "Hero"} portrait`}
        className="block h-full w-full"
      >
        <defs>
          <radialGradient id={`halo-${address}`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor={halo} />
            <stop offset="70%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id={`silh-${address}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-pearl-beige)"
              stopOpacity="0.95"
            />
            <stop
              offset="100%"
              stopColor="var(--color-pearl-beige)"
              stopOpacity="0.78"
            />
          </linearGradient>
          <clipPath id={`clip-${address}`}>
            <rect x="0" y="0" width="200" height="240" rx="10" />
          </clipPath>
        </defs>

        <g clipPath={`url(#clip-${address})`}>
          <rect width="200" height="240" fill="rgba(35,39,35,0.6)" />
          <rect width="200" height="240" fill={`url(#halo-${address})`} />

          <g transform={`translate(100 130) rotate(${rot})`}>
            <circle r="78" fill="var(--color-ash-grey)" opacity="0.16" />
            <circle r="62" fill="var(--color-ash-grey)" opacity="0.08" />
          </g>

          <Speckles seed={speckSeed} />

          <ClassSilhouette
            cls={cls}
            fill={`url(#silh-${address})`}
            accent={accent}
            accentOffset={accentOffset}
          />

          <DominantOverlay dom={dom} accent={accent} seed={seed} />
        </g>

        <rect
          width="200"
          height="240"
          rx="10"
          fill="none"
          stroke="rgba(212,205,171,0.08)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function Speckles({ seed }: { seed: number }) {
  const dots = Array.from({ length: 8 }, (_, i) => {
    const s = (seed + i * 37) & 0xffff;
    const x = 20 + (s % 160);
    const y = 30 + ((s >> 6) % 180);
    const r = 0.6 + ((s >> 12) % 5) * 0.25;
    return { x, y, r, key: i };
  });
  return (
    <g opacity="0.35" fill="var(--color-pearl-beige)">
      {dots.map((d) => (
        <circle key={d.key} cx={d.x} cy={d.y} r={d.r} />
      ))}
    </g>
  );
}

function ClassSilhouette({
  cls,
  fill,
  accent,
  accentOffset,
}: {
  cls: number;
  fill: string;
  accent: string;
  accentOffset: number;
}) {
  switch (cls) {
    case 0:
      return <Warrior fill={fill} accent={accent} dx={accentOffset} />;
    case 1:
      return <Mage fill={fill} accent={accent} dx={accentOffset} />;
    case 2:
      return <Rogue fill={fill} accent={accent} dx={accentOffset} />;
    case 3:
      return <Cleric fill={fill} accent={accent} dx={accentOffset} />;
    case 4:
      return <Ranger fill={fill} accent={accent} dx={accentOffset} />;
    default:
      return <Warrior fill={fill} accent={accent} dx={accentOffset} />;
  }
}

type SilhProps = { fill: string; accent: string; dx: number };

function Warrior({ fill, accent, dx }: SilhProps) {
  return (
    <g>
      <path
        d="M70 86 L66 70 L78 76 L78 60 L100 54 L122 60 L122 76 L134 70 L130 86 Z"
        fill={fill}
      />
      <ellipse cx="100" cy="100" rx="22" ry="22" fill={fill} />
      <path
        d="M62 200 L66 130 Q100 110 134 130 L138 200 L120 208 L100 198 L80 208 Z"
        fill={fill}
      />
      <path
        d="M52 174 Q70 140 92 134 L92 158 Q72 168 56 196 Z"
        fill={fill}
        opacity="0.85"
      />
      <path
        d="M148 174 Q130 140 108 134 L108 158 Q128 168 144 196 Z"
        fill={fill}
        opacity="0.85"
      />
      <rect x={68 + dx} y="92" width="6" height="3" fill={accent} />
      <rect x={126 + dx} y="92" width="6" height="3" fill={accent} />
    </g>
  );
}

function Mage({ fill, accent, dx }: SilhProps) {
  return (
    <g>
      <path d="M100 46 L120 110 L80 110 Z" fill={fill} />
      <ellipse cx="100" cy="106" rx="20" ry="20" fill={fill} />
      <path
        d="M70 200 L78 124 Q100 116 122 124 L130 200 L114 210 L100 200 L86 210 Z"
        fill={fill}
      />
      <path d="M62 198 Q70 160 80 130 L84 200 Z" fill={fill} opacity="0.85" />
      <path
        d="M138 198 Q130 160 120 130 L116 200 Z"
        fill={fill}
        opacity="0.85"
      />
      <circle cx={100 + dx} cy="78" r="3.2" fill={accent} />
    </g>
  );
}

function Rogue({ fill, accent, dx }: SilhProps) {
  return (
    <g>
      <path
        d="M86 60 Q72 78 78 104 L92 116 L116 110 L120 88 Q116 64 100 56 Z"
        fill={fill}
      />
      <ellipse cx="106" cy="100" rx="14" ry="16" fill={fill} />
      <path
        d="M68 202 L72 128 Q98 118 132 128 L138 202 L118 210 L102 200 L84 210 Z"
        fill={fill}
      />
      <path d="M58 200 Q72 150 80 130 L84 200 Z" fill={fill} opacity="0.8" />
      <circle cx={92 + dx} cy="98" r="2" fill={accent} />
    </g>
  );
}

function Cleric({ fill, accent, dx }: SilhProps) {
  return (
    <g>
      <circle
        cx={100 + dx}
        cy="62"
        r="24"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        opacity="0.9"
      />
      <ellipse cx="100" cy="92" rx="22" ry="22" fill={fill} />
      <path
        d="M68 202 L74 124 Q100 114 126 124 L132 202 L114 212 L100 202 L86 212 Z"
        fill={fill}
      />
      <path d="M58 198 Q70 150 80 130 L84 200 Z" fill={fill} opacity="0.85" />
      <path
        d="M142 198 Q130 150 120 130 L116 200 Z"
        fill={fill}
        opacity="0.85"
      />
    </g>
  );
}

function Ranger({ fill, accent, dx }: SilhProps) {
  return (
    <g>
      <path
        d="M82 70 Q72 86 80 108 L92 118 L118 112 L122 90 Q118 70 100 62 Z"
        fill={fill}
      />
      <ellipse cx="104" cy="102" rx="14" ry="16" fill={fill} />
      <path
        d="M62 204 L70 128 Q100 116 134 128 L142 204 L120 212 L100 200 L82 212 Z"
        fill={fill}
      />
      <path d="M50 200 Q66 154 78 132 L82 204 Z" fill={fill} opacity="0.85" />
      <path
        d="M150 200 Q134 154 122 132 L118 204 Z"
        fill={fill}
        opacity="0.85"
      />
      <path
        d={`M${56 + dx} 100 Q ${70 + dx} 70 ${88 + dx} 60`}
        fill="none"
        stroke={accent}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1={56 + dx}
        y1="100"
        x2={88 + dx}
        y2="60"
        stroke={accent}
        strokeWidth="0.8"
        opacity="0.7"
      />
    </g>
  );
}

function DominantOverlay({
  dom,
  accent,
  seed,
}: {
  dom: StatKey;
  accent: string;
  seed: number;
}) {
  const dx = ((seed >> 17) % 9) - 4;
  if (dom === "hp") {
    return (
      <g transform={`translate(${dx} 0)`} opacity="0.5">
        <path
          d="M100 224 q-10 -8 -10 -16 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 q0 8 -10 16 z"
          transform="translate(-12 -10) scale(0.55)"
          fill={accent}
        />
      </g>
    );
  }
  if (dom === "attack") {
    return (
      <g transform={`translate(${dx} 0)`} opacity="0.55">
        <path
          d="M82 222 L100 196 L118 222"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (dom === "defense") {
    return (
      <g transform={`translate(${dx} 0)`} opacity="0.5">
        <path
          d="M88 210 L100 200 L112 210 L112 220 Q100 228 88 220 Z"
          fill={accent}
        />
      </g>
    );
  }
  return (
    <g transform={`translate(${dx} 0)`} opacity="0.55">
      <path
        d="M80 218 Q100 210 120 218"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M84 226 Q100 220 116 226"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}
