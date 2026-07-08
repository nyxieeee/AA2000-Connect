import { create } from 'zustand';
import { storage } from '../../services/storage';

export type ApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'active';
export type WorkflowSource = 'template' | 'ai_generated' | 'manual';

export interface WorkflowFolder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  folderId?: string;
  name: string;
  status: 'Published' | 'Draft' | '';
  approvalStatus: ApprovalStatus;
  source: WorkflowSource;
  sourceTemplateId?: string;
  aiPrompt?: string;
  approvalComment?: string;
  totalEnrolled: number;
  activeEnrolled: number;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges?: any[];
}

interface AutomationStore {
  folders: WorkflowFolder[];
  workflows: Workflow[];
  
  // Actions
  addFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  
  addWorkflow: (workflow: Partial<Workflow>) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;

  // Approval actions
  submitForApproval: (id: string) => void;
  approveWorkflow: (id: string, comment?: string) => void;
  rejectWorkflow: (id: string, comment: string) => void;

  // Template actions
  cloneFromTemplate: (templateId: string) => Workflow | null;
}

const formatDate = () => {
  const date = new Date();
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  folders: storage.get<WorkflowFolder[]>('automation_folders') || [],
  workflows: storage.get<Workflow[]>('automation_workflows') || [
    {
      id: 'w-1',
      name: 'Viber Lead Capture & Auto-Reply',
      status: 'Published',
      approvalStatus: 'active',
      source: 'manual',
      totalEnrolled: 124,
      activeEnrolled: 5,
      createdAt: 'May 1, 2026',
      updatedAt: 'May 5, 2026',
      nodes: [
        { id: 'trigger-1', type: 'triggerNode', data: { label: 'Viber Message Received', triggerEvent: 'Social Message' }, position: { x: 250, y: 20 } },
        { id: 'n-1', type: 'workflowNode', data: { label: 'Auto-Reply: Greeting', type: 'action', iconType: 'sms', description: 'Send automated greeting message.' }, position: { x: 250, y: 170 } },
        { id: 'n-2', type: 'workflowNode', data: { label: 'Create Opportunity', type: 'action', iconType: 'deal', description: 'Add to New Inquiries pipeline.' }, position: { x: 250, y: 320 } }
      ],
      edges: [
        { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
        { id: 'e-2', source: 'n-1', target: 'n-2', animated: true }
      ]
    },
    {
      id: 'w-2',
      name: 'Facebook Page Inquiry Sync',
      status: 'Published',
      approvalStatus: 'active',
      source: 'manual',
      totalEnrolled: 450,
      activeEnrolled: 12,
      createdAt: 'May 2, 2026',
      updatedAt: 'May 6, 2026',
      nodes: [
        { id: 'trigger-1', type: 'triggerNode', data: { label: 'Facebook Message Received', triggerEvent: 'Social Message' }, position: { x: 250, y: 20 } }
      ],
      edges: []
    },
    {
      id: 'w-3',
      name: 'New Website Inquiry -> Notify Team',
      status: 'Draft',
      approvalStatus: 'draft',
      source: 'manual',
      totalEnrolled: 0,
      activeEnrolled: 0,
      createdAt: 'May 6, 2026',
      updatedAt: 'May 6, 2026',
      nodes: [
        { id: 'trigger-1', type: 'triggerNode', data: { label: 'Website Form Submitted', triggerEvent: 'Form Submitted' }, position: { x: 250, y: 20 } }
      ],
      edges: []
    }
  ],

  addFolder: (name: string) => {
    const newFolder: WorkflowFolder = {
      id: `f-${Date.now()}`,
      name,
      createdAt: formatDate(),
      updatedAt: formatDate()
    };
    const updated = [...get().folders, newFolder];
    storage.set('automation_folders', updated);
    set({ folders: updated });
  },

  updateFolder: (id: string, name: string) => {
    const updated = get().folders.map(f => f.id === id ? { ...f, name, updatedAt: formatDate() } : f);
    storage.set('automation_folders', updated);
    set({ folders: updated });
  },

  deleteFolder: (id: string) => {
    const updatedFolders = get().folders.filter(f => f.id !== id);
    const updatedWorkflows = get().workflows.map(w => w.folderId === id ? { ...w, folderId: undefined, updatedAt: formatDate() } : w);
    
    storage.set('automation_folders', updatedFolders);
    storage.set('automation_workflows', updatedWorkflows);
    set({ folders: updatedFolders, workflows: updatedWorkflows });
  },

  addWorkflow: (data) => {
    const newWorkflow: Workflow = {
      id: `w-${Date.now()}`,
      name: data.name || 'New Workflow',
      status: data.status || 'Draft',
      approvalStatus: data.approvalStatus || 'draft',
      source: data.source || 'manual',
      sourceTemplateId: data.sourceTemplateId,
      aiPrompt: data.aiPrompt,
      folderId: data.folderId,
      totalEnrolled: 0,
      activeEnrolled: 0,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      nodes: data.nodes || [],
      edges: data.edges || []
    };
    
    const updated = [...get().workflows, newWorkflow];
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
    return newWorkflow;
  },

  updateWorkflow: (id, updates) => {
    const updated = get().workflows.map(w => w.id === id ? { ...w, ...updates, updatedAt: formatDate() } : w);
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
  },

  deleteWorkflow: (id) => {
    const updated = get().workflows.filter(w => w.id !== id);
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
  },

  submitForApproval: (id) => {
    const updated = get().workflows.map(w =>
      w.id === id
        ? { ...w, approvalStatus: 'pending_approval' as const, approvalComment: undefined, updatedAt: formatDate() }
        : w
    );
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
  },

  approveWorkflow: (id, comment) => {
    const updated = get().workflows.map(w =>
      w.id === id
        ? { ...w, approvalStatus: 'active' as const, status: 'Published' as const, approvalComment: comment, updatedAt: formatDate() }
        : w
    );
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
  },

  rejectWorkflow: (id, comment) => {
    const updated = get().workflows.map(w =>
      w.id === id
        ? { ...w, approvalStatus: 'draft' as const, approvalComment: comment, updatedAt: formatDate() }
        : w
    );
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
  },

  cloneFromTemplate: (templateId) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const templates = storage.get<any[]>('workflow_templates') || [];
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    const newWorkflow: Workflow = {
      id: `w-${Date.now()}`,
      name: template.name,
      status: 'Draft',
      approvalStatus: 'draft',
      source: 'template',
      sourceTemplateId: templateId,
      totalEnrolled: 0,
      activeEnrolled: 0,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      nodes: template.nodes ? JSON.parse(JSON.stringify(template.nodes)) : [],
      edges: template.edges ? JSON.parse(JSON.stringify(template.edges)) : []
    };

    const updated = [...get().workflows, newWorkflow];
    storage.set('automation_workflows', updated);
    set({ workflows: updated });
    return newWorkflow;
  }
}));
