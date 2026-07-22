import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Building2,
  Trash2,
  ChevronRight,
  Download,
  Upload,
  Users,
  Edit,
  X,
  Copy,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Flame
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCRMStore } from '../../stores/modules/crmStore';
import { useEngagementStore } from '../../stores/modules/engagementStore';
import { computeContactScore } from '../../utils/leadScoring';
import { AnimatedPage, AnimatedList } from '../../components/ui/AnimatedPage';

const ContactsListPage = () => {
  const navigate = useNavigate();
  const { contacts, companies, fetchContacts, fetchCompanies, deleteContact, addContact, updateContact } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingContact, setEditingContact] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Array<{name: string; email: string; phone: string; status: string}>>([]);
  const [importError, setImportError] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Lead' as const,
    score: 0,
    assigned: 'Admin',
    tags: []
  });

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, [fetchContacts, fetchCompanies]);

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return 'Independent';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : companyId;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(contact.companyId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Score', 'Company', 'Created At'];
    const rows = filteredContacts.map(c => [
      c.name, c.email, c.phone, c.status, c.score.toString(), getCompanyName(c.companyId), c.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Company'];
    const sampleData = ['Juan Dela Cruz', 'juan@example.com', '09171234567', 'Lead', 'AA2000 Enterprise'];
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aa2000_contacts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          setImportError('CSV file must have a header row and at least one data row.');
          return;
        }
        
        // Improved CSV Split (handles quotes and commas)
        const parseCSVLine = (line: string) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else current += char;
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('full'));
        const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
        const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
        const statusIdx = headers.findIndex(h => h.includes('status'));
        
        if (nameIdx === -1 || emailIdx === -1) {
          setImportError('CSV must have at least "Name" and "Email" columns.');
          return;
        }
        
        const parsed = lines.slice(1).map(line => {
          const cols = parseCSVLine(line).map(c => c.replace(/^"|"$/g, ''));
          return {
            name: cols[nameIdx] || '',
            email: cols[emailIdx] || '',
            phone: phoneIdx !== -1 ? (cols[phoneIdx] || '') : '',
            status: statusIdx !== -1 ? (cols[statusIdx] || 'Lead') : 'Lead',
          };
        }).filter(r => r.name && r.email);
        
        if (parsed.length === 0) {
          setImportError('No valid contacts found in CSV. Ensure Name and Email are present.');
          return;
        }

        setImportPreview(parsed);
        setIsImportModalOpen(true);
      } catch {
        setImportError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    importPreview.forEach(c => {
      addContact({
        name: c.name,
        email: c.email,
        phone: c.phone,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (['Lead', 'Prospect', 'Customer'].includes(c.status) ? c.status : 'Lead') as any,
        score: 0,
        assigned: 'Admin',
        tags: ['Imported']
      });
    });
    setIsImportModalOpen(false);
    setImportPreview([]);
  };

  const toggleSelect = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(c => c !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleAddContact = () => {
    addContact(newContact);
    setIsAddModalOpen(false);
    setNewContact({
      name: '',
      email: '',
      phone: '',
      status: 'Lead',
      score: 0,
      assigned: 'Admin',
      tags: []
    });
  };

  const handleEditContact = () => {
    if (editingContact) {
      updateContact(editingContact.id, editingContact);
      setIsEditModalOpen(false);
      setEditingContact(null);
    }
  };

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1 tracking-tight">Contacts</h1>
          <p className="text-sm text-slate-500">Manage your enterprise relationships and leads across the Philippines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 flex items-center gap-2 hover:bg-white hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm group"
            title="Download Excel/CSV Template"
          >
            <Copy size={16} className="text-slate-400 group-hover:text-brand-blue" />
            <span>Template</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-surface-border rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <label className="px-4 py-2 bg-white border border-surface-border rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
            <Upload size={16} />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="premium-button flex items-center gap-2 text-xs"
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 glass-card p-3 shadow-sm border border-surface-border">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, email, or enterprise..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
           {selectedContacts.length > 0 && (
              <button 
               onClick={() => {
                 if (confirm(`Delete ${selectedContacts.length} selected contact(s)?`)) {
                   selectedContacts.forEach(id => deleteContact(id));
                   setSelectedContacts([]);
                 }
               }}
               className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-blue/20 transition-all border border-brand-blue/20"
             >
                <Trash2 size={14} />
                <span>Delete ({selectedContacts.length})</span>
             </button>
           )}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
              className={cn(
                'px-3 py-1.5 bg-white border border-surface-border rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-all',
                statusFilter !== 'All' ? 'text-brand-blue border-brand-blue/30' : 'text-slate-500'
              )}
            >
              <Filter size={14} />
              <span>{statusFilter === 'All' ? 'Filters' : statusFilter}</span>
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-surface-border rounded-xl shadow-premium z-50 overflow-hidden">
                {['All', 'Lead', 'Prospect', 'Customer'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors',
                      statusFilter === s ? 'text-brand-blue bg-blue-50/50' : 'text-slate-600'
                    )}
                  >
                    {s === 'All' ? 'All Contacts' : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatedList className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-surface-border">
                <th className="px-6 py-4 w-10">
                   <input 
                     type="checkbox" 
                     className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                     onChange={(e) => {
                       if (e.target.checked) setSelectedContacts(filteredContacts.map(c => c.id));
                       else setSelectedContacts([]);
                     }}
                   />
                </th>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Enterprise ID</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Buying Signal</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => {
                  const events = useEngagementStore.getState().getEventsForContact(contact.id);
                  const signal = useEngagementStore.getState().getSignalForContact(contact.id, contact.name);
                  const scoreBreakdown = computeContactScore(contact, events, signal);
                  return (
                  <tr key={contact.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                       <input 
                         type="checkbox" 
                         checked={selectedContacts.includes(contact.id)}
                         onChange={() => toggleSelect(contact.id)}
                         className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                       />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center font-bold text-white shadow-sm text-xs italic">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p 
                            onClick={() => navigate(`/contacts/${contact.id}`)}
                            className="text-sm font-bold text-navy-900 hover:text-brand-blue cursor-pointer transition-colors"
                          >{contact.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <Mail size={12} className="text-slate-300" />
                             <span className="text-[11px] text-slate-400 font-medium">{contact.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 size={14} className="text-slate-300" />
                        <span className="text-xs font-semibold">{getCompanyName(contact.companyId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div 
                        title={`Score Breakdown:\n• Base: ${scoreBreakdown.basePoints} pts\n• Engagement: ${scoreBreakdown.engagementPoints} pts\n• Signal Bonus: ${scoreBreakdown.signalBonus} pts\n\nFactors:\n${scoreBreakdown.factors.join('\n') || 'Initial baseline'}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs cursor-help transition-transform hover:scale-105"
                        style={{
                          backgroundColor: scoreBreakdown.totalScore >= 85 ? '#FEF2F2' : scoreBreakdown.totalScore >= 75 ? '#FFFBEB' : '#EFF6FF',
                          borderColor: scoreBreakdown.totalScore >= 85 ? '#FECACA' : scoreBreakdown.totalScore >= 75 ? '#FDE68A' : '#BFDBFE',
                          color: scoreBreakdown.totalScore >= 85 ? '#DC2626' : scoreBreakdown.totalScore >= 75 ? '#D97706' : '#1D4ED8',
                        }}
                      >
                        {scoreBreakdown.totalScore >= 85 ? <Flame size={12} className="text-rose-600 animate-pulse" /> : <Zap size={12} />}
                        <span>{scoreBreakdown.totalScore} pts</span>
                        <span className="text-[9px] px-1 py-0.2 bg-white/80 rounded font-extrabold uppercase">{scoreBreakdown.grade}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                        contact.status === 'Customer' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        contact.status === 'Lead' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        "bg-slate-50 text-slate-400 border border-slate-200"
                      )}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {signal ? (
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                          signal.signal === 'closing' ? "bg-rose-100 text-rose-700" :
                          signal.signal === 'hot' ? "bg-orange-100 text-orange-700" :
                          signal.signal === 'warm' ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {signal.signal === 'closing' || signal.signal === 'hot' ? <Flame size={10} /> : <Zap size={10} />}
                          {signal.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/contacts/${contact.id}`)}
                          className="p-1.5 text-slate-300 hover:text-brand-blue hover:bg-white rounded transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingContact(contact);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-300 hover:text-brand-blue hover:bg-white rounded transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm(`Are you sure you want to delete ${contact.name}?`)) {
                              deleteContact(contact.id);
                            }
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                          title="Delete Contact"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setMoreMenuId(moreMenuId === contact.id ? null : contact.id)}
                            onBlur={() => setTimeout(() => setMoreMenuId(null), 200)}
                            className="p-1.5 text-slate-300 hover:text-navy-900 transition-colors"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {moreMenuId === contact.id && (
                            <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-surface-border rounded-xl shadow-premium z-50 overflow-hidden">
                              <button 
                                onClick={() => { navigator.clipboard.writeText(contact.email); setMoreMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy size={12} /> Copy Email
                              </button>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(contact.phone); setMoreMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy size={12} /> Copy Phone
                              </button>
                              <button 
                                onClick={() => { 
                                  const newStatus = contact.status === 'Lead' ? 'Prospect' : contact.status === 'Prospect' ? 'Customer' : 'Lead';
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  updateContact(contact.id, { status: newStatus as any });
                                  setMoreMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Tag size={12} /> Change Status
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
                       <Users size={40} strokeWidth={1} className="text-slate-400" />
                       <div>
                          <p className="text-[11px] font-bold text-navy-900 uppercase tracking-widest leading-none italic">Registry Empty</p>
                          <p className="text-[10px] text-slate-500 mt-1">Authorized contacts will appear here once registered.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AnimatedList>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-navy-900">Add New Contact</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  placeholder="e.g. Juan dela Cruz"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  placeholder="juan@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
                  <input 
                    type="text" 
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    placeholder="+63 917..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                  <select 
                    value={newContact.status}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setNewContact({...newContact, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddContact}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Create Contact
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Contact Modal */}
      {isEditModalOpen && editingContact && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-navy-900">Edit Contact</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={editingContact.email}
                  onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
                  <input 
                    type="text" 
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                  <select 
                    value={editingContact.status}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setEditingContact({...editingContact, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditContact}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Update Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Import Contacts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Preview before importing into registry</p>
              </div>
              <button onClick={() => { setIsImportModalOpen(false); setImportPreview([]); }} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              {importError ? (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-700 font-medium">{importError}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <p className="text-sm font-bold text-navy-900">{importPreview.length} contact{importPreview.length !== 1 ? 's' : ''} found</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-surface-border rounded-xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-surface-border">
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Email</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {importPreview.slice(0, 20).map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-xs font-semibold text-navy-900">{c.name}</td>
                            <td className="px-4 py-2 text-xs text-slate-500">{c.email}</td>
                            <td className="px-4 py-2"><span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{c.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.length > 20 && (
                      <p className="text-center text-[10px] text-slate-400 py-2">...and {importPreview.length - 20} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
            {!importError && importPreview.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => { setIsImportModalOpen(false); setImportPreview([]); }}
                  className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmImport}
                  className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
                >
                  Import {importPreview.length} Contact{importPreview.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default ContactsListPage;
