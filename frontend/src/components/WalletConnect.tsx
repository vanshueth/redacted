/**
 * WalletConnect — The landing screen.
 * Shows when no wallet is connected. Has one big "Connect Wallet" button.
 */

import { Wallet, Shield, Lock, Eye } from "lucide-react";

interface Props {
  onConnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

export function WalletConnect({ onConnect, isConnecting, error }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center glow">
            <Lock className="w-10 h-10 text-brand-400" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">FHE Password</span>
          <br />
          <span className="text-white">Manager</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          Your passwords live on the blockchain, encrypted with{" "}
          <span className="text-brand-400 font-semibold">
            Fully Homomorphic Encryption
          </span>
          . Even we can't read them.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-2xl w-full">
        {[
          {
            icon: <Wallet className="w-5 h-5 text-brand-400" />,
            title: "Wallet Login",
            desc: "No email or password needed — your crypto wallet is your identity",
          },
          {
            icon: <Shield className="w-5 h-5 text-brand-400" />,
            title: "Double Encrypted",
            desc: "XOR passkey layer + FHE blockchain encryption — two locks, one key",
          },
          {
            icon: <Eye className="w-5 h-5 text-brand-400" />,
            title: "Zero Knowledge",
            desc: "Nobody — not even the blockchain nodes — can see your passwords",
          },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="flex justify-center mb-3">{f.icon}</div>
            <h3 className="font-semibold text-sm text-white mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Connect button */}
      <div className="w-full max-w-xs">
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="btn-primary w-full text-base py-4"
        >
          {isConnecting ? (
            <>
              <span className="animate-spin text-lg">⟳</span>
              Connecting…
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect MetaMask
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
        )}

        <p className="mt-4 text-center text-xs text-gray-600">
          Don't have MetaMask?{" "}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 hover:underline"
          >
            Install it here
          </a>
        </p>
      </div>
    </div>
  );
}
