"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { useWallet } from "../lib/wallet/context";
import { useBalance } from "../lib/hooks/use-balance";
import { lamportsToSolString } from "../lib/lamports";
import { ellipsify } from "../lib/explorer";
import { useCluster } from "./cluster-context";

export function WalletButton() {
  const { connectors, connect, disconnect, wallet, status, error } =
    useWallet();
  const { getExplorerUrl } = useCluster();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const address = wallet?.account.address;
  const balance = useBalance(address);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (status !== "connected") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border border-muted-teal/40 bg-muted-teal/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-beige transition-colors duration-200 hover:bg-muted-teal/20"
        >
          <Wallet size={14} className="text-muted-teal" />
          <span>Connect Wallet</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-ash-grey/30 bg-ink/95 p-2 shadow-xl backdrop-blur-md">
            <p className="px-2 pb-1.5 pt-1 text-[10px] font-sans uppercase tracking-[0.2em] text-pearl-beige/60">
              Choose a wallet
            </p>
            <div className="space-y-0.5">
              {connectors.length === 0 && (
                <p className="px-2 py-3 text-xs text-pearl-beige/60">
                  No wallets detected. Install Phantom, Backpack, or Solflare to
                  continue.
                </p>
              )}
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={async () => {
                    try {
                      await connect(connector.id);
                      setIsOpen(false);
                    } catch {
                      /* errors surfaced via context */
                    }
                  }}
                  disabled={status === "connecting"}
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm font-medium text-beige transition-colors duration-150 hover:bg-muted-teal/10 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {connector.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={connector.icon}
                      alt=""
                      className="h-5 w-5 rounded"
                    />
                  )}
                  <span>{connector.name}</span>
                </button>
              ))}
            </div>
            {status === "connecting" && (
              <p className="px-2 pt-2 text-xs text-pearl-beige/60">
                Connecting…
              </p>
            )}
            {error != null && (
              <p className="px-2 pt-2 text-xs text-rust">
                {error instanceof Error ? error.message : String(error)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-muted-teal/40 bg-muted-teal/10 px-3 py-1.5 text-xs font-medium tracking-wide text-beige transition-colors duration-200 hover:bg-muted-teal/20"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-muted-teal/60 pulse-dot" />
          <span className="relative h-2 w-2 rounded-full bg-muted-teal" />
        </span>
        <span className="font-mono tabular">{ellipsify(address!, 4)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-ash-grey/30 bg-ink/95 p-3 shadow-xl backdrop-blur-md">
          <div className="mb-3 px-1">
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-pearl-beige/60">
              Balance
            </p>
            <p className="font-display text-2xl font-semibold tabular text-beige">
              {balance.lamports != null
                ? lamportsToSolString(balance.lamports)
                : "—"}
              <span className="ml-1 text-xs font-sans font-normal tracking-wide text-pearl-beige/60">
                SOL
              </span>
            </p>
          </div>

          <div className="mb-3 rounded-md border border-ash-grey/20 bg-ink/60 px-2.5 py-2">
            <p className="break-all font-mono text-[11px] tabular text-pearl-beige">
              {address}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ash-grey/30 bg-ink/60 px-3 py-2 text-xs font-medium text-beige transition-colors duration-150 hover:bg-muted-teal/10"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-muted-teal" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} className="text-pearl-beige/70" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <a
              href={getExplorerUrl(`/address/${address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ash-grey/30 bg-ink/60 px-3 py-2 text-xs font-medium text-beige transition-colors duration-150 hover:bg-muted-teal/10"
            >
              <ExternalLink size={12} className="text-pearl-beige/70" />
              <span>Explorer</span>
            </a>
          </div>

          <button
            onClick={() => {
              disconnect();
              setIsOpen(false);
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-ash-grey/30 bg-ink/60 px-3 py-2 text-xs font-medium text-pearl-beige transition-colors duration-150 hover:border-rust/40 hover:text-rust"
          >
            <LogOut size={12} />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
