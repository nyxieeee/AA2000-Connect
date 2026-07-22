import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Wrench, Calendar, AlertTriangle, CheckCircle2, Clock, User, Shield, Plus, X } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useServiceManagementStore, type TicketStatus, type TicketType, type ServiceTicket } from '../../stores/modules/serviceManagementStore';
import { useCRMStore } from '../../stores/modules/crmStore';

const STATUS_STYLES: Record<TicketStatus, string> = {
  scheduled: 'bg-blue-50 text-blue-600', in_progress: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600', overdue: 'bg-rose-50 text-rose-600', cancelled: 'bg-slate-100 text-slate-400',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-500', medium: 'bg-blue-50 text-blue-600',
  high: 'bg-amber-50 text-amber-600', critical: 'bg-rose-50 text-rose-600',
};

const ServiceManagementPage = () => {
  const { tickets, updateTicket, addTicket } = useServiceManagementStore();
  const { companies, fetchCompanies } = useCRMStore();

  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'preventive' | 'corrective'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<Partial<Omit<ServiceTicket, 'id' | 'createdAt'>>>({
    type: 'preventive',
    clientName: '',
    clientId: '',
    systemType: 'FDAS',
    description: '',
    status: 'scheduled',
    scheduledDate: new Date().toISOString().split('T')[0],
    assignedTechnician: '',
    priority: 'medium',
    warrantyExpiry: '',
    contractRef: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filtered = tickets.filter(t =>
    (filter === 'all' || t.status === filter) &&
    (typeFilter === 'all' || t.type === typeFilter)
  );

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.clientName || !newTicket.description || !newTicket.scheduledDate || !newTicket.assignedTechnician) {
      alert('Please fill out all required fields.');
      return;
    }

    const matchingCompany = companies.find(c => c.name === newTicket.clientName);
    const clientId = matchingCompany ? matchingCompany.id : `c-${Date.now()}`;

    addTicket({
      type: newTicket.type as TicketType,
      clientName: newTicket.clientName,
      clientId: clientId,
      systemType: newTicket.systemType as ServiceTicket['systemType'],
      description: newTicket.description,
      status: newTicket.status as TicketStatus,
      scheduledDate: newTicket.scheduledDate,
      assignedTechnician: newTicket.assignedTechnician,
      priority: newTicket.priority as ServiceTicket['priority'],
      warrantyExpiry: newTicket.warrantyExpiry || undefined,
      contractRef: newTicket.contractRef || undefined,
    });

    setIsAddModalOpen(false);
    setNewTicket({
      type: 'preventive',
      clientName: '',
      clientId: '',
      systemType: 'FDAS',
      description: '',
      status: 'scheduled',
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedTechnician: '',
      priority: 'medium',
      warrantyExpiry: '',
      contractRef: '',
    });
  };

  const stats = {
    total: tickets.length,
    overdue: tickets.filter(t => t.status === 'overdue').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3"><Wrench className="text-brand-blue" size={28} /> Service Management</h1>
            <p className="text-sm text-slate-400 -mt-4">Preventive & Corrective Maintenance, Warranty, and Service Reports</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="premium-button flex items-center gap-2"><Plus size={14} /> New Ticket</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tickets', value: stats.total, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5">
              <div className={`p-2 rounded-xl ${s.bg} inline-block mb-2`}><s.icon size={16} className={s.color} /></div>
              <p className="text-xl font-bold text-navy-900">{s.value}</p>
              <p className="sub-title mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => setTypeFilter('all')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${typeFilter === 'all' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}>All Types</button>
            <button onClick={() => setTypeFilter('preventive')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${typeFilter === 'preventive' ? 'bg-brand-blue text-white' : 'bg-blue-50 text-blue-600'}`}>Preventive</button>
            <button onClick={() => setTypeFilter('corrective')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${typeFilter === 'corrective' ? 'bg-brand-blue text-white' : 'bg-amber-50 text-amber-600'}`}>Corrective</button>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            {(['all', ...Object.keys(STATUS_STYLES)] as (TicketStatus | 'all')[]).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filter === s ? 'bg-navy-900 text-white' : s === 'all' ? 'bg-slate-100 text-slate-500' : STATUS_STYLES[s as TicketStatus]}`}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card !p-5 hover-lift ${ticket.status === 'overdue' ? 'border-l-4 border-l-rose-400' : ticket.priority === 'critical' ? 'border-l-4 border-l-orange-400' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${ticket.type === 'preventive' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{ticket.type}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${STATUS_STYLES[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">{ticket.clientName} — {ticket.systemType}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ticket.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500"><Calendar size={12} /> {ticket.scheduledDate}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500"><User size={12} /> {ticket.assignedTechnician}</div>
                {ticket.warrantyExpiry && <div className="flex items-center gap-2 text-xs text-slate-500"><Shield size={12} /> Warranty: {ticket.warrantyExpiry}</div>}
                {ticket.contractRef && <div className="flex items-center gap-2 text-xs text-slate-500">Contract: {ticket.contractRef}</div>}
              </div>

              {ticket.status !== 'completed' && ticket.status !== 'cancelled' && (
                <div className="flex justify-end mt-3 pt-3 border-t border-slate-100 gap-2">
                  {ticket.status === 'scheduled' && <button onClick={() => updateTicket(ticket.id, { status: 'in_progress' })} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-amber-100">Start Work</button>}
                  {ticket.status === 'in_progress' && <button onClick={() => updateTicket(ticket.id, { status: 'completed', completedDate: new Date().toISOString().split('T')[0] })} className="premium-button !text-[9px] !px-3 !py-1.5 flex items-center gap-1.5"><CheckCircle2 size={12} /> Complete</button>}
                  {ticket.status === 'overdue' && <button onClick={() => updateTicket(ticket.id, { status: 'in_progress' })} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-rose-100">Resume</button>}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-surface-border overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand-blue text-white rounded-xl shadow-md shadow-brand-blue/15">
                    <Wrench size={16} />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-navy-900 uppercase tracking-widest leading-none">New Service Ticket</h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider mb-0 opacity-80">PMS & CMS Ticket Scheduling</p>
                 </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Type</label>
                    <select 
                      value={newTicket.type}
                      onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value as TicketType })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all cursor-pointer"
                    >
                      <option value="preventive">Preventive (PMS)</option>
                      <option value="corrective">Corrective (CMS)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                    <select 
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as ServiceTicket['priority'] })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client / Company Name</label>
                  {companies.length > 0 ? (
                    <select
                      value={newTicket.clientName}
                      onChange={(e) => setNewTicket({ ...newTicket, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all cursor-pointer"
                      required
                    >
                      <option value="">Select a Client...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required
                      value={newTicket.clientName}
                      onChange={(e) => setNewTicket({ ...newTicket, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      placeholder="Enter Client Name"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Type</label>
                    <select 
                      value={newTicket.systemType}
                      onChange={(e) => setNewTicket({ ...newTicket, systemType: e.target.value as ServiceTicket['systemType'] })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all cursor-pointer"
                    >
                      <option value="FDAS">FDAS</option>
                      <option value="CCTV">CCTV</option>
                      <option value="Access Control">Access Control</option>
                      <option value="Networking">Networking</option>
                      <option value="Structured Cabling">Structured Cabling</option>
                      <option value="Suppression">Suppression</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTicket.scheduledDate}
                      onChange={(e) => setNewTicket({ ...newTicket, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description / Scope of Work</label>
                  <textarea 
                    rows={3}
                    required
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all resize-none"
                    placeholder="Describe issue or preventative measures..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Technician</label>
                  <input 
                    type="text" 
                    required
                    value={newTicket.assignedTechnician}
                    onChange={(e) => setNewTicket({ ...newTicket, assignedTechnician: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    placeholder="e.g. Tech. Ramirez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Warranty Expiry (Optional)</label>
                    <input 
                      type="date" 
                      value={newTicket.warrantyExpiry}
                      onChange={(e) => setNewTicket({ ...newTicket, warrantyExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contract Ref (Optional)</label>
                    <input 
                      type="text" 
                      value={newTicket.contractRef}
                      onChange={(e) => setNewTicket({ ...newTicket, contractRef: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      placeholder="e.g. CT-2026-0045"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-all text-[9px] uppercase tracking-wider border border-slate-200"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-brand-blue text-white rounded-xl font-bold uppercase tracking-wider text-[9px] hover:bg-brand-light transition-all shadow-md shadow-brand-blue/15 active:scale-95"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </AnimatedPage>
  );
};

export default ServiceManagementPage;
