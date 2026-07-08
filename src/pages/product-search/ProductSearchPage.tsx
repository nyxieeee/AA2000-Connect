import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, Grid3X3, List, Tag, Link2, X, ChevronRight, Globe, ExternalLink, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useProductCatalogStore, type Product } from '../../stores/modules/productCatalogStore';

const SUBCATEGORIES = ['All', 'CCTV', 'Access Control', 'Networking', 'Fire & Alarm', 'Structured Cabling', 'Power'];
const BRANDS = ['All', 'Hikvision', 'Dahua', 'Edwards', 'Ajax', 'Ruijie', 'APC', 'Bosch', 'Honeywell', 'Generic'];

const fmt = (n: number) => '₱' + n.toLocaleString('en-PH');

interface GroundedProductResult {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  category: string;
  is_trusted: boolean;
}
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const renderCleanSpecs = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={idx} className="h-2" />;

        // Headers
        if (cleanLine.startsWith('#')) {
          const headingText = cleanLine.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="text-[11px] font-black text-navy-900 uppercase tracking-wider mt-4 first:mt-0 border-b border-slate-100 pb-1">
              {headingText}
            </h4>
          );
        }

        // Bullet points
        const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.startsWith('• ');
        if (isBullet) {
          cleanLine = cleanLine.replace(/^[*\-•]\s*/, '');
        }

        // Parse bold syntax **text**
        const parts = cleanLine.split('**');
        const content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-bold text-navy-900">{part}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-600 pl-2">
              <span className="text-brand-blue shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{content}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[10px] text-slate-600 leading-relaxed">
            {content}
          </p>
        );
      })}
    </div>
  );
};

const ProductSearchPage = () => {
  const { products } = useProductCatalogStore();
  const [tab, setTab] = useState<'catalog' | 'web'>('catalog');
  
  // Catalog search state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'product' | 'consumable'>('all');
  const [subcategory, setSubcategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Web spec search state
  const [webQuery, setWebQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [webResults, setWebResults] = useState<GroundedProductResult[]>([]);
  const [aiResponseText, setAiResponseText] = useState('');

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (subcategory !== 'All' && p.subcategory !== subcategory) return false;
      if (brand !== 'All' && p.brand !== brand) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          Object.values(p.specifications).some(v => v.toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, search, category, subcategory, brand]);

  const compareProducts = products.filter(p => compareIds.includes(p.id));
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    compareProducts.forEach(p => Object.keys(p.specifications).forEach(k => keys.add(k)));
    return [...keys];
  }, [compareProducts]);

  const handleWebSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!webQuery.trim()) return;

    setIsSearching(true);
    setAiResponseText('');
    const systemPrompt = `
      You are an expert product specialist for AA2000 fire protection, CCTV, network engineering, and alarm devices.
      Provide precise technical specifications, compatibility notes, and datasheet details for security cameras, alarm systems, networking hardware, fire alarm systems, and components.
      Always retrieve and cite evidence-based, trusted vendor sources (e.g., Hikvision, Dahua, Ajax, Edwards, Bosch, Honeywell, Ruijie).
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: webQuery }],
          }],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          tools: [{
            googleSearch: {},
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 3000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini search request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const groundingChunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingSupports = data.candidates?.[0]?.groundingMetadata?.groundingSupports || [];
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (aiText) {
        setAiResponseText(aiText);
      }

      if (groundingChunks.length > 0) {
        const results: GroundedProductResult[] = groundingChunks
          .map((chunk: any, index: number) => {
            const web = chunk.web || {};
            let uri = web.uri || '';
            const title = web.title || `Source ${index + 1}`;

            if (uri.includes('google.com') || uri.includes('vertexaisearch.cloud.google.com')) {
              try {
                const urlParams = new URLSearchParams(uri.split('?')[1]);
                for (const [key, value] of urlParams.entries()) {
                  if (value.startsWith('http://') || value.startsWith('https://')) {
                    uri = value;
                    break;
                  }
                }
              } catch (e) {
                const match = uri.match(/[?&](?:q|click_url|url)=([^&]+)/);
                if (match) uri = decodeURIComponent(match[1]);
              }
            }

            const urlObj = (() => { try { return new URL(uri); } catch { return null; } })();
            const hostname = urlObj?.hostname?.replace('www.', '') || 'External Source';

            const lowerUrl = uri.toLowerCase();
            let cat = 'Product Specification';
            if (lowerUrl.includes('.pdf') || lowerUrl.includes('datasheet') || lowerUrl.includes('manual')) {
              cat = 'Datasheet / Manual';
            } else if (lowerUrl.includes('hikvision') || lowerUrl.includes('dahua') || lowerUrl.includes('ruijie')) {
              cat = 'OEM / Vendor Site';
            }

            const support = groundingSupports.find((s: any) =>
              s.groundingChunkIndices?.includes(index)
            );
            const description = support
              ? aiText.substring(support.segment?.startIndex || 0, support.segment?.endIndex || 220).trim()
              : `Technical datasheet resource detailing equipment features and operational thresholds.`;

            const is_trusted = lowerUrl.includes('.gov') || lowerUrl.includes('.org') || lowerUrl.includes('hikvision') || lowerUrl.includes('dahua') || lowerUrl.includes('ruijie.com') || lowerUrl.includes('honeywell.com');

            return {
              id: `web-${index}-${Date.now()}`,
              title,
              description: description.length > 300 ? description.substring(0, 297) + '...' : description,
              source: hostname,
              url: uri,
              category: cat,
              is_trusted,
            };
          })
          .filter((r: GroundedProductResult) => r.url);

        setWebResults(results);
      } else {
        setWebResults([]);
      }
    } catch (error) {
      console.error('Google Spec Grounding Search Error:', error);
      setWebResults([]);
      setAiResponseText('Error: Failed to fetch specifications from Gemini.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const getCompatible = (p: Product) => products.filter(cp => p.compatibleWith.includes(cp.id));

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="section-title flex items-center gap-3"><Package className="text-brand-blue" size={28} /> Product & Consumables Catalog</h1>
            <p className="text-sm text-slate-400 -mt-4">Search internal records or Google verified spec sheets</p>
          </div>
          {tab === 'catalog' && (
            <div className="flex items-center gap-2 self-end">
              {compareIds.length > 1 && (
                <button onClick={() => setShowCompare(true)} className="premium-button flex items-center gap-2"><Grid3X3 size={14} /> Compare ({compareIds.length})</button>
              )}
              <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
                {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
              </button>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-px">
          <button
            onClick={() => setTab('catalog')}
            className={cn(
              "pb-3 text-xs font-bold uppercase tracking-widest border-b-2 px-1 transition-all",
              tab === 'catalog'
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Catalog Search
          </button>
          <button
            onClick={() => setTab('web')}
            className={cn(
              "pb-3 text-xs font-bold uppercase tracking-widest border-b-2 px-1 transition-all flex items-center gap-1.5",
              tab === 'web'
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Globe size={12} /> Google Spec Search
          </button>
        </div>

        {tab === 'catalog' ? (
          <>
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input className="input-field !pl-11 !text-sm" placeholder="Search by name, SKU, spec values, or tags..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter size={12} className="text-slate-400" />
                  {(['all', 'product', 'consumable'] as const).map(c => (
                    <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${category === c ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{c === 'all' ? 'All' : c + 's'}</button>
                  ))}
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1 flex-wrap">
                  {SUBCATEGORIES.map(s => (
                    <button key={s} onClick={() => setSubcategory(s)} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${subcategory === s ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{s}</button>
                  ))}
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field !w-auto !py-1.5 !text-[10px]">
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{filtered.length} products found</p>

            {/* Product Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`glass-card hover-lift ${compareIds.includes(p.id) ? 'ring-2 ring-brand-blue/30' : ''}`}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="w-full h-28 bg-slate-50 rounded-xl mb-3 flex items-center justify-center"><Package className="text-slate-200" size={28} /></div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${p.category === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{p.category}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-bold uppercase tracking-wider text-slate-500">{p.brand}</span>
                      </div>
                      <h4 className="text-xs font-bold text-navy-900 mb-0.5 line-clamp-2">{p.name}</h4>
                      <p className="text-[9px] text-slate-400 mb-2">SKU: {p.sku}</p>
                      <div className="flex flex-wrap gap-1 mb-3">{p.tags.slice(0, 3).map(t => <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[7px] font-medium">{t}</span>)}</div>
                      <div className="space-y-1 mb-3">
                        {Object.entries(p.specifications).slice(0, 3).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[10px]"><span className="text-slate-400 capitalize">{k.replace('_', ' ')}</span><span className="font-medium text-navy-900">{v}</span></div>
                        ))}
                      </div>
                      {/* Compatible */}
                      {p.compatibleWith.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Link2 size={8} /> Often paired with</span>
                          <div className="flex flex-wrap gap-1 mt-1">{getCompatible(p).map(cp => <span key={cp.id} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[7px] font-medium truncate max-w-[120px]">{cp.name.split(' ').slice(0, 3).join(' ')}</span>)}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        {p.price ? <span className="text-lg font-bold text-brand-blue">{fmt(p.price)}</span> : <span className="text-xs text-slate-400">Price on request</span>}
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={compareIds.includes(p.id)} onChange={() => toggleCompare(p.id)} className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Compare</span>
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-4 !p-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0"><Package className="text-slate-200" size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase ${p.category === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{p.category}</span>
                          <span className="text-[9px] text-slate-400">{p.brand} • {p.sku}</span>
                        </div>
                        <h4 className="text-xs font-bold text-navy-900 truncate">{p.name}</h4>
                        <p className="text-[9px] text-slate-400 truncate">{p.subcategory} • {Object.entries(p.specifications).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {p.price && <p className="text-sm font-bold text-brand-blue">{fmt(p.price)}</p>}
                        <label className="flex items-center gap-1.5 cursor-pointer mt-1">
                          <input type="checkbox" checked={compareIds.includes(p.id)} onChange={() => toggleCompare(p.id)} className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20" />
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Compare</span>
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleWebSearch} className="relative">
              <input
                className="input-field !py-3.5 !pl-5 !pr-32 !text-sm shadow-xl"
                placeholder="Search specs (e.g. 'Hikvision DS-2CD2087G2-L specs datasheet' or 'Edwards EST3 fire system specs')..."
                value={webQuery}
                onChange={e => setWebQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2.5 top-2.5 bottom-2.5 px-5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-light transition-all flex items-center gap-2 disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {isSearching ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>Search <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-brand-blue/5 rounded-full animate-ping opacity-25"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-brand-blue">
                      <Sparkles size={28} className="animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 mb-1">Searching Google Specs Grounding...</h3>
                  <p className="text-xs text-slate-400">Querying live data sheets, technical parameters, and OEM site specs.</p>
                </motion.div>
              ) : webResults.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={aiResponseText ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "space-y-4"}
                >
                  {/* Search Results Column */}
                  <div className={aiResponseText ? "lg:col-span-7 space-y-4" : "space-y-4"}>
                    {webResults.map((result, i) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card hover-lift !p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-blue/5 text-brand-blue rounded-lg">
                                {result.category}
                              </span>
                              {result.is_trusted && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                                  <ShieldCheck size={12} /> Trusted Vendor
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-navy-900 mb-1 leading-snug">
                              {result.title}
                            </h3>
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-blue hover:underline truncate max-w-lg block mb-3 font-semibold"
                            >
                              Read on {result.source} ↗
                            </a>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                              {result.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-brand-blue text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-brand-light transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <ExternalLink size={12} />
                                <span>View Datasheet</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI Pinned Spec Summary Sidebar */}
                  {aiResponseText && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="lg:col-span-5 glass-card !p-6 space-y-4 sticky top-6 max-h-[calc(100vh-80px)] overflow-y-auto"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-[10px] font-black text-navy-900 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={14} className="text-brand-blue animate-pulse" />
                          AI Technical Spec Sheet
                        </h3>
                        <button onClick={() => setAiResponseText('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                      </div>
                      <div className="pr-2">
                        {renderCleanSpecs(aiResponseText)}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : webQuery && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center text-slate-400"
                >
                  <Search size={32} className="text-slate-300 mb-4" />
                  <p className="text-sm font-semibold">No spec search results found.</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try searching with specific SKU names or brand references.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Comparison Modal */}
        <AnimatePresence>
          {showCompare && compareProducts.length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8" onClick={() => setShowCompare(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-navy-900 uppercase tracking-wide">Spec Comparison</h3>
                  <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="sub-title pb-3 pr-4 w-32">Spec</th>
                      {compareProducts.map(p => <th key={p.id} className="sub-title pb-3 pr-4">{p.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-50">
                      <td className="py-2.5 pr-4 text-[10px] font-bold text-slate-400 uppercase">Price</td>
                      {compareProducts.map(p => <td key={p.id} className="py-2.5 pr-4 text-sm font-bold text-brand-blue">{p.price ? fmt(p.price) : '—'}</td>)}
                    </tr>
                    <tr className="border-b border-slate-50">
                      <td className="py-2.5 pr-4 text-[10px] font-bold text-slate-400 uppercase">Brand</td>
                      {compareProducts.map(p => <td key={p.id} className="py-2.5 pr-4 text-xs font-medium">{p.brand}</td>)}
                    </tr>
                    {allSpecKeys.map(key => (
                      <tr key={key} className="border-b border-slate-50">
                        <td className="py-2.5 pr-4 text-[10px] font-bold text-slate-400 uppercase">{key.replace(/_/g, ' ')}</td>
                        {compareProducts.map(p => <td key={p.id} className="py-2.5 pr-4 text-xs font-medium text-navy-900">{p.specifications[key] || '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
};

export default ProductSearchPage;
