import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, TrendingUp, Minus, Eye, Bot, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useSEOGEOStore } from '../../stores/modules/seoGeoStore';

const BRANDS = ['All', 'AA2000', 'Hikvision', 'Ajax', 'Edwards', 'Ruijie', 'Dahua', 'Bosch', 'Honeywell'];

const SEOGEOPage = () => {
  const { keywords, prompts } = useSEOGEOStore();
  const [tab, setTab] = useState<'seo' | 'geo'>('seo');
  const [brand, setBrand] = useState('All');

  const filteredKW = brand === 'All' ? keywords : keywords.filter(k => k.brand === brand);
  const avgRank = filteredKW.length > 0 ? (filteredKW.reduce((a, k) => a + k.currentRank, 0) / filteredKW.length).toFixed(1) : '—';
  const improved = filteredKW.filter(k => k.currentRank < k.previousRank).length;
  const geoVisibility = prompts.filter(p => p.aa2000Mentioned).length;

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><Globe className="text-brand-blue" size={28} /> SEO/GEO Command Center</h1>
          <p className="text-sm text-slate-400 -mt-4">Monitor Google rankings and AI-recommendation visibility</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg. Google Rank', value: `#${avgRank}`, icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Rankings Improved', value: improved, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Keywords Tracked', value: keywords.length, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'AI Visibility', value: `${geoVisibility}/${prompts.length}`, icon: Bot, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5">
              <div className={`p-2 rounded-xl ${s.bg} inline-block mb-2`}><s.icon size={16} className={s.color} /></div>
              <p className="text-xl font-bold text-navy-900">{s.value}</p>
              <p className="sub-title mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('seo')} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'seo' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}><Search size={14} /> SEO Rankings</button>
          <button onClick={() => setTab('geo')} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'geo' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}><Bot size={14} /> GEO / AI Visibility</button>
        </div>

        {tab === 'seo' ? (
          <>
            {/* Brand filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {BRANDS.map(b => (
                <button key={b} onClick={() => setBrand(b)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${brand === b ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{b}</button>
              ))}
            </div>

            {/* Keyword table */}
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Keyword', 'Brand', 'Rank', 'Change', 'Volume', 'Difficulty', 'URL'].map(h => (
                      <th key={h} className="sub-title pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredKW.map(kw => {
                    const diff = kw.previousRank - kw.currentRank;
                    return (
                      <tr key={kw.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 pr-4 text-xs font-bold text-navy-900">{kw.keyword}</td>
                        <td className="py-3 pr-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 uppercase">{kw.brand}</span></td>
                        <td className="py-3 pr-4 text-sm font-bold text-navy-900">#{kw.currentRank}</td>
                        <td className="py-3 pr-4">
                          <span className={`flex items-center gap-1 text-xs font-bold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {diff > 0 ? <ArrowUp size={12} /> : diff < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
                            {Math.abs(diff)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-500">{kw.searchVolume.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${kw.difficulty > 50 ? 'bg-rose-400' : kw.difficulty > 30 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${kw.difficulty}%` }} /></div>
                            <span className="text-[10px] text-slate-400">{kw.difficulty}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-[10px] text-brand-blue font-medium">{kw.url}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* GEO prompts */
          <div className="space-y-3">
            {prompts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5 hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${p.aa2000Mentioned ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      <Eye size={14} className={p.aa2000Mentioned ? 'text-emerald-600' : 'text-rose-500'} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-900">"{p.prompt}"</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{p.aiEngine} • Checked {new Date(p.checkedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.aa2000Mentioned ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                    {p.aa2000Mentioned ? `Position #${p.position}` : 'Not Mentioned'}
                  </span>
                </div>
                {p.competitors.length > 0 && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><Eye size={10} /> Competitors mentioned: {p.competitors.join(', ')}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default SEOGEOPage;
