"use client";

import { useAccount, useBalance } from "wagmi";
import { AlertTriangle } from "lucide-react";

const LOW_BALANCE_THRESHOLD = BigInt("10000000000000000");

export function LowBalanceBanner() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!balance || balance.value >= LOW_BALANCE_THRESHOLD) return null;

  return (
    <div className="mb-6 flex items-center gap-3 border border-[#f59e0b]/20 bg-[#f59e0b]/[0.04] px-4 py-3">
      <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b] flex-shrink-0" />
      <span className="font-mono text-[9px] tracking-[0.25em] text-[#f59e0b] uppercase">
        LOW BALANCE — SEPOLIA ETH REQUIRED FOR TRANSACTIONS
      </span>
    </div>
  );
}
