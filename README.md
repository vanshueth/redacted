# VaultX 🔐

> **Onchain password manager powered by Fhenix coFHE — your data encrypted, onchain, unseeable.**

redacted stores your passwords directly on Ethereum — encrypted byte-by-byte using Fully Homomorphic Encryption (FHE). No server. No master password. No plaintext ever touches the chain. Only you and the Fhenix threshold network can decrypt your data, authorized by your wallet signature.

---

## How It Works

```
You type a password
       ↓
cofheClient.encryptInputs()  ← ZK proof generated in browser
       ↓
Ciphertext → Sepolia (PasswordVault.sol)
       ↓
On reveal: Fhenix coFHE threshold network decrypts
       ↓
Plaintext shown for 10s, then auto-cleared from memory
```

Every password character is encrypted as an individual `euint8` (encrypted uint8) on-chain. The ciphertext is opaque to everyone — including block explorers, node operators, and the contract itself. Decryption requires your wallet signature routed through the Fhenix coprocessor.

---

## Features

- **Zero-knowledge encryption** — passwords encrypted client-side before hitting the chain
- **On-demand decryption** — reveal only what you need, when you need it
- **Auto-clear** — plaintext wiped from memory after 10 seconds
- **No backend** — fully decentralized, no server to breach
- **Wallet-native auth** — connect with MetaMask, WalletConnect, Coinbase Wallet, or any RainbowKit-supported wallet
- **Low balance warnings** — notified when you're running low on Sepolia ETH for gas
- **Label + username + notes** — store more than just the password

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.26 + Hardhat 3 |
| FHE | Fhenix coFHE SDK (`@cofhe/sdk` 0.4.0) |
| Blockchain | Ethereum Sepolia (Chain ID: 11155111) |
| Primary Frontend | Next.js 16 + React 19 |
| Alternative Frontend | React 18 + Vite 5 |
| Wallet | Wagmi 3 + RainbowKit 2 |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Toasts | Sonner |

---

## Project Structure

```
redacted/
├── vault-fhe/                  # Primary app (Next.js)
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Main dashboard
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── providers.tsx       # Wagmi + RainbowKit + TanStack Query
│   │   └── client-providers.tsx
│   ├── components/
│   │   ├── AddPasswordModal.tsx
│   │   ├── PasswordCard.tsx
│   │   ├── ConnectWallet.tsx
│   │   └── LowBalanceBanner.tsx
│   ├── hooks/
│   │   ├── useCofhe.ts         # FHE client init
│   │   └── useHydrateVault.ts  # Load passwords from contract
│   ├── lib/
│   │   ├── store.ts            # Zustand state
│   │   ├── wagmi.ts            # Wagmi config
│   │   └── constants.ts        # Contract address + ABI
│   ├── contracts/
│   │   └── PasswordVault.sol   # The smart contract
│   └── hardhat.config.ts
│
└── frontend/                   # Alternative app (Vite + React)
    └── src/
        ├── components/
        ├── hooks/              # useWallet, usePasskey, useFHE, usePasswords
        └── utils/
```

---

## Smart Contract

`PasswordVault.sol` is the core of redacted.

### Data Model

```solidity
struct Entry {
    euint8[] ciphertext;   // Encrypted password bytes — unreadable on-chain
    string username;       // Stored plaintext (optional)
    string notes;          // Stored plaintext (optional)
}

mapping(address => string[]) _labels;
mapping(address => mapping(string => Entry)) _entries;
```

### Interface

| Function | Description |
|---|---|
| `storePassword(label, inputs[], username, notes)` | Encrypt and store a password. Each byte encrypted as `euint8` via FHE. |
| `getPassword(label)` | Return ciphertext + username/notes for a label. Caller-only. |
| `getAllLabels()` | Return all password labels for the caller. |
| `deletePassword(label)` | Remove a password entry and its label. |

Only `msg.sender` can read their own entries — enforced at the contract level with `FHE.allowSender()`.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet with Sepolia ETH ([faucet](https://sepoliafaucet.com))
- A WalletConnect Project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))

### 1. Clone & Install

```bash
git clone https://github.com/vanshueth/redacted.git
cd redacted/vault-fhe
npm install
```

### 2. Deploy the Contract

```bash
# Set your deployer private key
export DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

npx hardhat run scripts/deploy.ts --network sepolia
# → Copy the deployed contract address
```

### 3. Configure Environment

Create `vault-fhe/.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_CHAIN_ID=11155111
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Using the Alternative Frontend (Vite)

The `frontend/` directory contains an older Vite-based implementation with passkey-based authentication.

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Update `frontend/src/utils/deployedAddress.ts` with your contract address, and `constants.ts` with your chain ID.

---

## Architecture Deep Dive

### FHE Encryption Flow

```
User input: "mysecretpassword"
         ↓
Split into bytes: [109, 121, 115, 101, 99, 114, 101, 116, ...]
         ↓
cofheClient.encryptInputs(bytes)  ← Each byte → euint8 ciphertext + ZK proof
         ↓
PasswordVault.storePassword(label, encryptedInputs, username, notes)
         ↓
Contract: FHE.asEuint8(input) per byte, stored as euint8[]
         ↓
FHE.allowSender(handle)  ← Only you can decrypt
FHE.allowThis(handle)    ← Contract can use in computation
```

### Decryption Flow

```
User clicks "Reveal"
         ↓
PasswordVault.getPassword(label) → euint8[] ciphertext handles
         ↓
cofheClient.decryptForView(handles, wallet signature)
         ↓
Fhenix threshold network verifies signature → decrypts
         ↓
Plaintext displayed → auto-cleared after 10 seconds
```

### State Management

Zustand store holds:
- `entries[]` — loaded vault entries (ciphertext, label, username, notes, isRevealed, isDecrypting)
- `cofheClient` — the initialized FHE client instance
- `isAddModalOpen` — modal state

---

## Security Properties

| Property | Guarantee |
|---|---|
| **On-chain privacy** | Ciphertext is opaque to all observers, including validators and block explorers |
| **Access control** | Only `msg.sender` can retrieve their entries — enforced in Solidity |
| **Decryption authorization** | FHE handles bound to wallet address via `FHE.allowSender()` |
| **No server** | No backend, no database, no API keys to leak |
| **Ephemeral plaintext** | Decrypted values never written to storage, cleared after 10 seconds |

> **Note:** Username and notes fields are stored as plaintext on-chain. Only the password itself is FHE-encrypted.

---

## Networks

| Network | Chain ID | RPC |
|---|---|---|
| Ethereum Sepolia (primary) | 11155111 | `https://ethereum-sepolia-rpc.publicnode.com` |
| Arbitrum Sepolia (frontend alt) | 421614 | — |

Get Sepolia ETH: [sepoliafaucet.com](https://sepoliafaucet.com) · [alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)

---

## Resources

- [Fhenix coFHE Documentation](https://docs.fhenix.zone)
- [cofhe-contracts on npm](https://www.npmjs.com/package/@fhenixprotocol/cofhe-contracts)
- [RainbowKit Docs](https://www.rainbowkit.com/docs)
- [Wagmi Docs](https://wagmi.sh)
- [WalletConnect Cloud](https://cloud.walletconnect.com)

---

## License

MIT
