import { useState } from 'react';
import { Plus, Trash2, FileText, AlertCircle, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useContractsStore } from '../../stores/modules/contractsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const statusColors: Record<string, string> = {
  draft: 'text-slate-500 bg-slate-100',
  active: 'text-emerald-600 bg-emerald-50',
  expiring: 'text-amber-600 bg-amber-50',
  expired: 'text-rose-600 bg-rose-50',
  terminated: 'text-slate-500 bg-slate-100',
};

export default function ContractsPage() {
  const { contracts, addContract, updateContract, deleteContract } = useContractsStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ contractNumber: '', type: 'service' as const, status: 'draft' as const, startDate: '', endDate: '', value: 0, description: '', terms: '', renewalAlertDays: 30, dealId: '', contactId: '', companyId: '' });

  const filtered = contracts.filter(c => !search || c.contractNumber.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.contractNumber.trim()) return;
    addContract(form);
    setForm({ contractNumber: '', type: 'service', status: 'draft', startDate: '', endDate: '', value: 0, description: '', terms: '', renewalAlertDays: 30, dealId: '', contactId: '', companyId: '' });
    setShowForm(false);
  };

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = contracts.filter(c => {
    if (c.status !== 'active') return false;
    const endDate = new Date(c.endDate);
    return endDate > now && endDate <= thirtyDaysFromNow;
  });

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Contracts & Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage service agreements, contracts, and renewals</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Contract
        </button>
      </div>

      {/* Expiring alerts */}
      {expiringSoon.length > 0 && (
        <div className="px-4 py-3 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="text-xs font-semibold">{expiringSoon.length} contract(s) expiring within 30 days</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(['active', 'expiring', 'expired', 'draft'] as const).map(s => (
          <div key={s} className="glass-card p-4">
            <p className="text-xs text-slate-500 capitalize">{s === 'expiring' ? 'Expiring Soon' : s}</p>
            <p className="text-lg font-bold text-navy-900">{contracts.filter(c => s === 'expiring' ? expiringSoon.includes(c) : c.status === s).length}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contracts..." className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
      </div>

      {showForm && (
        <div className="glass-card p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={form.contractNumber} onChange={e => setForm(p => ({ ...p, contractNumber: e.target.value }))} placeholder="Contract # *" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'service' | 'product' | 'lease' }))} className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
              <option value="service">Service</option><option value="product">Product</option><option value="lease">Lease</option>
            </select>
            <input value={form.value} onChange={e => setForm(p => ({ ...p, value: parseInt(e.target.value) || 0 }))} type="number" placeholder="Value (₱)" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} type="date" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} type="date" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={form.renewalAlertDays} onChange={e => setForm(p => ({ ...p, renewalAlertDays: parseInt(e.target.value) || 30 }))} type="number" placeholder="Renewal alert (days)" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
          </div>
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 text-xs font-bold text-white bg-brand-blue rounded-lg">Save Contract</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 text-xs font-semibold text-slate-500">Cancel</button>
          </div>
        </div>
      )}

      <AnimatedList>
      <div className="space-y-2">
        {filtered.map(c => (
          <AnimatedListItem key={c.id}>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-slate-50"><FileText size={18} className="text-slate-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-navy-900">{c.contractNumber}</p>
                <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', statusColors[c.status])}>{c.status}</span>
              </div>
              <p className="text-xs text-slate-500">{c.type} · ₱{c.value.toLocaleString()} · {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={c.status} onChange={e => updateContract(c.id, { status: e.target.value as 'draft' | 'active' | 'expiring' | 'expired' | 'terminated' })} className="px-2 py-1 text-[10px] bg-slate-50 border border-surface-border rounded-lg outline-none">
                {['draft', 'active', 'expiring', 'expired', 'terminated'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => deleteContract(c.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
          </AnimatedListItem>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12"><FileText size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} /><p className="text-sm text-slate-500 font-medium">No contracts yet</p></div>
        )}
      </div>
      </AnimatedList>
    </div>
    </AnimatedPage>
  );
}
