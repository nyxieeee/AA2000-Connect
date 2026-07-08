import { create } from 'zustand';
import { storage } from '../../services/storage';
import { useLeadsStore } from './leadsStore';

export interface FormDef {
  id: string;
  name: string;
  fields: { key: string; label: string; type: string; required: boolean; options?: string[] }[];
  targetServiceTypeId?: string;
  createdAt: string;
}

export interface FormSub {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
}

interface FormsStore {
  forms: FormDef[];
  submissions: FormSub[];
  addForm: (form: Omit<FormDef, 'id' | 'createdAt'>) => void;
  updateForm: (id: string, updates: Partial<Pick<FormDef, 'name' | 'fields'>>) => void;
  deleteForm: (id: string) => void;
  addSubmission: (formId: string, data: Record<string, any>) => void;
  deleteSubmission: (id: string) => void;
}

export const useFormsStore = create<FormsStore>((set, get) => ({
  forms: storage.get<FormDef[]>('module_forms') || [],
  submissions: storage.get<FormSub[]>('module_form_submissions') || [],

  addForm: (data) => {
    const form: FormDef = { ...data, id: `form-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().forms, form];
    storage.set('module_forms', updated); set({ forms: updated });
  },
  updateForm: (id, updates) => {
    const updated = get().forms.map(f => f.id === id ? { ...f, ...updates } : f);
    storage.set('module_forms', updated); set({ forms: updated });
  },
  addSubmission: (formId, data) => {
    const sub: FormSub = { id: `sub-${Date.now()}`, formId, data, createdAt: new Date().toISOString() };
    const updated = [...get().submissions, sub];
    storage.set('module_form_submissions', updated); 
    set({ submissions: updated });

    // Auto-create detailed CRM Lead!
    const formDef = get().forms.find(f => f.id === formId);
    const formName = formDef ? formDef.name : 'Unknown Web Form';

    const leadName = data.full_name || data.name || data.fullName || 'Web Form Submission';
    const email = data.email || data.emailAddress || 'no-email@webform.com';
    const phone = data.phone || data.phoneNumber || data.tel || '';
    const company = data.company || data.companyName || '';
    
    let notes = `[AUTO GENERATED LEAD FROM WEB FORM]\nForm Name: "${formName}"\n\n`;
    Object.entries(data).forEach(([key, val]) => {
      notes += `${key.toUpperCase().replace('_', ' ')}: ${val}\n`;
    });

    useLeadsStore.getState().addLead({
      name: leadName,
      email,
      phone,
      company,
      source: 'website',
      status: 'new',
      notes: notes.trim(),
    });
  },
  deleteForm: (id) => {
    const updated = get().forms.filter(f => f.id !== id);
    storage.set('module_forms', updated); set({ forms: updated });
  },
  deleteSubmission: (id) => {
    const updated = get().submissions.filter(s => s.id !== id);
    storage.set('module_form_submissions', updated); set({ submissions: updated });
  },
}));
