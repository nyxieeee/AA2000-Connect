import { useState } from 'react';
import { Lightbulb, CheckCircle2, X, Sparkles, Send, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAIRecommendationsStore } from '../../stores/modules/aiRecommendationsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function AIRecommendationsPage() {
  const { recommendations, addRecommendation, markRead, markApplied, dismissRecommendation } = useAIRecommendationsStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const filtered = recommendations.filter(r => {
    if (filter === 'unread') return !r.read;
    if (filter === 'high') return r.priority === 'high';
    return true;
  });

  const handleGenerateDemo = () => {
    const demos = [
      { type: 'next_step' as const, title: 'Follow up on quotation', description: 'Client opened the quotation 3 times in the past 2 days. This is a strong buying signal — call today.', priority: 'high' as const, draftMessage: 'Hi [Name], I noticed you\'ve been reviewing the quotation. Do you have any questions I can help clarify?' },
      { type: 'follow_up' as const, title: 'Re-engage quiet lead', description: 'No activity from this lead in 14 days. Send a check-in email with a relevant case study.', priority: 'medium' as const },
      { type: 'risk_alert' as const, title: 'Deal stalled in negotiation', description: 'This deal has been in "Negotiation" stage for 21 days. Average time is 7 days. Consider reaching out to the decision-maker.', priority: 'high' as const },
    ];
    demos.forEach(d => addRecommendation({ ...d, dealId: 'demo', contactId: 'demo', read: false, applied: false }));
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
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">AI Recommendations</h1>
          <p className="text-xs text-slate-500 mt-0.5">Smart suggestions on what to do next for each deal or lead</p>
        </div>
        <button onClick={handleGenerateDemo} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-violet-700 transition-all shadow-sm">
          <Sparkles size={16} /> Generate Sample
        </button>
      </div>

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
          <div className="text-center py-12">
            <Lightbulb size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
            <p className="text-sm text-slate-500 font-medium">No recommendations yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Generate Sample" to see how AI suggestions work</p>
          </div>
        )}
        {filtered.map(rec => (
          <AnimatedListItem key={rec.id}>
          <div className={cn('glass-card p-5 border-l-4 transition-all', !rec.read ? 'border-brand-blue bg-brand-blue/[0.02]' : 'border-transparent')}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn('p-2 rounded-lg', rec.priority === 'high' ? 'bg-rose-50' : rec.priority === 'medium' ? 'bg-amber-50' : 'bg-emerald-50')}>
                  <Lightbulb size={18} className={rec.priority === 'high' ? 'text-rose-500' : rec.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-navy-900">{rec.title}</p>
                    <span className={cn('px-2 py-0.5 text-[9px] font-bold rounded-full border', priorityColors[rec.priority])}>{rec.priority}</span>
                    {!rec.read && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                  {rec.draftMessage && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-surface-border">
                      <div className="flex items-center gap-1 mb-1.5">
                        <MessageSquare size={12} className="text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-500">Draft Message</span>
                      </div>
                      <p className="text-xs text-slate-700 italic">"{rec.draftMessage}"</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                {!rec.read && <button onClick={() => markRead(rec.id)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all" title="Mark read"><CheckCircle2 size={14} /></button>}
                {!rec.applied && <button onClick={() => markApplied(rec.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Apply"><Send size={14} /></button>}
                <button onClick={() => dismissRecommendation(rec.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Dismiss"><X size={14} /></button>
              </div>
            </div>
            {rec.applied && <div className="mt-2 px-2 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg inline-block">Applied</div>}
          </div>
          </AnimatedListItem>
        ))}
      </div>
      </AnimatedList>
    </div>
    </AnimatedPage>
  );
}
