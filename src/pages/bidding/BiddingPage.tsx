import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Calendar, FileCheck, Users, Clock, Plus, Target, DollarSign, FileText, Trash2, X } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useBiddingStore, type BidStatus, type Bid } from '../../stores/modules/biddingStore';

const STATUS_STYLES: Record<BidStatus, string> = {
  identified: 'bg-slate-100 text-slate-600',
  preparing: 'bg-blue-50 text-blue-600',
  submitted: 'bg-purple-50 text-purple-600',
  under_evaluation: 'bg-amber-50 text-amber-600',
  awarded: 'bg-emerald-50 text-emerald-600',
  lost: 'bg-rose-50 text-rose-600',
  cancelled: 'bg-slate-100 text-slate-400',
};

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH');

const BiddingPage = () => {
  const { bids, addBid, updateBid, deleteBid } = useBiddingStore();
  const [filter, setFilter] = useState<BidStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    projectName: '',
    philgepsRef: '',
    procuringEntity: '',
    category: 'goods' as Bid['category'],
    estimatedBudget: '',
    bidAmount: '',
    submissionDeadline: new Date().toISOString().split('T')[0],
    openingDate: new Date().toISOString().split('T')[0],
    status: 'preparing' as BidStatus,
    winProbability: '50',
    assignedTeam: '',
    competitors: '',
    remarks: '',
  });

  const filtered = filter === 'all' ? bids : bids.filter(b => b.status === filter);

  const stats = {
    total: bids.length,
    active: bids.filter(b => ['preparing', 'submitted', 'under_evaluation'].includes(b.status)).length,
    totalValue: bids.reduce((a, b) => a + b.bidAmount, 0),
    avgWinProb: bids.length > 0 ? Math.round(bids.reduce((a, b) => a + b.winProbability, 0) / bids.length) : 0,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName || !form.procuringEntity) return;

    addBid({
      projectName: form.projectName,
      philgepsRef: form.philgepsRef,
      procuringEntity: form.procuringEntity,
      category: form.category,
      estimatedBudget: Number(form.estimatedBudget) || 0,
      bidAmount: Number(form.bidAmount) || 0,
      submissionDeadline: form.submissionDeadline,
      openingDate: form.openingDate,
      status: form.status,
      winProbability: Number(form.winProbability) || 50,
      assignedTeam: form.assignedTeam ? form.assignedTeam.split(',').map(s => s.trim()) : ['Anna Reyes'],
      competitors: form.competitors ? form.competitors.split(',').map(s => s.trim()) : [],
      result: '',
      remarks: form.remarks,
      documents: [
        { id: 'bd-1', name: 'PhilGEPS Registration Certificate', type: 'eligibility', status: 'prepared', required: true },
        { id: 'bd-2', name: 'SEC Registration', type: 'legal', status: 'prepared', required: true },
        { id: 'bd-3', name: 'Bid Proposal Forms', type: 'technical', status: 'pending', required: true },
        { id: 'bd-4', name: 'Financial Schedule document', type: 'financial', status: 'pending', required: true },
      ],
    });

    setForm({
      projectName: '',
      philgepsRef: '',
      procuringEntity: '',
      category: 'goods',
      estimatedBudget: '',
      bidAmount: '',
      submissionDeadline: new Date().toISOString().split('T')[0],
      openingDate: new Date().toISOString().split('T')[0],
      status: 'preparing',
      winProbability: '50',
      assignedTeam: '',
      competitors: '',
      remarks: '',
    });
    setShowModal(false);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3"><Gavel className="text-brand-blue" size={28} /> Bidding & PhilGEPS</h1>
            <p className="text-sm text-slate-400 -mt-4">Track bids, PhilGEPS opportunities, and procurement compliance</p>
          </div>
          <button onClick={() => setShowModal(true)} className="premium-button flex items-center gap-2">
            <Plus size={14} /> New Bid
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Bids', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Bids', value: stats.active, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Bid Value', value: fmt(stats.totalValue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg Win Probability', value: `${stats.avgWinProb}%`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card !p-5">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${s.bg}`}><s.icon size={16} className={s.color} /></div>
              </div>
              <p className="text-xl font-bold text-navy-900">{s.value}</p>
              <p className="sub-title mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>All</button>
          {Object.keys(STATUS_STYLES).map(s => (
            <button key={s} onClick={() => setFilter(s as BidStatus)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filter === s ? 'bg-navy-900 text-white' : STATUS_STYLES[s as BidStatus]}`}>{s.replace('_', ' ')}</button>
          ))}
        </div>

        {/* Bid cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <Gavel size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
              <p className="text-sm text-slate-500">No bids matching the selected stage</p>
            </div>
          ) : filtered.map((bid, i) => (
            <motion.div key={bid.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card hover-lift group relative">
              
              {/* Delete Icon */}
              <button 
                onClick={() => deleteBid(bid.id)}
                className="absolute top-4 right-4 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Bid"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex items-start justify-between mb-4 pr-6">
                <div>
                  <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide">{bid.projectName}</h3>
                  <p className="text-xs text-slate-400 mt-1">{bid.procuringEntity} {bid.philgepsRef && `• PhilGEPS: ${bid.philgepsRef}`}</p>
                </div>
                
                {/* Status Switcher Selector directly inside card */}
                <select 
                  value={bid.status}
                  onChange={(e) => updateBid(bid.id, { status: e.target.value as BidStatus })}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer ${STATUS_STYLES[bid.status]}`}
                >
                  {Object.keys(STATUS_STYLES).map(st => (
                    <option key={st} value={st} className="text-navy-950 bg-white font-sans">{st.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div><span className="sub-title">Budget</span><p className="text-sm font-bold text-navy-900">{fmt(bid.estimatedBudget)}</p></div>
                <div><span className="sub-title">Bid Amount</span><p className="text-sm font-bold text-brand-blue">{fmt(bid.bidAmount)}</p></div>
                <div><span className="sub-title">Deadline</span><p className="text-sm font-bold flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {bid.submissionDeadline}</p></div>
                <div><span className="sub-title">Win Prob.</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${bid.winProbability}%` }} /></div>
                    <span className="text-xs font-bold text-brand-blue">{bid.winProbability}%</span>
                  </div>
                </div>
                <div><span className="sub-title">Team</span><p className="text-xs font-medium text-slate-600">{bid.assignedTeam.join(', ')}</p></div>
              </div>

              {/* Document checklist */}
              <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100">
                <FileCheck size={12} className="text-slate-400" />
                {bid.documents.map(doc => (
                  <span key={doc.id} className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider ${doc.status === 'submitted' ? 'bg-emerald-50 text-emerald-600' : doc.status === 'prepared' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{doc.name.split(' ').slice(0, 2).join(' ')}</span>
                ))}
                {bid.competitors.length > 0 && (
                  <span className="ml-auto text-[9px] text-slate-400 font-medium flex items-center gap-1"><Users size={10} /> Competitors: {bid.competitors.join(', ')}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Bid Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-[560px] max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Gavel size={18} className="text-brand-blue" /> Deploy New Bid Request
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Project Name *</label>
                  <input required value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })}
                    type="text" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="e.g. FDAS and CCTV System replacement" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Procuring Entity *</label>
                    <input required value={form.procuringEntity} onChange={e => setForm({ ...form, procuringEntity: e.target.value })}
                      type="text" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="e.g. Quezon City Govt" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">PhilGEPS Ref #</label>
                    <input value={form.philgepsRef} onChange={e => setForm({ ...form, philgepsRef: e.target.value })}
                      type="text" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="e.g. PG-2026-09" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Est. Budget (PHP) *</label>
                    <input required value={form.estimatedBudget} onChange={e => setForm({ ...form, estimatedBudget: e.target.value })}
                      type="number" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="e.g. 5000000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Our Bid Amount (PHP)</label>
                    <input value={form.bidAmount} onChange={e => setForm({ ...form, bidAmount: e.target.value })}
                      type="number" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="e.g. 4800000" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as 'goods' | 'infrastructure' | 'consulting' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10">
                      <option value="goods">Goods</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="consulting">Consulting</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'identified' | 'preparing' | 'submitted' | 'under_evaluation' | 'awarded' | 'lost' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10">
                      <option value="identified">Identified</option>
                      <option value="preparing">Preparing</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_evaluation">Under Eval</option>
                      <option value="awarded">Awarded</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Win Prob %</label>
                    <input value={form.winProbability} onChange={e => setForm({ ...form, winProbability: e.target.value })}
                      type="number" min="0" max="100" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Submission Deadline</label>
                    <input value={form.submissionDeadline} onChange={e => setForm({ ...form, submissionDeadline: e.target.value })}
                      type="date" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Team</label>
                    <input value={form.assignedTeam} onChange={e => setForm({ ...form, assignedTeam: e.target.value })}
                      type="text" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="Comma separated, e.g. Ben Cruz" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Competitors</label>
                  <input value={form.competitors} onChange={e => setForm({ ...form, competitors: e.target.value })}
                    type="text" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" placeholder="Comma separated, e.g. SafeGuard PH" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Remarks</label>
                  <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                    rows={2} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 resize-none" placeholder="Special bid instructions..." />
                </div>

                <button type="submit" className="w-full mt-4 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-light transition-all shadow-sm">
                  Add Bid Opportunity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default BiddingPage;
