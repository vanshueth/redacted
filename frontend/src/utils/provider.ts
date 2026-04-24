/**
 * Shared read-only provider for Arbitrum Sepolia.
 *
 * Key design decisions:
 * - staticNetwork: true  → no eth_chainId call on init
 * - No VoidSigner        → VoidSigner.populateCall() triggers eth_blockNumber
 *                          on every single contract read. We avoid it by using
 *                          the provider directly and passing `from` as an override.
 * - One provider shared across the whole app → no duplicate background polling
 */

import { ethers } from "ethers";
import { SUPPORTED_CHAIN } from "./constants";

export const sharedReadProvider = new ethers.JsonRpcProvider(
  SUPPORTED_CHAIN.rpcUrl,
  { chainId: SUPPORTED_CHAIN.id, name: SUPPORTED_CHAIN.name },
  { staticNetwork: true }
);

/**
 * Return a read-only Contract connected to the plain provider.
 * Always pass  { from: userAddress }  as the last arg to every call so
 * msg.sender is correct — this sets the `from` field in eth_call directly,
 * without any extra RPC round-trips.
 */
export function buildReadContract(abi: unknown[], address: string) {
  return new ethers.Contract(address, abi as ethers.InterfaceAbi, sharedReadProvider);
}

/**
 * Wait for a tx to confirm using OUR provider, not MetaMask's internal one
 * (MetaMask's RPC is the old rate-limited endpoint).
 * Polls every 3 s; times out after 2 minutes.
 */
export async function waitForTx(txHash: string): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < 120_000) {
    await new Promise((r) => setTimeout(r, 3000));
    const receipt = await sharedReadProvider.getTransactionReceipt(txHash);
    if (receipt && receipt.status !== null) return;
  }
  throw new Error("Transaction not confirmed within 2 minutes");
}
