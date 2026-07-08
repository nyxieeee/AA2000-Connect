import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Tag, Calendar, FileText } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { usePolicyCenterStore } from '../../stores/modules/policyCenterStore';

const CATEGORY_LABELS: Record<string, string> = {
  sales_manual: 'Sales Manual', pricing: 'Pricing & Discount', discount: 'Discount Policy',
  incentive: 'Incentive Policy', quotation_guide: 'Quotation Guide', sop: 'SOP', iso: 'ISO Procedures',
};

const PolicyCenterPage = () => {
  const { policies } = usePolicyCenterStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const categories = [...new Set(policies.map(p => p.category))];
  const filtered = policies.filter(p =>
    (category === 'all' || p.category === category) &&
    (search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedPolicy = policies.find(p => p.id === selected);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><BookOpen className="text-brand-blue" size={28} /> Policy Center</h1>
          <p className="text-sm text-slate-400 -mt-4">Source of truth for sales procedures, pricing, and compliance</p>
        </div>

        {/* Search and filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input className="input-field !pl-11" placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setCategory('all')} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${category === 'all' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${category === cat ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{CATEGORY_LABELS[cat] || cat}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy list */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelected(p.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected === p.id ? 'bg-brand-blue/5 border-brand-blue/20 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0"><FileText size={14} className="text-brand-blue" /></div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-navy-900 truncate">{p.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase tracking-wider">{CATEGORY_LABELS[p.category]}</span>
                      <span className="text-[9px] text-slate-400">v{p.version}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Policy viewer */}
          <div className="lg:col-span-2">
            {selectedPolicy ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-navy-900">{selectedPolicy.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium"><Tag size={10} /> {CATEGORY_LABELS[selectedPolicy.category]}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium"><Calendar size={10} /> Effective: {selectedPolicy.effectiveDate}</span>
                      <span className="text-[10px] text-slate-400 font-medium">v{selectedPolicy.version}</span>
                    </div>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                  {selectedPolicy.content.split('. ').map((sentence, i) => (
                    <p key={i} className="text-sm mb-2">{sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'}</p>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center py-16">
                <BookOpen className="text-slate-200 mb-4" size={48} />
                <p className="text-sm text-slate-400 font-medium">Select a policy to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default PolicyCenterPage;
