import { useState } from 'react';
import { Search, Building2, Globe, FileText, Lightbulb, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCompanyResearchStore } from '../../stores/modules/companyResearchStore';
import { useCRMStore } from '../../stores/modules/crmStore';

export default function CompanyResearchPage() {
  const { companies } = useCRMStore();
  const { upsertResearch, getResearchByCompany } = useCompanyResearchStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ industry: '', size: '', website: '', existingSystems: '', complianceGaps: '', salesAngle: '', keyContacts: '', notes: '' });

  const filteredCompanies = companies.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const existingResearch = selectedCompanyId ? getResearchByCompany(selectedCompanyId) : null;

  const handleSelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const r = getResearchByCompany(companyId);
    setForm(r ? {
      industry: r.industry || '', size: r.size || '', website: r.website || '',
      existingSystems: r.existingSystems || '', complianceGaps: r.complianceGaps || '',
      salesAngle: r.salesAngle || '', keyContacts: r.keyContacts || '', notes: r.notes || '',
    } : { industry: '', size: '', website: '', existingSystems: '', complianceGaps: '', salesAngle: '', keyContacts: '', notes: '' });
  };

  const handleSave = () => {
    if (!selectedCompanyId || !selectedCompany) return;
    upsertResearch({
      companyId: selectedCompanyId,
      companyName: selectedCompany.name,
      ...form,
    });
    alert('Research saved!');
  };

  const handleAIResearch = () => {
    if (!selectedCompany) return;
    setForm({
      industry: 'Security Systems / Fire Protection',
      size: '50-200 employees',
      website: selectedCompany.website || 'https://',
      existingSystems: 'Likely using legacy CCTV/DVR systems, possible older fire alarm panels',
      complianceGaps: 'May need BFP compliance update, RA 9514 fire safety audit may be due',
      salesAngle: 'Approach with latest fire alarm panel upgrade — stress compliance, reliability, and reduced false alarms',
      keyContacts: 'Facility Manager, Safety Officer, Procurement',
      notes: 'Research auto-generated. Verify before first call.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">AI Company Research</h1>
        <p className="text-xs text-slate-500 mt-0.5">Research prospects before the first call — industry, systems, compliance gaps, and sales angle</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Company List */}
        <div className="col-span-1">
          <div className="glass-card p-4 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredCompanies.map(c => (
                <button key={c.id} onClick={() => handleSelect(c.id)}
                  className={cn('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all', selectedCompanyId === c.id ? 'bg-brand-blue/5 text-brand-blue font-semibold' : 'text-slate-600 hover:bg-slate-50')}>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>
                </button>
              ))}
              {filteredCompanies.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No companies found</p>}
            </div>
          </div>
        </div>

        {/* Research Form */}
        <div className="col-span-2">
          {selectedCompany ? (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={24} className="text-brand-blue" />
                  <h2 className="text-lg font-bold text-navy-900">{selectedCompany.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAIResearch} className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-all flex items-center gap-1.5">
                    <RefreshCw size={14} /> AI Research
                  </button>
                  <button onClick={handleSave} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Save Research</button>
                </div>
              </div>

              {existingResearch && (
                <div className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                  Last researched: {new Date(existingResearch.researchedAt).toLocaleString()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Globe size={12} /> Industry</label>
                  <input value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Building2 size={12} /> Company Size</label>
                  <input value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Globe size={12} /> Website</label>
                  <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FileText size={12} /> Existing Systems</label>
                  <input value={form.existingSystems} onChange={e => setForm(p => ({ ...p, existingSystems: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={12} /> Compliance Gaps</label>
                  <input value={form.complianceGaps} onChange={e => setForm(p => ({ ...p, complianceGaps: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Lightbulb size={12} /> Sales Angle</label>
                  <input value={form.salesAngle} onChange={e => setForm(p => ({ ...p, salesAngle: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Contacts / Org Structure</label>
                <textarea value={form.keyContacts} onChange={e => setForm(p => ({ ...p, keyContacts: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400">
              <Building2 size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Select a Company</p>
              <p className="text-xs mt-2">Choose a company from the list to research</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
