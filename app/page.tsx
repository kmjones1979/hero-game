"use client";

import { ClusterSelect } from "./components/cluster-select";
import { WalletButton } from "./components/wallet-button";
import { HeroMintCard } from "./components/hero-mint-card";
import { HeroCollection } from "./components/hero-collection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-ink text-beige">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #8e9b90, #93c0a4, #b6c4a2, #d4cdab, #dce2bd)",
        }}
      />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <h1
            className="font-serif text-2xl tracking-[0.3em] text-beige"
            style={{ fontFamily: "Georgia, serif" }}
          >
            HERO&nbsp;GAME
          </h1>
          <div className="flex items-center gap-3">
            <ClusterSelect />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-10 px-6 pb-24 pt-6">
          <HeroMintCard />
          <HeroCollection />
        </main>

        <footer className="mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-pearl-beige/40">
          On-chain heroes · Solana devnet · No metadata, no IPFS
        </footer>
      </div>
    </div>
  );
}
