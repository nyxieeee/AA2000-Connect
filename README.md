# AA2000 Connect CRM

Enterprise CRM platform for AA2000 Security & Technology Solutions Inc. — sales pipeline, lead management, marketing automation, client engagement, and operations.

## Quick Start

```bash
npm install
npm run dev       # Vite dev server with HMR
npm run build     # TypeScript check + production build
npm run lint      # ESLint
```

## Tech Stack

React 19 · TypeScript 6 · Vite 8 · Zustand 5 · Tailwind CSS 3 · React Router 7 · Framer Motion 12 · Supabase (ready to connect)

## Project Structure

```
src/
├── App.tsx              # Routes + providers
├── components/          # Layout shell (Sidebar, Navbar, AppShell)
├── pages/               # 36 route components
├── stores/              # Zustand stores (20 domain modules + 2 global)
├── services/            # API layer, localStorage, workflow templates
├── types/               # Full Supabase schema types
├── lib/supabase.ts      # Supabase client (currently placeholder)
└── index.css            # Tailwind + custom component classes
```

## Key Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Flowchart

```mermaid
flowchart TB
    subgraph Browser["Browser"]
        REACT["React 19 App"]
    end

    subgraph Routing["Routing Layer"]
        RR["React Router 7"]
        LOGIN["/login - LoginPage"]
        APP["/ - AppShell Layout"]
        PAGES["36 Route Pages"]
    end

    subgraph UI["UI Layer"]
        SHELL["AppShell"]
        SIDEBAR["Sidebar (29 nav items)"]
        NAVBAR["Navbar (search, notifs, avatar)"]
        ANIM["Framer Motion Animations"]
        TAILWIND["Tailwind CSS Design System"]
    end

    subgraph State["State Management"]
        AUTH["authStore (mock auth)"]
        SIDESTORE["sidebarStore (persisted)"]
        MODULES["20 Module Stores"]
        RQ["@tanstack/react-query (available)"]
    end

    subgraph Stores["Module Stores"]
        CRM["crmStore<br/>contacts + companies"]
        PIPE["pipelinesStore<br/>deals + kanban"]
        TASKS["tasksStore<br/>recurring tasks"]
        PROJ["projectsStore<br/>project tasks"]
        CHAT["chatStore<br/>channels + messages"]
        AUTO["automationStore<br/>workflows + approval"]
        LEADS["leadsStore<br/>lead rules"]
        CONTR["contractsStore<br/>lifecycle"]
        SLA["slaStore<br/>breach tracking"]
        FORMS["formsStore<br/>dynamic schemas"]
        SEQ["sequencesStore<br/>step automation"]
        ORG["orgChartStore<br/>hierarchy"]
        ENG["engagementStore<br/>buying signals"]
        DOCS["documentsStore<br/>upload tracking"]
        MEET["meetingsStore<br/>scheduling"]
        NOTIF["notificationsStore<br/>read tracking"]
        AUDIT["auditLogStore<br/>immutable logs"]
        AI["aiRecommendationsStore<br/>next-step AI"]
        RESEARCH["companyResearchStore<br/>intel"]
        EMAIL["emailTrackingStore<br/>campaign tracking"]
    end

    subgraph Data["Data Layer"]
        STORAGE["storage.ts<br/>localStorage wrapper<br/>(aa2000_ prefix)"]
        SUPABASE["supabaseService.ts<br/>Typed API layer<br/>(25+ modules)"]
        SUPA["supabase.ts<br/>Client (null — placeholder)"]
    end

    subgraph External["Future Backend"]
        SUPABASE_DB[("Supabase PostgreSQL<br/>38 tables")]
    end

    REACT --> RR
    RR --> LOGIN
    RR --> APP
    APP --> SHELL
    SHELL --> SIDEBAR
    SHELL --> NAVBAR
    SHELL --> PAGES
    PAGES --> ANIM
    PAGES --> TAILWIND

    PAGES --> AUTH
    PAGES --> MODULES
    PAGES --> RQ

    MODULES --> CRM
    MODULES --> PIPE
    MODULES --> TASKS
    MODULES --> PROJ
    MODULES --> CHAT
    MODULES --> AUTO
    MODULES --> LEADS
    MODULES --> CONTR
    MODULES --> SLA
    MODULES --> FORMS
    MODULES --> SEQ
    MODULES --> ORG
    MODULES --> ENG
    MODULES --> DOCS
    MODULES --> MEET
    MODULES --> NOTIF
    MODULES --> AUDIT
    MODULES --> AI
    MODULES --> RESEARCH
    MODULES --> EMAIL

    CRM --> STORAGE
    PIPE --> STORAGE
    TASKS --> STORAGE
    CHAT --> STORAGE
    AUTO --> STORAGE

    STORAGE -.->|"Future: swap to"| SUPABASE
    SUPABASE --> SUPA
    SUPA -.-> SUPABASE_DB
```

## Architecture

**See [`ARCHITECTURE.md`](./ARCHITECTURE.md)** for:
- Complete data flow diagram
- Store pattern reference
- Route table with all 36 pages
- Supabase connection guide
- Component hierarchy
- Design system tokens
- Known limitations

## Current Status

- Fully functional SPA with localStorage persistence
- Mock auth (always authenticated as admin)
- Supabase service layer fully typed — uncomment supabase.ts, set `.env` vars, and swap stores to connect
- All 38 database tables have migration SQL in `supabase/migrations/001_full_schema.sql`
