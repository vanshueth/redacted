"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  value: string;
  full?: string;
  className?: string;
}

export function CipherHandle({ value, full, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(full ?? value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="FHE ciphertext handle — not your password. Click to copy."
      className={`group inline-flex items-center gap-1.5 font-mono text-xs text-[#00FFB2]/60 hover:text-[#00FFB2] transition-colors ${className}`}
    >
      <span>{value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-[#00FFB2] flex-shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      )}
    </button>
  );
}
