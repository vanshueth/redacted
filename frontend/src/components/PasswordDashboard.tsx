/**
 * PasswordDashboard — The main screen after the user is fully authenticated.
 * Shows the header (wallet address, FHE status), the password list, and a
 * floating "Add Password" button.
 */

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Lock, Wifi, WifiOff, LogOut } from "lucide-react";
import { PasswordCard } from "./PasswordCard";
import { AddPasswordModal } from "./AddPasswordModal";
import type { PasswordEntry, FheStatus } from "../types";

interface Props {
  walletAddress: string;
  fheStatus: FheStatus;
  passwords: PasswordEntry[];
  isLoading: boolean;
  error: string | null;
  onLoadPasswords: () => void;
  onAddPassword: (site: string, username: string, password: string) => Promise<boolean>;
  onDeletePassword: (index: number) => Promise<boolean>;
  onRevealPassword: (index: number) => void;
  onHidePassword: (index: number) => void;
  onLock: () => void;
  clearError: () => void;
}

export function PasswordDashboard({
  walletAddress,
  fheStatus,
  passwords,
  isLoading,
  error,
  onLoadPasswords,
  onAddPassword,
  onDeletePassword,
  onRevealPassword,
  onHidePassword,
  onLock,
  clearError,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Load passwords when the dashboard first mounts
  useEffect(() => {
    onLoadPasswords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (index: number) => {
    setDeletingIndex(index);
    await onDeletePassword(index);
    setDeletingIndex(null);
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-white text-sm hidden sm:block">
              FHE Vault
            </span>
          </div>

          {/* Center: FHE status */}
          <div className="flex items-center gap-2 text-xs">
            {fheStatus === "ready" ? (
              <span className="flex items-center gap-1.5 text-green-400">
                <Wifi className="w-3.5 h-3.5" />
                FHE Ready
              </span>
            ) : fheStatus === "initializing" ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="animate-spin text-base leading-none">⟳</span>
                FHE Loading…
              </span>
            ) : fheStatus === "error" ? (
              <span className="flex items-center gap-1.5 text-red-400">
                <WifiOff className="w-3.5 h-3.5" />
                FHE Error
              </span>
            ) : null}
          </div>

          {/* Right: Wallet + Lock */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 hidden sm:block">
              {shortAddress}
            </span>
            <button
              onClick={onLock}
              title="Lock vault"
              className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Page title + refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Your Vault</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {passwords.length === 0
                ? "No passwords saved yet"
                : `${passwords.length} encrypted password${passwords.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            onClick={onLoadPasswords}
            disabled={isLoading}
            title="Refresh"
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start justify-between gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-300 flex-shrink-0 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && passwords.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && passwords.length === 0 && (
          <div className="text-center py-16">
            <Lock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-gray-400 font-medium mb-2">Your vault is empty</h3>
            <p className="text-gray-600 text-sm mb-6">
              Click the button below to save your first password.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add First Password
            </button>
          </div>
        )}

        {/* Password list */}
        {passwords.length > 0 && (
          <div className="space-y-3">
            {passwords.map((entry) => (
              <PasswordCard
                key={entry.index}
                entry={entry}
                onReveal={onRevealPassword}
                onHide={onHidePassword}
                onDelete={handleDelete}
                isDeleting={deletingIndex === entry.index}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Floating Add Button (bottom-right) ── */}
      {passwords.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary w-14 h-14 rounded-full shadow-lg shadow-brand-500/25 text-xl p-0"
            title="Add password"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ── Add Password Modal ── */}
      {showAddModal && (
        <AddPasswordModal
          onAdd={onAddPassword}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
