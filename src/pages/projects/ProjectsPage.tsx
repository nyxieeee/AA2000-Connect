import { useState } from 'react';
import { Plus, Trash2, FolderKanban, Search, Calendar, Users, ArrowRight, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProjectsStore } from '../../stores/modules/projectsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const projectStatusColors: Record<string, string> = {
  planning: 'text-slate-500 bg-slate-100',
  active: 'text-blue-600 bg-blue-50',
  on_hold: 'text-amber-600 bg-amber-50',
  completed: 'text-emerald-600 bg-emerald-50',
  cancelled: 'text-rose-600 bg-rose-50',
};

const taskStatusColors: Record<string, string> = {
  todo: 'text-slate-400 bg-slate-50 border-slate-200',
  in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
  review: 'text-purple-600 bg-purple-50 border-purple-200',
  done: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const priorityColors: Record<string, string> = {
  low: 'text-slate-500',
  medium: 'text-blue-600',
  high: 'text-amber-600',
  critical: 'text-rose-600',
};

const taskStatusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function ProjectsPage() {
  const { projects, tasks, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask } = useProjectsStore();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [pForm, setPForm] = useState({ name: '', description: '', companyName: '', startDate: '', endDate: '', status: 'planning' as string, teamMembers: '' });
  const [tForm, setTForm] = useState({ title: '', description: '', priority: 'medium' as string, assignedTo: '', dueDate: '' });

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : [];
  const projectProgress = (p: typeof projects[0]) => {
    const pts = tasks.filter(t => t.projectId === p.id);
    if (!pts.length) return 0;
    return Math.round((pts.filter(t => t.status === 'done').length / pts.length) * 100);
  };

  const resetPForm = () => setPForm({ name: '', description: '', companyName: '', startDate: '', endDate: '', status: 'planning', teamMembers: '' });
  const resetTForm = () => setTForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });

  const handleSaveProject = () => {
    if (!pForm.name.trim()) return;
    addProject({
      name: pForm.name, description: pForm.description || undefined, companyName: pForm.companyName || undefined,
      startDate: pForm.startDate || undefined, endDate: pForm.endDate || undefined,
      status: pForm.status as any, teamMembers: pForm.teamMembers ? pForm.teamMembers.split(',').map(s => s.trim()) : [],
    });
    resetPForm(); setShowProjectForm(false);
  };

  const handleSaveTask = () => {
    if (!tForm.title.trim() || !selectedProject) return;
    addTask({
      projectId: selectedProject, title: tForm.title, description: tForm.description || undefined,
      priority: tForm.priority as any, assignedTo: tForm.assignedTo || undefined,
      dueDate: tForm.dueDate || undefined, status: 'todo', dependsOn: [],
    });
    resetTForm(); setShowTaskForm(false);
  };

  const taskColumns: ('todo' | 'in_progress' | 'review' | 'done')[] = ['todo', 'in_progress', 'review', 'done'];

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">Plan and track client implementations and internal projects</p>
        </div>
        <button onClick={() => { resetPForm(); setShowProjectForm(true); }} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Active</p><p className="text-lg font-bold text-navy-900">{projects.filter(p => p.status === 'active').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Completed</p><p className="text-lg font-bold text-emerald-600">{projects.filter(p => p.status === 'completed').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Total Tasks</p><p className="text-lg font-bold text-navy-900">{tasks.length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-slate-500">Tasks Done</p><p className="text-lg font-bold text-emerald-600">{tasks.filter(t => t.status === 'done').length}</p></div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
      </div>

      {showProjectForm && (
        <div className="glass-card p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))} placeholder="Project name *" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={pForm.companyName} onChange={e => setPForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Client / Company" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <select value={pForm.status} onChange={e => setPForm(p => ({ ...p, status: e.target.value }))} className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
              <option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
            <input value={pForm.startDate} onChange={e => setPForm(p => ({ ...p, startDate: e.target.value }))} type="date" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={pForm.endDate} onChange={e => setPForm(p => ({ ...p, endDate: e.target.value }))} type="date" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
            <input value={pForm.teamMembers} onChange={e => setPForm(p => ({ ...p, teamMembers: e.target.value }))} placeholder="Team members (comma separated)" className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
          </div>
          <textarea value={pForm.description} onChange={e => setPForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none resize-none" />
          <div className="flex gap-2">
            <button onClick={handleSaveProject} className="px-4 py-2 text-xs font-bold text-white bg-brand-blue rounded-lg">Create Project</button>
            <button onClick={() => { setShowProjectForm(false); resetPForm(); }} className="px-3 py-2 text-xs font-semibold text-slate-500">Cancel</button>
          </div>
        </div>
      )}

      {selectedProject && activeProject ? (
        /* Project detail view */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedProject(null)} className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1"><ArrowRight size={12} className="rotate-180" /> Back to projects</button>
            <div className="flex items-center gap-2">
              <select value={activeProject.status} onChange={e => updateProject(activeProject.id, { status: e.target.value as any })} className="px-2 py-1 text-[10px] bg-slate-50 border border-surface-border rounded-lg outline-none">
                <option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => deleteProject(activeProject.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10"><FolderKanban size={20} className="text-brand-blue" /></div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-navy-900">{activeProject.name}</h2>
                <p className="text-xs text-slate-500">{activeProject.companyName || 'Internal'} · {activeProject.startDate || 'TBD'} – {activeProject.endDate || 'TBD'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-navy-900">{projectProgress(activeProject)}%</p>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1"><div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${projectProgress(activeProject)}%` }} /></div>
              </div>
            </div>
            {activeProject.description && <p className="text-xs text-slate-600 mb-3">{activeProject.description}</p>}
            {activeProject.teamMembers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500"><Users size={12} />{activeProject.teamMembers.join(', ')}</div>
            )}
          </div>

          {/* Task board */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Tasks ({projectTasks.length})</h3>
            <button onClick={() => { resetTForm(); setShowTaskForm(true); }} className="px-3 py-1.5 text-[10px] font-bold text-white bg-brand-blue rounded-lg flex items-center gap-1"><Plus size={12} /> Add Task</button>
          </div>

          {showTaskForm && (
            <div className="glass-card p-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input value={tForm.title} onChange={e => setTForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title *" className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
                <select value={tForm.priority} onChange={e => setTForm(p => ({ ...p, priority: e.target.value }))} className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
                <input value={tForm.assignedTo} onChange={e => setTForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="Assignee" className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
                <input value={tForm.dueDate} onChange={e => setTForm(p => ({ ...p, dueDate: e.target.value }))} type="date" className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
                <div className="col-span-2"><input value={tForm.description} onChange={e => setTForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveTask} className="px-3 py-1 text-[10px] font-bold text-white bg-brand-blue rounded-lg">Add Task</button>
                <button onClick={() => { setShowTaskForm(false); resetTForm(); }} className="px-2 py-1 text-[10px] font-semibold text-slate-500">Cancel</button>
              </div>
            </div>
          )}

          {/* Kanban columns */}
          <div className="grid grid-cols-4 gap-3">
            {taskColumns.map(col => (
              <div key={col} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider', taskStatusColors[col].split(' ')[0])}>{taskStatusLabels[col]}</span>
                  <span className="text-[10px] text-slate-400">{projectTasks.filter(t => t.status === col).length}</span>
                </div>
                <div className="min-h-[120px] space-y-1.5">
                  {projectTasks.filter(t => t.status === col).map(t => (
                    <div key={t.id} className={cn('glass-card p-2.5 border-l-2 cursor-pointer hover:shadow-md transition-all', taskStatusColors[col].split(' ')[2] || 'border-transparent')}>
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-navy-900 leading-tight">{t.title}</p>
                        <button onClick={() => deleteTask(t.id)} className="p-0.5 text-slate-300 hover:text-rose-500 shrink-0"><X size={10} /></button>
                      </div>
                      {t.assignedTo && <p className="text-[10px] text-slate-400 mt-0.5">{t.assignedTo}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        {t.dueDate && <span className={cn('text-[9px] flex items-center gap-0.5', new Date(t.dueDate) < new Date() && t.status !== 'done' ? 'text-rose-500' : 'text-slate-400')}><Calendar size={9} />{new Date(t.dueDate).toLocaleDateString()}</span>}
                        <span className={cn('text-[9px] font-semibold', priorityColors[t.priority])}>{t.priority}</span>
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {col !== 'todo' && <button onClick={() => updateTask(t.id, { status: taskColumns[taskColumns.indexOf(col) - 1] })} className="text-[9px] text-slate-400 hover:text-slate-600">◀</button>}
                        {col !== 'done' && <button onClick={() => updateTask(t.id, { status: taskColumns[taskColumns.indexOf(col) + 1] })} className="text-[9px] text-slate-400 hover:text-slate-600">▶</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Project list */
        <AnimatedList>
        <div className="space-y-2">
          {filtered.map(p => (
            <AnimatedListItem key={p.id}>
            <div className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedProject(p.id)}>
              <div className={cn('p-2 rounded-lg', p.status === 'active' ? 'bg-blue-50' : p.status === 'completed' ? 'bg-emerald-50' : 'bg-slate-50')}>
                <FolderKanban size={18} className={cn(p.status === 'active' ? 'text-blue-600' : p.status === 'completed' ? 'text-emerald-600' : 'text-slate-500')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy-900">{p.name}</p>
                  <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', projectStatusColors[p.status])}>{p.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-slate-500">{p.companyName || 'Internal'} · {tasks.filter(t => t.projectId === p.id).length} tasks · {p.startDate || 'TBD'} – {p.endDate || 'TBD'}</p>
              </div>
              <div className="text-right w-24">
                <p className="text-sm font-bold text-navy-900">{projectProgress(p)}%</p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1"><div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${projectProgress(p)}%` }} /></div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
            </AnimatedListItem>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12"><FolderKanban size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} /><p className="text-sm text-slate-500 font-medium">No projects yet</p></div>
          )}
        </div>
        </AnimatedList>
      )}
    </div>
    </AnimatedPage>
  );
}
