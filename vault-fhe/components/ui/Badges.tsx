export function EncryptedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[rgba(0,255,178,0.08)] border border-[rgba(0,255,178,0.25)] px-2.5 py-1 font-mono text-[10px] font-bold text-[#00FFB2] uppercase tracking-[0.18em]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00FFB2] animate-pulse flex-shrink-0" />
      ENCRYPTED
    </span>
  );
}

export function ExposedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.3)] px-2.5 py-1 font-mono text-[10px] font-bold text-[#FF3B30] uppercase tracking-[0.18em]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] flex-shrink-0" />
      EXPOSED
    </span>
  );
}

export function CoFHEBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[rgba(124,110,250,0.1)] border border-[rgba(124,110,250,0.3)] px-2.5 py-1 font-mono text-[10px] font-bold text-[#7C6EFA] uppercase tracking-[0.18em]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#7C6EFA] animate-pulse flex-shrink-0" />
      coFHE ACTIVE
    </span>
  );
}
