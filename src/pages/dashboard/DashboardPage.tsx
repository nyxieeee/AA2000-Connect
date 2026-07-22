import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Bot,
  Sparkles,
  X,
  Loader2,
  Target,
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '../../utils/cn';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';
import { useCRMStore } from '../../stores/modules/crmStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';
import { useAuthStore } from '../../stores/authStore';
import { useTasksStore } from '../../stores/modules/tasksStore';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const DashboardPage = () => {
  const { deals, fetchData } = usePipelinesStore();
  const { fetchContacts, fetchCompanies } = useCRMStore();
  const { user } = useAuthStore();
  const { addTask } = useTasksStore();

  const [isAIScanOpen, setIsAIScanOpen] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [syncMode, setSyncMode] = useState<'live' | 'historical'>('live');
  const navigate = useNavigate();

  const handleExecuteRecommendations = () => {
    if (!aiResults) return;

    let createdCount = 0;
    const actionKeywords = [
      'require', 'suggest', 'should', 'need', 'follow', 'map', 
      'contact', 'call', 'send', 'review', 'set', 'enable', 
      'configure', 'implement', 'execute', 'audit', 'velocity', 'check'
    ];

    aiResults.forEach(rec => {
      const isActionable = actionKeywords.some(keyword => rec.toLowerCase().includes(keyword));
      if (isActionable) {
        addTask({
          title: rec,
          assignedTo: user?.name || 'Sales Rep',
          completed: false,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // tomorrow
        });
        createdCount++;
      }
    });

    setIsAIScanOpen(false);

    if (createdCount > 0) {
      alert(`Created ${createdCount} task(s) from AI recommendations. Redirecting to your Tasks...`);
      navigate('/tasks');
    } else {
      alert('Recommendations reviewed.');
    }
  };

  useEffect(() => {
    fetchData();
    fetchContacts();
    fetchCompanies();
  }, [fetchData, fetchContacts, fetchCompanies]);

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const activeDealsCount = deals.filter(d => d.stageId && !d.stageId.toLowerCase().includes('won') && !d.stageId.toLowerCase().includes('lost')).length;

  const revenueData = [
    { name: 'Jan', value: 1200000 },
    { name: 'Feb', value: 1800000 },
    { name: 'Mar', value: 1500000 },
    { name: 'Apr', value: 2400000 },
    { name: 'May', value: totalValue > 0 ? totalValue : 3100000 },
  ];

  const automationData = [
    { name: 'Viber', saved: 120, total: 150 },
    { name: 'FB Page', saved: 210, total: 240 },
    { name: 'Website', saved: 85, total: 100 },
    { name: 'TikTok', saved: 45, total: 60 },
  ];

  const leadSources = [
    { name: 'Social', value: 45, color: '#1E40AF' },
    { name: 'Direct', value: 25, color: '#10b981' },
    { name: 'Referral', value: 20, color: '#8b5cf6' },
    { name: 'Ads', value: 10, color: '#f59e0b' },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const runAIScan = async () => {
    setIsAIScanOpen(true);
    setAiScanning(true);
    setAiResults(null);

    const systemPrompt = `You are a strategic CRM business insights engine for AA2000 Security & Technology Solutions.
Analyze the current pipeline and output exactly 4 bullet-point recommendations (one sentence each, under 15 words) for increasing revenue, closing open proposals, or optimizing sales.
Do not use any Markdown formatting (no hashes, no asterisks, no headers). Output raw text lines. Use appropriate business emojis.`;
    const userPrompt = `Current Pipeline State: Total value of deals in pipeline is ${formatCurrency(totalValue)}, total active deals count is ${activeDealsCount}.`;

    let success = false;
    let resultsText = '';

    // 1. Try Groq
    if (GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.6,
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Dashboard AI scan (Groq) failed, trying fallbacks:', e);
      }
    }

    // 2. Try Mistral
    if (!success && MISTRAL_API_KEY) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'open-mistral-nemo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.6,
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Dashboard AI scan (Mistral) failed, trying fallbacks:', e);
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
        console.error('Dashboard AI scan (Gemini) failed:', e);
      }
    }

    if (success && resultsText) {
      // Split by lines, strip markdown, and limit to 4 non-empty lines
      const items = resultsText
        .split('\n')
        .map(line => line.replace(/^([*\-•\d.\s])+\s*/, '').replace(/\*\*/g, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 4);

      if (items.length > 0) {
        setAiResults(items);
        setAiScanning(false);
        return;
      }
    }

    // Offline simulation fallback
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setAiResults([
      `Pipeline value is at ${formatCurrency(totalValue || 4850000)}. Q2 targets look solid.`,
      `${activeDealsCount || 5} active proposals require timely follow-ups to maintain velocity.`,
      `Automated basic inquiry responses are holding steady at 84% completion.`,
      `Suggest mapping stakeholder hierarchy on key accounts to secure wins.`
    ]);
    setAiScanning(false);
  };

  return (
    <AnimatedPage className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title mb-1">Dashboard</h1>
          <p className="sub-title tracking-[0.2em]">AA2000 Security & Technology Solutions Inc. • Command Center</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-white border border-surface-border rounded-2xl p-1 shadow-sm">
                <button onClick={() => setSyncMode('live')} className={cn("px-5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all", syncMode === 'live' ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-400 hover:text-navy-900")}>Live Sync</button>
                <button onClick={() => setSyncMode('historical')} className={cn("px-5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all", syncMode === 'historical' ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-400 hover:text-navy-900")}>Historical</button>
           </div>
           <button 
            onClick={runAIScan}
            className="premium-button flex items-center gap-2"
           >
             <Bot size={16} />
             <span>Run AI Analysis</span>
           </button>
        </div>
      </div>

      {/* Primary KPIs */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', val: formatCurrency(totalValue || 4850000), icon: TrendingUp, trend: '+12.5%', color: 'text-brand-blue', bg: 'bg-blue-50' },
          { label: 'Active Pipeline', val: activeDealsCount.toString(), icon: Target, trend: '+4', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'AI Savings (Hrs)', val: '248h', icon: Bot, trend: '92%', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Win Rate', val: '64%', icon: ShieldCheck, trend: '+2.1%', color: 'text-brand-blue', bg: 'bg-blue-50' },
        ].map(kpi => (
          <AnimatedListItem key={kpi.label}>
          <div className="glass-card group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:bg-brand-blue/5"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div className={cn("p-4 rounded-[1.25rem] shadow-sm transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                    <kpi.icon size={22} />
                 </div>
                 <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{kpi.trend}</span>
              </div>
              <div>
                <p className="sub-title mb-1">{kpi.label}</p>
                <h4 className="text-2xl font-semibold text-navy-900 tracking-tighter ">{kpi.val}</h4>
              </div>
            </div>
          </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card flex flex-col min-h-[480px]">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest ">Revenue Growth Velocity</h3>
                <p className="sub-title mt-1 tracking-widest">Projected vs Actual (PHP)</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-brand-blue rounded-full shadow-sm"></div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Live Flow</span>
                 </div>
              </div>
           </div>
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8', letterSpacing: '0.1em' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                    formatter={(val: number) => formatCurrency(Number(val))}
                  />
                  <Area type="monotone" dataKey="value" stroke="#1E40AF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* AI Efficiency Meter */}
        <div className="glass-card flex flex-col">
           <div className="mb-10">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest ">Automation impact</h3>
              <p className="sub-title mt-1 tracking-widest">Neural Handling per Channel</p>
           </div>
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={automationData} layout="vertical" barSize={14}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#1e293b', style: { textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="saved" radius={[0, 8, 8, 0]} fill="#1E40AF" />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#f1f5f9" />
                </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-10 p-6 bg-slate-50 rounded-[1.5rem] space-y-4 border border-slate-100 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                 <span>Neural Efficiency</span>
                 <span className="text-brand-blue">94.2%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                 <div className="h-full bg-brand-blue w-[94%] shadow-lg shadow-brand-blue/20"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Secondary Intelligence Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Market Distribution */}
         <div className="glass-card flex flex-col justify-between items-center text-center">
            <h3 className="text-[10px] font-semibold text-navy-900 uppercase tracking-[0.3em]  mb-8">Market Sector</h3>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadSources}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
               {leadSources.map(source => (
                 <div key={source.name} className="flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: source.color }}></div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{source.name}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Sales Target Progress */}
         <div className="glass-card flex flex-col items-center justify-center space-y-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-50" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.72)} className="text-brand-blue" strokeLinecap="round" />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-semibold text-navy-900 leading-none  tracking-tighter">72%</span>
                  <span className="sub-title mt-1 mb-0">Quota</span>
               </div>
            </div>
            <div className="text-center space-y-1">
               <p className="text-[11px] font-semibold text-navy-900 uppercase tracking-[0.2em]">Monthly Performance</p>
               <p className="text-sm font-bold text-slate-400 ">₱3.1M / ₱4.5M</p>
            </div>
         </div>

         {/* Priority Intelligence Feed */}
         <div className="lg:col-span-2 glass-card overflow-hidden !p-0">
            <div className="p-8 border-b border-surface-border bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                    <Database size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest ">Neural Insights Feed</h3>
               </div>
               <button onClick={() => navigate('/audit-logs')} className="text-[9px] font-semibold text-brand-blue uppercase tracking-widest hover:underline">Full Log</button>
            </div>
            <div className="divide-y divide-surface-border">
               {[
                 { msg: 'High conversion probability for 3 solar projects in North Pipeline.', type: 'Success' },
                 { msg: 'Viber inquiry volume increased by 28% in the last 24 hours.', type: 'Alert' },
                 { msg: 'Lead response time improved by 1.2s since AI agent update.', type: 'Pulse' },
               ].map((item, i) => (
                 <div key={i} className="p-6 hover:bg-slate-50 transition-all flex items-start gap-6 group cursor-pointer">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0 shadow-sm",
                      item.type === 'Success' ? 'bg-emerald-500 animate-pulse' : item.type === 'Alert' ? 'bg-amber-500' : 'bg-brand-blue'
                    )}></div>
                    <p className="text-xs font-bold text-navy-900 leading-relaxed group-hover:translate-x-2 transition-transform ">"{item.msg}"</p>
                    <ChevronRight size={16} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                 </div>
               ))}
            </div>
         </div>
       </div>

      {/* AI Strategy Modal */}
      {isAIScanOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white shadow-md font-semibold text-base">
                  AI
                </div>
                <div>
                  <h2 className="text-sm font-bold text-navy-900 uppercase tracking-widest leading-none">Strategy Engine</h2>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider mb-0">Synthesizing Market Intelligence</p>
                </div>
              </div>
              <button onClick={() => setIsAIScanOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-300 hover:text-navy-900 border border-transparent hover:border-slate-100 shadow-sm">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {aiScanning ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative">
                    <Loader2 size={60} className="text-brand-blue animate-spin" />
                    <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-navy-900 uppercase tracking-widest">Processing Intelligence...</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider max-w-xs mx-auto leading-relaxed opacity-60">Evaluating conversation sentiment & pipeline velocity models.</p>
                  </div>
                </div>
              ) : aiResults ? (
                <div className="space-y-4">
                  {aiResults.map((result, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-50">
                         <div className="w-2.5 h-2.5 bg-brand-blue rounded-full"></div>
                      </div>
                      <p className="text-xs text-navy-900 leading-relaxed font-bold">"{result}"</p>
                    </div>
                  ))}
                  <div className="pt-4">
                     <button 
                       onClick={handleExecuteRecommendations}
                       className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-brand-blue/25 hover:bg-brand-light hover:scale-[1.02] active:scale-95 transition-all"
                     >
                       Execute Recommendations
                     </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}
    </AnimatedPage>
  );
};

export default DashboardPage;
