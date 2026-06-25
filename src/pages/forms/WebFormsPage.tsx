import { useState } from 'react';
import { Plus, FileText, Eye, Trash2, Code, ExternalLink, ListChecks, Edit } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormsStore } from '../../stores/modules/formsStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

export default function WebFormsPage() {
  const { forms, submissions, addForm, updateForm, deleteForm, addSubmission, deleteSubmission } = useFormsStore();
  const [tab, setTab] = useState<'forms' | 'submissions'>('forms');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [previewForm, setPreviewForm] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  const handleCreate = () => {
    if (!name.trim()) return;
    addForm({
      name: name.trim(),
      fields: [
        { key: 'full_name', label: 'Full Name', type: 'text', required: true },
        { key: 'email', label: 'Email Address', type: 'email', required: true },
        { key: 'phone', label: 'Phone Number', type: 'tel', required: false },
        { key: 'message', label: 'Message', type: 'textarea', required: false },
      ],
    });
    setName(''); setShowForm(false);
  };

  const handlePreviewSubmit = (formId: string) => {
    addSubmission(formId, previewData);
    setPreviewData({});
    setPreviewForm(null);
    setTab('submissions');
  };

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Web Forms</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create forms for lead capture and data collection</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Form
        </button>
      </div>

      <div className="flex border-b border-surface-border gap-1">
        {(['forms', 'submissions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px capitalize', tab === t ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-navy-900')}>
            {t} ({t === 'forms' ? forms.length : submissions.length})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="glass-card p-4 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Form name" className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" autoFocus />
          <p className="text-[10px] text-slate-500">A starter form with Name, Email, Phone, and Message fields will be created.</p>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Create Form</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500">Cancel</button>
          </div>
        </div>
      )}

      {tab === 'forms' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map(f => (
            <div key={f.id} className="glass-card p-5 group hover:border-brand-blue/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <FileText size={18} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">{f.name}</p>
                    <p className="text-[10px] text-slate-500">{f.fields.length} field{(f.fields.length > 1 ? 's' : '')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setPreviewForm(f.id)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg"><Eye size={14} /></button>
                  <button onClick={() => { const name = window.prompt('Form name:', f.name); if (name && name.trim()) updateForm(f.id, { name: name.trim() }); }} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg"><Edit size={14} /></button>
                  <button onClick={() => deleteForm(f.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                {f.fields.slice(0, 3).map(field => (
                  <div key={field.key} className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </div>
                ))}
                {f.fields.length > 3 && <p className="text-[9px] text-slate-400">+{f.fields.length - 3} more fields</p>}
              </div>
              <div className="mt-3 pt-3 border-t border-surface-border">
                <button onClick={() => { navigator.clipboard.writeText(`<script src="https://forms.aa2000.ph/embed/${f.id}"></script>`); alert('Embed code copied to clipboard!'); }} className="text-[10px] text-brand-blue font-semibold flex items-center gap-1 hover:underline">
                  <Code size={11} /> Copy Embed Code
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <ListChecks size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
              <p className="text-sm text-slate-500">No submissions yet</p>
            </div>
          ) : submissions.map(sub => (
            <div key={sub.id} className="glass-card p-4 group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 font-medium">{sub.createdAt}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Form: {forms.find(f => f.id === sub.formId)?.name || 'Unknown'}</span>
                  <button onClick={() => deleteSubmission(sub.id)} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(sub.data).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{key}</p>
                    <p className="text-xs font-medium text-navy-900">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewForm && (() => {
        const f = forms.find(f => f.id === previewForm);
        if (!f) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-h-[80vh] overflow-y-auto p-6 animate-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy-900">{f.name}</h2>
                <button onClick={() => { setPreviewForm(null); setPreviewData({}); }} className="p-1 hover:bg-slate-100 rounded-lg"><ExternalLink size={16} className="text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                {f.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea value={previewData[field.key] || ''} onChange={e => setPreviewData({ ...previewData, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 resize-none" rows={3} />
                    ) : field.type === 'select' ? (
                      <select value={previewData[field.key] || ''} onChange={e => setPreviewData({ ...previewData, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10">
                        <option value="">Select...</option>
                        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={previewData[field.key] || ''} onChange={e => setPreviewData({ ...previewData, [field.key]: e.target.value })}
                        type={field.type} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => handlePreviewSubmit(f.id)} className="w-full mt-6 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-light transition-all shadow-sm">
                Submit Test Entry
              </button>
            </div>
          </div>
        );
      })()}
    </AnimatedPage>
  );
}
