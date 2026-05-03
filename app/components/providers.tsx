"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren } from "react";
import { ClusterProvider } from "./cluster-context";
import { WalletProvider } from "../lib/wallet/context";
import { SolanaClientProvider } from "../lib/solana-client-context";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <ClusterProvider>
        <SolanaClientProvider>
          <WalletProvider>{children}</WalletProvider>
        </SolanaClientProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(26, 29, 26, 0.96)",
              border: "1px solid rgba(142, 155, 144, 0.3)",
              color: "var(--color-beige)",
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
              backdropFilter: "blur(8px)",
            },
          }}
        />
      </ClusterProvider>
    </ThemeProvider>
  );
}
