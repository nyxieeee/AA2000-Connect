import { create } from 'zustand';
import { storage } from '../../services/storage';
import type { Deal, Pipeline } from '../../services/db';

interface PipelinesStore {
  deals: Deal[];
  pipelines: Pipeline[];
  activePipelineId: string | null;
  loading: boolean;
  
  // Actions
  fetchData: () => void;
  setActivePipeline: (id: string) => void;
  updateDealStage: (id: string, stageId: string) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  deleteDeal: (id: string) => void;
  
  // Pipeline Actions
  addPipeline: (pipeline: Omit<Pipeline, 'id'>) => void;
  updatePipeline: (id: string, pipeline: Partial<Pipeline>) => void;
  deletePipeline: (id: string) => void;
  addStage: (pipelineId: string, stageName: string) => void;
  deleteStage: (pipelineId: string, stageId: string) => void;

  // Automation & Webhook Actions
  handleQuotationEvent: (payload: {
    quotationId: string;
    eventType: 'QUOTE_SENT' | 'QUOTE_VIEWED' | 'QUOTE_NEGOTIATING' | 'QUOTE_ACCEPTED' | 'QUOTE_DECLINED';
    companyName?: string;
    contactEmail?: string;
    quotationScope?: 'supply_only' | 'supply_install' | 'all';
    amount?: number;
    assignedTo?: string;
  }) => { success: boolean; message: string; dealId?: string };
  autoEvaluateDeals: () => { movedCount: number; summary: string[] };
}

function getSeedPipelines(): Pipeline[] {
  return [{
    id: 'p-seed-001',
    name: 'Sales Pipeline',
    description: 'Track new opportunities from inquiry to closed deal',
    stages: [
      { id: 's-seed-001', name: 'New Inquiry', order: 0 },
      { id: 's-seed-002', name: 'Qualified', order: 1 },
      { id: 's-seed-003', name: 'Proposal Sent', order: 2 },
      { id: 's-seed-004', name: 'Negotiation', order: 3 },
      { id: 's-seed-005', name: 'Closed Won', order: 4 },
      { id: 's-seed-006', name: 'Closed Lost', order: 5 },
    ],
  }];
}

function getSeedDeals(pipelineId: string): Deal[] {
  return [
    {
      id: 'd-seed-001', title: 'Office Security System Upgrade', value: 450000,
      stageId: 's-seed-003', pipelineId, contactId: 'c-seed-001',
      companyName: 'MegaPlaza Corp', product: 'CCTV & Access Control',
      status: 'Open', assigned: 'Juan Dela Cruz', createdAt: '2026-06-10T08:00:00Z',
    },
    {
      id: 'd-seed-002', title: 'New Warehouse CCTV Installation', value: 320000,
      stageId: 's-seed-001', pipelineId, contactId: 'c-seed-002',
      companyName: 'Sunrise Properties', product: 'CCTV',
      status: 'Open', assigned: 'Maria Santos', createdAt: '2026-06-18T10:30:00Z',
    },
    {
      id: 'd-seed-003', title: 'Bank Branch Access Control Rollout', value: 890000,
      stageId: 's-seed-004', pipelineId, contactId: 'c-seed-004',
      companyName: 'MetroBank PH', product: 'Access Control',
      status: 'Open', assigned: 'Maria Santos', createdAt: '2026-05-28T09:00:00Z',
    },
    {
      id: 'd-seed-004', title: 'Residential Estate CCTV Installation', value: 250000,
      stageId: 's-seed-002', pipelineId, contactId: 'c-seed-005',
      companyName: 'Vista Homes', product: 'CCTV',
      status: 'Open', assigned: 'Carlos Reyes', createdAt: '2026-06-20T11:00:00Z',
    },
    {
      id: 'd-seed-005', title: 'Office Building Biometric Upgrade', value: 580000,
      stageId: 's-seed-003', pipelineId, contactId: 'c-seed-006',
      companyName: 'Regus PH', product: 'Biometrics & Access Control',
      status: 'Open', assigned: 'Juan Dela Cruz', createdAt: '2026-06-15T14:00:00Z',
    },
  ];
}

function seedIfEmpty() {
  const existing = storage.get<Pipeline[]>('crm_pipelines');
  if (existing && existing.length > 0) return;
  const pipelines = getSeedPipelines();
  const deals = getSeedDeals(pipelines[0].id);
  storage.set('crm_pipelines', pipelines);
  storage.set('crm_deals', deals);
}

seedIfEmpty();

export const usePipelinesStore = create<PipelinesStore>((set, get) => ({
  deals: storage.get<Deal[]>('crm_deals') || [],
  pipelines: storage.get<Pipeline[]>('crm_pipelines') || [],
  activePipelineId: storage.get<Pipeline[]>('crm_pipelines')?.[0]?.id || null,
  loading: false,

  fetchData: () => {
    const deals = storage.get<Deal[]>('crm_deals') || [];
    const pipelines = storage.get<Pipeline[]>('crm_pipelines') || [];
    set({ deals, pipelines });
    if (!get().activePipelineId && pipelines.length > 0) {
      set({ activePipelineId: pipelines[0].id });
    }
  },

  setActivePipeline: (id) => set({ activePipelineId: id }),

  updateDealStage: (id, stageId) => {
    const updated = get().deals.map(d => d.id === id ? { ...d, stageId } : d);
    storage.set('crm_deals', updated);
    set({ deals: updated });
  },

  updateDeal: (id, data) => {
    const updated = get().deals.map(d => d.id === id ? { ...d, ...data } : d);
    storage.set('crm_deals', updated);
    set({ deals: updated });
  },

  addDeal: (data) => {
    const newDeal: Deal = {
      ...data,
      id: `d-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().deals, newDeal];
    storage.set('crm_deals', updated);
    set({ deals: updated });
  },

  deleteDeal: (id) => {
    const updated = get().deals.filter(d => d.id !== id);
    storage.set('crm_deals', updated);
    set({ deals: updated });
  },

  addPipeline: (data) => {
    const newPipeline: Pipeline = {
      ...data,
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
    };
    const updated = [...get().pipelines, newPipeline];
    storage.set('crm_pipelines', updated);
    set({ pipelines: updated });
  },

  updatePipeline: (id, data) => {
    const updated = get().pipelines.map(p => p.id === id ? { ...p, ...data } : p);
    storage.set('crm_pipelines', updated);
    set({ pipelines: updated });
  },

  deletePipeline: (id) => {
    const updated = get().pipelines.filter(p => p.id !== id);
    storage.set('crm_pipelines', updated);
    const nextActive = updated.length > 0 ? updated[0].id : null;
    set({ pipelines: updated, activePipelineId: nextActive });
  },

  addStage: (pipelineId, stageName) => {
    const pipelines = get().pipelines.map(p => {
      if (p.id !== pipelineId) return p;
      const newStage = {
        id: `s-${Math.random().toString(36).substr(2, 9)}`,
        name: stageName,
        order: p.stages.length,
      };
      return { ...p, stages: [...p.stages, newStage] };
    });
    storage.set('crm_pipelines', pipelines);
    set({ pipelines });
  },

  deleteStage: (pipelineId, stageId) => {
    const pipelines = get().pipelines.map(p => {
      if (p.id !== pipelineId) return p;
      return { ...p, stages: p.stages.filter(s => s.id !== stageId) };
    });
    storage.set('crm_pipelines', pipelines);
    set({ pipelines });
  },

  handleQuotationEvent: (payload) => {
    const deals = get().deals;
    const pipelines = get().pipelines;
    const defaultPipeline = pipelines[0];
    if (!defaultPipeline) return { success: false, message: 'No active pipeline found' };

    // Stage ID Mappings
    const stageMap: Record<string, string> = {
      'New Inquiry': defaultPipeline.stages.find(s => s.name.toLowerCase().includes('inquiry'))?.id || defaultPipeline.stages[0]?.id,
      'Qualified': defaultPipeline.stages.find(s => s.name.toLowerCase().includes('qualified'))?.id || defaultPipeline.stages[1]?.id,
      'Proposal Sent': defaultPipeline.stages.find(s => s.name.toLowerCase().includes('proposal'))?.id || defaultPipeline.stages[2]?.id,
      'Negotiation': defaultPipeline.stages.find(s => s.name.toLowerCase().includes('negotiat'))?.id || defaultPipeline.stages[3]?.id,
      'Closed Won': defaultPipeline.stages.find(s => s.name.toLowerCase().includes('won'))?.id || defaultPipeline.stages[4]?.id,
      'Closed Lost': defaultPipeline.stages.find(s => s.name.toLowerCase().includes('lost'))?.id || defaultPipeline.stages[5]?.id,
    };

    // 1. Find existing matching deal by companyName or create new deal
    let targetDeal = deals.find(d => 
      (payload.companyName && d.companyName?.toLowerCase() === payload.companyName.toLowerCase()) ||
      (d.title && d.title.toLowerCase().includes((payload.companyName || '').toLowerCase()))
    );

    let targetStageId = stageMap['Proposal Sent'];
    let status: 'Open' | 'Won' | 'Lost' = 'Open';

    if (payload.eventType === 'QUOTE_SENT') {
      targetStageId = stageMap['Proposal Sent'];
    } else if (payload.eventType === 'QUOTE_VIEWED' || payload.eventType === 'QUOTE_NEGOTIATING') {
      targetStageId = stageMap['Negotiation'];
    } else if (payload.eventType === 'QUOTE_ACCEPTED') {
      targetStageId = stageMap['Closed Won'];
      status = 'Won';
    } else if (payload.eventType === 'QUOTE_DECLINED') {
      targetStageId = stageMap['Closed Lost'];
      status = 'Lost';
    }

    const assignedUser = payload.assignedTo || (payload.quotationScope === 'supply_only' ? 'Hardware Sales Rep' : 'Project Engineering Rep');

    if (targetDeal) {
      // Update existing deal
      const updatedDeals = deals.map(d => d.id === targetDeal!.id ? {
        ...d,
        stageId: targetStageId,
        status,
        value: payload.amount || d.value,
        assigned: assignedUser,
        product: d.product || (payload.quotationScope === 'supply_only' ? 'Supply Only Hardware' : 'Supply & Installation Project'),
      } : d);

      storage.set('crm_deals', updatedDeals);
      set({ deals: updatedDeals });

      return {
        success: true,
        message: `Deal "${targetDeal.title}" auto-updated to ${payload.eventType} → Stage: ${Object.keys(stageMap).find(k => stageMap[k] === targetStageId)} (Assigned: ${assignedUser})`,
        dealId: targetDeal.id
      };
    } else {
      // Create new deal dynamically from Quoting App Payload
      const newDealId = `d-${Math.random().toString(36).substr(2, 9)}`;
      const newDeal: Deal = {
        id: newDealId,
        title: `${payload.companyName || 'Quotation Request'} — ${payload.quotationId}`,
        value: payload.amount || 250000,
        stageId: targetStageId,
        pipelineId: defaultPipeline.id,
        companyName: payload.companyName || 'External Client',
        product: payload.quotationScope === 'supply_only' ? 'Supply Only Hardware' : 'Supply & Installation Project',
        status,
        assigned: assignedUser,
        createdAt: new Date().toISOString(),
      };

      const updatedDeals = [...deals, newDeal];
      storage.set('crm_deals', updatedDeals);
      set({ deals: updatedDeals });

      return {
        success: true,
        message: `New Deal created for "${newDeal.title}" via Webhook → Stage: ${Object.keys(stageMap).find(k => stageMap[k] === targetStageId)} (Assigned: ${assignedUser})`,
        dealId: newDealId
      };
    }
  },

  autoEvaluateDeals: () => {
    const deals = get().deals;
    const pipelines = get().pipelines;
    const defaultPipeline = pipelines[0];
    if (!defaultPipeline) return { movedCount: 0, summary: [] };

    const stageMap = {
      inquiry: defaultPipeline.stages.find(s => s.name.toLowerCase().includes('inquiry'))?.id,
      qualified: defaultPipeline.stages.find(s => s.name.toLowerCase().includes('qualified'))?.id,
      proposal: defaultPipeline.stages.find(s => s.name.toLowerCase().includes('proposal'))?.id,
      negotiation: defaultPipeline.stages.find(s => s.name.toLowerCase().includes('negotiat'))?.id,
    };

    let movedCount = 0;
    const summary: string[] = [];

    const updated = deals.map(deal => {
      // Rule 1: Auto-move Inquiry to Qualified if in Inquiry stage
      if (deal.stageId === stageMap.inquiry && stageMap.qualified) {
        movedCount++;
        summary.push(`Advanced "${deal.title}" from New Inquiry → Qualified (Lead Qualified criteria met)`);
        return { ...deal, stageId: stageMap.qualified };
      }
      return deal;
    });

    if (movedCount > 0) {
      storage.set('crm_deals', updated);
      set({ deals: updated });
    }

    return { movedCount, summary };
  }
}));
