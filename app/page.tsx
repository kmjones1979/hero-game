"use client";

import { motion } from "motion/react";
import { useWallet } from "./lib/wallet/context";
import { Background } from "./components/background";
import { Header } from "./components/header";
import { HeroMintCard } from "./components/hero-mint-card";
import { HeroCollection } from "./components/hero-collection";
import { EmptyState } from "./components/empty-state";

export default function Home() {
  const { status } = useWallet();
  const connected = status === "connected";

  return (
    <div className="relative min-h-screen text-beige">
      <Background />

      <div className="relative">
        <Header />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl space-y-12 px-6 pb-24 pt-12"
        >
          {!connected ? (
            <DisconnectedHero />
          ) : (
            <>
              <HeroMintCard />
              <HeroCollection />
            </>
          )}
        </motion.main>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-center font-sans text-[10px] uppercase tracking-[0.25em] text-pearl-beige/40">
          On-chain heroes · Solana devnet · No metadata, no IPFS
        </footer>
      </div>
    </div>
  );
}

function DisconnectedHero() {
  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-2xl pt-8 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-muted-teal">
          Solana · Anchor · Fully on-chain
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold uppercase tracking-[0.15em] text-beige md:text-5xl">
          Hero Game
        </h1>
        <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-pearl-beige/70">
          Roll a roster of heroes whose stats and class live entirely in
          program-derived accounts. Connect a wallet to mint your first.
        </p>
      </section>

      <EmptyState />
    </div>
  );
}
