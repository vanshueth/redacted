import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { encryptString, decryptString } from "../utils/crypto";
import { PASSWORD_MANAGER_ABI } from "../utils/contractABI";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { buildReadContract, waitForTx } from "../utils/provider";
import type { PasswordEntry } from "../types";
import type { useFHE } from "./useFHE";

type FHEHook = ReturnType<typeof useFHE>;

// One shared read contract — no VoidSigner, no background polling
const readContract = buildReadContract(PASSWORD_MANAGER_ABI as unknown[], CONTRACT_ADDRESS);

export function usePasswords(
  signer: ethers.Signer | null,
  keyHigh: bigint | null,
  keyLow: bigint | null,
  fhe: FHEHook
) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWriteContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(CONTRACT_ADDRESS, PASSWORD_MANAGER_ABI, signer);
  }, [signer]);

  /** Fetch all site names — fast, no decryption, one eth_call. */
  const loadPasswords = useCallback(async () => {
    if (!signer) return;
    setIsLoading(true);
    setError(null);
    try {
      const from = await signer.getAddress();
      const sites: string[] = await readContract.getAllSites({ from });
      setPasswords(
        sites.map((site, index) => ({ index, site, isRevealed: false, isDecrypting: false }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load passwords");
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  /** XOR-encrypt → FHE-encrypt → send transaction. */
  const addPassword = useCallback(
    async (site: string, username: string, password: string) => {
      if (!signer || keyHigh === null || keyLow === null) return false;
      if (!fhe.isReady) { setError("FHE client not ready yet."); return false; }

      setIsLoading(true);
      setError(null);
      try {
        const { encHigh: uH, encLow: uL } = encryptString(username, keyHigh, keyLow);
        const { encHigh: pH, encLow: pL } = encryptString(password, keyHigh, keyLow);

        const [fheUH, fheUL] = await fhe.encryptPair(uH, uL);
        const [feePH, fhePL] = await fhe.encryptPair(pH, pL);

        const tx = await getWriteContract().addPassword(site, fheUH, fheUL, feePH, fhePL);
        await waitForTx(tx.hash);

        await loadPasswords();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add password");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, keyHigh, keyLow, fhe, getWriteContract, loadPasswords]
  );

  /** Delete entry, reload list. */
  const deletePassword = useCallback(
    async (index: number) => {
      if (!signer) return false;
      setIsLoading(true);
      setError(null);
      try {
        const tx = await getWriteContract().deletePassword(index);
        await waitForTx(tx.hash);
        await loadPasswords();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete password");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, getWriteContract, loadPasswords]
  );

  /** FHE-decrypt handles → XOR-decrypt → show plaintext. */
  const revealPassword = useCallback(
    async (index: number) => {
      if (!signer || keyHigh === null || keyLow === null) return;
      if (!fhe.isReady) { setError("FHE client not ready."); return; }

      setPasswords((prev) =>
        prev.map((p) => (p.index === index ? { ...p, isDecrypting: true } : p))
      );
      try {
        const from = await signer.getAddress();
        const [, uH, uL, pH, pL] = await readContract.getPassword(index, { from });

        const [euH, euL, epH, epL] = await Promise.all([
          fhe.decryptHandle(uH),
          fhe.decryptHandle(uL),
          fhe.decryptHandle(pH),
          fhe.decryptHandle(pL),
        ]);

        const username = decryptString(euH, euL, keyHigh, keyLow);
        const password = decryptString(epH, epL, keyHigh, keyLow);

        setPasswords((prev) =>
          prev.map((p) =>
            p.index === index
              ? { ...p, username, password, isRevealed: true, isDecrypting: false }
              : p
          )
        );
      } catch (err) {
        setPasswords((prev) =>
          prev.map((p) => (p.index === index ? { ...p, isDecrypting: false } : p))
        );
        setError(err instanceof Error ? err.message : "Failed to decrypt password");
      }
    },
    [signer, keyHigh, keyLow, fhe]
  );

  const hidePassword = useCallback((index: number) => {
    setPasswords((prev) =>
      prev.map((p) =>
        p.index === index
          ? { ...p, username: undefined, password: undefined, isRevealed: false }
          : p
      )
    );
  }, []);

  return {
    passwords,
    isLoading,
    error,
    loadPasswords,
    addPassword,
    deletePassword,
    revealPassword,
    hidePassword,
    clearError: () => setError(null),
  };
}
