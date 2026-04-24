import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "VaultFHE",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "3b24e99cf5ded7a7f5db48f63fedc7a8",
  chains: [sepolia],
  ssr: false,
});
