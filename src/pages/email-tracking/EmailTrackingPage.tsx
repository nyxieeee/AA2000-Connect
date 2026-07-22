import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Flame, Snowflake, Target, Mail, MessageCircle, Globe, Camera, Phone, Smartphone, Eye, MousePointer, Plus, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEngagementStore } from '../../stores/modules/engagementStore';
import { useCRMStore } from '../../stores/modules/crmStore';
import { useLeadsStore } from '../../stores/modules/leadsStore';
import type { Channel, Action } from '../../stores/modules/engagementStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const channelConfig: Record<Channel, { icon: typeof Mail; label: string; color: string; bg: string }> = {
  email: { icon: Mail, label: 'Email', color: 'text-blue-600', bg: 'bg-blue-50' },
  viber: { icon: Phone, label: 'Viber', color: 'text-purple-600', bg: 'bg-purple-50' },
  whatsapp: { icon: Smartphone, label: 'WhatsApp', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  facebook: { icon: MessageCircle, label: 'Facebook', color: 'text-blue-700', bg: 'bg-blue-100' },
  instagram: { icon: Camera, label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-50' },
  website: { icon: Globe, label: 'Website', color: 'text-cyan-600', bg: 'bg-cyan-50' },
};

const signalConfig: Record<string, { icon: typeof Zap; color: string; bg: string }> = {
  closing: { icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
  hot: { icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
  warm: { icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
  cold: { icon: Snowflake, color: 'text-blue-600', bg: 'bg-blue-50' },
};

const channels: Channel[] = ['email', 'viber', 'whatsapp', 'facebook', 'instagram', 'website'];
const actions: Action[] = ['opened', 'read', 'clicked', 'replied', 'viewed', 'submitted'];

export default function EmailTrackingPage() {
  const navigate = useNavigate();
  const { events, addEvent, getBuyingSignals } = useEngagementStore();
  const { contacts } = useCRMStore();
  const { leads } = useLeadsStore();

  const [tab, setTab] = useState<'signals' | 'feed'>('signals');
  const [showSimulate, setShowSimulate] = useState(false);
  const [sim, setSim] = useState({ contactId: 'seed-1', name: 'Maria Santos', channel: 'email' as Channel, action: 'opened' as Action, link: '' });

  const allContactOptions = [
    { id: 'seed-1', name: 'Maria Santos (Seed Lead)' },
    { id: 'seed-2', name: 'Juan Reyes (Seed Lead)' },
    { id: 'seed-3', name: 'Pedro Lim (Seed Lead)' },
    { id: 'seed-4', name: 'Luzviminda Cruz (Seed Lead)' },
    { id: 'seed-5', name: 'Ana Gonzales (Seed Lead)' },
    ...contacts.map(c => ({ id: c.id, name: `${c.name} (Contact - ${c.email})` })),
    ...leads.map(l => ({ id: l.id, name: `${l.name} (Lead - ${l.source})` })),
  ];

  const signals = getBuyingSignals();
  const highPriority = signals.filter(s => s.signal === 'hot' || s.signal === 'closing');

  const handleSimulate = () => {
    addEvent({
      channel: sim.channel,
      action: sim.action,
      contactId: sim.contactId,
      metadata: sim.action === 'clicked' ? { linkUrl: sim.link || 'https://aa2000.ph/quote' } : sim.action === 'viewed' ? { pageUrl: sim.link || '/pricing' } : undefined,
    });
    setShowSimulate(false);
    setSim({ contactId: 'seed-1', name: 'Maria Santos', channel: 'email', action: 'opened', link: '' });
  };

  const recentEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Client Activity & Buying Signals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time purchase intent monitoring across Email, Viber, WhatsApp, Facebook, Instagram, and Website</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-border pb-3">
        <button onClick={() => setTab('signals')}
          className={cn('px-4 py-2 text-xs font-bold rounded-lg transition-all', tab === 'signals' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-navy-900')}>
          Buying Signals ({signals.length})
        </button>
        <button onClick={() => setTab('feed')}
          className={cn('px-4 py-2 text-xs font-bold rounded-lg transition-all', tab === 'feed' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-navy-900')}>
          Live Feed ({events.length})
        </button>
      </div>

      {/* Stats */}
      <AnimatedList>
      <div className="grid grid-cols-4 gap-3">
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><Mail size={18} className="text-blue-600" /></div>
            <div><p className="text-xs text-slate-500">Total Events</p><p className="text-lg font-bold text-navy-900">{events.length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50"><Eye size={18} className="text-emerald-600" /></div>
            <div><p className="text-xs text-slate-500">Opens/Reads</p><p className="text-lg font-bold text-navy-900">{events.filter(e => e.action === 'opened' || e.action === 'read').length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-50"><MousePointer size={18} className="text-violet-600" /></div>
            <div><p className="text-xs text-slate-500">Clicks</p><p className="text-lg font-bold text-navy-900">{events.filter(e => e.action === 'clicked').length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
        <AnimatedListItem>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', highPriority.length > 0 ? 'bg-rose-50' : 'bg-amber-50')}>
              <Flame size={18} className={highPriority.length > 0 ? 'text-rose-600' : 'text-amber-600'} />
            </div>
            <div><p className="text-xs text-slate-500">Hot Signals</p><p className="text-lg font-bold text-navy-900">{highPriority.length}</p></div>
          </div>
        </div>
        </AnimatedListItem>
      </div>
      </AnimatedList>

      {/* == BUYING SIGNALS TAB == */}
      {tab === 'signals' && (
        <>
          {signals.length === 0 ? (
            <div className="glass-card text-center py-12">
              <Zap size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
              <p className="text-sm text-slate-500 font-medium">No active buying signals detected</p>
              <p className="text-xs text-slate-400 mt-1">Buying signals will appear automatically as clients engage across Email, Viber, WhatsApp, and Website.</p>
            </div>
          ) : (
            <AnimatedList>
            <div className="space-y-3">
              {signals.sort((a, b) => {
                const rank = { closing: 0, hot: 1, warm: 2, cold: 3 };
                return rank[a.signal] - rank[b.signal];
              }).map((signal, i) => {
                const cfg = signalConfig[signal.signal];
                const chCfg = channelConfig[signal.channel];
                const Icon = cfg.icon;
                const ChIcon = chCfg.icon;
                return (
                  <AnimatedListItem key={signal.contactOrLeadId + i}>
                  <div className={cn('glass-card p-5 border-l-4 transition-all flex items-center justify-between', signal.signal === 'closing' ? 'border-l-rose-500' : signal.signal === 'hot' ? 'border-l-orange-400' : signal.signal === 'warm' ? 'border-l-amber-300' : 'border-l-blue-300')}>
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2.5 rounded-xl', cfg.bg)}>
                        <Icon size={20} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded', signal.signal === 'closing' ? 'bg-rose-100 text-rose-700' : signal.signal === 'hot' ? 'bg-orange-100 text-orange-700' : signal.signal === 'warm' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                            {signal.label}
                          </span>
                          <span className="text-xs font-bold text-navy-900">{signal.name}</span>
                          <span className={cn('flex items-center gap-1 px-1.5 py-0.5 text-[9px] rounded', chCfg.bg, chCfg.color)}>
                            <ChIcon size={10} /> {chCfg.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 mt-1">{signal.reason}</p>
                      </div>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => navigate('/pipeline')} className="px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-brand-light transition-all shadow-sm">
                        Create Deal <ArrowRight size={12} />
                      </button>
                      <button onClick={() => navigate('/inbox')} className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all">
                        <MessageSquare size={12} /> Contact
                      </button>
                    </div>
                  </div>
                  </AnimatedListItem>
                );
              })}
            </div>
            </AnimatedList>
          )}
        </>
      )}

      {/* == LIVE FEED TAB == */}
      {tab === 'feed' && (
        <AnimatedList>
        <div className="space-y-1.5">
          {recentEvents.length === 0 && (
            <div className="glass-card text-center py-12">
              <p className="text-sm text-slate-500 font-medium">No events yet</p>
            </div>
          )}
          {recentEvents.map(event => {
            const chCfg = channelConfig[event.channel];
            const ChIcon = chCfg.icon;
            const contactNames: Record<string, string> = { 'seed-1': 'Maria Santos', 'seed-2': 'Juan Reyes', 'seed-3': 'Pedro Lim', 'seed-4': 'Luzviminda Cruz', 'seed-5': 'Ana Gonzales' };
            const contactName = contactNames[event.contactId || ''] || event.contactId || event.recipient || 'Unknown';
            return (
              <AnimatedListItem key={event.id}>
              <div className="glass-card p-3 flex items-center gap-3">
                <div className={cn('p-1.5 rounded-lg', chCfg.bg)}>
                  <ChIcon size={14} className={chCfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-900">{contactName}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{event.channel}</span>
                    <span className="text-[10px] font-semibold text-brand-blue capitalize">{event.action}</span>
                    {event.metadata?.linkUrl && (
                      <span className="text-[9px] text-slate-400 truncate max-w-[200px]">{event.metadata.linkUrl}</span>
                    )}
                    {event.metadata?.pageUrl && (
                      <span className="text-[9px] text-slate-400 truncate max-w-[200px]">{event.metadata.pageUrl}</span>
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 whitespace-nowrap">{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              </AnimatedListItem>
            );
          })}
        </div>
        </AnimatedList>
      )}
    </div>
    </AnimatedPage>
  );
}
