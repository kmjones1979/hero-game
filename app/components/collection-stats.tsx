import { Sparkles } from "lucide-react";
import { rarityLabel } from "../lib/hero-pda";
import {
  avgPower,
  highestRarity,
  type RarityKey,
  rarityKey,
} from "../lib/hero-style";
import type { HeroEntry } from "../lib/hooks/use-heroes";

const RARITY_DOT: Record<RarityKey, string> = {
  common: "bg-ash-grey",
  rare: "bg-muted-teal",
  epic: "bg-dry-sage",
  legendary: "bg-pearl-beige",
};

export function CollectionStats({ heroes }: { heroes: readonly HeroEntry[] }) {
  const total = heroes.length;
  const rarestIdx = highestRarity(heroes);
  const rk: RarityKey = rarestIdx >= 0 ? rarityKey(rarestIdx) : "common";
  const power = avgPower(heroes);

  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-pearl-beige/60">
      <Stat label="Total" value={String(total)} />
      <Divider />
      <Stat
        label="Rarest"
        value={
          rarestIdx >= 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${RARITY_DOT[rk]}`}
                aria-hidden
              />
              {rarityLabel(rarestIdx)}
            </span>
          ) : (
            "—"
          )
        }
      />
      <Divider />
      <Stat
        label="Avg Power"
        value={
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={11} className="text-muted-teal" aria-hidden />
            <span className="tabular">{power || "—"}</span>
          </span>
        }
      />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-[10px] uppercase tracking-[0.2em]">{label}</dt>
      <dd className="font-sans text-xs text-beige">{value}</dd>
    </div>
  );
}

function Divider() {
  return (
    <span aria-hidden className="hidden h-3 w-px bg-ash-grey/30 sm:inline" />
  );
}
