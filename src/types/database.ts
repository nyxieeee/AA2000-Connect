export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface ServiceType {
  id: string;
  key: string;
  label: string;
  field_schema: Json;
  category: 'process' | 'dataset';
}

export interface Service {
  id: string;
  service_type_id: string;
  name: string;
  config: Json;
  created_at: string;
}

export interface ServiceRecord {
  id: string;
  service_id: string;
  fields: Json;
  status: string | null;
  assigned_to: string | null;
  won_lost_status: 'won' | 'lost' | null;
  lost_reason: string | null;
  closed_at: string | null;
  quotation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  type: string | null;
  status: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  status: string | null;
  score: number;
  assigned_to: string | null;
  tags: string[];
  consent_given: boolean;
  data_retention_until: string | null;
  created_at: string;
}

export interface ContactRelationship {
  id: string;
  company_id: string;
  contact_id: string;
  reports_to_contact_id: string | null;
  department: string | null;
  title: string | null;
}

export interface AccountTeamMember {
  id: string;
  company_id: string;
  user_id: string;
  role: string | null;
}

export interface Lead {
  id: string;
  contact_id: string | null;
  source: string | null;
  ad_campaign: string | null;
  ad_creative: string | null;
  assigned_to: string | null;
  status: string | null;
  created_at: string;
}

export interface CompanyResearch {
  id: string;
  company_id: string;
  tier: string | null;
  is_decision_maker: boolean | null;
  existing_security_vendor: string | null;
  existing_system_age_estimate: string | null;
  compliance_gap_notes: string | null;
  outreach_angles: Json;
  created_at: string;
}

export interface StageHistory {
  id: string;
  service_record_id: string;
  from_stage: string | null;
  to_stage: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface Activity {
  id: string;
  service_record_id: string | null;
  contact_id: string | null;
  type: string | null;
  description: string | null;
  occurred_at: string;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  steps: Json;
  service_type_id: string | null;
  source_prompt: string | null;
  created_at: string;
}

export interface ProcessInstance {
  id: string;
  process_definition_id: string;
  service_record_id: string | null;
  current_step: number;
  status: string;
  started_at: string;
}

export interface ApprovalRequest {
  id: string;
  process_instance_id: string | null;
  requested_by: string | null;
  approver_id: string | null;
  status: string;
  comment: string | null;
  requested_at: string;
  resolved_at: string | null;
}

export interface Document {
  id: string;
  service_record_id: string | null;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  field_schema: Json;
  target_service_type_id: string | null;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Json;
  created_service_record_id: string | null;
  submitted_at: string;
}

export interface ChatChannel {
  id: string;
  name: string | null;
  is_dm: boolean;
  service_record_id: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

export interface EmailAccount {
  id: string;
  user_id: string;
  provider: string | null;
  oauth_tokens: Json;
  connected_at: string;
}

export interface EmailEvent {
  id: string;
  service_record_id: string | null;
  type: string | null;
  occurred_at: string;
}

export interface EmailLink {
  id: string;
  email_event_id: string;
  url: string;
  label: string | null;
}

export interface EmailLinkClick {
  id: string;
  email_link_id: string;
  clicked_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string | null;
  related_lead_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  service_record_id: string | null;
  assigned_to: string | null;
  title: string;
  due_date: string | null;
  completed: boolean;
  recurrence_rule: string | null;
  next_occurrence: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  service_record_id: string | null;
  author_id: string | null;
  content: string;
  created_at: string;
}

export interface Sequence {
  id: string;
  name: string;
  steps: Json;
}

export interface SequenceEnrollment {
  id: string;
  sequence_id: string;
  service_record_id: string | null;
  current_step: number;
  status: string;
  enrolled_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  company_name: string | null;
  start_date: string | null;
  end_date: string | null;
  team_members: string[];
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  depends_on: string[];
  created_at: string;
}

export interface AppRequest {
  id: string;
  request_number: string;
  type: string;
  priority: string;
  status: string;
  subject: string;
  description: string | null;
  contact_id: string | null;
  company_id: string | null;
  company_name: string | null;
  assigned_to: string | null;
  source: string;
  sla_due_at: string | null;
  sla_breached: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  service_record_id: string | null;
  quotation_id: string | null;
  document_id: string | null;
  start_date: string | null;
  end_date: string | null;
  renewal_alert_days: number;
  risk_level: string | null;
}

export interface Meeting {
  id: string;
  service_record_id: string | null;
  title: string;
  agenda: string | null;
  notes: string | null;
  scheduled_at: string | null;
  attendees: Json;
}

export interface ChatbotConversation {
  id: string;
  visitor_id: string | null;
  started_at: string;
  ended_at: string | null;
  created_lead_id: string | null;
}

export interface ChatbotMessage {
  id: string;
  conversation_id: string;
  sender: string | null;
  content: string | null;
  sent_at: string;
}

export interface SLAPolicy {
  id: string;
  service_type_id: string | null;
  name: string | null;
  response_time_minutes: number | null;
  resolution_time_minutes: number | null;
}

export interface SLATracking {
  id: string;
  service_record_id: string | null;
  sla_policy_id: string | null;
  due_at: string | null;
  breached: boolean;
  resolved_at: string | null;
}

export interface AIRecommendation {
  id: string;
  service_record_id: string | null;
  type: string | null;
  content: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'employee';
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  changes: Json;
  occurred_at: string;
}

export interface DataSubjectRequest {
  id: string;
  contact_id: string | null;
  request_type: string | null;
  status: string;
  requested_at: string;
  resolved_at: string | null;
}

export interface SavedReport {
  id: string;
  name: string;
  report_type: string | null;
  filters: Json;
  generated_by: string | null;
  generated_at: string;
  export_url: string | null;
}

export interface Database {
  public: {
    Tables: {
      service_types: { Row: ServiceType };
      services: { Row: Service };
      service_records: { Row: ServiceRecord };
      companies: { Row: Company };
      contacts: { Row: Contact };
      contact_relationships: { Row: ContactRelationship };
      account_team_members: { Row: AccountTeamMember };
      leads: { Row: Lead };
      company_research: { Row: CompanyResearch };
      stage_history: { Row: StageHistory };
      activities: { Row: Activity };
      process_definitions: { Row: ProcessDefinition };
      process_instances: { Row: ProcessInstance };
      approval_requests: { Row: ApprovalRequest };
      documents: { Row: Document };
      form_definitions: { Row: FormDefinition };
      form_submissions: { Row: FormSubmission };
      chat_channels: { Row: ChatChannel };
      chat_messages: { Row: ChatMessage };
      email_accounts: { Row: EmailAccount };
      email_events: { Row: EmailEvent };
      email_links: { Row: EmailLink };
      email_link_clicks: { Row: EmailLinkClick };
      notifications: { Row: Notification };
      tasks: { Row: Task };
      notes: { Row: Note };
      workflow_templates: { Row: any };
      sequences: { Row: Sequence };
      sequence_enrollments: { Row: SequenceEnrollment };
      app_requests: { Row: AppRequest };
      projects: { Row: Project };
      project_tasks: { Row: ProjectTask };
      contracts: { Row: Contract };
      meetings: { Row: Meeting };
      chatbot_conversations: { Row: ChatbotConversation };
      chatbot_messages: { Row: ChatbotMessage };
      sla_policies: { Row: SLAPolicy };
      sla_tracking: { Row: SLATracking };
      ai_recommendations: { Row: AIRecommendation };
      user_roles: { Row: UserRole };
      audit_logs: { Row: AuditLog };
      data_subject_requests: { Row: DataSubjectRequest };
      migration_log: { Row: any };
      saved_reports: { Row: SavedReport };
    };
  };
}
