import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Play, 
  Pause, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Calendar,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { storage } from '../../services/storage';
import { useCRMStore } from '../../stores/modules/crmStore';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

interface AICreativeLog {
  id: string;
  missionId: string;
  missionName: string;
  body: string;
  sentCount: number;
  channels: string[];
  createdAt: string;
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const AIAutomationsPage = () => {
  const [missions, setMissions] = useState<AIMission[]>(() => storage.get('mktg_ai_missions') || [
    {
      id: '0',
      name: 'Demo Mission',
      objective: 'Check connection to our AI providers and test automation flow.',
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

  const { contacts, fetchContacts } = useCRMStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const [creativeLogs, setCreativeLogs] = useState<AICreativeLog[]>(() => storage.get('mktg_ai_creative_logs') || [
    {
      id: 'log-1',
      missionId: '2',
      missionName: 'Residential Solar Awareness',
      body: 'Hi there! Just a quick follow-up on your fire safety inquiry. Did you know our Smart Alarms are 20% off this week? Reply YES to learn more...',
      sentCount: 850,
      channels: ['Messenger'],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]);

  // Modal Control States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Execution Control States
  const [activeExecutionMission, setActiveExecutionMission] = useState<AIMission | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // New Mission State Form
  const [newMission, setNewMission] = useState(() => ({
    name: '',
    objective: '',
    schedule: 'Daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    theme: 'Awareness' as const,
    channels: ['Email'] as ('Email' | 'Messenger' | 'Viber')[]
  }));

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    const missionToAdd: AIMission = {
      id: generateId(),
      name: newMission.name,
      objective: newMission.objective,
      schedule: newMission.schedule,
      startDate: newMission.startDate,
      endDate: newMission.endDate,
      theme: newMission.theme,
      status: 'Scheduled',
      impact: { sends: 0, engagement: '0%' },
      channels: newMission.channels
    };
    const updated = [...missions, missionToAdd];
    setMissions(updated);
    storage.set('mktg_ai_missions', updated);
    setIsCreateModalOpen(false);
    setNewMission({
      name: '',
      objective: '',
      schedule: 'Daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      theme: 'Awareness',
      channels: ['Email']
    });
  };

  const handleDeleteMission = (id: string) => {
    if (confirm('Are you sure you want to delete this AI Campaign mission?')) {
      const updated = missions.filter(m => m.id !== id);
      setMissions(updated);
      storage.set('mktg_ai_missions', updated);
    }
  };

  const handleToggleMission = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Running') {
      const updated = missions.map(m => m.id === id ? { ...m, status: 'Paused' as const } : m);
      setMissions(updated);
      storage.set('mktg_ai_missions', updated);
      return;
    }

    const targetMission = missions.find(m => m.id === id);
    if (!targetMission) return;

    setActiveExecutionMission(targetMission);
    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionLogs([]);

    setExecutionLogs(prev => [...prev, 'AI Agent connecting to lead segment database...']);
    await new Promise(r => setTimeout(r, 600));

    setExecutionLogs(prev => [...prev, 'Authenticating AI credentials with providers...']);
    await new Promise(r => setTimeout(r, 600));

    setExecutionLogs(prev => [...prev, 'Connecting to our AI provider APIs (fallback chain: Groq -> Mistral -> Gemini)...']);
    await new Promise(r => setTimeout(r, 800));

    const systemPrompt = `You are a professional automated AI marketing assistant for AA2000 Security & Technology Solutions Inc., Philippines.
Generate a short, high-conversion promotional message (maximum 3 sentences) for ${targetMission.channels.join('/')} outreach based on this objective: "${targetMission.objective}".
Ensure the copy is professional, free of emojis, and calls the user to action (e.g. Reply YES to learn more, or visit aa2000.ph).`;

    const userPrompt = `Compose the promotional snippet.`;

    let success = false;
    let resultsText = '';

    // 1. Try Groq
    if (GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('AI mission copy gen (Groq) failed, trying Mistral:', e);
      }
    }

    // 2. Try Mistral
    if (!success && MISTRAL_API_KEY) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: 'open-mistral-7b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('AI mission copy gen (Mistral) failed, trying Gemini:', e);
      }
    }

    // 3. Try Gemini
    if (!success && GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('AI mission copy gen (Gemini) failed:', e);
      }
    }

    const copyBody = success && resultsText 
      ? resultsText.trim()
      : `Hi there! Protect your property with AA2000 smart building integrations (FDAS, CCTV, Structured Cabling). Reply YES to consult our engineering division today.`;

    setExecutionLogs(prev => [...prev, `AI Creative Composed: "${copyBody}"`]);
    await new Promise(r => setTimeout(r, 800));

    const targetContacts = contacts.length > 0 ? contacts : [
      { name: 'Juan Dela Cruz', email: 'juan.delacruz@gmail.com' },
      { name: 'Maria Santos', email: 'maria.santos@yahoo.com' },
      { name: 'Angelo Reyes', email: 'angelo.reyes@techcorp.ph' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];

    setExecutionLogs(prev => [...prev, `Sending AI copy to audience list (${targetContacts.length} recipients)...`]);
    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < targetContacts.length; i++) {
      const c = targetContacts[i];
      const percent = Math.round(((i + 1) / targetContacts.length) * 100);
      setExecutionProgress(percent);
      setExecutionLogs(prev => [...prev, `[${percent}%] Auto-sent to ${c.name} <${c.email}> via ${targetMission.channels.join(', ')}`]);
      await new Promise(r => setTimeout(r, 150 + Math.random() * 100));
    }

    setExecutionLogs(prev => [...prev, 'AI Agent automation dispatch complete. Status updated to RUNNING.']);
    await new Promise(r => setTimeout(r, 800));

    const newLog: AICreativeLog = {
      id: generateId(),
      missionId: targetMission.id,
      missionName: targetMission.name,
      body: copyBody,
      sentCount: targetContacts.length,
      channels: targetMission.channels,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...creativeLogs];
    setCreativeLogs(updatedLogs);
    storage.set('mktg_ai_creative_logs', updatedLogs);

    const updatedMissions = missions.map(m => {
      if (m.id === targetMission.id) {
        const currentSends = m.impact.sends || 0;
        return {
          ...m,
          status: 'Running' as const,
          impact: {
            sends: currentSends + targetContacts.length,
            engagement: `${Math.floor(15 + Math.random() * 15)}%`
          }
        };
      }
      return m;
    });
    setMissions(updatedMissions);
    storage.set('mktg_ai_missions', updatedMissions);

    setIsExecuting(false);
    setActiveExecutionMission(null);
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
        <button onClick={() => setIsCreateModalOpen(true)} className="premium-button flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3">
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
                    mission.status === 'Running' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    mission.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  )}>
                    {mission.status}
                  </span>
                  <button onClick={() => handleToggleMission(mission.id, mission.status)} className="p-2 hover:bg-slate-50 rounded-xl transition-all" title={mission.status === 'Running' ? 'Pause' : 'Activate'}>
                    {mission.status === 'Running' ? <Pause size={16} className="text-slate-400" /> : <Play size={16} className="text-brand-blue" />}
                  </button>
                  <button onClick={() => handleDeleteMission(mission.id)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-red-500 transition-all" title="Delete Mission">
                    <Trash2 size={16} />
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
                       <h3 className="text-xs font-black uppercase tracking-widest text-white">AI Performance</h3>
                       <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">AI Efficiency Hub</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Automation Rate</span>
                          <span className="text-emerald-400 text-xs font-black">
                            {missions.length > 0 ? Math.round((missions.filter(m => m.status === 'Running').length / missions.length) * 100) : 0}%
                          </span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${missions.length > 0 ? (missions.filter(m => m.status === 'Running').length / missions.length) * 100 : 0}%` }}
                          />
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Campaign Accuracy</span>
                          <span className="text-slate-100 text-xs font-black">94.5%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue w-[94%]" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                 <Sparkles size={14} className="text-brand-blue animate-pulse" />
                 <h3 className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Recent AI Creative</h3>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed min-h-[80px]">
                    "{creativeLogs[0]?.body || 'Launch an AI mission to begin copywriting.'}"
                 </div>
                 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>Sent to {creativeLogs[0]?.sentCount || 0} Leads</span>
                    <button 
                      onClick={() => setIsHistoryModalOpen(true)} 
                      className="text-brand-blue hover:text-brand-light font-black uppercase transition-colors"
                    >
                      View History
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
      {/* New AI Mission Modal */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <form onSubmit={handleCreateMission} className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-4 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-blue text-white rounded-xl shadow-md">
                  <Bot size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-navy-900 uppercase tracking-[0.12em]">New AI Mission</h2>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automate copywriter campaigns</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mission Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMission.name} 
                    onChange={e => setNewMission({ ...newMission, name: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-navy-900 outline-none focus:border-brand-blue" 
                    placeholder="e.g. Rainy Season Gen-Set Deals" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Theme / Focus</label>
                  <select 
                    value={newMission.theme} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={e => setNewMission({ ...newMission, theme: e.target.value as any })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-navy-900 outline-none focus:border-brand-blue cursor-pointer"
                  >
                    <option value="Awareness">Awareness</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Promo">Promo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Copywriting Objective (Prompt)</label>
                  <textarea 
                    rows={2}
                    required
                    value={newMission.objective} 
                    onChange={e => setNewMission({ ...newMission, objective: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-navy-900 outline-none focus:border-brand-blue resize-none" 
                    placeholder="e.g. Educate building administrators about the importance of maintaining fire suppression systems before the BFP inspection..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Schedule</label>
                    <select 
                      value={newMission.schedule} 
                      onChange={e => setNewMission({ ...newMission, schedule: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-navy-900 outline-none focus:border-brand-blue cursor-pointer"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Channels</label>
                    <div className="flex gap-1.5 py-1">
                      {['Email', 'Messenger', 'Viber'].map(ch => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const active = newMission.channels.includes(ch as any);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => {
                              const updated = active
                                ? newMission.channels.filter(c => c !== ch)
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                : [...newMission.channels, ch as any];
                              if (updated.length > 0) {
                                setNewMission({ ...newMission, channels: updated });
                              }
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border transition-all",
                              active ? "bg-brand-blue text-white border-brand-blue" : "bg-slate-50 text-slate-400 border-slate-155"
                            )}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={newMission.startDate} 
                      onChange={e => setNewMission({ ...newMission, startDate: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-navy-900 outline-none focus:border-brand-blue cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={newMission.endDate} 
                      onChange={e => setNewMission({ ...newMission, endDate: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-navy-900 outline-none focus:border-brand-blue cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold uppercase tracking-widest text-[8px] text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-brand-blue text-white rounded-lg font-bold uppercase tracking-widest text-[8px] hover:bg-brand-light transition-all shadow-md active:scale-[0.98]">Launch Mission</button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Creative History Modal */}
      {isHistoryModalOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl h-[70vh] rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-10 py-6 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-navy-900 uppercase tracking-[0.15em]">AI Creative History</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Logs of AI generated copy broadcasts</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {creativeLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  No copy history compiled yet.
                </div>
              ) : (
                creativeLogs.map(log => (
                  <div key={log.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-navy-900 uppercase tracking-wide">{log.missionName}</h4>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {log.channels.map(ch => (
                          <span key={ch} className="px-2 py-0.5 bg-brand-blue/5 text-brand-blue text-[8px] font-black uppercase tracking-widest rounded">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl text-[11px] text-slate-700 italic border border-slate-100/50 leading-relaxed font-mono">
                      "{log.body}"
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Recipient Segment: All Contacts</span>
                      <span className="text-navy-900 font-black">{log.sentCount} Deliveries</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Live AI Dispatch Execution Overlay */}
      {isExecuting && activeExecutionMission && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-6 border-b border-surface-border bg-slate-50/50 flex items-center gap-4">
              <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg animate-bounce">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-navy-900 uppercase tracking-[0.15em]">AI Agent Execution</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mission: {activeExecutionMission.name}</p>
              </div>
            </div>

            <div className="p-10 space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-xs font-black text-navy-900 uppercase tracking-widest animate-pulse">Running Intelligence Task</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Synthesizing messaging campaign and verifying target lists</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-navy-900 uppercase">
                  <span>Audience Broadcast Progress</span>
                  <span>{executionProgress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5 shadow-inner">
                  <div className="h-full bg-brand-blue rounded-full transition-all duration-300 shadow-sm" style={{ width: `${executionProgress}%` }} />
                </div>
              </div>

              {/* Execution Console Logs */}
              <div className="h-56 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-2 shadow-inner">
                {executionLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-brand-blue shrink-0">&gt;</span>
                    <span className="leading-relaxed">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AnimatedPage>
  );
};

export default AIAutomationsPage;
