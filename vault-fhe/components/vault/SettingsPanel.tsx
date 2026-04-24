"use client";

import { useAccount, useDisconnect, useBalance, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { useCofhe } from "@/hooks/useCofhe";
import { useVaultStore } from "@/lib/store";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { Copy, LogOut, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 text-[#4A5A72] hover:text-[#00FFB2] transition-colors"
    >
      {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(0,255,178,0.06)] last:border-0">
      <span className="font-mono text-[9px] text-[#4A5A72] tracking-[0.3em] uppercase">{label}</span>
      <span className={`${mono ? "font-mono text-xs" : "text-sm font-medium"} text-[#E8EDF5]`}>{value}</span>
    </div>
  );
}

export function SettingsPanel() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { isCofheConnected } = useCofhe();
  const { entries } = useVaultStore();
  const { data: balance } = useBalance({ address });

  const short = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`;

  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <p className="font-mono text-[10px] text-[#4A5A72] tracking-[0.35em] uppercase mb-1">
          Configuration
        </p>
        <h1 className="font-['Syne'] text-3xl font-extrabold text-[#E8EDF5] tracking-tight">
          Settings
        </h1>
      </div>

      {/* Wallet */}
      <section className="border border-[rgba(0,255,178,0.1)] bg-[#0D1119]">
        <div className="px-5 py-3 border-b border-[rgba(0,255,178,0.07)]">
          <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase">Wallet</p>
        </div>
        <div className="px-5">
          <Row
            label="Address"
            value={
              address ? (
                <span className="flex items-center">
                  {short(address)}
                  <CopyButton value={address} />
                </span>
              ) : "—"
            }
          />
          <Row
            label="Balance"
            value={
              balance
                ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}`
                : "—"
            }
          />
          <Row label="Network" value={chainId === 11155111 ? "Ethereum Sepolia" : `Chain ${chainId}`} />
        </div>
        <div className="px-5 py-4">
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 border border-[rgba(255,59,48,0.2)] hover:border-[rgba(255,59,48,0.5)] px-4 py-2 font-mono text-[9px] tracking-[0.25em] text-[#FF3B30] uppercase transition-all"
          >
            <LogOut className="h-3 w-3" />
            Disconnect Wallet
          </button>
        </div>
      </section>

      {/* Vault */}
      <section className="border border-[rgba(0,255,178,0.1)] bg-[#0D1119]">
        <div className="px-5 py-3 border-b border-[rgba(0,255,178,0.07)]">
          <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase">Vault</p>
        </div>
        <div className="px-5">
          <Row
            label="Contract"
            value={
              <span className="flex items-center">
                {short(CONTRACT_ADDRESS)}
                <CopyButton value={CONTRACT_ADDRESS} />
              </span>
            }
          />
          <Row label="Total Entries" value={String(entries.length).padStart(2, "0")} />
          <Row label="Encryption" value={
            <span className={`flex items-center gap-1.5 ${isCofheConnected ? "text-[#00FFB2]" : "text-[#FFBD2E]"}`}>
              {isCofheConnected
                ? <><CheckCircle className="h-3 w-3" /> FHE Active</>
                : <><XCircle className="h-3 w-3" /> Connecting…</>
              }
            </span>
          } />
        </div>
      </section>

      {/* Network */}
      <section className="border border-[rgba(0,255,178,0.1)] bg-[#0D1119]">
        <div className="px-5 py-3 border-b border-[rgba(0,255,178,0.07)]">
          <p className="font-mono text-[9px] text-[#4A5A72] tracking-[0.35em] uppercase">Network</p>
        </div>
        <div className="px-5">
          <Row label="Chain ID" value="11155111" />
          <Row label="RPC" value="ethereum-sepolia-rpc.publicnode.com" />
          <Row label="FHE Provider" value="Fhenix coFHE" />
        </div>
      </section>
    </div>
  );
}
