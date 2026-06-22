# AA2000 Connect — Master Blueprint v4 (Full Rework Parity)

Ground-up rebuild targeting full feature parity with Rework's platform, scoped for a 4-6 person team working in parallel tracks. Supersedes v3 — adds the non-sales ops modules (workflow/BPM, documents, approvals, internal chat, web forms builder) on top of the Service-model CRM core.

---

## 1. Module groups

**A. Sales & CRM** — Service model, Pipeline/Kanban, Contacts/Companies, Lead Management, AI research/drafting agents, email tracking, activity insights, KPI integration
**B. Operations** — Business Process Management (multi-step approval/process engine), Workflow Automation, Document Management
**C. Collaboration** — Internal Chat, Web Forms Builder

All three groups read/write through the same core `services` / `service_records` model from v3 — a chat channel, a document, a form, and a process instance are all just different `service_record` types or closely-linked tables referencing it.

## 2. Core data model (recap from v3, unchanged)

```sql
create table service_types (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  field_schema jsonb not null
);

create table services (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid references service_types(id),
  name text not null,
  config jsonb default '{}',
  created_at timestamptz default now()
);

create table service_records (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id),
  fields jsonb not null default '{}',
  status text,
  assigned_to uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

(Leads, contacts, companies, assignment rules, company research, email events, activities, AI recommendations — all unchanged from v3, see that file for full SQL.)

## 3. New: Business Process Management (BPM)

Distinct from simple workflow triggers — this models multi-step, possibly multi-approver processes (e.g. "new client onboarding," "contract approval").

```sql
create table process_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  steps jsonb not null,            -- ordered array of {label, type, approver_role}
  service_type_id uuid references service_types(id)
);

create table process_instances (
  id uuid primary key default gen_random_uuid(),
  process_definition_id uuid references process_definitions(id),
  service_record_id uuid references service_records(id),
  current_step int default 0,
  status text default 'in_progress', -- in_progress | completed | rejected
  started_at timestamptz default now()
);
```

## 4. New: Approval Flow Management

```sql
create table approval_requests (
  id uuid primary key default gen_random_uuid(),
  process_instance_id uuid references process_instances(id),
  requested_by uuid,
  approver_id uuid,
  status text default 'pending', -- pending | approved | rejected
  comment text,
  requested_at timestamptz default now(),
  resolved_at timestamptz
);
```

## 5. New: Document Management

Files stored in Supabase Storage; metadata tracked relationally so documents attach to any service_record (a lead, a project, an approval).

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  file_name text not null,
  storage_path text not null,      -- Supabase Storage path
  uploaded_by uuid,
  uploaded_at timestamptz default now()
);
```

## 6. New: Web Forms Builder

```sql
create table form_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  field_schema jsonb not null,
  target_service_type_id uuid references service_types(id),
  created_at timestamptz default now()
);

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references form_definitions(id),
  data jsonb not null,
  created_service_record_id uuid references service_records(id),
  submitted_at timestamptz default now()
);
```
Submissions auto-create a `service_record` of the form's target type — this is what replaces the current Pipedream-only intake path for new forms going forward.

## 7. New: Internal Chat

```sql
create table chat_channels (
  id uuid primary key default gen_random_uuid(),
  name text,
  is_dm boolean default false,
  service_record_id uuid references service_records(id), -- optional: channel tied to a deal/project
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references chat_channels(id),
  sender_id uuid not null,
  content text not null,
  sent_at timestamptz default now()
);
```
Built on Supabase Realtime — no separate websocket infra needed.

## 8. New capabilities (from Rework demo transcript)

**Multi-channel lead intake.** Rework pulls leads from Facebook, email, website, and Messenger automatically. You already have the pattern for this — each channel is just another Pipedream source normalizing into `leads`/`service_records` with a different `source` value:
- Website forms — existing (`form_submissions` → `service_records`)
- Facebook Lead Ads — new Pipedream step using FB Lead Ads API
- Email — Gmail API parsing for inbound inquiry emails
- Messenger — Meta Messenger webhook

**Org chart / department mapping.** Shows who reports to whom inside a client company and which department each contact sits in:
```sql
create table contact_relationships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  contact_id uuid references contacts(id),
  reports_to_contact_id uuid references contacts(id),
  department text,
  title text
);
```
Powers an org chart view on the company detail page.

**AI chatbot (lead capture).** Embeddable widget on aa2000ph.com / NexTech sites; runs on Claude API, auto-creates a lead the moment contact info surfaces mid-conversation.
```sql
create table chatbot_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_lead_id uuid references leads(id)
);

create table chatbot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chatbot_conversations(id),
  sender text, -- 'visitor' | 'bot'
  content text,
  sent_at timestamptz default now()
);
```

**Email sending integration (not just tracking).** Reps connect their own Gmail/Outlook via OAuth; emails sent through Connect's UI go out as them, but every send/open/click gets tracked automatically — this is what makes the "opened your quotation 5 times vs once" signal possible.
```sql
create table email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text, -- 'gmail' | 'outlook'
  oauth_tokens jsonb, -- encrypted
  connected_at timestamptz default now()
);
```

**Link-level click tracking.** Extends v3's `email_events` — each email can carry multiple tracked links, and every click is logged individually so a rep can tell which specific link (quotation vs case study vs pricing page) got the attention:
```sql
create table email_links (
  id uuid primary key default gen_random_uuid(),
  email_event_id uuid references email_events(id),
  url text not null,
  label text
);

create table email_link_clicks (
  id uuid primary key default gen_random_uuid(),
  email_link_id uuid references email_links(id),
  clicked_at timestamptz default now()
);
```

**Push notifications.** Fire the moment a tracked event happens (open, click, re-engagement after silence) — this is what gets reps checking the app daily instead of guessing:
```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text, -- 'email_opened' | 'link_clicked' | 'lead_reengaged'
  related_lead_id uuid references leads(id),
  read boolean default false,
  created_at timestamptz default now()
);
```

**Tasks & notes (replaces the Google Sheet habit).** Notes are exactly what the v3 drafting agent reads when a lead goes quiet — same `ai_recommendations` flow, just with `notes` added as an input source alongside activities and research.
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  assigned_to uuid,
  title text not null,
  due_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  author_id uuid,
  content text not null,
  created_at timestamptz default now()
);
```

**Ad-level attribution.** A lead isn't just "from Facebook" — it's from a specific ad creative/angle, telling the rep what hook already worked before they ever call:
```sql
alter table leads add column ad_campaign text;
alter table leads add column ad_creative text;
```

**Structured company research.** Refines v3's `company_research` from a plain text blob into a structured assessment — adjusted for AA2000's actual business (FDAS/CCTV/life-safety hardware, not software), so "competing system" means existing installed security/fire equipment, not a rival CRM:
```sql
alter table company_research add column tier text; -- 'high' | 'mid' | 'low'
alter table company_research add column is_decision_maker boolean;
alter table company_research add column existing_security_vendor text; -- current FDAS/CCTV brand/provider, if discoverable
alter table company_research add column existing_system_age_estimate text; -- 'new' | 'aging' | 'unknown' — older systems = upgrade opportunity
alter table company_research add column compliance_gap_notes text; -- e.g. Fire Code gaps that create urgency
alter table company_research add column outreach_angles jsonb; -- array of suggested angles
```

**Multiple reps per account + last-activity rollup.** A large account (their Makati Medical Center example — C-level contact handled by one rep, lower-level by another) needs more than one assigned rep, and every contact needs an at-a-glance "when did we last touch them":
```sql
create table account_team_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  user_id uuid not null,
  role text -- 'primary' | 'c_level_contact' | 'support'
);

alter table activities add column contact_id uuid references contacts(id);
-- last activity per contact/type = max(occurred_at) grouped by contact_id, type — a view, not a new table
```

**Account-level insight rollups.** "How many people at Jollibee are talking to us right now" and "who's our most-engaged account" are aggregate queries over `leads`/`contacts` grouped by `company_id` — feeds the same Activity & Insights dashboard, no new tables needed.

**Pipeline stage definitions.** Each pipeline `service` defines its own ordered stages in `config` — different departments can have entirely different stage flows without sharing a schema:
```sql
-- services.config (jsonb) for a pipeline-type service, e.g.:
-- { "stages": [
--     {"key": "new", "label": "New", "order": 1},
--     {"key": "contacted", "label": "Contacted", "order": 2},
--     {"key": "qualified", "label": "Qualified", "order": 3},
--     {"key": "proposal", "label": "Proposal", "order": 4},
--     {"key": "negotiation", "label": "Negotiation", "order": 5}
-- ] }
```
`service_records.status` holds the current stage key. The Kanban board reads/writes against this — UI doesn't change, only the data underneath it.

**Stage history.** Needed for "how long do deals sit in Negotiation" and "where do deals stall" analytics — nothing today logs *when* a stage change happened:
```sql
create table stage_history (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  from_stage text,
  to_stage text,
  changed_by uuid,
  changed_at timestamptz default now()
);
```

**Won/Lost as explicit actions, not Kanban columns.** A deal card gets two buttons — **Mark as Won** and **Mark as Lost** — sitting outside the drag-and-drop stage flow. Marking Lost prompts for a reason, which is what makes loss-reason reporting possible:
```sql
alter table service_records add column won_lost_status text; -- 'won' | 'lost' | null
alter table service_records add column lost_reason text; -- 'price' | 'went_with_competitor' | 'no_budget' | 'went_silent' | 'other'
alter table service_records add column closed_at timestamptz;
```

**No-code data builder (Datasets equivalent).** Lets non-technical staff create their own custom tracking structures (e.g. "Equipment Inventory," "Vendor List") without needing a developer — reuses the same Service model instead of building a separate system:
```sql
alter table service_types add column category text default 'process'; -- 'process' (CRM/pipeline/workflow) | 'dataset' (plain reference data)
```
Admins build a new `service_type` with `category = 'dataset'` through a UI form (no SQL involved), define its fields, and `service_records` holds the rows — same engine, just a friendlier on-ramp for non-engineers.

**Recurring tasks.**
```sql
alter table tasks add column recurrence_rule text; -- 'daily' | 'weekly' | 'monthly'
alter table tasks add column next_occurrence timestamptz;
```
A scheduled job (Supabase Edge Function or Pipedream cron) checks `next_occurrence` and spawns the next task automatically.

**SLA tracking.** Flags when a lead or task is taking too long to get a response — e.g. "first contact within 30 minutes":
```sql
create table sla_policies (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid references service_types(id),
  name text,
  response_time_minutes int,
  resolution_time_minutes int
);

create table sla_tracking (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  sla_policy_id uuid references sla_policies(id),
  due_at timestamptz,
  breached boolean default false,
  resolved_at timestamptz
);
```
Ties into the notifications table from earlier — a breach fires a notification to the rep and their supervisor.

**AI Agent Flows (natural-language workflow builder).** Instead of manually configuring trigger/condition/action rules, a rep describes the automation in plain English and an AI call translates it into a workflow definition — plus a library of pre-built templates to start from instead of building everything from zero:
```sql
alter table process_definitions add column source_prompt text; -- the natural-language description that generated this flow, if any

create table workflow_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  template_definition jsonb not null -- pre-filled steps a user can clone and tweak
);
```

**Automated follow-up sequences.** Distinct from the one-off AI drafting agent — this is the structured, multi-step drip campaign your team already does manually today (the "follow-up stops when they click" pattern), now with explicit steps and stop conditions:
```sql
create table sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  steps jsonb not null -- ordered array of {delay_days, channel, message_template}
);

create table sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences(id),
  service_record_id uuid references service_records(id),
  current_step int default 0,
  status text default 'active', -- active | paused | completed | stopped
  enrolled_at timestamptz default now()
);
```

**Product & Contract Lifecycle — integrated with the existing in-house quotation app.** Since the quotation app lives in the same Supabase project, no API/webhook layer is needed — just a direct foreign key. Drop the standalone `products` table from earlier; the quotation app already owns product/pricing data, so Connect should reference it rather than duplicate it.

**Assumption flagged:** exact table/column names in the quotation app weren't confirmed, so this assumes a standard shape (`quotations` + `quotation_items`). Swap in the real names once confirmed — likely a 10-minute fix, not a redesign, since it's just a foreign key target.

```sql
-- Assumed existing quotation app tables (confirm actual names):
-- quotations (id, client_name, company_name, total_amount, status, valid_until, created_at)
-- quotation_items (id, quotation_id, product_name, quantity, unit_price)

-- The only new thing needed: link a deal directly to its quotation(s)
alter table service_records add column quotation_id uuid; -- references quotations(id) once table name is confirmed

create table contracts (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  quotation_id uuid, -- the accepted quote that led to this contract
  document_id uuid references documents(id),
  start_date date,
  end_date date,
  renewal_alert_days int default 30,
  risk_level text -- 'low' | 'medium' | 'high'
);
```
Optional next step once a deal reaches the "Proposal" stage: a trigger that auto-creates a draft row in the quotation app's own table, pre-filled with the contact/company info already in Connect — saves the rep from re-typing client details into a second system.

**Meeting management.** Agendas, notes, and attendees tied directly to the deal or project they belong to:
```sql
create table meetings (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id),
  title text not null,
  agenda text,
  notes text,
  scheduled_at timestamptz,
  attendees jsonb
);
```

**Out of scope: HRIS.** Leave/time-off, employee self-service, and labor-law compliance are confirmed out of scope — AA2000 already handles HR separately. Sales performance tracking (a Rework "core feature" that sounds HR-adjacent) is unaffected, since that's covered by the existing Sales Performance Dashboard module, not HRIS.

**Platform notes (not modeled, just flagged):** Rework supports 270+ third-party integrations and ships native iOS/Android apps; ours doesn't need SOC 2 / GDPR-style certification since Connect is internal-only, but the native-app-vs-web-push decision for notifications (raised earlier) is still open.

## 9. AI Agents reference

Four distinct agents, each with a specific job — not one generic "AI" handling everything. The first two are one-shot (fire once, produce structured output, done); the last two need ongoing context and tighter behavioral guardrails since they're making judgment calls or talking to external people directly.

| Agent | Trigger | Input | Job | Output |
|---|---|---|---|---|
| **Research Agent** | New lead/company created | Company name/website | Web research → tier, decision-maker flag, existing security vendor/system age, compliance gaps, outreach angles | Writes to `company_research` |
| **Workflow Builder Agent** | Rep types a plain-English automation request | Natural-language prompt | Translates intent into a structured trigger/condition/action definition | Draft `process_definitions` entry — **requires human approval before activation** |
| **Sales Assistant Agent** | On-demand ("what's next?") or automatic (lead gone cold, SLA about to breach) | Activities, notes, company research, email engagement history | Synthesizes everything → recommends next action, drafts the message | Writes to `ai_recommendations` |
| **Chatbot Agent** | Website visitor opens chat widget | Visitor conversation | Conversational qualification, captures contact info, hands off to a human when out of its depth | Creates `chatbot_conversations` + a `leads` record |

**Guardrail note:** the Chatbot Agent talks to strangers in real time and should never improvise pricing, commitments, or anything not explicitly fed to it. The Workflow Builder Agent should never auto-activate a flow without a human reviewing and approving it first.

### Model & provider selection (cost-optimized hybrid)

| Agent | Model | Provider | Rationale |
|---|---|---|---|
| Chatbot Agent | Free tier (bounded/FAQ replies) | Google Gemini | Free, rate-limited — fine since scope is intentionally narrow and guardrailed |
| Workflow Builder Agent | Free tier | Google Gemini | Structured output task; a human reviews every flow before activation anyway |
| Research Agent | Claude Sonnet 4.6 | Anthropic | Needs real reasoning + web search tool use; runs async, so cost matters more than latency |
| Sales Assistant Agent | Claude Sonnet 4.6 (Opus optional, top accounts only) | Anthropic | Output is client-facing and directly revenue-affecting — the one place quality is worth paying for |

**Why this split:** the two low-stakes, bounded tasks run on Google's free tier — real savings, acceptable risk since output is either reviewed by a human (Workflow Builder) or scope-limited (Chatbot FAQ replies). The two tasks where output quality directly touches revenue (researching a real prospect, drafting a real client message) run on paid Claude, where the cost is genuinely small for AA2000's expected volume — likely tens of dollars a month, far below the ₱225,000 Rework quote this whole project is replacing.

**Avoid:** unofficial reverse-proxy tricks to get paid models for free. Acceptable risk for a personal coding tool; not acceptable for a live system handling real client conversations and data — an outage or ToS issue mid-conversation with a prospect is a worse outcome than the small Claude API bill it's avoiding.

## 10. Roles & permissions

Two roles only — **Admin** and **Employee**. No Supervisor tier.

- **Employee (sales rep):** sees and works only their own assigned leads, deals, and activities.
- **Admin:** full bird's-eye visibility across the entire system — every lead, every deal, every rep's activity — plus the ability to generate cross-team performance reports for sharing with business partners.

```sql
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null -- 'admin' | 'employee'
);
```

Enforced directly in Supabase via row-level security, not just hidden in the frontend:
```sql
alter table leads enable row level security;

create policy "employees see own leads" on leads
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );
```
Same pattern applies to `service_records`, `activities`, and `documents`.

**Admin analytics & partner reporting.** Beyond just seeing everything, Admin needs to package it for outside audiences — who's actively using the app, how many leads each rep has contacted, conversion rates by rep/source — exportable for business partners:
```sql
create table saved_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  report_type text, -- 'team_performance' | 'lead_volume' | 'conversion_rate' | 'app_usage'
  filters jsonb,
  generated_by uuid,
  generated_at timestamptz default now(),
  export_url text -- generated PDF/CSV
);
```

## 11. Audit logs & data privacy (Philippine DPA)

**Audit log.** Tracks who changed what, system-wide — who marked a deal Lost, who approved a contract, who edited a contact:
```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null, -- 'created' | 'updated' | 'deleted' | 'approved' | 'marked_lost'
  table_name text not null,
  record_id uuid not null,
  changes jsonb,
  occurred_at timestamptz default now()
);
```

**Philippine Data Privacy Act basics.** Connect stores real client PII, so a few fields plus a request-handling table cover the essentials:
```sql
alter table contacts add column consent_given boolean default false;
alter table contacts add column data_retention_until date;

create table data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  request_type text, -- 'access' | 'deletion' | 'correction'
  status text default 'pending',
  requested_at timestamptz default now(),
  resolved_at timestamptz
);
```
Gives a documented, auditable answer if a client or regulator ever asks "what data do you have on me, and can you delete it."

## 12. Data migration plan

Two sources need a one-time import: the existing spreadsheet(s) and Ally Virtual PH's contact data.

```sql
create table migration_log (
  id uuid primary key default gen_random_uuid(),
  source text not null, -- 'spreadsheet' | 'ally_virtual_ph'
  record_type text not null, -- 'contact' | 'company' | 'lead'
  source_record_id text,
  target_record_id uuid,
  status text not null, -- 'imported' | 'skipped_duplicate' | 'error'
  notes text,
  imported_at timestamptz default now()
);
```

**Process:**
1. Export the spreadsheet(s) to CSV, map columns to `contacts`/`companies`/`leads`.
2. Pull Ally Virtual PH's contact data via export or API.
3. Run both through the existing auto-join logic (email domain match) so duplicates between the two sources — and against each other — get caught automatically instead of creating messy duplicate company records.
4. Every row gets logged in `migration_log`, so if something looks wrong post-migration, there's a record of exactly where it came from and what happened to it.

## 13. Post-sale support & maintenance

AA2000 does post-sale implementation and ongoing maintenance — both preventive and corrective — which needs its own module tied back to the original deal/contract.

```sql
create table maintenance_contracts (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id), -- the original deal
  contract_id uuid references contracts(id),
  maintenance_type text, -- 'preventive' | 'corrective' | 'both'
  frequency text, -- e.g. 'monthly', 'quarterly' — for preventive scheduling
  start_date date,
  end_date date
);

create table maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  maintenance_contract_id uuid references maintenance_contracts(id),
  type text not null, -- 'preventive' | 'corrective'
  status text default 'open', -- open | scheduled | in_progress | resolved | closed
  description text,
  scheduled_at timestamptz,
  resolved_at timestamptz,
  assigned_technician uuid,
  created_at timestamptz default now()
);
```
Preventive tickets auto-generate on schedule (same recurrence pattern as recurring tasks); corrective tickets get created reactively when a client reports an issue.

## 14. Launch readiness

The biggest risk to this project isn't technical — it's a perfect system nobody actually uses because the sales team keeps reaching for Google Sheets out of habit. Three things to plan for explicitly:

- **Staging environment & testing.** A separate Supabase project/environment for the team to build and test against before anything touches real client data.
- **Phased training, not a single rollout.** Train the sales team module-by-module as each phase ships (Phase 1 training when CRM core lands, Phase 3 training when AI features land), rather than one overwhelming handoff at the end.
- **A feedback loop during pilot.** Run a 1-2 week pilot with a small group of reps before full rollout, specifically to catch "this doesn't match how we actually work" issues while they're still cheap to fix.

## 15. Team workstreams (4-6 people)

| Track | Owns | Headcount |
|---|---|---|
| Platform core | Auth, roles/permissions, audit logs, dashboard shells, `services`/`service_records`, dark mode | 1 |
| Sales & CRM | Pipeline/Kanban, Contacts/Companies, Leads, assignment rules, multi-channel intake, org chart mapping, data migration | 1-2 |
| AI Intelligence | Research agent, drafting agent, email tracking, chatbot | 1 |
| Ops (BPM/Docs/Maintenance) | Process engine, approvals, document management, post-sale maintenance tickets | 1 |
| Collaboration | Internal chat, web forms builder, admin analytics/reporting | 1 (can overlap with Ops track if team is 4) |

With 5-6 people, Sales & CRM and AI Intelligence can run as fully separate people instead of doubling up.

## 16. Project structure

```
src/
  auth/
  context/DarkModeContext.tsx
  layouts/
    AdminDashboardLayout/      (full visibility + cross-team analytics)
    EmployeeDashboardLayout/   (own leads/deals only)
  modules/
    services/            (generic Service/ServiceRecord primitives)
    contacts/
    companies/
    leads/
    workflows/
    bpm/                 (process definitions, approvals)
    documents/
    forms/               (web forms builder + renderer)
    chat/
    ai-insights/
    activity/
    kpi/
    maintenance/         (preventive & corrective maintenance tickets)
    admin-analytics/     (cross-team performance reports, partner-facing exports)
  lib/
    supabase/
    migration/            (one-time import scripts: spreadsheet, Ally Virtual PH)
```

## 17. Phased roadmap (parallel tracks)

| Phase | Platform core | Sales & CRM | AI Intelligence | Ops | Collaboration |
|---|---|---|---|---|---|
| 0 | Auth, roles/permissions, audit logs, dashboards, dark mode | — | — | — | — |
| 1 | `service_types`/`services`/`service_records` | Pipeline/Kanban on Service model | — | — | — |
| 2 | — | Contacts/Companies + auto-join + org chart mapping | — | Document management | Web forms builder |
| 3 | — | Lead Management + assignment rules + multi-channel intake | Research agent | BPM process engine | — |
| 4 | — | — | Drafting agent + email tracking + chatbot | Approval flows | Internal chat |
| 5 | — | Activity insights + data migration (spreadsheet, Ally Virtual PH) | — | Post-sale maintenance module | Admin analytics & partner reporting |
| 6 | — | KPI app integration | — | — | — |
| 7 | Launch readiness: staging environment, phased training, pilot feedback loop | — | — | — | — |

Tracks 2-4 of each row run **in parallel** once Phase 0/1 platform foundation is merged — that's the whole point of having a team instead of one person going phase by phase.

---

*Supersedes v3. Adds BPM, approvals, document management, internal chat, web forms builder, roles/permissions, audit logs/DPA compliance, data migration, post-sale maintenance, and launch readiness for full Rework feature parity plus AA2000-specific operational needs.*
