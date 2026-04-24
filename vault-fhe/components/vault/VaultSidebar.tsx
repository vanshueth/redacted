"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Lock, FileText, Key, Users, Settings } from "lucide-react";
import { CoFHEBadge } from "@/components/ui/Badges";
import { useCofhe } from "@/hooks/useCofhe";

const NAV = [
  { label: "My Vault",      href: "/vault",        icon: Lock },
  { label: "Secure Notes",  href: "/vault?tab=notes",   icon: FileText },
  { label: "Seed Phrases",  href: "/vault?tab=seeds",   icon: Key },
  { label: "Shared With Me",href: "/vault?tab=shared",  icon: Users },
  { label: "Settings",      href: "/vault?tab=settings",icon: Settings },
];

export function VaultSidebar() {
  const { address } = useAccount();
  const { isCofheConnected } = useCofhe();
  const pathname = usePathname();

  const short = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "—";

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r border-[rgba(0,255,178,0.07)] bg-[#07090E] min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(0,255,178,0.07)]">
        <Link href="/" className="select-none">
          <span className="inline-block bg-black text-white font-mono text-xs font-bold tracking-[0.12em] px-2.5 py-1.5 uppercase">
            [REDACTED]
          </span>
        </Link>
      </div>

      {/* Wallet */}
      <div className="px-5 py-4 border-b border-[rgba(0,255,178,0.07)]">
        <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.3em] uppercase mb-1">
          Connected Wallet
        </p>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FFB2] animate-pulse flex-shrink-0" />
          <span className="font-mono text-xs text-[#E8EDF5] tracking-wider">{short}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href === "/vault" && pathname === "/vault");
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-wider uppercase transition-all duration-150 ${
                active
                  ? "bg-[rgba(0,255,178,0.08)] text-[#00FFB2] border-l-2 border-[#00FFB2]"
                  : "text-[#4A5A72] hover:text-[#E8EDF5] hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* coFHE status */}
      <div className="px-5 py-4 border-t border-[rgba(0,255,178,0.07)]">
        {isCofheConnected ? (
          <CoFHEBadge />
        ) : (
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#4A5A72] uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E] animate-pulse" />
            Connecting coFHE…
          </span>
        )}
      </div>
    </aside>
  );
}
