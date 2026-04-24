interface Props {
  label: string;
  color?: "green" | "purple" | "blue" | "red" | "default";
}

const palette = {
  green:   "bg-[rgba(0,255,178,0.07)]  border-[rgba(0,255,178,0.25)]  text-[#00FFB2]",
  purple:  "bg-[rgba(124,110,250,0.07)] border-[rgba(124,110,250,0.3)] text-[#7C6EFA]",
  blue:    "bg-[rgba(96,165,250,0.07)]  border-[rgba(96,165,250,0.25)] text-[#60A5FA]",
  red:     "bg-[rgba(255,59,48,0.07)]   border-[rgba(255,59,48,0.25)]  text-[#FF3B30]",
  default: "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] text-[#E8EDF5]",
};

export function TechBadge({ label, color = "default" }: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 font-mono text-[10px] font-bold border uppercase tracking-[0.18em] ${palette[color]}`}
    >
      {label}
    </span>
  );
}
