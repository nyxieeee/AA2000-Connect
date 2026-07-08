# AA2000 Connect — Full Feature Gap Report
**Sources:** SPIMS Blueprint v1.0 (incentive system) + AA2000 Intelligence Platform Master Blueprint v1.2
**Excludes:** Sales Quotation App, Site Survey App (separate existing apps)

---

## PART A — From SPIMS v1.0 (Incentive System)

### 1. Incentive Request Module
**Route:** `/incentives` | **Store:** `incentivesStore.ts`
Auto-pulled fields: Quotation ref, PO ref, Contract ref, Down Payment, GP, Collection %, Assigned Salesperson, Discount History.
Salesperson inputs: Project turned over? / Docs complete? / Special approval required? / Remarks.
Flow: `draft → submitted → gm_review → finance_review → ceo_review (conditional) → approved/rejected → released`

### 2. General Manager Approval Module
**Route:** `/incentives/approvals` (Team Leader role)
Checklist gate: CRM Updated, Client Ownership Verified, Follow-ups Complete, No Duplicate Claim, Discount Approved, Docs Uploaded, DP Verified.
Actions: Approve / Return for Revision / Reject / Escalate to CEO.

### 3. Finance Verification Module
**Route:** `/incentives/finance` (Finance role)
Verifies Collection, Costing, GP, Margin, Budget, Previous Incentives. Computes Estimated/Advance/Remaining Incentive.

### 4. CEO Approval Module
**Route:** `/incentives/executive` (CEO role)
Triggers: GP below minimum, large discount, incentive exceeds limit, strategic client, exception request.

### 5. Automatic Incentive Computation Engine
`incentiveComputationService.ts` — Estimated GP → Actual GP → Advance → Final → Remaining Balance → Tax. No manual override fields.

### 6. KPI Monitoring Module
**Route:** `/kpi` — Daily/Weekly/Monthly/Quarterly/Annual tracking of Calls, Meetings, Site Surveys, Quotations, Proposal Value, Collection, Conversion Rate, Repeat/Referral Clients, Avg GP, Discount %, Response Time.

### 7. Policy Center
**Route:** `/policy-center` — Searchable Sales Manual, Pricing/Discount/Incentive Policy, Quotation Guide, Sales/CRM SOP, ISO Procedures. Source of truth for Module 5's rate tables and for the AI Knowledge Chat citations.

### 8. Help Center
**Route:** `/help` — Video tutorials, guides, FAQs, sample incentive requests, flowcharts, troubleshooting, announcements.

### 9. AI Knowledge Chat
**Route:** `/ai-knowledge` — Must cite the exact Policy Center section before answering; retrieval-grounded only.

### 10. Dedicated Reports Module
**Route:** `/reports` — Sidebar currently only has generic "Sales Reports"/"Admin Reports" links. Need: Sales, GP, Collection, Discount, Incentive, KPI, Lead, Lost Sales, Marketing reports, exportable to PDF/Excel.

### 11. Account Monitoring additions
Add Warranty, Preventive Maintenance schedule, Contract Renewals, Cross-selling flags to the CRM company/contact timeline.

### 12. Full Audit Trail Fields
Confirm `auditLogStore.ts` logs User, Date, Time, Previous Value, New Value, IP Address on every action; archive-only, no hard delete.

---

## PART B — From Master Blueprint v1.2 (not covered by SPIMS)

### 13. Bidding & PhilGEPS Management
**Route:** `/bidding` | **Tables:** `bids`, `bid_documents`, `philgeps_opportunities`
Track: PhilGEPS opportunities, bid invitations, bid documents, eligibility requirements, submission deadlines, bid status/amount, winning probability, results, award notices, post-award requirements.
Features: bid calendar, document checklist, compliance tracking, team assignments, reminders, bid history, competitor tracking.
AI support: bid analysis, requirement checking, document prep, deadline reminders, opportunity matching, bid summary generation.

### 14. SEO/GEO Command Center
**Route:** `/seo-geo` | **Tables:** `seo_keywords`, `geo_prompts`, `competitors`, `brands`
Monitor Google rankings, AI-recommendation visibility, competitors, keywords, backlinks, reviews. Track AA2000 + partner brands (Ajax, Dahua, Edwards, Honeywell, Hikvision, Bosch). Generates improvement recommendations.

### 15. Real Service Management (PMS/CMS)
**Note:** current sidebar "PMS & CMS" link just points to the generic Requests/ticketing page — not true service management.
Needs: Preventive Maintenance schedules, Corrective Maintenance tickets, Warranty tracking, Technician assignment, Service reports, Customer service history, special FDAS maintenance contract handling.

### 16. Knowledge Base (technical, distinct from Policy Center)
**Route:** `/knowledge-base` — Technical manuals, installation standards, Fire Code references, product documentation, company SOPs, training materials, bidding guidelines, PhilGEPS procedures, marketplace posting guidelines. AI-searchable.

### 17. Facebook Marketplace & Social Lead Generation
Extend Marketing module: post products/services to FB Marketplace, search FB groups/pages for leads, track FB inquiries and lead forms, monitor comments/responses, auto-assign leads to sales staff, log conversations.
**Tables:** `marketplace_listings`, `marketplace_inquiries`

### 18. Multi-Agent AI Agent Center
Current `AIAgentsPage` needs to support named agents each with their own schedule, memory, reports, activity log: CEO Assistant, SEO/GEO Agent, Sales Coach, Marketing Agent, Lead Finder, Bid Assistant, Project Monitor, Service Coordinator, Competitor Intelligence, Proposal Writer, Customer Support, Executive Reporting.
Suggested cadences: Daily (SEO/GEO monitoring, FB lead search, PhilGEPS check, content gen, KPI review), Weekly (exec report, competitor analysis, website/AI-visibility audit), Monthly (business review, strategy recs, revenue forecast, conversion/bidding analysis).

### 19. Business Intelligence Module
Executive reports, revenue forecasts, sales trends, service KPIs, marketing ROI, employee productivity, AI visibility score, lead source performance, bidding performance. (`AdminAnalyticsPage`/`DashboardBuilderPage` exist but scope vs. this list needs confirming.)

### 20. Website Integration Hooks
Sync blog posts, publish approved content, capture inquiry forms, update case studies, display testimonials, track website analytics, support AI-powered site search.
**Tables:** `case_studies`, `blog_posts`, `reviews`, `website_pages`

### 21. Security Hardening
Confirm/add: Multi-Factor Authentication, encrypted API key storage, automated backups (RBAC + RLS + audit logs already implied by existing `audit-logs` module).

### 22. Future Modules (v1.2 roadmap, not urgent)
Inventory, Purchasing, Accounting integration, Mobile technician app, Customer portal, Supplier portal, Contractor portal, AI Voice Assistant, AI Document Reader, AI Proposal Generator, AI Compliance Checker, AI Bid Analyzer, FB lead scraper assistant, Marketplace automation assistant.

---

## PART C — NEW: AA2000 Product & Consumables Search Engine

**Route:** `/product-search` | **Store:** `productCatalogStore.ts`
*(Overlaps with v1.2's `Products` table — this fleshes it out.)*

### Data Model
**`products`**
| Field | Notes |
|---|---|
| id, sku, name, category | category = Product vs Consumable |
| subcategory | CCTV, Access Control, Networking, Fire/Alarm, Structured Cabling, Power |
| brand/supplier | Ruijie, IoT Philippines, Ajax, Dahua, Hikvision, Bosch, Honeywell, Edwards, etc. |
| specifications (JSON) | flexible key-value spec sheet per category |
| datasheet_url / image_url | |
| compatible_with[] | linked product IDs (cable ↔ connector, camera ↔ NVR) |
| tags[] | search boosters |

**Consumables examples:** fiber optic cable (core count, mode, jacket, length), Cat6/6A/5e cable (shielded/length/color), UPS/battery backup (VA rating, battery type, runtime), connectors, patch panels, conduits, mounting hardware.

### Features
- Full-text search (name, SKU, spec values, tags) + faceted filters (category → subcategory → brand → spec attributes)
- Spec comparison view (2–3 items side by side)
- "Often paired with" compatibility suggestions
- Quick-add hook into Quotation App / Site Survey App via shared product ID (integration only, no duplication)
- Admin: bulk CSV/Excel import, category/spec-template builder (no-code new spec fields), supplier tagging for the 2026 company profile partner mapping

### Stack Fit
Zustand store matching existing `modules/*Store.ts` pattern; Supabase table with Postgres full-text search (`tsvector`) once Supabase resumes, or localStorage/JSON in the interim (consistent with NexTech's deferred-Supabase approach). New "Catalog" sidebar section.

---
*Merged report for integration planning into AA2000 Connect (React/Zustand/Supabase-pending architecture).*