import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface TaskItem {
  id: string;
  serviceRecordId?: string;
  assignedTo: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  recurrenceRule?: string;
  nextOccurrence?: string;
  createdAt: string;
}

interface TasksStore {
  tasks: TaskItem[];
  fetchTasks: () => void;
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  generateRecurringTasks: () => void;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: storage.get<TaskItem[]>('module_tasks') || [],
  fetchTasks: () => { const tasks = storage.get<TaskItem[]>('module_tasks') || []; set({ tasks }); },
  addTask: (data) => {
    const newTask: TaskItem = { ...data, id: `task-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().tasks, newTask];
    storage.set('module_tasks', updated); set({ tasks: updated });
  },
  updateTask: (id, updates) => {
    const updated = get().tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    storage.set('module_tasks', updated); set({ tasks: updated });
  },
  toggleComplete: (id) => {
    const updated = get().tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    storage.set('module_tasks', updated); set({ tasks: updated });
  },
  deleteTask: (id) => {
    const updated = get().tasks.filter(t => t.id !== id);
    storage.set('module_tasks', updated); set({ tasks: updated });
  },
  generateRecurringTasks: () => {
    const now = new Date();
    const tasks = get().tasks;
    let changed = false;
    const updated = tasks.map(t => {
      if (!t.recurrenceRule || !t.nextOccurrence || !t.completed) return t;
      const next = new Date(t.nextOccurrence);
      if (next > now) return t;
      let newNext: Date;
      if (t.recurrenceRule === 'daily') newNext = new Date(next.getTime() + 86400000);
      else if (t.recurrenceRule === 'weekly') newNext = new Date(next.getTime() + 7 * 86400000);
      else if (t.recurrenceRule === 'monthly') {
        newNext = new Date(next);
        newNext.setMonth(newNext.getMonth() + 1);
      } else return t;
      changed = true;
      return { ...t, completed: false, nextOccurrence: newNext.toISOString() };
    });
    if (changed) { storage.set('module_tasks', updated); set({ tasks: updated }); }
  },
}));
