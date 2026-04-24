import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@cofhe/sdk",
    "hardhat",
    "@nomicfoundation/hardhat-toolbox",
    "@nomicfoundation/hardhat-toolbox-viem",
    "@nomicfoundation/hardhat-ignition",
    "@nomicfoundation/hardhat-ignition-viem",
    "solc",
  ],
  webpack: (config) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      "pino-pretty",
      "lokijs",
      "encoding",
    ];
    return config;
  },
};

export default nextConfig;
