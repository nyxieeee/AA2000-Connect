import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface ReportDefinition {
  id: string;
  name: string;
  type: 'sales' | 'gp' | 'collection' | 'discount' | 'incentive' | 'kpi' | 'lead' | 'lost_sales' | 'marketing';
  description: string;
  lastGenerated?: string;
}

export interface GeneratedReport {
  id: string;
  definitionId: string;
  title: string;
  dateRange: { from: string; to: string };
  generatedAt: string;
  data: Record<string, unknown>[];
  summary: string;
}

interface ReportsStore {
  definitions: ReportDefinition[];
  generated: GeneratedReport[];
  addGenerated: (report: Omit<GeneratedReport, 'id' | 'generatedAt'>) => void;
  deleteGenerated: (id: string) => void;
}

const seedDefs: ReportDefinition[] = [
  { id: 'rdef-1', name: 'Sales Performance Report', type: 'sales', description: 'Monthly/quarterly sales volume, revenue, and target achievement per salesperson and team.' },
  { id: 'rdef-2', name: 'Gross Profit Analysis', type: 'gp', description: 'GP per project, per salesperson, trend over time. Flags projects below minimum GP threshold.' },
  { id: 'rdef-3', name: 'Collection Report', type: 'collection', description: 'Outstanding receivables, collection rate, aging analysis, overdue accounts.' },
  { id: 'rdef-4', name: 'Discount Usage Report', type: 'discount', description: 'Discount frequency, average discount %, approver breakdown, impact on GP.' },
  { id: 'rdef-5', name: 'Incentive Summary Report', type: 'incentive', description: 'Incentives requested, approved, released, pending. Per salesperson totals.' },
  { id: 'rdef-6', name: 'KPI Scorecard', type: 'kpi', description: 'Comprehensive KPI dashboard across all tracked metrics with goal vs. actual.' },
  { id: 'rdef-7', name: 'Lead Funnel Report', type: 'lead', description: 'Lead sources, conversion rates, time-to-conversion, cost-per-lead.' },
  { id: 'rdef-8', name: 'Lost Sales Analysis', type: 'lost_sales', description: 'Reasons for lost deals, competitor wins, pricing issues, follow-up failures.' },
  { id: 'rdef-9', name: 'Marketing ROI Report', type: 'marketing', description: 'Campaign performance, lead generation, engagement metrics, cost analysis.' },
];

const storedDefs = storage.get<ReportDefinition[]>('module_report_defs');
const storedGen = storage.get<GeneratedReport[]>('module_reports_generated');
if (!storedDefs) storage.set('module_report_defs', seedDefs);

export const useReportsStore = create<ReportsStore>((set, get) => ({
  definitions: storedDefs || seedDefs,
  generated: storedGen || [],
  addGenerated: (data) => {
    const report: GeneratedReport = { ...data, id: `rpt-${Date.now()}`, generatedAt: new Date().toISOString() };
    const updated = [report, ...get().generated];
    storage.set('module_reports_generated', updated); set({ generated: updated });
  },
  deleteGenerated: (id) => {
    const updated = get().generated.filter(r => r.id !== id);
    storage.set('module_reports_generated', updated); set({ generated: updated });
  },
}));
