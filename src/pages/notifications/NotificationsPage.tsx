import { Bell, CheckCheck, MailOpen, AlertCircle, TrendingUp, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNotificationsStore } from '../../stores/modules/notificationsStore';
import { AnimatedPage, AnimatedList } from '../../components/ui/AnimatedPage';

const ICON_MAP: Record<string, any> = {
  email_opened: MailOpen,
  link_clicked: TrendingUp,
  lead_reengaged: AlertCircle,
  deal_update: TrendingUp,
  message: MessageSquare,
  document: FileText,
};

const COLOR_MAP: Record<string, string> = {
  email_opened: 'text-emerald-600 bg-emerald-50',
  link_clicked: 'text-blue-600 bg-blue-50',
  lead_reengaged: 'text-amber-600 bg-amber-50',
  deal_update: 'text-purple-600 bg-purple-50',
  message: 'text-brand-blue bg-brand-blue/10',
  document: 'text-rose-600 bg-rose-50',
};

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, deleteNotification } = useNotificationsStore();

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Stay updated on leads, deals, and team activity</p>
        </div>
        <button onClick={markAllRead} className="px-3 py-2 text-xs font-semibold text-slate-600 border border-surface-border rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5">
          <CheckCheck size={14} /> Mark All Read
        </button>
      </div>

      <AnimatedList className="space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
            <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">You'll see updates here when leads open emails, click links, or re-engage</p>
          </div>
        )}
        {sorted.map(notif => {
          const Icon = ICON_MAP[notif.type] || Bell;
          const colorClass = COLOR_MAP[notif.type] || 'text-slate-600 bg-slate-50';
          return (
            <div key={notif.id}
              onClick={() => markRead(notif.id)}
              className={cn('glass-card p-4 flex items-start gap-3 cursor-pointer transition-all hover:border-brand-blue/20 group', !notif.read && 'border-l-4 border-l-brand-blue')}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorClass)}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', notif.read ? 'text-navy-900' : 'text-navy-900 font-bold')}>{notif.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                <p className="text-[9px] text-slate-400 mt-1">{notif.createdAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && <div className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />}
                <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </AnimatedList>
    </AnimatedPage>
  );
}
