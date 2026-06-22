import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (val) => set({ collapsed: val }),
    }),
    { name: 'sidebar-storage' }
  )
);
