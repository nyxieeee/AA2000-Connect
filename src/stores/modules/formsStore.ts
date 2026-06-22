import { create } from 'zustand';
import { storage } from '../../services/storage';

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
  addSubmission: (formId: string, data: Record<string, any>) => void;
  deleteForm: (id: string) => void;
}

export const useFormsStore = create<FormsStore>((set, get) => ({
  forms: storage.get<FormDef[]>('module_forms') || [],
  submissions: storage.get<FormSub[]>('module_form_submissions') || [],

  addForm: (data) => {
    const form: FormDef = { ...data, id: `form-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().forms, form];
    storage.set('module_forms', updated); set({ forms: updated });
  },
  addSubmission: (formId, data) => {
    const sub: FormSub = { id: `sub-${Date.now()}`, formId, data, createdAt: new Date().toISOString() };
    const updated = [...get().submissions, sub];
    storage.set('module_form_submissions', updated); set({ submissions: updated });
  },
  deleteForm: (id) => {
    const updated = get().forms.filter(f => f.id !== id);
    storage.set('module_forms', updated); set({ forms: updated });
  },
}));
