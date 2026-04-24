import { create } from "zustand";
import type { CofheClient } from "@cofhe/sdk";

export interface VaultEntry {
  label: string;
  username: string;
  notes: string;
  password?: string;
  isRevealed: boolean;
  isDecrypting: boolean;
}

interface VaultStore {
  entries: VaultEntry[];
  isAddModalOpen: boolean;
  cofheClient: CofheClient | null;
  openAddModal: () => void;
  closeAddModal: () => void;
  setEntries: (entries: VaultEntry[]) => void;
  removeEntry: (label: string) => void;
  updateEntry: (label: string, patch: Partial<VaultEntry>) => void;
  setCofheClient: (client: CofheClient) => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  entries: [],
  isAddModalOpen: false,
  cofheClient: null,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  setEntries: (entries) => set({ entries }),
  removeEntry: (label) =>
    set((s) => ({ entries: s.entries.filter((e) => e.label !== label) })),
  updateEntry: (label, patch) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.label === label ? { ...e, ...patch } : e)),
    })),
  setCofheClient: (client) => set({ cofheClient: client }),
}));
