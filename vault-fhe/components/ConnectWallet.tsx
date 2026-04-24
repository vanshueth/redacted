"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AngularButton } from "@/components/ui/AngularButton";

export function ConnectWallet() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!connected ? (
              <AngularButton onClick={openConnectModal} size="sm">
                Connect Wallet
              </AngularButton>
            ) : chain?.unsupported ? (
              <AngularButton onClick={openChainModal} variant="danger" size="sm">
                Wrong Network
              </AngularButton>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  className="hidden sm:flex items-center gap-1.5 border border-[rgba(0,255,178,0.12)] hover:border-[rgba(0,255,178,0.25)] bg-[#0D1119] px-3 py-2 font-mono text-[10px] text-[#4A5A72] hover:text-[#E8EDF5] uppercase tracking-widest transition-all"
                >
                  {chain?.name}
                </button>
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 border border-[rgba(0,255,178,0.15)] hover:border-[rgba(0,255,178,0.35)] bg-[#0D1119] px-3 py-2 font-mono text-[10px] text-[#00FFB2]/70 hover:text-[#00FFB2] uppercase tracking-wider transition-all"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FFB2] animate-pulse" />
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
