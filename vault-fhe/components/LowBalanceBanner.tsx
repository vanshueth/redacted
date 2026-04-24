"use client";

import { useAccount, useBalance } from "wagmi";
import { AlertTriangle } from "lucide-react";

const LOW_BALANCE_THRESHOLD = BigInt("10000000000000000"); // 0.01 ETH

export function LowBalanceBanner() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!balance || balance.value >= LOW_BALANCE_THRESHOLD) return null;

  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        Your balance is low. You may need Sepolia ETH to save passwords.
      </span>
    </div>
  );
}
