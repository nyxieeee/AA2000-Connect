import { useState } from 'react';
import { Lightbulb, CheckCircle2, X, Sparkles, Send, MessageSquare, Loader2, Bot, ArrowUpRight, Pencil, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAIRecommendationsStore } from '../../stores/modules/aiRecommendationsStore';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';
import { useLeadsStore } from '../../stores/modules/leadsStore';
import { useEngagementStore } from '../../stores/modules/engagementStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function AIRecommendationsPage() {
  const navigate = useNavigate();
  const { recommendations, isScanning, markRead, markApplied, updateDraftMessage, dismissRecommendation, runLiveAIScan } = useAIRecommendationsStore();
  const { deals } = usePipelinesStore();
  const { leads } = useLeadsStore();
  const getBuyingSignals = useEngagementStore((s) => s.getBuyingSignals);

  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [scanMessage, setScanMessage] = useState('');

  // Inline Draft Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const filtered = recommendations.filter(r => {
    if (filter === 'unread') return !r.read;
    if (filter === 'high') return r.priority === 'high';
    return true;
  });

  const handleRunLiveAIScan = async () => {
    const activeSignals = getBuyingSignals();
    setScanMessage('');
    try {
      const count = await runLiveAIScan({
        deals: deals.map(d => ({ id: d.id, title: d.title, value: d.value, companyName: d.companyName, stageId: d.stageId, status: d.status })),
        leads: leads.map(l => ({ id: l.id, name: l.name, email: l.email, company: l.company, status: l.status, notes: l.notes })),
        signals: activeSignals.map(s => ({ id: s.contactOrLeadId, name: s.name, channel: s.channel, signal: s.signal, reason: s.reason }))
      });
      setScanMessage(`Successfully generated ${count} new Multi-Provider AI recommendation(s)!`);
      setTimeout(() => setScanMessage(''), 5000);
    } catch (err: any) {
      alert(`AI Recommendations Scan failed: ${err?.message || 'Check Cloud AI API Keys'}`);
    }
  };

  const handleStartEditing = (recId: string, currentDraft: string) => {
    setEditingId(recId);
    setEditingText(currentDraft);
  };

  const handleSaveDraft = (recId: string) => {
    updateDraftMessage(recId, editingText);
    setEditingId(null);
  };

  const handleApplyOutreach = (recId: string, draftMsg?: string) => {
    markApplied(recId);
    if (draftMsg) {
      navigate('/comms');
    }
  };

  const priorityColors: Record<string, string> = {
    high: 'text-rose-600 bg-rose-50 border-rose-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
              <span>AI Recommendations</span>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase rounded-full">
                Multi-Provider AI
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Live AI co-pilot scanning Deals & Leads via Groq, Mistral, and Gemini</p>
          </div>
          <button 
            onClick={handleRunLiveAIScan} 
            disabled={isScanning}
            className="px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-95 transition-all shadow-md disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Scanning Deals via Cloud AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-amber-300" />
                <span>⚡ Auto-Scan Deals & Leads</span>
              </>
            )}
          </button>
        </div>

        {scanMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{scanMessage}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          {(['all', 'unread', 'high'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all', filter === f ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-navy-900')}>
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'High Priority'}
              {f === 'unread' && recommendations.filter(r => !r.read).length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 text-white text-[9px] rounded-full">{recommendations.filter(r => !r.read).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Recommendations */}
        <AnimatedList>
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-12 glass-card">
                <Lightbulb size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
                <p className="text-sm text-navy-900 font-bold">No recommendations yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "⚡ Auto-Scan Deals & Leads" above to run live Multi-Provider AI analysis.</p>
              </div>
            )}

            {filtered.map(rec => (
              <AnimatedListItem key={rec.id}>
                <div className={cn('glass-card p-5 border-l-4 transition-all space-y-3', !rec.read ? 'border-brand-blue bg-indigo-50/20' : 'border-transparent')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn('p-2.5 rounded-xl shrink-0', rec.priority === 'high' ? 'bg-rose-50 text-rose-600' : rec.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
                        <Lightbulb size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-navy-900">{rec.title}</p>
                          <span className={cn('px-2 py-0.5 text-[9px] font-black rounded-full border uppercase', priorityColors[rec.priority])}>{rec.priority}</span>
                          {rec.providerUsed && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md flex items-center gap-1 border border-slate-200">
                              <Bot size={10} className="text-brand-blue" /> {rec.providerUsed}
                            </span>
                          )}
                          {!rec.read && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                        
                        {/* Pre-Drafted Response Box with Inline Editing */}
                        {rec.draftMessage && (
                          <div className="mt-3 p-3.5 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                                <MessageSquare size={12} className="text-indigo-600" />
                                <span>AI Pre-Drafted Response</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {rec.channel && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                                    Channel: {rec.channel}
                                  </span>
                                )}
                                {editingId !== rec.id && (
                                  <button
                                    onClick={() => handleStartEditing(rec.id, rec.draftMessage!)}
                                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1"
                                  >
                                    <Pencil size={10} /> Edit Draft
                                  </button>
                                )}
                              </div>
                            </div>

                            {editingId === rec.id ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={3}
                                  className="w-full p-2.5 bg-slate-50 border border-indigo-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                  placeholder="Customize your outreach message..."
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-navy-900"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveDraft(rec.id)}
                                    className="px-3 py-1 bg-brand-blue text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-brand-light shadow-sm"
                                  >
                                    <Check size={12} /> Save Draft
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-800 font-medium italic leading-relaxed">
                                "{rec.draftMessage}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4 shrink-0">
                      {rec.draftMessage && !rec.applied && (
                        <button 
                          onClick={() => handleApplyOutreach(rec.id, rec.draftMessage)}
                          className="px-3 py-1.5 bg-brand-blue text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-brand-light transition-all shadow-sm"
                          title="Apply & Send via Inbox"
                        >
                          <Send size={12} />
                          <span>Apply & Send</span>
                          <ArrowUpRight size={12} />
                        </button>
                      )}
                      {!rec.read && (
                        <button onClick={() => markRead(rec.id)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all" title="Mark Read">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button onClick={() => dismissRecommendation(rec.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Dismiss">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {rec.applied && (
                    <div className="mt-1 px-2.5 py-1 text-[10px] font-black text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-lg inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> Applied to Outreach
                    </div>
                  )}
                </div>
              </AnimatedListItem>
            ))}
          </div>
        </AnimatedList>
      </div>
    </AnimatedPage>
  );
}
