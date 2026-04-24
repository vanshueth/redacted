/**
 * ABI for the PasswordManager contract.
 * (This is the "interface" — a description of all the functions the contract has.)
 * It gets auto-replaced by the deploy script, but we include a copy here so
 * the app can be read and understood without running a deployment first.
 */
export const PASSWORD_MANAGER_ABI = [
  // ── Passkey ──
  {
    "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
    "name": "setPasskeyHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hasPasskey",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
    "name": "verifyPasskey",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ── Passwords ──
  {
    "inputs": [
      { "internalType": "string",  "name": "site",        "type": "string" },
      {
        "components": [
          { "internalType": "bytes", "name": "ctHash",       "type": "bytes" },
          { "internalType": "uint8", "name": "securityZone", "type": "uint8" },
          { "internalType": "uint8", "name": "utype",        "type": "uint8" },
          { "internalType": "bytes", "name": "signature",    "type": "bytes" }
        ],
        "internalType": "struct InEuint128",
        "name": "inUnameHigh",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "bytes", "name": "ctHash",       "type": "bytes" },
          { "internalType": "uint8", "name": "securityZone", "type": "uint8" },
          { "internalType": "uint8", "name": "utype",        "type": "uint8" },
          { "internalType": "bytes", "name": "signature",    "type": "bytes" }
        ],
        "internalType": "struct InEuint128",
        "name": "inUnameLow",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "bytes", "name": "ctHash",       "type": "bytes" },
          { "internalType": "uint8", "name": "securityZone", "type": "uint8" },
          { "internalType": "uint8", "name": "utype",        "type": "uint8" },
          { "internalType": "bytes", "name": "signature",    "type": "bytes" }
        ],
        "internalType": "struct InEuint128",
        "name": "inPassHigh",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "bytes", "name": "ctHash",       "type": "bytes" },
          { "internalType": "uint8", "name": "securityZone", "type": "uint8" },
          { "internalType": "uint8", "name": "utype",        "type": "uint8" },
          { "internalType": "bytes", "name": "signature",    "type": "bytes" }
        ],
        "internalType": "struct InEuint128",
        "name": "inPassLow",
        "type": "tuple"
      }
    ],
    "name": "addPassword",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPasswordCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllSites",
    "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getPassword",
    "outputs": [
      { "internalType": "string",  "name": "site",            "type": "string"  },
      { "internalType": "bytes32", "name": "unameHighHandle", "type": "bytes32" },
      { "internalType": "bytes32", "name": "unameLowHandle",  "type": "bytes32" },
      { "internalType": "bytes32", "name": "passHighHandle",  "type": "bytes32" },
      { "internalType": "bytes32", "name": "passLowHandle",   "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "deletePassword",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ── Events ──
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "user",  "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "index", "type": "uint256" },
      { "indexed": false, "internalType": "string",   "name": "site",  "type": "string"  }
    ],
    "name": "PasswordAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "user",  "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "index", "type": "uint256" }
    ],
    "name": "PasswordDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "PasskeySet",
    "type": "event"
  }
] as const;
