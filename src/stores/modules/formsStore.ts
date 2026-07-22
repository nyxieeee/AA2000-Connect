import { create } from 'zustand';
import { storage } from '../../services/storage';
import { useLeadsStore } from './leadsStore';
import { analyzeFormSubmission, type AISubmissionAnalysis } from '../../services/aiFormBuilder';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'file' | 'rating';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
}

export interface FormDef {
  id: string;
  name: string;
  description?: string;
  category?: string;
  fields: FormField[];
  confirmationMessage?: string;
  themeColor?: string;
  status?: 'active' | 'paused';
  targetServiceTypeId?: string;
  createdAt: string;
  submissionCount?: number;
}

export interface FormSub {
  id: string;
  formId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  createdAt: string;
  // AI Analysis fields
  aiScore?: number;
  aiSentiment?: 'positive' | 'neutral' | 'negative';
  aiPriority?: 'hot' | 'warm' | 'cold';
  aiSummary?: string;
  aiTags?: string[];
  aiFollowUp?: string;
  subStatus?: 'new' | 'viewed' | 'converted' | 'archived';
  isAnalyzing?: boolean;
}

interface FormsStore {
  forms: FormDef[];
  submissions: FormSub[];
  addForm: (form: Omit<FormDef, 'id' | 'createdAt'>) => void;
  updateForm: (id: string, updates: Partial<Omit<FormDef, 'id' | 'createdAt'>>) => void;
  deleteForm: (id: string) => void;
  duplicateForm: (id: string) => void;
  toggleFormStatus: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addSubmission: (formId: string, data: Record<string, any>) => Promise<void>;
  deleteSubmission: (id: string) => void;
  updateSubmissionStatus: (id: string, status: FormSub['subStatus']) => void;
  analyzeSubmission: (subId: string) => Promise<void>;
  applyAnalysis: (subId: string, analysis: AISubmissionAnalysis) => void;
}

export const useFormsStore = create<FormsStore>((set, get) => ({
  forms: storage.get<FormDef[]>('module_forms') || [],
  submissions: storage.get<FormSub[]>('module_form_submissions') || [],

  addForm: (data) => {
    const form: FormDef = {
      ...data,
      id: `form-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
      submissionCount: 0,
    };
    const updated = [...get().forms, form];
    storage.set('module_forms', updated);
    set({ forms: updated });
  },

  updateForm: (id, updates) => {
    const updated = get().forms.map(f => f.id === id ? { ...f, ...updates } : f);
    storage.set('module_forms', updated);
    set({ forms: updated });
  },

  deleteForm: (id) => {
    const updated = get().forms.filter(f => f.id !== id);
    storage.set('module_forms', updated);
    set({ forms: updated });
  },

  duplicateForm: (id) => {
    const original = get().forms.find(f => f.id === id);
    if (!original) return;
    const copy: FormDef = {
      ...original,
      id: `form-${Date.now()}`,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      submissionCount: 0,
    };
    const updated = [...get().forms, copy];
    storage.set('module_forms', updated);
    set({ forms: updated });
  },

  toggleFormStatus: (id) => {
    const updated = get().forms.map(f =>
      f.id === id ? { ...f, status: (f.status === 'active' ? 'paused' : 'active') as FormDef['status'] } : f
    );
    storage.set('module_forms', updated);
    set({ forms: updated });
  },

  addSubmission: async (formId, data) => {
    const sub: FormSub = {
      id: `sub-${Date.now()}`,
      formId,
      data,
      createdAt: new Date().toISOString(),
      subStatus: 'new',
      isAnalyzing: true,
    };
    const updatedSubs = [...get().submissions, sub];
    storage.set('module_form_submissions', updatedSubs);

    // Increment form submission count
    const updatedForms = get().forms.map(f =>
      f.id === formId ? { ...f, submissionCount: (f.submissionCount || 0) + 1 } : f
    );
    storage.set('module_forms', updatedForms);
    set({ submissions: updatedSubs, forms: updatedForms });

    // Auto-create CRM Lead
    const formDef = get().forms.find(f => f.id === formId);
    const formName = formDef ? formDef.name : 'Unknown Web Form';
    const leadName = data.full_name || data.name || data.fullName || 'Web Form Submission';
    const email = data.email || data.emailAddress || 'no-email@webform.com';
    const phone = data.phone || data.phoneNumber || data.tel || '';
    const company = data.company || data.companyName || '';

    let notes = `[AUTO GENERATED LEAD FROM WEB FORM]\nForm Name: "${formName}"\n\n`;
    Object.entries(data).forEach(([key, val]) => {
      notes += `${key.toUpperCase().replace(/_/g, ' ')}: ${val}\n`;
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

    // Trigger AI analysis in background
    get().analyzeSubmission(sub.id);
  },

  analyzeSubmission: async (subId) => {
    const sub = get().submissions.find(s => s.id === subId);
    if (!sub) return;
    const formDef = get().forms.find(f => f.id === sub.formId);
    const formName = formDef?.name || 'Web Form';

    set(state => ({
      submissions: state.submissions.map(s =>
        s.id === subId ? { ...s, isAnalyzing: true } : s
      ),
    }));

    try {
      const analysis = await analyzeFormSubmission(formName, sub.data);
      get().applyAnalysis(subId, analysis);
    } catch (e) {
      console.error('AI analysis failed:', e);
      set(state => ({
        submissions: state.submissions.map(s =>
          s.id === subId ? { ...s, isAnalyzing: false } : s
        ),
      }));
    }
  },

  applyAnalysis: (subId, analysis) => {
    const updated = get().submissions.map(s =>
      s.id === subId ? {
        ...s,
        aiScore: analysis.score,
        aiSentiment: analysis.sentiment,
        aiPriority: analysis.priority,
        aiSummary: analysis.summary,
        aiTags: analysis.tags,
        aiFollowUp: analysis.followUpSuggestion,
        isAnalyzing: false,
      } : s
    );
    storage.set('module_form_submissions', updated);
    set({ submissions: updated });
  },

  deleteSubmission: (id) => {
    const updated = get().submissions.filter(s => s.id !== id);
    storage.set('module_form_submissions', updated);
    set({ submissions: updated });
  },

  updateSubmissionStatus: (id, status) => {
    const updated = get().submissions.map(s => s.id === id ? { ...s, subStatus: status } : s);
    storage.set('module_form_submissions', updated);
    set({ submissions: updated });
  },
}));


