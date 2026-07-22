import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Globe, Trash2, Save, CheckCircle2, XCircle, Calendar, Sparkles, Bot, Zap, Target } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLeadsStore } from '../../stores/modules/leadsStore';
import type { Lead } from '../../stores/modules/leadsStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

const sourceLabels: Record<string, string> = {
  facebook: 'Facebook', email: 'Email', website: 'Website',
  messenger: 'Messenger', chatbot: 'Chatbot', manual: 'Manual Entry',
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead, deleteLead, enrichLeadWithAI } = useLeadsStore();
  const lead = leads.find(l => l.id === id);

  const [edit, setEdit] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  if (!lead) {
    return (
      <AnimatedPage>
        <div className="glass-card text-center py-12">
          <p className="text-sm text-slate-500 font-medium">Lead not found</p>
          <button onClick={() => navigate('/leads')} className="mt-4 text-xs text-brand-blue font-semibold hover:underline">Back to Leads</button>
        </div>
      </AnimatedPage>
    );
  }

  const handleSave = () => {
    updateLead(lead.id, form);
    setEdit(false);
  };

  const handleStatusChange = (status: Lead['status']) => {
    updateLead(lead.id, { status });
  };

  const handleRunAIResearch = async () => {
    setIsResearching(true);
    await enrichLeadWithAI(lead.id);
    setIsResearching(false);
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-50 text-blue-600', assigned: 'bg-violet-50 text-violet-600',
    contacted: 'bg-amber-50 text-amber-600', qualified: 'bg-emerald-50 text-emerald-600',
    converted: 'bg-teal-50 text-teal-600', lost: 'bg-slate-50 text-slate-400',
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12 max-w-3xl">
        <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-xs text-slate-500 hover:text-navy-900 font-semibold transition-all">
          <ArrowLeft size={14} /> Back to Leads
        </button>

        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-navy-800 flex items-center justify-center font-bold text-white text-lg">
                {lead.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">{lead.name}</h1>
                <span className={cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded inline-block mt-1', statusColors[lead.status])}>
                  {lead.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAIResearch}
                disabled={isResearching}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-navy-900 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>{isResearching ? 'Researching...' : 'AI Research & Enrich'}</span>
              </button>
              <button onClick={() => { setEdit(!edit); if (!edit) setForm({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, notes: lead.notes }); }} 
                className="px-3 py-1.5 text-xs font-bold text-brand-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-all">{edit ? 'Cancel' : 'Edit'}</button>
              <button onClick={() => { if (confirm('Delete this lead?')) { deleteLead(lead.id); navigate('/leads'); } }} 
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>

        {/* Status Flow */}
        <div className="glass-card p-6">
          <p className="sub-title">Lead Stage</p>
          <div className="flex items-center gap-2 mt-3">
            {(['new', 'assigned', 'contacted', 'qualified'] as const).map((s) => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={cn('px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all', 
                  lead.status === s ? statusColors[s] + ' ring-2 ring-offset-1 ring-navy-900/20' : 'text-slate-400 bg-slate-50 hover:bg-slate-100')}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-border">
            <button onClick={() => handleStatusChange('converted')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
              <CheckCircle2 size={16} /> Won
            </button>
            <button onClick={() => handleStatusChange('lost')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">
              <XCircle size={16} /> Lost
            </button>
            {lead.status === 'converted' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Converted ✓</span>}
            {lead.status === 'lost' && <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg">Lost ✗</span>}
          </div>
        </div>

        {/* Details */}
        <div className="glass-card p-6 space-y-4">
          <p className="sub-title">Contact Information</p>
          {edit ? (
            <div className="space-y-3">
              {['name', 'email', 'phone', 'company'].map(f => (
                <div key={f}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{f}</label>
                  <input value={(form as unknown as Record<string, string>)[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none h-24" />
              </div>
              <button onClick={handleSave} className="premium-button flex items-center gap-2 text-[10px]"><Save size={14} /> Save</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Mail, label: 'Email', value: lead.email },
                { icon: Phone, label: 'Phone', value: lead.phone || '—' },
                { icon: Building2, label: 'Company', value: lead.company || '—' },
                { icon: Globe, label: 'Source', value: sourceLabels[lead.source] || lead.source },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-semibold text-navy-900">{value}</p>
                  </div>
                </div>
              ))}
              {lead.assignedTo && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">{lead.assignedTo[0]}</div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Assigned To</p>
                    <p className="text-sm font-semibold text-navy-900">{lead.assignedTo}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="text-slate-400"><Calendar size={14} /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Created</p>
                  <p className="text-sm font-semibold text-navy-900">{new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {lead.notes && !edit && (
          <div className="glass-card p-6">
            <p className="sub-title">Notes</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* AI Research & Market Intelligence Card */}
        {lead.aiResearch ? (
          <div className="glass-card p-6 space-y-4 border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-blue text-white rounded-xl shadow-sm">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">AI Market Intelligence Briefing</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Researched via Qwen 3.6 • {new Date(lead.aiResearch.researchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                <Target size={12} />
                <span className="text-xs font-black uppercase tracking-wider">Score: {lead.aiResearch.qualificationScore}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry Sector</p>
                <p className="text-xs font-bold text-navy-900">{lead.aiResearch.companyIndustry}</p>
              </div>
              <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Size</p>
                <p className="text-xs font-bold text-navy-900">{lead.aiResearch.estimatedCompanySize}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Technical & Safety Needs</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.aiResearch.technicalNeeds.map((need, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-100/70 text-blue-900 text-[10px] font-bold rounded-lg border border-blue-200">
                    • {need}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> Recommended Opening Lines for Sales Rep
              </p>
              <ul className="space-y-1.5 text-xs font-medium text-slate-700">
                {lead.aiResearch.suggestedTalkingPoints.map((tp, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-50">
                    <span className="w-4 h-4 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="leading-snug">{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 text-center space-y-3 bg-slate-50/50 border border-dashed border-slate-200">
            <Bot size={32} className="mx-auto text-slate-300" />
            <div>
              <p className="text-xs font-bold text-navy-900">AI Market Intelligence Not Generated Yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Click "AI Research & Enrich" at the top to research company profile, calculate lead score, and generate personalized sales talking points.</p>
            </div>
            <button
              onClick={handleRunAIResearch}
              disabled={isResearching}
              className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Run AI Research Now</span>
            </button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
