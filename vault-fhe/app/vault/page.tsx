"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, RefreshCw, Lock } from "lucide-react";
import { VaultSidebar } from "@/components/vault/VaultSidebar";
import { VaultCard } from "@/components/vault/VaultCard";
import { AddSecretModal } from "@/components/vault/AddSecretModal";
import { LowBalanceBanner } from "@/components/LowBalanceBanner";
import { AngularButton } from "@/components/ui/AngularButton";
import { ConnectWallet } from "@/components/ConnectWallet";
import { ScrollingTicker } from "@/components/ui/ScrollingTicker";
import { useVaultStore } from "@/lib/store";
import { useCofhe } from "@/hooks/useCofhe";
import { useHydrateVault } from "@/hooks/useHydrateVault";

const TICKER = [
  "VAULT ACTIVE",
  "FHE ENCRYPTED",
  "████████████████",
  "ZERO PLAINTEXT",
  "ONCHAIN STORAGE",
  "████████████████",
  "ONLY YOU DECRYPT",
  "FHENIX coFHE",
  "████████████████",
];

const FILTER_TABS = ["All", "Passwords", "Seeds", "Notes", "Keys"] as const;

export default function VaultPage() {
  const { isConnected } = useAccount();
  const { isCofheConnected } = useCofhe();
  const { entries, openAddModal } = useVaultStore();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof FILTER_TABS)[number]>("All");

  useHydrateVault();

  const filtered = entries.filter((e) =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Not connected wall ── */
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col">
        <ScrollingTicker items={TICKER} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="font-mono text-5xl text-[rgba(0,255,178,0.08)] mb-8 select-none"
              aria-hidden
            >
              ████████████████████████████
            </div>
            <span className="inline-block bg-black text-white font-mono text-sm font-bold tracking-[0.12em] px-3 py-1.5 uppercase mb-6">
              [REDACTED]
            </span>
            <h1 className="font-['Syne'] text-4xl font-extrabold text-[#E8EDF5] tracking-tight mb-3">
              Clearance required.
            </h1>
            <p className="text-[#4A5A72] text-sm mb-10 max-w-sm">
              Connect your wallet to access your encrypted vault. Your wallet
              is your key — literally.
            </p>
            <ConnectWallet />
            <p className="mt-6 font-mono text-[10px] text-[#4A5A72]/50 tracking-widest">
              "Your wallet is your key. Literally."
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#07090E]">
      {/* Sidebar */}
      <VaultSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <ScrollingTicker items={TICKER} />

        <div className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
          <LowBalanceBanner />

          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1">
                Authenticated Vault
              </p>
              <h1 className="font-['Syne'] text-3xl font-extrabold text-[#E8EDF5] tracking-tight">
                My Vault
              </h1>
            </div>
            <AngularButton onClick={openAddModal} size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add Secret
            </AngularButton>
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4A5A72]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search encrypted vault..."
                className="field pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border border-[rgba(0,255,178,0.08)] bg-[#0D1119] p-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all ${
                    activeTab === tab
                      ? "bg-[rgba(0,255,178,0.1)] text-[#00FFB2]"
                      : "text-[#4A5A72] hover:text-[#E8EDF5]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-3 mb-8">
            <div className="border border-[rgba(0,255,178,0.1)] bg-[#0D1119] px-5 py-3">
              <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1">
                Entries
              </p>
              <p className="font-['Syne'] text-2xl font-bold text-[#E8EDF5]">
                {String(entries.length).padStart(2, "0")}
              </p>
            </div>
            <div className="border border-[rgba(0,255,178,0.1)] bg-[#0D1119] px-5 py-3">
              <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1">
                Encryption
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    isCofheConnected
                      ? "bg-[#00FFB2] animate-pulse"
                      : "bg-[#FFBD2E] animate-pulse"
                  }`}
                />
                <span className="font-['Syne'] text-sm font-bold text-[#E8EDF5]">
                  {isCofheConnected ? "FHE Active" : "Connecting…"}
                </span>
              </div>
            </div>
          </div>

          {/* Vault grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-[rgba(0,255,178,0.06)]">
              <div
                className="font-mono text-5xl text-[rgba(0,255,178,0.06)] mb-6 select-none"
                aria-hidden
              >
                ████████████████████████████
              </div>
              <Lock className="h-8 w-8 text-[#4A5A72]/30 mb-4" />
              <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.35em] uppercase">
                {search ? "No matching entries" : "Vault empty"}
              </p>
              {!search && (
                <button
                  onClick={openAddModal}
                  className="mt-6 border border-[rgba(0,255,178,0.1)] hover:border-[rgba(0,255,178,0.3)] px-5 py-2.5 font-mono text-[10px] text-[#4A5A72] hover:text-[#00FFB2] uppercase tracking-widest transition-all"
                >
                  + Add First Secret
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence>
                {filtered.map((entry, i) => (
                  <VaultCard key={entry.label} entry={entry} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AddSecretModal />
    </div>
  );
}
