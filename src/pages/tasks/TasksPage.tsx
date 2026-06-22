import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Calendar, Trash2, AlertCircle, Repeat } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTasksStore } from '../../stores/modules/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function TasksPage() {
  const { tasks, addTask, toggleComplete, deleteTask, generateRecurringTasks } = useTasksStore();
  const user = useAuthStore(s => s.user);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('all');

  useEffect(() => { generateRecurringTasks(); }, [generateRecurringTasks]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return t.dueDate === today;
    }
    return true;
  });

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      assignedTo: user?.id || 'current-user',
      completed: false,
      dueDate: dueDate || undefined,
      recurrenceRule: recurrence || undefined,
      nextOccurrence: recurrence ? (dueDate || new Date().toISOString().split('T')[0]) : undefined,
    });
    setTitle('');
    setDueDate('');
    setRecurrence('');
    setShowForm(false);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage follow-ups and to-dos</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        {(['all', 'pending', 'today', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize', filter === f ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-navy-900')}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'today' ? 'Due Today' : 'Completed'}
          </button>
        ))}
      </div>

      {/* New Task Form */}
      {showForm && (
        <div className="glass-card p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" autoFocus />
          <div className="flex items-center gap-3">
            <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date"
              className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
            <select value={recurrence} onChange={e => setRecurrence(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none">
              <option value="">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button onClick={handleAdd} className="px-4 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Add Task</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Task List */}
      <AnimatedList>
      <div className="space-y-2">
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
            <p className="text-sm text-slate-500 font-medium">No tasks found</p>
          </div>
        )}
        {filteredTasks.map(task => (
          <AnimatedListItem key={task.id}>
          <div className={cn('glass-card p-4 flex items-center gap-4 transition-all', task.completed && 'opacity-60')}>
            <button onClick={() => toggleComplete(task.id)} className="shrink-0">
              {task.completed ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-300 hover:text-brand-blue transition-colors" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold', task.completed && 'line-through text-slate-400')}>{task.title}</p>
              {task.dueDate && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={11} className="text-slate-400" />
                  <span className={cn('text-[10px] font-medium', new Date(task.dueDate) < new Date() && !task.completed ? 'text-rose-500' : 'text-slate-400')}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {new Date(task.dueDate) < new Date() && !task.completed && <AlertCircle size={11} className="text-rose-500" />}
                </div>
              )}
            </div>
            {task.recurrenceRule && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-violet-600 bg-violet-50 rounded-full">
                <Repeat size={10} /> {task.recurrenceRule}
              </span>
            )}
            <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', task.completed ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50')}>
              {task.completed ? 'Done' : 'Pending'}
            </span>
            <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all">
              <Trash2 size={14} />
            </button>
          </div>
          </AnimatedListItem>
        ))}
      </div>
      </AnimatedList>
    </div>
    </AnimatedPage>
  );
}
