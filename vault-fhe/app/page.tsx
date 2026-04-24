"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Lock,
  Key,
  Database,
  Users,
  Code2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { AngularButton } from "@/components/ui/AngularButton";
import { ScrollingTicker } from "@/components/ui/ScrollingTicker";
import { EncryptedBadge, ExposedBadge } from "@/components/ui/Badges";
import { TechBadge } from "@/components/ui/TechBadge";
import { CipherHandle } from "@/components/ui/CipherHandle";

/* ─── Static data ─── */
const TICKER_ITEMS = [
  "0x1a2b3c...████",
  "0x9e0f14...████",
  "████████████████",
  "0x5e6f88...████",
  "PASSWORD",
  "████████",
  "SEED PHRASE",
  "0xcea345...████",
  "PRIVATE KEY",
  "████████████",
  "0x7f3a9b...████",
  "SECRET NOTE",
  "0x4b912e...████",
  "████████████████",
  "API KEY",
  "0xd9a021...████",
];

const FEATURES = [
  {
    num: "01",
    title: "FHE Vault",
    desc: "Passwords stored as euint256 ciphertext. The chain never sees plaintext.",
    icon: Lock,
    accent: "green",
  },
  {
    num: "02",
    title: "Wallet Auth",
    desc: "Your private key IS your login. No email. No master password.",
    icon: Key,
    accent: "green",
  },
  {
    num: "03",
    title: "Onchain Storage",
    desc: "Powered by Fhenix coFHE on Ethereum. Permissionless, decentralised, always accessible.",
    icon: Database,
    accent: "purple",
  },
  {
    num: "04",
    title: "Any Data Type",
    desc: "Passwords, seed phrases, private keys, notes — any string, encrypted.",
    icon: ShieldCheck,
    accent: "green",
  },
  {
    num: "05",
    title: "Selective Access",
    desc: "Share encrypted records with other wallets via FHE permits. No exposure to the network.",
    icon: Users,
    accent: "purple",
  },
  {
    num: "06",
    title: "Open Source",
    desc: "Contracts auditable on Fhenix. No black boxes. Ever.",
    icon: Code2,
    accent: "green",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "Your wallet address is your identity. No signup. No email.",
  },
  {
    num: "02",
    title: "Encrypt Locally",
    desc: "cofhejs encrypts in-browser. Plaintext never touches the network.",
  },
  {
    num: "03",
    title: "Store Onchain",
    desc: "Only FHE ciphertext is written to the Fhenix contract. Plaintext destroyed.",
  },
  {
    num: "04",
    title: "Decrypt & Retrieve",
    desc: "Wallet permit triggers local decryption via cofhejs. Never server-side.",
  },
];

const CODE = `// Redacted vault contract
function storeSecret(
  euint256 encryptedData,
  bytes32  label
) external {
  vault[msg.sender][label] = encryptedData;
  // plaintext: never stored.
  //            never transmitted.
  //            never seen.
}`;

/* ─── Encryption demo ─── */
function EncryptionDemo() {
  const [phase, setPhase] = useState(0);
  const password = "MyP@ssw0rd123";
  const cipher = "euint256: 0x7f3a9b91c4e2...";
  const total = password.length;

  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p >= total + 6 ? 0 : p + 1)),
      130
    );
    return () => clearInterval(id);
  }, [total]);

  const chars = password.split("").map((c, i) => (i < phase ? "█" : c));
  const isCipher = phase > total;
  const display = isCipher ? cipher : chars.join("");

  return (
    <div className="border border-[rgba(0,255,178,0.1)] bg-[#141A26] p-4 mt-4">
      <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.3em] uppercase mb-2">
        Live encryption →
      </p>
      <p
        className={`font-mono text-sm transition-colors duration-200 ${
          isCipher ? "text-[#00FFB2]" : "text-[#E8EDF5]"
        }`}
      >
        {display}
      </p>
    </div>
  );
}

/* ─── Glitch headline ─── */
function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span
      className={`glitch ${className}`}
      data-text={children}
    >
      {children}
    </span>
  );
}

/* ─── Code block with syntax colour ─── */
function CodeBlock({ code }: { code: string }) {
  return (
    <div className="border border-[rgba(0,255,178,0.12)] bg-[#0D1119] overflow-hidden">
      {/* terminal bar */}
      <div className="flex items-center gap-2 border-b border-[rgba(0,255,178,0.07)] bg-[#141A26] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF3B30]/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#00FFB2]/50" />
        <span className="ml-3 font-mono text-xs text-[#4A5A72]">vault.sol</span>
      </div>
      <pre className="p-5 font-mono text-xs leading-relaxed overflow-x-auto">
        {code.split("\n").map((line, i) => {
          let cls = "text-[#E8EDF5]";
          if (line.trimStart().startsWith("//")) cls = "text-[#4A5A72]";
          else if (/\b(function|external|public)\b/.test(line)) cls = "text-[#7C6EFA]";
          else if (/\b(euint256|bytes32|uint256)\b/.test(line)) cls = "text-[#00FFB2]";
          return (
            <div key={i} className={cls}>
              {line || " "}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/* ─── Page ─── */
export default function Home() {
  const [redactHovered, setRedactHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090E]">
      {/* ══ NAVBAR ══ */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(0,255,178,0.06)] bg-[#07090E]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="select-none">
            <span className="inline-block bg-black text-white font-mono text-sm font-bold tracking-[0.12em] px-3 py-1.5 uppercase">
              [REDACTED]
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "How It Works", href: "/how-it-works", external: false },
              { label: "Vault", href: "/vault", external: false },
              { label: "Docs", href: "https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start", external: true },
            ].map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#4A5A72] hover:text-[#E8EDF5] tracking-widest uppercase transition-colors"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="font-mono text-xs text-[#4A5A72] hover:text-[#E8EDF5] tracking-widest uppercase transition-colors"
                >
                  {label}
                </Link>
              )
            )}
            <a
              href="https://fhenix.io"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-[#7C6EFA]/70 hover:text-[#7C6EFA] tracking-widest uppercase transition-colors"
            >
              Fhenix <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <ConnectWallet />
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden">
        <ScrollingTicker items={TICKER_ITEMS} />

        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              {/* Fhenix pill */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 inline-flex items-center gap-2.5 border border-[rgba(124,110,250,0.3)] bg-[rgba(124,110,250,0.07)] px-4 py-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C6EFA] animate-pulse" />
                <span className="font-mono text-[10px] text-[#7C6EFA] tracking-[0.3em] uppercase">
                  Powered by Fhenix coFHE
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="font-['Syne'] text-[clamp(2.8rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#E8EDF5] mb-6"
              >
                <GlitchText>Your passwords.</GlitchText>
                <br />
                {/* Redaction bar that reveals "Encrypted." on hover */}
                <span
                  className="relative inline-block cursor-pointer select-none"
                  onMouseEnter={() => setRedactHovered(true)}
                  onMouseLeave={() => setRedactHovered(false)}
                >
                  <motion.span
                    animate={redactHovered
                      ? { backgroundColor: "transparent", color: "#00FFB2" }
                      : { backgroundColor: "#000", color: "transparent" }
                    }
                    transition={{ duration: 0.25 }}
                    className="inline-block px-2"
                  >
                    {redactHovered ? "Encrypted." : "██████████."}
                  </motion.span>
                </span>
                <br />
                Onchain.
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[#4A5A72] text-base leading-relaxed mb-3 max-w-lg"
              >
                Redacted uses Fhenix coFHE to store your vault as FHE ciphertext.
                The blockchain witnesses only encrypted payloads.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-xs text-[#4A5A72]/60 tracking-wider mb-10"
              >
                Not even validators can read your data.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link href="/vault">
                  <AngularButton size="lg">Open Vault →</AngularButton>
                </Link>
                <Link href="/how-it-works">
                  <AngularButton variant="ghost" size="lg">
                    ▶ How FHE works
                  </AngularButton>
                </Link>
              </motion.div>
            </div>

            {/* Right: EXPOSED vs REDACTED panel */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {/* EXPOSED */}
                <div className="border border-[rgba(255,59,48,0.25)] bg-[rgba(255,59,48,0.04)] p-5 relative overflow-hidden">
                  <ExposedBadge />
                  <p className="mt-4 font-mono text-[9px] text-[#4A5A72] tracking-[0.25em] uppercase mb-1.5">
                    Your password
                  </p>
                  <p className="font-mono text-sm text-[#FF3B30] break-all leading-snug">
                    MyP@ssw0rd123
                  </p>
                  <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-[rgba(255,59,48,0.08)]" />
                </div>

                {/* REDACTED */}
                <div className="border border-[rgba(0,255,178,0.22)] bg-[rgba(0,255,178,0.03)] p-5 relative overflow-hidden">
                  <EncryptedBadge />
                  <p className="mt-4 font-mono text-[9px] text-[#4A5A72] tracking-[0.25em] uppercase mb-1.5">
                    On Ethereum
                  </p>
                  <CipherHandle value="euint256: 0x7f3a...b91c" />
                  <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-[rgba(0,255,178,0.05)]" />
                </div>
              </div>

              {/* Arrow caption */}
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-[rgba(255,59,48,0.2)]" />
                <span className="font-mono text-[10px] text-[#4A5A72] tracking-wider flex items-center gap-1.5">
                  FHE encrypts
                  <ArrowRight className="h-3 w-3 text-[#00FFB2]" />
                  before chain
                </span>
                <div className="h-px flex-1 bg-[rgba(0,255,178,0.2)]" />
              </div>

              {/* Caption */}
              <p className="font-mono text-[10px] text-[#4A5A72]/60 text-center tracking-wider">
                "FHE ciphertext handle — not your password."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <div className="border-y border-[rgba(0,255,178,0.06)] bg-[#0D1119] py-4">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {[
            "256-bit FHE",
            "0 Servers",
            "Only YOU Decrypt",
            "Powered by coFHE",
            "Compute on Ciphertext",
            "No TEEs",
            "No ZK Workarounds",
          ].map((s, i) => (
            <span
              key={s}
              className="flex items-center gap-4 font-mono text-[10px] text-[#4A5A72] uppercase tracking-[0.2em] whitespace-nowrap"
            >
              {i > 0 && (
                <span className="text-[rgba(0,255,178,0.15)]">·</span>
              )}
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ══ PROBLEM / SOLUTION ══ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-[rgba(255,59,48,0.15)] bg-[rgba(255,59,48,0.03)] p-8"
          >
            <p className="font-mono text-[10px] text-[#FF3B30] tracking-[0.35em] uppercase mb-4">
              The Problem
            </p>
            <h2 className="font-['Syne'] text-3xl font-extrabold text-[#E8EDF5] leading-tight mb-4 tracking-[-0.02em]">
              Your seed phrase is one database breach away.
            </h2>
            <p className="text-[#4A5A72] text-sm leading-relaxed">
              Password managers store your keys on their servers. You are
              trusting them. LastPass got breached. 1Password could be next.
              You should not have to trust anyone with your secrets.
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="border border-[rgba(0,255,178,0.15)] bg-[rgba(0,255,178,0.02)] p-8"
          >
            <p className="font-mono text-[10px] text-[#00FFB2] tracking-[0.35em] uppercase mb-4">
              The Solution
            </p>
            <h2 className="font-['Syne'] text-3xl font-extrabold text-[#E8EDF5] leading-tight mb-4 tracking-[-0.02em]">
              Watch it disappear.
            </h2>
            <EncryptionDemo />
            <p className="mt-4 font-mono text-[10px] text-[#4A5A72] leading-relaxed">
              Encrypted client-side. Stored as FHE ciphertext. Only your wallet
              holds the decryption key.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.4em] uppercase mb-3">
            Capabilities
          </p>
          <h2 className="font-['Syne'] text-4xl font-extrabold text-[#E8EDF5] tracking-[-0.02em]">
            Built for the paranoid.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group border border-[rgba(0,255,178,0.08)] hover:border-[rgba(0,255,178,0.2)] bg-[#0D1119] p-6 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-mono text-xs text-[#4A5A72]">{f.num}</span>
                <f.icon
                  className={`h-4 w-4 ${
                    f.accent === "purple" ? "text-[#7C6EFA]" : "text-[#00FFB2]"
                  } opacity-60 group-hover:opacity-100 transition-opacity`}
                />
              </div>
              <h3 className="font-['Syne'] text-lg font-bold text-[#E8EDF5] tracking-tight mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[#4A5A72] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="border-y border-[rgba(0,255,178,0.06)] bg-[#0D1119] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.4em] uppercase mb-3">
              Process
            </p>
            <h2 className="font-['Syne'] text-4xl font-extrabold text-[#E8EDF5] tracking-[-0.02em]">
              How it works.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative border border-[rgba(0,255,178,0.08)] bg-[#141A26] p-6"
              >
                <div className="font-mono text-3xl font-bold text-[rgba(0,255,178,0.1)] mb-4 leading-none">
                  {step.num}
                </div>
                <h3 className="font-['Syne'] text-base font-bold text-[#E8EDF5] mb-2">
                  {step.title}
                </h3>
                <p className="font-mono text-[11px] text-[#4A5A72] leading-relaxed">
                  {step.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-1.5 z-10 -translate-y-1/2">
                    <ChevronRight className="h-3 w-3 text-[rgba(0,255,178,0.25)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TECH + CODE ══ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] text-[#7C6EFA] tracking-[0.4em] uppercase mb-4">
              Infrastructure
            </p>
            <h2 className="font-['Syne'] text-4xl font-extrabold text-[#E8EDF5] tracking-[-0.02em] leading-tight mb-4">
              Built on Fhenix coFHE
            </h2>
            <p className="text-[#4A5A72] leading-relaxed mb-6 text-sm">
              CoFHE offloads FHE computation off-chain — 50× faster than
              competing approaches. On-chain gas stays low. Privacy stays
              absolute.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <TechBadge label="coFHE" color="purple" />
              <TechBadge label="Fhenix" color="purple" />
              <TechBadge label="Ethereum" color="blue" />
              <TechBadge label="No TEEs" color="green" />
              <TechBadge label="No ZK Workarounds" color="green" />
            </div>
            <div className="border-l-2 border-[#7C6EFA]/40 pl-4 font-mono text-xs text-[#7C6EFA]/80 leading-relaxed italic">
              "Compute on ciphertext. Never decrypt onchain. Pure FHE."
            </div>
          </motion.div>

          {/* Right: code */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <CodeBlock code={CODE} />
          </motion.div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section className="border-t border-[rgba(0,255,178,0.06)] bg-[#0D1119] py-28 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.4em] uppercase mb-4">
              Redacted
            </p>
            <h2 className="font-['Syne'] text-5xl sm:text-6xl font-extrabold text-[#E8EDF5] tracking-[-0.03em] mb-4">
              Own your secrets.
              <br />
              <span className="text-[#00FFB2]">Finally.</span>
            </h2>
            <p className="text-[#4A5A72] mb-10 text-lg">
              No server. No trust. No exposure. Just cryptography.
            </p>
            <Link href="/vault">
              <AngularButton size="lg">Launch Redacted →</AngularButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-[rgba(0,255,178,0.06)] bg-[#07090E] py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="inline-block bg-black text-white font-mono text-xs font-bold tracking-[0.12em] px-2.5 py-1 uppercase">
              [REDACTED]
            </span>
            <span className="font-mono text-xs text-[#4A5A72]">© 2025</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <span className="font-mono text-xs text-[#4A5A72]">Powered by</span>
            <TechBadge label="FHENIX" color="purple" />
            <TechBadge label="coFHE" color="purple" />
            <span className="font-mono text-xs text-[#4A5A72]">·</span>
            <span className="font-mono text-xs text-[#4A5A72]">Built by @vanshueth</span>
            <span className="font-mono text-xs text-[#4A5A72]">·</span>
            {[
              { label: "Twitter", href: "https://x.com/vanshuETH" },
              { label: "Github", href: "https://github.com/vanshueth/redacted" },
              { label: "Docs", href: "https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[#4A5A72] hover:text-[#00FFB2] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
