import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, FileText, ChevronRight, Plus, Filter,
  Clock, CheckCircle2, AlertCircle, Send, X
} from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useIncentivesStore, type IncentiveStatus } from '../../stores/modules/incentivesStore';
import { useAuthStore } from '../../stores/authStore';

const STATUS_COLORS: Record<IncentiveStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-50 text-blue-600',
  gm_review: 'bg-amber-50 text-amber-600',
  finance_review: 'bg-purple-50 text-purple-600',
  ceo_review: 'bg-orange-50 text-orange-600',
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-rose-50 text-rose-600',
  released: 'bg-cyan-50 text-cyan-600',
};

const STATUS_LABELS: Record<IncentiveStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', gm_review: 'GM Review',
  finance_review: 'Finance Review', ceo_review: 'CEO Review',
  approved: 'Approved', rejected: 'Rejected', released: 'Released',
};

const FLOW_STEPS: IncentiveStatus[] = ['draft', 'submitted', 'gm_review', 'finance_review', 'ceo_review', 'approved', 'released'];

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

const IncentivesPage = () => {
  const { requests, addRequest, updateStatus } = useIncentivesStore();
  const user = useAuthStore(s => s.user);
  const [filter, setFilter] = useState<IncentiveStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    quotationRef: '', poRef: '', contractRef: '', downPayment: 0, grossProfit: 0,
    collectionPercent: 0, discountHistory: '', projectTurnedOver: false, docsComplete: false,
    specialApprovalRequired: false, remarks: '',
  });

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({
      ...form,
      salespersonId: user?.id || '1',
      salespersonName: user?.name || 'Unknown',
    });
    setShowForm(false);
    setForm({ quotationRef: '', poRef: '', contractRef: '', downPayment: 0, grossProfit: 0, collectionPercent: 0, discountHistory: '', projectTurnedOver: false, docsComplete: false, specialApprovalRequired: false, remarks: '' });
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <DollarSign className="text-brand-blue" size={28} />
              Incentive Requests
            </h1>
            <p className="text-sm text-slate-400 -mt-4">Submit and track your sales incentive requests</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="premium-button flex items-center gap-2">
            <Plus size={14} /> New Request
          </button>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>All ({requests.length})</button>
          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const count = requests.filter(r => r.status === key).length;
            return (
              <button key={key} onClick={() => setFilter(key as IncentiveStatus)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filter === key ? 'bg-navy-900 text-white' : `${STATUS_COLORS[key as IncentiveStatus]} hover:opacity-80`}`}>
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* New Request Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy-900 uppercase tracking-wide">New Incentive Request</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1"><label className="sub-title">Quotation Ref</label><input className="input-field" required value={form.quotationRef} onChange={e => setForm(f => ({ ...f, quotationRef: e.target.value }))} placeholder="QT-2026-XXXX" /></div>
              <div className="space-y-1"><label className="sub-title">PO Ref</label><input className="input-field" required value={form.poRef} onChange={e => setForm(f => ({ ...f, poRef: e.target.value }))} placeholder="PO-2026-XXXX" /></div>
              <div className="space-y-1"><label className="sub-title">Contract Ref</label><input className="input-field" required value={form.contractRef} onChange={e => setForm(f => ({ ...f, contractRef: e.target.value }))} placeholder="CT-2026-XXXX" /></div>
              <div className="space-y-1"><label className="sub-title">Down Payment (₱)</label><input className="input-field" type="number" required value={form.downPayment || ''} onChange={e => setForm(f => ({ ...f, downPayment: +e.target.value }))} /></div>
              <div className="space-y-1"><label className="sub-title">Gross Profit (₱)</label><input className="input-field" type="number" required value={form.grossProfit || ''} onChange={e => setForm(f => ({ ...f, grossProfit: +e.target.value }))} /></div>
              <div className="space-y-1"><label className="sub-title">Collection %</label><input className="input-field" type="number" min="0" max="100" required value={form.collectionPercent || ''} onChange={e => setForm(f => ({ ...f, collectionPercent: +e.target.value }))} /></div>
              <div className="space-y-1 md:col-span-2"><label className="sub-title">Discount History</label><input className="input-field" value={form.discountHistory} onChange={e => setForm(f => ({ ...f, discountHistory: e.target.value }))} placeholder="e.g. 5% volume discount" /></div>
              <div className="space-y-1"><label className="sub-title">Remarks</label><input className="input-field" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} /></div>
              <div className="flex items-center gap-6 md:col-span-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer"><input type="checkbox" checked={form.projectTurnedOver} onChange={e => setForm(f => ({ ...f, projectTurnedOver: e.target.checked }))} className="rounded border-slate-300" /> Project Turned Over</label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer"><input type="checkbox" checked={form.docsComplete} onChange={e => setForm(f => ({ ...f, docsComplete: e.target.checked }))} className="rounded border-slate-300" /> Docs Complete</label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer"><input type="checkbox" checked={form.specialApprovalRequired} onChange={e => setForm(f => ({ ...f, specialApprovalRequired: e.target.checked }))} className="rounded border-slate-300" /> Special Approval</label>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="premium-button flex items-center gap-2"><Send size={14} /> Submit Request</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Request Cards */}
        <div className="space-y-4">
          {filtered.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide">{req.quotationRef}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${STATUS_COLORS[req.status]}`}>{STATUS_LABELS[req.status]}</span>
                  </div>
                  <p className="text-xs text-slate-400">{req.salespersonName} • PO: {req.poRef} • Contract: {req.contractRef}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-navy-900">{fmt(req.estimatedIncentive)}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Est. Incentive</p>
                </div>
              </div>

              {/* Flow tracker */}
              <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
                {FLOW_STEPS.map((step, si) => {
                  const currentIndex = FLOW_STEPS.indexOf(req.status);
                  const isCompleted = si < currentIndex;
                  const isCurrent = si === currentIndex;
                  return (
                    <div key={step} className="flex items-center gap-1">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider whitespace-nowrap ${isCompleted ? 'bg-emerald-50 text-emerald-600' : isCurrent ? 'bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30' : 'bg-slate-50 text-slate-300'}`}>
                        {isCompleted ? <CheckCircle2 size={10} /> : isCurrent ? <Clock size={10} /> : <AlertCircle size={10} />}
                        {STATUS_LABELS[step]}
                      </div>
                      {si < FLOW_STEPS.length - 1 && <ChevronRight size={10} className="text-slate-200 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                <div><span className="sub-title">GP</span><p className="text-sm font-bold text-navy-900">{fmt(req.grossProfit)}</p></div>
                <div><span className="sub-title">DP</span><p className="text-sm font-bold text-navy-900">{fmt(req.downPayment)}</p></div>
                <div><span className="sub-title">Collection</span><p className="text-sm font-bold text-navy-900">{req.collectionPercent}%</p></div>
                <div><span className="sub-title">Advance</span><p className="text-sm font-bold text-emerald-600">{fmt(req.advanceIncentive)}</p></div>
                <div><span className="sub-title">Tax</span><p className="text-sm font-bold text-rose-500">{fmt(req.taxDeduction)}</p></div>
              </div>

              {/* Actions */}
              {req.status === 'draft' && (
                <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => updateStatus(req.id, 'submitted')} className="premium-button text-[9px] flex items-center gap-1.5"><Send size={12} /> Submit for Review</button>
                </div>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FileText className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-sm text-slate-400 font-medium">No incentive requests found</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default IncentivesPage;
