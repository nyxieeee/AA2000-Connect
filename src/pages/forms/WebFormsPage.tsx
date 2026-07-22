import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, FileText, Eye, Trash2, Code, ListChecks, Edit3,
  Sparkles, Copy, Power, PowerOff, RefreshCw,
  CheckCircle, ArrowRight, Star, Upload, Calendar, Hash, AlignLeft,
  ChevronDown, X, Loader2, Flame, Thermometer, Snowflake,
  TrendingUp, Users, MousePointer, Clock, Bot, ChevronUp, MessageSquare,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormsStore, type FormField } from '../../stores/modules/formsStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { buildFormFromPrompt } from '../../services/aiFormBuilder';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'forms' | 'submissions' | 'analytics' | 'settings';
type FieldType = FormField['type'];

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <AlignLeft size={14} /> },
  { type: 'email', label: 'Email', icon: <MessageSquare size={14} /> },
  { type: 'tel', label: 'Phone', icon: <Hash size={14} /> },
  { type: 'number', label: 'Number', icon: <Hash size={14} /> },
  { type: 'textarea', label: 'Long Text', icon: <AlignLeft size={14} /> },
  { type: 'select', label: 'Dropdown', icon: <ChevronDown size={14} /> },
  { type: 'radio', label: 'Radio', icon: <CheckCircle size={14} /> },
  { type: 'checkbox', label: 'Checkboxes', icon: <CheckCircle size={14} /> },
  { type: 'date', label: 'Date Picker', icon: <Calendar size={14} /> },
  { type: 'file', label: 'File Upload', icon: <Upload size={14} /> },
  { type: 'rating', label: 'Star Rating', icon: <Star size={14} /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Lead Capture': 'bg-brand-blue/10 text-brand-blue',
  'Product Inquiry': 'bg-violet-100 text-violet-700',
  'FDAS Inquiry': 'bg-orange-100 text-orange-700',
  'Service Request': 'bg-emerald-100 text-emerald-700',
  'Survey': 'bg-sky-100 text-sky-700',
  'Support': 'bg-rose-100 text-rose-700',
};

const PRIORITY_CONFIG = {
  hot: { color: 'bg-rose-100 text-rose-700', icon: <Flame size={10} />, label: 'Hot' },
  warm: { color: 'bg-amber-100 text-amber-700', icon: <Thermometer size={10} />, label: 'Warm' },
  cold: { color: 'bg-sky-100 text-sky-700', icon: <Snowflake size={10} />, label: 'Cold' },
};

const SENTIMENT_CONFIG = {
  positive: { color: 'text-emerald-600', label: '😊 Positive' },
  neutral: { color: 'text-slate-500', label: '😐 Neutral' },
  negative: { color: 'text-rose-500', label: '😟 Negative' },
};

// ── Field Input Component ─────────────────────────────────────────────────────

function FieldInput({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
  const base = 'w-full px-3 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all';
  if (field.type === 'textarea') return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={cn(base, 'resize-none')} rows={3} />;
  if (field.type === 'select') return (
    <select value={value} onChange={e => onChange(e.target.value)} className={base}>
      <option value="">Select an option...</option>
      {field.options?.map(o => <option key={o}>{o}</option>)}
    </select>
  );
  if (field.type === 'radio') return (
    <div className="space-y-2">
      {field.options?.map(o => (
        <label key={o} className="flex items-center gap-2.5 cursor-pointer">
          <input type="radio" name={field.key} value={o} checked={value === o} onChange={() => onChange(o)} className="accent-brand-blue" />
          <span className="text-sm text-navy-900">{o}</span>
        </label>
      ))}
    </div>
  );
  if (field.type === 'checkbox') {
    const sel = value ? value.split('|||') : [];
    return (
      <div className="space-y-2">
        {field.options?.map(o => (
          <label key={o} className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={sel.includes(o)} onChange={e => onChange(e.target.checked ? [...sel, o].join('|||') : sel.filter(s => s !== o).join('|||'))} className="accent-brand-blue rounded" />
            <span className="text-sm text-navy-900">{o}</span>
          </label>
        ))}
      </div>
    );
  }
  if (field.type === 'rating') {
    const n = parseInt(value) || 0;
    return (
      <div className="flex gap-2">
        {[1,2,3,4,5].map(i => (
          <button key={i} type="button" onClick={() => onChange(String(i))} className={cn('text-2xl transition-all', n >= i ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300')}>★</button>
        ))}
      </div>
    );
  }
  return <input type={field.type} value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={base} />;
}

// ── Score Bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-rose-500' : score >= 50 ? 'bg-amber-400' : 'bg-sky-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-navy-900 w-8">{score}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WebFormsPage() {
  const { forms, submissions, addForm, updateForm, deleteForm, duplicateForm, toggleFormStatus, addSubmission, deleteSubmission, updateSubmissionStatus, analyzeSubmission } = useFormsStore();

  const [tab, setTab] = useState<Tab>('forms');
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderMode, setBuilderMode] = useState<'ai' | 'manual'>('ai');
  const [builderFields, setBuilderFields] = useState<FormField[]>([
    { key: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Juan dela Cruz' },
    { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'juan@company.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+63 9XX XXX XXXX' },
    { key: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Your message...' },
  ]);
  const [builderMeta, setBuilderMeta] = useState({
    name: '', description: '', category: 'Lead Capture',
    confirmationMessage: 'Thank you! An AA2000 specialist will reach out within 24 hours.', themeColor: '#1D4ED8',
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiBuilding, setIsAiBuilding] = useState(false);
  const [editingFieldIdx, setEditingFieldIdx] = useState<number | null>(null);

  const [previewForm, setPreviewForm] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<'all' | 'new' | 'hot' | 'warm' | 'cold'>('all');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingVal, setRenamingVal] = useState('');

  // ── AI Builder ────────────────────────────────────────────────────────────

  const handleAiBuild = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setIsAiBuilding(true);
    try {
      const result = await buildFormFromPrompt(aiPrompt);
      setBuilderFields(result.fields as FormField[]);
      setBuilderMeta(m => ({ ...m, name: result.name, description: result.description, category: result.category, confirmationMessage: result.confirmationMessage }));
      setBuilderMode('manual');
    } catch (e) { console.error(e); }
    finally { setIsAiBuilding(false); }
  }, [aiPrompt]);

  // ── Field Management ──────────────────────────────────────────────────────

  const addField = (type: FieldType) => {
    const key = `field_${Date.now()}`;
    const f: FormField = { key, label: type.charAt(0).toUpperCase() + type.slice(1) + ' Field', type, required: false };
    if (['select', 'radio', 'checkbox'].includes(type)) f.options = ['Option 1', 'Option 2'];
    setBuilderFields(prev => [...prev, f]);
    setEditingFieldIdx(builderFields.length);
  };

  const updateField = (idx: number, updates: Partial<FormField>) =>
    setBuilderFields(f => f.map((field, i) => i === idx ? { ...field, ...updates } : field));

  const removeField = (idx: number) => {
    setBuilderFields(f => f.filter((_, i) => i !== idx));
    if (editingFieldIdx === idx) setEditingFieldIdx(null);
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    setBuilderFields(f => {
      const next = [...f]; const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]]; return next;
    });
  };

  const resetBuilder = () => {
    setBuilderMeta({ name: '', description: '', category: 'Lead Capture', confirmationMessage: 'Thank you! An AA2000 specialist will reach out within 24 hours.', themeColor: '#1D4ED8' });
    setBuilderFields([
      { key: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Juan dela Cruz' },
      { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'juan@company.com' },
      { key: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+63 9XX XXX XXXX' },
      { key: 'message', label: 'Message', type: 'textarea', required: false },
    ]);
    setAiPrompt(''); setBuilderMode('ai'); setEditingFieldIdx(null);
  };

  const handleSaveForm = () => {
    if (!builderMeta.name.trim() || builderFields.length === 0) return;
    addForm({ ...builderMeta, fields: builderFields });
    setShowBuilder(false); resetBuilder();
  };

  const handlePreviewSubmit = async (formId: string) => {
    setIsSubmitting(true);
    await addSubmission(formId, previewData);
    setIsSubmitting(false); setPreviewSubmitted(true);
    setTimeout(() => { setPreviewForm(null); setPreviewData({}); setPreviewSubmitted(false); setTab('submissions'); }, 2500);
  };

  // ── Analytics ────────────────────────────────────────────────────────────

  const totalSubs = submissions.length;
  const analyzed = submissions.filter(s => s.aiScore !== undefined);
  const avgScore = analyzed.length > 0 ? Math.round(analyzed.reduce((a, s) => a + (s.aiScore || 0), 0) / analyzed.length) : 0;
  const hotLeads = submissions.filter(s => s.aiPriority === 'hot').length;
  const warmLeads = submissions.filter(s => s.aiPriority === 'warm').length;

  const filteredSubs = submissions.filter(s => {
    if (subFilter === 'all') return true;
    if (subFilter === 'new') return s.subStatus === 'new';
    return s.aiPriority === subFilter;
  });

  const selectedSubData = selectedSub ? submissions.find(s => s.id === selectedSub) : null;
  const selectedSubForm = selectedSubData ? forms.find(f => f.id === selectedSubData.formId) : null;

  return (
    <AnimatedPage className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Web Forms</h1>
          <p className="text-xs text-slate-500 mt-0.5">{forms.length} form{forms.length !== 1 ? 's' : ''} · {totalSubs} total submission{totalSubs !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowBuilder(true); setBuilderMode('ai'); }}
          className="px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Form
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border gap-1">
        {([
          { id: 'forms' as const, label: 'Forms', count: forms.length },
          { id: 'submissions' as const, label: 'Submissions', count: totalSubs },
          { id: 'analytics' as const, label: 'Analytics', count: null },
          { id: 'settings' as const, label: 'Settings', count: null },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px flex items-center gap-1.5',
              tab === t.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-navy-900')}>
            {t.label}
            {t.count !== null && (
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold', tab === t.id ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500')}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── FORMS TAB ─────────────────────────────────────────────────── */}
      {tab === 'forms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {forms.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <FileText size={44} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
              <p className="text-sm font-semibold text-slate-400">No forms yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "New Form" and describe your form to get started with AI.</p>
            </div>
          )}
          {forms.map(f => {
            const formSubs = submissions.filter(s => s.formId === f.id);
            const hotCount = formSubs.filter(s => s.aiPriority === 'hot').length;
            return (
              <div key={f.id} className={cn('glass-card p-5 group hover:border-brand-blue/20 transition-all flex flex-col', f.status === 'paused' && 'opacity-60')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${f.themeColor || '#1D4ED8'}20` }}>
                      <FileText size={18} style={{ color: f.themeColor || '#1D4ED8' }} />
                    </div>
                    <div className="min-w-0">
                      {renamingId === f.id ? (
                        <input value={renamingVal} onChange={e => setRenamingVal(e.target.value)}
                          onBlur={() => { if (renamingVal.trim()) updateForm(f.id, { name: renamingVal.trim() }); setRenamingId(null); }}
                          onKeyDown={e => { if (e.key === 'Enter') { if (renamingVal.trim()) updateForm(f.id, { name: renamingVal.trim() }); setRenamingId(null); } }}
                          className="text-sm font-bold text-navy-900 border-b border-brand-blue outline-none bg-transparent w-36" autoFocus />
                      ) : (
                        <p className="text-sm font-bold text-navy-900 truncate">{f.name}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider', CATEGORY_COLORS[f.category || ''] || 'bg-slate-100 text-slate-500')}>
                          {f.category || 'Form'}
                        </span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-bold uppercase', f.status === 'paused' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600')}>
                          {f.status === 'paused' ? 'Paused' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button onClick={() => setPreviewForm(f.id)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg" title="Preview & Test"><Eye size={13} /></button>
                    <button onClick={() => { setRenamingId(f.id); setRenamingVal(f.name); }} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg" title="Rename"><Edit3 size={13} /></button>
                    <button onClick={() => duplicateForm(f.id)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg" title="Duplicate"><Copy size={13} /></button>
                    <button onClick={() => toggleFormStatus(f.id)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg" title="Toggle Active/Paused">
                      {f.status === 'paused' ? <Power size={13} /> : <PowerOff size={13} />}
                    </button>
                    <button onClick={() => deleteForm(f.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg" title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  {f.fields.slice(0, 4).map(field => (
                    <div key={field.key} className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', field.required ? 'bg-brand-blue' : 'bg-slate-300')} />
                      <span className="truncate">{field.label}</span>
                      {field.required && <span className="text-rose-500 text-[9px]">*</span>}
                      <span className="ml-auto text-[9px] text-slate-300 font-mono flex-shrink-0">{field.type}</span>
                    </div>
                  ))}
                  {f.fields.length > 4 && <p className="text-[9px] text-slate-400 pl-3.5">+{f.fields.length - 4} more fields</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Submissions</p>
                      <p className="text-sm font-bold text-navy-900">{formSubs.length}</p>
                    </div>
                    {hotCount > 0 && (
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Hot Leads</p>
                        <p className="text-sm font-bold text-rose-500 flex items-center gap-0.5"><Flame size={11} />{hotCount}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(`<script src="https://forms.aa2000.ph/embed/${f.id}"></script>`); }}
                    className="text-[10px] text-brand-blue font-semibold flex items-center gap-1 hover:underline">
                    <Code size={11} /> Embed
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SUBMISSIONS TAB ───────────────────────────────────────────── */}
      {tab === 'submissions' && (
        <div className="flex gap-5" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-w-0">
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {(['all', 'new', 'hot', 'warm', 'cold'] as const).map(f => (
                <button key={f} onClick={() => setSubFilter(f)}
                  className={cn('px-3 py-1.5 text-xs font-bold rounded-lg transition-all border capitalize',
                    subFilter === f ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-500 border-surface-border hover:border-brand-blue/30')}>
                  {f === 'all' ? `All (${submissions.length})` : f === 'new' ? `New (${submissions.filter(s => s.subStatus === 'new').length})` :
                    f === 'hot' ? `🔥 Hot (${submissions.filter(s => s.aiPriority === 'hot').length})` :
                    f === 'warm' ? `🌡 Warm (${submissions.filter(s => s.aiPriority === 'warm').length})` :
                    `❄️ Cold (${submissions.filter(s => s.aiPriority === 'cold').length})`}
                </button>
              ))}
            </div>
            {filteredSubs.length === 0 ? (
              <div className="text-center py-16">
                <ListChecks size={40} className="mx-auto text-slate-200 mb-3" strokeWidth={1} />
                <p className="text-sm text-slate-400">No submissions match this filter</p>
              </div>
            ) : (
              filteredSubs.slice().reverse().map(sub => {
                const form = forms.find(f => f.id === sub.formId);
                const isSelected = selectedSub === sub.id;
                const priorityCfg = sub.aiPriority ? PRIORITY_CONFIG[sub.aiPriority] : null;
                return (
                  <div key={sub.id}
                    onClick={() => { setSelectedSub(isSelected ? null : sub.id); if (sub.subStatus === 'new') updateSubmissionStatus(sub.id, 'viewed'); }}
                    className={cn('glass-card p-4 cursor-pointer transition-all hover:border-brand-blue/20 group', isSelected && 'border-brand-blue/40 bg-brand-blue/[0.02]')}>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {sub.subStatus === 'new' && <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse flex-shrink-0" />}
                          <p className="text-sm font-bold text-navy-900 truncate">{sub.data.full_name || sub.data.name || 'Unknown'}</p>
                          {sub.data.company && <span className="text-[10px] text-slate-400 truncate hidden sm:block">@ {sub.data.company}</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-400">{new Date(sub.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {form && <span className="text-[10px] text-slate-400">· {form.name}</span>}
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-bold uppercase flex items-center gap-0.5">
                            <Sparkles size={8} /> Lead Created
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {sub.isAnalyzing && <Loader2 size={12} className="text-slate-400 animate-spin" />}
                        {priorityCfg && !sub.isAnalyzing && (
                          <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1', priorityCfg.color)}>
                            {priorityCfg.icon} {priorityCfg.label}
                          </span>
                        )}
                        {sub.aiScore !== undefined && !sub.isAnalyzing && (
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded',
                            sub.aiScore >= 75 ? 'bg-rose-50 text-rose-600' : sub.aiScore >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500')}>
                            {sub.aiScore}
                          </span>
                        )}
                        <button onClick={e => { e.stopPropagation(); deleteSubmission(sub.id); }}
                          className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detail Drawer */}
          {selectedSubData && selectedSubForm && (
            <div className="w-96 flex-shrink-0 glass-card p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-navy-900">Submission Detail</p>
                <button onClick={() => setSelectedSub(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={14} className="text-slate-400" /></button>
              </div>
              <div className="space-y-3 mb-5">
                {Object.entries(selectedSubData.data).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">{key.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-medium text-navy-900 leading-relaxed">{String(val) || '—'}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><Bot size={14} className="text-brand-blue" /><p className="text-xs font-bold text-navy-900">AI Analysis</p></div>
                  <button onClick={() => analyzeSubmission(selectedSubData.id)} className="text-[10px] text-brand-blue flex items-center gap-1 hover:underline">
                    <RefreshCw size={10} /> Re-analyze
                  </button>
                </div>
                {selectedSubData.isAnalyzing ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 size={16} className="text-brand-blue animate-spin" />
                    <span className="text-xs text-slate-500">Analyzing with AI...</span>
                  </div>
                ) : selectedSubData.aiScore !== undefined ? (
                  <>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1.5">Lead Score</p>
                      <ScoreBar score={selectedSubData.aiScore} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Priority</p>
                        {selectedSubData.aiPriority && (
                          <span className={cn('px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit', PRIORITY_CONFIG[selectedSubData.aiPriority].color)}>
                            {PRIORITY_CONFIG[selectedSubData.aiPriority].icon} {PRIORITY_CONFIG[selectedSubData.aiPriority].label}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Sentiment</p>
                        {selectedSubData.aiSentiment && (
                          <p className={cn('text-xs font-semibold', SENTIMENT_CONFIG[selectedSubData.aiSentiment].color)}>
                            {SENTIMENT_CONFIG[selectedSubData.aiSentiment].label}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedSubData.aiSummary && (
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">AI Summary</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{selectedSubData.aiSummary}</p>
                      </div>
                    )}
                    {selectedSubData.aiFollowUp && (
                      <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
                        <p className="text-[9px] text-brand-blue font-bold uppercase tracking-wider mb-1">Recommended Action</p>
                        <p className="text-[11px] text-navy-900 leading-relaxed">{selectedSubData.aiFollowUp}</p>
                      </div>
                    )}
                    {selectedSubData.aiTags && selectedSubData.aiTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedSubData.aiTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium">{tag}</span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-3">Analysis pending...</p>
                )}
              </div>
              <div className="flex gap-2 mt-5 pt-4 border-t border-surface-border">
                <button onClick={() => updateSubmissionStatus(selectedSubData.id, 'converted')}
                  className="flex-1 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-brand-light transition-all">
                  <CheckCircle size={13} /> Mark Converted
                </button>
                <button onClick={() => { deleteSubmission(selectedSubData.id); setSelectedSub(null); }}
                  className="px-3 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ─────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Submissions', value: totalSubs, icon: <Users size={18} />, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
              { label: 'Avg Lead Score', value: `${avgScore}/100`, icon: <TrendingUp size={18} />, color: 'text-violet-600', bg: 'bg-violet-100' },
              { label: 'Hot Leads', value: hotLeads, icon: <Flame size={18} />, color: 'text-rose-500', bg: 'bg-rose-100' },
              { label: 'Warm Leads', value: warmLeads, icon: <Thermometer size={18} />, color: 'text-amber-500', bg: 'bg-amber-100' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4">Forms Performance</h3>
            {forms.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No forms yet</p>
            ) : (
              <div className="space-y-4">
                {forms.map(f => {
                  const subs = submissions.filter(s => s.formId === f.id);
                  const hotC = subs.filter(s => s.aiPriority === 'hot').length;
                  const analyzedSubs = subs.filter(s => s.aiScore !== undefined);
                  const avg = analyzedSubs.length ? Math.round(analyzedSubs.reduce((a, s) => a + (s.aiScore || 0), 0) / analyzedSubs.length) : 0;
                  const pct = totalSubs > 0 ? Math.round((subs.length / totalSubs) * 100) : 0;
                  return (
                    <div key={f.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${f.themeColor || '#1D4ED8'}20` }}>
                        <FileText size={14} style={{ color: f.themeColor || '#1D4ED8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-navy-900 truncate">{f.name}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {hotC > 0 && <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5"><Flame size={9} />{hotC} hot</span>}
                            <span className="text-[10px] text-slate-500">{subs.length} sub{subs.length !== 1 ? 's' : ''} · Score {avg}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-brand-blue/60 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4">Recent Activity</h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No submissions yet</p>
            ) : (
              <div className="space-y-2">
                {submissions.slice(-8).reverse().map(sub => {
                  const form = forms.find(f => f.id === sub.formId);
                  return (
                    <div key={sub.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <MousePointer size={12} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-navy-900 truncate">{sub.data.full_name || 'Unknown'} via {form?.name || 'Unknown Form'}</p>
                        <p className="text-[9px] text-slate-400">{new Date(sub.createdAt).toLocaleString('en-PH')}</p>
                      </div>
                      {sub.aiPriority && (
                        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 flex-shrink-0', PRIORITY_CONFIG[sub.aiPriority].color)}>
                          {PRIORITY_CONFIG[sub.aiPriority].icon} {PRIORITY_CONFIG[sub.aiPriority].label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="max-w-2xl space-y-5">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-1">AI Analysis</h3>
            <p className="text-xs text-slate-500 mb-4">Every submission is automatically analyzed using Groq → Mistral → Gemini to generate lead scores, sentiment, priority, and follow-up recommendations.</p>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-700">AI Analysis Active</p>
                <p className="text-[10px] text-emerald-600">Connected: Groq (llama3-8b-8192) → Mistral (open-mistral-7b) → Gemini 2.5 Flash</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-1">Lead Auto-Creation</h3>
            <p className="text-xs text-slate-500 mb-4">All submissions automatically create a CRM Lead with the form data parsed into structured fields.</p>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-700">Lead Auto-Creation Active</p>
                <p className="text-[10px] text-emerald-600">Submissions → CRM Leads pipeline is connected and running.</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 opacity-60">
            <h3 className="text-sm font-bold text-navy-900 mb-1">Email Notifications</h3>
            <p className="text-xs text-slate-500">Configure SMTP credentials in the Admin Panel to enable email alerts for new submissions.</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-surface-border rounded-xl mt-4">
              <Clock size={16} className="text-slate-400 flex-shrink-0" />
              <p className="text-[10px] text-slate-400">Requires VITE_SMTP_PASSWORD to be set in environment configuration.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── FORM BUILDER MODAL ────────────────────────────────────────── */}
      {showBuilder && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-stretch bg-navy-900/20 backdrop-blur-[2px]">
          <div className="flex-1 flex flex-col bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <FileText size={18} className="text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">Form Builder</p>
                  <p className="text-[10px] text-slate-400">AI-powered or manual field design</p>
                </div>
              </div>
              <button onClick={() => { setShowBuilder(false); resetBuilder(); }} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* LEFT: Options */}
              <div className="w-72 border-r border-surface-border flex flex-col overflow-y-auto">
                <div className="p-4 border-b border-surface-border">
                  <div className="flex rounded-xl overflow-hidden border border-surface-border">
                    <button onClick={() => setBuilderMode('ai')} className={cn('flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all', builderMode === 'ai' ? 'bg-brand-blue text-white' : 'bg-white text-slate-500 hover:bg-slate-50')}>
                      <Sparkles size={12} /> AI Build
                    </button>
                    <button onClick={() => setBuilderMode('manual')} className={cn('flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all', builderMode === 'manual' ? 'bg-brand-blue text-white' : 'bg-white text-slate-500 hover:bg-slate-50')}>
                      <AlignLeft size={12} /> Manual
                    </button>
                  </div>
                </div>

                {builderMode === 'ai' ? (
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-navy-900 mb-1.5">Describe your form</p>
                      <p className="text-[10px] text-slate-400 mb-3">AI (Groq → Mistral → Gemini) will generate a complete form structure including all relevant fields.</p>
                      <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                        placeholder="e.g. Create an FDAS fire alarm installation inquiry form for commercial buildings"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" rows={4} />
                      <button onClick={handleAiBuild} disabled={isAiBuilding || !aiPrompt.trim()}
                        className="w-full mt-2 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-light transition-all disabled:opacity-50">
                        {isAiBuilding ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Sparkles size={13} /> Generate Form</>}
                      </button>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-2">Quick Prompts</p>
                      {[
                        'FDAS installation inquiry for commercial buildings',
                        'Security system CCTV and access control inquiry',
                        'Solar power inquiry and energy profile form',
                        'Customer satisfaction survey',
                        'Service support request for existing system',
                      ].map(p => (
                        <button key={p} onClick={() => setAiPrompt(p)}
                          className="w-full text-left text-[10px] text-slate-500 hover:text-brand-blue py-1.5 px-2 hover:bg-brand-blue/5 rounded-lg transition-all block">
                          <ArrowRight size={9} className="inline mr-1 opacity-50" />{p}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Add Field</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {FIELD_TYPES.map(ft => (
                          <button key={ft.type} onClick={() => addField(ft.type)}
                            className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 hover:bg-brand-blue/5 hover:text-brand-blue border border-surface-border rounded-lg text-[10px] font-medium text-slate-600 transition-all">
                            {ft.icon} {ft.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-surface-border pt-4 space-y-3">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Form Settings</p>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Form Name *</label>
                        <input value={builderMeta.name} onChange={e => setBuilderMeta(m => ({ ...m, name: e.target.value }))} placeholder="Product Inquiry Form"
                          className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/20" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Category</label>
                        <select value={builderMeta.category} onChange={e => setBuilderMeta(m => ({ ...m, category: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/20">
                          {['Lead Capture', 'Product Inquiry', 'FDAS Inquiry', 'Service Request', 'Survey', 'Support'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Description</label>
                        <textarea value={builderMeta.description} onChange={e => setBuilderMeta(m => ({ ...m, description: e.target.value }))} placeholder="Brief description..."
                          className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" rows={2} />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Confirmation Message</label>
                        <textarea value={builderMeta.confirmationMessage} onChange={e => setBuilderMeta(m => ({ ...m, confirmationMessage: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" rows={2} />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Theme Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={builderMeta.themeColor} onChange={e => setBuilderMeta(m => ({ ...m, themeColor: e.target.value }))} className="w-8 h-8 rounded-lg border border-surface-border cursor-pointer" />
                          <span className="text-xs text-slate-500 font-mono">{builderMeta.themeColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER: Field Editor */}
              <div className="flex-1 flex flex-col overflow-y-auto p-5 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-navy-900">{builderMeta.name || 'Untitled Form'}</p>
                  <span className="text-[10px] text-slate-400">{builderFields.length} field{builderFields.length !== 1 ? 's' : ''}</span>
                </div>
                {builderFields.length === 0 && (
                  <div className="text-center py-12 text-slate-300">
                    <Plus size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Use AI or add fields from the left panel</p>
                  </div>
                )}
                <div className="space-y-2">
                  {builderFields.map((field, idx) => (
                    <div key={field.key}
                      className={cn('bg-white border rounded-2xl p-4 transition-all cursor-pointer', editingFieldIdx === idx ? 'border-brand-blue shadow-sm' : 'border-surface-border hover:border-slate-200')}>
                      <div className="flex items-center gap-2" onClick={() => setEditingFieldIdx(editingFieldIdx === idx ? null : idx)}>
                        <div className="flex flex-col gap-0.5">
                          <button onClick={e => { e.stopPropagation(); moveField(idx, -1); }} className="text-slate-300 hover:text-slate-500"><ChevronUp size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); moveField(idx, 1); }} className="text-slate-300 hover:text-slate-500"><ChevronDown size={12} /></button>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-navy-900">{field.label}</span>
                            {field.required && <span className="text-rose-500 text-xs">*</span>}
                            <span className="text-[9px] font-mono text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">{field.type}</span>
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); removeField(idx); }} className="p-1 text-slate-300 hover:text-rose-500 rounded-lg"><X size={13} /></button>
                      </div>
                      {editingFieldIdx === idx && (
                        <div className="mt-3 pt-3 border-t border-surface-border grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                          <div className="col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Label</label>
                            <input value={field.label} onChange={e => updateField(idx, { label: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20" />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Placeholder</label>
                            <input value={field.placeholder || ''} onChange={e => updateField(idx, { placeholder: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20" />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={field.required} onChange={e => updateField(idx, { required: e.target.checked })} className="accent-brand-blue" />
                              <span className="text-xs text-slate-600">Required</span>
                            </label>
                          </div>
                          {['select', 'radio', 'checkbox'].includes(field.type) && (
                            <div className="col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Options (one per line)</label>
                              <textarea value={field.options?.join('\n') || ''} onChange={e => updateField(idx, { options: e.target.value.split('\n').filter(Boolean) })}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" rows={3} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Live Preview */}
              <div className="w-80 border-l border-surface-border flex flex-col overflow-y-auto bg-white">
                <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
                  <Eye size={14} className="text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Preview</p>
                </div>
                <div className="p-5 flex-1">
                  {builderMeta.themeColor && <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: builderMeta.themeColor }} />}
                  {builderMeta.name && <h3 className="text-base font-bold text-navy-900 mb-1">{builderMeta.name}</h3>}
                  {builderMeta.description && <p className="text-[11px] text-slate-500 mb-3">{builderMeta.description}</p>}
                  <div className="space-y-3">
                    {builderFields.map(field => (
                      <div key={field.key}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <FieldInput field={field} value="" onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                  {builderFields.length > 0 && (
                    <button className="w-full py-2.5 text-white text-sm font-bold rounded-xl transition-all mt-4" style={{ backgroundColor: builderMeta.themeColor || '#1D4ED8' }}>
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border flex-shrink-0">
              <p className="text-[10px] text-slate-400">{builderFields.length} fields · {builderMeta.category}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowBuilder(false); resetBuilder(); }} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-navy-900">Cancel</button>
                <button onClick={handleSaveForm} disabled={!builderMeta.name.trim() || builderFields.length === 0}
                  className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-light transition-all shadow-sm disabled:opacity-40">
                  Save Form
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PREVIEW / TEST MODAL ──────────────────────────────────────── */}
      {previewForm && (() => {
        const f = forms.find(fm => fm.id === previewForm);
        if (!f) return null;
        return createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-900/20 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[520px] max-h-[85vh] overflow-y-auto">
              <div className="h-2 rounded-t-3xl" style={{ backgroundColor: f.themeColor || '#1D4ED8' }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">{f.name}</h2>
                    {f.description && <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>}
                  </div>
                  <button onClick={() => { setPreviewForm(null); setPreviewData({}); setPreviewSubmitted(false); }} className="p-1.5 hover:bg-slate-100 rounded-xl">
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
                {previewSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-navy-900 mb-1">Thank You!</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">{f.confirmationMessage}</p>
                    <p className="text-[10px] text-brand-blue mt-3 flex items-center justify-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Running AI Lead Analysis...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mt-4">
                      {f.fields.map(field => (
                        <div key={field.key}>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          <FieldInput field={field} value={previewData[field.key] || ''} onChange={val => setPreviewData(d => ({ ...d, [field.key]: val }))} />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handlePreviewSubmit(f.id)} disabled={isSubmitting}
                      className="w-full mt-6 py-3 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: f.themeColor || '#1D4ED8' }}>
                      {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : 'Submit'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </AnimatedPage>
  );
}
