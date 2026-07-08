import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, FileText, Star, MessageSquare, Eye, Plus, Calendar } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useWebsiteIntegrationStore } from '../../stores/modules/websiteIntegrationStore';

const TYPE_STYLES: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  blog_post: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  case_study: { icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
  review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  page: { icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
};

const WebsiteIntegrationPage = () => {
  const { content, inquiries } = useWebsiteIntegrationStore();
  const [tab, setTab] = useState<'content' | 'inquiries'>('content');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredContent = typeFilter === 'all' ? content : content.filter(c => c.type === typeFilter);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3"><Globe className="text-brand-blue" size={28} /> Website Integration</h1>
            <p className="text-sm text-slate-400 -mt-4">Blog posts, case studies, reviews, and inquiry capture</p>
          </div>
          <button className="premium-button flex items-center gap-2"><Plus size={14} /> New Content</button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setTab('content')} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'content' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}><FileText size={14} /> Content ({content.length})</button>
          <button onClick={() => setTab('inquiries')} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'inquiries' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}><MessageSquare size={14} /> Inquiries ({inquiries.length})</button>
        </div>

        {tab === 'content' ? (
          <>
            <div className="flex items-center gap-2">
              {['all', 'blog_post', 'case_study', 'review', 'page'].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${typeFilter === t ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500'}`}>{t === 'all' ? 'All' : t.replace('_', ' ')}</button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredContent.map((c, i) => {
                const style = TYPE_STYLES[c.type] || TYPE_STYLES.page;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5 hover-lift">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${style.bg} shrink-0`}><style.icon size={18} className={style.color} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${style.bg} ${style.color}`}>{c.type.replace('_', ' ')}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${c.status === 'published' ? 'bg-emerald-50 text-emerald-600' : c.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>{c.status}</span>
                        </div>
                        <h4 className="text-sm font-bold text-navy-900 mb-1">{c.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{c.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[9px] text-slate-400">{c.author}</span>
                          {c.publishedAt && <span className="text-[9px] text-slate-400 flex items-center gap-1"><Calendar size={9} /> {new Date(c.publishedAt).toLocaleDateString()}</span>}
                          <span className="text-[9px] text-brand-blue font-medium">/{c.slug}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq, i) => (
              <motion.div key={inq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card !p-5 hover-lift ${inq.status === 'new' ? 'border-l-4 border-l-rose-400' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{inq.name}</h4>
                    <p className="text-[10px] text-slate-400">{inq.email} {inq.phone && `• ${inq.phone}`}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${inq.status === 'new' ? 'bg-rose-50 text-rose-600' : inq.status === 'responded' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{inq.status}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{inq.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">{inq.source} • {new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default WebsiteIntegrationPage;
