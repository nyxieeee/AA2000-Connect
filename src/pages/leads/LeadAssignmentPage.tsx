import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, MapPin, Play, CheckCircle2 } from 'lucide-react';
import { useLeadsStore } from '../../stores/modules/leadsStore';
import { useTeamStore } from '../../stores/modules/teamStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

export default function LeadAssignmentPage() {
  const { rules, addRule, updateRule, deleteRule, fetchRules, applyRulesToUnassigned } = useLeadsStore();
  const { members, fetchMembers } = useTeamStore();
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState<{ name: string; source: string; territory: string; quoteScope: 'all' | 'supply_only' | 'supply_install'; assignToUserId: string; priority: number; enabled: boolean }>({
    name: '', source: '', territory: '', quoteScope: 'all', assignToUserId: '', priority: 1, enabled: true
  });
  const [runMessage, setRunMessage] = useState('');

  useEffect(() => { 
    fetchRules(); 
    fetchMembers();
  }, [fetchRules, fetchMembers]);

  const handleAdd = () => {
    if (!newRule.name.trim() || !newRule.assignToUserId.trim()) return;
    addRule(newRule);
    setNewRule({ name: '', source: '', territory: '', quoteScope: 'all', assignToUserId: '', priority: 1, enabled: true });
    setShowForm(false);
  };

  const handleRunRules = () => {
    const assignedCount = applyRulesToUnassigned();
    if (assignedCount > 0) {
      setRunMessage(`Successfully auto-assigned ${assignedCount} unassigned lead(s) based on active rules!`);
    } else {
      setRunMessage(`All existing leads are already assigned or no new matching rules found.`);
    }
    setTimeout(() => setRunMessage(''), 5000);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Lead Assignment Rules</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automatically route incoming inquiries by Quotation Scope (Supply Only vs Supply & Install), Source, and Territory</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRunRules} className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-all shadow-sm">
              <Play size={14} /> Run Rules Now
            </button>
            <button onClick={() => setShowForm(true)} className="premium-button flex items-center gap-2 text-[10px]">
              <Plus size={14} /> New Rule
            </button>
          </div>
        </div>

        {runMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{runMessage}</span>
          </div>
        )}

        {showForm && (
          <div className="glass-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="Rule name (e.g. Supply Only Routing) *"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" autoFocus />
              
              <select value={newRule.assignToUserId} onChange={e => setNewRule({ ...newRule, assignToUserId: e.target.value })}
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none font-medium">
                <option value="">Select Team Member to Assign *</option>
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>

              <select value={newRule.quoteScope} onChange={e => setNewRule({ ...newRule, quoteScope: e.target.value as any })}
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none font-medium">
                <option value="all">Any Quotation Scope</option>
                <option value="supply_only">Supply Only</option>
                <option value="supply_install">Supply & Installation</option>
              </select>
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
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none col-span-2" />
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
                <p className="text-[10px] text-slate-400 mt-1">Create rules to auto-assign leads by Quotation Scope, source, or territory</p>
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
                      {rule.quoteScope === 'supply_only' && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 font-bold rounded">📦 Supply Only</span>}
                      {rule.quoteScope === 'supply_install' && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-bold rounded">🛠️ Supply & Install</span>}
                      {rule.source && <span className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold">{rule.source}</span>}
                      {rule.territory && <span className="flex items-center gap-1"><MapPin size={10} /> {rule.territory}</span>}
                      <span>→ <strong className="text-navy-900">{rule.assignToUserId}</strong></span>
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
