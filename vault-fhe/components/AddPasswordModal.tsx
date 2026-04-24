"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Lock, Globe, User } from "lucide-react";
import { toast } from "sonner";
import { useWriteContract } from "wagmi";
import { Encryptable } from "@cofhe/sdk";
import { useVaultStore } from "@/lib/store";
import { CONTRACT_ADDRESS, VAULT_ABI } from "@/lib/constants";

export function AddPasswordModal() {
  const { isAddModalOpen, closeAddModal, cofheClient, entries, setEntries } = useVaultStore();
  const { writeContractAsync, isPending } = useWriteContract();

  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAddModalOpen) return null;

  const reset = () => {
    setLabel(""); setUsername(""); setNotes(""); setPassword(""); setError(null);
  };

  const handleClose = () => { reset(); closeAddModal(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cofheClient) { setError("FHE client not ready — please wait a moment."); return; }
    if (!label.trim()) { setError("Please enter a label."); return; }
    if (!password) { setError("Please enter a password."); return; }

    try {
      const bytes = Array.from(password).map((c) => BigInt(c.charCodeAt(0)));
      const encryptable = bytes.map((b) => Encryptable.uint8(b));
      const encrypted = await (cofheClient.encryptInputs(encryptable as never) as { execute: () => Promise<unknown[]> }).execute();

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "storePassword",
        args: [label.trim(), encrypted as never, username.trim(), notes.trim()],
      });

      setEntries([
        ...entries,
        { label: label.trim(), username: username.trim(), notes: notes.trim(), isRevealed: false, isDecrypting: false },
      ]);
      toast.success("Password saved!");
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save password");
    }
  };

  const isLoading = isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1220] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add Password</h3>
          <button onClick={handleClose} className="p-1 text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Label (site or app)" icon={<Globe className="h-4 w-4" />}>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. github.com"
              className="input"
              autoFocus
            />
          </InputField>

          <InputField label="Username / Email" icon={<User className="h-4 w-4" />}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </InputField>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Password <span className="text-white/20">(max 32 chars)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                maxLength={32}
                className="input pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-white/20 text-right mt-1">{password.length}/32</p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !label.trim() || !password}
              className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Encrypting…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Save Encrypted
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{icon}</span>
        {children}
      </div>
    </div>
  );
}
