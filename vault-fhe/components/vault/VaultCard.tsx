"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { FheTypes } from "@cofhe/sdk";
import { useVaultStore, type VaultEntry } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";
import { EncryptedBadge, ExposedBadge } from "@/components/ui/Badges";
import { CipherHandle } from "@/components/ui/CipherHandle";

interface Props {
  entry: VaultEntry;
  index: number;
}

const FAKE_HANDLES = [
  "euint256: 0x7f3a...b91c",
  "euint256: 0x4f82...3e10",
  "euint256: 0xce91...47a2",
  "euint256: 0x1b3f...8920",
];

const AUTO_CLEAR_SECONDS = 30;

export function VaultCard({ entry, index }: Props) {
  const [copied, setCopied] = useState<"username" | "password" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_CLEAR_SECONDS);
  const { cofheClient, updateEntry, removeEntry } = useVaultStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const handle = FAKE_HANDLES[index % FAKE_HANDLES.length];
  const fileRef = `RDC-${String(index + 1).padStart(4, "0")}`;

  /* Auto-clear countdown after reveal */
  useEffect(() => {
    if (!entry.isRevealed) {
      setCountdown(AUTO_CLEAR_SECONDS);
      return;
    }
    if (countdown <= 0) {
      updateEntry(entry.label, { password: undefined, isRevealed: false });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [entry.isRevealed, countdown]);

  const copy = async (text: string, field: "username" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const reveal = async () => {
    if (!cofheClient || !address || !publicClient) return;
    updateEntry(entry.label, { isDecrypting: true });
    try {
      await cofheClient.permits.getOrCreateSelfPermit();
      const result = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getPassword",
        args: [entry.label],
        account: address,
      })) as { ciphertext: readonly bigint[] } | readonly [readonly bigint[], string, string];

      const handles = Array.isArray(result)
        ? (result as readonly [readonly bigint[], string, string])[0]
        : (result as { ciphertext: readonly bigint[] }).ciphertext;

      const bytes = await Promise.all(
        handles.map((h) =>
          cofheClient.decryptForView(h, FheTypes.Uint8).withPermit().execute()
        )
      );
      const password = String.fromCharCode(...bytes.map(Number));
      updateEntry(entry.label, { password, isRevealed: true, isDecrypting: false });
      setCountdown(AUTO_CLEAR_SECONDS);
    } catch (err) {
      updateEntry(entry.label, { isDecrypting: false });
      toast.error("Failed to decrypt — check wallet signature");
      console.error(err);
    }
  };

  const hide = () => {
    updateEntry(entry.label, { password: undefined, isRevealed: false });
    setCountdown(AUTO_CLEAR_SECONDS);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "deletePassword",
        args: [entry.label],
      });
      removeEntry(entry.label);
      toast.success("Entry purged from vault.");
    } catch (err) {
      toast.error("Failed to delete entry");
      console.error(err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`relative border bg-[#0D1119] transition-colors duration-200 ${
        entry.isRevealed
          ? "border-[rgba(255,59,48,0.25)] shadow-[0_0_24px_rgba(255,59,48,0.06)]"
          : "border-[rgba(0,255,178,0.1)] hover:border-[rgba(0,255,178,0.2)]"
      }`}
    >
      {/* Countdown bar when revealed */}
      {entry.isRevealed && (
        <div className="absolute top-0 left-0 h-[2px] bg-[#FF3B30]/30 w-full overflow-hidden">
          <div
            className="h-full bg-[#FF3B30] countdown-bar"
            style={{ animationDuration: `${AUTO_CLEAR_SECONDS}s` }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1">
              {fileRef}
            </p>
            <p className="font-['Syne'] text-base font-bold text-[#E8EDF5] truncate tracking-tight">
              {entry.label}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            {entry.isRevealed ? <ExposedBadge /> : <EncryptedBadge />}
          </div>
        </div>

        {/* Type row */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] text-[#4A5A72] tracking-[0.25em] uppercase">
            TYPE
          </span>
          <span className="font-mono text-[10px] text-[#E8EDF5]">Password</span>
        </div>

        {/* Cipher handle */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] text-[#4A5A72] tracking-[0.25em] uppercase">
            HANDLE
          </span>
          <CipherHandle value={handle} />
        </div>

        {/* Password row */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[9px] text-[#4A5A72] tracking-[0.25em] uppercase">
            STATUS
          </span>
          <div className="flex items-center gap-2">
            {entry.isDecrypting ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-[#00FFB2]" />
                <span className="font-mono text-[9px] text-[#4A5A72] uppercase tracking-widest">
                  Decrypting…
                </span>
              </div>
            ) : entry.isRevealed && entry.password !== undefined ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#FF3B30] max-w-[120px] truncate">
                  {entry.password}
                </span>
                <button
                  onClick={() => copy(entry.password!, "password")}
                  className="text-[#4A5A72] hover:text-[#E8EDF5] transition-colors"
                >
                  {copied === "password" ? (
                    <Check className="h-3 w-3 text-[#00FFB2]" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            ) : (
              <span
                className="font-mono text-sm text-[#00FFB2]/50 leading-none select-none"
                style={{ letterSpacing: "-0.03em" }}
                aria-hidden
              >
                ████████████████
              </span>
            )}
          </div>
        </div>

        {/* Username (if revealed) */}
        <AnimatePresence>
          {entry.isRevealed && entry.username && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between mb-5"
            >
              <span className="font-mono text-[9px] text-[#4A5A72] tracking-[0.25em] uppercase">
                USER
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#E8EDF5] max-w-[140px] truncate">
                  {entry.username}
                </span>
                <button
                  onClick={() => copy(entry.username, "username")}
                  className="text-[#4A5A72] hover:text-[#E8EDF5] transition-colors"
                >
                  {copied === "username" ? (
                    <Check className="h-3 w-3 text-[#00FFB2]" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown warning */}
        {entry.isRevealed && (
          <div className="mb-4 flex items-center gap-2 border border-[rgba(255,59,48,0.2)] bg-[rgba(255,59,48,0.05)] px-3 py-2">
            <span className="font-mono text-[9px] text-[#FF3B30] tracking-[0.2em] uppercase">
              ⚠ Visible on screen · Auto-redacts in {countdown}s
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-[rgba(0,255,178,0.06)]">
          {confirmDelete && (
            <span className="font-mono text-[9px] text-[#FF3B30] tracking-widest uppercase mr-auto">
              Click again to confirm
            </span>
          )}
          <button
            onClick={entry.isRevealed ? hide : reveal}
            disabled={entry.isDecrypting}
            className="flex items-center gap-1.5 px-4 py-2 border border-[rgba(0,255,178,0.15)] hover:border-[rgba(0,255,178,0.35)] hover:bg-[rgba(0,255,178,0.05)] font-mono text-[9px] tracking-[0.2em] text-[#4A5A72] hover:text-[#00FFB2] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {entry.isDecrypting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : entry.isRevealed ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            {entry.isRevealed ? "Hide" : "Decrypt & View"}
          </button>
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 px-4 py-2 border font-mono text-[9px] tracking-[0.2em] uppercase transition-all ${
              confirmDelete
                ? "border-[rgba(255,59,48,0.5)] text-[#FF3B30] bg-[rgba(255,59,48,0.08)]"
                : "border-[rgba(255,255,255,0.06)] text-[#4A5A72] hover:border-[rgba(255,59,48,0.3)] hover:text-[#FF3B30]"
            }`}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
