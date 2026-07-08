import { create } from 'zustand';
import { storage } from '../../services/storage';

export type BidStatus = 'identified' | 'preparing' | 'submitted' | 'under_evaluation' | 'awarded' | 'lost' | 'cancelled';

export interface Bid {
  id: string;
  projectName: string;
  philgepsRef: string;
  procuringEntity: string;
  category: 'goods' | 'infrastructure' | 'consulting';
  estimatedBudget: number;
  bidAmount: number;
  submissionDeadline: string;
  openingDate: string;
  status: BidStatus;
  winProbability: number;
  assignedTeam: string[];
  documents: BidDocument[];
  competitors: string[];
  result: string;
  remarks: string;
  createdAt: string;
}

export interface BidDocument {
  id: string;
  name: string;
  type: 'eligibility' | 'technical' | 'financial' | 'legal';
  status: 'pending' | 'prepared' | 'submitted';
  required: boolean;
}

interface BiddingStore {
  bids: Bid[];
  fetchBids: () => void;
  addBid: (data: Omit<Bid, 'id' | 'createdAt'>) => void;
  updateBid: (id: string, updates: Partial<Bid>) => void;
  deleteBid: (id: string) => void;
}

const seedDocs: BidDocument[] = [
  { id: 'bd-1', name: 'PhilGEPS Registration Certificate', type: 'eligibility', status: 'prepared', required: true },
  { id: 'bd-2', name: 'SEC Registration', type: 'legal', status: 'prepared', required: true },
  { id: 'bd-3', name: 'Bid Security', type: 'financial', status: 'pending', required: true },
  { id: 'bd-4', name: 'Technical Proposal', type: 'technical', status: 'pending', required: true },
  { id: 'bd-5', name: 'Financial Proposal', type: 'financial', status: 'pending', required: true },
];

const seedBids: Bid[] = [
  {
    id: 'bid-1', projectName: 'FDAS Installation — Manila City Hall Annex', philgepsRef: 'PG-2026-08291',
    procuringEntity: 'Manila City Government', category: 'goods', estimatedBudget: 5200000, bidAmount: 4800000,
    submissionDeadline: '2026-08-15', openingDate: '2026-08-20', status: 'preparing', winProbability: 65,
    assignedTeam: ['Anna Reyes', 'Ben Cruz'], documents: [...seedDocs], competitors: ['FirePro Inc.', 'SafeGuard PH'],
    result: '', remarks: 'Priority bid — government project', createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'bid-2', projectName: 'CCTV Surveillance — SM Prime Holdings', philgepsRef: '',
    procuringEntity: 'SM Prime Holdings Inc.', category: 'goods', estimatedBudget: 12000000, bidAmount: 10500000,
    submissionDeadline: '2026-07-30', openingDate: '2026-08-05', status: 'submitted', winProbability: 45,
    assignedTeam: ['Anna Reyes'], documents: seedDocs.map(d => ({ ...d, status: 'submitted' as const })), competitors: ['Hikvision PH Direct', 'TechSecure Corp'],
    result: '', remarks: 'Competitive pricing required', createdAt: new Date(Date.now() - 1209600000).toISOString(),
  },
];

const stored = storage.get<Bid[]>('module_bids');
if (!stored) storage.set('module_bids', seedBids);

export const useBiddingStore = create<BiddingStore>((set, get) => ({
  bids: stored || seedBids,
  fetchBids: () => { set({ bids: storage.get<Bid[]>('module_bids') || [] }); },
  addBid: (data) => {
    const bid: Bid = { ...data, id: `bid-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().bids, bid];
    storage.set('module_bids', updated); set({ bids: updated });
  },
  updateBid: (id, updates) => {
    const updated = get().bids.map(b => b.id === id ? { ...b, ...updates } : b);
    storage.set('module_bids', updated); set({ bids: updated });
  },
  deleteBid: (id) => {
    const updated = get().bids.filter(b => b.id !== id);
    storage.set('module_bids', updated); set({ bids: updated });
  },
}));
