import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, Search, Tag, BookOpen, FileText, Plus,
  Globe, ExternalLink, ShieldCheck, Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useKnowledgeBaseStore } from '../../stores/modules/knowledgeBaseStore';

const CAT_LABELS: Record<string, string> = {
  technical_manual: 'Technical Manual',
  installation_standard: 'Installation Standard',
  fire_code: 'Fire Code',
  product_docs: 'Product Docs',
  sop: 'SOP',
  training: 'Training',
  bidding_guide: 'Bidding Guide',
  philgeps: 'PhilGEPS',
  marketplace_guide: 'Marketplace',
};

interface GroundedSearchResult {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  search_url: string;
  category: string;
  is_trusted: boolean;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'REDACTED_KEY';

const KnowledgeBasePage = () => {
  const { articles } = useKnowledgeBaseStore();
  const [tab, setTab] = useState<'internal' | 'web'>('internal');
  
  // Internal KB state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);

  // Web Search state
  const [webQuery, setWebQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [webResults, setWebResults] = useState<GroundedSearchResult[]>([]);

  const cats = [...new Set(articles.map(a => a.category))];
  const filtered = articles.filter(a =>
    (category === 'all' || a.category === category) &&
    (search === '' || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) || a.content.toLowerCase().includes(search.toLowerCase()))
  );
  const selectedArticle = articles.find(a => a.id === selected);

  const handleWebSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!webQuery.trim()) return;

    setIsSearching(true);
    const systemPrompt = `
      You are an expert technical advisor for AA2000 fire protection, CCTV, and alarm systems.
      Provide detailed answers about fire safety codes (e.g. BFP, RA 9514), technical specifications, and security standards in the Philippines.
      Always retrieve and cite evidence-based, trusted documentation, standards, and vendor manuals.
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

      if (groundingChunks.length > 0) {
        const results: GroundedSearchResult[] = groundingChunks
          .map((chunk: any, index: number) => {
            const web = chunk.web || {};
            let uri = web.uri || '';
            const title = web.title || `Source ${index + 1}`;

            // Clean Google / Vertex redirect links
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

            // Category classification
            const lowerUrl = uri.toLowerCase();
            let cat = 'Reference';
            if (lowerUrl.includes('.gov.ph') || lowerUrl.includes('bfp')) {
              cat = 'PH Gov / Code';
            } else if (lowerUrl.includes('hikvision') || lowerUrl.includes('dahua') || lowerUrl.includes('ruijie')) {
              cat = 'Manufacturer Guide';
            } else if (lowerUrl.includes('nfpa') || lowerUrl.includes('standard')) {
              cat = 'Global Standard';
            }

            const support = groundingSupports.find((s: any) =>
              s.groundingChunkIndices?.includes(index)
            );
            const description = support
              ? aiText.substring(support.segment?.startIndex || 0, support.segment?.endIndex || 220).trim()
              : `Technical resource on fire codes and safety devices.`;

            // Simple trusted logic
            const is_trusted = lowerUrl.includes('.gov') || lowerUrl.includes('.org') || lowerUrl.includes('hikvision') || lowerUrl.includes('dahua') || lowerUrl.includes('nfpa.org');

            return {
              id: `web-${index}-${Date.now()}`,
              title,
              description: description.length > 300 ? description.substring(0, 297) + '...' : description,
              source: hostname,
              url: uri,
              search_url: `https://www.google.com/search?q=${encodeURIComponent(webQuery)}`,
              category: cat,
              is_trusted,
            };
          })
          .filter((r: GroundedSearchResult) => r.url);

        setWebResults(results);
      } else {
        setWebResults([]);
      }
    } catch (error) {
      console.error('Google Grounding Search Error:', error);
      setWebResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3"><Library className="text-brand-blue" size={28} /> Knowledge Base</h1>
            <p className="text-sm text-slate-400 -mt-4">Technical manuals, standards, fire protection codes, and guides</p>
          </div>
          {tab === 'internal' && (
            <button className="premium-button flex items-center gap-2"><Plus size={14} /> New Article</button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button onClick={() => setTab('internal')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${tab === 'internal' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Internal SOPs & Manuals</button>
          <button onClick={() => setTab('web')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${tab === 'web' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'} flex items-center gap-1.5`}><Globe size={13} /> Live Google Search</button>
        </div>

        {tab === 'internal' ? (
          <>
            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input className="input-field !pl-11" placeholder="Search articles, tags..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setCategory('all')} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${category === 'all' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}>All</button>
                {cats.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${category === c ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500'}`}>{CAT_LABELS[c] || c}</button>
                ))}
              </div>
            </div>

            {/* Split layout for Internal KB */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {filtered.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelected(a.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected === a.id ? 'bg-brand-blue/5 border-brand-blue/20 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <h4 className="text-xs font-bold text-navy-900 mb-1">{a.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase tracking-wider">{CAT_LABELS[a.category] || a.category}</span>
                      <span className="text-[9px] text-slate-400">{a.author}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">{a.tags.slice(0, 3).map(t => <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[8px] font-medium">{t}</span>)}</div>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedArticle ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
                    <h3 className="text-lg font-bold text-navy-900 mb-2">{selectedArticle.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium"><Tag size={10} /> {CAT_LABELS[selectedArticle.category]}</span>
                      <span className="text-[10px] text-slate-400 font-medium">By {selectedArticle.author}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-6">{selectedArticle.tags.map(t => <span key={t} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-wider">{t}</span>)}</div>
                    <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                      {selectedArticle.content.split('. ').map((s, i) => <p key={i} className="text-sm mb-2">{s.trim()}{s.trim().endsWith('.') ? '' : '.'}</p>)}
                    </div>
                  </motion.div>
                ) : (
                  <div className="glass-card flex flex-col items-center justify-center py-16">
                    <Library className="text-slate-200 mb-4" size={48} />
                    <p className="text-sm text-slate-400 font-medium">Select an article to view</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Live Google Grounded Search */
          <div className="space-y-6 max-w-4xl mx-auto">
            <form onSubmit={handleWebSearch} className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={webQuery}
                onChange={e => setWebQuery(e.target.value)}
                placeholder="Search PH Fire Code standards, FDAS manual, Hikvision CCTV specs..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-32 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm shadow-sm"
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
                  <h3 className="text-sm font-bold text-navy-900 mb-1">Retrieving Live Knowledge...</h3>
                  <p className="text-xs text-slate-400">Fetching verified regulations, standards, and specifications via Google grounding.</p>
                </motion.div>
              ) : webResults.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
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
                                <ShieldCheck size={12} /> Trusted Reference
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
                              <span>View Source</span>
                            </a>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(webQuery)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-100"
                            >
                              <Search size={12} />
                              <span>Search on Google</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : webQuery && (
                <div className="text-center py-16 glass-card">
                  <Library className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-sm text-slate-400 font-medium">No results found on the web for "{webQuery}"</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default KnowledgeBasePage;
