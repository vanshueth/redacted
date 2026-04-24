"use client";

import dynamic from "next/dynamic";

// WalletConnect + RainbowKit access browser-only APIs (indexedDB, document)
// at module load time — dynamic with ssr:false must live in a Client Component
const Providers = dynamic(
  () => import("./providers").then((m) => m.Providers),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
