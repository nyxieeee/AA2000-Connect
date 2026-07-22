import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Trash2, FolderKanban, Search, Calendar, Users,
  ArrowRight, ChevronRight, X, Clock, TrendingUp, CheckCircle2,
  AlertCircle, Layers, Building2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProjectsStore } from '../../stores/modules/projectsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  planning:  { label: 'Planning',   color: 'text-slate-600',   bg: 'bg-slate-100',   dot: 'bg-slate-400' },
  active:    { label: 'Active',     color: 'text-blue-700',    bg: 'bg-blue-50',     dot: 'bg-blue-500' },
  on_hold:   { label: 'On Hold',    color: 'text-amber-700',   bg: 'bg-amber-50',    dot: 'bg-amber-500' },
  completed: { label: 'Completed',  color: 'text-emerald-700', bg: 'bg-emerald-50',  dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled',  color: 'text-rose-700',    bg: 'bg-rose-50',     dot: 'bg-rose-500' },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: 'text-slate-500',   bg: 'bg-slate-100' },
  medium:   { label: 'Medium',   color: 'text-blue-600',    bg: 'bg-blue-50' },
  high:     { label: 'High',     color: 'text-amber-600',   bg: 'bg-amber-50' },
  critical: { label: 'Critical', color: 'text-rose-600',    bg: 'bg-rose-50' },
};

const taskColumns: ('todo' | 'in_progress' | 'review' | 'done')[] = ['todo', 'in_progress', 'review', 'done'];
const taskColumnConfig: Record<string, { label: string; color: string; border: string; headerBg: string }> = {
  todo:        { label: 'To Do',       color: 'text-slate-500',   border: 'border-slate-200',  headerBg: 'bg-slate-50' },
  in_progress: { label: 'In Progress', color: 'text-blue-600',    border: 'border-blue-200',   headerBg: 'bg-blue-50' },
  review:      { label: 'Review',      color: 'text-purple-600',  border: 'border-purple-200', headerBg: 'bg-purple-50' },
  done:        { label: 'Done',        color: 'text-emerald-600', border: 'border-emerald-200',headerBg: 'bg-emerald-50' },
};

export default function ProjectsPage() {
  const { projects, tasks, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask } = useProjectsStore();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [pForm, setPForm] = useState({
    name: '', description: '', companyName: '', startDate: '', endDate: '',
    status: 'planning' as string, teamMembers: '',
  });
  const [tForm, setTForm] = useState({
    title: '', description: '', priority: 'medium' as string, assignedTo: '', dueDate: '',
  });

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.companyName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : [];

  const projectProgress = (id: string) => {
    const pts = tasks.filter(t => t.projectId === id);
    if (!pts.length) return 0;
    return Math.round((pts.filter(t => t.status === 'done').length / pts.length) * 100);
  };

  const resetPForm = () => setPForm({ name: '', description: '', companyName: '', startDate: '', endDate: '', status: 'planning', teamMembers: '' });
  const resetTForm = () => setTForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });

  const handleSaveProject = () => {
    if (!pForm.name.trim()) return;
    addProject({
      name: pForm.name, description: pForm.description || undefined,
      companyName: pForm.companyName || undefined,
      startDate: pForm.startDate || undefined, endDate: pForm.endDate || undefined,
      status: pForm.status as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
      teamMembers: pForm.teamMembers ? pForm.teamMembers.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    });
    resetPForm(); setShowProjectModal(false);
  };

  const handleSaveTask = () => {
    if (!tForm.title.trim() || !selectedProject) return;
    addTask({
      projectId: selectedProject, title: tForm.title,
      description: tForm.description || undefined,
      priority: tForm.priority as 'low' | 'medium' | 'high' | 'critical',
      assignedTo: tForm.assignedTo || undefined,
      dueDate: tForm.dueDate || undefined, status: 'todo', dependsOn: [],
    });
    resetTForm(); setShowTaskModal(false);
  };

  const totalActive    = projects.filter(p => p.status === 'active').length;
  const totalCompleted = projects.filter(p => p.status === 'completed').length;
  const totalTasks     = tasks.length;
  const doneTasks      = tasks.filter(t => t.status === 'done').length;

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 mb-1 tracking-tight">Projects</h1>
            <p className="text-sm text-slate-500">Plan and track client implementations and internal projects.</p>
          </div>
          <button onClick={() => { resetPForm(); setShowProjectModal(true); }} className="premium-button flex items-center gap-2 text-xs self-start md:self-auto">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', value: totalActive,    icon: <Layers size={16} />,       color: 'text-blue-600',    bg: 'bg-blue-50' },
            { label: 'Completed',       value: totalCompleted, icon: <CheckCircle2 size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Tasks',     value: totalTasks,     icon: <AlertCircle size={16} />,  color: 'text-navy-900',    bg: 'bg-slate-100' },
            { label: 'Tasks Done',      value: doneTasks,      icon: <TrendingUp size={16} />,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg, s.color)}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className={cn('text-2xl font-black tracking-tight', s.color)}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        {!selectedProject && (
          <div className="flex flex-wrap items-center gap-3 glass-card p-3 border border-surface-border shadow-sm">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects by name or client..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all font-medium" />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'active', 'planning', 'on_hold', 'completed'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                    statusFilter === s ? 'bg-brand-blue text-white shadow-sm' : 'bg-white text-slate-500 border border-surface-border hover:border-brand-blue/30')}>
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project Detail */}
        {selectedProject && activeProject ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <button onClick={() => setSelectedProject(null)} className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1.5 transition-colors font-semibold">
                <ArrowRight size={13} className="rotate-180" /> Back to Projects
              </button>
              <div className="flex items-center gap-2">
                <select value={activeProject.status}
                  onChange={e => updateProject(activeProject.id, { status: e.target.value as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' })}
                  className={cn('px-3 py-1.5 text-xs font-bold rounded-lg border-0 outline-none cursor-pointer', statusConfig[activeProject.status].color, statusConfig[activeProject.status].bg)}>
                  <option value="planning">Planning</option><option value="active">Active</option>
                  <option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => { if (confirm('Delete this project?')) { deleteProject(activeProject.id); setSelectedProject(null); } }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={15} /></button>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <FolderKanban size={22} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-navy-900 tracking-tight">{activeProject.name}</h2>
                      {activeProject.companyName && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Building2 size={12} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">{activeProject.companyName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-navy-900">{projectProgress(activeProject.id)}%</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Complete</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-blue to-brand-light rounded-full transition-all duration-500" style={{ width: `${projectProgress(activeProject.id)}%` }} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
                    {(activeProject.startDate || activeProject.endDate) && (
                      <span className="flex items-center gap-1.5"><Clock size={12} />{activeProject.startDate || 'TBD'} to {activeProject.endDate || 'TBD'}</span>
                    )}
                    {activeProject.teamMembers.length > 0 && (
                      <span className="flex items-center gap-1.5"><Users size={12} />{activeProject.teamMembers.join(', ')}</span>
                    )}
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={12} />{projectTasks.filter(t => t.status === 'done').length}/{projectTasks.length} done</span>
                  </div>
                  {activeProject.description && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{activeProject.description}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Layers size={15} className="text-brand-blue" /> Task Board
                <span className="text-xs font-normal text-slate-400">({projectTasks.length})</span>
              </h3>
              <button onClick={() => { resetTForm(); setShowTaskModal(true); }}
                className="px-3 py-1.5 text-[10px] font-bold text-white bg-brand-blue rounded-lg flex items-center gap-1.5 hover:bg-brand-light transition-all shadow-sm">
                <Plus size={12} /> Add Task
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {taskColumns.map(col => {
                const colTasks = projectTasks.filter(t => t.status === col);
                const cfg = taskColumnConfig[col];
                return (
                  <div key={col} className="space-y-2">
                    <div className={cn('flex items-center justify-between px-3 py-2 rounded-xl', cfg.headerBg)}>
                      <span className={cn('text-[10px] font-black uppercase tracking-widest', cfg.color)}>{cfg.label}</span>
                      <span className={cn('text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center bg-white/80', cfg.color)}>{colTasks.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[100px]">
                      {colTasks.map(t => {
                        const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';
                        const pc = priorityConfig[t.priority];
                        return (
                          <div key={t.id} className={cn('glass-card p-3 border-l-2 group/card hover:shadow-md transition-all', cfg.border)}>
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <p className="text-xs font-semibold text-navy-900 leading-tight">{t.title}</p>
                              <button onClick={() => deleteTask(t.id)} className="p-0.5 text-slate-300 hover:text-rose-500 shrink-0 opacity-0 group-hover/card:opacity-100 transition-all"><X size={11} /></button>
                            </div>
                            {t.description && <p className="text-[10px] text-slate-400 mb-2 leading-snug">{t.description}</p>}
                            {t.assignedTo && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="w-4 h-4 rounded-full bg-brand-blue/20 flex items-center justify-center text-[8px] font-black text-brand-blue">{t.assignedTo[0]?.toUpperCase()}</div>
                                <span className="text-[10px] text-slate-500">{t.assignedTo}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', pc.bg, pc.color)}>{pc.label}</span>
                                {t.dueDate && (
                                  <span className={cn('text-[9px] flex items-center gap-0.5 font-medium', isOverdue ? 'text-rose-500' : 'text-slate-400')}>
                                    <Calendar size={9} />{new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-all">
                                {col !== 'todo' && (
                                  <button onClick={() => updateTask(t.id, { status: taskColumns[taskColumns.indexOf(col) - 1] })}
                                    className="text-[9px] w-5 h-5 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200">{'<'}</button>
                                )}
                                {col !== 'done' && (
                                  <button onClick={() => updateTask(t.id, { status: taskColumns[taskColumns.indexOf(col) + 1] })}
                                    className="text-[9px] w-5 h-5 flex items-center justify-center rounded bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20">{'>'}</button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <div className="border-2 border-dashed border-slate-100 rounded-xl h-16 flex items-center justify-center">
                          <p className="text-[10px] text-slate-300 font-medium">No tasks</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        ) : (
          <AnimatedList className="space-y-3">
            {filtered.map(p => {
              const sc = statusConfig[p.status];
              const prog = projectProgress(p.id);
              const tCount = tasks.filter(t => t.projectId === p.id).length;
              const doneCount = tasks.filter(t => t.projectId === p.id && t.status === 'done').length;
              return (
                <AnimatedListItem key={p.id}>
                  <div className="glass-card p-5 hover:border-brand-blue/30 transition-all group cursor-pointer" onClick={() => setSelectedProject(p.id)}>
                    <div className="flex items-center gap-4">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all',
                        p.status === 'active' ? 'bg-blue-50 text-blue-600 group-hover:bg-brand-blue group-hover:text-white' :
                        p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500')}>
                        <FolderKanban size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-navy-900 group-hover:text-brand-blue transition-colors">{p.name}</p>
                          <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider', sc.color, sc.bg)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />{sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium flex-wrap">
                          {p.companyName && <span className="flex items-center gap-1"><Building2 size={10} />{p.companyName}</span>}
                          {tCount > 0 && <span className="flex items-center gap-1"><CheckCircle2 size={10} />{doneCount}/{tCount} tasks</span>}
                          {(p.startDate || p.endDate) && <span className="flex items-center gap-1"><Calendar size={10} />{p.endDate || p.startDate}</span>}
                          {p.teamMembers.length > 0 && <span className="flex items-center gap-1"><Users size={10} />{p.teamMembers.slice(0, 2).join(', ')}{p.teamMembers.length > 2 ? ` +${p.teamMembers.length - 2}` : ''}</span>}
                        </div>
                        <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-xs">
                          <div className={cn('h-full rounded-full transition-all', p.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-blue')} style={{ width: `${prog}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-navy-900">{prog}%</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Done</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
                    </div>
                  </div>
                </AnimatedListItem>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-3 opacity-30 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <FolderKanban size={40} strokeWidth={1} className="text-slate-400" />
                <div>
                  <p className="text-[11px] font-bold text-navy-900 uppercase tracking-widest italic">No Projects Found</p>
                  <p className="text-[10px] text-slate-500 mt-1">Create your first project to get started.</p>
                </div>
              </div>
            )}
          </AnimatedList>
        )}
      </div>

      {/* New Project Modal */}
      {showProjectModal && createPortal(
        <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center"><FolderKanban size={16} className="text-brand-blue" /></div>
                <h2 className="text-lg font-bold text-navy-900">New Project</h2>
              </div>
              <button onClick={() => { setShowProjectModal(false); resetPForm(); }} className="p-2 hover:bg-white rounded-full transition-colors"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Project Name *</label>
                <input value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. SM Prime CCTV Installation"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Client / Company</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={pForm.companyName} onChange={e => setPForm(p => ({ ...p, companyName: e.target.value }))} placeholder="e.g. SM Prime Holdings"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                  <select value={pForm.status} onChange={e => setPForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all">
                    <option value="planning">Planning</option><option value="active">Active</option>
                    <option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                  <input type="date" value={pForm.startDate} onChange={e => setPForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
                  <input type="date" value={pForm.endDate} onChange={e => setPForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Team Members</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={pForm.teamMembers} onChange={e => setPForm(p => ({ ...p, teamMembers: e.target.value }))} placeholder="John, Maria, Carlos (comma-separated)"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={pForm.description} onChange={e => setPForm(p => ({ ...p, description: e.target.value }))} placeholder="Project scope, objectives, and notes..." rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all resize-none" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setShowProjectModal(false); resetPForm(); }} className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all text-sm">Cancel</button>
              <button onClick={handleSaveProject} className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all text-sm">Create Project</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Task Modal */}
      {showTaskModal && createPortal(
        <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center"><CheckCircle2 size={16} className="text-brand-blue" /></div>
                <h2 className="text-lg font-bold text-navy-900">Add Task</h2>
              </div>
              <button onClick={() => { setShowTaskModal(false); resetTForm(); }} className="p-2 hover:bg-white rounded-full transition-colors"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Task Title *</label>
                <input value={tForm.title} onChange={e => setTForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Install cameras on Floor 3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Priority</label>
                  <select value={tForm.priority} onChange={e => setTForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assigned To</label>
                  <input value={tForm.assignedTo} onChange={e => setTForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="Name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                <input type="date" value={tForm.dueDate} onChange={e => setTForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={tForm.description} onChange={e => setTForm(p => ({ ...p, description: e.target.value }))} placeholder="Task details..." rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all resize-none" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setShowTaskModal(false); resetTForm(); }} className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all text-sm">Cancel</button>
              <button onClick={handleSaveTask} className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all text-sm">Add Task</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AnimatedPage>
  );
}
