"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useWallet } from "../lib/wallet/context";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { useCluster } from "./cluster-context";
import { usePlayer } from "../lib/hooks/use-player";
import { useHeroes } from "../lib/hooks/use-heroes";
import { findHeroPda } from "../lib/hero-pda";
import { getMintHeroInstructionAsync } from "../generated/hero_game";
import { parseTransactionError } from "../lib/errors";

export function HeroMintCard() {
  const { wallet, signer, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { getExplorerUrl } = useCluster();
  const owner = wallet?.account.address;
  const { heroesMinted, isLoading: playerLoading, mutate: refreshPlayer } =
    usePlayer(owner);
  const { mutate: refreshHeroes } = useHeroes(owner, heroesMinted);
  const [lastSig, setLastSig] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleMint = useCallback(async () => {
    if (!signer || !owner) return;

    setLastError(null);
    try {
      const nextIndex = BigInt(heroesMinted ?? 0);
      const [heroPda] = await findHeroPda(owner, nextIndex);

      const clientSeed = BigInt(Math.floor(Math.random() * 2 ** 53));

      const ix = await getMintHeroInstructionAsync({
        user: signer,
        hero: heroPda,
        clientSeed,
      });

      const sig = await send({ instructions: [ix] });
      setLastSig(sig);

      toast.success("Hero minted", {
        description: (
          <a
            href={getExplorerUrl(`/tx/${sig}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-teal underline"
          >
            View transaction
          </a>
        ),
      });

      await Promise.all([refreshPlayer(), refreshHeroes()]);
    } catch (err) {
      console.error("Mint failed:", err);
      if (err instanceof Error) {
        console.error("Error name:", err.name, "message:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
      }
      const msg = parseTransactionError(err);
      setLastError(msg);
      toast.error(msg);
    }
  }, [
    signer,
    owner,
    heroesMinted,
    send,
    getExplorerUrl,
    refreshPlayer,
    refreshHeroes,
  ]);

  const connected = status === "connected" && !!signer;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-ash-grey/30 bg-[rgba(35,39,35,0.5)] p-8 backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #8e9b90, #93c0a4, #b6c4a2, #d4cdab, #dce2bd)",
        }}
      />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="space-y-1">
          <h2
            className="font-serif text-3xl tracking-[0.2em] text-beige"
            style={{ fontFamily: "Georgia, serif" }}
          >
            FORGE A HERO
          </h2>
          <p className="text-sm text-pearl-beige/70">
            Each mint stores stats fully on-chain in a PDA. No metadata, no IPFS.
          </p>
        </div>

        <button
          onClick={handleMint}
          disabled={!connected || isSending}
          className="rounded-lg bg-muted-teal px-8 py-3 text-base font-medium text-ink transition hover:bg-dry-sage disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? "Forging..." : "⚔ Mint Hero"}
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-pearl-beige/70">
          <span>Heroes minted</span>
          <span className="font-mono text-base text-beige">
            {!connected
              ? "—"
              : playerLoading && heroesMinted == null
                ? "…"
                : (heroesMinted ?? 0)}
          </span>
        </div>

        {lastSig && !lastError && (
          <a
            href={getExplorerUrl(`/tx/${lastSig}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-teal underline underline-offset-4"
          >
            Last tx: {lastSig.slice(0, 8)}…{lastSig.slice(-8)}
          </a>
        )}

        {lastError && (
          <div className="rounded-lg border border-ash-grey/40 bg-ink/60 px-4 py-2 text-xs text-pearl-beige">
            {lastError}
          </div>
        )}
      </div>
    </section>
  );
}
