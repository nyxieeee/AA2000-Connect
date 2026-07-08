import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle2, RotateCcw, XCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useIncentivesStore } from '../../stores/modules/incentivesStore';

const GM_LABELS: Record<string, string> = {
  crmUpdated: 'CRM Updated', clientOwnershipVerified: 'Client Ownership Verified',
  followUpsComplete: 'Follow-ups Complete', noDuplicateClaim: 'No Duplicate Claim',
  discountApproved: 'Discount Approved', docsUploaded: 'Docs Uploaded', dpVerified: 'DP Verified',
};

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

const IncentiveApprovalsPage = () => {
  const { requests, updateRequest, updateStatus } = useIncentivesStore();
  const pendingApproval = requests.filter(r => ['submitted', 'gm_review'].includes(r.status));
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const handleChecklistToggle = (reqId: string, key: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    const updated = { ...req.gmChecklist, [key]: !req.gmChecklist[key] };
    updateRequest(reqId, { gmChecklist: updated });
  };

  const allChecked = (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    return req ? Object.values(req.gmChecklist).every(Boolean) : false;
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><ClipboardCheck className="text-brand-blue" size={28} /> GM Approvals</h1>
          <p className="text-sm text-slate-400 -mt-4">Review and approve incentive requests as Team Leader / General Manager</p>
        </div>

        {pendingApproval.length === 0 && (
          <div className="text-center py-16 glass-card">
            <CheckCircle2 className="mx-auto text-emerald-300 mb-4" size={48} />
            <p className="text-sm text-slate-400 font-medium">No pending approvals</p>
          </div>
        )}

        {pendingApproval.map((req, i) => (
          <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide">{req.quotationRef} — {req.salespersonName}</h3>
                <p className="text-xs text-slate-400 mt-1">PO: {req.poRef} • Contract: {req.contractRef}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-navy-900">{fmt(req.estimatedIncentive)}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Est. Incentive</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="mb-6">
              <h4 className="sub-title mb-3">Approval Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(GM_LABELS).map(([key, label]) => (
                  <label key={key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${req.gmChecklist[key] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <input type="checkbox" checked={req.gmChecklist[key] || false} onChange={() => handleChecklistToggle(req.id, key)} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-200" />
                    <span className={`text-xs font-medium ${req.gmChecklist[key] ? 'text-emerald-700' : 'text-slate-600'}`}>{label}</span>
                    {req.gmChecklist[key] && <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Financial details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 rounded-xl">
              <div><span className="sub-title">GP</span><p className="text-sm font-bold">{fmt(req.grossProfit)}</p></div>
              <div><span className="sub-title">Collection</span><p className="text-sm font-bold">{req.collectionPercent}%</p></div>
              <div><span className="sub-title">DP</span><p className="text-sm font-bold">{fmt(req.downPayment)}</p></div>
              <div><span className="sub-title">Discount</span><p className="text-sm font-bold">{req.discountHistory || 'None'}</p></div>
            </div>

            {/* Remarks */}
            <div className="mb-4">
              <label className="sub-title">GM Remarks</label>
              <input className="input-field" placeholder="Add remarks..." value={remarks[req.id] || req.gmRemarks} onChange={e => setRemarks(r => ({ ...r, [req.id]: e.target.value }))} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {!allChecked(req.id) && (
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Complete checklist to approve</span>
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => { updateRequest(req.id, { gmRemarks: remarks[req.id] || '' }); updateStatus(req.id, 'rejected'); }} className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center gap-1.5"><XCircle size={12} /> Reject</button>
                <button onClick={() => { updateRequest(req.id, { gmRemarks: remarks[req.id] || '' }); updateStatus(req.id, 'draft'); }} className="px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all flex items-center gap-1.5"><RotateCcw size={12} /> Return</button>
                {req.specialApprovalRequired ? (
                  <button disabled={!allChecked(req.id)} onClick={() => { updateRequest(req.id, { gmRemarks: remarks[req.id] || '' }); updateStatus(req.id, 'ceo_review'); }} className="px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-orange-100 transition-all disabled:opacity-50 flex items-center gap-1.5"><ArrowUpRight size={12} /> Escalate to CEO</button>
                ) : (
                  <button disabled={!allChecked(req.id)} onClick={() => { updateRequest(req.id, { gmRemarks: remarks[req.id] || '' }); updateStatus(req.id, 'finance_review'); }} className="premium-button text-[9px] disabled:opacity-50 flex items-center gap-1.5"><CheckCircle2 size={12} /> Approve</button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default IncentiveApprovalsPage;
