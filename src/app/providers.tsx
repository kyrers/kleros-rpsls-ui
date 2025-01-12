"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/wagmiConfig";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Wrap in <></> because https://github.com/vercel/next.js/discussions/64753 */}
          <>{children}</>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
