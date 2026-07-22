import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  X, 
  Copy, 
  CheckCircle2, 
  Code2, 
  Sliders, 
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { 
  DEFAULT_WEBHOOK_CONFIG, 
  getSampleCurlSnippet, 
  getSampleJsSnippet 
} from '../../services/quotationWebhookService';

interface PipelineAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventProcessed?: (msg: string) => void;
}

export function PipelineAutomationModal({ isOpen, onClose }: PipelineAutomationModalProps) {
  const [config, setConfig] = useState(DEFAULT_WEBHOOK_CONFIG);
  const [activeTab, setActiveTab] = useState<'rules' | 'api'>('rules');
  const [copiedType, setCopiedType] = useState<'url' | 'curl' | 'js' | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'url' | 'curl' | 'js') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-surface-border overflow-hidden animate-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-blue text-white rounded-2xl shadow-md shadow-brand-blue/20">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider leading-none flex items-center gap-2">
                Pipeline Automation & Webhook API
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md uppercase">Integration Ready</span>
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 mb-0 font-medium">
                Connect your custom Quotation App & set auto-stage transition rules
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-border bg-slate-50/50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2",
              activeTab === 'rules' ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-navy-900"
            )}
          >
            <Sliders size={14} /> Transition Rules
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={cn(
              "px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2",
              activeTab === 'api' ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-navy-900"
            )}
          >
            <Code2 size={14} /> Developer Webhook API
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: TRANSITION RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Automatic Pipeline Stage Transition Rules</h3>
              
              {[
                { key: 'autoQualifyHighScore', label: 'Auto-Qualify High Score Leads', desc: 'Automatically move deals from New Inquiry to Qualified when contact lead score reaches 75+ pts.' },
                { key: 'autoMoveOnQuoteSent', label: 'Auto-Move to Proposal Sent on Quote Event', desc: 'When your external Quoting App dispatches a quote, auto-advance deal stage to Proposal Sent & assign user by Quote Scope (Rose / Grace).' },
                { key: 'autoMoveOnHotSignal', label: 'Auto-Move to Negotiation on Hot Signal', desc: 'When a contact exhibits Closing Ready or Hot buying signals (or views quote 3+ times), auto-advance to Negotiation.' },
                { key: 'autoWinOnQuoteAccepted', label: 'Auto-Move to Closed Won on Quote Accepted', desc: 'When client approves quote or pays deposit in your quoting app, auto-move deal to Closed Won.' },
              ].map(rule => (
                <div key={rule.key} className="p-4 bg-slate-50 border border-surface-border rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-navy-900">{rule.label}</p>
                    <p className="text-[11px] text-slate-500">{rule.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig(c => ({ ...c, [rule.key]: !c[rule.key as keyof WebhookConfig] }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                      config[rule.key as keyof WebhookConfig] ? "bg-brand-blue" : "bg-slate-300"
                    )}
                  >
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", config[rule.key as keyof WebhookConfig] ? "translate-x-6" : "translate-x-1")} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DEVELOPER WEBHOOK API */}
          {activeTab === 'api' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Webhook Endpoint URL</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={config.endpointUrl} className="flex-1 px-3.5 py-2 bg-slate-100 border border-surface-border rounded-xl text-xs font-mono text-navy-900 outline-none" />
                  <button onClick={() => copyToClipboard(config.endpointUrl, 'url')} className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center gap-1.5">
                    {copiedType === 'url' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedType === 'url' ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">cURL Test Snippet</label>
                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[10px] font-mono overflow-x-auto custom-scrollbar">
                    {getSampleCurlSnippet(config)}
                  </pre>
                  <button onClick={() => copyToClipboard(getSampleCurlSnippet(config), 'curl')} className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-white/20 transition-all flex items-center gap-1">
                    {copiedType === 'curl' ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedType === 'curl' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">JavaScript Integration Helper for Custom Quoting App</label>
                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[10px] font-mono overflow-x-auto custom-scrollbar">
                    {getSampleJsSnippet(config)}
                  </pre>
                  <button onClick={() => copyToClipboard(getSampleJsSnippet(config), 'js')} className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 text-white rounded-lg text-[10px] font-bold hover:bg-white/20 transition-all flex items-center gap-1">
                    {copiedType === 'js' ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedType === 'js' ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Webhook API Status: Active & Listening</span>
          </div>
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
