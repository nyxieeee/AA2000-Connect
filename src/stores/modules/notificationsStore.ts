import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedLeadId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsStore {
  notifications: NotificationItem[];
  fetchNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: storage.get<NotificationItem[]>('module_notifications') || [],

  fetchNotifications: () => { const notifications = storage.get<NotificationItem[]>('module_notifications') || []; set({ notifications }); },
  addNotification: (data) => {
    const notif: NotificationItem = { ...data, id: `notif-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().notifications, notif];
    storage.set('module_notifications', updated); set({ notifications: updated });
  },
  markRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, read: true } : n);
    storage.set('module_notifications', updated); set({ notifications: updated });
  },
  markAllRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read: true }));
    storage.set('module_notifications', updated); set({ notifications: updated });
  },
  deleteNotification: (id) => {
    const updated = get().notifications.filter(n => n.id !== id);
    storage.set('module_notifications', updated); set({ notifications: updated });
  },
  unreadCount: () => get().notifications.filter(n => !n.read).length,
}));
