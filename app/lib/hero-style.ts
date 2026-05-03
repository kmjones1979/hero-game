import type { HeroEntry } from "./hooks/use-heroes";

export const STAT_MAX = 300;
export const LEGENDARY_STAT_MAX = 300; // shared across rarities for visual comparability

export type RarityKey = "common" | "rare" | "epic" | "legendary";

export const RARITY_KEYS: readonly RarityKey[] = [
  "common",
  "rare",
  "epic",
  "legendary",
] as const;

export function rarityKey(r: number): RarityKey {
  return RARITY_KEYS[r] ?? "common";
}

/**
 * Hex color associated with each rarity. Used for the soft halo behind the
 * hero portrait and the radial-gradient backdrop.
 */
export const RARITY_HALO: Record<RarityKey, string> = {
  common: "rgba(142,155,144,0.18)",
  rare: "rgba(147,192,164,0.22)",
  epic: "rgba(182,196,162,0.28)",
  legendary: "rgba(220,226,189,0.32)",
};

export type HeroStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};

export type StatKey = "hp" | "attack" | "defense" | "speed";

/** Map highest stat to an accent color used by HeroPortrait. */
export const STAT_ACCENT: Record<StatKey, string> = {
  hp: "var(--color-muted-teal)",
  attack: "var(--color-rust)",
  defense: "var(--color-dry-sage)",
  speed: "var(--color-beige)",
};

export const STAT_LABEL: Record<StatKey, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  speed: "SPD",
};

export const STAT_TOOLTIP: Record<StatKey, string> = {
  hp: "Hit points — how much damage your hero can absorb.",
  attack: "Attack — base damage dealt per strike.",
  defense: "Defense — reduces incoming damage.",
  speed: "Speed — turn order and dodge chance.",
};

export function dominantStat(stats: HeroStats): StatKey {
  const entries: [StatKey, number][] = [
    ["hp", stats.hp],
    ["attack", stats.attack],
    ["defense", stats.defense],
    ["speed", stats.speed],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function totalPower(stats: HeroStats): number {
  return stats.hp + stats.attack + stats.defense + stats.speed;
}

export function avgPower(heroes: readonly HeroEntry[]): number {
  if (heroes.length === 0) return 0;
  const sum = heroes.reduce((acc, h) => acc + totalPower(h.data), 0);
  return Math.round(sum / heroes.length);
}

export function highestRarity(heroes: readonly HeroEntry[]): number {
  return heroes.reduce((max, h) => Math.max(max, h.data.rarity), -1);
}

/**
 * Derive a small integer seed from the hero PDA address. Used purely for
 * visual variation in the procedural portrait — keeps each hero recognizable
 * without affecting on-chain stats.
 */
export function seedFromAddress(address: string): number {
  let h = 2166136261;
  for (let i = 0; i < address.length; i++) {
    h ^= address.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
