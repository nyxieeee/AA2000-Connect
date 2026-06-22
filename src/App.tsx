import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
