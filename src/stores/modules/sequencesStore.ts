import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface SequenceStep {
  id: string;
  type: 'email' | 'task' | 'wait' | 'notification';
  subject?: string;
  content?: string;
  delayDays: number;
  order: number;
}

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  trigger: 'lead_created' | 'deal_stage' | 'manual' | 'inactivity';
  triggerValue?: string;
  steps: SequenceStep[];
  enabled: boolean;
  createdAt: string;
}

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  contactId?: string;
  dealId?: string;
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'stopped';
  startedAt: string;
  completedAt?: string;
}

interface SequencesStore {
  sequences: Sequence[];
  enrollments: SequenceEnrollment[];
  addSequence: (seq: Omit<Sequence, 'id' | 'createdAt'>) => void;
  updateSequence: (id: string, updates: Partial<Sequence>) => void;
  deleteSequence: (id: string) => void;
  enroll: (enrollment: Omit<SequenceEnrollment, 'id' | 'startedAt'>) => void;
  advanceStep: (enrollmentId: string) => void;
  pauseEnrollment: (enrollmentId: string) => void;
}

export const useSequencesStore = create<SequencesStore>((set, get) => ({
  sequences: storage.get<Sequence[]>('module_sequences') || [],
  enrollments: storage.get<SequenceEnrollment[]>('module_seq_enrollments') || [],
  addSequence: (data) => {
    const seq: Sequence = { ...data, id: `seq-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().sequences, seq];
    storage.set('module_sequences', updated); set({ sequences: updated });
  },
  updateSequence: (id, updates) => {
    const updated = get().sequences.map(s => s.id === id ? { ...s, ...updates } : s);
    storage.set('module_sequences', updated); set({ sequences: updated });
  },
  deleteSequence: (id) => {
    const updated = get().sequences.filter(s => s.id !== id);
    storage.set('module_sequences', updated); set({ sequences: updated });
  },
  enroll: (data) => {
    const enrollment: SequenceEnrollment = { ...data, id: `enr-${Date.now()}`, startedAt: new Date().toISOString() };
    const updated = [...get().enrollments, enrollment];
    storage.set('module_seq_enrollments', updated); set({ enrollments: updated });
  },
  advanceStep: (enrollmentId) => {
    const updated = get().enrollments.map(e =>
      e.id === enrollmentId
        ? { ...e, currentStep: e.currentStep + 1 }
        : e
    );
    storage.set('module_seq_enrollments', updated); set({ enrollments: updated });
  },
  pauseEnrollment: (enrollmentId) => {
    const updated = get().enrollments.map(e =>
      e.id === enrollmentId
        ? { ...e, status: e.status === 'active' ? 'paused' : 'active' } as SequenceEnrollment
        : e
    );
    storage.set('module_seq_enrollments', updated); set({ enrollments: updated });
  },
}));
