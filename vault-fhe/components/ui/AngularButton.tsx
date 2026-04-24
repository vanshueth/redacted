"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const clip = "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)";

export function AngularButton({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: Props) {
  const sizes = {
    sm: "px-5 py-2 text-xs",
    md: "px-7 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  const variants = {
    primary:
      "bg-[#00FFB2] text-[#07090E] hover:bg-[#00e6a0] disabled:bg-[#00FFB2]/30",
    ghost:
      "bg-transparent border border-[rgba(0,255,178,0.35)] text-[#00FFB2] hover:bg-[rgba(0,255,178,0.08)] hover:border-[rgba(0,255,178,0.6)]",
    danger:
      "bg-[rgba(255,59,48,0.1)] border border-[rgba(255,59,48,0.4)] text-[#FF3B30] hover:bg-[rgba(255,59,48,0.18)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{ clipPath: clip }}
      className={`
        inline-flex items-center justify-center gap-2
        font-['Syne'] font-bold tracking-widest uppercase
        transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}
      `}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
