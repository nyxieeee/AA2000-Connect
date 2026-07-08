import { motion } from 'framer-motion';
import { Crown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useIncentivesStore } from '../../stores/modules/incentivesStore';

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

const IncentiveExecutivePage = () => {
  const { requests, updateRequest, updateStatus } = useIncentivesStore();
  const pending = requests.filter(r => r.status === 'ceo_review');

  const ESCALATION_REASONS = [
    { label: 'GP Below Minimum Threshold', check: (r: typeof requests[0]) => r.grossProfit < 100000 },
    { label: 'Large Discount Applied', check: (r: typeof requests[0]) => r.discountHistory.includes('10%') || r.discountHistory.includes('15%') || r.discountHistory.includes('20%') },
    { label: 'Incentive Exceeds Standard Limit', check: (r: typeof requests[0]) => r.estimatedIncentive > 30000 },
    { label: 'Strategic Client', check: () => true },
    { label: 'Special Approval Requested', check: (r: typeof requests[0]) => r.specialApprovalRequired },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><Crown className="text-brand-blue" size={28} /> Executive Approval</h1>
          <p className="text-sm text-slate-400 -mt-4">CEO review for escalated incentive requests</p>
        </div>

        {pending.length === 0 && (
          <div className="text-center py-16 glass-card">
            <CheckCircle2 className="mx-auto text-emerald-300 mb-4" size={48} />
            <p className="text-sm text-slate-400 font-medium">No requests pending executive review</p>
          </div>
        )}

        {pending.map((req, i) => (
          <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card border-l-4 border-l-orange-400">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide">{req.quotationRef} — {req.salespersonName}</h3>
                <p className="text-xs text-slate-400 mt-1">Escalated from: {req.financeVerified ? 'Finance' : 'GM'}</p>
              </div>
              <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[9px] font-bold uppercase tracking-widest">CEO Review</span>
            </div>

            {/* Escalation triggers */}
            <div className="mb-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
              <h4 className="sub-title flex items-center gap-1.5 text-orange-600 mb-3"><AlertTriangle size={12} /> Escalation Triggers</h4>
              <div className="space-y-2">
                {ESCALATION_REASONS.map(reason => (
                  <div key={reason.label} className={`flex items-center gap-2 text-xs font-medium ${reason.check(req) ? 'text-orange-700' : 'text-slate-300'}`}>
                    {reason.check(req) ? <AlertTriangle size={12} className="text-orange-500" /> : <div className="w-3 h-3 rounded-full bg-slate-200" />}
                    {reason.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-xl"><span className="sub-title">GP</span><p className="text-sm font-bold">{fmt(req.grossProfit)}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><span className="sub-title">Est. Incentive</span><p className="text-sm font-bold text-brand-blue">{fmt(req.estimatedIncentive)}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><span className="sub-title">Discount</span><p className="text-sm font-bold">{req.discountHistory || 'None'}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><span className="sub-title">Collection</span><p className="text-sm font-bold">{req.collectionPercent}%</p></div>
            </div>

            {/* Previous remarks */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <span className="sub-title">GM Remarks</span>
              <p className="text-xs text-slate-600 mt-1">{req.gmRemarks || 'No remarks'}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => { updateRequest(req.id, { ceoDecision: 'rejected', ceoRemarks: 'Not approved by CEO' }); updateStatus(req.id, 'rejected'); }} className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center gap-1.5"><XCircle size={12} /> Reject</button>
              <button onClick={() => { updateRequest(req.id, { ceoDecision: 'approved', ceoRemarks: 'Approved by CEO' }); updateStatus(req.id, 'approved'); }} className="premium-button text-[9px] flex items-center gap-1.5"><Crown size={12} /> CEO Approve</button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default IncentiveExecutivePage;
