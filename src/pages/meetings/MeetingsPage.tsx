import { useState } from 'react';
import { Plus, Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { useMeetingsStore } from '../../stores/modules/meetingsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function MeetingsPage() {
  const { meetings, addMeeting, deleteMeeting } = useMeetingsStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    addMeeting({ title: title.trim(), agenda: agenda.trim() || undefined, scheduledAt: scheduledAt || undefined });
    setTitle(''); setAgenda(''); setScheduledAt(''); setShowForm(false);
  };

  const sorted = [...meetings].sort((a, b) => {
    if (!a.scheduledAt) return 1;
    if (!b.scheduledAt) return -1;
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
  });

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Meetings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule and track client meetings</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
          <Plus size={16} /> New Meeting
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting title" className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" autoFocus />
          <textarea value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="Agenda (optional)" rows={2} className="w-full px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 resize-none" />
          <div className="flex items-center gap-3">
            <input value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} type="datetime-local" className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
            <button onClick={handleAdd} className="px-4 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Schedule</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <AnimatedList className="space-y-3">
        {sorted.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
            <p className="text-sm text-slate-500 font-medium">No meetings scheduled</p>
          </div>
        )}
        {sorted.map(mtg => (
          <AnimatedListItem key={mtg.id}>
          <div key={mtg.id} className="glass-card p-5 group hover:border-brand-blue/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">{mtg.title}</p>
                  {mtg.agenda && <p className="text-xs text-slate-500 mt-1 italic">"{mtg.agenda}"</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {mtg.scheduledAt && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <Clock size={11} />
                        {new Date(mtg.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    )}
                    {mtg.attendees && mtg.attendees.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <Users size={11} />
                        {mtg.attendees.length} attendee{mtg.attendees.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => deleteMeeting(mtg.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </AnimatedPage>
  );
}
