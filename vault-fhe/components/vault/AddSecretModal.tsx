"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWriteContract } from "wagmi";
import { Encryptable } from "@cofhe/sdk";
import { useVaultStore } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";
import { AngularButton } from "@/components/ui/AngularButton";

const TYPES = ["Password", "Seed Phrase", "Private Key", "Note"] as const;
type SecretType = (typeof TYPES)[number];

const PROCESS_STEPS = [
  "Encrypting locally via cofhejs…",
  "Sending ciphertext to Fhenix…",
  "Confirmed onchain. Plaintext destroyed.",
];

export function AddSecretModal() {
  const { isAddModalOpen, closeAddModal, cofheClient, entries, setEntries } =
    useVaultStore();
  const { writeContractAsync, isPending } = useWriteContract();

  const [label, setLabel] = useState("");
  const [secretType, setSecretType] = useState<SecretType>("Password");
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [processStep, setProcessStep] = useState(-1);

  if (!isAddModalOpen) return null;

  const reset = () => {
    setLabel("");
    setSecretType("Password");
    setUsername("");
    setSecret("");
    setError(null);
    setProcessStep(-1);
  };

  const handleClose = () => {
    reset();
    closeAddModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cofheClient) {
      setError("FHE client not ready — please wait.");
      return;
    }
    if (!label.trim()) {
      setError("Label is required.");
      return;
    }
    if (!secret) {
      setError("Secret value is required.");
      return;
    }

    try {
      setIsEncrypting(true);
      setProcessStep(0);

      const bytes = Array.from(secret).map((c) => BigInt(c.charCodeAt(0)));
      const encryptable = bytes.map((b) => Encryptable.uint8(b));
      const encrypted = await (
        cofheClient.encryptInputs(encryptable as never) as {
          execute: () => Promise<unknown[]>;
        }
      ).execute();

      setProcessStep(1);

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "storePassword",
        args: [label.trim(), encrypted as never, username.trim(), secretType],
      });

      setProcessStep(2);
      await new Promise((r) => setTimeout(r, 800));

      setEntries([
        ...entries,
        {
          label: label.trim(),
          username: username.trim(),
          notes: secretType,
          isRevealed: false,
          isDecrypting: false,
        },
      ]);

      toast.success("Entry encrypted and stored onchain.");
      setIsEncrypting(false);
      handleClose();
    } catch (err) {
      setIsEncrypting(false);
      setProcessStep(-1);
      setError(err instanceof Error ? err.message : "Failed to store secret");
    }
  };

  const isLoading = isPending || isEncrypting;
  const strength = Math.ceil((secret.length / 32) * 8);

  return (
    <>
      {/* Encryption overlay */}
      <AnimatePresence>
        {isEncrypting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#07090E]/95 backdrop-blur-md"
          >
            <div className="border border-[rgba(0,255,178,0.15)] bg-[#0D1119] p-12 max-w-sm w-full mx-4 text-center">
              <p className="font-mono text-[9px] text-[#7C6EFA] tracking-[0.45em] uppercase mb-8">
                FHE PROCESSOR / ACTIVE
              </p>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="font-mono text-4xl text-[#00FFB2] leading-none select-none mb-1"
                aria-hidden
              >
                ████████████████
              </motion.div>
              <div
                className="font-mono text-4xl text-[#00FFB2]/15 leading-none select-none mb-10"
                aria-hidden
              >
                ████████████████
              </div>
              <div className="h-px w-full bg-[rgba(0,255,178,0.1)] mb-8" />

              {/* Steps */}
              <div className="space-y-3 text-left">
                {PROCESS_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-4">
                      {processStep > i ? (
                        <Check className="h-3 w-3 text-[#00FFB2]" />
                      ) : processStep === i ? (
                        <Loader2 className="h-3 w-3 text-[#00FFB2] animate-spin" />
                      ) : (
                        <span className="block h-3 w-3 rounded-full border border-[#4A5A72]" />
                      )}
                    </div>
                    <span
                      className={`font-mono text-[10px] tracking-wider uppercase ${
                        processStep >= i ? "text-[#E8EDF5]" : "text-[#4A5A72]"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#07090E]/80 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0D1119] border border-[rgba(0,255,178,0.12)]"
        >
          {/* Header */}
          <div className="border-b border-[rgba(0,255,178,0.07)] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.4em] uppercase mb-0.5">
                Classified Entry
              </p>
              <h3 className="font-['Syne'] text-sm font-bold text-[#E8EDF5] tracking-tight">
                Add to Vault
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-[#4A5A72] hover:text-[#E8EDF5] border border-transparent hover:border-[rgba(0,255,178,0.15)] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Label */}
            <div>
              <label className="block font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1.5">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Twitter password"
                className="field"
                autoFocus
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSecretType(t)}
                    className={`px-3 py-2 font-mono text-[10px] tracking-wider uppercase border transition-all ${
                      secretType === t
                        ? "border-[rgba(0,255,178,0.4)] bg-[rgba(0,255,178,0.07)] text-[#00FFB2]"
                        : "border-[rgba(0,255,178,0.1)] text-[#4A5A72] hover:border-[rgba(0,255,178,0.2)] hover:text-[#E8EDF5]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Username (only for Password type) */}
            {secretType === "Password" && (
              <div>
                <label className="block font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1.5">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="you@example.com"
                  className="field"
                />
              </div>
            )}

            {/* Secret */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase">
                  Secret Value
                </label>
                <span className="font-mono text-[9px] text-[#4A5A72]">
                  {secret.length}/32
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={secret}
                  onChange={(e) => setSecret(e.target.value.slice(0, 32))}
                  placeholder={
                    secretType === "Password"
                      ? "••••••••••••••••"
                      : secretType === "Seed Phrase"
                      ? "word1 word2 word3 …"
                      : "Enter your secret"
                  }
                  rows={3}
                  className={`field resize-none pr-10 ${!showSecret ? "blur-[3px] focus:blur-none" : ""}`}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-3 text-[#4A5A72] hover:text-[#E8EDF5] transition-colors"
                >
                  {showSecret ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {/* Strength bar */}
              <div className="mt-2 flex gap-[2px]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[2px] flex-1 transition-colors duration-200"
                    style={{ background: i < strength ? "#00FFB2" : "#141A26" }}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="border border-[rgba(255,59,48,0.2)] bg-[rgba(255,59,48,0.04)] px-4 py-3">
                <p className="font-mono text-[9px] text-[#FF3B30] tracking-[0.2em] uppercase">
                  ⚠ {error}
                </p>
              </div>
            )}

            {/* Notice */}
            <div className="border border-[rgba(0,255,178,0.08)] bg-[rgba(0,255,178,0.02)] px-4 py-3">
              <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.12em] leading-relaxed">
                Your plaintext never leaves this browser. Fhenix only receives
                euint256 ciphertext.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 border border-[rgba(0,255,178,0.1)] hover:border-[rgba(0,255,178,0.2)] px-4 py-2.5 font-mono text-[9px] tracking-[0.25em] text-[#4A5A72] hover:text-[#E8EDF5] uppercase transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <AngularButton
                type="submit"
                disabled={isLoading || !label.trim() || !secret}
                className="flex-1"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Encrypting…
                  </>
                ) : (
                  "Encrypt & Store →"
                )}
              </AngularButton>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
