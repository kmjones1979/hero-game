"use client";

import useSWR from "swr";
import type { Address } from "@solana/kit";
import { useCluster } from "../../components/cluster-context";
import { useSolanaClient } from "../solana-client-context";
import { fetchAllMaybeHero, type Hero } from "../../generated/hero_game";
import { findHeroPda } from "../hero-pda";

export type HeroEntry = {
  address: Address;
  index: number;
  data: Hero;
};

export function useHeroes(owner: Address | undefined, count: number | null) {
  const { cluster } = useCluster();
  const client = useSolanaClient();

  const key =
    owner && count != null && count > 0
      ? (["heroes", cluster, owner, count] as const)
      : null;

  const { data, isLoading, error, mutate } = useSWR(
    key,
    async ([, , addr, n]) => {
      const indices = Array.from({ length: n }, (_, i) => BigInt(i));
      const pdas = await Promise.all(indices.map((i) => findHeroPda(addr, i)));
      const addresses = pdas.map(([a]) => a);
      const accounts = await fetchAllMaybeHero(client.rpc, addresses);
      const heroes: HeroEntry[] = [];
      accounts.forEach((acc, i) => {
        if (acc.exists) {
          heroes.push({
            address: addresses[i],
            index: Number(indices[i]),
            data: acc.data as Hero,
          });
        }
      });
      heroes.sort((a, b) => b.index - a.index);
      return heroes;
    },
    { refreshInterval: 60_000, revalidateOnFocus: true }
  );

  return {
    heroes: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
