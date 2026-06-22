import { create } from 'zustand';
import { storage } from '../../services/storage';
import type { Project, ProjectTask } from '../../services/db';

interface ProjectsStore {
  projects: Project[];
  tasks: ProjectTask[];
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (t: Omit<ProjectTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<ProjectTask>) => void;
  deleteTask: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  projects: storage.get<Project[]>('module_projects') || [],
  tasks: storage.get<ProjectTask[]>('module_project_tasks') || [],
  addProject: (data) => {
    const p: Project = { ...data, id: `proj-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().projects, p];
    storage.set('module_projects', updated); set({ projects: updated });
  },
  updateProject: (id, updates) => {
    const updated = get().projects.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.set('module_projects', updated); set({ projects: updated });
  },
  deleteProject: (id) => {
    const filtered = get().projects.filter(p => p.id !== id);
    const tasksFiltered = get().tasks.filter(t => t.projectId !== id);
    storage.set('module_projects', filtered); set({ projects: filtered });
    storage.set('module_project_tasks', tasksFiltered); set({ tasks: tasksFiltered });
  },
  addTask: (data) => {
    const t: ProjectTask = { ...data, id: `ptask-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().tasks, t];
    storage.set('module_project_tasks', updated); set({ tasks: updated });
  },
  updateTask: (id, updates) => {
    const updated = get().tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    storage.set('module_project_tasks', updated); set({ tasks: updated });
  },
  deleteTask: (id) => {
    const updated = get().tasks.filter(t => t.id !== id);
    storage.set('module_project_tasks', updated); set({ tasks: updated });
  },
}));
