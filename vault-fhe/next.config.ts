import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      porto: false,
      "porto/internal": false,
      accounts: false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
    };
    return config;
  },
};

export default nextConfig;
