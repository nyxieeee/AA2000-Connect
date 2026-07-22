import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Users,
  ExternalLink,
  TrendingUp,
  Briefcase,
  Trash2,
  Edit,
  X,
  Download
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCRMStore } from '../../stores/modules/crmStore';
import { AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedPage';

const AA2000_INDUSTRIES = [
  'Real Estate', 'Healthcare', 'Banking & Finance', 'Government',
  'Education', 'Hospitality', 'Retail', 'Manufacturing',
  'Transportation', 'Telecommunications', 'Construction', 'Other'
];

const CompaniesListPage = () => {
  const { companies, contacts, fetchCompanies, fetchContacts, addCompany, deleteCompany, updateCompany } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    website: '',
    type: 'End User' as 'End User' | 'Contractor' | 'Dealer',
    status: 'Active' as const,
    assigned: 'Admin',
    value: 0
  });

  useEffect(() => {
    fetchCompanies();
    fetchContacts();
  }, [fetchCompanies, fetchContacts]);

  const getContactCount = (companyId: string) => {
    return contacts.filter(c => c.companyId === companyId).length;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || (company as unknown as { type: string }).type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddCompany = () => {
    addCompany(newCompany);
    setIsAddModalOpen(false);
    setNewCompany({
      name: '',
      industry: '',
      website: '',
      type: 'End User',
      status: 'Active',
      assigned: 'Admin',
      value: 0
    });
  };

  const handleEditCompany = () => {
    if (editingCompany) {
      updateCompany(editingCompany.id, editingCompany);
      setIsEditModalOpen(false);
      setEditingCompany(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Type', 'Industry', 'Website', 'Value', 'Status', 'Created At'];
    const rows = filteredCompanies.map(c => [
      c.name, (c as unknown as { type: string }).type || 'End User', c.industry, c.website, (c.value || 0).toString(), c.status, c.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'Contractor': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Dealer': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1 tracking-tight">Accounts</h1>
          <p className="text-sm text-slate-500">Manage your end users, contractors, and dealers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-surface-border rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="premium-button flex items-center gap-2 text-xs"
          >
            <Plus size={16} />
            <span>New Account</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 glass-card p-3 shadow-sm border border-surface-border">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search accounts by name or industry..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
            className={cn(
              'px-3 py-1.5 bg-white border border-surface-border rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-all',
              typeFilter !== 'All' ? 'text-brand-blue border-brand-blue/30' : 'text-slate-500'
            )}
          >
            <Filter size={14} />
            <span>{typeFilter === 'All' ? 'All Types' : typeFilter}</span>
          </button>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-surface-border rounded-xl shadow-premium z-50 overflow-hidden">
              {['All', 'End User', 'Contractor', 'Dealer'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setShowFilterMenu(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors',
                    typeFilter === t ? 'text-brand-blue bg-blue-50/50' : 'text-slate-600'
                  )}
                >
                  {t === 'All' ? 'All Types' : t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map(company => (
            <AnimatedListItem key={company.id}>
            <div className="glass-card p-5 hover:border-brand-blue/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <Building2 size={20} />
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                    getTypeBadge((company as unknown as { type: string }).type)
                  )}>
                    {(company as unknown as { type: string }).type || 'End User'}
                  </span>
                  <button 
                    onClick={() => {
                      setEditingCompany(company);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-300 hover:text-brand-blue transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm(`Delete "${company.name}"?`)) deleteCompany(company.id);
                    }}
                    className="p-1.5 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-base font-bold text-navy-900 mb-1 tracking-tight group-hover:text-brand-blue transition-colors">{company.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{company.industry || 'Unspecified'}</span>
                 {company.website && (
                   <>
                     <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                     <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" 
                        className="text-[10px] font-bold text-brand-blue uppercase tracking-widest leading-none hover:underline flex items-center gap-1"
                     >
                       Website <ExternalLink size={10} />
                     </a>
                   </>
                 )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Account Value</p>
                  <div className="flex items-center gap-1 text-navy-900">
                     <TrendingUp size={12} className="text-emerald-500" />
                     <p className="text-xs font-bold italic tracking-tight">₱{(company.value || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Contacts</p>
                  <div className="flex items-center gap-1 text-navy-900">
                     <Users size={12} className="text-brand-blue" />
                     <p className="text-xs font-bold italic tracking-tight">{getContactCount(company.id)}</p>
                  </div>
                </div>
              </div>
            </div>
            </AnimatedListItem>
          ))
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-3 opacity-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
             <Briefcase size={40} strokeWidth={1} className="text-slate-400" />
             <div>
                <p className="text-[11px] font-bold text-navy-900 uppercase tracking-widest leading-none italic">Portfolio Empty</p>
                <p className="text-[10px] text-slate-500 mt-1">Add your end users, contractors, and dealers to start managing accounts.</p>
             </div>
          </div>
        )}
      </AnimatedList>

      {/* Add Company Modal */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-navy-900">Add New Account</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  placeholder="e.g. SM Prime Holdings"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Account Type</label>
                <div className="flex gap-2">
                  {(['End User', 'Contractor', 'Dealer'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setNewCompany({...newCompany, type: t})}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border',
                        newCompany.type === t 
                          ? 'bg-brand-blue text-white border-brand-blue' 
                          : 'bg-white text-slate-500 border-surface-border hover:border-brand-blue/30'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Industry</label>
                  <select 
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  >
                    <option value="">Select...</option>
                    {AA2000_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Website</label>
                  <input 
                    type="text" 
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Estimated Value (PHP)</label>
                <input 
                  type="number" 
                  value={newCompany.value}
                  onChange={(e) => setNewCompany({...newCompany, value: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
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
                onClick={handleAddCompany}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Edit Company Modal */}
      {isEditModalOpen && editingCompany && createPortal(
        <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-navy-900">Edit Account</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Account Type</label>
                <div className="flex gap-2">
                  {(['End User', 'Contractor', 'Dealer'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setEditingCompany({...editingCompany, type: t})}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border',
                        editingCompany.type === t 
                          ? 'bg-brand-blue text-white border-brand-blue' 
                          : 'bg-white text-slate-500 border-surface-border hover:border-brand-blue/30'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Industry</label>
                  <select 
                    value={editingCompany.industry}
                    onChange={(e) => setEditingCompany({...editingCompany, industry: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  >
                    <option value="">Select...</option>
                    {AA2000_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Website</label>
                  <input 
                    type="text" 
                    value={editingCompany.website}
                    onChange={(e) => setEditingCompany({...editingCompany, website: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Estimated Value (PHP)</label>
                <input 
                  type="number" 
                  value={editingCompany.value}
                  onChange={(e) => setEditingCompany({...editingCompany, value: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
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
                onClick={handleEditCompany}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Update Account
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </AnimatedPage>
  );
};

export default CompaniesListPage;
