import type { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const privateKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";

const config: HardhatUserConfig = {
  plugins: [],
  solidity: {
    profiles: {
      default: {
        version: "0.8.26",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },
  networks: {
    sepolia: {
      type: "http",
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: privateKey ? [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`] : [],
      chainId: 11155111,
    },
  },
};

export default config;
