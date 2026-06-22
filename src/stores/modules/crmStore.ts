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
