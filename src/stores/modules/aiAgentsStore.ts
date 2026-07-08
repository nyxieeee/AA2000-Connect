import { create } from 'zustand';
import { storage } from '../../services/storage';

export type AgentCategory = 'Conversational' | 'Marketing' | 'Sales' | 'Vision';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  category: AgentCategory;
  schedule: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  model: string;
  personality?: string;
  sellingStyle?: string;
  status: 'active' | 'paused';
  logs: string[];
  createdAt: string;
}

interface AIAgentsStore {
  agents: AIAgent[];
  addAgent: (agent: Omit<AIAgent, 'id' | 'createdAt' | 'status' | 'logs'>) => void;
  toggleAgentStatus: (id: string) => void;
  deleteAgent: (id: string) => void;
  addAgentLog: (id: string, log: string) => void;
  updateAgentModel: (id: string, model: string) => void;
}

const DEFAULT_AGENTS: AIAgent[] = [
  {
    id: 'agent-1',
    name: 'Customer Service Agent',
    role: 'Handles customer chat inquiries on Viber, Messenger, & Website.',
    description: 'Auto-replies to inquiries using product catalogs and customer history logs.',
    category: 'Conversational',
    schedule: 'on_demand',
    model: 'gemini-2.5-flash',
    personality: 'Professional & Formal',
    sellingStyle: 'Direct Inquiry Mode',
    status: 'active',
    logs: [
      'Joined channel Viber thread at 2026-07-08T10:00:00Z',
      'Answered product spec inquiry on Hikvision PTZ Dome at 2026-07-08T11:15:30Z',
      'Forwarded complex quote inquiry to Sales Rep Anna at 2026-07-08T12:02:11Z'
    ],
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'agent-2',
    name: 'Marketing Content Writer',
    role: 'Generates Email Campaigns, newsletters, & social media posts.',
    description: 'Drafts product promotion content aligned with the configured brand voice.',
    category: 'Marketing',
    schedule: 'weekly',
    model: 'groq/gpt-oss-120b',
    status: 'active',
    logs: [
      'Generated Q3 CCTV newsletter draft at 2026-07-05T08:00:00Z',
      'Created Facebook product feature series content at 2026-07-06T09:30:00Z'
    ],
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'agent-3',
    name: 'Sales Intelligence Agent',
    role: 'Analyzes pipeline deals and predicts lead win probability.',
    description: 'Flag leads with a scoring value of 80+ for prioritized follow-ups.',
    category: 'Sales',
    schedule: 'daily',
    model: 'groq/llama-3.1-8b',
    status: 'active',
    logs: [
      'Scanned pipeline logs at 2026-07-08T00:01:00Z',
      'Flagged deal #DL-448 for client Santos as HOT (Score: 88)'
    ],
    createdAt: '2026-07-01T00:00:00Z'
  },
  {
    id: 'agent-4',
    name: 'AI List Scanner',
    role: 'Extracts hardware and pricing details from uploaded quote list files.',
    description: 'Vision processor for handwriting, PDFs, and bills of materials.',
    category: 'Vision',
    schedule: 'on_demand',
    model: 'gemini-2.5-flash',
    status: 'active',
    logs: [
      'Parsed blueprinted equipment bill of materials sheet at 2026-07-07T14:22:18Z',
      'Successfully mapped 12 items to catalog database (98% match rate)'
    ],
    createdAt: '2026-07-01T00:00:00Z'
  }
];

export const useAIAgentsStore = create<AIAgentsStore>((set, get) => ({
  agents: storage.get<AIAgent[]>('module_ai_agents') || DEFAULT_AGENTS,
  addAgent: (data) => {
    const newAgent: AIAgent = {
      ...data,
      id: `agent-${Date.now()}`,
      status: 'active',
      logs: [`Agent created and initialized at ${new Date().toISOString()}`],
      createdAt: new Date().toISOString()
    };
    const updated = [...get().agents, newAgent];
    storage.set('module_ai_agents', updated);
    set({ agents: updated });
  },
  toggleAgentStatus: (id) => {
    const updated = get().agents.map(a => 
      a.id === id ? { ...a, status: (a.status === 'active' ? 'paused' : 'active') as 'active' | 'paused' } : a
    );
    storage.set('module_ai_agents', updated);
    set({ agents: updated });
  },
  deleteAgent: (id) => {
    const updated = get().agents.filter(a => a.id !== id);
    storage.set('module_ai_agents', updated);
    set({ agents: updated });
  },
  addAgentLog: (id, log) => {
    const updated = get().agents.map(a => 
      a.id === id ? { ...a, logs: [...a.logs, `[${new Date().toISOString()}] ${log}`] } : a
    );
    storage.set('module_ai_agents', updated);
    set({ agents: updated });
  },
  updateAgentModel: (id, model) => {
    const updated = get().agents.map(a => 
      a.id === id ? { ...a, model } : a
    );
    storage.set('module_ai_agents', updated);
    set({ agents: updated });
  }
}));
