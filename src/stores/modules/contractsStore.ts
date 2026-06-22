import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface Contract {
  id: string;
  dealId?: string;
  contactId?: string;
  companyId?: string;
  contractNumber: string;
  type: 'service' | 'product' | 'lease';
  status: 'draft' | 'active' | 'expiring' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  value: number;
  description?: string;
  terms?: string;
  renewalAlertDays: number;
  createdAt: string;
}

interface ContractsStore {
  contracts: Contract[];
  fetchContracts: () => void;
  addContract: (c: Omit<Contract, 'id' | 'createdAt'>) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
}

export const useContractsStore = create<ContractsStore>((set, get) => ({
  contracts: storage.get<Contract[]>('module_contracts') || [],
  fetchContracts: () => {
    const contracts = storage.get<Contract[]>('module_contracts') || [];
    set({ contracts });
  },
  addContract: (data) => {
    const c: Contract = { ...data, id: `ctr-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().contracts, c];
    storage.set('module_contracts', updated); set({ contracts: updated });
  },
  updateContract: (id, updates) => {
    const updated = get().contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.set('module_contracts', updated); set({ contracts: updated });
  },
  deleteContract: (id) => {
    const updated = get().contracts.filter(c => c.id !== id);
    storage.set('module_contracts', updated); set({ contracts: updated });
  },
}));
