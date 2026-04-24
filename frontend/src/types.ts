// ─── Shared TypeScript types used across the app ───────────────────────────

/** One saved password entry as shown in the UI */
export interface PasswordEntry {
  index: number;       // position in the on-chain array
  site: string;        // e.g. "github.com"
  username?: string;   // decrypted (only set when the user clicks "Reveal")
  password?: string;   // decrypted (only set when the user clicks "Reveal")
  isRevealed: boolean;
  isDecrypting: boolean;
}

/** App-level authentication state */
export type AppScreen =
  | "connect"       // wallet not yet connected
  | "passkey-setup" // connected but no passkey on-chain yet
  | "passkey-enter" // connected, has passkey — ask user to enter it
  | "dashboard";    // fully authenticated

/** Status of the FHE client */
export type FheStatus = "idle" | "initializing" | "ready" | "error";
