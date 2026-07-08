import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  MessageSquare,
  Megaphone,
  Zap,
  Bot,
  Building2,
  ListChecks,
  FileText,
  Calendar,
  MessageCircle,
  Bell,
  FileInput,
  ClipboardList,
  Search,
  UserPlus,
  GitBranch,
  Eye,
  Share2,
  Play,
  FileSignature,
  Clock,
  Lightbulb,
  Settings,
  Shield,
  ChevronLeft,
  DollarSign,
  ClipboardCheck,
  Calculator,
  Crown,
  Gauge,
  BookOpen,
  HelpCircle,
  FileBarChart,
  Gavel,
  Globe,
  Wrench,
  Library,
  Store,
  Brain,
  Package,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../../stores/authStore';
import { cn } from '../../utils/cn';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  roles?: UserRole[]; // If set, only these roles can see this item. If unset, visible to all.
}

interface NavGroup {
  label: string;
  roles?: UserRole[]; // If set, entire group hidden unless user has one of these roles
  items: NavItem[];
}

const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin'];
const MANAGER_PLUS: UserRole[] = ['super_admin', 'admin', 'sales_manager', 'team_leader', 'ceo'];
const SALES_ALL: UserRole[] = ['super_admin', 'admin', 'sales_manager', 'sales_rep', 'team_leader', 'ceo'];
const FINANCE_ROLES: UserRole[] = ['super_admin', 'admin', 'finance'];
const EXEC_ROLES: UserRole[] = ['super_admin', 'admin', 'ceo'];

const navGroups: NavGroup[] = [
  {
    label: 'Sales',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Contacts', path: '/contacts' },
      { icon: Building2, label: 'Accounts', path: '/companies' },
      { icon: Wrench, label: 'PMS & CMS', path: '/service-management' },
      { icon: FolderKanban, label: 'Projects', path: '/projects' },
      { icon: Target, label: 'Pipeline', path: '/pipeline' },
      { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
    ],
  },
  {
    label: 'Incentives',
    roles: SALES_ALL,
    items: [
      { icon: DollarSign, label: 'Incentive Requests', path: '/incentives' },
      { icon: ClipboardCheck, label: 'GM Approvals', path: '/incentives/approvals', roles: MANAGER_PLUS },
      { icon: Calculator, label: 'Finance Review', path: '/incentives/finance', roles: FINANCE_ROLES },
      { icon: Crown, label: 'Executive Review', path: '/incentives/executive', roles: EXEC_ROLES },
    ],
  },
  {
    label: 'Marketing & Automation',
    items: [
      { icon: Megaphone, label: 'Marketing', path: '/marketing/social-planner' },
      { icon: Zap, label: 'Automation', path: '/workflows' },
      { icon: Bot, label: 'AI Agents', path: '/ai-agents' },
      { icon: Store, label: 'FB Marketplace', path: '/marketplace', roles: [...MANAGER_PLUS, 'sales_rep'] },
    ],
  },
  {
    label: 'Lead Management',
    items: [
      { icon: UserPlus, label: 'Lead Capture', path: '/leads' },
      { icon: GitBranch, label: 'Lead Assignment', path: '/lead-assignment', roles: MANAGER_PLUS },
      { icon: Search, label: 'Company Research', path: '/company-research' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { icon: Eye, label: 'Client Activity', path: '/buying-signals' },
      { icon: Share2, label: 'Org Chart', path: '/org-chart' },
      { icon: Play, label: 'Follow-ups', path: '/sequences' },
      { icon: Lightbulb, label: 'AI Recommendations', path: '/ai-recommendations' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: ListChecks, label: 'Tasks', path: '/tasks' },
      { icon: FileText, label: 'Documents', path: '/documents' },
      { icon: Calendar, label: 'Meetings', path: '/meetings' },
      { icon: MessageCircle, label: 'Team Chat', path: '/chat' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
      { icon: FileInput, label: 'Web Forms', path: '/forms' },
    ],
  },
  {
    label: 'Intelligence',
    roles: MANAGER_PLUS,
    items: [
      { icon: Gauge, label: 'KPI Monitor', path: '/kpi' },
      { icon: FileBarChart, label: 'Reports', path: '/reports' },
      { icon: Globe, label: 'SEO / GEO', path: '/seo-geo', roles: ADMIN_ROLES },
      { icon: Brain, label: 'Business Intel', path: '/business-intelligence', roles: EXEC_ROLES },
      { icon: Bot, label: 'Ato (AI)', path: '/ai-knowledge' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { icon: Gavel, label: 'Bidding / PhilGEPS', path: '/bidding', roles: MANAGER_PLUS },
      { icon: BookOpen, label: 'Policy Center', path: '/policy-center' },
      { icon: Library, label: 'Knowledge Base', path: '/knowledge-base' },
      { icon: HelpCircle, label: 'Help Center', path: '/help' },
      { icon: Globe, label: 'Website', path: '/website', roles: ADMIN_ROLES },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { icon: Package, label: 'Product Search', path: '/product-search' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Shield, label: 'Admin Panel', path: '/admin', roles: ADMIN_ROLES },
      { icon: FileSignature, label: 'Contracts', path: '/contracts', roles: ['super_admin', 'admin', 'ceo', 'team_leader'] },
      { icon: Clock, label: 'Response Times', path: '/sla', roles: ['super_admin', 'admin', 'ceo', 'team_leader'] },
      { icon: ClipboardList, label: 'Activity History', path: '/audit-logs', roles: ADMIN_ROLES },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const userRole = user?.role || 'sales_rep';

  const isVisible = (roles?: UserRole[]) => !roles || roles.includes(userRole);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full bg-white border-r border-surface-border w-64 z-50 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-24 flex flex-col justify-center px-8 border-b border-surface-border mb-2">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-brand-blue to-navy-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/10 group-hover:scale-105 transition-transform duration-500">
             <span className="font-semibold text-xl tracking-tighter">A</span>
          </div>
          <div className="fade-in flex flex-col">
            <span className="text-xl font-semibold text-navy-900 tracking-[-0.05em] leading-none">AA2000</span>
            <span className="text-[10px] font-light text-slate-400 uppercase tracking-[0.4em] mt-1.5 leading-tight">Connect</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, gi) => {
          if (!isVisible(group.roles)) return null;
          const visibleItems = group.items.filter((item) => isVisible(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} className="py-1">
              {gi > 0 && <div className="px-2 pt-3 pb-0.5"><div className="h-px bg-surface-border" /></div>}
              <div className="px-4 pt-3 pb-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em]">{group.label}</span>
              </div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-brand-blue/10 text-brand-blue font-semibold"
                      : "text-slate-500 hover:text-navy-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-border space-y-1">
        {/* User info */}
        {user && (
          <div className="px-4 py-2 mb-1">
            <p className="text-xs font-bold text-navy-900 truncate">{user.name}</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
          </div>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
            isActive
              ? "bg-brand-blue/10 text-brand-blue font-semibold"
              : "text-slate-500 hover:text-navy-900 hover:bg-slate-50"
          )}
        >
          <Settings size={18} className="shrink-0" />
          <span className="text-sm">Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <ChevronLeft size={18} className="shrink-0" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};
