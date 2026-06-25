import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface CompanyResearch {
  id: string;
  companyId: string;
  companyName: string;
  industry?: string;
  size?: string;
  website?: string;
  existingSystems?: string;
  complianceGaps?: string;
  salesAngle?: string;
  keyContacts?: string;
  notes?: string;
  researchedAt: string;
}

interface CompanyResearchStore {
  research: CompanyResearch[];
  fetchResearch: () => void;
  upsertResearch: (data: Omit<CompanyResearch, 'id' | 'researchedAt'>) => void;
  deleteResearch: (companyId: string) => void;
  getResearchByCompany: (companyId: string) => CompanyResearch | undefined;
}

export const useCompanyResearchStore = create<CompanyResearchStore>((set, get) => ({
  research: storage.get<CompanyResearch[]>('module_company_research') || [],
  fetchResearch: () => {
    const research = storage.get<CompanyResearch[]>('module_company_research') || [];
    set({ research });
  },
  upsertResearch: (data) => {
    const existing = get().research.findIndex(r => r.companyId === data.companyId);
    let updated;
    if (existing >= 0) {
      updated = get().research.map((r, i) => i === existing ? { ...r, ...data, researchedAt: new Date().toISOString() } : r);
    } else {
      const r: CompanyResearch = { ...data, id: `cr-${Date.now()}`, researchedAt: new Date().toISOString() };
      updated = [...get().research, r];
    }
    storage.set('module_company_research', updated); set({ research: updated });
  },
  deleteResearch: (companyId) => {
    const updated = get().research.filter(r => r.companyId !== companyId);
    storage.set('module_company_research', updated); set({ research: updated });
  },
  getResearchByCompany: (companyId) => {
    return get().research.find(r => r.companyId === companyId);
  },
}));
