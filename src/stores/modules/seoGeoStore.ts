import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface SEOKeyword {
  id: string;
  keyword: string;
  currentRank: number;
  previousRank: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  brand: string;
}

export interface GEOPrompt {
  id: string;
  prompt: string;
  aiEngine: 'chatgpt' | 'gemini' | 'perplexity' | 'claude';
  aa2000Mentioned: boolean;
  position: number | null;
  competitors: string[];
  checkedAt: string;
}

interface SEOGEOStore {
  keywords: SEOKeyword[];
  prompts: GEOPrompt[];
  fetchAll: () => void;
  addKeyword: (data: Omit<SEOKeyword, 'id'>) => void;
  updateKeyword: (id: string, updates: Partial<SEOKeyword>) => void;
  addPrompt: (data: Omit<GEOPrompt, 'id'>) => void;
  updatePrompt: (id: string, updates: Partial<GEOPrompt>) => void;
}

const seedKeywords: SEOKeyword[] = [
  { id: 'seo-1', keyword: 'fire alarm system philippines', currentRank: 3, previousRank: 5, searchVolume: 2400, difficulty: 42, url: '/services/fdas', brand: 'AA2000' },
  { id: 'seo-2', keyword: 'CCTV installation manila', currentRank: 7, previousRank: 8, searchVolume: 3100, difficulty: 55, url: '/services/cctv', brand: 'Hikvision' },
  { id: 'seo-3', keyword: 'access control system price', currentRank: 12, previousRank: 15, searchVolume: 1800, difficulty: 38, url: '/services/access-control', brand: 'Ajax' },
  { id: 'seo-4', keyword: 'fire detection suppression system', currentRank: 2, previousRank: 2, searchVolume: 890, difficulty: 35, url: '/services/suppression', brand: 'Edwards' },
  { id: 'seo-5', keyword: 'structured cabling contractor ph', currentRank: 5, previousRank: 9, searchVolume: 1200, difficulty: 30, url: '/services/cabling', brand: 'AA2000' },
  { id: 'seo-6', keyword: 'network switch enterprise philippines', currentRank: 18, previousRank: 22, searchVolume: 720, difficulty: 48, url: '/products/networking', brand: 'Ruijie' },
];

const seedPrompts: GEOPrompt[] = [
  { id: 'geo-1', prompt: 'Best fire alarm company in the Philippines', aiEngine: 'chatgpt', aa2000Mentioned: true, position: 2, competitors: ['FirePro', 'Notifier'], checkedAt: new Date().toISOString() },
  { id: 'geo-2', prompt: 'Top CCTV installer Manila', aiEngine: 'gemini', aa2000Mentioned: false, position: null, competitors: ['Hikvision PH', 'TechSecure'], checkedAt: new Date().toISOString() },
  { id: 'geo-3', prompt: 'Recommended fire safety companies Philippines 2026', aiEngine: 'perplexity', aa2000Mentioned: true, position: 1, competitors: ['AA2000', 'SafeGuard'], checkedAt: new Date().toISOString() },
];

const storedKW = storage.get<SEOKeyword[]>('module_seo_keywords');
const storedGEO = storage.get<GEOPrompt[]>('module_geo_prompts');
if (!storedKW) storage.set('module_seo_keywords', seedKeywords);
if (!storedGEO) storage.set('module_geo_prompts', seedPrompts);

export const useSEOGEOStore = create<SEOGEOStore>((set, get) => ({
  keywords: storedKW || seedKeywords,
  prompts: storedGEO || seedPrompts,
  fetchAll: () => {
    set({ keywords: storage.get<SEOKeyword[]>('module_seo_keywords') || [], prompts: storage.get<GEOPrompt[]>('module_geo_prompts') || [] });
  },
  addKeyword: (data) => {
    const kw: SEOKeyword = { ...data, id: `seo-${Date.now()}` };
    const updated = [...get().keywords, kw];
    storage.set('module_seo_keywords', updated); set({ keywords: updated });
  },
  updateKeyword: (id, updates) => {
    const updated = get().keywords.map(k => k.id === id ? { ...k, ...updates } : k);
    storage.set('module_seo_keywords', updated); set({ keywords: updated });
  },
  addPrompt: (data) => {
    const p: GEOPrompt = { ...data, id: `geo-${Date.now()}` };
    const updated = [...get().prompts, p];
    storage.set('module_geo_prompts', updated); set({ prompts: updated });
  },
  updatePrompt: (id, updates) => {
    const updated = get().prompts.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.set('module_geo_prompts', updated); set({ prompts: updated });
  },
}));
