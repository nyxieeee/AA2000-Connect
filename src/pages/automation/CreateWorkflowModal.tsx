import { useState } from 'react';
import {
  X, Sparkles, LayoutTemplate, Clock, Bell,
  Trophy, FileText, CalendarCheck, UserPlus, Gift, TrendingDown,
  Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAutomationStore } from '../../stores/modules/automationStore';
import { getTemplates, type WorkflowTemplate } from '../../services/workflowTemplates';
import { buildWorkflowFromPrompt } from '../../services/aiWorkflowBuilder';

interface Props {
  onClose: () => void;
  onCreated: (workflowId: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Bell, Clock, Trophy, FileText, CalendarCheck, UserPlus, Gift, TrendingDown
};

const CATEGORY_LABELS: Record<string, string> = {
  lead_capture: 'Lead Capture',
  follow_up: 'Follow-ups',
  notification: 'Notifications',
  deal_management: 'Deal Management',
  meeting: 'Meetings',
  engagement: 'Engagement'
};

export default function CreateWorkflowModal({ onClose, onCreated }: Props) {
  const { addWorkflow } = useAutomationStore();
  const [tab, setTab] = useState<'templates' | 'ai'>('templates');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const templates = getTemplates();
  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  const categories = [...new Set(templates.map(t => t.category))];

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    const wf = addWorkflow({
      name: template.name,
      source: 'template',
      sourceTemplateId: template.id,
      nodes: JSON.parse(JSON.stringify(template.nodes)),
      edges: JSON.parse(JSON.stringify(template.edges)),
    });
    onCreated(wf.id);
  };

  const handleAIBuild = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please describe what you want the workflow to do.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    try {
      const result = await buildWorkflowFromPrompt(aiPrompt);
      const wf = addWorkflow({
        name: result.name,
        source: 'ai_generated',
        aiPrompt: aiPrompt,
        nodes: result.nodes,
        edges: result.edges,
      });
      onCreated(wf.id);
    } catch {
      setAiError('Something went wrong generating your workflow. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-[640px] max-h-[80vh] flex flex-col overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Create New Workflow</h2>
            <p className="text-xs text-slate-500 mt-0.5">Start from a template or describe what you need</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-border px-6">
          <button
            onClick={() => setTab('templates')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px',
              tab === 'templates' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-navy-900'
            )}
          >
            <LayoutTemplate size={16} /> Templates
          </button>
          <button
            onClick={() => setTab('ai')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px',
              tab === 'ai' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-navy-900'
            )}
          >
            <Sparkles size={16} /> Describe with AI
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'templates' ? (
            <div className="space-y-4">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                    !selectedCategory
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-slate-500 border-surface-border hover:border-brand-blue/30'
                  )}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                      selectedCategory === cat
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-white text-slate-500 border-surface-border hover:border-brand-blue/30'
                    )}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map(template => {
                  const Icon = ICON_MAP[template.icon] || LayoutTemplate;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-4 border border-surface-border rounded-2xl hover:border-brand-blue/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/20 transition-all">
                          <Icon size={18} className="text-brand-blue" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-navy-900 group-hover:text-brand-blue transition-colors truncate">
                            {template.name}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {CATEGORY_LABELS[template.category] || template.category}
                            </span>
                            <span className="text-[9px] text-brand-blue font-bold">
                              {template.popularity}% use this
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* AI Prompt Tab */
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-brand-blue" />
                  <p className="text-xs font-bold text-navy-900">Describe your workflow in plain English</p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Just tell us what you want to happen. For example:
                </p>
                <div className="mt-2 space-y-1">
                  {[
                    'When a new lead comes in from Facebook, send me an email notification and create a task to follow up within 2 hours.',
                    'If a deal is marked as Won, notify the sales team and send a thank-you email to the client.',
                    'Remind me to follow up with leads who haven\'t been contacted in 3 days.',
                    'When a quotation is sent, wait 2 days and send a follow-up email if no response.'
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setAiPrompt(example)}
                      className="block w-full text-left px-3 py-2 rounded-xl bg-white/70 border border-blue-100 text-[10px] text-slate-600 hover:border-brand-blue/30 hover:bg-white transition-all italic"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={e => { setAiPrompt(e.target.value); setAiError(''); }}
                  placeholder="Describe what you want to automate..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-surface-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue resize-none"
                />
              </div>

              {aiError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle size={14} className="text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-600 font-medium">{aiError}</p>
                </div>
              )}

              <button
                onClick={handleAIBuild}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-2xl text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating your workflow...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Workflow
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium">
                  AI-generated workflows require a review and approval before they can be activated. 
                  An admin will check the steps before publishing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        {tab === 'templates' && (
          <div className="px-6 py-3 border-t border-surface-border bg-slate-50/50">
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Templates are pre-approved — just review and activate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
