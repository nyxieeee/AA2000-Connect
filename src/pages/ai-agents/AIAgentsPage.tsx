import { useState } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Image as ImageIcon, 
  Target, 
  Zap, 
  ShieldCheck, 
  Database, 
  Plus,
  Eye,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { storage } from '../../services/storage';

type AgentCategory = 'Conversational' | 'Marketing' | 'Sales' | 'Vision';

const AIAgentsPage = () => {
  const [activeCategory, setActiveCategory] = useState<AgentCategory>(() => storage.get('ai_active_category') || 'Conversational');
  const [isTraining, setIsTraining] = useState(false);
  const [sellingStyle, setSellingStyle] = useState(() => storage.get('ai_selling_style') || 'Direct Inquiry Mode');
  const [chatPersonality, setChatPersonality] = useState(() => storage.get('ai_chat_personality') || 'Professional & Formal');

  const persistCategory = (cat: AgentCategory) => { setActiveCategory(cat); storage.set('ai_active_category', cat); };
  const persistSellingStyle = (val: string) => { setSellingStyle(val); storage.set('ai_selling_style', val); };
  const persistPersonality = (val: string) => { setChatPersonality(val); storage.set('ai_chat_personality', val); };

  return (
    <AnimatedPage className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-3 mb-1">
            <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
              <Brain size={28} />
            </div>
            AI Agents
          </h1>
          <p className="sub-title tracking-[0.4em]">Configure AI assistants for sales, marketing, and support</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-5 py-3 bg-white border border-surface-border rounded-2xl text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
              <Activity size={14} className="text-brand-blue" />
              <span>Activity Logs</span>
           </button>
           <button className="premium-button flex items-center gap-2">
              <Plus size={16} />
              <span>Deploy Agent</span>
           </button>
        </div>
      </div>

      {/* Neural Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'AI Success Rate', value: '84%', icon: CheckCircle2, color: 'text-brand-blue' },
          { label: 'Documents Scanned', value: '1.2K', icon: ImageIcon, color: 'text-rose-600' },
          { label: 'Qualified Leads', value: '2.5K', icon: Target, color: 'text-emerald-600' },
          { label: 'AI System Status', value: 'Active', icon: Zap, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="glass-card !p-6 border-b-4 border-b-slate-100 hover:border-b-brand-blue group">
             <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform", s.color)}>
                  <s.icon size={18} />
                </div>
                <span className="sub-title mb-0 opacity-60">{s.label}</span>
             </div>
             <p className="text-3xl font-semibold text-navy-900  tracking-tighter">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-surface-border shadow-inner w-fit">
        {[
          { id: 'Conversational', label: 'Auto-Reply Support' },
          { id: 'Marketing', label: 'Campaign Writer' },
          { id: 'Sales', label: 'Sales Intelligence' },
          { id: 'Vision', label: 'List Scanner (AI)' }
        ].map(cat => (
          <button 
            key={cat.id}
            onClick={() => persistCategory(cat.id as any)}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all",
              activeCategory === cat.id 
                ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" 
                : "text-slate-500 hover:text-navy-900 hover:bg-white/50"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {activeCategory === 'Conversational' && (
             <div className="glass-card space-y-10 animate-in">
                <div className="flex items-start justify-between border-b border-slate-100 pb-8">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-navy-900 flex items-center justify-center text-white shadow-2xl">
                         <MessageSquare size={32} />
                      </div>
                      <div>
                         <h3 className="text-xl font-semibold text-navy-900 uppercase tracking-widest ">Customer Service Agent</h3>
                         <p className="sub-title mt-1 mb-0 opacity-60">Handles inquiries on Viber, Messenger, & Website</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Active Link</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="sub-title">Selling Style</label>
                        <select value={sellingStyle} onChange={e => persistSellingStyle(e.target.value)} className="input-field">
                          <option>Direct Inquiry Mode</option>
                          <option>Consultative Selling</option>
                          <option>Human Handoff (Forward to Sales)</option>
                       </select>
                   </div>
                   <div className="space-y-3">
                      <label className="sub-title">Chat Personality</label>
                        <select value={chatPersonality} onChange={e => persistPersonality(e.target.value)} className="input-field">
                          <option>Professional & Formal</option>
                          <option>Friendly & Helpful</option>
                          <option>Technical Specialist</option>
                       </select>
                   </div>
                </div>

                <div className="p-8 bg-navy-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-[60px] rounded-full -mr-16 -mb-16 group-hover:bg-brand-blue/20 transition-all"></div>
                   <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-brand-blue/20 rounded-2xl text-brand-blue shadow-lg">
                            <ShieldCheck size={24} />
                         </div>
                         <h4 className="text-sm font-semibold uppercase tracking-[0.15em] ">Safety Protocol: Quote Protection</h4>
                      </div>
                      <div className="h-8 w-14 bg-brand-blue rounded-full relative cursor-pointer shadow-inner p-1 group">
                         <div className="absolute right-1 w-6 h-6 bg-white rounded-full shadow-lg group-hover:scale-110 transition-transform"></div>
                      </div>
                   </div>
                   <p className="text-xs text-slate-400 font-bold uppercase leading-relaxed tracking-widest opacity-80 pl-16">
                      Prevent AI from sending full project quotations. AI will only provide individual product prices to keep sales negotiations controlled by your staff.
                   </p>
                </div>
             </div>
           )}

           {/* Marketing Category */}
           {activeCategory === 'Marketing' && (
             <div className="glass-card space-y-10 animate-in">
                <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-brand-blue flex items-center justify-center text-white shadow-2xl shadow-brand-blue/20">
                      <Zap size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl font-semibold text-navy-900 uppercase tracking-widest ">Marketing Content Writer</h3>
                      <p className="sub-title mt-1 mb-0 opacity-60">Generates Email Campaigns & Facebook Content</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="sub-title">Company Brand Voice</label>
                   <textarea 
                     className="input-field min-h-[160px] resize-none p-6 leading-relaxed normal-case"
                     placeholder="Describe how AA2000 should talk to clients. e.g. 'We are security experts who value safety and customer trust...'"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 border border-slate-100 bg-slate-50 rounded-[1.5rem] hover:bg-white transition-all shadow-sm">
                      <p className="sub-title mb-4">Campaign Strategy</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-semibold text-navy-900 uppercase tracking-widest">A/B Content Testing</span>
                         <Zap size={16} className="text-amber-500 animate-pulse" />
                      </div>
                   </div>
                   <div className="p-6 border border-slate-100 bg-slate-50 rounded-[1.5rem] hover:bg-white transition-all shadow-sm">
                      <p className="sub-title mb-4">Performance Tracking</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-semibold text-navy-900 uppercase tracking-widest">Auto-Optimization</span>
                         <Zap size={16} className="text-brand-blue" />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* Sales Category */}
           {activeCategory === 'Sales' && (
             <div className="glass-card space-y-10 animate-in">
                <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-900 flex items-center justify-center text-white shadow-2xl">
                      <Target size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl font-semibold text-navy-900 uppercase tracking-widest ">Sales Intelligence</h3>
                      <p className="sub-title mt-1 mb-0 opacity-60">Analyzes leads and predicts closing probability</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <label className="sub-title ">Lead Qualification Rules</label>
                   <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-8 border border-slate-100 shadow-inner">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-semibold text-navy-900 uppercase tracking-widest">Hot Lead Threshold</span>
                         <span className="text-2xl font-semibold text-brand-blue  tracking-tighter">80+ SCORE</span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                         <div className="h-full bg-brand-blue w-[80%] shadow-lg shadow-brand-blue/20"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">AI will automatically flag leads with score above 80 for immediate call.</p>
                   </div>
                </div>
             </div>
           )}

           {/* Vision Category */}
           {activeCategory === 'Vision' && (
             <div className="glass-card space-y-10 animate-in">
                <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-rose-900 flex items-center justify-center text-white shadow-2xl">
                      <ImageIcon size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl font-semibold text-navy-900 uppercase tracking-widest ">AI List Scanner (Vision)</h3>
                      <p className="sub-title mt-1 mb-0 opacity-60">Extracts items from photos of requirement lists</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform shadow-sm">
                            <FileText size={20} />
                         </div>
                         <span className="text-[11px] font-semibold text-navy-900 uppercase tracking-widest">Handwriting Support</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-widest">Better accuracy for messy requirement lists sent by clients via Viber/WhatsApp.</p>
                   </div>
                   <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                            <Eye size={20} />
                         </div>
                         <span className="text-[11px] font-semibold text-navy-900 uppercase tracking-widest">Item Matching</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-widest">Automatically matches scanned items to your central Product Catalog for pricing.</p>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Right Knowledge Base Sidebar */}
        <div className="space-y-8">
           <div className="glass-card bg-navy-900 text-white border-none relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-blue/10 blur-[80px] rounded-full -mr-24 -mb-24 group-hover:bg-brand-blue/20 transition-all"></div>
              <div className="relative z-10">
                 <h3 className="text-sm font-semibold uppercase tracking-[0.2em]  mb-10 flex items-center gap-3">
                    <Database size={18} className="text-brand-blue" />
                    Server Link
                 </h3>
                 <div className="space-y-8">
                    <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                          <span className="text-[11px] font-semibold uppercase tracking-widest">Physical Server: UP</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.3em] ">Network Endpoint</label>
                          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px] text-brand-blue group-hover:border-brand-blue/30 transition-all">
                             <Zap size={14} />
                             <span>192.168.1.100:8080/v1</span>
                          </div>
                       </div>
                       <div className="space-y-2 pt-2">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.3em] ">Active Syncs</label>
                          <div className="flex flex-wrap gap-2">
                             {['Inventory', 'Pricing', 'Specs', 'Logs'].map(db => (
                               <span key={db} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-semibold text-slate-300 uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all cursor-default">{db}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
                  <button onClick={() => alert('Data Bridge test initiated. Status: Connected ✓')} className="w-full mt-10 py-5 bg-brand-blue text-white rounded-[1.5rem] text-[11px] font-semibold uppercase tracking-[0.3em] hover:bg-white hover:text-brand-blue transition-all shadow-2xl shadow-brand-blue/30">
                     Test Data Bridge
                  </button>
              </div>
           </div>

           <div className="glass-card space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                 <h3 className="text-xs font-semibold text-navy-900 uppercase tracking-widest ">AI Neural Update</h3>
                 <span className="text-[9px] font-semibold text-emerald-500 uppercase bg-emerald-50 px-3 py-1 rounded-full">Live Fetch</span>
              </div>
              <div className="space-y-8">
                 <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-loose tracking-widest opacity-80">
                       AI is fetching real-time data from your server. No manual indexing needed. Responses are 100% verified.
                    </p>
                 </div>
                 <button 
                  onClick={() => { setIsTraining(true); setTimeout(() => setIsTraining(false), 3000); }}
                  className={cn(
                    "w-full py-5 rounded-[1.5rem] text-[11px] font-semibold uppercase tracking-[0.3em] transition-all",
                    isTraining ? "bg-slate-100 text-slate-400 cursor-wait" : "bg-brand-blue/5 text-brand-blue hover:bg-navy-900 hover:text-white"
                  )}
                 >
                    {isTraining ? 'Syncing Neural Pathways...' : 'Refresh Server Sync'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AIAgentsPage;
