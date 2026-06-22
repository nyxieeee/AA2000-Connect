import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, User, Briefcase, Users } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useOrgChartStore } from '../../stores/modules/orgChartStore';
import { useCRMStore } from '../../stores/modules/crmStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

export default function OrgChartPage() {
  const { companyId } = useParams();
  const { companies } = useCRMStore();
  const { nodes: allNodes, addNode, deleteNode } = useOrgChartStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || '');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contactId: '', contactName: '', title: '', department: '', parentId: '', email: '', phone: '' });

  const company = companies.find(c => c.id === selectedCompanyId);
  const nodes = selectedCompanyId ? allNodes.filter(n => n.companyId === selectedCompanyId) : [];

  const rootNodes = nodes.filter(n => !n.parentId);

  const handleAdd = () => {
    if (!selectedCompanyId || !form.contactName.trim()) return;
    addNode({ companyId: selectedCompanyId, ...form, contactId: form.contactId || `contact-${Date.now()}` });
    setForm({ contactId: '', contactName: '', title: '', department: '', parentId: '', email: '', phone: '' });
    setShowForm(false);
  };

  const renderNode = (node: typeof nodes[0], depth = 0) => {
    const children = nodes.filter(n => n.parentId === node.id);
    return (
      <div key={node.id}>
        <div className={cn('flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group', depth > 0 && 'ml-8')}>
          <div className="p-1.5 rounded-lg bg-brand-blue/5">
            <User size={14} className="text-brand-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-navy-900">{node.contactName}</p>
            <p className="text-xs text-slate-500">{node.title} · {node.department}</p>
          </div>
          {node.email && <span className="text-[10px] text-slate-400 hidden md:block">{node.email}</span>}
          <button onClick={() => deleteNode(node.id)} className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
        {children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Organizational Chart</h1>
          <p className="text-xs text-slate-500 mt-0.5">Map reporting lines and departments for corporate accounts</p>
        </div>
        {selectedCompanyId && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
            <Plus size={16} /> Add Person
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Company selector */}
        <div className="col-span-1">
          <div className="glass-card p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Companies</p>
            {companies.map(c => (
              <button key={c.id} onClick={() => { setSelectedCompanyId(c.id); setShowForm(false); }}
                className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-all', selectedCompanyId === c.id ? 'bg-brand-blue/5 text-brand-blue font-semibold' : 'text-slate-600 hover:bg-slate-50')}>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="shrink-0" />
                  <span className="truncate">{c.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Org chart */}
        <div className="col-span-3">
          {company ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border">
                <Users size={20} className="text-brand-blue" />
                <h2 className="text-lg font-bold text-navy-900">{company.name} — Org Chart</h2>
                <span className="text-xs text-slate-400">{nodes.length} people</span>
              </div>

              {showForm && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} placeholder="Name *" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Job Title" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
                    <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
                    <select value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))} className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none">
                      <option value="">Reports to (none — top level)</option>
                      {nodes.map(n => <option key={n.id} value={n.id}>{n.contactName} ({n.title})</option>)}
                    </select>
                    <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Save</button>
                    <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-all">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {rootNodes.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
                    <p className="text-sm text-slate-500 font-medium">No people mapped yet</p>
                  </div>
                )}
                {rootNodes.map(n => renderNode(n))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400">
              <Briefcase size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Select a Company</p>
              <p className="text-xs mt-2">Choose a company to view its organizational chart</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}
