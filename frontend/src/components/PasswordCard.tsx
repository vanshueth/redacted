/**
 * PasswordCard — Displays a single password entry.
 * Shows site name always; username/password only after "Reveal" is clicked.
 */

import { useState } from "react";
import { Eye, EyeOff, Trash2, Globe, Copy, Check, Loader2 } from "lucide-react";
import type { PasswordEntry } from "../types";

interface Props {
  entry: PasswordEntry;
  onReveal: (index: number) => void;
  onHide: (index: number) => void;
  onDelete: (index: number) => void;
  isDeleting: boolean;
}

export function PasswordCard({ entry, onReveal, onHide, onDelete, isDeleting }: Props) {
  const [copiedField, setCopiedField] = useState<"username" | "password" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copyToClipboard = async (text: string, field: "username" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(entry.index);
  };

  return (
    <div className="card hover:border-gray-700 transition-colors">
      {/* Site name row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span className="font-semibold text-white truncate">{entry.site}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {/* Reveal / Hide button */}
          <button
            onClick={() => (entry.isRevealed ? onHide(entry.index) : onReveal(entry.index))}
            disabled={entry.isDecrypting}
            className="p-2 text-gray-500 hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10"
            title={entry.isRevealed ? "Hide" : "Reveal passwords"}
          >
            {entry.isDecrypting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : entry.isRevealed ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 transition-colors rounded-lg ${
              confirmDelete
                ? "text-red-400 bg-red-900/20 hover:bg-red-900/40"
                : "text-gray-500 hover:text-red-400 hover:bg-red-900/10"
            }`}
            title={confirmDelete ? "Click again to confirm delete" : "Delete"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decrypting indicator */}
      {entry.isDecrypting && (
        <div className="mt-3 flex items-center gap-2 text-xs text-brand-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          Decrypting via FHE co-processor… (MetaMask may ask you to sign)
        </div>
      )}

      {/* Revealed credentials */}
      {entry.isRevealed && entry.username !== undefined && (
        <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
          {/* Username */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Username</p>
              <p className="text-sm text-gray-200 font-mono truncate">
                {entry.username || "(empty)"}
              </p>
            </div>
            {entry.username && (
              <button
                onClick={() => copyToClipboard(entry.username!, "username")}
                className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                title="Copy username"
              >
                {copiedField === "username" ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Password */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Password</p>
              <p className="text-sm text-gray-200 font-mono truncate">
                {entry.password || "(empty)"}
              </p>
            </div>
            {entry.password && (
              <button
                onClick={() => copyToClipboard(entry.password!, "password")}
                className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                title="Copy password"
              >
                {copiedField === "password" ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm delete hint */}
      {confirmDelete && (
        <p className="mt-2 text-xs text-red-400">
          Click the trash icon again to permanently delete this entry.
        </p>
      )}
    </div>
  );
}
