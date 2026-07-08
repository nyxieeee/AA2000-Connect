import { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Play, 
  Pause, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Calendar
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { storage } from '../../services/storage';

interface AIMission {
  id: string;
  name: string;
  objective: string;
  schedule: string;
  startDate: string;
  endDate: string;
  theme: 'Fire Safety' | 'Christmas' | 'Promo' | 'Awareness';
  status: 'Running' | 'Paused' | 'Scheduled';
  impact: {
    sends: number;
    engagement: string;
  };
  channels: ('Email' | 'Messenger' | 'Viber')[];
}

const AIAutomationsPage = () => {
  const [missions] = useState<AIMission[]>(() => storage.get('mktg_ai_missions') || [
    {
      id: '0',
      name: 'Demo Mission',
      objective: 'Test',
      schedule: 'Daily',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      theme: 'Awareness',
      status: 'Running',
      impact: { sends: 0, engagement: '0%' },
      channels: ['Email']
    },
    {
      id: '1',
      name: 'March Fire Prevention Month',
      objective: 'Daily safety tips and special fire extinguisher maintenance promos.',
      schedule: 'Daily @ 10:00 AM',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      theme: 'Fire Safety',
      status: 'Scheduled',
      impact: { sends: 0, engagement: '0%' },
      channels: ['Email', 'Messenger', 'Viber']
    },
    {
      id: '2',
      name: 'Residential Solar Awareness',
      objective: 'Educate leads about solar ROI and promote installation packages.',
      schedule: 'Every Monday @ 9:00 AM',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      theme: 'Awareness',
      status: 'Running',
      impact: { sends: 12450, engagement: '18.4%' },
      channels: ['Email', 'Messenger']
    },
    {
      id: '3',
      name: 'AA2000 Grand Christmas Promo',
      objective: 'Year-end smart home bundles and holiday greetings.',
      schedule: 'Weekly @ 4:00 PM',
      startDate: '2026-12-01',
      endDate: '2026-12-25',
      theme: 'Christmas',
      status: 'Paused',
      impact: { sends: 8500, engagement: '24.2%' },
      channels: ['Messenger', 'Viber']
    }
  ]);

  const [missionStatuses, setMissionStatuses] = useState<Record<string, 'Running' | 'Paused' | 'Scheduled'>>(() => storage.get('mktg_ai_statuses') || {});

  const persistStatuses = (updated: Record<string, 'Running' | 'Paused' | 'Scheduled'>) => { setMissionStatuses(updated); storage.set('mktg_ai_statuses', updated); };

  const toggleMission = (id: string, current: string) => {
    const next = current === 'Running' ? 'Paused' : 'Running';
    persistStatuses({ ...missionStatuses, [id]: next });
  };

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-900 uppercase tracking-tighter italic flex items-center gap-2">
            <Bot size={24} className="text-brand-blue" />
            AI Managed Campaigns
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Run automated marketing campaigns powered by AI</p>
        </div>
        <button className="premium-button flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3">
          <Sparkles size={16} />
          New AI Mission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missions List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black text-navy-900 uppercase tracking-widest italic mb-2">Active Intelligence Missions</h3>
          {missions.map(mission => (
            <div key={mission.id} className="glass-card p-6 group hover:border-brand-blue/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center text-white italic font-black shadow-lg">
                    AI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h4 className="text-sm font-black text-navy-900 group-hover:text-brand-blue transition-colors">{mission.name}</h4>
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                         mission.theme === 'Fire Safety' ? 'bg-rose-50 text-rose-600' :
                         mission.theme === 'Christmas' ? 'bg-red-50 text-red-600' :
                         mission.theme === 'Promo' ? 'bg-amber-50 text-amber-600' :
                         'bg-blue-50 text-blue-600'
                       )}>
                          {mission.theme}
                       </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                       <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{mission.schedule}</span>
                       </div>
                       <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Active: {new Date(mission.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(mission.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    (missionStatuses[mission.id] || mission.status) === 'Running' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    (missionStatuses[mission.id] || mission.status) === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  )}>
                    {missionStatuses[mission.id] || mission.status}
                  </span>
                  <button onClick={() => toggleMission(mission.id, missionStatuses[mission.id] || mission.status)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                    {(missionStatuses[mission.id] || mission.status) === 'Running' ? <Pause size={16} className="text-slate-400" /> : <Play size={16} className="text-brand-blue" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl mb-6">
                 <p className="text-[11px] text-navy-900 font-bold leading-relaxed italic">"{mission.objective}"</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Auto-Sends</p>
                       <p className="text-xs font-black text-navy-900">{mission.impact.sends.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="space-y-0.5">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Engagement</p>
                       <p className="text-xs font-black text-navy-900">{mission.impact.engagement}</p>
                    </div>
                 </div>
                 <div className="flex -space-x-2">
                    {mission.channels.map(c => (
                      <div key={c} className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-brand-blue shadow-sm" title={c}>
                        {c === 'Email' ? <Mail size={14} /> : c === 'Messenger' ? <MessageSquare size={14} /> : <Zap size={14} />}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-6">
           <div className="glass-card p-6 bg-navy-900 text-white border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center shadow-lg">
                       <BarChart3 size={20} />
                    </div>
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-widest">Performance Pulse</h3>
                       <p className="text-[9px] text-brand-blue font-bold uppercase tracking-widest">AI Efficiency Hub</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Automation Rate</span>
                          <span className="text-emerald-400 text-xs font-black">98.2%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[98%]"></div>
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Campaign Accuracy</span>
                          <span className="text-brand-blue text-xs font-black">94.5%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue w-[94%]"></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                 <Sparkles size={14} className="text-brand-blue" />
                 <h3 className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Recent AI Creative</h3>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed">
                    "Hi there! Just a quick follow-up on your fire safety inquiry. Did you know our Smart Alarms are 20% off this week? Reply YES to learn more..."
                 </div>
                 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>Sent to 850 Leads</span>
                    <span className="text-brand-blue">View History</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AIAutomationsPage;
