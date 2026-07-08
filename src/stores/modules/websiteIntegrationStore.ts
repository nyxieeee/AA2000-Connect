import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface WebsiteContent {
  id: string;
  type: 'blog_post' | 'case_study' | 'review' | 'page';
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  slug: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  status: 'new' | 'responded' | 'converted';
  createdAt: string;
}

interface WebsiteIntegrationStore {
  content: WebsiteContent[];
  inquiries: WebInquiry[];
  fetchAll: () => void;
  addContent: (data: Omit<WebsiteContent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContent: (id: string, updates: Partial<WebsiteContent>) => void;
  deleteContent: (id: string) => void;
  addInquiry: (data: Omit<WebInquiry, 'id' | 'createdAt'>) => void;
  updateInquiry: (id: string, updates: Partial<WebInquiry>) => void;
}

const seedContent: WebsiteContent[] = [
  { id: 'wc-1', type: 'blog_post', title: 'Top 5 Fire Safety Trends for Philippine Businesses in 2026', content: 'As businesses continue to modernize their fire safety systems...', status: 'published', author: 'Marketing Team', slug: 'fire-safety-trends-2026', publishedAt: new Date(Date.now() - 604800000).toISOString(), createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'wc-2', type: 'case_study', title: 'SM Megamall FDAS Upgrade — 500+ Device Installation', content: 'Project overview: Complete FDAS overhaul across 4 floors...', status: 'published', author: 'Anna Reyes', slug: 'sm-megamall-fdas-upgrade', publishedAt: new Date(Date.now() - 1209600000).toISOString(), createdAt: new Date(Date.now() - 1209600000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'wc-3', type: 'review', title: 'Excellent CCTV Installation Service', content: '"AA2000 provided outstanding service for our office CCTV system. Professional team, clean installation, and great after-sales support." — Ricardo Tan, ABC Corp', status: 'published', author: 'Client', slug: 'review-ricardo-tan', publishedAt: new Date(Date.now() - 2592000000).toISOString(), createdAt: new Date(Date.now() - 2592000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'wc-4', type: 'blog_post', title: 'Understanding RA 9514: Fire Code Compliance Guide', content: 'A comprehensive guide to Republic Act 9514 requirements...', status: 'draft', author: 'Marketing Team', slug: 'ra-9514-compliance-guide', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const seedInquiries: WebInquiry[] = [
  { id: 'wi-1', name: 'Jose Martinez', email: 'jose@company.com', phone: '+63 917 555 6666', message: 'We need a quotation for FDAS installation in our new warehouse in Laguna. Approximately 2,000 sqm.', source: 'Website Contact Form', status: 'new', createdAt: new Date().toISOString() },
  { id: 'wi-2', name: 'Linda Gomez', email: 'linda@bgc-tower.com', message: 'Interested in upgrading our existing CCTV system. Current setup: 24 analog cameras.', source: 'Website Chat Widget', status: 'responded', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const storedC = storage.get<WebsiteContent[]>('module_website_content');
const storedI = storage.get<WebInquiry[]>('module_website_inquiries');
if (!storedC) storage.set('module_website_content', seedContent);
if (!storedI) storage.set('module_website_inquiries', seedInquiries);

export const useWebsiteIntegrationStore = create<WebsiteIntegrationStore>((set, get) => ({
  content: storedC || seedContent,
  inquiries: storedI || seedInquiries,
  fetchAll: () => {
    set({ content: storage.get<WebsiteContent[]>('module_website_content') || [], inquiries: storage.get<WebInquiry[]>('module_website_inquiries') || [] });
  },
  addContent: (data) => {
    const c: WebsiteContent = { ...data, id: `wc-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const updated = [...get().content, c];
    storage.set('module_website_content', updated); set({ content: updated });
  },
  updateContent: (id, updates) => {
    const updated = get().content.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    storage.set('module_website_content', updated); set({ content: updated });
  },
  deleteContent: (id) => {
    const updated = get().content.filter(c => c.id !== id);
    storage.set('module_website_content', updated); set({ content: updated });
  },
  addInquiry: (data) => {
    const i: WebInquiry = { ...data, id: `wi-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().inquiries, i];
    storage.set('module_website_inquiries', updated); set({ inquiries: updated });
  },
  updateInquiry: (id, updates) => {
    const updated = get().inquiries.map(i => i.id === id ? { ...i, ...updates } : i);
    storage.set('module_website_inquiries', updated); set({ inquiries: updated });
  },
}));
