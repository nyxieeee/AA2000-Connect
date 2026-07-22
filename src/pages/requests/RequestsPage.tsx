import { useState } from 'react';
import { Plus, Trash2, ClipboardList, Search, AlertTriangle, User, Phone, Mail, Globe, MessageCircle, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useRequestsStore } from '../../stores/modules/requestsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const statusColors: Record<string, string> = {
  new: 'text-blue-600 bg-blue-50',
  assigned: 'text-amber-600 bg-amber-50',
  in_progress: 'text-purple-600 bg-purple-50',
  resolved: 'text-emerald-600 bg-emerald-50',
  closed: 'text-slate-500 bg-slate-100',
};

const priorityColors: Record<string, string> = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-blue-600 bg-blue-50',
  high: 'text-amber-600 bg-amber-50',
  urgent: 'text-rose-600 bg-rose-50',
};

const typeLabels: Record<string, string> = {
  service: 'Service',
  support: 'Support',
  inquiry: 'Inquiry',
  complaint: 'Complaint',
  internal: 'Internal',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sourceIcons: Record<string, any> = {
  web_form: Globe,
  email: Mail,
  phone: Phone,
  chat: MessageCircle,
  manual: User,
};

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export default function RequestsPage() {
  const { requests, addRequest, updateRequest, deleteRequest } = useRequestsStore();
  const [showForm, setShowForm] = useState(false);
  const [showTriage, setShowTriage] = useState(false);
  const [triageInput, setTriageInput] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triagePreview, setTriagePreview] = useState<{
    subject: string; type: string; priority: string; companyName: string; description: string; slaDays: number;
  } | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [form, setForm] = useState<{
    type: string; priority: string; subject: string; description: string;
    companyName: string; assignedTo: string; source: string; slaDueAt: string;
  }>({ type: 'service', priority: 'medium', subject: '', description: '', companyName: '', assignedTo: '', source: 'manual', slaDueAt: '' });

  const filtered = requests.filter(r => {
    const matchesSearch = !search ||
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      (r.companyName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => setForm({ type: 'service', priority: 'medium', subject: '', description: '', companyName: '', assignedTo: '', source: 'manual', slaDueAt: '' });

  const handleSave = () => {
    if (!form.subject.trim()) return;
    const slaDate = form.slaDueAt || new Date(Date.now() + 48 * 3600000).toISOString().split('T')[0];
    addRequest({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: form.type as any, priority: form.priority as any, subject: form.subject,
      description: form.description || undefined, companyName: form.companyName || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignedTo: form.assignedTo || undefined, source: form.source as any,
      status: 'new', slaBreached: false, slaDueAt: slaDate,
    });
    resetForm(); setShowForm(false);
  };

  const handleTriage = async () => {
    if (!triageInput.trim()) return;
    setTriageLoading(true);
    setTriagePreview(null);

    if (MISTRAL_API_KEY) {
      try {
        const response = await fetch(MISTRAL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: 'open-mistral-nemo',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `You are an expert AI triage assistant for AA2000, a low-voltage and security systems company in the Philippines.
Your task is to parse raw client requests/emails/transcripts and return a clean JSON object.

Allowed values:
- type: "service" | "support" | "inquiry" | "complaint" | "internal" (Select the most appropriate)
- priority: "low" | "medium" | "high" | "urgent" (Assess priority based on description)
- slaDays: number (Choose: 1 for urgent, 3 for high, 5 for medium, 7 for low)

JSON format:
{
  "subject": "Short, concise description of the issue (Max 8 words)",
  "type": "service" | "support" | "inquiry" | "complaint",
  "priority": "low" | "medium" | "high" | "urgent",
  "companyName": "Extracted client or company name (or leave empty string)",
  "description": "Cleaned up and summarized details of the issue",
  "slaDays": 3
}`
              },
              {
                role: 'user',
                content: triageInput
              }
            ]
          })
        });

        if (!response.ok) throw new Error("Mistral request failed");
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        setTriagePreview({
          subject: content.subject || '',
          type: content.type || 'service',
          priority: content.priority || 'medium',
          companyName: content.companyName || '',
          description: content.description || '',
          slaDays: content.slaDays || 3
        });
        setTriageLoading(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Simulation Fallback Mode
    await new Promise(resolve => setTimeout(resolve, 1500));
    const inputLower = triageInput.toLowerCase();
    let type = 'support';
    let priority = 'medium';
    let slaDays = 5;

    if (inputLower.includes('cctv') || inputLower.includes('fire') || inputLower.includes('fdas') || inputLower.includes('lock')) {
      type = 'service';
    } else if (inputLower.includes('price') || inputLower.includes('quotation') || inputLower.includes('how much')) {
      type = 'inquiry';
    } else if (inputLower.includes('angry') || inputLower.includes('terrible') || inputLower.includes('broken') || inputLower.includes('delay')) {
      type = 'complaint';
    }

    if (inputLower.includes('urgent') || inputLower.includes('immediately') || inputLower.includes('now') || inputLower.includes('emergency') || inputLower.includes('down')) {
      priority = 'urgent';
      slaDays = 1;
    } else if (inputLower.includes('high') || inputLower.includes('soon')) {
      priority = 'high';
      slaDays = 3;
    }

    const companyMatch = triageInput.match(/(?:from|at)\s+([A-Z][a-zA-Z0-9\s&]{2,30}(?:Corp|Inc|Ltd|Company|Holdings|Government|Govt)?)/);
    const company = companyMatch ? companyMatch[1].trim() : 'Identified Client';

    setTriagePreview({
      subject: triageInput.split('\n')[0].substring(0, 50) || 'AI Parsed Support Ticket',
      type,
      priority,
      companyName: company,
      description: triageInput,
      slaDays
    });
    setTriageLoading(false);
  };

  const breachCount = requests.filter(r => r.status !== 'resolved' && r.status !== 'closed' && r.slaDueAt && new Date(r.slaDueAt) < new Date()).length;

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">PMS & CMS</h1>
          <p className="text-xs text-slate-500 mt-0.5">Log and track preventive & corrective maintenance jobs from intake to completion</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowTriage(!showTriage); setShowForm(false); setTriagePreview(null); }} className="px-4 py-2 bg-white border border-surface-border text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Sparkles size={16} className="text-brand-blue" /> AI Triage
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); setShowTriage(false); }} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Open</p><p className="text-lg font-bold text-navy-900">{requests.filter(r => !['resolved', 'closed'].includes(r.status)).length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Resolved</p><p className="text-lg font-bold text-emerald-600">{requests.filter(r => r.status === 'resolved').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Urgent</p><p className="text-lg font-bold text-rose-600">{requests.filter(r => r.priority === 'urgent' && !['resolved', 'closed'].includes(r.status)).length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">SLA Breached</p><p className={cn('text-lg font-bold', breachCount > 0 ? 'text-rose-600' : 'text-emerald-600')}>{breachCount}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Total</p><p className="text-lg font-bold text-navy-900">{requests.length}</p></div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'new', 'assigned', 'in_progress', 'resolved', 'closed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn('px-3 py-1.5 text-[10px] font-semibold rounded-full border transition-all capitalize', filterStatus === s ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-surface-border hover:border-brand-blue/30')}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
      </div>

      {showTriage && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-brand-blue animate-pulse" />
              Mistral AI Ticket Triage
            </h3>
            <button onClick={() => { setShowTriage(false); setTriagePreview(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
          
          {!triagePreview && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Paste a raw customer email, chat transcript, or incident notes. Mistral AI will automatically identify the category, priority, client name, and set the appropriate SLA timeline.</p>
              <textarea 
                value={triageInput} 
                onChange={e => setTriageInput(e.target.value)}
                placeholder="Example: 'Hi AA2000, our lobby CCTV feed is down. The access control reader is also not scanning cards. This is extremely urgent as customers cannot enter. Requesting a technician today - Ben Cruz, City Plaza Corp.'" 
                rows={5} 
                className="w-full px-4 py-3 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none resize-none focus:ring-2 focus:ring-brand-blue/10" 
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={handleTriage} 
                  disabled={triageLoading || !triageInput.trim()}
                  className="px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm disabled:opacity-50"
                >
                  {triageLoading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Triaging...
                    </>
                  ) : (
                    <>Run AI Triage</>
                  )}
                </button>
              </div>
            </div>
          )}

          {triagePreview && (
            <div className="space-y-4">
              <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">AI Classification Results</span>
                  <span className="text-[9px] text-slate-400">Model: open-mistral-nemo</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Subject</label>
                    <input 
                      value={triagePreview.subject} 
                      onChange={e => setTriagePreview({ ...triagePreview, subject: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-xs outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Company Name</label>
                    <input 
                      value={triagePreview.companyName} 
                      onChange={e => setTriagePreview({ ...triagePreview, companyName: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-xs outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Type</label>
                    <select 
                      value={triagePreview.type} 
                      onChange={e => setTriagePreview({ ...triagePreview, type: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-xs outline-none"
                    >
                      {Object.entries(typeLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Priority</label>
                    <select 
                      value={triagePreview.priority} 
                      onChange={e => setTriagePreview({ ...triagePreview, priority: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-xs outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Cleaned Description</label>
                  <textarea 
                    value={triagePreview.description} 
                    onChange={e => setTriagePreview({ ...triagePreview, description: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 bg-white border border-surface-border rounded-lg text-xs outline-none resize-none" 
                  />
                </div>

                <div className="text-[10px] text-slate-400 font-medium">
                  SLA Target: <span className="font-bold text-navy-900">{triagePreview.slaDays} days</span> from now
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setTriagePreview(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  ← Retry Triage
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setShowTriage(false); setTriagePreview(null); }}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const slaDate = new Date(Date.now() + (triagePreview.slaDays || 3) * 24 * 3600000).toISOString().split('T')[0];
                      addRequest({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        type: triagePreview.type as any,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        priority: triagePreview.priority as any,
                        subject: triagePreview.subject,
                        description: triagePreview.description || undefined,
                        companyName: triagePreview.companyName || undefined,
                        source: 'manual',
                        status: 'new',
                        slaBreached: false,
                        slaDueAt: slaDate
                      });
                      setShowTriage(false);
                      setTriagePreview(null);
                    }}
                    className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-light transition-all shadow-sm"
                  >
                    Approve & Create Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="glass-card p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject *" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
              {Object.entries(typeLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Company name" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="Assign to" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={form.slaDueAt} onChange={e => setForm(p => ({ ...p, slaDueAt: e.target.value }))} type="date" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-2">
            <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
              <option value="manual">Manual</option><option value="web_form">Web Form</option><option value="email">Email</option><option value="phone">Phone</option><option value="chat">Chat</option>
            </select>
          </div>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none resize-none" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-brand-blue rounded-lg">Create Request</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="px-3 py-2 text-xs font-semibold text-slate-500">Cancel</button>
          </div>
        </div>
      )}

      <AnimatedList>
      <div className="space-y-2">
        {filtered.map(r => {
          const SourceIcon = sourceIcons[r.source] || User;
          const isBreached = r.status !== 'resolved' && r.status !== 'closed' && r.slaDueAt && new Date(r.slaDueAt) < new Date();
          return (
          <AnimatedListItem key={r.id}>
          <div className={cn('glass-card p-4 flex items-center gap-4 border-l-4', isBreached ? 'border-l-rose-500' : r.priority === 'urgent' ? 'border-l-amber-500' : 'border-l-transparent')}>
            <div className="p-2 rounded-lg bg-slate-50"><SourceIcon size={18} className="text-slate-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-navy-900">{r.requestNumber}</p>
                <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', statusColors[r.status])}>{r.status.replace('_', ' ')}</span>
                <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', priorityColors[r.priority])}>{r.priority}</span>
                {isBreached && <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600"><AlertTriangle size={10} /> SLA</span>}
              </div>
              <p className="text-xs text-slate-700 font-medium truncate">{r.subject}</p>
              <p className="text-[10px] text-slate-400">{r.companyName || 'No company'} · {typeLabels[r.type]} · {new Date(r.createdAt).toLocaleDateString()}{r.assignedTo ? ` · ${r.assignedTo}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              {r.status === 'new' && <button onClick={() => updateRequest(r.id, { status: 'assigned' })} className="px-2 py-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all">Assign</button>}
              {r.status === 'assigned' && <button onClick={() => updateRequest(r.id, { status: 'in_progress' })} className="px-2 py-1 text-[10px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all">Start</button>}
              {r.status === 'in_progress' && <button onClick={() => updateRequest(r.id, { status: 'resolved', resolvedAt: new Date().toISOString() })} className="px-2 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all">Resolve</button>}
              {r.status === 'resolved' && <button onClick={() => updateRequest(r.id, { status: 'closed' })} className="px-2 py-1 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">Close</button>}
              <button onClick={() => deleteRequest(r.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
          </AnimatedListItem>
        );})}
        {filtered.length === 0 && (
          <div className="text-center py-12"><ClipboardList size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} /><p className="text-sm text-slate-500 font-medium">No requests yet</p></div>
        )}
      </div>
      </AnimatedList>
    </div>
    </AnimatedPage>
  );
}
