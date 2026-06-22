import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface OrgChartNode {
  id: string;
  companyId: string;
  contactId: string;
  contactName: string;
  title: string;
  department: string;
  parentId?: string;
  email?: string;
  phone?: string;
}

interface OrgChartStore {
  nodes: OrgChartNode[];
  fetchNodes: (companyId?: string) => void;
  addNode: (node: Omit<OrgChartNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<OrgChartNode>) => void;
  deleteNode: (id: string) => void;
  getNodesByCompany: (companyId: string) => OrgChartNode[];
  getChildren: (parentId: string) => OrgChartNode[];
}

export const useOrgChartStore = create<OrgChartStore>((set, get) => ({
  nodes: storage.get<OrgChartNode[]>('module_org_chart') || [],
  fetchNodes: (companyId) => {
    const nodes = storage.get<OrgChartNode[]>('module_org_chart') || [];
    set({ nodes: companyId ? nodes.filter(n => n.companyId === companyId) : nodes });
  },
  addNode: (data) => {
    const node: OrgChartNode = { ...data, id: `org-${Date.now()}` };
    const updated = [...get().nodes, node];
    storage.set('module_org_chart', updated); set({ nodes: updated });
  },
  updateNode: (id, updates) => {
    const updated = get().nodes.map(n => n.id === id ? { ...n, ...updates } : n);
    storage.set('module_org_chart', updated); set({ nodes: updated });
  },
  deleteNode: (id) => {
    const updated = get().nodes.filter(n => n.id !== id && n.parentId !== id);
    storage.set('module_org_chart', updated); set({ nodes: updated });
  },
  getNodesByCompany: (companyId) => get().nodes.filter(n => n.companyId === companyId),
  getChildren: (parentId) => get().nodes.filter(n => n.parentId === parentId),
}));
