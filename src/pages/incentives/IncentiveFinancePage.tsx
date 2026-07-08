import { motion } from 'framer-motion';
import { Calculator, CheckCircle2, XCircle } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useIncentivesStore } from '../../stores/modules/incentivesStore';

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

const IncentiveFinancePage = () => {
  const { requests, updateRequest, updateStatus } = useIncentivesStore();
  const pending = requests.filter(r => r.status === 'finance_review');

  const CHECKS = ['Collection Verified', 'Costing Verified', 'GP Accurate', 'Margin Within Policy', 'Budget Available', 'No Previous Duplicate'];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><Calculator className="text-brand-blue" size={28} /> Finance Verification</h1>
          <p className="text-sm text-slate-400 -mt-4">Verify financial details and compute final incentive amounts</p>
        </div>

        {pending.length === 0 && (
          <div className="text-center py-16 glass-card">
            <CheckCircle2 className="mx-auto text-emerald-300 mb-4" size={48} />
            <p className="text-sm text-slate-400 font-medium">No requests pending finance verification</p>
          </div>
        )}

        {pending.map((req, i) => (
          <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide">{req.quotationRef} — {req.salespersonName}</h3>
                <p className="text-xs text-slate-400 mt-1">GM Approved • {req.gmRemarks || 'No remarks'}</p>
              </div>
              <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[9px] font-bold uppercase tracking-widest">Finance Review</span>
            </div>

            {/* Computation breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Gross Profit', value: fmt(req.grossProfit), color: 'text-navy-900' },
                { label: 'Collection %', value: `${req.collectionPercent}%`, color: 'text-navy-900' },
                { label: 'Down Payment', value: fmt(req.downPayment), color: 'text-navy-900' },
                { label: 'Estimated Incentive (10% GP)', value: fmt(req.estimatedIncentive), color: 'text-brand-blue' },
                { label: 'Advance (50%)', value: fmt(req.advanceIncentive), color: 'text-emerald-600' },
                { label: 'Tax (12%)', value: fmt(req.taxDeduction), color: 'text-rose-500' },
                { label: 'Final After Tax', value: fmt(req.finalIncentive), color: 'text-emerald-700' },
                { label: 'Remaining Balance', value: fmt(req.remainingBalance), color: 'text-amber-600' },
              ].map(item => (
                <div key={item.label} className="p-4 bg-slate-50 rounded-xl">
                  <span className="sub-title">{item.label}</span>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Finance checklist */}
            <div className="mb-6">
              <h4 className="sub-title mb-3">Finance Verification Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CHECKS.map(check => (
                  <label key={check} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 cursor-pointer transition-all">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-500 focus:ring-purple-200" />
                    <span className="text-xs font-medium text-slate-600">{check}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => { updateRequest(req.id, { financeVerified: false, financeRemarks: 'Discrepancy found' }); updateStatus(req.id, 'gm_review'); }} className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center gap-1.5"><XCircle size={12} /> Return to GM</button>
              <button onClick={() => { updateRequest(req.id, { financeVerified: true, financeRemarks: 'All verified' }); updateStatus(req.id, req.specialApprovalRequired ? 'ceo_review' : 'approved'); }} className="premium-button text-[9px] flex items-center gap-1.5"><CheckCircle2 size={12} /> Verify & Approve</button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};

export default IncentiveFinancePage;
