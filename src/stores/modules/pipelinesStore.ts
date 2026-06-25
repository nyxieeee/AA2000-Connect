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
  }
}));
