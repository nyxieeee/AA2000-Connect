import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  tableName: string;
  recordId: string;
  changes?: string;
  occurredAt: string;
}

interface AuditLogStore {
  logs: AuditLogItem[];
  addLog: (log: Omit<AuditLogItem, 'id' | 'occurredAt'>) => void;
}

export const useAuditLogStore = create<AuditLogStore>((set, get) => ({
  logs: storage.get<AuditLogItem[]>('module_audit_logs') || [],
  addLog: (data) => {
    const log: AuditLogItem = { ...data, id: `log-${Date.now()}`, occurredAt: new Date().toISOString() };
    const updated = [log, ...get().logs];
    storage.set('module_audit_logs', updated); set({ logs: updated });
  },
}));
