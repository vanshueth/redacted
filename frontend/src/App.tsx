/**
 * App.tsx — The root component. Manages which screen to show based on
 * the user's current authentication state.
 *
 * Screen flow:
 *   "connect"       → WalletConnect  (user hasn't connected MetaMask)
 *   "passkey-setup" → PasskeySetup   (first-time: create a passkey)
 *   "passkey-enter" → PasskeySetup   (returning: enter passkey to unlock)
 *   "dashboard"     → PasswordDashboard (fully authenticated)
 */

import { useEffect, useState } from "react";
import { useWallet } from "./hooks/useWallet";
import { usePasskey } from "./hooks/usePasskey";
import { useFHE } from "./hooks/useFHE";
import { usePasswords } from "./hooks/usePasswords";
import { WalletConnect } from "./components/WalletConnect";
import { PasskeySetup } from "./components/PasskeySetup";
import { PasswordDashboard } from "./components/PasswordDashboard";
import type { AppScreen } from "./types";
import { SUPPORTED_CHAIN } from "./utils/constants";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("connect");

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const wallet = useWallet();
  const passkey = usePasskey(wallet.signer);
  const fhe = useFHE();
  const passwords = usePasswords(
    wallet.signer,
    passkey.keyHigh,
    passkey.keyLow,
    fhe
  );

  // ── Screen Transitions ─────────────────────────────────────────────────────

  // Step 1: Wallet connected → initialize FHE client + check for passkey
  useEffect(() => {
    if (!wallet.address || !wallet.signer || !wallet.provider) return;
    if (screen !== "connect") return; // already moved past connect

    (async () => {
      // Start the FHE co-processor in parallel with the passkey check
      fhe.initialize(wallet.provider!, wallet.signer as never, SUPPORTED_CHAIN.cofheNetwork);
      const hasPasskey = await passkey.checkPasskeyOnChain();
      setScreen(hasPasskey ? "passkey-enter" : "passkey-setup");
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address]);

  // Step 2: Passkey unlocked → go to dashboard
  useEffect(() => {
    if (passkey.isUnlocked && screen !== "dashboard") {
      setScreen("dashboard");
    }
  }, [passkey.isUnlocked, screen]);

  // Step 3: Lock → back to passkey entry
  const handleLock = () => {
    passkey.lock();
    setScreen("passkey-enter");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (screen === "connect") {
    return (
      <WalletConnect
        onConnect={wallet.connect}
        isConnecting={wallet.isConnecting}
        error={wallet.error}
      />
    );
  }

  if (screen === "passkey-setup" || screen === "passkey-enter") {
    return (
      <PasskeySetup
        mode={screen === "passkey-setup" ? "setup" : "enter"}
        onSubmit={
          screen === "passkey-setup"
            ? passkey.setupPasskey
            : passkey.verifyAndUnlock
        }
        isLoading={passkey.isLoading}
        error={passkey.error}
        walletAddress={wallet.address ?? ""}
      />
    );
  }

  // screen === "dashboard"
  return (
    <PasswordDashboard
      walletAddress={wallet.address ?? ""}
      fheStatus={fhe.status}
      passwords={passwords.passwords}
      isLoading={passwords.isLoading}
      error={passwords.error ?? fhe.error}
      onLoadPasswords={passwords.loadPasswords}
      onAddPassword={passwords.addPassword}
      onDeletePassword={passwords.deletePassword}
      onRevealPassword={passwords.revealPassword}
      onHidePassword={passwords.hidePassword}
      onLock={handleLock}
      clearError={passwords.clearError}
    />
  );
}
