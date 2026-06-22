import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useLeadsStore } from '../../stores/modules/leadsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function LeadAssignmentPage() {
  const { rules, addRule, updateRule, deleteRule, fetchRules } = useLeadsStore();
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', source: '', territory: '', assignToUserId: '', priority: 1, enabled: true });

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleAdd = () => {
    if (!newRule.name.trim() || !newRule.assignToUserId.trim()) return;
    addRule(newRule);
    setNewRule({ name: '', source: '', territory: '', assignToUserId: '', priority: 1, enabled: true });
    setShowForm(false);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Lead Assignment Rules</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automatically route leads to the right people</p>
          </div>
          <button onClick={() => setShowForm(true)} className="premium-button flex items-center gap-2 text-[10px]">
            <Plus size={14} /> New Rule
          </button>
        </div>

        {showForm && (
          <div className="glass-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="Rule name *"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" autoFocus />
              <input value={newRule.assignToUserId} onChange={e => setNewRule({ ...newRule, assignToUserId: e.target.value })} placeholder="Assign to (user/team name) *"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" />
              <select value={newRule.source} onChange={e => setNewRule({ ...newRule, source: e.target.value })}
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none">
                <option value="">Any source</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email</option>
                <option value="website">Website</option>
                <option value="messenger">Messenger</option>
                <option value="chatbot">Chatbot</option>
              </select>
              <input value={newRule.territory} onChange={e => setNewRule({ ...newRule, territory: e.target.value })} placeholder="Territory (optional)"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500 font-semibold">Priority:</label>
              <input value={newRule.priority} onChange={e => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })} type="number" min={1}
                className="w-20 px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
              <button onClick={handleAdd} className="px-4 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Create Rule</button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900">Cancel</button>
            </div>
          </div>
        )}

        <AnimatedList>
          <div className="space-y-2">
            {rules.length === 0 && (
              <div className="glass-card text-center py-12">
                <p className="text-sm text-slate-500 font-medium">No assignment rules yet</p>
                <p className="text-[10px] text-slate-400 mt-1">Create rules to auto-assign leads by source or territory</p>
              </div>
            )}
            {rules.sort((a, b) => a.priority - b.priority).map(rule => (
              <AnimatedListItem key={rule.id}>
                <div className="glass-card p-4 flex items-center gap-4">
                  <button onClick={() => updateRule(rule.id, { enabled: !rule.enabled })} className="shrink-0">
                    {rule.enabled ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} className="text-slate-300" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy-900">{rule.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      {rule.source && <span className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold">{rule.source}</span>}
                      {rule.territory && <span>📍 {rule.territory}</span>}
                      <span>→ {rule.assignToUserId}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-navy-800 text-white rounded-full">P{rule.priority}</span>
                  <button onClick={() => { if (confirm('Delete this rule?')) deleteRule(rule.id); }} className="p-1.5 text-slate-400 hover:text-rose-500 transition-all">
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
