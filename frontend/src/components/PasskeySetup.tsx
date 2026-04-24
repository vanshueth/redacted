/**
 * PasskeySetup — Shown when the user is connected but hasn't set a passkey yet,
 * OR when they need to enter their passkey to unlock.
 *
 * mode="setup"  → first-time user creates a passkey
 * mode="enter"  → returning user types their passkey to unlock
 */

import { useState } from "react";
import { KeyRound, Eye, EyeOff, AlertTriangle, Info } from "lucide-react";

interface Props {
  mode: "setup" | "enter";
  onSubmit: (passkey: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  walletAddress: string;
}

export function PasskeySetup({ mode, onSubmit, isLoading, error, walletAddress }: Props) {
  const [passkey, setPasskey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSetup = mode === "setup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (passkey.length < 6) {
      setLocalError("Passkey must be at least 6 characters long.");
      return;
    }
    if (isSetup && passkey !== confirm) {
      setLocalError("Passkeys don't match. Please re-enter.");
      return;
    }

    await onSubmit(passkey);
  };

  const displayError = localError ?? error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-brand-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          {isSetup ? "Create Your Passkey" : "Enter Your Passkey"}
        </h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          {isSetup
            ? "Choose a secret passkey. It adds an extra encryption layer on top of your wallet. If you lose it, your passwords cannot be recovered."
            : "Enter the passkey you set up to decrypt your passwords."}
        </p>

        {/* Connected wallet */}
        <div className="mb-6 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 font-mono truncate">
            {walletAddress}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passkey input */}
          <div>
            <label className="label">
              {isSetup ? "Choose Passkey" : "Your Passkey"}
            </label>
            <div className="relative">
              <input
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder={isSetup ? "e.g. correct-horse-battery" : "Enter your passkey"}
                className="input-field pr-12"
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasskey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm (setup only) */}
          {isSetup && (
            <div>
              <label className="label">Confirm Passkey</label>
              <input
                type={showPasskey ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter passkey"
                className="input-field"
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error */}
          {displayError && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {displayError}
            </div>
          )}

          {/* Warning (setup only) */}
          {isSetup && (
            <div className="flex items-start gap-2 text-amber-400 text-xs bg-amber-900/20 border border-amber-800/50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Your passkey is NEVER stored anywhere.
                If you forget it, your passwords cannot be recovered — not even
                by us.
              </span>
            </div>
          )}

          {/* Info (enter only) */}
          {!isSetup && (
            <div className="flex items-start gap-2 text-blue-400 text-xs bg-blue-900/20 border border-blue-800/50 rounded-lg px-3 py-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                MetaMask will ask you to sign a message — this is free (no gas)
                and is used only to derive your encryption key.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !passkey}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⟳</span>
                {isSetup ? "Setting up…" : "Unlocking…"}
              </>
            ) : isSetup ? (
              "Set Passkey & Continue"
            ) : (
              "Unlock Vault"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
