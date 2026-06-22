import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: 'facebook' | 'email' | 'website' | 'messenger' | 'chatbot' | 'manual';
  status: 'new' | 'assigned' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  convertedToContactId?: string;
}

export interface LeadAssignmentRule {
  id: string;
  name: string;
  source?: string;
  territory?: string;
  assignToUserId: string;
  priority: number;
  enabled: boolean;
}

interface LeadsStore {
  leads: Lead[];
  rules: LeadAssignmentRule[];
  fetchLeads: () => void;
  fetchRules: () => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addRule: (rule: Omit<LeadAssignmentRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<LeadAssignmentRule>) => void;
  deleteRule: (id: string) => void;
}

const seedLeads: Lead[] = [
  { id: 'lead-1', name: 'Maria Santos', email: 'maria@example.com', phone: '+63 917 111 1111', company: 'ABC Corp', source: 'facebook', status: 'new', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'lead-2', name: 'Juan Reyes', email: 'juan@example.com', phone: '+63 917 222 2222', company: 'XYZ Inc', source: 'website', status: 'contacted', assignedTo: 'Anna', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'lead-3', name: 'Ana Gonzales', email: 'ana@example.com', phone: '+63 917 333 3333', source: 'email', status: 'qualified', assignedTo: 'Ben', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'lead-4', name: 'Pedro Lim', email: 'pedro@example.com', company: 'LMN Co', source: 'messenger', status: 'new', createdAt: new Date().toISOString() },
  { id: 'lead-5', name: 'Luzviminda Cruz', email: 'luz@example.com', company: 'PQR Ltd', source: 'chatbot', status: 'assigned', assignedTo: 'Anna', createdAt: new Date(Date.now() - 43200000).toISOString() },
];

const seedRules: LeadAssignmentRule[] = [
  { id: 'rule-1', name: 'Facebook leads to Anna', source: 'facebook', assignToUserId: 'Anna', priority: 1, enabled: true },
  { id: 'rule-2', name: 'Website leads to Ben', source: 'website', assignToUserId: 'Ben', priority: 2, enabled: true },
  { id: 'rule-3', name: 'Metro Manila territory to Carlo', territory: 'Metro Manila', assignToUserId: 'Carlo', priority: 3, enabled: false },
];

const storedLeads = storage.get<Lead[]>('module_leads');
const storedRules = storage.get<LeadAssignmentRule[]>('module_lead_rules');

if (!storedLeads) { storage.set('module_leads', seedLeads); }
if (!storedRules) { storage.set('module_lead_rules', seedRules); }

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  leads: storedLeads || seedLeads,
  rules: storedRules || seedRules,
  fetchLeads: () => {
    const leads = storage.get<Lead[]>('module_leads') || [];
    set({ leads });
  },
  fetchRules: () => {
    const rules = storage.get<LeadAssignmentRule[]>('module_lead_rules') || [];
    set({ rules });
  },
  addLead: (data) => {
    const newLead: Lead = { ...data, id: `lead-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().leads, newLead];
    storage.set('module_leads', updated); set({ leads: updated });
  },
  updateLead: (id, updates) => {
    const updated = get().leads.map(l => l.id === id ? { ...l, ...updates } : l);
    storage.set('module_leads', updated); set({ leads: updated });
  },
  deleteLead: (id) => {
    const updated = get().leads.filter(l => l.id !== id);
    storage.set('module_leads', updated); set({ leads: updated });
  },
  addRule: (data) => {
    const rule: LeadAssignmentRule = { ...data, id: `rule-${Date.now()}` };
    const updated = [...get().rules, rule];
    storage.set('module_lead_rules', updated); set({ rules: updated });
  },
  updateRule: (id, updates) => {
    const updated = get().rules.map(r => r.id === id ? { ...r, ...updates } : r);
    storage.set('module_lead_rules', updated); set({ rules: updated });
  },
  deleteRule: (id) => {
    const updated = get().rules.filter(r => r.id !== id);
    storage.set('module_lead_rules', updated); set({ rules: updated });
  },
}));
