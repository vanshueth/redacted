/**
 * useWallet — Handles MetaMask connection and network switching.
 *
 * Plain-English summary:
 *  - Detects whether MetaMask is installed in the browser
 *  - Asks the user to connect their wallet when they click the button
 *  - Automatically switches to Arbitrum Sepolia if they're on the wrong network
 *  - Exposes: address, signer, provider, isConnecting, error
 */

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { SUPPORTED_CHAIN } from "../utils/constants";

interface WalletState {
  address: string | null;
  signer: ethers.JsonRpcSigner | null;
  provider: ethers.BrowserProvider | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    signer: null,
    provider: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const isOnCorrectNetwork = state.chainId === SUPPORTED_CHAIN.id;

  // Switch MetaMask to Arbitrum Sepolia
  const switchNetwork = useCallback(async (provider: ethers.BrowserProvider) => {
    const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!ethereum) return;

    const chainIdHex = "0x" + SUPPORTED_CHAIN.id.toString(16);

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: unknown) {
      // Error code 4902 = network not added to MetaMask yet
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: SUPPORTED_CHAIN.name,
              rpcUrls: [SUPPORTED_CHAIN.rpcUrl],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: [SUPPORTED_CHAIN.blockExplorer],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
    // Re-fetch the provider after switching
    const newProvider = new ethers.BrowserProvider(ethereum as unknown as ethers.Eip1193Provider);
    return newProvider;
  }, []);

  const connect = useCallback(async () => {
    const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
    if (!ethereum) {
      setState((s) => ({
        ...s,
        error: "MetaMask is not installed. Please install it from metamask.io",
      }));
      return;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);

      // Request wallet access (shows MetaMask popup)
      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();
      let activeProvider = provider;

      // Switch to the correct network if needed
      if (Number(network.chainId) !== SUPPORTED_CHAIN.id) {
        const switched = await switchNetwork(provider);
        if (switched) activeProvider = switched;
      }

      const signer = await activeProvider.getSigner();
      const address = await signer.getAddress();
      const finalNetwork = await activeProvider.getNetwork();

      setState({
        address,
        signer,
        provider: activeProvider,
        chainId: Number(finalNetwork.chainId),
        isConnecting: false,
        error: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      setState((s) => ({ ...s, isConnecting: false, error: msg }));
    }
  }, [switchNetwork]);

  // Disconnect (clears local state — MetaMask manages actual disconnection)
  const disconnect = useCallback(() => {
    setState({
      address: null,
      signer: null,
      provider: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Listen for account / network changes in MetaMask
  useEffect(() => {
    const ethereum = (window as unknown as { ethereum?: { on?: (event: string, cb: (args: unknown) => void) => void; removeListener?: (event: string, cb: (args: unknown) => void) => void } }).ethereum;
    if (!ethereum?.on) return;

    const onAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) disconnect();
      else setState((s) => ({ ...s, address: list[0] }));
    };

    const onChainChanged = () => {
      // Reload to avoid stale state
      window.location.reload();
    };

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, [disconnect]);

  return { ...state, isOnCorrectNetwork, connect, disconnect, switchNetwork };
}
