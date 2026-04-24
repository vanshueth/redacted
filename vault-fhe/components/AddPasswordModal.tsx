"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { useWriteContract } from "wagmi";
import { Encryptable } from "@cofhe/sdk";
import { useVaultStore } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";

export function AddPasswordModal() {
  const { isAddModalOpen, closeAddModal, cofheClient, entries, setEntries } =
    useVaultStore();
  const { writeContractAsync, isPending } = useWriteContract();

  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isAddModalOpen) return null;

  const reset = () => {
    setLabel("");
    setUsername("");
    setNotes("");
    setPassword("");
    setError(null);
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
    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setIsEncrypting(true);
      const bytes = Array.from(password).map((c) => BigInt(c.charCodeAt(0)));
      const encryptable = bytes.map((b) => Encryptable.uint8(b));
      const encrypted = await (
        cofheClient.encryptInputs(encryptable as never) as {
          execute: () => Promise<unknown[]>;
        }
      ).execute();
      setIsEncrypting(false);

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "storePassword",
        args: [label.trim(), encrypted as never, username.trim(), notes.trim()],
      });

      setEntries([
        ...entries,
        {
          label: label.trim(),
          username: username.trim(),
          notes: notes.trim(),
          isRevealed: false,
          isDecrypting: false,
        },
      ]);
      toast.success("Entry encrypted and saved.");
      handleClose();
    } catch (err) {
      setIsEncrypting(false);
      setError(err instanceof Error ? err.message : "Failed to save entry");
    }
  };

  const isLoading = isPending || isEncrypting;
  const strengthSegments = Math.ceil((password.length / 32) * 8);

  return (
    <>
      {/* FHE encryption fullscreen overlay */}
      {isEncrypting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#030407]/96 backdrop-blur-md">
          <div className="border border-[#1c2133] p-12 max-w-sm w-full mx-4 text-center">
            <p className="font-mono text-[9px] tracking-[0.45em] text-[#4a5270] uppercase mb-10">
              FHE PROCESSOR / ACTIVE
            </p>
            <div
              className="font-mono text-3xl text-[#00ff87] leading-none select-none animate-pulse mb-1"
              aria-hidden
            >
              ████████████████
            </div>
            <div
              className="font-mono text-3xl text-[#00ff87]/25 leading-none select-none mb-10"
              aria-hidden
            >
              ████████████████
            </div>
            <div className="h-px w-full bg-[#1c2133] mb-8" />
            <p className="font-mono text-xs tracking-[0.25em] text-[#e8eaf0] uppercase mb-2">
              GENERATING CIPHERTEXT
            </p>
            <p className="font-mono text-[9px] text-[#4a5270] tracking-[0.3em] uppercase">
              PLAINTEXT WILL BE DESTROYED
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#030407]/80 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="w-full max-w-md bg-[#080b12] border border-[#1c2133]">
          {/* Header */}
          <div className="border-b border-[#1c2133] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] tracking-[0.4em] text-[#2a3448] uppercase mb-1">
                CLASSIFIED ENTRY
              </p>
              <h3 className="font-mono text-sm font-bold text-[#e8eaf0] uppercase tracking-[0.15em]">
                NEW VAULT RECORD
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-[#4a5270] hover:text-[#e8eaf0] border border-transparent hover:border-[#1c2133] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <FieldBlock label="LABEL / SITE">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="github.com"
                className="field"
                autoFocus
              />
            </FieldBlock>

            <FieldBlock label="USERNAME / EMAIL">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@example.com"
                className="field"
              />
            </FieldBlock>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[9px] tracking-[0.35em] text-[#4a5270] uppercase">
                  PASSWORD
                </label>
                <span className="font-mono text-[9px] text-[#2a3448]">
                  {password.length}/32
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  maxLength={32}
                  className="field pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5270] hover:text-[#8890a8] transition-colors"
                >
                  {showPassword ? (
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
                    style={{
                      background:
                        i < strengthSegments ? "#00ff87" : "#1c2133",
                    }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="border border-[#ff3131]/20 bg-[#ff3131]/[0.04] px-4 py-3">
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#ff3131] uppercase">
                  ⚠ {error}
                </p>
              </div>
            )}

            {/* Security notice */}
            <div className="border border-[#1c2133] px-4 py-3 flex items-start gap-2.5">
              <Shield className="h-3.5 w-3.5 text-[#2a3448] mt-0.5 flex-shrink-0" />
              <p className="font-mono text-[9px] tracking-[0.15em] text-[#2a3448] uppercase leading-relaxed">
                PASSWORD IS FHE-ENCRYPTED CLIENT-SIDE.
                PLAINTEXT NEVER LEAVES YOUR DEVICE.
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 border border-[#1c2133] hover:border-[#252d42] px-4 py-2.5 font-mono text-[9px] tracking-[0.25em] text-[#4a5270] hover:text-[#6b7890] uppercase transition-all disabled:opacity-40"
              >
                ABORT
              </button>
              <button
                type="submit"
                disabled={isLoading || !label.trim() || !password}
                className="flex-1 border border-[#e8eaf0]/15 hover:border-[#e8eaf0]/40 bg-[#e8eaf0]/[0.04] hover:bg-[#e8eaf0]/[0.08] px-4 py-2.5 font-mono text-[9px] tracking-[0.25em] text-[#e8eaf0] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-3 w-3 border border-[#e8eaf0]/20 border-t-[#e8eaf0]/80 rounded-full animate-spin" />
                    ENCRYPTING
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3" />
                    ENCRYPT & SAVE
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] tracking-[0.35em] text-[#4a5270] uppercase mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
