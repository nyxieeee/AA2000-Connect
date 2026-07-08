import { create } from 'zustand';
import { storage } from '../../services/storage';

export type IncentiveStatus = 'draft' | 'submitted' | 'gm_review' | 'finance_review' | 'ceo_review' | 'approved' | 'rejected' | 'released';

export interface IncentiveRequest {
  id: string;
  salespersonId: string;
  salespersonName: string;
  quotationRef: string;
  poRef: string;
  contractRef: string;
  downPayment: number;
  grossProfit: number;
  collectionPercent: number;
  discountHistory: string;
  projectTurnedOver: boolean;
  docsComplete: boolean;
  specialApprovalRequired: boolean;
  remarks: string;
  status: IncentiveStatus;
  estimatedIncentive: number;
  advanceIncentive: number;
  finalIncentive: number;
  remainingBalance: number;
  taxDeduction: number;
  gmChecklist: Record<string, boolean>;
  gmRemarks: string;
  financeVerified: boolean;
  financeRemarks: string;
  ceoDecision: string;
  ceoRemarks: string;
  createdAt: string;
  updatedAt: string;
}

interface IncentivesStore {
  requests: IncentiveRequest[];
  fetchRequests: () => void;
  addRequest: (data: Omit<IncentiveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'estimatedIncentive' | 'advanceIncentive' | 'finalIncentive' | 'remainingBalance' | 'taxDeduction' | 'gmChecklist' | 'gmRemarks' | 'financeVerified' | 'financeRemarks' | 'ceoDecision' | 'ceoRemarks'>) => void;
  updateRequest: (id: string, updates: Partial<IncentiveRequest>) => void;
  updateStatus: (id: string, status: IncentiveStatus) => void;
  computeIncentive: (id: string) => void;
}

const GM_CHECKLIST_KEYS = [
  'crmUpdated', 'clientOwnershipVerified', 'followUpsComplete',
  'noDuplicateClaim', 'discountApproved', 'docsUploaded', 'dpVerified'
];

function computeIncentiveValues(gp: number, collection: number) {
  const estimated = gp * 0.10;
  const advance = estimated * (collection / 100) * 0.5;
  const taxRate = 0.12;
  const tax = estimated * taxRate;
  const final_ = estimated - tax;
  const remaining = final_ - advance;
  return { estimatedIncentive: estimated, advanceIncentive: advance, finalIncentive: final_, remainingBalance: remaining, taxDeduction: tax };
}

const seedRequests: IncentiveRequest[] = [
  {
    id: 'inc-1', salespersonId: '4', salespersonName: 'Ben Cruz',
    quotationRef: 'QT-2026-0451', poRef: 'PO-2026-0312', contractRef: 'CT-2026-0089',
    downPayment: 250000, grossProfit: 180000, collectionPercent: 75,
    discountHistory: '5% volume discount', projectTurnedOver: true, docsComplete: true,
    specialApprovalRequired: false, remarks: 'Standard FDAS installation project',
    status: 'submitted', ...computeIncentiveValues(180000, 75),
    gmChecklist: Object.fromEntries(GM_CHECKLIST_KEYS.map(k => [k, false])),
    gmRemarks: '', financeVerified: false, financeRemarks: '', ceoDecision: '', ceoRemarks: '',
    createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-2', salespersonId: '3', salespersonName: 'Anna Reyes',
    quotationRef: 'QT-2026-0502', poRef: 'PO-2026-0389', contractRef: 'CT-2026-0102',
    downPayment: 500000, grossProfit: 320000, collectionPercent: 100,
    discountHistory: 'No discount', projectTurnedOver: true, docsComplete: true,
    specialApprovalRequired: true, remarks: 'Large CCTV + Access Control project for government',
    status: 'gm_review', ...computeIncentiveValues(320000, 100),
    gmChecklist: Object.fromEntries(GM_CHECKLIST_KEYS.map(k => [k, true])),
    gmRemarks: 'All checks passed', financeVerified: false, financeRemarks: '', ceoDecision: '', ceoRemarks: '',
    createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc-3', salespersonId: '4', salespersonName: 'Ben Cruz',
    quotationRef: 'QT-2026-0310', poRef: 'PO-2026-0250', contractRef: 'CT-2026-0071',
    downPayment: 100000, grossProfit: 65000, collectionPercent: 50,
    discountHistory: '10% special discount', projectTurnedOver: false, docsComplete: false,
    specialApprovalRequired: false, remarks: 'Pending final turnover',
    status: 'draft', ...computeIncentiveValues(65000, 50),
    gmChecklist: Object.fromEntries(GM_CHECKLIST_KEYS.map(k => [k, false])),
    gmRemarks: '', financeVerified: false, financeRemarks: '', ceoDecision: '', ceoRemarks: '',
    createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(),
  },
];

const stored = storage.get<IncentiveRequest[]>('module_incentives');
if (!stored) storage.set('module_incentives', seedRequests);

export const useIncentivesStore = create<IncentivesStore>((set, get) => ({
  requests: stored || seedRequests,

  fetchRequests: () => {
    const reqs = storage.get<IncentiveRequest[]>('module_incentives') || [];
    set({ requests: reqs });
  },

  addRequest: (data) => {
    const vals = computeIncentiveValues(data.grossProfit, data.collectionPercent);
    const req: IncentiveRequest = {
      ...data, ...vals, id: `inc-${Date.now()}`, status: 'draft',
      gmChecklist: Object.fromEntries(GM_CHECKLIST_KEYS.map(k => [k, false])),
      gmRemarks: '', financeVerified: false, financeRemarks: '', ceoDecision: '', ceoRemarks: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const updated = [...get().requests, req];
    storage.set('module_incentives', updated);
    set({ requests: updated });
  },

  updateRequest: (id, updates) => {
    const updated = get().requests.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
    storage.set('module_incentives', updated);
    set({ requests: updated });
  },

  updateStatus: (id, status) => {
    const updated = get().requests.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r);
    storage.set('module_incentives', updated);
    set({ requests: updated });
  },

  computeIncentive: (id) => {
    const req = get().requests.find(r => r.id === id);
    if (!req) return;
    const vals = computeIncentiveValues(req.grossProfit, req.collectionPercent);
    const updated = get().requests.map(r => r.id === id ? { ...r, ...vals, updatedAt: new Date().toISOString() } : r);
    storage.set('module_incentives', updated);
    set({ requests: updated });
  },
}));
