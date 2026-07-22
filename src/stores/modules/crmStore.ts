import { create } from 'zustand';
import { storage } from '../../services/storage';
import type { Contact, Company } from '../../services/db';

interface CRMStore {
  contacts: Contact[];
  companies: Company[];
  loading: boolean;
  
  // Actions
  fetchContacts: () => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  fetchCompanies: () => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
}

function getSeedCompanies(): Company[] {
  return [
    {
      id: 'com-seed-001', name: 'MegaPlaza Corp', industry: 'Real Estate',
      website: 'megaplaza.com', type: 'End User', status: 'Active',
      assigned: 'Rose Bombales', createdAt: '2026-06-01T08:00:00Z',
    },
    {
      id: 'com-seed-002', name: 'Sunrise Properties', industry: 'Real Estate',
      website: 'sunriseprop.com', type: 'End User', status: 'Active',
      assigned: 'Rose Bombales', createdAt: '2026-06-01T08:00:00Z',
    },
    {
      id: 'com-seed-003', name: 'MetroBank PH', industry: 'Banking',
      website: 'metrobank.com.ph', type: 'End User', status: 'Active',
      assigned: 'Rose Bombales', createdAt: '2026-06-01T08:00:00Z',
    },
    {
      id: 'com-seed-004', name: 'Vista Homes', industry: 'Real Estate',
      website: 'vistahomes.ph', type: 'End User', status: 'Active',
      assigned: 'Rose Bombales', createdAt: '2026-06-01T08:00:00Z',
    },
    {
      id: 'com-seed-005', name: 'Regus PH', industry: 'Coworking',
      website: 'regus.com.ph', type: 'End User', status: 'Active',
      assigned: 'Rose Bombales', createdAt: '2026-06-01T08:00:00Z',
    }
  ];
}

function getSeedContacts(): Contact[] {
  return [
    {
      id: 'c-seed-001', name: 'Michael Tan', email: 'michael.tan@megaplaza.com',
      phone: '+63 917 555 1111', status: 'Prospect', score: 85,
      assigned: 'Rose Bombales', tags: ['VIP'], companyId: 'com-seed-001',
      createdAt: '2026-06-01T08:00:00Z'
    },
    {
      id: 'c-seed-002', name: 'Sarah Lim', email: 'sarah.lim@sunriseprop.com',
      phone: '+63 918 222 3333', status: 'Prospect', score: 70,
      assigned: 'Rose Bombales', tags: ['Hot Lead'], companyId: 'com-seed-002',
      createdAt: '2026-06-02T08:00:00Z'
    },
    {
      id: 'c-seed-004', name: 'John Doe', email: 'john.doe@metrobank.com.ph',
      phone: '+63 920 444 5555', status: 'Prospect', score: 90,
      assigned: 'Rose Bombales', tags: ['Enterprise'], companyId: 'com-seed-003',
      createdAt: '2026-06-03T08:00:00Z'
    },
    {
      id: 'c-seed-005', name: 'Elena Santos', email: 'elena.santos@vistahomes.ph',
      phone: '+63 915 666 7777', status: 'Prospect', score: 65,
      assigned: 'Rose Bombales', tags: ['Residential'], companyId: 'com-seed-004',
      createdAt: '2026-06-04T08:00:00Z'
    },
    {
      id: 'c-seed-006', name: 'David Reyes', email: 'david.reyes@regus.com.ph',
      phone: '+63 908 888 9999', status: 'Prospect', score: 80,
      assigned: 'Rose Bombales', tags: ['Partner'], companyId: 'com-seed-005',
      createdAt: '2026-06-05T08:00:00Z'
    }
  ];
}

function seedIfEmpty() {
  const existingContacts = storage.get<Contact[]>('app_contacts');
  const existingCompanies = storage.get<Company[]>('app_companies');
  
  if (!existingCompanies || existingCompanies.length === 0) {
    storage.set('app_companies', getSeedCompanies());
  }
  if (!existingContacts || existingContacts.length === 0) {
    storage.set('app_contacts', getSeedContacts());
  }
}

seedIfEmpty();

export const useCRMStore = create<CRMStore>((set, get) => ({
  contacts: storage.get<Contact[]>('app_contacts') || [],
  companies: storage.get<Company[]>('app_companies') || [],
  loading: false,

  fetchContacts: () => {
    const contacts = storage.get<Contact[]>('app_contacts') || [];
    set({ contacts });
  },

  addContact: (data) => {
    const newContact: Contact = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().contacts, newContact];
    storage.set('app_contacts', updated);
    set({ contacts: updated });
  },

  updateContact: (id, updates) => {
    const updated = get().contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.set('app_contacts', updated);
    set({ contacts: updated });
  },

  deleteContact: (id) => {
    const updated = get().contacts.filter(c => c.id !== id);
    storage.set('app_contacts', updated);
    set({ contacts: updated });
  },

  fetchCompanies: () => {
    const companies = storage.get<Company[]>('app_companies') || [];
    set({ companies });
  },

  addCompany: (data) => {
    const newCompany: Company = {
      ...data,
      id: `c-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().companies, newCompany];
    storage.set('app_companies', updated);
    set({ companies: updated });
  },

  updateCompany: (id, updates) => {
    const updated = get().companies.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.set('app_companies', updated);
    set({ companies: updated });
  },

  deleteCompany: (id) => {
    const updated = get().companies.filter(c => c.id !== id);
    storage.set('app_companies', updated);
    set({ companies: updated });
  }
}));
