import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface SequenceStep {
  id: string;
  type: 'email' | 'task' | 'wait' | 'notification' | 'ai_agent';
  subject?: string;
  content?: string;
  aiAgentId?: string;
  aiAgentName?: string;
  promptInstruction?: string;
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
  deleteEnrollment: (id: string) => void;
}

const seedSequences: Sequence[] = [
  {
    id: 'seq-seed-1',
    name: 'New Lead Welcome & Intake Drip',
    description: 'Auto-sends welcome email and queues follow-up tasks for new inquiries',
    trigger: 'lead_created',
    enabled: true,
    createdAt: new Date().toISOString(),
    steps: [
      { id: 'step-1', type: 'email', subject: 'Thank you for inquiring with AA2000 Security Systems', content: 'Good day! Thank you for reaching out to AA2000 Connect regarding your security and fire safety needs.', delayDays: 0, order: 0 },
      { id: 'step-2', type: 'ai_agent', aiAgentId: 'agent-1', aiAgentName: 'Customer Service Agent', subject: 'AI Viber Check-in & Q&A Response', promptInstruction: 'Analyze lead inquiry and send personalized Viber response with CCTV/Fire Safety specifications.', delayDays: 2, order: 1 },
      { id: 'step-3', type: 'task', subject: 'Viber Follow-up Check-in with Client', content: 'Send a friendly Viber check-in regarding CCTV/Fire Alarm requirements.', delayDays: 2, order: 2 },
      { id: 'step-4', type: 'notification', subject: 'Alert: Lead Unresponsive for 5 Days', content: 'Notify assigned Sales Rep to perform a phone call follow-up.', delayDays: 5, order: 3 },
    ]
  },
  {
    id: 'seq-seed-2',
    name: 'Proposal Sent Closing Sequence',
    description: 'Auto-triggers when a deal moves to Proposal Sent stage',
    trigger: 'deal_stage',
    triggerValue: 'Proposal Sent',
    enabled: true,
    createdAt: new Date().toISOString(),
    steps: [
      { id: 'step-201', type: 'ai_agent', aiAgentId: 'agent-3', aiAgentName: 'Sales Intelligence Agent', subject: 'AI Proposal Review & Special Closing Incentive', promptInstruction: 'Evaluate quote scope and generate tailored proposal review email highlighting AA2000 2-year warranty.', delayDays: 1, order: 0 },
      { id: 'step-202', type: 'task', subject: 'Proposal Review Call & Technical Q&A', content: 'Call client to review quotation details and answer technical scope questions.', delayDays: 3, order: 1 },
      { id: 'step-203', type: 'email', subject: 'Special Warranty Coverage for AA2000 Projects', content: 'Sharing our extended 2-year warranty coverage details for your peace of mind.', delayDays: 6, order: 2 }
    ]
  },
  {
    id: 'seq-seed-3',
    name: 'Inactive Lead Re-engagement',
    description: 'Re-activates leads that have been inactive for 14 days',
    trigger: 'inactivity',
    enabled: true,
    createdAt: new Date().toISOString(),
    steps: [
      { id: 'step-301', type: 'email', subject: 'Checking in on your Fire Safety / Security Project', content: 'Hi there! We wanted to check if your security system project is still active or needs updated pricing.', delayDays: 14, order: 0 },
      { id: 'step-302', type: 'notification', subject: 'Manager Alert: Re-engagement Sequence Fired', content: 'Alert sales manager to re-assign or review account.', delayDays: 15, order: 1 }
    ]
  }
];

const storedSequences = storage.get<Sequence[]>('module_sequences');
const storedEnrollments = storage.get<SequenceEnrollment[]>('module_seq_enrollments');

if (!storedSequences || storedSequences.length === 0) {
  storage.set('module_sequences', seedSequences);
}

export const useSequencesStore = create<SequencesStore>((set, get) => ({
  sequences: (storedSequences && storedSequences.length > 0) ? storedSequences : seedSequences,
  enrollments: storedEnrollments || [],
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
  deleteEnrollment: (id) => {
    const updated = get().enrollments.filter(e => e.id !== id);
    storage.set('module_seq_enrollments', updated); set({ enrollments: updated });
  },
}));
