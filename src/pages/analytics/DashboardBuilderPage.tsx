import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';
import { useCRMStore } from '../../stores/modules/crmStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

const SalesPerformance = () => {
  const navigate = useNavigate();
  const { deals, fetchData } = usePipelinesStore();
  const { contacts, fetchContacts } = useCRMStore();

  useEffect(() => {
    fetchData();
    fetchContacts();
  }, [fetchData, fetchContacts]);

  // Calculations
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const leadCount = contacts.length;
  const wonDeals = deals.filter(d => d.stageId?.toLowerCase().includes('won')).length;
  const winRate = deals.length > 0 ? ((wonDeals / deals.length) * 100).toFixed(1) : '0';

  return (
    <AnimatedPage className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900 mb-1 tracking-tighter  uppercase">Sales Performance</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Executive Business Intelligence & Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-border rounded-xl shadow-sm">
             <Calendar size={14} className="text-slate-400" />
             <span className="text-[10px] font-semibold text-navy-900 uppercase tracking-widest">Last 30 Days</span>
          </div>
          <button className="premium-button flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-5 py-2.5 shadow-xl shadow-brand-blue/20">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue Pipeline', value: `₱${(totalValue/1000000).toFixed(1)}M`, change: '+12.5%', isUp: true, icon: DollarSign, color: 'text-brand-blue' },
          { label: 'Active Leads', value: leadCount, change: '+8.2%', isUp: true, icon: Users, color: 'text-purple-600' },
          { label: 'Win Rate', value: `${winRate}%`, change: '-2.4%', isUp: false, icon: Target, color: 'text-emerald-500' },
          { label: 'AI Efficiency', value: '94.2%', change: '+5.1%', isUp: true, icon: Zap, color: 'text-amber-500' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 border-b-2 border-b-transparent hover:border-b-brand-blue transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-slate-50 group-hover:bg-brand-blue/5 transition-colors", kpi.color)}>
                   <kpi.icon size={20} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold",
                  kpi.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                   {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                   {kpi.change}
                </div>
             </div>
             <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
             <h3 className="text-2xl font-semibold text-navy-900  tracking-tighter mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Forecast Chart */}
        <div className="lg:col-span-2 glass-card p-8">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest ">Revenue Growth Forecast</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Projected Sales Performance vs Previous Period</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 mr-4">
                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">Current</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">Previous</span>
                 </div>
              </div>
           </div>

           <div className="h-64 flex items-end justify-between gap-2">
              {[0.4, 0.6, 0.45, 0.8, 0.5, 0.9, 0.7, 0.85, 0.6, 0.95, 0.75, 1.0].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                   <div className="w-full bg-slate-50 rounded-t-xl absolute bottom-0 transition-all" style={{ height: `${h * 70}%` }}></div>
                   <div className="w-full bg-brand-blue rounded-t-xl absolute bottom-0 transition-all group-hover:bg-navy-900" style={{ height: `${h * 100}%` }}>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-navy-900 text-white text-[9px] font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                         ₱{((totalValue / 12) * h).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-6 text-[9px] font-semibold text-slate-300 uppercase tracking-widest">
              {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => <span key={m}>{m}</span>)}
           </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="glass-card p-8">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest ">Lead Sources</h3>
              <PieChartIcon size={18} className="text-slate-400" />
           </div>
           
           <div className="relative h-48 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-[12px] border-slate-50 relative">
                 <div className="absolute inset-0 rounded-full border-[12px] border-brand-blue border-t-transparent border-l-transparent -rotate-45"></div>
                 <div className="absolute inset-0 rounded-full border-[12px] border-purple-500 border-b-transparent border-r-transparent rotate-12"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-navy-900  tracking-tighter">{leadCount}</span>
                    <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">Total Leads</span>
                 </div>
              </div>
           </div>

           <div className="mt-10 space-y-4">
              {[
                { label: 'Viber Inquiries', count: '45%', color: 'bg-purple-600' },
                { label: 'Facebook / Meta', count: '30%', color: 'bg-brand-blue' },
                { label: 'Website Chat', count: '15%', color: 'bg-emerald-500' },
                { label: 'Direct Import', count: '10%', color: 'bg-slate-200' },
              ].map(source => (
                <div key={source.label} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full", source.color)}></div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{source.label}</span>
                   </div>
                   <span className="text-[10px] font-semibold text-navy-900">{source.count}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Funnel */}
        <div className="glass-card p-8">
           <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest  mb-8">Conversion Funnel</h3>
           <div className="space-y-2">
              {[
                { label: 'Total Inquiries', value: leadCount, color: 'bg-slate-900', w: '100%' },
                { label: 'Qualified Leads', value: Math.floor(leadCount * 0.7), color: 'bg-navy-900', w: '85%' },
                { label: 'Proposal Sent', value: deals.length, color: 'bg-brand-blue', w: '70%' },
                { label: 'Negotiation', value: Math.floor(deals.length * 0.4), color: 'bg-indigo-600', w: '50%' },
                { label: 'Closed Won', value: wonDeals, color: 'bg-emerald-500', w: '35%' },
              ].map((step, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="flex items-center justify-between mb-1 px-2">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{step.label}</span>
                      <span className="text-[10px] font-semibold text-navy-900">{step.value}</span>
                   </div>
                   <div className="h-10 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-1">
                      <div 
                        className={cn("h-full rounded-lg transition-all duration-700 group-hover:brightness-110 shadow-sm", step.color)} 
                        style={{ width: step.w }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Team Leaderboard / Recent Performance */}
        <div className="lg:col-span-2 glass-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest ">Real-time Performance Feed</h3>
              <Activity size={18} className="text-brand-blue animate-pulse" />
           </div>
           
           <div className="space-y-4">
              {[
                { user: 'AI Support Agent', action: 'Handed over a high-value lead (₱120K)', time: '2 mins ago', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { user: 'Marketing Engine', action: 'Campaign "Fire Prevention" reached 2.5K users', time: '15 mins ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { user: 'Sales Dashboard', action: 'Pipeline Value increased by 5.4%', time: '1 hour ago', icon: TrendingUp, color: 'text-brand-blue', bg: 'bg-blue-50' },
                { user: 'Server Connector', action: 'Pricing database synced with physical server', time: '3 hours ago', icon: Database, color: 'text-slate-500', bg: 'bg-slate-50' },
                { user: 'Lead Scanner', action: 'Extracted 12 items from client photo (Viber)', time: '5 hours ago', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-brand-blue/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm", item.bg, item.color)}>
                         <item.icon size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-semibold text-navy-900 uppercase tracking-widest">{item.user}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.action}</p>
                      </div>
                   </div>
                   <span className="text-[9px] font-semibold text-slate-300 uppercase">{item.time}</span>
                </div>
              ))}
           </div>
           
           <button onClick={() => navigate('/audit-logs')} className="w-full mt-8 py-4 border border-dashed border-slate-200 rounded-[2rem] text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all">
              View Detailed System Logs
           </button>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default SalesPerformance;

const Database = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);
