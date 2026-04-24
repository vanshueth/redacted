export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const VAULT_ABI = [
  {
    name: "storePassword",
    type: "function",
    inputs: [
      { name: "label", type: "string" },
      {
        name: "inputs",
        type: "tuple[]",
        components: [
          { name: "ctHash", type: "uint256" },
          { name: "securityZone", type: "uint8" },
          { name: "utype", type: "uint8" },
          { name: "signature", type: "bytes" },
        ],
      },
      { name: "username", type: "string" },
      { name: "notes", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getPassword",
    type: "function",
    inputs: [{ name: "label", type: "string" }],
    outputs: [
      { name: "ciphertext", type: "uint256[]" },
      { name: "username", type: "string" },
      { name: "notes", type: "string" },
    ],
    stateMutability: "view",
  },
  {
    name: "getAllLabels",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string[]" }],
    stateMutability: "view",
  },
  {
    name: "deletePassword",
    type: "function",
    inputs: [{ name: "label", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
