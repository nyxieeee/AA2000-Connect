# AA2000 Connect — State Transition Models & Lifecycle Workflows

## 1. Overview

This document defines the formal State Transition Diagrams (finite state machines) governing the core lifecycle flows within **AA2000 Connect (CRM)**.

---

## 2. Deal & Pipeline State Transition Diagram

Tracks an enterprise commercial opportunity from initial site survey inquiry to contract closing.

```mermaid
stateDiagram-v2
    [*] --> LeadIn : Web Form / Inbound Lead

    LeadIn --> Qualified : Initial Qualification Met
    LeadIn --> Abandoned : Unresponsive / Duplicate

    Qualified --> SiteSurvey : Schedule Technical Inspection
    Qualified --> Lost : Budget Insufficient

    SiteSurvey --> ProposalSent : Bill of Materials (BOM) & Quotation Prepared
    SiteSurvey --> Lost : Client Cancelled Project

    ProposalSent --> Negotiation : Client Review & Commercial Discussion
    ProposalSent --> Lost : Competitor Selected / Price Barrier

    Negotiation --> Won : Contract Signed & PO Received
    Negotiation --> Lost : Deal Conceded

    Won --> HandoverToOperations : Trigger Project & PMS Provisioning
    Won --> [*]
    Lost --> [*]
    Abandoned --> [*]
```

---

## 3. 4-Tier Incentive & Commission Approval State Machine

Governs sales commission disbursements with strict multi-echelon separation of duties.

```mermaid
stateDiagram-v2
    [*] --> Draft : Sales Rep Initiates Claim

    Draft --> Submitted : Rep Attaches Cost Sheet & Submits
    
    state "GM 7-Point Compliance Review" as GMReview {
        Submitted --> GMReviewing : General Manager Opens Claim
        GMReviewing --> GMApproved : All 7 Checklist Items Verified
        GMReviewing --> RejectedByGM : Missing Documents / Uncollected Balance
    }

    state "Finance Verification" as FinReview {
        GMApproved --> FinanceReviewing : Finance Validates Collections
        FinanceReviewing --> FinanceVerified : Bank Receipts & GP Validated
        FinanceReviewing --> RejectedByFinance : Margin Discrepancy / Overdue AR
    }

    state "Executive CEO Signoff" as ExecReview {
        FinanceVerified --> CEOReviewing : CEO Evaluates Claim
        CEOReviewing --> CEOApproved : Executive Approval Granted
        CEOReviewing --> RejectedByCEO : Executive Override
    }

    CEOApproved --> Released : Payroll / Treasury Disburses Funds
    
    RejectedByGM --> Draft : Returned to Rep for Rectification
    RejectedByFinance --> Draft : Returned to Rep for Rectification
    RejectedByCEO --> Draft : Returned to Rep for Rectification
    
    Released --> [*]
```

---

## 4. Service Request (Ticket) & SLA Lifecycle

Governs warranty tickets, equipment failures, emergency fire panel callouts, and technician resolution.

```mermaid
stateDiagram-v2
    [*] --> New : Ingestion via Web Form / Phone / Rep

    New --> Assigned : Dispatch to Field Technician
    
    state InProgress {
        Assigned --> EnRoute : Technician Mobilized to Site
        EnRoute --> OnSiteInvestigation : Arrival at Facility
        OnSiteInvestigation --> PartsReplacement : Replacing Defective Device
        PartsReplacement --> CommissioningTest : Verifying Operation
    }

    InProgress --> Resolved : Client Technical Sign-off Obtained
    
    state SLA_Monitor <<choice>>
    InProgress --> SLA_Monitor : Real-time Clock Check
    SLA_Monitor --> Breached : Current Time > SLA Deadline
    SLA_Monitor --> InProgress : Time Remaining

    Breached --> EscalatedToManagement : Urgent Alert to Operations Head
    EscalatedToManagement --> Resolved : Emergency Technical Resolution

    Resolved --> Closed : 48-Hour Customer Inactivity or Satisfaction Confirmed
    Closed --> [*]
```

---

## 5. Lead Ingestion & Algorithmic Scoring Lifecycle

Illustrates lead state transitions as telemetry and algorithmic scoring engines update prospect temperature.

```mermaid
stateDiagram-v2
    [*] --> UnscoredIngestion : Capture from Web / Marketplace / Referral
    
    UnscoredIngestion --> DynamicScoringEngine : Run computeContactScore()
    
    state DynamicScoringEngine {
        [*] --> EvaluatingProfile : Check Company Link & VIP Tags
        EvaluatingProfile --> EvaluatingTelemetry : Process Form Submissions (+25) & Link Clicks (+20)
        EvaluatingTelemetry --> EvaluatingSignals : Assess Buying Signal Urgency (+15 to +25)
        EvaluatingSignals --> ScoreCalculated : Clamp (0-100) & Assign Grade
    }

    ScoreCalculated --> Cold : Score < 40 (Grade D)
    ScoreCalculated --> Nurturing : Score 40-59 (Grade C)
    ScoreCalculated --> WarmProspect : Score 60-74 (Grade B)
    ScoreCalculated --> HotLead : Score >= 75 (Grade A / A+)

    HotLead --> FastTrackAssignment : Automatic Territory Route to Rep
    WarmProspect --> SequenceEnrollment : Enroll in Automated Email Cadence
    Nurturing --> SequenceEnrollment : Monthly Newsletter / Product Bulletins
    Cold --> Archived : Re-evaluate after 90 days

    FastTrackAssignment --> ConvertedToDeal : Opportunity Created in Pipeline
    ConvertedToDeal --> [*]
    Archived --> [*]
```

---

## 6. PhilGEPS Public Bidding State Machine

Compliant with Republic Act 9184 (Philippine Government Procurement Reform Act).

```mermaid
stateDiagram-v2
    [*] --> OpportunityIdentified : Published PhilGEPS Tender Notice

    OpportunityIdentified --> EligibilityPreparation : Purchase Bid Documents & Review Terms of Reference (TOR)
    
    state EligibilityPreparation {
        [*] --> VerifyingClassA : Mayor's Permit, Tax Clearance, SEC, PhilGEPS Platinum
        VerifyingClassA --> TechnicalCompliance : NFCC, PCAB License, SLCC, Omnibus Sworn Statement
        TechnicalCompliance --> FinancialProposal : Calculate ABC Margin, Warranty BOM
    }

    EligibilityPreparation --> PreBidConference : Attend Mandatory Clarification Meeting
    PreBidConference --> FinalBidSubmission : Envelope 1 (Tech) & Envelope 2 (Financial) Sealed

    FinalBidSubmission --> BidOpening : Public Opening by Bids & Awards Committee (BAC)
    
    BidOpening --> DeclaredLCB : Lowest Calculated Bid (LCB) Achieved
    BidOpening --> Disqualified : Non-responsive or Higher Bid

    DeclaredLCB --> PostQualification : BAC Validates Legal Documents & On-site Inspection
    
    PostQualification --> NoticeOfAward : Post-qualification Passed
    PostQualification --> PostDisqualified : Verification Deficiency Identified

    NoticeOfAward --> ContractSigning : Post Performance Bond & Sign Contract
    ContractSigning --> HandoverToProjects : Mobilization to Project Site
    
    HandoverToProjects --> [*]
    Disqualified --> [*]
    PostDisqualified --> [*]
```
