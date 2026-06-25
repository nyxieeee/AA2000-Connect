import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface SLAPolicy {
  id: string;
  name: string;
  scope: 'lead' | 'ticket' | 'approval' | 'deal';
  responseMinutes: number;
  escalationUserId?: string;
  alertMessage: string;
  enabled: boolean;
  createdAt: string;
}

export interface SLAEntry {
  id: string;
  policyId: string;
  referenceId: string;
  assignedTo: string;
  status: 'within_sla' | 'breached' | 'escalated' | 'resolved';
  deadline: string;
  breachedAt?: string;
  resolvedAt?: string;
}

interface SLAStore {
  policies: SLAPolicy[];
  entries: SLAEntry[];
  addPolicy: (p: Omit<SLAPolicy, 'id' | 'createdAt'>) => void;
  updatePolicy: (id: string, updates: Partial<SLAPolicy>) => void;
  deletePolicy: (id: string) => void;
  addEntry: (e: Omit<SLAEntry, 'id'>) => void;
  resolveEntry: (id: string) => void;
  deleteEntry: (id: string) => void;
}

export const useSLAStore = create<SLAStore>((set, get) => ({
  policies: storage.get<SLAPolicy[]>('module_sla_policies') || [],
  entries: storage.get<SLAEntry[]>('module_sla_entries') || [],
  addPolicy: (data) => {
    const p: SLAPolicy = { ...data, id: `sla-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().policies, p];
    storage.set('module_sla_policies', updated); set({ policies: updated });
  },
  updatePolicy: (id, updates) => {
    const updated = get().policies.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.set('module_sla_policies', updated); set({ policies: updated });
  },
  deletePolicy: (id) => {
    const updated = get().policies.filter(p => p.id !== id);
    storage.set('module_sla_policies', updated); set({ policies: updated });
  },
  addEntry: (data) => {
    const e: SLAEntry = { ...data, id: `sle-${Date.now()}` };
    const updated = [...get().entries, e];
    storage.set('module_sla_entries', updated); set({ entries: updated });
  },
  resolveEntry: (id) => {
    const updated = get().entries.map(e => e.id === id ? { ...e, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : e);
    storage.set('module_sla_entries', updated); set({ entries: updated });
  },
  deleteEntry: (id) => {
    const updated = get().entries.filter(e => e.id !== id);
    storage.set('module_sla_entries', updated); set({ entries: updated });
  },
}));
