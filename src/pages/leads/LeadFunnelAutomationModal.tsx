import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  X, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Bot, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLeadsStore } from '../../stores/modules/leadsStore';

interface LeadFunnelAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventProcessed?: (msg: string) => void;
}

export function LeadFunnelAutomationModal({ isOpen, onClose, onEventProcessed }: LeadFunnelAutomationModalProps) {
  const { autoEvaluateLeadFunnel } = useLeadsStore();
  const [rules, setRules] = useState({
    autoAssignOnIntake: true,
    autoContactOnOutbound: true,
    autoQualifyOnQuoteRequest: true,
    autoConvertOnSalesDeal: true,
  });

  if (!isOpen) return null;

  const runEvaluator = () => {
    const res = autoEvaluateLeadFunnel();
    const msg = res.advancedCount > 0 
      ? `Auto-Funnel advanced ${res.advancedCount} lead(s): ${res.summary.join(', ')}`
      : 'Auto-Funnel Evaluator checked all leads: All lead funnel stages are up to date!';
    if (onEventProcessed) onEventProcessed(msg);
  };

  return createPortal(
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-surface-border overflow-hidden animate-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-blue text-white rounded-2xl shadow-md shadow-brand-blue/20">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider leading-none flex items-center gap-2">
                5-Stage Lead Funnel Automation
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md uppercase">Active</span>
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 mb-0 font-medium">
                Automate stage transitions: New → Assigned → Contacted → Qualified → Converted
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-navy-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-xs">
            <Sparkles size={20} className="text-brand-blue shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-navy-900">How Lead Funnel Automation Works</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                The Lead Engine evaluates incoming customer communications, quote requests, and team assignments in real time to seamlessly advance leads through the 5 funnel stages.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Automated Transition Rules</h3>

            {[
              {
                key: 'autoAssignOnIntake',
                stage: 'New → Assigned',
                label: 'Auto-Assign New Leads by Scope & Channel',
                desc: 'Automatically assign incoming leads by Scope (Supply Only vs. Installation) & Intake Channel according to your active team assignment rules.'
              },
              {
                key: 'autoContactOnOutbound',
                stage: 'Assigned → Contacted',
                label: 'Auto-Advance to Contacted on First Outbound Message',
                desc: 'When a rep sends a Viber, Messenger, Email reply, or logs a phone call.'
              },
              {
                key: 'autoQualifyOnQuoteRequest',
                stage: 'Contacted → Qualified',
                label: 'Auto-Advance to Qualified on Quotation Request',
                desc: 'When verified lead requests a formal quote or lead score reaches 70+ pts.'
              },
              {
                key: 'autoConvertOnSalesDeal',
                stage: 'Qualified → Converted',
                label: 'Auto-Convert to Sales Deal on Quote Dispatch',
                desc: 'Converts Lead into a CRM Contact & Sales Pipeline Deal upon Quote Sent event.'
              },
            ].map(rule => (
              <div key={rule.key} className="p-4 bg-slate-50 border border-surface-border rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded uppercase">{rule.stage}</span>
                    <p className="text-xs font-bold text-navy-900">{rule.label}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{rule.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRules(r => ({ ...r, [rule.key]: !r[rule.key as keyof typeof r] }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                    rules[rule.key as keyof typeof rules] ? "bg-brand-blue" : "bg-slate-300"
                  )}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", rules[rule.key as keyof typeof rules] ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-surface-border flex items-center justify-between">
          <button
            onClick={runEvaluator}
            className="px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-light transition-all flex items-center gap-2 shadow-md shadow-brand-blue/20"
          >
            <Bot size={14} /> Run Stage Auto-Evaluator
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
