export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Lead' | 'Customer' | 'Prospect';
  score: number;
  assigned: string;
  tags: string[];
  companyId?: string;
  lastActivity?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  type: 'End User' | 'Contractor' | 'Dealer';
  status: 'Active' | 'Inactive';
  assigned: string;
  employees?: string;
  value?: number;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: Stage[];
}

export interface Stage {
  id: string;
  name: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  dealId?: string;
  contactId?: string;
  companyId?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  teamMembers: string[];
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: string;
  dependsOn: string[];
  createdAt: string;
}

export interface AppRequest {
  id: string;
  requestNumber: string;
  type: 'service' | 'support' | 'inquiry' | 'complaint' | 'internal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description?: string;
  contactId?: string;
  companyId?: string;
  companyName?: string;
  assignedTo?: string;
  source: 'web_form' | 'email' | 'phone' | 'chat' | 'manual';
  slaDueAt?: string;
  slaBreached: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stageId: string;
  pipelineId: string;
  contactId: string;
  companyId?: string;
  companyName?: string;
  product?: string;
  status: 'Open' | 'Won' | 'Lost' | 'Abandoned';
  statusReason?: string;
  statusChangedAt?: string;
  assigned: string;
  aiInquirySummary?: string;
  extractedInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}
