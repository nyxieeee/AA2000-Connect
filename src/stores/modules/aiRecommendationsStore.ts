import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface AIRecommendation {
  id: string;
  dealId?: string;
  contactId?: string;
  type: 'next_step' | 'follow_up' | 'risk_alert' | 'suggestion';
  title: string;
  description: string;
  draftMessage?: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  applied: boolean;
  createdAt: string;
}

interface AIRecommendationsStore {
  recommendations: AIRecommendation[];
  addRecommendation: (r: Omit<AIRecommendation, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markApplied: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  getByDeal: (dealId: string) => AIRecommendation[];
  getByContact: (contactId: string) => AIRecommendation[];
}

export const useAIRecommendationsStore = create<AIRecommendationsStore>((set, get) => ({
  recommendations: storage.get<AIRecommendation[]>('module_ai_recommendations') || [],
  addRecommendation: (data) => {
    const r: AIRecommendation = { ...data, id: `ai-rec-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().recommendations, r];
    storage.set('module_ai_recommendations', updated); set({ recommendations: updated });
  },
  markRead: (id) => {
    const updated = get().recommendations.map(r => r.id === id ? { ...r, read: true } : r);
    storage.set('module_ai_recommendations', updated); set({ recommendations: updated });
  },
  markApplied: (id) => {
    const updated = get().recommendations.map(r => r.id === id ? { ...r, applied: true } : r);
    storage.set('module_ai_recommendations', updated); set({ recommendations: updated });
  },
  dismissRecommendation: (id) => {
    const updated = get().recommendations.filter(r => r.id !== id);
    storage.set('module_ai_recommendations', updated); set({ recommendations: updated });
  },
  getByDeal: (dealId) => get().recommendations.filter(r => r.dealId === dealId),
  getByContact: (contactId) => get().recommendations.filter(r => r.contactId === contactId),
}));
