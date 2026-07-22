import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Sales Representative' | 'Account Executive' | 'Project Engineer' | 'Sales Manager';
  email: string;
  phone?: string;
  specialization?: 'supply_only' | 'supply_install' | 'general';
  active: boolean;
}

interface TeamStore {
  members: TeamMember[];
  fetchMembers: () => void;
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
}

const seedMembers: TeamMember[] = [
  { id: 'team-1', name: 'Hardware Sales Rep', role: 'Sales Representative', email: 'supply.sales@aa2000.ph', specialization: 'supply_only', active: true },
  { id: 'team-2', name: 'Project Engineering Rep', role: 'Project Engineer', email: 'projects@aa2000.ph', specialization: 'supply_install', active: true },
  { id: 'team-3', name: 'Inbound Sales Exec', role: 'Account Executive', email: 'inbound@aa2000.ph', specialization: 'general', active: true },
];

const storedMembers = storage.get<TeamMember[]>('module_team_members');

if (!storedMembers) {
  storage.set('module_team_members', seedMembers);
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  members: storedMembers || seedMembers,
  fetchMembers: () => {
    const members = storage.get<TeamMember[]>('module_team_members') || seedMembers;
    set({ members });
  },
  addMember: (data) => {
    const newMember: TeamMember = {
      ...data,
      id: `team-${Date.now()}`
    };
    const updated = [...get().members, newMember];
    storage.set('module_team_members', updated);
    set({ members: updated });
  },
  updateMember: (id, updates) => {
    const updated = get().members.map(m => m.id === id ? { ...m, ...updates } : m);
    storage.set('module_team_members', updated);
    set({ members: updated });
  },
  deleteMember: (id) => {
    const updated = get().members.filter(m => m.id !== id);
    storage.set('module_team_members', updated);
    set({ members: updated });
  }
}));
