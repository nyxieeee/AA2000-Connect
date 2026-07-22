import { create } from 'zustand';
import { storage } from '../../services/storage';
import { researchAndEnrichLead, type AILeadResearchResult } from '../../services/aiLeadResearchService';

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
  aiResearch?: AILeadResearchResult;
}

export interface LeadAssignmentRule {
  id: string;
  name: string;
  source?: string;
  territory?: string;
  quoteScope?: 'all' | 'supply_only' | 'supply_install';
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
  applyRulesToUnassigned: () => number;
  autoEvaluateLeadFunnel: () => { advancedCount: number; summary: string[] };
  markLeadContacted: (identifier: string) => void;
  enrichLeadWithAI: (id: string) => Promise<AILeadResearchResult | null>;
}

const seedLeads: Lead[] = [
  { id: 'lead-1', name: 'Maria Santos', email: 'maria@example.com', phone: '+63 917 111 1111', company: 'ABC Corp', source: 'facebook', notes: 'Quotation Request: Supply Only for 10x Smoke Detectors', status: 'new', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'lead-2', name: 'Juan Reyes', email: 'juan@example.com', phone: '+63 917 222 2222', company: 'XYZ Inc', source: 'website', notes: 'Quotation Request: Supply & Installation for CCTV System', status: 'new', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'lead-3', name: 'Ana Gonzales', email: 'ana@example.com', phone: '+63 917 333 3333', source: 'email', status: 'qualified', assignedTo: 'Inbound Sales Exec', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'lead-4', name: 'Pedro Lim', email: 'pedro@example.com', company: 'LMN Co', source: 'messenger', status: 'new', createdAt: new Date().toISOString() },
  { id: 'lead-5', name: 'Luzviminda Cruz', email: 'luz@example.com', company: 'PQR Ltd', source: 'chatbot', status: 'assigned', assignedTo: 'Project Engineering Rep', createdAt: new Date(Date.now() - 43200000).toISOString() },
];

const seedRules: LeadAssignmentRule[] = [
  { id: 'rule-supply-only', name: 'Supply Only Quotations -> Hardware Sales Rep', quoteScope: 'supply_only', assignToUserId: 'Hardware Sales Rep', priority: 1, enabled: true },
  { id: 'rule-supply-install', name: 'Supply & Installation -> Project Engineering Rep', quoteScope: 'supply_install', assignToUserId: 'Project Engineering Rep', priority: 2, enabled: true },
  { id: 'rule-1', name: 'Facebook leads -> Inbound Sales Exec', source: 'facebook', assignToUserId: 'Inbound Sales Exec', priority: 3, enabled: true },
  { id: 'rule-2', name: 'Website leads -> Inbound Sales Exec', source: 'website', assignToUserId: 'Inbound Sales Exec', priority: 4, enabled: true },
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
    let assignedTo = data.assignedTo;
    let status = data.status || 'new';

    // Auto-evaluate assignment rules if not assigned yet
    if (!assignedTo) {
      const activeRules = [...get().rules]
        .filter(r => r.enabled)
        .sort((a, b) => a.priority - b.priority);

      const leadText = `${data.name} ${data.company || ''} ${data.notes || ''}`;

      for (const rule of activeRules) {
        const matchSource = !rule.source || rule.source.toLowerCase() === data.source.toLowerCase();
        const matchTerritory = !rule.territory || (data.notes && data.notes.toLowerCase().includes(rule.territory.toLowerCase()));
        
        let matchScope = true;
        if (rule.quoteScope === 'supply_only') {
          matchScope = /supply\s*only/i.test(leadText);
        } else if (rule.quoteScope === 'supply_install') {
          matchScope = /supply\s*(&|and)\s*install/i.test(leadText) || /installation/i.test(leadText);
        }

        if (matchSource && matchTerritory && matchScope) {
          assignedTo = rule.assignToUserId;
          if (status === 'new') status = 'assigned';
          break;
        }
      }
    }

    const newLead: Lead = {
      ...data,
      id: `lead-${Date.now()}`,
      assignedTo,
      status,
      createdAt: new Date().toISOString()
    };
    const updated = [...get().leads, newLead];
    storage.set('module_leads', updated);
    set({ leads: updated });
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
  applyRulesToUnassigned: () => {
    const activeRules = [...get().rules]
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);

    let assignedCount = 0;
    const updatedLeads = get().leads.map(lead => {
      if (lead.assignedTo) return lead;

      const leadText = `${lead.name} ${lead.company || ''} ${lead.notes || ''}`;

      for (const rule of activeRules) {
        const matchSource = !rule.source || rule.source.toLowerCase() === lead.source.toLowerCase();
        const matchTerritory = !rule.territory || (lead.notes && lead.notes.toLowerCase().includes(rule.territory.toLowerCase()));
        
        let matchScope = true;
        if (rule.quoteScope === 'supply_only') {
          matchScope = /supply\s*only/i.test(leadText);
        } else if (rule.quoteScope === 'supply_install') {
          matchScope = /supply\s*(&|and)\s*install/i.test(leadText) || /installation/i.test(leadText);
        }

        if (matchSource && matchTerritory && matchScope) {
          assignedCount++;
          return {
            ...lead,
            assignedTo: rule.assignToUserId,
            status: lead.status === 'new' ? 'assigned' : lead.status
          };
        }
      }
      return lead;
    });

    storage.set('module_leads', updatedLeads);
    set({ leads: updatedLeads });
    return assignedCount;
  },

  autoEvaluateLeadFunnel: () => {
    let advancedCount = 0;
    const summary: string[] = [];

    // Apply assignment rules first
    const assignedCount = get().applyRulesToUnassigned();
    if (assignedCount > 0) {
      summary.push(`Auto-assigned ${assignedCount} new lead(s) to team members`);
      advancedCount += assignedCount;
    }

    const currentLeads = get().leads;
    const updated = currentLeads.map(lead => {
      // Rule 1: New leads with assignedTo -> advance to Assigned
      if (lead.status === 'new' && lead.assignedTo) {
        advancedCount++;
        summary.push(`Advanced "${lead.name}" (New → Assigned)`);
        return { ...lead, status: 'assigned' as const };
      }
      // Rule 2: Leads with notes/communications -> advance Assigned to Contacted
      if (lead.status === 'assigned' && (lead.notes || lead.email)) {
        advancedCount++;
        summary.push(`Advanced "${lead.name}" (Assigned → Contacted)`);
        return { ...lead, status: 'contacted' as const };
      }
      // Rule 3: Contacted leads with high interest/notes -> advance Contacted to Qualified
      if (lead.status === 'contacted' && lead.notes && (lead.notes.toLowerCase().includes('quotation') || lead.notes.toLowerCase().includes('cctv') || lead.notes.toLowerCase().includes('smoke'))) {
        advancedCount++;
        summary.push(`Advanced "${lead.name}" (Contacted → Qualified)`);
        return { ...lead, status: 'qualified' as const };
      }
      return lead;
    });

    if (advancedCount > 0) {
      storage.set('module_leads', updated);
      set({ leads: updated });
    }

    return { advancedCount, summary };
  },

  markLeadContacted: (identifier: string) => {
    const leads = get().leads;
    const lower = identifier.toLowerCase();
    const updated = leads.map(lead => {
      if (lead.email.toLowerCase() === lower || (lead.phone && lead.phone.includes(identifier))) {
        if (lead.status === 'new' || lead.status === 'assigned') {
          return { ...lead, status: 'contacted' as const };
        }
      }
      return lead;
    });
    storage.set('module_leads', updated);
    set({ leads: updated });
  },

  enrichLeadWithAI: async (id: string) => {
    const lead = get().leads.find(l => l.id === id);
    if (!lead) return null;

    const research = await researchAndEnrichLead({
      name: lead.name,
      email: lead.email,
      company: lead.company,
      notes: lead.notes,
      source: lead.source,
    });

    const updated = get().leads.map(l => l.id === id ? {
      ...l,
      aiResearch: research,
      status: (research.qualificationScore >= 70 && l.status !== 'converted') ? 'qualified' as const : l.status
    } : l);

    storage.set('module_leads', updated);
    set({ leads: updated });

    return research;
  }
}));
