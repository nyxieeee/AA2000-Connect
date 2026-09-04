# AA2000 Connect — Data Flow Diagrams (DFD) Specification

## 1. Overview

This document specifies the Data Flow Diagrams (DFDs) for **AA2000 Connect (CRM)**, capturing the flow of data through external entities, internal processing subsystems, local/cloud data stores, and third-party gateways.

---

## 2. Level 0: System Context Diagram

The Context Diagram defines the system boundary for AA2000 Connect, illustrating inputs and outputs with external actors and cloud services.

```mermaid
flowchart TB
    %% External Entities
    CLIENT["Prospective Client / Customer<br/>(Web Visitor, B2B Buyer)"]
    REP["Sales Representative"]
    GM["General Manager / Sales Manager"]
    FIN["Finance Officer"]
    CEO["Chief Executive Officer"]
    TECH["Field Technician / Engineer"]
    AI_GATEWAY["Cloud AI Cluster<br/>(Groq / Mistral / Google Gemini)"]
    MSG_GATEWAY["Omnichannel Gateways<br/>(Viber / WhatsApp / SMTP / Twilio)"]
    PHILGEPS["PhilGEPS & Government Portals"]

    %% Central System Boundary
    subgraph SYSTEM["AA2000 CONNECT CRM SYSTEM BOUNDARY"]
        CORE["AA2000 Connect Core Platform<br/>(SPA Client + Zustand Store + Storage/Supabase)"]
    end

    %% Ingestion & Client Flows
    CLIENT -->|"1. Submits Web Form / RFQ / Chat Inquiries"| CORE
    CLIENT -->|"2. Interacts with Quotation Links & Emails"| CORE
    CORE -->|"3. Delivers Proposals, Invoices & SMS/Viber Alerts"| CLIENT

    %% Sales Rep Flows
    REP -->|"4. Contacts CSV, Deal Updates, Pipeline Actions"| CORE
    REP -->|"5. Submits Won Deal Incentive Claims"| CORE
    CORE -->|"6. Provides AI Next-Best-Steps & Lead Scores"| REP

    %% Management & Governance Flows
    GM -->|"7. 7-Point Compliance Checklist Endorsements"| CORE
    GM -->|"8. Defines SLA Rules & Territory Assignment"| CORE
    FIN -->|"9. Margin Verification & Official Receipt (OR) Audits"| CORE
    CEO -->|"10. Final Executive Payout Signoff & Strategic Targets"| CORE
    CORE -->|"11. Real-time KPI Dashboards & Variance Alerts"| CEO

    %% Field & Operations Flows
    TECH -->|"12. PMS/CMS Site Inspections & Task Completion"| CORE
    CORE -->|"13. Dispatches Work Orders & Warranty Tickets"| TECH

    %% External System Integrations
    CORE <-->|"14. Multi-Provider AI Inference Requests & Stream Responses"| AI_GATEWAY
    CORE -->|"15. Outbound Messaging Dispatch & Webhook Receipts"| MSG_GATEWAY
    PHILGEPS -->|"16. Public Bidding Notices & Tender Bulletins"| CORE
```

---

## 3. Level 1: Subsystem Process Decomposition Diagram

The Level 1 DFD decomposes the core platform into nine primary functional processes interacting with shared and dedicated data stores.

```mermaid
flowchart TD
    %% External Entities
    EXT_VISITOR["Web Visitor / Buyer"]
    EXT_REP["Sales Representative"]
    EXT_MGR["GM / Finance / CEO"]
    EXT_TECH["Field Operations"]
    EXT_AI["AI Cloud Cluster"]

    %% Data Stores
    subgraph STORES["Data Stores (localStorage 'aa2000_*' / PostgreSQL)"]
        D1[("D1: Contacts & Companies")]
        D2[("D2: Leads & Telemetry")]
        D3[("D3: Pipeline Deals & Stages")]
        D4[("D4: Incentive Claims & Approvals")]
        D5[("D5: Service Tickets & SLA")]
        D6[("D6: Projects & Work Orders")]
        D7[("D7: Workflows & Automations")]
        D8[("D8: Audit Logs & System RBAC")]
    end

    %% Process 1: Ingestion
    subgraph P1["1.0 Ingestion & Scoring"]
        PROC_1_1["1.1 Web Form Ingestion"]
        PROC_1_2["1.2 Email/Click Telemetry"]
        PROC_1_3["1.3 Algorithmic Lead Scoring"]
    end

    EXT_VISITOR -->|"Form Data"| PROC_1_1
    EXT_VISITOR -->|"Link Click / Email Open"| PROC_1_2
    PROC_1_1 -->|"New Contact / Lead"| D1
    PROC_1_1 -->|"Raw Ingestion Record"| D2
    PROC_1_2 -->|"Telemetry Event"| D2
    D1 & D2 --> PROC_1_3
    PROC_1_3 -->|"Updated Score & Heat Grade"| D1

    %% Process 2: Pipeline
    subgraph P2["2.0 Pipeline & Opportunities"]
        PROC_2_1["2.1 Deal Progression (Kanban)"]
        PROC_2_2["2.2 Quotation & Margin BOM"]
    end

    EXT_REP -->|"Drag Deal / Update Status"| PROC_2_1
    PROC_2_1 <-->|"Read/Update Deals"| D3
    PROC_2_2 -->|"Quotation Payload"| D3
    PROC_2_1 -->|"Log Activity"| D8

    %% Process 3: Incentives
    subgraph P3["3.0 Multi-Tier Incentive Approvals"]
        PROC_3_1["3.1 Payout Claim Generation"]
        PROC_3_2["3.2 GM 7-Item Audit Checklist"]
        PROC_3_3["3.3 Finance & CEO Signoff"]
    end

    D3 -->|"Won Deal Data"| PROC_3_1
    EXT_REP -->|"Claim Request"| PROC_3_1
    PROC_3_1 -->|"Draft Claim"| D4
    EXT_MGR -->|"Checklist Verification"| PROC_3_2
    PROC_3_2 <-->|"Endorse / Reject"| D4
    EXT_MGR -->|"Financial Clearance"| PROC_3_3
    PROC_3_3 -->|"Release / Disbursement"| D4

    %% Process 4: Operations & Service
    subgraph P4["4.0 Service Desk & SLA Governance"]
        PROC_4_1["4.1 Ticket Logging & SLA Timer"]
        PROC_4_2["4.2 Breach Detection Engine"]
        PROC_4_3["4.3 Field Dispatch & Handover"]
    end

    EXT_VISITOR & EXT_REP -->|"Issue Report"| PROC_4_1
    PROC_4_1 -->|"New Ticket"| D5
    PROC_4_2 <-->|"Monitor Deadlines"| D5
    PROC_4_2 -->|"Breach Alert"| EXT_MGR
    EXT_TECH <-->|"Resolve & Close"| PROC_4_3
    PROC_4_3 <-->|"Update Status"| D5

    %% Process 5: AI & Automation
    subgraph P5["5.0 Multi-Cloud AI & Automation Engine"]
        PROC_5_1["5.1 Deal & Signal Aggregator"]
        PROC_5_2["5.2 Fallback LLM Dispatcher"]
        PROC_5_3["5.3 Visual Workflow Execution"]
    end

    D2 & D3 --> PROC_5_1
    PROC_5_1 -->|"Prompt Payload"| PROC_5_2
    PROC_5_2 <-->|"Groq -> Mistral -> Gemini"| EXT_AI
    PROC_5_2 -->|"Actionable Next Steps"| EXT_REP
    D7 <-->|"Node Graph Execution"| PROC_5_3
```

---

## 4. Level 2: Transactional Sequence Dataflows

### 4.1 Sequence 1: Public Web Form to Lead & Auto-Scoring Flow

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as External Website Visitor
    participant WebUI as Public Web Form (WebFormsPage)
    participant FormStore as formsStore (Zustand)
    participant LeadStore as leadsStore (Zustand)
    participant ScoreEngine as leadScoring.ts (Engine)
    participant Rep as Sales Representative UI
    participant Storage as localStorage / Supabase

    Visitor->>WebUI: Fills In Name, Email, Phone, Project ("16-CH IP CCTV System")
    Visitor->>WebUI: Clicks "Submit Request"
    WebUI->>FormStore: addSubmission(formId, formData)
    FormStore->>Storage: Persist form submission payload
    
    rect rgb(240, 248, 255)
        Note over FormStore,LeadStore: Cross-Store Automation
        FormStore->>LeadStore: addLead({ name, email, phone, company, source: 'web_form', notes })
        LeadStore->>ScoreEngine: computeContactScore(leadProfile, engagementEvents)
        ScoreEngine-->>LeadStore: Returns { totalScore: 75, grade: 'A', heatLabel: 'Hot Lead' }
        LeadStore->>Storage: Persist lead with Score=75, Status='New'
    end

    LeadStore->>Rep: Emits In-App Notification ("New Hot Lead Received!")
    Rep->>LeadStore: Opens Lead Details View
    LeadStore-->>Rep: Renders Contact Card + 'Lead Auto-Created' status badge
```

---

### 4.2 Sequence 2: 4-Tier Incentive Approval Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Rep as Sales Representative
    actor GM as General Manager
    actor Fin as Finance Officer
    actor CEO as Chief Executive Officer
    participant IncStore as incentivesStore
    participant Storage as Persistence Layer

    Note over Rep,IncStore: Phase 1: Claim Submission
    Rep->>IncStore: Create Claim for Won Deal (Revenue ₱1.5M, BOM Cost ₱1.0M)
    IncStore->>IncStore: Compute GP = ₱500k, Incentive = ₱25k (5% Tier)
    IncStore->>Storage: Save claim (status: 'submitted')

    Note over GM,IncStore: Phase 2: GM 7-Item Compliance Review
    GM->>IncStore: Open /incentives/approvals
    IncStore-->>GM: Render Pending Claims + 7-Point Checklist
    GM->>GM: Verify: Contract Signed, Full Collection, DR Signed, Warranty Issued, Completion Signoff, OR Issued, Clearance Form
    GM->>IncStore: Submit Checklist Verification + Click "Endorse"
    IncStore->>Storage: Update status to 'gm_approved'

    Note over Fin,IncStore: Phase 3: Financial Clearance
    Fin->>IncStore: Open /incentives/finance
    Fin->>Fin: Audit Bank Collections & Final Cost-of-Goods
    Fin->>IncStore: Validate & Add Ledger Memo
    IncStore->>Storage: Update status to 'finance_verified'

    Note over CEO,IncStore: Phase 4: Executive Release
    CEO->>IncStore: Open /incentives/executive
    CEO->>IncStore: Final Sign-off ("Approved for Payroll Release")
    IncStore->>Storage: Update status to 'released'
    IncStore-->>Rep: Notify Rep: Incentive Approved & Scheduled for Payout
```

---

### 4.3 Sequence 3: Multi-Provider AI Fallback Engine Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Sales Rep / Automation Trigger
    participant Engine as aiRecommendationEngine.ts
    participant Groq as Provider 1: Groq API (Qwen 2.5 32B)
    participant Mistral as Provider 2: Mistral AI (mistral-small)
    participant Gemini as Provider 3: Google Gemini (gemini-2.5-flash)
    participant Store as aiRecommendationsStore

    User->>Engine: scanAndGenerateAIRecommendations({ deals, leads, signals })
    
    rect rgb(255, 250, 240)
        Note over Engine,Groq: 1. Attempt Primary Provider
        Engine->>Groq: POST /chat/completions (model: qwen-2.5-32b)
        alt Groq Responds OK (200)
            Groq-->>Engine: Returns Clean JSON Recommendations
        else Groq Timeout or Rate Limit (429/500)
            Groq-->>Engine: Connection Failed
            Note over Engine,Mistral: 2. Fallback to Secondary Provider
            Engine->>Mistral: POST /v1/chat/completions (model: mistral-small-latest)
            alt Mistral Responds OK (200)
                Mistral-->>Engine: Returns Clean JSON Recommendations
            else Mistral Failed
                Mistral-->>Engine: Connection Failed
                Note over Engine,Gemini: 3. Fallback to Tertiary Provider
                Engine->>Gemini: POST generateContent (gemini-2.5-flash)
                Gemini-->>Engine: Returns Clean JSON Recommendations
            end
        end
    end

    Engine->>Engine: cleanJson() + Tag `providerUsed` + Generate UUIDs
    Engine->>Store: setRecommendations(results)
    Store-->>User: Renders Prioritized Next-Best-Action Cards
```

---

### 4.4 Sequence 4: Customer Support Ticket SLA Countdown & Breach Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Customer / Support Rep
    participant TicketUI as RequestsPage (/requests)
    participant Store as requestsStore
    participant SLAService as slaStore (Timer Daemon)
    actor Tech as Field Technician
    actor GM as General Manager

    Client->>TicketUI: Log Emergency Issue ("Main FDAS Panel Trouble in BGC Tower")
    TicketUI->>Store: addRequest({ type: 'service', priority: 'urgent', subject: 'FDAS Trouble' })
    Store->>SLAService: calculateSLA('urgent')
    SLAService-->>Store: Set slaDueAt = Now + 2 Hours
    Store->>TicketUI: Render Ticket (Timer: 01:59:59 remaining)

    alt Resolved On-Time
        Tech->>Store: updateRequestStatus(ticketId, 'resolved')
        Store->>Store: Set slaBreached = false, resolvedAt = Now
        Store-->>TicketUI: Badge: "SLA Met"
    else Timer Expires (Now > slaDueAt)
        SLAService->>Store: triggerBreachCheck()
        Store->>Store: Set slaBreached = true
        Store-->>TicketUI: Highlight Card with Flashing Red "SLA BREACHED"
        Store-->>GM: Send Emergency Broadcast Notification to GM
    end
```
