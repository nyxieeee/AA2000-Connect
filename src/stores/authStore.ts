import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales_manager' | 'sales_rep';
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Pre-fill with a mock user for "fully functional" demonstration
  user: {
    id: '1',
    name: 'Authorized User',
    email: 'user@aa2000.ph',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  },
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
