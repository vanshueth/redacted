/**
 * AddPasswordModal — A slide-up modal for adding a new password entry.
 * Validates input length (max 32 chars per field due to euint128 × 2 storage).
 */

import { useState } from "react";
import { X, Eye, EyeOff, Plus, Globe, User, Lock } from "lucide-react";

interface Props {
  onAdd: (site: string, username: string, password: string) => Promise<boolean>;
  onClose: () => void;
  isLoading: boolean;
}

export function AddPasswordModal({ onAdd, onClose, isLoading }: Props) {
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!site.trim()) { setError("Please enter a website name."); return; }
    if (!username.trim()) { setError("Please enter a username."); return; }
    if (!password) { setError("Please enter a password."); return; }
    if (username.length > 32) {
      setError("Username must be 32 characters or fewer (FHE storage limit).");
      return;
    }
    if (password.length > 32) {
      setError("Password must be 32 characters or fewer (FHE storage limit).");
      return;
    }

    const success = await onAdd(site.trim(), username.trim(), password);
    if (success) onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-semibold text-white">Add Password</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Site */}
          <div>
            <label className="label">Website / App</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. github.com"
                className="input-field pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="label">
              Username / Email{" "}
              <span className="text-gray-600 font-normal">
                (max 32 chars)
              </span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@example.com"
                maxLength={32}
                className="input-field pl-10"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-right">
              {username.length}/32
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="label">
              Password{" "}
              <span className="text-gray-600 font-normal">(max 32 chars)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                maxLength={32}
                className="input-field pl-10 pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1 text-right">
              {password.length}/32
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* What happens info */}
          <div className="text-xs text-gray-500 bg-gray-800 rounded-lg px-3 py-2 leading-relaxed">
            When you click Save, the app will:
            <br />① XOR-encrypt your data with your passkey key
            <br />② FHE-encrypt it again via the Fhenix co-processor
            <br />③ Store the double-encrypted blob on Arbitrum Sepolia
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !site || !username || !password}
              className="btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Encrypting…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
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
