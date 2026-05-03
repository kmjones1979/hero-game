"use client";

import { useEffect } from "react";
import useSWR from "swr";
import type { Address } from "@solana/kit";
import { useCluster } from "../../components/cluster-context";
import { useSolanaClient } from "../solana-client-context";
import {
  fetchMaybePlayer,
  findPlayerPda,
  type Player,
} from "../../generated/hero_game";

export function usePlayer(owner: Address | undefined) {
  const { cluster } = useCluster();
  const client = useSolanaClient();

  const { data, isLoading, error, mutate } = useSWR(
    owner ? (["player", cluster, owner] as const) : null,
    async ([, , addr]) => {
      const [pda] = await findPlayerPda({ user: addr });
      const account = await fetchMaybePlayer(client.rpc, pda);
      return {
        address: pda,
        exists: account.exists,
        data: account.exists ? (account.data as Player) : null,
      };
    },
    { refreshInterval: 30_000, revalidateOnFocus: true },
  );

  useEffect(() => {
    if (!data?.address) return;
    const ac = new AbortController();
    (async () => {
      try {
        const notifications = await client.rpcSubscriptions
          .accountNotifications(data.address, { commitment: "confirmed" })
          .subscribe({ abortSignal: ac.signal });
        for await (const _n of notifications) {
          void _n;
          await mutate();
        }
      } catch {
        // fall back to polling
      }
    })();
    return () => ac.abort();
  }, [data?.address, client, mutate]);

  return {
    address: data?.address ?? null,
    player: data?.data ?? null,
    heroesMinted: data?.data ? Number(data.data.heroesMinted) : null,
    isLoading,
    error,
    mutate,
  };
}
