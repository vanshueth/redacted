"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AngularButton } from "@/components/ui/AngularButton";
import { TechBadge } from "@/components/ui/TechBadge";

const COMPARISON = [
  {
    feature: "Storage location",
    lastpass: "Company servers",
    metamask: "Local device",
    vaultx: "Onchain (FHE)",
  },
  {
    feature: "Encryption",
    lastpass: "AES-256",
    metamask: "AES-256",
    vaultx: "FHE ciphertext",
  },
  {
    feature: "Who can decrypt",
    lastpass: "The company",
    metamask: "You (device)",
    vaultx: "You (wallet)",
  },
  {
    feature: "Breach risk",
    lastpass: "High",
    metamask: "Medium",
    vaultx: "Zero (no server)",
  },
  {
    feature: "Onchain verifiable",
    lastpass: "No",
    metamask: "No",
    vaultx: "Yes",
  },
];

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-t border-[rgba(0,255,178,0.07)] pt-12"
    >
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-mono text-2xl font-bold text-[rgba(0,255,178,0.15)]">
          {num}
        </span>
        <h2 className="font-['Syne'] text-2xl font-extrabold text-[#E8EDF5] tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#07090E]">
      {/* Nav */}
      <nav className="border-b border-[rgba(0,255,178,0.06)] bg-[#07090E]/90 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="select-none">
            <span className="inline-block bg-black text-white font-mono text-sm font-bold tracking-[0.12em] px-3 py-1.5 uppercase">
              [REDACTED]
            </span>
          </Link>
          <Link href="/">
            <button className="flex items-center gap-2 font-mono text-xs text-[#4A5A72] hover:text-[#E8EDF5] uppercase tracking-widest transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.4em] uppercase mb-4">
            Technical Overview
          </p>
          <h1 className="font-['Syne'] text-5xl font-extrabold text-[#E8EDF5] tracking-[-0.03em] mb-4">
            How it works.
          </h1>
          <p className="text-[#4A5A72] text-base leading-relaxed max-w-xl">
            A deep-dive into Fully Homomorphic Encryption, Fhenix coFHE, and
            how Redacted uses them to keep your vault unseeable.
          </p>
        </div>

        {/* 1. What is FHE */}
        <Section num="01" title="What is FHE?">
          <p className="text-[#4A5A72] leading-relaxed mb-6">
            Fully Homomorphic Encryption (FHE) is a form of encryption that
            allows computations to be performed directly on ciphertext —
            without ever decrypting it. The result of the computation, when
            decrypted, matches what you would have gotten by computing on
            plaintext.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                label: "Normal data",
                value: "MyP@ssw0rd",
                color: "red",
                note: "Readable. Vulnerable.",
              },
              {
                label: "Encrypted data",
                value: "AES: •••••••",
                color: "default",
                note: "Safe at rest. Decrypt to use.",
              },
              {
                label: "FHE data",
                value: "euint256: 0x7f…",
                color: "green",
                note: "Compute without decrypting.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`border p-4 ${
                  item.color === "red"
                    ? "border-[rgba(255,59,48,0.2)] bg-[rgba(255,59,48,0.03)]"
                    : item.color === "green"
                    ? "border-[rgba(0,255,178,0.2)] bg-[rgba(0,255,178,0.03)]"
                    : "border-[rgba(255,255,255,0.07)] bg-[#0D1119]"
                }`}
              >
                <p className="font-mono text-[9px] text-[#4A5A72] tracking-widest uppercase mb-2">
                  {item.label}
                </p>
                <p
                  className={`font-mono text-sm mb-2 ${
                    item.color === "red"
                      ? "text-[#FF3B30]"
                      : item.color === "green"
                      ? "text-[#00FFB2]"
                      : "text-[#E8EDF5]"
                  }`}
                >
                  {item.value}
                </p>
                <p className="font-mono text-[10px] text-[#4A5A72]">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Fhenix coFHE */}
        <Section num="02" title="What is Fhenix coFHE?">
          <p className="text-[#4A5A72] leading-relaxed mb-6">
            Fhenix coFHE (Collaborative FHE) is a system where FHE computation
            is offloaded to a specialised off-chain co-processor. This removes
            the gas burden of on-chain FHE while preserving all privacy
            guarantees. The blockchain stores only ciphertext; computation
            happens off-chain; results return as ciphertext.
          </p>
          <div className="border border-[rgba(124,110,250,0.15)] bg-[rgba(124,110,250,0.04)] p-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#7C6EFA] mb-4">
              {[
                "User browser",
                "→",
                "cofhejs encrypt",
                "→",
                "Fhenix contract",
                "→",
                "coFHE processor",
                "→",
                "ciphertext result",
                "→",
                "local decrypt",
              ].map((s, i) => (
                <span key={i} className={s === "→" ? "text-[#4A5A72]" : ""}>
                  {s}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <TechBadge label="50× faster than competing FHE" color="purple" />
              <TechBadge label="No TEEs" color="green" />
              <TechBadge label="No ZK workarounds" color="green" />
            </div>
          </div>
        </Section>

        {/* 3. How Redacted uses it */}
        <Section num="03" title="How Redacted uses it">
          <div className="space-y-3">
            {[
              {
                step: "cofhejs.encrypt()",
                desc: "Your plaintext is encrypted client-side inside the browser using the cofhejs SDK. It never leaves your device as plaintext.",
                color: "green",
              },
              {
                step: "Smart contract write",
                desc: "The FHE ciphertext (euint256) is sent to the Fhenix vault contract. The blockchain sees only the encrypted blob.",
                color: "purple",
              },
              {
                step: "euint256 stored onchain",
                desc: "The ciphertext handle is stored against your wallet address and a label. Retrievable any time, anywhere.",
                color: "purple",
              },
              {
                step: "cofhejs.unseal() on retrieve",
                desc: "To decrypt, you sign a wallet permit. cofhejs decrypts locally. Your plaintext never hits any server.",
                color: "green",
              },
            ].map(({ step, desc, color }, i) => (
              <div
                key={i}
                className="flex gap-4 border border-[rgba(0,255,178,0.07)] bg-[#0D1119] p-4"
              >
                <div
                  className={`flex-shrink-0 font-mono text-xs font-bold px-2 py-0.5 h-fit border ${
                    color === "green"
                      ? "text-[#00FFB2] border-[rgba(0,255,178,0.25)] bg-[rgba(0,255,178,0.05)]"
                      : "text-[#7C6EFA] border-[rgba(124,110,250,0.25)] bg-[rgba(124,110,250,0.05)]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <p
                    className={`font-mono text-sm font-bold mb-1 ${
                      color === "green" ? "text-[#00FFB2]" : "text-[#7C6EFA]"
                    }`}
                  >
                    {step}
                  </p>
                  <p className="text-sm text-[#4A5A72]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Comparison table */}
        <Section num="04" title="Why not a regular password manager?">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[rgba(0,255,178,0.1)]">
                  <th className="text-left font-mono text-[9px] text-[#4A5A72] tracking-[0.3em] uppercase px-4 py-3" />
                  {["LastPass", "MetaMask Vault", "VaultX"].map((h) => (
                    <th
                      key={h}
                      className={`text-left font-mono text-[9px] tracking-[0.2em] uppercase px-4 py-3 ${
                        h === "VaultX"
                          ? "text-[#00FFB2]"
                          : "text-[#4A5A72]"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[rgba(0,255,178,0.05)] hover:bg-[rgba(0,255,178,0.02)] transition-colors"
                  >
                    <td className="font-mono text-[10px] text-[#4A5A72] uppercase tracking-wider px-4 py-3">
                      {row.feature}
                    </td>
                    <td className="font-mono text-xs text-[#E8EDF5]/50 px-4 py-3">
                      {row.lastpass}
                    </td>
                    <td className="font-mono text-xs text-[#E8EDF5]/50 px-4 py-3">
                      {row.metamask}
                    </td>
                    <td className="font-mono text-xs text-[#00FFB2] px-4 py-3 font-bold">
                      {row.vaultx}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* CTA */}
        <div className="border-t border-[rgba(0,255,178,0.07)] pt-12 text-center">
          <h2 className="font-['Syne'] text-3xl font-extrabold text-[#E8EDF5] tracking-tight mb-4">
            Convinced?
          </h2>
          <p className="text-[#4A5A72] mb-8">
            Open your encrypted vault in under 30 seconds.
          </p>
          <Link href="/vault">
            <AngularButton size="lg">Launch Vault →</AngularButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
