import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { deriveXorKey, computePasskeyHash, splitKey } from "../utils/crypto";
import { PASSWORD_MANAGER_ABI } from "../utils/contractABI";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { buildReadContract, waitForTx } from "../utils/provider";

// One contract instance for reads — no polling, no VoidSigner
const readContract = buildReadContract(PASSWORD_MANAGER_ABI as unknown[], CONTRACT_ADDRESS);

interface PasskeyState {
  hasPasskeyOnChain: boolean | null;
  keyHigh: bigint | null;
  keyLow: bigint | null;
  isLoading: boolean;
  error: string | null;
}

export function usePasskey(signer: ethers.Signer | null) {
  const [state, setState] = useState<PasskeyState>({
    hasPasskeyOnChain: null,
    keyHigh: null,
    keyLow: null,
    isLoading: false,
    error: null,
  });

  const getWriteContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(CONTRACT_ADDRESS, PASSWORD_MANAGER_ABI, signer);
  }, [signer]);

  /** Check if this wallet has already set a passkey on-chain. */
  const checkPasskeyOnChain = useCallback(async () => {
    if (!signer) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const from = await signer.getAddress();
      // { from } sets msg.sender in eth_call — one request, no eth_blockNumber
      const hasPasskey: boolean = await readContract.hasPasskey({ from });
      setState((s) => ({ ...s, hasPasskeyOnChain: hasPasskey, isLoading: false }));
      return hasPasskey;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to check passkey";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      return false;
    }
  }, [signer]);

  /** First-time setup: derive key, store only the hash on-chain. */
  const setupPasskey = useCallback(
    async (passkey: string) => {
      if (!signer) return false;
      if (passkey.length < 6) {
        setState((s) => ({ ...s, error: "Passkey must be at least 6 characters" }));
        return false;
      }
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const xorKey = await deriveXorKey(signer, passkey);
        const hash = computePasskeyHash(xorKey);
        const { keyHigh, keyLow } = splitKey(xorKey);

        const tx = await getWriteContract().setPasskeyHash(hash);
        await waitForTx(tx.hash);

        setState({ hasPasskeyOnChain: true, keyHigh, keyLow, isLoading: false, error: null });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to set passkey";
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        return false;
      }
    },
    [signer, getWriteContract]
  );

  /** Returning user: verify passkey, unlock if correct. */
  const verifyAndUnlock = useCallback(
    async (passkey: string) => {
      if (!signer) return false;
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const xorKey = await deriveXorKey(signer, passkey);
        const hash = computePasskeyHash(xorKey);
        const { keyHigh, keyLow } = splitKey(xorKey);

        const from = await signer.getAddress();
        const isValid: boolean = await readContract.verifyPasskey(hash, { from });

        if (!isValid) {
          setState((s) => ({ ...s, isLoading: false, error: "Wrong passkey. Please try again." }));
          return false;
        }
        setState({ hasPasskeyOnChain: true, keyHigh, keyLow, isLoading: false, error: null });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to verify passkey";
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        return false;
      }
    },
    [signer]
  );

  const lock = useCallback(() => {
    setState((s) => ({ ...s, keyHigh: null, keyLow: null }));
  }, []);

  return {
    ...state,
    isUnlocked: state.keyHigh !== null && state.keyLow !== null,
    checkPasskeyOnChain,
    setupPasskey,
    verifyAndUnlock,
    lock,
  };
}
