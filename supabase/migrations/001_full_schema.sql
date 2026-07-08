-- ============================================================
-- AA2000 Connect — Full Database Schema
-- ============================================================
-- 44 tables: core data model, contacts & companies, leads,
-- company research, pipeline, activities, BPM, approvals,
-- documents, web forms, internal chat, email, notifications,
-- tasks & notes, workflows & sequences, maintenance contracts,
-- meetings, chatbot, SLA, AI recommendations, roles, audit logs,
-- data privacy, migration log, saved reports, app requests,
-- projects
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. CORE DATA MODEL
-- ============================================================

create table service_types (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  field_schema jsonb not null,
  category text default 'process'
);

create table services (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid references service_types(id) on delete cascade,
  name text not null,
  config jsonb default '{}',
  created_at timestamptz default now()
);

create table service_records (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  fields jsonb not null default '{}',
  status text,
  assigned_to uuid,
  won_lost_status text,
  lost_reason text,
  closed_at timestamptz,
  quotation_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. CONTACTS & COMPANIES
-- ============================================================

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  website text,
  type text,
  status text default 'Active',
  assigned_to uuid,
  created_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company_id uuid references companies(id) on delete set null,
  status text default 'Lead',
  score int default 0,
  assigned_to uuid,
  tags jsonb default '[]',
  consent_given boolean default false,
  data_retention_until date,
  created_at timestamptz default now()
);

create table contact_relationships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  reports_to_contact_id uuid references contacts(id) on delete set null,
  department text,
  title text
);

create table account_team_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid not null,
  role text
);

-- ============================================================
-- 3. LEADS
-- ============================================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  source text,
  ad_campaign text,
  ad_creative text,
  assigned_to uuid,
  status text,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. COMPANY RESEARCH
-- ============================================================

create table company_research (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  tier text,
  is_decision_maker boolean,
  existing_security_vendor text,
  existing_system_age_estimate text,
  compliance_gap_notes text,
  outreach_angles jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. PIPELINE & STAGES
-- ============================================================

create table stage_history (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  from_stage text,
  to_stage text,
  changed_by uuid,
  changed_at timestamptz default now()
);

-- ============================================================
-- 6. ACTIVITIES
-- ============================================================

create table activities (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  type text,
  description text,
  occurred_at timestamptz default now()
);

-- ============================================================
-- 7. BPM / PROCESS ENGINE
-- ============================================================

create table process_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  steps jsonb not null,
  service_type_id uuid references service_types(id) on delete set null,
  source_prompt text,
  created_at timestamptz default now()
);

create table process_instances (
  id uuid primary key default gen_random_uuid(),
  process_definition_id uuid references process_definitions(id) on delete cascade,
  service_record_id uuid references service_records(id) on delete cascade,
  current_step int default 0,
  status text default 'in_progress',
  started_at timestamptz default now()
);

-- ============================================================
-- 8. APPROVALS
-- ============================================================

create table approval_requests (
  id uuid primary key default gen_random_uuid(),
  process_instance_id uuid references process_instances(id) on delete cascade,
  requested_by uuid,
  approver_id uuid,
  status text default 'pending',
  comment text,
  requested_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================================
-- 9. DOCUMENTS
-- ============================================================

create table documents (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid,
  uploaded_at timestamptz default now()
);

-- ============================================================
-- 10. WEB FORMS
-- ============================================================

create table form_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  field_schema jsonb not null,
  target_service_type_id uuid references service_types(id) on delete set null,
  created_at timestamptz default now()
);

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references form_definitions(id) on delete cascade,
  data jsonb not null,
  created_service_record_id uuid references service_records(id) on delete set null,
  submitted_at timestamptz default now()
);

-- ============================================================
-- 11. INTERNAL CHAT
-- ============================================================

create table chat_channels (
  id uuid primary key default gen_random_uuid(),
  name text,
  is_dm boolean default false,
  service_record_id uuid references service_records(id) on delete set null,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references chat_channels(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  sent_at timestamptz default now()
);

-- ============================================================
-- 12. EMAIL
-- ============================================================

create table email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text,
  oauth_tokens jsonb,
  connected_at timestamptz default now()
);

create table email_events (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  type text,
  occurred_at timestamptz default now()
);

create table email_links (
  id uuid primary key default gen_random_uuid(),
  email_event_id uuid references email_events(id) on delete cascade,
  url text not null,
  label text
);

create table email_link_clicks (
  id uuid primary key default gen_random_uuid(),
  email_link_id uuid references email_links(id) on delete cascade,
  clicked_at timestamptz default now()
);

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text,
  related_lead_id uuid references leads(id) on delete set null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 14. TASKS & NOTES
-- ============================================================

create table tasks (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  assigned_to uuid,
  title text not null,
  due_date date,
  completed boolean default false,
  recurrence_rule text,
  next_occurrence timestamptz,
  created_at timestamptz default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  author_id uuid,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 15. WORKFLOW TEMPLATES & SEQUENCES
-- ============================================================

create table workflow_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  template_definition jsonb not null
);

create table sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  steps jsonb not null
);

create table sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences(id) on delete cascade,
  service_record_id uuid references service_records(id) on delete cascade,
  current_step int default 0,
  status text default 'active',
  enrolled_at timestamptz default now()
);

-- ============================================================
-- 16. APP REQUESTS (Service Tickets)
-- ============================================================

create table app_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null,
  type text,
  priority text default 'medium',
  status text default 'new',
  subject text not null,
  description text,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  company_name text,
  assigned_to uuid,
  source text default 'manual',
  sla_due_at timestamptz,
  sla_breached boolean default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- 17. PROJECTS & PROJECT TASKS
-- ============================================================

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text default 'planning',
  deal_id uuid,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  company_name text,
  start_date date,
  end_date date,
  team_members jsonb default '[]',
  created_at timestamptz default now()
);

create table project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  assigned_to uuid,
  due_date date,
  depends_on jsonb default '[]',
  created_at timestamptz default now()
);

-- ============================================================
-- 18. CONTRACTS & MAINTENANCE
-- ============================================================

create table contracts (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  quotation_id uuid,
  document_id uuid references documents(id) on delete set null,
  start_date date,
  end_date date,
  renewal_alert_days int default 30,
  risk_level text
);

create table maintenance_contracts (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  maintenance_type text,
  frequency text,
  start_date date,
  end_date date
);

create table maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  maintenance_contract_id uuid references maintenance_contracts(id) on delete cascade,
  type text not null,
  status text default 'open',
  description text,
  scheduled_at timestamptz,
  resolved_at timestamptz,
  assigned_technician uuid,
  created_at timestamptz default now()
);

-- ============================================================
-- 19. MEETINGS
-- ============================================================

create table meetings (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  title text not null,
  agenda text,
  notes text,
  scheduled_at timestamptz,
  attendees jsonb
);

-- ============================================================
-- 20. CHATBOT
-- ============================================================

create table chatbot_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_lead_id uuid references leads(id) on delete set null
);

create table chatbot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chatbot_conversations(id) on delete cascade,
  sender text,
  content text,
  sent_at timestamptz default now()
);

-- ============================================================
-- 21. SLA
-- ============================================================

create table sla_policies (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid references service_types(id) on delete cascade,
  name text,
  response_time_minutes int,
  resolution_time_minutes int
);

create table sla_tracking (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  sla_policy_id uuid references sla_policies(id) on delete cascade,
  due_at timestamptz,
  breached boolean default false,
  resolved_at timestamptz
);

-- ============================================================
-- 22. AI RECOMMENDATIONS
-- ============================================================

create table ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete cascade,
  type text,
  content text,
  created_at timestamptz default now()
);

-- ============================================================
-- 23. ROLES & PERMISSIONS
-- ============================================================

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null
);

-- ============================================================
-- 24. AUDIT LOGS
-- ============================================================

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  table_name text not null,
  record_id uuid not null,
  changes jsonb,
  occurred_at timestamptz default now()
);

-- ============================================================
-- 25. DATA SUBJECT REQUESTS (DPA)
-- ============================================================

create table data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  request_type text,
  status text default 'pending',
  requested_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================================
-- 26. MIGRATION LOG
-- ============================================================

create table migration_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  record_type text not null,
  source_record_id text,
  target_record_id uuid,
  status text not null,
  notes text,
  imported_at timestamptz default now()
);

-- ============================================================
-- 27. SAVED REPORTS (Admin Analytics)
-- ============================================================

create table saved_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  report_type text,
  filters jsonb,
  generated_by uuid,
  generated_at timestamptz default now(),
  export_url text
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_service_records_assigned on service_records(assigned_to);
create index idx_service_records_service on service_records(service_id);
create index idx_contacts_company on contacts(company_id);
create index idx_contacts_assigned on contacts(assigned_to);
create index idx_leads_assigned on leads(assigned_to);
create index idx_notifications_user on notifications(user_id);
create index idx_tasks_assigned on tasks(assigned_to);
create index idx_audit_logs_user on audit_logs(user_id);
create index idx_audit_logs_table on audit_logs(table_name);
create index idx_chat_messages_channel on chat_messages(channel_id);
create index idx_form_submissions_form on form_submissions(form_id);
create index idx_app_requests_assigned on app_requests(assigned_to);
create index idx_app_requests_status on app_requests(status);
create index idx_projects_status on projects(status);
create index idx_project_tasks_project on project_tasks(project_id);
create index idx_project_tasks_assigned on project_tasks(assigned_to);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table service_records enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table documents enable row level security;
alter table activities enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table notifications enable row level security;

create policy "employees see own records" on service_records
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "employees see own contacts" on contacts
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "employees see own leads" on leads
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "admins can insert" on user_roles
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- App Requests
alter table app_requests enable row level security;

create policy "employees see own requests" on app_requests
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Projects
alter table projects enable row level security;

create policy "employees see own projects" on projects
  for select using (
    auth.uid() = any(team_members::text[])
    or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Project Tasks
alter table project_tasks enable row level security;

create policy "employees see own project tasks" on project_tasks
  for select using (
    exists (select 1 from projects where id = project_id)
  );
