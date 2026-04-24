"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Trash2, Copy, Check, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { FheTypes } from "@cofhe/sdk";
import { useVaultStore, type VaultEntry } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";

interface Props {
  entry: VaultEntry;
}

export function PasswordCard({ entry }: Props) {
  const [copied, setCopied] = useState<"username" | "password" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { cofheClient, updateEntry, removeEntry } = useVaultStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const copy = async (text: string, field: "username" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const reveal = async () => {
    if (!cofheClient || !address || !publicClient) return;
    updateEntry(entry.label, { isDecrypting: true });
    try {
      // Ensure a permit exists (creates one via wallet signature if needed, then cached)
      await cofheClient.permits.getOrCreateSelfPermit();

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getPassword",
        args: [entry.label],
        account: address,
      }) as { ciphertext: readonly bigint[] } | readonly [readonly bigint[], string, string];

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

  const hide = () => updateEntry(entry.label, { password: undefined, isRevealed: false });

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
      toast.success("Password deleted");
    } catch (err) {
      toast.error("Failed to delete password");
      console.error(err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="h-4 w-4 text-violet-400 flex-shrink-0" />
          <span className="font-semibold text-white truncate">{entry.label}</span>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={entry.isRevealed ? hide : reveal}
            disabled={entry.isDecrypting}
            className="p-2 text-white/40 hover:text-violet-400 transition-colors rounded-lg hover:bg-violet-500/10"
          >
            {entry.isDecrypting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : entry.isRevealed ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 transition-colors rounded-lg ${
              confirmDelete
                ? "text-red-400 bg-red-500/10"
                : "text-white/40 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {entry.username && (
        <p className="text-xs text-white/40 truncate">{entry.username}</p>
      )}

      {entry.isDecrypting && (
        <p className="mt-2 text-xs text-violet-400 flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Decrypting via FHE co-processor…
        </p>
      )}

      {entry.isRevealed && entry.password !== undefined && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
          <CredRow
            label="Username"
            value={entry.username}
            copied={copied === "username"}
            onCopy={() => copy(entry.username, "username")}
          />
          <CredRow
            label="Password"
            value={entry.password}
            copied={copied === "password"}
            onCopy={() => copy(entry.password!, "password")}
          />
        </div>
      )}

      {confirmDelete && (
        <p className="mt-2 text-xs text-red-400">Click again to confirm deletion.</p>
      )}
    </motion.div>
  );
}

function CredRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-white/30">{label}</p>
        <p className="text-sm text-white/80 font-mono truncate">{value || "(empty)"}</p>
      </div>
      {value && (
        <button
          onClick={onCopy}
          className="p-1.5 text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
