import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserPlus, MessageSquare, Globe, Mail, Bot, Webhook, Trash2, ChevronRight, Zap, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLeadsStore } from '../../stores/modules/leadsStore';
import type { Lead } from '../../stores/modules/leadsStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';
import { LeadFunnelAutomationModal } from './LeadFunnelAutomationModal';

const sourceIcons: Record<string, typeof MessageSquare> = {
  facebook: MessageSquare,
  email: Mail,
  website: Globe,
  messenger: MessageSquare,
  chatbot: Bot,
  manual: Webhook,
};

const sourceLabels: Record<string, string> = {
  facebook: 'Facebook',
  email: 'Email',
  website: 'Website',
  messenger: 'Messenger',
  chatbot: 'Chatbot',
  manual: 'Manual Entry',
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const { leads, addLead, deleteLead, fetchLeads } = useLeadsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [automationNotification, setAutomationNotification] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', source: 'manual' as Lead['source'] });

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'All' || l.source === sourceFilter;
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleAdd = () => {
    if (!newLead.name.trim() || !newLead.email.trim()) return;
    addLead({ ...newLead, status: 'new' });
    setNewLead({ name: '', email: '', phone: '', company: '', source: 'manual' });
    setShowForm(false);
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-50 text-blue-600 border border-blue-100',
    assigned: 'bg-violet-50 text-violet-600 border border-violet-100',
    contacted: 'bg-amber-50 text-amber-600 border border-amber-100',
    qualified: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    converted: 'bg-teal-50 text-teal-600 border border-teal-100',
    lost: 'bg-slate-50 text-slate-400 border border-slate-200',
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Lead Capture</h1>
            <p className="text-xs text-slate-500 mt-0.5">Capture and qualify incoming leads</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutomationModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-navy-900 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Auto-Funnel Rules</span>
            </button>
            <button onClick={() => setShowForm(true)} className="premium-button flex items-center gap-2 text-[10px]">
              <Plus size={14} /> New Lead
            </button>
          </div>
        </div>

        {automationNotification && (
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-600 shrink-0" />
              <span>{automationNotification}</span>
            </div>
            <button onClick={() => setAutomationNotification(null)} className="text-emerald-600 hover:text-emerald-900">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {(['new', 'assigned', 'contacted', 'qualified', 'converted'] as const).map(s => (
            <div key={s} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-navy-900">{leads.filter(l => l.status === s).length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1 capitalize">{s}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex items-center justify-between gap-4 glass-card p-3">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search leads..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-[10px] font-semibold outline-none">
              <option value="All">All Sources</option>
              {Object.entries(sourceLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-[10px] font-semibold outline-none">
              <option value="All">All Statuses</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* New Lead Form */}
        {showForm && (
          <div className="glass-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} placeholder="Name *"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" autoFocus />
              <input value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="Email *" type="email"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" />
              <input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="Phone"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" />
              <input value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} placeholder="Company"
                className="px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <select value={newLead.source} onChange={e => setNewLead({ ...newLead, source: e.target.value as Lead['source'] })}
                className="px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none">
                <option value="manual">Manual Entry</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email</option>
                <option value="website">Website</option>
                <option value="messenger">Messenger</option>
                <option value="chatbot">Chatbot</option>
              </select>
              <button onClick={handleAdd} className="px-4 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Add Lead</button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900">Cancel</button>
            </div>
          </div>
        )}

        {/* Lead List */}
        <AnimatedList>
          <div className="space-y-2">
            {filteredLeads.length === 0 && (
              <div className="glass-card text-center py-12">
                <UserPlus size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
                <p className="text-sm text-slate-500 font-medium">No leads found</p>
              </div>
            )}
            {filteredLeads.map(lead => {
              const SourceIcon = sourceIcons[lead.source] || Webhook;
              return (
                <AnimatedListItem key={lead.id}>
                  <div className="glass-card p-4 flex items-center gap-4 transition-all hover-lift">
                    <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center font-bold text-white text-xs">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-navy-900">{lead.name}</p>
                        <span className={cn('px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded', statusColors[lead.status])}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500">{lead.email}</span>
                        {lead.company && <span className="text-xs text-slate-400">• {lead.company}</span>}
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <SourceIcon size={10} /> {sourceLabels[lead.source]}
                        </span>
                      </div>
                    </div>
                    {lead.assignedTo && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-violet-600 bg-violet-50 rounded-full">
                        {lead.assignedTo}
                      </span>
                    )}
                    <button onClick={() => navigate(`/leads/${lead.id}`)} className="p-1.5 text-slate-400 hover:text-brand-blue transition-all">
                      <ChevronRight size={16} />
                    </button>
                    <button onClick={() => { if (confirm('Delete this lead?')) deleteLead(lead.id); }} className="p-1.5 text-slate-400 hover:text-rose-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </AnimatedListItem>
              );
            })}
          </div>
        </AnimatedList>
      </div>

      <LeadFunnelAutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        onEventProcessed={(msg) => setAutomationNotification(msg)}
      />
    </AnimatedPage>
  );
}
