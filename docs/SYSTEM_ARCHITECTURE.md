# AA2000 Connect — System Architecture Blueprint

## 1. Architectural Principles & System Goals

**AA2000 Connect (CRM)** is designed as an enterprise-grade, high-performance Business Operating System (BOS) tailored for commercial security, fire safety, and systems integration in the Philippines.

### Core Architecture Tenets
1. **Local-First, Zero-Latency Runtime**: The application operates with instant responsiveness using Zustand state stores synchronized to isolated local storage namespaces (`aa2000_*`), ensuring uninterrupted sales operations even during internet disconnections on job sites.
2. **Seamless Backend Transition**: A fully typed Supabase API layer (`src/services/supabaseService.ts`) mirroring 44 relational database tables allows straightforward cutover from browser persistence to enterprise PostgreSQL with Row-Level Security (RLS).
3. **Resilient Multi-Cloud AI Cascade**: Natural language parsing, next-best-action recommendations, and buying signal analysis are powered by a three-tiered fallback cloud AI pipeline (Groq $\rightarrow$ Mistral $\rightarrow$ Google Gemini $\rightarrow$ Local Heuristic Engine).
4. **Strict Role-Based Governance (RBAC)**: Enterprise separation of duties is enforced across 7 distinct roles, securing financial margins, audit histories, executive incentive releases, and IT credentials.
5. **Philippine Regulatory Compliance**: Native adherence to Republic Act 10173 (Data Privacy Act of 2012), Bureau of Fire Protection (BFP) standard codes, and Republic Act 9184 (Government Procurement Reform Act for PhilGEPS bidding).

---

## 2. High-Level Layered Architecture

```mermaid
flowchart TB
    %% Layer 1: Client Presentation
    subgraph L1["1. PRESENTATION & INTERACTION LAYER"]
        UI_SHELL["AppShell Layout (Fixed w-64 Sidebar, Top Navbar)"]
        UI_ROUTES["React Router 7 (60+ Routes across 47 Directories)"]
        UI_MOTION["Framer Motion 12 Micro-interactions & Transitions"]
        UI_FLOW["@xyflow/react Automation Visual Builder"]
        UI_DND["@dnd-kit Drag-and-Drop Pipeline Kanban"]
        UI_CHARTS["Recharts Sales Velocity & Margin Analytics"]
        UI_THEME["Tailwind CSS 3 + Modern Enterprise Tokens"]
    end

    %% Layer 2: State Management
    subgraph L2["2. STATE MANAGEMENT & DOMAIN STORES (Zustand 5)"]
        AUTH_STORE["Global: authStore (Session, 7 Roles)"]
        SIDEBAR_STORE["Global: sidebarStore (State Persistence)"]
        CRM_STORES["Core: crmStore, pipelinesStore, leadsStore"]
        OPS_STORES["Ops: requestsStore, tasksStore, projectsStore, contractsStore"]
        INTEL_STORES["Intel: aiRecommendationsStore, kpiStore, engagementStore"]
        GOV_STORES["Gov: incentivesStore, biddingStore, auditLogStore, policyCenterStore"]
    end

    %% Layer 3: Services & Engines
    subgraph L3["3. APPLICATION SERVICES & LOGIC ENGINES"]
        SCORING_ENG["Dynamic Lead Scoring Engine (leadScoring.ts)"]
        AI_REC_ENG["Multi-Provider AI Engine (aiRecommendationEngine.ts)"]
        AI_FLOW_BLD["NLP Workflow Compiler (aiWorkflowBuilder.ts)"]
        STORAGE_SVC["localStorage Gateway (aa2000_ namespace)"]
        SUPA_SVC["Typed Supabase Service Layer (25+ Modules)"]
    end

    %% Layer 4: External Gateways & Fallback AI Cluster
    subgraph L4["4. EXTERNAL GATEWAYS & AI FAILOVER PIPELINE"]
        GROQ["Primary: Groq Cloud (Qwen 2.5 32B / Llama 3.1 8B)"]
        MISTRAL["Secondary: Mistral AI (mistral-small-latest)"]
        GEMINI["Tertiary: Google Gemini (gemini-2.5-flash)"]
        COMMS_GW["Omnichannel Gateways (Viber, WhatsApp, SMTP, Twilio)"]
    end

    %% Layer 5: Cloud Backend
    subgraph L5["5. PERSISTENCE & CLOUD BACKEND (Supabase PostgreSQL)"]
        PG_DB[("PostgreSQL 15+ (44 Tables, FK Cascades, JSONB)")]
        PG_RLS["Row Level Security Policies (User Role Isolation)"]
        PG_AUTH["Supabase Auth (JWT, Role Claims)"]
        PG_STORAGE["Supabase Object Storage (Proposals, DRs, Contracts)"]
    end

    %% Data Connections
    L1 --> L2
    L2 --> L3
    L3 <--> L4
    L3 -.->|"Production Cutover"| L5
```

---

## 3. Component & State Architecture

### 3.1 Store Pattern Architecture
Every domain store follows a unified, deterministic reactive pattern:
* **Immediate Local Mutation**: State updates are committed synchronously into Zustand, updating React components with zero layout flicker.
* **Synchronous Persistence**: State snapshots are serialized into `storage.ts` using namespaced keys (`aa2000_module_*`).
* **Cross-Store Reactions**: Coordinated actions (e.g. `formsStore.addSubmission` $\rightarrow$ `leadsStore.addLead`) invoke target store dispatches cleanly without cyclical dependencies.

```mermaid
flowchart TD
    UI["React UI Component"] -->|"1. Dispatches Action"| STORE["Zustand Domain Store<br/>(e.g., usePipelinesStore)"]
    STORE -->|"2. Updates State (Sync)"| SUB["Subscribed Components<br/>(Triggers Re-render)"]
    STORE -->|"3. Persists Snapshot"| STORAGE["storage.ts (aa2000_* namespace)<br/>or Supabase Service API"]
```

---

## 4. Multi-Cloud AI Architecture & Fallback Cascade

To ensure 99.99% availability of conversational recommendations and NLP automation builders, the system executes an automated fallback cascade:

```mermaid
flowchart TD
    INPUT["Sales Data / Prompt Input"] --> GROQ_CHECK{"Groq API Key Configured<br/>& Healthy?"}
    
    GROQ_CHECK -- Yes --> GROQ_CALL["Invoke Groq API<br/>(qwen-2.5-32b / 300+ tok/s)"]
    GROQ_CALL --> GROQ_STATUS{"Response OK (200)?"}
    GROQ_STATUS -- Yes --> PARSE["Parse & Clean JSON"]
    
    GROQ_CHECK -- No / Timeout --> MISTRAL_CHECK{"Mistral API Key Configured<br/>& Healthy?"}
    GROQ_STATUS -- Error / 429 --> MISTRAL_CHECK
    
    MISTRAL_CHECK -- Yes --> MISTRAL_CALL["Invoke Mistral AI<br/>(mistral-small-latest)"]
    MISTRAL_CALL --> MISTRAL_STATUS{"Response OK (200)?"}
    MISTRAL_STATUS -- Yes --> PARSE
    
    MISTRAL_CHECK -- No / Timeout --> GEMINI_CHECK{"Gemini API Key Configured<br/>& Healthy?"}
    MISTRAL_STATUS -- Error / 429 --> GEMINI_CHECK
    
    GEMINI_CHECK -- Yes --> GEMINI_CALL["Invoke Google Gemini<br/>(gemini-2.5-flash)"]
    GEMINI_CALL --> GEMINI_STATUS{"Response OK (200)?"}
    GEMINI_STATUS -- Yes --> PARSE
    
    GEMINI_CHECK -- No / Error --> LOCAL_FALLBACK["Invoke Local Heuristic Regex Parser<br/>(Zero external dependency)"]
    GEMINI_STATUS -- Error / 429 --> LOCAL_FALLBACK
    
    LOCAL_FALLBACK --> PARSE
    PARSE --> OUTPUT["Inject into Zustand Store & Render UI"]
```

---

## 5. Security & Access Control (RBAC) Matrix

### 5.1 Role Hierarchy & Module Access Table

| Navigation Group / Feature Module | Super Admin | Admin | Sales Manager (GM) | Sales Rep | Finance Officer | Team Leader (Ops) | CEO / Exec |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard & Sales Pipeline** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Contacts & Companies** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Incentives Submission** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Incentives GM Approval (7-Point)**| ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Incentives Finance Review** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Incentives Executive Signoff** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Marketing & Email Campaigns** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Visual Workflow Builder** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AI Agents & Model Switcher** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Lead Capture & Ingestion** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Lead Territory Assignment** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Service Tickets & SLA** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Projects & Installation Tasks** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **PhilGEPS Bidding Management** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **KPI Scorecard & Reports** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Contracts & Maintenance (PMS/CMS)**| ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Admin Panel & Branding** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs & Security Telemetry** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 6. Database Schema & Migration Blueprint

The platform's relational backend is implemented in `supabase/migrations/001_full_schema.sql` comprising 44 tables across 27 domain modules:

```mermaid
flowchart LR
    SERVICES["Core Services"] --> CRM["CRM Accounts & Contacts"] --> LEADS["Leads & Signals"]
    BPM["BPM & Workflows"] --> DEALS["Service Records / Deals"] --> QUOTES["Quotations & Invoices"]
    APPROVALS["Approvals Engine"] --> INCENTIVES["Incentives & Commissions"] --> FINANCE["Finance Clearance"]
    PROJECTS["Projects & Tasks"] --> TICKETS["Service Tickets / SLA"] --> PMS["Contracts & PMS"]

    SERVICES --> BPM --> APPROVALS --> PROJECTS
    LEADS --> QUOTES --> FINANCE --> PMS
```

### Row Level Security (RLS) Rules
* `service_records`: Accessible only to the assigned employee or administrators (`assigned_to = auth.uid() OR role = 'admin'`).
* `contacts` & `leads`: Sales reps can view only accounts assigned to them, while Sales Managers and Admins possess visibility across the complete territorial hierarchy.
* `app_requests`: Tech leads view assigned service tickets; emergency breach alerts broadcast across managerial roles.
* `projects`: Accessible to project team members matching `auth.uid() = ANY(team_members)`.

---

## 7. Deployment & Operational Topology

```mermaid
flowchart LR
    subgraph EDGE["Client Edge (Browser)"]
        USER["Browser Client<br/>(Chrome / Safari / Edge / Mobile)"]
    end

    subgraph CDN["Static Hosting & CDN"]
        VERCEL["Vite SPA Distribution<br/>(Brotli/Gzip, HTTP/2, Global Edge)"]
    end

    subgraph CLOUD_AI["Multi-Cloud AI Endpoints"]
        API_GROQ["Groq Cloud API"]
        API_MISTRAL["Mistral AI API"]
        API_GEMINI["Google Generative AI"]
    end

    subgraph BACKEND["Enterprise Backend (Supabase Cloud)"]
        KONG["Kong API Gateway"]
        POSTGREST["PostgREST RESTful Data API"]
        REALTIME["Realtime WebSocket Cluster"]
        PG[(PostgreSQL Database Cluster)]
    end

    USER <-->|"HTTPS / WSS"| CDN
    CDN <--> USER
    USER <-->|"Inference Requests"| CLOUD_AI
    USER -.->|"Data Synchronization"| KONG
    KONG --> POSTGREST & REALTIME
    POSTGREST & REALTIME --> PG
```
