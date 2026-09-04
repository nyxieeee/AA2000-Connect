# AA2000 Connect — Comprehensive User Stories & Acceptance Criteria

## 1. Persona Directory & Role Profiles

| Persona Code | Role Name | Primary Objective | Key Functional Scope |
|---|---|---|---|
| **CEO** | Chief Executive Officer | Strategic company growth, bottom-line profitability, executive governance | Executive KPIs, High-value approvals, Incentive release signoff, Business intelligence |
| **GM** | General Manager / Sales Manager | Pipeline velocity, quotation margins, sales team enablement, PhilGEPS wins | Kanban pipelines, GM 7-item incentive checklist, Lead assignment routing, Bid approvals |
| **REP** | Sales Representative | Target quota attainment, client relationship nurturing, rapid deal closing | Contact management, Deal tracking, Buying signal analysis, AI recommendations, Incentive filing |
| **FIN** | Finance Officer | Gross margin validation, accounts receivable, compliance, incentive payouts | Financial verification, Official Receipt (OR) audits, Cost-of-goods validation, Commission release |
| **OPS** | Operations & Service Lead | PMS/CMS contract compliance, field installation excellence, SLA delivery | Service tickets (AppRequests), PMS schedules, Project tasks, Technician dispatch |
| **ADM** | System Administrator / Super Admin | Platform security, high uptime, RBAC access governance, audit integrity | User management, Security settings, Integration telemetry, Audit log inspection |
| **CLI** | External Client / Procurement Officer | Procuring reliable security and fire systems, fast response to warranty issues | Web forms, Quotation review, Service inquiries, Chatbot interaction |

---

## 2. Epics Overview

1. **Epic 1: Lead Capture, Ingestion & Algorithmic Scoring (LID)**
2. **Epic 2: Pipeline Management, Opportunity Tracking & Quotations (PIP)**
3. **Epic 3: AI Intelligence, Buying Signals & Automated Outreach (AI-OUT)**
4. **Epic 4: 4-Tier Incentive & Commission Approval Lifecycle (INC)**
5. **Epic 5: Customer Service Desk, SLA & Warranty Ticketing (SRV)**
6. **Epic 6: Project Delivery, Installation Tasks & Gantt Operations (PRJ)**
7. **Epic 7: Preventive & Corrective Maintenance Services (PMS/CMS)**
8. **Epic 8: PhilGEPS Government Bidding & Commercial Tenders (BID)**
9. **Epic 9: Product Catalog, Google Grounding & Engineering Knowledge (CAT)**
10. **Epic 10: Security, Philippine DPA Compliance & RBAC Governance (SEC)**

---

## 3. Detailed User Stories by Epic

### Epic 1: Lead Capture, Ingestion & Algorithmic Scoring (LID)

#### US-LID-01: Auto-Generation of Leads from Public Web Forms
* **Persona**: Sales Representative (REP) / System
* **Priority**: Must Have (P1)
* **Description**: As a Sales Rep, I want website inquiries submitted via dynamic web forms to automatically appear as qualified leads in my inbox, so that I can contact the prospective client within minutes without manual data entry.
* **Acceptance Criteria**:
  * **Given** a prospective customer completes a web form on the corporate website (e.g., "Free CCTV Site Survey"),
  * **When** the form submission payload is recorded by `formsStore`,
  * **Then** a corresponding contact and lead record must be instantiated with status `'New'` and source `'web_form'`,
  * **And** the lead notes must contain all custom input responses formatted cleanly,
  * **And** a visual badge `Lead Auto-Created` must be displayed in the Web Forms admin list.

#### US-LID-02: Algorithmic Dynamic Lead Scoring Engine
* **Persona**: Sales Representative (REP) / Sales Manager (GM)
* **Priority**: Must Have (P1)
* **Description**: As a Sales Rep, I want the CRM to automatically score leads from 0 to 100 based on profile completeness, enterprise tags, and telemetry interactions, so that I can prioritize high-intent buyers.
* **Acceptance Criteria**:
  * **Given** an existing contact in the system,
  * **When** `computeContactScore()` evaluates the contact,
  * **Then** it adds base points (+5 for linked enterprise company, +15 for VIP tag, +10 for Enterprise tag),
  * **And** increments engagement points (+25 for web form submission, +20 for quotation/pricing link clicks, +15 for email replies, +5 per email open),
  * **And** awards buying signal bonuses (+25 for closing signal, +15 for hot signal, +10 for warm signal),
  * **And** outputs a capped score (0–100), letter grade (`A+`, `A`, `B`, `C`, `D`), and heat label (`Hot Lead`, `Warm Prospect`, `Nurturing`, `Cold`).

#### US-LID-03: Rule-Based Lead Assignment Routing
* **Persona**: Sales Manager (GM)
* **Priority**: Should Have (P2)
* **Description**: As a Sales Manager, I want to define automated distribution rules based on geographic territory, product line (CCTV vs. FDAS), and deal size, so that incoming leads are assigned to the most qualified account executive immediately.
* **Acceptance Criteria**:
  * **Given** multiple active sales reps,
  * **When** an incoming lead matches an assignment rule (e.g., "Tag includes FDAS" or "Region is Metro Manila"),
  * **Then** the lead's `assigned_to` field is automatically populated with the designated sales rep,
  * **And** an in-app notification is dispatched to that sales rep.

---

### Epic 2: Pipeline Management, Opportunity Tracking & Quotations (PIP)

#### US-PIP-01: Drag-and-Drop Pipeline Kanban Board
* **Persona**: Sales Representative (REP)
* **Priority**: Must Have (P1)
* **Description**: As a Sales Rep, I want to visually drag and drop deal cards between pipeline stages (Lead In, Qualified, Site Survey, Proposal Sent, Negotiation, Closed Won, Closed Lost), so that I can manage my deal velocity in real time.
* **Acceptance Criteria**:
  * **Given** an active sales pipeline with deal cards,
  * **When** a user drags a deal card from "Site Survey" to "Proposal Sent",
  * **Then** the deal's `stageId` is updated in `pipelinesStore`,
  * **And** an immutable audit record is saved in `stage_history`,
  * **And** total stage monetary values are recalculated instantly in the UI headers.

#### US-PIP-02: Deal Loss Reason Capture & Abandonment Tracking
* **Persona**: Sales Manager (GM)
* **Priority**: Should Have (P2)
* **Description**: As a Sales Manager, I want the system to require a loss reason whenever a deal is marked as Lost or Abandoned, so that our management team can analyze competitive losses and pricing friction.
* **Acceptance Criteria**:
  * **Given** a deal in any active stage,
  * **When** the sales rep changes the status to `'Lost'`,
  * **Then** a modal dialog prompts the user to select or input a `lost_reason` (e.g., "Competitor pricing lower", "Client project cancelled", "BFP specs changed"),
  * **And** the status change cannot be committed without saving this reason.

---

### Epic 3: AI Intelligence, Buying Signals & Automated Outreach (AI-OUT)

#### US-AI-01: Multi-Provider AI Sales Recommendations
* **Persona**: Sales Representative (REP)
* **Priority**: Must Have (P1)
* **Description**: As a Sales Rep, I want the CRM to analyze my active deals, leads, and engagement events with cloud LLMs to generate high-priority next steps and ready-to-send draft messages.
* **Acceptance Criteria**:
  * **Given** the user triggers an AI recommendation scan on `/ai-recommendations`,
  * **When** `scanAndGenerateAIRecommendations` executes,
  * **Then** it queries **Groq (Qwen 2.5 32B)** as primary provider; if Groq fails or is unavailable, it fails over to **Mistral AI**, and if Mistral fails, it fails over to **Google Gemini 2.5 Flash**,
  * **And** returns structured action items with priority (`high`, `medium`, `low`), draft messages, and channel recommendations (Viber, Email, Phone),
  * **And** tags the resulting item with the exact `providerUsed`.

#### US-AI-02: Natural Language Visual Workflow Builder
* **Persona**: Sales Manager (GM) / Admin (ADM)
* **Priority**: Should Have (P2)
* **Description**: As an Automation Manager, I want to type a plain English workflow prompt (e.g., "When a quote link is clicked, wait 2 hours, then send a follow-up email and alert the rep") and have the system generate an executable visual node graph.
* **Acceptance Criteria**:
  * **Given** the user is on `/workflows` in the Workflow Builder,
  * **When** the user enters an automation description into the AI prompt bar,
  * **Then** `aiWorkflowBuilder.ts` contacts the fallback LLM pipeline or local regex engine to compile React Flow nodes and edges,
  * **And** renders connected Trigger, Action, Delay, and Condition cards on the canvas ready for testing.

---

### Epic 4: 4-Tier Incentive & Commission Approval Lifecycle (INC)

#### US-INC-01: Incentive Payout Request Submission
* **Persona**: Sales Representative (REP)
* **Priority**: Must Have (P1)
* **Description**: As a Sales Rep who just won a major deal, I want to submit an incentive request calculated from the final Gross Profit (GP), so that I can receive my sales commission.
* **Acceptance Criteria**:
  * **Given** a deal with status `'Won'` and total contract value,
  * **When** the sales rep fills out the incentive form on `/incentives`,
  * **Then** the formula computes Gross Profit = Total Contract Revenue - Equipment/Subcontractor BOM cost,
  * **And** calculates the allowable incentive according to AA2000 GP tier slabs,
  * **And** sets initial request status to `'submitted'`.

#### US-INC-02: General Manager 7-Point Compliance Review
* **Persona**: General Manager / Sales Manager (GM)
* **Priority**: Must Have (P1)
* **Description**: As General Manager, I want to evaluate submitted incentive claims against a strict 7-point operational checklist before endorsing the request to Finance.
* **Acceptance Criteria**:
  * **Given** an incentive request in status `'submitted'`,
  * **When** the GM navigates to `/incentives/approvals`,
  * **Then** the GM must explicitly verify each of the 7 checklist items:
    1. Signed Client Contract / Purchase Order on file
    2. 100% Full Collection or Down Payment terms verified
    3. Delivery Receipt (DR) signed without pending items
    4. Equipment Warranty Certificate issued to client
    5. Technical Sign-off / Certificate of Completion signed
    6. Official Receipt (OR) issued by AA2000 Treasury
    7. Account Clearance Form completed
  * **When** all 7 items are checked and GM clicks "Endorse to Finance",
  * **Then** the status transitions to `'gm_approved'`.

#### US-INC-03: Finance Verification & CEO Final Release
* **Persona**: Finance Officer (FIN) / Chief Executive Officer (CEO)
* **Priority**: Must Have (P1)
* **Description**: As Finance Officer and CEO, we want dual-custody verification of funds received and margin accuracy prior to releasing commission disbursements.
* **Acceptance Criteria**:
  * **Given** an incentive request with status `'gm_approved'`,
  * **When** the Finance Officer checks bank collection deposits and validates cost sheets,
  * **Then** Finance enters remarks and marks it `'finance_verified'`,
  * **When** the request reaches the CEO at `/incentives/executive`,
  * **Then** the CEO can provide executive signoff transitioning the claim to `'ceo_approved'` and `'released'`, or reject it back to the sales rep with notes.

---

### Epic 5: Customer Service Desk, SLA & Warranty Ticketing (SRV)

#### US-SRV-01: Service Ticket Creation & Priority Triaging
* **Persona**: Operations Lead (OPS) / Sales Rep (REP)
* **Priority**: Must Have (P1)
* **Description**: As an Operations Lead, I want incoming technical issues, warranty claims, and repairs to be logged with an automatic request number and SLA deadline, so that our field engineers resolve client problems within contractual commitments.
* **Acceptance Criteria**:
  * **Given** a customer reports a malfunctioning CCTV camera or FDAS control panel,
  * **When** a new ticket is logged in `requestsStore`,
  * **Then** a sequential identifier is generated (e.g. `REQ-2026-0042`),
  * **And** the SLA countdown timer is set based on priority (`urgent`: 2 hours, `high`: 4 hours, `medium`: 24 hours, `low`: 48 hours),
  * **And** the ticket appears in the Kanban/List view under `/requests`.

#### US-SRV-02: SLA Breach Detection & Escalation
* **Persona**: Operations Lead (OPS) / General Manager (GM)
* **Priority**: Must Have (P1)
* **Description**: As Operations Lead, I want the system to flag breached SLA tickets in bright red and alert management, so that emergency technician dispatches can be scheduled immediately.
* **Acceptance Criteria**:
  * **Given** an open ticket with an active `sla_due_at` timestamp,
  * **When** current time exceeds `sla_due_at` and `status !== 'resolved'`,
  * **Then** `sla_breached` is flagged as `true`,
  * **And** the ticket card flashes a prominent breach alert banner in the UI,
  * **And** an urgent notification is broadcast to the General Manager.

---

### Epic 6: Project Delivery, Installation Tasks & Gantt Operations (PRJ)

#### US-PRJ-01: Project Kanban & Dependency Management
* **Persona**: Operations Lead (OPS) / Field Technician
* **Priority**: Must Have (P1)
* **Description**: As a Field Systems Engineer, I want to track physical installation phases (Conduit Roughing-In, Wire Pulling, Device Termination, Commissioning, BFP Inspection) with subtask dependencies, so that projects are handed over on schedule.
* **Acceptance Criteria**:
  * **Given** an active installation project on `/projects`,
  * **When** a field supervisor creates tasks with `depends_on` relationships,
  * **Then** downstream tasks remain locked until predecessor tasks transition to `'done'`,
  * **And** the project progress percentage dynamically reflects completed tasks.

---

### Epic 7: Preventive & Corrective Maintenance Services (PMS/CMS)

#### US-PMS-01: Recurring Maintenance Schedule Generation
* **Persona**: Operations Lead (OPS) / Customer
* **Priority**: Should Have (P2)
* **Description**: As an Account Manager, I want client annual maintenance contracts (AMC) to auto-generate quarterly inspection tickets 14 days in advance, so that technician site visits are booked proactively.
* **Acceptance Criteria**:
  * **Given** an active PMS contract in `contractsStore`,
  * **When** the scheduled quarter approaches,
  * **Then** a new maintenance ticket of type `'Preventive'` is created in `maintenance_tickets`,
  * **And** the customer and assigned technician receive automated calendar invites.

---

### Epic 8: PhilGEPS Government Bidding & Commercial Tenders (BID)

#### US-BID-01: PhilGEPS Tender Compliance Tracking
* **Persona**: Sales Manager (GM) / Sales Rep (REP)
* **Priority**: Must Have (P1)
* **Description**: As a Bidding Specialist, I want to manage government procurement tenders (RA 9184 compliance) with document checklists and ABC vs. Bid price tracking, so that no bid is disqualified due to missing paperwork.
* **Acceptance Criteria**:
  * **Given** a published PhilGEPS bid on `/bidding`,
  * **When** the user tracks the bid,
  * **Then** the system tracks Approved Budget for the Contract (ABC) and submitted Bid Amount,
  * **And** provides an interactive checklist of statutory eligibility documents (PhilGEPS Platinum Certificate, PCAB license, NFCC calculation, Bid Securing Declaration, Omnibus Sworn Statement),
  * **And** prevents marking status as "Submitted" if mandatory eligibility docs are unverified.

---

### Epic 9: Product Catalog, Google Grounding & Engineering Knowledge (CAT)

#### US-CAT-01: Live Web-Grounded Specification Search
* **Persona**: Sales Rep (REP) / Systems Estimator
* **Priority**: Should Have (P2)
* **Description**: As a Systems Estimator, I want to search hardware specifications and engineering pinouts with live Google Web Grounding directly in the app, so that I can quote accurate camera lux ratings and panel amp draws without leaving the CRM.
* **Acceptance Criteria**:
  * **Given** the user is on `/product-search` or `/knowledge-base`,
  * **When** the user toggles to the "Google Grounding" tab and queries a model number (e.g. "Hikvision DS-2CD2387G2-L specs"),
  * **Then** the Gemini grounding engine executes live web queries,
  * **And** parses datasheet parameters and clickable citation links with source URLs in a side panel.

---

### Epic 10: Security, Philippine DPA Compliance & RBAC Governance (SEC)

#### US-SEC-01: Role-Based Access Control (RBAC) & View Gating
* **Persona**: Super Admin (ADM)
* **Priority**: Must Have (P1)
* **Description**: As Super Admin, I want strict role-based gating on navigation menus and page routes, so that junior sales reps cannot access executive financial reports or system branding.
* **Acceptance Criteria**:
  * **Given** a user authenticated as `sales_rep`,
  * **When** they view the sidebar,
  * **Then** Admin Panel, Activity History, and Executive Review menus are completely hidden,
  * **When** they attempt to navigate directly to `/admin` or `/incentives/executive`,
  * **Then** `ProtectedRoute` intercepts the request and redirects them to `/dashboard`.

#### US-SEC-02: Republic Act 10173 (Philippine Data Privacy Act) Compliance
* **Persona**: Data Protection Officer / Super Admin (ADM)
* **Priority**: Must Have (P1)
* **Description**: As the DPO, I want to track contact consent and process Data Subject Requests (Right to Erasure / Right to Access), so that AA2000 operates in strict compliance with the National Privacy Commission (NPC).
* **Acceptance Criteria**:
  * **Given** a contact profile in `contacts`,
  * **When** a contact exercises their Right to be Forgotten,
  * **Then** a `data_subject_requests` ticket is generated with status `'pending'`,
  * **And** upon approval, personal identification data (name, email, phone) is permanently anonymized in compliance with statutory audit retention periods.
