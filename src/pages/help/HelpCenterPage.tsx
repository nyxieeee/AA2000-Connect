import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, PlayCircle, BookOpen, MessageCircle, Search, ChevronRight, Megaphone, X, Lightbulb } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

const SECTIONS = [
  {
    id: 'tutorials', icon: PlayCircle, label: 'Video Tutorials', color: 'text-blue-600', bg: 'bg-blue-50',
    items: [
      { title: 'Getting Started with AA2000 Connect', duration: '5:30', desc: 'Overview of the CRM dashboard, navigation, and key features.' },
      { title: 'Creating Your First Quotation', duration: '8:15', desc: 'Step-by-step guide to creating and sending quotations.' },
      { title: 'Managing Leads & Pipeline', duration: '12:00', desc: 'Lead capture, qualification, and pipeline management workflow.' },
      { title: 'Incentive Request Submission', duration: '6:45', desc: 'How to submit and track your sales incentive requests.' },
    ]
  },
  {
    id: 'guides', icon: BookOpen, label: 'Guides & Walkthroughs', color: 'text-purple-600', bg: 'bg-purple-50',
    items: [
      { title: 'CRM Best Practices for Sales Reps', desc: 'Tips and strategies for maximizing your CRM effectiveness.' },
      { title: 'Understanding the Incentive Flow', desc: 'Complete walkthrough of the incentive request → approval → release process.' },
      { title: 'KPI Goal Setting Guide', desc: 'How to set, track, and achieve your sales KPIs.' },
      { title: 'Document Upload & Management', desc: 'How to organize and share documents within the CRM.' },
    ]
  },
  {
    id: 'faqs', icon: MessageCircle, label: 'FAQs', color: 'text-emerald-600', bg: 'bg-emerald-50',
    items: [
      { title: 'How do I reset my password?', desc: 'Contact your admin or use the Forgot Password link on the login page.' },
      { title: 'Why is my incentive request stuck in GM Review?', desc: 'The GM must complete all 7 checklist items before approving. Contact your team leader.' },
      { title: 'Can I edit a submitted quotation?', desc: 'No. You must create a revision (new version) once a quotation is submitted.' },
      { title: 'How are incentives computed?', desc: '10% of actual GP, minus 12% tax. Advance capped at 50% of estimated. See Policy Center for full rules.' },
      { title: 'What data syncs between devices?', desc: 'Currently, data is stored locally per browser. Supabase backend connection will enable cross-device sync.' },
    ]
  },
  {
    id: 'announcements', icon: Megaphone, label: 'Announcements', color: 'text-amber-600', bg: 'bg-amber-50',
    items: [
      { title: 'New Modules Released — July 2026', desc: 'Incentive System, KPI Monitor, Bidding Management, Product Catalog, and more are now available!' },
      { title: 'Security Update: MFA Coming Soon', desc: 'Multi-factor authentication will be enabled for all users starting August 2026.' },
      { title: 'Q2 2026 Sales Conference', desc: 'Join the quarterly sales review on July 25, 2026 at the main office conference room.' },
    ]
  },
];

const HelpCenterPage = () => {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('tutorials');
  const [selectedItem, setSelectedItem] = useState<{ title: string; desc: string; duration?: string } | null>(null);

  const section = SECTIONS.find(s => s.id === activeSection)!;
  const filtered = section.items.filter(item =>
    search === '' || item.title.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><HelpCircle className="text-brand-blue" size={28} /> Help Center</h1>
          <p className="text-sm text-slate-400 -mt-4">Tutorials, guides, FAQs, and announcements</p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input className="input-field !pl-11" placeholder="Search help articles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeSection === s.id ? 'bg-navy-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <s.icon size={14} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <HelpCircle size={40} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
              <p className="text-sm text-slate-500">No matching search items</p>
            </div>
          ) : filtered.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} 
              onClick={() => setSelectedItem(item)}
              className="glass-card !p-5 hover-lift cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${section.bg}`}>
                    <section.icon size={16} className={section.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900 group-hover:text-brand-blue transition-colors">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    {'duration' in item && <span className="text-[9px] text-brand-blue font-bold uppercase tracking-wider mt-1 inline-block">⏱ {(item as { duration: string }).duration}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-[480px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-blue" /> Help Documentation
                </h3>
                <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-navy-900">{selectedItem.title}</h4>
                  {selectedItem.duration && (
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider mt-2">
                      Duration: {selectedItem.duration} mins
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-sm text-slate-600 leading-relaxed font-sans">
                  <p className="mb-3">{selectedItem.desc}</p>
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                    <Lightbulb size={14} className="text-amber-500 inline-block mr-1 align-text-bottom" /> <strong>Pro Tip:</strong> For further training, contact the CRM Administrator or check the Policy Center files to review full operational standards for AA2000 Connect.
                  </p>
                </div>

                <button onClick={() => setSelectedItem(null)} className="w-full mt-2 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-all">
                  Close Help Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default HelpCenterPage;
