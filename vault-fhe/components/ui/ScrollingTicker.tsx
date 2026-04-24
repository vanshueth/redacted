"use client";

interface Props {
  items: string[];
  className?: string;
}

export function ScrollingTicker({ items, className = "" }: Props) {
  const doubled = [...items, ...items];

  return (
    <div
      className={`ticker-wrap border-y border-[rgba(0,255,178,0.07)] bg-[#0D1119] py-2.5 ${className}`}
    >
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 pr-5"
          >
            <span className="font-mono text-xs text-[#4A5A72] tracking-[0.12em]">
              {item}
            </span>
            <span className="text-[rgba(0,255,178,0.18)] text-sm select-none">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
