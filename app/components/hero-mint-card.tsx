"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { useWallet } from "../lib/wallet/context";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { useCluster } from "./cluster-context";
import { usePlayer } from "../lib/hooks/use-player";
import { useHeroes, type HeroEntry } from "../lib/hooks/use-heroes";
import { findHeroPda } from "../lib/hero-pda";
import {
  fetchMaybeHero,
  getMintHeroInstructionAsync,
  type Hero,
} from "../generated/hero_game";
import { useSolanaClient } from "../lib/solana-client-context";
import { parseTransactionError } from "../lib/errors";
import { rarityLabel } from "../lib/hero-pda";
import { MintReveal } from "./mint-reveal";

type Phase = "idle" | "signing" | "confirming" | "revealing";

const SIGNING_DELAY_MS = 1500;

type Props = {
  variant?: "primary" | "compact";
};

export function HeroMintCard({ variant = "primary" }: Props) {
  const { wallet, signer, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const client = useSolanaClient();
  const { getExplorerUrl } = useCluster();
  const owner = wallet?.account.address;
  const { heroesMinted, mutate: refreshPlayer } = usePlayer(owner);
  const { mutate: refreshHeroes } = useHeroes(owner, heroesMinted);

  const [phase, setPhase] = useState<Phase>("idle");
  const [revealHero, setRevealHero] = useState<HeroEntry | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    };
  }, []);

  const handleMint = useCallback(async () => {
    if (!signer || !owner || isSending) return;

    setPhase("signing");
    if (phaseTimer.current) clearTimeout(phaseTimer.current);
    phaseTimer.current = setTimeout(() => {
      setPhase((p) => (p === "signing" ? "confirming" : p));
    }, SIGNING_DELAY_MS);

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

      const account = await fetchMaybeHero(client.rpc, heroPda);
      if (account.exists) {
        const entry: HeroEntry = {
          address: heroPda,
          index: Number(nextIndex),
          data: account.data as Hero,
        };
        setRevealHero(entry);
        setPhase("revealing");

        toast.success(`Hero #${entry.index} joined your collection`, {
          description: rarityLabel(entry.data.rarity),
          action: {
            label: "View tx",
            onClick: () => window.open(getExplorerUrl(`/tx/${sig}`), "_blank"),
          },
        });
      } else {
        setPhase("idle");
        toast.error("Could not load the new hero. Refresh to see it.");
      }

      await Promise.all([refreshPlayer(), refreshHeroes()]);
    } catch (err) {
      console.error("Mint failed:", err);
      const msg = parseTransactionError(err);
      toast.error(msg);
      setPhase("idle");
    } finally {
      if (phaseTimer.current) {
        clearTimeout(phaseTimer.current);
        phaseTimer.current = null;
      }
    }
  }, [
    signer,
    owner,
    heroesMinted,
    send,
    isSending,
    client,
    getExplorerUrl,
    refreshPlayer,
    refreshHeroes,
  ]);

  const connected = status === "connected" && !!signer;
  const busy = phase === "signing" || phase === "confirming";

  if (variant === "compact") {
    return (
      <>
        <MintButton
          phase={phase}
          disabled={!connected || busy}
          onClick={handleMint}
        />
        <AnimatePresence>
          {revealHero && phase === "revealing" && (
            <MintReveal
              hero={revealHero}
              onClose={() => {
                setRevealHero(null);
                setPhase("idle");
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-ash-grey/30 bg-ink/50 p-8 backdrop-blur-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(147,192,164,0.4), transparent 60%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-5 text-center">
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.18em] text-beige md:text-4xl">
              Forge a Hero
            </h2>
            <p className="font-sans text-sm text-pearl-beige/60">
              Each mint stores stats fully on-chain in a PDA. No metadata, no
              IPFS.
            </p>
          </div>

          <MintButton
            phase={phase}
            disabled={!connected || busy}
            onClick={handleMint}
          />

          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-pearl-beige/50">
            {!connected
              ? "Connect a wallet to begin"
              : "Costs ~0.002 SOL · Rarity is rolled by the program"}
          </p>
        </div>
      </section>

      <AnimatePresence>
        {revealHero && phase === "revealing" && (
          <MintReveal
            hero={revealHero}
            onClose={() => {
              setRevealHero(null);
              setPhase("idle");
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MintButton({
  phase,
  disabled,
  onClick,
}: {
  phase: Phase;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md border px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-200",
        "border-muted-teal/50 bg-muted-teal/10 text-beige",
        "hover:bg-muted-teal/20 hover:border-muted-teal/70",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      {phase === "idle" && (
        <>
          <Sparkles
            size={14}
            className="text-muted-teal transition-transform duration-200 group-hover:rotate-12"
          />
          <span>Summon a Hero</span>
        </>
      )}
      {phase === "signing" && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-muted-teal/60 pulse-dot" />
            <span className="relative h-2 w-2 rounded-full bg-muted-teal" />
          </span>
          <span>Awaiting signature…</span>
        </>
      )}
      {phase === "confirming" && (
        <>
          <Spinner />
          <span>Forging…</span>
        </>
      )}
      {phase === "revealing" && (
        <>
          <Sparkles size={14} className="text-muted-teal" />
          <span>Revealing…</span>
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx="7"
        cy="7"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path
        d="M12 7 A5 5 0 0 0 7 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
