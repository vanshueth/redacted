"use client";

import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, ShieldCheck, KeyRound } from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PasswordCard } from "@/components/PasswordCard";
import { AddPasswordModal } from "@/components/AddPasswordModal";
import { LowBalanceBanner } from "@/components/LowBalanceBanner";
import { useVaultStore } from "@/lib/store";
import { useCofhe } from "@/hooks/useCofhe";
import { useHydrateVault } from "@/hooks/useHydrateVault";

export default function Home() {
  const { isConnected } = useAccount();
  const { isCofheConnected } = useCofhe();
  const { entries, openAddModal } = useVaultStore();
  useHydrateVault();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Lock className="h-4 w-4 text-violet-400" />
            </div>
            <span className="font-bold text-white tracking-tight">VaultFHE</span>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 border border-violet-500/20">
                Sepolia + FHE
              </span>
            )}
            <ConnectWallet />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            /* ── Hero (not connected) ── */
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-32 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-600/20 border border-violet-500/30 shadow-2xl shadow-violet-500/20"
              >
                <Lock className="h-12 w-12 text-violet-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
              >
                The world&apos;s first{" "}
                <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                  FHE password manager
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10 max-w-lg text-lg text-white/50 leading-relaxed"
              >
                Your passwords are encrypted with Fully Homomorphic Encryption —
                even the blockchain can&apos;t read them. Zero trust, zero compromise.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-6 mb-10"
              >
                {[
                  { icon: ShieldCheck, label: "FHE Encrypted" },
                  { icon: KeyRound, label: "On-chain storage" },
                  { icon: Lock, label: "Self-custody" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-white/40">
                    <Icon className="h-4 w-4 text-violet-400" />
                    {label}
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ConnectWallet />
              </motion.div>
            </motion.div>
          ) : (
            /* ── Dashboard (connected) ── */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
            >
              <LowBalanceBanner />
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-white/40">Passwords stored</p>
                  <p className="text-2xl font-bold text-white">{entries.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-white/40">Encryption</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-2 w-2 rounded-full ${isCofheConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    <span className="text-sm font-medium text-white">
                      {isCofheConnected ? "FHE Active" : "Connecting..."}
                    </span>
                  </div>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <Lock className="h-8 w-8 text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">No passwords yet.</p>
                  <p className="text-white/20 text-xs mt-1">Click the + button to add your first encrypted password.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {entries.map((entry) => (
                      <PasswordCard key={entry.label} entry={entry} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAB */}
      {isConnected && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 shadow-lg shadow-violet-500/40 text-white hover:bg-violet-700 transition-colors z-30"
          aria-label="Add password"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      <AddPasswordModal />
    </div>
  );
}
