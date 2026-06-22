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
