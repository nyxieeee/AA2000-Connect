import { create } from 'zustand';
import { storage } from '../../services/storage';
import type { AppRequest } from '../../services/db';

interface RequestsStore {
  requests: AppRequest[];
  addRequest: (r: Omit<AppRequest, 'id' | 'requestNumber' | 'createdAt'>) => void;
  updateRequest: (id: string, updates: Partial<AppRequest>) => void;
  deleteRequest: (id: string) => void;
}

let reqCounter = 0;

export const useRequestsStore = create<RequestsStore>((set, get) => ({
  requests: storage.get<AppRequest[]>('module_requests') || [],
  addRequest: (data) => {
    reqCounter++;
    const r: AppRequest = {
      ...data,
      id: `req-${Date.now()}`,
      requestNumber: `SRQ-${String(reqCounter).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().requests, r];
    storage.set('module_requests', updated); set({ requests: updated });
  },
  updateRequest: (id, updates) => {
    const updated = get().requests.map(r => r.id === id ? { ...r, ...updates } : r);
    storage.set('module_requests', updated); set({ requests: updated });
  },
  deleteRequest: (id) => {
    const updated = get().requests.filter(r => r.id !== id);
    storage.set('module_requests', updated); set({ requests: updated });
  },
}));
