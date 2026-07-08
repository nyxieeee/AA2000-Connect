import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface KPIMetric {
  id: string;
  salespersonId: string;
  salespersonName: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  periodDate: string;
  calls: number;
  meetings: number;
  siteSurveys: number;
  quotations: number;
  proposalValue: number;
  collection: number;
  conversionRate: number;
  repeatClients: number;
  referralClients: number;
  avgGrossProfit: number;
  discountPercent: number;
  responseTimeHrs: number;
}

interface KPIStore {
  metrics: KPIMetric[];
  fetchMetrics: () => void;
  addMetric: (data: Omit<KPIMetric, 'id'>) => void;
  updateMetric: (id: string, updates: Partial<KPIMetric>) => void;
}

const seedMetrics: KPIMetric[] = [
  { id: 'kpi-1', salespersonId: '4', salespersonName: 'Ben Cruz', period: 'monthly', periodDate: '2026-06', calls: 85, meetings: 12, siteSurveys: 8, quotations: 15, proposalValue: 2500000, collection: 1800000, conversionRate: 32, repeatClients: 3, referralClients: 2, avgGrossProfit: 28, discountPercent: 5.2, responseTimeHrs: 2.4 },
  { id: 'kpi-2', salespersonId: '3', salespersonName: 'Anna Reyes', period: 'monthly', periodDate: '2026-06', calls: 120, meetings: 18, siteSurveys: 14, quotations: 22, proposalValue: 4200000, collection: 3100000, conversionRate: 38, repeatClients: 5, referralClients: 4, avgGrossProfit: 31, discountPercent: 3.8, responseTimeHrs: 1.8 },
  { id: 'kpi-3', salespersonId: '4', salespersonName: 'Ben Cruz', period: 'monthly', periodDate: '2026-05', calls: 72, meetings: 10, siteSurveys: 6, quotations: 11, proposalValue: 1800000, collection: 1400000, conversionRate: 27, repeatClients: 2, referralClients: 1, avgGrossProfit: 25, discountPercent: 6.1, responseTimeHrs: 3.1 },
  { id: 'kpi-4', salespersonId: '3', salespersonName: 'Anna Reyes', period: 'weekly', periodDate: '2026-W27', calls: 32, meetings: 5, siteSurveys: 3, quotations: 6, proposalValue: 980000, collection: 750000, conversionRate: 35, repeatClients: 1, referralClients: 1, avgGrossProfit: 29, discountPercent: 4.0, responseTimeHrs: 2.0 },
];

const stored = storage.get<KPIMetric[]>('module_kpi');
if (!stored) storage.set('module_kpi', seedMetrics);

export const useKPIStore = create<KPIStore>((set, get) => ({
  metrics: stored || seedMetrics,
  fetchMetrics: () => { set({ metrics: storage.get<KPIMetric[]>('module_kpi') || [] }); },
  addMetric: (data) => {
    const metric: KPIMetric = { ...data, id: `kpi-${Date.now()}` };
    const updated = [...get().metrics, metric];
    storage.set('module_kpi', updated); set({ metrics: updated });
  },
  updateMetric: (id, updates) => {
    const updated = get().metrics.map(m => m.id === id ? { ...m, ...updates } : m);
    storage.set('module_kpi', updated); set({ metrics: updated });
  },
}));
