import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  platform: 'facebook_marketplace' | 'fb_group' | 'fb_page';
  status: 'draft' | 'published' | 'paused' | 'sold';
  postedAt?: string;
  createdAt: string;
}

export interface MarketplaceInquiry {
  id: string;
  listingId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  message: string;
  source: 'fb_marketplace' | 'fb_messenger' | 'fb_comment' | 'fb_lead_form';
  assignedTo?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  conversationLog: { timestamp: string; message: string; sender: 'client' | 'staff' }[];
  createdAt: string;
}

interface MarketplaceStore {
  listings: MarketplaceListing[];
  inquiries: MarketplaceInquiry[];
  fetchAll: () => void;
  addListing: (data: Omit<MarketplaceListing, 'id' | 'createdAt'>) => void;
  updateListing: (id: string, updates: Partial<MarketplaceListing>) => void;
  deleteListing: (id: string) => void;
  addInquiry: (data: Omit<MarketplaceInquiry, 'id' | 'createdAt'>) => void;
  updateInquiry: (id: string, updates: Partial<MarketplaceInquiry>) => void;
}

const seedListings: MarketplaceListing[] = [
  { id: 'ml-1', title: 'Hikvision 4MP IP Camera DS-2CD1043G2-I', description: 'Brand new, sealed. 4MP ColorVu technology, IP67 weatherproof. Ideal for outdoor surveillance.', category: 'CCTV', price: 4500, images: [], platform: 'facebook_marketplace', status: 'published', postedAt: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'ml-2', title: 'Ruijie RG-ES226GC 24-Port Managed Switch', description: 'Enterprise-grade L2+ managed switch with 24 GE ports + 2 SFP uplinks. Cloud managed.', category: 'Networking', price: 12000, images: [], platform: 'facebook_marketplace', status: 'published', postedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ml-3', title: 'Edwards EST3 Fire Alarm Control Panel', description: 'Addressable fire alarm panel. Supports up to 2,500 devices. UL/FM listed.', category: 'FDAS', price: 85000, images: [], platform: 'fb_page', status: 'draft', createdAt: new Date().toISOString() },
];

const seedInquiries: MarketplaceInquiry[] = [
  { id: 'mi-1', listingId: 'ml-1', contactName: 'Ricardo Tan', contactEmail: 'ricardo@gmail.com', contactPhone: '+63 917 444 5555', message: 'Hi, is this still available? I need 8 units for my warehouse.', source: 'fb_marketplace', assignedTo: 'Ben Cruz', status: 'contacted', conversationLog: [{ timestamp: new Date(Date.now() - 86400000).toISOString(), message: 'Hi, is this still available? I need 8 units for my warehouse.', sender: 'client' }, { timestamp: new Date(Date.now() - 43200000).toISOString(), message: 'Yes sir! Available. For 8 units we can offer a volume discount. Can I send a quotation?', sender: 'staff' }], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'mi-2', listingId: 'ml-2', contactName: 'Maria Lim', contactEmail: 'maria.lim@company.com', message: 'What warranty comes with this? Do you do installation?', source: 'fb_messenger', status: 'new', conversationLog: [{ timestamp: new Date().toISOString(), message: 'What warranty comes with this? Do you do installation?', sender: 'client' }], createdAt: new Date().toISOString() },
];

const storedL = storage.get<MarketplaceListing[]>('module_marketplace_listings');
const storedI = storage.get<MarketplaceInquiry[]>('module_marketplace_inquiries');
if (!storedL) storage.set('module_marketplace_listings', seedListings);
if (!storedI) storage.set('module_marketplace_inquiries', seedInquiries);

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  listings: storedL || seedListings,
  inquiries: storedI || seedInquiries,
  fetchAll: () => {
    set({ listings: storage.get<MarketplaceListing[]>('module_marketplace_listings') || [], inquiries: storage.get<MarketplaceInquiry[]>('module_marketplace_inquiries') || [] });
  },
  addListing: (data) => {
    const l: MarketplaceListing = { ...data, id: `ml-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().listings, l];
    storage.set('module_marketplace_listings', updated); set({ listings: updated });
  },
  updateListing: (id, updates) => {
    const updated = get().listings.map(l => l.id === id ? { ...l, ...updates } : l);
    storage.set('module_marketplace_listings', updated); set({ listings: updated });
  },
  deleteListing: (id) => {
    const updated = get().listings.filter(l => l.id !== id);
    storage.set('module_marketplace_listings', updated); set({ listings: updated });
  },
  addInquiry: (data) => {
    const i: MarketplaceInquiry = { ...data, id: `mi-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().inquiries, i];
    storage.set('module_marketplace_inquiries', updated); set({ inquiries: updated });
  },
  updateInquiry: (id, updates) => {
    const updated = get().inquiries.map(i => i.id === id ? { ...i, ...updates } : i);
    storage.set('module_marketplace_inquiries', updated); set({ inquiries: updated });
  },
}));
