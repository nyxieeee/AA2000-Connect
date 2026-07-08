import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Target, 
  Users, 
  Trash2,
  X,
  Mail,
  Phone,
  Settings,
  Bot,
  Eye,
  ExternalLink,
  FileSignature
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';
import { useCRMStore } from '../../stores/modules/crmStore';

const DealDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deals, pipelines, updateDeal, deleteDeal } = usePipelinesStore();
  const { contacts } = useCRMStore();
  
  const deal = deals.find(d => d.id === id);
  const contact = contacts.find(c => c.id === deal?.contactId);
  const pipeline = pipelines.find(p => p.id === deal?.pipelineId);
  
  const [activeTab, setActiveTab] = useState('Opportunity Details');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>(deal ? {
    title: deal.title,
    value: deal.value,
    status: deal.status || 'Open',
    stageId: deal.stageId,
    pipelineId: deal.pipelineId,
    contactId: deal.contactId,
    assigned: deal.assigned,
    product: deal.product || ''
  } : null);
  const [statusReason, setStatusReason] = useState(deal?.statusReason || '');

  if (!deal || !formData) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Target size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">Opportunity Not Found</p>
        <button onClick={() => navigate('/pipeline')} className="mt-4 text-brand-blue font-bold text-xs hover:underline">Return to Pipeline</button>
      </div>
    );
  }

  const handleUpdate = () => {
    const isTerminal = formData.status === 'Won' || formData.status === 'Lost';
    updateDeal(deal.id, {
      ...formData,
      statusReason: isTerminal ? statusReason : undefined,
      statusChangedAt: isTerminal && formData.status !== deal.status ? new Date().toISOString() : deal.statusChangedAt,
    });
    alert('Opportunity updated successfully!');
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      deleteDeal(deal.id);
      navigate('/pipeline');
    }
  };

  const tabs = [
    'Opportunity Details',
    'PMS/CMS Details',
    'Hiring Details',
    'Book/Update Appointment',
    'Tasks',
    'Notes',
    'Payments',
    'Quotations',
    'Associated Objects'
  ];

  const statusOptions = ['Open', 'Won', 'Lost', 'Abandoned'];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Breadcrumb / Back */}
      <button 
        onClick={() => navigate('/pipeline')}
        className="flex items-center gap-2 text-slate-400 hover:text-navy-900 transition-colors mb-6 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Pipeline</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-surface-border overflow-hidden flex min-h-[700px]">
        {/* Internal Sidebar */}
        <div className="w-64 bg-slate-50/50 border-r border-slate-100 p-4 flex flex-col justify-between">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
                  activeTab === tab 
                    ? "bg-brand-blue/10 text-brand-blue shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 text-[11px] font-bold text-brand-blue px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors">
            <Settings size={14} />
            <span>Add/Manage Fields</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header Area */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <h1 className="text-xl font-bold text-navy-900 tracking-tight">Edit "{deal.title}"</h1>
              <button onClick={() => navigate('/pipeline')} className="text-slate-400 hover:text-navy-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-slate-500">Add and edit opportunity details, tasks, notes and appointments.</p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
            {activeTab === 'Opportunity Details' ? (
              <>
                {/* Contact Details Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-navy-900">
                    <Users size={18} className="text-brand-blue" />
                    <h3 className="text-sm font-bold tracking-tight">Contact details</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Contact Name *</label>
                      <select 
                        value={formData.contactId}
                        onChange={(e) => setFormData({...formData, contactId: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      >
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="email" 
                          readOnly
                          value={contact?.email || ''}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-surface-border rounded-xl text-sm text-slate-500 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="tel" 
                          readOnly
                          value={contact?.phone || ''}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-surface-border rounded-xl text-sm text-slate-500 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Additional Contacts (Max: 10)</label>
                      <div className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm text-slate-400 italic">
                        Add additional contacts
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Opportunity Details Section */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-navy-900 tracking-tight">Opportunity Details</h3>
                  
                  <div className="space-y-6">
                    {/* AI Intelligence Section */}
                    {(deal.aiInquirySummary || deal.extractedInfo) && (
                      <div className="p-5 bg-brand-blue/[0.03] border border-brand-blue/10 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-brand-blue">
                          <Bot size={18} />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">AI Conversation Intelligence</h4>
                        </div>
                        
                        {deal.aiInquirySummary && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquiry Summary</p>
                            <div className="p-3 bg-white border border-brand-blue/10 rounded-xl text-xs font-medium text-navy-900 leading-relaxed italic">
                              "{deal.aiInquirySummary}"
                            </div>
                          </div>
                        )}

                        {deal.extractedInfo && (
                          <div className="grid grid-cols-3 gap-4">
                            {deal.extractedInfo.name && (
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Extracted Name</p>
                                <p className="text-xs font-bold text-navy-900">{deal.extractedInfo.name}</p>
                              </div>
                            )}
                            {deal.extractedInfo.email && (
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Extracted Email</p>
                                <p className="text-xs font-bold text-navy-900">{deal.extractedInfo.email}</p>
                              </div>
                            )}
                            {deal.extractedInfo.phone && (
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Extracted Phone</p>
                                <p className="text-xs font-bold text-navy-900">{deal.extractedInfo.phone}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Vision AI Section */}
                        {deal.extractedInfo?.items && (
                          <div className="pt-4 border-t border-brand-blue/10 space-y-3">
                             <div className="flex items-center gap-2 text-brand-blue">
                                <Eye size={14} />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vision AI: Extracted Quote Items</p>
                             </div>
                             <div className="grid grid-cols-1 gap-2">
                                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                 {deal.extractedInfo.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                     <span className="text-xs font-bold text-navy-900">{item.name}</span>
                                     <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">Qty: {item.qty}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Opportunity Name *</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-surface-border rounded-xl text-sm font-bold text-navy-900 outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pipeline</label>
                        <select 
                          value={formData.pipelineId}
                          onChange={(e) => {
                            const newP = pipelines.find(p => p.id === e.target.value);
                            setFormData({
                              ...formData, 
                              pipelineId: e.target.value,
                              stageId: newP?.stages[0].id || ''
                            });
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        >
                          {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stage</label>
                        <select 
                          value={formData.stageId}
                          onChange={(e) => setFormData({...formData, stageId: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        >
                          {pipeline?.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => { setFormData({...formData, status: e.target.value}); if (e.target.value === 'Won' || e.target.value === 'Lost') setStatusReason(''); }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        >
                          {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        {(formData.status === 'Won' || formData.status === 'Lost') && (
                          <div className="mt-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                              {formData.status === 'Won' ? 'Win Reason' : 'Loss Reason'} *
                            </label>
                            <select 
                              value={statusReason}
                              onChange={(e) => setStatusReason(e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                            >
                              <option value="">Select reason...</option>
                              {formData.status === 'Won' ? (
                                <>
                                  <option value="Price advantage">Price advantage</option>
                                  <option value="Product quality">Product quality</option>
                                  <option value="Service reputation">Service reputation</option>
                                  <option value="Existing relationship">Existing relationship</option>
                                  <option value="Compliance requirement">Compliance requirement</option>
                                  <option value="Competitor weakness">Competitor weakness</option>
                                  <option value="Other">Other</option>
                                </>
                              ) : (
                                <>
                                  <option value="Price too high">Price too high</option>
                                  <option value="Competitor won">Competitor won</option>
                                  <option value="Budget constraints">Budget constraints</option>
                                  <option value="No decision">No decision / Ghosted</option>
                                  <option value="Timing not right">Timing not right</option>
                                  <option value="Product fit">Product fit issues</option>
                                  <option value="Other">Other</option>
                                </>
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Opportunity Value</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                          <input 
                            type="number" 
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-bold text-navy-900 outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Owner</label>
                        <select 
                          value={formData.assigned}
                          onChange={(e) => setFormData({...formData, assigned: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        >
                          <option value="Admin">Authorized User</option>
                          <option value="Sales 1">Sales Manager</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Followers</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-surface-border rounded-xl min-h-[42px]">
                           <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1">
                             Grace Alviar <X size={10} className="cursor-pointer" />
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : activeTab === 'Quotations' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-navy-900">
                  <FileSignature size={18} className="text-brand-blue" />
                  <h3 className="text-sm font-bold tracking-tight">Linked Quotations</h3>
                </div>

                {/* Status card */}
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <ExternalLink size={16} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Quotation App Connection</h4>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your quotation app manages products and generates formal quotations. Once connected to Supabase, 
                    quotations linked to this deal will appear here. The connection uses a <code className="px-1 py-0.5 bg-amber-100 rounded text-[10px] font-mono">quotation_id</code> 
                    field on the deal record pointing to your quotation app's table.
                  </p>
                </div>

                {/* Empty state */}
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                  <FileSignature size={48} className="text-slate-200 mb-4" strokeWidth={1} />
                  <h4 className="text-sm font-bold text-navy-900 mb-1">No Quotations Linked</h4>
                  <p className="text-xs text-slate-500 max-w-xs mb-6">
                    Once the quotation app is connected, create and link quotations from here.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-2">
                      <FileSignature size={14} /> Create Quotation
                      <span className="text-[9px] text-slate-400 font-normal">(coming soon)</span>
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-surface-border text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-2">
                      <ExternalLink size={14} /> Open Quotation App
                      <span className="text-[9px] text-slate-400 font-normal">(coming soon)</span>
                    </button>
                  </div>
                </div>

                {/* Future schema reference */}
                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer hover:text-slate-600 font-semibold">Connection schema (for reference)</summary>
                  <pre className="mt-2 p-3 bg-slate-50 rounded-xl text-[10px] font-mono text-slate-600 leading-relaxed overflow-x-auto">
{`-- On service_records (deals):
alter table service_records add column quotation_id uuid;

-- Query to fetch linked quotation:
SELECT * FROM quotations WHERE id = service_records.quotation_id;

-- Or if quotation app uses a different table name:
-- Replace 'quotations' with your actual table name.`}</pre>
                </details>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                <Settings size={48} className="mb-4 animate-spin-slow" />
                <h3 className="text-xl font-bold text-navy-900 mb-2">{activeTab} Module</h3>
                <p className="text-sm max-w-xs">This section is currently being integrated with your AA2000 workflow engine.</p>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <span>Created By:</span>
                  <button onClick={() => navigate('/pipeline')} className="text-brand-blue hover:underline">Opportunities Details</button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <span>Created On:</span>
                  <span>{new Date(deal.createdAt).toLocaleDateString()} {new Date(deal.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <span>Audit Logs:</span>
                  <button onClick={() => navigate('/audit-logs')} className="text-brand-blue hover:underline flex items-center gap-1">
                    {deal.id.substr(0, 12)}... <ExternalLink size={10} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleDelete}
                  className="p-3 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all shadow-sm"
                  title="Delete Opportunity"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => navigate('/pipeline')}
                  className="px-8 py-3 bg-white border border-surface-border text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  className="px-12 py-3 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all transform active:scale-95"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;
