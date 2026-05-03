"use client";

import Link from "next/link";
import { useWallet } from "../lib/wallet/context";
import { usePlayer } from "../lib/hooks/use-player";
import { ClusterSelect } from "./cluster-select";
import { WalletButton } from "./wallet-button";
import { Logo } from "./logo";

export function Header() {
  const { wallet } = useWallet();
  const owner = wallet?.account.address;
  const { heroesMinted } = usePlayer(owner);

  return (
    <header className="sticky top-0 z-40 border-b border-ash-grey/20 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 text-beige"
        >
          <Logo className="text-muted-teal transition-colors duration-200 group-hover:text-beige" />
          <span className="font-display text-lg font-semibold uppercase tracking-[0.18em]">
            Hero&nbsp;Game
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {heroesMinted != null && heroesMinted > 0 && (
            <span className="hidden items-center rounded-full border border-ash-grey/30 bg-ink/60 px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.2em] text-pearl-beige/70 sm:inline-flex">
              <span className="tabular text-beige">{heroesMinted}</span>
              <span className="ml-1.5">heroes</span>
            </span>
          )}
          <ClusterSelect />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
