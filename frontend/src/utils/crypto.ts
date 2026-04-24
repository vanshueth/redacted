/**
 * crypto.ts — All client-side cryptographic operations.
 *
 * HOW THE DOUBLE ENCRYPTION WORKS:
 *
 *  1. PASSKEY LAYER (XOR cipher, happens in this file)
 *     - The user's wallet signs a fixed message → deterministic signature
 *     - We hash (signature + passkey) → a 256-bit secret key
 *     - We XOR the username/password bytes with this secret key
 *     - Only someone with BOTH the wallet AND the passkey can recreate the key
 *
 *  2. FHE LAYER (happens in useFHE.ts using @cofhe/sdk)
 *     - The XOR-encrypted values are sent to the FHE co-processor for a
 *       second layer of encryption before going on-chain
 *     - Even if someone reads the raw blockchain, they only see FHE ciphertext
 *
 * The passkey is NEVER stored anywhere — not in the browser, not on-chain.
 * The only thing stored on-chain is keccak256(keccak256(signature+passkey))
 * which cannot be reversed.
 */

import { ethers } from "ethers";

/** The message we ask the wallet to sign for key derivation. Never changes. */
const SIGNING_MESSAGE = "web3-password-manager-key-derivation-v1";

const MASK_128 = (1n << 128n) - 1n;

// ─── Key Derivation ─────────────────────────────────────────────────────────

/**
 * Ask the wallet to sign a fixed message, then combine with the passkey to
 * produce a 256-bit XOR encryption key. The result is fully deterministic:
 * same wallet + same passkey → same key, every time.
 */
export async function deriveXorKey(
  signer: ethers.Signer,
  passkey: string
): Promise<bigint> {
  const signature = await signer.signMessage(SIGNING_MESSAGE);
  const keyHex = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string"],
      [signature, passkey]
    )
  );
  return BigInt(keyHex);
}

/**
 * Compute the hash that gets stored on-chain for passkey verification.
 * It's a double-hash so that knowing the on-chain hash gives no information
 * about the XOR key.
 */
export function computePasskeyHash(xorKey: bigint): string {
  const keyHex = "0x" + xorKey.toString(16).padStart(64, "0");
  return ethers.keccak256(keyHex); // bytes32 hex string
}

// ─── String ↔ uint128 pair ───────────────────────────────────────────────────

/**
 * Encode a string (up to 32 chars) into two uint128 values.
 * Bytes 0–15 → high,  bytes 16–31 → low.
 */
export function encodeString(str: string): { high: bigint; low: bigint } {
  const bytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(str.slice(0, 32)); // cap at 32 chars
  bytes.set(encoded);

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const full = BigInt("0x" + hex);
  return { high: full >> 128n, low: full & MASK_128 };
}

/**
 * Decode two uint128 values back into the original string.
 * Null bytes (padding) are stripped from the end.
 */
export function decodeString(high: bigint, low: bigint): string {
  const full = ((high & MASK_128) << 128n) | (low & MASK_128);
  const hex = full.toString(16).padStart(64, "0");
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes).replace(/\0+$/, "");
}

// ─── XOR Encryption / Decryption ────────────────────────────────────────────

/**
 * Split the 256-bit XOR key into two 128-bit halves that match our two
 * euint128 storage slots.
 */
export function splitKey(xorKey: bigint): { keyHigh: bigint; keyLow: bigint } {
  return { keyHigh: xorKey >> 128n, keyLow: xorKey & MASK_128 };
}

/**
 * XOR-encrypt both halves of an encoded string.
 * The same function is used for decryption (XOR is its own inverse).
 */
export function xorEncrypt(
  high: bigint,
  low: bigint,
  keyHigh: bigint,
  keyLow: bigint
): { encHigh: bigint; encLow: bigint } {
  return {
    encHigh: (high ^ keyHigh) & MASK_128,
    encLow:  (low  ^ keyLow)  & MASK_128,
  };
}

export const xorDecrypt = xorEncrypt; // identical operation

// ─── Combined helpers used by the UI ────────────────────────────────────────

/** Encode + XOR-encrypt a plaintext string ready for FHE encryption. */
export function encryptString(
  plaintext: string,
  keyHigh: bigint,
  keyLow: bigint
): { encHigh: bigint; encLow: bigint } {
  const { high, low } = encodeString(plaintext);
  return xorEncrypt(high, low, keyHigh, keyLow);
}

/** XOR-decrypt + decode an FHE-decrypted pair of uint128 values back to string. */
export function decryptString(
  encHigh: bigint,
  encLow: bigint,
  keyHigh: bigint,
  keyLow: bigint
): string {
  const { encHigh: high, encLow: low } = xorDecrypt(encHigh, encLow, keyHigh, keyLow);
  return decodeString(high, low);
}
