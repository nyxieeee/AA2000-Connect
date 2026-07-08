# AA2000 Connect CRM — Architecture Guide

## Stack Overview

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6.0 |
| Bundler | Vite 8 |
| Routing | React Router 7 |
| State | Zustand 5 |
| Server State | @tanstack/react-query (available, not yet connected) |
| Styling | Tailwind CSS 3 + custom CSS components |
| Animations | Framer Motion 12 |
| Icons | lucide-react |
| Charts | recharts |
| Drag & Drop | @dnd-kit |
| Flow Builder | @xyflow/react (React Flow) |
| HTTP | axios |
| Dates | date-fns |
| Backend (future) | Supabase (client exists, null client — see below) |
| Persistence (current) | localStorage via `storage.ts` |

---

## Project Structure

```
src/
├── App.tsx                      # Root: React Query > BrowserRouter > Routes
├── main.tsx                     # Entry: StrictMode > App
├── index.css                    # Tailwind directives + custom component classes
├── lib/
│   └── supabase.ts              # Supabase client (currently null — commented out)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Sidebar + Navbar + <Outlet/>
│   │   ├── Sidebar.tsx          # 10 nav groups, 50+ nav items, role-based visibility
│   │   └── Navbar.tsx           # Search, notifications bell, user avatar
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # Redirect to /login if unauthenticated
│   └── ui/
│       └── AnimatedPage.tsx     # Page/List/ListItem wrappers
├── pages/                       # 60+ route components in 47 directories
│   ├── auth/LoginPage.tsx
│   ├── dashboard/
│   ├── crm/                     # ContactsList, ContactDetail, CompaniesList
│   ├── pipelines/               # PipelineBoard, DealDetail
│   ├── leads/                   # Leads, LeadDetail, LeadAssignment
│   ├── projects/
│   ├── requests/
│   ├── tasks/
│   ├── contracts/
│   ├── sla/
│   ├── chat/
│   ├── comms/UnifiedInboxPage
│   ├── marketing/               # SocialPlanner, EmailCampaigns, AIAutomations, MarketingLayout
│   ├── automation/              # WorkflowBuilderPage
│   ├── ai-agents/
│   ├── analytics/
│   ├── ai-recommendations/
│   ├── documents/
│   ├── meetings/
│   ├── notifications/
│   ├── forms/
│   ├── org-chart/
│   ├── sequences/
│   ├── email-tracking/
│   ├── research/CompanyResearchPage
│   ├── audit-logs/
│   ├── admin-analytics/
│   ├── admin/AdminPanelPage
│   ├── settings/SettingsPage
│   ├── incentives/              # IncentivesPage, IncentiveApprovalsPage, IncentiveFinancePage, IncentiveExecutivePage
│   ├── kpi/
│   ├── policy-center/
│   ├── help/
│   ├── ai-knowledge/
│   ├── reports/
│   ├── bidding/
│   ├── seo-geo/
│   ├── service/
│   ├── knowledge-base/
│   ├── marketplace/
│   ├── business-intelligence/
│   ├── website/
│   ├── product-search/
│   ├── approvals/               # (empty — placeholder)
│   ├── bpm/                     # (empty — placeholder)
│   ├── data-builder/            # (empty — placeholder)
│   └── data-privacy/            # (empty — placeholder)
├── stores/
│   ├── authStore.ts             # User + auth state (mock, 6 demo accounts)
│   ├── sidebarStore.ts          # Sidebar collapse state (persisted)
│   └── modules/                 # 32 domain stores (one per feature)
│       ├── crmStore.ts
│       ├── pipelinesStore.ts
│       ├── tasksStore.ts
│       ├── projectsStore.ts
│       ├── requestsStore.ts
│       ├── contractsStore.ts
│       ├── slaStore.ts
│       ├── leadsStore.ts
│       ├── chatStore.ts
│       ├── documentsStore.ts
│       ├── meetingsStore.ts
│       ├── notificationsStore.ts
│       ├── formsStore.ts
│       ├── automationStore.ts
│       ├── sequencesStore.ts
│       ├── orgChartStore.ts
│       ├── engagementStore.ts
│       ├── emailTrackingStore.ts
│       ├── companyResearchStore.ts
│       ├── aiRecommendationsStore.ts
│       ├── auditLogStore.ts
│       ├── aiAgentsStore.ts
│       ├── biddingStore.ts
│       ├── incentivesStore.ts
│       ├── knowledgeBaseStore.ts
│       ├── kpiStore.ts
│       ├── marketplaceStore.ts
│       ├── policyCenterStore.ts
│       ├── productCatalogStore.ts
│       ├── reportsStore.ts
│       ├── seoGeoStore.ts
│       ├── serviceManagementStore.ts
│       └── websiteIntegrationStore.ts
├── services/
│   ├── storage.ts               # localStorage wrapper (aa2000_ prefix)
│   ├── supabaseService.ts       # Typed Supabase API layer (full CRUD — not connected)
│   ├── db.ts                    # UI-level type interfaces
│   ├── workflowTemplates.ts     # 8 pre-built automation templates
│   └── aiWorkflowBuilder.ts     # NLP prompt → workflow nodes
├── types/
│   └── database.ts              # Full Supabase schema (44 tables)
├── utils/
│   ├── cn.ts                    # clsx + tailwind-merge helper
│   └── animations.ts            # Framer Motion variants
└── assets/
    ├── hero.png
    ├── react.svg
    └── vite.svg
```

---

## Data Flow

```
User clicks button / submits form
            │
            ▼
   Page Component (e.g., ContactsListPage)
            │
            ├── useCRMStore() → gets contacts, addContact
            │
            ▼
   Zustand Store Action (e.g., addContact)
            │
            ├── 1. Mutate local state (spread/immutable)
            ├── 2. Persist: storage.set('app_contacts', updated)
            └── 3. Update React: set({ contacts: updated })
                        │
                        ▼
              All subscribers re-render
```

**Rules:**
- Pages never call storage or Supabase directly — always through stores
- Stores are the single source of truth for both runtime state and persistence
- `storage.ts` is the currently active persistence layer
- `supabaseService.ts` is typed and ready — swap `storage.get/set` calls for Supabase queries when connecting

---

## Store Pattern

Every module store follows this template:

```typescript
import { create } from 'zustand';
import { storage } from '../../services/storage';

interface Store {
  items: Item[];
  fetchItems: () => void;
  addItem: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, data: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  items: storage.get<Item[]>('key') || [],

  fetchItems: () => {
    const items = storage.get<Item[]>('key') || [];
    set({ items });
  },

  addItem: (data) => {
    const newItem: Item = { ...data, id: `prefix-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().items, newItem];
    storage.set('key', updated);
    set({ items: updated });
  },

  updateItem: (id, data) => {
    const updated = get().items.map(i => i.id === id ? { ...i, ...data } : i);
    storage.set('key', updated);
    set({ items: updated });
  },

  deleteItem: (id) => {
    const updated = get().items.filter(i => i.id !== id);
    storage.set('key', updated);
    set({ items: updated });
  },
}));
```

Note: Some stores have additional complexity — seed data on first load (pipelinesStore, leadsStore, aiAgentsStore, engagementStore), computed values (incentivesStore incentive computation, engagementStore buying signal analysis), cross-store calls (formsStore auto-creates leads), and workflow approval workflows (automationStore, incentivesStore).

---

## Authentication

**Current state:** Mocked — 6 demo accounts for role-based testing.

**File:** `src/stores/authStore.ts`
- 6 demo accounts: Super Admin, General Manager, Sales Manager, Sales Rep, Finance, CEO
- Roles: `super_admin | admin | sales_manager | sales_rep | finance | team_leader | ceo`
- Session persisted to localStorage (`aa2000_auth_user`)
- `login(user)` — sets user + isAuthenticated
- `logout()` — clears user, sets isAuthenticated to false
- `restoreSession()` — rehydrates from localStorage on page load

**To connect real auth:**
1. Enable Supabase Auth in `src/lib/supabase.ts`
2. Replace mock login in `LoginPage.tsx` with `supabase.auth.signInWithPassword()`
3. Subscribe to auth state changes
4. Add route guards for unauthenticated users

---

## Connecting to Supabase

The entire Supabase API layer is already typed in `src/services/supabaseService.ts` (25+ API modules). To connect:

**Step 1:** Enable the client in `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Step 2:** Add `.env` file at project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 3:** Swap stores from `storage.get/set` to `supabaseService` calls.

**Step 4:** Run the migration in `supabase/migrations/001_full_schema.sql` against your Supabase project to create all 44 tables.

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | `LoginPage` | Authentication with 6 role-based demo accounts |
| `/` | → redirect to `/dashboard` | |
| `/dashboard` | `DashboardPage` | KPI cards, revenue chart, automation impact, AI neural scan |
| `/contacts` | `ContactsListPage` | Contact CRUD with search, CSV import/export |
| `/contacts/:id` | `ContactDetailPage` | Contact profile + timeline |
| `/companies` | `CompaniesListPage` | Company CRUD |
| `/pipeline` | `PipelineBoardPage` | Drag-and-drop Kanban |
| `/pipeline/:id` | `DealDetailPage` | Deal edit with AI summaries |
| `/requests` | `RequestsPage` | Service request tickets |
| `/projects` | `ProjectsPage` | Project Kanban |
| `/tasks` | `TasksPage` | Personal task list with recurrence |
| `/contracts` | `ContractsPage` | Contract lifecycle |
| `/sla` | `SLAPage` | SLA policies + breach tracking |
| `/workflows` | `WorkflowBuilderPage` | React Flow automation builder with 8 templates + AI prompt |
| `/inbox` | `UnifiedInboxPage` | Multi-channel inbox |
| `/marketing/*` | (nested) | Social planner, email campaigns, AI automations |
| `/analytics` | `DashboardBuilderPage` | Sales performance charts |
| `/ai-agents` | `AIAgentsPage` | AI agent catalog (4 default agents, deploy modal) |
| `/ai-recommendations` | `AIRecommendationsPage` | AI suggestions |
| `/leads` | `LeadsPage` | Lead management |
| `/leads/:id` | `LeadDetailPage` | Lead detail |
| `/lead-assignment` | `LeadAssignmentPage` | Rule-based lead routing |
| `/chat` | `ChatPage` | Team chat |
| `/documents` | `DocumentsPage` | Document library |
| `/meetings` | `MeetingsPage` | Meeting scheduler |
| `/notifications` | `NotificationsPage` | Notification center |
| `/forms` | `WebFormsPage` | Form builder (auto-creates CRM leads) |
| `/org-chart` | `OrgChartPage` | Org chart |
| `/sequences` | `SequencesPage` | Step-based sequences |
| `/buying-signals` | `EmailTrackingPage` | Buying signal dashboard |
| `/company-research` | `CompanyResearchPage` | Company intelligence |
| `/audit-logs` | `AuditLogsPage` | Audit trail |
| `/admin-analytics` | `AdminAnalyticsPage` | Admin reports |
| `/admin` | `AdminPanelPage` | User/role management |
| `/settings` | `SettingsPage` | User settings + integrations + branding |
| `/incentives` | `IncentivesPage` | Incentive request submission |
| `/incentives/approvals` | `IncentiveApprovalsPage` | GM review with 7-item checklist |
| `/incentives/finance` | `IncentiveFinancePage` | Finance verification |
| `/incentives/executive` | `IncentiveExecutivePage` | CEO escalation & approval |
| `/kpi` | `KPIPage` | KPI monitor (12 metrics, per-period/per-person breakdown) |
| `/policy-center` | `PolicyCenterPage` | Policy documents viewer |
| `/help` | `HelpCenterPage` | Video tutorials, guides, FAQs, announcements |
| `/ai-knowledge` | `AIKnowledgePage` | AI knowledge base |
| `/reports` | `ReportsPage` | Saved report definitions |
| `/bidding` | `BiddingPage` | PhilGEPS bid management |
| `/seo-geo` | `SEOGEOPage` | SEO/GEO management |
| `/service-management` | `ServiceManagementPage` | PMS & CMS service management |
| `/knowledge-base` | `KnowledgeBasePage` | Technical manuals, fire codes, product docs |
| `/marketplace` | `MarketplacePage` | Facebook Marketplace listings + inquiries |
| `/business-intelligence` | `BusinessIntelligencePage` | Business intelligence |
| `/website` | `WebsiteIntegrationPage` | Website integration |
| `/product-search` | `ProductSearchPage` | Product catalog search |
| `*` | → redirect to `/dashboard` | |

---

## Key Technical Notes

### Buttons
All primary buttons use `bg-brand-blue` with `hover:bg-brand-light`. The `.premium-button` class in `index.css` applies this globally.

### Design System (index.css)
| Class | Purpose |
|-------|---------|
| `.glass-card` | White card with shadow, border, hover effect |
| `.premium-button` | Primary blue button |
| `.input-field` | Form input with focus ring |
| `.section-title` | Section header (2xl, bold, uppercase) |
| `.sub-title` | Small uppercase label (10px) |

### Sidebar Navigation
10 nav groups with role-based visibility:
- **Sales** — Dashboard, Contacts, Accounts, PMS & CMS, Projects, Pipeline, Inbox
- **Incentives** — Incentive Requests, GM Approvals (manager+), Finance Review (finance), Executive Review (exec)
- **Marketing & Automation** — Marketing, Automation, AI Agents, FB Marketplace
- **Lead Management** — Lead Capture, Lead Assignment (manager+), Company Research
- **Engagement** — Client Activity, Org Chart, Follow-ups, AI Recommendations
- **Operations** — Tasks, Documents, Meetings, Team Chat, Notifications, Web Forms
- **Intelligence** (manager+) — KPI Monitor, Reports, SEO/GEO (admin), Business Intel (exec), Ato AI
- **Resources** — Bidding/PhilGEPS (manager+), Policy Center, Knowledge Base, Help Center, Website (admin)
- **Catalog** — Product Search
- **Admin** — Admin Panel (admin), Contracts, Response Times, Activity History (admin)

### Roles
`super_admin | admin | sales_manager | sales_rep | finance | team_leader | ceo`

### localStorage Keys
All stores use the `aa2000_` prefix (handled by `storage.ts`):
- `aa2000_app_contacts`, `aa2000_app_companies` — CRM
- `aa2000_crm_deals`, `aa2000_crm_pipelines` — Pipeline
- `aa2000_module_*` — All 32 module stores
- `aa2000_auth_user` — Auth session
- `aa2000_settings_*` — Settings persistence
- `aa2000_admin_branding` — Admin branding

### Special Store Behaviors
| Store | Unique Behavior |
|-------|----------------|
| `pipelinesStore` | Seeds 1 pipeline + 5 deals on first load |
| `leadsStore` | Seeds 5 leads + 3 assignment rules on first load |
| `aiAgentsStore` | Seeds 4 default AI agents |
| `engagementStore` | Seeds 10 engagement events; computes buying signal analysis |
| `incentivesStore` | Seeds 3 incentive requests; computes GP-based incentive formulas |
| `formsStore` | Auto-creates CRM leads from web form submissions (cross-store call) |
| `automationStore` | Seeds 3 default workflows; supports folder organization, approval workflow, template cloning |
| `biddingStore` | Seeds 2 bids with document tracking |
| `knowledgeBaseStore` | Seeds 5 KB articles |
| `kpiStore` | Seeds 4 KPI metric records |
| `marketplaceStore` | Seeds 3 listings + 2 inquiries |
| `policyCenterStore` | Seeds 6 policy documents |
| `productCatalogStore` | Seeds 10 products across CCTV, networking, FDAS, access control, cabling, power categories |

### Known Limitations (Before Connecting Backend)
1. Data is local to each browser — no sharing between users
2. Auth is mocked — 6 demo accounts with role-based access
3. Integrations (Viber, WhatsApp, SMS, TikTok, Meta, Email) save API keys to localStorage but don't actually connect
4. No real-time updates between sessions
5. File uploads trigger alerts but don't actually persist files
6. No error boundaries on async store operations
7. 4 page directories are empty placeholders (approvals, bpm, data-builder, data-privacy)
8. `emailTrackingStore.ts` does not exist in the repository (only `engagementStore.ts` covers engagement tracking)

### Lint
- The only remaining lint errors are `@typescript-eslint/no-explicit-any` (~55 instances across 25+ files). These are `as any` type assertions for Supabase client, React Flow node types, and form event handlers. They are safe to leave or can be fixed with proper type narrowing.
