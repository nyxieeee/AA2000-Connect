import { useState } from 'react';
import { Search, Shield, Download } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuditLogStore } from '../../stores/modules/auditLogStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function AuditLogsPage() {
  const { logs } = useAuditLogStore();
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.tableName.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase())
  );

  const actionColors: Record<string, string> = {
    created: 'text-emerald-600 bg-emerald-50',
    updated: 'text-blue-600 bg-blue-50',
    deleted: 'text-rose-600 bg-rose-50',
    approved: 'text-emerald-600 bg-emerald-50',
    marked_lost: 'text-amber-600 bg-amber-50',
  };

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">System-wide change tracking for DPA compliance</p>
        </div>
        <button className="px-3 py-2 text-xs font-semibold text-slate-600 border border-surface-border rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5">
          <Download size={14} /> Export
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-9 pr-3 py-2 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
          <p className="text-sm text-slate-500 font-medium">No audit logs recorded</p>
          <p className="text-xs text-slate-400 mt-1">Actions performed in the system will appear here</p>
        </div>
      ) : (
        <AnimatedList className="glass-card overflow-hidden border border-surface-border">
          <div className="divide-y divide-surface-border">
            {filtered.map(log => (
              <AnimatedListItem key={log.id}>
                <div className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                  <div className={cn('px-2 py-0.5 text-[9px] font-bold rounded uppercase', actionColors[log.action] || 'text-slate-500 bg-slate-50')}>
                    {log.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-900">
                      <span className="font-bold">{log.userName}</span>
                      <span className="text-slate-500"> {log.action} </span>
                      <span className="font-medium">{log.tableName}</span>
                      {log.changes && <span className="text-slate-400 text-xs ml-1">— {log.changes}</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.occurredAt}</p>
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </div>
        </AnimatedList>
      )}
    </AnimatedPage>
  );
}
