import { useState } from 'react';
import { 
  Plus, 
  Mail, 
  Send, 
  Eye, 
  Layout, 
  MousePointer2, 
  MoreVertical,
  BarChart3
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { storage } from '../../services/storage';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'Welcome' | 'Promotion' | 'Follow-up' | 'Safety';
  stats: {
    sent: number;
    openRate: string;
    clickRate: string;
  };
}

const EmailCampaignsPage = () => {
  const [activeView, setActiveView] = useState<'Templates' | 'Campaigns' | 'Analytics'>('Templates');
  const [templates] = useState<EmailTemplate[]>(() => storage.get('mktg_email_templates') || [
    { 
      id: '1', 
      name: 'Residential Solar Welcome', 
      subject: 'Welcome to AA2000: Your Solar Journey Starts Here!', 
      category: 'Welcome',
      stats: { sent: 1240, openRate: '68%', clickRate: '12.5%' }
    },
    { 
      id: '2', 
      name: 'Fire Safety Awareness Month', 
      subject: 'Is your home protected? Critical fire safety tips inside.', 
      category: 'Safety',
      stats: { sent: 5600, openRate: '42%', clickRate: '8.2%' }
    },
    { 
      id: '3', 
      name: 'Summer Promo 2026', 
      subject: 'Get 20% OFF on all Smart Alarm Systems!', 
      category: 'Promotion',
      stats: { sent: 8900, openRate: '35%', clickRate: '15.1%' }
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignAudience, setCampaignAudience] = useState('All Leads (24.8K)');

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-900 uppercase tracking-tighter italic">Email Campaign Hub</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Create and manage email campaigns</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-surface-border shadow-inner">
          {['Templates', 'Campaigns', 'Analytics'].map(view => (
            <button 
              key={view}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveView(view as any)}
              className={cn(
                "px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                activeView === view ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-navy-900"
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'Templates' && (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="group border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all duration-300"
              >
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                    <Plus size={32} />
                 </div>
                 <div>
                    <h3 className="text-[11px] font-black text-navy-900 uppercase tracking-widest">New Template</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Start from scratch</p>
                 </div>
              </button>

              {templates.map(template => (
                <div key={template.id} className="glass-card overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                   <div className="h-40 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Layout size={48} className="text-slate-200 group-hover:text-brand-blue/20 transition-colors" />
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <button onClick={() => alert(`Editing template: ${template.name}`)} className="flex-1 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-navy-900 shadow-sm border border-slate-100 hover:bg-slate-50">Edit</button>
                          <button className="px-3 py-2 bg-brand-blue rounded-xl text-white shadow-sm hover:bg-brand-light transition-colors">
                            <Send size={14} />
                         </button>
                      </div>
                   </div>
                   <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className={cn(
                           "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                           template.category === 'Welcome' ? 'bg-emerald-50 text-emerald-600' :
                           template.category === 'Promotion' ? 'bg-amber-50 text-amber-600' :
                           'bg-blue-50 text-blue-600'
                         )}>
                            {template.category}
                         </span>
                         <MoreVertical size={14} className="text-slate-300 hover:text-navy-900 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-navy-900 group-hover:text-brand-blue transition-colors truncate">{template.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 truncate">{template.subject}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Open Rate</p>
                            <p className="text-xs font-black text-navy-900">{template.stats.openRate}</p>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Click Rate</p>
                            <p className="text-xs font-black text-navy-900">{template.stats.clickRate}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeView === 'Campaigns' && (
        <div className="glass-card overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-border">
                    <th className="px-8 py-4">Campaign Name</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Recipients</th>
                    <th className="px-8 py-4">Engagement</th>
                    <th className="px-8 py-4">Schedule</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                 {[
                   { name: 'Welcome Series Autoresponder', status: 'Active', recipients: 4500, engagement: 68, time: 'Daily' },
                   { name: 'Easter Flash Sale 2026', status: 'Scheduled', recipients: 12000, engagement: 0, time: 'Apr 12, 10:00 AM' },
                   { name: 'Solar Maintenance Blast', status: 'Completed', recipients: 3200, engagement: 42, time: 'Completed Mar 01' },
                 ].map((campaign, i) => (
                   <tr key={i} className="hover:bg-slate-50 transition-all cursor-pointer group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white italic font-black text-[10px]">
                              {campaign.name.substring(0, 2)}
                            </div>
                            <span className="text-xs font-bold text-navy-900">{campaign.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              campaign.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
                              campaign.status === 'Scheduled' ? 'bg-amber-500' : 'bg-slate-300'
                            )}></div>
                            <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">{campaign.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-xs font-bold text-slate-600">{campaign.recipients.toLocaleString()} Leads</span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-blue" style={{ width: `${campaign.engagement}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-navy-900">{campaign.engagement}%</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         {campaign.time}
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-2 text-slate-300 hover:text-navy-900 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreVertical size={16} />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Analytics View Placeholder */}
      {activeView === 'Analytics' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Sent', val: '24.8K', icon: Mail, color: 'text-blue-500' },
                { label: 'Unique Opens', val: '12,500', icon: Eye, color: 'text-emerald-500' },
                { label: 'Click Rate', val: '4.2%', icon: MousePointer2, color: 'text-purple-500' },
                { label: 'Conversions', val: '320', icon: Target, color: 'text-brand-blue' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-6 flex items-center justify-between">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                     <h4 className="text-xl font-black text-navy-900">{stat.val}</h4>
                   </div>
                   <div className={cn("p-2.5 rounded-xl bg-slate-50", stat.color)}>
                     <stat.icon size={18} />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-4">
              <BarChart3 size={48} className="text-slate-200" />
              <div>
                <h3 className="text-sm font-black text-navy-900 uppercase tracking-widest">Detailed Engagement Tracking</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Calibrating behavioral models for AA2000 Philippines</p>
              </div>
           </div>
        </div>
      )}

      {/* Simple Create Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-10 py-6 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
                       <Mail size={20} />
                    </div>
                    <h2 className="text-base font-black text-navy-900 uppercase tracking-[0.15em]">Draft New Campaign</h2>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Subject</label>
                           <input type="text" value={campaignSubject} onChange={e => setCampaignSubject(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-navy-900 outline-none focus:border-brand-blue" placeholder="e.g. Special Offer for Solar Panels" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Audience</label>
                           <select value={campaignAudience} onChange={e => setCampaignAudience(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-navy-900 outline-none focus:border-brand-blue appearance-none">
                              <option>All Leads (24.8K)</option>
                              <option>Residential Prospects (12.4K)</option>
                              <option>Commercial Accounts (3.2K)</option>
                              <option>Past Customers (9.2K)</option>
                           </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Starting Template</label>
                       <div className="grid grid-cols-2 gap-3">
                          {['Minimalist', 'Product Focus', 'Newsletter', 'Urgency Blast'].map(t => (
                            <div key={t} className="p-4 border border-slate-100 bg-slate-50 rounded-2xl text-center cursor-pointer hover:border-brand-blue hover:bg-white transition-all">
                               <div className="h-16 flex items-center justify-center mb-2">
                                  <Layout size={24} className="text-slate-200" />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-8 border-t border-slate-100 flex gap-4">
                    <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 bg-brand-blue/10 text-brand-blue rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-blue/20 transition-all border border-brand-blue/20">Save as Draft</button>
                    <button onClick={() => { alert('Opening Content Editor...'); setIsCreateModalOpen(false); }} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-light transition-all shadow-xl shadow-brand-blue/20">Next: Content Editor</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default EmailCampaignsPage;

const Target = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const X = ({ size, className, onClick }: { size: number, className?: string, onClick?: () => void }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} onClick={onClick}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
