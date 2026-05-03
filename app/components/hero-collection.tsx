"use client";

import { useWallet } from "../lib/wallet/context";
import { useCluster } from "./cluster-context";
import { usePlayer } from "../lib/hooks/use-player";
import { useHeroes, type HeroEntry } from "../lib/hooks/use-heroes";
import { classEmoji, classLabel, rarityLabel } from "../lib/hero-pda";

const RARITY_STYLES = [
  { border: "border-ash-grey", thickness: "border", glow: "" },
  {
    border: "border-muted-teal",
    thickness: "border",
    glow: "shadow-[0_0_24px_-4px_rgba(147,192,164,0.45)]",
  },
  {
    border: "border-dry-sage",
    thickness: "border-2",
    glow: "shadow-[0_0_28px_-4px_rgba(182,196,162,0.55)]",
  },
  {
    border: "border-pearl-beige",
    thickness: "border-2",
    glow: "shadow-[0_0_36px_-4px_rgba(212,205,171,0.65)]",
  },
] as const;

function formatRelative(unixSeconds: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const then = Number(unixSeconds);
  const diff = Math.max(0, now - then);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STAT_MAX = 300;

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.round((value / STAT_MAX) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-9 text-pearl-beige/70 uppercase tracking-wider">
        {label}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ash-grey/30">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-muted-teal"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right font-mono tabular-nums text-beige">
        {value}
      </span>
    </div>
  );
}

function HeroCard({ hero, getExplorerUrl }: {
  hero: HeroEntry;
  getExplorerUrl: (path: string) => string;
}) {
  const { data, address, index } = hero;
  const rarityStyle = RARITY_STYLES[data.rarity] ?? RARITY_STYLES[0];
  const isLegendary = data.rarity === 3;

  return (
    <div className="relative">
      {isLegendary && (
        <div
          aria-hidden="true"
          className="legendary-ring absolute -inset-[2px] rounded-2xl"
        />
      )}
      <div
        className={`relative overflow-hidden rounded-2xl bg-[rgba(35,39,35,0.85)] p-5 backdrop-blur-sm ${rarityStyle.thickness} ${rarityStyle.border} ${rarityStyle.glow}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{classEmoji(data.class)}</span>
              <span
                className="font-serif text-lg tracking-wide text-beige"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {classLabel(data.class)}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-pearl-beige/70">
              #{index} · {rarityLabel(data.rarity)}
            </p>
          </div>
          <a
            href={getExplorerUrl(`/address/${address}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-pearl-beige/60 underline underline-offset-2 hover:text-muted-teal"
          >
            {String(address).slice(0, 4)}…{String(address).slice(-4)}
          </a>
        </div>

        <div className="mt-4 space-y-1.5">
          <StatBar label="HP" value={data.hp} />
          <StatBar label="ATK" value={data.attack} />
          <StatBar label="DEF" value={data.defense} />
          <StatBar label="SPD" value={data.speed} />
        </div>

        <p className="mt-4 text-[10px] text-pearl-beige/70">
          Forged {formatRelative(data.mintedAt)}
        </p>
      </div>
    </div>
  );
}

export function HeroCollection() {
  const { wallet, status } = useWallet();
  const { getExplorerUrl } = useCluster();
  const owner = wallet?.account.address;
  const { heroesMinted } = usePlayer(owner);
  const { heroes, isLoading } = useHeroes(owner, heroesMinted);

  if (status !== "connected") return null;

  if (heroesMinted === null || heroesMinted === 0) {
    return (
      <div className="rounded-2xl border border-ash-grey/20 bg-[rgba(35,39,35,0.4)] p-12 text-center">
        <p className="text-beige/60">
          {isLoading
            ? "Reading your codex..."
            : "Mint your first hero to start your collection"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3
        className="mb-4 font-serif text-xl tracking-[0.15em] text-beige"
        style={{ fontFamily: "Georgia, serif" }}
      >
        YOUR CODEX
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {heroes.map((h) => (
          <HeroCard
            key={String(h.address)}
            hero={h}
            getExplorerUrl={getExplorerUrl}
          />
        ))}
      </div>
    </div>
  );
}
