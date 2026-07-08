import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface KBArticle {
  id: string;
  title: string;
  category: 'technical_manual' | 'installation_standard' | 'fire_code' | 'product_docs' | 'sop' | 'training' | 'bidding_guide' | 'philgeps' | 'marketplace_guide';
  content: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseStore {
  articles: KBArticle[];
  fetchArticles: () => void;
  addArticle: (data: Omit<KBArticle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArticle: (id: string, updates: Partial<KBArticle>) => void;
  deleteArticle: (id: string) => void;
}

const seedArticles: KBArticle[] = [
  { id: 'kb-1', title: 'FDAS Installation Standards — RA 9514', category: 'fire_code', content: 'Republic Act 9514 (Fire Code of the Philippines) mandates that all buildings with occupancy of 10+ persons must have a fire detection and alarm system. Key requirements: smoke detectors every 30 sqm, manual call points at every exit, audible alarms at 75 dB minimum...', tags: ['FDAS', 'fire code', 'RA 9514', 'compliance'], author: 'Admin', createdAt: new Date(Date.now() - 2592000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'kb-2', title: 'Hikvision NVR Setup Guide', category: 'technical_manual', content: 'Step 1: Connect NVR to network switch via Cat6 cable. Step 2: Assign static IP (default 192.168.1.64). Step 3: Access web interface. Step 4: Add cameras using SADP tool or auto-discovery. Step 5: Configure recording schedule...', tags: ['Hikvision', 'NVR', 'CCTV', 'setup'], author: 'Tech. Santos', createdAt: new Date(Date.now() - 1728000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'kb-3', title: 'Ruijie Enterprise Switch Configuration', category: 'product_docs', content: 'Ruijie RG-ES200 series switches support Layer 2+ management. Default credentials: admin/admin. Configure VLANs, port security, and QoS via web management interface or CLI. PoE models support 802.3af/at for IP cameras and access points...', tags: ['Ruijie', 'networking', 'switch', 'configuration'], author: 'Admin', createdAt: new Date(Date.now() - 864000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'kb-4', title: 'PhilGEPS Bidding Procedures', category: 'philgeps', content: 'PhilGEPS registration is mandatory for government procurement. Steps: 1) Register at philgeps.gov.ph, 2) Maintain Platinum membership, 3) Monitor posted opportunities, 4) Submit bid documents per RA 9184 requirements...', tags: ['PhilGEPS', 'bidding', 'government', 'procurement'], author: 'Admin', createdAt: new Date(Date.now() - 432000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'kb-5', title: 'Ajax Security System Training', category: 'training', content: 'Ajax wireless security systems use Jeweller protocol for up to 2km range. Hub 2 Plus supports up to 200 devices. Installation: 1) Mount hub centrally, 2) Add devices via Ajax app, 3) Configure zones and scenarios, 4) Test all devices, 5) Hand over to client...', tags: ['Ajax', 'security', 'wireless', 'training'], author: 'Tech. Reyes', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString() },
];

const stored = storage.get<KBArticle[]>('module_knowledge_base');
if (!stored) storage.set('module_knowledge_base', seedArticles);

export const useKnowledgeBaseStore = create<KnowledgeBaseStore>((set, get) => ({
  articles: stored || seedArticles,
  fetchArticles: () => { set({ articles: storage.get<KBArticle[]>('module_knowledge_base') || [] }); },
  addArticle: (data) => {
    const a: KBArticle = { ...data, id: `kb-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const updated = [...get().articles, a];
    storage.set('module_knowledge_base', updated); set({ articles: updated });
  },
  updateArticle: (id, updates) => {
    const updated = get().articles.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
    storage.set('module_knowledge_base', updated); set({ articles: updated });
  },
  deleteArticle: (id) => {
    const updated = get().articles.filter(a => a.id !== id);
    storage.set('module_knowledge_base', updated); set({ articles: updated });
  },
}));
