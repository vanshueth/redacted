"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useVaultStore } from "@/lib/store";
import type { CofheClient } from "@cofhe/sdk";

let _cofheClient: CofheClient | null = null;

async function getOrCreateCofheClient() {
  if (_cofheClient) return _cofheClient;
  const { createCofheClient, createCofheConfig } = await import("@cofhe/sdk/web");
  const { sepolia } = await import("@cofhe/sdk/chains");
  _cofheClient = createCofheClient(createCofheConfig({ supportedChains: [sepolia] }));
  return _cofheClient;
}

const noopSubscribe = () => () => {};

export function useCofhe() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { cofheClient, setCofheClient } = useVaultStore();
  const connectingRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !publicClient || !walletClient || connectingRef.current) return;
    connectingRef.current = true;

    getOrCreateCofheClient()
      .then((client) =>
        client.connect(publicClient as never, walletClient as never).then(() => setCofheClient(client))
      )
      .catch(console.error)
      .finally(() => { connectingRef.current = false; });
  }, [isConnected, publicClient, walletClient, setCofheClient]);

  const fheConnected = useSyncExternalStore(
    cofheClient ? (cb) => cofheClient.subscribe(cb as never) : noopSubscribe,
    () => cofheClient?.connected ?? false,
    () => false,
  );

  return { isCofheConnected: fheConnected };
}
