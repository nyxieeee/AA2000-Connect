import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface MeetingItem {
  id: string;
  serviceRecordId?: string;
  title: string;
  agenda?: string;
  notes?: string;
  scheduledAt?: string;
  attendees?: string[];
  createdAt: string;
}

interface MeetingsStore {
  meetings: MeetingItem[];
  fetchMeetings: () => void;
  addMeeting: (meeting: Omit<MeetingItem, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, updates: Partial<MeetingItem>) => void;
  deleteMeeting: (id: string) => void;
}

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  meetings: storage.get<MeetingItem[]>('module_meetings') || [],
  fetchMeetings: () => { const meetings = storage.get<MeetingItem[]>('module_meetings') || []; set({ meetings }); },
  addMeeting: (data) => {
    const newMeeting: MeetingItem = { ...data, id: `mtg-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().meetings, newMeeting];
    storage.set('module_meetings', updated); set({ meetings: updated });
  },
  updateMeeting: (id, updates) => {
    const updated = get().meetings.map(m => m.id === id ? { ...m, ...updates } : m);
    storage.set('module_meetings', updated); set({ meetings: updated });
  },
  deleteMeeting: (id) => {
    const updated = get().meetings.filter(m => m.id !== id);
    storage.set('module_meetings', updated); set({ meetings: updated });
  },
}));
