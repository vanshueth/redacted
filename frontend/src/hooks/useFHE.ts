/**
 * useFHE — Wraps the @cofhe/sdk client for FHE encryption and decryption.
 *
 * Plain-English summary:
 *  - Initializes the FHE co-processor client when the wallet connects
 *  - encryptPair(high, low): takes two bigint values and FHE-encrypts them,
 *    returning objects you can pass directly to the smart contract
 *  - decryptHandle(handle): takes a bytes32 handle from the contract and
 *    returns the decrypted bigint value
 *
 * NOTE: If @cofhe/sdk's exact API differs from what's shown here, the
 * comments explain what each call is doing so you can adapt it easily.
 * The Fhenix docs are at: https://cofhe-docs.fhenix.zone
 */

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { FheStatus } from "../types";

// We import the FHE SDK types. The actual SDK is loaded lazily to avoid
// crashing if it needs special browser initialisation.
type CofheClient = {
  connect: (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) => Promise<void>;
  encryptInputs: (inputs: unknown[]) => { execute: () => Promise<unknown[]> };
  decryptForView: (handle: string, type: unknown) => { withPermit: () => { execute: () => Promise<bigint> } };
};

let Encryptable: { uint128: (v: bigint) => unknown } | null = null;
let FheTypes: { Uint128: unknown } | null = null;
let createCofheClient: ((config: unknown) => CofheClient) | null = null;
let createCofheConfig: ((opts: unknown) => unknown) | null = null;

// Lazy-load the SDK to handle browser environment quirks
async function loadSdk() {
  if (createCofheClient) return; // already loaded
  try {
    const sdkWeb = await import("@cofhe/sdk/web");
    const sdkCore = await import("@cofhe/sdk");
    createCofheClient = sdkWeb.createCofheClient as typeof createCofheClient;
    createCofheConfig = sdkWeb.createCofheConfig as typeof createCofheConfig;
    Encryptable = sdkCore.Encryptable as typeof Encryptable;
    FheTypes = sdkCore.FheTypes as typeof FheTypes;
  } catch {
    throw new Error(
      "Failed to load @cofhe/sdk. Make sure you ran: npm install in the frontend folder."
    );
  }
}

export function useFHE() {
  const [client, setClient] = useState<CofheClient | null>(null);
  const [status, setStatus] = useState<FheStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize the FHE client. Call this right after the wallet connects.
   * This contacts the FHE co-processor so it knows which network we're on.
   */
  const initialize = useCallback(
    async (
      provider: ethers.BrowserProvider,
      signer: ethers.JsonRpcSigner,
      network: string = "arb-sepolia"
    ) => {
      setStatus("initializing");
      setError(null);
      try {
        await loadSdk();

        // Create the configuration pointing at the correct FHE co-processor
        const config = createCofheConfig!({ network });
        const cofheClient = createCofheClient!(config);

        // Connect the client to the user's wallet provider
        // The SDK uses this to sign permit messages when decrypting
        await cofheClient.connect(provider, signer);

        setClient(cofheClient);
        setStatus("ready");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "FHE init failed";
        setError(msg);
        setStatus("error");
      }
    },
    []
  );

  /**
   * FHE-encrypt two uint128 values in a single call.
   * Returns a pair of encrypted input objects ready to pass to the contract.
   *
   * Usage:
   *   const [encHigh, encLow] = await encryptPair(xorEncHigh, xorEncLow);
   *   await contract.addPassword(site, encHigh, encLow, ...);
   */
  const encryptPair = useCallback(
    async (high: bigint, low: bigint): Promise<[unknown, unknown]> => {
      if (!client || !Encryptable) throw new Error("FHE client not ready");

      const results = await client
        .encryptInputs([Encryptable.uint128(high), Encryptable.uint128(low)])
        .execute();

      return [results[0], results[1]];
    },
    [client]
  );

  /**
   * FHE-decrypt a single bytes32 handle returned by the contract.
   * The SDK handles getting a permit (user may need to sign a message once).
   *
   * Returns the decrypted value as a BigInt.
   */
  const decryptHandle = useCallback(
    async (handle: string): Promise<bigint> => {
      if (!client || !FheTypes) throw new Error("FHE client not ready");

      const result = await client
        .decryptForView(handle, FheTypes.Uint128)
        .withPermit()
        .execute();

      return result;
    },
    [client]
  );

  return {
    status,
    error,
    isReady: status === "ready",
    initialize,
    encryptPair,
    decryptHandle,
  };
}
