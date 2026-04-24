import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@rainbow-me/rainbowkit",
      "wagmi",
      "viem",
      "@walletconnect/ethereum-provider",
    ],
  },
};

export default nextConfig;
