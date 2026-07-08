import { supabase } from '../lib/supabase';
import type {
  ServiceType, Service, ServiceRecord, Contact, Company, Lead,
  Document, Task, Note, Meeting, ChatChannel, ChatMessage,
  ProcessDefinition, ProcessInstance, ApprovalRequest, FormDefinition, FormSubmission,
  StageHistory, Activity, CompanyResearch, ContactRelationship, AccountTeamMember,
  AppRequest, Project, ProjectTask, Contract, Sequence, SequenceEnrollment,
  SLAPolicy, SLATracking, AuditLog, UserRole, DataSubjectRequest, SavedReport
} from '../types/database';

// ─── Service Types ──────────────────────────────────────────
export const serviceTypesApi = {
  list: () => supabase.from('service_types').select('*'),
  get: (id: string) => supabase.from('service_types').select('*').eq('id', id).single(),
  create: (data: Omit<ServiceType, 'id'>) => supabase.from('service_types').insert(data).select().single(),
};

// ─── Services ───────────────────────────────────────────────
export const servicesApi = {
  list: () => supabase.from('services').select('*'),
  get: (id: string) => supabase.from('services').select('*').eq('id', id).single(),
  create: (data: Omit<Service, 'id' | 'created_at'>) => supabase.from('services').insert(data).select().single(),
};

// ─── Service Records ────────────────────────────────────────
export const serviceRecordsApi = {
  list: (userId?: string) => {
    let q = supabase.from('service_records').select('*');
    if (userId) q = q.eq('assigned_to', userId);
    return q;
  },
  get: (id: string) => supabase.from('service_records').select('*').eq('id', id).single(),
  create: (data: Omit<ServiceRecord, 'id' | 'created_at' | 'updated_at'>) => supabase.from('service_records').insert(data).select().single(),
  update: (id: string, data: Partial<ServiceRecord>) => supabase.from('service_records').update(data).eq('id', id).select().single(),
  markWon: (id: string) => supabase.from('service_records').update({ won_lost_status: 'won', closed_at: new Date().toISOString() }).eq('id', id).select().single(),
  markLost: (id: string, reason: string) => supabase.from('service_records').update({ won_lost_status: 'lost', lost_reason: reason, closed_at: new Date().toISOString() }).eq('id', id).select().single(),
};

// ─── Contacts ───────────────────────────────────────────────
export const contactsApi = {
  list: () => supabase.from('contacts').select('*, company:companies(*)'),
  get: (id: string) => supabase.from('contacts').select('*, company:companies(*)').eq('id', id).single(),
  create: (data: Omit<Contact, 'id' | 'created_at'>) => supabase.from('contacts').insert(data).select().single(),
  update: (id: string, data: Partial<Contact>) => supabase.from('contacts').update(data).eq('id', id).select().single(),
  delete: (id: string) => supabase.from('contacts').delete().eq('id', id),
};

// ─── Companies ──────────────────────────────────────────────
export const companiesApi = {
  list: () => supabase.from('companies').select('*'),
  get: (id: string) => supabase.from('companies').select('*, contacts(*)').eq('id', id).single(),
  create: (data: Omit<Company, 'id' | 'created_at'>) => supabase.from('companies').insert(data).select().single(),
  update: (id: string, data: Partial<Company>) => supabase.from('companies').update(data).eq('id', id).select().single(),
  delete: (id: string) => supabase.from('companies').delete().eq('id', id),
};

// ─── Leads ──────────────────────────────────────────────────
export const leadsApi = {
  list: () => supabase.from('leads').select('*, contact:contacts(*)'),
  get: (id: string) => supabase.from('leads').select('*, contact:contacts(*)').eq('id', id).single(),
  create: (data: Omit<Lead, 'id' | 'created_at'>) => supabase.from('leads').insert(data).select().single(),
  update: (id: string, data: Partial<Lead>) => supabase.from('leads').update(data).eq('id', id).select().single(),
};

// ─── Documents ──────────────────────────────────────────────
export const documentsApi = {
  list: (serviceRecordId?: string) => {
    let q = supabase.from('documents').select('*');
    if (serviceRecordId) q = q.eq('service_record_id', serviceRecordId);
    return q;
  },
  create: (data: Omit<Document, 'id' | 'uploaded_at'>) => supabase.from('documents').insert(data).select().single(),
  delete: (id: string) => supabase.from('documents').delete().eq('id', id),
};

// ─── Tasks ──────────────────────────────────────────────────
export const tasksApi = {
  list: (userId?: string) => {
    let q = supabase.from('tasks').select('*');
    if (userId) q = q.eq('assigned_to', userId);
    return q.order('created_at', { ascending: false });
  },
  create: (data: Omit<Task, 'id' | 'created_at'>) => supabase.from('tasks').insert(data).select().single(),
  update: (id: string, data: Partial<Task>) => supabase.from('tasks').update(data).eq('id', id).select().single(),
  toggleComplete: (id: string, completed: boolean) => supabase.from('tasks').update({ completed }).eq('id', id).select().single(),
};

// ─── Notes ──────────────────────────────────────────────────
export const notesApi = {
  list: (serviceRecordId: string) => supabase.from('notes').select('*').eq('service_record_id', serviceRecordId).order('created_at', { ascending: false }),
  create: (data: Omit<Note, 'id' | 'created_at'>) => supabase.from('notes').insert(data).select().single(),
};

// ─── Meetings ───────────────────────────────────────────────
export const meetingsApi = {
  list: (serviceRecordId?: string) => {
    let q = supabase.from('meetings').select('*');
    if (serviceRecordId) q = q.eq('service_record_id', serviceRecordId);
    return q.order('scheduled_at', { ascending: false });
  },
  create: (data: Omit<Meeting, 'id'>) => supabase.from('meetings').insert(data).select().single(),
};

// ─── Chat ───────────────────────────────────────────────────
export const chatApi = {
  channels: {
    list: () => supabase.from('chat_channels').select('*'),
    create: (data: Omit<ChatChannel, 'id' | 'created_at'>) => supabase.from('chat_channels').insert(data).select().single(),
  },
  messages: {
    list: (channelId: string) => supabase.from('chat_messages').select('*').eq('channel_id', channelId).order('sent_at', { ascending: true }),
    send: (data: Omit<ChatMessage, 'id' | 'sent_at'>) => supabase.from('chat_messages').insert(data).select().single(),
    subscribe: (channelId: string, callback: (msg: ChatMessage) => void) =>
      supabase.channel(`chat:${channelId}`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${channelId}` }, (payload: any) => callback(payload.new as ChatMessage))
        .subscribe(),
  },
};

// ─── Notifications ──────────────────────────────────────────
export const notificationsApi = {
  list: (userId: string) => supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  markRead: (id: string) => supabase.from('notifications').update({ read: true }).eq('id', id),
  markAllRead: (userId: string) => supabase.from('notifications').update({ read: true }).eq('user_id', userId),
};

// ─── BPM ────────────────────────────────────────────────────
export const bpmApi = {
  definitions: {
    list: () => supabase.from('process_definitions').select('*'),
    create: (data: Omit<ProcessDefinition, 'id' | 'created_at'>) => supabase.from('process_definitions').insert(data).select().single(),
  },
  instances: {
    list: () => supabase.from('process_instances').select('*, definition:process_definitions(*)'),
    create: (data: Omit<ProcessInstance, 'id' | 'started_at'>) => supabase.from('process_instances').insert(data).select().single(),
    advance: (id: string, step: number) => supabase.from('process_instances').update({ current_step: step }).eq('id', id).select().single(),
  },
};

// ─── Approvals ──────────────────────────────────────────────
export const approvalsApi = {
  list: (userId?: string) => {
    let q = supabase.from('approval_requests').select('*, process_instance:process_instances(*)');
    if (userId) q = q.eq('approver_id', userId);
    return q;
  },
  create: (data: Omit<ApprovalRequest, 'id' | 'requested_at' | 'resolved_at'>) => supabase.from('approval_requests').insert(data).select().single(),
  approve: (id: string, comment?: string) => supabase.from('approval_requests').update({ status: 'approved', comment, resolved_at: new Date().toISOString() }).eq('id', id).select().single(),
  reject: (id: string, comment: string) => supabase.from('approval_requests').update({ status: 'rejected', comment, resolved_at: new Date().toISOString() }).eq('id', id).select().single(),
};

// ─── Forms ──────────────────────────────────────────────────
export const formsApi = {
  definitions: {
    list: () => supabase.from('form_definitions').select('*'),
    create: (data: Omit<FormDefinition, 'id' | 'created_at'>) => supabase.from('form_definitions').insert(data).select().single(),
  },
  submissions: {
    list: (formId: string) => supabase.from('form_submissions').select('*').eq('form_id', formId).order('submitted_at', { ascending: false }),
    submit: (data: Omit<FormSubmission, 'id' | 'submitted_at'>) => supabase.from('form_submissions').insert(data).select().single(),
  },
};

// ─── Stage History ──────────────────────────────────────────
export const stageHistoryApi = {
  list: (serviceRecordId: string) => supabase.from('stage_history').select('*').eq('service_record_id', serviceRecordId).order('changed_at', { ascending: false }),
  create: (data: Omit<StageHistory, 'id' | 'changed_at'>) => supabase.from('stage_history').insert(data).select().single(),
};

// ─── Activities ─────────────────────────────────────────────
export const activitiesApi = {
  list: (serviceRecordId?: string) => {
    let q = supabase.from('activities').select('*');
    if (serviceRecordId) q = q.eq('service_record_id', serviceRecordId);
    return q.order('occurred_at', { ascending: false });
  },
  create: (data: Omit<Activity, 'id' | 'occurred_at'>) => supabase.from('activities').insert(data).select().single(),
};

// ─── Company Research ───────────────────────────────────────
export const companyResearchApi = {
  get: (companyId: string) => supabase.from('company_research').select('*').eq('company_id', companyId).single(),
  upsert: (data: Partial<CompanyResearch> & { company_id: string }) => supabase.from('company_research').upsert(data).select().single(),
};

// ─── Contact Relationships ──────────────────────────────────
export const contactRelationshipsApi = {
  list: (companyId: string) => supabase.from('contact_relationships').select('*, contact:contacts(*), reports_to:contacts(*)').eq('company_id', companyId),
  create: (data: Omit<ContactRelationship, 'id'>) => supabase.from('contact_relationships').insert(data).select().single(),
};

// ─── Account Team ───────────────────────────────────────────
export const accountTeamApi = {
  list: (companyId: string) => supabase.from('account_team_members').select('*').eq('company_id', companyId),
  add: (data: Omit<AccountTeamMember, 'id'>) => supabase.from('account_team_members').insert(data).select().single(),
  remove: (id: string) => supabase.from('account_team_members').delete().eq('id', id),
};

// ─── Projects ─────────────────────────────────────────────
export const projectsApi = {
  list: () => supabase.from('projects').select('*'),
  create: (data: Omit<Project, 'id'>) => supabase.from('projects').insert(data).select().single(),
  update: (id: string, data: Partial<Project>) => supabase.from('projects').update(data).eq('id', id).select().single(),
  remove: (id: string) => supabase.from('projects').delete().eq('id', id),
  tasks: {
    list: (projectId: string) => supabase.from('project_tasks').select('*').eq('project_id', projectId),
    create: (data: Omit<ProjectTask, 'id'>) => supabase.from('project_tasks').insert(data).select().single(),
    update: (id: string, data: Partial<ProjectTask>) => supabase.from('project_tasks').update(data).eq('id', id).select().single(),
    remove: (id: string) => supabase.from('project_tasks').delete().eq('id', id),
  },
};

// ─── App Requests ──────────────────────────────────────────
export const requestsApi = {
  list: () => supabase.from('app_requests').select('*'),
  create: (data: Omit<AppRequest, 'id'>) => supabase.from('app_requests').insert(data).select().single(),
  update: (id: string, data: Partial<AppRequest>) => supabase.from('app_requests').update(data).eq('id', id).select().single(),
  remove: (id: string) => supabase.from('app_requests').delete().eq('id', id),
};

// ─── Contracts ──────────────────────────────────────────────
export const contractsApi = {
  list: () => supabase.from('contracts').select('*'),
  create: (data: Omit<Contract, 'id'>) => supabase.from('contracts').insert(data).select().single(),
};

// ─── Sequences ──────────────────────────────────────────────
export const sequencesApi = {
  list: () => supabase.from('sequences').select('*'),
  create: (data: Omit<Sequence, 'id'>) => supabase.from('sequences').insert(data).select().single(),
  enroll: (data: Omit<SequenceEnrollment, 'id' | 'enrolled_at'>) => supabase.from('sequence_enrollments').insert(data).select().single(),
};

// ─── SLA ────────────────────────────────────────────────────
export const slaApi = {
  policies: {
    list: () => supabase.from('sla_policies').select('*'),
    create: (data: Omit<SLAPolicy, 'id'>) => supabase.from('sla_policies').insert(data).select().single(),
  },
  tracking: {
    list: () => supabase.from('sla_tracking').select('*, policy:sla_policies(*)'),
    create: (data: Omit<SLATracking, 'id'>) => supabase.from('sla_tracking').insert(data).select().single(),
  },
};

// ─── Audit Logs ─────────────────────────────────────────────
export const auditLogsApi = {
  list: () => supabase.from('audit_logs').select('*').order('occurred_at', { ascending: false }),
  create: (data: Omit<AuditLog, 'id' | 'occurred_at'>) => supabase.from('audit_logs').insert(data).select().single(),
};

// ─── User Roles ─────────────────────────────────────────────
export const userRolesApi = {
  get: (userId: string) => supabase.from('user_roles').select('*').eq('user_id', userId).single(),
  set: (data: Omit<UserRole, 'id'>) => supabase.from('user_roles').upsert(data).select().single(),
};

// ─── Data Subject Requests (DPA) ────────────────────────────
export const dataSubjectApi = {
  list: () => supabase.from('data_subject_requests').select('*, contact:contacts(*)'),
  create: (data: Omit<DataSubjectRequest, 'id' | 'requested_at' | 'resolved_at'>) => supabase.from('data_subject_requests').insert(data).select().single(),
  resolve: (id: string) => supabase.from('data_subject_requests').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', id).select().single(),
};

// ─── Saved Reports ──────────────────────────────────────────
export const savedReportsApi = {
  list: () => supabase.from('saved_reports').select('*').order('generated_at', { ascending: false }),
  create: (data: Omit<SavedReport, 'id' | 'generated_at'>) => supabase.from('saved_reports').insert(data).select().single(),
};
