"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useWallet } from "../lib/wallet/context";
import { useCluster } from "./cluster-context";
import { usePlayer } from "../lib/hooks/use-player";
import { useHeroes, type HeroEntry } from "../lib/hooks/use-heroes";
import { HeroCard } from "./hero-card";
import { CollectionStats } from "./collection-stats";
import { SortSelect, type SortKey } from "./sort-select";
import { SkeletonGrid } from "./skeleton-card";
import { EmptyState } from "./empty-state";
import { InlineAlert } from "./inline-alert";
import { HeroMintCard } from "./hero-mint-card";

export function HeroCollection() {
  const { wallet, status } = useWallet();
  const { getExplorerUrl } = useCluster();
  const owner = wallet?.account.address;
  const {
    heroesMinted,
    error: playerError,
    mutate: refreshPlayer,
  } = usePlayer(owner);
  const { heroes, isLoading, error, mutate } = useHeroes(owner, heroesMinted);

  const [sort, setSort] = useState<SortKey>("newest");

  const sorted = useMemo(() => sortHeroes(heroes, sort), [heroes, sort]);

  if (status !== "connected") return null;

  if (error || playerError) {
    return (
      <InlineAlert
        message="We couldn't load your collection from the network."
        onRetry={() => {
          void mutate();
          void refreshPlayer();
        }}
      />
    );
  }

  if (heroesMinted === null && isLoading) {
    return (
      <section>
        <CollectionHeader />
        <SkeletonGrid count={3} />
      </section>
    );
  }

  if (heroesMinted === null || heroesMinted === 0) {
    return <EmptyState action={<HeroMintCard variant="compact" />} />;
  }

  if (heroes.length === 0 && isLoading) {
    return (
      <section>
        <CollectionHeader />
        <SkeletonGrid count={Math.min(heroesMinted, 4)} />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col items-start justify-between gap-4 border-b border-ash-grey/20 pb-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-beige">
            Your Codex
          </h2>
          <CollectionStats heroes={heroes} />
        </div>
        <SortSelect value={sort} onChange={setSort} />
      </header>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {sorted.map((h) => (
          <HeroCard
            key={String(h.address)}
            hero={h}
            getExplorerUrl={getExplorerUrl}
          />
        ))}
      </motion.div>
    </section>
  );
}

function CollectionHeader() {
  return (
    <header className="mb-5 flex items-center justify-between border-b border-ash-grey/20 pb-4">
      <h2 className="font-display text-2xl font-semibold tracking-wide text-beige">
        Your Codex
      </h2>
    </header>
  );
}

function sortHeroes(heroes: readonly HeroEntry[], key: SortKey): HeroEntry[] {
  const arr = [...heroes];
  switch (key) {
    case "newest":
      arr.sort((a, b) => b.index - a.index);
      break;
    case "oldest":
      arr.sort((a, b) => a.index - b.index);
      break;
    case "rarest":
      arr.sort((a, b) => {
        if (b.data.rarity !== a.data.rarity)
          return b.data.rarity - a.data.rarity;
        return b.index - a.index;
      });
      break;
  }
  return arr;
}
