import { create } from 'zustand';
import { storage } from '../../services/storage';
import { scanAndGenerateAIRecommendations } from '../../services/aiRecommendationEngine';

export interface AIRecommendation {
  id: string;
  dealId?: string;
  contactId?: string;
  contactName?: string;
  channel?: string;
  type: 'next_step' | 'follow_up' | 'risk_alert' | 'suggestion';
  title: string;
  description: string;
  draftMessage?: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  applied: boolean;
  providerUsed?: 'Groq (Qwen)' | 'Mistral AI' | 'Google Gemini';
  createdAt: string;
}

interface AIRecommendationsStore {
  recommendations: AIRecommendation[];
  isScanning: boolean;
  addRecommendation: (r: Omit<AIRecommendation, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markApplied: (id: string) => void;
  updateDraftMessage: (id: string, newDraft: string) => void;
  dismissRecommendation: (id: string) => void;
  runLiveAIScan: (inputData: {
    deals: Array<{ id: string; title: string; value: number; companyName: string; stageId: string; status: string }>;
    leads: Array<{ id: string; name: string; email: string; company?: string; status: string; notes?: string }>;
    signals: Array<{ id: string; name: string; channel: string; signal: string; reason: string }>;
  }) => Promise<number>;
  getByDeal: (dealId: string) => AIRecommendation[];
  getByContact: (contactId: string) => AIRecommendation[];
}

export const useAIRecommendationsStore = create<AIRecommendationsStore>((set, get) => ({
  recommendations: storage.get<AIRecommendation[]>('module_ai_recommendations') || [],
  isScanning: false,
  addRecommendation: (data) => {
    const r: AIRecommendation = { ...data, id: `ai-rec-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [r, ...get().recommendations];
    storage.set('module_ai_recommendations', updated); 
    set({ recommendations: updated });
  },
  markRead: (id) => {
    const updated = get().recommendations.map(r => r.id === id ? { ...r, read: true } : r);
    storage.set('module_ai_recommendations', updated); 
    set({ recommendations: updated });
  },
  markApplied: (id) => {
    const updated = get().recommendations.map(r => r.id === id ? { ...r, applied: true, read: true } : r);
    storage.set('module_ai_recommendations', updated); 
    set({ recommendations: updated });
  },
  updateDraftMessage: (id, newDraft) => {
    const updated = get().recommendations.map(r => r.id === id ? { ...r, draftMessage: newDraft } : r);
    storage.set('module_ai_recommendations', updated); 
    set({ recommendations: updated });
  },
  dismissRecommendation: (id) => {
    const updated = get().recommendations.filter(r => r.id !== id);
    storage.set('module_ai_recommendations', updated); 
    set({ recommendations: updated });
  },
  runLiveAIScan: async (inputData) => {
    set({ isScanning: true });
    try {
      const generated = await scanAndGenerateAIRecommendations(inputData);
      const existingIds = new Set(get().recommendations.map(r => r.title));
      const newItems = generated.filter(g => !existingIds.has(g.title));
      const updated = [...newItems, ...get().recommendations];
      storage.set('module_ai_recommendations', updated);
      set({ recommendations: updated, isScanning: false });
      return newItems.length;
    } catch (e) {
      set({ isScanning: false });
      throw e;
    }
  },
  getByDeal: (dealId) => get().recommendations.filter(r => r.dealId === dealId),
  getByContact: (contactId) => get().recommendations.filter(r => r.contactId === contactId),
}));
