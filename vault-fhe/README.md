# VaultFHE — Fully Homomorphic Encryption Password Manager

> Your passwords are encrypted **before** they leave your browser. Even the blockchain sees only ciphertext. No server, no master password, no trust required.

---

## What is coFHE and why does it matter?

**FHE (Fully Homomorphic Encryption)** lets a computer perform operations on encrypted data *without ever decrypting it*. Fhenix's **coFHE** brings this to Ethereum as a coprocessor on Sepolia testnet:

- You encrypt each password byte in your browser using a ZK-proof scheme
- The ciphertext is stored in a Solidity contract on Sepolia
- To reveal a password, a decentralised threshold network decrypts it using your wallet signature as authorisation — no third party ever sees the plaintext

This is fundamentally different from a "zero-knowledge" password manager. The on-chain data is *never* decryptable without your wallet key.

---

## Prerequisites

- **Node.js v20+** — download from nodejs.org
- **MetaMask** browser extension
- **Sepolia ETH** (testnet funds) — free from sepoliafaucet.com
- A **WalletConnect Project ID** — free at cloud.walletconnect.com

---

## Installation

```bash
cd vault-fhe
npm install
```

---

## Deploy the Smart Contract

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the printed address and paste it into `.env.local`.

---

## Configure `.env.local`

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0xYourDeployedAddress
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Architecture

```
Your Browser
  User types password
        |
        v
  cofheClient.encryptInputs()  <-- ZK proof generated locally
        |
        v
  Ciphertext bytes (unreadable to everyone)
        |
        v (writeContract)
Sepolia: PasswordVault.sol
  stores: mapping[address][label] -> euint8[] ciphertext
        |
        v (getPasswordHandle + selfPermit)
Fhenix Threshold Network (coFHE coprocessor)
  decryptForView() -- wallet sig = authorisation
        |
        v
  Plaintext shown 10s then auto-hidden
```

---

## Links

- Fhenix coFHE docs: https://cofhe-docs.fhenix.zone
- Sepolia faucet: https://sepoliafaucet.com
- WalletConnect: https://cloud.walletconnect.com
