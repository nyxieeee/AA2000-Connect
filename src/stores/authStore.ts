import { create } from 'zustand';
import { storage } from '../services/storage';

export type UserRole = 'super_admin' | 'admin' | 'sales_manager' | 'sales_rep' | 'finance' | 'team_leader' | 'ceo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  restoreSession: () => void;
}

/** Demo accounts for login page role selection */
export const DEMO_ACCOUNTS: { label: string; user: User }[] = [
  { label: 'Super Admin', user: { id: '1', name: 'Super Admin', email: 'admin@aa2000.ph', role: 'super_admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' } },
  { label: 'General Manager', user: { id: '2', name: 'GM Torres', email: 'gm@aa2000.ph', role: 'team_leader', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Torres' } },
  { label: 'Sales Manager', user: { id: '3', name: 'Anna Reyes', email: 'anna@aa2000.ph', role: 'sales_manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' } },
  { label: 'Sales Rep', user: { id: '4', name: 'Ben Cruz', email: 'ben@aa2000.ph', role: 'sales_rep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben' } },
  { label: 'Finance', user: { id: '5', name: 'Lisa Santos', email: 'lisa@aa2000.ph', role: 'finance', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' } },
  { label: 'CEO', user: { id: '6', name: 'CEO Garcia', email: 'ceo@aa2000.ph', role: 'ceo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO' } },
];

// Restore persisted session on module load
const persistedUser = storage.get<User>('auth_user');

export const useAuthStore = create<AuthStore>((set) => ({
  user: persistedUser || null,
  isAuthenticated: !!persistedUser,

  login: (user) => {
    storage.set('auth_user', user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    storage.remove('auth_user');
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: () => {
    const user = storage.get<User>('auth_user');
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },
}));
