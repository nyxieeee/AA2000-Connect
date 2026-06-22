import { useState } from 'react';
import { Plus, Trash2, Clock, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSLAStore } from '../../stores/modules/slaStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function SLAPage() {
  const { policies, entries, addPolicy, updatePolicy, deletePolicy, addEntry, resolveEntry } = useSLAStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', scope: 'lead' as const, responseMinutes: 30, escalationUserId: '', alertMessage: 'SLA breach: {{scope}} response time exceeded' });

  const filtered = policies.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addPolicy({ ...form, enabled: true, escalationUserId: form.escalationUserId || undefined });
    setForm({ name: '', scope: 'lead', responseMinutes: 30, escalationUserId: '', alertMessage: 'SLA breach: {{scope}} response time exceeded' });
    setShowForm(false);
  };

  const breached = entries.filter(e => e.status === 'breached');
  const withinSla = entries.filter(e => e.status === 'within_sla');

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">SLA Tracking & Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Set expected response times and get alerted when deadlines are missed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New SLA Policy
        </button>
      </div>

      {/* Stats */}
      <AnimatedList>
      <div className="grid grid-cols-3 gap-3">
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><CheckCircle2 size={18} className="text-emerald-600" /></div>
            <div><p className="text-xs text-slate-500">Within SLA</p><p className="text-lg font-bold text-navy-900">{withinSla.length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50"><AlertTriangle size={18} className="text-rose-600" /></div>
            <div><p className="text-xs text-slate-500">Breached</p><p className="text-lg font-bold text-navy-900">{breached.length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><Clock size={18} className="text-blue-600" /></div>
            <div><p className="text-xs text-slate-500">Policies</p><p className="text-lg font-bold text-navy-900">{policies.length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
      </div>
      </AnimatedList>

      {/* Policies */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900">SLA Policies</h2>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policies..." className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
          </div>
        </div>

        {showForm && (
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Policy name *" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
              <select value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value as any }))} className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none">
                <option value="lead">Lead Response</option><option value="ticket">Support Ticket</option><option value="approval">Approval</option><option value="deal">Deal Stage</option>
              </select>
              <input value={form.responseMinutes} onChange={e => setForm(p => ({ ...p, responseMinutes: parseInt(e.target.value) || 30 }))} type="number" placeholder="Response time (minutes)" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
              <input value={form.escalationUserId} onChange={e => setForm(p => ({ ...p, escalationUserId: e.target.value }))} placeholder="Escalate to user ID" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
            </div>
            <input value={form.alertMessage} onChange={e => setForm(p => ({ ...p, alertMessage: e.target.value }))} placeholder="Alert message" className="w-full px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg">Save Policy</button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500">Cancel</button>
            </div>
          </div>
        )}

        <AnimatedList>
        <div className="space-y-2">
          {filtered.map(p => (
            <AnimatedListItem key={p.id}>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <button onClick={() => updatePolicy(p.id, { enabled: !p.enabled })}>
                  {p.enabled ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} className="text-slate-300" />}
                </button>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{p.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{p.scope} · {p.responseMinutes} min response · {p.enabled ? 'Active' : 'Disabled'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  addEntry({ policyId: p.id, referenceId: `ref-${Date.now()}`, assignedTo: 'current-user', status: 'within_sla', deadline: new Date(Date.now() + p.responseMinutes * 60000).toISOString() });
                }} className="px-2 py-1 text-[10px] font-semibold text-brand-blue bg-brand-blue/5 rounded-lg">Test SLA</button>
                <button onClick={() => deletePolicy(p.id)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 size={12} /></button>
              </div>
            </div>
            </AnimatedListItem>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No policies defined</p>}
        </div>
        </AnimatedList>
      </div>

      {/* Active SLA entries */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-bold text-navy-900 mb-4">Active SLA Entries</h2>
        <div className="space-y-2">
          {entries.filter(e => e.status !== 'resolved').map(e => {
            const policy = policies.find(p => p.id === e.policyId);
            const deadline = new Date(e.deadline);
            const isBreached = deadline < new Date();
            return (
              <div key={e.id} className={cn('flex items-center justify-between p-3 rounded-xl', isBreached ? 'bg-rose-50' : 'bg-slate-50')}>
                <div className="flex items-center gap-3">
                  {isBreached ? <AlertTriangle size={16} className="text-rose-500" /> : <Clock size={16} className="text-slate-400" />}
                  <div>
                    <p className="text-xs font-semibold text-navy-900">{policy?.name || 'Unknown Policy'}</p>
                    <p className="text-[10px] text-slate-500">Deadline: {deadline.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', isBreached ? 'text-rose-600 bg-rose-100' : 'text-emerald-600 bg-emerald-50')}>
                    {isBreached ? 'BREACHED' : 'Within SLA'}
                  </span>
                  <button onClick={() => resolveEntry(e.id)} className="px-2 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg">Resolve</button>
                </div>
              </div>
            );
          })}
          {entries.filter(e => e.status !== 'resolved').length === 0 && <p className="text-xs text-slate-400 text-center py-4">No active SLA entries</p>}
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}
