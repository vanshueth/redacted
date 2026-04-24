"use client";

import { useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useVaultStore, type VaultEntry } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";

export function useHydrateVault() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { setEntries } = useVaultStore();

  useEffect(() => {
    if (!isConnected || !address || !publicClient) return;

    async function load() {
      try {
        const rawLabels = await publicClient!.readContract({
          address: CONTRACT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "getAllLabels",
          account: address,
        }) as string[];

        // Deduplicate in case of stale on-chain state
        const labels = [...new Set(rawLabels)];

        const entries = await Promise.all(
          labels.map(async (label): Promise<VaultEntry> => {
            const result = await publicClient!.readContract({
              address: CONTRACT_ADDRESS,
              abi: VAULT_ABI,
              functionName: "getPassword",
              args: [label],
              account: address,
            }) as { username: string; notes: string } | readonly [readonly bigint[], string, string];

            const username = Array.isArray(result)
              ? (result as readonly [readonly bigint[], string, string])[1]
              : (result as { username: string }).username;
            const notes = Array.isArray(result)
              ? (result as readonly [readonly bigint[], string, string])[2]
              : (result as { notes: string }).notes;

            return { label, username, notes, isRevealed: false, isDecrypting: false };
          })
        );

        setEntries(entries);
      } catch (err) {
        console.error("Failed to hydrate vault:", err);
      }
    }

    load();
  }, [address, isConnected, publicClient, setEntries]);
}
