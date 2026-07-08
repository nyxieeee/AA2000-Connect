import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface PolicyDocument {
  id: string;
  title: string;
  category: 'sales_manual' | 'pricing' | 'discount' | 'incentive' | 'quotation_guide' | 'sop' | 'iso';
  content: string;
  version: string;
  effectiveDate: string;
  updatedAt: string;
}

interface PolicyCenterStore {
  policies: PolicyDocument[];
  fetchPolicies: () => void;
  addPolicy: (data: Omit<PolicyDocument, 'id' | 'updatedAt'>) => void;
  updatePolicy: (id: string, updates: Partial<PolicyDocument>) => void;
  deletePolicy: (id: string) => void;
}

const seedPolicies: PolicyDocument[] = [
  { id: 'pol-1', title: 'Sales Manual — General Procedures', category: 'sales_manual', content: 'This manual outlines the standard operating procedures for all AA2000 sales staff. All client interactions must be logged in the CRM within 24 hours. Follow-up cadence: 3 days for hot leads, 7 days for warm leads, 14 days for cold leads.', version: '3.1', effectiveDate: '2026-01-15', updatedAt: new Date().toISOString() },
  { id: 'pol-2', title: 'Pricing & Discount Policy', category: 'pricing', content: 'Maximum discount authority: Sales Rep (5%), Sales Manager (10%), GM (15%), CEO (20%+). All discounts above 10% require written justification and GM approval. Volume discounts follow the tiered schedule in Appendix A.', version: '2.4', effectiveDate: '2026-03-01', updatedAt: new Date().toISOString() },
  { id: 'pol-3', title: 'Incentive Computation Rules', category: 'incentive', content: 'Incentives are computed at 10% of actual GP. Advance payments capped at 50% of estimated incentive. Tax deduction at 12%. Final release upon 100% collection confirmation from Finance.', version: '1.8', effectiveDate: '2026-02-01', updatedAt: new Date().toISOString() },
  { id: 'pol-4', title: 'Quotation Preparation Guide', category: 'quotation_guide', content: 'All quotations must include: scope of work, bill of materials, labor costs, warranty terms, payment terms, and validity period (30 days default). Use the standard AA2000 quotation template.', version: '2.0', effectiveDate: '2025-11-01', updatedAt: new Date().toISOString() },
  { id: 'pol-5', title: 'CRM Standard Operating Procedure', category: 'sop', content: 'Every client interaction must be documented. Pipeline stages: Lead → Qualified → Proposal → Negotiation → Closed Won/Lost. Stage transitions require completion of the stage checklist.', version: '1.5', effectiveDate: '2026-01-01', updatedAt: new Date().toISOString() },
  { id: 'pol-6', title: 'ISO 9001:2015 Quality Procedures', category: 'iso', content: 'AA2000 maintains ISO 9001:2015 certification. All processes are subject to internal audit. Document control procedures require version tracking and approval chains.', version: '4.0', effectiveDate: '2025-06-01', updatedAt: new Date().toISOString() },
];

const stored = storage.get<PolicyDocument[]>('module_policies');
if (!stored) storage.set('module_policies', seedPolicies);

export const usePolicyCenterStore = create<PolicyCenterStore>((set, get) => ({
  policies: stored || seedPolicies,
  fetchPolicies: () => { set({ policies: storage.get<PolicyDocument[]>('module_policies') || [] }); },
  addPolicy: (data) => {
    const p: PolicyDocument = { ...data, id: `pol-${Date.now()}`, updatedAt: new Date().toISOString() };
    const updated = [...get().policies, p];
    storage.set('module_policies', updated); set({ policies: updated });
  },
  updatePolicy: (id, updates) => {
    const updated = get().policies.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    storage.set('module_policies', updated); set({ policies: updated });
  },
  deletePolicy: (id) => {
    const updated = get().policies.filter(p => p.id !== id);
    storage.set('module_policies', updated); set({ policies: updated });
  },
}));
