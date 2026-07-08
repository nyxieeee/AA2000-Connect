import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Existing pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ContactsListPage from './pages/crm/ContactsListPage';
import ContactDetailPage from './pages/crm/ContactDetailPage';
import CompaniesListPage from './pages/crm/CompaniesListPage';
import PipelineBoardPage from './pages/pipelines/PipelineBoardPage';
import DealDetailPage from './pages/pipelines/DealDetailPage';
import RequestsPage from './pages/requests/RequestsPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import WorkflowBuilderPage from './pages/automation/WorkflowBuilderPage';
import UnifiedInboxPage from './pages/comms/UnifiedInboxPage';
import { MarketingLayout } from './pages/marketing/MarketingLayout';
import SocialPlannerPage from './pages/marketing/SocialPlannerPage';
import EmailCampaignsPage from './pages/marketing/EmailCampaignsPage';
import AIAutomationsPage from './pages/marketing/AIAutomationsPage';
import SalesPerformance from './pages/analytics/DashboardBuilderPage';
import AIAgentsPage from './pages/ai-agents/AIAgentsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import LoginPage from './pages/auth/LoginPage';
import TasksPage from './pages/tasks/TasksPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import MeetingsPage from './pages/meetings/MeetingsPage';
import ChatPage from './pages/chat/ChatPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AuditLogsPage from './pages/audit-logs/AuditLogsPage';
import AdminAnalyticsPage from './pages/admin-analytics/AdminAnalyticsPage';
import WebFormsPage from './pages/forms/WebFormsPage';
import AIRecommendationsPage from './pages/ai-recommendations/AIRecommendationsPage';
import CompanyResearchPage from './pages/research/CompanyResearchPage';
import BuyingSignalsPage from './pages/email-tracking/EmailTrackingPage';
import OrgChartPage from './pages/org-chart/OrgChartPage';
import SequencesPage from './pages/sequences/SequencesPage';
import ContractsPage from './pages/contracts/ContractsPage';
import SLAPage from './pages/sla/SLAPage';
import LeadsPage from './pages/leads/LeadsPage';
import LeadDetailPage from './pages/leads/LeadDetailPage';
import LeadAssignmentPage from './pages/leads/LeadAssignmentPage';

// New feature pages
import IncentivesPage from './pages/incentives/IncentivesPage';
import IncentiveApprovalsPage from './pages/incentives/IncentiveApprovalsPage';
import IncentiveFinancePage from './pages/incentives/IncentiveFinancePage';
import IncentiveExecutivePage from './pages/incentives/IncentiveExecutivePage';
import KPIPage from './pages/kpi/KPIPage';
import PolicyCenterPage from './pages/policy-center/PolicyCenterPage';
import HelpCenterPage from './pages/help/HelpCenterPage';
import AIKnowledgePage from './pages/ai-knowledge/AIKnowledgePage';
import ReportsPage from './pages/reports/ReportsPage';
import BiddingPage from './pages/bidding/BiddingPage';
import SEOGEOPage from './pages/seo-geo/SEOGEOPage';
import ServiceManagementPage from './pages/service/ServiceManagementPage';
import KnowledgeBasePage from './pages/knowledge-base/KnowledgeBasePage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import BusinessIntelligencePage from './pages/business-intelligence/BusinessIntelligencePage';
import WebsiteIntegrationPage from './pages/website/WebsiteIntegrationPage';
import ProductSearchPage from './pages/product-search/ProductSearchPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="contacts" element={<ContactsListPage />} />
              <Route path="contacts/:id" element={<ContactDetailPage />} />
              <Route path="companies" element={<CompaniesListPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="pipeline" element={<PipelineBoardPage />} />
              <Route path="pipeline/:id" element={<DealDetailPage />} />
              <Route path="workflows" element={<WorkflowBuilderPage />} />
              <Route path="inbox" element={<UnifiedInboxPage />} />
              <Route path="marketing" element={<MarketingLayout />}>
                <Route index element={<Navigate to="social-planner" replace />} />
                <Route path="social-planner" element={<SocialPlannerPage />} />
                <Route path="emails" element={<EmailCampaignsPage />} />
                <Route path="ai-automations" element={<AIAutomationsPage />} />
              </Route>
              <Route path="analytics" element={<SalesPerformance />} />
              <Route path="ai-agents" element={<AIAgentsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminPanelPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="forms" element={<WebFormsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="admin-analytics" element={<AdminAnalyticsPage />} />
              <Route path="company-research" element={<CompanyResearchPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="lead-assignment" element={<LeadAssignmentPage />} />
              <Route path="buying-signals" element={<BuyingSignalsPage />} />
              <Route path="org-chart" element={<OrgChartPage />} />
              <Route path="sequences" element={<SequencesPage />} />
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="sla" element={<SLAPage />} />
              <Route path="ai-recommendations" element={<AIRecommendationsPage />} />

              {/* New module routes */}
              <Route path="incentives" element={<IncentivesPage />} />
              <Route path="incentives/approvals" element={<IncentiveApprovalsPage />} />
              <Route path="incentives/finance" element={<IncentiveFinancePage />} />
              <Route path="incentives/executive" element={<IncentiveExecutivePage />} />
              <Route path="kpi" element={<KPIPage />} />
              <Route path="policy-center" element={<PolicyCenterPage />} />
              <Route path="help" element={<HelpCenterPage />} />
              <Route path="ai-knowledge" element={<AIKnowledgePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="bidding" element={<BiddingPage />} />
              <Route path="seo-geo" element={<SEOGEOPage />} />
              <Route path="service-management" element={<ServiceManagementPage />} />
              <Route path="knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="business-intelligence" element={<BusinessIntelligencePage />} />
              <Route path="website" element={<WebsiteIntegrationPage />} />
              <Route path="product-search" element={<ProductSearchPage />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
