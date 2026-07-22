import { useState } from 'react';
import { Plus, Trash2, Play, Pause, ChevronRight, Mail, Clock, Bell, CheckSquare, ToggleLeft, ToggleRight, Users, XCircle, Bot, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSequencesStore, type Sequence, type SequenceStep } from '../../stores/modules/sequencesStore';
import { useAIAgentsStore } from '../../stores/modules/aiAgentsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const triggerLabels: Record<string, string> = { lead_created: 'Lead Created', deal_stage: 'Deal Stage Change', manual: 'Manual', inactivity: 'Inactivity Period' };
const stepIcons: Record<string, typeof Mail> = { email: Mail, wait: Clock, notification: Bell, task: CheckSquare, ai_agent: Bot };

export default function SequencesPage() {
  const { sequences, enrollments, addSequence, updateSequence, deleteSequence, enroll, pauseEnrollment, advanceStep, deleteEnrollment } = useSequencesStore();
  const { agents } = useAIAgentsStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(sequences[0]?.id || null);
  const [form, setForm] = useState({ name: '', description: '', trigger: 'manual' as Sequence['trigger'], triggerValue: '' });
  const [stepForm, setStepForm] = useState({ type: 'email' as SequenceStep['type'], subject: '', content: '', delayDays: 1, aiAgentId: agents[0]?.id || '' });

  const activeSelectedId = selectedId || (sequences.length > 0 ? sequences[0].id : null);
  const selected = sequences.find(s => s.id === activeSelectedId);

  const handleAddSequence = () => {
    if (!form.name.trim()) return;
    addSequence({ ...form, steps: [], enabled: true, triggerValue: form.triggerValue || undefined });
    setForm({ name: '', description: '', trigger: 'manual', triggerValue: '' });
    setShowForm(false);
  };

  const handleAddStep = () => {
    if (!activeSelectedId) return;
    const seq = sequences.find(s => s.id === activeSelectedId);
    if (!seq) return;
    const assignedAgent = agents.find(a => a.id === stepForm.aiAgentId);
    const step: SequenceStep = { 
      ...stepForm, 
      id: `step-${Date.now()}`, 
      order: seq.steps.length,
      aiAgentName: stepForm.type === 'ai_agent' ? (assignedAgent?.name || 'AI Agent') : undefined
    };
    updateSequence(activeSelectedId, { steps: [...seq.steps, step] });
    setStepForm({ type: 'email', subject: '', content: '', delayDays: 1, aiAgentId: agents[0]?.id || '' });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!selectedId) return;
    const seq = sequences.find(s => s.id === selectedId);
    if (!seq) return;
    updateSequence(selectedId, { steps: seq.steps.filter(s => s.id !== stepId) });
  };

  const seqEnrollments = selectedId ? enrollments.filter(e => e.sequenceId === selectedId) : [];

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Follow-ups</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated follow-up steps that trigger when a lead or deal updates</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Sequence
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Sequence list */}
        <div className="col-span-1 space-y-2">
          <AnimatedList>
          {showForm && (
            <div className="glass-card p-4 space-y-2 mb-2">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Sequence name *" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
              <select value={form.trigger} onChange={e => setForm(p => ({ ...p, trigger: e.target.value as Sequence['trigger'] }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
                <option value="manual">Manual</option>
                <option value="lead_created">Lead Created</option>
                <option value="deal_stage">Deal Stage Change</option>
                <option value="inactivity">Inactivity Period</option>
              </select>
              {form.trigger === 'deal_stage' && <input value={form.triggerValue} onChange={e => setForm(p => ({ ...p, triggerValue: e.target.value }))} placeholder="Stage name" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />}
              <div className="flex gap-2">
                <button onClick={handleAddSequence} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg">Create</button>
                <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500">Cancel</button>
              </div>
            </div>
          )}
          {sequences.map(seq => (
            <AnimatedListItem key={seq.id}>
            <button onClick={() => setSelectedId(seq.id)}
              className={cn('w-full text-left glass-card p-4 transition-all', selectedId === seq.id ? 'ring-2 ring-brand-blue/20' : '')}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-900">{seq.name}</p>
                <button onClick={(e) => { e.stopPropagation(); updateSequence(seq.id, { enabled: !seq.enabled }); }}>
                  {seq.enabled ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} className="text-slate-300" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">{triggerLabels[seq.trigger]}{seq.triggerValue ? `: ${seq.triggerValue}` : ''} · {seq.steps.length} steps</p>
            </button>
            </AnimatedListItem>
          ))}
          {sequences.length === 0 && !showForm && (
            <div className="text-center py-8">
              <Play size={32} className="mx-auto text-slate-300 mb-2" strokeWidth={1} />
              <p className="text-xs text-slate-500">No sequences yet</p>
            </div>
          )}
        </AnimatedList>
        </div>

        {/* Sequence detail */}
        <div className="col-span-2">
          {selected ? (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-navy-900">{selected.name}</h2>
                  <p className="text-xs text-slate-500">{selected.description} · Trigger: {triggerLabels[selected.trigger]}</p>
                </div>
                <button onClick={() => deleteSequence(selected.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Steps ({selected.steps.length})</p>
                  <div className="flex gap-2 items-center">
                    <select value={stepForm.type} onChange={e => setStepForm(p => ({ ...p, type: e.target.value as SequenceStep['type'] }))} className="px-2 py-1 text-[10px] bg-slate-50 border border-surface-border rounded-lg outline-none font-bold">
                      <option value="email">Email</option>
                      <option value="ai_agent">🤖 AI Agent Executed</option>
                      <option value="task">Task</option>
                      <option value="wait">Wait</option>
                      <option value="notification">Notification</option>
                    </select>

                    {stepForm.type === 'ai_agent' && (
                      <select value={stepForm.aiAgentId} onChange={e => setStepForm(p => ({ ...p, aiAgentId: e.target.value }))} className="px-2 py-1 text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg outline-none font-bold">
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                        ))}
                      </select>
                    )}

                    <input value={stepForm.delayDays} onChange={e => setStepForm(p => ({ ...p, delayDays: parseInt(e.target.value) || 1 }))} type="number" min={0} className="w-16 px-2 py-1 text-[10px] bg-slate-50 border border-surface-border rounded-lg outline-none" placeholder="Days" />
                    <button onClick={handleAddStep} className="px-3 py-1 text-[10px] font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all shadow-sm">+ Step</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {selected.steps.map((step, i) => {
                    const Icon = stepIcons[step.type] || Mail;
                    return (
                      <div key={step.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all border",
                        step.type === 'ai_agent' ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-surface-border"
                      )}>
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0",
                          step.type === 'ai_agent' ? "bg-indigo-600 text-white" : "bg-brand-blue/10 text-brand-blue"
                        )}>
                          {i + 1}
                        </div>
                        <Icon size={16} className={step.type === 'ai_agent' ? "text-indigo-600" : "text-slate-500"} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-navy-900 capitalize truncate">
                              {step.type === 'ai_agent' ? `🤖 AI Agent Step: ${step.aiAgentName || 'AI Agent'}` : `${step.type}${step.subject ? `: ${step.subject}` : ''}`}
                            </p>
                            {step.type === 'ai_agent' && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase rounded flex items-center gap-1 shrink-0">
                                <Sparkles size={8} /> Auto-Generates Outreach
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {step.type === 'ai_agent' ? (step.promptInstruction || 'Dynamic AI Response Generation') : `Delay: ${step.delayDays}d`}
                          </p>
                        </div>
                        <button onClick={() => handleRemoveStep(step.id)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 size={12} /></button>
                      </div>
                    );
                  })}
                  {selected.steps.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No steps yet. Add your first step above.</p>}
                </div>
              </div>

              {/* Enrollments */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enrollments ({seqEnrollments.length})</p>
                <div className="space-y-2">
                  {seqEnrollments.map(enr => (
                    <div key={enr.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-navy-900">Step {enr.currentStep + 1}/{selected.steps.length}</p>
                        <p className="text-[10px] text-slate-500">{enr.status} · Started {new Date(enr.startedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => advanceStep(enr.id)} className="px-2 py-1 text-[10px] font-semibold text-brand-blue bg-brand-blue/5 rounded-lg"><ChevronRight size={12} /></button>
                        <button onClick={() => pauseEnrollment(enr.id)} className="px-2 py-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-lg">{enr.status === 'active' ? <Pause size={12} /> : <Play size={12} />}</button>
                        <button onClick={() => deleteEnrollment(enr.id)} className="px-2 py-1 text-[10px] font-semibold text-rose-600 bg-rose-50 rounded-lg"><XCircle size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => enroll({ sequenceId: selected.id, currentStep: 0, status: 'active' })} className="w-full p-2 text-xs font-semibold text-brand-blue border border-dashed border-brand-blue/30 rounded-xl hover:bg-brand-blue/5 transition-all">
                    <Users size={14} className="inline mr-1" /> Enroll Contact
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400">
              <Play size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Select a Sequence</p>
              <p className="text-xs mt-2">Choose a sequence to view and manage its steps</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}
