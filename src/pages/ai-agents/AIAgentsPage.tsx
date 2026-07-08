import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MessageSquare, Image as ImageIcon, Target, Zap,
  Database, Plus, FileText, Activity,
  CheckCircle2, Trash2, X, Play, Calendar, Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useAIAgentsStore, type AIAgent, type AgentCategory } from '../../stores/modules/aiAgentsStore';

const CATEGORY_ICONS: Record<AgentCategory, React.ElementType> = {
  Conversational: MessageSquare,
  Marketing: Zap,
  Sales: Target,
  Vision: ImageIcon
};

const CATEGORY_COLORS: Record<AgentCategory, string> = {
  Conversational: 'text-brand-blue bg-blue-50 border-blue-100',
  Marketing: 'text-amber-500 bg-amber-50 border-amber-100',
  Sales: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  Vision: 'text-rose-600 bg-rose-50 border-rose-100'
};

const AIAgentsPage = () => {
  const { agents, addAgent, toggleAgentStatus, deleteAgent, addAgentLog, updateAgentModel } = useAIAgentsStore();
  const [activeCategory, setActiveCategory] = useState<AgentCategory>('Conversational');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    role: '',
    description: '',
    category: 'Conversational' as AgentCategory,
    schedule: 'daily' as AIAgent['schedule'],
    model: 'gemini-2.5-flash',
    personality: '',
    sellingStyle: ''
  });

  const filteredAgents = agents.filter(a => a.category === activeCategory);

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    
    addAgent({
      name: form.name,
      role: form.role,
      description: form.description || form.role,
      category: form.category,
      schedule: form.schedule,
      model: form.model,
      personality: form.personality || undefined,
      sellingStyle: form.sellingStyle || undefined
    });

    // Reset Form
    setForm({
      name: '',
      role: '',
      description: '',
      category: 'Conversational',
      schedule: 'daily',
      model: 'gemini-2.5-flash',
      personality: '',
      sellingStyle: ''
    });
    setShowDeployModal(false);
  };

  const triggerAgentRun = (agentId: string) => {
    addAgentLog(agentId, `Manual trigger executed. Running routines for: ${agents.find(a => a.id === agentId)?.name}`);
    alert('Agent run initiated successfully!');
  };

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
          <p className="sub-title tracking-[0.4em]">Configure, deploy and coordinate smart multi-agent assistants</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2000); }}
            className="px-5 py-3 bg-white border border-surface-border rounded-2xl text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Activity size={14} className={isSyncing ? 'animate-spin text-brand-blue' : 'text-brand-blue'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Server Nodes'}</span>
          </button>
          <button onClick={() => { setForm(f => ({ ...f, category: activeCategory })); setShowDeployModal(true); }} className="premium-button flex items-center gap-2">
            <Plus size={16} />
            <span>Deploy Agent</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Agents', value: agents.filter(a => a.status === 'active').length, icon: CheckCircle2, color: 'text-brand-blue' },
          { label: 'Neural Activity Logs', value: agents.reduce((sum, a) => sum + a.logs.length, 0), icon: FileText, color: 'text-rose-600' },
          { label: 'Data Mappings Checked', value: '4.8K', icon: Database, color: 'text-emerald-600' },
          { label: 'Agent Pipeline Health', value: '100%', icon: Zap, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="glass-card !p-6 border-b-4 border-b-slate-100 hover:border-b-brand-blue group transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform", s.color)}>
                <s.icon size={18} />
              </div>
              <span className="sub-title mb-0 opacity-60">{s.label}</span>
            </div>
            <p className="text-3xl font-semibold text-navy-900 tracking-tighter">{s.value}</p>
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
            onClick={() => setActiveCategory(cat.id as AgentCategory)}
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

      {/* Agents Listing and details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filteredAgents.map((agent, index) => {
            const IconComp = CATEGORY_ICONS[agent.category] || Brain;
            const catColors = CATEGORY_COLORS[agent.category] || '';
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card space-y-6"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center border", catColors)}>
                      <IconComp size={26} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-navy-900 uppercase tracking-wider">{agent.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAgentStatus(agent.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                        agent.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {agent.status}
                    </button>
                    {agent.id !== 'agent-1' && agent.id !== 'agent-2' && agent.id !== 'agent-3' && agent.id !== 'agent-4' && (
                      <button onClick={() => deleteAgent(agent.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="sub-title">Execution Cadence</span>
                    <p className="font-bold text-navy-900 capitalize flex items-center gap-1.5 mt-0.5"><Calendar size={12} className="text-slate-400" /> {agent.schedule.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex flex-col justify-between">
                    <span className="sub-title">AI Engine Model</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Brain size={12} className="text-slate-400 shrink-0" />
                      <select
                        value={agent.model}
                        disabled={agent.category === 'Vision'}
                        onChange={e => updateAgentModel(agent.id, e.target.value)}
                        className="bg-transparent text-brand-blue font-bold uppercase tracking-wider text-[10px] focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="groq/llama-3.1-8b">Llama 3.1 8B</option>
                        <option value="groq/gpt-oss-120b">GPT OSS 120b</option>
                        <option value="groq/qwen-3.6-27b">Qwen 3.6 27b</option>
                        <option value="mistral/open-mistral-nemo">Mistral Nemo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {(agent.personality || agent.sellingStyle) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    {agent.personality && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="sub-title">Agent Personality</span>
                        <p className="font-bold text-navy-900 mt-0.5">{agent.personality}</p>
                      </div>
                    )}
                    {agent.sellingStyle && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="sub-title">Selling Style</span>
                        <p className="font-bold text-navy-900 mt-0.5">{agent.sellingStyle}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Logs of Agent */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="sub-title flex items-center gap-1"><Activity size={12} /> Neural Action Logs</span>
                    <button onClick={() => triggerAgentRun(agent.id)} className="text-[10px] text-brand-blue font-bold uppercase hover:underline flex items-center gap-1">
                      <Play size={10} /> Run Now
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-slate-300 max-h-[160px] overflow-y-auto space-y-1.5 custom-scrollbar">
                    {agent.logs.map((log, li) => (
                      <div key={li} className="flex gap-2 items-start border-b border-white/5 pb-1">
                        <span className="text-brand-blue select-none">&gt;</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Inline Create Agent Card */}
          <motion.div
            layout
            onClick={() => { setForm(f => ({ ...f, category: activeCategory })); setShowDeployModal(true); }}
            className="glass-card border-dashed border-2 border-slate-200 hover:border-brand-blue cursor-pointer flex flex-col items-center justify-center p-10 text-center transition-all text-slate-400 hover:text-brand-blue hover:bg-slate-50/50"
          >
            <Plus size={32} className="mb-2 opacity-65" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Deploy New AI Agent</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Initialize a custom autonomous assistant for this category</p>
          </motion.div>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-6">
          <div className="glass-card bg-navy-900 text-white border-none relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-blue/10 blur-[80px] rounded-full -mr-24 -mb-24 group-hover:bg-brand-blue/20 transition-all"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <Database size={18} className="text-brand-blue" />
                Network Node Link
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-[1.25rem] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Central Node: Connected</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest block">Core Gateway URL</label>
                    <div className="flex items-center gap-2.5 p-3.5 bg-white/5 rounded-xl border border-white/10 font-mono text-[9px] text-brand-blue">
                      <Zap size={12} />
                      <span>192.168.1.100:8080/v1</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest block">Synced Tables</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Inventory', 'BOMs', 'Product Catalog', 'Audit Trails'].map(db => (
                        <span key={db} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-bold text-slate-300 uppercase tracking-wider hover:border-brand-blue/30 transition-all cursor-default">{db}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Agent Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeployModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide flex items-center gap-1.5"><Sparkles size={16} className="text-brand-blue" /> Deploy New AI Agent</h3>
                <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <form onSubmit={handleDeploy} className="space-y-4">
                <div className="space-y-1">
                  <label className="sub-title">Agent Name</label>
                  <input className="input-field" required placeholder="e.g. Bidding Support Assistant" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="sub-title">Category</label>
                    <select 
                      className="input-field" 
                      value={form.category} 
                      onChange={e => {
                        const cat = e.target.value as AgentCategory;
                        setForm(f => ({
                          ...f,
                          category: cat,
                          model: cat === 'Vision' ? 'gemini-2.5-flash' : f.model
                        }));
                      }}
                    >
                      <option value="Conversational">Auto-Reply Support</option>
                      <option value="Marketing">Campaign Writer</option>
                      <option value="Sales">Sales Intelligence</option>
                      <option value="Vision">List Scanner (AI)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="sub-title">Schedule Cadence</label>
                    <select className="input-field" value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value as AIAgent['schedule'] }))}>
                      <option value="on_demand">On Demand</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="sub-title">AI Engine Model</label>
                    <select 
                      className="input-field" 
                      value={form.model} 
                      disabled={form.category === 'Vision'}
                      onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash {form.category === 'Vision' ? '(Required for Vision)' : ''}</option>
                      <option value="groq/llama-3.1-8b">Llama 3.1 8B (Groq)</option>
                      <option value="groq/gpt-oss-120b">GPT OSS 120b (Groq)</option>
                      <option value="groq/qwen-3.6-27b">Qwen 3.6 27b (Groq)</option>
                      <option value="mistral/open-mistral-nemo">Open Mistral Nemo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="sub-title">Agent Primary Role</label>
                  <input className="input-field" required placeholder="e.g. Scans and reviews tender requirements documents." value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>

                <div className="space-y-1">
                  <label className="sub-title">Detailed System Prompt / Context</label>
                  <textarea className="input-field min-h-[80px] py-2 resize-none" placeholder="Give the agent instructions on how to handle tasks..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                {form.category === 'Conversational' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="sub-title">Selling Style</label>
                      <select className="input-field" value={form.sellingStyle} onChange={e => setForm(f => ({ ...f, sellingStyle: e.target.value }))}>
                        <option value="">None</option>
                        <option value="Direct Inquiry Mode">Direct Inquiry Mode</option>
                        <option value="Consultative Selling">Consultative Selling</option>
                        <option value="Human Handoff">Human Handoff</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="sub-title">Personality</label>
                      <select className="input-field" value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))}>
                        <option value="">None</option>
                        <option value="Professional & Formal">Professional & Formal</option>
                        <option value="Friendly & Helpful">Friendly & Helpful</option>
                        <option value="Technical Specialist">Technical Specialist</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowDeployModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">Cancel</button>
                  <button type="submit" className="premium-button text-xs flex items-center gap-1.5"><Sparkles size={14} /> Deploy AI</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default AIAgentsPage;
