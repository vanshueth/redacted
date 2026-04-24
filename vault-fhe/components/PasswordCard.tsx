"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { FheTypes } from "@cofhe/sdk";
import { useVaultStore, type VaultEntry } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";

interface Props {
  entry: VaultEntry;
  index: number;
}

export function PasswordCard({ entry, index }: Props) {
  const [copied, setCopied] = useState<"username" | "password" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { cofheClient, updateEntry, removeEntry } = useVaultStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const fileRef = `FILE-${String(index + 1).padStart(4, "0")}`;

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
      })) as
        | { ciphertext: readonly bigint[] }
        | readonly [readonly bigint[], string, string];

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
    } catch (err) {
      updateEntry(entry.label, { isDecrypting: false });
      toast.error("Failed to decrypt password");
      console.error(err);
    }
  };

  const hide = () =>
    updateEntry(entry.label, { password: undefined, isRevealed: false });

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
      toast.success("Entry purged.");
    } catch (err) {
      toast.error("Failed to delete entry");
      console.error(err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`border bg-[#080b12] p-5 transition-colors duration-150 ${
        entry.isRevealed
          ? "border-[#ff3131]/25 bg-[#ff3131]/[0.02]"
          : "border-[#1c2133] hover:border-[#252d42]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.35em] text-[#2a3448] uppercase mb-1">
            {fileRef}
          </p>
          <p className="font-mono text-sm font-bold text-[#e8eaf0] uppercase tracking-wider truncate">
            {entry.label}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0">
          {entry.isRevealed ? (
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#ff3131] border border-[#ff3131]/30 px-2 py-0.5 uppercase">
              ⚠ EXPOSED
            </span>
          ) : (
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#00ff87] border border-[#00ff87]/20 px-2 py-0.5 uppercase">
              ● ENCRYPTED
            </span>
          )}
        </div>
      </div>

      {/* Username row */}
      {entry.username && (
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#2a3448] uppercase mb-0.5">
              USERNAME
            </p>
            <p className="font-mono text-xs text-[#6b7890] truncate">{entry.username}</p>
          </div>
          {entry.isRevealed && (
            <button
              onClick={() => copy(entry.username, "username")}
              className="ml-3 p-1.5 text-[#2a3448] hover:text-[#e8eaf0] transition-colors flex-shrink-0"
            >
              {copied === "username" ? (
                <Check className="h-3 w-3 text-[#00ff87]" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Password row */}
      <div className="flex items-center justify-between mb-5">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] tracking-[0.3em] text-[#2a3448] uppercase mb-0.5">
            PASSWORD
          </p>
          {entry.isDecrypting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-[#00ff87]" />
              <span className="font-mono text-[10px] text-[#4a5270] tracking-widest uppercase">
                DECRYPTING VIA FHE…
              </span>
            </div>
          ) : entry.isRevealed && entry.password !== undefined ? (
            <p className="font-mono text-xs text-[#ff3131] truncate">{entry.password}</p>
          ) : (
            <p
              className="font-mono text-base text-[#00ff87] leading-none select-none"
              style={{ letterSpacing: "-0.02em", opacity: 0.55 }}
              aria-hidden
            >
              ████████████████████
            </p>
          )}
        </div>
        {entry.isRevealed && entry.password && (
          <button
            onClick={() => copy(entry.password!, "password")}
            className="ml-3 p-1.5 text-[#2a3448] hover:text-[#e8eaf0] transition-colors flex-shrink-0"
          >
            {copied === "password" ? (
              <Check className="h-3 w-3 text-[#00ff87]" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#111827]">
        {confirmDelete && (
          <span className="font-mono text-[9px] text-[#ff3131] tracking-[0.25em] uppercase mr-auto">
            CONFIRM →
          </span>
        )}
        <button
          onClick={entry.isRevealed ? hide : reveal}
          disabled={entry.isDecrypting}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1c2133] hover:border-[#252d42] font-mono text-[9px] tracking-[0.2em] text-[#4a5270] hover:text-[#8890a8] uppercase transition-all duration-150 disabled:opacity-30"
        >
          {entry.isDecrypting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : entry.isRevealed ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          {entry.isRevealed ? "HIDE" : "REVEAL"}
        </button>
        <button
          onClick={handleDelete}
          className={`flex items-center gap-1.5 px-3 py-1.5 border font-mono text-[9px] tracking-[0.2em] uppercase transition-all duration-150 ${
            confirmDelete
              ? "border-[#ff3131]/40 text-[#ff3131]"
              : "border-[#1c2133] hover:border-[#ff3131]/30 text-[#4a5270] hover:text-[#ff3131]"
          }`}
        >
          <Trash2 className="h-3 w-3" />
          PURGE
        </button>
      </div>
    </motion.div>
  );
}
