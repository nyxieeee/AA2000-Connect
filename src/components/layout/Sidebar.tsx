import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  MessageSquare,
  Megaphone,
  Zap,
  Bot,
  BarChart3,
  Building2,
  ListChecks,
  FileText,
  Calendar,
  MessageCircle,
  Bell,
  FileInput,
  ClipboardList,
  BarChart4,
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
  ChevronRight,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSidebarStore } from '../../stores/sidebarStore';
import { cn } from '../../utils/cn';

const navGroups = [
  {
    label: 'Sales',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Contacts', path: '/contacts' },
      { icon: Building2, label: 'Accounts', path: '/companies' },
      { icon: ClipboardList, label: 'PMS & CMS', path: '/requests' },
      { icon: FolderKanban, label: 'Projects', path: '/projects' },
      { icon: Target, label: 'Pipeline', path: '/pipeline' },
      { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
    ],
  },
  {
    label: 'Marketing & Automation',
    items: [
      { icon: Megaphone, label: 'Marketing', path: '/marketing/social-planner' },
      { icon: Zap, label: 'Automation', path: '/workflows' },
      { icon: Bot, label: 'AI Agents', path: '/ai-agents' },
    ],
  },
  {
    label: 'Lead Management',
    items: [
      { icon: UserPlus, label: 'Lead Capture', path: '/leads' },
      { icon: GitBranch, label: 'Lead Assignment', path: '/lead-assignment' },
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
    label: 'Admin',
    items: [
      { icon: Shield, label: 'Admin Panel', path: '/admin' },
      { icon: BarChart3, label: 'Sales Reports', path: '/analytics' },
      { icon: BarChart4, label: 'Admin Reports', path: '/admin-analytics' },
      { icon: FileSignature, label: 'Contracts', path: '/contracts' },
      { icon: Clock, label: 'Response Times', path: '/sla' },
      { icon: ClipboardList, label: 'Activity History', path: '/audit-logs' },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { collapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-surface-border transition-all duration-300 z-50 flex flex-col shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-24 flex flex-col justify-center px-8 border-b border-surface-border mb-2">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-brand-blue to-navy-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/10 group-hover:scale-105 transition-transform duration-500">
             <span className="font-semibold text-xl tracking-tighter">A</span>
          </div>
          {!collapsed && (
            <div className="fade-in flex flex-col">
              <span className="text-xl font-semibold text-navy-900 tracking-[-0.05em] leading-none">AA2000</span>
              <span className="text-[10px] font-light text-slate-400 uppercase tracking-[0.4em] mt-1.5 leading-tight">Connect</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, gi) => (
          <div key={gi} className="py-1">
            {!collapsed && gi > 0 && <div className="px-2 pt-3 pb-0.5"><div className="h-px bg-surface-border" /></div>}
            {!collapsed && (
              <div className="px-4 pt-3 pb-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em]">{group.label}</span>
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-brand-blue/10 text-brand-blue font-semibold"
                    : "text-slate-500 hover:text-navy-900 hover:bg-slate-50",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-navy-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-border space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
            isActive
              ? "bg-brand-blue/10 text-brand-blue font-semibold"
              : "text-slate-500 hover:text-navy-900 hover:bg-slate-50",
            collapsed && "justify-center px-0"
          )}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </NavLink>

        <button
          onClick={toggle}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 w-full text-slate-500 hover:text-navy-900 hover:bg-slate-50",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} className="shrink-0" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
