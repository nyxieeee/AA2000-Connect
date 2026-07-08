import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MessageSquare, ShoppingBag, Plus, Eye, Users, Send, Tag } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { useMarketplaceStore } from '../../stores/modules/marketplaceStore';

const MarketplacePage = () => {
  const { listings, inquiries, updateInquiry } = useMarketplaceStore();
  const [tab, setTab] = useState<'listings' | 'inquiries'>('listings');

  const stats = {
    published: listings.filter(l => l.status === 'published').length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.status === 'new').length,
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3"><Store className="text-brand-blue" size={28} /> FB Marketplace & Social Leads</h1>
            <p className="text-sm text-slate-400 -mt-4">Post products, track inquiries, and capture social leads</p>
          </div>
          <button className="premium-button flex items-center gap-2"><Plus size={14} /> New Listing</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Published Listings', value: stats.published, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'New (Unread)', value: stats.newInquiries, icon: Eye, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card !p-5">
              <div className={`p-2 rounded-xl ${s.bg} inline-block mb-2`}><s.icon size={16} className={s.color} /></div>
              <p className="text-xl font-bold text-navy-900">{s.value}</p>
              <p className="sub-title mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setTab('listings')} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'listings' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}><ShoppingBag size={14} /> Listings ({listings.length})</button>
          <button onClick={() => setTab('inquiries')} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'inquiries' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-500'}`}><MessageSquare size={14} /> Inquiries ({inquiries.length})</button>
        </div>

        {tab === 'listings' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card hover-lift">
                <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 flex items-center justify-center"><ShoppingBag className="text-slate-300" size={32} /></div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${l.status === 'published' ? 'bg-emerald-50 text-emerald-600' : l.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>{l.status}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">{l.platform.replace('_', ' ')}</span>
                </div>
                <h4 className="text-sm font-bold text-navy-900 mb-1">{l.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{l.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400"><Tag size={10} /> {l.category}</span>
                  <span className="text-sm font-bold text-brand-blue">₱{l.price.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq, i) => (
              <motion.div key={inq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card !p-5 hover-lift ${inq.status === 'new' ? 'border-l-4 border-l-rose-400' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-navy-900">{inq.contactName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${inq.status === 'new' ? 'bg-rose-50 text-rose-600' : inq.status === 'contacted' ? 'bg-blue-50 text-blue-600' : inq.status === 'qualified' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>{inq.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{inq.contactEmail} {inq.contactPhone && `• ${inq.contactPhone}`} • via {inq.source.replace('_', ' ')}</p>
                  </div>
                  {inq.assignedTo && <span className="flex items-center gap-1 text-[10px] text-slate-400"><Users size={10} /> {inq.assignedTo}</span>}
                </div>

                {/* Conversation log */}
                <div className="space-y-2 mb-3">
                  {inq.conversationLog.slice(-3).map((msg, mi) => (
                    <div key={mi} className={`p-3 rounded-xl text-xs ${msg.sender === 'client' ? 'bg-slate-50 text-slate-600' : 'bg-brand-blue/5 text-brand-blue'}`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{msg.sender}</span>
                      <p className="mt-0.5">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {inq.status === 'new' && (
                  <div className="flex justify-end">
                    <button onClick={() => updateInquiry(inq.id, { status: 'contacted' })} className="premium-button !text-[9px] !px-3 !py-1.5 flex items-center gap-1.5"><Send size={12} /> Mark Contacted</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default MarketplacePage;
